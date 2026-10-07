import * as THREE from "three";
import { createBuilder, paint } from "../../../../src/index";

export const meta = {
  name: "Japanese garden",
  description: "A stylised Japanese stroll garden: a raked gravel bed with a rock island, a lily pond, a stone lantern, a clipped pine, a red maple, a bamboo grove, shrubs, stepping stones and a small wooden pavilion beside a white wall.",
};

type V = [number, number, number];

// Palette
const GROUND = "#6f8a4e";
const MOSS = "#8aa35c";
const MOSS_DARK = "#4f6b3a";
const STONE = "#9a978f";
const STONE_DARK = "#5d5b57";
const WATER = "#2f5d6e";
const WOOD = "#9a6a46";
const WOOD_DARK = "#5a3a28";
const WALL = "#efe9dc";
const ROOF = "#2e3440";
const PINE = "#2f5c45";
const PINE_LIGHT = "#44805d";
const TRUNK = "#6b4a33";
const BAMBOO = "#9bb34f";
const BAMBOO_DARK = "#6e8a34";
const LANTERN = "#f3d98b";
const MAPLE = "#c8473a";
const AZALEA = "#f0a6bd";

export default function build() {
  const b = createBuilder({ name: "japanese-garden" });

  // One root joint: everything here is scenery, so it rides the root.
  b.joint("garden", { at: [0, 0, 0] });

  // Helper: a flat-shaded primitive at a model-space position.
  const put = (
    geo: THREE.BufferGeometry,
    color: string,
    at: V,
    extra: { rotation?: V; scale?: V } = {},
  ) => b.part(geo, color, { at, flat: true, ...extra });

  // ---- Ground slab (top at y = 0.12, bottom touches the floor) ----
  put(new THREE.BoxGeometry(10, 0.12, 8), GROUND, [0, 0.06, 0]);

  // ---- Raked gravel bed with concentric rake rings around a rock island ----
  const rakedSand = paint((p) =>
    Math.sin(Math.hypot(p.x - 1.6, p.z + 1.6) * 7) > 0.2 ? "#cfc3a6" : "#ece4d0",
  );
  b.part(new THREE.BoxGeometry(4, 0.02, 3.8), rakedSand, { at: [2.4, 0.13, -1.0] });

  // Rock island standing in the sand
  put(new THREE.IcosahedronGeometry(0.45, 0), STONE_DARK, [1.6, 0.48, -1.6], {
    scale: [1.3, 0.8, 1.1],
    rotation: [10, 30, 0],
  });

  // ---- Lily pond: stone ring and still water ----
  const pond: V = [-1.6, 0, -0.6];
  put(new THREE.TorusGeometry(1.27, 0.08, 6, 20), STONE, [pond[0], 0.16, pond[2]], {
    rotation: [90, 0, 0],
  });
  put(new THREE.CylinderGeometry(1.25, 1.25, 0.03, 20), WATER, [pond[0], 0.15, pond[2]]);
  // a few lily pads
  for (const [dx, dz, r] of [
    [-0.4, 0.3, 0.2],
    [0.5, -0.2, 0.16],
    [0.1, -0.7, 0.14],
  ] as [number, number, number][]) {
    put(new THREE.CylinderGeometry(r, r, 0.012, 8), MOSS_DARK, [pond[0] + dx, 0.168, pond[2] + dz]);
  }

  // ---- Stone lantern beside the pond ----
  const lx = -0.6;
  const lz = -2.2;
  put(new THREE.CylinderGeometry(0.22, 0.26, 0.14, 8), STONE, [lx, 0.19, lz]);
  put(new THREE.CylinderGeometry(0.08, 0.1, 0.5, 8), STONE, [lx, 0.52, lz]);
  put(new THREE.CylinderGeometry(0.2, 0.14, 0.08, 8), STONE, [lx, 0.81, lz]);
  put(new THREE.BoxGeometry(0.34, 0.3, 0.34), LANTERN, [lx, 1.0, lz]);
  put(new THREE.ConeGeometry(0.3, 0.2, 4), STONE_DARK, [lx, 1.25, lz], { rotation: [0, 45, 0] });
  put(new THREE.SphereGeometry(0.05, 6, 4), STONE, [lx, 1.4, lz]);

  // ---- Stepping stones leading away from the pond ----
  const stones: [number, number][] = [
    [-0.9, 1.2],
    [-0.65, 1.7],
    [-0.4, 2.2],
    [-0.2, 2.7],
  ];
  stones.forEach(([x, z], i) => {
    put(new THREE.CylinderGeometry(0.28, 0.3, 0.06, 7), i % 2 ? STONE : STONE_DARK, [x, 0.15, z], {
      scale: [1, 1, 0.8],
    });
  });

  // ---- Rock cluster by the pine ----
  const rocks: [number, number, number][] = [
    [-4.2, -0.6, 1.1],
    [-3.8, -1.0, 0.8],
    [-4.5, 0.3, 0.7],
  ];
  rocks.forEach(([x, z, s], i) => {
    put(new THREE.IcosahedronGeometry(0.3 * s, 0), i === 1 ? STONE_DARK : STONE, [x, 0.12 + 0.2 * s, z], {
      scale: [1.2, 0.7, 1],
      rotation: [i * 20, i * 50, 0],
    });
  });

  // ---- Moss patch ----
  put(new THREE.CylinderGeometry(0.8, 0.9, 0.03, 9), MOSS, [-2.6, 0.135, 2.0]);

  // ---- Clipped pine ----
  const px = -3.8;
  const pz = 1.8;
  put(new THREE.CylinderGeometry(0.1, 0.14, 2.4, 6), TRUNK, [px, 1.32, pz]);
  const pineLayers: [number, number][] = [
    [0.75, 1.85],
    [0.6, 2.35],
    [0.42, 2.8],
  ];
  pineLayers.forEach(([r, y], i) => {
    put(new THREE.SphereGeometry(r, 7, 5), i % 2 ? PINE_LIGHT : PINE, [px + 0.1 * i, y, pz], {
      scale: [1, 0.45, 1],
    });
  });

  // ---- Red maple at the back right ----
  const mx = 4.3;
  const mz = -3.2;
  put(new THREE.CylinderGeometry(0.12, 0.18, 1.8, 6), TRUNK, [mx, 1.02, mz]);
  put(new THREE.SphereGeometry(0.9, 7, 5), MAPLE, [mx, 2.5, mz]);
  put(new THREE.SphereGeometry(0.6, 6, 4), MAPLE, [mx + 0.6, 2.2, mz + 0.3]);
  put(new THREE.SphereGeometry(0.55, 6, 4), "#dd6a4c", [mx - 0.5, 2.3, mz - 0.4]);

  // ---- Bamboo grove, back left ----
  for (let i = 0; i < 9; i++) {
    const x = -4.7 + i * 0.25 + Math.sin(i * 2.1) * 0.1;
    const z = -3.2 + Math.cos(i * 1.7) * 0.2;
    const h = 3.2 + (i % 4) * 0.35;
    put(new THREE.CylinderGeometry(0.035, 0.04, h, 6), i % 3 ? BAMBOO : BAMBOO_DARK, [x, 0.12 + h / 2, z]);
  }

  // ---- Clipped shrubs with azalea blossoms ----
  const shrub = (x: number, z: number, s: number) => {
    put(new THREE.SphereGeometry(0.45 * s, 7, 5), MOSS_DARK, [x, 0.12 + 0.32 * s, z], {
      scale: [1.2, 0.7, 1],
    });
    for (const [dx, dy, dz] of [
      [0.2, 0.55, 0.1],
      [-0.25, 0.5, -0.1],
      [0.05, 0.6, -0.25],
    ] as V[]) {
      put(new THREE.SphereGeometry(0.09 * s, 5, 4), AZALEA, [x + dx * s, dy * s + 0.12, z + dz * s]);
    }
  };
  shrub(-2.0, 3.1, 1.0);
  shrub(0.5, 3.2, 0.9);
  shrub(-3.5, 3.0, 1.1);

  // ---- White wall with a two-slope tiled roof along the back ----
  put(new THREE.BoxGeometry(10, 1.6, 0.25), WALL, [0, 0.92, -3.75]);
  put(new THREE.BoxGeometry(10.4, 0.1, 0.7), ROOF, [0, 1.85, -3.45], { rotation: [12, 0, 0] });
  put(new THREE.BoxGeometry(10.4, 0.1, 0.7), ROOF, [0, 1.85, -4.05], { rotation: [-12, 0, 0] });

  // ---- Small wooden pavilion on a raised deck, right front ----
  const dx = 2.4;
  const dz = 2.2;
  put(new THREE.BoxGeometry(2.4, 0.12, 1.4), WOOD, [dx, 0.18, dz]);
  for (const sx of [-0.95, 0.95]) {
    for (const sz of [-0.55, 0.55]) {
      put(new THREE.BoxGeometry(0.1, 1.6, 0.1), WOOD_DARK, [dx + sx, 1.04, dz + sz]);
    }
  }
  put(new THREE.BoxGeometry(2.0, 0.08, 0.08), WOOD_DARK, [dx, 1.5, dz - 0.55]);
  put(new THREE.ConeGeometry(1.7, 0.7, 4), ROOF, [dx, 2.19, dz], { rotation: [0, 45, 0] });

  return b.root;
}
