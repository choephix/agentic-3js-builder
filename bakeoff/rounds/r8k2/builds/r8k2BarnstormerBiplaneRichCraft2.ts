import * as THREE from "three";
import { createBuilder, frame, rng, lerp, catmull, bezier, paint, mix, smoothstep, noise, mottle, svg } from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { metal, coil } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Biscuit the Barnstormer",
  description:
    "A whimsical cherry-red barnstormer biplane with a copper radial cowl, a flying-pig nose badge, a moustachioed goggled pilot with a streaming scarf, rigging wires, glowing wingtip lights, and a compact grass airfield with windsock, drum and mail crate.",
};

type V3 = [number, number, number];
type Fill = string | ReturnType<typeof paint>;

// ---------- palette
const RED = "#d9432f";
const CREAM = "#f6e8bf";
const CREAM_SH = "#e3cf9b";
const TAPE = "#b8733d";
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
const AIL_D = 0.5; // aileron chord
const AIL_G = 0.018; // hinge clearance

function planform(S: number, C: number, R: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let a = -90; a <= 90; a += 30) pts.push([S - R + R * Math.cos(a * D), (C / 2) * Math.sin(a * D)]);
  for (let a = 90; a <= 270; a += 30) pts.push([-(S - R) + R * Math.cos(a * D), (C / 2) * Math.sin(a * D)]);
  return pts;
}
// wing with aileron slots and an optional rounded trailing-edge notch cut out of it
function wingOutline(
  S: number,
  C: number,
  R: number,
  ail: { a0: number; a1: number } | null,
  notch: { w: number; d: number } | null,
): [number, number][] {
  const pts = planform(S, C, R);
  const te = -C / 2;
  const g = AIL_G;
  const dep = AIL_D + g;
  if (ail) pts.push([-ail.a1 - g, te], [-ail.a1 - g, te + dep], [-ail.a0 + g, te + dep], [-ail.a0 + g, te]);
  if (notch) for (let a = 180; a >= 0; a -= 20) pts.push([(notch.w / 2) * Math.cos(a * D), te + notch.d * Math.sin(a * D)]);
  if (ail) pts.push([ail.a0 - g, te], [ail.a0 - g, te + dep], [ail.a1 + g, te + dep], [ail.a1 + g, te]);
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
      if (rib < 0.016) return TAPE;
      return mix(n.y > 0 ? CREAM : CREAM_SH, "#e2cc96", 0.3 * smoothstep(0.5, 0.85, noise(p, 0.9, 3)));
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

const FY = 1.55;
const COWL_P = paint((p, n) => {
  if (p.z > 1.88 && Math.hypot(p.x, p.y - FY) < 0.43) return "#3a2418";
  let c = mix("#b4552e", "#d77a4c", smoothstep(0.3, 0.7, noise(p, 0.9, 11)));
  c = mix(c, "#f4ab80", 0.6 * smoothstep(0.45, 0.95, n.y));
  c = mix(c, "#7b3a22", 0.45 * smoothstep(-0.2, -0.9, n.y));
  c = mix(c, "#4aa58a", 0.2 * smoothstep(0.72, 0.86, noise(p, 0.35, 4)) * smoothstep(0.2, -0.6, n.y));
  return c;
});
const SPINNER_P = paint((_p, n) => mix("#b98a2c", "#f0c860", smoothstep(-0.3, 0.9, n.y)));
const PROP_P = cel(
  paint((p, n, s) => {
    if (Math.abs(s[1]) > 1.02) return YELLOW;
    if (Math.abs(n.z) < 0.5) return "#7a4a22";
    const t = 0.5 + 0.5 * Math.sin(s[0] * 22 + 3 * noise(p, 0.5, 2));
    return mix("#c98f52", "#a9703a", 0.6 * smoothstep(0.35, 0.75, t));
  }),
);

export default function build() {
  const b = createBuilder({ name: "biplane", paintSize: 2048 });
  const GROUND = 0.12;
  const TY = 1.0;
  const HS = 1.15; // head scale
  const HY = 2.52;
  const HZ = -1.06;
  const hp = (x: number, y: number, z: number): V3 => [x * HS, HY + y * HS, HZ + z * HS];

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

  // ---------- skeleton
  const body = b.joint("fuselage", { at: [0, FY, 0], dir: [0, 0, 1], role: "spine" });
  type J = typeof body;
  const prop = b.joint("prop", { parent: body, at: [0, FY, 2.3], dir: [0, 0, 1] });
  const rudder = b.joint("rudder", { parent: body, at: [0, TY, -3.46], dir: [0, 1, 0], role: "hinge" });
  const pilotHead = b.joint("pilotHead", { parent: body, at: [0, HY, HZ], dir: [0, 1, 0], role: "head" });
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
  const fusTop = (x: number, z: number) => fusSurf.ray([x, 4, z], [0, -1, 0])?.at.y ?? 1.95;
  const fusBottom = (x: number, z: number) => fusSurf.ray([x, 0.2, z], [0, 1, 0])?.at.y ?? 1.12;

  // turtle-deck headrest, coamings, windshield, mail sack
  P(new THREE.SphereGeometry(1, 10, 7), FUSELAGE, [0, topY(-1.65) + 0.02, -1.65], { scale: [0.3, 0.22, 0.4] });
  const coaming = (z: number) => {
    const y = topY(z);
    P(new THREE.CylinderGeometry(0.27, 0.27, 0.02, 14).scale(1, 1, 1.25), DARK, [0, y - 0.03, z]);
    P(new THREE.TorusGeometry(0.27, 0.06, 6, 14).rotateX(Math.PI / 2).scale(1, 1, 1.25), COAMING, [0, y - 0.015, z], { flat: true });
  };
  coaming(-1.1);
  coaming(-0.2);
  b.extrude(
    [
      [-0.3, 0],
      [0.3, 0],
      [0.25, 0.22],
      [-0.25, 0.22],
    ],
    { at: [0, topY(-0.62) - 0.02, -0.62], x: [1, 0, 0], y: [0, 0.92, -0.4], thickness: 0.025, bevel: 0.008, color: GLASS, bone: body },
  );
  P(new THREE.SphereGeometry(1, 9, 7), SACK, [0, topY(-0.2) + 0.05, -0.2], { scale: [0.27, 0.23, 0.25], flat: true });
  P(new THREE.TorusGeometry(0.09, 0.025, 5, 9).rotateX(Math.PI / 2), RED, [0, topY(-0.2) + 0.2, -0.2], { flat: true });
  for (const s of [1, -1]) P(new THREE.ConeGeometry(0.05, 0.14, 5), SACK, [s * 0.05, topY(-0.2) + 0.27, -0.2], { rotation: [0, 0, -s * 22], flat: true });

  // nameplate decals on both flanks
  for (const s of [1, -1])
    b.decal(fus, NAMEPLATE, { at: [s * 0.33, 1.5, -1.5], dir: [s, 0, 0], size: [0.9, 0.27], bone: body, segments: 12 });

  // ---------- cowl and engine
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
    { at: [0, FY, 1.2], axis: [0, 0, 1], segments: 14, color: COWL_P, bone: body },
  );
  P(new THREE.CylinderGeometry(0.37, 0.37, 0.03, 14), DARK, [0, FY, 1.92], { dir: [0, 0, 1] });
  P(new THREE.CylinderGeometry(0.14, 0.14, 0.2, 10), IRON, [0, FY, 2.0], { dir: [0, 0, 1], flat: true });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const sx = Math.sin(a);
    const cy = Math.cos(a);
    const at = (r: number, z: number): V3 => [r * sx, FY + r * cy, z];
    const dir: V3 = [sx, cy, 0];
    P(new THREE.CylinderGeometry(0.058, 0.046, 0.2, 6), IRON, at(0.2, 2.0), { dir, flat: true });
    for (const r of [0.16, 0.22]) P(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 6), "#7a7d8c", at(r, 2.0), { dir, flat: true });
    P(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 6), "#6a6d7c", at(0.31, 2.0), { dir, flat: true });
  }
  P(new THREE.ConeGeometry(0.13, 0.12, 8), BRASS, [0, FY, 2.1], { dir: [0, 0, 1], flat: true });
  b.ring(frame([0, FY, 1.75], [0, 0, 1]), { count: 20, radius: 0.6 }, (it) => ball(0.02, BRASS, [it.at.x, it.at.y, it.at.z], { bone: body }));
  for (const s of [1, -1]) {
    b.decal(cowl, PIG, { at: [s * 0.6, FY, 1.75], dir: [s, 0, 0], size: [0.5, 0.5], bone: body, segments: 12 });
    b.sweep(bezier([s * 0.58, 1.5, 1.7], [s * 0.78, 1.38, 1.55], [s * 0.68, 1.2, 1.05]), [0.055, 0.04], { color: IRON, bone: body, sides: 6 });
    ball(0.05, ORANGE, [s * 0.68, 1.19, 1.0], { bone: body });
  }

  // ---------- propeller (turned 25 degrees about the shaft)
  P(new THREE.CylinderGeometry(0.07, 0.07, 0.45, 8), IRON, [0, FY, 2.12], { dir: [0, 0, 1], bone: prop });
  const blade: [number, number][] = [
    [0.075, 0.12],
    [0.1, 0.5],
    [0.16, 0.8],
    [0.2, 0.99],
    [0.2, 1.1],
    [0.15, 1.19],
    [0.06, 1.22],
    [-0.05, 1.2],
    [-0.12, 1.12],
    [-0.16, 0.98],
    [-0.12, 0.8],
    [-0.09, 0.5],
    [-0.075, 0.12],
  ];
  const propOutline: [number, number][] = [...blade, ...blade.map(([x, y]) => [-x, -y] as [number, number])];
  const ca = Math.cos(25 * D);
  const sa = Math.sin(25 * D);
  b.extrude(propOutline, {
    at: [0, FY, 2.36],
    x: [ca, sa, 0],
    y: [-sa, ca, 0],
    thickness: 0.05,
    bevel: 0.012,
    color: PROP_P,
    bone: prop,
  });
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
    { at: [0, FY, 2.3], axis: [0, 0, 1], segments: 12, color: SPINNER_P, bone: prop },
  );

  // ---------- wings
  const wingDefs = [
    { id: "U", S: 4.2, C: 1.55, yc: 2.8, zc: 0.75, th: [0.04, 0.16] as [number, number], tip: TEAL, notch: { w: 1.15, d: 0.55 } },
    { id: "L", S: 3.7, C: 1.45, yc: 1.25, zc: 0.45, th: [0.035, 0.15] as [number, number], tip: YELLOW, notch: null },
  ];
  const wingPart: Record<string, ReturnType<typeof b.extrude>> = {};
  for (const w of wingDefs) {
    const a0 = 1.5;
    const a1 = w.S - 0.95;
    wingPart[w.id] = b.extrude(wingOutline(w.S, w.C, 0.65, { a0, a1 }, w.notch), {
      at: [0, w.yc, w.zc],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: w.th,
      bevel: 0.02,
      color: wingPaint(w.S, w.tip),
      bone: body,
    });
    const ailTh: [number, number] = [w.th[0], w.th[0] + ((w.th[1] - w.th[0]) * AIL_D) / w.C];
    for (const s of [1, -1]) {
      const sd = s > 0 ? "L" : "R";
      const hinge = b.joint(`aileron${w.id}${sd}`, {
        parent: body,
        at: [(s * (a0 + a1)) / 2, w.yc, w.zc - w.C / 2 + AIL_D],
        dir: [s, 0, 0],
        role: "hinge",
      });
      b.extrude(rectPlan(a0, a1, -w.C / 2, -w.C / 2 + AIL_D, s), {
        at: [0, w.yc, w.zc],
        x: [1, 0, 0],
        y: [0, 0, 1],
        thickness: ailTh,
        bevel: 0.01,
        color: wingPaint(w.S, w.tip),
        bone: hinge,
      });
    }
  }
  for (const s of [1, -1]) {
    b.decal(wingPart.U, ROUNDEL, { at: [s * 3.2, 2.88, 0.85], dir: [0, 1, 0], up: [0, 0, 1], size: [0.9, 0.9], bone: body, segments: 12 });
    b.decal(wingPart.L, ROUNDEL, { at: [s * 3.0, 1.14, 0.5], dir: [0, -1, 0], up: [0, 0, 1], size: [0.85, 0.85], bone: body, segments: 12 });
    // navigation lights: red to port (left, +X), green to starboard
    glow(ball(0.06, s > 0 ? "#ff3b3b" : "#3bff7a", [s * 4.18, 2.8, 0.75]), 1.8);
    glow(ball(0.05, s > 0 ? "#ff3b3b" : "#3bff7a", [s * 3.68, 1.25, 0.45]), 1.8);
  }

  // ---------- struts, cabane and wires, all seated on measured surfaces
  const wsU = b.surface(wingPart.U);
  const wsL = b.surface(wingPart.L);
  const lowTop = (x: number, z: number) => wsL.ray([x, 4, z], [0, -1, 0])?.at.y ?? 1.33;
  const upBot = (x: number, z: number) => wsU.ray([x, 0.5, z], [0, 1, 0])?.at.y ?? 2.72;
  const EMB = 0.015;
  const strut = (a: V3, c: V3, rx: number, ry: number, color: Fill) =>
    b.sweep([a, c], () => [rx, ry], { color, bone: body, sides: 8, caps: "flat" });
  const wire = (a: V3, c: V3) => b.rod(a, c, 0.01, WIRE, { bone: body, sides: 4 });
  for (const s of [1, -1]) {
    const x = s * 2.55;
    const pair = (zl: number, zu: number) => {
      const yl = lowTop(x, zl);
      const yu = upBot(x, zu);
      strut([x, yl - EMB, zl], [x, yu + EMB, zu], 0.03, 0.065, WOOD_LT);
      ball(0.055, BRASS, [x, yl, zl], { bone: body });
      ball(0.055, BRASS, [x, yu, zu], { bone: body });
      return { lo: [x, yl, zl] as V3, up: [x, yu, zu] as V3 };
    };
    const F = pair(0.95, 1.2);
    const R = pair(0.38, 0.65);
    wire(F.lo, R.up);
    wire(R.lo, F.up);

    // cabane A-frames
    const cab = (xf: number, zf: number, xt: number, zt: number) => {
      const yf = fusTop(xf, zf);
      const yt = upBot(xt, zt);
      b.rod([xf, yf - EMB, zf], [xt, yt + EMB, zt], 0.04, WOOD_LT, { bone: body, sides: 6 });
      ball(0.05, BRASS, [xf, yf, zf], { bone: body });
      ball(0.05, BRASS, [xt, yt, zt], { bone: body });
      return { foot: [xf, yf, zf] as V3, top: [xt, yt, zt] as V3 };
    };
    const cf = cab(s * 0.38, 1.05, s * 0.62, 0.98);
    const cr = cab(s * 0.3, 0.42, s * 0.72, 0.65);
    wire(F.lo, cf.top);
    wire(R.up, cr.foot);
  }

  // ---------- landing gear
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const wj = wheels[sd];
    const axle: V3 = [s * 0.9, 0.52, 0.75];
    let firstTop: V3 | null = null;
    for (const tz of [1.1, 0.4]) {
      const y = fusBottom(s * 0.3, tz);
      const top: V3 = [s * 0.3, y + EMB, tz];
      b.rod(top, axle, 0.045, WOOD_LT, { bone: body, sides: 6 });
      ball(0.06, BRASS, [s * 0.3, y, tz], { bone: body });
      if (!firstTop) firstTop = top;
    }
    const t0 = firstTop as V3;
    b.sweep(coil(lerp(t0, axle, 0.3), lerp(t0, axle, 0.75), 0.075, 6), 0.011, { color: BLUED, bone: body, sides: 5 });
    P(new THREE.TorusGeometry(0.29, 0.11, 7, 14), RUBBER, axle, { bone: wj, dir: [s, 0, 0], axis: "z", flat: true });
    P(new THREE.CylinderGeometry(0.27, 0.27, 0.18, 10), HUB, axle, { bone: wj, dir: [s, 0, 0] });
    P(new THREE.CircleGeometry(0.285, 16), "#ffffff", [axle[0] + s * 0.105, axle[1], axle[2]], { bone: wj, dir: [s, 0, 0], axis: "z", texture: ROUNDEL });
    ball(0.05, BRASS, [axle[0] + s * 0.12, axle[1], axle[2]], { bone: wj });
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

  // ---------- pilot (moved aft, head enlarged)
  b.capsule([0, 1.85, -1.14], [0, 2.0, -1.12], 0.2, cel(LEATHER), { bone: body });
  b.capsule([-0.17, 2.05, -1.12], [0.17, 2.05, -1.12], 0.13, cel(LEATHER), { bone: body });
  P(new THREE.CylinderGeometry(0.09, 0.1, 0.25, 8), SKIN, [0, 2.2, -1.09], { flat: true });
  P(new THREE.TorusGeometry(0.13, 0.06, 6, 10).rotateX(Math.PI / 2), TEAL, [0, 2.25, -1.1], { flat: true });
  const head = P(new THREE.SphereGeometry(0.2 * HS, 12, 9), SKIN, [0, HY, HZ], { bone: pilotHead, scale: [1, 1.05, 1] });
  const hs = b.surface(head);
  // cap, band, button, flaps
  P(new THREE.SphereGeometry(0.215 * HS, 12, 8, 0, Math.PI * 2, 0, 1.25), cel(LEATHER), [0, HY, HZ], { bone: pilotHead, scale: [1, 1.05, 1], flat: true });
  P(new THREE.TorusGeometry(0.205 * HS, 0.02 * HS, 5, 14).rotateX(Math.PI / 2), CREAM, hp(0, 0.07, 0), { bone: pilotHead, scale: [1, 1, 1.02], flat: true });
  ball(0.035 * HS, TEAL, hp(0, 0.225, 0), { bone: pilotHead });
  for (const s of [1, -1])
    P(new THREE.BoxGeometry(0.05 * HS, 0.14 * HS, 0.13 * HS), cel(LEATHER_DK), hp(s * 0.205, -0.03, -0.01), { bone: pilotHead, rotation: [0, 0, -s * 8] });
  // goggles
  P(new THREE.TorusGeometry(0.205 * HS, 0.016 * HS, 5, 16).rotateX(Math.PI / 2), LEATHER_DK, hp(0, -0.005, 0), { bone: pilotHead });
  for (const s of [1, -1]) {
    const gx = s * 0.085 * HS;
    const gy = HY - 0.005 * HS;
    const hit = hs.ray([gx, gy, HZ + 1], [0, 0, -1]);
    const zf = hit ? hit.at.z : HZ + 0.18 * HS;
    P(new THREE.CylinderGeometry(0.078 * HS, 0.078 * HS, 0.08 * HS, 10), BRASS, [gx, gy, zf - 0.01], { bone: pilotHead, dir: [0, 0, 1], flat: true });
    P(new THREE.TorusGeometry(0.075 * HS, 0.017 * HS, 5, 12), "#b5832e", [gx, gy, zf + 0.032 * HS], { bone: pilotHead });
    P(new THREE.CircleGeometry(0.072 * HS, 14), "#ffffff", [gx, gy, zf + 0.032 * HS], { bone: pilotHead, texture: LENS });
  }
  P(new THREE.BoxGeometry(0.05 * HS, 0.03 * HS, 0.03 * HS), BRASS, hp(0, -0.005, 0.19), { bone: pilotHead });
  // nose and handlebar moustache
  ball(0.05 * HS, NOSE, hp(0, -0.075, 0.2), { bone: pilotHead });
  const surfZ = (x: number, dy: number) => Math.sqrt(Math.max(0.001, 0.222 * 0.222 - x * x - (dy / 1.05) * (dy / 1.05)));
  for (const s of [1, -1]) {
    const pts: V3[] = (
      [
        [0.01, -0.12],
        [0.07, -0.13],
        [0.125, -0.115],
        [0.16, -0.07],
        [0.17, -0.03],
      ] as [number, number][]
    ).map(([x, dy]) => hp(s * x, dy, surfZ(x, dy)));
    b.sweep(catmull(pts), [0.034, 0.034, 0.024, 0.014, 0.01].map((r) => r * HS), { color: GINGER, bone: pilotHead, sides: 6 });
  }
  // arms and stick
  b.rod([0, 1.86, -0.78], [0, 2.1, -0.82], 0.018, DARK, { bone: body, sides: 5 });
  ball(0.04, RED, [0, 2.12, -0.82]);
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.22, 2.06, -1.12],
        [s * 0.3, 1.98, -0.96],
        [s * 0.09, 2.06, -0.84],
      ]),
      0.06,
      { color: cel(LEATHER), bone: body, sides: 6 },
    );
    ball(0.07, LEATHER_DK, [s * 0.07, 2.08, -0.82]);
  }
  // scarf: two broad ribbons, width in the vertical plane
  const ribbon = (name: string, pts: V3[], w: number, c1: string, c2: string) => {
    const ch = b.chain(name, catmull(pts), { parent: body, role: "tail" });
    b.sweep(
      ch,
      (t: number) => [0.0075, w * (t < 0.85 ? 1 - 0.2 * t : 0.83 * (1 - (0.8 * (t - 0.85)) / 0.15))] as [number, number],
      { section: "box", color: (t: number) => (Math.floor(t / 0.125) % 2 ? c1 : c2), caps: "flat" },
    );
  };
  ribbon(
    "scarfA",
    [
      [0, 2.3, -1.22],
      [0.02, 2.4, -1.6],
      [-0.03, 2.34, -2.05],
      [0.03, 2.44, -2.4],
      [0, 2.38, -2.7],
    ],
    0.09,
    CREAM,
    TEAL,
  );
  ribbon(
    "scarfB",
    [
      [0, 2.17, -1.22],
      [0.05, 2.2, -1.5],
      [0, 2.12, -1.85],
      [0.05, 2.18, -2.2],
    ],
    0.08,
    TEAL,
    RED,
  );

  // ---------- airfield base
  const GRASS_P = mottle("#6fb04a", "#8cc85a", { size: 0.6, seed: 5 });
  const baseDisc = b.lathe(
    [
      [0, 0],
      [4.55, 0],
      [4.6, 0.05],
      [4.55, 0.1],
      [4.4, GROUND],
      [0, GROUND],
    ],
    { at: [0, 0, 0], segments: 18, color: cel(paint((_p, n) => (n.y > 0.6 ? GRASS_P : "#7a5232"))), bone: body },
  );
  P(new THREE.BoxGeometry(3.0, 0.014, 7.6), mottle("#c9a56a", "#b58c52", { size: 0.4, seed: 2 }), [0, GROUND + 0.005, 0]);
  for (let i = 0; i < 8; i++)
    for (const s of [1, -1]) P(new THREE.IcosahedronGeometry(0.1, 0), CREAM, [s * 1.62, GROUND + 0.03, -3.5 + i], { scale: [1, 0.6, 1], flat: true });

  const grassSurf = b.surface(baseDisc);
  const okSpot = (h: { n: { y: number }; at: { x: number; z: number } }) => {
    const r = Math.hypot(h.at.x, h.at.z);
    return h.n.y > 0.8 && Math.abs(h.at.x) > 1.75 && r > 3.0 && r < 4.25;
  };
  const tufts = grassSurf.scatter(65, { rng: rng(4), minDist: 0.4, filter: okSpot });
  b.cards(tufts, TUFT, { size: [0.14, 0.22], lean: 10, vary: 0.3, spin: 180, cross: true, rng: rng(5) });
  const blooms = grassSurf.scatter(12, { rng: rng(9), minDist: 0.7, filter: okSpot });
  blooms.forEach((h, i) => {
    b.stick(new THREE.CylinderGeometry(0.008, 0.008, 0.18, 4), STEM, h, { embed: 0.1 });
    b.stick(new THREE.SphereGeometry(0.045, 6, 4), [WHITE, YELLOW, PINK][i % 3], h.moved([0, 0.18, 0]), { embed: 0.5 });
  });

  // ---------- props: windsock and lantern
  const PX = -2.9;
  const PZ = 3.0;
  b.rod([PX, GROUND - 0.02, PZ], [PX, 2.0, PZ], [0.07, 0.045], WHITE, { bone: body, sides: 8 });
  ball(0.07, BRASS, [PX, 2.03, PZ]);
  const sockAt: V3 = [PX, 2.27, PZ];
  const sockDir: V3 = [-0.3, -0.12, -1];
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
  b.rod([PX, 1.6, PZ], [PX + 0.22, 1.6, PZ], 0.015, IRON, { bone: body, sides: 4 });
  glow(P(new THREE.BoxGeometry(0.12, 0.16, 0.12), "#ffb347", [PX + 0.22, 1.46, PZ]), 1.6);
  P(new THREE.ConeGeometry(0.11, 0.1, 4), IRON, [PX + 0.22, 1.6, PZ], { rotation: [0, 45, 0] });

  // ---------- props: drum and crate
  {
    const x = 3.4;
    const z = -1.4;
    const y = GROUND + 0.35;
    const face: V3 = [-0.6, 0, 0.8];
    const d = P(new THREE.CylinderGeometry(0.27, 0.27, 0.7, 12), cel(DRUM), [x, y, z], { flat: true });
    for (const dy of [0.22, -0.22]) P(new THREE.CylinderGeometry(0.285, 0.285, 0.05, 12), DARK, [x, y + dy, z], { flat: true });
    P(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 6), BRASS, [x + 0.12, y + 0.37, z]);
    b.decal(d, GAS, { at: [x + face[0] * 0.27, y, z + face[2] * 0.27], dir: face, size: [0.34, 0.34], bone: body, segments: 8 });
  }
  const CX = 2.7;
  const CZ = -3.0;
  const crate = P(new THREE.BoxGeometry(0.5, 0.45, 0.5), mottle("#a8743c", "#8a5a2e", { size: 0.2, seed: 8 }), [CX, GROUND + 0.225, CZ], { rotation: [0, 20, 0] });
  for (const dy of [0.17, -0.17]) P(new THREE.BoxGeometry(0.52, 0.06, 0.52), WOOD, [CX, GROUND + 0.225 + dy, CZ], { rotation: [0, 20, 0] });
  b.decal(crate, MAIL, { at: [CX - 0.09, GROUND + 0.23, CZ + 0.25], dir: [-0.34, 0, 0.94], size: [0.34, 0.34], bone: body, segments: 6 });
  P(new THREE.BoxGeometry(0.26, 0.16, 0.22), SACK, [CX + 0.02, GROUND + 0.53, CZ], { rotation: [0, -10, 0] });
  P(new THREE.BoxGeometry(0.27, 0.025, 0.04), RED, [CX + 0.02, GROUND + 0.615, CZ], { rotation: [0, -10, 0] });

  return b.root;
}
