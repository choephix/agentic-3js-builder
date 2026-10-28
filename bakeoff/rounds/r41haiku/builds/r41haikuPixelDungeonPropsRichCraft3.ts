import * as THREE from "three";
import { createBuilder, noise, paint, rng } from "../../../../src/index";
import { bayer, pick, pixelTexture, tileBox } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "dungeon-props",
  description: "Dungeon prop group: a banded treasure chest, two barrels, twin wall torches, a bone pile and a spike trap.",
};

// One pixel is 2.5 cm everywhere, so every pixel-art face on every prop shares one texel size.
const TEXEL = 0.025;

const hash = (x: number, y: number, s = 0) => {
  const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return v - Math.floor(v);
};

// Palettes (dark to light).
const WOOD = ["#1f1109", "#34200f", "#4d2f15", "#6b4220", "#8a5a2c"];
const WOOD_DARK = "#140a04";
const STONE = ["#15161d", "#22242e", "#31343f", "#43475a"];
const BONE = ["#7d725a", "#b8ad8e", "#e4d9bb", "#f5eed7"];
const IRON = "#3b3f4a";
const IRON_LIGHT = "#5d6373";
const STEEL = "#a7b0c0";
const GOLD = "#d4a83c";
const EMBER = { o: "#ff5a1f", y: "#ffc23a", w: "#fff4c0" };

// Pixel textures, built once and shared.
const PLANKS = pixelTexture(32, 32, (g) => {
  g.fill((x, y) => {
    if (y % 8 === 0) return "#0b0604";
    const v = 0.3 + 0.55 * hash(x, Math.floor(y / 8)) + (hash(x, y, 3) - 0.5) * 0.25;
    return pick(WOOD, v, bayer(x, y));
  });
});

const STONE_TILE = pixelTexture(40, 40, (g) => {
  g.fill((x, y) => {
    if (x === 0 || y === 0) return "#0c0d12";
    const blot = hash(Math.floor(x / 4), Math.floor(y / 4), 9);
    if (blot > 0.93 && hash(x, y, 2) > 0.45) return "#6a1414";
    return pick(STONE, hash(x, y) * 0.9, bayer(x, y));
  });
});

const SKULL_TILE = pixelTexture(8, 8, (g) => {
  g.fill((x, y) => pick(BONE, 0.45 + 0.5 * hash(x, y, 4), bayer(x, y)));
});

// Flame card: six columns, eight rows, bottom row last.
const FLAME = [
  "..o...",
  ".oyo..",
  ".oyyo.",
  "oyywyo",
  "oywwyo",
  "oywwyo",
  ".oyyo.",
  "..oo..",
];

// Barrel staves: vertical seams every 30° of the lathe angle, lightly mottled.
const BARREL_WOOD = paint((p, _n, s) => {
  const seam = Math.abs((s[1] / 30) % 1 - 0.5) > 0.47;
  if (seam) return WOOD_DARK;
  return pick(WOOD, 0.25 + 0.6 * noise(p, 0.18, 3));
});

