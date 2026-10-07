import * as THREE from "three";
import { createBuilder, countershade, rng } from "../../../../src/index";

export const meta = {
  name: "Hedgehog",
  description:
    "A stylized European hedgehog: rounded body with a coat of swept-back quills, pointed snout with a separate lower jaw, small ears, stubby legs, rigged on a spine, head, jaw, leg and tail skeleton.",
};

export default function build() {
  const b = createBuilder({ name: "hedgehog" });
  const random = rng(11);

  const SKIN = "#d6b189";
  const SKIN_LIGHT = "#e8cfa8";
  const DARK = "#2f221a";
  const PINK = "#dba48f";

  // ---------- skeleton ----------
  b.joint("hips", { at: [0, 0.065, -0.08], dir: [0, 0, 1], role: "spine" });
  b.chain(
    "spine",
    [
      [0, 0.065, -0.08],
      [0, 0.068, -0.02],
      [0, 0.07, 0.04],
    ],
    { parent: "hips", role: "spine", names: ["spine1", "spine2", "spine3"] },
  );
  b.joint("head", { parent: "spine3", at: [0, 0.07, 0.06], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.045, 0.1], dir: [0, 0, 1], role: "jaw" });
  b.chain(
    "tail",
    [
      [0, 0.05, -0.115],
      [0, 0.04, -0.14],
    ],
    { parent: "hips", role: "tail", names: ["tail1", "tail2"] },
  );

  // legs
  const legs: Array<[string, number, number, number]> = [
    ["FL", 0.042, 0.025, 1],
    ["FR", -0.042, 0.025, 1],
    ["BL", 0.042, -0.08, -1],
    ["BR", -0.042, -0.08, -1],
  ];
  for (const [id, x, z, dirz] of legs) {
    const parent = dirz > 0 ? "spine3" : "spine1";
    b.chain(
      `leg${id}`,
      [
        [x, 0.045, z],
        [x, 0.026, z + 0.008 * dirz],
        [x, 0.008, z],
      ],
      { parent, role: "leg", names: [`hip${id}`, `knee${id}`, `foot${id}`] },
    );
    b.capsule([x, 0.048, z], [x, 0.026, z + 0.008 * dirz], 0.015, { color: SKIN, bone: `hip${id}` });
    b.capsule([x, 0.026, z + 0.008 * dirz], [x, 0.01, z], 0.011, { color: SKIN, bone: `knee${id}` });
    b.part(new THREE.BoxGeometry(0.026, 0.014, 0.034), "#c79c75", {
      at: [x, 0.007, z + 0.009],
      bone: `foot${id}`,
    });
    for (let k = -1; k <= 1; k++) {
      b.part(new THREE.SphereGeometry(0.0055, 6, 5), DARK, {
        at: [x + k * 0.008, 0.005, z + 0.028 - Math.abs(k) * 0.003],
        bone: `foot${id}`,
      });
    }
  }

  // ---------- body ----------
  const C = new THREE.Vector3(0, 0.068, -0.03);
  const R = new THREE.Vector3(0.07, 0.062, 0.095);
  b.part(new THREE.SphereGeometry(1, 16, 12), countershade("#4a3224", "#e3c9a0", { level: -0.1, soft: 0.3 }), {
    at: C,
    scale: [R.x, R.y, R.z],
    bone: "spine2",
  });

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(1, 14, 10), SKIN, {
    at: [0, 0.066, 0.085],
    scale: [0.04, 0.037, 0.045],
    bone: "head",
  });
  b.spike([0, 0.064, 0.1], [0, 0.05, 0.172], null, 0.026, { color: SKIN, bone: "head", sides: 8 });
  b.part(new THREE.SphereGeometry(0.008, 8, 6), "#1d1512", { at: [0, 0.05, 0.174], bone: "head" });
  b.spike([0, 0.04, 0.105], [0, 0.042, 0.155], null, 0.015, { color: SKIN_LIGHT, bone: "jaw", sides: 8 });
  for (const s of [1, -1]) {
    // eye mask, eye, glint
    b.part(new THREE.SphereGeometry(1, 8, 6), "#4a3426", {
      at: [s * 0.025, 0.077, 0.114],
      scale: [0.011, 0.013, 0.008],
      bone: "head",
    });
    b.part(new THREE.SphereGeometry(0.0075, 8, 6), "#0d0a09", { at: [s * 0.027, 0.078, 0.12], bone: "head" });
    b.part(new THREE.SphereGeometry(0.0022, 5, 4), "#ffffff", { at: [s * 0.0295, 0.0815, 0.1255], bone: "head" });
    // ears
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, {
      at: [s * 0.036, 0.095, 0.07],
      scale: [0.011, 0.018, 0.01],
      bone: "head",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), PINK, {
      at: [s * 0.0385, 0.095, 0.0725],
      scale: [0.006, 0.012, 0.006],
      bone: "head",
    });
    // cheek tufts
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN_LIGHT, {
      at: [s * 0.024, 0.052, 0.1],
      scale: [0.014, 0.012, 0.016],
      bone: "head",
    });
  }
  // tail nub
  b.spike([0, 0.05, -0.112], [0, 0.04, -0.142], null, 0.011, { color: "#b58b66", bone: "tail1", sides: 6 });

  // ---------- quills ----------
  const quill = new THREE.ConeGeometry(0.0055, 0.045, 5, 1, true);
  quill.translate(0, 0.0225, 0);
  const palette = ["#2c1f17", "#3b2a1f", "#8a6a45", "#6b4c30", "#e8d9b8"];
  const pickColor = () => {
    const r = random();
    return r < 0.3 ? palette[0] : r < 0.55 ? palette[1] : r < 0.72 ? palette[3] : r < 0.9 ? palette[2] : palette[4];
  };
  const N = 900;
  for (let i = 0; i < N; i++) {
    const yy = 1 - (2 * (i + 0.5)) / N;
    const r = Math.sqrt(1 - yy * yy);
    const th = i * 2.39996;
    const d = new THREE.Vector3(r * Math.cos(th), yy, r * Math.sin(th));
    if (d.y < -0.2) continue;
    if (d.z > 0.5 && d.y < 0.45) continue;
    const p = new THREE.Vector3(C.x + d.x * R.x * 0.93, C.y + d.y * R.y * 0.93, C.z + d.z * R.z * 0.93);
    const n = new THREE.Vector3(d.x / R.x, d.y / R.y, d.z / R.z).normalize();
    const q = n
      .clone()
      .add(new THREE.Vector3((random() - 0.5) * 0.4, 0.1 + (random() - 0.5) * 0.3, -0.8 + (random() - 0.5) * 0.3))
      .normalize();
    const bone = p.z < -0.06 ? "spine1" : p.z < 0.0 ? "spine2" : p.z < 0.055 ? "spine3" : "head";
    b.part(quill, pickColor(), {
      at: p,
      dir: q,
      scale: [1, 0.85 + random() * 0.5, 1],
      bone,
    });
  }
  // forehead crest
  for (let i = 0; i < 9; i++) {
    const x = (i - 4) * 0.0075;
    const z = 0.062 + random() * 0.025;
    b.part(quill, pickColor(), {
      at: [x, 0.097 - Math.abs(x) * 0.5, z],
      dir: [x * 6, 0.45, -0.8],
      scale: [0.9, 0.7, 0.9],
      bone: "head",
    });
  }

  return b.root;
}
