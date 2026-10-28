import * as THREE from "three";
import { createBuilder, catmull, limb, paint, mix, noise, smoothstep, svg, rng } from "../../../../src/index";

export const meta = { name: "African bush elephant", description: "Low-poly adult bush elephant with rigged legs, trunk, ears, tusks and jaw." };

export default function build() {
  const b = createBuilder({ name: "elephant" });
  const SKIN = paint((p, n) => {
    const t = noise(p, 0.25, 3);
    const c = mix("#7d776f", "#a29a8e", t);
    const k = 0.85 + 0.15 * smoothstep(-0.8, 0.6, n.y);
    const d = p.y < 0.35 ? 0.82 : 1;
    return [c[0] * k * d, c[1] * k * d, c[2] * k * d];
  });
  const DARK = "#5f5a54", IVORY = "#f1e8d0", EYE = "#1a1512", PINK = "#b98c84";

  const hips = b.joint("hips", { at: [0, 2.0, -0.5], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 2.0, -0.5], [0, 2.1, 0.2], [0, 2.15, 0.9]]), { parent: hips, role: "spine", names: ["spine1", "spine2"] });
  const neck = b.chain("neck", catmull([[0, 2.15, 0.9], [0, 2.1, 1.35], [0, 2.0, 1.7]]), { parent: spine.joints[1], role: "neck", names: ["neck1", "neck2"] });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.0, 1.7], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.75, 2.1], aim: [0, 1.65, 2.5], role: "jaw" });

  // body
  b.loft([
    { at: [0, 1.95, -1.2], w: 1.1, h: 1.3 },
    { at: [0, 2.0, -0.4], w: 1.6, h: 1.9 },
    { at: [0, 2.05, 0.5], w: 1.6, h: 1.9 },
    { at: [0, 2.05, 1.2], w: 1.3, h: 1.7 },
  ], { color: SKIN });
  // head
  b.part(new THREE.BoxGeometry(0.95, 1.2, 1.0), SKIN, { bone: head, at: [0, 1.95, 1.95] });
  b.part(new THREE.BoxGeometry(0.7, 0.5, 0.4), SKIN, { bone: head, at: [0, 2.5, 1.85] });
  b.part(new THREE.BoxGeometry(0.7, 0.35, 0.5), SKIN, { bone: head, at: [0, 1.55, 2.3] });
  b.part(new THREE.BoxGeometry(0.5, 0.2, 0.45), PINK, { bone: jaw, at: [0, 1.62, 2.2] });

  // trunk
  const trunk = b.chain("trunk", catmull([[0, 1.9, 2.3], [0, 1.2, 2.5], [0, 0.55, 2.6], [0, 0.2, 2.95]]), { parent: head, role: "tentacle", names: ["trunk1", "trunk2", "trunk3"] });
  b.sweep(trunk, [0.2, 0.07], { color: SKIN, sides: 8 });
  for (let i = 0; i < 6; i++) {
    const at = trunk.at(0.15 + i * 0.14);
    b.part(new THREE.TorusGeometry(0.17 - i * 0.015, 0.012, 4, 8), DARK, { at: at.at, dir: at.tangent, axis: "z" });
  }

  // eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.06, 6, 4), EYE, { bone: head, at: [s * 0.49, 2.15, 2.15] });
    // tusks
    const tusk = catmull([[s * 0.35, 1.7, 2.4], [s * 0.55, 1.2, 2.75], [s * 0.6, 0.8, 3.3], [s * 0.5, 0.75, 3.7]]);
    b.sweep(tusk, [0.07, 0.015], { bone: head, color: IVORY, sides: 6, caps: "point" });
    // ears
    const ear = b.extrude([[0, 0.5], [0.15, 0.7], [0.65, 0.6], [0.95, 0], [0.8, -0.7], [0.3, -0.9], [0.0, -0.5]], {
      at: [s * 0.45, 2.3, 1.7], x: [s, 0.0, -0.45], y: [0, 1, 0], thickness: 0.06, bevel: 0.01, color: SKIN, bone: head,
    });
    void ear;
    // legs
    for (const [z, nm] of [[0.7, "F"], [-1.0, "H"]] as [number, string][]) {
      const side = s > 0 ? "L" : "R";
      const root: [number, number, number] = [s * 0.6, 1.5, z];
      const pts = limb(root, [s * 0.6, 0.12, z], [0.8, 0.6], [[0, 0, 1]]);
      const leg = b.chain(`leg${nm}${side}`, pts, { parent: nm === "F" ? spine.joints[1] : hips, role: "leg", names: [`hip${nm}${side}`, `knee${nm}${side}`, `foot${nm}${side}`] });
      b.sweep(leg, [0.33, 0.27], { color: SKIN, sides: 8 });
      b.part(new THREE.CylinderGeometry(0.3, 0.32, 0.14, 8), "#8a8176", { bone: leg.tip ?? leg.joints[1], at: [s * 0.6, 0.07, z + 0.03] });
      for (let k = -1; k <= 1; k++) b.part(new THREE.BoxGeometry(0.1, 0.1, 0.06), IVORY, { bone: leg.tip ?? leg.joints[1], at: [s * 0.6 + k * 0.1, 0.08, z + 0.34] });
    }
  }

  // tail
  const tail = b.chain("tail", catmull([[0, 2.4, -1.4], [0, 1.9, -1.7], [0, 1.2, -1.8]]), { parent: hips, role: "tail", names: ["tail1", "tail2"] });
  b.sweep(tail, [0.07, 0.035], { color: SKIN, sides: 6 });
  b.part(new THREE.ConeGeometry(0.07, 0.25, 5), EYE, { bone: tail.joints[1], at: [0, 1.05, -1.8], rotation: [180, 0, 0] });

  // wrinkle/eye-rim details
  const r = rng(5);
  for (let i = 0; i < 14; i++) {
    const y = 1.6 + r() * 0.8, z = -0.9 + r() * 2;
    b.part(new THREE.BoxGeometry(0.02, 0.05, 0.35), DARK, { bone: hips, at: [0.81, y, z] });
    b.part(new THREE.BoxGeometry(0.02, 0.05, 0.35), DARK, { bone: hips, at: [-0.81, y, z] });
  }
  void svg;
  return b.root;
}
