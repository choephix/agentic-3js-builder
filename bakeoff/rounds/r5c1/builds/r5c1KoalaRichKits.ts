import * as THREE from "three";
import { createBuilder, frame, rng, catmull, polyline, noise } from "../../../../src/index";
import {
  pixelTexture,
  tileBox,
  skinLayout,
  skinBox,
  cellPaint,
  pick,
  bayer,
  stepped,
} from "../../../../kits/pixel";

export const meta = {
  name: "Koala on a Eucalyptus Branch Stand",
  description:
    "A pixel-art koala sitting on a eucalyptus branch and hugging a second branch with both arms, all on a plank-and-moss display base. Skeleton-rigged with jaw, ears and gripping digits.",
};

// ---------- palettes ----------
const FUR = ["#4b525c", "#666e78", "#848c96", "#a3abb3", "#c4cacf"];
const CREAM = ["#8f8f86", "#bcbcb0", "#dddbcd", "#f2f0e2"];
const BARK = ["#2b1d16", "#45301f", "#634730", "#85634a", "#a88a68"];
const LEAF = ["#1c3a38", "#2c5a52", "#437e6c", "#68a38b", "#9ac8ae"];
const SKD = ["#17151a", "#26232b", "#3b3842"];
const WOOD = ["#4a3524", "#6b4d34", "#8c6a48", "#a98660"];
const MOSS = ["#24421f", "#35622b", "#4f8838", "#76ad4a"];
const STONE = ["#4a4a52", "#686872", "#8a8a92", "#adadb2"];
const NOSEC = ["#0e0d11", "#17151a", "#25222b"];

const zig = (x: number) => Math.abs((x - Math.floor(x)) * 2 - 1);

// ---------- paints ----------
const furPaint = (seed: number) =>
  cellPaint(
    0.02,
    (c) => {
      const n = noise(c.at, 0.12, seed);
      const v = 0.5 + 0.28 * c.n.y + 0.12 * c.n.z + (n - 0.5) * 0.5;
      return c.pick(FUR, v);
    },
    { dither: true },
  );
const COAT = furPaint(2);
const BODY = cellPaint(
  0.02,
  (c) => {
    const edge = 0.3 + 0.14 * zig(c.at.x / 0.05);
    if (c.n.z > edge && c.at.y > 0.74)
      return c.pick(CREAM, 0.6 + 0.25 * c.n.y + (noise(c.at, 0.08, 4) - 0.5) * 0.5);
    const n = noise(c.at, 0.12, 2);
    return c.pick(FUR, 0.5 + 0.28 * c.n.y + 0.1 * c.n.z + (n - 0.5) * 0.5);
  },
  { dither: true },
);
const CHEEK = cellPaint(0.02, (c) => c.pick(CREAM, 0.7 + (c.random(8) - 0.5) * 0.5 + 0.1 * c.n.y), { dither: true });
const FLUFF = cellPaint(0.02, (c) => c.pick(CREAM, 0.78 + (c.random(4) - 0.5) * 0.5), { dither: true });
const DIGIT = cellPaint(0.01, (c) => c.pick(SKD, 0.5 + 0.3 * c.n.y + (c.random(1) - 0.5) * 0.4), { dither: true });
const MOSSP = cellPaint(0.02, (c) => c.pick(MOSS, 0.55 + 0.25 * c.n.y + (noise(c.at, 0.1, 3) - 0.5) * 0.7), {
  dither: true,
});
const STONEP = cellPaint(0.02, (c) => c.pick(STONE, 0.45 + 0.35 * c.n.y + (c.random(2) - 0.5) * 0.3), {
  dither: true,
});
const barkPaint = (axis: "x" | "y") =>
  cellPaint(
    0.02,
    (c) => {
      const q =
        axis === "y"
          ? new THREE.Vector3(c.at.x * 3, c.at.y * 0.35, c.at.z * 3)
          : new THREE.Vector3(c.at.x * 0.35, c.at.y * 3, c.at.z * 3);
      const v = 0.15 + 0.5 * noise(q, 0.1, 7) + 0.25 * c.n.y + (c.random(3) - 0.5) * 0.2;
      return c.pick(BARK, v);
    },
    { dither: true },
  );
