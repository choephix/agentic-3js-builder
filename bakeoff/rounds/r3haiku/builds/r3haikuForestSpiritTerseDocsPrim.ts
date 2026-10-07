import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  grain,
  limb,
  line,
  mottle,
  rng,
  spots,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Forest spirit",
  description:
    "A bark-and-moss forest spirit with antler branches, a leaf cloak, a leaf skirt, a carved glowing face and a glowing heart.",
};

const BARK = "#6b4a2b";
const BARK_DARK = "#3e2a18";
const BARK_LIGHT = "#8c6a45";
const MOSS = "#5e9c3a";
const MOSS_DARK = "#2f5a22";
const ANTLER = "#e9dcc0";
const MUSH = "#eadcc2";
const MUSH_SPOT = "#c4483a";
const GLOW = "#b8ff9a";

const LEAF_GREEN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48">
  <path d="M16 2 C30 14 30 34 16 46 C2 34 2 14 16 2Z" fill="#8fd65a"/>
  <path d="M16 5 L16 43" stroke="#3c6b2a" stroke-width="1.5" fill="none"/>
</svg>`;

const LEAF_GOLD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48">
  <path d="M16 2 C30 14 30 34 16 46 C2 34 2 14 16 2Z" fill="#d9a83a"/>
  <path d="M16 5 L16 43" stroke="#7a5418" stroke-width="1.5" fill="none"/>
</svg>`;

const TUFT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M16 32 Q10 16 4 10 M16 32 Q16 14 16 4 M16 32 Q22 16 28 10" stroke="#5e9c3a" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`;

