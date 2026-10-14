```ts
import * as THREE from "three";
import { createBuilder, catmull, polyline, limb, stripes, countershade } from "agentic-3js-builder";

export const meta = {
  name: "Dragonfly",
  description: "A perched, life-size dragonfly with striped abdomen, big compound eyes, four veined wings and six legs, rigged with wing, leg, tail and jaw joints.",
};

const GREEN = "#7fb83a";
const DARK = "#1f2a2e";
const BLUE = "#3d8fd1";
const EYE = "#2fb59a";
const EYE2 = "#1d6f7a";
const WING = "#dbe9ee";
const VEIN = "#3a4448";
const STIG = "#6b3b1c";
const LEG = "#2a2a28";
const FACE = "#c9d96a";

export default function build() {
  const b = createBuilder({ name: "dragonfly" });

  const thorax = b.joint("thorax", { at: [0, 0.045, 0], dir: [0, 0, 1], role: "spine" });

  // thorax body
  b.part(new THREE.SphereGeometry(1, 10, 8), stripes(GREEN, DARK, { size: 0.009, axis: "z" }), {
    bone: thorax, at: [0, 0.045, 0.001], scale: [0.0115, 0.012, 0.0165],
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), GREEN, { bone: thorax, at: [0, 0.055, -0.002], scale: [0.007, 0.004, 0.011] });

  // head
  const head = b.joint("head", { parent: thorax, at: [0, 0.046, 0.016], dir: [0, 0, 1], role: "head" });
  b.part(new THREE.SphereGeometry(1, 8, 6), FACE, { bone: head, at: [0, 0.045, 0.021], scale: [0.006, 0.006, 0.0055] });
  b.part(new THREE.BoxGeometry(0.01, 0.003, 0.004), FACE, { bone: head, at: [0, 0.0475, 0.026] }); // upper jaw / labrum
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.0425, 0.021], dir: [0, -0.15, 1], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.007, 0.002, 0.0045), DARK, { bone: jaw, at: [0, 0.0415, 0.0245] });
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(1, 10, 8), EYE, { bone: head, at: [s * 0.0058, 0.0475, 0.0215], scale: [0.0058, 0.0062, 0.0062] });
    b.part(new THREE.SphereGeometry(1, 6, 4), EYE2, { bone: head, at: [s * 0.0058, 0.0505, 0.0205], scale: [0.0045, 0.0022, 0.0045] });
    b.part(new THREE.SphereGeometry(1, 5, 4), "#ffffff", { bone: head, at: [s * 0.0085, 0.0495, 0.0255], scale: [0.0009, 0.0009, 0.0009] });
    b.rod([s * 0.002, 0.0505, 0.0255], [s * 0.003, 0.0535, 0.0295], 0.0004, { bone: head, color: LEG, sides: 4 });
  }

  // abdomen
  const abdPath = catmull([
    [0, 0.044, -0.008], [0, 0.045, -0.025], [0, 0.045, -0.045], [0, 0.044, -0.065], [0, 0.043, -0.082],
  ]);
  const abd = b.chain("abd", abdPath, { parent: thorax, count: 7, role: "tail" });
  b.sweep(abd, [0.0056, 0.0044, 0.0037, 0.0034, 0.003, 0.0027], {
    sides: 6,
    color: countershade(stripes(BLUE, DARK, { size: 0.009, axis: "z", width: 0.45 }), "#9cc6e0", { level: -0.4 }),
    caps: "round",
  });
  const tail = abd.joints[abd.joints.length - 1];
  for (const s of [1, -1]) {
    b.spike([s * 0.0015, 0.043, -0.083], [s * 0.35, 0, -1], 0.008, 0.0012, { bone: tail, color: DARK, sides: 5 });
  }

  // wings
  const fore = [[0, 0.006], [0.02, 0.009], [0.045, 0.0085], [0.063, 0.004], [0.066, -0.001, "sharp"], [0.045, -0.005], [0.02, -0.006], [0, -0.004]] as any;
  const hind = [[0, 0.007], [0.018, 0.0085], [0.04, 0.009], [0.06, 0.005], [0.064, -0.002, "sharp"], [0.045, -0.009], [0.02, -0.0105], [0, -0.008]] as any;
  const specs = [
    { id: "F", z: 0.011, y: 0.0545, outline: fore, len: 0.065 },
    { id: "H", z: -0.004, y: 0.0535, outline: hind, len: 0.063 },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const w of specs) {
      const root: [number, number, number] = [s * 0.007, w.y, w.z];
      const wing = b.chain(`wing${w.id}${side}`, polyline([root, [s * 0.04, w.y, w.z], [s * (0.007 + w.len), w.y, w.z]]), {
        parent: thorax, role: "wing", names: [`wing${w.id}${side}1`, `wing${w.id}${side}2`],
      });
      const j = wing.joints[0];
      b.extrude(w.outline, {
        at: root, x: [s, 0, 0], y: [0, 0, 1], thickness: 0.0007, smoothing: 1, color: WING, bone: j,
      });
      // veins
      b.rod(root, [s * (0.007 + w.len * 0.95), w.y + 0.0006, w.z + 0.0045], 0.0004, { bone: j, color: VEIN, sides: 4 });
      b.rod(root, [s * (0.007 + w.len * 0.85), w.y + 0.0006, w.z], 0.0003, { bone: j, color: VEIN, sides: 4 });
      b.rod([s * 0.012, w.y + 0.0006, w.z - 0.004], [s * (0.007 + w.len * 0.75), w.y + 0.0006, w.z - 0.0035], 0.0003, { bone: j, color: VEIN, sides: 4 });
      for (const f of [0.35, 0.55, 0.75])
        b.rod([s * (0.007 + w.len * f), w.y + 0.0006, w.z + 0.004], [s * (0.007 + w.len * f), w.y + 0.0006, w.z - 0.004], 0.00025, { bone: j, color: VEIN, sides: 4 });
      // pterostigma
      b.part(new THREE.BoxGeometry(0.006, 0.0012, 0.0017), STIG, {
        bone: j, at: [s * (0.007 + w.len * 0.86), w.y + 0.0003, w.z + 0.0035],
      });
    }

    // legs
    const zs = [0.011, 0.002, -0.006];
    zs.forEach((z, i) => {
      const hip: [number, number, number] = [s * 0.006, 0.036, z];
      const foot: [number, number, number] = [s * 0.024, 0.0008, z + (i - 1) * 0.008 + 0.004];
      const pts = limb(hip, foot, [0.0155, 0.0175, 0.012], [[s * 0.6, 1, 0.2], [s * 0.6, 1, 0.2]]);
      const leg = b.chain(`leg${i}${side}`, pts, {
        parent: thorax, role: "leg", names: [`hip${i}${side}`, `knee${i}${side}`, `ankle${i}${side}`, `foot${i}${side}`],
        contact: foot,
      });
      b.sweep(leg, [0.0014, 0.0008], { sides: 5, color: LEG });
      for (const k of [1, 2]) {
        b.part(new THREE.SphereGeometry(0.0017, 5, 4), GREEN, { bone: leg.joints[k], at: pts[k] });
      }
    });
  }

  return b.root;
}
```