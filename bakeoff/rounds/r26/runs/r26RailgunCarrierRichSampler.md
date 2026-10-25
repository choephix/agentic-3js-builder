```ts
import * as THREE from "three";
import { createBuilder, mottle, stripes, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Railgun Carrier",
  description:
    "Six-wheeled low-poly sci-fi military railgun carrier, deployed on four hydraulic stabiliser legs with a coil-ringed railgun raised on its turret.",
};

const OLIVE = mottle("#56603d", "#6a7550", { size: 0.7, contrast: 0.8, seed: 4 });
const OLIVE_DK = mottle("#434b30", "#555f3d", { size: 0.5, contrast: 0.8, seed: 9 });
const DARK = "#24282a";
const STEEL = "#7b8185";
const GUN = "#3b4146";
const TYRE = "#1a1b1d";
const RIM = "#8f8c70";
const GLASS = "#2b5468";
const CYAN = "#52f0ff";
const AMBER = "#ffb23a";
const RED = "#ff3a2a";
const HAZ = stripes("#e2b522", "#1b1b1b", { size: 0.16, axis: [1, 1, 0], width: 0.5, wobble: 0 });

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

const UNIT = svg(
  `<svg viewBox="0 0 128 72"><rect x="4" y="4" width="120" height="64" rx="6" fill="none" stroke="#e8e6d8" stroke-width="5"/><text x="64" y="55" font-family="Arial Black, Arial" font-weight="900" font-size="46" fill="#e8e6d8" text-anchor="middle">R-6</text></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 96 96"><circle cx="48" cy="48" r="42" fill="#16191b" stroke="#e8e6d8" stroke-width="5"/><polygon points="54,12 30,54 46,54 40,84 68,38 51,38" fill="#52f0ff" stroke="#0b2a30" stroke-width="2"/></svg>`,
  { size: 256 },
);
const WARN = svg(
  `<svg viewBox="0 0 96 96"><polygon points="48,6 92,88 4,88" fill="#f2c20a" stroke="#111" stroke-width="6"/><rect x="43" y="34" width="10" height="28" fill="#111"/><rect x="43" y="68" width="10" height="10" fill="#111"/></svg>`,
  { size: 192 },
);
const HUD = svg(
  `<svg viewBox="0 0 160 100"><rect width="160" height="100" fill="#06131a"/><g stroke="#0f4b5a" stroke-width="1">${[20, 40, 60, 80, 100, 120, 140].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="100"/>`).join("")}${[20, 40, 60, 80].map((y) => `<line x1="0" y1="${y}" x2="160" y2="${y}"/>`).join("")}</g><circle cx="80" cy="50" r="22" fill="none" stroke="#2bf0ff" stroke-width="2"/><circle cx="80" cy="50" r="4" fill="#2bf0ff"/><rect x="8" y="78" width="60" height="6" fill="#0f4b5a"/><rect x="8" y="78" width="46" height="6" fill="#2bf0ff"/><text x="152" y="18" font-family="monospace" font-size="12" fill="#2bf0ff" text-anchor="end">CHARGE</text></svg>`,
  { size: 320 },
);

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });
  const chassis = b.joint("chassis", { at: [0, 1.3, 0], role: "spine" });
  const part = (geo: THREE.BufferGeometry, color: any, bone: any, at: number[], extra: any = {}) =>
    b.part(geo, color, { bone, at, ...extra });

  // ---------- wheels (3 axles x 2)
  const WY = 0.75;
  const axles = [3.0, 1.4, -2.6];
  axles.forEach((z, i) => {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const wx = s * 1.5;
      const j = b.joint(`wheel${side}${i + 1}`, { parent: chassis, at: [wx, WY, z], dir: [0, 1, 0], role: "hinge" });
      part(cyl(0.7, 0.5, 14), TYRE, j, [wx, WY, z], { rotation: [0, 0, 90], flat: true });
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2;
        part(box(0.5, 0.1, 0.22), TYRE, j, [wx + (k % 2 ? 0.04 : -0.04), WY + 0.72 * Math.cos(a), z + 0.72 * Math.sin(a)], {
          rotation: [(a * 180) / Math.PI, 0, 0],
          flat: true,
        });
      }
      part(cyl(0.42, 0.54, 10), RIM, j, [wx, WY, z], { rotation: [0, 0, 90], flat: true });
      part(cyl(0.3, 0.06, 10), DARK, j, [wx + s * 0.28, WY, z], { rotation: [0, 0, 90], flat: true });
      part(cyl(0.15, 0.2, 8), STEEL, j, [wx + s * 0.32, WY, z], { rotation: [0, 0, 90], flat: true });
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        part(cyl(0.028, 0.05, 6), STEEL, j, [wx + s * 0.3, WY + 0.27 * Math.cos(a), z + 0.27 * Math.sin(a)], {
          rotation: [0, 0, 90],
        });
      }
      // fender and flaps
      part(box(0.75, 0.1, 1.9), OLIVE_DK, chassis, [wx, 1.6, z]);
      part(box(0.75, 0.3, 0.1), OLIVE_DK, chassis, [wx, 1.45, z + 0.95], { rotation: [-25, 0, 0] });
      part(box(0.75, 0.3, 0.1), OLIVE_DK, chassis, [wx, 1.45, z - 0.95], { rotation: [25, 0, 0] });
      if (i === 2) part(box(0.6, 0.55, 0.06), DARK, chassis, [wx, 0.9, z - 0.85]); // mud flap
      // axle housing
      part(cyl(0.12, 2.6, 8), DARK, chassis, [0, WY, z], { rotation: [0, 0, 90] });
    }
  });
  part(new THREE.SphereGeometry(0.28, 8, 6), DARK, chassis, [0, WY, 1.4], { flat: true }); // diff housing

  // ---------- hull
  part(box(2.4, 1.0, 6.6), OLIVE, chassis, [0, 1.5 + 0.0, -1.1]);
  part(box(2.1, 0.3, 6.4), DARK, chassis, [0, 0.95, -1.1]); // belly pan
  part(box(2.46, 0.08, 6.7), OLIVE_DK, chassis, [0, 2.02, -1.1]); // deck plate
  for (const s of [1, -1]) {
    part(box(0.06, 0.06, 6.6), STEEL, chassis, [s * 1.23, 1.15, -1.1]); // side rail
    // stowage boxes + latches
    part(box(0.3, 0.6, 2.0), OLIVE_DK, chassis, [s * 1.35, 1.65, -0.8]);
    for (const dz of [-0.6, 0, 0.6]) part(box(0.04, 0.12, 0.1), STEEL, chassis, [s * 1.52, 1.75, -0.8 + dz]);
    part(box(0.34, 0.06, 2.06), DARK, chassis, [s * 1.35, 1.97, -0.8]);
    // unit plate
    part(new THREE.PlaneGeometry(1.1, 0.62), "#ffffff", chassis, [s * 1.205, 1.55, -2.6], {
      dir: [s, 0, 0],
      axis: "z",
      texture: UNIT,
    });
    // rear grab handles
    part(box(0.05, 0.5, 0.05), STEEL, chassis, [s * 1.0, 2.3, -4.35]);
  }
  // rear panels
  part(box(2.4, 0.9, 0.12), OLIVE_DK, chassis, [0, 1.5, -4.45]);
  part(new THREE.PlaneGeometry(0.9, 0.56), "#ffffff", chassis, [0.55, 1.6, -4.52], { dir: [0, 0, -1], axis: "z", texture: HUD });
  glow(b.part(new THREE.PlaneGeometry(0.9, 0.56), "#ffffff", { bone: chassis, at: [0.55, 1.6, -4.53], dir: [0, 0, -1], axis: "z", texture: HUD }), 1.3);
  part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", chassis, [-0.6, 1.6, -4.52], { dir: [0, 0, -1], axis: "z", texture: WARN });
  for (const s of [1, -1]) {
    glow(part(box(0.3, 0.14, 0.06), RED, chassis, [s * 1.0, 1.15, -4.5]), 1.4);
    part(cyl(0.07, 0.3, 8), STEEL, chassis, [s * 0.5, 0.85, -4.6], { rotation: [90, 0, 0] }); // tow hook post
  }
  part(box(2.46, 0.3, 0.3), HAZ, chassis, [0, 0.85, -4.6]); // rear bumper

  // rear deck equipment
  for (let i = 0; i < 3; i++) {
    part(box(1.0, 0.14, 0.4), DARK, chassis, [-0.5, 2.14, -3.9 + i * 0.5]);
    for (let k = 0; k < 4; k++) part(box(0.9, 0.03, 0.04), STEEL, chassis, [-0.5, 2.22, -4.03 + i * 0.5 + k * 0.08]);
  }
  part(box(0.9, 0.5, 0.9), OLIVE_DK, chassis, [0.6, 2.3, -3.8]); // generator
  part(cyl(0.1, 0.8, 8), STEEL, chassis, [0.9, 2.9, -4.1]); // exhaust
  part(cyl(0.13, 0.05, 8), DARK, chassis, [0.9, 3.33, -4.1]);

  // ---------- cab
  part(box(2.4, 1.8, 2.0), OLIVE, chassis, [0, 2.0, 3.3]);
  part(box(2.5, 0.12, 2.1), OLIVE_DK, chassis, [0, 2.96, 3.3]);
  b.frustumBox([0, 1.45, 4.3], [0, 1.3, 4.8], [2.4, 0.9], [2.5, 0.7], { bone: chassis, color: OLIVE });
  part(box(2.0, 0.7, 0.06), GLASS, chassis, [0, 2.45, 4.32], { rotation: [-12, 0, 0] });
  part(box(2.1, 0.06, 0.1), DARK, chassis, [0, 2.84, 4.3]);
  for (const s of [1, -1]) {
    part(box(0.06, 0.7, 1.2), GLASS, chassis, [s * 1.21, 2.45, 3.5]);
    part(box(0.05, 1.5, 0.05), DARK, chassis, [s * 1.22, 2.0, 2.8]); // door seam
    part(box(0.08, 0.05, 0.22), STEEL, chassis, [s * 1.24, 2.0, 2.95]); // handle
    b.rod([s * 1.2, 2.5, 4.1], [s * 1.55, 2.6, 4.2], 0.025, STEEL, { bone: chassis, sides: 6 }); // mirror arm
    part(box(0.08, 0.4, 0.22), DARK, chassis, [s * 1.58, 2.55, 4.2]);
    glow(part(box(0.5, 0.18, 0.06), CYAN, chassis, [s * 0.8, 1.28, 4.82]), 1.6); // headlight
    part(box(0.6, 0.26, 0.04), DARK, chassis, [s * 0.8, 1.28, 4.8]);
    part(cyl(0.35, 0.12, 6), STEEL, chassis, [s * 1.3, 1.6, 4.3], { rotation: [90, 0, 0], flat: true }); // wheel-arch lamp
    // exhaust stacks behind cab
    part(cyl(0.1, 1.3, 8), STEEL, chassis, [s * 1.1, 2.9, 2.15]);
    part(cyl(0.14, 0.06, 8), DARK, chassis, [s * 1.1, 3.55, 2.15]);
    part(cyl(0.16, 0.5, 8), OLIVE_DK, chassis, [s * 1.1, 2.4, 2.15]); // heat shield
  }
  part(box(1.2, 0.4, 0.06), DARK, chassis, [0, 1.3, 4.78]); // grille
  for (let k = 0; k < 5; k++) part(box(1.1, 0.03, 0.04), STEEL, chassis, [0, 1.16 + k * 0.07, 4.82]);
  part(box(2.6, 0.35, 0.35), HAZ, chassis, [0, 0.85, 4.9]); // bumper
  for (const s of [1, -1]) {
    part(cyl(0.06, 0.4, 6), RED, chassis, [s * 0.5, 0.85, 5.15], { rotation: [90, 0, 0] });
  }
  // roof gear
  part(box(1.3, 0.1, 0.18), DARK, chassis, [0, 3.1, 4.0]);
  for (const x of [-0.5, -0.17, 0.17, 0.5]) glow(part(box(0.24, 0.08, 0.06), AMBER, chassis, [x, 3.12, 4.11]), 1.5);
  part(cyl(0.3, 0.06, 10), STEEL, chassis, [0.6, 3.05, 3.0], { flat: true });
  part(new THREE.SphereGeometry(0.26, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, chassis, [0.6, 3.08, 3.0], { flat: true });
  b.spike([-0.9, 3.02, 2.6], [0, 1, 0], 1.6, 0.025, STEEL, { bone: chassis, sides: 5 });
  b.spike([-0.7, 3.02, 2.5], [0.1, 1, -0.1], 1.2, 0.02, STEEL, { bone: chassis, sides: 5 });
  part(cyl(0.12, 0.2, 8), DARK, chassis, [-0.9, 3.08, 2.6]);

  // ---------- stabiliser legs (4)
  const legs: [number, number][] = [
    [1, -0.7],
    [-1, -0.7],
    [1, -3.9],
    [-1, -3.9],
  ];
  legs.forEach(([s, z], i) => {
    const side = s > 0 ? "L" : "R";
    const tag = `${side}${i < 2 ? 1 : 2}`;
    const out = b.joint(`outrigger${tag}`, { parent: chassis, at: [s * 1.2, 1.05, z], dir: [s, 0, 0], up: [0, 1, 0], role: "hinge" });
    part(box(1.5, 0.3, 0.4), OLIVE_DK, out, [s * 1.9, 1.05, z]);
    part(box(1.0, 0.1, 0.46), HAZ, out, [s * 1.9, 1.22, z]);
    b.rod([s * 1.3, 1.5, z], [s * 2.5, 1.1, z], 0.06, STEEL, { bone: out, sides: 6 }); // brace
    part(cyl(0.12, 0.5, 8), STEEL, out, [s * 1.25, 1.05, z], { rotation: [90, 0, 0] }); // hinge pin
    const leg = b.joint(`leg${tag}`, { parent: out, at: [s * 2.6, 1.05, z], dir: [0, -1, 0], role: "leg" });
    part(cyl(0.2, 0.8, 8), OLIVE, leg, [s * 2.6, 0.95, z]); // outer sleeve
    part(cyl(0.21, 0.2, 8), HAZ, leg, [s * 2.6, 0.7, z]);
    part(cyl(0.12, 0.8, 8), STEEL, leg, [s * 2.6, 0.45, z]); // piston
    part(new THREE.SphereGeometry(0.17, 8, 6), DARK, leg, [s * 2.6, 0.2, z], { flat: true });
    part(cyl(0.55, 0.14, 8), DARK, leg, [s * 2.6, 0.07, z], { flat: true }); // pad
    part(cyl(0.58, 0.04, 8), HAZ, leg, [s * 2.6, 0.12, z], { flat: true });
    part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", leg, [s * 2.6 + s * 0.0, 0.95, z + 0.205], { dir: [0, 0, 1], axis: "z", texture: WARN });
    part(cyl(0.05, 0.5, 6), STEEL, out, [s * 2.2, 1.45, z + 0.22]); // hydraulic line
  });

  // ---------- turret
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 2.1, -1.4], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("gunPitch", { parent: yaw, at: [0, 3.2, -1.4], dir: [0, 0, 1], role: "hinge" });
  part(new THREE.TorusGeometry(1.1, 0.07, 6, 18), STEEL, chassis, [0, 2.12, -1.4], { rotation: [90, 0, 0] });
  part(cyl(1.05, 0.2, 14), DARK, chassis, [0, 2.15, -1.4], { flat: true });
  part(cyl(0.95, 0.55, 12), OLIVE, yaw, [0, 2.5, -1.4], { flat: true });
  part(cyl(0.98, 0.08, 12), HAZ, yaw, [0, 2.78, -1.4], { flat: true });
  for (const s of [1, -1]) {
    part(box(0.25, 1.0, 1.7), OLIVE, yaw, [s * 0.7, 3.2, -1.4]); // cheek plates
    part(box(0.3, 0.2, 1.4), OLIVE_DK, yaw, [s * 0.7, 3.78, -1.4]);
    part(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", yaw, [s * 0.836, 3.15, -1.4], { dir: [s, 0, 0], axis: "z", texture: EMBLEM });
    part(cyl(0.18, 0.5, 8), STEEL, yaw, [s * 0.85, 3.2, -1.4], { rotation: [0, 0, 90] }); // trunnion
    part(box(0.5, 0.5, 0.8), DARK, yaw, [s * 0.9, 2.9, -2.1]); // ammo/power box
    glow(part(box(0.04, 0.3, 0.5), CYAN, yaw, [s * 1.16, 2.9, -2.1]), 1.3);
  }
  part(box(1.4, 0.3, 1.3), OLIVE_DK, yaw, [0, 2.95, -2.05]);
  b.rod([0, 2.35, -2.5], [0, 3.1, -1.9], 0.07, STEEL, { bone: yaw, sides: 8 }); // elevation ram
  b.rod([0, 2.35, -2.5], [0, 2.8, -2.2], 0.1, DARK, { bone: yaw, sides: 8 });
  // sights
  part(box(0.3, 0.3, 0.4), DARK, yaw, [-0.85, 4.0, -1.4]);
  glow(part(cyl(0.08, 0.04, 8), CYAN, yaw, [-0.85, 4.0, -1.18], { rotation: [90, 0, 0] }), 1.5);

  // ---------- railgun
  const gz = -1.4;
  part(box(1.1, 0.85, 1.3), GUN, pitch, [0, 3.2, gz - 0.9]); // breech
  part(box(1.0, 0.1, 1.0), STEEL, pitch, [0, 3.68, gz - 0.9]);
  for (const s of [1, -1]) {
    part(box(0.2, 0.36, 8.2), GUN, pitch, [s * 0.26, 3.2, 1.5]); // rails
    part(box(0.06, 0.4, 8.0), STEEL, pitch, [s * 0.38, 3.2, 1.5]);
    for (const dz of [-0.2, 0.7]) {
      part(cyl(0.3, 1.0, 10), OLIVE_DK, pitch, [s * 0.95, 3.0, gz + dz + 0.3], { rotation: [90, 0, 0], flat: true }); // capacitors
      glow(part(new THREE.TorusGeometry(0.31, 0.04, 5, 10), CYAN, pitch, [s * 0.95, 3.0, gz + dz + 0.8]), 1.5);
      glow(part(new THREE.TorusGeometry(0.31, 0.04, 5, 10), CYAN, pitch, [s * 0.95, 3.0, gz + dz - 0.2]), 1.5);
      b.rod([s * 0.95, 3.2, gz + dz + 0.3], [s * 0.4, 3.35, gz + dz + 0.3], 0.04, DARK, { bone: pitch, sides: 5 });
    }
  }
  glow(part(box(0.2, 0.12, 7.6), CYAN, pitch, [0, 3.2, 1.7]), 1.8); // plasma gap glow
  for (let i = 0; i < 7; i++) {
    const z = 0.5 + i * 0.85;
    const r = 0.52 - i * 0.02;
    part(new THREE.TorusGeometry(r, 0.07, 6, 12), GUN, pitch, [0, 3.2, z]);
    glow(part(new THREE.TorusGeometry(r - 0.05, 0.035, 5, 12), CYAN, pitch, [0, 3.2, z + 0.1]), 1.6);
    for (const s of [1, -1]) part(box(0.12, 0.2, 0.2), STEEL, pitch, [s * (r + 0.02), 3.2, z]);
  }
  part(box(1.0, 0.8, 0.5), GUN, pitch, [0, 3.2, 5.6]); // muzzle block
  part(box(0.7, 0.1, 0.5), HAZ, pitch, [0, 3.65, 5.6]);
  glow(part(box(0.18, 0.2, 0.06), CYAN, pitch, [0, 3.2, 5.87]), 2);
  for (const s of [1, -1]) {
    b.spike([s * 0.55, 3.2, 5.7], [0, 0, 1], 0.4, 0.07, STEEL, { bone: pitch, sides: 5 }); // muzzle prongs
  }
  // power cables
  for (const s of [1, -1]) b.rod([s * 0.5, 3.0, gz - 0.9], [s * 0.95, 3.0, gz + 0.1], 0.05, DARK, { bone: pitch, sides: 6 });
  b.rod([0, 3.7, gz - 0.9], [0, 3.8, 1.0], 0.04, DARK, { bone: pitch, sides: 6 });

  b.pose(pitch, { axis: [1, 0, 0], deg: -9 });
  return b.root;
}
```