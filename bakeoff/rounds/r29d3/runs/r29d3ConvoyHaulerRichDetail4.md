```ts
import * as THREE from "three";
import { createBuilder, catmull, mix, noise, paint, rng, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Convoy Hauler Aegis-7",
  description:
    "Low-poly cyberpunk six-wheel armoured convoy hauler with a neon-sealed cargo pod, roof turret, light bar, skirts and underglow.",
};

const NEON = "#19f3ff";
const MAG = "#ff2fa8";
const AMBER = "#ffb02e";
const DARK = "#17181f";
const STEEL = "#4b505c";
const TYRE = "#16161a";

const ARMOUR = paint((p, n) => {
  const base: [number, number, number] = [0.2, 0.23, 0.29];
  const grime = noise(p, 0.5, 3);
  const c = mix(base, [0.08, 0.09, 0.12], smoothstep(0.45, 0.8, grime) * 0.8);
  const lit = mix(c, [0.38, 0.44, 0.52], smoothstep(0.5, 1, n.y) * 0.5);
  const low = smoothstep(1.4, 0.9, p.y);
  return mix(lit, [0.12, 0.09, 0.07], low * 0.6);
});
const POD = paint((p, n) => {
  const base: [number, number, number] = [0.86, 0.87, 0.9];
  const g = noise(p, 0.35, 8);
  const c = mix(base, [0.55, 0.58, 0.64], smoothstep(0.5, 0.85, g) * 0.7);
  return mix(c, [0.4, 0.42, 0.5], smoothstep(0.2, -0.8, n.y) * 0.6);
});

const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#ffc21a"/>${[0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => `<path d="M${i * 10 - 6} 16 L${i * 10} 0 L${i * 10 + 5} 0 L${i * 10 - 1} 16Z" fill="#14141a"/>`)
    .join("")}<rect width="64" height="16" fill="none" stroke="#14141a" stroke-width="2"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 70"><rect width="100" height="70" rx="6" fill="#0d1018" stroke="#19f3ff" stroke-width="3"/>
  <circle cx="30" cy="35" r="20" fill="none" stroke="#ff2fa8" stroke-width="4"/><path d="M30 18 L42 40 L18 40Z" fill="#ffc21a"/>
  <rect x="58" y="18" width="30" height="5" fill="#19f3ff"/><rect x="58" y="30" width="22" height="5" fill="#19f3ff"/><rect x="58" y="42" width="30" height="5" fill="#ff2fa8"/>
  <text x="58" y="62" font-family="monospace" font-size="9" fill="#ffffff">SEALED</text></svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg viewBox="0 0 64 24"><rect width="64" height="24" rx="3" fill="#0d1018" stroke="#ffb02e" stroke-width="2"/>
  <text x="32" y="17" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#ffb02e">AG-07</text></svg>`,
  { size: 128 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#06161c"/><path d="M2 24 L12 18 L20 22 L30 8 L40 16 L50 6 L62 12" stroke="#19f3ff" stroke-width="2" fill="none"/>
  <rect x="4" y="4" width="14" height="3" fill="#ff2fa8"/><rect x="4" y="9" width="8" height="3" fill="#19f3ff"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const R = rng(5);
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });

  const bx = (w: number, h: number, d: number, col: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: chassis, at, ...o });
  const cy = (r: number, h: number, sides: number, col: any, at: number[], rot: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), col, { bone: chassis, at, rotation: rot, flat: true, ...o });
  const lamp = (w: number, h: number, d: number, col: string, at: number[], s = 1.3) =>
    glow(bx(w, h, d, col, at), s);

  // ---------- chassis
  for (const s of [1, -1]) {
    bx(0.22, 0.28, 7.6, DARK, [s * 0.75, 0.95, 0]);
    bx(0.5, 0.1, 6.8, STEEL, [s * 1.3, 0.85, -0.1]); // running board
    for (let i = 0; i < 6; i++) bx(0.06, 0.1, 0.5, AMBER, [s * 1.56, 0.85, -2.8 + i * 1.1], { rotation: [0, 0, 0] });
  }
  for (const z of [-3.4, -1.8, -0.3, 1.2, 2.4]) bx(1.6, 0.14, 0.2, DARK, [0, 0.95, z]);
  bx(1.4, 0.14, 7, STEEL, [0, 1.25, -0.1]); // deck plate
  b.rod([0, 0.8, 3], [0, 0.8, -2.4], 0.07, STEEL, { bone: chassis, sides: 6 }); // driveshaft

  // ---------- wheels
  const axles = [3.0, -0.4, -2.2];
  axles.forEach((z, ai) => {
    b.rod([-1.15, 0.5, z], [1.15, 0.5, z], 0.09, DARK, { bone: chassis, sides: 6 });
    for (const s of [1, -1]) {
      const tag = `${s > 0 ? "L" : "R"}${ai}`;
      const hub = [s * 1.2, 0.5, z];
      const w = b.joint(`wheel${tag}`, { parent: chassis, at: hub, dir: [s, 0, 0], role: "hinge" });
      const P = (g: THREE.BufferGeometry, c: any, at: number[], rot = [0, 0, 90]) =>
        b.part(g, c, { bone: w, at, rotation: rot, flat: true });
      P(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 14), TYRE, hub);
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        b.part(new THREE.BoxGeometry(0.52, 0.08, 0.16), "#0c0c0f", {
          bone: w,
          at: [hub[0], hub[1] + 0.5 * Math.cos(a), hub[2] + 0.5 * Math.sin(a)],
          rotation: [(a * 180) / Math.PI, 0, 0],
        });
      }
      P(new THREE.CylinderGeometry(0.32, 0.32, 0.52, 10), STEEL, hub);
      P(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 10), DARK, [hub[0] + s * 0.26, hub[1], hub[2]]);
      glow(b.part(new THREE.TorusGeometry(0.24, 0.025, 4, 12), NEON, { bone: w, at: [hub[0] + s * 0.3, hub[1], hub[2]], rotation: [0, 90, 0] }), 1.4);
      P(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 6), AMBER, [hub[0] + s * 0.32, hub[1], hub[2]]);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.06, 6), "#c9ced8", {
          bone: w,
          at: [hub[0] + s * 0.3, hub[1] + 0.17 * Math.cos(a), hub[2] + 0.17 * Math.sin(a)],
          rotation: [0, 0, 90],
        });
      }
    }
    // fenders
    for (const s of [1, -1]) {
      bx(0.7, 0.1, 1.3, ARMOUR, [s * 1.2, 1.12, z]);
      bx(0.08, 0.3, 1.3, ARMOUR, [s * 1.52, 1.0, z]);
      lamp(0.04, 0.04, 1.1, MAG, [s * 1.57, 0.92, z], 1.2);
    }
  });

  // ---------- cab
  bx(2.5, 0.9, 1.9, ARMOUR, [0, 1.75, 2.2]); // lower
  b.frustumBox([0, 1.5, 3.1], [0, 1.45, 4.0], [2.5, 0.9], [2.3, 0.6], { bone: chassis, color: ARMOUR }); // nose
  bx(2.3, 0.7, 1.2, ARMOUR, [0, 2.5, 1.9]); // upper
  b.part(new THREE.BoxGeometry(2.1, 0.12, 1.3), STEEL, { bone: chassis, at: [0, 2.9, 2.0], rotation: [0, 0, 0] });
  glow(b.part(new THREE.BoxGeometry(2.0, 0.34, 0.05), NEON, { bone: chassis, at: [0, 2.58, 2.55], rotation: [-35, 0, 0] }), 0.8); // visor
  for (const s of [1, -1]) {
    bx(0.05, 0.3, 0.8, NEON, [s * 1.17, 2.55, 1.9], { });
    glow(chassisLast());
    bx(0.12, 0.7, 0.9, STEEL, [s * 1.2, 1.8, 3.15], { rotation: [0, s * 20, 0] }); // wedge plates
    bx(0.1, 0.1, 1.4, AMBER, [s * 1.29, 1.45, 2.2]);
    cy(0.1, 0.5, 6, STEEL, [s * 1.0, 3.2, 1.35], [0, 0, 0]); // exhaust stacks
    cy(0.13, 0.06, 8, DARK, [s * 1.0, 3.46, 1.35], [0, 0, 0]);
    // headlights
    glow(bx(0.5, 0.16, 0.06, "#fff6c8", [s * 0.8, 1.75, 4.02]), 1.5);
    bx(0.6, 0.22, 0.04, DARK, [s * 0.8, 1.75, 3.99]);
    // mirrors
    b.rod([s * 1.25, 2.6, 2.7], [s * 1.7, 2.7, 2.8], 0.03, STEEL, { bone: chassis, sides: 5 });
    bx(0.08, 0.38, 0.26, DARK, [s * 1.72, 2.7, 2.8]);
    glow(chassisLast(0.02, 0.28, 0.2, NEON, [s * 1.77, 2.7, 2.8]), 1);
  }
  // grille & bumper
  bx(1.4, 0.5, 0.06, DARK, [0, 1.45, 4.05]);
  for (let i = 0; i < 5; i++) bx(1.3, 0.04, 0.05, NEON, [0, 1.3 + i * 0.1, 4.08]);
  bx(2.7, 0.4, 0.4, STEEL, [0, 0.95, 4.0]);
  for (let i = 0; i < 7; i++)
    b.spike([-1.2 + i * 0.4, 0.95, 4.2], [0, 0, 1], 0.28, 0.07, "#8b909c", { bone: chassis, sides: 4 });
  b.part(new THREE.PlaneGeometry(0.7, 0.26), "#ffffff", { bone: chassis, at: [0, 1.15, 4.22], dir: [0, 0, 1], axis: "z", texture: PLATE });
  b.part(new THREE.PlaneGeometry(2.2, 0.3), "#ffffff", { bone: chassis, at: [0, 1.28, 4.215], dir: [0, 0, 1], axis: "z", texture: HAZARD });
  // roof light bar
  bx(1.8, 0.12, 0.2, DARK, [0, 3.02, 2.55]);
  [-0.7, -0.35, 0, 0.35, 0.7].forEach((x, i) => glow(bx(0.28, 0.1, 0.06, i % 2 ? MAG : AMBER, [x, 3.04, 2.67]), 1.6));
  // antenna & dish
  b.spike([-0.9, 3.0, 1.4], [0, 1, 0], 1.3, 0.025, "#9aa0ac", { bone: chassis, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.05, 5, 4), MAG, { bone: chassis, at: [-0.9, 4.3, 1.4] }), 2);
  // dashboard screen visible
  b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", { bone: chassis, at: [0.5, 2.2, 3.04], dir: [0, 0, 1], axis: "z", texture: SCREEN });

  // ---------- turret
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 3.1, 2.0], dir: [0, 1, 0], up: [1, 0, 0], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 3.4, 2.1], dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.CylinderGeometry(0.42, 0.5, 0.2, 10), STEEL, { bone: yaw, at: [0, 3.18, 2.0], flat: true });
  b.part(new THREE.BoxGeometry(0.7, 0.35, 0.8), ARMOUR, { bone: yaw, at: [0, 3.4, 2.0] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.14, 0.34, 0.5), DARK, { bone: yaw, at: [s * 0.42, 3.42, 2.05] });
    b.rod([s * 0.1, 3.4, 2.4], [s * 0.1, 3.4, 3.7], 0.045, STEEL, { bone: pitch, sides: 8 });
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.16, 8), DARK, { bone: pitch, at: [s * 0.1, 3.4, 3.7], rotation: [90, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 8), STEEL, { bone: pitch, at: [s * 0.1, 3.4, 2.9], rotation: [90, 0, 0] });
    glow(b.part(new THREE.SphereGeometry(0.03, 4, 3), MAG, { bone: pitch, at: [s * 0.1, 3.4, 3.78] }), 2);
  }
  b.part(new THREE.BoxGeometry(0.3, 0.2, 0.4), DARK, { bone: pitch, at: [0, 3.4, 2.55] });
  glow(b.part(new THREE.BoxGeometry(0.2, 0.06, 0.04), NEON, { bone: pitch, at: [0, 3.42, 2.77] }), 1.5);

  // ---------- cargo pod
  const PZ = -1.0;
  const podY = 2.55;
  for (const z of [0.8, -0.6, -2.0]) {
    bx(1.9, 0.3, 0.45, DARK, [0, 1.45, z]);
    for (const s of [1, -1]) bx(0.15, 0.7, 0.3, STEEL, [s * 0.75, 1.75, z], { rotation: [0, 0, s * 25] });
  }
  b.part(new THREE.CylinderGeometry(1.05, 1.05, 4.6, 16), POD, { bone: chassis, at: [0, podY, PZ], rotation: [90, 0, 0], flat: true });
  for (const e of [1, -1])
    b.part(new THREE.SphereGeometry(1.05, 16, 6), POD, {
      bone: chassis,
      at: [0, podY, PZ + e * 2.3],
      scale: [1, 1, 0.35],
      flat: true,
    });
  for (let i = 0; i < 6; i++) {
    const z = PZ - 2.0 + i * 0.8;
    b.part(new THREE.TorusGeometry(1.06, 0.055, 4, 16), STEEL, { bone: chassis, at: [0, podY, z] });
    glow(b.part(new THREE.TorusGeometry(1.075, 0.018, 4, 16), i % 2 ? MAG : NEON, { bone: chassis, at: [0, podY, z + 0.1] }), 1.3);
  }
  // seal band & locks
  glow(bx(0.2, 0.05, 4.3, NEON, [0, podY + 1.07, PZ]), 1.2);
  const lid = b.joint("podHatch", { parent: chassis, at: [0, podY + 1.0, PZ + 0.9], dir: [1, 0, 0], up: [0, 0, 1], role: "hinge" });
  b.part(new THREE.BoxGeometry(0.9, 0.1, 1.1), STEEL, { bone: lid, at: [0, podY + 1.07, PZ + 0.4] });
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 6), AMBER, { bone: lid, at: [0, podY + 1.14, PZ + 0.4] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.06, 1.1, 1.7), "#ffffff", { bone: chassis, at: [s * 1.12, podY, PZ], texture: undefined as any, });
    b.part(new THREE.PlaneGeometry(1.5, 1.05), "#ffffff", { bone: chassis, at: [s * 1.16, podY, PZ], dir: [s, 0, 0], axis: "z", texture: EMBLEM });
    b.part(new THREE.PlaneGeometry(2.0, 0.28), "#ffffff", { bone: chassis, at: [s * 1.01, podY - 0.78, PZ - 0.2], dir: [s, 0, 0], axis: "z", texture: HAZARD, rotation: undefined as any });
    for (const z of [PZ - 0.8, PZ + 0.8]) for (const y of [podY - 0.45, podY + 0.45])
      b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6), "#c9ced8", { bone: chassis, at: [s * 1.17, y, z], rotation: [0, 0, 90] });
  }
  // rear door
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 10), STEEL, { bone: chassis, at: [0, podY, PZ - 2.2], rotation: [90, 0, 0], flat: true });
  glow(b.part(new THREE.TorusGeometry(0.38, 0.03, 4, 10), MAG, { bone: chassis, at: [0, podY, PZ - 2.26] }), 1.6);
  b.part(new THREE.PlaneGeometry(0.5, 0.2), "#ffffff", { bone: chassis, at: [0, podY - 0.7, PZ - 2.25], dir: [0, 0, -1], axis: "z", texture: PLATE });
  // tail lights & bumper
  bx(2.6, 0.35, 0.3, STEEL, [0, 1.0, -3.7]);
  for (const s of [1, -1]) {
    glow(bx(0.5, 0.15, 0.05, "#ff2a2a", [s * 0.9, 1.35, -3.58]), 1.6);
    cy(0.1, 0.5, 8, DARK, [s * 0.6, 0.75, -3.9], [90, 0, 0]);
    bx(0.16, 0.5, 0.2, STEEL, [s * 1.1, 1.7, -2.3]);
  }

  // ---------- underglow, skirts, cables, props
  for (const s of [1, -1]) {
    glow(bx(0.06, 0.05, 6.4, MAG, [s * 1.0, 0.62, -0.1]), 1.5);
    for (let i = 0; i < 3; i++) {
      const z = 1.0 - i * 1.3;
      bx(0.06, 0.45, 1.1, ARMOUR, [s * 1.62, 1.3, z]);
      for (const dz of [-0.4, 0.4]) b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), "#c9ced8", { bone: chassis, at: [s * 1.66, 1.3, z + dz], rotation: [0, 0, 90] });
    }
    // fuel/battery tank
    cy(0.28, 1.2, 10, STEEL, [s * 0.85, 0.65, 0.8], [90, 0, 0]);
  }
  const hose = catmull([[0.5, 2.2, 0.95], [0.7, 1.7, 0.8], [0.5, 1.45, 0.3], [0.9, 1.4, -0.3]]);
  b.sweep(hose, 0.045, { color: DARK, bone: chassis, sides: 6 });
  const cable = catmull([[-0.5, 2.3, 0.95], [-0.8, 1.7, 0.7], [-0.5, 1.5, 0.2], [-0.95, 1.45, -0.5]]);
  b.sweep(cable, 0.03, { color: MAG, bone: chassis, sides: 5 });
  // ladder at rear of cab
  for (const s of [1, -1]) b.rod([s * 0.3, 1.5, 0.95], [s * 0.3, 3.0, 0.95], 0.03, STEEL, { bone: chassis, sides: 5 });
  for (let i = 0; i < 6; i++) b.rod([-0.3, 1.7 + i * 0.25, 0.95], [0.3, 1.7 + i * 0.25, 0.95], 0.02, STEEL, { bone: chassis, sides: 5 });
  // scattered rivets/greebles on cab roof
  for (let i = 0; i < 6; i++)
    bx(0.12 + R() * 0.1, 0.06, 0.12 + R() * 0.1, i % 2 ? DARK : STEEL, [(R() - 0.5) * 1.4, 2.99, 1.55 + R() * 0.2]);

  function chassisLast(w = 0.05, h = 0.3, d = 0.8, col = NEON, at: number[] = [0, 0, 0]) {
    return b.part(new THREE.BoxGeometry(w, h, d), col, { bone: chassis, at });
  }
  return b.root;
}
```