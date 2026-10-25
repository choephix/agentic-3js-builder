import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

export const meta = {
  name: "Wraith-7 Armored Hauler 2077",
  description: "Low-poly cyberpunk militarized six-wheel truck with armored cab, rear cargo bay and roof turret.",
};

export const REQUESTS = [
  { id: "roofLightBar", kind: "add", part: "cab", what: "Neon light bar across the cab roof front: slim housing, six lamps alternating CYAN and MAGENTA, brackets.", at: [0, 2.62, 1.9], normal: [0, 1, 0], bone: null, room: [1.8, 0.2, 0.3] },
  { id: "grille", kind: "add", part: "hood", what: "Front armoured grille: horizontal slats in STEEL with glowing CYAN strips behind, and a central emblem.", at: [0, 1.15, 3.42], normal: [0, 0, 1], bone: null, room: [1.8, 0.8, 0.2] },
  { id: "turretGun", kind: "add", part: "turretBase", what: "Roof turret gun: twin barrels with muzzle brakes, ammo box, sensor eye glowing MAGENTA, cable feed.", at: [0, 3.1, 0.3], normal: [0, 1, 0], bone: null, room: [0.9, 0.7, 1.4] },
  { id: "antennaArray", kind: "add", part: "cargo", what: "Antenna array at cargo front-left roof: three whip antennas of different height, a dish, blinking red tip lamps.", at: [1.0, 3.0, -1.0], normal: [0, 1, 0], bone: null, room: [0.6, 1.2, 0.6] },
  { id: "sideVents", kind: "add", part: "cargo", what: "Exhaust vents and heat fins along both cargo sides with orange glow slits.", at: [1.28, 1.9, -3.2], normal: [1, 0, 0], bone: null, room: [0.2, 0.9, 2.5] },
  { id: "headlights", kind: "add", part: "hood", what: "Pair of angular headlamps with CYAN lens, bezel and small DRL strips under them.", at: [0.8, 1.05, 3.4], normal: [0, 0, 1], bone: null, room: [0.7, 0.3, 0.2] },
  { id: "armorSkirts", kind: "add", part: "chassis", what: "Layered armour skirts and side plates over wheel arches with bolts and hazard stripes.", at: [1.3, 0.8, 0.0], normal: [1, 0, 0], bone: null, room: [0.2, 0.6, 6.0] },
  { id: "rearDoors", kind: "add", part: "cargo", what: "Rear cargo double door detail: hinges, locking bars, tail lights in RED, and a hazard-striped bumper.", at: [0, 1.9, -6.0], normal: [0, 0, -1], bone: null, room: [2.4, 1.8, 0.3] },
  { id: "exhaustStacks", kind: "add", part: "cab", what: "Twin vertical exhaust stacks behind cab with heat shields and glowing rings.", at: [1.2, 2.3, -0.55], normal: [0, 1, 0], bone: null, room: [0.5, 1.4, 0.4] },
  { id: "windowHud", kind: "add", part: "cab", what: "Windshield HUD overlay lines and cab side window frames with cyan reflections.", at: [0, 2.1, 2.2], normal: [0, 0, 1], bone: null, room: [1.6, 0.6, 0.2] },
  { id: "hullCamo", kind: "texture", part: "cargo", what: "Dark urban digital camo in HULL and HULL_DARK on cargo sides, faded unit number near rear." },
  { id: "cabPaint", kind: "texture", part: "cab", what: "Panel seams, scratches and a magenta racing stripe along the cab sides." },
  { id: "hoodPaint", kind: "texture", part: "hood", what: "Hazard chevrons and worn edge paint on the hood." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const HULL = "#4a5560";
export const HULL_DARK = "#2c333b";
export const STEEL = "#8b95a1";
export const BLACK = "#14161b";
export const TIRE = "#1b1c20";
export const CYAN = "#19f0ff";
export const MAGENTA = "#ff2bd6";
export const ORANGE = "#ff8a1f";
export const RED = "#ff2a3a";
export const GLASS = "#0b2a3c";
export const HAZARD = "#f2c40f";

export default function build() {
  const b = createBuilder({ name: "truck2077" });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: string, at: number[], name?: string, rot?: number[]) =>
    b.part(g, c, { at, name, rotation: rot, flat: true } as any);

  // chassis
  P(box(2.2, 0.5, 11), HULL_DARK, [0, 0.75, -0.5], "chassis");
  P(box(1.9, 0.3, 10.5), BLACK, [0, 0.5, -0.5], "underbody");

  // wheels: 3 axles
  const wz = [2.4, -1.6, -4.0];
  for (const z of wz)
    for (const s of [1, -1]) {
      const wheel = new THREE.CylinderGeometry(0.62, 0.62, 0.55, 10);
      P(wheel, TIRE, [s * 1.2, 0.62, z], "wheel", [0, 0, 90]);
      P(new THREE.CylinderGeometry(0.34, 0.34, 0.6, 8), STEEL, [s * 1.2, 0.62, z], "hub", [0, 0, 90]);
      P(new THREE.CylinderGeometry(0.12, 0.12, 0.64, 6), CYAN, [s * 1.2, 0.62, z], "hubGlow", [0, 0, 90]);
      P(box(0.12, 0.08, 1.5), HULL, [s * 1.2, 1.28, z], "fender");
    }
  // axles
  for (const z of wz) P(new THREE.CylinderGeometry(0.1, 0.1, 2.4, 6), BLACK, [0, 0.62, z], "axle", [0, 0, 90]);

  // hood
  P(box(2.0, 0.8, 1.6), HULL, [0, 1.3, 2.6], "hood");
  P(box(1.8, 0.2, 1.2), HULL_DARK, [0, 1.8, 2.5], "hoodTop", [-8, 0, 0]);
  P(box(2.1, 0.5, 0.25), STEEL, [0, 0.9, 3.45], "bumper");
  P(box(1.6, 0.5, 0.05), BLACK, [0, 1.2, 3.42], "grillePlate");
  for (const s of [1, -1]) P(box(0.5, 0.18, 0.06), CYAN, [s * 0.8, 1.55, 3.42], "headlampBase");

  // cab
  P(box(2.2, 1.4, 1.8), HULL, [0, 2.0, 1.2], "cab");
  P(box(2.0, 0.5, 1.6), HULL_DARK, [0, 2.9, 1.1], "cabRoof");
  P(box(1.9, 0.7, 0.08), GLASS, [0, 2.2, 2.12], "windshield", [-12, 0, 0]);
  for (const s of [1, -1]) P(box(0.06, 0.6, 1.1), GLASS, [s * 1.12, 2.3, 1.2], "sideWindow");
  for (const s of [1, -1]) P(box(0.2, 0.25, 0.3), STEEL, [s * 1.25, 2.3, 2.0], "mirror");

  // cargo box
  P(box(2.6, 2.2, 6.2), HULL, [0, 2.1, -3.0], "cargo");
  P(box(2.7, 0.2, 6.3), HULL_DARK, [0, 3.25, -3.0], "cargoRoof");
  P(box(2.7, 0.2, 6.3), HULL_DARK, [0, 1.0, -3.0], "cargoBase");
  for (let i = 0; i < 5; i++) for (const s of [1, -1])
    P(box(0.08, 2.0, 0.15), STEEL, [s * 1.33, 2.1, -0.4 - i * 1.3], "rib");
  for (let i = 0; i < 4; i++) P(box(2.5, 0.12, 0.2), HAZARD, [0, 3.38, -1.0 - i * 1.5], "roofStripe");
  P(box(2.4, 1.8, 0.1), HULL_DARK, [0, 2.0, -6.15], "rearDoor");
  P(box(2.7, 0.35, 0.3), HAZARD, [0, 0.95, -6.3], "rearBumper");
  for (const s of [1, -1]) P(box(0.3, 0.2, 0.08), RED, [s * 1.0, 2.9, -6.22], "tailLight");
  // coupling gap between cab and cargo
  P(box(2.0, 0.6, 0.6), BLACK, [0, 1.9, -0.1], "coupling");

  // turret
  P(new THREE.CylinderGeometry(0.55, 0.65, 0.3, 8), HULL_DARK, [0, 3.0, 0.3], "turretBase");
  P(box(0.7, 0.4, 0.8), HULL, [0, 3.3, 0.3], "turretHead");
  P(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 6), STEEL, [0.15, 3.35, 0.95], "barrel", [90, 0, 0]);
  P(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 6), STEEL, [-0.15, 3.35, 0.95], "barrel", [90, 0, 0]);
  P(new THREE.SphereGeometry(0.08, 6, 4), MAGENTA, [0, 3.35, 0.72], "turretEye");

  // exhaust stacks
  for (const s of [1, -1]) P(new THREE.CylinderGeometry(0.12, 0.12, 1.3, 8), STEEL, [s * 1.2, 2.3, -0.55], "stack");

  // side neon strips
  for (const s of [1, -1]) P(box(0.04, 0.06, 5.5), MAGENTA, [s * 1.32, 1.15, -3.0], "sideNeon");
  for (const s of [1, -1]) P(box(0.04, 0.06, 1.2), CYAN, [s * 1.12, 1.45, 1.5], "cabNeon");

  void rng;
  for (const add of STAGE2) add(b);
  return b.root;
}
