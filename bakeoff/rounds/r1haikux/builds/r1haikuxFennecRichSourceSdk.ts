import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  mix,
  mottle,
  noise,
  paint,
  resolve,
  rng,
  smoothstep,
} from "../../../../src/index";

export const meta = {
  name: "Fennec kit on a dune",
  description:
    "A fennec fox kit standing alert on a little sand dune at dusk: huge peach-lined satin ears, cream fur warming to gold along the back, a fluffy tail with a black tip, big dark eyes with glints, oversized paws, and a woven leather collar with a brass bell.",
};

// Palette: warm fur, peach ear linings, dusky sand.
const GOLD = "#e3a460";
const GOLD_DEEP = "#c77d40";
const CREAM = "#f7e6cb";
const PAW = "#f3dcbc";
const PEACH = "#f6c3a0";
const PEACH_LIGHT = "#fde2cb";
const EAR_BACK = "#d4955d";
const INK = "#1d1310";
const BRASS = "#dcb456";
const LEATHER_A = "#7d4c2c";
const LEATHER_B = "#58331d";
const SAND = "#eab77a";
const SAND_DEEP = "#d8985f";
const DUSK_MAUVE = "#8f6373";
const PEBBLES = ["#5e4342", "#7d5b4f", "#3f2d2d"];

// Fur: mottled gold on the back, cream underneath.
const fur = mottle(GOLD, GOLD_DEEP, { size: 0.045, seed: 2 });
const coat = countershade(fur, CREAM, { level: 0.1, soft: 0.6 });

// Ears: pale peach on the front (the lining), sand on the back.
const lining = paint((_p, n, s) =>
  n.z < -0.05 ? EAR_BACK : mix(PEACH, PEACH_LIGHT, smoothstep(0.02, 0.15, s[1])),
);

// Tail: fur, with a ragged black smudge at the tip.
const tailFur = paint((p, n, s) => {
  const edge = s[0] + 0.05 * (noise(p, 0.05, 4) - 0.5);
  return mix(resolve(coat, p, n), INK, smoothstep(0.86, 0.96, edge));
});

// Collar: a two-tone woven check round the loop.
const weave = paint((_p, _n, s) =>
  (Math.floor(s[0] * 40) + Math.floor(s[1] / 45)) % 2 === 0 ? LEATHER_A : LEATHER_B,
);

// Dune: sunlit sand on top, dusky mauve down the sides.
const dune = countershade(mottle(SAND, SAND_DEEP, { size: 0.06, seed: 5 }), DUSK_MAUVE, {
  level: 0.45,
  soft: 0.35,
});

/** A dune's half-profile (radius, height) in metres, scaled. */
const duneProfile = (scale: number, height: number) =>
  [
    [0, 0],
    [0.5, 0],
    [0.47, 0.01],
    [0.4, 0.03],
    [0.3, 0.058],
    [0.2, 0.077],
    [0.1, 0.086],
    [0, 0.088],
  ].map(([x, y]) => [x * scale, y * height]);

