import * as THREE from "three";
import { createBuilder, mottle } from "../../../../src/index";

export const meta = {
  name: "Flamingo",
  description:
    "Candy-pink flamingo wading in shallow water, with an S-curved neck, a bent two-part beak, coral wings with black flight feathers, and knobbly-kneed legs with webbed feet.",
};

export default function () {
  const b = createBuilder({ name: "flamingo" });
  const PINK = "#f5a0b6", PALE = "#f9c4d1", CORAL = "#ee6a6a", ROSE = "#e5707f", BLACK = "#1b1517";
  const sph = (seg = 10) => new THREE.SphereGeometry(1, seg, Math.max(6, seg - 3));

  const root = b.joint("root", { at: [0, 0.76, 0] });
  const coat = mottle(PINK, "#f8b4c6", { size: 0.09, seed: 3 });

  // Water and ripples
  b.part(new THREE.CylinderGeometry(0.75, 0.75, 0.02, 28), "#7cc6d0", { at: [0, 0.01, 0], bone: "root" });
  for (const r of [0.14, 0.24]) {
    for (const s of [1, -1])
      b.part(new THREE.TorusGeometry(r, 0.004, 4, 20), "#c9eef0", {
        at: [s * 0.065, 0.021, 0.03],
        rotation: [90, 0, 0],
        bone: "root",
      });
  }

  // Body
  b.part(sph(12), coat, { at: [0, 0.78, 0], scale: [0.14, 0.16, 0.29], bone: "root" });
  b.part(sph(10), PINK, { at: [0, 0.84, 0.18], scale: [0.11, 0.13, 0.13], bone: "root" });

  // Tail
  const tail = b.chain("tail", [[0, 0.78, -0.2], [0, 0.74, -0.4], [0, 0.68, -0.52]], {
    parent: "root", role: "tail", names: ["tail1", "tail2"],
  });
  b.sweep(tail, (t) => [0.075 * (1 - 0.55 * t), 0.03 * (1 - 0.5 * t)], { color: PINK, caps: "round" });

  // Neck and head
  const neck = b.chain(
    "neck",
    b.ctx && [[0, 0.9, 0.18], [0, 0.98, 0.34], [0, 1.14, 0.4], [0, 1.3, 0.3], [0, 1.42, 0.3], [0, 1.5, 0.36]].map((p) => new THREE.Vector3(...p)),
    { parent: "root", role: "neck", count: 4, names: ["neck1", "neck2", "neck3", "neck4", "head"] },
  );
  b.sweep(neck, [0.058, 0.042, 0.031, 0.027, 0.03], { color: mottle("#f7a8bd", "#fbbfce", { size: 0.06, seed: 5 }) });
  b.part(sph(10), PALE, { at: [0, 1.5, 0.37], scale: [0.042, 0.045, 0.055], bone: "head" });
  const jaw = b.joint("jaw", { parent: "head", at: [0, 1.485, 0.4], dir: [0, 0, 1], role: "jaw" });

  // Bent bill
  b.sweep(
    [[0, 1.505, 0.39], [0, 1.505, 0.46], [0, 1.485, 0.52], [0, 1.43, 0.55]].map((p) => new THREE.Vector3(...p)),
    (t) => [0.027 - 0.015 * t, 0.025 - 0.015 * t],
    { bands: [[0.55, PALE], [1, BLACK]], bone: "head", caps: "round", sides: 8 },
  );
  b.sweep(
    [[0, 1.484, 0.4], [0, 1.482, 0.46], [0, 1.468, 0.51], [0, 1.435, 0.535]].map((p) => new THREE.Vector3(...p)),
    (t) => [0.022 - 0.012 * t, 0.013 - 0.006 * t],
    { bands: [[0.55, PALE], [1, BLACK]], bone: jaw, caps: "round", sides: 8 },
  );

  // Eyes
  for (const s of [1, -1]) {
    b.part(sph(8), "#f6e27a", { at: [s * 0.04, 1.515, 0.39], scale: 0.014, bone: "head" });
    b.part(sph(6), BLACK, { at: [s * 0.051, 1.516, 0.395], scale: 0.0075, bone: "head" });
    b.part(sph(6), "#c8c0c4", { at: [s * 0.034, 1.53, 0.385], scale: [0.016, 0.006, 0.016], bone: "head" });
  }

  // Wings
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wing = b.chain(
      "wing" + S,
      [[s * 0.14, 0.88, 0.12], [s * 0.155, 0.84, -0.08], [s * 0.15, 0.8, -0.3]].map((p) => new THREE.Vector3(...p)),
      { parent: "root", role: "wing", names: ["shoulder" + S, "elbow" + S, "wrist" + S] },
    );
    const ex = (pts: number[][], color: string, x: number, bone: string, th: number) =>
      b.extrude(pts as any, { color, at: [x, 0.84, 0.14], x: [0, 0, -1], y: [0, 1, 0], thickness: th, bevel: 0.006, smoothing: 1, bone });
    ex([[0, 0.07], [0.14, 0.1], [0.3, 0.05], [0.4, -0.04], [0.3, -0.11], [0.12, -0.11], [0, -0.04]], CORAL, s * 0.145, "elbow" + S, 0.03);
    ex([[0.04, 0.05], [0.18, 0.07], [0.3, 0.02], [0.2, -0.03], [0.06, -0.02]], "#f28a86", s * 0.162, "elbow" + S, 0.012);
    ex([[0.3, 0.05], [0.5, 0.0], [0.66, -0.1], [0.62, -0.15], [0.42, -0.14], [0.28, -0.1]], BLACK, s * 0.142, "wrist" + S, 0.022);
    for (let i = 0; i < 3; i++)
      b.part(sph(7), "#f47c78", { at: [s * 0.157, 0.86 - i * 0.012, 0.04 - i * 0.09], scale: [0.016, 0.05, 0.06], bone: "elbow" + S });
  }

  // Legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.065;
    const leg = b.chain(
      "leg" + S,
      [[x, 0.74, 0.03], [x, 0.52, 0.03], [x, 0.29, -0.02], [x, 0.03, 0.03]].map((p) => new THREE.Vector3(...p)),
      { parent: "root", role: "leg", names: ["hip" + S, "knee" + S, "ankle" + S, "foot" + S] },
    );
    b.sweep(leg, [0.022, 0.019, 0.013, 0.011], { color: ROSE });
    b.part(sph(8), "#d9566a", { at: [x, 0.52, 0.03], scale: 0.03, bone: "knee" + S });
    b.part(sph(8), "#d9566a", { at: [x, 0.29, -0.02], scale: [0.026, 0.03, 0.03], bone: "ankle" + S });
    const foot = "foot" + S;
    for (const k of [-1, 0, 1])
      b.rod([x, 0.03, 0.03], [x + k * 0.07, 0.03, k === 0 ? 0.22 : 0.2], [0.011, 0.006], { color: ROSE, bone: foot });
    b.rod([x, 0.03, 0.03], [x, 0.03, -0.04], [0.011, 0.007], { color: ROSE, bone: foot });
    b.slab(
      [[x, 0.03, 0.03], [x - 0.07, 0.03, 0.2], [x, 0.03, 0.22], [x + 0.07, 0.03, 0.2]],
      { color: "#ef8a97", thickness: 0.006, bone: foot },
    );
  }

  return b.root;
}
