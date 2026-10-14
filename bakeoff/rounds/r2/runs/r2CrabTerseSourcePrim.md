```ts
import * as THREE from "three";
import { createBuilder, mottle, spots } from "agentic-3js-builder";

export const meta = {
  name: "Crab",
  description: "Stylized shore crab in a rest pose: spread legs, open claws, eye stalks and a hinged jaw.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "crab", detail: 0.8 });
  const SHELL = "#d9532b", DARK = "#9c2f18", PALE = "#f2dcb8", TIP = "#4a1810";

  const body = b.joint("body", { at: [0, 0.045, 0] });

  // Carapace
  const coat = mottle(SHELL, "#c2411f", { size: 0.04, seed: 3 });
  b.part(new THREE.SphereGeometry(1, 14, 9), coat, { at: [0, 0.05, 0], scale: [0.115, 0.04, 0.085], bone: body });
  // ridge plate on top
  b.part(new THREE.SphereGeometry(1, 10, 6), spots(DARK, "#e8744a", { size: 0.025, amount: 0.5, seed: 2 }), {
    at: [0, 0.075, -0.005], scale: [0.07, 0.014, 0.05], bone: body,
  });
  // belly
  b.part(new THREE.SphereGeometry(1, 12, 6), PALE, { at: [0, 0.028, -0.005], scale: [0.095, 0.02, 0.07], bone: body });
  // abdomen flap tucked underneath
  b.part(new THREE.BoxGeometry(0.04, 0.006, 0.05), PALE, { at: [0, 0.014, -0.03], bone: body });

  // front-edge teeth
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.026;
    const z = 0.07 - Math.abs(i) * 0.012;
    b.spike([x, 0.06, z], [x * 0.5, 0.4, 1], 0.02, 0.006, { color: DARK, bone: body, sides: 4 });
  }
  // side spikes
  for (const s of [1, -1])
    b.spike([s * 0.108, 0.055, 0.0], [s, 0.3, 0], 0.025, 0.007, { color: DARK, bone: body, sides: 4 });

  // Mouth: fixed upper lip + hinged lower jaw
  b.part(new THREE.BoxGeometry(0.05, 0.01, 0.016), DARK, { at: [0, 0.04, 0.083], bone: body });
  const jaw = b.joint("jaw", { parent: body, at: [0, 0.034, 0.08], dir: [0, 0, 1], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.044, 0.008, 0.016), "#7a2412", { at: [0, 0.029, 0.09], bone: jaw });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.01, 0.006, 0.014), PALE, { at: [s * 0.012, 0.027, 0.099], bone: jaw });

  // Eyes
  for (const [s, n] of [[1, "L"], [-1, "R"]] as const) {
    const base: [number, number, number] = [s * 0.03, 0.07, 0.07];
    const top: [number, number, number] = [s * 0.036, 0.105, 0.088];
    const eye = b.joint("eye" + n, { parent: body, at: base, aim: top });
    b.capsule(base, top, [0.004, 0.003], { color: PALE, bone: eye, sides: 5 });
    b.part(new THREE.SphereGeometry(0.0095, 8, 6), "#14100e", { at: [top[0], top[1] + 0.003, top[2] + 0.003], bone: eye });
    b.part(new THREE.SphereGeometry(0.003, 5, 4), "#ffffff", { at: [top[0] + s * 0.002, top[1] + 0.008, top[2] + 0.008], bone: eye });
  }

  // Claws
  for (const [s, n] of [[1, "L"], [-1, "R"]] as const) {
    const pts: Array<[number, number, number]> = [
      [s * 0.07, 0.055, 0.06],
      [s * 0.135, 0.065, 0.12],
      [s * 0.115, 0.06, 0.195],
      [s * 0.1, 0.058, 0.225],
    ];
    const arm = b.chain("arm" + n, pts, {
      parent: body, role: "arm",
      names: ["shoulder" + n, "elbow" + n, "wrist" + n, "hand" + n],
    });
    b.capsule(pts[0], pts[1], [0.013, 0.01], { color: SHELL, bone: arm.joints[0], sides: 6 });
    b.capsule(pts[1], pts[2], [0.011, 0.01], { color: SHELL, bone: arm.joints[1], sides: 6 });
    const hand = arm.joints[3];
    // palm
    b.part(new THREE.SphereGeometry(1, 10, 7), coat, {
      at: [s * 0.098, 0.058, 0.245], scale: [0.034, 0.026, 0.045], bone: hand,
    });
    // fixed finger
    b.spike([s * 0.082, 0.052, 0.265], [s * 0.066, 0.05, 0.335], null, 0.014, { color: PALE, bone: hand, sides: 5 });
    b.spike([s * 0.07, 0.05, 0.31], [s * 0.066, 0.05, 0.338], null, 0.006, { color: TIP, bone: hand, sides: 4 });
    // moving finger
    const dac = b.joint("dactyl" + n, { parent: hand, at: [s * 0.115, 0.066, 0.262], aim: [s * 0.125, 0.066, 0.33], role: "digit" });
    b.spike([s * 0.115, 0.066, 0.262], [s * 0.128, 0.066, 0.335], null, 0.013, { color: PALE, bone: dac, sides: 5 });
    b.spike([s * 0.124, 0.066, 0.31], [s * 0.129, 0.066, 0.337], null, 0.006, { color: TIP, bone: dac, sides: 4 });
    // knuckle bumps
    b.part(new THREE.SphereGeometry(0.009, 6, 5), DARK, { at: [s * 0.12, 0.078, 0.23], bone: hand });
  }

  // Legs: 4 per side
  const zs = [0.035, 0.0, -0.035, -0.068];
  for (const [s, n] of [[1, "L"], [-1, "R"]] as const) {
    zs.forEach((z, i) => {
      const hip: [number, number, number] = [s * 0.09, 0.045, z];
      const knee: [number, number, number] = [s * 0.17, 0.09, z - 0.012 - 0.006 * i];
      const foot: [number, number, number] = [s * 0.222, 0.004, z - 0.035 - 0.02 * i];
      const k = i + 1;
      const leg = b.chain("leg" + n + k, [hip, knee, foot], {
        parent: body, role: "leg",
        names: ["hip" + n + k, "knee" + n + k, "ankle" + n + k],
      });
      b.capsule(hip, knee, [0.009, 0.007], { color: SHELL, bone: leg.joints[0], sides: 6 });
      b.capsule(knee, foot, [0.007, 0.0038], { color: i % 2 ? DARK : "#c64622", bone: leg.joints[1], sides: 6 });
      b.part(new THREE.SphereGeometry(0.009, 6, 5), DARK, { at: knee, bone: leg.joints[0] });
    });
  }

  return b.root;
}
```