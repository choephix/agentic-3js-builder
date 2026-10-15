import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { grain, mottle, noise, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull, spiral } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Windwhisper Sky Isle",
  description:
    "A floating sky island in cel-shaded Genshin style: a grassy dome on a hanging strata-rock keel, a glowing rune plaza with a floating wind crystal, a broken gold-trimmed archway and fluted colonnade, a stream with a small wooden bridge that spills off the rim as a waterfall into a cloud bed, a tall storybook tree with a rope swing and paper lanterns, a blossom tree, a pine, floating islets, hanging roots and wind ribbons.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type Col = string | Paint;
type P3 = [number, number, number];
type P2 = [number, number];

const TAU = Math.PI * 2;
const DEGS = 180 / Math.PI;

// Ground height of the island's grass dome at (x, z).
const gy = (x: number, z: number) => 1.27 - 0.07 * Math.min(1, (x * x + z * z) / 1.44);
const pt = (x: number, z: number, dy = 0): P3 => [x, gy(x, z) + dy, z];
const sc = (pts: P2[], s: number): P2[] => pts.map(([x, y]) => [x * s, y * s] as P2);

// ---------------------------------------------------------------------------------------------------------------
// Palette: every surface colour is a two-tone cel paint with a cool, hue-shifted shadow.

const GRASS_RAW = mottle("#8fe060", "#6dd066", { size: 0.28, seed: 2 });
const GRASS = cel(GRASS_RAW, "#3aa57a");
const GRASS_DK = cel("#58c565", "#2c8f7e");
const LEAF_A = cel(mottle("#79dc72", "#5fcf7e", { size: 0.25, seed: 5 }), "#2f9b86");
const LEAF_B = cel(mottle("#58c98f", "#4ab9a2", { size: 0.25, seed: 6 }), "#2a8896");
const LEAF_C = cel(mottle("#a4e26a", "#86d86a", { size: 0.25, seed: 7 }), "#3d9f6e");
const LEAF_GOLD = cel("#ffd95c", "#e8903c");
const BLOSSOM = cel(mottle("#ffc4dc", "#ffa9cf", { size: 0.2, seed: 8 }), "#d77fc0");
const BLOSSOM2 = cel("#ffd9e8", "#e79ac8");
const BARK_RAW = grain("#8f5d3d", "#6f4532", { size: 0.05, axis: "y" });
const BARK = cel(paint((p) => (p.y < 1.4 && noise(p, 0.12, 8) > 0.6 ? "#6cc05a" : BARK_RAW)), "#4a3358");
const WOOD = cel(grain("#c0794b", "#92573a", { size: 0.03, axis: "x" }), "#6b4060");
const GOLD = cel("#ffd45a", "#d9962a");
const TEAL = cel("#46cfc6", "#2b92aa");
const RED = cel("#e4505f", "#a82c66");
const ROPE = cel("#ecd7a6", "#b99a80");
const STONE_ROCK = cel(mottle("#aa9d8b", "#93877b", { size: 0.2, seed: 9 }), "#6f6785");
const PINE = cel("#42b57e", "#27758a");
const PINE2 = cel("#5cc88a", "#2d8394");
const LILY = cel("#52bd62", "#2d8f76");
const CLOUD = cel("#ffffff", "#b8c8f0");
const CLOUD2 = cel("#f2f8ff", "#a9bde8");
const PINK = cel("#ff9ec8", "#d9649f");
const WATER = paint((p) => {
  const k = noise(p, 0.06, 3);
  return k > 0.66 ? "#e2fbff" : k > 0.5 ? "#79e0ff" : "#4cc4f4";
});

// Weathered cream ruin stone with moss on its upward faces and low down.
const STONE = cel(
  paint((p, n) => {
    const m = noise(p, 0.14, 3);
    if (m > 0.6 && (n.y > 0.1 || p.y < 1.36)) return "#74c45a";
    if (noise(p, 0.4, 10) > 0.66) return "#d2c4a1";
    return "#eadfc4";
  }),
);
const STONE_DK = cel(mottle("#cdbfa0", "#b8ab92", { size: 0.2, seed: 4 }), "#8c86a4");
// Paving: cream tiles with grout lines on top faces.
const PLAZA = cel(
  paint((p, n) => {
    if (n.y < 0.5) return "#b9ab90";
    const gx = Math.abs((((p.x / 0.16) % 1) + 1) % 1 - 0.5);
    const gz = Math.abs((((p.z / 0.16) % 1) + 1) % 1 - 0.5);
    if (gx > 0.455 || gz > 0.455) return "#a99d86";
    return noise(p, 0.2, 6) > 0.55 ? "#e6dcc3" : "#f1e8d1";
  }),
);

// Island rock: grass drips from the rim, warm strata, a cooler violet keel.
const STRATA = ["#c99b6d", "#b3825f", "#d3a878", "#9c7466"];
const rockPaint = (top: number) =>
  cel(
    paint((p) => {
      const depth = top - p.y;
      if (depth < 0.1 + 0.16 * noise(p, 0.25, 5)) return "#62c566";
      const k = Math.floor(depth * 7 + noise(p, 0.5, 2) * 2.2);
      if (depth > 0.8) return k % 2 === 0 ? "#8d7392" : "#7a6685";
      return STRATA[((k % 4) + 4) % 4];
    }),
  );
// Grass cap: green on top, a grassy lip, earth underneath.
const capPaint = (edgeY: number) =>
  cel(
    paint((p, n) => {
      if (n.y > 0.5) return GRASS_RAW;
      if (p.y > edgeY + 0.06 * noise(p, 0.15, 9)) return "#56bb5e";
      return noise(p, 0.3, 4) > 0.5 ? "#a87347" : "#94613f";
    }),
  );

