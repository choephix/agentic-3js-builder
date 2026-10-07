import * as THREE from "three";
import { createBuilder, paint } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Hot-air balloon at lift-off",
  description:
    "Striped envelope with a diamond band, glowing burner, rope rigging, wicker basket with sandbags, tie-down ropes and a pennant.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "balloon" });
  b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0], role: "spine" });
  b.joint("envelope", { parent: "root", at: [0, 5, 0], dir: [0, 1, 0] });
  b.joint("flag", { parent: "root", at: [0.95, 2.0, 0.95], dir: [1, 0, 0], role: "hinge" });

  const part = (g: THREE.BufferGeometry, color: string | ReturnType<typeof paint>, at: [number, number, number], bone = "root", extra: object = {}) =>
    b.part(g, color, { at, bone, ...extra });
  const rope = (a: [number, number, number], c: [number, number, number], r = 0.012, color = "#6b4a2b") =>
    b.rod(a, c, r, { color, bone: "root", sides: 5 });

  // ---------- envelope ----------
  const COL = ["#f7c21b", "#e8412c", "#3a9be0"];
  const env = paint((p, _n, s) => {
    const deg = s[1];
    if (p.y > 17.6) return "#b5301f";
    const lo = 11.2;
    const hi = 12.9;
    if (p.y > lo - 0.1 && p.y < hi + 0.1) {
      if (p.y < lo || p.y > hi) return "#2b2b3a";
      if (p.y < lo + 0.07 || p.y > hi - 0.07) return "#fff1c9";
      const u = Math.floor(deg / 15);
      const v = Math.floor((p.y - lo) / 0.28);
      return (u + v) % 2 === 0 ? "#fff3d6" : "#2f4f9e";
    }
    const f = deg % 30;
    if (f < 0.6 || f > 29.4) return "#fff1c9";
    return COL[Math.floor(deg / 30) % 3];
  });
  const prof: OutlinePoint[] = [
    [0, 0, "sharp"], [1.1, 0, "sharp"], [1.5, 0.5], [2.6, 1.8], [3.8, 3.6], [4.9, 5.8],
    [5.5, 7.6], [5.4, 9], [4.6, 10.7], [3.3, 12], [1.8, 12.9], [0, 13.2, "sharp"],
  ];
  b.lathe(prof, { color: env, at: [0, 5, 0], bone: "envelope", segments: 24, smoothing: 1 });
  // skirt
  b.lathe([[1.05, 0], [1.12, 0], [1.2, 0.85], [1.1, 0.85]], {
    color: "#b5301f", at: [0, 4.2, 0], bone: "envelope", segments: 16,
  });
  // crown cap ring
  part(new THREE.TorusGeometry(0.5, 0.05, 5, 12), "#fff1c9", [0, 18.15, 0], "envelope", { rotation: [90, 0, 0] });

  // ---------- basket ----------
  const wicker = paint((p) => {
    const a = Math.floor(p.y / 0.07);
    const c = Math.floor((p.x + p.z) / 0.09);
    return (a + c) & 1 ? "#c28a45" : "#a5692c";
  });
  part(new THREE.BoxGeometry(1.3, 0.95, 1.3), wicker, [0, 0.555, 0]);
  part(new THREE.BoxGeometry(1.15, 0.03, 1.15), "#5b3d22", [0, 1.04, 0]);
  for (const z of [-0.5, 0.5]) part(new THREE.BoxGeometry(1.5, 0.08, 0.1), "#4a3220", [0, 0.04, z]);
  for (const z of [-0.65, 0.65]) part(new THREE.BoxGeometry(1.4, 0.1, 0.1), "#5a3a1e", [0, 1.05, z]);
  for (const x of [-0.65, 0.65]) part(new THREE.BoxGeometry(0.1, 0.1, 1.4), "#5a3a1e", [x, 1.05, 0]);
  // tanks
  for (const x of [-0.36, 0.36]) {
    part(new THREE.CylinderGeometry(0.17, 0.17, 0.6, 10), "#c9ced6", [x, 1.33, -0.3]);
    part(new THREE.SphereGeometry(0.17, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#c9ced6", [x, 1.63, -0.3]);
    part(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 6), "#d6452c", [x, 1.72, -0.3]);
  }

  // ---------- poles, frame, burner ----------
  const corners: Array<[number, number]> = [[0.6, 0.6], [-0.6, 0.6], [-0.6, -0.6], [0.6, -0.6]];
  for (const [x, z] of corners) {
    b.rod([x, 1.05, z], [x, 2.6, z], 0.032, { color: "#8a8f98", bone: "root", sides: 6 });
    part(new THREE.SphereGeometry(0.05, 6, 4), "#8a8f98", [x, 2.6, z]);
  }
  for (let i = 0; i < 4; i++) {
    const [x0, z0] = corners[i];
    const [x1, z1] = corners[(i + 1) % 4];
    b.rod([x0, 2.6, z0], [x1, 2.6, z1], 0.028, { color: "#8a8f98", bone: "root", sides: 6 });
  }
  b.rod([-0.6, 2.6, 0], [0.6, 2.6, 0], 0.025, { color: "#8a8f98", bone: "root", sides: 6 });
  b.rod([0, 2.6, -0.6], [0, 2.6, 0.6], 0.025, { color: "#8a8f98", bone: "root", sides: 6 });
  part(new THREE.CylinderGeometry(0.06, 0.06, 0.35, 8), "#33363d", [0, 2.78, 0]);
  part(new THREE.CylinderGeometry(0.15, 0.12, 0.22, 10), "#4a4f58", [0, 3.0, 0]);
  part(new THREE.ConeGeometry(0.22, 1.5, 8), "#ff6a1a", [0, 3.9, 0]);
  part(new THREE.ConeGeometry(0.13, 1.0, 8), "#ffb62e", [0, 3.7, 0]);
  part(new THREE.ConeGeometry(0.06, 0.6, 6), "#fff0a0", [0, 3.5, 0]);
  // hoses
  rope([0.36, 1.7, -0.3], [0.1, 2.9, -0.05], 0.02, "#2b2b2b");
  rope([-0.36, 1.7, -0.3], [-0.1, 2.9, -0.05], 0.02, "#2b2b2b");

  // ---------- rigging ----------
  const sk: Array<[number, number]> = corners.map(([x, z]) => [x * 1.3, z * 1.3]);
  corners.forEach(([x, z], i) => {
    rope([x, 2.6, z], [sk[i][0], 4.2, sk[i][1]], 0.016);
  });
  const mids: Array<[number, number, number, number]> = [
    [1.12, 0, 0, 1], [0, 1.12, 1, 2], [-1.12, 0, 2, 3], [0, -1.12, 3, 0],
  ];
  for (const [mx, mz, a, c] of mids) {
    // corner indices a,c neighbours (approx; choose nearest two pole tops)
    const near = [...corners.keys()].sort(
      (i, j) => Math.hypot(corners[i][0] - mx, corners[i][1] - mz) - Math.hypot(corners[j][0] - mx, corners[j][1] - mz),
    ).slice(0, 2);
    void a; void c;
    for (const i of near) rope([corners[i][0], 2.6, corners[i][1]], [mx, 4.2, mz], 0.012);
  }

  // ---------- sandbags ----------
  const bag = (x: number, z: number, side: "x" | "z") => {
    const sc: [number, number, number] = side === "x" ? [0.14, 0.22, 0.17] : [0.17, 0.22, 0.14];
    const off = 0.66 + 0.13;
    const bx = side === "x" ? Math.sign(x) * off : x;
    const bz = side === "z" ? Math.sign(z) * off : z;
    part(new THREE.SphereGeometry(1, 8, 6), "#d9b87a", [bx, 0.62, bz], "root", { scale: sc });
    part(new THREE.ConeGeometry(0.07, 0.12, 6), "#8a6a3a", [bx, 0.9, bz]);
    const rx = side === "x" ? Math.sign(x) * 0.68 : x;
    const rz = side === "z" ? Math.sign(z) * 0.68 : z;
    rope([rx, 1.03, rz], [bx, 0.94, bz], 0.014, "#5a3a1e");
  };
  bag(1, -0.28, "x"); bag(1, 0.28, "x");
  bag(-1, -0.28, "x"); bag(-1, 0.28, "x");
  bag(0.0, 1, "z"); bag(0.0, -1, "z");

  // ---------- flag ----------
  const T = [0.95, 2.0, 0.95];
  b.rod([0.7, 1.05, 0.7], [T[0], T[1], T[2]], 0.02, { color: "#e0c070", bone: "root", sides: 6 });
  part(new THREE.SphereGeometry(0.045, 6, 4), "#f2c230", [T[0], T[1] + 0.02, T[2]], "flag");
  b.slab([[T[0], T[1], T[2]], [T[0], T[1] - 0.3, T[2]], [T[0] + 0.7, T[1] - 0.14, T[2]]], {
    color: "#e8412c", thickness: 0.012, bone: "flag",
  });
  b.slab(
    [[T[0] + 0.05, T[1] - 0.07, T[2] + 0.008], [T[0] + 0.05, T[1] - 0.23, T[2] + 0.008], [T[0] + 0.4, T[1] - 0.15, T[2] + 0.008]],
    { color: "#f7c21b", thickness: 0.012, bone: "flag" },
  );

  // ---------- tie-down ropes ----------
  for (const sx of [-1, 1]) {
    rope([0.65 * sx, 1.0, -0.65], [1.8 * sx, 0.25, -2.2], 0.02, "#7a5a36");
    part(new THREE.CylinderGeometry(0.035, 0.03, 0.4, 6), "#4a3220", [1.8 * sx, 0.12, -2.2]);
  }

  return b.root;
}
