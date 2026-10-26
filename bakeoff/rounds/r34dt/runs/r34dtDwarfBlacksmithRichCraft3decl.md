```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, countershade, mottle, grain, svg, paint, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Dwarf Blacksmith",
  description: "Stout Warcraft-style dwarf smith with braided beard, leather apron and hammer at a glowing anvil.",
};

export default function build() {
  const b = createBuilder({ name: "dwarf" });
  const R = rng(5);

  const SKIN = "#d99a78", SKIN_D = "#b87456";
  const BEARD = "#c8562a", BEARD_L = "#e88a42";
  const LEATHER = "#6b4226", LEATHER_D = "#4a2c16", CLOTH = "#3a5a8c", CLOTH_D = "#2b4268";
  const GOLD = "#e0b040", DARK = "#1c1410";
  const IRON = metal("iron"), STEEL = metal("steel"), BRASS = metal("gilt");
  const WOOD = grain("#8a5a30", "#5e3a1c", { size: 0.01, axis: "y" });
  const STONE = mottle("#6a6a70", "#4a4a52", { size: 0.08 });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.5, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.5, 0], [0, 0.68, 0.02], [0, 0.88, 0.05]]), { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" });
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.98, 0.06], dir: [0, 1, 0.2], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.02, 0.07], dir: [0, 1, 0.2], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.1, 0.12], dir: [0, -0.1, 1], role: "jaw" });

  // Legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(`leg${side}`, [[s * 0.12, 0.5, 0], [s * 0.13, 0.28, 0.02], [s * 0.14, 0.09, 0.0]],
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" });
    b.sweep(leg, [0.095, 0.075], { color: CLOTH_D, sides: 8 });
    b.part(new THREE.BoxGeometry(0.17, 0.1, 0.3), LEATHER_D, { bone: leg.tip!, at: [s * 0.14, 0.05, 0.07] });
    b.part(new THREE.BoxGeometry(0.19, 0.04, 0.32), DARK, { bone: leg.tip!, at: [s * 0.14, 0.02, 0.07] });
    b.part(new THREE.BoxGeometry(0.19, 0.07, 0.05), GOLD, { bone: leg.joints[1], at: [s * 0.13, 0.28, 0.1] });
  }

  // Torso
  b.sweep(spine, (t) => [0.2 - 0.02 * t, 0.15], { color: CLOTH, sides: 8, shift: [0, 0] });
  b.part(new THREE.BoxGeometry(0.46, 0.09, 0.34), LEATHER_D, { bone: hips, at: [0, 0.52, 0.02] });
  b.part(new THREE.BoxGeometry(0.1, 0.09, 0.02), GOLD, { bone: hips, at: [0, 0.52, 0.2] });
  // Apron
  const apron = svg(`<svg viewBox="0 0 64 100"><path d="M10 0H54L60 70L50 100H14L4 70Z" fill="#6b4226" stroke="#2a160a" stroke-width="3"/><path d="M12 8H52" stroke="#4a2c16" stroke-width="3"/><circle cx="20" cy="30" r="2.5" fill="#e0b040"/><circle cx="44" cy="30" r="2.5" fill="#e0b040"/><rect x="24" y="44" width="16" height="18" fill="#4a2c16" stroke="#2a160a" stroke-width="2"/><path d="M18 80L46 78" stroke="#4a2c16" stroke-width="2"/></svg>`, { size: 256 });
  b.part(new THREE.PlaneGeometry(0.4, 0.62), "#ffffff", { bone: chest, at: [0, 0.68, 0.17], dir: [0, 0, 1], axis: "z", texture: apron });
  // Shoulder straps and chest
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.05, 0.3, 0.05), LEATHER_D, { bone: chest, at: [s * 0.1, 0.9, 0.12], rotation: [10, 0, s * -8] });

  // Arms
  const arms: Record<string, any> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = s > 0
      ? [[0.27, 0.93, 0.03], [0.34, 0.78, 0.12], [0.3, 0.84, 0.3]]
      : [[-0.27, 0.93, 0.03], [-0.36, 0.76, 0.08], [-0.38, 0.62, 0.22]];
    const arm = b.chain(`arm${side}`, pts, { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" });
    arms[side] = arm;
    b.sweep(arm, [0.085, 0.065], { color: SKIN, sides: 8 });
    b.part(new THREE.SphereGeometry(0.115, 8, 6), LEATHER, { bone: arm.joints[0], at: pts[0] as any, scale: [1, 0.8, 1] });
    b.part(new THREE.SphereGeometry(0.05, 8, 6), GOLD, { bone: arm.joints[0], at: [s * 0.3, 1.02, 0.03] });
    b.part(new THREE.CylinderGeometry(0.075, 0.07, 0.07, 8), LEATHER_D, { bone: arm.joints[1], at: [pts[1][0] + s * 0.0, pts[1][1] - 0.06, pts[1][2] + 0.04] });
    b.part(new THREE.SphereGeometry(0.07, 8, 6), SKIN, { bone: arm.tip!, at: pts[2] as any });
  }
  // Hammer in left hand
  const hp = arms.L.tip!;
  b.rod([0.3, 0.8, 0.3], [0.3, 1.1, 0.3], 0.02, WOOD, { bone: hp });
  b.part(new THREE.BoxGeometry(0.24, 0.11, 0.11), IRON, { bone: hp, at: [0.3, 1.14, 0.3] });
  b.part(new THREE.BoxGeometry(0.03, 0.13, 0.13), STEEL, { bone: hp, at: [0.42, 1.14, 0.3] });
  b.part(new THREE.BoxGeometry(0.03, 0.13, 0.13), STEEL, { bone: hp, at: [0.18, 1.14, 0.3] });
  // Tongs in right hand
  const tp = arms.R.tip!;
  b.rod([-0.38, 0.62, 0.22], [-0.3, 0.7, 0.55], 0.012, IRON, { bone: tp });
  b.rod([-0.38, 0.6, 0.22], [-0.27, 0.66, 0.55], 0.012, IRON, { bone: tp });
  glow(b.part(new THREE.BoxGeometry(0.05, 0.03, 0.12), "#ff7a20", { bone: tp, at: [-0.28, 0.69, 0.6] }), 1.6);

  // Head
  const HS = 1.0;
  b.part(new THREE.SphereGeometry(0.15 * HS, 10, 8), SKIN, { bone: head, at: [0, 1.15, 0.1], scale: [1.05, 1, 1] });
  b.part(new THREE.BoxGeometry(0.1, 0.11, 0.12), SKIN_D, { bone: head, at: [0, 1.12, 0.25] }); // nose
  b.part(new THREE.SphereGeometry(0.065, 8, 6), "#e0a088", { bone: head, at: [0, 1.1, 0.29] });
  const eye = svg(`<svg viewBox="0 0 40 30"><ellipse cx="20" cy="15" rx="17" ry="11" fill="#fff"/><circle cx="20" cy="15" r="8" fill="#3a7ab8"/><circle cx="20" cy="15" r="4" fill="#111"/><circle cx="16" cy="11" r="2.5" fill="#fff"/><path d="M2 14Q20 0 38 14" stroke="#1c1410" stroke-width="3" fill="none"/></svg>`, { size: 128 });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.065, 0.05), "#ffffff", { bone: head, at: [s * 0.07, 1.18, 0.245], dir: [s * 0.1, 0, 1], axis: "z", texture: eye });
    b.part(new THREE.BoxGeometry(0.1, 0.035, 0.05), BEARD, { bone: head, at: [s * 0.07, 1.23, 0.245], rotation: [0, 0, s * -15] });
    b.part(new THREE.SphereGeometry(0.035, 6, 5), SKIN_D, { bone: head, at: [s * 0.155, 1.15, 0.08], scale: [0.6, 1.3, 1] });
  }
  b.part(new THREE.BoxGeometry(0.3, 0.07, 0.04), SKIN_D, { bone: head, at: [0, 1.2, 0.22], scale: [1, 0.4, 1] });
  // Jaw & mouth area
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.15), SKIN_D, { bone: jaw, at: [0, 1.04, 0.16] });

  // Helmet
  b.lathe([[0, 0], [0.17, 0], [0.17, 0.05], [0.14, 0.12], [0.06, 0.18], [0, 0.19]], { at: [0, 1.25, 0.08], bone: head, color: IRON, segments: 10 });
  b.lathe([[0.17, 0], [0.2, 0], [0.2, 0.025], [0.17, 0.03]], { at: [0, 1.25, 0.08], bone: head, color: BRASS, segments: 10 });
  for (const s of [1, -1]) {
    b.spike([s * 0.15, 1.33, 0.08], [s * 1, 0.7, 0], 0.2, 0.04, { bone: head, color: "#e8e0c8" });
    b.part(new THREE.BoxGeometry(0.04, 0.2, 0.04), GOLD, { bone: head, at: [0, 1.4, 0.08] });
  }

  // Beard
  const beard = b.loft([
    { at: [0, 1.12, 0.22], w: 0.28, h: 0.08 }, { at: [0, 1.0, 0.24], w: 0.32, h: 0.1 },
    { at: [0, 0.85, 0.24], w: 0.3, h: 0.1 }, { at: [0, 0.68, 0.23], w: 0.2, h: 0.08 }, { at: [0, 0.55, 0.22], w: 0.08, h: 0.06 },
  ], { bone: head, color: countershade(BEARD_L, BEARD, { level: 0.2 }) });
  b.part(new THREE.BoxGeometry(0.22, 0.05, 0.08), BEARD, { bone: head, at: [0, 1.1, 0.27] }); // moustache
  for (const s of [1, -1]) {
    b.sweep(bezier([s * 0.05, 1.08, 0.28], [s * 0.2, 1.06, 0.3], [s * 0.2, 0.95, 0.3], [s * 0.1, 0.9, 0.3]), 0.025, { color: BEARD_L, bone: head, sides: 6 });
    b.part(new THREE.SphereGeometry(0.03, 6, 5), GOLD, { bone: head, at: [s * 0.1, 0.9, 0.3] });
  }
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8), GOLD, { bone: head, at: [0, 0.55, 0.24] });
  // Braids
  for (const s of [1, -1]) for (let i = 0; i < 5; i++)
    b.part(new THREE.SphereGeometry(0.035 - i * 0.003, 6, 5), i % 2 ? BEARD : BEARD_L, { bone: head, at: [s * 0.08, 0.82 - i * 0.07, 0.3], scale: [1, 1.3, 1] });

  // Anvil + block
  const AX = 0, AZ = 0.55;
  b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.3, 8), WOOD, { bone: hips, at: [AX, 0.15, AZ] });
  b.part(new THREE.BoxGeometry(0.28, 0.07, 0.2), IRON, { bone: hips, at: [AX, 0.34, AZ] });
  b.part(new THREE.BoxGeometry(0.16, 0.1, 0.12), IRON, { bone: hips, at: [AX, 0.42, AZ] });
  b.part(new THREE.BoxGeometry(0.32, 0.07, 0.2), STEEL, { bone: hips, at: [AX, 0.51, AZ] });
  b.part(new THREE.ConeGeometry(0.09, 0.2, 4), STEEL, { bone: hips, at: [AX + 0.26, 0.51, AZ], rotation: [0, 45, -90] });
  glow(b.part(new THREE.BoxGeometry(0.12, 0.025, 0.06), "#ff6a1a", { bone: hips, at: [AX - 0.02, 0.558, AZ] }), 1.8);
  // Sparks
  for (let i = 0; i < 8; i++)
    glow(b.part(new THREE.BoxGeometry(0.012, 0.012, 0.012), i % 2 ? "#ffd060" : "#ff8a30", { bone: hips, at: [AX + (R() - 0.5) * 0.3, 0.62 + R() * 0.25, AZ + (R() - 0.5) * 0.25] }), 2);
  // Bucket
  b.part(new THREE.CylinderGeometry(0.08, 0.06, 0.14, 8), STONE, { bone: hips, at: [-0.5, 0.07, 0.5] });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.01, 8), "#2a6a9a", { bone: hips, at: [-0.5, 0.135, 0.5] });

  return b.root;
}
```