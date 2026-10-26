```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  mottle,
  countershade,
  grain,
  paint,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A crouching gothic stone gargoyle with folded claws, snarling jaws, horns, carved wings, a spined tail, and a weathered cathedral ledge.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 0.8, paintSize: 1024 });

  const STONE_BASE = "#68656a";
  const STONE_DARK = "#3d3a40";
  const STONE_LIGHT = "#9b9695";
  const STONE = countershade(
    mottle(STONE_BASE, STONE_LIGHT, { size: 0.24, contrast: 1.3, seed: 17 }),
    "#47454b",
    { level: -0.12, soft: 0.38 },
  );
  const STONE_EDGE = grain("#59565c", "#8f8987", { size: 0.08, axis: "y", seed: 12 });
  const BELLY = countershade("#8e8989", "#504d53", { level: -0.05, soft: 0.45 });
  const CREVICE = "#211f27";
  const EYE = "#b9c8bd";
  const EYE_DARK = "#101117";
  const MOSS = "#485644";
  const BRONZE = "#554b43";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any = STONE,
    opts: any = {},
  ) => b.part(new THREE.BoxGeometry(...size), color, { at, ...opts });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: any = STONE,
    scale: [number, number, number] = [1, 1, 1],
    bone?: any,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
      at,
      scale,
      bone,
      flat: true,
    });

  const claw = (base: any, tip: [number, number, number], radius = 0.025) =>
    b.spike(base, tip, null, radius, {
      color: STONE_DARK,
      caps: "point",
      section: { ngon: 6 },
    });

  // ---------------------------------------------------------------------------
  // Cathedral ledge: chunky carved masonry, simpler than the creature.
  // ---------------------------------------------------------------------------

  box([2.9, 0.28, 1.28], [0, 0.14, 0], STONE_EDGE, { name: "ledge_cap", group: "scenery" });
  box([2.65, 0.42, 1.05], [0, -0.07, -0.08], STONE, { name: "ledge_block", group: "scenery" });

  for (const s of [-1, 1]) {
    box([0.42, 0.62, 0.78], [s * 1.04, 0.42, -0.04], STONE, {
      name: `ledge_corbel_${s}`,
      group: "scenery",
    });
    box([0.5, 0.16, 0.92], [s * 1.02, 0.77, -0.02], STONE_EDGE, {
      name: `ledge_bracket_${s}`,
      group: "scenery",
    });
    b.sweep(
      catmull([
        [s * 0.98, 0.54, 0.44],
        [s * 0.77, 0.36, 0.38],
        [s * 0.7, 0.28, 0.16],
      ]),
      0.045,
      { color: STONE_DARK, caps: "flat", group: "scenery" },
    );
  }

  const rune = svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="64" fill="#26232a"/>
      <path d="M10 48L24 14L39 48M16 36H33M48 14L65 48L82 14M52 38H77M92 14V48M84 18H101M84 44H101"
        fill="none" stroke="#c3b17e" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="112" cy="31" r="10" fill="none" stroke="#c3b17e" stroke-width="3"/>
      <path d="M112 18V44M99 31H125" stroke="#c3b17e" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.72, 0.36), BRONZE, {
    at: [0, 0.18, 0.648],
    dir: [0, 0, 1],
    axis: "z",
    texture: rune,
    name: "carved_ward",
    group: "scenery",
  });

  // ---------------------------------------------------------------------------
  // Skeleton first: a compact crouching quadruped torso, neck, jaw, tail, legs,
  // and broad raised wings.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", { at: [0, 0.98, -0.08], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, -0.22],
      [0, 1.08, 0.04],
      [0, 1.2, 0.3],
      [0, 1.3, 0.5],
    ]),
    {
      parent: hips,
      names: ["pelvis", "back", "chest", "shoulder"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.28, 0.47],
      [0, 1.39, 0.58],
      [0, 1.47, 0.68],
    ]),
    {
      parent: spine.tip,
      names: ["neckBase", "neckTop", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.5, 0.7],
    dir: [0, 0.06, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.42, 0.76],
    aim: [0, 1.35, 1.05],
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.98, -0.25],
      [0, 0.94, -0.56],
      [0, 0.82, -0.91],
      [0, 0.68, -1.18],
      [0, 0.58, -1.4],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
    },
  );

  const legs: any[] = [];
  for (const s of [-1, 1]) {
    const hind = limb(
      [s * 0.22, 0.98, -0.17],
      [s * 0.42, 0.43, 0.19],
      [0.3, 0.27, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      { sole: [0, 1, 0] },
    );
    legs.push(
      b.chain(`legH${s > 0 ? "L" : "R"}`, hind, {
        parent: hips,
        names: [
          `hip${s > 0 ? "L" : "R"}`,
          `knee${s > 0 ? "L" : "R"}`,
          `ankle${s > 0 ? "L" : "R"}`,
          `foot${s > 0 ? "L" : "R"}`,
        ],
        role: "leg",
        contact: [s * 0.42, 0.3, 0.19],
      }),
    );
  }

  const wings: any[] = [];
  for (const s of [-1, 1]) {
    const wing = b.chain(
      `wing${s > 0 ? "L" : "R"}`,
      catmull([
        [s * 0.27, 1.23, 0.24],
        [s * 0.58, 1.48, 0.13],
        [s * 0.91, 1.76, -0.08],
        [s * 1.24, 1.52, -0.36],
      ]),
      {
        parent: spine.joints[2],
        names: [
          `wingRoot${s > 0 ? "L" : "R"}`,
          `wingElbow${s > 0 ? "L" : "R"}`,
          `wingFinger${s > 0 ? "L" : "R"}`,
          `wingTip${s > 0 ? "L" : "R"}`,
        ],
        role: "wing",
      },
    );
    wings.push(wing);
  }

  // ---------------------------------------------------------------------------
  // Torso and head masses.
  // ---------------------------------------------------------------------------

  b.sweep(spine, (t) => 0.2 - t * 0.035, {
    color: STONE,
    section: { ngon: 8 },
    sides: 8,
    name: "ribbed_torso",
    group: "body",
  });

  b.sweep(neck, [0.15, 0.115], {
    color: STONE,
    section: { ngon: 7 },
    sides: 7,
    name: "stone_neck",
    group: "body",
  });

  b.sweep(tail, (t) => 0.115 * (1 - t) + 0.028, {
    color: STONE_DARK,
    section: { ngon: 7 },
    sides: 7,
    name: "barbed_tail",
    group: "body",
  });

  for (const s of [-1, 1]) {
    const leg = legs[s === 1 ? 1 : 0];
    b.sweep(leg, (t) => 0.105 - t * 0.065, {
      color: STONE,
      section: { ngon: 6 },
      sides: 6,
      name: `crouched_leg_${s}`,
      group: "legs",
    });
    const foot = leg.tip;
    box([0.2, 0.12, 0.28], [s * 0.42, 0.37, 0.23], STONE_DARK, {
      bone: foot,
      name: `stone_foot_${s}`,
      group: "legs",
    });
    for (let i = 0; i < 3; i++) {
      const x = s * (0.35 + i * 0.07);
      claw(foot, [x, 0.34, 0.38 + (i % 2) * 0.025], 0.026);
    }
  }

  // Broad rib plates and a pale carved belly.
  for (let i = 0; i < 4; i++) {
    const z = -0.05 + i * 0.13;
    b.part(new THREE.SphereGeometry(0.18, 8, 5), BELLY, {
      bone: spine.joints[Math.min(i, 2)],
      at: [0, 1.07 + i * 0.045, z],
      scale: [0.74, 0.8, 0.48],
      name: `belly_plate_${i}`,
      group: "body",
    });
  }

  const skull = sphere(0.22, [0, 1.52, 0.76], STONE, [1.12, 1.05, 1.18], head);
  box([0.28, 0.19, 0.34], [0, 1.45, 0.91], STONE_LIGHT, {
    bone: head,
    name: "heavy_muzzle",
    group: "face",
  });
  sphere(0.075, [0, 1.46, 1.09], STONE_DARK, [1.45, 0.65, 0.7], head);

  // Brow ridges and swept horns.
  for (const s of [-1, 1]) {
    b.sweep(
      catmull([
        [s * 0.08, 1.61, 0.91],
        [s * 0.16, 1.65, 0.86],
        [s * 0.22, 1.61, 0.78],
      ]),
      [0.045, 0.018],
      { color: STONE_DARK, bone: head, caps: "point", name: `brow_${s}`, group: "face" },
    );

    const horn = catmull([
      [s * 0.13, 1.67, 0.7],
      [s * 0.21, 1.84, 0.62],
      [s * 0.26, 1.98, 0.48],
    ]);
    b.sweep(horn, [0.06, 0], {
      color: STONE_EDGE,
      bone: head,
      caps: { start: "round", end: "point" },
      name: `horn_${s}`,
      group: "face",
    });

    // Large pointed ears.
    b.extrude(
      [
        [0, 0],
        [0.12, 0.03],
        [0.18, 0.34, "sharp"],
        [0.035, 0.2],
      ],
      {
        at: [s * 0.17, 1.62, 0.68],
        x: [s, 0, 0],
        y: [0, 0.96, 0.12],
        thickness: 0.045,
        bevel: 0.01,
        color: STONE,
        bone: head,
        name: `pointed_ear_${s}`,
        group: "face",
      },
    );

    // Eyes set deep beneath the brows.
    sphere(0.045, [s * 0.105, 1.555, 0.965], EYE, [1.0, 0.8, 0.6], head);
    sphere(0.018, [s * 0.105, 1.555, 1.004], EYE_DARK, [1, 1, 0.45], head);
  }

  // Nose, nostrils, cheek stones.
  sphere(0.065, [0, 1.47, 1.115], CREVICE, [1.1, 0.75, 0.7], head);
  for (const s of [-1, 1]) {
    sphere(0.025, [s * 0.045, 1.48, 1.135], STONE_LIGHT, [1, 0.55, 0.4], head);
    b.sweep(
      [
        [s * 0.14, 1.48, 0.99],
        [s * 0.2, 1.42, 0.91],
        [s * 0.17, 1.35, 0.84],
      ],
      0.026,
      { color: STONE_DARK, bone: head, caps: "flat", name: `cheek_rug_${s}`, group: "face" },
    );
  }

  // Separate upper and lower jaws; the lower jaw is hinged and slightly open.
  b.sweep(
    [
      [0, 1.45, 0.98],
      [0, 1.42, 1.14],
    ],
    [0.13, 0.09],
    { color: STONE_LIGHT, bone: head, caps: "flat", name: "upper_jaw", group: "jaw" },
  );
  b.sweep(
    [
      [0, 1.405, 0.98],
      [0, 1.335, 1.14],
    ],
    [0.11, 0.035],
    { color: STONE_DARK, bone: jaw, caps: "flat", name: "lower_jaw", group: "jaw" },
  );
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });

  for (const s of [-1, 1]) {
    b.spike([s * 0.075, 1.42, 1.05], [s * 0.07, 1.28, 1.11], 0.14, 0.025, {
      color: STONE_LIGHT,
      bone: jaw,
      name: `fang_${s}`,
      group: "jaw",
    });
    b.spike([s * 0.055, 1.45, 1.075], [s * 0.05, 1.34, 1.13], 0.1, 0.018, {
      color: STONE_LIGHT,
      bone: head,
      name: `upper_fang_${s}`,
      group: "jaw",
    });
  }

  // ---------------------------------------------------------------------------
  // Wings: heavy stone spars plus membranes, ribs, and hooked wing fingers.
  // ---------------------------------------------------------------------------

  for (const s of [-1, 1]) {
    const wing = wings[s === 1 ? 1 : 0];
    b.sweep(wing, (t) => 0.09 - t * 0.055, {
      color: STONE_EDGE,
      section: { ngon: 6 },
      sides: 6,
      name: `wing_spar_${s}`,
      group: "wings",
    });

    const outer = [
      [s * 0.28, 1.23, 0.23],
      [s * 0.62, 1.72, 0.0],
      [s * 0.98, 1.91, -0.22],
      [s * 1.26, 1.52, -0.38],
    ];
    b.membrane(wing, outer, {
      color: STONE,
      thickness: 0.018,
      rows: 4,
      cols: 7,
      scallop: 0.08,
      name: `wing_membrane_${s}`,
      group: "wings",
    });

    for (let i = 1; i < outer.length; i++) {
      b.sweep(
        [
          [s * (0.28 + i * 0.1), 1.28 + i * 0.08, 0.2 - i * 0.04],
          outer[i],
        ],
        [0.022, 0.009],
        {
          color: STONE_DARK,
          bone: wing.joints[Math.min(i, wing.joints.length - 1)],
          caps: "flat",
          name: `wing_rib_${s}_${i}`,
          group: "wings",
        },
      );
    }

    b.spike(wing.tip, [s * 1.42, 1.4, -0.58], 0.28, 0.035, {
      color: STONE_DARK,
      bone: wing.tip,
      caps: "point",
      name: `wing_hook_${s}`,
      group: "wings",
    });
  }

  // ---------------------------------------------------------------------------
  // Tail plates and shoulder gargoyle ornament.
  // ---------------------------------------------------------------------------

  for (let i = 0; i < 5; i++) {
    const t = 0.1 + i * 0.18;
    const p = tail.at(t);
    b.spike(p, p, 0.12 - i * 0.014, 0.035 - i * 0.004, {
      color: STONE_LIGHT,
      bone: p.bone,
      name: `tail_spine_${i}`,
      group: "tail",
    });
  }

  for (const s of [-1, 1]) {
    b.spike([s * 0.28, 1.26, 0.32], [s * 0.42, 1.43, 0.29], 0.2, 0.05, {
      color: STONE_LIGHT,
      bone: spine.joints[2],
      caps: "point",
      name: `shoulder_spike_${s}`,
      group: "body",
    });
  }

  // A few moss patches only on upward ledge faces.
  b.part(new THREE.BoxGeometry(0.72, 0.025, 0.18), MOSS, {
    at: [0.58, 0.305, -0.3],
    name: "moss_patch",
    group: "scenery",
  });

  return b.root;
}
```