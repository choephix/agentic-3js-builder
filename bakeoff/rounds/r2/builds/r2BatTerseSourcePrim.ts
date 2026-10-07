import * as THREE from "three";
import { createBuilder, countershade } from "../../../../src/index";

export const meta = {
  name: "Bat",
  description:
    "A small stylized bat in a rest pose, wings spread, perched on its feet. Rigged with spine, head, jaw, ears, arm and finger chains, legs and tail membrane.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "bat" });

  const FUR = "#5b4333";
  const FUR_DARK = "#3a2a20";
  const BELLY = "#8a6c55";
  const WING = "#4d3b47";
  const BONE = "#35281f";
  const PINK = "#c98f8f";

  // ---- skeleton core
  b.joint("root", { at: [0, 0.085, -0.035], dir: [0, 0, 1], role: "spine" });
  b.chain("spine", [[0, 0.085, -0.035], [0, 0.09, 0], [0, 0.095, 0.035]], {
    parent: "root",
    role: "spine",
    names: ["spine1", "spine2"],
  });
  b.joint("head", { parent: "spine2", at: [0, 0.098, 0.04], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.09, 0.062], dir: [0, 0, 1], role: "jaw" });

  // ---- body
  const sph = (n = 10, m = 8) => new THREE.SphereGeometry(1, b.segments(n), b.segments(m));
  b.part(sph(), countershade(FUR, BELLY, { level: -0.1, soft: 0.4 }), {
    at: [0, 0.087, -0.005],
    scale: [0.03, 0.028, 0.05],
    bone: "spine1",
    name: "torso",
  });
  b.part(sph(8, 6), FUR_DARK, { at: [0, 0.098, 0.03], scale: [0.026, 0.02, 0.022], bone: "spine2", name: "shoulders" });

  // ---- head
  b.part(sph(10, 8), FUR, { at: [0, 0.1, 0.056], scale: [0.022, 0.021, 0.023], bone: "head", name: "skull" });
  b.part(new THREE.BoxGeometry(0.02, 0.014, 0.022), FUR_DARK, { at: [0, 0.096, 0.078], bone: "head", name: "snout" });
  b.part(new THREE.BoxGeometry(0.012, 0.004, 0.01), PINK, { at: [0, 0.103, 0.09], bone: "head", name: "noseLeaf" });
  b.part(new THREE.ConeGeometry(0.007, 0.012, 4), PINK, { at: [0, 0.109, 0.089], rotation: [-20, 45, 0], bone: "head", name: "noseCrest" });
  // lower jaw
  b.part(new THREE.BoxGeometry(0.017, 0.006, 0.026), FUR_DARK, { at: [0, 0.086, 0.074], bone: "jaw", name: "lowerJaw" });
  b.part(new THREE.BoxGeometry(0.01, 0.003, 0.016), PINK, { at: [0, 0.0895, 0.074], bone: "jaw", name: "tongue" });
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // upper fangs and lower fangs
    b.part(new THREE.ConeGeometry(0.0016, 0.007, 4), "#f2ecdc", { at: [s * 0.006, 0.0885, 0.087], rotation: [180, 0, 0], bone: "head", name: `fangUp${S}` });
    b.part(new THREE.ConeGeometry(0.0014, 0.006, 4), "#f2ecdc", { at: [s * 0.005, 0.0925, 0.087], bone: "jaw", name: `fangLow${S}` });
    // eyes
    b.part(sph(6, 5), "#0d0a0a", { at: [s * 0.013, 0.106, 0.07], scale: 0.0045, bone: "head", name: `eye${S}` });
    b.part(sph(4, 3), "#ffffff", { at: [s * 0.0145, 0.1075, 0.0735], scale: 0.0013, bone: "head", name: `glint${S}` });
    // ears
    b.joint(`ear${S}`, { parent: "head", at: [s * 0.012, 0.113, 0.05], dir: [s * 0.4, 1, -0.1], role: "hinge" });
    b.spike([s * 0.012, 0.112, 0.05], [s * 0.4, 1, -0.1], 0.05, 0.014, { color: FUR_DARK, bone: `ear${S}`, sides: 4, name: `ear${S}` });
    b.spike([s * 0.0125, 0.113, 0.0525], [s * 0.4, 1, -0.1], 0.04, 0.0095, { color: PINK, bone: `ear${S}`, sides: 4, name: `earInner${S}` });
  }

  // ---- wings, legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const W: V = [s * 0.17, 0.1, 0.03];
    const arm = b.chain(`arm${S}`, [[s * 0.025, 0.097, 0.02], [s * 0.1, 0.101, 0.0], W], {
      parent: "spine2",
      role: "arm",
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
    });
    b.sweep(arm, [0.0075, 0.0035], { color: FUR, name: `armBone${S}` });
    b.part(sph(6, 5), FUR_DARK, { at: W, scale: 0.0055, bone: `wrist${S}`, name: `wristKnob${S}` });

    // thumb with claw
    b.rod(W, [s * 0.175, 0.1, 0.05], 0.002, { color: BONE, bone: `wrist${S}`, name: `thumb${S}` });
    b.spike([s * 0.175, 0.1, 0.05], [s * 0.3, -0.2, 1], 0.012, 0.0022, { color: "#e8dfc8", bone: `wrist${S}`, sides: 4, name: `claw${S}` });

    const tips: V[] = [
      [s * 0.27, 0.1, 0.1],
      [s * 0.285, 0.1, 0.0],
      [s * 0.25, 0.1, -0.07],
      [s * 0.2, 0.1, -0.11],
    ];
    const digits = tips.map((tip, i) => {
      const mid: V = [(W[0] + tip[0]) / 2, 0.104, (W[2] + tip[2]) / 2 + 0.004];
      const d = b.chain(`digit${i + 2}${S}`, [W, mid, tip], {
        parent: `wrist${S}`,
        role: "digit",
        names: [`d${i + 2}a${S}`, `d${i + 2}b${S}`],
      });
      b.sweep(d, [0.0028, 0.001], { color: BONE, name: `finger${i + 2}${S}` });
      return d;
    });
    for (let i = 0; i < 3; i++)
      b.membrane(digits[i], digits[i + 1], { color: WING, thickness: 0.0016, rows: 3, name: `wing${i}${S}` });
    // body-side membrane
    b.membrane(digits[3], [[s * 0.03, 0.09, 0.0], [s * 0.034, 0.075, -0.07]], {
      color: WING, thickness: 0.0016, rows: 3, name: `flank${S}`,
    });
    // propatagium: arm to first finger, near the elbow-to-wrist leading edge
    b.membrane(arm, [[s * 0.03, 0.105, 0.045], [s * 0.1, 0.104, 0.07], [s * 0.27, 0.1, 0.1]], {
      color: WING, thickness: 0.0016, rows: 2, name: `leading${S}`,
    });

    // legs
    const leg = b.chain(`leg${S}`, [[s * 0.022, 0.07, -0.04], [s * 0.04, 0.04, -0.065], [s * 0.036, 0.005, -0.076]], {
      parent: "root",
      role: "leg",
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
    });
    b.sweep(leg, [0.007, 0.003], { color: FUR_DARK, name: `legTube${S}` });
    for (let k = -1; k <= 1; k++)
      b.rod([s * 0.036, 0.004, -0.076], [s * (0.036 + k * 0.007), 0.0035, -0.056], 0.0024, {
        color: "#d8cdb0", bone: `ankle${S}`, name: `toe${k + 1}${S}`,
      });
  }

  // ---- tail membrane + tail
  b.slab(
    [[-0.042, 0.075, -0.078], [0.042, 0.075, -0.078], [0.02, 0.078, -0.04], [-0.02, 0.078, -0.04]],
    { color: WING, thickness: 0.0016, bone: "root", name: "tailMembrane" },
  );
  const tail = b.chain("tail", [[0, 0.083, -0.07], [0, 0.08, -0.09], [0, 0.077, -0.11]], {
    parent: "root",
    role: "tail",
    names: ["tail1", "tail2"],
  });
  b.sweep(tail, [0.005, 0.0015], { color: FUR_DARK, name: "tailTube" });

  return b.root;
}
