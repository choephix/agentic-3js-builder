import * as THREE from "three";
import { createBuilder, svg, paint, mottle, countershade, rng, mix } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured six-wheel convoy hauler guarding a sealed cargo pod, with neon trim and a roof turret.",
};

const NEON = "#19f0ff", MAG = "#ff2fa8", AMB = "#ffb02e", RED = "#ff3030";
const DARK = "#14161d", STEEL = "#4a5160", TYRE = "#1a1a1f", PLATE = "#2b3140";

const hazard = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e8b81c"/>
${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 10 - 6} 16 L${i * 10 + 2} 0 L${i * 10 + 8} 0 L${i * 10} 16Z" fill="#111"/>`).join("")}
<rect width="64" height="16" fill="none" stroke="#111" stroke-width="2"/></svg>`, { size: 256 });

const emblem = svg(`<svg viewBox="0 0 128 128"><rect x="4" y="4" width="120" height="120" rx="10" fill="#10131a" stroke="#19f0ff" stroke-width="4"/>
<circle cx="64" cy="52" r="26" fill="none" stroke="#ff2fa8" stroke-width="6"/>
<path d="M64 26 V78 M38 52 H90" stroke="#ff2fa8" stroke-width="6"/>
<circle cx="64" cy="52" r="8" fill="#ff2fa8"/>
<rect x="20" y="92" width="88" height="10" fill="#ffb02e"/>
<rect x="20" y="108" width="50" height="6" fill="#19f0ff"/></svg>`, { size: 256 });

const sealTex = svg(`<svg viewBox="0 0 128 48"><rect width="128" height="48" fill="#0d0f14"/>
<text x="64" y="30" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#ff3030">SEALED</text>
<rect x="4" y="38" width="120" height="4" fill="#ff3030"/><path d="M4 4H40M88 4H124" stroke="#19f0ff" stroke-width="3"/></svg>`, { size: 256 });

const unitTex = svg(`<svg viewBox="0 0 96 32"><rect width="96" height="32" fill="#e9e9e9"/>
<text x="48" y="24" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#111">CV-77</text></svg>`, { size: 192 });

const visorTex = svg(`<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#052a33"/>
<path d="M0 8H128M0 16H128M0 24H128" stroke="#19f0ff" stroke-width="1.5" opacity=".5"/>
<path d="M10 28 L40 6 L70 24 L100 4 L120 20" stroke="#19f0ff" stroke-width="3" fill="none"/></svg>`, { size: 256 });

const HULL = countershade(mottle("#3a4152", "#2c3140", { size: 0.5, seed: 3 }), "#1f2330", { level: -0.3 });
const PANEL = paint((p, n) => {
  const gx = Math.abs(((p.x * 2.2) % 1)) < 0.03 || Math.abs(((p.z * 1.7) % 1)) < 0.03;
  const base: [number, number, number] = n.y > 0.5 ? [0.27, 0.3, 0.38] : [0.2, 0.22, 0.29];
  return gx ? [0.08, 0.09, 0.12] : base;
});

