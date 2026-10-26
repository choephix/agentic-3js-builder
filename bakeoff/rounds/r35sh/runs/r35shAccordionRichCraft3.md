```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, catmull, grain, mix, noise, paint, rng, smoothstep, svg } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Piano accordion",
  description:
    "Italian mother-of-pearl piano accordion: swirled pearloid celluloid body, 41 ivory and black keys, chrome and filigree grilles, striped celluloid binding, pleated bellows with metal corners, register switches, bass buttons and leather straps.",
};

type V = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Dimensions (meters). The bellows axis runs along X; the keyboard faces +Z on the right-hand (model -X) box.
const D = 0.22;
const HALF = D / 2;
const YB = 0.014; // underside of the boxes, resting on little chrome feet
const HT = 0.42;
const HB = 0.38;
const T0 = -0.29;
const T1 = -0.09;
const S0 = 0.11;
const S1 = 0.285;
const TC = (T0 + T1) / 2;
const SC = (S0 + S1) / 2;
const TYC = YB + HT / 2;
const SYC = YB + HB / 2;
const DEG = Math.PI / 180;

// Bellows
const BX0 = -0.082;
const BX1 = 0.102;
const FOLDS = 9;
const RT0 = YB + HT - 0.007;
const RT1 = YB + HB - 0.007;
const RB = YB + 0.007;
const RH = HALF + 0.003 - 0.007;
const INSET = 0.026;
const CH = 0.014;

// ---------------------------------------------------------------------------------------------------------------
// Paints
const tmp = new THREE.Vector3();

function pearlPaint(seed: number, k: number) {
  return paint((p, n) => {
    const w = noise(p, 0.08, seed);
    tmp.set(p.x + (w - 0.5) * 0.07, p.y + (w - 0.5) * 0.06, p.z + (w - 0.5) * 0.07);
    const s1 = noise(tmp, 0.05, seed + 4);
    const s2 = noise(tmp, 0.034, seed + 9);
    const s3 = noise(tmp, 0.07, seed + 17);
    let c = mix("#f7f3ea", "#f3d3de", Math.min(1, k * smoothstep(0.42, 0.7, s1)));
    c = mix(c, "#c6e4e9", Math.min(1, k * 0.85 * smoothstep(0.52, 0.74, s2)));
    c = mix(c, "#d6cbef", Math.min(1, k * 0.6 * smoothstep(0.6, 0.8, s3)));
    const vein = Math.abs(noise(tmp, 0.022, seed + 23) - 0.5);
    c = mix(c, "#a9a6bd", 0.4 * (1 - smoothstep(0, 0.016, vein)));
    const f = noise(p, 0.004, seed + 31);
    if (f > 0.7) c = mix(c, "#ffffff", 0.65);
    else if (f < 0.25) c = mix(c, "#e9d2e2", 0.45);
    const up = 0.5 + 0.5 * n.y;
    c = mix(c, "#8f9cc2", 0.2 * (1 - up));
    return mix(c, "#fff6e4", 0.12 * up);
  });
}

const PEARL = pearlPaint(3, 1);
const PEARL_DEEP = pearlPaint(21, 2.4);

const BLACKPEARL = paint((p, n) => {
  const s = noise(p, 0.05, 41);
  let c = mix("#0f0e14", "#2a2238", smoothstep(0.3, 0.8, s));
  const f = noise(p, 0.004, 43);
  if (f > 0.72) c = mix(c, "#7f8fba", 0.5);
  else if (f < 0.2) c = mix(c, "#a2789b", 0.3);
  return mix(c, "#55546f", 0.25 * smoothstep(0.5, 1, n.y));
});

const CHROME = paint((p, n) => {
  const t = n.y * 0.55 + n.z * 0.25 + (noise(p, 0.05, 2) - 0.5) * 0.5;
  return mix("#59626f", "#f7fafe", smoothstep(-0.45, 0.65, t));
});

const GILT = metal("gilt");
const LEATHER = grain("#3c2314", "#5e3a21", { size: 0.006, axis: "x" });

const BELLOWS = paint((p, n) => {
  const t = smoothstep(-0.8, 0.8, n.x + 0.3 * n.y);
  const sheen = noise(p, 0.03, 8);
  return mix(mix("#0d0c12", "#2a2536", t), "#3b3652", 0.25 * sheen * t);
});

// Black-and-white celluloid binding: diagonal stripes read on a rod running in any direction.
const BIND = paint((p) => (Math.floor((p.x + p.y + p.z) / 0.0055) & 1 ? "#f4efe2" : "#16141b"));

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const gradDefs = (w: number) => `
  <linearGradient id="ch" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${w}" y2="0">
    <stop offset="0" stop-color="#6f7886"/><stop offset=".3" stop-color="#fbfdff"/><stop offset=".55" stop-color="#aeb8c5"/>
    <stop offset=".8" stop-color="#f3f6fa"/><stop offset="1" stop-color="#8a94a3"/></linearGradient>
  <linearGradient id="gd" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${w}" y2="0">
    <stop offset="0" stop-color="#9b6518"/><stop offset=".4" stop-color="#ffe49a"/><stop offset=".7" stop-color="#c58f30"/><stop offset="1" stop-color="#f2cd6e"/></linearGradient>
  <radialGradient id="pr" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#f3dbe6"/><stop offset="1" stop-color="#b9d8df"/></radialGradient>
  <pattern id="holes" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#121118"/><circle cx="2.5" cy="2.5" r="1.05" fill="#3d3c4c"/></pattern>`;

