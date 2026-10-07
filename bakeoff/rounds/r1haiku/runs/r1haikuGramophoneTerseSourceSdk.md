```ts
import * as THREE from "three";
import { catmull, createBuilder, gradient, grain, paint } from "agentic-3js-builder";

export const meta = {
  name: "Gramophone",
  description: "A wind-up gramophone: oak cabinet, brass turntable with a record, chrome tonearm and a flared brass-to-red horn.",
};

export default function gramophone() {
  const b = createBuilder({ name: "gramophone", detail: 1, paintSize: 1024 });
  const base = b.joint("base", { at: [0, 0, 0] });

  const brass = "#c9a227";
  const chrome = "#c9ced6";
  const black = "#1d1a17";
  const red = "#9e2a22";
  const oakSide = grain("#8b5a2b", "#5c3717", { size: 0.03, axis: "x" });
  const oakTop = grain("#a06a35", "#6b4220", { size: 0.03, axis: "z" });
  const groove = paint((p) => (Math.sin(Math.hypot(p.x, p.z) * 420) > 0.55 ? "#2a2a2a" : "#0c0c0c"));

  // Cabinet and deck.
  b.part(new THREE.BoxGeometry(0.36, 0.14, 0.36), oakSide, { at: [0, 0.07, 0], bone: base, name: "cabinet" });
  b.part(new THREE.BoxGeometry(0.39, 0.01, 0.39), oakTop, { at: [0, 0.145, 0], bone: base, name: "deck" });

  // Rubber feet.
  for (const [x, z] of [
    [-0.15, -0.15],
    [0.15, -0.15],
    [-0.15, 0.15],
    [0.15, 0.15],
  ])
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.01, b.segments(8)), black, {
      at: [x, 0.005, z],
      bone: base,
      name: "foot",
    });

  // Turntable: brass disc with a stepped felt-ready rim.
  b.lathe(
    [
      [0, 0],
      [0.14, 0],
      [0.14, 0.008],
      [0.125, 0.012],
      [0.125, 0.016],
      [0, 0.016],
    ],
    { color: brass, at: [0, 0.15, 0], segments: 24, bone: base, name: "turntable" },
  );

  // Record with grooves, and its red label.
  b.lathe(
    [
      [0, 0],
      [0.12, 0],
      [0.12, 0.003],
      [0, 0.003],
    ],
    { color: groove, at: [0, 0.166, 0], segments: 32, bone: base, name: "record" },
  );
  b.lathe(
    [
      [0, 0],
      [0.045, 0],
      [0.045, 0.001],
      [0, 0.001],
    ],
    { color: red, at: [0, 0.169, 0], segments: 24, bone: base, name: "label" },
  );

  // Tonearm: pivot post, curved arm, headshell.
  b.rod([0.12, 0.15, -0.12], [0.12, 0.23, -0.12], 0.01, { color: chrome, bone: base, caps: "flat", name: "armPost" });
  b.sweep(
    catmull([
      [0.12, 0.23, -0.12],
      [0.12, 0.26, -0.08],
      [0.09, 0.22, -0.02],
      [0.06, 0.19, 0.0],
    ]),
    [0.009, 0.006],
    { color: chrome, bone: base, caps: "round", name: "arm" },
  );
  b.part(new THREE.BoxGeometry(0.035, 0.012, 0.02), black, { at: [0.06, 0.185, 0.0], bone: base, name: "headshell" });

  // Sound pipe from the headshell up to the horn neck.
  const neck = [-0.05, 0.19, -0.12];
  b.sweep(
    catmull([
      [0.06, 0.19, 0.0],
      [0.0, 0.23, -0.06],
      neck,
    ]),
    0.005,
    { color: brass, bone: base, caps: "round", name: "pipe" },
  );

  // Horn stand, then the horn itself: a flared trumpet tilted up and forward.
  b.rod([-0.05, 0.15, -0.12], neck, 0.012, { color: brass, bone: base, caps: "flat", name: "hornStand" });
  const bell = [-0.05, 0.37, 0.12];
  b.lathe(
    [
      [0.012, 0],
      [0.016, 0.04],
      [0.03, 0.09],
      [0.065, 0.14],
      [0.11, 0.19],
      [0.16, 0.24],
      [0.2, 0.28],
      [0.205, 0.3],
      [0.19, 0.3],
      [0.15, 0.235],
      [0.1, 0.175],
      [0.06, 0.125],
      [0.025, 0.07],
      [0.008, 0.02],
      [0.006, 0],
    ],
    {
      color: gradient(brass, red, neck, bell),
      at: neck,
      axis: [0, 0.6, 0.8],
      segments: 16,
      bone: base,
      name: "horn",
    },
  );

  // Hand crank on the right side, with a wooden knob.
  b.rod([-0.18, 0.07, 0.12], [-0.26, 0.07, 0.12], 0.01, { color: brass, bone: base, caps: "flat", name: "crankShaft" });
  b.part(new THREE.SphereGeometry(0.02, b.segments(10), b.segments(8)), oakTop, {
    at: [-0.27, 0.07, 0.12],
    bone: base,
    name: "crankKnob",
  });

  return b.root;
}
```