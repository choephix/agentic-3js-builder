```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Bauhaus Songbird",
  description:
    "A songbird perched on a branch, built from Bauhaus primary-colour geometry: a red head disc, blue ellipsoid body, yellow belly, black crest and wing tips, on a banded black branch resting on a red cube and a yellow drum.",
};

const RED = "#d62718";
const YELLOW = "#f4c20d";
const BLUE = "#1f4aa8";
const BLACK = "#141414";
const WHITE = "#f3efe4";

export default function build() {
  const b = createBuilder({ name: "songbird" });

  // Heights: the branch top is at BR_TOP; the bird is built relative to it.
  const BR_R = 0.02;
  const BR_Y = 0.06;
  const Y0 = BR_Y + BR_R - 0.04; // bird coordinates were drafted with the branch top at y = 0.04
  const P = (x: number, y: number, z: number): [number, number, number] => [x, y + Y0, z];

  const ell = (rx: number, ry: number, rz: number, w = 12, h = 8) =>
    new THREE.SphereGeometry(1, w, h).scale(rx, ry, rz);
  const disc = (r: number, t: number, sides = 14) => new THREE.CylinderGeometry(r, r, t, sides);

  // ---- skeleton
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: P(0, 0.1, 0), dir: [0, 0, 1], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: P(0, 0.105, 0.03), dir: [0, 0.2, 1], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: P(0, 0.125, 0.05), dir: [0, 0.5, 1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: P(0, 0.14, 0.06), dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: P(0, 0.135, 0.085),
    aim: P(0, 0.135, 0.115),
    role: "jaw",
  });
  const tail1 = b.joint("tail1", { parent: hips, at: P(0, 0.1, -0.05), dir: [0, -0.15, -1], role: "tail" });
  const tail2 = b.joint("tail2", { parent: tail1, at: P(0, 0.095, -0.095), dir: [0, -0.15, -1], role: "tail" });

  const wings: Record<string, any> = {};
  const feet: Record<string, any> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const w1 = b.joint(`wing${side}1`, {
      parent: chest,
      at: P(s * 0.04, 0.115, 0.02),
      dir: [s * 0.1, -0.2, -1],
      role: "wing",
    });
    const w2 = b.joint(`wing${side}2`, {
      parent: w1,
      at: P(s * 0.042, 0.108, -0.045),
      dir: [s * 0.1, -0.2, -1],
      role: "wing",
    });
    wings[side] = [w1, w2];
    const hip = b.joint(`hip${side}`, { parent: hips, at: P(s * 0.02, 0.088, 0), dir: [0, -1, 0], role: "leg" });
    const knee = b.joint(`knee${side}`, { parent: hip, at: P(s * 0.02, 0.066, 0), dir: [0, -1, 0], role: "leg" });
    const foot = b.joint(`foot${side}`, { parent: knee, at: P(s * 0.018, 0.045, 0), dir: [0, -1, 0], role: "leg" });
    feet[side] = foot;
  }

  // ---- body
  b.part(ell(0.04, 0.04, 0.062), BLUE, { bone: hips, at: P(0, 0.1, 0), flat: true });
  b.part(ell(0.037, 0.033, 0.056), YELLOW, { bone: hips, at: P(0, 0.088, 0.008), flat: true });
  // chest emblem: red disc with a white centre
  b.part(disc(0.013, 0.004), RED, { bone: chest, at: P(0, 0.088, 0.062), dir: [0, -0.2, 1] });
  b.part(disc(0.006, 0.004), WHITE, { bone: chest, at: P(0, 0.0875, 0.0645), dir: [0, -0.2, 1] });
  // black back stripe triangle
  b.part(new THREE.ConeGeometry(0.016, 0.05, 3), BLACK, {
    bone: hips,
    at: P(0, 0.139, -0.01),
    dir: [0, 0.1, -1],
  });

  // ---- head
  b.part(ell(0.031, 0.03, 0.031, 12, 8), RED, { bone: head, at: P(0, 0.145, 0.06), flat: true });
  // black crest triangle
  b.part(new THREE.ConeGeometry(0.012, 0.038, 3), BLACK, { bone: head, at: P(0, 0.18, 0.048), dir: [0, 1, -0.6] });
  b.part(new THREE.ConeGeometry(0.009, 0.026, 3), YELLOW, { bone: head, at: P(0, 0.177, 0.058), dir: [0, 1, -0.3] });
  // beak
  b.part(new THREE.ConeGeometry(0.012, 0.035, 4).scale(1, 1, 0.75), YELLOW, {
    bone: head,
    at: P(0, 0.143, 0.1),
    dir: [0, -0.05, 1],
  });
  b.part(new THREE.ConeGeometry(0.009, 0.027, 4).scale(1, 1, 0.7), BLACK, {
    bone: jaw,
    at: P(0, 0.134, 0.097),
    dir: [0, 0.05, 1],
  });
  // eyes: white disc, black pupil, and a yellow ring-less cheek disc
  for (const s of [1, -1]) {
    const d: [number, number, number] = [s, 0.2, 0.45];
    b.part(disc(0.0095, 0.004), WHITE, { bone: head, at: P(s * 0.025, 0.153, 0.074), dir: d });
    b.part(disc(0.0055, 0.004), BLACK, { bone: head, at: P(s * 0.0268, 0.1535, 0.0765), dir: d });
    b.part(disc(0.007, 0.003), YELLOW, { bone: head, at: P(s * 0.029, 0.137, 0.065), dir: [s, -0.3, 0.3] });
  }

  // ---- wings: red ellipsoid with a white bar and black triangle tip
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const [w1, w2] = wings[side];
    b.part(ell(0.008, 0.03, 0.055), RED, {
      bone: w1,
      at: P(s * 0.041, 0.108, -0.008),
      rotation: [0, 0, s * -6],
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.003, 0.012, 0.05), WHITE, {
      bone: w1,
      at: P(s * 0.0488, 0.112, -0.012),
      rotation: [0, 0, s * -6],
    });
    b.part(new THREE.ConeGeometry(0.014, 0.05, 3), BLACK, {
      bone: w2,
      at: P(s * 0.042, 0.1, -0.075),
      dir: [s * 0.05, -0.25, -1],
    });
  }

  // ---- tail: black slab with a red square tip and yellow stripe
  b.part(new THREE.BoxGeometry(0.032, 0.004, 0.07), BLACK, {
    bone: tail1,
    at: P(0, 0.098, -0.092),
    rotation: [-9, 0, 0],
  });
  b.part(new THREE.BoxGeometry(0.0325, 0.0045, 0.01), YELLOW, {
    bone: tail1,
    at: P(0, 0.0975, -0.088),
    rotation: [-9, 0, 0],
  });
  b.part(new THREE.BoxGeometry(0.033, 0.0045, 0.014), RED, {
    bone: tail2,
    at: P(0, 0.093, -0.123),
    rotation: [-9, 0, 0],
  });

  // ---- legs and toes
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const foot = feet[side];
    b.rod(P(s * 0.02, 0.09, 0), P(s * 0.018, 0.047, 0), 0.0035, BLACK, { bone: foot });
    const fx = s * 0.018;
    const fy = 0.0465;
    b.rod(P(fx, fy, 0), P(fx + s * 0.006, fy - 0.001, 0.026), 0.0028, BLACK, { bone: foot });
    b.rod(P(fx, fy, 0), P(fx - s * 0.005, fy - 0.001, 0.025), 0.0028, BLACK, { bone: foot });
    b.rod(P(fx, fy, 0), P(fx, fy - 0.001, -0.022), 0.0028, BLACK, { bone: foot });
    b.part(new THREE.SphereGeometry(0.005, 6, 4), YELLOW, { bone: foot, at: P(fx, fy + 0.002, 0) });
  }

  // ---- branch with Bauhaus supports
  b.part(disc(BR_R, 0.46, 10), BLACK, { bone: root, at: [0, BR_Y, 0], dir: [1, 0, 0] });
  for (const [x, c] of [
    [-0.09, WHITE],
    [0.09, YELLOW],
    [-0.15, RED],
    [0.15, BLUE],
  ] as [number, string][])
    b.part(disc(BR_R + 0.0015, 0.012, 10), c, { bone: root, at: [x, BR_Y, 0], dir: [1, 0, 0] });
  b.part(new THREE.SphereGeometry(0.028, 10, 8), BLUE, { bone: root, at: [-0.235, BR_Y, 0], flat: true });
  b.part(new THREE.SphereGeometry(0.028, 10, 8), RED, { bone: root, at: [0.235, BR_Y, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.045, 0.04, 0.045), RED, { bone: root, at: [-0.17, 0.02 - 0.0, 0] });
  b.part(disc(0.025, 0.04, 16), YELLOW, { bone: root, at: [0.17, 0.02, 0] });
  b.part(new THREE.ConeGeometry(0.014, 0.025, 3), BLACK, {
    bone: root,
    at: [0.17, 0.0425, 0],
    dir: [0, 1, 0],
  });

  return b.root;
}
```