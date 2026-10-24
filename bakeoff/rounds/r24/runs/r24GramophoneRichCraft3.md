```ts
import * as THREE from "three";
import {
  createBuilder,
  bezier,
  catmull,
  spiral,
  paint,
  mix,
  smoothstep,
  grain,
  mottle,
  svg,
} from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Lily Gramophone",
  description:
    "An art nouveau tabletop gramophone: carved mahogany cabinet with gilt beading, amber stained-glass front, a verdigris whiplash stem and a horn shaped as a blooming lily with gold veins, glowing stamens and a perched dragonfly.",
};

type V = THREE.Vector3;
const V3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
type Pt = [number, number] | [number, number, "sharp"];

// ---------------------------------------------------------------------------------------------------------------
// Palette
const GOLD = "#d9a441";
const DEEP = "#3a2208";
const IVORY = "#f3e6c4";
const SAGE = "#6f9a5a";
const LEAFDK = "#2c4a30";
const AMBER = "#ffb347";

const GILT = metal("gilt");
const BRASS = metal("brass", { tarnish: 0.25 });
const PATINA = metal("copper", { verdigris: 0.55, tarnish: 0.3, polish: 0.2 });

const WOOD_SIDE = mottle(grain("#5a2412", "#7d3a1f", { size: 0.012, axis: "y", seed: 3 }), "#3b140b", {
  size: 0.12,
  contrast: 0.5,
  seed: 4,
});
const WOOD_TOP = mottle(grain("#6a2c16", "#94461f", { size: 0.012, axis: "x", seed: 5 }), "#40170c", {
  size: 0.1,
  contrast: 0.5,
  seed: 6,
});
const WOOD_DARK = grain("#2e0f08", "#4a1a0e", { size: 0.01, axis: "x", seed: 8 });

// ---------------------------------------------------------------------------------------------------------------
// Horn frame: throat T, axis D, length L, azimuth basis E1/E2
const L = 0.3;
const T = V3(0, 0.5, -0.11);
const D = V3(0, 0.42, 1).normalize();
const E1 = V3(1, 0, 0);
const E2 = new THREE.Vector3().crossVectors(D, E1).normalize();
const radial = (a: number) => E1.clone().multiplyScalar(Math.cos(a)).addScaledVector(E2, Math.sin(a));
const rb = (u: number) => 0.025 + 0.125 * Math.pow(Math.min(Math.max(u, 0), 1), 2.2);
const onBell = (u: number, a: number, off: number) =>
  T.clone()
    .addScaledVector(D, u * L)
    .addScaledVector(radial(a), rb(u) + off);
const alongAxis = (d: number, a: number, r: number) => T.clone().addScaledVector(D, d).addScaledVector(radial(a), r);

// ---------------------------------------------------------------------------------------------------------------
// Paints
const bellPaint = paint((p, n, s) => {
  const g = GILT.at(p, n);
  return mix(mix("#3f6b4a", g, smoothstep(0.03, 0.13, s[0])), "#f2d68a", smoothstep(0.2, 0.3, s[0]) * 0.35);
});

const petalPaint = paint((p, n, s) => {
  const t = s[0];
  const q = p.clone().sub(T);
  const rad = q.addScaledVector(D, -q.dot(D));
  const inner = n.dot(rad) < 0;
  if (inner) {
    const c = mix("#f2c96a", "#fbeed2", smoothstep(0.1, 0.4, t));
    return mix(c, "#eea0ae", smoothstep(0.6, 0.95, t));
  }
  const c = mix("#5f8a4a", "#efe3c0", smoothstep(0.1, 0.45, t));
  return mix(c, "#e49aa6", smoothstep(0.65, 0.97, t));
});

const leafPaint = paint((_p, _n, s) => {
  const base = mix("#3f6b4a", "#7fa24f", smoothstep(0, 0.26, s[0]));
  const f = s[0] * 30 + Math.abs(s[1] - 0.06) * 18;
  const fr = f - Math.floor(f);
  return fr < 0.12 ? mix(base, "#243d28", 0.7) : base;
});

const recordPaint = paint((p, n) => {
  if (n.y < 0.5) return "#15151b";
  const dx = p.x;
  const dz = p.z - 0.065;
  const r = Math.hypot(dx, dz);
  const ang = Math.atan2(dz, dx);
  const groove = 0.5 + 0.5 * Math.sin(r * 1500);
  let c = mix("#0c0c10", "#1f1f28", groove * 0.7);
  for (const gap of [0.07, 0.095]) if (Math.abs(r - gap) < 0.0012) c = mix(c, "#4a4a58", 0.8);
  if (r > 0.043 && r < 0.047) c = mix(c, "#3a3a46", 0.8);
  const hl = Math.pow(Math.max(0, Math.cos(2 * (ang - 0.8))), 8) * smoothstep(0.045, 0.06, r);
  return mix(c, "#6a6a80", hl * 0.55);
});

// ---------------------------------------------------------------------------------------------------------------
// Textures
const FRONT = svg(
  `<svg viewBox="0 0 300 115" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#ff8a24"/></linearGradient>
    <linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset="1" stop-color="#ffa030"/></linearGradient>
  </defs>
  <rect x="1.5" y="1.5" width="297" height="112" rx="14" fill="#2b160a" stroke="${GOLD}" stroke-width="3"/>
  <path d="M14 104V42Q14 16 53 16Q92 16 92 42V104Z" fill="url(#a)" stroke="${DEEP}" stroke-width="3"/>
  <path d="M208 104V42Q208 16 247 16Q286 16 286 42V104Z" fill="url(#a)" stroke="${DEEP}" stroke-width="3"/>
  <path d="M104 104V34Q104 8 150 8Q196 8 196 34V104Z" fill="url(#c)" stroke="${DEEP}" stroke-width="3"/>
  <path d="M150 104C150 84 142 72 150 52" fill="none" stroke="${DEEP}" stroke-width="3.5"/>
  <path d="M150 52C132 46 126 30 134 22C142 28 148 38 150 52Z" fill="#fff6d8" stroke="${DEEP}" stroke-width="2.5"/>
  <path d="M150 52C168 46 174 30 166 22C158 28 152 38 150 52Z" fill="#fff6d8" stroke="${DEEP}" stroke-width="2.5"/>
  <path d="M150 52C142 40 142 24 150 14C158 24 158 40 150 52Z" fill="#ffe9ee" stroke="${DEEP}" stroke-width="2.5"/>
  <path d="M150 92C132 92 120 84 116 72C132 74 144 80 150 92Z" fill="#7fa24f" stroke="${DEEP}" stroke-width="2.5"/>
  <path d="M150 82C168 82 180 74 184 62C168 64 156 70 150 82Z" fill="#7fa24f" stroke="${DEEP}" stroke-width="2.5"/>
  <path d="M30 102C30 80 64 76 64 58C64 46 48 46 48 56" fill="none" stroke="${DEEP}" stroke-width="3"/>
  <circle cx="48" cy="56" r="3.2" fill="${DEEP}"/>
  <path d="M270 102C270 80 236 76 236 58C236 46 252 46 252 56" fill="none" stroke="${DEEP}" stroke-width="3"/>
  <circle cx="252" cy="56" r="3.2" fill="${DEEP}"/>
  <path d="M30 100C42 90 52 92 56 100Z" fill="#7fa24f" stroke="${DEEP}" stroke-width="2"/>
  <path d="M270 100C258 90 248 92 244 100Z" fill="#7fa24f" stroke="${DEEP}" stroke-width="2"/>
