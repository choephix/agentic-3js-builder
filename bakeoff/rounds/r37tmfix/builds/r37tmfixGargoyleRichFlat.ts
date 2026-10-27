import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  limb,
  rng,
  frame,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A crouching gothic stone gargoyle perched on a carved cathedral ledge, with open jaws, horns, talons, ridged wings, a curled tail, and faintly glowing eyes.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  const STONE = "#55545a";
  const STONE_LIGHT = "#77747a";
  const STONE_DARK = "#302f35";
  const STONE_WARM = "#686269";
  const EDGE = "#8b8588";
  const CREVICE = "#211f25";
  const EYE = "#d89a39";
  const EYE_HI = "#fff0a4";
  const MOSS = "#465844";
  const LEDGE = "#3b3940";
  const LEDGE_TOP = "#666168";
  const IRON = "#242329";

  const box = (
    size: [number, number, number],
    color: string,
    at: any,
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
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
    bone?: any,
    dir: [number, number, number] = [0, 1, 0],
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius * 1.05, height, 8), color, {
      at,
      bone,
      dir,
      name,
      flat: true,
    });

  const wedge = (
    points: [number, number, number][],
    color: string,
    bone?: any,
    name?: string,
  ) => b.slab(points, { color, bone, thickness: 0.035, name });

  const spike = (
    base: any,
    tip: any,
    radius: number,
    color: string,
    name?: string,
  ) => b.spike(base, tip, null, radius, { color, name });

  // ---------------------------------------------------------------------------
  // Skeleton first: one root, a hunched spine, articulated jaw, limbs, wings,
  // and tail. The rest pose is broad and readable for rigging.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.86, -0.12],
    dir: [0, 0.2, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.86, -0.12],
      [0, 1.03, -0.08],
      [0, 1.23, 0.02],
      [0, 1.38, 0.16],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "spine3", "shoulders"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.38, 0.16],
      [0, 1.49, 0.28],
      [0, 1.59, 0.43],
    ]),
    {
      parent: spine.tip!,
      names: ["neck1", "neck2", "neck3"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.62, 0.47],
    dir: [0, 0.08, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.52, 0.61],
    dir: [0, -0.34, 0.94],
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.93, -0.25],
      [0, 0.81, -0.57],
      [0, 0.75, -0.9],
      [0, 0.83, -1.22],
      [0.12, 1.02, -1.48],
      [0.3, 1.22, -1.6],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
      role: "tail",
    },
  );

  const legData = [
    {
      s: 1,
      hip: [0.25, 0.91, -0.1] as [number, number, number],
      knee: [0.43, 0.59, 0.13] as [number, number, number],
      ankle: [0.36, 0.29, 0.31] as [number, number, number],
      foot: [0.38, 0.235, 0.52] as [number, number, number],
      names: ["hipL", "kneeL", "ankleL", "footL"],
    },
    {
      s: -1,
      hip: [-0.25, 0.91, -0.1] as [number, number, number],
      knee: [-0.43, 0.59, 0.13] as [number, number, number],
      ankle: [-0.36, 0.29, 0.31] as [number, number, number],
      foot: [-0.38, 0.235, 0.52] as [number, number, number],
      names: ["hipR", "kneeR", "ankleR", "footR"],
    },
  ];

  const legs: any[] = [];
  for (const d of legData) {
    const pts = limb(
      d.hip,
      d.foot,
      [0.31, 0.29, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      { sole: [0, 0, 1] },
    );
    const chain = b.chain(
      d.s > 0 ? "legL" : "legR",
      pts,
      {
        parent: hips,
        names: d.names,
        role: "leg",
        contact: d.foot,
      },
    );
    legs.push({ d, chain });
  }

  const wingChains: any[] = [];
  for (const s of [1, -1]) {
    const shoulder = [s * 0.34, 1.31, 0.08] as [number, number, number];
    const wrist = [s * 0.79, 1.76, -0.04] as [number, number, number];
    const tip = [s * 1.02, 2.13, -0.25] as [number, number, number];
    const wing = b.chain(
      s > 0 ? "wingL" : "wingR",
      catmull([shoulder, [s * 0.56, 1.55, 0.03], wrist, tip]),
      {
        parent: spine.joints[1],
        names: s > 0 ? ["wingL1", "wingL2", "wingL3"] : ["wingR1", "wingR2", "wingR3"],
        role: "wing",
      },
    );
    wingChains.push({ s, shoulder, wrist, tip, wing });
  }

  const armChains: any[] = [];
  for (const s of [1, -1]) {
    const arm = b.chain(
      s > 0 ? "armL" : "armR",
      polyline([
        [s * 0.29, 1.27, 0.21],
        [s * 0.51, 1.07, 0.34],
        [s * 0.7, 0.92, 0.47],
      ]),
      {
        parent: spine.joints[1],
        names: s > 0 ? ["shoulderL", "elbowL", "wristL"] : ["shoulderR", "elbowR", "wristR"],
        role: "arm",
      },
    );
    armChains.push({ s, arm });
  }

  // ---------------------------------------------------------------------------
  // Cathedral ledge: simple, heavy, and subordinate to the creature.
  // ---------------------------------------------------------------------------

  box([1.9, 0.18, 1.2], LEDGE, [0, 0.09, 0.05], undefined, "ledge_block");
  box([2.05, 0.08, 1.3], LEDGE_TOP, [0, 0.22, 0.05], undefined, "ledge_cap");
  box([2.15, 0.1, 0.12], STONE_DARK, [0, 0.28, 0.62], undefined, "ledge_front_lip");
  box([0.17, 0.44, 0.28], LEDGE, [-0.84, 0.45, 0.05], undefined, "ledge_bracketL");
  box([0.17, 0.44, 0.28], LEDGE, [0.84, 0.45, 0.05], undefined, "ledge_bracketR");

  // Carved quatrefoil reliefs on the front edge.
  for (const x of [-0.62, -0.2, 0.2, 0.62]) {
    cylinder(0.085, 0.025, STONE_LIGHT, [x, 0.285, 0.68], undefined, [0, 0, 1], "ledge_rosette");
    sphere(0.038, STONE_DARK, [x, 0.285, 0.704], undefined, [1.5, 0.7, 0.5], "rosette_center");
  }

  // ---------------------------------------------------------------------------
  // Main stone body: broad haunches, a hunched ribcage, shoulders, and belly.
  // ---------------------------------------------------------------------------

  const body = b.sweep(
    spine,
    (t: number) => 0.28 - t * 0.07,
    {
      color: STONE,
      section: { ngon: 8 },
      bands: [
        [0.36, STONE_WARM],
        [0.72, STONE_LIGHT],
        [1, STONE],
      ],
      name: "carved_spine",
    },
  );

  sphere(0.34, STONE_DARK, [0, 0.87, -0.12], hips, [1.25, 0.85, 1.05], "left_haunch");
  sphere(0.34, STONE_DARK, [0, 0.91, -0.12], hips, [1.25, 0.85, 1.05], "right_haunch");
  sphere(0.3, STONE, [0, 1.23, 0.05], spine.joints[1], [1.12, 1.0, 0.85], "ribcage");
  sphere(0.22, STONE_LIGHT, [0, 1.32, 0.2], spine.tip, [1.35, 0.8, 0.9], "shoulder_mass");

  // Rib and belly carving lines.
  for (let i = 0; i < 4; i++) {
    const z = -0.02 + i * 0.075;
    b.rod(
      [-0.18, 1.13 + i * 0.045, z],
      [0.18, 1.13 + i * 0.045, z],
      0.012,
      { color: CREVICE, bone: spine.joints[1], name: "rib_groove" },
    );
  }
  b.sweep(
    catmull([
      [-0.21, 1.02, 0.28],
      [0, 0.98, 0.34],
      [0.21, 1.02, 0.28],
    ]),
    0.018,
    { color: STONE_DARK, bone: hips, name: "belly_seam" },
  );

  // ---------------------------------------------------------------------------
  // Head and face, settled before horns and wings.
  // ---------------------------------------------------------------------------

  const skull = sphere(
    0.29,
    STONE_LIGHT,
    [0, 1.65, 0.48],
    head,
    [1.18, 1.02, 0.98],
    "massive_skull",
  );

  // Brow shelf and cheek planes.
  box([0.48, 0.09, 0.16], STONE_DARK, head.local([0, 0.05, 0.17]), head, "brow_shelf");
  sphere(0.14, STONE, head.local([0.18, -0.02, 0.16]), head, [1.0, 0.85, 1.2], "cheekL");
  sphere(0.14, STONE, head.local([-0.18, -0.02, 0.16]), head, [1.0, 0.85, 1.2], "cheekR");

  // Muzzle and nose.
  const muzzle = sphere(0.2, STONE_WARM, head.local([0, 0.02, 0.25]), head, [1.2, 0.7, 0.85], "muzzle");
  sphere(0.075, STONE_DARK, head.local([0, -0.01, 0.42]), head, [1.1, 0.75, 0.7], "nose");

  // Deep separate mouth cavity, upper jaw, lower jaw, and carved teeth.
  box([0.27, 0.06, 0.16], CREVICE, head.local([0, -0.1, 0.38]), head, "mouth_cavity");
  b.rod(
    head.local([-0.18, -0.06, 0.39]),
    head.local([0.18, -0.06, 0.39]),
    0.025,
    { color: STONE_DARK, bone: head, name: "upper_lip" },
  );
  box([0.27, 0.1, 0.22], STONE, jaw.local([0, -0.02, 0.02]), jaw, "lower_jaw");
  b.rod(
    jaw.local([-0.15, 0.02, 0.12]),
    jaw.local([0.15, 0.02, 0.12]),
    0.018,
    { color: STONE_LIGHT, bone: jaw, name: "lower_lip" },
  );

  for (const s of [1, -1]) {
    const toothX = s * 0.13;
    spike(
      head.local([toothX, -0.07, 0.39]),
      head.local([toothX, -0.17, 0.34]),
      0.025,
      STONE_LIGHT,
      "upper_fang",
    );
    spike(
      jaw.local([toothX * 0.72, 0.015, 0.14]),
      jaw.local([toothX * 0.72, 0.08, 0.2]),
      0.018,
      STONE_LIGHT,
      "lower_fang",
    );
  }

  // Eyes: dark sockets, amber stones, and tiny highlights.
  for (const s of [1, -1]) {
    const eyeAt = head.local([s * 0.115, 0.045, 0.225]);
    sphere(0.075, CREVICE, eyeAt, head, [1.0, 0.65, 0.7], "eye_socket");
    const eyeStone = sphere(0.045, EYE, head.local([s * 0.115, 0.052, 0.244]), head, [0.75, 0.62, 0.5], "glowing_eye");
    glow(eyeStone, 1.6);
    sphere(0.012, EYE_HI, head.local([s * 0.1, 0.07, 0.262]), head, undefined, "eye_glint");
    b.rod(
      head.local([s * 0.2, 0.085, 0.23]),
      head.local([s * 0.13, 0.09, 0.29]),
      0.018,
      { color: STONE_DARK, bone: head, name: "brow_crease" },
    );
  }

  // Pointed ears and heavy brow/temple ornaments.
  for (const s of [1, -1]) {
    wedge(
      [
        head.local([s * 0.18, 0.06, 0.05]),
        head.local([s * 0.37, 0.12, 0.02]),
        head.local([s * 0.2, 0.28, -0.02]),
        head.local([s * 0.13, 0.1, 0.0]),
      ],
      STONE,
      head,
      "pointed_ear",
    );
    b.rod(
      head.local([s * 0.19, 0.11, 0.08]),
      head.local([s * 0.3, 0.2, 0.02]),
      0.022,
      { color: EDGE, bone: head, name: "ear_ridge" },
    );
  }

  // Jaw is visibly open in the rest pose.
  b.pose(jaw, { axis: [1, 0, 0], deg: -18 });

  // ---------------------------------------------------------------------------
  // Horns and crown silhouette.
  // ---------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const horn = catmull([
      head.local([s * 0.16, 0.19, -0.02]),
      head.local([s * 0.23, 0.34, -0.04]),
      head.local([s * 0.3, 0.47, -0.02]),
      head.local([s * 0.27, 0.57, 0.08]),
      head.local([s * 0.19, 0.61, 0.17]),
    ]);
    b.sweep(horn, (t: number) => 0.075 * (1 - t) + 0.008, {
      color: STONE_DARK,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      name: "curved_horn",
    });
    for (let i = 0; i < 4; i++) {
      const t = 0.16 + i * 0.17;
      const p = horn.at(t);
      b.ring(
        { at: p, axis: horn.tangentAt(t) },
        { count: 6, radius: 0.004, fromDeg: 0, toDeg: 360 },
        (r: any) =>
          b.spike(r, r, 0.018, 0.008, {
            color: STONE_LIGHT,
            name: "horn_ridge",
          }),
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Legs, feet, talons.
  // ---------------------------------------------------------------------------

  for (const { d, chain } of legs) {
    b.sweep(chain, (t: number) => 0.12 - t * 0.045, {
      color: STONE,
      section: { ngon: 6 },
      name: d.s > 0 ? "left_hind_leg" : "right_hind_leg",
    });

    sphere(0.16, STONE_DARK, d.hip, chain.joints[0], [1.1, 1.0, 1.2], "haunch_joint");
    sphere(0.115, STONE_LIGHT, d.knee, chain.joints[1], [0.9, 0.9, 1.0], "knee_cap");
    sphere(0.1, STONE, d.ankle, chain.joints[2], [0.9, 0.85, 1.1], "ankle_block");
    box([0.2, 0.1, 0.3], STONE_WARM, d.foot, chain.tip, "broad_foot");

    for (let i = -1; i <= 1; i++) {
      const toeBase = [d.foot[0] + i * 0.055, 0.235, d.foot[2] + 0.1] as [number, number, number];
      const toeTip = [d.foot[0] + i * 0.07, 0.225, d.foot[2] + 0.28] as [number, number, number];
      b.sweep(polyline([toeBase, toeTip]), [0.035, 0.008], {
        color: STONE_LIGHT,
        bone: chain.tip,
        caps: { start: "round", end: "point" },
        name: "talon_toe",
      });
    }
    b.rod(
      [d.foot[0] - 0.08, 0.282, d.foot[2] - 0.08],
      [d.foot[0] + 0.08, 0.282, d.foot[2] - 0.08],
      0.018,
      { color: CREVICE, bone: chain.tip, name: "foot_crease" },
    );
  }

  // ---------------------------------------------------------------------------
  // Arms and grasping claws.
  // ---------------------------------------------------------------------------

  for (const { s, arm } of armChains) {
    b.sweep(arm, (t: number) => 0.075 - t * 0.025, {
      color: STONE_WARM,
      section: { ngon: 6 },
      name: s > 0 ? "left_forearm" : "right_forearm",
    });
    sphere(0.09, STONE_LIGHT, arm.joints[1].at, arm.joints[1], undefined, "elbow_knuckle");
    sphere(0.085, STONE, arm.tip.at, arm.tip, [1.0, 0.8, 1.1], "wrist");

    for (let i = -1; i <= 1; i++) {
      const p0 = [s * 0.7 + i * 0.035, 0.92, 0.5] as [number, number, number];
      const p1 = [s * 0.72 + i * 0.05, 0.82, 0.62] as [number, number, number];
      b.sweep(polyline([p0, p1]), [0.026, 0.006], {
        color: STONE_LIGHT,
        bone: arm.tip,
        caps: { end: "point" },
        name: "hand_claw",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Wings: broad ribbed stone wings with membrane panels, held open behind the
  // crouching silhouette rather than folded into an unreadable lump.
  // ---------------------------------------------------------------------------

  for (const { s, shoulder, wrist, tip, wing } of wingChains) {
    b.sweep(wing, (t: number) => 0.09 - t * 0.045, {
      color: STONE_DARK,
      section: { ngon: 6 },
      name: s > 0 ? "left_wing_bone" : "right_wing_bone",
    });

    const lowerEdge = polyline([
      shoulder,
      [s * 0.49, 1.18, -0.13] as [number, number, number],
      [s * 0.72, 1.31, -0.31] as [number, number, number],
      [s * 0.92, 1.59, -0.38] as [number, number, number],
      tip,
    ]);

    b.membrane(wing, lowerEdge, {
      color: STONE_WARM,
      thickness: 0.025,
      rows: 4,
      cols: 8,
      scallop: 0.12,
      name: s > 0 ? "left_wing_membrane" : "right_wing_membrane",
    });

    // Raised finger ridges along the wing's outer edge.
    const ribPaths = [
      [shoulder, [s * 0.62, 1.46, -0.06], [s * 0.88, 1.79, -0.2], tip],
      [shoulder, [s * 0.55, 1.38, -0.02], [s * 0.75, 1.56, -0.18], [s * 0.91, 1.76, -0.3]],
      [shoulder, [s * 0.46, 1.32, -0.02], [s * 0.62, 1.45, -0.24], [s * 0.75, 1.56, -0.34]],
    ];
    for (const path of ribPaths) {
      b.sweep(catmull(path), [0.025, 0.009], {
        color: EDGE,
        bone: wing.joints[0],
        caps: { end: "point" },
        name: "wing_rib",
      });
    }

    // Wing-tip hooks.
    spike(tip, [s * 1.14, 2.29, -0.42], 0.035, STONE_LIGHT, "wing_tip_hook");
  }

  // ---------------------------------------------------------------------------
  // Tail: segmented, ridged, and curling upward behind the haunches.
  // ---------------------------------------------------------------------------

  b.sweep(
    tail,
    (t: number) => 0.12 * (1 - t) + 0.025,
    {
      color: STONE_DARK,
      section: { ngon: 7 },
      bands: [
        [0.25, STONE],
        [0.55, STONE_WARM],
        [0.82, STONE_LIGHT],
        [1, STONE_DARK],
      ],
      name: "segmented_tail",
    },
  );

  for (let i = 0; i < 8; i++) {
    const t = 0.08 + i * 0.105;
    const at = tail.at(t);
    b.ring(
      frame(at, tail.at(t).tangent),
      { count: 7, radius: 0.005, fromDeg: 0, toDeg: 360 },
      (r: any) =>
        b.spike(r, r, 0.035 - i * 0.0025, 0.009, {
          color: EDGE,
          name: "tail_scale_ring",
        }),
    );
  }

  // Tail terminal barb.
  const tailEnd = tail.at(1).at;
  spike(tailEnd, [0.4, 1.32, -1.72], 0.06, STONE_LIGHT, "tail_barb");

  // ---------------------------------------------------------------------------
  // Small gothic carving details: shoulder plates, forehead sigil, moss, and
  // deep seams. These make the primitive construction read as carved masonry.
  // ---------------------------------------------------------------------------

  for (const s of [1, -1]) {
    wedge(
      [
        [s * 0.15, 1.34, 0.24],
        [s * 0.36, 1.37, 0.17],
        [s * 0.42, 1.22, 0.1],
        [s * 0.2, 1.22, 0.18],
      ],
      STONE_LIGHT,
      spine.joints[1],
      "shoulder_plate",
    );
  }

  // Forehead diamond and a vertical carved rune.
  wedge(
    [
      head.local([0, 0.17, 0.18]).toArray() as [number, number, number],
      head.local([0.045, 0.1, 0.22]).toArray() as [number, number, number],
      head.local([0, 0.03, 0.28]).toArray() as [number, number, number],
      head.local([-0.045, 0.1, 0.22]).toArray() as [number, number, number],
    ],
    EDGE,
    head,
    "forehead_diamond",
  );
  b.rod(
    head.local([0, 0.105, 0.12]),
    head.local([0, 0.105, 0.25]),
    0.012,
    { color: CREVICE, bone: head, name: "forehead_rune" },
  );

  // A few deliberately chunky moss patches on upward-facing ledge and stone.
  wedge(
    [
      [-0.75, 0.31, 0.34],
      [-0.58, 0.31, 0.4],
      [-0.45, 0.31, 0.32],
      [-0.61, 0.32, 0.27],
    ],
    MOSS,
    undefined,
    "ledge_moss_patch",
  );
  wedge(
    [
      [0.52, 0.31, -0.3],
      [0.72, 0.31, -0.24],
      [0.81, 0.31, -0.11],
      [0.61, 0.32, -0.13],
    ],
    MOSS,
    undefined,
    "ledge_moss_patch",
  );
  b.sweep(
    polyline([
      [-0.72, 0.31, 0.29],
      [-0.76, 0.22, 0.25],
      [-0.73, 0.17, 0.2],
    ]),
    [0.022, 0.008],
    { color: MOSS, caps: { end: "point" }, name: "hanging_moss" },
  );

  // Mason's corner blocks on the ledge.
  for (const x of [-0.96, 0.96]) {
    for (let i = 0; i < 3; i++) {
      box(
        [0.11, 0.1, 0.2],
        i % 2 ? STONE_LIGHT : LEDGE,
        [x, 0.08 + i * 0.105, 0.48],
        undefined,
        "ledge_masonry_block",
      );
    }
  }

  return b.root;
}
