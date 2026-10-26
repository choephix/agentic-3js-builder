import * as THREE from "three";
import { createBuilder, catmull, countershade, grain, mottle, svg, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cardboard Robot Kid",
  description: "A kid in a handmade cardboard-box robot costume with foil, tape and bottle-cap buttons.",
};

export default function build() {
  const b = createBuilder({ name: "cardboardKid" });
  const CARD = grain("#c89a5e", "#a97b44", { size: 0.02, axis: "y" });
  const CARD2 = grain("#d6a96c", "#b98a50", { size: 0.02, axis: "x", seed: 3 });
  const FOIL = mottle("#e4e8ee", "#a9b0bd", { size: 0.04, contrast: 1.5 });
  const SKIN = countershade("#f1c4a0", "#d9a582");
  const HAIR = "#3a2416", TAPE = "#c9402f", BLUE = "#3a6fc4", DARK = "#2b2b33", SHORTS = "#4a5a8a", SHOE = "#e8e8e8";
  const R = rng(5);

  const hips = b.joint("hips", { at: [0, 0.5, 0], role: "spine" });
  const spine = b.joint("spine", { parent: hips, at: [0, 0.6, 0], dir: [0, 1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: spine, at: [0, 0.98, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.04, 0], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.1, 0.06], dir: [0, 0, 1], role: "jaw" });

  // legs
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const leg = b.chain(`leg${n}`, [[s * 0.07, 0.5, 0], [s * 0.07, 0.28, 0.01], [s * 0.07, 0.07, 0]], {
      parent: hips, names: [`hip${n}`, `knee${n}`, `ankle${n}`], role: "leg",
    });
    b.sweep(leg, [0.036, 0.03], { color: SKIN });
    b.part(new THREE.CylinderGeometry(0.04, 0.043, 0.08, 8), "#f5f5f5", { bone: leg.joints[1], at: [s * 0.07, 0.1, 0] });
    b.part(new THREE.BoxGeometry(0.075, 0.05, 0.16), SHOE, { bone: leg.tip ?? leg.joints[1], at: [s * 0.07, 0.025, 0.04] });
    b.part(new THREE.BoxGeometry(0.077, 0.015, 0.1), BLUE, { bone: leg.tip ?? leg.joints[1], at: [s * 0.07, 0.04, 0.07] });
    // arm
    const arm = b.chain(`arm${n}`, [[s * 0.25, 0.92, 0], [s * 0.3, 0.74, 0.02], [s * 0.31, 0.58, 0.1]], {
      parent: spine, names: [`shoulder${n}`, `elbow${n}`, `wrist${n}`], role: "arm",
    });
    b.sweep(arm, [0.032, 0.026], { color: SKIN });
    // foil-wrapped sleeve tube
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8), FOIL, {
      bone: arm.joints[0], at: [s * 0.275, 0.82, 0.01], rotation: [0, 0, s * -8],
    });
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.02, 8), TAPE, { bone: arm.joints[0], at: [s * 0.27, 0.72, 0.01] });
    b.part(new THREE.SphereGeometry(0.045, 8, 6), SKIN, { bone: arm.tip ?? arm.joints[1], at: [s * 0.31, 0.55, 0.11] });
    // thumb + fingers block
    b.part(new THREE.BoxGeometry(0.02, 0.02, 0.04), SKIN, { bone: arm.tip ?? arm.joints[1], at: [s * 0.34, 0.55, 0.14] });
  }

  // shorts
  b.part(new THREE.BoxGeometry(0.22, 0.14, 0.14), SHORTS, { bone: hips, at: [0, 0.5, 0] });

  // cardboard torso box
  b.part(new THREE.BoxGeometry(0.4, 0.5, 0.3), CARD, { bone: spine, at: [0, 0.76, 0] });
  b.part(new THREE.BoxGeometry(0.42, 0.04, 0.32), CARD2, { bone: spine, at: [0, 1.0, 0] }); // top flaps
  b.part(new THREE.BoxGeometry(0.42, 0.04, 0.32), CARD2, { bone: spine, at: [0, 0.51, 0] });
  // tape strips
  b.part(new THREE.BoxGeometry(0.06, 0.52, 0.31), TAPE, { bone: spine, at: [0, 0.76, 0] });
  b.part(new THREE.BoxGeometry(0.41, 0.04, 0.31), TAPE, { bone: spine, at: [0, 0.6, 0] });

  // chest panel with buttons and dial
  b.part(new THREE.BoxGeometry(0.28, 0.2, 0.01), FOIL, { bone: spine, at: [0, 0.82, 0.155] });
  const colors = ["#e03b3b", "#3bc46a", "#3a6fc4", "#f2c230"];
  colors.forEach((c, i) => {
    glow(b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 10), c, {
      bone: spine, at: [-0.09 + i * 0.06, 0.76, 0.165], dir: [0, 0, 1],
    }), 0.8);
  });
  const dial = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#fff" stroke="#222" stroke-width="4"/><path d="M32 32 L48 16" stroke="#c22" stroke-width="4"/><g stroke="#222" stroke-width="2"><path d="M32 6v6M6 32h6M58 32h-6M14 14l4 4M50 14l-4 4"/></g></svg>`, { size: 128 });
  b.part(new THREE.CircleGeometry(0.05, 16), "#ffffff", { bone: spine, at: [0, 0.87, 0.162], dir: [0, 0, 1], axis: "z", texture: dial });
  // drawn arrows / label
  const label = svg(`<svg viewBox="0 0 120 40"><rect width="120" height="40" fill="#f4ecd8" stroke="#222" stroke-width="3"/><text x="60" y="28" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#222">ROBO-7</text></svg>`, { size: 256 });
  b.part(new THREE.PlaneGeometry(0.18, 0.06), "#ffffff", { bone: spine, at: [0, 0.68, 0.157], dir: [0, 0, 1], axis: "z", texture: label });
  // side bolts (bottle caps)
  for (const s of [1, -1]) for (let i = 0; i < 3; i++)
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 8), i % 2 ? "#b9b9c4" : "#d9a030", {
      bone: spine, at: [s * 0.202, 0.6 + i * 0.16, 0.05 * (R() - 0.5)], dir: [s, 0, 0],
    });
  // neck
  b.sweep(catmull([[0, 0.98, 0], [0, 1.06, 0.01]]), 0.035, { bone: neck, color: SKIN });

  // head: kid head inside cardboard box helmet
  b.part(new THREE.SphereGeometry(0.1, 10, 8), SKIN, { bone: head, at: [0, 1.15, 0], scale: [1, 1.05, 1] });
  b.part(new THREE.SphereGeometry(0.105, 10, 8), HAIR, { bone: head, at: [0, 1.18, -0.02], scale: [1, 0.9, 1] });
  // eyes under visor
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.016, 6, 4), "#ffffff", { bone: head, at: [s * 0.04, 1.15, 0.09] });
    b.part(new THREE.SphereGeometry(0.009, 6, 4), DARK, { bone: head, at: [s * 0.04, 1.15, 0.103] });
    b.part(new THREE.BoxGeometry(0.035, 0.008, 0.01), HAIR, { bone: head, at: [s * 0.04, 1.185, 0.095] });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), "#f4a0a0", { bone: head, at: [s * 0.065, 1.11, 0.085] });
  }
  b.part(new THREE.SphereGeometry(0.012, 6, 4), "#e8a888", { bone: head, at: [0, 1.12, 0.1] });
  b.part(new THREE.BoxGeometry(0.04, 0.012, 0.02), "#b8504a", { bone: jaw, at: [0, 1.08, 0.095] });
  // box helmet with cut-out window: frame pieces around the face
  const hw = 0.19, hh = 0.26, hd = 0.2;
  b.part(new THREE.BoxGeometry(hw * 2, 0.06, hd * 2), CARD, { bone: head, at: [0, 1.3, 0] }); // top
  b.part(new THREE.BoxGeometry(hw * 2, 0.04, 0.04), CARD2, { bone: head, at: [0, 1.255, 0.16] }); // brow
  b.part(new THREE.BoxGeometry(hw * 2, 0.06, 0.04), CARD2, { bone: head, at: [0, 1.04, 0.16] }); // chin
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.06, hh, 0.04), CARD2, { bone: head, at: [s * 0.16, 1.15, 0.16] });
    b.part(new THREE.BoxGeometry(0.03, hh, hd * 2), CARD, { bone: head, at: [s * 0.175, 1.15, 0] });
  }
  b.part(new THREE.BoxGeometry(hw * 2, hh, 0.03), CARD, { bone: head, at: [0, 1.15, -0.19] });
  // visor tape
  b.part(new THREE.BoxGeometry(hw * 2 + 0.01, 0.025, 0.045), TAPE, { bone: head, at: [0, 1.27, 0.162] });
  // antennae: spring-ish rod with ball
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 1.33, 0], [s * 0.1, 1.46, 0], 0.006, "#888c96", { bone: head });
    glow(b.part(new THREE.SphereGeometry(0.025, 8, 6), s > 0 ? "#e03b3b" : "#3bc46a", { bone: head, at: [s * 0.1, 1.48, 0] }), 1.2);
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8), FOIL, { bone: head, at: [s * 0.1, 1.335, 0] });
    // ear-side foil cans
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 8), FOIL, { bone: head, at: [s * 0.21, 1.15, 0], dir: [s, 0, 0] });
  }
  // backpack box
  b.part(new THREE.BoxGeometry(0.28, 0.32, 0.12), CARD2, { bone: spine, at: [0, 0.78, -0.21] });
  b.part(new THREE.BoxGeometry(0.29, 0.04, 0.125), TAPE, { bone: spine, at: [0, 0.85, -0.21] });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 8), FOIL, { bone: spine, at: [0.08, 0.7, -0.29], rotation: [90, 0, 0] });

  return b.root;
}
