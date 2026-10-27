```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, rng } from "agentic-3js-builder";
import { cel, furEdge, animeEye, INK as TOON_INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "A brightly painted Oaxacan alebrije: a spotted jaguar body with eagle wings, a proud feline face, hooked beak, feather crest, talons, and a curling ornamental tail.",
};

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  const INK = "#21152b";
  const WOOD = "#d95b2b";
  const WOOD_SHADOW = "#8d2e27";
  const GOLD = "#f2bf38";
  const TURQUOISE = "#20b6a6";
  const BLUE = "#2878c8";
  const VIOLET = "#7046a8";
  const CREAM = "#f6d998";
  const WHITE = "#fff1c2";
  const BLACK = "#171427";
  const RED = "#ef3d45";
  const GREEN = "#69ba4c";

  const coat = cel(WOOD, WOOD_SHADOW);
  const cream = cel(CREAM, "#bd754f");
  const gold = cel(GOLD, "#b96a24");
  const teal = cel(TURQUOISE, "#126a76");
  const blue = cel(BLUE, "#24427e");
  const violet = cel(VIOLET, "#38255f");

  // ---------------------------------------------------------------------------
  // Skeleton: one root, broad feline spine, four planted legs, neck, jaw, tail,
  // and two articulated wings.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", { at: [0, 0.78, -0.08], role: "spine" });

  const spinePath = catmull([
    [0, 0.78, -0.42],
    [0, 0.86, -0.08],
    [0, 0.91, 0.28],
    [0, 0.98, 0.58],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["pelvis", "back", "shoulder", "chest"],
    role: "spine",
  });

  const neckPath = catmull([
    [0, 0.98, 0.58],
    [0, 1.12, 0.72],
    [0, 1.31, 0.80],
    [0, 1.49, 0.82],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.tip,
    names: ["neckBase", "neckMid", "neckTop", "neckTip"],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.56, 0.86],
    dir: [0, 0.08, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.48, 1.02],
    dir: [0, -0.15, 0.9],
    role: "jaw",
    group: "head",
  });

  const tailPath = catmull([
    [0, 0.78, -0.42],
    [0, 0.68, -0.75],
    [0.04, 0.76, -1.12],
    [-0.08, 0.94, -1.42],
    [0.10, 1.12, -1.68],
    [0.22, 1.32, -1.82],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
    role: "tail",
  });

  const legTargets = [
    { s: 1, z: 0.34, n: "frontL" },
    { s: -1, z: 0.34, n: "frontR" },
    { s: 1, z: -0.30, n: "backL" },
    { s: -1, z: -0.30, n: "backR" },
  ];
  const legs: { name: string; chain: any; pts: THREE.Vector3[] }[] = [];
  for (const leg of legTargets) {
    const root = [leg.s * 0.25, 0.88, leg.z] as [number, number, number];
    const foot = [leg.s * 0.38, 0.13, leg.z + (leg.z > 0 ? 0.11 : -0.10)] as [
      number,
      number,
      number,
    ];
    const pts = limb(root, foot, [0.31, 0.27, 0.24], [
      [0, 0, leg.z > 0 ? 1 : -1],
      [0, 0, leg.z > 0 ? -1 : 1],
    ]);
    const chain = b.chain(leg.n, pts, {
      parent: spine.joints[leg.z > 0 ? 2 : 0],
      names: [`hip${leg.s > 0 ? "L" : "R"}${leg.z > 0 ? "F" : "B"}`, `knee${leg.s > 0 ? "L" : "R"}${leg.z > 0 ? "F" : "B"}`, `ankle${leg.s > 0 ? "L" : "R"}${leg.z > 0 ? "F" : "B"}`],
      role: "leg",
      contact: foot,
    });
    legs.push({ name: leg.n, chain, pts });
  }

  const wingRoots = [
    { s: 1, name: "wingL" },
    { s: -1, name: "wingR" },
  ];
  const wings: any[] = [];
  for (const w of wingRoots) {
    const p = [
      [w.s * 0.32, 1.14, 0.40],
      [w.s * 0.62, 1.31, 0.32],
      [w.s * 0.98, 1.52, 0.16],
      [w.s * 1.28, 1.67, -0.04],
      [w.s * 1.54, 1.56, -0.26],
    ] as [number, number, number][];
    const chain = b.chain(w.name, p, {
      parent: spine.joints[2],
      names: [`${w.name}Shoulder`, `${w.name}Arm`, `${w.name}Elbow`, `${w.name}Wrist`, `${w.name}Tip`],
      role: "wing",
    });
    wings.push(chain);
  }

  // ---------------------------------------------------------------------------
  // Main carved wooden body and limbs.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => 0.28 + 0.06 * Math.sin(t * Math.PI), {
    color: coat,
    sides: 8,
    section: "circle",
    name: "paintedJaguarBody",
    sectors: [
      [-62, 62, WOOD],
      [112, 248, CREAM],
    ],
  });

  b.sweep(neck, [0.20, 0.16], {
    color: furEdge(coat, cream, {
      level: -0.15,
      teeth: 0.18,
      period: 0.08,
      ink: INK,
    }),
    sides: 8,
    name: "stripedNeck",
  });

  b.sweep(tail, (t) => 0.17 * (1 - t) + 0.035, {
    color: coat,
    sides: 7,
    caps: "round",
    bands: [
      [0.18, GOLD],
      [0.36, WOOD],
      [0.54, TURQUOISE],
      [0.73, WOOD],
      [0.88, VIOLET],
      [1, GOLD],
    ],
    name: "ornamentalTail",
  });

  for (const leg of legs) {
    b.sweep(leg.chain, (t) => 0.115 - t * 0.035, {
      color: coat,
      sides: 7,
      name: `${leg.name}WoodenLeg`,
    });
    const end = leg.pts[leg.pts.length - 1];
    b.part(new THREE.BoxGeometry(0.22, 0.105, 0.26), INK, {
      at: [end[0], 0.105, end[2] + 0.025],
      bone: leg.chain.tip,
      name: `${leg.name}Paw`,
    });
    for (let i = -1; i <= 1; i++) {
      b.spike(
        [end[0] + i * 0.055, 0.11, end[2] + 0.12],
        [0, 0, 1],
        0.105,
        0.025,
        { color: CREAM, bone: leg.chain.tip, name: `${leg.name}Claw${i}` },
      );
    }
  }

  // Shoulder and hip painted medallions.
  for (const s of [1, -1]) {
    for (const z of [0.38, -0.30]) {
      b.part(new THREE.SphereGeometry(0.145, 8, 5), gold, {
        at: [s * 0.27, 0.91, z],
        bone: spine.joints[z > 0 ? 2 : 0],
        scale: [1, 1, 0.42],
        name: "goldShoulderMedallion",
      });
      b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.018, 8), INK, {
        at: [s * 0.27, 0.91, z + 0.065],
        dir: [0, 0, 1],
        bone: spine.joints[z > 0 ? 2 : 0],
        name: "medallionRing",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Head, feline muzzle, eagle beak, ears, eyes, whiskers, and crest.
  // ---------------------------------------------------------------------------

  const skull = b.part(new THREE.SphereGeometry(0.30, 12, 8), coat, {
    at: [0, 1.57, 0.88],
    bone: head,
    scale: [1.0, 0.88, 1.12],
    name: "carvedJaguarHead",
  });

  const brow = b.part(new THREE.SphereGeometry(0.205, 10, 6), cream, {
    at: [0, 1.48, 1.10],
    bone: head,
    scale: [1.0, 0.62, 0.55],
    name: "creamMuzzle",
  });

  const nose = b.part(new THREE.SphereGeometry(0.105, 8, 5), BLACK, {
    at: [0, 1.48, 1.30],
    bone: jaw,
    scale: [1.25, 0.65, 0.78],
    name: "jaguarNose",
  });

  const upperBeak = b.extrude(
    [
      [0, 0],
      [0.13, 0.03],
      [0.095, -0.13],
      [0.025, -0.19],
      [0, -0.13],
    ],
    {
      at: [0, 1.48, 1.34],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.10,
      bevel: 0.012,
      color: gold,
      bone: head,
      name: "hookedEagleBeak",
    },
  );
  b.part(new THREE.BoxGeometry(0.17, 0.025, 0.08), RED, {
    at: [0, 1.40, 1.38],
    bone: jaw,
    name: "openMouthInterior",
  });
  b.part(new THREE.BoxGeometry(0.13, 0.018, 0.07), CREAM, {
    at: [0, 1.405, 1.43],
    bone: jaw,
    name: "lowerBeak",
  });

  for (const s of [1, -1]) {
    // ears
    b.extrude(
      [
        [0, 0],
        [0.15, 0.02],
        [0.12, 0.20],
        [0.035, 0.28],
        [0, 0.17],
      ],
      {
        at: [s * 0.22, 1.73, 0.80],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.065,
        bevel: 0.012,
        color: violet,
        bone: head,
        name: "purpleJaguarEar",
      },
    );
    b.part(new THREE.SphereGeometry(0.085, 8, 5), CREAM, {
      at: [s * 0.225, 1.77, 0.825],
      bone: head,
      scale: [0.72, 0.72, 0.28],
      name: "earInner",
    });

    // Large inset painted eyes.
    const eye = b.part(new THREE.SphereGeometry(0.072, 10, 6), WHITE, {
      at: [s * 0.125, 1.59, 1.115],
      bone: head,
      scale: [1.0, 1.15, 0.38],
      name: "paintedEye",
    });
    b.part(new THREE.SphereGeometry(0.038, 8, 5), TURQUOISE, {
      at: [s * 0.125, 1.59, 1.153],
      bone: head,
      scale: [1, 1.25, 0.25],
      name: "turquoiseIris",
    });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), BLACK, {
      at: [s * 0.125, 1.59, 1.174],
      bone: head,
      name: "eyePupil",
    });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), WHITE, {
      at: [s * 0.105, 1.615, 1.181],
      bone: head,
      name: "eyeHighlight",
    });

    // Painted cheek rosette and whiskers.
    b.part(new THREE.TorusGeometry(0.065, 0.012, 5, 10), RED, {
      at: [s * 0.235, 1.48, 1.085],
      dir: [0, 0, 1],
      bone: head,
      name: "cheekRosette",
    });
    for (let i = -1; i <= 1; i++) {
      b.rod(
        [s * 0.20, 1.47 + i * 0.035, 1.11],
        [s * 0.43, 1.49 + i * 0.06, 1.18],
        0.008,
        CREAM,
        { bone: head, name: "woodenWhisker" },
      );
    }

    // Crown feather fans.
    const fan = b.ring(
      { at: [s * 0.04, 1.78, 0.78], axis: [0, 1, 0] },
      {
        count: 7,
        radius: 0.075,
        fromDeg: -58,
        toDeg: 58,
        tilt: -18,
        joints: 2,
        parent: head,
        name: `crest${s > 0 ? "L" : "R"}`,
        role: "fan",
      },
    );
    fan.items.forEach((f: any, i: number) => {
      const col = i % 3 === 0 ? TURQUOISE : i % 3 === 1 ? GOLD : RED;
      b.sweep(
        catmull([
          f.at,
          [f.at.x, f.at.y + 0.13 + i * 0.008, f.at.z - 0.02],
          [f.at.x, f.at.y + 0.22, f.at.z - 0.08],
        ]),
        [0.035, 0.006],
        { color: col, caps: "point", name: "crestFeather" },
      );
    });
  }

  // ---------------------------------------------------------------------------
  // Wings: broad turquoise membranes backed by individual blue/gold feathers.
  // ---------------------------------------------------------------------------

  for (let wi = 0; wi < wings.length; wi++) {
    const w = wings[wi];
    const s = wi === 0 ? 1 : -1;
    const edgeA = w;
    const edgeB = catmull([
      [s * 0.34, 1.10, 0.37],
      [s * 0.61, 1.06, 0.05],
      [s * 0.95, 1.10, -0.25],
      [s * 1.30, 1.18, -0.48],
      [s * 1.50, 1.25, -0.58],
    ]);
    b.membrane(edgeA, edgeB, {
      color: teal,
      thickness: 0.018,
      rows: 4,
      cols: 8,
      scallop: 0.12,
      name: "turquoiseWingMembrane",
    });

    for (let i = 0; i < 6; i++) {
      const root = [s * (0.48 + i * 0.15), 1.19 + i * 0.075, 0.20 - i * 0.13] as [
        number,
        number,
        number,
      ];
      const tip = [s * (0.76 + i * 0.17), 1.65 + i * 0.035, -0.02 - i * 0.22] as [
        number,
        number,
        number,
      ];
      b.sweep(
        catmull([root, [s * (0.61 + i * 0.16), 1.43 + i * 0.04, 0.02 - i * 0.16], tip]),
        [0.045, 0.008],
        {
          color: i % 2 ? gold : blue,
          caps: "point",
          sides: 6,
          name: "primaryWingFeather",
        },
      );
      b.part(new THREE.SphereGeometry(0.034, 6, 4), RED, {
        at: root,
        bone: w.joints[Math.min(i, w.joints.length - 1)],
        name: "wingPaintDot",
      });
    }

    // Wing-root rosette.
    b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.035, 10), GOLD, {
      at: [s * 0.38, 1.14, 0.38],
      dir: [s, 0, 0],
      bone: spine.joints[2],
      name: "wingRootRosette",
    });
    b.part(new THREE.TorusGeometry(0.10, 0.015, 5, 12), INK, {
      at: [s * 0.40, 1.14, 0.38],
      dir: [s, 0, 0],
      bone: spine.joints[2],
      name: "wingRootInkRing",
    });
  }

  // ---------------------------------------------------------------------------
  // Jaguar rosettes, stripes, and carved decorative spots.
  // ---------------------------------------------------------------------------

  const bodySurface = b.surface(body);
  const spots = bodySurface.scatter(34, {
    rng: rng(18),
    minDist: 0.105,
    filter: (h: any) => h.n.y > -0.45,
  });
  for (let i = 0; i < spots.length; i++) {
    const h = spots[i];
    const col = i % 4 === 0 ? TURQUOISE : i % 3 === 0 ? GOLD : INK;
    b.stick(new THREE.TorusGeometry(0.045, 0.010, 5, 9), col, h, {
      embed: 0.35,
      name: "carvedJaguarRosette",
    });
    if (i % 3 !== 0) {
      b.stick(new THREE.SphereGeometry(0.010, 5, 3), RED, h.moved([0, 0.012, 0]), {
        embed: 0,
        name: "rosetteCenter",
      });
    }
  }

  const tailMarks = b.along(tail, 9, (at: any) => {
    b.stick(new THREE.TorusGeometry(0.035, 0.009, 5, 8), INK, at, {
      embed: 0.22,
      name: "tailRing",
    });
  });

  // Chest bib and geometric painted stripes.
  b.part(
    new THREE.ConeGeometry(0.24, 0.52, 6),
    cream,
    {
      at: [0, 1.03, 0.78],
      dir: [0, 0, 1],
      bone: spine.tip,
      rotation: [0, 0, 0],
      name: "creamEagleBib",
    },
  );
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.BoxGeometry(0.34 - i * 0.035, 0.018, 0.018), i % 2 ? RED : BLUE, {
      at: [0, 1.07 + i * 0.085, 0.985],
      bone: spine.tip,
      name: "chestPaintStripe",
    });
  }

  // Gold collar with turquoise studs.
  const collar = b.surface(neck);
  const loop = collar.loop(neck.joints[1], { lift: 0.012 });
  b.sweep(loop, 0.025, { color: GOLD, name: "goldNeckCollar" });
  b.along(loop, 10, (at: any) => {
    b.stick(new THREE.SphereGeometry(0.025, 6, 4), TURQUOISE, at, {
      embed: 0.25,
      name: "collarStud",
    });
  });

  // Feet painted soles and toe separators.
  for (const leg of legs) {
    const e = leg.pts[leg.pts.length - 1];
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.BoxGeometry(0.025, 0.018, 0.12), [RED, GOLD, TURQUOISE][i], {
        at: [e[0] + (i - 1) * 0.055, 0.158, e[2] + 0.02],
        bone: leg.chain.tip,
        name: "paintedToeStripe",
      });
    }
  }

  // A few broad wooden quills along the back.
  b.along(spine, 6, (at: any, i: number) => {
    b.spike(at, [0, 0.7, -0.15], 0.13 + i * 0.012, 0.035, {
      color: i % 2 ? RED : GOLD,
      name: "backQuill",
    });
  });

  // Open the jaw slightly for a readable hybrid silhouette.
  b.pose(jaw, { axis: [1, 0, 0], deg: -13 });

  // Ensure the lowest carved pieces meet the floor: feet are centred at y=.105 and claws remain above zero.
  return b.root;
}
```