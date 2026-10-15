import * as THREE from "three";
import { createBuilder, frame, rng, lerp, catmull, bezier, paint, mix, smoothstep, noise, mottle, svg } from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { metal, coil, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Biscuit the Barnstormer",
  description:
    "A whimsical cherry-red barnstormer biplane with a copper radial cowl, a flying-pig nose badge, a moustachioed goggled pilot with a streaming scarf, rigging wires, glowing wingtip lights, and a little grass airfield with windsock, bunting, drums and a mail crate.",
};

type V3 = [number, number, number];
type Fill = string | ReturnType<typeof paint>;

// ---------- palette
const RED = "#d9432f";
const CREAM = "#f6e8bf";
const CREAM_SH = "#e3cf9b";
const TAPE = "#e8d3a0";
const TEAL = "#25a39b";
const YELLOW = "#ffcf3f";
const ORANGE = "#ff8a2a";
const WOOD = "#8a5a2e";
const WOOD_LT = "#c28b4e";
const LEATHER = "#7a4a2a";
const LEATHER_DK = "#4d2f1c";
const COAMING = "#5b3820";
const DARK = "#2a2430";
const WIRE = "#3a3340";
const RUBBER = "#2b2830";
const HUB = "#efe4c8";
const IRON = "#4a4a58";
const GLASS = "#9fdde8";
const SKIN = "#f2b488";
const NOSE = "#ee8c78";
const GINGER = "#b8651f";
const PINK = "#f59ab0";
const BRASS = "#d9a43a";
const BLUED = "#5a6fb0";
const SACK = "#cdb27c";
const WHITE = "#fbf7ea";
const BELLY = "#f1d9a0";
const DRUM = "#c8372d";
const STEM = "#4c9332";

const D = Math.PI / 180;
const fract = (x: number) => x - Math.floor(x);

// ---------- planforms (u across, v along the chord)
function planform(S: number, C: number, R: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let a = -90; a <= 90; a += 30) pts.push([S - R + R * Math.cos(a * D), (C / 2) * Math.sin(a * D)]);
  for (let a = 90; a <= 270; a += 30) pts.push([-(S - R) + R * Math.cos(a * D), (C / 2) * Math.sin(a * D)]);
  return pts;
}
function halfPlan(S: number, C: number, R: number, u0: number, s: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let a = -90; a <= 90; a += 30) pts.push([S - R + R * Math.cos(a * D), (C / 2) * Math.sin(a * D)]);
  pts.push([u0, C / 2], [u0, -C / 2]);
  const m = pts.map(([u, v]) => [s * u, v] as [number, number]);
  return s < 0 ? m.reverse() : m;
}
function rectPlan(a: number, c: number, v0: number, v1: number, s: number): [number, number][] {
  const m: [number, number][] = [
    [s * a, v0],
    [s * c, v0],
    [s * c, v1],
    [s * a, v1],
  ];
  return s < 0 ? m.reverse() : m;
}

// ---------- paints
const wingPaint = (span: number, tip: string) =>
  cel(
    paint((p, n) => {
      if (Math.abs(n.y) < 0.5) return RED;
      const ax = Math.abs(p.x);
      if (ax > span - 0.8) return tip;
      if (ax > span - 0.95) return RED;
      const rib = Math.abs(fract(p.x / 0.46 + 0.5) - 0.5) * 0.46;
      if (rib < 0.012) return TAPE;
      return mix(n.y > 0 ? CREAM : CREAM_SH, "#d9c08a", 0.55 * smoothstep(0.5, 0.85, noise(p, 0.6, 3)));
    }),
  );

const FUSELAGE = cel(
  paint((p, n) => {
    if (p.z < -2.62) return TEAL;
    if (p.z < -2.5) return CREAM;
    if (n.y < -0.5) return BELLY;
    if (n.y < -0.36) return TEAL;
    if (n.y < -0.3) return CREAM;
    return RED;
  }),
);

