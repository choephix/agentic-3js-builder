import * as THREE from "three";
import { createBuilder, catmull, rng } from "../../../../src/index";

export const meta = {
  name: "Garden snail",
  description: "A stylised garden snail with a banded spiral shell, soft body, foot and two eyestalks, resting on the ground.",
};

const BODY = "#b9a57c";
const FOOT = "#d6c79c";
const SHELL_A = "#e3a24f";
const SHELL_B = "#8a4a1e";
const SHELL_DOME = "#c9833a";
const STALK = "#b9a57c";
const EYE = "#1b1714";
const GLINT = "#ffffff";
const SPOT = "#7d6a4a";

export default function build() {
  const b = createBuilder({ name: "snail" });
  const random = rng(3);

  // Skeleton: root at the back of the foot, spine runs tail -> head.
  b.joint("hips", { at: [0, 0.025, -0.06] });

  const spinePath = catmull([
    [0, 0.022, -0.075],
    [0, 0.025, -0.04],
    [0, 0.027, -0.005],
    [0, 0.028, 0.03],
    [0, 0.026, 0.062],
  ]);
  b.chain("spine", spinePath, { role: "spine" });

  // Soft body: a tube along the spine.
  b.sweep(spinePath, 0.016, { color: BODY });

  // Foot: a flatter, paler tube sitting on the ground.
  const footPath = catmull([
    [0, 0.011, -0.078],
    [0, 0.011, -0.04],
    [0, 0.011, 0.0],
    [0, 0.011, 0.04],
    [0, 0.011, 0.07],
  ]);
  b.sweep(footPath, 0.011, { color: FOOT });

  // Head: a rounded, slightly elongated blob at the front.
  const headGeo = new THREE.SphereGeometry(0.02, 12, 8);
  headGeo.scale(1, 0.9, 1.3);
  b.part(headGeo, BODY, { at: [0, 0.027, 0.068] });

  // Freckles scattered over the mantle for surface interest.
  for (let i = 0; i < 14; i++) {
    const x = (random() - 0.5) * 0.016;
    const z = -0.05 + random() * 0.09;
    const geo = new THREE.SphereGeometry(0.0028, 5, 4);
    b.part(geo, SPOT, { at: [x, 0.037, z] });
  }

  // Shell: a dome base with a stack of banded whorls tapering to a point.
  const shellCenter: [number, number, number] = [0, 0.054, -0.02];

  const domeGeo = new THREE.SphereGeometry(0.036, 14, 10);
  domeGeo.scale(1, 0.92, 1.12);
  b.part(domeGeo, SHELL_DOME, { at: shellCenter });

  for (let i = 0; i < 5; i++) {
    const R = 0.036 - i * 0.0062;
    const tube = 0.0072 - i * 0.0007;
    const whorl = new THREE.TorusGeometry(R, tube, 6, 18);
    whorl.rotateX(Math.PI / 2);
    const y = shellCenter[1] - 0.012 + i * 0.0072;
    const z = shellCenter[2] + (i % 2 === 0 ? 0.002 : -0.002);
    const color = i % 2 === 0 ? SHELL_A : SHELL_B;
    b.part(whorl, color, { at: [0, y, z] });
  }

  // Shell tip: a small cone crowning the spiral.
  const tip = new THREE.ConeGeometry(0.008, 0.018, 6);
  b.part(tip, SHELL_B, { at: [0, shellCenter[1] + 0.034, shellCenter[2]] });

  // Eyestalks: long soft tubes ending in dark eyes with a glint.
  for (const side of [1, -1]) {
    const base: [number, number, number] = [side * 0.011, 0.04, 0.072];
    const mid: [number, number, number] = [side * 0.014, 0.05, 0.078];
    const tipPt: [number, number, number] = [side * 0.016, 0.06, 0.082];
    b.sweep(catmull([base, mid, tipPt]), 0.0035, { color: STALK });

    b.part(new THREE.SphereGeometry(0.0075, 10, 8), EYE, { at: tipPt });
    b.part(new THREE.SphereGeometry(0.0022, 6, 5), GLINT, {
      at: [tipPt[0] + side * 0.003, tipPt[1] + 0.003, tipPt[2] + 0.004],
    });

    // Lower tentacles: short feelers near the mouth.
    const feelerBase: [number, number, number] = [side * 0.007, 0.024, 0.086];
    const feelerTip: [number, number, number] = [side * 0.013, 0.02, 0.102];
    b.sweep(catmull([feelerBase, feelerTip]), 0.0022, { color: STALK });
  }

  // Breathing hole: a dark pore on the right flank of the mantle.
  const pore = new THREE.CylinderGeometry(0.0045, 0.0045, 0.003, 8);
  pore.rotateZ(Math.PI / 2);
  b.part(pore, SPOT, { at: [-0.018, 0.046, -0.03] });

  return b.root;
}
