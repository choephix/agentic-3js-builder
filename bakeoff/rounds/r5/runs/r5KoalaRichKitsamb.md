```ts
import * as THREE from "three";
import { createBuilder, frame, rng, catmull, limb, noise, offset } from "agentic-3js-builder";
import { cellPaint, pixelTexture, stepped } from "agentic-3js-builder/kits/pixel";

export const meta = {
  name: "Koala on a Eucalyptus Perch",
  description:
    "A pixel-art koala sitting on a eucalyptus branch stand, gripping a higher branch with both hands. Fluffy ears, a big nose, gumnuts, hanging leaves and a little KOALA sign on a grassy plinth.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (ramps run dark to light)
const TEXEL = 0.0125;
const FUR = ["#3d424c", "#565c68", "#727987", "#8f96a3", "#adb3bd", "#cdd1d8"];
const CREAM = ["#9a9ea6", "#bcbfc6", "#d9dce0", "#eeeff0", "#fbfbfa"];
const DARKFUR = ["#1d2027", "#2c3039", "#40454f", "#585e6b"];
const BARK = ["#7b6a58", "#a8947a", "#cdbf9f", "#e5dcc2", "#f3eedb"];
const BLOTCH = ["#a9694a", "#c98a62", "#e0aa86"];
const GRASS = ["#1f4a22", "#2f6a2c", "#4a8a36", "#6aa844", "#90c85c"];
const DIRT = ["#3a2616", "#4f351e", "#68482a", "#85603a"];
const STONE = ["#4a4d58", "#686c78", "#8a8e9a", "#aeb2bc"];
const WOOD = ["#5a3d22", "#7a5630", "#98703f", "#b58a52"];
const CLAW = "#efe6d0";
const GUMNUT = "#7d5b38";
const GUMCAP = "#4b3926";
const BLOSSOM = "#f6b3c4";
const INKC = "#3b2a1a";

const STREAK = new THREE.Vector3(1, 0.3, 1);
const TALL = new THREE.Vector3(1, 0.12, 1);
const FLAT = new THREE.Vector3(0.15, 1, 1);

// ---------------------------------------------------------------------------------------------------------------
// Paints
const fur = (seed: number, lift = 0, ramp: string[] = FUR) =>
  cellPaint(
    TEXEL,
    (c) => {
      const n = noise(c.at, 0.08, seed);
      const st = noise(c.at.clone().multiply(STREAK), 0.035, seed + 4);
      let v = 0.42 + lift + 0.2 * c.n.y + 0.5 * (n - 0.5) + 0.45 * (st - 0.5);
      if (c.random(seed) < 0.07) v += 0.22;
      return c.pick(ramp, v);
    },
    { dither: true },
  );

const BODY = cellPaint(
  TEXEL,
  (c) => {
    const zig = ((c.v % 3) + 3) % 3;
    const n = noise(c.at, 0.08, 21);
    if (c.n.z > 0.3 && c.at.y < 0.62 && Math.abs(c.at.x) < 0.07 + 0.0125 * zig)
      return c.pick(CREAM, 0.55 + 0.6 * (n - 0.5) + (c.random(5) < 0.1 ? 0.2 : 0));
    const st = noise(c.at.clone().multiply(STREAK), 0.035, 24);
    let v = 0.42 + 0.2 * c.n.y + 0.5 * (n - 0.5) + 0.45 * (st - 0.5);
    if (c.random(3) < 0.07) v += 0.22;
    return c.pick(FUR, v);
  },
  { dither: true },
);

const FURP = fur(11);
const FURLIGHT = fur(12, 0.12);
const CHEEKP = fur(13, 0.3, CREAM);
const CREAMP = fur(14, 0.15, CREAM);
const EARP = fur(15, -0.25);
const HANDP = cellPaint(
  TEXEL,
  (c) => c.pick(DARKFUR, 0.45 + 0.6 * (noise(c.at, 0.05, 41) - 0.5) + 0.15 * c.n.y),
  { dither: true },
);
const BARKP = cellPaint(
  TEXEL,
  (c) => {
    const st = noise(c.at.clone().multiply(TALL), 0.05, 31);
    const n = noise(c.at, 0.1, 32);
    if (noise(c.at.clone().multiply(TALL), 0.12, 33) > 0.68) return c.pick(BLOTCH, 0.3 + 0.9 * (st - 0.5) + 0.5);
    return c.pick(BARK, 0.5 + 0.8 * (st - 0.5) + 0.3 * (n - 0.5));
  },
  { dither: true },
);
const GRASSP = cellPaint(
  TEXEL,
  (c) => {
    const n = noise(c.at, 0.12, 51);
    if (c.n.y > 0.5) return c.pick(GRASS, 0.5 + 0.9 * (n - 0.5) + (c.random(1) < 0.08 ? 0.25 : 0));
    return c.pick(DIRT, 0.4 + 0.9 * (n - 0.5) + (c.random(2) < 0.1 ? 0.3 : 0));
  },
  { dither: true },
);
const EDGEP = cellPaint(
  TEXEL,
  (c) => c.pick(GRASS, 0.45 + 0.9 * (noise(c.at, 0.06, 52) - 0.5) + (c.random(4) < 0.15 ? 0.25 : 0)),
  { dither: true },
);
const STONEP = cellPaint(
  TEXEL,
  (c) => c.pick(STONE, 0.5 + 0.8 * (noise(c.at, 0.07, 61) - 0.5) + 0.2 * c.n.y),
  { dither: true },
);
const WOODP = cellPaint(
  0.01,
  (c) => c.pick(WOOD, 0.5 + 0.9 * (noise(c.at.clone().multiply(FLAT), 0.04, 71) - 0.5)),
  { dither: true },
);
const CAPP = cellPaint(
  0.01,
  (c) => (c.random(2) < 0.12 ? "#fbfbf2" : c.pick(["#8e1c1c", "#c02a2a", "#e04040"], 0.5 + 0.5 * c.n.y)),
  { dither: true },
);

// ---------------------------------------------------------------------------------------------------------------
// Textures
const FACE = pixelTexture(21, 14, (g) => {
  for (let y = 5; y < 14; y++)
    for (let x = 5; x < 16; x++) {
      const dx = (x - 10) / 5.6;
      const dy = (y - 9.5) / 4.9;
      if (dx * dx + dy * dy < 1) g.set(x, y, dy > 0.4 ? "#b4b9c4" : "#dcdfe5");
    }
  const K = "#14141c";
  for (const ex of [3, 16]) {
    g.fill(() => K, [ex, 4, 2, 2]);
    g.fill(() => "#3a3f4a", [ex - 1, 3, 4, 1]);
  }
  g.set(3, 4, "#ffffff");
  g.set(16, 4, "#ffffff");
  g.fill(() => K, [10, 10, 1, 2]);
  g.fill(() => K, [7, 13, 7, 1]);
  g.set(6, 12, K);
  g.set(14, 12, K);
});

const LEAF = pixelTexture(8, 22, (g) => {
  for (let y = 0; y < 22; y++) {
    const t = (y + 0.5) / 22;
    const hw = 3.3 * Math.sin(Math.PI * Math.pow(t, 0.75));
    const cx = 3.6 + 1.6 * (1 - t) * (1 - t);
    for (let x = 0; x < 8; x++) {
      const d = x + 0.5 - cx;
      if (Math.abs(d) > hw) continue;
      g.set(x, y, Math.abs(d) < 0.55 ? "#bfe3cf" : Math.abs(d) > hw - 0.9 ? "#3b6f60" : d < 0 ? "#6aa593" : "#518a79");
    }
  }
  g.set(3, 21, "#6b5a3a");
  g.set(3, 20, "#6b5a3a");
});

const LEAF2 = pixelTexture(8, 8, (g) => {
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      const d = Math.hypot(x + 0.5 - 4, y + 0.5 - 4);
      if (d > 3.6) continue;
      g.set(x, y, d > 2.7 ? "#6f9a97" : x === 3 || x === 4 ? "#c6e0da" : "#a3c7c1");
    }
  g.set(3, 7, "#6b5a3a");
  g.set(4, 7, "#6b5a3a");
});

const TUFT = pixelTexture(7, 9, (g) => {
  const hs = [3, 6, 4, 9, 5, 7, 3];
  hs.forEach((h, x) => {
    for (let j = 0; j < h; j++) g.set(x, 8 - j, j >= h - 2 ? "#8fcf5a" : j > 2 ? "#5aa83e" : "#3a7a30");
  });
});

const FLOWER1 = pixelTexture(5, 9, (g) => {
  for (let y = 3; y < 9; y++) g.set(2, y, "#3f8a3c");
  g.set(1, 6, "#3f8a3c");
  const P = "#ff7fa8";
  g.set(2, 0, P);
  g.set(1, 1, P);
  g.set(3, 1, P);
  g.set(2, 2, P);
  g.set(2, 1, "#ffd24a");
});
const FLOWER2 = pixelTexture(5, 9, (g) => {
  for (let y = 3; y < 9; y++) g.set(2, y, "#3f8a3c");
  g.set(3, 7, "#3f8a3c");
  const P = "#ffffff";
  g.set(2, 0, P);
  g.set(1, 1, P);
  g.set(3, 1, P);
  g.set(2, 2, P);
  g.set(2, 1, "#ffb43a");
});

const SIGN = pixelTexture(25, 9, (g) => {
  g.fill((x, y) => (x === 0 || y === 0 || x === 24 || y === 8 ? INKC : "#e9d9b0"));
  const P = { x: INKC };
  g.stamp(4, 2, ["x.x", "x.x", "xx.", "x.x", "x.x"], P);
  g.stamp(8, 2, ["xxx", "x.x", "x.x", "x.x", "xxx"], P);
  g.stamp(12, 2, [".x.", "x.x", "xxx", "x.x", "x.x"], P);
  g.stamp(16, 2, ["x..", "x..", "x..", "x..", "xxx"], P);
  g.stamp(20, 2, [".x.", "x.x", "xxx", "x.x", "x.x"], P);
  for (const [x, y] of [
    [2, 4],
    [22 + 1, 4],
  ])
    g.set(x, y, "#4f8f4a");
  g.set(2, 3, "#4f8f4a");
  g.set(2, 5, "#4f8f4a");
});

// ---------------------------------------------------------------------------------------------------------------
function last<T>(c: { joints: T[] }): T {
  return c.joints[c.joints.length - 1];
}
type FrameT = ReturnType<typeof frame>;
const wrapPts = (x: number, cy: number, cz: number, rad: number, angs: number[]) =>
  angs.map((a) => [x, cy + rad * Math.sin((a * Math.PI) / 180), cz + rad * Math.cos((a * Math.PI) / 180)]);

export default function build() {
  const b = createBuilder({ name: "koala" });
  const R = rng(7);

  // Key heights
  const GY = 0.09; // grass top
  const SEAT = { y: 0.26, z: 0.02, r: 0.04 };
  const GRIP = { y: 0.575, z: 0.2, r: 0.03 };

  // ------------------------------------------------------------------------------------------------ skeleton
  const root = b.joint("root", { at: [0, GY, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.37, -0.05],
      [0, 0.5, -0.04],
      [0, 0.63, 0.0],
    ]),
    { parent: root, names: ["hips", "spine2", "chest"], role: "spine" },
  );
  const hips = spine.joints[0];
  const spine2 = spine.joints[1];
  const chest = last(spine);
  const neck = b.chain(
    "neck",
    [
      [0, 0.62, 0],
      [0, 0.72, 0],
    ],
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const neckJ = neck.joints[0];
  const head = b.joint("head", { parent: neckJ, at: [0, 0.72, 0], dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.69, 0.03], aim: [0, 0.678, 0.19], role: "jaw" });

  // ------------------------------------------------------------------------------------------------ plinth
  b.part(new THREE.BoxGeometry(1.06, 0.025, 0.62), STONEP, { bone: root, at: [0, 0.0125, 0.04] });
  b.part(new THREE.BoxGeometry(1.0, 0.035, 0.56), GRASSP, { bone: root, at: [0, 0.0425, 0.04] });
  b.part(new THREE.BoxGeometry(1.0, 0.03, 0.56), GRASSP, { bone: root, at: [0, 0.075, 0.04] });
  // dripping grass edge on front and sides
  const edgeSpans = (n: number) =>
    Array.from({ length: n }, () => [-Math.floor(R() * 3), 2] as [number, number]);
  b.extrude(stepped(edgeSpans(40), [0.025, 0.0125]), {
    at: [-0.5, 0.055, 0.326],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    color: EDGEP,
    bone: root,
  });
  for (const s of [1, -1])
    b.extrude(stepped(edgeSpans(22), [0.025, 0.0125]), {
      at: [s * 0.506, 0.055, -0.24],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      color: EDGEP,
      bone: root,
    });

  // rocks
  const rocks: [number[], number[], number][] = [
    [[0.1, 0.06, 0.08], [-0.3, GY + 0.025, 0.24], 20],
    [[0.06, 0.04, 0.06], [-0.22, GY + 0.015, 0.29], 40],
    [[0.12, 0.07, 0.09], [0.38, GY + 0.03, -0.12], -15],
    [[0.07, 0.05, 0.07], [0.29, GY + 0.02, -0.17], 30],
  ];
  for (const [sz, at, ry] of rocks)
    b.part(new THREE.BoxGeometry(sz[0], sz[1], sz[2]), STONEP, { bone: root, at, rotation: [0, ry, 0] });

  // mushrooms
  for (const [mx, mz, sc] of [
    [-0.1, 0.27, 1],
    [-0.04, 0.22, 0.65],
  ]) {
    b.part(new THREE.BoxGeometry(0.02 * sc, 0.035 * sc, 0.02 * sc), "#efe6d0", { bone: root, at: [mx, GY + 0.0165 * sc, mz] });
    b.part(new THREE.BoxGeometry(0.07 * sc, 0.016 * sc, 0.07 * sc), CAPP, { bone: root, at: [mx, GY + 0.043 * sc, mz] });
    b.part(new THREE.BoxGeometry(0.045 * sc, 0.016 * sc, 0.045 * sc), CAPP, { bone: root, at: [mx, GY + 0.059 * sc, mz] });
  }

  // sign
  b.part(new THREE.BoxGeometry(0.025, 0.14, 0.025), WOODP, { bone: root, at: [0.3, GY + 0.065, 0.255] });
  b.part(new THREE.BoxGeometry(0.27, 0.11, 0.018), WOODP, { bone: root, at: [0.3, 0.2, 0.27] });
  b.part(new THREE.PlaneGeometry(0.25, 0.09), "#ffffff", {
    bone: root,
    at: [0.3, 0.2, 0.2805],
    dir: [0, 0, 1],
    axis: "z",
    texture: SIGN,
  });

  // grass tufts and flowers
  const tufts: FrameT[] = [];
  const flowersA: FrameT[] = [];
  const flowersB: FrameT[] = [];
  for (let i = 0; i < 36; i++) {
    const x = (R() - 0.5) * 0.92;
    const z = -0.22 + R() * 0.52;
    if (x > 0.15 && z > 0.2) continue;
    tufts.push(frame([x, GY - 0.004, z], [0, 1, 0]));
  }
  for (let i = 0; i < 12; i++) {
    const x = (R() - 0.5) * 0.9;
    const z = -0.2 + R() * 0.5;
    if (x > 0.15 && z > 0.2) continue;
    (i % 2 ? flowersA : flowersB).push(frame([x, GY - 0.004, z], [0, 1, 0]));
  }
  b.cards(tufts, TUFT, { size: [0.055, 0.07], lean: 0, flow: [0, 0, 1], cross: true, vary: 0.3, rng: rng(9), bone: root, sink: 0.05 });
  b.cards(flowersA, FLOWER1, { size: [0.035, 0.063], lean: 0, flow: [0, 0, 1], cross: true, vary: 0.2, rng: rng(10), bone: root, sink: 0.05 });
  b.cards(flowersB, FLOWER2, { size: [0.035, 0.063], lean: 0, flow: [0, 0, 1], cross: true, vary: 0.2, rng: rng(12), bone: root, sink: 0.05 });

  // ------------------------------------------------------------------------------------------------ eucalyptus stand
  const hang: FrameT[] = [];
  const crown: FrameT[] = [];
  const leafAt = (list: FrameT[], p: number[], n: number, spread: number) => {
    for (let i = 0; i < n; i++)
      list.push(frame([p[0] + (R() - 0.5) * spread, p[1] + (R() - 0.5) * spread * 0.5, p[2] + (R() - 0.5) * spread], [0, 1, 0]));
  };
  const tips: number[][] = [];

  for (const s of [1, -1]) {
    const pts = [
      [s * 0.4, 0.08, 0.06],
      [s * 0.415, 0.36, 0.055],
      [s * 0.395, 0.64, 0.065],
      [s * 0.41, 0.88, 0.06],
    ];
    const post = b.sweep(catmull(pts), [0.056, 0.034], { section: "box", caps: "flat", color: BARKP, bone: root });
    // knots and bark flaps
    for (const [t, deg, big] of [
      [0.3, 200, 0],
      [0.5, 150, 1],
      [0.65, 225, 0],
      [0.8, 180, 1],
      [0.4, 80, 0],
      [0.72, 270, 1],
    ] as [number, number, number][]) {
      if (big) b.stick(new THREE.BoxGeometry(0.05, 0.012, 0.13), CREAMP, post.at(t, deg), { flow: [0, 1, 0], embed: 0.3 });
      else b.stick(new THREE.BoxGeometry(0.032, 0.025, 0.032), BARKP, post.at(t, deg), { embed: 0.4 });
    }
    // fork limbs
    const top = [s * 0.41, 0.86, 0.06];
    const tipA = [s * 0.3, 1.0, 0.0];
    const tipB = [s * 0.5, 0.98, 0.12];
    const tipC = [s * 0.42, 1.02, 0.1];
    b.sweep(catmull([top, [s * 0.35, 0.93, 0.03], tipA]), [0.03, 0.012], { section: "box", caps: "flat", color: BARKP, bone: root });
    b.sweep(catmull([top, [s * 0.46, 0.92, 0.09], tipB]), [0.028, 0.012], { section: "box", caps: "flat", color: BARKP, bone: root });
    b.sweep(catmull([top, [s * 0.41, 0.95, 0.08], tipC]), [0.026, 0.012], { section: "box", caps: "flat", color: BARKP, bone: root });
    for (const tp of [tipA, tipB, tipC]) {
      tips.push(tp);
      leafAt(crown, tp, 8, 0.05);
      leafAt(hang, tp, 4, 0.06);
    }
    // forward strut to grip branch
    b.rod([s * 0.4, 0.55, 0.06], [s * 0.4, GRIP.y, GRIP.z], 0.028, { color: BARKP, bone: root, section: { ngon: 8 } });
    // seat-end buds
    leafAt(hang, [s * 0.455, 0.29, 0.02], 3, 0.03);
  }

  // seat branch (koala sits here)
  const seat = b.sweep(
    catmull([
      [-0.47, SEAT.y + 0.01, SEAT.z],
      [-0.2, SEAT.y, SEAT.z],
      [0.2, SEAT.y, SEAT.z],
      [0.47, SEAT.y + 0.01, SEAT.z],
    ]),
    SEAT.r,
    { section: { ngon: 8 }, caps: "flat", color: BARKP, bone: root },
  );
  for (const t of [0.12, 0.88, 0.3, 0.7]) b.stick(new THREE.BoxGeometry(0.03, 0.025, 0.03), BARKP, seat.at(t, 180), { embed: 0.4 });
  // grip branch (koala holds this)
  const grip = b.sweep(
    catmull([
      [-0.47, GRIP.y + 0.01, GRIP.z],
      [-0.2, GRIP.y, GRIP.z],
      [0.2, GRIP.y, GRIP.z],
      [0.47, GRIP.y + 0.01, GRIP.z],
    ]),
    GRIP.r,
    { section: { ngon: 8 }, caps: "flat", color: BARKP, bone: root },
  );
  for (const t of [0.1, 0.9, 0.2, 0.8]) b.stick(new THREE.BoxGeometry(0.025, 0.022, 0.025), BARKP, grip.at(t, 0), { embed: 0.4 });
  for (const x of [0.2, 0.27, 0.34, 0.41, 0.455])
    for (const s of [1, -1]) leafAt(hang, [s * x, GRIP.y + 0.015, GRIP.z], 3, 0.03);

  // gumnuts and blossoms
  for (const tp of tips) {
    for (let i = 0; i < 3; i++) {
      const gx = tp[0] + (R() - 0.5) * 0.07;
      const gy = tp[1] - 0.02 - R() * 0.03;
      const gz = tp[2] + (R() - 0.5) * 0.07;
      b.part(new THREE.BoxGeometry(0.02, 0.02, 0.02), GUMNUT, { bone: root, at: [gx, gy, gz] });
      b.part(new THREE.BoxGeometry(0.024, 0.008, 0.024), GUMCAP, { bone: root, at: [gx, gy + 0.013, gz] });
    }
  }
  for (const bp of [
    [0.3, 0.99, 0.02],
    [-0.5, 0.97, 0.14],
    [0.5, 0.97, 0.14],
    [-0.3, 0.99, 0.02],
  ])
    for (let i = 0; i < 5; i++)
      b.part(new THREE.BoxGeometry(0.012, 0.012, 0.012), BLOSSOM, {
        bone: root,
        at: [bp[0] + (R() - 0.5) * 0.05, bp[1] + (R() - 0.3) * 0.04, bp[2] + (R() - 0.5) * 0.05],
      });

  // leaves
  b.cards(hang, [LEAF, LEAF, LEAF2], {
    size: [0.05, 0.15],
    lean: 165,
    flow: (_f, i) => [Math.sin(i * 2.399) * 0.6, -0.15, Math.cos(i * 2.399)],
    bend: 25,
    cross: true,
    vary: 0.3,
    spin: 180,
    rng: rng(5),
    bone: root,
  });
  b.cards(crown, [LEAF, LEAF2, LEAF], {
    size: [0.05, 0.16],
    lean: 55,
    flow: (_f, i) => [Math.sin(i * 2.399), -0.2, Math.cos(i * 2.399)],
    bend: 30,
    cross: true,
    vary: 0.3,
    spin: 180,
    rng: rng(6),
    bone: root,
  });

  // ------------------------------------------------------------------------------------------------ koala body
  b.part(new THREE.BoxGeometry(0.3, 0.12, 0.28), FURP, { bone: hips, at: [0, 0.36, -0.05] });
  b.sweep(spine, (t) => [0.15 - 0.03 * t, 0.14 - 0.03 * t], {
    section: "box",
    caps: { start: "flat", end: "flat" },
    color: BODY,
  });
  b.part(new THREE.BoxGeometry(0.22, 0.2, 0.05), CREAMP, { bone: spine2, at: [0, 0.5, 0.095] });
  b.sweep(neck, [0.095, 0.085], { section: "box", caps: "flat", color: FURLIGHT });
  // neck ruff of fluffy spikes
  b.ring(frame([0, 0.625, 0.02], [0, 1, 0]), { count: 14, radius: 0.12, tilt: -40 }, (it) =>
    b.spike(it, it, 0.06, 0.02, { color: CREAMP, section: { ngon: 4 }, bone: neckJ }),
  );

  // ------------------------------------------------------------------------------------------------ head
  b.part(new THREE.BoxGeometry(21 * TEXEL, 14 * TEXEL, 0.21), FURLIGHT, { bone: head, at: [0, 0.765, 0.08] });
  b.part(new THREE.PlaneGeometry(21 * TEXEL, 14 * TEXEL), "#ffffff", {
    bone: head,
    at: [0, 0.765, 0.1865],
    dir: [0, 0, 1],
    axis: "z",
    texture: FACE,
  });
  // nose
  b.extrude(
    stepped(
      [
        [-2, 2],
        [-3, 3],
        [-3, 3],
        [-3, 3],
        [-3, 3],
        [-2, 2],
      ],
      TEXEL,
      { rows: true },
    ),
    { at: [0, 0.7275, 0.2], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, color: "#15151c", bone: head },
  );
  b.part(new THREE.BoxGeometry(0.014, 0.012, 0.006), "#7d8394", { bone: head, at: [-0.02, 0.793, 0.2185] });
  b.part(new THREE.BoxGeometry(0.01, 0.008, 0.006), "#7d8394", { bone: head, at: [-0.007, 0.793, 0.2185] });
  // lower jaw
  b.part(new THREE.BoxGeometry(0.19, 0.045, 0.15), CREAMP, { bone: jaw, at: [0, 0.658, 0.105] });
  b.part(new THREE.BoxGeometry(0.1, 0.012, 0.03), "#c8737c", { bone: jaw, at: [0, 0.683, 0.15] });
  // forehead crest
  b.extrude(
    stepped(
      [
        [0, 1],
        [0, 2],
        [0, 1],
        [0, 3],
        [0, 2],
        [0, 1],
        [0, 2],
      ],
      TEXEL,
    ),
    { at: [0, 0.85, -0.03], thickness: 0.05, color: FURP, bone: head },
  );
  const CHEEK = stepped(
    [
      [0, 5],
      [0, 4],
      [1, 5],
      [0, 4],
      [1, 3],
    ],
    0.018,
  );
  const earOuter = stepped(
    [
      [-3, 3],
      [-4, 4],
      [-4, 4],
      [-4, 4],
      [-4, 4],
      [-3, 3],
      [-2, 2],
    ],
    0.016,
    { rows: true },
  );
  const earInner = stepped(
    [
      [-2, 2],
      [-3, 3],
      [-3, 3],
      [-3, 3],
      [-2, 2],
    ],
    0.016,
    { rows: true },
  );
  for (const s of [1, -1]) {
    b.extrude(CHEEK, { at: [s * 0.145, 0.67, 0.0], thickness: 0.03, color: CHEEKP, bone: head });
    b.extrude(earOuter, { at: [s * 0.105, 0.815, 0.02], x: [1, 0, 0], y: [s * 0.35, 1, 0], thickness: 0.04, color: EARP, bone: head });
    b.extrude(earInner, { at: [s * 0.109, 0.827, 0.0425], x: [1, 0, 0], y: [s * 0.35, 1, 0], thickness: 0.012, color: CREAMP, bone: head });
    // ear tufts
    for (const k of [-1, 0, 1])
      b.part(new THREE.BoxGeometry(0.014, 0.03, 0.014), CREAMP, {
        bone: head,
        at: [s * (0.105 + 0.035 * s * 0 + 0.03 * k + 0.035 * 0) + s * 0.0 + (s > 0 ? 0 : 0), 0.925 - Math.abs(k) * 0.012 + 0.012 * s * 0, 0.04],
      });
  }

  // ------------------------------------------------------------------------------------------------ arms and hands
  const clawOn = (ch: ReturnType<typeof b.chain>) => {
    const e = ch.at(1);
    b.part(new THREE.BoxGeometry(0.012, 0.022, 0.012), CLAW, {
      bone: last(ch),
      at: offset(e.at, e.tangent, 0.008),
      dir: e.tangent,
    });
  };
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb([s * 0.14, 0.59, 0.03], [s * 0.1, 0.615, 0.155], [0.11, 0.1], [[s * 0.7, -1, 0.1]]);
    const arm = b.chain(`arm${L}`, pts, {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `hand${L}`],
      role: "arm",
    });
    b.sweep(arm, [0.052, 0.04], { section: "box", caps: { start: "flat", end: "flat" }, color: FURP });
    const hand = last(arm);
    b.part(new THREE.BoxGeometry(0.06, 0.032, 0.078), HANDP, { bone: hand, at: [s * 0.1, 0.63, 0.19] });
    [-0.018, 0, 0.018].forEach((dx, k) => {
      const ch = b.chain(
        `finger${L}${k + 1}`,
        wrapPts(s * 0.1 + dx, GRIP.y, GRIP.z, 0.05, [70, 28, -22]),
        { parent: hand, names: [`finger${L}${k + 1}a`, `finger${L}${k + 1}b`], role: "digit" },
      );
      b.sweep(ch, 0.009, { section: "box", caps: "flat", color: HANDP });
      clawOn(ch);
    });
    [-0.012, 0.014].forEach((dx, k) => {
      const ch = b.chain(
        `thumb${L}${k + 1}`,
        wrapPts(s * 0.1 + dx, GRIP.y, GRIP.z, 0.05, [105, 150, 198]),
        { parent: hand, names: [`thumb${L}${k + 1}a`, `thumb${L}${k + 1}b`], role: "digit" },
      );
      b.sweep(ch, 0.01, { section: "box", caps: "flat", color: HANDP });
      clawOn(ch);
    });
    // fluffy elbow tuft
    b.spike([s * 0.165, 0.535, 0.075], [s * 0.7, -0.4, -0.3], 0.05, 0.02, {
      color: CREAMP,
      section: { ngon: 4 },
      bone: arm.joints[1],
    });
  }

  // ------------------------------------------------------------------------------------------------ legs and feet
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const lp = limb([s * 0.12, 0.37, -0.03], [s * 0.14, 0.31, 0.05], [0.12, 0.08], [[s * 0.5, 0.4, 1]]);
    const leg = b.chain(`leg${L}`, lp, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
    });
    b.sweep(leg, [0.062, 0.04], { section: "box", caps: { start: "flat", end: "flat" }, color: FURP });
    const ankle = last(leg);
    b.part(new THREE.BoxGeometry(0.09, 0.035, 0.065), HANDP, { bone: ankle, at: [s * 0.14, 0.32, 0.05] });
    [-0.036, -0.018, 0, 0.018, 0.036].forEach((dx, k) => {
      const big = s * dx < 0 && k === (s > 0 ? 0 : 4);
      const ch = b.chain(
        `toe${L}${k + 1}`,
        wrapPts(s * 0.14 + dx, SEAT.y, SEAT.z, SEAT.r + 0.016, [62, 18, -30]),
        { parent: ankle, names: [`toe${L}${k + 1}a`, `toe${L}${k + 1}b`], role: "digit" },
      );
      b.sweep(ch, big ? 0.011 : 0.008, { section: "box", caps: "flat", color: HANDP });
      if (!big) clawOn(ch);
    });
    b.spike([s * 0.17, 0.4, 0.07], [s * 0.6, 0.2, 0.8], 0.05, 0.02, { color: CREAMP, section: { ngon: 4 }, bone: leg.joints[1] });
  }

  return b.root;
}
```