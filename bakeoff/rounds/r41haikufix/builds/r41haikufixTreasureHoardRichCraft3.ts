import * as THREE from "three";
import { createBuilder, grain, rng } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Treasure hoard",
  description:
    "A riveted oak chest with its lid half-open on a heap of gilt and silver coins, a jewelled crown, two goblets and glowing gems.",
};

const TAU = Math.PI * 2;

// Scale constants: the heap spreads about 1.8 m across and the chest is 0.9 m wide.
const HEAP_R = 0.9;
const HEAP_H = 0.34;
const CHEST_W = 0.9;
const CHEST_D = 0.6;
const CHEST_H = 0.5;
const LID_H = 0.22;

const GOLD = metal("gilt", { polish: 0.7 });
const SILVER = metal("steel", { polish: 0.6 });
const COPPER = metal("copper", { verdigris: 0.25 });
const IRON = panelled(metal("iron", { tarnish: 0.3 }), { size: 0.1, rivets: 0.025 });
const WOOD = grain("#9a5a2a", "#4a2410", { size: 0.06, axis: "x", seed: 4 });
const WOOD_DARK = grain("#5a3014", "#2a1408", { size: 0.05, axis: "x", seed: 9 });

const RUBY = "#e0203a";
const EMERALD = "#1fc768";
const SAPPHIRE = "#2f6bff";
const AMETHYST = "#a456ff";
const GEM_COLORS = [RUBY, EMERALD, SAPPHIRE, AMETHYST];

/** Height of the coin heap at a floor point: highest at the centre, falling to the rim. */
function heapY(x: number, z: number) {
  const r = Math.hypot(x, z) / HEAP_R;
  return r >= 1 ? 0 : HEAP_H * Math.pow(1 - r * r, 0.7);
}

/** The footprint of the chest body: coins don't go here. */
function inChest(x: number, z: number) {
  return Math.abs(x) < CHEST_W / 2 - 0.02 && Math.abs(z) < CHEST_D / 2 - 0.02;
}

