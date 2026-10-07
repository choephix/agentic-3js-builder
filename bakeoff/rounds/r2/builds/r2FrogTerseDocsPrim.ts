import * as THREE from "three";
import { createBuilder, limb, patches, countershade, mottle, svg } from "../../../../src/index";

export const meta = { name: "Frog", description: "A stylized green tree frog in a rest pose with rigged legs, jaw and spine." };

export default function build() {
  const b = createBuilder({ name: "frog" });
  const GREEN = "#5aa83c", DARK = "#2f6b2a", BELLY = "#e9e2b0", EYE = "#f2b630", BLACK = "#16150f", PINK = "#e07a7a", TOE = "#d9c24a";

  const skinPaint = countershade(mottle(GREEN, DARK, { size: 0.05, contrast: 0.6, seed: 3 }), BELLY, { level: -0.35 });

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.12, -0.1], role: "spine" });
  const spine = b.chain("spine", [[0, 0.12, -0.1], [0, 0.14, 0.02], [0, 0.17, 0.12]], { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" });
  const head = b.joint("head", { parent: spine.joints[1], at: [0, 0.2, 0.14], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.15, 0.17], aim: [0, 0.14, 0.3], role: "jaw" });

  // body
  b.loft([
    { at: [0, 0.1, -0.2], w: 0.1, h: 0.08 },
    { at: [0, 0.13, -0.08], w: 0.2, h: 0.17 },
    { at: [0, 0.15, 0.05], w: 0.19, h: 0.16 },
    { at: [0, 0.17, 0.14], w: 0.14, h: 0.1 },
  ], { bone: [hips, spine.joints[0], spine.joints[1]], color: skinPaint });

  // head
  b.part(new THREE.SphereGeometry(0.1, 10, 8), skinPaint, { bone: head, at: [0, 0.19, 0.19], scale: [1.25, 0.75, 1.2] });
  b.part(new THREE.SphereGeometry(0.08, 10, 6), skinPaint, { bone: head, at: [0, 0.16, 0.26], scale: [1.2, 0.55, 1.1] });
  // lower jaw
  b.part(new THREE.BoxGeometry(0.17, 0.025, 0.17), BELLY, { bone: jaw, at: [0, 0.14, 0.27] });
  b.part(new THREE.BoxGeometry(0.1, 0.01, 0.1), PINK, { bone: jaw, at: [0, 0.157, 0.26] });
  // nostrils
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.008, 5, 4), BLACK, { bone: head, at: [s * 0.03, 0.215, 0.35] });
    // eyes
    b.part(new THREE.SphereGeometry(0.045, 10, 8), GREEN, { bone: head, at: [s * 0.075, 0.27, 0.2] });
    b.part(new THREE.SphereGeometry(0.036, 10, 8), EYE, { bone: head, at: [s * 0.08, 0.275, 0.225] });
    b.part(new THREE.BoxGeometry(0.05, 0.012, 0.012), BLACK, { bone: head, at: [s * 0.084, 0.277, 0.258], rotation: [0, 0, 0] });
    b.part(new THREE.SphereGeometry(0.046, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), DARK, { bone: head, at: [s * 0.075, 0.272, 0.2] });
    // throat cheeks
    b.part(new THREE.SphereGeometry(0.02, 6, 4), BELLY, { bone: jaw, at: [s * 0.07, 0.14, 0.2] });
  }

  // back spots
  for (const [x, z, y] of [[0.05, -0.05, 0.225], [-0.06, -0.12, 0.22], [0.02, 0.02, 0.24], [-0.05, 0.05, 0.235], [0.07, -0.14, 0.2]] as number[][])
    b.part(new THREE.SphereGeometry(0.02, 6, 4), DARK, { bone: hips, at: [x, y, z], scale: [1, 0.3, 1] });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front legs
    const sh = [s * 0.09, 0.1, 0.08];
    const fpts = limb(sh, [s * 0.13, 0.015, 0.17], [0.09, 0.09], [[0, 0, -1]]);
    const arm = b.chain(`arm${side}`, fpts, { parent: spine.joints[1], names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" });
    b.sweep(arm, [0.032, 0.02], { color: GREEN, sides: 6 });
    // fingers
    for (let i = 0; i < 4; i++) {
      const a = (i - 1.5) * 0.35;
      const base = fpts[2];
      const tip = [base.x + s * Math.sin(a) * 0.07 + s * 0.01, 0.012, base.z + Math.cos(a) * 0.07];
      const f = b.chain(`finger${i}${side}`, [[base.x, 0.015, base.z], tip], { parent: arm.tip!, names: [`finger${i}${side}`, `fingerTip${i}${side}`], role: "digit" });
      b.sweep(f, 0.009, { color: GREEN, sides: 5 });
      b.part(new THREE.SphereGeometry(0.014, 6, 4), TOE, { bone: f.tip!, at: tip, scale: [1, 0.6, 1] });
    }
    // hind legs
    const hp = [s * 0.11, 0.12, -0.2];
    const hpts = limb(hp, [s * 0.2, 0.015, -0.1], [0.15, 0.16, 0.1], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${side}`, hpts, { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`], role: "leg" });
    b.sweep(leg, [0.065, 0.025], { color: GREEN, sides: 7 });
    b.part(new THREE.SphereGeometry(0.075, 8, 6), skinPaint, { bone: hips, at: [s * 0.12, 0.13, -0.19], scale: [0.8, 1, 1.2] });
    // toes
    const ank = hpts[3];
    for (let i = 0; i < 4; i++) {
      const a = (i - 1.5) * 0.4;
      const tip = [ank.x + s * Math.sin(a) * 0.14 + s * 0.02, 0.012, ank.z + Math.cos(a) * 0.14];
      const t = b.chain(`toe${i}${side}`, [[ank.x, 0.015, ank.z], tip], { parent: leg.tip!, names: [`toe${i}${side}`, `toeTip${i}${side}`], role: "digit" });
      b.sweep(t, 0.01, { color: GREEN, sides: 5 });
      b.part(new THREE.SphereGeometry(0.017, 6, 4), TOE, { bone: t.tip!, at: tip, scale: [1, 0.6, 1] });
    }
    // webbing
    b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.006, 8, 1, false, 0, Math.PI), DARK, { bone: leg.tip!, at: [ank.x + s * 0.02, 0.008, ank.z + 0.07], rotation: [0, -90 * s + 0, 0] });
  }

  return b.root;
}