</svg>`,
  { size: 768 },
);

const flourish = `
<g fill="none" stroke="${GOLD}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">
  <path d="M16 60C16 30 40 16 64 20"/>
  <path d="M16 60C16 90 40 104 64 100"/>
  <path d="M30 60C30 46 44 40 54 46C62 52 58 62 50 60"/>
  <path d="M64 20C80 24 90 36 94 48"/>
  <path d="M64 100C80 96 90 84 94 72"/>
</g>
<path d="M30 30C38 24 52 26 56 34C48 40 36 38 30 30Z" fill="${SAGE}" stroke="${LEAFDK}" stroke-width="1.8"/>
<path d="M30 90C38 96 52 94 56 86C48 80 36 82 30 90Z" fill="${SAGE}" stroke="${LEAFDK}" stroke-width="1.8"/>
<path d="M94 48C86 42 86 32 94 26C102 32 102 42 94 48Z" fill="${IVORY}" stroke="#5a3412" stroke-width="1.8"/>
<path d="M94 72C86 78 86 88 94 94C102 88 102 78 94 72Z" fill="${IVORY}" stroke="#5a3412" stroke-width="1.8"/>`;
const SIDE = svg(
  `<svg viewBox="0 0 260 120" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="254" height="114" rx="16" fill="none" stroke="${GOLD}" stroke-width="3.5"/>
  <circle cx="130" cy="60" r="40" fill="none" stroke="${GOLD}" stroke-width="3"/>
  ${flourish}
  <g transform="translate(260 0) scale(-1 1)">${flourish}</g>
