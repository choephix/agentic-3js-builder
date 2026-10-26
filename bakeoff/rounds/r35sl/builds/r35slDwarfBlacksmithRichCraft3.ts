import * as THREE from "three";
import { createBuilder, catmull, mottle, grain, countershade, stripes, svg, rng, aim } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = { name: "Dwarf Blacksmith", description: "Warcraft-style stout dwarf smith hammering at an anvil with a glowing ingot." };

export default function build() {
  const b = createBuilder({ name: "dwarf" });
  const SKIN = "#d99a78", BEARD = "#c8622a", BEARD2 = "#8a3a18", LEATHER = "#5a3a22", CLOTH = "#3b5a8c", STEEL = metal("steel"), IRON = metal("iron"), GOLD = metal("gilt");
  const WOOD = grain("#7a5230", "#4e3220", { size: 0.02 });
  const SK = countershade("#e0a584", "#b87a5e");

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.62, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.62, 0], [0, 0.85, 0.02], [0, 1.08, 0.05]]), { parent: hips, role: "spine", names: ["spine1", "spine2", "chest"] });
  const chest = spine.joints[2] ?? spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.15, 0.06], dir: [0, 1, 0.2], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.2, 0.08], dir: [0, 1, 0.3], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.27, 0.12], dir: [0, -0.2, 1], role: "jaw" });

  // legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(`leg${side}`, [[s * 0.11, 0.62, 0], [s * 0.12, 0.34, 0.02], [s * 0.12, 0.1, 0.0]], { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" });
    b.sweep(leg, [0.095, 0.075], { color: CLOTH });
    b.part(new THREE.BoxGeometry(0.15, 0.1, 0.28), LEATHER, { bone: leg.tip ?? leg.joints[1], at: [s * 0.12, 0.05, 0.07] });
    b.part(new THREE.BoxGeometry(0.17, 0.05, 0.1), IRON, { bone: leg.tip ?? leg.joints[1], at: [s * 0.12, 0.09, 0.18] });
    b.part(new THREE.BoxGeometry(0.17, 0.14, 0.16), LEATHER, { bone: leg.joints[1], at: [s * 0.12, 0.2, 0.03] });
  }

  // torso
  b.sweep(catmull([[0, 0.6, 0], [0, 0.85, 0.02], [0, 1.1, 0.05]]), (t) => [0.2 + 0.1 * Math.sin(t * 3), 0.15 + 0.06 * Math.sin(t * 3)], { bone: [hips, ...spine.joints], color: CLOTH });
  b.part(new THREE.BoxGeometry(0.4, 0.5, 0.05), LEATHER, { bone: chest, at: [0, 0.82, 0.19] }); // apron
  b.part(new THREE.BoxGeometry(0.46, 0.07, 0.34), LEATHER, { bone: hips, at: [0, 0.66, 0.02] });
  b.part(new THREE.BoxGeometry(0.1, 0.08, 0.02), GOLD, { bone: hips, at: [0, 0.66, 0.2] });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), IRON, { bone: chest, at: [0.12, 0.95, 0.225] });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), IRON, { bone: chest, at: [-0.12, 0.95, 0.225] });

  // head
  b.part(new THREE.SphereGeometry(0.15, 10, 8), SK, { bone: head, at: [0, 1.32, 0.1], scale: [1.05, 1, 1] });
  b.part(new THREE.SphereGeometry(0.055, 8, 6), "#e3957a", { bone: head, at: [0, 1.31, 0.25] }); // nose
  b.part(new THREE.BoxGeometry(0.3, 0.05, 0.1), BEARD2, { bone: head, at: [0, 1.4, 0.2] }); // brow
  const eye = svg(`<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#fff"/><circle cx="10" cy="10" r="5" fill="#2a6ab0"/><circle cx="10" cy="10" r="2.5" fill="#111"/><circle cx="12" cy="8" r="1.5" fill="#fff"/></svg>`, { size: 64 });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", { bone: head, at: [s * 0.06, 1.355, 0.243], dir: [0, 0, 1], axis: "z", texture: eye });
    b.part(new THREE.BoxGeometry(0.04, 0.07, 0.04), SK, { bone: head, at: [s * 0.155, 1.32, 0.08] });
    b.spike([s * 0.15, 1.33, 0.07], [s * 1, 0.2, 0], 0.07, 0.025, { bone: head, color: SK });
  }
  b.part(new THREE.BoxGeometry(0.16, 0.04, 0.1), SK, { bone: jaw, at: [0, 1.2, 0.17] }); // lower jaw
  // beard
  const beard = svg(`<svg viewBox="0 0 40 80"><path d="M4 0H36L38 40L30 70L20 80L10 70L2 40Z" fill="#c8622a" stroke="#6b2c10" stroke-width="2"/><path d="M12 10L14 60M20 6V72M28 10L26 60" stroke="#8a3a18" stroke-width="2"/></svg>`, { size: 128 });
  b.part(new THREE.BoxGeometry(0.28, 0.2, 0.16), BEARD, { bone: jaw, at: [0, 1.19, 0.12] });
  b.part(new THREE.BoxGeometry(0.22, 0.3, 0.1), BEARD, { bone: jaw, at: [0, 1.0, 0.19] });
  b.part(new THREE.ConeGeometry(0.12, 0.22, 5), BEARD2, { bone: jaw, at: [0, 0.8, 0.2], rotation: [180, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.2, 0.38), "#ffffff", { bone: jaw, at: [0, 0.97, 0.246], dir: [0, 0, 1], axis: "z", texture: beard });
  b.part(new THREE.BoxGeometry(0.24, 0.05, 0.06), BEARD, { bone: head, at: [0, 1.27, 0.24] }); // moustache
  b.part(new THREE.BoxGeometry(0.03, 0.08, 0.03), GOLD, { bone: jaw, at: [0, 0.88, 0.27] });
  // helmet
  b.lathe([[0, 0], [0.17, 0], [0.16, 0.08], [0.1, 0.15], [0, 0.17]], { at: [0, 1.42, 0.09], bone: head, color: IRON, segments: 8 });
  b.part(new THREE.TorusGeometry(0.165, 0.015, 4, 10), GOLD, { bone: head, at: [0, 1.43, 0.09], rotation: [90, 0, 0] });
  for (const s of [1, -1]) b.spike([s * 0.15, 1.5, 0.09], [s * 1, 0.8, 0], 0.18, 0.04, { bone: head, color: "#e8dcc0" });

  // arms
  const ANV = [0, 0.5, 0.5];
  const hammerHead = [0.0, 1.0, 0.5];
  const arms: Record<string, any> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hand = s > 0 ? [0.1, 0.98, 0.45] : [-0.08, 0.86, 0.42];
    const arm = b.chain(`arm${side}`, catmull([[s * 0.3, 1.05, 0.04], [s * 0.4, 0.92, 0.2], hand]), { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" });
    b.sweep(arm, [0.09, 0.07], { color: SK });
    b.part(new THREE.SphereGeometry(0.11, 8, 6), IRON, { bone: arm.joints[0], at: [s * 0.32, 1.1, 0.04], scale: [1.2, 0.8, 1.1] });
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.1), SK, { bone: arm.tip ?? arm.joints[1], at: hand });
    b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.1, 8), LEATHER, { bone: arm.joints[1], at: [s * 0.4, 0.93, 0.19], rotation: [60, 0, 0] });
    arms[side] = arm;
  }
  // hammer
  b.rod([0.1, 0.98, 0.45], [0.1, 1.25, 0.5], 0.022, { bone: arms.L.tip ?? arms.L.joints[1], color: WOOD });
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.22), STEEL, { bone: arms.L.tip ?? arms.L.joints[1], at: [0.1, 1.28, 0.5] });
  b.part(new THREE.BoxGeometry(0.11, 0.03, 0.04), GOLD, { bone: arms.L.tip ?? arms.L.joints[1], at: [0.1, 1.28, 0.4] });
  // tongs
  b.rod([-0.08, 0.86, 0.42], [-0.08, 0.75, 0.62], 0.012, { bone: arms.R.tip ?? arms.R.joints[1], color: IRON });

  // anvil stump and anvil
  b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.4, 8), WOOD, { bone: hips, at: [0, 0.2, 0.62] });
  b.part(new THREE.BoxGeometry(0.2, 0.1, 0.3), IRON, { bone: hips, at: [0, 0.45, 0.62] });
  b.part(new THREE.BoxGeometry(0.16, 0.12, 0.5), IRON, { bone: hips, at: [0, 0.54, 0.62] });
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.6), metal("steel"), { bone: hips, at: [0, 0.62, 0.62] });
  b.spike([0, 0.62, 0.9], [0, 0, 1], 0.22, 0.06, { bone: hips, color: IRON });
  glow(b.part(new THREE.BoxGeometry(0.05, 0.03, 0.2), "#ff7a1a", { bone: hips, at: [-0.08, 0.66, 0.66] }), 2);
  for (let i = 0; i < 5; i++) { const r = rng(i + 3); glow(b.part(new THREE.SphereGeometry(0.01, 4, 3), "#ffb347", { bone: hips, at: [(r() - 0.5) * 0.4, 0.7 + r() * 0.15, 0.62 + (r() - 0.5) * 0.4] }), 2); }

  return b.root;
}
