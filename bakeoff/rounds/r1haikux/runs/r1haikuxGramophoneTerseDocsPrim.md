```ts
import * as THREE from "three";
import { catmull, createBuilder, grain, paint, svg } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "gramophone",
  description:
    "A mahogany cabinet gramophone with a flared brass horn and bell, a turntable carrying a record, a tone arm with needle and a winding crank.",
};

// ---- palette ----------------------------------------------------------------
const MAHOGANY = "#5e2c14";
const MAHOGANY_LIGHT = "#8c4a25";
const MAHOGANY_DARK = "#3c1a09";
const BRASS = "#c9953c";
const BRASS_LIGHT = "#efc97a";
const BRASS_DARK = "#7a5118";
const BELL_INSIDE = "#2e1a0a";
const EBONITE = "#201510";
const STEEL = "#c4c9cf";
const RECORD = "#2a2a33";
const RECORD_DARK = "#0c0c10";
const CLOTH = "#d8b76c";
const DOT = "#3a1c0b";
const RED = "#9c2121";

// ---- profiles (metres) ------------------------------------------------------
// Turned bun foot: solid, from the axis out and back.
const FOOT: OutlinePoint[] = [
  [0, 0],
  [0.03, 0],
  [0.036, 0.012],
  [0.03, 0.026],
  [0.02, 0.034],
  [0, 0.04],
];

// Turntable platter: a brass plate with a raised rim.
const PLATTER: OutlinePoint[] = [
  [0, 0],
  [0.14, 0],
  [0.14, 0.008],
  [0.134, 0.014],
  [0, 0.014],
];

// Horn bell: a thin flared shell, x = radius, y = along the horn axis.
const BELL_SHAPE: OutlinePoint[] = [
  [0.04, 0.0],
  [0.058, 0.012],
  [0.085, 0.045],
  [0.128, 0.097],
  [0.172, 0.163],
  [0.206, 0.217],
  [0.224, 0.248],
  [0.204, 0.252],
  [0.182, 0.22],
  [0.14, 0.16],
  [0.1, 0.1],
  [0.062, 0.05],
  [0.034, 0.014],
  [0.03, 0.0],
];

/** A counter-clockwise rounded rectangle centred on the origin. */
function roundRect(w: number, h: number, r: number, seg: number): OutlinePoint[] {
  const pts: OutlinePoint[] = [];
  const hx = w / 2 - r;
  const hy = h / 2 - r;
  const corners: [number, number, number][] = [
    [hx, hy, 0],
    [-hx, hy, 90],
    [-hx, -hy, 180],
    [hx, -hy, 270],
  ];
  for (const [cx, cy, a0] of corners) {
    for (let k = 0; k <= seg; k++) {
      const a = ((a0 + (90 * k) / seg) * Math.PI) / 180;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  }
  return pts;
}

/** Speaker grille: cloth disc with radial rings of dots. */
function grilleSvg(): string {
  const rings: [number, number][] = [
    [14, 6],
    [24, 12],
    [34, 18],
    [44, 24],
  ];
  let dots = "";
  rings.forEach(([radius, count], ring) => {
    for (let k = 0; k < count; k++) {
      const a = (k / count) * Math.PI * 2 + (ring % 2 ? Math.PI / count : 0);
      const x = 50 + radius * Math.cos(a);
      const y = 50 + radius * Math.sin(a);
      const r = 2.6 + ring * 0.3;
      dots += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r.toFixed(2)}" fill="${DOT}"/>`;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${CLOTH}"/>${dots}<circle cx="50" cy="50" r="6" fill="${DOT}"/></svg>`;
}

/** Record label: red disc, brass ring, "78 RPM". */
const LABEL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${RED}"/><circle cx="50" cy="50" r="41" fill="none" stroke="${BRASS_LIGHT}" stroke-width="2.6"/><text x="50" y="40" font-family="Georgia, serif" font-size="20" font-weight="bold" text-anchor="middle" fill="${BRASS_LIGHT}">78</text><text x="50" y="66" font-family="Georgia, serif" font-size="7" text-anchor="middle" fill="${BRASS_LIGHT}">RPM</text><circle cx="50" cy="50" r="4.5" fill="${EBONITE}"/></svg>`;

