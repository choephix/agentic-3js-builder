import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Crab",
  description: "Stylized shore crab with eyestalks, two jointed claws with opening pincers and eight walking legs.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "crab" });
  const R = rng(7);

  const SHELL = "#d9532b", DARK = "#a8321a", BELLY = "#f0c9a0", TIP = "#f2e3c8", BLACK = "#15110f", WHITE = "#ffffff", SPOT = "#f08a4b";

  const body = b.joint("body", { at: [0, 0.09, 0] });

  // helpers: geometry is baked in model space, then handed to the builder on a bone
  const seg = (a: number[], c: number[], r0: number, r1: number, color: string, bone: any, sides = 6) => {
    const A = new THREE.Vector3(...a), C = new THREE.Vector3(...c);
    const d = C.clone().sub(A);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, sides);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
    const m = A.clone().add(C).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    b.part(g, color, { bone });
  };
  const ball = (c: number[], r: number[], color: string, bone: any, ws = 10, hs = 7) => {
    const g = new THREE.SphereGeometry(1, ws, hs);
    g.scale(r[0], r[1], r[2]);
    g.translate(c[0], c[1], c[2]);
    b.part(g, color, { bone });
  };
  const knob = (c: number[], r: number, color: string, bone: any) => ball(c, [r, r, r], color, bone, 8, 6);

  // ---- carapace ----
  const cy = 0.09, rx = 0.18, ry = 0.06, rz = 0.125;
  ball([0, cy, 0], [rx, ry, rz], SHELL, body, 16, 10);
  ball([0, cy - 0.025, 0], [rx * 0.95, 0.035, rz * 0.95], BELLY, body, 14, 6);
  ball([0, cy + 0.03, -0.02], [rx * 0.7, 0.04, rz * 0.65], DARK, body, 12, 6);
  ball([0, cy + 0.037, -0.02], [rx * 0.66, 0.036, rz * 0.6], SHELL, body, 12, 6);
  // spots on the shell
  for (let i = 0; i < 14; i++) {
    const x = (R() * 2 - 1) * rx * 0.7, z = (R() * 2 - 1) * rz * 0.7;
    const t = 1 - (x / rx) ** 2 - (z / rz) ** 2;
    if (t <= 0.1) continue;
    const y = cy + ry * Math.sqrt(t) * 0.97;
    ball([x, y, z], [0.012 + R() * 0.008, 0.005, 0.012 + R() * 0.008], SPOT, body, 6, 4);
  }
  // front-edge spikes
  for (let i = 0; i < 5; i++) {
    const a = -0.9 + i * 0.45;
    const x = Math.sin(a) * rx * 0.95, z = Math.cos(a) * rz * 0.95;
    seg([x, cy + 0.015, z], [x * 1.12, cy + 0.04, z * 1.14 + 0.004], 0.012, 0.002, TIP, body);
  }
  // side spikes
  for (const s of [1, -1]) for (let i = 0; i < 2; i++) {
    const z = -0.01 - i * 0.05;
    const x = rx * Math.sqrt(1 - (z / rz) ** 2) * 0.97;
    seg([s * x, cy + 0.01, z], [s * (x + 0.03), cy + 0.03, z - 0.01], 0.011, 0.002, TIP, body);
  }
  // abdomen flap & mouth
  ball([0, 0.05, -0.04], [0.04, 0.012, 0.075], BELLY, body, 8, 5);
  const mouth = b.joint("mouthBase", { at: [0, 0.075, 0.115], parent: body });
  ball([0, 0.075, 0.12], [0.05, 0.02, 0.02], DARK, mouth, 8, 5);
  const jaw = b.joint("jaw", { at: [0, 0.062, 0.125], parent: mouth });
  ball([0, 0.062, 0.128], [0.04, 0.012, 0.016], BELLY, jaw, 8, 5);
  for (const s of [1, -1]) {
    seg([s * 0.015, 0.07, 0.13], [s * 0.025, 0.05, 0.15], 0.008, 0.003, TIP, jaw);
  }

  // ---- eyes ----
  for (const [s, n] of [[1, "L"], [-1, "R"]] as [number, string][]) {
    const eye = b.joint("eyeStalk" + n, { at: [s * 0.055, 0.135, 0.095], parent: body });
    seg([s * 0.055, 0.125, 0.095], [s * 0.06, 0.17, 0.115], 0.01, 0.008, BELLY, eye);
    const ee = b.joint("eye" + n, { at: [s * 0.06, 0.18, 0.12], parent: eye });
    knob([s * 0.06, 0.18, 0.12], 0.018, BLACK, ee);
    knob([s * 0.065, 0.188, 0.135], 0.005, WHITE, ee);
  }

  // ---- walking legs ----
  for (const [s, n] of [[1, "L"], [-1, "R"]] as [number, string][]) {
    for (let i = 0; i < 4; i++) {
      const zh = 0.045 - i * 0.04;
      const hip = b.joint(`hip${n}${i}`, { at: [s * 0.15, 0.085, zh], parent: body });
      const kp = [s * 0.29, 0.185, zh + 0.03 - i * 0.025];
      const knee = b.joint(`knee${n}${i}`, { at: kp, parent: hip });
      const ap = [s * 0.4, 0.11, zh + 0.06 - i * 0.05];
      const ankle = b.joint(`ankle${n}${i}`, { at: ap, parent: knee });
      const fp = [s * 0.45, 0.0, zh + 0.09 - i * 0.075];
      const foot = b.joint(`foot${n}${i}`, { at: fp, parent: ankle });
      seg([s * 0.15, 0.085, zh], kp, 0.017, 0.014, SHELL, hip);
      knob(kp, 0.017, DARK, knee);
      seg(kp, ap, 0.014, 0.011, SHELL, knee);
      knob(ap, 0.012, DARK, ankle);
      seg(ap, fp, 0.011, 0.003, i % 2 ? SHELL : DARK, ankle);
      knob(fp, 0.004, TIP, foot);
    }
  }

  // ---- claws ----
  for (const [s, n] of [[1, "L"], [-1, "R"]] as [number, string][]) {
    const sh = [s * 0.14, 0.095, 0.1];
    const el = [s * 0.25, 0.1, 0.2];
    const wr = [s * 0.22, 0.095, 0.31];
    const shoulder = b.joint(`shoulder${n}`, { at: sh, parent: body });
    const elbow = b.joint(`elbow${n}`, { at: el, parent: shoulder });
    const wrist = b.joint(`wrist${n}`, { at: wr, parent: elbow });
    seg(sh, el, 0.025, 0.022, SHELL, shoulder);
    knob(el, 0.026, DARK, elbow);
    seg(el, wr, 0.024, 0.026, SHELL, elbow);
    knob(wr, 0.024, DARK, wrist);
    // palm
    const pc = [s * 0.21, 0.098, 0.36];
    ball(pc, [0.048, 0.036, 0.062], SHELL, wrist, 12, 8);
    ball([s * 0.21, 0.12, 0.36], [0.03, 0.012, 0.04], SPOT, wrist, 8, 4);
    // fixed finger (inner side)
    const f0 = [s * 0.19, 0.092, 0.405], f1 = [s * 0.165, 0.09, 0.505];
    seg(f0, f1, 0.026, 0.004, TIP, wrist, 5);
    seg([s * 0.185, 0.092, 0.42], [s * 0.172, 0.092, 0.47], 0.02, 0.006, SHELL, wrist, 5);
    for (let k = 0; k < 3; k++) {
      const t = 0.3 + k * 0.22;
      knob([s * (0.185 - 0.024 * t + 0.011), 0.098, 0.405 + 0.1 * t], 0.006, TIP, wrist);
    }
    // moving finger on its own joint (rest: slightly open)
    const cj = b.joint(`clawJaw${n}`, { at: [s * 0.24, 0.095, 0.4], parent: wrist });
    const g0 = [s * 0.24, 0.095, 0.4], g1 = [s * 0.27, 0.09, 0.5];
    seg(g0, g1, 0.024, 0.004, TIP, cj, 5);
    seg([s * 0.243, 0.095, 0.41], [s * 0.262, 0.092, 0.46], 0.019, 0.006, SHELL, cj, 5);
    for (let k = 0; k < 3; k++) {
      const t = 0.3 + k * 0.22;
      knob([s * (0.24 + 0.03 * t - 0.011), 0.098, 0.4 + 0.1 * t], 0.006, TIP, cj);
    }
  }

  return b.root;
}
