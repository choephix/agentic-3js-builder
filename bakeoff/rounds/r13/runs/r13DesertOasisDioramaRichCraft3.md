```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  paint,
  noise,
  mix,
  smoothstep,
  mottle,
  countershade,
  grain,
  svg,
  limb,
  catmull,
  bezier,
} from "agentic-3js-builder";
import type { Paint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Desert Oasis Diorama",
  description:
    "A low-poly whimsical desert oasis on a layered sand plinth: a turquoise pond ringed with rocks, reeds and lily pads, five palms with painted frond cards, three striped tents, a campfire with a hanging pot, and three rigged camels (two adults and a calf) in blankets.",
};

const D2R = Math.PI / 180;
const TAU = Math.PI * 2;
const par = (k: number) => ((k % 2) + 2) % 2;

// ---------------------------------------------------------------------------------------------------------------
// Palette
const CREAM = "#fff1cf";
const RED = "#d8503a";
const BLUE = "#2f6fb3";
const TEAL = "#2fb3a8";
const GOLD = "#f2b53a";
const OCHRE = "#e0953a";
const PURPLE = "#7a4fa0";
const PINK = "#ee7aa0";
const WOOD = "#7a4a26";
const DWOOD = "#4f2f18";
const IRON = "#2f2f3a";
const LEAF = "#43a047";

// ---------------------------------------------------------------------------------------------------------------
// Textures
function frondSvg() {
  let s = "";
  const n = 13;
  for (let i = 0; i < n; i++) {
    const y = 120 - i * 8.6;
    const len = 9 + 21 * Math.sin((Math.PI * (i + 1.2)) / (n + 1));
    const c1 = i % 2 ? "#3a9a45" : "#4fb34a";
    const c2 = i % 2 ? "#2f8a3e" : "#7bcf55";
    s += `<path d="M32 ${y} L${32 - len} ${y - 14} L32 ${y - 5}Z" fill="${c1}"/>`;
    s += `<path d="M32 ${y} L${32 + len} ${y - 14} L32 ${y - 5}Z" fill="${c2}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">${s}<path d="M32 3 L25 22 L39 22Z" fill="#4fb34a"/><path d="M32 128 L32 8" stroke="#b9d97a" stroke-width="2.6" fill="none"/></svg>`,
    { size: 192 },
  );
}

function rugSvg() {
  return svg(
    `<svg viewBox="0 0 100 64" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="64" fill="#a8322c"/>
    <rect x="4" y="4" width="92" height="56" fill="none" stroke="#f3dfa6" stroke-width="3"/>
    <rect x="10" y="10" width="80" height="44" fill="#7a2230"/>
    <polygon points="50,12 80,32 50,52 20,32" fill="#2f9c94"/>
    <polygon points="50,19 69,32 50,45 31,32" fill="#f2b53a"/>
    <polygon points="50,25 58,32 50,39 42,32" fill="#a8322c"/>
    <polygon points="14,14 22,14 14,22" fill="#f3dfa6"/><polygon points="86,14 78,14 86,22" fill="#f3dfa6"/>
    <polygon points="14,50 22,50 14,42" fill="#f3dfa6"/><polygon points="86,50 78,50 86,42" fill="#f3dfa6"/>
    <path d="M0 0 H100 M0 64 H100" stroke="#f3dfa6" stroke-width="3" stroke-dasharray="2 3"/>
  </svg>`,
    { size: 256 },
  );
}

function blanketSvg(c1: string, c2: string, c3: string) {
  let z = "";
  for (let i = 0; i < 5; i++) z += `<polygon points="${i * 8},38 ${i * 8 + 4},30 ${i * 8 + 8},38 ${i * 8 + 4},46" fill="${c3}"/>`;
  return svg(
    `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="60" fill="${c1}"/>
    <rect y="0" width="40" height="8" fill="${c3}"/>
    <rect y="10" width="40" height="3" fill="${c2}"/>
    <rect y="22" width="40" height="3" fill="${c2}"/>
    ${z}
    <rect y="52" width="40" height="8" fill="${c2}"/>
    <path d="M0 50 L5 56 L10 50 L15 56 L20 50 L25 56 L30 50 L35 56 L40 50" fill="${c3}"/>
  </svg>`,
    { size: 128 },
  );
}

function signSvg() {
  return svg(
    `<svg viewBox="0 0 100 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="48" rx="4" fill="#b9803f"/>
    <path d="M0 16 H100 M0 32 H100" stroke="#8e5d2b" stroke-width="1.5"/>
    <rect x="2" y="2" width="96" height="44" rx="3" fill="none" stroke="#4f2f18" stroke-width="3"/>
    <path d="M17 10 Q9 24 9 29 A8 8 0 0 0 25 29 Q25 24 17 10Z" fill="#35b8e0" stroke="#145a7a" stroke-width="1.5"/>
    <text x="63" y="32" text-anchor="middle" font-family="serif" font-weight="bold" font-size="20" fill="#3b1f0e">OASIS</text>
  </svg>`,
    { size: 256 },
  );
}

function emblemSvg() {
  return svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs><mask id="m"><rect width="64" height="64" fill="white"/><circle cx="40" cy="28" r="19" fill="black"/></mask></defs>
    <circle cx="30" cy="32" r="23" fill="#f2b53a" mask="url(#m)"/>
    <polygon points="47,18 49.5,25 57,25 51,29.5 53,37 47,32.5 41,37 43,29.5 37,25 44.5,25" fill="#f2b53a"/>
  </svg>`,
    { size: 128 },
  );
}

function doorSvg() {
  return svg(
    `<svg viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 90 L3 42 Q3 4 30 4 Q57 4 57 42 L57 90Z" fill="#f2b53a"/>
    <path d="M9 90 L9 42 Q9 10 30 10 Q51 10 51 42 L51 90Z" fill="#2b1810"/>
    <path d="M9 90 L9 48 L25 90Z" fill="#c8402f"/>
    <path d="M51 90 L51 48 L35 90Z" fill="#c8402f"/>
    <circle cx="30" cy="14" r="3" fill="#fff1cf"/>
  </svg>`,
    { size: 180 },
  );
}

