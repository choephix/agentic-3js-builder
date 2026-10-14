```ts
import * as THREE from "three";
import { createBuilder, paint, grain } from "agentic-3js-builder";

export const meta = {
  name: "Gramophone",
  description:
    "A wooden-cabinet gramophone with a brass flared horn, turntable with a red-labelled record, tonearm with soundbox, and a side crank.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "gramophone" });

  const BRASS = "#c8932e";
  const DARK_BRASS = "#8a6218";

  b.joint("base", { at: [0, 0, 0], dir: [0, 1, 0] });
  b.joint("platter", { parent: "base", at: [0, 0.222, 0], dir: [0, 1, 0] });
  b.joint("tonearm", { parent: "base", at: [0, 0.3, -0.115], aim: [0, 0.262, 0.05] });
  b.joint("crank", { parent: "base", at: [0.17, 0.12, 0], dir: [1, 0, 0] });

  // Cabinet
  const wood = grain("#6e3b1c", "#4a2512", { size: 0.012, axis: "x", seed: 3 });
  b.part(new THREE.BoxGeometry(0.34, 0.18, 0.34), wood, { at: [0, 0.12, 0], bone: "base", name: "cabinet" });
  b.part(new THREE.BoxGeometry(0.37, 0.012, 0.37), grain("#7a4522", "#55291500".slice(0, 7), { size: 0.01, axis: "x", seed: 5 }), {
    at: [0, 0.216, 0],
    bone: "base",
    name: "lid",
  });
  // Brass trim band and front grille
  b.part(new THREE.BoxGeometry(0.345, 0.008, 0.345), BRASS, { at: [0, 0.04, 0], bone: "base", name: "trim" });
  b.part(new THREE.BoxGeometry(0.2, 0.1, 0.006), "#2a1409", { at: [0, 0.125, 0.171], bone: "base", name: "grille" });
  for (let i = 0; i < 7; i++) {
    b.part(new THREE.BoxGeometry(0.19, 0.006, 0.008), DARK_BRASS, {
      at: [0, 0.088 + i * 0.013, 0.173],
      bone: "base",
      name: "slat",
    });
  }
  // Feet
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      b.part(new THREE.CylinderGeometry(0.02, 0.016, 0.03, 8), "#3a1c0b", {
        at: [sx * 0.14, 0.015, sz * 0.14],
        bone: "base",
        name: "foot",
      });

  // Turntable
  b.lathe(
    [[0, 0], [0.13, 0], [0.13, 0.01], [0, 0.01]],
    { color: "#3a3a3a", at: [0, 0.222, 0], segments: 24, bone: "platter", name: "platter" },
  );
  const grooves = paint((p) => {
    const r = Math.hypot(p.x, p.z);
    return Math.sin(r * 700) > 0.5 ? "#232323" : "#0c0c0c";
  });
  b.lathe(
    [[0, 0], [0.125, 0], [0.125, 0.004], [0, 0.004]],
    { color: grooves, at: [0, 0.232, 0], segments: 24, bone: "platter", name: "record" },
  );
  b.lathe(
    [[0, 0], [0.04, 0], [0.04, 0.002], [0, 0.002]],
    { color: "#b3261e", at: [0, 0.236, 0], segments: 16, bone: "platter", name: "label" },
  );
  b.rod([0, 0.236, 0], [0, 0.256, 0], 0.003, { color: BRASS, bone: "platter", sides: 6, name: "spindle" });

  // Elbow and horn
  b.rod([0, 0.21, -0.12], [0, 0.385, -0.12], 0.022, { color: BRASS, bone: "base", sides: 10, name: "elbow" });
  b.part(new THREE.CylinderGeometry(0.035, 0.04, 0.02, 12), DARK_BRASS, { at: [0, 0.228, -0.12], bone: "base", name: "elbowBase" });
  const dir = new THREE.Vector3(0, 0.35, 0.94).normalize();
  b.lathe(
    [
      [0.016, 0], [0.02, 0.08], [0.032, 0.16], [0.06, 0.24], [0.11, 0.32], [0.17, 0.38], [0.23, 0.42],
      [0.226, 0.426], [0.166, 0.382], [0.106, 0.322], [0.056, 0.242], [0.028, 0.162], [0.014, 0.08], [0.01, 0],
    ],
    { color: BRASS, at: [0, 0.38, -0.12], axis: dir, segments: 20, bone: "base", name: "horn" },
  );
  // Rim bead
  b.part(new THREE.TorusGeometry(0.229, 0.007, 5, 24), DARK_BRASS, {
    at: new THREE.Vector3(0, 0.38, -0.12).addScaledVector(dir, 0.424),
    dir,
    axis: "z",
    bone: "base",
    name: "rim",
  });

  // Tonearm
  b.part(new THREE.SphereGeometry(0.018, 8, 6), DARK_BRASS, { at: [0, 0.3, -0.115], bone: "tonearm", name: "collar" });
  b.rod([0, 0.3, -0.115], [0, 0.262, 0.05], 0.007, { color: BRASS, bone: "tonearm", sides: 6, name: "arm" });
  b.lathe(
    [[0, 0], [0.016, 0], [0.016, 0.014], [0.008, 0.014], [0, 0.014]],
    { color: "#222222", at: [0, 0.262, 0.05], axis: [0, -1, 0], segments: 8, bone: "tonearm", name: "soundbox" },
  );
  b.spike([0, 0.248, 0.05], [0, -1, 0], 0.011, 0.002, { color: "#cccccc", bone: "tonearm", sides: 4, name: "needle" });

  // Crank
  b.rod([0.17, 0.12, 0], [0.215, 0.12, 0], 0.007, { color: BRASS, bone: "crank", sides: 6, name: "crankShaft" });
  b.rod([0.215, 0.12, 0], [0.215, 0.12, 0.055], 0.006, { color: BRASS, bone: "crank", sides: 6, name: "crankArm" });
  b.rod([0.215, 0.12, 0.055], [0.245, 0.12, 0.055], 0.008, { color: "#3a1c0b", bone: "crank", sides: 8, name: "crankHandle" });
  b.part(new THREE.SphereGeometry(0.012, 8, 6), "#3a1c0b", { at: [0.248, 0.12, 0.055], bone: "crank", name: "crankKnob" });

  return b.root;
}
```