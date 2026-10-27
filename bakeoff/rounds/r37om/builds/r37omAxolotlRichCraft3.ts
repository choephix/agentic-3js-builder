import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  limb,
  svg,
  paint,
} from "../../../../src/index";
import {
  cel,
  furEdge,
  animeEye,
  INK,
} from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Chibi Axolotl",
  description:
    "A cute low-poly axolotl puppet with a soft pink body, huge glossy eyes, broad feet, a smiling hinged jaw, and six frilly pink external gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibiAxolotl", detail: 1 });

  const PINK = cel("#e99aaa", "#b95d78");
  const PINK_LIGHT = cel("#ffb9c4", "#d87891");
  const GILL = cel("#ff83a4", "#c94370");
  const GILL_TIP = cel("#ffd0d5", "#ed7896");
  const CREAM = cel("#fff0d5", "#e6b79e");
  const DARK = "#28182b";
  const BLACK = "#171322";
  const MOUTH = cel("#7b3153", "#421d35");
  const SPOT = cel("#c96d86", "#8f3f61");

  const bodyPaint = furEdge(PINK, CREAM, {
    level: -0.18,
    teeth: 0.16,
    period: 0.085,
    along: [0, 0, 1],
    ink: undefined,
  });

  const bellyPaint = furEdge(CREAM, PINK, {
    level: 0.28,
    teeth: 0.08,
    period: 0.06,
    axis: [0, 1, 0],
    by: "position",
    along: [1, 0, 0],
  });

  const eyeTexture = animeEye({
    iris: "#5ccbd0",
    irisLight: "#b8ffff",
    irisDark: "#287783",
    blush: "#ff8fa9",
    size: 512,
  });

  const gillTexture = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M31 126 C27 103 25 91 18 76 C11 61 3 49 5 33
               C16 40 26 54 31 70 C31 47 35 23 48 5
               C54 24 51 45 43 66 C50 54 58 47 63 45
               C61 69 47 84 39 94 C36 104 36 116 37 126Z"
            fill="#ff8caf" stroke="#8f365f" stroke-width="3"
            stroke-linejoin="round"/>
      <path d="M30 118 C28 94 23 74 10 48 M34 113 C34 78 39 42 49 17 M37 96 C45 77 55 62 60 51"
            fill="none" stroke="#ffd1d7" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // --------------------------------------------------------------------------
  // Skeleton first: one central root, a soft spine, hinged jaw, tail, and four
  // short splayed limbs.
  // --------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.31, -0.58],
    dir: [0, 0.04, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.31, -0.58],
      [0, 0.38, -0.25],
      [0, 0.48, 0.08],
      [0, 0.55, 0.32],
    ]),
    {
      parent: hips,
      names: ["spineBase", "spineMid", "neck"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 0.58, 0.37],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.43, 0.65],
    dir: [0, -0.12, 0.9],
    role: "jaw",
    group: "face",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.31, -0.61],
      [0, 0.29, -0.92],
      [0, 0.24, -1.26],
      [0, 0.16, -1.58],
      [0, 0.09, -1.83],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tailTip"],
      role: "tail",
    },
  );

  const legSpecs = [
    { side: "L", s: 1, root: [0.20, 0.34, 0.13] as [number, number, number], foot: [0.34, 0.075, 0.31] as [number, number, number] },
    { side: "R", s: -1, root: [-0.20, 0.34, 0.13] as [number, number, number], foot: [-0.34, 0.075, 0.31] as [number, number, number] },
    { side: "L", s: 1, root: [0.19, 0.29, -0.39] as [number, number, number], foot: [0.31, 0.075, -0.67] as [number, number, number] },
    { side: "R", s: -1, root: [-0.19, 0.29, -0.39] as [number, number, number], foot: [-0.31, 0.075, -0.67] as [number, number, number] },
  ];

  const legs: {
    side: string;
    s: number;
    chain: ReturnType<typeof b.chain>;
    points: THREE.Vector3[];
  }[] = [];

  for (let i = 0; i < legSpecs.length; i++) {
    const q = legSpecs[i];
    const points = limb(
      q.root,
      q.foot,
      [0.19, 0.16, 0.14],
      [
        [0, 0, q.s],
        [0, 0, -q.s],
      ],
      { sole: [0, 1, 0] },
    );
    const chain = b.chain(
      `leg${q.side}${i < 2 ? "F" : "H"}`,
      points,
      {
        parent: hips,
        names: [
          `${i < 2 ? "shoulder" : "hip"}${q.side}${i}`,
          `knee${q.side}${i}`,
          `ankle${q.side}${i}`,
          `foot${q.side}${i}`,
        ],
        role: "leg",
        contact: q.foot,
      },
    );
    legs.push({ side: q.side, s: q.s, chain, points });
  }

  // --------------------------------------------------------------------------
  // Main body: chunky, nearly horizontal, with a pale zig-zag belly.
  // --------------------------------------------------------------------------

  const bodyTube = b.sweep(spine, (t) => 0.22 + 0.07 * Math.sin(Math.PI * t), {
    bone: spine,
    color: bodyPaint,
    section: { ngon: 8 },
    sides: 8,
    caps: "round",
    name: "softBody",
    group: "body",
  });

  b.sweep(tail, (t) => 0.16 * (1 - t) + 0.025, {
    bone: tail,
    color: bodyPaint,
    section: { ngon: 7 },
    sides: 7,
    caps: { start: "round", end: "point" },
    name: "taperedTail",
    group: "body",
  });

  // Pale belly patch as a broad, low companion tube.
  b.sweep(
    catmull([
      [0, 0.29, -0.42],
      [0, 0.34, -0.05],
      [0, 0.42, 0.25],
    ]),
    [0.14, 0.18],
    {
      bone: spine.joints[0],
      color: bellyPaint,
      section: { ngon: 7 },
      caps: "round",
      name: "belly",
      group: "body",
    },
  );

  // Head and soft cheek volumes.
  const skull = b.part(
    new THREE.SphereGeometry(1, 14, 10),
    bodyPaint,
    {
      bone: head,
      at: [0, 0.62, 0.39],
      scale: [0.40, 0.35, 0.40],
      name: "roundHead",
      group: "head",
    },
  );

  for (const s of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(1, 10, 8),
      CREAM,
      {
        bone: head,
        at: [s * 0.115, 0.54, 0.66],
        scale: [0.14, 0.13, 0.12],
        name: `muzzle${s > 0 ? "L" : "R"}`,
        group: "face",
      },
    );
  }

  // Cute lower jaw is a separate hinged volume.
  b.sweep(
    catmull([
      [0, 0.45, 0.64],
      [0, 0.40, 0.72],
      [0, 0.39, 0.78],
    ]),
    [0.15, 0.07],
    {
      bone: jaw,
      color: CREAM,
      section: { ngon: 7 },
      caps: "round",
      name: "lowerJaw",
      group: "face",
    },
  );

  // A dark, open smile line between the two jaws.
  b.sweep(
    catmull([
      [-0.13, 0.505, 0.735],
      [0, 0.49, 0.765],
      [0.13, 0.505, 0.735],
    ]),
    0.012,
    {
      bone: jaw,
      color: MOUTH,
      section: { ngon: 6 },
      caps: "round",
      name: "smile",
      group: "face",
    },
  );

  // Tiny central mouth crease and two soft nostrils.
  b.part(new THREE.SphereGeometry(0.018, 6, 4), DARK, {
    bone: jaw,
    at: [0, 0.49, 0.79],
    name: "mouthCenter",
    group: "face",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.017, 6, 4), DARK, {
      bone: head,
      at: [s * 0.065, 0.615, 0.735],
      name: `nostril${s > 0 ? "L" : "R"}`,
      group: "face",
    });
  }

  // --------------------------------------------------------------------------
  // Huge eyes: raised dark eye backing, glossy anime decals, and tiny brow pads.
  // --------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const eyeAt = new THREE.Vector3(s * 0.145, 0.735, 0.665);
    b.part(new THREE.SphereGeometry(1, 10, 8), BLACK, {
      bone: head,
      at: eyeAt,
      scale: [0.115, 0.14, 0.075],
      name: `eyeSocket${s > 0 ? "L" : "R"}`,
      group: "face",
    });

    b.decal(skull, eyeTexture, {
      at: eyeAt.clone().add(new THREE.Vector3(0, 0, 0.064)),
      dir: [0, 0, 1],
      up: [0, 1, 0],
      size: [0.125, 0.17],
      lift: 0.004,
      mirror: s > 0,
      segments: 7,
      name: `shinyEye${s > 0 ? "L" : "R"}`,
      group: "face",
    });

    b.part(new THREE.SphereGeometry(0.035, 7, 5), bodyPaint, {
      bone: head,
      at: [s * 0.145, 0.86, 0.66],
      scale: [0.13, 0.035, 0.025],
      dir: [0, 0.15, 1],
      name: `brow${s > 0 ? "L" : "R"}`,
      group: "face",
    });
  }

  // A few rosy cheek spots add life without breaking the blocky silhouette.
  for (const s of [1, -1]) {
    for (let j = 0; j < 3; j++) {
      b.part(new THREE.SphereGeometry(0.014, 6, 4), SPOT, {
        bone: head,
        at: [s * (0.24 + j * 0.018), 0.52 + (j % 2) * 0.025, 0.685],
        name: `cheekSpot${s > 0 ? "L" : "R"}${j}`,
        group: "face",
      });
    }
  }

  // --------------------------------------------------------------------------
  // Four sturdy little legs, broad feet, and three separated toes per foot.
  // --------------------------------------------------------------------------

  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    b.sweep(leg.chain, (t) => 0.075 - t * 0.018, {
      bone: leg.chain,
      color: bodyPaint,
      section: { ngon: 6 },
      caps: "round",
      name: `legTube${i}`,
      group: "limbs",
    });

    const end = leg.points[leg.points.length - 1];
    b.part(new THREE.SphereGeometry(1, 8, 5), CREAM, {
      bone: leg.chain.tip,
      at: end,
      scale: [0.12, 0.055, 0.15],
      name: `palm${i}`,
      group: "limbs",
    });

    for (let d = -1; d <= 1; d++) {
      const toeStart: [number, number, number] = [
        end[0] + d * 0.045,
        0.07,
        end[2] + 0.025,
      ];
      const toeEnd: [number, number, number] = [
        end[0] + d * 0.06,
        0.035,
        end[2] + 0.12 - Math.abs(d) * 0.018,
      ];
      b.sweep([toeStart, toeEnd], [0.022, 0.006], {
        bone: leg.chain.tip,
        color: CREAM,
        section: { ngon: 5 },
        caps: { start: "round", end: "point" },
        name: `toe${i}_${d + 1}`,
        group: "digits",
      });
    }
  }

  // --------------------------------------------------------------------------
  // External gills: three elegant branching fronds on each side of the head.
  // Each has a fleshy root, curved stalk, side branches, pale vein tips, and a
  // translucent-looking illustrated card for extra frill detail.
  // --------------------------------------------------------------------------

  const makeGill = (side: number, index: number) => {
    const root = new THREE.Vector3(side * 0.285, 0.73 - index * 0.055, 0.22 - index * 0.025);
    const outward = side * (0.22 + index * 0.015);
    const tip = new THREE.Vector3(
      root.x + outward,
      root.y + 0.025 + index * 0.012,
      root.z - 0.05 - index * 0.05,
    );

    const gillFrame = frame(root, [side, 0.12, -0.28]);
    const path = catmull([
      root,
      [root.x + side * 0.075, root.y + 0.01, root.z - 0.01],
      [tip.x - side * 0.045, tip.y + 0.025, tip.z + 0.02],
      tip,
    ]);

    const sprout = b.sprout(
      `gill${side > 0 ? "L" : "R"}${index}`,
      gillFrame,
      path,
      [0.031 - index * 0.003, 0.009],
      {
        count: 2,
        names: [
          `gill${side > 0 ? "L" : "R"}${index}Base`,
          `gill${side > 0 ? "L" : "R"}${index}Hinge`,
        ],
        role: "fan",
        color: GILL,
        caps: { start: "round", end: "point" },
        group: "gills",
      },
    );

    if (sprout.sweep) {
      const branchBase = sprout.sweep.at(0.58);
      const branchA = new THREE.Vector3(
        branchBase.at.x + side * 0.10,
        branchBase.at.y + 0.10,
        branchBase.at.z + 0.01,
      );
      const branchB = new THREE.Vector3(
        branchBase.at.x + side * 0.12,
        branchBase.at.y - 0.015,
        branchBase.at.z - 0.11,
      );

      b.sweep([branchBase.at, branchA], [0.014, 0.004], {
        bone: branchBase.bone,
        color: GILL_TIP,
        section: { ngon: 6 },
        caps: { start: "round", end: "point" },
        name: `gill${side > 0 ? "L" : "R"}${index}Upper`,
        group: "gills",
      });
      b.sweep([branchBase.at, branchB], [0.013, 0.003], {
        bone: branchBase.bone,
        color: GILL_TIP,
        section: { ngon: 6 },
        caps: { start: "round", end: "point" },
        name: `gill${side > 0 ? "L" : "R"}${index}Lower`,
        group: "gills",
      });

      const frill = b.cards(
        [
          frame(branchA, [side, 0.25, -0.1]),
          frame(branchB, [side, -0.05, -0.25]),
          frame(tip, [side, 0.1, -0.3]),
        ],
        gillTexture,
        {
          size: [0.075 - index * 0.006, 0.19 - index * 0.012],
          lean: 16,
          flow: [side, 0.1, -0.5],
          bend: 18,
          cross: true,
          sink: 0.06,
          color: GILL,
          rng: rng(300 + side * 20 + index),
          group: "gills",
        },
      );
      glow(frill, 0.35);
    }
  };

  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) makeGill(side, i);
  }

  // Small gill collars where each fan emerges from the skull.
  for (const side of [1, -1]) {
    b.ring(
      {
        at: [side * 0.29, 0.72, 0.23],
        axis: [side, 0.08, 0.1],
      },
      {
        count: 7,
        radius: 0.048,
        fromDeg: -62,
        toDeg: 62,
        tilt: 18,
        name: `gillCollar${side > 0 ? "L" : "R"}`,
        role: "fan",
        group: "gills",
      },
      (item) =>
        b.spike(item, item, 0.045, 0.009, {
          color: GILL_TIP,
          name: `collarSpike${side}_${item.i}`,
          group: "gills",
        }),
    );
  }

  // A tiny dorsal ridge of rounded pink nubs, emphasizing the silhouette.
  b.along(spine, 6, (at) =>
    b.spike(at, [0, 0.9, -0.05], 0.055, 0.025, {
      color: PINK_LIGHT,
      name: `dorsalNub${Math.round(at.t * 10)}`,
      group: "body",
    }),
  );

  // Tail-side spots: simple raised discs keep the pattern readable in a low-poly render.
  for (let i = 0; i < 7; i++) {
    const t = 0.18 + i * 0.105;
    const p = tail.at(t);
    b.part(new THREE.SphereGeometry(0.018, 6, 4), SPOT, {
      bone: p.bone,
      at: p.at.clone().add(new THREE.Vector3(0.045 * (i % 2 ? 1 : -1), 0.055, 0)),
      scale: [1.2, 0.55, 0.5],
      name: `tailSpot${i}`,
      group: "markings",
    });
  }

  // A subtle floor-safe shadow-colored underside button beneath the tail root.
  b.part(new THREE.SphereGeometry(0.05, 7, 5), CREAM, {
    bone: hips,
    at: [0, 0.115, -0.38],
    scale: [1.4, 0.38, 1.5],
    name: "underside",
    group: "body",
  });

  return b.root;
}
