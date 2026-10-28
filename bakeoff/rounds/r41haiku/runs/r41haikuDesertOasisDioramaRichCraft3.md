The module below builds a whimsical desert oasis on a sand disc: a turquoise pool ringed in stone, three palms, three striped tents, three rigged camels with saddle rugs, jars, rocks and shrubs. Everything hangs off one root joint, and each camel has its own hip, neck, head and leg chains. I have not run it through the builder, so treat it as untested.

```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, grain, mottle, paint, rng, stripes, svg } from "agentic-3js-builder";

export const meta = {
  name: "Whimsical desert oasis",
  description: "A striped-tent oasis with a turquoise pool, palms, three camels, jars and rocks on a sand disc.",
};

const DEG = Math.PI / 180;
const GROUND = 0.3; // top of the sand disc
type V = [number, number, number];

/** Local (right-handed about +Y) point: lx across, ly absolute height, lz forward, turned by yawDeg about the base. */
const R = (lx: number, ly: number, lz: number, base: readonly [number, number], yawDeg: number): V => {
  const a = yawDeg * DEG;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [base[0] + lx * c + lz * s, ly, base[1] - lx * s + lz * c];
};
/** Direction of local +X for a yaw. */
const dirX = (yawDeg: number): V => {
  const a = yawDeg * DEG;
  return [Math.cos(a), 0, -Math.sin(a)];
};

// Palette
const SAND_LO = "#f2c77e";
const SAND_HI = "#ffe2a6";
const SAND_DK = "#d9a35a";
const WATER_LO = "#1fa6a0";
const WATER_HI = "#9ff2e6";
const ROCK_LO = "#b7845a";
const ROCK_HI = "#e6bd92";
const TRUNK = "#9a6b3c";
const BARK_DK = "#6b4424";
const LEAF_A = "#3fae5a";
const LEAF_B = "#2b8a45";
const SHRUB = "#5fc26a";
const TENT_CREAM = "#fff1d6";
const TENT_RED = "#e8553d";
const TENT_TEAL = "#1fa6a0";
const TENT_GOLD = "#f5c542";
const DOOR = "#3a2330";
const BELLY = "#f7dcae";
const INK = "#2a1a2e";
const HOOF = "#5a3b26";
const JAR_RED = "#c9572e";

// A small banner drawing for the tent doors.
const TRIM = svg(
  `<svg viewBox="0 0 60 14" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="60" height="14" fill="${TENT_CREAM}"/>${Array.from(
    { length: 6 },
    (_, i) => `<path d="M${i * 10} 0 L${i * 10 + 5} 12 L${i * 10 + 10} 0 Z" fill="${TENT_RED}"/>`,
  ).join("")}<rect x="0" y="12" width="60" height="2" fill="${TENT_GOLD}"/></svg>`,
  { size: 256 },
);

const JAR_PROFILE: [number, number][] = [
  [0, 0],
  [0.12, 0],
  [0.14, 0.1],
  [0.09, 0.24],
  [0.12, 0.32],
  [0.07, 0.42],
  [0, 0.42],
];

export default function build() {
  const b = createBuilder({ name: "oasis" });
  const rnd = rng(11);
  const root = b.joint("root", { at: [0, 0, 0] });

  // ---- Ground: sand disc, dunes, rocks --------------------------------------------------------------
  const sand = mottle(SAND_LO, SAND_HI, { size: 0.35, seed: 3 });
  const sandDk = mottle(SAND_DK, SAND_LO, { size: 0.25, seed: 8 });
  b.part(new THREE.CylinderGeometry(2.3, 2.5, 0.3, 28), sand, { bone: root, at: [0, 0.15, 0] });

  const dunes: [number, number, number][] = [
    [-1.9, 0.6, 0.6],
    [1.9, 0.5, 0.55],
    [0.4, 1.9, 0.5],
    [-0.6, -1.95, 0.45],
  ];
  for (const [x, z, r] of dunes)
    b.part(new THREE.SphereGeometry(r, 10, 6), sandDk, {
      bone: root,
      at: [x, GROUND, z],
      scale: [1.6, 0.45, 1.2],
    });

  const rock = mottle(ROCK_LO, ROCK_HI, { size: 0.12, seed: 5 });
  const rocks: [number, number, number, number][] = [
    [-1.55, 0.95, 0.2, 0],
    [1.95, -1.0, 0.14, 1],
    [-2.0, -0.35, 0.16, 2],
    [1.3, 1.7, 0.18, 3],
  ];
  for (const [x, z, r, k] of rocks)
    b.part(new THREE.IcosahedronGeometry(r, 0), rock, {
      bone: root,
      at: [x, GROUND + r * 0.35, z],
      rotation: [k * 37, k * 61, k * 23],
      scale: [1.2, 0.8, 1],
    });

  // ---- The pool: a stone ring and water ----------------------------------------------------------------
  const stone = mottle(ROCK_HI, ROCK_LO, { size: 0.1, seed: 9 });
  b.lathe(
    [
      [0.66, GROUND],
      [0.84, GROUND],
      [0.84, GROUND + 0.08],
      [0.66, GROUND + 0.08],
    ],
    { at: [0, 0, 0], bone: root, color: stone },
  );
  b.part(new THREE.CylinderGeometry(0.66, 0.66, 0.03, 14), mottle(WATER_LO, WATER_HI, { size: 0.2, seed: 4 }), {
    bone: root,
    at: [0, GROUND + 0.055, 0],
  });

  // Shrubs ringing the pool.
  const shrubs: [number, number][] = [
    [0.3, -1.0],
    [-0.55, -0.9],
    [-0.2, 1.0],
    [0.95, 0.3],
    [-0.95, 0.05],
  ];
  for (const [x, z] of shrubs)
    b.part(new THREE.IcosahedronGeometry(0.17 + rnd() * 0.06, 0), SHRUB, {
      bone: root,
      at: [x, GROUND + 0.12, z],
      rotation: [rnd() * 60, rnd() * 60, 0],
      scale: [1, 0.8, 1],
    });

  // ---- Palms -------------------------------------------------------------------------------------------
  const palm = (x: number, z: number, lean: number, h: number, id: number) => {
    const top: V = [x + lean, GROUND + h, z + lean * 0.4];
    const trunkPath = catmull([
      [x, GROUND, z],
      [x + lean * 0.3, GROUND + h * 0.45, z + lean * 0.1],
      [x + lean * 0.8, GROUND + h * 0.8, z + lean * 0.3],
      top,
    ]);
    const crown = b.joint(`palmTop${id}`, { parent: root, at: top });
    b.sweep(trunkPath, (t: number) => 0.085 - 0.03 * t, {
      bone: root,
      color: stripes(TRUNK, BARK_DK, { size: 0.22, axis: "y", width: 0.25, seed: id }),
    });
    const fronds = 9;
    for (let i = 0; i < fronds; i++) {
      const a = (i / fronds) * Math.PI * 2 + rnd() * 0.3;
      const L = 0.95 + rnd() * 0.35;
      const dx = Math.cos(a);
      const dz = Math.sin(a);
      const leaf: Array<[number, number] | [number, number, "sharp"]> = [
        [0, 0.02],
        [0.3 * L, 0.14 * L],
        [0.7 * L, 0.1 * L],
        [L, -0.12 * L, "sharp"],
        [0.7 * L, -0.06 * L],
        [0.35 * L, -0.14 * L],
      ];
      b.extrude(leaf, {
        at: top,
        x: [dx, 0, dz],
        y: [0, 1, 0],
        thickness: 0.03,
        bevel: 0.006,
        bone: crown,
        color: i % 2 ? LEAF_A : LEAF_B,
      });
    }
    for (let k = 0; k < 3; k++)
      b.part(new THREE.SphereGeometry(0.06, 6, 5), BARK_DK, {
        bone: crown,
        at: [top[0] + (k - 1) * 0.05, top[1] - 0.08, top[2] + 0.03],
      });
  };
  palm(-1.5, -1.25, 0.3, 2.3, 0);
  palm(0.7, -1.4, -0.25, 2.5, 1);
  palm(-0.25, -1.85, 0.15, 2.0, 2);

  // ---- Tents -------------------------------------------------------------------------------------------
  const tent = (x: number, z: number, yawDeg: number, colA: string, colB: string, id: number) => {
    const base: [number, number] = [x, z];
    const at = (lx: number, ly: number, lz: number) => R(lx, GROUND + ly, lz, base, yawDeg);
    const dx = dirX(yawDeg);
    // The gable: a triangular prism running forward, striped by its own outline coordinates.
    const gable: Array<[number, number] | [number, number, "sharp"]> = [
      [-0.95, 0],
      [0.95, 0],
      [0, 1.1, "sharp"],
    ];
    const cloth = paint((_p, _n, s) => (Math.floor((s[0] + 1.2) / 0.3) % 2 === 0 ? colA : colB));
    b.extrude(gable, { at: at(0, 0, 0), x: dx, y: [0, 1, 0], thickness: 1.6, bevel: 0.01, color: cloth, bone: root });
    // The door arch on the front wall.
    const door: Array<[number, number] | [number, number, "sharp"]> = [
      [-0.2, 0],
      [0.2, 0],
      [0.2, 0.42],
      [0, 0.52, "sharp"],
      [-0.2, 0.42],
    ];
    b.extrude(door, { at: at(0, 0, 0.8), x: dx, y: [0, 1, 0], thickness: 0.03, color: DOOR, bone: root });
    // Banner above the door, rotated with the tent.
    b.part(new THREE.PlaneGeometry(0.5, 0.12), "#ffffff", {
      bone: root,
      at: at(0, 0.68, 0.83),
      rotation: [0, yawDeg, 0],
      texture: TRIM,
    });
    // Gold ridge line and a pennant on a finial.
    b.sweep([at(0, 1.1, -0.82), at(0, 1.1, 0.82)], 0.03, { bone: root, color: TENT_GOLD });
    const apex = at(0, 1.1, 0);
    b.spike(apex, [0, 1, 0], 0.22, 0.025, { color: TENT_GOLD, bone: root });
    b.extrude([[0, 0], [0.26, 0.05], [0, 0.1]], {
      at: at(0, 1.2, 0),
      x: dx,
      y: [0, 1, 0],
      thickness: 0.012,
      color: TENT_RED,
      bone: root,
    });
    // A rug with stripes and two cushions in front of the door.
    const rug = stripes(TENT_RED, [TENT_GOLD, TENT_TEAL], { size: 0.09, axis: "z", seed: id + 2 });
    b.part(new THREE.BoxGeometry(0.6, 0.02, 0.9), rug, {
      bone: root,
      at: at(0, GROUND + 0.01 - GROUND, 1.25),
      rotation: [0, yawDeg, 0],
    });
    b.part(new THREE.SphereGeometry(0.1, 8, 6), TENT_GOLD, { bone: root, at: at(0.25, GROUND + 0.06, 1.2) });
    b.part(new THREE.SphereGeometry(0.09, 8, 6), TENT_TEAL, { bone: root, at: at(-0.25, GROUND + 0.05, 1.4) });
  };
  tent(-1.45, -0.35, 15, TENT_CREAM, TENT_RED, 0);
  tent(1.6, -0.35, -25, TENT_CREAM, TENT_TEAL, 1);

  // Jars by the first tent.
  const jar = stripes(JAR_RED, TENT_GOLD, { size: 0.08, axis: "y", width: 0.3, seed: 6 });
  b.lathe(JAR_PROFILE, { at: [-0.75, GROUND, -0.6], bone: root, color: jar, smoothing: 1 });
  b.lathe(JAR_PROFILE, { at: [-0.9, GROUND, -0.42], bone: root, color: TENT_TEAL, smoothing: 1 });

  // ---- Camels ------------------------------------------------------------------------------------------
  const camel = (id: number, x: number, z: number, yawDeg: number, c1: string, c2: string) => {
    const base: [number, number] = [x, z];
    const P = (lx: number, ly: number, lz: number): V => R(lx, ly, lz, base, yawDeg);
    const coat = countershade(mottle(c1, c2, { size: 0.18, seed: id + 1 }), BELLY, { level: 0.2, soft: 0.4 });
    const hips = b.joint(`c${id}hips`, { parent: root, at: P(0, 1.2, 0) });

    // Barrel body, hump and saddle rug.
    b.sweep(
      catmull([P(0, 1.2, -0.75), P(0, 1.24, -0.2), P(0, 1.22, 0.3), P(0, 1.28, 0.62)]),
      (t: number) => 0.16 + 0.13 * Math.sin(Math.PI * t),
      { bone: hips, color: coat },
    );
    b.part(new THREE.SphereGeometry(0.22, 10, 7), coat, {
      bone: hips,
      at: P(0, 1.48, -0.25),
      scale: [0.9, 1, 1.1],
    });
    const blanket = stripes(TENT_RED, [TENT_GOLD, TENT_TEAL], { size: 0.06, axis: "z", seed: id + 9 });
    b.part(new THREE.BoxGeometry(0.62, 0.05, 0.5), blanket, {
      bone: hips,
      at: P(0, 1.4, -0.3),
      rotation: [0, yawDeg, 0],
    });

    // Neck and head: chain joints, the head on the neck's last joint.
    const neck = b.chain(`c${id}neck`, catmull([P(0, 1.25, 0.6), P(0, 1.62, 0.86), P(0, 2.0, 1.0)]), {
      parent: hips,
      count: 2,
    });
    b.sweep(neck, (t: number) => 0.13 - 0.05 * t, { color: coat });
    const head = b.joint(`c${id}head`, { parent: neck.joints[neck.joints.length - 1], at: P(0, 2.02, 1.02) });
    b.part(new THREE.BoxGeometry(0.22, 0.24, 0.26), coat, {
      bone: head,
      at: P(0, 2.12, 1.14),
      rotation: [0, yawDeg, 0],
    });
    b.part(new THREE.BoxGeometry(0.15, 0.13, 0.2), BELLY, {
      bone: head,
      at: P(0, 2.05, 1.31),
      rotation: [0, yawDeg, 0],
    });
    for (const s of [1, -1]) {
      b.spike(P(s * 0.09, 2.26, 1.1), [0, 1, 0], 0.12, 0.035, { color: coat, bone: head });
      b.part(new THREE.SphereGeometry(0.03, 6, 4), INK, { bone: head, at: P(s * 0.1, 2.16, 1.27) });
    }
    b.part(new THREE.SphereGeometry(0.03, 6, 4), INK, { bone: head, at: P(0, 2.06, 1.42) });

    // Four jointed legs with hooves.
    const legs: [number, number, string][] = [
      [-0.15, 0.42, "FL"],
      [0.15, 0.42, "FR"],
      [-0.15, -0.6, "BL"],
      [0.15, -0.6, "BR"],
    ];
    for (const [lx, lz, k] of legs) {
      const leg = b.chain(`c${id}leg${k}`, catmull([P(lx, 1.12, lz), P(lx, 0.72, lz + 0.03), P(lx, 0.34, lz)]), {
        parent: hips,
        names: [`c${id}hip${k}`, `c${id}knee${k}`, `c${id}hoof${k}`],
      });
      b.sweep(leg, (t: number) => 0.075 - 0.02 * t, { color: coat });
      b.part(new THREE.CylinderGeometry(0.075, 0.08, 0.06, 7), HOOF, {
        bone: leg.tip ?? hips,
        at: P(lx, GROUND + 0.015, lz),
      });
    }

    // Tail with a tuft.
    b.sweep([P(0, 1.3, -0.8), P(0, 1.4, -1.0), P(0, 1.3, -1.08)], 0.035, { bone: hips, color: coat });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), HOOF, { bone: hips, at: P(0, 1.28, -1.1) });
  };
  camel(0, 1.05, 1.05, -40, "#d9a46a", "#c18a52");
  camel(1, -0.95, 0.75, 25, "#e7b886", "#c9925e");
  camel(2, 0.1, 1.65, 170, "#c98a5a", "#a86a40");

  // A lantern on a stick by the first tent, and a few sand grains of grain for scatter.
  const sandGrain = grain(SAND_DK, SAND_LO, { size: 0.05, axis: "x", seed: 2 });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), BARK_DK, { bone: root, at: [-0.4, GROUND + 0.25, 0.9] });
  b.part(new THREE.SphereGeometry(0.08, 8, 6), TENT_GOLD, { bone: root, at: [-0.4, GROUND + 0.56, 0.9] });
  b.part(new THREE.BoxGeometry(1.5, 0.02, 0.8), sandGrain, { bone: root, at: [0.4, GROUND + 0.005, 1.6] });

  return b.root;
}
```