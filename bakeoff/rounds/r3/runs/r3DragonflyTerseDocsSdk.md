```ts
import * as THREE from "three";
import { createBuilder, limb, paint, stripes, countershade, cells } from "agentic-3js-builder";

export const meta = {
  name: "Dragonfly",
  description: "A blue-and-green darner dragonfly at rest: big faceted compound eyes, a striped thorax, a banded abdomen, four veined wings and six IK-planted legs.",
};

const DARK = "#1d2420";
const BLUE = "#2e74c9";
const GREEN = "#7fae2c";
const BROWN = "#3b3a1c";
const GLASS = "#d6ecf0";
const VEIN = "#3a4a4f";
const PTERO = "#5a3a1e";
const AMBER = "#c98a2c";

export default function build() {
  const b = createBuilder({ name: "dragonfly" });
  const thorax = b.joint("thorax", { at: [0, 0.04, 0], role: "spine" });

  // ---- head ----
  const head = b.joint("head", { parent: thorax, at: [0, 0.044, 0.016], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.04, 0.032], aim: [0, 0.038, 0.04], role: "jaw" });

  // ---- abdomen ----
  const tail = b.chain(
    "tail",
    b.joint ? [[0, 0.0425, -0.012], [0, 0.0415, -0.03], [0, 0.0405, -0.05], [0, 0.04, -0.078]] : [],
    { parent: thorax, count: 6, names: (i: number) => "tail" + (i + 1), role: "tail" },
  );
  b.sweep(tail, [0.0055, 0.0032, 0.0026, 0.0026, 0.0028, 0.0024], {
    sides: 6,
    color: stripes(BLUE, DARK, { size: 0.012, axis: "z", width: 0.35 }),
  });
  const lastTail = tail.joints[tail.joints.length - 1];
  for (const s of [1, -1]) {
    b.spike(tail.at(1), [s * 0.25, 0, -1], 0.008, 0.0013, { color: DARK, bone: lastTail });
  }

  // ---- thorax ----
  b.part(new THREE.SphereGeometry(1, 10, 7), stripes(GREEN, BROWN, { size: 0.009, axis: "z", width: 0.3 }), {
    bone: thorax,
    at: [0, 0.0405, 0.001],
    scale: [0.0085, 0.0095, 0.0145],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), DARK, { bone: thorax, at: [0, 0.0475, 0.0], scale: [0.004, 0.003, 0.009], flat: true });

  // ---- head parts ----
  const eyePaint = countershade("#2b63c9", "#3ca58a", { level: 0.1 });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0085, 10, 7), eyePaint, {
      bone: head, at: [s * 0.0065, 0.0455, 0.0275], scale: [0.85, 1, 1], flat: true,
    });
    // mandible
    b.spike([s * 0.0025, 0.0385, 0.0365], [s * -0.3, -0.2, 1], 0.005, 0.0012, { color: DARK, bone: jaw });
    // antenna
    b.rod([s * 0.002, 0.0505, 0.0345], [s * 0.003, 0.0535, 0.0385], 0.0003, { color: DARK, bone: head });
  }
  b.part(new THREE.SphereGeometry(1, 8, 6), "#c9e060", { bone: head, at: [0, 0.0425, 0.0345], scale: [0.006, 0.0055, 0.005], flat: true });
  b.part(new THREE.BoxGeometry(0.007, 0.0016, 0.004), "#7a8f2a", { bone: head, at: [0, 0.0402, 0.0385] });
  b.part(new THREE.BoxGeometry(0.0065, 0.0015, 0.005), "#e8d27a", { bone: jaw, at: [0, 0.0385, 0.0375] });
  for (const [x, z] of [[0, 0.0305], [-0.0035, 0.027], [0.0035, 0.027]] as number[][]) {
    b.part(new THREE.SphereGeometry(0.0016, 6, 4), "#f1f0d0", { bone: head, at: [x, 0.0522, z], flat: true });
  }

  // ---- wings ----
  const foreOutline: any = [
    [0, 0.004], [0.02, 0.006], [0.04, 0.005], [0.05, 0.002], [0.052, -0.003],
    [0.045, -0.008], [0.03, -0.011], [0.012, -0.012], [0, -0.006],
  ];
  const hindOutline: any = [
    [0, 0.003], [0.02, 0.005], [0.04, 0.003], [0.05, -0.002], [0.047, -0.008],
    [0.035, -0.014], [0.015, -0.018], [0, -0.012],
  ];
  const wingPaint = (y0: number, y1: number, hind: boolean) =>
    paint((p, _n, s) => {
      const c = cells(p, 0.007, 3);
      if (c.d2 - c.d1 < 0.0009) return VEIN;
      if (s[0] > 0.039 && s[0] < 0.046 && s[1] > y0 && s[1] < y1) return PTERO;
      if (hind && s[0] < 0.009) return AMBER;
      return GLASS;
    });
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const defs: [string, number, any, any, number][] = [
      ["F", 0.006, foreOutline, wingPaint(0.0028, 0.0058, false), 0.1],
      ["H", -0.006, hindOutline, wingPaint(0.0012, 0.0045, true), -0.12],
    ];
    for (const [tag, z, outline, pnt, tilt] of defs) {
      const j = b.joint(`wing${tag}${S}`, {
        parent: thorax, at: [s * 0.007, 0.0485, z], dir: [s, 0.08, tilt], role: "wing",
      });
      b.extrude(outline, {
        at: j.at, x: [s, 0, 0], y: [0, 0, 1], thickness: 0.0006, smoothing: 1, color: pnt, bone: j,
      });
      b.rod(j.at, [j.at.x + s * 0.05, j.at.y, j.at.z + 0.004], 0.0005, { color: VEIN, bone: j });
    }
  }

  // ---- legs ----
  const legZ = [0.011, 0.001, -0.008];
  const footZ = [0.024, 0.006, -0.012];
  const legNames = ["F", "M", "H"];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (let i = 0; i < 3; i++) {
      const hip: [number, number, number] = [s * 0.005, 0.033, legZ[i]];
      const foot: [number, number, number] = [s * 0.02, 0.0009, footZ[i]];
      const pts = limb(hip, foot, [0.014, 0.015, 0.013], [s * 0.5, 1, 0.2]);
      const n = legNames[i] + S;
      const leg = b.chain("leg" + n, pts, {
        parent: thorax, role: "leg",
        names: ["hip" + n, "knee" + n, "ankle" + n, "foot" + n],
      });
      b.sweep(leg, [0.0017, 0.0009], { sides: 6, color: i === 0 ? "#2a3a22" : DARK });
    }
  }

  return b.root;
}
```