```ts
import * as THREE from "three";
import { catmull, createBuilder, frame, grain, mottle, patches, rng, scales, stripes, svg } from "agentic-3js-builder";

export const meta = {
  name: "Treehouse",
  description:
    "A small cabin on a deck in a tall old oak: plank siding, a shingled roof with a stone chimney, a ladder, a rope swing, flower boxes, a birdhouse and a knot on the trunk, and a painted canopy of leaf cards.",
};

// Colours (sRGB). The paints for the big surfaces are defined just below.
const CREAM = "#f1e3c2";
const DOOR = "#2f6b5a";
const GLASS = "#ffd98a";
const BRASS = "#d9a441";
const TERRACOTTA = "#b65a36";
const SOIL = "#4a3322";
const STONE = "#8d8a84";
const SLATE = "#5d5950";
const RIDGE = "#5a2a1f";
const RAIL = "#8a6a46";
const POST = "#6b4a2c";
const PLANTER = "#7d5330";
const LADDER = "#9b7040";
const ROPE = "#cdb88a";
const SEAT = "#a0703f";
const BIRD_WOOD = "#b98a52";
const BIRD_ROOF = "#8d4a33";
const HOLE = "#2a1d14";
const IRON = "#3b3b40";
const LANTERN = "#ffc857";
const LEAF = "#4f8f3a";
const PETALS = ["#e8557a", "#f6d03c", "#fff6e0"];

const bark = grain("#70502f", "#46301c", { size: 0.14, axis: "y", seed: 3 });
const deckBoards = stripes("#d9a86f", "#8f5f35", { size: 0.2, axis: "z", width: 0.16, wobble: 0.15, seed: 5 });
const siding = stripes("#cf9560", "#9d663a", { size: 0.22, axis: "y", width: 0.18, wobble: 0.12, seed: 8 });
const shingles = scales(["#b9573b", "#a6472f", "#c86e47"], "#5a2a1f", { size: 0.3, width: 0.16, seed: 2 });
const stoneWork = patches("#8c857a", ["#a39c8f", "#776f64"], { size: 0.24, gap: 0.12, seed: 4 });
const foliage = mottle("#2b6430", "#66a84b", { size: 1.1, seed: 9, contrast: 1.4 });
const turf = mottle("#6aa044", "#94c35d", { size: 0.8, seed: 12 });

/** A leaf drawn in SVG: a cut-out card with a midrib and side veins, transparent outside the leaf. */
function leafPicture(fill: string, vein: string) {
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">` +
      `<path d="M50 3C88 24 94 70 50 98C6 70 12 24 50 3Z" fill="${fill}"/>` +
      `<path d="M50 12Q56 50 50 90" fill="none" stroke="${vein}" stroke-width="4" stroke-linecap="round"/>` +
      `<path d="M52 36L74 24M48 56L26 44M52 66L72 58" fill="none" stroke="${vein}" stroke-width="2.5" stroke-linecap="round"/>` +
      `</svg>`,
    { size: 128 },
  );
}

