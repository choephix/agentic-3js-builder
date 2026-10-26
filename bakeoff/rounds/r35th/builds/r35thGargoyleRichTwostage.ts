import * as THREE from "three";
import { type Builder, countershade, createBuilder, catmull, grain, limb, mix, mottle, noise, paint, resolve } from "../../../../src/index";

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

const BODY_WEATHERING = countershade(
  grain(
    mottle(STONE, STONE_LIGHT, { size: 0.22, contrast: 1.5, seed: 31 }),
    GROOVE,
    { size: 0.035, axis: "y", seed: 32 },
  ),
  STONE_DARK,
  { level: -0.05, soft: 0.3 },
);

const BODY_STONE_PAINT = paint((p, n, _s) => {
  let c = resolve(BODY_WEATHERING, p, n);
  if (n.y < -0.42) c = mix(c, STONE_DARK, 0.34);
  if (n.y > 0.48 && noise(p, 0.14, 77) > 0.84) c = mix(c, STONE_LIGHT, 0.42);
  return c;
});

const HEAD_WEATHERING = countershade(
  grain(
    mottle(STONE, STONE_LIGHT, { size: 0.14, contrast: 1.4, seed: 41 }),
    GROOVE,
    { size: 0.03, axis: "y", seed: 42 },
  ),
  STONE_DARK,
  { level: -0.1, soft: 0.28 },
);

const HEAD_STONE_PAINT = paint((p, n, _s) => {
  let c = resolve(HEAD_WEATHERING, p, n);
  const browRecess = p.z > 0.22 && p.y > 1.8 && p.y < 1.98;
  const cheekRecess = p.z > 0.1 && p.y > 1.53 && p.y < 1.82 && Math.abs(p.x) > 0.13;
  if (browRecess || cheekRecess) c = mix(c, GROOVE, 0.48);
  if (p.z > 0.34 || (p.y < 1.72 && p.z > 0.22)) c = mix(c, STONE_LIGHT, 0.36);

  const crack =
    noise(p, 0.07, 73) > 0.86 &&
    Math.abs(Math.sin(p.x * 43 + p.y * 29 + p.z * 37)) > 0.88;
  if (crack) c = mix(c, GROOVE, 0.65);
  return c;
});

const WING_MEMBRANE_PAINT = paint((_p, _n, s) => {
  const edge = Math.min(s[1], 1 - s[1]);
  if (edge < 0.11) return STONE_DARK;

  const ribBand = Math.abs(Math.sin(s[0] * Math.PI * 6));
  if (ribBand < 0.1) return STONE_LIGHT;

  const panel = Math.floor(s[0] * 6);
  return panel % 2 === 0 ? STONE : mix(STONE, STONE_LIGHT, 0.1);
});

