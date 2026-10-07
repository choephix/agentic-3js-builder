import * as THREE from "three";
import { createBuilder, catmull, frame, grain, patches, rng, spots, svg } from "../../../../src/index";

export const meta = {
  name: "Japanese garden diorama",
  description:
    "A square garden base: a red arched bridge over a koi pond with three koi, a stone lantern, a cloud-pruned pine, a cherry tree shedding petals, raked gravel, mossy rocks and stepping stones.",
};

const WOOD = "#4a3a2c";
const GRAVEL = "#f1efe8";
const GRAVEL_DARK = "#d4d0c2";
const WATER = "#1d5b63";
const BRIDGE = "#b8322a";
const BRIDGE_DARK = "#7e1f1d";
const KOI_ORANGE = "#f2661c";
const KOI_WHITE = "#f7f4ee";
const STONE = "#8b8f8a";
const STONE_LIGHT = "#b9bcb5";
const MOSS = "#5d8a3c";
const PINE = "#2f6e3c";
const PINE_DARK = "#20502c";
const TRUNK = "#5b4330";
const CHERRY_BARK = "#4a3530";
const PINK = "#f4b3c4";
const PINK_LIGHT = "#fbd6e0";
const PINK_DEEP = "#e7869f";
const LANTERN_LIGHT = "#f0dca4";

// Pond outline in the ground plane: [x, z] in metres.
const POND: [number, number][] = [
  [-0.42, -0.05],
  [-0.3, -0.3],
  [0, -0.36],
  [0.3, -0.28],
  [0.44, 0.0],
  [0.36, 0.28],
  [0, 0.34],
  [-0.34, 0.22],
];

// Tail fin of a koi, drawn in (along the body, sideways).
const TAIL: [number, number][] = [
  [-0.02, 0],
  [0.03, 0.05],
  [0.075, 0.015],
  [0.05, 0],
  [0.075, -0.015],
  [0.03, -0.05],
];

// Petal drawing, used as a card texture.
const petal = svg(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 1C12 3 14 8 8 15C2 8 4 3 8 1Z" fill="#ffc7d8"/><path d="M8 3V13" stroke="#e98fab" stroke-width="0.6"/></svg>',
  { size: 64 },
);

