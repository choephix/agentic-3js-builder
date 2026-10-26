import * as THREE from "three";
import { createBuilder, frame, rng, catmull, bezier, offset, mottle, countershade, paint, noise, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A crouching gothic stone gargoyle with bat wings, horns and glowing eyes on a carved ledge.",
};

const STONE = countershade(mottle("#8d8a84", "#6f6c68", { size: 0.12, seed: 3 }), "#5a5855", { level: -0.2 });
const MOSS = paint((p, n) => {
  const m = noise(p, 0.08, 9);
  const base = noise(p, 0.15, 2) > 0.5 ? "#85827c" : "#76736d";
  return n.y > 0.5 && m > 0.55 ? "#5f7a4a" : base;
});
const DARK = "#3e3c3a";
const HORN = "#b8b2a2";

export default function build() {
  const b = createBuilder({ name: "gargoyle" });
  const R = rng(5);

  // ledge
  b.part(new THREE.BoxGeometry(1.1, 0.16, 0.8), MOSS, { at: [0, 0.08, 0], bone: undefined });
  b.part(new THREE.BoxGeometry(1.2, 0.05, 0.9), STONE, { at: [0, 0.025, 0] });

  const hips = b.joint("hips", { at: [0, 0.5, -0.12], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.5, -0.12], [0, 0.62, 0.05], [0, 0.78, 0.18]]), { parent: hips, role: "spine", names: ["spine1", "spine2"] });
  const neck = b.chain("neck", catmull([[0, 0.78, 0.18], [0, 0.88, 0.26], [0, 0.93, 0.34]]), { parent: spine.joints[1], role: "neck", names: ["neck1", "neck2"] });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.93, 0.34], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.9, 0.4], dir: [0, 0, 1], role: "jaw" });

  b.sweep(catmull([[0, 0.5, -0.12], [0, 0.62, 0.05], [0, 0.78, 0.18]]), [0.2, 0.22], { bone: [hips, spine], color: STONE });
  b.sweep(catmull([[0, 0.78, 0.18], [0, 0.88, 0.26], [0, 0.93, 0.34]]), [0.14, 0.12], { bone: neck, color: STONE });

  // chest plate
  b.part(new THREE.IcosahedronGeometry(0.2, 0), STONE, { at: [0, 0.72, 0.2], scale: [1.2, 1, 0.9], flat: true });

  // head
  b.part(new THREE.BoxGeometry(0.3, 0.22, 0.28), STONE, { bone: head, at: [0, 0.95, 0.42] });
  b.part(new THREE.BoxGeometry(0.34, 0.07, 0.1), STONE, { bone: head, at: [0, 1.04, 0.5] }); // brow
  b.part(new THREE.BoxGeometry(0.24, 0.07, 0.2), STONE, { bone: head, at: [0, 0.86, 0.6] }); // upper snout
  b.part(new THREE.BoxGeometry(0.22, 0.05, 0.2), DARK, { bone: jaw, at: [0, 0.8, 0.58] });
  for (const s of [1, -1]) {
    glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), "#ffb040", { bone: head, at: [s * 0.09, 0.97, 0.57] }), 1.6);
    b.part(new THREE.ConeGeometry(0.022, 0.06, 5), "#d8d4c6", { bone: head, at: [s * 0.07, 0.83, 0.72], rotation: [180, 0, 0] });
    b.part(new THREE.ConeGeometry(0.022, 0.06, 5), "#d8d4c6", { bone: jaw, at: [s * 0.07, 0.84, 0.66] });
    b.part(new THREE.BoxGeometry(0.02, 0.02, 0.03), DARK, { bone: head, at: [s * 0.04, 0.9, 0.7] });
    // horns
    b.sweep(bezier([s * 0.1, 1.04, 0.38], [s * 0.2, 1.2, 0.3], [s * 0.2, 1.32, 0.15]), [0.05, 0.005], { bone: head, color: HORN, caps: { end: "point" }, sides: 6 });
    // ears
    b.part(new THREE.ConeGeometry(0.04, 0.12, 4), STONE, { bone: head, at: [s * 0.17, 1.0, 0.33], rotation: [0, 0, -s * 70] });
  }

  // legs: crouched
  for (const s of [1, -1]) {
    const hipP: [number, number, number] = [s * 0.2, 0.5, -0.15];
    const leg = b.chain(`legH${s > 0 ? "L" : "R"}`, catmull([hipP, [s * 0.24, 0.4, 0.1], [s * 0.2, 0.12, 0.05]]), { parent: hips, role: "leg", names: [`hipH${s > 0 ? "L" : "R"}`, `kneeH${s > 0 ? "L" : "R"}`, `footH${s > 0 ? "L" : "R"}`] });
    b.sweep(leg, [0.12, 0.06], { color: STONE });
    for (let k = 0; k < 3; k++)
      b.sweep([[s * (0.2 + (k - 1) * 0.05), 0.15, 0.1], [s * (0.2 + (k - 1) * 0.06), 0.14, 0.26]], 0.025, { bone: leg.tip ?? leg.joints[1], color: STONE, caps: { end: "point" }, sides: 5 });
    // arms
    const sh: [number, number, number] = [s * 0.22, 0.78, 0.2];
    const arm = b.chain(`arm${s > 0 ? "L" : "R"}`, catmull([sh, [s * 0.26, 0.55, 0.32], [s * 0.2, 0.14, 0.4]]), { parent: spine.joints[1], role: "arm", names: [`shoulder${s > 0 ? "L" : "R"}`, `elbow${s > 0 ? "L" : "R"}`, `hand${s > 0 ? "L" : "R"}`] });
    b.sweep(arm, [0.085, 0.05], { color: STONE });
    b.part(new THREE.BoxGeometry(0.16, 0.06, 0.14), STONE, { bone: arm.tip ?? arm.joints[1], at: [s * 0.2, 0.1, 0.42] });
    for (let k = 0; k < 3; k++)
      b.part(new THREE.ConeGeometry(0.02, 0.1, 5), HORN, { bone: arm.tip ?? arm.joints[1], at: [s * (0.2 + (k - 1) * 0.055), 0.1, 0.52], rotation: [90, 0, 0] });

    // wings
    const w = b.chain(`wing${s > 0 ? "L" : "R"}`, catmull([[s * 0.15, 0.85, 0.05], [s * 0.45, 1.2, -0.15], [s * 0.85, 1.35, -0.3]]), { parent: spine.joints[1], role: "wing", names: [`wingU${s > 0 ? "L" : "R"}`, `wingF${s > 0 ? "L" : "R"}`, `wingT${s > 0 ? "L" : "R"}`] });
    b.sweep(w, [0.04, 0.02], { color: STONE });
    const fingers = [[s * 0.95, 0.85, -0.35], [s * 0.8, 0.6, -0.4], [s * 0.5, 0.55, -0.3]];
    const wb = w.joints[1];
    const edges = fingers.map((f) => b.sweep([[s * 0.45, 1.2, -0.15], f], 0.012, { bone: wb, color: STONE, caps: { end: "round" }, sides: 5 }));
    void edges;
    for (let k = 0; k < fingers.length - 0; k++) {
      const a = k === 0 ? [s * 0.85, 1.35, -0.3] : fingers[k - 1];
      b.membrane([[s * 0.45, 1.2, -0.15], a], [[s * 0.45, 1.2, -0.15], fingers[k]].length ? [fingers[k], fingers[k]] : [], { color: "#57554f", bone: wb, thickness: 0.015 });
    }
    b.extrude([[0, 0], [0.45, 0.35, "sharp"], [0.8, 0.2], [0.7, -0.35, "sharp"], [0.35, -0.55], [0.05, -0.4]], { at: [s * 0.15, 0.95, -0.1], x: [s, 0, 0], y: [0, 1, -0.2], thickness: 0.02, color: "#5d5b56", bone: wb });
  }

  // tail
  const tail = b.chain("tail", catmull([[0, 0.5, -0.12], [0, 0.3, -0.4], [0.2, 0.15, -0.55], [0.35, 0.12, -0.35]]), { parent: hips, role: "tail", count: 4 });
  b.sweep(tail, [0.1, 0.03], { color: STONE });
  b.part(new THREE.ConeGeometry(0.06, 0.14, 4), STONE, { bone: tail.joints[3], at: [0.38, 0.12, -0.25], rotation: [90, 0, 0] });

  // back spines
  b.along(catmull([[0, 0.7, -0.05], [0, 0.78, 0.1], [0, 0.88, 0.2]]), 4, (at) => {
    b.part(new THREE.ConeGeometry(0.03 + R() * 0.01, 0.09, 4), HORN, { bone: spine.joints[1], at: at.at });
  });

  // face glyph on chest
  const rune = svg(`<svg viewBox="0 0 32 32"><path d="M16 3 L28 16 L16 29 L4 16Z" fill="none" stroke="#2a2826" stroke-width="3"/><circle cx="16" cy="16" r="3" fill="#2a2826"/></svg>`, { size: 96 });
  b.part(new THREE.PlaneGeometry(0.14, 0.14), "#ffffff", { bone: spine.joints[1], at: [0, 0.7, 0.4], dir: [0, 0, 1], axis: "z", texture: rune });

  void frame; void offset;
  return b.root;
}
