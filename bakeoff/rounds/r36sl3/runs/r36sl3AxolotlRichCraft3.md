```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, countershade, mottle, svg, rng, offset } from "agentic-3js-builder";

export const meta = { name: "Chibi Axolotl", description: "A chubby chibi axolotl with big frilly pink gills, dotted skin and a finned tail." };

export default function build() {
  const b = createBuilder({ name: "axolotl" });
  const PINK = "#f6b3c4", PINK2 = "#ea7f9f", DARK = "#2a1a2a", BELLY = "#fde2e6";
  const skin = countershade(mottle(PINK, "#f2a6bb", { size: 0.08, seed: 3 }), BELLY, { level: -0.2 });
  const gillCol = mottle("#ef6f93", "#ff9db8", { size: 0.03, seed: 5 });

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.14, -0.1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.14, -0.1], [0, 0.15, 0.05], [0, 0.17, 0.16]]), { parent: hips, role: "spine", names: ["spine1", "spine2"] });
  const head = b.joint("head", { parent: spine.joints[1], at: [0, 0.18, 0.14], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.1, 0.2], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.13, -0.15], [0, 0.12, -0.35], [0, 0.11, -0.55], [0, 0.12, -0.72]]), { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"] });

  // body
  b.sweep(catmull([[0, 0.14, -0.2], [0, 0.15, 0.0], [0, 0.17, 0.14]]), [0.1, 0.12, 0.1].length ? (t: number) => [0.1 + 0.03 * Math.sin(t * 3), 0.085] as [number, number] : 0.1, { bone: [spine, hips], color: skin, sides: 10 });
  // tail with fin
  b.sweep(tail, (t: number) => [0.075 * (1 - t) + 0.02, 0.07 * (1 - t) + 0.03] as [number, number], { color: skin, sides: 8 });
  const fin = b.extrude([[0, 0], [0.2, 0.09, "sharp"], [0.5, 0.1], [0.62, 0.03], [0.6, -0.04], [0.3, -0.07], [0, -0.04]], { at: [0, 0.14, -0.2], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.012, bone: tail.joints[1], color: PINK2, smoothing: 1 });
  void fin;

  // head: wide flat chibi head
  b.part(new THREE.SphereGeometry(1, 14, 10), skin, { bone: head, at: [0, 0.2, 0.2], scale: [0.2, 0.14, 0.17] });
  // lower jaw
  b.part(new THREE.SphereGeometry(1, 10, 6), BELLY, { bone: jaw, at: [0, 0.14, 0.27], scale: [0.14, 0.04, 0.1] });
  // smile
  b.sweep(catmull([[-0.1, 0.165, 0.34], [0, 0.152, 0.37], [0.1, 0.165, 0.34]]), 0.004, { bone: head, color: DARK, sides: 4 });

  // eyes
  const eye = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#1a1020"/><circle cx="22" cy="22" r="10" fill="#fff"/><circle cx="42" cy="42" r="5" fill="#fff"/></svg>`, { size: 96 });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), PINK2, { bone: head, at: [s * 0.1, 0.3, 0.26], scale: [0.05, 0.03, 0.05] });
    b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", { bone: head, at: [s * 0.1, 0.31, 0.3], dir: [s * 0.2, 0.1, 1], axis: "z", texture: eye });
    // cheeks
    b.part(new THREE.CircleGeometry(0.03, 10), "#ff8fa8", { bone: head, at: [s * 0.15, 0.2, 0.3], dir: [s * 0.8, 0, 0.6], axis: "z" });
    // nostril
    b.part(new THREE.SphereGeometry(0.008, 5, 4), DARK, { bone: head, at: [s * 0.04, 0.23, 0.37] });
  }

  // gills: three fronds per side
  const r = rng(11);
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const a = [0.3, 0.2, 0.1][i] + 0.0;
      const base: [number, number, number] = [s * 0.17, 0.2 + (i - 1) * 0.045, 0.17];
      const tip: [number, number, number] = [s * (0.42 - i * 0.02), 0.2 + (i - 1) * 0.11 + a * 0.2, 0.12 - r() * 0.04];
      const mid: [number, number, number] = [s * 0.3, base[1] + (tip[1] - base[1]) * 0.4 + 0.02, 0.16];
      const path = bezier(base, mid, tip);
      b.sweep(path, [0.014, 0.006], { bone: head, color: PINK2, sides: 5 });
      for (let k = 1; k <= 4; k++) {
        const p = path.at(k / 5);
        const q = offset(p, [s * 0.3, 0.8, -0.1], 0.07 - k * 0.005);
        b.sweep(bezier(p, offset(p, [s * 0.1, 1, 0], 0.035), q), [0.008, 0.002], { bone: head, color: gillCol, sides: 4 });
        const q2 = offset(p, [s * 0.3, -0.8, -0.1], 0.06 - k * 0.005);
        b.sweep(bezier(p, offset(p, [s * 0.1, -1, 0], 0.03), q2), [0.007, 0.002], { bone: head, color: gillCol, sides: 4 });
      }
    }
  }

  // legs
  for (const s of [1, -1]) {
    for (const [z, n] of [[0.1, "F"], [-0.18, "H"]] as [number, string][]) {
      const side = s > 0 ? "L" : "R";
      const root: [number, number, number] = [s * 0.09, 0.1, z];
      const leg = b.chain(`leg${n}${side}`, catmull([root, [s * 0.15, 0.06, z + 0.02], [s * 0.19, 0.025, z + 0.07]]), { parent: hips, role: "leg", names: [`hip${n}${side}`, `knee${n}${side}`, `foot${n}${side}`] });
      b.sweep(leg, [0.04, 0.03], { color: skin, sides: 7 });
      for (let t = -1; t <= 1; t++) {
        const dir = [s * 0.4 + t * 0.4, 0, 1] as [number, number, number];
        b.spike([s * 0.19, 0.022, z + 0.07], dir, 0.06, 0.014, { bone: leg.tip ?? leg.joints[2], color: PINK2, sides: 5 });
      }
    }
  }
  // belly spots
  const sk = b.surface(b.root);
  for (const h of sk.scatter(14, { rng: rng(4), minDist: 0.08, filter: (h) => h.n.y > 0.5 && h.at.z < 0.1 }))
    b.stick(new THREE.SphereGeometry(0.012, 5, 4), "#d9879f", h, { embed: 0.5 });

  return b.root;
}
```