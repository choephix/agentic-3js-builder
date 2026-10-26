import * as THREE from "three";
import { createBuilder, catmull, limb } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A crouching gothic stone gargoyle carved from dark cathedral masonry, perched on a broken ledge with spread bat wings, curling horns, an open jaw, claws, and a long spined tail.",
};

export const REQUESTS = [
  {
    id: "crownCarving",
    kind: "add",
    part: "headStone",
    what: "Add a small gothic crown of pointed stone finials and a central cathedral quatrefoil behind the gargoyle's horns. Use STONE_LIGHT and STONE_DARK, with sharp carved silhouettes and a few narrow openings.",
    at: [0, 2.02, 0.08],
    normal: [0, 0.55, -0.2],
    bone: "head",
    room: [0.42, 0.28, 0.18],
  },
  {
    id: "eyeSockets",
    kind: "add",
    part: "headStone",
    what: "Deepen both eye sockets with angular gothic eyelid wedges and tiny inset stone pupils. Use GROOVE for the recesses, STONE_DARK for the lids, and EYE_STONE for the small carved eyes.",
    at: [0, 1.83, 0.53],
    normal: [0, 0.05, 1],
    bone: "head",
    room: [0.38, 0.2, 0.1],
  },
  {
    id: "fangs",
    kind: "add",
    part: "jawStone",
    what: "Add four uneven cathedral-gargoyle fangs descending into the open mouth, two large outer tusks and two short inner teeth. Use STONE_LIGHT with GROOVE shadow bands.",
    at: [0, 1.59, 0.65],
    normal: [0, -0.2, 1],
    bone: "jaw",
    room: [0.34, 0.24, 0.16],
  },
  {
    id: "wingTraceryL",
    kind: "add",
    part: "wingMembraneL",
    what: "Build raised gothic rib tracery over the left wing: three tapering stone ribs, a pointed trefoil motif, and tiny pointed buttresses at the rib junctions. Use STONE_LIGHT on the ribs and STONE_DARK on the recesses.",
    at: [0.67, 1.58, -0.22],
    normal: [0.35, 0.65, -0.7],
    bone: "wingL1",
    room: [0.7, 0.65, 0.18],
  },
  {
    id: "wingTraceryR",
    kind: "add",
    part: "wingMembraneR",
    what: "Build matching raised gothic rib tracery over the right wing: three tapering stone ribs, a pointed trefoil motif, and tiny pointed buttresses at the rib junctions. Use STONE_LIGHT on the ribs and STONE_DARK on the recesses.",
    at: [-0.67, 1.58, -0.22],
    normal: [-0.35, 0.65, -0.7],
    bone: "wingR1",
    room: [0.7, 0.65, 0.18],
  },
  {
    id: "clawTalonsL",
    kind: "add",
    part: "handL",
    what: "Add three long hooked talons to the left hand, with angular knuckle caps and pointed tips gripping the ledge. Use STONE_LIGHT for the claws and GROOVE at each joint.",
    at: [0.55, 0.36, 0.55],
    normal: [0.2, 0.2, 1],
    bone: "handL",
    room: [0.34, 0.22, 0.42],
  },
  {
    id: "clawTalonsR",
    kind: "add",
    part: "handR",
    what: "Add three long hooked talons to the right hand, with angular knuckle caps and pointed tips gripping the ledge. Use STONE_LIGHT for the claws and GROOVE at each joint.",
    at: [-0.55, 0.36, 0.55],
    normal: [-0.2, 0.2, 1],
    bone: "handR",
    room: [0.34, 0.22, 0.42],
  },
  {
    id: "tailCrown",
    kind: "add",
    part: "tailStone",
    what: "Add a row of large alternating gothic leaf-spikes along the raised tail, ending in one spearhead-shaped terminal fin. Use STONE_LIGHT with STONE_DARK undersides.",
    at: [0, 0.68, -0.92],
    normal: [0, 0.7, -0.4],
    bone: "tail3",
    room: [0.3, 0.42, 0.7],
  },
  {
    id: "ledgeDrain",
    kind: "add",
    part: "ledgeTop",
    what: "Carve a small gargoyle rain-drain channel directly in front of the creature: a shallow gothic spout with two square side blocks and a dark opening. Use LEDGE_TOP, LEDGE_DARK, and GROOVE.",
    at: [0, 0.2, 0.7],
    normal: [0, 0, 1],
    bone: null,
    room: [0.48, 0.26, 0.3],
  },
  {
    id: "ledgeMasonry",
    kind: "add",
    part: "ledgeTop",
    what: "Add three irregular carved masonry blocks beneath the ledge corners, with tiny triangular chamfers and one broken hanging fragment. Keep them subordinate to the gargoyle and use LEDGE and LEDGE_DARK.",
    at: [0.72, 0.04, -0.38],
    normal: [0, 1, 0],
    bone: null,
    room: [1.65, 0.38, 0.9],
  },
  {
    id: "stoneBodyTexture",
    kind: "texture",
    part: "bodyStone",
    what: "Paint the body with weathered gothic limestone: broad cool gray planes, darker recessed undersides, subtle vertical chisel striations, and sparse pale edge wear. Use STONE, STONE_DARK, STONE_LIGHT, and GROOVE.",
  },
  {
    id: "stoneHeadTexture",
    kind: "texture",
    part: "headStone",
    what: "Paint the head as hand-carved cathedral stone with darker brow and cheek recesses, pale worn nose and muzzle edges, and small hairline cracks that follow the carving. Use STONE, STONE_DARK, STONE_LIGHT, and GROOVE.",
  },
  {
    id: "wingMembraneTexture",
    kind: "texture",
    part: "wingMembraneL",
    what: "Paint both wing membranes with alternating weathered stone panels: STONE_DARK in the deep folds, STONE on broad slabs, and STONE_LIGHT along the raised rib edges. Keep the pattern radial from the wing roots.",
  },
  {
    id: "ledgeTexture",
    kind: "texture",
    part: "ledgeTop",
    what: "Paint the ledge as old cathedral masonry with block seams, chipped pale top edges, dark damp underside staining, and small moss-green patches only in sheltered cracks. Use LEDGE_TOP, LEDGE, LEDGE_DARK, and MOSS.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

// Gothic stone palette. The stage-one model deliberately uses flat fills;
// stage two can reinterpret these names as paints or textures.
export const STONE = "#69717a";
export const STONE_DARK = "#454b54";
export const STONE_LIGHT = "#a9adb0";
export const GROOVE = "#242932";
export const EYE_STONE = "#c8c5ae";
export const LEDGE = "#4c535b";
export const LEDGE_TOP = "#737a80";
export const LEDGE_DARK = "#30363d";
export const MOSS = "#52604b";

function sphere(
  b: Builder,
  color: string,
  at: THREE.Vector3 | [number, number, number],
  scale: [number, number, number],
  options: { bone?: any; name?: string; segments?: number } = {},
) {
  return b.part(
    new THREE.SphereGeometry(1, options.segments ?? 10, Math.max(6, (options.segments ?? 10) - 2)),
    color,
    {
      bone: options.bone,
      at,
      scale,
      name: options.name,
    },
  );
}

function box(
  b: Builder,
  color: string,
  at: THREE.Vector3 | [number, number, number],
  size: [number, number, number],
  options: { bone?: any; name?: string } = {},
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    bone: options.bone,
    at,
    name: options.name,
  });
}

