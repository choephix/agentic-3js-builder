import * as THREE from "three";
import { createBuilder, countershade, mottle } from "../../../../src/index";

export const meta = {
  name: "Lion",
  description: "Stylized male lion in a rest pose: rigged spine, neck, jaw, four legs and tail, with a spiky layered mane.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lion" });
  const TAN = "#c99a55";
  const CREAM = "#ead6aa";
  const coat = countershade(mottle(TAN, "#bf8f4c", { size: 0.25, contrast: 0.6 }), CREAM, { level: -0.25, soft: 0.5 });
  const MANE1 = "#5e3416";
  const MANE2 = "#86501f";
  const DARK = "#2a1a10";

  // ---- skeleton ----
  b.joint("pelvis", { at: [0, 0.95, -0.45] });
  b.chain("spine", [[0, 0.95, -0.45], [0, 1.0, 0.0], [0, 1.05, 0.45]], {
    parent: "pelvis", role: "spine", names: ["spine1", "spine2"],
  });
  b.chain("neck", [[0, 1.05, 0.45], [0, 1.12, 0.62], [0, 1.15, 0.8]], {
    parent: "spine2", role: "neck", names: ["neck1", "neck2", "head"],
  });
  b.joint("jaw", { parent: "head", at: [0, 1.06, 0.98], dir: [0, 0, 1], role: "jaw" });
  b.chain("tail", [[0, 0.95, -0.7], [0, 0.88, -1.1], [0, 0.74, -1.5], [0, 0.62, -1.85]], {
    parent: "pelvis", role: "tail", names: ["tail1", "tail2", "tail3"],
  });

  const seg = (a: number[], c: number[], ra: number, rb: number, bone: string) => {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...c);
    const len = A.distanceTo(B);
    b.part(new THREE.CylinderGeometry(rb, ra, len, 8, 1), coat, {
      at: A.clone().lerp(B, 0.5), dir: B.clone().sub(A).toArray(), bone,
    });
  };
  const ball = (at: number[], scale: number[], color: any, bone: string, seg = 10) =>
    b.part(new THREE.SphereGeometry(1, seg, Math.max(5, seg - 3)), color, { at, scale, bone });

  // ---- legs ----
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = 0.2 * s;
    b.chain("legF" + S, [[x, 0.9, 0.4], [x, 0.5, 0.43], [x, 0.12, 0.4]], {
      parent: "spine2", role: "arm", names: ["shoulder" + S, "elbow" + S, "wrist" + S],
    });
    b.chain("legH" + S, [[x, 0.95, -0.5], [x * 1.2, 0.6, -0.38], [x, 0.32, -0.62], [x, 0.1, -0.55]], {
      parent: "pelvis", role: "leg", names: ["hip" + S, "knee" + S, "hock" + S, "ankle" + S],
    });

    // front
    ball([x, 0.82, 0.4], [0.13, 0.25, 0.2], coat, "shoulder" + S);
    seg([x, 0.78, 0.4], [x, 0.5, 0.43], 0.1, 0.075, "shoulder" + S);
    ball([x, 0.5, 0.43], [0.08, 0.08, 0.08], coat, "elbow" + S, 8);
    ball([x, 0.52, 0.34], [0.045, 0.1, 0.045], MANE1, "elbow" + S, 6);
    seg([x, 0.5, 0.43], [x, 0.14, 0.4], 0.075, 0.06, "elbow" + S);
    ball([x, 0.06, 0.44], [0.095, 0.065, 0.15], CREAM, "wrist" + S);
    // hind
    ball([x * 1.1, 0.8, -0.48], [0.16, 0.25, 0.22], coat, "hip" + S);
    seg([x, 0.85, -0.5], [x * 1.2, 0.6, -0.38], 0.12, 0.075, "hip" + S);
    ball([x * 1.2, 0.6, -0.38], [0.08, 0.08, 0.08], coat, "knee" + S, 8);
    seg([x * 1.2, 0.6, -0.38], [x, 0.32, -0.62], 0.075, 0.052, "knee" + S);
    seg([x, 0.32, -0.62], [x, 0.12, -0.55], 0.052, 0.05, "hock" + S);
    ball([x, 0.06, -0.5], [0.09, 0.065, 0.15], CREAM, "ankle" + S);
    // toes
    for (const [bn, z] of [["wrist" + S, 0.58], ["ankle" + S, -0.36]] as [string, number][])
      for (const k of [-1, 0, 1])
        ball([x + k * 0.04, 0.03, z], [0.032, 0.03, 0.04], CREAM, bn, 6);

    // head details
    const hx = 0.1 * s;
    ball([hx, 1.21, 1.07], [0.035, 0.035, 0.03], "#d8a21a", "head", 8);
    ball([hx * 1.02, 1.21, 1.095], [0.015, 0.025, 0.012], DARK, "head", 6);
    b.part(new THREE.BoxGeometry(0.1, 0.03, 0.08), MANE1, { at: [hx, 1.255, 1.06], rotation: [0, 0, -12 * s], bone: "head" });
    ball([0.16 * s, 1.36, 0.86], [0.06, 0.07, 0.025], coat, "head", 8);
    ball([0.16 * s, 1.355, 0.875], [0.035, 0.045, 0.015], "#8a5a50", "head", 6);
    // fangs
    b.part(new THREE.ConeGeometry(0.014, 0.06, 5), "#fff8e6", { at: [0.06 * s, 1.035, 1.215], rotation: [180, 0, 0], bone: "head" });
    b.part(new THREE.ConeGeometry(0.012, 0.05, 5), "#fff8e6", { at: [0.055 * s, 1.1, 1.22], bone: "jaw" });
    // whiskers
    for (const k of [-1, 0, 1])
      b.part(new THREE.CylinderGeometry(0.004, 0.002, 0.2, 4), "#f4ecd8", {
        at: [0.12 * s, 1.1 + k * 0.02, 1.2], rotation: [90 + k * 8, 0, 70 * s], bone: "head",
      });
    ball([0.06 * s, 1.105, 1.22], [0.012, 0.012, 0.012], DARK, "head", 5);
  }

  // ---- torso ----
  ball([0, 0.98, 0.3], [0.3, 0.37, 0.42], coat, "spine2", 12);
  ball([0, 0.95, -0.05], [0.27, 0.31, 0.45], coat, "spine1", 12);
  ball([0, 0.95, -0.45], [0.28, 0.33, 0.34], coat, "pelvis", 12);
  // belly tuft
  ball([0, 0.68, 0.0], [0.07, 0.04, 0.3], MANE2, "spine1", 6);

  // ---- head ----
  ball([0, 1.15, 0.95], [0.2, 0.19, 0.22], coat, "head", 12);
  b.part(new THREE.BoxGeometry(0.2, 0.12, 0.2), CREAM, { at: [0, 1.1, 1.13], bone: "head" });
  b.part(new THREE.BoxGeometry(0.075, 0.12, 0.05), "#b6805a", { at: [0, 1.17, 1.24], rotation: [-8, 0, 0], bone: "head" });
  b.part(new THREE.BoxGeometry(0.1, 0.05, 0.04), DARK, { at: [0, 1.17, 1.26], bone: "head" });
  b.part(new THREE.BoxGeometry(0.16, 0.05, 0.24), CREAM, { at: [0, 1.03, 1.1], bone: "jaw" });
  b.part(new THREE.BoxGeometry(0.12, 0.02, 0.03), "#9a5a58", { at: [0, 1.06, 1.2], bone: "jaw" });

  // ---- mane ----
  ball([0, 1.1, 0.66], [0.34, 0.38, 0.3], MANE1, "neck2", 10);
  ball([0, 0.95, 0.6], [0.28, 0.25, 0.3], MANE2, "neck1", 8);
  const spikes = (n: number, rad: number, zc: number, len: number, w: number, color: string, bone: string, off: number) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + off;
      const ox = Math.cos(a) * 1.0;
      const oy = Math.sin(a) * 1.0;
      const dir = new THREE.Vector3(ox * 0.6, oy * 0.6, -1).normalize();
      const p = new THREE.Vector3(ox * rad, 1.1 + oy * rad * 1.05 - (oy < 0 ? 0.04 : 0), zc);
      b.part(new THREE.ConeGeometry(w, len, 5), color, {
        at: p.clone().addScaledVector(dir, len * 0.5), dir: dir.toArray(), flat: true, bone,
      });
    }
  };
  spikes(18, 0.3, 0.78, 0.3, 0.1, MANE1, "neck2", 0);
  spikes(14, 0.22, 0.86, 0.26, 0.085, MANE2, "head", 0.2);
  spikes(12, 0.34, 0.62, 0.32, 0.11, MANE1, "neck1", 0.15);

  // ---- tail ----
  const tail = b.chain("tailDummy", [[0, 0.62, -1.85], [0, 0.6, -1.9]], { parent: "tail3", count: 1, names: ["tailTip"] });
  void tail;
  b.sweep([[0, 0.95, -0.7], [0, 0.88, -1.1], [0, 0.74, -1.5], [0, 0.62, -1.85]],
    { radius: [0.075, 0.055, 0.045, 0.04], color: coat, bone: ["tail1", "tail2", "tail3"] as any });
  ball([0, 0.58, -1.97], [0.08, 0.1, 0.2], MANE1, "tailTip", 8);
  spikes; // keep helper referenced

  return b.root;
}
