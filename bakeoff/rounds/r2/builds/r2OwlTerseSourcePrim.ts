import * as THREE from "three";
import { createBuilder, paint, mottle, stripes, resolve, mix, smoothstep } from "../../../../src/index";

export const meta = {
  name: "Great Horned Owl",
  description:
    "Stylized upright owl built from primitives: painted barred chest, facial disks, ear tufts, extruded wing and tail feathers, and a rigged skeleton with a separate jaw.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "owl" });

  // ---------- palette & paints ----------
  const COAT_A = "#8b6a49";
  const COAT_B = "#5d4630";
  const CREAM = "#eadfc4";
  const DARK = "#4a3828";
  const coat = mottle(COAT_A, COAT_B, { size: 0.04, seed: 3, contrast: 1.2 });
  const bars = stripes("#eadcbc", "#8a6b48", { size: 0.028, axis: "y", width: 0.3, wobble: 0.7, seed: 2 });
  const bodyPaint = paint((p, n) => {
    const t = smoothstep(0.05, 0.55, n.z + 0.1);
    return mix(resolve(coat, p, n), resolve(bars, p, n), t);
  });

  // ---------- skeleton: spine / head / jaw ----------
  b.joint("pelvis", { at: [0, 0.22, -0.02], dir: [0, 1, 0], role: "spine" });
  b.joint("chest", { parent: "pelvis", at: [0, 0.32, 0], dir: [0, 1, 0], role: "spine" });
  b.joint("neck", { parent: "chest", at: [0, 0.43, 0.01], dir: [0, 1, 0.2], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 0.48, 0.025], dir: [0, 1, 0.3], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.455, 0.09], dir: [0, 0, 1], role: "jaw" });

  // ---------- body ----------
  b.part(new THREE.SphereGeometry(1, 12, 10), bodyPaint, { at: [0, 0.3, 0], scale: [0.15, 0.2, 0.14], bone: "chest", name: "body" });
  b.part(new THREE.SphereGeometry(1, 8, 6), coat, { at: [0, 0.17, -0.09], scale: [0.1, 0.09, 0.08], bone: "pelvis", name: "rump" });
  b.part(new THREE.SphereGeometry(1, 10, 8), coat, { at: [0, 0.49, 0.03], scale: [0.115, 0.095, 0.1], bone: "head", name: "skull" });

  // ---------- face ----------
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.014, 12), CREAM, {
      at: [s * 0.046, 0.49, 0.114], dir: [s * 0.35, 0, 1], bone: "head", scale: [1, 1, 1.12], name: "disk" + tag,
    });
    b.part(new THREE.TorusGeometry(0.055, 0.006, 5, 14), "#7a5a3b", {
      at: [s * 0.046, 0.49, 0.119], dir: [s * 0.35, 0, 1], axis: "z", bone: "head", scale: [1, 1.12, 1], name: "rim" + tag,
    });
    b.part(new THREE.SphereGeometry(0.022, 8, 6), "#f2a21a", { at: [s * 0.04, 0.5, 0.124], bone: "head", name: "eye" + tag });
    b.part(new THREE.SphereGeometry(0.013, 6, 5), "#0d0d0d", { at: [s * 0.04, 0.5, 0.139], bone: "head", name: "pupil" + tag });
    b.part(new THREE.BoxGeometry(0.06, 0.012, 0.022), DARK, {
      at: [s * 0.045, 0.526, 0.122], rotation: [0, 0, s * 25], bone: "head", name: "brow" + tag,
    });
    // ear tufts
    b.part(new THREE.ConeGeometry(0.022, 0.1, 5), DARK, {
      at: [s * 0.065, 0.575, 0.01], dir: [s * 0.35, 1, 0.1], bone: "head", name: "tuft" + tag,
    });
    b.part(new THREE.ConeGeometry(0.012, 0.06, 4), "#b79a72", {
      at: [s * 0.062, 0.56, 0.025], dir: [s * 0.3, 1, 0.1], bone: "head", name: "tuftIn" + tag,
    });
  }
  b.part(new THREE.BoxGeometry(0.014, 0.05, 0.012), CREAM, { at: [0, 0.495, 0.13], bone: "head", name: "bridge" });
  // beak
  b.part(new THREE.ConeGeometry(0.02, 0.055, 5), "#3a3a35", { at: [0, 0.472, 0.138], dir: [0, -0.6, 1], bone: "head", name: "beakUpper" });
  b.part(new THREE.ConeGeometry(0.014, 0.034, 5), "#2c2c28", { at: [0, 0.45, 0.136], dir: [0, -0.1, 1], bone: "jaw", name: "beakLower" });

  // ---------- feather helper ----------
  const feather = (base: number[], d: number[], len: number, w: number, hint: number[], color: string, bone: string) => {
    const y = new THREE.Vector3(...d).normalize();
    const h = new THREE.Vector3(...hint).normalize();
    const x = new THREE.Vector3().crossVectors(h, y).normalize();
    b.extrude(
      [[-w, 0], [w, 0], [w, len * 0.72], [w * 0.55, len * 0.93], [0, len], [-w * 0.55, len * 0.93], [-w, len * 0.72]],
      { color, at: base, x, y, thickness: 0.006, bone },
    );
  };

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const sh = [s * 0.13, 0.38, -0.01];
    const el = [s * 0.25, 0.35, -0.06];
    const wr = [s * 0.37, 0.32, -0.04];
    b.chain("wing" + tag, [sh, el, wr], {
      parent: "chest", role: "wing", names: ["shoulder" + tag, "elbow" + tag, "wrist" + tag],
    });
    // coverts slab over the arm
    b.extrude(
      [[0, 0.1], [0.12, 0.11], [0.26, 0.08], [0.31, 0.0], [0.27, -0.05], [0.12, -0.07], [0, -0.06]],
      { color: coat, at: [s * 0.12, 0.36, 0.0], x: [s, -0.15, 0], y: [0, 0, -1], thickness: 0.03, bevel: 0.01, bone: "shoulder" + tag, name: "coverts" + tag },
    );
    // secondaries
    for (let k = 0; k < 6; k++) {
      const x0 = s * (0.12 + 0.05 + k * 0.04);
      feather([x0, 0.343 + (k % 2) * 0.004, -0.07], [s * 0.05, -0.1, -1], 0.17 + 0.006 * k, 0.026,
        [0, 1, 0], k % 2 ? "#6b4f37" : "#7a5c40", "elbow" + tag);
    }
    // primaries fanned from the wrist
    for (let i = 0; i < 7; i++) {
      const th = ((20 + i * 11) * Math.PI) / 180;
      const len = 0.2 + 0.07 * Math.sin((i / 6) * Math.PI);
      feather([s * (0.3 + 0.012 * i), 0.33 + (i % 2) * 0.004, -0.04 + 0.004 * i],
        [s * Math.sin(th), -0.08, -Math.cos(th)], len, 0.024, [0, 1, 0],
        i % 2 ? "#6d5039" : "#5a4331", "wrist" + tag);
    }
  }

  // ---------- tail ----------
  b.chain("tail", [[0, 0.17, -0.13], [0, 0.12, -0.24], [0, 0.06, -0.34]], {
    parent: "pelvis", role: "tail", names: ["tail1", "tail2"],
  });
  for (let f = -3; f <= 3; f++) {
    feather([f * 0.012, 0.17 + Math.abs(f) * 0.0005, -0.12 - Math.abs(f) * 0.003], [f * 0.09, -0.5, -1],
      0.22 - Math.abs(f) * 0.012, 0.022, [0, 1, -0.5], f % 2 ? "#6b4f37" : "#7a5c40", "tail1");
  }

  // ---------- legs & feet ----------
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const hip = [s * 0.065, 0.2, 0.0];
    const knee = [s * 0.07, 0.13, 0.035];
    const ank = [s * 0.065, 0.04, 0.015];
    b.chain("leg" + tag, [hip, knee, ank], {
      parent: "pelvis", role: "leg", names: ["hip" + tag, "knee" + tag, "ankle" + tag],
    });
    b.capsule(hip, knee, 0.05, { color: "#d9c7a0", bone: "hip" + tag, name: "thigh" + tag });
    b.capsule(knee, ank, 0.036, { color: "#cdb98e", bone: "knee" + tag, name: "shin" + tag });
    const angles = [-28, 0, 28, 180];
    angles.forEach((deg, i) => {
      const a = (deg * Math.PI) / 180;
      const len = i === 3 ? 0.05 : 0.07;
      const d = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
      const start = new THREE.Vector3(ank[0], 0.022, ank[2]);
      const tip = start.clone().addScaledVector(d, len);
      tip.y = 0.014;
      const name = "toe" + tag + (i + 1);
      b.joint(name, { parent: "ankle" + tag, at: start, aim: tip, role: "digit" });
      b.capsule(start, tip, 0.009, { color: "#d8c9a0", bone: name, name: "toeMesh" + tag + (i + 1) });
      b.part(new THREE.ConeGeometry(0.008, 0.032, 4), "#2b2b2b", {
        at: tip, dir: [d.x, -0.8, d.z], bone: name, name: "talon" + tag + (i + 1),
      });
    });
  }

  return b.root;
}