function stonePlate(
  b: Builder,
  color: string,
  at: THREE.Vector3,
  width: number,
  height: number,
  depth: number,
  bone: any,
  name: string,
) {
  return b.part(new THREE.BoxGeometry(width, height, depth), color, {
    at,
    bone,
    name,
  });
}

function pointedPlate(
  b: Builder,
  color: string,
  at: THREE.Vector3,
  side: number,
  bone: any,
  name: string,
) {
  return b.extrude(
    [
      [0, 0],
      [side * 0.085, 0.015],
      [side * 0.105, 0.12],
      [side * 0.045, 0.25],
      [0, 0.31, "sharp"],
      [side * -0.045, 0.25],
      [side * -0.105, 0.12],
      [side * -0.085, 0.015],
    ],
    {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.004,
      color,
      bone,
      name,
    },
  );
}

function addToe(
  b: Builder,
  parent: any,
  side: number,
  index: number,
  root: THREE.Vector3,
  tip: THREE.Vector3,
  color: string,
) {
  const path = catmull([
    root,
    new THREE.Vector3(
      (root.x + tip.x) * 0.5,
      Math.max(0.19, root.y - 0.02 - index * 0.008),
      root.z + 0.07 + index * 0.018,
    ),
    tip,
  ]);
  const digit = b.chain(`toe${side > 0 ? "L" : "R"}${index}`, path, {
    parent,
    names: [`toe${side > 0 ? "L" : "R"}${index}Base`, `toe${side > 0 ? "L" : "R"}${index}Tip`],
    role: "digit",
  });
  b.sweep(digit, (t: number) => 0.028 * (1 - t) + 0.008, {
    color,
    caps: "round",
    sides: 6,
    name: `toeStone${side > 0 ? "L" : "R"}${index}`,
  });
  return digit;
}

