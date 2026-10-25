```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description:
    "Low-poly cyberpunk armoured convoy hauler: plated cab with roof turret, neon trim, four-axle chassis and a sealed octagonal cargo pod with a glowing lock door.",
};

// Palette
const GUN = "#2b303b";
const GUN_D = "#1a1d25";
const ARMOR = "#3d4556";
const ARMOR_L = "#58627a";
const TIRE = "#13151a";
const HAZ = "#f5b700";
const CYAN = "#19f0ff";
const MAG = "#ff2bd6";
const RED = "#ff2a3a";
const GLASS = "#0b3a4c";
const LAMP = "#fff3c4";
const POD = "#4a5568";
const POD_L = "#6b7894";
const METAL = "#8791a6";

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });

  const B = (w: number, h: number, d: number, color: string, p: V, rot?: V) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: p, rotation: rot });
  const C = (rt: number, rb: number, h: number, seg: number, color: string, p: V, rot?: V) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: p, rotation: rot });
  const G = (part: ReturnType<typeof B>, s = 1.2) => glow(part, s);

  const oct = (hw: number, hh: number, c: number): [number, number][] => [
    [-hw + c, -hh], [hw - c, -hh], [hw, -hh + c], [hw, hh - c],
    [hw - c, hh], [-hw + c, hh], [-hw, hh - c], [-hw, -hh + c],
  ];

  // ---------- chassis ----------
  B(1.9, 0.3, 9.3, GUN_D, [0, 0.88, 0]);
  B(2.3, 0.18, 6.2, GUN, [0, 1.1, -1.5]); // cargo deck
  B(2.3, 0.12, 6.2, HAZ, [0, 1.0, -1.5]);
  for (const s of [1, -1]) {
    G(B(0.06, 0.06, 8.4, MAG, [s * 0.96, 0.72, 0]), 1.4); // underglow
    B(0.16, 0.5, 1.1, ARMOR, [s * 1.12, 0.95, 2.2]); // front skirt
    C(0.3, 0.3, 1.3, 8, GUN, [s * 1.1, 0.95, -2.05], [90, 0, 0]); // fuel tank
    B(0.1, 0.1, 1.3, HAZ, [s * 1.1, 1.26, -2.05]);
  }

  // ---------- wheels ----------
  const axles = [3.4, 0.9, -0.7, -3.4];
  for (const z of axles) {
    B(2.6, 0.12, 0.14, GUN_D, [0, 0.62, z]);
    for (const s of [1, -1]) {
      C(0.62, 0.62, 0.5, 10, TIRE, [s * 1.3, 0.62, z], [0, 0, 90]);
      C(0.38, 0.38, 0.54, 8, METAL, [s * 1.3, 0.62, z], [0, 0, 90]);
      b.part(new THREE.TorusGeometry(0.42, 0.04, 5, 10), GUN_D, { at: [s * 1.56, 0.62, z], rotation: [0, 90, 0] });
      G(C(0.22, 0.22, 0.06, 8, CYAN, [s * 1.56, 0.62, z], [0, 0, 90]), 1.3);
      // fender flare
      B(0.7, 0.1, 1.45, ARMOR, [s * 1.3, 1.34, z]);
      B(0.1, 0.34, 1.45, ARMOR_L, [s * 1.62, 1.2, z]);
      for (const k of [-1, 1]) B(0.08, 0.3, 0.1, HAZ, [s * 1.62, 1.2, z + k * 0.55]);
    }
  }

  // ---------- cab ----------
  const cabProfile: [number, number][] = [
    [2.3, 1.0], [4.6, 1.0], [4.6, 1.9], [4.2, 2.7], [3.0, 3.0], [2.3, 3.0],
  ];
  b.extrude(cabProfile, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.0, color: ARMOR, bevel: 0.03 });
  // armour overlays
  B(2.1, 0.5, 0.2, ARMOR_L, [0, 1.25, 4.62]); // hood plate
  B(2.1, 0.12, 0.3, GUN, [0, 1.52, 4.6]);
  // windshield
  G(B(1.8, 0.89, 0.05, GLASS, [0, 2.3, 4.43], [-26.6, 0, 0]), 0.9);
  G(B(1.5, 0.06, 0.06, CYAN, [0, 2.7, 4.22], [-26.6, 0, 0]), 1.2);
  B(1.9, 0.07, 0.07, GUN_D, [0, 1.88, 4.62]);
  for (const s of [1, -1]) {
    G(B(0.04, 0.5, 0.95, GLASS, [s * 1.01, 2.35, 3.7]), 0.8);
    B(0.06, 0.08, 1.05, GUN_D, [s * 1.02, 2.65, 3.7]);
    B(0.06, 0.08, 1.05, GUN_D, [s * 1.02, 2.08, 3.7]);
    B(0.06, 1.6, 0.08, GUN_D, [s * 1.02, 1.85, 3.1]); // door seam
    B(0.1, 0.12, 0.3, HAZ, [s * 1.04, 1.7, 3.2]); // handle block
    B(0.12, 0.7, 0.9, ARMOR_L, [s * 1.04, 1.5, 3.9]); // side armour
    // mirrors
    B(0.05, 0.3, 0.2, GUN_D, [s * 1.2, 2.2, 4.1]);
    B(0.1, 0.4, 0.04, GUN_D, [s * 1.15, 2.2, 4.0], [0, 0, 0]);
    // headlights
    G(B(0.4, 0.2, 0.08, LAMP, [s * 0.75, 1.68, 4.64]), 1.8);
    B(0.46, 0.04, 0.1, GUN_D, [s * 0.75, 1.82, 4.63]);
    // exhaust
    C(0.1, 0.1, 2.4, 6, METAL, [s * 1.0, 2.2, 2.0]);
    C(0.13, 0.13, 0.12, 6, GUN_D, [s * 1.0, 3.45, 2.0]);
    C(0.13, 0.13, 0.1, 6, HAZ, [s * 1.0, 1.6, 2.0]);
    // antennae
    C(0.015, 0.015, 1.3, 4, GUN_D, [s * 0.9, 3.65, 2.4], [0, 0, s * 6]);
    G(B(0.07, 0.07, 0.07, RED, [s * 0.98, 4.3, 2.4]), 2);
  }
  // grille
  B(1.3, 0.55, 0.06, GUN_D, [0, 1.35, 4.64]);
  for (let i = 0; i < 5; i++) G(B(1.1, 0.04, 0.05, CYAN, [0, 1.17 + i * 0.1, 4.68]), 1.2);
  // bumper + plough
  B(2.5, 0.45, 0.35, ARMOR, [0, 0.95, 4.75]);
  B(2.5, 0.08, 0.38, HAZ, [0, 1.2, 4.75]);
  for (let i = -3; i <= 3; i++) B(0.16, 0.38, 0.08, i % 2 ? GUN_D : HAZ, [i * 0.33, 0.95, 4.95]);
  b.extrude([[0, 0], [0.9, 0], [0.9, 0.35], [0.0, 0.1]], { at: [0, 0.45, 5.0], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.0, color: GUN })
    .mesh.visible = false;
  B(2.0, 0.4, 0.3, GUN, [0, 0.55, 5.0], [-30, 0, 0]); // wedge
  // roof lights
  B(1.5, 0.12, 0.22, GUN_D, [0, 3.07, 2.5]);
  for (let i = 0; i < 4; i++) G(B(0.3, 0.1, 0.18, i % 2 ? MAG : CYAN, [-0.55 + i * 0.37, 3.1, 2.5]), 1.8);

  // turret
  C(0.42, 0.48, 0.18, 8, GUN_D, [0, 3.1, 2.75]);
  B(0.8, 0.38, 0.9, ARMOR, [0, 3.4, 2.75]);
  B(0.84, 0.1, 0.5, HAZ, [0, 3.62, 2.7]);
  for (const s of [1, -1]) {
    C(0.05, 0.05, 1.1, 6, GUN_D, [s * 0.22, 3.4, 3.55], [90, 0, 0]);
    C(0.08, 0.08, 0.2, 6, METAL, [s * 0.22, 3.4, 4.1], [90, 0, 0]);
    G(C(0.03, 0.03, 0.03, 6, MAG, [s * 0.22, 3.4, 4.2], [90, 0, 0]), 2);
  }
  G(b.part(new THREE.SphereGeometry(0.1, 6, 4), CYAN, { at: [0, 3.6, 3.15] }), 2);

  // ---------- cargo pod ----------
  const PZ = -1.2;
  const PY = 2.6;
  for (const z of [1.2, -1.3, -3.4])
    for (const s of [1, -1]) B(0.3, 0.38, 0.4, GUN_D, [s * 0.8, 1.38, z]);
  b.extrude(oct(1.25, 1.05, 0.45), { at: [0, PY, PZ], x: [1, 0, 0], thickness: 5.6, color: POD, bevel: 0.03 });
  // end caps and ribs
  for (const z of [1.55, -3.95]) b.extrude(oct(1.33, 1.13, 0.48), { at: [0, PY, z], x: [1, 0, 0], thickness: 0.2, color: ARMOR });
  for (const z of [0.5, -0.8, -2.1, -3.2])
    b.extrude(oct(1.3, 1.1, 0.47), { at: [0, PY, z], x: [1, 0, 0], thickness: 0.14, color: GUN });
  for (const z of [0.5, -0.8, -2.1, -3.2]) G(B(1.0, 0.04, 0.16, CYAN, [0, PY + 1.11, z]), 1.0);

  for (const s of [1, -1]) {
    // side neon strips
    G(B(0.04, 0.07, 4.9, CYAN, [s * 1.27, PY + 0.35, PZ - 0.1]), 1.3);
    G(B(0.04, 0.07, 4.9, MAG, [s * 1.27, PY - 0.35, PZ - 0.1]), 1.3);
    // chamfer accent plates
    B(0.06, 0.08, 5.0, POD_L, [s * 1.05, PY + 0.9, PZ - 0.1], [0, 0, s * -45]);
    B(0.06, 0.08, 5.0, GUN, [s * 1.05, PY - 0.9, PZ - 0.1], [0, 0, s * 45]);
    // hazard chevrons near front
    for (let i = 0; i < 6; i++) B(0.03, 0.8, 0.16, i % 2 ? HAZ : GUN_D, [s * 1.27, PY, 1.2 - i * 0.22], [28, 0, 0]);
    // numbered ID panel
    B(0.04, 0.4, 0.9, GUN_D, [s * 1.27, PY, -1.0]);
    for (let i = 0; i < 3; i++) G(B(0.05, 0.22, 0.1, HAZ, [s * 1.29, PY, -0.75 - i * 0.25]), 1.0);
    // top corner handles
    B(0.1, 0.1, 0.5, METAL, [s * 0.8, PY + 1.1, 1.1]);
  }

  // roof gear
  B(1.2, 0.04, 1.0, GUN_D, [0, PY + 1.07, 0.1]);
  G(B(1.0, 0.03, 0.8, MAG, [0, PY + 1.09, 0.1]), 0.5);
  B(0.9, 0.05, 0.7, GUN, [0, PY + 1.12, 0.1]);
  for (let i = 0; i < 5; i++) B(1.0, 0.06, 0.06, GUN_D, [0, PY + 1.17, -1.5 - i * 0.2]);
  C(0.35, 0.05, 0.25, 8, METAL, [0.3, PY + 1.22, -2.8], [-30, 0, 0]);
  C(0.02, 0.02, 0.5, 4, GUN_D, [-0.4, PY + 1.35, -3.3]);
  G(B(0.07, 0.07, 0.07, RED, [-0.4, PY + 1.62, -3.3]), 2);

  // sealed rear door
  B(1.7, 1.5, 0.08, GUN, [0, PY, -4.08]);
  B(1.76, 0.1, 0.1, HAZ, [0, PY + 0.8, -4.1]);
  B(1.76, 0.1, 0.1, HAZ, [0, PY - 0.8, -4.1]);
  b.part(new THREE.TorusGeometry(0.42, 0.06, 5, 10), MAG, { at: [0, PY, -4.16] });
  G(b.part(new THREE.TorusGeometry(0.42, 0.06, 5, 10), MAG, { at: [0, PY, -4.17] }), 1.6);
  G(B(0.9, 0.1, 0.06, MAG, [0, PY, -4.2]), 1.6);
  G(B(0.1, 0.9, 0.06, MAG, [0, PY, -4.2]), 1.6);
  for (const s of [1, -1]) for (const y of [0.55, -0.55]) B(0.18, 0.18, 0.1, METAL, [s * 0.7, PY + y, -4.14]);

  // ---------- rear ----------
  B(2.5, 0.4, 0.3, ARMOR, [0, 0.95, -4.75]);
  for (const s of [1, -1]) {
    G(B(0.5, 0.16, 0.06, RED, [s * 0.8, 1.05, -4.93]), 1.8);
    B(0.1, 0.4, 0.5, GUN_D, [s * 1.05, 0.62, -4.2]); // mud flap
  }
  for (let i = -3; i <= 3; i++) B(0.16, 0.38, 0.06, i % 2 ? GUN_D : HAZ, [i * 0.33, 0.95, -4.92]);
  B(0.12, 0.7, 0.04, GUN_D, [-0.9, 0.9, -4.94]);
  B(0.4, 0.16, 0.04, LAMP, [0, 1.3, -4.94]); // plate

  // ---------- pod to cab coupling ----------
  B(1.2, 0.3, 0.7, GUN, [0, 1.35, 2.0]);
  G(B(0.8, 0.04, 0.1, CYAN, [0, 1.52, 2.0]), 1.2);
  C(0.04, 0.04, 1.2, 4, GUN_D, [0.4, 1.7, 1.9], [90, 0, 0]);
  C(0.04, 0.04, 1.2, 4, GUN_D, [-0.4, 1.8, 1.9], [90, 0, 0]);

  return b.root;
}
```