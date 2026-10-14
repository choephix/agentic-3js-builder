```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, mottle, rng } from "agentic-3js-builder";

export const meta = {
  name: "Reef octopus with a brass key",
  description:
    "A curious coral-and-rust reef octopus with a bumpy, mottled mantle, golden bar-pupiled eyes, cream-suckered arms, and one arm raised to show off an old brass key from a wreck.",
};

// Paints: mottled coral on top, paler underside.
const coral = mottle("#b5452c", "#e9a47f", { size: 0.07, seed: 3 });
const skin = countershade(coral, "#eec2a6", { level: 0, soft: 0.45 });

const CREAM = "#f3e6c9";
const BRASS = "#c9a040";
const DARK = "#1d140f";
const GOLD = "#e8b434";
const BUMP = "#7d2a1b";
const BROW = "#6e2818";

const MANTLE_AT = [0, 0.36, 0];

/** Arm radius at source t along the arm: thick at the root, fine at the tip. */
const armRadius = (t: number) => 0.056 * (1 - t) ** 0.7 + 0.012;

/** A resting arm: out from under the mantle, then curling round on the floor. */
function curlPoints(theta: number, turn: number): number[][] {
  return Array.from({ length: 9 }, (_, i) => {
    const s = i / 8;
    const ang = theta + turn * 1.6 * s;
    const rad = 0.07 + 0.66 * s * (1.1 - s);
    const y = 0.012 + 0.14 * (1 - s) ** 2;
    return [Math.sin(ang) * rad, y, Math.cos(ang) * rad];
  });
}

/** The arm that holds up the key: front-left, then raised, its tip wrapped round the key's shaft. */
const KEY_ARM: number[][] = [
  [0.04, 0.15, 0.06],
  [0.1, 0.11, 0.2],
  [0.13, 0.2, 0.3],
  [0.12, 0.42, 0.36],
  [0.13, 0.6, 0.37],
  [0.13, 0.7, 0.36],
];

export default function reefOctopus() {
  const b = createBuilder({ name: "reef-octopus", detail: 1, paintSize: 1024 });

  const mantle = b.joint("mantle", { at: MANTLE_AT });

  // Eight arms, each a chain rooted under the mantle, with a tapering painted tube on it.
  const arms = Array.from({ length: 8 }, (_, k) => {
    const points = k === 0 ? KEY_ARM : curlPoints((k * Math.PI) / 4 + 0.2, k % 2 === 0 ? 1 : -1);
    const chain = b.chain(`arm${k + 1}`, catmull(points), {
      parent: mantle,
      role: "tentacle",
      names: (i: number) => `arm${k + 1}_${i + 1}`,
    });
    const tube = b.sweep(chain, armRadius, { color: skin, name: `arm${k + 1}` });
    return { chain, tube, k };
  });

  // The bulbous mantle head.
  const head = b.part(new THREE.SphereGeometry(0.2, 20, 14), skin, {
    at: MANTLE_AT,
    scale: [1, 1.15, 0.95],
    bone: "mantle",
    name: "mantle",
  });

  // Golden eyes with bar pupils and grumpy brows.
  for (const sx of [1, -1]) {
    const side = sx > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.05, 16, 12), GOLD, {
      at: [sx * 0.09, 0.4, 0.17],
      bone: "mantle",
      name: `eye${side}`,
    });
    b.part(new THREE.BoxGeometry(0.052, 0.016, 0.012), DARK, {
      at: [sx * 0.09, 0.4, 0.215],
      bone: "mantle",
      name: `pupil${side}`,
    });
    // Outer end high, inner end dropped toward the midline: a frown.
    b.capsule([sx * 0.14, 0.48, 0.115], [sx * 0.055, 0.455, 0.19], 0.016, {
      color: BROW,
      bone: "mantle",
      name: `brow${side}`,
    });
  }

  // Little bumps scattered over the mantle, kept off the eyes and the underside.
  const eyeSpots = [-0.09, 0.09].map((x) => new THREE.Vector3(x, 0.4, 0.17));
  const headBumps = b.surface(head).scatter(70, {
    rng: rng(7),
    minDist: 0.034,
    keepOut: (p) => p.y < 0.2 || eyeSpots.some((e) => p.distanceTo(e) < 0.085),
    filter: (hit) => hit.n.y > -0.3,
  });
  const bumpGeo = new THREE.SphereGeometry(0.013, 6, 4);
  for (const hit of headBumps) b.stick(bumpGeo, BUMP, hit, { embed: 0.45 });

  // Bumps along the arms too.
  for (const { tube, k } of arms) {
    const armBumps = b.surface(tube).scatter(6, {
      rng: rng(30 + k),
      minDist: 0.03,
      keepOut: (p) => p.y < 0.02,
    });
    for (const hit of armBumps) b.stick(new THREE.SphereGeometry(0.011, 5, 4), BUMP, hit, { embed: 0.45 });
  }

  // Cream suckers in rows along the underside of every arm. Three per row, keeping those facing downward.
  const suckerGeo = new THREE.CylinderGeometry(0.0095, 0.0095, 0.007, 7);
  for (const { chain } of arms) {
    for (let row = 0; row < 9; row++) {
      const t = 0.1 + (0.8 * row) / 8;
      const { items } = b.ring(chain.at(t), { count: 3, radius: armRadius(t) * 0.95 });
      for (const item of items) {
        if (item.outward.y < -0.05) b.part(suckerGeo, CREAM, { frame: item, dir: item.outward });
      }
    }
  }

  // The brass key, held up by the raised arm's tip (joint arm1_5).
  const keyX = 0.13;
  const keyZ = 0.36;
  b.part(new THREE.BoxGeometry(0.012, 0.24, 0.012), BRASS, {
    at: [keyX, 0.74, keyZ],
    bone: "arm1_5",
    name: "keyShaft",
  });
  b.part(new THREE.TorusGeometry(0.034, 0.008, 8, 16), BRASS, {
    at: [keyX, 0.894, keyZ],
    bone: "arm1_5",
    name: "keyBow",
  });
  b.part(new THREE.BoxGeometry(0.035, 0.012, 0.012), BRASS, {
    at: [keyX + 0.0175, 0.63, keyZ],
    bone: "arm1_5",
    name: "keyTooth",
  });
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.012), BRASS, {
    at: [keyX + 0.015, 0.655, keyZ],
    bone: "arm1_5",
    name: "keyTooth",
  });

  return b.root;
}
```