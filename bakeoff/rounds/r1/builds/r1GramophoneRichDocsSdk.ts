import * as THREE from "three";
import { createBuilder, svg, paint, mottle, grain, gradient, catmull, bezier } from "../../../../src/index";

export const meta = {
  name: "Antique Gramophone",
  description: "Walnut cabinet gramophone with inlaid florals, morning-glory brass horn, record, tonearm, crank and claw feet.",
};

export default function build() {
  const b = createBuilder({ name: "gramophone" });
  const base = b.joint("base", { at: [0, 0.1, 0], role: "spine" });
  const WOOD = grain("#5a3520", "#3f2414", { size: 0.02, axis: "y" });
  const WOOD2 = "#6b4026";
  const BRASS = mottle("#c9a24a", "#9aa05a", { size: 0.06, contrast: 0.6 });
  const BRASS_IN = "#d8b45a";
  const BLACK = "#141414";
  const RED = "#b3202a";
  const SILVER = "#c8ccd0";
  const DARK = "#2a2a2a";

  // cabinet
  b.part(new THREE.BoxGeometry(0.46, 0.34, 0.46), WOOD, { bone: base, at: [0, 0.3, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.5, 0.03, 0.5), WOOD2, { bone: base, at: [0, 0.4, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.5, 0.03, 0.5), WOOD2, { bone: base, at: [0, 0.14, 0], flat: true });
  // corner posts
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.03, 0.34, 0.03), "#4a2a16", { bone: base, at: [sx * 0.225, 0.3, sz * 0.225], flat: true });
    // claw feet
    const fx = sx * 0.21, fz = sz * 0.21;
    b.part(new THREE.SphereGeometry(0.04, 6, 5), "#2f1a0e", { bone: base, at: [fx, 0.07, fz], scale: [1, 1.2, 1] });
    for (const k of [-1, 0, 1]) {
      b.spike([fx, 0.04, fz], [sx * 0.04 * (k === 0 ? 1.4 : 1) + (k * sz * 0.025) * 0, -0.7, sz * 0.04 + k * sx * 0.03], 0.06, 0.012, { bone: base, color: BRASS });
    }
  }

  // inlay panels
  const flower = svg(
    `<svg viewBox="0 0 64 64"><g fill="#f0e2bb">
    <circle cx="32" cy="32" r="5"/>
    ${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="32" cy="17" rx="6" ry="10" transform="rotate(${a} 32 32)"/>`).join("")}
    <ellipse cx="9" cy="32" rx="7" ry="3" transform="rotate(-30 9 32)"/><ellipse cx="55" cy="32" rx="7" ry="3" transform="rotate(30 55 32)"/>
    </g></svg>`, { size: 128 });
  const mk = (w: number, h: number, at: number[], dir: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: base, at, dir, axis: "z", texture: flower });
  mk(0.3, 0.26, [0, 0.3, 0.2325], [0, 0, 1]);
  mk(0.3, 0.26, [0, 0.3, -0.2325], [0, 0, -1]);
  mk(0.3, 0.26, [0.2325, 0.3, 0], [1, 0, 0]);
  mk(0.3, 0.26, [-0.2325, 0.3, 0], [-1, 0, 0]);
  // front trim frame and little door knob
  b.part(new THREE.BoxGeometry(0.34, 0.02, 0.012), "#3a2010", { bone: base, at: [0, 0.445, 0.24], flat: true });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), BRASS_IN, { bone: base, at: [0, 0.16, 0.255] });

  // turntable
  const turn = b.joint("turntable", { parent: base, at: [-0.04, 0.4, 0.02], dir: [0, 1, 0], role: "hinge" });
  b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 20), "#3b3b3b", { bone: turn, at: [-0.04, 0.425, 0.02] });
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.008, 24), BLACK, { bone: turn, at: [-0.04, 0.438, 0.02] });
  for (const r of [0.06, 0.09, 0.12]) {
    b.part(new THREE.TorusGeometry(r, 0.0015, 3, 24), "#2c2c2c", { bone: turn, at: [-0.04, 0.443, 0.02], dir: [0, 1, 0], axis: "z" });
  }
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.003, 16), RED, { bone: turn, at: [-0.04, 0.443, 0.02] });
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.02, 6), SILVER, { bone: turn, at: [-0.04, 0.452, 0.02] });

  // horn support & throat
  const neckBase = [0.1, 0.46, -0.12];
  b.part(new THREE.CylinderGeometry(0.06, 0.08, 0.06, 10), BRASS, { bone: base, at: [0.1, 0.43, -0.12] });
  const hornPath = catmull([
    neckBase, [0.12, 0.62, -0.14], [0.16, 0.76, -0.1], [0.22, 0.86, 0.0], [0.28, 0.93, 0.12],
  ]);
  const horn = b.chain("horn", hornPath, { parent: base, count: 4, role: "neck" });
  const rad = (t: number) => 0.035 + 0.02 * t + 0.2 * Math.pow(t, 3.2);
  b.sweep(horn, rad, { sides: 14, color: BRASS, caps: "none" });
  // inner dark bell
  const mouth = horn.at(1);
  b.part(new THREE.TorusGeometry(0.235, 0.012, 5, 20), BRASS_IN, { bone: horn.joints[3], at: mouth.at, dir: mouth.tangent.toArray(), axis: "z" });
  b.part(new THREE.CircleGeometry(0.225, 16), "#5a4a1e", { bone: horn.joints[3], at: mouth.at.clone().addScaledVector(mouth.tangent, -0.01), dir: mouth.tangent.clone().negate().toArray(), axis: "z" });
  // flower ribs on horn
  b.along(horn, 6, (at) => {
    b.part(new THREE.TorusGeometry(rad(at.t) + 0.004, 0.005, 4, 14), BRASS_IN, { bone: at.bone, at: at.at, dir: at.tangent.toArray(), axis: "z" });
  }, { from: 0.45, to: 0.97 });
  // horn stand struts
  b.rod([0.1, 0.45, -0.12], [0.1, 0.62, -0.14], 0.012, { bone: base, color: BRASS_IN });

  // tonearm
  const arm = b.joint("tonearm", { parent: base, at: [0.15, 0.46, 0.17], dir: [-1, 0, 0], role: "arm" });
  b.part(new THREE.CylinderGeometry(0.025, 0.03, 0.04, 8), SILVER, { bone: arm, at: [0.15, 0.45, 0.17] });
  b.capsule([0.15, 0.475, 0.17], [-0.0, 0.48, 0.11], 0.008, { bone: arm, color: SILVER });
  b.capsule([-0.0, 0.48, 0.11], [-0.1, 0.46, 0.08], [0.008, 0.005], { bone: arm, color: SILVER });
  b.part(new THREE.BoxGeometry(0.03, 0.02, 0.02), DARK, { bone: arm, at: [-0.105, 0.455, 0.078], flat: true });
  b.spike([-0.105, 0.447, 0.078], [0, -1, 0], 0.014, 0.004, { bone: arm, color: SILVER });

  // crank
  const crank = b.joint("crank", { parent: base, at: [0.25, 0.3, 0], dir: [1, 0, 0], role: "hinge" });
  b.rod([0.24, 0.3, 0], [0.31, 0.3, 0], 0.012, { bone: crank, color: BRASS_IN });
  b.rod([0.31, 0.3, 0], [0.31, 0.22, 0], 0.01, { bone: crank, color: BRASS_IN });
  b.part(new THREE.SphereGeometry(0.025, 8, 6), "#2f1a0e", { bone: crank, at: [0.32, 0.2, 0] });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 10), BRASS, { bone: crank, at: [0.255, 0.3, 0], dir: [1, 0, 0] });

  // speed knob
  b.part(new THREE.SphereGeometry(0.015, 6, 5), BRASS_IN, { bone: base, at: [-0.2, 0.425, 0.2] });

  return b.root;
}
