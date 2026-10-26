```ts
import * as THREE from "three";
import { createBuilder, catmull, svg, paint, mix, noise, smoothstep, countershade, rng } from "agentic-3js-builder";

export const meta = { name: "Axolotl", description: "Chibi axolotl with frilly pink gills" };

const PINK = "#ffb3c7", PINK2 = "#ff7fa3", BELLY = "#ffe3ea", DARK = "#2a1a2e", GILL = "#ff5f8f";

export default function build() {
  const b = createBuilder({ name: "axolotl" });
  const skin = countershade(
    paint((p, _n) => mix(PINK, "#f59ab5", smoothstep(0.4, 0.8, noise(p, 0.08, 3)) * 0.6)),
    BELLY,
    { level: -0.35 },
  );

  const hips = b.joint("hips", { at: [0, 0.1, -0.05], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.1, -0.05], [0, 0.11, 0.08], [0, 0.12, 0.2]]), {
    parent: hips, names: ["spine1", "spine2", "neck"], role: "spine",
  });
  const head = b.joint("head", { parent: spine.joints[2], at: [0, 0.13, 0.2], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.09, 0.3], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.1, -0.05], [0, 0.09, -0.3], [0, 0.08, -0.55], [0, 0.07, -0.75]]), {
    parent: hips, count: 4, role: "tail",
  });

  // body
  b.sweep(catmull([[0, 0.11, -0.2], [0, 0.11, 0], [0, 0.12, 0.15]]), [0.1, 0.12], { color: skin, bone: [hips, spine.joints[0]] });
  // tail with fin
  b.sweep(tail, (t) => [0.075 * (1 - t) + 0.015, 0.09 * (1 - t) + 0.03], { color: skin });
  b.extrude([[0, 0], [0.2, 0.05], [0.4, 0.07], [0.7, 0.03], [0.7, 0], [0.4, -0.02], [0, -0.02]], {
    at: [0, 0.1, -0.1], x: [0, 0, -1], thickness: 0.008, color: PINK2, bone: tail.joints[1], smoothing: 1,
  });

  // head: wide flat
  b.part(new THREE.SphereGeometry(1, 12, 9), skin, { bone: head, at: [0, 0.12, 0.28], scale: [0.2, 0.15, 0.18] });
  b.part(new THREE.SphereGeometry(1, 10, 6), BELLY, { bone: jaw, at: [0, 0.075, 0.33], scale: [0.14, 0.04, 0.12] });
  // smile
  b.part(new THREE.BoxGeometry(0.2, 0.006, 0.01), DARK, { bone: head, at: [0, 0.095, 0.455] });

  // eyes
  const eye = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#2a1a2e"/><circle cx="32" cy="32" r="22" fill="#4a3a6e"/><circle cx="24" cy="23" r="9" fill="#fff"/><circle cx="41" cy="40" r="4" fill="#fff"/></svg>`, { size: 128 });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", {
      bone: head, at: [s * 0.1, 0.17, 0.42], dir: [s * 0.25, 0.1, 1], axis: "z", texture: eye,
    });
    b.part(new THREE.SphereGeometry(0.016, 6, 4), PINK2, { bone: head, at: [s * 0.14, 0.1, 0.4] });
    b.part(new THREE.SphereGeometry(0.012, 5, 4), DARK, { bone: head, at: [s * 0.04, 0.12, 0.47] });
  }

  // gills: three feathery stalks per side
  const R = rng(5);
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const a = (i - 1) * 0.5;
      const base: [number, number, number] = [s * 0.17, 0.15 + i * 0.03 - 0.02, 0.2];
      const tip: [number, number, number] = [s * (0.33 + 0.02 * i), 0.2 + 0.1 * (1 - Math.abs(a)) + a * 0.18, 0.12 - 0.03 * i];
      b.rod(base, tip, [0.012, 0.006], GILL, { bone: head });
      for (let k = 0; k < 5; k++) {
        const t = 0.3 + k * 0.17;
        const p: [number, number, number] = [base[0] + (tip[0] - base[0]) * t, base[1] + (tip[1] - base[1]) * t, base[2] + (tip[2] - base[2]) * t];
        for (const u of [1, -1]) {
          const e: [number, number, number] = [p[0] + s * 0.03, p[1] + u * 0.05 * (1.1 - t) + 0.01, p[2] - 0.02 + R() * 0.02];
          b.rod(p, e, [0.007, 0.002], k % 2 ? PINK2 : GILL, { bone: head });
          b.part(new THREE.SphereGeometry(0.01, 5, 4), "#ff9bb8", { bone: head, at: e });
        }
      }
    }
  }

  // legs
  for (const [sn, side] of [[1, "L"], [-1, "R"]] as const) {
    for (const [z, nm] of [[0.12, "F"], [-0.12, "H"]] as const) {
      const root: [number, number, number] = [sn * 0.1, 0.07, z];
      const foot: [number, number, number] = [sn * 0.2, 0.02, z + (nm === "F" ? 0.04 : -0.03)];
      const leg = b.chain(`leg${nm}${side}`, [root, [sn * 0.15, 0.05, z], foot], {
        parent: nm === "F" ? spine.joints[0] : hips, names: [`hip${nm}${side}`, `knee${nm}${side}`, `foot${nm}${side}`], role: "leg",
      });
      b.sweep(leg, [0.035, 0.028], { color: skin });
      for (let f = 0; f < 4; f++) {
        const a = (f - 1.5) * 0.35;
        b.rod(foot, [foot[0] + sn * 0.04 * Math.cos(a), 0.012, foot[2] + 0.05 * Math.sin(a) + 0.01], [0.009, 0.007], PINK2, { bone: leg.tip! });
      }
    }
  }
  return b.root;
}
```