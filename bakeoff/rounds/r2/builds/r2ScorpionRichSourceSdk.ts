import * as THREE from "three";
import { createBuilder, catmull } from "../../../../src/index";
import { countershade, mottle } from "../../../../src/index";

export const meta = {
  name: "Desert Scorpion",
  description:
    "Threatening amber scorpion with tail arched over its back, forward pincers, eight legs, banded segments, dark bulbous stinger and a cluster of black eyes.",
};

export default function build() {
  const b = createBuilder({ name: "scorpion" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const AMBER = "#dc9526";
  const DARK = "#55290d";
  const DEEP = "#2b140a";
  const EYE = "#050505";
  const shell = countershade(mottle("#dd9a2a", "#cf8520", { size: 0.012, seed: 3 }), "#eebb5e", {
    level: -0.1,
    soft: 0.4,
  });

  const sphere = new THREE.SphereGeometry(1, 10, 7);
  const box = new THREE.BoxGeometry(1, 1, 1);
  const cyl = new THREE.CylinderGeometry(1, 1, 1, 10);

  // ---------- skeleton ----------
  b.joint("body", { at: [0, 0.022, 0], dir: [0, 0, 1] });
  b.joint("head", { parent: "body", at: [0, 0.024, 0.04], dir: [0, 0, 1] });
  b.joint("jaw", { parent: "head", at: [0, 0.019, 0.062], dir: [0, 0, 1], role: "jaw" });
  const spine = b.chain("spine", catmull([[0, 0.022, 0.015], [0, 0.022, -0.006], [0, 0.022, -0.03], [0, 0.022, -0.052]]), {
    parent: "body",
    role: "spine",
  });

  // ---------- head shield ----------
  b.part(sphere, shell, { bone: "head", at: [0, 0.026, 0.038], scale: [0.02, 0.008, 0.024] });
  b.part(sphere, AMBER, { bone: "head", at: [0, 0.0345, 0.041], scale: [0.005, 0.0035, 0.005] });
  const hgt = (x: number, z: number) =>
    0.026 + 0.008 * Math.sqrt(Math.max(0, 1 - (x / 0.02) ** 2 - ((z - 0.038) / 0.024) ** 2));
  for (const s of [1, -1]) {
    b.part(sphere, EYE, { bone: "head", at: [s * 0.0023, 0.0368, 0.0415], scale: 0.0014 });
    for (const [x, z] of [[0.011, 0.052], [0.0135, 0.047], [0.015, 0.042]]) {
      b.part(sphere, EYE, { bone: "head", at: [s * x, hgt(x, z) + 0.0002, z], scale: 0.0012 });
    }
  }
  // chelicerae: fixed upper, hinged lower jaw
  for (const s of [1, -1]) {
    b.part(box, AMBER, { bone: "head", at: [s * 0.0045, 0.0215, 0.063], scale: [0.0055, 0.004, 0.009] });
    b.part(box, DARK, { bone: "head", at: [s * 0.0045, 0.0195, 0.067], scale: [0.003, 0.0015, 0.004] });
  }
  b.part(box, DARK, { bone: "jaw", at: [0, 0.0185, 0.066], scale: [0.009, 0.0018, 0.007] });

  // ---------- mesosoma ----------
  for (let i = 0; i < 6; i++) {
    const z = 0.012 - i * 0.0125;
    const w = 0.018 - i * 0.0012;
    const h = 0.0088 - i * 0.0003;
    const bone = `spine${Math.min(3, Math.floor(i / 2) + 1)}`;
    b.part(sphere, shell, { bone, at: [0, 0.022, z], scale: [w, h, 0.0072] });
    b.part(sphere, DARK, { bone, at: [0, 0.022 + h * 0.8, z], scale: [0.0016, 0.0018, 0.0055] });
    if (i < 5)
      b.part(cyl, DARK, {
        bone,
        at: [0, 0.0215, z - 0.00625],
        rotation: [90, 0, 0],
        scale: [w * 0.9, 0.0022, h * 0.92],
      });
  }
  b.part(sphere, "#c88a38", { bone: "body", at: [0, 0.0155, -0.012], scale: [0.011, 0.004, 0.034] });

  // ---------- tail ----------
  const tailPts = [
    [0, 0.022, -0.052], [0, 0.028, -0.075], [0, 0.048, -0.092], [0, 0.073, -0.09],
    [0, 0.092, -0.072], [0, 0.099, -0.048], [0, 0.094, -0.026],
  ];
  const tail = b.chain("tail", catmull(tailPts), { parent: "spine3", role: "tail" });
  const ts = tail.ts;
  const bands: Array<[number, string]> = [];
  for (let k = 1; k < ts.length - 1; k++) {
    bands.push([ts[k] - 0.014, AMBER], [ts[k] + 0.014, DARK]);
  }
  bands.push([1, AMBER]);
  b.sweep(tail, {
    radius: (t: number) => {
      let d = 1;
      for (let k = 1; k < ts.length - 1; k++) d = Math.min(d, Math.abs(t - ts[k]));
      return (0.0088 - 0.0028 * t) * (0.86 + 0.14 * Math.min(1, d / 0.035));
    },
    bands,
    caps: { start: "round", end: "round" },
    sides: 8,
  });
  const end = tail.at(1);
  const E = end.at;
  const T = end.axis.clone().normalize();
  const lastJ = tail.joints[tail.joints.length - 1];
  b.part(sphere, DEEP, { bone: lastJ, at: E.clone().addScaledVector(T, 0.004), scale: [0.0072, 0.0072, 0.0095], quat: undefined });
  const base = E.clone().addScaledVector(T, 0.011);
  const p1 = base.clone().addScaledVector(T, 0.005);
  const p2 = p1.clone().addScaledVector(T, 0.003).add(V(0, -0.004, 0.0035));
  const p3 = p2.clone().add(V(0, -0.004, 0.0035));
  b.sweep(catmull([base, p1, p2, p3]), [0.0028, 0.0003], {
    color: "#150805",
    bone: lastJ,
    caps: { start: "flat", end: "point" },
    sides: 6,
  });

  // ---------- pincers ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${S}`,
      catmull([[s * 0.01, 0.019, 0.052], [s * 0.026, 0.02, 0.068], [s * 0.026, 0.02, 0.092]]),
      { parent: "head", names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" },
    );
    const at = arm.ts;
    b.sweep(arm, {
      radius: [0.0045, 0.0038],
      bands: [[at[1] - 0.04, AMBER], [at[1] + 0.04, DARK], [1, AMBER]],
      caps: { start: "round", end: "round" },
    });
    const wrist = arm.joints[arm.joints.length - 1];
    b.part(sphere, shell, { bone: wrist, at: [s * 0.026, 0.02, 0.1], scale: [0.0085, 0.0055, 0.0105] });
    b.part(cyl, DARK, { bone: wrist, at: [s * 0.026, 0.02, 0.091], rotation: [90, 0, 0], scale: [0.0048, 0.002, 0.0042] });
    b.sweep(
      catmull([[s * 0.0305, 0.02, 0.104], [s * 0.0318, 0.02, 0.12], [s * 0.0222, 0.02, 0.142]]),
      [0.0042, 0.0005],
      { color: AMBER, bone: wrist, caps: { start: "flat", end: "point" }, sides: 6 },
    );
    const cj = b.joint(`clawJaw${S}`, { parent: wrist, at: [s * 0.0215, 0.02, 0.104], dir: [0, 0, 1], role: "jaw" });
    b.sweep(
      catmull([[s * 0.0215, 0.02, 0.104], [s * 0.0195, 0.02, 0.12], [s * 0.0245, 0.02, 0.141]]),
      [0.0038, 0.0005],
      { color: "#e3a233", bone: cj, caps: { start: "flat", end: "point" }, sides: 6 },
    );
  }

  // ---------- legs ----------
  const hipZ = [0.034, 0.018, 0.002, -0.014];
  const footZ = [0.064, 0.036, -0.004, -0.042];
  const footX = [0.05, 0.058, 0.058, 0.052];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const hz = hipZ[i];
      const fz = footZ[i];
      const pts = [
        [s * 0.013, 0.017, hz],
        [s * 0.028, 0.034, hz + (fz - hz) * 0.35],
        [s * 0.042, 0.036, hz + (fz - hz) * 0.6],
        [s * footX[i], -0.0005, fz],
      ];
      const leg = b.chain(`leg${S}${i + 1}`, catmull(pts), {
        parent: "body",
        names: [`coxa${S}${i + 1}`, `knee${S}${i + 1}`, `ankle${S}${i + 1}`],
        role: "leg",
      });
      b.sweep(leg, {
        radius: [0.003, 0.0011],
        bands: [[0.3, AMBER], [0.38, DARK], [0.62, AMBER], [0.7, DARK], [1, "#c98324"]],
        caps: { start: "round", end: "point" },
        sides: 6,
      });
    }
  }

  return b.root;
}
