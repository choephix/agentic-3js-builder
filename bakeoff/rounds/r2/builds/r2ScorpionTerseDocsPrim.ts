import * as THREE from "three";
import { createBuilder, limb, bezier, catmull, polyline, mottle, stripes } from "../../../../src/index";

export const meta = {
  name: "Scorpion",
  description: "A stylized desert scorpion with a curled stinger tail, jointed pincers, eight legs and a split jaw, rigged and in a rest pose.",
};

const SHELL = "#9a6322";
const SHELL2 = "#7d4c18";
const PLATE_A = "#b27a2c";
const PLATE_B = "#8f5a20";
const BELLY = "#c9a15a";
const CLAW = "#6e3c12";
const LEG = "#a46c28";
const DARK = "#1a0f08";
const SPIKE = "#3a2210";
const EYE = "#0a0705";
const FANG = "#2a1a0d";

export default function build() {
  const b = createBuilder({ name: "scorpion" });

  // ---------- skeleton ----------
  const body = b.joint("body", { at: [0, 0.04, -0.03], aim: [0, 0.04, 0.0], role: "spine" });
  const head = b.joint("head", { parent: body, at: [0, 0.042, 0.01], aim: [0, 0.042, 0.1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.034, 0.078], aim: [0, 0.034, 0.115], role: "jaw" });

  // ---------- abdomen plates ----------
  const shellPaint = mottle(SHELL, SHELL2, { size: 0.03, contrast: 0.6 });
  for (let i = 0; i < 7; i++) {
    const z = 0.0 - i * 0.0135;
    const w = 0.09 - 0.0065 * i;
    const h = 0.034 - 0.0022 * i;
    b.part(new THREE.BoxGeometry(w, h, 0.0128), i % 2 ? PLATE_B : PLATE_A, {
      bone: body, at: [0, 0.027 + h / 2, z],
    });
    // sternite on the underside
    b.part(new THREE.BoxGeometry(w * 0.7, 0.006, 0.0125), BELLY, { bone: body, at: [0, 0.026, z] });
    // dorsal keel bump
    b.part(new THREE.BoxGeometry(0.012, 0.005, 0.0085), SPIKE, { bone: body, at: [0, 0.027 + h + 0.001, z] });
  }

  // ---------- carapace ----------
  b.part(new THREE.BoxGeometry(0.082, 0.028, 0.07), shellPaint, { bone: head, at: [0, 0.047, 0.045] });
  b.part(new THREE.BoxGeometry(0.06, 0.02, 0.03), shellPaint, { bone: head, at: [0, 0.045, 0.082] });
  b.part(new THREE.BoxGeometry(0.05, 0.01, 0.05), SHELL2, { bone: head, at: [0, 0.064, 0.045] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.004, 0.006, 0.06), SPIKE, { bone: head, at: [s * 0.018, 0.071, 0.045] });
    // median eyes + lateral eyes
    b.part(new THREE.SphereGeometry(0.007, 6, 4), EYE, { bone: head, at: [s * 0.011, 0.072, 0.052] });
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.SphereGeometry(0.0035, 5, 4), EYE, {
        bone: head, at: [s * (0.03 - k * 0.003), 0.056, 0.082 - k * 0.011],
      });
    }
  }
  b.part(new THREE.BoxGeometry(0.02, 0.008, 0.016), SPIKE, { bone: head, at: [0, 0.07, 0.052] });

  // ---------- jaw (chelicerae) ----------
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.014, 0.01, 0.026), CLAW, { bone: head, at: [s * 0.009, 0.04, 0.094] });
    b.part(new THREE.ConeGeometry(0.004, 0.014, 5), FANG, { bone: head, at: [s * 0.009, 0.032, 0.108], rotation: [180, 0, 0] });
    b.part(new THREE.BoxGeometry(0.014, 0.008, 0.024), CLAW, { bone: jaw, at: [s * 0.009, 0.031, 0.098] });
    b.part(new THREE.ConeGeometry(0.0035, 0.012, 5), FANG, { bone: jaw, at: [s * 0.009, 0.036, 0.11] });
  }

  // ---------- tail ----------
  const tailPath = catmull([
    [0, 0.045, -0.09], [0, 0.05, -0.15], [0, 0.075, -0.2], [0, 0.12, -0.205],
    [0, 0.16, -0.17], [0, 0.18, -0.115], [0, 0.175, -0.065], [0, 0.155, -0.035],
  ]);
  const tail = b.chain("tail", tailPath, { parent: body, count: 8, role: "tail" });
  const tailTube = b.sweep(tail, (t) => 0.017 * (1 - 0.35 * t) * (1 + 0.1 * Math.cos(t * Math.PI * 2 * 7)), {
    sides: 6, color: mottle(SHELL, PLATE_A, { size: 0.025 }), caps: "round",
  });
  b.along(tailTube, 7, (at) => b.spike(at, at, 0.012, 0.0045, { color: SPIKE, sides: 5 }));
  const end = tail.at(1);
  const tipJoint = tail.joints[tail.joints.length - 1];
  b.part(new THREE.SphereGeometry(0.021, 8, 6), PLATE_A, {
    bone: tipJoint, at: tail.at(0.985).at, scale: [1, 1.1, 1.2],
  });
  b.spike(end.at, end.tangent, 0.05, 0.011, { color: DARK, sides: 6, bone: tipJoint });

  // ---------- pincers ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const p0: [number, number, number] = [s * 0.03, 0.04, 0.075];
    const p1: [number, number, number] = [s * 0.078, 0.04, 0.125];
    const p2: [number, number, number] = [s * 0.07, 0.036, 0.18];
    const arm = b.chain(`arm${S}`, polyline([p0, p1, p2]), {
      parent: head, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm",
    });
    b.sweep(arm, [0.014, 0.012], { sides: 6, color: LEG });
    b.part(new THREE.SphereGeometry(0.0165, 6, 5), CLAW, { bone: arm.joints[1], at: p1 });
    const wrist = arm.joints[2];
    // palm
    b.part(new THREE.SphereGeometry(0.03, 8, 6), CLAW, { bone: wrist, at: [s * 0.07, 0.036, 0.205], scale: [1, 0.75, 1.3] });
    b.part(new THREE.BoxGeometry(0.012, 0.01, 0.04), SPIKE, { bone: wrist, at: [s * 0.07, 0.056, 0.205] });
    // fixed finger
    b.sweep(bezier([s * 0.06, 0.036, 0.222], [s * 0.078, 0.036, 0.262], [s * 0.052, 0.036, 0.295]), [0.015, 0], {
      bone: wrist, color: CLAW, sides: 6, caps: "point",
    });
    // movable finger on its own hinge
    const clawJ = b.joint(`pincer${S}`, {
      parent: wrist, at: [s * 0.088, 0.036, 0.215], aim: [s * 0.088, 0.036, 0.26], role: "hinge",
    });
    b.sweep(bezier([s * 0.086, 0.036, 0.212], [s * 0.108, 0.036, 0.255], [s * 0.062, 0.036, 0.292]), [0.014, 0], {
      bone: clawJ, color: CLAW, sides: 6, caps: "point",
    });
    // bumps on the palm
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.SphereGeometry(0.004, 5, 4), SPIKE, { bone: wrist, at: [s * (0.07 + 0.006 * (k - 1)), 0.05, 0.19 + k * 0.012] });
    }
  }

  // ---------- legs ----------
  const hipZ = [0.05, 0.022, -0.006, -0.034];
  const footDz = [0.07, 0.03, -0.025, -0.07];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const hip: [number, number, number] = [s * 0.032, 0.036, hipZ[i]];
      const foot: [number, number, number] = [s * (0.115 + (i === 1 || i === 2 ? 0.01 : 0)), 0.004, hipZ[i] + footDz[i]];
      const pts = limb(hip, foot, [0.04, 0.05, 0.045], [[0, 1, 0], [0, 1, 0]]);
      const n = i + 1;
      const leg = b.chain(`leg${S}${n}`, pts, {
        parent: i < 2 ? head : body,
        names: [`hip${S}${n}`, `knee${S}${n}`, `ankle${S}${n}`, `foot${S}${n}`],
        role: "leg",
      });
      b.sweep(leg, [0.0075, 0.0035], { sides: 5, color: LEG, caps: "round" });
      b.part(new THREE.SphereGeometry(0.0085, 5, 4), CLAW, { bone: leg.joints[1], at: pts[1] });
    }
  }

  return b.root;
}
