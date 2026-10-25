import * as THREE from "three";
import { createBuilder, type Builder } from "../../../../src/index";

export const meta = { name: "Railgun Carrier", description: "Six-wheeled railgun carrier braced on stabiliser legs, low-poly sci-fi military." };

export const REQUESTS = [
  { id: "roofLightBar", kind: "add", part: "cab", what: "Slim light bar across the cab roof: housing, four lamps alternating CYAN and AMBER, brackets.", at: [0, 2.55, 3.3], normal: [0, 1, 0], bone: null, room: [1.8, 0.25, 0.4] },
  { id: "railMuzzle", kind: "add", part: "barrel", what: "Muzzle brake: flared collar, side vents and glowing CYAN coil rings around the barrel tip.", at: [0, 3.0, 8.8], normal: [0, 0, 1], bone: null, room: [0.8, 0.8, 1.2] },
  { id: "railCoils", kind: "add", part: "barrel", what: "Series of CYAN glowing accelerator coil rings with dark brackets along the barrel.", at: [0, 3.0, 5.5], normal: [0, 1, 0], bone: null, room: [0.7, 0.7, 4] },
  { id: "cabGrille", kind: "add", part: "cab", what: "Armoured front grille with horizontal slats and two headlamps in AMBER glow.", at: [0, 1.4, 4.65], normal: [0, 0, 1], bone: null, room: [1.8, 0.8, 0.2] },
  { id: "antennaArray", kind: "add", part: "hull", what: "Antenna array: two whip antennas and a small radar dish with base on rear deck.", at: [-1.0, 2.3, -2.5], normal: [0, 1, 0], bone: null, room: [0.8, 1.5, 0.8] },
  { id: "padFittings", kind: "add", part: "legPads", what: "Hydraulic piston details, hazard stripes and bolts on four stabiliser legs.", at: [1.9, 0.5, 0], normal: [1, 0, 0], bone: null, room: [0.6, 1, 1] },
  { id: "exhaustStacks", kind: "add", part: "hull", what: "Twin exhaust stacks with caps behind the cab.", at: [1.0, 2.4, 2.2], normal: [0, 1, 0], bone: null, room: [0.5, 0.8, 0.5] },
  { id: "sideLights", kind: "add", part: "hull", what: "Row of small marker lights and tool boxes along each hull side.", at: [1.45, 1.4, 0], normal: [1, 0, 0], bone: null, room: [0.3, 0.4, 6] },
  { id: "hullCamo", kind: "texture", part: "hull", what: "Digital camo in HULL and HULL_DARK on hull top and sides, with a faded unit number near the rear." },
  { id: "cabMarks", kind: "texture", part: "cab", what: "Windscreen glass gradient and a white emblem plus stencilled serial on the cab doors." },
  { id: "railPanel", kind: "texture", part: "railHousing", what: "Riveted panel seams and warning chevrons in HAZARD on the railgun housing." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const HULL = "#59664a", HULL_DARK = "#3d4734", METAL = "#2c3036", STEEL = "#6b727c", GLASS = "#3b6c80";
const TIRE = "#16171a", RIM = "#8a9099", HAZARD = "#e0b020", CYAN = "#40e8ff", AMBER = "#ffb040";

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const box = (w: number, h: number, d: number, c: string, at: number[], name?: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, name, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, c: string, at: number[], dir: number[], seg = 8, name?: string) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at, dir, name });

  // chassis
  box(3.0, 0.5, 9.0, METAL, [0, 0.9, 0], "chassis");
  box(2.8, 0.9, 6.0, HULL, [0, 1.5, -1.2], "hull");
  box(2.9, 0.12, 6.1, HULL_DARK, [0, 1.98, -1.2], "hullTop");
  // sloped front hull
  box(2.8, 0.9, 1.2, HULL, [0, 1.4, 2.6], "hullFront", [-12, 0, 0]);
  // cab
  box(2.6, 1.2, 1.8, HULL, [0, 1.75, 3.7], "cab");
  box(2.4, 0.5, 0.1, GLASS, [0, 2.0, 4.62], "windscreen", [-18, 0, 0]);
  box(0.1, 0.45, 1.2, GLASS, [1.31, 2.0, 3.7]);
  box(0.1, 0.45, 1.2, GLASS, [-1.31, 2.0, 3.7]);
  box(2.7, 0.15, 1.9, HULL_DARK, [0, 2.4, 3.7]);
  box(2.9, 0.4, 0.5, METAL, [0, 0.75, 4.7], "bumper");
  // fenders
  for (const s of [1, -1]) box(0.5, 0.12, 8, HULL_DARK, [s * 1.55, 1.2, 0.3], "fender");

  // wheels
  const zs = [3.3, 0.3, -2.7];
  for (const s of [1, -1]) for (const z of zs) {
    const x = s * 1.7;
    cyl(0.75, 0.75, 0.6, TIRE, [x, 0.75, z], [1, 0, 0], 10, "tire");
    cyl(0.45, 0.45, 0.64, RIM, [x, 0.75, z], [1, 0, 0], 8, "rim");
    cyl(0.15, 0.15, 0.7, METAL, [x + s * 0.02, 0.75, z], [1, 0, 0], 6, "hub");
    cyl(0.1, 0.1, 1.0, STEEL, [s * 1.0, 0.7, z], [1, 0, 0], 6, "axle");
  }

  // stabiliser legs (deployed), 4 corners
  for (const s of [1, -1]) for (const z of [2.0, -3.4]) {
    box(0.4, 0.3, 0.4, METAL, [s * 1.65, 0.9, z], "legMount");
    b.rod([s * 1.7, 0.9, z], [s * 2.5, 0.35, z], 0.14, STEEL, { name: "legStrut" });
    cyl(0.1, 0.1, 0.9, STEEL, [s * 2.5, 0.5, z], [0, 1, 0], 6, "piston");
    b.part(new THREE.CylinderGeometry(0.5, 0.6, 0.12, 8), METAL, { at: [s * 2.5, 0.06, z], name: "legPads" });
    box(0.3, 0.05, 0.3, HAZARD, [s * 2.5, 0.14, z]);
  }

  // railgun mount + housing
  cyl(1.0, 1.1, 0.25, METAL, [0, 2.1, -1.5], [0, 1, 0], 12, "turretRing");
  box(1.7, 0.7, 2.6, HULL, [0, 2.6, -1.5], "railHousing");
  box(1.5, 0.12, 2.4, HULL_DARK, [0, 3.0, -1.5]);
  for (const s of [1, -1]) {
    box(0.2, 0.9, 1.4, HULL_DARK, [s * 0.95, 2.6, -1.5], "cheek");
    box(0.3, 0.25, 6.0, STEEL, [s * 0.35, 2.95, 2.8], "railRail");
  }
  // barrel
  cyl(0.28, 0.28, 8.6, METAL, [0, 3.05, 3.2], [0, 0, 1], 8, "barrel");
  cyl(0.38, 0.38, 1.0, STEEL, [0, 3.05, 7.6], [0, 0, 1], 8, "barrelSleeve");
  cyl(0.45, 0.35, 0.5, METAL, [0, 3.05, 8.3], [0, 0, 1], 8, "muzzle");
  box(1.3, 0.6, 0.6, METAL, [0, 2.9, 0.2]);
  // rear
  box(2.8, 0.4, 0.4, METAL, [0, 1.0, -4.7], "rearBeam");
  for (const s of [1, -1]) box(0.3, 0.2, 0.1, "#c02020", [s * 1.1, 1.3, -4.52]);
  // cab lights
  for (const s of [1, -1]) box(0.3, 0.2, 0.1, AMBER, [s * 0.9, 1.3, 4.65]);
  // ammo bins
  for (const s of [1, -1]) box(0.5, 0.6, 1.8, HULL_DARK, [s * 1.2, 2.3, -3.6]);

  for (const add of STAGE2) add(b);
  return b.root;
}
