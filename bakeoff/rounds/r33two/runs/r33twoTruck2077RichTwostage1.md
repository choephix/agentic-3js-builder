```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const meta = {
  name: "Vanguard-77 Armored Truck",
  description: "Low-poly cyberpunk militarized 6x6 truck from 2077: armored cab, cargo bed with turret ring, neon accents.",
};

export const REQUESTS = [
  { id: "roofLightBar", kind: "add", part: "cab", what: "Neon light bar across the cab roof: slim housing, six lamps alternating CYAN and MAGENTA, brackets.", at: [0, 2.55, 1.6], normal: [0, 1, 0], bone: null, room: [1.8, 0.25, 0.35] },
  { id: "frontGrille", kind: "add", part: "grille", what: "Armoured grille: horizontal slats in STEEL_DARK, a glowing CYAN strip, a hex emblem in the centre.", at: [0, 1.05, 3.52], normal: [0, 0, 1], bone: null, room: [1.5, 0.7, 0.2] },
  { id: "turret", kind: "add", part: "turretRing", what: "Remote weapon station on the ring: rotating box mount, twin gun barrels with muzzle brakes, ammo box, sensor eye in RED.", at: [0, 2.3, -1.4], normal: [0, 1, 0], bone: null, room: [1.2, 0.9, 1.6] },
  { id: "antennaArray", kind: "add", part: "cab", what: "Antenna cluster behind the cab: whip antennas, a dish, a blinking MAGENTA beacon.", at: [0.8, 2.6, 0.3], normal: [0, 1, 0], bone: null, room: [0.5, 1.0, 0.5] },
  { id: "sideArmor", kind: "add", part: "hullSide", what: "Bolted armour plates and ERA tiles on the left cargo wall with rivets and a CYAN stripe.", at: [1.25, 1.7, -1.0], normal: [1, 0, 0], bone: null, room: [0.2, 1.0, 3.0] },
  { id: "exhausts", kind: "add", part: "cab", what: "Pair of vertical exhaust stacks behind the cab with heat shields and glowing orange tips.", at: [-1.1, 2.0, 0.0], normal: [0, 1, 0], bone: null, room: [0.4, 1.2, 0.4] },
  { id: "rearModule", kind: "add", part: "bed", what: "Rear: tail light strip in RED, cable bundles, tow hitch, rear hatch handle and hazard emblem.", at: [0, 1.5, -3.3], normal: [0, 0, -1], bone: null, room: [2.0, 1.0, 0.3] },
  { id: "windshieldHud", kind: "add", part: "windshield", what: "Tinted windshield frame with wipers, a CYAN HUD glow strip on the dash edge and sensor pods.", at: [0, 2.0, 2.2], normal: [0, 0.4, 1], bone: null, room: [1.8, 0.8, 0.3] },
  { id: "hullCamo", kind: "texture", part: "hullSide", what: "Urban digital camo in HULL and HULL_DARK on both hull sides, with a faded unit number near the rear." },
  { id: "hoodDecal", kind: "texture", part: "hood", what: "Hazard chevrons in YELLOW and BLACK across the front of the hood and a small MAGENTA kanji emblem." },
  { id: "bedGraffiti", kind: "texture", part: "bed", what: "Worn corporate logos and neon graffiti on the bed top and tailgate." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const HULL = "#4a5a52";
export const HULL_DARK = "#2e3833";
export const STEEL_DARK = "#20242b";
export const STEEL = "#5b6470";
export const GLASS = "#10222e";
export const CYAN = "#19e6ff";
export const MAGENTA = "#ff2bd6";
export const RED = "#ff3030";
export const YELLOW = "#f2c418";
export const TIRE = "#101114";
export const RIM = "#8a909a";
export const ORANGE = "#ff8a1c";

export default function build() {
  const b = createBuilder({ name: "truck2077" });

  const box = (w: number, h: number, d: number, c: string, at: number[], name?: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as [number, number, number], name, rotation: rot as [number, number, number] | undefined });

  // chassis
  box(2.2, 0.35, 7, STEEL_DARK, [0, 0.8, 0], "chassis");
  box(2.0, 0.15, 6.6, HULL_DARK, [0, 0.55, 0], "underguard");

  // wheels: three axles
  for (const z of [2.3, -0.4, -2.4]) {
    for (const s of [1, -1]) {
      const x = s * 1.2;
      b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.55, 14), TIRE, { at: [x, 0.62, z], dir: [1, 0, 0], name: "tire" });
      b.part(new THREE.CylinderGeometry(0.36, 0.36, 0.58, 8), RIM, { at: [x, 0.62, z], dir: [1, 0, 0], name: "rim" });
      b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.62, 6), STEEL_DARK, { at: [x, 0.62, z], dir: [1, 0, 0] });
      b.part(new THREE.TorusGeometry(0.3, 0.025, 4, 12), CYAN, { at: [x + s * 0.3, 0.62, z], dir: [1, 0, 0], axis: "z" });
      // fender
      box(0.7, 0.12, 1.5, HULL_DARK, [s * 1.2, 1.3, z], "fender");
    }
  }
  for (const z of [2.3, -0.4, -2.4]) box(2.6, 0.18, 0.2, STEEL_DARK, [0, 0.62, z]);

  // cab
  box(2.3, 1.2, 2.2, HULL, [0, 1.65, 1.9], "cab");
  box(2.1, 0.7, 1.5, HULL, [0, 2.45, 1.6], "cab");
  box(2.0, 0.55, 0.05, GLASS, [0, 2.4, 2.38], "windshield", [-18, 0, 0]);
  for (const s of [1, -1]) {
    box(0.05, 0.5, 1.0, GLASS, [s * 1.07, 2.4, 1.6], "sideWindow");
    box(0.06, 0.9, 1.4, HULL_DARK, [s * 1.17, 1.6, 1.9], "door");
    box(0.12, 0.3, 0.1, STEEL, [s * 1.2, 1.9, 2.6]);
  }
  // hood
  box(2.2, 0.8, 1.5, HULL, [0, 1.35, 3.0], "hood");
  box(2.25, 0.1, 1.2, HULL_DARK, [0, 1.8, 3.0]);
  box(1.8, 0.6, 0.1, STEEL_DARK, [0, 1.1, 3.52], "grille");
  box(2.4, 0.3, 0.3, STEEL, [0, 0.7, 3.6], "bumper");
  for (const s of [1, -1]) {
    box(0.35, 0.15, 0.08, CYAN, [s * 0.8, 1.55, 3.76]);
    box(0.4, 0.2, 0.1, STEEL_DARK, [s * 0.8, 1.55, 3.72]);
  }
  // cab roof armor
  box(2.2, 0.08, 1.7, STEEL_DARK, [0, 2.84, 1.6]);

  // hull / cargo bed
  box(2.5, 1.5, 4.8, HULL, [0, 1.9, -1.4], "bed");
  for (const s of [1, -1]) {
    box(0.1, 1.2, 4.5, HULL, [s * 1.27, 1.9, -1.4], "hullSide");
    for (let i = 0; i < 4; i++) box(0.14, 1.3, 0.1, HULL_DARK, [s * 1.3, 1.9, -3.2 + i * 1.2]);
  }
  box(2.6, 0.12, 4.9, HULL_DARK, [0, 2.69, -1.4], "bedTop");
  box(2.4, 1.3, 0.12, HULL_DARK, [0, 1.9, -3.85], "tailgate");

  // turret ring
  b.part(new THREE.CylinderGeometry(0.8, 0.9, 0.2, 12), STEEL_DARK, { at: [0, 2.85, -1.4], name: "turretRing" });
  b.part(new THREE.TorusGeometry(0.85, 0.04, 4, 16), CYAN, { at: [0, 2.96, -1.4], dir: [0, 1, 0], axis: "z" });

  // cab-bed gap pipes
  for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 6), STEEL, { at: [s * 1.1, 2.4, 0.5] });

  for (const add of STAGE2) add(b);
  return b.root;
}
```