const FACE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <ellipse cx="22" cy="28" rx="7" ry="5" fill="#0d1f10"/>
  <ellipse cx="42" cy="28" rx="7" ry="5" fill="#0d1f10"/>
  <ellipse cx="22" cy="28" rx="4" ry="3" fill="#b8ff9a"/>
  <ellipse cx="42" cy="28" rx="4" ry="3" fill="#b8ff9a"/>
  <path d="M14 18 Q22 13 29 19" stroke="#2a1a0c" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M35 19 Q42 13 50 18" stroke="#2a1a0c" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M26 41 Q32 46 38 41" stroke="#2a1a0c" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "forest-spirit" });

  const leafTex = [svg(LEAF_GREEN, { size: 128 }), svg(LEAF_GOLD, { size: 128 })];
  const tuftTex = svg(TUFT, { size: 96 });
  const faceTex = svg(FACE, { size: 128 });

  // Paints: moss on the back, bark underneath; grained bark on limbs.
  const coat = countershade(
    mottle(MOSS, MOSS_DARK, { size: 0.14, seed: 3 }),
    grain(BARK, BARK_DARK, { size: 0.035, axis: "y", seed: 5 }),
    { level: 0 },
  );
  const bark = grain(BARK, BARK_DARK, { size: 0.03, axis: "y", seed: 2 });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.95, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.95, 0],
      [0, 1.2, 0.01],
      [0, 1.45, 0.02],
      [0, 1.62, 0],
    ]),
    { parent: hips, names: ["waist", "chest", "shoulders"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.6, 0],
      [0, 1.74, 0.03],
      [0, 1.86, 0.05],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.93, 0.06], dir: [0, 1, 0.1], role: "head" });

  // Torso: one tube bending along the spine, flattened front-to-back.
  const torso = b.sweep(spine, (t) => [0.12 + 0.06 * Math.sin(Math.PI * t), 0.1 + 0.02 * Math.sin(Math.PI * t)], {
    color: coat,
  });

  // Limbs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Leg: hip, knee and ankle land exactly on the floor.
    const legPts = limb([s * 0.12, 0.95, 0], [s * 0.13, 0.1, 0.02], [0.44, 0.44], [[0, 0, 1]]);
    const legChain = b.chain(`leg${side}`, legPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(legChain, (t) => 0.085 - 0.03 * t, { color: bark });
    const ankle = legChain.joints[legChain.joints.length - 1];
    b.part(new THREE.BoxGeometry(0.12, 0.05, 0.24), BARK_DARK, {
      bone: ankle,
      at: ankle.local({ forward: 0.05, down: 0.075 }),
    });

    // Arm: reaching out and slightly down, with twig fingers.
    const armChain = b.chain(
      `arm${side}`,
      catmull([
        [s * 0.2, 1.5, 0],
        [s * 0.42, 1.32, 0.05],
        [s * 0.6, 1.14, 0.1],
      ]),
      { parent: spine, names: [`shoulder${side}`, `elbow${side}`, `hand${side}`], role: "arm" },
    );
    b.sweep(armChain, (t) => 0.05 - 0.015 * t, { color: BARK_LIGHT });
    const hand = armChain.joints[armChain.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.055, 8, 6), BARK_LIGHT, { bone: hand, flat: true });
    for (let i = 0; i < 3; i++) {
      b.spike(hand, [s * 0.7, -0.35 + i * 0.25, 0.25 - i * 0.25], 0.07, 0.013, {
        color: BARK_DARK,
        bone: hand,
      });
    }
  }

  // Head: a faceted skull with a carved-wood nose.
  const skull = b.part(new THREE.SphereGeometry(0.15, 12, 9), BARK_LIGHT, {
    bone: head,
    at: head.local({ up: 0.03 }),
    scale: [0.95, 1.1, 1.0],
    flat: true,
  });
  b.spike(head.local({ forward: 0.09, down: 0.02 }), [0, -0.05, 1], 0.1, 0.035, {
    color: BARK_DARK,
    bone: head,
  });

  // The face: a decal of glowing eyes and a mouth, laid on the skull.
  b.decal(head, faceTex, {
    at: head.local({ forward: 0.14, up: 0.0 }),
    dir: [0, 0, 1],
    size: [0.17, 0.17],
  });

  // Moss tufts on the crown.
  const crown = b.surface(skull).scatter(30, {
    rng: rng(11),
    minDist: 0.05,
    filter: (h) => h.n.y > 0.35,
  });
  b.cards(crown, tuftTex, {
    size: [0.05, 0.06],
    lean: 25,
    flow: [0, -1, 0],
    vary: 0.3,
    rng: rng(12),
  });

  // Antlers: branching from the skull, each with tines along the sweep.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = b.surface(head).around(head.at).at(s * 50, 55);
    if (!hit) continue;
    const stem = catmull([
      hit,
      head.local({ left: s * 0.12, up: 0.22, back: 0.02 }),
      head.local({ left: s * 0.22, up: 0.42, back: -0.06 }),
    ]);
    const antler = b.sprout(`antler${side}`, hit, stem, [0.028, 0.008], {
      count: 3,
      color: ANTLER,
    });
    b.along(antler.sweep, 3, (at) => {
      b.spike(at, at, 0.07, 0.01, { color: ANTLER });
    });
  }

  // Leaf cloak scattered over the torso, hanging down and out.
  const torsoSurf = b.surface(torso);
  const cloak = torsoSurf.scatter(70, {
    rng: rng(3),
    minDist: 0.07,
    filter: (h) => h.n.y < 0.5 && h.at.y < 1.5,
  });
  b.cards(cloak, leafTex, {
    size: [0.09, 0.13],
    lean: 55,
    flow: [0, -1, 0.1],
    bend: 25,
    vary: 0.25,
    rng: rng(4),
  });

  // Leaf skirt hanging from the waist.
  const skirt = b.ring(line([0, 1.02, 0], [0, 0.9, 0]), { count: 14, radius: 0.2 });
  b.cards(skirt.items, leafTex, {
    size: [0.13, 0.22],
    lean: 70,
    flow: [0, -1, 0],
    bend: 30,
    vary: 0.2,
    rng: rng(9),
  });

  // Moss clumps stuck on the torso.
  for (const hit of torsoSurf.scatter(16, { rng: rng(7), minDist: 0.12, filter: (h) => h.n.y > 0.3 })) {
    b.stick(new THREE.SphereGeometry(0.035, 6, 4), MOSS, hit, { embed: 0.4 });
  }

  // A glowing heart in the chest.
  const heart = torsoSurf.nearest([0, 1.33, 0.2]);
  b.stick(new THREE.IcosahedronGeometry(0.045, 0), GLOW, heart, { embed: 0.35 });

  // Turned mushrooms growing out of the bark.
  const shroomCap = spots(MUSH, MUSH_SPOT, { size: 0.03, amount: 0.35, seed: 2 });
  const shrooms: Array<[[number, number, number], number]> = [
    [[0.14, 1.05, -0.1], 1.0],
    [[-0.17, 1.4, -0.04], 0.7],
  ];
  for (const [p, k] of shrooms) {
    const at = torsoSurf.nearest(p);
    b.lathe(
      [
        [0, -0.01],
        [0.025 * k, -0.01],
        [0.02 * k, 0.04 * k],
        [0.05 * k, 0.06 * k],
        [0.09 * k, 0.075 * k],
        [0.1 * k, 0.085 * k],
        [0.095 * k, 0.095 * k],
        [0.07 * k, 0.105 * k],
        [0, 0.105 * k],
      ],
      { at, axis: at, smoothing: 1, color: shroomCap },
    );
  }

  return b.root;
}
