import * as THREE from "three";
import { createBuilder, bezier, catmull, polyline, mottle, grain, svg } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Antique gramophone",
  description:
    "Walnut cabinet gramophone with a flared, scalloped brass morning-glory horn, a black record with a red label, a silver tonearm, a wind-up crank and ball-and-claw feet.",
};

// ---- palette ------------------------------------------------------------------
const BRASS = mottle("#c99a52", "#7f9c7a", { size: 0.07, contrast: 0.6, seed: 4 });
const BRASS_BRIGHT = mottle("#e2b874", "#9ab78e", { size: 0.05, contrast: 0.5, seed: 9 });
const WALNUT = grain("#4d2c17", "#7d4d2b", { size: 0.03, axis: "x", seed: 2 });
const WALNUT_DARK = grain("#37200f", "#5b3619", { size: 0.02, axis: "x", seed: 5 });
const SILVER = mottle("#e0e4e9", "#9ba3ad", { size: 0.04, contrast: 0.5, seed: 6 });
const IVORY = "#efe3c6";
const RED = "#b3262e";
const GOLD = "#dcb766";
const RECORD = "#141414";
const DARK = "#1c140d";

// ---- key points (model metres) -----------------------------------------------
const HORN_T0: [number, number, number] = [0, 0.98, -0.2]; // horn throat
const MOUTH = new THREE.Vector3(0, 1.45, 0.2); // horn mouth centre
const AXIS = new THREE.Vector3(0, 0.6, 0.8).normalize(); // mouth faces up and forward
const LOBES = [0, 72, 144, 216, 288]; // clock angles of the five petals
const TC: [number, number, number] = [0, 0.78, 0.02]; // turntable centre
const BETA = (48 * Math.PI) / 180; // how far each petal flares outward

// ---- profiles -----------------------------------------------------------------
const PLATTER: OutlinePoint[] = [
  [0, 0],
  [0.17, 0],
  [0.175, 0.006],
  [0.172, 0.016],
  [0.16, 0.02],
  [0, 0.02],
];
const FINIAL: OutlinePoint[] = [
  [0, 0],
  [0.024, 0],
  [0.024, 0.008],
  [0.013, 0.02],
  [0.02, 0.04],
  [0.007, 0.07],
  [0, 0.085],
];
const COLLAR: OutlinePoint[] = [
  [0, 0],
  [0.03, 0],
  [0.03, 0.014],
  [0.022, 0.02],
  [0, 0.024],
];
const PETAL_W = 0.11;
const PETAL_L = 0.12;
const PETAL: OutlinePoint[] = [
  [-PETAL_W, 0],
  [-PETAL_W * 0.98, PETAL_L * 0.42],
  [-PETAL_W * 0.6, PETAL_L * 0.86],
  [0, PETAL_L],
  [PETAL_W * 0.6, PETAL_L * 0.86],
  [PETAL_W * 0.98, PETAL_L * 0.42],
  [PETAL_W, 0],
  [0, -0.03],
];

// ---- textures -----------------------------------------------------------------
function leaf(x: number, y: number, rot: number, s = 1): string {
  return `<ellipse cx="${x}" cy="${y}" rx="${(4 * s).toFixed(1)}" ry="${(11 * s).toFixed(1)}" transform="rotate(${rot} ${x} ${y})" fill="${IVORY}"/>`;
}

function bloom(x: number, y: number, r: number, rot: number): string {
  let petals = "";
  for (let i = 0; i < 5; i++) {
    petals += `<ellipse cx="0" cy="${(-r * 0.56).toFixed(1)}" rx="${(r * 0.3).toFixed(1)}" ry="${(r * 0.56).toFixed(1)}" transform="rotate(${i * 72})"/>`;
  }
  return `<g transform="translate(${x} ${y}) rotate(${rot})" fill="${IVORY}">${petals}<circle r="${(r * 0.2).toFixed(1)}" fill="none" stroke="${IVORY}" stroke-width="1.6"/></g>`;
}

