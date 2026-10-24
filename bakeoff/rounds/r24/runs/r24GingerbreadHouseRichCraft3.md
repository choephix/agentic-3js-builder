```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  createBuilder,
  rng,
  paint,
  noise,
  cells,
  mix,
  smoothstep,
  rgb,
  countershade,
  grain,
  mottle,
  catmull,
  polyline,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Gingerbread House",
  description:
    "A candy-and-icing gingerbread cottage on a gold cake board: candy-tile roof, glowing windows, chimney with cotton-candy smoke, candy cane fence, gumdrops, icing trees, lollipops and two gingerbread folk.",
};

type Col = string | ReturnType<typeof paint>;

// ---------------------------------------------------------------------------------------------------------------
// Palette
const RED = "#e5384a";
const GREEN = "#3fae5a";
const MINT = "#a6e6c8";
const PINK = "#ff8fb5";
const YELLOW = "#ffd24a";
const ORANGE = "#ff9a3d";
const BLUE = "#5aa9e6";
const CREAM = "#fff6e8";
const WHITE = "#fffdf8";
const GOLD = "#e2b95a";
const WAFFLE = "#c9904a";
const DARKBROWN = "#4b2a18";

// ---------------------------------------------------------------------------------------------------------------
// Paints
const GINGER = paint((p, n) => {
  const a = noise(p, 0.06, 3);
  const f = noise(p, 0.01, 7);
  let c = mix("#8c4c22", "#bd7a3e", smoothstep(0.3, 0.7, a));
  c = mix(c, "#6a3416", 0.35 * smoothstep(0.6, 0.8, f));
  const sp = cells(p, 0.014, 5);
  if (sp.d1 < 0.12 && sp.id > 0.5) c = mix(c, "#4a2410", 0.7);
  c = mix(c, "#e0a45c", 0.28 * smoothstep(0.5, 1, n.y));
  return c;
});
const GINGER_FIG = paint((p, n) => {
  const a = noise(p, 0.02, 9);
  let c = mix("#b5702f", "#d99a52", smoothstep(0.3, 0.7, a));
  c = mix(c, "#f0bd78", 0.25 * smoothstep(0.4, 1, n.y));
  return c;
});
const CHOC = grain("#4a2a1a", "#6a3e26", { size: 0.012, axis: "z" });
const ICING = countershade("#fffdf7", "#d3deef", { level: 0.05, soft: 0.6 });
const SNOW = paint((p, n) => {
  const t = noise(p, 0.05, 2);
  let c = mix("#fdfeff", "#d9e6f8", 0.7 * smoothstep(0.4, 0.75, t));
  if (n.y < 0.4) c = mix(c, "#bcd0ec", 0.5);
  return c;
});
const BRICK = paint((p, n) => {
  const u = Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x;
  const rowF = p.y / 0.014;
  const row = Math.floor(rowF);
  const uu = (u + (row % 2) * 0.011) / 0.022;
  const iu = Math.floor(uu);
  const fu = uu - iu;
  const fv = rowF - row;
  if (fu < 0.1 || fv < 0.14) return "#fff3ea";
  const h = Math.sin(iu * 12.9898 + row * 78.233) * 43758.5453;
  const r = h - Math.floor(h);
  return r < 0.33 ? "#c9506a" : r < 0.66 ? "#e0728a" : "#b8405a";
});
const sugarCache = new Map<string, ReturnType<typeof paint>>();
function sugar(color: string) {
  let m = sugarCache.get(color);
  if (!m) {
    const c = rgb(color);
    m = paint((p, n) => {
      const sp = smoothstep(0.62, 0.7, noise(p, 0.0035, 11));
      const sh = 0.86 + 0.14 * smoothstep(-0.8, 0.8, n.y);
      return mix([c[0] * sh, c[1] * sh, c[2] * sh], "#ffffff", 0.5 * sp);
    });
    sugarCache.set(color, m);
  }
  return m;
}
function caneMat(len: number) {
  return paint((_p, _n, s) => {
    const k = (((s[0] * len) / 0.012 - s[1] / 360) % 1 + 1) % 1;
    return k < 0.5 ? RED : "#fffaf5";
  });
}
const ROPE = paint((_p, _n, s) => {
  const k = ((s[0] * 90 - s[1] / 360) % 1 + 1) % 1;
  return k < 0.5 ? PINK : CREAM;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures
const WINDOW = svg(
  `<svg viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="g" cx="0.5" cy="0.62" r="0.75"><stop offset="0" stop-color="#fff8c8"/><stop offset="0.6" stop-color="#ffd26a"/><stop offset="1" stop-color="#ff9a3d"/></radialGradient></defs>
  <rect width="50" height="60" rx="4" fill="url(#g)"/>
  <path d="M0 0 L16 0 Q8 10 0 24Z" fill="#e5384a"/><path d="M50 0 L34 0 Q42 10 50 24Z" fill="#e5384a"/>
  <path d="M10 60 Q12 44 20 40 Q25 36 30 40 Q38 44 40 60Z" fill="#ffb14a" opacity="0.55"/>
  <path d="M25 0V60M0 30H50" stroke="#fff6e8" stroke-width="3.6"/>
  <rect x="1" y="1" width="48" height="58" rx="4" fill="none" stroke="#c76a1c" stroke-width="2"/>
  </svg>`,
  { size: 192 },
);
const DOOR = svg(
  `<svg viewBox="0 0 70 100" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e3c22"/><stop offset="1" stop-color="#4a2814"/></linearGradient></defs>
  <path d="M0 100V35A35 35 0 0 1 70 35V100Z" fill="url(#g)"/>
  <path d="M6 95V37A29 29 0 0 1 64 37V95Z" fill="none" stroke="#2f160a" stroke-width="2.4"/>
  <g stroke="#2f160a" stroke-width="1.6" fill="#85502f">
    <rect x="11" y="36" width="21" height="26" rx="2"/><rect x="38" y="36" width="21" height="26" rx="2"/>
    <rect x="11" y="67" width="21" height="24" rx="2"/><rect x="38" y="67" width="21" height="24" rx="2"/>
  </g>
  <g stroke="#a8703e" stroke-width="1.4" fill="none"><path d="M13 38H30M13 38V60"/><path d="M40 38H57M40 38V60"/><path d="M13 69H30M13 69V89"/><path d="M40 69H57M40 69V89"/></g>
  <circle cx="35" cy="64" r="4.2" fill="#ffd24a" stroke="#a37a1a" stroke-width="1.4"/>
  </svg>`,
  { size: 256 },
);
function peppermintSvg() {
  const pt = (r: number, deg: number) =>
    `${(50 + r * Math.sin((deg * Math.PI) / 180)).toFixed(2)} ${(50 - r * Math.cos((deg * Math.PI) / 180)).toFixed(2)}`;
  let w = "";
  for (let i = 0; i < 8; i++) {
    const a0 = i * 45;
    const a1 = a0 + 22.5;
    w += `<path d="M50 50 Q${pt(28, a0 + 28)} ${pt(46, a0)} A46 46 0 0 1 ${pt(46, a1)} Q${pt(28, a1 + 28)} 50 50Z" fill="#e5384a"/>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="49" fill="#fffaf0"/>${w}<circle cx="50" cy="50" r="46.5" fill="none" stroke="#fffaf0" stroke-width="3"/><circle cx="50" cy="50" r="49" fill="none" stroke="#c42a3c" stroke-width="1.2"/><circle cx="50" cy="50" r="3" fill="#fffaf0"/></svg>`;
}
const PEPPERMINT = svg(peppermintSvg(), { size: 192 });
const HEART = svg(
  `<svg viewBox="0 0 24 22" xmlns="http://www.w3.org/2000/svg"><path d="M12 21 C3 14 1 9 1 6 A5.5 5.5 0 0 1 12 4.5 A5.5 5.5 0 0 1 23 6 C23 9 21 14 12 21Z" fill="#ff4d6d" stroke="#b8203f" stroke-width="1.4"/><ellipse cx="7" cy="7" rx="2.4" ry="1.5" fill="#fff" opacity="0.8" transform="rotate(-30 7 7)"/></svg>`,
  { size: 64 },
);
function lolliSvg(c1: string, c2: string) {
  let d = "";
  for (let i = 0; i < 130; i++) {
    const th = i * 0.16;
    const r = 2 + th * 2.15;
    if (r > 43) break;
    d += `${i ? "L" : "M"}${(50 + r * Math.cos(th)).toFixed(2)} ${(50 + r * Math.sin(th)).toFixed(2)}`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="${c1}"/><path d="${d}" fill="none" stroke="${c2}" stroke-width="8" stroke-linecap="round"/><circle cx="50" cy="50" r="47" fill="none" stroke="#ffffff" stroke-opacity="0.7" stroke-width="2"/><ellipse cx="30" cy="26" rx="9" ry="5" fill="#fff" opacity="0.5" transform="rotate(-35 30 26)"/></svg>`,
    { size: 160 },
  );
}
const LOLLI = [lolliSvg("#ff6fa0", "#fff7fb"), lolliSvg("#4aa8e8", "#f2fbff"), lolliSvg("#ffb43a", "#fff7c0")];

