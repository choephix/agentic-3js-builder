```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "owl",
  description:
    "A stylised perched owl: round body, pale facial disc, large yellow eyes, ear tufts, folded wings and a short tail.",
};

export default function build() {
  const b = createBuilder({ name: "owl" });

  const BROWN = "#6b4a2b";
  const DARK = "#3b2814";
  const CREAM = "#e9dcb9";
  const BEAK = "#e39a3b";
  const EYE = "#f5c542";
  const PUPIL = "#121212";
  const FEET = "#3a3a3a";

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.14, 0] });
  const chest = b.joint("chest", { at: [0, 0.3, 0], parent: hips });
  const head = b.joint("head", { at: [0, 0.47, 0], parent: chest });
  const tail = b.joint("tail", { at: [0, 0.15, -0.1], parent: hips });

  // Body: an upright egg
  b.part(new THREE.SphereGeometry(0.13, 20, 14), BROWN, {
    at: [0, 0.3, 0],
    bone: chest,
    scale: [1, 1.25, 0.95],
  });

  // Pale belly patch on the front of the chest
  b.part(new THREE.SphereGeometry(1, 16, 12), CREAM, {
    at: [0, 0.28, 0.1],
    bone: chest,
    scale: [0.09, 0.12, 0.04],
  });

  // Brown flecks on the belly, placed on the patch surface
  const spotX = [-0.04, 0, 0.04];
  const spotY = [0.22, 0.27, 0.32];
  for (const y of spotY) {
    for (const x of spotX) {
      const u = x / 0.09;
      const v = (y - 0.28) / 0.12;
      const inside = 1 - u * u - v * v;
      if (inside <= 0) continue;
      const z = 0.1 + 0.04 * Math.sqrt(inside);
      b.part(new THREE.SphereGeometry(0.01, 8, 6), BROWN, {
        at: [x, y, z],
        bone: chest,
        scale: [1, 1, 0.5],
      });
    }
  }

  // Head: a round skull
  b.part(new THREE.SphereGeometry(0.12, 22, 16), BROWN, {
    at: [0, 0.47, 0],
    bone: head,
    scale: [1, 0.95, 0.9],
  });

  // Pale facial disc, flattened against the front of the head
  b.part(new THREE.SphereGeometry(1, 20, 14), CREAM, {
    at: [0, 0.47, 0.09],
    bone: head,
    scale: [0.12, 0.11, 0.035],
  });

  // Dark rim round the facial disc
  b.part(new THREE.TorusGeometry(0.11, 0.012, 8, 24), DARK, {
    at: [0, 0.47, 0.08],
    bone: head,
    scale: [1, 0.9, 1],
  });

  // Eyes, rings and pupils
  for (const s of [-1, 1]) {
    const ex = s * 0.045;
    b.part(new THREE.SphereGeometry(0.042, 16, 12), EYE, {
      at: [ex, 0.49, 0.11],
      bone: head,
    });
    b.part(new THREE.TorusGeometry(0.046, 0.009, 8, 18), DARK, {
      at: [ex, 0.49, 0.125],
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.02, 10, 8), PUPIL, {
      at: [ex, 0.49, 0.147],
      bone: head,
    });
  }

  // Hooked beak
  b.part(new THREE.ConeGeometry(0.022, 0.05, 8), BEAK, {
    at: [0, 0.455, 0.14],
    bone: head,
    dir: [0, -0.35, 1],
  });

  // Ear tufts, splayed outward
  for (const s of [-1, 1]) {
    b.part(new THREE.ConeGeometry(0.022, 0.09, 6), BROWN, {
      at: [s * 0.065, 0.56, 0.0],
      bone: head,
      dir: [s * 0.35, 1, -0.15],
    });
  }

  // Wings, folded along the sides, with feather tips
  for (const s of [-1, 1]) {
    const side = s < 0 ? "L" : "R";
    const wing = b.joint(`wing${side}`, { at: [s * 0.125, 0.34, 0], parent: chest });

    b.part(new THREE.SphereGeometry(1, 16, 12), DARK, {
      at: [s * 0.13, 0.3, 0.01],
      bone: wing,
      scale: [0.04, 0.17, 0.085],
    });

    for (let k = 0; k < 3; k++) {
      b.part(new THREE.ConeGeometry(0.02, 0.08, 6), BROWN, {
        at: [s * 0.125, 0.2 - k * 0.03, -0.02 - k * 0.02],
        bone: wing,
        dir: [0, -1, -0.3],
      });
    }
  }

  // Legs, feathered stubs with talons
  for (const s of [-1, 1]) {
    const side = s < 0 ? "L" : "R";
    const hip = b.joint(`hip${side}`, { at: [s * 0.06, 0.14, 0], parent: hips });

    b.part(new THREE.CapsuleGeometry(0.022, 0.05, 4, 8), FEET, {
      at: [s * 0.06, 0.08, 0],
      bone: hip,
    });

    b.part(new THREE.SphereGeometry(0.03, 10, 8), FEET, {
      at: [s * 0.06, 0.02, 0.01],
      bone: hip,
      scale: [1, 0.6, 1.1],
    });

    for (const t of [-1, 0, 1]) {
      b.part(new THREE.ConeGeometry(0.011, 0.035, 5), FEET, {
        at: [s * 0.06 + t * 0.02, 0.02, 0.035],
        bone: hip,
        dir: [t * 0.3, -0.2, 1],
      });
    }
  }

  // Short fanned tail
  b.part(new THREE.SphereGeometry(1, 14, 10), BROWN, {
    at: [0, 0.15, -0.14],
    bone: tail,
    scale: [0.07, 0.02, 0.11],
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), DARK, {
    at: [0, 0.145, -0.2],
    bone: tail,
    scale: [0.05, 0.012, 0.05],
  });

  return b.root;
}
```