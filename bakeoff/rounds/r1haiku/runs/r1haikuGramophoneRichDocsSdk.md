```ts
import * as THREE from "three";
import { createBuilder, frame, catmull, paint, grain, spots, mottle } from "agentic-3js-builder";

const WALNUT = "#5a3a22";
const WALNUT_DARK = "#3b2516";
const PALE = "#e8dcc2";
const BRASS = "#b98a3c";
const PATINA = "#6e9a80";
const SILVER = "#c9ccd2";
const BLACK = "#141414";
const GROOVE = "#2b2b2b";
const RED = "#a3212b";

// Warm brass with green verdigris showing through.
const brass = mottle(BRASS, PATINA, { size: 0.06, contrast: 0.6, seed: 5 });

// Walnut grain with a pale rosette inlay on the front face.
const inlay = spots(WALNUT, PALE, { size: 0.07, amount: 0.3, rosette: true, seed: 3 });
const walnut = grain(WALNUT, WALNUT_DARK, { size: 0.03, axis: "x", seed: 2 });
const wood = paint((_p, n) => (n.z > 0.5 ? inlay : walnut));

// Record grooves: concentric rings around the spindle.
const vinyl = paint((p) => (Math.sin(Math.hypot(p.x, p.z - 0.02) * 420) > 0.6 ? GROOVE : BLACK));

export const meta = {
  name: "gramophone",
  description: "Antique wind-up gramophone: a walnut cabinet, a brass morning-glory horn, a record on a silver tonearm.",
};

export default function build() {
  const b = createBuilder({ name: "gramophone" });

  // Skeleton: a root for the cabinet, plus the horn and tonearm pivots.
  const hips = b.joint("hips", { at: [0, 0.3, 0] });
  const horn = b.joint("horn", { parent: hips, at: [0, 0.5, -0.16] });
  const arm = b.joint("tonearm", { parent: hips, at: [0.19, 0.525, -0.13] });

  // Cabinet body, top board and a darker base moulding.
  b.part(new THREE.BoxGeometry(0.5, 0.42, 0.44), wood, { at: [0, 0.29, 0], bone: hips });
  b.part(new THREE.BoxGeometry(0.53, 0.025, 0.47), wood, { at: [0, 0.5125, 0], bone: hips });
  b.part(new THREE.BoxGeometry(0.53, 0.03, 0.47), WALNUT_DARK, { at: [0, 0.095, 0], bone: hips });

  // Morning-glory horn: a flaring sweep from the back of the cabinet to a lipped mouth.
  const hornPath = catmull([
    [0, 0.5, -0.16],
    [0, 0.66, -0.13],
    [0, 0.9, 0.02],
    [0, 1.08, 0.24],
    [0, 1.16, 0.4],
  ]);
  b.sweep(hornPath, (t) => 0.03 + 0.27 * Math.pow(t, 3), {
    bone: horn,
    color: brass,
    caps: { start: "round", end: "none" },
    detail: 1.5,
  });

  // Flared petal lip around the mouth: scalloped spikes on a closed rim.
  const mouth = frame([0, 1.16, 0.4], [0, 0.5, 0.9]);
  const lip = b.ring(mouth, { count: 16, radius: 0.3, tilt: 25 });
  for (const it of lip.items) b.spike(it, it, 0.075, 0.022, { color: brass });
  b.sweep(catmull(lip.items, { closed: true }), 0.014, { color: brass });

  // Turntable, record, red label and spindle.
  b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.015, 28), brass, { at: [0, 0.5325, 0.02], bone: hips });
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.007, 36), vinyl, { at: [0, 0.5425, 0.02], bone: hips });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.002, 24), RED, { at: [0, 0.5465, 0.02], bone: hips });
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.02, 8), brass, { at: [0, 0.557, 0.02], bone: hips });

  // Silver tonearm: a pivot post, a curved arm and a headshell over the record.
  b.rod([0.19, 0.525, -0.13], [0.19, 0.6, -0.13], 0.012, { color: SILVER, bone: arm });
  b.sweep(
    catmull([
      [0.19, 0.6, -0.13],
      [0.17, 0.585, -0.06],
      [0.12, 0.565, 0.0],
      [0.08, 0.556, 0.02],
    ]),
    0.008,
    { color: SILVER, bone: arm },
  );
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.05), SILVER, { at: [0.08, 0.555, 0.02], bone: arm });

  // Wind-up crank on the right side of the cabinet: a disc, an axle, a handle and a knob.
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 14), brass, {
    at: [-0.262, 0.3, 0.1],
    dir: [-1, 0, 0],
    bone: hips,
  });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 10), brass, {
    at: [-0.29, 0.3, 0.1],
    dir: [-1, 0, 0],
    bone: hips,
  });
  b.rod([-0.31, 0.3, 0.1], [-0.36, 0.3, 0.1], 0.01, { color: brass, bone: hips });
  b.part(new THREE.SphereGeometry(0.022, 10, 8), WALNUT_DARK, { at: [-0.37, 0.3, 0.1], bone: hips });

  // Four brass claw feet, one under each corner of the cabinet.
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      const x = sx * 0.2;
      const z = sz * 0.16;
      b.rod([x, 0.1, z], [x, 0.035, z], 0.022, { color: brass, bone: hips });
      b.part(new THREE.SphereGeometry(0.03, 10, 8), brass, { at: [x, 0.03, z], bone: hips });
      const base: [number, number, number] = [x, 0.035, z];
      b.spike(base, [x + sx * 0.07, 0.003, z], null, 0.013, { color: brass });
      b.spike(base, [x, 0.003, z + sz * 0.07], null, 0.013, { color: brass });
      b.spike(base, [x + sx * 0.05, 0.003, z + sz * 0.05], null, 0.013, { color: brass });
    }
  }

  return b.root;
}
```