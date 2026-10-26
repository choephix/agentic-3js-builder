```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, svg, paint, rng } from "agentic-3js-builder";

export const meta = {
  name: "Bauhaus Songbird",
  description: "A songbird perched on a branch, built from primary-colour Bauhaus geometry.",
};

const RED = "#d62828";
const YEL = "#f7c600";
const BLUE = "#1d4fb8";
const BLACK = "#16161a";
const WHITE = "#f4f0e6";
const BARK = "#6b4a2b";

export default function build() {
  const b = createBuilder({ name: "songbird" });

  // skeleton
  const body = b.joint("body", { at: [0, 0.2, 0], role: "spine" });
  const neck = b.joint("neck", { parent: body, at: [0, 0.27, 0.07], dir: [0, 0.5, 0.6], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.33, 0.1], dir: [0, 0.2, 1], role: "head" });
  const jawU = b.joint("beakUpper", { parent: head, at: [0, 0.335, 0.17], dir: [0, 0, 1] });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.325, 0.17], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.2, -0.1], [0, 0.17, -0.22], [0, 0.14, -0.36]]), {
    parent: body, names: ["tail1", "tail2"], role: "tail",
  });

  // branch
  b.sweep(catmull([[-0.4, 0.045, -0.02], [0, 0.05, 0], [0.4, 0.075, 0.02]]), [0.028, 0.02], {
    color: BARK, sides: 6, bone: body,
  });
  b.spike([0.2, 0.06, 0], [0.3, 0.2, 0.02], null, 0.014, { color: BARK, bone: body });
  b.part(new THREE.IcosahedronGeometry(0.035, 0), "#2e8b3a", { at: [0.31, 0.22, 0.02], bone: body, flat: true });

  // body: big blue ball + red wedge chest
  b.part(new THREE.SphereGeometry(1, 8, 6), BLUE, { at: [0, 0.2, 0], scale: [0.095, 0.1, 0.14], bone: body, flat: true });
  b.part(new THREE.SphereGeometry(1, 8, 6), RED, { at: [0, 0.19, 0.06], scale: [0.09, 0.085, 0.09], bone: body, flat: true });
  b.part(new THREE.SphereGeometry(1, 8, 6), YEL, { at: [0, 0.23, 0.05], scale: [0.04, 0.03, 0.05], bone: body, flat: true });

  // head: yellow cube-ish with white stripe
  b.part(new THREE.IcosahedronGeometry(0.075, 1), YEL, { at: [0, 0.34, 0.1], bone: head, flat: true });
  b.part(new THREE.BoxGeometry(0.162, 0.014, 0.05), BLACK, { at: [0, 0.37, 0.1], bone: head });

  // eyes: Bauhaus concentric discs
  const eye = svg(
    `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="${WHITE}"/><circle cx="20" cy="20" r="12" fill="${BLACK}"/><rect x="20" y="8" width="12" height="12" fill="${RED}"/><circle cx="16" cy="16" r="3" fill="#fff"/></svg>`,
    { size: 96 },
  );
  for (const s of [1, -1])
    b.part(new THREE.CircleGeometry(0.026, 16), "#ffffff", {
      at: [s * 0.062, 0.35, 0.145], bone: head, dir: [s * 0.7, 0.05, 0.7], axis: "z", texture: eye,
    });

  // beak: two cones/pyramids
  b.part(new THREE.ConeGeometry(0.03, 0.09, 4), RED, { at: [0, 0.337, 0.185], bone: jawU, dir: [0, 0, 1], flat: true });
  b.part(new THREE.ConeGeometry(0.022, 0.06, 4), BLACK, { at: [0, 0.322, 0.175], bone: jaw, dir: [0, 0, 1], flat: true });

  // wings: triangular extrudes
  for (const s of [1, -1]) {
    b.extrude([[0, 0.05], [0.0, -0.05], [-0.2, -0.02], [-0.16, 0.03]], {
      at: [s * 0.092, 0.22, 0.02], x: [0, 0, 1], y: [s * 0.15, 1, 0], thickness: 0.02, color: BLACK, bone: body,
    });
    b.extrude([[-0.02, 0.0], [-0.17, -0.01], [-0.14, 0.02]], {
      at: [s * 0.104, 0.225, 0.02], x: [0, 0, 1], y: [s * 0.15, 1, 0], thickness: 0.01, color: YEL, bone: body,
    });
  }

  // tail: three fanned blocks
  const cols = [RED, BLACK, BLUE];
  [-1, 0, 1].forEach((k, i) => {
    b.extrude([[-0.018, 0], [0.018, 0], [0.026, -0.17], [-0.026, -0.17]], {
      at: [k * 0.02, 0.19, -0.12], x: [1, 0, 0], y: [k * 0.2, 0.0, -1], thickness: 0.012, color: cols[i], bone: tail.joints[0],
    });
  });

  // legs and feet
  for (const s of [1, -1]) {
    b.rod([s * 0.04, 0.12, 0.0], [s * 0.04, 0.075, 0.0], 0.007, { color: YEL, bone: body, sides: 6 });
    for (const a of [-0.03, 0, 0.03]) {
      b.rod([s * 0.04, 0.07, 0], [s * 0.04 + a, 0.063, 0.045], 0.005, { color: YEL, bone: body, sides: 5 });
    }
    b.rod([s * 0.04, 0.07, 0], [s * 0.04, 0.063, -0.04], 0.005, { color: YEL, bone: body, sides: 5 });
  }

  // Bauhaus ornament: ring and square on the chest
  b.part(new THREE.TorusGeometry(0.035, 0.007, 4, 12), WHITE, {
    at: [0, 0.2, 0.147], bone: body, dir: [0, 0, 1], axis: "z", flat: true,
  });
  b.part(new THREE.BoxGeometry(0.03, 0.03, 0.006), BLACK, { at: [0, 0.2, 0.15], bone: body, rotation: [0, 0, 45] });

  void bezier; void paint; void rng;
  return b.root;
}
```