function medallion(cx: number, cy: number, r: number, jewel: string) {
  let petals = "";
  for (let a = 0; a < 8; a++)
    petals += `<ellipse cx="${cx}" cy="${cy - r * 0.55}" rx="${r * 0.17}" ry="${r * 0.3}" transform="rotate(${a * 45} ${cx} ${cy})" fill="none" stroke="url(#ch)" stroke-width="1.5"/>`;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#121118" stroke="url(#ch)" stroke-width="3"/>
    <circle cx="${cx}" cy="${cy}" r="${r - 4.5}" fill="none" stroke="url(#gd)" stroke-width="1"/>${petals}
    <circle cx="${cx}" cy="${cy}" r="${r * 0.3}" fill="${jewel}" stroke="url(#gd)" stroke-width="1.6"/>
    <circle cx="${cx - r * 0.09}" cy="${cy - r * 0.1}" r="${r * 0.08}" fill="#fff" opacity=".8"/>`;
}

function scroll(y: number, s: number) {
  const x = (d: number) => 45 + s * d;
  return `<path d="M45 ${y} C ${x(20)} ${y - 12} ${x(34)} ${y + 4} ${x(28)} ${y + 16} C ${x(24)} ${y + 24} ${x(14)} ${y + 20} ${x(17)} ${y + 13}" fill="none" stroke="url(#ch)" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="${x(17)}" cy="${y + 13}" r="2.2" fill="url(#gd)"/>
    <ellipse cx="${x(31)}" cy="${y - 3}" rx="3.2" ry="5" transform="rotate(${s * 35} ${x(31)} ${y - 3})" fill="url(#pr)" stroke="url(#ch)" stroke-width=".9"/>`;
}

function grilleSvg() {
  let scrolls = "";
  for (const y of [86, 108, 130, 232, 252, 272]) scrolls += scroll(y, 1) + scroll(y, -1);
  return `<svg viewBox="0 0 90 370" xmlns="http://www.w3.org/2000/svg"><defs>${gradDefs(90)}</defs>
    <rect x="0" y="0" width="90" height="370" rx="12" fill="#0f0e14"/>
    <rect x="4" y="4" width="82" height="362" rx="9" fill="url(#holes)"/>
    <rect x="3" y="3" width="84" height="364" rx="10" fill="none" stroke="url(#ch)" stroke-width="4"/>
    <rect x="7.5" y="7.5" width="75" height="355" rx="7" fill="none" stroke="url(#gd)" stroke-width="1.2"/>
    <line x1="45" y1="80" x2="45" y2="292" stroke="url(#ch)" stroke-width="3"/>
    ${scrolls}
    ${medallion(45, 55, 24, "#d3213c")}
    ${medallion(45, 315, 24, "#1fa464")}
    <ellipse cx="45" cy="185" rx="25" ry="36" fill="url(#pr)" stroke="url(#ch)" stroke-width="3.2"/>
    <ellipse cx="45" cy="185" rx="20" ry="31" fill="none" stroke="url(#gd)" stroke-width="1.1"/>
    <polygon points="45,160 49,181 70,185 49,189 45,210 41,189 20,185 41,181" fill="url(#gd)" stroke="#6b4510" stroke-width=".8" transform="scale(1)" opacity=".95"/>
    <circle cx="45" cy="185" r="3.2" fill="#d3213c" stroke="#fff" stroke-width=".6"/>
    <rect x="33" y="346" width="8" height="11" fill="#2f9e4f"/><rect x="41" y="346" width="8" height="11" fill="#f6f2e8"/><rect x="49" y="346" width="8" height="11" fill="#cf2b34"/>
    <rect x="33" y="346" width="24" height="11" fill="none" stroke="url(#ch)" stroke-width="1.2"/>
  </svg>`;
}

function rosetteSvg(accent: string) {
  let petals = "";
  let dots = "";
  for (let a = 0; a < 12; a++) {
    petals += `<ellipse cx="100" cy="52" rx="10" ry="22" transform="rotate(${a * 30} 100 100)" fill="${accent}" stroke="url(#ch)" stroke-width="2.2"/>`;
    dots += `<circle cx="100" cy="24" r="3.2" transform="rotate(${a * 30 + 15} 100 100)" fill="url(#gd)"/>`;
  }
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><defs>${gradDefs(200)}</defs>
    <circle cx="100" cy="100" r="99" fill="#0f0e14"/>
    <circle cx="100" cy="100" r="90" fill="url(#holes)"/>
    <circle cx="100" cy="100" r="96" fill="none" stroke="url(#ch)" stroke-width="5"/>
    <circle cx="100" cy="100" r="88" fill="none" stroke="url(#gd)" stroke-width="1.6"/>
    <circle cx="100" cy="100" r="80" fill="none" stroke="url(#ch)" stroke-width="1.6"/>
    ${petals}${dots}
    <circle cx="100" cy="100" r="23" fill="#121118" stroke="url(#ch)" stroke-width="3"/>
    <polygon points="100,80 104,96 120,100 104,104 100,120 96,104 80,100 96,96" fill="url(#gd)"/>
  </svg>`;
}

