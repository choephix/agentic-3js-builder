import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { gradient, mottle, noise, paint, spots } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded red panda in a teal-and-gold collar, standing balanced on a moss-capped ancient stone with dendro crystals, mushrooms, flowers and a bamboo shoot.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const RUST = "#e8682a";
const RUST_L = "#f78f3e";
const BELLY = "#4b2a2c";
const DARK = "#34201f";
const CREAM = "#fff2dc";
const GOLD = "#f2c14e";
const PINK = "#ff9fb5";
const GREEN_STEM = "#5aa83e";

const TEAL = cel("#2bc9bd");
const COAT = cel(
  furEdge(mottle(RUST, RUST_L, { size: 0.07, seed: 4 }), BELLY, { level: -0.3, teeth: 0.25, period: 0.03 }),
);
const LEGS = cel(gradient(mottle(RUST, RUST_L, { size: 0.07, seed: 4 }), DARK, [0, 0.46, 0], [0, 0.38, 0]));
const PAW = cel(DARK);
const WHITE = cel(CREAM);
const RUSTC = cel(RUST);
const FACE = cel(
  furEdge(mottle(RUST, RUST_L, { size: 0.05, seed: 9 }), CREAM, {
    by: "position",
    axis: [0, 1, 0],
    level: 0.607,
    teeth: 0.012,
    period: 0.02,
    along: [1, 0, 0],
  }),
);
const SKZ = 0.31;
const HEADP = paint((p) => (p.z < SKZ - 0.012 + 0.012 * zigzag(p.x / 0.02) ? RUSTC : FACE));
const RING_L = "#f4803a";
const RING_D = "#b9481b";
const TAILP = cel(
  paint((p) => {
    if (p.z < -0.68) return "#3a1d18";
    const k = p.z / 0.075 + 0.3 * zigzag(p.x / 0.024);
    return (((Math.floor(k) % 2) + 2) % 2 === 0 ? RING_L : RING_D) as string;
  }),
);
const STONE = cel(mottle("#a5acba", "#8590a3", { size: 0.12, seed: 2 }));
const MOSS = cel(mottle("#7ccf4a", "#5db03c", { size: 0.06, seed: 6 }));
const STONEP = paint((p, n) => (n.y + (noise(p, 0.07, 5) - 0.5) * 0.9 > 0.38 ? MOSS : STONE));

