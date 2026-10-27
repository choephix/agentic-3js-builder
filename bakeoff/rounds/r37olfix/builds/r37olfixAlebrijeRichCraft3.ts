import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  frame,
  rng,
  paint,
  spots,
  stripes,
  countershade,
  svg,
  limb,
} from "../../../../src/index";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "A vividly painted Oaxacan alebrije combining a powerful spotted jaguar body, eagle head, broad feathered wings, curled tail, and hand-painted folk patterns.",
};

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  const INKWOOD = "#24152e";
  const TURQUOISE = cel("#16c7b3", "#087b87");
  const BLUE = cel("#2389dc", "#174b9c");
  const MAGENTA = cel("#ed3f91", "#9b245d");
  const GOLD = cel("#ffc83d", "#c66a18");
  const ORANGE = cel("#f47a27", "#a93222");
  const RED = cel("#e83c35", "#8d202c");
  const CREAM = cel("#ffe8a7", "#dca260");
  const PURPLE = cel("#793fa8", "#42245f");
  const GREEN = cel("#69c83b", "#277d36");

  const coat = countershade(
    furEdge(
      spots(TURQUOISE, [GOLD, MAGENTA, CREAM], {
        size: 0.16,
        amount: 0.7,
        rosette: true,
        seed: 18,
      }),
      CREAM,
      { level: -0.18, teeth: 0.16, period: 0.045, ink: INKWOOD, inkWidth: 0.025 },
    ),
    CREAM,
    { level: -0.15, soft: 0.3 },
  );

  const stripePaint = stripes(ORANGE, [MAGENTA, PURPLE], {
    size: 0.17,
    width: 0.25,
    wobble: 0.25,
    seed: 7,
  });

  // Skeleton first: one readable root and articulated chains.
  const hips = b.joint("hips", {
    at: [0, 0.86, -0.16],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.86, -0.2],
      [0, 0.98, 0.1],
      [0, 1.08, 0.38],
      [0, 1.16, 0.62],
    ]),
    { parent: hips, names: ["spineBase", "spineMid", "spineShoulder", "chest"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.16, 0.62],
      [0, 1.3, 0.78],
      [0, 1.46, 0.86],
    ]),
    { parent: spine.tip, names: ["neck", "neckTip"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 1.48, 0.88],
    dir: [0, 0.04, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.39, 0.98],
    dir: [0, -0.12, 1],
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.9, -0.34],
      [0, 0.82, -0.72],
      [0.06, 0.77, -1.08],
      [0.18, 0.86, -1.38],
      [0.32, 1.03, -1.58],
    ]),
    { parent: hips, names: ["tailBase", "tail1", "tail2", "tailTip"], role: "tail" },
  );

  // Main wooden creature volumes.
  const body = b.sweep(spine, (t) => 0.22 - t * 0.035, {
    color: coat,
    section: { ngon: 8 },
    sides: 8,
    name: "painted-jaguar-body",
  });
  const neckTube = b.sweep(neck, [0.16, 0.12], {
    color: stripePaint,
    section: { ngon: 8 },
    name: "striped-eagle-neck",
  });
  b.sweep(tail, (t) => 0.13 * (1 - t) + 0.025, {
    color: stripePaint,
    section: { ngon: 7 },
    caps: "point",
    name: "banded-curled-tail",
  });

  const skull = b.part(
    new THREE.SphereGeometry(0.23, 10, 7),
    ORANGE,
    { bone: head, at: [0, 1.53, 0.91], scale: [0.9, 1.0, 1.2], flat: true, name: "eagle-skull" },
  );
  const brow = b.part(
    new THREE.SphereGeometry(0.16, 8, 6),
    CREAM,
    { bone: head, at: [0, 1.48, 1.08], scale: [1.05, 0.78, 0.72], flat: true, name: "cream-face-mask" },
  );

  // Eagle beak, separate upper and lower jaw for animation.
  b.part(
    new THREE.ConeGeometry(0.105, 0.3, 5),
    GOLD,
    { bone: head, at: [0, 1.51, 1.28], dir: [0, -0.1, 1], axis: "z", rotation: [0, 0, 180], name: "hooked-upper-beak" },
  );
  b.part(
    new THREE.ConeGeometry(0.075, 0.18, 5),
    RED,
    { bone: jaw, at: [0, 1.4, 1.24], dir: [0, 0.12, 1], axis: "z", name: "lower-beak" },
  );

  // Broad painted ears and crown feathers.
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.16, 0.02],
        [0.13, 0.21],
        [0.03, 0.3],
        [-0.02, 0.12],
      ],
      {
        at: [s * 0.17, 1.63, 0.83],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.012,
        color: MAGENTA,
        bone: head,
        name: `painted-ear-${s}`,
      },
    );
  }

  const crestTex = svg(
    `<svg viewBox="0 0 32 80"><path d="M16 78 L3 50 L12 53 L5 22 L16 35 L27 5 L25 42 L32 35 L23 58 L29 57 Z" fill="#fff"/></svg>`,
    { size: 128 },
  );
  b.cards(
    [
      frame([0, 1.67, 0.79], [0, 1, 0]),
      frame([-0.07, 1.66, 0.82], [0, 1, 0]),
      frame([0.07, 1.66, 0.82], [0, 1, 0]),
    ],
    crestTex,
    { size: [0.12, 0.3], lean: 8, bend: 12, cross: true, color: RED, sink: 0.08 },
  );

  // Huge expressive eyes.
  const eyeTex = animeEye({ iris: "#32e6d0", blush: "#ff6b91", size: 256 });
  const faceSurface = b.surface([skull, brow]);
  for (const s of [-1, 1]) {
    const hit = faceSurface.around([0, 1.53, 0.91]).at(s * 35, 6);
    if (hit) {
      b.decal(faceSurface, eyeTex, {
        at: hit,
        size: [0.105, 0.14],
        mirror: s > 0,
        lift: 0.006,
        name: `huge-eye-${s}`,
      });
    }
  }

  // Four sturdy jaguar legs, planted on the floor.
  const legTargets = [
    [-0.19, 0.2, 0.38],
    [0.19, 0.2, 0.38],
    [-0.2, 0.2, -0.3],
    [0.2, 0.2, -0.3],
  ] as const;
  const roots = [
    [-0.16, 1.0, 0.42],
    [0.16, 1.0, 0.42],
    [-0.16, 0.91, -0.2],
    [0.16, 0.91, -0.2],
  ] as const;
  for (let i = 0; i < 4; i++) {
    const s = roots[i][0] > 0 ? 1 : -1;
    const pts = limb(roots[i], legTargets[i], [0.3, 0.3, 0.28], [
      [0, 0, s],
      [0, 0, -s],
    ]);
    const chain = b.chain(["legFL", "legFR", "legHL", "legHR"][i], pts, {
      parent: spine.joints[Math.min(2, spine.joints.length - 1)],
      names: [`hip${i}`, `knee${i}`, `ankle${i}`, `paw${i}`],
      role: "leg",
      contact: legTargets[i],
    });
    b.sweep(chain, (t) => 0.075 - t * 0.022, {
      color: coat,
      section: { ngon: 6 },
      name: `chunky-leg-${i}`,
    });
    b.part(
      new THREE.SphereGeometry(0.085, 7, 5),
      CREAM,
      {
        bone: chain.joints[chain.joints.length - 1],
        at: legTargets[i],
        scale: [1.15, 0.55, 1.25],
        flat: true,
        name: `paw-${i}`,
      },
    );
    for (let toe = -1; toe <= 1; toe++) {
      b.spike(
        [legTargets[i][0] + toe * 0.035, 0.19, legTargets[i][2] + 0.035],
        [0, -0.12, 1],
        0.09,
        0.018,
        { color: INKWOOD, name: `claw-${i}-${toe}` },
      );
    }
  }

  // Eagle wings: articulated spars and bright membranes.
  for (const s of [-1, 1]) {
    const shoulder = [s * 0.16, 1.18, 0.48] as [number, number, number];
    const wrist = [s * 0.63, 1.48, 0.28] as [number, number, number];
    const tip = [s * 1.02, 1.42, -0.02] as [number, number, number];
    const wing = b.chain(
      `wing${s > 0 ? "L" : "R"}`,
      catmull([shoulder, [s * 0.38, 1.36, 0.4], wrist, tip]),
      {
        parent: spine.joints[2],
        names: [`shoulder${s}`, `elbow${s}`, `wrist${s}`, `wingTip${s}`],
        role: "wing",
      },
    );
    const bone = b.sweep(wing, [0.085, 0.035], {
      color: PURPLE,
      section: { ngon: 6 },
      name: `wing-bone-${s}`,
    });
    const outer = b.chain(
      `wingFeathers${s > 0 ? "L" : "R"}`,
      polyline([wrist, [s * 0.8, 1.25, -0.12], [s * 1.06, 1.11, -0.3]]),
      { parent: wing.tip, names: [`featherRoot${s}`, `featherTip${s}`], role: "fan" },
    );
    b.membrane(
      wing,
      outer,
      { color: TURQUOISE, thickness: 0.018, rows: 4, cols: 7, scallop: 0.16, name: `turquoise-wing-${s}` },
    );
    const featherFrames = b.along(outer, 6, () => {}, { from: 0.05, to: 1 });
    b.cards(featherFrames, crestTex, {
      size: [0.11, 0.42],
      lean: 62,
      bend: 18,
      vary: 0.22,
      color: s > 0 ? GOLD : ORANGE,
      rng: rng(40 + s),
      flow: [0, -0.35, -1],
      sink: 0.08,
    });
    // bright wing-edge quills
    b.along(outer, 5, (at) =>
      b.spike(at, at, 0.2, 0.025, { color: GOLD, name: `gold-wing-quill-${s}` }),
    );
  }

  // Painted collar, rosettes, and a cheek ornament.
  const collar = b.surface(neckTube).loop(neck.joints[0], { lift: 0.012 });
  b.sweep(collar, 0.026, { color: GOLD, name: "golden-collar" });
  for (const s of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(0.055, 8, 5),
      MAGENTA,
      { bone: head, at: [s * 0.19, 1.45, 1.03], flat: true, name: `cheek-rosette-${s}` },
    );
    b.part(
      new THREE.SphereGeometry(0.022, 6, 4),
      GOLD,
      { bone: head, at: [s * 0.19, 1.45, 1.085], flat: true, name: `cheek-gem-${s}` },
    );
  }

  // Tail tip ornament: a compact alebrije flame.
  b.extrude(
    [
      [0, 0],
      [0.13, 0.03],
      [0.1, 0.18],
      [0.03, 0.36],
      [-0.02, 0.2],
    ],
    {
      at: tail.at(1),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.01,
      color: GOLD,
      bone: tail.joints[tail.joints.length - 1],
      name: "flame-tail-tip",
    },
  );

  return b.root;
}
