```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  limb,
  rng,
} from "agentic-3js-builder";
import {
  cel,
  furEdge,
  animeEye,
  INK,
} from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Chibi Axolotl",
  description:
    "A cheerful low-poly chibi axolotl with a soft pink body, huge glossy eyes, a broad paddle tail, tiny feet, and a dramatic crown of frilly pink external gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibi-axolotl", detail: 1 });

  const PINK = cel("#e887a6", "#b84f78");
  const BELLY = cel("#ffd4d7", "#e9a1b0");
  const DARK_PINK = cel("#c9557f", "#8f315c");
  const GILL = cel("#ff94bd", "#d95187");
  const GILL_TIP = cel("#ffc0d7", "#ed6f9e");
  const EYE_DARK = "#24152b";
  const EYE_WHITE = "#fff9f4";
  const MOUTH = "#67213d";
  const AQUA = cel("#8ddbd1", "#4d9f9b");

  // One continuous skeleton: hips/root, head, tail, and four short resting limbs.
  const hips = b.joint("hips", {
    at: [0, 0.39, -0.08],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.39, -0.38],
    [0, 0.42, 0.0],
    [0, 0.45, 0.38],
    [0, 0.47, 0.7],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });

  const head = b.joint("head", {
    parent: hips,
    at: [0, 0.48, 0.48],
    dir: [0, 0.03, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.39, 0.72],
    dir: [0, -0.16, 0.42],
    role: "jaw",
    group: "face",
  });

  const tailPath = catmull([
    [0, 0.38, -0.35],
    [0, 0.32, -0.72],
    [0, 0.25, -1.08],
    [0, 0.18, -1.42],
    [0, 0.1, -1.7],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    count: 5,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
  });

  const bodyCoat = furEdge(PINK, BELLY, {
    level: -0.2,
    teeth: 0.14,
    period: 0.055,
    along: [0, 0, 1],
    ink: "#7b3154",
    inkWidth: 0.025,
  });

  const body = b.sweep(
    catmull([
      [0, 0.39, -0.45],
      [0, 0.43, -0.05],
      [0, 0.46, 0.3],
      [0, 0.49, 0.62],
    ]),
    (t) => 0.27 - t * 0.035,
    {
      bone: [hips, spine],
      color: bodyCoat,
      sides: 8,
      section: "circle",
      group: "body",
    },
  );

  b.sweep(tail, (t) => 0.19 * (1 - t) + 0.018, {
    color: furEdge(PINK, BELLY, {
      level: -0.15,
      teeth: 0.1,
      period: 0.06,
      along: [0, 0, -1],
    }),
    sides: 7,
    group: "tail",
  });

  // Oversized rounded head and pale lower cheek/belly.
  const skull = b.part(
    new THREE.SphereGeometry(0.34, 12, 8),
    bodyCoat,
    {
      bone: head,
      at: [0, 0.5, 0.54],
      scale: [1.08, 0.92, 1.03],
      flat: true,
      group: "head",
      name: "roundedSkull",
    },
  );

  b.part(
    new THREE.SphereGeometry(0.22, 10, 7),
    BELLY,
    {
      bone: head,
      at: [0, 0.405, 0.74],
      scale: [1.05, 0.52, 0.7],
      group: "face",
      name: "muzzle",
    },
  );

  // Large shiny eyes, deliberately close together and facing +Z.
  const eyeTexture = animeEye({
    iris: "#4dc6bd",
    irisLight: "#b8fff0",
    irisDark: "#1b706f",
    blush: "#f28fae",
    size: 256,
  });

  for (const side of [-1, 1]) {
    const x = side * 0.145;
    b.part(
      new THREE.SphereGeometry(0.105, 10, 7),
      EYE_DARK,
      {
        bone: head,
        at: [x, 0.585, 0.79],
        scale: [1, 1.08, 0.42],
        group: "face",
        name: side < 0 ? "eyeR" : "eyeL",
      },
    );
    b.part(
      new THREE.SphereGeometry(0.074, 10, 7),
      eyeTexture ? "#ffffff" : EYE_WHITE,
      {
        bone: head,
        at: [x, 0.59, 0.815],
        scale: [1, 1.12, 0.18],
        dir: [0, 0, 1],
        texture: eyeTexture,
        group: "face",
        name: side < 0 ? "irisR" : "irisL",
      },
    );
  }

  // Tiny nostrils and a happy open mouth.
  for (const side of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(0.018, 6, 4),
      MOUTH,
      {
        bone: head,
        at: [side * 0.052, 0.47, 0.918],
        scale: [1, 0.7, 0.45],
        group: "face",
        name: side < 0 ? "nostrilR" : "nostrilL",
      },
    );
  }

  b.sweep(
    bezier(
      [-0.105, 0.405, 0.895],
      [-0.05, 0.355, 0.94],
      [0.05, 0.355, 0.94],
      [0.105, 0.405, 0.895],
    ),
    0.018,
    {
      bone: jaw,
      color: MOUTH,
      sides: 6,
      caps: "round",
      group: "face",
      name: "smilingMouth",
    },
  );

  // Four squat legs, extended slightly outward in a neutral amphibian rest pose.
  const legTargets = [
    { side: 1, z: 0.22, name: "legFL" },
    { side: -1, z: 0.22, name: "legFR" },
    { side: 1, z: -0.28, name: "legHL" },
    { side: -1, z: -0.28, name: "legHR" },
  ];

  for (const item of legTargets) {
    const s = item.side;
    const root: [number, number, number] = [s * 0.19, 0.39, item.z];
    const foot: [number, number, number] = [s * 0.32, 0.105, item.z + (item.z > 0 ? 0.1 : -0.08)];
    const pts = limb(root, foot, [0.18, 0.16], [
      [s * 0.5, 0, item.z > 0 ? 1 : -1],
    ]);
    const chain = b.chain(item.name, pts, {
      parent: hips,
      names: [`${item.name}Upper`, `${item.name}Lower`, `${item.name}Foot`],
      role: "leg",
      contact: foot,
    });
    b.sweep(chain, [0.075, 0.045], {
      color: PINK,
      sides: 6,
      section: "circle",
      group: "legs",
    });

    // Broad little paddle foot with three visible toes.
    b.part(
      new THREE.SphereGeometry(0.075, 8, 5),
      PINK,
      {
        bone: chain.tip,
        at: foot,
        scale: [1.25, 0.55, 1.35],
        group: "feet",
        name: `${item.name}Paw`,
      },
    );
    for (let toe = -1; toe <= 1; toe++) {
      const toeStart: [number, number, number] = [
        s * (0.32 + toe * 0.035),
        0.09,
        foot[2] + toe * 0.035,
      ];
      const toeEnd: [number, number, number] = [
        s * (0.37 + toe * 0.04),
        0.055,
        foot[2] + toe * 0.05 + (item.z > 0 ? 0.025 : -0.025),
      ];
      b.sweep([toeStart, toeEnd], [0.018, 0.006], {
        bone: chain.tip,
        color: BELLY,
        sides: 5,
        caps: "round",
        group: "digits",
        name: `${item.name}Toe${toe + 2}`,
      });
    }
  }

  // External gills: three branching, tapering fronds per side, rooted behind the head.
  // The stems are intentionally prominent so the animal reads instantly as an axolotl.
  for (const side of [-1, 1]) {
    const s = side;
    const root: [number, number, number] = [s * 0.255, 0.54, 0.53];

    const gillRoot = b.joint(`gill${s > 0 ? "L" : "R"}`, {
      parent: head,
      at: root,
      dir: [s * 0.35, 0.12, -0.12],
      role: "fan",
      group: "gills",
    });

    const fans = [
      { dy: 0.18, dz: 0.04, bend: 0.12, name: "upper" },
      { dy: 0.03, dz: 0.01, bend: 0.18, name: "middle" },
      { dy: -0.13, dz: -0.03, bend: 0.1, name: "lower" },
    ];

    for (const f of fans) {
      const tip: [number, number, number] = [
        s * (0.47 + f.bend * 0.22),
        0.54 + f.dy,
        0.53 + f.dz,
      ];
      const path = bezier(
        root,
        [s * 0.39, 0.54 + f.dy * 0.25, 0.54],
        [s * 0.47, 0.54 + f.dy * 0.72, 0.48],
        tip,
      );
      const frill = b.sweep(path, [0.038, 0.008], {
        bone: gillRoot,
        color: GILL,
        sides: 6,
        caps: { start: "round", end: "point" },
        group: "gills",
        name: `gill${s > 0 ? "L" : "R"}_${f.name}`,
      });

      // Paired short barbs give each smooth stem a recognizable frilly silhouette.
      for (let i = 1; i <= 3; i++) {
        const t = i / 4;
        const base = frill.at(t);
        const outward: [number, number, number] = [
          s * (0.07 + 0.018 * i),
          i % 2 ? 0.065 : -0.055,
          -0.015,
        ];
        const barbTip: [number, number, number] = [
          base.at.x + outward[0],
          base.at.y + outward[1],
          base.at.z + outward[2],
        ];
        b.sweep(
          bezier(
            base,
            [barbTip[0] * 0.99, barbTip[1], barbTip[2]],
            [barbTip[0], barbTip[1], barbTip[2]],
            barbTip,
          ),
          [0.022, 0.003],
          {
            bone: gillRoot,
            color: GILL_TIP,
            sides: 5,
            caps: { start: "round", end: "point" },
            group: "gill-frills",
            name: `gill${s > 0 ? "L" : "R"}_${f.name}_frill${i}`,
          },
        );
      }
    }

    // A small dark red gill root makes the pink fans feel attached rather than floating.
    b.part(
      new THREE.SphereGeometry(0.07, 8, 5),
      DARK_PINK,
      {
        bone: gillRoot,
        at: root,
        scale: [1, 1.2, 0.7],
        group: "gills",
        name: `gillRoot${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // Subtle turquoise spots along the tail, like stylized axolotl markings.
  const spotRng = rng(42);
  for (let i = 0; i < 7; i++) {
    const t = 0.16 + i * 0.105;
    const p = tail.at(t).at;
    b.part(
      new THREE.SphereGeometry(0.018 + spotRng() * 0.012, 6, 4),
      AQUA,
      {
        bone: tail.at(t).bone,
        at: [p.x + (spotRng() - 0.5) * 0.12, p.y + 0.11, p.z],
        group: "markings",
        name: `tailSpot${i}`,
      },
    );
  }

  return b.root;
}
```