export default function build() {
  const b = createBuilder({ name: "japanese-garden" });
  const ground = b.joint("ground", { at: [0, 0, 0] });
  const pr = rng(12);

  // Paints and shared materials.
  const gravelPaint = grain(GRAVEL, GRAVEL_DARK, { size: 0.035, axis: "x" });
  const bridgePaint = grain(BRIDGE, BRIDGE_DARK, { size: 0.03, axis: "x" });
  const koiPaint = spots(KOI_WHITE, KOI_ORANGE, { size: 0.07, amount: 0.5, seed: 4 });
  const mossyStone = patches(STONE, MOSS, { size: 0.07, seed: 3 });

  // ---- Base and gravel -------------------------------------------------
  b.part(new THREE.BoxGeometry(1.8, 0.1, 1.8), WOOD, { at: [0, 0.05, 0], bone: ground });
  b.part(new THREE.BoxGeometry(1.72, 0.01, 1.72), gravelPaint, { at: [0, 0.105, 0], bone: ground });

  // ---- Pond ------------------------------------------------------------
  b.extrude(POND, {
    at: [0, 0.12, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.02,
    bevel: 0.004,
    smoothing: 2,
    color: WATER,
  });
  // Rim stones on alternate pond corners.
  POND.filter((_, i) => i % 2 === 0).forEach(([px, pz]) => {
    b.part(new THREE.DodecahedronGeometry(0.05, 0), STONE_LIGHT, {
      at: [px * 1.06, 0.12, pz * 1.06],
      scale: [1, 0.6, 1],
      flat: true,
    });
  });

  // ---- Koi -------------------------------------------------------------
  const body = (t: number) => Math.max(0.004, 0.045 * (1 - Math.pow(Math.abs(t - 0.25) / 0.75, 2.2)));
  const koi = (pts: [number, number, number][]) => {
    const curve = catmull(pts);
    b.sweep(curve, (t: number): [number, number] => [body(t), body(t) * 0.45], { color: koiPaint });
    const tg = curve.tangentAt(1);
    const L = Math.hypot(tg.x, tg.z);
    const h = [tg.x / L, 0, tg.z / L];
    b.extrude(TAIL, {
      at: curve.at(1),
      x: h,
      y: [h[2], 0, -h[0]],
      thickness: 0.008,
      bevel: 0.002,
      smoothing: 1,
      color: koiPaint,
    });
  };
  koi([
    [-0.3, 0.14, -0.12],
    [-0.15, 0.14, -0.1],
    [0, 0.14, -0.14],
    [0.1, 0.14, -0.2],
  ]);
  koi([
    [0.05, 0.14, 0.12],
    [0.16, 0.14, 0.14],
    [0.26, 0.14, 0.08],
    [0.34, 0.14, 0.0],
  ]);
  koi([
    [-0.28, 0.14, 0.16],
    [-0.16, 0.14, 0.2],
    [-0.04, 0.14, 0.18],
  ]);

  // ---- Arched red bridge ----------------------------------------------
  const deckPts: [number, number, number][] = [
    [-0.72, 0.12, 0],
    [-0.4, 0.23, 0],
    [0, 0.34, 0],
    [0.4, 0.23, 0],
    [0.72, 0.12, 0],
  ];
  const deck = catmull(deckPts);
  b.sweep(deck, (): [number, number] => [0.1, 0.022], { section: "box", color: bridgePaint });

  // Handrails on both sides, with posts standing on the deck.
  const rail = (z: number): [number, number, number][] => deckPts.map(([x, y]) => [x, y + 0.13, z]);
  b.sweep(catmull(rail(-0.095)), 0.009, { color: BRIDGE });
  b.sweep(catmull(rail(0.095)), 0.009, { color: BRIDGE });
  for (const t of [0.12, 0.3, 0.5, 0.7, 0.88]) {
    const p = deck.at(t);
    for (const z of [-0.095, 0.095]) {
      b.part(new THREE.BoxGeometry(0.03, 0.14, 0.03), BRIDGE, { at: [p.x, p.y + 0.07, z] });
    }
  }

  // ---- Stone lantern (tōrō) -------------------------------------------
  const lantern = (x: number, z: number) => {
    const y = 0.11;
    const base: [number, number][] = [
      [0, 0],
      [0.11, 0],
      [0.11, 0.025],
      [0.065, 0.05],
      [0.065, 0.07],
      [0, 0.07],
    ];
    b.lathe(base, { at: [x, y, z], segments: 8, color: STONE });
    const shaft: [number, number][] = [
      [0, 0],
      [0.05, 0],
      [0.034, 0.05],
      [0.045, 0.1],
      [0, 0.1],
    ];
    b.lathe(shaft, { at: [x, y + 0.07, z], segments: 8, color: STONE });
    b.part(new THREE.BoxGeometry(0.14, 0.12, 0.14), STONE_LIGHT, { at: [x, y + 0.23, z] });
    b.part(new THREE.BoxGeometry(0.08, 0.08, 0.03), LANTERN_LIGHT, { at: [x, y + 0.23, z + 0.07] });
    const roof: [number, number][] = [
      [0, 0],
      [0.17, 0],
      [0.12, 0.04],
      [0.05, 0.07],
      [0, 0.09],
    ];
    b.lathe(roof, { at: [x, y + 0.29, z], segments: 4, spin: 45, color: STONE });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), STONE, { at: [x, y + 0.39, z], flat: true });
  };
  lantern(-0.62, -0.22);

  // ---- Cloud-pruned pine -----------------------------------------------
  const pine = (x: number, z: number) => {
    b.sweep(
      catmull([
        [x, 0.11, z],
        [x + 0.02, 0.38, z + 0.02],
        [x - 0.02, 0.62, z],
        [x + 0.01, 0.88, z],
      ]),
      [0.035, 0.012],
      { color: TRUNK },
    );
    const pads: [number, number, number, number][] = [
      [0, 0.4, 0, 0.22],
      [-0.2, 0.48, 0.05, 0.14],
      [0.2, 0.52, -0.05, 0.15],
      [0.02, 0.62, 0, 0.17],
      [-0.14, 0.74, 0.02, 0.12],
      [0.12, 0.78, -0.02, 0.12],
      [0, 0.9, 0, 0.1],
    ];
    pads.forEach(([dx, y, dz, r], i) => {
      b.rod([x, y - 0.05, z], [x + dx, y, z + dz], 0.012, { color: TRUNK });
      b.part(new THREE.SphereGeometry(r, 8, 5), i % 2 ? PINE : PINE_DARK, {
        at: [x + dx, y, z + dz],
        scale: [1, 0.42, 1],
        flat: true,
      });
    });
  };
  pine(0.62, -0.55);

  // ---- Cherry tree in full blossom --------------------------------------
  const cherry = (x: number, z: number) => {
    b.sweep(
      catmull([
        [x, 0.11, z],
        [x + 0.03, 0.4, z - 0.02],
        [x - 0.02, 0.62, z + 0.01],
      ]),
      [0.04, 0.015],
      { color: CHERRY_BARK },
    );
    const puffs: { p: [number, number, number]; r: number; c: string }[] = [
      { p: [0, 0.7, 0], r: 0.2, c: PINK },
      { p: [-0.2, 0.6, 0.1], r: 0.14, c: PINK_LIGHT },
      { p: [0.2, 0.62, -0.1], r: 0.15, c: PINK_DEEP },
      { p: [0.05, 0.88, 0.02], r: 0.16, c: PINK_LIGHT },
      { p: [-0.12, 0.82, -0.12], r: 0.12, c: PINK },
      { p: [0.2, 0.8, 0.1], r: 0.12, c: PINK_DEEP },
    ];
    const parts = puffs.map(({ p, r, c }) => {
      b.rod([x - 0.02, 0.62, z + 0.01], [x + p[0], p[1], z + p[2]], 0.01, { color: CHERRY_BARK });
      return b.part(new THREE.IcosahedronGeometry(r, 1), c, { at: [x + p[0], p[1], z + p[2]], flat: true });
    });
    // Petals clinging to the blossom.
    const clinging = b.surface(parts).scatter(70, { rng: rng(31), minDist: 0.035 });
    b.cards(clinging, petal, { size: 0.045, lean: 35, vary: 0.3, rng: rng(32) });
    // Petals drifting down through the air.
    const falling = Array.from({ length: 36 }, () =>
      frame([x + (pr() - 0.5) * 0.9, 0.2 + pr() * 0.8, z + (pr() - 0.5) * 0.9], [0, 1, 0]),
    );
    b.cards(falling, petal, { size: 0.035, lean: 60, flow: [1, -0.8, 0.5], vary: 0.25, rng: rng(40) });
    // Petals settled on the raked gravel.
    const settled = Array.from({ length: 22 }, () =>
      frame([x + (pr() - 0.5) * 0.7, 0.112, z + (pr() - 0.5) * 0.7], [0, 1, 0]),
    );
    b.cards(settled, petal, { size: 0.03, lean: 90, flow: [1, 0, 0.3], vary: 0.2, rng: rng(41) });
  };
  cherry(0.5, 0.5);

  // ---- Stepping stones leading to the bridge ----------------------------
  const steps: [number, number][] = [
    [-0.22, 0.72],
    [-0.365, 0.585],
    [-0.51, 0.45],
    [-0.655, 0.315],
    [-0.8, 0.18],
  ];
  for (const [x, z] of steps) {
    b.part(new THREE.CylinderGeometry(0.09, 0.1, 0.04, 7), STONE_LIGHT, {
      at: [x, 0.13, z],
      flat: true,
    });
  }

  // ---- Mossy rocks -----------------------------------------------------
  const rocks: [number, number, number][] = [
    [-0.3, -0.66, 0.12],
    [0.12, -0.72, 0.1],
    [0.78, 0.12, 0.12],
    [0.02, 0.62, 0.09],
  ];
  for (const [x, z, r] of rocks) {
    b.part(new THREE.DodecahedronGeometry(r, 0), mossyStone, {
      at: [x, 0.11 + r * 0.6, z],
      scale: [1, 0.75, 1.15],
      flat: true,
    });
  }

  return b.root;
}