export default function build() {
  const b = createBuilder({ name: "biplane", paintSize: 2048 });
  const GROUND = 0.12;
  const FY = 1.55;
  const TY = 1.0;

  // ---------- textures
  const ROUNDEL = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#22112f"/><circle cx="50" cy="50" r="44" fill="#f6e8bf"/><circle cx="50" cy="50" r="34" fill="#d9432f"/><circle cx="50" cy="50" r="22" fill="#25a39b"/><polygon points="50,30 55,43.1 69,43.8 58.1,52.6 61.8,66.2 50,58.5 38.2,66.2 41.9,52.6 31,43.8 45,43.1" fill="#ffd23c" stroke="#22112f" stroke-width="2.4" stroke-linejoin="round"/></svg>`,
    { size: 256 },
  );
  const PIG = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="#22112f"/><circle cx="50" cy="50" r="44" fill="#ffd23c"/>
      <path d="M24 58 Q4 44 8 22 Q24 26 32 46Z" fill="#fff" stroke="#22112f" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M76 58 Q96 44 92 22 Q76 26 68 46Z" fill="#fff" stroke="#22112f" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M29 42 L25 20 L45 32Z" fill="#f59ab0" stroke="#22112f" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M71 42 L75 20 L55 32Z" fill="#f59ab0" stroke="#22112f" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="50" cy="57" rx="24" ry="22" fill="#f8a8bd" stroke="#22112f" stroke-width="3"/>
      <ellipse cx="50" cy="67" rx="13" ry="9.5" fill="#ffc7d4" stroke="#22112f" stroke-width="2.5"/>
      <ellipse cx="45" cy="67" rx="2.4" ry="3.4" fill="#22112f"/><ellipse cx="55" cy="67" rx="2.4" ry="3.4" fill="#22112f"/>
      <path d="M26 50 H74" stroke="#4d2f1c" stroke-width="4"/>
      <circle cx="39" cy="50" r="8.5" fill="#fff" stroke="#b5832e" stroke-width="3.5"/>
      <circle cx="61" cy="50" r="8.5" fill="#fff" stroke="#b5832e" stroke-width="3.5"/>
      <circle cx="40" cy="51" r="3.4" fill="#22112f"/><circle cx="60" cy="51" r="3.4" fill="#22112f"/>
      <path d="M28 44 Q50 22 72 44" stroke="#4d2f1c" stroke-width="5" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const NAMEPLATE = svg(
    `<svg viewBox="0 0 200 60"><rect x="3" y="3" width="194" height="54" rx="16" fill="#f6e8bf" stroke="#22112f" stroke-width="4"/><text x="100" y="42" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-style="italic" font-size="32" fill="#d9432f" stroke="#22112f" stroke-width="1">Biscuit</text><circle cx="20" cy="30" r="5" fill="#25a39b"/><circle cx="180" cy="30" r="5" fill="#25a39b"/></svg>`,
    { size: 512 },
  );
  const LENS = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#bfeaf2"/><circle cx="32" cy="38" r="26" fill="#9fdde8"/><circle cx="32" cy="34" r="16" fill="#fff" stroke="#22112f" stroke-width="2.5"/><circle cx="35" cy="37" r="8" fill="#22112f"/><circle cx="38" cy="34" r="2.8" fill="#fff"/><path d="M12 22 Q18 10 32 8" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const GAS = svg(
    `<svg viewBox="0 0 64 64"><rect x="2" y="12" width="60" height="40" rx="6" fill="#ffd23c" stroke="#22112f" stroke-width="3"/><text x="32" y="43" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="26" fill="#c8372d" stroke="#22112f" stroke-width="0.8">GAS</text></svg>`,
    { size: 128 },
  );
  const MAIL = svg(
    `<svg viewBox="0 0 64 64"><rect x="4" y="12" width="56" height="40" rx="4" fill="#f6e8bf" stroke="#22112f" stroke-width="3"/><path d="M6 14 L32 36 L58 14" fill="none" stroke="#d9432f" stroke-width="3.5" stroke-linejoin="round"/><text x="32" y="50" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="12" fill="#25a39b">AIR MAIL</text></svg>`,
    { size: 128 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 32 48"><path d="M16 48 Q10 28 3 6 Q16 24 19 48Z" fill="#5faa3c" stroke="#2f6b2a" stroke-width="1.2"/><path d="M14 48 Q15 24 16 2 Q23 26 23 48Z" fill="#7bc94e" stroke="#2f6b2a" stroke-width="1.2"/><path d="M16 48 Q22 30 30 12 Q27 34 25 48Z" fill="#4c9332" stroke="#2f6b2a" stroke-width="1.2"/></svg>`,
    { size: 128 },
  );
  const PENNANT = svg(`<svg viewBox="0 0 32 40"><path d="M2 0 H30 L16 40Z" fill="#ffffff" stroke="#dddddd" stroke-width="2"/></svg>`, { size: 64 });

  // ---------- skeleton
  const body = b.joint("fuselage", { at: [0, FY, 0], dir: [0, 0, 1], role: "spine" });
  type J = typeof body;
  const prop = b.joint("prop", { parent: body, at: [0, FY, 2.3], dir: [0, 0, 1] });
  const rudder = b.joint("rudder", { parent: body, at: [0, TY, -3.46], dir: [0, 1, 0], role: "hinge" });
  const pilotHead = b.joint("pilotHead", { parent: body, at: [0, 2.3, -0.68], dir: [0, 1, 0], role: "head" });
  const wheels: Record<string, J> = {};
  const elevators: Record<string, J> = {};
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    wheels[sd] = b.joint(`wheel${sd}`, { parent: body, at: [s * 0.9, 0.52, 0.75], dir: [s, 0, 0] });
    elevators[sd] = b.joint(`elevator${sd}`, { parent: body, at: [s * 0.65, TY, -3.42], dir: [s, 0, 0], role: "hinge" });
  }

  type PO = { bone?: J; dir?: V3; axis?: "x" | "y" | "z"; rotation?: V3; scale?: V3; texture?: THREE.Texture; flat?: boolean; name?: string };
  const P = (geo: THREE.BufferGeometry, color: Fill, at: V3, o: PO = {}) => b.part(geo, color, { bone: body, at, ...o });
  const ball = (r: number, color: Fill, at: V3, o: PO = {}) => P(new THREE.SphereGeometry(r, 8, 6), color, at, { flat: true, ...o });

  // ---------- fuselage
  const stations: { at: V3; w: number; h: number }[] = (
    [
      [1.35, 1.55, 1.0, 1.05],
      [0.5, 1.55, 0.95, 1.05],
      [-0.7, 1.5, 0.78, 0.95],
      [-1.9, 1.32, 0.52, 0.66],
      [-3.1, 1.08, 0.28, 0.4],
      [-3.75, 1.0, 0.12, 0.22],
    ] as [number, number, number, number][]
  ).map(([z, y, w, h]) => ({ at: [0, y, z] as V3, w, h }));
  const fus = b.loft(stations, { color: FUSELAGE, bone: body });
  const fusSurf = b.surface(fus);
  const topY = (z: number) => fusSurf.ray([0, 4, z], [0, -1, 0])?.at.y ?? 2.0;

  // turtle-deck headrest, coamings, windshield, mail sack
  P(new THREE.SphereGeometry(1, 10, 7), FUSELAGE, [0, topY(-1.2) + 0.02, -1.25], { scale: [0.3, 0.22, 0.55] });
  const coaming = (z: number) => {
    const y = topY(z);
    P(new THREE.CylinderGeometry(0.27, 0.27, 0.02, 14).scale(1, 1, 1.25), DARK, [0, y - 0.03, z]);
    P(new THREE.TorusGeometry(0.27, 0.06, 6, 14).rotateX(Math.PI / 2).scale(1, 1, 1.25), COAMING, [0, y - 0.015, z], { flat: true });
  };
  coaming(-0.7);
  coaming(0.12);
  b.extrude(
    [
      [-0.3, 0],
      [0.3, 0],
      [0.25, 0.22],
      [-0.25, 0.22],
    ],
    { at: [0, topY(-0.28) - 0.02, -0.28], x: [1, 0, 0], y: [0, 0.92, -0.4], thickness: 0.025, bevel: 0.008, color: GLASS, bone: body },
  );
  P(new THREE.SphereGeometry(1, 9, 7), SACK, [0, topY(0.12) + 0.05, 0.12], { scale: [0.27, 0.23, 0.25], flat: true });
  P(new THREE.TorusGeometry(0.09, 0.025, 5, 9).rotateX(Math.PI / 2), RED, [0, topY(0.12) + 0.2, 0.12], { flat: true });
  for (const s of [1, -1]) P(new THREE.ConeGeometry(0.05, 0.14, 5), SACK, [s * 0.05, topY(0.12) + 0.27, 0.12], { rotation: [0, 0, -s * 22], flat: true });

  // nameplate decals on both flanks
  for (const s of [1, -1])
    b.decal(fus, NAMEPLATE, { at: [s * 0.33, 1.5, -1.3], dir: [s, 0, 0], size: [0.9, 0.27], bone: body, segments: 12 });

  // ---------- cowl and engine
  const COPPER = panelled(metal("copper", { polish: 0.45, verdigris: 0.18, size: 0.35 }), { size: 0.24, aspect: 0.8, rivets: 0.055 });
  const cowl = b.lathe(
    [
      [0, 0],
      [0.5, 0],
      [0.57, 0.2],
      [0.6, 0.55],
      [0.56, 0.94],
      [0.48, 1.0],
      [0.4, 0.94],
      [0.38, 0.7],
      [0, 0.7],
    ],
    { at: [0, FY, 1.2], axis: [0, 0, 1], segments: 14, color: COPPER, bone: body },
  );
  P(new THREE.CylinderGeometry(0.37, 0.37, 0.03, 14), DARK, [0, FY, 1.92], { dir: [0, 0, 1] });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    P(new THREE.CylinderGeometry(0.05, 0.068, 0.16, 6), IRON, [0.27 * Math.sin(a), FY + 0.27 * Math.cos(a), 1.99], { dir: [0, 0, 1], flat: true });
    P(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 6), "#6a6d7c", [0.27 * Math.sin(a), FY + 0.27 * Math.cos(a), 2.07], { dir: [0, 0, 1], flat: true });
  }
  P(new THREE.ConeGeometry(0.13, 0.12, 8), BRASS, [0, FY, 1.99], { dir: [0, 0, 1], flat: true });
  b.ring(frame([0, FY, 1.75], [0, 0, 1]), { count: 20, radius: 0.6 }, (it) => ball(0.02, BRASS, [it.at.x, it.at.y, it.at.z], { bone: body }));
  for (const s of [1, -1]) {
    b.decal(cowl, PIG, { at: [s * 0.6, FY, 1.75], dir: [s, 0, 0], size: [0.5, 0.5], bone: body, segments: 12 });
    b.sweep(bezier([s * 0.58, 1.6, 1.75], [s * 0.85, 1.7, 1.5], [s * 0.7, 1.52, 1.05]), [0.055, 0.04], { color: IRON, bone: body, sides: 6 });
    P(new THREE.CylinderGeometry(0.075, 0.05, 0.07, 8), ORANGE, [s * 0.7, 1.5, 1.04], { flat: true, rotation: [90, 0, 0] });
    // whimsical smoke puffs drifting up and back
    ([
      [0.72, 1.66, 0.88, 0.06],
      [0.76, 1.84, 0.7, 0.085],
      [0.72, 2.06, 0.5, 0.11],
      [0.78, 2.3, 0.28, 0.14],
    ] as [number, number, number, number][]).forEach(([x, y, z, r], k) =>
      ball(r, k % 2 ? "#ffffff" : "#e9e4dc", [s * x, y, z], { bone: body }),
    );
  }

  // ---------- propeller
  P(new THREE.CylinderGeometry(0.07, 0.07, 0.45, 8), IRON, [0, FY, 2.12], { dir: [0, 0, 1], bone: prop });
  b.extrude(
    [
      [0.07, 0.12],
      [0.09, 0.5],
      [0.15, 0.92],
      [0.1, 1.14],
      [-0.1, 1.14],
      [-0.15, 0.92],
      [-0.09, 0.5],
      [-0.07, 0.12],
      [-0.07, -0.12],
      [-0.09, -0.5],
      [-0.15, -0.92],
      [-0.1, -1.14],
      [0.1, -1.14],
      [0.15, -0.92],
      [0.09, -0.5],
      [0.07, -0.12],
    ],
    {
      at: [0, FY, 2.36],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.05,
      bevel: 0.012,
      color: cel(paint((_p, _n, s) => (Math.abs(s[1]) > 0.86 ? YELLOW : WOOD_LT))),
      bone: prop,
    },
  );
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.22, 0.08],
      [0.19, 0.22],
      [0.12, 0.36],
      [0.05, 0.46],
      [0, 0.5],
    ],
    { at: [0, FY, 2.3], axis: [0, 0, 1], segments: 12, color: cel("#f2c24c", "#d9922a"), bone: prop },
  );

  // ---------- wings
  const wingDefs = [
    { id: "U", S: 4.2, C: 1.55, yc: 2.8, zc: 0.75, th: [0.07, 0.26] as [number, number], tip: TEAL },
    { id: "L", S: 3.7, C: 1.45, yc: 1.25, zc: 0.45, th: [0.06, 0.24] as [number, number], tip: YELLOW },
  ];
  const wingPart: Record<string, ReturnType<typeof b.extrude>> = {};
  for (const w of wingDefs) {
    wingPart[w.id] = b.extrude(planform(w.S, w.C, 0.65), {
      at: [0, w.yc, w.zc],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: w.th,
      bevel: 0.025,
      color: wingPaint(w.S, w.tip),
      bone: body,
    });
    for (const s of [1, -1]) {
      const sd = s > 0 ? "L" : "R";
      const a0 = 1.5;
      const a1 = w.S - 0.95;
      const hinge = b.joint(`aileron${w.id}${sd}`, {
        parent: body,
        at: [s * (a0 + a1) / 2, w.yc, w.zc - w.C / 2 + 0.5],
        dir: [s, 0, 0],
        role: "hinge",
      });
      b.extrude(rectPlan(a0, a1, -w.C / 2 - 0.05, -w.C / 2 + 0.5, s), {
        at: [0, w.yc, w.zc],
        x: [1, 0, 0],
        y: [0, 0, 1],
        thickness: [0.1, 0.17],
        bevel: 0.02,
        color: cel(RED),
        bone: hinge,
      });
    }
  }
  for (const s of [1, -1]) {
    b.decal(wingPart.U, ROUNDEL, { at: [s * 2.4, 2.88, 0.85], dir: [0, 1, 0], up: [0, 0, 1], size: [0.95, 0.95], bone: body, segments: 12 });
    b.decal(wingPart.L, ROUNDEL, { at: [s * 2.1, 1.14, 0.55], dir: [0, -1, 0], up: [0, 0, 1], size: [0.9, 0.9], bone: body, segments: 12 });
    // navigation lights: red to port (left, +X), green to starboard
    glow(ball(0.06, s > 0 ? "#ff3b3b" : "#3bff7a", [s * 4.18, 2.8, 0.75]), 1.8);
    glow(ball(0.05, s > 0 ? "#ff3b3b" : "#3bff7a", [s * 3.68, 1.25, 0.45]), 1.8);
  }

  // pennant mast on the upper wing tip strut
  b.rod([-2.55, 2.82, 1.2], [-2.55, 3.35, 1.2], 0.016, WOOD, { bone: body, sides: 5 });
  b.extrude(
    [
      [0, 0],
      [0.38, 0.1],
      [0, 0.2],
    ],
    { at: [-2.55, 3.15, 1.2], x: [0, 0, -1], thickness: 0.012, color: cel(TEAL), bone: body },
  );
  ball(0.03, YELLOW, [-2.55, 3.37, 1.2]);

  // ---------- struts and wires
  const strut = (a: V3, c: V3, rx: number, ry: number, color: Fill) =>
    b.sweep([a, c], () => [rx, ry], { color, bone: body, sides: 8, caps: "flat" });
  for (const s of [1, -1]) {
    const x = s * 2.55;
    const pairs: [number, number][] = [
      [1.2, 0.9],
      [0.3, 0.0],
    ];
    for (const [zu, zl] of pairs) {
      strut([x, 1.3, zl], [x, 2.76, zu], 0.03, 0.065, WOOD_LT);
      ball(0.055, BRASS, [x, 1.34, zl], { bone: body });
      ball(0.055, BRASS, [x, 2.72, zu], { bone: body });
    }
    b.rod([x, 1.32, 0.9], [x, 2.74, 0.3], 0.01, WIRE, { bone: body, sides: 4 });
    b.rod([x, 1.32, 0.0], [x, 2.74, 1.2], 0.01, WIRE, { bone: body, sides: 4 });
    b.rod([x, 1.32, 0.9], [s * 0.55, 2.74, 0.95], 0.01, WIRE, { bone: body, sides: 4 });
    b.rod([x, 2.72, 0.3], [s * 0.35, 1.2, 0.3], 0.01, WIRE, { bone: body, sides: 4 });
    // cabane A-frames
    b.rod([s * 0.38, 2.0, 1.05], [s * 0.6, 2.76, 0.95], 0.04, WOOD_LT, { bone: body, sides: 6 });
    b.rod([s * 0.3, 2.0, 0.22], [s * 0.55, 2.76, 0.3], 0.04, WOOD_LT, { bone: body, sides: 6 });
    ball(0.05, BRASS, [s * 0.6, 2.74, 0.95], { bone: body });
    ball(0.05, BRASS, [s * 0.55, 2.74, 0.3], { bone: body });
  }

  // ---------- landing gear
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const wj = wheels[sd];
    const axle: V3 = [s * 0.9, 0.52, 0.75];
    for (const tz of [1.1, 0.4]) {
      const top: V3 = [s * 0.3, 1.1, tz];
      b.rod(top, axle, 0.045, WOOD_LT, { bone: body, sides: 6 });
      ball(0.06, BRASS, top, { bone: body });
    }
    const t0: V3 = [s * 0.3, 1.1, 1.1];
    b.sweep(coil(lerp(t0, axle, 0.3), lerp(t0, axle, 0.75), 0.075, 6), 0.011, { color: BLUED, bone: body, sides: 5 });
    P(new THREE.TorusGeometry(0.29, 0.11, 7, 14), RUBBER, axle, { bone: wj, dir: [s, 0, 0], axis: "z", flat: true });
    P(new THREE.CylinderGeometry(0.27, 0.27, 0.18, 10), HUB, axle, { bone: wj, dir: [s, 0, 0] });
    P(new THREE.CircleGeometry(0.285, 16), "#ffffff", [axle[0] + s * 0.105, axle[1], axle[2]], { bone: wj, dir: [s, 0, 0], axis: "z", texture: ROUNDEL });
    ball(0.05, BRASS, [axle[0] + s * 0.12, axle[1], axle[2]], { bone: wj });
    // chock
    b.extrude(
      [
        [0, 0],
        [0.3, 0],
        [0, 0.14],
      ],
      { at: [s * 0.9, GROUND + 0.012, 0.95], thickness: 0.2, bevel: 0.01, color: WOOD, bone: body },
    );
  }
  b.rod([-0.9, 0.52, 0.75], [0.9, 0.52, 0.75], 0.04, WOOD, { bone: body, sides: 6 });
  // tail wheel
  b.rod([0, 0.92, -3.0], [0, 0.26, -3.25], 0.04, IRON, { bone: body, sides: 6 });
  b.sweep(coil([0, 0.82, -3.04], [0, 0.45, -3.18], 0.06, 5), 0.009, { color: BLUED, bone: body, sides: 5 });
  P(new THREE.TorusGeometry(0.07, 0.05, 6, 10), RUBBER, [0, 0.24, -3.27], { dir: [1, 0, 0], axis: "z", flat: true });
  ball(0.04, BRASS, [0, 0.24, -3.27]);

  // ---------- tail
  b.extrude(planform(1.35, 0.55, 0.35), {
    at: [0, TY, -3.15],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: [0.04, 0.12],
    bevel: 0.015,
    color: wingPaint(1.35, TEAL),
    bone: body,
  });
  for (const s of [1, -1]) {
    b.extrude(halfPlan(1.3, 0.5, 0.35, 0.12, s), {
      at: [0, TY, -3.67],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: [0.05, 0.1],
      bevel: 0.015,
      color: cel(TEAL),
      bone: elevators[s > 0 ? "L" : "R"],
    });
  }
  b.extrude(
    [
      [-2.75, -0.06],
      [-3.45, -0.06],
      [-3.45, 0.92],
      [-3.3, 0.97],
      [-3.1, 0.8],
      [-2.95, 0.45],
      [-2.82, 0.15],
    ],
    { at: [0, TY, 0], thickness: 0.08, bevel: 0.02, color: cel(RED), bone: body },
  );
  b.extrude(
    [
      [-3.47, -0.12],
      [-3.8, -0.1],
      [-4.0, 0.15],
      [-4.05, 0.5],
      [-3.95, 0.85],
      [-3.75, 1.0],
      [-3.55, 1.02],
      [-3.47, 0.95],
    ],
    {
      at: [0, TY, 0],
      thickness: 0.07,
      bevel: 0.02,
      color: cel(paint((_p, _n, s) => [RED, CREAM, TEAL][((Math.floor(s[1] / 0.22) % 3) + 3) % 3])),
      bone: rudder,
    },
  );

  // ---------- pilot
  const HY = 2.5;
  const HZ = -0.66;
  b.capsule([0, 1.85, -0.74], [0, 2.0, -0.72], 0.2, cel(LEATHER), { bone: body });
  b.capsule([-0.17, 2.05, -0.72], [0.17, 2.05, -0.72], 0.13, cel(LEATHER), { bone: body });
  P(new THREE.TorusGeometry(0.13, 0.06, 6, 10).rotateX(Math.PI / 2), TEAL, [0, 2.24, -0.7], { flat: true });
  const surfZ0 = (x: number, dy: number) => HZ + Math.sqrt(Math.max(0.001, 0.206 * 0.206 - x * x - (dy / 1.05) * (dy / 1.05)));
  const head = P(new THREE.SphereGeometry(0.2, 12, 9), SKIN, [0, HY, HZ], { bone: pilotHead, scale: [1, 1.05, 1] });
  const hs = b.surface(head);
  // cap, flaps, button
  P(new THREE.SphereGeometry(0.215, 12, 8, 0, Math.PI * 2, 0, 1.25), cel(LEATHER), [0, HY, HZ], { bone: pilotHead, scale: [1, 1.05, 1], flat: true });
  P(new THREE.TorusGeometry(0.205, 0.02, 5, 14).rotateX(Math.PI / 2), CREAM, [0, HY + 0.07, HZ], { bone: pilotHead, scale: [1, 1, 1.02], flat: true });
  ball(0.035, TEAL, [0, HY + 0.225, HZ], { bone: pilotHead });
  // rosy cheeks and a big grin
  for (const s of [1, -1]) ball(0.045, "#ff8fa3", [s * 0.145, HY - 0.085, HZ + 0.14], { bone: pilotHead, scale: [1, 0.8, 0.5] });
  b.sweep(
    catmull([
      [-0.07, HY - 0.15, surfZ0(0.07, 0.15)],
      [0, HY - 0.175, surfZ0(0, 0.175)],
      [0.07, HY - 0.15, surfZ0(0.07, 0.15)],
    ]),
    0.011,
    { color: DARK, bone: pilotHead, sides: 5 },
  );
  for (const s of [1, -1]) P(new THREE.BoxGeometry(0.05, 0.14, 0.13), cel(LEATHER_DK), [s * 0.205, HY - 0.03, HZ - 0.01], { bone: pilotHead, rotation: [0, 0, -s * 8] });
  // goggles
  P(new THREE.TorusGeometry(0.205, 0.016, 5, 16).rotateX(Math.PI / 2), LEATHER_DK, [0, HY - 0.005, HZ], { bone: pilotHead });
  for (const s of [1, -1]) {
    const hit = hs.ray([s * 0.085, HY - 0.005, HZ + 1], [0, 0, -1]);
    const zf = hit ? hit.at.z : HZ + 0.18;
    P(new THREE.CylinderGeometry(0.078, 0.078, 0.08, 10), BRASS, [s * 0.085, HY - 0.005, zf - 0.01], { bone: pilotHead, dir: [0, 0, 1], flat: true });
    P(new THREE.TorusGeometry(0.075, 0.017, 5, 12), "#b5832e", [s * 0.085, HY - 0.005, zf + 0.032], { bone: pilotHead });
    P(new THREE.CircleGeometry(0.072, 14), "#ffffff", [s * 0.085, HY - 0.005, zf + 0.032], { bone: pilotHead, texture: LENS });
  }
  P(new THREE.BoxGeometry(0.05, 0.03, 0.03), BRASS, [0, HY - 0.005, HZ + 0.19], { bone: pilotHead });
  // nose and handlebar moustache
  ball(0.05, NOSE, [0, HY - 0.075, HZ + 0.2], { bone: pilotHead });
  const surfZ = (x: number, dy: number) => HZ + Math.sqrt(Math.max(0.001, 0.222 * 0.222 - x * x - (dy / 1.05) * (dy / 1.05)));
  for (const s of [1, -1]) {
    const pts: V3[] = (
      [
        [0.01, -0.12],
        [0.07, -0.13],
        [0.125, -0.115],
        [0.16, -0.07],
        [0.17, -0.03],
      ] as [number, number][]
    ).map(([x, dy]) => [s * x, HY + dy, surfZ(x, dy)] as V3);
    b.sweep(catmull(pts), [0.034, 0.034, 0.024, 0.014, 0.01], { color: GINGER, bone: pilotHead, sides: 6 });
  }
  // arms and stick
  b.rod([0, 1.86, -0.38], [0, 2.1, -0.42], 0.018, DARK, { bone: body, sides: 5 });
  ball(0.04, RED, [0, 2.12, -0.42]);
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.22, 2.06, -0.72],
        [s * 0.3, 1.98, -0.56],
        [s * 0.09, 2.06, -0.43],
      ]),
      0.06,
      { color: cel(LEATHER), bone: body, sides: 6 },
    );
    ball(0.07, LEATHER_DK, [s * 0.07, 2.08, -0.42]);
  }
  // scarf: long streaming tails
  const scarfA = b.chain(
    "scarfA",
    catmull([
      [0, 2.26, -0.84],
      [0.03, 2.33, -1.35],
      [-0.04, 2.24, -1.95],
      [0.04, 2.34, -2.55],
      [0, 2.25, -3.05],
    ]),
    { parent: body, role: "tail" },
  );
  b.sweep(scarfA, (t) => [0.1 - 0.025 * t, 0.014], { section: "box", color: (t: number) => (Math.floor(t / 0.1) % 2 ? CREAM : TEAL), caps: "flat" });
  b.spike(scarfA.at(1), scarfA.at(1), 0.14, 0.06, { color: YELLOW });
  const scarfB = b.chain(
    "scarfB",
    catmull([
      [0.06, 2.24, -0.84],
      [0.12, 2.18, -1.25],
      [0.06, 2.27, -1.75],
      [0.12, 2.2, -2.2],
    ]),
    { parent: body, role: "tail" },
  );
  b.sweep(scarfB, (t) => [0.08 - 0.02 * t, 0.014], { section: "box", color: (t: number) => (Math.floor(t / 0.125) % 2 ? TEAL : RED), caps: "flat" });
  b.spike(scarfB.at(1), scarfB.at(1), 0.12, 0.05, { color: YELLOW });

  // ---------- airfield base
  const GRASS_P = mottle("#6fb04a", "#8cc85a", { size: 0.6, seed: 5 });
  const baseDisc = b.lathe(
    [
      [0, 0],
      [4.8, 0],
      [4.95, 0.05],
      [4.9, 0.1],
      [4.7, GROUND],
      [0, GROUND],
    ],
    { at: [0, 0, 0], segments: 18, color: cel(paint((_p, n) => (n.y > 0.6 ? GRASS_P : "#7a5232"))), bone: body },
  );
  P(new THREE.BoxGeometry(3.0, 0.014, 8.6), mottle("#c9a56a", "#b58c52", { size: 0.4, seed: 2 }), [0, GROUND + 0.005, 0]);
  for (let i = 0; i < 9; i++)
    for (const s of [1, -1]) P(new THREE.IcosahedronGeometry(0.1, 0), CREAM, [s * 1.62, GROUND + 0.03, -4 + i], { scale: [1, 0.6, 1], flat: true });

  const grassSurf = b.surface(baseDisc);
  const okSpot = (h: { n: { y: number }; at: { x: number; z: number } }) => h.n.y > 0.8 && Math.abs(h.at.x) > 1.75 && Math.hypot(h.at.x, h.at.z) < 4.55;
  const tufts = grassSurf.scatter(140, { rng: rng(4), minDist: 0.32, filter: okSpot });
  b.cards(tufts, TUFT, { size: [0.14, 0.22], lean: 10, vary: 0.3, spin: 180, cross: true, rng: rng(5) });
  const blooms = grassSurf.scatter(18, { rng: rng(9), minDist: 0.6, filter: okSpot });
  blooms.forEach((h, i) => {
    b.stick(new THREE.CylinderGeometry(0.008, 0.008, 0.18, 4), STEM, h, { embed: 0.1 });
    b.stick(new THREE.SphereGeometry(0.045, 6, 4), [WHITE, YELLOW, PINK][i % 3], h.moved([0, 0.18, 0]), { embed: 0.5 });
  });

  // ---------- props: windsock, lantern, bunting
  const PX = -3.5;
  const PZ = -2.6;
  b.rod([PX, GROUND - 0.02, PZ], [PX, 2.2, PZ], [0.07, 0.045], WHITE, { bone: body, sides: 8 });
  ball(0.07, BRASS, [PX, 2.22, PZ]);
  const sockAt: V3 = [PX, 2.44, PZ];
  const sockDir: V3 = [0.3, -0.2, 1];
  b.rod([PX, 2.2, PZ], [PX, 2.28, PZ], 0.03, IRON, { bone: body, sides: 6 });
  P(new THREE.TorusGeometry(0.24, 0.02, 5, 12), metal("steel"), sockAt, { dir: sockDir, axis: "z" });
  b.lathe(
    [
      [0.24, 0],
      [0.1, 1.15],
      [0.085, 1.15],
      [0.225, 0],
    ],
    { at: sockAt, axis: sockDir, segments: 10, color: cel(paint((_p, _n, s) => (Math.floor(s[0] / 0.2) % 2 ? ORANGE : WHITE))), bone: body },
  );
  // hanging lantern
  b.rod([PX, 1.7, PZ], [PX + 0.22, 1.7, PZ], 0.015, IRON, { bone: body, sides: 4 });
  glow(P(new THREE.BoxGeometry(0.12, 0.16, 0.12), "#ffb347", [PX + 0.22, 1.56, PZ]), 1.6);
  P(new THREE.ConeGeometry(0.11, 0.1, 4), IRON, [PX + 0.22, 1.7, PZ], { rotation: [0, 45, 0] });
  // bunting
  const postP: V3 = [-3.95, 1.5, -0.7];
  b.rod([postP[0], GROUND - 0.02, postP[2]], postP, 0.035, WOOD, { bone: body, sides: 6 });
  ball(0.05, YELLOW, postP);
  const stringPath = catmull([[PX, 2.1, PZ], [(PX + postP[0]) / 2 - 0.05, 1.62, (PZ + postP[2]) / 2], postP]);
  b.sweep(stringPath, 0.006, { color: WIRE, bone: body, sides: 4 });
  const flagColors = [RED, YELLOW, TEAL];
  flagColors.forEach((c, k) => {
    const fr = [];
    for (let i = 0; i < 9; i++) if (i % 3 === k) fr.push(frame(stringPath.at(0.08 + i * 0.105), [0, 1, 0]));
    b.cards(fr, PENNANT, { size: [0.2, 0.26], lean: 180, flow: [0, 0, 1], cross: true, color: c });
  });

  // ---------- props: drums and crate
  const drum = (x: number, z: number, color: string, label: THREE.Texture | null, face: V3) => {
    const y = GROUND + 0.35;
    const d = P(new THREE.CylinderGeometry(0.27, 0.27, 0.7, 12), cel(color), [x, y, z], { flat: true });
    for (const dy of [0.22, -0.22]) P(new THREE.CylinderGeometry(0.285, 0.285, 0.05, 12), DARK, [x, y + dy, z], { flat: true });
    P(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 6), BRASS, [x + 0.12, y + 0.37, z]);
    if (label)
      b.decal(d, label, { at: [x + face[0] * 0.27, y, z + face[2] * 0.27], dir: face, size: [0.34, 0.34], bone: body, segments: 8 });
  };
  drum(3.4, -1.5, DRUM, GAS, [-0.6, 0, 0.8]);
  drum(3.85, -2.15, "#2f7f8a", GAS, [-0.8, 0, 0.6]);
  const crate = P(new THREE.BoxGeometry(0.5, 0.45, 0.5), mottle("#a8743c", "#8a5a2e", { size: 0.2, seed: 8 }), [2.9, GROUND + 0.225, -3.1], { rotation: [0, 20, 0] });
  for (const dy of [0.17, -0.17]) P(new THREE.BoxGeometry(0.52, 0.06, 0.52), WOOD, [2.9, GROUND + 0.225 + dy, -3.1], { rotation: [0, 20, 0] });
  b.decal(crate, MAIL, { at: [2.9 - 0.09, GROUND + 0.23, -3.1 + 0.25], dir: [-0.34, 0, 0.94], size: [0.34, 0.34], bone: body, segments: 6 });
  P(new THREE.BoxGeometry(0.26, 0.16, 0.22), SACK, [2.92, GROUND + 0.53, -3.1], { rotation: [0, -10, 0] });
  P(new THREE.BoxGeometry(0.27, 0.025, 0.04), RED, [2.92, GROUND + 0.615, -3.1], { rotation: [0, -10, 0] });

  // ---------- hay bales
  const HAY = mottle("#e3bd4c", "#c99a32", { size: 0.14, seed: 12 });
  const bale = (x: number, y: number, z: number) => {
    P(new THREE.CylinderGeometry(0.32, 0.32, 0.7, 12), HAY, [x, y, z], { dir: [0, 0, 1], flat: true });
    for (const dz of [-0.17, 0.17]) P(new THREE.TorusGeometry(0.325, 0.012, 4, 14), LEATHER_DK, [x, y, z + dz], { flat: true });
  };
  bale(-3.0, GROUND + 0.32, 2.0);
  bale(-3.65, GROUND + 0.32, 2.0);
  bale(-3.32, GROUND + 0.87, 2.0);

  // ---------- signpost
  const SIGN = svg(
    `<svg viewBox="0 0 200 80"><rect x="3" y="3" width="194" height="74" rx="10" fill="#ffd23c" stroke="#22112f" stroke-width="4"/><text x="100" y="38" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="24" fill="#c8372d" stroke="#22112f" stroke-width="0.8">LOOP-DE-LOOPS</text><text x="100" y="62" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="19" fill="#25a39b">5 cents a ride!</text></svg>`,
    { size: 512 },
  );
  const SX = 3.9;
  const SZ = 1.8;
  b.rod([SX, GROUND - 0.02, SZ], [SX, 1.25, SZ], 0.04, WOOD, { bone: body, sides: 6 });
  ball(0.055, BRASS, [SX, 1.27, SZ]);
  P(new THREE.BoxGeometry(0.9, 0.38, 0.05), WOOD_LT, [SX, 0.98, SZ], { rotation: [0, 14, 0] });
  P(new THREE.PlaneGeometry(0.86, 0.34), "#ffffff", [SX + 0.24 * 0.03, 0.98, SZ + 0.97 * 0.03], { dir: [0.24, 0, 0.97], axis: "z", texture: SIGN });

  return b.root;
}
