import * as THREE from "three";
import { createBuilder, catmull, paint, mottle, stripes, mix, smoothstep } from "../../../../src/index";

export const meta = {
  name: "African Elephant",
  description:
    "Stylized low-poly bull elephant standing in a rest pose: rigged legs, trunk, ears, jaw, tail, tusks, with dusty mottled paint.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "elephant" });

  // ---------- paints ----------
  const base = mottle("#85858d", "#9b9aa2", { size: 0.45, seed: 3, contrast: 1.2 });
  const skin = paint((p, n) => {
    const c = base.at(p, n);
    const dust = smoothstep(1.0, 0.1, p.y) * 0.75;
    const belly = smoothstep(0.1, -0.8, n.y) * 0.25;
    return mix(mix(c, "#b5a58b", dust), "#6f6e76", belly);
  });
  const trunkSkin = stripes(skin, "#66656c", { size: 0.075, axis: "y", width: 0.25, wobble: 0.2, seed: 5 });
  const IVORY = "#e8dfc6";
  const NAIL = "#d6ccb6";
  const DARK = "#1b1a1d";
  const PINK = "#a68e8c";

  // ---------- skeleton ----------
  b.joint("hips", { at: [0, 2.0, -0.7], dir: [0, 0, 1] });
  b.joint("spine", { parent: "hips", at: [0, 2.1, 0.1], dir: [0, 0, 1] });
  b.joint("chest", { parent: "spine", at: [0, 2.2, 0.8], dir: [0, 0, 1] });
  b.joint("neck", { parent: "chest", at: [0, 2.35, 1.1], dir: [0, 0.3, 1] });
  b.joint("head", { parent: "neck", at: [0, 2.5, 1.4], dir: [0, 0, 1] });
  b.joint("jaw", { parent: "head", at: [0, 2.1, 1.65], dir: [0, 0, 1], role: "jaw" });

  const sph = (seg = 12, h = 9) => new THREE.SphereGeometry(1, seg, h);

  // ---------- body ----------
  b.part(sph(14, 10), skin, { at: [0, 2.1, -0.05], scale: [0.92, 0.9, 1.4], bone: "spine", name: "barrel" });
  b.part(sph(12, 9), skin, { at: [0, 2.1, -0.85], scale: [0.86, 0.9, 0.72], bone: "hips", name: "rump" });
  b.part(sph(12, 9), skin, { at: [0, 2.2, 0.75], scale: [0.82, 0.88, 0.8], bone: "chest", name: "shoulders" });
  b.part(sph(10, 8), skin, { at: [0, 2.55, 1.15], scale: [0.5, 0.55, 0.5], bone: "neck", name: "neckMass" });
  // backbone ridge
  for (let i = 0; i < 5; i++) {
    b.part(sph(6, 5), "#7a7981", {
      at: [0, 2.99 - Math.abs(i - 2) * 0.03, -0.9 + i * 0.4],
      scale: [0.1, 0.05, 0.16],
      bone: i < 2 ? "hips" : "spine",
    });
  }

  // ---------- head ----------
  b.part(sph(14, 10), skin, { at: [0, 2.55, 1.5], scale: [0.55, 0.65, 0.62], bone: "head", name: "skull" });
  for (const s of [1, -1]) {
    b.part(sph(10, 8), skin, { at: [s * 0.2, 2.95, 1.45], scale: [0.3, 0.26, 0.3], bone: "head", name: "foreheadLobe" });
    // eye
    b.part(sph(8, 6), DARK, { at: [s * 0.48, 2.7, 1.8], scale: 0.05, bone: "head", name: "eye" });
    b.part(sph(5, 4), "#ffffff", { at: [s * 0.51, 2.72, 1.83], scale: 0.014, bone: "head" });
    // brow ridge
    b.part(sph(7, 5), "#7b7a82", { at: [s * 0.46, 2.77, 1.76], scale: [0.09, 0.04, 0.1], bone: "head" });
    // cheek
    b.part(sph(8, 6), skin, { at: [s * 0.36, 2.25, 1.7], scale: [0.2, 0.28, 0.25], bone: "head" });
  }
  // lower jaw
  b.part(new THREE.BoxGeometry(0.42, 0.18, 0.4), skin, { at: [0, 2.05, 1.8], bone: "jaw", name: "lowerJaw" });
  b.part(new THREE.BoxGeometry(0.3, 0.03, 0.26), "#8c6b6b", { at: [0, 2.15, 1.82], bone: "jaw", name: "tongue" });

  // ---------- trunk ----------
  const trunkPath = catmull([
    [0, 2.4, 1.8],
    [0, 1.85, 2.15],
    [0, 1.3, 2.25],
    [0, 0.8, 2.3],
    [0, 0.35, 2.5],
  ]);
  const trunk = b.chain("trunk", trunkPath, {
    parent: "head",
    names: ["trunk1", "trunk2", "trunk3", "trunk4"],
    role: "tentacle",
  });
  b.sweep(trunk, [0.3, 0.25, 0.19, 0.14, 0.1], { color: trunkSkin, name: "trunk", sides: 10 });
  // nostril tip finger
  b.part(new THREE.ConeGeometry(0.045, 0.14, 6), "#7a7981", {
    at: [0, 0.33, 2.58],
    dir: [0, -0.4, 1],
    bone: "trunk4",
  });
  b.part(sph(6, 5), DARK, { at: [0.025, 0.28, 2.57], scale: 0.018, bone: "trunk4" });
  b.part(sph(6, 5), DARK, { at: [-0.025, 0.28, 2.57], scale: 0.018, bone: "trunk4" });

  // ---------- tusks ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const tusk = catmull([
      [s * 0.3, 2.05, 1.7],
      [s * 0.4, 1.7, 2.05],
      [s * 0.46, 1.4, 2.45],
      [s * 0.4, 1.38, 2.9],
    ]);
    b.sweep(tusk, [0.08, 0.065, 0.04, 0.008], { color: IVORY, bone: "head", name: "tusk" + L, sides: 7 });
  }

  // ---------- ears ----------
  const earShape = [
    [0, 0.35], [0.2, 0.62], [0.6, 0.72], [0.95, 0.45], [1.05, 0], [0.92, -0.5], [0.6, -0.88], [0.3, -0.7], [0.08, -0.3],
  ];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const ear = b.joint("ear" + L, { parent: "head", at: [s * 0.5, 2.65, 1.35], dir: [s * 0.5, 0, -1] });
    const xdir = [s * 0.5, 0, -1];
    b.extrude(earShape, {
      at: [s * 0.5, 2.65, 1.35],
      x: xdir,
      y: [0, 1, 0],
      thickness: 0.05,
      bevel: 0.015,
      smoothing: 1,
      color: skin,
      bone: ear,
      name: "ear" + L,
    });
    b.extrude(
      earShape.map(([u, v]) => [0.12 + u * 0.72, v * 0.72]),
      {
        at: [s * 0.5, 2.65, 1.35],
        x: xdir,
        y: [0, 1, 0],
        thickness: 0.058,
        smoothing: 1,
        color: PINK,
        bone: ear,
        name: "earInner" + L,
      },
    );
  }

  // ---------- legs ----------
  const legs: Array<{ id: string; x: number; z: number; names: string[] }> = [
    { id: "FL", x: 0.5, z: 0.7, names: ["shoulderFL", "elbowFL", "wristFL"] },
    { id: "FR", x: -0.5, z: 0.7, names: ["shoulderFR", "elbowFR", "wristFR"] },
    { id: "HL", x: 0.5, z: -0.95, names: ["hipHL", "kneeHL", "ankleHL"] },
    { id: "HR", x: -0.5, z: -0.95, names: ["hipHR", "kneeHR", "ankleHR"] },
  ];
  for (const leg of legs) {
    const hind = leg.id[0] === "H";
    const path = catmull([
      [leg.x, 1.95, leg.z],
      [leg.x, 1.3, leg.z + (hind ? 0.06 : 0.02)],
      [leg.x, 0.65, leg.z + (hind ? -0.02 : 0)],
      [leg.x, 0.17, leg.z],
    ]);
    const chain = b.chain("leg" + leg.id, path, {
      parent: hind ? "hips" : "chest",
      names: leg.names,
      role: "leg",
      contact: [leg.x, 0, leg.z],
    });
    b.sweep(chain, [0.34, 0.27, 0.23, 0.23], { color: skin, name: "leg" + leg.id, sides: 9 });
    const ankle = leg.names[2];
    b.part(new THREE.CylinderGeometry(0.25, 0.28, 0.17, 10), skin, {
      at: [leg.x, 0.075, leg.z],
      bone: ankle,
      name: "foot" + leg.id,
    });
    // toenails
    for (let k = 0; k < 4; k++) {
      const a = (-0.6 + k * 0.4);
      b.part(new THREE.BoxGeometry(0.09, 0.08, 0.06), NAIL, {
        at: [leg.x + 0.27 * Math.sin(a), 0.07, leg.z + 0.27 * Math.cos(a)],
        rotation: [0, (a * 180) / Math.PI, 0],
        bone: ankle,
      });
    }
    // wrinkle band at knee
    b.part(new THREE.TorusGeometry(0.26, 0.025, 5, 10), "#74737a", {
      at: [leg.x, 1.28, leg.z + 0.03],
      rotation: [90, 0, 0],
      bone: leg.names[1],
    });
  }

  // ---------- tail ----------
  const tailPath = catmull([
    [0, 2.3, -1.45],
    [0, 2.1, -1.65],
    [0, 1.7, -1.72],
    [0, 1.3, -1.72],
    [0, 1.0, -1.7],
  ]);
  const tail = b.chain("tail", tailPath, { parent: "hips", names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" });
  b.sweep(tail, [0.07, 0.05, 0.04, 0.03, 0.025], { color: skin, name: "tail", sides: 6 });
  b.part(new THREE.ConeGeometry(0.07, 0.3, 6), "#3b3a3e", {
    at: [0, 0.88, -1.7],
    dir: [0, -1, 0],
    bone: "tail4",
    name: "tailTuft",
  });

  return b.root;
}