function badgeSvg() {
  return `<svg viewBox="0 0 240 64" xmlns="http://www.w3.org/2000/svg"><defs>${gradDefs(240)}</defs>
    <rect x="1.5" y="1.5" width="237" height="61" rx="14" fill="#101017" stroke="url(#gd)" stroke-width="3"/>
    <rect x="6" y="6" width="228" height="52" rx="10" fill="none" stroke="#f3e9ee" stroke-width=".9" opacity=".7"/>
    <text x="120" y="39" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-weight="bold" font-size="31" fill="url(#gd)">Serenata</text>
    <text x="120" y="55" text-anchor="middle" font-family="Georgia, serif" font-size="8.5" letter-spacing="3" fill="#e8e3d6">FIRENZE · ITALIA</text>
  </svg>`;
}

function paperSvg() {
  let diamonds = "";
  for (let i = 0; i < 10; i++) {
    const cy = 8 + i * 16;
    diamonds += `<polygon points="12,${cy - 7} 20,${cy} 12,${cy + 7} 4,${cy}" fill="${i % 2 ? "url(#gd)" : "url(#pr)"}" stroke="#2a1d0a" stroke-width=".8"/>`;
  }
  return `<svg viewBox="0 0 24 160" xmlns="http://www.w3.org/2000/svg"><defs>${gradDefs(24)}</defs>
    <rect width="24" height="160" fill="#14121a"/><line x1="1.5" y1="0" x2="1.5" y2="160" stroke="url(#gd)" stroke-width="1.4"/>
    <line x1="22.5" y1="0" x2="22.5" y2="160" stroke="url(#gd)" stroke-width="1.4"/>${diamonds}</svg>`;
}

function legendSvg() {
  let dots = "";
  for (let i = 0; i < 7; i++) {
    const cx = 12 + i * 23.5 + 0.0;
    const count = (i % 3) + 1;
    for (let k = 0; k < count; k++) dots += `<circle cx="${cx + (k - (count - 1) / 2) * 6}" cy="11" r="2.6" fill="#f2ece0"/>`;
  }
  return `<svg viewBox="0 0 168 22" xmlns="http://www.w3.org/2000/svg"><rect width="168" height="22" rx="3" fill="#0f0e14"/>${dots}</svg>`;
}

