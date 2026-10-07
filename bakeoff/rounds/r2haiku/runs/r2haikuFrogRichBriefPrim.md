```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Red-eyed tree frog",
  description: "Lime-green tree frog with blue and cream flank stripes, orange sticky toe pads and huge ruby eyes, clinging to a leaf.",
};

const LIME = "#7fd13b";
const LIME_DARK = "#4fa02a";
const CREAM = "#f3ecd2";
const BLUE = "#2a6fb0";
const ORANGE = "#f2862b";
const RED = "#b3122e";
const BLACK = "#101410";
const WHITE = "#ffffff";
const LEAF = "#3c9a3a";
const MIDRIB = "#2b7a2c";
const MOUTH = "#1e3d1c";

// Body centre and the ellipsoid it uses (half-width 0.05, half-height 0.0425, half-depth 0.06)
const CY = 0.165;
const CZ = 0.06;

// Half-width of the body at height y (used to seat flank stripes on the curved side)
const halfX = (y: number) => 0.05 * Math.sqrt(Math.max(0, 1 - ((y - CY) / 0.0425) ** 2));

export default function build() {
  const b = createBuilder({ name: "red-eyed-tree-frog" });
  const r = rng(11);

  // Root skeleton joint: the hips sit at the centre of the body
  b.joint("hips", { at: [0, CY, CZ] });

  // ---- Leaf (prop): a flattened vertical ellipsoid whose lowest point touches y = 0 ----
  b.part(new THREE.SphereGeometry(0.3, 20, 14), LEAF, {
    at: [0, 0.345, -0.012],
    scale: [0.85, 1.15, 0.03],
  });
  // Midrib and a few side veins on the leaf face
  b.part(new THREE.BoxGeometry(0.008, 0.52, 0.004), MIDRIB, { at: [0, 0.345, -0.003] });
  for (const s of [-1, 1]) {
    for (const y of [0.2, 0.3, 0.4, 0.5]) {
      b.part(new THREE.BoxGeometry(0.1, 0.004, 0.004), MIDRIB, {
        at: [s * 0.06, y, -0.003],
      });
    }
  }

  // ---- Body: lime ellipsoid, belly, flank stripes, back spots ----
  b.part(new THREE.SphereGeometry(0.05, 16, 12), LIME, {
    at: [0, CY, CZ],
    scale: [1.0, 0.85, 1.2],
  });

  // Cream belly bulging forward and down
  b.part(new THREE.SphereGeometry(0.038, 14, 10), CREAM, {
    at: [0, 0.13, 0.085],
    scale: [0.85, 0.55, 0.9],
  });

  // Blue and cream flank stripes, seated on the curved side
  const stripes = [
    { y: 0.135, c: BLUE },
    { y: 0.15, c: CREAM },
    { y: 0.165, c: BLUE },
    { y: 0.18, c: CREAM },
  ];
  for (const s of [-1, 1]) {
    for (const st of stripes) {
      const x = s * halfX(st.y) * 0.9;
      b.part(new THREE.BoxGeometry(0.008, 0.009, 0.05), st.c, {
        at: [x, st.y, CZ - 0.005],
      });
    }
  }

  // Scattered darker spots on the back, placed on the body surface
  for (let i = 0; i < 14; i++) {
    const t = r() * Math.PI * 0.85; // polar angle from the top
    const a = Math.PI * 0.5 + (r() - 0.5) * Math.PI * 1.2; // mostly the back (toward -Z)
    const x = 0.05 * Math.sin(t) * Math.cos(a) * 1.0;
    const y = CY + 0.0425 * Math.cos(t);
    const z = CZ - 0.06 * Math.sin(t) * Math.abs(Math.sin(a)) * 1.0;
    b.part(new THREE.SphereGeometry(0.0045, 8, 6), LIME_DARK, {
      at: [x, y, z],
      scale: [1, 1, 0.4],
    });
  }

  // ---- Head details: ruby eyes with slit pupils, highlights, mouth, nostrils ----
  for (const s of [-1, 1]) {
    const eye: [number, number, number] = [s * 0.032, 0.214, 0.1];
    b.part(new THREE.SphereGeometry(0.022, 16, 12), RED, { at: eye });
    // Black vertical slit pupil on the front of the eye
    b.part(new THREE.SphereGeometry(0.02, 12, 10), BLACK, {
      at: [eye[0], eye[1], eye[2] + 0.021],
      scale: [0.2, 1, 0.12],
    });
    // Small white catch-light for the wide, startled look
    b.part(new THREE.SphereGeometry(0.005, 8, 6), WHITE, {
      at: [eye[0] - 0.007, eye[1] + 0.008, eye[2] + 0.019],
    });
  }

  // Wide mouth line and small nostrils
  b.part(new THREE.BoxGeometry(0.05, 0.003, 0.005), MOUTH, { at: [0, 0.163, 0.119] });
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.003, 6, 5), MOUTH, { at: [s * 0.01, 0.185, 0.118] });
  }

  // ---- Legs: folded, feet with orange sticky toe pads on the leaf ----
  const legPts = (s: number): number[][] => [
    [s * 0.035, 0.15, 0.05],
    [s * 0.085, 0.135, 0.105],
    [s * 0.07, 0.07, 0.06],
    [s * 0.045, 0.03, 0.004],
  ];
  for (const s of [-1, 1]) {
    const name = s < 0 ? "legL" : "legR";
    const leg = b.chain(name, legPts(s), { role: "leg" });
    b.sweep(leg, 0.012, { color: LIME });

    const tip = legPts(s)[3];
    for (let k = 0; k < 4; k++) {
      const toe: [number, number, number] = [tip[0] + s * 0.006 * k, tip[1] - 0.006 * (k % 2), tip[2] + 0.002];
      b.part(new THREE.SphereGeometry(0.0042, 8, 6), ORANGE, {
        at: toe,
        scale: [1, 1, 0.6],
      });
    }
  }

  // ---- Front arms: thinner, clinging to the leaf with three pads each ----
  const armPts = (s: number): number[][] => [
    [s * 0.04, 0.155, 0.11],
    [s * 0.065, 0.135, 0.088],
    [s * 0.06, 0.115, 0.03],
    [s * 0.056, 0.108, 0.004],
  ];
  for (const s of [-1, 1]) {
    const name = s < 0 ? "armL" : "armR";
    const arm = b.chain(name, armPts(s), { role: "arm" });
    b.sweep(arm, 0.007, { color: LIME });

    const tip = armPts(s)[3];
    for (let k = 0; k < 3; k++) {
      const pad: [number, number, number] = [tip[0] + s * 0.005 * k, tip[1] - 0.003 * k, tip[2] + 0.002];
      b.part(new THREE.SphereGeometry(0.0038, 8, 6), ORANGE, {
        at: pad,
        scale: [1, 1, 0.6],
      });
    }
  }

  return b.root;
}
```