const BARK_V = barkPaint("y");
const BARK_H = barkPaint("x");

// ---------- textures ----------
const PLANKS = pixelTexture(76, 40, (g) => {
  const r = rng(11);
  g.fill((x, y) => {
    const row = Math.floor(y / 10);
    const ly = y % 10;
    if (ly === 0) return "#2e2016";
    if (ly === 1) return WOOD[3];
    const butt = (row * 29 + 17) % 76;
    if (x === butt) return "#2e2016";
    const streak = Math.sin((x + row * 13) * 0.35 + ly * 0.2) * 0.12;
    return pick(WOOD, 0.4 + streak + (r() - 0.5) * 0.3, bayer(x, y));
  });
  for (let row = 0; row < 4; row++) {
    const butt = (row * 29 + 17) % 76;
    g.set(butt + 2, row * 10 + 4, "#bfae94");
    g.set(butt - 2, row * 10 + 4, "#bfae94");
  }
});

const LEAF_TEX = pixelTexture(10, 28, (g) => {
  for (let y = 0; y < 28; y++) {
    const t = y / 27;
    const hw = t < 0.88 ? 4.7 * Math.sin(Math.PI * Math.pow(t / 0.88, 0.7)) : 0;
    for (let x = 0; x < 10; x++) {
      const d = Math.abs(x + 0.5 - 5);
      if (t >= 0.88) {
        if (d < 1) g.set(x, y, LEAF[1]);
        continue;
      }
      if (d > hw) continue;
      let c: string;
      if (d < 1) c = LEAF[4];
      else if (d > hw - 1) c = LEAF[1];
      else c = x < 5 ? LEAF[3] : LEAF[2];
      if (d >= 1 && (y + Math.floor(d)) % 4 === 0) c = LEAF[1] === c ? LEAF[0] : LEAF[2];
      g.set(x, y, c);
    }
  }
});

// Head / nose / jaw sheet (Minecraft skin layout, 1 px = 1 cm)
const L = skinLayout({ head: [32, 26, 28], nose: [10, 9, 5], jaw: [22, 5, 18] }, 120);
const HS = pixelTexture(L.size[0], L.size[1], (g) => {
  const r = rng(5);
  for (const rect of Object.values(L.faces.head))
    g.fill((x, y, _w, h) => pick(FUR, 0.62 - 0.25 * (y / h) + (r() - 0.5) * 0.3, bayer(x, y)), rect);
  const f = L.faces.head.pz;
  // pale muzzle and cheeks
  g.fill((x, y) => {
    const dx = (x - 15.5) / 10;
    const dy = (y - 17.5) / 8.5;
    return dx * dx + dy * dy < 1 ? pick(CREAM, 0.6 + (r() - 0.5) * 0.35 - 0.1 * dy, bayer(x, y)) : undefined;
  }, f);
  // brow shadow
  g.fill((x, y) => (y === 6 ? pick(FUR, 0.18 + (r() - 0.5) * 0.2, bayer(x, y)) : undefined), f);
  // eyes
  const px = (x: number, y: number, c: string) => g.set(f[0] + x, f[1] + y, c);
  for (const ex of [8, 22]) {
    for (let dx = -1; dx <= 3; dx++) px(ex + dx, 7, FUR[0]);
    for (let dx = 0; dx < 3; dx++) for (let dy = 0; dy < 3; dy++) px(ex + dx, 8 + dy, "#0d0c10");
    px(ex, 8, "#f4f6fa");
    px(ex + 2, 10, "#4a4f66");
  }
  for (let x = 10; x < 22; x++) px(x, 25, SKD[0]);
  // nose
  for (const rect of Object.values(L.faces.nose))
    g.fill((x, y) => pick(NOSEC, 0.45 + (r() - 0.5) * 0.35, bayer(x, y)), rect);
  const n = L.faces.nose.pz;
  g.set(n[0] + 2, n[1] + 1, "#6a6878");
  g.set(n[0] + 3, n[1] + 1, "#6a6878");
  g.set(n[0] + 2, n[1] + 2, "#55536a");
  for (const [cx, cy] of [
    [0, 0],
    [9, 0],
    [0, 8],
    [9, 8],
  ])
    g.set(n[0] + cx, n[1] + cy, "");
  // jaw
  for (const rect of Object.values(L.faces.jaw))
    g.fill((x, y, _w, h) => pick(CREAM, 0.55 - 0.15 * (y / h) + (r() - 0.5) * 0.3, bayer(x, y)), rect);
});

