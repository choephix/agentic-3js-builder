```ts
import * as THREE from "three";
import { createBuilder, catmull, polyline } from "agentic-3js-builder";

export const meta = {
  name: "bat",
  description:
    "A stylised bat in a spread rest pose: plum body, purple scalloped wings on jointed arms and fingers, gold eyes, big coral-lined ears and fangs.",
};

const BODY = "#2a2236";
const WING = "#5b3f6e";
const DARK = "#17121f";
const BELLY = "#7d6486";
const EAR = "#e76f51";
const EYE = "#ffb703";
const FANG = "#f5f1e6";

type P = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "bat" });

  // Adds a cone from base to tip as a part, oriented along base -> tip.
  const cone = (base: P, tip: P, r: number, color: string) => {
    const d: P = [tip[0] - base[0], tip[1] - base[1], tip[2] - base[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    const mid: P = [
      (base[0] + tip[0]) / 2,
      (base[1] + tip[1]) / 2,
      (base[2] + tip[2]) / 2,
    ];
    b.part(new THREE.ConeGeometry(r, len, 8), color, {
      at: mid,
      dir: [d[0] / len, d[1] / len, d[2] / len],
    });
  };

  // Skeleton: hips root, then a spine chain running up through the neck to the head.
  b.joint("hips", { at: [0, 0.19, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.19, 0],
      [0, 0.25, 0.01],
      [0, 0.3, 0.035],
      [0, 0.36, 0.09],
    ]),
  );
  b.sweep(spine, 0.03, { color: BODY });

  // Torso, belly and head sit on the spine.
  b.part(new THREE.SphereGeometry(0.05, 12, 10), BODY, {
    at: spine.at(0.2),
    scale: [1, 1.15, 0.9],
  });
  b.part(new THREE.SphereGeometry(0.03, 10, 8), BELLY, {
    at: [0, 0.215, 0.035],
    scale: [0.9, 1.1, 0.5],
  });
  b.part(new THREE.SphereGeometry(0.045, 14, 10), BODY, {
    at: spine.at(1),
    scale: [1.1, 1, 1],
  });

  // Face: muzzle, nose leaf, glowing eyes, fangs.
  b.part(new THREE.BoxGeometry(0.034, 0.03, 0.03), BODY, {
    at: [0, 0.35, 0.125],
  });
  cone([0, 0.362, 0.136], [0, 0.4, 0.15], 0.012, DARK);

  for (const s of [1, -1]) {
    const X = (x: number): number => s * x;
    b.part(new THREE.SphereGeometry(0.009, 8, 6), EYE, {
      at: [X(0.02), 0.372, 0.13],
    });
    cone([X(0.009), 0.343, 0.128], [X(0.011), 0.322, 0.135], 0.004, FANG);

    // Big ears with a coral inner.
    cone([X(0.025), 0.395, 0.075], [X(0.045), 0.46, 0.035], 0.02, BODY);
    cone([X(0.025), 0.4, 0.08], [X(0.04), 0.445, 0.05], 0.011, EAR);
  }

  // Tail: short chain at the back of the hips.
  const tail = b.chain(
    "tail",
    polyline([
      [0, 0.18, -0.01],
      [0, 0.13, -0.07],
      [0, 0.12, -0.12],
    ]),
  );
  b.sweep(tail, 0.008, { color: DARK });

  // Left and right limbs, wings and legs.
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const X = (x: number): number => s * x;

    // Hind leg: hip, backward-pointing knee, ankle.
    const hip: P = [X(0.05), 0.18, 0];
    const knee: P = [X(0.1), 0.1, -0.03];
    const ankle: P = [X(0.05), 0.025, 0];
    const leg = b.chain(`leg${n}`, polyline([hip, knee, ankle]));
    b.sweep(leg, 0.011, { color: DARK });
    b.part(new THREE.BoxGeometry(0.024, 0.022, 0.05), DARK, {
      at: [X(0.05), 0.011, 0.02],
    });
    cone([X(0.05), 0.02, 0.045], [X(0.05), 0.0, 0.07], 0.004, FANG);

    // Wing arm: shoulder, elbow, wrist.
    const S: P = [X(0.035), 0.27, 0];
    const E: P = [X(0.12), 0.33, 0.01];
    const W: P = [X(0.22), 0.35, -0.01];
    const arm = b.chain(`arm${n}`, polyline([S, E, W]));
    b.sweep(arm, 0.008, { color: DARK });

    // Three finger bones from the wrist.
    const tips: P[] = [
      [X(0.34), 0.27, -0.02],
      [X(0.3), 0.21, -0.03],
      [X(0.24), 0.18, -0.04],
    ];
    tips.forEach((T, k) => {
      const finger = b.chain(`finger${n}${k + 1}`, polyline([W, T]));
      b.sweep(finger, k === 0 ? 0.0055 : 0.005, { color: DARK });
    });

    // Thumb claw at the elbow.
    cone(E, [X(0.15), 0.39, 0.03], 0.007, FANG);

    // Membrane: one flat scalloped silhouette, extruded thin.
    // Outline is in (u, v) with u mapped to |x| via x: [s, 0, 0].
    const outline = [
      [0.03, 0.27],
      [0.12, 0.33],
      [0.22, 0.35],
      [0.34, 0.27],
      [0.29, 0.245],
      [0.3, 0.21],
      [0.25, 0.205],
      [0.24, 0.18],
      [0.17, 0.2],
      [0.07, 0.04],
      [0.035, 0.16],
    ];
    const wingGeo = b.extrude(outline, {
      at: [0, 0, -0.003],
      x: [s, 0, 0],
      y: [0, 1, 0],
      depth: 0.006,
    });
    b.part(wingGeo, WING);
  }

  return b.root;
}
```