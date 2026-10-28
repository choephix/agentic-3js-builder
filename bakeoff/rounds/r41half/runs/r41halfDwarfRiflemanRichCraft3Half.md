```ts
import * as THREE from "three";
import { createBuilder, offset, catmull, polyline, svg, metal, grain, countershade, paint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dwarf Rifleman",
  description: "Stocky Ironforge-style dwarf with a braided red beard, winged steel helm and a flared brass blunderbuss.",
};

const SKIN = "#d99a74";
const NOSE = "#e08a70";
const BLUE = "#2f4f94";
const GOLD = "#e0b030";
const LEATHER = "#6a4024";
const DARKL = "#3e2514";
const PANTS = "#4a3a30";
const BONE = "#eadfc0";
const DARK = "#1a1410";
const STEEL = metal("steel", { tarnish: 0.15 });
const BRASS = metal("brass");
const BEARD = grain("#e0652a", "#a8341a", { size: 0.012, axis: "y" });
const BEARD_B = "#c44a1e";
const WOOD = grain("#8a5428", "#4e2c14", { size: 0.01, axis: "z" });
const COAT = countershade(BLUE, "#223a70", { level: -0.2 });
const BOOT = grain("#5a3820", "#33200f", { size: 0.012, axis: "y" });

const EYE = svg(
  `<svg viewBox="0 0 60 36"><path d="M2 20 Q30 -4 58 20 Q30 38 2 20Z" fill="#1a1410"/>
  <path d="M6 20 Q30 3 54 20 Q30 33 6 20Z" fill="#f4efe0"/><circle cx="30" cy="20" r="11" fill="#2a78c8"/>
  <circle cx="30" cy="20" r="5.5" fill="#101018"/><circle cx="26" cy="16" r="3" fill="#fff"/>
  <path d="M0 14 Q30 -8 60 14" stroke="#1a1410" stroke-width="6" fill="none"/></svg>`,
  { size: 128 },
);
const CREST = svg(
  `<svg viewBox="0 0 60 90"><path d="M4 4 H56 V50 Q56 76 30 86 Q4 76 4 50Z" fill="#2848a0" stroke="#e0b030" stroke-width="5"/>
  <path d="M14 66 L46 22" stroke="#6a4024" stroke-width="5" stroke-linecap="round"/>
  <path d="M14 22 L46 66" stroke="#c8ccd8" stroke-width="5" stroke-linecap="round"/>
  <rect x="36" y="16" width="16" height="11" rx="2" fill="#9aa0b0" transform="rotate(48 44 22)" stroke="#222" stroke-width="1.5"/>
  <circle cx="30" cy="44" r="7" fill="#e0b030" stroke="#222" stroke-width="1.5"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "dwarf" });
  const hips = b.joint("hips", { at: [0, 0.62, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 0.62, 0], [0, 0.82, 0.01], [0, 1.0, 0.02]]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip!;
  b.sweep(spine, (t) => [0.19 + 0.06 * t, 0.15 + 0.03 * Math.sin(t * 3)], { color: COAT, shift: [0, 0.01] });
  const neck = b.joint("neck", { parent: chest, at: [0, 1.02, 0.02], aim: [0, 1.12, 0.05], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.12, 0.05], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.17, 0.08], aim: [0, 1.15, 0.2], role: "jaw" });
  b.rod([0, 1.0, 0.02], [0, 1.14, 0.05], 0.09, SKIN, { bone: neck });

  // belt, tabard, bandolier
  const beltPts: number[][] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    beltPts.push([Math.sin(a) * 0.225, 0.69, 0.005 + Math.cos(a) * 0.17]);
  }
  b.sweep(catmull(beltPts, { closed: true }), 0.024, { color: DARKL, bone: spine.joints[0] });
  b.part(new THREE.BoxGeometry(0.07, 0.06, 0.02), BRASS, { at: [0, 0.69, 0.185], bone: spine.joints[0] });
  b.part(new THREE.BoxGeometry(0.2, 0.3, 0.02), BLUE, { at: [0, 0.52, 0.14], bone: hips });
  b.part(new THREE.PlaneGeometry(0.17, 0.255), "#ffffff", { at: [0, 0.52, 0.151], dir: [0, 0, 1], axis: "z", texture: CREST, bone: hips });
  b.part(new THREE.BoxGeometry(0.2, 0.025, 0.024), GOLD, { at: [0, 0.375, 0.14], bone: hips });
  const band = b.sweep(
    catmull([[-0.2, 1.0, 0.05], [-0.1, 0.9, 0.19], [0.05, 0.8, 0.2], [0.22, 0.68, 0.1]]),
    0.022,
    { color: LEATHER, bone: spine.joints[1] },
  );
  b.along(band, 5, (at) => b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.06, 6), BRASS, { at, bone: spine.joints[1] }));
  // pouches, horn
  for (const [x, z] of [[0.2, 0.1], [-0.12, -0.17]] as const)
    b.part(new THREE.BoxGeometry(0.08, 0.09, 0.06), LEATHER, { at: [x, 0.62, z], bone: hips });
  b.sweep(catmull([[0.22, 0.68, 0.1], [0.27, 0.56, 0.14], [0.24, 0.46, 0.2]]), [0.045, 0.012], { color: BONE, bone: hips });
  b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.025, 8), BRASS, { at: [0.22, 0.675, 0.1], bone: hips });
  // backpack
  b.part(new THREE.BoxGeometry(0.26, 0.3, 0.14), LEATHER, { at: [0, 0.88, -0.17], bone: chest });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.32, 8), "#c9b58a", { at: [0, 1.08, -0.2], dir: [1, 0, 0], bone: chest });
  b.part(new THREE.SphereGeometry(0.07, 8, 6), STEEL, { at: [0.1, 0.78, -0.28], bone: chest });

  // legs
  for (const [s, S] of [[1, "L"], [-1, "R"]] as const) {
    const leg = b.chain(
      `leg${S}`,
      catmull([[s * 0.1, 0.62, 0], [s * 0.1, 0.36, 0.02], [s * 0.1, 0.1, 0]]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg", contact: [s * 0.1, 0, 0.06] },
    );
    b.sweep(leg, [0.095, 0.07], { color: PANTS });
    const ank = leg.tip!;
    b.part(new THREE.CylinderGeometry(0.088, 0.078, 0.2, 8), BOOT, { at: [s * 0.1, 0.2, 0.0], bone: ank });
    b.part(new THREE.CylinderGeometry(0.1, 0.09, 0.05, 8), "#a07040", { at: [s * 0.1, 0.31, 0.0], bone: ank });
    b.part(new THREE.BoxGeometry(0.15, 0.1, 0.28), BOOT, { at: [s * 0.1, 0.055, 0.07], bone: ank });
    b.part(new THREE.BoxGeometry(0.16, 0.03, 0.3), DARKL, { at: [s * 0.1, 0.014, 0.07], bone: ank });
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.02), BRASS, { at: [s * 0.1, 0.17, 0.085], bone: ank });
  }

  // arms
  const D = new THREE.Vector3(0, 0.35, 1).normalize();
  const W = new THREE.Vector3(-0.42, 0.58, 0.05);
  const P = (k: number) => W.clone().addScaledVector(D, k);
  for (const [s, S] of [[1, "L"], [-1, "R"]] as const) {
    const arm = b.chain(
      `arm${S}`,
      catmull([[s * 0.27, 0.97, 0], [s * 0.38, 0.78, 0.02], [s * 0.42, 0.58, 0.05]]),
      { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" },
    );
    b.sweep(arm, [0.07, 0.055], { color: BLUE });
    const wr = arm.tip!;
    const hp: [number, number, number] = [s * 0.42, 0.55, 0.05];
    b.part(new THREE.BoxGeometry(0.1, 0.09, 0.09), DARKL, { at: hp, bone: wr });
    b.part(new THREE.CylinderGeometry(0.065, 0.058, 0.07, 8), "#a07040", { at: [s * 0.41, 0.62, 0.05], bone: wr });
    for (let i = 0; i < 4; i++)
      b.rod([s * 0.42 + (i - 1.5) * 0.02, 0.5, 0.07], [s * 0.42 + (i - 1.5) * 0.02, 0.45, 0.08], 0.011, SKIN, { bone: wr });
    b.rod([s * 0.37, 0.55, 0.07], [s * 0.38, 0.5, 0.1], 0.013, SKIN, { bone: wr });
    // pauldron
    b.part(new THREE.SphereGeometry(0.105, 10, 7), STEEL, { at: [s * 0.28, 1.0, 0], scale: [1, 0.75, 1.05], bone: chest });
    b.spike([s * 0.31, 1.06, 0], [s * 0.6, 1, 0], 0.13, 0.03, { color: BRASS, bone: chest });
    b.part(new THREE.TorusGeometry(0.1, 0.012, 5, 12), BRASS, { at: [s * 0.28, 0.97, 0], dir: [0, 1, 0], axis: "z", bone: chest });
  }

  // blunderbuss in right hand
  const wr = "wristR";
  b.frustumBox(P(-0.32), P(0.06), [0.05, 0.11], [0.045, 0.06], { color: WOOD, bone: wr });
  b.part(new THREE.BoxGeometry(0.06, 0.12, 0.02), BRASS, { at: P(-0.33), dir: D, axis: "z", bone: wr });
  b.rod(P(0.05), P(0.64), [0.034, 0.028], STEEL, { bone: wr });
  for (const k of [0.15, 0.32, 0.5])
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.025, 8), BRASS, { at: P(k), dir: D, bone: wr });
  b.part(new THREE.CylinderGeometry(0.09, 0.04, 0.2, 10), STEEL, { at: P(0.74), dir: D, bone: wr });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 10), BRASS, { at: P(0.84), dir: D, bone: wr });
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.01, 10), DARK, { at: P(0.845), dir: D, bone: wr });
  b.part(new THREE.BoxGeometry(0.03, 0.06, 0.1), BRASS, { at: P(0.08).add(new THREE.Vector3(-0.035, 0.01, 0)), dir: D, axis: "z", bone: wr });
  b.rod(P(0.06).add(new THREE.Vector3(-0.04, 0.03, 0)), P(0.03).add(new THREE.Vector3(-0.04, 0.09, 0)), 0.009, STEEL, { bone: wr });
  glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), "#ff7a2a", { at: P(0.12).add(new THREE.Vector3(-0.02, 0.04, 0)), bone: wr }), 1.5);
  b.rod(P(-0.02), P(0.1).add(new THREE.Vector3(0, -0.06, 0)), 0.008, BRASS, { bone: wr });

  // head
  const C: [number, number, number] = [0, 1.25, 0.06];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), SKIN, { at: C, scale: [0.125, 0.115, 0.12], bone: head });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(C).at(s * 21, 2)!;
    b.decal(skin, EYE, { at: hit, size: [0.06, 0.036], mirror: s > 0, bone: head });
    b.part(new THREE.SphereGeometry(0.03, 6, 5), SKIN, { at: [s * 0.125, 1.24, 0.04], bone: head, scale: [0.6, 1.2, 1] });
    b.rod([s * 0.02, 1.295, 0.17], [s * 0.1, 1.31, 0.15], [0.02, 0.014], BEARD_B, { bone: head });
  }
  b.part(new THREE.SphereGeometry(0.05, 8, 6), NOSE, { at: [0, 1.21, 0.185], scale: [0.9, 0.85, 1], bone: head });
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { at: [0, 1.168, 0.1], scale: [0.085, 0.04, 0.08], bone: jaw });
  // beard
  b.part(new THREE.SphereGeometry(1, 10, 8), BEARD, { at: [0, 1.06, 0.15], scale: [0.14, 0.16, 0.08], bone: head });
  b.part(new THREE.SphereGeometry(1, 8, 6), BEARD, { at: [0, 0.97, 0.18], scale: [0.09, 0.12, 0.05], bone: head });
  for (const s of [1, -1]) {
    b.sweep(catmull([[0, 1.2, 0.185], [s * 0.06, 1.185, 0.205], [s * 0.115, 1.15, 0.18]]), [0.03, 0.012], { color: BEARD, bone: head });
    const pathB = catmull([[s * 0.06, 1.16, 0.2], [s * 0.075, 1.0, 0.22], [s * 0.075, 0.84, 0.22]]);
    b.along(pathB, 9, (at) =>
      b.part(new THREE.SphereGeometry(0.03, 6, 5), BEARD, { at: offset(at, [1, 0, 0], ((at.t * 9) % 2 < 1 ? 1 : -1) * 0.012), bone: head }),
    );
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.025, 8), BRASS, { at: [s * 0.075, 0.855, 0.22], bone: head });
    b.spike([s * 0.075, 0.845, 0.22], [0, -1, 0], 0.07, 0.028, { color: BEARD_B, bone: head });
  }
  // helmet
  b.lathe([[0, 0], [0.15, 0], [0.15, 0.025], [0.14, 0.07], [0.1, 0.125], [0, 0.15]], { at: [0, 1.3, 0.04], color: STEEL, bone: head });
  b.lathe([[0.145, 0], [0.16, 0], [0.16, 0.03], [0.145, 0.03]], { at: [0, 1.3, 0.04], color: BRASS, bone: head });
  b.extrude([[-0.12, 0], [0.12, 0], [0.1, 0.06], [0, 0.1], [-0.08, 0.07]], {
    at: [0, 1.4, 0.04], x: [0, 0, 1], thickness: 0.025, color: BRASS, bone: head,
  });
  for (const s of [1, -1]) {
    b.spike([s * 0.14, 1.33, 0.04], [s, 0.55, 0], 0.17, 0.035, { color: BONE, bone: head });
    b.part(new THREE.SphereGeometry(0.014, 5, 4), GOLD, { at: [s * 0.12, 1.365, 0.14], bone: head });
  }
  return b.root;
}
```