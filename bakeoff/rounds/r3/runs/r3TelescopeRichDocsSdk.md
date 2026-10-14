```ts
import * as THREE from "three";
import { createBuilder, grain, countershade } from "agentic-3js-builder";

export const meta = {
  name: "Explorer's Brass Telescope",
  description:
    "Polished brass telescope with leather-wrapped sections, engraved bands, finder scope, rubber eyecup and focus knobs, on a mahogany tripod with brass fittings and a tray holding a rolled star chart.",
};

const BRASS = "#d0a03a";
const BRASS_D = "#9a6f1e";
const LEATHER = "#5b2f1a";
const STITCH = "#c9b38a";
const RUBBER = "#18181a";
const GLASS = "#2a4a78";
const PAPER = "#e8dcb8";
const RIBBON = "#a3201f";
const MAH = "#6b2a17";

export default function build() {
  const b = createBuilder({ name: "telescope" });

  const base = b.joint("base", { at: [0, 0, 0] });
  const head = b.joint("head", { parent: base, at: [0, 1.2, 0], aim: [0, 1.3, 0] });

  // Tube frame
  const ang = (20 * Math.PI) / 180;
  const d: [number, number, number] = [0, Math.sin(ang), Math.cos(ang)];
  const up: [number, number, number] = [0, Math.cos(ang), -Math.sin(ang)];
  const c: [number, number, number] = [0, 1.42, 0.05];
  const P = (u: number, w = 0, x = 0): [number, number, number] => [
    c[0] + d[0] * u + up[0] * w + x,
    c[1] + d[1] * u + up[1] * w,
    c[2] + d[2] * u + up[2] * w,
  ];
  const tube = b.joint("tube", { parent: head, at: c, aim: P(1) });
  const finder = b.joint("finder", { parent: tube, at: P(0.08, 0.1), aim: P(0.5, 0.1) });
  const nDir: [number, number, number] = [-d[0], -d[1], -d[2]];

  const brassPaint = countershade("#e8bd52", "#a87a24", { level: -0.1 });
  const ring = (u: number, r: number, w: number, color: string, w2 = 0, bone: any = tube) =>
    b.rod(P(u - w / 2, w2), P(u + w / 2, w2), r, { color, bone, sides: 14 });
  const bead = (u: number, r: number, color: string) =>
    b.part(new THREE.TorusGeometry(r, 0.005, 5, 16), color, { at: P(u), dir: d, axis: "z", bone: tube });

  // --- Main tube ---
  b.rod(P(-0.4), P(0.5), 0.05, { color: brassPaint, bone: tube, sides: 16 });
  // leather wraps
  for (const [u0, u1] of [[-0.17, 0.05], [0.24, 0.42]]) {
    b.rod(P(u0), P(u1), 0.0535, { color: LEATHER, bone: tube, sides: 16 });
    ring(u0, 0.057, 0.012, BRASS_D);
    ring(u1, 0.057, 0.012, BRASS_D);
    // stitch rings
    const n = Math.round((u1 - u0) / 0.022);
    for (let i = 1; i < n; i++) ring(u0 + (i * (u1 - u0)) / n, 0.0545, 0.004, STITCH);
  }
  // engraved bands
  for (const u of [0.1, 0.125, 0.45, 0.475, -0.35, -0.325]) ring(u, 0.0555, 0.01, BRASS);
  for (const u of [0.1125, 0.4625, -0.3375]) bead(u, 0.054, BRASS_D);
  bead(-0.4, 0.05, BRASS_D);
  // objective bell and dew shield
  b.rod(P(0.5), P(0.62), [0.05, 0.072], { color: brassPaint, bone: tube, sides: 16 });
  ring(0.5, 0.058, 0.014, BRASS_D);
  b.rod(P(0.62), P(0.74), 0.072, { color: brassPaint, bone: tube, sides: 16 });
  ring(0.74, 0.076, 0.016, BRASS_D);
  ring(0.62, 0.076, 0.012, BRASS_D);
  b.part(new THREE.CircleGeometry(0.064, 16), GLASS, { at: P(0.7415), dir: d, axis: "z", bone: tube });
  // rear drawtube and eyepiece
  b.rod(P(-0.55), P(-0.4), 0.04, { color: brassPaint, bone: tube, sides: 14 });
  ring(-0.55, 0.046, 0.02, BRASS_D);
  ring(-0.47, 0.043, 0.008, BRASS);
  b.rod(P(-0.66), P(-0.55), 0.026, { color: BRASS_D, bone: tube, sides: 12 });
  b.rod(P(-0.71), P(-0.66), [0.04, 0.03], { color: RUBBER, bone: tube, sides: 14 });
  b.part(new THREE.CircleGeometry(0.022, 12), GLASS, { at: P(-0.7115), dir: nDir, axis: "z", bone: tube });

  // --- Focus knobs ---
  for (const s of [1, -1]) {
    b.rod(P(-0.28, 0, s * 0.045), P(-0.28, 0, s * 0.1), 0.009, { color: BRASS_D, bone: tube, sides: 8 });
    b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.024, 12), BRASS, {
      at: P(-0.28, 0, s * 0.108), dir: [s, 0, 0], bone: tube,
    });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 8), BRASS_D, {
      at: P(-0.28, 0, s * 0.122), dir: [s, 0, 0], bone: tube,
    });
    // pivot bolts
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 10), BRASS_D, {
      at: [s * 0.085, c[1], c[2]], dir: [s, 0, 0], bone: tube,
    });
  }

  // --- Finder scope ---
  const F = (u: number, x = 0) => P(u, 0.1, x);
  b.rod(F(-0.12), F(0.28), 0.018, { color: brassPaint, bone: finder, sides: 12 });
  b.rod(F(0.28), F(0.35), [0.018, 0.028], { color: brassPaint, bone: finder, sides: 12 });
  b.rod(F(-0.18), F(-0.12), 0.012, { color: BRASS_D, bone: finder, sides: 10 });
  b.rod(F(-0.21), F(-0.18), [0.016, 0.012], { color: RUBBER, bone: finder, sides: 10 });
  b.part(new THREE.CircleGeometry(0.025, 12), GLASS, { at: F(0.3505), dir: d, axis: "z", bone: finder });
  for (const u of [-0.05, 0.2]) {
    b.part(new THREE.TorusGeometry(0.022, 0.005, 5, 14), BRASS, { at: F(u), dir: d, axis: "z", bone: finder });
    b.rod(P(u, 0.045), P(u, 0.095), 0.009, { color: BRASS_D, bone: finder, sides: 8 });
    b.part(new THREE.BoxGeometry(0.05, 0.01, 0.03), BRASS_D, {
      at: P(u, 0.052), dir: up, axis: "y", bone: tube,
    });
    for (const s of [1, -1])
      b.part(new THREE.SphereGeometry(0.007, 6, 4), BRASS, { at: F(u, s * 0.026), bone: finder });
  }

  // --- Yoke ---
  for (const s of [1, -1]) {
    b.rod([s * 0.075, 1.27, 0.0], [s * 0.075, c[1], c[2]], 0.014, { color: BRASS, bone: head, sides: 8 });
  }
  b.part(new THREE.BoxGeometry(0.17, 0.03, 0.07), BRASS, { at: [0, 1.27, 0], bone: head });
  b.rod([0, 1.215, 0], [0, 1.27, 0], 0.03, { color: BRASS_D, bone: head, sides: 10 });

  // --- Tripod ---
  b.part(new THREE.CylinderGeometry(0.085, 0.095, 0.09, 6), MAH, { at: [0, 1.17, 0], bone: base });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 6), BRASS, { at: [0, 1.225, 0], bone: base });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 6), BRASS, { at: [0, 1.115, 0], bone: base });
  const wood = grain(MAH, "#8c3b20", { size: 0.025, axis: "y" });
  const trayPts: [number, number, number][] = [];
  const k = 0.545;
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3;
    const sx = Math.sin(a), sz = Math.cos(a);
    const s0: [number, number, number] = [sx * 0.07, 1.2, sz * 0.07];
    const f: [number, number, number] = [sx * 0.62, 0.1, sz * 0.62];
    const L = (t: number): [number, number, number] => [
      s0[0] + (f[0] - s0[0]) * t, s0[1] + (f[1] - s0[1]) * t, s0[2] + (f[2] - s0[2]) * t,
    ];
    b.rod(s0, f, [0.032, 0.02], { color: wood, bone: base, section: { ngon: 4 } as any });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), BRASS, { at: s0, bone: base });
    for (const t of [0.3, 0.8]) {
      const r = 0.032 - 0.012 * t + 0.006;
      b.rod(L(t - 0.015), L(t + 0.015), r, { color: BRASS, bone: base, sides: 8 });
    }
    // brass foot cap
    b.rod([f[0], 0, f[2]], [f[0], 0.12, f[2]], [0.02, 0.026], { color: BRASS, bone: base, sides: 8 });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), BRASS_D, { at: [f[0], 0.005, f[2]], bone: base });
    // brass shoe bracket at tray
    const tp = L(k);
    trayPts.push(tp);
    b.part(new THREE.SphereGeometry(0.03, 8, 6), BRASS, { at: [tp[0], tp[1] - 0.012, tp[2]], bone: base });
  }
  // tray
  b.slab(trayPts, { color: MAH, thickness: 0.02, bone: base });
  for (let i = 0; i < 3; i++) {
    const p = trayPts[i], q = trayPts[(i + 1) % 3];
    b.rod([p[0], p[1] + 0.012, p[2]], [q[0], q[1] + 0.012, q[2]], 0.007, { color: BRASS, bone: base, sides: 6 });
  }
  // rolled star chart
  const cy = trayPts[0][1] + 0.012 + 0.032;
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.26, 10), PAPER, { at: [0, cy, -0.03], dir: [1, 0, 0], bone: base });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.004, 8), "#bfae82", {
      at: [s * 0.131, cy, -0.03], dir: [s, 0, 0], bone: base,
    });
    b.rod([s * 0.07 - 0.007, cy, -0.03], [s * 0.07 + 0.007, cy, -0.03], 0.0325, {
      color: RIBBON, bone: base, sides: 10,
    });
  }

  return b.root;
}
```