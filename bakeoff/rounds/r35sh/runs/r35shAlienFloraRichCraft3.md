```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  bezier,
  catmull,
  paint,
  spots,
  mix,
  noise,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Pandoran Glowcrown",
  description:
    "A bioluminescent alien plant in the style of Pandora: a vein-lit indigo trunk with buttress roots, a petal crown around a glowing heart-orb, willow tendrils with luminous beads, fan leaves, helicoradian fiddlehead spirals, glow mushrooms, bell flowers and drifting spores.",
};

const DEG = Math.PI / 180;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);

// Palette (flat colours that glow or sit under paints)
const TEAL = "#2ff5d0";
const CYAN = "#4fd8ff";
const ICE = "#d9fff6";
const STALK = "#3b2f9c";
const TENDRIL = "#2a2478";
const FROND = "#4a2aa6";
const MUSH_STALK = "#b9a8f0";

export default function build() {
  const b = createBuilder({ name: "alien_glowplant" });
  const rand = rng(11);

  // ---------------------------------------------------------------------------------------------------------------
  // Textures

  const PETAL_OUT = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#3a1590"/><stop offset="0.55" stop-color="#b43be8"/><stop offset="1" stop-color="#ff8af0"/>
      </linearGradient></defs>
      <path d="M32 126 C6 104 0 52 32 3 C64 52 58 104 32 126Z" fill="url(#g)" stroke="#220a5c" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M32 120 L32 14" stroke="#9ffcf0" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M32 100 Q20 84 14 62 M32 100 Q44 84 50 62 M32 74 Q22 60 19 42 M32 74 Q42 60 45 42 M32 48 Q27 38 26 28 M32 48 Q37 38 38 28" stroke="#7ff0ff" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <circle cx="32" cy="9" r="3" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );
  const PETAL_IN = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#1a58d8"/><stop offset="0.6" stop-color="#3fd6ff"/><stop offset="1" stop-color="#eaffff"/>
      </linearGradient></defs>
      <path d="M32 126 C10 104 4 54 32 3 C60 54 54 104 32 126Z" fill="url(#g)" stroke="#0e2f84" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M32 118 L32 16" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M32 92 Q22 78 18 58 M32 92 Q42 78 46 58 M32 62 Q26 50 24 38 M32 62 Q38 50 40 38" stroke="#b6fff2" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const LEAF = svg(
    `<svg viewBox="0 0 96 128" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="lg" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#0b1f55"/><stop offset="1" stop-color="#1a4fa0"/>
      </linearGradient></defs>
      <path d="M48 127 C30 110 6 84 4 52 Q3 30 22 22 Q30 8 48 12 Q66 8 74 22 Q93 30 92 52 C90 84 66 110 48 127Z" fill="url(#lg)" stroke="#6bf0ff" stroke-width="2" stroke-linejoin="round"/>
      <path d="M48 124 L12 56 M48 124 L26 32 M48 124 L48 16 M48 124 L70 32 M48 124 L84 56" stroke="#34f0cf" stroke-width="2" stroke-linecap="round"/>
      <path d="M30 80 Q48 70 66 80 M20 62 Q48 48 76 62 M30 40 Q48 30 66 40" stroke="#1fa8d8" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <circle cx="48" cy="14" r="2.6" fill="#ffffff"/><circle cx="12" cy="55" r="2.4" fill="#ffffff"/><circle cx="84" cy="55" r="2.4" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );
  const FILAMENT = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="fg" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#2b3fb8"/><stop offset="1" stop-color="#8ffbe8"/>
      </linearGradient></defs>
      <path d="M16 62 C4 44 6 20 16 2 C26 20 28 44 16 62Z" fill="url(#fg)" stroke="#1a1f7a" stroke-width="2" stroke-linejoin="round"/>
      <path d="M16 58 L16 8" stroke="#e8fff9" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  const SPORE = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 2 L35 29 L62 32 L35 35 L32 62 L29 35 L2 32 L29 29Z" fill="#7ffbe6" opacity="0.8"/>
      <circle cx="32" cy="32" r="17" fill="#38e0d0" opacity="0.65"/>
      <circle cx="32" cy="32" r="10" fill="#b8fff0"/>
      <circle cx="32" cy="32" r="5" fill="#ffffff"/>
    </svg>`,
    { size: 96 },
  );
  let rayShapes = "";
  for (let k = 0; k < 12; k++) {
    const ang = (k * Math.PI) / 6;
    const len = k % 2 ? 30 : 48;
    const w = 0.15;
    rayShapes += `<polygon points="50,50 ${(50 + len * Math.cos(ang - w)).toFixed(1)},${(50 + len * Math.sin(ang - w)).toFixed(1)} ${(50 + len * Math.cos(ang + w)).toFixed(1)},${(50 + len * Math.sin(ang + w)).toFixed(1)}" fill="${k % 2 ? "#7ffbe6" : "#c8fff6"}" opacity="0.75"/>`;
  }
  const RAYS = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${rayShapes}<circle cx="50" cy="50" r="12" fill="#ffffff"/></svg>`,
    { size: 256 },
  );
  const GLYPH = svg(
    `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 40 a3 3 0 0 1 6 0 a7 7 0 0 1 -14 0 a11 11 0 0 1 22 0 a15 15 0 0 1 -30 0 a19 19 0 0 1 38 0" stroke="#2ff5d0" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <circle cx="54" cy="40" r="3.4" fill="#ffffff"/><circle cx="32" cy="40" r="2.6" fill="#ffffff"/>
      <circle cx="32" cy="8" r="2.6" fill="#7ff0ff"/><circle cx="32" cy="72" r="2.6" fill="#7ff0ff"/>
      <circle cx="10" cy="22" r="2" fill="#7ff0ff"/><circle cx="54" cy="64" r="2" fill="#7ff0ff"/>
    </svg>`,
    { size: 192 },
  );
  let gillRays = "";
  for (let k = 0; k < 16; k++) {
    const ang = (k * Math.PI) / 8;
    gillRays += `<path d="M${(32 + 6 * Math.cos(ang)).toFixed(1)} ${(32 + 6 * Math.sin(ang)).toFixed(1)} L${(32 + 29 * Math.cos(ang)).toFixed(1)} ${(32 + 29 * Math.sin(ang)).toFixed(1)}" stroke="#7ffbe6" stroke-width="2" stroke-linecap="round"/>`;
  }
  const GILLS = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="31" fill="#7a2cc8"/>${gillRays}
      <circle cx="32" cy="32" r="5" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Paints

  const BARK = paint((p, n) => {
    const lit = smoothstep(-0.6, 0.8, n.y);
    let c = mix("#16123a", "#3b2b86", lit * 0.6 + noise(p, 0.12, 1) * 0.4);
    const ridge = Math.abs(noise(p, 0.07, 4) - 0.5);
    if (ridge < 0.018) c = mix(c, "#2fe6c8", 0.85);
    else if (ridge < 0.034) c = mix(c, "#2a5fd0", 0.5);
    return c;
  });
  const ROOTP = paint((p, n) => {
    const lit = smoothstep(-0.6, 0.8, n.y);
    let c = mix("#120e30", "#33267a", lit * 0.7 + noise(p, 0.1, 7) * 0.3);
    const ridge = Math.abs(noise(p, 0.05, 9) - 0.5);
    if (ridge < 0.02) c = mix(c, "#2a7fe0", 0.6);
    return c;
  });
  const CALYXP = paint((p, n) => {
    const k = smoothstep(0.0, 0.2, p.y - 1.27);
    const c = mix("#3a1c8f", "#c24cf0", k);
    return mix(c, "#1b0c5c", 0.35 * smoothstep(0.2, -0.8, n.y));
  });
  const CAPP = spots("#5b24c8", ["#ff80e8", "#8ffff0"], { size: 0.045, amount: 0.5, seed: 3 });

  // ---------------------------------------------------------------------------------------------------------------
  // Trunk

  const TRUNK_PATH = catmull([
    [0, -0.01, 0],
    [0.035, 0.3, 0.03],
    [-0.04, 0.65, -0.02],
    [0.03, 1.0, 0.025],
    [0, 1.3, 0],
  ]);
  const trunkR = (t: number) => 0.07 + 0.12 * (1 - t) ** 3 + 0.045 * Math.exp(-(((t - 0.96) / 0.05) ** 2));
  const trunk = b.sweep(TRUNK_PATH, trunkR, {
    color: BARK,
    sides: 10,
    caps: { start: "flat", end: "round" },
    name: "trunk",
  });

  // Buttress roots with glowing veins
  const ROOTS = 7;
  for (let i = 0; i < ROOTS; i++) {
    const a = (i / ROOTS) * Math.PI * 2 + 0.3;
    const ca = Math.sin(a);
    const sa = Math.cos(a);
    const len = 0.5 + 0.25 * rand();
    const wob = (rand() - 0.5) * 0.12;
    const root = b.sweep(
      catmull([
        V(ca * 0.05, 0.34, sa * 0.05),
        V(ca * 0.16, 0.17, sa * 0.16),
        V(ca * len * 0.65 + sa * wob, 0.06, sa * len * 0.65 - ca * wob),
        V(ca * len, 0.012, sa * len),
      ]),
      [0.06, 0.012],
      { color: ROOTP, sides: 6, caps: { start: "none", end: "round" }, name: "root" },
    );
    glow(b.sweep(root.line(0, 0.003), [0.008, 0.002], { color: i % 2 ? CYAN : TEAL, sides: 4 }), 1.3);
  }

  // Spiralling glow veins up the trunk
  for (let k = 0; k < 2; k++) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 60; i++) {
      const t = 0.05 + (0.9 * i) / 60;
      pts.push(trunk.at(t, 200 + k * 180 + t * 900, 0.004).at.clone());
    }
    glow(b.sweep(catmull(pts), 0.0045, { color: k ? CYAN : TEAL, sides: 4, caps: { start: "flat", end: "flat" } }), 1.6);
  }

  // Glowing nodules scattered over the bark
  const nodHits = b.surface(trunk).scatter(24, {
    rng: rand,
    minDist: 0.08,
    filter: (h) => h.n.y > -0.3 && h.at.y > 0.15 && h.at.y < 1.2,
  });
  nodHits.forEach((h, i) => {
    glow(b.stick(new THREE.IcosahedronGeometry(0.014, 0), i % 3 ? TEAL : CYAN, h, { embed: 0.4 }), 1.8);
  });

  // Glyph decals
  [
    [0.36, 180],
    [0.56, 60],
    [0.7, 300],
  ].forEach(([t, deg]) => {
    const sp = trunk.at(t, deg);
    glow(b.decal(trunk, GLYPH, { at: sp.at, dir: sp.n, up: [0, 1, 0], size: [0.11, 0.14], segments: 8 }), 1.4);
  });

  // Fan leaves up the trunk
  const leafFrames: any[] = [];
  for (let i = 0; i < 7; i++) leafFrames.push(trunk.at(0.2 + i * 0.09, i * 137));
  glow(
    b.cards(leafFrames, LEAF, {
      size: [0.28, 0.42],
      lean: 18,
      bend: 28,
      flow: [0, -1, 0],
      vary: 0.25,
      rng: rand,
      sink: 0.05,
    }),
    0.8,
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Crown: calyx, orb, petals, rays

  b.lathe(
    [
      [0, -0.02],
      [0.07, -0.02],
      [0.12, 0.04],
      [0.16, 0.13],
      [0.17, 0.2],
      [0.145, 0.21],
      [0.13, 0.14],
      [0.09, 0.08],
      [0, 0.06],
    ],
    { at: V(0, 1.27, 0), segments: 10, color: CALYXP, name: "calyx" },
  );
  glow(b.part(new THREE.IcosahedronGeometry(0.075, 1), "#bffff4", { at: [0, 1.42, 0], flat: true }), 2.5);

  function petalRing(
    count: number,
    r: number,
    y: number,
    tiltDeg: number,
    size: [number, number],
    lean: number,
    bend: number,
    tex: THREE.Texture,
    phase: number,
    strength: number,
  ) {
    const frames: any[] = [];
    const flows: THREE.Vector3[] = [];
    const t = tiltDeg * DEG;
    for (let i = 0; i < count; i++) {
      const a = phase + (i / count) * Math.PI * 2;
      const out = V(Math.sin(a), 0, Math.cos(a));
      const axis = out.clone().multiplyScalar(Math.cos(t)).add(V(0, Math.sin(t), 0));
      frames.push(frame(out.clone().multiplyScalar(r).add(V(0, y, 0)), axis));
      flows.push(out.clone().multiplyScalar(-1));
    }
    glow(b.cards(frames, tex, { size, lean, bend, flow: (_f: unknown, i: number) => flows[i], sink: 0.05 }), strength);
  }
  petalRing(9, 0.15, 1.4, 40, [0.17, 0.46], 0, -10, PETAL_OUT, 0, 0.9);
  petalRing(9, 0.12, 1.42, 62, [0.15, 0.36], 0, 5, PETAL_OUT, Math.PI / 9, 0.9);
  petalRing(6, 0.06, 1.38, 80, [0.1, 0.26], 5, 20, PETAL_IN, 0.3, 1.1);

  // Light rays around the heart-orb
  glow(
    b.cards([frame(V(0, 1.1, 0), UP)], RAYS, { size: [0.7, 0.7], cross: true, flow: [0, 0, 1], sink: 0 }),
    1.5,
  );
  glow(
    b.cards([frame(V(0, 1.47, 0), UP)], RAYS, { size: [0.6, 0.6], lean: 90, flow: [1, 0, 0], mirror: true, sink: 0 }),
    1.3,
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Willow tendrils

  const leafletFrames: any[] = [];
  const N_T = 16;
  for (let i = 0; i < N_T; i++) {
    const a = (i / N_T) * Math.PI * 2 + (rand() - 0.5) * 0.2;
    const out = V(Math.sin(a), 0, Math.cos(a));
    const tang = V(Math.cos(a), 0, -Math.sin(a));
    const P = (r: number, y: number) => V(out.x * r, y, out.z * r);
    const y0 = 1.14 + 0.12 * rand();
    const reach = 0.8 + 0.35 * rand();
    const endY = 0.2 + 0.45 * rand();
    const sway = (rand() - 0.5) * 0.25;
    const p0 = P(0.05, y0);
    const p1 = P(0.28, y0 + 0.3);
    const p2 = P(reach * 0.85, y0 + 0.2).addScaledVector(tang, sway * 0.5);
    const p3 = P(reach, endY).addScaledVector(tang, sway);
    const path = bezier(p0, p1, p2, p3);
    const rt = (t: number) => 0.016 * (1 - t) + 0.004 * t;
    const base = b.sweep(path, rt, { sides: 5, color: TENDRIL, caps: { start: "none", end: "round" }, name: "tendril" });
    const over = b.sweep(path, (t) => rt(t) + 0.0022, {
      from: 0.3,
      sides: 5,
      color: "#2fe6d0",
      bands: [
        [0.55, "#2a9fe8"],
        [0.8, "#2fe6d0"],
        [1, "#b8fff0"],
      ],
      caps: { start: "flat", end: "round" },
    });
    glow(over, 1.4);
    [0.45, 0.65, 0.85].forEach((t, k) => {
      glow(b.part(new THREE.IcosahedronGeometry(0.012, 0), k % 2 ? CYAN : ICE, { at: over.at(t).at, flat: true }), 1.8);
    });
    glow(b.part(new THREE.IcosahedronGeometry(0.028, 1), ICE, { at: path.at(1), flat: true }), 2.2);
    [0.15, 0.3, 0.45, 0.6, 0.75].forEach((t, k) => leafletFrames.push(base.at(t, k % 2 ? 90 : 270)));
  }
  glow(
    b.cards(leafletFrames, FILAMENT, { size: [0.04, 0.09], lean: 50, flow: [0, -1, 0], vary: 0.3, rng: rand, spin: 20 }),
    0.9,
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Helicoradians: stalk topped with a ring of glowing fiddlehead spirals

  function fiddle(P: THREE.Vector3, rhat: THREE.Vector3, size: number, alpha0: number, curl: number) {
    const pts = [P.clone()];
    const cur = P.clone();
    const n = 14;
    for (let k = 0; k < n; k++) {
      const u = k / n;
      const len = size * 0.11 * (1 - 0.78 * u);
      const a = (alpha0 + curl * u) * DEG;
      const d = rhat.clone().multiplyScalar(Math.sin(a)).add(V(0, Math.cos(a), 0));
      cur.addScaledVector(d, len);
      pts.push(cur.clone());
    }
    return pts;
  }

  const HELIX = [
    { a: 35, r: 0.62, h: 0.38, c: ["#ff5ad8", "#ffd0f4"], bud: "#ffe9fb" },
    { a: 120, r: 0.85, h: 0.3, c: ["#3ad0ff", "#d0fbff"], bud: "#e8ffff" },
    { a: 215, r: 0.7, h: 0.45, c: ["#ff5ad8", "#ffd0f4"], bud: "#ffe9fb" },
    { a: 300, r: 0.95, h: 0.34, c: ["#3ad0ff", "#d0fbff"], bud: "#e8ffff" },
  ];
  for (const hx of HELIX) {
    const ar = hx.a * DEG;
    const P = V(Math.sin(ar) * hx.r, 0, Math.cos(ar) * hx.r);
    const lx = (rand() - 0.5) * 0.1;
    const lz = (rand() - 0.5) * 0.1;
    const T = P.clone().add(V(lx, hx.h, lz));
    b.sweep(catmull([P.clone(), P.clone().add(V(lx * 0.4, hx.h * 0.5, lz * 0.4)), T]), [0.022, 0.012], {
      color: STALK,
      sides: 6,
      caps: { start: "flat", end: "round" },
      name: "helixStalk",
    });
    glow(b.part(new THREE.IcosahedronGeometry(0.03, 1), hx.bud, { at: T.clone().add(V(0, 0.015, 0)), flat: true }), 2);
    const FR = 7;
    for (let j = 0; j < FR; j++) {
      const phi = (j / FR) * Math.PI * 2 + hx.a;
      const rhat = V(Math.sin(phi), 0, Math.cos(phi));
      const start = T.clone().addScaledVector(rhat, 0.01);
      const pts = fiddle(start, rhat, 0.2 + 0.1 * rand(), 18 + 30 * rand(), 230 + 40 * rand());
      const path = catmull(pts);
      const rf = (t: number) => 0.011 * (1 - t) + 0.003 * t;
      b.sweep(path, rf, { sides: 5, color: FROND, caps: { start: "none", end: "round" }, name: "frond" });
      glow(
        b.sweep(path, (t) => rf(t) + 0.0028, {
          from: 0.4,
          sides: 5,
          color: hx.c[0],
          bands: [
            [0.75, hx.c[0]],
            [1, hx.c[1]],
          ],
          caps: { start: "flat", end: "round" },
        }),
        1.4,
      );
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Glow mushrooms

  function mushroom(x: number, z: number, s: number, lx: number, lz: number) {
    const h = 0.07 * s + 0.03;
    const tx = x + lx;
    const tz = z + lz;
    b.rod([x, 0, z], [tx, h, tz], [0.017 * s, 0.011 * s], MUSH_STALK, { sides: 6 });
    const r = 0.075 * s;
    const ch = 0.05 * s;
    const cap = b.lathe(
      [
        [0, 0],
        [r * 0.97, 0],
        [r, ch * 0.25],
        [r * 0.8, ch * 0.65],
        [r * 0.45, ch * 0.93],
        [0, ch],
      ],
      { at: V(tx, h - 0.004, tz), segments: 10, color: CAPP, name: "cap" },
    );
    glow(
      b.part(new THREE.CircleGeometry(r * 0.94, 14), "#ffffff", {
        at: [tx, h - 0.007, tz],
        dir: [0, -1, 0],
        axis: "z",
        texture: GILLS,
      }),
      1.3,
    );
    if (s > 0.8) {
      const dots = b.surface(cap).scatter(4, { rng: rand, filter: (hit) => hit.n.y > 0.4 });
      dots.forEach((hit, i) => {
        glow(b.stick(new THREE.IcosahedronGeometry(0.009 * s, 0), i % 2 ? "#9ffff0" : "#ff9af0", hit, { embed: 0.4 }), 1.8);
      });
    }
  }
  [
    [0.32, 0.28, 1.2, 0.02, 0.0],
    [-0.4, 0.2, 0.9, -0.02, 0.01],
    [0.15, -0.42, 1.4, 0.0, -0.03],
    [-0.28, -0.35, 0.7, 0.01, 0.0],
    [0.55, -0.2, 1.0, 0.03, 0.0],
    [-0.62, -0.05, 1.3, -0.03, 0.02],
    [0.1, 0.6, 0.8, 0.0, 0.02],
    [-0.2, 0.55, 1.1, 0.02, 0.02],
    [0.7, 0.3, 0.6, 0.0, 0.01],
  ].forEach(([x, z, s, lx, lz]) => mushroom(x, z, s, lx, lz));

  // ---------------------------------------------------------------------------------------------------------------
  // Bell flowers on arching stems

  const BELL_PROFILE: [number, number][] = [
    [0, 0],
    [0.02, 0.004],
    [0.04, 0.03],
    [0.052, 0.075],
    [0.066, 0.11],
    [0.05, 0.105],
    [0.038, 0.075],
    [0.024, 0.032],
    [0, 0.018],
  ];
  [
    [0.45, 20],
    [0.6, 150],
    [0.35, 250],
    [0.7, 330],
  ].forEach(([t, deg]) => {
    const sp = trunk.at(t, deg);
    const out = V(sp.n.x, 0, sp.n.z).normalize();
    const p0 = sp.at.clone().addScaledVector(sp.n, -0.02);
    const p1 = p0.clone().addScaledVector(out, 0.12).add(V(0, 0.1, 0));
    const p2 = p0.clone().addScaledVector(out, 0.26).add(V(0, 0.08, 0));
    const p3 = p0.clone().addScaledVector(out, 0.34).add(V(0, -0.02, 0));
    b.sweep(catmull([p0, p1, p2, p3]), [0.01, 0.005], { color: STALK, sides: 5, caps: { start: "none", end: "round" } });
    glow(b.lathe(BELL_PROFILE, { at: p3, axis: [0, -1, 0], segments: 8, color: "#3fb8ff" }), 0.7);
    glow(b.part(new THREE.IcosahedronGeometry(0.014, 0), "#e8ffff", { at: p3.clone().add(V(0, -0.085, 0)), flat: true }), 2);
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Drifting spores

  const sporeFrames: any[] = [];
  for (let i = 0; i < 30; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 0.1 + 0.9 * Math.sqrt(rand());
    sporeFrames.push(frame(V(Math.sin(a) * rr, 0.25 + 1.7 * rand(), Math.cos(a) * rr), UP));
  }
  glow(b.cards(sporeFrames, SPORE, { size: [0.05, 0.05], cross: true, vary: 0.4, rng: rand, sink: 0 }), 2);
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 0.15 + 0.8 * rand();
    glow(
      b.part(new THREE.IcosahedronGeometry(0.006, 0), i % 2 ? TEAL : ICE, {
        at: [Math.sin(a) * rr, 0.3 + 1.6 * rand(), Math.cos(a) * rr],
        flat: true,
      }),
      2,
    );
  }

  return b.root;
}
```