export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });
  const bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cy = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);
  const B = (w: number, h: number, d: number, col: any, at: number[], bone: any = chassis, rot?: number[]) =>
    b.part(bx(w, h, d), col, { bone, at: at as any, rotation: rot as any });
  const plane = (w: number, h: number, tex: THREE.Texture, at: number[], dir: number[], bone: any = chassis, up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at: at as any, dir: dir as any, axis: "z", texture: tex, up: up as any });

  // ---- frame
  for (const s of [1, -1]) {
    B(0.22, 0.3, 7.0, DARK, [s * 0.75, 0.85, -0.1]);
    for (const z of [-3, -1.5, 0, 1.5, 3]) B(1.5, 0.12, 0.14, STEEL, [0, 0.85, z]);
  }
  B(1.4, 0.2, 5, DARK, [0, 0.7, -0.2]);

  // ---- hull side skirts with panel paint
  for (const s of [1, -1]) {
    b.part(bx(0.16, 0.6, 5.6), PANEL, { bone: chassis, at: [s * 1.27, 1.05, -0.6] });
    B(0.1, 0.06, 5.6, NEON, [s * 1.36, 0.8, -0.6]);
    glow(b.part(bx(0.04, 0.05, 5.4), NEON, { bone: chassis, at: [s * 1.4, 0.8, -0.6] }), 1.3);
    for (let i = 0; i < 6; i++) b.part(cy(0.04, 0.05, 6), STEEL, { bone: chassis, at: [s * 1.36, 1.2, -3 + i * 0.95], rotation: [0, 0, 90] });
  }

  // ---- wheels (3 axles)
  const axles = [2.3, -0.6, -2.4];
  for (const [i, z] of axles.entries())
    for (const s of [1, -1]) {
      const k = (s > 0 ? "L" : "R") + (i + 1);
      const hub: [number, number, number] = [s * 1.25, 0.55, z];
      const w = b.joint(`wheel${k}`, { parent: chassis, at: hub, dir: [0, 1, 0], role: "hinge" });
      const R: any = [0, 0, 90];
      b.part(cy(0.55, 0.5, 12), TYRE, { bone: w, at: hub, rotation: R, flat: true });
      for (let j = 0; j < 12; j++) {
        const a = (j / 12) * Math.PI * 2;
        b.part(bx(0.52, 0.1, 0.14), "#0c0c10", { bone: w, at: [hub[0], 0.55 + 0.56 * Math.cos(a), z + 0.56 * Math.sin(a)], rotation: [(a * 180) / Math.PI, 0, 0] });
      }
      b.part(cy(0.34, 0.52, 10), "#6a7080", { bone: w, at: hub, rotation: R, flat: true });
      b.part(cy(0.26, 0.1, 10), DARK, { bone: w, at: [hub[0] + s * 0.26, 0.55, z], rotation: R, flat: true });
      b.part(cy(0.1, 0.14, 6), AMB, { bone: w, at: [hub[0] + s * 0.32, 0.55, z], rotation: R });
      for (let j = 0; j < 6; j++) {
        const a = (j / 6) * Math.PI * 2;
        b.part(cy(0.03, 0.05, 6), "#c8ccd6", { bone: w, at: [hub[0] + s * 0.3, 0.55 + 0.19 * Math.cos(a), z + 0.19 * Math.sin(a)], rotation: R });
      }
      // axle + spring
      b.rod([s * 0.8, 0.7, z], [s * 1.2, 0.55, z], 0.07, DARK, { bone: chassis, sides: 6 });
      b.rod([s * 0.95, 0.72, z + 0.2], [s * 0.95, 1.05, z + 0.2], 0.05, AMB, { bone: chassis, sides: 6 });
      // fender
      B(0.1, 0.1, 1.5, PLATE, [s * 1.3, 1.25, z]);
      B(0.5, 0.07, 1.5, PLATE, [s * 1.1, 1.31, z]);
    }

  // ---- cab
  const cz = 2.7;
  b.part(bx(2.4, 0.9, 2.6), HULL, { bone: chassis, at: [0, 1.5, cz - 0.2] });
  b.frustumBox([0, 1.3, cz + 1.0], [0, 1.15, cz + 1.75], [2.4, 0.9], [2.2, 0.55], { bone: chassis, color: HULL });
  b.frustumBox([0, 2.05, cz - 0.3], [0, 2.3, cz - 0.3], [2.2, 1.6], [1.9, 1.3], { bone: chassis, color: HULL });
  // armoured windscreen slit, glowing
  B(1.7, 0.3, 0.1, DARK, [0, 2.1, cz + 0.55], chassis, [-18, 0, 0]);
  glow(plane(1.6, 0.25, visorTex, [0, 2.11, cz + 0.62], [0, 0.3, 1]), 0.9);
  for (const s of [1, -1]) {
    B(0.14, 0.5, 0.14, STEEL, [s * 0.92, 2.1, cz + 0.55], chassis, [-18, 0, 0]);
    B(0.1, 0.35, 0.9, DARK, [s * 1.17, 2.1, cz - 0.1]);
    glow(b.part(bx(0.04, 0.2, 0.7), NEON, { bone: chassis, at: [s * 1.2, 2.1, cz - 0.1] }), 1.1);
    B(0.12, 0.7, 1.3, PLATE, [s * 1.22, 1.5, cz - 0.1]);
    plane(0.9, 0.3, unitTex, [s * 1.29, 1.55, cz - 0.1], [s, 0, 0]);
    for (const dz of [-0.55, 0.35]) b.part(cy(0.03, 0.04, 6), "#9aa", { bone: chassis, at: [s * 1.29, 1.3, cz + dz], rotation: [0, 0, 90] });
    // mirror arm
    b.rod([s * 1.2, 2.0, cz + 0.6], [s * 1.55, 2.1, cz + 0.7], 0.03, STEEL, { bone: chassis, sides: 5 });
    B(0.06, 0.3, 0.2, DARK, [s * 1.58, 2.1, cz + 0.7]);
    // headlights
    glow(b.part(bx(0.5, 0.14, 0.06), "#fffbd8", { bone: chassis, at: [s * 0.8, 1.2, cz + 1.8] }), 1.6);
    B(0.56, 0.05, 0.12, DARK, [s * 0.8, 1.31, cz + 1.78]);
    // roof vents
    for (let i = 0; i < 4; i++) B(0.5, 0.03, 0.05, DARK, [s * 0.6, 2.62, cz - 0.7 + i * 0.12]);
    // exhaust stacks behind cab
    b.rod([s * 1.1, 1.4, cz - 1.5], [s * 1.1, 3.1, cz - 1.5], 0.08, STEEL, { bone: chassis, sides: 8 });
    b.part(cy(0.11, 0.3, 8), DARK, { bone: chassis, at: [s * 1.1, 2.3, cz - 1.5] });
    b.part(cy(0.09, 0.06, 8), AMB, { bone: chassis, at: [s * 1.1, 3.12, cz - 1.5] });
  }
  // bumper ram with hazard stripes
  B(2.7, 0.5, 0.35, PLATE, [0, 0.85, cz + 2.0]);
  plane(2.6, 0.28, hazard, [0, 0.85, cz + 2.19], [0, 0, 1]);
  for (let i = -2; i <= 2; i++) b.spike([i * 0.5, 0.6, cz + 2.15], [0, -0.3, 1], 0.3, 0.07, STEEL, { bone: chassis, sides: 4 });
  // grille
  B(1.2, 0.5, 0.06, DARK, [0, 1.35, cz + 1.8]);
  for (let i = 0; i < 5; i++) glow(b.part(bx(1.1, 0.03, 0.03), MAG, { bone: chassis, at: [0, 1.17 + i * 0.09, cz + 1.84] }), 1);
  // light bar
  B(1.6, 0.1, 0.16, DARK, [0, 2.72, cz + 0.1]);
  for (const x of [-0.6, -0.2, 0.2, 0.6]) glow(b.part(bx(0.28, 0.07, 0.04), x < 0 ? RED : NEON, { bone: chassis, at: [x, 2.73, cz + 0.2] }), 1.5);

  // ---- roof turret
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 2.8, cz - 0.8], dir: [1, 0, 0], up: [0, 0, 1], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 3.05, cz - 0.8], dir: [0, 0, 1], role: "hinge" });
  b.part(cy(0.4, 0.12, 12), STEEL, { bone: yaw, at: [0, 2.82, cz - 0.8], flat: true });
  b.part(cy(0.3, 0.2, 8), PLATE, { bone: yaw, at: [0, 2.98, cz - 0.8], flat: true });
  for (const s of [1, -1]) B(0.08, 0.3, 0.4, PLATE, [s * 0.24, 3.1, cz - 0.8], yaw);
  B(0.3, 0.26, 0.5, HULL as any, [0, 3.07, cz - 0.7], pitch);
  for (const s of [1, -1]) {
    b.rod([s * 0.08, 3.07, cz - 0.5], [s * 0.08, 3.07, cz + 0.7], 0.04, DARK, { bone: pitch, sides: 8 });
    b.part(cy(0.06, 0.2, 8), STEEL, { bone: pitch, at: [s * 0.08, 3.07, cz + 0.65], rotation: [90, 0, 0] });
  }
  glow(b.part(bx(0.08, 0.06, 0.03), RED, { bone: pitch, at: [0, 3.15, cz - 0.44] }), 1.6);
  b.rod([-0.5, 2.7, cz - 1.6], [-0.6, 3.9, cz - 1.7], 0.015, STEEL, { bone: chassis, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), MAG, { bone: chassis, at: [-0.6, 3.92, cz - 1.7] }), 2);

  // ---- cargo pod
  const pz = -1.2, py = 2.35;
  // cradle
  B(2.5, 0.2, 5.0, PLATE, [0, 1.3, pz]);
  for (const z of [-3.0, -1.2, 0.6]) {
    B(2.6, 0.25, 0.3, DARK, [0, 1.45, z]);
    for (const s of [1, -1]) B(0.14, 0.9, 0.3, STEEL, [s * 1.2, 1.9, z]);
  }
  // pod body (boxy chamfered)
  b.part(bx(2.2, 1.9, 4.6), HULL, { bone: chassis, at: [0, py, pz] });
  for (const sx of [1, -1]) for (const sy of [1, -1]) b.part(bx(0.45, 0.45, 4.6), HULL, { bone: chassis, at: [sx * 1.0, py + sy * 0.88, pz], rotation: [0, 0, 45] });
  b.part(bx(1.5, 0.3, 4.4), "#262b38", { bone: chassis, at: [0, py + 1.08, pz] });
  // end caps
  for (const e of [1, -1]) {
    b.frustumBox([0, py, pz + e * 2.3], [0, py, pz + e * 2.65], [2.1, 1.8], [1.5, 1.2], { bone: chassis, color: PLATE });
  }
  // glowing seams and ribs
  for (let i = 0; i < 6; i++) {
    const z = pz - 1.9 + i * 0.76;
    B(2.28, 1.98, 0.1, STEEL, [0, py, z]);
    for (const s of [1, -1]) glow(b.part(bx(0.03, 1.4, 0.05), NEON, { bone: chassis, at: [s * 1.12, py, z] }), 1.2);
    for (const s of [1, -1]) b.part(cy(0.03, 0.05, 6), "#cdd", { bone: chassis, at: [s * 1.16, py + 0.9, z], rotation: [0, 0, 90] });
  }
  glow(b.part(bx(0.06, 0.06, 4.3), MAG, { bone: chassis, at: [0, py + 1.2, pz] }), 1.4);
  // decals
  for (const s of [1, -1]) {
    plane(1.2, 1.2, emblem, [s * 1.115, py + 0.1, pz + 0.4], [s, 0, 0]);
    plane(1.6, 0.6, sealTex, [s * 1.115, py - 0.55, pz - 0.7], [s, 0, 0]);
    plane(1.6, 0.4, hazard, [s * 1.115, py + 0.65, pz - 0.9], [s, 0, 0]);
  }
  // rear hatch with locks
  plane(1.7, 0.6, sealTex, [0, py + 0.1, pz - 2.68], [0, 0, -1]);
  for (const s of [1, -1]) {
    B(0.3, 0.3, 0.2, DARK, [s * 0.7, py - 0.5, pz - 2.72]);
    glow(b.part(bx(0.12, 0.12, 0.04), RED, { bone: chassis, at: [s * 0.7, py - 0.5, pz - 2.84] }), 1.8);
    for (const y of [-0.55, 0.65]) B(0.2, 0.2, 0.2, STEEL, [s * 0.95, py + y, pz - 2.7]);
    glow(b.part(bx(0.1, 0.1, 0.04), AMB, { bone: chassis, at: [s * 0.95, py + 0.65, pz - 2.82] }), 1.6);
  }
  for (const s of [1, -1]) {
    glow(b.part(bx(0.35, 0.1, 0.04), RED, { bone: chassis, at: [s * 0.85, 1.25, pz - 2.55] }), 1.6);
  }
  // cable runs + pod antenna & roof sensors
  const r = rng(5);
  for (let i = 0; i < 6; i++) b.part(cy(0.05 + r() * 0.04, 0.2 + r() * 0.2, 6), i % 2 ? DARK : STEEL, { bone: chassis, at: [-0.7 + r() * 1.4, py + 1.3, pz - 1.8 + r() * 3.6] });
  b.sweep([[ -0.5, py + 1.15, pz + 1.2 ], [ -0.5, py + 1.5, pz + 0.4 ], [ -0.3, py + 1.3, pz - 0.6 ]], 0.025, { bone: chassis, color: DARK, sides: 6 });
  b.part(new THREE.SphereGeometry(0.28, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#2a4a56", { bone: chassis, at: [0.5, py + 1.2, pz + 1.4], flat: true });
  glow(b.part(cy(0.08, 0.04, 8), NEON, { bone: chassis, at: [0.5, py + 1.35, pz + 1.55], rotation: [60, 0, 0] }), 1.5);
  // under-glow
  glow(b.part(bx(2.0, 0.04, 5.5), MAG, { bone: chassis, at: [0, 0.62, -0.3] }), 1.1);
  // rear bumper
  B(2.6, 0.4, 0.3, PLATE, [0, 0.9, pz - 2.9 + 0.1]);
  plane(2.4, 0.26, hazard, [0, 0.9, pz - 3.06], [0, 0, -1]);
  plane(0.9, 0.3, unitTex, [0.7, 1.3, pz - 2.58], [0, 0, -1]);

  return b.root;
}