function flagSvg(c: string, d: string) {
  return svg(
    `<svg viewBox="0 0 30 90" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 90 L30 90 L30 4 L15 26 L0 4 Z" fill="${c}"/>
    <rect y="48" width="30" height="8" fill="${d}"/>
    <circle cx="15" cy="72" r="6" fill="${d}"/>
  </svg>`,
    { size: 128 },
  );
}

function buntSvg() {
  return svg(
    `<svg viewBox="0 0 20 24" xmlns="http://www.w3.org/2000/svg"><path d="M1 23 L19 23 L10 2Z" fill="#ffffff"/></svg>`,
    { size: 64 },
  );
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "desert-oasis" });
  const R = rng(2024);
  const G = 0.2; // top of the sand plinth
  const root = b.joint("base", { at: [0, 0.1, 0] });

  const FROND = frondSvg();
  const RUG = rugSvg();
  const SIGN = signSvg();
  const EMBLEM = emblemSvg();
  const DOOR = doorSvg();
  const BUNT = buntSvg();
  const FLAG_R = flagSvg(RED, GOLD);
  const FLAG_B = flagSvg(BLUE, CREAM);
  const BL_A = blanketSvg("#d8503a", "#f2b53a", "#fff1cf");
  const BL_B = blanketSvg("#2f6fb3", "#fff1cf", "#f2b53a");
  const BL_C = blanketSvg("#8a4fb0", "#f5a3c0", "#fff1cf");

  // ---- helpers
  const put = (geo: THREE.BufferGeometry, color: string | Paint, at: number[], o: any = {}) =>
    b.part(geo, color, { bone: root, at, flat: true, ...o });
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const cone = (r: number, h: number, s = 8) => new THREE.ConeGeometry(r, h, s);
  const rock = (r: number) => new THREE.IcosahedronGeometry(r, 0);
  const rod = (a: number[], c: number[], r: number, col: string | Paint, o: any = {}) =>
    b.rod(a, c, r, col, { bone: root, ...o });
  const half = (seg = 10, rings = 5) => new THREE.SphereGeometry(1, seg, rings, 0, TAU, 0, Math.PI / 2);

  const blob = (rx: number, rz: number, n: number, jit: number, seed: number) => {
    const r = rng(seed);
    const pts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const k = 1 + (r() - 0.5) * 2 * jit;
      pts.push([Math.cos(a) * rx * k, Math.sin(a) * rz * k]);
    }
    return pts;
  };
  const flatShape = (outline: [number, number][], x: number, y: number, z: number, th: number, color: string | Paint) =>
    b.extrude(outline, {
      at: [x, y, z],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: th,
      smoothing: 1,
      color,
      bone: root,
    });

  // ---- sand and base
  const SAND = paint((p, n) => {
    const t = noise(p, 0.45, 3);
    let c = mix("#efcf8c", "#f7e2a8", t);
    const rip = 0.5 + 0.5 * Math.sin((p.x * 0.8 + p.z * 1.1 + noise(p, 0.5, 5) * 0.8) * 22);
    c = mix(c, "#dcb069", 0.55 * smoothstep(0.6, 0.95, rip) * smoothstep(0.1, 0.7, n.y));
    c = mix(c, "#c98f55", smoothstep(0.35, -0.5, n.y) * 0.55);
    return c;
  });
  const STRATA = ["#c28a4c", "#dcae6c", "#a8703a", "#e6c283"];
  const BASE_PAINT = paint((p, n) => {
    if (n.y > 0.6) return SAND;
    const k = Math.floor((p.y + (noise(p, 0.6, 8) - 0.5) * 0.05) / 0.035);
    return STRATA[((k % 4) + 4) % 4];
  });
  put(new THREE.CylinderGeometry(2.25, 2.1, G, 14), BASE_PAINT, [0, G / 2, 0]);

  const dune = (x: number, z: number, rx: number, rz: number, h: number, rot: number) =>
    put(half(12, 6), SAND, [x, G - 0.01, z], { scale: [rx, h, rz], rotation: [0, rot, 0] });
  dune(0.1, -1.62, 0.95, 0.5, 0.5, 8);
  dune(-0.55, -1.7, 0.55, 0.32, 0.32, -20);
  dune(-1.45, -1.0, 0.32, 0.3, 0.3, 0);
  dune(1.6, -0.85, 0.3, 0.3, 0.3, 30);
  dune(0.2, 1.85, 0.5, 0.25, 0.14, 5);
  dune(-0.8, 1.65, 0.45, 0.24, 0.15, -10);
  dune(1.05, -1.5, 0.45, 0.28, 0.26, 25);

  // ---- pond
  const PC = [0.05, 0.3];
  const GRASS = mottle("#5fae48", "#86c95a", { size: 0.22 });
  flatShape(blob(1.0, 0.78, 14, 0.06, 5), PC[0], G + 0.008, PC[1], 0.016, GRASS);
  flatShape(blob(0.72, 0.56, 12, 0.05, 6), PC[0], G + 0.012, PC[1], 0.024, "#c99a5e");
  const waterPaint = paint((p, _n, s) => {
    const d = Math.hypot(s[0] / 0.62, s[1] / 0.46);
    let c = mix("#58dcdc", "#1d8fb5", smoothstep(0.15, 1.0, d));
    const ring = Math.abs(((d * 5.5) % 1) - 0.5);
    if (ring > 0.46 && d > 0.2) c = mix(c, "#d8fbff", 0.5);
    if (noise(p, 0.07, 9) > 0.78) c = mix(c, "#ffffff", 0.6);
    return c;
  });
  flatShape(blob(0.62, 0.46, 12, 0.04, 7), PC[0], G + 0.02, PC[1], 0.03, waterPaint);

  // rocks round the pond
  const ROCK = mottle("#a6937e", "#7c6a5a", { size: 0.1 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU + (R() - 0.5) * 0.2;
    const k = 0.95 + R() * 0.12;
    const r = 0.045 + R() * 0.04;
    put(rock(1), ROCK, [PC[0] + Math.cos(a) * 0.72 * k, G + r * 0.35, PC[1] + Math.sin(a) * 0.56 * k], {
      scale: [r * 1.2, r * 0.8, r],
      rotation: [R() * 30, R() * 180, 0],
    });
  }
  // lily pads and a flower
  const pads = [
    [-0.2, 0.1],
    [0.25, -0.05],
    [0.12, 0.2],
  ];
  pads.forEach(([dx, dz], i) => {
    put(cyl(0.07, 0.07, 0.008, 8), "#3f9a4c", [PC[0] + dx, G + 0.04, PC[1] + dz], { rotation: [0, i * 20, 0] });
    put(cyl(0.012, 0.012, 0.01, 6), "#3f9a4c", [PC[0] + dx, G + 0.045, PC[1] + dz]);
  });
  put(cone(0.03, 0.045, 6), PINK, [PC[0] - 0.2, G + 0.065, PC[1] + 0.1]);
  put(sph(0.014), GOLD, [PC[0] - 0.2, G + 0.085, PC[1] + 0.1]);
  put(cone(0.026, 0.04, 6), "#ffffff", [PC[0] + 0.25, G + 0.062, PC[1] - 0.05]);

  // reeds & cattails
  const reeds = (x: number, z: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const bx = x + (R() - 0.5) * 0.14;
      const bz = z + (R() - 0.5) * 0.1;
      const hh = 0.22 + R() * 0.2;
      const lx = (R() - 0.5) * 0.12;
      const lz = (R() - 0.5) * 0.12;
      const len = Math.hypot(hh, lx, lz);
      b.spike([bx, G + 0.01, bz], [lx / len, hh / len, lz / len], len, 0.008, {
        color: i % 2 ? "#4f9a3c" : "#6cb04a",
        bone: root,
        sides: 5,
      });
      if (i % 3 === 0) {
        put(sph(0.014, 6, 4), "#6b3f1e", [bx + lx, G + 0.01 + hh, bz + lz], { scale: [1, 2.6, 1] });
      }
    }
  };
  reeds(0.55, 0.0, 7);
  reeds(-0.45, 0.62, 5);

  // ---- palms
  const palm = (x: number, z: number, h: number, lx: number, lz: number, sc: number, ring: number) => {
    const base = [x, G, z];
    const top = [x + lx, G + h, z + lz];
    const path = bezier(
      base,
      [x + lx * 0.1, G + h * 0.5, z + lz * 0.1],
      [x + lx * 0.7, G + h * 0.8, z + lz * 0.7],
      top,
    );
    const len = path.length;
    const trunkPaint = paint((p, n, s) => {
      const k = Math.floor((s[0] * len) / 0.055);
      const baseC = k % 2 === 0 ? "#a8794a" : "#8a5d36";
      const g = noise(p, 0.05, 4);
      return mix(baseC, "#5e3c20", 0.35 * smoothstep(0.55, 0.85, g) + 0.2 * smoothstep(0.2, -0.6, n.y));
    });
    b.sweep(path, [0.075 * sc, 0.042 * sc], { color: trunkPaint, bone: root, sides: 7, smooth: false });
    put(cyl(0.085 * sc, 0.12 * sc, 0.07, 7), "#8a5d36", [x, G + 0.03, z]);
    put(sph(0.075 * sc, 7, 5), "#5c7a2c", [top[0], top[1] + 0.01, top[2]], { scale: [1, 0.8, 1] });
    for (let i = 0; i < 3; i++) {
      const a = ring + (i * TAU) / 3;
      put(sph(0.035 * sc, 6, 4), "#5a3a1c", [top[0] + Math.cos(a) * 0.05 * sc, top[1] - 0.05 * sc, top[2] + Math.sin(a) * 0.05 * sc]);
    }
    const fan = (n: number, elev: number, phase: number, lean: number, bend: number, w: number, l: number) => {
      const fr: any[] = [];
      const outs: number[][] = [];
      const c = Math.cos(elev * D2R);
      const sn = Math.sin(elev * D2R);
      for (let i = 0; i < n; i++) {
        const a = phase + (i * TAU) / n;
        const ox = Math.cos(a);
        const oz = Math.sin(a);
        fr.push(frame(top, [ox * c, sn, oz * c]));
        outs.push([ox, 0, oz]);
      }
      b.cards(fr, FROND, {
        size: [w * sc, l * sc],
        lean,
        bend,
        flow: (_f: any, i: number) => outs[i],
        bone: root,
        vary: 0.12,
        rng: R,
        sink: 0.04,
        spin: 4,
      });
    };
    fan(9, 62, ring, 20, 65, 0.5, 0.7);
    fan(7, 22, ring + 0.3, 28, 85, 0.46, 0.62);
    fan(3, 85, ring + 0.9, 8, 30, 0.34, 0.46);
  };
  palm(-0.65, 0.0, 1.3, -0.18, -0.08, 1.0, 0.2);
  palm(0.85, 0.0, 1.45, 0.15, -0.1, 1.05, 0.5);
  palm(0.5, 1.0, 0.95, 0.22, 0.1, 0.85, 0.9);
  palm(-0.45, 1.0, 1.05, -0.2, 0.12, 0.9, 1.4);
  palm(0.0, -0.35, 1.1, 0.05, -0.25, 0.95, 0.7);

  // grass tufts and flowers
  const tuft = (x: number, z: number, col: string) => {
    for (let i = 0; i < 3; i++) {
      const lx = (R() - 0.5) * 0.12;
      const lz = (R() - 0.5) * 0.12;
      const hh = 0.07 + R() * 0.06;
      const len = Math.hypot(hh, lx, lz);
      b.spike([x + (R() - 0.5) * 0.03, G + 0.012, z + (R() - 0.5) * 0.03], [lx / len, hh / len, lz / len], len, 0.012, {
        color: col,
        bone: root,
        sides: 4,
      });
    }
  };
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU + R() * 0.2;
    const k = 0.78 + R() * 0.15;
    tuft(PC[0] + Math.cos(a) * 1.0 * k, PC[1] + Math.sin(a) * 0.78 * k, i % 2 ? "#3f8f3c" : "#5fb04a");
  }
  const flowerCols = ["#ffffff", PINK, "#ffe066", "#c58bff"];
  for (let i = 0; i < 12; i++) {
    const a = R() * TAU;
    const k = 0.8 + R() * 0.12;
    put(sph(0.016, 5, 4), flowerCols[i % 4], [PC[0] + Math.cos(a) * 1.0 * k, G + 0.03, PC[1] + Math.sin(a) * 0.78 * k]);
  }

  // ---- camp props
  const rug = (x: number, z: number, w: number, d: number, yawDeg: number) => {
    const f = [Math.sin(yawDeg * D2R), 0, Math.cos(yawDeg * D2R)];
    put(new THREE.PlaneGeometry(w, d), "#ffffff", [x, G + 0.012, z], {
      dir: [0, 1, 0],
      axis: "z",
      up: [-f[0], 0, -f[2]],
      texture: RUG,
      flat: false,
    });
  };
  const jar = (x: number, z: number, sc: number, c1: string, c2: string) => {
    const prof: [number, number][] = [
      [0, 0],
      [0.045 * sc, 0],
      [0.075 * sc, 0.06 * sc],
      [0.07 * sc, 0.12 * sc],
      [0.04 * sc, 0.18 * sc],
      [0.05 * sc, 0.21 * sc],
      [0, 0.21 * sc],
    ];
    b.lathe(prof, {
      at: [x, G, z],
      segments: 8,
      bone: root,
      color: paint((p) => (par(Math.floor((p.y - G) / (0.035 * sc))) === 0 ? c1 : c2)),
    });
  };
  const cushion = (x: number, z: number, c: string, yaw: number) =>
    put(sph(0.07, 8, 5), c, [x, G + 0.03, z], { scale: [1, 0.45, 0.85], rotation: [0, yaw, 0] });
  const WOODP = grain("#a06a36", "#7a4a24", { size: 0.03, axis: "x" });
  const crate = (x: number, z: number, s: number, yaw: number) => {
    put(box(s, s, s), WOODP, [x, G + s / 2, z], { rotation: [0, yaw, 0] });
    put(box(s * 1.04, s * 0.1, s * 1.04), DWOOD, [x, G + s * 0.92, z], { rotation: [0, yaw, 0] });
    put(box(s * 1.04, s * 0.1, s * 1.04), DWOOD, [x, G + s * 0.08, z], { rotation: [0, yaw, 0] });
  };
  const sack = (x: number, z: number, c: string) => {
    put(sph(0.07, 8, 6), c, [x, G + 0.055, z], { scale: [1, 1.05, 0.9] });
    put(cone(0.03, 0.05, 6), c, [x, G + 0.13, z]);
    put(cyl(0.02, 0.02, 0.01, 6), RED, [x, G + 0.115, z]);
  };

  // ---- cone tent
  function coneTent(x: number, z: number, r: number, h: number, doorYaw: number, A: string, B: string, trim: string, flagTex: THREE.Texture) {
    const wall = (y: number) => {
      const y0 = 0.05;
      const y1 = h * 0.82;
      const r0 = r * 0.97;
      const r1 = r * 0.3;
      return y <= y0 ? r0 : r0 + (r1 - r0) * Math.min(1, (y - y0) / (y1 - y0));
    };
    const outline: [number, number][] = [
      [0, 0],
      [r, 0],
      [r * 0.97, 0.05],
      [r * 0.3, h * 0.82],
      [0.03, h],
      [0, h],
    ];
    const stripePaint = paint((p) => {
      const a = Math.atan2(p.x - x, p.z - z);
      const k = Math.floor(((a + Math.PI) / TAU) * 16);
      if (p.y - G < 0.045) return trim;
      return par(k) === 0 ? A : B;
    });
    const tent = b.lathe(outline, { at: [x, G, z], segments: 8, color: stripePaint, bone: root });
    const dY = doorYaw * D2R;
    const dx = Math.sin(dY);
    const dz = Math.cos(dY);
    const hit = b.surface(tent).ray([x + dx * (r + 0.6), G + 0.17, z + dz * (r + 0.6)], [-dx, 0, -dz]);
    if (hit) b.decal(tent, DOOR, { at: hit, dir: [dx, 0, dz], size: [0.2, 0.3], bone: root });
    // top: pole, finial, pennant
    put(cyl(0.01, 0.012, 0.22, 6), WOOD, [x, G + h + 0.07, z]);
    put(sph(0.028, 6, 5), GOLD, [x, G + h + 0.19, z]);
    b.cards([frame([x, G + h + 0.15, z], [1, 0, 0])], flagTex, {
      size: [0.1, 0.3],
      lean: 0,
      flow: [0, 0, 1],
      bend: 25,
      bone: root,
      sink: 0,
    });
    // ropes and pegs
    for (let i = 0; i < 6; i++) {
      const a = i * (TAU / 6) + 0.3;
      let diff = Math.abs(a - dY) % TAU;
      if (diff > Math.PI) diff = TAU - diff;
      if (diff < 0.5) continue;
      const wr = wall(h * 0.55);
      const attach = [x + Math.sin(a) * wr, G + h * 0.55, z + Math.cos(a) * wr];
      const peg = [x + Math.sin(a) * (r + 0.3), G + 0.02, z + Math.cos(a) * (r + 0.3)];
      rod(attach, peg, 0.004, "#6a4a2a");
      put(cyl(0.01, 0.006, 0.08, 5), WOOD, [peg[0], G + 0.03, peg[2]]);
    }
    // hem tassel ring (gold knobs)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + 0.2;
      put(sph(0.014, 5, 4), GOLD, [x + Math.sin(a) * (r * 0.98), G + 0.05, z + Math.cos(a) * (r * 0.98)]);
    }
  }
  coneTent(-0.8, -0.8, 0.4, 0.62, 18, RED, CREAM, GOLD, FLAG_R);
  // in front of the cone tent
  rug(-0.8 + Math.sin(18 * D2R) * 0.62, -0.8 + Math.cos(18 * D2R) * 0.62, 0.34, 0.22, 18);
  jar(-1.12, -0.5, 1.1, "#c8603a", "#f3c27a");
  jar(-1.2, -0.4, 0.8, "#2f9c94", "#f3dfa6");
  sack(-0.45, -0.38, "#e8d4a0");
  crate(-0.38, -0.52, 0.09, 20);

  // ---- gable canopy tent
  function canopy(x: number, z: number, w: number, d: number) {
    const hF = 0.44;
    const hB = 0.34;
    const hR = 0.62;
    const xl = x - w / 2;
    const xr = x + w / 2;
    const zf = z + d / 2;
    const zb = z - d / 2;
    const roofPaint = paint((p) => (par(Math.floor((p.x - xl) / 0.12)) === 0 ? BLUE : CREAM));
    b.slab(
      [
        [xl - 0.06, G + hF - 0.02, zf + 0.08],
        [xr + 0.06, G + hF - 0.02, zf + 0.08],
        [xr + 0.06, G + hR, z],
        [xl - 0.06, G + hR, z],
      ],
      { color: roofPaint, thickness: 0.014, bone: root },
    );
    b.slab(
      [
        [xl - 0.06, G + hB, zb - 0.06],
        [xr + 0.06, G + hB, zb - 0.06],
        [xr + 0.06, G + hR, z],
        [xl - 0.06, G + hR, z],
      ],
      { color: roofPaint, thickness: 0.014, bone: root },
    );
    b.slab(
      [
        [xl, G + 0.01, zb - 0.04],
        [xr, G + 0.01, zb - 0.04],
        [xr, G + hB, zb - 0.04],
        [xl, G + hB, zb - 0.04],
      ],
      { color: "#3a64a8", thickness: 0.012, bone: root },
    );
    put(new THREE.PlaneGeometry(0.26, 0.26), "#ffffff", [x, G + 0.19, zb - 0.032], { texture: EMBLEM, flat: false });
    const post = (px: number, pz: number, hh: number) => {
      put(cyl(0.014, 0.017, hh, 6), WOOD, [px, G + hh / 2, pz]);
      put(sph(0.022, 6, 4), GOLD, [px, G + hh + 0.01, pz]);
    };
    post(xl, zf, hF);
    post(xr, zf, hF);
    post(xl, zb, hB);
    post(xr, zb, hB);
    post(xl, z, hR);
    post(xr, z, hR);
    rod([xl - 0.1, G + hR, z], [xr + 0.1, G + hR, z], 0.013, DWOOD);
    put(sph(0.024, 6, 4), GOLD, [xl - 0.1, G + hR, z]);
    put(sph(0.024, 6, 4), GOLD, [xr + 0.1, G + hR, z]);
    rod([xl - 0.06, G + hF - 0.02, zf + 0.08], [xr + 0.06, G + hF - 0.02, zf + 0.08], 0.008, GOLD);
    // bunting along the front eave
    const cols = ["#f2b53a", "#e8503a", "#2fb3a8"];
    for (let c = 0; c < 3; c++) {
      const fr: any[] = [];
      for (let i = c; i < 9; i += 3) {
        const t = i / 8;
        fr.push(frame([xl - 0.06 + t * (w + 0.12), G + hF - 0.03, zf + 0.08], [0, 1, 0]));
      }
      b.cards(fr, BUNT, { size: [0.075, 0.1], lean: 180, flow: [0, 0, 1], color: cols[c], bone: root, sink: 0 });
    }
    // interior
    rug(x, z + 0.02, 0.7, 0.44, 0);
    cushion(x - 0.22, z - 0.05, PINK, 15);
    cushion(x - 0.2, z + 0.1, TEAL, -10);
    cushion(x + 0.25, z - 0.08, PURPLE, 20);
    // lantern
    rod([x, G + hR - 0.01, z], [x, G + hR - 0.14, z], 0.004, "#3a2a1a");
    put(cone(0.035, 0.03, 6), GOLD, [x, G + hR - 0.155, z]);
    glow(put(cyl(0.032, 0.032, 0.08, 6), "#ffc65a", [x, G + hR - 0.2, z]), 1.4);
    put(cyl(0.036, 0.036, 0.012, 6), GOLD, [x, G + hR - 0.248, z]);
    // tea set
    const tx = x + 0.1;
    const tz = z + 0.07;
    put(cyl(0.1, 0.1, 0.01, 10), "#d9a43a", [tx, G + 0.02, tz]);
    put(sph(0.035, 8, 6), TEAL, [tx, G + 0.055, tz], { scale: [1, 0.9, 1] });
    put(cone(0.016, 0.02, 6), GOLD, [tx, G + 0.095, tz]);
    rod([tx + 0.025, G + 0.055, tz], [tx + 0.062, G + 0.08, tz], 0.007, TEAL);
    for (let i = 0; i < 3; i++) {
      const a = 1.5 + i * 0.9;
      put(cyl(0.015, 0.011, 0.022, 6), CREAM, [tx + Math.cos(a) * 0.07 - 0.02, G + 0.035, tz + Math.sin(a) * 0.05]);
    }
    // stakes
    for (const sx of [-1, 1]) {
      rod([sx > 0 ? xr + 0.06 : xl - 0.06, G + hF - 0.02, zf + 0.08], [sx > 0 ? xr + 0.2 : xl - 0.2, G + 0.02, zf + 0.25], 0.004, "#6a4a2a");
      put(cyl(0.01, 0.006, 0.08, 5), WOOD, [sx > 0 ? xr + 0.2 : xl - 0.2, G + 0.03, zf + 0.25]);
    }
    // flag on the ridge
    put(cyl(0.008, 0.008, 0.16, 5), WOOD, [xr + 0.1, G + hR + 0.06, z]);
    b.cards([frame([xr + 0.1, G + hR + 0.1, z], [1, 0, 0])], FLAG_B, {
      size: [0.08, 0.24],
      lean: 0,
      flow: [0, 0, 1],
      bend: 25,
      bone: root,
      sink: 0,
    });
  }
  canopy(0.85, -0.95, 0.8, 0.55);
  crate(1.3, -0.5, 0.1, 10);
  sack(1.12, -0.42, "#d9c08a");
  jar(1.4, -0.65, 1.0, "#a8322c", "#f3dfa6");

  // ---- dome tent
  function domeTent(x: number, z: number, r: number, h: number, doorYaw: number) {
    const outline: [number, number][] = [
      [0, 0],
      [r, 0],
      [r * 1.0, h * 0.35],
      [r * 0.8, h * 0.75],
      [r * 0.4, h * 0.96],
      [0, h],
    ];
    const pat = paint((p) => {
      const y = p.y - G;
      const a = Math.atan2(p.x - x, p.z - z);
      if (y < 0.04) return DWOOD;
      if (y > h * 0.2 && y < h * 0.34) {
        const zz = Math.abs(((a * 6) / TAU) % 1 - 0.5) * 2;
        return zz > (y - h * 0.2) / (h * 0.14) ? PURPLE : GOLD;
      }
      return OCHRE;
    });
    const t = b.lathe(outline, { at: [x, G, z], segments: 10, smoothing: 1, color: pat, bone: root });
    const dY = doorYaw * D2R;
    const dx = Math.sin(dY);
    const dz = Math.cos(dY);
    const hit = b.surface(t).ray([x + dx * (r + 0.5), G + 0.1, z + dz * (r + 0.5)], [-dx, 0, -dz]);
    if (hit) b.decal(t, DOOR, { at: hit, dir: [dx, 0, dz], size: [0.13, 0.2], bone: root });
    put(cyl(0.008, 0.01, 0.08, 6), WOOD, [x, G + h + 0.03, z]);
    put(sph(0.022, 6, 5), GOLD, [x, G + h + 0.08, z]);
    put(sph(0.02, 6, 4), PINK, [x, G + h + 0.12, z]);
  }
  domeTent(-1.65, -0.05, 0.3, 0.3, 50);
  jar(-1.35, 0.2, 0.8, "#2f9c94", "#f3c27a");

  // ---- campfire
  function campfire(x: number, z: number) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      put(rock(1), "#8d8274", [x + Math.cos(a) * 0.17, G + 0.025, z + Math.sin(a) * 0.17], {
        scale: [0.04, 0.03, 0.035],
        rotation: [0, i * 40, 0],
      });
    }
    for (let i = 0; i < 3; i++) {
      put(cyl(0.022, 0.022, 0.28, 6), DWOOD, [x, G + 0.04 + i * 0.012, z], { rotation: [0, i * 60 + 10, 90] });
    }
    glow(put(cone(0.09, 0.2, 5), "#ff8a1f", [x, G + 0.14, z], { rotation: [0, 20, 0] }), 1.3);
    glow(put(cone(0.055, 0.14, 5), "#ffd95a", [x, G + 0.12, z], { rotation: [0, 50, 0] }), 1.6);
    glow(put(cone(0.03, 0.1, 4), "#ffb03a", [x + 0.07, G + 0.1, z + 0.03]), 1.3);
    glow(put(cone(0.026, 0.09, 4), "#ffb03a", [x - 0.06, G + 0.09, z - 0.04]), 1.3);
    for (let i = 0; i < 4; i++) {
      glow(put(sph(0.008, 4, 3), "#ffcf6a", [x + (R() - 0.5) * 0.16, G + 0.26 + R() * 0.12, z + (R() - 0.5) * 0.16]), 1.8);
    }
    // tripod with a pot
    const apex = [x, G + 0.5, z];
    for (let i = 0; i < 3; i++) {
      const a = i * (TAU / 3) + 0.5;
      rod([x + Math.cos(a) * 0.3, G, z + Math.sin(a) * 0.3], apex, 0.008, WOOD);
    }
    rod(apex, [x, G + 0.37, z], 0.004, IRON);
    put(sph(0.065, 8, 6), IRON, [x, G + 0.31, z], { scale: [1, 0.85, 1] });
    put(cyl(0.06, 0.06, 0.012, 8), "#4a4a56", [x, G + 0.365, z]);
    put(sph(0.014, 5, 4), GOLD, [x, G + 0.38, z]);
  }
  campfire(-0.05, -0.95);
  cushion(-0.38, -1.15, RED, 20);
  cushion(0.3, -1.1, BLUE, -20);

  // ---- sign
  put(cyl(0.015, 0.018, 0.34, 6), WOOD, [0.3, G + 0.17, 1.35]);
  put(box(0.36, 0.15, 0.02), "#ffffff", [0.3, G + 0.3, 1.37], { texture: SIGN, rotation: [0, -12, 2], flat: false });
  put(sph(0.022, 6, 4), GOLD, [0.3, G + 0.355, 1.35]);

  // ---- cacti
  const cactus = (x: number, z: number, h: number, flower: boolean) => {
    const col = grain("#3f8f4f", "#62b865", { size: 0.025, axis: "y" });
    b.capsule([x, G + 0.03, z], [x, G + h, z], 0.045, col, { bone: root, sides: 6 });
    b.capsule([x, G + h * 0.42, z], [x + 0.09, G + h * 0.42, z], 0.03, col, { bone: root, sides: 6 });
    b.capsule([x + 0.09, G + h * 0.42, z], [x + 0.09, G + h * 0.68, z], 0.03, col, { bone: root, sides: 6 });
    b.capsule([x, G + h * 0.3, z], [x - 0.08, G + h * 0.3, z], 0.027, col, { bone: root, sides: 6 });
    b.capsule([x - 0.08, G + h * 0.3, z], [x - 0.08, G + h * 0.52, z], 0.027, col, { bone: root, sides: 6 });
    if (flower) {
      put(cone(0.03, 0.04, 6), PINK, [x, G + h + 0.06, z]);
      put(sph(0.015, 5, 4), GOLD, [x + 0.09, G + h * 0.68 + 0.04, z]);
    }
    for (let i = 0; i < 5; i++) {
      const a = i * 1.3;
      put(cone(0.006, 0.025, 4), CREAM, [x + Math.cos(a) * 0.045, G + 0.1 + i * h * 0.15, z + Math.sin(a) * 0.045], {
        dir: [Math.cos(a), 0.3, Math.sin(a)],
      });
    }
  };
  cactus(1.58, -0.28, 0.3, true);
  cactus(-1.75, -0.65, 0.2, false);

  // ---- scatter pebbles, rocks, dry tufts on free sand
  const zones: number[][] = [
    [0.05, 0.3, 1.05],
    [-0.8, -0.8, 0.6],
    [0.85, -0.95, 0.75],
    [-1.65, -0.05, 0.45],
    [-0.05, -0.95, 0.4],
    [-1.3, 0.7, 0.6],
    [1.3, 0.55, 0.6],
    [1.0, 1.2, 0.4],
    [0.3, 1.35, 0.25],
    [1.55, -0.3, 0.2],
    [-1.75, -0.65, 0.2],
    [0.1, -1.62, 0.9],
    [-1.45, -1.0, 0.35],
    [1.6, -0.85, 0.3],
    [0.2, 1.85, 0.5],
    [-0.8, 1.65, 0.45],
    [-0.55, -1.7, 0.4],
    [1.05, -1.5, 0.4],
  ];
  const free = (x: number, z: number, pad: number) =>
    Math.hypot(x, z) < 2.0 && zones.every(([zx, zz, zr]) => Math.hypot(x - zx, z - zz) > zr + pad);
  const spot = (pad: number) => {
    for (let t = 0; t < 40; t++) {
      const a = R() * TAU;
      const r = 0.3 + R() * 1.7;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (free(x, z, pad)) return [x, z];
    }
    return null;
  };
  const PEB = ["#a79684", "#8a7766", "#c2ac8a", "#6f6258"];
  for (let i = 0; i < 16; i++) {
    const s = spot(0.02);
    if (!s) continue;
    const r = 0.014 + R() * 0.02;
    put(rock(1), PEB[i % 4], [s[0], G + r * 0.3, s[1]], { scale: [r, r * 0.6, r * 0.85], rotation: [0, R() * 180, 0] });
  }
  for (let i = 0; i < 5; i++) {
    const s = spot(0.05);
    if (!s) continue;
    const r = 0.05 + R() * 0.05;
    put(rock(1), ROCK, [s[0], G + r * 0.3, s[1]], { scale: [r * 1.2, r * 0.8, r], rotation: [R() * 20, R() * 180, 0] });
  }
  for (let i = 0; i < 14; i++) {
    const s = spot(0.02);
    if (s) tuft(s[0], s[1], i % 2 ? "#b9a24a" : "#9c8a3c");
  }

  // ---- camels
  function camel(
    id: string,
    cx: number,
    cz: number,
    yawDeg: number,
    S: number,
    humps: number,
    fur: Paint,
    fur2: string,
    dark: string,
    blanketTex: THREE.Texture,
    capCol: string,
    trimCol: string,
  ) {
    const yaw = yawDeg * D2R;
    const cY = Math.cos(yaw);
    const sY = Math.sin(yaw);
    const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const T = (x: number, y: number, z: number): number[] => [cx + (cY * x + sY * z) * S, G + y * S, cz + (-sY * x + cY * z) * S];
    const Dv = (x: number, y: number, z: number): number[] => [cY * x + sY * z, y, -sY * x + cY * z];
    const Q = (rx = 0, ry = 0, rz = 0) =>
      qYaw.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rx * D2R, ry * D2R, rz * D2R)));
    const ell = (bone: any, at: number[], sx: number, sy: number, sz: number, color: string | Paint, q?: THREE.Quaternion) =>
      b.part(new THREE.SphereGeometry(1, 8, 6), color, {
        bone,
        at,
        scale: [sx * S, sy * S, sz * S],
        quat: q ?? Q(),
        flat: true,
      });

    // skeleton: body
    const hips = b.joint(`hips${id}`, { parent: root, at: T(0, 0.43, -0.3), dir: Dv(0, 0, 1) });
    const spine = b.chain(`spine${id}`, catmull([T(0, 0.43, -0.3), T(0, 0.45, -0.05), T(0, 0.46, 0.22)]), {
      parent: hips,
      role: "spine",
    });
    b.sweep(
      spine,
      (t: number) => {
        const k = Math.sin(Math.PI * (0.15 + 0.7 * t));
        return [S * (0.08 + 0.04 * k), S * (0.09 + 0.05 * k)];
      },
      { color: fur },
    );
    const mid = spine.joints[1];

    // humps and blanket
    const defs =
      humps === 1
        ? [[0, 0.56, 0.0, 0.095, 0.1, 0.11]]
        : [
            [0, 0.55, -0.1, 0.075, 0.085, 0.085],
            [0, 0.55, 0.11, 0.07, 0.08, 0.08],
          ];
    for (const [hx, hy, hz, sx, sy, sz] of defs) {
      ell(mid, T(hx, hy, hz), sx, sy, sz, fur, Q());
      b.part(half(8, 4), capCol, {
        bone: mid,
        at: T(hx, hy - 0.005, hz),
        scale: [(sx + 0.012) * S, (sy + 0.016) * S, (sz + 0.012) * S],
        quat: Q(),
        flat: true,
      });
    }
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.014 * S, 0.17 * S, 0.26 * S), "#ffffff", {
        bone: mid,
        at: T(s * 0.118, 0.4, 0.0),
        quat: Q(0, 0, s * 4),
        texture: blanketTex,
      });
      for (let i = 0; i < 3; i++) {
        b.part(new THREE.ConeGeometry(0.012 * S, 0.04 * S, 5), GOLD, {
          bone: mid,
          at: T(s * 0.128, 0.3, -0.09 + i * 0.09),
          quat: Q(180, 0, 0),
          flat: true,
        });
      }
    }

    // neck and head
    const neck = b.chain(
      `neck${id}`,
      catmull([T(0, 0.46, 0.22), T(0, 0.56, 0.33), T(0, 0.73, 0.37), T(0, 0.86, 0.43)]),
      { parent: spine, role: "neck" },
    );
    b.sweep(neck, [S * 0.075, S * 0.045], { color: fur });
    const head = b.joint(`head${id}`, { parent: neck, at: T(0, 0.86, 0.43), dir: Dv(0, -0.3, 1), role: "head" });
    const jaw = b.joint(`jaw${id}`, { parent: head, at: T(0, 0.83, 0.5), aim: T(0, 0.79, 0.64), role: "jaw" });
    ell(head, T(0, 0.89, 0.49), 0.062, 0.058, 0.085, fur, Q(20));
    ell(head, T(0, 0.85, 0.6), 0.048, 0.044, 0.07, fur2, Q(25));
    ell(head, T(0, 0.835, 0.665), 0.04, 0.03, 0.03, "#6e4a2c", Q(25));
    ell(jaw, T(0, 0.806, 0.585), 0.036, 0.022, 0.062, fur2, Q(22));
    ell(jaw, T(0, 0.82, 0.6), 0.03, 0.012, 0.05, "#5a2424", Q(22));
    ell(head, T(0, 0.945, 0.5), 0.02, 0.03, 0.03, dark, Q(0));
    for (const s of [1, -1]) {
      // nostrils
      ell(head, T(s * 0.018, 0.855, 0.685), 0.009, 0.007, 0.007, "#24150e");
      // ears
      b.part(new THREE.ConeGeometry(0.026 * S, 0.085 * S, 5), fur, {
        bone: head,
        at: T(s * 0.048, 0.945, 0.43),
        dir: Dv(s * 0.5, 1, -0.3),
        flat: true,
      });
      b.part(new THREE.ConeGeometry(0.014 * S, 0.06 * S, 5), "#e9a79b", {
        bone: head,
        at: T(s * 0.05, 0.945, 0.44),
        dir: Dv(s * 0.5, 1, -0.3),
        flat: true,
      });
      // eyes
      ell(head, T(s * 0.052, 0.9, 0.54), 0.024, 0.024, 0.024, "#fffaf0");
      ell(head, T(s * 0.064, 0.9, 0.555), 0.015, 0.016, 0.015, "#1b1210");
      ell(head, T(s * 0.07, 0.907, 0.567), 0.006, 0.006, 0.006, "#ffffff");
      ell(head, T(s * 0.052, 0.926, 0.535), 0.03, 0.009, 0.03, dark, Q(20, 0, s * 12));
    }
    b.part(new THREE.TorusGeometry(0.047 * S, 0.007 * S, 5, 10), trimCol, {
      bone: head,
      at: T(0, 0.85, 0.58),
      quat: Q(25),
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.012 * S, 5, 4), GOLD, { bone: head, at: T(0, 0.808, 0.595), flat: true });

    // legs
    for (const f of [1, -1]) {
      for (const s of [1, -1]) {
        const tag = `${f > 0 ? "F" : "H"}${s > 0 ? "L" : "R"}${id}`;
        const z = f > 0 ? 0.17 : -0.2;
        const hipP = T(s * 0.085, 0.39, z);
        const foot = T(s * 0.09, 0.035, z);
        const pts = limb(hipP, foot, [0.2 * S, 0.2 * S], Dv(0, 0, f > 0 ? 1 : -1));
        const leg = b.chain(`leg${tag}`, pts, {
          parent: f > 0 ? spine : hips,
          names: [`hip${tag}`, `knee${tag}`, `foot${tag}`],
          role: "leg",
          contact: [foot[0], G, foot[2]],
        });
        b.sweep(leg, [S * 0.052, S * 0.034], { color: fur });
        ell(leg.joints[1], [pts[1].x, pts[1].y, pts[1].z], 0.045, 0.045, 0.045, fur2);
        ell(leg.joints[leg.joints.length - 1], T(s * 0.09, 0.03, z + 0.012), 0.055, 0.03, 0.07, "#5a4030");
      }
    }

    // tail
    const tail = b.chain(`tail${id}`, catmull([T(0, 0.44, -0.36), T(0, 0.4, -0.44), T(0, 0.3, -0.46)]), {
      parent: hips,
      role: "tail",
    });
    b.sweep(tail, [S * 0.028, S * 0.012], { color: fur });
    ell(tail.joints[tail.joints.length - 1], T(0, 0.265, -0.465), 0.03, 0.055, 0.03, dark);
  }

  const furA = countershade(mottle("#c58b4a", "#d6a060", { size: 0.18, contrast: 0.6 }), "#ead2a0", { level: -0.15 });
  const furB = countershade(mottle("#a8723a", "#bd8a50", { size: 0.18, contrast: 0.6, seed: 4 }), "#d9b98a", { level: -0.15 });
  const furC = countershade(mottle("#e2bf88", "#efd2a0", { size: 0.14, contrast: 0.5, seed: 9 }), "#f6e6c4", { level: -0.15 });
  camel("A", -1.3, 0.7, 106, 1.0, 1, furA, "#e3bd84", "#7d5028", BL_A, RED, GOLD);
  camel("B", 1.3, 0.55, -101, 1.0, 2, furB, "#cfa66e", "#5e3a1c", BL_B, BLUE, RED);
  camel("C", 1.0, 1.2, -20, 0.62, 1, furC, "#f3dfb4", "#9a6a38", BL_C, PURPLE, TEAL);

  return b.root;
}
```