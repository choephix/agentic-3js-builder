```ts
import * as THREE from "three";
import { createBuilder, frame, rng, mottle, grain, paint, svg, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Cardboard Robot Kid",
  description: "A kid in a homemade cardboard-box robot costume with foil details, dials and duct tape.",
};

export default function build() {
  const b = createBuilder({ name: "cardboardKid" });
  const SKIN = "#f0b98f", HAIR = "#4a2c1a", JEANS = "#3b5a8c", SHOE = "#e8e8e8", SOLE = "#d33";
  const CARD = mottle("#b98a55", "#a07445", { size: 0.06, seed: 3 });
  const CARD2 = grain("#c19661", "#a8794a", { size: 0.012, axis: "x", seed: 2 });
  const FOIL = paint((p, n) => {
    const v = noise(p, 0.03, 4);
    const c = 0.7 + 0.25 * v + 0.05 * n.y;
    return [c, c, c * 1.04];
  });
  const TAPE = "#d9402f", TAPE2 = "#f2c230", BLACK = "#222";

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.5, 0], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.7, 0], dir: [0, 1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 1.0, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.04, 0], dir: [0, 1, 0.01], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.08, 0.05], dir: [0, 0, 1], role: "jaw" });

  // legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = [[s * 0.07, 0.5, 0], [s * 0.07, 0.27, 0.01], [s * 0.07, 0.05, 0]];
    const leg = b.chain("leg" + side, pts, { parent: hips, names: ["hip" + side, "knee" + side, "ankle" + side], role: "leg" });
    b.sweep(leg, [0.05, 0.04], { color: JEANS, sides: 8 });
    b.part(new THREE.BoxGeometry(0.1, 0.06, 0.2), SHOE, { bone: leg.tip!, at: [s * 0.07, 0.03, 0.04] });
    b.part(new THREE.BoxGeometry(0.105, 0.015, 0.205), SOLE, { bone: leg.tip!, at: [s * 0.07, 0.008, 0.04] });
    b.part(new THREE.BoxGeometry(0.06, 0.02, 0.05), "#fff", { bone: leg.tip!, at: [s * 0.07, 0.065, 0.1] });
  }

  // torso box (costume)
  b.part(new THREE.BoxGeometry(0.4, 0.46, 0.3), CARD, { bone: chest, at: [0, 0.82, 0] });
  b.part(new THREE.BoxGeometry(0.41, 0.03, 0.31), CARD2, { bone: chest, at: [0, 1.06, 0] });
  b.part(new THREE.BoxGeometry(0.41, 0.03, 0.31), CARD2, { bone: chest, at: [0, 0.6, 0] });
  // flaps on top
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.19, 0.01, 0.3), CARD2, { bone: chest, at: [s * 0.1, 1.09, 0], rotation: [0, 0, -s * 14] });
  // tape strips
  b.part(new THREE.BoxGeometry(0.42, 0.035, 0.32), TAPE, { bone: chest, at: [0, 0.97, 0] });
  b.part(new THREE.BoxGeometry(0.42, 0.035, 0.32), TAPE, { bone: chest, at: [0, 0.68, 0] });
  b.part(new THREE.BoxGeometry(0.1, 0.12, 0.005), TAPE2, { bone: chest, at: [0.12, 0.8, 0.152], rotation: [0, 0, 20] });
  // chest panel with dials and buttons
  b.part(new THREE.BoxGeometry(0.28, 0.2, 0.012), FOIL, { bone: chest, at: [0, 0.83, 0.156] });
  const dial = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#fff" stroke="#222" stroke-width="4"/><path d="M32 32 L48 16" stroke="#d33" stroke-width="5" stroke-linecap="round"/><path d="M12 32h6M46 32h6M32 12v6" stroke="#222" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    b.part(new THREE.CircleGeometry(0.045, 16), "#fff", { bone: chest, at: [s * 0.075, 0.87, 0.164], dir: [0, 0, 1], axis: "z", texture: dial });
  const cols = ["#e33", "#3a3", "#37d", "#fc2"];
  cols.forEach((c, i) =>
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 8), c, { bone: chest, at: [-0.09 + i * 0.06, 0.765, 0.166], dir: [0, 0, 1] }),
  );
  glow(b.part(new THREE.BoxGeometry(0.03, 0.012, 0.006), "#5fffa0", { bone: chest, at: [0.0, 0.915, 0.164] }), 1.5);
  // side vents and back
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++)
      b.part(new THREE.BoxGeometry(0.006, 0.015, 0.14), BLACK, { bone: chest, at: [s * 0.2, 0.74 + i * 0.04, 0], });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.1, 8), FOIL, { bone: chest, at: [0.1, 1.0, -0.19], rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.1, 8), FOIL, { bone: chest, at: [-0.1, 1.0, -0.19], rotation: [90, 0, 0] });

  // child neck
  b.sweep([[0, 1.0, 0], [0, 1.08, 0]], 0.04, { color: SKIN, bone: neck, sides: 8 });

  // arms: foil-wrapped tubes
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = [[s * 0.22, 1.0, 0], [s * 0.4, 0.86, 0.02], [s * 0.52, 0.68, 0.1], [s * 0.54, 0.6, 0.2]];
    const arm = b.chain("arm" + side, pts, { parent: chest, names: ["shoulder" + side, "elbow" + side, "wrist" + side, "hand" + side].slice(0, 4), role: "arm" });
    b.sweep(arm, [0.05, 0.04], { color: SKIN, sides: 8 });
    const tubeA = b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.2, 8), FOIL, { bone: arm.joints[0], at: [s * 0.31, 0.93, 0.01], aim: [s * 0.4, 0.86, 0.02] });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.2, 8), FOIL, { bone: arm.joints[1], at: [s * 0.46, 0.77, 0.06], aim: [s * 0.52, 0.68, 0.1] });
    b.part(new THREE.CylinderGeometry(0.078, 0.078, 0.03, 8), TAPE, { bone: arm.joints[1], at: [s * 0.46, 0.77, 0.06], aim: [s * 0.52, 0.68, 0.1] });
    // foil claw mitt over hand
    const h = arm.tip ?? arm.joints[2];
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.11), FOIL, { bone: h, at: [s * 0.54, 0.6, 0.2] });
    for (const f of [-1, 0, 1])
      b.part(new THREE.BoxGeometry(0.025, 0.04, 0.08), FOIL, { bone: h, at: [s * 0.54 + f * 0.035, 0.57, 0.27] });
    void tubeA;
  }

  // head: kid head inside box helmet
  b.part(new THREE.SphereGeometry(0.1, 10, 8), SKIN, { bone: head, at: [0, 1.2, 0], scale: [1, 1.1, 1] });
  // hair tufts peeking at top
  for (let i = 0; i < 5; i++) {
    const a = (i - 2) * 0.35;
    b.part(new THREE.ConeGeometry(0.03, 0.08, 5), HAIR, { bone: head, at: [Math.sin(a) * 0.09, 1.3, Math.cos(a) * 0.05 - 0.01], rotation: [0, 0, -a * 40] });
  }
  b.part(new THREE.SphereGeometry(0.095, 8, 6), HAIR, { bone: head, at: [0, 1.22, -0.03], scale: [1, 1, 0.85] });
  // face
  const eyeTex = svg(
    `<svg viewBox="0 0 40 48"><ellipse cx="20" cy="24" rx="15" ry="19" fill="#fff" stroke="#222" stroke-width="3"/><circle cx="20" cy="26" r="9" fill="#4a7a3a"/><circle cx="20" cy="26" r="4.5" fill="#111"/><circle cx="16" cy="21" r="3" fill="#fff"/></svg>`,
    { size: 96 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.045, 0.054), "#fff", { bone: head, at: [s * 0.04, 1.2, 0.098], dir: [0, 0, 1], axis: "z", texture: eyeTex });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), "#e6a07c", { bone: head, at: [0, 1.17, 0.105] });
  const mouth = svg(`<svg viewBox="0 0 40 20"><path d="M3 4 Q20 24 37 4" fill="#a33" stroke="#622" stroke-width="3"/></svg>`, { size: 96 });
  b.part(new THREE.PlaneGeometry(0.05, 0.025), "#fff", { bone: jaw, at: [0, 1.135, 0.097], dir: [0, 0, 1], axis: "z", texture: mouth });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.02, 6, 4), SKIN, { bone: head, at: [s * 0.1, 1.2, 0], scale: [0.5, 1, 1] });
  // cheeks
  for (const s of [1, -1]) b.part(new THREE.CircleGeometry(0.018, 8), "#f08a7a", { bone: head, at: [s * 0.065, 1.15, 0.095], dir: [0, 0, 1], axis: "z" });

  // helmet box (open front window)
  const HB = { w: 0.34, h: 0.34, d: 0.34 }, cy = 1.2;
  b.part(new THREE.BoxGeometry(HB.w, 0.03, HB.d), CARD2, { bone: head, at: [0, cy + 0.185, 0] });
  b.part(new THREE.BoxGeometry(0.03, HB.h, HB.d), CARD, { bone: head, at: [0.185, cy, 0] });
  b.part(new THREE.BoxGeometry(0.03, HB.h, HB.d), CARD, { bone: head, at: [-0.185, cy, 0] });
  b.part(new THREE.BoxGeometry(HB.w + 0.06, HB.h, 0.03), CARD, { bone: head, at: [0, cy, -0.185] });
  b.part(new THREE.BoxGeometry(HB.w, 0.085, 0.03), CARD, { bone: head, at: [0, cy + 0.125, 0.185] });
  b.part(new THREE.BoxGeometry(HB.w, 0.06, 0.03), CARD, { bone: head, at: [0, cy - 0.14, 0.185] });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.1, 0.2, 0.03), CARD, { bone: head, at: [s * 0.12, cy - 0.01, 0.185] });
  b.part(new THREE.BoxGeometry(0.35, 0.025, 0.36), TAPE, { bone: head, at: [0, cy + 0.2, 0] });
  // antenna
  b.rod([0, 1.4, 0], [0.04, 1.55, 0], 0.01, FOIL, { bone: head });
  glow(b.part(new THREE.SphereGeometry(0.035, 8, 6), "#ff4040", { bone: head, at: [0.04, 1.57, 0] }), 1.6);
  // ear bolts / cups
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.05, 10), FOIL, { bone: head, at: [s * 0.21, cy, 0], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8), BLACK, { bone: head, at: [s * 0.22, cy, 0], dir: [1, 0, 0] });
  }
  // handwritten label
  const label = svg(
    `<svg viewBox="0 0 100 30"><rect width="100" height="30" fill="#f7f1df" stroke="#222" stroke-width="2"/><text x="50" y="21" font-size="16" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="#c22">ROBO-KID</text></svg>`,
    { size: 192 },
  );
  b.part(new THREE.PlaneGeometry(0.14, 0.042), "#fff", { bone: chest, at: [0, 0.65, 0.157], dir: [0, 0, 1], axis: "z", texture: label });

  // belt and shorts
  b.part(new THREE.BoxGeometry(0.26, 0.1, 0.18), JEANS, { bone: hips, at: [0, 0.52, 0] });
  void frame; void rng;
  return b.root;
}
```