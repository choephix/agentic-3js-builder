```ts
import * as THREE from "three";
import { createBuilder, catmull, spiral, rng, stripes, countershade } from "agentic-3js-builder";

export const meta = { name: "Seahorse", description: "A stylized upright seahorse with curled tail, dorsal fin, crown and snout." };

export default function build() {
  const b = createBuilder({ name: "seahorse" });
  const SKIN = "#f2a93b", BELLY = "#ffd98a", DARK = "#b8581f", FIN = "#ffe3a8", EYE = "#1b1b2a", RING = "#d9792b";

  // Spine from head to curled tail; stands on its tail curl, total ~0.3 m high
  const pts: number[][] = [
    [0, 0.30, 0.02], [0, 0.26, 0.0], [0, 0.20, -0.02], [0, 0.14, -0.01],
    [0, 0.09, -0.005], [0, 0.055, -0.03], [0, 0.03, -0.06],
  ];
  const root = b.joint("hips", { at: [0, 0.14, -0.01], dir: [0, 1, 0] });
  const body = catmull(pts);
  const upT = body.closestT(root.at);
  const upper = b.chain("spine", body.slice(upT, 0), { parent: root, count: 4, role: "spine" });

  // tail curl: a spiral from the tail base
  const tailStart: [number, number, number] = [0, 0.055, -0.03];
  const curl = spiral([0, 0.035, -0.1], [0, 0.055, -0.03], [1, 0, 0], { turns: 1.1, r1: 0.015 });
  const tail = b.chain("tail", curl, { parent: upper.joints[upper.joints.length - 1], count: 6, role: "tail" });
  void tailStart;

  const coat = countershade(stripes(SKIN, DARK, { size: 0.03, axis: "y" }), BELLY, { level: -0.2 });
  const radii = [0.03, 0.036, 0.038, 0.034, 0.028, 0.022];
  b.sweep(upper, (t) => 0.032 - 0.012 * t + 0.01 * Math.sin(t * 3), { color: coat, sides: 8 });
  b.sweep(tail, (t) => 0.02 * (1 - t) + 0.004, { color: coat, caps: "point" });
  void radii;

  // neck/head: head bone at top
  const neckTop = b.joint("neck", { parent: root, at: [0, 0.22, -0.02], aim: [0, 0.29, 0.0], role: "neck" });
  const head = b.joint("head", { parent: neckTop, at: [0, 0.285, 0.0], dir: [0, 0.2, 1], role: "head" });
  b.part(new THREE.SphereGeometry(0.036, 8, 6), SKIN, { bone: head, at: [0, 0.295, 0.01], scale: [1, 1.05, 1.1], flat: true });
  b.part(new THREE.SphereGeometry(0.033, 8, 6), SKIN, { bone: neckTop, at: [0, 0.24, -0.005], flat: true });

  // snout: upper tube and separate lower jaw
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.285, 0.05], aim: [0, 0.28, 0.1], role: "jaw" });
  b.rod([0, 0.296, 0.035], [0, 0.288, 0.125], [0.018, 0.012], { bone: head, color: SKIN, sides: 6 });
  b.rod([0, 0.284, 0.045], [0, 0.282, 0.118], [0.01, 0.008], { bone: jaw, color: DARK, sides: 6 });
  b.part(new THREE.SphereGeometry(0.013, 6, 4), DARK, { bone: head, at: [0, 0.288, 0.128], flat: true });

  // eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.012, 8, 6), "#ffffff", { bone: head, at: [s * 0.03, 0.3, 0.03] });
    b.part(new THREE.SphereGeometry(0.0075, 6, 4), EYE, { bone: head, at: [s * 0.036, 0.3, 0.036] });
    // cheek fin
    b.extrude([[0, 0], [0.02, 0.012], [0.03, 0], [0.02, -0.012]], {
      at: [s * 0.035, 0.27, 0.0], x: [s, 0, 0], y: [0, 1, 0.2], thickness: 0.003, color: FIN, bone: neckTop, smoothing: 1,
    });
    // pectoral fin
    b.extrude([[0, 0], [-0.03, 0.025], [-0.05, 0.005], [-0.03, -0.02]], {
      at: [s * 0.03, 0.22, -0.01], x: [s * 0.4, 0, -1], y: [0, 1, 0], thickness: 0.002, color: FIN, bone: root, smoothing: 1,
    });
  }

  // crown: spikes on head
  const crownRng = rng(5);
  for (let i = 0; i < 5; i++) {
    const a = (i - 2) * 0.012;
    b.spike([a, 0.325, -0.005 - Math.abs(i - 2) * 0.004], [a * 1.5, 1, -0.4], 0.025 + crownRng() * 0.01, 0.007, { bone: head, color: DARK });
  }

  // belly pouch
  b.part(new THREE.SphereGeometry(0.04, 8, 6), BELLY, { bone: root, at: [0, 0.14, 0.02], scale: [0.85, 1.1, 0.9], flat: true });

  // dorsal fin on the back
  b.extrude([[0, 0], [0.04, 0.0], [0.045, 0.045, "sharp"], [0.02, 0.05], [0.0, 0.04]], {
    at: [0, 0.1, -0.045], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.003, color: FIN, bone: root, smoothing: 1,
  });
  // spiny ridge and body rings
  for (let i = 0; i < 6; i++) {
    const y = 0.25 - i * 0.025;
    b.spike([0, y, -0.03 - 0.004 * Math.sin(i)], [0, 0.3, -1], 0.018, 0.006, { bone: i < 2 ? neckTop : root, color: DARK });
    b.part(new THREE.TorusGeometry(0.036 - i * 0.002, 0.003, 4, 10), RING, {
      bone: i < 2 ? neckTop : root, at: [0, y - 0.01, -0.005], rotation: [90, 0, 0], flat: true,
    });
  }
  return b.root;
}
```