</svg>`,
  { size: 640 },
);

const corner = `
<g fill="none" stroke="${GOLD}" stroke-width="4" stroke-linecap="round">
  <path d="M30 110C30 60 60 30 110 30"/>
  <path d="M44 80C44 62 62 44 80 44"/>
  <path d="M50 50C50 38 64 36 66 46C68 54 58 56 56 50"/>
</g>
<path d="M112 30C128 22 146 28 150 40C138 46 122 42 112 30Z" fill="${SAGE}" stroke="${LEAFDK}" stroke-width="2"/>
<path d="M30 112C22 128 28 146 40 150C46 138 42 122 30 112Z" fill="${SAGE}" stroke="${LEAFDK}" stroke-width="2"/>
<circle cx="80" cy="80" r="4.5" fill="${IVORY}" stroke="#5a3412" stroke-width="1.5"/>`;
const bud = `<path d="M190 340C176 330 178 314 190 308C202 314 204 330 190 340Z" fill="${IVORY}" stroke="#5a3412" stroke-width="2"/>
<path d="M190 340C180 346 170 346 164 340C172 334 182 334 190 340Z" fill="${SAGE}" stroke="${LEAFDK}" stroke-width="2"/>
<path d="M190 340C200 346 210 346 216 340C208 334 198 334 190 340Z" fill="${SAGE}" stroke="${LEAFDK}" stroke-width="2"/>`;
const TOP = svg(
  `<svg viewBox="0 0 380 360" xmlns="http://www.w3.org/2000/svg">
  <rect x="8" y="8" width="364" height="344" rx="26" fill="none" stroke="${GOLD}" stroke-width="4"/>
  <rect x="17" y="17" width="346" height="326" rx="20" fill="none" stroke="${IVORY}" stroke-width="2.6"/>
  <g>${corner}</g>
  <g transform="translate(380 0) scale(-1 1)">${corner}</g>
  <g transform="translate(0 360) scale(1 -1)">${corner}</g>
  <g transform="translate(380 360) scale(-1 -1)">${corner}</g>
  ${bud}
  <circle cx="26" cy="180" r="4.5" fill="${GOLD}"/><circle cx="354" cy="180" r="4.5" fill="${GOLD}"/>
</svg>`,
  { size: 768 },
);

const LABEL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="49" fill="${IVORY}"/>
  <circle cx="50" cy="50" r="44" fill="none" stroke="#3f6b4a" stroke-width="4"/>
  <circle cx="50" cy="50" r="37" fill="none" stroke="${GOLD}" stroke-width="1.8"/>
  <path d="M50 38C42 32 43 22 50 16C57 22 58 32 50 38Z" fill="#f4b6c0" stroke="#5a3412" stroke-width="1.4"/>
  <path d="M50 38C40 36 34 28 36 22C44 24 49 30 50 38Z" fill="#f8dde0" stroke="#5a3412" stroke-width="1.2"/>
  <path d="M50 38C60 36 66 28 64 22C56 24 51 30 50 38Z" fill="#f8dde0" stroke="#5a3412" stroke-width="1.2"/>
  <text x="50" y="64" text-anchor="middle" font-family="serif" font-weight="bold" font-size="12" fill="${DEEP}">LA FLEUR</text>
  <text x="50" y="76" text-anchor="middle" font-family="serif" font-size="7" fill="${DEEP}">· NOUVEAU ·</text>
  <circle cx="50" cy="50" r="3" fill="#2a1a10"/>
</svg>`,
  { size: 384 },
);