export default function treehouse() {
  const b = createBuilder({ name: "treehouse", detail: 1, paintSize: 2048 });
  const pick = rng(7);
  const base = b.joint("base", { at: [0, 0, 0] });

  // Key positions (metres). The trunk stands behind and left of the house; the deck spans both.
  const TREE = { x: -1.0, z: -0.4 };
  const DECK_TOP = 3.7;
  const WALL_TOP = 5.9;
  const HX = 1.1; // house centre x
  const HZ = 0.5; // house centre z

  // ---- Ground: a grassy mound the tree grows out of, with stones and bushes.
  b.lathe(
    [
      [0, -0.1],
      [4.6, -0.1],
      [4.4, 0.12],
      [3.2, 0.22],
      [1.2, 0.27],
      [0, 0.28],
    ],
    { color: turf, at: [0, 0, 0], segments: 10, name: "mound" },
  );
  b.part(new THREE.DodecahedronGeometry(0.22, 0), STONE, {
    at: [3.9, 0.11, 0.4],
    scale: [1.3, 0.75, 1],
    rotation: [0, 20, 0],
    name: "stone",
  });
  b.part(new THREE.DodecahedronGeometry(0.16, 0), STONE, {
    at: [-3.9, 0.08, -0.9],
    scale: [1.2, 0.75, 1],
    rotation: [0, 60, 0],
    name: "stone",
  });
  b.part(new THREE.DodecahedronGeometry(0.18, 0), STONE, {
    at: [1.2, 0.09, 3.9],
    scale: [1.3, 0.7, 1],
    rotation: [0, 35, 0],
    name: "stone",
  });
  b.part(new THREE.SphereGeometry(0.6, 7, 5), foliage, { at: [-3.3, 0.45, 2.3], flat: true, name: "bush" });
  b.part(new THREE.SphereGeometry(0.42, 7, 5), foliage, { at: [-2.6, 0.3, 3.1], flat: true, name: "bush" });
  b.part(new THREE.SphereGeometry(0.55, 7, 5), foliage, { at: [3.5, 0.42, 2.6], flat: true, name: "bush" });

  // ---- Tree: a leaning, tapering trunk, roots, and the limbs that hold the crown and the swing.
  const trunkPath = catmull([
    [TREE.x, 0, TREE.z],
    [TREE.x + 0.05, 2.6, TREE.z + 0.03],
    [TREE.x - 0.06, 5.2, TREE.z - 0.02],
    [TREE.x + 0.04, 7.6, TREE.z + 0.02],
    [TREE.x - 0.05, 9.0, TREE.z],
  ]);
  const trunk = b.sweep(trunkPath, (t) => 0.22 + 0.36 * (1 - t) ** 2, {
    name: "trunk",
    color: bark,
    sides: 10,
    caps: { start: "flat" },
  });

  for (const [dx, dz] of [
    [0.75, 0.55],
    [-0.7, 0.6],
    [-0.62, -0.78],
    [0.6, -0.8],
  ]) {
    b.capsule(
      [TREE.x + dx * 0.4, 0.2, TREE.z + dz * 0.4],
      [TREE.x + dx, 0.03, TREE.z + dz],
      [0.2, 0.07],
      { color: bark, name: "root" },
    );
  }

  b.capsule([TREE.x, 5.7, TREE.z], [-2.4, 7.9, -0.6], [0.2, 0.09], { color: bark, name: "limb" });
  b.capsule([TREE.x + 0.05, 7.0, TREE.z - 0.1], [0.3, 8.6, -1.9], [0.17, 0.08], { color: bark, name: "limb" });

  // The swing hangs from a limb on the left, out past the deck. Its pivot is a joint so it can be posed.
  const swing = b.joint("swing", { parent: base, at: [-3.2, 6.7, -0.4], dir: [0, -1, 0] });
  b.capsule([TREE.x, 6.3, TREE.z], [-3.2, 6.7, -0.4], [0.14, 0.09], { color: bark, bone: swing, name: "limb" });
  b.part(new THREE.BoxGeometry(0.56, 0.06, 0.26), SEAT, {
    at: [-3.2, 2.05, -0.4],
    bone: swing,
    name: "swing seat",
  });
  for (const side of [-1, 1]) {
    b.rod([-3.2, 6.7, -0.4], [-3.2 + side * 0.26, 2.08, -0.4], 0.018, {
      color: ROPE,
      bone: swing,
      name: "swing rope",
    });
  }

  // Details stuck to the trunk, found by ray from outside so they sit on the real bark.
  const trunkSurface = b.surface(trunk);
  const knot = trunkSurface.ray([TREE.x, 1.1, 3.0], [0, 0, -1]);
  if (knot) b.stick(new THREE.SphereGeometry(0.07, 6, 4), HOLE, knot, { embed: 0.35, name: "knot" });

  const perch = trunkSurface.ray([TREE.x, 2.2, 3.0], [0, 0, -1]);
  if (perch) {
    const spot = perch.at.clone().addScaledVector(perch.n, 0.1);
    const bx = spot.x;
    const bz = spot.z;
    b.part(new THREE.BoxGeometry(0.3, 0.3, 0.26), BIRD_WOOD, { at: [bx, 2.2, bz], name: "birdhouse" });
    b.part(new THREE.ConeGeometry(0.24, 0.2, 4), BIRD_ROOF, {
      at: [bx, 2.45, bz],
      rotation: [0, 45, 0],
      name: "birdhouse roof",
    });
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), HOLE, {
      at: [bx, 2.23, bz + 0.14],
      rotation: [90, 0, 0],
      name: "birdhouse hole",
    });
    b.rod([bx, 2.08, bz + 0.13], [bx, 2.08, bz + 0.22], 0.015, { color: BIRD_ROOF, name: "perch" });
  }

  // ---- Deck: boards on beams and posts, with a railing that leaves a gap for the ladder.
  b.part(new THREE.BoxGeometry(5.2, 0.16, 3.6), deckBoards, { at: [0.3, DECK_TOP - 0.08, 0.4], name: "deck" });
  for (const z of [-1.0, 1.9]) {
    b.part(new THREE.BoxGeometry(4.8, 0.16, 0.18), POST, { at: [0.3, 3.46, z], name: "beam" });
  }
  for (const [x, z] of [
    [-2.0, -1.0],
    [-2.0, 1.9],
    [2.6, -1.0],
    [2.6, 1.9],
  ]) {
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 3.6, 7), POST, { at: [x, 1.8, z], name: "post" });
  }

  const RAIL_Y = 4.36;
  const railing = (axis: "x" | "z", a0: number, a1: number, fixed: number) => {
    const at = (u: number, y: number): [number, number, number] => (axis === "x" ? [u, y, fixed] : [fixed, y, u]);
    const len = a1 - a0;
    b.part(
      axis === "x" ? new THREE.BoxGeometry(len, 0.08, 0.08) : new THREE.BoxGeometry(0.08, 0.08, len),
      RAIL,
      { at: at((a0 + a1) / 2, RAIL_Y), name: "rail" },
    );
    const count = Math.max(1, Math.round(len / 0.26));
    for (let i = 0; i <= count; i++) {
      b.part(new THREE.BoxGeometry(0.05, 0.64, 0.05), RAIL, {
        at: at(a0 + (len * i) / count, 4.02),
        name: "spindle",
      });
    }
  };
  railing("x", -2.26, 2.86, -1.36);
  railing("z", -1.36, 2.16, -2.26);
  railing("z", -1.36, 2.16, 2.86);
  railing("x", -2.26, -1.95, 2.16);
  railing("x", -1.25, 2.86, 2.16);

  const planter = (at: [number, number, number], length: number, alongX: boolean) => {
    const [x, y, z] = at;
    b.part(new THREE.BoxGeometry(alongX ? length : 0.22, 0.2, alongX ? 0.22 : length), PLANTER, {
      at,
      name: "planter",
    });
    for (let i = 0; i < 5; i++) {
      const u = ((i + 0.5) / 5 - 0.5) * length * 0.9;
      b.part(new THREE.SphereGeometry(0.09, 6, 4), PETALS[i % PETALS.length], {
        at: alongX ? [x + u, y + 0.14, z] : [x, y + 0.14, z + u],
        name: "bloom",
      });
    }
  };

  // Plant pot on the porch corner.
  b.part(new THREE.CylinderGeometry(0.2, 0.15, 0.3, 8), TERRACOTTA, { at: [2.5, 3.85, 1.9], name: "pot" });
  b.part(new THREE.CylinderGeometry(0.21, 0.21, 0.04, 8), SOIL, { at: [2.5, 4.0, 1.9] });
  b.part(new THREE.SphereGeometry(0.26, 7, 5), LEAF, { at: [2.5, 4.26, 1.9], flat: true, name: "pot plant" });

  // ---- House: siding box, gables, a shingled roof with a ridge, and a stone chimney.
  b.part(new THREE.BoxGeometry(2.6, WALL_TOP - DECK_TOP, 2.2), siding, {
    at: [HX, (DECK_TOP + WALL_TOP) / 2, HZ],
    name: "wall",
  });
  for (const z of [-0.62, 1.62]) {
    b.extrude(
      [
        [-0.2, WALL_TOP - 0.05],
        [2.4, WALL_TOP - 0.05],
        [HX, 6.85],
      ],
      { color: siding, at: [0, 0, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.12, name: "gable" },
    );
  }

  const roofY = WALL_TOP + 0.476 + 0.043;
  b.part(new THREE.BoxGeometry(1.95, 0.1, 2.8), shingles, {
    at: [HX + 0.85, roofY, HZ],
    rotation: [0, 0, -30],
    name: "roof",
  });
  b.part(new THREE.BoxGeometry(1.95, 0.1, 2.8), shingles, {
    at: [HX - 0.85, roofY, HZ],
    rotation: [0, 0, 30],
    name: "roof",
  });
  b.part(new THREE.BoxGeometry(0.24, 0.12, 2.9), RIDGE, { at: [HX, 6.9, HZ], name: "ridge" });

  b.part(new THREE.BoxGeometry(0.46, 1.66, 0.46), stoneWork, { at: [2.05, 6.7, 1.2], name: "chimney" });
  b.part(new THREE.BoxGeometry(0.56, 0.1, 0.56), SLATE, { at: [2.05, 7.58, 1.2], name: "chimney cap" });

  // Front: door with a frame and a small glass pane, a window to its right, a lantern beside them.
  b.part(new THREE.BoxGeometry(0.98, 2.0, 0.08), CREAM, { at: [0.85, 4.7, 1.64], name: "door frame" });
  b.part(new THREE.BoxGeometry(0.8, 1.88, 0.06), DOOR, { at: [0.85, 4.64, 1.71], name: "door" });
  b.part(new THREE.BoxGeometry(0.34, 0.4, 0.02), GLASS, { at: [0.85, 5.0, 1.75], name: "door glass" });
  b.part(new THREE.SphereGeometry(0.045, 6, 4), BRASS, { at: [1.02, 4.5, 1.77], name: "knob" });

  b.part(new THREE.BoxGeometry(0.66, 0.8, 0.08), CREAM, { at: [1.95, 5.0, 1.64], name: "window frame" });
  b.part(new THREE.BoxGeometry(0.5, 0.64, 0.03), GLASS, { at: [1.95, 5.0, 1.71], name: "window glass" });
  b.part(new THREE.BoxGeometry(0.04, 0.64, 0.03), CREAM, { at: [1.95, 5.0, 1.74], name: "mullion" });
  b.part(new THREE.BoxGeometry(0.5, 0.04, 0.03), CREAM, { at: [1.95, 5.0, 1.74], name: "mullion" });
  planter([1.95, 4.4, 1.71], 0.72, true);

  b.rod([1.46, 5.6, 1.62], [1.46, 5.6, 1.86], 0.025, { color: IRON, name: "lantern arm" });
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.2), IRON, { at: [1.46, 5.53, 1.86], name: "lantern cap" });
  b.part(new THREE.SphereGeometry(0.12, 8, 6), LANTERN, { at: [1.46, 5.36, 1.86], name: "lantern" });
  b.part(new THREE.BoxGeometry(0.18, 0.04, 0.18), IRON, { at: [1.46, 5.2, 1.86], name: "lantern base" });

  // Side (+X): a window with a flower box and a round porthole above the back of the deck.
  b.part(new THREE.BoxGeometry(0.08, 0.9, 1.0), CREAM, { at: [2.44, 4.9, 0.5], name: "side window frame" });
  b.part(new THREE.BoxGeometry(0.03, 0.72, 0.82), GLASS, { at: [2.49, 4.9, 0.5], name: "side window glass" });
  b.part(new THREE.BoxGeometry(0.03, 0.72, 0.04), CREAM, { at: [2.51, 4.9, 0.5], name: "mullion" });
  b.part(new THREE.BoxGeometry(0.03, 0.04, 0.82), CREAM, { at: [2.51, 4.9, 0.5], name: "mullion" });
  planter([2.5, 4.33, 0.5], 1.1, false);

  b.part(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 10), CREAM, {
    at: [2.46, 5.35, -0.35],
    rotation: [0, 0, 90],
    name: "porthole",
  });
  b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 10), GLASS, {
    at: [2.5, 5.35, -0.35],
    rotation: [0, 0, 90],
    name: "porthole glass",
  });

  // ---- Ladder from the ground up to the deck's front edge, through the gap in the railing.
  const LADDER_X = -1.6;
  const LADDER_TOP = 3.78;
  const ladderAt = (s: number, side: number): [number, number, number] => [
    LADDER_X + side,
    LADDER_TOP * s,
    3.3 + (2.3 - 3.3) * s,
  ];
  b.rod(ladderAt(0, -0.25), ladderAt(1, -0.25), 0.035, { color: LADDER, name: "ladder rail" });
  b.rod(ladderAt(0, 0.25), ladderAt(1, 0.25), 0.035, { color: LADDER, name: "ladder rail" });
  for (let i = 1; i <= 8; i++) {
    const s = 0.1 + i * 0.1;
    b.rod(ladderAt(s, -0.25), ladderAt(s, 0.25), 0.025, { color: LADDER, name: "rung" });
  }

  // ---- Canopy: low-poly painted crowns, and leaf cards scattered over their outsides.
  const crowns: Array<{ at: [number, number, number]; r: number; leaves: number }> = [
    { at: [-0.4, 9.6, -0.3], r: 2.5, leaves: 30 },
    { at: [-2.6, 8.2, -0.5], r: 1.8, leaves: 18 },
    { at: [2.0, 9.0, -0.6], r: 1.9, leaves: 18 },
    { at: [-0.7, 8.0, 1.5], r: 1.1, leaves: 10 },
    { at: [-1.9, 10.6, 0.7], r: 1.6, leaves: 14 },
    { at: [0.9, 11.0, 0.9], r: 1.5, leaves: 14 },
    { at: [-0.9, 11.8, -1.2], r: 1.2, leaves: 10 },
    { at: [-3.2, 9.9, -1.6], r: 1.3, leaves: 12 },
    { at: [1.6, 10.2, -1.9], r: 1.3, leaves: 12 },
    { at: [-0.6, 8.0, -2.4], r: 1.4, leaves: 12 },
  ];
  for (const c of crowns) {
    b.part(new THREE.SphereGeometry(c.r, 7, 5), foliage, { at: c.at, flat: true, name: "canopy" });
  }

  const leafPictures = [
    leafPicture("#4f9d3a", "#2b6326"),
    leafPicture("#6cb34b", "#37802e"),
    leafPicture("#3c8637", "#22561e"),
  ];
  const leaves: ReturnType<typeof frame>[] = [];
  for (const c of crowns) {
    for (let i = 0; i < c.leaves; i++) {
      const up = pick() * 2 - 1;
      if (up < -0.35) continue;
      const turn = pick() * Math.PI * 2;
      const ring = Math.sqrt(1 - up * up);
      const dir = [ring * Math.cos(turn), up, ring * Math.sin(turn)];
      const reach = c.r * (0.9 + 0.12 * pick());
      const at = [c.at[0] + dir[0] * reach, c.at[1] + dir[1] * reach, c.at[2] + dir[2] * reach];
      leaves.push(frame(at, dir));
    }
  }
  b.cards(leaves, leafPictures, {
    name: "leaves",
    size: 0.95,
    lean: 30,
    flow: [0, -1, 0],
    vary: 0.25,
    spin: 45,
    cross: true,
    rng: rng(21),
  });

  return b.root;
}
```