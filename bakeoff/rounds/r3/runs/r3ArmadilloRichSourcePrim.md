```ts
import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, scales, stripes, rng, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Nine-banded armadillo",
  description:
    "A trotting-pose nine-banded armadillo: banded pinkish-tan shell, pointed snout, tall ears, clawed feet, tapering ringed tail and pale hairs between the bands.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "armadillo", paintSize: 2048 });
  const R = rng(11);

  const SKIN = "#b98f80";
  const BELLY = "#e0c8b0";
  const CLAW = "#efe3cf";
  const HAIR = "#f1e6d2";
  const BELLY_Y = 0.128;

  // ---------- skeleton ----------
  b.joint("pelvis", { at: [0, 0.15, -0.12], dir: [0, 0, 1] });
  b.joint("spine1", { parent: "pelvis", at: [0, 0.15, -0.02], dir: [0, 0, 1] });
  b.joint("spine2", { parent: "spine1", at: [0, 0.15, 0.08], dir: [0, 0, 1] });
  b.joint("neck", { parent: "spine2", at: [0, 0.15, 0.15], dir: [0, 0, 1] });
  b.joint("head", { parent: "neck", at: [0, 0.148, 0.21], dir: [0, 0, 1] });
  b.joint("jaw", { parent: "head", at: [0, 0.126, 0.262], dir: [0, -0.04, 1], role: "jaw" });
  b.joint("earL", { parent: "head", at: [0.04, 0.178, 0.232], dir: [0.4, 1, -0.3] });
  b.joint("earR", { parent: "head", at: [-0.04, 0.178, 0.232], dir: [-0.4, 1, -0.3] });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.15, -0.2],
      [0, 0.13, -0.34],
      [0, 0.09, -0.5],
      [0, 0.045, -0.66],
    ]),
    { parent: "pelvis", count: 4, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---------- shell ----------
  const bw = (z: number) => 0.095 * Math.sqrt(Math.max(0.12, 1 - ((z + 0.02) / 0.2) ** 2));
  const bh = (z: number) => 0.085 * Math.sqrt(Math.max(0.12, 1 - ((z + 0.02) / 0.2) ** 2));
  const boneAt = (z: number) => (z > 0.06 ? "spine2" : z < -0.1 ? "pelvis" : "spine1");

  const shieldPaint = paint((p, n) => {
    if (p.y < BELLY_Y) return BELLY;
    return scales(["#c8998a", "#bf8f7f", "#cfa192"], "#8f6455", { size: 0.017, width: 0.14, seed: 3 }).at(p, n);
  });

  // shoulder shield + dome
  b.part(new THREE.CylinderGeometry(1, 1, 1, 14, 1).rotateX(Math.PI / 2), shieldPaint, {
    at: [0, 0.145, 0.115], scale: [bw(0.115), bh(0.115), 0.062], bone: "spine2", name: "shoulderShield",
  });
  b.part(new THREE.SphereGeometry(1, 14, 8), shieldPaint, {
    at: [0, 0.145, 0.135], scale: [bw(0.14) * 0.97, bh(0.14) * 1.0, 0.05], bone: "spine2", name: "shoulderDome",
  });
  // pelvic shield + dome
  b.part(new THREE.CylinderGeometry(1, 1, 1, 14, 1).rotateX(Math.PI / 2), shieldPaint, {
    at: [0, 0.145, -0.115], scale: [bw(-0.115), bh(-0.115), 0.075], bone: "pelvis", name: "pelvicShield",
  });
  b.part(new THREE.SphereGeometry(1, 14, 8), shieldPaint, {
    at: [0, 0.143, -0.16], scale: [bw(-0.16) * 0.97, bh(-0.16) * 1.0, 0.05], bone: "pelvis", name: "pelvicDome",
  });

  // nine bands
  const len = 0.027;
  for (let i = 0; i < 9; i++) {
    const z = 0.07 - i * 0.0165;
    const base = i % 2 ? "#bd8a78" : "#cb9c8b";
    const front = z + len / 2;
    const bp = paint((p) => {
      if (p.y < BELLY_Y) return BELLY;
      const f = smoothstep(0.55, 1, (front - p.z) / len);
      const ridge = smoothstep(0.1, 0.0, (front - p.z) / len) * 0.25;
      return mix(mix(base, "#e2b7a4", ridge), "#946657", f * 0.7);
    });
    b.part(new THREE.CylinderGeometry(1, 1, 1, 14, 1).rotateX(Math.PI / 2), bp, {
      at: [0, 0.145, z], scale: [bw(z) * 1.005, bh(z) * 1.005, len], bone: boneAt(z), name: `band${i + 1}`,
    });
  }
  // belly core to close the underside
  b.part(new THREE.SphereGeometry(1, 12, 8), BELLY, {
    at: [0, 0.128, -0.02], scale: [0.08, 0.05, 0.17], bone: "spine1", name: "belly",
  });

  // hairs between bands
  const hairGeo = () => new THREE.ConeGeometry(0.0016, 0.03, 3).translate(0, 0.015, 0);
  for (let i = -1; i < 10; i++) {
    const z = 0.07 - i * 0.0165 - 0.014;
    for (const sx of [1, -1]) {
      for (let k = 0; k < 3; k++) {
        const phi = -0.35 + R() * 0.8;
        const zz = z + (R() - 0.5) * 0.008;
        const w = bw(zz) * 1.005;
        const h = bh(zz) * 1.005;
        const at: [number, number, number] = [sx * w * Math.cos(phi), 0.145 + h * Math.sin(phi), zz];
        const dir: [number, number, number] = [sx * Math.cos(phi), Math.sin(phi) * 0.7 - 0.1, -0.7 - R() * 0.3];
        b.part(hairGeo(), HAIR, { at, dir, bone: boneAt(zz), name: "hair" });
      }
    }
  }

  // ---------- tail ----------
  const rad = (t: number) => 0.03 * (1 - t) + 0.005;
  b.sweep(tail, rad, {
    color: stripes("#c0907f", "#a4705f", { size: 0.03, axis: "z", width: 0.3, wobble: 0.1, seed: 2 }),
    name: "tail",
  });
  for (let i = 0; i < 8; i++) {
    const t = 0.06 + i * 0.12;
    b.part(new THREE.TorusGeometry(rad(t) * 1.02, 0.004, 4, 9).rotateX(Math.PI / 2), i % 2 ? "#b88572" : "#cc9d8b", {
      frame: tail.at(t), name: "tailRing",
    });
  }

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(1, 12, 8), SKIN, {
    at: [0, 0.146, 0.248], scale: [0.046, 0.04, 0.056], bone: "head", name: "skull",
  });
  b.part(new THREE.SphereGeometry(1, 12, 6), paint((p, n) => scales(["#c8998a", "#bf8f7f"], "#8f6455", { size: 0.012, width: 0.14, seed: 8 }).at(p, n)), {
    at: [0, 0.166, 0.248], scale: [0.045, 0.026, 0.058], bone: "head", name: "headCap",
  });
  b.part(new THREE.ConeGeometry(0.034, 0.115, 6).translate(0, 0.0575, 0), SKIN, {
    at: [0, 0.148, 0.268], dir: [0, -0.2, 1], scale: [1, 1, 0.78], bone: "head", name: "snout",
  });
  b.part(new THREE.SphereGeometry(0.0095, 8, 6), "#8a5a52", { at: [0, 0.124, 0.379], bone: "head", name: "nose" });
  b.part(new THREE.ConeGeometry(0.025, 0.085, 6).translate(0, 0.0425, 0), "#d8b3a2", {
    at: [0, 0.126, 0.262], dir: [0, -0.04, 1], scale: [1, 1, 0.65], bone: "jaw", name: "lowerJaw",
  });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0075, 8, 6), "#14100f", { at: [s * 0.038, 0.157, 0.283], bone: "head", name: "eye" });
    b.part(new THREE.SphereGeometry(0.0022, 6, 4), "#ffffff", { at: [s * 0.041, 0.1605, 0.2895], bone: "head", name: "eyeGlint" });
    const j = s > 0 ? "earL" : "earR";
    const d: [number, number, number] = [s * 0.4, 1, -0.3];
    const p0: [number, number, number] = [s * 0.04, 0.178, 0.232];
    b.part(new THREE.ConeGeometry(0.03, 0.105, 4).translate(0, 0.0525, 0), SKIN, {
      at: p0, dir: d, scale: [1, 1, 0.3], bone: j, name: "ear",
    });
    b.part(new THREE.ConeGeometry(0.02, 0.08, 4).translate(0, 0.04, 0), "#d9a496", {
      at: [p0[0], p0[1] - 0.002, p0[2] + 0.005], dir: d, scale: [1, 1, 0.3], bone: j, name: "earInner",
    });
  }

  // ---------- legs ----------
  const leg = (sx: number, front: boolean) => {
    const sd = sx > 0 ? "L" : "R";
    const k = front ? "F" : "H";
    const x = sx * (front ? 0.07 : 0.075);
    const hip: [number, number, number] = [x, 0.115, front ? 0.09 : -0.12];
    const knee: [number, number, number] = front ? [x * 1.06, 0.07, 0.1] : [x * 1.08, 0.075, -0.09];
    const ankle: [number, number, number] = front ? [x * 1.06, 0.032, 0.095] : [x * 1.06, 0.035, -0.125];
    const pawAt: [number, number, number] = [ankle[0], 0.02, ankle[2] + 0.018];
    const toe: [number, number, number] = [ankle[0], 0.014, ankle[2] + 0.04];
    const jh = b.joint(`hip${k}${sd}`, { parent: "spine1", at: hip, aim: knee });
    const jk = b.joint(`knee${k}${sd}`, { parent: jh, at: knee, aim: ankle });
    const ja = b.joint(`ankle${k}${sd}`, { parent: jk, at: ankle, aim: pawAt });
    const jp = b.joint(`paw${k}${sd}`, { parent: ja, at: pawAt, aim: toe });
    b.capsule(hip, knee, [0.027, 0.02], { color: SKIN, bone: jh, name: `thigh${k}${sd}` });
    b.capsule(knee, ankle, [0.02, 0.014], { color: SKIN, bone: jk, name: `shin${k}${sd}` });
    b.capsule(ankle, toe, 0.0145, { color: SKIN, bone: ja, name: `foot${k}${sd}` });
    const cl = front ? 0.032 : 0.022;
    for (const o of [-0.012, 0, 0.012]) {
      b.part(new THREE.ConeGeometry(0.0055, cl, 5).translate(0, cl / 2, 0), CLAW, {
        at: [toe[0] + o, 0.012, toe[2] + 0.005], dir: [o * 3, -0.22, 1], bone: jp, name: `claw${k}${sd}`,
      });
    }
    // a scaly cuff above the knee
    b.part(new THREE.SphereGeometry(1, 8, 6), paint((p, n) => scales("#c3917f", "#8f6455", { size: 0.011, seed: 4 }).at(p, n)), {
      at: [hip[0] * 1.03, 0.1, hip[2] + (front ? 0.012 : -0.005)], scale: [0.025, 0.03, 0.04], bone: jh, name: "legScale",
    });
  };
  leg(1, true);
  leg(-1, true);
  leg(1, false);
  leg(-1, false);

  return b.root;
}
```