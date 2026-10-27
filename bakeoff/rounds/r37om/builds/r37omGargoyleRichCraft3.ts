import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  frame,
  limb,
  mottle,
  countershade,
  rng,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "cathedral gargoyle",
  description: "A crouched gothic stone gargoyle with folded wings, horns, claws, tail, and a carved cathedral ledge.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  const STONE_DARK = "#34333a";
  const STONE = "#625f66";
  const STONE_LIGHT = "#8c8790";
  const STONE_EDGE = "#aaa3a7";
  const CREVICE = "#24232a";
  const EYE_GOLD = "#d9a84f";
  const EYE_INK = "#18141b";
  const MOSS = "#53624a";
  const LEDGE = "#4b4850";
  const IRON = "#29252d";

  const stone = countershade(
    mottle(STONE, STONE_LIGHT, { size: 0.22, contrast: 1.5, seed: 19 }),
    STONE_DARK,
    { level: -0.08, soft: 0.3 },
  );

  const weatheredStone = countershade(
    mottle(STONE_DARK, STONE_LIGHT, { size: 0.16, contrast: 1.8, seed: 31 }),
    CREVICE,
    { level: 0.05, soft: 0.25 },
  );

  const ledgeStone = mottle(LEDGE, "#716b70", {
    size: 0.18,
    contrast: 1.2,
    seed: 42,
  });

  // ---------------------------------------------------------------------------
  // Skeleton first: a compact crouched pose with powerful haunches and raised
  // shoulders. The gargoyle faces +Z; +X is its left.
  // ---------------------------------------------------------------------------

  const pelvis = b.joint("pelvis", {
    at: [0, 1.18, -0.16],
    dir: [0, 0.05, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.18, -0.16],
      [0, 1.39, -0.08],
      [0, 1.65, 0.02],
      [0, 1.89, 0.12],
    ]),
    {
      parent: pelvis,
      names: ["spine1", "spine2", "shoulders"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.86, 0.12],
      [0, 2.02, 0.22],
      [0, 2.15, 0.34],
    ]),
    {
      parent: spine.tip,
      names: ["neck1", "neck2", "neck3"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 2.17, 0.43],
    dir: [0, 0.02, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.09, 0.55],
    dir: [0, -0.16, 1],
    role: "jaw",
    group: "face",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.15, -0.2],
      [0, 1.04, -0.48],
      [0, 0.82, -0.76],
      [0, 0.61, -1.0],
      [0, 0.42, -1.27],
    ]),
    {
      parent: pelvis,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
    },
  );

  const legPoints: Record<string, THREE.Vector3[]> = {};
  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";

    const hind = limb(
      [side * 0.25, 1.18, -0.1],
      [side * 0.34, 0.27, 0.27],
      [0.38, 0.36, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      { sole: [0, 0, 1] },
    );
    legPoints[`hind${tag}`] = hind;
    b.chain(`hindLeg${tag}`, hind, {
      parent: pelvis,
      names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`, `heel${tag}`],
      role: "leg",
      contact: [side * 0.34, 0.15, 0.27],
    });

    const fore = limb(
      [side * 0.32, 1.73, 0.12],
      [side * 0.42, 0.29, 0.43],
      [0.34, 0.34, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      { sole: [0, 0, 1] },
    );
    legPoints[`fore${tag}`] = fore;
    b.chain(`foreLeg${tag}`, fore, {
      parent: spine.tip,
      names: [`shoulder${tag}`, `elbow${tag}`, `wrist${tag}`, `palm${tag}`],
      role: "arm",
      contact: [side * 0.42, 0.15, 0.43],
    });

    const wing = b.chain(
      `wing${tag}`,
      catmull([
        [side * 0.42, 1.78, 0.01],
        [side * 0.74, 2.02, -0.02],
        [side * 1.05, 2.34, -0.08],
        [side * 1.30, 2.50, 0.02],
      ]),
      {
        parent: spine.tip,
        names: [`wingRoot${tag}`, `wingMid${tag}`, `wingOuter${tag}`, `wingTip${tag}`],
        role: "wing",
      },
    );

    const wingFinger = b.chain(
      `wingFinger${tag}`,
      catmull([
        [side * 0.48, 1.69, -0.01],
        [side * 0.78, 1.77, -0.18],
        [side * 1.12, 1.88, -0.35],
        [side * 1.32, 1.98, -0.42],
      ]),
      {
        parent: spine.tip,
        names: [`fingerRoot${tag}`, `fingerMid${tag}`, `fingerOuter${tag}`, `fingerTip${tag}`],
        role: "digit",
      },
    );

    // Stored as authoring handles for membranes below.
    (wing as any).__finger = wingFinger;
  }

  // ---------------------------------------------------------------------------
  // Ledge and main body
  // ---------------------------------------------------------------------------

  b.part(
    new THREE.BoxGeometry(1.72, 0.16, 1.08, 1, 1, 1),
    ledgeStone,
    { at: [0, 0.08, 0.02], name: "cathedral_ledge", group: "scenery" },
  );

  b.part(
    new THREE.BoxGeometry(1.92, 0.13, 0.18, 1, 1, 1),
    STONE_DARK,
    { at: [0, 0.205, 0.38], name: "ledge_front_moulding", group: "scenery" },
  );

  b.part(
    new THREE.BoxGeometry(1.6, 0.11, 0.14, 1, 1, 1),
    STONE_LIGHT,
    { at: [0, 0.235, -0.38], name: "ledge_back_moulding", group: "scenery" },
  );

  // Small carved corner blocks make the ledge read as architectural rather than
  // a floating platform.
  for (const side of [-1, 1]) {
    b.part(
      new THREE.BoxGeometry(0.24, 0.18, 0.25),
      weatheredStone,
      { at: [side * 0.74, 0.19, 0.31], name: `ledge_corbel_${side}` },
    );
    b.part(
      new THREE.BoxGeometry(0.18, 0.12, 0.20),
      STONE_LIGHT,
      { at: [side * 0.74, 0.31, 0.31], name: `ledge_corbel_cap_${side}` },
    );
  }

  const body = b.sweep(
    catmull([
      [0, 1.1, -0.2],
      [0, 1.29, -0.12],
      [0, 1.56, 0.02],
      [0, 1.78, 0.14],
      [0, 1.91, 0.18],
    ]),
    (t) => 0.29 - t * 0.055,
    {
      bone: [pelvis, ...spine.joints],
      color: stone,
      section: "box",
      sides: 8,
      caps: "round",
      name: "carved_torso",
      group: "body",
    },
  );

  // Heavy haunches give the crouch its silhouette.
  for (const side of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(0.29, 8, 6),
      weatheredStone,
      {
        at: [side * 0.25, 1.15, -0.18],
        scale: [1.0, 1.08, 1.12],
        bone: pelvis,
        name: `haunch_${side}`,
        group: "body",
        flat: true,
      },
    );

    b.part(
      new THREE.SphereGeometry(0.19, 8, 6),
      stone,
      {
        at: [side * 0.34, 1.48, 0.03],
        scale: [0.95, 1.25, 0.9],
        bone: pelvis,
        name: `chest_pillar_${side}`,
        group: "body",
        flat: true,
      },
    );
  }

  const neckTube = b.sweep(
    neck,
    [0.19, 0.13],
    {
      color: stone,
      section: { ngon: 7 },
      caps: "round",
      name: "neck_stone",
      group: "body",
    },
  );

  // Belly keystone and sternum ridge.
  b.part(
    new THREE.BoxGeometry(0.20, 0.48, 0.065),
    STONE_LIGHT,
    {
      at: [0, 1.48, 0.265],
      bone: spine.joints[1],
      name: "sternum_keystone",
      group: "carving",
      rotation: [8, 0, 0],
    },
  );

  b.part(
    new THREE.BoxGeometry(0.30, 0.055, 0.045),
    CREVICE,
    { at: [0, 1.62, 0.32], bone: spine.joints[1], name: "sternum_crease" },
  );

  // ---------------------------------------------------------------------------
  // Legs, paws and claws
  // ---------------------------------------------------------------------------

  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    const hind = legPoints[`hind${tag}`];
    const fore = legPoints[`fore${tag}`];

    const hindChain = b.chain(`hindLegVisual${tag}`, hind, {
      parent: pelvis,
      names: [`hindThigh${tag}`, `hindShin${tag}`, `hindHock${tag}`, `hindFoot${tag}`],
      role: "leg",
    });
    b.sweep(hindChain, [0.13, 0.095, 0.075, 0.065], {
      color: stone,
      section: { ngon: 6 },
      caps: "round",
      name: `hind_leg_${tag}`,
      group: "limbs",
    });

    const foreChain = b.chain(`foreLegVisual${tag}`, fore, {
      parent: spine.tip,
      names: [`foreArm${tag}`, `foreElbow${tag}`, `foreWrist${tag}`, `forePalm${tag}`],
      role: "arm",
    });
    b.sweep(foreChain, [0.105, 0.08, 0.065, 0.06], {
      color: stone,
      section: { ngon: 6 },
      caps: "round",
      name: `fore_leg_${tag}`,
      group: "limbs",
    });

    b.part(
      new THREE.BoxGeometry(0.24, 0.105, 0.31),
      weatheredStone,
      {
        at: [side * 0.34, 0.255, 0.31],
        bone: hindChain.tip,
        name: `hind_paw_${tag}`,
        group: "paws",
        rotation: [0, 0, side * -9],
      },
    );

    b.part(
      new THREE.BoxGeometry(0.19, 0.09, 0.25),
      stone,
      {
        at: [side * 0.42, 0.245, 0.46],
        bone: foreChain.tip,
        name: `fore_paw_${tag}`,
        group: "paws",
        rotation: [0, 0, side * -8],
      },
    );

    // Three broad, triangular stone claws per paw.
    for (let i = -1; i <= 1; i++) {
      const toeX = side * (0.34 + i * 0.055);
      b.part(
        new THREE.ConeGeometry(0.034, 0.14, 5),
        STONE_LIGHT,
        {
          at: [toeX, 0.247, 0.48 + Math.abs(i) * 0.012],
          dir: [0, -0.18, 1],
          bone: hindChain.tip,
          name: `hind_claw_${tag}_${i}`,
          group: "claws",
        },
      );
      b.part(
        new THREE.ConeGeometry(0.027, 0.115, 5),
        STONE_LIGHT,
        {
          at: [side * (0.42 + i * 0.045), 0.238, 0.60],
          dir: [0, -0.18, 1],
          bone: foreChain.tip,
          name: `fore_claw_${tag}_${i}`,
          group: "claws",
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Head, muzzle, open jaw, brows, ears and horns
  // ---------------------------------------------------------------------------

  const skull = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    stone,
    {
      at: head.at,
      bone: head,
      scale: [0.30, 0.29, 0.34],
      name: "gargoyle_skull",
      group: "head",
      flat: true,
    },
  );

  b.part(
    new THREE.BoxGeometry(0.32, 0.18, 0.27),
    weatheredStone,
    {
      at: [0, 2.10, 0.68],
      bone: head,
      name: "muzzle_block",
      group: "face",
      rotation: [-6, 0, 0],
    },
  );

  b.part(
    new THREE.BoxGeometry(0.22, 0.09, 0.08),
    CREVICE,
    {
      at: [0, 2.065, 0.815],
      bone: jaw,
      name: "mouth_cavity",
      group: "face",
      rotation: [4, 0, 0],
    },
  );

  b.part(
    new THREE.BoxGeometry(0.30, 0.08, 0.19),
    STONE_DARK,
    {
      at: [0, 2.005, 0.67],
      bone: jaw,
      name: "lower_jaw",
      group: "jaw",
      rotation: [-10, 0, 0],
    },
  );

  for (const side of [-1, 1]) {
    b.part(
      new THREE.BoxGeometry(0.07, 0.20, 0.19),
      STONE_LIGHT,
      {
        at: [side * 0.205, 2.30, 0.40],
        bone: head,
        name: `brow_${side}`,
        group: "face",
        rotation: [0, side * -12, side * 16],
      },
    );

    // Pointed ears, like small cathedral finials.
    b.extrude(
      [
        [0, 0],
        [0.17, 0.015],
        [0.13, 0.18],
        [0.045, 0.29],
        [0, 0.08],
      ],
      {
        at: [side * 0.205, 2.25, 0.34],
        x: [side, 0, 0],
        y: [0, 0.94, -0.15],
        thickness: 0.055,
        bevel: 0.008,
        smoothing: 0,
        color: stone,
        bone: head,
        name: `pointed_ear_${side}`,
        group: "head",
      },
    );

    // Short swept horns with a heavy root and a pointed tip.
    const hornBase = new THREE.Vector3(side * 0.18, 2.36, 0.28);
    const hornPath = bezier(
      hornBase,
      [side * 0.28, 2.50, 0.13],
      [side * 0.31, 2.72, -0.03],
      [side * 0.22, 2.88, -0.02],
    );
    b.sweep(hornPath, [0.075, 0.012], {
      bone: head,
      color: weatheredStone,
      caps: { start: "round", end: "point" },
      section: { ngon: 6 },
      name: `horn_${side}`,
      group: "horns",
    });

    // Cheek planes and carved fang.
    b.part(
      new THREE.BoxGeometry(0.13, 0.19, 0.12),
      STONE_LIGHT,
      {
        at: [side * 0.20, 2.13, 0.63],
        bone: head,
        name: `cheek_plane_${side}`,
        group: "face",
        rotation: [0, side * 12, 0],
      },
    );

    b.part(
      new THREE.ConeGeometry(0.027, 0.12, 5),
      STONE_EDGE,
      {
        at: [side * 0.095, 2.04, 0.77],
        bone: jaw,
        dir: [0, -1, 0.12],
        name: `fang_${side}`,
        group: "jaw",
      },
    );
  }

  // Nose keystone.
  b.part(
    new THREE.BoxGeometry(0.13, 0.10, 0.11),
    STONE_DARK,
    {
      at: [0, 2.17, 0.82],
      bone: head,
      name: "nose_keystone",
      group: "face",
      rotation: [-8, 0, 0],
    },
  );

  // Eyes are deliberately oversized and graphic, like carved amber glass set
  // into the stone. The SVG texture is reused for both sides.
  const eyeTexture = svg(
    `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 50 Q20 8 40 10 Q62 9 75 50 Q58 91 40 90 Q19 91 5 50Z" fill="#17141c" stroke="#0b0910" stroke-width="5"/>
      <ellipse cx="41" cy="52" rx="20" ry="29" fill="#b77724" stroke="#39200f" stroke-width="3"/>
      <ellipse cx="41" cy="57" rx="11" ry="22" fill="#17141c"/>
      <ellipse cx="33" cy="35" rx="7" ry="10" fill="#fff4c4"/>
      <circle cx="51" cy="67" r="4" fill="#fff4c4"/>
      <path d="M10 36 Q27 10 48 14" fill="none" stroke="#d2a34c" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const headSurface = b.surface(skull);
  for (const side of [-1, 1]) {
    const hit = headSurface.around(head.at).at(side * 38, 7);
    if (hit) {
      b.decal(headSurface, eyeTexture, {
        at: hit,
        size: [0.13, 0.16],
        lift: 0.006,
        mirror: side > 0,
        name: `amber_eye_${side}`,
        group: "face",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Tail with dorsal spikes and a terminal barb
  // ---------------------------------------------------------------------------

  const tailTube = b.sweep(tail, (t) => 0.13 * (1 - t) + 0.026, {
    color: weatheredStone,
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    name: "tapered_tail",
    group: "tail",
  });

  b.along(tailTube, 6, (at, i) => {
    const h = 0.11 * (1 - i / 7);
    b.spike(at, at, h, 0.035 * (1 - i / 8), {
      color: STONE_LIGHT,
      name: `tail_spine_${i}`,
      group: "tail",
    });
  });

  // ---------------------------------------------------------------------------
  // Wings: broad pointed stone membranes with separated finger struts.
  // ---------------------------------------------------------------------------

  for (const side of [1, -1]) {
    const wing = b.chain(
      `membraneWing${side > 0 ? "L" : "R"}`,
      catmull([
        [side * 0.43, 1.81, 0.0],
        [side * 0.72, 2.05, -0.02],
        [side * 1.04, 2.34, -0.08],
        [side * 1.30, 2.50, 0.02],
      ]),
      {
        parent: spine.tip,
        names: [
          `membraneRoot${side > 0 ? "L" : "R"}`,
          `membraneMid${side > 0 ? "L" : "R"}`,
          `membraneOuter${side > 0 ? "L" : "R"}`,
          `membraneTip${side > 0 ? "L" : "R"}`,
        ],
        role: "wing",
      },
    );

    const finger = b.chain(
      `membraneFinger${side > 0 ? "L" : "R"}`,
      catmull([
        [side * 0.44, 1.74, -0.02],
        [side * 0.75, 1.78, -0.19],
        [side * 1.10, 1.88, -0.37],
        [side * 1.33, 1.98, -0.44],
      ]),
      {
        parent: spine.tip,
        names: [
          `membraneFingerRoot${side > 0 ? "L" : "R"}`,
          `membraneFingerMid${side > 0 ? "L" : "R"}`,
          `membraneFingerOuter${side > 0 ? "L" : "R"}`,
          `membraneFingerTip${side > 0 ? "L" : "R"}`,
        ],
        role: "digit",
      },
    );

    b.sweep(wing, [0.055, 0.045, 0.032, 0.018], {
      color: stone,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      name: `wing_leading_edge_${side}`,
      group: "wings",
    });

    b.sweep(finger, [0.04, 0.03, 0.018, 0.008], {
      color: weatheredStone,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      name: `wing_finger_${side}`,
      group: "wings",
    });

    b.membrane(
      wing,
      catmull([
        [side * 0.44, 1.72, -0.01],
        [side * 0.70, 1.72, -0.13],
        [side * 1.04, 1.82, -0.30],
        [side * 1.33, 1.98, -0.44],
      ]),
      {
        color: weatheredStone,
        thickness: 0.018,
        rows: 3,
        cols: 7,
        scallop: 0.11,
        name: `wing_membrane_${side}`,
        group: "wings",
      },
    );

    // A second membrane makes the three-fingered silhouette legible.
    b.membrane(
      catmull([
        [side * 0.72, 2.05, -0.02],
        [side * 1.04, 2.34, -0.08],
        [side * 1.30, 2.50, 0.02],
      ]),
      catmull([
        [side * 0.70, 1.72, -0.13],
        [side * 1.04, 1.82, -0.30],
        [side * 1.33, 1.98, -0.44],
      ]),
      {
        color: stone,
        thickness: 0.015,
        rows: 3,
        cols: 6,
        scallop: 0.16,
        name: `upper_wing_membrane_${side}`,
        group: "wings",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Gothic carving details: ribs, rosettes, moss and iron anchor marks.
  // ---------------------------------------------------------------------------

  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      b.part(
        new THREE.BoxGeometry(0.035, 0.35 - i * 0.05, 0.035),
        STONE_LIGHT,
        {
          at: [side * (0.52 + i * 0.075), 2.01 + i * 0.12, -0.02 - i * 0.07],
          bone: spine.tip,
          name: `wing_rib_${side}_${i}`,
          group: "carving",
          rotation: [0, side * 18, side * 12],
        },
      );
    }

    b.part(
      new THREE.CylinderGeometry(0.055, 0.055, 0.025, 8),
      IRON,
      {
        at: [side * 0.49, 1.75, 0.285],
        dir: [0, 0, 1],
        bone: spine.tip,
        name: `iron_mount_${side}`,
        group: "architecture",
      },
    );
  }

  // Small carved rosette on the chest.
  const rosette = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 6, 4),
      new THREE.MeshStandardMaterial({ color: STONE_EDGE, roughness: 0.85 }),
    );
    petal.position.set(Math.cos(a) * 0.105, Math.sin(a) * 0.105, 0.015);
    petal.scale.set(0.65, 1.15, 0.25);
    rosette.add(petal);
  }
  rosette.position.set(0, 1.59, 0.31);
  b.root.add(rosette);

  // Moss tucked into the architectural creases rather than covering the hero.
  for (const side of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(0.045, 6, 4),
      MOSS,
      {
        at: [side * 0.72, 0.295, 0.37],
        name: `moss_${side}_ledge`,
        group: "scenery",
      },
    );
    b.part(
      new THREE.SphereGeometry(0.035, 6, 4),
      MOSS,
      {
        at: [side * 0.56, 0.22, -0.38],
        name: `moss_${side}_rear`,
        group: "scenery",
      },
    );
  }

  // Pointed finlets down the spine, a strongly readable gargoyle silhouette.
  b.along(spine, 4, (at, i) => {
    b.spike(at, [0, 1, -0.15], 0.13 - i * 0.018, 0.045 - i * 0.006, {
      color: STONE_LIGHT,
      name: `spinal_fin_${i}`,
      group: "carving",
    });
  });

  return b.root;
}
