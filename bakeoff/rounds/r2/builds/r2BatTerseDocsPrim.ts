import * as THREE from "three";
import { createBuilder, catmull, polyline, countershade, mottle } from "../../../../src/index";
import { limb } from "../../../../src/index";

export const meta = {
  name: "Bat",
  description: "Stylized bat in a rest pose: wings spread, standing on its hind feet, with a rigged jaw, ears, arms, fingers and legs.",
};

const FUR = "#5b4535";
const FUR_LIGHT = "#8d7459";
const WING = "#3a2a30";
const EAR_IN = "#c98a8a";
const DARK = "#1a1214";
const TEETH = "#f1ead8";
const CLAW = "#d8cdb8";

export default function build() {
  const b = createBuilder({ name: "bat" });
  const hips = b.joint("hips", { at: [0, 0.11, -0.04], role: "spine" });

  // spine
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.11, -0.06],
      [0, 0.115, -0.01],
      [0, 0.125, 0.04],
      [0, 0.135, 0.085],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] },
  );
  const coat = countershade(mottle(FUR, "#6d5442", { size: 0.03 }), FUR_LIGHT, { level: -0.2 });
  b.sweep(spine, [0.03, 0.042, 0.04, 0.03], { color: coat, sides: 8 });

  // head
  const head = b.joint("head", { parent: spine.joints[2], at: [0, 0.135, 0.085], dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.03, down: 0.015 }),
    aim: head.local({ forward: 0.09, down: 0.015 }),
    role: "jaw",
  });
  b.part(new THREE.SphereGeometry(0.036, 8, 6), coat, { bone: head, at: head.local({ forward: 0.025, up: 0.005 }), flat: true });
  b.part(new THREE.BoxGeometry(0.04, 0.026, 0.045), FUR_LIGHT, { bone: head, at: head.local({ forward: 0.065, down: 0.004 }) });
  b.part(new THREE.BoxGeometry(0.036, 0.012, 0.05), FUR_LIGHT, { bone: jaw, at: jaw.local({ forward: 0.03, down: 0.004 }) });
  b.part(new THREE.SphereGeometry(0.01, 6, 4), DARK, { bone: head, at: head.local({ forward: 0.09, up: 0.003 }), scale: [1.3, 0.8, 1] });
  // nose leaf
  b.part(new THREE.ConeGeometry(0.008, 0.016, 4), EAR_IN, { bone: head, at: head.local({ forward: 0.082, up: 0.02 }), dir: [0, 0.6, 0.4] });
  for (const s of [1, -1]) {
    // teeth
    b.part(new THREE.ConeGeometry(0.003, 0.01, 4), TEETH, { bone: head, at: head.local({ left: s * 0.012, forward: 0.085, down: 0.016 }), dir: [0, -1, 0] });
    b.part(new THREE.ConeGeometry(0.003, 0.01, 4), TEETH, { bone: jaw, at: jaw.local({ left: s * 0.01, forward: 0.052, up: 0.01 }), dir: [0, 1, 0] });
    // eyes
    b.part(new THREE.SphereGeometry(0.008, 6, 4), DARK, { bone: head, at: head.local({ left: s * 0.024, up: 0.014, forward: 0.045 }) });
    b.part(new THREE.SphereGeometry(0.002, 4, 3), "#ffffff", { bone: head, at: head.local({ left: s * 0.027, up: 0.019, forward: 0.05 }) });
    // ears
    const outline: [number, number, ("sharp")?][] = [
      [0, 0],
      [0.034, 0.008],
      [0.036, 0.05],
      [0.014, 0.1, "sharp"],
      [0, 0.06],
    ].map((p) => p as [number, number]);
    b.extrude(outline, {
      at: head.local({ left: s * 0.018, up: 0.028, forward: 0.01 }),
      x: [s * 0.8, 0, 0.2],
      y: [s * 0.15, 1, 0],
      thickness: 0.004,
      smoothing: 1,
      color: FUR,
      bone: head,
    });
    b.extrude(
      outline.map(([x, y]) => [x * 0.6 + 0.004, y * 0.8 + 0.006] as [number, number]),
      {
        at: head.local({ left: s * 0.018, up: 0.028, forward: 0.0125 }),
        x: [s * 0.8, 0, 0.2],
        y: [s * 0.15, 1, 0],
        thickness: 0.003,
        smoothing: 1,
        color: EAR_IN,
        bone: head,
      },
    );
  }

  // tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.108, -0.1],
      [0, 0.1, -0.15],
      [0, 0.092, -0.21],
    ]),
    { parent: hips, role: "tail", names: ["tail1", "tail2"] },
  );
  b.sweep(tail, [0.012, 0.004], { color: FUR, sides: 6 });

  // wings and legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh: [number, number, number] = [s * 0.035, 0.13, 0.03];
    const wr: [number, number, number] = [s * 0.2, 0.15, 0.03];
    const arm = b.chain(`arm${S}`, polyline([sh, [s * 0.11, 0.145, -0.02], wr]), {
      parent: spine.joints[1],
      role: "arm",
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
    });
    b.sweep(arm, [0.012, 0.007], { color: FUR, sides: 6, bone: arm });
    // thumb
    b.spike([wr[0], wr[1], wr[2]], [s * 0.2, 0.16, 0.07], null, 0.006, { color: CLAW, bone: arm.joints[2] });

    const tips: [number, number, number][] = [
      [s * 0.25, 0.15, 0.16],
      [s * 0.4, 0.15, 0.09],
      [s * 0.38, 0.14, -0.07],
      [s * 0.27, 0.125, -0.16],
    ];
    const fingers = tips.map((tp, i) => {
      const m: [number, number, number] = [(wr[0] + tp[0]) / 2, (wr[1] + tp[1]) / 2 + 0.006, (wr[2] + tp[2]) / 2];
      const f = b.chain(`finger${S}${i + 1}`, polyline([wr, m, tp]), {
        parent: arm.joints[2],
        role: "digit",
        names: [`f${S}${i + 1}a`, `f${S}${i + 1}b`],
      });
      b.sweep(f, [0.005, 0.002], { color: FUR, sides: 5, caps: "point" });
      return f;
    });
    for (let i = 0; i < 3; i++)
      b.membrane(fingers[i], fingers[i + 1], { color: WING, thickness: 0.003, scallop: 0.12, rows: 3 });
    b.membrane(fingers[3], polyline([wr, [s * 0.1, 0.12, -0.08], [s * 0.04, 0.105, -0.12]]), {
      color: WING,
      thickness: 0.003,
      bone: spine.joints[0],
      rows: 3,
    });
    // propatagium: arm to first finger
    b.membrane(arm, polyline([sh, [s * 0.12, 0.14, 0.07], [s * 0.2, 0.15, 0.1]]), {
      color: WING,
      thickness: 0.003,
      bone: spine.joints[1],
      rows: 2,
    });

    // leg
    const hipP: [number, number, number] = [s * 0.03, 0.1, -0.07];
    const foot: [number, number, number] = [s * 0.045, 0.012, -0.08];
    const pts = limb(hipP, foot, [0.055, 0.055], [[0, 0, -1]]);
    const leg = b.chain(`leg${S}`, pts, { parent: hips, role: "leg", names: [`hip${S}`, `knee${S}`, `ankle${S}`] });
    b.sweep(leg, [0.013, 0.007, 0.005], { color: FUR, sides: 6, bone: leg });
    b.part(new THREE.BoxGeometry(0.018, 0.012, 0.03), FUR_LIGHT, { bone: leg.tip!, at: [foot[0], 0.006, foot[2] + 0.008] });
    for (let j = -1; j <= 1; j++) {
      b.spike([foot[0] + j * 0.005, 0.006, foot[2] + 0.02], [foot[0] + j * 0.009, 0.004, foot[2] + 0.05], null, 0.004, {
        color: CLAW,
        bone: leg.tip!,
        sides: 4,
      });
    }
    // uropatagium
    b.membrane(leg, tail, { color: WING, thickness: 0.003, bone: hips, rows: 3 });
  }

  return b.root;
}
