```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  paint,
  spots,
  stripes,
  countershade,
  svg,
} from "agentic-3js-builder";
import { animeEye, cel, furEdge, INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "A vividly painted Oaxacan alebrije: a spotted jaguar body with eagle wings, talons, beak, crest, and a curling feathered tail.",
};

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  const GOLD = cel("#f5a623", "#b94722");
  const GOLD2 = cel("#ffcf45", "#d66a27");
  const ROSE = cel("#e94f91", "#8e245d");
  const TURQUOISE = cel("#18c5bd", "#087d87");
  const BLUE = cel("#3478d4", "#183f93");
  const GREEN = cel("#55bd58", "#187044");
  const PURPLE = cel("#9d50c7", "#4c1f76");
  const CREAM = cel("#ffe7ad", "#c8864c");
  const DARK = "#24152a";
  const BEAK = cel("#ffcf52", "#b65b1d");
  const CLAW = cel("#f7e5b0", "#9d6238");

  const coat = furEdge(
    spots(GOLD, [ROSE, TURQUOISE, PURPLE], {
      size: 0.17,
      amount: 0.62,
      rosette: true,
      seed: 18,
    }),
    CREAM,
    {
      level: -0.16,
      teeth: 0.2,
      period: 0.075,
      along: [0, 0, 1],
      ink: "#6c2631",
      inkWidth: 0.018,
    },
  );

  const featherPaint = stripes(
    cel("#27a9a5", "#12576f"),
    [ROSE, GOLD2, PURPLE],
    { size: 0.16, width: 0.28, wobble: 0.18, seed: 4 },
  );

  // Skeleton first: one rooted spine, then neck, head, jaw, legs, wings, and tail.
  const hips = b.joint("hips", {
    at: [0, 0.82, -0.12],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [-0.0, 0.84, -0.48],
      [0, 0.91, -0.12],
      [0, 0.9, 0.28],
      [0, 0.98, 0.58],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.98, 0.53],
      [0, 1.08, 0.7],
      [0, 1.25, 0.82],
    ]),
    { parent: spine.tip, names: ["neck1", "neck2", "neckTip"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.31, 0.88],
    dir: [0, 0.12, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.25, 1.02],
    dir: [0, -0.22, 0.98],
    role: "jaw",
  });

  const legData = [
    ["legFL", 0.29, 0.38, 0.62, 0.2],
    ["legFR", -0.29, 0.38, 0.62, 0.2],
    ["legHL", 0.27, -0.3, -0.48, 0.2],
    ["legHR", -0.27, -0.3, -0.48, 0.2],
  ] as const;

  const legs: any[] = [];
  for (const [name, x, z, footZ, footY] of legData) {
    const root = [x, 0.87, z] as [number, number, number];
    const target = [x * 1.08, footY + 0.055, footZ] as [number, number, number];
    const pts = limb(root, target, [0.27, 0.25, 0.22], [
      [0, 0, z > 0 ? 1 : -1],
      [0, 0, z > 0 ? -1 : 1],
    ]);
    const chain = b.chain(name, pts, {
      parent: hips,
      names: [`${name}Hip`, `${name}Knee`, `${name}Ankle`, `${name}Paw`],
      role: "leg",
      contact: target,
    });
    legs.push(chain);
  }

  const wingL = b.chain(
    "wingL",
    catmull([
      [0.3, 1.08, 0.38],
      [0.72, 1.3, 0.38],
      [1.18, 1.58, 0.28],
      [1.62, 1.7, 0.1],
    ]),
    { parent: spine.tip, names: ["wingL", "wingL2", "wingL3", "wingLTip"], role: "wing" },
  );
  const wingR = b.chain(
    "wingR",
    catmull([
      [-0.3, 1.08, 0.38],
      [-0.72, 1.3, 0.38],
      [-1.18, 1.58, 0.28],
      [-1.62, 1.7, 0.1],
    ]),
    { parent: spine.tip, names: ["wingR", "wingR2", "wingR3", "wingRTip"], role: "wing" },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.88, -0.52],
      [0, 0.85, -0.92],
      [0.08, 1.02, -1.25],
      [0.22, 1.24, -1.5],
      [0.05, 1.48, -1.62],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tailTip"], role: "tail" },
  );

  // Main sculptural masses.
  const torso = b.sweep(
    catmull([
      [0, 0.83, -0.5],
      [0, 0.91, -0.15],
      [0, 0.92, 0.28],
      [0, 0.98, 0.58],
    ]),
    (t) => 0.24 + 0.08 * Math.sin(Math.PI * t),
    { bone: [hips, ...spine.joints], color: coat, section: { ngon: 8 } },
  );
  b.sweep(neck, [0.19, 0.12], { color: coat, bone: neck, section: { ngon: 7 } });
  b.sweep(tail, (t) => 0.13 * (1 - t) + 0.025, {
    color: coat,
    bone: tail,
    bands: [[0.72, ROSE], [0.88, GOLD2], [1, TURQUOISE]],
    section: { ngon: 7 },
  });

  for (const leg of legs) {
    b.sweep(leg, (t) => 0.095 - t * 0.035, {
      color: coat,
      bone: leg,
      section: { ngon: 6 },
    });
    const paw = leg.tip!;
    b.part(new THREE.SphereGeometry(0.105, 8, 5), CREAM, {
      bone: paw,
      at: paw.at,
      scale: [1.15, 0.55, 1.35],
      name: `${leg.joints[0].name}_paw`,
    });
    for (let i = -1; i <= 1; i++) {
      const toe = b.spike(
        [paw.at.x + i * 0.045, 0.07, paw.at.z + 0.065],
        [0, -0.04, 0.12],
        0.11,
        0.018,
        { color: CLAW, bone: paw },
      );
      void toe;
    }
  }

  // Broad, primitive-built eagle wings with visible feather fingers.
  b.sweep(wingL, [0.16, 0.035], { color: featherPaint, bone: wingL, section: { ngon: 6 } });
  b.sweep(wingR, [0.16, 0.035], { color: featherPaint, bone: wingR, section: { ngon: 6 } });
  b.membrane(wingL, [
    [0.3, 1.08, 0.36],
    [0.52, 1.0, 0.22],
    [0.92, 1.08, 0.0],
    [1.48, 1.45, -0.02],
  ], { color: featherPaint, thickness: 0.018, scallop: 0.16 });
  b.membrane(wingR, [
    [-0.3, 1.08, 0.36],
    [-0.52, 1.0, 0.22],
    [-0.92, 1.08, 0.0],
    [-1.48, 1.45, -0.02],
  ], { color: featherPaint, thickness: 0.018, scallop: 0.16 });

  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const base: [number, number, number] = [
        s * (0.72 + i * 0.17),
        1.34 + i * 0.075,
        0.3 - i * 0.12,
      ];
      const tip: [number, number, number] = [
        s * (1.28 + i * 0.18),
        1.6 + i * 0.11,
        -0.02 - i * 0.16,
      ];
      b.sweep([base, tip], [0.065 - i * 0.007, 0.008], {
        color: [TURQUOISE, ROSE, GOLD2, BLUE, PURPLE][i],
        caps: { start: "round", end: "point" },
        bone: s > 0 ? wingL : wingR,
      });
    }
  }

  // Head, muzzle, eagle beak, and a separate open lower jaw.
  const skull = b.part(new THREE.SphereGeometry(0.24, 12, 8), coat, {
    bone: head,
    at: [0, 1.34, 0.91],
    scale: [1.0, 0.92, 1.12],
    name: "painted_jaguar_skull",
  });
  b.part(new THREE.SphereGeometry(0.14, 10, 7), CREAM, {
    bone: head,
    at: [0, 1.26, 1.105],
    scale: [1.05, 0.7, 0.82],
    name: "cream_muzzle",
  });
  b.part(new THREE.ConeGeometry(0.13, 0.3, 5), BEAK, {
    bone: head,
    at: [0, 1.31, 1.27],
    dir: [0, -0.22, 1],
    name: "golden_eagle_beak",
  });
  b.part(new THREE.BoxGeometry(0.22, 0.07, 0.19), DARK, {
    bone: jaw,
    at: [0, 1.2, 1.14],
    scale: [1, 1, 1.3],
    name: "open_lower_jaw",
  });
  b.part(new THREE.SphereGeometry(0.045, 8, 5), DARK, {
    bone: head,
    at: [0, 1.29, 1.225],
    name: "nose",
  });

  // Large graphic eyes and jaguar ears.
  const EYE = animeEye({ iris: "#20e6cf", irisLight: "#fff4a8", size: 256 });
  const faceSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = faceSurface.around([0, 1.34, 0.91]).at(s * 48, 8);
    if (hit) {
      b.decal(faceSurface, EYE, {
        at: hit,
        size: [0.115, 0.145],
        lift: 0.004,
        mirror: s > 0,
        name: `glowing_eye_${s > 0 ? "L" : "R"}`,
      });
    }
    b.part(new THREE.ConeGeometry(0.12, 0.2, 4), ROSE, {
      bone: head,
      at: [s * 0.15, 1.52, 0.82],
      dir: [s * 0.12, 0.7, -0.08],
      scale: [1, 1, 0.7],
      name: `jaguar_ear_${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.ConeGeometry(0.065, 0.12, 4), CREAM, {
      bone: head,
      at: [s * 0.15, 1.505, 0.84],
      dir: [s * 0.12, 0.7, -0.08],
      name: `ear_inner_${s > 0 ? "L" : "R"}`,
    });
  }

  // Crown of painted feathers and cheek whiskers.
  for (let i = 0; i < 7; i++) {
    const s = i % 2 === 0 ? 1 : -1;
    b.spike(
      [s * (0.035 + i * 0.018), 1.52 + i * 0.012, 0.77],
      [s * 0.08, 0.28 + i * 0.018, -0.08],
      0.22 + i * 0.018,
      0.045,
      { color: [TURQUOISE, ROSE, GOLD2, BLUE][i % 4], bone: head },
    );
  }
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.rod(
        [s * 0.11, 1.27 + i * 0.035, 1.14],
        [s * (0.29 + i * 0.035), 1.28 + i * 0.045, 1.18 + i * 0.045],
        0.009,
        { color: CREAM, bone: head },
      );
    }
  }

  // Decorative alebrije paint bands, collar, tail feathers, and carved-looking studs.
  b.sweep(
    b.surface(torso).loop(spine.joints[1], { lift: 0.008 }),
    0.025,
    { color: ROSE, bone: spine.joints[1], caps: "none" },
  );
  b.along(torso, 8, (at) =>
    b.part(new THREE.SphereGeometry(0.025, 6, 4), GOLD2, {
      at,
      name: "painted_rivet",
    }),
  );
  b.sweep(
    catmull([
      [0.02, 1.44, -1.45],
      [0.22, 1.62, -1.58],
      [0.05, 1.82, -1.65],
    ]),
    [0.09, 0.015],
    { color: TURQUOISE, bone: tail, caps: { end: "point" } },
  );

  // A few bold painted glyphs on the flanks.
  const glyph = svg(
    `<svg viewBox="0 0 64 64">
      <path d="M32 4 L39 24 L59 32 L39 40 L32 60 L25 40 L5 32 L25 24Z"
        fill="#ffd34d" stroke="#32152d" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="32" cy="32" r="7" fill="#1bcac1" stroke="#32152d" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    b.decal(torso, glyph, {
      at: [s * 0.235, 0.94, 0.12],
      dir: [s, 0.08, 0.1],
      up: [0, 1, 0],
      size: [0.19, 0.19],
      lift: 0.006,
      mirror: s < 0,
      name: `alebrije_glyph_${s > 0 ? "L" : "R"}`,
    });
  }

  return b.root;
}
```