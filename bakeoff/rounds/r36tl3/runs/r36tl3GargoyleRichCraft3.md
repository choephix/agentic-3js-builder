```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  rng,
  mottle,
  countershade,
  paint,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A crouched gothic stone gargoyle perched on a carved cathedral ledge.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  const STONE = mottle("#54565b", "#77777a", { size: 0.18, seed: 12, contrast: 1.2 });
  const STONE_LIGHT = countershade(STONE, "#36383d", { level: -0.05, soft: 0.28 });
  const STONE_DARK = "#292b30";
  const EDGE = "#8e8b83";
  const EYE = "#d18a35";
  const INK = "#16171c";
  const MOSS = "#3d5940";

  // ------------------------------------------------------------------------------------------------
  // Skeleton: compact crouched torso, bent legs, neck, jaw, tail and spread wings.

  const hips = b.joint("hips", { at: [0, 1.02, 0], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.02, 0],
      [0, 1.16, 0.14],
      [0, 1.31, 0.28],
      [0, 1.42, 0.39],
    ]),
    { parent: hips, names: ["spine1", "spine2", "shoulders"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.42, 0.39],
      [0, 1.55, 0.51],
      [0, 1.68, 0.62],
    ]),
    { parent: spine.tip, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.78, 0.68],
    dir: [0, -0.04, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.68, 0.79],
    dir: [0, -0.42, 0.9],
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.02, -0.04],
      [0, 0.91, -0.33],
      [0, 0.76, -0.65],
      [0, 0.63, -0.94],
      [0, 0.55, -1.16],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  const legData = [
    {
      side: 1,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      pts: [
        [0.27, 1.02, 0.02],
        [0.46, 0.72, 0.18],
        [0.38, 0.42, 0.31],
        [0.40, 0.30, 0.43],
      ],
    },
    {
      side: -1,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      pts: [
        [-0.27, 1.02, 0.02],
        [-0.46, 0.72, 0.18],
        [-0.38, 0.42, 0.31],
        [-0.40, 0.30, 0.43],
      ],
    },
  ];

  const legs = legData.map((d) =>
    b.chain(`leg${d.side > 0 ? "L" : "R"}`, polyline(d.pts), {
      parent: hips,
      names: d.names,
      role: "leg",
      contact: d.pts[3],
    }),
  );

  const armData = [
    {
      side: 1,
      names: ["armL", "elbowL", "wristL"],
      pts: [
        [0.28, 1.39, 0.38],
        [0.53, 1.19, 0.49],
        [0.67, 0.96, 0.57],
      ],
    },
    {
      side: -1,
      names: ["armR", "elbowR", "wristR"],
      pts: [
        [-0.28, 1.39, 0.38],
        [-0.53, 1.19, 0.49],
        [-0.67, 0.96, 0.57],
      ],
    },
  ];

  const arms = armData.map((d) =>
    b.chain(`arm${d.side > 0 ? "L" : "R"}`, polyline(d.pts), {
      parent: spine.tip,
      names: d.names,
      role: "arm",
    }),
  );

  const wingData = [
    {
      side: 1,
      names: ["wingL", "wingL2", "wingL3"],
      pts: [
        [0.22, 1.49, 0.32],
        [0.63, 1.68, 0.14],
        [1.02, 1.48, -0.13],
        [1.20, 1.14, -0.40],
      ],
    },
    {
      side: -1,
      names: ["wingR", "wingR2", "wingR3"],
      pts: [
        [-0.22, 1.49, 0.32],
        [-0.63, 1.68, 0.14],
        [-1.02, 1.48, -0.13],
        [-1.20, 1.14, -0.40],
      ],
    },
  ];

  const wings = wingData.map((d) =>
    b.chain(`wing${d.side > 0 ? "L" : "R"}`, polyline(d.pts), {
      parent: spine.tip,
      names: d.names,
      role: "wing",
    }),
  );

  // ------------------------------------------------------------------------------------------------
  // Ledge: a simple worn architectural perch, intentionally quieter than the gargoyle.

  b.part(
    new THREE.BoxGeometry(2.5, 0.24, 1.05),
    "#4a4b4d",
    { at: [0, 0.12, 0.18], name: "ledgeBlock", group: "architecture", flat: true },
  );
  b.part(
    new THREE.BoxGeometry(2.7, 0.10, 1.18),
    EDGE,
    { at: [0, 0.29, 0.18], name: "ledgeLip", group: "architecture", flat: true },
  );
  b.part(
    new THREE.BoxGeometry(2.25, 0.10, 0.20),
    STONE_DARK,
    { at: [0, 0.39, 0.66], name: "ledgeFrontShadow", group: "architecture", flat: true },
  );

  // ------------------------------------------------------------------------------------------------
  // Main carved masses.

  b.sweep(spine, (t) => 0.27 - t * 0.055, {
    color: STONE_LIGHT,
    section: { ngon: 8 },
    caps: "round",
    name: "carvedTorso",
  });

  b.sweep(neck, [0.22, 0.18], {
    color: STONE_LIGHT,
    section: { ngon: 8 },
    name: "carvedNeck",
  });

  b.sweep(tail, (t) => 0.16 * (1 - t) + 0.035, {
    color: STONE,
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    name: "stoneTail",
  });

  legs.forEach((leg, i) => {
    b.sweep(leg, (t) => 0.13 - t * 0.065, {
      color: STONE_LIGHT,
      section: { ngon: 7 },
      skin: "rigid",
      name: i ? "hindLegR" : "hindLegL",
    });
  });

  arms.forEach((arm, i) => {
    b.sweep(arm, (t) => 0.09 - t * 0.045, {
      color: STONE,
      section: { ngon: 7 },
      skin: "rigid",
      name: i ? "forearmR" : "forearmL",
    });
  });

  // Hands and broad stone feet.
  for (const s of [1, -1]) {
    b.part(
      new THREE.BoxGeometry(0.20, 0.12, 0.27),
      STONE_DARK,
      { at: [s * 0.40, 0.32, 0.48], bone: legs[s > 0 ? 0 : 1].tip, flat: true, name: s > 0 ? "footL" : "footR" },
    );
    b.part(
      new THREE.SphereGeometry(0.105, 7, 5),
      STONE,
      { at: [s * 0.67, 0.94, 0.59], bone: arms[s > 0 ? 0 : 1].tip, flat: true, name: s > 0 ? "fistL" : "fistR" },
    );

    for (let i = -1; i <= 1; i++) {
      b.spike([s * (0.39 + i * 0.045), 0.33, 0.62], [0, -0.05, 1], 0.13, 0.026, {
        color: EDGE,
        bone: legs[s > 0 ? 0 : 1].tip,
        name: "stoneClaw",
      });
      b.spike([s * (0.67 + i * 0.035), 0.94, 0.69], [0, -0.18, 1], 0.11, 0.019, {
        color: EDGE,
        bone: arms[s > 0 ? 0 : 1].tip,
        name: "handClaw",
      });
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Wings: angular bat-like fingers with membranes, held open in a readable rest pose.

  for (let i = 0; i < wings.length; i++) {
    const w = wings[i];
    b.sweep(w, [0.10, 0.025], {
      color: STONE_DARK,
      section: { ngon: 6 },
      skin: "rigid",
      name: i ? "wingBoneR" : "wingBoneL",
    });

    const s = i === 0 ? 1 : -1;
    const outer = [
      [s * 0.22, 1.51, 0.30],
      [s * 0.63, 1.68, 0.14],
      [s * 1.02, 1.48, -0.13],
      [s * 1.20, 1.14, -0.40],
    ];
    const lower = [
      [s * 0.30, 1.30, 0.18],
      [s * 0.55, 1.16, 0.00],
      [s * 0.78, 0.94, -0.22],
      [s * 0.93, 0.78, -0.40],
    ];
    b.membrane(outer, lower, {
      color: STONE,
      thickness: 0.018,
      rows: 4,
      cols: 8,
      scallop: 0.12,
      name: i ? "wingMembraneR" : "wingMembraneL",
    });

    // Wing struts emphasize the cathedral-arch silhouette.
    for (let j = 0; j < 3; j++) {
      b.rod(outer[j], lower[j], 0.018, EDGE, { bone: w.joints[Math.min(j, w.joints.length - 1)], name: "wingRib" });
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Head, muzzle, brow, horns and open fang-lined jaw.

  b.part(
    new THREE.SphereGeometry(0.245, 10, 7),
    STONE_LIGHT,
    { at: [0, 1.78, 0.68], bone: head, scale: [1.0, 0.92, 1.08], flat: true, name: "gargoyleSkull" },
  );
  b.part(
    new THREE.BoxGeometry(0.28, 0.18, 0.27),
    STONE,
    { at: [0, 1.68, 0.86], bone: jaw, rotation: [-18, 0, 0], flat: true, name: "lowerJaw" },
  );
  b.part(
    new THREE.BoxGeometry(0.30, 0.16, 0.22),
    STONE_LIGHT,
    { at: [0, 1.78, 0.86], bone: head, flat: true, name: "muzzleBridge" },
  );

  for (const s of [1, -1]) {
    // Heavy pointed brow stones.
    b.spike([s * 0.075, 1.89, 0.84], [s * 0.25, 0.10, 0.96], 0.17, 0.055, {
      color: STONE_DARK,
      bone: head,
      name: "browRidge",
    });

    // Back-swept horns.
    b.sprout(
      s > 0 ? "hornL" : "hornR",
      { at: [s * 0.15, 1.91, 0.61], axis: [s * 0.25, 0.86, -0.42], bone: head },
      catmull([
        [s * 0.15, 1.91, 0.61],
        [s * 0.24, 2.08, 0.47],
        [s * 0.35, 2.18, 0.29],
      ]),
      [0.065, 0.012],
      { count: 1, color: STONE_DARK, caps: { start: "round", end: "point" }, role: "horn", name: "horn" },
    );

    // Pointed ears.
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.14, 0.02, "sharp"],
        [0.08, 0.24, "sharp"],
        [0.015, 0.13, "sharp"],
      ],
      {
        at: [s * 0.14, 1.83, 0.62],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.055,
        bevel: 0.008,
        color: STONE,
        bone: head,
        name: "pointedEar",
      },
    );

    // Amber eyes inset into the stone.
    b.part(
      new THREE.SphereGeometry(0.045, 8, 5),
      EYE,
      { at: [s * 0.095, 1.80, 0.895], bone: head, scale: [1, 0.72, 0.45], name: "glowingAmberEye" },
    );
    b.part(
      new THREE.SphereGeometry(0.018, 6, 4),
      INK,
      { at: [s * 0.095, 1.80, 0.919], bone: head, name: "verticalPupil" },
    );

    // Two upper and two lower tusk-like fangs.
    b.spike([s * 0.105, 1.74, 0.965], [0, -1, 0.10], 0.105, 0.027, {
      color: EDGE,
      bone: head,
      name: "upperFang",
    });
    b.spike([s * 0.075, 1.70, 0.955], [0, -1, 0.08], 0.075, 0.022, {
      color: EDGE,
      bone: jaw,
      name: "lowerFang",
    });
  }

  // Nose and nostril stones.
  b.part(
    new THREE.ConeGeometry(0.075, 0.13, 6),
    STONE_DARK,
    { at: [0, 1.77, 0.98], dir: [0, 0, 1], bone: head, name: "carvedNose" },
  );
  for (const s of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(0.018, 6, 4),
      INK,
      { at: [s * 0.032, 1.785, 1.035], bone: head, name: "nostril" },
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Gothic carving details: forehead crest, dorsal knobs, tail barbs and moss.

  b.extrude(
    [
      [0, 0, "sharp"],
      [0.11, 0.10, "sharp"],
      [0.08, 0.25, "sharp"],
      [0, 0.34, "sharp"],
      [-0.08, 0.25, "sharp"],
      [-0.11, 0.10, "sharp"],
    ],
    {
      at: [0, 1.88, 0.57],
      x: [1, 0, 0],
      y: [0, 0.25, 0.97],
      thickness: 0.045,
      bevel: 0.006,
      color: EDGE,
      bone: head,
      name: "foreheadCrown",
    },
  );

  b.along(spine, 5, (at) =>
    b.spike(at, at, 0.10, 0.035, { color: EDGE, name: "dorsalCarving", bone: at.bone }),
  );

  b.along(tail, 5, (at) =>
    b.spike(at, at, 0.14, 0.032, { color: EDGE, name: "tailBarb", bone: at.bone }),
  );

  // A few dark mineral seams and moss patches on the ledge and lower stone.
  const seam = paint((p, n) => {
    const crack = Math.abs(Math.sin(p.x * 31 + p.z * 17 + p.y * 11));
    return crack > 0.985 && n.y > -0.4 ? STONE_DARK : STONE;
  });

  b.part(new THREE.BoxGeometry(0.75, 0.018, 0.035), seam, {
    at: [-0.63, 0.35, 0.72],
    rotation: [0, 0.18, 0],
    name: "carvedLedgeCrack",
  });
  b.part(new THREE.BoxGeometry(0.30, 0.025, 0.06), MOSS, {
    at: [0.74, 0.36, 0.56],
    rotation: [0, -0.3, 0],
    name: "mossOnLedge",
  });

  // Sink the feet into the ledge slightly so the silhouette feels weighty and carved in place.
  b.part(new THREE.BoxGeometry(0.18, 0.055, 0.28), STONE_DARK, {
    at: [0.40, 0.305, 0.45],
    name: "footShadowL",
  });
  b.part(new THREE.BoxGeometry(0.18, 0.055, 0.28), STONE_DARK, {
    at: [-0.40, 0.305, 0.45],
    name: "footShadowR",
  });

  return b.root;
}
```