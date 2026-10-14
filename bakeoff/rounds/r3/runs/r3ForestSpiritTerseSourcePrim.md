```ts
import * as THREE from "three";
import { createBuilder, mottle, spots, stripes, rng } from "agentic-3js-builder";

export const meta = {
  name: "Forest Spirit",
  description:
    "A tall antlered woodland spirit with a bone-pale stag mask, mossy body, leaf skirt, mushroom shoulders and a glowing heart.",
};

export default function build() {
  const b = createBuilder({ name: "forestSpirit" });
  const R = rng(11);

  const BONE = "#e9e4d0";
  const MOSS = "#5f9a4c";
  const MOSS_D = "#3f7038";
  const WOOD = "#6a4a2c";
  const GLOW = "#a6ffc4";
  const body = mottle("#d8e6c8", "#7fae6a", { size: 0.12, seed: 3 });
  const limb = mottle("#cfe0bc", "#5f9a4c", { size: 0.09, seed: 5 });

  // ---------- skeleton ----------
  b.joint("hips", { at: [0, 0.78, 0], dir: [0, 1, 0], role: "spine" });
  b.joint("spine1", { parent: "hips", at: [0, 0.85, 0], dir: [0, 1, 0], role: "spine" });
  b.joint("chest", { parent: "spine1", at: [0, 1.1, 0], dir: [0, 1, 0], role: "spine" });
  b.joint("neck", { parent: "chest", at: [0, 1.3, 0], dir: [0, 1, 0.1], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 1.4, 0.02], dir: [0, 1, 0], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 1.39, 0.06], dir: [0, 0, 1], role: "jaw" });

  const sides = [
    { s: 1, n: "L" },
    { s: -1, n: "R" },
  ];

  // ---------- torso ----------
  b.part(new THREE.CylinderGeometry(0.16, 0.2, 0.55, 8), body, { at: [0, 1.03, 0], bone: "spine1" });
  b.part(new THREE.SphereGeometry(0.2, 8, 6), body, { at: [0, 0.8, 0], scale: [1, 0.8, 0.9], bone: "hips" });
  b.part(new THREE.SphereGeometry(0.18, 8, 6), body, { at: [0, 1.28, 0], scale: [1.1, 0.6, 0.8], bone: "chest" });
  b.part(new THREE.CylinderGeometry(0.06, 0.08, 0.14, 6), BONE, { at: [0, 1.34, 0.01], bone: "neck" });
  // glowing heart
  b.part(new THREE.IcosahedronGeometry(0.045, 0), GLOW, { at: [0, 1.12, 0.16], bone: "chest" });
  b.part(new THREE.TorusGeometry(0.07, 0.01, 4, 8), MOSS_D, { at: [0, 1.12, 0.155], bone: "chest" });
  // vine wrapped round the waist
  b.part(new THREE.TorusGeometry(0.2, 0.018, 4, 10), MOSS_D, { at: [0, 0.93, 0], rotation: [90, 0, 15], bone: "spine1" });

  // ---------- leaf skirt ----------
  for (let row = 0; row < 2; row++) {
    const count = row === 0 ? 14 : 10;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + row * 0.2;
      const rad = 0.2 - row * 0.03;
      const y = 0.76 - row * 0.05;
      const col = row === 0 ? (i % 3 === 0 ? "#c8873a" : MOSS) : i % 2 ? "#8fbf55" : "#d9a441";
      const len = 0.3 - row * 0.05 + R() * 0.05;
      b.part(new THREE.ConeGeometry(0.06, len, 4), col, {
        at: [Math.sin(a) * rad, y, Math.cos(a) * rad],
        dir: [Math.sin(a) * 0.45, -1, Math.cos(a) * 0.45],
        scale: [1, 1, 0.3],
        flat: true,
        bone: "hips",
      });
    }
  }

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(0.13, 8, 6), BONE, { at: [0, 1.46, 0.02], scale: [0.95, 1.05, 1.05], bone: "head" });
  b.part(new THREE.BoxGeometry(0.1, 0.06, 0.15), BONE, { at: [0, 1.42, 0.15], bone: "head" });
  b.part(new THREE.BoxGeometry(0.04, 0.025, 0.03), "#2b2b24", { at: [0, 1.435, 0.235], bone: "head" });
  b.part(new THREE.BoxGeometry(0.085, 0.03, 0.13), BONE, { at: [0, 1.365, 0.13], bone: "jaw" });
  for (const { s } of sides) {
    // eyes: dark socket + glow
    b.part(new THREE.SphereGeometry(0.035, 6, 5), "#1c2a22", { at: [0.06 * s, 1.47, 0.12], scale: [1, 1.2, 0.6], bone: "head" });
    b.part(new THREE.IcosahedronGeometry(0.02, 0), GLOW, { at: [0.06 * s, 1.47, 0.14], bone: "head" });
    // teeth
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.ConeGeometry(0.008, 0.025, 4), "#fffbe8", {
        at: [0.035 * s, 1.385, 0.1 + k * 0.04],
        rotation: [180, 0, 0],
        bone: "head",
      });
    }
    // ears
    b.part(new THREE.ConeGeometry(0.04, 0.16, 4), BONE, { at: [0.14 * s, 1.5, -0.02], rotation: [0, 0, -70 * s], scale: [1, 1, 0.4], bone: "head" });
    b.part(new THREE.ConeGeometry(0.022, 0.1, 4), "#d98c8c", { at: [0.135 * s, 1.5, -0.01], rotation: [0, 0, -70 * s], scale: [1, 1, 0.4], bone: "head" });
    // moss crown tufts
    b.part(new THREE.SphereGeometry(0.05, 6, 4), MOSS, { at: [0.06 * s, 1.57, -0.02], scale: [1, 0.6, 1], bone: "head" });

    // antlers
    const main = [
      [0.06 * s, 1.55, -0.01],
      [0.12 * s, 1.74, -0.03],
      [0.2 * s, 1.92, -0.05],
      [0.27 * s, 2.1, -0.02],
    ];
    b.sweep(main, [0.022, 0.016, 0.012, 0.005], { color: WOOD, bone: "head", sides: 5 });
    const tines: Array<[number[], number[], number]> = [
      [main[1], [0.3 * s, 1.84, 0.04], 0.01],
      [main[2], [0.36 * s, 2.04, -0.02], 0.009],
      [main[1], [0.14 * s, 1.9, 0.1], 0.008],
      [main[3], [0.2 * s, 2.24, 0.02], 0.006],
    ];
    for (const [a, c, r] of tines) b.rod(a, c, [r, 0.003], { color: WOOD, bone: "head", sides: 4 });
    // moss on antler
    b.part(new THREE.IcosahedronGeometry(0.03, 0), MOSS, { at: main[2], bone: "head" });
    b.part(new THREE.IcosahedronGeometry(0.02, 0), "#c8873a", { at: [0.3 * s, 1.84, 0.04], bone: "head" });
  }

  // ---------- arms & legs ----------
  for (const { s, n } of sides) {
    const arm = b.chain(
      `arm${n}`,
      [
        [0.2 * s, 1.24, 0],
        [0.4 * s, 1.06, 0.03],
        [0.58 * s, 0.9, 0.07],
      ],
      { parent: "chest", names: [`shoulder${n}`, `elbow${n}`, `wrist${n}`], role: "arm" },
    );
    b.sweep(arm, [0.055, 0.04, 0.032], { color: limb, sides: 6 });
    b.part(new THREE.SphereGeometry(0.075, 6, 5), MOSS, { at: [0.2 * s, 1.3, 0], scale: [1.2, 0.7, 1.1], bone: `shoulder${n}` });
    // fingers
    for (let f = -1; f <= 1; f++) {
      b.rod([0.58 * s, 0.9, 0.07], [(0.66 + 0.01 * (1 - Math.abs(f))) * s, 0.82, 0.07 + f * 0.04], [0.014, 0.006], {
        color: BONE,
        bone: `wrist${n}`,
        sides: 4,
      });
    }
    // mushrooms on shoulders
    const mx = 0.26 * s;
    b.part(new THREE.CylinderGeometry(0.012, 0.016, 0.06, 5), "#f0e6c8", { at: [mx, 1.37, -0.02], rotation: [0, 0, -15 * s], bone: `shoulder${n}` });
    b.part(new THREE.SphereGeometry(0.045, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#d8452f", { at: [mx + 0.01 * s, 1.4, -0.02], rotation: [0, 0, -15 * s], bone: `shoulder${n}` });
    b.part(new THREE.IcosahedronGeometry(0.008, 0), "#fff6dc", { at: [mx + 0.01 * s, 1.435, -0.01], bone: `shoulder${n}` });
    b.part(new THREE.CylinderGeometry(0.008, 0.01, 0.035, 5), "#f0e6c8", { at: [0.17 * s, 1.36, -0.05], bone: `shoulder${n}` });
    b.part(new THREE.SphereGeometry(0.025, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#e0a23a", { at: [0.17 * s, 1.375, -0.05], bone: `shoulder${n}` });

    const leg = b.chain(
      `leg${n}`,
      [
        [0.1 * s, 0.78, 0],
        [0.12 * s, 0.42, 0.06],
        [0.11 * s, 0.09, 0],
      ],
      { parent: "hips", names: [`hip${n}`, `knee${n}`, `ankle${n}`], role: "leg" },
    );
    b.sweep(leg, [0.075, 0.055, 0.04], { color: limb, sides: 6 });
    b.part(new THREE.SphereGeometry(0.06, 6, 5), MOSS_D, { at: [0.12 * s, 0.42, 0.08], scale: [1, 0.8, 0.8], bone: `knee${n}` });
    b.part(new THREE.BoxGeometry(0.1, 0.08, 0.2), BONE, { at: [0.11 * s, 0.04, 0.05], bone: `ankle${n}` });
    for (let t = -1; t <= 1; t++) {
      b.part(new THREE.ConeGeometry(0.015, 0.05, 4), WOOD, {
        at: [(0.11 + t * 0.03) * s, 0.04, 0.17],
        rotation: [90, 0, 0],
        bone: `ankle${n}`,
      });
    }
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    [
      [0, 0.8, -0.15],
      [0, 0.6, -0.5],
      [0, 0.52, -0.85],
    ],
    { parent: "hips", names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, [0.07, 0.05, 0.015], { color: stripes("#d8e6c8", "#5f9a4c", { size: 0.14, axis: "z" }), sides: 6 });
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.ConeGeometry(0.035, 0.14, 4), i % 2 ? "#c8873a" : MOSS, {
      at: [Math.sin(i * 2) * 0.03, 0.56 - i * 0.012, -0.55 - i * 0.07],
      dir: [Math.sin(i * 2), 0.3, -1],
      scale: [1, 1, 0.3],
      bone: "tail3",
    });
  }
  // spotted back patch
  b.part(new THREE.SphereGeometry(0.05, 5, 4), spots("#cfe0bc", "#3f7038", { size: 0.04 }), { at: [0, 1.0, -0.15], scale: [1.3, 1.8, 0.5], bone: "spine1" });

  return b.root;
}
```