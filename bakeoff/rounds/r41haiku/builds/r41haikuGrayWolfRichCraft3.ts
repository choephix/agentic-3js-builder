import * as THREE from "three";
import { bezier, catmull, createBuilder, limb, mottle, rng, svg } from "../../../../src/index";
import { cel, furEdge, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "gray wolf",
  description: "A gray wolf standing alert, ears up, head raised, stylized with bold shapes and painted fur.",
};

// Palette: cool slate-grey coat, cream underside and cheeks, near-black points, amber eyes.
const GREY = "#7f8a98";
const SLATE = "#4f5968";
const CREAM = "#e9e1cf";
const DARK = "#262b35";
const NOSE = "#141218";
const AMBER = "#f2b33a";

// Coat: mottled grey over a cream underside, split by a zig-zag fur edge with a fine ink line, cel-shaded.
const COAT = cel(
  furEdge(mottle(GREY, SLATE, { size: 0.12, seed: 3 }), CREAM, {
    level: -0.2,
    teeth: 0.2,
    period: 0.024,
    ink: INK,
  }),
);

// Fur tuft drawing for the ruff and back.
const TUFT = svg(
  `<svg viewBox="0 0 32 64">
    <path d="M5 64 Q7 30 16 3 Q25 30 27 64 Z" fill="${GREY}" stroke="${INK}" stroke-width="2"/>
    <path d="M14 60 Q15 36 16 14" stroke="#c9d0da" stroke-width="2" fill="none"/>
  </svg>`,
  { size: 128 },
);

