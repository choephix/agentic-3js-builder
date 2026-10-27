import * as THREE from "three";
import { createBuilder, catmull, limb, rng } from "../../../../src/index";

export const meta = {
  name: "Chibi Axolotl",
  description: "A cheerful, chunky axolotl with a pale pink body, enormous eyes, a waving tail, and layered frilly pink external gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibi-axolotl", detail: 1 });

  const BODY = "#f3a5b6";
  const BODY_LIGHT = "#ffd0d8";
  const BODY_SHADOW = "#c76583";
  const GILL = "#ff668f";
  const GILL_LIGHT = "#ff9eb4";
  const GILL_DARK = "#c33f68";
  const BELLY = "#ffe4df";
  const INK = "#351a32";
  const EYE_WHITE = "#fff9f1";
  const IRIS = "#8d4b83";
  const IRIS_LIGHT = "#d98bb1";
  const BRANCH = "#e45b84";
  const FOOT = "#e789a3";
  const SPOT = "#d86d90";
  const FIN = "#f08baa";
  const TEETH = "#fff6df";

  const sphere = (
    color: string,
    at: [number, number, number],
    scale: [number, number, number],
    bone?: any,
    seg = 10,
    rings = 7,
  ) =>
    b.part(new THREE.SphereGeometry(1, seg, rings), color, {
      at,
      scale,
      bone,
      flat: true,
    });

  const box = (
    color: string,
    at: [number, number, number],
    scale: [number, number, number],
    bone?: any,
  ) =>
    b.part(new THREE.BoxGeometry(scale[0], scale[1], scale[2]), color, {
      at,
      bone,
      flat: true,
    });

  const cone = (
    color: string,
    at: [number, number, number],
    radius: number,
    height: number,
    bone?: any,
  ) =>
    b.part(new THREE.ConeGeometry(radius, height, 7), color, {
      at,
      bone,
      flat: true,
    });

  // ---------------------------------------------------------------------------------------------
  // Skeleton first: a broad torso, a tapering tail, a head, an opening jaw, four resting legs,
  // and six articulated gill roots.
  // ---------------------------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.42, -0.28],
    dir: [0, 0, 1],
    role: "spine",
  });

  const torsoPath = catmull([
    [0, 0.42, -0.28],
    [0, 0.45, -0.02],
    [0, 0.51, 0.23],
    [0, 0.58, 0.36],
  ]);

  const torso = b.chain("torso", torsoPath, {
    parent: hips,
    names: ["spine1", "spine2", "neckBase", "neckTip"],
    role: "spine",
    count: 4,
  });

  const tailPath = catmull([
    [0, 0.42, -0.28],
    [0, 0.41, -0.56],
    [0, 0.40, -0.84],
    [0, 0.39, -1.12],
    [0, 0.38, -1.34],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail",
    count: 4,
  });

  const head = b.joint("head", {
    parent: torso.tip,
    at: [0, 0.63, 0.39],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.56, 0.48],
    dir: [0, -0.14, 1],
    role: "jaw",
    group: "face",
  });

  const legTargets: Record<string, [number, number, number]> = {
    legL: [0.29, 0.105, 0.18],
    legR: [-0.29, 0.105, 0.18],
    hindL: [0.30, 0.105, -0.42],
    hindR: [-0.30, 0.105, -0.42],
  };

  const legRoots: Record<string, [number, number, number]> = {
    legL: [0.19, 0.42, 0.20],
    legR: [-0.19, 0.42, 0.20],
    hindL: [0.20, 0.40, -0.28],
    hindR: [-0.20, 0.40, -0.28],
  };

  const legChains: Record<string, any> = {};
  for (const [key, target] of Object.entries(legTargets)) {
    const root = legRoots[key];
    const points = limb(
      root,
      target,
      [0.18, 0.16, 0.12],
      [[key.includes("L") ? 0.8 : -0.8, 0, 0.6], [key.includes("L") ? 0.7 : -0.7, 0, -0.8]],
      { sole: [0, 1, 0] },
    );

    legChains[key] = b.chain(key, points, {
      parent: hips,
      names: [
        key === "legL" ? "shoulderL" : key === "legR" ? "shoulderR" : key === "hindHipL" ? "hindHipL" : "hindHipR",
        key === "legL" ? "elbowL" : key === "legR" ? "elbowR" : key === "hindL" ? "kneeL" : "kneeR",
        key === "legL" ? "wristL" : key === "legR" ? "wristR" : key === "hindL" ? "ankleL" : "ankleR",
        key === "legL" ? "handL" : key === "legR" ? "handR" : key === "hindL" ? "footL" : "footR",
      ],
      role: "leg",
      contact: target,
    });
  }

  const gillRoots: any[] = [];
  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";
    for (let i = 0; i < 3; i++) {
      const gill = b.joint(`gill${sideName}${i + 1}`, {
        parent: head,
        at: [side * (0.245 + i * 0.018), 0.71 + (i - 1) * 0.045, 0.22 - i * 0.025],
        dir: [side, 0.08 + i * 0.05, -0.25],
        role: "fan",
        group: "gills",
      });
      gillRoots.push({ side, i, joint: gill });
    }
  }

  // ---------------------------------------------------------------------------------------------
  // Main silhouette: soft low-poly torso, tapering tail, belly patch, and a huge rounded head.
  // ---------------------------------------------------------------------------------------------

  b.sweep(torso, (t: number) => 0.245 - t * 0.045, {
    color: BODY,
    sides: 8,
    flat: true,
  });

  b.sweep(tail, (t: number) => 0.17 * (1 - t) + 0.018, {
    color: BODY_SHADOW,
    sides: 7,
    flat: true,
    caps: "round",
  });

  b.part(
    new THREE.SphereGeometry(1, 14, 10),
    BODY_LIGHT,
    {
      bone: head,
      at: [0, 0.66, 0.39],
      scale: [0.36, 0.30, 0.34],
      flat: true,
      name: "big-rounded-head",
    },
  );

  // Pale lower belly, deliberately broad and toy-like.
  b.part(
    new THREE.SphereGeometry(1, 12, 8),
    BELLY,
    {
      bone: hips,
      at: [0, 0.405, 0.03],
      scale: [0.20, 0.16, 0.34],
      flat: true,
      name: "soft-belly",
    },
  );

  // Vertical tail fin, a single graphic primitive behind the body.
  b.extrude(
    [
      [-0.42, 0.02],
      [-0.27, 0.11],
      [-0.15, 0.32],
      [0.00, 0.48, "sharp"],
      [0.16, 0.32],
      [0.28, 0.12],
      [0.42, 0.02],
      [0.18, -0.01],
      [-0.18, -0.01],
    ],
    {
      at: [0, 0.38, -1.05],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.004,
      smoothing: 1,
      color: FIN,
      bone: tail.joints[2],
      name: "single-tail-fin",
      group: "tail",
    },
  );

  // Small dorsal finlets echo the large tail shape.
  for (const z of [-0.66, -0.84]) {
    b.extrude(
      [
        [-0.12, 0],
        [0, 0.13],
        [0.12, 0],
        [0.07, -0.015],
        [-0.07, -0.015],
      ],
      {
        at: [0, 0.57, z],
        x: [1, 0, 0],
        y: [0, 0, -1],
        thickness: 0.012,
        color: GILL_LIGHT,
        bone: tail.joints[1],
        name: `dorsal-fin-${z}`,
        group: "fins",
      },
    );
  }

  // ---------------------------------------------------------------------------------------------
  // Face: giant expressive eyes, pupils, highlights, tiny brow plates, nostrils, and a separate
  // lower jaw that reads clearly as an animated hinge.
  // ---------------------------------------------------------------------------------------------

  for (const side of [1, -1]) {
    const eyeX = side * 0.135;

    sphere(EYE_WHITE, [eyeX, 0.73, 0.665], [0.105, 0.115, 0.070], head, 12, 8);
    sphere(INK, [eyeX, 0.735, 0.724], [0.057, 0.070, 0.022], head, 10, 6);
    sphere(IRIS, [eyeX, 0.738, 0.735], [0.034, 0.044, 0.010], head, 9, 5);
    sphere("#ffffff", [eyeX - side * 0.018, 0.768, 0.748], [0.014, 0.018, 0.008], head, 7, 5);
    sphere("#ffffff", [eyeX + side * 0.023, 0.718, 0.748], [0.007, 0.009, 0.006], head, 6, 4);

    // Soft upper eyelid / brow wedge.
    b.part(
      new THREE.SphereGeometry(1, 8, 5),
      BODY_SHADOW,
      {
        bone: head,
        at: [eyeX, 0.826, 0.675],
        scale: [0.115, 0.025, 0.032],
        flat: true,
        name: `eyelid-${side}`,
      },
    );

    // Two tiny nostril beads on the very front of the snout.
    sphere(INK, [side * 0.045, 0.665, 0.715], [0.014, 0.010, 0.008], head, 7, 5);
  }

  // Upper lip and open lower jaw.
  b.rod([0, 0.585, 0.704], [0.13, 0.582, 0.713], 0.014, INK, {
    bone: head,
    caps: "round",
    name: "smile-right",
  });
  b.rod([0, 0.585, 0.704], [-0.13, 0.582, 0.713], 0.014, INK, {
    bone: head,
    caps: "round",
    name: "smile-left",
  });

  b.part(
    new THREE.SphereGeometry(1, 10, 6),
    BODY,
    {
      bone: jaw,
      at: [0, 0.555, 0.61],
      scale: [0.225, 0.075, 0.16],
      flat: true,
      name: "lower-jaw",
      group: "face",
    },
  );

  b.rod([0, 0.585, 0.708], [0, 0.555, 0.735], 0.012, INK, {
    bone: jaw,
    caps: "round",
    name: "lower-mouth-line",
  });

  // A row of tiny rounded teeth makes the open mouth playful, not threatening.
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      cone(
        TEETH,
        [side * (0.035 + i * 0.034), 0.57, 0.712],
        0.012,
        0.027,
        jaw,
      );
    }
  }

  // Blush patches emphasize the chibi face.
  sphere("#ef88a3", [0.205, 0.62, 0.675], [0.055, 0.025, 0.018], head, 8, 5);
  sphere("#ef88a3", [-0.205, 0.62, 0.675], [0.055, 0.025, 0.018], head, 8, 5);

  // ---------------------------------------------------------------------------------------------
  // Four chunky limbs. Each has a rounded upper segment, a bent forearm/shin, a broad palm, and
  // three little splayed toes. The target contacts are just above the floor.
  // ---------------------------------------------------------------------------------------------

  const limbData = [
    { key: "legL", side: 1, front: true },
    { key: "legR", side: -1, front: true },
    { key: "hindL", side: 1, front: false },
    { key: "hindR", side: -1, front: false },
  ];

  for (const item of limbData) {
    const chain = legChains[item.key];
    const s = item.side;
    const front = item.front;
    const p0 = chain.at(0).at;
    const p1 = chain.at(0.48).at;
    const p2 = chain.at(0.78).at;
    const p3 = chain.at(1).at;

    b.sweep(chain, front ? 0.060 : 0.072, {
      color: BODY,
      sides: 7,
      flat: true,
      caps: "round",
    });

    sphere(FOOT, [p3.x, 0.105, p3.z], [0.105, 0.060, 0.095], chain.tip, 9, 6);

    // Three toes radiate toward the front, each ending in a small rounded claw-pad.
    for (let toe = -1; toe <= 1; toe++) {
      const toeStart: [number, number, number] = [
        p3.x + toe * 0.034,
        0.092,
        p3.z + 0.018,
      ];
      const toeEnd: [number, number, number] = [
        p3.x + toe * 0.060 + s * 0.012,
        0.065,
        p3.z + 0.105 + (front ? 0.012 : -0.010),
      ];
      b.capsule(toeStart, toeEnd, 0.019, {
        color: FOOT,
        bone: chain.tip,
        sides: 6,
        name: `${item.key}-toe-${toe}`,
      });
      sphere("#f7b4c0", toeEnd, [0.022, 0.016, 0.027], chain.tip, 7, 5);
    }

    // One rearward little toe gives the feet an unmistakable salamander silhouette.
    const rearToe: [number, number, number] = [
      p3.x + s * 0.065,
      0.065,
      p3.z - 0.065,
    ];
    b.capsule(
      [p3.x + s * 0.035, 0.09, p3.z - 0.015],
      rearToe,
      0.016,
      { color: FOOT, bone: chain.tip, sides: 6, name: `${item.key}-rear-toe` },
    );
  }

  // ---------------------------------------------------------------------------------------------
  // Frilly external gills: six thick pink stalks and a dense set of tapered side filaments.
  // Each filament is its own low-poly sweep, so the silhouette stays readable at a distance.
  // ---------------------------------------------------------------------------------------------

  for (const g of gillRoots) {
    const s = g.side;
    const i = g.i;
    const root = g.joint.at;
    const zDrift = -0.03 - i * 0.045;
    const yDrift = (i - 1) * 0.06;

    const branch = catmull([
      [root.x, root.y, root.z],
      [s * (0.31 + i * 0.035), root.y + yDrift + 0.015, root.z - 0.025],
      [s * (0.39 + i * 0.035), root.y + yDrift + 0.075, root.z + zDrift],
      [s * (0.47 + i * 0.025), root.y + yDrift + 0.12, root.z - 0.07 - i * 0.025],
    ]);

    b.sweep(branch, (t: number) => 0.026 * (1 - t) + 0.009, {
      color: GILL_DARK,
      bone: g.joint,
      sides: 6,
      flat: true,
      caps: "round",
      name: `gill-stalk-${s}-${i}`,
      group: "gills",
    });

    const filamentCount = 5;
    for (let k = 0; k < filamentCount; k++) {
      const t = 0.18 + k * 0.15;
      const at = branch.at(t);
      const tangent = branch.tangentAt(t);
      const up = k % 2 === 0 ? 1 : -1;
      const end: [number, number, number] = [
        at.x + s * (0.045 + 0.012 * k),
        at.y + up * (0.045 + 0.014 * (k % 3)) + 0.015,
        at.z - 0.015 - 0.018 * k,
      ];

      b.spike(
        at,
        end,
        null,
        0.010,
        {
          color: k % 2 === 0 ? GILL_LIGHT : GILL,
          bone: g.joint,
          sides: 5,
          name: `gill-frill-${s}-${i}-${k}`,
          group: "gills",
        },
      );

      // A tiny bead at every second frill tip gives the branches a coral-like rhythm.
      if (k === 1 || k === 3) {
        sphere(GILL_LIGHT, end, [0.014, 0.014, 0.014], g.joint, 6, 4);
      }
    }
  }

  // Gill bases are plump, rounded pink pads peeking from behind the skull.
  for (const side of [1, -1]) {
    sphere(GILL, [side * 0.285, 0.695, 0.235], [0.075, 0.10, 0.055], head, 9, 6);
    sphere(GILL_LIGHT, [side * 0.315, 0.745, 0.225], [0.034, 0.055, 0.025], head, 7, 5);
  }

  // ---------------------------------------------------------------------------------------------
  // Small surface accents: freckles, dorsal dots, cheek dots, and a few pale spots along the tail.
  // ---------------------------------------------------------------------------------------------

  const freckles: Array<[number, number, number, number]> = [
    [0.09, 0.79, 0.63, 0.018],
    [-0.09, 0.79, 0.63, 0.018],
    [0.16, 0.69, 0.58, 0.013],
    [-0.16, 0.69, 0.58, 0.013],
    [0.24, 0.53, 0.44, 0.014],
    [-0.24, 0.53, 0.44, 0.014],
    [0.17, 0.53, 0.26, 0.012],
    [-0.17, 0.53, 0.26, 0.012],
  ];

  for (let i = 0; i < freckles.length; i++) {
    const [x, y, z, r] = freckles[i];
    sphere(SPOT, [x, y, z], [r, r * 0.7, r * 0.45], i < 4 ? head : torso.joints[1], 7, 4);
  }

  const tailSpots: Array<[number, number, number, number]> = [
    [0.09, 0.53, -0.55, 0.025],
    [-0.10, 0.51, -0.62, 0.021],
    [0.07, 0.49, -0.78, 0.018],
    [-0.06, 0.47, -0.91, 0.015],
    [0.04, 0.45, -1.06, 0.012],
  ];

  for (let i = 0; i < tailSpots.length; i++) {
    const [x, y, z, r] = tailSpots[i];
    sphere("#f8bdc7", [x, y, z], [r, r * 0.65, r * 0.5], tail.joints[Math.min(i, 2)], 7, 4);
  }

  // A small heart-shaped-looking chest patch made from three overlapping primitive pieces.
  sphere(BELLY, [0, 0.55, 0.50], [0.13, 0.10, 0.035], head, 8, 5);
  sphere(BELLY, [0.075, 0.57, 0.515], [0.075, 0.06, 0.026], head, 8, 5);
  sphere(BELLY, [-0.075, 0.57, 0.515], [0.075, 0.06, 0.026], head, 8, 5);

  // A few soft dorsal bumps finish the toy-puppet feel without adding scenery.
  for (let i = 0; i < 5; i++) {
    const z = -0.36 + i * 0.16;
    sphere(
      BODY_LIGHT,
      [0, 0.675 - Math.abs(i - 2) * 0.015, z],
      [0.055, 0.025, 0.07],
      torso.joints[Math.min(i, torso.joints.length - 1)],
      7,
      4,
    );
  }

  return b.root;
}
