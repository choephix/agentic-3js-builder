// Barnstormer biplane, whimsical: a chubby teal fuselage, a big round red cowling with sideways googly eyes, candy-striped
// control surfaces, bunting between the wing struts, a scarfed pilot and a teddy bear passenger.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { paint, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A whimsical open-cockpit barnstormer biplane with googly-eyed cowling, candy-striped flaps, bunting, a scarfed pilot and a teddy passenger; propeller, rudder, elevators, ailerons and wheels are hinged joints.",
  style: "whimsical",
  commit: "88fc1f0",
};

const RED = "#e2442f";
const CREAM = "#fff0cf";
const TEAL = "#2bb5a6";
const YELLOW = "#ffc83d";
const WOOD = "#b9773c";
const DARK = "#3a2a3a";
const LEATHER = "#8a4b2a";
const JACKET = "#a8643a";
const METAL = "#9aa7b4";
const NAVY = "#2c3e6b";
const SKIN = "#f2b88c";
const GLASS = "#bfe8ff";
const BROWN = "#b5703a";

function starPoints(cx: number, cy: number, outer: number, inner: number) {
  const pts: string[] = [];
  for (let k = 0; k < 10; k++) {
    const a = (-90 + k * 36) * (Math.PI / 180);
    const r = k % 2 === 0 ? outer : inner;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

export default function build() {
  const b = createBuilder({ name: "barnstormerBiplane" });
  const body = b.joint("body", { at: [0, 1.3, 0] });
  const prop = b.joint("propeller", { parent: body, at: [0, 1.3, 1.65], dir: [0, 0, 1], role: "hinge" });
  const rudder = b.joint("rudder", { parent: body, at: [0, 1.45, -2.7], dir: [0, 1, 0], role: "hinge" });
  const elevL = b.joint("elevatorL", { parent: body, at: [0.03, 1.5, -2.85], dir: [1, 0, 0], role: "hinge" });
  const elevR = b.joint("elevatorR", { parent: body, at: [-0.03, 1.5, -2.85], dir: [-1, 0, 0], role: "hinge" });
  const ailL = b.joint("aileronL", { parent: body, at: [1.5, 2.25, 0], dir: [1, 0, 0], role: "hinge" });
  const ailR = b.joint("aileronR", { parent: body, at: [-1.5, 2.25, 0], dir: [-1, 0, 0], role: "hinge" });
  const wheelL = b.joint("wheelL", { parent: body, at: [0.85, 0.445, 0.9], dir: [1, 0, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: body, at: [-0.85, 0.445, 0.9], dir: [-1, 0, 0], role: "hinge" });

  const ball = (r: number, c: string, at: number[], scale?: number[], seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), c, { bone: body, at, scale });
  const rod = (p: number[], q: number[], r: number, c: string, sides = 6) =>
    b.rod(p, q, r, c, { bone: body, sides });
  const merged = (pts: number[][], r: number) =>
    mergeGeometries(pts.map((p) => new THREE.SphereGeometry(r, 6, 4).translate(p[0], p[1], p[2])))!;

  // ---- Textures ----
  const EYE = svg(
    `<svg viewBox="0 0 60 70">
      <ellipse cx="30" cy="38" rx="26" ry="29" fill="#ffffff" stroke="#2a1a2a" stroke-width="4"/>
      <circle cx="22" cy="42" r="14" fill="#2a1a2a"/>
      <circle cx="26" cy="36" r="5" fill="#ffffff"/>
      <circle cx="19" cy="48" r="2.4" fill="#ffffff"/>
      <path d="M6 11 Q30 1 54 12" stroke="#2a1a2a" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 256 },
  );
  const ROUNDEL = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="${NAVY}"/>
      <circle cx="50" cy="50" r="38" fill="${CREAM}"/>
      <circle cx="50" cy="50" r="29" fill="${RED}"/>
      <polygon points="${starPoints(50, 50, 24, 10)}" fill="${YELLOW}" stroke="${NAVY}" stroke-width="2.5" stroke-linejoin="round"/>
    </svg>`,
    { size: 256 },
  );
  const HATCH = svg(
    `<svg viewBox="0 0 100 60">
      <rect x="4" y="4" width="92" height="52" rx="8" fill="none" stroke="#1d4a52" stroke-width="3.5"/>
      <rect x="40" y="24" width="20" height="10" rx="4" fill="${YELLOW}" stroke="#1d4a52" stroke-width="2.5"/>
      <circle cx="13" cy="13" r="2.8" fill="#1d4a52"/><circle cx="87" cy="13" r="2.8" fill="#1d4a52"/>
      <circle cx="13" cy="47" r="2.8" fill="#1d4a52"/><circle cx="87" cy="47" r="2.8" fill="#1d4a52"/>
    </svg>`,
    { size: 256 },
  );
  const pennant = (c: string) =>
    svg(`<svg viewBox="0 0 20 24"><path d="M1 0 L19 0 L10 24 Z" fill="${c}" stroke="#2a1a2a" stroke-width="1.2" stroke-linejoin="round"/></svg>`, {
      size: 128,
    });
  const FLAGS = [pennant(RED), pennant(YELLOW), pennant(CREAM), pennant(TEAL)];

  // ---- Paints ----
  const bodyBase = stripes(TEAL, TEAL, { size: 10 }); // placeholder replaced below
  void bodyBase;
  const fuselagePaint = cel(
    paint((p, n) => {
      if (Math.abs(n.x) > 0.6 && Math.abs(p.y - 1.32) < 0.05 && p.z > -1.8) return YELLOW;
      return n.y < -0.3 ? CREAM : TEAL;
    }),
  );
  const wingPaint = (base: string, tip: string, ribC: string) =>
    cel(
      paint((_p, _n, s) => {
        const ax = Math.abs(s[0]);
        if (ax > 3.15) return tip;
        if (((ax / 0.5) % 1) < 0.05 && ax > 0.2) return ribC;
        return base;
      }),
    );
  const candy = (axis: 0 | 1, step: number) =>
    cel(paint((_p, _n, s) => (Math.floor(Math.abs(s[axis]) / step) % 2 ? RED : CREAM)));

  // ---- Fuselage ----
  const fuselage = b.loft(
    [
      { at: [0, 1.5, -3.0], w: 0.1, h: 0.16 },
      { at: [0, 1.47, -2.4], w: 0.22, h: 0.36 },
      { at: [0, 1.42, -1.7], w: 0.45, h: 0.62 },
      { at: [0, 1.36, -0.7], w: 0.72, h: 0.88 },
      { at: [0, 1.3, 0.3], w: 0.84, h: 0.96 },
      { at: [0, 1.3, 1.1], w: 0.85, h: 0.94 },
    ],
    { bone: body, color: fuselagePaint, name: "fuselage" },
  );
  for (const s of [1, -1]) {
    b.decal(fuselage, ROUNDEL, { at: [s * 0.25, 1.4, -1.6], dir: [s, 0, 0], size: [0.4, 0.4] });
    b.decal(fuselage, HATCH, { at: [s * 0.42, 1.2, 0.55], dir: [s, 0, 0], size: [0.5, 0.3] });
  }

  // ---- Cowling, spinner, propeller ----
  const cowlOutline: OutlinePoint[] = [
    [0, 0],
    [0.44, 0],
    [0.5, 0.12],
    [0.5, 0.4],
    [0.42, 0.58],
    [0.2, 0.68],
    [0, 0.7],
  ];
  const cowl = b.lathe(cowlOutline, {
    at: [0, 1.3, 0.95],
    axis: [0, 0, 1],
    segments: 14,
    bone: body,
    color: cel(paint((_p, _n, s) => (s[0] > 0.12 && s[0] < 0.2 ? YELLOW : RED))),
    name: "cowling",
  });
  const spinnerOutline: OutlinePoint[] = [
    [0, 0],
    [0.19, 0],
    [0.19, 0.04],
    [0.12, 0.2],
    [0.05, 0.3],
    [0, 0.33],
  ];
  b.lathe(spinnerOutline, {
    at: [0, 1.3, 1.63],
    axis: [0, 0, 1],
    segments: 10,
    bone: prop,
    color: cel(YELLOW),
    name: "spinner",
  });
  const blade: OutlinePoint[] = [
    [-0.06, 0.1],
    [0.06, 0.1],
    [0.14, 0.75],
    [0.05, 1.05],
    [-0.05, 1.05],
    [-0.14, 0.75],
  ];
  const bladePaint = paint((_p, _n, s) => (Math.abs(s[1]) > 0.7 ? YELLOW : WOOD));
  b.extrude(blade, { at: [0, 1.3, 1.76], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, bevel: 0.01, color: bladePaint, bone: prop, name: "bladeUp" });
  b.extrude(blade, { at: [0, 1.3, 1.76], x: [-1, 0, 0], y: [0, -1, 0], thickness: 0.035, bevel: 0.01, color: bladePaint, bone: prop, name: "bladeDown" });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8), METAL, { bone: prop, at: [0, 1.3, 1.78], axis: "y", dir: [0, 0, 1] });

  // googly eyes on the cowling sides
  for (const s of [1, -1])
    b.decal(cowl, EYE, { at: [s * 0.49, 1.42, 1.2], dir: [s, 0.15, 0.3], size: [0.2, 0.24], mirror: s < 0 });

  // cowling rivets
  const rivets: number[][] = [];
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * Math.PI * 2;
    rivets.push([0.5 * Math.cos(a), 1.3 + 0.5 * Math.sin(a), 1.25]);
  }
  b.part(merged(rivets, 0.017), METAL, { bone: body, at: [0, 0, 0] });

  // exhaust pipes
  for (const s of [1, -1])
    b.sweep(catmull([[s * 0.5, 1.12, 1.3], [s * 0.56, 1.08, 1.05], [s * 0.55, 1.05, 0.8]]), 0.035, {
      color: METAL,
      bone: body,
      sides: 6,
    });

  // rubber duck mascot
  ball(0.07, YELLOW, [0, 1.84, 1.2], [1, 0.9, 1.15]);
  ball(0.05, YELLOW, [0, 1.93, 1.27]);
  b.part(new THREE.ConeGeometry(0.02, 0.05, 5), "#ff8a1c", { bone: body, at: [0, 1.925, 1.33], dir: [0, 0, 1] });

  // ---- Wings ----
  const wingOutline: OutlinePoint[] = [
    [-3.7, -0.25],
    [-3.5, -0.45],
    [3.5, -0.45],
    [3.7, -0.25],
    [3.7, 0.4],
    [3.5, 0.6],
    [-3.5, 0.6],
    [-3.7, 0.4],
  ];
  const upper = b.extrude(wingOutline, {
    at: [0, 2.25, 0.45],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.11,
    bevel: 0.04,
    smoothing: 1,
    color: wingPaint(YELLOW, RED, "#f0a020"),
    bone: body,
    name: "wingUpper",
  });
  b.extrude(wingOutline, {
    at: [0, 0.92, 0.4],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.11,
    bevel: 0.04,
    smoothing: 1,
    color: wingPaint(YELLOW, RED, "#f0a020"),
    bone: body,
    name: "wingLower",
  });
  for (const s of [1, -1])
    b.decal(upper, ROUNDEL, { at: [s * 2.3, 2.31, 0.45], dir: [0, 1, 0], up: [0, 0, 1], size: [0.9, 0.9] });

  // ailerons
  const ailOutline: OutlinePoint[] = [
    [0, 0],
    [2.1, 0],
    [2.2, -0.15],
    [2.1, -0.3],
    [0, -0.3],
  ];
  for (const s of [1, -1])
    b.extrude(ailOutline, {
      at: [s * 1.5, 2.25, 0],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.07,
      bevel: 0.02,
      color: candy(0, 0.35),
      bone: s > 0 ? ailL : ailR,
      name: s > 0 ? "aileronL" : "aileronR",
    });

  // nav lights on lower wingtips
  glow(b.part(new THREE.SphereGeometry(0.06, 8, 6), "#ff3b3b", { bone: body, at: [3.72, 0.92, 0.4] }), 1.5);
  glow(b.part(new THREE.SphereGeometry(0.06, 8, 6), "#3bff7a", { bone: body, at: [-3.72, 0.92, 0.4] }), 1.5);

  // ---- Struts, cabane, wires ----
  const bolts: number[][] = [];
  const strut = (p: number[], q: number[]) => {
    rod(p, q, 0.035, WOOD);
    bolts.push(p, q);
  };
  for (const s of [1, -1]) {
    strut([s * 0.28, 1.62, 0.85], [s * 0.45, 2.2, 0.85]);
    strut([s * 0.28, 1.7, 0.1], [s * 0.45, 2.2, 0.1]);
    for (const x of [1.7, 3.2])
      for (const z of [0.85, 0.05]) strut([s * x, 0.96, z], [s * x, 2.2, z]);
    for (const z of [0.85, 0.05]) {
      rod([s * 1.7, 0.98, z], [s * 3.2, 2.2, z], 0.011, METAL, 4);
      rod([s * 3.2, 0.98, z], [s * 1.7, 2.2, z], 0.011, METAL, 4);
    }
    // bunting between the front struts
    const string = catmull([[s * 1.7, 1.98, 0.85], [s * 2.45, 1.84, 0.85], [s * 3.2, 1.98, 0.85]]);
    b.sweep(string, 0.008, { color: CREAM, bone: body, sides: 4, caps: "flat" });
    const hooks = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => frame(string.at(i / 10), [0, 1, 0]));
    b.cards(hooks, FLAGS, { size: [0.12, 0.16], lean: 180, flow: [0, 0, 1], rng: rng(5), bone: body });
  }
  b.part(merged(bolts, 0.03), METAL, { bone: body, at: [0, 0, 0] });

  // ---- Tail ----
  const finOutline: OutlinePoint[] = [
    [0, 0],
    [0.5, 0],
    [0.5, 0.9],
    [0.3, 0.98],
    [0.1, 0.5],
  ];
  b.extrude(finOutline, {
    at: [0, 1.45, -2.2],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.07,
    bevel: 0.02,
    color: cel(TEAL),
    bone: body,
    name: "fin",
  });
  const rudderOutline: OutlinePoint[] = [
    [0, 0],
    [0.4, 0],
    [0.5, 0.2],
    [0.45, 0.7],
    [0.25, 0.95],
    [0, 0.9],
  ];
  b.extrude(rudderOutline, {
    at: [0, 1.45, -2.7],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.06,
    bevel: 0.018,
    color: candy(1, 0.25),
    bone: rudder,
    name: "rudder",
  });
  const stabOutline: OutlinePoint[] = [
    [-1.15, -0.2],
    [-1.0, -0.3],
    [1.0, -0.3],
    [1.15, -0.2],
    [1.15, 0.1],
    [1.0, 0.25],
    [-1.0, 0.25],
    [-1.15, 0.1],
  ];
  b.extrude(stabOutline, {
    at: [0, 1.5, -2.55],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.06,
    bevel: 0.02,
    smoothing: 1,
    color: cel(TEAL),
    bone: body,
    name: "stabilizer",
  });
  const elevOutline: OutlinePoint[] = [
    [0, 0],
    [1.0, 0],
    [1.15, -0.1],
    [1.0, -0.28],
    [0, -0.28],
  ];
  for (const s of [1, -1])
    b.extrude(elevOutline, {
      at: [s * 0.03, 1.5, -2.85],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.05,
      bevel: 0.015,
      color: candy(0, 0.35),
      bone: s > 0 ? elevL : elevR,
      name: s > 0 ? "elevatorL" : "elevatorR",
    });
  for (const s of [1, -1]) rod([0, 2.35, -2.45], [s * 1.1, 1.5, -2.55], 0.01, METAL, 4);

  // tail skid wheel
  rod([0, 1.35, -2.3], [0, 0.12, -2.55], 0.03, METAL);
  b.part(new THREE.TorusGeometry(0.06, 0.04, 6, 10), DARK, { bone: body, at: [0, 0.1, -2.55], rotation: [0, 90, 0] });

  // ---- Landing gear ----
  rod([-0.85, 0.445, 0.9], [0.85, 0.445, 0.9], 0.04, METAL);
  const treads = paint((_p, _n, s) => (Math.floor(s[0] * 28) % 2 ? DARK : "#2a1d2a"));
  for (const s of [1, -1]) {
    const w = s > 0 ? wheelL : wheelR;
    rod([s * 0.25, 0.92, 0.95], [s * 0.82, 0.46, 0.9], 0.035, WOOD);
    rod([s * 0.3, 0.92, 0.45], [s * 0.82, 0.46, 0.9], 0.035, WOOD);
    b.part(new THREE.TorusGeometry(0.335, 0.115, 8, 14), treads, { bone: w, at: [s * 0.85, 0.445, 0.9], rotation: [0, 90, 0] });
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.14, 12), CREAM, { bone: w, at: [s * 0.85, 0.445, 0.9], rotation: [0, 0, 90] });
    b.part(new THREE.BoxGeometry(0.03, 0.54, 0.05), RED, { bone: w, at: [s * 0.93, 0.445, 0.9] });
    b.part(new THREE.BoxGeometry(0.03, 0.54, 0.05), RED, { bone: w, at: [s * 0.93, 0.445, 0.9], rotation: [90, 0, 0] });
    b.part(new THREE.SphereGeometry(0.07, 8, 6), YELLOW, { bone: w, at: [s * 0.95, 0.445, 0.9], scale: [0.5, 1, 1] });
  }

  // ---- Cockpits ----
  const PILOT_Z = -1.05;
  const TEDDY_Z = -0.35;
  for (const z of [PILOT_Z, TEDDY_Z]) {
    b.part(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 10), DARK, { bone: body, at: [0, 1.78, z], scale: [0.9, 1, 1.3] });
    b.part(new THREE.TorusGeometry(0.26, 0.045, 5, 12), LEATHER, { bone: body, at: [0, 1.79, z], rotation: [90, 0, 0], scale: [0.9, 1.3, 1] });
  }
  for (const [z, w] of [[-0.7, 0.55], [-0.02, 0.5]]) {
    b.part(new THREE.BoxGeometry(w + 0.04, 0.24, 0.02), DARK, { bone: body, at: [0, 1.9, z - 0.015], rotation: [-28, 0, 0] });
    b.part(new THREE.BoxGeometry(w, 0.2, 0.025), GLASS, { bone: body, at: [0, 1.9, z], rotation: [-28, 0, 0] });
  }

  // pilot
  const pz = PILOT_Z;
  ball(0.2, JACKET, [0, 1.85, pz], [1.1, 1, 0.9], 10);
  ball(0.15, SKIN, [0, 2.1, pz], undefined, 10);
  b.part(new THREE.SphereGeometry(0.17, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), LEATHER, { bone: body, at: [0, 2.12, pz], scale: [1, 0.95, 1.05] });
  b.part(new THREE.TorusGeometry(0.155, 0.015, 4, 12), LEATHER, { bone: body, at: [0, 2.13, pz], rotation: [90, 0, 0] });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.03, 8), "#ffe27a", { bone: body, at: [s * 0.065, 2.135, pz + 0.14], rotation: [90, 0, 0] });
    b.part(new THREE.TorusGeometry(0.05, 0.012, 4, 8), METAL, { bone: body, at: [s * 0.065, 2.135, pz + 0.145] });
    ball(0.04, LEATHER, [s * 0.16, 2.05, pz], [0.6, 1.2, 1]);
    ball(0.03, "#ff9aa8", [s * 0.09, 2.04, pz + 0.12], undefined, 6);
    rod([s * 0.19, 1.9, pz + 0.02], [s * 0.04, 1.93, pz + 0.2], 0.045, JACKET);
    ball(0.045, SKIN, [s * 0.04, 1.93, pz + 0.2], undefined, 6);
  }
  ball(0.03, SKIN, [0, 2.08, pz + 0.15], undefined, 6);
  b.part(new THREE.TorusGeometry(0.13, 0.05, 5, 10), RED, { bone: body, at: [0, 1.99, pz], rotation: [90, 0, 0] });
  rod([0, 1.78, pz + 0.2], [0, 1.95, pz + 0.22], 0.015, METAL, 5);
  ball(0.025, RED, [0, 1.96, pz + 0.22], undefined, 6);
  b.sweep(
    catmull([
      [0, 1.99, pz - 0.1],
      [0.05, 2.05, pz - 0.45],
      [-0.04, 2.0, pz - 0.8],
      [0.05, 2.08, pz - 1.15],
    ]),
    () => [0.07, 0.016],
    { section: "box", color: stripes(RED, CREAM, { size: 0.12, axis: "z", wobble: 0 }), bone: body, caps: "flat" },
  );

  // teddy bear passenger
  const tz = TEDDY_Z;
  ball(0.15, BROWN, [0, 1.85, tz], [1, 1, 0.9], 8);
  ball(0.115, BROWN, [0, 2.03, tz], undefined, 8);
  ball(0.05, CREAM, [0, 2.0, tz + 0.1], undefined, 6);
  ball(0.018, DARK, [0, 2.02, tz + 0.145], undefined, 5);
  for (const s of [1, -1]) {
    ball(0.04, BROWN, [s * 0.09, 2.12, tz], undefined, 6);
    ball(0.016, DARK, [s * 0.045, 2.06, tz + 0.1], undefined, 5);
    rod([s * 0.14, 1.9, tz], [s * 0.26, 2.06, tz + 0.06], 0.04, BROWN);
    b.part(new THREE.BoxGeometry(0.05, 0.04, 0.03), RED, { bone: body, at: [s * 0.03, 1.93, tz + 0.12] });
  }
  ball(0.02, RED, [0, 1.93, tz + 0.12], undefined, 5);

  return b.root;
}
