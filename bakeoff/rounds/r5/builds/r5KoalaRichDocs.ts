import * as THREE from "three";
import { createBuilder, frame, rng, limb, catmull, paint, svg } from "../../../../src/index";

export const meta = {
  name: "Koala on Eucalyptus Perch",
  description:
    "Pixel-art koala sitting on a eucalyptus branch stand, gripping the branch with its fingers and toes. Blocky box-section limbs, per-voxel fur paint, pixel eyes and leaf cards.",
};

// ---------- pixel helpers ----------
const CELL = 0.03;

function hash3(x: number, y: number, z: number): number {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// one random value per "voxel" of the visible face (the face's own axis is replaced by an id)
function pixel(p: THREE.Vector3, n: THREE.Vector3, cx = CELL, cy = CELL, cz = CELL): number {
  const ax =
    Math.abs(n.x) > Math.abs(n.y) && Math.abs(n.x) > Math.abs(n.z) ? 0 : Math.abs(n.y) > Math.abs(n.z) ? 1 : 2;
  const c = [Math.floor(p.x / cx), Math.floor(p.y / cy), Math.floor(p.z / cz)];
  c[ax] = 1000 + ax * 3 + (n.getComponent(ax) > 0 ? 1 : 2);
  return hash3(c[0], c[1], c[2]);
}

const FUR = ["#8c8f98", "#82858f", "#969aa3", "#6f727d"];
const CREAM = ["#dcdcd6", "#d2d2cc", "#e8e8e2", "#c4c4be"];
const LIGHT = ["#b4b6bc", "#a8abb2", "#c2c4c9", "#9ea1a8"];
const BARK = ["#b8a891", "#a89883", "#c4b69f", "#8c7c68", "#6f5f50"];
const WOOD = ["#7a5638", "#6b4a30", "#85603f", "#5f4029"];
const pick4 = (a: string[], r: number) => (r < 0.42 ? a[0] : r < 0.7 ? a[1] : r < 0.9 ? a[2] : a[3]);

const PAW = "#34343d";
const CLAW = "#ece4cf";
const NOSE = "#14141a";
const NOSE_HI = "#56566a";
const NUT = "#8a7a4a";
const EAR_IN = "#efece8";
const TUFT = "#f2f0ec";

const furPaint = paint((p, n) => pick4(FUR, pixel(p, n)));
const lightPaint = paint((p, n) => pick4(LIGHT, pixel(p, n)));
const creamPaint = paint((p, n) => pick4(CREAM, pixel(p, n)));
const torsoPaint = paint((p, n) => {
  const r = pixel(p, n);
  if (n.z > 0.4 && p.y > 0.8 && p.y < 1.03 && Math.abs(p.x) < 0.11 + (r - 0.5) * 0.09) return pick4(CREAM, r);
  return pick4(FUR, r);
});
const barkAlong = (sx: number, sy: number, sz: number) =>
  paint((p, n) => {
    const r = pixel(p, n, 0.03 * sx, 0.03 * sy, 0.03 * sz);
    return r < 0.35 ? BARK[0] : r < 0.6 ? BARK[1] : r < 0.8 ? BARK[2] : r < 0.93 ? BARK[3] : BARK[4];
  });
const branchBark = barkAlong(1, 1, 4);
const postBark = barkAlong(1, 4, 1);
const twigBark = barkAlong(1, 1, 1);
const woodPaint = paint((p, n) => {
  const r = pixel(p, n, 0.04, 0.04, 0.04);
  return r < 0.35 ? WOOD[0] : r < 0.65 ? WOOD[1] : r < 0.88 ? WOOD[2] : WOOD[3];
});

// ---------- pixel textures ----------
const rectSvg = (x: number, y: number, w: number, h: number, fill: string) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;

function eyeSvg() {
  const body =
    rectSvg(2, 0, 4, 8, "#17171c") +
    rectSvg(1, 1, 6, 6, "#17171c") +
    rectSvg(0, 2, 8, 4, "#17171c") +
    rectSvg(2, 2, 2, 2, "#f4f4ff") +
    rectSvg(5, 5, 1, 1, "#4a4a5c");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">${body}</svg>`;
}

function leafSvg(body: string, edge: string, vein: string) {
  let r = "";
  for (let y = 0; y < 16; y++) {
    const t = (y + 0.5) / 16;
    const w = Math.max(1, Math.min(3, Math.round(3.6 * Math.sin(Math.PI * Math.pow(t, 0.75)))));
    const x0 = 3 - w;
    if (w === 1 || y >= 14) {
      r += rectSvg(2, y, 2, 1, vein);
      continue;
    }
    r +=
      rectSvg(x0, y, 2 * w, 1, body) +
      rectSvg(x0, y, 1, 1, edge) +
      rectSvg(x0 + 2 * w - 1, y, 1, 1, edge) +
      rectSvg(3, y, 1, 1, vein);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 16" shape-rendering="crispEdges">${r}</svg>`;
}

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

export default function build() {
  const b = createBuilder({ name: "koala" });
  const base = b.joint("base", { at: [0, 0, 0] });

  // ---------- stand ----------
  b.part(box(0.64, 0.05, 1.1), woodPaint, { bone: base, at: [0, 0.025, 0.05] });
  b.part(box(0.52, 0.04, 0.96), woodPaint, { bone: base, at: [0, 0.07, 0.05] });
  // fallen leaves on the plinth
  const fallen: [number, number, number, number][] = [
    [0.17, 0.095, 0.36, 25],
    [-0.15, 0.095, 0.2, -50],
    [0.12, 0.095, -0.4, 80],
  ];
  for (const [x, y, z, rot] of fallen) {
    b.part(box(0.05, 0.012, 0.13), "#6f9a86", { bone: base, at: [x, y, z], rotation: [0, rot, 0] });
    b.part(box(0.012, 0.014, 0.12), "#a8c9b6", { bone: base, at: [x, y + 0.001, z], rotation: [0, rot, 0] });
  }

  // trunk, front post and the perch branch
  b.sweep(
    [
      [0, 0.09, -0.32],
      [0, 0.54, -0.32],
    ],
    [0.1, 0.075],
    { section: "box", caps: "flat", color: postBark, bone: base },
  );
  b.sweep(
    [
      [0, 0.09, 0.42],
      [0, 0.54, 0.42],
    ],
    [0.065, 0.048],
    { section: "box", caps: "flat", color: postBark, bone: base },
  );
  b.sweep(
    [
      [0, 0.54, -0.5],
      [0, 0.54, 0.56],
    ],
    0.065,
    { section: "box", caps: "flat", color: branchBark, bone: base },
  );
  // knots and a cut stub
  b.part(box(0.06, 0.1, 0.1), BARK[3], { bone: base, at: [0.07, 0.575, -0.42] });
  b.part(box(0.08, 0.06, 0.06), BARK[4], { bone: base, at: [-0.07, 0.5, 0.33] });
  b.part(box(0.1, 0.08, 0.1), BARK[3], { bone: base, at: [-0.085, 0.3, -0.32] });
  b.part(box(0.09, 0.09, 0.09), BARK[3], { bone: base, at: [0.075, 0.25, 0.42] });
  // pale cut end of the branch
  b.part(box(0.13, 0.13, 0.012), "#d9c9a8", { bone: base, at: [0, 0.54, 0.562] });
  b.part(box(0.13, 0.13, 0.012), "#d9c9a8", { bone: base, at: [0, 0.54, -0.502] });

  // ---------- koala skeleton ----------
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.74, -0.1],
      [0, 0.85, -0.08],
      [0, 0.97, -0.01],
      [0, 1.04, 0.04],
    ]),
    { parent: base, names: ["hips", "spine", "chest"], role: "spine" },
  );
  const hips = spine.joints[0];
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.0, 0.03], dir: [0, 1, 0.3], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.08, 0.05], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.05, 0.12], aim: [0, 1.05, 0.26], role: "jaw" });

  // torso
  b.sweep(
    spine,
    (t: number) => [0.17 + 0.04 * Math.sin(Math.PI * t * 0.9) - 0.03 * t * t, 0.15 + 0.025 * Math.sin(Math.PI * t) - 0.02 * t],
    { section: "box", caps: "flat", color: torsoPaint },
  );
  b.part(box(0.38, 0.15, 0.34), furPaint, { bone: hips, at: [0, 0.69, -0.1] });
  b.part(box(0.26, 0.1, 0.22), furPaint, { bone: neck, at: [0, 1.0, 0.03] });

  // ---------- head ----------
  b.part(box(0.34, 0.26, 0.27), furPaint, { bone: head, at: [0, 1.17, 0.075] });
  b.part(box(0.28, 0.04, 0.2), furPaint, { bone: head, at: [0, 1.32, 0.06] });
  b.part(box(0.17, 0.1, 0.08), lightPaint, { bone: head, at: [0, 1.09, 0.245] });
  b.part(box(0.11, 0.115, 0.07), NOSE, { bone: head, at: [0, 1.17, 0.25] });
  b.part(box(0.035, 0.022, 0.01), NOSE_HI, { bone: head, at: [0.02, 1.215, 0.2875] });
  b.part(box(0.15, 0.012, 0.02), "#2a2a31", { bone: head, at: [0, 1.04, 0.272] });

  const eyeTex = svg(eyeSvg(), { size: 8, pixelated: true });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", {
      bone: head,
      at: [s * 0.105, 1.205, 0.2125],
      dir: [0, 0, 1],
      axis: "z",
      texture: eyeTex,
    });
    // brow shadow
    b.part(box(0.085, 0.014, 0.006), "#5d6069", { bone: head, at: [s * 0.105, 1.258, 0.212] });
  }

  // cheek tufts
  const tufts: [number, number, number][] = [
    [0.18, 1.07, 0.15],
    [0.185, 1.12, 0.1],
    [0.18, 1.07, 0.05],
    [0.185, 1.13, 0.17],
    [0.17, 1.03, 0.1],
    [0.0, 1.0, 0.0],
  ];
  for (const s of [1, -1])
    for (const [x, y, z] of tufts.slice(0, 5))
      b.part(box(0.05, 0.05, 0.05), creamPaint, { bone: head, at: [s * x, y, z] });

  // lower jaw
  b.part(box(0.15, 0.045, 0.14), creamPaint, { bone: jaw, at: [0, 1.025, 0.19] });
  b.part(box(0.13, 0.01, 0.1), "#3a1c20", { bone: jaw, at: [0, 1.05, 0.18] });
  b.part(box(0.04, 0.03, 0.03), creamPaint, { bone: jaw, at: [0, 1.0, 0.255] });

  // ears
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.17, 1.28, 0.04],
      dir: [s * 0.5, 1, 0],
      role: "hinge",
    });
    b.part(box(0.15, 0.15, 0.05), furPaint, { bone: ear, at: [s * 0.19, 1.3, 0.03] });
    b.part(box(0.1, 0.1, 0.02), EAR_IN, { bone: ear, at: [s * 0.19, 1.3, 0.06] });
    const et: [number, number][] = [
      [0.078, 0.0],
      [0.078, 0.045],
      [0.07, -0.05],
      [0.03, 0.078],
      [-0.02, 0.078],
    ];
    for (const [dx, dy] of et)
      b.part(box(0.04, 0.04, 0.04), TUFT, { bone: ear, at: [s * (0.19 + dx), 1.3 + dy, 0.05] });
  }

  // ---------- arms and hands (gripping over the branch) ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.17, 0.96, 0.0], [s * 0.115, 0.575, 0.21], [0.23, 0.24], [[s, 0, -0.3]]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.065, 0.045], { section: "box", caps: "flat", color: furPaint });
    b.part(box(0.13, 0.13, 0.13), furPaint, { bone: arm.joints[0], at: [s * 0.17, 0.96, 0.0] });
    const wrist = arm.tip!;
    b.part(box(0.075, 0.07, 0.1), PAW, { bone: wrist, at: [s * 0.115, 0.578, 0.215] });
    for (let i = 0; i < 3; i++) {
      const zf = 0.17 + 0.045 * i;
      const dg = b.chain(
        `finger${side}${i}`,
        catmull([
          [s * 0.115, 0.585, zf],
          [s * 0.085, 0.633, zf],
          [s * 0.03, 0.632, zf],
        ]),
        { parent: wrist, names: [`digit${side}${i}a`, `digit${side}${i}b`, `digit${side}${i}tip`], role: "digit" },
      );
      b.sweep(dg, [0.018, 0.014], { section: "box", caps: "flat", color: PAW });
      b.part(box(0.025, 0.02, 0.025), CLAW, { bone: dg.tip!, at: [s * 0.022, 0.632, zf] });
    }
  }

  // ---------- legs and feet (toes curl under the branch) ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.15, 0.74, -0.08], [s * 0.135, 0.555, 0.035], [0.17, 0.15], [[s * 0.6, 0.3, 0.8]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.135, 0.46, 0.05],
    });
    b.sweep(leg, [0.085, 0.055], { section: "box", caps: "flat", color: furPaint });
    b.part(box(0.12, 0.12, 0.12), furPaint, { bone: leg.joints[1], at: pts[1] });
    const ankle = leg.tip!;
    b.part(box(0.1, 0.06, 0.13), PAW, { bone: ankle, at: [s * 0.135, 0.545, 0.05] });
    for (let i = 0; i < 3; i++) {
      const zf = 0.0 + 0.04 * i;
      const toe = b.chain(
        `toe${side}${i}`,
        catmull([
          [s * 0.135, 0.53, zf],
          [s * 0.09, 0.47, zf],
          [s * 0.035, 0.452, zf],
        ]),
        { parent: ankle, names: [`toe${side}${i}a`, `toe${side}${i}b`, `toe${side}${i}tip`], role: "digit" },
      );
      b.sweep(toe, [0.018, 0.014], { section: "box", caps: "flat", color: PAW });
      b.part(box(0.025, 0.02, 0.025), CLAW, { bone: toe.tip!, at: [s * 0.022, 0.452, zf] });
    }
  }

  // ---------- eucalyptus twigs and leaves ----------
  const leafA = svg(leafSvg("#5f9180", "#4a7766", "#9cc7b2"), { size: 16, pixelated: true });
  const leafB = svg(leafSvg("#6f9d7a", "#547f63", "#b0d2b8"), { size: 16, pixelated: true });
  const leafFrames: ReturnType<typeof frame>[] = [];

  function twig(pts: number[][], r: [number, number], n: number) {
    const path = catmull(pts);
    b.sweep(path, r, { section: "box", caps: "flat", color: twigBark, bone: base });
    for (let i = 0; i < n; i++) {
      const t = 0.2 + 0.8 * (i / (n - 1));
      const p = path.at(t);
      const T = path.tangentAt(t).clone().normalize();
      const side = new THREE.Vector3().crossVectors(T, new THREE.Vector3(0, 1, 0));
      if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
      side.normalize().multiplyScalar(i % 2 ? 1 : -1);
      const dir = T.clone().multiplyScalar(0.55).add(side.multiplyScalar(0.8)).add(new THREE.Vector3(0, 0.15, 0)).normalize();
      leafFrames.push(frame(p, dir.toArray() as [number, number, number]));
      if (i % 3 === 1) {
        b.part(box(0.026, 0.026, 0.026), NUT, { bone: base, at: p.clone().add(new THREE.Vector3(0, -0.03, 0)) });
      }
    }
    const tipP = path.at(1);
    const tipT = path.tangentAt(1).clone().normalize();
    leafFrames.push(frame(tipP, tipT.toArray() as [number, number, number]));
  }

  twig(
    [
      [0, 0.56, -0.4],
      [0.12, 0.75, -0.45],
      [0.3, 0.95, -0.5],
      [0.42, 1.2, -0.5],
    ],
    [0.03, 0.012],
    9,
  );
  twig(
    [
      [0, 0.5, -0.32],
      [-0.15, 0.75, -0.4],
      [-0.32, 0.95, -0.38],
      [-0.5, 1.15, -0.3],
    ],
    [0.03, 0.012],
    9,
  );
  twig(
    [
      [0, 0.55, 0.45],
      [0.05, 0.7, 0.58],
      [0.12, 0.85, 0.68],
      [0.16, 1.02, 0.72],
    ],
    [0.026, 0.01],
    7,
  );

  b.cards(leafFrames, [leafA, leafB], {
    size: [0.075, 0.2],
    lean: 25,
    bend: 25,
    flow: [0, -1, 0],
    vary: 0.25,
    rng: rng(11),
    bone: base,
  });

  return b.root;
}
