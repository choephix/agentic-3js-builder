```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  bezier,
  catmull,
  cells,
  createBuilder,
  grain,
  mix,
  mottle,
  noise,
  paint,
  rng,
  scales,
  smoothstep,
  spots,
  stripes,
  svg,
} from "agentic-3js-builder";
import type { Part } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type V = [number, number, number];
type Pt = [number, number] | [number, number, "sharp"];
type HitLike = { at: THREE.Vector3; n: THREE.Vector3 };
type PathLike = ReturnType<typeof catmull>;

const DEG = Math.PI / 180;
const tri = (x: number) => Math.abs((x - Math.floor(x)) * 2 - 1);

// flat colours
const WOOD = "#7a5232";
const WOOD_D = "#4a3426";
const CREAM = "#fff1d0";
const GOLD = "#e8b84a";
const IRON = "#4a3a34";
const ROOF_D = "#3b2c36";
const LEAF = "#4f9a46";

export const meta = {
  name: "Mushroom-House Village",
  description:
    "A storybook diorama: a round meadow plinth with five painted toadstool cottages, a town hall on a knoll with balcony and flag, stone paths, a well, a lily pond with a plank bridge, lamps with bunting, a fenced vegetable garden, flowers, grass tufts and glowing fairy mushrooms.",
};

export default function build() {
  const b = createBuilder({ name: "mushroom-village", paintSize: 2048 });
  const rand = rng(23);
  const R = 2.0;
  const GROUND = 0.24;

  // ------------------------------------------------------------------ textures
  const WIN_ROUND = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g" cx="50%" cy="65%" r="65%"><stop offset="0" stop-color="#fff3a6"/><stop offset="0.55" stop-color="#ffc94d"/><stop offset="1" stop-color="#ee8a2c"/></radialGradient></defs>
      <circle cx="50" cy="50" r="46" fill="url(#g)"/>
      <path d="M9 30 Q30 42 22 68 Q14 62 8 52 Z" fill="#d9483f"/>
      <path d="M91 30 Q70 42 78 68 Q86 62 92 52 Z" fill="#d9483f"/>
      <path d="M50 4 V96 M4 50 H96" stroke="#5a3820" stroke-width="6"/>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#5a3820" stroke-width="7"/>
    </svg>`,
    { size: 192 },
  );
  const WIN_ARCH = svg(
    `<svg viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#f29a38"/></linearGradient></defs>
      <path d="M4 88 V32 A26 26 0 0 1 56 32 V88 Z" fill="url(#g)" stroke="#5a3820" stroke-width="6" stroke-linejoin="round"/>
      <path d="M30 6 V88 M4 54 H56" stroke="#5a3820" stroke-width="4"/>
      <path d="M10 85 Q12 68 22 62 Q17 76 25 85Z" fill="#3d6a2a"/>
      <path d="M13 86 L16 76 L27 76 L29 86 Z" fill="#b5532f"/>
    </svg>`,
    { size: 192 },
  );
  const DOOR = svg(
    `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 100 V36 A27 27 0 0 1 57 36 V100 Z" fill="#f2f2f2" stroke="#6e6e6e" stroke-width="3"/>
      <path d="M18 100 V13 M30 100 V9 M42 100 V13" stroke="#a8a8a8" stroke-width="2"/>
      <rect x="3" y="58" width="17" height="6" fill="#707070"/>
      <rect x="3" y="82" width="17" height="6" fill="#707070"/>
      <circle cx="30" cy="34" r="8" fill="#808080" stroke="#d0d0d0" stroke-width="2"/>
      <path d="M30 26 V42 M22 34 H38" stroke="#d0d0d0" stroke-width="1.5"/>
    </svg>`,
    { size: 256 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="a" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3f7a35"/><stop offset="1" stop-color="#9ccc4e"/></linearGradient></defs>
      <path d="M4 50 Q6 26 1 6 Q13 24 14 50Z" fill="url(#a)"/>
      <path d="M13 50 Q14 20 20 2 Q26 22 27 50Z" fill="url(#a)"/>
      <path d="M25 50 Q28 28 38 10 Q36 32 33 50Z" fill="url(#a)"/>
      <path d="M9 50 Q15 34 12 22 Q19 36 20 50Z" fill="#6aa83f"/>
    </svg>`,
    { size: 128 },
  );
  const signTex = (text: string, fs: number) =>
    svg(
      `<svg viewBox="0 0 140 44" xmlns="http://www.w3.org/2000/svg"><text x="70" y="30" font-family="Georgia, serif" font-weight="bold" font-size="${fs}" text-anchor="middle" fill="#3a2210">${text}</text></svg>`,
      { size: 256 },
    );
  const SIGN_HALL = signTex("TOWN HALL", 21);
  const SIGN_BAKE = signTex("BAKERY", 25);
  const SIGN_POND = signTex("POND", 25);
  const BREAD = svg(
    `<svg viewBox="0 0 60 44" xmlns="http://www.w3.org/2000/svg"><ellipse cx="30" cy="24" rx="24" ry="14" fill="#e0a054" stroke="#6b3d1c" stroke-width="3"/><path d="M16 16 L22 30 M28 12 L34 32 M40 16 L44 30" stroke="#a96a2c" stroke-width="3" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M30 6 C10 6 4 28 6 34 L54 34 C56 28 50 6 30 6Z" fill="#d6402f" stroke="#5a2a1e" stroke-width="2.5" stroke-linejoin="round"/><circle cx="20" cy="20" r="4.5" fill="#fff4dc"/><circle cx="36" cy="15" r="3.5" fill="#fff4dc"/><circle cx="42" cy="26" r="4" fill="#fff4dc"/><path d="M22 34 H38 L40 54 Q30 58 20 54 Z" fill="#f3e2bd" stroke="#5a2a1e" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
    { size: 128 },
  );
  let ticks = "";
  for (let i = 0; i < 12; i++) {
    const a = i * 30 * DEG;
    ticks += `<path d="M${(50 + 36 * Math.sin(a)).toFixed(1)} ${(50 - 36 * Math.cos(a)).toFixed(1)} L${(50 + 42 * Math.sin(a)).toFixed(1)} ${(50 - 42 * Math.cos(a)).toFixed(1)}"/>`;
  }
  const CLOCK = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="47" fill="#fff4d6" stroke="#a8742c" stroke-width="7"/><g stroke="#3a2412" stroke-width="3" stroke-linecap="round">${ticks}</g><path d="M50 50 L34.4 41 M50 50 L72.5 37" stroke="#3a2412" stroke-width="4.5" stroke-linecap="round"/><circle cx="50" cy="50" r="4" fill="#c8553d"/></svg>`,
    { size: 192 },
  );
  const SNAIL = svg(
    `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="25" fill="#e8a24f"/><path d="M25 25 C25 21 31 21 31 26 C31 33 19 33 19 25 C19 16 34 15 35 26 C36 38 17 40 15 26" fill="none" stroke="#8a4a22" stroke-width="3.5" stroke-linecap="round"/></svg>`,
    { size: 64 },
  );

  // ------------------------------------------------------------------ paints
  const GRASS = paint((p, n) => {
    let c = mix("#74ae46", "#a3cf5c", smoothstep(0.3, 0.75, noise(p, 0.55, 4)));
    c = mix(c, "#4d8a3c", smoothstep(0.58, 0.82, noise(p, 0.9, 15)) * 0.55);
    const cl = cells(p, 0.06, 3);
    if (cl.d1 < 0.2 && cl.id > 0.5) c = mix(c, "#cfe67e", 0.6);
    else if (cl.d1 < 0.16 && cl.id < 0.18) c = mix(c, "#3f7a35", 0.5);
    const l = 0.9 + 0.1 * n.y;
    return [c[0] * l, c[1] * l, c[2] * l];
  });
  const BASE = paint((p, n) => {
    if (p.y < 0.066) return mix("#6a4228", "#92623a", noise(p, 0.07, 2) * (0.6 + 0.4 * smoothstep(0, 0.06, p.y)));
    if (n.y > 0.6) return GRASS;
    const ang = Math.atan2(p.z, p.x);
    const drip = GROUND - 0.03 - 0.045 * tri((ang * 7) / (Math.PI * 2)) - 0.02 * noise(p, 0.1, 3);
    if (p.y > drip) return mix("#5f9a3c", "#85bb4e", noise(p, 0.08, 6));
    const cl = cells(p, 0.14, 7);
    if (cl.d1 < 0.36 && cl.id < 0.72) {
      const s = mix("#c4b394", "#8f8272", cl.id);
      return cl.d1 > 0.3 ? mix(s, "#4a3526", 0.55) : s;
    }
    return mix("#82583a", "#5d3c26", smoothstep(0.1, 0.22, p.y) * 0.5 + noise(p, 0.1, 9) * 0.5);
  });
  const stemPaint = (tone: string, y0: number, top: number) => {
    const q = new THREE.Vector3();
    return paint((p, n) => {
      q.set(p.x * 6, p.y * 0.7, p.z * 6);
      let c = mix(tone, "#fffaf0", 0.25 + 0.35 * noise(q, 0.06, 2));
      c = mix(c, "#c9a77a", 0.25 * smoothstep(0.5, 0.8, noise(p, 0.12, 5)));
      c = mix(c, "#7a5a50", 0.55 * smoothstep(top - 0.12, top, p.y));
      c = mix(c, "#8f9ac0", 0.25 * (1 - smoothstep(-0.5, 0.2, n.y)));
      if (p.y - y0 < 0.05 + 0.04 * noise(p, 0.07, 5)) c = mix(c, "#5f9a3c", 0.85);
      return c;
    });
  };
  const capPaint = (col: [string, string, string], cx: number, cz: number, rad: number) =>
    paint((p, n, s) => {
      if (n.y < -0.35) {
        const r = Math.hypot(p.x - cx, p.z - cz) / rad;
        const g = Math.floor(s[1] / 6) % 2 === 0;
        return mix(g ? "#b98a5a" : "#cfa070", g ? "#f2dcae" : "#f8e8c4", smoothstep(0.1, 0.9, r));
      }
      if (n.y < 0.3) return mix("#fff0cf", col[2], 0.12);
      let c = mix(col[0], col[2], 0.65 * smoothstep(0.75, 0.1, n.y));
      c = mix(c, col[1], 0.7 * smoothstep(0.7, 1, n.y) * (0.5 + 0.5 * noise(p, 0.18, 4)));
      c = mix(c, col[2], 0.25 * smoothstep(0.55, 0.75, noise(p, 0.08, 9)));
      return c;
    });
  const WOODP = grain("#b88450", "#92623a", { size: 0.012, axis: "x" });
  const STONEP = mottle("#d3c7b0", "#a99d89", { size: 0.06, seed: 4 });
  const BRICK = stripes("#b5543a", "#8d3d2b", { size: 0.035, axis: "y", width: 0.35, wobble: 0.15 });
  const SOIL = stripes("#5a3a24", "#46301e", { size: 0.07, axis: "z", width: 0.5, wobble: 0.1 });

  // ------------------------------------------------------------------ ground
  type Mound = { x: number; z: number; r: number; h: number };
  const mounds: Mound[] = [{ x: 0, z: -0.6, r: 1.0, h: 0.17 }];
  const heightAt = (x: number, z: number) => {
    let y = GROUND;
    for (const m of mounds) {
      const d = Math.hypot(x - m.x, z - m.z) / m.r;
      if (d < 1) y += m.h * (1 - d * d);
    }
    return y;
  };

  const baseMesh = b.lathe(
    [
      [0, 0],
      [R + 0.08, 0],
      [R + 0.08, 0.045],
      [R + 0.05, 0.062],
      [R, 0.062],
      [R, GROUND - 0.03],
      [R - 0.025, GROUND],
      [0, GROUND],
    ],
    { at: [0, 0, 0], segments: 40, color: BASE },
  );
  for (const m of mounds) {
    const prof: Pt[] = [
      [0, -0.03],
      [m.r, -0.03],
    ];
    for (let k = 0; k <= 6; k++) {
      const d = 1 - k / 6;
      prof.push([m.r * d, m.h * (1 - d * d)]);
    }
    b.lathe(prof, { at: [m.x, GROUND, m.z], segments: 20, color: GRASS });
  }

  // blockers keep scattered details off paths, houses and props
  const blockers: { x: number; z: number; r: number }[] = [];
  const block = (x: number, z: number, r: number) => blockers.push({ x, z, r });
  const taken = (x: number, z: number, pad = 0) =>
    Math.hypot(x, z) > R - 0.12 || blockers.some((q) => Math.hypot(x - q.x, z - q.z) < q.r + pad);

  // ------------------------------------------------------------------ house specs
  type Win = { deg: number; y: number; kind: "round" | "arch"; w: number; box?: boolean };
  type HouseSpec = {
    name: string;
    x: number;
    z: number;
    face: [number, number];
    sr: number;
    sh: number;
    capR: number;
    capH: number;
    cap: [string, string, string];
    spot: string;
    spots: number;
    stem: string;
    door: string;
    wins: Win[];
    chimney?: number;
    collar?: boolean;
  };
  const specs: HouseSpec[] = [
    {
      name: "hall", x: 0, z: -0.6, face: [0, 1.2], sr: 0.34, sh: 0.9, capR: 0.74, capH: 0.44,
      cap: ["#d6402f", "#f26a4a", "#8f2432"], spot: "#fff1d6", spots: 12, stem: "#f7e9c9", door: "#8a3b2b",
      wins: [
        { deg: 58, y: 0.74, kind: "round", w: 0.13 },
        { deg: -58, y: 0.74, kind: "round", w: 0.13 },
        { deg: 42, y: 0.22, kind: "arch", w: 0.1 },
      ],
      chimney: 140,
    },
    {
      name: "orange", x: -1.05, z: 0.3, face: [-0.1, 0.6], sr: 0.25, sh: 0.55, capR: 0.52, capH: 0.3,
      cap: ["#f2902f", "#ffc15a", "#b9501f"], spot: "#fff1d6", spots: 8, stem: "#f9ecd0", door: "#2f7f78",
      wins: [
        { deg: 52, y: 0.34, kind: "round", w: 0.11, box: true },
        { deg: -52, y: 0.34, kind: "round", w: 0.11, box: true },
      ],
      chimney: -140, collar: true,
    },
    {
      name: "violet", x: 1.05, z: 0.25, face: [0.1, 0.55], sr: 0.2, sh: 0.46, capR: 0.44, capH: 0.4,
      cap: ["#7b6fd0", "#aa9df2", "#483c92"], spot: "#ffe3f0", spots: 8, stem: "#f1e6d6", door: "#d09a2e",
      wins: [{ deg: 55, y: 0.27, kind: "arch", w: 0.08, box: true }],
    },
    {
      name: "bakery", x: 1.15, z: -0.75, face: [0.1, -0.1], sr: 0.26, sh: 0.6, capR: 0.5, capH: 0.22,
      cap: ["#f1c445", "#ffe58a", "#c28a22"], spot: "#b86a2a", spots: 9, stem: "#f8e8c0", door: "#b0472f",
      wins: [
        { deg: 50, y: 0.38, kind: "round", w: 0.12, box: true },
        { deg: -50, y: 0.38, kind: "round", w: 0.12 },
      ],
      chimney: 100,
    },
    {
      name: "pink", x: -1.1, z: -0.8, face: [-0.05, -0.2], sr: 0.21, sh: 0.5, capR: 0.42, capH: 0.3,
      cap: ["#ee7ba0", "#ffb4cb", "#b3436f"], spot: "#fff4f0", spots: 8, stem: "#f6e9d4", door: "#6b4aa0",
      wins: [
        { deg: 50, y: 0.3, kind: "arch", w: 0.085 },
        { deg: -50, y: 0.3, kind: "round", w: 0.1, box: true },
      ],
      chimney: 30, collar: true,
    },
  ];
  const yawOf = (s: HouseSpec) => Math.atan2(s.face[0] - s.x, s.face[1] - s.z);

  for (const s of specs) block(s.x, s.z, s.name === "hall" ? 1.0 : s.capR + 0.06);

  // ------------------------------------------------------------------ paths of flagstones
  const stoneGeos: THREE.BufferGeometry[][] = [[], [], []];
  const samplePath = (path: PathLike) => {
    const n = Math.max(2, Math.round(path.length / 0.1));
    for (let i = 0; i <= n; i++) {
      const p = path.at(i / n);
      block(p.x, p.z, 0.15);
    }
  };
  const lay = (path: PathLike, width: number, spacing: number) => {
    const n = Math.max(2, Math.round(path.length / spacing));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const p = path.at(t);
      const tg = path.tangentAt(t);
      const nl = Math.hypot(tg.x, tg.z) || 1;
      const nx = -tg.z / nl;
      const nz = tg.x / nl;
      for (const k of [-1, 1]) {
        const lat = k * width * 0.27 + (rand() - 0.5) * 0.03;
        const x = p.x + nx * lat + (tg.x / nl) * (rand() - 0.5) * 0.04 + (i % 2 ? 0.02 * k : 0);
        const z = p.z + nz * lat + (tg.z / nl) * (rand() - 0.5) * 0.04;
        const r = 0.045 + 0.03 * rand();
        const g = new THREE.CylinderGeometry(r * 0.85, r, 0.026, 7);
        g.scale(1, 1, 0.8);
        g.rotateY(rand() * Math.PI);
        g.translate(x, heightAt(x, z) + 0.004, z);
        stoneGeos[Math.floor(rand() * 3)].push(g);
      }
    }
  };
  const mainPath = catmull([
    [0.22, 0, 1.85],
    [0.14, 0, 1.4],
    [-0.06, 0, 1.0],
    [0.06, 0, 0.55],
    [0, 0, 0.15],
    [0, 0, -0.15],
  ]);
  lay(mainPath, 0.24, 0.115);
  samplePath(mainPath);
  const mainSamples: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) mainSamples.push(mainPath.at(i / 40));
  for (const s of specs) {
    if (s.name === "hall") continue;
    const yaw = yawOf(s);
    const dx = s.x + Math.sin(yaw) * (s.sr + 0.3);
    const dz = s.z + Math.cos(yaw) * (s.sr + 0.3);
    let best = mainSamples[0];
    for (const m of mainSamples) if (Math.hypot(m.x - dx, m.z - dz) < Math.hypot(best.x - dx, best.z - dz)) best = m;
    const mx = (best.x + dx) / 2 + (rand() - 0.5) * 0.1;
    const mz = (best.z + dz) / 2 + (rand() - 0.5) * 0.1;
    const spur = catmull([
      [best.x, 0, best.z],
      [mx, 0, mz],
      [dx, 0, dz],
    ]);
    lay(spur, 0.18, 0.11);
    samplePath(spur);
  }

  // ------------------------------------------------------------------ small prop helpers
  const off = (h: HitLike, d: number): V => [h.at.x + h.n.x * d, h.at.y + h.n.y * d, h.at.z + h.n.z * d];

  function lamp(x: number, z: number, h: number, dir: number): V {
    const y = heightAt(x, z);
    block(x, z, 0.08);
    b.rod([x, y - 0.01, z], [x, y + h, z], 0.012, IRON, { sides: 6 });
    b.part(new THREE.SphereGeometry(0.022, 6, 4), IRON, { at: [x, y + 0.005, z], scale: [1.6, 0.7, 1.6] });
    const ax = x + 0.07 * dir;
    b.rod([x, y + h, z], [ax, y + h + 0.02, z], 0.007, IRON);
    const ly = y + h - 0.045;
    b.part(new THREE.CylinderGeometry(0.003, 0.003, 0.04, 4), IRON, { at: [ax, y + h - 0.005, z] });
    glow(b.part(new THREE.BoxGeometry(0.045, 0.06, 0.045), "#ffd36b", { at: [ax, ly, z] }), 1.4);
    b.part(new THREE.ConeGeometry(0.04, 0.04, 4), ROOF_D, { at: [ax, ly + 0.05, z], rotation: [0, 45, 0] });
    b.part(new THREE.BoxGeometry(0.05, 0.008, 0.05), ROOF_D, { at: [ax, ly - 0.034, z] });
    return [ax, y + h + 0.02, z];
  }

  function bunting(a: V, c: V, sag: number, cols: string[]) {
    const mid: V = [(a[0] + c[0]) / 2, Math.min(a[1], c[1]) - sag, (a[2] + c[2]) / 2];
    const path = catmull([a, mid, c]);
    b.sweep(path, 0.0035, { color: "#6b4a35", sides: 4 });
    const n = 9;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const p = path.at(t);
      const tg = path.tangentAt(t);
      const l = Math.hypot(tg.x, tg.z) || 1;
      b.extrude(
        [
          [-0.032, 0],
          [0.032, 0],
          [0, -0.08, "sharp"],
        ],
        { at: [p.x, p.y - 0.002, p.z], x: [tg.x / l, 0, tg.z / l], thickness: 0.004, color: cols[i % cols.length] },
      );
    }
  }

  const fenceGeos: THREE.BufferGeometry[] = [];
  function addFence(x1: number, z1: number, x2: number, z2: number) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const n = Math.max(1, Math.round(len / 0.065));
    const th = Math.atan2(-dz, dx);
    for (let i = 0; i <= n; i++) {
      const x = x1 + (dx * i) / n;
      const z = z1 + (dz * i) / n;
      const y = heightAt(x, z);
      const pk = new THREE.BoxGeometry(0.026, 0.11, 0.01);
      pk.translate(0, 0.045, 0);
      pk.rotateY(th);
      pk.translate(x, y, z);
      fenceGeos.push(pk);
      const tip = new THREE.ConeGeometry(0.0184, 0.03, 4);
      tip.rotateY(Math.PI / 4 + th);
      tip.translate(x, y + 0.115, z);
      fenceGeos.push(tip);
    }
    for (const ry of [0.04, 0.085]) {
      const rail = new THREE.BoxGeometry(len, 0.012, 0.01);
      rail.rotateY(th);
      const yy = heightAt((x1 + x2) / 2, (z1 + z2) / 2) + ry;
      rail.translate((x1 + x2) / 2, yy, (z1 + z2) / 2);
      fenceGeos.push(rail);
    }
  }

  // ------------------------------------------------------------------ house builder
  function buildHouse(o: HouseSpec) {
    const yaw = yawOf(o);
    const ring: number[] = [];
    for (let k = 0; k < 8; k++)
      ring.push(heightAt(o.x + Math.sin(k * 45 * DEG) * o.sr, o.z + Math.cos(k * 45 * DEG) * o.sr));
    const y0 = Math.min(...ring) - 0.02;
    const fwd = (deg = 0) => new THREE.Vector3(Math.sin(yaw + deg * DEG), 0, Math.cos(yaw + deg * DEG));
    const { sr, sh } = o;
    const stemProf: Pt[] = [
      [0, 0, "sharp"],
      [sr * 1.12, 0],
      [sr * 1.08, sh * 0.08],
      [sr * 0.96, sh * 0.35],
      [sr * 0.9, sh * 0.62],
      [sr * 0.98, sh * 0.9],
      [sr * 0.8, sh + 0.02],
      [0, sh + 0.02, "sharp"],
    ];
    const stem = b.lathe(stemProf, {
      at: [o.x, y0, o.z], segments: 12, smoothing: 1, color: stemPaint(o.stem, y0, y0 + sh),
    });
    const skin = b.surface(stem);
    const hit = (deg: number, y: number, lat = 0) => {
      const out = fwd(deg);
      const tan = fwd(deg + 90);
      const origin: V = [o.x + out.x * 2 + tan.x * lat, y0 + Math.max(y, 0.02), o.z + out.z * 2 + tan.z * lat];
      const h = skin.ray(origin, [-out.x, 0, -out.z]);
      if (!h) throw new Error(`house ${o.name}: no stem surface at ${deg} deg, y ${y}`);
      return h;
    };

    // cap
    const capY = y0 + sh;
    const R0 = o.capR;
    const h0 = o.capH;
    const capProf: Pt[] = [
      [0, 0.05 * h0, "sharp"],
      [0.5 * R0, 0],
      [R0, -0.1 * h0],
      [R0 * 1.02, 0.04 * h0],
      [0.94 * R0, 0.36 * h0],
      [0.78 * R0, 0.66 * h0],
      [0.52 * R0, 0.89 * h0],
      [0.26 * R0, 0.985 * h0],
      [0, h0, "sharp"],
    ];
    const cap = b.lathe(capProf, {
      at: [o.x, capY, o.z], segments: 14, smoothing: 1, color: capPaint(o.cap, o.x, o.z, R0),
    });
    const capSkin = b.surface(cap);
    const cc: V = [o.x, capY + 0.15 * h0, o.z];
    const avoid: THREE.Vector3[] = [];

    // attic porthole on the town hall cap
    if (o.name === "hall") {
      const ph = capSkin.around(cc).at(yaw / DEG, 46);
      if (ph) {
        glow(b.decal(cap, WIN_ROUND, { at: ph.at, dir: ph.n, size: [0.16, 0.16], segments: 8, lift: 0.003 }), 1.15);
        b.part(new THREE.TorusGeometry(0.08, 0.011, 4, 12), CREAM, { at: off(ph, 0.004), dir: ph.n, axis: "z" });
        avoid.push(ph.at.clone());
      }
    }
    // chimney
    if (o.chimney !== undefined) {
      const ch = capSkin.around(cc).at(yaw / DEG + o.chimney, 60);
      if (ch) {
        const bx = ch.at.x;
        const by = ch.at.y;
        const bz = ch.at.z;
        b.part(new THREE.CylinderGeometry(0.045, 0.055, 0.3, 6), BRICK, { at: [bx, by + 0.09, bz] });
        b.part(new THREE.CylinderGeometry(0.063, 0.063, 0.03, 6), ROOF_D, { at: [bx, by + 0.255, bz] });
        const puffs: [number, number, number][] = [
          [0.03, 0.31, 0],
          [0.075, 0.385, 0.018],
          [0.14, 0.47, 0.04],
        ];
        puffs.forEach((q, i) => {
          b.part(new THREE.SphereGeometry(0.03 + i * 0.012, 6, 4), "#f4efe6", {
            at: [bx + q[1] * 0.0 + q[0] * 0.5, by + q[1] + 0.02, bz + q[2]],
          });
        });
        avoid.push(ch.at.clone());
      }
    }
    // spots on the cap
    {
      const placed: { p: THREE.Vector3; r: number }[] = [];
      for (let i = 0; i < o.spots; i++) {
        const az = yaw / DEG + i * 137.5 + 20;
        const el = 22 + ((i * 41) % 56);
        const h = capSkin.around(cc).at(az, el);
        if (!h) continue;
        const r = R0 * 0.085 * (0.65 + 0.7 * rand());
        if (avoid.some((a) => a.distanceTo(h.at) < r + 0.1)) continue;
        if (placed.some((q) => q.p.distanceTo(h.at) < (q.r + r) * 1.1)) continue;
        placed.push({ p: h.at.clone(), r });
        b.stick(new THREE.CylinderGeometry(r, r * 1.06, 0.012, 8), o.spot, h, { embed: 0.5 });
      }
    }
    // collar skirt under the cap
    if (o.collar) {
      const cy = y0 + sh * 0.9;
      b.lathe(
        [
          [sr * 0.8, 0],
          [sr * 1.4, -0.05],
          [sr * 1.45, -0.03],
          [sr * 0.9, 0.04],
        ],
        { at: [o.x, cy, o.z], segments: 12, color: mottle("#fbf0d2", "#dcc496", { size: 0.05, seed: 8 }) },
      );
    }

    // door: arch frame, planked decal, knob, steps
    const dw = sr * 0.62;
    const dh = sr * 1.45;
    glow; // (glow is used for windows and lamps below)
    b.decal(stem, DOOR, {
      at: hit(0, dh / 2).at, dir: fwd(0), size: [dw, dh], segments: 10, lift: 0.004, color: o.door,
    });
    const hw = dw / 2 + 0.012;
    const cy = dh - dw / 2;
    const fp: V[] = [];
    const addP = (lat: number, y: number) => fp.push(off(hit(0, y, lat), 0.006));
    addP(-hw, 0.02);
    addP(-hw, cy * 0.5);
    addP(-hw, cy);
    for (let k = 1; k <= 5; k++) {
      const a = (180 - k * 30) * DEG;
      addP(hw * Math.cos(a), cy + hw * Math.sin(a));
    }
    addP(hw, cy);
    addP(hw, cy * 0.5);
    addP(hw, 0.02);
    b.sweep(catmull(fp), 0.011, { color: CREAM, sides: 6 });
    const kn = hit(0, dh * 0.42, dw * 0.33);
    b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, { at: off(kn, 0.012) });
    const nSteps = o.name === "hall" ? 3 : 2;
    for (let k = 0; k < nSteps; k++) {
      const dist = sr * 1.1 + 0.05 + k * 0.12;
      const sx = o.x + Math.sin(yaw) * dist;
      const sz = o.z + Math.cos(yaw) * dist;
      const th = 0.04 - k * (nSteps === 3 ? 0.01 : 0.015);
      const rad = (o.name === "hall" ? 0.16 : 0.12) - k * 0.005;
      b.part(new THREE.CylinderGeometry(rad * 0.95, rad, th, 8), STONEP, {
        at: [sx, heightAt(sx, sz) + th / 2 - 0.004, sz], scale: [1.25, 1, 1], rotation: [0, yaw / DEG, 0],
      });
    }

    // windows
    for (const w of o.wins) {
      const hh = hit(w.deg, w.y);
      const out = fwd(w.deg);
      const h2 = w.kind === "round" ? w.w : w.w * 1.5;
      glow(
        b.decal(stem, w.kind === "round" ? WIN_ROUND : WIN_ARCH, {
          at: hh.at, dir: out, size: [w.w, h2], segments: 8, lift: 0.003,
        }),
        1.15,
      );
      if (w.kind === "round")
        b.part(new THREE.TorusGeometry(w.w * 0.5, 0.009, 4, 12), CREAM, { at: off(hh, 0.002), dir: out, axis: "z" });
      for (const sd of [1, -1]) {
        const sHit = hit(w.deg, w.y, sd * (w.w * 0.5 + 0.035));
        b.stick(new THREE.BoxGeometry(0.04, 0.014, h2 * 0.95), o.cap[2], sHit, { embed: 0.35, flow: [0, 1, 0] });
      }
      if (w.box) {
        const by = Math.max(w.y - h2 / 2 - 0.03, 0.05);
        const bh = hit(w.deg, by);
        b.stick(new THREE.BoxGeometry(w.w * 1.15, 0.045, 0.04), WOOD, bh, { embed: 0.15, flow: [0, 1, 0] });
        b.stick(new THREE.BoxGeometry(w.w * 1.05, 0.04, 0.03), LEAF, bh.moved([0, 0.012, 0]), { embed: 0.1, flow: [0, 1, 0] });
        const fc = ["#ff7a8a", "#ffe066", "#ffffff", "#ff9a3c"];
        for (let k = 0; k < 4; k++) {
          const fh = hit(w.deg, by, (k - 1.5) * w.w * 0.28);
          b.part(new THREE.SphereGeometry(0.017, 5, 4), fc[(k + w.deg) % 4 < 0 ? 0 : (k + Math.abs(w.deg)) % 4], {
            at: off(fh, 0.04),
          });
        }
      }
    }

    // lamp by the door
    const side = specs.indexOf(o) % 2 === 0 ? 1 : -1;
    if (o.name !== "hall") {
      const lx = o.x + Math.sin(yaw) * (sr + 0.28) + Math.cos(yaw) * side * 0.2;
      const lz = o.z + Math.cos(yaw) * (sr + 0.28) - Math.sin(yaw) * side * 0.2;
      lamp(lx, lz, 0.3, -side);
    }
    return { stem, cap, y0, capY, hit, fwd, yaw, capSkin, cc };
  }

  const houses = specs.map((s) => buildHouse(s));

  // ------------------------------------------------------------------ town hall extras
  {
    const o = specs[0];
    const H = houses[0];
    const { sr } = o;
    const by = H.y0 + 0.56;
    const ringRad = sr + 0.2;
    b.lathe(
      [
        [sr * 0.8, 0],
        [ringRad, 0],
        [ringRad, 0.035],
        [sr * 0.8, 0.035],
      ],
      {
        at: [o.x, by, o.z], segments: 16,
        color: paint((_p, _n, s) => (Math.floor(s[1] / 9) % 2 ? "#a97a48" : "#8f6338")),
      },
    );
    const railPts: V[] = [];
    const posts: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      const rx = o.x + Math.cos(a) * (sr + 0.17);
      const rz = o.z + Math.sin(a) * (sr + 0.17);
      railPts.push([rx, by + 0.125, rz]);
      const pg = new THREE.CylinderGeometry(0.007, 0.007, 0.09, 4);
      pg.translate(rx, by + 0.08, rz);
      posts.push(pg);
    }
    b.sweep(catmull(railPts, { closed: true }), 0.009, { color: CREAM, sides: 5 });
    b.part(mergeGeometries(posts)!, CREAM, { at: [0, 0, 0] });
    // spiral stair of shelf fungi
    for (let i = 0; i < 8; i++) {
      const dir = H.fwd(-35 - i * 30);
      const dist = sr * 0.95 + 0.07;
      b.part(new THREE.CylinderGeometry(0.1, 0.095, 0.03, 8), mottle("#ee9440", "#c25f26", { size: 0.04, seed: 5 }), {
        at: [o.x + dir.x * dist, H.y0 + 0.05 + i * 0.07, o.z + dir.z * dist],
      });
    }
    // clock over the door
    b.decal(H.stem, CLOCK, { at: H.hit(0, 0.78).at, dir: H.fwd(0), size: [0.15, 0.15], segments: 8, lift: 0.003 });
    // flag on top of the cap
    const top = b.surface(H.cap).ray([o.x, H.capY + o.capH + 1, o.z], [0, -1, 0]);
    if (top) {
      const tp = top.at;
      b.rod([tp.x, tp.y - 0.02, tp.z], [tp.x, tp.y + 0.42, tp.z], 0.009, WOOD_D);
      b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, { at: [tp.x, tp.y + 0.44, tp.z] });
      const fy = tp.y + 0.26;
      b.extrude(
        [
          [0, 0],
          [0.3, 0],
          [0.22, 0.07, "sharp"],
          [0.3, 0.14],
          [0, 0.14],
        ],
        { at: [tp.x + 0.005, fy, tp.z], x: [1, 0, 0], thickness: 0.006, color: "#f7efd8" },
      );
      for (const sd of [1, -1])
        b.part(new THREE.PlaneGeometry(0.11, 0.11), "#ffffff", {
          at: [tp.x + 0.1, fy + 0.07, tp.z + sd * 0.0045], dir: [0, 0, sd], axis: "z", texture: EMBLEM,
        });
    }
    // lamps beside the stairs to the door
    lamp(0.42, -0.02, 0.36, -1);
    lamp(-0.42, -0.02, 0.36, 1);
  }

  // ------------------------------------------------------------------ bakery hanging sign
  {
    const o = specs[3];
    const H = houses[3];
    const hh = H.hit(28, 0.46);
    const out = H.fwd(28);
    const a: V = off(hh, 0.01);
    const e: V = [a[0] + out.x * 0.15, a[1], a[2] + out.z * 0.15];
    b.rod(a, e, 0.007, IRON);
    const nrm: V = [-out.z, 0, out.x];
    const sx = a[0] + out.x * 0.1;
    const sz = a[2] + out.z * 0.1;
    for (const k of [-1, 1]) b.rod([sx + out.x * 0.04 * k, a[1], sz + out.z * 0.04 * k], [sx + out.x * 0.04 * k, a[1] - 0.04, sz + out.z * 0.04 * k], 0.0025, IRON);
    b.extrude(
      [
        [-0.055, -0.1],
        [0.055, -0.1],
        [0.055, -0.04],
        [-0.055, -0.04],
      ],
      { at: [sx, a[1], sz], x: [out.x, 0, out.z], thickness: 0.012, bevel: 0.002, color: WOODP },
    );
    for (const sd of [1, -1])
      b.part(new THREE.PlaneGeometry(0.09, 0.066), "#ffffff", {
        at: [sx + nrm[0] * sd * 0.0072, a[1] - 0.07, sz + nrm[2] * sd * 0.0072],
        dir: [nrm[0] * sd, 0, nrm[2] * sd], axis: "z", texture: BREAD,
      });
    void o;
  }

  // ------------------------------------------------------------------ well
  {
    const W = { x: 0.55, z: 0.66 };
    block(W.x, W.z, 0.24);
    const wy = heightAt(W.x, W.z);
    b.lathe(
      [
        [0.1, 0],
        [0.15, 0],
        [0.15, 0.16],
        [0.14, 0.185],
        [0.11, 0.185],
        [0.1, 0.165],
      ],
      {
        at: [W.x, wy - 0.01, W.z], segments: 10,
        color: scales(["#cfc2a8", "#bcae93", "#d9cdb4"], "#6f6355", { size: 0.045 }),
      },
    );
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.01, 10), "#2a6a9a", { at: [W.x, wy + 0.1, W.z] });
    for (const sd of [1, -1]) b.rod([W.x + sd * 0.14, wy, W.z], [W.x + sd * 0.14, wy + 0.34, W.z], 0.012, WOOD);
    b.rod([W.x - 0.15, wy + 0.29, W.z], [W.x + 0.15, wy + 0.29, W.z], 0.01, WOOD_D);
    b.rod([W.x, wy + 0.29, W.z], [W.x, wy + 0.23, W.z], 0.0025, IRON);
    b.part(new THREE.CylinderGeometry(0.03, 0.024, 0.04, 7), "#8a6a48", { at: [W.x, wy + 0.2, W.z] });
    const roofP = stripes("#cf5a40", "#a8432e", { size: 0.03, axis: "x", width: 0.5, wobble: 0.1 });
    for (const sd of [1, -1])
      b.part(new THREE.BoxGeometry(0.36, 0.012, 0.2), roofP, {
        at: [W.x, wy + 0.375, W.z + sd * 0.078], rotation: [sd * 35, 0, 0],
      });
    b.rod([W.x - 0.19, wy + 0.415, W.z], [W.x + 0.19, wy + 0.415, W.z], 0.012, "#8f3a28");
  }

  // ------------------------------------------------------------------ pond with bridge
  const POND = { x: 0.95, z: 1.15, rx: 0.34, rz: 0.27 };
  block(POND.x, POND.z, 0.46);
  {
    b.part(new THREE.CylinderGeometry(1, 1, 0.012, 18), mottle("#6b4a2e", "#4a3320", { size: 0.05, seed: 2 }), {
      at: [POND.x, GROUND + 0.002, POND.z], scale: [POND.rx * 1.2, 1, POND.rz * 1.24],
    });
    const WATER = paint((p) => {
      const d = Math.hypot((p.x - POND.x) / POND.rx, (p.z - POND.z) / POND.rz);
      let c = mix("#2d78a6", "#73c2cf", smoothstep(0.1, 1, d));
      if (Math.sin(d * 22 + noise(p, 0.2, 3) * 6) > 0.93) c = mix(c, "#d8f4f2", 0.6);
      if (d > 0.9) c = mix(c, "#9fd8c8", 0.4);
      return c;
    });
    b.part(new THREE.CylinderGeometry(1, 1, 0.012, 18), WATER, {
      at: [POND.x, GROUND + 0.007, POND.z], scale: [POND.rx, 1, POND.rz],
    });
    const rim: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 20; k++) {
      const a = (k / 20) * Math.PI * 2;
      const sg = new THREE.SphereGeometry(0.04 + 0.015 * rand(), 5, 4);
      sg.scale(1, 0.6, 1);
      sg.translate(POND.x + Math.cos(a) * POND.rx * 1.2, GROUND + 0.008, POND.z + Math.sin(a) * POND.rz * 1.24);
      rim.push(sg);
    }
    b.part(mergeGeometries(rim)!, mottle("#c9bda6", "#9a8e7a", { size: 0.04, seed: 6 }), { at: [0, 0, 0] });
    const pads: [number, number][] = [[0.74, 1.08], [1.17, 1.24], [0.72, 1.24], [1.18, 1.03]];
    pads.forEach(([x, z], i) =>
      b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.006, 8), i % 2 ? "#5fae52" : LEAF, {
        at: [x, GROUND + 0.015, z], rotation: [0, i * 40, 0],
      }),
    );
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      b.part(new THREE.ConeGeometry(0.014, 0.05, 4), "#ff9ab8", {
        at: [0.72 + Math.cos(a) * 0.02, GROUND + 0.04, 1.08 + Math.sin(a) * 0.02],
        dir: [Math.cos(a) * 0.7, 1, Math.sin(a) * 0.7],
      });
    }
    b.part(new THREE.SphereGeometry(0.012, 5, 4), "#ffe066", { at: [0.72, GROUND + 0.035, 1.08] });
    // reeds and cattails
    const reeds: [number, number][] = [[0.62, 1.38], [0.6, 1.3], [1.3, 0.95], [1.28, 1.05]];
    reeds.forEach(([x, z], i) => {
      b.spike([x, GROUND, z], [0.05 * (i % 2 ? 1 : -1), 1, 0.04], 0.34 + 0.06 * i, 0.008, { color: "#7fa04a", sides: 4 });
      if (i % 2 === 0)
        b.capsule([x + 0.01, GROUND + 0.27, z + 0.008], [x + 0.012, GROUND + 0.34, z + 0.01], 0.011, { color: "#6b4a2b", sides: 5 });
    });
    // plank bridge
    const bp = bezier(
      [POND.x, GROUND + 0.01, POND.z - 0.42],
      [POND.x, GROUND + 0.27, POND.z],
      [POND.x, GROUND + 0.01, POND.z + 0.42],
    );
    b.sweep(bp, () => [0.075, 0.012], {
      section: "box", caps: "flat",
      color: paint((_p, _n, s) => (Math.floor(s[0] * 16) % 2 ? "#b98350" : "#a06f3f")),
    });
    for (const sd of [1, -1]) {
      const rp: V[] = [];
      for (let i = 0; i <= 6; i++) {
        const p = bp.at(i / 6);
        rp.push([p.x + sd * 0.075, p.y + 0.09, p.z]);
        b.rod([p.x + sd * 0.075, p.y, p.z], [p.x + sd * 0.075, p.y + 0.09, p.z], 0.006, WOOD);
      }
      b.sweep(catmull(rp), 0.0075, { color: WOOD, sides: 5 });
    }
  }

  // ------------------------------------------------------------------ lamps, bunting, signpost
  {
    const a = lamp(-0.3, 1.0, 0.46, 1);
    const c = lamp(0.5, 1.1, 0.46, -1);
    bunting(a, c, 0.1, ["#d6402f", "#f1c445", "#2f9a8f", "#ee7ba0"]);

    const sx = 0.45;
    const sz = 1.45;
    block(sx, sz, 0.14);
    const sy = heightAt(sx, sz);
    b.rod([sx, sy - 0.01, sz], [sx, sy + 0.62, sz], 0.014, WOOD, { sides: 6 });
    b.part(new THREE.SphereGeometry(0.022, 6, 4), GOLD, { at: [sx, sy + 0.64, sz] });
    const boards: [typeof SIGN_HALL, number, number][] = [
      [SIGN_HALL, -1, 0.5],
      [SIGN_BAKE, 1, 0.41],
      [SIGN_POND, 1, 0.32],
    ];
    for (const [tex, dir, hy] of boards) {
      const L = 0.26;
      const pts: Pt[] = [
        [0, -0.032],
        [L, -0.032],
        [L + 0.04, 0, "sharp"],
        [L, 0.032],
        [0, 0.032],
      ];
      const outline: Pt[] = dir > 0 ? pts : pts.map((q) => [-q[0], q[1]] as Pt).reverse();
      b.extrude(outline, { at: [sx, sy + hy, sz], x: [1, 0, 0], thickness: 0.012, bevel: 0.002, color: WOODP });
      b.part(new THREE.PlaneGeometry(0.2, 0.063), "#ffffff", {
        at: [sx + (dir * L) / 2, sy + hy, sz + 0.0075], dir: [0, 0, 1], axis: "z", texture: tex,
      });
    }
  }

  // ------------------------------------------------------------------ garden with fence and scarecrow
  {
    const G = { x: -0.9, z: 1.1, yaw: 0.2 };
    block(G.x, G.z, 0.55);
    const gc = Math.cos(G.yaw);
    const gs = Math.sin(G.yaw);
    const gw = (lx: number, lz: number): [number, number] => [G.x + lx * gc + lz * gs, G.z - lx * gs + lz * gc];
    const gh = heightAt(G.x, G.z);
    b.part(new THREE.BoxGeometry(0.76, 0.05, 0.5), SOIL, { at: [G.x, gh + 0.005, G.z], rotation: [0, G.yaw / DEG, 0] });
    const cab: [number, number][] = [[-0.3, -0.12], [-0.12, -0.12], [0.06, -0.12]];
    for (const [lx, lz] of cab) {
      const [x, z] = gw(lx, lz);
      b.part(new THREE.SphereGeometry(0.055, 7, 5), "#7fbf5a", { at: [x, gh + 0.06, z], scale: [1, 0.85, 1], flat: true });
      b.part(new THREE.SphereGeometry(0.036, 6, 4), "#b6e08a", { at: [x, gh + 0.08, z], scale: [1, 0.8, 1], flat: true });
    }
    const pum: [number, number][] = [[-0.28, 0.12], [-0.04, 0.12], [0.15, 0.12]];
    for (const [lx, lz] of pum) {
      const [x, z] = gw(lx, lz);
      b.part(new THREE.SphereGeometry(0.06, 8, 5), "#f08a24", { at: [x, gh + 0.065, z], scale: [1, 0.78, 1], flat: true });
      b.part(new THREE.CylinderGeometry(0.008, 0.012, 0.03, 5), "#5f8a3a", { at: [x, gh + 0.115, z] });
    }
    // scarecrow
    {
      const [x, z] = gw(0.3, -0.1);
      const y = gh + 0.03;
      b.rod([x, y, z], [x, y + 0.36, z], 0.009, WOOD_D);
      b.rod([x - 0.13, y + 0.27, z], [x + 0.13, y + 0.27, z], 0.008, WOOD_D);
      b.part(new THREE.BoxGeometry(0.09, 0.1, 0.05), "#4a6fa5", { at: [x, y + 0.22, z] });
      b.part(new THREE.SphereGeometry(0.035, 6, 5), "#e5c88f", { at: [x, y + 0.38, z] });
      b.lathe(
        [
          [0, 0],
          [0.07, 0],
          [0.07, 0.008],
          [0.035, 0.012],
          [0.03, 0.06],
          [0, 0.07],
        ],
        { at: [x, y + 0.405, z], segments: 8, color: "#8a5a30" },
      );
      for (const sd of [1, -1])
        b.spike([x + sd * 0.13, y + 0.27, z], [sd * 1, -0.3, 0.2], 0.045, 0.006, { color: "#e6c35c", sides: 4 });
    }
    // fence round the plot with a gate gap at the front
    const cr: [number, number][] = [gw(-0.4, -0.27), gw(0.4, -0.27), gw(0.4, 0.27), gw(-0.4, 0.27)];
    addFence(cr[0][0], cr[0][1], cr[1][0], cr[1][1]);
    addFence(cr[1][0], cr[1][1], cr[2][0], cr[2][1]);
    addFence(cr[3][0], cr[3][1], cr[0][0], cr[0][1]);
    const g1 = gw(0.4, 0.27);
    const g2 = gw(0.1, 0.27);
    const g3 = gw(-0.1, 0.27);
    const g4 = gw(-0.4, 0.27);
    addFence(g1[0], g1[1], g2[0], g2[1]);
    addFence(g3[0], g3[1], g4[0], g4[1]);
  }

  // ------------------------------------------------------------------ bushes
  const bushes: [number, number, number][] = [
    [-1.55, -0.25, 0.16],
    [1.65, -0.2, 0.15],
    [0.9, -1.45, 0.14],
    [-0.7, -1.5, 0.15],
    [-0.45, 1.55, 0.13],
  ];
  bushes.forEach(([x, z, r], i) => {
    block(x, z, r + 0.05);
    const y = heightAt(x, z);
    const bush = b.part(new THREE.IcosahedronGeometry(r, 1), mottle("#4f8f3a", "#76b24a", { size: 0.1, seed: 20 + i }), {
      at: [x, y + r * 0.45, z], scale: [1, 0.82, 1], flat: true,
    });
    const berries = b.surface(bush).scatter(5, { rng: rand, minDist: 0.05, filter: (h) => h.n.y > 0.2 });
    for (const h of berries) b.stick(new THREE.SphereGeometry(0.013, 5, 4), i % 2 ? "#d6402f" : "#7a4ad0", h, { embed: 0.3 });
  });

  // ------------------------------------------------------------------ toadstool clusters
  function toadstool(x: number, z: number, s: number, col: string, glowing: boolean) {
    const y = heightAt(x, z);
    b.part(new THREE.CylinderGeometry(0.16 * s, 0.22 * s, 1.1 * s, 7), glowing ? "#cfe9e4" : "#f1e4c4", {
      at: [x, y + 0.5 * s, z],
    });
    const capCol = glowing ? col : spots(col, "#fff4dc", { size: 0.04, amount: 0.55, seed: Math.floor(x * 10) });
    const cp = b.lathe(
      [
        [0, 0.05 * s * 0.7, "sharp"],
        [s, -0.05 * s * 0.7],
        [s * 1.02, 0.1 * s * 0.7],
        [0.85 * s, 0.55 * s * 0.7],
        [0.5 * s, 0.9 * s * 0.7],
        [0, s * 0.7, "sharp"],
      ],
      { at: [x, y + 0.95 * s, z], segments: 8, color: capCol },
    );
    if (glowing) glow(cp, 1.6);
  }
  const tcl: [number, number, number, string, boolean][] = [
    [-0.55, -0.32, 0.07, "#d6402f", false],
    [-0.46, -0.28, 0.045, "#f2902f", false],
    [0.6, -0.28, 0.06, "#d6402f", false],
    [0.68, -0.22, 0.04, "#ee7ba0", false],
    [-1.45, -1.0, 0.06, "#f2902f", false],
    [1.2, -1.3, 0.06, "#d6402f", false],
    [1.5, 0.95, 0.06, "#5df2e0", true],
    [1.58, 0.88, 0.04, "#9d7bff", true],
    [1.43, 0.86, 0.035, "#5df2e0", true],
    [0.4, 1.78, 0.05, "#9d7bff", true],
  ];
  for (const [x, z, s, c, g] of tcl) {
    block(x, z, s * 1.6 + 0.04);
    toadstool(x, z, s, c, g);
  }

  // ------------------------------------------------------------------ snail on the path edge
  {
    const x = -0.3;
    const z = 0.72;
    const y = heightAt(x, z);
    b.capsule([x - 0.05, y + 0.01, z], [x + 0.045, y + 0.013, z], [0.012, 0.008], { color: "#d9c79b", sides: 6 });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), "#d9c79b", { at: [x + 0.052, y + 0.016, z] });
    for (const sd of [1, -1]) {
      b.rod([x + 0.054, y + 0.02, z + sd * 0.005], [x + 0.064, y + 0.04, z + sd * 0.009], 0.0016, "#bfa97a");
      b.part(new THREE.SphereGeometry(0.003, 4, 3), "#2a1a10", { at: [x + 0.064, y + 0.042, z + sd * 0.009] });
    }
    b.part(new THREE.SphereGeometry(0.03, 7, 5), "#e8a24f", { at: [x - 0.015, y + 0.035, z], scale: [1, 1, 0.75] });
    for (const sd of [1, -1])
      b.part(new THREE.CircleGeometry(0.026, 10), "#ffffff", {
        at: [x - 0.015, y + 0.035, z + sd * 0.0235], dir: [0, 0, sd], axis: "z", texture: SNAIL,
      });
  }

  // ------------------------------------------------------------------ flowers
  {
    const stems: THREE.BufferGeometry[] = [];
    const fcols = ["#ff7a8a", "#ffe066", "#ffffff", "#ff9a3c", "#b79bff"];
    const heads: THREE.BufferGeometry[][] = fcols.map(() => []);
    const centers: THREE.BufferGeometry[] = [];
    let placed = 0;
    for (let tries = 0; tries < 900 && placed < 70; tries++) {
      const a = rand() * Math.PI * 2;
      const rr = Math.sqrt(rand()) * (R - 0.15);
      const x = Math.cos(a) * rr;
      const z = Math.sin(a) * rr;
      if (taken(x, z, 0.05)) continue;
      placed++;
      const y = heightAt(x, z);
      const h = 0.07 + rand() * 0.06;
      const st = new THREE.CylinderGeometry(0.0035, 0.0035, h, 4);
      st.translate(x, y + h / 2, z);
      stems.push(st);
      const hd = new THREE.SphereGeometry(0.016, 5, 3);
      hd.scale(1, 0.55, 1);
      hd.translate(x, y + h, z);
      heads[placed % fcols.length].push(hd);
      const ct = new THREE.SphereGeometry(0.008, 4, 3);
      ct.translate(x, y + h + 0.006, z);
      centers.push(ct);
    }
    b.part(mergeGeometries(stems)!, LEAF, { at: [0, 0, 0] });
    heads.forEach((list, i) => {
      if (list.length) b.part(mergeGeometries(list)!, fcols[i], { at: [0, 0, 0] });
    });
    b.part(mergeGeometries(centers)!, "#f0b429", { at: [0, 0, 0] });
  }

  // ------------------------------------------------------------------ grass tufts (cards)
  {
    const hits = b
      .surface(baseMesh)
      .scatter(260, { rng: rand, minDist: 0.1, filter: (h) => h.n.y > 0.9 && !taken(h.at.x, h.at.z, 0.03) });
    b.cards(hits, TUFT, { size: [0.075, 0.085], cross: true, vary: 0.35, spin: 180, rng: rand, lean: 8 });
  }

  // ------------------------------------------------------------------ merged groups
  stoneGeos.forEach((list, g) => {
    if (list.length)
      b.part(mergeGeometries(list)!, mottle(["#d9ceb6", "#cfc3a8", "#c3b79d"][g], "#a39682", { size: 0.05, seed: g }), {
        at: [0, 0, 0],
      });
  });
  if (fenceGeos.length) b.part(mergeGeometries(fenceGeos)!, "#f4ead0", { at: [0, 0, 0] });

  return b.root;
}
```