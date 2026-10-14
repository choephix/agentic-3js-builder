```ts
import * as THREE from "three";
import {
  bezier,
  catmull,
  createBuilder,
  grain,
  line,
  mottle,
  noise,
  paint,
  svg,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Battle-worn griffin knight",
  description:
    "A plate-armoured knight: great helm with a crimson plume, gold-etched pauldrons, a blue surcoat bearing a silver griffin, a kite shield, a broadsword and a torn crimson cape.",
};

// ---- palette ---------------------------------------------------------------
const STEEL = "#aab2bb";
const STEEL_DARK = "#5a6270";
const STEEL_SHADOW = "#2c323c";
const STEEL_BRIGHT = "#e3e8ee";
const GOLD = "#e2b345";
const BLUE = "#23407f";
const BLUE_DARK = "#14265a";
const BLUE_SCUFF = "#4d6496";
const CRIMSON = "#a8152a";
const CRIMSON_DARK = "#5e0b18";
const PLUME = "#c51f36";
const LEATHER = "#4a2e1c";
const SLIT = "#060607";

// ---- drawings --------------------------------------------------------------
const GRIFFIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="M74 62 Q94 62 90 46 Q89 40 94 34" stroke="#131b36" stroke-width="7"/>
<path d="M74 62 Q94 62 90 46 Q89 40 94 34" stroke="#e9eff5" stroke-width="3.6"/>
<path d="M64 64 L76 74 L70 86 L82 90" stroke="#131b36" stroke-width="9"/>
<path d="M64 64 L76 74 L70 86 L82 90" stroke="#e9eff5" stroke-width="5.4"/>
<path d="M46 62 L38 74 L32 84 L24 86" stroke="#131b36" stroke-width="8"/>
<path d="M46 62 L38 74 L32 84 L24 86" stroke="#e9eff5" stroke-width="4.6"/>
<path d="M46 50 L36 34" stroke="#131b36" stroke-width="13"/>
<path d="M46 50 L36 34" stroke="#e9eff5" stroke-width="9"/>
<path d="M82 90 L87 92 M24 86 L19 88" stroke="#131b36" stroke-width="2.2"/>
</g>
<circle cx="94" cy="33" r="4" fill="#e9eff5" stroke="#131b36" stroke-width="1.6"/>
<ellipse cx="56" cy="58" rx="19" ry="11" transform="rotate(-22 56 58)" fill="#e9eff5" stroke="#131b36" stroke-width="2"/>
<path d="M48 48 C50 30 62 14 92 6 C86 14 84 20 86 26 C92 22 96 22 100 22 C94 32 92 38 92 46 C86 44 82 44 78 46 C74 52 66 56 56 56 Z" fill="#e9eff5" stroke="#131b36" stroke-width="2" stroke-linejoin="round"/>
<path d="M62 42 Q74 30 88 24 M68 50 Q80 40 94 36 M74 52 Q84 46 92 46" fill="none" stroke="#131b36" stroke-width="1.8" stroke-linecap="round"/>
<circle cx="34" cy="28" r="8" fill="#e9eff5" stroke="#131b36" stroke-width="2"/>
<path d="M27 24 Q15 22 13 31 Q17 29 21 33 L27 30 Z" fill="#e9eff5" stroke="#131b36" stroke-width="2" stroke-linejoin="round"/>
<path d="M36 21 Q44 16 46 24" fill="none" stroke="#131b36" stroke-width="1.6" stroke-linecap="round"/>
<circle cx="31" cy="26" r="1.8" fill="#131b36"/>
</svg>`;