// Pale holly-and-bloom inlay on a transparent ground (the walnut shows through).
function floralMarkup(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 230">
<rect x="5" y="5" width="190" height="220" rx="6" fill="none" stroke="${IVORY}" stroke-width="2.4"/>
<rect x="12" y="12" width="176" height="206" rx="3" fill="none" stroke="${IVORY}" stroke-width="0.9"/>
<g fill="none" stroke="${IVORY}" stroke-width="2.2" stroke-linecap="round">
<path d="M100 115 Q74 92 44 58"/><path d="M100 115 Q126 92 156 58"/>
<path d="M100 115 Q74 138 44 172"/><path d="M100 115 Q126 138 156 172"/>
<path d="M100 115 V46"/><path d="M100 115 V184"/>
<path d="M58 214 Q100 198 142 214"/><path d="M58 16 Q100 32 142 16"/>
</g>
${leaf(73, 88, -50)}${leaf(127, 88, 50)}${leaf(73, 142, 50)}${leaf(127, 142, -50)}
${leaf(100, 74, 0, 0.8)}${leaf(100, 156, 180, 0.8)}
${bloom(100, 115, 30, 0)}
${bloom(44, 58, 18, 18)}${bloom(156, 58, 18, -18)}${bloom(44, 172, 18, -18)}${bloom(156, 172, 18, 18)}
<circle cx="100" cy="40" r="7" fill="${IVORY}"/><circle cx="100" cy="190" r="7" fill="${IVORY}"/>
<circle cx="22" cy="115" r="5" fill="${IVORY}"/><circle cx="178" cy="115" r="5" fill="${IVORY}"/>
</svg>`;
}

// Fine concentric grooves on the black record.
function grooveMarkup(): string {
  let rings = "";
  for (let r = 12; r <= 47; r += 1.4) {
    rings += `<circle cx="50" cy="50" r="${r.toFixed(1)}" fill="none" stroke="#2a2a2a" stroke-width="0.45"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#121212"/>${rings}<circle cx="50" cy="50" r="48.5" fill="none" stroke="#3a3a3a" stroke-width="1"/></svg>`;
}

// Red record label with a gold rim and a ring of gold dots.
function labelMarkup(): string {
  let dots = "";
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    dots += `<circle cx="${(50 + 39.5 * Math.cos(a)).toFixed(2)}" cy="${(50 + 39.5 * Math.sin(a)).toFixed(2)}" r="1.5" fill="${GOLD}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${RED}"/><circle cx="50" cy="50" r="44" fill="none" stroke="${GOLD}" stroke-width="2.2"/><circle cx="50" cy="50" r="34" fill="none" stroke="${GOLD}" stroke-width="0.9"/>${dots}<circle cx="50" cy="50" r="5.5" fill="#1d120c"/></svg>`;
}

