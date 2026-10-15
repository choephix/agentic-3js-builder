// Barnstormer biplane, whimsical: a fat, cheerful red-and-cream two-seater with a bulbous teal cowl, balloon tyres,
// a moustached pilot with googly goggles, a teddy-bear passenger, bunting strung wing-tip to tail, and a lucky horseshoe.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { lerp, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, grain, mottle, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A chubby storybook barnstormer biplane: red and cream fabric, teal bulbous cowl with a sunny face, balloon tyres, a moustached pilot and a teddy-bear passenger, with wing-tip-to-tail bunting and a lucky horseshoe. Hinged prop, wheels, rudder, elevators and four ailerons.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const RED = "#e8503f";
const RED_HI = "#f46a52";
const RED_LO = "#bd3a38";
const CREAM = "#fff1cf";
const CREAM_LO = "#f0d6a0";
const YELLOW = "#ffc83d";
const GOLD = "#f2b630";
const TEAL = "#2ba7a5";
const TEAL_HI = "#43c9c0";
const TEAL_LO = "#1f7f86";
const PLUM = "#2d2438";
const STEEL = "#a9b4c0";
const STEEL_LO = "#6f7a89";
const LEATHER = "#8d5632";
const LEATHER_HI = "#a8693d";
const WOOD = "#d9a35d";
const WOOD_LO = "#b87b3f";
const SKIN = "#f6c79b";
const RUBBER = "#2e2a38";
const GLASS = "#aee7f0";
const BLUSH = "#f19a8c";
const FUR = "#b97a4a";
const FUR_LO = "#f6dcb4";
const SEAM_LINE = "#a02f32";
const RIB = "#d9b27e";
const RECESS = "#3a3040";
const WIRE = "#46363a";

// Painted coats: soft hand-painted gradients, top light to belly dark.
const RED_COAT = countershade(mottle(RED_HI, RED, { size: 0.35, contrast: 0.6, seed: 3 }), RED_LO, {
  level: 0.05,
  soft: 0.9,
});
const TEAL_COAT = countershade(TEAL_HI, TEAL_LO, { level: 0, soft: 0.9 });
const BELLY = countershade(CREAM, CREAM_LO, { level: -0.3, soft: 0.6 });
const CANVAS = mottle("#fff4d6", "#ffe6b0", { size: 0.5, contrast: 0.5, seed: 5 });
const STRUT_WOOD = grain(WOOD, WOOD_LO, { size: 0.02, axis: "y", seed: 2 });
const BLADE_WOOD = grain(WOOD, WOOD_LO, { size: 0.025, axis: "y", seed: 4 });

// Fuselage: red coat, cream belly, yellow and cream pinstripe, teal tail tip, riveted panel seams.
const SEAMS = [1.15, -0.15, -1.0, -1.85];
const hullPaint = paint((p, n) => {
  for (const z of SEAMS) if (Math.abs(p.z - z) < 0.006) return SEAM_LINE;
  if (p.z < -2.5) return TEAL_COAT;
  if (n.y < -0.55) return BELLY;
  if (Math.abs(n.x) > 0.25 && p.z < 1.45) {
    const dy = p.y - 1.66;
    if (Math.abs(dy) < 0.03) return YELLOW;
    if (Math.abs(dy + 0.065) < 0.013) return CREAM;
  }
  return RED_COAT;
});

// Cowl: teal shell, yellow lip, dark recess for the engine.
const cowlPaint = paint((p, _n, s) => {
  const r = Math.hypot(p.x, p.y - 1.5);
  if (r < 0.385 && s[0] < 0.69) return RECESS;
  if (s[0] > 0.62) return YELLOW;
  return TEAL_COAT;
});

// Wings: cream canvas, tan rib tapes, red leading edge piping and red tips.
const wingPaint = (zc: number, hc: number, tipFrom: number) =>
  paint((p, n) => {
    const ax = Math.abs(p.x);
    if (ax > tipFrom) return RED_COAT;
    if (p.z - zc > hc * 0.8) return RED_COAT;
    if (ax > 0.25 && Math.abs(ax - Math.round(ax / 0.42) * 0.42) < 0.011) return RIB;
    return n.y < 0 ? CREAM_LO : CANVAS;
  });

