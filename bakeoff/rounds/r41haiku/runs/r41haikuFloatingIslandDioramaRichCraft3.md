This is a sky island with a stone ruin, a crystal on the altar, three stylised trees, a waterfall off the edge and floating rock below. It uses the toon and glow kits for the cel-shaded Genshin look. I haven't run it, so treat the exact proportions as a first pass.

```ts
import * as THREE from "three";
import { catmull, createBuilder, paint, rng, svg } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Sky Island",
  description: "A floating sky island with a crystal-topped ruin, three stylised trees, a waterfall and rock below.",
};

// Palette: cel paints, lit tone and hue-shifted shadow.
const ROCK = cel("#b3a6d2", "#63598f");
const ROCK_DARK = cel("#7a6ca8", "#3f3666");
const GRASS = cel("#9be86c", "#4aa860");
const STONE = cel("#f1e8d6", "#b9b0cc");
const STONE_D = cel("#d8cde6", "#8d82ab");
const BARK = cel("#9a6442", "#5c3a2c");
const LEAF_A = cel("#8ef0a8", "#3fa98a");
const LEAF_B = cel("#d2f58a", "#6fbf5a");
const BLOSSOM = cel("#ffc2e0", "#c77fb0");
const WATER = "#8fe6ff";
const FOAM = "#f4fbff";
const CRYSTAL = "#7ff7ff";

// The island's top is grass, its sides and underside rock.
const ISLAND = paint((_p, n) => (n.y > 0.5 ? GRASS : ROCK));
const UNDER = paint((p, n) => (n.y > 0.5 ? GRASS : p.y < 1.3 ? ROCK_DARK : ROCK));

// Surface height of the island top, and its centre.
const TOP = 2.6;
const RUIN = { x: -0.9, z: -0.6 };

// A rune drawing for the plinth, glowing cyan on its lines.
const RUNE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="27" fill="none" stroke="${CRYSTAL}" stroke-width="3.2"/>
    <circle cx="32" cy="32" r="15" fill="none" stroke="${CRYSTAL}" stroke-width="2.4"/>
    <path d="M32 6 L32 58 M9 19 L55 45 M55 19 L9 45" stroke="${CRYSTAL}" stroke-width="3.4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "sky-island" });
  const r = rng(7);

  // ---- The floating island: a lathe from the bottom tip out, over the top and back to the axis.
  b.lathe(
    [
      [0, 0],
      [0.5, 0.45],
      [1.1, 0.95],
      [1.8, 1.45],
      [2.5, 1.9],
      [3.0, 2.15],
      [3.15, 2.3],
      [3.0, 2.5],
      [2.6, 2.56],
      [1.5, TOP],
      [0, TOP],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 14, smoothing: 1, color: UNDER },
  );

  // ---- Ruin: a plinth, four pillars (two broken), a standing arch, and a crystal on a rune.
  b.part(new THREE.BoxGeometry(1.5, 0.12, 1.1), STONE_D, { at: [RUIN.x, TOP + 0.06, RUIN.z], flat: true });
  const pillars: [number, number, number][] = [
    [-1.5, -0.2, 1.9],
    [-0.3, -0.2, 1.9],
    [-1.5, -1.0, 1.1],
    [-0.3, -1.0, 0.7],
  ];
  for (const [x, z, h] of pillars) {
    b.part(new THREE.CylinderGeometry(0.14, 0.16, h, 8), STONE, { at: [x, TOP + h / 2, z], flat: true });
    if (h > 1.5)
      b.part(new THREE.BoxGeometry(0.42, 0.14, 0.42), STONE_D, { at: [x, TOP + h + 0.07, z], flat: true });
  }
  b.part(new THREE.TorusGeometry(0.6, 0.1, 6, 12, Math.PI), STONE, {
    at: [RUIN.x, TOP + 1.9, -0.2],
    flat: true,
  });
  // Rune drawn flat on the plinth, then the crystal above it.
  glow(
    b.part(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", {
      at: [RUIN.x, TOP + 0.125, RUIN.z],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: RUNE,
    }),
    0.8,
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.22, 0), CRYSTAL, {
      at: [RUIN.x, TOP + 0.45, RUIN.z],
      scale: [0.9, 1.5, 0.9],
      flat: true,
    }),
    1.2,
  );
  // Fallen blocks on the grass.
  b.part(new THREE.BoxGeometry(0.42, 0.22, 0.3), STONE, { at: [0.3, TOP + 0.11, 0.5], rotation: [0, 25, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.3, 0.16, 0.26), STONE_D, { at: [0.75, TOP + 0.08, 0.8], rotation: [0, -30, 0], flat: true });

  // ---- Trees: a lean trunk and three faceted canopy blobs in two greens.
  const tree = (x: number, z: number, h: number, lean: number, leaf: typeof LEAF_A) => {
    const base: [number, number, number] = [x, TOP - 0.02, z];
    const top: [number, number, number] = [x + lean, TOP - 0.02 + h, z];
    b.sweep(
      catmull([base, [x + lean * 0.3, TOP + h * 0.45, z], top]),
      [0.12, 0.06],
      { color: BARK },
    );
    const blobs: [number, number, number, number][] = [
      [0, 0, 0, 0.55],
      [0.35, -0.15, 0.1, 0.4],
      [-0.3, -0.1, -0.15, 0.42],
      [0.05, 0.35, 0.05, 0.38],
    ];
    blobs.forEach(([ox, oy, oz, rad], i) =>
      b.part(new THREE.IcosahedronGeometry(rad, 0), i % 2 ? LEAF_B : leaf, {
        at: [top[0] + ox, top[1] + oy, top[2] + oz],
        flat: true,
      }),
    );
  };
  tree(1.4, 0.9, 1.5, 0.15, LEAF_A);
  tree(-1.7, 1.2, 1.2, -0.2, LEAF_B);
  tree(0.5, -1.7, 1.8, 0.25, LEAF_A);

  // ---- Flower bushes scattered on the grass, away from the ruin, pool and trees.
  for (let i = 0; i < 9; i++) {
    const a = r() * Math.PI * 2;
    const d = 0.5 + r() * 2.0;
    const x = Math.sin(a) * d;
    const z = Math.cos(a) * d;
    if (Math.hypot(x - RUIN.x, z - RUIN.z) < 1.2) continue;
    if (Math.hypot(x - 2.1, z) < 0.8) continue;
    if (Math.hypot(x - 1.4, z - 0.9) < 0.6 || Math.hypot(x + 1.7, z - 1.2) < 0.6 || Math.hypot(x - 0.5, z + 1.7) < 0.6)
      continue;
    b.part(new THREE.IcosahedronGeometry(0.12 + r() * 0.06, 0), r() < 0.5 ? BLOSSOM : LEAF_B, {
      at: [x, TOP + 0.07, z],
      flat: true,
    });
  }

  // ---- Waterfall: a pool at the east lip, a ribbon of water going over the edge, foam at its foot.
  glow(
    b.part(new THREE.CylinderGeometry(0.45, 0.45, 0.03, 12), WATER, { at: [2.1, TOP, 0], flat: true }),
    0.5,
  );
  glow(
    b.sweep(
      catmull([
        [2.1, TOP - 0.05, 0],
        [2.85, 2.4, 0],
        [3.25, 1.8, 0.05],
        [3.3, 1.0, 0.1],
        [3.1, 0.45, 0.15],
      ]),
      [0.13, 0.07],
      { color: WATER },
    ),
    0.6,
  );
  b.part(new THREE.IcosahedronGeometry(0.2, 0), FOAM, { at: [3.05, 0.3, 0.15], flat: true });
  b.part(new THREE.IcosahedronGeometry(0.14, 0), FOAM, { at: [3.2, 0.42, 0.1], flat: true });

  // ---- Floating rock below the island: loose chunks hanging under the underside.
  for (let i = 0; i < 7; i++) {
    const a = r() * Math.PI * 2;
    const d = 0.9 + r() * 1.0;
    const rad = 0.12 + r() * 0.16;
    b.part(new THREE.IcosahedronGeometry(rad, 0), r() < 0.6 ? ROCK_DARK : ROCK, {
      at: [Math.sin(a) * d, 0.35 + r() * 0.5, Math.cos(a) * d],
      rotation: [r() * 40, r() * 90, r() * 40],
      flat: true,
    });
  }

  return b.root;
}
```