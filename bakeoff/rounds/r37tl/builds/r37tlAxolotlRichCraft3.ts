import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  frame,
  line,
  limb,
  rng,
  svg,
  paint,
} from "../../../../src/index";
import { cel, animeEye, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "chibi axolotl",
  description:
    "A friendly low-poly chibi axolotl with a chunky turquoise body, huge glossy eyes, a broad smiling mouth, four tiny legs, a tapering tail, and three pairs of spectacular frilly pink external gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibi-axolotl", detail: 1 });

  const BODY = cel("#8edbd0", "#4a9f9b");
  const BODY_LIGHT = cel("#b9eee1", "#75c9bf");
  const BELLY = cel("#f8d9d2", "#d99da5");
  const PINK = cel("#ff83a9", "#c94e78");
  const PINK_LIGHT = cel("#ffb4c9", "#ed6f9b");
  const DARK_PINK = cel("#a93663", "#6e2348");
  const INK_PAINTER = cel(INK, "#120b1b");
  const TOE = cel("#f5a8b5", "#b75d78");

  const H = 1.0;
  const hips = b.joint("hips", {
    at: [0, 0.43, -0.18],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.43, -0.52],
    [0, 0.45, -0.2],
    [0, 0.46, 0.12],
    [0, 0.48, 0.34],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "chest"],
    role: "spine",
  });

  const tailPath = catmull([
    [0, 0.42, -0.42],
    [0, 0.39, -0.7],
    [0, 0.34, -0.98],
    [0, 0.28, -1.26],
    [0.02, 0.22, -1.48],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
  });

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 0.56, 0.43],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.47, 0.62],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "face",
  });

  const body = b.sweep(
    spinePath,
    (t) => 0.18 + 0.055 * Math.sin(Math.PI * t),
    {
      bone: [hips, ...spine.joints],
      color: furEdge(BODY, BELLY, {
        level: -0.16,
        teeth: 0.12,
        period: 0.065,
        ink: "#397d7d",
        inkWidth: 0.018,
      }),
      section: { ngon: 8 },
      caps: "round",
      name: "soft chunky body",
      group: "body",
    },
  );

  b.sweep(tail, (t) => 0.13 * (1 - t) + 0.018, {
    color: furEdge(BODY, BELLY, {
      level: -0.08,
      teeth: 0.08,
      period: 0.055,
      ink: "#397d7d",
      inkWidth: 0.012,
    }),
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    name: "tapered tail",
    group: "tail",
  });

  const skull = b.part(
    new THREE.SphereGeometry(1, 14, 10),
    BODY_LIGHT,
    {
      bone: head,
      at: [0, 0.58, 0.48],
      scale: [0.34, 0.28, 0.31],
      name: "big rounded head",
      group: "head",
    },
  );
  const muzzle = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    BELLY,
    {
      bone: head,
      at: [0, 0.49, 0.69],
      scale: [0.235, 0.135, 0.13],
      name: "pale muzzle",
      group: "face",
    },
  );

  const lowerJaw = b.part(
    new THREE.SphereGeometry(1, 10, 6),
    BELLY,
    {
      bone: jaw,
      at: [0, 0.445, 0.72],
      scale: [0.205, 0.065, 0.115],
      name: "lower jaw",
      group: "jaw",
    },
  );

  const mouthLine = b.sweep(
    bezier(
      [-0.18, 0.485, 0.785],
      [-0.08, 0.45, 0.805],
      [0.08, 0.45, 0.805],
      [0.18, 0.485, 0.785],
    ),
    0.012,
    { bone: jaw, color: INK, caps: "round", name: "smiling mouth", group: "face" },
  );

  const nostrilGeo = new THREE.SphereGeometry(0.018, 6, 4);
  for (const s of [-1, 1]) {
    b.part(nostrilGeo, INK, {
      bone: head,
      at: [s * 0.075, 0.555, 0.805],
      name: `nostril${s > 0 ? "L" : "R"}`,
      group: "face",
    });
  }

  const eyeTexture = animeEye({
    iris: "#4e9ee9",
    irisLight: "#bcecff",
    blush: "#f48eae",
    size: 256,
  });
  const headSurface = b.surface(skull);
  for (const s of [-1, 1]) {
    const hit = headSurface.around([0, 0.58, 0.48]).at(s * 33, 8);
    if (hit) {
      b.decal(headSurface, eyeTexture, {
        at: hit,
        size: [0.135, 0.18],
        lift: 0.006,
        mirror: s > 0,
        name: `huge glossy eye ${s > 0 ? "L" : "R"}`,
        group: "face",
      });
    }
  }

  const blush = new THREE.SphereGeometry(0.045, 8, 5);
  for (const s of [-1, 1]) {
    b.part(blush, "#f58fa8", {
      bone: head,
      at: [s * 0.205, 0.49, 0.73],
      scale: [1.2, 0.55, 0.25],
      name: `cheek blush ${s}`,
      group: "face",
    });
  }

  function makeLeg(
    side: number,
    front: boolean,
    name: string,
  ) {
    const x = side * 0.19;
    const z = front ? 0.21 : -0.25;
    const target: [number, number, number] = [
      side * 0.29,
      0.075,
      z + (front ? 0.06 : -0.055),
    ];
    const root: [number, number, number] = [x * 0.86, 0.38, z];
    const pts = limb(root, target, [0.16, 0.15], [[0, 0, front ? 1 : -1]], {
      sole: [0, 0, 1],
    });
    const chain = b.chain(name, pts, {
      parent: hips,
      names: [`hip${name}`, `knee${name}`, `ankle${name}`],
      role: "leg",
      contact: target,
    });
    b.sweep(chain, (t) => 0.065 - 0.018 * t, {
      color: BODY,
      section: { ngon: 6 },
      caps: "round",
      name: `${name} chunky limb`,
      group: "legs",
    });

    const foot = chain.tip;
    b.part(
      new THREE.SphereGeometry(1, 8, 5),
      BELLY,
      {
        bone: foot,
        at: target,
        scale: [0.105, 0.055, 0.12],
        name: `${name} soft foot`,
        group: "legs",
      },
    );

    for (let i = 0; i < 3; i++) {
      const tx = side * (0.24 + i * 0.045);
      const tz = target[2] + 0.065 - i * 0.018;
      b.sweep(
        catmull([
          [tx, 0.075, tz],
          [tx + side * 0.025, 0.06, tz + 0.035],
          [tx + side * 0.045, 0.052, tz + 0.05],
        ]),
        [0.018, 0.004],
        {
          bone: foot,
          color: TOE,
          section: { ngon: 5 },
          caps: { start: "round", end: "point" },
          name: `${name} toe${i}`,
          group: "digits",
        },
      );
    }
  }

  makeLeg(1, true, "frontL");
  makeLeg(-1, true, "frontR");
  makeLeg(1, false, "hindL");
  makeLeg(-1, false, "hindR");

  const gillTexture = svg(
    `<svg viewBox="0 0 80 160" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 154 C36 125 39 93 39 65 C40 35 32 17 15 7
               M39 93 C25 88 12 77 5 62
               M39 73 C52 63 66 49 75 31
               M39 52 C28 42 22 29 20 14
               M40 119 C53 108 65 94 71 78"
        fill="none" stroke="#ffb2c8" stroke-width="9"
        stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M40 153 C37 121 39 91 39 63" fill="none"
        stroke="#a83b68" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );

  function makeGill(side: number, index: number) {
    const z = 0.29 + index * 0.085;
    const y = 0.67 + index * 0.012;
    const root: [number, number, number] = [side * 0.255, y, z];
    const tip: [number, number, number] = [
      side * (0.42 + index * 0.025),
      0.75 + index * 0.035,
      z + 0.035,
    ];
    const path = catmull([
      root,
      [side * 0.31, y + 0.02, z + 0.015],
      [side * 0.37, y + 0.055, z + 0.025],
      tip,
    ]);
    const gill = b.chain(`gill${side > 0 ? "L" : "R"}${index + 1}`, path, {
      parent: head,
      names: [
        `gill${side > 0 ? "L" : "R"}${index + 1}_base`,
        `gill${side > 0 ? "L" : "R"}${index + 1}_mid`,
        `gill${side > 0 ? "L" : "R"}${index + 1}_tip`,
      ],
      role: "fan",
      group: "gills",
    });
    const tube = b.sweep(gill, [0.032, 0.012], {
      color: DARK_PINK,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      name: `gill ${side > 0 ? "left" : "right"} ${index + 1} stalk`,
      group: "gills",
    });

    const branchA = b.sweep(
      bezier(
        gill.at(0.42).at,
        [side * 0.35, y + 0.11, z - 0.01],
        [side * 0.43, y + 0.16, z - 0.02],
        [side * 0.48, y + 0.17, z - 0.035],
      ),
      [0.014, 0.003],
      {
        bone: gill.joints[1],
        color: PINK_LIGHT,
        caps: { start: "round", end: "point" },
        name: `gill ${index + 1} upper frond`,
        group: "gills",
      },
    );
    const branchB = b.sweep(
      bezier(
        gill.at(0.62).at,
        [side * 0.37, y - 0.01, z + 0.08],
        [side * 0.43, y - 0.02, z + 0.12],
        [side * 0.48, y + 0.015, z + 0.15],
      ),
      [0.013, 0.002],
      {
        bone: gill.joints[1],
        color: PINK_LIGHT,
        caps: { start: "round", end: "point" },
        name: `gill ${index + 1} lower frond`,
        group: "gills",
      },
    );

    const frames = [];
    for (let j = 0; j < 5; j++) {
      const t = 0.1 + j * 0.2;
      const p = tube.at(t, side > 0 ? 90 : -90, 0.006);
      frames.push(p);
    }
    b.cards(frames, gillTexture, {
      size: [0.105, 0.24],
      lean: 22,
      bend: 18,
      vary: 0.12,
      mirror: side < 0,
      color: PINK_LIGHT,
      rng: rng(100 + side * 10 + index),
      name: `ruffled gill fan ${side}-${index}`,
      group: "gills",
    });
  }

  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) makeGill(side, i);
  }

  // Small dorsal fin-like tail fringe, kept broad and simple like a puppet.
  const dorsal = b.extrude(
    [
      [0, 0],
      [0.075, 0.08],
      [0.12, 0.22],
      [0.08, 0.32],
      [0, 0.38],
      [-0.08, 0.32],
      [-0.12, 0.22],
      [-0.075, 0.08],
    ],
    {
      at: [-0.002, 0.47, -0.48],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.018,
      bevel: 0.006,
      color: PINK,
      bone: tail.joints[0],
      name: "tiny dorsal tail fin",
      group: "tail",
    },
  );

  // A few pale freckles make the otherwise simple body feel tactile.
  const freckles = new THREE.SphereGeometry(0.012, 5, 4);
  const spots: [number, number, number][] = [
    [-0.12, 0.62, 0.71],
    [0.12, 0.63, 0.72],
    [-0.17, 0.53, 0.79],
    [0.17, 0.53, 0.79],
    [-0.22, 0.44, 0.34],
    [0.22, 0.44, 0.34],
  ];
  for (let i = 0; i < spots.length; i++) {
    b.part(freckles, "#ffffff", {
      bone: head,
      at: spots[i],
      scale: [1.5, 0.7, 0.45],
      name: `face freckle ${i}`,
      group: "face",
    });
  }

  return b.root;
}
