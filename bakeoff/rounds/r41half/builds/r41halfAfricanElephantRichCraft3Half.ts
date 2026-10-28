import * as THREE from "three";
import { createBuilder, catmull, limb, mottle, countershade, svg, rng } from "../../../../src/index";

export const meta = { name: "African bush elephant", description: "Low-poly adult bush elephant with rigged legs, trunk, ears, tusks and jaw." };

export default function build() {
  const b = createBuilder({ name: "elephant" });
  const SKIN = countershade(mottle("#8a8580", "#6f6a66", { size: 0.25, seed: 3 }), "#9c958d", { level: -0.4 });
  const DARK = "#5a5551", IVORY = "#f1e8d0", PINK = "#b98a84", NAIL = "#d8cdb4", EYE = "#1a1412";

  const hips = b.joint("hips", { at: [0, 2.1, -0.9], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 2.2, 0.5], aim: [0, 2.35, 1.2], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 2.35, 1.3], aim: [0, 2.3, 1.8], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.3, 1.8], aim: [0, 2.25, 2.3], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.85, 2.2], aim: [0, 1.75, 2.55], role: "jaw" });

  // body
  b.loft([
    { at: [0, 2.2, -1.6], w: 1.1, h: 1.3 },
    { at: [0, 2.35, -0.7], w: 1.7, h: 1.9 },
    { at: [0, 2.4, 0.4], w: 1.8, h: 2.0 },
    { at: [0, 2.4, 1.3], w: 1.6, h: 1.9 },
  ], { bone: [hips, chest, neck], color: SKIN });
  // spine ridge
  b.rod([0, 3.35, -1.2], [0, 3.4, 1.0], [0.1, 0.1], DARK, { bone: chest });

  // head
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: head, at: [0, 2.35, 2.15], scale: [0.55, 0.7, 0.6] });
  b.part(new THREE.BoxGeometry(0.5, 0.35, 0.4), SKIN, { bone: head, at: [0, 2.85, 2.1] });
  b.part(new THREE.BoxGeometry(0.7, 0.3, 0.5), SKIN, { bone: jaw, at: [0, 1.8, 2.45] });

  // eyes + brow
  const eyeTex = svg(`<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#1a1412"/><circle cx="7" cy="7" r="2.5" fill="#fff"/></svg>`, { size: 64 });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", { bone: head, at: [s * 0.5, 2.5, 2.5], dir: [s, 0.1, 0.5], axis: "z", texture: eyeTex });
    b.part(new THREE.BoxGeometry(0.2, 0.06, 0.2), DARK, { bone: head, at: [s * 0.5, 2.62, 2.45] });
  }

  // trunk
  const trunk = b.chain("trunk", catmull([[0, 2.2, 2.55], [0, 1.7, 2.9], [0, 1.0, 3.0], [0, 0.35, 3.0], [0, 0.15, 3.35]]), { parent: head, role: "tentacle", names: ["trunk1", "trunk2", "trunk3", "trunk4"] });
  b.sweep(trunk, [0.24, 0.08], { color: SKIN, sides: 8 });
  b.part(new THREE.BoxGeometry(0.14, 0.06, 0.1), PINK, { bone: trunk.joints[3], at: [0, 0.14, 3.4] });
  for (let i = 0; i < 5; i++) b.part(new THREE.TorusGeometry(0.2 - i * 0.025, 0.015, 4, 8), DARK, { bone: trunk.joints[1], at: [0, 1.75 - i * 0.3, 2.9 - i * 0.02], rotation: [80, 0, 0] });

  // tusks + ears
  for (const s of [1, -1]) {
    const tusk = b.chain(`tusk${s > 0 ? "L" : "R"}`, catmull([[s * 0.35, 2.0, 2.4], [s * 0.45, 1.5, 2.8], [s * 0.4, 1.2, 3.3]]), { parent: head, role: "digit" });
    b.sweep(tusk, [0.09, 0.015], { color: IVORY, sides: 6, caps: "point" });
    const ear = b.extrude([[0, 0], [0.9, 0.1], [1.0, -0.8], [0.5, -1.4], [0.05, -0.9]], { at: [s * 0.55, 2.9, 1.8], x: [s, 0, -0.35], thickness: 0.07, color: SKIN, bone: head, smoothing: 1 });
    b.extrude([[0.1, -0.1], [0.75, 0], [0.8, -0.7], [0.45, -1.15], [0.1, -0.8]], { at: [s * 0.55, 2.9, 1.83], x: [s, 0, -0.35], thickness: 0.07, color: PINK, bone: head });
    void ear;
  }

  // legs
  const legs: [number, number, string][] = [[0.6, -1.4, "H"], [0.6, 0.9, "F"]];
  for (const [x, z, k] of legs) for (const s of [1, -1]) {
    const hipP: [number, number, number] = [s * x, 2.0, z];
    const pts = limb(hipP, [s * x, 0.12, z + (k === "H" ? 0.05 : 0)], [0.9, 0.9], [[0, 0, k === "H" ? 1 : -0.3]]);
    const nm = `${k}${s > 0 ? "L" : "R"}`;
    const leg = b.chain(`leg${nm}`, pts, { parent: k === "H" ? hips : chest, names: [`hip${nm}`, `knee${nm}`, `ankle${nm}`], role: "leg" });
    b.sweep(leg, [0.32, 0.26], { color: SKIN, sides: 8, caps: "flat" });
    b.part(new THREE.CylinderGeometry(0.3, 0.33, 0.14, 8), DARK, { bone: leg.tip ?? leg.joints[1], at: [s * x, 0.07, z] });
    for (let n = -1; n <= 1; n++) b.part(new THREE.BoxGeometry(0.1, 0.1, 0.08), NAIL, { bone: leg.tip ?? leg.joints[1], at: [s * x + n * 0.14, 0.1, z + 0.3] });
  }

  // tail
  const tail = b.chain("tail", catmull([[0, 2.9, -1.6], [0, 2.4, -1.95], [0, 1.7, -2.05]]), { parent: hips, role: "tail", names: ["tail1", "tail2"] });
  b.sweep(tail, [0.08, 0.04], { color: SKIN, sides: 6 });
  b.part(new THREE.ConeGeometry(0.1, 0.35, 6), EYE, { bone: tail.joints[1], at: [0, 1.6, -2.05], rotation: [180, 0, 0] });

  void rng;
  return b.root;
}
