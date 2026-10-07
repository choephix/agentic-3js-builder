```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  frame,
  grain,
  mix,
  mottle,
  noise,
  paint,
  polyline,
  rng,
  smoothstep,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Red panda on a mossy branch",
  description:
    "A delighted red panda balancing on a mossy branch, a bamboo shoot in one paw and its ringed tail raised for balance.",
};

// Palette
const RUST = "#b4522d";
const RUST_DEEP = "#8a3b21";
const RUST_HEAD = "#97401f";
const BLACK = "#1e1714";
const BLACK_DEEP = "#2d2420";
const CREAM = "#f4e7cf";
const GINGER = "#e2873c";
const TEAR = "#b33a24";
const NOSE = "#15100d";
const MOUTH = "#2a1310";
const TONGUE = "#e8838c";
const WHISKER = "#2b211d";
const MOSS_DARK = "#3c6327";
const MOSS = "#6f9a3a";
const MOSS_LIGHT = "#9cbc57";
const BARK_A = "#6f4d35";
const BARK_B = "#4a3323";
const STONE_A = "#8a8377";
const STONE_B = "#625b50";
const BAMBOO = "#9fbf57";
const BAMBOO_LIGHT = "#cbdb8c";
const SHEATH = "#7b5e3f";
const SHEATH_DARK = "#4f3a27";

// Paints: colour as a function of place on the surface.
const coat = mottle(RUST, RUST_DEEP, { size: 0.025, seed: 4, contrast: 1.2 });
const furBlack = mottle(BLACK, BLACK_DEEP, { size: 0.018, seed: 9 });
const headCoat = mottle(RUST, RUST_HEAD, { size: 0.02, seed: 13, contrast: 1.1 });
const stone = mottle(STONE_A, STONE_B, { size: 0.04, seed: 21, contrast: 1.3 });
const rockMoss = mottle(MOSS_DARK, MOSS, { size: 0.02, seed: 5 });
const bark = grain(BARK_A, BARK_B, { size: 0.02, axis: [0, 0, 1], seed: 3 });
const carpet = mottle(MOSS_DARK, MOSS_LIGHT, { size: 0.03, seed: 8, contrast: 1.4 });

// Rusty back, black belly, soft ragged boundary between them.
const bodyPaint = paint((p, n) => {
  const belly = smoothstep(-0.05, -0.34, n.y + (noise(p, 0.05, 2) - 0.5) * 0.35);
  return mix(coat.at(p, n), furBlack.at(p, n), belly);
});

// White round face, happy closed eyes, red tear marks, open laughing mouth.
const headPaint = paint((p, n) => {
  const x = Math.abs(p.x);
  const y = p.y - 0.645;
  const front = smoothstep(-0.01, 0.03, p.z - 0.31);
  let c = headCoat.at(p, n);
  c = mix(c, CREAM, front * smoothstep(1, 0.9, Math.hypot(x / 0.082, (y + 0.016) / 0.074)));
  const dx = x - 0.036;
  const arc = 0.032 - 27 * dx * dx;
  c = mix(c, NOSE, front * smoothstep(0.02, 0.016, Math.abs(dx)) * smoothstep(0.0048, 0.003, Math.abs(y - arc)));
  const tx = 0.017;
  const ty = -0.052;
  const t = Math.min(1, Math.max(0, ((x - 0.047) * tx + (y - 0.012) * ty) / (tx * tx + ty * ty)));
  const d = Math.hypot(x - (0.047 + tx * t), y - (0.012 + ty * t));
  const w = 0.0078 - 0.003 * t;
  c = mix(c, TEAR, front * smoothstep(w + 0.0012, w - 0.0008, d));
  c = mix(c, MOUTH, front * smoothstep(1.06, 0.94, Math.hypot(x / 0.027, (y + 0.063) / 0.02)));
  return mix(c, TONGUE, front * smoothstep(1, 0.8, Math.hypot(x / 0.016, (y + 0.076) / 0.009)));
});

// Mossy stone under the branch: moss wherever the surface faces up.
const rockPaint = paint((p, n) => {
  const cover = smoothstep(0.35, 0.75, n.y + (noise(p, 0.05, 31) - 0.5) * 0.8);
  return mix(stone.at(p, n), rockMoss.at(p, n), cover);
});

// Bark along the branch, moss carpet on its upper side.
const branchPaint = paint((p, n) => {
  const cover = smoothstep(0.45, 0.85, n.y + (noise(p, 0.07, 12) - 0.5) * 0.9);
  return mix(bark.at(p, n), carpet.at(p, n), cover);
});

// Bamboo shoot: sheath at the base, green stalk, pale nodes.
const shootPaint = paint((p, n, s) => {
  const h = s[0];
  const node = [0.085, 0.16, 0.235].some((v) => Math.abs(h - v) < 0.007) ? 1 : 0;
  const sheath = smoothstep(0.09, 0.07, h);
  const stalk = mix(BAMBOO, BAMBOO_LIGHT, noise(p, 0.03, 4));
  const stalkNodes = mix(stalk, CREAM, node * 0.85);
  return mix(stalkNodes, mix(SHEATH, SHEATH_DARK, noise(p, 0.02, 6)), sheath);
});

// Leaf and moss drawings for cards.
const leaf = svg(
  `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
     <path d="M20 0 C35 26 36 72 20 100 C4 72 5 26 20 0 Z" fill="#86b04a"/>
     <path d="M20 6 L20 94" stroke="#d2e28f" stroke-width="2.4" fill="none" stroke-linecap="round"/>
   </svg>`,
  { size: 128 },
);

const moss = svg(
  `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
     <path d="M3 48 C5 30 9 13 13 3 C16 19 18 33 19 48 Z" fill="#4f7e2e"/>
     <path d="M15 48 C19 26 25 9 31 1 C33 19 34 33 36 48 Z" fill="#7aab45"/>
     <path d="M29 48 C32 30 39 16 47 9 C47 26 49 37 51 48 Z" fill="#43702a"/>
     <path d="M43 48 C45 35 49 27 58 22 C56 34 58 41 61 48 Z" fill="#6c9d3c"/>
   </svg>`,
  { size: 128 },
);

export default function redPanda() {
  const b = createBuilder({ name: "red-panda", detail: 1, paintSize: 2048 });

  // ---- Skeleton -------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.47, -0.16], aim: [0, 0.5, 0.02], role: "spine" });
  const waist = b.joint("waist", { parent: hips, at: [0, 0.5, 0.02], aim: [0, 0.53, 0.16], role: "spine" });
  const chest = b.joint("chest", { parent: waist, at: [0, 0.53, 0.16], aim: [0, 0.58, 0.25], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.58, 0.25], aim: [0, 0.645, 0.31], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.645, 0.31], aim: [0, 0.7, 0.36], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.58, 0.28], aim: [0, 0.55, 0.37], role: "jaw" });

  // Chains for limbs and tail. Hind legs crouch with the feet flat on the branch.
  const hindL = b.chain(
    "hindLegL",
    polyline([
      [0.075, 0.46, -0.15],
      [0.08, 0.37, -0.07],
      [0.05, 0.33, -0.04],
      [0.045, 0.335, 0.03],
    ]),
    { parent: hips, role: "leg", names: ["hipL", "kneeL", "ankleL", "toeL"] },
  );
  const hindR = b.chain(
    "hindLegR",
    polyline([
      [-0.075, 0.46, -0.15],
      [-0.08, 0.37, -0.07],
      [-0.05, 0.33, -0.04],
      [-0.045, 0.335, 0.03],
    ]),
    { parent: hips, role: "leg", names: ["hipR", "kneeR", "ankleR", "toeR"] },
  );
  // Left front paw grips the branch; right paw holds the bamboo.
  const foreL = b.chain(
    "foreLegL",
    polyline([
      [0.07, 0.515, 0.13],
      [0.085, 0.43, 0.16],
      [0.06, 0.345, 0.2],
      [0.04, 0.33, 0.235],
    ]),
    { parent: chest, role: "arm", names: ["shoulderL", "elbowL", "wristL", "pawL"] },
  );
  const foreR = b.chain(
    "foreArmR",
    polyline([
      [-0.07, 0.515, 0.13],
      [-0.095, 0.455, 0.2],
      [-0.11, 0.44, 0.28],
      [-0.12, 0.435, 0.32],
    ]),
    { parent: chest, role: "arm", names: ["shoulderR", "elbowR", "wristR", "pawR"] },
  );
  // A big fluffy tail, raised behind for balance.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.46, -0.27],
      [0, 0.42, -0.42],
      [0.02, 0.49, -0.53],
      [0.06, 0.62, -0.56],
      [0.1, 0.72, -0.48],
    ]),
    { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3", "tail4", "tailTip"] },
  );

  // ---- Body -----------------------------------------------------------------
  // One smooth body through the spine joints: rump, haunches, waist, deep chest, neck.
  b.loft(
    [
      { at: [0, 0.47, -0.3], w: 0.15, h: 0.17 },
      { at: [0, 0.47, -0.16], w: 0.22, h: 0.23 },
      { at: [0, 0.5, 0.02], w: 0.2, h: 0.21 },
      { at: [0, 0.53, 0.16], w: 0.23, h: 0.23 },
      { at: [0, 0.58, 0.25], w: 0.15, h: 0.16 },
    ],
    { color: bodyPaint, bone: [hips, waist, chest, neck], sides: 10, name: "body" },
  );

  // Limbs: smooth tubes along their chains.
  b.sweep(hindL, (t: number) => 0.05 - 0.02 * t, { color: furBlack, sides: 8, name: "hindLegL" });
  b.sweep(hindR, (t: number) => 0.05 - 0.02 * t, { color: furBlack, sides: 8, name: "hindLegR" });
  b.sweep(foreL, (t: number) => 0.04 - 0.015 * t, { color: furBlack, sides: 8, name: "foreLegL" });
  b.sweep(foreR, (t: number) => 0.04 - 0.015 * t, { color: furBlack, sides: 8, name: "foreArmR" });

  // Tail: fluffy profile, bold cream and ginger rings.
  b.sweep(tail, (t: number) => 0.045 + 0.045 * Math.sin(Math.PI * (0.1 + 0.8 * t)), {
    color: CREAM,
    sides: 10,
    name: "tail",
    bands: [
      [0.12, RUST],
      [0.25, CREAM],
      [0.38, GINGER],
      [0.51, CREAM],
      [0.64, GINGER],
      [0.77, CREAM],
      [0.9, GINGER],
      [1, CREAM],
    ],
  });

  // ---- Head -----------------------------------------------------------------
  b.part(new THREE.SphereGeometry(0.1, b.segments(16), b.segments(12)), headPaint, {
    bone: head,
    at: [0, 0.645, 0.31],
    scale: [1, 0.97, 0.98],
    name: "head",
  });

  // Ears: a cream rim behind a red front, both pointed and rounded.
  for (const side of [1, -1]) {
    const at = new THREE.Vector3(side * 0.064, 0.712, 0.27);
    const across = new THREE.Vector3(0, 0, 1);
    const up = new THREE.Vector3(side * 0.32, 1, -0.22).normalize();
    b.extrude(
      [
        [-0.036, -0.02],
        [0.036, -0.02],
        [0.03, 0.04],
        [0, 0.088],
        [-0.03, 0.04],
      ],
      { color: CREAM, at, x: across, y: up, thickness: 0.008, bevel: 0.003, bone: head, name: "earRim" },
    );
    b.extrude(
      [
        [-0.026, 0],
        [0.026, 0],
        [0.023, 0.034],
        [0, 0.074],
        [-0.023, 0.034],
      ],
      {
        color: RUST,
        at: at.clone().add(new THREE.Vector3(side * 0.006, 0, 0)),
        x: across,
        y: up,
        thickness: 0.008,
        bevel: 0.003,
        bone: head,
        name: "ear",
      },
    );
  }

  // Black nose at the tip of the face.
  b.part(new THREE.SphereGeometry(0.02, 10, 8), NOSE, {
    bone: head,
    at: [0, 0.628, 0.404],
    scale: [1.35, 0.8, 0.8],
    name: "nose",
  });

  // Lower jaw, hinged and open under the mouth.
  b.part(new THREE.SphereGeometry(0.035, 12, 8), CREAM, {
    bone: jaw,
    at: [0, 0.545, 0.36],
    scale: [1.25, 0.55, 1.15],
    name: "lowerJaw",
  });

  // Whiskers.
  const center = new THREE.Vector3(0, 0.645, 0.31);
  for (const side of [1, -1])
    for (const [x, y, z] of [
      [0.5, -0.15, 0.85],
      [0.55, -0.34, 0.76],
    ]) {
      const dir = new THREE.Vector3(side * x, y, z).normalize();
      b.rod(
        center.clone().addScaledVector(dir, 0.085),
        center.clone().addScaledVector(dir, 0.2),
        [0.0028, 0.0008],
        { color: WHISKER, bone: head, name: "whisker" },
      );
    }

  // Black paws and feet.
  b.part(new THREE.SphereGeometry(0.03, 10, 8), BLACK, {
    bone: "pawR",
    at: [-0.115, 0.435, 0.3],
    scale: [1, 0.9, 1.1],
    name: "pawHolding",
  });
  b.part(new THREE.SphereGeometry(0.03, 10, 8), BLACK, {
    bone: "pawL",
    at: [0.04, 0.322, 0.235],
    scale: [1.3, 0.6, 1.4],
    name: "pawGripping",
  });
  b.part(new THREE.SphereGeometry(0.03, 10, 8), BLACK, {
    bone: "toeL",
    at: [0.045, 0.335, 0.03],
    scale: [1.2, 0.6, 1.4],
    name: "footL",
  });
  b.part(new THREE.SphereGeometry(0.03, 10, 8), BLACK, {
    bone: "toeR",
    at: [-0.045, 0.335, 0.03],
    scale: [1.2, 0.6, 1.4],
    name: "footR",
  });

  // ---- Bamboo shoot in the right paw ----------------------------------------
  const grip = new THREE.Vector3(-0.115, 0.43, 0.3);
  const stalkDir = new THREE.Vector3(-0.3, 1, 0.45).normalize();
  b.lathe(
    [
      [0, 0],
      [0.026, 0],
      [0.032, 0.04],
      [0.029, 0.12],
      [0.02, 0.2],
      [0.009, 0.25],
      [0, 0.28],
    ],
    { color: shootPaint, at: grip, axis: stalkDir, bone: "pawR", name: "bamboo" },
  );
  const leafAt = grip.clone().addScaledVector(stalkDir, 0.2);
  b.cards(
    [frame(leafAt, [-0.6, 0.6, 0.4]), frame(leafAt, [-0.2, 0.7, 0.7]), frame(leafAt, [0.1, 0.8, 0.4])],
    leaf,
    { size: [0.05, 0.16], bone: "pawR", color: "#ffffff", name: "bambooLeaf" },
  );

  // ---- Scenery: a mossy stone under a mossy branch --------------------------
  b.lathe(
    [
      [0, 0],
      [0.13, 0],
      [0.15, 0.035],
      [0.14, 0.11],
      [0.1, 0.18],
      [0.05, 0.225],
      [0, 0.24],
    ],
    { color: rockPaint, at: [0, 0, -0.12], axis: [0, 1, 0], segments: 9, bone: root, name: "rock" },
  );

  const branch = b.sweep(
    catmull([
      [0.03, 0.245, -0.66],
      [0.01, 0.262, -0.3],
      [0, 0.268, 0],
      [-0.005, 0.265, 0.3],
      [-0.03, 0.248, 0.66],
    ]),
    { radius: (t: number) => 0.068 - 0.03 * t, color: branchPaint, sides: 9, bone: root, name: "branch" },
  );

  // A small twig on the branch.
  b.rod([-0.01, 0.27, 0.44], [-0.09, 0.36, 0.5], [0.022, 0.008], {
    color: branchPaint,
    bone: root,
    name: "twig",
  });

  // Moss tufts along the branch ends, clear of the panda.
  const tufts = b.surface(branch).scatter(14, {
    rng: rng(7),
    minDist: 0.06,
    filter: (hit) => hit.n.y > 0.5,
    keepOut: (p) => p.z > -0.6 && p.z < 0.34,
  });
  b.cards(tufts, moss, {
    size: [0.075, 0.055],
    cross: true,
    lean: 8,
    vary: 0.25,
    rng: rng(9),
    color: "#ffffff",
    name: "moss",
  });

  return b.root;
}
```