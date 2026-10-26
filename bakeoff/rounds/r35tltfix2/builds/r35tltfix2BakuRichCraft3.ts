import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  paint,
  countershade,
  stripes,
  rng,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Baku, Dream-Eating Tapir Spirit",
  description:
    "A stylized ukiyo-e woodblock baku: a squat celestial tapir with an enormous trunk, ink-dark mane, indigo stripes, paper-cream markings, and curling dream-cloud ornaments.",
};

export default function build() {
  const b = createBuilder({ name: "baku", detail: 1 });

  const INK = "#211a2b";
  const NIGHT = "#30254a";
  const INDIGO = "#354f82";
  const BLUE = "#5579a4";
  const PAPER = "#f1d7a1";
  const RED = "#a83b3b";
  const GOLD = "#c59643";
  const CLOUD = "#d5a9b8";
  const PALE = "#f7e9c4";

  const inkWash = countershade(NIGHT, "#1c2940", { level: -0.1, soft: 0.22 });
  const hide = stripes(inkWash, [INDIGO, "#263a69"], {
    size: 0.29,
    width: 0.24,
    wobble: 0.18,
    seed: 9,
  });
  const belly = countershade(BLUE, "#273b62", { level: -0.15, soft: 0.3 });
  const creamEdge = paint((p, n) =>
    p.y < 0.62 || n.y < -0.25 ? PAPER : resolveInkWash(p, n),
  );
  const resolveInkWash = (p: THREE.Vector3, n: THREE.Vector3) =>
    n.y > 0.25 ? "#526e9b" : "#293b61";

  // Skeleton: low, heavy tapir spirit with a readable forward-facing head.
  const hips = b.joint("hips", {
    at: [0, 0.87, -0.18],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.88, -0.55],
    [0, 0.96, -0.2],
    [0, 1.02, 0.18],
    [0, 1.08, 0.48],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "shoulder"],
    role: "spine",
  });
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.06, 0.42],
      [0, 1.17, 0.62],
      [0, 1.29, 0.78],
    ]),
    { parent: spine.tip, names: ["neck", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 1.33, 0.82],
    dir: [0, 0.02, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.25, 0.9],
    dir: [0, -0.16, 0.98],
    role: "jaw",
    group: "head",
  });

  // Four sturdy legs, planted into the floor.
  const legData = [
    { s: 1, z: 0.23, name: "legFL", knee: [0.27, 0.55, 0.18], foot: [0.29, 0.16, 0.27] },
    { s: -1, z: 0.23, name: "legFR", knee: [-0.27, 0.55, 0.18], foot: [-0.29, 0.16, 0.27] },
    { s: 1, z: -0.43, name: "legHL", knee: [0.26, 0.54, -0.42], foot: [0.28, 0.16, -0.52] },
    { s: -1, z: -0.43, name: "legHR", knee: [-0.26, 0.54, -0.42], foot: [-0.28, 0.16, -0.52] },
  ];

  const legs: any[] = [];
  for (const d of legData) {
    const root = [d.s * 0.24, 0.88, d.z] as [number, number, number];
    const leg = b.chain(
      d.name,
      polyline([root, d.knee as any, d.foot as any]),
      {
        parent: hips,
        names: [`${d.name}Hip`, `${d.name}Knee`, `${d.name}Ankle`],
        role: "leg",
        contact: d.foot as any,
      },
    );
    legs.push(leg);
  }

  // Main body, broad and slightly arched.
  const body = b.sweep(spine, (t) => 0.34 - t * 0.045, {
    color: hide,
    section: { ngon: 8 },
    sides: 8,
    caps: "round",
    name: "great rounded body",
    group: "body",
  });

  // Shoulder and rump plates give the blocky woodcut silhouette.
  b.part(
    new THREE.SphereGeometry(0.38, 10, 7),
    hide,
    { bone: spine.joints[1], at: [0, 1.02, 0.08], scale: [1.04, 0.9, 1.18], name: "shoulder mass" },
  );
  b.part(
    new THREE.SphereGeometry(0.38, 10, 7),
    hide,
    { bone: spine.joints[0], at: [0, 0.91, -0.43], scale: [1.02, 0.92, 1.12], name: "rump mass" },
  );

  // Legs: dark upper limbs, blue cuffs, cream soles.
  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    b.sweep(leg, (t) => (t < 0.7 ? 0.105 : 0.085), {
      color: belly,
      section: { ngon: 6 },
      caps: "round",
      name: `leg ${i}`,
      role: "leg",
    });
    const ankle = leg.at(0.83);
    b.part(
      new THREE.CylinderGeometry(0.105, 0.095, 0.07, 6),
      PAPER,
      { bone: ankle.bone, at: ankle.at, dir: ankle.tangent, name: `cream ankle ${i}` },
    );
    const foot = leg.tip;
    b.part(
      new THREE.BoxGeometry(0.19, 0.09, 0.25),
      INK,
      { bone: foot, at: foot.at, dir: [0, 0, 1], name: `ink hoof ${i}` },
    );
  }

  // Neck and enormous tapir head.
  b.sweep(neck, [0.22, 0.27], {
    color: hide,
    section: { ngon: 8 },
    caps: "round",
    name: "arched neck",
  });
  b.part(
    new THREE.SphereGeometry(0.29, 10, 8),
    hide,
    { bone: head, at: [0, 1.34, 0.82], scale: [1.02, 1.05, 0.94], name: "baku skull" },
  );
  b.part(
    new THREE.SphereGeometry(0.205, 9, 7),
    belly,
    { bone: jaw, at: [0, 1.23, 1.02], scale: [1.02, 0.62, 1.18], name: "lower jaw" },
  );

  // Long, soft, elephantine tapir trunk.
  const trunkPath = catmull([
    [0, 1.31, 0.94],
    [0, 1.22, 1.12],
    [0, 1.08, 1.28],
    [0, 0.99, 1.39],
    [0, 1.02, 1.51],
  ]);
  const trunk = b.chain("trunk", trunkPath, {
    parent: jaw,
    names: ["trunk1", "trunk2", "trunk3", "trunkTip"],
    role: "tentacle",
  });
  b.sweep(trunk, (t) => 0.16 - t * 0.095, {
    color: belly,
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    name: "dream-scenting trunk",
  });
  b.part(
    new THREE.SphereGeometry(0.078, 7, 5),
    INK,
    { bone: trunk.tip!, at: trunk.tip!.at, scale: [1.2, 0.7, 0.9], name: "trunk nostril end" },
  );
  for (const s of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(0.019, 6, 4),
      PALE,
      { bone: trunk.tip!, at: [s * 0.045, 1.025, 1.55], name: "nostril glint" },
    );
  }

  // Upright rounded ears, cream inside, like folded paper fans.
  for (const s of [1, -1]) {
    const ear = b.extrude(
      [
        [0, 0],
        [0.14, 0.02],
        [0.16, 0.22],
        [0.07, 0.31],
        [-0.045, 0.2],
        [-0.08, 0.03],
      ],
      {
        at: [s * 0.19, 1.48, 0.73],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.055,
        bevel: 0.012,
        color: INK,
        bone: head,
        name: `rounded ear ${s}`,
      },
    );
    b.extrude(
      [
        [0, 0.025],
        [0.1, 0.04],
        [0.105, 0.18],
        [0.045, 0.24],
        [-0.025, 0.16],
      ],
      {
        at: [s * 0.195, 1.49, 0.765],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        color: RED,
        bone: head,
        name: `vermilion ear inner ${s}`,
      },
    );
  }

  // Anime-like but woodblock-simple eyes: dark almond backing and amber iris discs.
  for (const s of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(0.065, 8, 5),
      INK,
      {
        bone: head,
        at: [s * 0.145, 1.39, 1.035],
        scale: [1, 0.82, 0.32],
        name: `ink eye ${s}`,
      },
    );
    b.part(
      new THREE.SphereGeometry(0.039, 8, 5),
      GOLD,
      {
        bone: head,
        at: [s * 0.145, 1.39, 1.061],
        scale: [0.82, 1.18, 0.25],
        name: `golden dream eye ${s}`,
      },
    );
    b.part(
      new THREE.SphereGeometry(0.014, 6, 4),
      PALE,
      { bone: head, at: [s * 0.132, 1.412, 1.075], name: `eye shine ${s}` },
    );
  }

  // Ink brows and cheek crescents.
  for (const s of [1, -1]) {
    b.rod(
      [s * 0.09, 1.49, 1.025],
      [s * 0.2, 1.47, 1.015],
      0.018,
      { color: INK, bone: head, name: `brow ${s}` },
    );
    b.rod(
      [s * 0.19, 1.27, 1.045],
      [s * 0.25, 1.2, 1.0],
      0.012,
      { color: RED, bone: jaw, name: `cheek mark ${s}` },
    );
  }

  // Huge jagged mane: broad woodblock blades along the back of the neck.
  const mane = b.extrude(
    [
      [0, 0],
      [0.2, 0.02],
      [0.25, 0.18],
      [0.34, 0.13],
      [0.29, 0.35],
      [0.39, 0.32],
      [0.28, 0.56],
      [0.12, 0.72],
      [-0.02, 0.55],
    ],
    {
      at: [0.12, 1.05, 0.39],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.08,
      bevel: 0.01,
      color: INK,
      bone: spine.joints[1],
      name: "sawtooth ink mane",
    },
  );
  for (const s of [1, -1]) {
    b.part(
      new THREE.ConeGeometry(0.045, 0.2, 5),
      GOLD,
      {
        bone: head,
        at: [s * 0.07, 1.58, 0.79],
        dir: [0, 1, 0],
        name: "small crown charm",
      },
    );
  }

  // Short curled tail, tipped like a brush.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.91, -0.63],
      [0, 1.0, -0.82],
      [0.04, 1.08, -0.98],
      [0.02, 1.19, -1.08],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );
  b.sweep(tail, (t) => 0.075 - t * 0.05, {
    color: hide,
    section: { ngon: 6 },
    caps: { start: "round", end: "point" },
    name: "brush tail",
  });

  // Ukiyo-e dream clouds: curling pink/cream ribbons behind and above the spirit.
  const cloudPaths = [
    catmull([
      [-0.58, 1.08, -0.52],
      [-0.82, 1.23, -0.68],
      [-0.72, 1.42, -0.8],
      [-0.48, 1.48, -0.72],
    ]),
    catmull([
      [0.55, 1.2, -0.48],
      [0.82, 1.34, -0.62],
      [0.72, 1.56, -0.74],
      [0.46, 1.61, -0.64],
    ]),
    catmull([
      [-0.28, 1.62, -0.28],
      [-0.48, 1.78, -0.38],
      [-0.31, 1.88, -0.48],
      [-0.1, 1.82, -0.42],
    ]),
  ];
  for (let i = 0; i < cloudPaths.length; i++) {
    b.sweep(cloudPaths[i], 0.045, {
      color: i === 1 ? PAPER : CLOUD,
      section: { ngon: 6 },
      caps: "round",
      name: `painted dream cloud ${i}`,
    });
    const p = cloudPaths[i].at(0.5);
    b.part(
      new THREE.TorusGeometry(0.11, 0.018, 5, 10, Math.PI * 1.5),
      INK,
      { at: p, dir: [0, 0, 1], name: `cloud ink curl ${i}` },
    );
  }

  // Floating dream glyphs as double-sided ink cards.
  const glyph = svg(
    `<svg viewBox="0 0 64 64">
      <path d="M32 5 C48 15 47 28 34 33 C21 38 18 49 31 59" fill="none" stroke="#211a2b" stroke-width="5" stroke-linecap="round"/>
      <path d="M18 18 C25 11 39 12 45 20" fill="none" stroke="#a83b3b" stroke-width="3"/>
      <circle cx="31" cy="32" r="4" fill="#c59643"/>
    </svg>`,
    { size: 128 },
  );
  const glyphFrames = [
    { at: [0.52, 1.78, -0.25], axis: [0, 1, 0] },
    { at: [-0.56, 1.65, -0.3], axis: [0, 1, 0] },
    { at: [0.35, 1.96, -0.42], axis: [0, 1, 0] },
  ];
  b.cards(glyphFrames as any, glyph, {
    size: [0.13, 0.18],
    lean: 15,
    flow: [0, 0, -1],
    cross: true,
    color: PALE,
    rng: rng(33),
    name: "floating dream glyphs",
  });

  // A few graphic woodcut seam lines across the body.
  for (const z of [-0.38, -0.1, 0.18, 0.42]) {
    b.rod(
      [-0.29, 1.16, z],
      [0.29, 1.16, z],
      0.009,
      { color: INK, bone: spine.joints[1], name: "blockprint body seam" },
    );
  }

  return b.root;
}
