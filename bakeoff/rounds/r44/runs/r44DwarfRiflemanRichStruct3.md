```ts
// Dwarf rifleman, Warcraft style: chunky, heavy shoulders, braided beard, blunderbuss.
import * as THREE from "three";
import { createBuilder, frame, limb, rng, catmull, polyline, paint, mix, noise, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Dwarf Rifleman",
  description: "A stout 1.4 m dwarf rifleman with a braided red beard, plate pauldrons, bandolier and a flared blunderbuss.",
};

const SKIN = "#d9a07c", BEARD = "#c4561f", BEARD_D = "#8a3410", BLUE = "#2c4f8c", BLUE_D = "#1b3160";
const LEATHER = "#6b4224", LEATHER_D = "#47281a", GOLD = "#e0b030", WOOD = "#7a4a26", IRON = "#3a3d46";
const CLOTH = "#8a2f2a", WHITE = "#f4efe0";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const STEEL = metal("steel");
const BRASS = metal("brass");
const COAT = paint((p, n) => mix(BLUE_D, BLUE, Math.min(1, Math.max(0, 0.5 + 0.5 * n.y)) * 0.7 + noise(p, 0.05, 2) * 0.3));
const STOCK = paint((p) => mix(WOOD, "#5a3418", noise(new THREE.Vector3(p.x * 8, p.y, p.z * 0.5), 0.1, 4)));

const EYES = svg(
  `<svg viewBox="0 0 100 30"><g fill="#fff" stroke="#2a1408" stroke-width="3"><ellipse cx="25" cy="16" rx="12" ry="8"/><ellipse cx="75" cy="16" rx="12" ry="8"/></g>
  <circle cx="27" cy="16" r="5" fill="#2a6ab0"/><circle cx="73" cy="16" r="5" fill="#2a6ab0"/><circle cx="27" cy="16" r="2.4" fill="#0a0a14"/><circle cx="73" cy="16" r="2.4" fill="#0a0a14"/>
  <path d="M8 6 Q25 -2 40 8 M60 8 Q75 -2 92 6" stroke="${BEARD_D}" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 4 L58 16 V36 Q58 54 32 62 Q6 54 6 36 V16Z" fill="#1b3160" stroke="#e0b030" stroke-width="4"/><path d="M32 14 L38 30 L32 50 L26 30Z" fill="#e0b030"/><rect x="18" y="26" width="28" height="6" fill="#e0b030"/></svg>`,
  { size: 128 },
);
const STRAND = svg(
  `<svg viewBox="0 0 32 64"><path d="M6 64 Q0 30 14 2 Q26 30 26 64Z" fill="#c4561f"/><path d="M16 60 Q14 30 15 8" stroke="#8a3410" stroke-width="3" fill="none"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "dwarfRifleman" });
  const R = rng(5);

  const hips = b.joint("hips", { at: [0, 0.6, 0], role: "spine" });
  const spine = b.chain("spine", polyline([V(0, 0.6, 0), V(0, 0.78, 0.01), V(0, 0.98, 0.02)]), { parent: hips, names: ["spine1", "spine2"], role: "spine" });
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.0, 0.02], aim: [0, 1.08, 0.04], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.08, 0.04], aim: [0, 1.25, 0.05], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.18, 0.0], aim: [0, 1.15, 0.12], role: "jaw" });

  // torso
  b.loft(
    [
      { at: [0, 0.55, 0], w: 0.42, h: 0.3 },
      { at: [0, 0.75, 0.01], w: 0.5, h: 0.34 },
      { at: [0, 0.95, 0.02], w: 0.54, h: 0.32 },
      { at: [0, 1.02, 0.02], w: 0.3, h: 0.22 },
    ],
    { bone: [spine, hips], color: COAT, sides: 10, smooth: false },
  );
  const belt = b.sweep(polyline([V(0, 0.7, 0), V(0, 0.74, 0)]), [0.26, 0.2], { bone: hips, section: "box", color: LEATHER_D, caps: "flat" });
  void belt;
  b.part(new THREE.BoxGeometry(0.1, 0.09, 0.03), GOLD, { bone: hips, at: [0, 0.72, 0.185] });
  b.part(new THREE.BoxGeometry(0.05, 0.05, 0.034), IRON, { bone: hips, at: [0, 0.72, 0.19] });
  b.part(new THREE.CylinderGeometry(0.2, 0.3, 0.2, 10, 1, true), COAT, { bone: hips, at: [0, 0.55, 0], flat: true });

  // legs
  const feet: Record<string, any> = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb(V(s * 0.12, 0.58, 0), V(s * 0.13, 0.08, 0), [0.26, 0.24], [0, 0, 1]);
    const leg = b.chain(`leg${L}`, polyline(pts), { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg" });
    b.sweep(leg, [0.11, 0.09], { color: LEATHER, sides: 8 });
    b.sweep(leg, [0.105, 0.115], { from: 0.55, to: 1, color: LEATHER_D, sides: 8, caps: "flat" });
    b.part(new THREE.CylinderGeometry(0.125, 0.12, 0.05, 8), GOLD, { bone: leg.joints[1], at: [s * 0.13, 0.26, 0.0] });
    feet[L] = b.part(new THREE.BoxGeometry(0.15, 0.1, 0.28), LEATHER_D, { bone: leg.tip ?? leg.joints[2], at: [s * 0.13, 0.05, 0.06], flat: true });
    b.part(new THREE.BoxGeometry(0.155, 0.03, 0.29), IRON, { bone: leg.tip ?? leg.joints[2], at: [s * 0.13, 0.015, 0.06] });
    b.part(new THREE.BoxGeometry(0.12, 0.05, 0.1), STEEL, { bone: leg.tip ?? leg.joints[2], at: [s * 0.13, 0.1, 0.12] });
  }

  // head
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { bone: head, at: [0, 1.2, 0.03], scale: [0.14, 0.15, 0.15] });
  b.part(new THREE.SphereGeometry(0.045, 7, 5), "#cf7a62", { bone: head, at: [0, 1.17, 0.18], scale: [1, 0.9, 1] });
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.1), BEARD_D, { bone: head, at: [0, 1.255, 0.1] });
  b.part(new THREE.PlaneGeometry(0.2, 0.06), "#ffffff", { bone: head, at: [0, 1.225, 0.1805], dir: [0, 0, 1], axis: "z", texture: EYES });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.03, 6, 4), SKIN, { bone: head, at: [s * 0.145, 1.2, 0.02], scale: [0.6, 1.3, 1] });
  // helmet
  b.part(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), STEEL, { bone: head, at: [0, 1.25, 0.02], scale: [0.16, 0.12, 0.17], flat: true });
  b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.025, 12), IRON, { bone: head, at: [0, 1.255, 0.02] });
  b.spike([0, 1.36, 0.02], [0, 1, 0], 0.07, 0.025, { bone: head, color: GOLD, sides: 6 });
  for (const s of [1, -1]) {
    b.spike([s * 0.15, 1.3, 0.0], [s * 0.9, 0.5, 0], 0.17, 0.035, { bone: head, color: WHITE, sides: 6 });
    b.part(new THREE.BoxGeometry(0.02, 0.1, 0.1), STEEL, { bone: head, at: [s * 0.16, 1.18, 0.05] });
  }

  // beard: base mass, braids, cards
  const beard = b.loft(
    [
      { at: [0, 1.17, 0.12], w: 0.22, h: 0.1 },
      { at: [0, 1.06, 0.17], w: 0.26, h: 0.1 },
      { at: [0, 0.92, 0.2], w: 0.2, h: 0.09 },
      { at: [0, 0.8, 0.2], w: 0.08, h: 0.06 },
    ],
    { bone: jaw, color: BEARD, sides: 8, smooth: false, caps: { start: "flat", end: "point" } },
  );
  b.cards(b.surface(beard).scatter(26, { rng: R, minDist: 0.04 }), STRAND, { size: [0.05, 0.1], lean: 50, flow: [0, -1, 0.2], vary: 0.3, rng: R, bone: jaw });
  for (const s of [1, -1]) {
    const br = b.chain(`braid${s > 0 ? "L" : "R"}`, catmull([V(s * 0.09, 1.1, 0.22), V(s * 0.1, 1.0, 0.25), V(s * 0.1, 0.9, 0.26), V(s * 0.1, 0.82, 0.25)]), { parent: jaw, count: 3, role: "tail" });
    b.sweep(br, [0.035, 0.025], { color: paint((_p, _n, st) => (Math.floor(st[0] * 9) % 2 ? BEARD : BEARD_D)), sides: 6, smooth: false });
    b.part(new THREE.TorusGeometry(0.03, 0.01, 4, 8), GOLD, { bone: br.joints[2], at: [s * 0.1, 0.83, 0.25], dir: [0, 1, 0], axis: "z" });
  }
  b.part(new THREE.BoxGeometry(0.34, 0.05, 0.08), BEARD, { bone: head, at: [0, 1.135, 0.16], rotation: [0, 0, 0] });
  for (const s of [1, -1]) {
    b.sweep(catmull([V(s * 0.02, 1.15, 0.2), V(s * 0.1, 1.13, 0.22), V(s * 0.15, 1.07, 0.2)]), [0.03, 0.012], { bone: head, color: BEARD, sides: 6, smooth: false });
  }

  // arms
  const sh: Record<string, THREE.Vector3> = {};
  const arms: Record<string, any> = {};
  const targets = { L: V(0.2, 0.78, 0.46), R: V(-0.14, 0.86, 0.36) };
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const root = V(s * 0.3, 0.93, 0);
    sh[L] = root;
    const pts = limb(root, targets[L], [0.28, 0.27], [s * 0.5, -1, -0.2]);
    const arm = b.chain(`arm${L}`, polyline(pts), { parent: chest, names: [`shoulder${L}`, `elbow${L}`, `hand${L}`], role: "arm" });
    arms[L] = arm;
    b.sweep(arm, [0.082, 0.065], { color: COAT, sides: 8 });
    b.sweep(arm, [0.07, 0.075], { from: 0.62, to: 1, color: LEATHER, sides: 8, caps: "flat" });
    const h = arm.tip ?? arm.joints[2];
    b.part(new THREE.SphereGeometry(0.06, 8, 6), SKIN, { bone: h, at: targets[L].clone().add(V(0, 0, 0.03)) });
    // pauldron
    b.part(new THREE.SphereGeometry(0.13, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), STEEL, { bone: arm.joints[0], at: root.clone().add(V(s * 0.02, 0.03, 0)), scale: [1.1, 0.8, 1.1], flat: true });
    b.part(new THREE.CylinderGeometry(0.13, 0.14, 0.03, 10), GOLD, { bone: arm.joints[0], at: root.clone().add(V(s * 0.02, 0.03, 0)) });
    b.spike(root.clone().add(V(s * 0.1, 0.12, 0)), [s * 0.6, 1, 0], 0.09, 0.03, { bone: arm.joints[0], color: BRASS, sides: 6 });
  }

  // chest: bandolier, emblem
  b.sweep(catmull([V(-0.26, 0.98, 0.1), V(-0.1, 0.88, 0.2), V(0.1, 0.78, 0.2), V(0.27, 0.65, 0.1)]), [0.04, 0.012], { bone: chest, color: LEATHER_D, section: "box" });
  for (let i = 0; i < 5; i++) {
    const t = 0.15 + i * 0.17;
    const p = catmull([V(-0.26, 0.98, 0.1), V(-0.1, 0.88, 0.2), V(0.1, 0.78, 0.2), V(0.27, 0.65, 0.1)]).at(t);
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.07, 6), BRASS, { bone: chest, at: [p.x, p.y, p.z + 0.03] });
  }
  b.part(new THREE.PlaneGeometry(0.12, 0.12), "#ffffff", { bone: chest, at: [0.12, 0.93, 0.2], dir: [0, 0, 1], axis: "z", texture: EMBLEM });
  // powder horn
  b.part(new THREE.ConeGeometry(0.035, 0.16, 7), WHITE, { bone: hips, at: [-0.26, 0.7, 0.06], rotation: [0, 0, 150] });

  // blunderbuss, held diagonally
  const rifle = b.joint("blunderbuss", { parent: arms.R.tip ?? arms.R.joints[2], at: [-0.14, 0.86, 0.1], dir: [0.05, 0.1, 1] });
  const D = V(0.05, 0.1, 1).normalize();
  const O = V(-0.14, 0.86, 0.1);
  const at = (t: number) => O.clone().addScaledVector(D, t);
  b.rod(at(-0.3), at(-0.02), [0.04, 0.035], { bone: rifle, color: STOCK, sides: 6 });
  b.part(new THREE.BoxGeometry(0.06, 0.16, 0.09), STOCK, { bone: rifle, at: at(-0.32).add(V(0, -0.05, 0)) });
  b.rod(at(-0.05), at(0.62), [0.03, 0.026], { bone: rifle, color: STEEL, sides: 8 });
  b.lathe([[0.026, 0], [0.04, 0.05], [0.07, 0.15], [0.085, 0.2], [0.07, 0.2], [0.03, 0.02]], { at: at(0.6), axis: D.toArray() as [number, number, number], bone: rifle, color: BRASS, segments: 10 });
  glow(b.part(new THREE.CircleGeometry(0.06, 10), "#ff7a2a", { bone: rifle, at: at(0.795), dir: D.toArray() as [number, number, number], axis: "z" }), 0.8);
  for (const t of [0.1, 0.3, 0.5]) b.rod(at(t), at(t + 0.03), 0.04, { bone: rifle, color: BRASS, sides: 8 });
  b.part(new THREE.BoxGeometry(0.05, 0.07, 0.05), IRON, { bone: rifle, at: at(0.0).add(V(0, 0.05, 0)) });
  b.part(new THREE.TorusGeometry(0.04, 0.007, 4, 8, Math.PI), IRON, { bone: rifle, at: at(-0.06).add(V(0, -0.04, 0)), rotation: [0, 90, 180] });

  return b.root;
}
```