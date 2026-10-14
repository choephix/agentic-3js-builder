```ts
import * as THREE from "three";
import { catmull, createBuilder, grain, mix, mottle, noise, paint, rng, smoothstep, spots } from "agentic-3js-builder";

export const meta = {
  name: "Forest spirit",
  description:
    "A tall forest spirit of bark and moss: a birch-mask face with glowing amber eyes, antlers hung with leaves, a mossy skirt, beard and ruff, toadstools on its trunk and a glowing heartwood gem in its chest.",
};

// Palette.
const BARK_DARK = "#3b2818";
const BARK_LIGHT = "#8a6038";
const MOSS = "#7aa84a";
const MOSS_DEEP = "#2e5a2b";
const BIRCH = "#efe6cf";
const BIRCH_SHADE = "#cdbd98";
const ANTLER_DARK = "#2a1e13";
const ANTLER_LIGHT = "#5f4a33";
const GLOW = "#ffd36b";
const INK = "#241a10";
const RED = "#d8493a";
const SPOT = "#f8f2e4";
const LEAVES = ["#4d8c3a", "#8cc35a", "#c9a23c"];

// Paints: bark grain, mossy blotches, birch wood, antler wood, toadstool spots.
const bark = grain(BARK_DARK, BARK_LIGHT, { size: 0.05, axis: "y", seed: 3 });
const mossy = mottle(MOSS_DEEP, MOSS, { size: 0.1, seed: 6 });
const skirtMoss = mottle(MOSS_DEEP, "#8cc35a", { size: 0.14, seed: 9 });
const birch = grain(BIRCH, BIRCH_SHADE, { size: 0.015, axis: "y", seed: 8 });
const antlerWood = grain(ANTLER_DARK, ANTLER_LIGHT, { size: 0.02, axis: "y", seed: 12 });
const toadstool = spots(RED, SPOT, { size: 0.035, amount: 0.55, seed: 2 });

// Trunk: bark, with moss creeping over the upper surfaces and in patches.
const trunk = paint((p, n) => {
  const cover = smoothstep(0.5, 0.66, noise(p, 0.16, 4)) * 0.8 + smoothstep(0.3, 0.9, n.y) * 0.5;
  return mix(bark.at(p, n), mossy.at(p, n), Math.min(cover, 1));
});

// Head: bark, mossy on top.
const crown = paint((p, n) => mix(bark.at(p, n), mossy.at(p, n), smoothstep(0, 0.6, n.y)));

/** A card's alpha drawn into a small texture: a leaf (with a midrib) or a tapering grass strand. */
function cardTexture(width: (v: number) => number, midrib: boolean) {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const v = (y + 0.5) / size; // root 0 -> tip 1
      const u = (x + 0.5) / size; // across the card
      const half = 0.5 * width(v);
      const i = (y * size + x) * 4;
      const shade = midrib && Math.abs(u - 0.5) < 0.025 ? 170 : 255;
      data[i] = shade;
      data[i + 1] = shade;
      data[i + 2] = shade;
      data[i + 3] = Math.abs(u - 0.5) <= half ? 255 : 0;
    }
  const texture = new THREE.DataTexture(data, size, size);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}
const leafCard = cardTexture((v) => Math.sin(Math.PI * Math.pow(v, 0.8)) ** 0.9, true);
const strandCard = cardTexture((v) => Math.pow(1 - v, 0.6), false);

/** A leaf outline: a lens of `len` by `wid` centred on `c`, lying in the plane of `along` and `across`. */
function leafOutline(c: THREE.Vector3, along: THREE.Vector3, across: THREE.Vector3, len: number, wid: number) {
  const edge = (s: number, side: number) => {
    const half = (wid / 2) * Math.sin(Math.PI * Math.pow(s, 0.8));
    return c.clone().addScaledVector(along, (s - 0.5) * len).addScaledVector(across, side * half);
  };
  const n = 4;
  const pts = [edge(0, 0)];
  for (let k = 1; k < n; k++) pts.push(edge(k / n, 1));
  pts.push(edge(1, 0));
  for (let k = n - 1; k >= 1; k--) pts.push(edge(k / n, -1));
  return pts;
}

export default function forestSpirit() {
  const b = createBuilder({ name: "forest-spirit", paintSize: 2048 });
  const random = rng(11);
  const jitter = () => random() * 2 - 1;

  // Skeleton. The hips are the root; the spine climbs through the waist, chest and neck to the head.
  const hips = b.joint("hips", { at: [0, 0.92, 0], dir: [0, 1, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.98, 0],
      [0, 1.14, 0],
      [0, 1.3, 0.01],
      [0, 1.44, 0.02],
    ],
    { parent: hips, names: ["waist", "chest", "neck", "head"], role: "spine" },
  );
  const waist = spine.joints[0];
  const head = spine.joints[3];
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.5, 0.1], dir: [0, -1, 0], role: "jaw" });

  // Legs, arms, twig fingers and root feet, mirrored: L is +X, R is -X.
  for (const [k, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const leg = b.chain(
      `leg${k}`,
      [
        [0.13 * s, 0.9, 0],
        [0.14 * s, 0.5, 0.02],
        [0.14 * s, 0.1, 0],
      ],
      { parent: hips, names: [`hip${k}`, `knee${k}`, `ankle${k}`], role: "leg", contact: [0.14 * s, 0, 0.06] },
    );
    b.sweep(leg, [0.078, 0.05, 0.036], { color: bark });

    // Root feet: a tapering toe that reaches the floor, and a heel root that drives into it.
    b.capsule([0.14 * s, 0.1, 0], [0.15 * s, 0.03, 0.2], [0.05, 0.03], { color: bark, bone: `ankle${k}` });
    b.spike([0.13 * s, 0.14, -0.02], [0.2 * s, 0, -0.1], null, 0.03, { color: bark, bone: `ankle${k}` });

    const arm = b.chain(
      `arm${k}`,
      [
        [0.15 * s, 1.3, 0],
        [0.33 * s, 1.08, 0.02],
        [0.46 * s, 0.9, 0.05],
      ],
      { parent: "neck", names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`], role: "arm" },
    );
    b.sweep(arm, [0.05, 0.034, 0.026], { color: bark });

    // A moss cape hanging over each shoulder.
    b.cards(b.ring(arm.joints[0], { count: 7, radius: 0.06 }).items, strandCard, {
      size: [0.07, 0.22],
      lean: 70,
      flow: [0, -1, 0],
      bend: 15,
      vary: 0.25,
      rng: rng(20 + (s > 0 ? 1 : 2)),
      color: mossy,
    });

    // Four twig fingers per hand, each a short chain.
    const wrist = [0.46 * s, 0.9, 0.05];
    const digits = [
      [
        [0.04, -0.045, 0.02],
        [0.075, -0.075, 0.035],
      ],
      [
        [0.045, -0.05, -0.005],
        [0.085, -0.09, -0.01],
      ],
      [
        [0.035, -0.04, -0.03],
        [0.065, -0.07, -0.06],
      ],
      [
        [0.02, -0.01, 0.05],
        [0.045, -0.03, 0.09],
      ],
    ];
    digits.forEach(([near, far], i) => {
      const at = (d: number[]) => [wrist[0] + d[0] * s, wrist[1] + d[1], wrist[2] + d[2]];
      const digit = b.chain(`digit${k}${i}`, [wrist, at(near), at(far)], {
        parent: `wrist${k}`,
        names: [`d${k}${i}a`, `d${k}${i}b`, `d${k}${i}c`],
        role: "digit",
      });
      b.sweep(digit, [0.017, 0.011, 0.005], { color: bark });
    });
  }

  // Trunk: a lofted body skinned along the spine.
  b.loft(
    [
      { at: [0, 0.98, 0], w: 0.26, h: 0.2 },
      { at: [0, 1.14, 0], w: 0.27, h: 0.22 },
      { at: [0, 1.3, 0.01], w: 0.33, h: 0.25 },
      { at: [0, 1.42, 0.02], w: 0.24, h: 0.2 },
      { at: [0, 1.5, 0.02], w: 0.13, h: 0.12 },
    ],
    { color: trunk, bone: spine },
  );

  // Heartwood: a dark ring holding a faceted amber gem on the chest.
  b.part(new THREE.TorusGeometry(0.068, 0.016, 6, 12), BARK_DARK, { at: [0, 1.17, 0.125], bone: "chest" });
  b.part(new THREE.IcosahedronGeometry(0.05, 0), GLOW, { at: [0, 1.17, 0.135], bone: "chest", flat: true });

  // Toadstools growing out of the bark, each standing along its own outward axis.
  const shroom = (scale: number) =>
    [
      [0, 0],
      [0.02, 0],
      [0.014, 0.035],
      [0.012, 0.05],
      [0.04, 0.06],
      [0.062, 0.076],
      [0.05, 0.09],
      [0.024, 0.099],
      [0, 0.1],
    ].map(([r, h]) => [r * scale, h * scale]);
  const toadstools = [
    { at: [0.12, 1.03, 0.04], axis: [1, 0.2, 0.25], bone: "waist", scale: 1 },
    { at: [-0.115, 1.2, -0.05], axis: [-1, 0.35, -0.2], bone: "chest", scale: 0.7 },
    { at: [0.02, 0.97, -0.12], axis: [0.2, 0.3, -1], bone: "waist", scale: 0.55 },
    { at: [-0.1, 1.14, 0.09], axis: [-0.8, 0.3, 0.6], bone: "waist", scale: 0.45 },
  ];
  for (const m of toadstools)
    b.lathe(shroom(m.scale), { color: toadstool, at: m.at, axis: m.axis, segments: 9, bone: m.bone });

  // Head: a faceted egg of bark, with a pale birch mask and a carved chin on the jaw.
  b.lathe(
    [
      [0, -0.11],
      [0.09, -0.1],
      [0.125, -0.05],
      [0.135, 0.01],
      [0.13, 0.07],
      [0.11, 0.12],
      [0.07, 0.155],
      [0, 0.17],
    ],
    { color: crown, at: [0, 1.62, 0.02], segments: 10, bone: head },
  );
  b.extrude(
    [
      [-0.07, 0.1],
      [0.07, 0.1],
      [0.08, 0],
      [0.06, -0.05],
      [0, -0.07],
      [-0.06, -0.05],
      [-0.08, 0],
    ],
    { color: birch, at: [0, 1.62, 0.155], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, bevel: 0.008, bone: head },
  );
  b.extrude(
    [
      [-0.045, 0.035],
      [0.045, 0.035],
      [0.04, -0.01],
      [0, -0.05],
      [-0.04, -0.01],
    ],
    { color: birch, at: [0, 1.49, 0.13], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, bone: jaw },
  );
  b.slab(
    [
      [-0.03, 1.57, 0.172],
      [0.03, 1.57, 0.172],
      [0.03, 1.56, 0.172],
      [-0.03, 1.56, 0.172],
    ],
    { color: INK, thickness: 0.006, bone: head },
  );
  for (const s of [1, -1]) {
    // Heavy brows, dark eye rings and glowing amber eyes.
    b.slab(
      [
        [0.02 * s, 1.66, 0.172],
        [0.07 * s, 1.678, 0.172],
        [0.075 * s, 1.668, 0.172],
        [0.02 * s, 1.652, 0.172],
      ],
      { color: INK, thickness: 0.012, bone: head },
    );
    b.part(new THREE.TorusGeometry(0.03, 0.007, 5, 10), INK, { at: [0.042 * s, 1.63, 0.17], bone: head });
    b.part(new THREE.IcosahedronGeometry(0.02, 0), GLOW, { at: [0.042 * s, 1.63, 0.176], bone: head, flat: true });
  }

  // Antlers: each a tapering branch with two tines, and a crown of leaves.
  const branches = [
    {
      main: [
        [0.07, 1.72, -0.01],
        [0.13, 1.85, -0.03],
        [0.21, 1.97, -0.05],
        [0.27, 2.09, -0.03],
      ],
      tines: [
        [
          [0.16, 1.9, -0.04],
          [0.235, 1.96, 0.03],
        ],
        [
          [0.2, 1.99, -0.05],
          [0.17, 2.08, 0.01],
        ],
      ],
    },
    {
      main: [
        [-0.06, 1.73, 0],
        [-0.11, 1.86, 0.01],
        [-0.17, 1.98, 0],
        [-0.21, 2.1, -0.02],
      ],
      tines: [
        [
          [-0.12, 1.9, 0],
          [-0.13, 1.99, 0.07],
        ],
        [
          [-0.17, 1.98, 0],
          [-0.25, 2.03, -0.02],
        ],
      ],
    },
  ];
  for (const branch of branches) {
    b.sweep(catmull(branch.main), [0.026, 0.019, 0.011, 0.004], { color: antlerWood, bone: head });
    for (const [from, to] of branch.tines) b.rod(from, to, [0.014, 0.003], { color: antlerWood, bone: head });
  }

  // Leaves: flat lens-shaped plates hung along the antlers and over the crown.
  const crownCentre = new THREE.Vector3(0, 1.7, 0);
  const crownLeaf = (centre: THREE.Vector3, outward: THREE.Vector3, len: number, wid: number) => {
    const along = outward
      .clone()
      .add(new THREE.Vector3(jitter(), jitter(), jitter()).multiplyScalar(0.5))
      .normalize();
    const across = new THREE.Vector3(jitter(), jitter(), jitter());
    across.addScaledVector(along, -across.dot(along)).normalize();
    b.slab(leafOutline(centre, along, across, len, wid), {
      color: LEAVES[Math.floor(random() * LEAVES.length)],
      thickness: 0.004,
      bone: head,
      group: "crown",
    });
  };
  for (const branch of branches) {
    const path = catmull(branch.main);
    for (let i = 1; i <= 7; i++) {
      const centre = path.at(i / 8);
      crownLeaf(centre, centre.clone().sub(crownCentre), 0.1 + 0.03 * random(), 0.05);
    }
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const centre = new THREE.Vector3(Math.cos(a) * 0.08, 1.8, Math.sin(a) * 0.06);
    crownLeaf(centre, centre.clone().sub(crownCentre).setY(0.6), 0.09, 0.045);
  }

  // Hanging moss: a skirt from the waist, a ruff at the neck and a beard from the jaw.
  b.cards(b.ring(waist, { count: 12, radius: 0.12 }).items, leafCard, {
    size: [0.11, 0.3],
    lean: 60,
    flow: [0, -1, 0],
    bend: 25,
    vary: 0.25,
    rng: rng(5),
    color: skirtMoss,
  });
  b.cards(b.ring(head, { count: 12, radius: 0.1 }).items, strandCard, {
    size: [0.08, 0.18],
    lean: 70,
    flow: [0, -1, 0],
    bend: 15,
    vary: 0.3,
    rng: rng(7),
    color: mossy,
  });
  b.cards(b.ring(jaw, { count: 5, radius: 0.03, fromDeg: -60, toDeg: 60 }).items, strandCard, {
    size: [0.05, 0.22],
    lean: 75,
    flow: [0, -1, 0],
    bend: 15,
    vary: 0.2,
    rng: rng(9),
    color: mossy,
  });

  return b.root;
}
```