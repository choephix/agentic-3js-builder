import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { line } from "../src/frame";
import { catmull } from "../src/path";
import { cel, furEdge, INK } from "../kits/toon";

const GREEN = cel("#3b9b55", "#176044");
const DARK_GREEN = cel("#184a3c", "#0c2930");
const BELLY = cel("#f0d9a8", "#c5906b");
const RUBY = cel("#e92f46", "#8e173d");
const BLUE = cel("#236f9d", "#163f73");
const BEAK = cel("#26222a", "#100e16");
const WHITE = cel("#fff8df", "#d5c7b0");
const STEM = cel("#3e8a42", "#245230");
const LEAF = cel("#5cae48", "#27713d");
const ORANGE = cel("#f56a2f", "#a93627");
const ORANGE_LIGHT = cel("#ffad4d", "#d7552c");
const YELLOW = cel("#ffd764", "#d98d2b");
const POT = cel("#b65f3e", "#6e302c");
const POT_RIM = cel("#df8a56", "#8c3d32");
const SOIL = cel("#49352c", "#241b1c");
const GORGET = furEdge(RUBY, RUBY, {
  axis: [0, 0, 1],
  level: 0.04,
  teeth: 0.035,
  period: 0.012,
  ink: INK,
  inkWidth: 0.035,
});
const COAT = furEdge(GREEN, BELLY, { axis: [0, 1, 0], level: -0.01, teeth: 0.02, period: 0.018 });
const WING = cel("#247b70", "#164856");
const FEATHER = cel("#43a6a0", "#225c70");
const FLOWER_DARK = cel("#cc3d27", "#76242d");

const LEAF_SHAPE: ReadonlyArray<readonly [number, number, "sharp"] | readonly [number, number]> = [
  [0, 0],
  [0.018, 0.006],
  [0.042, 0.018, "sharp"],
  [0.06, 0.012],
  [0.042, -0.002],
  [0.018, -0.004],
];

