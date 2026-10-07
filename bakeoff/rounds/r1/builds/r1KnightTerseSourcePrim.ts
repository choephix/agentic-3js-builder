import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Armored Knight",
  description: "A plate-armored knight in a rest pose, with a kite shield, a longsword, a plumed helm and a red tabard and cape. Rigged with spine, neck, jaw, arm and leg chains.",
};

export default function build() {
  const b = createBuilder({ name: "knight" });

  const STEEL = "#aeb7c2", DARK = "#6d7782", GOLD = "#c9a23a", RED = "#9b2230";
  const LEATHER = "#5a3b2a", BLACK = "#22252b", MAIL = "#59616b", BLADE = "#d8dee6";

  type O = Record<string, any>;
  const box = (w: number, h: number, d: number, c: string, at: number[], bone: string, o: O = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, bone, ...o });
  const ball = (r: number, c: string, at: number[], bone: string, scale: any = 1, o: O = {}) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at, bone, scale, flat: true, ...o });
  const cyl = (rt: number, rb: number, h: number, c: string, at: number[], bone: string, o: O = {}, seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at, bone, flat: true, ...o });

  // ---------- skeleton ----------
  b.joint("hips", { at: [0, 0.95, 0], dir: [0, 1, 0] });
  b.chain("spine", [[0, 0.98, 0], [0, 1.2, 0], [0, 1.42, 0]], {
    parent: "hips", names: ["spine1", "spine2", "chest"], role: "spine",
  });
  b.chain("neck", [[0, 1.42, 0], [0, 1.55, 0.01]], {
    parent: "chest", names: ["neck", "head"], role: "neck",
  });
  b.joint("jaw", { parent: "head", at: [0, 1.62, 0.02], dir: [0, 0, 1], role: "jaw" });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    b.chain("arm" + S, [[0.2 * s, 1.38, 0], [0.4 * s, 1.12, 0.03], [0.52 * s, 0.88, 0.1]], {
      parent: "chest", names: ["upperArm" + S, "forearm" + S, "hand" + S], role: "arm",
    });
    b.chain("leg" + S, [[0.1 * s, 0.92, 0], [0.12 * s, 0.5, 0.03], [0.13 * s, 0.1, 0], [0.13 * s, 0.05, 0.2]], {
      parent: "hips", names: ["thigh" + S, "shin" + S, "foot" + S, "toe" + S], role: "leg",
    });
  }

  // ---------- torso ----------
  cyl(0.17, 0.19, 0.26, MAIL, [0, 1.08, 0], "spine1");
  box(0.42, 0.3, 0.26, STEEL, [0, 1.3, 0], "spine2");
  box(0.34, 0.26, 0.05, STEEL, [0, 1.3, 0.14], "spine2", { rotation: [-8, 0, 0] });
  box(0.04, 0.28, 0.03, GOLD, [0, 1.3, 0.17], "spine2", { rotation: [-8, 0, 0] });
  box(0.3, 0.035, 0.03, GOLD, [0, 1.36, 0.17], "spine2");
  box(0.44, 0.1, 0.22, DARK, [0, 1.46, -0.02], "chest");
  cyl(0.1, 0.12, 0.1, STEEL, [0, 1.5, 0], "neck");
  cyl(0.21, 0.2, 0.06, LEATHER, [0, 0.99, 0], "spine1");
  box(0.07, 0.06, 0.03, GOLD, [0, 0.99, 0.2], "spine1");
  // back plate and cape
  box(0.36, 0.28, 0.04, DARK, [0, 1.3, -0.14], "spine2");
  box(0.4, 0.78, 0.025, RED, [0, 1.02, -0.19], "spine2", { rotation: [-4, 0, 0] });
  box(0.42, 0.04, 0.04, GOLD, [0, 1.41, -0.17], "spine2");

  // pelvis, faulds, tabard
  box(0.34, 0.14, 0.22, DARK, [0, 0.93, 0], "hips");
  for (let i = 0; i < 3; i++) {
    box(0.3 - i * 0.02, 0.09, 0.03, i === 2 ? GOLD : STEEL, [0, 0.85 - i * 0.075, 0.125 + i * 0.012], "hips", { rotation: [-6, 0, 0] });
  }
  box(0.17, 0.5, 0.02, RED, [0, 0.55, 0.13], "hips");
  box(0.17, 0.03, 0.025, GOLD, [0, 0.31, 0.13], "hips");
  box(0.04, 0.36, 0.025, GOLD, [0, 0.55, 0.14], "hips");
  box(0.3, 0.32, 0.02, RED, [0, 0.62, -0.13], "hips");
  box(0.07, 0.09, 0.05, LEATHER, [0.22, 0.88, 0.06], "hips");

  // ---------- head ----------
  cyl(0.12, 0.12, 0.14, STEEL, [0, 1.69, 0.01], "head", {}, 10);
  b.part(new THREE.SphereGeometry(0.12, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { at: [0, 1.76, 0.01], bone: "head", flat: true });
  box(0.17, 0.13, 0.03, DARK, [0, 1.69, 0.12], "head");
  box(0.15, 0.022, 0.02, BLACK, [0, 1.7, 0.138], "head");
  box(0.03, 0.14, 0.03, STEEL, [0, 1.69, 0.145], "head");
  for (let i = 0; i < 3; i++) {
    box(0.012, 0.012, 0.02, BLACK, [0.05 + i * 0.0, 1.65 - i * 0.0, 0.14], "head", { at: [0.045, 1.66 - i * 0.015, 0.138] });
    box(0.012, 0.012, 0.02, BLACK, [0, 0, 0], "head", { at: [-0.045, 1.66 - i * 0.015, 0.138] });
  }
  box(0.025, 0.035, 0.28, GOLD, [0, 1.86, 0], "head");
  for (let i = 0; i < 5; i++) {
    box(0.035, 0.1 - i * 0.012, 0.07, RED, [0, 1.9 - i * 0.012 * i * 0.5, 0.08 - i * 0.075], "head", { rotation: [-8 * i, 0, 0] });
  }
  box(0.19, 0.075, 0.17, STEEL, [0, 1.6, 0.05], "jaw");
  box(0.12, 0.05, 0.03, DARK, [0, 1.6, 0.14], "jaw");
  box(0.26, 0.03, 0.05, GOLD, [0, 1.585, 0.0], "jaw", { at: [0, 1.57, -0.03], scale: [0.7, 1, 1] });

  // ---------- limbs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const P = (x: number, y: number, z: number) => [x * s, y, z];
    const ua = "upperArm" + S, fa = "forearm" + S, hd = "hand" + S;
    const th = "thigh" + S, sh = "shin" + S, ft = "foot" + S;

    // arm
    ball(0.1, STEEL, P(0.24, 1.4, 0), ua, [1.2, 0.8, 1.15]);
    box(0.17, 0.03, 0.17, GOLD, P(0.25, 1.35, 0), ua, { rotation: [0, 0, -35 * s] });
    ball(0.085, STEEL, P(0.28, 1.31, 0), ua, [1.1, 0.7, 1.1], { rotation: [0, 0, -30 * s] });
    b.capsule(P(0.2, 1.38, 0), P(0.4, 1.12, 0.03), 0.05, { color: MAIL, bone: ua });
    b.capsule(P(0.3, 1.25, 0.015), P(0.37, 1.15, 0.028), 0.062, { color: STEEL, bone: ua });
    ball(0.062, GOLD, P(0.4, 1.12, 0.05), fa, 1);
    b.capsule(P(0.4, 1.12, 0.03), P(0.52, 0.9, 0.1), 0.048, { color: MAIL, bone: fa });
    b.capsule(P(0.43, 1.06, 0.05), P(0.5, 0.93, 0.09), 0.062, { color: STEEL, bone: fa });
    box(0.03, 0.04, 0.03, GOLD, P(0.5, 0.94, 0.15), fa);
    // gauntlet + fingers
    box(0.085, 0.09, 0.07, DARK, P(0.53, 0.84, 0.1), hd, { rotation: [0, 0, -22 * s] });
    for (let i = 0; i < 4; i++)
      box(0.016, 0.07, 0.02, STEEL, P(0.545 + 0.004 * i, 0.77 - 0.004 * i, 0.07 + i * 0.02), hd, { rotation: [0, 0, -22 * s] });
    box(0.02, 0.05, 0.02, STEEL, P(0.5, 0.8, 0.14), hd, { rotation: [30, 0, -22 * s] });

    // leg
    ball(0.1, DARK, P(0.12, 0.9, 0), th, [1, 1.1, 1]);
    b.capsule(P(0.1, 0.92, 0), P(0.12, 0.5, 0.03), 0.07, { color: MAIL, bone: th });
    b.capsule(P(0.105, 0.86, 0.01), P(0.118, 0.6, 0.025), 0.082, { color: STEEL, bone: th });
    ball(0.07, GOLD, P(0.12, 0.5, 0.07), sh, [1, 1, 0.9]);
    box(0.02, 0.08, 0.05, STEEL, P(0.12, 0.5, 0.115), sh);
    b.capsule(P(0.12, 0.5, 0.03), P(0.13, 0.12, 0), 0.058, { color: STEEL, bone: sh });
    box(0.025, 0.3, 0.03, GOLD, P(0.13, 0.31, 0.055), sh, { rotation: [-4, 0, 0] });
    // sabaton
    box(0.11, 0.07, 0.15, DARK, P(0.13, 0.04, 0.08), ft);
    box(0.1, 0.05, 0.06, STEEL, P(0.13, 0.035, 0.19), ft);
    b.part(new THREE.ConeGeometry(0.04, 0.07, 6), STEEL, { at: P(0.13, 0.032, 0.245), bone: "toe" + S, rotation: [90, 0, 0], flat: true });
    box(0.1, 0.05, 0.08, STEEL, P(0.13, 0.095, 0.0), ft);
    box(0.09, 0.015, 0.03, GOLD, P(0.13, 0.08, 0.1), ft);
  }

  // ---------- shield (left forearm) ----------
  const shield = b.extrude(
    [[-0.17, 0.26], [0.17, 0.26], [0.19, 0.1], [0.12, -0.15], [0, -0.34], [-0.12, -0.15], [-0.19, 0.1]],
    { color: RED, at: [0.575, 1.0, 0.07], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.035, bevel: 0.008, bone: "forearmL", name: "shield" },
  );
  box(0.012, 0.52, 0.04, GOLD, [0.6, 0.98, 0.07], "forearmL");
  box(0.012, 0.045, 0.3, GOLD, [0.6, 1.08, 0.07], "forearmL");
  ball(0.045, GOLD, [0.6, 1.06, 0.07], "forearmL", [0.6, 1, 1]);
  void shield;

  // ---------- sword (right hand) ----------
  const sw = [-0.53, 0.82, 0.1];
  cyl(0.014, 0.014, 0.12, LEATHER, [sw[0], sw[1] + 0.01, sw[2]], "handR", { rotation: [0, 0, 0] });
  ball(0.025, GOLD, [sw[0], sw[1] - 0.06, sw[2]], "handR", 1);
  box(0.2, 0.025, 0.035, GOLD, [sw[0], sw[1] + 0.08, sw[2]], "handR");
  box(0.05, 0.9, 0.012, BLADE, [sw[0], sw[1] + 0.54, sw[2]], "handR");
  box(0.012, 0.86, 0.016, STEEL, [sw[0], sw[1] + 0.54, sw[2]], "handR");
  b.part(new THREE.ConeGeometry(0.025, 0.08, 4), BLADE, { at: [sw[0], sw[1] + 1.03, sw[2]], bone: "handR", scale: [1, 1, 0.25], flat: true });

  return b.root;
}
