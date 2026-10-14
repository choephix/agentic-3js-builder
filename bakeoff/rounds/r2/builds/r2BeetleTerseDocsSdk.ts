import * as THREE from "three";
import { createBuilder, bezier, catmull, limb, mottle, countershade, gradient } from "../../../../src/index";

export const meta = {
  name: "Stag Beetle",
  description: "A stylized stag beetle with large antler-like mandibles, elytra, and six jointed legs.",
};

export default function build() {
  const b = createBuilder({ name: "stagBeetle" });
  const SHELL = "#4a2412";
  const SHELL2 = "#6b3519";
  const DARK = "#1f130c";
  const HORN = "#2a160d";
  const EYE = "#d9a441";
  const shell = countershade(mottle(SHELL2, SHELL, { size: 0.03, contrast: 0.6 }), DARK, { level: -0.2 });

  const R = 0.05; // leg height base
  const body = b.joint("thorax", { at: [0, 0.07, 0], dir: [0, 0, 1], role: "spine" });
  const abd = b.joint("abdomen", { parent: body, at: [0, 0.07, -0.03], dir: [0, 0, -1], role: "spine" });
  const head = b.joint("head", { parent: body, at: [0, 0.07, 0.07], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.065, 0.14], dir: [0, 0, 1], role: "jaw" });

  // thorax (pronotum)
  b.part(new THREE.SphereGeometry(1, 10, 7), shell, { bone: body, at: [0, 0.075, 0.02], scale: [0.055, 0.04, 0.06] });
  // abdomen / elytra
  b.part(new THREE.SphereGeometry(1, 12, 8), shell, { bone: abd, at: [0, 0.07, -0.14], scale: [0.065, 0.05, 0.14] });
  // elytra split line
  b.rod([0, 0.119, -0.02], [0, 0.112, -0.27], 0.003, { bone: abd, color: DARK });
  // elytra edge rims
  for (const s of [1, -1]) {
    b.rod([s * 0.06, 0.075, -0.02], [s * 0.05, 0.065, -0.26], 0.005, { bone: abd, color: DARK });
  }
  // head
  b.part(new THREE.SphereGeometry(1, 10, 7), DARK, { bone: head, at: [0, 0.07, 0.11], scale: [0.06, 0.035, 0.045] });
  // eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.012, 6, 4), EYE, { bone: head, at: [s * 0.05, 0.08, 0.125] });
  }
  // antennae
  for (const s of [1, -1]) {
    const ant = b.chain(`antenna${s > 0 ? "L" : "R"}`, [[s * 0.03, 0.08, 0.15], [s * 0.05, 0.1, 0.19], [s * 0.07, 0.11, 0.23]], {
      parent: head,
      names: [`antenna${s > 0 ? "L" : "R"}1`, `antenna${s > 0 ? "L" : "R"}2`],
      role: "digit",
    });
    b.sweep(ant, [0.006, 0.004], { color: HORN });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), HORN, { bone: ant.joints[1], at: [s * 0.07, 0.11, 0.235], scale: [1, 1, 1.6] });
  }

  // mandibles: separate left/right, hinged
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const mj = b.joint(`mandible${n}`, { parent: jaw, at: [s * 0.03, 0.065, 0.15], dir: [s * 0.2, 0, 1], role: "hinge" });
    const path = bezier([s * 0.03, 0.065, 0.15], [s * 0.1, 0.07, 0.22], [s * 0.1, 0.07, 0.3], [s * 0.035, 0.07, 0.36]);
    b.sweep(path, [0.022, 0.006], { bone: mj, color: HORN, sides: 6, caps: { start: "round", end: "point" } });
    // teeth
    b.along(path.slice(0.25, 0.85), 3, (at) => {
      b.spike(at.at, [-s, 0.1, -0.1], 0.03, 0.01, { bone: mj, color: HORN });
    });
    // inner spike near base
    b.spike([s * 0.05, 0.07, 0.18], [-s * 0.4, 0.1, 1], 0.05, 0.012, { bone: mj, color: HORN });
  }

  // legs
  const zs = [0.06, -0.02, -0.12];
  const reach = [0.2, 0.26, 0.24];
  for (let i = 0; i < 3; i++) {
    for (const s of [1, -1]) {
      const n = s > 0 ? "L" : "R";
      const hip: [number, number, number] = [s * 0.05, 0.06, zs[i]];
      const foot: [number, number, number] = [s * reach[i], 0.01, zs[i] + (i === 0 ? 0.08 : i === 1 ? 0 : -0.1)];
      const pts = limb(hip, foot, [0.1, 0.12], [[0, 1, 0]]);
      const leg = b.chain(`leg${i}${n}`, pts, {
        parent: i === 0 ? body : abd,
        names: [`hip${i}${n}`, `knee${i}${n}`, `foot${i}${n}`],
        role: "leg",
        contact: [foot[0], 0, foot[2]],
      });
      b.sweep(leg, [0.014, 0.008], { color: DARK, sides: 6 });
      // tibial spines
      b.spike(pts[1], [s, 0.3, 0], 0.03, 0.008, { color: HORN, bone: leg.joints[1] });
      b.part(new THREE.SphereGeometry(0.016, 6, 4), SHELL, { bone: leg.joints[1], at: pts[1] });
      // foot claw
      b.spike(pts[2], [s * 0.3, -0.3, 0.8], 0.04, 0.006, { color: HORN, bone: leg.joints[2] });
    }
  }

  return b.root;
}
