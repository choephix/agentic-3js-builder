```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Aegis-77 Armoured Hauler",
  description: "Low-poly cyberpunk 6x6 militarized truck from 2077: armoured cab, container bed, railgun turret, neon trim.",
};

export const REQUESTS = [
  {
    id: "roofLightBar", kind: "add", part: "cabRoof",
    what: "Neon light bar across the front of the cab roof: slim dark housing, six lamps alternating CYAN and MAGENTA, end brackets and a small amber beacon at each end.",
    at: [0, 3.3, 2.6], normal: [0, 1, 0], bone: null, room: [2.2, 0.3, 0.4],
  },
  {
    id: "frontGrille", kind: "add", part: "cab",
    what: "Aggressive front grille on the cab nose: angled armoured slats in HULL_DARK, inner CYAN glow strips between them, a central emblem plate and a frame in STEEL.",
    at: [0, 1.78, 3.98], normal: [0, 0, 1], bone: null, room: [2.2, 0.6, 0.25],
  },
  {
    id: "turretFittings", kind: "add", part: "turretBody",
    what: "Railgun turret detailing: capacitor coils along the barrels (CYAN rings), heat-sink fins, ammo feed box on the side, targeting sensor dome on top with a MAGENTA lens, and muzzle brakes.",
    at: [0, 3.6, -0.5], normal: [0, 1, 0], bone: null, room: [1.6, 0.8, 2.2],
  },
  {
    id: "antennaArray", kind: "add", part: "bedRoof",
    what: "Comms antenna array on the rear of the bed roof: a mast cluster of four whips of different heights, a dish, a flat phased-array panel and blinking AMBER tip lamps.",
    at: [0.8, 3.1, -3.2], normal: [0, 1, 0], bone: null, room: [1.2, 1.4, 1.2],
  },
  {
    id: "sideRocketPodL", kind: "add", part: "hullSideL",
    what: "Left side missile pod (mirror on the right as a pair): 2x3 launch tubes in HULL_DARK with STEEL rims, WARN hazard stripe, mounting arms to the bed wall.",
    at: [1.5, 2.3, -1.55], normal: [1, 0, 0], bone: null, room: [0.5, 1.0, 1.4],
  },
  {
    id: "cableBundles", kind: "add", part: "chassis",
    what: "Underbody details: thick cable bundles, hydraulic lines in CYAN-sheathed hose, a driveshaft per axle, differential housings and a fuel tank on each side.",
    at: [0, 0.8, -0.6], normal: [0, -1, 0], bone: null, room: [2.0, 0.6, 6.0],
  },
  {
    id: "rearRamp", kind: "add", part: "bedCore",
    what: "Rear cargo door: split armoured doors with hinge plates, a central locking bar, red tail light clusters, a hazard-striped bumper, and a faded licence plate with neon frame.",
    at: [0, 2.2, -4.05], normal: [0, 0, -1], bone: null, room: [2.8, 1.6, 0.3],
  },
  {
    id: "cabArmor", kind: "add", part: "cab",
    what: "Cab armour kit: bolt-on armour plates over the doors, bullet-shield window slits frames, a bull bar with two amber fog lights, and side mirrors with cameras.",
    at: [1.32, 2.2, 2.6], normal: [1, 0, 0], bone: null, room: [0.3, 1.2, 1.8],
  },
  {
    id: "hullCamo", kind: "texture", part: "hullSideL",
    what: "Night-city digital camo on the bed side panels (both hullSideL and hullSideR) in HULL, HULL_DARK and HULL_LIGHT, with a faded unit number and a small CYAN circuit-line motif.",
  },
  {
    id: "cabPaint", kind: "texture", part: "cab",
    what: "Cab side panels: scuffed military paint in HULL with chipped edges to STEEL, a diagonal WARN stripe near the rear and a MAGENTA corporate emblem on the door.",
  },
  {
    id: "roofPlates", kind: "texture", part: "bedRoof",
    what: "Bed roof: panelled plating with rivets, hatch outlines, anti-slip grid and faint CYAN glyph markings.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

// Palette
export const HULL = "#3b4450";
export const HULL_DARK = "#242a33";
export const HULL_LIGHT = "#566170";
export const STEEL = "#7b828d";
export const TIRE = "#15161a";
export const RIM = "#8a919c";
export const GLASS = "#0d2b3b";
export const BLACK = "#0b0c10";
export const CYAN = "#19f3ff";
export const MAGENTA = "#ff2bd6";
export const AMBER = "#ffb020";
export const WARN = "#d9c21e";
export const RED = "#ff2a3a";

export default function build() {
  const b = createBuilder({ name: "truck2077" });
  const R = rng(7);

  const box = (name: string, color: string, size: [number, number, number], at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, name, rotation: rot });
  const cyl = (name: string, color: string, r: number, h: number, at: [number, number, number], dir: [number, number, number], seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, name, dir });

  // Chassis
  box("chassis", HULL_DARK, [1.9, 0.35, 7.8], [0, 1.0, 0]);
  for (const s of [1, -1]) {
    box("rail", BLACK, [0.22, 0.4, 8.2], [s * 0.8, 0.9, 0]);
    box("underglow", CYAN, [0.06, 0.06, 6.4], [s * 1.0, 0.62, -0.2]);
    glow(b.part(new THREE.BoxGeometry(0.06, 0.06, 6.4), CYAN, { at: [s * 1.0, 0.6, -0.2], name: "underglowL" }), 1.4);
  }
  for (const z of [3.2, 1.6, 0, -1.8, -3.6]) box("crossmember", BLACK, [2.2, 0.2, 0.2], [0, 0.8, z]);
  box("cabChassis", HULL_DARK, [2.0, 0.5, 2.6], [0, 1.25, 2.6]);

  // Wheels
  for (const cz of [2.7, -1.0, -2.6])
    for (const s of [1, -1]) {
      const cx = s * 1.3;
      cyl("tire", TIRE, 0.7, 0.55, [cx, 0.7, cz], [1, 0, 0], 14);
      cyl("rim", RIM, 0.42, 0.58, [cx, 0.7, cz], [1, 0, 0], 8);
      cyl("rimInner", HULL_DARK, 0.3, 0.6, [cx + s * 0.005, 0.7, cz], [1, 0, 0], 8);
      glow(b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.64, 8), CYAN, { at: [cx, 0.7, cz], dir: [1, 0, 0], name: "hubGlow" }), 1.3);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        box("lug", TIRE, [0.57, 0.12, 0.2], [cx, 0.7 + 0.7 * Math.cos(a), cz + 0.7 * Math.sin(a)], [(a * 180) / Math.PI, 0, 0]);
      }
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(new THREE.SphereGeometry(0.04, 5, 4), STEEL, { at: [cx + s * 0.3, 0.7 + 0.22 * Math.cos(a), cz + 0.22 * Math.sin(a)], name: "lugnut" });
      }
      // fender
      box("fender", HULL, [0.75, 0.1, 1.7], [cx, 1.5, cz]);
      box("fenderLip", HULL_LIGHT, [0.08, 0.3, 1.7], [cx + s * 0.36, 1.38, cz]);
    }
  // axles
  for (const z of [2.7, -1.0, -2.6]) cyl("axle", BLACK, 0.09, 2.6, [0, 0.7, z], [1, 0, 0], 6);
  for (const z of [-1.0, -2.6]) box("diff", HULL_DARK, [0.5, 0.45, 0.5], [0, 0.7, z]);

  // Cab (side profile extrude, z along drawing x)
  b.extrude(
    [[1.4, 1.45], [3.9, 1.45], [3.95, 2.1], [3.4, 2.3], [2.8, 3.2], [1.4, 3.2]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.6, bevel: 0.06, color: HULL, name: "cab" },
  );
  // roof / hood armour
  box("cabRoof", HULL_LIGHT, [2.4, 0.1, 1.2], [0, 3.25, 2.0]);
  box("cabRoofRear", HULL_DARK, [2.0, 0.14, 0.2], [0, 3.28, 1.5]);
  box("hoodPlate", HULL_LIGHT, [2.2, 0.08, 0.5], [0, 2.3, 3.6], [-20, 0, 0]);
  for (const s of [1, -1]) {
    box("hoodRidge", HULL_DARK, [0.14, 0.1, 0.55], [s * 0.7, 2.34, 3.58], [-20, 0, 0]);
    box("hoodSide", HULL_LIGHT, [0.08, 0.5, 2.0], [s * 1.34, 1.9, 3.0]);
  }
  // windshield + windows
  box("windshield", GLASS, [2.3, 1.1, 0.05], [0, 2.78, 3.13], [-32, 0, 0]);
  box("windshieldFrame", BLACK, [2.45, 0.08, 0.08], [0, 3.22, 2.8], [-32, 0, 0]);
  for (const s of [1, -1]) {
    box("sideWindow", GLASS, [0.05, 0.62, 1.15], [s * 1.31, 2.8, 2.15]);
    box("windowFrame", BLACK, [0.07, 0.07, 1.25], [s * 1.31, 3.14, 2.15]);
    box("windowFrameB", BLACK, [0.07, 0.07, 1.25], [s * 1.31, 2.47, 2.15]);
    box("doorSeam", BLACK, [0.05, 1.3, 0.05], [s * 1.31, 2.1, 1.6]);
    box("doorSeam2", BLACK, [0.05, 1.3, 0.05], [s * 1.31, 2.1, 3.2]);
    box("step", STEEL, [0.4, 0.06, 0.9], [s * 1.5, 1.35, 2.0]);
    // headlights
    glow(b.part(new THREE.BoxGeometry(0.7, 0.12, 0.06), CYAN, { at: [s * 0.85, 1.95, 3.96], name: "headlight" }), 1.5);
    box("headlightFrame", BLACK, [0.8, 0.2, 0.05], [s * 0.85, 1.95, 3.94]);
    // mirrors
    box("mirrorArm", STEEL, [0.4, 0.05, 0.05], [s * 1.5, 2.7, 3.0]);
    box("mirror", HULL_DARK, [0.1, 0.4, 0.22], [s * 1.7, 2.65, 3.0]);
    // exhaust stacks
    cyl("exhaust", STEEL, 0.1, 2.2, [s * 1.15, 2.6, 1.2], [0, 1, 0], 8);
    cyl("exhaustTip", BLACK, 0.12, 0.2, [s * 1.15, 3.75, 1.2], [0, 1, 0], 8);
    glow(b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 8), AMBER, { at: [s * 1.15, 3.86, 1.2], name: "exhaustGlow" }), 1.2);
    for (const y of [2.0, 2.8]) cyl("exhaustBand", HULL_DARK, 0.13, 0.08, [s * 1.15, y, 1.2], [0, 1, 0], 8);
  }
  // front: plain grille area + bumper
  box("grilleBack", BLACK, [2.0, 0.65, 0.06], [0, 1.78, 3.93]);
  box("bumper", HULL_DARK, [3.0, 0.4, 0.5], [0, 1.0, 4.05]);
  box("bumperWedge", HULL, [2.6, 0.25, 0.4], [0, 1.28, 4.0], [20, 0, 0]);
  for (let i = 0; i < 8; i++) box("hazard", i % 2 ? BLACK : WARN, [0.3, 0.12, 0.05], [-1.05 + i * 0.3, 1.0, 4.32]);
  box("towHook", STEEL, [0.15, 0.15, 0.3], [0.7, 0.8, 4.3]);
  box("towHook2", STEEL, [0.15, 0.15, 0.3], [-0.7, 0.8, 4.3]);

  // Link + bed
  box("cabBedLink", HULL_DARK, [1.6, 1.4, 0.5], [0, 2.2, 1.2]);
  box("bedCore", HULL, [2.8, 1.6, 5.0], [0, 2.25, -1.5]);
  box("bedRoof", HULL_LIGHT, [2.9, 0.12, 5.1], [0, 3.1, -1.5]);
  box("bedRoofRim", HULL_DARK, [3.0, 0.08, 5.2], [0, 3.02, -1.5]);
  box("bedFloor", HULL_DARK, [2.9, 0.2, 5.1], [0, 1.4, -1.5]);
  for (const s of [1, -1]) {
    const nm = s > 0 ? "hullSideL" : "hullSideR";
    for (const [i, z] of [-3.2, -1.55, 0.1].entries()) {
      box(nm, i === 1 ? HULL : HULL_LIGHT, [0.1, 1.3, 1.5], [s * 1.45, 2.25, z]);
      box("panelInset", HULL_DARK, [0.04, 0.9, 1.1], [s * 1.51, 2.25, z]);
    }
    for (const z of [-4.0, -2.4, -0.7, 0.95]) box("rib", HULL_DARK, [0.16, 1.5, 0.12], [s * 1.46, 2.25, z]);
    box("skirt", HULL_DARK, [0.1, 0.35, 5.0], [s * 1.46, 1.5, -1.5]);
    glow(b.part(new THREE.BoxGeometry(0.04, 0.05, 4.6), MAGENTA, { at: [s * 1.5, 2.9, -1.5], name: "sideNeon" }), 1.3);
    // rear lights & corner posts
    box("cornerPost", HULL_DARK, [0.2, 1.7, 0.2], [s * 1.4, 2.25, -4.05]);
    glow(b.part(new THREE.BoxGeometry(0.4, 0.25, 0.05), RED, { at: [s * 1.0, 1.8, -4.04], name: "tailLight" }), 1.3);
    // fuel tank
    cyl("fuelTank", HULL_DARK, 0.3, 1.6, [s * 0.8, 0.6, 0.6], [0, 0, 1], 8);
  }
  box("rearBumper", HULL_DARK, [2.9, 0.35, 0.4], [0, 1.1, -4.1]);
  box("rearDoorBack", HULL_DARK, [2.5, 1.4, 0.06], [0, 2.25, -4.03]);

  // Roof hatches & vents
  box("hatch", HULL_DARK, [0.9, 0.06, 0.9], [-0.7, 3.19, -2.2]);
  for (let i = 0; i < 4; i++) box("roofVent", BLACK, [0.5, 0.05, 0.08], [0.6, 3.18, -0.2 - i * 0.2]);

  // Turret
  cyl("turretRing", HULL_DARK, 0.8, 0.12, [0, 3.2, -0.8], [0, 1, 0], 12);
  cyl("turretBase", HULL, 0.7, 0.3, [0, 3.4, -0.8], [0, 1, 0], 10);
  box("turretBody", HULL_LIGHT, [1.3, 0.55, 1.3], [0, 3.8, -0.8]);
  box("turretFront", HULL, [1.0, 0.45, 0.4], [0, 3.8, -0.05], [-10, 0, 0]);
  for (const s of [1, -1]) {
    b.rod([s * 0.3, 3.8, -0.1], [s * 0.3, 3.8, 2.0], 0.08, STEEL, { name: "barrel" });
    cyl("barrelShroud", HULL_DARK, 0.14, 0.7, [s * 0.3, 3.8, 0.4], [0, 0, 1], 8);
    glow(b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8), CYAN, { at: [s * 0.3, 3.8, 2.0], dir: [0, 0, 1], name: "muzzle" }), 1.5);
    box("turretShoulder", HULL_DARK, [0.15, 0.4, 1.0], [s * 0.7, 3.8, -0.8]);
  }

  // Antenna base nubs and bed-corner whip bases
  for (const [x, z] of [[-1.2, -3.8], [1.2, -3.8], [-1.2, 0.6]] as [number, number][]) cyl("whipBase", HULL_DARK, 0.1, 0.1, [x, 3.2, z], [0, 1, 0], 8);

  // Cab roof glow marker lamps
  for (let i = 0; i < 5; i++) glow(b.part(new THREE.BoxGeometry(0.12, 0.08, 0.08), AMBER, { at: [-0.8 + i * 0.4, 3.33, 1.45], name: "markerLamp" }), 1.2);

  // Scattered rivets on bed roof
  for (let i = 0; i < 24; i++) {
    const x = (R() - 0.5) * 2.6;
    const z = -1.5 + (R() - 0.5) * 4.6;
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 5), STEEL, { at: [x, 3.17, z], name: "rivet" });
  }

  for (const add of STAGE2) add(b);
  return b.root;
}
```