const LEDGE_MASONRY_PAINT = paint((p, n, _s) => {
  const xSeam = Math.abs(Math.sin((p.x + 0.04) * Math.PI / 0.34)) > 0.965;
  const zSeam = Math.abs(Math.sin((p.z - 0.02) * Math.PI / 0.42)) > 0.97;
  const seam = xSeam || zSeam;

  let c = n.y > 0.45 ? LEDGE_TOP : n.y < -0.25 ? LEDGE_DARK : LEDGE;
  if (seam && n.y > -0.15) c = LEDGE_DARK;

  const shelteredMoss = seam && noise(p, 0.18, 91) > 0.7;
  if (shelteredMoss) c = MOSS;

  if (n.y > 0.65 && noise(p, 0.08, 92) > 0.84) c = mix(LEDGE_TOP, STONE_LIGHT, 0.35);
  return c;
});

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
    spine.tip!.at,
    [0, 1.62, 0.19],
    [0, 1.73, 0.27],
  ]);

  const neck = b.chain("neck", neckPath, {
    parent: spine.tip!,
    names: ["neck", "neckTip"],
    role: "neck",
    count: 2,
  });

  const head = b.joint("head", {
    parent: neck.tip!,
    at: neck.tip!.at,
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

  box(b, LEDGE_MASONRY_PAINT, [0, 0.09, 0.02], [2.05, 0.18, 1.55], { name: "ledgeTop" });
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
    color: BODY_STONE_PAINT,
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

  const skull = sphere(b, HEAD_STONE_PAINT, head.at, [0.285, 0.285, 0.31], {
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
      color: WING_MEMBRANE_PAINT,
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

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addCrownCarving(b: Builder) {
  const bone = "head";
  const LIGHT = STONE_LIGHT;
  const DARK = STONE_DARK;
  const INSET = GROOVE;

  const at = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const extrude = (
    outline: [number, number][],
    position: THREE.Vector3,
    thickness: number,
    color: string,
    name: string,
  ) =>
    b.extrude(outline, {
      at: position,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel: Math.min(0.004, thickness * 0.22),
      color,
      bone,
      name,
    });

  const rod = (
    a: THREE.Vector3,
    z: THREE.Vector3,
    radius: number,
    color: string,
    name: string,
  ) =>
    b.rod(a, z, radius, {
      color,
      bone,
      section: { ngon: 6 },
      caps: "flat",
      name,
    });

  const quatrefoil = (sx: number, sy: number): [number, number][] => [
    [0, sy * 0.105],
    [sx * 0.025, sy * 0.084],
    [sx * 0.057, sy * 0.080],
    [sx * 0.075, sy * 0.056],
    [sx * 0.061, sy * 0.026],
    [sx * 0.084, 0],
    [sx * 0.061, -sy * 0.026],
    [sx * 0.075, -sy * 0.056],
    [sx * 0.057, -sy * 0.080],
    [sx * 0.025, -sy * 0.084],
    [0, -sy * 0.105],
    [-sx * 0.025, -sy * 0.084],
    [-sx * 0.057, -sy * 0.080],
    [-sx * 0.075, -sy * 0.056],
    [-sx * 0.061, -sy * 0.026],
    [-sx * 0.084, 0],
    [-sx * 0.061, sy * 0.026],
    [-sx * 0.075, sy * 0.056],
    [-sx * 0.057, sy * 0.080],
    [-sx * 0.025, sy * 0.084],
  ];

  // The dark pierced backplate is sunk into the crown and gives the carving a
  // convincing recessed shadow behind the lighter tracery.
  extrude(
    [
      [-0.182, 0],
      [0.182, 0],
      [0.174, 0.045],
      [0.158, 0.098],
      [0.126, 0.146],
      [0.080, 0.132],
      [0, 0.190, "sharp"],
      [-0.080, 0.132],
      [-0.126, 0.146],
      [-0.158, 0.098],
      [-0.174, 0.045],
    ],
    at(0, 1.925, 0.018),
    0.036,
    DARK,
    "s21_crownBackplate",
  );

  // Pale lower course, like a small band of carved masonry.
  extrude(
    [
      [-0.178, 0],
      [0.178, 0],
      [0.169, 0.026],
      [0.145, 0.047],
      [-0.145, 0.047],
      [-0.169, 0.026],
    ],
    at(0, 1.922, 0.052),
    0.026,
    LIGHT,
    "s21_crownBaseMoulding",
  );

  // A dark central quatrefoil opening with a raised light stone surround.
  extrude(
    quatrefoil(1.12, 1.06),
    at(0, 2.034, 0.050),
    0.026,
    LIGHT,
    "s21_quatrefoilOuter",
  );
  extrude(
    quatrefoil(0.70, 0.66),
    at(0, 2.034, 0.071),
    0.018,
    INSET,
    "s21_quatrefoilOpening",
  );

  // The small central boss is deliberately faceted, like a worn quatrefoil
  // keystone rather than a polished ornament.
  b.part(new THREE.CylinderGeometry(0.022, 0.028, 0.018, 6), LIGHT, {
    bone,
    at: at(0, 2.034, 0.090),
    dir: [0, 0, 1],
    name: "s21_quatrefoilKeystone",
  });

  // Narrow lancet openings flank the quatrefoil.
  const lancet = [
    [-0.118, 1.970],
    [-0.118, 2.014],
    [-0.104, 2.070],
    [-0.090, 2.014],
    [-0.090, 1.970],
  ] as [number, number][];

  const lancetMirror = lancet.map(([x, y]) => [-x, y] as [number, number]);

  extrude(
    lancet.map(([x, y]) => [x + 0.103, y - 1.970]),
    at(0, 1.970, 0.075),
    0.014,
    INSET,
    "s21_lancetOpeningL",
  );
  extrude(
    lancetMirror.map(([x, y]) => [x - 0.103, y - 1.970]),
    at(0, 1.970, 0.075),
    0.014,
    INSET,
    "s21_lancetOpeningR",
  );

  // Slender pale ribs divide the dark openings and visually lock the crown to
  // the head's existing stone planes.
  rod(at(-0.145, 1.954, 0.086), at(-0.145, 2.102, 0.086), 0.008, LIGHT, "s21_leftJamb");
  rod(at(0.145, 1.954, 0.086), at(0.145, 2.102, 0.086), 0.008, LIGHT, "s21_rightJamb");
  rod(at(-0.145, 2.102, 0.086), at(-0.084, 2.135, 0.086), 0.008, LIGHT, "s21_leftArch");
  rod(at(0.145, 2.102, 0.086), at(0.084, 2.135, 0.086), 0.008, LIGHT, "s21_rightArch");
  rod(at(-0.084, 2.135, 0.086), at(0, 2.150, 0.086), 0.008, LIGHT, "s21_leftApex");
  rod(at(0.084, 2.135, 0.086), at(0, 2.150, 0.086), 0.008, LIGHT, "s21_rightApex");

  // Five asymmetrical pointed finials make the crown read as gothic
  // architecture. The center one is partly hidden by the quatrefoil.
  const finials = [
    { x: -0.154, base: 1.958, length: 0.115, r: 0.029 },
    { x: -0.078, base: 1.986, length: 0.145, r: 0.025 },
    { x: 0.000, base: 2.010, length: 0.137, r: 0.023 },
    { x: 0.078, base: 1.986, length: 0.145, r: 0.025 },
    { x: 0.154, base: 1.958, length: 0.115, r: 0.029 },
  ];

  finials.forEach((f, i) => {
    b.part(new THREE.CylinderGeometry(f.r * 0.92, f.r, 0.026, 6), DARK, {
      bone,
      at: at(f.x, f.base + 0.013, 0.072),
      name: `s21_finialCollar${i}`,
    });

    b.spike(at(f.x, f.base + 0.022, 0.072), [0, 1, 0], f.length, f.r, {
      color: LIGHT,
      bone,
      caps: "point",
      name: `s21_finial${i}`,
    });

    // A tiny dark inset on each finial gives the silhouette a carved,
    // alternating light-and-shadow rhythm.
    if (i !== 2) {
      b.part(new THREE.BoxGeometry(0.010, f.length * 0.48, 0.008), INSET, {
        bone,
        at: at(f.x, f.base + f.length * 0.43, 0.098),
        name: `s21_finialGroove${i}`,
      });
    }
  });

  // Pale horizontal impost blocks at the crown's shoulders.
  b.part(new THREE.BoxGeometry(0.082, 0.032, 0.040), LIGHT, {
    bone,
    at: at(-0.166, 1.956, 0.075),
    name: "s21_leftImpost",
  });
  b.part(new THREE.BoxGeometry(0.082, 0.032, 0.040), LIGHT, {
    bone,
    at: at(0.166, 1.956, 0.075),
    name: "s21_rightImpost",
  });

  // Small triangular shoulder chips complete the transition into the existing
  // horns without making the crown look like a separate floating object.
  extrude(
    [
      [0, 0],
      [0.047, 0.015],
      [0.038, 0.075],
      [0, 0.108, "sharp"],
      [-0.038, 0.075],
      [-0.047, 0.015],
    ],
    at(-0.172, 1.967, 0.061),
    0.022,
    LIGHT,
    "s21_leftShoulderCrock",
  );
  extrude(
    [
      [0, 0],
      [0.047, 0.015],
      [0.038, 0.075],
      [0, 0.108, "sharp"],
      [-0.038, 0.075],
      [-0.047, 0.015],
    ],
    at(0.172, 1.967, 0.061),
    0.022,
    LIGHT,
    "s21_rightShoulderCrock",
  );

  // Three tiny dark vertical cuts under the central tracery suggest a pierced
  // stone screen rather than a solid decorative plaque.
  const slitOutline: [number, number][] = [
    [-0.010, 0],
    [0.010, 0],
    [0.008, 0.050],
    [0, 0.067, "sharp"],
    [-0.008, 0.050],
  ];

  [-0.040, 0.040].forEach((x, i) => {
    extrude(
      slitOutline,
      at(x, 1.975, 0.084),
      0.010,
      INSET,
      `s21_lowerPiercedSlit${i}`,
    );
  });

  // Raised light stone dots at the four corners of the quatrefoil are small
  // enough to feel like chisel bosses, not gemstones.
  [
    [-0.053, 2.034],
    [0.053, 2.034],
    [0, 1.982],
    [0, 2.086],
  ].forEach(([x, y], i) => {
    b.part(new THREE.SphereGeometry(0.012, 6, 4), LIGHT, {
      bone,
      at: at(x, y, 0.091),
      name: `s21_quatrefoilBoss${i}`,
    });
  });
}
    return addCrownCarving;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addEyeSockets(b: Builder) {
  const mirrorOutline = (points: Array<[number, number]>, side: number) => {
    const mirrored = points.map(([x, y]) => [side * x, y] as [number, number]);
    return side > 0 ? mirrored : mirrored.reverse();
  };

  const addEye = (side: number) => {
    const sideName = side > 0 ? "L" : "R";
    const cx = side * 0.105;
    const cy = 1.775;

    // A recessed, faceted socket behind the existing carved eye.
    b.part(
      new THREE.SphereGeometry(1, 10, 6),
      GROOVE,
      {
        bone: "head",
        at: new THREE.Vector3(cx, cy, 0.558),
        scale: [0.097, 0.078, 0.017],
        flat: true,
        name: `s22EyeRecess${sideName}`,
        group: "stage2-eyes",
      },
    );

    // Angular upper gothic lid, mirrored while retaining a forward-facing surface.
    b.extrude(
      mirrorOutline(
        [
          [-0.175, 0.025],
          [-0.125, 0.095],
          [-0.015, 0.125],
          [0.090, 0.108],
          [0.165, 0.040],
          [0.070, 0.066],
          [-0.045, 0.078],
        ],
        side,
      ),
      {
        at: new THREE.Vector3(cx, cy, 0.575),
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.003,
        color: STONE_DARK,
        bone: "head",
        flat: true,
        name: `s22UpperLid${sideName}`,
        group: "stage2-eyes",
      },
    );

    // Smaller lower lid, leaving the pale carved eye visibly exposed.
    b.extrude(
      mirrorOutline(
        [
          [-0.155, -0.038],
          [-0.090, -0.070],
          [0.005, -0.078],
          [0.105, -0.054],
          [0.155, -0.018],
          [0.060, -0.040],
          [-0.045, -0.047],
        ],
        side,
      ),
      {
        at: new THREE.Vector3(cx, cy, 0.578),
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.015,
        bevel: 0.002,
        color: STONE_DARK,
        bone: "head",
        flat: true,
        name: `s22LowerLid${sideName}`,
        group: "stage2-eyes",
      },
    );

    // A small pale inset eye stone and a narrow dark chisel-cut pupil.
    b.part(
      new THREE.SphereGeometry(1, 8, 5),
      EYE_STONE,
      {
        bone: "head",
        at: new THREE.Vector3(cx, cy + 0.002, 0.584),
        scale: [0.034, 0.041, 0.009],
        flat: true,
        name: `s22InsetEye${sideName}`,
        group: "stage2-eyes",
      },
    );

    b.part(
      new THREE.BoxGeometry(0.010, 0.031, 0.006),
      GROOVE,
      {
        bone: "head",
        at: new THREE.Vector3(cx, cy + 0.004, 0.594),
        flat: true,
        name: `s22StonePupil${sideName}`,
        group: "stage2-eyes",
      },
    );

    // Deep carved crease escaping the outer eye corner toward the temple.
    b.rod(
      new THREE.Vector3(cx + side * 0.135, cy + 0.045, 0.590),
      new THREE.Vector3(cx + side * 0.194, cy + 0.105, 0.580),
      0.006,
      {
        color: GROOVE,
        bone: "head",
        section: { ngon: 5 },
        caps: "point",
        name: `s22OuterEyeCrease${sideName}`,
        group: "stage2-eyes",
      },
    );

    // Tiny inner-corner wedge gives the socket a carved, architectural termination.
    b.extrude(
      mirrorOutline(
        [
          [-0.072, -0.010],
          [-0.025, 0.030],
          [0.012, 0.046],
          [0.020, 0.005],
          [-0.015, -0.026],
        ],
        side,
      ),
      {
        at: new THREE.Vector3(cx, cy, 0.587),
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.002,
        color: STONE_DARK,
        bone: "head",
        flat: true,
        name: `s22InnerEyeWedge${sideName}`,
        group: "stage2-eyes",
      },
    );
  };

  addEye(1);
  addEye(-1);

  // Four uneven descending fangs. They ride the jaw hinge so the mouth detail follows
  // the open-jaw silhouette if the gargoyle is posed.
  const fangs = [
    {
      name: "OuterL",
      root: new THREE.Vector3(0.112, 1.685, 0.642),
      tip: new THREE.Vector3(0.108, 1.495, 0.692),
      radius: 0.032,
    },
    {
      name: "InnerL",
      root: new THREE.Vector3(0.046, 1.678, 0.651),
      tip: new THREE.Vector3(0.042, 1.558, 0.708),
      radius: 0.023,
    },
    {
      name: "InnerR",
      root: new THREE.Vector3(-0.046, 1.678, 0.651),
      tip: new THREE.Vector3(-0.042, 1.565, 0.710),
      radius: 0.024,
    },
    {
      name: "OuterR",
      root: new THREE.Vector3(-0.114, 1.682, 0.640),
      tip: new THREE.Vector3(-0.108, 1.515, 0.698),
      radius: 0.029,
    },
  ];

  for (const fang of fangs) {
    const direction = fang.tip.clone().sub(fang.root).normalize();
    const collarAt = fang.root.clone().addScaledVector(direction, 0.026);

    b.spike(fang.root, fang.tip, null, fang.radius, {
      color: STONE_LIGHT,
      bone: "jaw",
      caps: "point",
      section: { ngon: 7 },
      name: `s22Fang${fang.name}`,
      group: "stage2-fangs",
    });

    // A dark carved collar at each root reads as a shadow band and separates
    // the tooth from the upper mouth stone.
    b.part(
      new THREE.TorusGeometry(
        fang.radius * 0.78,
        0.0038,
        6,
        10,
      ),
      GROOVE,
      {
        bone: "jaw",
        at: collarAt,
        dir: direction,
        axis: "z",
        flat: true,
        name: `s22FangCollar${fang.name}`,
        group: "stage2-fangs",
      },
    );
  }

  // Recessed tongue slab behind the teeth, giving the open mouth a readable depth cue.
  b.extrude(
    [
      [-0.105, 0],
      [0.105, 0],
      [0.082, 0.047],
      [0.025, 0.078],
      [0, 0.085, "sharp"],
      [-0.025, 0.078],
      [-0.082, 0.047],
    ],
    {
      at: new THREE.Vector3(0, 1.545, 0.690),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.002,
      color: GROOVE,
      bone: "jaw",
      flat: true,
      name: "s22MouthRecess",
      group: "stage2-fangs",
    },
  );
}
    return addEyeSockets;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addWingTraceryL(b: Builder) {
  const buildWing = (side: 1 | -1) => {
    const suffix = side > 0 ? "L" : "R";
    const parent = side > 0 ? "wingL1" : "wingR1";
    const normal = new THREE.Vector3(side * 0.35, 0.65, -0.7).normalize();

    const p = (x: number, y: number, z: number) =>
      new THREE.Vector3(side * x, y, z);

    const lifted = (point: THREE.Vector3, amount: number) =>
      point.clone().addScaledVector(normal, amount);

    const ribPaths = [
      [
        p(0.40, 1.49, -0.14),
        p(0.55, 1.52, -0.22),
        p(0.73, 1.60, -0.37),
        p(0.97, 1.57, -0.57),
      ],
      [
        p(0.43, 1.54, -0.10),
        p(0.57, 1.64, -0.20),
        p(0.77, 1.72, -0.36),
        p(1.00, 1.65, -0.55),
      ],
      [
        p(0.44, 1.40, -0.20),
        p(0.60, 1.43, -0.30),
        p(0.79, 1.49, -0.45),
        p(1.03, 1.56, -0.60),
      ],
    ];

    const ribChains: any[] = [];

    ribPaths.forEach((raw, index) => {
      const recess = raw.map((point) => lifted(point, 0.006));
      const raised = raw.map((point) => lifted(point, 0.024));

      b.sweep(catmull(recess), [0.029, 0.018], {
        bone: parent,
        color: STONE_DARK,
        section: { ngon: 6 },
        caps: "round",
        name: `s23TraceryRecess${suffix}${index}`,
        group: "wing-tracery",
      });

      const rib = b.chain(
        `s23Rib${suffix}${index}`,
        catmull(raised),
        {
          parent,
          names: [
            `s23Rib${suffix}${index}Base`,
            `s23Rib${suffix}${index}Mid`,
            `s23Rib${suffix}${index}Arch`,
            `s23Rib${suffix}${index}Tip`,
          ],
          role: "fan",
          group: "wing-tracery",
        },
      );
      ribChains.push(rib);

      b.sweep(rib, (t: number) => 0.018 * (1 - t) + 0.006, {
        color: STONE_LIGHT,
        section: { ngon: 6 },
        caps: "point",
        name: `s23RaisedRib${suffix}${index}`,
        group: "wing-tracery",
      });

      for (const point of [raw[0], raw[2], raw[3]]) {
        b.spike(
          lifted(point, 0.026),
          normal,
          0.052,
          0.012,
          {
            bone: parent,
            color: STONE_LIGHT,
            caps: "point",
            name: `s23Buttress${suffix}${index}`,
            group: "wing-tracery",
          },
        );
      }
    });

    // A pair of recessed pointed lancets ties the three ribs together.
    const crossA = [
      lifted(p(0.56, 1.54, -0.23), 0.010),
      lifted(p(0.69, 1.64, -0.31), 0.010),
      lifted(p(0.84, 1.65, -0.46), 0.010),
    ];
    const crossB = [
      lifted(p(0.55, 1.46, -0.22), 0.010),
      lifted(p(0.69, 1.52, -0.33), 0.010),
      lifted(p(0.84, 1.57, -0.48), 0.010),
    ];

    b.sweep(catmull(crossA), [0.016, 0.008], {
      bone: parent,
      color: STONE_DARK,
      section: { ngon: 6 },
      caps: "point",
      name: `s23LancetRecessUpper${suffix}`,
      group: "wing-tracery",
    });

    b.sweep(catmull(crossB), [0.014, 0.006], {
      bone: parent,
      color: STONE_DARK,
      section: { ngon: 6 },
      caps: "point",
      name: `s23LancetRecessLower${suffix}`,
      group: "wing-tracery",
    });

    const center = lifted(p(0.69, 1.57, -0.34), 0.034);

    let u = new THREE.Vector3(side * 0.82, 0, -0.58);
    u.addScaledVector(normal, -u.dot(normal)).normalize();
    const v = normal.clone().cross(u).normalize();

    // Dark diamond socket behind the trefoil.
    b.extrude(
      [
        [0, -0.075],
        [0.052, 0],
        [0, 0.075],
        [-0.052, 0],
      ],
      {
        at: center.clone().addScaledVector(normal, -0.012),
        x: u,
        y: v,
        thickness: 0.018,
        bevel: 0.003,
        color: STONE_DARK,
        bone: parent,
        name: `s23TrefoilSocket${suffix}`,
        group: "wing-tracery",
      },
    );

    // Three pointed stone petals form a compact cathedral trefoil.
    const petalAngles = [90, 210, 330];
    petalAngles.forEach((degrees, index) => {
      const angle = THREE.MathUtils.degToRad(degrees);
      const radial = u
        .clone()
        .multiplyScalar(Math.cos(angle))
        .add(v.clone().multiplyScalar(Math.sin(angle)))
        .normalize();
      const tangent = v
        .clone()
        .multiplyScalar(Math.cos(angle))
        .add(u.clone().multiplyScalar(-Math.sin(angle)))
        .normalize();

      const petalAt = center.clone().addScaledVector(radial, 0.018);
      b.extrude(
        [
          [-0.021, -0.008],
          [-0.036, 0.022],
          [-0.013, 0.064],
          [0, 0.102, "sharp"],
          [0.013, 0.064],
          [0.036, 0.022],
          [0.021, -0.008],
        ],
        {
          at: petalAt,
          x: tangent,
          y: radial,
          thickness: 0.014,
          bevel: 0.003,
          color: STONE_LIGHT,
          bone: parent,
          name: `s23TrefoilPetal${suffix}${index}`,
          group: "wing-tracery",
        },
      );

      b.spike(
        lifted(petalAt, 0.022),
        normal,
        0.032,
        0.009,
        {
          bone: parent,
          color: STONE_LIGHT,
          caps: "point",
          name: `s23PetalFinial${suffix}${index}`,
          group: "wing-tracery",
        },
      );
    });

    // Tiny quatrefoil-like centre boss, deliberately angular rather than spherical.
    b.extrude(
      [
        [-0.018, -0.030],
        [0.018, -0.030],
        [0.030, -0.012],
        [0.030, 0.012],
        [0.018, 0.030],
        [-0.018, 0.030],
        [-0.030, 0.012],
        [-0.030, -0.012],
      ],
      {
        at: lifted(center, 0.018),
        x: u,
        y: v,
        thickness: 0.016,
        bevel: 0.003,
        color: STONE_DARK,
        bone: parent,
        name: `s23TrefoilCentre${suffix}`,
        group: "wing-tracery",
      },
    );

    // Small pointed buttresses at the trefoil's three outer joints.
    for (const degrees of petalAngles) {
      const angle = THREE.MathUtils.degToRad(degrees);
      const radial = u
        .clone()
        .multiplyScalar(Math.cos(angle))
        .add(v.clone().multiplyScalar(Math.sin(angle)))
        .normalize();

      b.spike(
        lifted(center.clone().addScaledVector(radial, 0.078), 0.030),
        radial.clone().multiplyScalar(0.35).add(normal),
        0.050,
        0.010,
        {
          bone: parent,
          color: STONE_LIGHT,
          caps: "point",
          name: `s23TrefoilButtress${suffix}${degrees}`,
          group: "wing-tracery",
        },
      );
    }

    // A narrow raised rim follows the outer wing panel and visually locks the tracery
    // into the existing stone digit silhouette.
    const rim = [
      lifted(p(0.74, 1.78, -0.40), 0.020),
      lifted(p(0.88, 1.70, -0.51), 0.020),
      lifted(p(1.02, 1.59, -0.60), 0.020),
    ];

    b.sweep(catmull(rim), [0.015, 0.004], {
      bone: parent,
      color: STONE_LIGHT,
      section: { ngon: 6 },
      caps: "point",
      name: `s23OuterTraceryRim${suffix}`,
      group: "wing-tracery",
    });

    void ribChains;
  };

  buildWing(1);
  buildWing(-1);
}
    return addWingTraceryL;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addClawTalonsL(b: Builder) {
  const bone = "handL";
  const anchor = new THREE.Vector3(0.55, 0.36, 0.55);
  const outward = new THREE.Vector3(0.2, 0.2, 1).normalize();

  const clawStone = paint((_p, n) => {
    const warm = Math.max(0, n.y) * 0.18 + Math.max(0, n.z) * 0.08;
    return warm > 0.12 ? STONE_LIGHT : STONE;
  });

  const addBand = (at: THREE.Vector3, axis: THREE.Vector3, index: number, joint: string) => {
    b.part(
      new THREE.CylinderGeometry(0.029, 0.029, 0.014, 6, 1, false),
      GROOVE,
      {
        bone,
        at,
        dir: axis.clone().normalize(),
        name: `s24${joint}Groove${index}`,
      },
    );
  };

  const addKnuckle = (at: THREE.Vector3, index: number, scale: [number, number, number]) => {
    b.part(new THREE.OctahedronGeometry(0.045, 0), STONE_LIGHT, {
      bone,
      at,
      scale,
      name: `s24leftTalonsKnuckle${index}`,
    });

    b.part(new THREE.BoxGeometry(0.052, 0.012, 0.032), GROOVE, {
      bone,
      at: at.clone().add(new THREE.Vector3(0, 0.018, 0.012)),
      name: `s24leftTalonsKnuckleCut${index}`,
    });
  };

  const offsets = [-0.082, 0, 0.082];

  offsets.forEach((dx, i) => {
    const x = anchor.x + dx;

    // The talons arch over the front lip, then curl down like carved hooked stone.
    const root = new THREE.Vector3(x, 0.405, 0.575);
    const firstJoint = new THREE.Vector3(x + dx * 0.12, 0.391, 0.635);
    const secondJoint = new THREE.Vector3(x + dx * 0.18, 0.335, 0.724);
    const hook = new THREE.Vector3(x + dx * 0.10, 0.272, 0.755);
    const tip = new THREE.Vector3(x - dx * 0.18, 0.255, 0.710);

    addKnuckle(root, i, [1.12, 0.78, 0.92]);

    const jointCap = new THREE.Vector3(
      (firstJoint.x + secondJoint.x) * 0.5,
      (firstJoint.y + secondJoint.y) * 0.5,
      (firstJoint.z + secondJoint.z) * 0.5,
    );
    addKnuckle(jointCap, i + 3, [0.78, 0.68, 0.78]);

    const clawPath = catmull([root, firstJoint, secondJoint, hook, tip]);
    b.sweep(clawPath, (t: number) => 0.030 * (1 - t) + 0.006, {
      bone,
      color: clawStone,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      name: `s24leftHookedTalon${i}`,
      group: "clawTalonsL",
    });

    addBand(
      firstJoint,
      secondJoint.clone().sub(firstJoint),
      i,
      "leftTalonFirst",
    );
    addBand(
      hook,
      tip.clone().sub(hook),
      i,
      "leftTalonHook",
    );

    // A narrow raised dorsal ridge gives each talon a chiseled, architectural highlight.
    const ridgeStart = root.clone().add(new THREE.Vector3(0, 0.025, 0.006));
    const ridgeEnd = secondJoint.clone().add(new THREE.Vector3(0, 0.018, 0));
    b.rod(ridgeStart, ridgeEnd, 0.006, {
      bone,
      color: STONE_LIGHT,
      section: { ngon: 4 },
      caps: "flat",
      name: `s24leftTalonRidge${i}`,
      group: "clawTalonsL",
    });

    // Tiny triangular underside wedge makes the hook read against the ledge rather than as a loose tube.
    const wedgeAt = hook.clone().add(outward.clone().multiplyScalar(0.006));
    b.extrude(
      [
        [0, 0],
        [0.035, 0.012],
        [0.012, 0.058],
        [0, 0.078, "sharp"],
        [-0.012, 0.058],
        [-0.035, 0.012],
      ],
      {
        at: wedgeAt,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.002,
        color: GROOVE,
        bone,
        name: `s24leftTalonUnderside${i}`,
        group: "clawTalonsL",
      },
    );
  });
}
    return addClawTalonsL;
  })(),
);
// add5
STAGE2.push(
  (() => {
function leafOutline(width: number, height: number, lean: number): [number, number, "sharp"][] {
  return [
    [-width, 0, "sharp"],
    [width, 0, "sharp"],
    [width * 0.78, height * 0.38, "sharp"],
    [lean, height, "sharp"],
    [-width * 0.68, height * 0.42, "sharp"],
  ];
}

function gothicLeaf(
  b: Builder,
  at: [number, number, number],
  width: number,
  height: number,
  lean: number,
  index: number,
) {
  const [x, y, z] = at;

  // Recessed dark silhouette behind the pale carved face.
  b.extrude(leafOutline(width + 0.012, height + 0.012, lean), {
    at: [x, y, z - 0.022],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.022,
    bevel: 0.002,
    color: STONE_DARK,
    bone: "tail3",
    name: `s25TailLeafShadow${index}`,
  });

  // The broad pointed stone leaf.
  b.extrude(leafOutline(width, height, lean), {
    at: [x, y, z + 0.008],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.034,
    bevel: 0.004,
    color: STONE_LIGHT,
    bone: "tail3",
    name: `s25TailLeaf${index}`,
  });

  // A dark diamond-shaped channel gives each leaf the look of hand-carved tracery.
  b.extrude(
    [
      [-0.014, 0, "sharp"],
      [0.014, 0, "sharp"],
      [0.010, height * 0.54, "sharp"],
      [0, height * 0.72, "sharp"],
      [-0.010, height * 0.54, "sharp"],
    ],
    {
      at: [x + lean * 0.28, y + height * 0.055, z + 0.031],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.001,
      color: GROOVE,
      bone: "tail3",
      name: `s25TailLeafGroove${index}`,
    },
  );

  // Raised central ridge, intentionally angular rather than smooth.
  b.rod(
    [x, y + 0.018, z + 0.039],
    [x + lean, y + height * 0.88, z + 0.039],
    0.009,
    {
      color: STONE_LIGHT,
      bone: "tail3",
      section: { ngon: 5 },
      name: `s25TailLeafRidge${index}`,
    },
  );

  // Small square root collar makes the leaves look socketed into the tail.
  b.part(new THREE.CylinderGeometry(0.043, 0.050, 0.028, 6), STONE_DARK, {
    at: [x, y - 0.014, z],
    bone: "tail3",
    name: `s25TailLeafSocket${index}`,
  });
}

function terminalSpearhead(b: Builder) {
  const x = 0;
  const y = 0.825;
  const z = -1.315;
  const width = 0.125;
  const height = 0.335;

  b.extrude(leafOutline(width + 0.016, height + 0.014, 0), {
    at: [x, y, z - 0.024],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.024,
    bevel: 0.002,
    color: STONE_DARK,
    bone: "tail3",
    name: "s25TailTerminalShadow",
  });

  b.extrude(leafOutline(width, height, 0), {
    at: [x, y, z + 0.009],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.038,
    bevel: 0.005,
    color: STONE_LIGHT,
    bone: "tail3",
    name: "s25TailTerminalFin",
  });

  b.extrude(
    [
      [-0.018, 0, "sharp"],
      [0.018, 0, "sharp"],
      [0.013, height * 0.62, "sharp"],
      [0, height * 0.84, "sharp"],
      [-0.013, height * 0.62, "sharp"],
    ],
    {
      at: [0, y + 0.025, z + 0.036],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.009,
      bevel: 0.001,
      color: GROOVE,
      bone: "tail3",
      name: "s25TailTerminalChannel",
    },
  );

  b.rod(
    [0, y + 0.025, z + 0.045],
    [0, y + height * 0.91, z + 0.045],
    0.011,
    {
      color: STONE_LIGHT,
      bone: "tail3",
      section: { ngon: 5 },
      name: "s25TailTerminalRidge",
    },
  );

  b.spike([0, y + height - 0.012, z + 0.035], [0, 1, 0], 0.072, 0.027, {
    color: STONE_LIGHT,
    bone: "tail3",
    caps: "point",
    name: "s25TailTerminalFinial",
  });
}

function addClawTalonsR(b: Builder) {
  // -----------------------------------------------------------------------------------------------
  // Right hand: three substantial hooked talons, seated on the existing handR bone.

  const clawXs = [-0.615, -0.552, -0.489];
  const clawLeans = [-0.018, 0.006, 0.028];

  for (let i = 0; i < clawXs.length; i++) {
    const x = clawXs[i];
    const lean = clawLeans[i];

    const root = new THREE.Vector3(x, 0.405, 0.535);
    const knuckle = new THREE.Vector3(x + lean * 0.3, 0.382, 0.605);
    const hook = new THREE.Vector3(x + lean, 0.305 - i * 0.008, 0.705 + i * 0.012);
    const tip = new THREE.Vector3(x + lean * 1.35, 0.205 - i * 0.006, 0.785 + i * 0.018);

    const path = catmull([root, knuckle, hook, tip]);

    b.sweep(path, (t: number) => 0.032 * (1 - t) + 0.006, {
      color: STONE_LIGHT,
      bone: "handR",
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      name: `s25RightTalon${i}`,
      group: "stage2Claws",
    });

    // Angular knuckle block, visibly separate from the curved claw shaft.
    b.part(new THREE.BoxGeometry(0.060, 0.052, 0.074), STONE_LIGHT, {
      at: [x, 0.405, 0.548],
      bone: "handR",
      name: `s25RightKnuckleCap${i}`,
      group: "stage2Claws",
    });

    // Chiseled dark joint band.
    b.rod(
      [x - 0.029, 0.405, 0.575],
      [x + 0.029, 0.405, 0.575],
      0.009,
      {
        color: GROOVE,
        bone: "handR",
        section: { ngon: 5 },
        name: `s25RightKnuckleGroove${i}`,
        group: "stage2Claws",
      },
    );

    // Small pale wedge on the back of each knuckle catches the light like a worn edge.
    b.extrude(
      [
        [-0.025, 0, "sharp"],
        [0.025, 0, "sharp"],
        [0.018, 0.050, "sharp"],
        [0, 0.068, "sharp"],
        [-0.018, 0.050, "sharp"],
      ],
      {
        at: [x, 0.431, 0.535],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.002,
        color: STONE_LIGHT,
        bone: "handR",
        name: `s25RightKnuckleWedge${i}`,
        group: "stage2Claws",
      },
    );

    // A dark inset at the bend emphasizes the hooked silhouette and the carving seams.
    b.rod(hook, tip, 0.010, {
      color: GROOVE,
      bone: "handR",
      section: { ngon: 5 },
      name: `s25RightTalonBendGroove${i}`,
      group: "stage2Claws",
    });

    // Tiny stone cap where each pointed talon bites the ledge.
    b.part(new THREE.SphereGeometry(0.015, 6, 4), STONE_DARK, {
      at: [tip.x, 0.198, tip.z],
      bone: "handR",
      name: `s25RightTalonContact${i}`,
      group: "stage2Claws",
    });
  }

  // A single palm-side plate unifies the three talons into a carved hand rather than loose fingers.
  b.extrude(
    [
      [-0.112, 0, "sharp"],
      [0.112, 0, "sharp"],
      [0.095, 0.070, "sharp"],
      [0.035, 0.115, "sharp"],
      [0, 0.132, "sharp"],
      [-0.035, 0.115, "sharp"],
      [-0.095, 0.070, "sharp"],
    ],
    {
      at: [-0.552, 0.420, 0.505],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.004,
      color: STONE_DARK,
      bone: "handR",
      name: "s25RightPalmCarving",
      group: "stage2Claws",
    },
  );

  // -----------------------------------------------------------------------------------------------
  // Tail crown: alternating leaf-finials follow the raised tail toward its terminal spearhead.

  const leaves = [
    { z: -0.595, y: 0.685, w: 0.078, h: 0.185, lean: -0.035 },
    { z: -0.705, y: 0.625, w: 0.073, h: 0.205, lean: 0.042 },
    { z: -0.815, y: 0.595, w: 0.068, h: 0.220, lean: -0.045 },
    { z: -0.925, y: 0.600, w: 0.064, h: 0.235, lean: 0.050 },
    { z: -1.035, y: 0.630, w: 0.057, h: 0.220, lean: -0.038 },
    { z: -1.135, y: 0.690, w: 0.050, h: 0.205, lean: 0.032 },
  ];

  leaves.forEach((leaf, i) => {
    gothicLeaf(b, [0, leaf.y, leaf.z], leaf.w, leaf.h, leaf.lean, i);
  });

  terminalSpearhead(b);

  // Two small dark socket wedges at the crown's base make the transition into the tail read as carved masonry.
  for (const side of [-1, 1]) {
    b.extrude(
      [
        [0, 0, "sharp"],
        [side * 0.046, 0.006, "sharp"],
        [side * 0.058, 0.052, "sharp"],
        [0, 0.082, "sharp"],
      ],
      {
        at: [side * 0.035, 0.625, -0.895],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.002,
        color: GROOVE,
        bone: "tail3",
        name: `s25TailCrownSocket${side > 0 ? "L" : "R"}`,
        group: "stage2Tail",
      },
    );
  }
}
    return addClawTalonsR;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addLedgeDrain(b: Builder) {
  const dampStone = mottle(LEDGE, LEDGE_DARK, {
    size: 0.13,
    contrast: 1.35,
    seed: 2601,
  });
  const wornTop = mottle(LEDGE_TOP, LEDGE, {
    size: 0.11,
    contrast: 1.2,
    seed: 2607,
  });
  const deepGroove = mottle(GROOVE, LEDGE_DARK, {
    size: 0.07,
    contrast: 1.5,
    seed: 2611,
  });

  const addBox = (
    geometry: THREE.BufferGeometry,
    color: any,
    at: THREE.Vector3 | [number, number, number],
    name: string,
  ) => b.part(geometry, color, { at, name });

  const box = (
    color: any,
    at: THREE.Vector3 | [number, number, number],
    size: [number, number, number],
    name: string,
  ) => addBox(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, name);

  const anchor = new THREE.Vector3(0, 0.2, 0.7);
  const front = (z: number) => new THREE.Vector3(anchor.x, anchor.y, z);

  // ---------------------------------------------------------------------------------------------------------------
  // Gothic rain drain, seated against the positive-Z face of the ledge.

  // A deep, almost black opening behind the carved surround.
  box(
    deepGroove,
    new THREE.Vector3(0, 0.22, 0.806),
    [0.225, 0.135, 0.026],
    "s26DrainOpening",
  );

  // Square side jambs, deliberately heavier than the arch so the drain reads as masonry.
  box(
    wornTop,
    new THREE.Vector3(-0.145, 0.225, 0.812),
    [0.058, 0.165, 0.052],
    "s26DrainJambL",
  );
  box(
    wornTop,
    new THREE.Vector3(0.145, 0.225, 0.812),
    [0.058, 0.165, 0.052],
    "s26DrainJambR",
  );

  // Blocky pointed arch: two sloping voussoir-like pieces and a central keystone.
  b.frustumBox(
    [-0.126, 0.276, 0.819],
    [0, 0.322, 0.819],
    [0.052, 0.044],
    [0.039, 0.036],
    {
      color: wornTop,
      section: "box",
      caps: "flat",
      name: "s26DrainArchL",
    },
  );
  b.frustumBox(
    [0.126, 0.276, 0.819],
    [0, 0.322, 0.819],
    [0.052, 0.044],
    [0.039, 0.036],
    {
      color: wornTop,
      section: "box",
      caps: "flat",
      name: "s26DrainArchR",
    },
  );

  b.extrude(
    [
      [-0.042, 0],
      [0.042, 0],
      [0.034, 0.047],
      [0, 0.075, "sharp"],
      [-0.034, 0.047],
    ],
    {
      at: [0, 0.292, 0.842],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.003,
      color: wornTop,
      name: "s26DrainKeystone",
    },
  );

  // The shallow channel projects from the dark opening and tapers toward its outlet.
  b.frustumBox(
    [0, 0.158, 0.765],
    [0, 0.158, 0.852],
    [0.235, 0.052],
    [0.17, 0.039],
    {
      color: dampStone,
      section: "box",
      caps: "flat",
      name: "s26DrainChannel",
    },
  );

  // Raised channel edges and a narrow central water groove.
  b.rod(
    [-0.105, 0.188, 0.775],
    [-0.078, 0.184, 0.854],
    0.016,
    {
      color: wornTop,
      section: { ngon: 6 },
      caps: "flat",
      name: "s26DrainLipL",
    },
  );
  b.rod(
    [0.105, 0.188, 0.775],
    [0.078, 0.184, 0.854],
    0.016,
    {
      color: wornTop,
      section: { ngon: 6 },
      caps: "flat",
      name: "s26DrainLipR",
    },
  );
  b.rod(
    [0, 0.188, 0.785],
    [0, 0.184, 0.855],
    0.006,
    {
      color: deepGroove,
      section: { ngon: 5 },
      caps: "flat",
      name: "s26DrainWaterGroove",
    },
  );

  // A squared outlet lip and two tiny corner blocks make the drain feel carved rather than attached.
  box(
    wornTop,
    new THREE.Vector3(0, 0.151, 0.854),
    [0.185, 0.043, 0.036],
    "s26DrainOutletLip",
  );
  box(
    LEDGE_DARK,
    new THREE.Vector3(-0.095, 0.202, 0.855),
    [0.035, 0.045, 0.032],
    "s26DrainOutletCornerL",
  );
  box(
    LEDGE_DARK,
    new THREE.Vector3(0.095, 0.202, 0.855),
    [0.035, 0.045, 0.032],
    "s26DrainOutletCornerR",
  );

  // A small pointed underside tooth gives the outlet a recognisable gothic profile.
  b.extrude(
    [
      [-0.052, 0],
      [0.052, 0],
      [0.037, -0.024],
      [0, -0.062, "sharp"],
      [-0.037, -0.024],
    ],
    {
      at: [0, 0.174, 0.859],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.002,
      color: LEDGE_DARK,
      name: "s26DrainUndersidePoint",
    },
  );

  // Short horizontal masonry cuts flank the surround.
  box(
    LEDGE_DARK,
    new THREE.Vector3(-0.206, 0.187, 0.817),
    [0.065, 0.014, 0.018],
    "s26DrainCutL",
  );
  box(
    LEDGE_DARK,
    new THREE.Vector3(0.206, 0.187, 0.817),
    [0.065, 0.014, 0.018],
    "s26DrainCutR",
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Three irregular support blocks beneath the right half of the ledge.

  type OutlinePoint = [number, number] | [number, number, "sharp"];

  const supportBlock = (
    x: number,
    z: number,
    width: number,
    height: number,
    depth: number,
    name: string,
  ) => {
    const c = Math.min(width, height) * 0.16;
    const outline: OutlinePoint[] = [
      [-width * 0.5 + c, 0],
      [width * 0.5 - c, 0],
      [width * 0.5, height * 0.17],
      [width * 0.5 - c * 0.55, height * 0.84],
      [width * 0.5 - c * 1.15, height],
      [-width * 0.5 + c * 0.85, height],
      [-width * 0.5, height * 0.76],
      [-width * 0.5 - c * 0.12, height * 0.19],
    ];

    b.extrude(outline, {
      at: [x, 0.002, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: depth,
      bevel: 0.004,
      color: dampStone,
      name,
    });

    // A pale worn cap catches the light beneath the ledge.
    box(
      wornTop,
      new THREE.Vector3(x, height + 0.008, z),
      [width * 0.68, 0.018, depth * 0.78],
      `${name}Cap`,
    );

    // Two triangular chips on the front face act as tiny carved chamfers.
    const faceZ = z + depth * 0.5 + 0.008;
    for (const side of [-1, 1]) {
      b.extrude(
        [
          [0, 0],
          [side * width * 0.105, 0],
          [side * width * 0.045, height * 0.17],
        ],
        {
          at: [x + side * width * 0.31, height * 0.62, faceZ],
          x: [1, 0, 0],
          y: [0, 1, 0],
          thickness: 0.012,
          bevel: 0.0015,
          color: wornTop,
          name: `${name}TriangularChamfer${side > 0 ? "L" : "R"}`,
        },
      );
    }

    // A broken vertical incision gives each block a different hand-carved identity.
    b.rod(
      [x - width * 0.18, height * 0.21, faceZ + 0.004],
      [x - width * 0.04, height * 0.47, faceZ + 0.004],
      0.0055,
      {
        color: deepGroove,
        section: { ngon: 5 },
        caps: "flat",
        name: `${name}CarvedCrack`,
      },
    );
  };

  const masonryAnchor = new THREE.Vector3(0.72, 0.04, -0.38);

  supportBlock(
    masonryAnchor.x - 0.48,
    masonryAnchor.z - 0.075,
    0.31,
    0.165,
    0.25,
    "s26MasonryBlockA",
  );
  supportBlock(
    masonryAnchor.x,
    masonryAnchor.z - 0.075,
    0.43,
    0.215,
    0.27,
    "s26MasonryBlockB",
  );
  supportBlock(
    masonryAnchor.x + 0.49,
    masonryAnchor.z - 0.075,
    0.32,
    0.145,
    0.23,
    "s26MasonryBlockC",
  );

  // Dark joints between the three stones make the support read as separate masonry courses.
  box(
    deepGroove,
    new THREE.Vector3(masonryAnchor.x - 0.245, 0.082, masonryAnchor.z + 0.055),
    [0.026, 0.025, 0.014],
    "s26MasonryJointAB",
  );
  box(
    deepGroove,
    new THREE.Vector3(masonryAnchor.x + 0.245, 0.095, masonryAnchor.z + 0.055),
    [0.026, 0.025, 0.014],
    "s26MasonryJointBC",
  );

  // A narrow pale ledge-stone runs across the block fronts, with a deliberate stepped break.
  box(
    LEDGE_TOP,
    new THREE.Vector3(masonryAnchor.x - 0.29, 0.139, masonryAnchor.z + 0.061),
    [0.21, 0.018, 0.018],
    "s26MasonryFrontBandA",
  );
  box(
    LEDGE_TOP,
    new THREE.Vector3(masonryAnchor.x + 0.04, 0.157, masonryAnchor.z + 0.071),
    [0.29, 0.018, 0.018],
    "s26MasonryFrontBandB",
  );
  box(
    LEDGE_TOP,
    new THREE.Vector3(masonryAnchor.x + 0.40, 0.119, masonryAnchor.z + 0.056),
    [0.16, 0.018, 0.018],
    "s26MasonryFrontBandC",
  );

  // One broken hanging fragment under the outer block: angular, dark on its underside, and still above the floor.
  const fragmentZ = masonryAnchor.z - 0.075;
  b.extrude(
    [
      [-0.078, 0],
      [0.072, 0],
      [0.082, 0.045],
      [0.045, 0.102],
      [0.009, 0.075],
      [-0.029, 0.132, "sharp"],
      [-0.073, 0.092],
      [-0.094, 0.036],
    ],
    {
      at: [masonryAnchor.x + 0.60, 0.003, fragmentZ],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.18,
      bevel: 0.003,
      color: LEDGE_DARK,
      name: "s26BrokenHangingFragment",
    },
  );

  b.extrude(
    [
      [-0.055, 0],
      [0.055, 0],
      [0.034, 0.036],
      [0, 0.057, "sharp"],
      [-0.038, 0.033],
    ],
    {
      at: [masonryAnchor.x + 0.60, 0.105, fragmentZ + 0.095],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.001,
      color: wornTop,
      name: "s26BrokenFragmentChip",
    },
  );

  // A few small, offset wedge chips complete the carved support without adding scenery around it.
  b.extrude(
    [
      [0, 0],
      [0.052, 0],
      [0.033, 0.035],
      [0, 0.066, "sharp"],
      [-0.02, 0.035],
    ],
    {
      at: [masonryAnchor.x - 0.60, 0.033, masonryAnchor.z + 0.052],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.001,
      color: LEDGE_TOP,
      name: "s26CornerWedgeA",
    },
  );
  b.extrude(
    [
      [0, 0],
      [-0.046, 0],
      [-0.027, 0.031],
      [0, 0.059, "sharp"],
      [0.022, 0.032],
    ],
    {
      at: [masonryAnchor.x + 0.225, 0.086, masonryAnchor.z + 0.056],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.001,
      color: LEDGE_TOP,
      name: "s26CornerWedgeB",
    },
  );
}
    return addLedgeDrain;
  })(),
);