// ---- model --------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "antique-gramophone" });

  const inlay = svg(floralMarkup(), { size: 512 });
  const grooves = svg(grooveMarkup(), { size: 256 });
  const label = svg(labelMarkup(), { size: 256 });

  // skeleton
  const base = b.joint("base", { at: [0, 0, 0] });
  const turntable = b.joint("turntable", { parent: base, at: TC });
  const tonearm = b.joint("tonearm", { parent: base, at: [0.2, 0.86, -0.16], role: "hinge" });
  const crank = b.joint("crank", { parent: base, at: [-0.262, 0.44, 0], role: "hinge" });
  const hornJ = b.joint("horn", { parent: base, at: HORN_T0 });

  // ---- cabinet -------------------------------------------------------------
  b.part(new THREE.BoxGeometry(0.52, 0.66, 0.44), WALNUT, { bone: base, at: [0, 0.43, 0] });
  b.part(new THREE.BoxGeometry(0.54, 0.04, 0.46), WALNUT_DARK, { bone: base, at: [0, 0.12, 0] });
  b.part(new THREE.BoxGeometry(0.55, 0.02, 0.48), WALNUT_DARK, { bone: base, at: [0, 0.77, 0] });

  // carved corner columns with turned finials
  for (const x of [-0.255, 0.255]) {
    for (const z of [-0.215, 0.215]) {
      b.capsule([x, 0.16, z], [x, 0.72, z], 0.02, { bone: base, color: WALNUT_DARK });
      b.lathe(FINIAL, { at: [x, 0.78, z], segments: 12, bone: base, color: WALNUT_DARK });
    }
  }

  // brass beading on the deck edge and the plinth
  b.sweep(
    polyline(
      [
        [-0.275, 0.762, -0.24],
        [0.275, 0.762, -0.24],
        [0.275, 0.762, 0.24],
        [-0.275, 0.762, 0.24],
      ],
      { closed: true },
    ),
    0.006,
    { bone: base, color: BRASS },
  );
  b.sweep(
    polyline(
      [
        [-0.27, 0.14, -0.23],
        [0.27, 0.14, -0.23],
        [0.27, 0.14, 0.23],
        [-0.27, 0.14, 0.23],
      ],
      { closed: true },
    ),
    0.0055,
    { bone: base, color: BRASS },
  );

  // inlaid front panel: pale floral drawing in a brass-studded frame
  const frameRect = polyline(
    [
      [-0.21, 0.16, 0.2245],
      [0.21, 0.16, 0.2245],
      [0.21, 0.7, 0.2245],
      [-0.21, 0.7, 0.2245],
    ],
    { closed: true },
  );
  b.sweep(frameRect, 0.0055, { bone: base, color: BRASS });
  b.along(frameRect, 30, (at) => {
    b.part(new THREE.SphereGeometry(0.0068, 6, 4), BRASS, { at });
  });
  b.part(new THREE.PlaneGeometry(0.4, 0.5), "#ffffff", {
    bone: base,
    at: [0, 0.43, 0.2232],
    texture: inlay,
  });

  // ---- turntable, record and label -----------------------------------------
  b.lathe(PLATTER, { at: TC, segments: 36, bone: turntable, color: BRASS });
  b.part(new THREE.CylinderGeometry(0.145, 0.145, 0.008, 48), RECORD, {
    bone: turntable,
    at: [0, 0.804, 0.02],
  });
  b.part(new THREE.CircleGeometry(0.144, 48), "#ffffff", {
    bone: turntable,
    at: [0, 0.8088, 0.02],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: grooves,
  });
  b.part(new THREE.CircleGeometry(0.052, 40), "#ffffff", {
    bone: turntable,
    at: [0, 0.8098, 0.02],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: label,
  });
  b.part(new THREE.CylinderGeometry(0.0045, 0.0045, 0.05, 8), BRASS, {
    bone: turntable,
    at: [0, 0.835, 0.02],
  });
  b.part(new THREE.SphereGeometry(0.008, 8, 6), BRASS, { bone: turntable, at: [0, 0.862, 0.02] });

  // ---- silver tonearm with soundbox ---------------------------------------
  b.part(new THREE.CylinderGeometry(0.02, 0.024, 0.09, 14), BRASS, {
    bone: tonearm,
    at: [0.2, 0.825, -0.16],
  });
  b.sweep(
    catmull([
      [0.2, 0.86, -0.16],
      [0.186, 0.905, -0.1],
      [0.138, 0.916, -0.02],
      [0.07, 0.875, 0.04],
    ]),
    [0.0095, 0.0075],
    { bone: tonearm, color: SILVER },
  );
  b.part(new THREE.CylinderGeometry(0.02, 0.015, 0.05, 14), BRASS, {
    bone: tonearm,
    at: [0.07, 0.845, 0.04],
  });
  b.spike([0.07, 0.82, 0.04], [0, -1, 0], 0.012, 0.0035, { bone: tonearm, color: SILVER });

  // reproducer pipe from the soundbox up into the horn throat
  b.sweep(
    catmull([
      [0.07, 0.87, 0.04],
      [0.066, 0.95, 0.0],
      [0.03, 0.98, -0.12],
      HORN_T0,
    ]),
    0.011,
    { bone: hornJ, color: BRASS },
  );
  b.lathe(COLLAR, { at: [0, 0.975, -0.2], segments: 16, bone: hornJ, color: BRASS_BRIGHT });

  // ---- the morning-glory horn ----------------------------------------------
  const c1 = new THREE.Vector3(0, 1.18, -0.2);
  const c2 = MOUTH.clone().addScaledVector(AXIS, -0.3);
  const hornPath = bezier(HORN_T0, c1, c2, MOUTH);
  const horn = b.sweep(hornPath, (t: number) => 0.02 + 0.4 * Math.pow(t, 3.2), {
    bone: hornJ,
    color: BRASS,
    sides: 20,
    caps: { start: "round", end: "none" },
  });

  // two raised bands round the bell
  for (const bt of [0.5, 0.8]) {
    const band: THREE.Vector3[] = [];
    for (let i = 0; i < 12; i++) band.push(horn.at(bt, i * 30, 0.003).at);
    b.sweep(catmull(band, { closed: true }), 0.0045, { bone: hornJ, color: BRASS_BRIGHT });
  }

  // lobes: a vein rib on the flare, then a flared petal at its rim
  for (const a of LOBES) {
    b.sweep(horn.line(a, 0.004).slice(0.45, 1), [0.0055, 0.0022], {
      bone: hornJ,
      color: BRASS_BRIGHT,
      sides: 6,
    });

    const rim = horn.at(1, a).at;
    const u = rim.clone().sub(MOUTH).normalize(); // radial, at the rim
    const tang = new THREE.Vector3().crossVectors(AXIS, u).normalize(); // round the rim
    const lean = AXIS.clone()
      .multiplyScalar(Math.cos(BETA))
      .addScaledVector(u, Math.sin(BETA))
      .normalize(); // forward and outward along the flare

    b.extrude(PETAL, {
      at: rim.clone().addScaledVector(u, -0.004),
      x: tang,
      y: lean,
      thickness: 0.01,
      bevel: 0.003,
      color: BRASS,
      bone: hornJ,
    });
  }

  // dark bell interior seen through the mouth
  b.part(new THREE.CircleGeometry(0.39, 36), DARK, {
    bone: hornJ,
    at: MOUTH.clone().addScaledVector(AXIS, -0.012),
    dir: AXIS,
    axis: "z",
  });

  // bracket from the cabinet deck up to the belly of the horn
  b.rod([0, 0.78, -0.14], horn.at(0.28, 180).at, 0.011, { bone: base, color: BRASS });

  // ---- wind-up crank on the right side ------------------------------------
  b.part(new THREE.BoxGeometry(0.008, 0.11, 0.07), BRASS, { bone: base, at: [-0.264, 0.44, 0] });
  b.part(new THREE.CylinderGeometry(0.03, 0.034, 0.024, 20), BRASS, {
    bone: crank,
    at: [-0.27, 0.44, 0],
    dir: [-1, 0, 0],
  });
  b.capsule([-0.282, 0.44, 0], [-0.345, 0.44, 0], 0.0085, { bone: crank, color: BRASS });
  b.part(new THREE.SphereGeometry(0.024, 14, 10), WALNUT, { bone: crank, at: [-0.36, 0.44, 0] });

  // ---- ball-and-claw feet --------------------------------------------------
  for (const fx of [-0.2, 0.2]) {
    for (const fz of [-0.16, 0.16]) {
      b.part(new THREE.SphereGeometry(0.04, 16, 12), BRASS, { bone: base, at: [fx, 0.04, fz] });
      b.rod([fx, 0.05, fz], [fx, 0.12, fz], 0.013, { bone: base, color: WALNUT_DARK });
      for (const deg of [90, 210, 330]) {
        const ang = (deg * Math.PI) / 180;
        const dx = Math.cos(ang);
        const dz = Math.sin(ang);
        const pt = (k: number, y: number): [number, number, number] => [fx + dx * k, y, fz + dz * k];
        b.sweep(catmull([pt(0.02, 0.1), pt(0.05, 0.065), pt(0.047, 0.02), pt(0.03, 0.004)]), [0.007, 0.0025], {
          bone: base,
          color: BRASS,
        });
      }
    }
  }

  return b.root;
}
