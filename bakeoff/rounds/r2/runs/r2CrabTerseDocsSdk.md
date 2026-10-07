```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, paint, mottle, countershade, rng, svg } from "agentic-3js-builder";

export const meta = { name: "Crab", description: "Stylized shore crab with carapace, eyestalks, claws and four walking legs per side." };

export default function build() {
  const b = createBuilder({ name: "crab" });
  const SHELL = "#d9532f", SHELL2 = "#a83a22", BELLY = "#f0d9b0", DARK = "#2a1a18", TIP = "#f4e2c4", WHITE = "#fafafa";
  const coat = countershade(mottle(SHELL, SHELL2, { size: 0.06, seed: 3 }), BELLY, { level: -0.2 });

  const body = b.joint("body", { at: [0, 0.07, 0], role: "spine" });
  // carapace: wide, flat
  b.sweep([[0, 0.1, -0.12], [0, 0.1, 0.14]], (t) => [0.2 - 0.05 * Math.abs(t - 0.4), 0.06], {
    bone: body, color: coat, section: { ngon: 8 }, caps: "round",
  });
  b.part(new THREE.SphereGeometry(0.2, 10, 6), coat, { bone: body, at: [0, 0.09, 0], scale: [1, 0.35, 0.75], flat: true });
  b.part(new THREE.SphereGeometry(0.17, 10, 5), BELLY, { bone: body, at: [0, 0.045, 0], scale: [1, 0.3, 0.75], flat: true });
  // carapace ridge bumps
  for (const s of [1, -1]) for (let i = 0; i < 3; i++)
    b.part(new THREE.ConeGeometry(0.014, 0.03, 5), SHELL2, { bone: body, at: [s * (0.17 - i * 0.012), 0.1, 0.0 + i * 0.05 - 0.04], dir: [s, 0.6, 0.2] });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.03, 6, 4), SHELL2, { bone: body, at: [s * 0.05, 0.135, 0.04], scale: [1, 0.5, 1] });

  // eyes
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const stalk = b.chain(`eyeStalk${side}`, [[s * 0.06, 0.13, 0.13], [s * 0.07, 0.19, 0.16]], { parent: body, names: [`eyeStalk${side}`] });
    b.rod([s * 0.06, 0.125, 0.13], [s * 0.07, 0.185, 0.16], 0.01, { color: SHELL2, bone: stalk.joints[0] });
    b.part(new THREE.SphereGeometry(0.026, 7, 5), WHITE, { bone: stalk.joints[0], at: [s * 0.07, 0.195, 0.165] });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), DARK, { bone: stalk.joints[0], at: [s * 0.072, 0.197, 0.186] });
  }
  // mouth parts
  const jaw = b.joint("jaw", { parent: body, at: [0, 0.07, 0.15], aim: [0, 0.05, 0.2], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.1, 0.015, 0.04), SHELL2, { bone: jaw, at: [0, 0.055, 0.17] });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.03), DARK, { bone: body, at: [0, 0.08, 0.158] });

  // legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const z = 0.07 - i * 0.065;
      const hip: [number, number, number] = [s * 0.17, 0.07, z];
      const foot: [number, number, number] = [s * (0.46 - i * 0.02), 0.012, z + 0.03 - i * 0.05 + 0.06];
      const pts = limb(hip, foot, [0.14, 0.15], [[0, 1, 0]]);
      const leg = b.chain(`leg${i + 1}${side}`, pts, { parent: body, names: [`hip${i + 1}${side}`, `knee${i + 1}${side}`, `foot${i + 1}${side}`], role: "leg", contact: foot });
      b.sweep(leg, [0.022, 0.012], { color: (t) => (t > 0.85 ? TIP : SHELL), sides: 6, caps: "round" });
      b.part(new THREE.SphereGeometry(0.026, 6, 4), SHELL2, { bone: leg.joints[1], at: pts[1] });
    }
    // arm + claw
    const sh: [number, number, number] = [s * 0.17, 0.09, 0.12];
    const elbow: [number, number, number] = [s * 0.3, 0.1, 0.22];
    const wrist: [number, number, number] = [s * 0.27, 0.1, 0.38];
    const arm = b.chain(`arm${side}`, [sh, elbow, wrist], { parent: body, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" });
    b.sweep(arm, [0.035, 0.03], { color: coat, sides: 6 });
    const palmC: [number, number, number] = [s * 0.26, 0.1, 0.44];
    b.part(new THREE.SphereGeometry(0.07, 8, 6), coat, { bone: arm.tip ?? arm.joints[1], at: palmC, scale: [0.9, 0.7, 1.1], flat: true });
    // fixed finger
    const fix = b.joint(`clawFixed${side}`, { parent: arm.tip ?? arm.joints[1], at: [s * 0.255, 0.1, 0.49], aim: [s * 0.2, 0.1, 0.6], role: "digit" });
    b.spike([s * 0.245, 0.092, 0.49], [s * 0.2, 0.092, 0.6], null, 0.03, { bone: fix, color: TIP, caps: "point" });
    // movable pincer
    const pin = b.joint(`clawPincer${side}`, { parent: arm.tip ?? arm.joints[1], at: [s * 0.29, 0.115, 0.49], aim: [s * 0.3, 0.12, 0.6], role: "digit" });
    b.spike([s * 0.29, 0.118, 0.49], [s * 0.26, 0.118, 0.62], null, 0.026, { bone: pin, color: SHELL, caps: "point" });
    b.part(new THREE.ConeGeometry(0.012, 0.03, 5), TIP, { bone: pin, at: [s * 0.272, 0.108, 0.575], dir: [-s * 0.3, -1, 0] });
  }
  // keep model rest on floor
  return b.root;
}
```