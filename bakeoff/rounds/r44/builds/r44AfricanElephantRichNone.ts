import * as THREE from "three";
import { createBuilder, catmull, bezier, limb, paint, mix, noise, smoothstep, stripes } from "../../../../src/index";

export const meta = {
  name: "African bush elephant",
  description: "Low-poly adult bush elephant: rigged legs, trunk, ears, tusks, jaw and tail.",
};

export default function build() {
  const b = createBuilder({ name: "elephant" });
  const IVORY = "#efe6cf", NAIL = "#cfc3a8", DARK = "#3a3430", PINK = "#b88c86";

  const SKIN = paint((p, n) => {
    const base = mix("#77746f", "#9b968f", noise(p, 0.35, 3));
    const lit = mix(base, "#b3aca2", smoothstep(0.3, 1, n.y) * 0.35);
    return mix(lit, "#a58a68", smoothstep(1.0, 0.1, p.y) * 0.75);
  });
  const TRUNK = stripes(SKIN, "#5f5b57", { size: 0.07, axis: "y", width: 0.3, wobble: 0.3 });

  // skeleton
  const hips = b.joint("hips", { at: [0, 2.3, -1.6], role: "spine" });
  const spinePath = catmull([[0, 2.3, -1.6], [0, 2.35, -0.4], [0, 2.4, 0.7], [0, 2.35, 1.5]]);
  const spine = b.chain("spine", spinePath, { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" });
  const lastSpine = spine.joints[spine.joints.length - 1];

  b.sweep(spine, (t) => [0.85 - 0.1 * t, 0.98 - 0.08 * Math.abs(t - 0.4)], { color: SKIN, sides: 10, caps: "round" });
  // shoulder hump / rump
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: lastSpine, at: [0, 3.0, 0.9], scale: [0.7, 0.45, 0.7] });

  const head = b.joint("head", { parent: lastSpine, at: [0, 2.35, 1.6], aim: [0, 2.3, 2.4], role: "head" });
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { bone: head, at: [0, 2.4, 2.1], scale: [0.62, 0.74, 0.7] });
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: head, at: [0, 2.95, 2.0], scale: [0.5, 0.4, 0.45] });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.0, 2.2], aim: [0, 1.95, 2.8], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.5, 0.2, 0.55), SKIN, { bone: jaw, at: [0, 1.95, 2.5] });
  b.part(new THREE.BoxGeometry(0.3, 0.05, 0.3), PINK, { bone: jaw, at: [0, 2.06, 2.55] });

  // eyes and brows
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.06, 6, 4), DARK, { bone: head, at: [s * 0.5, 2.55, 2.35] });
    b.part(new THREE.BoxGeometry(0.16, 0.04, 0.1), "#6a6661", { bone: head, at: [s * 0.5, 2.64, 2.33] });
  }

  // trunk
  const trunkPath = catmull([[0, 2.0, 2.6], [0, 1.4, 3.0], [0, 0.8, 3.12], [0, 0.3, 3.0]]);
  const trunk = b.chain("trunk", trunkPath, { parent: head, count: 6, role: "tentacle" });
  b.sweep(trunk, (t) => 0.3 - 0.2 * t, { color: TRUNK, sides: 8 });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.05, 0.12, 0.08), "#8d8883", { bone: trunk.joints[5], at: [s * 0.05, 0.2, 3.1] });

  // tusks
  for (const s of [1, -1]) {
    b.sweep(bezier([s * 0.33, 1.95, 2.5], [s * 0.5, 1.4, 3.0], [s * 0.42, 1.25, 3.6]), [0.08, 0.012], {
      bone: head, color: IVORY, sides: 6, caps: { start: "flat", end: "point" },
    });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 8), "#8d8883", { bone: head, at: [s * 0.33, 1.97, 2.5], dir: [0, -0.3, 1] });
  }

  // ears
  const ear = [[0, 0.35], [0.5, 0.6], [0.95, 0.25], [1.0, -0.5], [0.65, -1.0], [0.2, -0.7], [0, -0.3]] as [number, number][];
  for (const s of [1, -1]) {
    const j = b.joint(s > 0 ? "earL" : "earR", { parent: head, at: [s * 0.5, 2.9, 1.9], dir: [s, 0, -0.3], role: "hinge" });
    b.extrude(ear, { at: [s * 0.5, 2.9, 1.9], x: [s, 0, -0.35], y: [0, 1, 0], thickness: 0.05, bevel: 0.01, smoothing: 1, color: SKIN, bone: j });
    b.extrude(ear.map(([x, y]) => [x * 0.7 + 0.05, y * 0.7 - 0.05] as [number, number]), {
      at: [s * 0.5, 2.9, 1.9 - 0.03 * 1], x: [s, 0, -0.35], y: [0, 1, 0], thickness: 0.06, color: PINK, bone: j,
    });
  }

  // legs
  const legs: [string, number, number, any][] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const [tag, z, parent] of [["F", 1.0, lastSpine], ["H", -1.3, hips]] as const) {
      const x = s * 0.6;
      const pts = limb([x, 2.0, z], [x, 0.2, z], [1.05, 1.05], [[0, 0, 1]]);
      const leg = b.chain(`leg${tag}${side}`, pts, {
        parent, names: [`hip${tag}${side}`, `knee${tag}${side}`, `foot${tag}${side}`], role: "leg",
      });
      b.sweep(leg, [0.46, 0.33], { color: SKIN, sides: 8, caps: "flat" });
      const foot = leg.joints[leg.joints.length - 1];
      b.part(new THREE.CylinderGeometry(0.4, 0.43, 0.22, 9), SKIN, { bone: foot, at: [x, 0.11, z + 0.02] });
      for (let i = -1; i <= 1; i++)
        b.part(new THREE.BoxGeometry(0.13, 0.12, 0.07), NAIL, { bone: foot, at: [x + i * 0.2, 0.09, z + 0.4 - Math.abs(i) * 0.05] });
      legs.push([tag, x, z, leg]);
    }
  }

  // tail
  const tail = b.chain("tail", catmull([[0, 2.45, -2.35], [0, 1.9, -2.55], [0, 1.2, -2.6]]), { parent: hips, count: 4, role: "tail" });
  b.sweep(tail, [0.08, 0.04], { color: SKIN, sides: 6 });
  const tip = tail.joints[tail.joints.length - 1];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.spike([0, 1.2, -2.6], [Math.cos(a) * 0.3, -1, Math.sin(a) * 0.3 - 0.1], 0.3, 0.025, { color: DARK, bone: tip });
  }

  return b.root;
}
