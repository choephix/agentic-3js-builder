import * as THREE from "three";
import { createBuilder, catmull, rng } from "../../../../src/index";

export const meta = {
  name: "Great horned owl",
  description:
    "A great horned owl perched on a gnarled branch: barred bark-brown and buff plumage, a pale throat bib, tall ear tufts, a tawny facial disc with black rim, orange eyes, a hooked grey beak and black talons gripping the wood.",
};

const BROWN = "#6e4f31";
const DARK = "#3a2a1c";
const BUFF = "#caa771";
const PALE = "#ece2cc";
const TAWNY = "#c98a3c";
const BLACK = "#16120f";
const ORANGE = "#f29a1e";
const GREY = "#8d9298";
const LEG = "#cbb98e";
const BARK = "#5a4330";
const BARK_DARK = "#3b2b1e";
const LICHEN = "#9fae7e";

export default function build() {
  const b = createBuilder({ name: "great-horned-owl" });
  const rand = rng(21);

  const SPHERE = new THREE.SphereGeometry(1, 14, 10);
  const TORUS = new THREE.TorusGeometry(1, 0.18, 6, 16);
  const RIM = new THREE.TorusGeometry(1, 0.1, 6, 18);

  // ---- Branch and its stub support (scenery, sits on y = 0) ----
  const branchPath = catmull([
    [-0.45, 0.11, 0.0],
    [-0.2, 0.12, 0.01],
    [0.0, 0.12, 0.0],
    [0.2, 0.11, -0.01],
    [0.45, 0.12, 0.0],
  ]);
  b.sweep(branchPath, 0.045, { color: BARK });

  b.sweep(
    catmull([
      [-0.3, 0.0, 0.0],
      [-0.29, 0.06, 0.005],
      [-0.28, 0.12, 0.0],
    ]),
    0.05,
    { color: BARK_DARK },
  );

  // Gnarls and lichen on the wood
  const lichenSpots: [number, number, number][] = [
    [-0.36, 0.15, 0.03],
    [-0.1, 0.16, -0.03],
    [0.12, 0.16, 0.035],
    [0.33, 0.15, -0.03],
  ];
  for (const p of lichenSpots) {
    b.part(SPHERE, LICHEN, { at: p, scale: [0.02, 0.012, 0.02] });
  }
  // Short broken twig stubs
  cone([0.28, 0.13, 0.0], [0.34, 0.2, -0.04], 0.018, BARK_DARK);
  cone([-0.14, 0.14, 0.0], [-0.17, 0.2, 0.03], 0.014, BARK_DARK);

  // ---- Skeleton ----
  const body = b.joint("body", { at: [0, 0.33, 0] });
  const head = b.joint("head", { at: [0, 0.56, 0.02], parent: body });

  // Helper: an ellipsoid built from a unit sphere
  const ell = (
    at: [number, number, number],
    s: [number, number, number],
    color: string,
    bone?: typeof body,
  ) => {
    if (bone) return b.part(SPHERE, color, { at, scale: s, bone });
    return b.part(SPHERE, color, { at, scale: s });
  };

  // Helper: a tapered cone from base to tip (apex on +Y, aimed at tip)
  function cone(
    from: [number, number, number],
    to: [number, number, number],
    r: number,
    color: string,
    bone?: typeof body,
  ) {
    const len = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
    const at: [number, number, number] = [
      (from[0] + to[0]) / 2,
      (from[1] + to[1]) / 2,
      (from[2] + to[2]) / 2,
    ];
    const g = new THREE.ConeGeometry(r, len, 8);
    if (bone) return b.part(g, color, { at, aim: to, bone });
    return b.part(g, color, { at, aim: to });
  }

  // ---- Body ----
  ell([0, 0.33, 0], [0.13, 0.16, 0.12], BROWN, body);
  ell([0, 0.45, 0.01], [0.09, 0.07, 0.09], BROWN, body); // neck base

  // Barred front plumage: dark and buff bars across the breast
  for (const sx of [-0.6, -0.3, 0, 0.3, 0.6]) {
    for (const v of [-0.6, -0.3, 0, 0.3, 0.6]) {
      const q = sx * sx + v * v;
      if (q > 0.7) continue;
      const z = 0.12 * Math.sqrt(1 - q) + 0.003;
      const col = v < 0 ? (rand() < 0.5 ? BUFF : DARK) : rand() < 0.6 ? DARK : BUFF;
      ell([sx * 0.13, 0.33 + v * 0.16, z], [0.024, 0.007, 0.012], col, body);
    }
  }

  // Pale throat bib
  ell([0, 0.44, 0.09], [0.07, 0.045, 0.04], PALE, body);

  // Feathered trousers over the legs
  for (const s of [1, -1]) {
    ell([s * 0.07, 0.26, 0.01], [0.045, 0.05, 0.04], BUFF);
    ell([s * 0.07, 0.24, 0.035], [0.03, 0.012, 0.012], DARK);
  }

  // ---- Tail ----
  const tailPath = catmull([
    [0.0, 0.24, -0.06],
    [0.0, 0.18, -0.12],
    [0.0, 0.12, -0.17],
  ]);
  b.chain("tail", tailPath, { role: "tail" });
  b.sweep(tailPath, 0.035, { color: BROWN });
  ell([0, 0.14, -0.15], [0.04, 0.02, 0.05], DARK);

  // ---- Wings (folded at the sides, +X is the owl's left) ----
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const wingPath = catmull([
      [s * 0.11, 0.42, -0.01],
      [s * 0.15, 0.32, -0.04],
      [s * 0.14, 0.2, -0.09],
    ]);
    b.chain(`wing${side}`, wingPath, { role: "wing" });
    b.sweep(wingPath, 0.035, { color: BROWN });
    ell([s * 0.13, 0.32, -0.03], [0.05, 0.12, 0.08], BROWN);
    ell([s * 0.13, 0.2, -0.08], [0.035, 0.08, 0.05], DARK);
    for (let i = 0; i < 4; i++) {
      ell([s * 0.14, 0.27 - i * 0.04, -0.05 - i * 0.012], [0.04, 0.008, 0.02], BUFF);
    }
  }

  // ---- Legs and talons ----
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const legPath = catmull([
      [s * 0.07, 0.3, 0.0],
      [s * 0.075, 0.22, 0.03],
      [s * 0.075, 0.17, 0.035],
    ]);
    b.chain(`leg${side}`, legPath, { role: "leg" });
    b.sweep(legPath, 0.02, { color: LEG });

    const fx = s * 0.075;
    for (const dx of [-0.02, 0, 0.02]) {
      cone([fx + dx, 0.17, 0.05], [fx + dx * 1.2, 0.147, 0.09], 0.008, BLACK);
    }
    cone([fx, 0.17, -0.02], [fx, 0.148, -0.05], 0.008, BLACK);
  }

  // ---- Head ----
  ell([0, 0.56, 0.02], [0.12, 0.11, 0.11], BROWN, head);

  // Ear tufts
  for (const s of [1, -1]) {
    cone([s * 0.055, 0.62, 0.0], [s * 0.085, 0.7, -0.03], 0.025, DARK, head);
    cone([s * 0.035, 0.63, 0.02], [s * 0.05, 0.69, 0.0], 0.022, BROWN, head);
  }

  // Tawny facial disc with black rim
  ell([0, 0.55, 0.085], [0.1, 0.095, 0.03], TAWNY, head);
  b.part(RIM, BLACK, { at: [0, 0.55, 0.11], scale: [0.1, 0.095, 0.1], bone: head });

  // Huge orange eyes with black pupils and rims
  for (const s of [1, -1]) {
    ell([s * 0.042, 0.578, 0.105], [0.04, 0.04, 0.02], ORANGE, head);
    ell([s * 0.042, 0.578, 0.118], [0.018, 0.018, 0.012], BLACK, head);
    b.part(TORUS, BLACK, { at: [s * 0.042, 0.578, 0.11], scale: [0.05, 0.05, 0.05], bone: head });
  }

  // Hooked grey beak: cere, cone and hook tip
  ell([0, 0.563, 0.11], [0.03, 0.018, 0.02], GREY, head);
  cone([0, 0.56, 0.115], [0, 0.525, 0.16], 0.025, GREY, head);
  ell([0, 0.515, 0.152], [0.014, 0.014, 0.014], GREY, head);

  return b.root;
}
