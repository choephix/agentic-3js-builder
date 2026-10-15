import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  polyline,
  noise,
  mix,
  smoothstep,
  paint,
  mottle,
  grain,
  patches,
  svg,
} from "../../../../src/index";
import { metal, coil } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frost-forged Battle Axe",
  description:
    "A Freljord-style bearded battle axe in blued steel and gold: a glowing frost-core crystal in a rune-carved crescent blade, fur-wrapped grip, ice fangs and a hanging rune charm, planted on a snowy stone plinth with ice crystals and a cairn.",
};

type OP = [number, number] | [number, number, "sharp"];
type V3t = [number, number, number];

// ---------------------------------------------------------------- scale constants
const HEAD_Y = 1.25; // blade centre height
const HAFT_R = 0.03;
const CX = 0.21; // crystal window centre (x) on the blade
const GRIP_LO = 0.34;
const GRIP_HI = 0.62;

// ---------------------------------------------------------------- palette
const ICE = "#8be9ff";
const ICE_W = "#d9faff";
const ICE_D = "#3fb4e8";
const NAVY = "#0a1426";
const DEEP = "#102a4a";
const LEATHER_DARK = "#2b1a12";
const SNOW = "#eef9ff";

// ---------------------------------------------------------------- paints
const STEEL = metal("blued", { polish: 0.5 });
const SOCKET_STEEL = metal("blued", { polish: 0.3, seed: 3 });
const PLATE_BASE = metal("blued", { polish: 0.25, seed: 7 });
const PLATE = paint((p, n) => mix(PLATE_BASE.at(p, n), "#0b1426", 0.5));
const GOLD = metal("gilt");
const GOLD_OLD = metal("brass", { tarnish: 0.4 });

// Frost creeping in from the cutting edge, cyan at the bevel.
const FROST = paint((p, n) => {
  const nz = noise(p, 0.045, 3);
  const edge =
    smoothstep(0.26, 0.42, p.x) + (nz - 0.5) * 0.45 + 0.25 * smoothstep(0.1, -0.8, n.y) * smoothstep(0.1, 0.4, p.x);
  const base = STEEL.at(p, n);
  const f = smoothstep(0.45, 0.8, edge);
  const lit = mix(base, mix("#8fdcf5", "#f2fcff", nz), f);
  const rim = smoothstep(0.3, 0.55, edge) * (1 - f);
  return mix(lit, "#4cc9f0", rim * 0.5);
});

const WOOD_GRAIN = grain("#3a2a22", "#5a4030", { size: 0.012, axis: "y" });
const WOOD = paint((p, n) => {
  const w = WOOD_GRAIN.at(p, n);
  const f = smoothstep(0.34, 0.16, p.y) * (0.4 + 0.6 * noise(p, 0.04, 8));
  return mix(w, "#dff6ff", Math.min(1, f) * 0.75);
});
const LEATHER = mottle("#4a3022", "#6b4630", { size: 0.03 });

const SLATE = patches("#2f3645", ["#4a5365", "#566077", "#3f485a"], { size: 0.09, gap: 0.07, seed: 4 });
const SNOWP = mottle(SNOW, "#cfe6f5", { size: 0.06, seed: 2 });
const PLINTH = paint((p, n) => {
  if (n.y > 0.8) {
    const t = smoothstep(0.4, 0.5, noise(p, 0.09, 5));
    return mix(SLATE.at(p, n), SNOWP.at(p, n), t);
  }
  return SLATE.at(p, n);
});

// ---------------------------------------------------------------- rune glyphs (10 x 16 boxes)
const GLYPHS = [
  "M2 0 L2 16 M2 4 L8 8",
  "M8 0 L2 8 L8 16 M2 8 L10 8",
  "M1 0 L9 8 L1 16 M9 0 L9 16",
  "M5 0 L5 16 M1 5 L5 9 L9 5",
  "M1 2 L9 2 L1 14 L9 14",
  "M2 0 L2 16 L9 10 L2 6",
  "M5 0 L1 8 L5 16 L9 8 Z",
  "M1 16 L5 0 L9 16 M3 10 L7 10",
];

