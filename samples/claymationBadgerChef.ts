import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { grain, mottle, spots } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Claymation Badger Chef",
  description: "Grumpy stop-motion badger chef with striped jaw, crumpled hat, stained apron, spoon and copper pot.",
};

const CREAM = "#f2ede2";
const WHITE = "#faf6ec";
const BLACK = "#23211f";
const MUZZLE = "#e8e2d4";
const NOSE = "#1c1a19";
const APRON_DARK = "#2f5f52";
const SHIRT = "#e8e4da";
const HAT = "#f7f3e8";
const WOOD = "#a9743c";
const WOOD_DARK = "#7d5227";
const COPPER = "#b5652a";
const COPPER_DARK = "#7e3f16";
const CHEEK = "#c9c2b8";
const TONGUE = "#b06a6a";

export default function build() {
  const b = createBuilder({ name: "claymationBadgerChef" });

  const clayWhite = mottle(WHITE, "#e9e2d2", { size: 0.045, contrast: 0.5, seed: 5 });
  const clayBlack = mottle(BLACK, "#3a3532", { size: 0.04, contrast: 0.55, seed: 9 });
  const clayCream = mottle(CREAM, "#ddd3bd", { size: 0.05, contrast: 0.5, seed: 3 });
  const skinGrey = mottle("#5b5651", "#4a4541", { size: 0.05, contrast: 0.5, seed: 7 });
  const hatPaint = mottle(HAT, "#e4dcc8", { size: 0.06, contrast: 0.5, seed: 13 });
  const shirtPaint = mottle(SHIRT, "#d5cfbf", { size: 0.05, contrast: 0.45, seed: 17 });
  const woodPaint = grain(WOOD, WOOD_DARK, { size: 0.02, axis: "y", seed: 21 });
  const copperPaint = spots(COPPER, COPPER_DARK, { size: 0.05, amount: 0.45, seed: 23 });
  const apronBase = spots("#3f7d6b", "#d8d2c0", { size: 0.035, amount: 0.22, seed: 29 });
  const stainExtra = spots(apronBase, "#6b4a26", { size: 0.05, amount: 0.18, seed: 31 });

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.46, 0] });
  const spinePts = catmull([
    [0, 0.46, 0],
    [0, 0.55, 0.01],
    [0, 0.64, 0.02],
    [0, 0.72, 0.03],
  ]);
  const spine = b.chain("spine", spinePts, {
    parent: hips,
    count: 3,
    names: ["spine", "chest", "neckBase"],
    role: "spine",
  });
  const neckBase = spine.joints[2];
  const neck = b.joint("neck", {
    parent: neckBase,
    at: [0, 0.72, 0.03],
    dir: [0, 0.6, 0.35],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.8, 0.08],
    dir: [0, 0.25, 1],
    role: "head",
    group: "head",
  });
  // Head bone aims forward: local axes are [right, forward, up].
  const hp = head.local.bind(head);
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp([0, 0.05, -0.055]),
    aim: hp([0, 0.32, -0.06]),
    role: "jaw",
    group: "head",
  });
  const jp = jaw.local.bind(jaw);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipP = new THREE.Vector3(s * 0.1, 0.46, 0);
    const pts = limb(hipP, [s * 0.12, 0.055, 0.02], [0.23, 0.21], [[0, 0, 1]]);
    b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.12, 0, 0.02],
    });
  }
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = new THREE.Vector3(s * 0.18, 0.63, 0.03);
    const pts = limb(sh, [s * 0.38, 0.46, 0.15], [0.18, 0.16], [[0, -0.4, 0.8]]);
    b.chain(`arm${side}`, pts, {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
  }
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.46, -0.12],
      [0, 0.41, -0.19],
      [0, 0.38, -0.23],
    ]),
    { parent: hips, count: 2, names: ["tail1", "tail2"], role: "tail" },
  );

  // ---- torso ----
  const bellyPath = catmull([
    [0, 0.37, -0.02],
    [0, 0.49, 0.0],
    [0, 0.61, 0.03],
    [0, 0.7, 0.04],
  ]);
  const belly = b.sweep(bellyPath, (t) => 0.17 - 0.025 * Math.sin(t * Math.PI) + 0.015 * t, {
    bone: [hips, spine.joints[0], spine.joints[1], spine.joints[2]],
    color: shirtPaint,
    shift: (t) => [0, -0.02 - 0.04 * Math.sin(t * Math.PI)],
    sides: 12,
  });
  b.part(new THREE.SphereGeometry(0.145, 14, 10), shirtPaint, {
    bone: spine.joints[0],
    at: [0, 0.52, 0.1],
    scale: [1.0, 1.0, 0.8],
  });
  const collarLoop = b.surface(belly).loop(neckBase, { dir: [0, 1, 0], lift: 0.008 });
  b.sweep(collarLoop, 0.032, { color: clayCream });
  // neck ruff fills the head-torso gap at the sides/back
  b.part(new THREE.SphereGeometry(0.075, 10, 8), clayWhite, {
    bone: neck,
    at: [0, 0.73, -0.01],
    scale: [1.3, 0.7, 1.1],
  });
  // ---- apron (rides proud of the belly so it reads) ----
  const apronBib = b.extrude(
    [
      [-0.1, 0],
      [0.1, 0],
      [0.12, 0.15, "sharp"],
      [0.075, 0.28],
      [-0.075, 0.28],
      [-0.12, 0.15, "sharp"],
    ],
    {
      at: [0, 0.36, 0.225],
      x: [1, 0, 0],
      thickness: 0.018,
      bevel: 0.005,
      smoothing: 1,
      color: stainExtra,
      bone: spine.joints[0],
    },
  );
  b.extrude(
    [
      [-0.055, 0],
      [0.055, 0],
      [0.045, 0.065],
      [-0.045, 0.065],
    ],
    {
      at: [0.02, 0.41, 0.238],
      x: [1, 0, 0],
      thickness: 0.012,
      smoothing: 1,
      color: APRON_DARK,
      bone: spine.joints[0],
    },
  );
  const stainTex = svg(
    `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="36" rx="16" ry="20" fill="#6b4a26" opacity="0.85"/><ellipse cx="26" cy="30" rx="6" ry="8" fill="#8a5f30" opacity="0.9"/></svg>`,
    { size: 128 },
  );
  b.decal(apronBib, stainTex, {
    at: [-0.04, 0.49, 0.25],
    dir: [0, -0.15, -1],
    size: [0.065, 0.085],
  });
  for (const s of [1, -1]) {
    b.rod([s * 0.062, 0.64, 0.2], [s * 0.09, 0.72, 0.0], 0.011, { color: APRON_DARK });
  }
  const waistLoop = b.surface(belly).loop([0, 0.44, 0.02], { dir: [0, 1, 0], lift: 0.012 });
  b.sweep(waistLoop.slice(0.15, 0.85), 0.013, { color: APRON_DARK });
  b.part(new THREE.SphereGeometry(0.028, 8, 6), APRON_DARK, {
    bone: hips,
    at: [0, 0.46, -0.19],
    scale: [1.2, 0.8, 0.7],
  });

  // ---- badger head (hp args: [right, forward, up]) ----
  const skull = b.part(new THREE.SphereGeometry(0.105, 14, 10), clayWhite, {
    bone: head,
    at: hp([0, 0.045, 0.02]),
    scale: [1.0, 0.95, 0.92],
  });
  b.part(new THREE.SphereGeometry(0.107, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.42), clayBlack, {
    bone: head,
    at: hp([0, 0.018, 0.032]),
    rotation: [8, 0, 0],
  });
  for (const s of [1, -1]) {
    const stripe = catmull([
      hp([s * 0.038, 0.108, 0.064]),
      hp([s * 0.052, 0.14, 0.028]),
      hp([s * 0.046, 0.164, -0.004]),
    ]);
    b.sweep(stripe, [0.026, 0.016], { bone: head, color: clayBlack, sides: 8 });
  }
  b.sweep(catmull([hp([0, 0.115, 0.073]), hp([0, 0.16, 0.028]), hp([0, 0.175, 0.0])]), [0.024, 0.018], {
    bone: head,
    color: clayWhite,
    sides: 8,
  });
  b.part(new THREE.SphereGeometry(0.057, 12, 8), mottle(MUZZLE, "#d3ccb9", { size: 0.03, contrast: 0.4, seed: 41 }), {
    bone: head,
    at: hp([0, 0.14, -0.016]),
    scale: [1.15, 0.9, 0.75],
  });
  b.part(new THREE.SphereGeometry(0.026, 10, 8), NOSE, {
    bone: head,
    at: hp([0, 0.184, -0.002]),
    scale: [1.3, 0.7, 0.8],
  });
  for (const s of [1, -1]) {
    const eyeAt = hp([s * 0.05, 0.136, 0.036]);
    b.part(new THREE.SphereGeometry(0.02, 9, 7), "#14100e", { bone: head, at: eyeAt });
    b.part(new THREE.SphereGeometry(0.005, 6, 4), WHITE, {
      bone: head,
      at: [eyeAt.x + s * 0.004, eyeAt.y + 0.011, eyeAt.z + 0.006],
    });
    b.part(new THREE.SphereGeometry(0.02, 8, 6), clayWhite, {
      bone: head,
      at: hp([s * 0.054, 0.13, 0.062]),
      scale: [1.15, 0.9, 0.45],
      rotation: [0, 0, s * -18],
    });
    b.part(new THREE.SphereGeometry(0.017, 7, 5), clayBlack, {
      bone: head,
      at: hp([s * 0.055, 0.121, 0.075]),
      scale: [1.4, 0.9, 0.6],
      rotation: [0, 0, s * -20],
    });
    // jowl: low and wide so it reads as cheek, not ear
    b.part(new THREE.SphereGeometry(0.04, 9, 7), mottle(CHEEK, "#b5ad9c", { size: 0.03, contrast: 0.4, seed: 43 }), {
      bone: head,
      at: hp([s * 0.098, 0.05, -0.045]),
      scale: [0.65, 1.0, 0.9],
    });
    b.part(new THREE.SphereGeometry(0.03, 9, 7), clayWhite, {
      bone: head,
      at: hp([s * 0.09, -0.005, 0.11]),
      scale: [1.0, 0.55, 1.0],
    });
    b.part(new THREE.SphereGeometry(0.015, 7, 5), skinGrey, {
      bone: head,
      at: hp([s * 0.09, 0.012, 0.105]),
      scale: [1.0, 0.5, 1.0],
    });
    b.part(
      new THREE.SphereGeometry(0.026, 8, 6),
      mottle("#cfc8b8", "#b5ad9c", { size: 0.02, contrast: 0.4, seed: 83 }),
      {
        bone: head,
        at: hp([s * 0.043, 0.17, -0.033]),
        scale: [1.5, 0.7, 0.5],
        rotation: [0, 0, s * -15],
      },
    );
    b.rod(hp([s * 0.014, 0.156, 0.06]), hp([s * 0.024, 0.14, 0.086]), 0.005, { color: "#4a4541" });
  }
  // lower jaw: separate, nearly closed grumble
  b.part(new THREE.SphereGeometry(0.056, 12, 8), clayWhite, {
    bone: jaw,
    at: jp([0, 0.1, -0.018]),
    scale: [1.0, 1.1, 0.5],
  });
  b.part(new THREE.SphereGeometry(0.019, 8, 6), TONGUE, {
    bone: jaw,
    at: jp([0, 0.112, 0.0]),
    scale: [1.0, 1.2, 0.35],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.008, 0.018, 6), WHITE, {
      bone: jaw,
      at: jp([s * 0.02, 0.132, 0.008]),
    });
  }
  b.pose(jaw, { axis: [1, 0, 0], deg: 4 });

  // ---- chef hat: brim + sagging puff ----
  b.lathe(
    [
      [0.001, 0],
      [0.108, 0],
      [0.113, 0.045],
      [0.108, 0.08],
      [0.001, 0.08],
    ],
    { at: hp([0, -0.018, 0.1]), bone: head, segments: 14, smoothing: 1, color: hatPaint },
  );
  b.part(new THREE.SphereGeometry(0.105, 14, 10), hatPaint, {
    bone: head,
    at: hp([0, -0.02, 0.215]),
    scale: [1.0, 1.0, 0.92],
  });
  const blobR = rng(55);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + blobR() * 0.5;
    const rr = 0.068 + blobR() * 0.025;
    b.part(new THREE.SphereGeometry(0.036 + blobR() * 0.014, 8, 6), hatPaint, {
      bone: head,
      at: hp([Math.cos(a) * rr, Math.sin(a) * rr * 0.3 - 0.02, 0.19 + blobR() * 0.06]),
    });
  }
  b.part(new THREE.SphereGeometry(0.062, 10, 8), hatPaint, {
    bone: head,
    at: hp([0.012, -0.032, 0.265]),
    scale: [1.1, 1.1, 0.55],
  });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    b.capsule(
      hp([Math.cos(a) * 0.078, Math.sin(a) * 0.078, 0.108]),
      hp([Math.cos(a) * 0.082, Math.sin(a) * 0.082, 0.152]),
      0.009,
      {
        color: hatPaint,
      },
    );
  }

  // ---- arms / paws / cuffs ----
  for (const s of [1, -1]) {
    b.sweep(
      polyline([
        [s * 0.18, 0.63, 0.03],
        [s * 0.3, 0.54, 0.09],
        [s * 0.38, 0.46, 0.15],
      ]),
      [0.052, 0.042],
      { color: shirtPaint, sides: 9 },
    );
    b.part(new THREE.SphereGeometry(0.052, 10, 8), skinGrey, {
      at: [s * 0.39, 0.44, 0.165],
      scale: [1.0, 1.15, 1.0],
    });
    b.sweep(
      polyline([
        [s * 0.325, 0.515, 0.11],
        [s * 0.35, 0.49, 0.13],
      ]),
      0.055,
      { color: clayCream, sides: 9, caps: "flat" },
    );
  }
  // ---- legs / shoes ----
  for (const s of [1, -1]) {
    b.sweep(
      polyline([
        [s * 0.1, 0.44, 0],
        [s * 0.11, 0.25, 0.01],
        [s * 0.12, 0.08, 0.02],
      ]),
      [0.07, 0.056],
      { color: skinGrey, sides: 9 },
    );
    b.part(
      new THREE.SphereGeometry(0.07, 10, 8),
      mottle("#3a332e", "#2c2724", { size: 0.03, contrast: 0.4, seed: 61 }),
      { at: [s * 0.12, 0.048, 0.055], scale: [0.9, 0.62, 1.4] },
    );
    b.rod([s * 0.12, 0.038, 0.12], [s * 0.12, 0.038, 0.02], 0.007, { color: "#241f1c" });
  }
  b.sweep(tail, [0.05, 0.028], { color: clayWhite, sides: 8 });
  b.part(new THREE.SphereGeometry(0.042, 8, 6), clayWhite, {
    bone: tail.joints[1],
    at: [0, 0.375, -0.235],
  });

  // ---- props: spoon (model's right = -X) and copper pot (left = +X) ----
  const spoonTip = new THREE.Vector3(-0.4, 0.56, 0.28);
  b.rod(new THREE.Vector3(-0.39, 0.44, 0.165), spoonTip, 0.013, { color: woodPaint });
  b.part(new THREE.SphereGeometry(0.042, 10, 8), woodPaint, {
    at: spoonTip,
    scale: [1.0, 0.45, 1.35],
  });
  b.part(
    new THREE.SphereGeometry(0.026, 8, 6),
    mottle("#c98f4e", "#a9743c", { size: 0.015, contrast: 0.4, seed: 71 }),
    { at: [spoonTip.x, spoonTip.y + 0.013, spoonTip.z + 0.008], scale: [0.8, 0.3, 1.0] },
  );
  const potC: [number, number, number] = [0.4, 0.36, 0.18];
  b.lathe(
    [
      [0.001, 0],
      [0.07, 0],
      [0.08, 0.018],
      [0.085, 0.09],
      [0.09, 0.11],
      [0.085, 0.11],
      [0.08, 0.09],
      [0.075, 0.018],
      [0.001, 0.018],
    ],
    { at: potC, segments: 12, smoothing: 0, color: copperPaint },
  );
  const dents: ReadonlyArray<readonly [number, number, number]> = [
    [0.075, 0.055, 0.035],
    [-0.065, 0.07, 0.045],
    [0.02, 0.045, -0.08],
  ];
  for (const d of dents) {
    b.part(new THREE.SphereGeometry(0.02, 7, 5), COPPER_DARK, {
      at: [potC[0] + d[0], potC[1] + d[1], potC[2] + d[2]],
      scale: [1, 0.7, 1],
    });
  }
  b.part(new THREE.CircleGeometry(0.075, 12), mottle("#7a4a1e", "#5e3613", { size: 0.02, contrast: 0.5, seed: 77 }), {
    at: [potC[0], potC[1] + 0.098, potC[2]],
    dir: [0, 1, 0],
    axis: "z",
  });
  b.sweep(
    bezier(
      new THREE.Vector3(potC[0] - 0.085, potC[1] + 0.1, potC[2]),
      new THREE.Vector3(potC[0], potC[1] + 0.185, potC[2] - 0.02),
      new THREE.Vector3(potC[0] + 0.085, potC[1] + 0.1, potC[2]),
    ),
    0.009,
    { color: "#2c2724" },
  );
  // thumbprint dimple decals on the white skull
  const printTex = svg(
    `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="32" rx="18" ry="14" fill="none" stroke="#b9b0a0" stroke-width="4" opacity="0.8"/><ellipse cx="32" cy="32" rx="10" ry="7" fill="none" stroke="#b9b0a0" stroke-width="3" opacity="0.6"/></svg>`,
    { size: 128 },
  );
  b.decal(skull, printTex, { at: [0.09, 0.82, 0.16], dir: [-0.3, 0, -1], size: [0.045, 0.035] });
  b.decal(skull, printTex, { at: [-0.09, 0.8, 0.15], dir: [0.4, 0, -1], size: [0.04, 0.032] });

  return b.root;
}