export default function fennecKit() {
  const b = createBuilder({ name: "fennec-kit", detail: 1, paintSize: 1024 });

  // Ground: a root joint under the dunes. The near dune carries the fox; the far one is a smaller dune behind.
  b.joint("root", { at: [0, 0, 0] });
  const near = b.lathe(duneProfile(1, 1), {
    color: dune,
    at: [0, 0, 0],
    bone: "root",
    segments: 18,
    name: "dune",
  });
  b.lathe(duneProfile(0.6, 0.6), {
    color: dune,
    at: [-0.32, 0, -0.3],
    bone: "root",
    segments: 12,
    name: "duneBack",
  });

  // Spine: hips (on the root) to chest.
  const spine = b.chain(
    "spine",
    [
      [0, 0.27, -0.1],
      [0, 0.285, -0.01],
      [0, 0.3, 0.07],
    ],
    { parent: "root", names: ["hips", "waist", "chest"], role: "spine" },
  );
  b.sweep(
    spine,
    (t: number): [number, number] => [
      0.05 + 0.007 * Math.sin(Math.PI * t),
      0.056 + 0.004 * Math.sin(Math.PI * t),
    ],
    { color: coat, name: "torso", sides: 12 },
  );

  // Legs, paws and toes. Hind legs bend digitigrade: knee forward, hock back.
  for (const sx of [1, -1]) {
    const s = sx > 0 ? "L" : "R";
    const x = 0.05 * sx;

    const hind = b.chain(
      `hind${s}`,
      [
        [x, 0.255, -0.1],
        [x, 0.165, -0.06],
        [x, 0.12, -0.13],
      ],
      { parent: "hips", names: [`hip${s}`, `knee${s}`, `hock${s}`], role: "leg" },
    );
    b.sweep(hind, (t: number) => 0.03 - 0.014 * t, { color: coat, name: `hind${s}`, sides: 10 });

    const fore = b.chain(
      `fore${s}`,
      [
        [x, 0.265, 0.06],
        [1.1 * x, 0.18, 0.085],
        [x, 0.12, 0.1],
      ],
      { parent: "chest", names: [`shoulder${s}`, `elbow${s}`, `wrist${s}`], role: "leg" },
    );
    b.sweep(fore, (t: number) => 0.019 - 0.007 * t, { color: coat, name: `fore${s}`, sides: 10 });

    // Oversized paws, each with three toes.
    b.part(new THREE.SphereGeometry(0.03, 12, 8), PAW, {
      at: [x, 0.1, 0.125],
      bone: `wrist${s}`,
      scale: [1.1, 0.55, 1.3],
      name: `pawFore${s}`,
    });
    b.part(new THREE.SphereGeometry(0.03, 12, 8), PAW, {
      at: [x, 0.1, -0.105],
      bone: `hock${s}`,
      scale: [1.1, 0.55, 1.3],
      name: `pawHind${s}`,
    });
    for (const dx of [-0.013, 0, 0.013]) {
      b.part(new THREE.SphereGeometry(0.0105, 8, 6), PAW, {
        at: [x + dx, 0.096, 0.158],
        bone: `wrist${s}`,
        name: "toe",
      });
      b.part(new THREE.SphereGeometry(0.0105, 8, 6), PAW, {
        at: [x + dx, 0.096, -0.07],
        bone: `hock${s}`,
        name: "toe",
      });
    }
  }

  // Neck, rising from the chest into the head joint.
  const neck = b.chain(
    "neck",
    [
      [0, 0.3, 0.07],
      [0, 0.33, 0.14],
      [0, 0.355, 0.19],
    ],
    { parent: "chest", names: ["neckA", "neckB", "head"], role: "neck" },
  );
  b.sweep(neck, (t: number) => 0.034 - 0.005 * t, { color: coat, name: "neck", sides: 10 });

  // Woven leather collar, a closed loop round the neck.
  const ringPoints: number[][] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ringPoints.push([0.037 * Math.cos(a), 0.312 + 0.037 * Math.sin(a) * 0.919, 0.098 - 0.037 * Math.sin(a) * 0.394]);
  }
  b.sweep(catmull(ringPoints, { closed: true }), 0.0068, {
    color: weave,
    name: "collar",
    sides: 8,
    bone: "neckA",
  });

  // Brass bell hanging from the collar's underside.
  b.lathe(
    [
      [0, 0.008],
      [0.004, 0.007],
      [0.0095, 0.0005],
      [0.0115, -0.007],
      [0.0125, -0.013],
      [0, -0.013],
    ],
    { color: BRASS, at: [0, 0.283, 0.118], bone: "neckA", segments: 10, name: "bell" },
  );

  // Head: a loft from the back of the skull to the nose, on the head joint.
  const head = b.loft(
    [
      { at: [0, 0.358, 0.175], w: 0.072, h: 0.078 },
      { at: [0, 0.362, 0.2], w: 0.096, h: 0.1 },
      { at: [0, 0.358, 0.236], w: 0.085, h: 0.086 },
      { at: [0, 0.35, 0.27], w: 0.06, h: 0.056 },
      { at: [0, 0.345, 0.3], w: 0.04, h: 0.04 },
      { at: [0, 0.343, 0.318], w: 0.02, h: 0.02 },
    ],
    { color: coat, bone: "head", name: "skull", sides: 12 },
  );

  // Lower jaw on its own joint, under the muzzle.
  b.joint("jaw", { parent: "head", at: [0, 0.325, 0.215], dir: [0, 0, 1], role: "jaw" });
  b.loft(
    [
      { at: [0, 0.322, 0.218], w: 0.05, h: 0.034 },
      { at: [0, 0.317, 0.27], w: 0.044, h: 0.026 },
      { at: [0, 0.315, 0.305], w: 0.03, h: 0.02 },
      { at: [0, 0.316, 0.322], w: 0.014, h: 0.014 },
    ],
    { color: CREAM, bone: "jaw", name: "jawLower", sides: 10 },
  );

  // Nose and whiskers.
  b.part(new THREE.SphereGeometry(0.0125, 12, 8), INK, {
    at: [0, 0.343, 0.322],
    bone: "head",
    scale: [1.25, 0.8, 0.95],
    name: "nose",
  });
  for (const sx of [1, -1]) {
    b.rod([sx * 0.016, 0.347, 0.305], [sx * 0.11, 0.342, 0.345], 0.0014, {
      color: "#fff4e2",
      bone: "head",
      name: "whisker",
    });
    b.rod([sx * 0.016, 0.339, 0.31], [sx * 0.1, 0.328, 0.35], 0.0014, {
      color: "#fff4e2",
      bone: "head",
      name: "whisker",
    });
  }

  // Big dark eyes, seated on the skull with a white glint each.
  const skull = b.surface(head);
  for (const sx of [1, -1]) {
    const hit = skull.nearest([sx * 0.042, 0.362, 0.212]);
    const eye = b.stick(new THREE.SphereGeometry(0.019, 14, 10), INK, hit, {
      embed: 0.35,
      name: sx > 0 ? "eyeL" : "eyeR",
    });
    const glint = eye.at.addScaledVector(eye.axis, 0.017).add(new THREE.Vector3(0, 0.006, 0.006));
    b.part(new THREE.SphereGeometry(0.0045, 8, 6), "#ffffff", { at: glint, bone: "head", name: "glint" });
  }

  // Ears: satin extrusions on their own joints, leaning out, with peach linings on the front.
  for (const sx of [1, -1]) {
    const s = sx > 0 ? "L" : "R";
    const base: [number, number, number] = [sx * 0.035, 0.385, 0.19];
    b.joint(`ear${s}`, { parent: "head", at: base, dir: [sx * 0.22, 1, 0.12] });
    b.extrude(
      [
        [-0.055, 0, "sharp"],
        [0.055, 0, "sharp"],
        [0.06, 0.07],
        [0.04, 0.135],
        [0, 0.158],
        [-0.04, 0.135],
        [-0.06, 0.07],
      ],
      {
        color: lining,
        at: base,
        x: [1, -sx * 0.22, 0],
        y: [sx * 0.22, 1, 0.12],
        thickness: [0.016, 0.006],
        bevel: 0.004,
        smoothing: 2,
        bone: `ear${s}`,
        name: `ear${s}`,
      },
    );
  }

  // Fluffy tail from the hips, with a black smudge at the tip.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.27, -0.14],
      [0, 0.29, -0.26],
      [0, 0.3, -0.34],
      [0, 0.27, -0.42],
    ]),
    { parent: "hips", names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );
  b.sweep(tail, (t: number) => 0.02 + 0.03 * Math.sin(Math.PI * Math.pow(t, 0.8)), {
    color: tailFur,
    name: "tail",
    sides: 10,
  });

  // Scattered pebbles on the near dune, kept clear of the fox's feet.
  const pebbleSpots = b.surface(near).scatter(28, {
    rng: rng(7),
    minDist: 0.045,
    keepOut: (p) => Math.hypot(p.x, p.z) < 0.2,
    filter: (hit) => hit.n.y > 0.4,
  });
  pebbleSpots.forEach((hit, i) => {
    const size = 0.006 + 0.0025 * ((i * 7) % 3);
    b.stick(new THREE.DodecahedronGeometry(size, 0), PEBBLES[i % PEBBLES.length], hit, {
      embed: 0.45,
      name: "pebble",
    });
  });

  return b.root;
}
