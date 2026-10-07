import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Clockwork Terrier",
  description:
    "Wind-up brass and copper terrier with riveted plates, spinning chest gears, a winding key, spring legs and tail, leather ears, green glass eyes and a red collar with a brass tag.",
};

export default function build() {
  const b = createBuilder({ name: "clockworkTerrier" });
  const BRASS = "#c9a227", COPPER = "#b8643a", DARK = "#2e2218", LEATHER = "#6b3e26";
  const RED = "#b3202a", GREEN = "#4fd486", STEEL = "#8d9096", POLISH = "#e3c35a";

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.3, -0.05] });
  const chest = b.joint("chest", { at: [0, 0.34, 0.15], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.4, 0.24], parent: chest });
  const head = b.joint("head", { at: [0, 0.48, 0.3], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.445, 0.4], parent: head });
  const earL = b.joint("earL", { at: [0.08, 0.575, 0.3], parent: head });
  const earR = b.joint("earR", { at: [-0.08, 0.575, 0.3], parent: head });
  const key = b.joint("key", { at: [0, 0.44, -0.02], parent: hips });
  const tail1 = b.joint("tail1", { at: [0, 0.36, -0.26], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.43, -0.33], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.5, -0.4], parent: tail2 });
  const tail4 = b.joint("tail4", { at: [0, 0.57, -0.47], parent: tail3 });
  const tailBones = [tail1, tail2, tail3, tail4];

  // ---------- helpers ----------
  const part = (g: THREE.BufferGeometry, c: string, at: number[], bone: any) =>
    b.part(g, c, { at: at as any, bone });
  const Y = new THREE.Vector3(0, 1, 0);
  const rod = (a: number[], c2: number[], r: number, col: string, bone: any, seg = 8) => {
    const va = new THREE.Vector3(...(a as [number, number, number]));
    const vb = new THREE.Vector3(...(c2 as [number, number, number]));
    const d = vb.clone().sub(va);
    const g = new THREE.CylinderGeometry(r, r, d.length(), seg);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Y, d.clone().normalize()));
    const m = va.clone().add(vb).multiplyScalar(0.5);
    return part(g, col, [m.x, m.y, m.z], bone);
  };
  const ball = (r: number, col: string, at: number[], bone: any, seg = 8) =>
    part(new THREE.SphereGeometry(r, seg, seg - 2), col, at, bone);
  const box = (w: number, h: number, d: number, col: string, at: number[], bone: any) =>
    part(new THREE.BoxGeometry(w, h, d), col, at, bone);

  // ---------- body ----------
  box(0.26, 0.22, 0.44, BRASS, [0, 0.33, 0.0], hips);
  box(0.2, 0.012, 0.32, COPPER, [0, 0.446, 0.0], hips);
  box(0.22, 0.05, 0.1, COPPER, [0, 0.31, 0.2], chest);
  for (const z of [-0.15, -0.05, 0.05]) {
    box(0.275, 0.235, 0.025, COPPER, [0, 0.33, z], hips);
    for (const sx of [1, -1]) {
      for (const y of [0.25, 0.3, 0.35, 0.4]) ball(0.009, POLISH, [sx * 0.141, y, z], hips, 6);
    }
    for (const x of [-0.09, -0.03, 0.03, 0.09]) ball(0.009, POLISH, [x, 0.453, z], hips, 6);
  }
  // belly
  box(0.2, 0.02, 0.36, COPPER, [0, 0.218, 0], hips);

  // ---------- chest gears ----------
  const gear = (cx: number, cy: number, cz: number, r: number, teeth: number, col: string, bone: any) => {
    const core = new THREE.CylinderGeometry(r, r, 0.016, teeth, 1);
    core.rotateZ(Math.PI / 2);
    part(core, col, [cx, cy, cz], bone);
    const hub = new THREE.CylinderGeometry(r * 0.3, r * 0.3, 0.026, 8);
    hub.rotateZ(Math.PI / 2);
    part(hub, DARK, [cx, cy, cz], bone);
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const g = new THREE.BoxGeometry(0.016, r * 0.35, r * 0.28);
      g.rotateX(a);
      part(g, col, [cx, cy + Math.cos(a) * r, cz + Math.sin(a) * r], bone);
    }
  };
  for (const [sx, s] of [[1, "L"], [-1, "R"]] as [number, string][]) {
    box(0.012, 0.17, 0.2, DARK, [sx * 0.135, 0.32, 0.13], chest);
    const gA = b.joint("gearA" + s, { at: [sx * 0.145, 0.35, 0.17], parent: chest });
    const gB = b.joint("gearB" + s, { at: [sx * 0.145, 0.28, 0.1], parent: chest });
    gear(sx * 0.145, 0.35, 0.17, 0.045, 10, POLISH, gA);
    gear(sx * 0.145, 0.28, 0.1, 0.033, 8, COPPER, gB);
  }

  // ---------- key ----------
  rod([0, 0.44, -0.02], [0, 0.58, -0.02], 0.011, STEEL, key);
  const kc = new THREE.CylinderGeometry(0.03, 0.035, 0.02, 10);
  part(kc, COPPER, [0, 0.455, -0.02], key);
  for (const sx of [1, -1]) {
    const w = new THREE.CylinderGeometry(0.05, 0.05, 0.012, 14);
    w.rotateX(Math.PI / 2);
    w.scale(1, 1.2, 1);
    part(w, POLISH, [sx * 0.055, 0.61, -0.02], key);
    const hole = new THREE.CylinderGeometry(0.02, 0.02, 0.016, 10);
    hole.rotateX(Math.PI / 2);
    part(hole, DARK, [sx * 0.058, 0.61, -0.02], key);
  }
  box(0.04, 0.05, 0.016, POLISH, [0, 0.6, -0.02], key);
  ball(0.016, BRASS, [0, 0.585, -0.02], key, 8);

  // ---------- neck, collar, tag ----------
  rod([0, 0.38, 0.22], [0, 0.48, 0.3], 0.065, BRASS, neck);
  const collar = new THREE.TorusGeometry(0.072, 0.014, 6, 14);
  collar.rotateX(Math.PI / 2);
  collar.rotateX(0.64);
  part(collar, RED, [0, 0.43, 0.26], neck);
  const tag = new THREE.CylinderGeometry(0.026, 0.026, 0.006, 12);
  tag.rotateX(Math.PI / 2);
  part(tag, POLISH, [0, 0.385, 0.325], neck);
  const tagHole = new THREE.CylinderGeometry(0.008, 0.008, 0.008, 6);
  tagHole.rotateX(Math.PI / 2);
  part(tagHole, DARK, [0, 0.395, 0.326], neck);
  box(0.016, 0.004, 0.004, DARK, [0, 0.378, 0.329], neck);
  box(0.02, 0.008, 0.01, RED, [0, 0.41, 0.322], neck);

  // ---------- head ----------
  box(0.17, 0.15, 0.17, BRASS, [0, 0.5, 0.33], head);
  box(0.1, 0.06, 0.13, COPPER, [0, 0.475, 0.46], head);
  box(0.11, 0.012, 0.14, POLISH, [0, 0.508, 0.455], head);
  box(0.14, 0.02, 0.012, COPPER, [0, 0.53, 0.41], head); // brow band
  ball(0.025, DARK, [0, 0.5, 0.53], head, 8);
  box(0.11, 0.03, 0.11, COPPER, [0, 0.425, 0.455], jaw);
  box(0.06, 0.03, 0.03, DARK, [0, 0.445, 0.5], jaw); // mouth shadow
  box(0.1, 0.03, 0.03, STEEL, [0, 0.41, 0.52], jaw); // beard plate
  for (const sx of [1, -1]) {
    ball(0.009, POLISH, [sx * 0.088, 0.54, 0.27], head, 6);
    ball(0.009, POLISH, [sx * 0.088, 0.46, 0.27], head, 6);
    // eyes
    const ring = new THREE.TorusGeometry(0.034, 0.008, 6, 12);
    part(ring, POLISH, [sx * 0.05, 0.535, 0.418], head);
    ball(0.03, GREEN, [sx * 0.05, 0.535, 0.412], head, 8);
    ball(0.012, DARK, [sx * 0.05, 0.535, 0.438], head, 6);
    ball(0.005, "#eafff0", [sx * 0.058, 0.545, 0.444], head, 4);
    // whisker bolts
    ball(0.007, STEEL, [sx * 0.06, 0.47, 0.52], head, 5);
  }

  // ---------- ears ----------
  for (const [sx, bone] of [[1, earL], [-1, earR]] as [number, any][]) {
    const e = new THREE.BoxGeometry(0.03, 0.1, 0.075);
    e.rotateZ(sx * 0.25);
    part(e, LEATHER, [sx * 0.098, 0.52, 0.31], bone);
    const t = new THREE.BoxGeometry(0.026, 0.04, 0.06);
    t.rotateZ(sx * 0.4);
    part(t, LEATHER, [sx * 0.115, 0.465, 0.315], bone);
    ball(0.008, POLISH, [sx * 0.082, 0.56, 0.31], bone, 5);
  }

  // ---------- legs ----------
  const legs: [string, number, number, any][] = [
    ["FL", 1, 1, chest], ["FR", -1, 1, chest], ["BL", 1, -1, hips], ["BR", -1, -1, hips],
  ];
  for (const [n, sx, fb, parent] of legs) {
    const x = sx * 0.1;
    const hipP = [x, 0.28, fb > 0 ? 0.17 : -0.16];
    const kneeP = fb > 0 ? [x, 0.17, 0.2] : [x, 0.17, -0.1];
    const ankP = fb > 0 ? [x, 0.075, 0.17] : [x, 0.08, -0.19];
    const hipJ = b.joint("hip" + n, { at: hipP as any, parent });
    const kneeJ = b.joint("knee" + n, { at: kneeP as any, parent: hipJ });
    const ankJ = b.joint("ankle" + n, { at: ankP as any, parent: kneeJ });
    ball(0.04, BRASS, hipP, hipJ, 8);
    rod(hipP, kneeP, 0.03, COPPER, hipJ);
    ball(0.034, POLISH, kneeP, kneeJ, 8);
    // spring shin
    rod(kneeP, ankP, 0.009, STEEL, kneeJ, 5);
    const coils = 6;
    const dv = new THREE.Vector3(...(ankP as [number, number, number])).sub(new THREE.Vector3(...(kneeP as [number, number, number])));
    const q = new THREE.Quaternion().setFromUnitVectors(Y, dv.clone().normalize());
    for (let i = 0; i < coils; i++) {
      const t = (i + 0.5) / coils;
      const g = new THREE.TorusGeometry(0.024, 0.006, 5, 10);
      g.rotateX(Math.PI / 2);
      g.rotateY(i * 0.6);
      g.applyQuaternion(q);
      const p = new THREE.Vector3(...(kneeP as [number, number, number])).addScaledVector(dv, t);
      part(g, COPPER, [p.x, p.y, p.z], kneeJ);
    }
    ball(0.028, BRASS, ankP, ankJ, 8);
    box(0.06, 0.04, 0.1, COPPER, [x, 0.02, ankP[2] + 0.025], ankJ);
    box(0.062, 0.012, 0.03, POLISH, [x, 0.006, ankP[2] + 0.07], ankJ);
    for (const dx of [-0.018, 0.018]) ball(0.01, DARK, [x + dx, 0.025, ankP[2] + 0.078], ankJ, 5);
  }

  // ---------- spring tail ----------
  const d = new THREE.Vector3(0, 0.7, -0.7).normalize();
  const u = new THREE.Vector3(1, 0, 0);
  const v = new THREE.Vector3().crossVectors(d, u).normalize();
  const c0 = new THREE.Vector3(0, 0.36, -0.26);
  const N = 40, turns = 4.5, len = 0.36, R = 0.035;
  let prev: THREE.Vector3 | null = null;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = t * turns * Math.PI * 2;
    const p = c0.clone().addScaledVector(d, t * len)
      .addScaledVector(u, Math.cos(a) * R * (1 - t * 0.3))
      .addScaledVector(v, Math.sin(a) * R * (1 - t * 0.3));
    if (prev) rod([prev.x, prev.y, prev.z], [p.x, p.y, p.z], 0.007, i % 2 ? COPPER : POLISH, tailBones[Math.min(3, Math.floor(t * 4))], 5);
    prev = p;
  }
  ball(0.02, POLISH, [prev!.x, prev!.y, prev!.z], tail4, 8);
  ball(0.03, BRASS, [0, 0.36, -0.25], tail1, 8);

  return b.root;
}