// ---------------------------------------------------------------------------------------------------------------
// Geometry helpers
const rrect = (w: number, h: number, c: number): [number, number][] => {
  const x = w / 2;
  const y = h / 2;
  return [
    [-x + c, -y],
    [x - c, -y],
    [x, -y + c],
    [x, y - c],
    [x - c, y],
    [-x + c, y],
    [-x, y - c],
    [-x, -y + c],
  ];
};

const loopPts = (u0: number, u1: number, v0: number, v1: number, c: number, map: (u: number, v: number) => V) => {
  const pts: [number, number][] = [
    [u0 + c, v0],
    [u1 - c, v0],
    [u1, v0 + c],
    [u1, v1 - c],
    [u1 - c, v1],
    [u0 + c, v1],
    [u0, v1 - c],
    [u0, v0 + c],
  ];
  return pts.map(([u, v]) => map(u, v));
};

const place = (geo: THREE.BufferGeometry, pos: V, rot: V = [0, 0, 0]) => {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(...pos),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)),
    new THREE.Vector3(1, 1, 1),
  );
  geo.applyMatrix4(m);
  return geo;
};

function bellowsGeometry() {
  const n = FOLDS * 2;
  const rings: V[][] = [];
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    const x = BX0 + (BX1 - BX0) * t;
    const ridge = k % 2 === 0;
    const e = ridge ? 0 : INSET;
    const top = THREE.MathUtils.lerp(RT0, RT1, t) - e;
    const bot = RB + e;
    const hd = RH - e;
    const c = CH * (ridge ? 1 : 0.8);
    const zy: [number, number][] = [
      [hd - c, top],
      [hd, top - c],
      [hd, bot + c],
      [hd - c, bot],
      [-hd + c, bot],
      [-hd, bot + c],
      [-hd, top - c],
      [-hd + c, top],
    ];
    rings.push(zy.map(([z, y]) => [x, y, z] as V));
  }
  const pos: number[] = [];
  const uv: number[] = [];
  const tri = (a: V, au: [number, number], b2: V, bu: [number, number], c2: V, cu: [number, number]) => {
    pos.push(...a, ...b2, ...c2);
    uv.push(...au, ...bu, ...cu);
  };
  for (let k = 0; k < n; k++)
    for (let i = 0; i < 8; i++) {
      const j = (i + 1) % 8;
      const a = rings[k][i];
      const a2 = rings[k][j];
      const b1 = rings[k + 1][i];
      const b2 = rings[k + 1][j];
      const ua: [number, number] = [i / 8, k / n];
      const ua2: [number, number] = [(i + 1) / 8, k / n];
      const ub: [number, number] = [i / 8, (k + 1) / n];
      const ub2: [number, number] = [(i + 1) / 8, (k + 1) / n];
      tri(a, ua, a2, ua2, b1, ub);
      tri(a2, ua2, b2, ub2, b1, ub);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "piano_accordion" });
  const R = rng(5);

  type Fill = string | ReturnType<typeof paint>;
  type Extra = { rotation?: V; texture?: THREE.Texture; name?: string; flat?: boolean };
  const box = (w: number, h: number, d: number, at: V, color: Fill, extra: Extra = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, at: V, color: Fill, extra: Extra = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, ...extra });
  const mergedPart = (geos: THREE.BufferGeometry[], color: Fill, name: string) =>
    b.part(mergeGeometries(geos)!, color, { at: [0, 0, 0], name, flat: true });
  const plane = (tex: THREE.Texture, w: number, h: number, at: V, dir: V, up?: V) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      at,
      dir,
      axis: "z" as const,
      texture: tex,
      ...(up ? { up } : {}),
    });
  const loop = (pts: V[], r: number, color: Fill, sides = 6) =>
    b.sweep(catmull(pts, { closed: true }), r, { color, sides });

  // Textures
  const GRILLE = svg(grilleSvg(), { size: 768 });
  const ROSETTE_R = svg(rosetteSvg("#6e0f1e"), { size: 384 });
  const ROSETTE_G = svg(rosetteSvg("#0c5a38"), { size: 384 });
  const BADGE = svg(badgeSvg(), { size: 960 });
  const PAPER = svg(paperSvg(), { size: 320 });
  const LEGEND = svg(legendSvg(), { size: 672 });

  const chromeBits: THREE.BufferGeometry[] = [];

  // =============================================================================================================
  // Bodies
  b.extrude(rrect(D, HT, 0.016), {
    at: [TC, TYC, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: T1 - T0,
    bevel: 0.006,
    smoothing: 1,
    color: PEARL,
    name: "trebleBody",
  });
  b.extrude(rrect(D, HB, 0.016), {
    at: [SC, SYC, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: S1 - S0,
    bevel: 0.006,
    smoothing: 1,
    color: PEARL,
    name: "bassBody",
  });

  // Bellows frames (black celluloid collars) with chrome studs
  b.extrude(rrect(D + 0.006, HT + 0.006, 0.012), {
    at: [-0.086, TYC, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.008,
    bevel: 0.0015,
    smoothing: 1,
    color: BLACKPEARL,
    name: "trebleFrame",
  });
  b.extrude(rrect(D + 0.006, HB + 0.006, 0.012), {
    at: [0.106, SYC, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.008,
    bevel: 0.0015,
    smoothing: 1,
    color: BLACKPEARL,
    name: "bassFrame",
  });
  for (const sz of [1, -1]) {
    for (let i = 0; i < 11; i++) {
      chromeBits.push(
        place(new THREE.SphereGeometry(0.0027, 6, 4), [-0.086, 0.03 + i * 0.0385, sz * 0.1135]),
      );
      if (i < 10) chromeBits.push(place(new THREE.SphereGeometry(0.0027, 6, 4), [0.106, 0.03 + i * 0.0355, sz * 0.1135]));
    }
  }

  // =============================================================================================================
  // Bellows
  b.part(bellowsGeometry(), BELLOWS, { at: [0, 0, 0], name: "bellows", flat: true });
  const nHalf = FOLDS * 2;
  for (let k = 2; k <= nHalf - 2; k += 2) {
    const t = k / nHalf;
    const x = BX0 + (BX1 - BX0) * t;
    const top = THREE.MathUtils.lerp(RT0, RT1, t);
    const hStrip = top - RB - 2 * CH - 0.002;
    for (const sz of [1, -1])
      box(0.0058, hStrip, 0.005, [x, (top + RB) / 2, sz * (RH + 0.0008)], "#ffffff", {
        texture: PAPER,
        name: "bellowsPaper",
      });
    for (const sy of [1, -1])
      for (const sz of [1, -1]) {
        const z = sz * (RH - CH / 2 + 0.0014);
        const y = sy === 1 ? top - CH / 2 + 0.0014 : RB + CH / 2 - 0.0014;
        const ang = (Math.atan2(-sy, sz) * 180) / Math.PI;
        chromeBits.push(place(new THREE.BoxGeometry(0.01, 0.022, 0.0045), [x, y, z], [ang, 0, 0]));
      }
  }

  // =============================================================================================================
  // Treble keyboard (41 keys, F to A) on the front face
  box(0.092, 0.376, 0.005, [-0.236, TYC, 0.1125], BLACKPEARL, { name: "keybed" });
  const KP = 0.0155;
  const KY0 = TYC - 12 * KP;
  const blacks: number[] = [];
  for (let i = 0; i < 24; i++) {
    const y = KY0 + KP * (i + 0.5);
    box(0.09, KP - 0.0014, 0.011, [-0.237, y, 0.1205], "#f8f3e5", { name: `keyWhite${i}` });
    const l = i % 7; // F G A B C D E
    if (i < 23 && l !== 3 && l !== 6) blacks.push(KY0 + KP * (i + 1));
  }
  blacks.forEach((y, i) => box(0.045, 0.0092, 0.0175, [-0.2155, y, 0.12875], "#15131a", { name: `keyBlack${i}` }));
  box(0.096, 0.004, 0.012, [-0.236, 0.0335, 0.116], CHROME, { name: "keyRailLow" });
  box(0.096, 0.004, 0.012, [-0.236, 0.4145, 0.116], CHROME, { name: "keyRailHigh" });
  box(0.004, 0.376, 0.01, [-0.1875, TYC, 0.1155], GILT, { name: "keyRailInner" });

  // Grille panel, with a gilt frame and pearl diamonds above and below
  plane(GRILLE, 0.08, 0.3289, [-0.141, TYC, 0.1115], [0, 0, 1]);
  loop(loopPts(-0.1845, -0.0975, 0.0545, 0.3935, 0.008, (u, v) => [u, v, 0.1118]), 0.002, GILT);
  for (const y of [0.0425, 0.4055])
    b.extrude(
      [
        [0, -0.009, "sharp"],
        [0.016, 0, "sharp"],
        [0, 0.009, "sharp"],
        [-0.016, 0, "sharp"],
      ],
      { at: [-0.141, y, 0.1115], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.003, bevel: 0.0008, color: PEARL_DEEP },
    );

  // Celluloid binding round the faces
  loop(loopPts(-0.285, -0.095, 0.026, 0.422, 0.01, (u, v) => [u, v, 0.1105]), 0.003, BIND);
  loop(loopPts(-0.285, -0.095, 0.026, 0.422, 0.01, (u, v) => [u, v, -0.1105]), 0.003, BIND);
  loop(loopPts(0.114, 0.281, 0.026, 0.382, 0.01, (u, v) => [u, v, 0.1105]), 0.003, BIND);
  loop(loopPts(0.114, 0.281, 0.026, 0.382, 0.01, (u, v) => [u, v, -0.1105]), 0.003, BIND);
  loop(loopPts(-0.097, 0.097, 0.03, 0.418, 0.012, (u, v) => [-0.2895, v, u]), 0.003, BIND);
  loop(loopPts(-0.097, 0.097, 0.03, 0.378, 0.012, (u, v) => [0.2845, v, u]), 0.003, BIND);

  // =============================================================================================================
  // Treble top: register switches
  const plateX = -0.2;
  box(0.18, 0.004, 0.074, [plateX, 0.436, 0.061], BLACKPEARL, { name: "switchPlate" });
  plane(LEGEND, 0.168, 0.022, [plateX, 0.4382, 0.0845], [0, 1, 0], [0, 0, -1]);
  for (let i = 0; i < 7; i++) {
    const x = plateX + (i - 3) * 0.0235;
    const tilt = R() > 0.5 ? 7 : -7;
    box(0.017, 0.008, 0.034, [x, 0.4415, 0.0515], PEARL, { rotation: [tilt, 0, 0], name: `registerSwitch${i}` });
    b.part(new THREE.SphereGeometry(0.0026, 6, 4), GILT, { at: [x, 0.4472, 0.0515 + (tilt > 0 ? 0.011 : -0.011)] });
  }
  for (const sx of [-1, 1])
    for (const sz of [0.032, 0.09])
      chromeBits.push(place(new THREE.SphereGeometry(0.0032, 6, 4), [plateX + sx * 0.0865, 0.4385, sz]));
  box(0.19, 0.006, 0.01, [TC, 0.437, -0.092], CHROME, { name: "topCrest" });

  // =============================================================================================================
  // Treble end cap: rosette, jewel, pearl diamonds
  plane(ROSETTE_R, 0.165, 0.165, [-0.2915, TYC, 0], [-1, 0, 0]);
  glow(b.part(new THREE.SphereGeometry(0.0125, 8, 6), "#d3213c", { at: [-0.2925, TYC, 0], scale: [0.55, 1, 1], name: "jewelRuby" }), 0.8);
  for (const y of [0.075, 0.373])
    b.extrude(
      [
        [0, -0.017, "sharp"],
        [0.011, 0, "sharp"],
        [0, 0.017, "sharp"],
        [-0.011, 0, "sharp"],
      ],
      { at: [-0.2908, y, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.003, bevel: 0.0008, color: PEARL_DEEP },
    );

  // =============================================================================================================
  // Bass box front: button board, badge, buttons
  box(0.134, 0.282, 0.004, [SC, 0.202, 0.1125], BLACKPEARL, { name: "buttonBoard" });
  loop(loopPts(SC - 0.07, SC + 0.07, 0.057, 0.347, 0.006, (u, v) => [u, v, 0.1148]), 0.0018, GILT);
  plane(BADGE, 0.12, 0.032, [SC, 0.368, 0.1118], [0, 0, 1]);
  loop(loopPts(SC - 0.062, SC + 0.062, 0.351, 0.385, 0.004, (u, v) => [u, v, 0.1118]), 0.0015, GILT, 4);

  const btnGeo = () => new THREE.CylinderGeometry(0.0062, 0.0065, 0.011, 8).rotateX(Math.PI / 2);
  const collarGeo = () => new THREE.CylinderGeometry(0.0079, 0.0079, 0.0035, 8).rotateX(Math.PI / 2);
  const pearlBtn: THREE.BufferGeometry[] = [];
  const blackBtn: THREE.BufferGeometry[] = [];
  const collars: THREE.BufferGeometry[] = [];
  for (let c = 0; c < 6; c++)
    for (let j = 0; j < 18; j++) {
      const x = SC + (c - 2.5) * 0.0215;
      const y = 0.077 + j * 0.0147 + (c % 2 ? 0.0074 : 0);
      const marker = (c === 1 && j % 12 === 3) || (c === 2 && j % 12 === 4);
      (marker ? blackBtn : pearlBtn).push(place(btnGeo(), [x, y, 0.1205]));
      collars.push(place(collarGeo(), [x, y, 0.1162]));
    }
  mergedPart(pearlBtn, PEARL, "bassButtons");
  mergedPart(blackBtn, BLACKPEARL, "bassMarkerButtons");
  mergedPart(collars, CHROME, "buttonCollars");

  // Bass end cap and top
  plane(ROSETTE_G, 0.15, 0.15, [0.2865, SYC, 0], [1, 0, 0]);
  glow(b.part(new THREE.SphereGeometry(0.0125, 8, 6), "#1fa464", { at: [0.2875, SYC, 0], scale: [0.55, 1, 1], name: "jewelEmerald" }), 0.8);
  for (const y of [0.07, 0.338])
    b.extrude(
      [
        [0, -0.016, "sharp"],
        [0.011, 0, "sharp"],
        [0, 0.016, "sharp"],
        [-0.011, 0, "sharp"],
      ],
      { at: [0.2858, y, 0], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.003, bevel: 0.0008, color: PEARL_DEEP },
    );
  cyl(0.012, 0.012, 0.004, 12, [0.135, 0.396, 0.06], CHROME, { name: "airValveRing" });
  cyl(0.009, 0.009, 0.007, 10, [0.135, 0.4, 0.06], PEARL, { name: "airValveButton" });

  // =============================================================================================================
  // Back: leather shoulder straps, bass strap, anchors
  for (const x of [-0.235, -0.145]) {
    b.sweep(
      catmull([
        [x, 0.43, -0.085],
        [x, 0.436, -0.13],
        [x, 0.4, -0.2],
        [x, 0.28, -0.235],
        [x, 0.14, -0.22],
        [x, 0.05, -0.15],
        [x, 0.022, -0.09],
      ]),
      () => [0.013, 0.0028],
      { color: LEATHER, section: "box", name: "shoulderStrap" },
    );
    box(0.03, 0.004, 0.032, [x, 0.436, -0.085], CHROME, { name: "strapAnchorTop" });
    box(0.03, 0.004, 0.032, [x, 0.012, -0.09], CHROME, { name: "strapAnchorBottom" });
    box(0.026, 0.014, 0.005, [x, 0.28, -0.2375], CHROME, { name: "strapSlide" });
  }
  b.sweep(
    catmull([
      [0.125, 0.2, -0.108],
      [0.15, 0.2, -0.13],
      [0.2, 0.2, -0.14],
      [0.25, 0.2, -0.13],
      [0.275, 0.2, -0.108],
    ]),
    () => [0.026, 0.003],
    { color: LEATHER, section: "box", up: [0, 0, 1], name: "bassStrap" },
  );
  box(0.012, 0.056, 0.006, [0.265, 0.2, -0.133], CHROME, { name: "bassStrapBuckle" });
  box(0.07, 0.05, 0.01, [0.2, 0.2, -0.143], LEATHER, { name: "bassStrapPad" });

  // =============================================================================================================
  // Feet and shared chrome
  for (const [x, z] of [
    [-0.25, 0.07],
    [-0.25, -0.07],
    [-0.13, 0.07],
    [-0.13, -0.07],
    [0.14, 0.07],
    [0.14, -0.07],
    [0.255, 0.07],
    [0.255, -0.07],
  ] as [number, number][])
    cyl(0.0095, 0.0105, 0.0145, 8, [x, 0.00725, z], CHROME, { name: "foot" });

  mergedPart(chromeBits, CHROME, "chromeFittings");

  return b.root;
}
```