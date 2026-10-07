import * as THREE from "three";
import { catmull, createBuilder, frame, mottle, paint, rng, spots, svg } from "../../../../src/index";

export const meta = {
  name: "Japanese garden",
  description: "A square garden diorama: a red arched bridge over a koi pond, a stone lantern, a cloud-pruned pine, a cherry tree in bloom, raked gravel, mossy rocks and stepping stones.",
};

// Palette
const WOOD = "#5b3a24";
const BARK = "#4a3426";
const PINE = "#2e5b3a";
const PINE_LIGHT = "#55804f";
const RED = "#b5312b";
const STONE = "#9a968c";
const STONE_DARK = "#7b776e";
const FLAT_STONE = "#aaa69b";
const MOSS = "#5e8a45";
const ORANGE = "#e8641c";
const KOI_WHITE = "#f5f1e7";
const PUFF = "#f0bfcc";
const WATER = mottle("#1e5a6a", "#2d7d8e", { size: 0.25, seed: 2 });
const MOSSY_STONE = mottle("#8d8a84", "#5e8a45", { size: 0.1, seed: 4 });

// Raked gravel: concentric rings around the pond
const GRAVEL = paint((p, _n, _s) => {
  const d = Math.hypot(p.x * 0.8, p.z);
  return Math.sin(d * 60) > 0.55 ? "#e3ddd0" : "#f8f6f0";
});

// Blossom sprite for cards
const BLOSSOM = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <g fill="#f7b8c9" stroke="#e58aa4" stroke-width="0.8">
    <ellipse cx="16" cy="8" rx="5.5" ry="8"/>
    <ellipse cx="16" cy="8" rx="5.5" ry="8" transform="rotate(72 16 16)"/>
    <ellipse cx="16" cy="8" rx="5.5" ry="8" transform="rotate(144 16 16)"/>
    <ellipse cx="16" cy="8" rx="5.5" ry="8" transform="rotate(216 16 16)"/>
    <ellipse cx="16" cy="8" rx="5.5" ry="8" transform="rotate(288 16 16)"/>
  </g>
  <circle cx="16" cy="16" r="3" fill="#ffe27a"/>
