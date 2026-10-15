```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, paint, polyline, rng, svg } from "agentic-3js-builder";
import type { ColorInput, Joint } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";
import { gaugeTexture, gearGeometry } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Hex-Rider Chopper",
  description:
    "A long-raked custom chopper in a hero-shooter style: cel-shaded orange and gunmetal bodywork, cyan flame decals, a glowing hex energy core, neon rims and underglow, ape-hanger bars, a sissy-bar pennant and a hexagonal garage pad with props.",
};

type V3 = [number, number, number];

// ------------------------------------------------------------------ palette (two-tone cel paints)
const ORANGE = cel("#ff9a1f", "#e0561c");
const ORANGE_D = cel("#e8710f", "#b3430f");
const NAVY = cel("#3a4868", "#232c47");
const NAVY_D = cel("#262e46", "#161b2d");
const CHROME = cel("#eef3fc", "#8896c0");
const ALU = cel("#a7b2cf", "#616e92");
const CREAM = cel("#fff2d6", "#efcf9a");
const RUBBER = cel("#2a2d3a", "#191b25");
const RUBBER_L = cel("#3d4254", "#262a39");
const LEATHER = cel("#8a512c", "#58301b");
const LEATHER_L = cel("#a2653a", "#6a3b22");
const BLACK = cel("#222633", "#12141c");
const TEAL = "#38e6ff";
const AMBER = "#ffbf3c";
const RED = "#ff3b4e";
const WHITE = "#ffffff";

// ------------------------------------------------------------------ small helpers
const PL = 0.04; // thickness of the garage pad the bike stands on
const v = (x: number, y: number, z: number): V3 => [x, y + PL, z];
const fr = (x: number) => x - Math.floor(x);
const norm = (d: V3): V3 => {
  const l = Math.hypot(d[0], d[1], d[2]);
  return [d[0] / l, d[1] / l, d[2] / l];
};
const off = (p: V3, d: V3, k: number): V3 => {
  const n = norm(d);
  return [p[0] + n[0] * k, p[1] + n[1] * k, p[2] + n[2] * k];
};
const mixp = (a: V3, c: V3, t: number): V3 => [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
const keys = (a: number[], t: number) => {
  const x = t * (a.length - 1);
  const i = Math.min(Math.floor(x), a.length - 2);
  return a[i] + (a[i + 1] - a[i]) * (x - i);
};
const hexPts = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
/** Points on a circle around the X axis through c, at x offset dx. */
const circ = (c: V3, r: number, dx: number, n = 16): V3[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [c[0] + dx, c[1] + r * Math.cos(a), c[2] + r * Math.sin(a)] as V3;
  });
/** Arc of points around the X axis through c, angles from vertical in degrees, positive toward +Z. */
const fenderPts = (c: V3, rr: number, a0: number, a1: number, n: number): V3[] =>
  Array.from({ length: n }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / (n - 1)) * Math.PI) / 180;
    return [0, c[1] + rr * Math.cos(a), c[2] + rr * Math.sin(a)] as V3;
  });

// ------------------------------------------------------------------ textures
function makeTextures() {
  const rnd = rng(5);
  const FLAME = svg(
    `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#1b9fc2"/><stop offset="1" stop-color="#8ff3ff"/></linearGradient></defs>
      <path d="M6 72 L6 32 C28 40 42 24 70 26 C95 28 110 14 150 10 C138 22 142 30 128 38 C150 36 170 30 196 32 C172 46 160 52 140 58 C160 60 176 64 194 72 C140 76 120 70 100 74 C70 78 40 72 6 72Z" fill="url(#g)" stroke="#1b1f2e" stroke-width="4" stroke-linejoin="round"/>
      <path d="M16 66 L16 42 C34 46 46 34 70 36 C92 38 108 26 138 22 C130 32 134 38 124 44 C142 44 160 40 180 42 C160 52 148 56 134 60 C150 62 164 64 178 66 C140 68 120 62 100 66 C70 70 40 66 16 66Z" fill="#e9fdff" opacity="0.9"/>
    </svg>`,
    { size: 256 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,4 90,27 90,73 50,96 10,73 10,27" fill="#262e46" stroke="#ff9a1f" stroke-width="7" stroke-linejoin="round"/>
      <polygon points="50,16 79,33 79,67 50,84 21,67 21,33" fill="none" stroke="#38e6ff" stroke-width="2.5"/>
      <path d="M57 20 L31 56 H49 L43 82 L71 42 H54Z" fill="#ff9a1f" stroke="#fff2d6" stroke-width="2.5" stroke-linejoin="round"/>
    </svg>`,
    { size: 128 },
  );
  const LENS = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="r"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#9ff6ff"/><stop offset="1" stop-color="#1fb4d6"/></radialGradient></defs>
      <circle cx="50" cy="50" r="49" fill="url(#r)"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#e9fdff" stroke-width="2"/>
      <circle cx="50" cy="50" r="28" fill="none" stroke="#38e6ff" stroke-width="2"/>
      <polygon points="${hexPts(50, 50, 17)}" fill="#ffffff" stroke="#38e6ff" stroke-width="2"/>
      <path d="M50 2 V98 M2 50 H98 M16 16 L84 84 M84 16 L16 84" stroke="#bff9ff" stroke-width="1.2" opacity="0.7"/>
    </svg>`,
    { size: 128 },
  );
  const HEXCORE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#0b2a3c"/>
      <polygon points="${hexPts(50, 50, 44)}" fill="#0f4a66" stroke="#38e6ff" stroke-width="4"/>
      <polygon points="${hexPts(50, 50, 30)}" fill="#1596bd" stroke="#8ff3ff" stroke-width="3"/>
      <polygon points="${hexPts(50, 50, 15)}" fill="#e9fdff" stroke="#38e6ff" stroke-width="2"/>
      <path d="M50 6 V20 M50 80 V94 M12 28 L24 35 M88 72 L76 65 M12 72 L24 65 M88 28 L76 35" stroke="#8ff3ff" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );
  let blades = "";
  for (let i = 0; i < 6; i++)
    blades += `<path transform="rotate(${i * 60} 50 50)" d="M50 50 C58 36 74 26 88 36 C80 48 66 54 50 50Z" fill="${i % 2 ? "#ff9a1f" : "#e0561c"}" stroke="#262e46" stroke-width="2"/>`;
  const FAN = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="#dfe6f6" stroke="#262e46" stroke-width="3"/>
      <circle cx="50" cy="50" r="42" fill="#8896c0"/>
      ${blades}
      <circle cx="50" cy="50" r="9" fill="#262e46"/><circle cx="50" cy="50" r="4" fill="#38e6ff"/>
    </svg>`,
    { size: 128 },
  );
  const TAIL = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#b0162a"/>
      <polygon points="${hexPts(50, 50, 40)}" fill="#ff5a68" stroke="#ffd0d4" stroke-width="3"/>
      <polygon points="${hexPts(50, 50, 20)}" fill="#ffffff"/>
    </svg>`,
    { size: 64 },
  );
  const PLATE = svg(
    `<svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="194" height="104" rx="14" fill="#fff2d6" stroke="#262e46" stroke-width="6"/>
      <text x="100" y="62" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="bold" font-size="40" fill="#262e46">ROAD RAGE</text>
      <rect x="18" y="76" width="164" height="6" fill="#ff9a1f"/>
      <text x="100" y="98" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="16" fill="#e0561c">HEX CITY 76</text>
    </svg>`,
    { size: 256 },
  );
  // hex-tile floor for the pad
  let cells = "";
  const dx = Math.sqrt(3) * 9;
  for (let i = 0; i < 20; i++)
    for (let j = -1; j < 10; j++) {
      const cx = j * dx + (i % 2 ? dx / 2 : 0);
      const cy = i * 13.5;
      const r = rnd();
      const fill = r < 0.05 ? "#ff9a1f" : r < 0.1 ? "#2fb6d6" : r < 0.4 ? "#3a4868" : r < 0.7 ? "#2f3b58" : "#28324d";
      cells += `<polygon points="${hexPts(cx, cy, 8.4)}" fill="${fill}" stroke="#151a2a" stroke-width="1.3"/>`;
    }
  const TILE = svg(`<svg viewBox="0 0 130 250" xmlns="http://www.w3.org/2000/svg"><rect width="130" height="250" fill="#151a2a"/>${cells}</svg>`, {
    size: 512,
  });
  const CAN = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="10" fill="#e8710f"/>
      <rect x="6" y="6" width="88" height="88" rx="8" fill="none" stroke="#fff2d6" stroke-width="4"/>
      <path d="M26 26 L74 74 M74 26 L26 74" stroke="#fff2d6" stroke-width="9" stroke-linecap="round"/>
      <polygon points="${hexPts(50, 50, 14)}" fill="#262e46" stroke="#38e6ff" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );
  const GAUGE = gaugeTexture({ label: "KM/H", needle: 40 });
  return { FLAME, EMBLEM, LENS, HEXCORE, FAN, TAIL, PLATE, TILE, CAN, GAUGE };
}