// ---------------------------------------------------------------- textures
const TUFT = svg(`<svg viewBox="0 0 32 64"><path d="M16 0 Q30 30 28 64 L4 64 Q2 30 16 0Z" fill="#fff"/></svg>`, {
  size: 96,
});
const MOSSBLADES = svg(
  `<svg viewBox="0 0 48 48"><path d="M6 48 Q8 22 14 4 Q20 24 20 48Z" fill="#fff"/><path d="M16 48 Q22 20 26 0 Q34 22 32 48Z" fill="#fff"/><path d="M28 48 Q36 24 44 8 Q44 28 40 48Z" fill="#fff"/></svg>`,
  { size: 96 },
);
const LEAF = svg(`<svg viewBox="0 0 24 64"><path d="M12 0 Q24 32 12 64 Q0 32 12 0Z" fill="#fff"/></svg>`, { size: 96 });
const RUNE = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="none" stroke="#8dffb8" stroke-width="3"/>
  <circle cx="32" cy="32" r="19" fill="none" stroke="#8dffb8" stroke-width="2.5"/>
  <path d="M32 12 Q46 28 32 52 Q18 28 32 12Z" fill="none" stroke="#8dffb8" stroke-width="3"/>
  <path d="M32 22 L32 46 M32 34 L40 28 M32 40 L24 34" stroke="#8dffb8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M32 2 L32 8 M32 56 L32 62 M2 32 L8 32 M56 32 L62 32" stroke="#8dffb8" stroke-width="3"/></svg>`,
  { size: 256 },
);
const EYE = animeEye({ iris: "#f0a22c", brow: false });

export default function build() {
  const b = createBuilder({ name: "redPanda" });

  // ------------------------------------------------------------ skeleton
  const base = b.joint("base", { at: [0, 0.315, 0] });
  const hips = b.joint("hips", { parent: base, at: [0, 0.46, -0.2], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.46, -0.2],
      [0, 0.47, -0.09],
      [0, 0.48, 0.04],
      [0, 0.49, 0.16],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neckc",
    [
      [0, 0.49, 0.16],
      [0, 0.52, 0.22],
      [0, 0.565, 0.27],
    ],
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 0.565, 0.27], dir: [0, 0.12, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.552, 0.3], aim: [0, 0.54, 0.4], role: "jaw" });
  const tail = b.chain(
    "tail",
    [
      [0, 0.47, -0.26],
      [0, 0.5, -0.42],
      [0, 0.56, -0.58],
      [0, 0.61, -0.74],
    ],
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ------------------------------------------------------------ stone & ground
  const stone = b.lathe(
    [
      [0, 0],
      [0.36, 0],
      [0.4, 0.07],
      [0.37, 0.19],
      [0.32, 0.27],
      [0.26, 0.305],
      [0, 0.315],
    ],
    { at: [0, 0, 0], bone: base, segments: 9, spin: 12, color: STONEP, name: "stone" },
  );
  const stoneSkin = b.surface(stone);
  const rocks: Array<[number, number, number, number]> = [
    [0.43, 0.3, 0.1, 0.35],
    [-0.4, 0.34, 0.09, 1.1],
    [-0.2, -0.45, 0.11, 2.2],
    [0.3, -0.38, 0.08, 0.6],
    [0.0, 0.5, 0.07, 1.7],
  ];
  for (const [x, z, r, rot] of rocks)
    b.part(new THREE.IcosahedronGeometry(r, 0), STONEP, {
      bone: base,
      at: [x, r * 0.5, z],
      scale: [1.2, 0.75, 1],
      rotation: [0, rot * 57, 0],
      flat: true,
      name: "rock",
    });

  // glowing rune on the stone front
  glow(
    b.decal(stoneSkin, RUNE, { at: [0, 0.16, 0.4], dir: [0, 0.15, 1], size: [0.2, 0.2], bone: base, name: "rune" }),
    1.2,
  );

  // moss tufts and flowers on the stone
  const mossHits = stoneSkin.scatter(150, { rng: rng(7), minDist: 0.032, filter: (h) => h.n.y > 0.15 });
  b.cards(mossHits, MOSSBLADES, {
    size: [0.05, 0.05],
    lean: 25,
    bend: 25,
    vary: 0.4,
    spin: 180,
    rng: rng(8),
    color: "#86d853",
    bone: base,
    name: "mossA",
  });
  b.cards(stoneSkin.scatter(90, { rng: rng(17), minDist: 0.04, filter: (h) => h.n.y > 0.1 }), MOSSBLADES, {
    size: [0.04, 0.04],
    lean: 40,
    bend: 20,
    vary: 0.4,
    spin: 180,
    rng: rng(18),
    color: "#4f9a3a",
    bone: base,
    name: "mossB",
  });
  const flowerHits = stoneSkin.scatter(9, { rng: rng(21), minDist: 0.08, filter: (h) => h.n.y > 0.6 && h.at.z < 0 });
  for (const h of flowerHits) {
    const top = h.moved([0, 0.02, 0]);
    b.rod(h, top, 0.002, GREEN_STEM, { bone: base, sides: 4 });
    b.stick(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 6), PINK, top, { bone: base, embed: 0 });
    b.stick(new THREE.SphereGeometry(0.006, 6, 4), GOLD, top, { bone: base, embed: -0.8 });
  }

  // mushrooms
  const capPaint = cel(spots("#ee4a52", CREAM, { size: 0.022, amount: 0.45, seed: 3 }));
  const mushrooms: Array<[number, number, number]> = [
    [0.3, 0.34, 1],
    [-0.38, 0.27, 0.8],
    [-0.12, 0.47, 1.2],
  ];
  for (const [x, z, k] of mushrooms) {
    b.part(new THREE.CylinderGeometry(0.011 * k, 0.014 * k, 0.05 * k, 6), CREAM, {
      bone: base,
      at: [x, 0.025 * k, z],
      name: "stem",
    });
    b.lathe(
      [
        [0, 0],
        [0.035 * k, 0],
        [0.042 * k, 0.012 * k],
        [0.03 * k, 0.03 * k],
        [0, 0.038 * k],
      ],
      { at: [x, 0.046 * k, z], bone: base, segments: 8, color: capPaint, name: "cap" },
    );
  }

  // dendro crystals
  const crystals: Array<[number, number, number, number]> = [
    [0.44, -0.1, 1, 12],
    [0.48, -0.03, 0.7, -18],
    [-0.45, -0.12, 0.85, -10],
  ];
  for (const [x, z, k, tilt] of crystals)
    glow(
      b.part(new THREE.OctahedronGeometry(1, 0), "#7cf2b0", {
        bone: base,
        at: [x, 0.07 * k, z],
        scale: [0.03 * k, 0.09 * k, 0.03 * k],
        rotation: [tilt, 0, tilt],
        flat: true,
        name: "crystal",
      }),
      1.2,
    );

  // fireflies
  const flies: Array<[number, number, number]> = [
    [0.32, 0.5, 0.18],
    [-0.3, 0.55, 0.22],
    [0.25, 0.62, -0.25],
    [-0.28, 0.45, -0.3],
    [0.05, 0.7, 0.25],
    [0.38, 0.58, -0.05],
  ];
  for (const f of flies)
    glow(b.part(new THREE.SphereGeometry(0.007, 6, 4), "#d9ff7a", { bone: base, at: f, name: "firefly" }), 1.5);

  // bamboo shoot
  b.sweep(
    [
      [-0.5, 0, 0.18],
      [-0.5, 0.72, 0.18],
    ],
    0.017,
    cel("#79c95a"),
    { bone: base, caps: "flat", name: "bamboo" },
  );
  for (let k = 1; k <= 5; k++)
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.01, 8), "#4f9a3a", {
      bone: base,
      at: [-0.5, k * 0.125, 0.18],
      name: "node",
    });
  const leafFrames = Array.from({ length: 9 }, (_, i) => {
    const a = i * 2.4;
    return frame([-0.5, 0.5 + (i % 3) * 0.08, 0.18], [Math.cos(a), 0.6, Math.sin(a)]);
  });
  b.cards(leafFrames, LEAF, {
    size: [0.05, 0.16],
    lean: 55,
    bend: 25,
    flow: [0, -1, 0],
    vary: 0.25,
    rng: rng(31),
    color: "#6cc95f",
    bone: base,
    name: "bambooLeaf",
  });

  // ------------------------------------------------------------ body
  const body = b.sweep(
    spine,
    (t) => {
      const r = 0.075 + 0.02 * Math.sin(Math.PI * Math.min(t * 0.9 + 0.15, 1));
      return [r * 0.96, r];
    },
    { color: COAT, name: "body" },
  );
  const neckSw = b.sweep(neck, [0.062, 0.054], { color: COAT, name: "neck" });
  const tailSw = b.sweep(tail, [0.05, 0.07, 0.072, 0.05, 0.02], { color: TAILP, name: "tailTube" });

  // fur cards
  b.cards(body ? b.surface(body).scatter(130, { rng: rng(3), minDist: 0.03, filter: (h) => h.n.y > -0.1 }) : [], TUFT, {
    size: [0.026, 0.04],
    lean: 60,
    bend: 25,
    flow: [0, -0.2, -1],
    vary: 0.3,
    spin: 20,
    rng: rng(4),
    color: "#ff9c47",
    name: "bodyFur",
  });
  b.cards(b.surface(tailSw).scatter(110, { rng: rng(11), minDist: 0.028 }), TUFT, {
    size: [0.028, 0.045],
    lean: 60,
    bend: 20,
    flow: [0, -0.2, -1],
    vary: 0.3,
    spin: 20,
    rng: rng(12),
    color: "#f98a3a",
    name: "tailFur",
  });

  // legs
  const pawTips: Record<string, THREE.Object3D | unknown> = {};
  void pawTips;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const front = limb([s * 0.065, 0.45, 0.14], [s * 0.07, 0.335, 0.17], [0.07, 0.07], [[0, 0, -1]]);
    const fl = b.chain(`legF${side}`, front, {
      parent: spine,
      names: [`shoulder${side}`, `elbow${side}`, `pawF${side}`],
      role: "leg",
    });
    b.sweep(fl, [0.046, 0.034, 0.03], { color: LEGS, name: `armSw${side}` });
    b.part(new THREE.SphereGeometry(0.058, 8, 6), COAT, {
      bone: fl.joints[0],
      at: [s * 0.062, 0.455, 0.135],
      scale: [0.85, 1, 1.1],
      name: "shoulderMass",
    });
    const hind = limb([s * 0.07, 0.45, -0.2], [s * 0.075, 0.335, -0.22], [0.08, 0.08], [[0, 0, 1]]);
    const hl = b.chain(`legH${side}`, hind, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(hl, [0.05, 0.034, 0.03], { color: LEGS, name: `legSw${side}` });
    b.part(new THREE.SphereGeometry(0.066, 8, 6), COAT, {
      bone: hl.joints[0],
      at: [s * 0.075, 0.45, -0.2],
      scale: [0.85, 1.05, 1.15],
      name: "thighMass",
    });

    for (const [leg, x, z, len, bone] of [
      [fl, s * 0.07, 0.17, 1.2, fl.tip!],
      [hl, s * 0.075, -0.22, 1.7, hl.tip!],
    ] as const) {
      void leg;
      b.part(new THREE.SphereGeometry(0.032, 8, 6), PAW, {
        bone,
        at: [x, 0.337, z + 0.012],
        scale: [1, 0.68, len],
        name: "paw",
      });
      for (let j = -1; j <= 1; j++) {
        const tz = z + 0.012 + 0.032 * len * 0.9;
        b.part(new THREE.SphereGeometry(0.011, 6, 4), PAW, {
          bone,
          at: [x + j * 0.016, 0.327, tz],
          name: "toe",
        });
        b.spike([x + j * 0.016, 0.322, tz + 0.006], [0, -0.25, 1], 0.014, 0.004, CREAM, { bone, sides: 5 });
      }
    }
  }

  // ------------------------------------------------------------ head
  const SK: [number, number, number] = [0, 0.585, SKZ];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEADP, {
    bone: head,
    at: SK,
    scale: [0.08, 0.065, 0.07],
    name: "skull",
  });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = skin.around(SK).at(s * 34, 3);
    if (eyeHit) b.decal(skin, EYE, { at: eyeHit, size: [0.042, 0.058], mirror: s > 0 });
    // pale brow spot
    const brow = skin.around(SK).at(s * 30, 30);
    if (brow) b.stick(new THREE.SphereGeometry(0.009, 6, 4), CREAM, brow, { bone: head, scale: [1.4, 0.7, 1] });
    // tear mark
    const t1 = skin.around(SK).at(s * 36, -12);
    const t2 = skin.around(SK).at(s * 44, -42);
    if (t1 && t2) b.rod(t1.moved([0, 0.002, 0]), t2.moved([0, 0.002, 0]), [0.007, 0.004], "#c24a1f", { bone: head, sides: 5 });
  }

  // muzzle, nose, jaw
  b.part(new THREE.SphereGeometry(1, 10, 8), WHITE, {
    bone: head,
    at: [0, 0.568, 0.362],
    scale: [0.036, 0.03, 0.042],
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(0.012, 8, 6), "#1c1018", {
    bone: head,
    at: [0, 0.578, 0.402],
    scale: [1.2, 0.85, 1],
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), WHITE, {
    bone: jaw,
    at: [0, 0.537, 0.352],
    scale: [0.027, 0.013, 0.034],
    name: "lowerJaw",
  });
  for (const s of [1, -1])
    b.spike([s * 0.012, 0.545, 0.37], [0, 1, 0.1], 0.01, 0.004, CREAM, { bone: jaw, sides: 5 });

  // ears
  for (const s of [1, -1]) {
    const earOutline: Array<[number, number]> = [
      [-0.036, 0],
      [0.036, 0],
      [0.042, 0.05],
      [0, 0.088],
      [-0.042, 0.05],
    ];
    b.extrude(earOutline, {
      at: [s * 0.05, 0.62, 0.29],
      x: [1, 0, 0],
      y: [s * 0.45, 1, 0],
      thickness: 0.016,
      smoothing: 1,
      color: RUSTC,
      bone: head,
      name: "ear",
    });
    b.extrude(
      [
        [-0.024, 0.006],
        [0.024, 0.006],
        [0.026, 0.045],
        [0, 0.07],
        [-0.028, 0.045],
      ],
      {
        at: [s * 0.05, 0.62, 0.295],
        x: [1, 0, 0],
        y: [s * 0.45, 1, 0],
        thickness: 0.016,
        smoothing: 1,
        color: WHITE,
        bone: head,
        name: "earInner",
      },
    );
    // cheek tufts
    for (let j = -1; j <= 1; j++)
      b.spike([s * 0.068, 0.575 - j * 0.012, 0.33 - j * 0.01], [s, -0.3, -0.35], 0.038, 0.014, WHITE, {
        bone: head,
        sides: 5,
      });
    // whiskers
    for (let j = -1; j <= 1; j++)
      b.rod([s * 0.03, 0.565 + j * 0.008, 0.385], [s * 0.1, 0.565 + j * 0.02, 0.4], 0.0015, CREAM, {
        bone: head,
        sides: 4,
      });
  }

  // ------------------------------------------------------------ collar
  const loop1 = b.surface(neckSw).loop(neck.at(0.45), { lift: 0.006 });
  b.sweep(loop1, 0.014, TEAL, { name: "collar" });
  for (const t of [0.3, 0.6]) {
    const gl = b.surface(neckSw).loop(neck.at(t), { lift: 0.009 });
    b.sweep(gl, 0.0055, GOLD, { name: "collarTrim" });
  }
  const bellHit = b.surface(neckSw).nearest([0, 0.52, 0.33]);
  b.stick(new THREE.SphereGeometry(0.016, 8, 6), GOLD, bellHit, { embed: 0.1, name: "bell" });
  b.spike(bellHit.at.clone().add(new THREE.Vector3(0, -0.012, 0.012)), [0, -1, 0.3], 0.055, 0.009, TEAL, {
    bone: neck.joints[0],
    sides: 5,
    name: "tassel",
  });
  b.spike(bellHit.at.clone().add(new THREE.Vector3(0.008, -0.012, 0.012)), [0.3, -1, 0.3], 0.04, 0.006, GOLD, {
    bone: neck.joints[0],
    sides: 5,
    name: "tassel2",
  });
  void INK;
  void hips;

  return b.root;
}
