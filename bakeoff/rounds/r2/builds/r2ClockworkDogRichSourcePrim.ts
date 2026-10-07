import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Clockwork Terrier",
  description:
    "Wind-up brass and copper terrier with riveted plates, chest gears, a back key, spring legs, leather ears, green lens eyes, a coil-spring tail and a red collar with a brass tag.",
};

export default function build() {
  const b = createBuilder({ name: "clockwork_terrier" });
  const BRASS = "#c9a227", BRIGHT = "#e8c860", COPPER = "#b8662e", DARK = "#3b2a1c";
  const LEATHER = "#6b3a22", RED = "#b3201f", GLASS = "#5fd08a";
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

  // ---------- skeleton ----------
  b.joint("pelvis", { at: [0, 0.3, -0.15], role: "spine" });
  b.chain("spine", [[0, 0.3, -0.15], [0, 0.3, 0.0], [0, 0.3, 0.12]], {
    parent: "pelvis", names: ["spine1", "spine2", "chest"], role: "spine",
  });
  b.chain("neck", [[0, 0.32, 0.12], [0, 0.4, 0.2], [0, 0.45, 0.27]], {
    parent: "chest", names: ["neck1", "neck2", "head"], role: "neck",
  });
  b.joint("jaw", { parent: "head", at: [0, 0.425, 0.33], dir: [0, 0, 1], role: "jaw" });
  b.joint("key", { parent: "spine2", at: [0, 0.42, -0.03], dir: [0, 1, 0], role: "hinge" });

  // ---------- helpers ----------
  const seg = (a: number[], c: number[], r: number, col: string, bone: string, sides = 8) => {
    const A = V(a), B = V(c);
    return b.part(new THREE.CylinderGeometry(r, r, A.distanceTo(B), sides), col, {
      at: A.clone().add(B).multiplyScalar(0.5), dir: B.clone().sub(A), bone,
    });
  };
  const bx = (w: number, h: number, d: number, at: number[], col: string, bone: string, rotation?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at, bone, rotation });
  const ball = (r: number, at: number[], col: string, bone: string, scale?: number[]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { at, bone, scale });
  const rivet = (at: number[], bone: string, r = 0.007) => ball(r, at, BRIGHT, bone);
  const plate = (a: number[], c: number[], w: number, t: number, col: string, bone: string) => {
    const A = V(a), B = V(c);
    return b.part(new THREE.BoxGeometry(w, A.distanceTo(B), t), col, {
      at: A.clone().add(B).multiplyScalar(0.5), dir: B.clone().sub(A), bone,
    });
  };

  // ---------- torso ----------
  bx(0.2, 0.2, 0.25, [0, 0.31, -0.115], COPPER, "pelvis");
  bx(0.21, 0.22, 0.25, [0, 0.315, 0.105], COPPER, "chest");
  // brass belly band + back ridge
  bx(0.222, 0.232, 0.025, [0, 0.31, 0.0], BRASS, "spine2");
  bx(0.045, 0.012, 0.45, [0, 0.418, -0.02], BRASS, "spine2");
  for (let i = 0; i < 8; i++) rivet([0, 0.426, -0.2 + i * 0.055], "spine2", 0.006);
  for (const s of [1, -1]) {
    for (const [y, yy] of [[0.26, 0], [0.36, 0]]) rivet([s * 0.112, y + yy, 0.0], "spine2");
    rivet([s * 0.112, 0.31, 0.0], "spine2");
    // rear side plate
    bx(0.012, 0.15, 0.17, [s * 0.103, 0.31, -0.13], BRASS, "pelvis");
    for (const zz of [-0.205, -0.055]) for (const y of [0.25, 0.37]) rivet([s * 0.11, y, zz], "pelvis");
    // chest recess and frame
    bx(0.006, 0.15, 0.17, [s * 0.108, 0.31, 0.105], "#2a1d14", "chest");
    for (const y of [0.24, 0.38]) bx(0.014, 0.012, 0.185, [s * 0.108, y, 0.105], BRASS, "chest");
    for (const z of [0.01, 0.2]) bx(0.014, 0.15, 0.012, [s * 0.108, 0.31, z + 0.0], BRASS, "chest");
    // belly plate seam
    bx(0.16, 0.012, 0.3, [0, 0.208, 0.0], BRASS, "spine2");
  }
  // chest front plate with rivets
  bx(0.14, 0.12, 0.012, [0, 0.31, 0.232], BRASS, "chest");
  for (const x of [-0.055, 0.055]) for (const y of [0.265, 0.355]) rivet([x, y, 0.24], "chest");

  // ---------- gears ----------
  const gear = (name: string, s: number, y: number, z: number, r: number, teeth: number, col: string) => {
    b.joint(name, { parent: "chest", at: [s * 0.112, y, z], dir: [s, 0, 0] });
    const x = s * 0.114;
    b.part(new THREE.CylinderGeometry(r, r, 0.012, 14), col, { at: [x, y, z], bone: name, rotation: [0, 0, 90] });
    b.part(new THREE.CylinderGeometry(r * 0.35, r * 0.35, 0.02, 8), DARK, { at: [x + s * 0.004, y, z], bone: name, rotation: [0, 0, 90] });
    b.part(new THREE.BoxGeometry(0.012, r * 1.6, 0.008), DARK, { at: [x + s * 0.002, y, z], bone: name });
    b.part(new THREE.BoxGeometry(0.012, 0.008, r * 1.6), DARK, { at: [x + s * 0.002, y, z], bone: name });
    for (let k = 0; k < teeth; k++) {
      const a = (k / teeth) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.012, r * 0.28, r * 0.3), col, {
        at: [x, y + Math.cos(a) * r * 1.05, z + Math.sin(a) * r * 1.05], bone: name,
        rotation: [(a * 180) / Math.PI, 0, 0],
      });
    }
  };
  for (const [s, n] of [[1, "L"], [-1, "R"]] as const) {
    gear("gearBig" + n, s, 0.32, 0.065, 0.048, 10, BRIGHT);
    gear("gearSmall" + n, s, 0.275, 0.145, 0.03, 7, BRASS);
    gear("gearTiny" + n, s, 0.345, 0.15, 0.02, 6, COPPER);
  }

  // ---------- neck, collar, tag ----------
  seg([0, 0.34, 0.14], [0, 0.45, 0.26], 0.05, BRASS, "neck1");
  b.part(new THREE.TorusGeometry(0.06, 0.014, 6, 14), RED, { at: [0, 0.395, 0.2], dir: [0, 1, 1], axis: "z", bone: "neck2" });
  bx(0.03, 0.03, 0.012, [0, 0.38, 0.262], BRIGHT, "neck2", [40, 0, 0]);
  b.part(new THREE.TorusGeometry(0.008, 0.003, 5, 8), BRIGHT, { at: [0, 0.355, 0.265], bone: "neck2" });
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.005, 12), BRASS, { at: [0, 0.325, 0.27], bone: "neck2", rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.007, 8), RED, { at: [0, 0.325, 0.273], bone: "neck2", rotation: [90, 0, 0] });

  // ---------- head ----------
  bx(0.15, 0.14, 0.15, [0, 0.47, 0.29], COPPER, "head");
  bx(0.16, 0.02, 0.08, [0, 0.545, 0.3], BRASS, "head");
  bx(0.09, 0.06, 0.12, [0, 0.45, 0.4], BRASS, "head");
  bx(0.095, 0.012, 0.125, [0, 0.482, 0.4], COPPER, "head");
  ball(0.02, [0, 0.462, 0.468], DARK, "head");
  for (const s of [1, -1]) {
    rivet([s * 0.077, 0.5, 0.25], "head"); rivet([s * 0.077, 0.44, 0.25], "head");
    rivet([s * 0.077, 0.5, 0.33], "head"); rivet([s * 0.077, 0.44, 0.33], "head");
    b.part(new THREE.TorusGeometry(0.027, 0.008, 6, 12), BRIGHT, { at: [s * 0.05, 0.505, 0.365], bone: "head" });
    ball(0.025, [s * 0.05, 0.505, 0.362], GLASS, "head", [1, 1, 0.6]);
    ball(0.011, [s * 0.05, 0.505, 0.378], "#0e2a1a", "head", [1, 1, 0.5]);
    ball(0.005, [s * 0.043, 0.513, 0.381], "#d8ffe6", "head");
  }
  // jaw
  bx(0.08, 0.026, 0.11, [0, 0.405, 0.39], COPPER, "jaw");
  bx(0.05, 0.01, 0.06, [0, 0.42, 0.39], RED, "jaw");
  for (const s of [1, -1]) for (const z of [0.4, 0.44]) bx(0.01, 0.014, 0.01, [s * 0.035, 0.424, z], "#f3ead0", "jaw");
  for (const s of [1, -1]) for (const z of [0.4, 0.44]) bx(0.01, 0.014, 0.01, [s * 0.035, 0.42, z], "#f3ead0", "head");

  // ---------- ears ----------
  for (const [s, n] of [[1, "L"], [-1, "R"]] as const) {
    const e0 = [s * 0.07, 0.54, 0.25], e1 = [s * 0.11, 0.48, 0.25], e2 = [s * 0.13, 0.42, 0.265];
    b.joint("ear" + n + "1", { parent: "head", at: e0, aim: e1, role: "hinge" });
    b.joint("ear" + n + "2", { parent: "ear" + n + "1", at: e1, aim: e2, role: "hinge" });
    plate(e0, e1, 0.075, 0.016, LEATHER, "ear" + n + "1");
    plate(e1, e2, 0.07, 0.014, LEATHER, "ear" + n + "2");
    ball(0.012, [e0[0], e0[1], e0[2]], BRIGHT, "ear" + n + "1");
    rivet([e1[0] + s * 0.004, e1[1], 0.285], "ear" + n + "2", 0.006);
    rivet([e1[0] + s * 0.004, e1[1], 0.215], "ear" + n + "2", 0.006);
  }

  // ---------- legs ----------
  const legs: Array<[string, number, boolean]> = [["FL", 1, true], ["FR", -1, true], ["BL", 1, false], ["BR", -1, false]];
  for (const [n, s, front] of legs) {
    const hip = front ? [s * 0.095, 0.27, 0.16] : [s * 0.095, 0.27, -0.2];
    const knee = front ? [s * 0.1, 0.17, 0.185] : [s * 0.1, 0.18, -0.15];
    const ankle = front ? [s * 0.1, 0.075, 0.17] : [s * 0.1, 0.085, -0.22];
    const paw = [s * 0.1, 0.035, front ? 0.195 : -0.195];
    b.chain("leg" + n, [hip, knee, ankle, paw], {
      parent: front ? "chest" : "pelvis", names: ["hip" + n, "knee" + n, "ankle" + n, "paw" + n], role: "leg",
    });
    ball(0.048, hip, BRASS, "hip" + n);
    seg(hip, knee, 0.03, BRASS, "hip" + n);
    ball(0.034, knee, COPPER, "knee" + n);
    rivet([knee[0] + s * 0.032, knee[1], knee[2]], "knee" + n, 0.01);
    // spring shin
    seg(knee, ankle, 0.011, DARK, "knee" + n, 6);
    const K = V(knee), A = V(ankle);
    for (let i = 0; i < 6; i++) {
      const p = K.clone().lerp(A, 0.14 + i * 0.145);
      b.part(new THREE.TorusGeometry(0.025, 0.0065, 5, 10), i % 2 ? COPPER : BRASS, {
        at: p, dir: A.clone().sub(K), axis: "z", bone: "knee" + n,
      });
    }
    ball(0.026, ankle, BRASS, "ankle" + n);
    bx(0.062, 0.04, 0.1, [paw[0], 0.02, paw[2] + 0.005], BRASS, "ankle" + n);
    for (const dx of [-0.018, 0.018]) bx(0.014, 0.012, 0.012, [paw[0] + dx, 0.012, paw[2] + 0.058], DARK, "ankle" + n);
  }

  // ---------- spring tail ----------
  const tail = b.chain("tail", [[0, 0.37, -0.24], [0, 0.43, -0.33], [0, 0.52, -0.38], [0, 0.62, -0.39]], {
    parent: "pelvis", count: 4, role: "tail",
  });
  for (let i = 0; i < 12; i++) {
    const t = 0.04 + i * 0.08;
    const p = tail.at(t);
    b.part(new THREE.TorusGeometry(0.036 - i * 0.0012, 0.0075, 5, 12), i % 2 ? COPPER : BRASS, {
      at: p.at, dir: p.tangent, axis: "z", bone: p.bone!,
    });
  }
  const t0 = tail.at(0.02), t1 = tail.at(1);
  seg(t0.at.toArray(), t1.at.toArray(), 0.01, DARK, "tail1", 6);
  b.part(new THREE.SphereGeometry(0.022, 8, 6), BRIGHT, { at: t1.at, bone: "tail4" });
  ball(0.03, [0, 0.37, -0.235], BRASS, "pelvis");

  // ---------- winding key ----------
  seg([0, 0.42, -0.03], [0, 0.5, -0.03], 0.01, BRASS, "key", 6);
  b.part(new THREE.CylinderGeometry(0.02, 0.024, 0.02, 8), BRIGHT, { at: [0, 0.43, -0.03], bone: "key" });
  bx(0.1, 0.014, 0.012, [0, 0.505, -0.03], BRIGHT, "key");
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.032, 0.009, 5, 12), BRASS, { at: [s * 0.062, 0.525, -0.03], bone: "key" });
    ball(0.012, [s * 0.062, 0.525, -0.03], COPPER, "key", [1, 1, 0.5]);
  }

  b.root.position.y = 0;
  return b.root;
}