const FILIGREE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60">
<g fill="none" stroke="#f3cc62" stroke-width="2.6" stroke-linecap="round">
<path d="M4 34 Q18 8 34 30 T64 30 T94 30 T116 34"/>
<path d="M34 30 C28 22 34 14 42 18 C48 22 42 28 38 24"/>
<path d="M94 30 C100 38 94 46 86 42 C80 38 86 32 90 36"/>
<circle cx="18" cy="14" r="5"/>
<circle cx="60" cy="48" r="5"/>
<circle cx="102" cy="14" r="5"/>
</g>
<g fill="#f3cc62"><circle cx="64" cy="30" r="2.6"/><circle cx="18" cy="30" r="2"/></g>
</svg>`;

const griffin = svg(GRIFFIN_SVG, { size: 256 });
const filigree = svg(FILIGREE_SVG, { size: 256 });

// ---- helpers ---------------------------------------------------------------
const DEG = Math.PI / 180;
const onHelm = (deg: number, y: number) =>
  new THREE.Vector3(0.166 * Math.sin(deg * DEG), y, 0.166 * Math.cos(deg * DEG));

const near = (p: THREE.Vector3, a: THREE.Vector3, c: THREE.Vector3, r: number) => {
  const ac = c.clone().sub(a);
  const t = Math.min(1, Math.max(0, p.clone().sub(a).dot(ac) / ac.lengthSq()));
  return p.distanceTo(a.clone().addScaledVector(ac, t)) < r;
};

const ellipse = (y: number, rx: number, rz: number, n: number): number[][] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [rx * Math.sin(a), y, rz * Math.cos(a)];
  });

// ---- paints (battle wear lives here: scuffs, scratches, dents) -------------
const STEEL_BASE = mottle(STEEL, STEEL_DARK, { size: 0.09, contrast: 0.5, seed: 4 });
const ARMOUR = paint((p) => (noise(p, 0.018, 7) > 0.72 ? STEEL_SHADOW : STEEL_BASE));

const HELM_BASE = grain(STEEL, STEEL_DARK, { size: 0.012, axis: "y", seed: 3 });
const HELM_DENT = onHelm(-12, 1.5);
const HELM_SCRATCHES: [THREE.Vector3, THREE.Vector3][] = [
  [onHelm(-38, 1.52), onHelm(-22, 1.6)],
  [onHelm(18, 1.5), onHelm(34, 1.56)],
  [onHelm(40, 1.66), onHelm(52, 1.64)],
];
const HELM = paint((p) => {
  if (p.distanceTo(HELM_DENT) < 0.035) return STEEL_SHADOW;
  for (const [a, c] of HELM_SCRATCHES) if (near(p, a, c, 0.0035)) return STEEL_BRIGHT;
  return HELM_BASE;
});

const SHIELD_BASE = mottle(BLUE, BLUE_DARK, { size: 0.12, contrast: 0.5, seed: 9 });
const SHIELD_DENT = new THREE.Vector3(0.6, 1.08, 0.25);
const SHIELD = paint((p) => {
  if (p.distanceTo(SHIELD_DENT) < 0.05) return BLUE_DARK;
  if (noise(p, 0.015, 5) > 0.78) return BLUE_SCUFF;
  return SHIELD_BASE;
});

const SURCOAT = mottle(BLUE, BLUE_DARK, { size: 0.3, contrast: 0.35, seed: 5 });
const CAPE = grain(CRIMSON, CRIMSON_DARK, { size: 0.05, axis: "y", seed: 6 });
const BLADE = grain(STEEL_BRIGHT, STEEL, { size: 0.012, axis: "y", seed: 2 });

// ---- rest-pose geometry ----------------------------------------------------
const LEG_R = [[-0.11, 0.98, 0], [-0.12, 0.52, 0.03], [-0.11, 0.11, 0], [-0.11, 0.04, 0.13]];
const LEG_L = [[0.11, 0.98, 0], [0.12, 0.52, 0.03], [0.11, 0.11, 0], [0.11, 0.04, 0.13]];
const ARM_R = [[-0.22, 1.4, 0], [-0.28, 1.12, 0.03], [-0.31, 0.92, 0.08], [-0.32, 0.86, 0.11]];
const ARM_L = [[0.22, 1.4, 0], [0.3, 1.06, 0.04], [0.37, 0.99, 0.14], [0.42, 0.95, 0.19]];

const CAPE_TOP = [[-0.2, 1.4, -0.1], [-0.12, 1.42, -0.15], [0, 1.41, -0.16], [0.12, 1.42, -0.15], [0.2, 1.4, -0.1]];
const CAPE_HEM = [
  [-0.25, 0.46, -0.2], [-0.21, 0.34, -0.2], [-0.16, 0.5, -0.21], [-0.11, 0.3, -0.2],
  [-0.05, 0.44, -0.22], [0, 0.26, -0.21], [0.05, 0.42, -0.21], [0.11, 0.31, -0.2],
  [0.17, 0.48, -0.2], [0.22, 0.36, -0.2], [0.26, 0.45, -0.19],
];

const KITE_CORNERS = [[-0.28, 0.4], [0.28, 0.4], [0.28, 0.08], [-0.28, 0.08], [0, -0.5]];

const kite = (k: number): OutlinePoint[] => [
  [-0.28 * k, 0.4 * k, "sharp"],
  [0.28 * k, 0.4 * k, "sharp"],
  [0.28 * k, 0.08 * k],
  [0, -0.5 * k, "sharp"],
  [-0.28 * k, 0.08 * k],
];

const bladeOutline: OutlinePoint[] = [
  [-0.032, 0],
  [0.032, 0],
  [0.032, -0.72],
  [0, -0.82, "sharp"],
  [-0.032, -0.72],
];

export default function build() {
  const b = createBuilder({ name: "griffin-knight" });

  // ---- skeleton -------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.98, 0], dir: [0, 1, 0], role: "spine" });
  const waist = b.joint("waist", { parent: hips, at: [0, 1.1, 0], dir: [0, 1, 0], role: "spine" });
  const chest = b.joint("chest", { parent: waist, at: [0, 1.26, 0], dir: [0, 1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 1.42, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.6, 0], dir: [0, 1, 0], role: "head" });

  const legR = b.chain("legR", catmull(LEG_R), {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.11, 0, 0.1],
  });
  const legL = b.chain("legL", catmull(LEG_L), {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.11, 0, 0.1],
  });
  const armR = b.chain("armR", catmull(ARM_R), {
    parent: chest,
    names: ["shoulderR", "elbowR", "wristR", "handR"],
    role: "arm",
  });
  const armL = b.chain("armL", catmull(ARM_L), {
    parent: chest,
    names: ["shoulderL", "elbowL", "wristL", "handL"],
    role: "arm",
  });

  // ---- great helm -----------------------------------------------------------
  const helm = b.lathe(
    [
      [0, 1.45],
      [0.165, 1.45],
      [0.165, 1.71],
      [0.15, 1.75],
      [0, 1.75],
    ],
    { at: [0, 0, 0], bone: head, segments: 10, color: HELM },
  );
  const helmHit = (x: number, y: number) => b.surface(helm).ray([x, y, 1], [0, 0, -1]);

  const slit = helmHit(0, 1.6);
  if (slit) b.stick(new THREE.BoxGeometry(0.12, 0.012, 0.016), SLIT, slit, { embed: 0.3 });
  const brow = helmHit(0, 1.66);
  if (brow) b.stick(new THREE.BoxGeometry(0.15, 0.022, 0.02), STEEL_BRIGHT, brow, { embed: 0.3 });
  for (const [x, y] of [
    [-0.05, 1.5],
    [0, 1.5],
    [0.05, 1.5],
    [-0.025, 1.47],
    [0.025, 1.47],
  ]) {
    const hole = helmHit(x, y);
    if (hole) b.stick(new THREE.CylinderGeometry(0.007, 0.007, 0.01, 6), SLIT, hole, { embed: 0.2 });
  }

  b.sweep(catmull(ellipse(1.455, 0.173, 0.173, 16), { closed: true }), 0.008, { bone: head, color: GOLD });

  // ---- crimson plume: a socket and a fan of horsehair strands ---------------
  b.part(new THREE.CylinderGeometry(0.03, 0.036, 0.035, 8), GOLD, {
    bone: head,
    at: [0, 1.7675, 0],
    flat: true,
  });
  for (let i = 0; i < 9; i++) {
    const x = (i - 4) * 0.009;
    const bend = (i - 4) * 0.004;
    b.sweep(
      bezier([x * 0.5, 1.77, 0], [x * 1.2, 1.98, -0.02], [x * 1.4 + bend, 2.08, -0.16], [x * 1.8, 1.97, -0.42]),
      [0.017, 0.004],
      { bone: head, color: PLUME },
    );
  }
  b.sweep(
    bezier([0, 1.77, 0], [0, 1.98, -0.02], [0, 2.08, -0.17], [0, 1.96, -0.44]),
    [0.026, 0.006],
    { bone: head, color: PLUME },
  );

  // ---- gorget ---------------------------------------------------------------
  b.lathe(
    [
      [0, 1.29],
      [0.17, 1.29],
      [0.165, 1.36],
      [0.15, 1.44],
      [0, 1.44],
    ],
    { at: [0, 0, 0], bone: neck, segments: 12, color: ARMOUR },
  );
  b.sweep(catmull(ellipse(1.37, 0.166, 0.166, 14), { closed: true }), 0.005, { bone: neck, color: GOLD });

  // ---- blue surcoat over the torso -----------------------------------------
  const surcoat = b.loft(
    [
      { at: [0, 0.82, 0], w: 0.44, h: 0.3 },
      { at: [0, 0.98, 0], w: 0.36, h: 0.26 },
      { at: [0, 1.1, 0], w: 0.3, h: 0.22 },
      { at: [0, 1.26, 0], w: 0.36, h: 0.25 },
      { at: [0, 1.38, 0], w: 0.3, h: 0.2 },
    ],
    { bone: [hips, waist, chest], color: SURCOAT, caps: "flat" },
  );
  const chestHit = b.surface(surcoat).ray([0, 1.22, 1], [0, 0, -1]);
  if (chestHit) b.decal(surcoat, griffin, { at: chestHit, dir: [0, 0, 1], size: [0.22, 0.22] });

  b.sweep(catmull(ellipse(0.83, 0.224, 0.164, 18), { closed: true }), 0.011, { bone: hips, color: GOLD });
  b.sweep(catmull(ellipse(1.1, 0.158, 0.118, 16), { closed: true }), 0.017, { bone: waist, color: LEATHER });
  b.part(new THREE.BoxGeometry(0.05, 0.05, 0.02), GOLD, { bone: waist, at: [0, 1.1, 0.143], flat: true });

  // ---- torn crimson cape hanging from the shoulders ------------------------
  b.membrane(CAPE_TOP, CAPE_HEM, { color: CAPE, thickness: 0.012, rows: 6, cols: 16, bone: chest });

  // ---- arms, pauldrons, legs -----------------------------------------------
  const armRadius = (t: number) =>
    t < 0.47 ? 0.056 - 0.01 * (t / 0.47) : 0.046 - 0.006 * Math.min(1, (t - 0.47) / 0.34);
  const legRadius = (t: number) =>
    t < 0.45 ? 0.088 - 0.012 * (t / 0.45) : 0.076 - 0.018 * Math.min(1, (t - 0.45) / 0.42);

  for (const s of [-1, 1]) {
    const arm = s < 0 ? armR : armL;
    const leg = s < 0 ? legR : legL;
    const elbow = s < 0 ? ARM_R[1] : ARM_L[1];
    const knee = s < 0 ? LEG_R[1] : LEG_L[1];
    const cx = s * 0.22;
    const sh = s < 0 ? armR.joints[0] : armL.joints[0];

    // arm and elbow cop
    b.sweep(arm, armRadius, { section: { ngon: 8 }, color: ARMOUR });
    b.part(new THREE.SphereGeometry(0.058, 8, 6), ARMOUR, { bone: arm.joints[1], at: elbow, flat: true });

    // cuisse + greave, poleyn, sabaton
    b.sweep(leg, legRadius, { to: 0.87, section: { ngon: 8 }, color: ARMOUR });
    b.part(new THREE.SphereGeometry(0.062, 8, 6).scale(1, 1.1, 0.6), ARMOUR, {
      bone: leg.joints[1],
      at: [knee[0], knee[1], knee[2] + 0.05],
      flat: true,
    });
    b.frustumBox([s * 0.11, 0.05, -0.03], [s * 0.11, 0.05, 0.17], [0.1, 0.1], [0.075, 0.075], {
      bone: leg.joints[2],
      color: ARMOUR,
    });

    // layered pauldron: domed cap, gold-trimmed lames
    const plate = (y0: number, y1: number, r0: number, r1: number, gold = false) =>
      b.lathe([[0, y0], [r0, y0], [r1, y1], [0, y1]], {
        at: [cx, 0, 0],
        bone: sh,
        segments: 10,
        color: gold ? GOLD : ARMOUR,
      });

    b.lathe(
      [
        [0, 1.5],
        [0.07, 1.5],
        [0.092, 1.48],
        [0.1, 1.44],
        [0, 1.44],
      ],
      { at: [cx, 0, 0], bone: sh, segments: 10, color: ARMOUR },
    );
    plate(1.44, 1.435, 0.102, 0.102, true);
    const midLame = plate(1.435, 1.38, 0.104, 0.122);
    plate(1.38, 1.375, 0.124, 0.124, true);
    const lowLame = plate(1.375, 1.32, 0.126, 0.138);

    // gold filigree etched on the flanks
    const flank = b.surface(midLame).ray([cx + s * 0.5, 1.41, 0], [-s, 0, 0]);
    if (flank) b.decal(midLame, filigree, { at: flank, dir: [s, 0, 0], size: [0.13, 0.065] });
    const flank2 = b.surface(lowLame).ray([cx + s * 0.5, 1.35, 0], [-s, 0, 0]);
    if (flank2) b.decal(lowLame, filigree, { at: flank2, dir: [s, 0, 0], size: [0.1, 0.05] });

    // gold rivets along the trims
    b.ring(line([cx, 1.4375, 0], [cx, 1.5, 0]), { count: 10, radius: 0.104 }, (it) => {
      b.stick(new THREE.SphereGeometry(0.0065, 6, 4), GOLD, it, { embed: 0.4 });
    });
    b.ring(line([cx, 1.3775, 0], [cx, 1.45, 0]), { count: 12, radius: 0.124 }, (it) => {
      b.stick(new THREE.SphereGeometry(0.0065, 6, 4), GOLD, it, { embed: 0.4 });
    });
  }

  // ---- broadsword in the right hand -----------------------------------------
  const HILT = [-0.32, 0.84, 0.11];
  b.extrude(bladeOutline, {
    at: HILT,
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.006, 0.022],
    color: BLADE,
    bone: armR.joints[3],
  });
  b.part(new THREE.BoxGeometry(0.25, 0.03, 0.045), GOLD, {
    bone: armR.joints[3],
    at: [-0.32, 0.835, 0.11],
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.017, 0.017, 0.1, 6), LEATHER, {
    bone: armR.joints[3],
    at: [-0.32, 0.9, 0.11],
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.078, 0.1, 0.072), ARMOUR, {
    bone: armR.joints[3],
    at: [-0.32, 0.9, 0.11],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, {
    bone: armR.joints[3],
    at: [-0.32, 0.965, 0.11],
    flat: true,
  });

  // ---- tall kite shield on the left arm -------------------------------------
  const shieldBone = armL.joints[2];
  b.extrude(kite(1.075), {
    at: [0.44, 0.95, 0.235],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    bevel: 0.006,
    smoothing: 1,
    color: GOLD,
    bone: shieldBone,
  });
  const field = b.extrude(kite(1), {
    at: [0.44, 0.95, 0.245],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.02,
    bevel: 0.004,
    smoothing: 1,
    color: SHIELD,
    bone: shieldBone,
  });
  const shieldHit = b.surface(field).ray([0.44, 0.95, 1], [0, 0, -1]);
  if (shieldHit) b.decal(field, griffin, { at: shieldHit, dir: [0, 0, 1], size: [0.44, 0.44] });
  for (const [x, y] of KITE_CORNERS) {
    b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, {
      bone: shieldBone,
      at: [0.44 + x * 1.04, 0.95 + y * 1.04, 0.25],
      flat: true,
    });
  }

  return b.root;
}
```