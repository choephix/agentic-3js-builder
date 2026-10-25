import * as THREE from "three";
import { createBuilder, type Builder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control interceptor with roof water cannon and neon light bars, cyberpunk style.",
};

export const REQUESTS = [
  {
    id: "roofLightBar",
    kind: "add",
    part: "roofPlate",
    what: "Neon light bar across the cab roof: slim housing, six lamps alternating CYAN and MAGENTA, brackets.",
    at: [0, 1.78, 0.2],
    normal: [0, 1, 0],
    bone: null,
    room: [1.6, 0.2, 0.3],
  },
  {
    id: "frontBar",
    kind: "add",
    part: "hull",
    what: "Front bumper neon strip with CYAN lamps, a mesh grille below it and two amber fog lamps.",
    at: [0, 0.75, 2.5],
    normal: [0, 0, 1],
    bone: null,
    room: [1.8, 0.5, 0.3],
  },
  {
    id: "cannonFittings",
    kind: "add",
    part: "cannonBarrel",
    what: "Water cannon fittings: muzzle ring with nozzle detail, pressure hoses to the turret, glowing CYAN coolant bands.",
    at: [0, 2.15, 1.4],
    normal: [0, 0, 1],
    bone: null,
    room: [0.5, 0.5, 1.0],
  },
  {
    id: "sideStripe",
    kind: "add",
    part: "hull",
    what: "Neon side stripe in MAGENTA along the left flank with small corporate emblem plate and door handle.",
    at: [1.0, 0.95, 0],
    normal: [1, 0, 0],
    bone: null,
    room: [0.2, 0.3, 2.4],
  },
  {
    id: "rearLights",
    kind: "add",
    part: "hull",
    what: "Rear tail light bar in RED neon, exhaust-vent stack, tow hook and license plate.",
    at: [0, 1.0, -2.5],
    normal: [0, 0, -1],
    bone: null,
    room: [1.8, 0.5, 0.3],
  },
  {
    id: "windowShield",
    kind: "add",
    part: "windshield",
    what: "Wire cage over the windshield, wiper blades, and small HUD-glow strip along the top edge.",
    at: [0, 1.5, 1.35],
    normal: [0, 0.5, 1],
    bone: null,
    room: [1.6, 0.6, 0.3],
  },
  {
    id: "wheelDetails",
    kind: "add",
    part: "wheelFL",
    what: "Wheel hubs: spoked rims with CYAN neon ring and lug nuts, brake calipers, for all four wheels.",
    at: [1.0, 0.45, 1.5],
    normal: [1, 0, 0],
    bone: null,
    room: [0.3, 0.8, 0.8],
  },
  {
    id: "roofAntenna",
    kind: "add",
    part: "roofPlate",
    what: "Antenna array at the rear of the roof: two whip antennas, a small dish, a sensor pod with a red blinking lamp.",
    at: [-0.5, 1.8, -0.8],
    normal: [0, 1, 0],
    bone: null,
    room: [0.6, 0.8, 0.6],
  },
  {
    id: "hullCamo",
    kind: "texture",
    part: "hull",
    what: "Corporate livery on hull: HULL navy with HULL_DARK hazard chevrons near the bottom skirt and a faded unit number on the doors.",
  },
  {
    id: "armorPlates",
    kind: "texture",
    part: "armor",
    what: "Scratched, scuffed armour plating with rivets and warning stencil text in YELLOW.",
  },
  {
    id: "cannonPaint",
    kind: "texture",
    part: "cannonBarrel",
    what: "Brushed steel with water-stain streaks and a MAGENTA corporate logo band.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const HULL = "#1c2233";
const HULL_DARK = "#10131d";
const ARMOR = "#2d3550";
const STEEL = "#6b7385";
const GLASS = "#0b2a3a";
const TIRE = "#0a0a0c";
const RIM = "#9aa3b5";
const CYAN = "#19f3ff";
const MAGENTA = "#ff2bd6";
const YELLOW = "#ffd21f";
const RED = "#ff2a3a";

export default function build() {
  const b = createBuilder({ name: "riotInterceptor" });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: string, at: number[], name?: string, rot?: number[]) =>
    b.part(g, c, { at: at as [number, number, number], name, rotation: rot as [number, number, number] | undefined });

  // chassis
  P(box(2.0, 0.5, 4.8), HULL_DARK, [0, 0.55, 0], "chassis");
  // main hull lower body
  P(box(2.1, 0.55, 4.6), HULL, [0, 0.95, 0], "hull");
  // hood sloped
  P(box(1.9, 0.3, 1.5), HULL, [0, 1.15, 1.6], "hood", [8, 0, 0]);
  // cab
  P(box(1.9, 0.7, 2.2), HULL, [0, 1.45, -0.3], "cab");
  P(box(1.7, 0.1, 2.0), ARMOR, [0, 1.83, -0.3], "roofPlate");
  // windshield
  P(box(1.7, 0.55, 0.08), GLASS, [0, 1.5, 0.85], "windshield", [-28, 0, 0]);
  // side windows
  for (const s of [1, -1]) {
    P(box(0.06, 0.4, 1.5), GLASS, [s * 0.96, 1.5, -0.3], "sideWindow");
    P(box(0.12, 0.45, 2.0), ARMOR, [s * 1.0, 0.95, -0.2], "armor");
    P(box(0.1, 0.25, 0.9), ARMOR, [s * 1.0, 0.95, 1.5], "armor");
  }
  P(box(1.7, 0.4, 0.08), GLASS, [0, 1.5, -1.42], "rearWindow");
  // bumpers
  P(box(2.2, 0.35, 0.35), ARMOR, [0, 0.6, 2.45], "armor");
  P(box(2.2, 0.15, 0.2), STEEL, [0, 0.4, 2.55], "ramBar");
  P(box(2.2, 0.35, 0.3), ARMOR, [0, 0.65, -2.4], "armor");
  // fenders / wheel arches
  const wheelPos: [string, number, number][] = [
    ["wheelFL", 1, 1.55], ["wheelFR", -1, 1.55], ["wheelRL", 1, -1.55], ["wheelRR", -1, -1.55],
  ];
  for (const [n, s, z] of wheelPos) {
    P(box(0.35, 0.18, 1.1), HULL_DARK, [s * 1.05, 0.85, z], "arch");
    P(new THREE.CylinderGeometry(0.46, 0.46, 0.38, 14), TIRE, [s * 1.0, 0.46, z], n, [0, 0, 90]);
    P(new THREE.CylinderGeometry(0.28, 0.28, 0.4, 10), RIM, [s * 1.0, 0.46, z], "rim", [0, 0, 90]);
    glow(P(new THREE.CylinderGeometry(0.2, 0.2, 0.42, 10), CYAN, [s * 1.0, 0.46, z], "rimGlow", [0, 0, 90]), 1);
  }
  // turret + water cannon
  P(new THREE.CylinderGeometry(0.4, 0.46, 0.2, 10), ARMOR, [0, 1.98, -0.6], "turretBase");
  P(box(0.6, 0.35, 0.7), HULL, [0, 2.2, -0.5], "turret");
  P(new THREE.CylinderGeometry(0.1, 0.12, 1.6, 10), STEEL, [0, 2.25, 0.4], "cannonBarrel", [90, 0, 0]);
  P(new THREE.CylinderGeometry(0.14, 0.1, 0.25, 10), ARMOR, [0, 2.25, 1.3], "cannonMuzzle", [90, 0, 0]);
  P(new THREE.CylinderGeometry(0.22, 0.22, 0.4, 10), STEEL, [0, 2.0, -1.2], "tank", [0, 0, 90]);
  // lights
  glow(P(box(1.4, 0.07, 0.07), CYAN, [0, 1.93, 0.55], "lightBarFront"), 1.5);
  glow(P(box(1.5, 0.08, 0.05), CYAN, [0, 0.75, 2.64], "bumperNeon"), 1.4);
  glow(P(box(1.5, 0.08, 0.05), RED, [0, 1.0, -2.32], "tailNeon"), 1.4);
  for (const s of [1, -1]) {
    glow(P(box(0.05, 0.06, 1.8), MAGENTA, [s * 1.07, 0.85, -0.1], "sideNeon"), 1.2);
    glow(P(box(0.22, 0.12, 0.05), YELLOW, [s * 0.7, 0.95, 2.34], "headlamp"), 1.2);
  }

  for (const add of STAGE2) add(b);
  return b.root;
}
