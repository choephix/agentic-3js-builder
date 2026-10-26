import * as THREE from "three";
import { type Builder, createBuilder, catmull, limb, mix, noise, paint, rng } from "../../../../src/index";

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

  const bodyPaint = paint((p) => {
    const v = noise(p, 0.42, 41);
    if (v > 0.72) return mix(BODY_BLUE, AQUA, 0.24);
    if (v > 0.48) return mix(BODY_BLUE, BODY_LIGHT, 0.42);
    return BODY_BLUE;
  });

  const headBlushPaint = paint((p) => {
    const radial =
      Math.sqrt(
        ((Math.abs(p.x) - 0.15) / 0.115) ** 2 +
          ((p.y - 0.7) / 0.09) ** 2 +
          ((p.z - 0.64) / 0.1) ** 2,
      );
    const cheek = Math.max(0, Math.min(1, 1 - radial));
    const pink = mix(GILL_PINK, GILL_LIGHT, cheek * 0.72);
    return mix(BODY_LIGHT, pink, cheek * 0.58);
  });

  const bellyPaint = paint((p) => {
    const lavender = Math.max(0, Math.min(1, (0.55 - p.y) / 0.2));
    return mix(CREAM, BELLY_LAVENDER, lavender);
  });

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
    color: bodyPaint,
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
      color: bellyPaint,
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
    headBlushPaint,
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

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addGillFilaments(b: Builder) {
  const sides = [-1, 1] as const;

  // Each stage-one fan gets three broad, softly branching filaments.  The
  // first point is buried slightly into the fan so the roots read as attached.
  for (const side of sides) {
    for (let i = 0; i < 3; i++) {
      const fanX = 0.36 + i * 0.02;
      const fanY = 0.9 - i * 0.09;
      const fanZ = 0.41 - i * 0.055;

      const strands = [
        { dy: -0.052, dz: 0.035, bend: -0.018 },
        { dy: 0, dz: 0, bend: 0.012 },
        { dy: 0.052, dz: -0.035, bend: -0.01 },
      ];

      for (let k = 0; k < strands.length; k++) {
        const strand = strands[k];
        const root: [number, number, number] = [
          side * (fanX - 0.018),
          fanY + strand.dy * 0.32,
          fanZ + strand.dz * 0.32,
        ];
        const mid: [number, number, number] = [
          side * (fanX + 0.055),
          fanY + strand.dy * 0.7 + strand.bend,
          fanZ + strand.dz * 0.7,
        ];
        const tip: [number, number, number] = [
          side * (fanX + 0.135 + i * 0.008),
          fanY + strand.dy,
          fanZ + strand.dz,
        ];

        const filamentColor = (i + k) % 2 === 0 ? GILL_PINK : GILL_LIGHT;
        const branchColor = (i + k) % 2 === 0 ? GILL_LIGHT : GILL_PINK;

        b.sweep(catmull([root, mid, tip]), [0.012, 0.004], {
          bone: "head",
          color: filamentColor,
          caps: "round",
          sides: 7,
          name: `s21_gill_${side > 0 ? "L" : "R"}_${i}_${k}`,
          group: "gillFilaments",
        });

        b.part(
          new THREE.SphereGeometry(1, 7, 5),
          GILL_LIGHT,
          {
            bone: "head",
            at: tip,
            scale: [0.012, 0.012, 0.012],
            name: `s21_gillTip_${side > 0 ? "L" : "R"}_${i}_${k}`,
            group: "gillFilaments",
            flat: true,
          },
        );

        // A short secondary fork near the end gives the external gills their
        // characteristic feathery silhouette without making them spiky.
        const forkStart: [number, number, number] = [
          side * (fanX + 0.078),
          fanY + strand.dy * 0.66 + strand.bend * 0.5,
          fanZ + strand.dz * 0.66,
        ];
        const forkMid: [number, number, number] = [
          side * (fanX + 0.112),
          fanY + strand.dy * 0.94 - strand.bend * 0.35,
          fanZ + strand.dz * 0.92 + (k - 1) * 0.012,
        ];
        const forkTip: [number, number, number] = [
          side * (fanX + 0.158 + i * 0.006),
          fanY + strand.dy * 1.08 - strand.bend * 0.45,
          fanZ + strand.dz * 0.92 + (k - 1) * 0.018,
        ];

        b.sweep(catmull([forkStart, forkMid, forkTip]), [0.008, 0.0025], {
          bone: "head",
          color: branchColor,
          caps: "round",
          sides: 6,
          name: `s21_gillFork_${side > 0 ? "L" : "R"}_${i}_${k}`,
          group: "gillFilaments",
        });

        b.part(
          new THREE.SphereGeometry(1, 6, 4),
          GILL_LIGHT,
          {
            bone: "head",
            at: forkTip,
            scale: [0.008, 0.008, 0.008],
            name: `s21_gillForkTip_${side > 0 ? "L" : "R"}_${i}_${k}`,
            group: "gillFilaments",
            flat: true,
          },
        );
      }

      // A darker, rounded collar bead visually gathers the three roots into
      // the existing darker gill pad.
      b.part(
        new THREE.SphereGeometry(1, 8, 5),
        GILL_DARK,
        {
          bone: "head",
          at: [side * (fanX - 0.018), fanY, fanZ],
          scale: [0.026, 0.034, 0.027],
          name: `s21_gillCollar_${side > 0 ? "L" : "R"}_${i}`,
          group: "gillFilaments",
          flat: true,
        },
      );
    }
  }
}
    return addGillFilaments;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addFaceHighlights(b: Builder) {
  // One broad, softly rounded catchlight per eye. The flattened spheres keep the
  // highlights seated on the existing eye domes while still reading as chunky
  // chibi geometry rather than decals.
  for (const side of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(1, 8, 6),
      PALE,
      {
        bone: "head",
        at: [side * 0.108, 0.849, 0.714],
        scale: [0.022, 0.026, 0.009],
        name: `s22_eyeCatchlight_${side < 0 ? "R" : "L"}`,
        group: "faceHighlights",
        flat: true,
      },
    );

    // A smaller warm glint gives each eye a layered glossy reflection without
    // introducing another colour.
    b.part(
      new THREE.SphereGeometry(1, 7, 5),
      CREAM,
      {
        bone: "head",
        at: [side * 0.139, 0.817, 0.711],
        scale: [0.009, 0.012, 0.006],
        name: `s22_eyeGlimmer_${side < 0 ? "R" : "L"}`,
        group: "faceHighlights",
        flat: true,
      },
    );
  }

  // Symmetrical cheek freckles, deliberately uneven in size and height so they
  // feel like tiny organic axolotl markings rather than a repeated decal.
  const freckles: [number, number, number, number, number][] = [
    [-1, 0.178, 0.681, 0.756, 0.010],
    [-1, 0.203, 0.666, 0.754, 0.007],
    [-1, 0.159, 0.661, 0.758, 0.006],
    [1, 0.178, 0.681, 0.756, 0.010],
    [1, 0.203, 0.666, 0.754, 0.007],
    [1, 0.159, 0.661, 0.758, 0.006],
  ];

  for (let i = 0; i < freckles.length; i++) {
    const [side, ax, y, z, r] = freckles[i];
    b.part(
      new THREE.SphereGeometry(1, 7, 5),
      GILL_LIGHT,
      {
        bone: "head",
        at: [side * ax, y, z],
        scale: [r, r * 0.82, 0.0045],
        name: `s22_cheekFreckle_${i}`,
        group: "faceHighlights",
        flat: true,
      },
    );
  }
}
    return addFaceHighlights;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addSmileLine(b: Builder) {
  // ---------------------------------------------------------------------------
  // A broad, gently curved smile on the separate jaw. The slightly raised
  // centre keeps the line readable over the rounded muzzle.
  // ---------------------------------------------------------------------------

  const smile = b.sweep(
    catmull([
      [-0.105, 0.625, 0.741],
      [-0.075, 0.606, 0.748],
      [-0.025, 0.594, 0.752],
      [0, 0.591, 0.753],
      [0.025, 0.594, 0.752],
      [0.075, 0.606, 0.748],
      [0.105, 0.625, 0.741],
    ]),
    0.009,
    {
      bone: "jaw",
      color: MOUTH_DARK,
      caps: "round",
      sides: 7,
      name: "smileLine",
      group: "face",
    },
  );

  // Rounded mouth corners make the smile feel painted onto the soft chibi face
  // rather than ending as two hard tube caps.
  for (const side of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(1, 7, 5),
      MOUTH_DARK,
      {
        bone: "jaw",
        at: [side * 0.108, 0.626, 0.741],
        scale: [0.014, 0.014, 0.012],
        name: side < 0 ? "smileCornerR" : "smileCornerL",
        group: "face",
        flat: true,
      },
    );
  }

  // A tiny pale lower-lip glint sits just beneath the lowest part of the
  // smile, giving the mouth a friendly dimensional highlight.
  b.sweep(
    catmull([
      [-0.038, 0.574, 0.751],
      [0, 0.569, 0.754],
      [0.038, 0.574, 0.751],
    ]),
    0.004,
    {
      bone: "jaw",
      color: PALE,
      caps: "round",
      sides: 6,
      name: "lowerLipHighlight",
      group: "face",
    },
  );

  // Two minute cream glints at the lip corners reinforce the rounded,
  // expressive chibi mouth without adding teeth.
  for (const side of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(1, 6, 4),
      CREAM,
      {
        bone: "jaw",
        at: [side * 0.044, 0.576, 0.756],
        scale: [0.006, 0.004, 0.004],
        name: side < 0 ? "lipGlintR" : "lipGlintL",
        group: "face",
        flat: true,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Four irregular lavender-pink belly freckles. Each spot has a slightly
  // darker, larger under-disc and a smaller soft centre, so they read as
  // seated circular markings rather than floating beads.
  // ---------------------------------------------------------------------------

  const spots: Array<{
    x: number;
    z: number;
    r: number;
    squash: number;
  }> = [
    { x: -0.092, z: 0.225, r: 0.034, squash: 1.0 },
    { x: 0.018, z: 0.195, r: 0.043, squash: 0.92 },
    { x: 0.105, z: 0.125, r: 0.031, squash: 1.05 },
    { x: -0.025, z: 0.065, r: 0.026, squash: 0.88 },
  ];

  for (let i = 0; i < spots.length; i++) {
    const spot = spots[i];

    // The normal supplied by the request is downward, so the cylinder's
    // local Y axis is aimed down into the belly surface.
    b.part(
      new THREE.CylinderGeometry(spot.r * 1.14, spot.r * 1.08, 0.008, 10),
      GILL_LIGHT,
      {
        bone: "spine",
        at: [spot.x, 0.531, spot.z],
        dir: [0, -1, 0],
        scale: [1, spot.squash, 1],
        name: `bellySpot${i}_rim`,
        group: "belly",
        flat: true,
      },
    );

    b.part(
      new THREE.CylinderGeometry(spot.r * 0.82, spot.r * 0.76, 0.010, 10),
      BELLY_LAVENDER,
      {
        bone: "spine",
        at: [spot.x, 0.527, spot.z],
        dir: [0, -1, 0],
        scale: [1, spot.squash, 1],
        name: `bellySpot${i}`,
        group: "belly",
        flat: true,
      },
    );

    // A tiny pale off-centre fleck breaks the perfect discs and gives the
    // markings the soft hand-painted quality of the rest of the creature.
    b.part(
      new THREE.SphereGeometry(1, 6, 4),
      CREAM,
      {
        bone: "spine",
        at: [spot.x - spot.r * 0.25, 0.521, spot.z + spot.r * 0.22],
        dir: [0, -1, 0],
        scale: [spot.r * 0.22, 0.004, spot.r * 0.14],
        name: `bellySpot${i}_fleck`,
        group: "belly",
        flat: true,
      },
    );
  }
}
    return addSmileLine;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addToeClaws(b: Builder) {
  const toeOffsets = [-0.055, 0, 0.055];

  const feet = [
    { side: 1, x: 0.27, z: 0.32, bone: "footL", label: "frontL" },
    { side: -1, x: -0.27, z: 0.32, bone: "footR", label: "frontR" },
    { side: 1, x: 0.25, z: -0.25, bone: "hindFootL", label: "hindL" },
    { side: -1, x: -0.25, z: -0.25, bone: "hindFootR", label: "hindR" },
  ];

  for (const foot of feet) {
    for (let i = 0; i < toeOffsets.length; i++) {
      const x = foot.x + toeOffsets[i];
      const forward = foot.z > 0 ? 1 : 1;
      const baseZ = foot.z - 0.035;
      const tipZ = foot.z + 0.085 * forward;

      b.capsule(
        [x, 0.078, baseZ],
        [x, 0.073, tipZ],
        0.023,
        {
          color: CREAM,
          bone: foot.bone,
          caps: "round",
          sides: 7,
          name: `s24_${foot.label}_toe_${i}`,
          group: "toeClaws",
        },
      );

      b.part(
        new THREE.SphereGeometry(1, 7, 5),
        FOOT_PINK,
        {
          at: [x, 0.071, tipZ + 0.006],
          bone: foot.bone,
          scale: [0.024, 0.012, 0.019],
          name: `s24_${foot.label}_pad_${i}`,
          group: "toeClaws",
          flat: true,
        },
      );

      b.part(
        new THREE.SphereGeometry(1, 6, 4),
        PALE,
        {
          at: [x - foot.side * 0.006, 0.087, tipZ - 0.025],
          bone: foot.bone,
          scale: [0.008, 0.005, 0.009],
          name: `s24_${foot.label}_toe_highlight_${i}`,
          group: "toeClaws",
          flat: true,
        },
      );
    }
  }
}
    return addToeClaws;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addTailFin(b: Builder) {
  const FIN = "#f8b6c8";
  const FIN_LIGHT = "#ffd4df";
  const FIN_RIM = "#d96f9a";
  const FIN_DEEP = "#c65380";
  const bone = "tail2";

  const base: [number, number, number] = [0, 0.34, -1.03];

  // The tail fin is a broad, upright, rounded triangular membrane. Its drawing
  // plane is the tail's side plane: local x runs along the tail and local y up.
  const outline: [number, number, "sharp"?][] = [
    [-0.245, -0.035],
    [0.235, -0.025],
    [0.255, 0.018],
    [0.185, 0.09],
    [0.075, 0.175],
    [-0.045, 0.205],
    [-0.17, 0.145],
    [-0.235, 0.065],
  ];

  const fin = b.extrude(outline, {
    at: base,
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: [0.018, 0.009],
    bevel: 0.008,
    smoothing: 1,
    color: FIN,
    bone,
    name: "s25_tailFin_membrane",
    group: "tailFin",
  });

  // A soft inner highlight gives the thin fin a translucent, watery read
  // without introducing a separate texture or a noisy material.
  b.extrude(
    [
      [-0.16, 0.01],
      [0.15, 0.015],
      [0.13, 0.045],
      [0.035, 0.145],
      [-0.075, 0.125],
      [-0.15, 0.065],
    ],
    {
      at: fin.local([0, 0, 0.012]),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.004,
      bevel: 0.003,
      smoothing: 1,
      color: FIN_LIGHT,
      bone,
      name: "s25_tailFin_innerGlow",
      group: "tailFin",
    },
  );

  const rim: [number, number, number][] = [
    [-0.245, 0.305, -1.03],
    [-0.01, 0.315, -1.275],
    [0.235, 0.315, -0.055 as any],
  ];

  // Explicit model-space rim routes around the silhouette. They are kept just
  // proud of the membrane so the darker pink edge reads from both angles.
  const p0: [number, number, number] = [0, 0.305, -1.275];
  const p1: [number, number, number] = [0, 0.305, -0.795];
  const p2: [number, number, number] = [0, 0.405, -0.845];
  const p3: [number, number, number] = [0, 0.515, -0.955];
  const p4: [number, number, number] = [0, 0.545, -1.075];
  const p5: [number, number, number] = [0, 0.485, -1.20];
  const p6: [number, number, number] = [0, 0.375, -1.265];

  const rimSegments: [[number, number, number], [number, number, number], number][] = [
    [p0, p1, 0.009],
    [p1, p2, 0.008],
    [p2, p3, 0.008],
    [p3, p4, 0.009],
    [p4, p5, 0.008],
    [p5, p6, 0.008],
    [p6, p0, 0.009],
  ];

  for (let i = 0; i < rimSegments.length; i++) {
    const [a, c, radius] = rimSegments[i];
    b.rod(a, c, radius, {
      color: i === 0 || i === 3 ? FIN_DEEP : FIN_RIM,
      bone,
      caps: "round",
      sides: 6,
      name: `s25_tailFin_rim_${i}`,
      group: "tailFin",
    });
  }

  // Three low-poly radial rays suggest the internal cartilage typical of an
  // axolotl tail, while keeping the chibi silhouette uncluttered.
  const rays: [[number, number, number], [number, number, number]][] = [
    [[0, 0.35, -1.045], [0, 0.47, -1.19]],
    [[0, 0.35, -1.045], [0, 0.515, -1.075]],
    [[0, 0.35, -1.045], [0, 0.405, -0.85]],
  ];

  for (let i = 0; i < rays.length; i++) {
    b.rod(rays[i][0], rays[i][1], 0.006, {
      color: i === 1 ? FIN_DEEP : FIN_RIM,
      bone,
      caps: "round",
      sides: 6,
      name: `s25_tailFin_ray_${i}`,
      group: "tailFin",
    });
  }

  // A tiny rounded cartilage bead at the attachment makes the membrane feel
  // seated into the tail rather than pasted onto it.
  b.part(new THREE.SphereGeometry(1, 7, 5), FIN_DEEP, {
    at: [0, 0.35, -1.045],
    scale: [0.035, 0.035, 0.035],
    bone,
    name: "s25_tailFin_rootBead",
    group: "tailFin",
    flat: true,
  });
}
    return addTailFin;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addGillCollars(b: Builder) {
  const headBone = "head";

  // Three collars per side, matching the three external gill stalks in stage 1.
  // The torus axis follows each gill's outward direction, so the collar reads as
  // a soft integrated socket rather than a separate ring of jewelry.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const y = 0.9 - i * 0.09;
      const z = 0.41 - i * 0.055;
      const x = side * 0.286;

      b.part(
        new THREE.TorusGeometry(0.043, 0.011, 5, 10),
        GILL_DARK,
        {
          at: [x, y, z],
          bone: headBone,
          dir: [side, 0, 0],
          axis: "y",
          name: `gillCollar_${side > 0 ? "L" : "R"}_${i}`,
          group: "gills",
          flat: true,
        },
      );

      // A tiny pale bead sits on the forward crown of each collar and partly
      // sinks into the ring, keeping it visually attached to the socket.
      b.part(
        new THREE.SphereGeometry(1, 6, 4),
        PALE,
        {
          at: [x + side * 0.004, y + 0.012, z + 0.043],
          bone: headBone,
          scale: [0.014, 0.014, 0.014],
          name: `gillBead_${side > 0 ? "L" : "R"}_${i}`,
          group: "gills",
          flat: true,
        },
      );
    }
  }

  // A small layered water-drop badge on the forehead. The larger DARK_PLUM
  // silhouette acts as a graphic outline; the aqua inset is raised slightly
  // toward the badge normal.
  const nx = 0;
  const ny = Math.SQRT1_2;
  const nz = Math.SQRT1_2;
  const badgeAt = (lift: number): [number, number, number] => [
    nx * lift,
    0.94 + ny * lift,
    0.62 + nz * lift,
  ];

  const outline: [number, number, "sharp"][] = [
    [-0.042, 0.012, "sharp"],
    [0, 0.078, "sharp"],
    [0.042, 0.012, "sharp"],
    [0.034, -0.027, "sharp"],
    [0, -0.061, "sharp"],
    [-0.034, -0.027, "sharp"],
  ];

  const inset: [number, number, "sharp"][] = [
    [-0.027, 0.009, "sharp"],
    [0, 0.057, "sharp"],
    [0.027, 0.009, "sharp"],
    [0.021, -0.019, "sharp"],
    [0, -0.043, "sharp"],
    [-0.021, -0.019, "sharp"],
  ];

  b.extrude(outline, {
    at: badgeAt(0.006),
    x: [1, 0, 0],
    y: [0, ny, nz],
    thickness: 0.012,
    bevel: 0.004,
    smoothing: 0,
    color: DARK_PLUM,
    bone: headBone,
    name: "waterBadgeOutline",
    group: "face",
  });

  b.extrude(inset, {
    at: badgeAt(0.014),
    x: [1, 0, 0],
    y: [0, ny, nz],
    thickness: 0.009,
    bevel: 0.003,
    smoothing: 0,
    color: AQUA,
    bone: headBone,
    name: "waterBadgeFill",
    group: "face",
  });

  // One tiny PALE glint gives the emblem a wet, aquatic sparkle without
  // obscuring its clean drop silhouette.
  b.part(
    new THREE.SphereGeometry(1, 6, 4),
    PALE,
    {
      at: [0.012, 0.969, 0.649],
      bone: headBone,
      scale: [0.009, 0.009, 0.009],
      name: "waterBadgeGlint",
      group: "face",
      flat: true,
    },
  );
}
    return addGillCollars;
  })(),
);
