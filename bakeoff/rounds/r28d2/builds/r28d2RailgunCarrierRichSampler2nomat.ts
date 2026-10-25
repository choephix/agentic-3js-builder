import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier braced on four stabiliser legs, low-poly sci-fi military.",
};

type V3 = [number, number, number];
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

const HULL = "#59634f";
const HULL2 = "#6c7660";
const DARK = "#2b2f2c";
const STEEL = "#8b939a";
const TYRE = "#1d1e20";
const GLOW = "#46e6ff";
const WARN = "#e0b020";

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });

  const STAR = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#2b2f2c" stroke="#e8e8e0" stroke-width="4"/><path d="M32 10 L38 28 L56 28 L42 38 L48 54 L32 44 L16 54 L22 38 L8 28 L26 28Z" fill="#e8e8e0"/></svg>`,
    { size: 128 },
  );
  const STRIPE = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e0b020"/><path d="M0 16 L16 0 L28 0 L12 16Z M32 16 L48 0 L60 0 L44 16Z" fill="#222"/></svg>`,
    { size: 128 },
  );
  const grit = (c: string) => c;

  // lower hull
  b.frustumBox([0, 0.9, -3.2], [0, 0.9, 3.2], [2.4, 0.7], [2.4, 0.7], { bone: chassis, color: HULL });
  b.part(box(2.2, 0.25, 6.2), DARK, { bone: chassis, at: [0, 0.55, 0] });
  // sloped front glacis
  b.frustumBox([0, 1.15, 3.2], [0, 1.0, 4.0], [2.2, 0.5], [1.9, 0.3], { bone: chassis, color: HULL2 });
  b.part(box(1.6, 0.06, 0.5), HULL2, { bone: chassis, at: [0, 1.3, 3.4], rotation: [-15, 0, 0] });
  // cab
  b.part(box(2.0, 0.8, 1.6), HULL2, { bone: chassis, at: [0, 1.65, 2.5] });
  b.part(box(1.8, 0.35, 0.06), "#7fd4e6", { bone: chassis, at: [0, 1.8, 3.32], rotation: [-20, 0, 0] });
  for (const s of [1, -1]) b.part(box(0.05, 0.3, 0.9), "#7fd4e6", { bone: chassis, at: [s * 1.02, 1.8, 2.5] });
  b.part(box(2.1, 0.08, 1.7), HULL, { bone: chassis, at: [0, 2.08, 2.5] });
  // side armour with panel lines
  for (const s of [1, -1]) {
    b.part(box(0.1, 0.5, 5.6), HULL2, { bone: chassis, at: [s * 1.25, 1.0, -0.3] });
    for (let i = 0; i < 5; i++) b.part(box(0.04, 0.4, 0.06), DARK, { bone: chassis, at: [s * 1.31, 1.0, -2.4 + i * 1.1] });
    b.part(box(0.04, 0.12, 1.0), STRIPE as any, { bone: chassis, at: [s * 1.31, 1.18, 1.2], texture: STRIPE, color: "#ffffff" } as any);
  }
  // emblem
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.6, 0.6), "#ffffff", { bone: chassis, at: [s * 1.33, 1.0, -0.5], dir: [s, 0, 0], axis: "z", texture: STAR });

  // rear deck and railgun cradle
  b.part(box(2.2, 0.3, 3.2), HULL, { bone: chassis, at: [0, 1.4, -1.6] });
  b.part(box(1.6, 0.4, 1.4), DARK, { bone: chassis, at: [0, 1.75, -0.6] }); // turntable housing
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 2.0, -0.6], dir: [1, 0, 0], up: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.9, 0.2, 14), STEEL, { bone: yaw, at: [0, 2.05, -0.6], flat: true });
  b.part(box(1.5, 0.6, 1.8), HULL2, { bone: yaw, at: [0, 2.45, -1.0] });
  for (const s of [1, -1]) b.part(box(0.15, 0.9, 1.4), HULL, { bone: yaw, at: [s * 0.75, 2.9, -0.8] });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 3.0, -0.8], dir: [0, 0, 1], role: "hinge" });
  b.rod([-0.85, 3.0, -0.8], [0.85, 3.0, -0.8], 0.07, STEEL, { bone: pitch, sides: 8 });

  // railgun
  b.part(box(0.8, 0.7, 1.6), DARK, { bone: pitch, at: [0, 3.0, -1.0] });
  for (const s of [1, -1]) {
    b.part(box(0.14, 0.2, 5.8), STEEL, { bone: pitch, at: [s * 0.2, 3.0, 2.2] });
    b.part(box(0.1, 0.1, 5.6), "#c9d2d8", { bone: pitch, at: [s * 0.2, 3.13, 2.2] });
  }
  glow(b.part(box(0.18, 0.12, 5.6), GLOW, { bone: pitch, at: [0, 3.0, 2.2] }), 1.5);
  for (let i = 0; i < 5; i++) {
    const z = 0.3 + i * 1.0;
    b.part(box(0.9, 0.5, 0.18), HULL, { bone: pitch, at: [0, 3.0, z] });
    glow(b.part(box(0.92, 0.06, 0.2), GLOW, { bone: pitch, at: [0, 3.27, z] }), 1.2);
  }
  for (const s of [1, -1]) for (const z of [-0.8, -0.2]) b.part(cyl(0.2, 0.9, 10), DARK, { bone: pitch, at: [s * 0.65, 3.0, z], rotation: [90, 0, 0], flat: true });
  b.part(box(1.0, 0.6, 0.3), DARK, { bone: pitch, at: [0, 3.0, 5.0] }); // muzzle brake
  glow(b.part(box(0.3, 0.2, 0.05), GLOW, { bone: pitch, at: [0, 3.0, 5.17] }), 1.5);
  b.rod([0.5, 2.7, -1.6], [0.5, 2.3, -1.0], 0.04, STEEL, { bone: pitch, sides: 6 });

  // cab details
  b.part(box(1.4, 0.1, 0.1), DARK, { bone: chassis, at: [0, 2.16, 3.2] });
  for (const s of [1, -1]) glow(b.part(box(0.3, 0.12, 0.05), "#fff3b0", { bone: chassis, at: [s * 0.8, 1.0, 4.05] }));
  b.rod([-0.8, 2.15, 1.9], [-0.8, 3.2, 1.9], 0.015, STEEL, { bone: chassis, sides: 5 });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), "#ff4040", { bone: chassis, at: [-0.8, 3.22, 1.9] });
  b.part(box(0.4, 0.04, 0.4), STEEL, { bone: chassis, at: [0.6, 2.14, 2.2] });

  // wheels: 3 axles per side
  const zs = [2.5, 0, -2.5];
  for (const z of zs)
    for (const s of [1, -1]) {
      const n = (s > 0 ? "L" : "R") + (z > 1 ? "F" : z > -1 ? "M" : "R");
      const hub: V3 = [s * 1.2, 0.55, z];
      const steer = z > 1 ? b.joint(`steer${n}`, { parent: chassis, at: hub, dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" }) : chassis;
      const spin = b.joint(`wheel${n}`, { parent: steer, at: hub, dir: [0, 1, 0], role: "hinge" });
      const R: V3 = [0, 0, 90];
      b.part(cyl(0.55, 0.5, 14), TYRE, { bone: spin, at: hub, rotation: R, flat: true });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        b.part(box(0.52, 0.1, 0.16), TYRE, { bone: spin, at: [hub[0], hub[1] + 0.56 * Math.cos(a), hub[2] + 0.56 * Math.sin(a)], rotation: [(a * 180) / Math.PI, 0, 0] });
      }
      b.part(cyl(0.3, 0.54, 10), STEEL, { bone: spin, at: [hub[0] + s * 0.02, hub[1], hub[2]], rotation: R, flat: true });
      b.part(cyl(0.12, 0.6, 6), DARK, { bone: spin, at: [hub[0] + s * 0.02, hub[1], hub[2]], rotation: R });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(cyl(0.025, 0.06, 6), STEEL, { bone: spin, at: [hub[0] + s * 0.3, hub[1] + 0.2 * Math.cos(a), hub[2] + 0.2 * Math.sin(a)], rotation: R });
      }
      b.rod([s * 0.6, 0.8, z], [s * 1.1, 0.6, z], 0.06, DARK, { bone: chassis, sides: 6 }); // axle arm
      b.part(box(0.1, 0.1, 1.0), HULL, { bone: chassis, at: [s * 1.25, 1.35, z] }); // fender
      b.part(box(0.5, 0.06, 1.2), HULL, { bone: chassis, at: [s * 1.2, 1.2, z] });
    }

  // stabiliser legs: four, deployed outward and down
  const spots: [string, number, number][] = [
    ["FL", 1, 2.0],
    ["FR", -1, 2.0],
    ["RL", 1, -3.4],
    ["RR", -1, -3.4],
  ];
  for (const [n, s, z] of spots) {
    const root: V3 = [s * 1.3, 1.1, z];
    const foot: V3 = [s * 2.5, 0.08, z];
    const hip = b.joint(`stabHip${n}`, { parent: chassis, at: root, dir: [s, -0.2, 0], role: "leg" });
    b.part(box(0.5, 0.45, 0.6), DARK, { bone: hip, at: root });
    b.rod(root, [s * 2.0, 1.0, z], 0.12, STEEL, { bone: hip, sides: 6 });
    const leg = b.joint(`stabKnee${n}`, { parent: hip, at: [s * 2.0, 1.0, z], dir: [s * 0.4, -1, 0], role: "leg" });
    b.rod([s * 2.0, 1.0, z], [s * 2.45, 0.2, z], 0.1, HULL, { bone: leg, sides: 6 });
    b.rod([s * 1.5, 1.3, z], [s * 2.2, 0.7, z], 0.06, STEEL, { bone: hip, sides: 6 }); // hydraulic
    b.part(cyl(0.07, 0.7, 6), "#c9d2d8", { bone: leg, at: [s * 2.35, 0.45, z], rotation: [0, 0, s * 15] });
    b.part(cyl(0.38, 0.1, 10), DARK, { bone: leg, at: foot, flat: true }); // pad
    b.part(cyl(0.3, 0.04, 10), WARN, { bone: leg, at: [foot[0], 0.14, foot[2]], flat: true });
    b.part(new THREE.SphereGeometry(0.12, 6, 4), STEEL, { bone: leg, at: [s * 2.42, 0.25, z], flat: true });
  }

  // rear details
  b.part(box(2.0, 0.5, 0.2), DARK, { bone: chassis, at: [0, 1.0, -3.7] });
  for (const s of [1, -1]) {
    glow(b.part(box(0.35, 0.12, 0.05), "#ff3030", { bone: chassis, at: [s * 0.8, 1.05, -3.82] }));
    b.part(cyl(0.1, 0.5, 8), STEEL, { bone: chassis, at: [s * 0.5, 1.7, -3.1], rotation: [90, 0, 0], flat: true });
  }
  // roof greebles
  const r = rng(5);
  for (let i = 0; i < 10; i++)
    b.part(box(0.15 + r() * 0.2, 0.1 + r() * 0.1, 0.15 + r() * 0.2), i % 2 ? DARK : STEEL, {
      bone: chassis,
      at: [(r() - 0.5) * 1.7, 1.62, -2.6 - r() * 1.0],
    });
  // underside min clearance
  b.part(box(1.4, 0.2, 5), DARK, { bone: chassis, at: [0, 0.4, 0] });

  void grit;
  return b.root;
}
