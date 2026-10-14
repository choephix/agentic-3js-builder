```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

const GREEN = "#5fae3c";
const SPOT = "#1f4a1e";
const BELLY = "#e6e89a";
const EYE = "#ffcc2e";
const BLACK = "#141414";
const MOUTH = "#3a1a1a";

export const meta = {
  name: "frog",
  description: "A stocky green frog with bulging gold eyes, dark spots, a wide mouth and splayed webbed feet.",
};

// Flattened or stretched sphere, centred on the origin.
function ell(rx: number, ry: number, rz: number, r: number) {
  const g = new THREE.SphereGeometry(r, 12, 9);
  g.scale(rx, ry, rz);
  return g;
}

// Height of the dorsal surface of the body ellipsoid at (x, z), for placing spots.
function dorsalY(x: number, z: number) {
  const k = 1 - (x / 0.04) ** 2 - (z / 0.052) ** 2;
  return 0.045 + 0.032 * Math.sqrt(Math.max(0, k)) - 0.002;
}

export default function build() {
  const b = createBuilder({ name: "frog" });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.045, -0.02] });
  const chest = b.joint("chest", { at: [0, 0.05, 0.02], parent: hips });
  const head = b.joint("head", { at: [0, 0.055, 0.06], parent: chest });
  const jaw = b.joint("jaw", { at: [0, 0.045, 0.07], parent: head });

  // Body: a fat green bean with a paler belly underneath
  b.part(ell(1, 0.8, 1.3, 0.04), GREEN, { at: [0, 0.045, 0], bone: hips });
  b.part(ell(0.9, 0.5, 1.15, 0.038), BELLY, { at: [0, 0.034, 0.005], bone: hips });

  // Dorsal spots, seated on the back surface
  const spotPoints: [number, number][] = [
    [0.02, -0.015],
    [-0.022, -0.02],
    [0.01, 0.02],
    [-0.015, 0.03],
    [0.028, 0.0],
    [-0.03, 0.005],
  ];
  for (const [x, z] of spotPoints) {
    b.part(new THREE.SphereGeometry(0.007, 8, 6), SPOT, {
      at: [x, dorsalY(x, z), z],
      bone: hips,
    });
  }

  // Head: wide and low, with a dark mouth line and a pale throat under the jaw
  b.part(ell(1.45, 0.65, 0.95, 0.03), GREEN, { at: [0, 0.058, 0.07], bone: head });
  b.part(new THREE.BoxGeometry(0.07, 0.006, 0.02), MOUTH, { at: [0, 0.05, 0.09], bone: head });
  b.part(new THREE.BoxGeometry(0.06, 0.008, 0.018), BELLY, { at: [0, 0.047, 0.08], bone: jaw });

  // Bulging eyes with pupils facing forward
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.016, 12, 9), EYE, { at: [s * 0.03, 0.08, 0.072], bone: head });
    b.part(new THREE.SphereGeometry(0.008, 8, 6), BLACK, { at: [s * 0.03, 0.08, 0.087], bone: head });
  }

  // Segment helper: a capsule from a to b, aimed along its length
  const seg = (
    a: number[],
    c: number[],
    r: number,
    color: string,
    bone: any,
  ) => {
    const len = Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const geo = new THREE.CapsuleGeometry(r, Math.max(len - 2 * r, 0.001), 4, 8);
    b.part(geo, color, {
      at: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2],
      aim: c,
      bone,
    });
  };

  // Limbs, mirrored for left (+X) and right (-X)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Hind leg: thigh folds out and forward, shin folds back, webbed foot splays backward
    const hip = b.joint("hip" + side, { at: [s * 0.035, 0.04, -0.02], parent: hips });
    const knee = b.joint("knee" + side, { at: [s * 0.07, 0.024, 0.012], parent: hip });
    const ankle = b.joint("ankle" + side, { at: [s * 0.05, 0.012, -0.04], parent: knee });

    seg([s * 0.035, 0.04, -0.02], [s * 0.07, 0.024, 0.012], 0.011, GREEN, hip);
    seg([s * 0.07, 0.024, 0.012], [s * 0.05, 0.012, -0.04], 0.008, GREEN, knee);

    b.part(ell(1.1, 0.25, 1.6, 0.022), GREEN, { at: [s * 0.06, 0.008, -0.07], bone: ankle });
    for (const t of [[0.072, -0.1], [0.062, -0.102], [0.082, -0.098]]) {
      b.part(new THREE.SphereGeometry(0.005, 8, 6), GREEN, {
        at: [s * t[0], 0.004, t[1]],
        bone: ankle,
      });
    }

    // Front leg: shoulder, elbow, wrist, splayed hand with small digits
    const shoulder = b.joint("shoulder" + side, { at: [s * 0.04, 0.058, 0.035], parent: chest });
    const elbow = b.joint("elbow" + side, { at: [s * 0.075, 0.03, 0.055], parent: shoulder });
    const wrist = b.joint("wrist" + side, { at: [s * 0.085, 0.008, 0.09], parent: elbow });

    seg([s * 0.04, 0.058, 0.035], [s * 0.075, 0.03, 0.055], 0.007, GREEN, shoulder);
    seg([s * 0.075, 0.03, 0.055], [s * 0.085, 0.008, 0.09], 0.006, GREEN, elbow);

    b.part(ell(0.9, 0.25, 1.2, 0.016), GREEN, { at: [s * 0.09, 0.006, 0.105], bone: wrist });
    for (const t of [[0.1, 0.12], [0.09, 0.122], [0.106, 0.112]]) {
      b.part(new THREE.SphereGeometry(0.0045, 8, 6), GREEN, {
        at: [s * t[0], 0.004, t[1]],
        bone: wrist,
      });
    }
  }

  return b.root;
}
```