export default function build() {
  const b = createBuilder({ name: "dungeon-props" });
  const rand = rng(7);

  // -------------------------------------------------------------------------------------------
  // Treasure chest, back left: a planked box with a lid, iron bands, a gold lock.
  const CX = -0.85;
  const CZ = -0.12;
  const at = (x: number, y: number, z: number): [number, number, number] => [CX + x, y, CZ + z];

  b.part(tileBox([0.56, 0.3, 0.34], PLANKS, TEXEL, { step: [1, 8] }), "#ffffff", {
    at: at(0, 0.15, 0),
    texture: PLANKS,
  });
  b.part(tileBox([0.58, 0.11, 0.36], PLANKS, TEXEL, { rand, step: [1, 8] }), "#ffffff", {
    at: at(0, 0.355, 0),
    texture: PLANKS,
  });
  // Lid ridge catches the light.
  b.part(new THREE.BoxGeometry(0.6, 0.03, 0.38), IRON_LIGHT, { at: at(0, 0.42, 0), flat: true });
  for (const x of [-0.19, 0.19]) {
    b.part(new THREE.BoxGeometry(0.06, 0.32, 0.37), IRON, { at: at(x, 0.2, 0) });
  }
  b.part(new THREE.BoxGeometry(0.1, 0.11, 0.03), GOLD, { at: at(0, 0.27, 0.18) });
  b.part(new THREE.BoxGeometry(0.03, 0.05, 0.02), IRON, { at: at(0, 0.27, 0.2) });
  // Loose coins spilling from under the lid.
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 8), GOLD, {
      at: at(0.26 + rand() * 0.12, 0.004, 0.2 + rand() * 0.14),
      flat: true,
    });
  }

  // -------------------------------------------------------------------------------------------
  // Two barrels, right side, turned on a lathe with iron hoops.
  const barrelOutline: [number, number][] = [
    [0, 0],
    [0.16, 0],
    [0.18, 0.03],
    [0.2, 0.2],
    [0.21, 0.38],
    [0.2, 0.56],
    [0.18, 0.7],
    [0.16, 0.74],
    [0, 0.74],
  ];
  const barrel = (x: number, z: number) => {
    b.lathe(barrelOutline, { at: [x, 0, z], segments: 10, color: BARREL_WOOD });
    for (const [y, r] of [
      [0.1, 0.19],
      [0.4, 0.21],
      [0.66, 0.185],
    ] as const) {
      b.part(new THREE.TorusGeometry(r + 0.004, 0.012, 6, 16), IRON, {
        at: [x, y, z],
        rotation: [90, 0, 0],
      });
    }
  };
  barrel(0.82, -0.18);
  barrel(0.52, -0.5);

  // -------------------------------------------------------------------------------------------
  // Twin wall torches, back centre: a stone footing, a timber pole, an iron bowl, a glowing flame.
  const torch = (x: number, z: number) => {
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.1, 8), STONE[2], { at: [x, 0.05, z] });
    b.part(new THREE.CylinderGeometry(0.025, 0.035, 1.0, 6), "#4a2c12", { at: [x, 0.6, z] });
    b.lathe(
      [
        [0, 0],
        [0.09, 0],
        [0.13, 0.1],
        [0.12, 0.16],
        [0.1, 0.18],
        [0, 0.18],
      ],
      { at: [x, 0.98, z], segments: 8, color: IRON },
    );
    const flame = pixelTexture(6, 8, (g) => g.stamp(0, 0, FLAME, EMBER));
    for (const dir of [[0, 0, 1], [1, 0, 0]] as const) {
      glow(
        b.part(new THREE.PlaneGeometry(0.15, 0.2), "#ffffff", {
          at: [x, 1.2, z],
          dir: [...dir],
          axis: "z",
          texture: flame,
        }),
        1.4,
      );
    }
  };
  torch(-0.4, -0.7);
  torch(0.4, -0.7);

  // -------------------------------------------------------------------------------------------
  // Bone pile in front of the trap: skulls, long bones with knobbed ends, a rib.
  const bone = (x: number, z: number, len: number, angleDeg: number) => {
    const a = (angleDeg * Math.PI) / 180;
    b.part(new THREE.CylinderGeometry(0.018, 0.018, len, 6), BONE[2], {
      at: [x, 0.02, z],
      rotation: [0, angleDeg, 90],
      flat: true,
    });
    const dx = Math.cos(a) * len * 0.5;
    const dz = -Math.sin(a) * len * 0.5;
    for (const s of [-1, 1]) {
      b.part(new THREE.SphereGeometry(0.03, 6, 4), BONE[3], {
        at: [x + s * dx, 0.03, z + s * dz],
      });
    }
  };
  const skull = (x: number, z: number, yaw: number) => {
    b.part(new THREE.SphereGeometry(0.075, 7, 5), "#ffffff", {
      at: [x, 0.07, z],
      texture: SKULL_TILE,
      flat: true,
    });
    for (const s of [-1, 1]) {
      b.part(new THREE.SphereGeometry(0.022, 5, 4), "#14110d", {
        at: [x + s * 0.032, 0.08, z + 0.06],
      });
    }
    b.part(new THREE.BoxGeometry(0.07, 0.04, 0.06), BONE[2], { at: [x, 0.02, z - 0.01] });
    void yaw;
  };
  skull(-0.3, 0.98, 0.4);
  bone(-0.12, 0.92, 0.26, 25);
  bone(-0.02, 1.02, 0.24, -35);
  bone(-0.36, 1.12, 0.22, 70);
  skull(0.22, 1.05, -0.5);
  bone(0.32, 0.9, 0.25, 10);
  bone(0.12, 1.2, 0.2, -60);
  b.part(new THREE.TorusGeometry(0.07, 0.012, 4, 10, Math.PI), BONE[2], {
    at: [0.5, 0.02, 0.9],
    rotation: [90, 0, 90],
  });

  // -------------------------------------------------------------------------------------------
  // Spike trap, centre front: a stone plate, an iron frame and a 5 × 5 grid of steel spikes.
  const TRAP_Z = 0.2;
  b.part(tileBox([0.84, 0.03, 0.84], STONE_TILE, TEXEL, { rand }), "#ffffff", {
    at: [0, 0.015, TRAP_Z],
    texture: STONE_TILE,
  });
  for (const [x, z, sx, sz] of [
    [0, 0.62, 0.9, 0.04],
    [0, -0.22, 0.9, 0.04],
    [0.43, 0.2, 0.04, 0.84],
    [-0.43, 0.2, 0.04, 0.84],
  ] as const) {
    b.part(new THREE.BoxGeometry(sx, 0.04, sz), IRON_LIGHT, { at: [x, 0.02, TRAP_Z + z], flat: true });
  }
  for (const i of [-2, -1, 0, 1, 2]) {
    for (const j of [-2, -1, 0, 1, 2]) {
      const x = i * 0.16;
      const z = TRAP_Z + j * 0.16;
      b.part(new THREE.ConeGeometry(0.03, 0.16, 5), STEEL, { at: [x, 0.11, z], flat: true });
    }
  }

  return b.root;
}
