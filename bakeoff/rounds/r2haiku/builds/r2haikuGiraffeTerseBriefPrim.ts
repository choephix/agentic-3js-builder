import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "giraffe",
  description: "A stylized giraffe built from primitives: long rigged legs, a tilted neck, a blocky head with ossicones, and a patchwork coat.",
};

const COAT = "#e9b35a";
const PATCH = "#8a5528";
const MANE = "#5a3a1f";
const HOOF = "#2e2723";
const CREAM = "#f4e7c8";
const EYE = "#17120f";
const HORN = "#6b4a2a";

export default function build() {
  const b = createBuilder({ name: "giraffe" });
  const rand = rng(7);

  // Torso: the root joint sits at the middle of the barrel.
  const torso = b.joint("torso", { at: [0, 2.7, 0] });

  // Barrel.
  b.part(new THREE.BoxGeometry(0.9, 0.85, 2.0), COAT, { at: [0, 2.7, 0], bone: torso });
  b.part(new THREE.BoxGeometry(0.72, 0.6, 0.5), COAT, { at: [0, 2.95, 0.7], bone: torso });
  b.part(new THREE.BoxGeometry(0.7, 0.55, 0.45), COAT, { at: [0, 2.8, -0.85], bone: torso });

  // Segment helper: a tapered cylinder from a to b, aligned along the segment.
  const seg = (a, c, rTop, rBottom, color, bone) => {
    const d = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    const dir = [d[0] / len, d[1] / len, d[2] / len];
    const at = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
    b.part(new THREE.CylinderGeometry(rTop, rBottom, len, 7), color, { at, dir, bone });
  };

  // One leg: hip, knee and ankle joints, two limb segments, and a hoof.
  const leg = (name, x, z) => {
    const hipP = [x, 2.5, z];
    const kneeP = [x, 1.3, z + (z > 0 ? 0.05 : -0.05)];
    const ankleP = [x, 0.22, z];

    const hip = b.joint(`hip${name}`, { at: hipP, parent: torso });
    const knee = b.joint(`knee${name}`, { at: kneeP, parent: hip });
    const ankle = b.joint(`ankle${name}`, { at: ankleP, parent: knee });

    seg(hipP, kneeP, 0.15, 0.12, COAT, hip);
    seg(kneeP, ankleP, 0.1, 0.08, COAT, knee);

    // Knee knob, a blocky accent.
    b.part(new THREE.SphereGeometry(0.12, 8, 6), PATCH, { at: kneeP, bone: knee });

    // Hoof sits on the floor (bottom at y = 0).
    b.part(new THREE.BoxGeometry(0.22, 0.14, 0.24), HOOF, { at: [x, 0.07, z], bone: ankle });
  };

  leg("FL", 0.36, 0.72);
  leg("FR", -0.36, 0.72);
  leg("HL", 0.34, -0.72);
  leg("HR", -0.34, -0.72);

  // Neck: a bent chain from the shoulders up to the head, swept as one smooth tube.
  const neck = b.chain(
    "neck",
    [
      [0, 2.95, 0.6],
      [0, 3.6, 0.85],
      [0, 4.15, 1.15],
    ],
    { role: "neck" },
  );
  b.sweep(neck, 0.2, { color: COAT });

  // Mane: a row of dark blocks along the top of the neck.
  for (const t of [0.12, 0.28, 0.44, 0.6, 0.76, 0.9]) {
    b.part(new THREE.BoxGeometry(0.06, 0.14, 0.08), MANE, { at: neck.at(t) });
  }

  // Head joint at the top of the neck.
  const head = b.joint("head", { at: [0, 4.28, 1.3], parent: torso });

  // Skull and muzzle.
  b.part(new THREE.BoxGeometry(0.36, 0.32, 0.46), COAT, { at: [0, 4.3, 1.35], bone: head });
  b.part(new THREE.BoxGeometry(0.26, 0.22, 0.22), CREAM, { at: [0, 4.22, 1.64], bone: head });
  b.part(new THREE.BoxGeometry(0.2, 0.1, 0.05), EYE, { at: [0, 4.24, 1.76], bone: head });

  // Eyes and ears.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.04, 6, 5), EYE, { at: [s * 0.19, 4.38, 1.36], bone: head });
    b.part(new THREE.BoxGeometry(0.14, 0.06, 0.1), COAT, { at: [s * 0.24, 4.4, 1.18], bone: head });
    // Ossicones: short horns topped with dark knobs.
    b.part(new THREE.CylinderGeometry(0.03, 0.035, 0.2, 6), HORN, {
      at: [s * 0.09, 4.5, 1.36],
      dir: [0, 1, 0],
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.05, 6, 5), EYE, { at: [s * 0.09, 4.62, 1.36], bone: head });
  }

  // Tail: a thin swept chain with a dark tuft.
  const tail = b.chain(
    "tail",
    [
      [0, 2.85, -1.0],
      [0, 2.55, -1.3],
      [0, 2.2, -1.4],
    ],
    { role: "tail" },
  );
  b.sweep(tail, 0.035, { color: MANE });
  b.part(new THREE.SphereGeometry(0.08, 7, 6), MANE, { at: [0, 2.18, -1.42] });

  // Coat patches: flattened spheres pressed onto the barrel's sides and top.
  for (let i = 0; i < 26; i++) {
    const side = rand() < 0.5 ? 1 : -1;
    const x = side * 0.44;
    const y = 2.3 + rand() * 0.8;
    const z = -0.9 + rand() * 1.8;
    b.part(new THREE.SphereGeometry(0.12 + rand() * 0.06, 6, 5), PATCH, {
      at: [x, y, z],
      scale: [0.25, 1, 1],
      bone: torso,
    });
  }
  // Patches on the neck.
  for (const t of [0.2, 0.4, 0.6, 0.8]) {
    b.part(new THREE.SphereGeometry(0.1, 6, 5), PATCH, {
      at: neck.at(t),
      scale: [1, 1, 0.4],
    });
  }

  return b.root;
}