export default function build() {
  const b = createBuilder({ name: "gramophone" });

  // ---- textures and paints --------------------------------------------------
  const grilleTex = svg(grilleSvg(), { size: 256 });
  const labelTex = svg(LABEL_SVG, { size: 128 });
  const wood = grain(MAHOGANY_LIGHT, MAHOGANY_DARK, { size: 0.016, axis: "x", seed: 3 });
  const woodTop = grain(MAHOGANY_LIGHT, MAHOGANY_DARK, { size: 0.016, axis: "z", seed: 8 });
  const woodDark = grain(MAHOGANY_DARK, "#26110a", { size: 0.012, axis: "x", seed: 5 });

  const TT_Z = 0.03; // turntable centre, forward of the cabinet's middle

  // Record grooves: concentric rings read from the model-space point.
  const grooves = paint((p) => {
    const r = Math.hypot(p.x, p.z - TT_Z);
    return Math.sin((r / 0.008) * Math.PI * 2) > 0.2 ? RECORD : RECORD_DARK;
  });

  // The horn: a tube from inside the lid, rising and bending forward.
  const hornPath = catmull([
    [0, 0.37, -0.15],
    [0, 0.44, -0.165],
    [0, 0.55, -0.13],
    [0, 0.63, -0.04],
    [0, 0.69, 0.07],
  ]);
  const hornEnd = hornPath.at(1);
  const bellAxis = hornPath.tangentAt(1).clone().normalize();

  // Bell: bright lip, dark interior (inner walls face into the bell), a banded engraving.
  const bellSkin = paint((_p, n, s) => {
    if (s[0] > 0.235) return BRASS_LIGHT;
    if (n.y * bellAxis.y + n.z * bellAxis.z > 0.2) return BELL_INSIDE;
    if (s[0] > 0.06 && s[0] < 0.074) return BRASS_DARK;
    return BRASS;
  });

  // ---- skeleton ---------------------------------------------------------------
  const body = b.joint("body", { at: [0, 0, 0] });
  const turntable = b.joint("turntable", { parent: body, at: [0, 0.38, TT_Z] });
  const arm = b.joint("tonearm", { parent: body, at: [0.13, 0.38, -0.13] });
  const horn = b.joint("horn", { parent: body, at: [0, 0.38, -0.15] });
  const crank = b.joint("crank", { parent: body, at: [0.2, 0.21, -0.06] });

  // ---- base and cabinet -------------------------------------------------------
  for (const s of [-1, 1]) {
    for (const f of [-1, 1]) {
      b.lathe(FOOT, { at: [s * 0.18, 0, f * 0.15], bone: body, color: MAHOGANY_DARK, segments: 12, name: "foot" });
    }
  }

  b.extrude(roundRect(0.44, 0.035, 0.012, 2), {
    at: [0, 0.0525, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.4,
    bevel: 0.008,
    color: woodDark,
    bone: body,
    name: "plinth",
  });

  b.extrude(roundRect(0.4, 0.28, 0.03, 3), {
    at: [0, 0.21, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.36,
    bevel: 0.02,
    color: wood,
    bone: body,
    name: "cabinet",
  });

  b.extrude(roundRect(0.42, 0.03, 0.012, 2), {
    at: [0, 0.365, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.38,
    bevel: 0.008,
    color: woodTop,
    bone: body,
    name: "lid",
  });

  // Front: speaker grille in a brass bezel, two brass tone knobs.
  b.part(new THREE.CircleGeometry(0.11, 40), "#ffffff", {
    bone: body,
    at: [0, 0.21, 0.1815],
    dir: [0, 0, 1],
    axis: "z",
    texture: grilleTex,
    name: "grille",
  });
  b.part(new THREE.TorusGeometry(0.114, 0.008, 6, 36), BRASS_LIGHT, {
    bone: body,
    at: [0, 0.21, 0.181],
    dir: [0, 0, 1],
    axis: "z",
    name: "grilleRing",
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.016, 0.019, 0.022, 12), BRASS, {
      bone: body,
      at: [s * 0.16, 0.21, 0.186],
      dir: [0, 0, 1],
      name: "knob",
    });
  }

  // Brass screws on the lid corners.
  for (const s of [-1, 1]) {
    for (const f of [-1, 1]) {
      b.part(new THREE.SphereGeometry(0.01, 8, 6), BRASS_LIGHT, {
        bone: body,
        at: [s * 0.2, 0.38, f * 0.17],
        name: "screw",
      });
    }
  }

  // Winding crank on the model's left flank.
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 16), BRASS, {
    bone: crank,
    at: [0.206, 0.21, -0.06],
    dir: [1, 0, 0],
    name: "crankDisc",
  });
  b.capsule([0.212, 0.238, -0.06], [0.262, 0.238, -0.06], 0.008, {
    bone: crank,
    color: BRASS_LIGHT,
    name: "crankArm",
  });
  b.part(new THREE.SphereGeometry(0.016, 10, 8), MAHOGANY, {
    bone: crank,
    at: [0.27, 0.238, -0.06],
    name: "crankKnob",
  });

  // ---- horn -------------------------------------------------------------------
  b.sweep(hornPath, [0.02, 0.04], {
    bone: horn,
    color: BRASS,
    detail: 1.25,
    caps: { start: "round", end: "none" },
    name: "horn",
  });
  b.part(new THREE.CylinderGeometry(0.04, 0.046, 0.016, 16), BRASS_LIGHT, {
    bone: body,
    at: [0, 0.388, -0.15],
    name: "throatCollar",
  });
  b.part(new THREE.TorusGeometry(0.03, 0.006, 6, 18), BRASS_LIGHT, {
    bone: horn,
    at: hornPath.at(0.42),
    dir: hornPath.tangentAt(0.42),
    axis: "z",
    name: "hornBand",
  });

  // Bell, flared along the horn's end tangent, with a bright rim.
  b.lathe(BELL_SHAPE, {
    at: hornEnd,
    axis: bellAxis,
    segments: 14,
    color: bellSkin,
    bone: horn,
    name: "bell",
  });
  b.part(new THREE.TorusGeometry(0.218, 0.011, 6, 20), BRASS_LIGHT, {
    bone: horn,
    at: hornEnd.clone().addScaledVector(bellAxis, 0.245),
    dir: bellAxis,
    axis: "z",
    name: "bellRim",
  });

  // ---- turntable and record -----------------------------------------------------
  b.lathe(PLATTER, {
    at: [0, 0.38, TT_Z],
    bone: turntable,
    color: BRASS,
    segments: 28,
    name: "platter",
  });
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.004, 40), grooves, {
    bone: turntable,
    at: [0, 0.396, TT_Z],
    name: "record",
  });
  b.part(new THREE.CircleGeometry(0.04, 32), "#ffffff", {
    bone: turntable,
    at: [0, 0.3992, TT_Z],
    rotation: [-90, 0, 0],
    texture: labelTex,
    name: "recordLabel",
  });
  b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.026, 12), BRASS_LIGHT, {
    bone: turntable,
    at: [0, 0.404, TT_Z],
    name: "spindle",
  });

  // ---- tone arm -------------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.022, 0.024, 0.012, 14), BRASS, {
    bone: arm,
    at: [0.13, 0.386, -0.13],
    name: "armBase",
  });
  b.part(new THREE.CylinderGeometry(0.011, 0.013, 0.05, 10), BRASS_DARK, {
    bone: arm,
    at: [0.13, 0.41, -0.13],
    name: "armPost",
  });
  const armPath = catmull([
    [0.13, 0.425, -0.13],
    [0.143, 0.47, -0.09],
    [0.136, 0.49, -0.03],
    [0.108, 0.462, 0.04],
    [0.075, 0.44, 0.075],
    [0.06, 0.428, 0.09],
  ]);
  b.sweep(armPath, [0.007, 0.005], { bone: arm, color: BRASS, name: "toneArm" });
  b.part(new THREE.CylinderGeometry(0.013, 0.009, 0.022, 10), EBONITE, {
    bone: arm,
    at: [0.06, 0.42, 0.09],
    name: "soundBox",
  });
  b.spike([0.06, 0.409, 0.09], [0.06, 0.3985, 0.09], null, 0.0028, {
    bone: arm,
    color: STEEL,
    name: "needle",
  });

  return b.root;
}
```