function runeBandTexture(n: number, offset: number) {
  let g = "";
  for (let i = 0; i < n; i++) {
    const x = 6 + i * 19.5;
    g += `<g transform="translate(${x},3) scale(1.25,1.2)"><path d="${GLYPHS[(i * 3 + offset) % GLYPHS.length]}"/></g>`;
  }
  return svg(
    `<svg viewBox="0 0 120 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="#1b6f9a" stroke-width="4.6" opacity="0.85">${g}</g><g stroke="#aaf6ff" stroke-width="2.2">${g}</g></g></svg>`,
    { size: 512 },
  );
}

function plinthRingTexture() {
  let g = "";
  for (let i = 0; i < 12; i++) {
    g += `<g transform="translate(100,100) rotate(${i * 30}) translate(-5,-88)"><path d="${GLYPHS[i % GLYPHS.length]}"/></g>`;
  }
  return svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="100" cy="100" r="96" stroke="#1b6f9a" stroke-width="5"/><circle cx="100" cy="100" r="64" stroke="#1b6f9a" stroke-width="5"/>
      <circle cx="100" cy="100" r="96" stroke="#9af2ff" stroke-width="2.4"/><circle cx="100" cy="100" r="64" stroke="#9af2ff" stroke-width="2.4"/>
      <g stroke="#1b6f9a" stroke-width="6">${g}</g><g stroke="#aaf6ff" stroke-width="3">${g}</g></g></svg>`,
    { size: 512 },
  );
}

function sigilTexture() {
  let arms = "";
  for (let k = 0; k < 6; k++) {
    arms += `<path transform="rotate(${k * 60} 50 50)" d="M50 50 V14 M50 26 L41 17 M50 26 L59 17 M50 38 L44 32 M50 38 L56 32"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="#3a2a10" stroke-width="7"><circle cx="50" cy="50" r="45"/>${arms}</g>
      <g stroke="#f5d27a" stroke-width="3.6"><circle cx="50" cy="50" r="45"/>${arms}</g></g>
      <polygon points="50,42 58,50 50,58 42,50" fill="#f5d27a" stroke="#3a2a10" stroke-width="2"/></svg>`,
    { size: 256 },
  );
}

function crackTexture() {
  const d =
    "M10 8 L30 30 L26 52 L48 70 L60 96 M30 30 L52 26 L70 10 M26 52 L8 64 M48 70 L74 66 L92 80 M52 26 L60 44";
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="${d}" stroke="#7fdcff" stroke-width="5.5" opacity="0.35"/><path d="${d}" stroke="#ffffff" stroke-width="2.4" opacity="0.9"/></g></svg>`,
    { size: 256 },
  );
}

function furTexture() {
  return svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#d3e3f3"/><stop offset="1" stop-color="#5b6f93"/></linearGradient></defs>
      <g fill="url(#f)" stroke="#8fa3c4" stroke-width="1.2" stroke-linejoin="round">
      <path d="M20 80 Q8 50 14 2 Q22 32 30 80Z"/><path d="M4 80 Q2 56 5 26 Q14 50 16 80Z"/><path d="M26 80 Q30 52 36 20 Q40 54 36 80Z"/></g></svg>`,
    { size: 128 },
  );
}

function tassel() {
  // drawn root-at-bottom: the card hangs flipped
  let s = "";
  for (let i = 0; i < 5; i++) {
    const x = 6 + i * 3;
    s += `<path d="M12 56 Q${x} 30 ${x - 1 + i * 0.5} 4" stroke="#6b4630" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  }
  return svg(
    `<svg viewBox="0 0 24 60" xmlns="http://www.w3.org/2000/svg">${s}<rect x="8" y="50" width="8" height="8" rx="2" fill="#e8c15a" stroke="#3a2a10" stroke-width="1.2"/></svg>`,
    { size: 128 },
  );
}

function tagTexture() {
  return svg(
    `<svg viewBox="0 0 40 54" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g transform="translate(12,10) scale(1.6,1.7)"><path d="${GLYPHS[2]}" stroke="#1b6f9a" stroke-width="3.6"/><path d="${GLYPHS[2]}" stroke="#aaf6ff" stroke-width="1.8"/></g></g></svg>`,
    { size: 256 },
  );
}

