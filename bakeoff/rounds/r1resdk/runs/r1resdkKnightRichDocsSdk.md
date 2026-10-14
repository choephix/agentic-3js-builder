```ts
import * as THREE from "three";
import { createBuilder, limb, paint, mottle, grain, noise, svg, catmull, polyline, rng } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Battle-worn Knight",
  description:
    "Fantasy knight in dented plate: great helm with crimson plume, filigreed layered pauldrons, blue griffin surcoat, kite shield, broadsword and a torn crimson cape.",
};

const GOLD = "#d9aa3a";
const CRIM = "#b0122e";
const CRIM_D = "#860e22";
const LEATHER = "#4a2e1c";
const MAIL = "#555b66";
const DARK = "#14161b";
const BLADE = "#cfd6e0";

const griffinSvg = `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
<g fill="#d8dde6" stroke="#6f7788" stroke-width="2.4" stroke-linejoin="round">
<path d="M40 58 C22 50 12 30 6 10 C18 22 24 20 28 14 C30 28 36 34 42 38 Z"/>
<path d="M60 58 C78 50 88 30 94 10 C82 22 76 20 72 14 C70 28 64 34 58 38 Z"/>
<path d="M50 96 C60 108 70 102 78 114 C60 114 52 110 44 98 Z"/>
<ellipse cx="50" cy="70" rx="18" ry="25"/>
<path d="M38 90 L28 108 L37 111 L45 95 Z"/>
<path d="M62 90 L72 108 L63 111 L55 95 Z"/>
<path d="M42 30 L38 12 L49 26 Z"/>
<path d="M58 30 L62 12 L51 26 Z"/>
<circle cx="50" cy="37" r="12"/>
</g>
<path d="M58 35 L77 42 L58 47 Z" fill="#e0b040" stroke="#8a6a1c" stroke-width="2"/>
<circle cx="53" cy="34" r="2.6" fill="#14161b"/>
<path d="M36 62 C42 70 42 78 38 84 M64 62 C58 70 58 78 62 84" stroke="#6f7788" stroke-width="2.4" fill="none"/>
</svg>`;

const filigreeSvg = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
<g fill="none" stroke="#e8c050" stroke-width="3" stroke-linecap="round">
<circle cx="32" cy="32" r="27"/>
<path d="M32 7 C18 20 46 26 32 38 C22 48 42 54 32 59"/>
<path d="M7 32 C20 22 24 42 32 32 C40 22 44 42 57 32"/>
<circle cx="32" cy="32" r="8"/>
</g>
<g fill="#e8c050"><circle cx="14" cy="14" r="3"/><circle cx="50" cy="14" r="3"/><circle cx="14" cy="50" r="3"/><circle cx="50" cy="50" r="3"/></g>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "knight" });
  const griffin = svg(griffinSvg, { size: 256 });
  const filigree = svg(filigreeSvg, { size: 192 });

  // Worn steel: mottled base with dents, scratches and rust patches.
  const steelBase = mottle("#9aa3b0", "#7e8794", { size: 0.12, contrast: 0.4 });
  const steel = paint((p) => {
    const sc = p.x * 5 + p.y * 11 + p.z * 3;
    const f = sc - Math.floor(sc);
    if (f < 0.025 && noise(p, 0.25, 9) > 0.5) return "#d3dae3";
    if (noise(p, 0.05, 3) > 0.78) return "#5f6773";
    if (noise(p, 0.07, 11) > 0.83) return "#7a5a46";
    return steelBase;
  });
  const blueBase = mottle("#17327f", "#122a6c", { size: 0.12, contrast: 0.5 });
  const blue = paint((p) => (noise(p, 0.03, 4) > 0.82 ? "#2b4a9a" : blueBase));
  const shieldBlue = paint((p) => {
    const sc = p.x * 7 - p.y * 9;
    const f = sc - Math.floor(sc);
    if (f < 0.02 && noise(p, 0.2, 5) > 0.5) return "#6b82c8";
    return blue;
  });
  const cape = grain(CRIM, CRIM_D, { size: 0.035, axis: "y", seed: 4 });
  const plumeP = grain("#c4122f", "#8a0c22", { size: 0.012, axis: "y", seed: 2 });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.95, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    [[0, 0.95, 0], [0, 1.12, 0], [0, 1.3, 0], [0, 1.5, 0]],
    { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] },
  );
  const mid = spine.joints[1];
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.5, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.54, 0], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.56, 0.02], aim: [0, 1.56, 0.15], role: "jaw" });

  // ---------- torso ----------
  b.frustumBox([0, 1.12, 0], [0, 0.86, 0], [0.34, 0.25], [0.37, 0.27], { bone: hips, color: steel });
  b.frustumBox([0, 1.0, 0], [0, 1.5, 0], [0.37, 0.25], [0.47, 0.3], { bone: mid, color: steel });
  b.capsule([0, 1.43, 0], [0, 1.56, 0], 0.065, { bone: neck, color: MAIL });
  b.lathe([[0, 0], [0.15, 0], [0.155, 0.02], [0.1, 0.1], [0, 0.1]], {
    at: [0, 1.43, 0], bone: chest, color: steel, segments: 10,
  });
  // surcoat
  b.frustumBox([0, 1.47, 0.155], [0, 1.0, 0.155], [0.34, 0.02], [0.32, 0.02], { bone: mid, color: blue });
  b.frustumBox([0, 1.0, 0.155], [0, 0.5, 0.16], [0.32, 0.025], [0.36, 0.025], { bone: hips, color: blue });
  b.part(new THREE.BoxGeometry(0.37, 0.025, 0.035), GOLD, { bone: hips, at: [0, 0.5, 0.165] });
  for (const s of [1, -1]) {
    b.rod([s * 0.168, 1.47, 0.168], [s * 0.16, 1.0, 0.168], 0.006, { bone: mid, color: GOLD, caps: { start: "flat", end: "flat" } });
    b.rod([s * 0.16, 1.0, 0.168], [s * 0.18, 0.5, 0.172], 0.006, { bone: hips, color: GOLD, caps: { start: "flat", end: "flat" } });
  }
  b.part(new THREE.PlaneGeometry(0.22, 0.26), "#ffffff", {
    texture: griffin, bone: mid, at: [0, 1.22, 0.168], dir: [0, 0, 1], axis: "z",
  });
  // belt
  b.part(new THREE.BoxGeometry(0.4, 0.05, 0.03), LEATHER, { bone: mid, at: [0, 1.02, 0.175] });
  b.part(new THREE.BoxGeometry(0.06, 0.06, 0.02), GOLD, { bone: mid, at: [0, 1.02, 0.195] });

  // ---------- helm ----------
  const helm = b.lathe(
    [[0, 0], [0.11, 0], [0.125, 0.03], [0.13, 0.12], [0.125, 0.22], [0.1, 0.27], [0, 0.28]],
    { at: [0, 1.53, 0], bone: head, color: steel, segments: 12 },
  );
  const slitHit = b.surface(helm).ray([0, 1.68, 0.6], [0, 0, -1]);
  if (slitHit) {
    b.stick(new THREE.BoxGeometry(0.15, 0.03, 0.014), DARK, slitHit, { embed: 0.5, bone: head });
    b.stick(new THREE.BoxGeometry(0.024, 0.02, 0.3), GOLD, slitHit.moved([0, 0.002, 0]), { embed: 0.3, bone: head });
  }
  for (const s of [1, -1])
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 2; c++) {
        const h = b.surface(helm).ray([s * (0.045 + 0.03 * c), 1.58 + 0.028 * r, 0.6], [0, 0, -1]);
        if (h) b.stick(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 5), DARK, h, { embed: 0.4, bone: head });
      }
  b.part(new THREE.TorusGeometry(0.13, 0.008, 5, 12), GOLD, { bone: head, at: [0, 1.57, 0], dir: [0, 1, 0], axis: "z" });
  b.part(new THREE.TorusGeometry(0.118, 0.008, 5, 12), GOLD, { bone: head, at: [0, 1.77, 0], dir: [0, 1, 0], axis: "z" });
  // chin guard on the jaw
  b.frustumBox([0, 1.5, 0.06], [0, 1.58, 0.06], [0.2, 0.2], [0.24, 0.22], { bone: jaw, color: steel });
  b.part(new THREE.BoxGeometry(0.25, 0.012, 0.23), GOLD, { bone: jaw, at: [0, 1.5, 0.06] });
  // plume
  b.part(new THREE.BoxGeometry(0.035, 0.035, 0.22), GOLD, { bone: head, at: [0, 1.815, -0.02] });
  const plumeOutline: OutlinePoint[] = [
    [0.12, 0], [0.14, 0.1], [0.09, 0.22], [-0.03, 0.28], [-0.15, 0.23], [-0.25, 0.1],
    [-0.31, -0.08], [-0.36, -0.28, "sharp"], [-0.27, -0.27], [-0.21, -0.12], [-0.12, -0.02], [-0.05, -0.01],
  ];
  b.extrude(plumeOutline, {
    at: [0, 1.83, 0.01], thickness: [0.03, 0.07], bevel: 0.008, smoothing: 1, color: plumeP, bone: head,
  });

  // ---------- arms ----------
  const arms: Record<string, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      [[s * 0.28, 1.46, 0], [s * 0.4, 1.18, 0], [s * 0.5, 0.92, 0.04]],
      { parent: chest, role: "arm", names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`] },
    );
    arms[side] = arm;
    const te = arm.ts[1] ?? 0.5;
    const rad = (t: number) => 0.062 - 0.022 * t;
    b.sweep(arm, rad, { from: 0, to: te, color: MAIL });
    b.sweep(arm, rad, { from: te, to: 1, color: steel });
    b.part(new THREE.SphereGeometry(0.068, 8, 6), steel, { bone: arm.joints[1], at: arm.joints[1].at, flat: true });
    b.part(new THREE.TorusGeometry(0.058, 0.007, 5, 10), GOLD, {
      bone: arm.joints[1], at: arm.joints[1].at, dir: [s * 0.25, -1, 0.05], axis: "z",
    });
    const hand = arm.tip!;
    b.part(new THREE.BoxGeometry(0.08, 0.1, 0.1), "#3c424c", { bone: hand, at: [s * 0.5, 0.88, 0.05], flat: true });
    b.part(new THREE.TorusGeometry(0.045, 0.007, 5, 10), GOLD, {
      bone: arm.joints[1], at: [s * 0.485, 0.97, 0.03], dir: [s * 0.25, -1, 0.05], axis: "z",
    });

    // layered pauldrons
    const tilt: [number, number, number] = [s * 0.5, 1, 0];
    for (let i = 0; i < 3; i++) {
      const r = 0.105 + 0.02 * i;
      const g = new THREE.SphereGeometry(r, 9, 6);
      g.scale(1, 0.55, 1.1);
      const c: [number, number, number] = [s * (0.28 + 0.025 * i), 1.56 - 0.06 * i, 0];
      const plate = b.part(g, steel, { bone: arm.joints[0], at: c, dir: tilt, flat: true });
      b.part(new THREE.TorusGeometry(r * 1.04, 0.007, 5, 14), GOLD, {
        bone: arm.joints[0], at: c, dir: tilt, axis: "z",
      });
      if (i < 2) {
        const hit = b.surface(plate).ray([c[0], c[1] + 0.4, c[2]], [0, -1, 0]);
        if (hit)
          b.decal(plate, filigree, { at: hit, size: [0.15, 0.15], up: [0, 0, 1], bone: arm.joints[0] });
      }
    }
    // cape clasp
    b.part(new THREE.SphereGeometry(0.025, 6, 5), GOLD, { bone: chest, at: [s * 0.15, 1.47, 0.1] });

    // ---------- legs ----------
    const pts = limb([s * 0.1, 0.92, 0], [s * 0.12, 0.07, 0.03], [0.46, 0.42], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips, role: "leg",
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      contact: [s * 0.12, 0, 0.05],
    });
    b.sweep(leg, (t) => 0.09 - 0.03 * t, { color: steel });
    b.part(new THREE.SphereGeometry(0.08, 8, 6), steel, { bone: leg.joints[1], at: leg.joints[1].at, flat: true });
    b.part(new THREE.TorusGeometry(0.07, 0.008, 5, 10), GOLD, {
      bone: leg.joints[1], at: leg.joints[1].at, dir: [0, -1, 0.1], axis: "z",
    });
    b.part(new THREE.BoxGeometry(0.11, 0.09, 0.26), steel, { bone: leg.tip!, at: [s * 0.12, 0.045, 0.07], flat: true });
    b.part(new THREE.SphereGeometry(0.055, 6, 4), steel, { bone: leg.tip!, at: [s * 0.12, 0.045, 0.2], flat: true });
  }

  // ---------- shield (left arm) ----------
  const kite = (k: number): OutlinePoint[] => [
    [-0.25 * k, 0.42 * k], [0.25 * k, 0.42 * k], [0.27 * k, 0.3 * k], [0.22 * k, 0],
    [0.12 * k, -0.3 * k], [0, -0.55 * k, "sharp"], [-0.12 * k, -0.3 * k], [-0.22 * k, 0], [-0.27 * k, 0.3 * k],
  ];
  const forearmL = arms["L"].joints[1];
  b.extrude(kite(1.07), {
    at: [0.52, 0.95, 0.118], x: [1, 0, 0], thickness: 0.034, bevel: 0.004, smoothing: 1, color: GOLD, bone: forearmL,
  });
  b.extrude(kite(1), {
    at: [0.52, 0.95, 0.12], x: [1, 0, 0], thickness: 0.04, bevel: 0.006, smoothing: 1, color: shieldBlue, bone: forearmL,
  });
  b.part(new THREE.PlaneGeometry(0.34, 0.4), "#ffffff", {
    texture: griffin, bone: forearmL, at: [0.52, 1.06, 0.144], dir: [0, 0, 1], axis: "z",
  });
  b.rod([0.47, 0.98, 0.05], [0.52, 0.98, 0.1], 0.014, { bone: forearmL, color: LEATHER });

  // ---------- sword (right hand) ----------
  const handR = arms["R"].tip!;
  const D = new THREE.Vector3(-0.05, 0.5, 0.86).normalize();
  const H = new THREE.Vector3(-0.5, 0.9, 0.05);
  const P = (t: number) => H.clone().addScaledVector(D, t);
  b.rod(P(-0.07), P(0.1), 0.016, { bone: handR, color: LEATHER });
  b.part(new THREE.SphereGeometry(0.026, 6, 5), GOLD, { bone: handR, at: P(-0.09) });
  b.part(new THREE.BoxGeometry(0.22, 0.025, 0.03), GOLD, { bone: handR, at: P(0.11), dir: D });
  b.frustumBox(P(0.12), P(0.85), [0.05, 0.012], [0.044, 0.01], { bone: handR, color: BLADE });
  b.frustumBox(P(0.85), P(0.97), [0.044, 0.01], [0.004, 0.004], { bone: handR, color: BLADE });
  b.frustumBox(P(0.14), P(0.7), [0.012, 0.0135], [0.01, 0.0115], { bone: handR, color: "#9aa4b3" });

  // ---------- torn cape ----------
  const edgeA = catmull([
    [0.3, 1.49, -0.1], [0.15, 1.53, -0.17], [0, 1.54, -0.19], [-0.15, 1.53, -0.17], [-0.3, 1.49, -0.1],
  ]);
  const rr = rng(5);
  const bpts: number[][] = [];
  const N = 16;
  for (let i = 0; i <= N; i++) {
    const x = 0.42 - (0.84 * i) / N;
    const y = i % 2 === 0 ? 0.42 + rr() * 0.07 : 0.6 + rr() * 0.12;
    const z = -0.33 + 0.04 * Math.sin(i * 0.9);
    bpts.push([x, y, z]);
  }
  b.membrane(edgeA, polyline(bpts), { color: cape, thickness: 0.012, rows: 6, cols: 28, bone: chest });

  return b.root;
}
```