const aileronPaint = paint((_p, _n, s) => {
  const u = ((s[0] % 0.3) + 0.3) % 0.3;
  return Math.abs(u - 0.15) < 0.012 ? CREAM : TEAL_COAT;
});

const rudderPaint = paint((_p, _n, s) => {
  const k = ((Math.floor((s[1] + 0.05) / 0.21) % 3) + 3) % 3;
  return [TEAL, CREAM, RED][k];
});

const bladePaint = paint((_p, _n, s) => {
  if (s[1] > 0.93) return YELLOW;
  if (s[1] > 0.86) return RED;
  return BLADE_WOOD;
});

const spinnerPaint = paint((p) => (p.z > 2.3 ? RED : YELLOW));

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const wedges = Array.from({ length: 8 }, (_, i) => {
  const a0 = (i * Math.PI) / 4;
  const a1 = ((i + 1) * Math.PI) / 4;
  const p = (a: number) => `${(50 + 46 * Math.sin(a)).toFixed(1)} ${(50 - 46 * Math.cos(a)).toFixed(1)}`;
  return `<path d="M50 50 L${p(a0)} A46 46 0 0 1 ${p(a1)} Z" fill="${i % 2 ? YELLOW : RED}"/>`;
}).join("");
const WHEEL_ART = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="${CREAM}"/>${wedges}<circle cx="50" cy="50" r="46" fill="none" stroke="${PLUM}" stroke-width="3"/><circle cx="50" cy="50" r="11" fill="${STEEL}" stroke="${PLUM}" stroke-width="2.5"/><circle cx="50" cy="50" r="4" fill="${PLUM}"/></svg>`,
  { size: 256 },
);

const rays = Array.from(
  { length: 12 },
  (_, i) => `<path d="M50 3 L58 24 L42 24 Z" fill="#ff9a2e" transform="rotate(${i * 30} 50 50)"/>`,
).join("");
const SUN_ART = svg(
  `<svg viewBox="0 0 100 100">${rays}<circle cx="50" cy="50" r="27" fill="#ffd84a" stroke="#d9791c" stroke-width="2.5"/><ellipse cx="40" cy="45" rx="3.6" ry="5" fill="${PLUM}"/><ellipse cx="60" cy="45" rx="3.6" ry="5" fill="${PLUM}"/><circle cx="41.4" cy="43" r="1.4" fill="#ffffff"/><circle cx="61.4" cy="43" r="1.4" fill="#ffffff"/><circle cx="33" cy="57" r="4.5" fill="#ff8a7a"/><circle cx="67" cy="57" r="4.5" fill="#ff8a7a"/><path d="M38 57 Q50 69 62 57" stroke="${PLUM}" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`,
  { size: 256 },
);

const ROUNDEL_ART = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="${TEAL}"/><circle cx="50" cy="50" r="40" fill="${CREAM}"/><circle cx="50" cy="50" r="30" fill="${RED}"/><circle cx="50" cy="50" r="17" fill="${YELLOW}"/><polygon points="50,36 54,46 65,46 56,53 59,64 50,57 41,64 44,53 35,46 46,46" fill="${RED}"/></svg>`,
  { size: 256 },
);

const NAME_ART = svg(
  `<svg viewBox="0 0 260 56"><text x="130" y="42" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-style="italic" font-size="44" fill="${CREAM}" stroke="#7b2d2a" stroke-width="3" paint-order="stroke">Lucky Lark</text></svg>`,
  { size: 512 },
);

const NUMBER_ART = svg(
  `<svg viewBox="0 0 60 70"><text x="30" y="58" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="66" fill="${CREAM}" stroke="${PLUM}" stroke-width="3" paint-order="stroke">7</text></svg>`,
  { size: 256 },
);

