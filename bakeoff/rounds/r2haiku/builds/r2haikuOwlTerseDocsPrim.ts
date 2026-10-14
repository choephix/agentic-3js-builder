import * as THREE from "three";
import { createBuilder, countershade, mottle, rng } from "../../../../src/index";
import { catmull } from "../../../../src/index";

export const meta = {
  name: "owl",
  description: "A stylised standing owl: round body, big forward eyes, ear tufts and folded wings.",
};

const PLUMAGE = "#6b4a2b";
const DARK = "#3b2a1d";
const CREAM = "#e9dcc0";
const TAN = "#b98b52";
const EYE = "#f2b630";
const PUPIL = "#16120e";
const BEAK = "#3a3a3a";
const FEET = "#d9a441";

export default function build() {
  const b = createBuilder({ name: "owl" });
  const r = rng(11);

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.16, 0] });

  const torsoPath = catmull([
    [0, 0.16, 0],
    [0, 0.26, 0.0],
    [0, 0.36, 0.02],
  ]);
  const torso = b.chain("torso", torsoPath, { parent: hips, names: ["torsoLow", "torsoHigh"] });

  const head = b.joint("head", {
    parent: torso.joints[1],
    at: [0, 0.36, 0.02],
    aim: [0, 0.5, 0.03],
  });

  // Body: a rounded, egg-like tube that bulges at the belly
  const body = mottle(PLUMAGE, TAN, { size: 0.1, seed: 3 });
  b.sweep(torso, [0.07, 0.11, 0.1], {
    color: countershade(body, CREAM, { level: 0 }),
  });

  // Head: one big round skull
  b.part(new THREE.SphereGeometry(0.115, 12, 9), PLUMAGE, {
    bone: head,
    at: [0, 0.47, 0.03],
  });

  // Facial disc: a flattened pale sphere on the front of the head
  b.part(new THREE.SphereGeometry(0.075, 10, 8), CREAM, {
    bone: head,
    at: [0, 0.47, 0.12],
    scale: [1, 1, 0.35],
  });

  // Rim around the disc
  b.part(new THREE.TorusGeometry(0.08, 0.012, 6, 16), DARK, {
    bone: head,
    at: [0, 0.47, 0.125],
  });

  // Eyes and pupils
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.035, 10, 8), EYE, {
      bone: head,
      at: [s * 0.042, 0.49, 0.135],
    });
    b.part(new THREE.SphereGeometry(0.018, 8, 6), PUPIL, {
      bone: head,
      at: [s * 0.042, 0.49, 0.163],
    });
  }

  // Beak: a short hooked cone pointing forward
  b.part(new THREE.ConeGeometry(0.018, 0.05, 6), BEAK, {
    bone: head,
    at: [0, 0.46, 0.17],
    dir: [0, 0, 1],
  });

  // Ear tufts
  for (const s of [1, -1]) {
    b.spike([s * 0.06, 0.54, 0.0], [s * 0.35, 1, -0.2], 0.08, 0.022, {
      color: DARK,
      bone: head,
    });
  }

  // Wings: flat folded plates hanging at the sides
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0.05, 0.12],
        [0.0, 0.14],
        [-0.04, 0.1],
        [-0.06, -0.1, "sharp"],
        [0.0, -0.13],
        [0.04, -0.04],
      ],
      {
        at: [s * 0.1, 0.3, 0.0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.03,
        bevel: 0.006,
        smoothing: 1,
        color: countershade(DARK, TAN, { level: 0 }),
        bone: torso.joints[0],
      },
    );
  }

  // Legs and toes
  for (const s of [1, -1]) {
    const x = s * 0.05;
    b.capsule([x, 0.14, 0.0], [x, 0.02, 0.02], 0.02, { color: FEET, bone: hips });
    for (const dx of [-0.02, 0, 0.02]) {
      b.capsule([x, 0.012, 0.02], [x + dx, 0.012, 0.075], 0.012, { color: FEET, bone: hips });
    }
  }

  // A few scattered feather flecks for texture on the chest
  const chest = b.surface(torso.joints[1].object ?? b.root);
  void chest;
  void r;

  return b.root;
}
