```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  svg,
} from "agentic-3js-builder";
import { cel, furEdge, INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A crouching gothic stone gargoyle perched on a carved ledge, with folded wings, horns, fangs, claws, a ridged tail and weathered cathedral masonry.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 0.82 });

  const STONE = cel("#6f7478", "#34383d", { threshold: 0.08 });
  const STONE_LIGHT = cel("#909497", "#4a4d51", { threshold: 0.12 });
  const STONE_DARK = cel("#44484d", "#202327", { threshold: 0.05 });
  const BELLY = cel("#77716c", "#3e3938", { threshold: 0.1 });
  const EDGE = "#a8a9a5";
  const CARVE = "#202126";
  const MOSS = "#4c6848";
  const MOSS_LIGHT = "#71845a";
  const EYE = "#e2a642";
  const EYE_GLOW = "#fff0a0";
  const TOOTH = "#b9b29b";
  const LEDGE = "#4b4c4c";
  const LEDGE_TOP = "#73736e";
  const IRON = "#25282c";

  const box = (
    size: [number, number, number],
    color: string,
    at: any,
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      name,
      flat: true,
    });

  const sphere = (
    radius: number,
    color: string,
    at: any,
    scale: [number, number, number],
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      scale,
      bone,
      name,
      flat: true,
    });

  const stoneKnuckle = (at: any, bone: any, s = 1, name = "knuckle") =>
    sphere(0.075 * s, STONE_LIGHT, at, [1.12, 0.8, 1], bone, name);

  const toe = (base: any, tip: any, bone: any, s = 1, name = "claw") => {
    b.sweep(catmull([base, tip]), [0.028 * s, 0.006 * s], {
      color: TOOTH,
      bone,
      caps: { start: "round", end: "point" },
      name,
    });
  };

  // ---------------------------------------------------------------------------
  // Staging ledge: a simple, heavy cathedral corbel beneath the monster.
  // ---------------------------------------------------------------------------

  box([2.15, 0.22, 1.55], LEDGE, [0, 0.11, -0.08], undefined, "ledge_block");
  box([2.0, 0.09, 1.42], LEDGE_TOP, [0, 0.265, -0.08], undefined, "ledge_cap");
  box([1.72, 0.16, 0.18], CARVE, [0, 0.38, 0.57], undefined, "ledge_front_shadow");

  // Carved corbel teeth and front-facing blockwork.
  for (const x of [-0.78, -0.52, -0.26, 0, 0.26, 0.52, 0.78]) {
    box([0.18, 0.13, 0.12], STONE_DARK, [x, 0.36, 0.59], undefined, "ledge_tooth");
    box([0.14, 0.05, 0.07], EDGE, [x, 0.43, 0.61], undefined, "ledge_tooth_highlight");
  }
  for (const x of [-0.78, -0.39, 0, 0.39, 0.78]) {
    box([0.025, 0.22, 0.015], CARVE, [x, 0.15, 0.705], undefined, "masonry_seam");
  }
  for (const z of [-0.56, -0.2, 0.16, 0.52]) {
    box([1.98, 0.018, 0.018], CARVE, [0, 0.18, z], undefined, "ledge_seam");
  }

  // ---------------------------------------------------------------------------
  // Skeleton first. The pose is a readable crouch with separated appendages.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.91, -0.08],
    dir: [0, 0.2, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.82, -0.12],
      [0, 1.02, -0.04],
      [0, 1.2, 0.05],
      [0, 1.36, 0.13],
    ]),
    {
      parent: hips,
      names: ["pelvis", "back", "shoulder", "chest"],
      role: "spine",
      count: 4,
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.34, 0.13],
      [0, 1.48, 0.2],
      [0, 1.59, 0.28],
    ]),
    {
      parent: spine.tip,
      names: ["neckBase", "neckMid", "neckTip"],
      role: "neck",
      count: 3,
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: neck.at(1).at,
    dir: [0, 0.08, 1],
    role: "head",
    group: "face",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.12, down: 0.07 }),
    dir: head.local({ forward: 0.34, down: 0.16 }),
    role: "jaw",
    group: "face",
  });

  const hindL = limb(
    [0.27, 0.86, -0.13],
    [0.39, 0.34, 0.18],
    [0.34, 0.34, 0.25],
    [
      [0, 0, 1],
      [0, 0, -1],
    ],
  );
  const hindR = limb(
    [-0.27, 0.86, -0.13],
    [-0.39, 0.34, 0.18],
    [0.34, 0.34, 0.25],
    [
      [0, 0, 1],
      [0, 0, -1],
    ],
  );
  const legL = b.chain("legL", hindL, {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL"],
    role: "leg",
    contact: [0.39, 0.29, 0.18],
  });
  const legR = b.chain("legR", hindR, {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR"],
    role: "leg",
    contact: [-0.39, 0.29, 0.18],
  });

  const armL = b.chain(
    "armL",
    catmull([
      [0.35, 1.25, 0.13],
      [0.54, 1.12, 0.21],
      [0.69, 0.91, 0.3],
      [0.72, 0.68, 0.37],
    ]),
    {
      parent: spine.joints[2],
      names: ["shoulderL", "elbowL", "wristL", "handL"],
      role: "arm",
      count: 4,
    },
  );
  const armR = b.chain(
    "armR",
    catmull([
      [-0.35, 1.25, 0.13],
      [-0.54, 1.12, 0.21],
      [-0.69, 0.91, 0.3],
      [-0.72, 0.68, 0.37],
    ]),
    {
      parent: spine.joints[2],
      names: ["shoulderR", "elbowR", "wristR", "handR"],
      role: "arm",
      count: 4,
    },
  );

  const wingL = b.chain(
    "wingL",
    catmull([
      [0.31, 1.31, 0.02],
      [0.58, 1.5, -0.03],
      [0.88, 1.55, -0.2],
      [1.12, 1.37, -0.34],
    ]),
    {
      parent: spine.joints[2],
      names: ["wingRootL", "wingElbowL", "wingMidL", "wingTipL"],
      role: "wing",
      count: 4,
    },
  );
  const wingR = b.chain(
    "wingR",
    catmull([
      [-0.31, 1.31, 0.02],
      [-0.58, 1.5, -0.03],
      [-0.88, 1.55, -0.2],
      [-1.12, 1.37, -0.34],
    ]),
    {
      parent: spine.joints[2],
      names: ["wingRootR", "wingElbowR", "wingMidR", "wingTipR"],
      role: "wing",
      count: 4,
    },
  );

  const fingerL = b.chain(
    "wingFingerL",
    catmull([
      [0.42, 1.38, -0.01],
      [0.76, 1.73, -0.21],
      [1.16, 1.79, -0.41],
      [1.42, 1.62, -0.48],
    ]),
    {
      parent: wingL.joints[0],
      names: ["digitL1", "digitL2", "digitL3", "digitL4"],
      role: "digit",
      count: 4,
    },
  );
  const fingerR = b.chain(
    "wingFingerR",
    catmull([
      [-0.42, 1.38, -0.01],
      [-0.76, 1.73, -0.21],
      [-1.16, 1.79, -0.41],
      [-1.42, 1.62, -0.48],
    ]),
    {
      parent: wingR.joints[0],
      names: ["digitR1", "digitR2", "digitR3", "digitR4"],
      role: "digit",
      count: 4,
    },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.85, -0.24],
      [0, 0.69, -0.58],
      [0.03, 0.57, -0.92],
      [0.12, 0.51, -1.22],
      [0.23, 0.6, -1.46],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
      role: "tail",
      count: 5,
    },
  );

  // ---------------------------------------------------------------------------
  // Main carved body, belly and shoulder masses.
  // ---------------------------------------------------------------------------

  b.sweep(spine, [0.29, 0.25, 0.2, 0.16], {
    bone: spine,
    color: STONE,
    section: "box",
    sides: 8,
    name: "carved_torso",
    sectors: [
      [-55, 55, STONE_LIGHT],
      [122, 238, BELLY],
    ],
  });

  b.sweep(neck, [0.17, 0.14, 0.11], {
    bone: neck,
    color: STONE_DARK,
    section: { ngon: 7 },
    name: "neck_stone",
  });

  sphere(0.35, STONE_LIGHT, head.at, [1.08, 1.04, 1.12], head, "gargoyle_skull");
  box([0.42, 0.3, 0.31], BELLY, head.local({ forward: 0.16, down: 0.01 }), head, "muzzle_block");
  sphere(
    0.19,
    STONE_DARK,
    head.local({ forward: 0.33, down: 0.025 }),
    [1.25, 0.72, 0.7],
    head,
    "muzzle_shadow",
  );

  // Brow shelf and cheek planes.
  box([0.46, 0.08, 0.17], STONE_DARK, head.local({ forward: 0.19, up: 0.14 }), head, "brow_shelf");
  for (const s of [-1, 1]) {
    sphere(
      0.14,
      STONE_LIGHT,
      head.local({ left: s * 0.2, forward: 0.16, down: 0.02 }),
      [0.86, 0.9, 0.72],
      head,
      "cheek_mass",
    );
  }

  // Upper and lower jaws are separate, leaving a readable black mouth gap.
  b.sweep(
    catmull([
      head.local({ forward: 0.22, down: 0.055 }),
      head.local({ forward: 0.39, down: 0.09 }),
    ]),
    [0.16, 0.11],
    {
      bone: head,
      color: STONE_DARK,
      section: { ngon: 6 },
      caps: "flat",
      name: "upper_jaw",
    },
  );
  b.sweep(
    catmull([
      jaw.at,
      head.local({ forward: 0.3, down: 0.2 }),
      head.local({ forward: 0.12, down: 0.2 }),
    ]),
    [0.12, 0.055, 0.025],
    {
      bone: jaw,
      color: STONE,
      section: { ngon: 6 },
      name: "lower_jaw",
    },
  );
  box([0.19, 0.035, 0.17], CARVE, head.local({ forward: 0.3, down: 0.13 }), jaw, "mouth_void");

  // Nose and nostrils.
  sphere(
    0.065,
    STONE_DARK,
    head.local({ forward: 0.41, down: 0.045 }),
    [1.35, 0.8, 0.8],
    head,
    "nose",
  );
  for (const s of [-1, 1]) {
    sphere(
      0.018,
      CARVE,
      head.local({ left: s * 0.047, forward: 0.445, down: 0.035 }),
      [1, 0.7, 0.55],
      head,
      "nostril",
    );
  }

  // Eyes: dark socket, amber inset, tiny stone highlight.
  for (const s of [-1, 1]) {
    sphere(
      0.082,
      CARVE,
      head.local({ left: s * 0.145, forward: 0.19, up: 0.075 }),
      [1.15, 0.8, 0.48],
      head,
      "eye_socket",
    );
    sphere(
      0.046,
      EYE,
      head.local({ left: s * 0.145, forward: 0.222, up: 0.075 }),
      [0.82, 0.72, 0.34],
      head,
      "amber_eye",
    );
    sphere(
      0.019,
      EYE_GLOW,
      head.local({ left: s * 0.13, forward: 0.242, up: 0.092 }),
      [0.7, 0.6, 0.35],
      head,
      "eye_glint",
    );
    box(
      [0.13, 0.035, 0.045],
      STONE_DARK,
      head.local({ left: s * 0.145, forward: 0.2, up: 0.16 }),
      head,
      "brow_ridge",
    );
  }

  // Fangs hang from the upper jaw, while smaller teeth rise from the lower one.
  for (const s of [-1, 1]) {
    b.spike(
      head.local({ left: s * 0.105, forward: 0.3, down: 0.11 }),
      [0, -1, 0.15],
      0.13,
      0.027,
      { color: TOOTH, bone: head, name: "upper_fang" },
    );
    b.spike(
      jaw.local({ left: s * 0.075, forward: 0.18, up: 0.02 }),
      [0, 1, 0.12],
      0.08,
      0.018,
      { color: TOOTH, bone: jaw, name: "lower_tooth" },
    );
  }

  // ---------------------------------------------------------------------------
  // Ears, horns and face ornament.
  // ---------------------------------------------------------------------------

  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.17, 0.04],
        [0.2, 0.22],
        [0.1, 0.4],
        [0.02, 0.28],
      ],
      {
        at: head.local({ left: s * 0.24, back: 0.02, up: 0.17 }),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.055,
        bevel: 0.012,
        color: STONE,
        bone: head,
        name: "pointed_ear",
      },
    );

    const hornPath = catmull([
      head.local({ left: s * 0.17, back: 0.03, up: 0.2 }),
      head.local({ left: s * 0.28, back: 0.08, up: 0.34 }),
      head.local({ left: s * 0.29, back: 0.04, up: 0.52 }),
      head.local({ left: s * 0.22, forward: 0.03, up: 0.65 }),
    ]);
    b.sweep(hornPath, [0.065, 0.042, 0.02, 0.002], {
      bone: head,
      color: STONE_DARK,
      section: { ngon: 6 },
      caps: "point",
      name: "curved_horn",
    });

    // Horn ridges make the silhouette read as carved rather than smooth.
    for (let i = 0; i < 4; i++) {
      const t = 0.16 + i * 0.18;
      const p = hornPath.at(t);
      b.ring(p, { count: 6, radius: 0.005, tilt: 18 }, (r: any) =>
        b.spike(r, r, 0.018, 0.007, { color: EDGE, name: "horn_ridge" }),
      );
    }
  }

  // A central forehead keystone.
  b.extrude(
    [
      [0, 0],
      [0.07, 0.03],
      [0.05, 0.2],
      [0, 0.29],
      [-0.05, 0.2],
      [-0.07, 0.03],
    ],
    {
      at: head.local({ forward: 0.25, up: 0.07 }),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      color: EDGE,
      bone: head,
      name: "forehead_keystone",
    },
  );

  // ---------------------------------------------------------------------------
  // Legs, paws and separated claws.
  // ---------------------------------------------------------------------------

  for (const [s, leg] of [
    [1, legL],
    [-1, legR],
  ] as const) {
    b.sweep(leg, [0.13, 0.105, 0.075], {
      bone: leg,
      color: STONE,
      section: { ngon: 6 },
      name: "rear_leg",
    });

    const ankle = leg.at(1).at;
    const paw = leg.at(1).at;
    sphere(0.105, STONE_LIGHT, paw, [1.3, 0.6, 1.45], leg.tip, "broad_paw");
    box([0.18, 0.08, 0.24], STONE_DARK, [paw[0], 0.285, paw[2] + 0.07], leg.tip, "paw_sole");

    for (let i = -1; i <= 1; i++) {
      const base: [number, number, number] = [
        paw[0] + i * 0.055,
        0.31,
        paw[2] + 0.115,
      ];
      const tip: [number, number, number] = [
        paw[0] + i * 0.075,
        0.285,
        paw[2] + 0.26 + Math.abs(i) * 0.025,
      ];
      toe(base, tip, leg.tip, 1, "rear_claw");
      sphere(0.038, STONE_LIGHT, base, [1, 0.7, 1], leg.tip, "toe_knuckle");
    }

    // Knee cap and a small carved shin plate.
    sphere(0.105, STONE_LIGHT, leg.at(0.42).at, [1.05, 0.92, 0.9], leg.joints[1], "knee_cap");
    box([0.12, 0.18, 0.035], EDGE, leg.at(0.57).at, leg.joints[1], "shin_chisel");
  }

  // ---------------------------------------------------------------------------
  // Arms and gargoyle hands gripping the ledge.
  // ---------------------------------------------------------------------------

  for (const [s, arm] of [
    [1, armL],
    [-1, armR],
  ] as const) {
    b.sweep(arm, [0.11, 0.09, 0.065], {
      bone: arm,
      color: STONE,
      section: { ngon: 6 },
      name: "forelimb",
    });
    stoneKnuckle(arm.at(0.72).at, arm.joints[2], 1.1, "elbow_stone");
    sphere(0.105, STONE_LIGHT, arm.tip.at, [1.25, 0.8, 1.15], arm.tip, "gripping_hand");

    for (let i = -1; i <= 1; i++) {
      const base: [number, number, number] = [
        arm.tip.at.x + i * 0.043,
        arm.tip.at.y - 0.015,
        arm.tip.at.z + 0.035,
      ];
      const end: [number, number, number] = [
        arm.tip.at.x + i * 0.06,
        0.35,
        arm.tip.at.z + 0.18 + Math.abs(i) * 0.035,
      ];
      toe(base, end, arm.tip, 0.82, "front_claw");
    }
  }

  // ---------------------------------------------------------------------------
  // Wings: thick stone spars with two membranes per side.
  // ---------------------------------------------------------------------------

  for (const [s, wing, finger] of [
    [1, wingL, fingerL],
    [-1, wingR, fingerR],
  ] as const) {
    b.sweep(wing, [0.095, 0.075, 0.05, 0.02], {
      bone: wing,
      color: STONE_DARK,
      section: { ngon: 5 },
      name: "wing_spar",
    });
    b.sweep(finger, [0.035, 0.026, 0.017, 0.004], {
      bone: finger,
      color: STONE_DARK,
      section: { ngon: 5 },
      caps: "point",
      name: "wing_finger",
    });

    const root = wing.at(0).at;
    const mid = wing.at(0.58).at;
    const tip = wing.at(1).at;
    const fmid = finger.at(0.56).at;
    const ftip = finger.at(1).at;

    b.membrane(
      catmull([root, mid, tip]),
      catmull([
        root,
        [mid.x, mid.y + 0.13, mid.z - 0.04],
        [tip.x, tip.y + 0.1, tip.z - 0.08],
      ]),
      {
        color: STONE,
        thickness: 0.018,
        rows: 4,
        cols: 8,
        scallop: 0.14,
        name: "upper_wing_membrane",
      },
    );
    b.membrane(
      catmull([mid, fmid, ftip]),
      catmull([
        mid,
        [fmid.x, fmid.y - 0.16, fmid.z + 0.03],
        [ftip.x, ftip.y - 0.13, ftip.z + 0.02],
      ]),
      {
        color: STONE_LIGHT,
        thickness: 0.015,
        rows: 3,
        cols: 7,
        scallop: 0.2,
        name: "lower_wing_membrane",
      },
    );

    // Wing edge chips and small triangular ribs.
    for (let i = 0; i < 5; i++) {
      const t = 0.15 + i * 0.17;
      const a = wing.at(t).at;
      b.spike(a, [0, 0.12, -0.12], 0.075, 0.018, {
        color: EDGE,
        bone: wing.at(t).bone,
        name: "wing_edge_chip",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Tail, tail barbs and a terminal arrowhead.
  // ---------------------------------------------------------------------------

  b.sweep(tail, (t) => 0.14 * (1 - t) + 0.035, {
    bone: tail,
    color: STONE_DARK,
    section: { ngon: 6 },
    name: "ridged_tail",
  });
  for (let i = 0; i < 7; i++) {
    const t = 0.08 + i * 0.13;
    const p = tail.at(t).at;
    b.spike(p, [0, 0.15, -0.25], 0.09 - i * 0.006, 0.025 - i * 0.002, {
      color: EDGE,
      bone: tail.at(t).bone,
      name: "tail_ridge",
    });
  }
  const tailTip = tail.at(1).at;
  b.extrude(
    [
      [0, 0],
      [0.12, 0.08],
      [0.02, 0.28],
      [-0.1, 0.08],
    ],
    {
      at: tailTip,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      color: STONE_LIGHT,
      bone: tail.tip,
      name: "tail_arrowhead",
    },
  );

  // ---------------------------------------------------------------------------
  // Stone-carving detail: shoulder plates, ribs, belly blocks and moss.
  // ---------------------------------------------------------------------------

  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const p = spine.at(0.3 + i * 0.16).at;
      b.extrude(
        [
          [0, 0],
          [0.1, 0.035],
          [0.07, 0.12],
          [0.015, 0.16],
        ],
        {
          at: [p.x + s * (0.2 - i * 0.018), p.y + 0.02, p.z + 0.08],
          x: [s, 0, 0],
          y: [0, 1, 0],
          thickness: 0.028,
          color: STONE_LIGHT,
          bone: spine.at(0.3 + i * 0.16).bone,
          name: "rib_plate",
        },
      );
    }
  }

  for (let i = 0; i < 5; i++) {
    const p = spine.at(0.18 + i * 0.15).at;
    box(
      [0.24 - i * 0.018, 0.035, 0.03],
      EDGE,
      [p.x, p.y - 0.19, p.z + 0.18],
      spine.at(0.18 + i * 0.15).bone,
      "belly_carving",
    );
  }

  // A few deliberately placed moss patches, concentrated on upward ledges and wing roots.
  for (const p of [
    [0.12, 0.39, 0.62],
    [-0.3, 0.39, 0.61],
    [0.5, 1.52, -0.08],
    [-0.55, 1.48, -0.1],
    [0.2, 0.71, -0.94],
  ] as [number, number, number][]) {
    sphere(0.035, MOSS, p, [1.8, 0.35, 1.2], undefined, "moss_patch");
  }
  for (const p of [
    [0.18, 0.405, 0.64],
    [-0.34, 0.405, 0.63],
    [0.53, 1.56, -0.08],
    [-0.58, 1.52, -0.1],
  ] as [number, number, number][]) {
    b.spike(p, [0, 0.3, 0.05], 0.055, 0.012, {
      color: MOSS_LIGHT,
      name: "moss_blade",
    });
  }

  // Dark linework around the mouth and several carved glyphs on the ledge.
  b.sweep(
    catmull([
      head.local({ left: -0.15, forward: 0.405, down: 0.105 }),
      head.local({ forward: 0.45, down: 0.13 }),
      head.local({ left: 0.15, forward: 0.405, down: 0.105 }),
    ]),
    0.009,
    { color: INK, bone: head, name: "mouth_crease" },
  );

  for (const x of [-0.62, -0.31, 0, 0.31, 0.62]) {
    b.extrude(
      [
        [0, 0],
        [0.035, 0.03],
        [0, 0.12],
        [-0.035, 0.03],
      ],
      {
        at: [x, 0.405, 0.65],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.008,
        color: CARVE,
        name: "ledge_glyph",
      },
    );
  }

  // Small stone bolts at major wing joints, like old repaired cathedral masonry.
  for (const p of [
    wingL.joints[1].at,
    wingL.joints[2].at,
    wingR.joints[1].at,
    wingR.joints[2].at,
    armL.joints[1].at,
    armR.joints[1].at,
  ]) {
    sphere(0.035, EDGE, p, [1, 1, 0.5], undefined, "stone_bolt");
  }

  return b.root;
}
```