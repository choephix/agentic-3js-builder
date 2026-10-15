import * as THREE from "three";
import { catmull, countershade, createBuilder, grain, limb, mottle, paint, rng, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gray wolf, alert",
  description:
    "A grey wolf standing alert: head high, ears up, weight forward. Chunky Warcraft-style forms, a painted grey coat, amber eyes and a studded leather collar.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const COAT_LIGHT = "#8c8579";
const COAT_DARK = "#3b3834";
const BELLY = "#ebe3d1";
const MUZZLE = "#bdb5a4";
const LEG_LIGHT = "#8f877b";
const LEG_DARK = "#36322f";
const PAW = "#2b2827";
const CLAW = "#e6dfcc";
const NOSE = "#15121a";
const IVORY = "#f4edd9";
const EAR_IN = "#d4ab91";
const LEATHER = "#4d2f1b";
const BRASS = "#d39d40";
const AMBER = "#ffb23e";
const BROW = "#2b2723";
const TIP = "#2a2725";

// Paints: a mottled grey coat with darker fur grain along the body, countershaded to a cream belly.
const BACK = grain(mottle(COAT_LIGHT, COAT_DARK, { size: 0.14, seed: 4 }), COAT_DARK, { size: 0.012, axis: "z" });
const COAT = countershade(BACK, BELLY, { level: -0.2, soft: 0.4 });
const MUZZ = countershade(MUZZLE, BELLY, { level: -0.35, soft: 0.3 });
const LEG = countershade(LEG_LIGHT, LEG_DARK, { level: -0.2, soft: 0.3 });

// ---------------------------------------------------------------------------------------------------------------
// Drawings

/** Amber eye with a dark round pupil, a hard highlight and a heavy lid line. */
const EYE = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 22 Q32 -2 62 22 Q32 38 2 22Z" fill="#14100c"/>
    <path d="M6 20 Q32 4 58 20 Q32 34 6 20Z" fill="#f4b93d"/>
    <path d="M6 20 Q32 22 58 20 Q32 34 6 20Z" fill="#c9781e"/>
    <ellipse cx="32" cy="20" rx="7.5" ry="10.5" fill="#0b0809"/>
    <circle cx="37" cy="14" r="3" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

/** A tapered fur tuft: grey body, dark outline, a pale guard-hair stroke. */
const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 63 C4 46 4 24 14 2 C20 22 30 40 16 63Z" fill="#8d857a" stroke="#2c2927" stroke-width="2" stroke-linejoin="round"/>
    <path d="M16 58 C12 42 13 26 16 14" fill="none" stroke="#e6dccb" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Helpers

/** Linear profile over keyed rows `[t, ...values]`, sorted by t. */
function profile(keys: number[][]) {
  return (t: number): number[] => {
    const last = keys.length - 1;
    if (t <= keys[0][0]) return keys[0].slice(1);
    for (let i = 1; i <= last; i++) {
      const [t0, ...v0] = keys[i - 1];
      const [t1, ...v1] = keys[i];
      if (t <= t1) {
        const u = (t - t0) / (t1 - t0);
        return v0.map((v, j) => v + (v1[j] - v) * u);
      }
    }
    return keys[last].slice(1);
  };
}

const bodyR = profile([
  [0, 0.13, 0.12],
  [0.3, 0.13, 0.12],
  [0.7, 0.15, 0.15],
  [1, 0.12, 0.13],
]);
const neckR = profile([
  [0, 0.1, 0.1],
  [1, 0.075, 0.072],
]);
const muzzleR = profile([
  [0, 0.075, 0.07],
  [0.5, 0.05, 0.045],
  [1, 0.03, 0.03],
]);
const legR = profile([
  [0, 0.066],
  [1, 0.038],
]);
const tailR = profile([
  [0, 0.05],
  [0.4, 0.075],
  [0.85, 0.07],
  [1, 0.035],
]);

// ---------------------------------------------------------------------------------------------------------------
// The wolf

export default function build() {
  const b = createBuilder({ name: "gray wolf" });

  // Skeleton: hips at the rump, the spine forward to the withers, the neck up to the head.
  const hips = b.joint("hips", { at: [0, 0.7, -0.5], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.7, -0.5],
      [0, 0.7, -0.2],
      [0, 0.72, 0.1],
      [0, 0.74, 0.34],
    ]),
    { parent: hips, names: ["spineA", "spineB", "spineC"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.74, 0.34],
      [0, 0.9, 0.44],
      [0, 0.99, 0.53],
    ]),
    { parent: spine, names: ["neckA", "neckB"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.05, 0.63], aim: [0, 1.12, 1.7], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.02, up: -0.07 }),
    aim: head.local({ forward: 0.25, up: -0.09 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.7, -0.5],
      [0, 0.7, -0.78],
      [0, 0.66, -1.0],
      [0, 0.6, -1.08],
    ]),
    { parent: hips, role: "tail" },
  );

  // Torso: one tube over the spine, countershaded, with a slight belly drop.
  const body = b.sweep(spine, (t) => bodyR(t) as [number, number], {
    color: COAT,
    shift: () => [0, -0.02] as [number, number],
    name: "torso",
  });

  // Neck: a tapered tube that bends with the spine and neck joints.
  const neckTube = b.sweep(neck, (t) => neckR(t) as [number, number], { color: COAT, name: "neck" });

  // Head: a chunky skull, cheek bulk, a long muzzle with a separate lower jaw.
  const skull = b.part(new THREE.SphereGeometry(0.13, 14, 10).scale(0.92, 0.9, 1.08), COAT, {
    bone: head,
    at: head.at,
    name: "skull",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.06, 10, 8), COAT, {
      bone: head,
      at: head.local({ left: s * 0.07, up: -0.04, forward: 0.03 }),
      name: "cheek",
    });
  }
  b.sweep(
    catmull([
      head.local({ forward: 0.02, up: -0.03 }),
      head.local({ forward: 0.13, up: -0.05 }),
      head.local({ forward: 0.24, up: -0.06 }),
    ]),
    (t) => muzzleR(t) as [number, number],
    { bone: head, color: MUZZ, name: "muzzle" },
  );
  b.sweep(
    catmull([jaw.at, head.local({ forward: 0.12, up: -0.085 }), head.local({ forward: 0.2, up: -0.085 })]),
    (t) => [0.03 - 0.008 * t, 0.024 - 0.006 * t] as [number, number],
    { bone: jaw, color: MUZZ, name: "jaw" },
  );
  b.part(new THREE.SphereGeometry(0.032, 10, 8).scale(1.25, 0.85, 0.95), NOSE, {
    bone: head,
    at: head.local({ forward: 0.25, up: -0.035 }),
    name: "nose",
  });
  for (const s of [1, -1]) {
    // Fangs hang from the upper jaw.
    b.spike(head.local({ left: s * 0.022, forward: 0.17, up: -0.045 }), [0, -1, 0.05], 0.035, 0.0065, {
      color: IVORY,
    });
    // Heavy brow ridges.
    b.sweep(
      catmull([
        head.local({ left: s * 0.03, up: 0.09, forward: 0.1 }),
        head.local({ left: s * 0.075, up: 0.085, forward: 0.08 }),
      ]),
      0.014,
      { bone: head, color: BROW, name: "brow" },
    );
  }

  // Eyes: amber drawings conformed onto the skull, glowing.
  for (const s of [1, -1]) {
    const eye = b.decal(skull, EYE, {
      at: head.local({ left: s * 0.065, up: 0.03, forward: 0.115 }),
      dir: [s * 0.35, 0.05, 1],
      size: [0.07, 0.044],
      mirror: s > 0,
      name: "eye",
    });
    glow(eye, 1.3);
  }

  // Ears: upright, pointed, pale inside.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.045, 0],
        [0.05, 0],
        [0.036, 0.08],
        [0.004, 0.12, "sharp"],
        [-0.03, 0.09],
      ],
      {
        at: head.local({ left: s * 0.06, up: 0.08, forward: -0.03 }),
        x: [s, 0, 0],
        thickness: 0.022,
        bevel: 0.004,
        smoothing: 1,
        bone: head,
        color: paint((_p, _n, uv) => (Math.abs(uv[0]) < 0.02 && uv[1] > 0.02 ? EAR_IN : COAT)),
        name: "ear",
      },
    );
  }

  // Legs: front legs straight under the withers, hind legs digitigrade with the stifle forward and hock back.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // Front leg.
    const fRoot: [number, number, number] = [s * 0.11, 0.66, 0.26];
    const fPts = limb(fRoot, [s * 0.12, 0.03, 0.3], [0.32, 0.32], [[0, 0, -1]]);
    const fore = b.chain(`foreF${S}`, fPts, {
      parent: spine,
      names: [`upperF${S}`, `elbowF${S}`, `pawF${S}`],
      role: "leg",
    });
    b.sweep(fore, (t) => legR(t)[0], { color: LEG, name: `legF${S}` });
    const fPaw = fore.tip ?? fore.joints[fore.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.06, 10, 8).scale(0.95, 0.55, 1.35), PAW, {
      bone: fPaw,
      at: fPaw.at,
      name: `pawF${S}`,
    });
    for (const dx of [-0.02, 0, 0.02]) {
      b.spike(fPaw.local({ left: dx, forward: 0.045, down: 0.012 }), [0, -0.55, 1], 0.03, 0.0065, { color: CLAW });
    }

    // Hind leg.
    const hRoot: [number, number, number] = [s * 0.11, 0.66, -0.48];
    const hPts = limb(hRoot, [s * 0.11, 0.03, -0.46], [0.3, 0.36, 0.16], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hind = b.chain(`hind${S}`, hPts, {
      parent: hips,
      names: [`thigh${S}`, `stifle${S}`, `hock${S}`, `pawH${S}`],
      role: "leg",
    });
    b.sweep(hind, (t) => legR(t)[0], { color: LEG, name: `legH${S}` });
    const hPaw = hind.tip ?? hind.joints[hind.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.058, 10, 8).scale(0.95, 0.55, 1.35), PAW, {
      bone: hPaw,
      at: hPaw.at,
      name: `pawH${S}`,
    });
    for (const dx of [-0.02, 0, 0.02]) {
      b.spike(hPaw.local({ left: dx, forward: 0.045, down: 0.012 }), [0, -0.55, 1], 0.03, 0.0065, { color: CLAW });
    }
  }

  // Tail: held level, bushy, with a dark tip.
  b.sweep(tail, (t) => tailR(t)[0], {
    color: COAT,
    bands: [
      [0.8, COAT],
      [1, TIP],
    ],
    name: "tail",
  });

  // Collar: a leather band round the neck with brass studs and a glowing amber gem at the front.
  const neckSkin = b.surface(neckTube);
  const ring = neckSkin.loop(neck.at(0.3), { lift: 0.012 });
  const collar = b.sweep(ring, 0.014, { color: LEATHER, name: "collar" });
  b.along(ring, 14, (at) => {
    b.stick(new THREE.SphereGeometry(0.008, 6, 4), BRASS, at, { embed: 0.35, name: "stud" });
  });
  const collarSkin = b.surface(collar);
  const front = neck.at(0.3).local({ forward: 0.13 });
  const gemHit = collarSkin.nearest(front);
  glow(
    b.stick(new THREE.OctahedronGeometry(0.02, 0).scale(0.8, 1.2, 0.6), AMBER, gemHit, {
      embed: 0.3,
      name: "gem",
    }),
    1.6,
  );

  // Fur: tufts over the chest and neck, a standing mane along the top, and a ruff hanging from the cheeks.
  const furHits = b.surface([body, neckTube]).scatter(110, {
    rng: rng(11),
    minDist: 0.03,
    filter: (h) => h.at.z > 0.1 && h.n.y > -0.35,
  });
  b.cards(furHits, TUFT, { size: [0.05, 0.1], lean: 55, flow: [0, 0.3, -1], vary: 0.25, rng: rng(12) });

  const maneHits = b.surface([neckTube, body]).scatter(40, {
    rng: rng(31),
    minDist: 0.035,
    filter: (h) => h.n.y > 0.55 && h.at.z > -0.1,
  });
  b.cards(maneHits, TUFT, { size: [0.05, 0.12], lean: 35, flow: [0, 1, -0.5], vary: 0.2, rng: rng(32) });

  const cheekHits = b.surface(skull).scatter(14, {
    rng: rng(21),
    minDist: 0.04,
    filter: (h) => Math.abs(h.n.x) > 0.5 && h.n.y < 0.2 && h.n.z < 0.6,
  });
  b.cards(cheekHits, TUFT, { size: [0.045, 0.085], lean: 65, flow: [0, -1, -0.2], vary: 0.2, rng: rng(22) });

  return b.root;
}