function addFinger(
  b: Builder,
  parent: any,
  side: number,
  index: number,
  root: THREE.Vector3,
  tip: THREE.Vector3,
) {
  const fingerPath = catmull([
    root,
    new THREE.Vector3(
      root.x + (tip.x - root.x) * 0.45,
      root.y - 0.018 * index,
      root.z + 0.04 + 0.015 * index,
    ),
    tip,
  ]);
  const finger = b.chain(`finger${side > 0 ? "L" : "R"}${index}`, fingerPath, {
    parent,
    names: [
      `finger${side > 0 ? "L" : "R"}${index}Base`,
      `finger${side > 0 ? "L" : "R"}${index}Tip`,
    ],
    role: "digit",
  });
  b.sweep(finger, (t: number) => 0.025 * (1 - t) + 0.006, {
    color: STONE_LIGHT,
    sides: 6,
    caps: "point",
    name: `fingerStone${side > 0 ? "L" : "R"}${index}`,
  });
  return finger;
}

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: a compact crouching spine, separate hinged jaw, four limbs, tail, horns, and open wings.

  const hips = b.joint("hips", {
    at: [0, 0.93, -0.04],
    dir: [0, 1, 0],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    hips.at,
    [0, 1.08, -0.01],
    [0, 1.28, 0.035],
    [0, 1.49, 0.12],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spineMid", "chest", "shoulder", "spineTip"],
    role: "spine",
    count: 4,
  });

  const neckPath = catmull([
    spine.joints[spine.joints.length - 1].at,
    [0, 1.62, 0.19],
    [0, 1.73, 0.27],
  ]);

  const neck = b.chain("neck", neckPath, {
    parent: spine,
    names: ["neck", "neckTip"],
    role: "neck",
    count: 2,
  });

  const head = b.joint("head", {
    parent: neck,
    at: neck.at(1).at,
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.19, up: -0.045 }),
    aim: head.local({ forward: 0.49, up: -0.17 }),
    role: "jaw",
    group: "head",
  });

  const tailPath = catmull([
    hips.at,
    [0, 0.83, -0.33],
    [0, 0.67, -0.62],
    [0, 0.57, -0.92],
    [0, 0.70, -1.18],
    [0, 0.92, -1.35],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
    role: "tail",
    count: 6,
  });

  const legChains: any[] = [];
  const armChains: any[] = [];
  const wingChains: any[] = [];
  const wingLowerPaths: any[] = [];
  const hornChains: any[] = [];

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";

    const hipRoot = new THREE.Vector3(side * 0.27, 1.0, -0.08);
    const footTarget = new THREE.Vector3(side * 0.46, 0.23, 0.38);
    const legPoints = limb(
      hipRoot,
      footTarget,
      [0.39, 0.42, 0.29],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      { sole: [0, 0, 1] },
    );
    const leg = b.chain(`leg${sideName}`, legPoints, {
      parent: hips,
      names: [`hip${sideName}`, `knee${sideName}`, `ankle${sideName}`, `foot${sideName}`],
      role: "leg",
      contact: [footTarget.x, 0.18, footTarget.z],
    });
    legChains.push(leg);

    const shoulderRoot = new THREE.Vector3(side * 0.27, 1.38, 0.12);
    const handTarget = new THREE.Vector3(side * 0.53, 0.36, 0.48);
    const armPoints = limb(
      shoulderRoot,
      handTarget,
      [0.34, 0.43, 0.24],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
      { sole: [0, 0, 1] },
    );
    const arm = b.chain(`arm${sideName}`, armPoints, {
      parent: spine.joints[2],
      names: [`shoulder${sideName}`, `elbow${sideName}`, `wrist${sideName}`, `hand${sideName}`],
      role: "arm",
      contact: [handTarget.x, 0.18, handTarget.z],
    });
    armChains.push(arm);

    const wingRoot = new THREE.Vector3(side * 0.29, 1.46, -0.035);
    const wingPath = catmull([
      wingRoot,
      new THREE.Vector3(side * 0.55, 1.62, -0.13),
      new THREE.Vector3(side * 0.83, 1.78, -0.35),
      new THREE.Vector3(side * 1.08, 1.57, -0.62),
    ]);
    const wing = b.chain(`wing${sideName}`, wingPath, {
      parent: spine.joints[2],
      names: [`wing${sideName}1`, `wing${sideName}2`, `wing${sideName}3`, `wing${sideName}Tip`],
      role: "wing",
      count: 4,
    });
    wingChains.push(wing);

    const lowerWing = catmull([
      wingRoot,
      new THREE.Vector3(side * 0.50, 1.33, -0.30),
      new THREE.Vector3(side * 0.77, 1.15, -0.51),
      new THREE.Vector3(side * 1.08, 1.57, -0.62),
    ]);
    wingLowerPaths.push(lowerWing);

    const hornRoot = new THREE.Vector3(side * 0.17, 1.91, 0.20);
    const hornPath = catmull([
      hornRoot,
      new THREE.Vector3(side * 0.31, 2.02, 0.18),
      new THREE.Vector3(side * 0.39, 2.12, 0.00),
      new THREE.Vector3(side * 0.30, 2.13, -0.18),
      new THREE.Vector3(side * 0.19, 2.07, -0.25),
    ]);
    const horn = b.chain(`horn${sideName}`, hornPath, {
      parent: head,
      names: [`horn${sideName}Base`, `horn${sideName}Mid`, `horn${sideName}Tip`],
      role: "head",
      count: 3,
    });
    hornChains.push(horn);

    // Three separated wing digits make the spread silhouette readable even before the membrane is added.
    for (let i = 0; i < 3; i++) {
      const digitRoot = new THREE.Vector3(
        side * (0.42 + i * 0.055),
        1.58 + i * 0.025,
        -0.12 - i * 0.025,
      );
      const digitTip = [
        new THREE.Vector3(side * 0.76, 1.93, -0.35),
        new THREE.Vector3(side * 0.99, 1.87, -0.55),
        new THREE.Vector3(side * 1.15, 1.62, -0.70),
      ][i];
      const wingDigitPath = catmull([
        digitRoot,
        new THREE.Vector3(
          (digitRoot.x + digitTip.x) * 0.5,
          digitTip.y + 0.08,
          (digitRoot.z + digitTip.z) * 0.5,
        ),
        digitTip,
      ]);
      const wingDigit = b.chain(`wingDigit${sideName}${i}`, wingDigitPath, {
        parent: wing.joints[Math.min(i + 1, wing.joints.length - 1)],
        names: [`wingDigit${sideName}${i}Base`, `wingDigit${sideName}${i}Tip`],
        role: "digit",
      });
      b.sweep(wingDigit, (t: number) => 0.018 * (1 - t) + 0.004, {
        color: STONE_LIGHT,
        sides: 6,
        caps: "point",
        name: `wingDigitStone${sideName}${i}`,
      });
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Ledge and masonry base. The lowest face is exactly on the floor.

  box(b, LEDGE_TOP, [0, 0.09, 0.02], [2.05, 0.18, 1.55], { name: "ledgeTop" });
  box(b, LEDGE, [0, -0.055, -0.31], [1.76, 0.09, 0.72], { name: "ledgeFrontBand" });
  box(b, LEDGE_DARK, [0, 0.20, -0.69], [1.72, 0.09, 0.20], { name: "ledgeRearLip" });

  for (const side of [1, -1]) {
    box(b, LEDGE, [side * 0.72, 0.18, -0.36], [0.29, 0.19, 0.46], {
      name: `ledgeEndBlock${side > 0 ? "L" : "R"}`,
    });
    box(b, LEDGE_DARK, [side * 0.72, 0.025, 0.25], [0.38, 0.05, 0.34], {
      name: `ledgeShadowBlock${side > 0 ? "L" : "R"}`,
    });
    box(b, LEDGE_TOP, [side * 0.94, 0.15, -0.03], [0.12, 0.20, 0.68], {
      name: `ledgeCornerCap${side > 0 ? "L" : "R"}`,
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Main carved body and neck.

  const body = b.sweep(spine, (t: number) => 0.235 - t * 0.035, {
    color: STONE,
    section: { ngon: 8 },
    sides: 8,
    caps: "round",
    name: "bodyStone",
    group: "body",
  });

  b.sweep(neck, [0.18, 0.145], {
    color: STONE,
    section: { ngon: 8 },
    caps: "round",
    name: "neckStone",
    group: "body",
  });

  sphere(b, STONE_DARK, [0, 1.02, 0.13], [0.29, 0.22, 0.26], {
    bone: spine.joints[1],
    name: "bellyShadow",
    segments: 10,
  });

  const chestShield = b.extrude(
    [
      [-0.17, 0],
      [0.17, 0],
      [0.20, 0.17],
      [0.11, 0.31],
      [0, 0.38, "sharp"],
      [-0.11, 0.31],
      [-0.20, 0.17],
    ],
    {
      at: [0, 1.31, 0.255],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.005,
      color: STONE_LIGHT,
      bone: spine.joints[2],
      name: "chestShield",
    },
  );

  for (const side of [1, -1]) {
    const shoulder = new THREE.Vector3(side * 0.29, 1.39, 0.06);
    sphere(b, STONE_LIGHT, shoulder, [0.17, 0.16, 0.18], {
      bone: armChains[side > 0 ? 0 : 1].joints[0],
      name: `shoulderStone${side > 0 ? "L" : "R"}`,
      segments: 8,
    });

    stonePlate(
      b,
      STONE_DARK,
      new THREE.Vector3(side * 0.34, 1.42, 0.18),
      0.11,
      0.20,
      0.035,
      armChains[side > 0 ? 0 : 1].joints[0],
      `shoulderInset${side > 0 ? "L" : "R"}`,
    );
  }

  // Broad dorsal ridges, kept as individual carved blocks so they read as masonry rather than fur.
  const dorsalPoints = [
    [0, 1.46, -0.08],
    [0, 1.34, -0.16],
    [0, 1.20, -0.25],
    [0, 1.05, -0.34],
  ];
  dorsalPoints.forEach((p, i) => {
    const y = p[1];
    const z = p[2];
    b.extrude(
      [
        [-0.07 - i * 0.004, 0],
        [0.07 + i * 0.004, 0],
        [0.055 + i * 0.003, 0.11 - i * 0.012],
        [0, 0.17 - i * 0.012, "sharp"],
        [-0.055 - i * 0.003, 0.11 - i * 0.012],
      ],
      {
        at: [0, y, z - 0.19],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.003,
        color: STONE_LIGHT,
        bone: spine.joints[Math.min(i, spine.joints.length - 1)],
        name: `dorsalCrest${i}`,
      },
    );
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Head, muzzle, brow, ears, and open jaw.

  const skull = sphere(b, STONE, head.at, [0.285, 0.285, 0.31], {
    bone: head,
    name: "headStone",
    segments: 14,
  });

  const muzzlePath = catmull([
    head.local({ forward: 0.17, up: -0.025 }),
    head.local({ forward: 0.31, up: -0.035 }),
    head.local({ forward: 0.43, up: -0.06 }),
  ]);
  b.sweep(muzzlePath, [0.155, 0.095], {
    color: STONE_LIGHT,
    section: { ngon: 8 },
    caps: "round",
    bone: head,
    name: "muzzleStone",
  });

  const lowerJawPath = catmull([
    jaw.at,
    head.local({ forward: 0.31, up: -0.12 }),
    head.local({ forward: 0.49, up: -0.17 }),
  ]);
  b.sweep(lowerJawPath, [0.115, 0.045], {
    color: STONE,
    section: { ngon: 8 },
    caps: "round",
    bone: jaw,
    name: "jawStone",
    group: "head",
  });

  box(b, GROOVE, [0, 1.655, 0.475], [0.25, 0.055, 0.025], {
    bone: head,
    name: "mouthVoid",
  });

  sphere(b, STONE_DARK, head.local({ forward: 0.415, up: -0.06 }), [0.13, 0.085, 0.035], {
    bone: head,
    name: "noseStone",
    segments: 8,
  });

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";

    const eyeSocketAt = head.local({ left: side * 0.105, up: 0.035, forward: 0.257 });
    sphere(b, GROOVE, eyeSocketAt, [0.080, 0.087, 0.032], {
      bone: head,
      name: `eyeSocket${sideName}`,
      segments: 10,
    });

    const eyeAt = head.local({ left: side * 0.105, up: 0.035, forward: 0.284 });
    sphere(b, EYE_STONE, eyeAt, [0.043, 0.050, 0.020], {
      bone: head,
      name: `eyeStone${sideName}`,
      segments: 8,
    });

    sphere(
      b,
      GROOVE,
      head.local({ left: side * 0.105, up: 0.038, forward: 0.304 }),
      [0.017, 0.029, 0.009],
      {
        bone: head,
        name: `pupil${sideName}`,
        segments: 7,
      },
    );

    const browA = head.local({ left: side * 0.19, up: 0.13, forward: 0.23 });
    const browB = head.local({ left: side * 0.035, up: 0.115, forward: 0.30 });
    b.rod(browA, browB, 0.035, {
      color: STONE_DARK,
      bone: head,
      section: { ngon: 6 },
      name: `browRidge${sideName}`,
    });

    b.extrude(
      [
        [0, 0],
        [side * 0.13, 0.02],
        [side * 0.17, 0.13],
        [side * 0.07, 0.22],
        [0, 0.18],
      ],
      {
        at: head.local({ left: side * 0.235, up: 0.035, back: 0.005 }),
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.004,
        color: STONE_LIGHT,
        bone: head,
        name: `earCarving${sideName}`,
      },
    );

    const cheekAt = head.local({ left: side * 0.205, up: -0.07, forward: 0.16 });
    sphere(b, STONE_LIGHT, cheekAt, [0.12, 0.13, 0.10], {
      bone: head,
      name: `cheekStone${sideName}`,
      segments: 8,
    });

    const fangBase = head.local({ left: side * 0.105, up: -0.095, forward: 0.445 });
    b.spike(fangBase, [0, -1, 0.12], 0.13, 0.028, {
      color: STONE_LIGHT,
      bone: head,
      name: `upperFang${sideName}`,
      caps: "point",
    });

    pointedPlate(
      b,
      STONE_DARK,
      head.local({ left: side * 0.225, up: 0.13, back: 0.02 }),
      side,
      head,
      `templeFinial${sideName}`,
    );
  }

  // Lower jaw side plates and two broad tusks make the hinge readable.
  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";
    const jawPlateAt = head.local({ left: side * 0.105, up: -0.135, forward: 0.30 });
    box(b, STONE_DARK, jawPlateAt, [0.075, 0.06, 0.16], {
      bone: jaw,
      name: `jawSidePlate${sideName}`,
    });
    b.spike(
      head.local({ left: side * 0.115, up: -0.08, forward: 0.49 }),
      [0, -1, 0],
      0.11,
      0.024,
      {
        color: STONE_LIGHT,
        bone: jaw,
        name: `lowerTusk${sideName}`,
      },
    );
  }

  // Horn sweeps and small root collars.
  hornChains.forEach((horn, i) => {
    const side = i === 0 ? 1 : -1;
    const sideName = side > 0 ? "L" : "R";
    b.sweep(horn, (t: number) => 0.065 * (1 - t) + 0.012, {
      color: STONE_LIGHT,
      section: { ngon: 7 },
      caps: "point",
      name: `hornStone${sideName}`,
      group: "head",
    });
    b.ring(horn.joints[0], { count: 6, radius: 0.072, name: `hornCollar${sideName}`, role: "fan" }, (at: any) =>
      b.part(new THREE.BoxGeometry(0.018, 0.045, 0.018), STONE_DARK, {
        frame: at,
        name: `hornCollarBlock${sideName}`,
      }),
    );
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Legs, feet, toes, arms, hands, and fingers.

  legChains.forEach((leg, i) => {
    const side = i === 0 ? 1 : -1;
    const sideName = side > 0 ? "L" : "R";

    b.sweep(leg, (t: number) => (t < 0.45 ? 0.095 : 0.072), {
      color: STONE,
      section: { ngon: 7 },
      caps: "round",
      name: `legStone${sideName}`,
      group: "legs",
    });

    const foot = leg.tip!.at;
    box(
      b,
      STONE_LIGHT,
      new THREE.Vector3(foot.x, foot.y + 0.065, foot.z + 0.055),
      [0.22, 0.13, 0.30],
      {
        bone: leg.tip,
        name: `footStone${sideName}`,
      },
    );
    box(
      b,
      GROOVE,
      new THREE.Vector3(foot.x, foot.y + 0.132, foot.z + 0.055),
      [0.16, 0.018, 0.22],
      {
        bone: leg.tip,
        name: `footInset${sideName}`,
      },
    );

    for (let j = 0; j < 3; j++) {
      const root = new THREE.Vector3(
        foot.x + side * (j - 1) * 0.065,
        foot.y + 0.06,
        foot.z + 0.16,
      );
      const tip = new THREE.Vector3(
        foot.x + side * (j - 1) * 0.08,
        foot.y + 0.035 - j * 0.006,
        foot.z + 0.38 + j * 0.02,
      );
      addToe(b, leg.tip, side, j, root, tip, STONE_LIGHT);
    }

    const kneeAt = leg.joints[1].at;
    b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.045, 7), STONE_DARK, {
      bone: leg.joints[1],
      at: kneeAt,
      dir: leg.joints[1].dir([0, 1, 0]),
      name: `kneeCap${sideName}`,
    });
  });

  armChains.forEach((arm, i) => {
    const side = i === 0 ? 1 : -1;
    const sideName = side > 0 ? "L" : "R";

    b.sweep(arm, (t: number) => 0.075 * (1 - t) + 0.052, {
      color: STONE,
      section: { ngon: 7 },
      caps: "round",
      name: `armStone${sideName}`,
      group: "arms",
    });

    sphere(b, STONE_LIGHT, arm.tip!.at, [0.105, 0.075, 0.105], {
      bone: arm.tip,
      name: `handStone${sideName}`,
      segments: 8,
    });

    box(
      b,
      GROOVE,
      new THREE.Vector3(arm.tip!.at.x, arm.tip!.at.y + 0.075, arm.tip!.at.z),
      [0.14, 0.018, 0.10],
      {
        bone: arm.tip,
        name: `handInset${sideName}`,
      },
    );

    for (let j = 0; j < 3; j++) {
      const root = new THREE.Vector3(
        arm.tip!.at.x + side * (j - 1) * 0.047,
        arm.tip!.at.y + 0.01,
        arm.tip!.at.z + 0.055,
      );
      const tip = new THREE.Vector3(
        arm.tip!.at.x + side * (j - 1) * 0.065,
        arm.tip!.at.y - 0.02 - j * 0.01,
        arm.tip!.at.z + 0.25 + j * 0.025,
      );
      addFinger(b, arm.tip, side, j, root, tip);
    }

    const elbow = arm.joints[1].at;
    b.part(new THREE.SphereGeometry(0.087, 8, 6), STONE_LIGHT, {
      bone: arm.joints[1],
      at: elbow,
      name: `elbowCap${sideName}`,
    });
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Wings: a thick leading edge, scalloped membrane, stone digits, and raised radial ribs.

  wingChains.forEach((wing, i) => {
    const side = i === 0 ? 1 : -1;
    const sideName = side > 0 ? "L" : "R";
    const lower = wingLowerPaths[i];

    b.sweep(wing, (t: number) => 0.055 * (1 - t) + 0.018, {
      color: STONE_LIGHT,
      section: { ngon: 7 },
      caps: "point",
      name: `wingEdge${sideName}`,
      group: "wings",
    });

    b.membrane(wing, lower, {
      color: STONE,
      thickness: 0.018,
      rows: 5,
      scallop: 0.15,
      name: `wingMembrane${sideName}`,
      group: "wings",
    });

    const ribTs = [0.22, 0.43, 0.64, 0.82];
    ribTs.forEach((t, ribIndex) => {
      const leading = wing.at(t);
      const trailing = lower.at(t);
      b.rod(leading, trailing, 0.014, {
        color: STONE_LIGHT,
        section: { ngon: 6 },
        name: `wingRib${sideName}${ribIndex}`,
        group: "wings",
      });

      const ribPoint = leading.at.clone().lerp(trailing.at, 0.53);
      b.spike(ribPoint, [0, 0.6, side * 0.25], 0.07, 0.018, {
        color: STONE_LIGHT,
        bone: leading.bone,
        name: `wingRibFinial${sideName}${ribIndex}`,
      });
    });

    // Small dark stone plugs at the membrane root imply carved sockets.
    for (let j = 0; j < 3; j++) {
      const root = wing.at(0.13 + j * 0.10);
      sphere(b, GROOVE, root.at, [0.027, 0.027, 0.027], {
        bone: root.bone,
        name: `wingSocket${sideName}${j}`,
        segments: 6,
      });
    }
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Tail, tail plates, and silhouette spikes.

  const tailTube = b.sweep(tail, (t: number) => 0.105 * (1 - t) + 0.018, {
    color: STONE,
    section: { ngon: 7 },
    caps: "point",
    name: "tailStone",
    group: "tail",
  });

  for (let i = 0; i < 7; i++) {
    const at = tailTube.at(0.13 + i * 0.115, 0, 0.004);
    b.spike(at, at, 0.105 - i * 0.009, 0.034 - i * 0.002, {
      color: i % 2 === 0 ? STONE_LIGHT : STONE_DARK,
      name: `tailSpine${i}`,
      caps: "point",
    });
  }

  const tailPlateTs = [0.20, 0.36, 0.52, 0.68, 0.82];
  tailPlateTs.forEach((t, i) => {
    const at = tail.at(t);
    b.extrude(
      [
        [-0.045, 0],
        [0.045, 0],
        [0.06, 0.08],
        [0, 0.145, "sharp"],
        [-0.06, 0.08],
      ],
      {
        at: at.at.clone().add(new THREE.Vector3(0, 0.015, -0.012)),
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        color: STONE_LIGHT,
        bone: at.bone,
        name: `tailSidePlate${i}`,
      },
    );
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Carved bands and block accents. These are simple, bold shapes that make the silhouette feel architectural.

  for (let i = 0; i < 4; i++) {
    const t = 0.18 + i * 0.19;
    const p = spine.at(t);
    b.ring(p, { count: 8, radius: 0.012, tilt: -8, name: `spineMasonryRing${i}`, role: "fan" }, (at: any) =>
      b.part(new THREE.BoxGeometry(0.026, 0.038, 0.026), STONE_LIGHT, {
        frame: at,
        name: `spineMasonryBlock${i}`,
      }),
    );
  }

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";

    b.extrude(
      [
        [-0.13, 0],
        [0.13, 0],
        [0.11, 0.07],
        [0.04, 0.15],
        [0, 0.20, "sharp"],
        [-0.04, 0.15],
        [-0.11, 0.07],
      ],
      {
        at: new THREE.Vector3(side * 0.17, 0.93, -0.24),
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.026,
        color: STONE_LIGHT,
        bone: hips,
        name: `haunchCarving${sideName}`,
      },
    );

    box(b, STONE_DARK, [side * 0.19, 0.92, 0.015], [0.05, 0.17, 0.035], {
      bone: hips,
      name: `haunchRecess${sideName}`,
    });
  }

  // A few heavy chips at the ledge silhouette, still subordinate to the hero.
  box(b, LEDGE_DARK, [-0.92, 0.25, -0.52], [0.18, 0.16, 0.30], { name: "ledgeChipL" });
  box(b, LEDGE_DARK, [0.92, 0.25, -0.52], [0.18, 0.16, 0.30], { name: "ledgeChipR" });
  box(b, LEDGE_TOP, [-0.80, 0.25, -0.62], [0.22, 0.10, 0.16], { name: "ledgeChipCapL" });
  box(b, LEDGE_TOP, [0.80, 0.25, -0.62], [0.22, 0.10, 0.16], { name: "ledgeChipCapR" });

  // Stage two workers append their detail passes here.
  for (const add of STAGE2) add(b);

  return b.root;
}
