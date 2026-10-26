import * as THREE from "three";
import { createBuilder, catmull, rng, countershade, mottle, svg, aim } from "../../../../src/index";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A crouching gothic stone gargoyle on a ledge, with bat wings, horns and glowing eyes.",
};

export default function build() {
  const b = createBuilder({ name: "gargoyle" });
  const R = rng(5);

  const STONE = countershade(mottle("#7d7b76", "#5d5b58", { size: 0.12, seed: 3 }), mottle("#5a5855", "#46443f", { size: 0.1, seed: 4 }), { level: -0.2 });
  const MOSS = mottle("#6f7660", "#7d7b76", { size: 0.08, seed: 9, contrast: 1.5 });
  const DARK = "#2d2b29";
  const GLOW = "#ffb23a";

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.34, -0.22] });
  const spinePath = catmull([[0, 0.34, -0.22], [0, 0.45, 0], [0, 0.62, 0.18], [0, 0.74, 0.3]]);
  const spine = b.chain("spine", spinePath, { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" });
  const neck = b.chain("neck", catmull([[0, 0.74, 0.3], [0, 0.84, 0.36], [0, 0.88, 0.44]]), { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.88, 0.44], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.0, down: 0.05, back: 0.0 }), dir: [0, -0.1, 1], role: "jaw" });

  // base ledge
  b.part(new THREE.BoxGeometry(0.9, 0.12, 0.7), STONE, { bone: hips, at: [0, 0.06, 0] });
  b.part(new THREE.BoxGeometry(0.95, 0.04, 0.75), MOSS, { bone: hips, at: [0, 0.14, 0] });

  // torso
  b.sweep(spine, (t) => [0.17 - 0.03 * t, 0.15 - 0.02 * t], { color: STONE, bone: [spine, hips] , sides: 8 });
  b.part(new THREE.SphereGeometry(0.2, 8, 6), STONE, { bone: hips, at: [0, 0.34, -0.22], scale: [1, 0.85, 1.1] });
  b.sweep(neck, [0.1, 0.09], { color: STONE });

  // head
  b.part(new THREE.BoxGeometry(0.26, 0.2, 0.26), STONE, { bone: head, at: [0, 0.89, 0.5] });
  b.part(new THREE.BoxGeometry(0.2, 0.08, 0.16), STONE, { bone: head, at: [0, 0.99, 0.5] }); // brow
  b.part(new THREE.BoxGeometry(0.2, 0.07, 0.18), STONE, { bone: head, at: [0, 0.86, 0.66] }); // upper snout
  b.part(new THREE.BoxGeometry(0.18, 0.05, 0.2), STONE, { bone: jaw, at: [0, 0.79, 0.62] }); // lower jaw
  for (const s of [1, -1]) {
    b.spike([s * 0.06, 0.83, 0.74], [0, -1, 0], 0.05, 0.012, { color: "#d8d2c0", bone: head });
    b.spike([s * 0.07, 0.82, 0.7], [0, 1, 0], 0.04, 0.01, { color: "#d8d2c0", bone: jaw });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), GLOW, { bone: head, at: [s * 0.08, 0.94, 0.63] });
    b.part(new THREE.SphereGeometry(0.012, 5, 4), DARK, { bone: head, at: [s * 0.08, 0.94, 0.655] });
    b.sprout(`horn${s > 0 ? "L" : "R"}`, b.surface(head).nearest([s * 0.1, 1.0, 0.45]), [s * 0.2, 1.22, 0.3], [0.04, 0.005], { count: 0, color: STONE, bone: head });
    b.extrude([[0, 0], [0.1, 0.05], [0.12, 0.16], [0.03, 0.1]], { at: [s * 0.12, 0.95, 0.42], x: [s, 0, 0], thickness: 0.02, color: STONE, bone: head });
  }

  // arms + legs
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const arm = b.chain(`arm${n}`, catmull([[s * 0.2, 0.7, 0.22], [s * 0.26, 0.45, 0.4], [s * 0.22, 0.2, 0.5]]), { parent: spine.joints[2], names: [`shoulder${n}`, `elbow${n}`, `hand${n}`], role: "arm" });
    b.sweep(arm, [0.07, 0.045], { color: STONE });
    for (let i = -1; i <= 1; i++) {
      b.spike([s * 0.22 + i * 0.04, 0.17, 0.53], [i * 0.2, -0.3, 1], 0.1, 0.016, { color: DARK, bone: arm.tip ?? arm.joints[1] });
    }
    const leg = b.chain(`leg${n}`, catmull([[s * 0.22, 0.4, -0.28], [s * 0.3, 0.3, -0.05], [s * 0.24, 0.17, 0.12]]), { parent: hips, names: [`hip${n}`, `knee${n}`, `foot${n}`], role: "leg" });
    b.sweep(leg, [0.1, 0.05], { color: STONE });
    b.part(new THREE.BoxGeometry(0.1, 0.05, 0.18), STONE, { bone: leg.tip ?? leg.joints[1], at: [s * 0.24, 0.17, 0.2] });

    // wing
    const wing = b.chain(`wing${n}`, catmull([[s * 0.15, 0.65, 0.05], [s * 0.5, 0.95, -0.1], [s * 0.95, 1.1, -0.2]]), { parent: spine.joints[1], names: [`wingA${n}`, `wingB${n}`, `wingC${n}`], role: "wing" });
    b.sweep(wing, [0.035, 0.015], { color: STONE });
    const fin = [];
    for (let i = 0; i < 3; i++) {
      const f = b.chain(`finger${n}${i}`, [[s * 0.95, 1.1, -0.2], [s * (0.8 + 0.1 * i), 0.7 - 0.12 * i, -0.45 - 0.1 * i]], { parent: wing.tip ?? wing.joints[1], names: [`fing${n}${i}a`, `fing${n}${i}b`], role: "digit" });
      b.sweep(f, 0.012, { color: STONE });
      fin.push(f);
    }
    b.membrane(fin[0], fin[1], { color: "#6b6963", thickness: 0.015 });
    b.membrane(fin[1], fin[2], { color: "#625f5a", thickness: 0.015 });
    b.membrane(wing, [[s * 0.15, 0.65, 0.05], [s * 0.2, 0.5, -0.35], [s * 0.6, 0.55, -0.5]], { color: "#6b6963", thickness: 0.015 });
  }

  // tail
  const tail = b.chain("tail", catmull([[0, 0.3, -0.4], [0, 0.22, -0.6], [0.2, 0.2, -0.7], [0.3, 0.3, -0.6]]), { parent: hips, count: 4, role: "tail" });
  b.sweep(tail, [0.07, 0.015], { color: STONE });

  // spine ridge
  b.along(spine, 5, (at) => b.spike(at, [0, 1, 0], 0.07, 0.025, { color: STONE }));

  // chips and cracks decal
  const crack = svg(`<svg viewBox="0 0 32 32"><path d="M16 2 L12 12 L18 18 L10 30" stroke="#2d2b29" stroke-width="2" fill="none"/></svg>`, { size: 64 });
  b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", { bone: spine.joints[1], at: [0.1, 0.55, 0.2], dir: [1, 0.2, 0.2], axis: "z", texture: crack });

  void R; void aim;
  return b.root;
}
