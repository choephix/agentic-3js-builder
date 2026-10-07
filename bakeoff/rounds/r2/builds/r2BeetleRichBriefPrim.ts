import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Stag beetle on a mossy log",
  description:
    "A proud stag beetle with a glossy chestnut wing case, branched antler jaws, elbowed feathery antennae and spiny legs gripping a mossy log, with a dewdrop on one antler.",
};

export default function build() {
  const b = createBuilder({ name: "stagBeetle" });
  const Y = 0.245;
  const body = b.joint("body", { at: [0, Y, 0] });
  const thorax = b.joint("thorax", { at: [0, Y, 0.045], parent: body });
  const head = b.joint("head", { at: [0, Y + 0.003, 0.083], parent: thorax });
  const jawL = b.joint("jawL", { at: [0.012, 0.25, 0.097], parent: head });
  const jawR = b.joint("jawR", { at: [-0.012, 0.25, 0.097], parent: head });
  const elyL = b.joint("elytraL", { at: [0.005, 0.27, 0.02], parent: body });
  const elyR = b.joint("elytraR", { at: [-0.005, 0.27, 0.02], parent: body });
  const antL = b.joint("antennaL", { at: [0.02, 0.255, 0.1], parent: head });
  const antR = b.joint("antennaR", { at: [-0.02, 0.255, 0.1], parent: head });

  const ell = (rx: number, ry: number, rz: number, seg = 10) =>
    new THREE.SphereGeometry(1, seg, Math.max(5, seg - 3)).scale(rx, ry, rz);

  const seg = (a: number[], c: number[], r0: number, r1: number, color: string, bone: any) => {
    const d = Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    return b.part(new THREE.CylinderGeometry(r1, r0, d, 6), color, {
      at: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2],
      dir: [c[0] - a[0], c[1] - a[1], c[2] - a[2]],
      bone,
    });
  };
  const ball = (p: number[], r: number, color: string, bone: any) =>
    b.part(new THREE.SphereGeometry(r, 7, 5), color, { at: p, bone });

  // ---------- log ----------
  const bark = "#5a3d28";
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.62, 12).rotateX(Math.PI / 2), bark, { at: [0, 0.1, 0], bone: body });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.093, 0.093, 0.01, 12).rotateX(Math.PI / 2), "#c9a272", { at: [0, 0.1, s * 0.308], bone: body });
    b.part(new THREE.TorusGeometry(0.05, 0.003, 4, 14), "#8a6540", { at: [0, 0.1, s * 0.314], bone: body });
    b.part(new THREE.TorusGeometry(0.025, 0.003, 4, 12), "#8a6540", { at: [0, 0.1, s * 0.314], bone: body });
  }
  const R = rng(7);
  function rng(seed: number) {
    let s = seed;
    return () => ((s = (s * 16807) % 2147483647) / 2147483647);
  }
  for (let i = 0; i < 14; i++) {
    const th = (i / 14) * Math.PI * 2 + R() * 0.2;
    const x0 = Math.sin(th) * 0.101, y0 = 0.1 + Math.cos(th) * 0.101;
    const z0 = -0.28 + R() * 0.15, z1 = z0 + 0.15 + R() * 0.2;
    seg([x0, y0, z0], [x0, y0, Math.min(z1, 0.29)], 0.004, 0.004, i % 2 ? "#3e2a1b" : "#6b4a31", body);
  }
  for (let i = 0; i < 22; i++) {
    const th = (R() - 0.5) * 2.6;
    const z = -0.28 + R() * 0.56;
    if (Math.abs(z) < 0.07 && Math.abs(th) < 0.5) continue;
    const r = 0.1;
    const g = ["#4f7a2c", "#628f35", "#3d6624"][i % 3];
    b.part(ell(0.02 + R() * 0.02, 0.008 + R() * 0.006, 0.02 + R() * 0.02, 7), g, {
      at: [Math.sin(th) * r, 0.1 + Math.cos(th) * r - 0.001, z], bone: body,
    });
  }
  // little mushrooms
  for (const [x, z] of [[-0.075, -0.2], [0.07, -0.12]]) {
    const y = 0.1 + Math.sqrt(0.01 - x * x);
    seg([x, y - 0.005, z], [x, y + 0.025, z], 0.004, 0.003, "#e8dcc0", body);
    b.part(new THREE.SphereGeometry(0.014, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#c0452e", { at: [x, y + 0.024, z], bone: body });
  }

  // ---------- body ----------
  const black = "#16110f", chest = "#7a2c12", shine = "#c4581f";
  b.part(ell(0.035, 0.022, 0.06), black, { at: [0, 0.238, -0.03], bone: body });
  for (const [s, bn] of [[1, elyL], [-1, elyR]] as const) {
    b.part(ell(0.028, 0.03, 0.075), chest, { at: [s * 0.0185, 0.25, -0.03], bone: bn });
    b.part(ell(0.012, 0.012, 0.05), shine, { at: [s * 0.025, 0.277, -0.025], bone: bn });
    b.part(ell(0.004, 0.006, 0.03), "#ffd9a8", { at: [s * 0.028, 0.285, -0.015], bone: bn });
    b.part(ell(0.006, 0.006, 0.01, 6), "#ffffff", { at: [s * 0.029, 0.288, 0.0], bone: bn });
  }
  b.part(new THREE.BoxGeometry(0.003, 0.004, 0.14), black, { at: [0, 0.279, -0.03], bone: body });
  // thorax
  b.part(ell(0.037, 0.022, 0.026, 8), black, { at: [0, 0.248, 0.052], bone: thorax });
  b.part(ell(0.02, 0.01, 0.015, 6), "#3a302b", { at: [0, 0.264, 0.055], bone: thorax });
  // head
  b.part(ell(0.03, 0.02, 0.022, 8), black, { at: [0, 0.25, 0.085], bone: head });
  for (const s of [1, -1]) {
    ball([s * 0.026, 0.255, 0.088], 0.007, "#2a1f1a", head);
    ball([s * 0.029, 0.257, 0.09], 0.003, "#ffffff", head);
  }

  // ---------- mandibles ----------
  const red = "#8c3a1c", tipc = "#5e230f";
  for (const [s, bn] of [[1, jawL], [-1, jawR]] as const) {
    const P = [[0.012, 0.25, 0.098], [0.03, 0.252, 0.125], [0.032, 0.255, 0.158], [0.012, 0.258, 0.192]]
      .map((p) => [p[0] * s, p[1], p[2]]);
    seg(P[0], P[1], 0.011, 0.009, red, bn);
    seg(P[1], P[2], 0.009, 0.007, red, bn);
    seg(P[2], P[3], 0.007, 0.002, tipc, bn);
    ball(P[1], 0.009, red, bn);
    ball(P[2], 0.007, red, bn);
    const T = (a: number[], c: number[], r: number) =>
      seg(a.map((v, i) => (i === 0 ? v * s : v)), c.map((v, i) => (i === 0 ? v * s : v)), r, 0.0015, tipc, bn);
    T([0.031, 0.254, 0.14], [0.022, 0.275, 0.152], 0.005);
    T([0.032, 0.255, 0.158], [0.044, 0.268, 0.176], 0.004);
    T([0.025, 0.252, 0.12], [0.012, 0.256, 0.134], 0.004);
    T([0.024, 0.257, 0.178], [0.016, 0.268, 0.19], 0.003);
  }
  // dewdrop on left antler tine
  b.part(new THREE.SphereGeometry(0.0065, 10, 8), "#bfe9ff", { at: [0.021, 0.2765, 0.1535], bone: jawL });
  b.part(new THREE.SphereGeometry(0.0022, 5, 4), "#ffffff", { at: [0.019, 0.2795, 0.1545], bone: jawL });

  // ---------- antennae ----------
  for (const [s, bn] of [[1, antL], [-1, antR]] as const) {
    const a = [0.02 * s, 0.255, 0.1], e = [0.04 * s, 0.264, 0.12], t = [0.06 * s, 0.262, 0.14];
    seg(a, e, 0.0025, 0.0022, "#201714", bn);
    ball(e, 0.003, "#201714", bn);
    seg(e, t, 0.002, 0.002, "#201714", bn);
    for (let i = 0; i < 4; i++) {
      const base = [t[0] + 0.004 * s * i * 0.3, t[1], t[2] + 0.0035 * i + 0.002];
      const tip = [base[0] + s * 0.014, base[1] + 0.006 * (i - 1.5) * 0.6 + 0.003, base[2] + 0.004];
      seg(base, tip, 0.0035, 0.001, "#3a2418", bn);
    }
  }

  // ---------- legs ----------
  const legZ = [0.058, 0.012, -0.04];
  const footZ = [0.095, 0.02, -0.075];
  const kneeZ = [0.085, 0.03, -0.07];
  [0, 1, 2].forEach((i) => {
    for (const [s, n] of [[1, "L"], [-1, "R"]] as const) {
      const hipP = [0.028 * s, 0.236, legZ[i]];
      const kneeP = [0.07 * s, 0.262, kneeZ[i]];
      const ankP = [0.088 * s, 0.168, footZ[i] + (i === 0 ? 0.01 : 0)];
      const footP = [0.089 * s, 0.153, footZ[i] + 0.02];
      const hip = b.joint(`hip${n}${i}`, { at: hipP, parent: body });
      const knee = b.joint(`knee${n}${i}`, { at: kneeP, parent: hip });
      const ank = b.joint(`ankle${n}${i}`, { at: ankP, parent: knee });
      seg(hipP, kneeP, 0.008, 0.007, black, hip);
      ball(kneeP, 0.0085, black, knee);
      seg(kneeP, ankP, 0.007, 0.004, black, knee);
      // spines on tibia
      for (let k = 1; k <= 3; k++) {
        const f = k / 4;
        const p = [kneeP[0] + (ankP[0] - kneeP[0]) * f, kneeP[1] + (ankP[1] - kneeP[1]) * f, kneeP[2] + (ankP[2] - kneeP[2]) * f];
        seg(p, [p[0] + 0.012 * s, p[1] + 0.003, p[2] + (k % 2 ? 0.008 : -0.008)], 0.0025, 0.0006, "#2b1f1a", knee);
      }
      seg(ankP, footP, 0.004, 0.003, black, ank);
      // claws
      seg(footP, [footP[0] + 0.004 * s, footP[1] - 0.003, footP[2] + 0.012], 0.0025, 0.0006, "#4a3a30", ank);
      seg(footP, [footP[0] - 0.004 * s, footP[1] - 0.003, footP[2] + 0.012], 0.0025, 0.0006, "#4a3a30", ank);
    }
  });

  return b.root;
}
