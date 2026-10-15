import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { mottle, countershade, grain } from "../../../../src/paint";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Capybara with a Small Bird",
  description: "A chubby, sleepy capybara with a tiny blue bird perched on its head, in a storybook whimsical style.",
  style: "whimsical",
  commit: "88fc1f0",
};

const FUR_A = "#b9803e";
const FUR_B = "#9c6430";
const BELLY = "#e6c38a";
const DARK = "#3a2616";
const NOSE = "#2b1a14";
const PINK = "#ff9fb0";
const INNER = "#e58b8b";
const BLUE = "#4fa8e8";
const BLUE_D = "#2f78c4";
const CREAM = "#fff3d0";
const ORANGE = "#ffa43a";
const PETAL = "#ffd84a";
const PETAL2 = "#ff7fa8";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "capybara" });

  const coat = cel(countershade(mottle(FUR_A, FUR_B, { size: 0.09, contrast: 0.8, seed: 3 }), BELLY, { level: -0.35, soft: 0.2 }));
  const headCoat = cel(grain(mottle(FUR_A, FUR_B, { size: 0.06, seed: 5 }), FUR_B, { size: 0.01, axis: "z" }));
  const legCoat = cel(mottle(FUR_B, "#85521f", { size: 0.05, seed: 8 }));

  const sph = (r: number, at: number[], scale: number[], color: string | THREE.Color | any, seg = 10, rot?: number[]) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(4, Math.round(seg * 0.7))), color, { at, scale, ...(rot ? { rotation: rot } : {}) });

  // Body: a big barrel
  b.capsule([0, 0.4, -0.36], [0, 0.41, 0.16], [0.3, 0.29], coat);
  // rump bulge and shoulder bulge
  sph(0.3, [0, 0.4, -0.34], [1, 0.97, 1], coat, 12);
  sph(0.27, [0, 0.42, 0.2], [1, 0.95, 1], coat, 12);
  // neck / jowl mass
  sph(0.2, [0, 0.5, 0.4], [1.05, 0.95, 1], headCoat, 10);

  // Head: blocky, big
  sph(0.17, [0, 0.57, 0.52], [1, 1, 1.15], headCoat, 12);
  // Snout: broad blunt box-like muzzle
  sph(0.13, [0, 0.52, 0.68], [1.0, 0.9, 0.95], headCoat, 12);
  sph(0.1, [0, 0.46, 0.7], [1.15, 0.7, 0.85], cel(BELLY), 10);
  // nose pad
  sph(0.05, [0, 0.555, 0.8], [1.4, 0.85, 0.6], NOSE, 8);
  for (const s of [1, -1]) {
    sph(0.012, [s * 0.026, 0.56, 0.835], [1, 1, 0.6], "#000000", 5);
    // cheeks blush
    sph(0.035, [s * 0.14, 0.5, 0.64], [0.4, 0.8, 1], PINK, 6);
    // eyes
    sph(0.028, [s * 0.098, 0.625, 0.672], [1, 1, 0.9], "#120a08", 8);
    sph(0.009, [s * 0.103, 0.637, 0.693], [1, 1, 1], "#ffffff", 5);
    sph(0.005, [s * 0.09, 0.614, 0.695], [1, 1, 1], "#ffffff", 4);
    // brows (sleepy lids)
    b.rod([s * 0.075, 0.665, 0.685], [s * 0.125, 0.652, 0.65], 0.006, DARK);
    // ears
    sph(0.04, [s * 0.115, 0.7, 0.43], [0.7, 1, 0.55], legCoat, 8, [0, 0, -s * 20]);
    sph(0.026, [s * 0.116, 0.7, 0.45], [0.55, 0.85, 0.3], INNER, 6, [0, 0, -s * 20]);
    // whiskers
    for (let i = 0; i < 3; i++) {
      b.rod([s * 0.06, 0.505 + i * 0.012, 0.8], [s * 0.15, 0.49 + i * 0.03, 0.83], 0.003, DARK);
    }
    // eyebrow fur tufts
    sph(0.02, [s * 0.1, 0.675, 0.64], [1, 0.6, 1], FUR_B, 5);
  }
  // mouth line
  b.rod([-0.05, 0.47, 0.792], [0.05, 0.47, 0.792], 0.004, DARK);
  b.rod([0, 0.52, 0.8], [0, 0.47, 0.792], 0.004, DARK);
  // Two cute buck teeth
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.014, 0.022, 0.008), CREAM, { at: [s * 0.009, 0.455, 0.793] });

  // Legs
  for (const s of [1, -1]) {
    // front
    b.capsule([s * 0.16, 0.28, 0.27], [s * 0.15, 0.075, 0.3], 0.078, legCoat);
    // hind: thigh + shin
    sph(0.14, [s * 0.2, 0.28, -0.32], [0.8, 1.05, 1.1], coat, 10);
    b.capsule([s * 0.19, 0.22, -0.3], [s * 0.18, 0.09, -0.28], 0.09, legCoat);
    // toes
    for (let i = -1; i <= 1; i++) {
      sph(0.03, [s * 0.15 + i * 0.04, 0.03, 0.36], [0.9, 0.9, 1.1], DARK, 6);
      sph(0.03, [s * 0.18 + i * 0.045, 0.03, -0.2], [0.9, 0.9, 1.1], DARK, 6);
    }
  }
  // Tiny nub tail
  sph(0.03, [0, 0.33, -0.66], [1, 1, 0.8], FUR_B, 6);

  // Fur tufts on back for charm
  for (let i = 0; i < 7; i++) {
    const z = -0.5 + i * 0.12;
    const y = 0.69 - Math.abs(z + 0.1) * 0.12;
    b.spike([((i % 3) - 1) * 0.05, y - 0.02, z], [0, 1, -0.3], 0.07, 0.016, FUR_B, { sides: 5 });
  }
  // Belly cream patch markings and chest fluff
  sph(0.07, [0, 0.33, 0.42], [1.2, 1, 0.7], BELLY, 8);

  // Little flower tucked by the ear
  const fx = 0.13, fy = 0.72, fz = 0.4;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    sph(0.014, [fx + Math.cos(a) * 0.022, fy + Math.sin(a) * 0.022, fz + 0.03], [1, 1, 0.5], i % 2 ? PETAL2 : PETAL, 5);
  }
  sph(0.012, [fx, fy, fz + 0.035], [1, 1, 0.8], ORANGE, 5);

  // === Bird ===
  const bx = 0, by = 0.8, bz = 0.5;
  sph(0.055, [bx, by, bz], [1, 0.95, 1.2], BLUE, 10);
  sph(0.04, [bx, by - 0.012, bz + 0.03], [0.85, 0.8, 0.9], CREAM, 8);
  sph(0.038, [bx, by + 0.055, bz + 0.04], [1, 1, 1], BLUE, 10);
  b.spike([bx, by + 0.05, bz + 0.07], [0, -0.1, 1], 0.045, 0.014, ORANGE, { sides: 6 });
  // crest
  for (let i = 0; i < 3; i++) {
    b.spike([bx + (i - 1) * 0.01, by + 0.085, bz + 0.035 - i * 0.004 * 0], [(i - 1) * 0.3, 1, -0.5], 0.03, 0.007, BLUE_D, { sides: 4 });
  }
  for (const s of [1, -1]) {
    sph(0.007, [s * 0.026, by + 0.065, bz + 0.07], [1, 1, 1], "#120a08", 5);
    sph(0.0025, [s * 0.028, by + 0.068, bz + 0.077], [1, 1, 1], "#ffffff", 4);
    // wings
    sph(0.04, [s * 0.05, by + 0.005, bz - 0.01], [0.3, 0.8, 1.35], BLUE_D, 8, [0, 0, -s * 10]);
    sph(0.025, [s * 0.056, by - 0.005, bz - 0.03], [0.25, 0.7, 1.4], "#1f5a9c", 6, [0, 0, -s * 10]);
    // cheek blush
    sph(0.01, [s * 0.03, by + 0.05, bz + 0.058], [1, 1, 0.5], PINK, 4);
    // feet
    b.rod([s * 0.018, by - 0.045, bz + 0.01], [s * 0.018, by - 0.075, bz + 0.015], 0.004, ORANGE);
    for (let t = -1; t <= 1; t++) b.rod([s * 0.018, by - 0.074, bz + 0.015], [s * 0.018 + t * 0.008, by - 0.074, bz + 0.04], 0.003, ORANGE);
  }
  // tail feathers
  for (let i = -1; i <= 1; i++) {
    b.rod([bx, by + 0.005, bz - 0.05], [bx + i * 0.025, by + 0.03, bz - 0.14], [0.012, 0.006], i === 0 ? BLUE : BLUE_D, { sides: 4 });
  }
  // a tiny seed in beak? no: little music note-like berry dropped on the head
  sph(0.012, [0.04, 0.745, 0.53], [1, 1, 1], "#e24a5a", 5);

  return b.root;
}
