```ts
import * as THREE from "three";
import { createBuilder, catmull, countershade, mottle, paint, noise, smoothstep, mix, svg, rng, bezier, offset } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "Crouched gothic stone gargoyle with bat wings, horns and glowing eyes on a ledge.",
};

export default function build() {
  const b = createBuilder({ name: "gargoyle" });
  const STONE = countershade(mottle("#7d7f84", "#9a9c9f", { size: 0.12, seed: 3 }), "#5c5e66", { level: -0.2 });
  const MOSS = paint((p, n) => {
    const m = smoothstep(0.55, 0.75, noise(p, 0.08, 9)) * smoothstep(0.4, 0.9, n.y);
    return mix(mix("#6f7176", "#8c8e92", noise(p, 0.1, 2)), "#5f7a3a", m * 0.8);
  });
  const DARK = "#3b3d44";
  const HORN = "#4a4c52";

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.38, -0.25] });
  const spine = b.chain("spine", catmull([[0, 0.38, -0.25], [0, 0.5, 0], [0, 0.68, 0.18]]), { parent: hips, role: "spine", names: ["spine1", "spine2"] });
  const neck = b.chain("neck", catmull([[0, 0.68, 0.18], [0, 0.8, 0.28], [0, 0.82, 0.38]]), { parent: spine.joints[1], role: "neck", names: ["neck1", "neck2"] });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.82, 0.38], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.78, 0.42], dir: [0, -0.05, 1], role: "jaw" });

  // ledge
  b.part(new THREE.BoxGeometry(0.8, 0.2, 0.8), MOSS, { bone: hips, at: [0, -0.1, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.9, 0.05, 0.9), STONE, { bone: hips, at: [0, 0.015, 0], flat: true });

  // body
  b.loft([
    { at: [0, 0.38, -0.3], w: 0.4, h: 0.34 },
    { at: [0, 0.48, -0.05], w: 0.46, h: 0.42 },
    { at: [0, 0.68, 0.18], w: 0.5, h: 0.4 },
  ], { bone: [hips, spine], color: STONE, sides: 6 });
  b.sweep(neck, [0.14, 0.12], { color: STONE, sides: 6 });

  // head
  b.part(new THREE.BoxGeometry(0.3, 0.24, 0.28), STONE, { bone: head, at: [0, 0.84, 0.42], flat: true });
  b.part(new THREE.BoxGeometry(0.2, 0.08, 0.2), STONE, { bone: head, at: [0, 0.8, 0.56], flat: true });
  b.part(new THREE.BoxGeometry(0.18, 0.06, 0.18), DARK, { bone: jaw, at: [0, 0.72, 0.55], flat: true });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.012, 0.04, 5), "#e8e4d4", { bone: head, at: [s * 0.06, 0.755, 0.62], rotation: [180, 0, 0] });
    b.part(new THREE.ConeGeometry(0.012, 0.04, 5), "#e8e4d4", { bone: jaw, at: [s * 0.06, 0.755, 0.62] });
    // eyes
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), "#ff7a1a", { bone: head, at: [s * 0.09, 0.88, 0.56] }), 1.5);
    b.part(new THREE.BoxGeometry(0.08, 0.02, 0.04), DARK, { bone: head, at: [s * 0.09, 0.92, 0.57], rotation: [0, 0, -s * 20] });
    // horns
    b.sweep(bezier([s * 0.1, 0.94, 0.38], [s * 0.2, 1.0, 0.3], [s * 0.2, 1.15, 0.2]), [0.045, 0.004], { bone: head, color: HORN, sides: 6 });
    // ears
    b.part(new THREE.ConeGeometry(0.05, 0.14, 4), STONE, { bone: head, at: [s * 0.17, 0.92, 0.36], rotation: [0, 0, -s * 40] });
    // legs
    const hip = [s * 0.22, 0.4, -0.22];
    const leg = b.chain("legH" + (s > 0 ? "L" : "R"), catmull([hip, [s * 0.3, 0.3, -0.05], [s * 0.26, 0.06, 0.1]]), { parent: hips, role: "leg", names: ["hip" + (s > 0 ? "L" : "R"), "knee" + (s > 0 ? "L" : "R"), "foot" + (s > 0 ? "L" : "R")] });
    b.sweep(leg, [0.1, 0.06], { color: STONE, sides: 6 });
    b.part(new THREE.BoxGeometry(0.12, 0.05, 0.2), STONE, { bone: leg.tip ?? leg.joints[1], at: [s * 0.26, 0.05, 0.17], flat: true });
    // arms
    const sh = [s * 0.24, 0.66, 0.15];
    const arm = b.chain("arm" + (s > 0 ? "L" : "R"), catmull([sh, [s * 0.3, 0.45, 0.3], [s * 0.2, 0.06, 0.42]]), { parent: spine.joints[1], role: "arm", names: ["shoulder" + (s > 0 ? "L" : "R"), "elbow" + (s > 0 ? "L" : "R"), "hand" + (s > 0 ? "L" : "R")] });
    b.sweep(arm, [0.085, 0.05], { color: STONE, sides: 6 });
    b.part(new THREE.BoxGeometry(0.12, 0.05, 0.16), STONE, { bone: arm.tip ?? arm.joints[1], at: [s * 0.2, 0.05, 0.5], flat: true });
    for (const k of [-1, 0, 1])
      b.part(new THREE.ConeGeometry(0.014, 0.07, 5), HORN, { bone: arm.tip ?? arm.joints[1], at: [s * 0.2 + k * 0.04, 0.04, 0.6], rotation: [90, 0, 0] });
    // wings
    const w0 = [s * 0.2, 0.75, -0.05];
    const wing = b.chain("wing" + (s > 0 ? "L" : "R"), catmull([w0, [s * 0.5, 1.1, -0.2], [s * 0.85, 1.25, -0.3]]), { parent: spine.joints[1], role: "wing", names: ["wingA" + (s > 0 ? "L" : "R"), "wingB" + (s > 0 ? "L" : "R"), "wingC" + (s > 0 ? "L" : "R")] });
    b.sweep(wing, [0.04, 0.02], { color: HORN, sides: 6 });
    const fingerTips = [[s * 0.95, 0.75, -0.55], [s * 0.75, 0.55, -0.7], [s * 0.45, 0.45, -0.6]];
    fingerTips.forEach((t, i) => {
      b.rod([s * 0.85, 1.25, -0.3], t, 0.012, HORN, { bone: wing.joints[2] });
    });
    b.membrane([[s * 0.85, 1.25, -0.3], ...fingerTips.slice(0, 2).map((t) => t)], [[s * 0.2, 0.7, -0.15], [s * 0.2, 0.55, -0.2], [s * 0.2, 0.45, -0.25]], { color: STONE, thickness: 0.02, bone: wing.joints[1] });
    b.membrane([fingerTips[1], fingerTips[2]], [[s * 0.2, 0.55, -0.2], [s * 0.2, 0.45, -0.25]], { color: STONE, thickness: 0.02, bone: wing.joints[1] });
  }

  // tail
  const tail = b.chain("tail", catmull([[0, 0.38, -0.3], [0, 0.2, -0.6], [0.2, 0.1, -0.75], [0.3, 0.1, -0.5]]), { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3", "tail4"] });
  b.sweep(tail, [0.09, 0.02], { color: STONE, sides: 6 });

  // back spikes
  const ridge = catmull([[0, 0.6, -0.3], [0, 0.7, -0.1], [0, 0.85, 0.12]]);
  for (let i = 0; i < 5; i++) {
    const p = ridge.at(i / 4);
    b.spike(p, [0, 1, -0.3], 0.1, 0.03, { color: HORN, bone: spine.joints[0] });
  }

  // chest emblem
  const emblem = svg(`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="none" stroke="#2d2f35" stroke-width="3"/><path d="M16 5 L19 16 L16 27 L13 16Z M5 16 L16 13 L27 16 L16 19Z" fill="#2d2f35"/></svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", { bone: spine.joints[1], at: [0, 0.6, 0.38], dir: [0, 0, 1], axis: "z", texture: emblem });

  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });
  return b.root;
}
```