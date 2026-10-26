import * as THREE from "three";
import { createBuilder, frame, rng, aim, offset, catmull, bezier, paint, mottle, noise, smoothstep, mix, svg, countershade } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A crouching gothic stone gargoyle with folded wings, horns and glowing eyes, perched on a carved ledge.",
};

const STONE_A = "#8d8a84";
const STONE_B = "#5f5d5a";
const MOSS = "#58703a";
const HORN = "#3f3a36";
const EYE = "#ffb030";

export default function build() {
  const b = createBuilder({ name: "gargoyle" });
  const R = rng(11);

  const stone = paint((p, n, s) => {
    const base = mix(STONE_B, STONE_A, noise(p, 0.12, 3));
    const moss = smoothstep(0.55, 0.8, n.y) * smoothstep(0.5, 0.7, noise(p, 0.07, 8));
    const c = mix(base, MOSS, moss * 0.8);
    const dark = 0.82 + 0.18 * smoothstep(-0.8, 0.5, n.y);
    return [c[0] * dark, c[1] * dark, c[2] * dark];
  });
  const ledgeStone = mottle("#77736d", "#55524e", { size: 0.15, seed: 4 });

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.34, -0.2], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.34, -0.2], [0, 0.45, 0.0], [0, 0.62, 0.15], [0, 0.75, 0.22]]),
    { parent: hips, names: ["spine1", "spine2", "chest", "neckBase"], role: "spine" });
  const neck = b.chain("neck", catmull([[0, 0.75, 0.22], [0, 0.82, 0.32], [0, 0.84, 0.4]]),
    { parent: spine.tip ?? spine.joints[spine.joints.length - 1], names: ["neck1", "neck2", "head"], role: "neck" });
  const head = neck.tip ?? neck.joints[neck.joints.length - 1];
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.82, 0.42], aim: [0, 0.78, 0.6], role: "jaw" });

  // ledge
  b.part(new THREE.BoxGeometry(1.1, 0.2, 0.8), ledgeStone, { bone: hips, at: [0, -0.1 + 0.0, 0.0], flat: true });
  b.part(new THREE.BoxGeometry(1.2, 0.06, 0.9), "#6b6762", { bone: hips, at: [0, 0.03, 0.0], flat: true });
  for (const s of [-1, 1]) b.part(new THREE.BoxGeometry(0.1, 0.1, 0.1), "#6b6762", { bone: hips, at: [s * 0.4, 0.11, 0.3], flat: true });

  // body
  b.loft([
    { at: [0, 0.4, -0.35], w: 0.34, h: 0.3 },
    { at: [0, 0.45, -0.1], w: 0.5, h: 0.36 },
    { at: [0, 0.6, 0.12], w: 0.56, h: 0.4 },
    { at: [0, 0.74, 0.24], w: 0.4, h: 0.3 },
  ], { bone: [spine, hips], color: stone, sides: 8 });
  b.sweep(neck, [0.14, 0.12], { color: stone, sides: 8 });

  // head
  const H = 1;
  b.part(new THREE.BoxGeometry(0.3 * H, 0.22 * H, 0.26 * H), stone, { bone: head, at: [0, 0.86, 0.42], flat: true });
  b.part(new THREE.BoxGeometry(0.2, 0.09, 0.16), stone, { bone: head, at: [0, 0.8, 0.58], flat: true });
  b.part(new THREE.BoxGeometry(0.18, 0.06, 0.15), stone, { bone: jaw, at: [0, 0.74, 0.57], flat: true });
  b.part(new THREE.BoxGeometry(0.06, 0.04, 0.05), HORN, { bone: head, at: [0, 0.82, 0.67] });
  for (const s of [1, -1]) {
    // eyes
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), EYE, { bone: head, at: [s * 0.08, 0.89, 0.54] }), 1.5);
    b.part(new THREE.BoxGeometry(0.1, 0.03, 0.05), HORN, { bone: head, at: [s * 0.08, 0.94, 0.54], rotation: [0, 0, -s * 18] });
    // horns
    b.spike([s * 0.1, 0.96, 0.4], [s * 0.14, 1.2, 0.22], null, 0.045, HORN, { bone: head });
    // ears
    b.part(new THREE.ConeGeometry(0.04, 0.12, 4), stone, { bone: head, at: [s * 0.17, 0.92, 0.4], rotation: [0, 0, -s * 70] });
    // fangs
    b.spike([s * 0.05, 0.775, 0.64], [0, -1, 0], 0.07, 0.014, "#e8e2d0", { bone: head });
    b.spike([s * 0.05, 0.765, 0.64], [0, 1, 0], 0.06, 0.012, "#e8e2d0", { bone: jaw });
    // brow ridge shoulders
    b.part(new THREE.SphereGeometry(0.17, 7, 5), stone, { bone: spine.joints[2], at: [s * 0.28, 0.68, 0.1] });

    // arms
    const arm = b.chain(`arm${s > 0 ? "L" : "R"}`, catmull([[s * 0.28, 0.66, 0.12], [s * 0.3, 0.4, 0.3], [s * 0.26, 0.2, 0.52]]),
      { parent: spine.joints[2], names: [`shoulder${s > 0 ? "L" : "R"}`, `elbow${s > 0 ? "L" : "R"}`, `hand${s > 0 ? "L" : "R"}`], role: "arm" });
    b.sweep(arm, [0.09, 0.06], { color: stone, sides: 7 });
    const hand = arm.tip ?? arm.joints[2];
    b.part(new THREE.BoxGeometry(0.13, 0.06, 0.16), stone, { bone: hand, at: [s * 0.26, 0.21, 0.56], flat: true });
    for (let k = -1; k <= 1; k++) b.spike([s * 0.26 + k * 0.04, 0.2, 0.62], [0, 0, 1], 0.1, 0.017, HORN, { bone: hand });

    // legs
    const leg = b.chain(`leg${s > 0 ? "L" : "R"}`, catmull([[s * 0.24, 0.4, -0.2], [s * 0.34, 0.2, 0.05], [s * 0.26, 0.09, 0.2]]),
      { parent: hips, names: [`hip${s > 0 ? "L" : "R"}`, `knee${s > 0 ? "L" : "R"}`, `foot${s > 0 ? "L" : "R"}`], role: "leg" });
    b.sweep(leg, [0.13, 0.07], { color: stone, sides: 7 });
    const foot = leg.tip ?? leg.joints[2];
    b.part(new THREE.BoxGeometry(0.14, 0.06, 0.2), stone, { bone: foot, at: [s * 0.26, 0.06, 0.27], flat: true });
    for (let k = -1; k <= 1; k++) b.spike([s * 0.26 + k * 0.04, 0.06, 0.36], [0, 0, 1], 0.08, 0.017, HORN, { bone: foot });

    // wings
    const w = s > 0 ? "L" : "R";
    const wing = b.chain(`wing${w}`, catmull([[s * 0.2, 0.7, -0.05], [s * 0.45, 0.98, -0.2], [s * 0.5, 1.3, -0.4]]),
      { parent: spine.joints[2], names: [`wingA${w}`, `wingB${w}`, `wingC${w}`], role: "wing" });
    b.sweep(wing, 0.04, { color: HORN, sides: 6 });
    const wing2 = b.chain(`wingF${w}`, catmull([[s * 0.2, 0.7, -0.05], [s * 0.4, 0.75, -0.4], [s * 0.42, 0.7, -0.6]]),
      { parent: spine.joints[2], names: [`wingD${w}`, `wingE${w}`, `wingG${w}`], role: "wing" });
    b.sweep(wing2, 0.03, { color: HORN, sides: 6 });
    b.membrane(wing, wing2, { color: stone, thickness: 0.03, scallop: 0.15 });
    b.spike([s * 0.5, 1.3, -0.4], [0, 1, 0], 0.12, 0.03, HORN, { bone: wing.tip ?? wing.joints[2] });
  }

  // back ridge spikes
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const at = [0, 0.5 + t * 0.2 + 0.08, -0.25 + t * 0.4];
    b.spike(at, [0, 1, -0.4], 0.11 - t * 0.03, 0.03, HORN, { bone: spine.joints[Math.min(2, i >> 1)] });
  }

  // tail
  const tail = b.chain("tail", catmull([[0, 0.4, -0.35], [0, 0.25, -0.65], [0.15, 0.15, -0.85], [0.3, 0.12, -0.8]]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" });
  b.sweep(tail, [0.11, 0.03], { color: stone, sides: 7 });
  b.spike([0.3, 0.12, -0.8], [1, 0, 0.2], 0.12, 0.05, HORN, { bone: tail.tip ?? tail.joints[3] });

  return b.root;
}
