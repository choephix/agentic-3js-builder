import * as THREE from "three";
import { createBuilder, rng, catmull, countershade, mottle, svg } from "../../../../src/index";

const GOLD = "#c98a3e";
const BROWN = "#7a4a22";
const CREAM = "#f0d7a8";
const BLACK = "#1d1a1a";
const CHAR = "#3a3d46";
const CHAR2 = "#23252c";
const FLESH = "#f2a7a0";
const FIG = "#5e2b4f";
const BONE = "#d9cfb6";
const WHITE = "#ffffff";
const INNER = "#8c5a4c";
const CLAW = "#e8e0cf";

export const meta = {
  name: "fruit-bat",
  description: "A golden-brown fruit bat with wings spread, gripping a half-eaten fig in its feet.",
};

export default function build() {
  const b = createBuilder({ name: "fruit-bat" });

  // Skeleton: hips, spine, head
  const hips = b.joint("hips", { at: [0, 0.3, 0] });
  const spine = b.chain("spine", catmull([[0, 0.3, 0], [0, 0.4, 0.02], [0, 0.5, 0.04]]), {
    parent: hips,
    role: "spine",
    names: ["spine1", "spine2"],
  });
  const spine2 = spine.joints[1];
  const head = b.joint("head", {
    parent: spine2,
    at: [0, 0.5, 0.04],
    aim: [0, 0.62, 0.1],
    role: "head",
  });

  // Body: fluffy golden-brown, countershaded belly
  const coat = countershade(mottle(GOLD, BROWN, { size: 0.05, seed: 3 }), CREAM, { level: -0.25 });
  b.sweep(spine, (t: number) => 0.072 + 0.024 * Math.sin(Math.PI * t), { color: coat });

  // Head: round fox-like skull with a tapered snout
  b.part(new THREE.SphereGeometry(0.075, 14, 10), coat, { bone: head, at: [0, 0.575, 0.075] });
  b.capsule([0, 0.56, 0.09], [0, 0.548, 0.16], [0.04, 0.03], { color: CREAM, bone: head });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), BLACK, { bone: head, at: [0, 0.555, 0.168] });
  b.part(new THREE.SphereGeometry(0.005, 5, 4), WHITE, { bone: head, at: [0, 0.566, 0.17] });

  for (const s of [1, -1]) {
    // Big dark eyes with a catch-light
    b.part(new THREE.SphereGeometry(0.026, 10, 8), BLACK, { bone: head, at: [s * 0.04, 0.59, 0.125] });
    b.part(new THREE.SphereGeometry(0.007, 5, 4), WHITE, { bone: head, at: [s * 0.048, 0.6, 0.147] });

    // Pointed ears with inner shading
    b.spike([s * 0.045, 0.625, 0.035], [s * 0.065, 0.73, -0.005], null, 0.034, { color: coat, bone: head });
    b.spike([s * 0.048, 0.63, 0.05], [s * 0.062, 0.7, 0.02], null, 0.02, { color: INNER, bone: head });
  }

  // Fur tufts scattered over the body
  const tuft = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">` +
      `<path d="M16 64 C4 44 6 22 16 2 C26 22 28 44 16 64Z" fill="#d8a25a"/>` +
      `<path d="M16 60 C12 40 14 24 16 12 C20 26 20 42 16 60Z" fill="#7a4a22"/>` +
      `</svg>`,
    { size: 128 },
  );
  const furHits = b.surface(spine).scatter(220, {
    rng: rng(7),
    minDist: 0.022,
    filter: (h) => h.n.y > -0.5,
  });
  b.cards(furHits, tuft, { size: [0.03, 0.045], lean: 55, bend: 25, vary: 0.25, rng: rng(8) });

  // Wings, legs and the fig
  const wingCoat = mottle(CHAR, CHAR2, { size: 0.12, seed: 5 });

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Arm bones: shoulder, elbow, wrist
    const shoulder: [number, number, number] = [s * 0.07, 0.46, 0.01];
    const elbow: [number, number, number] = [s * 0.24, 0.52, -0.03];
    const wrist: [number, number, number] = [s * 0.56, 0.62, 0.02];
    const arm = b.chain(`wing${L}`, catmull([shoulder, elbow, wrist]), {
      parent: spine2,
      role: "wing",
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
    });
    const wristJoint = arm.tip!;
    b.sweep(arm, [0.02, 0.012], { color: BONE });

    // Long finger bones fanning out from the wrist
    const fingerPaths = [
      catmull([wrist, [s * 0.78, 0.6, -0.04], [s * 0.95, 0.5, -0.13]]),
      catmull([wrist, [s * 0.72, 0.5, -0.14], [s * 0.86, 0.4, -0.3]]),
      catmull([wrist, [s * 0.55, 0.45, -0.2], [s * 0.66, 0.33, -0.36]]),
    ];
    const fingers = fingerPaths.map((path, k) => {
      const f = b.chain(`finger${L}${k + 1}`, path, {
        parent: wristJoint,
        role: "digit",
        names: [`f${k + 1}${L}1`, `f${k + 1}${L}2`, `f${k + 1}${L}3`],
      });
      b.sweep(f, [0.01, 0.005], { color: BONE });
      return f;
    });

    // Small hooked thumb claw on the wrist
    b.spike(wrist, [s * 0.6, 0.67, 0.05], null, 0.007, { color: CLAW, bone: wristJoint });

    // Leathery membranes between the bones and down to the flank
    const flank: [number, number, number][] = [
      [s * 0.1, 0.46, 0.0],
      [s * 0.11, 0.36, -0.03],
      [s * 0.09, 0.25, -0.05],
      [s * 0.05, 0.12, -0.02],
    ];
    b.membrane(arm, fingers[0], { color: wingCoat, thickness: 0.012 });
    b.membrane(fingers[0], fingers[1], { color: wingCoat, thickness: 0.012 });
    b.membrane(fingers[1], fingers[2], { color: wingCoat, thickness: 0.012 });
    b.membrane(fingers[2], flank, { color: wingCoat, thickness: 0.012, bone: hips });

    // Hind leg: hip, knee bending backward, ankle gripping the fig
    const H: [number, number, number] = [s * 0.05, 0.3, 0.0];
    const K: [number, number, number] = [s * 0.09, 0.2, -0.07];
    const A: [number, number, number] = [s * 0.035, 0.115, 0.03];
    const leg = b.chain(`leg${L}`, catmull([H, K, A]), {
      parent: hips,
      role: "leg",
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
    });
    const ankle = leg.tip!;
    b.sweep(leg, [0.03, 0.017], { color: coat });
    b.part(new THREE.SphereGeometry(0.022, 8, 6), coat, { bone: ankle, at: A });

    // Curled toes hooked over the fig
    b.spike(A, [s * 0.07, 0.093, 0.05], null, 0.009, { color: CLAW, bone: ankle });
    b.spike(A, [s * 0.02, 0.092, 0.075], null, 0.009, { color: CLAW, bone: ankle });
  }

  // The half-eaten fig, lying on the ground
  const figPart = b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.058, 0.03],
      [0.05, 0.07],
      [0.03, 0.095],
      [0, 0.1],
    ],
    { at: [0, 0, 0.03], color: FIG, smoothing: 1, bone: hips },
  );

  // Bitten flesh showing on the side, and the stalk on top
  const bite = b.surface(figPart).nearest([0.05, 0.06, 0.03]);
  b.stick(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 10), FLESH, bite, { embed: 0.3 });
  const stalkHit = b.surface(figPart).nearest([0, 0.1, 0.03]);
  b.stick(new THREE.CylinderGeometry(0.003, 0.004, 0.02, 5), BROWN, stalkHit, { embed: 0.3 });

  return b.root;
}
