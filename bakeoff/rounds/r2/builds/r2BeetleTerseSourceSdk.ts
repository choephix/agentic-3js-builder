import * as THREE from "three";
import { createBuilder, mottle, gradient } from "../../../../src/index";

export const meta = {
  name: "Stag Beetle",
  description: "Male stag beetle with antler-like mandibles, split elytra, jointed legs and clubbed antennae, at real size (about 8 cm).",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "stagBeetle" });
  const sph = (n = 10, m = 8) => new THREE.SphereGeometry(1, n, m);

  // Skeleton
  b.joint("body", { at: [0, 0.0145, -0.005], dir: [0, 0, 1], role: "spine" });
  b.joint("thorax", { parent: "body", at: [0, 0.0145, 0.009], dir: [0, 0, 1], role: "spine" });
  b.joint("head", { parent: "thorax", at: [0, 0.0165, 0.016], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.0135, 0.027], dir: [0, 0, 1], role: "jaw" });
  b.joint("elytraL", { parent: "body", at: [0.001, 0.021, 0.0], dir: [0, 0, -1], role: "hinge" });
  b.joint("elytraR", { parent: "body", at: [-0.001, 0.021, 0.0], dir: [0, 0, -1], role: "hinge" });

  // Colours
  const elytraPaint = mottle("#6e2c12", "#4c1b0c", { size: 0.007, seed: 2, contrast: 0.8 });
  const pronPaint = mottle("#3d1709", "#2b0f06", { size: 0.005, seed: 5 });
  const headPaint = gradient("#2a1007", "#3a160a", [0, 0, 0.015], [0, 0, 0.03]);
  const DARK = "#1d0e07";
  const MAND = "#5a2210";

  // Body
  b.part(sph(10, 8), "#24100a", { at: [0, 0.0105, -0.012], scale: [0.0095, 0.004, 0.015], bone: "body" });
  b.part(sph(12, 8), pronPaint, { at: [0, 0.0165, 0.009], scale: [0.0112, 0.0058, 0.0085], bone: "thorax" });
  b.part(sph(8, 6), "#2b120a", { at: [0, 0.0125, 0.009], scale: [0.009, 0.0035, 0.007], bone: "thorax" });
  b.part(new THREE.ConeGeometry(0.0025, 0.004, 3), "#2b120a", { at: [0, 0.0195, -0.001], rotation: [-90, 0, 0], bone: "body" });
  for (const sx of [1, -1]) {
    b.part(sph(12, 8), elytraPaint, {
      at: [sx * 0.0052, 0.0158, -0.0125],
      scale: [0.0059, 0.0074, 0.0175],
      bone: sx > 0 ? "elytraL" : "elytraR",
    });
  }

  // Head
  b.part(sph(10, 8), headPaint, { at: [0, 0.0172, 0.0222], scale: [0.0105, 0.0058, 0.0072], bone: "head" });
  b.part(sph(8, 6), "#2a1007", { at: [0, 0.0185, 0.0285], scale: [0.0045, 0.002, 0.002], bone: "head" });
  b.part(sph(8, 6), "#3a160a", { at: [0, 0.0128, 0.0288], scale: [0.0042, 0.0016, 0.0042], bone: "jaw" });
  for (const sx of [1, -1]) {
    b.part(sph(8, 6), "#0c0806", { at: [sx * 0.0068, 0.0188, 0.0235], scale: [0.0018, 0.0022, 0.0028], bone: "head" });
    b.part(sph(5, 4), "#c9b99a", { at: [sx * 0.0078, 0.0198, 0.0245], scale: [0.0004, 0.0004, 0.0004], bone: "head" });
  }

  // Mandibles and antennae
  for (const sx of [1, -1]) {
    const S = sx > 0 ? "L" : "R";
    const mc = b.chain(
      `mandible${S}`,
      [
        [sx * 0.005, 0.0165, 0.026],
        [sx * 0.0095, 0.0165, 0.034],
        [sx * 0.0105, 0.0165, 0.042],
        [sx * 0.0055, 0.0165, 0.050],
      ].map((p) => new THREE.Vector3(...p)),
      { parent: "head", names: [`mandible${S}`, `mandible${S}2`, `mandible${S}3`], role: "jaw" },
    );
    b.sweep(mc, (t) => 0.0036 - 0.0028 * t, { color: MAND, sides: 6 });
    b.spike(mc.at(0.3).at, [-sx, 0.0, 0.4], 0.0055, 0.0017, { color: MAND, sides: 5 });
    b.spike(mc.at(0.55).at, [-sx, 0.0, 0.5], 0.0045, 0.0013, { color: MAND, sides: 5 });
    b.spike(mc.at(0.8).at, [-sx, 0.0, 0.8], 0.0035, 0.001, { color: MAND, sides: 5 });
    b.spike(mc.at(0.95).at, [sx * 0.3, 0.0, 1], 0.0035, 0.0009, { color: MAND, sides: 5 });

    const ac = b.chain(
      `antenna${S}`,
      [
        [sx * 0.004, 0.0188, 0.0282],
        [sx * 0.0072, 0.0205, 0.0335],
        [sx * 0.0088, 0.0212, 0.0385],
      ].map((p) => new THREE.Vector3(...p)),
      { parent: "head", role: "digit" },
    );
    b.sweep(ac, 0.0005, { color: DARK, sides: 5 });
    const tip = ac.at(1).at;
    for (let k = 0; k < 3; k++)
      b.part(sph(6, 4), "#3a1b0e", {
        at: [tip.x + sx * 0.0004 * k, tip.y + 0.0004 * k, tip.z + 0.0012 + 0.0006 * k],
        scale: [0.0011, 0.0011, 0.0016],
        bone: ac.joints[ac.joints.length - 1],
      });
  }

  // Legs
  const dz = [0.007, 0.0, -0.008];
  const hz = [0.016, 0.006, -0.005];
  const fz = [0.014, 0.0, -0.016];
  for (const sx of [1, -1]) {
    const S = sx > 0 ? "L" : "R";
    for (let i = 0; i < 3; i++) {
      const pts = [
        [sx * 0.007, 0.0125, hz[i]],
        [sx * 0.021, 0.0185, hz[i] + dz[i]],
        [sx * 0.027, 0.008, hz[i] + fz[i] * 0.8],
        [sx * 0.029, 0.0015, hz[i] + fz[i]],
      ].map((p) => new THREE.Vector3(...p));
      const leg = b.chain(`leg${S}${i + 1}`, pts, {
        parent: "thorax",
        names: [`hip${S}${i + 1}`, `knee${S}${i + 1}`, `ankle${S}${i + 1}`],
        role: "leg",
      });
      b.sweep(leg, (t) => 0.0026 - 0.0011 * t, { color: DARK, sides: 6 });
      const foot = pts[3];
      b.spike([foot.x, foot.y + 0.0002, foot.z], [sx * 0.4, 0.1, 1], 0.0032, 0.0007, { color: "#0e0705", sides: 4 });
      b.spike(leg.at(0.5).at, [sx, 0.2, 0.5], 0.0045, 0.0009, { color: "#2b120a", sides: 4 });
    }
  }

  return b.root;
}
