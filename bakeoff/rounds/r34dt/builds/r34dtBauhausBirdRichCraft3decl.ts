import * as THREE from "three";
import { createBuilder, rng, catmull, svg, paint, stripes } from "../../../../src/index";

export const meta = {
  name: "Bauhaus Songbird",
  description: "A songbird perched on a branch, built from primary-colour Bauhaus geometry: circles, triangles and bars.",
};

const RED = "#d62a1e", BLUE = "#1d3fa8", YELLOW = "#f2c200", BLACK = "#16161a", WHITE = "#f4efe2", BARK = "#6b4a2b";

export default function build() {
  const b = createBuilder({ name: "songbird" });
  const R = rng(5);

  // skeleton (bird about 0.16 m long, perched on a branch at y = 0.1)
  const body = b.joint("body", { at: [0, 0.18, 0], role: "spine" });
  const neck = b.joint("neck", { parent: body, at: [0, 0.21, 0.04], dir: [0, 0.6, 0.8], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.25, 0.07], dir: [0, 0, 1], role: "head" });
  const jawU = b.joint("jaw", { parent: head, at: [0, 0.248, 0.105], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.18, -0.05], [0, 0.17, -0.12], [0, 0.15, -0.2]]), { parent: body, names: ["tail1", "tail2"], role: "tail" });

  // branch
  b.sweep(catmull([[-0.25, 0.09, 0], [-0.1, 0.095, 0.005], [0.1, 0.1, -0.005], [0.25, 0.115, 0]]), 0.012, { color: BARK, bone: body, sides: 6 });
  b.part(new THREE.CylinderGeometry(0.004, 0.006, 0.08, 5), BARK, { bone: body, at: [0.15, 0.14, 0], rotation: [0, 0, -30] });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), BLUE, { bone: body, at: [0.2, 0.17, 0], scale: [1, 0.2, 1] });

  // torso: big blue sphere
  b.part(new THREE.SphereGeometry(0.07, 12, 8), BLUE, { bone: body, at: [0, 0.18, 0], scale: [0.9, 0.95, 1.2] });
  // yellow belly disc
  b.part(new THREE.SphereGeometry(0.05, 10, 6), YELLOW, { bone: body, at: [0, 0.155, 0.03], scale: [0.95, 1, 1] });
  // red breast circle decal
  const disc = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="${RED}" stroke="${BLACK}" stroke-width="4"/><circle cx="32" cy="32" r="13" fill="${WHITE}"/></svg>`, { size: 128 });
  b.part(new THREE.CircleGeometry(0.035, 20), "#ffffff", { bone: body, at: [0, 0.19, 0.083], dir: [0, 0.2, 1], axis: "z", texture: disc });

  // head: red sphere
  b.part(new THREE.SphereGeometry(0.045, 12, 8), RED, { bone: head, at: [0, 0.255, 0.075] });
  // eyes
  const eye = svg(`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="${WHITE}" stroke="${BLACK}" stroke-width="3"/><circle cx="18" cy="16" r="7" fill="${BLACK}"/></svg>`, { size: 96 });
  for (const s of [1, -1])
    b.part(new THREE.CircleGeometry(0.015, 14), "#ffffff", { bone: head, at: [s * 0.036, 0.265, 0.105], dir: [s * 0.7, 0.1, 0.7], axis: "z", texture: eye });
  // beak: yellow cone upper, black lower
  b.part(new THREE.ConeGeometry(0.014, 0.05, 4), YELLOW, { bone: jawU, at: [0, 0.255, 0.13], dir: [0, 0, 1], flat: true });
  b.part(new THREE.ConeGeometry(0.01, 0.035, 4), BLACK, { bone: jawU, at: [0, 0.24, 0.12], dir: [0, 0, 1], flat: true });
  // crest: triangle prism
  b.extrude([[0, 0], [0.05, 0], [0.01, 0.06, "sharp"]], { at: [0, 0.285, 0.0], x: [0, 0, 1], thickness: 0.012, color: YELLOW, bone: head });

  // wings: black triangles with blue stripe
  for (const s of [1, -1]) {
    b.extrude([[0, 0], [-0.11, 0.0], [-0.02, -0.07, "sharp"], [0.03, -0.03]], { at: [s * 0.062, 0.2, 0.04], x: [0, 0, 1], y: [s * 0.25, 1, 0], thickness: 0.01, color: BLACK, bone: body });
    b.part(new THREE.BoxGeometry(0.008, 0.012, 0.07), WHITE, { bone: body, at: [s * 0.069, 0.185, -0.005] });
  }
  // tail: rectangular bars in primaries
  const cols = [RED, YELLOW, BLUE];
  cols.forEach((c, i) =>
    b.part(new THREE.BoxGeometry(0.018, 0.006, 0.12), c, { bone: tail.joints[0], at: [(i - 1) * 0.02, 0.168 - i * 0.002 - Math.abs(i - 1) * 0.0, -0.13], rotation: [8, (i - 1) * 8, 0] }),
  );
  // legs and feet
  for (const s of [1, -1]) {
    b.rod([s * 0.025, 0.12, 0.0], [s * 0.025, 0.1, 0.01], 0.004, BLACK, { bone: body, sides: 5 });
    for (const a of [-12, 0, 12])
      b.rod([s * 0.025, 0.103, 0.01], [s * 0.025 + a * 0.0012, 0.103, 0.045], 0.0028, BLACK, { bone: body, sides: 4 });
  }
  return b.root;
}
