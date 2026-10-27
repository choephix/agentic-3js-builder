import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  line,
  rng,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "bioluminescent alien plant",
  description:
    "A stylized Avatar-inspired alien plant with luminous cyan veins, violet fan leaves, glowing seed pods, tendrils, and a radiant crown flower.",
};

export default function build() {
  const b = createBuilder({ name: "bioluminescentAlienPlant", detail: 1 });

  const ROOT = "#16251d";
  const ROOT_LIGHT = "#2d5b43";
  const STEM = "#244e3b";
  const STEM_LIGHT = "#3f8661";
  const LEAF = "#245f57";
  const LEAF_DARK = "#123d43";
  const LEAF_EDGE = "#51e4c7";
  const CYAN = "#55fff0";
  const CYAN_BRIGHT = "#baffff";
  const BLUE = "#45c7ff";
  const VIOLET = "#632d9b";
  const PURPLE = "#a950e8";
  const PINK = "#ff5bd8";
  const PINK_LIGHT = "#ffb0f2";
  const GOLD = "#e4ff72";
  const DARK = "#11142b";

  const root = b.joint("root", {
    at: [0, 0.18, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const rand = rng(1847);

  const sphere = (
    radius: number,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    bone = root,
    seg = 8,
    rings = 5,
  ) => b.part(new THREE.SphereGeometry(radius, seg, rings), color, {
    at,
    bone,
    flat: true,
  });

  const glowingSphere = (
    radius: number,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    strength = 1.5,
    seg = 8,
    rings = 5,
  ) => glow(sphere(radius, color, at, root, seg, rings), strength);

  const orb = (
    at: THREE.Vector3 | [number, number, number],
    radius = 0.025,
    color = CYAN,
    strength = 2,
  ) => glowingSphere(radius, color, at, strength, 7, 4);

  const rod = (
    a: THREE.Vector3 | [number, number, number],
    c: THREE.Vector3 | [number, number, number],
    radius: number,
    color: string,
    bone = root,
    caps: "round" | "flat" = "round",
  ) =>
    b.sweep([a, c], radius, {
      color,
      bone,
      caps,
      sides: 7,
      flat: true,
    });

  const stalkPath = catmull([
    [0, 0.16, 0],
    [0.02, 0.52, -0.01],
    [-0.035, 0.91, 0.015],
    [0.015, 1.29, 0.02],
    [-0.025, 1.64, 0.0],
    [0.015, 1.96, 0.04],
    [0, 2.22, 0.02],
  ]);

  const stalk = b.chain("stalk", stalkPath, {
    parent: root,
    count: 6,
    names: ["stalkBase", "stalkLow", "stalkMid", "stalkHigh", "stalkNeck", "stalkTip"],
    role: "spine",
  });

  const stalkTube = b.sweep(stalk, (t) => 0.105 - 0.052 * t, {
    color: STEM,
    section: { ngon: 7 },
    sides: 7,
    flat: true,
  });

  b.sweep(stalkPath, (t) => 0.022 - 0.008 * t, {
    color: STEM_LIGHT,
    bone: stalk,
    shift: [0.055, 0],
    caps: "round",
    sides: 6,
  });

  // Dark, chunky alien root crown.
  const rootMound = b.part(
    new THREE.SphereGeometry(0.32, 9, 5),
    ROOT,
    { at: [0, 0.18, 0], bone: root, scale: [1.15, 0.42, 1.0], flat: true, name: "rootMound" },
  );
  const rootPlate = b.part(
    new THREE.CylinderGeometry(0.31, 0.42, 0.09, 9),
    ROOT_LIGHT,
    { at: [0, 0.055, 0], bone: root, flat: true, name: "rootPlate" },
  );

  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rand() * 0.25;
    const r = 0.16 + rand() * 0.14;
    const p = new THREE.Vector3(Math.cos(a) * r, 0.095 + rand() * 0.035, Math.sin(a) * r);
    const q = new THREE.Vector3(
      Math.cos(a) * (r + 0.18 + rand() * 0.08),
      0.04 + rand() * 0.025,
      Math.sin(a) * (r + 0.18 + rand() * 0.08),
    );
    rod(p, q, 0.025 + rand() * 0.012, ROOT_LIGHT, root, "flat");
    orb(q, 0.018 + rand() * 0.009, CYAN, 1.2);
  }

  // Luminous segmented nodes along the central trunk.
  for (let i = 0; i < 9; i++) {
    const t = 0.08 + i * 0.105;
    const p = stalkTube.at(t, 0);
    orb(p.at, 0.022 + (i % 3 === 0 ? 0.012 : 0), i % 3 === 0 ? CYAN_BRIGHT : CYAN, 1.8);
  }

  type V3 = THREE.Vector3;

  const makeLeaf = (
    name: string,
    base: V3,
    tip: V3,
    width: number,
    color: string,
    veinColor: string,
    side = 1,
  ) => {
    const axis = tip.clone().sub(base);
    const length = axis.length();
    const dir = axis.clone().normalize();

    let sideVec = new V3(0, 1, 0).cross(dir);
    if (sideVec.lengthSq() < 0.02) sideVec = new V3(1, 0, 0).cross(dir);
    sideVec.normalize().multiplyScalar(width);

    const mid = base.clone().addScaledVector(axis, 0.46);
    const shoulder = base.clone().addScaledVector(axis, 0.19);
    const leftEdge = catmull([
      base.clone(),
      shoulder.clone().addScaledVector(sideVec, 0.72),
      mid.clone().addScaledVector(sideVec, 1.0),
      tip.clone().addScaledVector(sideVec, 0.05),
    ]);
    const rightEdge = catmull([
      base.clone(),
      shoulder.clone().addScaledVector(sideVec, -0.72),
      mid.clone().addScaledVector(sideVec, -1.0),
      tip.clone().addScaledVector(sideVec, -0.05),
    ]);

    const membrane = b.membrane(leftEdge, rightEdge, {
      color,
      thickness: 0.012,
      rows: 5,
      cols: 7,
      scallop: 0.08,
      name,
    });

    const vein = b.sweep(
      catmull([
        base.clone().addScaledVector(dir, -0.025),
        shoulder.clone(),
        mid.clone(),
        tip.clone().addScaledVector(dir, -0.025),
      ]),
      0.012,
      {
        color: veinColor,
        bone: root,
        sides: 6,
        caps: "round",
        name: `${name}Vein`,
      },
    );
    glow(vein, 1.7);

    // Three branching veins make the leaves read as living, translucent structures.
    for (const t of [0.33, 0.56, 0.75]) {
      const center = base.clone().addScaledVector(axis, t);
      const spread = sideVec.clone().multiplyScalar(0.72 * (1 - t * 0.35));
      const branchA = center.clone().add(spread);
      const branchB = center.clone().sub(spread);
      const branchEnd = center.clone().addScaledVector(dir, length * 0.17);
      const veinA = rod(center, branchA.lerp(branchEnd, 0.24), 0.0055, veinColor, root, "flat");
      const veinB = rod(center, branchB.lerp(branchEnd, 0.24), 0.0055, veinColor, root, "flat");
      glow(veinA, 1.15);
      glow(veinB, 1.15);
      orb(branchA, 0.009, CYAN_BRIGHT, 1.5);
      orb(branchB, 0.009, CYAN_BRIGHT, 1.5);
    }

    // A pointed glowing tip.
    orb(tip, 0.018 + 0.012 * Math.min(1, width / 0.2), veinColor, 2.1);
    return membrane;
  };

  const leafSpecs: Array<[number, number, number, number, number, number, number, string]> = [
    [0.52, 0.86, 0.17, 0.80, 0.28, 0.16, 1, LEAF],
    [-0.50, 0.74, -0.25, -0.83, 0.31, 0.18, -1, LEAF_DARK],
    [0.44, 1.18, 0.03, 0.91, 0.24, 0.24, 1, LEAF],
    [-0.48, 1.39, 0.10, -0.86, 0.32, 0.22, -1, LEAF_DARK],
    [0.40, 1.68, -0.01, 0.88, 0.19, 0.35, 1, LEAF],
    [-0.40, 1.82, 0.10, -0.82, 0.23, 0.34, -1, LEAF_DARK],
    [0.32, 2.03, 0.05, 0.78, 0.17, 0.42, 1, LEAF],
    [-0.30, 2.16, 0.02, -0.72, 0.19, 0.45, -1, LEAF_DARK],
  ];

  leafSpecs.forEach((s, i) => {
    const [bx, by, bz, tx, ty, tz, side, color] = s;
    const base = new THREE.Vector3(bx, by, bz);
    const tip = new THREE.Vector3(tx, ty, tz);
    makeLeaf(
      `leaf${i + 1}`,
      base,
      tip,
      0.11 + (i % 3) * 0.018,
      color,
      i % 2 ? BLUE : CYAN,
      side,
    );
  });

  // Small upright lance leaves around the crown.
  const crownLeaves = [
    [0.0, 2.19, 0.03, 0.0, 2.60, 0.13, 0.10],
    [0.0, 2.20, 0.03, 0.22, 2.53, 0.08, 0.09],
    [0.0, 2.20, 0.03, -0.22, 2.54, 0.08, 0.09],
    [0.0, 2.20, 0.03, 0.04, 2.48, -0.20, 0.09],
  ];
  crownLeaves.forEach((v, i) => {
    makeLeaf(
      `crownLeaf${i}`,
      new THREE.Vector3(v[0], v[1], v[2]),
      new THREE.Vector3(v[3], v[4], v[5]),
      v[6],
      i % 2 ? LEAF_DARK : LEAF,
      CYAN,
    );
  });

  // Long curling tendrils, each with a glowing bead at its end.
  const tendrilData = [
    [
      [0.07, 0.43, 0.05],
      [0.34, 0.30, 0.18],
      [0.51, 0.46, 0.29],
      [0.42, 0.67, 0.32],
      [0.27, 0.72, 0.19],
    ],
    [
      [-0.08, 0.56, 0.03],
      [-0.34, 0.39, -0.10],
      [-0.55, 0.54, -0.22],
      [-0.48, 0.79, -0.25],
      [-0.29, 0.86, -0.13],
    ],
    [
      [0.06, 1.06, 0.01],
      [0.32, 0.97, -0.18],
      [0.56, 1.13, -0.27],
      [0.51, 1.35, -0.20],
      [0.35, 1.43, -0.06],
    ],
    [
      [-0.05, 1.48, 0.02],
      [-0.27, 1.42, 0.24],
      [-0.47, 1.58, 0.31],
      [-0.41, 1.77, 0.24],
      [-0.24, 1.84, 0.10],
    ],
  ];

  tendrilData.forEach((points, i) => {
    const path = catmull(points as number[][]);
    const tendril = b.sweep(path, [0.018, 0.006], {
      color: i % 2 ? BLUE : CYAN,
      sides: 6,
      caps: { start: "round", end: "point" },
      name: `tendril${i + 1}`,
    });
    glow(tendril, 1.45);
    const end = path.at(1);
    orb(end, 0.026, i % 2 ? PINK : GOLD, 2.5);
    orb(path.at(0.62), 0.012, CYAN_BRIGHT, 1.8);
  });

  // Crown flower: a dark central cup surrounded by angular luminous petals.
  const flowerCenter = new THREE.Vector3(0, 2.39, 0.04);
  const cup = glow(
    b.part(
      new THREE.CylinderGeometry(0.105, 0.075, 0.13, 8),
      VIOLET,
      { at: flowerCenter, bone: root, flat: true, name: "flowerCup" },
    ),
    1.1,
  );

  const petalOutline: [number, number, "sharp"][] = [
    [0, 0],
    [0.055, 0.02],
    [0.11, 0.18],
    [0.055, 0.31, "sharp"],
    [0, 0.22],
    [-0.055, 0.31, "sharp"],
    [-0.11, 0.18],
    [-0.055, 0.02],
  ];

  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const radial = new THREE.Vector3(Math.sin(a), 0.12, Math.cos(a)).normalize();
    const across = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a)).normalize();
    const petalBase = flowerCenter.clone().add(new THREE.Vector3(0, 0.045, 0));
    const petal = b.extrude(petalOutline, {
      at: petalBase,
      x: across,
      y: radial,
      thickness: [0.018, 0.006],
      bevel: 0.006,
      smoothing: 1,
      color: i % 2 ? PURPLE : PINK,
      bone: root,
      name: `flowerPetal${i + 1}`,
    });
    glow(petal, 1.65);

    const petalTip = petalBase
      .clone()
      .addScaledVector(radial, 0.29)
      .add(new THREE.Vector3(0, 0.035, 0));
    orb(petalTip, 0.026, i % 2 ? CYAN : PINK_LIGHT, 2.6);
  }

  // Golden pollen crown and a few hovering spores.
  const pollenStem = rod([0, 2.43, 0.04], [0, 2.70, 0.04], 0.018, GOLD, root, "flat");
  glow(pollenStem, 1.4);
  orb([0, 2.72, 0.04], 0.055, GOLD, 3.0);
  orb([0.045, 2.80, 0.09], 0.018, CYAN_BRIGHT, 2.3);
  orb([-0.07, 2.77, 0.02], 0.014, PINK, 2.4);
  orb([0.09, 2.67, -0.04], 0.012, BLUE, 2.0);

  // A few translucent-looking side bulbs built as bold low-poly pods.
  const pods = [
    [0.18, 0.69, 0.05, 0.045, CYAN],
    [-0.20, 0.98, 0.04, 0.052, BLUE],
    [0.16, 1.43, -0.02, 0.042, PINK],
    [-0.14, 1.72, 0.03, 0.035, CYAN_BRIGHT],
  ] as const;

  pods.forEach((p, i) => {
    const pod = b.part(
      new THREE.SphereGeometry(p[3], 8, 5),
      i % 2 ? PURPLE : VIOLET,
      {
        at: [p[0], p[1], p[2]],
        bone: root,
        scale: [0.72, 1.25, 0.72],
        flat: true,
        name: `seedPod${i + 1}`,
      },
    );
    glow(pod, 1.2);
    orb([p[0], p[1] + p[3] * 0.65, p[2] + 0.008], p[3] * 0.3, p[4], 2.1);
  });

  // Tiny luminous freckles on the stem give it the Avatar-like night-forest read.
  const freckles = [
    [0.071, 0.61, 0.045],
    [-0.068, 0.78, 0.044],
    [0.062, 0.94, 0.056],
    [-0.053, 1.12, 0.063],
    [0.048, 1.34, 0.059],
    [-0.052, 1.54, 0.057],
    [0.043, 1.76, 0.053],
    [-0.031, 1.95, 0.059],
  ];
  freckles.forEach((p, i) => orb(p as [number, number, number], 0.012, i % 3 === 0 ? PINK : CYAN, 1.7));

  // Low radial root tendrils make the plant firmly meet the floor.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.2;
    const base = new THREE.Vector3(Math.cos(a) * 0.13, 0.12, Math.sin(a) * 0.13);
    const tip = new THREE.Vector3(Math.cos(a) * 0.47, 0.045, Math.sin(a) * 0.47);
    const rootPath = catmull([
      base,
      base.clone().lerp(tip, 0.35).add(new THREE.Vector3(0, 0.035, 0)),
      tip,
    ]);
    const rhizome = b.sweep(rootPath, [0.045, 0.012], {
      color: ROOT_LIGHT,
      caps: { start: "round", end: "point" },
      sides: 6,
      name: `rhizome${i + 1}`,
    });
    glow(rhizome, 0.45);
    orb(tip, 0.014, i % 2 ? BLUE : CYAN, 1.25);
  }

  return b.root;
}
