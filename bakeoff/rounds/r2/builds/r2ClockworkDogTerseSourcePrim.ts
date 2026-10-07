import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Clockwork Dog",
  description:
    "A tin wind-up toy dog with brass gears, a winding key, rivets, glass eyes, a jointed jaw, ears, legs and a springy tail.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "clockwork_dog" });

  const TIN = "#3f7fbf", TIN2 = "#2f5f93", BRASS = "#c8963e", COPPER = "#b5632e";
  const STEEL = "#8e98a3", DARK = "#22262b", RED = "#c03a2b", WHITE = "#f2efe6";

  // ---------- skeleton ----------
  b.joint("pelvis", { at: [0, 0.27, -0.12] });
  b.chain("spine", [[0, 0.27, -0.1], [0, 0.27, 0.05], [0, 0.29, 0.14]], {
    parent: "pelvis", names: ["spine1", "spine2"], role: "spine",
  });
  b.chain("neck", [[0, 0.3, 0.14], [0, 0.38, 0.25]], { parent: "spine2", names: ["neck1"], role: "neck" });
  b.joint("head", { parent: "neck1", at: [0, 0.38, 0.25], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.355, 0.31], dir: [0, 0, 1], role: "jaw" });
  b.joint("earL", { parent: "head", at: [0.06, 0.465, 0.25], dir: [0.3, 1, 0] });
  b.joint("earR", { parent: "head", at: [-0.06, 0.465, 0.25], dir: [-0.3, 1, 0] });
  b.chain("tail", [[0, 0.3, -0.2], [0, 0.34, -0.26], [0, 0.4, -0.3], [0, 0.47, -0.31]], {
    parent: "pelvis", names: ["tail1", "tail2", "tail3"], role: "tail",
  });
  b.joint("key", { parent: "spine1", at: [0, 0.365, -0.06], dir: [0, 1, 0], role: "hinge" });

  const legs: Array<[string, number, number[][], string[], string]> = [];
  for (const s of [1, -1]) {
    const f = s > 0 ? "L" : "R";
    const x = 0.085 * s;
    legs.push([f, s, [[x, 0.25, 0.1], [x, 0.145, 0.11], [x, 0.045, 0.11]],
      ["shoulder" + f, "elbow" + f, "wrist" + f], "spine2"]);
    legs.push([f, s, [[x, 0.25, -0.14], [x, 0.15, -0.11], [x, 0.05, -0.14]],
      ["hip" + f, "knee" + f, "ankle" + f], "pelvis"]);
  }
  for (const [, , path, names, parent] of legs) b.chain(names[0] + "Leg", path, { parent, names, role: "leg" });

  const seg = (a: number[], c: number[], r0: number, r1: number, color: string, bone: string) => {
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    b.part(new THREE.CylinderGeometry(r1, r0, d.length(), 8), color, {
      at: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2], dir: d.toArray(), bone,
    });
  };

  // legs
  for (const [, s, path, names] of legs) {
    const [a, k, w] = path;
    seg(a, k, 0.036, 0.029, TIN, names[0]);
    seg(k, w, 0.022, 0.022, STEEL, names[1]);
    b.part(new THREE.SphereGeometry(0.037, 8, 6), BRASS, { at: k, bone: names[1] });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), BRASS, { at: a, bone: names[0] });
    for (const t of [0.3, 0.55, 0.8])
      b.part(new THREE.TorusGeometry(0.026, 0.005, 5, 10), COPPER, {
        at: [k[0], k[1] + (w[1] - k[1]) * t, k[2] + (w[2] - k[2]) * t], rotation: [90, 0, 0], bone: names[1],
      });
    b.part(new THREE.BoxGeometry(0.065, 0.036, 0.1), BRASS, { at: [w[0], 0.018, w[2] + 0.02], bone: names[2] });
    b.part(new THREE.BoxGeometry(0.067, 0.02, 0.03), DARK, { at: [w[0], 0.01, w[2] + 0.06], bone: names[2] });
    b.part(new THREE.BoxGeometry(0.02, 0.008, 0.02), STEEL, { at: [w[0] + 0.0 * s, 0.04, w[2] + 0.0], bone: names[2] });
  }

  // torso
  const coat = b.paint ? undefined : undefined;
  void coat;
  b.part(new THREE.BoxGeometry(0.2, 0.19, 0.36), TIN, { at: [0, 0.27, -0.02], bone: "spine1" });
  b.part(new THREE.BoxGeometry(0.212, 0.2, 0.13), BRASS, { at: [0, 0.272, 0.1], bone: "spine2" });
  b.part(new THREE.BoxGeometry(0.206, 0.196, 0.02), COPPER, { at: [0, 0.27, -0.14], bone: "pelvis" });
  b.part(new THREE.BoxGeometry(0.206, 0.196, 0.02), COPPER, { at: [0, 0.27, -0.04], bone: "spine1" });
  b.part(new THREE.BoxGeometry(0.14, 0.02, 0.3), TIN2, { at: [0, 0.37, -0.03], bone: "spine1" });
  // chest vent
  for (let i = 0; i < 4; i++)
    b.part(new THREE.BoxGeometry(0.1, 0.008, 0.01), DARK, { at: [0, 0.23 + i * 0.022, 0.168], bone: "spine2" });
  // rivets
  for (const s of [1, -1])
    for (let i = 0; i < 9; i++) {
      b.part(new THREE.SphereGeometry(0.0065, 6, 4), STEEL, { at: [0.102 * s, 0.34, -0.18 + i * 0.04], bone: "spine1" });
      b.part(new THREE.SphereGeometry(0.0065, 6, 4), STEEL, { at: [0.102 * s, 0.205, -0.18 + i * 0.04], bone: "spine1" });
    }

  // gears on the flanks
  const gear = (c: number[], R: number, n: number, bone: string, color: string) => {
    b.part(new THREE.CylinderGeometry(R, R, 0.012, 14), color, { at: c, rotation: [0, 0, 90], bone });
    b.part(new THREE.CylinderGeometry(R * 0.3, R * 0.3, 0.02, 8), DARK, { at: c, rotation: [0, 0, 90], bone });
    for (let i = 0; i < n; i++) {
      const th = (i / n) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.012, R * 0.28, R * 0.3), color, {
        at: [c[0], c[1] + Math.cos(th) * R * 1.05, c[2] + Math.sin(th) * R * 1.05],
        rotation: [(th * 180) / Math.PI, 0, 0], bone,
      });
    }
    for (let i = 0; i < 4; i++) {
      const th = (i / 4) * Math.PI * 2 + 0.4;
      b.part(new THREE.SphereGeometry(R * 0.08, 5, 4), STEEL, {
        at: [c[0] + Math.sign(c[0]) * 0.005, c[1] + Math.cos(th) * R * 0.6, c[2] + Math.sin(th) * R * 0.6], bone,
      });
    }
  };
  for (const s of [1, -1]) {
    gear([0.106 * s, 0.285, -0.07], 0.05, 10, "spine1", BRASS);
    gear([0.106 * s, 0.24, 0.0], 0.03, 8, "spine1", COPPER);
  }

  // neck + collar
  seg([0, 0.3, 0.14], [0, 0.38, 0.25], 0.065, 0.058, BRASS, "neck1");
  b.part(new THREE.TorusGeometry(0.07, 0.013, 5, 12), RED, { at: [0, 0.34, 0.195], dir: [0, 0.08, 0.1], axis: "z", bone: "neck1" });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.006, 10), BRASS, { at: [0, 0.285, 0.235], rotation: [90, 0, 0], bone: "neck1" });

  // head
  b.part(new THREE.BoxGeometry(0.15, 0.14, 0.14), TIN, { at: [0, 0.41, 0.28], bone: "head" });
  b.part(new THREE.BoxGeometry(0.09, 0.065, 0.11), BRASS, { at: [0, 0.385, 0.385], bone: "head" });
  b.part(new THREE.BoxGeometry(0.04, 0.03, 0.03), DARK, { at: [0, 0.412, 0.446], bone: "head" });
  b.part(new THREE.BoxGeometry(0.152, 0.012, 0.03), COPPER, { at: [0, 0.48, 0.24], bone: "head" });
  // jaw
  b.part(new THREE.BoxGeometry(0.08, 0.024, 0.105), BRASS, { at: [0, 0.343, 0.375], bone: "jaw" });
  b.part(new THREE.BoxGeometry(0.044, 0.008, 0.07), RED, { at: [0, 0.357, 0.39], bone: "jaw" });
  for (const s of [1, -1])
    for (const z of [0.4, 0.425]) {
      b.part(new THREE.ConeGeometry(0.007, 0.018, 4), WHITE, { at: [0.033 * s, 0.364, z], bone: "jaw" });
      b.part(new THREE.ConeGeometry(0.007, 0.018, 4), WHITE, { at: [0.035 * s, 0.357, z], rotation: [180, 0, 0], bone: "head" });
    }
  // eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.027, 8, 6), WHITE, { at: [0.047 * s, 0.44, 0.35], bone: "head" });
    b.part(new THREE.SphereGeometry(0.014, 6, 5), DARK, { at: [0.047 * s, 0.44, 0.373], bone: "head" });
    b.part(new THREE.TorusGeometry(0.028, 0.005, 5, 10), BRASS, { at: [0.047 * s, 0.44, 0.352], bone: "head" });
    b.part(new THREE.BoxGeometry(0.04, 0.008, 0.01), DARK, { at: [0.047 * s, 0.475, 0.352], rotation: [0, 0, -12 * s], bone: "head" });
  }
  // ears
  for (const s of [1, -1]) {
    const n = s > 0 ? "earL" : "earR";
    b.part(new THREE.BoxGeometry(0.016, 0.1, 0.07), TIN2, { at: [0.085 * s, 0.51, 0.25], rotation: [0, 0, -22 * s], bone: n });
    b.part(new THREE.BoxGeometry(0.008, 0.07, 0.045), COPPER, { at: [0.09 * s, 0.508, 0.252], rotation: [0, 0, -22 * s], bone: n });
    b.part(new THREE.ConeGeometry(0.035, 0.04, 4), TIN2, { at: [0.103 * s, 0.57, 0.25], rotation: [0, 45, -22 * s], bone: n });
  }

  // tail: spring coils
  seg([0, 0.3, -0.2], [0, 0.34, -0.26], 0.018, 0.015, STEEL, "tail1");
  seg([0, 0.34, -0.26], [0, 0.4, -0.3], 0.015, 0.014, STEEL, "tail2");
  seg([0, 0.4, -0.3], [0, 0.47, -0.31], 0.014, 0.013, STEEL, "tail3");
  const tailPts: Array<[number[], string]> = [
    [[0, 0.32, -0.23], "tail1"], [[0, 0.37, -0.28], "tail2"], [[0, 0.435, -0.305], "tail3"],
    [[0, 0.46, -0.31], "tail3"],
  ];
  for (const [p, bone] of tailPts)
    b.part(new THREE.TorusGeometry(0.022, 0.005, 5, 9), COPPER, { at: p, dir: [0, 0.6, -0.4], axis: "z", bone });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), RED, { at: [0, 0.49, -0.315], bone: "tail3" });

  // winding key
  b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.06, 6), STEEL, { at: [0, 0.4, -0.06], bone: "key" });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 8), BRASS, { at: [0, 0.372, -0.06], bone: "key" });
  b.part(new THREE.BoxGeometry(0.1, 0.012, 0.012), BRASS, { at: [0, 0.432, -0.06], bone: "key" });
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.03, 0.007, 5, 10), BRASS, { at: [0.06 * s, 0.432, -0.06], rotation: [0, 90, 0], bone: "key" });
    b.part(new THREE.TorusGeometry(0.03, 0.007, 5, 10), BRASS, { at: [0.06 * s, 0.432, -0.06], rotation: [90, 0, 0], bone: "key" });
  }

  return b.root;
}
