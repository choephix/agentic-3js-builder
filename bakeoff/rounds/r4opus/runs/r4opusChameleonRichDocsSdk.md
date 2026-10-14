```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  bezier,
  catmull,
  polyline,
  spiral,
  arc,
  limb,
  paint,
  noise,
  cells,
  mottle,
  svg,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Panther Chameleon on a Twig",
  description:
    "A stylized panther chameleon walking along a mossy twig: turquoise head fading through lime to a sunset-orange coiled tail, white lateral stripe and red bars, ridged casque, striped turret eyes looking two ways, and mitten feet gripping the branch.",
};

type RGB = [number, number, number];
const hex = (h: string): RGB => [
  parseInt(h.slice(1, 3), 16) / 255,
  parseInt(h.slice(3, 5), 16) / 255,
  parseInt(h.slice(5, 7), 16) / 255,
];
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const mixc = (a: RGB, c: RGB, t: number): RGB => {
  const k = clamp01(t);
  return [a[0] + (c[0] - a[0]) * k, a[1] + (c[1] - a[1]) * k, a[2] + (c[2] - a[2]) * k];
};
const sstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const frac = (x: number) => x - Math.floor(x);
const shade = (c: RGB, k: number): RGB => [clamp01(c[0] * k), clamp01(c[1] * k), clamp01(c[2] * k)];

// palette
const TURQ = hex("#1cc3c9");
const TEAL = hex("#0b7f8f");
const LIME = hex("#8fd33c");
const YEL = hex("#d3d93a");
const ORANGE = hex("#ff9330");
const SUNSET = hex("#ff5f2e");
const RED = hex("#e0233f");
const WHITE = hex("#f7f4e8");
const BELLY = hex("#e6f5c6");
const PEACH = hex("#ffd08a");
const BARK = hex("#6d4a2f");
const BARK_D = hex("#46301f");
const MOSS = hex("#6f9a3a");
const LEAF = hex("#5fae3c");
const LEAF_D = hex("#2f7a34");
const VEIN = hex("#b9e07a");

const TEAL_D_HEX = "#075e6b";
const GOLD_HEX = "#ffcf3d";
const PUPIL_HEX = "#141414";
const CLAW_HEX = "#2c2622";
const WHITE_HEX = "#f7f4e8";
const SUNSET_HEX = "#ff5f2e";
const LEAF_D_HEX = "#2f7a34";

// subtle scale texture: darken cell borders
const scaleTex = (p: THREE.Vector3, c: RGB, size: number): RGB => {
  const k = cells(p, size, 5);
  const u = (k.d2 - k.d1) / Math.max(k.d2, 1e-9);
  const n = noise(p, size * 4, 13);
  return shade(c, (0.8 + 0.2 * sstep(0, 0.3, u)) * (0.95 + 0.1 * n));
};

export default function build() {
  const b = createBuilder({ name: "panther-chameleon", paintSize: 2048 });

  // ---------------- paints ----------------
  const yc = (z: number) =>
    z < 0 ? 0.215 + 0.011 * sstep(-0.065, 0, z) : 0.226 - 0.004 * sstep(0, 0.055, z);
  const bodyBase = (z: number): RGB =>
    z > 0.02 ? mixc(LIME, TURQ, sstep(0.02, 0.085, z)) : mixc(YEL, LIME, sstep(-0.085, -0.005, z));

  const skin = paint((p, n) => {
    let c = bodyBase(p.z);
    const wob = (noise(p, 0.02, 3) - 0.5) * 0.006;
    const y0 = yc(p.z) - 0.013 + wob;
    const flank = Math.abs(n.x) > 0.25 && p.z > -0.084 && p.z < 0.066 && p.y > 0.19;
    if (flank) {
      const bar = frac((p.z + 0.08) / 0.024 + (noise(p, 0.015, 9) - 0.5) * 0.35) < 0.36;
      if (Math.abs(p.y - y0) < 0.0035) c = WHITE;
      else if (bar) c = mixc(c, RED, p.y > y0 ? 0.85 : 0.55);
    }
    if (n.y < -0.5) c = mixc(c, BELLY, 0.45);
    return scaleTex(p, c, 0.005);
  });

  const EYE_Y = 0.233;
  const EYE_Z = 0.099;
  const headPaint = paint((p, n) => {
    let c = TURQ;
    if (n.y > 0.55) c = mixc(c, TEAL, 0.3);
    const dy = p.y - EYE_Y;
    const dz = p.z - EYE_Z;
    const r = Math.hypot(dy, dz);
    if (Math.abs(n.x) > 0.3 && r > 0.011 && r < 0.04) {
      const a = Math.atan2(dy, dz) / (Math.PI * 2);
      if (frac(a * 7 + 0.05) < 0.3) c = mixc(c, SUNSET, 0.85);
    }
    if (p.y > 0.2125 && p.y < 0.2195 && p.z > 0.084) c = WHITE;
    if (n.y < -0.45) c = mixc(c, WHITE, 0.65);
    return scaleTex(p, c, 0.0035);
  });

  const tailPaint = paint((p, _n, s) => {
    const t = s[0];
    let c = t < 0.3 ? mixc(YEL, ORANGE, sstep(0, 0.3, t)) : mixc(ORANGE, SUNSET, sstep(0.3, 1, t));
    if (frac(t * 15) < 0.3) c = mixc(c, RED, 0.7);
    const deg = ((s[1] % 360) + 360) % 360;
    if (Math.abs(deg - 180) < 50) c = mixc(c, PEACH, 0.35);
    return scaleTex(p, c, 0.004);
  });

  const crestPaint = paint((_p, n, s) => {
    if (Math.abs(n.x) < 0.5) return SUNSET;
    let c = mixc(TEAL, TURQ, sstep(0, 0.025, s[1]));
    if (frac(s[0] / 0.006) < 0.2) c = shade(c, 0.72);
    return c;
  });

  const turretPaint = paint((_p, _n, s) => {
    if (s[0] > 0.0098) return TEAL;
    const deg = ((s[1] % 360) + 360) % 360;
    if (frac(deg / 30) < 0.22) return SUNSET;
    return mixc(TURQ, LIME, sstep(-0.006, 0.008, s[0]) * 0.5);
  });

  const barkPaint = paint((p, n, s) => {
    const streak = frac(s[1] / 14 + noise(p, 0.03, 4) * 1.5);
    let c = mixc(BARK, BARK_D, streak < 0.35 ? 0.8 : 0.1);
    const m = noise(p, 0.035, 8);
    if (n.y > 0.35 && m > 0.55) c = mixc(c, MOSS, sstep(0.55, 0.65, m));
    return c;
  });

  const leafPaint = paint((_p, _n, s) => {
    const along = s[0];
    const across = s[1];
    let c = mixc(LEAF_D, LEAF, sstep(0, 0.045, along));
    if (Math.abs(across) < 0.0011) c = VEIN;
    else if (frac((along - Math.abs(across) * 1.4) / 0.009) < 0.12) c = mixc(c, VEIN, 0.6);
    return c;
  });

  const rockMottle = mottle("#85817a", "#5c5953", { size: 0.02 });
  const rockPaint = paint((p, n) => (n.y > 0.5 && noise(p, 0.025, 2) > 0.42 ? MOSS : rockMottle));

  // ---------------- skeleton ----------------
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.215, -0.06], dir: [0, 0.15, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.215, -0.06],
      [0, 0.226, 0],
      [0, 0.222, 0.055],
    ]),
    { parent: hips, count: 3, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.222, 0.055],
      [0, 0.226, 0.08],
    ],
    { parent: spine, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 0.226, 0.08], dir: [0, 0.03, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.217, 0.078], aim: [0, 0.215, 0.135], role: "jaw" });

  // tail: short arc back, then a tight ventral coil
  const tailBase = bezier([0, 0.212, -0.07], [0, 0.216, -0.1], [0, 0.235, -0.115], [0, 0.235, -0.14]);
  const coil = spiral([0, 0.205, -0.14], [0, 0.235, -0.14], [-1, 0, 0], { turns: 2, r1: 0.0065, pitch: 0 });
  const tail = b.chain("tail", tailBase.concat(coil), { parent: hips, count: 14, role: "tail" });

  // ---------------- body ----------------
  const body = b.loft(
    [
      { at: [0, 0.211, -0.088], w: 0.02, h: 0.026 },
      { at: [0, 0.215, -0.065], w: 0.032, h: 0.048 },
      { at: [0, 0.222, -0.03], w: 0.04, h: 0.066 },
      { at: [0, 0.226, 0.0], w: 0.042, h: 0.072 },
      { at: [0, 0.224, 0.03], w: 0.038, h: 0.066 },
      { at: [0, 0.222, 0.054], w: 0.032, h: 0.05 },
      { at: [0, 0.224, 0.074], w: 0.026, h: 0.036 },
    ],
    { bone: [hips, spine, neck], color: skin, sides: 10, name: "body" },
  );

  b.sweep(
    tail,
    (t) => {
      const r = 0.0026 + 0.0094 * Math.pow(1 - t, 1.35);
      return [r * 0.88, r * 1.12];
    },
    { color: tailPaint, name: "tail" },
  );

  // dorsal crest cones
  b.along(
    body,
    16,
    (at) => {
      const z = at.at.z;
      const col = z > 0.02 ? TEAL_D_HEX : z > -0.04 ? "#5fae2e" : "#d9a520";
      b.spike(at, at, 0.0045, 0.0017, { color: col });
    },
    { from: 0.06, to: 0.92 },
  );
  // ventral white crest
  for (let i = 0; i < 11; i++) {
    const f = body.at(0.12 + i * 0.075, 180);
    b.spike(f, f, 0.0032, 0.0014, { color: WHITE_HEX });
  }
  // raised tubercles on the flanks
  const bodySurf = b.surface(body);
  for (const hit of bodySurf.scatter(40, {
    rng: rng(11),
    minDist: 0.008,
    filter: (h) => Math.abs(h.n.x) > 0.5 && h.at.y > 0.2,
  }))
    b.stick(new THREE.SphereGeometry(0.0017, 6, 4), skin, hit, { embed: 0.5 });

  // ---------------- head ----------------
  const skull = b.loft(
    [
      { at: [0, 0.232, 0.074], w: 0.026, h: 0.036 },
      { at: [0, 0.233, 0.09], w: 0.032, h: 0.036 },
      { at: [0, 0.229, 0.108], w: 0.027, h: 0.028 },
      { at: [0, 0.224, 0.124], w: 0.019, h: 0.02 },
      { at: [0, 0.221, 0.136], w: 0.011, h: 0.012 },
    ],
    { bone: head, color: headPaint, sides: 10, name: "skull" },
  );
  const lowerJaw = b.loft(
    [
      { at: [0, 0.213, 0.076], w: 0.026, h: 0.022 },
      { at: [0, 0.211, 0.095], w: 0.027, h: 0.018 },
      { at: [0, 0.213, 0.115], w: 0.02, h: 0.012 },
      { at: [0, 0.2155, 0.132], w: 0.011, h: 0.007 },
    ],
    { bone: jaw, color: headPaint, sides: 8, name: "lowerJaw" },
  );
  // gular crest
  for (let i = 0; i < 5; i++) {
    const f = lowerJaw.at(0.12 + i * 0.16, 180);
    b.spike(f, f, 0.003, 0.0013, { color: WHITE_HEX });
  }

  // ridged casque crest
  const S = "sharp" as const;
  const crestOutline: OutlinePoint[] = [
    [0.04, 0.004],
    [0.033, 0.0095, S],
    [0.029, 0.0085],
    [0.023, 0.0145, S],
    [0.019, 0.013],
    [0.013, 0.0195, S],
    [0.009, 0.018],
    [0.003, 0.0245, S],
    [-0.001, 0.023],
    [-0.007, 0.0295, S],
    [-0.011, 0.028],
    [-0.018, 0.0335, S],
    [-0.021, 0.026],
    [-0.022, 0.014],
    [-0.018, -0.004],
    [0.04, -0.004],
  ];
  b.extrude(crestOutline, {
    at: [0, 0.232, 0.08],
    thickness: [0.007, 0.0025],
    bevel: 0.001,
    color: crestPaint,
    bone: head,
    name: "casque",
  });

  // canthal ridges with bumps, draped on the skull
  const skullSurf = b.surface(skull);
  for (const s of [1, -1]) {
    const rough = catmull([
      [s * 0.0035, 0.226, 0.137],
      [s * 0.0105, 0.236, 0.12],
      [s * 0.013, 0.246, 0.1],
      [s * 0.009, 0.252, 0.083],
      [s * 0.004, 0.254, 0.07],
    ]);
    const ridge = skullSurf.drape(rough, { lift: 0.0006 });
    b.sweep(ridge, [0.0013, 0.0021, 0.0016], { color: TEAL_D_HEX, bone: head, sides: 6 });
    b.along(ridge, 7, (at) => {
      b.part(new THREE.SphereGeometry(0.0019, 6, 4), SUNSET_HEX, { at, bone: head });
    });
    // nostril
    b.stick(new THREE.SphereGeometry(0.0013, 5, 4), PUPIL_HEX, skullSurf.nearest([s * 0.005, 0.225, 0.134]), {
      embed: 0.55,
    });
  }

  // turret eyes looking two ways
  const turret: OutlinePoint[] = [
    [0, -0.007],
    [0.0105, -0.0055],
    [0.0122, 0.0005],
    [0.0108, 0.0062],
    [0.0074, 0.0098],
    [0.0044, 0.0114],
    [0, 0.0116],
  ];
  const eyes = [
    { side: "L", s: 1, gaze: [0.75, 0.2, 0.62] },
    { side: "R", s: -1, gaze: [-0.78, 0.28, -0.55] },
  ];
  for (const e of eyes) {
    const eye = b.joint(`eye${e.side}`, { parent: head, at: [e.s * 0.016, EYE_Y, EYE_Z], dir: e.gaze });
    b.lathe(turret, {
      at: eye.at,
      axis: e.gaze,
      segments: 10,
      smoothing: 1,
      color: turretPaint,
      bone: eye,
      name: `turret${e.side}`,
    });
    b.part(new THREE.SphereGeometry(0.0034, 8, 6), PUPIL_HEX, { bone: eye, at: eye.local([0, 0.0112, 0]) });
    b.part(new THREE.TorusGeometry(0.0037, 0.0008, 4, 12), GOLD_HEX, {
      bone: eye,
      at: eye.local([0, 0.0118, 0]),
      dir: e.gaze,
      axis: "z",
    });
    b.part(new THREE.SphereGeometry(0.0011, 5, 4), "#ffffff", { bone: eye, at: eye.local([0.0012, 0.0142, 0.0012]) });
  }

  // ---------------- legs & mitten feet ----------------
  const TWIG_R = 0.012;
  const TWIG_Y = 0.148;
  const legs = [
    { side: "L", s: 1, front: true, z: 0.078 },
    { side: "R", s: -1, front: true, z: 0.056 },
    { side: "L", s: 1, front: false, z: -0.082 },
    { side: "R", s: -1, front: false, z: -0.06 },
  ];
  for (const L of legs) {
    const { side, s, front, z } = L;
    const rootP = front ? [s * 0.014, 0.205, 0.046] : [s * 0.014, 0.205, -0.056];
    const wx = s * 0.0015;
    const target = [wx, 0.1665, z];
    const pts = limb(rootP, target, front ? [0.028, 0.028] : [0.03, 0.028], [s, 0, front ? -0.6 : 0.6]);
    const names = front
      ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`]
      : [`hip${side}`, `knee${side}`, `ankle${side}`];
    const leg = b.chain(front ? `arm${side}` : `leg${side}`, pts, {
      parent: front ? spine.joints[2] : hips,
      names,
      role: "leg",
      contact: [wx, TWIG_Y + TWIG_R, z],
    });
    b.sweep(leg, [0.0075, 0.005], { color: skin, extend: [0.006, 0] });
    const wrist = leg.tip!;
    const pad = new THREE.SphereGeometry(0.0058, 8, 6);
    pad.scale(1, 0.7, 1.3);
    b.part(pad, skin, { bone: wrist, at: [wx, 0.1655, z] });

    for (const q of [1, -1]) {
      const medial = q !== s;
      const toes = front ? (medial ? 3 : 2) : medial ? 2 : 3;
      const R = TWIG_R + 0.0035 + 0.0003;
      const path = arc([wx, TWIG_Y, z], [wx, TWIG_Y + R, z], [0, 0, -q], 112);
      const nm = `${front ? "hand" : "foot"}${side}${medial ? "In" : "Out"}`;
      const toe = b.chain(nm, path, {
        parent: wrist,
        count: 2,
        names: [`${nm}1`, `${nm}2`],
        up: [0, 0, 1],
        role: "digit",
      });
      const wide = toes === 3 ? 0.0058 : 0.0047;
      b.sweep(toe, (t) => [0.0035 - 0.0008 * t, wide - 0.0012 * t], { color: skin, sides: 8 });
      const tp = toe.at(1);
      for (let j = 0; j < toes; j++) {
        const base = new THREE.Vector3(tp.at.x, tp.at.y, tp.at.z + (j - (toes - 1) / 2) * 0.0034);
        b.spike(base, tp.tangent, 0.0078, 0.0013, { color: CLAW_HEX, bone: toe.joints[1], sides: 5 });
      }
    }
  }

  // ---------------- the twig ----------------
  const backSeg = bezier([0, 0.012, -0.355], [0, 0.085, -0.34], [0, TWIG_Y, -0.25], [0, TWIG_Y, -0.13]);
  const midSeg = polyline([
    [0, TWIG_Y, -0.13],
    [0, TWIG_Y, 0.12],
  ]);
  const frontSeg = bezier([0, TWIG_Y, 0.12], [0, TWIG_Y, 0.2], [0.008, 0.158, 0.255], [0.02, 0.185, 0.31]);
  const branchPath = backSeg.concat(midSeg).concat(frontSeg);
  const tA = branchPath.closestT([0, TWIG_Y, -0.13]);
  const tB = branchPath.closestT([0, TWIG_Y, 0.12]);
  const branchR = (t: number) =>
    t < tA ? TWIG_R + 0.009 * (1 - t / tA) : t > tB ? TWIG_R - 0.0065 * ((t - tB) / (1 - tB)) : TWIG_R;
  const branch = b.sweep(branchPath, branchR, {
    bone: root,
    color: barkPaint,
    sides: 8,
    caps: { start: "flat", end: "round" },
    name: "branch",
  });

  // supporting fork down to the ground
  const supStart = branchPath.at(branchPath.closestT([0, TWIG_Y, 0.165]));
  b.sweep(bezier(supStart, [0.02, 0.11, 0.19], [0.045, 0.05, 0.25], [0.055, 0.012, 0.276]), [0.008, 0.011], {
    bone: root,
    color: barkPaint,
    sides: 7,
    caps: { start: "round", end: "flat" },
    name: "branchFork",
  });
  // broken stub
  b.spike(branchPath.at(branchPath.closestT([0, 0.15, 0.19])), [-1, -0.15, 0.5], 0.03, 0.0045, {
    bone: root,
    color: barkPaint,
    sides: 6,
  });
  // twiglet with leaves at the back
  const twigStart = branchPath.at(branchPath.closestT([0, 0.11, -0.33]));
  const twigPath = bezier(twigStart, [0.025, 0.15, -0.33], [0.05, 0.2, -0.325], [0.07, 0.25, -0.31]);
  b.sweep(twigPath, [0.006, 0.0025], { bone: root, color: barkPaint, sides: 6, name: "twiglet" });

  // lichen discs
  let li = 0;
  for (const hit of b.surface(branch).scatter(12, {
    rng: rng(5),
    minDist: 0.025,
    filter: (h) => h.n.y > 0.3 && (h.at.z < -0.2 || h.at.z > 0.13),
  })) {
    b.stick(new THREE.CylinderGeometry(0.006, 0.007, 0.0016, 7), li++ % 3 === 0 ? "#e09a3a" : "#c3d39a", hit, {
      embed: 0.5,
      bone: root,
    });
  }

  // leaves
  const leafShape = (k: number): OutlinePoint[] => [
    [0, 0, "sharp"],
    [0.016 * k, 0.012 * k],
    [0.05 * k, 0, "sharp"],
    [0.016 * k, -0.012 * k],
  ];
  const up = new THREE.Vector3(0, 1, 0);
  const leaf = (at: THREE.Vector3, dir: number[], tilt: number, k: number) => {
    const x = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
    const y = new THREE.Vector3().crossVectors(up, x).normalize().addScaledVector(up, tilt);
    y.addScaledVector(x, -y.dot(x)).normalize();
    const base = at.clone().addScaledVector(x, 0.008);
    b.rod(at, base, 0.0011, { color: LEAF_D_HEX, bone: root, sides: 4 });
    b.extrude(leafShape(k), {
      at: base,
      x,
      y,
      thickness: 0.0016,
      bevel: 0.0005,
      smoothing: 2,
      color: leafPaint,
      bone: root,
      name: "leaf",
    });
  };
  leaf(frontSeg.at(1), [0.15, 0.4, 1], 0.25, 1.1);
  leaf(frontSeg.at(0.7), [-0.9, 0.35, 0.4], -0.3, 1);
  leaf(frontSeg.at(0.55), [0.9, 0.3, 0.25], 0.35, 0.9);
  leaf(frontSeg.at(0.85), [0.5, 0.7, 0.6], 0.2, 0.85);
  leaf(twigPath.at(1), [0.5, 0.55, -0.5], 0.1, 1);
  leaf(twigPath.at(0.55), [-0.6, 0.3, -0.75], -0.2, 0.85);
  leaf(twigPath.at(0.78), [0.85, 0.2, 0.3], 0.3, 0.8);

  // ---------------- ground: rocks, pebbles, grass ----------------
  const rockBack = b.lathe(
    [
      [0, 0],
      [0.055, 0],
      [0.058, 0.012],
      [0.045, 0.032],
      [0.018, 0.042],
      [0, 0.043],
    ],
    { at: [0, 0, -0.355], segments: 7, spin: 15, color: rockPaint, bone: root, name: "rockBack" },
  );
  const rockFront = b.lathe(
    [
      [0, 0],
      [0.034, 0],
      [0.036, 0.008],
      [0.028, 0.02],
      [0.011, 0.026],
      [0, 0.027],
    ],
    { at: [0.055, 0, 0.276], segments: 6, spin: 30, color: rockPaint, bone: root, name: "rockFront" },
  );
  const pebbles: [number[], string, number][] = [
    [[0.07, 0.006, -0.32], "#8a857c", 0.012],
    [[-0.055, 0.005, -0.38], "#6c6862", 0.01],
    [[0.02, 0.004, 0.3], "#9b958a", 0.008],
  ];
  for (const [at, col, r] of pebbles) {
    const g = new THREE.IcosahedronGeometry(r, 0);
    g.scale(1, 0.6, 1.2);
    b.part(g, col, { at, bone: root, rotation: [0, 35, 0], flat: true });
  }
  const grassTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M3 64 L9 8 L12 64 Z M12 64 L17 0 L21 64 Z M20 64 L27 14 L29 64 Z" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  for (const [rock, seed] of [
    [rockBack, 21],
    [rockFront, 22],
  ] as const) {
    const hits = b.surface(rock).scatter(7, { rng: rng(seed), minDist: 0.014, filter: (h) => h.n.y > 0.35 });
    b.cards(hits, grassTex, {
      size: [0.022, 0.032],
      lean: 15,
      vary: 0.3,
      spin: 40,
      rng: rng(seed + 10),
      color: "#7aa840",
      cross: true,
      bone: root,
    });
  }

  return b.root;
}
```