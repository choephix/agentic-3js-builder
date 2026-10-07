```ts
// A gramophone: a mahogany cabinet on four feet, a felt baseboard with a brass platter, a record and a tonearm that
// swings over it, and a crimson flared horn rising from the back of the cabinet, its bell turned up and out to the
// front. Brass shows on the platter, arm, collar, bell rim and inside the bell. Grain, record grooves and the horn's
// two-tone finish are painted into the paint sheet.

import * as THREE from "three";
import { aim, catmull, createBuilder, grain, mix, paint, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Gramophone",
  description: "A wind-up gramophone: mahogany cabinet, brass turntable and tonearm with a record, and a crimson flared horn.",
};

// Dimensions in meters. The cabinet is 0.40 square and 0.20 tall; the horn leans back to front at 45 degrees.
const HALF = 0.2; // cabinet half width and half depth
const BASE = 0.02; // underside of the cabinet, on the feet
const FOOT = 0.022; // feet top (they tuck 2 mm into the cabinet)
const TOP = 0.22; // top of the cabinet
const BOARD = TOP + 0.004; // top of the felt baseboard
const PLATTER = BOARD + 0.012; // top of the brass platter
const RECORD = PLATTER + 0.005; // top of the record
const PIVOT = new THREE.Vector3(0.16, 0.25, -0.15); // tonearm pivot, back right of the platter

const HORN_LEN = 0.32;
const BELL_R = 0.17;
const THROAT_R = 0.012;
const WALL = 0.004;
const THROAT = new THREE.Vector3(0, TOP + 0.03, -0.176);
const AXIS = new THREE.Vector3(0, Math.SQRT1_2, Math.SQRT1_2);

const LIGHT = new THREE.Vector3(0.45, 0.75, 0.5).normalize();
const BRASS_DEEP = "#7a5520";
const BRASS = "#cc9b42";
const BRASS_HI = "#f4dc96";
const ENAMEL_DEEP = "#4a1210";
const ENAMEL = "#9a2a23";
const ENAMEL_HI = "#cc5340";
const MAHOGANY_DARK = "#4c2212";
const MAHOGANY_LIGHT = "#86492a";
const VINYL_A = "#121216";
const VINYL_B = "#23232b";
const LABEL = "#eadcb8";
const IRON = "#2b2927";
const FELT = "#221f20";

/** Three-step ramp: `deep` at 0, `mid` at 0.5, `hi` at 1. */
function ramp(t: number, deep: string, mid: string, hi: string) {
  const x = Math.min(Math.max(t, 0), 1);
  return x < 0.5 ? mix(deep, mid, x * 2) : mix(mid, hi, x * 2 - 1);
}

/** Polished brass: deep where it turns from the light, bright where it faces it. */
const brass = paint((_, n) => ramp(smoothstep(0.1, 0.9, n.dot(LIGHT)), BRASS_DEEP, BRASS, BRASS_HI));

/** The horn: crimson enamel outside, polished brass inside the bell and in bands at the throat and the mouth. */
const horn = paint((p, n, s) => {
  const lit = smoothstep(0.1, 0.9, n.dot(LIGHT));
  const onAxis = THROAT.clone().addScaledVector(AXIS, s[0]);
  const inside = p.clone().sub(onAxis).dot(n) < 0;
  if (inside || s[0] < 0.035 || s[0] > HORN_LEN - 0.01) return ramp(lit, BRASS_DEEP, BRASS, BRASS_HI);
  return ramp(lit, ENAMEL_DEEP, ENAMEL, ENAMEL_HI);
});

/** Mahogany with the grain running across the cabinet. */
const wood = grain(MAHOGANY_DARK, MAHOGANY_LIGHT, { size: 0.03, axis: "x", seed: 4 });

/** The record: fine grooves about the spindle, and a cream label with a red ring. */
const vinyl = paint((p) => {
  const r = Math.hypot(p.x, p.z);
  if (r < 0.012) return IRON;
  if (r < 0.046) return r > 0.03 && r < 0.034 ? ENAMEL : LABEL;
  return mix(VINYL_A, VINYL_B, 0.5 + 0.5 * Math.sin(r * 700));
});

/** A rounded square in the (x, z) plane, counter-clockwise seen from above. */
function roundedRect(half: number, radius: number, steps: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const corners: Array<[number, number, number]> = [
    [half - radius, half - radius, 0],
    [-half + radius, half - radius, 90],
    [-half + radius, -half + radius, 180],
    [half - radius, -half + radius, 270],
  ];
  for (const [cx, cy, start] of corners)
    for (let k = 0; k <= steps; k++) {
      const a = ((start + (90 * k) / steps) * Math.PI) / 180;
      out.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a)]);
    }
  return out;
}

/**
 * The bell's wall as one closed profile in (radius, height along the axis): out along the exponential flare, over a
 * rolled lip, and back down the inside of the wall. The result is a thin shell with a face on each side.
 */
function hornOutline(): Array<[number, number]> {
  const steps = 14;
  const flare = (s: number) => THROAT_R * Math.pow(BELL_R / THROAT_R, s);
  const outer: Array<[number, number]> = [];
  const inner: Array<[number, number]> = [];
  for (let k = 0; k <= steps; k++) outer.push([flare(k / steps), (k / steps) * HORN_LEN]);
  const lip: Array<[number, number]> = [
    [BELL_R + 0.008, HORN_LEN + 0.004],
    [BELL_R + 0.004, HORN_LEN + 0.008],
    [BELL_R - WALL, HORN_LEN + 0.008],
  ];
  for (let k = steps; k >= 0; k--) inner.push([flare(k / steps) - WALL, (k / steps) * HORN_LEN]);
  return [...outer, ...lip, ...inner];
}

export default function gramophone() {
  const b = createBuilder({ name: "gramophone", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const arm = b.joint("tonearm", { at: [PIVOT.x, PIVOT.y, PIVOT.z], parent: root });

  // Cabinet: a mahogany slab with rounded corners and eased top and bottom edges.
  const cabinet = b.extrude(roundedRect(HALF, 0.045, 4), {
    name: "cabinet",
    color: wood,
    at: [0, (BASE + TOP) / 2, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: TOP - BASE,
    bevel: 0.02,
    bone: root,
  });

  // Felt baseboard the platter sits on.
  b.extrude(roundedRect(HALF - 0.015, 0.03, 3), {
    name: "baseboard",
    color: FELT,
    at: [0, TOP + 0.002, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: BOARD - TOP,
    bone: root,
  });

  // Four feet.
  for (const x of [-0.15, 0.15])
    for (const z of [-0.15, 0.15])
      b.part(new THREE.CylinderGeometry(0.024, 0.027, FOOT, b.segments(12)), IRON, {
        at: [x, FOOT / 2, z],
        bone: root,
        name: "foot",
      });

  // Brass rivets along the front, seated on the cabinet's real surface.
  const front = b.surface(cabinet);
  for (const x of [-0.13, -0.08, 0.08, 0.13])
    b.stick(new THREE.SphereGeometry(0.0065, b.segments(8), b.segments(6)), brass, front.nearest([x, 0.07, 0.4]), {
      embed: 0.6,
      bone: root,
      name: "rivet",
    });

  // Front badge: an enamel disc in a brass ring.
  b.part(new THREE.CircleGeometry(0.024, b.segments(24)), ENAMEL, {
    at: [0, 0.13, HALF + 0.001],
    bone: root,
    name: "badge",
  });
  b.part(new THREE.TorusGeometry(0.026, 0.0035, b.segments(6), b.segments(28)), brass, {
    at: [0, 0.13, HALF + 0.002],
    bone: root,
    name: "badgeRing",
  });

  // Hand crank on the right-hand side: an escutcheon, a bent brass arm and a dark wooden knob.
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.01, b.segments(20)), brass, {
    at: [-HALF - 0.002, 0.12, 0.1],
    rotation: [0, 0, 90],
    bone: root,
    name: "crankPlate",
  });
  b.sweep(
    catmull([
      [-HALF, 0.12, 0.1],
      [-0.235, 0.12, 0.1],
      [-0.256, 0.11, 0.1],
      [-0.262, 0.092, 0.1],
    ]),
    0.0055,
    { color: brass, bone: root, name: "crank" },
  );
  b.part(new THREE.SphereGeometry(0.0155, b.segments(14), b.segments(10)), MAHOGANY_DARK, {
    at: [-0.262, 0.084, 0.1],
    bone: root,
    name: "crankKnob",
  });

  // Turntable: brass platter with a rolled rim, the record with its label, and the spindle.
  b.part(new THREE.CylinderGeometry(0.148, 0.148, PLATTER - BOARD, b.segments(40)), brass, {
    at: [0, (BOARD + PLATTER) / 2, 0],
    bone: root,
    name: "platter",
  });
  const rim = new THREE.TorusGeometry(0.146, 0.0045, b.segments(8), b.segments(40));
  rim.rotateX(Math.PI / 2);
  b.part(rim, brass, { at: [0, PLATTER - 0.004, 0], bone: root, name: "platterRim" });
  b.part(new THREE.CylinderGeometry(0.14, 0.14, RECORD - PLATTER, b.segments(48)), vinyl, {
    at: [0, (PLATTER + RECORD) / 2, 0],
    bone: root,
    name: "record",
  });
  b.part(new THREE.CylinderGeometry(0.0045, 0.0045, 0.05, b.segments(10)), brass, {
    at: [0, 0.248, 0],
    bone: root,
    name: "spindle",
  });

  // Tonearm: a brass pivot post, an S-shaped arm and a sound box with its stylus in the groove.
  b.part(new THREE.CylinderGeometry(0.02, 0.022, 0.008, b.segments(16)), brass, {
    at: [PIVOT.x, BOARD + 0.004, PIVOT.z],
    bone: root,
    name: "pivotBase",
  });
  b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.05, b.segments(12)), brass, {
    at: [PIVOT.x, PIVOT.y, PIVOT.z],
    bone: arm,
    name: "pivot",
  });
  b.sweep(
    catmull([
      [0.16, 0.262, -0.15],
      [0.158, 0.292, -0.118],
      [0.13, 0.305, -0.086],
      [0.098, 0.292, -0.058],
      [0.076, 0.276, -0.04],
      [0.068, 0.268, -0.03],
    ]),
    0.0055,
    { color: brass, bone: arm, name: "tonearm" },
  );
  b.part(new THREE.CylinderGeometry(0.0125, 0.0095, 0.024, b.segments(12)), brass, {
    at: [0.068, 0.257, -0.03],
    bone: arm,
    name: "soundbox",
  });
  b.spike([0.068, 0.245, -0.03], [0, -1, 0], 0.0075, 0.0028, { color: IRON, bone: arm, name: "stylus" });

  // Horn: a brass collar on the cabinet, a brass ferrule at the throat, the crimson bell and a brass brace.
  b.part(new THREE.CylinderGeometry(0.026, 0.029, 0.03, b.segments(16)), brass, {
    at: [0, TOP + 0.015, THROAT.z],
    bone: root,
    name: "collar",
  });
  b.lathe(hornOutline(), {
    name: "horn",
    color: horn,
    at: THROAT,
    axis: AXIS,
    segments: 20,
    bone: root,
  });
  b.part(new THREE.CylinderGeometry(0.02, 0.022, 0.022, b.segments(16)), brass, {
    at: THROAT.clone().addScaledVector(AXIS, 0.004),
    quat: aim(AXIS),
    bone: root,
    name: "ferrule",
  });
  b.sweep(
    catmull([
      [0, TOP, -0.19],
      [0, 0.29, -0.165],
      [0, 0.36, -0.1],
    ]),
    0.0055,
    { color: brass, bone: root, name: "strut" },
  );

  return b.root;
}
```