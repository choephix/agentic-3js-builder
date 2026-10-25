import * as THREE from "three";
import { createBuilder, frame, rng, polyline, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";
import { paint, noise, mix, smoothstep } from "../../../../src/index";

export const meta = {
  name: "Convoy Hauler",
  description: "Armoured low-poly cyberpunk convoy hauler with a sealed glowing cargo pod, roof turret and neon trim.",
};

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const R = rng(5);
  const chassis = b.joint("chassis", { at: [0, 0.6, 0], role: "spine" });

  const HULL = paint((p, n) => {
    const base = mix("#2b3140", "#4a5266", noise(p, 0.25, 3));
    const top = smoothstep(0.3, 1, n.y);
    const c = mix(base, "#6b748a", top * 0.4);
    const seam = Math.abs(((p.z * 4) % 1)) < 0.03 ? "#12151d" : c;
    return seam;
  });
  const POD = paint((p, n) => mix("#d9d4c8", "#8f8a80", noise(p, 0.3, 8) * 0.6 + (n.y < 0 ? 0.3 : 0)));
  const DARK = "#14161d", STEEL = "#6d7482", TYRE = "#1b1b20";
  const PINK = "#ff2d95", CYAN = "#22e6ff", AMBER = "#ffb02e";

  const stripeTex = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e8e2d2"/>
    <path d="M0 32 L16 0 H32 L16 32Z M32 32 L48 0 H64 L48 32Z" fill="#111"/>
    <rect y="12" width="64" height="8" fill="#ff2d95" opacity="0.0"/></svg>`, { size: 128 });
  const glyph = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#0a0d14"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="#22e6ff" stroke-width="5"/>
    <path d="M32 14 V50 M18 26 H46" stroke="#ff2d95" stroke-width="5"/></svg>`, { size: 128 });
  const eyeTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#ffb02e"/><rect x="0" y="6" width="64" height="4" fill="#fff4c0"/></svg>`, { size: 64 });

  // frame
  for (const s of [1, -1]) {
    b.part(box(0.14, 0.2, 6.6), DARK, { bone: chassis, at: [s * 0.55, 0.62, -0.2] });
    b.part(box(0.1, 0.1, 6.2), STEEL, { bone: chassis, at: [s * 1.0, 0.5, -0.2] });
  }
  for (const z of [-3, -1.5, 0, 1.5, 2.8]) b.part(box(1.2, 0.12, 0.1), DARK, { bone: chassis, at: [0, 0.6, z] });

  // wheels: three axles
  const axles = [2.2, -0.9, -2.5];
  axles.forEach((z, ai) => {
    for (const s of [1, -1]) {
      const sp = b.joint(`wheel${ai}${s > 0 ? "L" : "R"}`, { parent: chassis, at: [s * 1.05, 0.5, z], dir: [0, 1, 0], role: "hinge" });
      b.part(cyl(0.5, 0.42, 10), TYRE, { bone: sp, at: [s * 1.05, 0.5, z], rotation: [0, 0, 90], flat: true });
      b.part(cyl(0.3, 0.46, 8), STEEL, { bone: sp, at: [s * 1.05, 0.5, z], rotation: [0, 0, 90], flat: true });
      b.part(cyl(0.12, 0.5, 6), AMBER, { bone: sp, at: [s * 1.05, 0.5, z], rotation: [0, 0, 90] });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        b.part(box(0.44, 0.1, 0.12), TYRE, { bone: sp, at: [s * 1.05, 0.5 + 0.5 * Math.cos(a), z + 0.5 * Math.sin(a)], rotation: [(a * 180) / Math.PI, 0, 0] });
      }
    }
    b.part(cyl(0.07, 2.1, 8), DARK, { bone: chassis, at: [0, 0.5, z], rotation: [0, 0, 90] });
  });
  // mud fenders
  for (const s of [1, -1]) for (const z of [2.2, -0.9, -2.5])
    b.part(box(0.5, 0.08, 1.2), HULL, { bone: chassis, at: [s * 1.05, 1.08, z] });

  // cab (forward)
  b.part(box(2.1, 0.8, 1.8), HULL, { bone: chassis, at: [0, 1.1, 2.2] });
  b.part(box(2.0, 0.7, 1.5), HULL, { bone: chassis, at: [0, 1.8, 1.9] });
  b.frustumBox([0, 1.15, 3.0], [0, 0.95, 3.5], [2.0, 0.8], [1.9, 0.5], { bone: chassis, color: HULL });
  b.part(box(1.8, 0.1, 1.2), HULL, { bone: chassis, at: [0, 2.2, 1.9], rotation: [4, 0, 0] });
  // slit windscreen
  b.part(box(1.7, 0.28, 0.06), "#0b2b3a", { bone: chassis, at: [0, 1.95, 2.66], rotation: [-18, 0, 0] });
  glow(b.part(box(1.6, 0.04, 0.03), CYAN, { bone: chassis, at: [0, 1.95, 2.7], rotation: [-18, 0, 0] }), 1.2);
  for (const s of [1, -1]) {
    b.part(box(0.05, 0.3, 0.9), "#0b2b3a", { bone: chassis, at: [s * 1.02, 1.95, 1.9] });
    glow(b.part(box(0.04, 0.03, 0.85), CYAN, { bone: chassis, at: [s * 1.045, 1.95, 1.9] }), 1);
    // headlights
    glow(b.part(box(0.4, 0.1, 0.06), AMBER, { bone: chassis, at: [s * 0.7, 1.05, 3.46] }), 1.6);
    b.part(box(0.5, 0.04, 0.1), DARK, { bone: chassis, at: [s * 0.7, 1.14, 3.46] });
    // side neon
    glow(b.part(box(0.04, 0.05, 5.4), s > 0 ? PINK : CYAN, { bone: chassis, at: [s * 1.1, 0.78, -0.3] }), 1.3);
    // mirrors
    b.rod([s * 1.05, 1.9, 2.5], [s * 1.45, 2.0, 2.7], 0.025, STEEL, { bone: chassis });
    b.part(box(0.06, 0.3, 0.2), DARK, { bone: chassis, at: [s * 1.47, 2.0, 2.7] });
  }
  // ram bumper with teeth
  b.part(box(2.4, 0.5, 0.3), DARK, { bone: chassis, at: [0, 0.6, 3.6] });
  for (let i = 0; i < 7; i++) b.spike([-1.0 + i * 0.33, 0.5, 3.75], [0, 0, 1], 0.25, 0.07, STEEL, { bone: chassis, sides: 4 });
  b.part(box(2.0, 0.08, 0.04), PINK, { bone: chassis, at: [0, 0.82, 3.77] });
  // grille
  for (let i = 0; i < 5; i++) b.part(box(1.2, 0.04, 0.04), STEEL, { bone: chassis, at: [0, 0.95 + i * 0.07 - 0.1, 3.3] });
  // roof light bar + antennas
  b.part(box(1.3, 0.1, 0.16), DARK, { bone: chassis, at: [0, 2.32, 2.2] });
  for (let i = 0; i < 4; i++) glow(b.part(box(0.25, 0.06, 0.05), i % 2 ? PINK : CYAN, { bone: chassis, at: [-0.45 + i * 0.3, 2.34, 2.3] }), 1.5);
  b.spike([0.8, 2.25, 1.4], [0, 1, 0], 1.4, 0.02, STEEL, { bone: chassis, sides: 4 });
  b.spike([-0.8, 2.25, 1.5], [0, 1, 0], 0.9, 0.02, STEEL, { bone: chassis, sides: 4 });
  b.part(new THREE.SphereGeometry(0.03, 5, 4), PINK, { bone: chassis, at: [0.8, 3.65, 1.4] });
  // exhaust stacks
  for (const s of [1, -1]) {
    b.rod([s * 1.0, 1.0, 0.95], [s * 1.0, 2.9, 0.95], 0.09, STEEL, { bone: chassis, sides: 6 });
    b.part(cyl(0.11, 0.1, 6), DARK, { bone: chassis, at: [s * 1.0, 2.92, 0.95] });
    b.part(cyl(0.13, 0.6, 6), "#3a3f4c", { bone: chassis, at: [s * 1.0, 1.3, 0.95] });
  }

  // armoured side plates on cab
  for (const s of [1, -1]) {
    b.part(box(0.1, 0.6, 1.4), "#3a4256", { bone: chassis, at: [s * 1.12, 1.25, 2.1], rotation: [0, 0, s * 8] });
    for (let i = 0; i < 4; i++) b.part(cyl(0.03, 0.05, 6), STEEL, { bone: chassis, at: [s * 1.19, 1.1 + (i % 2) * 0.3, 1.7 + i * 0.28], rotation: [0, 0, 90] });
    // side skirts
    b.part(box(0.08, 0.4, 4.6), HULL, { bone: chassis, at: [s * 1.12, 0.62, -1.3], rotation: [0, 0, s * 10] });
  }

  // cargo pod cradle
  b.part(box(2.0, 0.2, 4.6), DARK, { bone: chassis, at: [0, 0.82, -1.3] });
  for (const z of [-3.1, -1.9, -0.7, 0.5]) {
    for (const s of [1, -1]) b.part(box(0.2, 0.5, 0.3), STEEL, { bone: chassis, at: [s * 0.95, 1.1, z] });
  }
  // sealed pod: capsule body
  const pod = b.sweep(polyline([[0, 1.9, -3.5], [0, 1.9, 0.6]]), [0.95, 0.95], { bone: chassis, color: POD, sides: 10, caps: "round", detail: 1 });
  void pod;
  b.part(box(1.5, 0.05, 4.3), "#cfc8b8", { bone: chassis, at: [0, 2.82, -1.45] });
  // pod bands
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.TorusGeometry(0.97, 0.05, 5, 10), "#2a2f3b", { bone: chassis, at: [0, 1.9, -3.1 + i * 0.85] });
  }
  // hazard stripe panels on flanks
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(2.4, 0.9), "#ffffff", { bone: chassis, at: [s * 0.97, 1.75, -1.5], dir: [s, 0, 0], axis: "z", texture: stripeTex });
    b.part(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", { bone: chassis, at: [s * 1.0, 2.35, -2.9], dir: [s, 0, 0], axis: "z", texture: glyph });
    glow(b.part(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", { bone: chassis, at: [s * 1.005, 2.35, -2.9], dir: [s, 0, 0], axis: "z", texture: glyph }), 1.2);
  }
  // seal lock + glowing seam on pod top
  glow(b.part(box(0.1, 0.04, 4.0), PINK, { bone: chassis, at: [0, 2.86, -1.5] }), 1.4);
  b.part(box(0.5, 0.2, 0.5), DARK, { bone: chassis, at: [0, 2.92, -0.3] });
  glow(b.part(cyl(0.12, 0.04, 8), AMBER, { bone: chassis, at: [0, 3.04, -0.3] }), 1.6);
  // rear door ring
  b.part(new THREE.TorusGeometry(0.7, 0.08, 6, 10), STEEL, { bone: chassis, at: [0, 1.9, -3.55] });
  b.part(cyl(0.6, 0.06, 10), "#4a4f5c", { bone: chassis, at: [0, 1.9, -3.56], rotation: [90, 0, 0] });
  glow(b.part(cyl(0.12, 0.05, 6), CYAN, { bone: chassis, at: [0, 1.9, -3.6], rotation: [90, 0, 0] }), 1.5);

  // roof turret on cab roof
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 2.3, 1.55], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.6, 1.55], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.35, 0.12, 10), STEEL, { bone: yaw, at: [0, 2.36, 1.55] });
  b.part(box(0.6, 0.3, 0.6), "#3a4256", { bone: yaw, at: [0, 2.55, 1.55] });
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 2.62, 1.6], [s * 0.1, 2.62, 2.7], 0.05, DARK, { bone: pitch, sides: 6 });
    b.part(box(0.12, 0.12, 0.12), STEEL, { bone: pitch, at: [s * 0.1, 2.62, 2.72] });
    glow(b.part(cyl(0.025, 0.03, 6), PINK, { bone: pitch, at: [s * 0.1, 2.62, 2.78], rotation: [90, 0, 0] }), 1.5);
  }
  b.part(box(0.3, 0.2, 0.3), "#2a2f3b", { bone: pitch, at: [0, 2.6, 1.4] });
  glow(b.part(new THREE.PlaneGeometry(0.28, 0.07), "#ffffff", { bone: yaw, at: [0, 2.58, 1.86], dir: [0, 0, 1], axis: "z", texture: eyeTex }), 1.2);

  // rear exhausts & thruster glow
  for (const s of [1, -1]) {
    b.part(cyl(0.12, 0.4, 8), STEEL, { bone: chassis, at: [s * 0.6, 0.55, -3.6], rotation: [90, 0, 0] });
    glow(b.part(cyl(0.08, 0.03, 8), PINK, { bone: chassis, at: [s * 0.6, 0.55, -3.82], rotation: [90, 0, 0] }), 1.4);
  }
  // under-glow
  glow(b.part(box(1.6, 0.03, 5.5), CYAN, { bone: chassis, at: [0, 0.3, -0.3] }), 0.8);
  // cables on cab-to-pod
  const cable = catmull([[0.5, 1.5, 0.95], [0.6, 2.0, 0.6], [0.5, 2.1, 0.1]]);
  b.sweep(cable, 0.03, { bone: chassis, color: DARK, sides: 5 });
  // roof ribs on pod and rivets
  const sk = R();
  for (let i = 0; i < 10; i++) b.part(cyl(0.025, 0.04, 5), STEEL, { bone: chassis, at: [(i % 2 ? 1 : -1) * (0.3 + sk * 0.0), 2.84 - 0.03, -3.2 + i * 0.4] });

  return b.root;
}