function snowTexture() {
  return svg(
    `<svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg"><path d="M2 24 Q2 12 10 12 Q13 3 22 6 Q30 4 32 13 Q39 14 38 24Z" fill="#cfe6f5"/>
      <path d="M5 24 Q5 15 12 15 Q15 7 22 9 Q29 8 30 15 Q36 17 35 24Z" fill="#f4fcff"/></svg>`,
    { size: 128 },
  );
}

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "frost_axe" });
  const R = rng(11);

  const root = b.joint("root", { at: [0, 0, 0] });
  const AXE = b.joint("axe", { parent: root, at: [0, 0.1, 0], dir: [0, 1, 0] });
  const CHARM = b.joint("charm", { parent: AXE, at: [-0.05, 0.98, 0], dir: [0, -1, 0] });

  const RUNES_A = runeBandTexture(6, 0);
  const RUNES_B = runeBandTexture(6, 3);
  const RING = plinthRingTexture();
  const SIGIL = sigilTexture();
  const CRACKS = crackTexture();
  const FUR = furTexture();
  const TASSEL = tassel();
  const TAG = tagTexture();
  const SNOWT = snowTexture();

  // ------------------------------------------------------------ helpers
  const icicle = (base: V3t, dir: V3t, len: number, r: number, color: string, strength = 0.6, bone = AXE) =>
    glow(b.spike(base, dir, len, r, { color, bone, sides: 5, smooth: false }), strength);

  const decal = (
    tex: THREE.Texture,
    w: number,
    h: number,
    at: V3t,
    side: 1 | -1,
    strength = 0,
    bone = AXE,
  ) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir: [0, 0, side], axis: "z", texture: tex, bone });
    if (strength > 0) glow(p, strength);
    return p;
  };

  const band = (y: number, r0: number, r1: number, h: number, color = GOLD, bone = AXE) =>
    b.lathe(
      [
        [r0, -h],
        [r1, -h],
        [r1, h],
        [r0, h],
      ],
      { at: [0, y, 0], segments: 8, color, bone },
    );

  const studRing = (y: number, r: number, n: number, rad = 0.008) => {
    b.ring(frame([0, y, 0], [0, 1, 0]), { count: n, radius: r }, (it) =>
      b.stick(new THREE.SphereGeometry(rad, 6, 4), GOLD, it, { embed: 0.35, bone: AXE }),
    );
  };

  const crystal = (base: V3t, dir: V3t, h: number, r: number, color: string, strength = 1.1) => {
    const d = new THREE.Vector3(...dir).normalize();
    const bp = new THREE.Vector3(...base);
    const c1 = bp.clone().addScaledVector(d, h * 0.325);
    const c2 = bp.clone().addScaledVector(d, h * 0.65 + h * 0.175);
    glow(
      b.part(new THREE.CylinderGeometry(r * 0.92, r, h * 0.65, 6, 1), color, {
        at: c1.toArray() as V3t,
        dir: d.toArray() as V3t,
        bone: root,
        flat: true,
      }),
      strength,
    );
    glow(
      b.part(new THREE.ConeGeometry(r * 0.92, h * 0.35, 6), color, {
        at: c2.toArray() as V3t,
        dir: d.toArray() as V3t,
        bone: root,
        flat: true,
      }),
      strength,
    );
  };

  const scaleOutline = (pts: OP[], cx: number, cy: number, k: number): OP[] =>
    pts.map((p) =>
      p.length === 3
        ? ([cx + (p[0] - cx) * k, cy + (p[1] - cy) * k, "sharp"] as OP)
        : ([cx + (p[0] - cx) * k, cy + (p[1] - cy) * k] as OP),
    );

  // ------------------------------------------------------------ PLINTH
  b.lathe(
    [
      [0, 0],
      [0.38, 0],
      [0.38, 0.06],
      [0.33, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0, 0], segments: 6, color: PLINTH, bone: root, name: "plinth" },
  );
  // snow mound around the haft
  b.lathe(
    [
      [0, 0.099],
      [0.2, 0.099],
      [0.19, 0.115],
      [0.12, 0.14],
      [0.05, 0.152],
      [0, 0.154],
    ],
    { at: [0, 0, 0], segments: 9, smoothing: 1, color: SNOWP, bone: root, name: "snowMound" },
  );
  // dim rune ring on the stone
  glow(
    b.part(new THREE.CircleGeometry(0.31, 28), "#ffffff", {
      at: [0, 0.102, 0],
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      texture: RING,
      bone: root,
    }),
    0.55,
  );
  // rim rocks
  for (let i = 0; i < 10; i++) {
    const a = ((i * 36 + (R() - 0.5) * 14) * Math.PI) / 180;
    const front = Math.max(0, Math.sin(a + Math.PI / 2)) > 0.8;
    const rad = (front ? 0.035 : 0.045) + R() * 0.025;
    b.part(new THREE.IcosahedronGeometry(rad, 0), SLATE, {
      at: [Math.sin(a) * 0.345, 0.092, Math.cos(a) * 0.345],
      scale: [1, 0.7, 1],
      rotation: [R() * 60, R() * 360, R() * 60],
      bone: root,
      flat: true,
    });
  }
  // snow tufts
  b.cards(
    Array.from({ length: 8 }, (_, i) => {
      const a = ((i * 45 + 14) * Math.PI) / 180;
      return frame([Math.sin(a) * 0.285, 0.1, Math.cos(a) * 0.285], [0, 1, 0]);
    }),
    SNOWT,
    { size: [0.08, 0.05], lean: 15, flow: [0, 0, 1], cross: true, vary: 0.25, rng: rng(3), bone: root },
  );

  // ------------------------------------------------------------ ICE CLUSTER (back left)
  const cluster: [V3t, V3t, number, number, string][] = [
    [[-0.22, 0.09, -0.15], [-0.15, 1, -0.1], 0.4, 0.04, ICE],
    [[-0.27, 0.09, -0.03], [-0.35, 1, 0.1], 0.3, 0.032, ICE_D],
    [[-0.14, 0.09, -0.24], [0.05, 1, -0.3], 0.27, 0.03, ICE_W],
    [[-0.24, 0.09, -0.2], [-0.4, 1, -0.2], 0.22, 0.026, ICE],
    [[-0.3, 0.09, -0.11], [-0.6, 1, -0.05], 0.18, 0.024, ICE_D],
  ];
  for (const [base, dir, h, r, c] of cluster) crystal(base, dir, h, r, c);

  // ------------------------------------------------------------ CAIRN (back right)
  const stones: [V3t, number, [number, number, number]][] = [
    [[0.2, 0.145, -0.18], 0.075, [1.1, 0.75, 1]],
    [[0.205, 0.225, -0.18], 0.055, [1, 0.8, 1.05]],
    [[0.2, 0.285, -0.18], 0.04, [1.1, 0.8, 1]],
  ];
  stones.forEach(([at, r, sc], i) =>
    b.part(new THREE.IcosahedronGeometry(r, 0), SLATE, {
      at,
      scale: sc,
      rotation: [10 * i, 40 * i + 15, 8],
      bone: root,
      flat: true,
    }),
  );
  b.cards([frame([0.2, 0.31, -0.18], [0, 1, 0])], FUR, {
    size: [0.06, 0.085],
    lean: 70,
    flow: [1, 0, 0.4],
    cross: true,
    bone: root,
  });

  // ------------------------------------------------------------ POMMEL AND STAKE
  icicle([0, 0.2, 0], [0, -1, 0], 0.14, 0.034, ICE_D, 0.8, root);
  b.lathe(
    [
      [0, -0.02],
      [0.04, -0.02],
      [0.055, 0.0],
      [0.05, 0.04],
      [0.04, 0.06],
      [0.03, 0.09],
      [0, 0.09],
    ],
    { at: [0, 0.2, 0], segments: 8, color: SOCKET_STEEL, bone: AXE, name: "pommel" },
  );
  band(0.205, 0.045, 0.062, 0.008);
  b.ring(frame([0, 0.215, 0], [0, -1, 0]), { count: 6, radius: 0.05, tilt: 50 }, (it) =>
    glow(b.spike(it, it, 0.06 + R() * 0.03, 0.013, { color: ICE_W, bone: AXE, sides: 5, smooth: false }), 0.6),
  );
  // frost growth around the stake base
  b.ring(frame([0, 0.15, 0], [0, 1, 0]), { count: 7, radius: 0.05, tilt: 40 }, (it) =>
    glow(b.spike(it, it, 0.05 + R() * 0.05, 0.014, { color: it.i % 2 ? ICE : ICE_W, bone: root, sides: 5, smooth: false }), 0.8),
  );

  // ------------------------------------------------------------ HAFT AND GRIP
  b.rod([0, 0.28, 0], [0, 1.47, 0], HAFT_R, { color: WOOD, bone: AXE, name: "haft" });
  band(0.31, HAFT_R * 0.9, 0.04, 0.01);
  band(0.66, HAFT_R * 0.9, 0.04, 0.01, GOLD_OLD);
  band(0.7, HAFT_R * 0.9, 0.038, 0.006, GOLD_OLD);
  studRing(0.31, 0.04, 8);
  studRing(0.68, 0.035, 8, 0.007);

  const grip = b.rod([0, GRIP_LO, 0], [0, GRIP_HI, 0], 0.036, { color: LEATHER, bone: AXE, name: "gripCore" });
  band(GRIP_LO, 0.032, 0.045, 0.012);
  band(GRIP_HI, 0.032, 0.045, 0.012);
  b.sweep(coil([0, GRIP_LO + 0.01, 0], [0, GRIP_HI - 0.01, 0], 0.039, 6), 0.006, {
    color: LEATHER_DARK,
    bone: AXE,
    name: "gripStrap",
  });
  // fur wrap
  const furRing = (y: number, n: number, rad: number, lean: number, len: number, seed: number) => {
    const items = b.ring(frame([0, y, 0], [0, 1, 0]), { count: n, radius: rad }).items;
    b.cards(items, FUR, {
      size: [len * 0.5, len],
      lean,
      bend: 20,
      flow: [0, -1, 0],
      vary: 0.25,
      spin: 12,
      rng: rng(seed),
      bone: AXE,
    });
  };
  furRing(GRIP_HI + 0.015, 14, 0.04, 55, 0.11, 21);
  furRing(GRIP_HI - 0.01, 10, 0.04, 70, 0.09, 22);
  furRing(GRIP_LO + 0.02, 12, 0.04, 40, 0.09, 23);
  b.cards(
    b.surface(grip).scatter(44, { rng: rng(5), minDist: 0.024 }),
    FUR,
    { size: [0.035, 0.08], lean: 75, bend: 15, flow: [0, -1, 0], cross: true, vary: 0.3, rng: rng(6), bone: AXE },
  );

  // ------------------------------------------------------------ SOCKET AND COLLAR
  b.lathe(
    [
      [0, -0.22],
      [0.045, -0.22],
      [0.06, -0.19],
      [0.055, -0.1],
      [0.07, 0.0],
      [0.055, 0.1],
      [0.06, 0.19],
      [0.045, 0.22],
      [0, 0.22],
    ],
    { at: [0, HEAD_Y, 0], segments: 8, color: SOCKET_STEEL, bone: AXE, name: "socket" },
  );
  band(HEAD_Y - 0.17, 0.05, 0.068, 0.012);
  band(HEAD_Y, 0.062, 0.082, 0.014);
  band(HEAD_Y + 0.17, 0.05, 0.068, 0.012);
  // gems front and back
  b.ring(frame([0, HEAD_Y, 0], [0, 1, 0]), { count: 2, radius: 0.08, fromDeg: 0, toDeg: 180 }, (it) =>
    glow(b.stick(new THREE.OctahedronGeometry(0.018), ICE, it, { embed: 0.2, bone: AXE, flat: true }), 1.4),
  );
  // ice crown on top, fangs underneath, polearm spike
  b.ring(frame([0, HEAD_Y + 0.2, 0], [0, 1, 0]), { count: 6, radius: 0.045, tilt: 50 }, (it) =>
    glow(b.spike(it, it, 0.09 + (it.i % 2) * 0.04, 0.016, { color: ICE_W, bone: AXE, sides: 5, smooth: false }), 0.7),
  );
  b.ring(frame([0, HEAD_Y - 0.2, 0], [0, -1, 0]), { count: 4, radius: 0.05, tilt: 55 }, (it) =>
    glow(b.spike(it, it, 0.1, 0.018, { color: ICE_W, bone: AXE, sides: 5, smooth: false }), 0.7),
  );
  b.spike([0, HEAD_Y + 0.22, 0], [0, 1, 0], 0.28, 0.034, { color: STEEL, bone: AXE, sides: 6, smooth: false });
  // langets
  const langet: [number, number, number, number][] = [
    [0.036, 0, 0.016, 0.012],
    [-0.036, 0, 0.016, 0.012],
    [0, 0.036, 0.012, 0.016],
    [0, -0.036, 0.012, 0.016],
  ];
  for (const [lx, lz, w, d] of langet) {
    b.part(new THREE.BoxGeometry(w, 0.33, d), SOCKET_STEEL, { at: [lx, 0.865, lz], bone: AXE });
    b.spike([lx, 0.7, lz], [0, -1, 0], 0.05, 0.009, { color: GOLD, bone: AXE, sides: 4, smooth: false });
    b.stick(new THREE.SphereGeometry(0.007, 6, 4), GOLD, frame([lx * 1.2, 0.99, lz * 1.2], [lx, 0, lz]), {
      embed: 0.3,
      bone: AXE,
    });
  }

  // ------------------------------------------------------------ BLADE
  const BLADE_OUT: OP[] = [
    [0.04, 0.17, "sharp"],
    [0.18, 0.25],
    [0.32, 0.31],
    [0.47, 0.36, "sharp"],
    [0.41, 0.22],
    [0.37, 0.08],
    [0.36, 0.0],
    [0.37, -0.08],
    [0.41, -0.22],
    [0.47, -0.36, "sharp"],
    [0.32, -0.31],
    [0.18, -0.25],
    [0.04, -0.17, "sharp"],
  ];
  b.extrude(BLADE_OUT, {
    at: [0, HEAD_Y, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.05,
    bevel: 0.012,
    smoothing: 1,
    color: FROST,
    bone: AXE,
    name: "bladeBody",
  });
  const INSET = scaleOutline(BLADE_OUT, 0.22, 0, 0.72);
  b.extrude(INSET, {
    at: [0, HEAD_Y, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.058,
    bevel: 0.005,
    smoothing: 1,
    color: PLATE,
    bone: AXE,
    name: "bladePlate",
  });
  // back fluke
  b.extrude(
    [
      [-0.03, 0.11, "sharp"],
      [-0.14, 0.09],
      [-0.32, 0.0, "sharp"],
      [-0.14, -0.09],
      [-0.03, -0.11, "sharp"],
    ],
    {
      at: [0, HEAD_Y, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.04,
      bevel: 0.01,
      smoothing: 1,
      color: STEEL,
      bone: AXE,
      name: "fluke",
    },
  );
  for (const s of [1, -1] as const) {
    decal(SIGIL, 0.1, 0.1, [-0.13, HEAD_Y, s * 0.0215], s);
    b.stick(new THREE.SphereGeometry(0.008, 6, 4), GOLD, frame([-0.065, HEAD_Y + 0.045, s * 0.02], [0, 0, s]), {
      embed: 0.3,
      bone: AXE,
    });
    b.stick(new THREE.SphereGeometry(0.008, 6, 4), GOLD, frame([-0.065, HEAD_Y - 0.045, s * 0.02], [0, 0, s]), {
      embed: 0.3,
      bone: AXE,
    });
  }

  // gold rim around the inset plate and glowing bevel line by the edge
  const edgeLine = [
    [0.435, 0.325],
    [0.395, 0.215],
    [0.352, 0.08],
    [0.342, 0],
    [0.352, -0.08],
    [0.395, -0.215],
    [0.435, -0.325],
  ];
  for (const s of [1, -1] as const) {
    b.sweep(
      polyline(INSET.map((p) => [p[0], HEAD_Y + p[1], s * 0.0295]), { closed: true }),
      0.005,
      { color: GOLD, bone: AXE, name: "plateRim" },
    );
    glow(
      b.sweep(
        catmull(edgeLine.map(([x, y]) => [x, HEAD_Y + y, s * 0.027])),
        0.006,
        { color: ICE, bone: AXE, name: "edgeGlow" },
      ),
      1.4,
    );
  }

  // horn extensions in ice
  for (const s of [1, -1]) {
    icicle([0.43, HEAD_Y + s * 0.31, 0], [0.4, s, 0], 0.13, 0.022, ICE_W, 0.6);
  }
  // frost crystals growing from the edge
  for (const y of [0.2, 0.1, 0, -0.1, -0.2]) {
    const x = 0.36 + 0.9 * y * y - 0.012;
    icicle([x, HEAD_Y + y, 0], [1, y * 3, 0], 0.06 + R() * 0.03, 0.016, y === 0 ? ICE : ICE_W, 0.7);
  }

  // crystal window
  const cz = 0.03;
  for (const s of [1, -1] as const) {
    b.lathe(
      [
        [0.07, 0],
        [0.108, 0],
        [0.108, 0.012],
        [0.098, 0.018],
        [0.07, 0.012],
      ],
      { at: [CX, HEAD_Y, s * cz], axis: [0, 0, s], segments: 10, color: GOLD, bone: AXE, name: "bezel" },
    );
    b.part(new THREE.CylinderGeometry(0.074, 0.074, 0.004, 10), NAVY, {
      at: [CX, HEAD_Y, s * (cz + 0.0015)],
      dir: [0, 0, s],
      bone: AXE,
    });
    // stud ring on bezel
    b.ring(frame([CX, HEAD_Y, s * (cz + 0.013)], [0, 0, s]), { count: 12, radius: 0.095, fromDeg: 15, toDeg: 345 }, (it) =>
      b.stick(new THREE.SphereGeometry(0.006, 6, 4), GOLD, it, { embed: 0.3, bone: AXE }),
    );
    // shards ring
    b.ring(frame([CX, HEAD_Y, s * (cz + 0.012)], [0, 0, s]), { count: 6, radius: 0.1, fromDeg: 30, toDeg: 330 }, (it) =>
      glow(
        b.spike(it, it, it.i % 2 ? 0.03 : 0.05, 0.012, { color: it.i % 2 ? ICE_W : ICE, bone: AXE, sides: 4, smooth: false }),
        1.1,
      ),
    );
    // rune bands above and below
    decal(s > 0 ? RUNES_A : RUNES_B, 0.24, 0.048, [CX - 0.01, HEAD_Y + 0.15, s * 0.0305], s, 1.2);
    decal(s > 0 ? RUNES_B : RUNES_A, 0.24, 0.048, [CX - 0.01, HEAD_Y - 0.15, s * 0.0305], s, 1.2);
    // frost cracks
    decal(CRACKS, 0.16, 0.16, [0.31, HEAD_Y - 0.17, s * 0.0318], s);
  }
  // the frost-core itself, through the blade
  glow(
    b.part(new THREE.OctahedronGeometry(0.08), ICE, {
      at: [CX, HEAD_Y, 0],
      scale: [0.75, 1.5, 0.8],
      bone: AXE,
      flat: true,
      name: "frostCore",
    }),
    1.6,
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.04), "#ffffff", {
      at: [CX, HEAD_Y, 0],
      scale: [0.75, 1.5, 1.4],
      bone: AXE,
      flat: true,
      name: "frostHeart",
    }),
    2.2,
  );

  // ------------------------------------------------------------ CHARM
  b.sweep(
    catmull(
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return [Math.sin(a) * 0.048, 0.985, Math.cos(a) * 0.048];
      }),
      { closed: true },
    ),
    0.006,
    { color: LEATHER_DARK, bone: AXE, name: "charmLoop" },
  );
  b.sweep(
    polyline([
      [-0.048, 0.985, 0],
      [-0.06, 0.93, 0],
      [-0.075, 0.875, 0],
    ]),
    0.004,
    { color: LEATHER, bone: CHARM, name: "charmCord" },
  );
  [
    [-0.054, 0.96],
    [-0.062, 0.93],
    [-0.069, 0.9],
  ].forEach(([x, y]) => b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, { at: [x, y, 0], bone: CHARM }));
  b.extrude(
    [
      [-0.03, 0.04],
      [0.03, 0.04],
      [0.03, -0.01],
      [0, -0.05, "sharp"],
      [-0.03, -0.01],
    ],
    {
      at: [-0.075, 0.82, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.002,
      color: GOLD,
      bone: CHARM,
      name: "tag",
    },
  );
  decal(TAG, 0.045, 0.0608, [-0.075, 0.822, 0.0052], 1, 1.0, CHARM);
  b.cards([frame([-0.075, 0.767, 0], [0, 1, 0])], TASSEL, {
    size: [0.04, 0.1],
    lean: 180,
    flow: [0, 0, 1],
    cross: true,
    bone: CHARM,
  });

  return b.root;
}
