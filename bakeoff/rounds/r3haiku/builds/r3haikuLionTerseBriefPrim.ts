import * as THREE from "three";
import { createBuilder, rng, catmull } from "../../../../src/index";

export const meta = {
  name: "lion",
  description:
    "A stylised male lion in a rest pose: layered mane, tufted tail, separate jaw, four jointed legs.",
};

const BODY = "#d9a24a";
const BODY_DARK = "#b47f32";
const BELLY = "#f0cf8a";
const MANE = "#6b3a1a";
const MANE_DARK = "#4a2810";
const NOSE = "#2a1a14";
const EYE = "#ffd23f";
const PUPIL = "#1a1410";

export default function build() {
  const b = createBuilder({ name: "lion" });
  const rand = rng(11);

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.95, -0.7] });
  const chest = b.joint("chest", { at: [0, 1.05, 0.3], parent: hips });
  const neck = b.joint("neck", { at: [0, 1.2, 0.75], parent: chest });
  const head = b.joint("head", { at: [0, 1.32, 1.0], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 1.2, 1.18], parent: head });

  // Torso
  b.part(new THREE.SphereGeometry(1, 16, 12), BODY, {
    at: [0, 1.05, 0.3],
    bone: chest,
    scale: [0.42, 0.42, 0.6],
  });
  b.part(new THREE.SphereGeometry(1, 14, 10), BELLY, {
    at: [0, 0.8, 0.15],
    bone: chest,
    scale: [0.36, 0.18, 0.5],
  });
  b.part(new THREE.SphereGeometry(1, 16, 12), BODY, {
    at: [0, 0.98, -0.7],
    bone: hips,
    scale: [0.4, 0.4, 0.42],
  });
  b.part(new THREE.SphereGeometry(1, 12, 10), BODY, {
    at: [0, 1.2, 0.8],
    bone: neck,
    scale: [0.3, 0.34, 0.3],
  });

  // Legs: front and hind, left (+X) and right (-X)
  for (const s of ["L", "R"]) {
    const sx = s === "L" ? 0.3 : -0.3;

    // Foreleg chain: shoulder -> wrist -> paw
    const shoulder = b.joint("shoulder" + s, { at: [sx, 0.9, 0.55], parent: chest });
    const wrist = b.joint("wrist" + s, { at: [sx, 0.4, 0.6], parent: shoulder });
    const pawF = b.joint("pawF" + s, { at: [sx, 0.06, 0.62], parent: wrist });

    b.part(new THREE.CylinderGeometry(0.12, 0.095, 0.5, 8), BODY, {
      at: [sx, 0.65, 0.57],
      bone: shoulder,
    });
    b.part(new THREE.CylinderGeometry(0.095, 0.075, 0.32, 8), BODY_DARK, {
      at: [sx, 0.25, 0.6],
      bone: wrist,
    });
    b.part(new THREE.SphereGeometry(1, 10, 8), BELLY, {
      at: [sx, 0.06, 0.66],
      bone: pawF,
      scale: [0.13, 0.08, 0.17],
    });

    // Hindleg chain: hip -> knee -> ankle
    const hip = b.joint("hip" + s, { at: [sx, 0.95, -0.62], parent: hips });
    const knee = b.joint("knee" + s, { at: [sx, 0.5, -0.6], parent: hip });
    const ankle = b.joint("ankle" + s, { at: [sx, 0.06, -0.66], parent: knee });

    b.part(new THREE.SphereGeometry(1, 12, 10), BODY, {
      at: [sx, 0.9, -0.7],
      bone: hip,
      scale: [0.22, 0.26, 0.24],
    });
    b.part(new THREE.CylinderGeometry(0.13, 0.09, 0.46, 8), BODY, {
      at: [sx, 0.73, -0.61],
      bone: hip,
    });
    b.part(new THREE.CylinderGeometry(0.09, 0.075, 0.4, 8), BODY_DARK, {
      at: [sx, 0.28, -0.63],
      bone: knee,
    });
    b.part(new THREE.SphereGeometry(1, 10, 8), BELLY, {
      at: [sx, 0.06, -0.6],
      bone: ankle,
      scale: [0.13, 0.08, 0.17],
    });
  }

  // Mane: two staggered rings of tufts around the head, drawn behind the face
  const headCenter = [0, 1.32, 0.95];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const j = 0.85 + 0.3 * rand();
    const r = 0.5;
    b.part(new THREE.IcosahedronGeometry(0.2, 0), i % 3 === 0 ? MANE_DARK : MANE, {
      at: [Math.sin(a) * r, headCenter[1] + Math.cos(a) * r, headCenter[2]],
      bone: head,
      scale: [j, j, j * 0.8],
    });
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.26;
    const j = 0.9 + 0.2 * rand();
    b.part(new THREE.IcosahedronGeometry(0.17, 0), MANE, {
      at: [Math.sin(a) * 0.36, headCenter[1] + Math.cos(a) * 0.36, 0.88],
      bone: head,
      scale: [j, j, j * 0.8],
    });
  }

  // Head
  b.part(new THREE.SphereGeometry(1, 16, 12), BODY, {
    at: [0, 1.32, 1.0],
    bone: head,
    scale: [0.36, 0.34, 0.36],
  });
  b.part(new THREE.ConeGeometry(0.07, 0.13, 8), BODY_DARK, {
    at: [-0.2, 1.66, 0.98],
    bone: head,
  });
  b.part(new THREE.ConeGeometry(0.07, 0.13, 8), BODY_DARK, {
    at: [0.2, 1.66, 0.98],
    bone: head,
  });

  // Muzzle, nose and eyes
  b.part(new THREE.SphereGeometry(1, 12, 10), BELLY, {
    at: [0, 1.2, 1.24],
    bone: head,
    scale: [0.2, 0.14, 0.24],
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    at: [0, 1.28, 1.46],
    bone: head,
    scale: [0.08, 0.06, 0.06],
  });
  for (const sx of [-0.14, 0.14]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), EYE, {
      at: [sx, 1.38, 1.3],
      bone: head,
      scale: [0.055, 0.05, 0.04],
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), PUPIL, {
      at: [sx, 1.38, 1.34],
      bone: head,
      scale: [0.025, 0.035, 0.02],
    });
  }

  // Lower jaw, on its own joint so it can open
  b.part(new THREE.BoxGeometry(0.22, 0.07, 0.3), BELLY, {
    at: [0, 1.14, 1.24],
    bone: jaw,
  });

  // Tail: a sweep along a curve that ends in a dark tuft
  const tailPath = catmull([
    [0, 1.0, -0.95],
    [0, 1.08, -1.35],
    [0, 0.98, -1.7],
    [0, 0.6, -1.95],
    [0, 0.3, -2.0],
  ]);
  b.sweep(tailPath, 0.05, { color: BODY });
  b.part(new THREE.SphereGeometry(1, 10, 8), MANE_DARK, {
    at: [0, 0.27, -2.0],
    bone: hips,
    scale: [0.13, 0.15, 0.13],
  });

  return b.root;
}
