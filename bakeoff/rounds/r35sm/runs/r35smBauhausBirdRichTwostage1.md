```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, rng } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

export const meta = {
  name: "Bauhaus Songbird",
  description: "A songbird perched on a branch, built from Bauhaus primary-colour geometry.",
};

export const REQUESTS = [
  { id: "eyeL", kind: "add", part: "head", what: "Left eye: concentric black ring, white disc and a small black pupil as a Bauhaus circle, seated on the head surface.", at: [0.06, 0.255, 0.1], normal: [1, 0.2, 0.4], bone: "head", room: [0.05, 0.05, 0.05] },
  { id: "eyeR", kind: "add", part: "head", what: "Right eye mirroring the left: black ring, white disc, pupil.", at: [-0.06, 0.255, 0.1], normal: [-1, 0.2, 0.4], bone: "head", room: [0.05, 0.05, 0.05] },
  { id: "wingStripes", kind: "add", part: "wingL", what: "Three flat bars across each wing in RED, YELLOW and BLACK, like a geometric feather pattern.", at: [0.1, 0.17, -0.02], normal: [1, 0, 0], bone: "chest", room: [0.04, 0.12, 0.2] },
  { id: "breastCircle", kind: "add", part: "body", what: "A large yellow circle emblem with a thin black ring on the breast.", at: [0, 0.14, 0.14], normal: [0, 0, 1], bone: "chest", room: [0.1, 0.1, 0.04] },
  { id: "tailBars", kind: "add", part: "tail", what: "Row of three square tail-end blocks in RED, YELLOW and BLUE.", at: [0, 0.14, -0.28], normal: [0, 1, 0], bone: "tail1", room: [0.1, 0.04, 0.12] },
  { id: "toes", kind: "add", part: "legs", what: "Three forward toes and one back toe per foot as thin yellow rods gripping the branch.", at: [0.035, 0.0, 0.0], normal: [0, -1, 0], bone: "chest", room: [0.08, 0.04, 0.1] },
  { id: "branchKnots", kind: "add", part: "branch", what: "Geometric twigs: two short black rods with a small red disc leaf at each end.", at: [-0.3, 0.02, 0], normal: [0, 1, 0], bone: null, room: [0.2, 0.15, 0.1] },
  { id: "crestBlocks", kind: "add", part: "head", what: "Small stepped crest of 3 stacked blocks in RED, BLACK, YELLOW.", at: [0, 0.32, 0.0], normal: [0, 1, 0], bone: "head", room: [0.06, 0.08, 0.08] },
  { id: "bodyPaint", kind: "texture", part: "body", what: "Bauhaus split: lower belly cream, upper back BLUE with a hard diagonal edge, and a thin black line separating them." },
  { id: "branchPaint", kind: "texture", part: "branch", what: "Dark wood grain with alternating black and brown stripes in bands." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const RED = "#d62828";
export const BLUE = "#1d4ea8";
export const YELLOW = "#f5c518";
export const BLACK = "#16161a";
export const CREAM = "#f3ead3";
export const WOOD = "#6b4a2b";

export default function build() {
  const b = createBuilder({ name: "songbird" });

  // skeleton: perched on branch at y = 0.12 height
  const BY = 0.1; // branch centre height
  const chest = b.joint("chest", { at: [0, 0.2, 0], role: "spine" });
  const tail = b.chain("tail", catmull([[0, 0.2, -0.08], [0, 0.19, -0.2], [0, 0.17, -0.32]]), {
    parent: chest, names: ["tail1", "tail2", "tailTip"], role: "tail",
  });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.27, 0.08], dir: [0, 0.6, 0.5], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.31, 0.12], dir: [0, 0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.285, 0.14], aim: [0, 0.28, 0.22], role: "jaw" });

  // branch
  b.sweep(catmull([[-0.6, 0.06, 0], [-0.2, 0.09, 0], [0.2, 0.1, 0], [0.6, 0.13, 0]]), [0.028, 0.02], {
    color: WOOD, bone: chest, name: "branch", sides: 6,
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.016, 0.16, 5), WOOD, { at: [0.35, 0.2, 0], dir: [0.4, 1, 0], bone: chest, name: "branch" });

  // body: stacked geometric forms
  b.part(new THREE.SphereGeometry(1, 10, 8), BLUE, { at: [0, 0.2, 0], scale: [0.095, 0.09, 0.15], bone: chest, name: "body" });
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, { at: [0, 0.17, 0.05], scale: [0.08, 0.07, 0.11], bone: chest, name: "belly" });
  b.part(new THREE.BoxGeometry(0.1, 0.03, 0.14), BLACK, { at: [0, 0.285, -0.02], bone: chest, name: "saddle" });

  // head
  b.part(new THREE.SphereGeometry(1, 12, 9), YELLOW, { at: [0, 0.31, 0.12], scale: [0.07, 0.07, 0.07], bone: head, name: "head" });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.02), BLACK, { at: [0, 0.345, 0.17], bone: head, name: "brow" });
  // beak: upper and lower
  b.part(new THREE.ConeGeometry(0.03, 0.09, 4), RED, { at: [0, 0.305, 0.215], dir: [0, 0, 1], bone: head, name: "beakUp" });
  b.part(new THREE.ConeGeometry(0.022, 0.06, 4), RED, { at: [0, 0.285, 0.2], dir: [0, 0, 1], bone: jaw, name: "beakLow" });

  // wings
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.extrude([[0, 0], [0.05, 0.05], [0.2, 0.04], [0.26, -0.02], [0.1, -0.06]], {
      at: [s * 0.088, 0.22, 0.04], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.018, color: RED, bone: chest, name: `wing${side}`,
    });
    b.extrude([[0, 0], [0.12, 0.02], [0.15, -0.04], [0.03, -0.04]], {
      at: [s * 0.098, 0.2, -0.1], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.012, color: BLACK, bone: chest, name: `wingTip${side}`,
    });
  }

  // tail: flat tapering fan
  b.extrude([[-0.03, 0], [0.03, 0], [0.05, -0.16], [-0.05, -0.16]], {
    at: [0, 0.18, -0.13], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.012, color: BLUE, bone: tail.joints[0], name: "tail",
  });
  b.part(new THREE.BoxGeometry(0.1, 0.014, 0.04), YELLOW, { at: [0, 0.172, -0.3], bone: tail.joints[1], name: "tailEnd" });

  // legs
  for (const s of [1, -1]) {
    b.rod([s * 0.035, 0.14, 0.0], [s * 0.035, 0.11, 0.0], 0.006, BLACK, { bone: chest, name: "legs" });
  }

  for (const add of STAGE2) add(b);
  return b.root;
}
```