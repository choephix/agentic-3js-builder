import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  paint,
  mix,
  noise,
  cells,
  smoothstep,
  rgb,
  stripes,
  grain,
  catmull,
  svg,
} from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "Whimsical open-cockpit biplane named Betsy: a waving moustached pilot, a teddy-bear passenger, checkered wing tips, bunting, and a little grass airfield with a windsock, sign, crates and flowers.",
};

type V = [number, number, number];

// ---------------------------------------------------------------- palette
const RED = "#d8402c";
const CREAM = "#f6e8c6";
const TEAL = "#2a9d9a";
const SUN = "#f4b630";
const INK = "#2a1a22";
const DWOOD = "#5a3820";
const LEATH = "#a05e32";
const LEATH2 = "#5b3520";
const JACKET = "#7c4a2a";
const GLASS = "#bfe9f2";
const BRASSC = "#e0aa3c";
const TIRE = "#2e2a34";
const SKIN = "#f1b78c";
const BEAR = "#a8693a";
const TAN = "#d9a66c";
const STEEL = "#4a4652";
const INTERIOR = "#3a2430";
const GREEN = "#4f9a3c";
const DIRT = "#8b6a44";
const DIRT_L = "#c9a066";
const GRASS_A = "#6cb446";
const GRASS_B = "#8fcb54";
const GRASS_D = "#468a35";
const G = 0.126; // top of the grass base

const P = (x: number, y: number, z: number): V => [x, y + G, z];
const arr = (v: THREE.Vector3): V => [v.x, v.y, v.z];

const star = (cx: number, cy: number, R: number, r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
};