const wing = `<path d="M58 36C34 14 8 16 4 28C8 42 38 44 58 40Z" fill="#a8e0d0"/>
<path d="M58 46C34 52 10 58 10 70C20 80 46 68 58 52Z" fill="#8fd0c0"/>
<path d="M58 38C36 28 20 26 8 30M58 50C38 56 24 62 14 70" fill="none" stroke-width="1.2"/>`;
const DRAGON = svg(
  `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#2f6f66" stroke-width="1.8" stroke-linejoin="round">
    ${wing}
    <g transform="translate(120 0) scale(-1 1)">${wing}</g>
  </g>
  <path d="M60 12C67 12 67 24 64 30L63 90L60 98L57 90L56 30C53 24 53 12 60 12Z" fill="#2f6f66" stroke="#173a36" stroke-width="1.2"/>
  <path d="M56.5 46H63.5M56.5 58H63.5M57 70H63" stroke="${GOLD}" stroke-width="2.6"/>
  <circle cx="55.5" cy="17" r="5" fill="${GOLD}" stroke="#173a36" stroke-width="1"/>
  <circle cx="64.5" cy="17" r="5" fill="${GOLD}" stroke="#173a36" stroke-width="1"/>
</svg>`,
  { size: 400 },
);

const MEDAL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="${GOLD}" stroke="#7a5a22" stroke-width="3"/>
  <circle cx="50" cy="50" r="38" fill="#27402f" stroke="#7a5a22" stroke-width="2"/>
  <path d="M50 78C50 66 46 60 50 50" fill="none" stroke="${GOLD}" stroke-width="3"/>
  <path d="M50 52C38 48 34 36 40 28C46 34 49 42 50 52Z" fill="${IVORY}" stroke="${GOLD}" stroke-width="1.6"/>
  <path d="M50 52C62 48 66 36 60 28C54 34 51 42 50 52Z" fill="${IVORY}" stroke="${GOLD}" stroke-width="1.6"/>
  <path d="M50 52C44 42 44 30 50 22C56 30 56 42 50 52Z" fill="#f4b6c0" stroke="${GOLD}" stroke-width="1.6"/>
  <path d="M50 74C40 74 32 68 30 60C40 60 48 64 50 74Z" fill="${SAGE}" stroke="${LEAFDK}" stroke-width="1.5"/>
  <path d="M50 68C60 68 68 62 70 54C60 54 52 58 50 68Z" fill="${SAGE}" stroke="${LEAFDK}" stroke-width="1.5"/>
</svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
// Outline helpers
function rrOutline(hx: number, hz: number, r: number, steps = 4): [number, number][] {
  const out: [number, number][] = [];
  const cs: [number, number, number][] = [
    [1, 1, 0],
    [-1, 1, 90],
    [-1, -1, 180],
    [1, -1, 270],
  ];
  for (const [sx, sz, a0] of cs)
    for (let i = 0; i <= steps; i++) {
      const a = ((a0 + (90 * i) / steps) * Math.PI) / 180;
      out.push([sx * (hx - r) + r * Math.cos(a), sz * (hz - r) + r * Math.sin(a)]);
    }
  return out;
}
function rrPts(hx: number, hz: number, r: number, y: number): V[] {
  const o = rrOutline(hx, hz, r, 3);
  const pts: V[] = [];
  for (let i = 0; i < o.length; i++) {
    const [x1, z1] = o[i];
    const [x2, z2] = o[(i + 1) % o.length];
    pts.push(V3(x1, y, z1));
    const k = Math.floor(Math.hypot(x2 - x1, z2 - z1) / 0.045);
    for (let j = 1; j <= k; j++) pts.push(V3(x1 + ((x2 - x1) * j) / (k + 1), y, z1 + ((z2 - z1) * j) / (k + 1)));
  }
  return pts;
}