export default function build() {
  const b = createBuilder({ name: "treasure-hoard" });
  const R = rng(11);

  // ---------------------------------------------------------------- the chest
  // Body: a box of oak with iron straps and bands.
  b.part(new THREE.BoxGeometry(CHEST_W, CHEST_H, CHEST_D), WOOD, { at: [0, CHEST_H / 2, 0] });
  for (const y of [0.12, 0.38]) {
    b.part(new THREE.BoxGeometry(CHEST_W + 0.02, 0.06, CHEST_D + 0.02), IRON, { at: [0, y, 0] });
  }
  for (const x of [-0.24, 0.24]) {
    b.part(new THREE.BoxGeometry(0.06, CHEST_H + 0.01, CHEST_D + 0.03), IRON, { at: [x, CHEST_H / 2, 0] });
  }
  // Lid: a half-open arch, its outline runs along z and thickness along x.
  const arch: [number, number][] = [];
  for (let i = 0; i <= 10; i++) {
    const a = (i / 10) * Math.PI;
    arch.push([(CHEST_D / 2) * Math.cos(a), LID_H * Math.sin(a)]);
  }
  b.extrude(arch, { at: [0, CHEST_H, 0], x: [0, 0, 1], thickness: CHEST_W, color: WOOD });
  // Gilt lock plate and a dark keyhole on the front.
  b.part(new THREE.BoxGeometry(0.12, 0.15, 0.03), GOLD, { at: [0, 0.3, CHEST_D / 2 + 0.012] });
  b.part(new THREE.BoxGeometry(0.02, 0.05, 0.01), "#22150b", { at: [0, 0.29, CHEST_D / 2 + 0.03] });
  // Gilt arch band across the lid's crown.
  b.extrude(
    arch.map(([z, y]) => [z * 1.02, y * 1.04] as [number, number]),
    { at: [0, CHEST_H, 0], x: [0, 0, 1], thickness: 0.03, color: GOLD },
  );

  // ---------------------------------------------------------------- the coin heap
  // Coins lie flat, tilted a few degrees, stacked in layers that rise toward the centre.
  for (let i = 0; i < 300; i++) {
    const a = R() * TAU;
    const r = Math.sqrt(R()) * HEAP_R * 0.98;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (inChest(x, z)) continue;
    const layer = Math.floor(R() * 3);
    const y = heapY(x, z) * 0.85 + 0.004 + layer * 0.009;
    const coin = new THREE.CylinderGeometry(0.03, 0.03, 0.008, 10);
    const mat = R() < 0.22 ? SILVER : GOLD;
    b.part(coin, mat, {
      at: [x, y, z],
      rotation: [(R() - 0.5) * 16, R() * 360, (R() - 0.5) * 16],
    });
  }

  // Gems: cut-faceted octahedra lying among the coins, glowing.
  for (let i = 0; i < 34; i++) {
    const a = R() * TAU;
    const r = Math.sqrt(R()) * HEAP_R * 0.9;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (inChest(x, z)) continue;
    const s = 0.02 + R() * 0.018;
    const geo = new THREE.OctahedronGeometry(s, 0).scale(1, 1.3, 1);
    const color = GEM_COLORS[Math.floor(R() * GEM_COLORS.length)];
    const y = heapY(x, z) * 0.85 + s * 0.9;
    glow(
      b.part(geo, color, {
        at: [x, y, z],
        rotation: [R() * 40, R() * 360, R() * 40],
      }),
      1.2,
    );
  }

  // Gold rim of the heap, a bright ring of coins pressed into the edge.
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU + R() * 0.1;
    const r = HEAP_R * 0.82;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.01, 10), GOLD, {
      at: [x, 0.006, z],
      rotation: [88, a * (180 / Math.PI), 0],
    });
  }

  // ---------------------------------------------------------------- the crown
  const cx = 0.12;
  const cz = -0.5;
  const cy = heapY(cx, cz) * 0.85 + 0.01;
  b.lathe(
    [
      [0.09, 0],
      [0.115, 0],
      [0.115, 0.045],
      [0.09, 0.045],
    ],
    { at: [cx, cy, cz], axis: [0, 1, 0], segments: 10, color: GOLD },
  );
  // Five points, each capped with a glowing jewel.
  const points = 5;
  for (let k = 0; k < points; k++) {
    const a = (k / points) * TAU;
    const base: [number, number, number] = [cx + Math.cos(a) * 0.1, cy + 0.045, cz + Math.sin(a) * 0.1];
    const dir: [number, number, number] = [Math.cos(a) * 0.35, 1, Math.sin(a) * 0.35];
    const len = 0.09;
    b.spike(base, dir, len, 0.017, { color: GOLD });
    const n = Math.hypot(...dir);
    const tip: [number, number, number] = [
      base[0] + (dir[0] / n) * len,
      base[1] + (dir[1] / n) * len,
      base[2] + (dir[2] / n) * len,
    ];
    glow(
      b.part(new THREE.SphereGeometry(0.014, 8, 6), GEM_COLORS[k % GEM_COLORS.length], {
        at: tip,
      }),
      1.4,
    );
  }
  // A centre jewel on the band, facing front.
  glow(
    b.part(new THREE.OctahedronGeometry(0.022, 0).scale(1, 1.2, 0.7), RUBY, {
      at: [cx, cy + 0.02, cz + 0.12],
    }),
    1.5,
  );

  // ---------------------------------------------------------------- goblets
  const goblet = (x: number, z: number, cup: string | THREE.Color | any) => {
    const y = heapY(x, z) * 0.85;
    b.lathe(
      [
        [0, 0],
        [0.055, 0],
        [0.058, 0.012],
        [0.016, 0.04],
        [0.014, 0.1],
        [0.05, 0.13],
        [0.075, 0.18],
        [0.078, 0.2],
        [0.07, 0.205],
        [0, 0.205],
      ],
      { at: [x, y, z], axis: [0, 1, 0], segments: 10, color: cup },
    );
    // A gem set into the cup's front.
    glow(
      b.part(new THREE.SphereGeometry(0.014, 8, 6), GEM_COLORS[Math.floor(R() * GEM_COLORS.length)], {
        at: [x, y + 0.12, z + 0.062],
      }),
      1.2,
    );
  };
  goblet(-0.62, 0.42, GOLD);
  goblet(0.6, 0.36, COPPER);

  return b.root;
}
