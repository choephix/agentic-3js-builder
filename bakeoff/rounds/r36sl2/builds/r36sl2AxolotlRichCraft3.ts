import * as THREE from "three";
import { createBuilder, catmull, svg, countershade, mottle, rng } from "../../../../src/index";

export const meta = { name: "Chibi Axolotl", description: "Chibi axolotl with frilly pink feathery gills, stubby legs and a finned tail." };

const SKIN = "#f6c9d0", BACK = "#eeaab9", BELLY = "#fde8e4", GILL = "#ff5c8a", GILL2 = "#ff9bb5", DARK = "#2a1520";

export default function build() {
  const b = createBuilder({ name: "axolotl" });
  const skin = countershade(mottle(BACK, SKIN, { size: 0.08, seed: 3 }), BELLY, { level: -0.2 });

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.1, -0.05], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.1, -0.05], [0, 0.11, 0.1], [0, 0.12, 0.2]]), { parent: hips, role: "spine", names: ["spine1", "spine2"] });
  const head = b.joint("head", { parent: spine.joints[1], at: [0, 0.13, 0.2], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.1, 0.3], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.1, -0.05], [0, 0.09, -0.3], [0, 0.1, -0.55], [0, 0.12, -0.75]]), { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"] });

  // body and tail
  b.sweep(catmull([[0, 0.1, -0.25], [0, 0.1, -0.05], [0, 0.11, 0.1], [0, 0.12, 0.18]]), [0.1, 0.12], { bone: hips, color: skin });
  b.sweep(tail, (t) => [0.08 * (1 - t) + 0.02, 0.1 * (1 - t) + 0.03], { color: skin });
  // tail fin
  b.extrude([[0, 0.05], [-0.25, 0.1], [-0.55, 0.06], [-0.75, 0.0], [-0.5, -0.04], [-0.2, -0.05]].map(([z, y]) => [z, y] as [number, number]), {
    at: [0, 0.12, 0], x: [0, 0, 1], thickness: 0.008, color: GILL2, bone: tail.joints[1], smoothing: 1,
  });

  // big head
  b.part(new THREE.SphereGeometry(0.25, 12, 9), skin, { bone: head, at: [0, 0.2, 0.28], scale: [1.25, 0.85, 1] });
  // jaw
  b.part(new THREE.SphereGeometry(0.17, 10, 6), BELLY, { bone: jaw, at: [0, 0.1, 0.4], scale: [1.3, 0.35, 1] });
  // smile
  b.part(new THREE.TorusGeometry(0.1, 0.006, 4, 12, Math.PI), DARK, { bone: head, at: [0, 0.155, 0.52], rotation: [0, 0, 180] });

  // eyes
  const eye = svg(`<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="${DARK}"/><circle cx="14" cy="13" r="7" fill="#fff"/><circle cx="26" cy="27" r="3" fill="#fff"/></svg>`, { size: 96 });
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.06, 14), "#ffffff", { bone: head, at: [s * 0.15, 0.24, 0.5], dir: [s * 0.25, 0.05, 1], axis: "z", texture: eye });
    b.part(new THREE.SphereGeometry(0.018, 6, 4), "#ff8aa8", { bone: head, at: [s * 0.22, 0.17, 0.47], scale: [1.6, 1, 0.5] });
  }

  // gills: three frilly fronds per side
  const r = rng(5);
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const a = (i - 1) * 0.5;
      const base: [number, number, number] = [s * 0.27, 0.25 + i * 0.05 - 0.05, 0.22];
      const tip: [number, number, number] = [s * (0.52 + 0.04 * i), 0.3 + a * 0.35 + 0.12, 0.16 - 0.04 * i];
      b.sweep(catmull([base, [s * 0.4, base[1] + 0.05, 0.2], tip]), [0.018, 0.006], { bone: head, color: GILL, caps: { end: "round" } });
      for (let k = 0; k < 4; k++) {
        const t = 0.3 + k * 0.2;
        const p = [base[0] + (tip[0] - base[0]) * t, base[1] + (tip[1] - base[1]) * t + 0.02, base[2] + (tip[2] - base[2]) * t];
        b.spike(p as [number, number, number], [s * 0.2, 0.7 + r() * 0.3, -0.1], 0.1 - k * 0.012, 0.009, { bone: head, color: GILL2 });
        b.spike(p as [number, number, number], [s * 0.2, -0.3, 0.5], 0.06, 0.007, { bone: head, color: GILL2 });
      }
    }
  }

  // stubby legs
  for (const s of [1, -1]) {
    for (const [z, n] of [[0.12, "F"], [-0.17, "H"]] as [number, string][]) {
      const leg = b.chain(`leg${n}${s > 0 ? "L" : "R"}`, catmull([[s * 0.12, 0.1, z], [s * 0.2, 0.05, z + 0.03], [s * 0.24, 0.02, z + 0.07]]), { parent: hips, role: "leg", names: [`hip${n}${s > 0 ? "L" : "R"}`, `knee${n}${s > 0 ? "L" : "R"}`, `foot${n}${s > 0 ? "L" : "R"}`] });
      b.sweep(leg, [0.04, 0.03], { color: skin });
      const foot = leg.tip!;
      b.part(new THREE.SphereGeometry(0.045, 8, 5), SKIN, { bone: foot, at: [s * 0.25, 0.02, z + 0.1], scale: [1.2, 0.5, 1.3] });
      for (let k = -1; k <= 1; k++) b.part(new THREE.SphereGeometry(0.014, 5, 4), GILL2, { bone: foot, at: [s * (0.25 + k * 0.035), 0.015, z + 0.16] });
    }
  }
  return b.root;
}