export default function build() {
  const b = createBuilder({ name: "koala" });

  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.66, -0.06], dir: [0, 1, 0.05], role: "spine" });

  // ----- skeleton: spine, neck, head, jaw -----
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.66, -0.06],
      [0, 0.78, -0.04],
      [0, 0.9, 0],
      [0, 1.0, 0.03],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] },
  );
  const neck = b.chain(
    "neck",
    polyline([
      [0, 1.0, 0.03],
      [0, 1.05, 0.05],
    ]),
    { parent: spine.joints[2], role: "neck", names: ["neck"] },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 1.05, 0.05], dir: [0, 0.25, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.0, 0.0], aim: [0, 1.0, 0.2], role: "jaw" });

  // ----- body -----
  b.sweep(
    spine,
    (t: number): [number, number] => [
      0.17 + 0.03 * Math.sin(Math.PI * Math.min(1, t * 1.4)) - 0.04 * t,
      0.16 + 0.02 * Math.sin(Math.PI * Math.min(1, t * 1.4)) - 0.04 * t,
    ],
    { section: "box", color: BODY, caps: { start: "round", end: "round" } },
  );

  // ----- head -----
  b.part(skinBox(HS, L.faces.head, 0.01), "#ffffff", { texture: HS, bone: head, at: [0, 1.13, 0.06] });
  b.part(skinBox(HS, L.faces.nose, 0.01), "#ffffff", { texture: HS, bone: head, at: [0, 1.09, 0.222] });
  b.part(skinBox(HS, L.faces.jaw, 0.01), "#ffffff", { texture: HS, bone: jaw, at: [0, 0.975, 0.11] });

  const earRows = [2, 3, 4, 5, 5, 5, 5, 4, 3, 2].map((h) => [-h, h] as [number, number]);
  const fluffRows = [2, 3, 4, 4, 4, 4, 3, 2].map((h) => [-h, h] as [number, number]);
  const earOutline = stepped(earRows, 0.02, { rows: true });
  const fluffOutline = stepped(fluffRows, 0.02, { rows: true });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.165, 1.17, -0.01],
      dir: [s * 0.3, 1, 0],
      role: "hinge",
    });
    b.extrude(earOutline, {
      at: [s * 0.165, 1.13, -0.01],
      x: [s, 0, 0],
      thickness: 0.04,
      color: COAT,
      bone: ear,
    });
    b.extrude(fluffOutline, {
      at: [s * 0.165, 1.15, 0.02],
      x: [s, 0, 0],
      thickness: 0.022,
      color: FLUFF,
      bone: ear,
    });
    b.part(new THREE.BoxGeometry(0.06, 0.12, 0.14), CHEEK, { bone: head, at: [s * 0.155, 1.07, 0.1] });
  }

  // ----- limbs -----
  const DX = [-0.04, -0.02, 0, 0.02, 0.04];
  const fingers = (
    prefix: string,
    parent: ReturnType<typeof b.joint>,
    mk: (dx: number) => number[][],
  ) => {
    DX.forEach((dx, i) => {
      const pts = mk(dx);
      const ch = b.chain(`${prefix}${i + 1}`, polyline(pts), {
        parent,
        names: [`${prefix}${i + 1}a`, `${prefix}${i + 1}b`],
        role: "digit",
      });
      b.sweep(ch, [0.012, 0.01], { section: "box", color: DIGIT, caps: "flat" });
      const tip = pts[2];
      b.part(new THREE.BoxGeometry(0.012, 0.014, 0.02), "#e6dfcb", {
        bone: ch.joints[1],
        at: [tip[0], tip[1] - 0.012, tip[2] + 0.012],
      });
    });
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // arm hugging the front branch
    const hx = s * 0.15;
    const arm = b.chain(
      `arm${side}`,
      polyline([
        [s * 0.17, 0.96, 0.02],
        [s * 0.24, 0.84, 0.05],
        [hx, 0.905, 0.145],
      ]),
      { parent: spine.joints[2], role: "arm", names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`] },
    );
    b.sweep(arm, [0.06, 0.04], { section: "box", color: COAT, caps: "flat" });
    const wrist = arm.tip!;
    b.part(new THREE.BoxGeometry(0.1, 0.035, 0.06), DIGIT, { bone: wrist, at: [hx, 0.905, 0.15] });
    fingers(`finger${side}`, wrist, (dx) => [
      [hx + dx, 0.9, 0.14],
      [hx + dx, 0.893, 0.19],
      [hx + dx, 0.845, 0.222],
    ]);

    // leg gripping the lower branch
    const fx = s * 0.19;
    const leg = b.chain(
      `leg${side}`,
      polyline([
        [s * 0.13, 0.67, -0.05],
        [s * 0.26, 0.7, 0.14],
        [fx, 0.56, 0.03],
      ]),
      {
        parent: hips,
        role: "leg",
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        contact: [fx, 0.45, 0.02],
      },
    );
    b.sweep(leg, [0.095, 0.045], { section: "box", color: COAT, caps: "flat" });
    const ankle = leg.tip!;
    b.part(new THREE.BoxGeometry(0.1, 0.035, 0.08), DIGIT, { bone: ankle, at: [fx, 0.545, 0.0] });
    fingers(`toe${side}`, ankle, (dx) => [
      [fx + dx, 0.54, -0.025],
      [fx + dx, 0.512, 0.02],
      [fx + dx, 0.466, 0.058],
    ]);
  }

  // ----- stand: base -----
  b.part(tileBox([1.5, 0.05, 0.8], PLANKS, 0.02), "#ffffff", { texture: PLANKS, bone: root, at: [0, 0.025, 0] });
  b.part(new THREE.BoxGeometry(1.3, 0.05, 0.64), MOSSP, { bone: root, at: [0, 0.075, 0] });
  const pebbles: [number, number, number, number, number][] = [
    [0.4, 0.28, 0.1, 0.06, 25],
    [0.5, 0.2, 0.07, 0.05, 60],
    [-0.35, 0.27, 0.08, 0.05, 10],
    [0.15, 0.3, 0.05, 0.04, 40],
  ];
  for (const [x, z, w, h, rot] of pebbles)
    b.part(new THREE.BoxGeometry(w, h, w * 0.8), STONEP, {
      bone: root,
      at: [x, 0.1 + h / 2 - 0.01, z],
      rotation: [0, rot, 0],
    });

  // ----- stand: trunk and branches -----
  const trunk = b.sweep(
    catmull([
      [-0.55, 0.08, 0],
      [-0.55, 0.6, 0],
      [-0.52, 1.1, 0.01],
      [-0.46, 1.45, 0.03],
      [-0.4, 1.62, 0.04],
    ]),
    [0.09, 0.035],
    { bone: root, color: BARK_V, sides: 8, smooth: false, caps: { start: "flat", end: "round" } },
  );
  const branchA = b.sweep(
    catmull([
      [-0.55, 0.4, 0],
      [-0.2, 0.44, 0],
      [0.2, 0.45, 0],
      [0.62, 0.45, 0],
    ]),
    [0.05, 0.045],
    { bone: root, color: BARK_H, sides: 8, smooth: false },
  );
  const branchB = b.sweep(
    catmull([
      [-0.55, 0.82, 0],
      [-0.32, 0.84, 0.12],
      [0, 0.84, 0.17],
      [0.3, 0.84, 0.17],
      [0.58, 0.9, 0.12],
    ]),
    [0.05, 0.035],
    { bone: root, color: BARK_H, sides: 8, smooth: false },
  );
  b.sweep(
    polyline([
      [0.62, 0.08, 0],
      [0.62, 0.45, 0],
    ]),
    [0.055, 0.042],
    { bone: root, color: BARK_V, sides: 8, smooth: false, caps: { start: "flat", end: "round" } },
  );

  const twigs: number[][][] = [
    [
      [-0.5, 1.2, 0.01],
      [-0.3, 1.38, 0.04],
      [-0.05, 1.5, 0.06],
    ],
    [
      [-0.54, 0.95, 0.0],
      [-0.66, 1.08, 0.1],
    ],
    [
      [-0.32, 0.84, 0.12],
      [-0.34, 0.93, 0.27],
    ],
  ];
  for (const tw of twigs) b.sweep(catmull(tw), [0.03, 0.013], { bone: root, color: BARK_H, sides: 6, smooth: false });

  // bark knots and peeling strips
  for (const tube of [trunk, branchA, branchB]) {
    const sk = b.surface(tube);
    for (const h of sk.scatter(tube === trunk ? 7 : 3, { rng: rng(41 + tube.meshes.length), minDist: 0.12 }))
      b.stick(new THREE.BoxGeometry(0.05, 0.03, 0.05), "#3a281c", h, { embed: 0.5, spin: 20 });
  }
  const trunkSkin = b.surface(trunk);
  for (const h of trunkSkin.scatter(6, { rng: rng(77), minDist: 0.18, filter: (hh) => hh.at.y > 0.3 }))
    b.stick(new THREE.BoxGeometry(0.04, 0.012, 0.18), "#b49a78", h, { embed: 0.5, flow: [0, 1, 0] });

  // ----- foliage -----
  const R = rng(21);
  const leafFrames: ReturnType<typeof frame>[] = [];
  const cluster = (c: number[], main: number[], count: number, spread: number) => {
    const m = new THREE.Vector3(main[0], main[1], main[2]).normalize();
    for (let i = 0; i < count; i++) {
      const d = new THREE.Vector3(
        m.x + (R() - 0.5) * 2 * spread,
        m.y + (R() - 0.5) * 2 * spread,
        m.z + (R() - 0.5) * 2 * spread,
      ).normalize();
      const base = [c[0] + d.x * 0.05, c[1] + d.y * 0.05, c[2] + d.z * 0.05];
      b.rod(c, base, 0.009, "#5a4030", { bone: root });
      leafFrames.push(frame(base, [d.x, d.y, d.z]));
    }
    for (let k = 0; k < 2; k++) {
      const nut = [c[0] + (R() - 0.5) * 0.08, c[1] - 0.05 - R() * 0.03, c[2] + (R() - 0.5) * 0.08];
      b.rod(c, nut, 0.006, "#5a4030", { bone: root });
      b.part(new THREE.BoxGeometry(0.03, 0.034, 0.03), "#7b6a48", { bone: root, at: nut });
      b.part(new THREE.BoxGeometry(0.036, 0.01, 0.036), "#4a3a28", {
        bone: root,
        at: [nut[0], nut[1] + 0.02, nut[2]],
      });
    }
  };
  cluster([-0.4, 1.62, 0.04], [0.2, 1, 0.1], 14, 0.9);
  cluster([-0.05, 1.5, 0.06], [1, 0.6, 0.2], 10, 0.7);
  cluster([0.58, 0.9, 0.12], [1, 0.3, 0.3], 9, 0.7);
  cluster([-0.66, 1.08, 0.1], [-0.5, 0.6, 0.5], 7, 0.7);
  cluster([-0.34, 0.93, 0.27], [-0.2, 0.3, 1], 6, 0.6);
  b.cards(leafFrames, LEAF_TEX, {
    size: [0.07, 0.22],
    lean: 35,
    bend: 30,
    flow: [0, -1, 0],
    vary: 0.3,
    spin: 180,
    rng: rng(31),
    bone: root,
  });

  // fallen leaves on the moss
  const fallen = [
    [0.3, 0.12, 0.2, 1, 0.3],
    [-0.25, 0.12, 0.25, -0.4, 1],
    [0.55, 0.12, -0.1, 0.7, -0.7],
    [-0.1, 0.12, 0.28, -1, -0.2],
  ];
  for (const [x, y, z, fx, fz] of fallen)
    b.cards([frame([x, y + 0.001, z], [0, 1, 0])], LEAF_TEX, {
      size: [0.06, 0.18],
      lean: 90,
      flow: [fx, 0, fz],
      mirror: true,
      bone: root,
    });

  return b.root;
}
