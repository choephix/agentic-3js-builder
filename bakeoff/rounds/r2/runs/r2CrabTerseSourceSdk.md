```ts
import * as THREE from "three";
import { createBuilder, catmull, rng, spots, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Crab",
  description: "Stylized shore crab: domed spotted carapace, eight jointed walking legs, two open pincers, eye stalks and a jawed mouth.",
};

export default function build() {
  const b = createBuilder({ name: "crab" });
  const R = rng(5);
  const RED = "#d0452a", DARK = "#7a2a1a", CREAM = "#f3d9b0";

  const root = b.joint("root", { at: [0, 0.06, 0] });

  // Carapace
  const shellPaint = spots(mottle("#d9502d", "#b83a21", { size: 0.04, seed: 2 }), "#f0a574", { size: 0.032, amount: 0.3, seed: 4 });
  b.part(new THREE.SphereGeometry(0.1, 14, 10), shellPaint, { at: [0, 0.062, 0], scale: [1.2, 0.5, 0.85], bone: root, name: "carapace" });
  b.part(new THREE.SphereGeometry(0.1, 12, 8), CREAM, { at: [0, 0.045, 0], scale: [1.08, 0.28, 0.78], bone: root, name: "belly" });
  // brow ridge
  b.part(new THREE.BoxGeometry(0.15, 0.012, 0.014), DARK, { at: [0, 0.088, 0.072], rotation: [-15, 0, 0], bone: root, name: "brow" });
  // front-edge spikes
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.022;
    const z = 0.085 * Math.sqrt(Math.max(0, 1 - (x / 0.12) ** 2)) * 0.97;
    b.spike([x, 0.06, z], [0, 0.3, 1], 0.016, 0.006, { color: Math.abs(i) % 2 ? RED : DARK, bone: root, sides: 5 });
  }
  // back bumps
  for (let i = 0; i < 14; i++) {
    const a = R() * Math.PI * 2, r = 0.02 + R() * 0.07;
    const x = Math.cos(a) * r * 1.1, z = Math.sin(a) * r * 0.75;
    const y = 0.062 + 0.05 * Math.sqrt(Math.max(0, 1 - (x / 0.12) ** 2 - (z / 0.085) ** 2));
    b.part(new THREE.IcosahedronGeometry(0.005 + R() * 0.004, 0), "#f3b58a", { at: [x, y, z], bone: root });
  }

  // Eyes
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const base: [number, number, number] = [s * 0.032, 0.08, 0.07];
    const tip: [number, number, number] = [s * 0.04, 0.112, 0.088];
    const j = b.joint("eyeStalk" + S, { parent: root, at: base, aim: tip });
    b.rod(base, tip, 0.004, { color: CREAM, bone: j, sides: 5 });
    b.part(new THREE.SphereGeometry(0.0115, 8, 6), "#14100e", { at: tip, bone: j, name: "eye" + S });
    b.part(new THREE.SphereGeometry(0.0035, 5, 4), "#ffffff", { at: [tip[0] + s * 0.003, tip[1] + 0.005, tip[2] + 0.007], bone: j });
  }

  // Mouth: upper and lower jaw
  b.part(new THREE.BoxGeometry(0.05, 0.012, 0.02), DARK, { at: [0, 0.05, 0.082], bone: root, name: "upperJaw" });
  const jaw = b.joint("jaw", { parent: root, at: [0, 0.042, 0.078], dir: [0, 0, 1], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.044, 0.01, 0.02), "#a85a3a", { at: [0, 0.04, 0.09], bone: jaw, name: "lowerJaw" });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.012, 0.008, 0.026), CREAM, { at: [s * 0.016, 0.036, 0.096], rotation: [0, s * 10, 0], bone: jaw });

  // Walking legs
  const zs = [0.045, 0.015, -0.02, -0.05];
  const dzs = [0.035, 0.015, -0.02, -0.04];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const z = zs[i], dz = dzs[i];
      const path = catmull([
        [s * 0.095, 0.055, z],
        [s * 0.165, 0.095, z + dz * 0.6],
        [s * 0.22, 0.05, z + dz * 1.4],
        [s * 0.245, 0.003, z + dz * 2],
      ]);
      const chain = b.chain(`leg${S}${i + 1}`, path, {
        parent: root,
        role: "leg",
        names: [`hip${S}${i + 1}`, `knee${S}${i + 1}`, `ankle${S}${i + 1}`],
      });
      b.sweep(chain, {
        radius: (t: number) => 0.0085 - 0.0045 * t,
        color: RED,
        bands: [[0.75, RED], [1, DARK]],
        sides: 6,
        name: `leg${S}${i + 1}`,
      });
      b.part(new THREE.IcosahedronGeometry(0.0095, 0), DARK, { at: chain.at(0.34), bone: chain.joints[1] });
    }
  }

  // Claws
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const path = catmull([
      [s * 0.085, 0.06, 0.065],
      [s * 0.14, 0.075, 0.115],
      [s * 0.13, 0.062, 0.17],
    ]);
    const arm = b.chain("arm" + S, path, {
      parent: root,
      role: "arm",
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
    });
    b.sweep(arm, { radius: [0.014, 0.012], color: RED, sides: 6, name: "arm" + S });
    const wrist = arm.joints[2];
    b.part(new THREE.IcosahedronGeometry(0.016, 0), DARK, { at: arm.at(0.5), bone: arm.joints[1] });
    b.part(new THREE.SphereGeometry(0.03, 10, 8), shellPaint, { at: [s * 0.125, 0.06, 0.205], scale: [0.9, 0.7, 1.2], bone: wrist, name: "palm" + S });
    b.spike([s * 0.118, 0.048, 0.215], [s * 0.103, 0.046, 0.285], null, 0.012, { color: CREAM, bone: wrist, sides: 6 });
    const dact = b.joint("dactyl" + S, { parent: wrist, at: [s * 0.135, 0.072, 0.222], aim: [s * 0.108, 0.07, 0.285], role: "jaw" });
    b.spike([s * 0.135, 0.074, 0.222], [s * 0.108, 0.078, 0.29], null, 0.011, { color: CREAM, bone: dact, sides: 6 });
    for (let k = 0; k < 3; k++) {
      const f = 0.3 + k * 0.2;
      b.spike([s * (0.114 - 0.008 * f), 0.054, 0.225 + 0.05 * f], [0, 1, 0], 0.008, 0.003, { color: "#fff3dc", bone: wrist, sides: 4 });
    }
  }

  return b.root;
}
```