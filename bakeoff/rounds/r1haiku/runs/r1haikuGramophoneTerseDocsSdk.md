```ts
import * as THREE from "three";
import { createBuilder, grain } from "agentic-3js-builder";
import { catmull } from "agentic-3js-builder";

const WOOD = grain("#7b4422", "#4b2613", { size: 0.03, axis: "x" });
const WOOD_TOP = grain("#8f5630", "#5c2f17", { size: 0.04, axis: "z" });
const BRASS = "#c9a227";
const BRASS_DARK = "#7a5c14";
const CHROME = "#9aa0a6";
const RECORD = "#141414";
const LABEL = "#b22222";

export const meta = {
  name: "gramophone",
  description: "A wind-up gramophone: mahogany cabinet, brass flared horn, turntable with record and a chrome tone arm.",
};

export default function build() {
  const b = createBuilder({ name: "gramophone" });

  // Skeleton: a root at the cabinet base, with the horn and tone arm hung from it.
  const base = b.joint("base", { at: [0, 0.03, 0], role: "spine" });

  // Horn: a neck rising from the back of the cabinet, flaring into a wide mouth.
  const horn = b.chain(
    "horn",
    catmull([
      [0, 0.24, -0.15],
      [0, 0.36, -0.16],
      [0, 0.48, -0.07],
      [0, 0.56, 0.08],
    ]),
    { parent: base, role: "tail" },
  );

  // Tone arm: pivots on the back-right of the top plate and reaches onto the record.
  const arm = b.chain(
    "arm",
    catmull([
      [0.17, 0.242, -0.14],
      [0.17, 0.32, -0.08],
      [0.13, 0.29, 0.0],
      [0.1, 0.268, 0.07],
    ]),
    { parent: base, role: "arm" },
  );

  // Cabinet body.
  b.part(new THREE.BoxGeometry(0.36, 0.2, 0.36), WOOD, { bone: base, at: [0, 0.13, 0] });

  // Top plate, a slightly lighter veneer.
  b.part(new THREE.BoxGeometry(0.38, 0.012, 0.38), WOOD_TOP, { bone: base, at: [0, 0.236, 0] });

  // Brass trim running along the front of the cabinet.
  b.part(new THREE.BoxGeometry(0.34, 0.012, 0.008), BRASS, { bone: base, at: [0, 0.2, 0.184] });

  // Four brass feet.
  for (const x of [-0.15, 0.15]) {
    for (const z of [-0.15, 0.15]) {
      b.part(new THREE.CylinderGeometry(0.022, 0.024, 0.03, 8), BRASS_DARK, {
        bone: base,
        at: [x, 0.015, z],
      });
    }
  }

  // Hand crank on the left flank with a knob.
  b.rod([0.175, 0.12, 0], [0.235, 0.12, 0], 0.008, { color: BRASS, bone: base });
  b.part(new THREE.SphereGeometry(0.018, 8, 6), BRASS, { bone: base, at: [0.24, 0.12, 0] });

  // Turntable: brass platter, black record, red label.
  b.part(new THREE.CylinderGeometry(0.13, 0.135, 0.01, 16), BRASS, { bone: base, at: [0, 0.247, 0] });
  b.part(new THREE.CylinderGeometry(0.145, 0.145, 0.006, 20), RECORD, { bone: base, at: [0, 0.256, 0] });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.004, 14), LABEL, { bone: base, at: [0, 0.2615, 0] });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 6), CHROME, { bone: base, at: [0, 0.272, 0] });

  // Horn: a flared tube, narrow at the socket and wide at the mouth.
  b.sweep(horn, (t: number) => 0.016 + 0.19 * Math.pow(t, 2.4), {
    sides: 10,
    color: BRASS,
    caps: { start: "round", end: "flat" },
  });

  // A brass collar where the horn meets the cabinet.
  b.part(new THREE.CylinderGeometry(0.03, 0.034, 0.02, 10), BRASS_DARK, {
    bone: base,
    at: [0, 0.245, -0.15],
  });

  // Tone arm: a chrome tube, a pivot knob, and a small headshell.
  b.sweep(arm, 0.007, { sides: 6, color: CHROME, caps: { start: "round", end: "round" } });
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.03, 8), BRASS, {
    bone: base,
    at: [0.17, 0.258, -0.14],
  });
  b.part(new THREE.BoxGeometry(0.024, 0.014, 0.04), BRASS, {
    bone: arm.joints[arm.joints.length - 1],
    at: [0.1, 0.27, 0.07],
  });

  return b.root;
}
```