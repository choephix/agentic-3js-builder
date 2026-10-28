import * as THREE from "three";
import { createBuilder, catmull, bezier } from "../../../../src/index";

export const meta = {
  name: "Bauhaus Songbird",
  description: "A songbird perched on a branch, built from primary-colour Bauhaus geometry.",
};

const RED = "#d62820";
const BLUE = "#1f46a8";
const YELLOW = "#f2c200";
const BLACK = "#16161a";
const WHITE = "#f4f0e6";
const WOOD = "#6b4a2b";

export default function build() {
  const b = createBuilder({ name: "songbird" });

  // Skeleton
  const body = b.joint("body", { at: [0, 0.2, 0], role: "spine" });
  const neck = b.joint("neck", { parent: body, at: [0, 0.27, 0.05], dir: [0, 0.6, 0.8], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.33, 0.09], dir: [0, 0, 1], role: "head" });
  const jawU = b.joint("jawUpper", { parent: head, at: [0, 0.335, 0.15], dir: [0, 0, 1], role: "jaw" });
  const jawL = b.joint("jaw", { parent: head, at: [0, 0.32, 0.15], dir: [0, 0, 1], role: "jaw" });
  const tail1 = b.joint("tail1", { parent: body, at: [0, 0.2, -0.1], dir: [0, -0.2, -1], role: "tail" });
  const tail2 = b.joint("tail2", { parent: tail1, at: [0, 0.18, -0.2], dir: [0, -0.2, -1], role: "tail" });

  // Branch (a plain box limb with a stub twig)
  b.capsule([-0.35, 0.045, 0], [0.4, 0.06, 0], 0.025, WOOD, { bone: body });
  b.capsule([0.2, 0.06, 0], [0.32, 0.17, 0.05], 0.012, WOOD, { bone: body });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 3), BLUE, { bone: body, at: [0.32, 0.18, 0.05], rotation: [90, 0, 0] });

  // Body: big yellow sphere, red breast disc, blue wing
  b.part(new THREE.SphereGeometry(0.1, 10, 8), YELLOW, { bone: body, at: [0, 0.2, 0], scale: [0.9, 0.95, 1.25] });
  b.part(new THREE.SphereGeometry(0.075, 10, 8), RED, { bone: body, at: [0, 0.19, 0.06], scale: [0.95, 1, 0.9] });
  b.part(new THREE.CircleGeometry(0.055, 3), WHITE, { bone: body, at: [0, 0.17, 0.128], dir: [0, 0, 1], axis: "z" });

  // Head
  b.part(new THREE.SphereGeometry(0.065, 10, 8), BLUE, { bone: head, at: [0, 0.34, 0.1] });
  b.part(new THREE.ConeGeometry(0.03, 0.06, 4), BLACK, { bone: head, at: [0, 0.41, 0.09], rotation: [-10, 45, 0] });

  // Beak: red upper cone, yellow lower
  b.part(new THREE.ConeGeometry(0.02, 0.07, 4), RED, { bone: jawU, at: [0, 0.34, 0.185], dir: [0, 0, 1], flat: true });
  b.part(new THREE.ConeGeometry(0.015, 0.05, 4), YELLOW, { bone: jawL, at: [0, 0.32, 0.17], dir: [0, 0, 1], flat: true });

  // Eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 8, 6), WHITE, { bone: head, at: [s * 0.05, 0.355, 0.13] });
    b.part(new THREE.SphereGeometry(0.011, 6, 5), BLACK, { bone: head, at: [s * 0.058, 0.357, 0.147] });
    // wings: flat triangles
    b.extrude(
      [
        [0, 0.07],
        [-0.22, 0.0],
        [0, -0.07],
      ],
      { at: [s * 0.095, 0.22, 0.02], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.014, color: s > 0 ? BLUE : BLUE, bone: body },
    );
    b.extrude(
      [
        [0, 0.03],
        [-0.12, 0.0],
        [0, -0.03],
      ],
      { at: [s * 0.105, 0.23, 0.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.016, color: RED, bone: body },
    );
    // legs
    b.rod([s * 0.04, 0.12, 0], [s * 0.04, 0.06, 0.01], 0.007, BLACK, { bone: body });
    for (const t of [-1, 0, 1])
      b.rod([s * 0.04, 0.06, 0.01], [s * 0.04 + t * 0.02, 0.055, 0.06], 0.005, BLACK, { bone: body });
  }

  // Tail: three fanned rectangles
  [[-15, RED], [0, YELLOW], [15, BLUE]].forEach(([deg, c]) => {
    b.part(new THREE.BoxGeometry(0.035, 0.01, 0.2), c as string, {
      bone: tail2,
      at: [Math.sin(((deg as number) * Math.PI) / 180) * 0.1, 0.17, -0.3],
      rotation: [10, deg as number, 0],
    });
  });

  return b.root;
}
