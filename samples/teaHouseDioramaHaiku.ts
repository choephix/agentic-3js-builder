import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import type { Fill } from "../src/context";
import { cel, INK } from "../kits/toon";
import { glow } from "../kits/glow";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { grain, mottle, noise, paint, scales } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Mountain Tea House",
  description:
    "A jade-roofed tea pavilion on a stone plinth beside a lantern-lit stream, with a vermilion arch bridge, a blossoming cherry tree, a waterfall off a snow-capped peak and a glowing torii.",
  style: "high-fantasy anime",
  commit: "b816db2",
};

type V = [number, number, number];
type Col = Fill;

const fr = (v: number) => v - Math.floor(v);

// ---------------------------------------------------------------- textures
const xmlns = 'xmlns="http://www.w3.org/2000/svg"';

const flowerSvg = (fill: string, edge: string) => {
  let s = "";
  for (let i = 0; i < 5; i++)
    s += `<ellipse cx="32" cy="18" rx="12" ry="17" transform="rotate(${i * 72} 32 32)" fill="${fill}" stroke="${edge}" stroke-width="2.5"/>`;
  return `<svg ${xmlns} viewBox="0 0 64 64">${s}<circle cx="32" cy="32" r="6" fill="#ffe27a"/></svg>`;
};
const BLOSSOM_A = svg(flowerSvg("#ffc4da", "#e0699a"), { size: 128 });
const BLOSSOM_B = svg(flowerSvg("#ffe6f0", "#f09ab8"), { size: 128 });
const PETAL = svg(
  `<svg ${xmlns} viewBox="0 0 64 96"><path d="M32 2 C58 30 56 70 32 94 C8 70 6 30 32 2Z" fill="#ffb8d0" stroke="#e0699a" stroke-width="2.5"/></svg>`,
  { size: 128 },
);
const LEAF = svg(
  `<svg ${xmlns} viewBox="0 0 64 64"><path d="M6 60 Q36 40 60 6 Q48 36 40 58 Q24 62 6 60Z" fill="#9be08a" stroke="#3f8f4f" stroke-width="2.5"/></svg>`,
  { size: 128 },
);
const GRASS_BLADE = svg(
  `<svg ${xmlns} viewBox="0 0 64 64"><path d="M10 64 Q14 30 30 4 Q24 34 40 64Z" fill="#7fd36a" stroke="#3f8f4f" stroke-width="2"/><path d="M26 64 Q30 36 52 16 Q40 44 44 64Z" fill="#a6e27c" stroke="#3f8f4f" stroke-width="2"/></svg>`,
  { size: 128 },
);
const LILY = svg(
  `<svg ${xmlns} viewBox="0 0 64 64"><path d="M32 32 L58.3 22.4 A28 28 0 1 0 58.3 41.6 Z" fill="#6fcf7a" stroke="#3f8f4f" stroke-width="2.5"/><circle cx="32" cy="32" r="3" fill="#ffd0e4"/></svg>`,
  { size: 128 },
);
const SHOJI = svg(
  `<svg ${xmlns} viewBox="0 0 200 170"><rect width="200" height="170" fill="#fff4dc"/>` +
    `<path d="M118 168 Q140 118 186 98" stroke="#6e3f26" stroke-width="5" fill="none"/>` +
    `<circle cx="186" cy="98" r="7" fill="#ffb8d0"/><circle cx="160" cy="120" r="6" fill="#ffc6dc"/><circle cx="142" cy="136" r="5" fill="#ffb8d0"/>` +
    [25, 50, 75, 100, 125, 150, 175].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="170" stroke="${INK}" stroke-width="3"/>`).join("") +
    [28, 56, 84, 112, 140].map((y) => `<line x1="0" y1="${y}" x2="200" y2="${y}" stroke="${INK}" stroke-width="3"/>`).join("") +
    `<rect x="2" y="2" width="196" height="166" fill="none" stroke="${INK}" stroke-width="5"/></svg>`,
  { size: 512 },
);
const RUNE = svg(
  `<svg ${xmlns} viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="none" stroke="#ffd65c" stroke-width="3"/><circle cx="32" cy="32" r="22" fill="none" stroke="#9fe8ff" stroke-width="2"/><path d="M32 12 L44 32 L32 52 L20 32Z" fill="none" stroke="#ffd65c" stroke-width="2.5"/><path d="M32 22 V42 M25 29 L32 23 L39 29" fill="none" stroke="#9fe8ff" stroke-width="2.5"/></svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------- palette
// Two-tone cel colours (lit, hue-shifted shadow). Paints carry the wood grain,
// stone mottle, plank seams, roof tiles and banner trims.
const VERM = cel("#e0492f");
const VERM_DK = cel("#a6302d", "#6e1f2e");
const GOLD = cel("#ffd65c", "#c98d2c");
const CREAM = cel("#fff3d8", "#e6c894");
const WOOD_DK = cel("#6e3f26", "#46261a");
const LACQUER = cel("#4b2b22", "#2b1812");
const TEAL = cel("#2fb0a2", "#1d7470");
const CUSHION = cel("#cc3551", "#8c2040");
const WHITE = cel("#fff8ee", "#dcc8a8");
const TATAMI = cel("#dbe98f", "#a2b867");
const STONE = cel(paint((p) => (noise(p, 0.07, 4) > 0.5 ? "#a9b1bc" : "#808a98")));
const STONE_DK = cel("#6d7685", "#474e5c");
const ROCK = cel(paint((p) => (p.y < 0.85 && noise(p, 0.1, 6) > 0.5 ? "#7fbf6a" : fr(p.y / 0.12) < 0.09 ? "#66748c" : noise(p, 0.14, 2) > 0.55 ? "#9ca8bd" : "#b9c3d4")));
const LEDGE = cel("#8a97ad", "#5b6780");
const SNOW = cel("#ffffff", "#bfd6f2");
const GRASS = cel(mottle("#97e072", "#5cbb67", { size: 0.1, contrast: 0.5 }));
const WOOD = grain("#dea064", "#b07442", { size: 0.02, axis: "x" });
const DECK = cel(paint((p) => (fr(p.z / 0.1) < 0.045 ? "#5a3520" : WOOD)));
const BARK = cel(grain("#7b4a33", "#4d2c20", { size: 0.03, axis: "y" }));
const BLOSS = cel("#ffc6dc", "#e77fa6");
const SHRUB = cel(mottle("#72d27c", "#3f9e5c", { size: 0.06 }));
const PINE = cel(mottle("#2f9d6e", "#1c6b52", { size: 0.08 }));
const BAMBOO = cel(paint((p) => (fr(p.y / 0.14) < 0.09 ? "#3c7a3e" : "#97da70")));
const WATER = cel(paint((p) => (noise(p, 0.05, 9) > 0.62 ? "#dcf8ff" : "#4fc3ef")), "#2a7fc9");
const FOAM = cel("#eafcff", "#8fd3f0");
const ROOF = cel(scales("#48bcab", "#1d6a66", { size: 0.07, width: 0.2 }));
const BANNER = cel(paint((_p, _n, s) => (Math.abs(s[0]) > 0.055 || s[1] < -0.2 ? "#ffd65c" : "#b8242e")));
const NOREN = cel(
  paint((_p, _n, s) => {
    const u = s[0];
    const v = s[1];
    if (Math.hypot(u, v + 0.16) < 0.06) return "#ffd65c";
    if (Math.abs(u) > 0.165 || v > -0.03 || v < -0.27) return "#ffd65c";
    return "#34479a";
  }),
);
const LANTERN = "#ffb35a";
const LAMP = "#ffe39a";
const EMBER = "#ff8a3a";
const ORB = "#a6ecff";

export default function build() {
  const b = createBuilder({ name: "teaHouseDioramaHaiku", paintSize: 2048 });
  const root = b.joint("base", { at: [0, 0, 0] });
  const noren = b.joint("noren", { parent: root, at: [-0.2, 1.2, 0.84], dir: [0, -1, 0], role: "hinge" });
  const lanternL = b.joint("lanternL", { parent: root, at: [-0.7, 1.22, 1.02], dir: [0, -1, 0], role: "hinge" });
  const lanternR = b.joint("lanternR", { parent: root, at: [0.3, 1.22, 1.02], dir: [0, -1, 0], role: "hinge" });
  type Joint = typeof root;

  // ------------------------------------------------------------ helpers
  const put = (geo: THREE.BufferGeometry, color: Col, at: V, scale: V = [1, 1, 1]) =>
    b.part(geo, color, { bone: root, at, scale });
  const rod = (a: V, c: V, r: number, color: Col, bone: Joint = root) => b.rod(a, c, r, { color, bone });
  const tube = (pts: V[], r: number | [number, number], color: Col) =>
    b.sweep(catmull(pts), r, { color, bone: root });
  const turn = (pts: OutlinePoint[], at: V, color: Col, segments = 12, bone: Joint = root) =>
    b.lathe(pts, { at, segments, color, bone });
  const rock = (x: number, z: number, r: number, color: Col, sy = 0.6) =>
    put(new THREE.SphereGeometry(r, 7, 5), color, [x, 0.3 + r * sy * 0.55, z], [1, sy, 1]);
  const flag = (x: number, z: number, r: number, seed: number) => {
    const g = rng(seed);
    const pts: OutlinePoint[] = [];
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const k = r * (0.8 + 0.3 * g());
      pts.push([Math.cos(a) * k, Math.sin(a) * k]);
    }
    b.extrude(pts, { at: [x, 0.315, z], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.03, bevel: 0.008, color: STONE, bone: root });
  };
  const LANTERN_PROFILE: OutlinePoint[] = [
    [0, 0], [0.05, 0], [0.075, 0.04], [0.085, 0.1], [0.075, 0.16], [0.05, 0.2], [0, 0.2],
  ];
  const lantern = (x: number, y0: number, z: number, bone: Joint) => {
    glow(turn(LANTERN_PROFILE, [x, y0, z], LANTERN, 10, bone), 1.2);
    for (const dy of [0.04, 0.16])
      b.part(new THREE.TorusGeometry(0.078, 0.004, 4, 14), GOLD, { bone, at: [x, y0 + dy, z], rotation: [90, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.02, 8), GOLD, { bone, at: [x, y0 + 0.21, z] });
    rod([x, y0, z], [x, y0 - 0.04, z], 0.004, GOLD, bone);
  };
  const potted = (x: number, z: number) => {
    turn([[0, 0], [0.07, 0], [0.09, 0.06], [0.1, 0.1], [0.08, 0.12], [0, 0.12]], [x, 0.42, z], TEAL, 8);
    rod([x, 0.5, z], [x + 0.03, 0.66, z], 0.012, BARK);
    const crown = put(new THREE.SphereGeometry(0.11, 8, 6), SHRUB, [x + 0.03, 0.72, z], [1.1, 0.7, 1]);
    b.cards(b.surface(crown).scatter(40, { rng: rng(Math.round(x * 100) + 5), minDist: 0.035 }), [LEAF, BLOSSOM_B], {
      size: 0.06,
      lean: 40,
      rng: rng(91),
    });
  };
  const shrub = (x: number, z: number, r: number, seed: number) => {
    const m = put(new THREE.SphereGeometry(r, 9, 6), SHRUB, [x, 0.3 + r * 0.7, z], [1.25, 0.85, 1.2]);
    b.cards(b.surface(m).scatter(26, { rng: rng(seed), minDist: r * 0.5 }), [BLOSSOM_B, BLOSSOM_A], {
      size: r * 0.9,
      lean: 25,
      vary: 0.25,
      rng: rng(seed + 1),
    });
  };
  const pine = (x: number, z: number, h: number) => {
    rod([x, 0.3, z], [x, 0.3 + h * 0.75, z], 0.022, BARK);
    for (let k = 0; k < 4; k++) {
      const yb = 0.3 + h * (0.22 + 0.18 * k);
      const hT = h * 0.42;
      const rr = h * (0.34 - 0.065 * k);
      turn([[0, 0], [rr, 0], [rr * 0.4, hT * 0.35], [0, hT]], [x, yb, z], PINE, 9);
    }
  };

  // ------------------------------------------------------------ plinth and stream
  const plinth: OutlinePoint[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    plinth.push([1.35 * Math.sign(c) * Math.abs(c) ** 0.8, -0.15 + 1.35 * Math.sign(s) * Math.abs(s) ** 0.8]);
  }
  b.extrude(plinth, {
    at: [0, 0.15, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.3,
    bevel: 0.03,
    color: paint((_p, n) => (n.y > 0.5 ? GRASS : STONE)),
    bone: root,
  });

  const streamTop: OutlinePoint[] = [];
  const streamBot: OutlinePoint[] = [];
  const NS = 16;
  for (let i = 0; i <= NS; i++) {
    const x = -1.2 + (2.4 * i) / NS;
    streamTop.push([x, -0.02 + 0.025 * Math.sin(x * 5)]);
    streamBot.push([x, -0.26 + 0.025 * Math.cos(x * 4 + 0.6)]);
  }
  b.extrude([...streamTop, ...streamBot.reverse()], {
    at: [0, 0.31, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.02,
    bevel: 0.006,
    color: WATER,
    bone: root,
  });

  const lilies: V[] = [
    [-0.95, 0.335, -0.1], [-0.7, 0.335, -0.17], [-0.45, 0.335, -0.06], [-0.12, 0.335, -0.19],
    [0.18, 0.335, -0.08], [0.92, 0.335, -0.14], [1.02, 0.335, -0.06],
  ];
  b.cards(
    lilies.map((p) => frame(p, [0, 1, 0])),
    LILY,
    { size: 0.12, lean: 90, flow: [1, 0, 0], vary: 0.2, rng: rng(21), bone: root },
  );

  const banks: [number, number, number][] = [
    [-1.0, 0.07, 0.07], [-0.55, 0.11, 0.06], [-0.1, 0.09, 0.075], [0.22, 0.06, 0.05], [0.95, 0.12, 0.08],
    [-0.95, -0.33, 0.07], [-0.3, -0.36, 0.055], [0.2, -0.33, 0.05], [0.9, -0.35, 0.065],
  ];
  for (const [x, z, r] of banks) rock(x, z, r, STONE_DK);

  // waterfall off the peak, falling into a foam pool at the stream's edge
  const pool: OutlinePoint[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    pool.push([Math.cos(a) * 0.12, Math.sin(a) * 0.07]);
  }
  b.extrude(pool, { at: [-0.4, 0.318, -0.33], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.02, bevel: 0.006, color: FOAM, bone: root });

  // ------------------------------------------------------------ mountain
  const MT: V = [-0.4, 0.3, -0.88];
  const MOUNTAIN: OutlinePoint[] = [
    [0, 0], [0.5, 0], [0.45, 0.4], [0.36, 0.8], [0.25, 1.1], [0.126, 1.32], [0.027, 1.5], [0, 1.5],
  ];
  const mountain = turn(MOUNTAIN, MT, ROCK, 7);
  turn([[0, 0.42], [0.5, 0.42], [0.505, 0.455], [0.47, 0.485], [0, 0.485]], MT, LEDGE, 7);
  turn([[0, 0.92], [0.33, 0.92], [0.335, 0.96], [0.31, 0.98], [0, 0.98]], MT, LEDGE, 7);
  turn(
    [[0, 1.0], [0.306, 1.0], [0.27, 1.1], [0.18, 1.27], [0.09, 1.4], [0.036, 1.52], [0, 1.52]],
    MT,
    SNOW,
    7,
  );
  glow(b.decal(mountain, RUNE, { at: [-0.4, 0.8, -0.44], dir: [0, 0, 1], size: [0.2, 0.2], bone: root }), 1);
  tube([[-0.4, 1.3, -0.6], [-0.4, 0.95, -0.47], [-0.4, 0.6, -0.44], [-0.4, 0.36, -0.4]], [0.045, 0.03], FOAM);

  // a few crags at the foot of the peak
  rock(-0.8, -0.62, 0.1, ROCK, 0.9);
  rock(-0.05, -0.62, 0.08, ROCK, 0.9);
  rock(-0.62, -1.18, 0.12, STONE_DK, 0.8);

  // ------------------------------------------------------------ cherry tree
  tube([[0.82, 0.3, -0.9], [0.84, 0.7, -0.86], [0.8, 1.05, -0.9], [0.86, 1.35, -0.95]], [0.075, 0.04], BARK);
  tube([[0.84, 0.7, -0.86], [0.98, 0.86, -0.8], [1.12, 1.02, -0.78]], [0.03, 0.01], BARK);
  tube([[0.8, 1.05, -0.9], [0.62, 1.25, -0.98], [0.5, 1.45, -1.0]], [0.03, 0.008], BARK);
  tube([[0.86, 1.35, -0.95], [0.98, 1.6, -0.98], [1.1, 1.78, -0.92]], [0.025, 0.008], BARK);
  tube([[0.86, 1.35, -0.95], [0.75, 1.58, -0.8], [0.66, 1.8, -0.7]], [0.025, 0.008], BARK);
  tube([[0.8, 1.05, -0.9], [0.96, 1.22, -1.12]], [0.025, 0.008], BARK);
  tube([[0.84, 0.7, -0.86], [0.7, 0.82, -0.62]], [0.025, 0.008], BARK);
  const canopy = put(new THREE.SphereGeometry(0.44, 10, 8), BLOSS, [0.86, 1.6, -0.92], [1.15, 0.82, 1.05]);
  b.cards(b.surface(canopy).scatter(280, { rng: rng(11), minDist: 0.05 }), [BLOSSOM_A, BLOSSOM_B], {
    size: 0.075,
    lean: 30,
    vary: 0.3,
    rng: rng(12),
  });
  const clump = put(new THREE.SphereGeometry(0.22, 8, 6), BLOSS, [0.56, 1.42, -0.98], [1, 0.8, 1]);
  b.cards(b.surface(clump).scatter(90, { rng: rng(13), minDist: 0.04 }), [BLOSSOM_A, BLOSSOM_B], {
    size: 0.07,
    lean: 30,
    vary: 0.3,
    rng: rng(14),
  });
  rock(0.82, -0.9, 0.17, STONE_DK, 0.5);
  // paper lanterns hung from the cherry canopy
  lantern(0.5, 1.05, -1.0, root);
  rod([0.5, 1.45, -1.0], [0.5, 1.25, -1.0], 0.006, GOLD);
  lantern(0.96, 0.9, -1.12, root);
  rod([0.96, 1.22, -1.12], [0.96, 1.1, -1.12], 0.006, GOLD);

  // petals in the air and fallen on the grass
  const gp = rng(41);
  const airPetals = Array.from({ length: 40 }, () =>
    frame([0.1 + gp() * 1.2, 0.6 + gp() * 1.3, -1.2 + gp() * 1.4], [gp() - 0.5, gp() - 0.5, gp() - 0.5]),
  );
  b.cards(airPetals, PETAL, { size: [0.035, 0.05], lean: 0, vary: 0.3, rng: rng(42), bone: root });
  const gf = rng(43);
  const fallen = Array.from({ length: 50 }, () => {
    const a = gf() * Math.PI * 2;
    const d = 0.2 + gf() * 0.65;
    return frame([0.82 + Math.cos(a) * d, 0.305, -0.9 + Math.sin(a) * d], [0, 1, 0]);
  });
  b.cards(fallen, PETAL, { size: [0.04, 0.05], lean: 90, flow: [1, 0, 0], spin: 180, rng: rng(44), bone: root });

  // ------------------------------------------------------------ bridge
  const deckPts: V[] = [];
  for (let i = 0; i <= 5; i++) {
    const t = i / 5;
    deckPts.push([0.5, 0.31 + 0.3 * Math.sin(Math.PI * t), 0.32 - 0.82 * t]);
  }
  b.sweep(catmull(deckPts), [0.14, 0.03], { section: "box", color: DECK, bone: root });
  for (const s of [-1, 1]) {
    const x = 0.5 + s * 0.14;
    tube(deckPts.map(([, py, pz]) => [x, py + 0.2, pz] as V), 0.016, VERM);
    for (const [, py, pz] of deckPts) {
      rod([x, py, pz], [x, py + 0.2, pz], 0.016, VERM);
      put(new THREE.SphereGeometry(0.024, 6, 4), GOLD, [x, py + 0.22, pz]);
    }
  }
  for (const s of [-1, 1]) {
    const p = deckPts[2];
    glow(put(new THREE.SphereGeometry(0.035, 8, 6), LANTERN, [0.5 + s * 0.14, p[1] + 0.28, p[2]]), 1.2);
  }
  // stone abutments under the deck ends
  put(new THREE.BoxGeometry(0.36, 0.06, 0.2), STONE, [0.5, 0.32, 0.36]);
  put(new THREE.BoxGeometry(0.36, 0.06, 0.2), STONE, [0.5, 0.33, -0.53]);
  // banners on poles at the bridge's near end
  for (const x of [0.34, 0.66]) {
    rod([x, 0.3, 0.26], [x, 0.84, 0.26], 0.012, GOLD);
    b.extrude(
      [[-0.07, 0], [0.07, 0], [0.07, -0.3], [0, -0.25], [-0.07, -0.3]],
      { at: [x, 0.82, 0.26], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.008, bevel: 0.002, color: BANNER, bone: root },
    );
  }

  // vermilion torii at the back bank, framing the way to the peak
  for (const x of [0.0, 0.36]) {
    rod([x, 0.3, -0.42], [x, 0.9, -0.42], 0.02, VERM);
    turn([[0, 0], [0.04, 0], [0.05, 0.03], [0, 0.03]], [x, 0.3, -0.42], STONE_DK, 8);
  }
  tube([[-0.07, 0.92, -0.42], [0.18, 0.99, -0.42], [0.43, 0.92, -0.42]], 0.024, VERM);
  rod([0.0, 0.8, -0.42], [0.36, 0.8, -0.42], 0.016, VERM_DK);

  // ------------------------------------------------------------ path and stones
  const pathStones: [number, number, number][] = [
    [-0.05, 1.02, 0.08], [0.1, 1.05, 0.07], [0.25, 0.98, 0.08], [0.4, 0.9, 0.08], [0.44, 0.72, 0.07],
    [0.47, 0.58, 0.07], [0.5, 0.46, 0.07],
  ];
  pathStones.forEach(([x, z, r], i) => flag(x, z, r, 100 + i));

  // ------------------------------------------------------------ tea house
  // platform
  put(new THREE.BoxGeometry(1.1, 0.12, 0.8), DECK, [-0.2, 0.36, 0.45]);
  put(new THREE.BoxGeometry(0.42, 0.12, 0.14), STONE, [-0.2, 0.36, 0.93]);
  // tatami and low table
  put(new THREE.BoxGeometry(0.98, 0.02, 0.6), TATAMI, [-0.2, 0.43, 0.46]);
  put(new THREE.BoxGeometry(0.42, 0.03, 0.26), LACQUER, [-0.42, 0.6, 0.45]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    rod([-0.42 + sx * 0.18, 0.44, 0.45 + sz * 0.1], [-0.42 + sx * 0.18, 0.585, 0.45 + sz * 0.1], 0.012, LACQUER);

  // pillars, under the roof
  for (const x of [-0.72, 0.32]) for (const z of [0.12, 0.8]) {
    rod([x, 0.42, z], [x, 1.28, z], 0.04, VERM);
    turn([[0, 0], [0.07, 0], [0.06, 0.03], [0.045, 0.06], [0, 0.06]], [x, 0.42, z], STONE_DK, 8);
  }

  // back shoji wall, lit from within, and its frame
  const shoji = b.part(new THREE.PlaneGeometry(0.96, 0.8), "#ffffff", { bone: root, at: [-0.2, 0.86, 0.135], texture: SHOJI });
  glow(shoji, 0.45);
  put(new THREE.BoxGeometry(1.0, 0.03, 0.03), WOOD_DK, [-0.2, 1.27, 0.14]);
  put(new THREE.BoxGeometry(1.0, 0.03, 0.03), WOOD_DK, [-0.2, 0.45, 0.14]);
  put(new THREE.BoxGeometry(0.03, 0.82, 0.03), WOOD_DK, [-0.685, 0.86, 0.14]);
  put(new THREE.BoxGeometry(0.03, 0.82, 0.03), WOOD_DK, [0.285, 0.86, 0.14]);
  // left wall, solid paper panel
  put(new THREE.BoxGeometry(0.03, 0.8, 0.66), CREAM, [-0.72, 0.86, 0.46]);

  // front rail with an opening for the entrance
  for (const [x0, x1] of [[-0.75, -0.5], [0.1, 0.35]] as const) {
    rod([x0, 0.6, 0.86], [x1, 0.6, 0.86], 0.012, VERM_DK);
    rod([x0, 0.42, 0.86], [x0, 0.6, 0.86], 0.012, VERM_DK);
    rod([x1, 0.42, 0.86], [x1, 0.6, 0.86], 0.012, VERM_DK);
  }

  // interior: teapot, cups, cushions, brazier, ceiling lantern
  const TP: V = [-0.42, 0.615, 0.45];
  turn([[0, 0], [0.05, 0], [0.075, 0.03], [0.085, 0.07], [0.075, 0.1], [0.04, 0.115], [0, 0.115]], TP, TEAL, 12);
  put(new THREE.SphereGeometry(0.014, 6, 4), GOLD, [TP[0], TP[1] + 0.13, TP[2]]);
  tube(
    [[TP[0] + 0.07, TP[1] + 0.05, TP[2]], [TP[0] + 0.12, TP[1] + 0.09, TP[2]], [TP[0] + 0.15, TP[1] + 0.13, TP[2]]],
    [0.012, 0.006],
    TEAL,
  );
  tube(
    [[TP[0] - 0.07, TP[1] + 0.06, TP[2]], [TP[0] - 0.12, TP[1] + 0.1, TP[2]], [TP[0] - 0.08, TP[1] + 0.13, TP[2]]],
    [0.01, 0.01],
    TEAL,
  );
  for (const [x, z] of [[-0.56, 0.5], [-0.3, 0.42], [-0.5, 0.36]] as const)
    turn([[0, 0], [0.024, 0], [0.032, 0.02], [0.03, 0.036], [0, 0.036]], [x, 0.615, z], WHITE, 10);
  for (const [x, z] of [[-0.5, 0.74], [-0.14, 0.76]] as const)
    turn([[0, 0], [0.16, 0], [0.18, 0.025], [0.15, 0.045], [0, 0.045]], [x, 0.44, z], CUSHION, 12);
  turn([[0, 0], [0.11, 0], [0.125, 0.05], [0.1, 0.09], [0, 0.09]], [0.05, 0.44, 0.4], STONE_DK, 10);
  glow(put(new THREE.SphereGeometry(0.075, 8, 5), EMBER, [0.05, 0.5, 0.4], [1, 0.35, 1]), 1.4);
  potted(0.2, 0.72);
  lantern(-0.2, 1.05, 0.46, root);
  rod([-0.2, 1.37, 0.46], [-0.2, 1.25, 0.46], 0.006, GOLD);

  // roof: a jade gable with upturned eaves, extruded along the ridge
  const ROOF_OUT: OutlinePoint[] = [
    [-0.2, 1.42], [0.0, 1.3], [0.22, 1.36], [0.45, 1.5], [0.68, 1.36], [0.9, 1.3], [1.1, 1.42],
    [1.1, 1.3], [0.9, 1.18], [0.68, 1.24], [0.45, 1.38], [0.22, 1.24], [0.0, 1.18], [-0.2, 1.3],
  ];
  b.extrude(ROOF_OUT, {
    at: [-0.2, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 1.5,
    bevel: 0.012,
    smoothing: 1,
    color: ROOF,
    bone: root,
  });
  tube([[-0.9, 1.53, 0.45], [-0.2, 1.54, 0.45], [0.5, 1.53, 0.45]], 0.024, GOLD);
  b.spike([-0.92, 1.52, 0.45], [-0.6, 1, 0], 0.26, 0.03, { color: GOLD, bone: root });
  b.spike([0.52, 1.52, 0.45], [0.6, 1, 0], 0.26, 0.03, { color: GOLD, bone: root });
  glow(put(new THREE.OctahedronGeometry(0.045), ORB, [-0.2, 1.6, 0.45], [1, 1.5, 1]), 1.2);
  tube([[-0.9, 1.31, 1.1], [-0.2, 1.3, 1.1], [0.5, 1.31, 1.1]], 0.012, GOLD);
  tube([[-0.9, 1.31, -0.2], [-0.2, 1.3, -0.2], [0.5, 1.31, -0.2]], 0.012, GOLD);

  // noren curtain on a hinge, hanging from the entrance beam
  const NOREN_OUT: OutlinePoint[] = [[-0.19, 0], [0.19, 0], [0.19, -0.3], [0, -0.34], [-0.19, -0.3]];
  b.extrude(NOREN_OUT, {
    at: [-0.2, 1.2, 0.84],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.002,
    color: NOREN,
    bone: noren,
  });
  rod([-0.4, 1.2, 0.84], [0, 1.2, 0.84], 0.008, WOOD_DK, noren);

  // hanging lanterns under the front eave, each on its own hinge
  const outer: [number, Joint][] = [[-0.7, lanternL], [0.3, lanternR]];
  for (const [x, j] of outer) {
    lantern(x, 0.98, 1.02, j);
    rod([x, 1.22, 1.02], [x, 1.18, 1.02], 0.006, GOLD, j);
  }

  // ------------------------------------------------------------ stone lantern
  const TORO_X = 0.72;
  const TORO_Z = 0.2;
  turn([[0, 0], [0.13, 0], [0.13, 0.03], [0.08, 0.08], [0.06, 0.14], [0, 0.14]], [TORO_X, 0.3, TORO_Z], STONE, 8);
  put(new THREE.CylinderGeometry(0.045, 0.055, 0.24, 8), STONE, [TORO_X, 0.56, TORO_Z]);
  put(new THREE.BoxGeometry(0.22, 0.04, 0.22), STONE_DK, [TORO_X, 0.72, TORO_Z]);
  glow(put(new THREE.BoxGeometry(0.13, 0.14, 0.13), LAMP, [TORO_X, 0.82, TORO_Z]), 1.2);
  turn([[0, 0], [0.2, 0], [0.16, 0.04], [0.12, 0.07], [0.05, 0.1], [0, 0.12]], [TORO_X, 0.87, TORO_Z], STONE_DK, 8);
  put(new THREE.SphereGeometry(0.02, 6, 4), GOLD, [TORO_X, 1.0, TORO_Z]);

  // ------------------------------------------------------------ garden
  pine(0.95, 0.72, 0.8);
  pine(-1.02, -0.3, 1.1);
  shrub(-0.94, 0.12, 0.12, 3);
  shrub(-1.0, 0.5, 0.11, 5);
  shrub(0.3, -0.62, 0.09, 7);

  // bamboo grove at the mountain's left foot
  const stalks: [number, number, number][] = [
    [-1.02, -0.62, 1.45], [-0.96, -0.7, 1.2], [-1.08, -0.76, 1.6], [-0.9, -0.6, 1.05], [-1.0, -0.82, 1.35],
  ];
  const gb = rng(61);
  const bambooLeaves = [];
  for (const [x, z, h] of stalks) {
    tube([[x, 0.3, z], [x + 0.02, 0.3 + h * 0.5, z + 0.01], [x + 0.04, 0.3 + h, z]], 0.02, BAMBOO);
    for (let k = 0; k < 3; k++)
      bambooLeaves.push(frame([x + 0.04, 0.3 + h - 0.12 * k, z], [gb() - 0.5, 1, gb() - 0.5]));
  }
  b.cards(bambooLeaves, LEAF, { size: 0.16, lean: 55, vary: 0.3, rng: gb, bone: root });

  // floating spirit light over the stream
  glow(put(new THREE.SphereGeometry(0.05, 8, 6), ORB, [-0.05, 1.1, -0.2]), 1.5);

  // grass tufts across the plinth, kept clear of the buildings, water and peak
  const gt = rng(51);
  const tufts: V[] = [];
  while (tufts.length < 160) {
    const x = (gt() * 2 - 1) * 1.2;
    const z = -1.3 + gt() * 2.5;
    if (Math.abs(x) > 1.15 || z > 1.1) continue;
    if (x > -0.85 && x < 0.45 && z > -0.02 && z < 0.95) continue;
    if (z > -0.3 && z < 0.02) continue;
    if (Math.hypot(x + 0.4, z + 0.88) < 0.52) continue;
    if (Math.hypot(x - 0.82, z + 0.9) < 0.24) continue;
    tufts.push([x, 0.3, z]);
  }
  b.cards(
    tufts.map((p) => frame(p, [0, 1, 0])),
    GRASS_BLADE,
    { size: [0.07, 0.1], lean: 0, vary: 0.35, spin: 90, rng: rng(52), bone: root },
  );

  return b.root;
}
