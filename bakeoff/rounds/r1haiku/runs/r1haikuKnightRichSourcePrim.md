```ts
import * as THREE from "three";
import { createBuilder, grain, mottle, svg } from "agentic-3js-builder";

export const meta = {
  name: "Battle-worn knight",
  description:
    "A knight in dented plate with a crimson-plumed great helm, gold-etched pauldrons, a blue surcoat bearing a silver griffin, a kite shield and a broadsword, under a torn crimson cape.",
};

// Palette and materials
const GOLD = "#c9a54a";
const CRIMSON = "#8e1b24";
const SILVER = "#e3e8ee";
const LEATHER = "#3a2a1e";
const DARK = "#15171b";

const steel = grain("#b9c1ca", "#5b6571", { size: 0.06, axis: [0.4, 1, 0.1], seed: 4 });
const steelWorn = mottle("#a0a9b3", "#4b545e", { size: 0.09, seed: 9, contrast: 1.4 });
const blade = grain("#d7dde4", "#7b8592", { size: 0.02, axis: [0, 1, 0], seed: 7 });
const blueCloth = mottle("#24498f", "#142a57", { size: 0.25, seed: 2 });
const blueShield = mottle("#2a55a3", "#15305f", { size: 0.18, seed: 11, contrast: 1.3 });
const crimsonCloth = mottle("#9c2028", "#5a0f16", { size: 0.2, seed: 5, contrast: 1.5 });

// Silver griffin on a transparent field: white drawing, tinted silver by the part colour.
const griffin = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g fill="#ffffff">
    <circle cx="44" cy="26" r="7"/>
    <path d="M37 24 L24 28 L37 30 Z"/>
    <path d="M46 19 L55 11 L52 22 Z"/>
    <path d="M44 32 C57 34 67 44 65 58 C63 70 55 75 50 81 L46 72 C38 70 32 62 34 52 C36 42 40 36 44 32 Z"/>
    <path d="M58 40 C78 14 92 18 96 30 C86 28 80 34 74 46 C84 40 86 44 80 58 C76 52 70 52 62 54 Z"/>
    <path d="M46 74 C40 84 33 90 24 94 C33 92 42 92 49 80 Z"/>
    <path d="M36 60 L22 66 L30 70 L39 66 Z"/>
  </g></svg>`,
  { size: 512 },
);

const b = createBuilder({ name: "battle-worn knight", paintSize: 2048 });

// ---------------------------------------------------------------- skeleton
b.joint("hips", { at: [0, 1.0, 0], dir: [0, 1, 0] });
b.joint("chest", { parent: "hips", at: [0, 1.2, 0], dir: [0, 1, 0], role: "spine" });
b.joint("neck", { parent: "chest", at: [0, 1.46, 0], dir: [0, 1, 0], role: "neck" });
b.joint("head", { parent: "neck", at: [0, 1.56, 0], dir: [0, 1, 0], role: "head" });