// ---------------------------------------------------------------------------------------------------------------
const P = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = P(0, 1, 0);
const RAD = 180 / Math.PI;

/** Rounded rectangle outline in the (x, z) plane, going round counter-clockwise. */
function rr(hx: number, hz: number, r: number, steps = 3): [number, number][] {
  const out: [number, number][] = [];
  const cs = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ];
  cs.forEach(([sx, sz], i) => {
    for (let k = 0; k <= steps; k++) {
      const a = ((i * 90 + (k * 90) / steps) * Math.PI) / 180;
      out.push([sx * (hx - r) + r * Math.cos(a), sz * (hz - r) + r * Math.sin(a)]);
    }
  });
  return out;
}

export default function build() {
  const b = createBuilder({ name: "gingerbread_house", paintSize: 2048 });
  const rnd = rng(11);

  // ---- dimensions
  const W = 0.3;
  const D = 0.22;
  const HW = W / 2;
  const HD = D / 2;
  const WALL_H = 0.15;
  const SNOW_TOP = 0.035;
  const Y0 = 0.034;
  const YT = Y0 + WALL_H;
  const RISE = 0.11;
  const A = Math.atan2(RISE, HW);
  const COS = Math.cos(A);
  const SIN = Math.sin(A);
  const OV = 0.03;
  const OVZ = 0.03;
  const TH = 0.012;
  const LS = HW / COS + OV;
  const RIDGE = P(0, YT + RISE, 0);

  // ---- helpers
  const ball = (at: THREE.Vector3, r: number, color: Col, sc: [number, number, number] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at, scale: sc, flat: true });
  const ballO = (at: THREE.Vector3, r: number, color: Col, sc: [number, number, number], dir: THREE.Vector3) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at, scale: sc, dir, flat: true });
  const disc = (at: THREE.Vector3, nrm: THREE.Vector3, r: number, h: number, color: Col, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir: nrm, flat: true });
  const box = (w: number, h: number, d: number, color: Col, at: THREE.Vector3) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at });
  const onRoof = (s: number, q: number, z: number, off: number) =>
    RIDGE.clone()
      .addScaledVector(P(s * COS, -SIN, 0), q)
      .addScaledVector(P(s * SIN, COS, 0), off)
      .add(P(0, 0, z));

  function gumdrop(x: number, z: number, r: number, color: string) {
    b.part(new THREE.SphereGeometry(r, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), sugar(color), {
      at: P(x, SNOW_TOP - 0.002, z),
      scale: [1, 0.85, 1],
      flat: true,
    });
  }

  // =============================================================================================================
  // Board, snow, border
  b.part(new THREE.BoxGeometry(0.64, 0.02, 0.52), GOLD, { at: P(0, 0.01, 0) });
  b.sweep(
    catmull(rr(0.312, 0.252, 0.03, 3).map(([x, z]) => [x, 0.0215, z]), { closed: true }),
    0.0075,
    { color: ROPE, sides: 6 },
  );
  b.extrude(rr(0.3, 0.24, 0.035, 3), {
    at: P(0, 0.027, 0),
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.016,
    bevel: 0.005,
    color: SNOW,
  });
  // drifts against the house and board
  const drifts: [number, number, number, number][] = [
    [-0.16, 0.125, 0.03, 0.4],
    [0.17, 0.13, 0.034, 0.4],
    [-0.17, -0.125, 0.034, 0.45],
    [0.18, -0.13, 0.03, 0.4],
    [0, -0.14, 0.04, 0.35],
    [-0.27, 0.0, 0.03, 0.4],
    [0.27, 0.05, 0.03, 0.4],
    [-0.1, 0.2, 0.026, 0.35],
  ];
  for (const [x, z, r, h] of drifts) ball(P(x, SNOW_TOP - 0.003, z), r, SNOW, [1.3, h, 1]);

  // sprinkles on the snow, merged per colour
  const sprinkleCols = [RED, GREEN, YELLOW, BLUE, PINK];
  const sprinkleGeo: THREE.BufferGeometry[][] = sprinkleCols.map(() => []);
  for (let i = 0, got = 0; got < 70 && i < 2000; i++) {
    const x = (rnd() - 0.5) * 0.56;
    const z = (rnd() - 0.5) * 0.46;
    if (Math.abs(x) < 0.2 && Math.abs(z) < 0.16) continue;
    if (Math.abs(x) < 0.05 && z > 0) continue;
    const g = new THREE.CapsuleGeometry(0.0013, 0.006, 2, 5);
    g.rotateZ(Math.PI / 2);
    g.rotateY(rnd() * Math.PI);
    g.translate(x, SNOW_TOP + 0.0016, z);
    sprinkleGeo[got % sprinkleCols.length].push(g);
    got++;
  }
  sprinkleCols.forEach((c, i) => {
    const merged = mergeGeometries(sprinkleGeo[i]);
    if (merged) b.part(merged, c, { at: [0, 0, 0] });
  });

  // =============================================================================================================
  // Walls
  b.part(new THREE.BoxGeometry(W, WALL_H + 0.004, D), GINGER, { at: P(0, Y0 + WALL_H / 2 - 0.002, 0) });
  for (const zs of [1, -1]) {
    // gable triangles
    void zs;
  }
  b.extrude(
    [
      [-HW, 0],
      [HW, 0],
      [0, RISE],
    ],
    { at: P(0, YT, 0), x: [1, 0, 0], thickness: D, color: GINGER },
  );
  // corner posts and base rope
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.013, WALL_H + 0.004, 0.013, ICING, P(sx * HW, Y0 + WALL_H / 2 - 0.002, sz * HD));
  b.sweep(
    polyline(rr(HW + 0.003, HD + 0.003, 0.012, 2).map(([x, z]) => [x, Y0 + 0.005, z]), { closed: true }),
    0.0065,
    { color: ICING, sides: 6 },
  );
  // candy band under the eaves
  const bandCols = [RED, WHITE, GREEN];
  for (let i = 0; i < 13; i++) {
    const x = -0.135 + i * 0.0225;
    disc(P(x, YT - 0.013, HD + 0.0025), P(0, 0, 1), 0.0075, 0.005, bandCols[i % 3]);
    disc(P(x, YT - 0.013, -HD - 0.0025), P(0, 0, -1), 0.0075, 0.005, bandCols[i % 3]);
  }
  for (let i = 0; i < 9; i++) {
    const z = -0.09 + i * 0.0225;
    disc(P(HW + 0.0025, YT - 0.013, z), P(1, 0, 0), 0.0075, 0.005, bandCols[i % 3]);
    disc(P(-HW - 0.0025, YT - 0.013, z), P(-1, 0, 0), 0.0075, 0.005, bandCols[i % 3]);
  }

  // =============================================================================================================
  // Roof
  const tileCols = [RED, CREAM, GREEN];
  const ROWS = 7;
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(LS + 0.012, TH, D + 2 * OVZ), CHOC, {
      at: onRoof(s, (LS - 0.012) / 2, 0, TH / 2),
      rotation: [0, 0, -s * A * RAD],
    });
    const nrm = P(s * SIN, COS, 0);
    for (let row = 0; row < ROWS; row++) {
      const q = LS - 0.03 - row * 0.026;
      const off = TH + 0.004 + (ROWS - row) * 0.0012;
      const odd = row % 2 === 1;
      const count = odd ? 7 : 8;
      for (let col = 0; col < count; col++) {
        const z = odd ? -0.102 + col * 0.034 : -0.119 + col * 0.034;
        const c = tileCols[(col + row * 2) % 3];
        b.part(new THREE.CylinderGeometry(0.0165, 0.0165, 0.006, 10), c, {
          at: onRoof(s, q, z, off),
          dir: nrm,
          flat: true,
        });
      }
    }
    // eave trim and icicles
    const E = onRoof(s, LS - 0.004, 0, TH / 2 + 0.002);
    b.capsule(P(E.x, E.y, -0.138), P(E.x, E.y, 0.138), 0.0105, ICING);
    for (let k = -6; k <= 6; k++) {
      const z = k * 0.021 + (rnd() - 0.5) * 0.006;
      const len = 0.018 + rnd() * 0.03;
      b.spike(P(E.x - s * 0.001, E.y - 0.004, z), [0, -1, 0], len, 0.0058, { color: ICING, sides: 5 });
    }
    // verge trims, beads and string lights
    for (const zs of [1, -1]) {
      const a = onRoof(s, 0.0, zs * (HD + OVZ - 0.004), TH + 0.002);
      const e = onRoof(s, LS - 0.004, zs * (HD + OVZ - 0.004), TH + 0.002);
      b.capsule(a, e, 0.0065, ICING);
      const lights = [RED, YELLOW, GREEN, BLUE, PINK];
      for (let i = 0; i < 8; i++) {
        const q = 0.02 + i * ((LS - 0.04) / 7);
        const pos = onRoof(s, q, zs * (HD + OVZ + 0.0005), TH + 0.004);
        glow(ball(pos, 0.0075, lights[(i + (s > 0 ? 0 : 2)) % 5]), 1.1);
      }
    }
  }
  // ridge cap + finials
  b.capsule(P(0, YT + RISE + TH + 0.002, -0.143), P(0, YT + RISE + TH + 0.002, 0.143), 0.0135, ICING);
  for (const zs of [1, -1]) {
    ball(P(0, YT + RISE + TH + 0.012, zs * 0.147), 0.016, sugar(PINK));
    ball(P(0, YT + RISE + TH + 0.03, zs * 0.147), 0.006, WHITE);
  }
  // snow lumps on the slopes
  const lumps: [number, number, number, number][] = [
    [1, 0.04, -0.09, 0.022],
    [1, 0.05, 0.085, 0.026],
    [1, 0.15, 0.09, 0.02],
    [1, 0.17, -0.095, 0.018],
    [-1, 0.045, -0.07, 0.026],
    [-1, 0.07, 0.1, 0.022],
    [-1, 0.13, -0.02, 0.022],
    [-1, 0.16, 0.08, 0.017],
  ];
  for (const [s, q, z, r] of lumps)
    ballO(onRoof(s, q, z, TH + 0.012), r, SNOW, [1, 0.4, 1], P(s * SIN, COS, 0));

  // =============================================================================================================
  // Chimney
  const CX = 0.085;
  const CZ = -0.04;
  const chBottom = YT + 0.02;
  const chTop = YT + RISE + 0.04;
  box(0.05, chTop - chBottom, 0.05, BRICK, P(CX, (chBottom + chTop) / 2, CZ));
  box(0.062, 0.012, 0.062, ICING, P(CX, chTop + 0.004, CZ));
  for (const [dx, dz, l] of [
    [0.03, 0.01, 0.026],
    [0.03, -0.014, 0.018],
    [-0.012, 0.031, 0.02],
    [0.012, 0.031, 0.03],
  ] as const)
    b.spike(P(CX + dx, chTop - 0.001, CZ + dz), [0, -1, 0], l, 0.0055, { color: ICING, sides: 5 });
  const smoke = mottle(PINK, WHITE, { size: 0.02, seed: 4 });
  const puffs: [number, number, number, number][] = [
    [0, 0.03, 0, 0.016],
    [0.01, 0.062, 0.004, 0.02],
    [-0.004, 0.1, -0.004, 0.025],
  ];
  for (const [dx, dy, dz, r] of puffs)
    b.part(new THREE.SphereGeometry(r, 9, 7), smoke, { at: P(CX + dx, chTop + dy, CZ + dz) });

  // =============================================================================================================
  // Gable peppermints
  for (const zs of [1, -1]) {
    const nrm = P(0, 0, zs);
    const c = P(0, YT + 0.047, zs * (HD + 0.0035));
    b.part(new THREE.CircleGeometry(0.029, 20), "#ffffff", { at: c, dir: nrm, axis: "z", texture: PEPPERMINT });
    b.part(new THREE.TorusGeometry(0.031, 0.0042, 5, 18), ICING, {
      at: P(0, YT + 0.047, zs * (HD + 0.0028)),
      dir: nrm,
      axis: "z",
    });
  }

  // =============================================================================================================
  // Door
  const doorOutline: [number, number][] = [
    [-0.033, 0],
    [0.033, 0],
  ];
  for (let a = 0; a <= 180; a += 30)
    doorOutline.push([0.033 * Math.cos((a * Math.PI) / 180), 0.061 + 0.033 * Math.sin((a * Math.PI) / 180)]);
  b.extrude(doorOutline, { at: P(0, Y0, HD + 0.001), x: [1, 0, 0], thickness: 0.012, color: DARKBROWN });
  b.part(new THREE.PlaneGeometry(0.064, 0.064 / 0.7), "#ffffff", {
    at: P(0, Y0 + 0.0457 + 0.001, HD + 0.0078),
    dir: [0, 0, 1],
    axis: "z",
    texture: DOOR,
  });
  const frameC = Y0 + 0.061;
  const framePts: number[][] = [[0.0375, Y0 + 0.004, HD + 0.006], [0.0375, frameC, HD + 0.006]];
  for (let a = 20; a <= 160; a += 20)
    framePts.push([0.0375 * Math.cos((a * Math.PI) / 180), frameC + 0.0375 * Math.sin((a * Math.PI) / 180), HD + 0.006]);
  framePts.push([-0.0375, frameC, HD + 0.006], [-0.0375, Y0 + 0.004, HD + 0.006]);
  b.sweep(catmull(framePts), 0.0045, { color: ICING, sides: 6 });
  box(0.11, 0.008, 0.04, ICING, P(0, Y0 + 0.003, HD + 0.024));
  // wreath
  b.part(new THREE.TorusGeometry(0.012, 0.0036, 5, 10), GREEN, {
    at: P(0, Y0 + 0.121, HD + 0.005),
    dir: [0, 0, 1],
    axis: "z",
    flat: true,
  });
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.6;
    ball(P(Math.cos(a) * 0.012, Y0 + 0.121 + Math.sin(a) * 0.012, HD + 0.0085), 0.0028, RED);
  }
  ball(P(0, Y0 + 0.1315, HD + 0.0085), 0.0035, RED);
  // door-side canes
  function cane(x: number, z: number, h: number, hook: number, y0 = SNOW_TOP - 0.003) {
    let pts: number[][];
    if (hook === 0) pts = [[x, y0, z], [x, y0 + h, z]];
    else {
      const R = 0.02;
      const ys = y0 + h - R;
      pts = [[x, y0, z], [x, y0 + h * 0.5, z], [x, ys, z]];
      for (let a = 30; a <= 180; a += 30) {
        const t = (a * Math.PI) / 180;
        pts.push([x + hook * (R - R * Math.cos(t)), ys + R * Math.sin(t), z]);
      }
    }
    const path = hook === 0 ? polyline(pts) : catmull(pts);
    b.sweep(path, 0.0048, { color: caneMat(path.length), sides: 6 });
  }
  for (const s of [1, -1]) {
    cane(s * 0.054, HD + 0.011, 0.105, 0, Y0 + 0.003);
    ball(P(s * 0.054, Y0 + 0.11, HD + 0.011), 0.0075, RED);
  }

  // =============================================================================================================
  // Windows
  function windowAt(c: THREE.Vector3, nrm: THREE.Vector3, tan: THREE.Vector3, ww = 0.05, wh = 0.06) {
    const at = (u: number, v: number, w: number) =>
      c.clone().addScaledVector(tan, u).addScaledVector(UP, v).addScaledVector(nrm, w);
    glow(
      b.part(new THREE.PlaneGeometry(ww, wh), "#ffffff", {
        at: at(0, 0, 0.002),
        dir: nrm,
        axis: "z",
        texture: WINDOW,
      }),
      1.2,
    );
    const o = (u: number, v: number, w: number, bw: number, bh: number, bd: number, col: Col) =>
      b.part(new THREE.BoxGeometry(bw, bh, bd), col, { at: at(u, v, w), dir: nrm, axis: "z" });
    o(0, wh / 2 + 0.001, 0.003, ww + 0.012, 0.006, 0.006, ICING);
    o(0, -wh / 2 - 0.001, 0.003, ww + 0.012, 0.006, 0.006, ICING);
    o(ww / 2 + 0.001, 0, 0.003, 0.006, wh + 0.004, 0.006, ICING);
    o(-ww / 2 - 0.001, 0, 0.003, 0.006, wh + 0.004, 0.006, ICING);
    o(0, -wh / 2 - 0.006, 0.008, ww + 0.02, 0.006, 0.016, ICING);
    for (const k of [1, -1]) {
      const col = k > 0 ? MINT : PINK;
      o(k * (ww / 2 + 0.0125), 0, 0.002, 0.014, wh + 0.006, 0.004, col);
      for (const v of [0.013, -0.013])
        b.part(new THREE.PlaneGeometry(0.009, 0.009 * (22 / 24)), "#ffffff", {
          at: at(k * (ww / 2 + 0.0125), v, 0.0052),
          dir: nrm,
          axis: "z",
          texture: HEART,
        });
    }
  }
  const wy = Y0 + 0.085;
  for (const s of [1, -1]) windowAt(P(s * 0.1, wy, HD), P(0, 0, 1), P(1, 0, 0));
  for (const z of [-0.045, 0.045]) {
    windowAt(P(HW, wy, z), P(1, 0, 0), P(0, 0, 1));
    windowAt(P(-HW, wy, z), P(-1, 0, 0), P(0, 0, 1));
  }
  windowAt(P(0, wy, -HD), P(0, 0, -1), P(1, 0, 0), 0.06, 0.07);

  // =============================================================================================================
  // Front garden: stones, fence, trees, gumdrops, lollipops
  const stones: [number, number, number, string][] = [
    [0.004, 0.172, 0.022, MINT],
    [-0.01, 0.197, 0.02, PINK],
    [0.01, 0.222, 0.021, YELLOW],
    [-0.004, 0.246, 0.019, BLUE],
  ];
  for (const [x, z, r, c] of stones)
    b.part(new THREE.CylinderGeometry(r, r, 0.006, 8), sugar(c), { at: P(x, SNOW_TOP + 0.0005, z), flat: true });

  [-0.23, -0.18, -0.13, -0.08, 0.08, 0.13, 0.18, 0.23].forEach((x, i) => cane(x, 0.232, 0.062, i % 2 ? 1 : -1));

  function tree(x: number, z: number, s: number, leaf: Col, orn: string[]) {
    const base = SNOW_TOP - 0.002;
    b.part(new THREE.CylinderGeometry(0.007 * s, 0.009 * s, 0.03 * s, 6), WAFFLE, {
      at: P(x, base + 0.015 * s, z),
      flat: true,
    });
    let y = base + 0.022 * s;
    let top = y;
    for (let i = 0; i < 3; i++) {
      const r = 0.046 * s * (1 - 0.24 * i);
      const h = 0.05 * s;
      b.lathe(
        [
          [0, 0],
          [r, 0],
          [r * 0.97, 0.006 * s],
          [r * 0.42, h * 0.92],
          [0, h],
        ],
        { at: P(x, y, z), segments: 8, color: leaf },
      );
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2 + i * 0.4;
        ball(P(x + Math.cos(a) * r * 0.93, y + 0.004 * s, z + Math.sin(a) * r * 0.93), 0.0042 * s, orn[(k + i) % orn.length]);
      }
      top = y + h;
      y += h * 0.62;
    }
    const star: [number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const rr2 = (i % 2 ? 0.0045 : 0.011) * s;
      const ang = ((i * 36 + 90) * Math.PI) / 180;
      star.push([rr2 * Math.cos(ang), rr2 * Math.sin(ang)]);
    }
    glow(
      b.extrude(star, { at: P(x, top + 0.006 * s, z), x: [1, 0, 0], thickness: 0.004, color: "#ffd84a" }),
      1.3,
    );
  }
  const leafA = mottle("#2f9a52", "#58c273", { size: 0.025, seed: 3 });
  const leafB = mottle("#2b8f6a", "#4fc29a", { size: 0.025, seed: 8 });
  tree(-0.225, 0.07, 1.25, leafA, [RED, YELLOW, WHITE]);
  tree(0.235, -0.03, 1.05, leafB, [PINK, YELLOW, BLUE]);
  tree(-0.21, -0.15, 0.85, leafB, [RED, WHITE]);
  tree(0.2, -0.17, 0.95, leafA, [ORANGE, PINK, WHITE]);

  const gd: [number, number, number, string][] = [
    [-0.15, 0.15, 0.017, RED],
    [-0.19, 0.145, 0.012, YELLOW],
    [0.155, 0.15, 0.018, GREEN],
    [0.19, 0.165, 0.012, PINK],
    [-0.19, -0.13, 0.018, BLUE],
    [0.17, -0.12, 0.016, ORANGE],
    [-0.1, -0.16, 0.014, PINK],
    [0.08, -0.17, 0.015, YELLOW],
    [0.0, -0.19, 0.018, RED],
    [-0.27, -0.06, 0.014, GREEN],
    [0.285, 0.1, 0.015, BLUE],
    [0.275, -0.14, 0.013, RED],
    [-0.28, 0.17, 0.013, ORANGE],
    [-0.04, 0.12, 0.0001, RED],
  ];
  for (const [x, z, r, c] of gd) if (r > 0.001) gumdrop(x, z, r, c);

  function lolli(x: number, z: number, tex: number, yaw: number, r = 0.03) {
    const nrm = P(Math.sin(yaw), 0, Math.cos(yaw));
    b.rod(P(x, SNOW_TOP - 0.003, z), P(x, SNOW_TOP + 0.075, z), 0.0026, CREAM, { sides: 5 });
    const c = P(x, SNOW_TOP + 0.075 + r * 0.8, z);
    disc(c, nrm, r * 0.98, 0.005, WHITE, 14);
    for (const f of [1, -1])
      b.part(new THREE.CircleGeometry(r * 0.98, 14), "#ffffff", {
        at: c.clone().addScaledVector(nrm, f * 0.00262),
        dir: nrm.clone().multiplyScalar(f),
        axis: "z",
        texture: LOLLI[tex],
      });
    ball(P(x, SNOW_TOP + 0.075 - 0.002, z), 0.005, tex === 1 ? PINK : BLUE);
  }
  lolli(-0.28, 0.2, 0, 0.5);
  lolli(0.285, 0.18, 1, -0.4);
  lolli(0.0, -0.2, 2, 0.1, 0.034);
  lolli(-0.29, -0.12, 1, 0.8, 0.026);

  // =============================================================================================================
  // Gingerbread folk
  const S = 0.0105;
  const FIG: [number, number][] = [
    [-0.35, 0],
    [-1.9, 0.15],
    [-1.75, 2.3],
    [-1.4, 3.3],
    [-3.1, 3.35],
    [-3.7, 3.9],
    [-3.65, 4.55],
    [-3.2, 4.85],
    [-1.3, 4.75],
    [-0.9, 5.0],
    [-1.25, 5.6],
    [-1.45, 6.5],
    [-1.1, 7.3],
    [-0.45, 7.7],
    [0.45, 7.7],
    [1.1, 7.3],
    [1.45, 6.5],
    [1.25, 5.6],
    [0.9, 5.0],
    [1.3, 4.75],
    [3.2, 4.85],
    [3.65, 4.55],
    [3.7, 3.9],
    [3.1, 3.35],
    [1.4, 3.3],
    [1.75, 2.3],
    [1.9, 0.15],
    [0.35, 0],
  ];
  function ginger(x: number, z: number, phiDeg: number, accent: string, hairBow: boolean) {
    const phi = (phiDeg * Math.PI) / 180;
    const o = P(x, SNOW_TOP - 0.001, z);
    const xd = P(Math.cos(phi), 0, -Math.sin(phi));
    const n = P(Math.sin(phi), 0, Math.cos(phi));
    const T = 0.009;
    const pt = (u: number, v: number, w = T / 2 + 0.0012) =>
      o.clone().addScaledVector(xd, u * S).addScaledVector(UP, v * S).addScaledVector(n, w);
    const outline: ([number, number] | [number, number, "sharp"])[] = [[0, 2.0 * S, "sharp"]];
    for (const [u, v] of FIG) outline.push([u * S, v * S]);
    b.extrude(outline, { at: o, x: xd, y: [0, 1, 0], thickness: T, bevel: 0.0018, smoothing: 1, color: GINGER_FIG });
    // face
    for (const k of [1, -1]) ball(pt(k * 0.5, 6.85), 0.0022, WHITE);
    b.sweep(
      catmull([pt(-0.65, 6.15), pt(-0.3, 5.9), pt(0, 5.82), pt(0.3, 5.9), pt(0.65, 6.15)]),
      0.0011,
      { color: WHITE, sides: 4 },
    );
    for (const k of [1, -1]) ball(pt(k * 0.85, 6.3), 0.0025, PINK, [1, 1, 0.5]);
    // buttons
    [RED, GREEN, BLUE].forEach((c, i) => ball(pt(0, 4.2 - i * 0.85), 0.0034, c, [1, 1, 0.6]));
    // cuffs and ankle frills
    for (const k of [1, -1]) {
      b.rod(pt(k * 2.75, 3.4), pt(k * 2.75, 4.78), 0.0011, WHITE, { sides: 4 });
      b.rod(pt(k * 1.8, 0.95), pt(k * 0.28, 0.95), 0.0011, WHITE, { sides: 4 });
      ball(pt(k * 3.3, 4.1), 0.0013, WHITE);
    }
    // bow
    const bc = hairBow ? pt(0.95, 7.2, T / 2 + 0.003) : pt(0, 4.95, T / 2 + 0.003);
    for (const k of [1, -1])
      ballO(bc.clone().addScaledVector(xd, k * 0.0045), 0.0042, accent, [1, 0.8, 0.5], n);
    ball(bc.clone().addScaledVector(n, 0.001), 0.0026, accent);
  }
  ginger(0.125, 0.19, -22, RED, false);
  ginger(-0.115, 0.195, 22, PINK, true);

  return b.root;
}
```