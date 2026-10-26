import * as THREE from "three";
import { createBuilder, catmull, bezier, countershade, mottle, paint, noise, smoothstep, mix, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A crouching gothic stone gargoyle on a ledge, with bat wings, horns and glowing eyes.",
};

export default function build() {
  const b = createBuilder({ name: "gargoyle" });

  const STONE = mottle("#8d8a83", "#6d6b66", { size: 0.12, seed: 3 });
  const MOSS = paint((p, n) => {
    const base = mix("#8a8780", "#64625d", noise(p, 0.1, 5));
    const m = smoothstep(0.55, 0.75, noise(p, 0.07, 9)) * smoothstep(0.3, 0.9, n.y);
    return mix(base, "#5f7a45", m * 0.8);
  });
  const SOFT = countershade(STONE, "#5a5853", { level: -0.1 });
  const HORN = "#d8d2c0";
  const EYE = "#ffb030";

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.42, -0.15] });
  const spine = b.chain("spine", catmull([[0, 0.42, -0.15], [0, 0.55, 0.05], [0, 0.72, 0.22]]), {
    parent: hips, role: "spine", names: ["spine1", "spine2", "chest"],
  });
  const neck = b.chain("neck", catmull([[0, 0.72, 0.22], [0, 0.82, 0.3], [0, 0.88, 0.4]]), {
    parent: spine.joints[2], role: "neck", names: ["neck1", "neck2", "head"],
  });
  const head = neck.joints[2];
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.86, 0.43], aim: [0, 0.8, 0.62], role: "jaw" });

  // body
  b.sweep(catmull([[0, 0.42, -0.2], [0, 0.55, 0.05], [0, 0.74, 0.24]]), (t) => [0.17 - 0.03 * t, 0.15], {
    bone: [hips, ...spine.joints], color: SOFT,
  });
  b.sweep(neck, [0.1, 0.09], { color: SOFT });
  b.part(new THREE.SphereGeometry(0.2, 8, 6), STONE, { bone: spine.joints[2], at: [0, 0.76, 0.2], scale: [1.3, 0.8, 0.9] });

  // head
  b.part(new THREE.BoxGeometry(0.28, 0.2, 0.24), STONE, { bone: head, at: [0, 0.9, 0.46] });
  b.part(new THREE.BoxGeometry(0.22, 0.07, 0.18), STONE, { bone: head, at: [0, 0.83, 0.58] });
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.18), SOFT, { bone: jaw, at: [0, 0.78, 0.56] });
  b.part(new THREE.BoxGeometry(0.3, 0.05, 0.1), STONE, { bone: head, at: [0, 0.99, 0.55] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.04, 6, 4), EYE, { bone: head, at: [s * 0.09, 0.93, 0.585] });
    glow(b.part(new THREE.SphereGeometry(0.028, 6, 4), EYE, { bone: head, at: [s * 0.09, 0.93, 0.6] }), 2);
    b.spike([s * 0.07, 0.98, 0.42], [s * 0.15, 0.2, -0.25], 0.32, 0.045, { bone: head, color: HORN });
    b.spike([s * 0.15, 0.95, 0.4], [s * 0.6, 0.5, 0], 0.18, 0.04, { bone: head, color: STONE });
    for (const x of [-0.06, 0.06])
      b.spike([s * x + 0, 0.8, 0.66], [0, -1, 0.2], 0.06, 0.012, { bone: head, color: HORN });
  }

  // limbs
  for (const s of [1, -1]) {
    const arm = b.chain(`arm${s > 0 ? "L" : "R"}`, catmull([[s * 0.2, 0.7, 0.2], [s * 0.26, 0.5, 0.38], [s * 0.2, 0.2, 0.5]]), {
      parent: spine.joints[2], role: "arm", names: [`shoulder${s > 0 ? "L" : "R"}`, `elbow${s > 0 ? "L" : "R"}`, `hand${s > 0 ? "L" : "R"}`],
    });
    b.sweep(arm, [0.075, 0.05], { color: STONE });
    b.part(new THREE.BoxGeometry(0.12, 0.05, 0.16), STONE, { bone: arm.tip ?? arm.joints[2], at: [s * 0.2, 0.025, 0.55] });
    for (const k of [-1, 0, 1])
      b.spike([s * 0.2 + k * 0.04, 0.03, 0.62], [0, -0.3, 1], 0.07, 0.015, { bone: arm.tip ?? arm.joints[2], color: HORN });

    const leg = b.chain(`leg${s > 0 ? "L" : "R"}`, catmull([[s * 0.2, 0.4, -0.2], [s * 0.3, 0.3, 0.05], [s * 0.2, 0.1, 0.0]]), {
      parent: hips, role: "leg", names: [`hip${s > 0 ? "L" : "R"}`, `knee${s > 0 ? "L" : "R"}`, `foot${s > 0 ? "L" : "R"}`],
    });
    b.sweep(leg, [0.11, 0.06], { color: STONE });
    b.part(new THREE.BoxGeometry(0.12, 0.05, 0.2), STONE, { bone: leg.tip ?? leg.joints[2], at: [s * 0.2, 0.025, 0.06] });

    // wings
    const w = b.chain(`wing${s > 0 ? "L" : "R"}`, catmull([[s * 0.15, 0.78, 0.1], [s * 0.5, 1.05, -0.1], [s * 0.9, 1.15, -0.25]]), {
      parent: spine.joints[2], role: "wing", names: [`wingA${s > 0 ? "L" : "R"}`, `wingB${s > 0 ? "L" : "R"}`, `wingC${s > 0 ? "L" : "R"}`],
    });
    b.sweep(w, [0.04, 0.02], { color: STONE });
    const f1 = b.chain(`finA${s > 0 ? "L" : "R"}`, catmull([[s * 0.9, 1.15, -0.25], [s * 1.05, 0.8, -0.45]]), { parent: w.tip ?? w.joints[2], role: "digit", names: [`dA${s > 0 ? "L" : "R"}`, `dAt${s > 0 ? "L" : "R"}`] });
    const f2 = b.chain(`finB${s > 0 ? "L" : "R"}`, catmull([[s * 0.5, 1.05, -0.1], [s * 0.75, 0.6, -0.45]]), { parent: w.joints[1], role: "digit", names: [`dB${s > 0 ? "L" : "R"}`, `dBt${s > 0 ? "L" : "R"}`] });
    b.sweep(f1, 0.02, { color: STONE });
    b.sweep(f2, 0.02, { color: STONE });
    b.membrane(f1, f2, { color: STONE, thickness: 0.025, scallop: 0.2, bone: w.joints[1] });
    b.membrane(f2, [[s * 0.15, 0.7, -0.05], [s * 0.2, 0.5, -0.25]], { color: SOFT, thickness: 0.025, bone: spine.joints[2] });
  }

  // tail
  const tail = b.chain("tail", catmull([[0, 0.42, -0.2], [0, 0.3, -0.5], [0.15, 0.15, -0.75], [0.3, 0.12, -0.7]]), {
    parent: hips, role: "tail", names: ["tail1", "tail2", "tail3", "tail4"],
  });
  b.sweep(tail, [0.08, 0.02], { color: STONE });
  b.spike([0.3, 0.12, -0.7], [1, 0, 0.2], 0.12, 0.03, { color: HORN });

  // back spines
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    b.spike([0, 0.6 + 0.12 * t, -0.15 + 0.35 * t], [0, 1, -0.3], 0.08, 0.025, { bone: spine.joints[1], color: HORN });
  }

  // ledge
  b.part(new THREE.BoxGeometry(0.9, 0.1, 1.2), MOSS, { bone: hips, at: [0, -0.05, 0.0] });
  b.part(new THREE.BoxGeometry(0.96, 0.04, 1.26), STONE, { bone: hips, at: [0, 0.015, 0.0] });

  // rune plaque
  const rune = svg(`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="none" stroke="#3a3935" stroke-width="3"/><path d="M16 6V26M8 12L24 20M24 12L8 20" stroke="#3a3935" stroke-width="3"/></svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#cfcabd", { bone: spine.joints[2], at: [0, 0.78, 0.37], dir: [0, 0.1, 1], axis: "z", texture: rune });

  return b.root;
}
