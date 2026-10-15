import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { cells, grain, noise, paint, scales, stripes } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Floating Sky Island",
  description:
    "A cel-shaded sky island with a glowing rune-circle ruin, a broken gold-trimmed arch, a waterfall pouring off the rim, a sakura tree, a swing tree, a pond, a stone lantern and cloud puffs below.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type V = [number, number, number];
const D = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "floatingIsland" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const rand = rng(11);
  const G = 1.04; // grass top
  const PT = 1.12; // ruin platform top
  const PCX = -0.4;
  const PCZ = -0.25;

  // ---------------------------------------------------------------- palette
  const GOLD = "#f2c14e";
  const GOLD_HI = "#ffe08a";
  const RED = "#d94a3a";
  const TEAL = "#6ff0f0";
  const S1 = "#e6dcc0";
  const S2 = "#d3c7a6";
  const S3 = "#b9ac8c";
  const ROCKA = "#9d97b3";
  const ROCKB = "#8a84a3";
  const ROCKC = "#b5afc8";
  const ROOT = "#6b4a35";
  const WHITE = "#ffffff";
  const CLOUD_D = "#dce9fb";
  const GREEN_A = "#4fbf55";
  const GREEN_B = "#6bd35c";
  const GREEN_C = "#3da655";
  const VINE = "#3f9c4a";
  const PINK = "#ffb3d1";
  const MOSS = "#78c457";

  // ---------------------------------------------------------------- batching of small repeated shapes
  const batches = new Map<string, { color: string; flat: boolean; geos: THREE.BufferGeometry[] }>();
  const place = (
    color: string,
    flat: boolean,
    geo: THREE.BufferGeometry,
    at: V,
    rot: V = [0, 0, 0],
    scl: V | number = 1,
  ) => {
    const s: V = typeof scl === "number" ? [scl, scl, scl] : scl;
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(at[0], at[1], at[2]),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D)),
      new THREE.Vector3(s[0], s[1], s[2]),
    );
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.applyMatrix4(m);
    const key = `${color}|${flat}`;
    let entry = batches.get(key);
    if (!entry) {
      entry = { color, flat, geos: [] };
      batches.set(key, entry);
    }
    entry.geos.push(g);
  };
  const box = (c: string, size: V, at: V, rot?: V) =>
    place(c, false, new THREE.BoxGeometry(size[0], size[1], size[2]), at, rot);
  const cyl = (c: string, rt: number, rb: number, h: number, seg: number, at: V, rot?: V) =>
    place(c, false, new THREE.CylinderGeometry(rt, rb, h, seg), at, rot);
  const ball = (c: string, r: number, at: V, scl?: V | number) =>
    place(c, false, new THREE.SphereGeometry(r, 8, 6), at, [0, 0, 0], scl);
  const rock = (c: string, r: number, at: V, scl?: V | number, rot?: V) =>
    place(c, true, new THREE.IcosahedronGeometry(r, 0), at, rot, scl);
  const cone = (c: string, r: number, h: number, seg: number, at: V, rot?: V) =>
    place(c, false, new THREE.ConeGeometry(r, h, seg), at, rot);

  const P = (geo: THREE.BufferGeometry, color: Parameters<typeof b.part>[1], at: V, o: Omit<PartOptions, "bone" | "at"> = {}) =>
    b.part(geo, color, { bone: root, at, ...o });

  // ---------------------------------------------------------------- paints
  const rockTones = ["#a8a1be", "#9a93b2", "#b3adc7"];
  const rockPaint = cel(
    paint((p) => {
      const c = cells(p, 0.2, 5);
      if (c.d2 - c.d1 < 0.06) return "#7b7496";
      const band = Math.floor((p.y + 0.12 * noise(p, 0.5, 2)) / 0.075);
      return rockTones[((band % 3) + 3) % 3];
    }),
  );
  const soilPaint = cel(paint((p) => (noise(p, 0.15, 4) > 0.55 ? "#9a6844" : "#84573a")));
  const grassPaint = cel(
    paint((p) => {
      const d = Math.hypot(p.x, p.z);
      if (d > 1.17) return "#b9ee6c";
      const v = noise(p, 0.35, 3);
      return v > 0.58 ? "#92e262" : v < 0.36 ? "#6fcb52" : "#7fda58";
    }),
  );
  const ruinPaint = (seed: number) =>
    cel(
      paint((p) => {
        const row = Math.floor(p.y / 0.09);
        const off = (row % 2) * 0.07;
        const u = p.x + p.z;
        const col = Math.floor((u + off) / 0.14);
        const fy = p.y / 0.09 - row;
        const fx = (u + off) / 0.14 - col;
        if (fy < 0.06 || fx < 0.04) return "#a99d82";
        const m = noise(p, 0.18, seed);
        if (m > 0.66 && p.y < 1.5) return "#8fb86a";
        return m < 0.42 ? "#ddd2b6" : "#eadfc4";
      }),
    );
  const pillarPaint = (cx: number, cz: number) =>
    cel(
      paint((p) => {
        const ang = Math.atan2(p.z - cz, p.x - cx);
        const flute = (((ang / (Math.PI * 2)) * 8) % 1 + 1) % 1;
        if (flute < 0.1) return "#b3a687";
        const drum = ((p.y / 0.17) % 1 + 1) % 1;
        if (drum < 0.05) return "#a89b7c";
        const m = noise(p, 0.15, 7);
        if (p.y < 1.24 && m > 0.55) return "#85b862";
        return m < 0.45 ? "#e4dac0" : "#efe6cf";
      }),
    );
  const paving = cel(scales(["#e8ddc2", "#dfd3b4", "#d6c9a9"], "#a79b7d", { size: 0.14, width: 0.1, seed: 3 }));
  const bark = cel(grain("#8b5a3c", "#6b4330", { size: 0.012, axis: "y" }));
  const barkPink = cel(grain("#7a5547", "#5b3e36", { size: 0.012, axis: "y" }));
  const waterPaint = cel(stripes("#5fd8f0", "#c9f6ff", { size: 0.04, axis: "x", width: 0.35, wobble: 0.8, seed: 4 }));
  const pondPaint = cel(
    paint((p) => {
      const d = Math.hypot(p.x - 0.28, p.z - 0.38);
      return d < 0.12 ? "#8fe9f7" : d < 0.25 ? "#59d3ee" : "#3fb6dd";
    }),
  );
  const canopyA = cel("#62d052");
  const canopyB = cel("#4cbd57");
  const canopyC = cel("#82e062");
  const blossomA = cel("#ffc2dc");
  const blossomB = cel("#ffa6cb");
  const blossomC = cel("#ffd9ea");

  // ---------------------------------------------------------------- textures
  const leafTex = (fill: string, vein: string) =>
    svg(
      `<svg viewBox="0 0 32 48"><path d="M16 47 C3 35 4 12 16 1 C28 12 29 35 16 47Z" fill="${fill}"/><path d="M16 45 L16 9" stroke="${vein}" stroke-width="2" fill="none"/><path d="M16 36 L9 29 M16 28 L23 21 M16 21 L10 15" stroke="${vein}" stroke-width="1.6" fill="none"/></svg>`,
      { size: 128 },
    );
  const leafA = leafTex("#62d052", "#3a9c4a");
  const leafB = leafTex("#8de26a", "#4cae4c");
  const leafC = leafTex("#3fb061", "#2d8a4e");
  const petals = (fill: string) => {
    let s = `<svg viewBox="0 0 48 48"><g transform="translate(24 24)">`;
    for (let i = 0; i < 5; i++) s += `<ellipse cx="0" cy="-10" rx="7" ry="11" fill="${fill}" transform="rotate(${i * 72})"/>`;
    s += `<circle r="4" fill="#ffd45a"/></g></svg>`;
    return svg(s, { size: 96 });
  };
  const blossomTexA = petals("#ffc2dc");
  const blossomTexB = petals("#ffa6cb");
  const tuft = (a: string, c: string, d: string) =>
    svg(
      `<svg viewBox="0 0 32 32"><path d="M3 32 Q6 16 2 5 Q11 15 12 32Z" fill="${a}"/><path d="M10 32 Q12 12 11 1 Q19 13 18 32Z" fill="${c}"/><path d="M17 32 Q22 16 27 3 Q27 18 23 32Z" fill="${d}"/><path d="M22 32 Q27 22 31 13 Q30 25 29 32Z" fill="${a}"/></svg>`,
      { size: 128 },
    );
  const tuftA = tuft("#58c24e", "#7edb5f", "#43a846");
  const tuftB = tuft("#6fd25a", "#97e86a", "#4fb24c");
  const tasselTex = svg(
    `<svg viewBox="0 0 24 48"><path d="M12 40 L3 3 M12 40 L8 2 M12 40 L12 1 M12 40 L16 2 M12 40 L21 3" stroke="${RED}" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="7" y="32" width="10" height="5" fill="${GOLD}"/><circle cx="12" cy="42" r="5" fill="${GOLD}"/><circle cx="10.5" cy="40.5" r="1.6" fill="${GOLD_HI}"/></svg>`,
    { size: 192 },
  );
  const runeCircle = (() => {
    let s = `<svg viewBox="0 0 100 100" fill="none" stroke="${TEAL}">`;
    s += `<circle cx="50" cy="50" r="47" stroke-width="2.4"/><circle cx="50" cy="50" r="40" stroke-width="1.2"/><circle cx="50" cy="50" r="24" stroke-width="2"/>`;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      s += `<line x1="${50 + 40 * Math.cos(a)}" y1="${50 + 40 * Math.sin(a)}" x2="${50 + 47 * Math.cos(a)}" y2="${50 + 47 * Math.sin(a)}" stroke-width="1.4"/>`;
    }
    for (const base of [-90, 90]) {
      const pts = [0, 120, 240].map((k) => {
        const a = (base + k) * D;
        return `${50 + 24 * Math.cos(a)},${50 + 24 * Math.sin(a)}`;
      });
      s += `<polygon points="${pts.join(" ")}" stroke-width="2"/>`;
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * 360 + 22.5;
      s += `<g transform="translate(50 50) rotate(${a}) translate(0 -33)"><rect x="-2" y="-3.5" width="4" height="7" stroke-width="1.4"/><line x1="0" y1="-3.5" x2="0" y2="3.5" stroke-width="1"/></g>`;
    }
    s += `<circle cx="50" cy="50" r="5" fill="${TEAL}" stroke="none"/></svg>`;
    return svg(s, { size: 512 });
  })();
  const legRune = svg(
    `<svg viewBox="0 0 32 64" fill="none" stroke="${TEAL}" stroke-width="1.8" stroke-linecap="round"><path d="M16 4 L26 16 L16 28 L6 16Z"/><path d="M16 28 L16 60"/><path d="M8 38 L24 38 M10 46 L22 46 M12 54 L20 54"/><circle cx="16" cy="16" r="2.4" fill="${TEAL}"/></svg>`,
    { size: 192 },
  );

  // ---------------------------------------------------------------- island body
  const RP: Array<[number, number]> = [
    [0, 0],
    [0.06, 0.1],
    [0.2, 0.22],
    [0.5, 0.36],
    [0.85, 0.55],
    [1.1, 0.68],
    [1.24, 0.78],
  ];
  const rockR = (y: number) => {
    for (let i = 0; i < RP.length - 1; i++) {
      const [r0, y0] = RP[i];
      const [r1, y1] = RP[i + 1];
      if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
    }
    return RP[RP.length - 1][0];
  };
  const rockProfile: OutlinePoint[] = [...RP.map(([r, y]): OutlinePoint => [r, y]), [0, 0.78]];
  b.lathe(rockProfile, { at: [0, 0, 0], bone: root, segments: 10, color: rockPaint, name: "rock" });
  b.lathe(
    [
      [0, 0.7],
      [1.18, 0.7],
      [1.3, 0.82],
      [1.3, 0.92],
      [0, 0.92],
    ],
    { at: [0, 0, 0], bone: root, segments: 10, color: soilPaint, name: "soil" },
  );
  b.lathe(
    [
      [0, G],
      [1.12, G],
      [1.27, 1.0],
      [1.31, 0.94],
      [1.3, 0.88],
      [0, 0.88],
    ],
    { at: [0, 0, 0], bone: root, segments: 10, color: grassPaint, name: "grass" },
  );

  // boulders on the rock flank
  const rockTonesFlat = [ROCKA, ROCKB, ROCKC];
  for (let i = 0; i < 22; i++) {
    const y = 0.2 + rand() * 0.55;
    const a = rand() * 360;
    const r = rockR(y) - 0.01;
    const s = 0.07 + rand() * 0.1;
    rock(rockTonesFlat[i % 3], s, [Math.sin(a * D) * r, y, Math.cos(a * D) * r], [1, 0.8 + rand() * 0.5, 1], [
      rand() * 180,
      rand() * 180,
      0,
    ]);
  }
  // stalactites
  for (let i = 0; i < 12; i++) {
    const y = 0.35 + rand() * 0.35;
    const len = 0.14 + rand() * 0.14;
    const a = rand() * 360;
    const r = rockR(y) - 0.02;
    cone(rockTonesFlat[(i + 1) % 3], 0.05 + rand() * 0.04, len, 6, [Math.sin(a * D) * r, y - len * 0.3, Math.cos(a * D) * r], [180, 0, 0]);
  }
  // hanging roots
  for (let i = 0; i < 16; i++) {
    const a = rand() * 360;
    const len = 0.25 + rand() * 0.2;
    cone(ROOT, 0.018, len, 5, [Math.sin(a * D) * 1.27, 0.8 - len / 2, Math.cos(a * D) * 1.27], [180, 0, 0]);
  }
  // glowing crystals in the rock
  const rockCrystals = (ang: number, y: number) => {
    for (let i = 0; i < 4; i++) {
      const a = (ang + (i - 1.5) * 9) * D;
      const yy = y + (i % 2) * 0.07 - 0.03;
      const r = rockR(yy);
      const k = 0.8 + 0.3 * ((i * 7) % 3);
      glow(
        b.part(new THREE.OctahedronGeometry(0.07), i % 2 ? "#58e8ff" : "#a8f6ff", {
          bone: root,
          at: [Math.sin(a) * (r + 0.01), yy, Math.cos(a) * (r + 0.01)],
          dir: [Math.sin(a) * 0.9, 0.35, Math.cos(a) * 0.9],
          scale: [0.55 * k, 1.9 * k, 0.55 * k],
          flat: true,
        }),
        1.4,
      );
    }
  };
  rockCrystals(70, 0.5);
  rockCrystals(-80, 0.6);

  // ---------------------------------------------------------------- clouds below
  for (let i = 0; i < 10; i++) {
    const a = ((i / 10) * 360 + rand() * 20) * D;
    const rr = 0.5 + rand() * 0.6;
    const cx = Math.sin(a) * rr;
    const cz = Math.cos(a) * rr;
    for (let k = 0; k < 4; k++) {
      const r = 0.1 + rand() * 0.12;
      const ox = (rand() - 0.5) * 0.35;
      const oz = (rand() - 0.5) * 0.35;
      const low = k < 2;
      ball(low ? CLOUD_D : WHITE, r, [cx + ox, low ? r * 0.6 - 0.005 : r * 0.6 + 0.1 + rand() * 0.08, cz + oz], [1, 0.6, 1]);
    }
  }

  // ---------------------------------------------------------------- stream, pond, waterfall
  const wy = G + 0.02;
  const waterPath = catmull([
    [0.22, wy, 0.55],
    [0.12, wy, 0.8],
    [0.03, wy, 1.0],
    [0, G + 0.01, 1.14],
    [0, G, 1.26],
    [0, 0.97, 1.33],
    [0, 0.85, 1.36],
    [0, 0.6, 1.37],
    [0, 0.34, 1.37],
  ]);
  b.sweep(
    waterPath,
    (t) => {
      const k = Math.min(1, Math.max(0, (t - 0.45) / 0.3));
      return [0.05 + 0.055 * k, 0.018 + 0.01 * k] as const;
    },
    { color: waterPaint, name: "water", sides: 8 },
  );
  // pond
  P(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 14), pondPaint, [0.28, G + 0.015, 0.38], { name: "pond" });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    rock(i % 2 ? S2 : S1, 0.04 + rand() * 0.02, [0.28 + Math.cos(a) * 0.31, G + 0.02, 0.38 + Math.sin(a) * 0.31], [1, 0.7, 1], [0, rand() * 90, 0]);
  }
  const pads: Array<[number, number, number]> = [
    [0.2, 0.3, 0.05],
    [0.38, 0.46, 0.045],
    [0.32, 0.25, 0.035],
    [0.15, 0.45, 0.04],
  ];
  for (const [x, z, r] of pads) cyl("#58c95e", r, r, 0.008, 10, [x, G + 0.06, z]);
  ball(PINK, 0.03, [0.2, G + 0.085, 0.3], [1, 0.9, 1]);
  ball(GOLD_HI, 0.012, [0.2, G + 0.11, 0.3]);
  for (let k = 0; k < 5; k++) {
    const a = k * 72;
    cone(PINK, 0.014, 0.06, 5, [0.2 + Math.sin(a * D) * 0.03, G + 0.1, 0.3 + Math.cos(a * D) * 0.03], [Math.cos(a * D) * 30, 0, -Math.sin(a * D) * 30]);
  }
  // waterfall foam, streaks and mist
  for (let i = 0; i < 7; i++) ball(WHITE, 0.025 + rand() * 0.02, [(rand() - 0.5) * 0.18, G + 0.04, 1.2 + rand() * 0.1]);
  for (let i = 0; i < 7; i++) {
    const x = -0.09 + i * 0.03;
    const len = 0.25 + rand() * 0.35;
    box(WHITE, [0.008, len, 0.006], [x, 0.9 - len / 2 - rand() * 0.1, 1.382]);
  }
  for (let i = 0; i < 9; i++) {
    const r = 0.07 + rand() * 0.07;
    ball(i % 3 === 0 ? CLOUD_D : WHITE, r, [(rand() - 0.5) * 0.4, 0.2 + rand() * 0.25, 1.36 + (rand() - 0.5) * 0.2], [1, 0.8, 1]);
  }
  for (let i = 0; i < 4; i++) {
    const r = 0.14 + rand() * 0.06;
    ball(CLOUD_D, r, [(i - 1.5) * 0.25, r * 0.6 - 0.005, 1.3 + rand() * 0.15], [1, 0.6, 1]);
  }
  for (let i = 0; i < 10; i++) ball("#bdf2ff", 0.012, [(rand() - 0.5) * 0.3, 0.45 + rand() * 0.3, 1.41 + rand() * 0.06]);
  // stream bank stones
  for (let i = 0; i < 8; i++) {
    const t = 0.1 + i * 0.1;
    const side = i % 2 ? 1 : -1;
    const q = waterPath.at(t);
    rock(i % 2 ? S2 : S3, 0.03 + rand() * 0.02, [q.x + side * 0.1, G + 0.01, q.z], [1, 0.7, 1], [0, rand() * 90, 0]);
  }
  // little bridge
  for (let i = 0; i < 7; i++) box("#b57a45", [0.04, 0.015, 0.16], [-0.01 + i * 0.04 + 0.01, G + 0.075, 0.8]);
  box(S2, [0.05, 0.07, 0.2], [-0.04, G + 0.035, 0.8]);
  box(S2, [0.05, 0.07, 0.2], [0.28, G + 0.035, 0.8]);
  for (const x of [-0.03, 0.27])
    for (const z of [0.73, 0.87]) {
      cyl("#8a5a34", 0.012, 0.012, 0.11, 6, [x, G + 0.135, z]);
      ball(GOLD, 0.014, [x, G + 0.195, z]);
    }
  for (const z of [0.73, 0.87]) b.rod([-0.03, G + 0.17, z], [0.27, G + 0.17, z], 0.005, RED);

  // ---------------------------------------------------------------- ruins
  const archPaint = ruinPaint(1);
  const pavePaint = ruinPaint(2);
  P(new THREE.CylinderGeometry(0.6, 0.62, 0.05, 12), paving, [PCX, G + 0.025 + 0.005, PCZ], { name: "platform" });
  P(new THREE.CylinderGeometry(0.5, 0.5, 0.03, 12), paving, [PCX, 1.105, PCZ], { name: "platformTop" });
  // gold inlay ring on the platform
  place(GOLD, false, new THREE.TorusGeometry(0.48, 0.008, 4, 28), [PCX, 1.123, PCZ], [90, 0, 0]);
  glow(
    b.part(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", {
      bone: root,
      at: [PCX, 1.125, PCZ],
      dir: [0, 1, 0],
      axis: "z",
      texture: runeCircle,
      name: "runeCircle",
    }),
    1.2,
  );
  // steps
  P(new THREE.BoxGeometry(0.55, 0.03, 0.12), pavePaint, [PCX, 1.055, 0.43]);
  P(new THREE.BoxGeometry(0.5, 0.05, 0.1), pavePaint, [PCX, 1.065, 0.37]);
  // pedestal and floating crystal
  cyl(S2, 0.12, 0.14, 0.05, 8, [PCX, 1.145, PCZ]);
  P(new THREE.CylinderGeometry(0.06, 0.08, 0.2, 8), pillarPaint(PCX, PCZ), [PCX, 1.27, PCZ]);
  cyl(S1, 0.1, 0.07, 0.04, 8, [PCX, 1.39, PCZ]);
  cyl(GOLD, 0.085, 0.085, 0.012, 8, [PCX, 1.415, PCZ]);
  cyl(GOLD, 0.066, 0.066, 0.014, 8, [PCX, 1.2, PCZ]);
  const crystalY = 1.66;
  glow(
    b.part(new THREE.OctahedronGeometry(0.1), TEAL, {
      bone: root,
      at: [PCX, crystalY, PCZ],
      rotation: [0, 30, 0],
      scale: [1, 1.7, 1],
      flat: true,
      name: "skyCrystal",
    }),
    1.6,
  );
  place(GOLD, false, new THREE.TorusGeometry(0.2, 0.007, 5, 24), [PCX, crystalY, PCZ], [70, 0, 20]);
  place(GOLD, false, new THREE.TorusGeometry(0.26, 0.006, 5, 24), [PCX, crystalY, PCZ], [-60, 0, 40]);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    glow(
      b.part(new THREE.OctahedronGeometry(0.03), "#a8f6ff", {
        bone: root,
        at: [PCX + Math.cos(a) * 0.22, crystalY - 0.05 + 0.1 * (i % 2), PCZ + Math.sin(a) * 0.22],
        scale: [0.6, 1.6, 0.6],
        flat: true,
      }),
      1.4,
    );
  }
  // arch
  const acx = PCX;
  const acz = -0.62;
  const AY = 1.62;
  for (const s of [-1, 1]) {
    const lx = acx + s * 0.35;
    P(new THREE.BoxGeometry(0.14, 0.5, 0.13), archPaint, [lx, PT + 0.25, acz], { name: "archLeg" });
    box(S1, [0.18, 0.06, 0.17], [lx, PT + 0.03, acz]);
    box(GOLD, [0.15, 0.025, 0.14], [lx, PT + 0.16, acz]);
    box(GOLD, [0.15, 0.025, 0.14], [lx, AY - 0.1, acz]);
    box(GOLD_HI, [0.05, 0.05, 0.01], [lx, PT + 0.1, acz + 0.07]);
    glow(
      b.part(new THREE.PlaneGeometry(0.09, 0.18), "#ffffff", {
        bone: root,
        at: [lx, PT + 0.3, acz + 0.0704],
        dir: [0, 0, 1],
        axis: "z",
        texture: legRune,
      }),
      1.2,
    );
  }
  b.extrude(arcPoly(0.28, 0.42, 180, 55), {
    at: [acx, AY, acz],
    x: [1, 0, 0],
    thickness: 0.13,
    bevel: 0.008,
    color: archPaint,
    bone: root,
    name: "archL",
  });
  b.extrude(arcPoly(0.28, 0.42, 24, 0), {
    at: [acx, AY, acz],
    x: [1, 0, 0],
    thickness: 0.13,
    bevel: 0.008,
    color: archPaint,
    bone: root,
    name: "archR",
  });
  for (const [r0, r1] of [
    [0.28, 0.295],
    [0.415, 0.43],
  ]) {
    b.extrude(arcPoly(r0, r1, 180, 55), { at: [acx, AY, acz], x: [1, 0, 0], thickness: 0.15, color: GOLD, bone: root });
    b.extrude(arcPoly(r0, r1, 24, 0), { at: [acx, AY, acz], x: [1, 0, 0], thickness: 0.15, color: GOLD, bone: root });
  }
  // sun disc and gem on the arch crown
  place(GOLD, false, new THREE.CylinderGeometry(0.055, 0.055, 0.02, 12), [acx, AY + 0.35, acz + 0.075], [90, 0, 0]);
  glow(b.part(new THREE.SphereGeometry(0.026, 8, 6), TEAL, { bone: root, at: [acx, AY + 0.35, acz + 0.092] }), 1.5);
  // tassel under the crown
  b.rod([acx, AY + 0.28, acz + 0.02], [acx, AY + 0.22, acz + 0.02], 0.005, RED);
  ball(GOLD, 0.016, [acx, AY + 0.21, acz + 0.02]);
  b.cards([frame([acx, AY + 0.2, acz + 0.02], [0, 1, 0])], tasselTex, { size: [0.07, 0.14], lean: 180, flow: [0, 0, 1] });
  // fallen arch blocks and broken ends
  box(S1, [0.12, 0.07, 0.13], [acx + 0.16, PT + 0.035, acz + 0.2], [0, 20, 8]);
  box(S2, [0.1, 0.06, 0.12], [acx + 0.3, PT + 0.03, acz + 0.14], [5, -30, 0]);
  box(S1, [0.09, 0.05, 0.1], [acx + 0.05, PT + 0.025, acz + 0.3], [0, 50, 0]);
  box(S3, [0.06, 0.05, 0.06], [acx - 0.12, AY + 0.3, acz], [10, 20, 30]);
  // vines from the arch
  const vineFrames: ReturnType<typeof frame>[] = [];
  for (const [ox, len] of [
    [-0.24, 0.34],
    [-0.12, 0.22],
    [-0.33, 0.28],
    [0.34, 0.3],
  ]) {
    const x = acx + ox;
    const top = ox < -0.2 ? AY + 0.14 : ox > 0 ? AY - 0.12 : AY + 0.25;
    const vp = catmull([
      [x, top, acz + 0.05],
      [x - 0.02, top - len * 0.35, acz + 0.06],
      [x + 0.01, top - len * 0.7, acz + 0.07],
      [x - 0.01, top - len, acz + 0.07],
    ]);
    b.sweep(vp, [0.01, 0.005], VINE);
    for (const t of [0.2, 0.35, 0.5, 0.65, 0.8, 0.95]) vineFrames.push(frame(vp.at(t), [0, 1, 0]));
  }
  b.cards(vineFrames, [leafA, leafB], { size: 0.06, lean: 150, spin: 180, rng: rng(21), vary: 0.3 });
  // pillars
  function pillar(cx: number, cz: number, h: number, broken: boolean) {
    box(S2, [0.16, 0.04, 0.16], [cx, PT + 0.02, cz]);
    P(new THREE.CylinderGeometry(0.05, 0.058, h, 8), pillarPaint(cx, cz), [cx, PT + 0.04 + h / 2, cz]);
    const top = PT + 0.04 + h;
    cyl(GOLD, 0.062, 0.062, 0.02, 8, [cx, PT + 0.14, cz]);
    if (!broken) {
      cyl(GOLD, 0.057, 0.057, 0.02, 8, [cx, top - 0.08, cz]);
      cyl(S1, 0.08, 0.052, 0.05, 8, [cx, top + 0.025, cz]);
      box(S1, [0.17, 0.035, 0.17], [cx, top + 0.065, cz], [0, rand() * 20, 0]);
    } else {
      box(S1, [0.06, 0.04, 0.05], [cx + 0.01, top + 0.015, cz], [10, 20, 15]);
      ball(MOSS, 0.04, [cx - 0.01, top + 0.03, cz], [1, 0.45, 1]);
    }
  }
  pillar(PCX + Math.sin(50 * D) * 0.42, PCZ + Math.cos(50 * D) * 0.42, 0.62, false);
  pillar(PCX + Math.sin(100 * D) * 0.42, PCZ + Math.cos(100 * D) * 0.42, 0.55, false);
  pillar(PCX + Math.sin(-50 * D) * 0.42, PCZ + Math.cos(-50 * D) * 0.42, 0.3, true);
  pillar(PCX + Math.sin(-105 * D) * 0.42, PCZ + Math.cos(-105 * D) * 0.42, 0.14, true);
  // fallen drum and rubble
  P(new THREE.CylinderGeometry(0.055, 0.055, 0.28, 8), pillarPaint(0, 0), [PCX - 0.2, PT + 0.055, PCZ + 0.38], { rotation: [0, 25, 90] });
  cyl(GOLD, 0.058, 0.058, 0.02, 8, [PCX - 0.2 + 0.05, PT + 0.055, PCZ + 0.38 - 0.02], [0, 25, 90]);
  ball(MOSS, 0.05, [PCX - 0.2, PT + 0.1, PCZ + 0.38], [1, 0.4, 1]);
  for (let i = 0; i < 12; i++) {
    const a = rand() * Math.PI * 2;
    const d = 0.55 + rand() * 0.3;
    rock(i % 2 ? S1 : S3, 0.025 + rand() * 0.03, [PCX + Math.cos(a) * d, G + 0.015, PCZ + Math.sin(a) * d], [1, 0.7, 1], [0, rand() * 90, 0]);
    if (i % 3 === 0) ball(MOSS, 0.03, [PCX + Math.cos(a) * d, G + 0.035, PCZ + Math.sin(a) * d], [1, 0.4, 1]);
  }

  // ---------------------------------------------------------------- stone lantern
  const lx = 0.95;
  const lz = 0.45;
  box(S3, [0.14, 0.04, 0.14], [lx, G + 0.02, lz]);
  cyl(S2, 0.03, 0.035, 0.12, 6, [lx, G + 0.1, lz]);
  box(S1, [0.15, 0.025, 0.15], [lx, G + 0.1725, lz]);
  glow(b.part(new THREE.BoxGeometry(0.09, 0.09, 0.09), "#ffcf6a", { bone: root, at: [lx, G + 0.23, lz], name: "lanternGlow" }), 1.3);
  for (const [dx, dz] of [
    [-0.05, -0.05],
    [0.05, -0.05],
    [-0.05, 0.05],
    [0.05, 0.05],
  ])
    box(S2, [0.015, 0.09, 0.015], [lx + dx, G + 0.23, lz + dz]);
  cone(S1, 0.11, 0.08, 4, [lx, G + 0.32, lz], [0, 45, 0]);
  ball(GOLD, 0.02, [lx, G + 0.375, lz]);

  // ---------------------------------------------------------------- main tree
  const bx = 0.68;
  const bz = -0.45;
  const trunk = catmull([
    [bx, G - 0.03, bz],
    [bx - 0.04, G + 0.25, bz],
    [bx + 0.04, G + 0.55, bz + 0.03],
    [bx, G + 0.8, bz + 0.02],
  ]);
  b.sweep(trunk, [0.12, 0.09, 0.06, 0.045], { color: bark, name: "trunk" });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    b.sweep(
      catmull([
        [bx + 0.04 * ca, G + 0.14, bz + 0.04 * sa],
        [bx + 0.15 * ca, G + 0.03, bz + 0.15 * sa],
        [bx + 0.28 * ca, G - 0.005, bz + 0.28 * sa],
      ]),
      [0.045, 0.025, 0.008],
      bark,
    );
  }
  for (const [tx, ty, tz] of [
    [0.36, G + 0.66, bz],
    [0.95, G + 0.8, bz - 0.1],
    [0.7, G + 0.85, bz - 0.35],
    [0.8, G + 0.78, bz + 0.25],
  ] as V[]) {
    b.sweep(catmull([[bx, G + 0.55, bz], [(bx + tx) / 2, G + 0.68, (bz + tz) / 2], [tx, ty, tz]]), [0.035, 0.014], bark);
  }
  // swing
  b.rod([0.4, G + 0.64, bz - 0.07], [0.4, G + 0.3, bz - 0.07], 0.005, "#c9a26b");
  b.rod([0.4, G + 0.64, bz + 0.07], [0.4, G + 0.3, bz + 0.07], 0.005, "#c9a26b");
  box("#b57a45", [0.06, 0.02, 0.2], [0.4, G + 0.29, bz]);
  box(GOLD, [0.065, 0.006, 0.02], [0.4, G + 0.302, bz - 0.07]);
  box(GOLD, [0.065, 0.006, 0.02], [0.4, G + 0.302, bz + 0.07]);
  const clumps: Array<[number, number, number, number, number]> = [
    [0.68, 2.05, -0.43, 0.3, 0],
    [0.45, 1.9, -0.35, 0.23, 1],
    [0.92, 1.92, -0.5, 0.24, 1],
    [0.62, 1.88, -0.7, 0.22, 2],
    [0.78, 1.9, -0.18, 0.21, 0],
    [0.55, 2.2, -0.5, 0.2, 0],
    [0.85, 2.18, -0.4, 0.18, 2],
    [0.35, 2.05, -0.55, 0.17, 2],
    [1.0, 2.05, -0.28, 0.16, 1],
  ];
  const canopyPaints = [canopyA, canopyB, canopyC];
  const treeFrames: ReturnType<typeof frame>[] = [];
  const cardRand = rng(31);
  for (const [x, y, z, r, tone] of clumps) {
    P(new THREE.IcosahedronGeometry(r, 1), canopyPaints[tone], [x, y, z], { name: "canopy" });
    for (let k = 0; k < 16; k++) {
      treeFrames.push(sphereFrame(cardRand, x, y, z, r));
    }
  }
  b.cards(treeFrames, [leafA, leafB, leafC], { size: 0.11, lean: 35, bend: 20, vary: 0.3, spin: 180, rng: rng(32) });

  // ---------------------------------------------------------------- sakura tree
  const sx = -0.95;
  const sz = 0.25;
  b.sweep(
    catmull([
      [sx, G - 0.02, sz],
      [sx + 0.05, G + 0.2, sz],
      [sx - 0.03, G + 0.4, sz + 0.02],
      [sx, G + 0.6, sz],
    ]),
    [0.08, 0.06, 0.045, 0.035],
    { color: barkPink, name: "sakuraTrunk" },
  );
  for (const [tx, ty, tz] of [
    [sx - 0.2, G + 0.68, sz + 0.05],
    [sx + 0.18, G + 0.62, sz + 0.1],
    [sx, G + 0.75, sz - 0.18],
  ] as V[])
    b.sweep(catmull([[sx, G + 0.42, sz], [(sx + tx) / 2, G + 0.55, (sz + tz) / 2], [tx, ty, tz]]), [0.025, 0.01], barkPink);
  const pinkClumps: Array<[number, number, number, number, number]> = [
    [sx, 1.7, sz, 0.22, 0],
    [sx - 0.15, 1.6, sz - 0.05, 0.16, 1],
    [sx + 0.15, 1.62, sz + 0.05, 0.17, 2],
    [sx - 0.05, 1.82, sz - 0.07, 0.15, 1],
    [sx - 0.1, 1.7, sz + 0.13, 0.13, 0],
  ];
  const pinkPaints = [blossomA, blossomB, blossomC];
  const pinkFrames: ReturnType<typeof frame>[] = [];
  for (const [x, y, z, r, tone] of pinkClumps) {
    P(new THREE.IcosahedronGeometry(r, 1), pinkPaints[tone], [x, y, z], { name: "blossom" });
    for (let k = 0; k < 10; k++) pinkFrames.push(sphereFrame(cardRand, x, y, z, r));
  }
  b.cards(pinkFrames, [blossomTexA, blossomTexB], { size: 0.1, lean: 60, vary: 0.3, spin: 180, rng: rng(33) });
  for (let i = 0; i < 16; i++) {
    cyl(PINK, 0.015, 0.015, 0.003, 5, [sx + (rand() - 0.5) * 0.9, G + 0.003 + rand() * 0.002, sz + (rand() - 0.3) * 0.7]);
  }
  for (let i = 0; i < 14; i++) {
    cyl(PINK, 0.014, 0.014, 0.003, 5, [-1.3 + rand() * 1.0, 1.15 + rand() * 0.8, rand() * 0.9], [rand() * 90, 0, rand() * 90]);
  }

  // ---------------------------------------------------------------- bushes, flowers, mushrooms, grass
  const okSpot = (x: number, z: number) =>
    Math.hypot(x, z) < 1.17 &&
    Math.hypot(x - PCX, z - PCZ) > 0.68 &&
    Math.hypot(x - 0.28, z - 0.38) > 0.36 &&
    !(Math.abs(x) < 0.13 && z > 0.5) &&
    Math.hypot(x - bx, z - bz) > 0.17 &&
    Math.hypot(x - sx, z - sz) > 0.1 &&
    Math.hypot(x - lx, z - lz) > 0.12 &&
    !(x > -0.06 && x < 0.3 && z > 0.7 && z < 0.9);
  const bushTones = [GREEN_A, GREEN_B, GREEN_C];
  for (let i = 0; i < 10; i++) {
    const a = rand() * 360;
    const d = 0.95 + rand() * 0.2;
    const x = Math.sin(a * D) * d;
    const z = Math.cos(a * D) * d;
    if (!okSpot(x, z)) continue;
    const s = 0.07 + rand() * 0.07;
    rock(bushTones[i % 3], s, [x, G + s * 0.5, z], [1, 0.8, 1], [rand() * 90, rand() * 90, 0]);
    rock(bushTones[(i + 1) % 3], s * 0.7, [x + s * 0.8, G + s * 0.35, z + s * 0.3], [1, 0.8, 1], [rand() * 90, rand() * 90, 0]);
  }
  const flowerColors = [WHITE, "#ffe36a", "#ff8fb8", "#b9a4ff"];
  let flowers = 0;
  for (let i = 0; i < 160 && flowers < 48; i++) {
    const x = (rand() - 0.5) * 2.4;
    const z = (rand() - 0.5) * 2.4;
    if (!okSpot(x, z)) continue;
    flowers++;
    box(VINE, [0.004, 0.05, 0.004], [x, G + 0.025, z]);
    ball(flowerColors[flowers % 4], 0.018, [x, G + 0.055, z]);
    ball(GOLD, 0.008, [x, G + 0.068, z]);
  }
  const mush: Array<[number, number]> = [
    [bx - 0.2, bz + 0.18],
    [bx - 0.26, bz + 0.1],
    [bx + 0.18, bz + 0.22],
    [sx + 0.12, sz + 0.2],
  ];
  for (const [x, z] of mush) {
    const k = 0.8 + rand() * 0.5;
    cyl("#fff2d0", 0.012 * k, 0.015 * k, 0.05 * k, 6, [x, G + 0.025 * k, z]);
    place("#ff6a5a", false, new THREE.SphereGeometry(0.035 * k, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), [x, G + 0.05 * k, z]);
    for (let d = 0; d < 3; d++) ball(WHITE, 0.007 * k, [x + Math.cos(d * 2.1) * 0.02 * k, G + 0.075 * k, z + Math.sin(d * 2.1) * 0.02 * k]);
  }
  const tuftFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 700 && tuftFrames.length < 170; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * 1.2;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (!okSpot(x, z)) continue;
    tuftFrames.push(frame([x, G, z], [0, 1, 0]));
  }
  b.cards(tuftFrames, [tuftA, tuftB], { size: [0.1, 0.12], cross: true, vary: 0.4, spin: 180, rng: rng(5), sink: 0.05 });

  // ---------------------------------------------------------------- floating islets
  const islet = (x: number, y: number, z: number, r: number, kind: number) => {
    cone(ROCKB, r, r * 1.6, 7, [x, y - r * 0.8, z], [180, 0, 0]);
    place("#86dc5c", true, new THREE.CylinderGeometry(r * 1.03, r * 1.03, 0.045, 7), [x, y, z]);
    if (kind === 0) {
      cyl("#6b4a3c", 0.012, 0.016, 0.1, 5, [x, y + 0.07, z]);
      rock(GREEN_A, 0.07, [x, y + 0.15, z], [1, 0.9, 1]);
      rock(GREEN_B, 0.05, [x + 0.04, y + 0.2, z], [1, 0.9, 1]);
    } else if (kind === 1) {
      glow(
        b.part(new THREE.OctahedronGeometry(0.045), "#58e8ff", {
          bone: root,
          at: [x, y + 0.1, z],
          scale: [0.6, 1.8, 0.6],
          flat: true,
        }),
        1.4,
      );
    } else {
      box(S1, [0.05, 0.12, 0.05], [x, y + 0.08, z]);
      box(GOLD, [0.055, 0.015, 0.055], [x, y + 0.11, z]);
      rock(ROCKC, 0.04, [x + 0.07, y + 0.03, z], [1, 0.7, 1]);
    }
    for (let k = 0; k < 3; k++) cone(ROOT, 0.012, 0.15, 5, [x + (k - 1) * 0.05, y - r * 1.6 - 0.02, z], [180, 0, 0]);
  };
  islet(1.4, 0.85, 0.45, 0.16, 0);
  islet(-1.4, 0.75, 0.65, 0.14, 1);
  islet(1.15, 1.35, -0.85, 0.15, 2);
  islet(-1.25, 1.4, -0.75, 0.12, 1);

  // ---------------------------------------------------------------- flush batches
  for (const { color, flat, geos } of batches.values()) {
    const merged = mergeGeometries(geos);
    if (merged) b.part(merged, color, { bone: root, at: [0, 0, 0], flat });
  }

  return b.root;

  // ---------------------------------------------------------------- local helpers (hoisted)
  function arcPoly(r0: number, r1: number, aFrom: number, aTo: number): OutlinePoint[] {
    const n = Math.max(2, Math.round(Math.abs(aFrom - aTo) / 9));
    const out: OutlinePoint[] = [];
    for (let i = 0; i <= n; i++) {
      const a = (aFrom + ((aTo - aFrom) * i) / n) * D;
      out.push([r1 * Math.cos(a), r1 * Math.sin(a)]);
    }
    for (let i = n; i >= 0; i--) {
      const a = (aFrom + ((aTo - aFrom) * i) / n) * D;
      out.push([r0 * Math.cos(a), r0 * Math.sin(a)]);
    }
    return out;
  }
  function sphereFrame(random: () => number, x: number, y: number, z: number, r: number) {
    let u = random() * 2 - 1;
    if (u < -0.4) u = -u;
    const th = random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const d: V = [s * Math.cos(th), u, s * Math.sin(th)];
    return frame([x + d[0] * r * 0.97, y + d[1] * r * 0.97, z + d[2] * r * 0.97], d);
  }
}
