import * as THREE from "three";
import { arc, catmull, createBuilder, grain, mottle, patches, rng } from "../../../../src/index";

export const meta = {
  name: "Japanese garden diorama",
  description:
    "A square garden base: a red arched bridge over a koi pond with three koi, a stone lantern, a cloud-pruned pine, a cherry tree shedding petals, raked gravel, mossy rocks and stepping stones.",
};

// Paints. Every size is in meters.
const WOOD = grain("#7a5232", "#4d3220", { size: 0.02, axis: "x" });
const GRAVEL = grain("#f4f2ec", "#d6d0c2", { size: 0.03, axis: "x" });
const BRIDGE = grain("#b8402f", "#8a2a20", { size: 0.012, axis: "x" });
const BARK = grain("#6b4a33", "#452e21", { size: 0.012, axis: "y" });
const PINE = mottle("#2d5b3a", "#4f7f4c", { size: 0.05, seed: 2 });
const BLOSSOM = mottle("#f8c6d4", "#eb93b1", { size: 0.02, seed: 4 });
const BLOSSOM_DEEP = mottle("#f0a7bf", "#d9739a", { size: 0.02, seed: 9 });
const STONE = mottle("#a8a49a", "#7d7a72", { size: 0.05, seed: 6 });
const ROCK = mottle("#8b8d86", "#5f615b", { size: 0.03, seed: 3 });
const MOSS = mottle("#6f9b43", "#3e6a2c", { size: 0.02, seed: 5 });
const KOI_A = patches("#ef7a24", "#f7f4ec", { size: 0.035, gap: 0.12, seed: 1 });
const KOI_B = patches("#f7f4ec", "#e8621c", { size: 0.03, gap: 0.1, seed: 12 });
const KOI_C = patches("#f07a22", "#fbf8f0", { size: 0.04, gap: 0.14, seed: 21 });

const WATER = "#2c6b7a";
const PETAL = "#fbd3df";
const LAMP_FRAME = "#5d5b56";
const LAMP_LIGHT = "#ffd98a";
const RAIL = "#6e2219";

/** Bridge arch: circle through (±0.42, 0.07) with its top at y = 0.2. */
const CY = -0.5435;
const R = 0.2 - CY;