// Amber eye with a slit pupil, hard highlight and a heavy brow.
const EYE = svg(
  `<svg viewBox="0 0 64 40">
    <ellipse cx="32" cy="22" rx="28" ry="15" fill="${INK}"/>
    <ellipse cx="32" cy="22" rx="23" ry="11.5" fill="${AMBER}"/>
    <ellipse cx="32" cy="22" rx="4.5" ry="10.5" fill="${INK}"/>
    <ellipse cx="26" cy="16" rx="3" ry="2.2" fill="#ffffff"/>
    <path d="M3 10 Q32 -1 61 8" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "gray-wolf" });
  const rand = rng(11);

  // Skeleton. Sides: s = 1 is the creature's left (+X), s = -1 its right.

  // Hips, then a back spine running forward to the chest.
  const hips = b.joint("hips", { at: [0, 0.9, -0.45], aim: [0, 0.93, -0.1], role: "spine" });
  const back = b.chain("back", catmull([[0, 0.9, -0.45], [0, 0.93, -0.1], [0, 0.98, 0.2]]), {
    parent: hips,
    names: ["back1", "back2"],
    role: "spine",
  });
  const chest = back.joints[1];

  // Neck rising into an alert, raised head.
  const neck = b.chain("neck", catmull([[0, 0.98, 0.2], [0, 1.08, 0.3], [0, 1.18, 0.38]]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.22, 0.42],
    aim: [0, 1.32, 0.6],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.05, up: -0.04 }),
    aim: head.local({ forward: 0.2, up: -0.07 }),
    role: "jaw",
  });

  // Tail held low and out, tip slightly lifted.
  const tail = b.chain(
    "tail",
    catmull([[0, 0.9, -0.46], [0, 0.86, -0.7], [0, 0.9, -0.95], [0, 1.02, -1.1]]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // Body volumes.
  const torso = b.sweep(
    back,
    (t: number) => [0.13 + 0.03 * Math.sin(Math.PI * t), 0.14 + 0.04 * Math.sin(Math.PI * t)] as [number, number],
    { color: COAT },
  );
  b.sweep(neck, (t: number) => 0.1 - 0.02 * t, { color: COAT });
  b.sweep(tail, { radius: (t: number) => 0.075 * (1 - t) + 0.025, color: COAT, bands: [[0.78, COAT], [1, DARK]] });

  // Heavy shoulders and haunches for a bold silhouette.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 12, 9), COAT, {
      bone: chest,
      at: [s * 0.1, 0.84, 0.16],
      scale: [0.12, 0.13, 0.14],
    });
    b.part(new THREE.SphereGeometry(1, 12, 9), COAT, {
      bone: hips,
      at: [s * 0.1, 0.9, -0.4],
      scale: [0.11, 0.12, 0.14],
    });
  }

  // Legs. Front legs bend elbow-back; hind legs bend knee-forward and hock-back.
  for (const s of [1, -1]) {
    const name = s > 0 ? "L" : "R";

    const frontPts = limb([s * 0.12, 0.8, 0.22], [s * 0.12, 0.025, 0.26], [0.4, 0.38], [[0, 0, -1]]);
    const fore = b.chain(`foreleg${name}`, frontPts, {
      parent: chest,
      names: [`shoulder${name}`, `elbow${name}`, `paw${name}`],
      role: "leg",
    });
    b.sweep(fore, (t: number) => 0.072 - 0.024 * t, { color: COAT });
    b.part(new THREE.SphereGeometry(0.05, 8, 6), DARK, {
      bone: fore.tip!,
      at: [s * 0.12, 0.02, 0.29],
      scale: [0.85, 0.5, 1.4],
    });

    const hindPts = limb([s * 0.12, 0.86, -0.42], [s * 0.12, 0.025, -0.4], [0.36, 0.36, 0.3], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hind = b.chain(`hindleg${name}`, hindPts, {
      parent: hips,
      names: [`hip${name}`, `knee${name}`, `hock${name}`, `hpaw${name}`],
      role: "leg",
    });
    b.sweep(hind, (t: number) => 0.095 - 0.045 * t, { color: COAT });
    b.part(new THREE.SphereGeometry(0.05, 8, 6), DARK, {
      bone: hind.tip!,
      at: [s * 0.12, 0.02, -0.37],
      scale: [0.85, 0.5, 1.5],
    });
  }

  // Head: skull, long muzzle, nose, lower jaw and cream cheeks.
  b.part(new THREE.SphereGeometry(1, 14, 10), COAT, {
    bone: head,
    at: head.local({ up: 0.03, forward: -0.01 }),
    scale: [0.105, 0.1, 0.13],
  });
  b.sweep(
    bezier(
      head.local({ forward: 0.0, up: 0.0 }),
      head.local({ forward: 0.11, up: -0.02 }),
      head.local({ forward: 0.2, up: -0.03 }),
    ),
    [0.065, 0.045],
    { bone: head, color: COAT },
  );
  b.part(new THREE.SphereGeometry(0.028, 8, 6), NOSE, {
    bone: head,
    at: head.local({ forward: 0.21, up: -0.02 }),
    scale: [1.1, 0.8, 1],
  });
  b.sweep(
    bezier(
      head.local({ forward: 0.04, up: -0.05 }),
      head.local({ forward: 0.12, up: -0.08 }),
      head.local({ forward: 0.18, up: -0.07 }),
    ),
    [0.04, 0.02],
    { bone: jaw, color: CREAM },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 7), CREAM, {
      bone: head,
      at: head.local({ left: s * 0.06, up: -0.045, forward: 0.05 }),
      scale: [0.05, 0.04, 0.07],
    });
  }

  // Ears: tall, flat triangles standing up and forward for alertness.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.05, 0],
        [0.05, 0],
        [0.0, 0.15, "sharp"],
      ],
      {
        at: head.local({ left: s * 0.05, up: 0.08, forward: -0.02 }),
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.016,
        bone: head,
        color: COAT,
      },
    );
  }

  // Eyes: amber drawn decals, glowing a little.
  for (const s of [1, -1]) {
    glow(
      b.decal(head, EYE, {
        at: head.local({ left: s * 0.052, up: 0.03, forward: 0.1 }),
        dir: head.dir([-s * 0.4, 0, 1]),
        size: [0.05, 0.031],
      }),
      0.6,
    );
  }

  // Fur ruff on the neck, shoulders and back: cards of tufts on the surface.
  const hits = b.surface(torso).scatter(90, {
    rng: rand,
    minDist: 0.035,
    filter: (h) => h.n.y > -0.35,
  });
  b.cards(hits, TUFT, {
    size: [0.04, 0.09],
    lean: 50,
    flow: [0, -0.2, -1],
    vary: 0.3,
    rng: rand,
    color: COAT,
  });

  return b.root;
}
