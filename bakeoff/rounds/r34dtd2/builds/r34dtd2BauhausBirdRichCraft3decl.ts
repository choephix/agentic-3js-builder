import * as THREE from "three";
import { createBuilder, rng, catmull, offset } from "../../../../src/index";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Bauhaus Songbird",
  description: "A songbird perched on a branch, built from primary-colour Bauhaus geometry: circles, triangles and squares.",
};

const RED = "#d62a1f";
const BLUE = "#1f4fb5";
const YEL = "#f4c20d";
const BLACK = "#16161a";
const CREAM = "#f3ead3";
const BARK = "#6b4a2c";

export default function build() {
  const b = createBuilder({ name: "songbird" });
  const rand = rng(5);

  // Skeleton
  const body = b.joint("body", { at: [0, 0.2, 0], role: "spine" });
  const neck = b.joint("neck", { parent: body, at: [0, 0.27, 0.1], dir: [0, 0.6, 0.8], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.33, 0.15], dir: [0, 0, 1], role: "head" });
  const jawU = b.joint("jaw", { parent: head, at: [0, 0.33, 0.2], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.22, -0.1], [0, 0.2, -0.22], [0, 0.16, -0.4]]), {
    parent: body, names: ["tail1", "tail2", "tailTip"], role: "tail",
  });

  // Branch (ground-standing, feet at y=0 level via branch top)
  const branch = catmull([[-0.45, 0.02, 0], [-0.15, 0.04, 0.01], [0.2, 0.03, -0.01], [0.5, 0.07, 0.01]]);
  b.sweep(branch, [0.03, 0.022], { color: BARK, bone: body, sides: 6 });
  b.spike([0.3, 0.05, 0], [0.5, 0.2, 0.02], null, 0.012, { color: BARK, bone: body, sides: 5 });
  b.part(new THREE.IcosahedronGeometry(0.035, 0), BLUE, { bone: body, at: [0.48, 0.2, 0.02], flat: true });

  // Body: big sphere (circle), belly cream
  const bodyP = b.part(new THREE.SphereGeometry(1, 10, 8), RED, {
    bone: body, at: [0, 0.2, 0], scale: [0.12, 0.12, 0.17],
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, {
    bone: body, at: [0, 0.16, 0.05], scale: [0.1, 0.09, 0.12],
  });

  // Wings: blue triangles (extruded)
  for (const s of [1, -1]) {
    b.extrude([[0, 0.08], [0, -0.08], [-0.26, -0.1, "sharp"]], {
      at: [s * 0.115, 0.24, 0.02], x: [0, 0, 1], y: [s * 0.2, 1, 0],
      thickness: 0.02, color: BLUE, bone: body,
    });
    b.extrude([[0, 0.03], [0, -0.03], [-0.12, -0.04, "sharp"]], {
      at: [s * 0.128, 0.22, -0.06], x: [0, 0, 1], y: [s * 0.2, 1, 0],
      thickness: 0.012, color: YEL, bone: body,
    });
  }

  // Head: yellow sphere
  b.part(new THREE.SphereGeometry(0.085, 10, 8), YEL, { bone: head, at: [0, 0.37, 0.15] });
  // Beak: upper and lower cones
  b.part(new THREE.ConeGeometry(0.03, 0.1, 4), BLACK, { bone: head, at: [0, 0.375, 0.26], dir: [0, 0, 1] });
  b.part(new THREE.ConeGeometry(0.022, 0.07, 4), BLACK, { bone: jawU, at: [0, 0.35, 0.24], dir: [0, 0, 1] });
  // Eyes: Bauhaus concentric circles
  const EYE = svg(`<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="${CREAM}" stroke="${BLACK}" stroke-width="3"/><circle cx="20" cy="20" r="11" fill="${BLUE}"/><circle cx="20" cy="20" r="5" fill="${BLACK}"/></svg>`, { size: 64 });
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.03, 12), "#ffffff", {
      bone: head, at: [s * 0.07, 0.395, 0.2], dir: [s * 0.8, 0.1, 0.6], axis: "z", texture: EYE,
    });
  }
  // Crest: triangle stack
  for (let i = 0; i < 3; i++) {
    b.extrude([[-0.02, 0], [0.02, 0], [0, 0.07 - i * 0.012, "sharp"]], {
      at: [0, 0.43, 0.14 - i * 0.04], x: [1, 0, 0], thickness: 0.012,
      color: i % 2 ? YEL : RED, bone: head,
    });
  }

  // Tail: stacked flat rectangles
  b.sweep(tail, [0.05, 0.03], { color: BLUE, section: "box", caps: "flat" });
  b.part(new THREE.BoxGeometry(0.11, 0.012, 0.05), RED, { bone: tail.tip!, at: [0, 0.165, -0.4] });

  // Legs and toes
  for (const s of [1, -1]) {
    const hip = [s * 0.05, 0.12, 0.0];
    const foot = [s * 0.05, 0.06, 0.0];
    b.rod(hip, foot, 0.009, { color: BLACK, bone: body, sides: 4 });
    for (const a of [-0.35, 0, 0.35, 3.0]) {
      const dx = Math.sin(a) * 0.05, dz = a > 2 ? -0.04 : Math.cos(a) * 0.05;
      b.rod(foot, [s * 0.05 + dx, 0.055, dz], 0.006, { color: BLACK, bone: body, sides: 4 });
    }
  }

  // Bauhaus ornaments: circle and square floating-free decor on the flank
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 12), YEL, { bone: body, at: [0.118, 0.19, 0.04], dir: [1, 0, 0] });
  b.part(new THREE.BoxGeometry(0.01, 0.05, 0.05), BLACK, { bone: body, at: [-0.12, 0.19, 0.04] });
  void rand; void offset; void bodyP;

  return b.root;
}
