import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  paint,
  frame,
} from "../../../../src/index";

export const meta = {
  name: "alebrije-jaguar-eagle",
  description:
    "A vivid Oaxacan alebrije: a spotted jaguar body with eagle wings, crest, beak, talons, painted wood facets, and a curling ornamented tail.",
};

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  const ORANGE = "#e86b24";
  const ORANGE2 = "#f39a28";
  const RED = "#c9362d";
  const MAGENTA = "#b52c72";
  const TURQUOISE = "#19a7a0";
  const TEAL = "#087d83";
  const BLUE = "#3157a6";
  const YELLOW = "#f4c83d";
  const CREAM = "#f5d99b";
  const BONE = "#e8c98c";
  const BROWN = "#633321";
  const DARK = "#241b25";
  const BLACK = "#17141c";
  const GREEN = "#4d9b46";
  const PURPLE = "#633f9d";

  const rngSpots = rng(41);

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
    bone?: any,
    scale?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      bone,
      scale,
      name,
      flat: true,
    });

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: any,
    dir: [number, number, number],
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius * 0.92, height, 8), color, {
      at,
      dir,
      bone,
      name,
      flat: true,
    });

  const cone = (
    radius: number,
    height: number,
    color: string,
    at: any,
    dir: [number, number, number],
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.ConeGeometry(radius, height, 7), color, {
      at,
      dir,
      bone,
      name,
      flat: true,
    });

  // ---------------------------------------------------------------------------
  // Skeleton first: a compact jaguar body, four legs, neck/head, jaw, wings, tail.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.87, -0.22],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [-0.02, 0.88, -0.58],
      [0, 0.98, -0.25],
      [0, 1.02, 0.08],
      [0, 1.03, 0.38],
      [0, 1.02, 0.62],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "spine3", "spine4", "chest"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.02, 0.55],
      [0, 1.12, 0.72],
      [0, 1.28, 0.84],
      [0, 1.43, 0.92],
    ]),
    {
      parent: spine.tip!,
      names: ["neck1", "neck2", "neck3", "neck4"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.48, 0.98],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.39, 1.03],
    dir: [0, -0.16, 1],
    role: "jaw",
    group: "head",
  });

  const legs: Record<string, any> = {};
  const legSpecs = [
    ["legL", [0.32, 0.83, 0.31], [0.39, 0.54, 0.39], ["hipL", "kneeL", "ankleL", "pawL"]],
    ["legR", [-0.32, 0.83, 0.31], [-0.39, 0.54, 0.39], ["hipR", "kneeR", "ankleR", "pawR"]],
    ["legL", [0.34, 0.83, -0.43], [0.40, 0.52, -0.55], ["hindHipL", "hindKneeL", "hindAnkleL", "hindPawL"]],
    ["legR", [-0.34, 0.83, -0.43], [-0.40, 0.52, -0.55], ["hindHipR", "hindKneeR", "hindAnkleR", "hindPawR"]],
  ] as const;

  for (const [sideName, root, target, names] of legSpecs) {
    const side = root[0] > 0 ? "L" : "R";
    const pts = limb(
      root,
      target,
      [0.27, 0.26, 0.22],
      [
        [0, 0, side === "L" ? 1 : -1],
        [0, 0, side === "L" ? -1 : 1],
      ],
      { sole: [0, 0, 1] },
    );
    legs[`${sideName}${root[2] > 0 ? "front" : "rear"}`] = b.chain(
      names[0],
      pts,
      {
        parent: side === "L" ? hips : hips,
        names: [...names],
        role: "leg",
        contact: target,
      },
    );
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.92, -0.62],
      [0, 0.84, -0.9],
      [0.06, 0.78, -1.18],
      [0.17, 0.82, -1.43],
      [0.28, 0.94, -1.61],
      [0.35, 1.10, -1.71],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
      role: "tail",
    },
  );

  const wingL = b.chain(
    "wingL",
    catmull([
      [0.25, 1.18, 0.39],
      [0.55, 1.30, 0.33],
      [0.88, 1.40, 0.22],
      [1.17, 1.34, 0.04],
      [1.43, 1.17, -0.12],
    ]),
    {
      parent: spine.joints[2],
      names: ["wingL1", "wingL2", "wingL3", "wingL4", "wingLTip"],
      role: "wing",
    },
  );

  const wingR = b.chain(
    "wingR",
    catmull([
      [-0.25, 1.18, 0.39],
      [-0.55, 1.30, 0.33],
      [-0.88, 1.40, 0.22],
      [-1.17, 1.34, 0.04],
      [-1.43, 1.17, -0.12],
    ]),
    {
      parent: spine.joints[2],
      names: ["wingR1", "wingR2", "wingR3", "wingR4", "wingRTip"],
      role: "wing",
    },
  );

  // ---------------------------------------------------------------------------
  // Main wooden forms.
  // ---------------------------------------------------------------------------

  const bodyPaint = paint((p, n) => {
    const stripe = Math.sin(p.z * 28 + p.y * 3) > 0.72;
    if (stripe && n.y > -0.55) return MAGENTA;
    if (n.y < -0.22) return ORANGE2;
    return ORANGE;
  });

  const torsoSweep = b.sweep(spine, (t) => 0.27 - t * 0.035, {
    color: bodyPaint,
    sides: 8,
    caps: "round",
    name: "faceted_jaguar_torso",
  });

  b.sweep(neck, (t) => 0.22 - t * 0.035, {
    color: RED,
    sides: 8,
    caps: "round",
    name: "red_neck",
  });

  b.sweep(tail, (t) => 0.13 - t * 0.105, {
    color: bodyPaint,
    sides: 7,
    caps: "round",
    name: "curling_tail",
  });

  // Belly patch, shoulder saddle, and rump panels.
  box([0.34, 0.30, 0.58], CREAM, [0, 0.91, 0.34], spine.joints[2], "belly_panel");
  box([0.52, 0.22, 0.28], TURQUOISE, [0, 1.18, 0.16], spine.joints[2], "shoulder_saddle");
  box([0.42, 0.18, 0.28], YELLOW, [0, 0.88, -0.48], hips, "rump_panel");

  // Chest ruff blocks.
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.075;
    cone(0.065, 0.20, i % 2 ? YELLOW : CREAM, [x, 1.18, 0.73], [0, 0.35, 1], spine.tip, "chest_ruff");
  }

  // ---------------------------------------------------------------------------
  // Legs, knees, ankle cuffs, paws and jaguar toe beans.
  // ---------------------------------------------------------------------------

  for (const [key, chain] of Object.entries(legs)) {
    const left = key.includes("L");
    const front = key.includes("front");
    const accent = front ? TURQUOISE : BLUE;
    b.sweep(chain, (t) => (t < 0.55 ? 0.105 : 0.075), {
      color: accent,
      sides: 7,
      caps: "round",
      name: key + "_painted_leg",
    });

    const knee = chain.at(0.45);
    const ankle = chain.at(0.78);
    sphere(0.115, YELLOW, knee.at, knee.bone, [1, 0.72, 1], key + "_knee_medallion");
    b.sweep(
      catmull([
        [ankle.at.x - 0.075, ankle.at.y, ankle.at.z],
        [ankle.at.x, ankle.at.y + 0.025, ankle.at.z + 0.02],
        [ankle.at.x + 0.075, ankle.at.y, ankle.at.z],
      ]),
      0.018,
      { color: MAGENTA, sides: 6, caps: "round", name: key + "_ankle_band" },
    );

    const paw = chain.at(1);
    box([0.22, 0.12, 0.29], CREAM, paw.at, paw.bone, key + "_paw");
    for (let t = -1; t <= 1; t++) {
      const toe = [paw.at.x + t * 0.06, 0.045, paw.at.z + 0.14] as [number, number, number];
      cone(0.045, 0.16, DARK, toe, [0, 0, 1], paw.bone, key + "_claw");
      sphere(0.028, RED, [paw.at.x + t * 0.065, 0.075, paw.at.z + 0.02], paw.bone, undefined, key + "_toe_bean");
    }
  }

  // Painted leg glyphs and dots.
  for (const key of Object.keys(legs)) {
    const chain = legs[key];
    for (let i = 0; i < 4; i++) {
      const p = chain.at(0.12 + i * 0.18);
      sphere(0.025, i % 2 ? YELLOW : MAGENTA, p.at, p.bone, [1, 0.4, 1], key + "_spot");
    }
  }

  // ---------------------------------------------------------------------------
  // Head: jaguar skull, muzzle, ears, eyes, brows, beak-like golden nose.
  // ---------------------------------------------------------------------------

  const skull = sphere(
    0.29,
    RED,
    head.at,
    head,
    [1.0, 0.94, 1.12],
    "large_jaguar_eagle_head",
  );

  // Brow plates and cheek ruffs.
  box([0.17, 0.09, 0.16], MAGENTA, head.local([0.13, 0.02, 0.18]), head, "browL");
  box([0.17, 0.09, 0.16], MAGENTA, head.local([-0.13, 0.02, 0.18]), head, "browR");

  for (const s of [1, -1]) {
    cone(0.09, 0.27, YELLOW, head.local([s * 0.18, 0.02, 0.04]), [s * 0.5, 0.4, 0.5], head, "cheek_ruff");
    cone(0.075, 0.22, CREAM, head.local([s * 0.22, -0.04, 0.10]), [s * 0.5, -0.1, 0.8], head, "cheek_fang");
  }

  // Oversized eyes: dark sockets, turquoise irises, yellow highlights.
  for (const s of [1, -1]) {
    const eyeAt = head.local([s * 0.115, 0.055, 0.245]);
    sphere(0.078, BLACK, eyeAt, head, [1.0, 0.82, 0.48], "eye_socket");
    sphere(0.053, TURQUOISE, head.local([s * 0.115, 0.06, 0.275]), head, [1, 0.8, 0.35], "turquoise_iris");
    sphere(0.021, BLACK, head.local([s * 0.115, 0.07, 0.304]), head, [0.65, 1.0, 0.35], "vertical_pupil");
    sphere(0.014, YELLOW, head.local([s * 0.087, 0.088, 0.316]), head, undefined, "eye_glint");
    cone(0.024, 0.10, DARK, head.local([s * 0.16, 0.12, 0.225]), [s * 0.2, 0.5, 0.8], head, "eyelash");
  }

  // Muzzle, open lower jaw, tongue and carved teeth.
  box([0.29, 0.17, 0.27], CREAM, head.local([0, -0.09, 0.27]), head, "cream_muzzle");
  sphere(0.09, DARK, jaw.at, jaw, [1.45, 0.45, 1.3], "open_mouth");
  box([0.26, 0.075, 0.17], RED, jaw.local([0, -0.025, 0.14]), jaw, "lower_jaw");
  box([0.10, 0.025, 0.12], MAGENTA, jaw.local([0, 0.01, 0.22]), jaw, "tongue");
  sphere(0.065, BLACK, head.local([0, 0.0, 0.405]), head, [1, 0.7, 0.5], "nose");
  cone(0.05, 0.16, BONE, head.local([0.11, -0.12, 0.37]), [0.25, -0.25, 1], jaw, "fangL");
  cone(0.05, 0.16, BONE, head.local([-0.11, -0.12, 0.37]), [-0.25, -0.25, 1], jaw, "fangR");
  for (const s of [1, -1]) {
    cone(0.025, 0.11, BONE, jaw.local([s * 0.065, 0.005, 0.22]), [s * 0.1, 0, 1], jaw, "small_tooth");
  }

  // Tall jaguar-eagle ears with painted inner petals.
  for (const s of [1, -1]) {
    const earBase = head.local([s * 0.20, 0.16, 0.03]);
    b.extrude(
      [
        [0, 0],
        [0.15, 0.05],
        [0.10, 0.32],
        [0.02, 0.46, "sharp"],
        [-0.06, 0.18],
      ],
      {
        at: earBase,
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.055,
        bevel: 0.012,
        color: RED,
        bone: head,
        name: "angular_ear",
      },
    );
    b.extrude(
      [
        [0, 0],
        [0.08, 0.04],
        [0.045, 0.25],
        [0.01, 0.33, "sharp"],
        [-0.035, 0.12],
      ],
      {
        at: head.local([s * 0.205, 0.17, 0.048]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        color: YELLOW,
        bone: head,
        name: "ear_inner",
      },
    );
  }

  // Eagle crest: a fan of bright carved feathers behind the head.
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.065;
    const h = 0.30 + (3 - Math.abs(i)) * 0.055;
    cone(
      0.065,
      h,
      [MAGENTA, YELLOW, TURQUOISE, RED, TURQUOISE, YELLOW, MAGENTA][i + 3],
      [x, 1.69 + h * 0.22, 0.82],
      [i * 0.22, 0.82, -0.05],
      head,
      "crest_feather",
    );
  }

  // Golden eagle beak projecting over the jaguar muzzle.
  b.extrude(
    [
      [-0.13, 0],
      [0.13, 0],
      [0.09, 0.13],
      [0.02, 0.28, "sharp"],
      [-0.02, 0.21],
      [-0.09, 0.13],
    ],
    {
      at: head.local([0, 0.02, 0.39]),
      x: [1, 0, 0],
      y: [0, 0.18, 1],
      thickness: 0.08,
      bevel: 0.01,
      color: YELLOW,
      bone: head,
      name: "carved_eagle_beak",
    },
  );
  box([0.17, 0.025, 0.08], RED, head.local([0, 0.12, 0.47]), head, "beak_paint_band");

  // ---------------------------------------------------------------------------
  // Wings: bold wooden feather fans with turquoise membranes and long feathers.
  // ---------------------------------------------------------------------------

  for (const [wing, s] of [
    [wingL, 1],
    [wingR, -1],
  ] as const) {
    b.sweep(wing, (t) => 0.13 - t * 0.075, {
      color: BLUE,
      sides: 7,
      caps: "round",
      name: s > 0 ? "left_wing_arm" : "right_wing_arm",
    });

    const shoulder = wing.at(0.12);
    const tip = wing.at(0.92);
    b.extrude(
      [
        [0, 0],
        [0.28, 0.05],
        [0.72, 0.22],
        [1.20, 0.04],
        [0.93, -0.12],
        [0.35, -0.08],
      ],
      {
        at: shoulder.at,
        x: [s, 0, 0],
        y: [0, 0.24, -1],
        thickness: 0.035,
        bevel: 0.008,
        color: TURQUOISE,
        bone: shoulder.bone,
        name: "wing_membrane",
      },
    );

    for (let i = 0; i < 7; i++) {
      const f = wing.at(0.30 + i * 0.095);
      const length = 0.38 + i * 0.045;
      const featherColor = i % 3 === 0 ? YELLOW : i % 3 === 1 ? MAGENTA : RED;
      b.extrude(
        [
          [0, 0],
          [0.12, 0.015],
          [0.08, length * 0.72],
          [0.02, length, "sharp"],
          [-0.065, length * 0.70],
          [-0.10, 0.03],
        ],
        {
          at: f.at,
          x: [s, 0, 0],
          y: [s * 0.12, 0.65, -0.35],
          thickness: 0.025,
          bevel: 0.006,
          color: featherColor,
          bone: f.bone,
          name: "primary_wing_feather",
        },
      );
      cone(0.018, 0.18, CREAM, [f.at.x, f.at.y + length * 0.37, f.at.z - 0.01], [0, 0.8, -0.3], f.bone, "feather_quill");
    }

    // Three large circular painted wing medallions.
    for (let i = 0; i < 3; i++) {
      const p = wing.at(0.24 + i * 0.18);
      sphere(0.075, i === 1 ? YELLOW : ORANGE2, p.at, p.bone, [1, 0.35, 1], "wing_rosette");
      sphere(0.035, i === 1 ? MAGENTA : TURQUOISE, [p.at.x, p.at.y + 0.012, p.at.z + 0.015], p.bone, [1, 0.3, 1], "wing_rosette_center");
    }
  }

  // ---------------------------------------------------------------------------
  // Alebrije ornament: painted tail rings, spots, diamonds, and carved spines.
  // ---------------------------------------------------------------------------

  for (let i = 0; i < 8; i++) {
    const p = tail.at(0.08 + i * 0.115);
    const c = [YELLOW, MAGENTA, TURQUOISE, CREAM][i % 4];
    b.sweep(
      catmull([
        [p.at.x - 0.09, p.at.y, p.at.z],
        [p.at.x, p.at.y + 0.012, p.at.z],
        [p.at.x + 0.09, p.at.y, p.at.z],
      ]),
      0.019,
      { color: c, sides: 6, caps: "round", name: "tail_painted_ring" },
    );
  }

  // Jaguar rosettes as layered disks seated around torso.
  const torsoSurface = b.surface(torsoSweep);
  const rosetteColors = [DARK, MAGENTA, TURQUOISE, BLUE];
  for (let i = 0; i < 34; i++) {
    const z = -0.52 + (i * 0.071) % 1.08;
    const side = i % 2 === 0 ? 1 : -1;
    const y = 0.91 + ((i * 37) % 5) * 0.035;
    const p = [side * (0.22 + ((i * 17) % 5) * 0.018), y, z] as [number, number, number];
    const col = rosetteColors[i % rosetteColors.length];
    sphere(0.038 + (i % 3) * 0.008, col, p, spine.joints[Math.min(3, Math.floor(i / 10))], [1, 0.18, 1], "jaguar_rosette");
    if (i % 2 === 0) {
      sphere(0.014, YELLOW, [p[0], p[1] + 0.009, p[2] + 0.012], spine.joints[Math.min(3, Math.floor(i / 10))], [1, 0.12, 1], "rosette_dot");
    }
  }

  // Raised dorsal ridge: carved alternating spikes.
  for (let i = 0; i < 8; i++) {
    const p = spine.at(0.08 + i * 0.105);
    cone(
      0.045,
      0.15 + (i % 3) * 0.035,
      i % 2 ? MAGENTA : YELLOW,
      [p.at.x, p.at.y + 0.18, p.at.z],
      [0, 1, 0],
      p.bone,
      "dorsal_carving",
    );
  }

  // Face paint: cheek diamonds and forehead glyph.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.07, 0.06],
        [0, 0.13, "sharp"],
        [-0.07, 0.06],
      ],
      {
        at: head.local([s * 0.235, 0.08, 0.17]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        color: YELLOW,
        bone: head,
        name: "cheek_diamond",
      },
    );
  }
  b.extrude(
    [
      [-0.045, 0],
      [0, 0.12, "sharp"],
      [0.045, 0],
      [0, -0.09, "sharp"],
    ],
    {
      at: head.local([0, 0.18, 0.13]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      color: TURQUOISE,
      bone: head,
      name: "forehead_glyph",
    },
  );

  // Small wooden beads at wing and tail joints.
  for (const chain of [wingL, wingR, tail]) {
    for (const t of [0.23, 0.48, 0.73, 0.91]) {
      const p = chain.at(t);
      sphere(0.035, [RED, YELLOW, GREEN, PURPLE][Math.floor(t * 10) % 4], p.at, p.bone, undefined, "ornamental_bead");
    }
  }

  // Final little whisker rods, giving the feline silhouette.
  for (const s of [1, -1]) {
    const base = head.local([s * 0.17, -0.07, 0.30]);
    b.rod(base, [s * 0.36, 1.38, 1.20], 0.009, {
      color: CREAM,
      caps: "round",
      name: "whisker_upper",
    });
    b.rod(base, [s * 0.39, 1.34, 1.08], 0.008, {
      color: CREAM,
      caps: "round",
      name: "whisker_lower",
    });
  }

  return b.root;
}
