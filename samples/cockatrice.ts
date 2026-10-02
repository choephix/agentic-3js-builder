import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { countershade, scales, spots } from "../src/paint";
import { svg } from "../src/texture";

const FEATHER = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 1 C11 13 4 23 7 39 C9 50 14 58 16 63 C18 58 23 50 25 39 C28 23 21 13 16 1Z" fill="white"/><path d="M16 7 L16 58" stroke="black" stroke-width="2"/><path d="M16 19 L10 30 M16 26 L22 37 M16 35 L11 45 M16 42 L21 51" stroke="black" stroke-width="1.4"/></svg>`,
  { size: 128 },
);

const C = {
  plum: "#6d3e78", plumDark: "#3c234f", cream: "#f4d9a0", belly: "#ffe8b8",
  teal: "#35a6a1", tealDark: "#1d666b", coral: "#ed635d", coralDark: "#a9344b",
  gold: "#e9b94b", beak: "#e4a937", claw: "#49324d", eye: "#fff7d1", pupil: "#211c35",
  wing: "#4f86b4", wingDark: "#2b527d", mint: "#83d4bd",
};

export const meta = {
  name: "Cockatrice",
  description: "A cheerful low-poly rooster-dragon with fan feathers, bright scales, and a tiny theatrical menace.",
  style: "whimsical low-poly mix",
  commit: "07503e3",
};

