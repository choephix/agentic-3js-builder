```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
} from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

export const meta = {
  name: "Chibi Axolotl",
  description:
    "A charming low-poly chibi axolotl with a broad smiling head, stubby feet, a tapering tail, and six fan-like frilly pink external gills.",
};

export const REQUESTS = [
  {
    id: "gillFilaments",
    kind: "add",
    part: "head",
    what: "Add delicate branching filaments to every frilly pink axolotl gill: three to five thin rounded tendrils per fan, alternating rose pink and coral pink, with tiny rounded tips. Keep the silhouette soft and cute.",
    at: [0.31, 0.82, 0.38],
    normal: [1, 0, 0],
    bone: "head",
    room: [0.42, 0.4, 0.3],
  },
  {
    id: "faceHighlights",
    kind: "add",
    part: "head",
    what: "Add two large glossy cream-white eye highlights and tiny pale pink cheek freckles, placed symmetrically on the face. Use only PALE, CREAM, and GILL_LIGHT.",
    at: [-0.12, 0.83, 0.69],
    normal: [0, 0, 1],
    bone: "head",
    room: [0.35, 0.3, 0.12],
  },
  {
    id: "smileLine",
    kind: "add",
    part: "mouth",
    what: "Add a simple dark plum smiling mouth line with two tiny rounded mouth corners and a subtle pale lower-lip highlight. Keep it broad, friendly, and readable from the front.",
    at: [0, 0.61, 0.72],
    normal: [0, 0, 1],
    bone: "jaw",
    room: [0.25, 0.12, 0.05],
  },
  {
    id: "bellySpots",
    kind: "add",
    part: "belly",
    what: "Add a small cluster of three to five soft lavender-pink circular spots across the cream belly, arranged like cute freckles rather than a regular pattern.",
    at: [0, 0.53, 0.13],
    normal: [0, -1, 0],
    bone: "spine",
    room: [0.4, 0.06, 0.45],
  },
  {
    id: "toeClaws",
    kind: "add",
    part: "feet",
    what: "Add three tiny rounded toes on each of the four feet. Toes should be short, separated, and pale cream with lavender-pink toe pads, following the relaxed neutral pose.",
    at: [0.2, 0.07, 0.3],
    normal: [0, 1, 0],
    bone: null,
    room: [0.3, 0.12, 0.3],
  },
  {
    id: "tailFin",
    kind: "add",
    part: "tail",
    what: "Add a simple translucent-looking pale pink tail fin as a broad low-poly membrane along the last third of the tail, with a rounded triangular silhouette and a slightly darker pink rim.",
    at: [0, 0.34, -1.03],
    normal: [0, 1, 0],
    bone: "tail2",
    room: [0.28, 0.3, 0.65],
  },
  {
    id: "gillCollars",
    kind: "add",
    part: "head",
    what: "Add small darker rose-pink collar rings where each external gill joins the head, plus one tiny pale bead on each collar. The collars should look integrated, not like floating jewelry.",
    at: [0.29, 0.8, 0.4],
    normal: [1, 0, 0],
    bone: "head",
    room: [0.14, 0.18, 0.16],
  },
  {
    id: "waterBadge",
    kind: "add",
    part: "head",
    what: "Add a tiny stylized aqua water-drop emblem centered high on the forehead, outlined in DARK_PLUM and filled with AQUA, sized like a cute sticker seated on the head.",
    at: [0, 0.94, 0.62],
    normal: [0, 0.7, 0.7],
    bone: "head",
    room: [0.12, 0.12, 0.04],
  },
  {
    id: "coatPattern",
    kind: "texture",
    part: "body",
    what: "Paint a very subtle flat-colour mottled pattern over the body using BODY_BLUE, BODY_LIGHT, and AQUA: broad irregular low-contrast patches, never noisy or realistic.",
  },
  {
    id: "headBlush",
    kind: "texture",
    part: "head",
    what: "Paint soft warm pink blush patches on both cheeks using GILL_LIGHT and GILL_PINK, while keeping the forehead and muzzle clear for the face and water-drop emblem.",
  },
  {
    id: "bellyTexture",
    kind: "texture",
    part: "belly",
    what: "Paint the belly with a gentle two-tone cream-to-lavender transition using CREAM and BELLY_LAVENDER, leaving a clean readable edge against the blue body.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const BODY_BLUE = "#6fafd0";
export const BODY_LIGHT = "#94cce0";
export const AQUA = "#57d8d0";
export const CREAM = "#fff1d0";
export const PALE = "#fffaf0";
export const BELLY_LAVENDER = "#dfb8d3";
export const GILL_PINK = "#f27fa7";
export const GILL_LIGHT = "#ffabc0";
export const GILL_DARK = "#c85382";
export const FOOT_PINK = "#e58aaa";
export const DARK_PLUM = "#382844";
export const MOUTH_DARK = "#4a2942";
export const TAIL_BLUE = "#609bbd";

function sphere(
  b: Builder,
  color: string,
  at: [number, number, number],
  scale: [number, number, number],
  bone: any,
  name: string,
  segments = 10,
) {
  return b.part(new THREE.SphereGeometry(1, segments, Math.max(6, segments - 2)), color, {
    at,
    bone,
    scale,
    name,
    flat: true,
  });
}

function roundedToe(
  b: Builder,
  bone: any,
  at: [number, number, number],
  scale: [number, number, number],
  name: string,
) {
  return sphere(b, FOOT_PINK, at, scale, bone, name, 7);
}

function build() {
  const b = createBuilder({ name: "chibi-axolotl", detail: 1 });

  // ---------------------------------------------------------------------------
  // Skeleton first: one root, a compact spine, a hinged jaw, four relaxed legs,
  // and a segmented tapering tail.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.53, -0.38],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.53, -0.38],
      [0, 0.59, -0.12],
      [0, 0.63, 0.16],
      [0, 0.69, 0.36],
    ]),
    {
      parent: hips,
      names: ["spine", "shoulder", "neck"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 0.76, 0.43],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.61, 0.58],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "face",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.53, -0.4],
      [0, 0.48, -0.7],
      [0, 0.41, -1.0],
      [0, 0.3, -1.3],
      [0, 0.18, -1.5],
    ]),
    {
      parent: hips,
      names: ["tail0", "tail1", "tail2", "tail3", "tailTip"],
      role: "tail",
    },
  );

  const legData = [
    {
      side: "L",
      x: 0.2,
      z: 0.26,
      target: [0.27, 0.09, 0.32] as [number, number, number],
      names: ["hipL", "ankleL", "footL"],
    },
    {
      side: "R",
      x: -0.2,
      z: 0.26,
      target: [-0.27, 0.09, 0.32] as [number, number, number],
      names: ["hipR", "ankleR", "footR"],
    },
    {
      side: "L",
      x: 0.19,
      z: -0.22,
      target: [0.25, 0.09, -0.25] as [number, number, number],
      names: ["hindHipL", "hindAnkleL", "hindFootL"],
    },
    {
      side: "R",
      x: -0.19,
      z: -0.22,
      target: [-0.25, 0.09, -0.25] as [number, number, number],
      names: ["hindHipR", "hindAnkleR", "hindFootR"],
    },
  ];

  const legs: { chain: any; data: (typeof legData)[number]; points: THREE.Vector3[] }[] = [];

  for (const data of legData) {
    const root: [number, number, number] = [data.x, 0.53, data.z];
    const points = limb(
      root,
      data.target,
      [0.22, 0.2],
      [
        [0, 0, data.z > 0 ? 1 : -1],
      ],
    ) as THREE.Vector3[];

    const chain = b.chain(data.names[0], points, {
      parent: hips,
      names: data.names,
      role: "leg",
      contact: data.target,
    });

    legs.push({ chain, data, points });
  }

  // ---------------------------------------------------------------------------
  // Main silhouette: a low, rounded body, pale belly, giant head, and tail.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, [0.22, 0.27], {
    color: BODY_BLUE,
    name: "body",
    group: "body",
    sides: 8,
    skin: "smooth",
    sectors: [[120, 240, BODY_LIGHT]],
  });

  const belly = b.sweep(
    catmull([
      [0, 0.48, -0.3],
      [0, 0.48, -0.02],
      [0, 0.51, 0.22],
      [0, 0.56, 0.36],
    ]),
    [0.17, 0.18],
    {
      color: CREAM,
      bone: spine.joints,
      name: "belly",
      group: "body",
      sides: 8,
      shift: [0, -0.13],
      caps: "round",
    },
  );

  b.sweep(tail, (t: number) => 0.13 * (1 - t) + 0.025, {
    color: TAIL_BLUE,
    name: "tail",
    group: "tail",
    sides: 7,
    skin: "smooth",
    caps: "round",
  });

  // A broad, unmistakable chibi head.
  sphere(
    b,
    BODY_LIGHT,
    [0, 0.76, 0.43],
    [0.34, 0.29, 0.32],
    head,
    "head",
    12,
  );

  // Slight pale muzzle volume gives the face a soft axolotl expression.
  sphere(
    b,
    CREAM,
    [0, 0.65, 0.67],
    [0.2, 0.13, 0.095],
    head,
    "muzzle",
    10,
  );

  // Lower jaw remains a separate hinged piece for rigging and animation.
  b.sweep(
    catmull([
      [0, 0.62, 0.6],
      [0, 0.58, 0.68],
      [0, 0.6, 0.73],
    ]),
    [0.16, 0.13],
    {
      color: CREAM,
      bone: jaw,
      name: "mouth",
      group: "face",
      sides: 8,
      caps: "round",
    },
  );

  // ---------------------------------------------------------------------------
  // Face: oversized dark eyes with pale inset irises and a tiny nose.
  // ---------------------------------------------------------------------------

  for (const side of [-1, 1]) {
    sphere(
      b,
      DARK_PLUM,
      [side * 0.125, 0.82, 0.665],
      [0.082, 0.09, 0.045],
      head,
      side < 0 ? "eyeR" : "eyeL",
      10,
    );

    sphere(
      b,
      PALE,
      [side * 0.125, 0.824, 0.687],
      [0.049, 0.057, 0.018],
      head,
      side < 0 ? "eyeGlowR" : "eyeGlowL",
      8,
    );

    sphere(
      b,
      AQUA,
      [side * 0.125, 0.817, 0.704],
      [0.028, 0.035, 0.012],
      head,
      side < 0 ? "irisR" : "irisL",
      7,
    );
  }

  sphere(b, GILL_DARK, [0, 0.68, 0.745], [0.025, 0.018, 0.012], head, "nose", 7);

  // ---------------------------------------------------------------------------
  // Four short, splayed legs with chunky rounded feet.
  // ---------------------------------------------------------------------------

  for (const entry of legs) {
    const { chain, data } = entry;
    b.sweep(chain, [0.075, 0.055], {
      color: BODY_BLUE,
      bone: chain,
      name: `${data.names[0]}_limb`,
      group: "legs",
      sides: 7,
      skin: "smooth",
    });

    const foot = data.target;
    roundedToe(
      b,
      chain.tip,
      [foot[0], 0.105, foot[2]],
      [0.105, 0.07, 0.12],
      data.names[2],
    );
  }

  // ---------------------------------------------------------------------------
  // Signature frilly pink external gills. Each side gets three broad fans and
  // three supporting stalks, all rooted to the head bone.
  // ---------------------------------------------------------------------------

  for (const side of [-1, 1]) {
    const x = side * 0.275;

    for (let i = 0; i < 3; i++) {
      const y = 0.9 - i * 0.09;
      const z = 0.41 - i * 0.055;
      const tipX = side * (0.43 + i * 0.025);
      const tipY = y + (i - 1) * 0.065;
      const tipZ = z - 0.035;

      b.sweep(
        catmull([
          [x, y, z],
          [side * (0.35 + i * 0.015), y + 0.015, z - 0.01],
          [tipX, tipY, tipZ],
        ]),
        [0.042, 0.025],
        {
          color: i === 1 ? GILL_LIGHT : GILL_PINK,
          bone: head,
          name: `${side > 0 ? "gillL" : "gillR"}_stalk_${i}`,
          group: "gills",
          sides: 7,
          caps: "round",
        },
      );

      sphere(
        b,
        GILL_LIGHT,
        [tipX, tipY, tipZ],
        [0.045, 0.035, 0.04],
        head,
        `${side > 0 ? "gillL" : "gillR"}_tip_${i}`,
        7,
      );

      const fanX = side * (0.36 + i * 0.02);
      const fanZ = z - 0.025;
      const fanY = y;

      b.extrude(
        [
          [0, -0.055],
          [side * 0.11, -0.035],
          [side * 0.16, 0.015],
          [side * 0.08, 0.08],
          [0, 0.105],
          [-side * 0.035, 0.025],
        ],
        {
          at: [fanX, fanY, fanZ],
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: 0.018,
          bevel: 0.006,
          smoothing: 1,
          color: i === 1 ? GILL_LIGHT : GILL_PINK,
          bone: head,
          name: `${side > 0 ? "gillL" : "gillR"}_fan_${i}`,
          group: "gills",
        },
      );
    }

    // A darker root pad makes the gills appear attached rather than floating.
    sphere(
      b,
      GILL_DARK,
      [side * 0.285, 0.82, 0.4],
      [0.045, 0.095, 0.08],
      head,
      `${side > 0 ? "gillL" : "gillR"}_root`,
      8,
    );
  }

  // Small dorsal fin and tail-end fin, kept deliberately simple for the chibi look.
  b.extrude(
    [
      [0, 0],
      [0.14, 0.01],
      [0.19, 0.09],
      [0.1, 0.2],
      [0, 0.24],
    ],
    {
      at: [0, 0.78, -0.58],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.006,
      color: BODY_LIGHT,
      bone: spine.joints[0],
      name: "dorsalFin",
      group: "fins",
    },
  );

  // A few clean body-side plates preserve the flat-colour silhouette while
  // giving Stage 2 clear named surfaces for texture work.
  b.part(
    new THREE.SphereGeometry(1, 8, 6),
    BODY_BLUE,
    {
      at: [0, 0.58, -0.04],
      bone: spine.joints[1],
      scale: [0.245, 0.23, 0.28],
      name: "bodySidePlate",
      group: "body",
      flat: true,
    },
  );

  for (const add of STAGE2) add(b);
  return b.root;
}

export default build;
```