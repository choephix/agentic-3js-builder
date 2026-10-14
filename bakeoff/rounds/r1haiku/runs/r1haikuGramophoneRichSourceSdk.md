```ts
import * as THREE from "three";
import { createBuilder, grain, mottle, paint, cells, mix, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Antique gramophone",
  description:
    "A wind-up gramophone on a carved walnut cabinet with a pale floral inlay, a flaring morning-glory brass horn with a green patina, a black record with a red label, a silver tonearm, a side crank and claw feet.",
};

// Walnut grain with a pale floral inlay pressed into it.
const walnut = grain("#3b2314", "#6b4228", { size: 0.03, axis: "x", seed: 4 });
const inlay = paint((p, n) => {
  const c = cells(p, 0.09, 5);
  const petal = smoothstep(0.32, 0.22, c.d1);
  const centre = smoothstep(0.1, 0.06, c.d1);
  const flower = mix("#efe6cf", "#d9a441", centre);
  return mix(walnut.at(p, n), flower, petal);
});

// Brass with a warm, slightly green patina.
const brass = mottle("#c99a46", "#5d8d6c", { size: 0.05, seed: 3, contrast: 0.9 });
const silver = "#cdd2d8";
const black = "#121212";
const red = "#b8242c";
const dark = "#2a160c";

export default function gramophone() {
  const b = createBuilder({ name: "gramophone", paintSize: 1024 });

  // Skeleton: base, horn and tonearm joints.
  b.joint("base", { at: [0, 0, 0] });
  b.joint("horn", { parent: "base", at: [0, 0.5, -0.14], dir: [0, 0.515, 0.857] });
  b.joint("arm", { parent: "base", at: [-0.2, 0.445, -0.13] });

  // Cabinet: carved walnut with the inlay, standing on its feet (bottom at y = 0.07).
  b.part(new THREE.BoxGeometry(0.5, 0.35, 0.42), inlay, { at: [0, 0.245, 0], bone: "base", name: "cabinet" });
  // Brass trim along the front foot of the cabinet.
  b.part(new THREE.BoxGeometry(0.46, 0.012, 0.006), brass, { at: [0, 0.09, 0.214], bone: "base", name: "trim" });

  // Turntable: brass platter, black record and red label.
  b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.025, 32), brass, {
    at: [0, 0.4325, 0.02],
    bone: "base",
    name: "platter",
  });
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.004, 40), black, {
    at: [0, 0.447, 0.02],
    bone: "base",
    name: "record",
  });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.002, 24), red, {
    at: [0, 0.4495, 0.02],
    bone: "base",
    name: "label",
  });

  // Tonearm: pivot post, arm, and headshell resting in the record groove.
  const pivot: [number, number, number] = [-0.2, 0.445, -0.13];
  const elbow: [number, number, number] = [-0.1, 0.5, -0.05];
  const head: [number, number, number] = [-0.08, 0.457, 0.0];
  b.rod(pivot, [-0.2, 0.5, -0.13], 0.008, { color: silver, name: "armPost", bone: "arm" });
  b.rod([-0.2, 0.5, -0.13], elbow, 0.006, { color: silver, name: "armUpper", bone: "arm" });
  b.rod(elbow, head, 0.005, { color: silver, name: "armLower", bone: "arm" });
  b.part(new THREE.BoxGeometry(0.025, 0.008, 0.018), silver, { at: head, bone: "arm", name: "headshell" });

  // Sound tube from the needle up to the horn throat.
  b.rod(head, [0, 0.5, -0.14], 0.006, { color: brass, name: "soundTube", bone: "horn" });

  // Horn support from the cabinet top to the throat.
  b.rod([0, 0.42, -0.16], [0, 0.5, -0.14], 0.02, { color: brass, name: "hornSupport", bone: "horn" });

  // Morning-glory horn: a thin flared shell spun around its axis, from throat to bell.
  const outer: Array<[number, number]> = Array.from({ length: 13 }, (_, i) => {
    const f = i / 12;
    return [0.012 + 0.34 * f ** 2.2, 0.5 * f];
  });
  const inner: Array<[number, number]> = [...outer]
    .reverse()
    .map(([r, h]): [number, number] => [Math.max(0.002, r - 0.005), h]);
  b.lathe([...outer, ...inner], {
    name: "horn",
    color: brass,
    at: [0, 0.5, -0.14],
    axis: [0, 0.515, 0.857],
    bone: "horn",
    segments: 16,
  });

  // Side crank: hub on the right side of the cabinet, arm and wooden knob.
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 16), brass, {
    at: [-0.27, 0.24, 0],
    rotation: [0, 0, 90],
    bone: "base",
    name: "crankHub",
  });
  b.rod([-0.27, 0.24, 0], [-0.34, 0.24, 0], 0.008, { color: brass, name: "crankArm", bone: "base" });
  b.rod([-0.34, 0.24, 0], [-0.34, 0.24, 0.05], 0.008, { color: brass, name: "crankHandle", bone: "base" });
  b.part(new THREE.SphereGeometry(0.014, 14, 10), dark, { at: [-0.34, 0.24, 0.055], bone: "base", name: "crankKnob" });

  // Claw feet: a brass ball gripped by three claws, each on a short leg under a corner of the cabinet.
  const feet: Array<[number, number]> = [
    [0.2, 0.15],
    [-0.2, 0.15],
    [0.2, -0.15],
    [-0.2, -0.15],
  ];
  feet.forEach(([x, z], f) => {
    b.part(new THREE.SphereGeometry(0.028, 16, 10), brass, { at: [x, 0.03, z], bone: "base", name: `foot${f}` });
    b.rod([x, 0.05, z], [x, 0.08, z], 0.011, { color: brass, name: `leg${f}`, bone: "base" });
    [0, 120, 240].forEach((deg) => {
      const a = (deg * Math.PI) / 180;
      b.spike([x, 0.03, z], [Math.cos(a) * 0.8, -0.5, Math.sin(a) * 0.8], 0.032, 0.007, {
        color: brass,
        name: `claw${f}`,
        bone: "base",
      });
    });
  });

  return b.root;
}
```