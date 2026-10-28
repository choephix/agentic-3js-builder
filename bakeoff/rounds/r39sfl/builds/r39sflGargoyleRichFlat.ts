import * as THREE from "three";
import { createBuilder, catmull, bezier, rng } from "../../../../src/index";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "Gothic stone gargoyle crouched on a ledge, with folded wings, horns, and a gaping jaw.",
};

const STONE = "#8a8a84";
const STONE_D = "#5f5f5b";
const STONE_L = "#a9a9a1";
const MOSS = "#5d7a45";
const EYE = "#ffb347";
const DARK = "#2a2a2a";

export default function build() {
  const b = createBuilder({ name: "gargoyle" });
  const rand = rng(5);

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.5, -0.2] });
  const spine = b.chain("spine", catmull([[0, 0.5, -0.2], [0, 0.65, 0.05], [0, 0.85, 0.22]]), { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" });
  const neck = b.chain("neck", catmull([[0, 0.85, 0.22], [0, 1.0, 0.3], [0, 1.08, 0.4]]), { parent: spine.joints[1], names: ["neck1", "neck2", "head"], role: "neck" });
  const head = neck.joints[neck.joints.length - 1];
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.04, 0.46], aim: [0, 1.0, 0.7], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.45, -0.3], [0, 0.3, -0.6], [0.1, 0.15, -0.85], [0.25, 0.1, -1.0]]), { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" });

  // ledge
  b.part(new THREE.BoxGeometry(1.1, 0.2, 1.3), STONE_D, { at: [0, -0.08, -0.1], bone: hips });
  b.part(new THREE.BoxGeometry(1.14, 0.05, 1.34), STONE_L, { at: [0, 0.04, -0.1], bone: hips });
  b.part(new THREE.BoxGeometry(0.5, 0.02, 0.4), MOSS, { at: [-0.3, 0.075, 0.3], bone: hips });

  // body
  b.loft([
    { at: [0, 0.5, -0.25], w: 0.45, h: 0.4 },
    { at: [0, 0.62, 0.0], w: 0.5, h: 0.45 },
    { at: [0, 0.82, 0.2], w: 0.62, h: 0.45 },
  ], { bone: [hips, ...spine.joints], color: STONE });
  b.sweep(neck, [0.14, 0.12], { color: STONE });
  b.sweep(tail, [0.09, 0.025], { color: STONE_D });
  b.spike([0.25, 0.1, -1.0], [0.3, 0.1, -1.15], 0.15, 0.04, { color: STONE_L, bone: tail.joints[3] });

  // chest ribs / plates
  for (let i = 0; i < 4; i++)
    b.part(new THREE.BoxGeometry(0.4 - i * 0.03, 0.04, 0.05), STONE_L, { at: [0, 0.55 + i * 0.08, 0.3 - i * 0.02 + 0.0], bone: spine.joints[1] });
  // dorsal spikes
  for (let i = 0; i < 5; i++)
    b.spike([0, 0.7 + i * 0.03, -0.2 + i * 0.1], [0, 1, -0.3], 0.12 - i * 0.012, 0.035, { color: STONE_L, bone: spine.joints[1] });

  // head
  b.part(new THREE.BoxGeometry(0.38, 0.28, 0.3), STONE, { at: [0, 1.1, 0.42], bone: head });
  b.part(new THREE.BoxGeometry(0.4, 0.07, 0.2), STONE_D, { at: [0, 1.2, 0.5], bone: head });
  b.part(new THREE.BoxGeometry(0.26, 0.1, 0.22), STONE, { at: [0, 1.05, 0.62], bone: head });
  b.part(new THREE.BoxGeometry(0.24, 0.07, 0.24), STONE_D, { at: [0, 0.97, 0.62], bone: jaw });
  for (const s of [1, -1]) {
    // eyes
    b.part(new THREE.SphereGeometry(0.035, 6, 4), EYE, { at: [s * 0.1, 1.15, 0.58], bone: head });
    // brows
    b.part(new THREE.BoxGeometry(0.14, 0.04, 0.06), STONE_D, { at: [s * 0.1, 1.2, 0.6], bone: head, rotation: [0, 0, s * -15] });
    // horns
    b.sweep(bezier([s * 0.14, 1.22, 0.38], [s * 0.3, 1.3, 0.3], [s * 0.3, 1.5, 0.1]), [0.05, 0.01], { color: STONE_L, bone: head, caps: { end: "point" } });
    // ears
    b.spike([s * 0.19, 1.12, 0.35], [s * 1, 0.4, -0.3], 0.14, 0.04, { color: STONE_D, bone: head });
    // nostrils
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.02), DARK, { at: [s * 0.05, 1.08, 0.74], bone: head });
    // upper fangs
    b.spike([s * 0.08, 1.0, 0.72], [0, -1, 0], 0.08, 0.02, { color: "#e8e6da", bone: head });
    b.spike([s * 0.08, 0.99, 0.72], [0, 1, 0], 0.06, 0.018, { color: "#e8e6da", bone: jaw });
  }
  // beard / chin
  b.spike([0, 0.95, 0.65], [0, -1, 0.3], 0.12, 0.03, { color: STONE_D, bone: jaw });

  // arms and legs crouched
  for (const s of [1, -1]) {
    const arm = b.chain(`arm${s > 0 ? "L" : "R"}`, [[s * 0.3, 0.85, 0.2], [s * 0.38, 0.55, 0.4], [s * 0.34, 0.1, 0.6]].map((p) => p as number[]), { parent: spine.joints[2], names: [`shoulder${s > 0 ? "L" : "R"}`, `elbow${s > 0 ? "L" : "R"}`, `hand${s > 0 ? "L" : "R"}`], role: "arm" });
    b.sweep(arm, [0.09, 0.06], { color: STONE });
    b.part(new THREE.BoxGeometry(0.16, 0.06, 0.2), STONE_D, { at: [s * 0.34, 0.08, 0.64], bone: arm.joints[2] });
    for (let k = -1; k <= 1; k++)
      b.spike([s * 0.34 + k * 0.05, 0.08, 0.72], [0, 0, 1], 0.1, 0.02, { color: STONE_L, bone: arm.joints[2] });
    const leg = b.chain(`leg${s > 0 ? "L" : "R"}`, [[s * 0.28, 0.5, -0.25], [s * 0.4, 0.4, 0.1], [s * 0.3, 0.1, -0.05]].map((p) => p as number[]), { parent: hips, names: [`hip${s > 0 ? "L" : "R"}`, `knee${s > 0 ? "L" : "R"}`, `foot${s > 0 ? "L" : "R"}`], role: "leg" });
    b.sweep(leg, [0.13, 0.07], { color: STONE });
    b.part(new THREE.BoxGeometry(0.16, 0.06, 0.26), STONE_D, { at: [s * 0.3, 0.1, 0.05], bone: leg.joints[2] });
    for (let k = -1; k <= 1; k++)
      b.spike([s * 0.3 + k * 0.05, 0.1, 0.17], [0, 0, 1], 0.08, 0.02, { color: STONE_L, bone: leg.joints[2] });

    // wings folded
    const w = b.chain(`wing${s > 0 ? "L" : "R"}`, [[s * 0.2, 0.85, 0.0], [s * 0.5, 1.2, -0.25], [s * 0.7, 1.5, -0.45]].map((p) => p as number[]), { parent: spine.joints[2], names: [`wingA${s > 0 ? "L" : "R"}`, `wingB${s > 0 ? "L" : "R"}`, `wingTip${s > 0 ? "L" : "R"}`], role: "wing" });
    b.sweep(w, [0.05, 0.03], { color: STONE_L });
    const fingers = [[s * 0.6, 0.8, -0.55], [s * 0.45, 0.95, -0.55], [s * 0.3, 0.85, -0.45]];
    for (const f of fingers) {
      b.rod([s * 0.5, 1.2, -0.25], f, 0.02, { color: STONE_L, bone: w.joints[1] });
    }
    b.slab([[s * 0.2, 0.85, 0.0], [s * 0.5, 1.2, -0.25], [s * 0.6, 0.8, -0.55], [s * 0.3, 0.85, -0.45]], { color: STONE_D, thickness: 0.025, bone: w.joints[1] });
    b.slab([[s * 0.5, 1.2, -0.25], [s * 0.7, 1.5, -0.45], [s * 0.6, 0.8, -0.55]], { color: STONE, thickness: 0.025, bone: w.joints[1] });
  }

  // moss and weathering bits
  for (let i = 0; i < 6; i++)
    b.part(new THREE.BoxGeometry(0.08 + rand() * 0.06, 0.02, 0.08), MOSS, { at: [(rand() - 0.5) * 0.9, 0.08, -0.5 + rand() * 0.4], bone: hips });

  return b.root;
}
