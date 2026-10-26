import * as THREE from "three";
import { createBuilder, catmull, bezier, countershade, mottle, svg } from "../../../../src/index";

export const meta = { name: "axolotl", description: "Chibi axolotl with frilly pink gills" };

export default function build() {
  const b = createBuilder({ name: "axolotl" });
  const SKIN = "#f4b6c2", BELLY = "#fde3e6", GILL = "#ff5f8f", GILL2 = "#ff9bb8", DARK = "#2b1a2a";
  const skin = countershade(mottle("#f2a8b8", "#f9c6d0", { size: 0.08 }), BELLY, { level: -0.2 });

  const hips = b.joint("hips", { at: [0, 0.1, -0.05], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.1, -0.05], [0, 0.12, 0.1], [0, 0.14, 0.22]]), { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] });
  const head = b.joint("head", { parent: spine.joints[2], at: [0, 0.15, 0.22], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.07, 0.3], dir: [0, 0, 1], role: "jaw" });

  const tail = b.chain("tail", catmull([[0, 0.1, -0.05], [0, 0.09, -0.3], [0, 0.1, -0.52], [0, 0.13, -0.7]]), { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3", "tail4"] });
  b.sweep(tail, (t) => [0.07 * (1 - t) + 0.015, 0.09 * (1 - t) + 0.03], { color: skin });
  b.sweep(catmull([[0, 0.1, -0.05], [0, 0.12, 0.1], [0, 0.14, 0.22]]), [0.1, 0.11], { bone: [spine, hips], color: skin });

  // fin on tail
  b.extrude([[0, 0], [0.7, 0], [0.55, 0.06], [0.3, 0.1], [0.05, 0.06]], { at: [0, 0.12, -0.05], x: [0, 0, -1], thickness: 0.006, color: GILL2, bone: hips });

  // head: wide chibi
  b.part(new THREE.SphereGeometry(1, 12, 9), skin, { bone: head, at: [0, 0.14, 0.3], scale: [0.2, 0.15, 0.17] });
  b.part(new THREE.SphereGeometry(1, 10, 6), BELLY, { bone: jaw, at: [0, 0.09, 0.36], scale: [0.14, 0.04, 0.1] });
  // mouth smile
  b.part(new THREE.BoxGeometry(0.16, 0.008, 0.01), DARK, { bone: head, at: [0, 0.105, 0.455] });

  // eyes
  const eye = svg(`<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#1c1220"/><circle cx="14" cy="13" r="7" fill="#fff"/><circle cx="26" cy="27" r="3" fill="#fff"/></svg>`, { size: 96 });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.085, 0.085), "#ffffff", { bone: head, at: [s * 0.1, 0.19, 0.42], dir: [s * 0.3, 0.1, 1], axis: "z", texture: eye });
    b.part(new THREE.SphereGeometry(1, 6, 4), "#ff9bb8", { bone: head, at: [s * 0.14, 0.12, 0.4], scale: [0.03, 0.018, 0.01] });
  }

  // gills: three frilly branches per side
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const a = (i - 1) * 0.5;
      const base: [number, number, number] = [s * 0.19, 0.16 + a * 0.05, 0.27];
      const tip: [number, number, number] = [s * (0.4 + (1 - Math.abs(a)) * 0.04), 0.16 + a * 0.2 + 0.1, 0.23];
      b.sweep(bezier(base, [s * 0.3, 0.2 + a * 0.1, 0.27], tip), [0.012, 0.004], { bone: head, color: GILL });
      for (let k = 1; k <= 3; k++) {
        const t = k / 4;
        const p: [number, number, number] = [base[0] + (tip[0] - base[0]) * t, base[1] + (tip[1] - base[1]) * t + 0.01, 0.27 - 0.01 * k];
        b.spike(p, [0, 1, 0.1], 0.06 - k * 0.008, 0.008, { bone: head, color: GILL2 });
        b.spike(p, [0, -0.3, 0.9], 0.05, 0.007, { bone: head, color: GILL });
      }
      b.part(new THREE.SphereGeometry(0.014, 6, 4), GILL2, { bone: head, at: tip });
    }
  }

  // legs
  for (const s of [1, -1]) {
    for (const [z, n] of [[0.17, "F"], [-0.05, "H"]] as [number, string][]) {
      const root: [number, number, number] = [s * 0.1, 0.08, z];
      const leg = b.chain("leg" + n + (s > 0 ? "L" : "R"), catmull([root, [s * 0.18, 0.05, z + (n === "F" ? 0.03 : -0.02)], [s * 0.22, 0.02, z + (n === "F" ? 0.08 : -0.04)]]), { parent: n === "F" ? spine.joints[1] : hips, role: "leg", names: ["up", "low", "foot"].map((x) => x + n + (s > 0 ? "L" : "R")) });
      b.sweep(leg, [0.04, 0.03], { color: skin });
      for (let d = -1; d <= 1; d++) {
        const fp: [number, number, number] = [s * 0.22, 0.02, z + (n === "F" ? 0.08 : -0.04)];
        b.spike(fp, [s * 0.5, 0, d * 0.5 + (n === "F" ? 0.6 : -0.6)], 0.05, 0.012, { bone: leg.tip ?? leg.joints[1], color: GILL2 });
      }
    }
  }
  return b.root;
}
