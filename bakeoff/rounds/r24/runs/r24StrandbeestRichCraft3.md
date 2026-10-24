```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, frame, catmull, paint, mix, noise, smoothstep, grain, svg } from "agentic-3js-builder";

export const meta = {
  name: "Strandbeest Animaris Percipiere",
  description:
    "A Theo Jansen style wind-walking beach creature: yellow PVC tube skeleton, twelve Holy-Number Jansen linkage legs on a crankshaft, a rack of PET-bottle lungs, patched canvas butterfly sails, hemp rigging, a weather vane and a bottle-cup anemometer.",
};

// ---------------------------------------------------------------------------------------------------------------
// Jansen linkage maths (drawing units, "Holy Numbers"), scaled to metres by S.

const S = 0.0125;
const DEG = Math.PI / 180;
const H = { a: 38, b: 41.5, c: 39.3, d: 40.1, e: 55.8, f: 39.4, g: 36.7, h: 65.7, i: 49, j: 50, k: 61.9, l: 7.8, m: 15 };
type P2 = [number, number];

function inter(A: P2, rA: number, B: P2, rB: number, side: number): P2 {
  const dx = B[0] - A[0];
  const dy = B[1] - A[1];
  const d = Math.hypot(dx, dy) || 1e-6;
  const a = (rA * rA - rB * rB + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, rA * rA - a * a));
  const ux = dx / d;
  const uy = dy / d;
  return [A[0] + a * ux - side * h * uy, A[1] + a * uy + side * h * ux];
}

function jansen(th: number): Record<string, P2> {
  const P0: P2 = [0, 0];
  const C: P2 = [H.a, H.l];
  const B: P2 = [H.a + H.m * Math.cos(th), H.l + H.m * Math.sin(th)];
  const P3 = inter(P0, H.b, B, H.j, 1);
  const P4 = inter(P0, H.c, P3, H.d, 1);
  const P5 = inter(B, H.k, P4, H.e, 1);
  const P6 = inter(P4, H.f, P5, H.g, -1);
  const P7 = inter(P5, H.h, P6, H.i, 1);
  return { P0, C, B, P3, P4, P5, P6, P7 };
}

// (from node, to node, layer across the station width)
const LINKS: [string, string, number][] = [
  ["P0", "P3", 0],
  ["B", "P3", 1],
  ["P0", "P4", 1],
  ["P3", "P4", 2],
  ["B", "P5", 1],
  ["P4", "P5", 0],
  ["P4", "P6", 3],
  ["P5", "P6", 2],
  ["P5", "P7", 3],
  ["P6", "P7", 1],
];

// ---------------------------------------------------------------------------------------------------------------
// Dimensions

const FOOT_R = 0.03;
const ROD_R = 0.011;
const BEAM_R = 0.016;
const LP = 0.02; // layer pitch across a linkage
const XS = [-0.65, -0.39, -0.13, 0.13, 0.39, 0.65];

let thMin = 0;
{
  let yMin = Infinity;
  for (let d = 0; d < 360; d += 2) {
    const y = jansen(d * DEG).P7[1];
    if (y < yMin) {
      yMin = y;
      thMin = d;
    }
  }
}
const FRONT_PH = [-35, 150, 0, 185, 35, 215];
const REAR_PH = [20, -20, 170, 10, 200, -30];
const footRel = (th: number) => (jansen(th).P7[1] - H.l) * S;
let lowest = Infinity;
for (const off of [...FRONT_PH, ...REAR_PH]) lowest = Math.min(lowest, footRel((thMin + off) * DEG));
const Yc = FOOT_R - lowest; // crank axle height

const DECK_Y = Yc + 0.5;
const ZM = -0.38; // sail / mast plane
const YB = Yc + 0.66; // sail bottom
const YM = Yc + 1.95; // mast top
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const hash2 = (a: number, b: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------------------------------------------------------------------------------------------------------------
// Paints

const PVC = paint((p, n) => {
  let c = mix("#efb70c", "#fbd22e", noise(p, 0.35, 4));
  c = mix(c, "#d4820e", 0.4 * smoothstep(0.1, -0.9, n.y));
  c = mix(c, "#fff0a0", 0.35 * smoothstep(0.5, 1, n.y) * noise(p, 0.05, 6));
  if (noise(p, 0.025, 9) > 0.78) c = mix(c, "#c89a10", 0.5);
  const sand = smoothstep(0.6, 0.0, p.y) * (0.35 + 0.5 * noise(p, 0.06, 7));
  return mix(c, "#d9c18c", sand * 0.7);
});
const STEEL = grain("#b9bfc9", "#7a8191", { size: 0.012, axis: "x" });
const WOOD = grain("#c99d5f", "#9a7240", { size: 0.02, axis: "x" });
const RUBBER = paint((p) => {
  const c = mix("#25252b", "#3b3b44", noise(p, 0.03, 12));
  return mix(c, "#d5bd8a", 0.5 * smoothstep(0.1, 0.0, p.y) * noise(p, 0.02, 3) + 0.15);
});
const ROPE = paint((_p, _n, s) => ((((s[0] * 70 + s[1] / 120) % 1) + 1) % 1 < 0.5 ? "#bd9e66" : "#8c6e40"));

const sailPaint = (accent: string, seed: number) =>
  paint((p, _n, s) => {
    const u = s[0];
    const v = s[1];
    let c = mix("#f6eed9", "#e8dcc0", noise(p, 0.15, seed));
    const cu = 0.3;
    const cv = 0.5;
    const iu = Math.floor(u / cu);
    const iv = Math.floor(v / cv);
    const r = hash2(iu + seed, iv);
    if (r > 0.72) c = mix(c, "#dfc896", 0.7);
    else if (r < 0.12) c = mix(c, accent, 0.85);
    const du = (u / cu - iu) * cu;
    const dist = Math.min(du, cu - du);
    if (dist < 0.004) c = mix(c, "#7f6b49", 0.8);
    else if (dist < 0.013 && dist > 0.009 && Math.floor(v / 0.02) % 2 === 0) c = mix(c, "#a28a60", 0.55);
    const dv = (v / cv - iv) * cv;
    if (dv < 0.003) c = mix(c, "#7f6b49", 0.7);
    if (v < 0.05) c = mix(c, accent, 0.9);
    c = mix(c, "#cdb685", 0.55 * smoothstep(0.45, 0, v) * (0.5 + noise(p, 0.07, seed + 3)));
    return c;
  });

const botPaint = (tint: string, seed: number) =>
  paint((p, n, s) => {
    const h = s[0];
    const a = s[1];
    if (h > 0.318) return "#2f78d6";
    if (h > 0.285 && h < 0.318) return "#e6f4f6";
    if (h > 0.105 && h < 0.185) {
      return Math.abs(h - 0.145 - 0.012 * Math.sin((a * Math.PI) / 45)) < 0.009 ? "#1f56b0" : "#f6f1e2";
    }
    let c = mix(tint, "#ffffff", 0.35 * smoothstep(0.3, 1, n.y));
    if (h < 0.03) c = mix(c, "#7fb3c4", 0.5);
    return mix(c, "#d8c28e", 0.3 * noise(p, 0.05, seed) * smoothstep(0.9, 0.3, p.y));
  });

// ---------------------------------------------------------------------------------------------------------------
// Textures

function emblemSvg() {
  const k = 0.55;
  const xc = -3.5;
  const yc = -5;
  const X = (x: number) => (50 + (x - xc) * k).toFixed(1);
  const Y = (y: number) => (50 - (y - yc) * k).toFixed(1);
  const J = jansen(2.3);
  let lines = "";
  for (const [a, c] of [...LINKS.map(([p, q]) => [p, q] as [string, string]), ["C", "B"] as [string, string]])
    lines += `<line x1="${X(J[a][0])}" y1="${Y(J[a][1])}" x2="${X(J[c][0])}" y2="${Y(J[c][1])}" stroke="#1d3a6e" stroke-width="2.2" stroke-linecap="round"/>`;
  let nodes = "";
  for (const key of Object.keys(J))
    nodes += `<circle cx="${X(J[key][0])}" cy="${Y(J[key][1])}" r="${key === "C" ? 3.4 : 2.5}" fill="${key === "P7" ? "#c4361f" : "#e0a020"}" stroke="#1d3a6e" stroke-width="1"/>`;
  let path = "";
  for (let d = 0; d <= 360; d += 6) {
    const q = jansen(d * DEG).P7;
    path += `${d === 0 ? "M" : "L"}${X(q[0])} ${Y(q[1])}`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="47" fill="#f4e8c6" stroke="#1d3a6e" stroke-width="3"/>
    <circle cx="50" cy="50" r="42.5" fill="none" stroke="#e0a020" stroke-width="1" stroke-dasharray="2 2.4"/>
    <path d="${path}Z" fill="none" stroke="#c4361f" stroke-width="2" stroke-linejoin="round"/>
    ${lines}${nodes}
    <text x="50" y="17" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="7.5" fill="#1d3a6e">ANIMARIS</text>
    <text x="50" y="90" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="6" fill="#1d3a6e">PERCIPIERE · 13 NUMBERS</text>
  </svg>`;
}
const EMBLEM = svg(emblemSvg(), { size: 512 });

let rays = "";
for (let i = 0; i < 12; i++)
  rays += `<polygon points="46,16 54,16 50,3" fill="#e8a416" stroke="#1d3a6e" stroke-width="1.2" transform="rotate(${i * 30} 50 45)"/>`;
const BADGE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="47" fill="#f4e8c6" stroke="#1d3a6e" stroke-width="3.5"/>
    ${rays.replace(/rotate\((\d+) 50 45\)/g, "rotate($1 50 50)")}
    <circle cx="50" cy="50" r="19" fill="#f6c52c" stroke="#1d3a6e" stroke-width="2.5"/>
    <path d="M10 76 Q22 66 34 76 T58 76 T90 76" fill="none" stroke="#1d57a8" stroke-width="4" stroke-linecap="round"/>
    <path d="M14 86 Q26 78 38 86 T62 86 T86 86" fill="none" stroke="#2f78d6" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const PENNANT = svg(
  `<svg viewBox="0 0 30 100" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="t"><polygon points="1,99 29,99 15,1"/></clipPath></defs>
    <g clip-path="url(#t)">
      <rect x="0" y="80" width="30" height="20" fill="#f2c230"/>
      <rect x="0" y="60" width="30" height="20" fill="#2f6fcf"/>
      <rect x="0" y="40" width="30" height="20" fill="#f7f1df"/>
      <rect x="0" y="20" width="30" height="20" fill="#d4482f"/>
      <rect x="0" y="0" width="30" height="20" fill="#1d3a6e"/>
    </g>
    <polygon points="1,99 29,99 15,1" fill="none" stroke="#1d2540" stroke-width="2" stroke-linejoin="round"/>
  </svg>`,
  { size: 256 },
);

let strands = "";
for (let i = 0; i < 7; i++) {
  const x = 3 + i * 2.4;
  strands += `<path d="M${x} 38 L${x + (i - 3) * 0.5} 3" stroke="${i % 2 ? "#e0a020" : "#c4361f"}" stroke-width="2" stroke-linecap="round"/>`;
}
const TASSEL = svg(
  `<svg viewBox="0 0 20 60" xmlns="http://www.w3.org/2000/svg">
    ${strands}
    <rect x="4" y="36" width="12" height="5" rx="1" fill="#e0a020" stroke="#5a3a10" stroke-width="0.8"/>
    <rect x="5" y="41" width="10" height="7" rx="2" fill="#c4361f" stroke="#5a3a10" stroke-width="0.8"/>
    <circle cx="10" cy="52" r="5" fill="#c4361f" stroke="#5a3a10" stroke-width="1"/>
    <path d="M10 57 L10 60" stroke="#5a3a10" stroke-width="2"/>
  </svg>`,
  { size: 192 },
);

