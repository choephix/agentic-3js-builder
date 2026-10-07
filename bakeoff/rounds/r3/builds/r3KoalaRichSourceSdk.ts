import * as THREE from "three";
import { createBuilder, rng, mottle } from "../../../../src/index";

export const meta = {
  name: "Sleepy Koala",
  description: "A drowsy ash-grey koala hugging a eucalyptus branch, munching a sprig of blue-green leaves.",
};

export default function build() {
  const b = createBuilder({ name: "koala" });
  const FUR = "#9a9ea3", DARK = "#767b82", CREAM = "#ebe4d2", CREAM2 = "#d9cfb8";
  const NOSE = "#18181b", CLAW = "#2a2829", BROWN = "#4a2c1c", BARK = "#8a7a68";
  const fur = mottle(FUR, "#a9adb1", { size: 0.06, seed: 3, contrast: 0.8 });
  const unit = new THREE.SphereGeometry(1, 12, 8);

  const sph = (at: number[], s: number[], color: any, bone: string, rot?: number[]) =>
    b.part(unit, color, { at, scale: s, bone, rotation: rot });

  // skeleton
  b.joint("hips", { at: [0, 0.14, -0.06] });
  const spine = b.chain("spine", [[0, 0.15, -0.06], [0, 0.3, -0.04], [0, 0.45, 0.0]], {
    names: ["spine1", "spine2", "spine3"], role: "spine", parent: "hips",
  });
  b.sweep(spine, { radius: (t: number) => [0.15 - 0.03 * t, 0.14 - 0.02 * t], color: fur, caps: "round" });
  b.joint("neck", { parent: "spine3", at: [0, 0.46, 0.01], dir: [0, 1, 0.2], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 0.52, 0.04], dir: [0, 1, 0.2], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.54, 0.08], dir: [0, 0, 1], role: "jaw" });

  // rump and chest
  sph([0, 0.12, -0.07], [0.15, 0.12, 0.14], fur, "hips");
  sph([0, 0.34, 0.07], [0.1, 0.14, 0.06], CREAM, "spine2");

  // head
  sph([0, 0.59, 0.07], [0.14, 0.12, 0.125], fur, "head");
  sph([0, 0.56, 0.16], [0.07, 0.05, 0.06], CREAM2, "head");
  sph([0, 0.585, 0.2], [0.045, 0.055, 0.04], NOSE, "head");
  sph([0, 0.51, 0.15], [0.055, 0.025, 0.06], CREAM2, "jaw");
  sph([0, 0.525, 0.19], [0.03, 0.006, 0.01], "#7a4a4a", "jaw");
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    sph([s * 0.062, 0.61, 0.172], [0.019, 0.019, 0.015], BROWN, "head");
    sph([s * 0.062, 0.62, 0.176], [0.024, 0.014, 0.018], DARK, "head"); // heavy drowsy lid
    // ears
    const rz = [0, 0, -s * 15];
    sph([s * 0.13, 0.68, 0.05], [0.08, 0.075, 0.03], fur, "head", rz);
    sph([s * 0.13, 0.68, 0.062], [0.068, 0.063, 0.03], CREAM, "head", rz);
    sph([s * 0.13, 0.68, 0.072], [0.045, 0.045, 0.028], CREAM2, "head", rz);
    // legs
    const leg = b.chain("leg" + n, [[s * 0.11, 0.14, -0.02], [s * 0.15, 0.08, 0.12], [s * 0.1, 0.04, 0.21]], {
      names: ["hip" + n, "knee" + n, "ankle" + n], role: "leg", parent: "hips",
    });
    b.sweep(leg, { radius: [0.075, 0.055, 0.04], color: fur });
    sph([s * 0.1, 0.03, 0.24], [0.045, 0.03, 0.06], DARK, "ankle" + n);
    for (let k = -1; k <= 1; k++)
      b.spike([s * (0.1 + k * 0.022), 0.03, 0.29], [0, 0, 1], 0.035, 0.008, { color: CLAW, bone: "ankle" + n });
  }

  // branch
  const A = new THREE.Vector3(0.36, 0.02, 0.3), B = new THREE.Vector3(-0.25, 0.52, 0.27);
  const bd = B.clone().sub(A).normalize();
  b.rod(A, B, 0.025, { color: BARK, bone: "hips", caps: "round" });
  const leaf = (at: THREE.Vector3, dir: THREE.Vector3, s: number, color: string, bone: string) => {
    const d = dir.clone().normalize();
    let x = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 0, 1));
    if (x.length() < 0.2) x = new THREE.Vector3(1, 0, 0);
    x.normalize();
    const pts = [[0, 0], [0.02, 0.03], [0.025, 0.07], [0, 0.12], [-0.025, 0.07], [-0.02, 0.03]].map(
      (p) => [p[0] * s, p[1] * s] as [number, number]);
    b.extrude(pts, { color, at: at.toArray(), x: x.toArray(), y: d.toArray(), thickness: 0.004, bone });
  };
  const greens = ["#6f9c8a", "#5b8a7c", "#86ad98", "#7aa595"];
  const r = rng(5);
  for (let i = 0; i < 24; i++) {
    const t = i < 16 ? 0.62 + 0.38 * r() : 0.05 + 0.2 * r();
    const p = A.clone().lerp(B, t);
    const out = new THREE.Vector3(r() - 0.5, r() - 0.2, r() * 0.8 + 0.1);
    const dir = bd.clone().multiplyScalar(0.5).add(out).normalize();
    b.rod(p, p.clone().addScaledVector(dir, 0.04), 0.004, { color: BARK, bone: "hips" });
    leaf(p.clone().addScaledVector(dir, 0.035), dir, 1.2 + r() * 0.8, greens[i % 4], "hips");
  }

  // left arm hugging the branch
  const armL = b.chain("armL", [[0.14, 0.42, 0.04], [0.17, 0.3, 0.14], [0.07, 0.39, 0.26]], {
    names: ["shoulderL", "elbowL", "wristL"], role: "arm", parent: "spine3",
  });
  b.sweep(armL, { radius: [0.055, 0.045, 0.034], color: fur });
  sph([0.07, 0.385, 0.265], [0.035, 0.03, 0.035], DARK, "wristL");
  for (let k = -1; k <= 1; k++) {
    const base = new THREE.Vector3(0.07, 0.385, 0.27).addScaledVector(bd, k * 0.024);
    const tip = base.clone().add(new THREE.Vector3(0, -0.025, 0.045));
    b.rod(base, tip, 0.01, { color: DARK, bone: "wristL" });
    b.spike(tip, [0, -0.5, 0.4], 0.03, 0.008, { color: CLAW, bone: "wristL" });
  }

  // right arm holding sprig to mouth
  const armR = b.chain("armR", [[-0.14, 0.42, 0.04], [-0.18, 0.37, 0.16], [-0.07, 0.5, 0.21]], {
    names: ["shoulderR", "elbowR", "wristR"], role: "arm", parent: "spine3",
  });
  b.sweep(armR, { radius: [0.055, 0.045, 0.034], color: fur });
  sph([-0.07, 0.505, 0.215], [0.035, 0.03, 0.035], DARK, "wristR");
  for (let k = -1; k <= 1; k++) {
    const base = new THREE.Vector3(-0.07 + k * 0.02, 0.51, 0.23);
    const tip = base.clone().add(new THREE.Vector3(0.015, 0.02, 0.03));
    b.rod(base, tip, 0.009, { color: DARK, bone: "wristR" });
    b.spike(tip, [0.3, 0.2, 0.4], 0.025, 0.007, { color: CLAW, bone: "wristR" });
  }
  const t0 = new THREE.Vector3(-0.1, 0.47, 0.22), t1 = new THREE.Vector3(0.0, 0.535, 0.2);
  b.rod(t0, t1, 0.005, { color: BARK, bone: "wristR" });
  const sd = new THREE.Vector3(0.3, 0.8, 0.3);
  leaf(t1.clone(), sd, 1.6, "#6f9c8a", "wristR");
  leaf(t0.clone().lerp(t1, 0.6), new THREE.Vector3(-0.2, 0.7, 0.6), 1.5, "#86ad98", "wristR");
  leaf(t0.clone().lerp(t1, 0.3), new THREE.Vector3(-0.8, 0.5, 0.4), 1.4, "#5b8a7c", "wristR");
  leaf(new THREE.Vector3(0, 0.528, 0.19), new THREE.Vector3(0.6, -0.1, 0.5), 1.2, "#7aa595", "jaw");

  b.pose("jaw", { axis: [1, 0, 0], deg: 12 });
  return b.root;
}
