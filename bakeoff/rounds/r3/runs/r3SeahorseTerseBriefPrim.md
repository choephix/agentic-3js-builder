```ts
import * as THREE from "three";
import { createBuilder, rng, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Seahorse",
  description: "A stylized low-poly seahorse with curled tail, crest, snout and fins, in rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "seahorse" });
  const R = rng(7);

  const orange = "#e8892b";
  const light = "#f5c062";
  const dark = "#b4561d";
  const cream = "#f7e3b0";
  const black = "#1b1b1f";
  const fin = "#f6d9a0";

  // Skeleton: spine from tail curl up to head
  const root = b.joint("hips", { at: [0, 0.2, 0] });
  const spinePts: number[][] = [
    [0, 0.2, 0],
    [0, 0.32, 0.02],
    [0, 0.44, 0.0],
    [0, 0.56, -0.03],
    [0, 0.68, -0.02],
    [0, 0.78, 0.02],
  ];
  // Tail chain curling (from hips, downward and curled forward)
  const tailPts: number[][] = [
    [0, 0.2, 0],
    [0, 0.1, -0.06],
    [0, 0.03, -0.04],
    [0, 0.02, 0.04],
    [0, 0.07, 0.09],
    [0, 0.13, 0.06],
    [0, 0.12, 0.02],
  ];

  const spine = b.chain("spine", catmull(spinePts.slice(0)));
  const tail = b.chain("tail", catmull(tailPts));

  // Body
  b.sweep(catmull(spinePts), 0.07, { color: orange });
  // Belly bulge
  b.part(new THREE.SphereGeometry(0.1, 8, 6), light, { at: [0, 0.5, 0.05], scale: [0.9, 1.5, 0.9] } as any);
  b.part(new THREE.SphereGeometry(0.085, 8, 6), orange, { at: [0, 0.62, 0.03], scale: [0.9, 1.1, 1] } as any);
  // Tail tube tapering
  b.sweep(catmull(tailPts), 0.05, { color: orange });
  b.part(new THREE.SphereGeometry(0.02, 6, 5), dark, { at: [0, 0.12, 0.02] });

  // Head
  b.part(new THREE.SphereGeometry(0.075, 8, 7), orange, { at: [0, 0.82, 0.05], scale: [0.9, 1, 1.1] } as any);
  // Neck-head cheek
  b.part(new THREE.BoxGeometry(0.1, 0.07, 0.09), light, { at: [0, 0.76, 0.06] });
  // Snout upper and lower
  b.part(new THREE.CylinderGeometry(0.018, 0.025, 0.17, 6), orange, { at: [0, 0.81, 0.17], aim: [0, 0.81, 0.3] } as any);
  b.rod([0, 0.82, 0.1], [0, 0.82, 0.26], 0.022, { color: orange } as any);
  b.part(new THREE.BoxGeometry(0.03, 0.008, 0.06), dark, { at: [0, 0.79, 0.2] });
  b.part(new THREE.SphereGeometry(0.02, 6, 5), dark, { at: [0, 0.82, 0.27] });

  // Eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 8, 6), cream, { at: [0.06 * s, 0.85, 0.08] });
    b.part(new THREE.SphereGeometry(0.012, 6, 5), black, { at: [0.072 * s, 0.85, 0.09] });
    // Brow spike
    b.part(new THREE.ConeGeometry(0.012, 0.05, 5), dark, { at: [0.05 * s, 0.9, 0.04] });
  }

  // Crown / coronet
  for (let i = 0; i < 5; i++) {
    const a = (i - 2) * 0.35;
    b.part(new THREE.ConeGeometry(0.016, 0.07 - Math.abs(i - 2) * 0.01, 5), dark, {
      at: [Math.sin(a) * 0.045, 0.9 + Math.cos(a) * 0.02, -0.01],
    });
  }

  // Dorsal fin on the back
  const finGeo = new THREE.BoxGeometry(0.008, 0.2, 0.11);
  b.part(finGeo, fin, { at: [0, 0.6, -0.1] });
  b.part(new THREE.BoxGeometry(0.006, 0.12, 0.07), light, { at: [0, 0.6, -0.15] });
  // Pectoral fins
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.02, 0.08, 0.06), fin, { at: [0.09 * s, 0.72, -0.01] });
  }

  // Dorsal spines along back
  for (let i = 0; i < 7; i++) {
    const y = 0.28 + i * 0.07;
    b.part(new THREE.ConeGeometry(0.014, 0.045 + R() * 0.01, 5), dark, { at: [0, y, -0.085 + (i > 3 ? 0.01 : 0)] });
  }
  // Belly bands
  for (let i = 0; i < 6; i++) {
    b.part(new THREE.TorusGeometry(0.085 - i * 0.003, 0.008, 4, 10), dark, {
      at: [0, 0.38 + i * 0.045, 0.02],
    } as any);
  }
  // Tail rings
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.SphereGeometry(0.02, 5, 4), dark, { at: [0.0, 0.04 + i * 0.001, -0.04 + i * 0.03] });
  }

  // Stand base on the floor: tail tip rests low
  b.part(new THREE.CylinderGeometry(0.12, 0.14, 0.02, 10), "#d9c79a", { at: [0, 0.01, 0.0] });

  return b.root;
}
```