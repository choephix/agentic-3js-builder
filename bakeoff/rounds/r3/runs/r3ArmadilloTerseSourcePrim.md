```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Armadillo",
  description: "Nine-banded armadillo in a rest pose: banded shell, pointed snout, ears, four clawed legs, ringed tail, jointed jaw.",
};

export default function build() {
  const b = createBuilder({ name: "armadillo" });
  const SHELL = ["#8a7867", "#75645a"];
  const SHELL_D = "#5f5148";
  const SKIN = "#c9a58f";
  const PINK = "#d99a8f";
  const CLAW = "#efe6d6";

  const sph = (w = 10, h = 8) => new THREE.SphereGeometry(1, w, h);
  const ell = (c: string, at: number[], r: number[], bone: string, rot?: number[]) =>
    b.part(sph(), c, { at, scale: r, bone, rotation: rot });

  // skeleton
  const root = b.joint("root", { at: [0, 0.16, -0.05], dir: [0, 0, 1], role: "spine" });
  b.joint("spine", { parent: root, at: [0, 0.16, 0.08], dir: [0, 0, 1], role: "spine" });
  b.joint("neck", { parent: "spine", at: [0, 0.155, 0.19], dir: [0, 0, 1], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 0.145, 0.26], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.12, 0.29], dir: [0, 0, 1], role: "jaw" });
  b.joint("earL", { parent: "head", at: [0.04, 0.19, 0.26], dir: [0.2, 1, 0], role: "hinge" });
  b.joint("earR", { parent: "head", at: [-0.04, 0.19, 0.26], dir: [-0.2, 1, 0], role: "hinge" });

  // shell: front shield, 9 bands, rear shield
  ell(SHELL_D, [0, 0.155, 0.15], [0.12, 0.105, 0.075], "spine");
  ell(SHELL_D, [0, 0.15, -0.16], [0.115, 0.1, 0.08], "root");
  for (let i = 0; i < 9; i++) {
    const z = 0.1 - i * 0.026;
    const k = Math.sqrt(Math.max(0.15, 1 - Math.pow((z + 0.03) / 0.24, 2)));
    ell(SHELL[i % 2], [0, 0.15, z], [0.135 * k + 0.004, 0.125 * k + 0.004, 0.022], i < 3 ? "spine" : "root");
  }
  // shield studs
  for (let i = 0; i < 6; i++) {
    const a = -0.9 + i * 0.36;
    const x = Math.sin(a) * 0.1;
    const y = 0.155 + Math.cos(a) * 0.1;
    ell("#a39080", [x, y, 0.17], [0.013, 0.013, 0.012], "spine");
    ell("#a39080", [x * 0.97, y - 0.005, -0.19], [0.013, 0.013, 0.012], "root");
  }
  // belly
  ell(SKIN, [0, 0.095, 0.0], [0.1, 0.055, 0.2], "root");

  // head
  ell(SKIN, [0, 0.14, 0.285], [0.055, 0.052, 0.07], "head");
  ell(SHELL_D, [0, 0.172, 0.27], [0.062, 0.035, 0.065], "head");
  b.part(new THREE.ConeGeometry(0.04, 0.15, 8), SKIN, { at: [0, 0.135, 0.38], rotation: [90, 0, 0], scale: [1, 1, 0.75], bone: "head" });
  ell(PINK, [0, 0.133, 0.455], [0.016, 0.014, 0.014], "head");
  ell("#1a1412", [0.044, 0.158, 0.315], [0.011, 0.011, 0.011], "head");
  ell("#1a1412", [-0.044, 0.158, 0.315], [0.011, 0.011, 0.011], "head");
  b.part(new THREE.BoxGeometry(0.05, 0.014, 0.11), PINK, { at: [0, 0.108, 0.355], bone: "jaw" });
  ell(PINK, [0, 0.108, 0.41], [0.02, 0.008, 0.02], "jaw");
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.026, 0.075, 6), SHELL[0], {
      at: [s * 0.05, 0.215, 0.255], rotation: [-8, 0, -s * 22], scale: [1, 1, 0.4], bone: s > 0 ? "earL" : "earR",
    });
    b.part(new THREE.ConeGeometry(0.014, 0.05, 6), PINK, {
      at: [s * 0.05, 0.213, 0.264], rotation: [-8, 0, -s * 22], scale: [1, 1, 0.3], bone: s > 0 ? "earL" : "earR",
    });
  }

  // legs
  const legs: [string, number, number][] = [["FL", 1, 0.14], ["FR", -1, 0.14], ["HL", 1, -0.15], ["HR", -1, -0.15]];
  for (const [n, s, z] of legs) {
    const front = z > 0;
    const hip = [s * 0.085, 0.11, z];
    const knee = [s * 0.105, 0.065, z + (front ? 0.015 : -0.015)];
    const ankle = [s * 0.105, 0.03, z + (front ? 0.02 : -0.01)];
    const ch = b.chain("leg" + n, [hip, knee, ankle], {
      parent: front ? "spine" : "root",
      names: ["hip" + n, "knee" + n, "ankle" + n],
      role: "leg",
    });
    void ch;
    b.capsule(hip, knee, 0.03, { color: SKIN, bone: "hip" + n });
    b.capsule(knee, ankle, 0.022, { color: SKIN, bone: "knee" + n });
    const pz = ankle[2] + 0.025;
    b.part(new THREE.BoxGeometry(0.05, 0.024, 0.07), SKIN, { at: [ankle[0], 0.012, pz], bone: "ankle" + n });
    const nc = front ? 4 : 3;
    for (let c = 0; c < nc; c++) {
      const x = ankle[0] + (c - (nc - 1) / 2) * (front ? 0.014 : 0.016);
      b.part(new THREE.ConeGeometry(0.007, front ? 0.04 : 0.025, 5), CLAW, {
        at: [x, 0.011, pz + 0.035 + (front ? 0.012 : 0.004)], rotation: [90, 0, 0], bone: "ankle" + n,
      });
    }
  }

  // tail
  const tailPts = [[0, 0.15, -0.2], [0, 0.135, -0.3], [0, 0.1, -0.4], [0, 0.065, -0.5], [0, 0.04, -0.6]];
  const tail = b.chain("tail", tailPts, { parent: "root", role: "tail" });
  b.sweep(tail, [0.045, 0.036, 0.026, 0.015, 0.006], { color: "#7d6b5d", sides: 8 });
  for (let i = 0; i < 6; i++) {
    const t = 0.05 + i * 0.16;
    const p = tail.at(t);
    const r = 0.047 * (1 - t * 0.85);
    b.part(new THREE.TorusGeometry(r, 0.006, 4, 8).rotateX(Math.PI / 2), SHELL_D, { frame: p, bone: p.bone! });
  }

  return b.root;
}
```