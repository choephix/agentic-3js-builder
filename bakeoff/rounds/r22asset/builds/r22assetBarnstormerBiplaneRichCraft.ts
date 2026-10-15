// Whimsical barnstormer biplane: chubby red-and-cream fuselage, big teal cowl, bunting rope, googly-goggled pilot.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import type { PartOptions } from "../../../../src/parts";
import { catmull } from "../../../../src/path";
import { countershade, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A chubby storybook barnstormer biplane: red and cream fabric wings, big teal cowl, spinning propeller, hinged control surfaces, bunting rope between the wings and a googly-goggled pilot with a mustache and a fluttering scarf.",
  style: "whimsical",
  commit: "88fc1f0",
};

const RED = "#e8453c";
const CREAM = "#fff1cf";
const TEAL = "#2bb5b0";
const YELLOW = "#ffc83d";
const BROWN = "#8a5a3a";
const DARK = "#2b1f3a";
const METAL = "#7b7f8e";
const BRASS = "#d9a441";
const WOOD = "#c98a4b";
const SKIN = "#f2b48a";
const GLASS = "#bfe9f2";
const TIRE = "#2d2a38";
const TAN = "#e4c58f";

const RED_CEL = cel(RED);
const CREAM_CEL = cel(CREAM, "#f1d3a4");
const TEAL_CEL = cel(TEAL);
const YELLOW_CEL = cel(YELLOW);

const hullBase = countershade(RED_CEL, CREAM_CEL, { level: -0.4 });
const hullPaint = paint((p) => {
  const band = (p.z < -1.9 && p.z > -2.25) || (p.z > 0.72 && p.z < 0.86);
  return band ? CREAM_CEL : hullBase;
});

const cowlPaint = paint((_p, _n, s) => (s[0] > 0.46 ? YELLOW_CEL : s[0] < 0.1 ? CREAM_CEL : TEAL_CEL));

const bladePaint = paint((p) => (Math.abs(p.y - 1.25) > 0.8 ? YELLOW : WOOD));

const finPaint = paint((p) => (Math.floor((p.y - 0.95) / 0.16) % 2 === 0 ? CREAM_CEL : RED_CEL));

function wingPaint(half: number, chord: number) {
  return paint((p, n, s) => {
    if (Math.abs(p.x) > half - 0.6) return Math.abs(p.x) > half - 0.67 ? RED_CEL : YELLOW_CEL;
    if (s[1] > chord / 2 - 0.17) return TEAL_CEL;
    if (Math.abs(n.y) > 0.5) {
      const f = (((p.x / 0.55) % 1) + 1) % 1;
      if (Math.abs(f - 0.5) > 0.47) return TAN;
    }
    return CREAM_CEL;
  });
}

