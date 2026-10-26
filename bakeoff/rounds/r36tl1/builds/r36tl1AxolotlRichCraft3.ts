import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  paint,
  rng,
  svg,
} from "../../../../src/index";
import {
  animeEye,
  cel,
  furEdge,
  INK,
} from "../../../../kits/toon";

export const meta = {
  name: "Chibi Axolotl",
  description:
    "A friendly low-poly axolotl with a plump lavender body, huge shiny eyes, tiny feet, a broad paddle tail, and exuberant frilly pink external gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibi-axolotl", detail: 1 });

  const BODY = cel("#b98bd1", "#76538f");
  const BODY_SPOT = cel("#d9a9e1", "#9a6caf");
  const BELLY = cel("#f4cde2", "#c98caf");
  const GILL = cel("#ff91b8", "#c94f83");
  const GILL_LIGHT = cel("#ffbfd5", "#df709b");
  const DARK = INK;
  const EYE_WHITE = "#fffdfb";
  const PALE = "#f7d9e8";
  const MOUTH = "#5a294d";
  const FOOT = cel("#d69bc8", "#8e5d8e");

  const spotted = paint((p, n) => {
    const wave =
      Math.sin(p.x * 31 + p.z * 17) * 0.5 +
      Math.sin(p.z * 47 - p.y * 21) * 0.5;
    return wave > 0.62 ? BODY_SPOT : BODY;
  });

  // ---------------------------------------------------------------------------
  // Skeleton first: one root spine, neck/head, a hinged jaw, tail, and four legs.
  // ---------------------------------------------------------------------------

  const pelvis = b.joint("pelvis", {
    at: [0, 0.38, -0.16],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [-0.0, 0.39, -0.26],
      [0, 0.42, 0.03],
      [0, 0.45, 0.28],
      [0, 0.48, 0.46],
    ]),
    {
      parent: pelvis,
      names: ["spine1", "spine2", "shoulders", "neckBase"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.47, 0.40],
      [0, 0.53, 0.56],
      [0, 0.65, 0.68],
    ]),
    {
      parent: spine.tip,
      names: ["neck", "headRoot"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 0.66, 0.70],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.57, 0.78],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "face",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.40, -0.26],
      [0, 0.37, -0.52],
      [0, 0.31, -0.78],
      [0, 0.25, -1.04],
      [0, 0.18, -1.25],
    ]),
    {
      parent: pelvis,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
    },
  );

  const legChains: { chain: ReturnType<typeof b.chain>; side: number; front: boolean }[] = [];

  for (const side of [-1, 1]) {
    for (const front of [false, true]) {
      const x = side * (front ? 0.18 : 0.20);
      const z = front ? 0.28 : -0.12;
      const target = [x * 1.18, 0.075, z + (front ? 0.10 : -0.02)] as [
        number,
        number,
        number,
      ];
      const root = [x, 0.40, z] as [number, number, number];
      const points = limb(
        root,
        target,
        [0.16, 0.13, 0.10],
        front ? [0, 0, 1] : [0, 0, -1],
        { sole: [0, 1, 0] },
      );
      const chain = b.chain(
        `${front ? "fore" : "hind"}Leg${side > 0 ? "L" : "R"}`,
        points,
        {
          parent: spine.joints[front ? 2 : 0],
          names: [
            `${front ? "shoulder" : "hip"}${side > 0 ? "L" : "R"}`,
            `${front ? "elbow" : "knee"}${side > 0 ? "L" : "R"}`,
            `${front ? "wrist" : "ankle"}${side > 0 ? "L" : "R"}`,
            `${front ? "hand" : "foot"}${side > 0 ? "L" : "R"}`,
          ],
          role: "leg",
          contact: target,
        },
      );
      legChains.push({ chain, side, front });
    }
  }

  // ---------------------------------------------------------------------------
  // Main silhouette: soft segmented body, oversized head, and broad tail.
  // ---------------------------------------------------------------------------

  b.sweep(spine, (t) => 0.205 + 0.035 * Math.sin(t * Math.PI), {
    color: spotted,
    section: { ngon: 8 },
    sides: 8,
    caps: "round",
    group: "body",
    name: "plumpBody",
  });

  b.sweep(neck, [0.19, 0.235], {
    color: BODY,
    section: { ngon: 8 },
    caps: "round",
    group: "body",
    name: "neckTube",
  });

  b.sweep(tail, (t) => 0.19 * (1 - t) + 0.018, {
    color: furEdge(spotted, BELLY, {
      level: -0.12,
      teeth: 0.13,
      period: 0.055,
      along: [0, 0, 1],
      ink: "#71466f",
      inkWidth: 0.025,
    }),
    section: { ngon: 7 },
    caps: "round",
    group: "tail",
    name: "paddleTail",
  });

  const skull = b.part(
    new THREE.SphereGeometry(0.285, 14, 10),
    BODY,
    {
      bone: head,
      at: [0, 0.70, 0.76],
      scale: [1.10, 0.92, 1.02],
      group: "head",
      name: "bigRoundHead",
    },
  );

  // Creamy lower face and separate lower jaw make the expression readable.
  b.part(
    new THREE.SphereGeometry(0.19, 12, 8),
    BELLY,
    {
      bone: jaw,
      at: [0, 0.59, 0.90],
      scale: [1.05, 0.58, 0.74],
      group: "face",
      name: "softMuzzle",
    },
  );

  b.sweep(
    catmull([
      [-0.105, 0.565, 0.985],
      [0, 0.545, 1.005],
      [0.105, 0.565, 0.985],
    ]),
    0.012,
    {
      bone: jaw,
      color: MOUTH,
      caps: "round",
      group: "face",
      name: "smilingMouth",
    },
  );

  b.part(
    new THREE.SphereGeometry(0.035, 8, 6),
    DARK,
    {
      bone: jaw,
      at: [0, 0.605, 1.035],
      scale: [1.5, 0.7, 0.7],
      group: "face",
      name: "littleSmileCenter",
    },
  );

  // Tiny rounded nostrils.
  for (const s of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(0.018, 7, 5),
      DARK,
      {
        bone: head,
        at: [s * 0.052, 0.685, 1.025],
        scale: [1, 0.7, 0.55],
        group: "face",
        name: `nostril${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Huge anime eyes, placed after the head so decals conform to its curved face.
  // ---------------------------------------------------------------------------

  const eyeTexture = animeEye({
    iris: "#8d65d9",
    irisLight: "#d7b8ff",
    irisDark: "#49327e",
    blush: "#f28caf",
    size: 384,
  });

  const headSurface = b.surface(skull);
  for (const side of [-1, 1]) {
    const eyeHit = headSurface.around([0, 0.70, 0.76]).at(side * 39, 7);
    if (eyeHit) {
      b.decal(headSurface, eyeTexture, {
        at: eyeHit,
        size: [0.145, 0.195],
        mirror: side > 0,
        lift: 0.003,
        segments: 8,
        group: "face",
        name: `shiningEye${side > 0 ? "L" : "R"}`,
      });
    }
  }

  // Small cheek blush discs give the creature extra chibi charm.
  for (const side of [-1, 1]) {
    const cheek = headSurface.around([0, 0.68, 0.78]).at(side * 67, -12);
    if (cheek) {
      b.stick(
        new THREE.CircleGeometry(0.052, 10),
        "#f28fae",
        cheek,
        {
          embed: 0.05,
          group: "face",
          name: `cheekBlush${side > 0 ? "L" : "R"}`,
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Four short, splayed legs with chunky toes.
  // ---------------------------------------------------------------------------

  for (const { chain, side, front } of legChains) {
    b.sweep(chain, (t) => 0.055 - t * 0.018, {
      color: front ? BODY : FOOT,
      section: { ngon: 6 },
      sides: 6,
      caps: "round",
      group: "legs",
      name: `${front ? "fore" : "hind"}LegTube${side > 0 ? "L" : "R"}`,
    });

    const foot = chain.tip.at;
    b.part(
      new THREE.SphereGeometry(0.075, 8, 6),
      FOOT,
      {
        bone: chain.tip,
        at: foot,
        scale: [1.2, 0.55, 1.35],
        group: "legs",
        name: `${front ? "hand" : "foot"}Pad${side > 0 ? "L" : "R"}`,
      },
    );

    for (let i = -1; i <= 1; i++) {
      const toeStart: [number, number, number] = [
        foot.x + side * i * 0.025,
        foot.y + 0.005,
        foot.z + 0.035,
      ];
      const toeEnd: [number, number, number] = [
        toeStart[0] + side * i * 0.018,
        0.035,
        toeStart[2] + (front ? 0.07 : -0.06),
      ];
      b.sweep([toeStart, toeEnd], [0.018, 0.006], {
        bone: chain.tip,
        color: PALE,
        section: { ngon: 6 },
        caps: "round",
        group: "legs",
        name: `${front ? "front" : "back"}Toe${side > 0 ? "L" : "R"}${i}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Signature frilly external gills.
  // Each side has three pink stalks and several broad, angular frill blades.
  // ---------------------------------------------------------------------------

  const frillTexture = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 64 C4 55 8 45 2 36 C12 40 11 28 5 19 C15 23 17 10 16 0
               C21 11 24 23 28 18 C27 31 20 39 30 37 C23 47 28 57 16 64Z"
            fill="#ffb2cb" stroke="#8e3f70" stroke-width="2"/>
      <path d="M16 57 L16 9 M10 47 L6 31 M22 47 L27 29" stroke="#e66b9d" stroke-width="2" fill="none"/>
    </svg>`,
    { size: 128 },
  );

  for (const side of [-1, 1]) {
    const gillRoot = [side * 0.205, 0.78, 0.70] as [number, number, number];

    for (let i = 0; i < 3; i++) {
      const z = 0.64 + i * 0.085;
      const y = 0.79 + (i === 1 ? 0.025 : 0);
      const root = [side * 0.225, y, z] as [number, number, number];
      const tip = [
        side * (0.38 + i * 0.018),
        0.91 + (i === 1 ? 0.055 : 0),
        z + (i - 1) * 0.035,
      ] as [number, number, number];

      b.sweep([root, tip], [0.025, 0.012], {
        bone: head,
        color: GILL,
        section: { ngon: 6 },
        caps: "round",
        group: "gills",
        name: `gillStalk${side > 0 ? "L" : "R"}${i}`,
      });

      // Frilly cards are double-sided and stay legible from the front and side.
      b.cards(
        [
          {
            ...b.surface(skull).around(gillRoot).at(side * (72 + i * 7), 17)!,
          },
        ],
        frillTexture,
        {
          size: [0.105, 0.23 - i * 0.018],
          lean: 16,
          bend: 18,
          cross: true,
          flow: [side * 0.8, 0.22, 0.25],
          mirror: side > 0,
          color: GILL_LIGHT,
          sink: 0.16,
          group: "gills",
          name: `gillFrill${side > 0 ? "L" : "R"}${i}`,
        },
      );

      // Extra little branchlets make each gill read as a feathery structure,
      // rather than a single flat leaf.
      for (const branch of [-1, 0, 1]) {
        const branchBase: [number, number, number] = [
          tip[0] - side * 0.018,
          tip[1] + branch * 0.025,
          tip[2] + branch * 0.018,
        ];
        const branchTip: [number, number, number] = [
          tip[0] + side * (0.045 + Math.abs(branch) * 0.012),
          tip[1] + 0.055 + branch * 0.028,
          tip[2] + branch * 0.04,
        ];
        b.sweep([branchBase, branchTip], [0.009, 0.002], {
          bone: head,
          color: GILL_LIGHT,
          section: { ngon: 5 },
          caps: "point",
          group: "gills",
          name: `gillTwig${side > 0 ? "L" : "R"}${i}_${branch}`,
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // A few soft dorsal spots and tail accents, kept sparse so the silhouette wins.
  // ---------------------------------------------------------------------------

  const bodySurface = b.surface(b.root);
  const dorsalHits = bodySurface.scatter(18, {
    rng: rng(41),
    minDist: 0.075,
    filter: (h) => h.n.y > 0.55 && h.at.z < 0.38,
  });

  for (const hit of dorsalHits) {
    b.stick(
      new THREE.CircleGeometry(0.018 + 0.008 * Math.abs(hit.at.x), 7),
      "#9a67b0",
      hit,
      {
        embed: 0.18,
        group: "markings",
        name: "softDorsalSpot",
      },
    );
  }

  // Tail fin-like upper and lower ridges, broad but simple.
  const finTop = b.extrude(
    [
      [0, 0],
      [0.12, 0.08],
      [0.22, 0.18],
      [0.38, 0.23],
      [0.50, 0.13],
      [0.57, 0],
    ],
    {
      at: [0, 0.40, -0.38],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.018,
      bevel: 0.006,
      smoothing: 1,
      color: BELLY,
      bone: pelvis,
      group: "tail",
      name: "upperTailFin",
    },
  );

  b.extrude(
    [
      [0, 0],
      [0.14, -0.06],
      [0.27, -0.16],
      [0.43, -0.18],
      [0.56, -0.08],
      [0.60, 0],
    ],
    {
      at: [0, 0.39, -0.39],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.014,
      bevel: 0.004,
      smoothing: 1,
      color: BELLY,
      bone: pelvis,
      group: "tail",
      name: "lowerTailFin",
    },
  );

  // A tiny pale chin highlight makes the face feel plush.
  b.part(
    new THREE.SphereGeometry(0.045, 8, 5),
    PALE,
    {
      bone: jaw,
      at: [0, 0.535, 0.96],
      scale: [1.5, 0.48, 0.7],
      group: "face",
      name: "chinHighlight",
    },
  );

  return b.root;
}
