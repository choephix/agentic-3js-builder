```ts
import * as THREE from "three";
import { createBuilder, catmull, rng } from "agentic-3js-builder";

export const meta = {
  name: "Resting Lion",
  description:
    "A proud old lion in a sphinx rest, head held high, with a golden-to-chocolate shaggy mane, cream muzzle and belly, amber eyes, a scarred brow and a dark-tufted tail.",
};

const TAWNY = "#c8893f";
const CREAM = "#f1dfb6";
const CHOCOLATE = "#3b2116";
const AMBER = "#e7a13a";
const NOSE = "#1c1512";
const SCAR = "#6e3a32";
const PAD = "#3a2418";
const MANE = ["#e9b64c", "#d69a3a", "#b87330", "#8a4e26", "#55301a"];

export default function build() {
  const b = createBuilder({ name: "resting-lion" });
  const r = rng(7);

  // Skeleton: hips root, spine runs forward through chest and neck to the head.
  const hips = b.joint("hips", { at: [0, 0.62, -0.62] });

  const spinePath = catmull([
    [0, 0.62, -0.62],
    [0, 0.63, -0.2],
    [0, 0.67, 0.2],
    [0, 0.8, 0.5],
    [0, 1.0, 0.7],
    [0, 1.15, 0.85],
  ]);
  const spine = b.chain("spine", spinePath, { role: "spine" });

  const head = b.joint("head", {
    at: [0, 1.22, 0.92],
    aim: [0, 1.22, 1.25],
    up: [0, 1, 0],
  });
  const jaw = b.joint("jaw", {
    at: [0, 1.1, 1.0],
    aim: [0, 1.1, 1.25],
    up: [0, 1, 0],
  });

  const tailPath = catmull([
    [0, 0.62, -0.62],
    [0, 0.66, -0.95],
    [0, 0.52, -1.25],
    [0, 0.28, -1.42],
    [0, 0.12, -1.5],
  ]);
  const tail = b.chain("tail", tailPath, { role: "tail" });

  // Torso and neck as one continuous tawny tube.
  b.sweep(spine, 0.27, { color: TAWNY });

  // Cream underbelly and chest.
  b.sweep(
    [
      [0, 0.4, -0.5],
      [0, 0.42, -0.1],
      [0, 0.44, 0.25],
      [0, 0.55, 0.5],
    ],
    0.2,
    { color: CREAM },
  );

  // Haunches folded beside the body.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.2, 14, 10), TAWNY, {
      at: [s * 0.24, 0.48, -0.42],
      scale: [1, 1.1, 1.2],
    });
    b.sweep(
      [
        [s * 0.25, 0.4, -0.3],
        [s * 0.22, 0.15, -0.2],
        [s * 0.2, 0.06, 0.02],
      ],
      0.07,
      { color: TAWNY },
    );
    // Big padded hind paw.
    b.part(new THREE.SphereGeometry(0.1, 12, 8), TAWNY, {
      at: [s * 0.2, 0.05, 0.08],
      scale: [1.2, 0.55, 1.5],
    });
  }

  // Forelegs stretched forward on the ground.
  for (const s of [1, -1]) {
    b.sweep(
      [
        [s * 0.2, 0.55, 0.35],
        [s * 0.22, 0.3, 0.45],
        [s * 0.22, 0.12, 0.6],
        [s * 0.22, 0.06, 0.9],
      ],
      0.085,
      { color: TAWNY },
    );
    // Big padded paw with a dark toe pad row.
    b.part(new THREE.SphereGeometry(0.1, 12, 8), TAWNY, {
      at: [s * 0.22, 0.05, 0.95],
      scale: [1.2, 0.55, 1.4],
    });
    for (const dx of [-0.04, 0, 0.04]) {
      b.part(new THREE.SphereGeometry(0.025, 6, 4), PAD, {
        at: [s * 0.22 + dx, 0.04, 1.08],
      });
    }
  }

  // Head: tawny skull, cream muzzle, black nose, separate lower jaw.
  b.part(new THREE.SphereGeometry(0.2, 18, 12), TAWNY, {
    at: [0, 1.22, 0.92],
    bone: head,
    scale: [1, 1.05, 0.95],
  });
  b.part(new THREE.SphereGeometry(0.11, 12, 8), CREAM, {
    at: [0, 1.16, 1.08],
    bone: head,
    scale: [0.9, 0.7, 1.0],
  });
  b.part(new THREE.SphereGeometry(0.05, 8, 6), NOSE, {
    at: [0, 1.19, 1.2],
    bone: head,
    scale: [1.5, 0.9, 0.7],
  });
  b.part(new THREE.SphereGeometry(0.1, 12, 8), CREAM, {
    at: [0, 1.08, 1.02],
    bone: jaw,
    scale: [0.8, 0.35, 0.9],
  });

  // Rounded ears.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.05, 8, 6), TAWNY, {
      at: [s * 0.13, 1.4, 0.88],
      bone: head,
    });
  }

  // Amber eyes.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.035, 10, 8), AMBER, {
      at: [s * 0.085, 1.28, 1.1],
      bone: head,
    });
  }

  // Scar across the left eyebrow (the lion's left is +X).
  const scarGeo = new THREE.BoxGeometry(0.1, 0.014, 0.025);
  scarGeo.rotateZ(-0.4);
  b.part(scarGeo, SCAR, { at: [0.1, 1.345, 1.08], bone: head });

  // Shaggy mane: a ring of tufts round the head, gold near the face, dark chocolate at the edge.
  const H = [0, 1.22, 0.92];
  const N = 64;
  for (let i = 0; i < N; i++) {
    const theta = (i / N) * Math.PI * 2 + (r() - 0.5) * 0.08;
    const cy = Math.cos(theta);
    if (cy < -0.55) continue; // keep the chin clear
    const sx = Math.sin(theta);

    const rad = 0.14 + r() * 0.2;
    const t = (rad - 0.14) / 0.2;
    const colour = MANE[Math.min(MANE.length - 1, Math.floor(t * MANE.length))];

    const pos = [H[0] + sx * rad, H[1] + cy * rad, H[2] - 0.1];
    const dir = new THREE.Vector3(
      sx * (0.85 + r() * 0.3),
      cy * (0.85 + r() * 0.3),
      -0.1 - r() * 0.35,
    ).normalize();

    b.part(new THREE.ConeGeometry(0.045, 0.2, 5, 1), colour, {
      at: pos,
      dir,
      bone: head,
    });
  }

  // Tail tuft: a dark chocolate brush at the tip.
  b.part(new THREE.SphereGeometry(0.1, 10, 8), CHOCOLATE, {
    at: [0, 0.12, -1.5],
    bone: tail,
  });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const dir = new THREE.Vector3(Math.cos(a) * 0.6, -0.4 + r() * 0.3, Math.sin(a) * 0.6).normalize();
    b.part(new THREE.ConeGeometry(0.05, 0.14, 5, 1), CHOCOLATE, {
      at: [0, 0.12, -1.5],
      dir,
      bone: tail,
    });
  }

  // Tail body.
  b.sweep(tail, 0.045, { color: TAWNY });

  return b.root;
}
```