</svg>`,
  { size: 128 },
);

const G = 0.17; // gravel top, the ground the garden stands on
const KOI_Y = 0.178; // just at the water surface

export default function build() {
  const b = createBuilder({ name: "japanese-garden" });
  const R = rng(7);

  // Single root joint; every piece is a part on it.
  b.joint("garden", { at: [0, 0, 0] });

  // ---- Base and gravel --------------------------------------------------
  b.part(new THREE.BoxGeometry(2.4, 0.15, 2.4), WOOD, { at: [0, 0.075, 0] });
  b.part(new THREE.BoxGeometry(2.2, 0.02, 2.2), GRAVEL, { at: [0, 0.16, 0] });

  // ---- Pond -------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.01, 32), WATER, {
    at: [0, 0.172, 0],
    scale: [1.15, 1, 0.9],
  });
  for (let i = 0; i < 16; i++) {
    const th = (i / 16) * Math.PI * 2;
    const rad = 0.05 + R() * 0.035;
    const x = 0.6 * Math.cos(th);
    const z = 0.47 * Math.sin(th);
    b.part(new THREE.SphereGeometry(rad, 7, 5), STONE, {
      at: [x, G + rad * 0.3, z],
      scale: [1, 0.6, 1],
    });
  }

  // ---- Red arched bridge ------------------------------------------------
  const deckY = (z: number) => 0.2 + 0.22 * (1 - (z / 0.75) ** 2);
  const deckZ = [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75];
  b.sweep(
    catmull(deckZ.map((z) => [0, deckY(z), z])),
    () => [0.2, 0.025],
    { section: "box", color: RED },
  );
  for (const x of [-0.19, 0.19]) {
    b.sweep(
      catmull(deckZ.map((z) => [x, deckY(z) + 0.14, z])),
      0.012,
      { color: RED },
    );
    for (const z of [-0.6, -0.3, 0, 0.3, 0.6]) {
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.14, 6), RED, {
        at: [x, deckY(z) + 0.07, z],
      });
    }
  }

  // ---- Koi ----------------------------------------------------------------
  const koi = (cx: number, cz: number, heading: number, seed: number) => {
    const f = [Math.sin(heading), 0, Math.cos(heading)];
    const s = [Math.cos(heading), 0, -Math.sin(heading)];
    const P = (u: number, v: number, lift = 0): [number, number, number] => [
      cx + f[0] * u + s[0] * v,
      KOI_Y + lift,
      cz + f[2] * u + s[2] * v,
    ];
    const body = [-0.12, -0.06, 0, 0.06, 0.12].map((u, i) => P(u, 0.01 * Math.sin(i * 1.4)));
    const fishR = (t: number) => 0.006 + 0.03 * Math.pow(Math.sin((Math.PI / 2) * t), 0.5);
    const koiColour = spots(KOI_WHITE, ORANGE, { size: 0.07, amount: 0.5, seed });
    b.sweep(catmull(body), (t: number) => [fishR(t), fishR(t) * 0.55], { color: koiColour });

    const fin: [number, number][] = [
      [0, 0],
      [-0.07, 0.05],
      [-0.1, 0.02],
      [-0.09, 0],
      [-0.1, -0.02],
      [-0.07, -0.05],
    ];
    b.extrude(fin, { at: P(-0.1, 0), x: f, y: s, thickness: 0.005, color: ORANGE });

    for (const side of [-1, 1]) {
      b.part(new THREE.SphereGeometry(0.006, 5, 4), "#141414", {
        at: P(0.1, side * 0.02, 0.004),
      });
    }
  };
  koi(-0.22, -0.12, 0.6, 1);
  koi(0.2, 0.12, 2.4, 2);
  koi(-0.02, 0.24, 4.0, 3);

  // ---- Stepping stones leading to the bridge ----------------------------
  for (const [x, z] of [
    [0.2, 1.06],
    [0.08, 0.96],
    [0.0, 0.87],
  ]) {
    b.part(new THREE.CylinderGeometry(0.075, 0.08, 0.03, 9), FLAT_STONE, {
      at: [x, G + 0.015, z],
      scale: [1, 1, 0.85],
    });
  }

  // ---- Stone lantern (toro) --------------------------------------------
  const lantern = (x: number, z: number) => {
    b.part(new THREE.BoxGeometry(0.32, 0.04, 0.32), STONE, { at: [x, G + 0.02, z] });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 6), STONE, { at: [x, 0.24, z] });
    b.part(new THREE.CylinderGeometry(0.035, 0.04, 0.22, 6), STONE, { at: [x, 0.38, z] });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 6), STONE, { at: [x, 0.51, z] });
    b.part(new THREE.BoxGeometry(0.2, 0.16, 0.2), STONE, { at: [x, 0.61, z] });
    const win = "#ffd27a";
    b.part(new THREE.BoxGeometry(0.12, 0.1, 0.012), win, { at: [x, 0.61, z + 0.106] });
    b.part(new THREE.BoxGeometry(0.12, 0.1, 0.012), win, { at: [x, 0.61, z - 0.106] });
    b.part(new THREE.BoxGeometry(0.012, 0.1, 0.12), win, { at: [x + 0.106, 0.61, z] });
    b.part(new THREE.BoxGeometry(0.012, 0.1, 0.12), win, { at: [x - 0.106, 0.61, z] });
    const roof = new THREE.ConeGeometry(0.2, 0.14, 4).rotateY(Math.PI / 4);
    b.part(roof, STONE_DARK, { at: [x, 0.76, z] });
    b.part(new THREE.ConeGeometry(0.03, 0.1, 6), STONE_DARK, { at: [x, 0.88, z] });
    b.part(new THREE.SphereGeometry(0.03, 7, 5), STONE_DARK, { at: [x, 0.94, z] });
  };
  lantern(-0.55, 0.62);

  // ---- Cloud-pruned pine ---------------------------------------------
  const pine = (px: number, pz: number) => {
    b.sweep(
      catmull([
        [px, G, pz],
        [px + 0.02, G + 0.4, pz],
        [px, G + 0.75, pz - 0.02],
      ]),
      [0.05, 0.018],
      { color: BARK },
    );
    for (let k = 0; k < 4; k++) {
      const y = G + 0.4 + k * 0.12;
      const side = k % 2 ? 1 : -1;
      b.rod([px, y, pz], [px + side * 0.22, y + 0.12, pz + (k < 2 ? 0.08 : -0.08)], 0.012, {
        color: BARK,
      });
    }
    const puffs: [number, number, number, number, string][] = [
      [0.55, 0.2, 0, 0, PINE],
      [0.7, 0.22, 0.12, 0.04, PINE],
      [0.7, 0.2, -0.13, -0.02, PINE_LIGHT],
      [0.86, 0.17, 0.02, 0.1, PINE],
      [0.8, 0.15, 0.0, -0.13, PINE_LIGHT],
      [0.95, 0.14, -0.05, -0.08, PINE],
      [1.08, 0.11, 0.0, 0.0, PINE_LIGHT],
    ];
    for (const [dy, r, dx, dz, col] of puffs) {
      b.part(new THREE.SphereGeometry(r, 9, 6), col, {
        at: [px + dx, G + dy, pz + dz],
        scale: [1, 0.62, 1],
      });
    }
  };
  pine(-0.7, -0.55);

  // ---- Cherry tree in full bloom ------------------------------------
  const cx = 0.7;
  const cz = -0.45;
  const cy = G + 1.5;
  b.sweep(
    catmull([
      [cx, G, cz],
      [cx + 0.03, G + 0.5, cz],
      [cx - 0.03, G + 1.0, cz + 0.02],
    ]),
    [0.07, 0.025],
    { color: BARK },
  );
  const tips: [number, number, number][] = [
    [0.38, 0.35, 0.12],
    [-0.32, 0.42, 0.2],
    [0.12, 0.5, -0.34],
    [-0.28, 0.3, -0.26],
    [0.22, 0.55, 0.28],
  ];
  for (const [dx, dy, dz] of tips) {
    b.sweep(
      catmull([
        [cx, G + 1.0, cz],
        [cx + dx * 0.5, G + 1.0 + dy * 0.5 + 0.05, cz + dz * 0.5],
        [cx + dx, G + 1.0 + dy, cz + dz],
      ]),
      [0.022, 0.006],
      { color: BARK },
    );
  }
  const puffsC: [number, number, number, number][] = [
    [0, 0, 0, 0.3],
    [0.2, 0.1, 0.1, 0.24],
    [-0.22, 0.05, -0.1, 0.25],
    [0, 0.2, -0.18, 0.22],
    [-0.05, -0.15, 0.2, 0.2],
  ];
  for (const [dx, dy, dz, r] of puffsC) {
    b.part(new THREE.SphereGeometry(r, 8, 6), PUFF, {
      at: [cx + dx, cy + dy, cz + dz],
      scale: [1, 0.8, 1],
    });
  }
  // Blossom cards filling the canopy, reading from every side
  const canopy: ReturnType<typeof frame>[] = [];
  while (canopy.length < 150) {
    const u = R() * 2 - 1;
    const v = R() * 2 - 1;
    const w = R() * 2 - 1;
    if (u * u + v * v + w * w > 1) continue;
    const p: [number, number, number] = [cx + u * 0.45, cy + v * 0.32, cz + w * 0.42];
    canopy.push(frame(p, [R() * 2 - 1, R() * 2 - 1 + 0.2, R() * 2 - 1]));
  }
  b.cards(canopy, BLOSSOM, { size: 0.11, lean: 15, cross: true, vary: 0.3, rng: rng(21) });

  // Petals drifting in the air around the tree
  const air: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 20; i++) {
    const p: [number, number, number] = [
      cx + (R() - 0.5) * 1.1,
      G + 0.4 + R() * 1.0,
      cz + (R() - 0.5) * 1.0,
    ];
    air.push(frame(p, [R() - 0.5, -1, R() - 0.5]));
  }
  b.cards(air, BLOSSOM, { size: 0.045, lean: 40, vary: 0.2, rng: rng(34) });

  // Petals lying on the gravel
  const ground: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 24; i++) {
    const p: [number, number, number] = [
      cx + (R() - 0.5) * 1.2,
      G + 0.005,
      cz + (R() - 0.5) * 1.2,
    ];
    ground.push(frame(p, [0, 1, 0]));
  }
  b.cards(ground, BLOSSOM, {
    size: 0.05,
    lean: 90,
    vary: 0.2,
    rng: rng(33),
    flow: (_f, i) => [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)],
  });

  // ---- Mossy rocks -------------------------------------------------------
  const rock = (x: number, z: number, rad: number, sy: number) => {
    const y = G + rad * sy * 0.25;
    b.part(new THREE.SphereGeometry(rad, 8, 6), MOSSY_STONE, {
      at: [x, y, z],
      scale: [1, sy, 0.85],
    });
    b.part(new THREE.SphereGeometry(rad * 0.7, 7, 4), MOSS, {
      at: [x, y + rad * sy * 0.75, z],
      scale: [1, 0.35, 1],
    });
  };
  rock(0.85, 0.45, 0.16, 0.6);
  rock(1.0, 0.2, 0.1, 0.55);
  rock(0.95, 0.62, 0.09, 0.6);
  rock(-0.9, -0.1, 0.2, 0.6);

  return b.root;
}
