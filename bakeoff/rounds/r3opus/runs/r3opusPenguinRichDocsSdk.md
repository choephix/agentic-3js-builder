```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, paint, noise, cells, mottle, scales, svg, rng } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Emperor Penguin Parent & Chick",
  description:
    "A proud emperor penguin with a glossy blue-black back, white belly melting into golden neck and ear patches, a slender beak with an orange-pink stripe, and a fluffy grey chick peeking out from between its big black feet.",
};

type RGB = [number, number, number];
const hex = (c: string): RGB => {
  const n = parseInt(c.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const mixc = (a: RGB, b: RGB, t: number): RGB => {
  const k = clamp01(t);
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
};
const sstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
function keyed(keys: number[][], t: number): number[] {
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const c = keys[i + 1];
    if (t <= c[0]) {
      const k = sstep(a[0], c[0], t);
      return a.slice(1).map((v, j) => v + (c[j + 1] - v) * k);
    }
  }
  return keys[keys.length - 1].slice(1);
}

// palette
const INK = "#121826";
const INK_RGB = hex(INK);
const BLUE_RGB = hex("#2c3d5e");
const SLATE_RGB = hex("#5b6f8f");
const WHITE_RGB = hex("#f7f5ef");
const SHADE_RGB = hex("#dcdde0");
const PALEGOLD_RGB = hex("#f6e08a");
const GOLD_RGB = hex("#f2a523");
const PINK = "#f28a5c";
const CLAW = "#3a332e";
const CHICK_GREY = "#a4aab2";
const WHITE = "#ffffff";
const EYE = "#1d120c";

export default function build() {
  const b = createBuilder({ name: "emperorPenguin" });

  // ---------- paints ----------
  const belly = paint((p) => {
    const cl = cells(p, 0.035, 9);
    const e = sstep(0, 0.006, cl.d2 - cl.d1);
    return mixc(SHADE_RGB, WHITE_RGB, 0.55 + 0.45 * e);
  });
  const bellyCol = (p: THREE.Vector3): RGB => {
    const cl = cells(p, 0.035, 9);
    const e = sstep(0, 0.006, cl.d2 - cl.d1);
    let c = mixc(SHADE_RGB, WHITE_RGB, 0.55 + 0.45 * e);
    c = mixc(c, PALEGOLD_RGB, sstep(0.66, 0.88, p.y));
    c = mixc(c, GOLD_RGB, sstep(0.84, 0.95, p.y));
    return c;
  };
  const coat = paint((p, n) => {
    const g = noise(p, 0.12, 3);
    const sheen = sstep(0.1, 0.9, n.y * 0.5 + 0.5);
    let c = mixc(INK_RGB, BLUE_RGB, 0.2 + 0.6 * g * sheen);
    const wob = 0.05 * Math.sin(p.y * 18) + 0.03 * Math.sin(p.y * 41);
    let w = sstep(0.04, 0.28, n.z + wob);
    w *= 1 - sstep(0.93, 0.975, p.y); // black throat and head
    c = mixc(c, bellyCol(p), w);
    c = mixc(c, SLATE_RGB, 4 * w * (1 - w) * 0.35); // glossy blue border
    const ax = Math.abs(n.x);
    const ear =
      sstep(0.45, 0.68, ax) *
      sstep(0.84, 0.9, p.y) *
      (1 - sstep(1.02, 1.06, p.y)) *
      sstep(-0.65, -0.25, n.z) *
      (1 - sstep(0.3, 0.55, n.z));
    c = mixc(c, GOLD_RGB, ear);
    return c;
  });
  const flipperPaint = paint((p, n) => {
    if (n.x * Math.sign(p.x) < -0.25) return bellyCol(p);
    const g = noise(p, 0.08, 5);
    return mixc(INK_RGB, BLUE_RGB, 0.25 + 0.5 * g);
  });
  const lowerBeak = paint((_p, _n, s) => {
    if (s[0] > 0.72) return INK;
    const d = Math.abs((((s[1] % 360) + 360) % 360) - 180);
    return d < 60 ? INK : PINK;
  });
  const footPaint = scales("#2a2a31", "#141418", { size: 0.012, seed: 4 });
  const chickCoat = mottle("#979da5", "#bcc1c7", { size: 0.03, seed: 2 });

  const fluff = svg(
    `<svg viewBox="0 0 32 48"><path d="M16 48 C 5 36, 3 20, 9 4 C 12 14, 14 10, 16 0 C 18 10, 20 14, 23 4 C 29 20, 27 36, 16 48 Z" fill="#ffffff"/><path d="M16 46 C 12 34 12 20 16 6" stroke="#b8b8b8" stroke-width="2.5" fill="none"/></svg>`,
    { size: 128 },
  );

  // ---------- parent skeleton ----------
  const A = [0, 0.2, -0.02];
  const D = [0, 0.88, 0.02];
  const E = [0, 1.0, 0.05];
  const P = catmull([A, [0, 0.45, 0.0], [0, 0.7, 0.0], D, E]);
  const tNeck = P.closestT(D);

  const hips = b.joint("hips", { at: A, dir: [0, 1, 0], role: "spine" });
  const spine = b.chain("spine", P.slice(0, tNeck), {
    parent: hips,
    count: 3,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const neck = b.chain("neck", P.slice(tNeck, 1), { parent: spine, count: 1, names: ["neck"], role: "neck" });
  const head = b.joint("head", { parent: neck, at: E, dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.005, 0.13], aim: [0, 0.98, 0.26], role: "jaw" });

  // ---------- body ----------
  const bodyKeys = [
    [0, 0.17, 0.16],
    [0.2, 0.2, 0.19],
    [0.45, 0.185, 0.17],
    [0.7, 0.14, 0.125],
    [0.85, 0.105, 0.1],
    [1, 0.085, 0.085],
  ];
  const body = b.sweep(P, (t: number) => keyed(bodyKeys, t) as [number, number], {
    bone: [spine, neck],
    color: coat,
    sides: 12,
    caps: "round",
    name: "body",
  });

  // head
  const hc = [0, 1.035, 0.065];
  const headPart = b.part(new THREE.SphereGeometry(0.1, 12, 9), coat, {
    bone: head,
    at: hc,
    scale: [0.88, 0.95, 1.12],
    name: "headBall",
  });

  // beak
  b.sweep(bezier([0, 1.03, 0.15], [0, 1.038, 0.22], [0, 0.995, 0.278]), (t: number) => [0.02 * (1 - t) + 0.002, 0.014 * (1 - t) + 0.002], {
    bone: head,
    color: INK,
    caps: { start: "flat", end: "point" },
    sides: 8,
    name: "beakUpper",
  });
  b.sweep(bezier([0, 1.006, 0.14], [0, 1.0, 0.2], [0, 0.984, 0.258]), (t: number) => [0.017 * (1 - t) + 0.002, 0.009 * (1 - t) + 0.0015], {
    bone: jaw,
    color: lowerBeak,
    caps: { start: "flat", end: "point" },
    sides: 8,
    name: "beakLower",
  });

  // eyes
  const headSurf = b.surface(headPart);
  for (const s of [1, -1]) {
    const h = headSurf.around(hc).at(s * 62, 20);
    if (h) {
      b.stick(new THREE.CylinderGeometry(0.018, 0.018, 0.003, 10), "#4c5d7a", h, { embed: 0.5, bone: head });
      b.stick(new THREE.SphereGeometry(0.011, 8, 6), EYE, h, { embed: 0.35, bone: head });
      b.part(new THREE.SphereGeometry(0.0035, 6, 4), WHITE, { bone: head, at: h.local([0, 0.011, 0.005]) });
    }
  }

  // flippers
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const fl = b.chain(
      `flipper${L}`,
      [
        [s * 0.12, 0.8, 0.0],
        [s * 0.2, 0.64, 0.012],
        [s * 0.26, 0.47, 0.03],
      ],
      { parent: spine.joints[2], names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "wing" },
    );
    b.sweep(fl, (t: number) => [0.017 - 0.01 * t, 0.045 - 0.022 * t], { color: flipperPaint, sides: 10, name: `flipper${L}` });
  }

  // tail
  const tail = b.chain(
    "tail",
    [
      [0, 0.14, -0.1],
      [0, 0.09, -0.2],
      [0, 0.055, -0.27],
    ],
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );
  b.sweep(tail, (t: number) => [0.055 - 0.028 * t, 0.016 - 0.006 * t], { color: INK, name: "tail" });

  // legs and feet
  const footOutline = (k: number): OutlinePoint[] => [
    [-0.02 * k, -0.03 * k],
    [0.04 * k, -0.05 * k],
    [0.12 * k, -0.055 * k, "sharp"],
    [0.09 * k, -0.02 * k],
    [0.14 * k, 0, "sharp"],
    [0.09 * k, 0.02 * k],
    [0.12 * k, 0.055 * k, "sharp"],
    [0.04 * k, 0.05 * k],
    [-0.02 * k, 0.03 * k],
  ];
  const toeTips = [
    [0.12, -0.055],
    [0.14, 0],
    [0.12, 0.055],
  ];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const cx = s * 0.13;
    const cz = 0.02;
    const leg = b.chain(
      `leg${L}`,
      [
        [s * 0.09, 0.2, 0.0],
        [cx, 0.045, 0.05],
        [cx, 0.02, 0.17],
      ],
      { parent: hips, names: [`hip${L}`, `ankle${L}`, `toe${L}`], role: "leg", contact: [cx, 0, 0.1] },
    );
    const ankle = leg.joints[1];
    b.capsule(leg.joints[0], ankle, [0.045, 0.034], { color: INK, bone: leg.joints[0], name: `leg${L}` });
    b.extrude(footOutline(1), {
      at: [cx, 0.011, cz],
      x: [0, 0, 1],
      y: [1, 0, 0],
      thickness: 0.022,
      bevel: 0.006,
      smoothing: 1,
      color: footPaint,
      bone: ankle,
      name: `foot${L}`,
    });
    for (const [u, v] of toeTips) {
      b.capsule([cx, 0.024, cz + 0.03], [cx + v * 0.85, 0.021, cz + u * 0.85], [0.016, 0.009], {
        color: "#1f1f25",
        bone: ankle,
        sides: 6,
      });
      b.spike([cx + v * 0.95, 0.013, cz + u * 0.95], [v * 3, -0.35, 1], 0.03, 0.008, { color: CLAW, bone: ankle, sides: 6 });
    }
  }

  // brood fold of belly skin over the chick
  b.sweep(
    catmull([
      [0.14, 0.345, 0.1],
      [0.07, 0.322, 0.185],
      [0, 0.315, 0.21],
      [-0.07, 0.322, 0.185],
      [-0.14, 0.345, 0.1],
    ]),
    [0.025, 0.04, 0.048, 0.04, 0.025],
    { bone: spine.joints[0], color: belly, sides: 10, name: "broodFold" },
  );

  // ---------- chick ----------
  const chickPath = catmull([
    [0, 0.085, 0.21],
    [0, 0.15, 0.222],
    [0, 0.205, 0.238],
  ]);
  const chickSpine = b.chain("chickSpine", chickPath, {
    parent: hips,
    count: 2,
    names: ["chickHips", "chickChest"],
    role: "spine",
  });
  const chickBody = b.sweep(chickSpine, [0.075, 0.079, 0.056], { color: chickCoat, sides: 10, name: "chickBody" });
  const chickHead = b.joint("chickHead", { parent: chickSpine, at: [0, 0.205, 0.238], dir: [0, 0.3, 1], role: "head" });
  const chickJaw = b.joint("chickJaw", { parent: chickHead, at: [0, 0.242, 0.3], aim: [0, 0.236, 0.345], role: "jaw" });

  const chc = [0, 0.252, 0.258];
  const chickFace = paint((p, n) => {
    const ax = Math.abs(n.x);
    const mask = (n.z > 0.12 && n.y < 0.42) || (ax > 0.45 && n.y < 0.3 && n.y > -0.55 && n.z > -0.35);
    if (mask) return "#f4f4f2";
    if (n.y < -0.35) return "#9ea4ab";
    const g = noise(p, 0.03, 8);
    return mixc(hex("#15151a"), hex("#2b2e36"), g);
  });
  const chickHeadPart = b.part(new THREE.SphereGeometry(0.058, 10, 8), chickFace, {
    bone: chickHead,
    at: chc,
    scale: [1, 0.95, 1],
    name: "chickHeadBall",
  });
  b.sweep(bezier([0, 0.256, 0.3], [0, 0.255, 0.33], [0, 0.245, 0.352]), (t: number) => [0.011 * (1 - t) + 0.0015, 0.007 * (1 - t) + 0.0015], {
    bone: chickHead,
    color: INK,
    caps: { start: "flat", end: "point" },
    sides: 6,
    name: "chickBeakUpper",
  });
  b.sweep(bezier([0, 0.243, 0.302], [0, 0.24, 0.325], [0, 0.236, 0.343]), (t: number) => [0.009 * (1 - t) + 0.0015, 0.005 * (1 - t) + 0.0012], {
    bone: chickJaw,
    color: INK,
    caps: { start: "flat", end: "point" },
    sides: 6,
    name: "chickBeakLower",
  });
  const chickHeadSurf = b.surface(chickHeadPart);
  for (const s of [1, -1]) {
    const h = chickHeadSurf.around(chc).at(s * 38, 14);
    if (h) {
      b.stick(new THREE.SphereGeometry(0.009, 8, 6), EYE, h, { embed: 0.35, bone: chickHead });
      b.part(new THREE.SphereGeometry(0.0028, 6, 4), WHITE, { bone: chickHead, at: h.local([0, 0.008, 0.004]) });
    }
  }
  const crown = chickHeadSurf.around(chc).at(0, 75);
  if (crown)
    b.cards([crown], fluff, { size: [0.035, 0.045], lean: 30, bend: 30, cross: true, color: "#2a2c33", bone: chickHead });

  // chick flippers and feet
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const cf = b.chain(
      `chickFlipper${L}`,
      [
        [s * 0.065, 0.18, 0.215],
        [s * 0.1, 0.12, 0.228],
      ],
      { parent: chickSpine.joints[1], names: [`chickShoulder${L}`, `chickHand${L}`], role: "wing" },
    );
    b.sweep(cf, (t: number) => [0.009, 0.022 - 0.01 * t], { color: CHICK_GREY, sides: 8, name: `chickFlipper${L}` });

    const cx = s * 0.04;
    const cl = b.chain(
      `chickLeg${L}`,
      [
        [s * 0.035, 0.06, 0.22],
        [cx, 0.02, 0.24],
        [cx, 0.008, 0.29],
      ],
      { parent: chickSpine.joints[0], names: [`chickHip${L}`, `chickAnkle${L}`, `chickToe${L}`], role: "leg", contact: [cx, 0, 0.265] },
    );
    b.capsule(cl.joints[0], cl.joints[1], [0.018, 0.014], { color: "#5f646c", bone: cl.joints[0], sides: 6 });
    b.extrude(footOutline(0.45), {
      at: [cx, 0.006, 0.236],
      x: [0, 0, 1],
      y: [1, 0, 0],
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 1,
      color: "#2b2b30",
      bone: cl.joints[1],
      name: `chickFoot${L}`,
    });
  }

  // chick down
  const downHits = b
    .surface(chickBody)
    .scatter(110, { rng: rng(11), minDist: 0.013, filter: (h) => h.n.y > -0.5 && h.at.y > 0.03 });
  b.cards(downHits, fluff, {
    size: [0.028, 0.038],
    lean: 55,
    bend: 25,
    vary: 0.35,
    spin: 25,
    rng: rng(5),
    color: "#b3b8bf",
    flow: [0, -1, -0.2],
  });

  // a few glossy flecks along the parent's back for sheen
  const backSurf = b.surface(body);
  for (const h of backSurf.scatter(14, { rng: rng(21), minDist: 0.08, filter: (h) => h.n.z < -0.4 && h.at.y > 0.35 && h.at.y < 0.85 }))
    b.stick(new THREE.SphereGeometry(0.012, 6, 4), "#3a5079", h, { embed: 0.7, scale: [0.6, 0.3, 1.8] });

  return b.root;
}
```