```ts
import * as THREE from "three";
import { createBuilder, rng, grain, mottle, paint, limb, catmull, lerp, svg } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dwarf Blacksmith",
  description: "A stout Warcraft-style dwarf with a braided beard, spiked pauldrons and a forge hammer, at an anvil on a stump.",
};

const SKIN = mottle("#d99a74", "#c4805e", { size: 0.06, seed: 3 });
const BEARD = grain("#d8742a", "#8e3a14", { size: 0.02, axis: "y", seed: 5 });
const HAIRC = "#a8481a";
const IRON = metal("iron", { tarnish: 0.5 });
const STEEL = metal("steel");
const GILT = metal("gilt");
const BRONZE = metal("bronze", { verdigris: 0.2 });
const LEATHER = paint((p, n) => {
  const burn = Math.max(0, 0.9 - p.y) * 0.9;
  const base = n.y > 0.5 ? [0.45, 0.28, 0.14] : [0.36, 0.21, 0.1];
  return [base[0] * (1 - burn * 0.5), base[1] * (1 - burn * 0.5), base[2] * (1 - burn * 0.5)] as [number, number, number];
});
const CLOTH = mottle("#7a2a22", "#5a1c18", { size: 0.04, seed: 8 });
const PANTS = mottle("#3a3a4a", "#2c2c3a", { size: 0.05, seed: 2 });
const BOOT = "#2a1a10";
const WOOD = grain("#7a5230", "#4e321c", { size: 0.03, axis: "y", seed: 4 });

const EYE = svg(
  `<svg viewBox="0 0 64 40"><path d="M2 22 Q32 -4 62 22 Q32 42 2 22Z" fill="#1a0e08"/><path d="M6 22 Q32 2 58 22 Q32 38 6 22Z" fill="#f4ece0"/><circle cx="32" cy="22" r="12" fill="#3a8ad0"/><circle cx="32" cy="22" r="6" fill="#0a0a10"/><circle cx="27" cy="17" r="4" fill="#fff"/></svg>`,
  { size: 128 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#3a2410" stroke="#f0c040" stroke-width="4"/><rect x="28" y="12" width="8" height="30" fill="#f0c040"/><rect x="14" y="10" width="36" height="12" rx="2" fill="#f0c040" stroke="#1a0e08" stroke-width="2"/><path d="M12 50 H52 L46 42 H18Z" fill="#c8ccd8" stroke="#1a0e08" stroke-width="2"/></svg>`,
  { size: 128 },
);
const RUNE = svg(
  `<svg viewBox="0 0 128 24"><g stroke="#ffb040" stroke-width="3" fill="none" stroke-linecap="round"><path d="M8 4 V20 M8 6 L18 12 L8 16"/><path d="M34 4 L44 20 M44 4 L34 20"/><path d="M60 4 V20 M60 12 L70 4 M60 12 L70 20"/><path d="M86 4 L96 12 L86 20 M96 4 V20"/><path d="M112 20 V4 L122 12 L112 12"/></g></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "dwarf" });
  const R = rng(11);
  const ell = (rx: number, ry: number, rz: number, w = 10, h = 7) =>
    new THREE.SphereGeometry(1, w, h).scale(rx, ry, rz);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 0.6, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.6, 0], [0, 0.9, 0.02], [0, 1.15, 0.04]]), {
    parent: hips, names: ["spine1", "spine2", "chest"], role: "spine",
  });
  const chest = spine.tip!;
  const neck = b.joint("neck", { parent: chest, at: [0, 1.15, 0.04], dir: [0, 1, 0.15], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.28, 0.07], dir: [0, 1, 0.1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.31, 0.1], aim: [0, 1.29, 0.22], role: "jaw" });

  // ---- torso & neck
  b.sweep(spine, (t) => [0.2 + 0.08 * t, 0.19], { color: CLOTH, caps: "flat" });
  b.sweep([[0, 1.14, 0.04], [0, 1.28, 0.08]], 0.095, { bone: neck, color: SKIN, caps: "flat" });
  // belt
  b.lathe([[0.2, 0], [0.27, 0], [0.27, 0.07], [0.2, 0.07]], { at: [0, 0.76, 0.02], bone: spine.joints[0], color: LEATHER });
  b.part(box(0.1, 0.08, 0.03), GILT, { bone: spine.joints[0], at: [0, 0.795, 0.285] });
  // apron
  b.part(box(0.4, 0.55, 0.03), LEATHER, { bone: spine.joints[0], at: [0, 0.62, 0.255] });
  b.part(box(0.43, 0.05, 0.035), BRONZE, { bone: spine.joints[0], at: [0, 0.37, 0.255] });
  b.part(new THREE.PlaneGeometry(0.17, 0.17), "#ffffff", {
    bone: chest, at: [0, 0.98, 0.262], dir: [0, 0, 1], axis: "z", texture: EMBLEM,
  });
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 1.02, 0.25], [s * 0.2, 1.2, 0.1], 0.015, LEATHER, { bone: chest });
    b.part(ell(0.02, 0.02, 0.012, 6, 4), GILT, { bone: chest, at: [s * 0.1, 1.02, 0.275] });
  }

  // ---- legs
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const pts = limb([s * 0.12, 0.6, 0], [s * 0.14, 0.12, 0.03], [0.28, 0.28], [[0, 0, 1]]);
    const leg = b.chain(`leg${k}`, pts, { parent: hips, names: [`hip${k}`, `knee${k}`, `ankle${k}`], role: "leg" });
    b.sweep(leg, [0.115, 0.09], { color: PANTS, caps: "flat" });
    b.part(box(0.2, 0.14, 0.34), BOOT, { bone: leg.tip!, at: [s * 0.14, 0.07, 0.1] });
    b.part(box(0.21, 0.04, 0.36), IRON, { bone: leg.tip!, at: [s * 0.14, 0.02, 0.1] });
    b.part(box(0.18, 0.1, 0.1), STEEL, { bone: leg.tip!, at: [s * 0.14, 0.17, 0.2] });
    b.part(new THREE.CylinderGeometry(0.1, 0.11, 0.1, 8), BOOT, { bone: leg.joints[1], at: [s * 0.14, 0.2, 0.04] });
    b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.03, 8), GILT, { bone: leg.joints[1], at: [s * 0.14, 0.26, 0.04] });
  }

  // ---- arms
  let rightHand: any = null;
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const pts = limb([s * 0.3, 1.08, 0.02], [s * 0.5, 0.76, 0.3], [0.3, 0.28], [[0, -0.3, -1]]);
    const arm = b.chain(`arm${k}`, pts, { parent: chest, names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`], role: "arm" });
    b.sweep(arm, [0.085, 0.07], { color: SKIN, caps: "flat" });
    const el = arm.joints[1].at, wr = arm.tip!.at;
    b.rod(lerp(el, wr, 0.25), lerp(el, wr, 0.85), 0.082, STEEL, { bone: arm.joints[1] });
    b.rod(lerp(el, wr, 0.8), lerp(el, wr, 0.9), 0.088, GILT, { bone: arm.joints[1] });
    b.part(ell(0.085, 0.085, 0.085, 8, 6), SKIN, { bone: arm.tip!, at: wr });
    const sh = [s * 0.33, 1.13, 0.02] as [number, number, number];
    b.part(new THREE.SphereGeometry(0.15, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2), IRON, { bone: arm.joints[0], at: sh });
    b.part(new THREE.TorusGeometry(0.15, 0.016, 5, 10), GILT, { bone: arm.joints[0], at: sh, dir: [0, 1, 0], axis: "z" });
    b.spike([s * 0.33, 1.26, 0.02], [0, 1, 0], 0.12, 0.04, { bone: arm.joints[0], color: STEEL });
    b.part(ell(0.1, 0.1, 0.1, 8, 6), SKIN, { bone: arm.joints[0], at: [s * 0.3, 1.08, 0.02] });
    if (s < 0) rightHand = arm.tip;
  }
  // hammer
  const hb = rightHand;
  b.rod([-0.5, 0.58, 0.3], [-0.5, 1.02, 0.33], 0.022, WOOD, { bone: hb });
  b.part(box(0.28, 0.13, 0.13), IRON, { bone: hb, at: [-0.5, 1.06, 0.33] });
  b.part(box(0.04, 0.15, 0.15), STEEL, { bone: hb, at: [-0.33, 1.06, 0.33] });
  b.part(box(0.04, 0.15, 0.15), STEEL, { bone: hb, at: [-0.67, 1.06, 0.33] });
  b.part(ell(0.03, 0.03, 0.03, 6, 4), GILT, { bone: hb, at: [-0.5, 0.56, 0.3] });

  // ---- head
  const skull = b.part(ell(0.17, 0.16, 0.16, 12, 9), SKIN, { bone: head, at: [0, 1.36, 0.07] });
  for (const s of [1, -1]) {
    b.decal(skull, EYE, { at: [s * 0.066, 1.375, 0.22], dir: [0, 0, 1], size: [0.07, 0.045], mirror: s > 0 });
    b.part(box(0.085, 0.026, 0.03), HAIRC, { bone: head, at: [s * 0.065, 1.415, 0.205], rotation: [0, 0, s * 14] });
    b.part(ell(0.03, 0.045, 0.02, 6, 5), SKIN, { bone: head, at: [s * 0.17, 1.36, 0.06] });
    b.part(ell(0.06, 0.05, 0.05, 7, 5), "#dc8c78", { bone: head, at: [s * 0.1, 1.33, 0.18] });
  }
  b.part(ell(0.055, 0.05, 0.06, 8, 6), "#d9806a", { bone: head, at: [0, 1.335, 0.245] });
  // helm
  b.lathe([[0, 0], [0.18, 0], [0.18, 0.025], [0.155, 0.09], [0.09, 0.15], [0, 0.17]], {
    at: [0, 1.43, 0.07], bone: head, smoothing: 1, color: IRON,
  });
  b.lathe([[0.175, 0.0], [0.19, 0.0], [0.19, 0.03], [0.175, 0.03]], { at: [0, 1.42, 0.07], bone: head, color: GILT });
  b.part(box(0.025, 0.07, 0.025), STEEL, { bone: head, at: [0, 1.4, 0.245] });
  glow(b.part(ell(0.018, 0.018, 0.012, 6, 4), "#ff3a2a", { bone: head, at: [0, 1.465, 0.248] }), 1.4);
  for (const s of [1, -1]) {
    b.spike([s * 0.17, 1.47, 0.07], [s * 0.8, 0.6, 0], 0.16, 0.04, { bone: head, color: STEEL });
    b.part(ell(0.17, 0.05, 0.1, 8, 5), HAIRC, { bone: head, at: [s * 0.0, 1.36, -0.08] });
  }
  // upper / lower jaw + beard
  b.part(box(0.14, 0.03, 0.12), "#c07058", { bone: jaw, at: [0, 1.295, 0.17] });
  b.part(box(0.06, 0.012, 0.01), "#fff4e0", { bone: head, at: [0, 1.312, 0.222] });
  const beard = b.sweep([[0, 1.31, 0.16], [0, 1.14, 0.235], [0, 0.9, 0.27]], (t) => [0.155 - 0.1 * t, 0.07 - 0.03 * t], {
    bone: jaw, color: BEARD, caps: { start: "round", end: "point" },
  });
  void beard;
  for (const s of [1, -1]) {
    b.part(ell(0.07, 0.11, 0.1, 8, 6), BEARD, { bone: jaw, at: [s * 0.14, 1.27, 0.1] });
    b.sweep([[s * 0.02, 1.325, 0.24], [s * 0.1, 1.3, 0.225], [s * 0.17, 1.345, 0.18]], [0.035, 0.01], {
      bone: head, color: BEARD, caps: "point",
    });
    const bp = catmull([[s * 0.06, 1.05, 0.29], [s * 0.08, 0.9, 0.31], [s * 0.07, 0.74, 0.31]]);
    b.sweep(bp, [0.032, 0.022], { bone: jaw, color: BEARD });
    let i = 0;
    b.along(bp, 6, (at) => {
      b.part(ell(0.04, 0.025, 0.04, 6, 4), i++ % 2 ? "#b45a1c" : BEARD, { bone: jaw, at: at.at });
    });
    b.part(new THREE.TorusGeometry(0.03, 0.01, 4, 8), GILT, { bone: jaw, at: [s * 0.07, 0.72, 0.31], dir: [0, 1, 0], axis: "z" });
    b.spike([s * 0.07, 0.72, 0.31], [0, -1, 0], 0.08, 0.025, { bone: jaw, color: BEARD });
  }
  b.part(new THREE.TorusGeometry(0.1, 0.014, 4, 10), GILT, { bone: jaw, at: [0, 1.0, 0.255], dir: [0, 1, 0], axis: "z" });

  // ---- stump, anvil, forge props
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { bone: hips, at, ...o });
  P(new THREE.CylinderGeometry(0.29, 0.32, 0.3, 10), WOOD, [0, 0.15, 0.72]);
  P(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 10), "#a07848", [0, 0.3, 0.72]);
  P(box(0.34, 0.1, 0.4), IRON, [0, 0.35, 0.72]);
  P(box(0.2, 0.15, 0.24), IRON, [0, 0.475, 0.72]);
  P(box(0.7, 0.1, 0.27), STEEL, [0, 0.6, 0.72]);
  b.spike([0.35, 0.6, 0.72], [1, 0, 0], 0.3, 0.07, { bone: hips, color: STEEL });
  P(box(0.12, 0.1, 0.27), STEEL, [-0.38, 0.6, 0.72]);
  P(new THREE.PlaneGeometry(0.3, 0.056), "#ffffff", { }.constructor === Object ? [0, 0.34, 0.926] : [0, 0, 0], {
    dir: [0, 0, 1], axis: "z", texture: RUNE,
  });
  glow(P(box(0.34, 0.03, 0.05), "#ff7a1a", [-0.02, 0.665, 0.72]), 1.6);
  glow(P(box(0.1, 0.03, 0.05), "#ffd060", [0.18, 0.665, 0.72]), 1.8);
  for (let i = 0; i < 7; i++)
    glow(
      P(new THREE.SphereGeometry(0.01 + R() * 0.008, 5, 4), "#ffc040", [(R() - 0.5) * 0.5, 0.7 + R() * 0.3, 0.72 + (R() - 0.5) * 0.3]),
      2,
    );
  // tongs on anvil
  b.rod([0.2, 0.655, 0.8], [0.32, 0.655, 0.66], 0.01, IRON, { bone: hips });
  b.rod([0.22, 0.655, 0.82], [0.34, 0.655, 0.68], 0.01, IRON, { bone: hips });

  return b.root;
}
```