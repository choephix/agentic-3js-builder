import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, spots, grain, svg, catmull, polyline } from "../../../../src/index";
import { metal, panelled, gearGeometry, gearTrain, gaugeTexture } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gnome Tinkerer",
  description:
    "A whimsical low-poly gnome inventor with a bent red hat, goggles, a big white beard and a backpack stuffed with gears, a gauge, a telescope, a wrench and a propeller, standing on a small workshop plank base with a lantern, toolbox and mushrooms.",
};

// ---------- palette & paints ----------
const SKIN = "#f0b48c";
const NOSE = "#e68a70";
const BEARD_C = "#fbf6ea";
const GLOVE = "#8a5630";
const CREAM = "#f3e6c4";
const lit = (c: string, n: THREE.Vector3) =>
  mix(mix(c, "#fff0c8", 0.14 * Math.max(n.y, 0)), "#2b2450", 0.22 * Math.max(-n.y, 0));
const JACKET = paint((p, n) => lit(noise(p, 0.06, 2) > 0.62 ? "#3f8c4c" : "#357a40", n));
const PANTS = paint((p, n) => lit(noise(p, 0.05, 4) > 0.6 ? "#7a5a3a" : "#6c4e32", n));
const SLEEVE = paint((p, n) => lit(noise(p, 0.05, 6) > 0.6 ? "#3f8c4c" : "#357a40", n));
const HAT = paint((p, n) => lit(Math.sin(p.y * 60 + noise(p, 0.15, 5) * 4) > 0.6 ? "#a82a22" : "#d04232", n));
const LEATHER = paint((p, n) => lit(noise(p, 0.04, 9) > 0.55 ? "#7c4a28" : "#6d4122", n));
const DARKLEATHER = paint((p, n) => lit("#4d2c18", n));
const BEARD = grain(BEARD_C, "#d8d0c0", { size: 0.012, axis: "y" });
const BOOT = paint((p, n) => lit(noise(p, 0.04, 11) > 0.6 ? "#5a3520" : "#4a2b19", n));
const BLANKET = paint((p, n) => lit(Math.sin(p.x * 90) > 0.2 ? "#b8402e" : "#e8b44a", n));
const BRASS = metal("brass");
const GILT = metal("gilt");
const STEEL = metal("steel");
const COPPER = metal("copper", { verdigris: 0.3 });
const WOODGRAIN = grain("#8d5c36", "#6e4528", { size: 0.02, axis: "x" });
const PLANKS = paint((p) => ((((p.z * 100) % 14) + 14) % 14 < 0.9 ? "#3a2412" : WOODGRAIN));
const RIM = grain("#5a3a20", "#472d18", { size: 0.015, axis: "y" });

