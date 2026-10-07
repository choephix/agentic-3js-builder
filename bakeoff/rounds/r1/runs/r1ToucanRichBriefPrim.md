```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Keel-billed Toucan on Mossy Branch",
  description: "A rainbow-beaked toucan showing off on a mossy branch beside a pink orchid.",
};

export default function build() {
  const b = createBuilder({ name: "toucan" });

  // ---- skeleton ----
  const root = b.joint("root", { at: [0, 0, 0] });
  const branchJ = b.joint("branch", { at: [0, 0.05, 0], parent: root });
  const hips = b.joint("hips", { at: [0, 0.3, -0.02], parent: root, role: "spine" });
  const chest = b.joint("chest", { at: [0, 0.37, 0.02], parent: hips, role: "spine" });
  const neck = b.joint("neck", { at: [0, 0.45, 0.05], parent: chest, role: "neck" });
  const head = b.joint("head", { at: [0, 0.5, 0.07], parent: neck, role: "head" });
  const jaw = b.joint("jaw", { at: [0, 0.485, 0.12], parent: head, role: "jaw" });
  const tail1 = b.joint("tail1", { at: [0, 0.24, -0.1], parent: hips, role: "tail" });
  const tail2 = b.joint("tail2", { at: [0, 0.16, -0.22], parent: tail1, role: "tail" });
  const wingL = b.joint("wingL", { at: [0.1, 0.38, 0], parent: chest, role: "wing" });
  const wingR = b.joint("wingR", { at: [-0.1, 0.38, 0], parent: chest, role: "wing" });
  const hipL = b.joint("hipL", { at: [0.05, 0.24, 0], parent: hips, role: "leg" });
  const hipR = b.joint("hipR", { at: [-0.05, 0.24, 0], parent: hips, role: "leg" });
  const footL = b.joint("footL", { at: [0.05, 0.11, 0], parent: hipL, role: "leg" });
  const footR = b.joint("footR", { at: [-0.05, 0.11, 0], parent: hipR, role: "leg" });

  // ---- helpers (geometry baked in model space, then bound to a joint) ----
  const add = (
    geo: THREE.BufferGeometry,
    color: string,
    bone: any,
    o: { p?: number[]; r?: number[]; s?: number[] } = {}
  ) => {
    if (o.s) geo.scale(o.s[0], o.s[1], o.s[2]);
    if (o.r) {
      const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(o.r[0], o.r[1], o.r[2], "YXZ"));
      geo.applyMatrix4(m);
    }
    if (o.p) geo.translate(o.p[0], o.p[1], o.p[2]);
    return (b as any).part(geo, color, { bone });
  };
  const rod = (a: number[], c: number[], r: number, color: string, bone: any, seg = 6) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...c);
    const len = va.distanceTo(vb);
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
    g.applyQuaternion(q);
    const m = va.clone().add(vb).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    return (b as any).part(g, color, { bone });
  };
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // ---- branch ----
  add(new THREE.CylinderGeometry(0.05, 0.055, 0.9, 7), "#5a4030", branchJ, { r: [0, 0, Math.PI / 2], p: [0, 0.05, 0] });
  add(new THREE.CylinderGeometry(0.036, 0.04, 0.2, 6), "#5a4030", branchJ, { r: [0.5, 0, Math.PI / 2 + 0.3], p: [0.5, 0.1, -0.03] });
  const moss = ["#4f7a35", "#6a9a3f", "#3f6a2e"];
  const mr = [
    [-0.3, 0.09, 0.02, 0.05], [-0.1, 0.095, -0.02, 0.045], [0.2, 0.09, 0.02, 0.055],
    [0.35, 0.085, -0.01, 0.04], [-0.42, 0.07, 0.03, 0.04], [0.05, 0.1, 0.03, 0.03],
  ];
  mr.forEach((m, i) => add(sph(m[3], 6, 4), moss[i % 3], branchJ, { p: [m[0], m[1], m[2]], s: [1.4, 0.55, 1.1] }));
  // moss hanging tufts
  [[-0.2, 0.0], [0.28, 0.02], [0.4, 0.0]].forEach((t, i) =>
    add(sph(0.03, 5, 4), moss[(i + 1) % 3], branchJ, { p: [t[0], 0.03, 0.05], s: [1, 1.6, 0.8] })
  );

  // ---- body ----
  add(sph(0.14, 10, 8), "#0d0d12", hips, { p: [0, 0.31, -0.03], s: [0.95, 1.2, 1.0], r: [0.3, 0, 0] });
  add(sph(0.1, 8, 6), "#14141c", chest, { p: [0, 0.41, 0.0], s: [1, 1, 0.95] });
  // yellow bib
  add(sph(0.095, 8, 6), "#ffe94a", chest, { p: [0, 0.39, 0.06], s: [0.95, 1.25, 0.6], r: [0.2, 0, 0] });
  add(sph(0.06, 8, 5), "#fff6a8", chest, { p: [0, 0.43, 0.095], s: [0.9, 1, 0.4] });
  // neck
  add(sph(0.075, 8, 6), "#101018", neck, { p: [0, 0.46, 0.04] });
  // head
  add(sph(0.08, 9, 7), "#0d0d12", head, { p: [0, 0.505, 0.07] });
  // white-ish cheek hint
  add(sph(0.04, 6, 4), "#f4f0d8", head, { p: [0, 0.455, 0.085], s: [1.5, 0.7, 0.7] });
  // eyes
  [1, -1].forEach((s) => {
    add(sph(0.036, 8, 6), "#9be02f", head, { p: [s * 0.062, 0.525, 0.1], s: [0.5, 1, 1] });
    add(sph(0.022, 6, 5), "#0b0b0b", head, { p: [s * 0.072, 0.527, 0.105], s: [0.5, 1, 1] });
    add(sph(0.007, 4, 3), "#ffffff", head, { p: [s * 0.078, 0.533, 0.115] });
  });

  // ---- beak ----
  const n = 8, z0 = 0.13, z1 = 0.39, dz = (z1 - z0) / n;
  const upperCol = (t: number) => (t < 0.28 ? "#8fd13a" : t < 0.52 ? "#3fa9e0" : t < 0.84 ? "#ff8a1f" : "#d81f2a");
  const lowerCol = (t: number) => (t < 0.3 ? "#3fa9e0" : t < 0.7 ? "#8fd13a" : t < 0.86 ? "#ff8a1f" : "#d81f2a");
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const z = z0 + dz * (i + 0.5);
    const hu = 0.085 * (1 - t) + 0.03;
    const w = 0.075 * (1 - t * 0.55) + 0.012;
    const yc = 0.515 - 0.045 * t * t;
    add(box(w, hu, dz * 1.05), upperCol(t), head, { p: [0, yc, z], r: [0.05 * t, 0, 0] });
    // culmen ridge
    add(box(w * 0.3, 0.01, dz * 1.05), t < 0.85 ? "#f2e24a" : "#a8141c", head, { p: [0, yc + hu / 2, z] });
    // lower jaw
    const hl = 0.04 * (1 - t) + 0.018;
    const yl = yc - hu / 2 - hl / 2 + 0.003;
    add(box(w * 0.85, hl, dz * 1.05), lowerCol(t), jaw, { p: [0, yl - 0.004, z - 0.004] });
  }
  // beak base black stripe + nostril dots
  add(box(0.08, 0.09, 0.012), "#0d0d12", head, { p: [0, 0.51, 0.13] });
  [1, -1].forEach((s) => add(sph(0.01, 4, 3), "#1a1a1a", head, { p: [s * 0.038, 0.525, 0.2], s: [0.5, 1, 1.5] }));
  // tip hook
  add(box(0.03, 0.02, 0.025), "#d81f2a", head, { p: [0, 0.5 - 0.045 + 0.008, z1 + 0.01], r: [0.5, 0, 0] });

  // ---- wings ----
  [[1, wingL], [-1, wingR]].forEach(([s, j]: any) => {
    add(sph(0.1, 8, 6), "#0a0a10", j, { p: [s * 0.115, 0.32, -0.04], s: [0.3, 1.5, 0.85], r: [0.25, 0, s * -0.1] });
    add(sph(0.06, 6, 5), "#1b2a4a", j, { p: [s * 0.135, 0.28, -0.07], s: [0.2, 1.5, 0.7], r: [0.25, 0, s * -0.1] });
  });

  // ---- tail ----
  add(box(0.11, 0.025, 0.26), "#0b0b10", tail1, { p: [0, 0.17, -0.2], r: [0.7, 0, 0] });
  add(box(0.07, 0.02, 0.1), "#14141c", tail2, { p: [0, 0.07, -0.3], r: [0.8, 0, 0] });
  // scarlet undertail
  add(sph(0.05, 7, 5), "#e8142a", tail1, { p: [0, 0.2, -0.12], s: [1.2, 0.8, 1.0] });

  // ---- legs & feet ----
  [[1, hipL, footL], [-1, hipR, footR]].forEach(([s, h, f]: any) => {
    rod([s * 0.05, 0.25, 0], [s * 0.05, 0.115, 0.01], 0.014, "#2a8fe0", h);
    add(sph(0.022, 5, 4), "#2a8fe0", h, { p: [s * 0.05, 0.12, 0.01] });
    // two toes forward, two back
    [-0.012, 0.012].forEach((dx) => {
      rod([s * 0.05 + dx, 0.115, 0.01], [s * 0.05 + dx * 2.5, 0.108, 0.085], 0.01, "#2a8fe0", f, 5);
      add(sph(0.012, 4, 3), "#0d0d12", f, { p: [s * 0.05 + dx * 2.5, 0.106, 0.09] });
      rod([s * 0.05 + dx, 0.115, 0.0], [s * 0.05 + dx * 2, 0.108, -0.05], 0.009, "#2a8fe0", f, 5);
    });
  });

  // ---- orchid ----
  const ox = -0.3, oy = 0.34, oz = 0.06;
  rod([ox, 0.1, 0.03], [ox, oy - 0.03, oz - 0.01], 0.008, "#4c9a3a", branchJ);
  // leaves
  add(sph(0.05, 5, 4), "#3f8a34", branchJ, { p: [ox - 0.05, 0.14, 0.04], s: [1.6, 0.3, 0.6], r: [0, 0, 0.5] });
  add(sph(0.05, 5, 4), "#3f8a34", branchJ, { p: [ox + 0.05, 0.13, 0.04], s: [1.6, 0.3, 0.6], r: [0, 0, -0.5] });
  const pet = (ang: number, len: number, wid: number, col: string) => {
    const x = Math.cos(ang) * len * 0.5, y = Math.sin(ang) * len * 0.5;
    add(sph(0.05, 6, 4), col, branchJ, { p: [ox + x, oy + y, oz], s: [len / 0.05 * 0.5, wid / 0.05 * 0.5, 0.15], r: [0, 0, ang] });
  };
  // top sepal and side sepals
  pet(Math.PI / 2, 0.09, 0.05, "#f7a6c8");
  pet(Math.PI / 2 + 2.1, 0.09, 0.05, "#f7a6c8");
  pet(Math.PI / 2 - 2.1, 0.09, 0.05, "#f7a6c8");
  // broad petals
  pet(0.25, 0.1, 0.075, "#ff7fb2");
  pet(Math.PI - 0.25, 0.1, 0.075, "#ff7fb2");
  // lip
  add(sph(0.03, 6, 4), "#c2185b", branchJ, { p: [ox, oy - 0.035, oz + 0.012], s: [1, 1.3, 0.5] });
  add(sph(0.014, 5, 4), "#ffd84a", branchJ, { p: [ox, oy, oz + 0.015] });
  // bud
  add(sph(0.016, 5, 4), "#f7a6c8", branchJ, { p: [ox + 0.03, 0.27, 0.03], s: [1, 1.4, 1] });

  return b.root;
}
```