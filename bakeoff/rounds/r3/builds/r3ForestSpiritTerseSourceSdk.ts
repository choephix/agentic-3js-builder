import * as THREE from "three";
import { createBuilder, rng, svg, mottle, grain, polyline } from "../../../../src/index";

export const meta = {
  name: "Forest Spirit",
  description:
    "A tall, antlered woodland spirit with a bleached deer-skull mask, bark-and-moss body, root toes, a mushroom shoulder, a leafy cloak, a fern tail and a glowing heart.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "forestSpirit" });
  const rand = rng(11);

  // Paints
  const bark = mottle(grain("#5e402a", "#3b2819", { size: 0.04, axis: "y" }), "#4d7a38", { size: 0.14, seed: 2 });
  const moss = mottle("#3d7433", "#86b94e", { size: 0.07, seed: 5 });
  const bone = mottle("#efe8d2", "#cbbd96", { size: 0.05, seed: 9 });
  const antler = grain("#7a5634", "#4a3220", { size: 0.02, axis: "y" });

  // Skeleton
  b.joint("hips", { at: [0, 0.9, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain("spine", polyline([[0, 0.9, 0], [0, 1.15, 0.02], [0, 1.4, 0]]), {
    parent: "hips",
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const neck = b.chain("neck", polyline([[0, 1.4, 0], [0, 1.55, 0.05], [0, 1.68, 0.1]]), {
    parent: "chest",
    names: ["neck1", "neck2", "head"],
    role: "neck",
  });
  b.joint("jaw", { parent: "head", at: [0, 1.74, 0.14], dir: [0, 0, 1], role: "jaw" });

  // Torso, neck, skirt
  const torso = b.sweep(spine, { radius: (t: number) => [0.17 + 0.03 * Math.sin(t * 3), 0.13 + 0.02 * t], color: bark });
  b.sweep(neck, { radius: [0.075, 0.055, 0.05], color: bark });
  b.lathe(
    [[0.12, 1.0], [0.2, 0.97], [0.33, 0.74], [0.28, 0.7], [0.31, 0.64], [0.22, 0.68], [0.12, 0.92]],
    { at: [0, 0, 0], color: moss, segments: 10, bone: "hips" },
  );

  // Heart glow
  b.part(new THREE.SphereGeometry(0.055, 8, 6), "#a6ff7c", { at: [0, 1.2, 0.17], bone: "spine2" });

  // Head: skull, snout, jaw
  b.part(new THREE.SphereGeometry(0.15, 10, 8), bone, { at: [0, 1.82, 0.12], scale: [0.88, 1, 1.0], bone: "head" });
  b.capsule([0, 1.79, 0.2], [0, 1.77, 0.38], { radius: [0.07, 0.042], color: bone, bone: "head", sides: 8 });
  b.capsule([0, 1.73, 0.16], [0, 1.72, 0.35], { radius: [0.05, 0.03], color: bone, bone: "jaw", sides: 8 });
  for (const s of [1, -1]) {
    // eyes
    b.part(new THREE.SphereGeometry(0.04, 8, 6), "#1c1410", { at: [s * 0.07, 1.85, 0.235], bone: "head" });
    b.part(new THREE.SphereGeometry(0.024, 8, 6), "#ffd24a", { at: [s * 0.072, 1.85, 0.255], bone: "head" });
    // nostrils
    b.part(new THREE.SphereGeometry(0.012, 5, 4), "#2a1c14", { at: [s * 0.022, 1.8, 0.385], bone: "head" });
    // teeth
    b.spike([s * 0.025, 1.75, 0.3], [0, -1, 0], 0.035, 0.007, { color: "#f4efe0", bone: "jaw" });
    b.spike([s * 0.03, 1.745, 0.24], [0, 1, 0], 0.03, 0.007, { color: "#f4efe0", bone: "jaw" });
    // leaf ears
    b.spike([s * 0.13, 1.87, 0.08], [s * 1, 0.3, -0.4], 0.2, 0.04, { color: moss, bone: "head" });
    // cheek marks
    b.part(new THREE.BoxGeometry(0.01, 0.07, 0.03), "#4f8f3a", { at: [s * 0.125, 1.78, 0.2], bone: "head", rotation: [0, 0, s * 20] });
    // antlers
    const P: [number, number, number][] = [
      [s * 0.06, 1.95, 0.1],
      [s * 0.12, 2.1, 0.08],
      [s * 0.2, 2.25, 0.05],
      [s * 0.3, 2.42, 0.08],
    ];
    b.sweep(P, { radius: [0.028, 0.02, 0.013, 0.006], color: antler, bone: "head", sides: 6 });
    b.rod(P[1], [s * 0.1, 2.3, 0.2], [0.014, 0.004], { color: antler, bone: "head", sides: 5 });
    b.rod(P[2], [s * 0.1, 2.5, 0.0], [0.014, 0.004], { color: antler, bone: "head", sides: 5 });
    b.rod(P[2], [s * 0.34, 2.28, 0.14], [0.012, 0.004], { color: antler, bone: "head", sides: 5 });
    b.rod(P[3], [s * 0.4, 2.62, 0.05], [0.01, 0.003], { color: antler, bone: "head", sides: 5 });
  }

  // Limbs
  for (const [S, s] of [["L", 1], ["R", -1]] as const) {
    const leg = b.chain(`leg${S}`, polyline([[s * 0.13, 0.9, 0], [s * 0.15, 0.5, 0.04], [s * 0.14, 0.1, 0]]), {
      parent: "hips",
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    b.sweep(leg, { radius: [0.075, 0.048, 0.036], color: bark });
    b.part(new THREE.BoxGeometry(0.1, 0.06, 0.12), bark, { at: [s * 0.14, 0.04, 0.02], bone: `ankle${S}` });
    for (const dx of [-0.045, 0, 0.045]) {
      b.capsule([s * 0.14 + dx * 0.5, 0.04, 0.05], [s * 0.14 + dx * 1.6, 0.025, 0.22], {
        radius: [0.03, 0.017], color: bark, bone: `ankle${S}`, sides: 6,
      });
    }

    const arm = b.chain(`arm${S}`, polyline([[s * 0.23, 1.36, 0], [s * 0.42, 1.15, 0.05], [s * 0.54, 0.92, 0.14]]), {
      parent: "chest",
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, { radius: [0.05, 0.038, 0.03], color: bark });
    b.part(new THREE.SphereGeometry(0.1, 8, 6), moss, { at: [s * 0.23, 1.38, 0], scale: [1, 0.7, 1], bone: `shoulder${S}` });
    b.part(new THREE.SphereGeometry(0.04, 7, 5), bark, { at: [s * 0.54, 0.92, 0.14], bone: `wrist${S}` });
    [-1, 0, 1].forEach((k, i) => {
      b.sprout(`finger${S}${i}`, arm.tip!, [s * (0.56 + k * 0.045), 0.79, 0.2 + (1 - Math.abs(k)) * 0.03], 0.012, {
        color: bark, count: 1, role: "digit", sides: 5,
      });
    });
  }

  // Mushrooms on the left shoulder
  [[0.27, 1.46, 0.0, 1], [0.2, 1.46, -0.07, 0.7], [0.32, 1.44, 0.06, 0.55]].forEach(([x, y, z, k]) => {
    b.part(new THREE.CylinderGeometry(0.012 * k, 0.016 * k, 0.07 * k, 6), "#f1e8d0", { at: [x, y + 0.04 * k, z], bone: "shoulderL" });
    b.part(new THREE.SphereGeometry(0.05 * k, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#d8502f", {
      at: [x, y + 0.07 * k, z], bone: "shoulderL",
    });
    b.part(new THREE.SphereGeometry(0.009 * k, 4, 3), "#fff6dc", { at: [x + 0.015 * k, y + 0.115 * k, z + 0.01], bone: "shoulderL" });
  });

  // Fern tail
  const tail = b.chain("tail", polyline([[0, 0.95, -0.1], [0, 0.9, -0.35], [0, 0.82, -0.6], [0, 0.8, -0.85]]), {
    parent: "hips",
    role: "tail",
  });
  b.sweep(tail, { radius: [0.06, 0.045, 0.03], color: moss });
  b.part(new THREE.SphereGeometry(0.035, 7, 5), "#b8ff8a", { at: [0, 0.8, -0.88], bone: "tail3" });

  // Leaf cloak cards on torso
  const leaf = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 2 C58 20 54 50 32 62 C10 50 6 20 32 2Z" fill="#5fa443"/><path d="M32 8 L32 60" stroke="#2f6a2a" stroke-width="3"/><path d="M32 24 L46 18 M32 36 L48 30 M32 24 L18 18 M32 36 L16 30" stroke="#3f8434" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  const hits = b.surface(torso.meshes).scatter(40, { rng: rand, minDist: 0.05, filter: (h) => h.n.y < 0.8 });
  if (hits.length)
    b.cards(hits, leaf, { size: [0.08, 0.11], lean: 55, flow: [0, -1, -0.2], bend: 30, vary: 0.3, spin: 40, rng: rand });

  // Wisps
  [[0.5, 0.55, 0.35], [-0.55, 1.35, 0.25], [0.3, 1.9, -0.35]].forEach(([x, y, z]) => {
    b.part(new THREE.IcosahedronGeometry(0.03, 0), "#bff5e6", { at: [x, y, z], bone: "hips" });
  });

  return b.root;
}
