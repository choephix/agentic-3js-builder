```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, rng, paint, mottle, grain } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Bauhaus Songbird",
  description: "A songbird perched on a branch, built from primary-colour Bauhaus geometry: circle, triangle, square.",
};

const RED = "#d62a1f";
const BLUE = "#1f3fa8";
const YEL = "#f2c10f";
const BLACK = "#16161a";
const CREAM = "#f3ead2";
const BARK = grain("#6b4a2c", "#4a301b", { size: 0.02, axis: "x" });

export default function build() {
  const b = createBuilder({ name: "songbird" });
  const R = rng(5);

  // Skeleton: bird perched, branch top at y=0.
  const branchY = 0.03;
  const body = b.joint("body", { at: [0, 0.1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: body, at: [0, 0.14, 0.04], dir: [0, 1, 0.6], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.17, 0.07], dir: [0, 0.2, 1], role: "head" });
  const jawU = b.joint("beakUpper", { parent: head, at: [0, 0.17, 0.11], dir: [0, 0, 1], role: "jaw" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.165, 0.11], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.11, -0.05], [0, 0.1, -0.12], [0, 0.09, -0.2]]), {
    parent: body, names: ["tail1", "tail2"], role: "tail",
  });

  // Branch (a long square-ish bar with knobs)
  const branch = catmull([[-0.22, 0.012, -0.02], [-0.08, 0.02, 0.0], [0.08, 0.008, 0.0], [0.24, 0.026, 0.02]]);
  b.sweep(branch, [0.016, 0.012], { bone: body, color: BARK, section: { ngon: 6 }, caps: "flat" });
  b.rod([0.1, 0.02, 0], [0.19, 0.075, 0.03], 0.006, BARK, { bone: body });
  b.part(new THREE.IcosahedronGeometry(0.014, 0), BLUE, { bone: body, at: [0.19, 0.082, 0.03] });
  b.rod([-0.12, 0.02, 0], [-0.18, 0.06, -0.02], 0.005, BARK, { bone: body });
  b.part(new THREE.BoxGeometry(0.03, 0.03, 0.03), YEL, { bone: body, at: [-0.18, 0.07, -0.02], rotation: [20, 30, 10] });

  // Body: big red sphere, faceted
  b.part(new THREE.SphereGeometry(0.085, 10, 8), RED, { bone: body, at: [0, 0.12, 0], scale: [1, 0.95, 1.3], flat: true });
  // Cream belly circle disc
  b.part(new THREE.CircleGeometry(0.055, 14), CREAM, { bone: body, at: [0, 0.105, 0.098], dir: [0, -0.1, 1], axis: "z" });
  // Chest triangle (yellow)
  b.extrude([[-0.03, 0], [0.03, 0], [0, 0.05]], { at: [0, 0.1, 0.108], x: [1, 0, 0], thickness: 0.006, color: YEL, bone: body });

  // Head: blue sphere
  b.part(new THREE.SphereGeometry(0.055, 10, 8), BLUE, { bone: head, at: [0, 0.2, 0.09], flat: true });
  // Eyes: concentric discs
  const eye = svg(`<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#f3ead2" stroke="#16161a" stroke-width="3"/><circle cx="21" cy="20" r="9" fill="#16161a"/><circle cx="24" cy="16" r="3" fill="#fff"/></svg>`, { size: 96 });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.036, 0.036), "#ffffff", {
      bone: head, at: [s * 0.04, 0.215, 0.125], dir: [s * 0.6, 0.1, 1], axis: "z", texture: eye,
    });
    // cap triangle crest
  }
  // Crest: three triangles in primary colours
  [[RED, -0.02, 0], [YEL, 0, 8], [BLACK, 0.02, 0]].forEach(([c, x], i) => {
    b.extrude([[-0.014, 0], [0.014, 0], [0, 0.05 - i * 0.004]], {
      at: [x as number, 0.245, 0.07 - i * 0.012], x: [1, 0, 0], thickness: 0.008, color: c as string, bone: head,
    });
  });

  // Beak: cones
  b.part(new THREE.ConeGeometry(0.02, 0.07, 4), YEL, { bone: jawU, at: [0, 0.2, 0.15], dir: [0, 0.05, 1], flat: true });
  b.part(new THREE.ConeGeometry(0.015, 0.05, 4), BLACK, { bone: jaw, at: [0, 0.19, 0.14], dir: [0, -0.05, 1], flat: true });

  // Wings: big triangles with a circle motif
  for (const s of [1, -1]) {
    const w = b.extrude([[0, 0.05], [0.0, -0.05], [-0.2, -0.03], [-0.17, 0.02]], {
      at: [s * 0.085, 0.13, 0.0], x: [0, 0, 1], y: [s * 0.25, 1, 0], thickness: 0.012, color: BLACK, bone: body,
    });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.006, 12), YEL, {
      bone: body, at: [s * 0.095, 0.13, -0.04], dir: [s, 0, 0],
    });
    b.part(new THREE.BoxGeometry(0.006, 0.02, 0.05), RED, { bone: body, at: [s * 0.093, 0.1, -0.1] });
    void w;
  }

  // Tail: three rectangular feathers fanned
  [-1, 0, 1].forEach((k) => {
    const col = [RED, YEL, BLUE][k + 1];
    b.part(new THREE.BoxGeometry(0.03, 0.006, 0.16), col, {
      bone: tail.joints[1], at: [k * 0.03, 0.095, -0.2], rotation: [0, -k * 12, 0],
    });
  });

  // Legs and feet
  for (const s of [1, -1]) {
    b.rod([s * 0.03, 0.06, 0.0], [s * 0.03, 0.028, 0.01], 0.006, YEL, { bone: body });
    for (const t of [-1, 0, 1]) {
      b.rod([s * 0.03, 0.03, 0.01], [s * 0.03 + t * 0.012, 0.028, 0.045], 0.004, YEL, { bone: body });
    }
    b.rod([s * 0.03, 0.03, 0.01], [s * 0.03, 0.03, -0.025], 0.004, YEL, { bone: body });
  }

  // Music: small floating primitive notes? keep subject-only: cheek dots
  for (const s of [1, -1])
    b.part(new THREE.CircleGeometry(0.014, 10), RED, { bone: head, at: [s * 0.05, 0.19, 0.115], dir: [s * 0.8, 0, 1], axis: "z" });

  void R; void bezier; void mottle; void paint;
  return b.root;
}
```