import * as THREE from "three";
import { createBuilder, frame, rng, mottle, grain, paint, svg, noise, smoothstep } from "../../../../src/index";

export const meta = {
  name: "Cardboard Robot Kid",
  description: "A kid in a cardboard-box robot costume with foil, bottle-cap buttons and tape details.",
};

export default function build() {
  const b = createBuilder({ name: "cardboardRobotKid" });
  const R = rng(5);

  const CARD = mottle("#b98a55", "#a57842", { size: 0.06, seed: 2 });
  const CARD2 = grain("#c49660", "#a97d49", { size: 0.012, axis: "x" });
  const SKIN = "#f1c19b";
  const SKIN2 = "#e0a982";
  const HAIR = "#4a2e1c";
  const TAPE = "#d8c9a0";
  const FOIL = "#cfd5dc";
  const RED = "#d8403a";
  const BLUE = "#3a6fc8";
  const YEL = "#f2c230";
  const SHOE = "#f4f1ea";
  const PANTS = "#3f5d8a";
  const DARK = "#2a2420";

  const hips = b.joint("hips", { at: [0, 0.5, 0], role: "spine" });
  const spine = b.joint("spine", { parent: hips, at: [0, 0.55, 0], dir: [0, 1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: spine, at: [0, 0.98, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.03, 0], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.1, 0.04], dir: [0, 0, 1], role: "jaw" });

  // legs
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const hip = b.joint("hip" + n, { parent: hips, at: [s * 0.09, 0.5, 0], dir: [0, -1, 0], role: "leg" });
    const knee = b.joint("knee" + n, { parent: hip, at: [s * 0.09, 0.28, 0.005], dir: [0, -1, 0], role: "leg" });
    const ankle = b.joint("ankle" + n, { parent: knee, at: [s * 0.09, 0.07, 0], dir: [0, 0, 1], role: "leg" });
    b.capsule([s * 0.09, 0.5, 0], [s * 0.09, 0.28, 0.005], 0.04, PANTS, { bone: hip });
    b.capsule([s * 0.09, 0.28, 0.005], [s * 0.09, 0.09, 0], 0.036, PANTS, { bone: knee });
    b.part(new THREE.BoxGeometry(0.09, 0.07, 0.17), SHOE, { bone: ankle, at: [s * 0.09, 0.04, 0.03] });
    b.part(new THREE.BoxGeometry(0.092, 0.02, 0.172), DARK, { bone: ankle, at: [s * 0.09, 0.01, 0.03] });
    b.part(new THREE.BoxGeometry(0.06, 0.03, 0.05), RED, { bone: ankle, at: [s * 0.09, 0.075, 0.06] });
  }

  // torso box
  const boxes = b.part(new THREE.BoxGeometry(0.42, 0.5, 0.3), CARD, { bone: spine, at: [0, 0.78, 0] });
  b.part(new THREE.BoxGeometry(0.43, 0.04, 0.31), CARD2, { bone: spine, at: [0, 0.545, 0] });
  b.part(new THREE.BoxGeometry(0.43, 0.04, 0.31), CARD2, { bone: spine, at: [0, 1.015, 0] });
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.1, 10), SKIN2, { bone: spine, at: [0, 0.5, 0] });
  // tape strips
  b.part(new THREE.BoxGeometry(0.12, 0.5, 0.004), TAPE, { bone: spine, at: [0.12, 0.78, 0.153] });
  b.part(new THREE.BoxGeometry(0.44, 0.07, 0.004), TAPE, { bone: spine, at: [0, 0.6, 0.152] });
  b.part(new THREE.BoxGeometry(0.004, 0.5, 0.1), TAPE, { bone: spine, at: [0.213, 0.78, -0.05] });
  // control panel
  b.part(new THREE.BoxGeometry(0.26, 0.2, 0.012), "#6b6f78", { bone: spine, at: [-0.02, 0.84, 0.156] });
  b.part(new THREE.BoxGeometry(0.22, 0.04, 0.008), "#9ad6e8", { bone: spine, at: [-0.02, 0.9, 0.163] });
  const dials = [RED, YEL, BLUE, "#58b85a"];
  dials.forEach((c, i) => {
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.016, 10), c, {
      bone: spine, at: [-0.1 + i * 0.058, 0.82, 0.165], dir: [0, 0, 1],
    });
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.02, 6), DARK, {
      bone: spine, at: [-0.1 + i * 0.058, 0.79, 0.165], dir: [0, 0, 1],
    });
  });
  // bottle cap buttons
  for (let i = 0; i < 3; i++)
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 12), [FOIL, RED, YEL][i], {
      bone: spine, at: [-0.12 + i * 0.07, 0.7, 0.158], dir: [0, 0, 1],
    });
  // flaps
  b.part(new THREE.BoxGeometry(0.2, 0.01, 0.08), CARD2, { bone: spine, at: [0.1, 1.04, 0.1], rotation: [-25, 0, 0] });
  b.part(new THREE.BoxGeometry(0.2, 0.01, 0.08), CARD2, { bone: spine, at: [-0.1, 1.04, -0.1], rotation: [25, 0, 0] });

  // arms
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const sh = b.joint("shoulder" + n, { parent: spine, at: [s * 0.27, 0.95, 0], dir: [s, -0.2, 0], role: "arm" });
    const el = b.joint("elbow" + n, { parent: sh, at: [s * 0.4, 0.88, 0.01], dir: [s, -0.3, 0.3], role: "arm" });
    const wr = b.joint("wrist" + n, { parent: el, at: [s * 0.52, 0.8, 0.1], dir: [s, -0.2, 0.3], role: "arm" });
    b.capsule([s * 0.24, 0.95, 0], [s * 0.4, 0.88, 0.01], 0.032, "#e24a43", { bone: sh });
    // tube sleeve (cardboard tube)
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 10), CARD2, {
      bone: sh, at: [s * 0.32, 0.915, 0.005], aim: [s * 0.4, 0.88, 0.01], axis: "y",
    });
    b.capsule([s * 0.4, 0.88, 0.01], [s * 0.52, 0.8, 0.1], 0.028, SKIN, { bone: el });
    // foil claw hand
    b.part(new THREE.BoxGeometry(0.09, 0.09, 0.05), FOIL, { bone: wr, at: [s * 0.54, 0.78, 0.12] });
    for (const k of [-1, 1])
      b.part(new THREE.BoxGeometry(0.025, 0.07, 0.025), FOIL, { bone: wr, at: [s * 0.54 + k * 0.025, 0.72, 0.13] });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 8), RED, {
      bone: sh, at: [s * 0.215, 0.95, 0], dir: [1, 0, 0],
    });
  }

  // head
  b.part(new THREE.SphereGeometry(0.095, 10, 8), SKIN, { bone: head, at: [0, 1.12, 0.01], scale: [1, 1.05, 1] });
  b.part(new THREE.SphereGeometry(0.1, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), HAIR, { bone: head, at: [0, 1.135, -0.005] });
  for (let i = 0; i < 6; i++)
    b.part(new THREE.ConeGeometry(0.025, 0.07, 5), HAIR, {
      bone: head, at: [(i - 2.5) * 0.03, 1.22, 0.01 + R() * 0.02], rotation: [R() * 20, 0, (i - 2.5) * 14],
    });
  // jaw / mouth
  b.part(new THREE.BoxGeometry(0.06, 0.02, 0.04), "#c4605a", { bone: jaw, at: [0, 1.075, 0.085] });
  // eyes
  const EYE = svg(
    `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#fff" stroke="#222" stroke-width="3"/><circle cx="22" cy="21" r="10" fill="#4a2e1c"/><circle cx="22" cy="21" r="5" fill="#111"/><circle cx="26" cy="16" r="3.5" fill="#fff"/></svg>`,
    { size: 96 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.045, 0.045), "#ffffff", {
      bone: head, at: [s * 0.04, 1.13, 0.1], dir: [0, 0, 1], axis: "z", texture: EYE,
    });
    b.part(new THREE.BoxGeometry(0.05, 0.01, 0.01), HAIR, { bone: head, at: [s * 0.04, 1.165, 0.1], rotation: [0, 0, -s * 8] });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), "#f29a8a", { bone: head, at: [s * 0.07, 1.09, 0.088] });
    b.part(new THREE.BoxGeometry(0.04, 0.08, 0.02), SKIN2, { bone: head, at: [s * 0.098, 1.12, 0.0] });
  }
  b.part(new THREE.SphereGeometry(0.012, 5, 4), SKIN2, { bone: head, at: [0, 1.1, 0.105] });

  // foil helmet accessories: antenna and colander-like cap ears
  b.rod([0, 1.22, 0], [0.03, 1.36, 0], 0.005, DARK, { bone: head });
  b.part(new THREE.SphereGeometry(0.025, 6, 4), RED, { bone: head, at: [0.03, 1.37, 0] });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 10), FOIL, { bone: head, at: [s * 0.115, 1.12, 0], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 8), RED, { bone: head, at: [s * 0.135, 1.12, 0], dir: [1, 0, 0] });
  }
  // headband of foil
  b.part(new THREE.CylinderGeometry(0.103, 0.103, 0.03, 12, 1, true), FOIL, { bone: head, at: [0, 1.17, 0] });

  // back crank
  b.rod([0, 0.85, -0.15], [0, 0.85, -0.25], 0.012, DARK, { bone: spine });
  b.rod([0, 0.85, -0.25], [0, 0.95, -0.25], 0.012, DARK, { bone: spine });
  b.part(new THREE.SphereGeometry(0.025, 6, 4), YEL, { bone: spine, at: [0, 0.95, -0.25] });

  return b.root;
}