// ---------- textures ----------
const EYE = svg(
  `<svg viewBox="0 0 40 48"><ellipse cx="20" cy="24" rx="17" ry="21" fill="#fff" stroke="#2a1a14" stroke-width="3"/>
  <circle cx="22" cy="27" r="11" fill="#3a6a8a"/><circle cx="22" cy="27" r="6" fill="#12141c"/>
  <circle cx="26" cy="21" r="4" fill="#fff"/><circle cx="18" cy="33" r="2" fill="#fff"/></svg>`,
  { size: 128 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="#2a1a0a" stroke-width="12" stroke-dasharray="7.2 6.1"/>
  <circle cx="32" cy="32" r="26" fill="none" stroke="#f2c14e" stroke-width="9" stroke-dasharray="6.4 6.9"/>
  <circle cx="32" cy="32" r="19" fill="#357a40" stroke="#f2c14e" stroke-width="5"/>
  <path d="M20 44 L44 20" stroke="#2a1a0a" stroke-width="9" stroke-linecap="round"/>
  <path d="M20 44 L44 20" stroke="#e8e8f0" stroke-width="5" stroke-linecap="round"/>
  <circle cx="45" cy="19" r="5" fill="#f2c14e"/></svg>`,
  { size: 128 },
);
const BLUSH = svg(
  `<svg viewBox="0 0 40 30"><ellipse cx="20" cy="15" rx="18" ry="12" fill="#ff7a8a" opacity="0.8"/></svg>`,
  { size: 64 },
);
const GAUGE = gaugeTexture({ needle: 50, label: "STEAM" });
const PATCH = svg(
  `<svg viewBox="0 0 64 40"><rect x="2" y="2" width="60" height="36" rx="6" fill="#e8d4a0" stroke="#5a3a1a" stroke-width="3" stroke-dasharray="5 3"/>
  <text x="32" y="26" text-anchor="middle" font-family="serif" font-weight="bold" font-size="15" fill="#6a2a1a">TINKER</text></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "gnome_tinkerer" });
  const R = rng(11);
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const S = (w = 10, h = 7) => new THREE.SphereGeometry(1, w, h);
  const P = (g: THREE.BufferGeometry, color: any, bone: any, at: number[], o: any = {}) =>
    b.part(g, color, { bone, at, ...o });
  const torus = (R0: number, r: number, color: any, bone: any, at: number[], dir: number[]) =>
    b.part(new THREE.TorusGeometry(R0, r, 6, 14), color, { bone, at, dir, axis: "z", flat: true });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.32, 0], role: "spine" });
  const spine = b.joint("spine", { parent: hips, at: [0, 0.34, 0], aim: [0, 0.5, 0.01], role: "spine" });
  const chest = b.joint("chest", { parent: spine, at: [0, 0.5, 0.01], aim: [0, 0.64, 0.02], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.64, 0.02], aim: [0, 0.69, 0.03], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.69, 0.03], aim: [0, 0.85, 0.04], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.71, 0.06], aim: [0, 0.68, 0.18], role: "jaw" });

  // ---------- legs & boots ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${L}`,
      polyline([
        [s * 0.08, 0.32, 0],
        [s * 0.085, 0.17, 0.02],
        [s * 0.085, 0.05, 0],
      ]),
      { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg" },
    );
    b.sweep(leg, [0.05, 0.042], { color: PANTS });
    const ank = leg.tip!;
    P(new THREE.BoxGeometry(0.1, 0.085, 0.16), BOOT, ank, [s * 0.085, 0.0425, 0.035], { flat: true });
    P(S(8, 6), BOOT, ank, [s * 0.085, 0.04, 0.105], { scale: [0.052, 0.04, 0.05], flat: true });
    P(new THREE.CylinderGeometry(0.056, 0.058, 0.05, 8), BOOT, ank, [s * 0.085, 0.105, 0.0], { flat: true });
    torus(0.058, 0.014, "#c9a05a", ank, [s * 0.085, 0.13, 0], [0, 1, 0]);
    P(new THREE.BoxGeometry(0.1, 0.012, 0.16), "#2a1a10", ank, [s * 0.085, 0.006, 0.035]);
  }
  P(S(10, 7), PANTS, hips, [0, 0.33, 0], { scale: [0.15, 0.1, 0.12], flat: true });

  // ---------- torso ----------
  const torso = P(S(12, 9), JACKET, spine, [0, 0.47, 0], { scale: [0.17, 0.19, 0.14] });
  b.lathe(
    [
      [0, 0],
      [0.165, 0],
      [0.17, 0.012],
      [0.15, 0.14],
      [0, 0.14],
    ],
    { at: [0, 0.26, 0], bone: hips, color: JACKET, segments: 10 },
  );
  torus(0.168, 0.011, "#e8b44a", hips, [0, 0.268, 0], [0, 1, 0]);
  b.decal(torso, EMBLEM, { at: [0, 0.43, 0.137], dir: [0, 0, 1], size: [0.075, 0.075] });
  // belt
  const beltPts: number[][] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    beltPts.push([Math.sin(a) * 0.16, 0.36, Math.cos(a) * 0.16]);
  }
  b.sweep(catmull(beltPts, { closed: true }), 0.014, { color: DARKLEATHER, bone: hips, sides: 6 });
  P(new THREE.BoxGeometry(0.055, 0.045, 0.014), GILT, hips, [0, 0.36, 0.168]);
  P(new THREE.BoxGeometry(0.03, 0.025, 0.016), "#4d2c18", hips, [0, 0.36, 0.17]);
  for (const s of [1, -1]) {
    P(new THREE.BoxGeometry(0.07, 0.065, 0.02), LEATHER, hips, [s * 0.075, 0.3, 0.148], { rotation: [0, s * 25, 0] });
    P(new THREE.BoxGeometry(0.072, 0.012, 0.022), GILT, hips, [s * 0.075, 0.33, 0.15], { rotation: [0, s * 25, 0] });
  }
  // hammer on belt
  b.rod([0.17, 0.35, 0.05], [0.18, 0.22, 0.06], 0.011, "#a8743a", { bone: hips, sides: 6 });
  P(new THREE.BoxGeometry(0.03, 0.035, 0.07), STEEL, hips, [0.18, 0.2, 0.06]);
  // shoulder straps
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.09, 0.62, -0.14],
        [s * 0.09, 0.675, -0.03],
        [s * 0.1, 0.665, 0.07],
        [s * 0.1, 0.52, 0.155],
        [s * 0.09, 0.4, 0.15],
      ]),
      () => [0.024, 0.008],
      { color: LEATHER, bone: chest, section: "box" },
    );
    P(new THREE.BoxGeometry(0.035, 0.03, 0.012), GILT, chest, [s * 0.1, 0.44, 0.155]);
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const sh = [s * 0.17, 0.57, 0];
    const el = [s * 0.25, 0.42, 0.03];
    const wr = [s * 0.3, 0.29, 0.08];
    const arm = b.chain(`arm${L}`, polyline([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
    });
    b.sweep(arm, [0.052, 0.042], { color: SLEEVE });
    P(S(8, 6), SLEEVE, arm.joints[0], sh, { scale: [0.06, 0.055, 0.06], flat: true });
    P(S(6, 5), LEATHER, arm.joints[1], [s * 0.26, 0.42, 0.045], { scale: [0.035, 0.04, 0.025], flat: true });
    const w = arm.tip!;
    const d = V(wr).sub(V(el)).normalize();
    torus(0.047, 0.013, CREAM, w, V(wr).addScaledVector(d, -0.005).toArray(), d.toArray());
    const palm = V(wr).addScaledVector(d, 0.03);
    P(S(8, 6), GLOVE, w, palm.toArray(), { scale: [0.04, 0.04, 0.038], flat: true });
    for (const k of [-1, 0, 1]) {
      const base = palm.clone().add(new THREE.Vector3(0, 0, k * 0.02)).addScaledVector(d, 0.02);
      const tip = base.clone().addScaledVector(d, k === 0 ? 0.07 : 0.06);
      b.capsule(base, tip, 0.0115, GLOVE, { bone: w, sides: 6 });
    }
    const tb = palm.clone().add(new THREE.Vector3(-s * 0.03, 0.0, 0.02));
    b.capsule(tb, tb.clone().add(new THREE.Vector3(-s * 0.025, -0.025, 0.035)), 0.012, GLOVE, { bone: w, sides: 6 });
  }

  // ---------- head ----------
  P(S(8, 6), SKIN, jaw, [0, 0.69, 0.08], { scale: [0.085, 0.05, 0.075], flat: true });
  P(new THREE.CylinderGeometry(0.05, 0.06, 0.06, 8), SKIN, neck, [0, 0.66, 0.025], { flat: true });
  const headP = P(S(14, 10), SKIN, head, [0, 0.76, 0.04], { scale: [1.0 * 0.13, 0.125, 0.13] });
  P(S(8, 6), NOSE, head, [0, 0.75, 0.178], { scale: [0.042, 0.04, 0.042], flat: true });
  for (const s of [1, -1]) {
    b.decal(headP, EYE, {
      at: [s * 0.05, 0.79, 0.15],
      dir: [s * 0.15, 0.05, 1],
      size: [0.048, 0.058],
    });
    b.decal(headP, BLUSH, { at: [s * 0.085, 0.74, 0.125], dir: [s * 0.5, 0, 1], size: [0.04, 0.03] });
    b.capsule([s * 0.022, 0.838, 0.146], [s * 0.088, 0.846, 0.098], 0.013, BEARD, { bone: head, sides: 6 });
    b.spike([s * 0.115, 0.77, 0.03], [s * 0.21, 0.845, -0.005], null, 0.036, {
      color: SKIN,
      bone: head,
      section: { ngon: 5 },
    });
    b.spike([s * 0.12, 0.74, 0.02], [s * 0.135, 0.65, 0.05], null, 0.026, {
      color: BEARD,
      bone: head,
      section: { ngon: 5 },
    });
    b.sweep(
      catmull([
        [s * 0.005, 0.725, 0.172],
        [s * 0.04, 0.713, 0.183],
        [s * 0.085, 0.72, 0.152],
        [s * 0.112, 0.742, 0.122],
      ]),
      [0.024, 0.008],
      { color: BEARD, bone: jaw, sides: 6 },
    );
  }
  // beard: layered strands
  P(S(8, 6), BEARD, jaw, [0, 0.69, 0.1], { scale: [0.115, 0.09, 0.085], flat: true });
  const strands = [
    [[-0.09, 0.7, 0.09], [-0.11, 0.58, 0.15]],
    [[-0.05, 0.68, 0.12], [-0.065, 0.53, 0.18]],
    [[0.0, 0.67, 0.14], [0.0, 0.5, 0.185]],
    [[0.05, 0.68, 0.12], [0.065, 0.53, 0.18]],
    [[0.09, 0.7, 0.09], [0.11, 0.58, 0.15]],
    [[-0.025, 0.68, 0.13], [-0.032, 0.55, 0.19]],
    [[0.025, 0.68, 0.13], [0.032, 0.55, 0.19]],
  ];
  for (const [a, t] of strands) b.spike(a, t, null, 0.042, { color: BEARD, bone: jaw, section: { ngon: 5 } });

  // ---------- hat ----------
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.205, 0.02],
      [0.12, 0.04],
      [0.108, 0.05],
      [0.097, 0.12],
      [0.065, 0.24],
      [0.045, 0.3],
      [0, 0.3],
    ],
    { at: [0, 0.86, 0.03], bone: head, color: HAT, segments: 10 },
  );
  b.sweep(
    catmull([
      [0, 1.15, 0.03],
      [0, 1.22, 0.025],
      [0.03, 1.28, -0.02],
      [0.09, 1.3, -0.08],
    ]),
    [0.047, 0.0],
    { color: HAT, bone: head, caps: { start: "none", end: "point" }, sides: 8 },
  );
  P(S(6, 5), GILT, head, [0.09, 1.3, -0.08], { scale: [0.024, 0.024, 0.024], flat: true });
  torus(0.113, 0.014, DARKLEATHER, head, [0, 0.91, 0.03], [0, 1, 0]);
  for (const s of [1, -1]) {
    const dir = [s * 0.15, 0.15, 1];
    P(new THREE.CylinderGeometry(0.037, 0.037, 0.03, 10), BRASS, head, [s * 0.058, 0.94, 0.125], { dir });
    const lens = b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.036, 10), "#7fe8ff", {
      bone: head,
      at: [s * 0.058, 0.94, 0.131],
      dir,
    });
    glow(lens, 0.9);
  }
  P(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 8), BRASS, head, [0, 0.94, 0.133], { dir: [0, 0.1, 1] });
  P(gearGeometry({ teeth: 12, module: 0.003, thickness: 0.008 }), GILT, head, [0, 0.945, 0.14], { dir: [0, 0.15, 1] });

  // ---------- backpack ----------
  const packPaint = panelled(LEATHER, { size: 0.08, rivets: 0.025 });
  P(new THREE.BoxGeometry(0.3, 0.32, 0.16), packPaint, chest, [0, 0.49, -0.21]);
  P(new THREE.BoxGeometry(0.32, 0.06, 0.18), DARKLEATHER, chest, [0, 0.665, -0.21]);
  b.decal(torso, PATCH, { at: [0, 0.3, 0], dir: [0, 0, 1], size: [0.001, 0.001] });
  for (const s of [1, -1]) {
    P(new THREE.BoxGeometry(0.07, 0.12, 0.1), DARKLEATHER, chest, [s * 0.185, 0.42, -0.215]);
    P(new THREE.BoxGeometry(0.075, 0.015, 0.105), GILT, chest, [s * 0.185, 0.48, -0.215]);
  }
  // blanket roll
  P(new THREE.CylinderGeometry(0.055, 0.055, 0.32, 10), BLANKET, chest, [0, 0.74, -0.2], { dir: [1, 0, 0], flat: true });
  for (const x of [-0.09, 0.09]) torus(0.057, 0.008, DARKLEATHER, chest, [x, 0.74, -0.2], [1, 0, 0]);
  // gears on the back
  gearTrain(b, {
    at: [0, 0.46, -0.295],
    axis: [0, 0, -1],
    module: 0.008,
    bone: chest,
    spin: "gear",
    gears: [{ teeth: 16, spokes: 4 }, { teeth: 10, angle: 70 }, { teeth: 12, angle: -120, holes: 3 }],
  });
  // gauge
  P(new THREE.CylinderGeometry(0.046, 0.046, 0.014, 14), GILT, chest, [-0.08, 0.585, -0.295], { dir: [0, 0, -1] });
  b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", {
    bone: chest,
    at: [-0.08, 0.585, -0.303],
    dir: [0, 0, -1],
    axis: "z",
    texture: GAUGE,
  });
  // patch on pack lid side
  b.part(new THREE.PlaneGeometry(0.1, 0.0625), "#ffffff", {
    bone: chest,
    at: [0, 0.665, -0.1195],
    dir: [0, 0, 1],
    axis: "z",
    texture: PATCH,
  });
  // wrench
  b.extrude(
    [
      [-0.014, 0],
      [0.014, 0],
      [0.014, 0.19],
      [0.035, 0.215],
      [0.035, 0.26],
      [0.012, 0.275],
      [0.012, 0.235],
      [-0.012, 0.235],
      [-0.012, 0.275],
      [-0.035, 0.26],
      [-0.035, 0.215],
      [-0.014, 0.19],
    ],
    { at: [0.185, 0.46, -0.215], x: [1, 0, 0], y: [0.15, 1, 0], thickness: 0.012, color: STEEL, bone: chest },
  );
  // telescope
  const teleP = catmull([
    [-0.185, 0.45, -0.215],
    [-0.2, 0.62, -0.23],
    [-0.23, 0.82, -0.26],
  ]);
  b.sweep(teleP, (t) => 0.026 + 0.012 * t, {
    color: BRASS,
    bone: chest,
    bands: [
      [0.4, BRASS],
      [0.5, "#6b3f22"],
      [1, COPPER],
    ],
    caps: "flat",
    sides: 8,
  });
  P(new THREE.CylinderGeometry(0.046, 0.046, 0.016, 8), GILT, chest, [-0.23, 0.82, -0.26], {
    dir: teleP.tangentAt(1).toArray(),
  });
  glow(
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.01, 8), "#9ff0ff", {
      bone: chest,
      at: V([-0.23, 0.82, -0.26]).addScaledVector(teleP.tangentAt(1), 0.01).toArray(),
      dir: teleP.tangentAt(1).toArray(),
    }),
  );
  // propeller
  b.rod([0.09, 0.66, -0.28], [0.09, 0.83, -0.28], 0.009, STEEL, { bone: chest, sides: 6 });
  const blade = [
    [-0.09, 0, "sharp"],
    [0, 0.018],
    [0.09, 0, "sharp"],
    [0, -0.018],
  ] as any;
  b.extrude(blade, { at: [0.09, 0.835, -0.28], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.004, color: "#e8b44a", bone: chest });
  b.extrude(blade, { at: [0.09, 0.835, -0.28], x: [0, 0, 1], y: [1, 0, 0], thickness: 0.004, color: "#c9382a", bone: chest });
  P(S(6, 5), GILT, chest, [0.09, 0.84, -0.28], { scale: [0.014, 0.014, 0.014], flat: true });
  // spring
  const spring = catmull([
    [-0.1, 0.4, -0.3],
    [-0.1, 0.5, -0.3],
  ]);
  void spring;
  b.sweep(
    polyline([
      [0.07, 0.6, -0.295],
      [0.12, 0.62, -0.295],
    ]),
    0.006,
    { color: BRASS, bone: chest, sides: 5 },
  );

  // ---------- base & props ----------
  const base = b.lathe(
    [
      [0, 0],
      [0.52, 0],
      [0.52, 0.02],
      [0.5, 0.025],
      [0, 0.025],
    ],
    { at: [0, 0, 0], bone: hips, color: PLANKS, segments: 20 },
  );
  void base;
  torus(0.51, 0.018, RIM, hips, [0, 0.022, 0], [0, 1, 0]);
  // floor gears
  gearTrain(b, {
    at: [-0.28, 0.037, 0.2],
    axis: [0, 1, 0],
    module: 0.01,
    bone: hips,
    arbor: false,
    gears: [{ teeth: 18, spokes: 4, bore: 0.008 }, { teeth: 10, angle: 160 }],
  });
  // lantern
  const LX = 0.3;
  const LZ = 0.22;
  P(new THREE.CylinderGeometry(0.055, 0.06, 0.02, 6), BRASS, hips, [LX, 0.035, LZ], { flat: true });
  glow(
    b.lathe(
      [
        [0, 0],
        [0.045, 0],
        [0.052, 0.09],
        [0, 0.09],
      ],
      { at: [LX, 0.045, LZ], bone: hips, color: "#ffb347", segments: 6 },
    ),
    1.3,
  );
  glow(b.part(S(6, 5), "#fff2a0", { bone: hips, at: [LX, 0.085, LZ], scale: [0.02, 0.03, 0.02], flat: true }), 2);
  P(new THREE.ConeGeometry(0.068, 0.05, 6), BRASS, hips, [LX, 0.16, LZ], { flat: true });
  torus(0.03, 0.006, BRASS, hips, [LX, 0.2, LZ], [1, 0, 0]);
  // toolbox
  P(new THREE.BoxGeometry(0.17, 0.08, 0.09), paint((p, n) => lit("#c23a2c", n)), hips, [0.3, 0.065, -0.25], { rotation: [0, 20, 0] });
  P(new THREE.BoxGeometry(0.175, 0.012, 0.095), GILT, hips, [0.3, 0.1, -0.25], { rotation: [0, 20, 0] });
  b.sweep(
    catmull([
      [0.34, 0.1, -0.26],
      [0.34, 0.135, -0.26],
      [0.26, 0.135, -0.24],
      [0.26, 0.1, -0.24],
    ]),
    0.006,
    { color: STEEL, bone: hips, sides: 5 },
  );
  // mushrooms
  const CAP = spots("#d94130", "#fff3dc", { size: 0.04, amount: 0.5 });
  for (const [mx, mz, sc] of [
    [-0.3, -0.28, 1],
    [-0.38, -0.2, 0.6],
  ]) {
    P(new THREE.CylinderGeometry(0.02 * sc, 0.025 * sc, 0.07 * sc, 6), CREAM, hips, [mx, 0.025 + 0.035 * sc, mz], { flat: true });
    b.lathe(
      [
        [0, 0],
        [0.07 * sc, 0],
        [0.065 * sc, 0.02 * sc],
        [0.04 * sc, 0.045 * sc],
        [0, 0.055 * sc],
      ],
      { at: [mx, 0.025 + 0.065 * sc, mz], bone: hips, color: CAP, segments: 8 },
    );
  }
  // scattered nuts and bolts
  for (let i = 0; i < 6; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.18 + R() * 0.27;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (Math.abs(x) < 0.2 && z > -0.1 && z < 0.2) continue;
    if (Math.hypot(x - -0.28, z - 0.2) < 0.16 || Math.hypot(x - LX, z - LZ) < 0.1 || Math.hypot(x - 0.3, z + 0.25) < 0.12) continue;
    P(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 6), i % 2 ? STEEL : BRASS, hips, [x, 0.031, z], { flat: true });
  }

  return b.root;
}
