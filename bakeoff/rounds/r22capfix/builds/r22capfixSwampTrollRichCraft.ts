import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { countershade, mottle, scales, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "A hulking, hunched swamp troll with an underbite, tusks, mossy hide, spiked pauldrons, a bone necklace and a studded club, in chunky hand-painted Warcraft style.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

const HIDE = "#5d8a3a";
const HIDE_D = "#3f6a35";
const BELLY = "#a9b867";
const WART = "#7a9a3c";
const MOSS = "#4f8a2a";
const MOSS_L = "#8fbf3a";
const LEATHER = "#6b4326";
const LEATHER_D = "#47291a";
const IRON = "#5c6068";
const IRON_L = "#9aa0a8";
const BONE = "#eadfb8";
const CLAW = "#2f2418";
const WOOD = "#6a4a2a";
const CLOTH = "#a8452a";
const CLOTH_D = "#7a2c1e";
const EYE = "#ffd21e";
const MOUTH = "#4a1a22";
const GOLD = "#d9a52a";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "swampTroll" });

  const skin = countershade(mottle(HIDE, HIDE_D, { size: 0.22, contrast: 0.8, seed: 3 }), mottle(BELLY, "#8fa354", { size: 0.18, seed: 5 }), {
    level: -0.35,
    soft: 0.3,
  });
  const skinLimb = mottle(HIDE, HIDE_D, { size: 0.2, contrast: 0.9, seed: 7 });
  const hand = stripes(HIDE, HIDE_D, { size: 0.08, axis: "y", width: 0.3, seed: 2 });
  const leather = scales(LEATHER, LEATHER_D, { size: 0.06, width: 0.12, seed: 4 });

  const ball = (at: number[], sc: number[], color: any, w = 10, h = 8, rot?: number[]) =>
    b.part(new THREE.SphereGeometry(1, w, h), color, { at, scale: sc, rotation: rot ?? [0, 0, 0] });
  const box = (at: number[], sz: number[], color: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(sz[0], sz[1], sz[2]), color, { at, rotation: rot ?? [0, 0, 0] });

  // ---- torso ----
  const torso = b.capsule([0, 1.25, 0.05], [0, 1.95, 0.22], [0.46, 0.54], skin, { sides: 10 });
  ball([0, 1.38, 0.36], [0.44, 0.42, 0.34], mottle(BELLY, "#8fa354", { size: 0.2, seed: 9 }), 10, 8);
  ball([0, 1.95, -0.12], [0.5, 0.36, 0.38], skinLimb, 10, 8); // hunched upper back
  b.capsule([0, 1.05, -0.05], [0, 1.2, 0], 0.34, skinLimb, { sides: 10 }); // pelvis
  // pectoral masses
  for (const s of [1, -1]) ball([s * 0.25, 1.85, 0.52], [0.26, 0.2, 0.16], skinLimb, 8, 6);

  // spine ridge and back spikes
  for (let i = 0; i < 7; i++) {
    const y = 2.28 - i * 0.14;
    const z = -0.38 - Math.sin(i * 0.5) * 0.04 - i * 0.015;
    b.spike([0, y, z], [0, 0.55, -0.85], 0.2 - i * 0.012, 0.05, i % 2 ? BONE : "#d6c98f", { sides: 5 });
  }

  // neck + head
  b.capsule([0, 2.1, 0.28], [0, 2.3, 0.46], [0.28, 0.24], skinLimb, { sides: 8 });
  const head = ball([0, 2.38, 0.55], [0.27, 0.23, 0.27], mottle(HIDE, HIDE_D, { size: 0.12, seed: 11 }), 12, 8);
  ball([0, 2.28, 0.72], [0.2, 0.12, 0.18], skinLimb, 8, 6); // snout
  b.capsule([-0.09, 2.3, 0.86], [0.09, 2.3, 0.86], 0.07, skinLimb, { sides: 6 }); // nose pad
  for (const s of [1, -1]) {
    ball([s * 0.04, 2.31, 0.93], [0.035, 0.025, 0.03], HIDE_D, 5, 4); // nostril
    // brow
    b.capsule([s * 0.04, 2.5, 0.72], [s * 0.2, 2.45, 0.6], [0.07, 0.06], HIDE_D, { sides: 6 });
    // eyes
    ball([s * 0.12, 2.42, 0.74], [0.05, 0.045, 0.04], "#2a1a10", 8, 6);
    glow(ball([s * 0.12, 2.42, 0.76], [0.04, 0.036, 0.03], EYE, 8, 6), 1.3);
    ball([s * 0.12, 2.42, 0.785], [0.012, 0.022, 0.01], "#150d08", 5, 4);
    // ears
    b.spike([s * 0.24, 2.4, 0.5], [s, 0.35, -0.35], 0.34, 0.07, skinLimb, { sides: 5 });
    b.spike([s * 0.25, 2.4, 0.5], [s, 0.35, -0.35], 0.24, 0.035, "#c98a7a", { sides: 5 });
    ring(s);
  }
  // lower jaw (underbite)
  b.capsule([-0.15, 2.17, 0.62], [0.15, 2.17, 0.62], [0.1, 0.1], skinLimb, { sides: 8 });
  b.capsule([-0.15, 2.17, 0.62], [0, 2.14, 0.8], 0.09, skinLimb, { sides: 6 });
  b.capsule([0.15, 2.17, 0.62], [0, 2.14, 0.8], 0.09, skinLimb, { sides: 6 });
  box([0, 2.24, 0.72], [0.28, 0.04, 0.22], MOUTH);
  for (const s of [1, -1]) {
    b.spike([s * 0.13, 2.2, 0.83], [s * 0.06, 1, 0.4], 0.2, 0.05, BONE, { sides: 6 }); // tusks
    b.spike([s * 0.13, 2.2, 0.83], [s * 0.06, 1, 0.4], 0.05, 0.052, "#c9b883", { sides: 6 });
  }
  for (let i = -3; i <= 3; i++) b.spike([i * 0.032, 2.2, 0.86 - Math.abs(i) * 0.02], [0, 1, 0.1], 0.04, 0.012, BONE, { sides: 4 });
  // hair tuft / topknot
  for (let i = 0; i < 5; i++) {
    b.spike([(i - 2) * 0.05, 2.58, 0.45 - Math.abs(i - 2) * 0.03], [(i - 2) * 0.2, 1, -0.5], 0.2 - Math.abs(i - 2) * 0.03, 0.035, "#2f3a1c", { sides: 4 });
  }
  // warts
  const warts = b.surface(head).scatter(10, { rng: rng(21), minDist: 0.06 });
  for (const h of warts) b.stick(new THREE.SphereGeometry(0.018, 5, 4), WART, h);
  const bodyWarts = b.surface(torso).scatter(26, { rng: rng(8), minDist: 0.12 });
  for (const h of bodyWarts) b.stick(new THREE.SphereGeometry(0.03, 6, 4), WART, h);

  // ---- legs ----
  for (const s of [1, -1]) {
    b.capsule([s * 0.28, 1.1, 0.0], [s * 0.34, 0.62, 0.1], [0.24, 0.17], skinLimb, { sides: 8 });
    ball([s * 0.34, 0.6, 0.14], [0.2, 0.18, 0.2], skinLimb, 8, 6); // knee
    b.capsule([s * 0.34, 0.6, 0.1], [s * 0.35, 0.2, 0.08], [0.16, 0.14], skinLimb, { sides: 8 });
    // leather greave
    b.rod([s * 0.34, 0.5, 0.1], [s * 0.35, 0.32, 0.09], 0.19, leather, { sides: 8 });
    b.rod([s * 0.34, 0.47, 0.1], [s * 0.35, 0.45, 0.1], 0.2, IRON, { sides: 8 });
    // foot
    b.capsule([s * 0.35, 0.13, 0.05], [s * 0.35, 0.13, 0.3], [0.15, 0.13], skinLimb, { sides: 8 });
    for (let t = -1; t <= 1; t++) {
      const tx = s * 0.35 + t * 0.09;
      b.capsule([tx, 0.06, 0.28], [tx, 0.06, 0.42], 0.055, hand, { sides: 6 });
      b.spike([tx, 0.06, 0.45], [0, -0.1, 1], 0.1, 0.04, CLAW, { sides: 5 });
    }
    b.capsule([s * 0.35, 0.07, -0.08], [s * 0.35, 0.07, -0.0], 0.06, skinLimb, { sides: 6 }); // heel
  }

  // ---- arms ----
  for (const s of [1, -1]) {
    // pauldron
    ball([s * 0.62, 2.08, 0.08], [0.34, 0.3, 0.34], skinLimb, 10, 8);
    b.part(new THREE.SphereGeometry(0.4, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), leather, { at: [s * 0.7, 2.16, 0.06], scale: [1, 0.8, 1.05], rotation: [0, 0, s * -18] });
    b.rod([s * 0.62, 2.12, 0.06], [s * 0.82, 2.0, 0.06], 0.4, IRON, { sides: 8, caps: "none" } as any);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2;
      b.stick(new THREE.SphereGeometry(0.025, 5, 4), IRON_L, {
        at: [s * 0.7 + Math.cos(a) * 0.3, 2.12, 0.06 + Math.sin(a) * 0.3],
        axis: [Math.cos(a), 0, Math.sin(a)],
      } as any);
    }
    b.spike([s * 0.76, 2.38, 0.06], [s * 0.4, 1, 0.1], 0.3, 0.07, IRON, { sides: 6 });
    b.spike([s * 0.62, 2.45, -0.08], [s * 0.1, 1, -0.2], 0.28, 0.06, IRON_L, { sides: 6 });
    b.spike([s * 0.9, 2.2, 0.05], [s, 0.7, 0.1], 0.26, 0.06, IRON, { sides: 6 });
    // moss on shoulder
    for (let k = 0; k < 5; k++) ball([s * (0.5 + k * 0.05), 2.38 + (k % 2) * 0.03, -0.1 + k * 0.05], [0.09, 0.05, 0.09], k % 2 ? MOSS : MOSS_L, 6, 4);
    // upper arm
    b.capsule([s * 0.66, 2.0, 0.1], [s * 0.86, 1.45, 0.2], [0.24, 0.2], skinLimb, { sides: 8 });
    ball([s * 0.87, 1.42, 0.22], [0.2, 0.18, 0.2], skinLimb, 8, 6); // elbow
    // forearm
    b.capsule([s * 0.87, 1.42, 0.22], [s * 0.82, 0.92, 0.42], [0.2, 0.25], hand, { sides: 8 });
    b.rod([s * 0.83, 1.03, 0.38], [s * 0.82, 0.94, 0.42], 0.27, leather, { sides: 8 });
    b.rod([s * 0.83, 1.0, 0.39], [s * 0.82, 0.97, 0.41], 0.28, IRON, { sides: 8 });
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      b.spike([s * 0.82 + Math.cos(a) * 0.26, 0.98, 0.41 + Math.sin(a) * 0.26], [Math.cos(a), 0, Math.sin(a)], 0.07, 0.025, IRON_L, { sides: 4 });
    }
    // fist
    ball([s * 0.8, 0.78, 0.48], [0.26, 0.24, 0.26], hand, 10, 8);
    for (let k = -1; k <= 2; k++) {
      ball([s * (0.8 + (k - 0.5) * 0.09), 0.72, 0.68], [0.065, 0.065, 0.06], HIDE_D, 6, 5);
      b.spike([s * (0.8 + (k - 0.5) * 0.09), 0.68, 0.72], [0, -0.35, 1], 0.09, 0.03, CLAW, { sides: 5 });
    }
    ball([s * 0.62, 0.8, 0.55], [0.08, 0.08, 0.1], skinLimb, 6, 5); // thumb
  }

  // ---- club (right arm, -x) ----
  const gripA: [number, number, number] = [-0.8, 0.72, 0.5];
  const clubTop: [number, number, number] = [-0.95, 1.9, 0.9];
  b.rod([-0.78, 0.35, 0.4], clubTop, [0.06, 0.08], WOOD, { sides: 6 });
  b.rod(gripA, [-0.82, 0.9, 0.52], 0.075, leather, { sides: 6 });
  b.capsule([-0.88, 1.35, 0.7], [-1.0, 2.15, 0.98], [0.11, 0.2], grainWood(), { sides: 8 });
  ball([-1.0, 2.22, 1.0], [0.17, 0.12, 0.17], grainWood(), 8, 6);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    b.spike([-0.98 + Math.cos(a) * 0.16, 1.9 + (k % 2) * 0.2, 0.92 + Math.sin(a) * 0.16], [Math.cos(a), 0.2, Math.sin(a)], 0.15, 0.04, IRON, { sides: 5 });
  }
  b.rod([-0.92, 1.58, 0.8], [-0.96, 1.64, 0.82], 0.17, IRON, { sides: 8 });
  b.rod([-0.94, 2.12, 0.94], [-0.96, 2.16, 0.95], 0.2, IRON, { sides: 8 });
  b.spike([-1.0, 2.3, 1.0], [0, 1, 0], 0.16, 0.05, IRON_L, { sides: 6 });

  // ---- gear ----
  b.part(new THREE.TorusGeometry(0.46, 0.05, 6, 16), leather, { at: [0, 1.22, 0.1], rotation: [90, 0, 0] });
  box([0, 1.22, 0.58], [0.16, 0.14, 0.05], GOLD);
  box([0, 1.22, 0.605], [0.08, 0.07, 0.02], LEATHER_D);
  // loin cloth
  const cloth = [
    [-0.2, 0],
    [0.2, 0],
    [0.17, -0.42],
    [0.0, -0.56, "sharp"],
    [-0.17, -0.42],
  ] as any;
  const clothPaint = stripes(CLOTH, CLOTH_D, { size: 0.1, axis: "x", width: 0.3, seed: 5 });
  b.extrude(cloth, { at: [0, 1.15, 0.6], x: [1, 0, 0], thickness: 0.03, bevel: 0.008, color: clothPaint });
  b.extrude(cloth, { at: [0, 1.15, -0.4], x: [-1, 0, 0], thickness: 0.03, bevel: 0.008, color: clothPaint });
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.1, 0],
        [0.1, 0],
        [0.0, -0.3, "sharp"],
      ] as any,
      { at: [s * 0.4, 1.15, 0.28], x: [0, 0, s], thickness: 0.03, bevel: 0.006, color: CLOTH_D },
    );
  }
  // bone necklace
  for (let k = 0; k < 9; k++) {
    const a = (k / 8 - 0.5) * 2.3;
    const x = Math.sin(a) * 0.5;
    const y = 2.02 - Math.cos(a) * 0.12 - (1 - Math.abs(a / 1.15)) * 0.02;
    const z = 0.26 + Math.cos(a) * 0.46;
    if (k % 2) b.spike([x, y, z], [0, -0.7, 0.4], 0.13, 0.035, BONE, { sides: 5 });
    else ball([x, y, z], [0.03, 0.03, 0.03], k === 4 ? GOLD : BONE, 5, 4);
  }
  b.capsule([0, 1.87, 0.7], [0, 1.77, 0.74], 0.06, GOLD, { sides: 6 });
  // war paint on chest
  const paintSvg = svg(
    `<svg viewBox="0 0 64 64"><g fill="none" stroke="#e8d9a0" stroke-width="6" stroke-linecap="round"><path d="M12 8 L32 56 L52 8"/><path d="M16 30 L48 30"/><circle cx="32" cy="14" r="6"/></g></svg>`,
    { size: 192 },
  );
  b.decal(torso, paintSvg, { at: [0, 1.88, 0.75], dir: [0, 0, 1], size: [0.3, 0.3] });
  // cheek paint
  const cheek = svg(`<svg viewBox="0 0 32 16"><g stroke="#c8342a" stroke-width="4" stroke-linecap="round"><path d="M3 3 L29 3"/><path d="M5 9 L27 9"/></g></svg>`, { size: 96 });
  for (const s of [1, -1]) b.decal(head, cheek, { at: [s * 0.2, 2.36, 0.68], dir: [s, 0, 0.4], size: [0.09, 0.045], mirror: s > 0 });

  // moss + mushrooms on back
  for (let k = 0; k < 9; k++) {
    const a = k * 1.3;
    ball([Math.sin(a) * 0.3, 2.05 + (k % 3) * 0.07, -0.42 + Math.cos(a) * 0.05], [0.11, 0.06, 0.1], k % 2 ? MOSS : MOSS_L, 6, 4);
  }
  for (let k = 0; k < 3; k++) {
    const x = -0.2 + k * 0.2;
    b.rod([x, 1.9, -0.5], [x, 2.0, -0.52], 0.02, BONE, { sides: 5 });
    b.part(new THREE.SphereGeometry(0.06, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), k === 1 ? "#d24a3a" : "#e8a52a", { at: [x, 2.0, -0.52], scale: [1, 0.7, 1] });
  }
  // trailing moss on belt and thighs
  for (let k = 0; k < 6; k++) ball([-0.35 + k * 0.14, 1.12, 0.5 + (k % 2) * 0.02], [0.05, 0.08, 0.04], MOSS, 5, 4);

  return b.root;

  function grainWood() {
    return mottle(WOOD, LEATHER_D, { size: 0.09, contrast: 0.9, seed: 13 });
  }
  function ring(s: number) {
    // gold ear ring
    b.part(new THREE.TorusGeometry(0.05, 0.012, 5, 10), GOLD, { at: [s * 0.4, 2.3, 0.4], rotation: [0, 90, 0] });
  }
}