// ------------------------------------------------------------------ paints
const tirePaint = (cy: number, cz: number, R: number, H: number) =>
  paint((p, n) => {
    const dy = p.y - cy;
    const dz = p.z - cz;
    const rr = Math.hypot(dy, dz);
    if (Math.abs(n.x) > 0.55) {
      const m = (rr - (R - H)) / H;
      return m > 0.4 && m < 0.52 ? ORANGE_D : RUBBER;
    }
    const a = (Math.atan2(dy, dz) / (Math.PI * 2)) * 30 + (p.x > 0 ? 0 : 0.5);
    return fr(a) < 0.55 ? RUBBER_L : RUBBER;
  });

const SEAT = paint((p, n) => {
  if (n.y < 0.15) return BLACK;
  const u = fr((p.x + p.z) / 0.07);
  const w = fr((p.x - p.z) / 0.07);
  if (u < 0.05 || w < 0.05) return "#ffb23f";
  return (Math.floor((p.x + p.z) / 0.07) + Math.floor((p.x - p.z) / 0.07)) % 2 ? LEATHER : LEATHER_L;
});

const FENDER = paint((_p, _n, s) => {
  const e = Math.abs(Math.cos((s[1] * Math.PI) / 180));
  if (e < 0.28) return CREAM;
  if (s[0] > 0.8 && Math.floor(s[0] * 40) % 2 === 0) return BLACK;
  return ORANGE;
});

