import * as THREE from "three";
import { createBuilder, catmull, bezier, countershade, mottle, rng, svg } from "../../../../src/index";

export const meta = { name: "Owl", description: "A stylized barn-style owl perched upright with facial disc, wings, tail and talons." };

export default function build() {
  const b = createBuilder({ name: "owl" });
  const BROWN = "#8a5a34", DARK = "#4a2f1c", CREAM = "#f0dfc0", FACE = "#f7ecd6", BEAK = "#d9a441", EYE = "#16120e", AMBER = "#f0a21a", TALON = "#2b2622";

  const coat = countershade(mottle(BROWN, DARK, { size: 0.05, contrast: 0.6, seed: 3 }), CREAM, { level: -0.15 });
  const wingPaint = mottle(DARK, BROWN, { size: 0.04, seed: 8 });

  const hips = b.joint("hips", { at: [0, 0.2, -0.02], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.2, -0.02], [0, 0.34, 0], [0, 0.46, 0.02]]), { parent: hips, role: "spine", names: ["spine1", "spine2", "chest"] });
  const neck = b.joint("neck", { parent: spine.joints[spine.joints.length - 1], at: [0, 0.5, 0.03], dir: [0, 1, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.54, 0.04], dir: [0, 0.3, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.56, 0.11], aim: [0, 0.54, 0.17], role: "jaw" });

  // body
  const bodyPath = catmull([[0, 0.12, -0.08], [0, 0.28, -0.01], [0, 0.45, 0.03], [0, 0.52, 0.04]]);
  const body = b.sweep(bodyPath, [0.1, 0.13, 0.14, 0.1], { bone: [hips, spine, neck], color: coat, sides: 10 });
  void body;

  // head: wide flat-ish
  b.part(new THREE.SphereGeometry(0.13, 12, 9), coat, { bone: head, at: [0, 0.6, 0.05], scale: [1.15, 0.9, 0.9] });
  // facial disc
  const disc = svg(`<svg viewBox="0 0 64 64"><path d="M32 6 C18 2 4 12 4 30 C4 48 18 60 32 60 C46 60 60 48 60 30 C60 12 46 2 32 6Z" fill="#f7ecd6"/><path d="M32 8 L32 28" stroke="#8a5a34" stroke-width="4"/></svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(0.25, 0.24), "#ffffff", { bone: head, at: [0, 0.6, 0.16], dir: [0, 0, 1], axis: "z", texture: disc });

  // eyes, beak
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.04, 8, 6), AMBER, { bone: head, at: [s * 0.065, 0.62, 0.15] });
    b.part(new THREE.SphereGeometry(0.022, 6, 5), EYE, { bone: head, at: [s * 0.065, 0.62, 0.185] });
    b.part(new THREE.SphereGeometry(0.007, 4, 3), "#ffffff", { bone: head, at: [s * 0.058, 0.63, 0.205] });
    // ear tufts
    b.spike([s * 0.09, 0.7, 0.07], [s * 0.2, 1, 0], 0.09, 0.035, { bone: head, color: DARK });
    // brow
    b.rod([s * 0.03, 0.66, 0.17], [s * 0.1, 0.69, 0.14], 0.012, { bone: head, color: DARK });
  }
  b.part(new THREE.ConeGeometry(0.03, 0.07, 4), BEAK, { bone: head, at: [0, 0.58, 0.19], dir: [0, -0.35, 1] });
  b.part(new THREE.ConeGeometry(0.02, 0.035, 4), BEAK, { bone: jaw, at: [0, 0.563, 0.17], dir: [0, -0.2, 1] });

  // chest feather chevrons
  const chest = b.surface(body);
  for (const h of chest.scatter(40, { rng: rng(5), minDist: 0.05, filter: (h) => h.n.z > 0.4 && h.at.y < 0.5 && h.at.y > 0.15 }))
    b.stick(new THREE.ConeGeometry(0.018, 0.04, 4), DARK, h, { embed: 0.5 });

  // wings
  for (const s of [1, -1]) {
    const sh = b.joint(`shoulder${s > 0 ? "L" : "R"}`, { parent: spine.joints[2], at: [s * 0.12, 0.42, 0], dir: [s * 0.3, -1, -0.3], role: "arm" });
    const wi = b.joint(`wingTip${s > 0 ? "L" : "R"}`, { parent: sh, at: [s * 0.15, 0.1, -0.12], dir: [0, -0.4, -1], role: "wing" });
    b.extrude([[0, 0], [0.1, -0.02], [0.14, -0.2], [0.11, -0.34], [0.05, -0.4, "sharp"], [-0.02, -0.25], [-0.03, -0.1]],
      { at: [s * 0.16, 0.44, 0.0], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.035, bevel: 0.01, smoothing: 1, color: wingPaint, bone: sh });
    wi;
    for (let i = 0; i < 3; i++)
      b.part(new THREE.BoxGeometry(0.025, 0.14, 0.012), DARK, { bone: sh, at: [s * 0.175, 0.2 - i * 0.005, -0.04 - i * 0.04] });
  }

  // tail
  const tail = b.chain("tail", catmull([[0, 0.14, -0.1], [0, 0.1, -0.2], [0, 0.07, -0.3]]), { parent: hips, role: "tail", names: ["tail1", "tail2"] });
  b.sweep(tail, [0.07, 0.04], { color: BROWN, section: "box", caps: "flat" });
  for (let i = -2; i <= 2; i++)
    b.part(new THREE.BoxGeometry(0.035, 0.012, 0.16), i % 2 ? DARK : BROWN, { bone: tail.joints[1], at: [i * 0.036, 0.075, -0.3] });

  // legs and talons
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const leg = b.chain(`leg${n}`, [[s * 0.06, 0.2, 0.0], [s * 0.06, 0.1, 0.02], [s * 0.06, 0.03, 0.04]], { parent: hips, role: "leg", names: [`hip${n}`, `knee${n}`, `ankle${n}`] });
    b.sweep(leg, 0.03, { color: CREAM, sides: 6 });
    for (let i = -1; i <= 1; i++) {
      b.rod([s * 0.06, 0.02, 0.04], [s * 0.06 + i * 0.03, 0.012, 0.13], 0.011, { bone: leg.tip ?? leg.joints[2], color: CREAM });
      b.spike([s * 0.06 + i * 0.03, 0.014, 0.13], [0, -0.3, 1], 0.04, 0.01, { bone: leg.tip ?? leg.joints[2], color: TALON });
    }
    b.rod([s * 0.06, 0.02, 0.03], [s * 0.06, 0.012, -0.04], 0.011, { bone: leg.tip ?? leg.joints[2], color: CREAM });
  }

  // perch stub
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), "#5a3b22", { bone: hips, at: [0, 0.0, 0.05], rotation: [0, 0, 90] });

  return b.root;
}