const pennant = (a: string, c: string) =>
  svg(
    `<svg viewBox="0 0 64 64"><path d="M3 61 L32 3 L61 61 Z" fill="${a}" stroke="${PLUM}" stroke-width="3" stroke-linejoin="round"/><path d="M18 61 L32 32 L46 61 Z" fill="${c}"/></svg>`,
    { size: 96 },
  );

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "barnstormerBiplane", paintSize: 2048 });

  // ---- Skeleton ---------------------------------------------------------------------------------------------
  const body = b.joint("body", { at: [0, 1.5, 0] });
  const prop = b.joint("propeller", { parent: body, at: [0, 1.5, 2.12], dir: [0, 0, 1], role: "hinge" });
  const rudder = b.joint("rudder", { parent: body, at: [0, 1.58, -2.9], dir: [0, 1, 0], role: "hinge" });
  const tailWheel = b.joint("tailWheel", { parent: body, at: [0, 0.165, -2.62], dir: [1, 0, 0], role: "hinge" });
  const pilotHead = b.joint("pilotHead", { parent: body, at: [0, 2.1, -0.68], dir: [0, 1, 0], role: "head" });
  const bearHead = b.joint("bearHead", { parent: body, at: [0, 2.1, 0.35], dir: [0, 1, 0], role: "head" });

  // ---- Helpers ----------------------------------------------------------------------------------------------
  const addStuds = (pts: THREE.Vector3[], r: number, color: string) => {
    const g = mergeGeometries(pts.map((p) => new THREE.SphereGeometry(r, 5, 3).translate(p.x, p.y, p.z)));
    if (g) b.part(g, color, { bone: body, at: [0, 0, 0] });
  };
  const ringPts = (cx: number, cy: number, cz: number, r: number, n: number, a0 = 0) =>
    Array.from({ length: n }, (_, i) => {
      const a = a0 + (i * 2 * Math.PI) / n;
      return new THREE.Vector3(cx + r * Math.sin(a), cy + r * Math.cos(a), cz);
    });
  const wire = (a: number[], c: number[]) => b.rod(a, c, 0.012, WIRE, { bone: body, sides: 4 });

  // ---- Fuselage ---------------------------------------------------------------------------------------------
  const fuselage = b.loft(
    [
      { at: [0, 1.63, -3.1], w: 0.1, h: 0.16 },
      { at: [0, 1.6, -2.6], w: 0.22, h: 0.34 },
      { at: [0, 1.55, -1.9], w: 0.38, h: 0.54 },
      { at: [0, 1.5, -1.1], w: 0.62, h: 0.76 },
      { at: [0, 1.5, -0.2], w: 0.82, h: 0.92 },
      { at: [0, 1.5, 0.7], w: 0.9, h: 0.98 },
      { at: [0, 1.5, 1.6], w: 0.9, h: 0.96 },
    ],
    { bone: body, color: hullPaint, sides: 12, caps: { start: "round", end: "flat" } },
  );

  // Rivet row along each side.
  const hullSkin = b.surface(fuselage);
  const rivets: THREE.Vector3[] = [];
  for (const s of [1, -1])
    for (let z = -2.1; z <= 1.3; z += 0.2) {
      const h = hullSkin.ray([s * 1.5, 1.28, z], [-s, 0, 0]);
      if (h) rivets.push(h.at.clone().addScaledVector(h.n, 0.002));
    }
  addStuds(rivets, 0.014, "#f7e9c8");

  // Painted name on both flanks.
  for (const s of [1, -1]) {
    const h = hullSkin.around([0, 1.42, -1.15]).at(s * 90, 0);
    if (h) b.decal(fuselage, NAME_ART, { at: h, size: [1.3, 0.28], segments: 22, up: [0, 1, 0] });
  }

  // Headrest hump behind the pilot.
  b.capsule([0, 1.93, -0.95], [0, 1.9, -1.6], [0.17, 0.05], RED_COAT, { bone: body });

  // Foot steps.
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.06, 0.04, 0.2), LEATHER, { bone: body, at: [s * 0.43, 1.22, -0.5] });
    b.part(new THREE.BoxGeometry(0.06, 0.04, 0.2), LEATHER, { bone: body, at: [s * 0.45, 1.22, 0.45] });
  }

  // ---- Engine cowl and propeller ----------------------------------------------------------------------------
  const cowl = b.lathe(
    [
      [0, 0],
      [0.46, 0],
      [0.55, 0.1],
      [0.575, 0.3],
      [0.56, 0.5],
      [0.5, 0.64],
      [0.44, 0.7],
      [0.36, 0.7],
      [0.345, 0.55],
      [0, 0.55],
    ],
    { at: [0, 1.5, 1.4], axis: [0, 0, 1], segments: 14, color: cowlPaint, bone: body },
  );
  addStuds(ringPts(0, 1.5, 2.1, 0.4, 12), 0.018, STEEL);
  addStuds(ringPts(0, 1.5, 1.5, 0.553, 14), 0.02, STEEL);
  // Radial engine cylinders in the recess and a hub.
  for (let i = 0; i < 7; i++) {
    const a = (i * 2 * Math.PI) / 7;
    b.part(new THREE.CylinderGeometry(0.06, 0.066, 0.14, 6), STEEL_LO, {
      bone: body,
      at: [0.27 * Math.sin(a), 1.5 + 0.27 * Math.cos(a), 2.02],
      dir: [0, 0, 1],
    });
    b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.025, 6), STEEL, {
      bone: body,
      at: [0.27 * Math.sin(a), 1.5 + 0.27 * Math.cos(a), 2.085],
      dir: [0, 0, 1],
    });
  }
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.12, 8), STEEL, { bone: prop, at: [0, 1.5, 2.06], dir: [0, 0, 1] });
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.215, 0.06],
      [0.2, 0.15],
      [0.16, 0.26],
      [0.1, 0.36],
      [0.04, 0.42],
      [0, 0.44],
    ],
    { at: [0, 1.5, 2.0], axis: [0, 0, 1], segments: 12, color: spinnerPaint, bone: prop },
  );
  const bladeOutline: OutlinePoint[] = [
    [-0.07, 0.05],
    [0.07, 0.05],
    [0.13, 0.45],
    [0.12, 0.85],
    [0.06, 1.08],
    [-0.06, 1.08],
    [-0.12, 0.85],
    [-0.13, 0.45],
  ];
  for (const dy of [1, -1])
    b.extrude(bladeOutline, {
      at: [0, 1.5, 2.12],
      x: [1, 0, 0],
      y: [0, dy, 0],
      thickness: [0.06, 0.03],
      bevel: 0.01,
      smoothing: 1,
      color: bladePaint,
      bone: prop,
    });
  // Oil filler cap on top of the cowl.
  b.part(new THREE.CylinderGeometry(0.055, 0.06, 0.035, 8), GOLD, { bone: body, at: [0, 2.075, 1.75] });
  // Sunny faces on the cowl flanks.
  const cowlSkin = b.surface(cowl);
  for (const s of [1, -1]) {
    const h = cowlSkin.around([0, 1.5, 1.75]).at(s * 90, 0);
    if (h) b.decal(cowl, SUN_ART, { at: h, size: [0.34, 0.34], segments: 12, up: [0, 1, 0] });
  }
  // Exhaust pipes.
  for (const s of [1, -1])
    b.sweep(
      catmull([
        [s * 0.45, 1.38, 1.85],
        [s * 0.6, 1.2, 1.55],
        [s * 0.66, 1.08, 1.0],
        [s * 0.66, 1.06, 0.55],
      ]),
      0.05,
      STEEL_LO,
      {
        bone: body,
        sides: 8,
        caps: { start: "none", end: "flat" },
        bands: [
          [0.88, STEEL],
          [1, "#3b3340"],
        ],
      },
    );

  // ---- Cockpits, pilot and bear -----------------------------------------------------------------------------
  const cockpit = (z: number, y: number) => {
    b.part(new THREE.CylinderGeometry(0.27, 0.27, 0.04, 14), PLUM, { bone: body, at: [0, y, z] });
    b.part(new THREE.TorusGeometry(0.27, 0.05, 6, 14), LEATHER, {
      bone: body,
      at: [0, y + 0.015, z],
      dir: [0, 1, 0],
      axis: "z",
    });
  };
  const windscreen = (z: number, y: number) => {
    const rot: number[] = [-28, 0, 0];
    b.part(new THREE.BoxGeometry(0.5, 0.24, 0.014), GLASS, { bone: body, at: [0, y, z], rotation: rot });
    b.part(new THREE.BoxGeometry(0.56, 0.03, 0.03), YELLOW, {
      bone: body,
      at: [0, y + 0.106, z - 0.056],
      rotation: rot,
    });
    b.part(new THREE.BoxGeometry(0.56, 0.03, 0.03), YELLOW, {
      bone: body,
      at: [0, y - 0.106, z + 0.056],
      rotation: rot,
    });
    for (const s of [1, -1])
      b.part(new THREE.BoxGeometry(0.03, 0.26, 0.03), YELLOW, { bone: body, at: [s * 0.26, y, z], rotation: rot });
  };
  cockpit(-0.65, 1.91);
  cockpit(0.35, 1.96);
  windscreen(-0.3, 2.04);
  windscreen(0.72, 2.08);

  // Pilot: jacket, shearling collar, arms and gloves, stick.
  b.capsule([0, 1.7, -0.68], [0, 1.93, -0.68], 0.19, LEATHER, { bone: body });
  b.part(new THREE.TorusGeometry(0.15, 0.05, 6, 12), CREAM, {
    bone: body,
    at: [0, 2.1, -0.68],
    dir: [0, 1, 0],
    axis: "z",
  });
  for (const s of [1, -1]) {
    b.capsule([s * 0.17, 1.93, -0.74], [s * 0.075, 1.9, -0.43], 0.055, LEATHER_HI, { bone: body });
    b.part(new THREE.SphereGeometry(0.06, 8, 6), LEATHER, { bone: body, at: [s * 0.075, 1.9, -0.41] });
  }
  b.rod([0, 1.7, -0.43], [0, 1.92, -0.43], 0.02, STEEL, { bone: body });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), RED, { bone: body, at: [0, 1.95, -0.43] });

  // Pilot head: skin, helmet with pompom, goggles with googly eyes, nose, blush and a curly moustache.
  b.part(new THREE.SphereGeometry(0.17, 12, 8), SKIN, { bone: pilotHead, at: [0, 2.26, -0.68] });
  b.part(new THREE.SphereGeometry(0.185, 12, 7, 0, Math.PI * 2, 0, Math.PI * 0.4), LEATHER_HI, {
    bone: pilotHead,
    at: [0, 2.26, -0.68],
  });
  b.part(new THREE.SphereGeometry(0.036, 7, 5), YELLOW, { bone: pilotHead, at: [0, 2.46, -0.68] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.055, 7, 5), LEATHER, { bone: pilotHead, at: [s * 0.175, 2.25, -0.68] });
    b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.05, 10), "#f4fbfb", {
      bone: pilotHead,
      at: [s * 0.078, 2.258, -0.535],
      dir: [0, 0, 1],
    });
    b.part(new THREE.TorusGeometry(0.052, 0.013, 5, 12), YELLOW, {
      bone: pilotHead,
      at: [s * 0.078, 2.258, -0.512],
    });
    b.part(new THREE.SphereGeometry(0.022, 6, 5), PLUM, { bone: pilotHead, at: [s * 0.078, 2.255, -0.508] });
    b.part(new THREE.SphereGeometry(0.008, 5, 4), "#ffffff", { bone: pilotHead, at: [s * 0.07, 2.266, -0.49] });
    b.part(new THREE.SphereGeometry(0.028, 6, 5), BLUSH, { bone: pilotHead, at: [s * 0.105, 2.2, -0.56] });
    b.sweep(
      catmull([
        [s * 0.012, 2.205, -0.515],
        [s * 0.07, 2.19, -0.54],
        [s * 0.118, 2.21, -0.565],
      ]),
      [0.022, 0.006],
      "#b5542a",
      { bone: pilotHead, sides: 6, caps: { start: "round", end: "point" } },
    );
  }
  b.part(new THREE.TorusGeometry(0.172, 0.012, 5, 14), PLUM, {
    bone: pilotHead,
    at: [0, 2.26, -0.68],
    dir: [0, 1, 0],
    axis: "z",
  });
  b.part(new THREE.SphereGeometry(0.035, 6, 5), "#f1a98a", { bone: pilotHead, at: [0, 2.225, -0.5] });
  // Flying scarf.
  b.sweep(
    catmull([
      [0, 2.1, -0.8],
      [0.06, 2.14, -1.05],
      [-0.05, 2.1, -1.3],
      [0.05, 2.14, -1.55],
      [-0.04, 2.1, -1.78],
    ]),
    () => [0.075, 0.012],
    YELLOW,
    {
      bone: pilotHead,
      section: "box",
      up: [0, 1, 0],
      twist: 200,
      caps: "flat",
      bands: [
        [0.7, YELLOW],
        [0.8, RED],
        [0.9, YELLOW],
        [1, RED],
      ],
    },
  );

  // Teddy-bear passenger.
  b.capsule([0, 1.7, 0.35], [0, 1.95, 0.35], 0.18, FUR, { bone: body });
  b.part(new THREE.SphereGeometry(0.16, 10, 8), FUR, { bone: bearHead, at: [0, 2.2, 0.35] });
  b.part(new THREE.SphereGeometry(0.07, 8, 6), FUR_LO, { bone: bearHead, at: [0, 2.16, 0.47] });
  b.part(new THREE.SphereGeometry(0.026, 6, 5), PLUM, { bone: bearHead, at: [0, 2.185, 0.535] });
  b.part(new THREE.TorusGeometry(0.14, 0.04, 6, 12), TEAL, {
    bone: bearHead,
    at: [0, 2.06, 0.35],
    dir: [0, 1, 0],
    axis: "z",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.058, 7, 5), FUR, { bone: bearHead, at: [s * 0.115, 2.33, 0.33] });
    b.part(new THREE.SphereGeometry(0.032, 6, 5), BLUSH, { bone: bearHead, at: [s * 0.115, 2.335, 0.37] });
    b.part(new THREE.SphereGeometry(0.022, 6, 5), PLUM, { bone: bearHead, at: [s * 0.065, 2.24, 0.485] });
    b.part(new THREE.SphereGeometry(0.008, 5, 4), "#ffffff", { bone: bearHead, at: [s * 0.06, 2.25, 0.5] });
    b.part(new THREE.SphereGeometry(0.06, 7, 5), FUR, { bone: body, at: [s * 0.14, 1.98, 0.55] });
  }

  // ---- Wings ------------------------------------------------------------------------------------------------
  const wingTop = b.sweep(
    [
      [-3.0, 2.55, 0.5],
      [3.0, 2.55, 0.5],
    ],
    () => [0.65, 0.09],
    wingPaint(0.5, 0.65, 2.55),
    { bone: body, up: [0, 1, 0], sides: 12 },
  );
  b.sweep(
    [
      [-2.7, 1.15, 0.15],
      [2.7, 1.15, 0.15],
    ],
    () => [0.56, 0.085],
    wingPaint(0.15, 0.56, 2.2),
    { bone: body, up: [0, 1, 0], sides: 12 },
  );
  // Roundels, on top and underneath the upper wing.
  const topSkin = b.surface(wingTop);
  for (const s of [1, -1]) {
    const up = topSkin.ray([s * 2.15, 3.2, 0.5], [0, -1, 0]);
    if (up) b.decal(wingTop, ROUNDEL_ART, { at: up, size: [0.8, 0.8], segments: 10, up: [0, 0, 1] });
    const down = topSkin.ray([s * 2.3, 1.8, 0.5], [0, 1, 0]);
    if (down) b.decal(wingTop, ROUNDEL_ART, { at: down, size: [0.8, 0.8], segments: 10, up: [0, 0, 1] });
  }
  // Navigation lights: red left, green right.
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 5), "#ff4b5a", { bone: body, at: [3.62, 2.55, 0.5] }), 1.4);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 5), "#52e07a", { bone: body, at: [-3.62, 2.55, 0.5] }), 1.4);

  // Ailerons: one hinged flap behind each wing tip, upper and lower.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const aU = b.joint(`aileronU${side}`, { parent: body, at: [s * 2.4, 2.53, 0.08], dir: [s, 0, 0], role: "hinge" });
    b.extrude(
      [
        [1.5, 0.02],
        [3.3, 0.02],
        [3.38, -0.12],
        [3.3, -0.36],
        [1.5, -0.36],
      ],
      {
        at: [0, 2.53, 0.08],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.05,
        bevel: 0.012,
        smoothing: 1,
        color: aileronPaint,
        bone: aU,
      },
    );
    const aL = b.joint(`aileronL${side}`, { parent: body, at: [s * 2.2, 1.13, -0.21], dir: [s, 0, 0], role: "hinge" });
    b.extrude(
      [
        [1.4, 0.02],
        [2.95, 0.02],
        [3.05, -0.1],
        [2.98, -0.3],
        [1.4, -0.3],
      ],
      {
        at: [0, 1.13, -0.21],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.05,
        bevel: 0.012,
        smoothing: 1,
        color: aileronPaint,
        bone: aL,
      },
    );
  }

  // ---- Struts and wires -------------------------------------------------------------------------------------
  const wirePts: THREE.Vector3[] = [];
  for (const s of [1, -1]) {
    // Interplane struts, streamlined and wooden.
    for (const [zt, zb] of [
      [0.75, 0.4],
      [0.2, -0.12],
    ])
      b.sweep(
        [
          [s * 1.95, 1.2, zb],
          [s * 1.95, 2.5, zt],
        ],
        () => [0.02, 0.07],
        STRUT_WOOD,
        { bone: body, up: [0, 0, 1], sides: 8 },
      );
    // Cabane struts from the fuselage to the centre of the top wing.
    b.rod([s * 0.36, 1.72, 0.85], [s * 0.62, 2.5, 0.85], 0.035, RED_COAT, { bone: body });
    b.rod([s * 0.36, 1.66, -0.1], [s * 0.62, 2.5, 0.15], 0.035, RED_COAT, { bone: body });
    // Flying wires, crossed in each bay.
    wire([s * 0.55, 1.2, 0.1], [s * 1.95, 2.5, 0.45]);
    wire([s * 0.62, 2.5, 0.45], [s * 1.95, 1.2, 0.12]);
    wire([s * 1.95, 1.2, 0.12], [s * 2.8, 2.5, 0.45]);
    wire([s * 1.95, 2.5, 0.45], [s * 2.55, 1.2, 0.12]);
    for (const p of [
      [s * 1.95, 2.5, 0.45],
      [s * 1.95, 1.2, 0.12],
      [s * 0.62, 2.5, 0.45],
      [s * 0.55, 1.2, 0.1],
    ])
      wirePts.push(new THREE.Vector3(p[0], p[1], p[2]));
    // Landing gear: V struts to the axle with golden shock sleeves.
    for (const [from, to] of [
      [
        [s * 0.3, 1.25, 1.3],
        [s * 1.0, 0.52, 0.95],
      ],
      [
        [s * 0.3, 1.25, 0.55],
        [s * 1.0, 0.52, 0.95],
      ],
    ]) {
      b.rod(from, to, 0.04, TEAL_LO, { bone: body });
      b.rod(lerp(from, to, 0.3), lerp(from, to, 0.55), 0.058, YELLOW, { bone: body });
    }
    // Exhaust-side step plates are above; here a stabiliser wire pair to the tail.
    wire([0, 2.5, -2.2], [s * 1.2, 1.52, -2.15]);
  }
  addStuds(wirePts, 0.03, STEEL);
  // Axle fairing.
  b.sweep(
    [
      [-1.0, 0.5, 0.95],
      [1.0, 0.5, 0.95],
    ],
    () => [0.11, 0.04],
    RED_COAT,
    { bone: body, up: [0, 1, 0], sides: 8, caps: "flat" },
  );
  // Lucky horseshoe hung on the left front strut.
  b.part(new THREE.TorusGeometry(0.07, 0.018, 5, 10, Math.PI * 1.6), GOLD, {
    bone: body,
    at: [2.0, 1.86, 0.6],
    rotation: [0, 90, 126],
  });

  // ---- Wheels -----------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wheel = b.joint(`wheel${side}`, { parent: body, at: [s * 1.0, 0.5, 0.95], dir: [s, 0, 0], role: "hinge" });
    b.part(new THREE.TorusGeometry(0.38, 0.12, 6, 16), RUBBER, {
      bone: wheel,
      at: [s * 1.0, 0.5, 0.95],
      dir: [s, 0, 0],
      axis: "z",
    });
    b.part(new THREE.CylinderGeometry(0.31, 0.31, 0.14, 14), CREAM, {
      bone: wheel,
      at: [s * 1.0, 0.5, 0.95],
      dir: [s, 0, 0],
    });
    b.part(new THREE.PlaneGeometry(0.54, 0.54), "#ffffff", {
      bone: wheel,
      at: [s * 1.078, 0.5, 0.95],
      dir: [s, 0, 0],
      axis: "z",
      texture: WHEEL_ART,
    });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), STEEL, { bone: wheel, at: [s * 1.09, 0.5, 0.95] });
  }

  // ---- Tail -------------------------------------------------------------------------------------------------
  const fin = b.extrude(
    [
      [0.18, 0],
      [-0.98, 0],
      [-0.98, 0.88],
      [-0.7, 1.02],
      [-0.32, 0.9],
      [0.02, 0.4],
    ],
    {
      at: [0, 1.62, -1.9],
      x: [0, 0, 1],
      thickness: 0.07,
      bevel: 0.015,
      smoothing: 1,
      color: RED_COAT,
      bone: body,
    },
  );
  const finSkin = b.surface(fin);
  for (const s of [1, -1]) {
    const h = finSkin.ray([s * 1, 2.07, -2.4], [-s, 0, 0]);
    if (h) b.decal(fin, NUMBER_ART, { at: h, size: [0.4, 0.46], segments: 8, up: [0, 1, 0] });
  }
  b.extrude(
    [
      [0, 0.02],
      [-0.42, 0.02],
      [-0.56, 0.35],
      [-0.58, 0.8],
      [-0.45, 1.05],
      [-0.2, 1.1],
      [0, 1.06],
    ],
    {
      at: [0, 1.58, -2.9],
      x: [0, 0, 1],
      thickness: 0.05,
      bevel: 0.012,
      smoothing: 1,
      color: rudderPaint,
      bone: rudder,
    },
  );
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 5), "#fff2b0", { bone: rudder, at: [0, 2.3, -3.52] }), 1.3);

  // Horizontal stabiliser and elevators.
  b.extrude(
    [
      [-0.2, 0],
      [-1.2, 0.02],
      [-1.45, 0.22],
      [-1.42, 0.45],
      [-1.1, 0.62],
      [-0.2, 0.7],
      [0.2, 0.7],
      [1.1, 0.62],
      [1.42, 0.45],
      [1.45, 0.22],
      [1.2, 0.02],
      [0.2, 0],
    ],
    {
      at: [0, 1.5, -2.5],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.07,
      bevel: 0.015,
      smoothing: 1,
      color: RED_COAT,
      bone: body,
    },
  );
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const elevator = b.joint(`elevator${side}`, {
      parent: body,
      at: [s * 0.7, 1.5, -2.5],
      dir: [s, 0, 0],
      role: "hinge",
    });
    b.extrude(
      [
        [0.04, -0.02],
        [1.15, -0.02],
        [1.42, -0.12],
        [1.46, -0.32],
        [1.2, -0.5],
        [0.04, -0.52],
      ],
      {
        at: [0, 1.5, -2.5],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.06,
        bevel: 0.012,
        smoothing: 1,
        color: aileronPaint,
        bone: elevator,
      },
    );
  }

  // Tail wheel on a spring strut with a fork.
  b.rod([0, 1.45, -2.15], [0, 0.34, -2.6], 0.035, STEEL, { bone: body });
  b.part(new THREE.TorusGeometry(0.1, 0.065, 6, 12), RUBBER, {
    bone: tailWheel,
    at: [0, 0.165, -2.62],
    dir: [1, 0, 0],
    axis: "z",
  });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 8), CREAM, {
    bone: tailWheel,
    at: [0, 0.165, -2.62],
    dir: [1, 0, 0],
  });
  for (const s of [1, -1]) b.rod([s * 0.04, 0.36, -2.6], [s * 0.075, 0.165, -2.62], 0.018, STEEL, { bone: body });

  // ---- Bunting from each wing tip to the fin top ------------------------------------------------------------
  const flags = [
    pennant(RED, CREAM),
    pennant(YELLOW, RED),
    pennant(TEAL, CREAM),
    pennant(CREAM, TEAL),
  ];
  const flagRng = rng(7);
  for (const s of [1, -1]) {
    const line = catmull([
      [s * 3.35, 2.5, 0.05],
      [s * 2.5, 2.42, -0.55],
      [s * 1.5, 2.32, -1.25],
      [s * 0.7, 2.35, -1.85],
      [0, 2.56, -2.5],
    ]);
    b.sweep(line, 0.01, WIRE, { bone: body, sides: 4 });
    const count = 12;
    const anchors = Array.from({ length: count }, (_, i) => frame(line.at(0.05 + (0.9 * i) / (count - 1)), [0, 1, 0]));
    b.cards(anchors, flags, {
      size: [0.17, 0.24],
      lean: 180,
      flow: [1, 0, 0],
      vary: 0.12,
      rng: flagRng,
      bone: body,
    });
  }

  return b.root;
}
