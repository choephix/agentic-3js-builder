import * as THREE from "three";
import { createBuilder, catmull, bezier, rng, svg, paint, mix, noise, smoothstep, countershade } from "../../../../src/index";

export const meta = { name: "Axolotl", description: "Chibi axolotl with frilly pink gills, finned tail and big eyes." };

const SKIN = "#f6b9c8", BELLY = "#fde3e6", GILL = "#ff5f93", GILL2 = "#ff8fb4", DARK = "#3a2030", SPOT = "#e79ab0";

export default function build() {
  const b = createBuilder({ name: "axolotl" });
  const R = rng(5);
  const skinPaint = paint((p, n) => {
    const base = mix(SKIN, SPOT, smoothstep(0.55, 0.8, noise(p, 0.05, 3)) * 0.7);
    return mix(base, BELLY, smoothstep(0.1, -0.5, n.y));
  });

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.07, -0.05], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.08, -0.1], [0, 0.09, 0.05], [0, 0.1, 0.17]]), { parent: hips, names: ["spine1", "spine2"], role: "spine" });
  const head = b.joint("head", { parent: spine.joints[1], at: [0, 0.1, 0.17], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.07, 0.24], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.07, -0.1], [0, 0.07, -0.3], [0, 0.07, -0.5], [0, 0.08, -0.68]]), { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });

  // body
  b.loft([
    { at: [0, 0.08, -0.12], w: 0.15, h: 0.12 },
    { at: [0, 0.09, 0.0], w: 0.22, h: 0.15 },
    { at: [0, 0.09, 0.12], w: 0.24, h: 0.16 },
  ], { bone: [hips, spine], color: skinPaint });
  // tail with fin
  const tb = b.sweep(tail, (t) => [0.065 * (1 - t) + 0.015, 0.06 * (1 - t) + 0.03], { color: skinPaint });
  b.membrane(tb.line(0, 0.0).slice(0, 1), tb.line(0, 0.1).slice(0, 1), { color: GILL2, thickness: 0.006, bone: tail });

  // head
  b.part(new THREE.SphereGeometry(1, 12, 9), skinPaint, { bone: head, at: [0, 0.1, 0.2], scale: [0.17, 0.095, 0.115] });
  b.part(new THREE.SphereGeometry(1, 8, 6), BELLY, { bone: jaw, at: [0, 0.075, 0.27], scale: [0.11, 0.025, 0.07] });
  // smile
  const smile = svg(`<svg viewBox="0 0 40 16"><path d="M3 4 Q20 20 37 4" stroke="#3a2030" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(0.1, 0.04), "#ffffff", { bone: head, at: [0, 0.1, 0.31], dir: [0, 0, 1], axis: "z", texture: smile });
  // cheeks
  const blush = svg(`<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#ff7aa6" opacity="0.8"/></svg>`, { size: 64 });
  const eyeT = svg(`<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#2a1a28"/><circle cx="14" cy="13" r="7" fill="#fff"/><circle cx="26" cy="27" r="3.5" fill="#fff"/></svg>`, { size: 128 });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: head, at: [s * 0.075, 0.17, 0.22], scale: [0.05, 0.04, 0.05] });
    b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", { bone: head, at: [s * 0.075, 0.175, 0.265], dir: [s * 0.15, 0.1, 1], axis: "z", texture: eyeT });
    b.part(new THREE.PlaneGeometry(0.045, 0.045), "#ffffff", { bone: head, at: [s * 0.125, 0.09, 0.26], dir: [s * 0.5, 0, 1], axis: "z", texture: blush });
    // gills: three frilly stalks each
    for (let i = 0; i < 3; i++) {
      const a = (i - 1) * 0.55;
      const base: [number, number, number] = [s * 0.14, 0.12 + i * 0.0 + (i - 1) * 0.02, 0.17];
      const tip: [number, number, number] = [s * (0.3 + 0.02 * (i === 1 ? 1 : 0)), 0.2 + a * 0.13, 0.12 - 0.04 * a];
      const gid = `gill${s > 0 ? "L" : "R"}${i}`;
      const gj = b.joint(gid, { parent: head, at: base, aim: tip, role: "fan" });
      b.sweep(bezier(base, [base[0] + s * 0.08, base[1] + 0.01, base[2] + 0.02], tip), [0.012, 0.006], { bone: gj, color: GILL });
      for (let k = 0; k < 4; k++) {
        const t = 0.3 + k * 0.2;
        const q = [base[0] + (tip[0] - base[0]) * t, base[1] + (tip[1] - base[1]) * t, base[2] + (tip[2] - base[2]) * t];
        for (const u of [1, -1]) b.spike(q, [0, u, 0.2], 0.075 - k * 0.008, 0.007, { bone: gj, color: k % 2 ? GILL2 : GILL });
      }
      b.part(new THREE.SphereGeometry(0.014, 6, 4), GILL2, { bone: gj, at: tip });
    }
    // legs
    const fx = s * 0.12;
    for (const [z, nm] of [[0.08, "F"], [-0.12, "H"]] as [number, string][]) {
      const side = s > 0 ? "L" : "R";
      const leg = b.chain(`leg${nm}${side}`, catmull([[fx, 0.07, z], [fx + s * 0.05, 0.035, z + 0.02], [fx + s * 0.08, 0.015, z + 0.05]]), { parent: nm === "F" ? spine.joints[0] : hips, names: [`hip${nm}${side}`, `knee${nm}${side}`, `foot${nm}${side}`], role: "leg" });
      b.sweep(leg, [0.032, 0.022], { color: skinPaint });
      const fp = [fx + s * 0.08, 0.012, z + 0.06];
      for (let d = -1; d <= 1; d++) b.capsule([fp[0] - s * 0.01, 0.012, fp[2] - 0.015], [fp[0] + s * (0.012 * d) + s * 0.01, 0.012, fp[2] + 0.035], 0.009, { bone: leg.tip ?? leg.joints[2], color: BELLY });
    }
  }
  // dorsal ridge bumps
  for (let i = 0; i < 5; i++) b.part(new THREE.SphereGeometry(0.02, 6, 4), SPOT, { bone: hips, at: [0, 0.165 - i * 0.003, 0.1 - i * 0.05], scale: [0.7, 0.6, 1.2] });
  void R; void countershade;
  return b.root;
}
