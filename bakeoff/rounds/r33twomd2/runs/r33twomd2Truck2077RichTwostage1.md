```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Aegis-77 Armored Hauler",
  description: "Low-poly cyberpunk 6x6 militarized truck from 2077: armored cab, ribbed cargo hull, turret, missile pods and neon underglow.",
};

// Palette (stage 2 may use these names)
export const HULL = "#46524a";
export const HULL_DARK = "#252c2b";
export const STEEL = "#7d8791";
export const BLACK = "#0d0f12";
export const GLASS = "#12303c";
export const TIRE = "#17181b";
export const CYAN = "#19f0ff";
export const MAGENTA = "#ff2bd6";
export const AMBER = "#ffb21a";
export const RED = "#c0262d";

export const REQUESTS = [
  {
    id: "roofLightBar",
    kind: "add",
    part: "cab",
    what: "Neon light bar across the cab roof: slim black housing, six lamps alternating CYAN and MAGENTA, end brackets bolted to the roof.",
    at: [0, 2.95, 2.2],
    normal: [0, 1, 0],
    bone: null,
    room: [1.9, 0.3, 0.45],
  },
  {
    id: "frontGrille",
    kind: "add",
    part: "cab",
    what: "Aggressive front grille on the vertical cab face: dark louvre slats, a CYAN glowing centre strip, a small angular emblem plate in AMBER, mesh frame in HULL_DARK.",
    at: [0, 1.6, 3.92],
    normal: [0, 0, 1],
    bone: null,
    room: [1.6, 0.7, 0.2],
  },
  {
    id: "cabSideVents",
    kind: "add",
    part: "cab",
    what: "A pair (both sides) of armoured vent banks and a door handle on the cab flanks: six angled slats each in BLACK with STEEL frame and a thin MAGENTA edge light.",
    at: [1.17, 1.65, 2.3],
    normal: [1, 0, 0],
    bone: null,
    room: [0.2, 0.5, 0.9],
  },
  {
    id: "turretFittings",
    kind: "add",
    part: "turretBody",
    what: "Fittings for the roof turret: ammo box on the side, barrel muzzle brakes, cooling fins on the shrouds, a CYAN targeting sensor eye and cable bundles to the base.",
    at: [0, 3.2, -0.2],
    normal: [0, 0, 1],
    bone: null,
    room: [1.4, 0.7, 1.6],
  },
  {
    id: "rearDoorEmblem",
    kind: "add",
    part: "bedRear",
    what: "Hex-plate rear door detailing: a big MAGENTA unit emblem (angular wolf-skull glyph) inset in the centre, hazard chevrons in AMBER and BLACK along the bottom edge, door hinges and latches.",
    at: [0, 1.95, -4.05],
    normal: [0, 0, -1],
    bone: null,
    room: [1.8, 1.2, 0.2],
  },
  {
    id: "cableRuns",
    kind: "add",
    part: "bedSide",
    what: "Thick cable and conduit runs along both bed sides between the ribs: bundled dark cables with CYAN glowing junction boxes, clamps every half metre.",
    at: [1.2, 1.5, -1.6],
    normal: [1, 0, 0],
    bone: null,
    room: [0.2, 0.3, 4.0],
  },
  {
    id: "antennaArray",
    kind: "add",
    part: "cab",
    what: "Antenna cluster at the cab roof rear: whip antennas of varied heights, a small satellite dome, and tiny blinking AMBER beacons on the tips.",
    at: [0, 2.95, 1.3],
    normal: [0, 1, 0],
    bone: null,
    room: [2.0, 1.4, 0.4],
  },
  {
    id: "bumperPlow",
    kind: "add",
    part: "frontBumper",
    what: "Reinforced ram plow on the front bumper: angled wedge blades in HULL_DARK, spikes along the lower lip, AMBER fog lamps, tow hooks.",
    at: [0, 0.9, 4.3],
    normal: [0, 0, 1],
    bone: null,
    room: [2.6, 0.8, 0.6],
  },
  {
    id: "wheelArmor",
    kind: "add",
    part: "fender",
    what: "Spiked armour guards and mud flaps on every wheel arch, with STEEL bolts and a thin CYAN edge strip.",
    at: [1.55, 1.6, 2.7],
    normal: [0, 1, 0],
    bone: null,
    room: [0.9, 0.5, 1.8],
  },
  {
    id: "hullCamo",
    kind: "texture",
    part: "bedSide",
    what: "Dark urban digital camo in HULL, HULL_DARK and STEEL on both bed sides, with a faded white unit number and small warning stencils near the rear.",
  },
  {
    id: "cabArmorPaint",
    kind: "texture",
    part: "cab",
    what: "Scratched, weathered armour paint on the cab: edge wear showing STEEL, soot near the roof exhaust, and thin MAGENTA pinstripe decals.",
  },
  {
    id: "roofPanelTex",
    kind: "texture",
    part: "bedRoof",
    what: "Riveted hex-tile roof plating in HULL_DARK with AMBER hazard borders and faded landing-pad markings.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "truck2077" });
  const box = (name: string, size: number[], at: number[], color: string, o: Record<string, unknown> = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, name, ...o });
  const cyl = (name: string, rt: number, rb: number, h: number, seg: number, at: number[], color: string, dir: number[] = [0, 1, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, name, dir });

  // ---------- chassis ----------
  box("chassis", [1.8, 0.45, 7.8], [0, 0.95, -0.1], HULL_DARK);
  box("chassisCore", [1.2, 0.3, 8.1], [0, 0.75, -0.1], BLACK);
  box("coupler", [2.0, 1.2, 0.5], [0, 1.8, 0.9], HULL_DARK);

  // ---------- wheels ----------
  for (const z of [2.7, -0.7, -2.5]) {
    box("axle", [3.0, 0.2, 0.25], [0, 0.72, z], STEEL);
    for (const s of [1, -1]) {
      const x = s * 1.55;
      cyl("tire", 0.72, 0.72, 0.62, 14, [x, 0.72, z], TIRE, [1, 0, 0]);
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        box("tread", [0.64, 0.1, 0.16], [x, 0.72 + Math.sin(a) * 0.72, z + Math.cos(a) * 0.72], BLACK, { rotation: [(a * 180) / Math.PI, 0, 0] });
      }
      cyl("rim", 0.42, 0.42, 0.66, 10, [x, 0.72, z], STEEL, [1, 0, 0]);
      cyl("hubcap", 0.2, 0.2, 0.1, 8, [s * 1.84, 0.72, z], HULL_DARK, [1, 0, 0]);
      glow(b.part(new THREE.TorusGeometry(0.34, 0.035, 5, 14), CYAN, { at: [s * 1.82, 0.72, z], dir: [s, 0, 0], axis: "z", name: "wheelNeon" }));
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cyl("lug", 0.035, 0.035, 0.1, 5, [s * 1.84, 0.72 + Math.sin(a) * 0.28, z + Math.cos(a) * 0.28], STEEL, [1, 0, 0]);
      }
      box("fender", [0.95, 0.14, 1.9], [x, 1.55, z], HULL_DARK);
      box("fenderLip", [0.12, 0.4, 1.9], [s * 1.98, 1.38, z], HULL);
      box("mudflap", [0.7, 0.5, 0.05], [x, 0.9, z - 0.95], BLACK);
    }
  }

  // ---------- cab ----------
  b.extrude(
    [[1.0, 1.2], [3.9, 1.2], [3.9, 2.0], [3.1, 2.9], [1.0, 2.9]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, bevel: 0.05, color: HULL, name: "cab" },
  );
  b.part(new THREE.BoxGeometry(2.0, 0.06, 1.2), GLASS, { at: [0, 2.47, 3.52], rotation: [48, 0, 0], name: "windshield" });
  box("wsFrameTop", [2.2, 0.1, 0.1], [0, 2.9, 3.1], BLACK);
  box("cabRoofPlate", [2.0, 0.08, 2.0], [0, 2.94, 2.0], HULL_DARK);
  for (const s of [1, -1]) {
    box("sideWindow", [0.05, 0.6, 1.1], [s * 1.17, 2.35, 2.3], GLASS);
    box("sideWindowFrame", [0.04, 0.7, 1.2], [s * 1.16, 2.35, 2.3], BLACK);
    box("doorPanel", [0.05, 0.9, 1.5], [s * 1.17, 1.65, 2.2], HULL_DARK);
    box("doorSeam", [0.06, 0.9, 0.04], [s * 1.18, 1.65, 1.45], BLACK);
    box("cabSkirt", [0.12, 0.2, 2.9], [s * 1.15, 1.15, 2.45], HULL_DARK);
    box("mirrorArm", [0.4, 0.05, 0.05], [s * 1.35, 2.5, 3.3], BLACK);
    box("mirror", [0.08, 0.35, 0.22], [s * 1.55, 2.5, 3.3], STEEL);
    glow(box("headlight", [0.55, 0.12, 0.06], [s * 0.7, 1.82, 3.93], CYAN), 1.5);
    box("headlightHood", [0.7, 0.05, 0.14], [s * 0.7, 1.92, 3.95], HULL_DARK);
    glow(box("fogLamp", [0.2, 0.16, 0.06], [s * 1.0, 1.35, 3.95], AMBER));
    box("hoodVent", [0.5, 0.05, 0.12], [s * 0.45, 2.04, 3.85], BLACK);
  }
  box("grilleRecess", [1.5, 0.6, 0.06], [0, 1.6, 3.92], HULL_DARK);

  // front bumper with hazard stripes
  box("frontBumper", [2.5, 0.5, 0.5], [0, 0.9, 4.05], HULL_DARK);
  box("bumperLip", [2.3, 0.2, 0.3], [0, 0.6, 4.2], BLACK);
  for (let i = 0; i < 10; i++)
    box("hazard", [0.2, 0.06, 0.4], [-1.08 + i * 0.24, 1.17, 4.08], i % 2 ? AMBER : BLACK);

  // ---------- cargo bed ----------
  box("bedSide", [2.3, 1.5, 4.8], [0, 1.95, -1.6], HULL);
  box("bedRear", [2.2, 1.4, 0.12], [0, 1.95, -4.03], HULL_DARK);
  box("bedRoof", [2.1, 0.1, 4.6], [0, 2.75, -1.6], HULL_DARK);
  for (let i = 0; i < 8; i++) {
    box("rib", [2.38, 1.3, 0.08], [0, 1.95, -3.7 + i * 0.6], HULL_DARK);
    box("ribTop", [2.2, 0.06, 0.12], [0, 2.78, -3.7 + i * 0.6], STEEL);
  }
  for (const s of [1, -1]) {
    box("roofChamfer", [0.22, 0.22, 4.8], [s * 1.12, 2.68, -1.6], HULL, { rotation: [0, 0, 45] });
    box("bedSkirt", [0.12, 0.3, 4.8], [s * 1.18, 1.15, -1.6], HULL_DARK);
    glow(box("underglow", [0.05, 0.06, 6.4], [s * 0.95, 0.5, -0.4], CYAN), 1.3);
    glow(box("taillight", [0.4, 0.2, 0.06], [s * 0.8, 1.5, -4.1], MAGENTA), 1.4);
    glow(box("tailStrip", [0.08, 1.0, 0.05], [s * 1.05, 2.05, -4.1], MAGENTA));
    cyl("fuelTank", 0.28, 0.28, 1.8, 10, [s * 1.0, 0.75, 1.0], STEEL, [0, 0, 1]);
    for (const dz of [-0.6, 0, 0.6]) box("tankStrap", [0.64, 0.64, 0.08], [s * 1.0, 0.75, 1.0 + dz], HULL_DARK);
    // exhaust stacks
    cyl("exhaust", 0.1, 0.12, 1.3, 8, [s * 0.95, 3.35, 0.95], STEEL);
    cyl("exhaustCap", 0.14, 0.14, 0.1, 8, [s * 0.95, 4.0, 0.95], BLACK);
    box("stackBracket", [0.3, 0.1, 0.3], [s * 0.95, 3.0, 0.95], HULL_DARK);
    // missile pods
    box("missilePod", [0.9, 0.7, 1.5], [s * 0.62, 3.15, -3.0], HULL_DARK);
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 3; c++) {
        const px = s * 0.62 - 0.27 + c * 0.27;
        const py = 3.0 + r * 0.3;
        cyl("tube", 0.1, 0.1, 0.1, 8, [px, py, -3.78], BLACK, [0, 0, 1]);
        glow(cyl("tubeRing", 0.06, 0.06, 0.02, 6, [px, py, -3.84], RED, [0, 0, 1]));
      }
    box("podPlate", [0.7, 0.05, 1.2], [s * 0.62, 3.52, -3.0], STEEL);
    // whip antennas
    b.rod([s * 1.0, 2.94, 1.3], [s * 1.05, 3.9 + (s > 0 ? 0 : 0.5), 1.25], 0.02, STEEL);
    glow(b.part(new THREE.SphereGeometry(0.05, 5, 4), AMBER, { at: [s * 1.05, 3.93 + (s > 0 ? 0 : 0.5), 1.25], name: "beacon" }));
  }
  // rear bumper
  box("rearBumper", [2.4, 0.4, 0.4], [0, 0.95, -4.15], HULL_DARK);
  for (let i = 0; i < 8; i++) box("hazard", [0.2, 0.06, 0.38], [-0.84 + i * 0.24, 1.18, -4.15], i % 2 ? AMBER : BLACK);
  // hex plates on rear door
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 6; c++) {
      if (r >= 1 && r <= 2 && c >= 2 && c <= 3) continue;
      const x = -0.9 + c * 0.36 + (r % 2) * 0.18 - 0.09;
      b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 6), (r + c) % 5 === 0 ? MAGENTA : (r + c) % 2 ? HULL : HULL_DARK, {
        at: [x, 1.4 + r * 0.32, -4.11], dir: [0, 0, -1], name: "hexPlate",
      });
    }
  box("emblemInset", [0.9, 0.65, 0.04], [0, 1.95, -4.1], BLACK);

  // ---------- roof turret ----------
  b.lathe([[0, 0], [0.55, 0], [0.5, 0.12], [0.35, 0.2], [0, 0.2]], { at: [0, 2.8, -0.6], color: STEEL, name: "turretBase" });
  box("turretBody", [1.0, 0.45, 1.1], [0, 3.25, -0.6], HULL);
  box("turretTop", [0.8, 0.1, 0.8], [0, 3.52, -0.65], HULL_DARK);
  box("turretFront", [0.9, 0.35, 0.2], [0, 3.25, -0.0], HULL_DARK, { rotation: [-20, 0, 0] });
  for (const s of [1, -1]) {
    b.rod([s * 0.25, 3.25, -0.1], [s * 0.25, 3.25, 1.7], 0.07, STEEL, { name: "barrel" });
    b.rod([s * 0.25, 3.25, -0.05], [s * 0.25, 3.25, 0.7], 0.12, HULL_DARK, { name: "shroud" });
    glow(b.part(new THREE.SphereGeometry(0.05, 5, 4), CYAN, { at: [s * 0.25, 3.25, 1.72], name: "muzzle" }));
  }
  glow(box("sensorEye", [0.16, 0.12, 0.05], [0, 3.35, -0.02], CYAN), 1.5);

  // ---------- radar ----------
  b.rod([0, 2.8, -2.0], [0, 3.55, -2.0], 0.06, STEEL, { name: "mast" });
  b.lathe([[0, 0], [0.5, 0.2], [0.5, 0.24], [0, 0.08]], { at: [0, 3.55, -2.0], axis: [0, 0.6, 0.8], color: STEEL, name: "dish" });
  glow(b.part(new THREE.SphereGeometry(0.06, 5, 4), MAGENTA, { at: [0, 3.78, -1.85], name: "feed" }));

  for (const add of STAGE2) add(b);
  return b.root;
}
```