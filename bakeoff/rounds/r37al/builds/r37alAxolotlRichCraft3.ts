import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
} from "../../../../src/index";
import {
  animeEye,
  cel,
  furEdge,
  INK,
} from "../../../../kits/toon";

export const meta = {
  name: "Chibi Axolotl",
  description: "A cute low-poly axolotl with a soft pink body, huge eyes, tiny feet, and branching frilly pink external gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibi-axolotl", detail: 1 });

  const BODY = cel("#e891a5", "#b85c78");
  const BELLY = cel("#ffd9d9", "#e9a9b4");
  const DARK = INK;
  const PINK = cel("#ff709b", "#c93668");
  const GILL_LIGHT = cel("#ff9fbd", "#d94d78");
  const CREAM = cel("#fff1df", "#e8b9ae");
  const MINT = cel("#9de0d3", "#4d9f99");
  const FLOOR_DARK = "#b65c7c";

  const hips = b.joint("hips", {
    at: [0, 0.34, -0.28],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.34, -0.7],
    [0, 0.38, -0.38],
    [0, 0.41, 0.0],
    [0, 0.45, 0.38],
    [0, 0.51, 0.68],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    count: 5,
    names: ["spine1", "spine2", "spine3", "chest", "neckBase"],
    role: "spine",
  });

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 0.55, 0.74],
    dir: [0, 0.08, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.47, 0.88],
    dir: [0, -0.12, 1],
    role: "jaw",
    group: "face",
  });

  const tailPath = catmull([
    [0, 0.38, -0.52],
    [0, 0.32, -0.95],
    [0, 0.25, -1.34],
    [0, 0.17, -1.67],
    [0, 0.1, -1.9],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    count: 5,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
  });

  const coat = furEdge(BODY, BELLY, {
    axis: [0, 1, 0],
    level: 0.02,
    teeth: 0.12,
    period: 0.09,
    along: [0, 0, 1],
  });

  const body = b.sweep(spinePath, (t) => 0.22 - t * 0.035, {
    bone: spine,
    color: coat,
    section: { ngon: 8 },
    caps: "round",
    name: "soft rounded body",
    group: "body",
  });

  b.sweep(tail, (t) => 0.13 * (1 - t) + 0.018, {
    color: coat,
    section: { ngon: 7 },
    caps: "round",
    name: "tapered tail",
    group: "tail",
  });

  const headPart = b.part(
    new THREE.SphereGeometry(0.32, 12, 8),
    coat,
    {
      bone: head,
      at: [0, 0.58, 0.78],
      scale: [1.14, 0.98, 0.94],
      name: "big round head",
      group: "head",
      flat: true,
    },
  );

  const muzzle = b.part(
    new THREE.SphereGeometry(0.18, 10, 6),
    BELLY,
    {
      bone: jaw,
      at: [0, 0.47, 1.02],
      scale: [1.18, 0.66, 0.72],
      name: "cream muzzle",
      group: "face",
      flat: true,
    },
  );

  const lowerLip = b.sweep(
    catmull([
      [-0.12, 0.43, 1.15],
      [0, 0.405, 1.18],
      [0.12, 0.43, 1.15],
    ]),
    0.012,
    { bone: jaw, color: DARK, caps: "round", name: "smiling mouth" },
  );

  const nose = b.part(
    new THREE.SphereGeometry(0.035, 7, 5),
    "#5a294b",
    {
      bone: jaw,
      at: [0, 0.52, 1.18],
      name: "tiny nose",
    },
  );

  const eyeTexture = animeEye({
    iris: "#63d8c5",
    irisLight: "#c9fff0",
    irisDark: "#267d86",
    blush: false,
    size: 256,
  });

  const faceSurface = b.surface(headPart);
  for (const side of [-1, 1]) {
    const hit = faceSurface.around([0, 0.58, 0.78]).at(side * 38, 5);
    if (hit) {
      b.decal(faceSurface, eyeTexture, {
        at: hit,
        size: [0.17, 0.22],
        lift: 0.006,
        mirror: side > 0,
        name: side < 0 ? "right giant eye" : "left giant eye",
        group: "face",
      });
    }
  }

  for (const side of [-1, 1]) {
    const ear = b.part(
      new THREE.SphereGeometry(0.095, 8, 5),
      BODY,
      {
        bone: head,
        at: [side * 0.255, 0.79, 0.73],
        scale: [1, 1.15, 0.55],
        name: side < 0 ? "earR" : "earL",
        group: "head",
      },
    );
    b.part(
      new THREE.SphereGeometry(0.048, 7, 4),
      PINK,
      {
        bone: head,
        at: [side * 0.255, 0.79, 0.765],
        scale: [1, 1.05, 0.3],
        name: side < 0 ? "ear inner R" : "ear inner L",
        group: "head",
      },
    );
  }

  const legData = [
    { side: 1, front: true, hip: [0.17, 0.35, 0.37], foot: [0.27, 0.075, 0.61], n: "frontL" },
    { side: -1, front: true, hip: [-0.17, 0.35, 0.37], foot: [-0.27, 0.075, 0.61], n: "frontR" },
    { side: 1, front: false, hip: [0.18, 0.32, -0.35], foot: [0.3, 0.075, -0.52], n: "backL" },
    { side: -1, front: false, hip: [-0.18, 0.32, -0.35], foot: [-0.3, 0.075, -0.52], n: "backR" },
  ];

  for (const d of legData) {
    const pts = limb(
      d.hip,
      d.foot,
      [0.18, 0.15],
      d.front ? [[0, 0, 1]] : [[0, 0, -1]],
      { sole: [0, 0, 1] },
    );
    const chain = b.chain(d.n, pts, {
      parent: spine.joints[d.front ? 3 : 1],
      names: [`${d.n}Hip`, `${d.n}Knee`, `${d.n}Ankle`],
      role: "leg",
      contact: d.foot as [number, number, number],
    });
    b.sweep(chain, [0.075, 0.055], {
      color: BODY,
      section: { ngon: 6 },
      caps: "round",
      name: `${d.n} chunky leg`,
      group: "legs",
    });

    b.part(
      new THREE.SphereGeometry(0.075, 8, 5),
      BELLY,
      {
        bone: chain.tip,
        at: d.foot,
        scale: [1.25, 0.42, 1.45],
        name: `${d.n} webbed foot`,
        group: "feet",
      },
    );

    for (let toe = -1; toe <= 1; toe++) {
      const x = d.foot[0] + toe * 0.042;
      const z = d.foot[2] + 0.065;
      b.sweep(
        [[x, 0.07, z], [x + toe * 0.018, 0.045, z + 0.075]],
        [0.018, 0.006],
        {
          bone: chain.tip,
          color: CREAM,
          caps: "round",
          name: `${d.n} toe ${toe}`,
          group: "digits",
        },
      );
    }
  }

  // External frilly gills: three thick roots and several soft branchlets on each side.
  for (const side of [-1, 1]) {
    const root = [side * 0.27, 0.65, 0.67] as [number, number, number];
    const gillJoint = b.joint(`gill${side > 0 ? "L" : "R"}`, {
      parent: head,
      at: root,
      dir: [side * 0.8, 0.08, -0.12],
      role: "fan",
      group: "gills",
    });

    const fanAngles = [-0.62, -0.3, 0, 0.3, 0.62];
    for (let i = 0; i < fanAngles.length; i++) {
      const a = fanAngles[i];
      const tip: [number, number, number] = [
        side * (0.48 + 0.05 * Math.cos(a)),
        0.7 + a * 0.38,
        0.55 - Math.abs(a) * 0.12 + 0.05 * Math.sin(a),
      ];
      const path = catmull([
        root,
        [side * 0.35, 0.68 + a * 0.18, 0.63],
        tip,
      ]);
      b.sweep(path, [0.027, 0.006], {
        bone: gillJoint,
        color: GILL_LIGHT,
        section: { ngon: 6 },
        caps: { start: "round", end: "point" },
        name: `${side > 0 ? "left" : "right"} gill frill ${i}`,
        group: "gills",
      });

      const branchRoot = [
        side * (0.38 + 0.025 * Math.cos(a)),
        0.69 + a * 0.18,
        0.61,
      ] as [number, number, number];
      const branchTip = [
        side * 0.46,
        0.69 + a * 0.18 + (a >= 0 ? 0.075 : -0.075),
        0.59 - Math.abs(a) * 0.05,
      ] as [number, number, number];
      b.sweep([branchRoot, branchTip], [0.013, 0.003], {
        bone: gillJoint,
        color: PINK,
        caps: { start: "round", end: "point" },
        name: `${side > 0 ? "left" : "right"} gill twig ${i}`,
        group: "gills",
      });
    }

    b.part(
      new THREE.SphereGeometry(0.065, 8, 5),
      PINK,
      {
        bone: gillJoint,
        at: root,
        scale: [1.15, 0.9, 0.7],
        name: `${side > 0 ? "left" : "right"} gill base`,
        group: "gills",
      },
    );
  }

  // A few simple dorsal finlets give the tail a readable axolotl silhouette.
  for (let i = 0; i < 5; i++) {
    const t = i / 5;
    const p = tail.at(0.12 + t * 0.7);
    b.spike(
      p,
      [0, 1, 0],
      0.075 * (1 - t * 0.55),
      0.025,
      {
        bone: p.bone,
        color: PINK,
        name: `tail finlet ${i}`,
        group: "tail",
      },
    );
  }

  // Tiny cheek freckles.
  const freckles = [
    [-0.16, 0.48, 1.13],
    [-0.11, 0.45, 1.17],
    [0.16, 0.48, 1.13],
    [0.11, 0.45, 1.17],
  ];
  for (let i = 0; i < freckles.length; i++) {
    b.part(
      new THREE.SphereGeometry(0.012, 6, 4),
      "#b94f70",
      { bone: jaw, at: freckles[i], name: `cheek freckle ${i}`, group: "face" },
    );
  }

  // Small decorative belly spots, positioned explicitly on the front-facing belly.
  for (const [x, z, r] of [
    [-0.08, 0.38, 0.022],
    [0.08, 0.4, 0.019],
    [0, 0.28, 0.024],
    [-0.1, 0.17, 0.016],
    [0.1, 0.18, 0.016],
  ]) {
    b.part(
      new THREE.SphereGeometry(r, 6, 4),
      CREAM,
      {
        bone: spine.joints[2],
        at: [x, 0.31, z],
        scale: [1, 0.25, 1],
        name: "belly spot",
        group: "markings",
      },
    );
  }

  return b.root;
}
