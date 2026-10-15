```ts
import * as THREE from "three";
import { createBuilder, noise, rng } from "agentic-3js-builder";
import { bayer, cellPaint, pick, pixelTexture, skinBox, skinLayout, tileBox } from "agentic-3js-builder/kits/pixel";

export const meta = {
  name: "Pixel Koala on Eucalyptus Stand",
  description:
    "A blocky pixel-art koala clinging to a gum-tree trunk on a plank plinth with a brass nameplate, a seat branch, gumnuts, blossoms and drooping eucalyptus leaves. Rigged with spine, arms, legs, digits, ears and a separate jaw.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const T = 0.02; // one texel in meters, shared by every paint
const FUR = ["#2b2d36", "#444855", "#626776", "#838899", "#a8aebb"];
const CREAM = ["#8f8b7c", "#b5b09e", "#d6d1bd", "#ece8d6", "#faf6e8"];
const GUM = ["#4f5846", "#6f7a62", "#939a7c", "#b9b793", "#dcd2b0"];
const SALMON = ["#a97058", "#cf9674", "#ebba96"];
const WOOD = ["#43291a", "#63402a", "#845a38", "#a57a4c", "#c39765"];
const BRASS = ["#7a5418", "#a8772a", "#d6a23c", "#f2cf6e"];
const LEAF_A = ["#2a5242", "#3f6d58", "#68977e", "#a4c6a6"];
const LEAF_B = ["#6a2f36", "#a24e4a", "#d2806a", "#f0b890"];
const BLOOM = ["#e0a63e", "#f2cc62", "#fbe79c", "#fffbe0"];
const CLAW = "#ddd3b8";
const NOSE = "#1b1822";
const TUFT_A = "#f1ecda";
const TUFT_B = "#d6d0ba";
const NUT = "#6b5238";

type C = Parameters<Parameters<typeof cellPaint>[1]>[0];

const furColor = (c: C, base = 0.55) => {
  const w = noise(c.at, 0.14, 3) - 0.5;
  let v = base + 0.3 * c.n.y + 0.1 * c.n.x + w * 0.7 + (c.random(1) - 0.5) * 0.25;
  if (c.random(2) < 0.05) v -= 0.3;
  return c.pick(FUR, v);
};
const FURP = cellPaint(T, (c) => furColor(c), { dither: true });
const PAWP = cellPaint(T, (c) => furColor(c, 0.22), { dither: true });
const CREAMP = cellPaint(
  T,
  (c) => c.pick(CREAM, 0.62 + (noise(c.at, 0.1, 8) - 0.5) * 0.8 + (c.random(5) - 0.5) * 0.3),
  { dither: true },
);
const BODYP = cellPaint(
  T,
  (c) => {
    const w = noise(c.at, 0.1, 6) - 0.5;
    const bib = c.n.z > 0.45 && Math.abs(c.at.x) < 0.075 + w * 0.1 && c.at.y > 0.44;
    if (bib) return c.pick(CREAM, 0.6 + w * 0.8 + (c.random(4) - 0.5) * 0.3);
    return furColor(c);
  },
  { dither: true },
);
const BARK = cellPaint(
  T,
  (c) => {
    const st = new THREE.Vector3(c.at.x * 4, c.at.y, c.at.z * 4);
    const v = noise(st, 0.2, 9);
    if (c.random(7) < 0.012) return "#3a3228";
    if (v > 0.68) return c.pick(SALMON, (v - 0.68) * 3 + (c.random(3) - 0.5) * 0.4);
    return c.pick(GUM, v * 1.3 - 0.1 + 0.15 * c.n.x + (c.random(2) - 0.5) * 0.3);
  },
  { dither: true },
);

// ---------------------------------------------------------------------------------------------------------------
// Textures

const leafTex = (ramp: string[]) =>
  pixelTexture(9, 22, (g) => {
    for (let y = 0; y < 18; y++) {
      const t = y / 17;
      const hw = Math.round(3.7 * Math.sin(Math.PI * Math.pow(t, 0.7)));
      for (let dx = -hw; dx <= hw; dx++) {
        const x = 4 + dx;
        let v = dx === 0 ? 0.95 : 0.45 + (dx > 0 ? 0.18 : 0) - (Math.abs(dx) / 4) * 0.2 + (1 - t) * 0.1;
        if (Math.abs(dx) === hw && hw > 0) v = 0.1;
        g.set(x, y, pick(ramp, v, bayer(x, y)));
      }
    }
    for (let y = 18; y < 22; y++) g.set(4, y, NUT);
  });

const BLOSSOM = pixelTexture(7, 7, (g) => {
  const R = rng(4);
  for (let y = 0; y < 7; y++)
    for (let x = 0; x < 7; x++) {
      const d = Math.hypot(x - 3, y - 3);
      if (d <= 3.2) g.set(x, y, pick(BLOOM, 1 - d / 3.4 + (R() - 0.5) * 0.2, bayer(x, y)));
    }
});

const PLANKS = pixelTexture(64, 56, (g) => {
  const R = rng(5);
  for (let p = 0; p < 7; p++) {
    const base = 0.35 + R() * 0.3;
    const joint = (p * 19 + 7) % 64;
    g.fill(
      (x, y) => {
        if (y === 0 || x === joint) return "#2b1a0e";
        if (y === 1) return pick(WOOD, base + 0.3);
        const grain = Math.sin(x * 0.3 + p * 3 + (y % 3)) * 0.1;
        return pick(WOOD, base + grain + (R() - 0.5) * 0.18, bayer(x, y));
      },
      [0, p * 8, 64, 8],
    );
    for (const nx of [2, 61]) g.set(nx, p * 8 + 4, "#2b1a0e");
  }
});

const PLAQUE = pixelTexture(24, 9, (g) => {
  g.fill((x, y) =>
    x === 0 || x === 23 || y === 0 || y === 8 ? "#5a3a14" : pick(BRASS, 0.62 + (y < 3 ? 0.2 : 0), bayer(x, y)),
  );
  const ink = { x: "#2b1a0c" };
  const glyphs = [
    ["x.x", "x.x", "xx.", "x.x", "x.x"],
    ["xxx", "x.x", "x.x", "x.x", "xxx"],
    [".x.", "x.x", "xxx", "x.x", "x.x"],
    ["x..", "x..", "x..", "x..", "xxx"],
    [".x.", "x.x", "xxx", "x.x", "x.x"],
  ];
  glyphs.forEach((rows, i) => g.stamp(2 + i * 4, 2, rows, ink));
});

// Head sheet: Minecraft-style skin with the face drawn on it.
const HL = skinLayout({ head: [14, 9, 10], jaw: [8, 2, 7] }, 64);
const HEAD_SHEET = pixelTexture(HL.size[0], HL.size[1], (g) => {
  const R = rng(77);
  for (const [name, faces] of Object.entries(HL.faces)) {
    const ramp = name === "jaw" ? CREAM : FUR;
    for (const [face, rect] of Object.entries(faces)) {
      const shade = face === "py" ? 0.72 : face === "ny" ? 0.35 : 0.58;
      g.fill((x, y, _w, h) => pick(ramp, shade + (R() - 0.5) * 0.4 - (y / h) * 0.12, bayer(x, y)), rect);
    }
  }
  const [fx, fy] = HL.faces.head.pz;
  for (let r = 4; r < 9; r++)
    for (let c = 3; c <= 10; c++) g.set(fx + c, fy + r, pick(CREAM, 0.55 + R() * 0.35, bayer(c, r)));
  for (let r = 5; r < 9; r++)
    for (const c of [1, 2, 11, 12]) g.set(fx + c, fy + r, pick(CREAM, 0.5 + R() * 0.4, bayer(c, r)));
  for (const c of [2, 3, 4, 5, 8, 9, 10, 11]) g.set(fx + c, fy + 1, FUR[0]);
  for (const [ex, gx] of [
    [3, 4],
    [9, 9],
  ]) {
    for (let dx = 0; dx < 2; dx++) for (let dy = 2; dy < 4; dy++) g.set(fx + ex + dx, fy + dy, "#14121a");
    g.set(fx + gx, fy + 2, "#ffffff");
  }
  for (const [c, r] of [
    [6, 7],
    [7, 7],
    [4, 8],
    [5, 8],
    [8, 8],
    [9, 8],
  ])
    g.set(fx + c, fy + r, "#2a2230");
  const [px, py] = HL.faces.head.px;
  const [nx, ny] = HL.faces.head.nx;
  for (let r = 4; r < 9; r++) {
    for (let c = 0; c < 3; c++) g.set(px + c, py + r, pick(CREAM, 0.5 + R() * 0.4, bayer(c, r)));
    for (let c = 7; c < 10; c++) g.set(nx + c, ny + r, pick(CREAM, 0.5 + R() * 0.4, bayer(c, r)));
  }
  const [jx, jy] = HL.faces.jaw.pz;
  for (let c = 1; c <= 6; c++) g.set(jx + c, jy, "#2a2230");
});

// ---------------------------------------------------------------------------------------------------------------
// Tree geometry helpers

const TZ = -0.14; // trunk axis z
const KEYS = [0.125, 0.115, 0.1, 0.08, 0.06];
const trunkR = (y: number) => {
  const t = Math.min(Math.max((y - 0.11) / 1.44, 0), 1) * (KEYS.length - 1);
  const i = Math.min(Math.floor(t), KEYS.length - 2);
  return KEYS[i] + (KEYS[i + 1] - KEYS[i]) * (t - i);
};
/** Point on a circle round the trunk: angle measured from +Z toward the side `s`. */
const wrap = (s: number, y: number, R: number, deg: number): [number, number, number] => {
  const a = (deg * Math.PI) / 180;
  return [s * R * Math.sin(a), y, TZ + R * Math.cos(a)];
};
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

export default function build() {
  const b = createBuilder({ name: "koala" });

  // ---- Skeleton ------------------------------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0.04, 0] });
  const trunkJ = b.joint("trunk", { parent: root, at: [0, 0.11, TZ], aim: [0, 1.5, TZ] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.5, 0.07],
      [0, 0.68, 0.075],
      [0, 0.84, 0.08],
    ],
    { parent: root, names: ["hips", "spine1", "spine2"], role: "spine" },
  );
  const [hips, spine1, spine2] = spine.joints;
  const neck = b.joint("neck", { parent: spine2, at: [0, 0.88, 0.08], aim: [0, 0.95, 0.09], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.93, 0.1], aim: [0, 1.1, 0.1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.91, 0.05], aim: [0, 0.91, 0.2], role: "jaw" });

  // ---- Base and tree -------------------------------------------------------------------------------------------
  b.part(tileBox([0.64, 0.08, 0.56], PLANKS, 0.01, { rand: rng(11), step: [1, 8] }), "#ffffff", {
    texture: PLANKS,
    bone: root,
    at: [0, 0.04, 0],
  });
  b.part(tileBox([0.52, 0.03, 0.44], PLANKS, 0.01, { rand: rng(12), step: [1, 8] }), "#ffffff", {
    texture: PLANKS,
    bone: root,
    at: [0, 0.095, 0],
  });
  b.part(new THREE.PlaneGeometry(0.168, 0.063), "#ffffff", {
    texture: PLAQUE,
    bone: root,
    at: [0, 0.04, 0.282],
    dir: [0, 0, 1],
    axis: "z",
  });
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.part(box(0.035, 0.03, 0.035), BRASS[2], { bone: root, at: [sx * 0.29, 0.092, sz * 0.25] });
      b.part(box(0.02, 0.01, 0.02), BRASS[3], { bone: root, at: [sx * 0.29, 0.11, sz * 0.25] });
    }

  b.part(new THREE.CylinderGeometry(0.17, 0.19, 0.03, 8), BARK, { bone: trunkJ, at: [0, 0.125, TZ] });
  const trunk = b.sweep(
    [
      [0, 0.11, TZ],
      [0, 0.5, TZ],
      [0, 0.95, TZ],
      [0.03, 1.55, -0.17],
    ].length
      ? (await_path())
      : [],
    KEYS,
    { color: BARK, bone: trunkJ, sides: 8, caps: { start: "flat", end: "flat" } },
  );

  function await_path() {
    return catmullPath([
      [0, 0.11, TZ],
      [0, 0.5, TZ],
      [0, 0.95, TZ],
      [0.03, 1.55, -0.17],
    ]);
  }

  // Seat branch under the koala
  b.sweep(
    [
      [0, 0.34, TZ],
      [0, 0.42, 0.2],
    ],
    [0.045, 0.03],
    { color: BARK, bone: trunkJ, sides: 8 },
  );

  // ---- Foliage -------------------------------------------------------------------------------------------------
  const TEX_A = leafTex(LEAF_A);
  const TEX_B = leafTex(LEAF_B);
  const angs = [0, 70, -70, 140, -140, 180];
  const leafFlow = (f: any): [number, number, number] => [f.tangent.x, f.tangent.y - 0.8, f.tangent.z];
  let seed = 30;
  const branch = (pts: number[][], r: [number, number], leaves: number, blossoms: number, size = 1) => {
    const sw = b.sweep(catmullPath(pts), r, { color: BARK, bone: trunkJ, sides: 6 });
    const frames = Array.from({ length: leaves }, (_, i) =>
      sw.at(0.25 + (0.75 * (i + 0.5)) / leaves, angs[i % angs.length]),
    );
    b.cards(frames, [TEX_A, TEX_A, TEX_A, TEX_B], {
      size: [0.075 * size, 0.19 * size],
      lean: 55,
      bend: 30,
      flow: leafFlow,
      vary: 0.25,
      spin: 15,
      rng: rng(seed++),
    });
    if (blossoms > 0) {
      const bf = Array.from({ length: blossoms }, (_, i) => sw.at(0.55 + (0.45 * i) / blossoms, angs[(i + 2) % 6]));
      b.cards(bf, BLOSSOM, { size: 0.055, cross: true, vary: 0.2, rng: rng(seed++) });
    }
    for (const [t, a] of [
      [0.5, 180],
      [0.72, 150],
    ] as const)
      b.stick(new THREE.CylinderGeometry(0.013, 0.009, 0.032, 6), NUT, sw.at(t, a), { embed: 0.3 });
    return sw;
  };
  branch(
    [
      [0, 1.05, -0.15],
      [0.14, 1.2, -0.16],
      [0.32, 1.32, -0.2],
      [0.5, 1.36, -0.22],
    ],
    [0.032, 0.01],
    14,
    3,
  );
  branch(
    [
      [0, 1.2, -0.16],
      [-0.12, 1.35, -0.14],
      [-0.28, 1.45, -0.12],
      [-0.42, 1.5, -0.1],
    ],
    [0.03, 0.01],
    14,
    4,
  );
  branch(
    [
      [0.02, 1.4, -0.17],
      [0.12, 1.55, -0.15],
      [0.2, 1.68, -0.12],
    ],
    [0.024, 0.008],
    9,
    2,
  );
  branch(
    [
      [0.05, 0.95, -0.18],
      [0.28, 1.0, -0.26],
      [0.45, 0.98, -0.3],
    ],
    [0.026, 0.01],
    10,
    0,
  );
  branch(
    [
      [0, 0.42, 0.2],
      [0.04, 0.5, 0.28],
      [0.12, 0.58, 0.34],
    ],
    [0.016, 0.006],
    6,
    0,
    0.8,
  );
  // top of the trunk: a crown of leaves
  const crown = b.sweep(
    catmullPath([
      [0.03, 1.5, -0.17],
      [0.04, 1.62, -0.16],
    ]),
    [0.03, 0.012],
    { color: BARK, bone: trunkJ, sides: 6 },
  );
  b.cards(
    Array.from({ length: 6 }, (_, i) => crown.at(0.5 + i * 0.1, angs[i])),
    [TEX_A, TEX_B],
    { size: [0.07, 0.17], lean: 40, bend: 25, flow: leafFlow, vary: 0.2, rng: rng(60) },
  );
  const tb = b.surface(trunk);
  for (const hit of tb.scatter(16, { rng: rng(9), minDist: 0.1, filter: (h) => h.at.y > 1.05 || h.n.z < -0.3 }))
    b.stick(box(0.04, 0.05, 0.04), BARK, hit, { embed: 0.5 });

  // ---- Koala body ----------------------------------------------------------------------------------------------
  const pelvis = b.part(box(0.26, 0.16, 0.22), BODYP, { bone: hips, at: [0, 0.5, 0.07] });
  const belly = b.part(box(0.24, 0.2, 0.2), BODYP, { bone: spine1, at: [0, 0.68, 0.075] });
  const chest = b.part(box(0.2, 0.12, 0.18), BODYP, { bone: spine2, at: [0, 0.84, 0.08] });
  const fluff = b.surface([pelvis, belly, chest]);
  for (const hit of fluff.scatter(70, { rng: rng(21), minDist: 0.045, filter: (h) => h.n.y > -0.4 }))
    b.stick(box(0.035, 0.025, 0.035), BODYP, hit, { embed: 0.4 });

  // ---- Head ----------------------------------------------------------------------------------------------------
  b.part(skinBox(HEAD_SHEET, HL.faces.head, T), "#ffffff", { texture: HEAD_SHEET, bone: head, at: [0, 1.02, 0.1] });
  b.part(skinBox(HEAD_SHEET, HL.faces.jaw, T), "#ffffff", { texture: HEAD_SHEET, bone: jaw, at: [0, 0.91, 0.12] });
  b.part(box(0.06, 0.03, 0.04), TUFT_A, { bone: jaw, at: [0, 0.885, 0.17] });
  b.part(box(0.1, 0.06, 0.05), NOSE, { bone: head, at: [0, 1.0, 0.215] });
  b.part(box(0.025, 0.015, 0.01), "#6a6a80", { bone: head, at: [-0.02, 1.02, 0.243] });
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    b.part(box(0.04, 0.04, 0.04), s > 0 ? TUFT_A : TUFT_B, { bone: head, at: [s * 0.14, 0.95, 0.17] });
    b.part(box(0.035, 0.035, 0.035), s > 0 ? TUFT_B : TUFT_A, { bone: head, at: [s * 0.142, 0.99, 0.12] });
    b.part(box(0.045, 0.03, 0.03), FUR[1], { bone: head, at: [s * 0.1, 1.085, 0.2] }); // brow fur

    // ears
    const E = new THREE.Vector3(s * 0.13, 1.1, 0.075);
    const D = new THREE.Vector3(s * 0.5, 0.15, 0.85).normalize();
    const earJ = b.joint(`ear${S}`, { parent: head, at: E, aim: E.clone().add(D), role: "hinge" });
    const outer = b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 10), FURP, { at: E, dir: D, bone: earJ });
    b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.012, 10), CREAMP, {
      at: E.clone().addScaledVector(D, 0.02),
      dir: D,
      bone: earJ,
    });
    b.ring(outer, { count: 9, radius: 0.088, fromDeg: -120, toDeg: 120 }, (item) =>
      b.stick(box(0.035, 0.05, 0.035), item.i % 2 ? TUFT_B : TUFT_A, item, { embed: 0.35 }),
    );
  }

  // ---- Limbs ---------------------------------------------------------------------------------------------------
  const digit = (name: string, parent: ReturnType<typeof b.joint>, pts: number[][], w: number) => {
    const ch = b.chain(name, pts, { parent, names: [`${name}1`, `${name}2`], role: "digit" });
    b.frustumBox(pts[0], pts[1], [w, w], [w * 0.9, w * 0.9], { color: PAWP, bone: ch.joints[0] });
    b.frustumBox(pts[1], pts[2], [w * 0.9, w * 0.9], [w * 0.75, w * 0.75], { color: PAWP, bone: ch.joints[1] });
    b.part(box(w * 0.7, w * 0.7, w * 0.7), CLAW, { at: pts[2], bone: ch.joints[1] });
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // arm
    const hy = 0.83;
    const rr = trunkR(hy);
    const shoulder: number[] = [s * 0.11, hy, 0.06];
    const elbow: number[] = [s * 0.21, 0.73, 0.0];
    const wrist = wrap(s, hy, rr + 0.04, 56);
    const arm = b.chain(`arm${S}`, [shoulder, elbow, wrist], {
      parent: spine2,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const hand = arm.tip!;
    b.part(box(0.09, 0.09, 0.09), FURP, { at: shoulder, bone: arm.joints[0] });
    b.frustumBox(shoulder, elbow, [0.075, 0.075], [0.065, 0.065], { color: FURP, bone: arm.joints[0] });
    b.part(box(0.07, 0.07, 0.07), FURP, { at: elbow, bone: arm.joints[1] });
    b.frustumBox(elbow, wrist, [0.065, 0.065], [0.055, 0.055], { color: FURP, bone: arm.joints[1] });
    b.part(box(0.055, 0.12, 0.055), PAWP, { at: wrap(s, hy, rr + 0.025, 72), bone: hand });
    [0.045, 0.015, -0.015, -0.045].forEach((dy, i) => {
      const R = rr + 0.014;
      digit(`hand${S}${i}`, hand, [wrap(s, hy + dy, R, 78), wrap(s, hy + dy, R, 116), wrap(s, hy + dy, R, 154)], 0.026);
    });

    // leg
    const fy = 0.3;
    const rf = trunkR(fy);
    const hip: number[] = [s * 0.1, 0.5, 0.06];
    const knee: number[] = [s * 0.17, 0.43, 0.17];
    const ankle = wrap(s, fy, rf + 0.04, 45);
    const leg = b.chain(`leg${S}`, [hip, knee, ankle], {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    const foot = leg.tip!;
    b.part(box(0.11, 0.11, 0.11), FURP, { at: hip, bone: leg.joints[0] });
    b.frustumBox(hip, knee, [0.1, 0.1], [0.08, 0.08], { color: FURP, bone: leg.joints[0] });
    b.part(box(0.08, 0.08, 0.08), FURP, { at: knee, bone: leg.joints[1] });
    b.frustumBox(knee, ankle, [0.08, 0.08], [0.065, 0.065], { color: FURP, bone: leg.joints[1] });
    b.part(box(0.06, 0.13, 0.06), PAWP, { at: wrap(s, fy, rf + 0.025, 60), bone: foot });
    [0.04, 0.013, -0.013, -0.04].forEach((dy, i) => {
      const R = rf + 0.014;
      digit(`foot${S}${i}`, foot, [wrap(s, fy + dy, R, 70), wrap(s, fy + dy, R, 108), wrap(s, fy + dy, R, 146)], 0.024);
    });
  }

  return b.root;
}

// Smooth path through points (catmull) kept local so the module needs one import line less.
import { catmull } from "agentic-3js-builder";
function catmullPath(pts: number[][]) {
  return catmull(pts);
}
```