const TANK = countershade(ORANGE, NAVY_D, { level: -0.5, soft: 0.1 });

const PENNANT = paint((_p, _n, s) => (s[0] < 0.07 ? NAVY_D : s[0] < 0.12 ? CREAM : ORANGE));

const BARREL = paint((p) => {
  if (p.y > PL + 0.16 && p.y < PL + 0.3) {
    const a = Math.atan2(p.z + 0.4, p.x - 0.58) / (Math.PI * 2);
    return Math.floor(fr(a) * 16) % 2 ? BLACK : ORANGE;
  }
  return NAVY;
});

// ================================================================== build
export default function build() {
  const b = createBuilder({ name: "chopper" });
  const T = makeTextures();

  // ---- skeleton
  const FT = v(0, 1.05, 0.62); // top of the steering head
  const FA = v(0, 0.36, 1.12); // front axle
  const forkDir: V3 = [0, FA[1] - FT[1], FA[2] - FT[2]];
  const RA = v(0, 0.4, -0.85); // rear axle

  const chassis = b.joint("chassis", { at: v(0, 0.55, 0) });
  const steer = b.joint("steer", { parent: chassis, at: FT, aim: FA });
  const kick = b.joint("kickstand", { parent: chassis, at: v(0.18, 0.3, -0.25), aim: v(0.18, 0.27, -0.62), role: "hinge" });

  // ---- wheels
  const wheel = (name: string, parent: Joint, c: V3, Rr: number, W: number, H: number, rimW: number) => {
    const j = b.joint(name, { parent, at: c, dir: [1, 0, 0] });
    const ri = Rr - H;
    const h = W / 2;
    const tire: [number, number][] = [
      [ri, -h * 0.8],
      [ri + 0.025, -h],
      [Rr - H * 0.45, -h * 0.97],
      [Rr - 0.012, -W * 0.36],
      [Rr, -W * 0.16],
      [Rr, W * 0.16],
      [Rr - 0.012, W * 0.36],
      [Rr - H * 0.45, h * 0.97],
      [ri + 0.025, h],
      [ri, h * 0.8],
    ];
    b.lathe(tire, { at: c, axis: [1, 0, 0], segments: 24, smoothing: 1, color: tirePaint(c[1], c[2], Rr, H), bone: j });
    const rim: [number, number][] = [
      [ri - 0.02, -rimW / 2],
      [ri + 0.014, -rimW / 2],
      [ri + 0.014, rimW / 2],
      [ri - 0.02, rimW / 2],
    ];
    b.lathe(rim, { at: c, axis: [1, 0, 0], segments: 24, color: CHROME, bone: j });
    b.ring(j, { count: 6, radius: ri - 0.004 }, (it) => {
      b.rod(j, it, [0.026, 0.017], ORANGE, { bone: j });
    });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, rimW + 0.05, 10), CHROME, { bone: j, at: c, dir: [1, 0, 0] });
    for (const s of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), ORANGE, {
        bone: j,
        at: [c[0] + s * (rimW / 2 + 0.04), c[1], c[2]],
        dir: [1, 0, 0],
      });
      const ring = b.sweep(catmull(circ(c, ri - 0.03, s * (rimW / 2), 16), { closed: true }), 0.006, {
        color: TEAL,
        bone: j,
        sides: 5,
      });
      glow(ring, 1.4);
    }
    return j;
  };
  const wheelF = wheel("wheelF", steer, FA, 0.36, 0.13, 0.11, 0.09);
  const wheelR = wheel("wheelR", chassis, RA, 0.4, 0.26, 0.14, 0.2);

  // brakes
  b.lathe(
    [
      [0.07, 0],
      [0.19, 0],
      [0.19, 0.008],
      [0.07, 0.008],
    ],
    { at: [0.07, FA[1], FA[2]], axis: [1, 0, 0], segments: 20, color: CHROME, bone: wheelF },
  );
  b.part(new THREE.BoxGeometry(0.035, 0.07, 0.05), ORANGE, { bone: steer, at: [0.075, FA[1] + 0.1, FA[2] + 0.13], dir: [0, 1, -0.5] });
  b.lathe(
    [
      [0.07, 0],
      [0.18, 0],
      [0.18, 0.008],
      [0.07, 0.008],
    ],
    { at: [0.15, RA[1], RA[2]], axis: [1, 0, 0], segments: 20, color: CHROME, bone: wheelR },
  );
  b.part(new THREE.BoxGeometry(0.04, 0.06, 0.05), ORANGE, { bone: chassis, at: [0.15, RA[1] - 0.09, RA[2] + 0.13], dir: [0, 1, 0.5] });
  // axles
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.5, 8), CHROME, { bone: wheelR, at: RA, dir: [1, 0, 0] });
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8), NAVY, { bone: chassis, at: [s * 0.215, RA[1], RA[2]], dir: [1, 0, 0] });

  // ---- chain drive (gears from the clockwork kit)
  const sprR = gearGeometry({ teeth: 40, module: 0.0085, thickness: 0.016, spokes: 6, bore: 0.02 });
  b.part(sprR, NAVY_D, { bone: wheelR, at: [-0.15, RA[1], RA[2]], dir: [1, 0, 0] });
  const sprF = gearGeometry({ teeth: 14, module: 0.0085, thickness: 0.016, bore: 0.01 });
  b.part(sprF, ALU, { bone: chassis, at: v(-0.155, 0.4, -0.2), dir: [1, 0, 0] });
  for (const k of [1, -1])
    b.rod(v(-0.155, 0.4 + k * 0.062, -0.2), v(-0.15, 0.4 + k * 0.172, -0.85), 0.008, BLACK, { bone: chassis });

  // ---- fork
  for (const s of [1, -1]) {
    const top: V3 = [s * 0.115, FT[1], FT[2]];
    const bot: V3 = [s * 0.115, FA[1], FA[2]];
    b.rod(mixp(top, bot, 0.02), mixp(top, bot, 0.62), 0.021, CHROME, { bone: steer });
    b.rod(mixp(top, bot, 0.5), bot, 0.034, NAVY, { bone: steer });
    for (let i = 0; i < 4; i++)
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 8), RUBBER, { bone: steer, at: mixp(top, bot, 0.3 + i * 0.045), dir: forkDir });
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), ORANGE, { bone: steer, at: [s * 0.135, FA[1], FA[2]], dir: [1, 0, 0] });
    // headlight bracket + turn signal
    const hl0 = mixp(top, bot, 0.15);
    b.rod(hl0, [s * 0.1, 0.93 + PL, 0.87], 0.01, CHROME, { bone: steer });
    b.rod([s * 0.1, 0.93 + PL, 0.87], [s * 0.19, 0.9 + PL, 0.9], 0.008, CHROME, { bone: steer });
    glow(b.part(new THREE.SphereGeometry(0.024, 8, 6), AMBER, { bone: steer, at: [s * 0.19, 0.9 + PL, 0.9] }), 1.2);
    // front fender stays
    b.rod([s * 0.115, FA[1], FA[2]], [s * 0.085, FA[1] + 0.43 * Math.cos(0.8), FA[2] + 0.43 * Math.sin(0.8)], 0.01, CHROME, { bone: steer });
  }
  b.part(new THREE.BoxGeometry(0.32, 0.06, 0.1), NAVY_D, { bone: steer, at: mixp(FT, FA, 0.02), dir: forkDir });
  b.part(new THREE.BoxGeometry(0.3, 0.05, 0.09), NAVY_D, { bone: steer, at: mixp(FT, FA, 0.23), dir: forkDir });
  b.rod(mixp(FT, FA, 0.0), mixp(FT, FA, 0.24), 0.045, NAVY_D, { bone: chassis });

  // front fender
  b.sweep(catmull(fenderPts(FA, 0.43, -30, 85, 8)), (t) => [0.095 * (0.8 + 0.2 * Math.sin(Math.PI * t)), 0.014], {
    color: FENDER,
    bone: steer,
    sides: 12,
    caps: "flat",
  });

  // ---- headlight
  const HL: V3 = v(0, 0.93, 0.865);
  b.lathe(
    [
      [0, -0.13],
      [0.07, -0.115],
      [0.115, -0.06],
      [0.125, 0.03],
      [0.118, 0.075],
      [0, 0.075],
    ],
    { at: HL, axis: [0, 0, 1], segments: 14, color: CHROME, bone: steer, smoothing: 1 },
  );
  glow(b.part(new THREE.CircleGeometry(0.1, 18), WHITE, { bone: steer, at: [HL[0], HL[1], HL[2] + 0.078], dir: [0, 0, 1], axis: "z", texture: T.LENS }), 1.6);
  const rimPts: V3[] = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    return [HL[0] + 0.108 * Math.cos(a), HL[1] + 0.108 * Math.sin(a), HL[2] + 0.074] as V3;
  });
  b.sweep(catmull(rimPts, { closed: true }), 0.012, { color: ORANGE, bone: steer, sides: 6 });
  b.extrude(
    [
      [-0.15, 0],
      [0.15, 0],
      [0.1, 0.06],
      [0, 0.032],
      [-0.1, 0.06],
    ],
    { at: [HL[0], HL[1] + 0.105, HL[2] + 0.04], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, bevel: 0.006, color: ORANGE, bone: steer },
  );

  // ---- handlebars (ape hangers)
  const gaugeDir: V3 = norm([0, 0.45, -0.89]);
  const gaugeAt = v(0, 1.17, 0.53);
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.035, 12), NAVY_D, { bone: steer, at: gaugeAt, dir: gaugeDir });
  b.part(new THREE.CircleGeometry(0.044, 20), WHITE, { bone: steer, at: off(gaugeAt, gaugeDir, 0.019), dir: gaugeDir, axis: "z", texture: T.GAUGE });
  b.rod(v(0, 1.07, 0.6), gaugeAt, 0.014, CHROME, { bone: steer });
  for (const s of [1, -1]) {
    const bar = catmull([v(s * 0.1, 1.07, 0.6), v(s * 0.14, 1.22, 0.58), v(s * 0.24, 1.4, 0.54), v(s * 0.45, 1.47, 0.55), v(s * 0.6, 1.44, 0.65)]);
    b.sweep(bar, 0.015, { color: CHROME, bone: steer, sides: 8 });
    b.rod(bar.at(0.8), bar.at(1), 0.024, ORANGE, { bone: steer });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), CHROME, { bone: steer, at: off(v(s * 0.6, 1.44, 0.65), [s * 0.3, -0.1, 1], 0.012), dir: [s * 0.3, -0.1, 1] });
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.04, 8), NAVY, { bone: steer, at: v(s * 0.1, 1.07, 0.6), dir: [0, 1, 0] });
    // lever and mirror
    b.rod(v(s * 0.5, 1.46, 0.58), v(s * 0.55, 1.42, 0.75), 0.007, CHROME, { bone: steer });
    b.rod(v(s * 0.5, 1.48, 0.56), v(s * 0.56, 1.62, 0.5), 0.007, CHROME, { bone: steer });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.014, 12), CHROME, { bone: steer, at: v(s * 0.58, 1.66, 0.48), dir: [0, 0.3, -1] });
    b.part(new THREE.CylinderGeometry(0.044, 0.044, 0.012, 12), CREAM, { bone: steer, at: off(v(s * 0.58, 1.66, 0.48), [0, 0.3, -1], 0.004), dir: [0, 0.3, -1] });
  }

  // ---- frame
  const spine = catmull([mixp(FT, FA, 0.12), v(0, 0.97, 0.3), v(0, 0.86, -0.1), v(0, 0.62, -0.5), v(0, 0.46, -0.8)]);
  b.sweep(spine, 0.03, { color: NAVY_D, bone: chassis, sides: 8 });
  b.sweep(catmull([mixp(FT, FA, 0.22), v(0, 0.7, 0.55), v(0, 0.48, 0.34), v(0, 0.4, 0.2)]), 0.034, { color: NAVY_D, bone: chassis, sides: 8 });
  for (const s of [1, -1]) {
    b.sweep(catmull([v(0, 0.42, 0.34), v(s * 0.14, 0.36, 0.2), v(s * 0.14, 0.33, -0.15), v(s * 0.16, 0.37, -0.55), v(s * 0.2, 0.4, -0.85)]), 0.026, {
      color: NAVY_D,
      bone: chassis,
      sides: 8,
    });
    b.sweep(catmull([v(s * 0.03, 0.72, -0.5), v(s * 0.12, 0.58, -0.68), v(s * 0.2, 0.4, -0.85)]), 0.022, { color: NAVY_D, bone: chassis, sides: 8 });
    // forward controls
    b.rod(v(s * 0.12, 0.4, 0.42), v(s * 0.24, 0.35, 0.62), 0.016, CHROME, { bone: chassis });
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.15, 8), CHROME, { bone: chassis, at: v(s * 0.28, 0.35, 0.62), dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8), ORANGE, { bone: chassis, at: v(s * 0.36, 0.35, 0.62), dir: [1, 0, 0] });
    // underglow
    b.rod(v(s * 0.16, 0.27, 0.35), v(s * 0.16, 0.27, -0.45), 0.012, TEAL, { bone: chassis });
    glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), TEAL, { bone: chassis, at: v(s * 0.16, 0.27, 0.35) }), 1.4);
    b.rod(v(s * 0.16, 0.27, 0.3), v(s * 0.14, 0.35, 0.2), 0.008, NAVY_D, { bone: chassis });
    b.rod(v(s * 0.16, 0.27, -0.4), v(s * 0.15, 0.34, -0.2), 0.008, NAVY_D, { bone: chassis });
  }
  const underL = b.rod(v(0.16, 0.27, 0.34), v(0.16, 0.27, -0.44), 0.011, TEAL, { bone: chassis });
  const underR = b.rod(v(-0.16, 0.27, 0.34), v(-0.16, 0.27, -0.44), 0.011, TEAL, { bone: chassis });
  glow(underL, 1.6);
  glow(underR, 1.6);

  // ---- engine: V-twin
  const CR = v(0, 0.46, 0.02);
  b.frustumBox(v(0, 0.45, 0.2), v(0, 0.45, -0.2), [0.26, 0.28], [0.26, 0.28], { color: ALU, bone: chassis });
  b.part(new THREE.BoxGeometry(0.24, 0.1, 0.3), NAVY_D, { bone: chassis, at: v(0, 0.28, 0.0) });
  for (const dd of [
    [0, 0.862, 0.507],
    [0, 0.862, -0.507],
  ] as V3[]) {
    const d = norm(dd);
    const a0 = off(CR, d, 0.07);
    const a1 = off(CR, d, 0.4);
    b.rod(a0, a1, 0.075, NAVY_D, { bone: chassis });
    for (let i = 0; i < 6; i++)
      b.part(new THREE.CylinderGeometry(0.112, 0.112, 0.012, 10), ALU, { bone: chassis, at: mixp(a0, a1, 0.1 + i * 0.15), dir: d });
    b.rod(a1, off(a1, d, 0.09), 0.095, ALU, { bone: chassis });
    b.part(new THREE.BoxGeometry(0.24, 0.06, 0.17), ORANGE, { bone: chassis, at: off(a1, d, 0.12), dir: d });
    b.rod(off(a1, d, 0.14), off(off(a1, d, 0.14), [0.4, 1, 0], 0.06), 0.008, CHROME, { bone: chassis });
    for (const s of [1, -1])
      b.part(new THREE.SphereGeometry(0.014, 6, 4), CHROME, { bone: chassis, at: off(a1, d, 0.152), });
    void 0;
  }
  // carb + air cleaner
  const carbY = CR[1] + 0.36;
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 8), CHROME, { bone: chassis, at: [0, carbY, CR[2]], dir: [1, 0, 0] });
  b.rod([0, carbY, CR[2]], [-0.16, carbY, CR[2]], 0.03, CHROME, { bone: chassis });
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.115, 0.02],
      [0.115, 0.07],
      [0.09, 0.1],
      [0, 0.105],
    ],
    { at: [-0.15, carbY, CR[2]], axis: [-1, 0, 0], segments: 16, color: CHROME, bone: chassis, smoothing: 1 },
  );
  b.part(new THREE.CircleGeometry(0.085, 16), WHITE, { bone: chassis, at: [-0.258, carbY, CR[2]], dir: [-1, 0, 0], axis: "z", texture: T.FAN });
  // primary cover (right) with emblem
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.07, 14), ORANGE, { bone: chassis, at: [-0.165, CR[1] - 0.02, 0.04], dir: [1, 0, 0] });
  b.part(new THREE.CircleGeometry(0.09, 16), WHITE, { bone: chassis, at: [-0.2, CR[1] - 0.02, 0.04], dir: [-1, 0, 0], axis: "z", texture: T.EMBLEM });
  // hex energy core (left)
  b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 6), NAVY_D, { bone: chassis, at: [0.16, CR[1], CR[2]], dir: [1, 0, 0], flat: true });
  glow(b.part(new THREE.CircleGeometry(0.12, 6), WHITE, { bone: chassis, at: [0.187, CR[1], CR[2]], dir: [1, 0, 0], axis: "z", texture: T.HEXCORE }), 1.6);
  b.ring(
    { at: [0.19, CR[1], CR[2]], axis: [1, 0, 0] },
    { count: 6, radius: 0.145 },
    (it) => {
      b.part(new THREE.SphereGeometry(0.01, 6, 4), CHROME, { bone: chassis, at: it.at });
    },
  );

  // ---- exhaust (a pipe each side) with glowing tips
  const pipeR = [0.03, 0.035, 0.038, 0.04, 0.042, 0.046, 0.075];
  const hy = CR[1] + 0.862 * 0.42;
  const hz = CR[2] + 0.507 * 0.42;
  for (const s of [1, -1]) {
    const pp = catmull([
      [s * 0.09, hy, hz],
      [s * 0.17, hy - 0.06, hz + 0.08],
      [s * 0.24, hy - 0.22, hz + 0.07],
      [s * 0.28, 0.42 + PL, 0.12],
      [s * 0.29, 0.37 + PL, -0.3],
      [s * 0.29, 0.38 + PL, -0.9],
      [s * 0.29, 0.42 + PL, -1.3],
    ]);
    b.sweep(pp, pipeR, { color: CHROME, bone: chassis, sides: 10, caps: { start: "round", end: "flat" } });
    b.sweep(pp.slice(0.45, 0.82), 0.056, { color: NAVY, bone: chassis, sides: 10, caps: "flat" });
    for (const t of [0.5, 0.6, 0.7, 0.8])
      b.part(new THREE.CylinderGeometry(keys(pipeR, t) + 0.024, keys(pipeR, t) + 0.024, 0.02, 10), ORANGE, {
        bone: chassis,
        at: pp.at(t),
        dir: pp.tangentAt(t),
      });
    glow(b.part(new THREE.CircleGeometry(0.062, 10), TEAL, { bone: chassis, at: [s * 0.29, 0.42 + PL, -1.302], dir: [0, 0, -1], axis: "z" }), 1.8);
  }

  // ---- fuel tank
  const tank = b.loft(
    [
      { at: v(0, 1.0, 0.56), w: 0.16, h: 0.18 },
      { at: v(0, 1.07, 0.4), w: 0.3, h: 0.27 },
      { at: v(0, 1.08, 0.15), w: 0.35, h: 0.29 },
      { at: v(0, 1.04, -0.05), w: 0.28, h: 0.24 },
      { at: v(0, 0.99, -0.22), w: 0.14, h: 0.15 },
    ],
    { bone: chassis, color: TANK },
  );
  const tskin = b.surface(tank);
  for (const s of [1, -1]) {
    const hit = tskin.around(v(0, 1.07, 0.17)).at(s * 90, -8);
    if (hit) b.decal(tank, T.FLAME, { at: hit, up: [0, 1, 0], size: [0.46, 0.18], segments: 16, mirror: s < 0 });
  }
  const top = tskin.ray(v(0, 2, 0.3), [0, -1, 0]);
  if (top) b.stick(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 10), CHROME, top, { embed: 0.3 });
  const top2 = tskin.ray(v(0, 2, 0.02), [0, -1, 0]);
  if (top2) b.decal(tank, T.EMBLEM, { at: top2, up: [0, 0, 1], size: [0.12, 0.12], segments: 8 });
  const nose = tskin.ray(v(0, 1.0, 1.0), [0, 0, -1]);
  if (nose) b.stick(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 8), CHROME, nose, { embed: 0.3 });

  // ---- seat + sissy bar
  b.loft(
    [
      { at: v(0, 0.83, -0.1), w: 0.2, h: 0.07 },
      { at: v(0, 0.8, -0.28), w: 0.32, h: 0.1 },
      { at: v(0, 0.8, -0.5), w: 0.3, h: 0.1 },
      { at: v(0, 0.83, -0.66), w: 0.2, h: 0.07 },
    ],
    { bone: chassis, color: SEAT },
  );
  for (const s of [1, -1]) {
    b.sweep(catmull([v(s * 0.06, 0.78, -0.52), v(s * 0.1, 0.95, -0.78), v(s * 0.11, 1.15, -0.9), v(s * 0.1, 1.3, -0.9)]), 0.013, {
      color: CHROME,
      bone: chassis,
      sides: 8,
    });
  }
  b.rod(v(-0.1, 1.3, -0.9), v(0.1, 1.3, -0.9), 0.014, CHROME, { bone: chassis });
  b.part(new THREE.BoxGeometry(0.22, 0.16, 0.05), SEAT, { bone: chassis, at: v(0, 1.13, -0.86), dir: [0, 1, -0.2] });
  b.rod(v(0, 1.3, -0.9), v(0, 1.85, -0.9), 0.008, CHROME, { bone: chassis });
  glow(b.part(new THREE.SphereGeometry(0.026, 8, 6), TEAL, { bone: chassis, at: v(0, 1.86, -0.9) }), 1.6);
  b.extrude(
    [
      [0, 0],
      [0.46, 0.02],
      [0.37, 0.1],
      [0.46, 0.18],
      [0, 0.2],
    ],
    { at: v(0, 1.62, -0.9), x: [0, 0, -1], y: [0, 1, 0], thickness: 0.008, color: PENNANT, bone: chassis },
  );

  // ---- rear fender, taillight, plate
  b.sweep(catmull(fenderPts(RA, 0.46, 72, -84, 10).map((p) => [p[0], p[1] + 0, p[2]] as V3)), (t) => [0.17 * (0.78 + 0.22 * Math.sin(Math.PI * t)), 0.016], {
    color: FENDER,
    bone: chassis,
    sides: 12,
    caps: "flat",
  });
  for (const s of [1, -1])
    b.rod([s * 0.215, RA[1], RA[2]], [s * 0.14, RA[1] + 0.46 * Math.cos(0.87), RA[2] - 0.46 * Math.sin(0.87)], 0.011, CHROME, { bone: chassis });
  glow(b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.035, 6), RED, { bone: chassis, at: v(0, 0.47, -1.31), dir: [0, 0, -1], flat: true }), 1.5);
  glow(b.part(new THREE.CircleGeometry(0.036, 6), WHITE, { bone: chassis, at: v(0, 0.47, -1.3295), dir: [0, 0, -1], axis: "z", texture: T.TAIL }), 1.5);
  b.part(new THREE.BoxGeometry(0.21, 0.115, 0.008), CREAM, { bone: chassis, at: v(0, 0.345, -1.31) });
  b.part(new THREE.PlaneGeometry(0.19, 0.104), WHITE, { bone: chassis, at: v(0, 0.345, -1.3155), dir: [0, 0, -1], axis: "z", texture: T.PLATE });
  b.rod(v(0, 0.455, -1.3), v(0, 0.4, -1.31), 0.01, CHROME, { bone: chassis });

  // ---- kickstand (folded up)
  b.rod(v(0.18, 0.3, -0.25), v(0.18, 0.27, -0.62), 0.014, CHROME, { bone: kick });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 8), ORANGE, { bone: kick, at: v(0.18, 0.27, -0.63), dir: [0, 0.3, 1] });

  // ---- garage pad
  const hexOutline = (k: number): [number, number][] => [
    [0, -1.8 * k],
    [0.9 * k, -1.15 * k],
    [0.9 * k, 1.15 * k],
    [0, 1.8 * k],
    [-0.9 * k, 1.15 * k],
    [-0.9 * k, -1.15 * k],
  ];
  b.extrude(hexOutline(1), { at: [0, 0.013, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.026, bevel: 0.006, color: BLACK, bone: chassis });
  b.extrude(hexOutline(0.95), { at: [0, 0.033, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.014, bevel: 0.004, color: NAVY_D, bone: chassis });
  b.part(new THREE.PlaneGeometry(1.3, 2.5), WHITE, { bone: chassis, at: [0, PL + 0.0008, 0], dir: [0, 1, 0], up: [0, 0, -1], axis: "z", texture: T.TILE });
  const padRing = hexOutline(0.88).map(([x, z]) => [x, PL + 0.007, z] as V3);
  glow(b.sweep(polyline(padRing, { closed: true }), 0.008, { color: TEAL, bone: chassis, sides: 5 }), 1.5);

  // ---- props on the pad
  // hazard barrel
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.46, 14), BARREL, { bone: chassis, at: v(0.58, 0.23, -0.4) });
  for (const y of [0.08, 0.38])
    b.part(new THREE.CylinderGeometry(0.157, 0.157, 0.016, 14), NAVY_D, { bone: chassis, at: v(0.58, y, -0.4) });
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 10), BLACK, { bone: chassis, at: v(0.58, 0.47, -0.4) });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8), CHROME, { bone: chassis, at: v(0.62, 0.49, -0.36) });
  // jerry can
  const can = v(-0.6, 0.15, 0.5);
  b.part(new THREE.BoxGeometry(0.2, 0.3, 0.1), ORANGE_D, { bone: chassis, at: can, rotation: [0, 25, 0] });
  b.part(new THREE.PlaneGeometry(0.17, 0.17), WHITE, { bone: chassis, at: [can[0] + 0.058, can[1], can[2] + 0.047], dir: [Math.sin(0.436), 0, Math.cos(0.436)], axis: "z", texture: T.CAN });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 8), BLACK, { bone: chassis, at: [can[0] - 0.04, can[1] + 0.17, can[2] + 0.02] });
  b.sweep(
    catmull([
      [can[0] + 0.03, can[1] + 0.15, can[2] - 0.03],
      [can[0] + 0.05, can[1] + 0.22, can[2] - 0.04],
      [can[0] + 0.0, can[1] + 0.22, can[2] - 0.02],
      [can[0] - 0.02, can[1] + 0.15, can[2] - 0.01],
    ]),
    0.011,
    { color: NAVY_D, bone: chassis, sides: 6 },
  );
  // beacon pylon
  b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.04, 6), NAVY_D, { bone: chassis, at: v(-0.62, 0.02, -1.0), flat: true });
  b.rod(v(-0.62, 0.04, -1.0), v(-0.62, 0.7, -1.0), 0.022, NAVY, { bone: chassis });
  glow(b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.11, 6), TEAL, { bone: chassis, at: v(-0.62, 0.76, -1.0), flat: true }), 1.7);
  b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.02, 6), ORANGE, { bone: chassis, at: v(-0.62, 0.83, -1.0), flat: true });

  return b.root;
}
```