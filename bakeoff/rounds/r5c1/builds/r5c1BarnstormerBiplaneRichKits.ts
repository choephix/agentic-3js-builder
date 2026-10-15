import * as THREE from "three";
import { createBuilder, catmull, paint, svg } from "../../../../src/index";
import { coil, metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A whimsical open-cockpit barnstormer biplane: stitched cream wings with checkered tips, a cherry-red belly with a wavy racing stripe, a mustachioed pilot, a goggled dog passenger, a rubber-duck mascot, trailing wingtip ribbons and rigged control surfaces.",
};

// ---------- palette ----------
const RED = "#d9382c";
const DEEPRED = "#a52a28";
const CREAM = "#fbf0cf";
const TEAL = "#2bb3a6";
const FABRIC = "#f3e3b2";
const RIB = "#dcc690";
const YELLOW = "#ffc83d";
const WOOD = "#b97a3e";
const LEATHER = "#7a4a2a";
const DARK = "#2a2430";
const TIRE = "#2d2a33";
const SKIN = "#f0b28a";
const GLASS = "#bfe9f2";
const AMBER = "#ffcf4a";
const WIRE = "#3a3642";
const FITTING = "#e0aa44";
const DOGFUR = "#c58a52";
const DOGEAR = "#7d4e2c";
const PINK = "#ff8fa3";

type P = [number, number];

const arcPts = (cx: number, cy: number, r: number, a0: number, a1: number, n = 3): P[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as P;
  });

// Plan-form outline of a wing-like surface, symmetric about x = 0 (x = span, y = chord direction).
function planform(
  half: number,
  lead: number,
  trail: number,
  rLead: number,
  rTrail: number,
  notch?: { x: number; y: number },
): P[] {
  const right: P[] = [];
  if (notch) {
    right.push([notch.x, trail], [notch.x, notch.y], [half, notch.y]);
  } else if (rTrail > 0) {
    right.push(...arcPts(half - rTrail, trail + rTrail, rTrail, -90, 0));
  } else {
    right.push([half, trail]);
  }
  if (rLead > 0) right.push(...arcPts(half - rLead, lead - rLead, rLead, 0, 90));
  else right.push([half, lead]);
  const left = right
    .slice()
    .reverse()
    .map(([x, y]) => [-x, y] as P);
  return [...right, ...left];
}

const tri = (x: number) => Math.abs(x - Math.floor(x) - 0.5) * 2;

const wingPaint = (half: number) =>
  paint((_p, _n, s) => {
    const ax = Math.abs(s[0]);
    if (ax > half - 0.75) {
      const chk = (Math.floor(ax / 0.25) + Math.floor((s[1] + 2) / 0.25)) % 2 === 0;
      return chk ? TEAL : CREAM;
    }
    if (ax % 0.62 < 0.035) return RIB;
    return FABRIC;
  });

const BODY = paint((p, n) => {
  const wave = 1.38 + 0.045 * Math.sin(p.z * 5.5);
  if (Math.abs(n.x) > 0.35 && Math.abs(p.y - wave) < 0.055 && p.z > -2.8 && p.z < 1.55) return CREAM;
  if (p.z < -1.75 - 0.12 * tri(p.y / 0.16)) return TEAL;
  if (n.y < -0.5) return DEEPRED;
  return RED;
});

