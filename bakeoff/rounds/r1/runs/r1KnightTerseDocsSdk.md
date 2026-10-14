```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, paint, mix, noise } from "agentic-3js-builder";

export const meta = { name: "Armored Knight", description: "A stylized full-plate knight with tabard, sword and kite shield." };

const STEEL = "#aab4c0", DARK = "#5d6672", GOLD = "#d4a640", CLOTH = "#b3202a", CLOTHD = "#7c1219";
const LEATHER = "#5a3a22", BLACK = "#1d1f24", WHITE = "#f1ede2", BLADE = "#d9e0e8";

export default function build() {
  const b = createBuilder({ name: "knight" });
  const steel = paint((p, _n, _s) => mix(STEEL, "#8d98a6", noise(p, 0.12, 3) * 0.8) as any);

  const hips = b.joint("hips", { at: [0, 0.95, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.95, 0], [0, 1.2, 0], [0, 1.45, 0.01]]), { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" });
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.6, 0.01], dir: [0, 1, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.68, 0.02], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.76, 0.07], dir: [0, -0.2, 1], role: "jaw" });

  // torso
  b.loft([
    { at: [0, 0.9, 0], w: 0.34, h: 0.24 },
    { at: [0, 1.1, 0], w: 0.3, h: 0.24 },
    { at: [0, 1.35, 0.01], w: 0.46, h: 0.28 },
    { at: [0, 1.55, 0], w: 0.4, h: 0.26 },
  ], { bone: [hips, ...spine.joints], color: steel });
  // tabard
  b.frustumBox([0, 1.08, 0.135], [0, 0.55, 0.14], [0.26, 0.03], [0.3, 0.03], { bone: hips, color: CLOTH });
  b.frustumBox([0, 1.08, -0.135], [0, 0.55, -0.14], [0.26, 0.03], [0.3, 0.03], { bone: hips, color: CLOTHD });
  b.part(new THREE.BoxGeometry(0.06, 0.3, 0.01), GOLD, { bone: chest, at: [0, 1.3, 0.275] });
  b.part(new THREE.BoxGeometry(0.2, 0.06, 0.01), GOLD, { bone: chest, at: [0, 1.38, 0.275] });
  // belt
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 10), LEATHER, { bone: hips, at: [0, 0.98, 0] });
  b.part(new THREE.BoxGeometry(0.06, 0.06, 0.02), GOLD, { bone: hips, at: [0, 0.98, 0.2] });
  // neck + gorget
  b.part(new THREE.CylinderGeometry(0.08, 0.1, 0.12, 8), DARK, { bone: neck, at: [0, 1.62, 0.01] });
  // head: helmet with visor
  b.part(new THREE.BoxGeometry(0.2, 0.17, 0.24), STEEL, { bone: head, at: [0, 1.78, 0.02] });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.22, 8, 1, false, 0, Math.PI), STEEL, { bone: head, at: [0, 1.87, 0.02], rotation: [0, 0, 0] });
  b.part(new THREE.SphereGeometry(0.115, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { bone: head, at: [0, 1.86, 0.02], scale: [1, 0.9, 1.15] });
  b.part(new THREE.BoxGeometry(0.17, 0.025, 0.02), BLACK, { bone: head, at: [0, 1.80, 0.145] });
  b.part(new THREE.BoxGeometry(0.02, 0.1, 0.02), BLACK, { bone: head, at: [0, 1.74, 0.145] });
  b.part(new THREE.BoxGeometry(0.19, 0.06, 0.22), DARK, { bone: jaw, at: [0, 1.71, 0.04] });
  b.part(new THREE.BoxGeometry(0.02, 0.1, 0.22), CLOTH, { bone: head, at: [0, 1.96, 0.02] });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // pauldron
    const sh = b.joint(`shoulder${S}`, { parent: chest, at: [s * 0.27, 1.5, 0], dir: [s, -0.3, 0], role: "arm" });
    b.part(new THREE.SphereGeometry(0.12, 8, 6), STEEL, { bone: sh, at: [s * 0.28, 1.53, 0], scale: [1.1, 0.8, 1.1] });
    b.part(new THREE.SphereGeometry(0.1, 8, 4, 0, 6.3, 0, 1.6), DARK, { bone: sh, at: [s * 0.3, 1.46, 0], scale: [1.1, 0.8, 1.1] });
    // arm: slightly splayed
    const pts = [[s * 0.3, 1.5, 0], [s * 0.4, 1.25, 0.03], [s * 0.46, 1.0, 0.1]];
    const arm = b.chain(`arm${S}`, catmull(pts), { parent: sh, names: [`elbow${S}`, `wrist${S}`, `hand${S}`], role: "arm" });
    b.sweep(arm, [0.065, 0.05], { color: STEEL, bone: arm.joints[0] === undefined ? undefined : undefined } as any);
    b.part(new THREE.SphereGeometry(0.075, 8, 6), DARK, { bone: arm.joints[1], at: [s * 0.4, 1.25, 0.03] });
    b.part(new THREE.BoxGeometry(0.09, 0.1, 0.1), STEEL, { bone: arm.joints[2], at: [s * 0.47, 0.95, 0.11] });
    // leg
    const hipP: [number, number, number] = [s * 0.12, 0.92, 0];
    const lp = limb(hipP, [s * 0.15, 0.07, 0.02], [0.45, 0.4], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, lp, { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" });
    b.sweep(leg, [0.095, 0.065], { color: STEEL });
    b.part(new THREE.SphereGeometry(0.09, 8, 6), DARK, { bone: leg.joints[1], at: lp[1] });
    b.part(new THREE.BoxGeometry(0.03, 0.04, 0.06), GOLD, { bone: leg.joints[1], at: [lp[1].x, lp[1].y, lp[1].z + 0.09] });
    // sabaton
    b.part(new THREE.BoxGeometry(0.12, 0.09, 0.28), DARK, { bone: leg.tip ?? leg.joints[1], at: [s * 0.15, 0.045, 0.1] });
    b.part(new THREE.ConeGeometry(0.06, 0.1, 6), DARK, { bone: leg.tip ?? leg.joints[1], at: [s * 0.15, 0.04, 0.27], dir: [0, 0, 1] });
    // thigh skirt plate
    b.part(new THREE.BoxGeometry(0.14, 0.2, 0.05), STEEL, { bone: hips, at: [s * 0.12, 0.8, 0.12], rotation: [10, 0, 0] });
  }

  // shield on left arm
  const handL = b.joint("grip", { parent: hips, at: [0.5, 1.05, 0.14], dir: [0, 1, 0] });
  b.extrude([[0, 0.3], [0.2, 0.3], [0.2, 0], [0, -0.35, "sharp"], [-0.2, 0], [-0.2, 0.3]], {
    at: [0.56, 1.12, 0.15], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.04, bevel: 0.01, color: CLOTH, bone: handL,
  });
  b.extrude([[0, 0.3], [0.2, 0.3], [0.2, 0], [0, -0.35, "sharp"], [-0.2, 0], [-0.2, 0.3]], {
    at: [0.56, 1.12, 0.15], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.07, bevel: 0.01, smoothing: 0, color: GOLD, bone: handL,
  }).mesh.scale.set(1, 1, 0.4);
  b.part(new THREE.SphereGeometry(0.05, 8, 6), GOLD, { bone: handL, at: [0.6, 1.2, 0.15] });

  // sword in right hand, point down-forward
  const sw = b.joint("sword", { parent: hips, at: [-0.47, 0.98, 0.14], dir: [0, 0.3, 1] });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 6), LEATHER, { bone: sw, at: [-0.47, 0.98, 0.14], rotation: [90, 0, 0] });
  b.part(new THREE.BoxGeometry(0.22, 0.03, 0.03), GOLD, { bone: sw, at: [-0.47, 0.98, 0.21] });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), GOLD, { bone: sw, at: [-0.47, 0.98, 0.07] });
  b.frustumBox([-0.47, 0.98, 0.22], [-0.47, 0.98, 0.95], [0.05, 0.012], [0.02, 0.008], { bone: sw, color: BLADE });
  b.part(new THREE.ConeGeometry(0.01, 0.06, 4), BLADE, { bone: sw, at: [-0.47, 0.98, 0.98], dir: [0, 0, 1] });

  // cape
  b.frustumBox([0, 1.55, -0.17], [0, 0.55, -0.22], [0.4, 0.03], [0.5, 0.02], { bone: chest, color: CLOTHD });

  return b.root;
}
```