import * as THREE from "three";
import { createBuilder, paint, grain, mix } from "../../../../src/index";

export const meta = {
  name: "Gramophone",
  description: "A wooden-cased crank gramophone with a flared brass horn, tonearm, record and crank handle.",
};

export default function build() {
  const b = createBuilder({ name: "gramophone" });

  const WOOD = "#7a4224";
  const WOOD2 = "#9a5a30";
  const DARK = "#1b1512";
  const BRASS = "#d9a53a";
  const BRASS2 = "#a8741f";
  const FELT = "#2f6b45";
  const LABEL = "#b8322a";
  const SILVER = "#c9ccd0";

  const woodPaint = grain(WOOD, WOOD2, { size: 0.02, axis: "y", seed: 3 });

  const base = b.joint("base", { at: [0, 0.14, 0] });
  const horn = b.joint("horn", { parent: base, at: [0, 0.34, -0.03], dir: [0, 0.5, 1] });
  const arm = b.joint("tonearm", { parent: base, at: [0.14, 0.31, -0.1], dir: [0, 0, 1], role: "hinge" });
  const crank = b.joint("crank", { parent: base, at: [0.2, 0.17, 0.0], dir: [1, 0, 0], role: "hinge" });
  const platter = b.joint("platter", { parent: base, at: [0, 0.31, 0.02], dir: [0, 1, 0], role: "hinge" });

  // feet
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.CylinderGeometry(0.025, 0.02, 0.04, 6), BRASS2, {
        bone: base,
        at: [sx * 0.17, 0.02, sz * 0.17],
      });

  // cabinet
  b.part(new THREE.BoxGeometry(0.42, 0.04, 0.42), DARK, { bone: base, at: [0, 0.06, 0] });
  b.part(new THREE.BoxGeometry(0.4, 0.22, 0.4), woodPaint, { bone: base, at: [0, 0.19, 0] });
  b.part(new THREE.BoxGeometry(0.44, 0.03, 0.44), WOOD2, { bone: base, at: [0, 0.31, 0] });
  b.part(new THREE.BoxGeometry(0.46, 0.02, 0.46), DARK, { bone: base, at: [0, 0.335, 0] });
  // front panel with speaker grille slats
  for (let i = 0; i < 5; i++)
    b.part(new THREE.BoxGeometry(0.2, 0.012, 0.01), DARK, { bone: base, at: [0, 0.12 + i * 0.03, 0.203] });
  b.part(new THREE.BoxGeometry(0.24, 0.17, 0.006), "#3a2418", { bone: base, at: [0, 0.19, 0.2] });
  for (let i = 0; i < 5; i++)
    b.part(new THREE.BoxGeometry(0.2, 0.012, 0.01), BRASS2, { bone: base, at: [0, 0.12 + i * 0.03, 0.206] });
  // corner trim
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.BoxGeometry(0.025, 0.24, 0.025), WOOD2, { bone: base, at: [sx * 0.2, 0.19, sz * 0.2] });

  // turntable
  b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.014, 14), FELT, { bone: platter, at: [0, 0.352, 0.02] });
  b.part(new THREE.CylinderGeometry(0.155, 0.155, 0.01, 16), "#0c0c0c", { bone: platter, at: [0, 0.362, 0.02] });
  for (const r of [0.05, 0.09, 0.125])
    b.part(new THREE.TorusGeometry(r, 0.002, 4, 20), "#2a2a2a", {
      bone: platter, at: [0, 0.368, 0.02], rotation: [90, 0, 0],
    });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.004, 12), LABEL, { bone: platter, at: [0, 0.369, 0.02] });
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 6), SILVER, { bone: platter, at: [0, 0.378, 0.02] });

  // horn: lathe flared bell on a neck, pointing up-forward
  const hornBell = b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.04, 0.12],
      [0.075, 0.3],
      [0.15, 0.48],
      [0.27, 0.62],
      [0.265, 0.63],
      [0.145, 0.495],
      [0.07, 0.31],
      [0.025, 0.13],
      [0.018, 0.0],
      [0, 0.0],
    ],
    { at: [0, 0.34, -0.1], axis: [0, 0.55, 1], bone: horn, segments: 14, smoothing: 1, color: BRASS },
  );
  void hornBell;
  // rim ring on horn bell
  b.part(new THREE.TorusGeometry(0.27, 0.01, 5, 20), BRASS2, {
    bone: horn, at: [0, 0.34 + 0.62 * 0.4, -0.1 + 0.62 * 0.5 + 0.0], dir: [0, 0.55, 1], axis: "z",
  });
  // horn base elbow
  b.part(new THREE.SphereGeometry(0.06, 8, 6), BRASS2, { bone: horn, at: [0, 0.34, -0.1] });
  b.part(new THREE.CylinderGeometry(0.05, 0.07, 0.04, 8), BRASS2, { bone: base, at: [0, 0.355, -0.1] });
  // decorative bands
  for (const t of [0.25, 0.5]) {
    const d = new THREE.Vector3(0, 0.55, 1).normalize();
    const p = new THREE.Vector3(0, 0.34, -0.1).addScaledVector(d, 0.62 * t);
    const rr = [0.05, 0.1, 0.18][0] + t * 0.16;
    b.part(new THREE.TorusGeometry(rr, 0.006, 4, 16), BRASS2, { bone: horn, at: p, dir: d.toArray() as [number, number, number], axis: "z" });
  }

  // tonearm
  b.part(new THREE.CylinderGeometry(0.025, 0.03, 0.04, 8), SILVER, { bone: arm, at: [0.14, 0.355, -0.1] });
  b.rod([0.14, 0.375, -0.1], [0.06, 0.385, 0.06], 0.007, { bone: arm, color: SILVER });
  b.rod([0.06, 0.385, 0.06], [0.03, 0.375, 0.1], 0.009, { bone: arm, color: BRASS2 });
  b.part(new THREE.BoxGeometry(0.03, 0.02, 0.03), DARK, { bone: arm, at: [0.14, 0.375, -0.13] });
  b.spike([0.03, 0.375, 0.1], [0.03, 0.364, 0.1], null, 0.004, { bone: arm, color: SILVER });

  // crank
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 6), SILVER, { bone: crank, at: [0.225, 0.17, 0.0], rotation: [0, 0, 90] });
  b.rod([0.25, 0.17, 0.0], [0.25, 0.1, 0.0], 0.008, { bone: crank, color: SILVER });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.06, 6), "#222", { bone: crank, at: [0.28, 0.1, 0.0], rotation: [0, 0, 90] });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), BRASS, { bone: crank, at: [0.255, 0.17, 0.0] });

  return b.root;
}