const AILERON = paint((_p, _n, s) => (Math.floor((s[0] + 1) / 0.4) % 2 ? CREAM : RED));
const RUDDER = paint((_p, _n, s) => {
  const k = Math.floor(s[1] / 0.2) % 3;
  return k === 0 ? RED : k === 1 ? CREAM : TEAL;
});
const PROP = paint((_p, _n, s) => (s[0] > 0.93 ? YELLOW : "#c98a4a"));

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="46" fill="#ffd23f" stroke="#2b2233" stroke-width="5"/>
    <circle cx="50" cy="50" r="34" fill="#d6402f"/>
    <path d="M50 14 L56 40 L84 40 L61 56 L70 82 L50 66 L30 82 L39 56 L16 40 L44 40Z" fill="#fff4d2" opacity="0.35"/>
    <text x="50" y="69" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="54" fill="#fff4d2">7</text>
  </svg>`,
  { size: 256 },
);

const HUB = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="49" fill="#d9382c"/>
    <g stroke="#fbf0cf" stroke-width="9" stroke-linecap="round">
      <path d="M50 50 L50 8"/><path d="M50 50 L86 29"/><path d="M50 50 L86 71"/>
      <path d="M50 50 L50 92"/><path d="M50 50 L14 71"/><path d="M50 50 L14 29"/>
    </g>
    <circle cx="50" cy="50" r="13" fill="#ffc83d" stroke="#2a2430" stroke-width="4"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "barnstormer" });

  // ---------- skeleton ----------
  const body = b.joint("body", { at: [0, 1.35, 0] });
  const prop = b.joint("prop", { parent: body, at: [0, 1.35, 2.3], dir: [0, 0, 1] });
  const rudder = b.joint("rudder", { parent: body, at: [0, 1.5, -2.65], dir: [0, 1, 0], role: "hinge" });
  const elevator = b.joint("elevator", { parent: body, at: [0, 1.5, -2.45], dir: [0, 0, -1], role: "hinge" });
  const tailWheel = b.joint("tailWheel", { parent: body, at: [0, 0.16, -2.95], dir: [1, 0, 0] });

  const BRASS_COWL = metal("brass", { polish: 0.7, tarnish: 0.05, size: 0.45 });
  const STEEL = metal("steel");
  const IRON = metal("iron");

  // ---------- fuselage ----------
  const fus = b.loft(
    [
      { at: [0, 1.58, -3.3], w: 0.08, h: 0.16 },
      { at: [0, 1.54, -2.6], w: 0.2, h: 0.32 },
      { at: [0, 1.47, -1.7], w: 0.42, h: 0.58 },
      { at: [0, 1.4, -0.7], w: 0.72, h: 0.86 },
      { at: [0, 1.35, 0.4], w: 0.88, h: 1.0 },
      { at: [0, 1.35, 1.5], w: 0.9, h: 1.0 },
    ],
    { color: BODY, bone: body },
  );

  // numbered roundels on both flanks
  for (const s of [1, -1])
    b.decal(fus, EMBLEM, { at: [s * 0.3, 1.4, -1.0], dir: [s, 0, 0], size: [0.6, 0.6], bone: body });

  // ---------- engine ----------
  const cowl = b.lathe(
    [
      [0, 0],
      [0.52, 0],
      [0.6, 0.1],
      [0.62, 0.28],
      [0.58, 0.44],
      [0.45, 0.54],
      [0.25, 0.59],
      [0, 0.6],
    ],
    { at: [0, 1.35, 1.45], axis: [0, 0, 1], segments: 14, color: BRASS_COWL, bone: body },
  );

  // exposed radial cylinders on the nose
  const cylRing = b.ring({ at: [0, 1.35, 2.0], axis: [0, 0, 1] }, { count: 7, radius: 0.38 });
  for (const it of cylRing.items) {
    b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.24, 8), IRON, { bone: body, at: it.at, dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 8), STEEL, {
      bone: body,
      at: [it.at.x, it.at.y, it.at.z + 0.1],
      dir: [0, 0, 1],
    });
  }
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 10), STEEL, { bone: prop, at: [0, 1.35, 2.2], dir: [0, 0, 1] });
  b.part(new THREE.ConeGeometry(0.19, 0.36, 10), metal("gilt"), {
    bone: prop,
    at: [0, 1.35, 2.4],
    dir: [0, 0, 1],
  });

  // propeller: two fat blades with yellow tips
  const blade: P[] = [
    [0, -0.09],
    [0.55, -0.17],
    [1.0, -0.12],
    [1.15, 0],
    [1.0, 0.12],
    [0.55, 0.17],
    [0, 0.09],
  ];
  b.extrude(blade, {
    at: [0, 1.35, 2.3],
    x: [0, 1, 0],
    y: [1, 0, 0],
    thickness: 0.05,
    bevel: 0.012,
    color: PROP,
    bone: prop,
  });
  b.extrude(blade, {
    at: [0, 1.35, 2.3],
    x: [0, -1, 0],
    y: [1, 0, 0],
    thickness: 0.05,
    bevel: 0.012,
    color: PROP,
    bone: prop,
  });

  // exhaust pipes
  for (const s of [1, -1]) {
    const pipe = catmull([
      [s * 0.52, 1.1, 1.85],
      [s * 0.62, 1.2, 1.5],
      [s * 0.6, 1.25, 1.1],
    ]);
    b.sweep(pipe, [0.045, 0.06], IRON, { bone: body, caps: "flat", sides: 6 });
  }

  // rubber duck mascot on the cowl
  const cowlTop = b.surface(cowl).ray([0, 3, 1.73], [0, -1, 0])!;
  const dc = cowlTop.at;
  b.part(new THREE.SphereGeometry(0.1, 8, 6), YELLOW, { bone: body, at: [dc.x, dc.y + 0.06, dc.z], scale: [1, 0.85, 1.2] });
  b.part(new THREE.SphereGeometry(0.065, 8, 6), YELLOW, { bone: body, at: [dc.x, dc.y + 0.17, dc.z + 0.07] });
  b.part(new THREE.ConeGeometry(0.03, 0.07, 6), "#ff8a1c", { bone: body, at: [dc.x, dc.y + 0.16, dc.z + 0.15], dir: [0, 0, 1] });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.012, 5, 4), DARK, { bone: body, at: [dc.x + s * 0.035, dc.y + 0.2, dc.z + 0.11] });
  b.part(new THREE.ConeGeometry(0.04, 0.09, 5), YELLOW, { bone: body, at: [dc.x, dc.y + 0.1, dc.z - 0.13], dir: [0, 0.4, -1] });

  // ---------- wings ----------
  // upper wing with notches for the ailerons
  b.extrude(planform(4.0, 0.65, -0.65, 0.3, 0, { x: 2.0, y: -0.2 }), {
    at: [0, 2.55, 1.0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: [0.05, 0.17],
    bevel: 0.012,
    color: wingPaint(4.0),
    bone: body,
  });
  // lower wing
  b.extrude(planform(3.7, 0.58, -0.58, 0.28, 0.2), {
    at: [0, 1.0, 0.7],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: [0.05, 0.15],
    bevel: 0.012,
    color: wingPaint(3.7),
    bone: body,
  });

  // ailerons on hinge joints
  const ar = 0.2;
  const aileronOutline: P[] = [[-1, 0], [-1, -0.45], ...arcPts(1 - ar, -0.45 + ar, ar, -90, 0), [1, 0]];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const aj = b.joint(`aileron${side}`, { parent: body, at: [s * 3, 2.55, 0.8], dir: [s, 0, 0], role: "hinge" });
    b.extrude(aileronOutline, {
      at: aj.at,
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: [0.04, 0.08],
      bevel: 0.01,
      color: AILERON,
      bone: aj,
    });
  }

  // ---------- tail ----------
  b.extrude(
    [
      [0.75, 0],
      [0, 0],
      [0, 1.02],
      [0.2, 1.08],
    ],
    { at: rudder.at, thickness: 0.09, bevel: 0.015, color: TEAL, bone: body },
  );
  b.extrude(
    [
      [0, 0],
      [-0.55, 0.05],
      [-0.72, 0.5],
      [-0.5, 1.0],
      [0, 1.02],
    ],
    { at: rudder.at, thickness: 0.08, bevel: 0.012, color: RUDDER, bone: rudder },
  );
  b.extrude(planform(1.25, 0.55, 0, 0.25, 0), {
    at: [0, 1.5, -2.45],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: [0.05, 0.1],
    bevel: 0.01,
    color: TEAL,
    bone: body,
  });
  b.extrude(planform(1.25, 0, -0.45, 0, 0.2), {
    at: elevator.at,
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: [0.03, 0.06],
    bevel: 0.008,
    color: RED,
    bone: elevator,
  });

  // ---------- struts, cabane, wires ----------
  for (const s of [1, -1]) {
    const struts: [number[], number[]][] = [
      [[s * 2.4, 1.0, 1.05], [s * 2.4, 2.55, 1.35]],
      [[s * 2.4, 1.0, 0.4], [s * 2.4, 2.55, 0.7]],
    ];
    for (const [lo, hi] of struts) {
      b.rod(lo, hi, 0.045, WOOD, { bone: body, sides: 6 });
      b.part(new THREE.SphereGeometry(0.065, 6, 5), FITTING, { bone: body, at: [lo[0], lo[1] + 0.07, lo[2]] });
      b.part(new THREE.SphereGeometry(0.065, 6, 5), FITTING, { bone: body, at: [hi[0], hi[1] - 0.09, hi[2]] });
    }
    // cross wires inside the bay
    b.rod([s * 2.4, 1.05, 1.05], [s * 2.4, 2.5, 0.7], 0.01, WIRE, { bone: body, sides: 4 });
    b.rod([s * 2.4, 1.05, 0.4], [s * 2.4, 2.5, 1.35], 0.01, WIRE, { bone: body, sides: 4 });
    // flying wires to the fuselage
    b.rod([s * 0.45, 1.03, 0.7], [s * 2.4, 2.5, 1.0], 0.01, WIRE, { bone: body, sides: 4 });
    b.rod([s * 0.45, 1.03, 1.0], [s * 2.4, 2.5, 0.7], 0.01, WIRE, { bone: body, sides: 4 });
    // cabane struts
    b.rod([s * 0.34, 1.8, 1.35], [s * 0.66, 2.55, 1.4], 0.04, WOOD, { bone: body, sides: 6 });
    b.rod([s * 0.46, 1.72, 0.3], [s * 0.7, 2.55, 0.6], 0.04, WOOD, { bone: body, sides: 6 });
  }

  // ---------- landing gear ----------
  b.rod([-1.05, 0.485, 1.1], [1.05, 0.485, 1.1], 0.035, STEEL, { bone: body, sides: 8 });
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wheel = b.joint(`wheel${side}`, { parent: body, at: [s * 1.05, 0.485, 1.1], dir: [s, 0, 0] });
    b.rod([s * 0.4, 1.0, 1.3], [s * 1.05, 0.5, 1.1], 0.05, IRON, { bone: body, sides: 6 });
    b.rod([s * 0.4, 1.0, 0.5], [s * 1.05, 0.5, 1.1], 0.05, IRON, { bone: body, sides: 6 });
    b.sweep(coil([s * 0.58, 0.88, 1.25], [s * 0.78, 0.72, 1.19], 0.075, 5), 0.013, STEEL, { bone: body, sides: 4 });
    b.part(new THREE.TorusGeometry(0.335, 0.15, 8, 16), TIRE, { bone: wheel, at: wheel.at, dir: [s, 0, 0], axis: "z" });
    b.part(new THREE.CylinderGeometry(0.24, 0.24, 0.32, 14), RED, { bone: wheel, at: wheel.at, dir: [s, 0, 0] });
    b.part(new THREE.CircleGeometry(0.235, 14), "#ffffff", {
      bone: wheel,
      at: [s * (1.05 + 0.164), 0.485, 1.1],
      dir: [s, 0, 0],
      axis: "z",
      texture: HUB,
    });
  }
  // tail wheel
  b.rod([0, 1.3, -2.55], [0, 0.2, -2.95], 0.04, IRON, { bone: body, sides: 6 });
  b.part(new THREE.TorusGeometry(0.1, 0.06, 6, 10), TIRE, { bone: tailWheel, at: tailWheel.at, dir: [1, 0, 0], axis: "z" });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 8), YELLOW, { bone: tailWheel, at: tailWheel.at, dir: [1, 0, 0] });

  // ---------- cockpits ----------
  const skin = b.surface(fus);
  const pz = -0.75;
  const dz = 0.65;
  for (const z of [pz, dz]) {
    const hit = skin.ray([0, 3, z], [0, -1, 0])!;
    b.stick(new THREE.CylinderGeometry(0.24, 0.24, 0.05, 12), DARK, hit, { embed: 0.3, bone: body });
    b.lathe(
      [
        [0.22, -0.02],
        [0.3, 0.0],
        [0.31, 0.07],
        [0.26, 0.1],
        [0.22, 0.05],
      ],
      { at: hit.at, axis: [0, 1, 0], segments: 14, color: LEATHER, bone: body },
    );
    // windscreen
    b.part(new THREE.BoxGeometry(0.5, 0.2, 0.015), GLASS, {
      bone: body,
      at: [0, hit.at.y + 0.1, z + (z === pz ? 0.32 : 0.37)],
      rotation: [-25, 0, 0],
    });
  }

  // pilot
  const pTop = skin.ray([0, 3, pz], [0, -1, 0])!.at.y;
  b.capsule([0, pTop - 0.05, pz], [0, pTop + 0.15, pz], 0.2, LEATHER, { bone: body, sides: 8 });
  const hy = pTop + 0.45;
  b.part(new THREE.SphereGeometry(0.19, 10, 8), SKIN, { bone: body, at: [0, hy, pz] });
  b.part(new THREE.SphereGeometry(0.205, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.42), LEATHER, {
    bone: body,
    at: [0, hy + 0.02, pz - 0.02],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.05, 0.12, 0.12), LEATHER, { bone: body, at: [s * 0.19, hy - 0.04, pz] });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8), AMBER, { bone: body, at: [s * 0.08, hy + 0.04, pz + 0.17], dir: [0, 0, 1] });
    b.part(new THREE.TorusGeometry(0.062, 0.016, 5, 9), DARK, { bone: body, at: [s * 0.08, hy + 0.04, pz + 0.18] });
    b.capsule([s * 0.02, hy - 0.07, pz + 0.2], [s * 0.16, hy - 0.06, pz + 0.17], 0.02, "#5a331b", { bone: body, sides: 5 });
    b.capsule([s * 0.2, pTop + 0.15, pz + 0.02], [s * 0.2, pTop + 0.1, pz + 0.3], 0.06, "#3b6fb5", { bone: body, sides: 6 });
    b.capsule([s * 0.02, hy - 0.085, pz + 0.2], [s * 0.15, hy - 0.1, pz + 0.15], 0.024, "#3a2418", { bone: body, sides: 5 });
    b.capsule([s * 0.15, hy - 0.1, pz + 0.15], [s * 0.2, hy - 0.04, pz + 0.1], 0.016, "#3a2418", { bone: body, sides: 5 });
    b.part(new THREE.SphereGeometry(0.06, 6, 5), SKIN, { bone: body, at: [s * 0.2, pTop + 0.1, pz + 0.34] });
  }
  b.part(new THREE.SphereGeometry(0.04, 6, 5), "#e89a78", { bone: body, at: [0, hy - 0.02, pz + 0.19] });
  b.part(new THREE.TorusGeometry(0.185, 0.016, 5, 12), DARK, { bone: body, at: [0, hy + 0.04, pz], dir: [0, 1, 0], axis: "z" });
  // scarf
  const scarf = catmull([
    [0, pTop + 0.3, pz - 0.15],
    [0.05, pTop + 0.35, pz - 0.7],
    [-0.08, pTop + 0.28, pz - 1.2],
    [0.06, pTop + 0.36, pz - 1.8],
  ]);
  b.sweep(scarf, (t) => [0.07 * (1 + t * 0.6), 0.012], {
    section: "box",
    caps: "flat",
    color: (t: number) => (Math.floor(t * 8) % 2 ? YELLOW : RED),
    bone: body,
  });

  // dog passenger
  const dTop = skin.ray([0, 3, dz], [0, -1, 0])!.at.y;
  const dy = dTop + 0.3;
  b.capsule([0, dTop - 0.05, dz], [0, dTop + 0.1, dz], 0.18, DOGFUR, { bone: body, sides: 8 });
  b.part(new THREE.SphereGeometry(0.18, 10, 8), DOGFUR, { bone: body, at: [0, dy, dz] });
  b.capsule([0, dy - 0.05, dz + 0.1], [0, dy - 0.06, dz + 0.24], 0.075, "#e2b27d", { bone: body, sides: 7 });
  b.part(new THREE.SphereGeometry(0.04, 6, 5), DARK, { bone: body, at: [0, dy - 0.03, dz + 0.31] });
  b.part(new THREE.BoxGeometry(0.05, 0.015, 0.09), PINK, { bone: body, at: [0, dy - 0.12, dz + 0.24] });
  b.part(new THREE.TorusGeometry(0.17, 0.045, 5, 10), RED, { bone: body, at: [0, dTop + 0.12, dz], dir: [0, 1, 0], axis: "z" });
  b.part(new THREE.ConeGeometry(0.07, 0.14, 4), RED, { bone: body, at: [0, dTop + 0.04, dz + 0.17], dir: [0, -1, 0.2] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 6, 5), DARK, { bone: body, at: [s * 0.08, dy + 0.05, dz + 0.16] });
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 8), AMBER, { bone: body, at: [s * 0.1, dy + 0.15, dz + 0.04], dir: [0, 0.3, 1] });
    b.extrude(
      [
        [-0.07, 0],
        [0.07, 0],
        [0.1, -0.12],
        [0.02, -0.26],
        [-0.08, -0.16],
      ],
      { at: [s * 0.18, dy + 0.1, dz - 0.03], thickness: 0.035, bevel: 0.008, color: DOGEAR, bone: body },
    );
  }
  b.part(new THREE.TorusGeometry(0.17, 0.014, 5, 12), DARK, { bone: body, at: [0, dy + 0.12, dz], dir: [0, 1, 0], axis: "z" });

  // ---------- wingtip ribbons and nav lanterns ----------
  for (const s of [1, -1]) {
    const lantern = s > 0 ? "#ff4a3a" : "#3aff7a";
    glow(b.part(new THREE.SphereGeometry(0.08, 8, 6), lantern, { bone: body, at: [s * 4.05, 2.55, 1.0] }), 1.4);
    const ribbon = catmull([
      [s * 4.05, 2.55, 0.9],
      [s * 4.15, 2.62, 0.2],
      [s * 4.02, 2.5, -0.5],
      [s * 4.17, 2.6, -1.2],
      [s * 4.05, 2.5, -1.9],
    ]);
    b.sweep(ribbon, (t) => [0.09 * (1 - t * 0.3), 0.01], {
      section: "box",
      caps: "flat",
      color: (t: number) => (Math.floor(t * 9) % 2 ? RED : YELLOW),
      bone: body,
    });
  }

  return b.root;
}