const ROUNDEL = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#22112f"/>
  <circle cx="50" cy="50" r="44" fill="#ffc83d"/>
  <circle cx="50" cy="50" r="34" fill="#e8453c"/>
  <circle cx="50" cy="50" r="24" fill="#fff1cf"/>
  <polygon points="50,28 56,43 72,43 59,53 64,69 50,60 36,69 41,53 28,43 44,43" fill="#2bb5b0" stroke="#22112f" stroke-width="2"/>
  </svg>`,
  { size: 128 },
);

const NAME = svg(
  `<svg viewBox="0 0 200 60">
  <text x="100" y="44" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="42" fill="#fff1cf" stroke="#22112f" stroke-width="3" paint-order="stroke">SKYLARK</text>
  </svg>`,
  { size: 512 },
);

function wingOutline(half: number, chord: number): OutlinePoint[] {
  const c = chord / 2;
  return [
    [-half, -c * 0.5],
    [-half + 0.3, -c],
    [half - 0.3, -c],
    [half, -c * 0.5],
    [half, c * 0.5],
    [half - 0.3, c],
    [-half + 0.3, c],
    [-half, c * 0.5],
  ];
}

export default function build() {
  const b = createBuilder({ name: "barnstormerBiplane" });

  // ---------------- skeleton ----------------
  const body = b.joint("body", { at: [0, 1.25, 0], dir: [0, 0, 1] });
  const prop = b.joint("prop", { parent: body, at: [0, 1.25, 1.64], dir: [0, 0, 1], role: "hinge" });
  const head = b.joint("head", { parent: body, at: [0, 2.05, -0.45], dir: [0, 1, 0], role: "head" });
  const elevator = b.joint("elevator", { parent: body, at: [0, 1.0, -3.2], dir: [1, 0, 0], role: "hinge" });
  const rudder = b.joint("rudder", { parent: body, at: [0, 1.0, -3.25], dir: [0, 1, 0], role: "hinge" });
  const aileron: Record<string, ReturnType<typeof b.joint>> = {};
  const wheel: Record<string, ReturnType<typeof b.joint>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    aileron[side] = b.joint(`aileron${side}`, { parent: body, at: [s * 2.1, 2.45, -0.13], dir: [s, 0, 0], role: "hinge" });
    wheel[side] = b.joint(`wheel${side}`, { parent: body, at: [s * 0.85, 0.46, 0.7], dir: [s, 0, 0], role: "hinge" });
  }

  const P = (g: THREE.BufferGeometry, c: Fill, o: PartOptions = {}) => b.part(g, c, { bone: body, ...o });

  // ---------------- fuselage ----------------
  const fuselage = b.loft(
    [
      { at: [0, 1.25, 1.25], w: 0.95, h: 1.05 },
      { at: [0, 1.25, 0.5], w: 1.12, h: 1.22 },
      { at: [0, 1.22, -0.6], w: 1.0, h: 1.1 },
      { at: [0, 1.15, -1.6], w: 0.68, h: 0.74 },
      { at: [0, 1.07, -2.5], w: 0.32, h: 0.42 },
      { at: [0, 1.0, -3.3], w: 0.12, h: 0.18 },
    ],
    { bone: body, color: hullPaint },
  );
  for (const s of [1, -1]) {
    b.decal(fuselage, NAME, { at: [s * 0.3, 1.18, -1.35], dir: [s, 0, 0], size: [0.95, 0.3] });
  }

  // turtle deck behind the pilot, cream
  P(new THREE.SphereGeometry(1, 8, 6), CREAM_CEL, { at: [0, 1.74, -1.0], scale: [0.3, 0.2, 0.55] });

  // cockpit rim + dark well
  P(new THREE.TorusGeometry(0.4, 0.045, 5, 14).rotateX(Math.PI / 2), BROWN, { at: [0, 1.83, -0.45], scale: [0.85, 1, 1.3] });
  P(new THREE.CircleGeometry(0.38, 14).rotateX(-Math.PI / 2), DARK, { at: [0, 1.825, -0.45], scale: [0.85, 1, 1.3] });
  // windscreen
  P(new THREE.BoxGeometry(0.62, 0.3, 0.03), GLASS, { at: [0, 1.98, 0.02], rotation: [-22, 0, 0] });
  P(new THREE.BoxGeometry(0.66, 0.035, 0.05), BRASS, { at: [0, 2.12, -0.03], rotation: [-22, 0, 0] });

  // ---------------- cowl, engine details ----------------
  P(
    new THREE.BufferGeometry(),
    TEAL,
    {},
  ).mesh.visible = false;
  b.lathe(
    [
      [0, 0],
      [0.52, 0],
      [0.6, 0.1],
      [0.6, 0.35],
      [0.5, 0.5],
      [0.2, 0.58],
      [0, 0.6],
    ],
    { at: [0, 1.25, 1.0], axis: [0, 0, 1], bone: body, color: cowlPaint, segments: 14 },
  );
  b.ring(
    { at: [0, 1.25, 1.3], axis: [0, 0, 1] },
    { count: 8, radius: 0.6 },
    (it) => b.stick(new THREE.BoxGeometry(0.1, 0.06, 0.14), DARK, it, { bone: body, embed: 0.3 }),
  );
  b.ring(
    { at: [0, 1.25, 1.5], axis: [0, 0, 1] },
    { count: 20, radius: 0.52 },
    (it) => b.stick(new THREE.SphereGeometry(0.022, 5, 4), BRASS, it, { bone: body, embed: 0.4 }),
  );
  for (const s of [1, -1]) {
    for (const y of [1.5, 1.0]) P(new THREE.SphereGeometry(0.12, 6, 4), TEAL, { at: [s * 0.6, y, 1.25], scale: [0.7, 1, 1.3] });
    b.sweep(
      catmull([
        [s * 0.55, 1.05, 1.45],
        [s * 0.66, 0.97, 1.1],
        [s * 0.66, 0.93, 0.55],
      ]),
      0.05,
      METAL,
      { bone: body, sides: 6, caps: { start: "round", end: "flat" } },
    );
    P(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 6), DARK, { at: [s * 0.66, 0.93, 0.54], rotation: [90, 0, 0] });
  }

  // ---------------- propeller ----------------
  b.part(new THREE.ConeGeometry(0.17, 0.3, 10), YELLOW, { bone: prop, at: [0, 1.25, 1.76], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 10), BRASS, { bone: prop, at: [0, 1.25, 1.64], dir: [0, 0, 1] });
  for (const sgn of [1, -1]) {
    b.extrude(
      [
        [-0.08, 0.05],
        [0.08, 0.05],
        [0.13, 0.85],
        [0, 1.0],
        [-0.13, 0.85],
      ],
      { at: [0, 1.25, 1.68], x: [1, 0, 0], y: [0, sgn, 0], thickness: 0.035, bevel: 0.01, bone: prop, color: bladePaint },
    );
  }

  // ---------------- wings ----------------
  const UPPER = { y: 2.45, z: 0.55, half: 3.9, chord: 1.3 };
  const LOWER = { y: 0.95, z: 0.3, half: 3.4, chord: 1.15 };
  for (const w of [UPPER, LOWER]) {
    b.extrude(wingOutline(w.half, w.chord), {
      at: [0, w.y, w.z],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: w === UPPER ? 0.12 : 0.1,
      bevel: 0.03,
      smoothing: 1,
      bone: body,
      color: wingPaint(w.half, w.chord),
    });
  }
  for (const s of [1, -1]) {
    // roundels
    P(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", {
      at: [s * 2.3, UPPER.y + 0.064, UPPER.z],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: ROUNDEL,
    });
    P(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", {
      at: [s * 2.0, LOWER.y - 0.054, LOWER.z],
      dir: [0, -1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: ROUNDEL,
    });
    // ailerons
    const side = s > 0 ? "L" : "R";
    P(new THREE.BoxGeometry(1.5, 0.06, 0.3), RED, { bone: aileron[side], at: [s * 2.85, 2.45, -0.28] });
    for (const x of [2.4, 3.3]) P(new THREE.BoxGeometry(0.06, 0.07, 0.34), BRASS, { bone: aileron[side], at: [s * x, 2.45, -0.2] });
    // nav lights
    glow(P(new THREE.SphereGeometry(0.07, 6, 4), s > 0 ? "#ff5a5a" : "#4be889", { at: [s * 3.92, 2.45, UPPER.z] }), 1.4);
    glow(P(new THREE.SphereGeometry(0.06, 6, 4), s > 0 ? "#ff5a5a" : "#4be889", { at: [s * 3.4, 0.95, LOWER.z] }), 1.4);
  }

  // cabane + interplane struts
  for (const s of [1, -1]) {
    for (const z of [0.9, 0.2]) b.rod([s * 0.18, 1.78, z], [s * 0.55, 2.42, z], 0.035, CREAM, { bone: body, sides: 6 });
    for (const x of [1.7, 3.0]) {
      for (const [zl, zu] of [
        [0.65, 0.95],
        [-0.05, 0.15],
      ]) {
        b.rod([s * x, 1.0, zl], [s * x, 2.4, zu], 0.035, CREAM, { bone: body, sides: 6 });
        P(new THREE.SphereGeometry(0.05, 5, 4), BRASS, { at: [s * x, 1.0, zl] });
        P(new THREE.SphereGeometry(0.05, 5, 4), BRASS, { at: [s * x, 2.4, zu] });
      }
    }
    // cross wires
    for (const [zl, zu] of [
      [0.65, 0.95],
      [-0.05, 0.15],
    ]) {
      b.rod([s * 1.7, 1.02, zl], [s * 3.0, 2.38, zu], 0.01, DARK, { bone: body, sides: 4 });
      b.rod([s * 3.0, 1.02, zl], [s * 1.7, 2.38, zu], 0.01, DARK, { bone: body, sides: 4 });
    }
    b.rod([s * 0.2, 1.0, 0.5], [s * 1.7, 1.0, 0.5], 0.01, DARK, { bone: body, sides: 4 });
  }

  // bunting rope + flags along the upper wing front
  const ropePts: number[][] = [];
  const dropY = (x: number) => 2.34 - 0.14 * (1 - (x / 3) ** 2);
  for (let i = 0; i <= 14; i++) {
    const x = -3 + (6 * i) / 14;
    ropePts.push([x, dropY(x), 1.02]);
  }
  b.sweep(catmull(ropePts), 0.008, DARK, { bone: body, sides: 4 });
  const FLAGS = [RED, YELLOW, TEAL, CREAM];
  for (let i = 1; i < 14; i++) {
    b.extrude(
      [
        [-0.09, 0],
        [0.09, 0],
        [0, -0.22],
      ],
      { at: ropePts[i], x: [1, 0, 0], thickness: 0.01, bone: body, color: FLAGS[i % 4] },
    );
  }

  // ---------------- tail ----------------
  b.extrude(wingOutline(1.3, 0.8), {
    at: [0, 1.0, -2.85],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.08,
    bevel: 0.02,
    smoothing: 1,
    bone: body,
    color: wingPaint(1.3, 0.8),
  });
  b.part(new THREE.BoxGeometry(2.4, 0.05, 0.28), RED, { bone: elevator, at: [0, 1.0, -3.37] });
  b.extrude(
    [
      [0, 0],
      [1.1, 0],
      [0.8, 0.55],
      [0.35, 0.9],
      [0, 0.9],
    ],
    { at: [0, 1.0, -3.25], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.07, bevel: 0.02, bone: body, color: RED_CEL },
  );
  b.extrude(
    [
      [0, 0],
      [-0.28, 0.05],
      [-0.3, 0.75],
      [-0.1, 0.98],
      [0, 0.95],
    ],
    { at: [0, 1.0, -3.25], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.06, bevel: 0.02, bone: rudder, color: finPaint },
  );
  // tail skid
  b.sweep(
    catmull([
      [0, 1.0, -3.05],
      [0, 0.5, -3.3],
      [0, 0.14, -3.35],
    ]),
    [0.04, 0.03],
    METAL,
    { bone: body, sides: 6 },
  );
  P(new THREE.SphereGeometry(0.1, 6, 4), DARK, { at: [0, 0.06, -3.35], scale: [1, 0.6, 1.8] });

  // ---------------- landing gear ----------------
  b.rod([-0.85, 0.46, 0.7], [0.85, 0.46, 0.7], 0.035, METAL, { bone: body, sides: 6 });
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const z of [0.95, 0.4]) b.rod([s * 0.32, 0.85, z], [s * 0.85, 0.46, 0.7], 0.04, CREAM, { bone: body, sides: 6 });
    P(new THREE.SphereGeometry(0.06, 5, 4), BRASS, { at: [s * 0.32, 0.85, 0.95] });
    P(new THREE.SphereGeometry(0.06, 5, 4), BRASS, { at: [s * 0.32, 0.85, 0.4] });
    const w = wheel[side];
    b.part(new THREE.TorusGeometry(0.35, 0.12, 6, 14), TIRE, { bone: w, at: [s * 0.92, 0.46, 0.7], dir: [1, 0, 0], axis: "z" });
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.16, 12), CREAM, { bone: w, at: [s * 0.92, 0.46, 0.7], dir: [1, 0, 0] });
    b.part(new THREE.ConeGeometry(0.09, 0.1, 8), RED, { bone: w, at: [s * 1.02, 0.46, 0.7], dir: [s, 0, 0] });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      b.rod([s * 1.0, 0.46, 0.7], [s * 1.0, 0.46 + 0.27 * Math.cos(a), 0.7 + 0.27 * Math.sin(a)], 0.012, RED, { bone: w, sides: 4 });
    }
  }

  // ---------------- pilot ----------------
  P(new THREE.SphereGeometry(1, 8, 6), BROWN, { at: [0, 1.85, -0.45], scale: [0.28, 0.3, 0.24] });
  for (const s of [1, -1]) {
    b.capsule([s * 0.26, 1.9, -0.45], [s * 0.14, 1.9, -0.1], 0.065, BROWN, { bone: body, sides: 6 });
    P(new THREE.SphereGeometry(0.07, 6, 4), SKIN, { at: [s * 0.14, 1.9, -0.08] });
  }
  b.rod([0, 1.6, -0.1], [0, 1.95, -0.12], 0.02, METAL, { bone: body, sides: 5 });
  P(new THREE.SphereGeometry(0.04, 5, 4), RED, { at: [0, 1.96, -0.12] });

  const H = (g: THREE.BufferGeometry, c: Fill, o: PartOptions = {}) => b.part(g, c, { bone: head, ...o });
  H(new THREE.SphereGeometry(0.21, 10, 8), SKIN, { at: [0, 2.2, -0.45] });
  H(new THREE.SphereGeometry(0.235, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), BROWN, { at: [0, 2.22, -0.45] });
  for (const s of [1, -1]) {
    H(new THREE.BoxGeometry(0.04, 0.12, 0.14), BROWN, { at: [s * 0.215, 2.14, -0.45] });
    H(new THREE.SphereGeometry(0.04, 5, 4), "#ff9f9f", { at: [s * 0.17, 2.1, -0.3], scale: [1, 0.8, 0.6] });
    // googly goggle eyes
    H(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 10), "#ffffff", { at: [s * 0.095, 2.23, -0.27], dir: [0, 0, 1] });
    H(new THREE.TorusGeometry(0.078, 0.016, 4, 10), BRASS, { at: [s * 0.095, 2.23, -0.25], dir: [0, 0, 1], axis: "z" });
    H(new THREE.SphereGeometry(0.03, 5, 4), DARK, { at: [s * 0.09, 2.22, -0.235] });
    H(new THREE.SphereGeometry(0.04, 5, 4), RED, { at: [s * 0.09, 2.14, -0.28], scale: [1.8, 0.5, 0.7] });
  }
  H(new THREE.TorusGeometry(0.225, 0.02, 4, 12), BROWN, { at: [0, 2.24, -0.45], dir: [0, 1, 0], axis: "z" });
  H(new THREE.SphereGeometry(0.045, 6, 4), "#f08a7a", { at: [0, 2.17, -0.24] });
  H(new THREE.SphereGeometry(0.05, 6, 4), DARK, { at: [-0.05, 2.12, -0.26], scale: [1.8, 0.6, 0.8] });
  H(new THREE.SphereGeometry(0.05, 6, 4), DARK, { at: [0.05, 2.12, -0.26], scale: [1.8, 0.6, 0.8] });
  H(new THREE.TorusGeometry(0.2, 0.05, 5, 12).rotateX(Math.PI / 2), RED, { at: [0, 2.0, -0.45] });

  const scarf = b.chain(
    "scarf",
    catmull([
      [0, 1.98, -0.55],
      [0, 1.97, -0.85],
      [0.05, 2.0, -1.3],
      [0, 2.05, -1.8],
    ]),
    { parent: head, role: "tail" },
  );
  b.sweep(scarf, (t) => [0.08, 0.012 + 0.0 * t], RED, { section: "box", caps: "flat" });

  return b.root;
}
