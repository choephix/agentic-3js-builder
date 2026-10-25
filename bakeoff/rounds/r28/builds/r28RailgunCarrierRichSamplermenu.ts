import * as THREE from "three";
import { createBuilder, rng, aim } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier braced on four stabiliser legs, low-poly sci-fi military.",
};

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const HULL = panelled("#5b6657", { size: 0.5, rivets: 0.12 });
  const DARK = "#23272b";
  const TYRE = "#16181a";
  const RIM = "#8a9096";
  const STEEL = metal("steel");
  const CYAN = "#46e6ff";
  const WARN = "#e8b923";

  const chassis = b.joint("chassis", { at: [0, 1.0, 0] });
  const turretYaw = b.joint("yaw", { parent: chassis, at: [0, 1.75, -0.6], dir: [0, 1, 0] });
  const pitch = b.joint("pitch", { parent: turretYaw, at: [0, 2.2, -0.6], dir: [0, 0, 1], up: [0, 1, 0] });

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

  // hull
  b.frustumBox([0, 1.25, -3.2], [0, 1.25, 3.0], [2.6, 0.9], [2.6, 0.9], { bone: chassis, color: HULL });
  b.part(box(2.4, 0.5, 2.0), HULL, { bone: chassis, at: [0, 1.85, 2.0] });
  b.part(box(2.2, 0.3, 1.0), HULL, { bone: chassis, at: [0, 1.75, 0.2] });
  // sloped nose
  b.frustumBox([0, 1.1, 3.0], [0, 1.0, 3.6], [2.6, 0.9], [2.3, 0.5], { bone: chassis, color: HULL });
  // cab windows
  b.part(box(2.0, 0.28, 0.1), CYAN, { bone: chassis, at: [0, 1.95, 3.02], rotation: [-15, 0, 0] });
  glow(b.part(box(1.9, 0.12, 0.05), CYAN, { bone: chassis, at: [0, 1.95, 3.07], rotation: [-15, 0, 0] }), 1.2);
  // skirts
  for (const s of [1, -1]) {
    b.part(box(0.12, 0.5, 5.6), DARK, { bone: chassis, at: [s * 1.35, 1.0, -0.1] });
    b.part(box(0.06, 0.1, 5.6), WARN, { bone: chassis, at: [s * 1.42, 1.25, -0.1] });
    for (let i = 0; i < 6; i++)
      b.part(box(0.04, 0.4, 0.5), HULL, { bone: chassis, at: [s * 1.43, 0.95, -2.4 + i * 0.95] });
  }
  // headlights
  for (const s of [1, -1]) {
    glow(b.part(box(0.3, 0.12, 0.08), CYAN, { bone: chassis, at: [s * 0.9, 1.2, 3.62] }), 1.5);
    b.part(box(0.5, 0.1, 0.3), DARK, { bone: chassis, at: [s * 0.9, 1.0, 3.6] });
  }
  // wheels: 3 axles
  const zs = [2.3, 0, -2.3];
  zs.forEach((z, i) => {
    for (const s of [1, -1]) {
      const n = `${s > 0 ? "L" : "R"}${i}`;
      const susp = b.joint("susp" + n, { parent: chassis, at: [s * 1.2, 0.75, z], dir: [s, 0, 0] });
      const wh = b.joint("wheel" + n, { parent: susp, at: [s * 1.3, 0.62, z], dir: [s, 0, 0], role: "leg" });
      b.part(cyl(0.2, 0.2, 6), DARK, { bone: susp, at: [s * 1.2, 0.8, z], dir: [s, 0, 0] });
      b.part(cyl(0.62, 0.55, 10), TYRE, { bone: wh, at: [s * 1.45, 0.62, z], dir: [1, 0, 0] });
      b.part(cyl(0.38, 0.6, 10), RIM, { bone: wh, at: [s * 1.45, 0.62, z], dir: [1, 0, 0] });
      b.part(cyl(0.12, 0.66, 6), WARN, { bone: wh, at: [s * 1.45, 0.62, z], dir: [1, 0, 0] });
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        b.part(box(0.06, 0.06, 0.06), STEEL, {
          bone: wh,
          at: [s * 1.76, 0.62 + Math.sin(a) * 0.26, z + Math.cos(a) * 0.26],
        });
      }
    }
  });
  // axle beams
  zs.forEach((z) => b.part(cyl(0.12, 2.6, 6), DARK, { bone: chassis, at: [0, 0.65, z], dir: [1, 0, 0] }));

  // stabiliser legs
  const legPts: [number, number][] = [
    [1, 1.9],
    [-1, 1.9],
    [1, -2.9],
    [-1, -2.9],
  ];
  legPts.forEach(([s, z], i) => {
    const hip = b.joint(`stabHip${i}`, { parent: chassis, at: [s * 1.25, 1.3, z], dir: [s, -0.2, 0] });
    b.part(box(0.5, 0.4, 0.5), DARK, { bone: hip, at: [s * 1.35, 1.3, z] });
    const arm = b.rod([s * 1.3, 1.3, z], [s * 2.1, 1.0, z + (z > 0 ? 0.1 : -0.1)], 0.1, { bone: hip, color: WARN });
    const foot: [number, number, number] = [s * 2.3, 0, z + (z > 0 ? 0.15 : -0.15)];
    b.rod([s * 2.1, 1.0, z + (z > 0 ? 0.1 : -0.1)], [foot[0], 0.2, foot[2]], 0.12, { bone: hip, color: STEEL });
    b.part(cyl(0.07, 0.7, 6), STEEL, { bone: hip, at: [s * 2.3, 0.5, foot[2]] });
    b.part(cyl(0.38, 0.1, 8), DARK, { bone: hip, at: [foot[0], 0.05, foot[2]] });
    b.part(box(0.5, 0.04, 0.5), WARN, { bone: hip, at: [foot[0], 0.12, foot[2]] });
  });

  // turret
  b.part(cyl(1.2, 0.2, 12), DARK, { bone: turretYaw, at: [0, 1.7, -0.6] });
  b.part(cyl(1.0, 0.5, 8), HULL, { bone: turretYaw, at: [0, 1.95, -0.6] });
  for (const s of [1, -1]) {
    b.part(box(0.35, 0.9, 1.8), HULL, { bone: turretYaw, at: [s * 0.65, 2.45, -0.6] });
    b.part(box(0.15, 0.4, 1.0), DARK, { bone: turretYaw, at: [s * 0.85, 2.45, -0.6] });
  }
  // capacitor drums
  for (let i = 0; i < 3; i++) {
    b.part(cyl(0.3, 1.0, 8), DARK, { bone: turretYaw, at: [0, 2.7, -1.2 + i * 0.5], dir: [1, 0, 0] });
    glow(b.part(cyl(0.12, 1.05, 6), CYAN, { bone: turretYaw, at: [0, 2.7, -1.2 + i * 0.5], dir: [1, 0, 0] }), 1.2);
  }
  // railgun
  b.part(box(0.8, 0.8, 1.4), HULL, { bone: pitch, at: [0, 2.2, -1.2] });
  for (const s of [1, -1]) {
    b.part(box(0.14, 0.2, 5.2), STEEL, { bone: pitch, at: [s * 0.3, 2.2, 1.9] });
    b.part(box(0.1, 0.1, 5.2), "#b8905a", { bone: pitch, at: [s * 0.3, 2.35, 1.9] });
  }
  glow(b.part(box(0.4, 0.1, 5.0), CYAN, { bone: pitch, at: [0, 2.2, 1.9] }), 1.6);
  for (const z of [-0.2, 1.0, 2.2, 3.4, 4.4]) {
    b.part(box(0.9, 0.5, 0.2), DARK, { bone: pitch, at: [0, 2.2, z] });
  }
  b.part(box(0.9, 0.55, 0.3), WARN, { bone: pitch, at: [0, 2.2, 4.5] });
  glow(b.part(cyl(0.1, 0.05, 8), CYAN, { bone: pitch, at: [0, 2.2, 4.7], dir: [0, 0, 1] }), 2);
  // pitch pins
  for (const s of [1, -1]) b.part(cyl(0.18, 0.2, 8), STEEL, { bone: pitch, at: [s * 0.75, 2.2, -0.6], dir: [1, 0, 0] });

  // roof sensors
  b.part(cyl(0.05, 1.0, 5), DARK, { bone: chassis, at: [0.9, 2.5, 1.6] });
  b.part(new THREE.SphereGeometry(0.2, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), CYAN, { bone: chassis, at: [-0.7, 2.1, 2.0] });
  // rear thrusters / vents and decal
  const mark = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#e8b923"/><path d="M8 52 L32 8 L56 52Z" fill="#111"/><path d="M34 20 L26 36 H32 L28 48 L40 30 H34Z" fill="#e8b923"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", { bone: chassis, at: [0, 1.4, -3.22], dir: [0, 0, -1], axis: "z", texture: mark });
  for (const s of [1, -1]) {
    b.part(cyl(0.28, 0.4, 8), DARK, { bone: chassis, at: [s * 0.8, 1.2, -3.4], dir: [0, 0, 1] });
    glow(b.part(cyl(0.2, 0.05, 8), "#ff8a3c", { bone: chassis, at: [s * 0.8, 1.2, -3.6], dir: [0, 0, 1] }), 1.5);
  }

  void rng;
  void aim;
  return b.root;
}