export default function build() {
  const b = createBuilder({ name: "barnstormer" });

  // ------------------------------------------------------------ skeleton
  const body = b.joint("body", { at: P(0, 1.5, 0) });
  const propJ = b.joint("propeller", { parent: body, at: P(0, 1.5, 2.0), dir: [0, 0, 1] });
  const rudder = b.joint("rudder", { parent: body, at: P(0, 1.64, -3.3), dir: [0, 1, 0], role: "hinge" });
  const elevator = b.joint("elevator", { parent: body, at: P(0, 1.58, -2.95), dir: [1, 0, 0], role: "hinge" });

  // ------------------------------------------------------------ helpers
  const put = (geo: THREE.BufferGeometry, color: any, o: any = {}) => b.part(geo, color, { bone: body, ...o });
  const rod = (a: V, c: V, r: any, color: any, o: any = {}) => b.rod(a, c, r, color, { bone: body, sides: 6, ...o });
  const sph = (r = 1, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
  const cyl = (r0: number, r1: number, h: number, s = 10) => new THREE.CylinderGeometry(r0, r1, h, s);

  // ------------------------------------------------------------ textures
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="${INK}"/><circle cx="50" cy="50" r="43" fill="${CREAM}"/>
    <circle cx="50" cy="50" r="33" fill="${RED}"/><circle cx="50" cy="50" r="26" fill="${TEAL}"/>
    <polygon points="${star(50, 51, 22, 9)}" fill="${CREAM}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
    { size: 192 },
  );
  const NAME = svg(
    `<svg viewBox="0 0 100 46" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="96" height="42" rx="12" fill="${CREAM}" stroke="${RED}" stroke-width="4"/>
    <text x="50" y="32" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="28" fill="${RED}" stroke="${INK}" stroke-width="1" textLength="74" lengthAdjust="spacingAndGlyphs">BETSY</text>
    <polygon points="${star(12, 23, 5, 2.2)}" fill="${TEAL}"/><polygon points="${star(88, 23, 5, 2.2)}" fill="${TEAL}"/></svg>`,
    { size: 256 },
  );
  const FACE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="25" cy="62" rx="11" ry="8" fill="#f0806e" opacity="0.7"/><ellipse cx="75" cy="62" rx="11" ry="8" fill="#f0806e" opacity="0.7"/>
    <ellipse cx="36" cy="48" rx="9" ry="10" fill="#fff" stroke="${INK}" stroke-width="2.4"/><ellipse cx="64" cy="48" rx="9" ry="10" fill="#fff" stroke="${INK}" stroke-width="2.4"/>
    <circle cx="38" cy="50" r="4.6" fill="${INK}"/><circle cx="62" cy="50" r="4.6" fill="${INK}"/>
    <circle cx="39.6" cy="48" r="1.6" fill="#fff"/><circle cx="63.6" cy="48" r="1.6" fill="#fff"/>
    <path d="M24 36 Q35 28 46 36" stroke="#5a3418" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M54 36 Q65 28 76 36" stroke="#5a3418" stroke-width="6" fill="none" stroke-linecap="round"/>
    <ellipse cx="50" cy="60" rx="8" ry="7" fill="#e88a70" stroke="#b05a48" stroke-width="2"/>
    <path d="M80 82 Q60 70 48 70 Q36 70 20 82 Q36 78 48 78 Q60 78 80 82Z" fill="none"/>
    <path d="M49 71 C40 63 28 67 24 74 C20 80 11 76 13 67" stroke="#5a3418" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M51 71 C60 63 72 67 76 74 C80 80 89 76 87 67" stroke="#5a3418" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M37 80 Q50 96 63 80 Q50 84 37 80Z" fill="#7a2020" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
    <rect x="44" y="81" width="12" height="4" fill="#fff"/></svg>`,
    { size: 256 },
  );
  const BEARFACE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="66" rx="22" ry="17" fill="${TAN}"/>
    <circle cx="33" cy="42" r="6" fill="${INK}"/><circle cx="67" cy="42" r="6" fill="${INK}"/>
    <circle cx="35" cy="40" r="2" fill="#fff"/><circle cx="69" cy="40" r="2" fill="#fff"/>
    <path d="M24 30 Q33 25 41 30" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M59 30 Q67 25 76 30" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="50" cy="57" rx="8" ry="5.5" fill="${INK}"/><ellipse cx="48" cy="55.5" rx="2.6" ry="1.4" fill="#fff" opacity="0.7"/>
    <path d="M50 62 L50 68 M50 68 Q41 76 34 70 M50 68 Q59 76 66 70" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M45 72 l-1 3 M50 73 l0 3 M55 72 l1 3" stroke="${LEATH2}" stroke-width="1.4"/>
    <ellipse cx="22" cy="58" rx="7" ry="5" fill="#f0806e" opacity="0.6"/><ellipse cx="78" cy="58" rx="7" ry="5" fill="#f0806e" opacity="0.6"/></svg>`,
    { size: 256 },
  );
  const HUB = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="${CREAM}" stroke="${INK}" stroke-width="3"/>
    <circle cx="50" cy="50" r="36" fill="none" stroke="${RED}" stroke-width="7"/>
    <path d="M50 14 V86 M14 50 H86 M24 24 L76 76 M76 24 L24 76" stroke="${INK}" stroke-width="2.4"/>
    <circle cx="50" cy="50" r="12" fill="${BRASSC}" stroke="${INK}" stroke-width="2.5"/></svg>`,
    { size: 160 },
  );
  const SIGN = svg(
    `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="154" height="94" rx="10" fill="#f2d089" stroke="${DWOOD}" stroke-width="6"/>
    <text x="80" y="43" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="31" fill="${RED}" stroke="${INK}" stroke-width="1.2">RIDES</text>
    <text x="80" y="74" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="19" fill="${TEAL}" stroke="${INK}" stroke-width="0.8">5¢ A LOOP</text>
    <polygon points="${star(20, 20, 8, 3.4)}" fill="${SUN}" stroke="${INK}" stroke-width="1.4"/>
    <polygon points="${star(140, 20, 8, 3.4)}" fill="${SUN}" stroke="${INK}" stroke-width="1.4"/>
    <polygon points="${star(20, 82, 6, 2.6)}" fill="${SUN}"/><polygon points="${star(140, 82, 6, 2.6)}" fill="${SUN}"/></svg>`,
    { size: 384 },
  );
  const CRATE = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" fill="#c58a50"/>
    <path d="M0 16 H64 M0 32 H64 M0 48 H64" stroke="#8a5a30" stroke-width="2"/>
    <rect x="3" y="3" width="58" height="58" fill="none" stroke="#7a4a26" stroke-width="5"/>
    <path d="M6 6 L58 58 M58 6 L6 58" stroke="#7a4a26" stroke-width="4"/>
    <rect x="12" y="24" width="40" height="16" fill="#f6e8c6" stroke="#7a4a26" stroke-width="1.5"/>
    <text x="32" y="36.5" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="11" fill="${RED}">NUTS</text></svg>`,
    { size: 128 },
  );
  const flag = (c: string) =>
    svg(
      `<svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg"><path d="M2 38 H30 L16 3 Z" fill="${c}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="16" cy="28" r="3.2" fill="${CREAM}"/></svg>`,
      { size: 64 },
    );
  const FLAGS = [flag(RED), flag(SUN), flag(TEAL)];

  // ------------------------------------------------------------ paints
  const wingPaint = (span: number, tip: string) =>
    paint((p, n) => {
      let c = rgb(CREAM);
      const rim = Math.abs(n.y) < 0.55;
      if (rim) c = rgb(tip);
      else if (Math.abs(p.x) > span - 0.75) {
        const ck = (Math.floor(p.x / 0.2) + Math.floor(p.z / 0.2)) & 1;
        c = ck ? rgb(tip) : rgb(CREAM);
      } else {
        const f = ((p.x / 0.5) % 1 + 1) % 1;
        if (f < 0.04 || f > 0.96) c = mix(c, "#b99a62", 0.5);
        c = mix(c, "#d9c394", 0.35 * smoothstep(0.55, 0.8, noise(p, 0.5, 2)));
      }
      if (n.y > 0.5) c = mix(c, [1, 0.96, 0.8], 0.12);
      if (n.y < -0.5) c = mix(c, [0.55, 0.65, 0.9], 0.2);
      return c;
    });

  const fusePaint = paint((p, n) => {
    let c = rgb(RED);
    if (p.z < -2.25) c = rgb(TEAL);
    if (Math.abs(p.z + 2.25) < 0.07) c = rgb(CREAM);
    if (n.y < -0.4) c = mix(c, CREAM, 0.75);
    if (Math.abs(n.x) > 0.55 && Math.abs(p.y - (1.46 + G)) < 0.045 && p.z > -2.2) c = rgb(SUN);
    const seam = ((p.z / 0.5) % 1 + 1) % 1;
    if (seam < 0.025 || seam > 0.975) c = mix(c, INK, 0.28);
    c = mix(c, [1, 0.96, 0.82], 0.14 * Math.max(n.y, 0));
    c = mix(c, [0.5, 0.55, 0.85], 0.2 * Math.max(-n.y, 0));
    c = mix(c, "#7a2418", 0.25 * smoothstep(0.6, 0.85, noise(p, 0.35, 4)));
    return c;
  });

  const GILT = metal("gilt", { tarnish: 0.15, polish: 0.5 });
  const COWL = paint((_p, _n, s) => (s[0] > 0.6 ? GILT : s[0] < 0.1 ? CREAM : RED));
  const EXH = metal("copper", { tarnish: 0.4, verdigris: 0.2 });
  const WOOD = grain("#9a6334", "#6e4322", { size: 0.04, axis: "y" });
  const scarfPaint = stripes(RED, CREAM, { size: 0.2, axis: "z", width: 0.5, wobble: 0 });
  const rudderPaint = paint((p) => {
    const k = Math.floor((p.y - G - 1.64) / 0.34);
    return k % 3 === 0 ? RED : k % 3 === 1 ? CREAM : TEAL;
  });
  const propPaint = paint((_p, _n, s) => (s[1] > 0.93 ? SUN : s[1] > 0.86 ? RED : WOOD));

  const grassPaint = paint((p, n) => {
    if (n.y < 0.4) return DIRT;
    const dr = Math.min(Math.abs(p.x - 0.95), Math.abs(p.x + 0.95));
    let rut = p.z > -3.4 && p.z < 3.2 ? smoothstep(0.2, 0.12, dr) : 0;
    if (Math.abs(p.x) < 0.1 && p.z < -2.8 && p.z > -3.5) rut = 1;
    let g = mix(GRASS_A, GRASS_B, smoothstep(0.3, 0.7, noise(p, 0.9, 3)));
    g = mix(g, GRASS_D, 0.5 * smoothstep(0.6, 0.8, noise(p, 0.12, 8)));
    const c = cells(p, 0.5, 5);
    if (c.d1 < 0.07 && c.id > 0.6) return c.id > 0.8 ? "#ff9ec0" : "#fff1a8";
    return mix(g, mix(DIRT_L, DIRT, noise(p, 0.1, 2)), rut);
  });
  const rimPaint = grain(DIRT, "#6a4c2e", { size: 0.05, axis: "y" });

  const drumPaint = (base: string) =>
    paint((p, n) => {
      if (n.y > 0.5) return "#58545e";
      const h = p.y - G;
      if (Math.abs(h - 0.15) < 0.02 || Math.abs(h - 0.7) < 0.02) return mix(base, INK, 0.4);
      if (h > 0.33 && h < 0.52) return CREAM;
      return base;
    });

  // ------------------------------------------------------------ base
  put(cyl(1, 1, 0.1, 32), rimPaint, { at: [0, 0.05, -0.6], scale: [4.7, 1, 4.3], flat: true });
  put(cyl(1, 1, 0.06, 32), grassPaint, { at: [0, 0.09, -0.6], scale: [4.6, 1, 4.2], flat: true });

  // ------------------------------------------------------------ fuselage
  const fuselage = b.loft(
    [
      { at: P(0, 1.45, 1.4), w: 0.92, h: 0.98 },
      { at: P(0, 1.46, 0.8), w: 1.05, h: 1.12 },
      { at: P(0, 1.46, 0.0), w: 1.0, h: 1.1 },
      { at: P(0, 1.46, -0.9), w: 0.88, h: 1.0 },
      { at: P(0, 1.48, -1.8), w: 0.62, h: 0.78 },
      { at: P(0, 1.55, -2.6), w: 0.36, h: 0.5 },
      { at: P(0, 1.62, -3.35), w: 0.14, h: 0.26 },
    ],
    { bone: body, color: fusePaint },
  );
  const skin = b.surface(fuselage);
  const topY = (z: number): number => skin.ray([0, 8, z], [0, -1, 0])?.at.y ?? 2.14;

  for (const s of [1, -1]) {
    const hit = skin.ray([s * 3, 1.46 + G, 0.95], [-s, 0, 0]);
    b.decal(fuselage, NAME, { at: hit ? arr(hit.at) : P(s * 0.5, 1.46, 0.95), dir: [s, 0, 0], size: [0.52, 0.24], bone: body });
    const h2 = skin.ray([s * 3, 1.5 + G, -1.65], [-s, 0, 0]);
    b.decal(fuselage, EMBLEM, { at: h2 ? arr(h2.at) : P(s * 0.35, 1.5, -1.65), dir: [s, 0, 0], size: [0.58, 0.58], bone: body });
  }

  // ------------------------------------------------------------ cowl, engine, prop
  const cowlZ = 1.2;
  b.lathe(
    [
      [0, 0],
      [0.6, 0],
      [0.64, 0.1],
      [0.64, 0.6],
      [0.58, 0.74],
      [0.5, 0.76],
      [0.44, 0.62],
      [0, 0.62],
    ],
    { at: P(0, 1.5, cowlZ), axis: [0, 0, 1], segments: 18, color: COWL, bone: body },
  );
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const rd: V = [Math.sin(a), Math.cos(a), 0];
    put(new THREE.BoxGeometry(0.2, 0.035, 0.07), INTERIOR, {
      at: P(rd[0] * 0.645, 1.5 + rd[1] * 0.645, cowlZ + 0.3),
      dir: rd,
      up: [0, 0, 1],
    });
    put(sph(0.02, 5, 4), BRASSC, { at: P(rd[0] * 0.56, 1.5 + rd[1] * 0.56, cowlZ + 0.745) });
  }
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const x = Math.sin(a) * 0.34;
    const y = Math.cos(a) * 0.34;
    put(cyl(0.07, 0.09, 0.22, 8), STEEL, { at: P(x, 1.5 + y, cowlZ + 0.68), dir: [0, 0, 1], flat: true });
    put(sph(0.065, 6, 4), BRASSC, { at: P(x, 1.5 + y, cowlZ + 0.8), flat: true });
  }
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.2, 0.06],
      [0.14, 0.2],
      [0.06, 0.3],
      [0, 0.34],
    ],
    { at: P(0, 1.5, cowlZ + 0.76), axis: [0, 0, 1], segments: 12, color: RED, bone: propJ },
  );
  for (let k = 0; k < 2; k++) {
    const a = 0.35 + k * Math.PI;
    b.extrude(
      [
        [-0.07, 0.05],
        [0.07, 0.05],
        [0.11, 0.5],
        [0.08, 1.05],
        [0, 1.12],
        [-0.08, 1.05],
        [-0.11, 0.5],
      ],
      {
        at: P(0, 1.5, 2.04),
        x: [Math.cos(a), Math.sin(a), 0],
        y: [-Math.sin(a), Math.cos(a), 0],
        thickness: 0.035,
        bevel: 0.01,
        smoothing: 1,
        color: propPaint,
        bone: propJ,
        name: `blade${k}`,
      },
    );
  }
  put(cyl(0.06, 0.06, 0.1, 8), BRASSC, { at: P(0, 1.5, 2.04), dir: [0, 0, 1], bone: propJ });
  for (const s of [1, -1]) {
    b.sweep(
      catmull([P(s * 0.6, 1.5, 1.7), P(s * 0.7, 1.5, 1.4), P(s * 0.62, 1.46, 0.9), P(s * 0.58, 1.42, 0.45)]),
      [0.05, 0.07],
      { color: EXH, bone: body, sides: 6 },
    );
  }

  // ------------------------------------------------------------ wings
  const wingOutline = (span: number, half: number): [number, number][] => [
    [-span + 0.7, half],
    [-span + 0.2, half * 0.85],
    [-span, half * 0.2],
    [-span, -half * 0.35],
    [-span + 0.35, -half * 0.9],
    [-span + 0.8, -half],
    [span - 0.8, -half],
    [span - 0.35, -half * 0.9],
    [span, -half * 0.35],
    [span, half * 0.2],
    [span - 0.2, half * 0.85],
    [span - 0.7, half],
  ];
  const WINGS = [
    { y: 3.0, z: 0.4, span: 4.1, half: 0.7, tip: RED, tag: "U", ail: TEAL },
    { y: 1.12, z: 0.1, span: 3.8, half: 0.62, tip: TEAL, tag: "L", ail: RED },
  ];
  const wingParts: any[] = [];
  for (const w of WINGS) {
    const plate = b.extrude(wingOutline(w.span, w.half), {
      at: P(0, w.y, w.z),
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.16,
      bevel: 0.05,
      smoothing: 1,
      color: wingPaint(w.span, w.tip),
      bone: body,
      name: `wing${w.tag}`,
    });
    wingParts.push(plate);
    for (const s of [1, -1]) {
      const L = w.span - 0.8 - 1.9;
      const m = 0.55 * w.half;
      const j = b.joint(`aileron${w.tag}${s > 0 ? "L" : "R"}`, {
        parent: body,
        at: P(s * (1.9 + L / 2), w.y, w.z - 0.45 * w.half),
        dir: [s, 0, 0],
        role: "hinge",
      });
      b.extrude(
        [
          [0, 0],
          [L, 0],
          [L - 0.02, -m * 0.6],
          [L - 0.2, -m],
          [0, -m],
        ],
        {
          at: P(s * 1.9, w.y, w.z - 0.45 * w.half),
          x: [s, 0, 0],
          y: [0, 0, 1],
          thickness: 0.19,
          bevel: 0.04,
          color: w.ail,
          bone: j,
          name: `aileron${w.tag}${s > 0 ? "L" : "R"}`,
        },
      );
    }
  }
  for (const s of [1, -1]) {
    b.decal(wingParts[0], EMBLEM, { at: P(s * 2.7, 3.0 + 0.08, 0.35), dir: [0, 1, 0], up: [0, 0, 1], size: [0.9, 0.9], bone: body });
    b.decal(wingParts[1], EMBLEM, { at: P(s * 2.3, 1.12 - 0.08, 0.1), dir: [0, -1, 0], up: [0, 0, 1], size: [0.8, 0.8], bone: body });
  }
  // gravity fuel tank on top of the upper wing
  put(sph(1, 12, 8), RED, { at: P(0, 3.0 + 0.2, 0.4), scale: [0.42, 0.15, 0.4], flat: true });
  put(cyl(0.07, 0.07, 0.05, 8), BRASSC, { at: P(0, 3.0 + 0.36, 0.4) });

  // nav + landing lights
  for (const s of [1, -1]) {
    glow(put(sph(0.08, 6, 4), s > 0 ? "#ff4d4d" : "#4dff9a", { at: P(s * 4.08, 3.0, 0.4), flat: true }), 1.4);
    put(cyl(0.1, 0.1, 0.08, 8), BRASSC, { at: P(s * 1.2, 1.12, 0.72), dir: [0, 0, 1] });
    glow(put(sph(0.075, 6, 4), "#fff2a8", { at: P(s * 1.2, 1.12, 0.78), flat: true }), 1.5);
  }

  // ------------------------------------------------------------ struts and wires
  const yU = 3.0 - 0.02;
  const yL = 1.12 + 0.02;
  for (const s of [1, -1]) {
    for (const xi of [1.9, 3.3]) {
      rod(P(s * xi, yL, 0.4), P(s * xi, yU, 0.75), [0.05, 0.04], WOOD);
      rod(P(s * xi, yL, -0.15), P(s * xi, yU, 0.1), [0.05, 0.04], WOOD);
    }
    for (const [zl, zu] of [
      [0.4, 0.75],
      [-0.15, 0.1],
    ]) {
      rod(P(s * 1.9, yL, zl), P(s * 3.3, yU, zu), 0.012, INK, { sides: 4 });
      rod(P(s * 3.3, yL, zl), P(s * 1.9, yU, zu), 0.012, INK, { sides: 4 });
    }
    // cabane
    rod(P(s * 0.4, 1.85, 0.8), P(s * 0.55, 2.98, 0.75), [0.05, 0.045], WOOD);
    rod(P(s * 0.34, 1.9, 0.1), P(s * 0.55, 2.98, 0.1), [0.05, 0.045], WOOD);
    rod(P(s * 0.55, 2.95, 0.75), P(s * 1.9, yL, 0.4), 0.012, INK, { sides: 4 });
    put(sph(0.04, 5, 4), BRASSC, { at: P(s * 3.3, yU, 0.75) });
    put(sph(0.04, 5, 4), BRASSC, { at: P(s * 3.3, yL, 0.4) });
  }

  // ------------------------------------------------------------ tail
  b.extrude(
    [
      [0, 0],
      [0.85, 0],
      [0.65, 0.4],
      [0.2, 1.0],
      [0, 1.1],
    ],
    { at: P(0, 1.62, -3.3), x: [0, 0, 1], y: [0, 1, 0], thickness: 0.07, bevel: 0.02, smoothing: 1, color: TEAL, bone: body, name: "fin" },
  );
  b.extrude(
    [
      [0, -0.1],
      [0, 1.1],
      [-0.25, 1.22],
      [-0.5, 1.0],
      [-0.55, 0.4],
      [-0.4, -0.1],
    ],
    { at: P(0, 1.64, -3.3), x: [0, 0, 1], y: [0, 1, 0], thickness: 0.08, bevel: 0.02, smoothing: 1, color: rudderPaint, bone: rudder, name: "rudderPlate" },
  );
  b.extrude(
    [
      [-0.3, 0.45],
      [-1.1, 0.35],
      [-1.4, 0.1],
      [-1.4, 0.0],
      [1.4, 0.0],
      [1.4, 0.1],
      [1.1, 0.35],
      [0.3, 0.45],
    ],
    { at: P(0, 1.58, -2.95), x: [1, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.02, smoothing: 1, color: TEAL, bone: body, name: "stabilizer" },
  );
  b.extrude(
    [
      [-1.4, 0],
      [1.4, 0],
      [1.35, -0.25],
      [1.1, -0.4],
      [-1.1, -0.4],
      [-1.35, -0.25],
    ],
    { at: P(0, 1.58, -2.95), x: [1, 0, 0], y: [0, 0, 1], thickness: 0.08, bevel: 0.02, smoothing: 1, color: RED, bone: elevator, name: "elevatorPlate" },
  );
  for (const s of [1, -1]) rod(P(s * 0.2, 1.38, -2.5), P(s * 1.1, 1.56, -3.0), 0.025, WOOD, { sides: 5 });
  rod(P(0, 1.55, -2.85), P(0, 0.28, -3.15), 0.035, STEEL, { sides: 6 });
  put(new THREE.TorusGeometry(0.1, 0.045, 6, 12), TIRE, { at: P(0, 0.145, -3.15), dir: [1, 0, 0], axis: "z", flat: true });

  // ------------------------------------------------------------ landing gear
  const WZ = 0.55;
  for (const s of [1, -1]) {
    const WC = P(s * 0.95, 0.53, WZ);
    put(new THREE.TorusGeometry(0.4, 0.13, 8, 16), TIRE, { at: WC, dir: [1, 0, 0], axis: "z", flat: true });
    put(cyl(0.3, 0.3, 0.2, 12), CREAM, { at: WC, dir: [1, 0, 0], flat: true });
    put(new THREE.PlaneGeometry(0.56, 0.56), "#ffffff", { at: P(s * (0.95 + 0.108), 0.53, WZ), dir: [s, 0, 0], axis: "z", texture: HUB });
    put(sph(0.05, 6, 4), BRASSC, { at: P(s * 1.14, 0.53, WZ) });
    rod(P(s * 0.3, 1.0, 0.95), P(s * 1.1, 0.55, WZ), [0.05, 0.045], STEEL);
    rod(P(s * 0.3, 1.0, 0.2), P(s * 1.1, 0.55, WZ), [0.05, 0.045], STEEL);
    // shock absorber collar
    rod(P(s * 0.62, 0.8, 0.62), P(s * 0.74, 0.74, 0.58), 0.075, RED, { sides: 8 });
    // wheel chock
    b.extrude(
      [
        [0, 0],
        [0.4, 0],
        [0, 0.25],
      ],
      { at: P(s * 0.95 + 0.11, 0, 1.06), x: [0, 0, 1], y: [0, 1, 0], thickness: 0.22, bevel: 0.02, color: WOOD, bone: body, name: "chock" },
    );
  }
  rod(P(-1.1, 0.53, WZ), P(1.1, 0.53, WZ), 0.05, STEEL, { sides: 6 });

  // ------------------------------------------------------------ cockpits
  const cockpit = (z: number, rx: number, rz: number) => {
    const y = topY(z);
    put(cyl(1, 1, 0.12, 14), INTERIOR, { at: [0, y - 0.03, z], scale: [rx, 1, rz], flat: true });
    const pts: V[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      pts.push([Math.sin(a) * rx * 1.04, y - 0.005, z + Math.cos(a) * rz * 1.04]);
    }
    b.sweep(catmull(pts, { closed: true }), 0.05, { color: LEATH2, bone: body, sides: 6 });
  };
  const screen = (z: number, w: number) => {
    const y = topY(z);
    put(new THREE.BoxGeometry(w, 0.3, 0.02), GLASS, { at: [0, y + 0.16, z], rotation: [-22, 0, 0] });
    put(new THREE.BoxGeometry(w + 0.05, 0.03, 0.04), BRASSC, { at: [0, y + 0.299, z - 0.056], rotation: [-22, 0, 0] });
    for (const s of [1, -1]) put(new THREE.BoxGeometry(0.03, 0.3, 0.03), BRASSC, { at: [s * w * 0.5, y + 0.16, z], rotation: [-22, 0, 0] });
  };

  // --- pilot
  const zp = -0.8;
  const yP = topY(zp) - 0.14;
  cockpit(zp, 0.3, 0.38);
  screen(zp + 0.4, 0.36);
  put(sph(1, 10, 8), JACKET, { at: [0, yP, zp], scale: [0.3, 0.42, 0.26], flat: true });
  put(new THREE.TorusGeometry(0.19, 0.07, 6, 12), scarfPaint, { at: [0, yP + 0.4, zp], dir: [0, 1, 0], axis: "z" });
  const Hc: V = [0, yP + 0.66, zp + 0.03];
  const headP = put(sph(0.25, 12, 9), SKIN, { at: Hc });
  b.decal(headP, FACE, { at: [0, Hc[1], Hc[2] + 0.25], dir: [0, 0, 1], size: [0.4, 0.4], bone: body });
  put(new THREE.SphereGeometry(0.272, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.38), LEATH, { at: Hc, flat: true });
  {
    const pts: V[] = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      pts.push([Math.sin(a) * 0.268, Hc[1] + 0.1, Hc[2] + Math.cos(a) * 0.268]);
    }
    b.sweep(catmull(pts, { closed: true }), 0.022, { color: LEATH2, bone: body, sides: 5 });
  }
  put(sph(0.05, 6, 4), RED, { at: [0, Hc[1] + 0.27, Hc[2]] });
  const lensAt: V[] = [];
  for (const s of [1, -1]) {
    put(sph(1, 8, 6), LEATH, { at: [s * 0.26, Hc[1] - 0.04, Hc[2]], scale: [0.045, 0.1, 0.1], flat: true });
    const d = new THREE.Vector3(s * 0.36, 0.64, 0.68).normalize();
    const at = new THREE.Vector3(...Hc).addScaledVector(d, 0.268);
    put(cyl(0.085, 0.085, 0.07, 10), BRASSC, { at: arr(at), dir: arr(d), flat: true });
    const lens = at.clone().addScaledVector(d, 0.012);
    put(cyl(0.062, 0.062, 0.08, 10), "#7fd6e8", { at: arr(lens), dir: arr(d), flat: true });
    lensAt.push(arr(at));
  }
  rod(lensAt[0], lensAt[1], 0.015, BRASSC, { sides: 4 });
  // right arm rests, left arm waves
  b.capsule([-0.27, yP + 0.2, zp], [-0.34, yP + 0.1, zp + 0.3], 0.075, JACKET, { bone: body });
  put(sph(0.09, 7, 5), LEATH2, { at: [-0.34, yP + 0.08, zp + 0.36], flat: true });
  b.capsule([0.27, yP + 0.25, zp], [0.52, yP + 0.45, zp + 0.05], 0.075, JACKET, { bone: body });
  b.capsule([0.52, yP + 0.45, zp + 0.05], [0.66, yP + 0.85, zp + 0.1], 0.065, JACKET, { bone: body });
  put(sph(0.105, 7, 5), LEATH2, { at: [0.66, yP + 0.93, zp + 0.1], flat: true });
  put(sph(0.045, 5, 4), LEATH2, { at: [0.58, yP + 0.92, zp + 0.1] });
  // streaming scarf
  const sx = [0.1, 0.28, 0.12, 0.3, 0.14, 0.26];
  const scarfPts: V[] = sx.map((x, i) => [x, yP + 0.38 + i * 0.05, zp - 0.15 - i * 0.4]);
  b.sweep(catmull(scarfPts), (t: number) => [0.012, 0.11 * (1 - 0.25 * t)], { section: "box", color: scarfPaint, bone: body, caps: "flat" });

  // --- bear passenger
  const zb = 0.3;
  const yB = topY(zb) + 0.06;
  cockpit(zb, 0.3, 0.34);
  screen(zb + 0.44, 0.62);
  put(sph(1, 10, 8), BEAR, { at: [0, yB, zb], scale: [0.27, 0.3, 0.24], flat: true });
  const Bc: V = [0, yB + 0.36, zb + 0.02];
  const bearHead = put(sph(0.26, 12, 9), BEAR, { at: Bc });
  b.decal(bearHead, BEARFACE, { at: [0, Bc[1], Bc[2] + 0.26], dir: [0, 0, 1], size: [0.45, 0.45], bone: body });
  for (const s of [1, -1]) {
    put(sph(0.1, 7, 5), BEAR, { at: [s * 0.18, Bc[1] + 0.19, Bc[2] - 0.02], flat: true });
    put(sph(0.058, 6, 4), TAN, { at: [s * 0.18, Bc[1] + 0.19, Bc[2] + 0.04], flat: true });
    const d = new THREE.Vector3(s * 0.3, 0.75, 0.55).normalize();
    const at = new THREE.Vector3(...Bc).addScaledVector(d, 0.26);
    put(cyl(0.06, 0.06, 0.05, 8), BRASSC, { at: arr(at), dir: arr(d), flat: true });
    put(cyl(0.045, 0.045, 0.06, 8), "#7fd6e8", { at: arr(at.clone().addScaledVector(d, 0.01)), dir: arr(d), flat: true });
    b.capsule([s * 0.24, yB + 0.1, zb + 0.05], [s * 0.19, yB + 0.07, zb + 0.4], 0.07, BEAR, { bone: body });
    put(sph(0.08, 6, 5), TAN, { at: [s * 0.19, yB + 0.07, zb + 0.43], flat: true });
    put(new THREE.ConeGeometry(0.07, 0.12, 6), RED, { at: [s * 0.06, yB + 0.17, zb + 0.2], dir: [-s, 0, 0], flat: true });
  }
  put(sph(0.04, 6, 4), RED, { at: [0, yB + 0.17, zb + 0.2] });

  // ------------------------------------------------------------ bunting
  {
    for (const s of [1, -1]) {
      const bp: V[] = [];
      for (let i = 0; i <= 8; i++) {
        const x = 1.05 + (2.65 * i) / 8;
        const u = (x - 2.375) / 1.325;
        bp.push([s * x, 3.0 + G + 0.02 - 0.4 * (1 - u * u), 1.2]);
      }
      const bpath = catmull(bp);
      b.sweep(bpath, 0.012, { color: INK, bone: body, sides: 4 });
      const groups: any[][] = [[], [], []];
      for (let i = 1; i <= 11; i++) groups[i % 3].push(frame(bpath.at(i / 12), [0, 1, 0]));
      groups.forEach((fr, k) => b.cards(fr, FLAGS[k], { size: [0.2, 0.26], lean: 180, flow: [0, 0, 1], bone: body }));
    }
  }

  // ------------------------------------------------------------ airfield props
  // windsock
  {
    const wx = -2.6;
    const wz = -3.6;
    put(cyl(0.18, 0.22, 0.1, 8), DWOOD, { at: P(wx, 0.05, wz), flat: true });
    rod(P(wx, 0, wz), P(wx, 3.1, wz), [0.07, 0.04], "#f2f2f2");
    put(sph(0.07, 6, 4), RED, { at: P(wx, 3.14, wz) });
    const d = new THREE.Vector3(0.8, -0.15, -0.3).normalize();
    const da = arr(d);
    b.lathe(
      [
        [0, 0],
        [0.22, 0],
        [0.2, 0.15],
        [0.06, 1.2],
        [0, 1.2],
      ],
      {
        at: P(wx, 3.15, wz),
        axis: da,
        segments: 10,
        color: stripes("#ff8a1c", CREAM, { size: 0.22, axis: da, width: 0.5, wobble: 0 }),
        bone: body,
      },
    );
    put(new THREE.TorusGeometry(0.23, 0.014, 5, 12), STEEL, { at: P(wx, 3.15, wz), dir: da, axis: "z" });
  }

  // fuel drums, crates
  const drum = (x: number, z: number, c: string) => {
    put(cyl(0.3, 0.3, 0.85, 12), drumPaint(c), { at: P(x, 0.425, z), flat: true });
    put(cyl(0.12, 0.12, 0.05, 8), STEEL, { at: P(x + 0.1, 0.87, z), flat: true });
  };
  drum(-3.2, -2.4, RED);
  drum(-2.6, -2.8, TEAL);
  put(new THREE.BoxGeometry(0.7, 0.55, 0.55), "#ffffff", { at: P(-3.3, 0.275, -1.3), texture: CRATE });
  put(new THREE.BoxGeometry(0.45, 0.4, 0.4), "#ffffff", { at: P(-3.35, 0.75, -1.3), rotation: [0, 25, 0], texture: CRATE });

  // hay bale
  put(cyl(0.38, 0.38, 0.7, 12), grain("#e6c25a", "#b8923a", { size: 0.04, axis: "x" }), {
    at: P(3.3, 0.38, 1.9),
    dir: [1, 0, 0],
    flat: true,
  });
  for (const dx of [-0.2, 0.2]) put(cyl(0.39, 0.39, 0.04, 12), LEATH2, { at: P(3.3 + dx, 0.38, 1.9), dir: [1, 0, 0], flat: true });

  // sign post with lantern
  {
    const sx0 = -3.1;
    const sz0 = 2.0;
    const ang = 25;
    const f: V = [Math.sin((ang * Math.PI) / 180), 0, Math.cos((ang * Math.PI) / 180)];
    rod(P(sx0, 0, sz0), P(sx0, 2.0, sz0), [0.07, 0.06], WOOD);
    put(new THREE.BoxGeometry(1.1, 0.7, 0.06), DWOOD, { at: P(sx0, 1.4, sz0), rotation: [0, ang, 0] });
    put(new THREE.PlaneGeometry(1.06, 0.66), "#ffffff", {
      at: P(sx0 + f[0] * 0.034, 1.4, sz0 + f[2] * 0.034),
      dir: f,
      axis: "z",
      texture: SIGN,
    });
    put(sph(0.08, 6, 4), RED, { at: P(sx0, 2.05, sz0) });
    rod(P(sx0, 1.9, sz0), P(sx0 + 0.45, 1.9, sz0 + 0.1), 0.03, STEEL, { sides: 5 });
    glow(put(cyl(0.09, 0.09, 0.2, 6), "#ffb347", { at: P(sx0 + 0.45, 1.75, sz0 + 0.1), flat: true }), 1.6);
    put(new THREE.ConeGeometry(0.13, 0.1, 6), STEEL, { at: P(sx0 + 0.45, 1.9, sz0 + 0.1), flat: true });
  }

  // flowers around the edge
  {
    const R = rng(7);
    const keep: [number, number][] = [
      [-3.1, 2.0],
      [3.0, -3.0],
      [-3.2, -2.4],
      [-2.6, -2.8],
      [-3.3, -1.3],
      [3.3, 1.9],
    ];
    const blooms = ["#ff9ec0", "#fff1a8", "#ffffff", "#c9a0ff"];
    let placed = 0;
    for (let tries = 0; placed < 14 && tries < 300; tries++) {
      const a = R() * Math.PI * 2;
      const fr = 0.8 + 0.14 * R();
      const x = Math.sin(a) * 4.6 * fr;
      const z = -0.6 + Math.cos(a) * 4.2 * fr;
      if (keep.some(([kx, kz]) => Math.hypot(kx - x, kz - z) < 0.9)) continue;
      const h = 0.25 + 0.15 * R();
      rod(P(x, 0, z), P(x, h, z), 0.012, GREEN, { sides: 4 });
      put(sph(0.06, 6, 4), blooms[placed % blooms.length], { at: P(x, h + 0.03, z), flat: true });
      put(sph(0.025, 5, 3), SUN, { at: P(x, h + 0.075, z), flat: true });
      placed++;
    }
  }

  return b.root;
}