const leafShape = (k: number): Pt[] => {
  const raw: Pt[] = [
    [0, -0.005],
    [0, 0.015],
    [0.05, 0.07],
    [0.12, 0.11],
    [0.19, 0.1],
    [0.26, 0.04, "sharp"],
    [0.19, 0.07],
    [0.12, 0.075],
    [0.05, 0.03],
  ];
  return raw.map((p) => (p.length === 3 ? ([p[0] * k, p[1] * k, "sharp"] as Pt) : ([p[0] * k, p[1] * k] as Pt)));
};

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "gramophone", paintSize: 2048 });

  const decal = (
    tex: THREE.Texture,
    w: number,
    h: number,
    at: V,
    dir: V,
    up: V,
    circle = false,
  ) =>
    b.part(circle ? new THREE.CircleGeometry(w / 2, 24) : new THREE.PlaneGeometry(w, h), "#ffffff", {
      at,
      dir,
      up,
      axis: "z",
      texture: tex,
    });
  const torusH = (x: number, y: number, z: number, R: number, r: number, color: any) =>
    b.part(new THREE.TorusGeometry(R, r, 5, 12), color, { at: [x, y, z], dir: [0, 1, 0], axis: "z" });

  // ------------------------------------------------------------------ cabinet
  b.extrude(rrOutline(0.21, 0.2, 0.04), {
    at: [0, 0.08, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.02,
    bevel: 0.004,
    color: WOOD_DARK,
  });
  b.extrude(rrOutline(0.2, 0.19, 0.035), {
    at: [0, 0.155, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.17,
    color: WOOD_SIDE,
  });
  b.extrude(rrOutline(0.215, 0.205, 0.04), {
    at: [0, 0.2525, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.025,
    bevel: 0.006,
    color: WOOD_TOP,
  });

  // marquetry on lid
  decal(TOP, 0.38, 0.36, V3(0, 0.2662, 0), V3(0, 1, 0), V3(0, 0, -1));

  // gilt beads and studs
  const lidBead = catmull(rrPts(0.211, 0.201, 0.04, 0.2625), { closed: true });
  b.sweep(lidBead, 0.004, { color: GILT });
  const lidBase = catmull(rrPts(0.2165, 0.2065, 0.0405, 0.2425), { closed: true });
  b.sweep(lidBase, 0.0035, { color: GILT });
  const lidStuds = catmull(rrPts(0.2158, 0.2058, 0.0405, 0.2525), { closed: true });
  b.along(lidStuds, 44, (at) => b.part(new THREE.SphereGeometry(0.0058, 6, 4), GOLD, { at: at.at }));
  const plinthBead = catmull(rrPts(0.2115, 0.2015, 0.0405, 0.0915), { closed: true });
  b.sweep(plinthBead, 0.0045, { color: GILT });
  const plinthStuds = catmull(rrPts(0.2108, 0.2008, 0.0405, 0.08), { closed: true });
  b.along(plinthStuds, 34, (at) => b.part(new THREE.SphereGeometry(0.0052, 6, 4), GOLD, { at: at.at }));

  // corner columns
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const cx = sx * 0.1925;
      const cz = sz * 0.1825;
      b.rod([cx, 0.09, cz], [cx, 0.236, cz], [0.012, 0.0095], { color: GILT, sides: 8 } as any);
      torusH(cx, 0.1, cz, 0.0125, 0.004, GILT);
      torusH(cx, 0.225, cz, 0.0115, 0.004, GILT);
      // whiplash feet
      const leg = catmull([
        [sx * 0.17, 0.085, sz * 0.16],
        [sx * 0.185, 0.05, sz * 0.175],
        [sx * 0.2, 0.028, sz * 0.19],
        [sx * 0.212, 0.0175, sz * 0.2],
      ]);
      b.sweep(leg, [0.02, 0.0135], { color: WOOD_DARK });
      b.part(new THREE.SphereGeometry(0.0175, 8, 6), GILT, { at: [sx * 0.212, 0.0175, sz * 0.2] });
    }

  // front stained-glass panel, side emblems, medallion
  glow(decal(FRONT, 0.3, 0.115, V3(0, 0.16, 0.1925), V3(0, 0, 1), V3(0, 1, 0)), 0.8);
  decal(SIDE, 0.26, 0.12, V3(0.2025, 0.16, 0), V3(1, 0, 0), V3(0, 1, 0));
  decal(SIDE, 0.26, 0.12, V3(-0.2025, 0.16, 0), V3(-1, 0, 0), V3(0, 1, 0));
  decal(MEDAL, 0.07, 0.07, V3(-0.2045, 0.16, 0), V3(-1, 0, 0), V3(0, 1, 0), true);

  // ------------------------------------------------------------------ crank
  b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.006, 16), GILT, { at: [0.2055, 0.16, 0], dir: [1, 0, 0] });
  b.part(new THREE.TorusGeometry(0.028, 0.0035, 5, 16), GILT, { at: [0.2085, 0.16, 0], dir: [1, 0, 0], axis: "z" });
  b.rod([0.206, 0.16, 0], [0.255, 0.16, 0], 0.006, { color: BRASS });
  b.part(new THREE.SphereGeometry(0.011, 8, 6), GILT, { at: [0.255, 0.16, 0] });
  b.sweep(
    catmull([
      [0.255, 0.16, 0],
      [0.26, 0.145, 0.012],
      [0.262, 0.12, 0.03],
      [0.26, 0.1, 0.058],
    ]),
    [0.009, 0.007],
    { color: BRASS },
  );
  b.part(new THREE.SphereGeometry(0.011, 8, 6), GILT, { at: [0.26, 0.1, 0.058] });
  b.rod([0.26, 0.1, 0.058], [0.312, 0.1, 0.058], 0.0055, { color: BRASS });
  b.part(new THREE.SphereGeometry(0.016, 10, 8), WOOD_DARK, { at: [0.318, 0.1, 0.058], scale: [1.7, 1, 1] });

  // ------------------------------------------------------------------ turntable
  b.lathe(
    [
      [0, 0],
      [0.128, 0],
      [0.131, 0.004],
      [0.131, 0.009],
      [0.126, 0.011],
      [0, 0.011],
    ],
    { at: [0, 0.265, 0.065], segments: 24, color: BRASS },
  );
  b.part(new THREE.CylinderGeometry(0.125, 0.125, 0.004, 28), recordPaint, { at: [0, 0.278, 0.065] });
  decal(LABEL, 0.084, 0.084, V3(0, 0.2803, 0.065), V3(0, 1, 0), V3(0, 0, -1), true);
  b.part(new THREE.CylinderGeometry(0.0032, 0.0032, 0.034, 8), GILT, { at: [0, 0.2955, 0.065] });
  b.part(new THREE.SphereGeometry(0.005, 6, 5), GILT, { at: [0, 0.3125, 0.065] });

  // tonearm
  const PIV = V3(-0.17, 0.265, 0.0);
  b.lathe(
    [
      [0, 0],
      [0.035, 0],
      [0.035, 0.008],
      [0.022, 0.02],
      [0.024, 0.04],
      [0.014, 0.05],
      [0, 0.052],
    ],
    { at: PIV, segments: 12, color: GILT },
  );
  torusH(PIV.x, 0.292, PIV.z, 0.023, 0.0035, GOLD);
  b.sweep(
    catmull([
      [-0.17, 0.318, 0.0],
      [-0.172, 0.35, 0.025],
      [-0.15, 0.36, 0.075],
      [-0.105, 0.34, 0.12],
      [-0.062, 0.312, 0.137],
    ]),
    [0.0085, 0.0065],
    { color: BRASS },
  );
  b.rod([-0.17, 0.322, 0], [-0.172, 0.335, -0.06], 0.007, { color: BRASS });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), GILT, { at: [-0.172, 0.335, -0.075], scale: [1, 1, 1.25] });
  b.part(new THREE.CylinderGeometry(0.02, 0.022, 0.012, 12), GILT, { at: [-0.045, 0.303, 0.14] });
  glow(b.part(new THREE.SphereGeometry(0.01, 8, 5), "#e08a2e", { at: [-0.045, 0.31, 0.14] }), 0.7);
  b.spike([-0.045, 0.298, 0.14], [-0.04, 0.281, 0.14], null, 0.0025, { color: "#cfd3dc" });

  // ------------------------------------------------------------------ horn
  // stem with whiplash curve
  const stemPath = catmull([
    [0, 0.255, -0.135],
    [0, 0.31, -0.175],
    [0, 0.385, -0.2],
    [0, 0.45, -0.175],
    [0, 0.481, -0.156],
    [T.x, T.y, T.z],
  ]);
  b.sweep(stemPath, [0.03, 0.026, 0.024, 0.022, 0.022], { color: PATINA });
  b.along(stemPath, 4, (at) =>
    b.part(new THREE.TorusGeometry(0.029, 0.0055, 5, 10), GILT, { at: at.at, dir: at.axis, axis: "z" }),
  );

  // base flange and rising sepals
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.072, 0.006],
      [0.055, 0.016],
      [0.036, 0.03],
      [0.03, 0.055],
      [0, 0.055],
    ],
    { at: [0, 0.265, -0.135], segments: 14, color: GILT },
  );
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    const c = (r: number, y: number) => V3(Math.cos(a) * r, y, -0.135 + Math.sin(a) * r);
    b.sweep(bezier(c(0.072, 0.267), c(0.062, 0.285), c(0.052, 0.3), c(0.042, 0.322)), (t) => [
      0.003 + 0.026 * Math.sin(Math.PI * Math.pow(t, 0.8)),
      0.004,
    ], {
      color: "#5c8a52",
      up: [Math.cos(a), 0, Math.sin(a)],
      caps: { start: "flat", end: "point" },
    });
  }

  // leaves
  const leaf = (s: number, y: number, z: number, k: number, tilt: number) =>
    b.extrude(leafShape(k), {
      at: [s * 0.012, y, z],
      x: V3(s, 0, tilt).normalize(),
      thickness: 0.006,
      bevel: 0.0015,
      smoothing: 1,
      color: leafPaint,
    });
  for (const s of [1, -1]) {
    leaf(s, 0.268, -0.145, 1.0, -0.5);
    leaf(s, 0.31, -0.172, 0.7, -0.2);
    // tendrils
    const tp = spiral([s * 0.065, 0.375, -0.197], [s * 0.026, 0.375, -0.197], [0, 0, 1], { turns: s * 1.3, r1: 0.008 });
    b.sweep(tp, [0.0045, 0.0015], { color: GOLD });
    b.part(new THREE.SphereGeometry(0.006, 6, 5), GOLD, { at: tp.at(1) });
    // struts: stem to bell underside
    const a = 1.5 * Math.PI + s * 0.3927;
    b.sweep(catmull([V3(0, 0.415, -0.19), V3(s * 0.07, 0.43, -0.15), onBell(0.4, a, 0.01)]), [0.007, 0.005], {
      color: PATINA,
    });
  }

  // bell shell
  const ub = [0, 0.08, 0.16, 0.26, 0.38, 0.5, 0.62, 0.74, 0.86, 1];
  const outer = ub.map((u) => [rb(u) + 0.004, u * L] as [number, number]);
  const inner = [...ub].reverse().map((u) => [rb(u) - 0.004, u * L] as [number, number]);
  b.lathe([...outer, ...inner], { at: T, axis: D, segments: 16, color: bellPaint });
  torusHAlong(T.clone().addScaledVector(D, 0.045), 0.032, 0.007);
  function torusHAlong(at: V, R: number, r: number) {
    b.part(new THREE.TorusGeometry(R, r, 6, 12), GILT, { at, dir: D, axis: "z" });
  }
  // gilt lip ring
  const lip: V[] = [];
  for (let k = 0; k < 12; k++) lip.push(onBell(1.0, (k * Math.PI) / 6, 0.002));
  b.sweep(catmull(lip, { closed: true }), 0.0055, { color: GILT });

  // sepals clasping the throat
  for (let k = 0; k < 5; k++) {
    const a = ((k * 72 + 36) * Math.PI) / 180;
    b.sweep(
      bezier(alongAxis(-0.05, a, 0.022), alongAxis(0, a, 0.05), alongAxis(0.06, a, 0.062), alongAxis(0.115, a, 0.07)),
      (t) => [0.003 + 0.034 * Math.sin(Math.PI * Math.pow(t, 0.9)), 0.004],
      { color: "#4a7c4f", up: radial(a), caps: { start: "flat", end: "point" } },
    );
  }

  // petals: eight, alternating rings, with gold veins
  const petalPaths: any[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const o = i % 2 ? 0.008 : 0;
    const tipOff = i % 2 ? 0.1 : 0.088;
    const tipU = i % 2 ? 1.12 : 1.1;
    const mk = (extra: number) =>
      bezier(
        onBell(0.4, a, 0.005 + o + extra),
        onBell(0.8, a, 0.012 + o + extra),
        onBell(1.0, a, 0.032 + o + extra),
        onBell(tipU, a, tipOff + o + extra),
      );
    const path = mk(0);
    petalPaths.push(path);
    b.sweep(path, (t) => [0.003 + 0.092 * Math.sin(Math.PI * Math.pow(t, 1.3)), 0.0035], {
      color: petalPaint,
      up: radial(a),
      caps: { start: "flat", end: "point" },
    });
    b.sweep(mk(0.0055), [0.0028, 0.001], { color: GOLD, caps: { start: "flat", end: "point" } });
    b.sweep(mk(-0.0055), [0.0028, 0.001], { color: GOLD, caps: { start: "flat", end: "point" } });
    b.part(new THREE.SphereGeometry(0.0065, 6, 5), GOLD, { at: path.at(1) });
  }

  // stamens, pistil (glowing)
  for (let k = 0; k < 6; k++) {
    const a = ((k * 60 + 15) * Math.PI) / 180;
    const st = bezier(
      alongAxis(0.03, a, 0.003),
      alongAxis(0.1, a, 0.018),
      alongAxis(0.19, a, 0.045),
      alongAxis(0.255, a, 0.07),
    );
    b.sweep(st, [0.0028, 0.0018], { color: "#e8c27a" });
    glow(b.part(new THREE.SphereGeometry(0.0085, 6, 5), AMBER, { at: st.at(1), scale: [1, 1, 1.5] }), 1.5);
  }
  b.rod(T.clone().addScaledVector(D, 0.03), T.clone().addScaledVector(D, 0.28), [0.004, 0.0028], { color: "#b8d078" });
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3 + 0.5;
    glow(b.part(new THREE.SphereGeometry(0.0068, 6, 5), "#ffd36a", { at: alongAxis(0.29, a, 0.007) }), 1.4);
  }
  glow(b.part(new THREE.SphereGeometry(0.006, 6, 5), "#ffd36a", { at: alongAxis(0.298, 0, 0) }), 1.6);

  // dragonfly perched on the lowest petal
  {
    const path = petalPaths[6];
    const tpos: V = path.at(0.78);
    const tan: V = path.tangentAt(0.78);
    const nrm = radial(1.5 * Math.PI).negate();
    nrm.addScaledVector(tan, -nrm.dot(tan)).normalize();
    const at = tpos.clone().addScaledVector(nrm, 0.011);
    decal(DRAGON, 0.11, 0.092, at, nrm, tan.clone().normalize());
  }

  return b.root;
}
```