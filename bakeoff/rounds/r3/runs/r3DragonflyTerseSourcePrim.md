```ts
import * as THREE from "three";
import { createBuilder, catmull, paint, stripes, countershade } from "agentic-3js-builder";

export const meta = {
  name: "Dragonfly",
  description: "Perched blue-green darner dragonfly with four outstretched wings, banded abdomen, big compound eyes and six jointed legs, rigged for animation.",
};

export default function build() {
  const b = createBuilder({ name: "dragonfly" });
  const DARK = "#1b2230";

  // ---- skeleton core ----
  b.joint("thorax", { at: [0, 0.03, 0], dir: [0, 0, 1] });
  b.joint("neck", { parent: "thorax", at: [0, 0.031, 0.011], dir: [0, 0, 1], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 0.032, 0.016], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.0295, 0.0285], dir: [0, 0, 1], role: "jaw" });

  // ---- thorax ----
  const thoraxPaint = stripes("#3aa86b", "#1d5a3a", { size: 0.006, axis: "z", width: 0.3, wobble: 0.2 });
  b.part(new THREE.SphereGeometry(1, 10, 7), thoraxPaint, {
    at: [0, 0.031, 0], scale: [0.0075, 0.0085, 0.0125], bone: "thorax", name: "thorax",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), "#2b7f55", {
    at: [0, 0.0375, 0.002], scale: [0.0045, 0.003, 0.007], bone: "thorax", name: "dorsalHump",
  });

  // ---- head ----
  b.part(new THREE.SphereGeometry(1, 8, 6), "#2f8f66", {
    at: [0, 0.031, 0.021], scale: [0.0055, 0.0052, 0.0055], bone: "head", name: "headCapsule",
  });
  const eyePaint = countershade("#1d6fb5", "#58b8a0", { soft: 0.6 });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 9, 7), eyePaint, {
      at: [s * 0.0058, 0.0335, 0.0225], scale: [0.0055, 0.0055, 0.0058], bone: "head", name: s > 0 ? "eyeL" : "eyeR",
    });
    b.part(new THREE.SphereGeometry(1, 5, 4), "#ffffff", {
      at: [s * 0.0075, 0.0365, 0.0245], scale: 0.0011, bone: "head",
    });
    b.rod([s * 0.002, 0.0365, 0.0265], [s * 0.004, 0.0425, 0.0315], 0.0002, { color: DARK, bone: "head" });
  }
  b.part(new THREE.BoxGeometry(0.007, 0.0022, 0.003), "#e6d36a", {
    at: [0, 0.0315, 0.0262], bone: "head", name: "labrum",
  });
  b.part(new THREE.BoxGeometry(0.005, 0.0016, 0.004), "#c9b84f", {
    at: [0, 0, 0.0016], bone: "jaw", name: "lowerJaw",
  });
  // ---- abdomen ----
  const abdPath = catmull([[0, 0.031, -0.01], [0, 0.0318, -0.04], [0, 0.030, -0.082]]);
  const abd = b.chain("abdomen", abdPath, { count: 5, role: "tail", parent: "thorax" });
  const abdPaint = stripes("#2a78d8", DARK, { size: 0.013, axis: "z", width: 0.45, wobble: 0.1 });
  b.sweep(abd, {
    radius: (t: number) => 0.0021 + 0.0024 * (1 - t) ** 2 + 0.0008 * Math.exp(-((t - 0.08) ** 2) / 0.004),
    color: abdPaint, sides: 8, name: "abdomenSkin",
  });
  const tip = abd.at(1).at;
  for (const s of [1, -1])
    b.spike([s * 0.0012, tip.y, tip.z + 0.001], [s * 0.15, -0.1, -1], 0.008, 0.0009, {
      color: DARK, bone: abd.joints[abd.joints.length - 1],
    });

  // ---- legs ----
  const legZ = [0.012, 0.003, -0.005];
  for (const [i, z] of legZ.entries()) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const lean = (i - 1) * 0.004;
      const path = [
        [s * 0.005, 0.026, z],
        [s * 0.014, 0.032, z + lean * 0.5],
        [s * 0.021, 0.0007, z + lean],
      ];
      const leg = b.chain(`leg${side}${i + 1}`, path, {
        parent: "thorax", role: "leg",
        names: [`hip${side}${i + 1}`, `knee${side}${i + 1}`, `foot${side}${i + 1}`],
      });
      b.sweep(leg, { radius: [0.0008, 0.0005], color: DARK, sides: 5, name: `legSkin${side}${i + 1}` });
    }
  }

  // ---- wings ----
  const fore = [[0, 0], [0.012, -0.0025], [0.035, -0.0035], [0.055, -0.001], [0.058, 0.005], [0.045, 0.0095], [0.02, 0.0105], [0.003, 0.0075]];
  const hind = [[0, -0.001], [0.012, -0.003], [0.035, -0.003], [0.054, 0.0], [0.057, 0.0075], [0.045, 0.0135], [0.02, 0.0155], [0.004, 0.0125], [0, 0.007]];
  const wing = (s: number, name: string, z: number, y: number, outline: number[][]) => {
    const side = s > 0 ? "L" : "R";
    const jn = `${name}${side}`;
    b.joint(jn, { parent: "thorax", at: [s * 0.004, y, z], dir: [s, 0, 0], role: "wing" });
    const at: [number, number, number] = [s * 0.004, y, z];
    b.extrude(outline as unknown as [number, number][], {
      color: "#bfe6ee", at, x: [s, 0, 0], y: [0, 0, -1], thickness: 0.0005, bone: jn, name: `membrane${jn}`,
    });
    const rod = (u0: number, v0: number, u1: number, v1: number, r: number) =>
      b.rod([s * (0.004 + u0), y + 0.0004, z - v0], [s * (0.004 + u1), y + 0.0004, z - v1], r, { color: DARK, bone: jn });
    rod(0, -0.001, 0.056, -0.0005, 0.00032); // costa
    rod(0.003, 0.003, 0.05, 0.005, 0.00018);
    rod(0.003, 0.0065, 0.04, 0.0095, 0.00016);
    rod(0.02, -0.001, 0.02, 0.01, 0.00014);
    rod(0.038, -0.002, 0.038, 0.008, 0.00014);
    b.part(new THREE.BoxGeometry(0.0055, 0.0007, 0.0014), "#3a2a20", {
      at: [s * 0.0475, y + 0.0003, z + 0.0013], bone: jn, name: `pterostigma${jn}`,
    });
  };
  for (const s of [1, -1]) {
    wing(s, "foreWing", 0.005, 0.0385, fore);
    wing(s, "hindWing", -0.005, 0.0375, hind);
  }

  return b.root;
}
```