import * as THREE from "three";
import { createBuilder, rng, catmull, mottle, countershade, paint, noise, smoothstep, mix, svg, glow } from "../../../../src/index";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A crouched gothic stone gargoyle on a weathered ledge, with bat wings, horns and glowing eyes.",
};

export default function build() {
  const b = createBuilder({ name: "gargoyle" });
  const R = rng(5);

  const STONE = countershade(mottle("#7d7b76", "#5c5a58", { size: 0.12, seed: 3 }), "#4e4c4b", { level: -0.2 });
  const MOSS = paint((p, n) => {
    const t = smoothstep(0.55, 0.8, noise(p, 0.1, 9)) * smoothstep(0.3, 0.9, n.y);
    return mix(mix("#8a8882", "#6a6863", noise(p, 0.15, 2)), "#59703a", t * 0.8);
  });
  const DARK = "#3a3938";
  const BONE = "#c9c3b4";

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.42, -0.2], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.6, 0.05], aim: [0, 0.78, 0.25], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.8, 0.22], aim: [0, 0.95, 0.38], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.95, 0.38], aim: [0, 0.98, 0.65], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.93, 0.5], aim: [0, 0.88, 0.7], role: "jaw" });

  // Ledge
  b.part(new THREE.BoxGeometry(1.1, 0.2, 0.9), MOSS, { bone: hips, at: [0, 0.1, 0.0], flat: true });
  b.part(new THREE.BoxGeometry(1.2, 0.06, 1.0), STONE, { bone: hips, at: [0, 0.21, 0.0], flat: true });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.18, 0.8), STONE, { bone: hips, at: [s * 0.52, 0.09, 0], flat: true });
  }

  // Body
  const spineP = catmull([[0, 0.45, -0.38], [0, 0.55, -0.15], [0, 0.72, 0.05], [0, 0.88, 0.2]]);
  b.sweep(spineP, [0.2, 0.17, 0.22, 0.17].map((v) => v), { bone: [hips, chest], color: STONE, sides: 7 });
  b.part(new THREE.SphereGeometry(0.2, 7, 5), STONE, { bone: chest, at: [0, 0.82, 0.12], scale: [1.4, 1, 1.1], flat: true });

  // Neck and head
  b.rod([0, 0.85, 0.15], [0, 0.95, 0.4], 0.12, STONE, { bone: neck, sides: 6 });
  b.part(new THREE.SphereGeometry(0.2, 8, 6), STONE, { bone: head, at: [0, 1.0, 0.5], scale: [1.1, 0.9, 1.05], flat: true });
  b.frustumBox([0, 0.96, 0.6], [0, 0.94, 0.82], [0.22, 0.16], [0.18, 0.12], { bone: head, color: STONE });
  b.frustumBox([0, 0.87, 0.58], [0, 0.86, 0.8], [0.18, 0.05], [0.14, 0.04], { bone: jaw, color: DARK });
  for (const s of [1, -1]) {
    // brow ridge
    b.part(new THREE.BoxGeometry(0.12, 0.04, 0.1), STONE, { bone: head, at: [s * 0.09, 1.09, 0.64], rotation: [0, 0, s * -15], flat: true });
    // eyes
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), "#ff7a1f", { bone: head, at: [s * 0.09, 1.04, 0.66] }), 1.6);
    // horns
    b.sweep(catmull([[s * 0.1, 1.12, 0.45], [s * 0.2, 1.3, 0.4], [s * 0.2, 1.48, 0.28]]), [0.05, 0], {
      bone: head, color: BONE, sides: 6, caps: "point",
    });
    // ears
    b.extrude([[0, 0], [0.1, 0.03], [0.05, 0.2]], { at: [s * 0.18, 1.02, 0.4], x: [s, 0, 0], thickness: 0.03, color: STONE, bone: head });
    // fangs
    b.spike([s * 0.07, 0.9, 0.82], [0, 1, 0], 0.07, 0.016, { bone: jaw, color: BONE });
    b.spike([s * 0.06, 0.92, 0.84], [0, -1, 0], 0.06, 0.014, { bone: head, color: BONE });
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.02), DARK, { bone: head, at: [s * 0.03, 0.99, 0.9] });
  }
  b.part(new THREE.BoxGeometry(0.1, 0.12, 0.2), STONE, { bone: jaw, at: [0, 0.82, 0.7], flat: true }); // chin beard

  // Limbs
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    // haunch
    const hip = b.joint(`hip${L}`, { parent: hips, at: [s * 0.22, 0.45, -0.25], aim: [s * 0.26, 0.24, -0.05], role: "leg" });
    b.part(new THREE.SphereGeometry(0.17, 7, 5), STONE, { bone: hip, at: [s * 0.22, 0.42, -0.25], scale: [0.9, 1.1, 1.2], flat: true });
    b.rod([s * 0.24, 0.4, -0.25], [s * 0.26, 0.25, 0.0], 0.09, STONE, { bone: hip, sides: 6 });
    b.part(new THREE.BoxGeometry(0.12, 0.06, 0.3), STONE, { bone: hip, at: [s * 0.26, 0.26, 0.08], flat: true });
    for (let i = -1; i <= 1; i++) {
      b.spike([s * 0.26 + i * 0.04, 0.25, 0.22], [0, -0.2, 1], 0.1, 0.02, { bone: hip, color: DARK });
    }
    // arms gripping the ledge front
    const sh = b.joint(`shoulder${L}`, { parent: chest, at: [s * 0.24, 0.85, 0.15], aim: [s * 0.28, 0.5, 0.4], role: "arm" });
    b.rod([s * 0.24, 0.85, 0.15], [s * 0.28, 0.5, 0.38], [0.09, 0.07], STONE, { bone: sh, sides: 6 });
    b.part(new THREE.SphereGeometry(0.1, 6, 5), STONE, { bone: sh, at: [s * 0.25, 0.86, 0.14], flat: true });
    b.part(new THREE.BoxGeometry(0.14, 0.07, 0.16), STONE, { bone: sh, at: [s * 0.28, 0.27, 0.42], flat: true });
    for (let i = -1; i <= 1; i++) {
      b.spike([s * 0.28 + i * 0.04, 0.26, 0.5], [0, -0.3, 1], 0.1, 0.02, { bone: sh, color: DARK });
    }
    b.rod([s * 0.28, 0.5, 0.38], [s * 0.28, 0.3, 0.44], 0.06, STONE, { bone: sh, sides: 6 });

    // wings
    const w1 = b.joint(`wing${L}`, { parent: chest, at: [s * 0.2, 0.95, -0.05], aim: [s * 0.8, 1.5, -0.3], role: "wing" });
    const wp = [[s * 0.2, 0.95, -0.05], [s * 0.55, 1.3, -0.2], [s * 0.85, 1.55, -0.4]];
    b.sweep(catmull(wp), [0.05, 0.03], { bone: w1, color: STONE, sides: 6 });
    const tips = [[s * 1.1, 1.2, -0.55], [s * 0.95, 0.85, -0.5], [s * 0.6, 0.62, -0.38]];
    for (const t of tips) b.rod(wp[2], t, 0.025, STONE, { bone: w1, sides: 5 });
    b.extrude(
      [[0, 0], [0.9, 0.0], [0.7, -0.4], [0.45, -0.2], [0.2, -0.55], [0, -0.45]],
      { at: [s * 0.2, 1.2, -0.15], x: [s * 0.9, 0.25, -0.4], y: [0, 1, 0], thickness: 0.025, color: STONE, bone: w1 },
    );
  }

  // Tail curling around ledge
  const tail = b.chain("tail", catmull([[0, 0.4, -0.4], [0, 0.32, -0.6], [0.3, 0.3, -0.7], [0.5, 0.3, -0.45]]), { parent: hips, count: 4, role: "tail" });
  b.sweep(tail, (t) => 0.09 * (1 - t) + 0.025, { color: STONE, sides: 6 });
  b.extrude([[0, 0], [0.1, 0.0], [0.05, 0.12]], { at: [0.5, 0.3, -0.4], x: [1, 0, 0], thickness: 0.03, color: DARK, bone: tail.joints[3] });

  // Spine ridge
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const p = spineP.at(t);
    b.spike([p.x, p.y + 0.15, p.z], [0, 1, -0.2], 0.1, 0.03, { bone: i < 3 ? hips : chest, color: STONE });
  }

  // Chest rune plaque
  const rune = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#2b2a2a" stroke-width="5"/><path d="M32 10 L32 54 M18 24 L46 24 M20 44 L32 32 L44 44" stroke="#2b2a2a" stroke-width="5" fill="none"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#bdb7aa", { bone: chest, at: [0, 0.78, 0.32], dir: [0, 0, 1], axis: "z", texture: rune });

  // lichen cards unnecessary; small chips
  for (let i = 0; i < 6; i++) {
    b.part(new THREE.BoxGeometry(0.05, 0.03, 0.05), MOSS, { bone: hips, at: [(R() - 0.5) * 1.0, 0.25, (R() - 0.5) * 0.8], flat: true });
  }

  return b.root;
}
