```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { countershade, mottle, paint } from "agentic-3js-builder";

export const meta = {
  name: "capybara-with-bird",
  description: "A chunky capybara in a red scarf, with a small teal-and-yellow songbird perched on its head.",
};

// Palette
const COAT = mottle("#8a5a34", "#a86f3f", { size: 0.16, seed: 4 });
const FUR = countershade(COAT, "#c99a6a", { level: -0.25 });
const MUZZLE = "#b98a5c";
const DARK = "#2b1d14";
const INK = "#140c08";
const WHITE = "#fff8ec";
const SCARF = "#e63946";
const SCARF_TRIM = "#ffd23f";
const BIRD = "#7fd16b";
const BIRD_WING = "#3aa6a0";
const BIRD_CAP = "#ff6f61";
const BEAK = "#ffb000";
const HOOF = "#4a3426";

// Scale constants
const H = 1.0; // head scale multiplier

export default function build() {
  const b = createBuilder({ name: "capybara-with-bird" });

  // ---- Skeleton ------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.5, -0.25], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.5, 0.25], role: "spine" });
  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 0.6, 0.42],
    aim: [0, 0.72, 0.56],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.7, 0.52],
    aim: [0, 0.68, 0.85],
    group: "head",
    role: "head",
  });

  // ---- Barrel body ---------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 0.52, -0.45], w: 0.42, h: 0.42 },
      { at: [0, 0.5, -0.15], w: 0.6, h: 0.5 },
      { at: [0, 0.5, 0.15], w: 0.62, h: 0.52 },
      { at: [0, 0.52, 0.4], w: 0.5, h: 0.46 },
    ],
    { bone: [hips, chest, neck], color: FUR },
  );

  // Pale belly band (a squashed tube under the body)
  b.sweep(
    [
      [0, 0.27, -0.3],
      [0, 0.25, 0.0],
      [0, 0.26, 0.3],
    ],
    [0.2, 0.05],
    { bone: [hips, chest], color: "#d9ad7a" },
  );

  // ---- Little red scarf around the neck ------------------------------------
  const band = b.ring(neck, { count: 12, radius: 0.2 });
  b.sweep(
    // closed loop through the ring items
    (band.items as any).length ? (band as any).items : [],
    0.03,
    { color: SCARF },
  );
  b.stick(new THREE.BoxGeometry(0.05, 0.1, 0.02), SCARF_TRIM, neck.local({ forward: 0.2, up: -0.12 }), {
    embed: 0.2,
  });

  // ---- Head ----------------------------------------------------------------
  b.part(new THREE.SphereGeometry(1, 12, 9), FUR, {
    bone: head,
    at: head.local({ up: 0.0, forward: 0.02 }),
    scale: [0.2 * H, 0.17 * H, 0.24 * H],
  });

  // Blunt snout
  b.part(new THREE.SphereGeometry(1, 10, 8), MUZZLE, {
    bone: head,
    at: head.local({ up: -0.07, forward: 0.2 }),
    scale: [0.15 * H, 0.1 * H, 0.1 * H],
  });

  // Nostrils, eyes and ears, mirrored
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.018, 5, 4), DARK, {
      bone: head,
      at: head.local({ left: s * 0.05, up: -0.05, forward: 0.31 }),
    });

    // Eye with a tiny highlight
    b.part(new THREE.SphereGeometry(0.035, 7, 5), INK, {
      bone: head,
      at: head.local({ left: s * 0.13, up: 0.05, forward: 0.13 }),
    });
    b.part(new THREE.SphereGeometry(0.011, 4, 3), WHITE, {
      bone: head,
      at: head.local({ left: s * 0.14, up: 0.065, forward: 0.15 }),
    });

    // Round little ears
    b.part(new THREE.SphereGeometry(1, 7, 5), FUR, {
      bone: head,
      at: head.local({ left: s * 0.1, up: 0.16, forward: -0.04 }),
      scale: [0.05, 0.04, 0.02],
    });
  }

  // ---- Bird perched on the head --------------------------------------------
  const birdBody = head.local({ up: 0.25, forward: -0.02 });
  b.part(new THREE.SphereGeometry(1, 10, 8), BIRD, {
    bone: head,
    at: birdBody,
    scale: [0.085, 0.075, 0.11],
  });
  // Cap
  b.part(new THREE.SphereGeometry(1, 8, 5), BIRD_CAP, {
    bone: head,
    at: head.local({ up: 0.31, forward: -0.01 }),
    scale: [0.075, 0.04, 0.09],
  });
  // Head with cap sitting on the body
  b.part(new THREE.SphereGeometry(1, 9, 7), BIRD, {
    bone: head,
    at: head.local({ up: 0.33, forward: 0.06 }),
    scale: [0.06, 0.06, 0.06],
  });
  // Beak
  b.part(new THREE.ConeGeometry(0.02, 0.07, 6), BEAK, {
    bone: head,
    at: head.local({ up: 0.33, forward: 0.12 }),
    dir: [0, 0, 1],
  });
  // Eye
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.009, 4, 3), INK, {
      bone: head,
      at: head.local({ left: s * 0.03, up: 0.35, forward: 0.1 }),
    });
  }
  // Wings folded on the sides
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 7, 5), BIRD_WING, {
      bone: head,
      at: head.local({ left: s * 0.075, up: 0.25, forward: -0.03 }),
      scale: [0.02, 0.05, 0.07],
    });
  }
  // Tiny legs gripping the head
  for (const s of [1, -1]) {
    b.rod(
      head.local({ left: s * 0.02, up: 0.18, forward: -0.01 }),
      head.local({ left: s * 0.02, up: 0.2, forward: -0.01 }),
      0.006,
      BEAK,
      { bone: head },
    );
  }

  // ---- Legs ----------------------------------------------------------------
  const legs: [number, number, THREE.Object3D | any][] = [
    [0.2, 0.25, chest],
    [-0.2, 0.25, chest],
    [0.22, -0.25, hips],
    [-0.22, -0.25, hips],
  ];
  for (const [x, z, bone] of legs) {
    b.rod([x, 0.36, z], [x, 0.09, z], 0.065, FUR, { bone });
    // Stubby hoof
    b.part(new THREE.SphereGeometry(1, 8, 5), HOOF, {
      bone,
      at: [x, 0.05, z + 0.02],
      scale: [0.08, 0.05, 0.085],
    });
  }

  // ---- Tail stub ------------------------------------------------------------
  b.part(new THREE.SphereGeometry(1, 6, 4), FUR, {
    bone: hips,
    at: [0, 0.45, -0.5],
    scale: [0.04, 0.03, 0.03],
  });

  // ---- Freckle speckles on the body surface --------------------------------
  const surf = b.surface(body);
  for (const hit of surf.scatter(35, { rng: rng(5), minDist: 0.09 })) {
    b.stick(new THREE.SphereGeometry(0.014, 4, 3), DARK, hit, { embed: 0.5 });
  }

  return b.root;
}
```