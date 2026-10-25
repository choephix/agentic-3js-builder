```ts
import * as THREE from "three";
import { createBuilder, rng, frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Convoy Hauler",
  description: "Armoured cyberpunk convoy hauler with a sealed glowing cargo pod, roof turret and neon trim.",
};

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const R = rng(5);
  const HULL = "#2b3040", PLATE = "#3b4256", DARK = "#14161e", STEEL = "#6d7486";
  const NEON = "#19f2ff", PINK = "#ff2d95", AMBER = "#ffb02e", TYRE = "#17181c", GLASS = "#1b3a55";

  const ch = b.joint("chassis", { at: [0, 0.75, 0], role: "spine" });

  const stripeTex = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#e8c21a"/><path d="M-10 74 L40 -10 L56 -10 L6 74Z M30 74 L80 -10 L96 -10 L46 74Z M-30 74 L20 -10 L36 -10 L-14 74Z" fill="#111"/></svg>`,
    { size: 128 });
  const logoTex = svg(
    `<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#0d1018"/><rect x="3" y="3" width="122" height="58" fill="none" stroke="#ff2d95" stroke-width="3"/><text x="64" y="30" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="20" fill="#19f2ff">SEALED</text><text x="64" y="52" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#ffb02e">NX-77 // DO NOT OPEN</text></svg>`,
    { size: 256 });

  // frame
  for (const s of [1, -1]) b.part(box(0.2, 0.25, 6.4), DARK, { bone: ch, at: [s * 0.6, 0.0, 0] });
  b.part(box(1.9, 0.12, 6.2), HULL, { bone: ch, at: [0, 0.18, 0] });

  // wheels
  const wz = [-2.2, -1.1, 1.9];
  const wheelJoints: any[] = [];
  for (const s of [1, -1])
    for (const z of wz) {
      const hub: [number, number, number] = [s * 1.05, -0.33, z];
      const j = b.joint(`wheel${s > 0 ? "L" : "R"}${z}`.replace(".", "_").replace("-", "n"), { parent: ch, at: [hub[0], hub[1] + 0.75, hub[2]], dir: [s, 0, 0], role: "hinge" });
      wheelJoints.push(j);
      const at: [number, number, number] = [hub[0], hub[1] + 0.75, hub[2]];
      b.part(cyl(0.5, 0.42, 12), TYRE, { bone: j, at, rotation: [0, 0, 90], flat: true });
      b.part(cyl(0.3, 0.46, 10), STEEL, { bone: j, at, rotation: [0, 0, 90], flat: true });
      b.part(cyl(0.12, 0.5, 6), PINK, { bone: j, at, rotation: [0, 0, 90] });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(box(0.46, 0.08, 0.1), DARK, { bone: j, at: [at[0] + s * 0.0, at[1] + 0.2 * Math.cos(a), at[2] + 0.2 * Math.sin(a)], rotation: [(a * 180) / Math.PI, 0, 0] });
      }
    }
  // fenders
  for (const s of [1, -1])
    for (const z of wz) b.part(box(0.5, 0.1, 1.2), PLATE, { bone: ch, at: [s * 1.05, 0.62, z] });

  // cab (front, +Z)
  const cz = 2.15;
  b.part(box(2.1, 0.9, 1.6), HULL, { bone: ch, at: [0, 0.75, cz - 0.1] });
  b.frustumBox([0, 0.55, cz + 0.7], [0, 0.5, cz + 1.7], [2.1, 0.8], [1.9, 0.5], { bone: ch, color: PLATE }); // nose
  b.part(box(1.9, 0.5, 1.0), PLATE, { bone: ch, at: [0, 1.4, cz - 0.3] }); // upper cab
  b.part(box(1.7, 0.1, 1.1), DARK, { bone: ch, at: [0, 1.7, cz - 0.3] }); // roof
  b.part(box(1.6, 0.34, 0.05), GLASS, { bone: ch, at: [0, 1.42, cz + 0.22], rotation: [-18, 0, 0] }); // visor slit
  glow(b.part(box(1.5, 0.04, 0.03), NEON, { bone: ch, at: [0, 1.62, cz + 0.2] }), 1.4);
  for (const s of [1, -1]) {
    b.part(box(0.06, 0.28, 0.7), GLASS, { bone: ch, at: [s * 0.96, 1.42, cz - 0.3] });
    b.part(box(0.05, 0.7, 0.9), PLATE, { bone: ch, at: [s * 1.08, 0.78, cz - 0.1] }); // door armour
    b.part(box(0.1, 0.12, 0.5), STEEL, { bone: ch, at: [s * 1.08, 1.1, cz - 0.1] });
    // headlights
    glow(b.part(box(0.42, 0.1, 0.06), AMBER, { bone: ch, at: [s * 0.7, 0.62, cz + 1.7] }), 1.6);
    glow(b.part(box(0.1, 0.1, 0.08), PINK, { bone: ch, at: [s * 0.95, 0.62, cz + 1.62] }), 1.4);
    // side mirrors
    b.rod([s * 1.0, 1.35, cz + 0.2], [s * 1.35, 1.4, cz + 0.3], 0.025, STEEL, { bone: ch });
    b.part(box(0.06, 0.24, 0.16), DARK, { bone: ch, at: [s * 1.38, 1.4, cz + 0.3] });
    // exhaust stacks
    b.rod([s * 1.0, 0.7, cz - 0.9], [s * 1.0, 2.3, cz - 0.9], 0.07, STEEL, { bone: ch, sides: 8 });
    b.part(cyl(0.09, 0.08, 8), DARK, { bone: ch, at: [s * 1.0, 2.32, cz - 0.9] });
    glow(b.part(cyl(0.05, 0.03, 8), AMBER, { bone: ch, at: [s * 1.0, 2.37, cz - 0.9] }), 1.3);
  }
  // ram bumper with teeth
  b.part(box(2.3, 0.45, 0.3), DARK, { bone: ch, at: [0, 0.35, cz + 1.85] });
  for (let i = 0; i < 7; i++) b.spike([-1.0 + i * 0.33, 0.25, cz + 2.0], [0, 0, 1], 0.22, 0.07, STEEL, { bone: ch, sides: 4 });
  b.part(new THREE.PlaneGeometry(1.3, 0.3), "#ffffff", { bone: ch, at: [0, 0.6, cz + 2.01], dir: [0, 0, 1], axis: "z", texture: stripeTex });
  // roof light bar + turret
  glow(b.part(box(1.3, 0.08, 0.1), PINK, { bone: ch, at: [0, 1.82, cz + 0.2] }), 1.5);
  const yaw = b.joint("turretYaw", { parent: ch, at: [0, 1.78, cz - 0.7], dir: [0, 1, 0], role: "hinge" });
  b.part(cyl(0.38, 0.18, 10), PLATE, { bone: yaw, at: [0, 1.88, cz - 0.7], flat: true });
  b.part(box(0.5, 0.3, 0.6), HULL, { bone: yaw, at: [0, 2.1, cz - 0.7] });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 2.12, cz - 0.4], dir: [0, 0, 1], role: "hinge" });
  for (const s of [1, -1]) {
    b.rod([s * 0.12, 2.12, cz - 0.4], [s * 0.12, 2.12, cz + 0.7], 0.05, DARK, { bone: pitch, sides: 8 });
    b.part(cyl(0.08, 0.2, 8), STEEL, { bone: pitch, at: [s * 0.12, 2.12, cz + 0.7], rotation: [90, 0, 0] });
  }
  glow(b.part(box(0.2, 0.06, 0.04), NEON, { bone: yaw, at: [0, 2.14, cz - 0.38] }), 1.5);

  // side tank armour skirts
  for (const s of [1, -1]) {
    b.part(box(0.06, 0.4, 5.6), PLATE, { bone: ch, at: [s * 1.12, 0.3, -0.3] });
    glow(b.part(box(0.04, 0.05, 5.2), s > 0 ? NEON : PINK, { bone: ch, at: [s * 1.16, 0.12, -0.3] }), 1.3);
  }

  // cargo pod (sealed)
  const pz = -1.15;
  const cradle = [-2.6, -0.5, 1.0];
  for (const z of cradle) b.part(box(1.9, 0.16, 0.3), DARK, { bone: ch, at: [0, 0.32, z + pz + 0.3] });
  const podBody = b.part(new THREE.CylinderGeometry(0.92, 0.92, 4.2, 12), HULL, { bone: ch, at: [0, 1.4, pz], rotation: [90, 0, 0], flat: true });
  void podBody;
  for (const e of [-1, 1])
    b.part(new THREE.SphereGeometry(0.92, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), PLATE, { bone: ch, at: [0, 1.4, pz + e * 2.1], rotation: [e * 90, 0, 0], flat: true });
  // armour bands & rivets
  for (let i = 0; i < 6; i++) {
    const z = pz - 1.75 + i * 0.7;
    b.part(new THREE.TorusGeometry(0.93, 0.07, 5, 12), STEEL, { bone: ch, at: [0, 1.4, z] , flat: true});
    glow(b.part(new THREE.TorusGeometry(0.95, 0.018, 4, 12), i % 2 ? NEON : PINK, { bone: ch, at: [0, 1.4, z + 0.18] }), 1.4);
  }
  // side hazard stripes and logo panels
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(1.8, 0.9), "#ffffff", { bone: ch, at: [s * 0.935, 1.5, pz + 0.05], dir: [s, 0, 0], axis: "z", texture: logoTex });
    b.part(new THREE.PlaneGeometry(0.5, 0.6), "#ffffff", { bone: ch, at: [s * 0.9, 0.85, pz + 1.2], dir: [s, 0, 0], axis: "z", texture: stripeTex });
  }
  // top seal hatch with warning lights
  b.part(cyl(0.3, 0.1, 6), STEEL, { bone: ch, at: [0, 2.34, pz], flat: true });
  glow(b.part(cyl(0.15, 0.05, 6), PINK, { bone: ch, at: [0, 2.4, pz] }), 1.6);
  for (const z of [-1.5, 1.5]) b.rod([0, 2.3, pz + z], [0, 2.3, pz + z * 0.8], 0.05, DARK, { bone: ch });
  // antenna array
  b.spike([0.7, 2.2, pz + 1.8], [0, 1, 0], 1.3, 0.025, STEEL, { bone: ch, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.05, 5, 4), AMBER, { bone: ch, at: [0.7, 3.5, pz + 1.8] }), 1.5);
  // rear: thrusters, tail lights, bumper
  b.part(box(2.1, 0.4, 0.25), DARK, { bone: ch, at: [0, 0.4, -3.35] });
  glow(b.part(box(1.6, 0.06, 0.04), "#ff1a2e", { bone: ch, at: [0, 0.55, -3.49] }), 1.6);
  for (const s of [1, -1]) {
    b.part(cyl(0.2, 0.4, 8), STEEL, { bone: ch, at: [s * 0.6, 0.9, -3.4], rotation: [90, 0, 0], flat: true });
    glow(b.part(cyl(0.14, 0.04, 8), NEON, { bone: ch, at: [s * 0.6, 0.9, -3.62], rotation: [90, 0, 0] }), 1.6);
  }
  // scattered side bolts on the skirts
  for (let i = 0; i < 12; i++) for (const s of [1, -1])
    b.part(cyl(0.025, 0.03, 5), STEEL, { bone: ch, at: [s * 1.16, 0.38, -2.8 + i * 0.45 + R() * 0.02], rotation: [0, 0, 90] });
  function R() { return R_(); }
  function R_() { return R_r(); }
  function R_r() { return R_s(); }
  function R_s() { return rr(); }
  function rr() { return R_t(); }
  function R_t() { return 0.5; }

  return b.root;
}
```