for (const s of [1, -1]) {
  const k = s > 0 ? "L" : "R";
  const x = (v: number) => v * s;

  // Legs: hip, knee, ankle (tip joint).
  const leg = b.chain(`leg${k}`, [
    [x(0.12), 0.98, 0],
    [x(0.12), 0.5, 0.02],
    [x(0.12), 0.09, 0],
  ], { parent: "hips", names: [`hip${k}`, `knee${k}`, `ankle${k}`], role: "leg" });
  const [hip, knee, ankle] = leg.joints;

  b.capsule(hip, knee, 0.085, { color: steel, sides: 8, name: `cuisse${k}` });
  b.capsule(knee, ankle, [0.085, 0.065], { color: steel, sides: 8, name: `greave${k}` });
  b.part(new THREE.SphereGeometry(0.085, 10, 8), steelWorn, { bone: `knee${k}`, name: `poleyn${k}` });
  b.part(new THREE.BoxGeometry(0.13, 0.1, 0.28), LEATHER, {
    bone: `ankle${k}`,
    at: [x(0.12), 0.06, 0.07],
    name: `boot${k}`,
  });

  // Arms: shoulder, elbow, wrist (tip joint).
  const arm = b.chain(`arm${k}`, [
    [x(0.27), 1.4, 0],
    [x(0.33), 1.14, 0.04],
    [x(0.36), 0.92, 0.14],
  ], { parent: "chest", names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`], role: "arm" });
  const [shoulder, elbow] = arm.joints;

  b.capsule(shoulder, elbow, 0.065, { color: steel, sides: 8, name: `brassard${k}` });
  b.capsule(elbow, arm.joints[2], [0.06, 0.05], { color: steel, sides: 8, name: `vambrace${k}` });
  b.part(new THREE.SphereGeometry(0.075, 10, 8), steelWorn, { bone: `elbow${k}`, name: `couter${k}` });
  b.part(new THREE.BoxGeometry(0.1, 0.12, 0.11), steel, {
    bone: `wrist${k}`,
    at: [x(0.36), 0.9, 0.15],
    name: `gauntlet${k}`,
  });

  // Layered pauldrons etched with gold rims and rivets.
  for (let i = 0; i < 3; i++) {
    const R = 0.135 - i * 0.03;
    b.lathe(
      [
        [0, 0],
        [R, 0],
        [R - 0.01, 0.035],
        [R - 0.035, 0.065],
        [0, 0.08],
      ],
      {
        color: steel,
        at: [x(0.27), 1.4 + i * 0.03, 0],
        bone: `shoulder${k}`,
        segments: 12,
        name: `pauldron${k}${i}`,
      },
    );
  }
  b.part(new THREE.TorusGeometry(0.128, 0.006, 5, 20), GOLD, {
    bone: `shoulder${k}`,
    at: [x(0.27), 1.41, 0],
    rotation: [90, 0, 0],
    name: `filigree${k}`,
  });
  for (let r = 0; r < 4; r++) {
    const a = (r / 4) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, {
      bone: `shoulder${k}`,
      at: [x(0.27) + Math.sin(a) * 0.1 * s, 1.47, Math.cos(a) * 0.1],
      name: `rivet${k}${r}`,
    });
  }
}

// Gorget
b.lathe(
  [
    [0.1, 0],
    [0.11, 0.05],
    [0.09, 0.09],
    [0, 0.09],
  ],
  { color: steel, at: [0, 1.42, 0], bone: "neck", segments: 10, name: "gorget" },
);

// ---------------------------------------------------------------- great helm
b.lathe(
  [
    [0, 0],
    [0.16, 0],
    [0.165, 0.1],
    [0.15, 0.2],
    [0.1, 0.27],
    [0, 0.29],
  ],
  { color: steelWorn, at: [0, 1.6, 0], bone: "head", segments: 12, name: "great-helm" },
);
b.part(new THREE.BoxGeometry(0.2, 0.025, 0.03), DARK, { bone: "head", at: [0, 1.79, 0.157], name: "eye-slit" });
b.part(new THREE.BoxGeometry(0.22, 0.03, 0.045), steel, { bone: "head", at: [0, 1.82, 0.155], name: "brow" });
b.part(new THREE.BoxGeometry(0.024, 0.1, 0.03), steel, { bone: "head", at: [0, 1.7, 0.163], name: "nasal" });
b.part(new THREE.TorusGeometry(0.165, 0.012, 5, 20), GOLD, {
  bone: "head",
  at: [0, 1.61, 0],
  rotation: [90, 0, 0],
  name: "helm-band",
});

// Tall crimson plume, swept back over the crown.
b.extrude(
  [
    [-0.12, 0.0],
    [-0.1, 0.16],
    [-0.05, 0.27],
    [0.01, 0.3],
    [0.04, 0.22],
    [0.02, 0.1],
    [0.08, 0.0],
  ],
  {
    color: crimsonCloth,
    at: [0, 1.84, 0],
    bone: "head",
    thickness: 0.035,
    bevel: 0.01,
    name: "plume",
  },
);

// ---------------------------------------------------------------- torso
// Blue surcoat, flaring from the hem to the shoulders.
b.loft(
  [
    { at: [0, 0.5, 0], w: 0.5, h: 0.3 },
    { at: [0, 0.8, 0], w: 0.44, h: 0.26 },
    { at: [0, 1.05, 0], w: 0.4, h: 0.24 },
    { at: [0, 1.3, 0], w: 0.42, h: 0.24 },
    { at: [0, 1.44, 0], w: 0.3, h: 0.2 },
  ],
  { color: blueCloth, bone: ["hips", "chest"], sides: 12, name: "surcoat" },
);

// Silver griffin on the surcoat skirt.
b.part(new THREE.PlaneGeometry(0.24, 0.26), SILVER, {
  texture: griffin,
  bone: "hips",
  at: [0, 0.8, 0.165],
  name: "surcoat-griffin",
});

// Breastplate over the surcoat, scratched and dented.
b.extrude(
  [
    [-0.18, 0.1],
    [0.18, 0.1],
    [0.19, 0.26],
    [0, 0.3],
    [-0.19, 0.26],
  ],
  { color: steelWorn, at: [0, 1.1, 0.15], x: [1, 0, 0], y: [0, 1, 0], bone: "chest", thickness: 0.05, bevel: 0.015, name: "breastplate" },
);

// Torn crimson cape hanging from the shoulders.
b.membrane(
  [
    [0.24, 1.44, -0.1],
    [0, 1.47, -0.13],
    [-0.24, 1.44, -0.1],
  ],
  [
    [0.3, 0.72, -0.2],
    [0.2, 0.62, -0.2],
    [0.1, 0.7, -0.2],
    [0, 0.58, -0.2],
    [-0.12, 0.68, -0.2],
    [-0.22, 0.6, -0.2],
    [-0.3, 0.72, -0.2],
  ],
  { color: crimsonCloth, thickness: 0.012, bone: "chest", rows: 4, cols: 16, name: "cape" },
);

// ---------------------------------------------------------------- shield (left hand)
b.extrude(
  [
    [-0.17, 0.22],
    [0.17, 0.22],
    [0.17, -0.02],
    [0, -0.3],
    [-0.17, -0.02],
  ],
  { color: blueShield, at: [0.38, 1.1, 0.13], x: [1, 0, 0], y: [0, 1, 0], bone: "wristL", thickness: 0.035, bevel: 0.012, name: "kite-shield" },
);
b.part(new THREE.PlaneGeometry(0.26, 0.26), SILVER, {
  texture: griffin,
  bone: "wristL",
  at: [0.38, 1.07, 0.16],
  name: "shield-griffin",
});
b.part(new THREE.SphereGeometry(0.035, 10, 8), GOLD, { bone: "wristL", at: [0.38, 1.1, 0.158], name: "shield-boss" });

// ---------------------------------------------------------------- broadsword (right hand)
b.extrude(
  [
    [-0.035, 0],
    [0.035, 0],
    [0.035, 0.72],
    [0, 0.82],
    [-0.035, 0.72],
  ],
  { color: blade, at: [-0.36, 0.92, 0.2], x: [1, 0, 0], y: [0, 1, 0], bone: "wristR", thickness: [0.03, 0.006], bevel: 0.004, name: "blade" },
);
b.part(new THREE.BoxGeometry(0.2, 0.025, 0.035), GOLD, { bone: "wristR", at: [-0.36, 0.93, 0.2], name: "crossguard" });
b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.14, 8), LEATHER, {
  bone: "wristR",
  at: [-0.36, 0.86, 0.2],
  name: "grip",
});
b.part(new THREE.SphereGeometry(0.03, 8, 6), GOLD, { bone: "wristR", at: [-0.36, 0.78, 0.2], name: "pommel" });

export default function build() {
  return b.root;
}
```