const PVCPRINT = svg(
  `<svg viewBox="0 0 20 120" xmlns="http://www.w3.org/2000/svg">
    <text transform="translate(14,116) rotate(-90)" font-family="monospace" font-weight="bold" font-size="9" fill="#1c2540">PVC 20mm · ANIMARIS · 07</text>
  </svg>`,
  { size: 384 },
);

const PLATE = svg(
  `<svg viewBox="0 0 160 44" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="158" height="42" rx="4" fill="#f1e3bd" stroke="#1d3a6e" stroke-width="2.5"/>
    <rect x="5" y="5" width="150" height="34" rx="2" fill="none" stroke="#c4361f" stroke-width="1" stroke-dasharray="3 2"/>
    <text x="80" y="23" text-anchor="middle" font-family="Impact, sans-serif" font-weight="bold" font-size="18" fill="#1d3a6e" letter-spacing="2">ANIMARIS</text>
    <text x="80" y="35" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="8" fill="#8a3a1a">PERCIPIERE · No. 7 · WIND ONLY</text>
  </svg>`,
  { size: 512 },
);

const VANE = svg(
  `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="f"><polygon points="2,68 98,68 98,10 80,36 60,6 40,36 20,4 2,12"/></clipPath></defs>
    <g clip-path="url(#f)">
      <rect x="0" y="0" width="100" height="70" fill="#f7f1df"/>
      <rect x="0" y="0" width="33" height="70" fill="#d4482f"/>
      <rect x="66" y="0" width="34" height="70" fill="#2f6fcf"/>
    </g>
    <polygon points="2,68 98,68 98,10 80,36 60,6 40,36 20,4 2,12" fill="none" stroke="#1d2540" stroke-width="2.5" stroke-linejoin="round"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "strandbeest", paintSize: 2048 });

  const chassis = b.joint("chassis", { at: [0, Yc, 0], dir: [0, 1, 0], group: "frame" });
  const crank = b.joint("crankshaft", { parent: chassis, at: [0, Yc, 0], dir: [1, 0, 0], role: "hinge", group: "frame" });

  const tube = (a: THREE.Vector3 | number[], c: THREE.Vector3 | number[], r: number, color: any, bone: any, sides = 6) =>
    b.rod(a, c, r, { color, bone, sides });

  // -------------------------------------------------------------------------------------------------------------
  // Legs: twelve Jansen linkages (a front and a rear on each of six crank stations)

  const hubs: THREE.BufferGeometry[] = [];
  const PIN = "#2b2d36";
  const WASH = "#dcd7c8";

  function linkage(name: string, dir: 1 | -1, xs: number, thDeg: number) {
    const J = jansen(thDeg * DEG);
    const base = xs - dir * 0.055;
    const W = (q: P2, layer: number) =>
      v3(base + (layer - 1.5) * LP, Yc + (q[1] - H.l) * S, -dir * (q[0] - H.a) * S);
    const leg = b.joint(name, {
      parent: chassis,
      at: W(J.P0, 1.5),
      aim: W(J.P7, 1.5),
      role: "leg",
      group: "legs",
    });
    for (const [p, q, layer] of LINKS) tube(W(J[p], layer), W(J[q], layer), ROD_R, PVC, leg);
    // pins and washers through every moving node
    const pins: THREE.BufferGeometry[] = [];
    const washers: THREE.BufferGeometry[] = [];
    for (const key of ["B", "P3", "P4", "P5", "P6", "P7"]) {
      const c = W(J[key], 1.5);
      pins.push(new THREE.CylinderGeometry(0.0065, 0.0065, 0.092, 6).rotateZ(Math.PI / 2).translate(c.x, c.y, c.z));
      for (const sx of [-1, 1])
        washers.push(
          new THREE.CylinderGeometry(0.016, 0.016, 0.004, 8).rotateZ(Math.PI / 2).translate(c.x + sx * 0.048, c.y, c.z),
        );
    }
    b.part(mergeGeometries(pins)!, PIN, { bone: leg, at: [0, 0, 0], flat: true });
    b.part(mergeGeometries(washers)!, WASH, { bone: leg, at: [0, 0, 0], flat: true });
    // rubber foot roller
    b.part(new THREE.CylinderGeometry(FOOT_R, FOOT_R, 0.09, 10).rotateZ(Math.PI / 2), RUBBER, {
      bone: leg,
      at: W(J.P7, 1.5),
      flat: true,
    });
    // crank arm on the shaft
    b.rod(W(J.C, 3), W(J.B, 3), { radius: 0.01, color: STEEL, bone: crank, sides: 4 });
    const hc = W(J.C, 3);
    hubs.push(new THREE.CylinderGeometry(0.026, 0.026, 0.018, 8).rotateZ(Math.PI / 2).translate(hc.x, hc.y, hc.z));
  }

  XS.forEach((xs, i) => {
    linkage(`legF${i + 1}`, 1, xs, thMin + FRONT_PH[i]);
    linkage(`legR${i + 1}`, -1, xs, thMin + REAR_PH[i]);
  });
  b.part(mergeGeometries(hubs)!, "#4a4f5a", { bone: crank, at: [0, 0, 0], flat: true });

  // -------------------------------------------------------------------------------------------------------------
  // Chassis: shaft, pivot axles, long beams, cross tubes

  tube([-0.95, Yc, 0], [0.95, Yc, 0], 0.017, STEEL, crank, 8);
  for (const sx of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.03, 8, 6), "#c4361f", { bone: crank, at: [sx * 0.97, Yc, 0] });
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.02, 8).rotateZ(Math.PI / 2), "#4a4f5a", {
      bone: crank,
      at: [sx * 0.91, Yc, 0],
      flat: true,
    });
  }
  const PIV_Y = Yc + (0 - H.l) * S;
  for (const sz of [1, -1]) tube([-0.88, PIV_Y, sz * 0.475], [0.88, PIV_Y, sz * 0.475], 0.013, STEEL, chassis, 8);

  const BEAMX = [-0.78, -0.52, -0.26, 0, 0.26, 0.52, 0.78];
  const plugs: THREE.BufferGeometry[] = [];
  const clamps: THREE.BufferGeometry[] = [];
  for (const x of BEAMX) {
    tube([x, Yc, -0.56], [x, Yc, 0.56], BEAM_R, PVC, chassis);
    for (const sz of [1, -1]) {
      tube([x, Yc, sz * 0.475], [x, PIV_Y, sz * 0.475], 0.012, PVC, chassis);
      plugs.push(new THREE.SphereGeometry(0.019, 6, 4).translate(x, Yc, sz * 0.568));
    }
  }
  for (const sz of [1, -1]) tube([-0.9, Yc, sz * 0.56], [0.9, Yc, sz * 0.56], BEAM_R, PVC, chassis);
  for (const sx of [-1, 1]) plugs.push(new THREE.SphereGeometry(0.019, 6, 4).translate(sx * 0.9, Yc, 0.56), new THREE.SphereGeometry(0.019, 6, 4).translate(sx * 0.9, Yc, -0.56));

  // deck on posts (bottle rack)
  for (const x of [-0.78, -0.26, 0.26, 0.78])
    for (const sz of [1, -1]) {
      tube([x, Yc, sz * 0.3], [x, DECK_Y, sz * 0.3], 0.014, PVC, chassis);
      tube([x, Yc, sz * 0.52], [x, DECK_Y, sz * 0.3], 0.01, PVC, chassis); // diagonal brace
      clamps.push(new THREE.CylinderGeometry(0.022, 0.022, 0.022, 8).translate(x, Yc + 0.03, sz * 0.3));
      clamps.push(new THREE.CylinderGeometry(0.022, 0.022, 0.022, 8).translate(x, DECK_Y - 0.02, sz * 0.3));
    }
  for (const sz of [1, -1]) tube([-0.9, DECK_Y, sz * 0.3], [0.9, DECK_Y, sz * 0.3], 0.014, PVC, chassis);
  for (const x of [-0.78, -0.26, 0.26, 0.78]) tube([x, DECK_Y, -0.3], [x, DECK_Y, 0.3], 0.014, PVC, chassis);
  b.part(mergeGeometries(plugs)!, "#1f2026", { bone: chassis, at: [0, 0, 0], flat: true });
  b.part(mergeGeometries(clamps)!, "#23242b", { bone: chassis, at: [0, 0, 0], flat: true });

  // printed tape on top of the beams
  for (const x of BEAMX)
    b.part(new THREE.PlaneGeometry(0.026, 0.36), "#ffffff", {
      at: [x, Yc + BEAM_R + 0.003, x === 0 ? 0.3 : -0.3],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      axis: "z",
      texture: PVCPRINT,
      bone: chassis,
    });

  // -------------------------------------------------------------------------------------------------------------
  // Bottle lungs

  const BOT: [number, number][] = [
    [0, 0],
    [0.03, 0],
    [0.043, 0.012],
    [0.046, 0.04],
    [0.046, 0.21],
    [0.043, 0.245],
    [0.024, 0.275],
    [0.016, 0.29],
    [0.016, 0.315],
    [0.02, 0.318],
    [0.02, 0.345],
    [0, 0.345],
  ];
  const BL = 0.345;
  const bPaints = [botPaint("#bfe6ee", 1), botPaint("#cdeedd", 2), botPaint("#c3dff0", 3)];
  const T1 = DECK_Y + 0.062;
  const T2 = T1 + 0.05;
  function bottleRow(y: number, z: number, flip: number, pi: number) {
    for (let k = 0; k < 5; k++) {
      const cx = -0.69 + BL * k;
      const plus = (k + flip) % 2 === 0;
      b.lathe(BOT, {
        at: [plus ? cx - BL / 2 : cx + BL / 2, y, z],
        axis: [plus ? 1 : -1, 0, 0],
        segments: 8,
        color: bPaints[(pi + k) % 3],
        bone: chassis,
      });
    }
  }
  [-0.15, 0, 0.15].forEach((z, i) => bottleRow(T1, z, i, i));
  [-0.075, 0.075].forEach((z, i) => bottleRow(T2, z, i + 1, i + 1));

  for (const x of [-0.43, 0, 0.43]) {
    const pts = [
      [x, DECK_Y + 0.006, -0.19],
      [x, DECK_Y + 0.006, 0.19],
      [x, T1 + 0.02, 0.208],
      [x, T2 + 0.048, 0.12],
      [x, T2 + 0.058, 0],
      [x, T2 + 0.048, -0.12],
      [x, T1 + 0.02, -0.208],
    ];
    b.sweep(catmull(pts, { closed: true }), {
      radius: () => [0.012, 0.0032],
      section: "box",
      color: "#1e2026",
      bone: chassis,
    });
  }

  // name plate on posts
  for (const sx of [-1, 1]) tube([sx * 0.22, DECK_Y, 0.3], [sx * 0.22, DECK_Y + 0.22, 0.33], 0.01, PVC, chassis);
  b.part(new THREE.BoxGeometry(0.58, 0.16, 0.016), WOOD, { at: [0, DECK_Y + 0.27, 0.33], bone: chassis, flat: true });
  for (const sz of [1, -1])
    b.part(new THREE.PlaneGeometry(0.54, 0.54 * (44 / 160)), "#ffffff", {
      at: [0, DECK_Y + 0.27, 0.33 + sz * 0.0095],
      dir: [0, 0, sz],
      axis: "z",
      texture: PLATE,
      bone: chassis,
    });

  // -------------------------------------------------------------------------------------------------------------
  // Mast, vane, anemometer

  const YP = YM - 0.15;
  tube([0, Yc, ZM - 0.02], [0, YP, ZM - 0.02], 0.02, PVC, chassis, 8);
  tube([0, YP, ZM - 0.02], [0, YM + 0.28, ZM - 0.02], 0.008, STEEL, chassis, 6);
  b.part(new THREE.SphereGeometry(0.03, 8, 6), "#2b2d36", { bone: chassis, at: [0, YP, ZM - 0.02] });
  tube([0, Yc, ZM - 0.02], [0, Yc + 0.4, ZM - 0.02], 0.026, STEEL, chassis, 8); // base sleeve

  const vane = b.joint("vane", { parent: chassis, at: [0, YM, ZM - 0.02], dir: [0, 1, 0], role: "hinge", group: "wind" });
  tube([0, YM, ZM - 0.02 - 0.3], [0, YM, ZM - 0.02 + 0.28], 0.008, PVC, vane);
  b.spike([0, YM, ZM - 0.02 + 0.28], [0, 0, 1], 0.17, 0.026, { color: "#d4482f", bone: vane, sides: 6 });
  b.part(new THREE.SphereGeometry(0.028, 6, 5), "#23242b", { bone: vane, at: [0, YM, ZM - 0.02] });
  b.cards([frame([0, YM, ZM - 0.02 - 0.18], [0, 1, 0])], VANE, { size: [0.32, 0.22], lean: 0, flow: [1, 0, 0], bone: vane });

  const rotor = b.joint("rotor", { parent: chassis, at: [0, YM + 0.22, ZM - 0.02], dir: [0, 1, 0], role: "hinge", group: "wind" });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), "#c4361f", { bone: rotor, at: [0, YM + 0.22, ZM - 0.02] });
  const R = 0.05;
  const BOWL: [number, number][] = [
    [0, -R],
    [R * 0.5, -R * 0.87],
    [R * 0.87, -R * 0.5],
    [R, 0],
    [R - 0.004, 0],
    [R * 0.87 - 0.004, -R * 0.5 + 0.002],
    [R * 0.5 - 0.003, -R * 0.87 + 0.003],
    [0, -R + 0.004],
  ];
  for (let k = 0; k < 3; k++) {
    const al = k * 120 * DEG;
    const r = v3(Math.sin(al), 0, Math.cos(al));
    const t = v3(Math.cos(al), 0, -Math.sin(al));
    const hub = v3(0, YM + 0.22, ZM - 0.02);
    const end = hub.clone().addScaledVector(r, 0.2);
    tube(hub, end, 0.006, STEEL, rotor, 5);
    b.lathe(BOWL, {
      at: end.clone().addScaledVector(t, R * 0.5),
      axis: [t.x, 0, t.z],
      segments: 8,
      color: k === 0 ? "#d4482f" : "#e8f2f4",
      bone: rotor,
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Sails: centre panel and two swept-back wings

  const CENTER: [number, number][] = [
    [-0.45, 0],
    [0.45, 0],
    [0.45, 0.9],
    [0.2, 1.0],
    [-0.2, 1.0],
    [-0.45, 0.9],
  ];
  const sailC = b.extrude(CENTER, {
    at: [0, YB, ZM],
    x: [1, 0, 0],
    thickness: 0.006,
    color: sailPaint("#1d3a6e", 11),
    bone: chassis,
  });
  void sailC;
  const CP = (u: number, v: number) => v3(u, YB + v, ZM);
  for (let i = 0; i < CENTER.length; i++) {
    const p = CENTER[i];
    const q = CENTER[(i + 1) % CENTER.length];
    tube(CP(p[0], p[1]), CP(q[0], q[1]), 0.009, PVC, chassis);
  }
  for (const u of [-0.15, 0.15]) tube(CP(u, 0.0), CP(u * 0.5, 1.0), 0.005, PVC, chassis, 5);
  for (const sz of [1, -1])
    b.part(new THREE.PlaneGeometry(0.64, 0.64), "#ffffff", {
      at: [0, YB + 0.5, ZM + sz * 0.0045],
      dir: [0, 0, sz],
      axis: "z",
      texture: EMBLEM,
      bone: chassis,
    });

  const WING: [number, number][] = [
    [0, 0],
    [0.72, 0.1],
    [0.7, 0.62],
    [0.36, 0.9],
    [0, 1.0],
  ];
  const c30 = Math.cos(30 * DEG);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wing = b.joint(`wing${side}`, {
      parent: chassis,
      at: [s * 0.45, YB, ZM],
      dir: [0, 1, 0],
      role: "hinge",
      group: "sails",
    });
    const dx = v3(s * c30, 0, -0.5);
    const nrm = v3(0.5, 0, s * c30);
    const WP = (u: number, v: number) => v3(s * 0.45 + dx.x * u, YB + v, ZM + dx.z * u);
    b.extrude(WING, {
      at: [s * 0.45, YB, ZM],
      x: [dx.x, 0, dx.z],
      thickness: 0.006,
      color: sailPaint(s > 0 ? "#c4361f" : "#2f6fcf", s > 0 ? 21 : 33),
      bone: wing,
    });
    for (let i = 0; i < WING.length - 1; i++) {
      const p = WING[i];
      const q = WING[i + 1];
      tube(WP(p[0], p[1]), WP(q[0], q[1]), 0.009, PVC, wing);
    }
    tube(WP(0.05, 0.03), WP(0.66, 0.6), 0.005, PVC, wing, 5);
    tube(WP(0.05, 0.97), WP(0.66, 0.14), 0.005, PVC, wing, 5);
    for (const sz of [1, -1]) {
      const at = WP(0.4, 0.46).addScaledVector(nrm, sz * 0.0045);
      b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", {
        at,
        dir: [nrm.x * sz, 0, nrm.z * sz],
        axis: "z",
        texture: BADGE,
        bone: wing,
      });
    }
    // pennant on a short flagpole at the outer top corner
    const top = WP(0.36, 0.9);
    const topEnd = top.clone().add(v3(0, 0.32, 0));
    tube(top, topEnd, 0.006, STEEL, wing, 5);
    b.cards([frame(topEnd.clone().add(v3(0, -0.04, 0)), [0, 0, -1])], PENNANT, {
      size: [0.1, 0.42],
      lean: 0,
      flow: [1, 0, 0],
      bend: 20,
      bone: wing,
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Rigging

  const rope = (a: THREE.Vector3, c: THREE.Vector3, sag = 0.04) => {
    const m = a.clone().add(c).multiplyScalar(0.5);
    m.y -= sag;
    return b.sweep(catmull([a, m, c]), 0.0045, { color: ROPE, bone: chassis, sides: 5 });
  };
  const T = v3(0, YP - 0.05, ZM - 0.02);
  rope(T, v3(0, Yc + 0.02, 0.56), 0.05);
  rope(T, v3(0, Yc + 0.02, -0.56), 0.05);
  for (const sx of [-1, 1]) {
    rope(T, v3(sx * 0.78, DECK_Y, 0.3), 0.05);
    const outerTop = v3(sx * (0.45 + 0.36 * c30), YB + 0.9, ZM - 0.18);
    rope(T, outerTop, 0.06);
    rope(v3(sx * (0.45 + 0.72 * c30), YB + 0.1, ZM - 0.36), v3(sx * 0.78, DECK_Y, -0.3), 0.05);
  }

  // tassels hanging from the deck corners
  for (const x of [-0.78, 0.78])
    for (const z of [-0.3, 0.3])
      b.cards([frame([x, DECK_Y - 0.012, z], [0, 1, 0])], TASSEL, {
        size: [0.05, 0.16],
        lean: 180,
        flow: [0, 0, 1],
        bone: chassis,
      });

  return b.root;
}
```