export default function build() {
  const b = createBuilder({ name: "hummingbirdAtFlower", detail: 0.8, paintSize: 1024 });

  // The hovering bird is the single rig root. Every other chain is parented below it, including the plant.
  const hips = b.joint("hips", { at: [0, 0.36, 0.03], dir: [0, 0, 1], role: "spine", group: "bird" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.36, 0.03],
      [0, 0.36, 0.052],
      [0, 0.365, 0.072],
    ]),
    { parent: hips, names: ["spineBase", "chest", "neckBase"], role: "spine", group: "bird" },
  );
  const head = b.joint("head", {
    parent: spine.tip!,
    at: [0, 0.367, 0.075],
    dir: [0, 0, 1],
    role: "head",
    group: "bird",
  });

  b.part(new THREE.SphereGeometry(1, b.segments(10), b.segments(7)), COAT, {
    name: "skull",
    group: "bird",
    bone: head,
    at: head.local([0, 0.014, 0.002]),
    scale: [0.021, 0.019, 0.019],
    flat: true,
  });
  for (const s of [-1, 1]) {
    const eyeAt = head.local([s * 0.015, 0.013, 0.006]);
    b.part(new THREE.SphereGeometry(1, 7, 5), INK, {
      name: s < 0 ? "eyeR" : "eyeL",
      group: "head",
      bone: head,
      at: eyeAt,
      scale: [0.0045, 0.0045, 0.0032],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(1, 5, 4), WHITE, {
      name: s < 0 ? "eyeGlintR" : "eyeGlintL",
      group: "head",
      bone: head,
      at: head.local([s * 0.016, 0.016, 0.009]),
      scale: [0.0011, 0.0011, 0.0007],
      flat: true,
    });
  }
  b.part(new THREE.SphereGeometry(1, 8, 6), GORGET, {
    name: "rubyGorget",
    group: "bird",
    bone: head,
    at: head.local([0, 0.008, -0.012]),
    scale: [0.017, 0.012, 0.014],
    flat: true,
  });

  // Separate upper and lower beaks, each with its own jaw hinge for posing.
  const beakRoot = head.local([0, 0.022, 0]);
  const upperBeak = b.joint("upperBeak", { parent: head, at: beakRoot, dir: [0, 0, 1], role: "jaw", group: "head" });
  const lowerBeak = b.joint("lowerBeak", {
    parent: head,
    at: head.local([0, 0.021, -0.004]),
    dir: [0, 0, 1],
    role: "jaw",
    group: "head",
  });
  b.spike(upperBeak.at, [0, 0, 1], 0.043, 0.0042, {
    name: "upperBill",
    bone: upperBeak,
    color: BEAK,
    caps: "point",
    section: { ngon: 5 },
    group: "head",
  });
  b.spike(lowerBeak.at, [0, 0, 1], 0.038, 0.0031, {
    name: "lowerBill",
    bone: lowerBeak,
    color: BEAK,
    caps: "point",
    section: { ngon: 5 },
    group: "head",
  });

  const body = b.loft(
    [
      { at: [0, 0.36, 0.025], w: 0.028, h: 0.024 },
      { at: [0, 0.36, 0.048], w: 0.034, h: 0.029 },
      { at: [0, 0.365, 0.072], w: 0.023, h: 0.022 },
    ],
    { name: "body", group: "bird", bone: spine, color: COAT, section: "circle", sides: 7, caps: "round" },
  );
  // A blue-green back plate makes the iridescence read even in the low-poly silhouette.
  b.sweep(body, (t) => 0.012 + 0.003 * (1 - t), {
    name: "backSheen",
    group: "bird",
    bone: spine,
    color: BLUE,
    sectors: [[-62, 62, BLUE]],
    caps: "none",
    from: 0.1,
    section: { ngon: 6 },
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.36, 0.025],
      [0, 0.355, 0.002],
      [0, 0.353, -0.025],
      [0, 0.35, -0.047],
    ]),
    { parent: hips, names: ["tailBase", "tailMid", "tailTip"], role: "tail", group: "bird" },
  );
  b.sweep(tail, [0.012, 0.003], {
    name: "tailCore",
    group: "bird",
    bone: tail,
    color: DARK_GREEN,
    sides: 6,
    section: "circle",
  });
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const base = tail.at(0.35 + i * 0.16).at;
      const tip = [s * (0.012 + i * 0.009), 0.355 + i * 0.002, -0.067 - i * 0.006] as const;
      b.sweep([base, [s * 0.008, 0.354, -0.052 - i * 0.004], tip], [0.006, 0.001], {
        name: `tailFeather${s < 0 ? "R" : "L"}${i + 1}`,
        group: "tail",
        bone: tail,
        color: i === 1 ? FEATHER : WING,
        section: { ngon: 4 },
        caps: { start: "round", end: "point" },
      });
    }
  }

  // Folded feet hang tucked under the belly, but remain fully rigged and separated.
  for (const s of [-1, 1]) {
    const footPts = catmull([
      [s * 0.014, 0.35, 0.037],
      [s * 0.021, 0.342, 0.035],
      [s * 0.026, 0.339, 0.045],
    ]);
    const leg = b.chain("leg" + (s < 0 ? "R" : "L"), footPts, {
      parent: hips,
      names: [s < 0 ? "hipR" : "hipL", s < 0 ? "ankleR" : "ankleL"],
      role: "leg",
      group: "bird",
    });
    b.sweep(leg, [0.0032, 0.0018], {
      name: `leg${s < 0 ? "R" : "L"}`,
      group: "legs",
      bone: leg,
      color: BEAK,
      section: { ngon: 5 },
    });
    for (const toe of [-1, 1]) {
      const toeBase = leg.at(0.82).at;
      const toeTip = [s * 0.029 + toe * 0.004, 0.335, 0.049] as const;
      b.spike(toeBase, toeTip, null, 0.0017, {
        name: `toe${s < 0 ? "R" : "L"}${toe < 0 ? "A" : "B"}`,
        group: "legs",
        bone: leg,
        color: BEAK,
        caps: "point",
      });
    }
  }

  // Long, spread wings: continuous membranes plus individually fanned primaries.
  for (const s of [-1, 1]) {
    const wingPath = catmull([
      [s * 0.022, 0.375, 0.055],
      [s * 0.055, 0.392, 0.058],
      [s * 0.102, 0.403, 0.052],
      [s * 0.142, 0.404, 0.045],
    ]);
    const wing = b.chain("wing" + (s < 0 ? "R" : "L"), wingPath, {
      parent: spine.tip!,
      names: [s < 0 ? "shoulderR" : "shoulderL", s < 0 ? "elbowR" : "elbowL", s < 0 ? "wristR" : "wristL"],
      role: "wing",
      group: "bird",
    });
    b.sweep(wing, [0.009, 0.003], {
      name: `wingArm${s < 0 ? "R" : "L"}`,
      group: "wings",
      bone: wing,
      color: WING,
      section: { ngon: 5 },
    });
    const trailing = [
      [s * 0.022, 0.375, 0.055],
      [s * 0.062, 0.365, 0.045],
      [s * 0.112, 0.372, 0.03],
      [s * 0.145, 0.38, 0.028],
    ] as const;
    b.membrane(wing, trailing, {
      name: `wingMembrane${s < 0 ? "R" : "L"}`,
      group: "wings",
      color: WING,
      thickness: 0.0015,
      rows: 3,
      cols: 7,
      bone: wing,
      scallop: 0.08,
    });
    for (let i = 0; i < 5; i++) {
      const base = wing.at(0.38 + i * 0.13).at;
      const tip = [s * (0.12 + i * 0.012), 0.39 - i * 0.006, 0.012 - i * 0.012] as const;
      b.sweep([base, [s * (0.1 + i * 0.01), 0.4 - i * 0.004, 0.03 - i * 0.008], tip], [0.005, 0.001], {
        name: `primary${s < 0 ? "R" : "L"}${i + 1}`,
        group: "wings",
        bone: wing,
        color: i === 0 ? FEATHER : WING,
        section: { ngon: 4 },
        caps: { start: "round", end: "point" },
      });
    }
  }

  // Pot and plant scenery. It is intentionally below and behind the hovering bird.
  b.lathe(
    [
      [0, 0],
      [0.048, 0],
      [0.057, 0.012],
      [0.06, 0.073],
      [0.052, 0.096],
      [0.045, 0.105],
      [0, 0.105],
    ],
    { name: "clayPot", group: "scenery", at: [0, 0, -0.035], color: POT, segments: 10, smoothing: 1, bone: hips },
  );
  b.lathe(
    [
      [0, 0],
      [0.057, 0],
      [0.06, 0.009],
      [0, 0.012],
    ],
    { name: "potRim", group: "scenery", at: [0, 0.096, -0.035], color: POT_RIM, segments: 10, bone: hips },
  );
  b.lathe(
    [
      [0, 0],
      [0.044, 0],
      [0.044, 0.006],
      [0, 0.006],
    ],
    { name: "potSoil", group: "scenery", at: [0, 0.105, -0.035], color: SOIL, segments: 10, bone: hips },
  );

  const stemPath = catmull([
    [0, 0.106, -0.035],
    [0, 0.19, -0.026],
    [-0.004, 0.255, -0.015],
    [0.006, 0.31, 0.01],
    [0.01, 0.36, 0.02],
  ]);
  const stem = b.chain("stem", stemPath, {
    parent: hips,
    names: ["stemBase", "stemMid", "stemUpper", "stemTop"],
    role: "spine",
    group: "plant",
  });
  b.sweep(stem, [0.009, 0.003], { name: "mainStem", group: "plant", bone: stem, color: STEM, section: { ngon: 6 } });

  // Broad low-poly leaves on alternating sides of the stem.
  const leaves: Array<[THREE.Vector3, THREE.Vector3, THREE.Vector3]> = [
    [new THREE.Vector3(-0.002, 0.2, -0.02), new THREE.Vector3(-0.8, 0.1, 0.2), new THREE.Vector3(0.05, 0.9, 0.1)],
    [new THREE.Vector3(-0.002, 0.245, -0.012), new THREE.Vector3(0.7, 0.1, -0.15), new THREE.Vector3(-0.04, 0.9, 0.2)],
    [new THREE.Vector3(0.004, 0.292, 0.004), new THREE.Vector3(-0.75, 0.05, 0.25), new THREE.Vector3(0.02, 0.9, 0.15)],
  ];
  leaves.forEach(([at, x, y], i) => {
    b.extrude(LEAF_SHAPE, {
      name: `leaf${i + 1}`,
      group: "plant",
      at,
      x,
      y,
      thickness: 0.002,
      color: LEAF,
      bone: stem.joints[Math.min(i + 1, stem.joints.length - 1)],
    });
    b.rod(at, at.clone().addScaledVector(x, 0.045), 0.0011, {
      name: `leafVein${i + 1}`,
      group: "plant",
      bone: stem,
      color: STEM,
      caps: "flat",
    });
  });

  const blooms = [
    {
      base: [0.006, 0.305, 0.018] as const,
      tip: [0.002, 0.365, 0.115] as const,
      bend: [0.004, 0.342, 0.07] as const,
      name: "bloomLow",
    },
    {
      base: [-0.004, 0.335, 0.018] as const,
      tip: [-0.057, 0.405, 0.07] as const,
      bend: [-0.032, 0.372, 0.048] as const,
      name: "bloomLeft",
    },
    {
      base: [0.008, 0.355, 0.02] as const,
      tip: [0.058, 0.445, 0.075] as const,
      bend: [0.038, 0.4, 0.05] as const,
      name: "bloomRight",
    },
  ];
  for (const bloom of blooms) {
    const path = catmull([bloom.base, bloom.bend, bloom.tip]);
    b.sweep(path, [0.007, 0.015], {
      name: bloom.name,
      group: "flowers",
      bone: stem,
      color: ORANGE,
      section: "circle",
      sides: 7,
      caps: { start: "round", end: "flat" },
    });
    b.sweep(path, [0.004, 0.01], {
      name: `${bloom.name}Inner`,
      group: "flowers",
      bone: stem,
      color: FLOWER_DARK,
      section: { ngon: 6 },
      caps: { start: "none", end: "flat" },
      from: 0.45,
    });
    const mouth = line(bloom.tip, [bloom.tip[0], bloom.tip[1], bloom.tip[2] + 0.01]);
    b.ring(mouth, { count: 7, radius: 0.013, fromDeg: 0, toDeg: 360 }, (petal) =>
      b.spike(petal, petal, 0.006, 0.002, {
        name: `${bloom.name}Petal`,
        group: "flowers",
        bone: stem,
        color: ORANGE_LIGHT,
        caps: "point",
      }),
    );
    b.spike(bloom.tip, [0, 0, 1], 0.003, 0.0045, {
      name: `${bloom.name}Throat`,
      group: "flowers",
      bone: stem,
      color: YELLOW,
      caps: "point",
    });
  }

  return b.root;
}

export const meta = {
  name: "Hummingbird at Flower",
  description:
    "A ruby-throated hummingbird hovers with spread wings as its beak enters a trio of trumpet-vine blooms in a clay pot.",
};