export default function build() {
  const b = createBuilder({ name: "japanese-garden", detail: 1, paintSize: 2048 });
  const random = rng(7);
  b.joint("base", { at: [0, 0, 0] });

  // ---- Base and gravel --------------------------------------------------------------------------------
  b.part(new THREE.BoxGeometry(1, 0.05, 1), WOOD, { at: [0, 0.025, 0] });

  // Raked gravel around a rectangular pond (its walls are these four pieces).
  const gravel = (x: number, z: number, sx: number, sz: number) =>
    b.part(new THREE.BoxGeometry(sx, 0.02, sz), GRAVEL, { at: [x, 0.06, z] });
  gravel(0, -0.36, 1, 0.28);
  gravel(0, 0.36, 1, 0.28);
  gravel(-0.39, 0, 0.22, 0.44);
  gravel(0.39, 0, 0.22, 0.44);

  // Pond water, sitting just below the gravel rim.
  b.part(new THREE.BoxGeometry(0.56, 0.01, 0.44), WATER, { at: [0, 0.05, 0] });

  // ---- Red arched bridge -------------------------------------------------------------------------------
  const deck = arc([0, CY, 0], [-0.42, 0.07, 0], [0, 0, -1], 68.8);
  b.sweep(deck, () => [0.07, 0.012], { color: BRIDGE, section: "box", caps: "flat", name: "bridge deck" });

  // Handrails on both sides, with posts down to the deck.
  const R2 = R + 0.09;
  const yRail = CY + Math.sqrt(R2 * R2 - 0.16);
  const railSpan = ((2 * Math.asin(0.4 / R2)) * 180) / Math.PI;
  for (const z of [-0.06, 0.06]) {
    b.sweep(arc([0, CY, z], [-0.4, yRail, z], [0, 0, -1], railSpan), 0.007, { color: RAIL, name: "bridge rail" });
    for (const x of [-0.36, -0.18, 0, 0.18, 0.36])
      b.rod(
        [x, CY + Math.sqrt(R * R - x * x), z],
        [x, CY + Math.sqrt(R2 * R2 - x * x), z],
        0.006,
        { color: RAIL, name: "bridge post" },
      );
  }

  // ---- Stepping stones leading to the bridge's left end -----------------------------------------------
  for (const [x, z] of [
    [-0.42, 0.42],
    [-0.4, 0.31],
    [-0.42, 0.2],
    [-0.41, 0.09],
  ])
    b.part(new THREE.CylinderGeometry(0.045, 0.052, 0.014, 7), STONE, {
      at: [x, 0.077, z],
      rotation: [0, (random() - 0.5) * 40, 0],
    });

  // ---- Koi on the water ----------------------------------------------------------------------------------
  const Y = 0.052;
  const koi = (pts: number[][], color: typeof KOI_A, name: string) => {
    const path = catmull(pts.map(([x, , z]) => [x, Y, z]));
    const w = (t: number) => 0.018 * Math.sin(Math.PI * (0.08 + 0.84 * t)) ** 0.7 + 0.002;
    b.sweep(path, (t) => [w(t), w(t) * 0.55], { color, name });
    // Forked tail fin, flat on the surface, off the last two points.
    const last = pts[pts.length - 1];
    const prev = pts[pts.length - 2];
    const e = new THREE.Vector3(last[0], Y, last[2]);
    const d = new THREE.Vector3(last[0] - prev[0], 0, last[2] - prev[2]).normalize();
    const perp = new THREE.Vector3(-d.z, 0, d.x);
    const tip = e.clone().addScaledVector(d, 0.03);
    b.slab(
      [
        e.clone().addScaledVector(d, -0.01),
        tip.clone().addScaledVector(perp, 0.035),
        tip.clone().addScaledVector(perp, -0.035),
      ],
      { color, thickness: 0.004, name: name + " tail" },
    );
  };
  koi(
    [
      [-0.22, 0, -0.12],
      [-0.14, 0, -0.1],
      [-0.07, 0, -0.12],
      [-0.02, 0, -0.16],
    ],
    KOI_A,
    "koi1",
  );
  koi(
    [
      [0.2, 0, 0.02],
      [0.12, 0, 0.0],
      [0.06, 0, 0.04],
      [0.03, 0, 0.1],
    ],
    KOI_B,
    "koi2",
  );
  koi(
    [
      [-0.2, 0, 0.08],
      [-0.12, 0, 0.12],
      [-0.06, 0, 0.16],
      [0.0, 0, 0.2],
    ],
    KOI_C,
    "koi3",
  );

  // ---- Stone lantern (back right) -------------------------------------------------------------------------
  const LX = 0.36;
  const LZ = -0.37;
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.07, 0.02],
      [0.045, 0.035],
      [0.03, 0.04],
      [0, 0.04],
    ],
    { color: STONE, at: [LX, 0.07, LZ], name: "lantern plinth" },
  );
  b.lathe(
    [
      [0, 0],
      [0.035, 0],
      [0.024, 0.03],
      [0.02, 0.1],
      [0.032, 0.12],
      [0, 0.12],
    ],
    { color: STONE, at: [LX, 0.11, LZ], name: "lantern shaft" },
  );
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.06, 0.01],
      [0, 0.01],
    ],
    { color: STONE, at: [LX, 0.23, LZ], name: "lantern floor" },
  );
  b.part(new THREE.BoxGeometry(0.05, 0.06, 0.05), LAMP_LIGHT, { at: [LX, 0.26, LZ], name: "lantern light" });
  for (const [dx, dz] of [
    [-0.035, -0.035],
    [0.035, -0.035],
    [-0.035, 0.035],
    [0.035, 0.035],
  ])
    b.rod([LX + dx, 0.24, LZ + dz], [LX + dx, 0.31, LZ + dz], 0.005, { color: LAMP_FRAME, name: "lantern post" });
  b.lathe(
    [
      [0, 0],
      [0.085, 0.012],
      [0.075, 0.022],
      [0.035, 0.04],
      [0.015, 0.055],
      [0, 0.06],
    ],
    { color: STONE, at: [LX, 0.31, LZ], name: "lantern roof" },
  );
  b.lathe(
    [
      [0, 0],
      [0.012, 0],
      [0.006, 0.03],
      [0, 0.04],
    ],
    { color: STONE, at: [LX, 0.37, LZ], name: "lantern finial" },
  );

  // ---- Cloud-pruned pine (back left) ----------------------------------------------------------------------
  const PX = -0.36;
  const PZ = -0.37;
  b.sweep(
    catmull([
      [PX, 0.07, PZ],
      [PX + 0.01, 0.17, PZ],
      [PX + 0.02, 0.27, PZ],
    ]),
    (t) => 0.014 - 0.006 * t,
    { color: BARK, name: "pine trunk" },
  );
  const puff = (x: number, y: number, z: number, r: number, color: typeof PINE) =>
    b.part(new THREE.SphereGeometry(r, b.segments(9), b.segments(6)), color, {
      at: [x, y, z],
      scale: [1, 0.65, 1],
    });
  // Cloud pads, widest low down, each a centre puff with a ring of smaller puffs.
  for (const [y, r] of [
    [0.19, 0.12],
    [0.26, 0.095],
    [0.32, 0.07],
    [0.36, 0.045],
  ] as const) {
    puff(PX, y, PZ, r, PINE);
    for (let k = 0; k < 5; k++) {
      const a = ((k / 5) * Math.PI * 2) + y * 10;
      puff(PX + Math.cos(a) * r * 0.6, y - 0.01, PZ + Math.sin(a) * r * 0.6, r * 0.7, PINE);
    }
  }

  // ---- Cherry tree in full blossom (front right) -----------------------------------------------------------
  const CX = 0.36;
  const CZ = 0.36;
  b.sweep(
    catmull([
      [CX, 0.07, CZ],
      [CX + 0.01, 0.16, CZ - 0.01],
      [CX - 0.02, 0.24, CZ - 0.02],
    ]),
    (t) => 0.022 - 0.008 * t,
    { color: BARK, name: "cherry trunk" },
  );
  b.rod([CX - 0.01, 0.2, CZ - 0.01], [CX - 0.1, 0.31, CZ - 0.03], [0.012, 0.005], { color: BARK, name: "cherry branch" });
  b.rod([CX - 0.01, 0.22, CZ - 0.02], [CX + 0.09, 0.32, CZ + 0.0], [0.012, 0.005], { color: BARK, name: "cherry branch" });

  const canopy: [number, number, number] = [CX - 0.01, 0.34, CZ - 0.01];
  for (let i = 0; i < 14; i++) {
    const a = random() * Math.PI * 2;
    const d = random() * 0.14;
    const r = 0.04 + random() * 0.03;
    const color = random() < 0.5 ? BLOSSOM : BLOSSOM_DEEP;
    b.part(new THREE.SphereGeometry(r, b.segments(8), b.segments(6)), color, {
      at: [canopy[0] + Math.cos(a) * d, canopy[1] + (random() - 0.4) * 0.14, canopy[2] + Math.sin(a) * d],
    });
  }
  // Petals drifting down through the air.
  for (let i = 0; i < 20; i++) {
    const x = Math.min(0.46, Math.max(-0.46, canopy[0] + (random() - 0.5) * 0.4));
    const y = 0.12 + random() * 0.3;
    const z = Math.min(0.46, Math.max(-0.46, canopy[2] + (random() - 0.5) * 0.4));
    b.part(new THREE.BoxGeometry(0.014, 0.0012, 0.009), PETAL, {
      at: [x, y, z],
      rotation: [random() * 180, random() * 180, random() * 180],
    });
  }

  // ---- Mossy rocks ----------------------------------------------------------------------------------------
  const rock = (x: number, z: number, s: number) => {
    b.part(new THREE.IcosahedronGeometry(0.05 * s, 0), ROCK, {
      at: [x, 0.085, z],
      scale: [1.2, 0.8, 1.0],
      rotation: [0, random() * 180, 0],
      flat: true,
    });
    b.part(new THREE.IcosahedronGeometry(0.035 * s, 0), MOSS, {
      at: [x, 0.118, z],
      scale: [1.2, 0.45, 1.0],
      flat: true,
    });
  };
  rock(-0.14, 0.36, 1.0);
  rock(0.12, 0.42, 0.7);
  rock(0.1, -0.36, 0.8);
  rock(-0.12, -0.36, 0.6);

  return b.root;
}