export default function build() {
  const b = createBuilder({ name: "cockatrice", detail: 1 });
  const coat = countershade(
    spots(C.plum, [C.teal, C.coralDark], { size: 0.2, amount: 0.28, rosette: true, seed: 23 }),
    C.belly,
    { level: -0.15 },
  );
  const neckCoat = scales(coat, C.gold, { size: 0.12, width: 0.025, seed: 11 });
  const legCoat = countershade(C.tealDark, C.teal, { level: 0.05 });

  // Complete neutral skeleton before geometry: spine, neck/head/jaw, four legs, tail and wings.
  const hips = b.joint("hips", { at: [0, 0.9, -0.28], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.88, -0.5], [0, 0.98, -0.22], [0, 1.06, 0.1], [0, 1.08, 0.38]]), {
    parent: hips, count: 4, names: ["spineBase", "spineMid", "chest", "shoulders"], role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 1.08, 0.38], [0, 1.24, 0.5], [0, 1.43, 0.6]]), {
    parent: spine.joints[3], count: 3, names: ["neckBase", "neckMid", "neckTop"], role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 1.45, 0.65], dir: [0, 0.02, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.17, down: 0.06 }), dir: [0, 0, 1], role: "jaw", group: "head" });

  const legPoints = (s: number, front: boolean): number[][] => {
    const z = front ? 0.25 : -0.28;
    return [[s * 0.2, 0.93, z], [s * 0.26, 0.63, z + (front ? 0.12 : -0.03)], [s * 0.22, 0.3, z - (front ? 0.04 : 0.08)], [s * 0.22, 0.12, z + 0.18]];
  };
  const legL = b.chain("legL", legPoints(1, false), { parent: spine.joints[1], names: ["hipL", "kneeL", "ankleL", "footL"], role: "leg", contact: [0.22, 0, -0.1] });
  const legR = b.chain("legR", legPoints(-1, false), { parent: spine.joints[1], names: ["hipR", "kneeR", "ankleR", "footR"], role: "leg", contact: [-0.22, 0, -0.1] });
  const legFL = b.chain("legFL", legPoints(1, true), { parent: spine.joints[2], names: ["hipFL", "kneeFL", "ankleFL", "footFL"], role: "leg", contact: [0.22, 0, 0.43] });
  const legFR = b.chain("legFR", legPoints(-1, true), { parent: spine.joints[2], names: ["hipFR", "kneeFR", "ankleFR", "footFR"], role: "leg", contact: [-0.22, 0, 0.43] });
  const tail = b.chain("tail", catmull([[0, 0.94, -0.48], [0, 0.94, -0.75], [0, 1.02, -1.02], [0, 1.2, -1.22], [0, 1.42, -1.27]]), {
    parent: hips, count: 5, names: ["tailBase", "tail1", "tail2", "tail3", "tailTip"], role: "tail",
  });
  const wingL = b.chain("wingL", catmull([[0.23, 1.15, 0.2], [0.48, 1.36, 0.24], [0.78, 1.46, 0.16], [1.05, 1.39, 0.02]]), {
    parent: spine.joints[2], count: 4, names: ["shoulderL", "elbowL", "wristL", "wingTipL"], role: "wing",
  });
  const wingR = b.chain("wingR", catmull([[-0.23, 1.15, 0.2], [-0.48, 1.36, 0.24], [-0.78, 1.46, 0.16], [-1.05, 1.39, 0.02]]), {
    parent: spine.joints[2], count: 4, names: ["shoulderR", "elbowR", "wristR", "wingTipR"], role: "wing",
  });

  const body = b.sweep(spine, (t) => 0.26 - t * 0.035, { color: coat, section: { ngon: 8 }, shift: [0, -0.015], name: "body", group: "body" });
  const neckTube = b.sweep(neck, (t) => 0.17 - t * 0.035, { color: neckCoat, section: { ngon: 7 }, sectors: [[120, 240, C.belly]], name: "neck", group: "body" });
  b.sweep(legL, [0.075, 0.045], { color: legCoat, section: { ngon: 6 }, name: "legL", group: "legs" });
  b.sweep(legR, [0.075, 0.045], { color: legCoat, section: { ngon: 6 }, name: "legR", group: "legs" });
  b.sweep(legFL, [0.075, 0.045], { color: legCoat, section: { ngon: 6 }, name: "legFL", group: "legs" });
  b.sweep(legFR, [0.075, 0.045], { color: legCoat, section: { ngon: 6 }, name: "legFR", group: "legs" });
  b.sweep(tail, (t) => 0.13 - t * 0.105, { color: neckCoat, section: { ngon: 7 }, bands: [[0.68, C.teal], [0.86, C.coral]], name: "tail", group: "tail" });
  b.sweep(wingL, [0.095, 0.025], { color: C.wingDark, section: { ngon: 6 }, name: "wingBoneL", group: "wings" });
  b.sweep(wingR, [0.095, 0.025], { color: C.wingDark, section: { ngon: 6 }, name: "wingBoneR", group: "wings" });

  // Broad membranes plus individually readable flight feathers.
  for (const s of [1, -1]) {
    const wing = s > 0 ? wingL : wingR;
    const edge = catmull([wing.at(0).at, [s * 0.47, 1.17, -0.05], [s * 0.77, 1.08, -0.22], [s * 1.05, 1.08, -0.3]]);
    b.membrane(wing, edge, { color: C.wing, thickness: 0.018, rows: 3, cols: 7, scallop: 0.2, name: `wingMembrane${s > 0 ? "L" : "R"}`, group: "wings" });
    for (let i = 0; i < 4; i++) {
      b.cards([wing.at(0.2 + i * 0.2)], FEATHER, { size: [0.13 - i * 0.012, 0.34 - i * 0.025], lean: 58, bend: 8, flow: [s * 0.4, -0.15, -1], color: i % 2 ? C.mint : C.cream, mirror: s < 0 });
    }
  }

  // Faceted head, split jaw, beak, eyes, brows and cheek jewelry.
  b.part(new THREE.SphereGeometry(0.235, 8, 6), neckCoat, { bone: head, at: head.local({ forward: 0.08, up: 0.01 }), scale: [0.9, 1.02, 1.1], flat: true, name: "skull", group: "head" });
  b.part(new THREE.ConeGeometry(0.12, 0.29, 5), C.beak, { bone: head, at: head.local({ forward: 0.32, down: 0.01 }), dir: [0, 0, 1], flat: true, name: "upperBeak", group: "head" });
  b.part(new THREE.ConeGeometry(0.09, 0.22, 5), C.coralDark, { bone: jaw, at: jaw.local({ forward: 0.08, down: 0.025 }), dir: [0, 0, 1], flat: true, name: "lowerBeak", group: "head" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.052, 8, 5), C.eye, { bone: head, at: head.local([s * 0.16, 0.14, 0.1]), flat: true, name: `eyeWhite${s > 0 ? "L" : "R"}`, group: "face" });
    b.part(new THREE.SphereGeometry(0.027, 6, 4), C.pupil, { bone: head, at: head.local([s * 0.165, 0.185, 0.105]), flat: true, name: `pupil${s > 0 ? "L" : "R"}`, group: "face" });
    b.part(new THREE.ConeGeometry(0.018, 0.09, 5), C.coral, { bone: head, at: head.local([s * 0.14, 0.13, 0.175]), dir: [0, 0.5, 1], flat: true, name: `brow${s > 0 ? "L" : "R"}`, group: "face" });
    for (let i = 0; i < 3; i++) b.part(new THREE.SphereGeometry(0.013, 5, 4), C.mint, { bone: head, at: head.local([s * (0.2 + i * 0.012), 0.14 + i * 0.01, 0.02 - i * 0.035]), flat: true, name: `cheek${s > 0 ? "L" : "R"}${i}`, group: "face" });
  }
  b.extrude([[-0.06, 0], [-0.08, 0.1], [-0.045, 0.2], [-0.01, 0.12], [0.04, 0.23], [0.08, 0.11], [0.06, 0]], {
    at: head.local({ back: 0.1, up: 0.14 }), x: [0, 0, 1], y: [0, 1, 0], thickness: 0.045, bevel: 0.01, color: C.coral, bone: head, name: "comb", group: "head",
  });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.07, 7, 5), C.coral, { bone: jaw, at: jaw.local([s * 0.075, 0.02, -0.05]), scale: [0.75, 1.2, 0.65], flat: true, name: `wattle${s > 0 ? "L" : "R"}`, group: "head" });

  // Four splayed feet, each with three toes and a rear spur.
  const feet = [legL, legR, legFL, legFR];
  for (let li = 0; li < feet.length; li++) {
    const s = li % 2 === 0 ? 1 : -1;
    const foot = feet[li].tip!;
    for (let i = 0; i < 3; i++) {
      const spread = (i - 1) * 0.11;
      b.spike(foot, [s * (0.22 + spread), 0, foot.at.z + 0.2 + (i === 1 ? 0.04 : 0)], null, 0.027, { color: C.claw, section: { ngon: 5 }, name: `toe${li}${i}`, group: "feet" });
    }
    b.spike(foot, [s * 0.18, 0.11, foot.at.z - 0.12], null, 0.025, { color: C.claw, section: { ngon: 5 }, name: `spur${li}`, group: "feet" });
  }

  // Tail crest spikes and chunky flank scales.
  for (let i = 0; i < 6; i++) b.spike(tail.at(0.12 + i * 0.15), tail.at(0.12 + i * 0.15), 0.09 + (i % 2) * 0.025, 0.032, { color: i % 2 ? C.coral : C.gold, section: { ngon: 5 }, name: `tailSpike${i}`, group: "tail" });
  const surface = b.surface(body);
  for (const s of [1, -1]) {
    const flank = surface.around(body.frame).at(s * 90, 8);
    if (!flank) continue;
    for (let i = 0; i < 6; i++) {
      const hit = surface.around(flank.at).at(s * (78 + i * 6), 4 + i * 3);
      if (hit) b.stick(new THREE.ConeGeometry(0.035, 0.018, 6), C.gold, hit, { embed: 0.35, name: `scale${s > 0 ? "L" : "R"}${i}`, group: "scales" });
    }
  }

  // A theatrical throat ruff and a ring of painted scale accents complete the silhouette.
  const ruff = b.ring(neckTube.frame, { count: 9, radius: 0.18, fromDeg: 0, toDeg: 360, tilt: -18 });
  for (let i = 0; i < ruff.items.length; i++) b.spike(ruff.items[i], ruff.items[i], 0.16 + (i % 3) * 0.025, 0.035, { color: i % 2 ? C.cream : C.coral, section: { ngon: 5 }, name: `ruff${i}`, group: "head" });

  // Keep deterministic randomness in the module for surface distributions and future posing.
  rng(17);
  return b.root;
}
