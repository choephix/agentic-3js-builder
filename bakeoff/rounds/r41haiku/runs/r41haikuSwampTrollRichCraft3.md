```ts
import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  frame,
  grain,
  limb,
  mottle,
  paint,
  rng,
  stripes,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "swamp-troll",
  description: "A hulking swamp troll with tusks, a red mohawk, moss, and bone fetishes on a cord. Stylised, Warcraft-like.",
};

const TAU = Math.PI * 2;

// Scale constants: one number per feature, reused for every position that belongs to it.
const HEAD_R = 0.27; // head radius
const HEAD_Y = 2.05; // head centre height
const HEAD_Z = 0.12; // head centre forward offset
const SHOULDER_Y = 1.6;
const SHOULDER_X = 0.36;

// Palette
const SKIN = countershade(mottle("#6f9058", "#3a5a40", { size: 0.2, seed: 3 }), "#c7b77e", { level: -0.25 });
const MUD = "#3d3424";
const BELOW = paint((p) => (p.y < 0.18 ? MUD : SKIN));
const BONE = "#e7dcc0";
const TUSK = "#f4ead2";
const ROPE = "#5b3a22";
const TOENAIL = "#2b2418";
const MOSS = "#4d7d2c";
const CLOTH = stripes("#4a2f1c", "#b8862e", { size: 0.11, axis: "x", seed: 2 });
const MOHAWK = grain("#7e1f16", "#e0582a", { size: 0.03, axis: "y", seed: 5 });
const LEATHER = "#3b2a1c";
const BAG = "#6b4a2a";

// Drawings
const EYE = svg(
  `<svg viewBox="0 0 60 40">
    <ellipse cx="30" cy="20" rx="28" ry="18" fill="#2a1a0c"/>
    <ellipse cx="30" cy="20" rx="22" ry="13" fill="#ffb21e"/>
    <ellipse cx="30" cy="22" rx="20" ry="8" fill="#e8741a"/>
    <ellipse cx="30" cy="20" rx="5" ry="12" fill="#120a04"/>
    <ellipse cx="23" cy="14" rx="3" ry="2" fill="#fff6c8"/>
  </svg>`,
  { size: 256 },
);

const STRANDS = svg(
  `<svg viewBox="0 0 40 100">
    <path d="M8 0 Q2 40 10 100" stroke="#4d7d2c" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M20 0 Q14 50 22 92" stroke="#63963a" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M31 0 Q28 35 34 78" stroke="#3d6622" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M14 10 Q8 60 16 96" stroke="#8fbe5a" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "swamp-troll" });
  const r = rng(11);

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.0, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.0, 0],
      [0, 1.38, 0.02],
      [0, 1.74, 0.05],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.74, 0.05],
      [0, 1.9, 0.09],
      [0, 2.0, 0.12],
    ]),
    { parent: spine.joints[1], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, HEAD_Y - 0.01, HEAD_Z],
    aim: [0, 2.3, 0.2],
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.9, 0.22], aim: [0, 1.84, 0.32], role: "jaw" });

  // ---------------------------------------------------------------- torso and belly
  const torso = b.loft(
    [
      { at: [0, 0.98, 0.0], w: 0.46, h: 0.4 },
      { at: [0, 1.25, 0.02], w: 0.58, h: 0.46 },
      { at: [0, 1.5, 0.03], w: 0.7, h: 0.5 },
      { at: [0, 1.72, 0.04], w: 0.6, h: 0.46 },
    ],
    { bone: spine, color: SKIN },
  );
  // Big pot belly, a readable Warcraft silhouette.
  b.part(new THREE.SphereGeometry(0.22, 12, 9), SKIN, {
    bone: spine.joints[0],
    at: [0, 1.22, 0.14],
    scale: [1.1, 0.9, 0.85],
  });

  // Loincloth with ragged hem and banded cloth.
  b.extrude(
    [
      [-0.17, 0.0],
      [0.17, 0.0],
      [0.2, -0.3],
      [0.0, -0.42, "sharp"],
      [-0.2, -0.3],
    ],
    { at: [0, 1.04, 0.2], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.025, color: CLOTH, bone: spine.joints[0] },
  );
  // A belt with a bone buckle.
  b.sweep(
    catmull(
      [
        [-0.24, 1.07, 0.04],
        [0, 1.05, 0.25],
        [0.24, 1.07, 0.04],
        [0, 1.1, -0.17],
      ],
      { closed: true },
    ),
    0.018,
    { color: LEATHER, bone: spine.joints[0] },
  );
  b.part(new THREE.BoxGeometry(0.06, 0.06, 0.02), BONE, { bone: spine.joints[0], at: [0, 1.06, 0.245] });

  // ---------------------------------------------------------------- neck and head
  b.sweep(
    catmull([
      [0, 1.74, 0.05],
      [0, 1.9, 0.09],
      [0, 2.0, 0.12],
    ]),
    [0.1, 0.085],
    { color: SKIN, bone: neck },
  );

  const skull = b.part(new THREE.SphereGeometry(HEAD_R, 14, 10), SKIN, {
    bone: head,
    at: [0, HEAD_Y, HEAD_Z],
    scale: [1, 0.92, 1.08],
  });

  // Heavy brow ridge, tilted to scowl.
  b.part(new THREE.BoxGeometry(0.4, 0.08, 0.12), SKIN, {
    bone: head,
    at: [0, 2.14, 0.36],
    rotation: [-12, 0, 0],
  });
  // Broad flat nose.
  b.part(new THREE.SphereGeometry(0.06, 8, 6), SKIN, { bone: head, at: [0, 1.99, 0.4], scale: [1.3, 1, 0.9] });

  // Lower jaw, a separate piece so it can open.
  b.part(new THREE.BoxGeometry(0.26, 0.09, 0.24), SKIN, { bone: jaw, at: [0, 1.93, 0.3] });

  // Tusks curl up from the lower jaw.
  for (const s of [1, -1]) {
    b.spike([s * 0.1, 1.96, 0.44], [s * 0.05, 1, 0.12], 0.14, 0.03, { color: TUSK, bone: jaw });
  }

  // Pointed ears sticking out sideways.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.06, 0],
        [0.08, 0],
        [0.02, 0.24, "sharp"],
      ],
      { at: [s * 0.25, 2.08, 0.1], x: [0, 1, 0], y: [s, 0, 0], thickness: [0.035, 0.01], color: SKIN, bone: head },
    );
  }

  // Glowing eyes: drawings on the skull.
  for (const s of [1, -1]) {
    b.decal(skull, EYE, {
      at: [s * 0.1, 2.09, 0.4],
      dir: [0, 0, 1],
      size: [0.1, 0.066],
      mirror: s < 0,
    });
  }

  // Mohawk: a tall blade of red-orange drawn across the crown, plus tufts.
  b.extrude(
    [
      [-0.24, 0],
      [0.2, 0],
      [0.26, 0.04],
      [0.1, 0.2],
      [-0.02, 0.26, "sharp"],
      [-0.16, 0.16],
      [-0.24, 0.05],
    ],
    { at: [0, 2.2, 0.0], x: [0, 0, 1], y: [0, 1, 0], thickness: [0.1, 0.03], color: MOHAWK, bone: head },
  );
  for (const z of [-0.12, 0.04, 0.2]) {
    b.spike([0, 2.38, z], [0, 1, 0], 0.09, 0.022, { color: MOHAWK, bone: head });
  }

  // Warts and moss on the crown of the skull.
  for (const hit of b
    .surface(skull)
    .scatter(14, { rng: r, minDist: 0.07, filter: (h) => h.n.y > 0.35 && h.n.z < 0.6 })) {
    b.stick(new THREE.SphereGeometry(0.012, 5, 4), "#2f4a2a", hit, { embed: 0.5 });
  }

  // ---------------------------------------------------------------- necklace of bone fetishes
  const necklacePts: [number, number, number][] = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU;
    necklacePts.push([Math.sin(a) * 0.15, 1.8, 0.07 + Math.cos(a) * 0.12]);
  }
  b.sweep(catmull(necklacePts, { closed: true }), 0.014, { color: ROPE, bone: neck });

  const charm = (p: [number, number, number], len: number, rad: number) => {
    const to: [number, number, number] = [p[0], p[1] - len, p[2]];
    b.capsule(p, to, rad, BONE);
    b.part(new THREE.SphereGeometry(rad * 1.8, 6, 4), BONE, { at: to });
  };
  // Hanging bones at front-facing necklace points.
  const pendants: [number, number][] = [
    [-0.9, 0.2],
    [-0.4, 0.22],
    [0.0, 0.26],
    [0.45, 0.2],
    [0.9, 0.18],
  ];
  for (const [a, len] of pendants) {
    const p: [number, number, number] = [Math.sin(a) * 0.15, 1.8, 0.07 + Math.cos(a) * 0.12];
    charm(p, len, 0.014);
  }
  // A small skull fetish with dark eye sockets.
  {
    const p: [number, number, number] = [0.0, 1.8, 0.19];
    const skullAt: [number, number, number] = [p[0], p[1] - 0.2, p[2] + 0.02];
    b.capsule(p, [p[0], p[1] - 0.12, p[2]], 0.01, ROPE);
    b.part(new THREE.SphereGeometry(0.045, 8, 6), BONE, { at: skullAt, scale: [1, 1.05, 0.9] });
    for (const s of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.012, 4, 3), "#1a140e", {
        at: [skullAt[0] + s * 0.02, skullAt[1] + 0.005, skullAt[2] + 0.035],
      });
    }
  }
  // A leather pouch of charms.
  b.part(new THREE.BoxGeometry(0.07, 0.08, 0.05), BAG, { at: [0.2, 1.62, 0.2], rotation: [0, 0, -8] });
  b.capsule([0.18, 1.7, 0.14], [0.2, 1.66, 0.19], 0.008, ROPE);

  // ---------------------------------------------------------------- shoulders, arms, legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // Heavy shoulder pads of skin, big and readable.
    b.part(new THREE.SphereGeometry(0.15, 10, 8), SKIN, {
      bone: spine.joints[1],
      at: [s * (SHOULDER_X + 0.02), SHOULDER_Y + 0.02, 0.02],
      scale: [1.1, 0.95, 1],
    });

    // Arm: shoulder, elbow forward, wrist at fist height.
    const shoulder: [number, number, number] = [s * SHOULDER_X, SHOULDER_Y, 0.03];
    const fist: [number, number, number] = [s * 0.42, 1.0, 0.42];
    const armPts = limb(shoulder, fist, [0.36, 0.34], [0, 0, 1]);
    const arm = b.chain(`arm${S}`, armPts, {
      parent: spine.joints[1],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.085, 0.06], { color: SKIN });

    // Chunky fist with knuckle ridge.
    b.part(new THREE.BoxGeometry(0.17, 0.19, 0.16), SKIN, { bone: arm.tip, at: [s * 0.42, 0.98, 0.45] });
    b.part(new THREE.BoxGeometry(0.19, 0.04, 0.05), SKIN, { bone: arm.tip, at: [s * 0.42, 1.08, 0.5] });

    // Leg: hip, forward knee, ankle on the floor.
    const hip: [number, number, number] = [s * 0.2, 1.0, 0];
    const foot: [number, number, number] = [s * 0.22, 0.13, 0.06];
    const legPts = limb(hip, foot, [0.46, 0.44], [0, 0, 1]);
    const leg = b.chain(`leg${S}`, legPts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    b.sweep(leg, [0.11, 0.075], { color: SKIN });

    // Big flat foot with three forward toes and claws.
    b.part(new THREE.BoxGeometry(0.2, 0.12, 0.34), BELOW, { bone: leg.tip, at: [s * 0.22, 0.07, 0.14] });
    for (const k of [-1, 0, 1]) {
      const tx = s * 0.22 + k * 0.062;
      b.part(new THREE.SphereGeometry(0.046, 6, 4), SKIN, { bone: leg.tip, at: [tx, 0.05, 0.3] });
      b.spike([tx, 0.06, 0.32], [0, -0.3, 1], 0.06, 0.012, { color: TOENAIL, bone: leg.tip });
    }

    // Hanging moss strands off each shoulder.
    b.cards(
      [frame([s * 0.3, 1.7, -0.12], [0, 1, 0]), frame([s * 0.2, 1.62, -0.16], [0, 1, 0])],
      STRANDS,
      { size: [0.08, 0.32], lean: 180, color: MOSS },
    );
  }

  // ---------------------------------------------------------------- swamp moss clumps on the torso
  for (const hit of b.surface(torso).scatter(40, { rng: r, minDist: 0.09, filter: (h) => h.n.y > 0.2 })) {
    b.stick(new THREE.ConeGeometry(0.035, 0.12, 5), MOSS, hit, { embed: 0.3 });
  }

  // Short bone spikes through the forearms, the troll's fetish.
  b.spike([0.36, 1.24, 0.12], [0.1, 0.4, 1], 0.1, 0.012, { color: BONE, bone: spine.joints[1] });
  b.spike([-0.36, 1.24, 0.12], [-0.1, 0.4, 1], 0.1, 0.012, { color: BONE, bone: spine.joints[1] });

  return b.root;
}
```