const BODY: P2[] = [
  [0, 0.12],
  [0.1, 0.26],
  [0.35, 0.48],
  [0.7, 0.72],
  [1.0, 0.92],
  [1.15, 1.08],
  [1.2, 1.18],
];
const bodyR = (y: number) => {
  for (let i = 0; i < BODY.length - 1; i++) {
    const [r0, y0] = BODY[i];
    const [r1, y1] = BODY[i + 1];
    if (y >= y0 && y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return y < 0.12 ? 0 : 1.2;
};

export default function build() {
  const b = createBuilder({ name: "floatingIslandDiorama", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const r = rng(11);

  const put = (geo: THREE.BufferGeometry, color: Col, at: P3, o: PartOptions = {}) =>
    b.part(geo, color, { bone: root, at, ...o });
  const ico = (
    rad: number,
    color: Col,
    at: P3,
    scale: P3 | number = 1,
    rotation: P3 = [0, 0, 0],
    detail = 0,
  ) => put(new THREE.IcosahedronGeometry(rad, detail), color, at, { scale, rotation, flat: true });
  // A frame local to a ruin: origin (ox, oz) on the island, turned yaw degrees about Y; y is height above the ground.
  const loc = (ox: number, oz: number, yawDeg: number) => {
    const c = Math.cos(yawDeg / DEGS);
    const s = Math.sin(yawDeg / DEGS);
    const g = gy(ox, oz) - 0.02;
    return (lx: number, ly: number, lz: number): P3 => [ox + lx * c + lz * s, g + ly, oz - lx * s + lz * c];
  };
  const dirLoc = (yawDeg: number) => {
    const c = Math.cos(yawDeg / DEGS);
    const s = Math.sin(yawDeg / DEGS);
    return (lx: number, lz: number): P3 => [lx * c + lz * s, 0, -lx * s + lz * c];
  };

  // ---------------------------------------------------------------------------------------------------------------
  // Textures

  const ticks = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * TAU;
    const long = i % 3 === 0;
    const r0 = long ? 68 : 72;
    return `<line x1="${(100 + Math.cos(a) * r0).toFixed(1)}" y1="${(100 + Math.sin(a) * r0).toFixed(1)}" x2="${(100 + Math.cos(a) * 84).toFixed(1)}" y2="${(100 + Math.sin(a) * 84).toFixed(1)}" stroke="${long ? "#ffe08a" : "#7ff3ff"}" stroke-width="3" stroke-linecap="round"/>`;
  }).join("");
  const star = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * TAU - Math.PI / 2;
    const rr = i % 2 === 0 ? 54 : 24;
    return `${(100 + Math.cos(a) * rr).toFixed(1)},${(100 + Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ");
  let swirl = "";
  for (let k = 0; k <= 40; k++) {
    const a = k * 0.35;
    const rr = 2 + k * 0.5;
    swirl += `${k ? "L" : "M"}${(100 + Math.cos(a) * rr).toFixed(1)} ${(100 + Math.sin(a) * rr).toFixed(1)} `;
  }
  const RUNE = svg(
    `<svg viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="96" fill="none" stroke="#ffe08a" stroke-width="4"/>
      <circle cx="100" cy="100" r="89" fill="none" stroke="#7ff3ff" stroke-width="3"/>
      <circle cx="100" cy="100" r="64" fill="none" stroke="#7ff3ff" stroke-width="3"/>
      <circle cx="100" cy="100" r="58" fill="none" stroke="#ffe08a" stroke-width="2.6" stroke-dasharray="6 5"/>
      ${ticks}
      <polygon points="${star}" fill="none" stroke="#ffe08a" stroke-width="2.8" stroke-linejoin="round"/>
      <path d="${swirl}" fill="none" stroke="#7ff3ff" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 768 },
  );
  const FILI = svg(
    `<svg viewBox="0 0 60 160">
      <rect x="4" y="4" width="52" height="152" rx="7" fill="none" stroke="#f6c453" stroke-width="3"/>
      <path d="M30 14 L40 26 L30 38 L20 26 Z" fill="#f6c453"/>
      <path d="M30 46 C12 54 12 74 30 78 C46 81 46 64 34 64" fill="none" stroke="#f6c453" stroke-width="3" stroke-linecap="round"/>
      <path d="M30 46 C48 54 48 74 30 78" fill="none" stroke="#f6c453" stroke-width="3" stroke-linecap="round"/>
      <circle cx="30" cy="96" r="7" fill="#3fd0c8"/>
      <circle cx="30" cy="96" r="3" fill="#f6c453"/>
      <path d="M30 108 C14 118 14 134 30 140 C46 134 46 118 30 108Z" fill="none" stroke="#3fd0c8" stroke-width="3" stroke-linejoin="round"/>
      <path d="M30 116 L30 134" stroke="#f6c453" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const LEAF = svg(
    `<svg viewBox="0 0 32 48">
      <path d="M16 47 C3 36 1 16 16 1 Z" fill="#ffffff"/>
      <path d="M16 47 C29 36 31 16 16 1 Z" fill="#d6d6d6"/>
      <path d="M16 46 L16 8" stroke="#a8a8a8" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  const PETAL = svg(
    `<svg viewBox="0 0 32 40">
      <path d="M16 39 C1 30 2 8 16 2 Z" fill="#ffffff"/>
      <path d="M16 39 C31 30 30 8 16 2 Z" fill="#dcdcdc"/>
    </svg>`,
    { size: 128 },
  );
  const GRASS_TEX = svg(
    `<svg viewBox="0 0 30 48">
      <path d="M3 48 Q6 24 1 6 Q13 22 12 48Z" fill="#4fb85a"/>
      <path d="M10 48 Q12 20 16 1 Q20 22 21 48Z" fill="#7fe06a"/>
      <path d="M19 48 Q22 28 29 10 Q27 30 28 48Z" fill="#45a85a"/>
    </svg>`,
    { size: 96 },
  );
  const flower = (petal: string) =>
    svg(
      `<svg viewBox="0 0 24 48">
        <path d="M12 48 L12 20" stroke="#3f9f55" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M12 36 Q4 34 3 28 Q10 28 12 34Z" fill="#4fb85a"/>
        <circle cx="12" cy="6.5" r="4.4" fill="${petal}"/>
        <circle cx="17.5" cy="12" r="4.4" fill="${petal}"/>
        <circle cx="12" cy="17.5" r="4.4" fill="${petal}"/>
        <circle cx="6.5" cy="12" r="4.4" fill="${petal}"/>
        <circle cx="12" cy="12" r="3.2" fill="#ffd45a"/>
      </svg>`,
      { size: 96 },
    );
  const FLOWERS = [flower("#ffffff"), flower("#ff9ec8"), flower("#ffe066"), flower("#9fd8ff")];
  const BUTTERFLY = svg(
    `<svg viewBox="0 0 40 30">
      <path d="M20 15 C12 0 0 2 2 12 C3 20 12 20 20 15Z" fill="#46cfe0" stroke="#1f7fa0" stroke-width="1.6"/>
      <path d="M20 15 C28 0 40 2 38 12 C37 20 28 20 20 15Z" fill="#46cfe0" stroke="#1f7fa0" stroke-width="1.6"/>
      <path d="M20 15 C13 18 8 28 14 28 C19 28 20 20 20 15Z" fill="#ffd45a" stroke="#c98a2b" stroke-width="1.4"/>
      <path d="M20 15 C27 18 32 28 26 28 C21 28 20 20 20 15Z" fill="#ffd45a" stroke="#c98a2b" stroke-width="1.4"/>
      <rect x="19" y="8" width="2" height="16" fill="#3a2a4a"/>
    </svg>`,
    { size: 128 },
  );
  const BANNER = svg(
    `<svg viewBox="0 0 60 110">
      <path d="M2 2 H58 V94 L49 108 L41 92 L30 106 L20 92 L11 108 L2 96 Z" fill="#f6ecd2" stroke="#2fb0bd" stroke-width="3" stroke-linejoin="round"/>
      <path d="M9 9 H51 V84 L30 96 L9 84 Z" fill="none" stroke="#f2bf4b" stroke-width="2"/>
      <path d="M30 26 C44 26 46 44 34 46 C24 48 22 36 31 36 C36 36 37 42 33 42" fill="none" stroke="#2fb0bd" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M30 52 C20 58 20 70 30 78 C40 70 40 58 30 52Z" fill="#7fdc8b" stroke="#2f9a6a" stroke-width="2"/>
      <circle cx="30" cy="16" r="3.5" fill="#f2bf4b"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Cloud bed: the floor the island hangs over. Everything rests on y = 0 here.

  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * TAU + r() * 0.3;
    const d = 0.5 + r() * 0.6;
    const rad = 0.17 + r() * 0.16;
    ico(rad, CLOUD, [Math.cos(a) * d, rad * 0.8 - 0.01, Math.sin(a) * d], [1.15, 0.8, 1.15], [0, r() * 90, 0], 1);
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU + r() * 0.4;
    const d = 0.25 + r() * 0.65;
    const rad = 0.14 + r() * 0.1;
    ico(rad, CLOUD2, [Math.cos(a) * d, 0.18 + r() * 0.18, Math.sin(a) * d], [1.2, 0.8, 1.2], [0, r() * 90, 0], 1);
  }
  ico(0.28, CLOUD, [0, 0.228, 0], [1.2, 0.85, 1.2], [0, 20, 0], 1);

  // ---------------------------------------------------------------------------------------------------------------
  // Island body: strata keel, grass cap, rim detail

  const ROCK = rockPaint(1.18);
  b.lathe([...BODY, [0, 1.18]], { at: [0, 0, 0], bone: root, segments: 11, spin: 8, color: ROCK });
  const cap = b.lathe(
    [
      [0, 1.27],
      [0.5, 1.265],
      [0.9, 1.235],
      [1.2, 1.19],
      [1.3, 1.12],
      [1.28, 1.04],
      [1.1, 1.02],
      [0, 1.02],
    ],
    { at: [0, 0, 0], bone: root, segments: 14, spin: 6, color: capPaint(1.09) },
  );

  // Rock chunks jutting from the keel.
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU + (r() - 0.5) * 0.3;
    const y = 0.5 + r() * 0.62;
    const rr = bodyR(y) * 0.97;
    const s = 0.13 + r() * 0.14;
    ico(s, ROCK, [Math.cos(a) * rr, y, Math.sin(a) * rr], [1, 1.5, 1], [r() * 40, a * DEGS, r() * 30]);
  }
  // Stalactites hanging toward the cloud.
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU + 0.3;
    const yb = 0.62 + r() * 0.25;
    const rr = bodyR(yb) * 0.9;
    const base: P3 = [Math.cos(a) * rr, yb, Math.sin(a) * rr];
    const tip: P3 = [base[0] * 0.8, yb - (0.36 + r() * 0.14), base[2] * 0.8];
    b.spike(base, tip, null, 0.07 + r() * 0.03, ROCK, { bone: root, sides: 6 });
  }

  // Glowing crystals growing from cracks in the keel.
  const CRYS = ["#8ff6ff", "#6be8f5", "#c4fdff"];
  const rockCrystal = (aDeg: number, y: number, s: number) => {
    const a = aDeg / DEGS;
    const rr = bodyR(y) * 0.99;
    const specs: Array<[number, number, number]> = [
      [0, 1, 50],
      [0.12, 0.62, 30],
      [-0.12, 0.5, 68],
    ];
    specs.forEach(([da, k, th], i) => {
      const aa = a + da;
      const h = s * k;
      const q = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(Math.sin(aa), 0, -Math.cos(aa)).normalize(),
        th / DEGS,
      );
      const d = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
      glow(
        put(
          new THREE.OctahedronGeometry(1, 0),
          CRYS[i],
          [Math.cos(aa) * rr + d.x * h * 0.55, y + d.y * h * 0.55, Math.sin(aa) * rr + d.z * h * 0.55],
          { scale: [0.2 * h, h, 0.2 * h], quat: q, flat: true },
        ),
        1.2,
      );
    });
  };
  rockCrystal(200, 0.78, 0.2);
  rockCrystal(255, 0.62, 0.16);
  rockCrystal(305, 0.95, 0.18);
  rockCrystal(150, 0.7, 0.15);
  rockCrystal(100, 0.85, 0.17);
  rockCrystal(20, 0.6, 0.13);

  const crystalCluster = (at: P3, s: number) => {
    const n = 4;
    for (let i = 0; i < n; i++) {
      const a = r() * TAU;
      const h = s * (0.7 + r() * 0.9);
      const lean = (r() - 0.5) * 50;
      glow(
        put(
          new THREE.OctahedronGeometry(1, 0),
          CRYS[i % 3],
          [at[0] + Math.cos(a) * s * 0.35, at[1] + h * 0.6, at[2] + Math.sin(a) * s * 0.35],
          { scale: [s * 0.22, h, s * 0.22], rotation: [lean * Math.cos(a), r() * 90, lean * Math.sin(a)], flat: true },
        ),
        1.2,
      );
    }
  };

  // Hanging roots hugging the keel, a few ending in glowing bulbs.
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU + 0.2 + r() * 0.3;
    if (Math.abs(((a * DEGS) % 360) - 50) < 14) continue;
    const ys = [1.03, 0.93, 0.83, 0.73 - r() * 0.1];
    const pts = ys.map((y, k) => {
      const rr = bodyR(y) + 0.05 + 0.02 * k;
      const aa = a + k * 0.12;
      return [Math.cos(aa) * rr, y, Math.sin(aa) * rr] as P3;
    });
    b.sweep(catmull(pts), [0.028, 0.016, 0.004], BARK, { bone: root, sides: 5 });
    if (i % 2 === 0) glow(put(new THREE.SphereGeometry(0.02, 6, 4), "#9ff7ff", pts[3]), 1.2);
  }

  // Grass hills and rim boulders break up the circle.
  const hills: Array<[number, number, number]> = [
    [-0.95, 0.5, 0.3],
    [-0.35, -0.95, 0.3],
    [0.45, -1.0, 0.28],
  ];
  for (const [x, z, s] of hills) ico(s, GRASS, [x, gy(x, z) - 0.03, z], [1, 0.3, 1], [0, r() * 90, 0], 1);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU + 0.4;
    if (Math.abs(((a * DEGS) % 360) - 50) < 16) continue;
    const rr = 1.14 + r() * 0.08;
    const s = 0.07 + r() * 0.06;
    ico(s, STONE_ROCK, [Math.cos(a) * rr, gy(Math.cos(a) * rr, Math.sin(a) * rr) - 0.01, Math.sin(a) * rr], [1.2, 0.8, 1], [0, r() * 90, 0]);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Stream, pond, waterfall

  const streamPts: P3[] = (
    [
      [0.74, -0.4],
      [0.82, -0.2],
      [0.84, 0.05],
      [0.8, 0.35],
      [0.84, 0.65],
      [0.775, 0.916],
    ] as P2[]
  ).map(([x, z]) => pt(x, z, 0.012));
  const streamPath = catmull(streamPts);
  const streamAt = Array.from({ length: 21 }, (_, i) => streamPath.at(i / 20));
  const nearStream = (x: number, z: number, d: number) => streamAt.some((q) => Math.hypot(q.x - x, q.z - z) < d);
  b.sweep(streamPath, (t): [number, number] => [0.07 + 0.08 * t * t, 0.014], WATER, {
    bone: root,
    section: "box",
    caps: "flat",
    up: [0, 1, 0],
  });
  // Bank stones along the stream.
  for (let i = 1; i < 10; i++) {
    const q = streamPath.at(i / 10);
    const tg = streamPath.tangentAt(i / 10);
    const lx = -tg.z;
    const lz = tg.x;
    for (const s of [1, -1]) {
      if (r() < 0.3) continue;
      const off = (0.1 + 0.07 * (i / 10) ** 2 * 1.5) * s + (r() - 0.5) * 0.02;
      const x = q.x + lx * off;
      const z = q.z + lz * off;
      ico(0.035 + r() * 0.03, STONE_ROCK, [x, gy(x, z) + 0.005, z], [1.2, 0.8, 1], [0, r() * 90, 0]);
    }
  }

  // Pond with a rocky spring above it.
  const PX = 0.7;
  const PZ = -0.45;
  put(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 14), WATER, [PX, gy(PX, PZ) - 0.005, PZ]);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU + r() * 0.2;
    const x = PX + Math.cos(a) * 0.215;
    const z = PZ + Math.sin(a) * 0.215;
    ico(0.05 + r() * 0.035, STONE_ROCK, [x, gy(x, z) + 0.005, z], [1.2, 0.75, 1], [0, r() * 90, 0]);
  }
  for (const [dx, dz] of [
    [-0.05, 0.04],
    [0.07, -0.06],
    [0.03, 0.09],
  ]) {
    put(new THREE.CylinderGeometry(0.04, 0.04, 0.006, 8), LILY, [PX + dx, gy(PX, PZ) + 0.013, PZ + dz]);
  }
  put(new THREE.SphereGeometry(0.018, 6, 4), PINK, [PX + 0.07, gy(PX, PZ) + 0.022, PZ - 0.06]);
  put(new THREE.SphereGeometry(0.018, 6, 4), "#ffffff", [PX - 0.05, gy(PX, PZ) + 0.022, PZ + 0.04]);
  const sx = 0.88;
  const sz = -0.62;
  const sg = gy(sx, sz);
  ico(0.17, STONE_ROCK, [sx, sg + 0.05, sz], [1.2, 1.1, 1], [0, 20, 0]);
  ico(0.13, STONE_ROCK, [sx - 0.07, sg + 0.18, sz - 0.03], [1, 1, 1], [10, 50, 0]);
  ico(0.1, STONE_ROCK, [sx + 0.08, sg + 0.1, sz + 0.03], [1, 0.9, 1], [0, 70, 10]);
  b.sweep(
    catmull([
      [0.9, sg + 0.3, -0.65],
      [0.84, sg + 0.2, -0.6],
      [0.8, sg + 0.1, -0.55],
      [0.75, sg + 0.03, -0.5],
    ]),
    (): [number, number] => [0.03, 0.01],
    WATER,
    { bone: root, section: "box", caps: "flat", up: [0, 1, 0] },
  );

  // The waterfall: a curtain leaving the lip and falling free toward the clouds.
  const U: P2 = [0.775 / 1.2, 0.916 / 1.2];
  const lat: P2 = [-U[1], U[0]];
  const fp = (rr: number, y: number, off = 0): P3 => [U[0] * rr + lat[0] * off, y, U[1] * rr + lat[1] * off];
  const FALL = paint((p, _n, s) => {
    const L = p.x * lat[0] + p.z * lat[1];
    const k = Math.sin(L * 46 + 3 * noise(p, 0.2, 2));
    if (s[0] > 0.86 || s[0] < 0.05) return "#f2fdff";
    if (k > 0.55) return "#e6fbff";
    if (k < -0.5) return "#4ec3f2";
    return "#86e3ff";
  });
  const curtainR: Array<[number, number]> = [
    [1.2, 1.215],
    [1.26, 1.18],
    [1.31, 1.05],
    [1.32, 0.85],
    [1.28, 0.62],
    [1.2, 0.4],
  ];
  b.sweep(catmull(curtainR.map(([rr, y]) => fp(rr, y))), (t): [number, number] => [0.15 + 0.05 * t, 0.03], FALL, {
    bone: root,
    section: "box",
    caps: "flat",
    up: [0, 1, 0],
  });
  for (const off of [-0.11, 0.12]) {
    b.sweep(
      catmull(curtainR.slice(1).map(([rr, y]) => fp(rr + 0.04, y + 0.0, off))),
      [0.022, 0.016, 0.026],
      "#f0fdff",
      { bone: root, sides: 5 },
    );
  }
  for (let i = 0; i < 4; i++) {
    const rr = 1.14 + r() * 0.2;
    ico(0.12 + r() * 0.09, CLOUD, fp(rr, 0.34 + r() * 0.16, (r() - 0.5) * 0.3), [1.2, 0.8, 1.2], [0, r() * 90, 0], 1);
  }
  for (let i = 0; i < 14; i++) {
    const y = 0.45 + r() * 0.75;
    put(new THREE.SphereGeometry(0.014 + r() * 0.01, 5, 4), "#bff3ff", fp(1.36 + r() * 0.12, y, (r() - 0.5) * 0.4));
  }
  for (let i = 0; i < 3; i++) ico(0.035, "#ffffff", fp(1.23, 1.2, (i - 1) * 0.09), 1, [0, 0, 0], 1);

  // Wooden bridge over the stream.
  const BX = 0.8;
  const BZ = 0.35;
  const plankY = (x: number) => gy(x, BZ) + 0.05 + 0.06 * (1 - ((x - BX) / 0.22) ** 2);
  for (let i = 0; i < 8; i++) {
    const x = 0.59 + i * 0.06;
    const slope = (-0.12 * (x - BX)) / 0.0484;
    put(new THREE.BoxGeometry(0.05, 0.014, 0.21), WOOD, [x, plankY(x), BZ], { rotation: [0, 0, Math.atan(slope) * DEGS] });
  }
  for (const sz2 of [-0.095, 0.095]) {
    b.sweep(
      catmull([0.57, 0.66, 0.75, 0.84, 0.93, 1.03].map((x) => [x, plankY(x) - 0.012, BZ + sz2] as P3)),
      0.012,
      WOOD,
      { bone: root, sides: 4 },
    );
    for (const x of [0.6, 1.0]) put(new THREE.BoxGeometry(0.026, 0.15, 0.026), WOOD, [x, plankY(x) + 0.07, BZ + sz2 * 1.1]);
    b.sweep(
      catmull([0.6, 0.7, 0.8, 0.9, 1.0].map((x) => [x, plankY(x) + 0.135, BZ + sz2 * 1.1] as P3)),
      0.008,
      WOOD,
      { bone: root, sides: 4 },
    );
    for (const x of [0.6, 1.0]) put(new THREE.SphereGeometry(0.02, 6, 4), GOLD, [x, plankY(x) + 0.155, BZ + sz2 * 1.1]);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Rune plaza and the floating wind crystal

  const PCZ = 0.12;
  const pg = gy(0, PCZ);
  put(new THREE.CylinderGeometry(0.56, 0.6, 0.1, 14), PLAZA, [0, pg - 0.01, PCZ]);
  put(new THREE.TorusGeometry(0.545, 0.008, 5, 28), GOLD, [0, pg + 0.043, PCZ], { rotation: [90, 0, 0] });
  glow(
    put(new THREE.CircleGeometry(0.5, 32), "#ffffff", [0, pg + 0.045, PCZ], { texture: RUNE, dir: [0, 1, 0], axis: "z" }),
    1.1,
  );
  for (let i = 0; i < 10; i++) {
    if (i === 3 || i === 8) continue;
    const a = (i / 10) * TAU + 0.2;
    const th = -(a * DEGS + 90);
    put(
      new THREE.BoxGeometry(0.2, 0.06 + r() * 0.015, 0.13),
      i % 3 === 0 ? STONE : STONE_DK,
      [Math.cos(a) * 0.65, pg - 0.015, PCZ + Math.sin(a) * 0.65],
      { rotation: [(r() - 0.5) * 6, th, (r() - 0.5) * 6] },
    );
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + Math.PI / 4;
    const x = Math.cos(a) * 0.45;
    const z = PCZ + Math.sin(a) * 0.45;
    put(new THREE.BoxGeometry(0.06, 0.2, 0.06), STONE, [x, pg + 0.14, z], { rotation: [0, -(a * DEGS), 0] });
    put(new THREE.BoxGeometry(0.075, 0.025, 0.075), GOLD, [x, pg + 0.255, z], { rotation: [0, -(a * DEGS), 0] });
    glow(put(new THREE.BoxGeometry(0.04, 0.04, 0.04), "#8ff6ff", [x, pg + 0.29, z], { rotation: [0, 45, 0] }), 1.3);
  }
  // Altar pedestal and the floating crystal with its gold rings.
  const AY = pg + 0.04;
  b.lathe(
    [
      [0, 0],
      [0.16, 0],
      [0.16, 0.04],
      [0.11, 0.08],
      [0.11, 0.22],
      [0.15, 0.26],
      [0.15, 0.3],
      [0, 0.3],
    ],
    { at: [0, AY, PCZ], bone: root, segments: 8, spin: 22.5, color: STONE },
  );
  put(new THREE.TorusGeometry(0.113, 0.01, 5, 12), GOLD, [0, AY + 0.15, PCZ], { rotation: [90, 0, 0] });
  put(new THREE.TorusGeometry(0.152, 0.008, 5, 12), TEAL, [0, AY + 0.285, PCZ], { rotation: [90, 0, 0] });
  const OY = AY + 0.62;
  glow(put(new THREE.OctahedronGeometry(1, 0), "#8ff6ff", [0, OY, PCZ], { scale: [0.1, 0.17, 0.1], rotation: [0, 20, 0], flat: true }), 1.5);
  glow(put(new THREE.OctahedronGeometry(1, 0), "#d6fdff", [0, OY, PCZ], { scale: [0.05, 0.09, 0.05], rotation: [0, 20, 0], flat: true }), 1.8);
  put(new THREE.TorusGeometry(0.2, 0.009, 5, 20), GOLD, [0, OY, PCZ], { rotation: [60, 0, 20] });
  put(new THREE.TorusGeometry(0.24, 0.007, 5, 20), GOLD, [0, OY, PCZ], { rotation: [-35, 30, 60] });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + 0.5;
    glow(
      put(new THREE.SphereGeometry(0.016, 6, 4), "#e8ffff", [Math.cos(a) * 0.2, OY + Math.sin(a * 2) * 0.06, PCZ + Math.sin(a) * 0.2]),
      1.5,
    );
  }
  // Stepping stones from the plaza.
  for (const [x, z] of [
    [0.0, -0.52],
    [0.04, -0.6],
    [0.1, -0.68],
    [-0.02, 0.7],
    [-0.04, 0.78],
    [-0.03, 0.86],
  ] as P2[]) {
    put(new THREE.CylinderGeometry(0.05 + r() * 0.015, 0.058, 0.02, 7), STONE_DK, [x, gy(x, z) - 0.002, z], { rotation: [0, r() * 90, 0] });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Ruined archway

  const GYAW = 70;
  const G = loc(-0.85, -0.05, GYAW);
  const GD = dirLoc(GYAW);
  put(new THREE.BoxGeometry(0.95, 0.05, 0.36), STONE_DK, G(0, 0.01, 0), { rotation: [0, GYAW, 0] });
  for (const s of [-1, 1]) {
    const hP = s === -1 ? 0.62 : 0.4;
    const x = s * 0.31;
    put(new THREE.BoxGeometry(0.26, 0.07, 0.26), STONE, G(x, 0.05, 0), { rotation: [0, GYAW, 0] });
    put(new THREE.BoxGeometry(0.18, hP, 0.18), STONE, G(x, hP / 2, 0), { rotation: [0, GYAW, 0] });
    for (const ly of [0.1, hP - 0.03]) {
      put(new THREE.BoxGeometry(0.2, 0.022, 0.2), GOLD, G(x, ly, 0), { rotation: [0, GYAW, 0] });
    }
    for (const f of [1, -1]) {
      const d = GD(0, f);
      put(new THREE.PlaneGeometry(0.12, 0.32), "#ffffff", G(x, hP * 0.52, f * 0.094), {
        texture: FILI,
        dir: d,
        axis: "z",
      });
    }
  }
  // Broken stub of the right pillar and rubble.
  ico(0.1, STONE, G(0.31, 0.4, 0), [1, 0.5, 1], [10, 30, 8]);
  ico(0.05, STONE, G(0.5, 0.04, 0.2), [1.3, 0.8, 1], [0, 40, 0]);
  ico(0.04, STONE, G(0.22, 0.03, 0.25), [1.2, 0.8, 1], [0, 10, 0]);
  ico(0.06, STONE, G(-0.55, 0.04, -0.22), [1.2, 0.7, 1], [0, 70, 0]);
  const AR = 0.31;
  for (const a of [170, 150, 130, 110, 90, 70]) {
    const ar = a / DEGS;
    const px = AR * Math.cos(ar);
    const py = 0.62 + AR * Math.sin(ar);
    put(new THREE.BoxGeometry(0.09, AR * (20 / DEGS) * 1.03, 0.18), STONE, G(px, py, 0), { rotation: [0, GYAW, a] });
    put(new THREE.BoxGeometry(0.03, 0.085, 0.014), a === 90 ? GOLD : TEAL, G(px, py, 0.095), { rotation: [0, GYAW, a] });
  }
  put(new THREE.BoxGeometry(0.115, 0.045, 0.2), GOLD, G(0, 0.62 + AR + 0.07, 0), { rotation: [0, GYAW, 0] });
  // Fallen arch block.
  put(new THREE.BoxGeometry(0.09, 0.13, 0.18), STONE, G(0.55, 0.07, 0.3), { rotation: [0, GYAW + 25, 70] });
  // Keystone tassel.
  b.rod(G(0, 0.885, 0), G(0, 0.75, 0), 0.006, RED, { bone: root });
  put(new THREE.SphereGeometry(0.03, 7, 5), GOLD, G(0, 0.73, 0));
  b.spike(G(0, 0.71, 0), [0, -1, 0], 0.2, 0.045, RED, { bone: root, sides: 6 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    b.rod(G(Math.cos(a) * 0.03, 0.67, Math.sin(a) * 0.03), G(Math.cos(a) * 0.055, 0.45, Math.sin(a) * 0.055), 0.004, GOLD, { bone: root });
  }
  put(new THREE.SphereGeometry(0.022, 6, 4), GOLD, G(0, 0.5, 0));
  // Vine winding up the standing pillar, with leaves.
  const vinePts: P3[] = [];
  const vineFr: Array<{ at: P3; d: P3 }> = [];
  for (let k = 0; k <= 9; k++) {
    const ang = k * 0.95;
    const y = 0.05 + k * 0.058;
    const cx = Math.cos(ang);
    const sz3 = Math.sin(ang);
    vinePts.push(G(-0.31 + cx * 0.105, y, sz3 * 0.105));
    vineFr.push({ at: G(-0.31 + cx * 0.105, y, sz3 * 0.105), d: GD(cx, sz3) });
  }
  b.sweep(catmull(vinePts), 0.011, GRASS_DK, { bone: root, sides: 5 });
  b.cards(
    vineFr.map((v) => frame(v.at, v.d)),
    LEAF,
    { size: [0.07, 0.09], lean: 50, flow: [0, -1, 0], bend: 20, vary: 0.25, spin: 180, rng: r, color: "#5fcf6e" },
  );
  for (const [lx, lz, s] of [
    [-0.55, 0.15, 0.1],
    [0.58, -0.12, 0.09],
    [-0.62, -0.1, 0.07],
  ] as P3[]) {
    ico(s, GRASS_DK, G(lx, s * 0.5, lz), [1.2, 0.8, 1.2], [0, r() * 90, 0], 1);
    ico(s * 0.7, GRASS_DK, G(lx + s * 0.8, s * 0.3, lz + s * 0.5), [1.2, 0.8, 1.2], [0, r() * 90, 0], 1);
  }
  crystalCluster(G(-0.62, 0.0, 0.2), 0.12);

  // ---------------------------------------------------------------------------------------------------------------
  // Fluted colonnade

  const flute = (ox: number, oz: number, g: number) =>
    cel(
      paint((p) => {
        const ang = Math.atan2(p.z - oz, p.x - ox);
        if (p.y < g + 0.16 && noise(p, 0.1, 4) > 0.56) return "#76c85c";
        return Math.abs(Math.sin(ang * 5)) < 0.1 ? "#cdbf9d" : "#ecdfc2";
      }),
    );
  const column = (ox: number, g: number, oz: number, h: number, broken: boolean) => {
    const fl = flute(ox, oz, g);
    put(new THREE.BoxGeometry(0.3, 0.07, 0.3), STONE, [ox, g + 0.02, oz], { rotation: [0, 20, 0] });
    b.lathe(
      [
        [0, 0],
        [0.105, 0],
        [0.098, h * 0.5],
        [0.09, h],
        [0, h],
      ],
      { at: [ox, g + 0.03, oz], bone: root, segments: 10, color: fl },
    );
    put(new THREE.TorusGeometry(0.1, 0.012, 5, 10), GOLD, [ox, g + 0.03 + h * 0.22, oz], { rotation: [90, 0, 0] });
    if (broken) {
      ico(0.1, STONE, [ox, g + 0.03 + h, oz], [1, 0.55, 1], [8, 20, 10]);
      ico(0.05, STONE, [ox + 0.16, g + 0.04, oz + 0.08], [1.3, 0.8, 1], [0, 40, 0]);
    } else {
      b.lathe(
        [
          [0, 0],
          [0.115, 0],
          [0.115, 0.025],
          [0.095, 0.04],
          [0.15, 0.09],
          [0.15, 0.13],
          [0, 0.13],
        ],
        { at: [ox, g + 0.03 + h, oz], bone: root, segments: 8, spin: 22.5, color: STONE },
      );
      put(new THREE.TorusGeometry(0.148, 0.01, 5, 8), GOLD, [ox, g + 0.03 + h + 0.105, oz], { rotation: [90, 22.5, 0] });
    }
  };
  for (const [deg, h, broken] of [
    [85, 0.85, false],
    [105, 0.5, true],
    [125, 0.7, false],
  ] as Array<[number, number, boolean]>) {
    const x = Math.cos(deg / DEGS);
    const z = Math.sin(deg / DEGS);
    column(x, gy(x, z) - 0.02, z, h, broken);
  }
  // Fallen drums.
  for (const [x, z, yaw] of [
    [0.4, 0.78, 30],
    [-0.3, 0.7, 100],
  ] as P3[]) {
    put(new THREE.CylinderGeometry(0.1, 0.095, 0.22, 10), STONE, [x, gy(x, z) + 0.085, z], { rotation: [0, yaw, 90] });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Stone lantern

  {
    const L = loc(-0.5, 0.55, 25);
    const o: PartOptions = { rotation: [0, 25, 0] };
    put(new THREE.CylinderGeometry(0.075, 0.085, 0.04, 6), STONE, L(0, 0.02, 0), o);
    put(new THREE.CylinderGeometry(0.025, 0.03, 0.2, 6), STONE, L(0, 0.14, 0), o);
    put(new THREE.CylinderGeometry(0.09, 0.07, 0.025, 6), STONE, L(0, 0.26, 0), o);
    glow(put(new THREE.BoxGeometry(0.09, 0.075, 0.09), "#ffd27a", L(0, 0.31, 0), o), 1.4);
    for (const [sx2, sz2] of [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      put(new THREE.BoxGeometry(0.02, 0.08, 0.02), STONE, L(sx2 * 0.05, 0.31, sz2 * 0.05), o);
    }
    put(new THREE.BoxGeometry(0.14, 0.015, 0.14), STONE, L(0, 0.355, 0), o);
    put(new THREE.ConeGeometry(0.11, 0.08, 4), STONE, L(0, 0.4, 0), { rotation: [0, 70, 0] });
    put(new THREE.SphereGeometry(0.018, 6, 4), GOLD, L(0, 0.45, 0));
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Banner pole

  {
    const L = loc(0.45, -0.45, 15);
    b.rod(L(0, -0.02, 0), L(0, 0.64, 0), 0.013, WOOD, { bone: root, sides: 6 });
    b.rod(L(-0.14, 0.6, 0), L(0.14, 0.6, 0), 0.008, WOOD, { bone: root, sides: 5 });
    put(new THREE.SphereGeometry(0.024, 7, 5), GOLD, L(0, 0.67, 0));
    put(new THREE.SphereGeometry(0.014, 6, 4), GOLD, L(-0.15, 0.6, 0));
    put(new THREE.SphereGeometry(0.014, 6, 4), GOLD, L(0.15, 0.6, 0));
    put(new THREE.BoxGeometry(0.23, 0.42, 0.012), "#ffffff", L(0, 0.38, 0.0), { texture: BANNER, rotation: [0, 15, 0] });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Trees

  const leafCards = (parts: ReturnType<typeof put>[], count: number, tint: string, tex: THREE.Texture, size: [number, number]) => {
    const hits = b.surface(parts).scatter(count, { rng: r, minDist: 0.075, filter: (h) => h.n.y > -0.2 });
    b.cards(hits, tex, { size, lean: 30, bend: 25, flow: [0.2, -1, 0.3], vary: 0.3, spin: 180, rng: r, color: tint });
  };
  const branch = (from: P3, to: P3, r0: number, r1: number) =>
    b.sweep(
      catmull([from, [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2 + 0.06, (from[2] + to[2]) / 2], to]),
      [r0, r1],
      BARK,
      { bone: root, sides: 6 },
    );

  // Tall tree T1 at the back.
  const T1: P2 = [0.1, -0.75];
  b.sweep(
    catmull([
      [0.1, 1.2, -0.75],
      [0.16, 1.5, -0.72],
      [0.04, 1.85, -0.8],
      [0.1, 2.15, -0.76],
    ]),
    [0.15, 0.11, 0.07],
    BARK,
    { bone: root, sides: 7 },
  );
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + 0.4;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const x0 = T1[0];
    const z0 = T1[1];
    b.sweep(
      catmull([
        [x0 + ca * 0.08, 1.42, z0 + sa * 0.08],
        [x0 + ca * 0.2, 1.28, z0 + sa * 0.2],
        [x0 + ca * 0.38, gy(x0 + ca * 0.38, z0 + sa * 0.38) - 0.02, z0 + sa * 0.38],
      ]),
      [0.06, 0.02],
      BARK,
      { bone: root, sides: 5 },
    );
  }
  branch([0.04, 1.95, -0.8], [-0.5, 2.05, -0.72], 0.05, 0.025);
  branch([0.14, 1.95, -0.76], [0.62, 2.0, -0.7], 0.05, 0.025);
  const C1: P3 = [0.1, 2.25, -0.76];
  const clumps: Array<[number, number, number, number, Col]> = [
    [0, 0.15, 0, 0.42, LEAF_A],
    [0.38, 0.0, 0.05, 0.3, LEAF_B],
    [-0.38, -0.05, 0.0, 0.32, LEAF_C],
    [0.05, 0.0, 0.38, 0.3, LEAF_A],
    [0.0, -0.02, -0.36, 0.3, LEAF_B],
    [0.22, 0.35, -0.15, 0.28, LEAF_GOLD],
    [-0.25, 0.33, 0.1, 0.27, LEAF_C],
    [0.3, -0.2, 0.3, 0.2, LEAF_GOLD],
  ];
  const canopy = clumps.map(([dx, dy, dz, rad, col]) =>
    ico(rad * 0.85, col, [C1[0] + dx * 0.85, C1[1] + dy * 0.85, C1[2] + dz * 0.85], [1, 0.85, 1], [0, r() * 90, 0], 1),
  );
  const tints = ["#8be67c", "#58d3a2", "#b4ee70", "#ffe071"];
  [0, 1, 2, 3].forEach((k) => {
    const group = canopy.filter((_, i) => (k === 3 ? i === 5 || i === 7 : i % 3 === k && i !== 5 && i !== 7));
    if (group.length) leafCards(group, 55, tints[k], LEAF, [0.11, 0.14]);
  });
  // Rope swing.
  for (const x of [-0.4, -0.16]) b.rod([x, 2.0, -0.75], [x, 1.53, -0.75], 0.007, ROPE, { bone: root, sides: 5 });
  put(new THREE.BoxGeometry(0.3, 0.025, 0.1), WOOD, [-0.28, 1.51, -0.75]);
  for (const x of [-0.4, -0.16]) put(new THREE.SphereGeometry(0.014, 6, 4), ROPE, [x, 1.53, -0.75]);
  // Paper lanterns from the second branch.
  for (const [x, y] of [
    [0.42, 1.75],
    [0.58, 1.7],
  ]) {
    b.rod([x, 1.99, -0.72], [x, y + 0.08, -0.72], 0.004, ROPE, { bone: root, sides: 4 });
    glow(put(new THREE.SphereGeometry(0.06, 8, 6), "#ffb35c", [x, y, -0.72], { scale: [1, 1.2, 1] }), 1.3);
    put(new THREE.CylinderGeometry(0.03, 0.03, 0.014, 8), GOLD, [x, y + 0.073, -0.72]);
    put(new THREE.CylinderGeometry(0.025, 0.025, 0.014, 8), GOLD, [x, y - 0.073, -0.72]);
    b.spike([x, y - 0.08, -0.72], [0, -1, 0], 0.07, 0.01, RED, { bone: root, sides: 4 });
  }

  // Blossom tree T2 by the stream.
  const T2: P2 = [0.55, 0.62];
  b.sweep(
    catmull([
      [T2[0], 1.2, T2[1]],
      [T2[0] - 0.05, 1.4, T2[1] - 0.02],
      [T2[0] + 0.03, 1.62, T2[1] + 0.02],
    ]),
    [0.07, 0.05, 0.035],
    BARK,
    { bone: root, sides: 6 },
  );
  branch([T2[0] + 0.01, 1.55, T2[1]], [T2[0] + 0.2, 1.8, T2[1] + 0.05], 0.025, 0.012);
  branch([T2[0] + 0.0, 1.5, T2[1]], [T2[0] - 0.2, 1.75, T2[1] - 0.05], 0.025, 0.012);
  const C2: P3 = [T2[0], 1.95, T2[1]];
  const blossoms: Array<[number, number, number, number, Col]> = [
    [0, 0.08, 0, 0.26, BLOSSOM],
    [0.2, -0.04, 0.05, 0.19, BLOSSOM2],
    [-0.2, -0.05, -0.02, 0.2, BLOSSOM],
    [0.03, -0.03, 0.2, 0.18, BLOSSOM2],
    [0.0, 0.0, -0.2, 0.18, BLOSSOM],
    [0.05, 0.22, 0.02, 0.16, BLOSSOM2],
  ];
  const blossomParts = blossoms.map(([dx, dy, dz, rad, col]) =>
    ico(rad, col, [C2[0] + dx, C2[1] + dy, C2[2] + dz], [1, 0.85, 1], [0, r() * 90, 0], 1),
  );
  leafCards(blossomParts.filter((_, i) => i % 2 === 0), 60, "#ffc2da", PETAL, [0.09, 0.1]);
  leafCards(blossomParts.filter((_, i) => i % 2 === 1), 50, "#ff9fc4", PETAL, [0.09, 0.1]);

  // Pine T3 at the back left.
  {
    const x = -0.6;
    const z = -0.85;
    const g = gy(x, z) - 0.02;
    b.rod([x, g, z], [x, g + 0.3, z], [0.045, 0.03], BARK, { bone: root, sides: 6 });
    const tiers: Array<[number, number, number, Col]> = [
      [0.3, 0.4, 0.2, PINE],
      [0.24, 0.36, 0.45, PINE2],
      [0.18, 0.32, 0.68, PINE],
      [0.1, 0.22, 0.88, PINE2],
    ];
    tiers.forEach(([rad, h, y, col], i) => {
      put(new THREE.ConeGeometry(rad, h, 7), col, [x, g + y + h / 2, z], { rotation: [0, i * 20, 0], flat: true });
    });
    glow(put(new THREE.OctahedronGeometry(0.035, 0), "#ffe08a", [x, g + 1.1, z], { scale: [1, 1.5, 1], flat: true }), 1.3);
  }
  // Bushes with flowers around the island.
  for (const [x, z, s] of [
    [-0.25, -0.35, 0.1],
    [0.6, 0.95, 0.11],
    [-0.9, 0.55, 0.12],
    [0.38, -0.2, 0.09],
    [-0.35, -0.9, 0.1],
    [0.25, 0.55, 0.08],
  ] as P3[]) {
    const g = gy(x, z);
    ico(s, GRASS_DK, [x, g + s * 0.4, z], [1.2, 0.85, 1.2], [0, r() * 90, 0], 1);
    ico(s * 0.7, GRASS_DK, [x + s * 0.9, g + s * 0.25, z + s * 0.3], [1.2, 0.85, 1.2], [0, r() * 90, 0], 1);
    ico(s * 0.12, "#ffffff", [x + s * 0.2, g + s * 0.95, z + s * 0.4], 1, [0, 0, 0]);
    ico(s * 0.12, PINK, [x - s * 0.3, g + s * 0.8, z + s * 0.3], 1, [0, 0, 0]);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Grass tufts and flowers scattered on the dome

  const blocked = (x: number, z: number) =>
    Math.hypot(x, z - PCZ) < 0.68 ||
    Math.hypot(x - PX, z - PZ) < 0.3 ||
    nearStream(x, z, 0.17) ||
    Math.hypot(x, z) > 1.15 ||
    Math.hypot(x - T1[0], z - T1[1]) < 0.2 ||
    Math.hypot(x - T2[0], z - T2[1]) < 0.1 ||
    Math.hypot(x + 0.85, z + 0.05) < 0.38 ||
    Math.hypot(x + 0.5, z - 0.55) < 0.12 ||
    Math.hypot(x - 0.45, z + 0.45) < 0.1 ||
    (x > 0.55 && x < 1.05 && Math.abs(z - BZ) < 0.15);
  const surf = b.surface(cap);
  const grassHits = surf.scatter(260, { rng: r, minDist: 0.045, filter: (h) => h.n.y > 0.75 && !blocked(h.at.x, h.at.z) });
  b.cards(grassHits, GRASS_TEX, { size: [0.08, 0.11], vary: 0.35, spin: 180, rng: r, cross: true });
  const flowerHits = surf.scatter(70, { rng: r, minDist: 0.11, filter: (h) => h.n.y > 0.75 && !blocked(h.at.x, h.at.z) });
  b.cards(flowerHits, FLOWERS, { size: [0.05, 0.1], vary: 0.25, spin: 180, rng: r, cross: true });

  // ---------------------------------------------------------------------------------------------------------------
  // Floating islets

  const islet = (cx: number, cy: number, cz: number, s: number, extra: (ty: number) => void) => {
    b.lathe(
      sc(
        [
          [0, 0],
          [0.08, 0.12],
          [0.26, 0.28],
          [0.42, 0.4],
          [0.46, 0.46],
          [0, 0.46],
        ],
        s,
      ),
      { at: [cx, cy, cz], bone: root, segments: 8, color: rockPaint(cy + 0.46 * s) },
    );
    b.lathe(
      sc(
        [
          [0, 0.52],
          [0.3, 0.51],
          [0.46, 0.47],
          [0.5, 0.41],
          [0.44, 0.38],
          [0, 0.38],
        ],
        s,
      ),
      { at: [cx, cy, cz], bone: root, segments: 9, color: capPaint(cy + 0.41 * s) },
    );
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU + r();
      b.spike(
        [cx + Math.cos(a) * 0.12 * s, cy + 0.25 * s, cz + Math.sin(a) * 0.12 * s],
        [cx + Math.cos(a) * 0.05 * s, cy - 0.1 * s, cz + Math.sin(a) * 0.05 * s],
        null,
        0.05 * s + 0.01,
        ROCK,
        { bone: root, sides: 5 },
      );
    }
    extra(cy + 0.51 * s - 0.01);
  };
  islet(-1.2, 1.55, 0.95, 0.6, (ty) => {
    b.sweep(
      catmull([
        [-1.2, ty, 0.95],
        [-1.18, ty + 0.12, 0.95],
        [-1.2, ty + 0.25, 0.94],
      ]),
      [0.03, 0.018],
      BARK,
      { bone: root, sides: 5 },
    );
    const parts = [
      ico(0.15, LEAF_A, [-1.2, ty + 0.38, 0.94], [1, 0.85, 1], [0, 20, 0], 1),
      ico(0.11, LEAF_B, [-1.1, ty + 0.3, 0.97], [1, 0.85, 1], [0, 50, 0], 1),
      ico(0.11, LEAF_C, [-1.29, ty + 0.32, 0.92], [1, 0.85, 1], [0, 80, 0], 1),
    ];
    leafCards(parts, 22, "#8be67c", LEAF, [0.08, 0.1]);
    ico(0.06, GRASS_DK, [-1.1, ty + 0.03, 0.85], [1.2, 0.8, 1.2], [0, 0, 0], 1);
  });
  islet(1.3, 1.85, -0.35, 0.5, (ty) => {
    column(1.3, ty - 0.01, -0.35, 0.28, true);
    crystalCluster([1.42, ty, -0.28], 0.1);
    ico(0.05, GRASS_DK, [1.18, ty + 0.02, -0.4], [1.2, 0.8, 1.2], [0, 0, 0], 1);
  });
  islet(-1.2, 2.25, -0.55, 0.32, (ty) => {
    crystalCluster([-1.2, ty, -0.55], 0.14);
    ico(0.035, GRASS_DK, [-1.12, ty + 0.01, -0.5], [1.2, 0.8, 1.2], [0, 0, 0], 1);
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Wind: glowing ribbons, motes and butterflies

  glow(
    b.sweep(spiral([0, 0.95, 0], [1.45, 0.95, 0], [0, 1, 0], { turns: 1.2, r1: 1.5, pitch: 0.45 }), [0.002, 0.014, 0.002], "#d6fbff", {
      bone: root,
      sides: 5,
    }),
    1.2,
  );
  glow(
    b.sweep(spiral([0, 2.0, 0], [-1.5, 2.0, 0], [0, 1, 0], { turns: 1.1, r1: 1.3, pitch: 0.3 }), [0.002, 0.012, 0.002], "#d6fbff", {
      bone: root,
      sides: 5,
    }),
    1.2,
  );
  for (let i = 0; i < 18; i++) {
    const a = r() * TAU;
    const d = 0.2 + r() * 1.3;
    glow(put(new THREE.SphereGeometry(0.012 + r() * 0.01, 5, 4), "#e8ffff", [Math.cos(a) * d, 1.4 + r() * 1.2, Math.sin(a) * d]), 1.5);
  }
  b.cards(
    ([
      [-0.2, 1.6, 0.5],
      [0.4, 1.55, 0.2],
      [-0.7, 1.55, 0.35],
      [0.7, 1.7, 0.5],
      [0.1, 1.9, 0.3],
    ] as P3[]).map((p) => frame(p, [0, 0, 1])),
    BUTTERFLY,
    { size: [0.08, 0.06], spin: 180, rng: r },
  );

  return b.root;
}
