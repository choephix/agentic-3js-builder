import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  line,
  frame,
} from "../../../../src/index";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A crouching gothic stone gargoyle carved from faceted primitives, with folded bat wings, horns, claws, fangs, a long tail, and a heavy cathedral ledge.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  const STONE = "#676b70";
  const STONE_LIGHT = "#8b8d8b";
  const STONE_DARK = "#35383d";
  const STONE_DEEP = "#24262b";
  const EDGE = "#a9a79c";
  const MOSS = "#53634b";
  const EYE = "#d6a43b";
  const EYE_DARK = "#301d10";
  const MOUTH = "#17151a";
  const IRON = "#292a2d";
  const PALE = "#b8b6a6";

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      flat: true,
      name,
    });

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    scale: [number, number, number] = [1, 1, 1],
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      scale,
      bone,
      flat: true,
      name,
    });

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    dir: [number, number, number] = [0, 1, 0],
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
      at,
      dir,
      bone,
      flat: true,
      name,
    });

  const rod = (
    a: any,
    c: any,
    radius: number,
    color: string,
    name?: string,
  ) => b.rod(a, c, radius, { color, name, caps: "round" });

  const spike = (base: any, tip: any, radius: number, color: string, name?: string) =>
    b.spike(base, tip, null, radius, { color, name });

  // ---------------------------------------------------------------------------
  // Skeleton: one root, central spine, jaw hinge, four crouched limbs, tail.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.86, -0.12],
    dir: [0, 0.25, 1],
    role: "spine",
  });

  const torso = b.chain(
    "spine",
    catmull([
      [0, 0.86, -0.12],
      [0, 1.03, 0.02],
      [0, 1.19, 0.16],
      [0, 1.31, 0.28],
    ]),
    {
      parent: hips,
      names: ["spineBase", "spineMid", "chest"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.29, 0.28],
      [0, 1.42, 0.35],
      [0, 1.56, 0.42],
    ]),
    {
      parent: torso.tip,
      names: ["neckBase", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.59, 0.43],
    dir: [0, 0.02, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.51, 0.56],
    aim: [0, 1.43, 0.87],
    role: "jaw",
    group: "face",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.88, -0.18],
      [0, 0.76, -0.48],
      [0, 0.64, -0.78],
      [0, 0.58, -1.08],
      [0, 0.68, -1.35],
      [0, 0.84, -1.57],
    ]),
    {
      parent: hips,
      count: 6,
      names: ["tailBase", "tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
    },
  );

  const rearLegs: any[] = [];
  const frontLegs: any[] = [];

  for (const s of [1, -1]) {
    const rearPoints = limb(
      [s * 0.29, 0.91, -0.10],
      [s * 0.46, 0.22, 0.48],
      [0.34, 0.36, 0.28],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const rear = b.chain(`hind${s > 0 ? "L" : "R"}`, rearPoints, {
      parent: hips,
      names: [
        `hip${s > 0 ? "L" : "R"}`,
        `knee${s > 0 ? "L" : "R"}`,
        `ankle${s > 0 ? "L" : "R"}`,
      ],
      role: "leg",
      contact: [s * 0.46, 0.2, 0.48],
    });
    rearLegs.push(rear);

    const frontPoints = limb(
      [s * 0.31, 1.24, 0.25],
      [s * 0.40, 0.22, 0.65],
      [0.30, 0.34, 0.29],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const front = b.chain(`fore${s > 0 ? "L" : "R"}`, frontPoints, {
      parent: torso.joints[1],
      names: [
        `shoulder${s > 0 ? "L" : "R"}`,
        `elbow${s > 0 ? "L" : "R"}`,
        `wrist${s > 0 ? "L" : "R"}`,
      ],
      role: "arm",
      contact: [s * 0.4, 0.2, 0.65],
    });
    frontLegs.push(front);
  }

  // Wing skeletons, extended in a neutral spread so the silhouette reads clearly.
  const wingChains: any[] = [];
  for (const s of [1, -1]) {
    const wing = b.chain(
      `wing${s > 0 ? "L" : "R"}`,
      [
        [s * 0.28, 1.28, 0.07],
        [s * 0.60, 1.47, -0.04],
        [s * 0.88, 1.70, -0.10],
        [s * 1.12, 1.50, -0.12],
      ],
      {
        parent: torso.joints[2],
        names: [
          `wingRoot${s > 0 ? "L" : "R"}`,
          `wingMid${s > 0 ? "L" : "R"}`,
          `wingTip${s > 0 ? "L" : "R"}`,
          `wingEnd${s > 0 ? "L" : "R"}`,
        ],
        role: "wing",
      },
    );
    wingChains.push(wing);
  }

  // ---------------------------------------------------------------------------
  // Cathedral ledge: broad, chunky, and slightly stepped beneath the creature.
  // ---------------------------------------------------------------------------

  box([1.62, 0.18, 1.48], STONE_DARK, [0, 0.09, 0.22], undefined, "ledgeBase");
  box([1.42, 0.12, 1.30], STONE, [0, 0.24, 0.22], undefined, "ledgeTop");
  box([1.20, 0.10, 0.34], STONE_LIGHT, [0, 0.35, 0.66], undefined, "ledgeLip");
  box([1.55, 0.08, 0.20], STONE_DEEP, [0, 0.33, -0.44], undefined, "ledgeShadow");

  for (const s of [1, -1]) {
    box([0.16, 0.34, 0.20], STONE_DARK, [s * 0.70, 0.36, -0.18], undefined, "ledgeCorbel");
    box([0.22, 0.12, 0.42], STONE_LIGHT, [s * 0.60, 0.55, 0.17], undefined, "ledgeCarvedBlock");
  }

  // Small moss patches deliberately sit on upward ledge surfaces.
  box([0.34, 0.018, 0.10], MOSS, [-0.38, 0.305, 0.38], undefined, "mossTopL");
  box([0.21, 0.018, 0.14], MOSS, [0.43, 0.305, 0.05], undefined, "mossTopR");
  box([0.12, 0.018, 0.08], MOSS, [0.12, 0.305, 0.51], undefined, "mossTopC");

  // ---------------------------------------------------------------------------
  // Main carved body: faceted tubes with heavier belly and shoulders.
  // ---------------------------------------------------------------------------

  b.sweep(torso, (t) => 0.25 - 0.035 * t, {
    color: STONE,
    sides: 8,
    section: "box",
    name: "carvedTorso",
  });

  b.sweep(neck, [0.19, 0.15], {
    color: STONE_DARK,
    sides: 8,
    name: "stoneNeck",
  });

  b.sweep(tail, (t) => 0.14 * (1 - t) + 0.025, {
    color: STONE_DARK,
    sides: 7,
    bands: [
      [0.55, STONE],
      [0.78, STONE_LIGHT],
      [1, STONE_DARK],
    ],
    name: "longTail",
  });

  for (const leg of rearLegs) {
    b.sweep(leg, (t) => 0.115 - t * 0.045, {
      color: STONE,
      sides: 7,
      section: "box",
      name: "hindLeg",
    });
  }

  for (const leg of frontLegs) {
    b.sweep(leg, (t) => 0.105 - t * 0.038, {
      color: STONE_LIGHT,
      sides: 7,
      section: "box",
      name: "foreLeg",
    });
  }

  // Shoulder and haunch masses emphasize the crouched pose.
  for (const s of [1, -1]) {
    sphere(0.22, STONE_LIGHT, [s * 0.28, 1.20, 0.22], [1.12, 1.0, 0.82], torso.joints[2], "shoulderMass");
    sphere(0.23, STONE_DARK, [s * 0.27, 0.83, -0.10], [1.08, 0.95, 1.05], hips, "haunchMass");
  }

  // ---------------------------------------------------------------------------
  // Head, brow, muzzle and open stone jaws.
  // ---------------------------------------------------------------------------

  sphere(0.29, STONE_LIGHT, [0, 1.63, 0.43], [1.08, 1.0, 0.92], head, "gargoyleSkull");
  sphere(0.17, STONE, [0, 1.54, 0.65], [1.15, 0.72, 1.28], head, "muzzleBlock");

  box([0.38, 0.09, 0.22], STONE_DARK, [0, 1.495, 0.79], jaw, "lowerJaw");
  box([0.42, 0.10, 0.22], STONE_LIGHT, [0, 1.575, 0.74], head, "upperJaw");
  box([0.28, 0.035, 0.08], MOUTH, [0, 1.535, 0.835], jaw, "openMouth");

  sphere(0.065, STONE_DEEP, [0, 1.60, 0.86], [1.25, 0.72, 0.65], head, "nose");
  sphere(0.026, EYE, [0.112, 1.69, 0.655], [1, 1, 0.55], head, "eyeL");
  sphere(0.026, EYE, [-0.112, 1.69, 0.655], [1, 1, 0.55], head, "eyeR");
  sphere(0.012, EYE_DARK, [0.112, 1.69, 0.679], [1, 1, 0.35], head, "pupilL");
  sphere(0.012, EYE_DARK, [-0.112, 1.69, 0.679], [1, 1, 0.35], head, "pupilR");

  // Heavy expressive brow stones.
  rod([0.045, 1.765, 0.62], [0.185, 1.73, 0.64], 0.032, STONE_DARK, "browL");
  rod([-0.045, 1.765, 0.62], [-0.185, 1.73, 0.64], 0.032, STONE_DARK, "browR");

  // Fangs project into the open mouth.
  spike([0.115, 1.54, 0.80], [0.115, 1.45, 0.82], 0.035, PALE, "fangL");
  spike([-0.115, 1.54, 0.80], [-0.115, 1.45, 0.82], 0.035, PALE, "fangR");
  spike([0.055, 1.465, 0.84], [0.055, 1.405, 0.85], 0.025, PALE, "lowerFangL");
  spike([-0.055, 1.465, 0.84], [-0.055, 1.405, 0.85], 0.025, PALE, "lowerFangR");

  // ---------------------------------------------------------------------------
  // Horns, pointed ears, cheek stones, and throat ridges.
  // ---------------------------------------------------------------------------

  for (const s of [1, -1]) {
    spike(
      [s * 0.17, 1.81, 0.37],
      [s * 0.28, 2.08, 0.20],
      0.075,
      STONE_DARK,
      "hornBase",
    );
    spike(
      [s * 0.26, 2.01, 0.24],
      [s * 0.33, 2.16, 0.12],
      0.045,
      STONE_LIGHT,
      "hornTip",
    );

    b.extrude(
      [
        [0, 0],
        [0.18, 0.05],
        [0.24, 0.22],
        [0.08, 0.17],
      ],
      {
        at: [s * 0.19, 1.76, 0.28],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.045,
        bevel: 0.008,
        color: STONE,
        bone: head,
        name: "pointedEar",
      },
    );

    sphere(0.085, STONE_LIGHT, [s * 0.22, 1.57, 0.50], [1.2, 1.0, 0.7], head, "cheekStone");
    rod([s * 0.08, 1.47, 0.52], [s * 0.15, 1.37, 0.55], 0.018, EDGE, "throatFold");
    rod([s * 0.14, 1.45, 0.49], [s * 0.20, 1.36, 0.51], 0.014, EDGE, "throatFoldSmall");
  }

  // ---------------------------------------------------------------------------
  // Wings: broad gothic bat membranes plus angular finger bones.
  // ---------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const wing = wingChains[s > 0 ? 0 : 1];

    b.sweep(wing, [0.055, 0.018], {
      color: STONE_DARK,
      sides: 6,
      name: "wingFinger",
    });

    b.membrane(
      [
        [s * 0.28, 1.27, 0.02],
        [s * 0.58, 1.48, -0.03],
        [s * 0.88, 1.70, -0.09],
        [s * 1.12, 1.50, -0.11],
      ],
      [
        [s * 0.30, 1.12, -0.02],
        [s * 0.60, 1.24, -0.05],
        [s * 0.87, 1.34, -0.08],
        [s * 1.03, 1.25, -0.10],
      ],
      {
        color: STONE,
        thickness: 0.025,
        rows: 4,
        cols: 8,
        scallop: 0.12,
        name: "wingMembrane",
      },
    );

    // Radial ribs make the wings read as carved, architectural bat wings.
    rod([s * 0.30, 1.28, 0.00], [s * 0.88, 1.70, -0.09], 0.018, STONE_LIGHT, "wingRibUpper");
    rod([s * 0.30, 1.24, 0.01], [s * 1.12, 1.50, -0.11], 0.018, STONE_LIGHT, "wingRibTip");
    rod([s * 0.30, 1.20, 0.02], [s * 0.87, 1.34, -0.08], 0.016, STONE_DARK, "wingRibLower");

    // Wing scallop stones along the trailing edge.
    for (let i = 0; i < 4; i++) {
      const x = s * (0.42 + i * 0.17);
      const y = 1.18 + Math.sin(i * 0.9) * 0.035;
      sphere(0.035, STONE_LIGHT, [x, y, -0.10], [1.5, 0.7, 0.55], torso.joints[2], "wingScallop");
    }
  }

  // ---------------------------------------------------------------------------
  // Feet and hands: chunky talons resting on the ledge.
  // ---------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const rear = rearLegs[s > 0 ? 0 : 1];
    const front = frontLegs[s > 0 ? 0 : 1];

    sphere(0.105, STONE_LIGHT, [s * 0.46, 0.27, 0.48], [1.1, 0.58, 1.35], rear.tip, "rearFoot");
    sphere(0.09, STONE, [s * 0.40, 0.27, 0.65], [1.0, 0.55, 1.25], front.tip, "frontPalm");

    for (let i = -1; i <= 1; i++) {
      const dx = s * (0.46 + i * 0.055);
      spike([dx, 0.27, 0.55], [dx, 0.20, 0.73], 0.028, STONE_DARK, "rearClaw");
      const hx = s * (0.40 + i * 0.048);
      spike([hx, 0.27, 0.70], [hx, 0.20, 0.83], 0.023, STONE_DARK, "frontClaw");
    }

    // Raised ankle bands, like carved cuffs.
    rod([s * 0.45, 0.38, 0.40], [s * 0.45, 0.43, 0.48], 0.026, EDGE, "ankleBand");
    rod([s * 0.40, 0.38, 0.58], [s * 0.40, 0.43, 0.64], 0.022, EDGE, "wristBand");
  }

  // ---------------------------------------------------------------------------
  // Tail barbs, dorsal ridges, stone seams, and decorative masonry marks.
  // ---------------------------------------------------------------------------

  b.along(tail, 5, (at: any) => {
    spike(at, at, 0.07, 0.022, "tailBarb");
  });

  b.along(torso, 5, (at: any) => {
    spike(at, at, 0.075, 0.028, "spineRidge");
  });

  // Large angular plates on the haunches.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.13, 0.02],
        [0.18, 0.15],
        [0.06, 0.23],
        [0, 0.12],
      ],
      {
        at: [s * 0.34, 0.78, -0.28],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.028,
        bevel: 0.005,
        color: STONE_LIGHT,
        bone: hips,
        name: "haunchPlate",
      },
    );
  }

  // Carved seam lines across the chest and muzzle.
  rod([-0.19, 1.31, 0.40], [0.19, 1.31, 0.40], 0.009, STONE_DEEP, "chestSeam");
  rod([-0.15, 1.40, 0.52], [0.15, 1.40, 0.52], 0.007, STONE_DEEP, "throatSeam");
  rod([-0.18, 1.61, 0.69], [-0.07, 1.60, 0.75], 0.008, STONE_DARK, "muzzleCrack");
  rod([0.18, 1.61, 0.69], [0.07, 1.60, 0.75], 0.008, STONE_DARK, "muzzleCrack");

  // A central chest boss, echoing cathedral keystones.
  sphere(0.075, EDGE, [0, 1.23, 0.39], [1.0, 1.25, 0.55], torso.joints[2], "chestBoss");
  spike([0, 1.28, 0.41], [0, 1.39, 0.44], 0.028, STONE_DARK, "chestKeystone");

  // Small iron-like anchor studs at the ledge corners.
  for (const x of [-0.62, 0.62]) {
    cylinder(0.025, 0.035, IRON, [x, 0.32, 0.53], [0, 1, 0], undefined, "ledgeStud");
  }

  // Readable silhouette accents: curled tail tip and a pair of carved shoulder spikes.
  for (const s of [1, -1]) {
    spike([s * 0.27, 1.25, 0.08], [s * 0.42, 1.40, 0.01], 0.032, STONE_DARK, "shoulderSpike");
  }

  return b.root;
}
