import * as THREE from "three";
import { type Builder, createBuilder, paint, noise, cells, svg, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

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

// ---------- stage 2 paints ----------
const CAMO = paint((p, n) => {
  if (Math.abs(n.x) < 0.5) return HULL_DARK;
  // digital camo: quantised blocks
  const q = new THREE.Vector3(0, Math.floor(p.y / 0.12) * 0.12, Math.floor(p.z / 0.12) * 0.12);
  const v = noise(q, 0.7, 4) * 0.7 + noise(q, 0.25, 9) * 0.3;
  let c = v < 0.4 ? HULL_DARK : v < 0.58 ? HULL : v < 0.7 ? "#38423f" : STEEL;
  // unit number "77" as faded white blocks
  const zz = p.z, yy = p.y;
  const inDigit = (z0: number) => {
    const u = zz - z0, w = yy - 1.8;
    if (u < 0 || u > 0.4 || w < 0 || w > 0.7) return false;
    return w > 0.6 || (u > 0.28 && u < 0.4) || (w > 0.2 && w < 0.6 && u > 0.28);
  };
  if (inDigit(-3.3) || inDigit(-2.8)) c = "#c9cdc6";
  // warning stencils near the rear
  const sx = Math.floor((zz + 3.9) / 0.14);
  if (yy > 1.3 && yy < 1.5 && zz < -3.3 && zz > -3.9 && sx % 2 === 0) c = AMBER;
  if (yy > 1.3 && yy < 1.32 && zz < -3.3 && zz > -3.9) c = BLACK;
  // grime low on the body
  if (yy < 1.45 && noise(p, 0.15, 2) > 0.45) c = "#242a28";
  return c;
});

const CAB_PAINT = paint((p, n) => {
  const side = Math.abs(n.x) > 0.6;
  let c: string = noise(p, 0.5, 3) > 0.55 ? "#4d5a52" : HULL;
  // edge wear on bevels and non-axis faces
  const axisAligned = Math.max(Math.abs(n.x), Math.abs(n.y), Math.abs(n.z)) > 0.97;
  if (!axisAligned) c = noise(p, 0.06, 7) > 0.4 ? STEEL : c;
  // scratches
  if (noise(p, 0.03, 11) > 0.72 && noise(p, 0.4, 12) > 0.45) c = STEEL;
  // soot near exhausts (rear roof)
  const soot = Math.max(0, 1 - Math.hypot(Math.abs(p.x) - 0.95, p.z - 0.95) / 1.1);
  if (p.y > 2.2 && soot * (0.5 + noise(p, 0.2, 5)) > 0.4) c = "#15171a";
  // magenta pinstripes
  if (side && ((p.y > 1.93 && p.y < 1.96) || (p.y > 1.99 && p.y < 2.0))) c = MAGENTA;
  return c;
});

const ROOF_PAINT = paint((p, n) => {
  if (Math.abs(n.y) < 0.5) return HULL_DARK;
  const dx = 1.05 - Math.abs(p.x), dz = Math.min(p.z + 3.9, 0.7 - p.z);
  const d = Math.min(dx, dz);
  if (d < 0.12) return Math.floor((p.x + p.z) / 0.14) % 2 === 0 ? AMBER : BLACK;
  const c = cells(p, 0.28, 3);
  let col: string = c.d2 - c.d1 < 0.09 ? "#14181a" : c.id > 0.5 ? HULL_DARK : "#303836";
  if (c.d2 - c.d1 < 0.2 && c.d2 - c.d1 > 0.16) col = "#4a5552";
  // landing pad marking
  const r = Math.hypot(p.x, p.z + 1.6);
  const faded = noise(p, 0.1, 8) > 0.3;
  if (faded && ((r > 0.62 && r < 0.7) || (Math.abs(p.x) < 0.04 && Math.abs(p.z + 1.6) < 0.3) ||
    (Math.abs(p.z + 1.6) < 0.04 && Math.abs(p.x) < 0.18) || (Math.abs(Math.abs(p.x) - 0.18) < 0.04 && Math.abs(p.z + 1.6) < 0.3))) col = "#b9bdb4";
  return col;
});

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
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, bevel: 0.05, color: CAB_PAINT, name: "cab" },
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
  box("bedSide", [2.3, 1.5, 4.8], [0, 1.95, -1.6], CAMO);
  box("bedRear", [2.2, 1.4, 0.12], [0, 1.95, -4.03], HULL_DARK);
  box("bedRoof", [2.1, 0.1, 4.6], [0, 2.75, -1.6], ROOF_PAINT);
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

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addRoofLightBar(b: Builder) {
  const Y = 2.98; // roof plate top is about 2.98
  const Z = 2.2;
  const LAMP = [CYAN, MAGENTA, CYAN, MAGENTA, CYAN, MAGENTA];
  const box = (w: number, h: number, d: number, at: number[], color: string, o: Record<string, unknown> = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });

  // housing
  box(1.8, 0.14, 0.34, [0, Y + 0.12, Z], BLACK, { name: "lbHousing" });
  box(1.84, 0.04, 0.38, [0, Y + 0.2, Z], HULL_DARK, { name: "lbTopPlate" });
  // front visor (slanted)
  box(1.7, 0.03, 0.14, [0, Y + 0.26, Z + 0.14], HULL_DARK, { rotation: [-25, 0, 0], name: "lbVisor" });
  // lamps with bezels
  for (let i = 0; i < 6; i++) {
    const x = -0.75 + i * 0.3;
    box(0.26, 0.11, 0.05, [x, Y + 0.12, Z + 0.18], STEEL, { name: "lbBezel" });
    glow(box(0.22, 0.08, 0.05, [x, Y + 0.12, Z + 0.2], LAMP[i], { name: "lbLamp" }), 1.6);
    // divider fins
    if (i < 5) box(0.025, 0.12, 0.08, [x + 0.15, Y + 0.12, Z + 0.2], BLACK, { name: "lbFin" });
  }
  // rear glow strip
  glow(box(1.5, 0.03, 0.03, [0, Y + 0.12, Z - 0.18], MAGENTA, { name: "lbRearStrip" }), 1.1);

  // end brackets + bolts
  for (const s of [1, -1]) {
    box(0.1, 0.1, 0.4, [s * 0.95, Y + 0.05, Z], HULL_DARK, { name: "lbBracket" });
    box(0.2, 0.04, 0.46, [s * 0.95, Y + 0.01, Z], STEEL, { name: "lbFoot" });
    box(0.06, 0.2, 0.3, [s * 0.92, Y + 0.14, Z], STEEL, { name: "lbEndCap" });
    for (const dz of [-0.15, 0.15])
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), STEEL, {
        at: [s * 0.95, Y + 0.045, Z + dz], name: "lbBolt",
      });
    // small end indicator
    glow(box(0.05, 0.05, 0.05, [s * 0.96, Y + 0.14, Z + 0.17], AMBER, { name: "lbMarker" }));
  }
  // cable running to the roof
  b.rod([0, Y + 0.05, Z - 0.17], [0, Y + 0.02, Z - 0.4], 0.02, BLACK, { name: "lbCable" });
  box(0.14, 0.05, 0.1, [0, Y + 0.025, Z - 0.42], HULL_DARK, { name: "lbJunction" });
}
    return addRoofLightBar;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addFrontGrille(b: Builder) {
  const box = (n: string, s: number[], at: number[], c: string, o: Record<string, unknown> = {}) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), c, { at, name: n, ...o });

  // ---------- front grille (cab face z=3.92) ----------
  const GZ = 3.97;
  // mesh frame
  box("grilleFrameTop", [1.62, 0.07, 0.08], [0, 1.93, GZ], HULL_DARK);
  box("grilleFrameBot", [1.62, 0.07, 0.08], [0, 1.27, GZ], HULL_DARK);
  for (const s of [1, -1]) box("grilleFrameSide", [0.07, 0.66, 0.08], [s * 0.78, 1.6, GZ], HULL_DARK);
  // dark backing
  box("grilleBack", [1.5, 0.58, 0.03], [0, 1.6, 3.95], BLACK);
  // angled louvre slats, left and right of the centre strip
  for (const s of [1, -1])
    for (let i = 0; i < 7; i++) {
      const y = 1.34 + i * 0.08;
      box("louvre", [0.58, 0.05, 0.06], [s * 0.42, y, GZ + 0.02], i % 2 ? HULL_DARK : BLACK, { rotation: [-25, 0, 0] });
      box("louvreEdge", [0.58, 0.012, 0.02], [s * 0.42, y + 0.025, GZ + 0.055], STEEL);
    }
  // mesh texture overlay on backing
  const meshTex = svg(
    `<svg viewBox="0 0 32 8" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="8" fill="#000" opacity="0"/>
    <path d="M0 0L8 8M8 0L16 8M16 0L24 8M24 0L32 8M8 0L0 8M16 0L8 8M24 0L16 8M32 0L24 8" stroke="#8a9299" stroke-width="0.7" fill="none"/></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(1.46, 0.22), "#ffffff", {
    at: [0, 1.5, 3.955], dir: [0, 0, 1], axis: "z", texture: meshTex, name: "grilleMesh",
  });
  // centre glowing strip with housing
  box("stripHousing", [0.2, 0.62, 0.07], [0, 1.6, GZ + 0.01], HULL_DARK);
  glow(box("stripGlow", [0.07, 0.54, 0.05], [0, 1.6, GZ + 0.05], CYAN), 1.6);
  for (let i = 0; i < 5; i++) box("stripBar", [0.2, 0.025, 0.08], [0, 1.4 + i * 0.1, GZ + 0.06], BLACK);
  // emblem plate (angular, amber)
  b.extrude(
    [[-0.14, 0], [0.14, 0], [0.18, 0.1], [0, 0.2, "sharp"], [-0.18, 0.1]],
    { at: [0, 1.64, GZ + 0.09], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.025, bevel: 0.006, color: AMBER, name: "emblemPlate" },
  );
  box("emblemSlit", [0.05, 0.1, 0.03], [0, 1.74, GZ + 0.115], BLACK);
  // corner bolts
  for (const sx of [1, -1])
    for (const y of [1.3, 1.9])
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), STEEL, { at: [sx * 0.78, y, GZ + 0.05], dir: [0, 0, 1], name: "grilleBolt" });
  // tow hook lug under grille
  box("towLug", [0.12, 0.1, 0.1], [0.5, 1.2, 4.0], STEEL);

  // ---------- cab side vents ----------
  for (const s of [1, -1]) {
    const X = s * 1.2;
    // steel frame
    box("ventFrameTop", [0.06, 0.05, 0.92], [X, 1.9, 2.3], STEEL);
    box("ventFrameBot", [0.06, 0.05, 0.92], [X, 1.4, 2.3], STEEL);
    for (const dz of [-0.45, 0.45]) box("ventFrameEnd", [0.06, 0.5, 0.05], [X, 1.65, 2.3 + dz], STEEL);
    box("ventBack", [0.05, 0.42, 0.84], [X, 1.65, 2.3], BLACK);
    // six angled slats
    for (let i = 0; i < 6; i++)
      box("ventSlat", [0.07, 0.04, 0.8], [s * 1.225, 1.46 + i * 0.07, 2.3], BLACK, { rotation: [0, 0, s * -30] });
    // magenta edge light
    glow(box("ventEdgeLight", [0.025, 0.02, 0.88], [s * 1.235, 1.375, 2.3], MAGENTA), 1.4);
    // bolts
    for (const dz of [-0.45, 0.45])
      for (const y of [1.4, 1.9])
        b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6), HULL_DARK, { at: [s * 1.235, y, 2.3 + dz], dir: [s, 0, 0], name: "ventBolt" });
    // door handle
    box("handleBase", [0.05, 0.08, 0.3], [s * 1.2, 2.0, 1.75], BLACK);
    box("handleGrip", [0.06, 0.04, 0.24], [s * 1.25, 2.0, 1.75], STEEL);
    glow(box("handleLed", [0.02, 0.02, 0.04], [s * 1.26, 2.04, 1.65], CYAN));
  }
}
    return addFrontGrille;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addTurretFittings(b: Builder) {
  const r = rng(77);
  const box = (size: number[], at: number[], color: string, o: Record<string, unknown> = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, name: "turretFit", ...o });
  const cylZ = (rad: number, len: number, at: number[], color: string, seg = 8) =>
    b.part(new THREE.CylinderGeometry(rad, rad, len, seg), color, { at, dir: [0, 0, 1], name: "turretFit" });

  // turret body spans x +-0.5, y 3.03..3.47, z -1.15..-0.05
  // ---- ammo box on the +X side ----
  box([0.34, 0.34, 0.6], [0.67, 3.2, -0.65], HULL_DARK);
  box([0.36, 0.06, 0.64], [0.67, 3.39, -0.65], STEEL);
  box([0.04, 0.2, 0.12], [0.86, 3.2, -0.65], STEEL); // latch
  box([0.1, 0.05, 0.3], [0.67, 3.43, -0.65], AMBER); // handle plate
  for (const dz of [-0.2, 0.2]) box([0.38, 0.05, 0.05], [0.67, 3.2, -0.65 + dz], BLACK);
  // feed chute to body
  b.rod([0.5, 3.22, -0.65], [0.5, 3.14, -0.45], 0.05, BLACK, { name: "turretFit" });
  // warning stripe
  for (let i = 0; i < 4; i++) box([0.02, 0.06, 0.08], [0.86, 3.05, -0.82 + i * 0.16], i % 2 ? AMBER : BLACK);

  // ---- barrels: muzzle brakes + cooling fins ----
  for (const s of [1, -1]) {
    const x = s * 0.25;
    cylZ(0.11, 0.2, [x, 3.25, 1.62], STEEL, 8); // brake body
    for (const dx of [-0.1, 0.1]) box([0.03, 0.14, 0.16], [x + dx, 3.25, 1.62], BLACK);
    box([0.14, 0.03, 0.16], [x, 3.37, 1.62], BLACK);
    box([0.14, 0.03, 0.16], [x, 3.13, 1.62], BLACK);
    for (let i = 0; i < 6; i++) {
      const z = 0.0 + i * 0.12;
      cylZ(0.16, 0.035, [x, 3.25, z], i % 2 ? STEEL : HULL_DARK, 8);
    }
    cylZ(0.14, 0.08, [x, 3.25, 0.78], STEEL, 8); // shroud end collar
    glow(cylZ(0.04, 0.02, [x, 3.25, 1.73], CYAN, 6), 1.2);
    // barrel clamp rings
    for (const z of [0.95, 1.3]) cylZ(0.085, 0.06, [x, 3.25, z], BLACK, 8);
  }
  // barrel bridge
  box([0.6, 0.08, 0.1], [0, 3.25, 0.75], HULL_DARK);

  // ---- targeting sensor eye ----
  box([0.3, 0.22, 0.06], [0, 3.35, 0.02], BLACK);
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), CYAN, { at: [0, 3.35, 0.07], name: "turretFit" }), 2);
  b.part(new THREE.TorusGeometry(0.085, 0.015, 4, 8), STEEL, { at: [0, 3.35, 0.06], dir: [0, 0, 1], axis: "z", name: "turretFit" });
  for (const s of [1, -1]) {
    glow(box([0.04, 0.04, 0.03], [s * 0.2, 3.35, 0.06], CYAN), 1);
    b.rod([s * 0.1, 3.47, 0.0], [s * 0.1, 3.62, -0.1], 0.012, STEEL, { name: "turretFit" });
  }
  glow(b.part(new THREE.SphereGeometry(0.035, 5, 4), AMBER, { at: [0.1, 3.63, -0.1], name: "turretFit" }));

  // ---- cable bundles to base ----
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const x0 = s * (0.34 + k * 0.05);
      b.sweep(
        [
          [x0, 3.05, -1.16 + k * 0.01],
          [x0 + s * 0.08, 2.98, -1.24],
          [x0 + s * 0.05, 2.9, -1.2],
          [x0, 2.82, -1.0],
        ],
        0.018,
        { color: k === 1 ? CYAN : BLACK, name: "turretCable" },
      );
    }
    box([0.2, 0.04, 0.05], [s * 0.4, 2.98, -1.2], STEEL); // clamp
    glow(box([0.06, 0.06, 0.06], [s * 0.48, 2.95, -1.2], CYAN));
  }

  // ---- armour bolts on top and side shrouds ----
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 5), STEEL, {
      at: [Math.cos(a) * 0.34, 3.58, -0.65 + Math.sin(a) * 0.34],
      name: "turretBolt",
    });
  }
  // rear vents
  for (let i = 0; i < 4; i++) box([0.6, 0.03, 0.04], [0, 3.1 + i * 0.08, -1.18], BLACK);
  // front armour plate trim
  box([0.96, 0.05, 0.05], [0, 3.1, 0.0 + r() * 0.0], STEEL);
}
    return addTurretFittings;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addRearDoorEmblem(b: Builder) {
  const Z = -4.1;
  const box = (size: number[], at: number[], color: string, o: Record<string, unknown> = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, ...o });

  // ---- emblem: wolf-skull glyph drawn as texture ----
  const GLYPH = svg(
    `<svg viewBox="0 0 100 100">
      <path d="M50 6 L70 20 L92 14 L84 44 L74 64 L62 88 L50 96 L38 88 L26 64 L16 44 L8 14 L30 20Z" fill="#ff2bd6" stroke="#ffd6f6" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M26 42 L44 52 L40 60 L24 52Z M74 42 L56 52 L60 60 L76 52Z" fill="#0d0f12"/>
      <path d="M50 58 L44 72 L50 68 L56 72Z" fill="#0d0f12"/>
      <path d="M40 84 L40 76 M46 88 L46 78 M54 88 L54 78 M60 84 L60 76" stroke="#0d0f12" stroke-width="3" fill="none"/>
      <path d="M50 12 L50 34" stroke="#0d0f12" stroke-width="2.5"/>
    </svg>`,
    { size: 256 },
  );
  box([1.0, 0.75, 0.03], [0, 1.95, Z - 0.03], "#252c2b", { name: "emblemFrame" });
  glow(
    b.part(new THREE.PlaneGeometry(0.72, 0.72), "#ffffff", {
      at: [0, 1.95, Z - 0.06], dir: [0, 0, -1], axis: "z", texture: GLYPH, name: "wolfGlyph",
    }),
    1.2,
  );
  for (const s of [1, -1]) {
    box([0.06, 0.8, 0.04], [s * 0.53, 1.95, Z - 0.03], "#7d8791", { name: "emblemRail" });
    glow(box([0.03, 0.6, 0.03], [s * 0.6, 1.95, Z - 0.03], "#ff2bd6"), 1.2);
  }

  // ---- hazard chevrons along bottom edge ----
  const CHEV = svg(
    `<svg viewBox="0 0 200 20"><rect width="200" height="20" fill="#0d0f12"/>
      ${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 20} 20 L${i * 20 + 10} 0 L${i * 20 + 20} 0 L${i * 20 + 10} 20Z" fill="#ffb21a"/>`).join("")}
    </svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(2.0, 0.2), "#ffffff", {
    at: [0, 1.32, Z - 0.012], dir: [0, 0, -1], axis: "z", texture: CHEV, name: "chevrons",
  });
  box([2.1, 0.04, 0.05], [0, 1.44, Z - 0.02], "#7d8791", { name: "chevTrim" });
  box([2.1, 0.04, 0.05], [0, 1.2, Z - 0.02], "#0d0f12", { name: "chevTrim" });

  // ---- hinges, latches ----
  for (const s of [1, -1]) {
    for (const y of [1.45, 2.0, 2.55]) {
      b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.26, 8), "#7d8791", { at: [s * 1.06, y, Z - 0.06], name: "hinge" });
      box([0.2, 0.18, 0.04], [s * 0.98, y, Z - 0.04], "#252c2b", { name: "hingePlate" });
    }
  }
  for (const s of [1, -1]) {
    box([0.12, 0.3, 0.07], [s * 0.2, 2.62, Z - 0.05], "#7d8791", { name: "latch" });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 6), "#c0262d", { at: [s * 0.2, 2.62, Z - 0.1], dir: [0, 0, -1], name: "latchLamp" });
  }
  box([0.7, 0.07, 0.07], [0, 2.7, Z - 0.05], "#0d0f12", { name: "handleBar" });

  // ---- cable runs along bed sides ----
  for (const s of [1, -1]) {
    const x = s * 1.2;
    for (const y of [1.35, 1.5, 1.65]) {
      b.rod([x + s * 0.03, y, -3.5], [x + s * 0.03, y + (y - 1.5) * 0.2, 0.6], 0.045, "#0d0f12", { name: "cable" });
    }
    b.rod([x + s * 0.05, 1.5, -3.5], [x + s * 0.05, 1.5, 0.6], 0.025, "#7d8791", { name: "conduit" });
    for (let i = 0; i < 8; i++) {
      const z = -3.4 + i * 0.5;
      box([0.07, 0.4, 0.1], [x + s * 0.06, 1.5, z], "#252c2b", { name: "clamp" });
      box([0.03, 0.44, 0.12], [x + s * 0.1, 1.5, z], "#7d8791", { name: "clampBolt" });
    }
    for (const z of [-2.7, -1.3, 0.1]) {
      box([0.12, 0.26, 0.3], [x + s * 0.08, 1.5, z], "#252c2b", { name: "junction" });
      glow(box([0.03, 0.14, 0.2], [x + s * 0.15, 1.5, z], "#19f0ff"), 1.4);
      box([0.14, 0.04, 0.34], [x + s * 0.08, 1.65, z], "#7d8791", { name: "junctionCap" });
    }
  }
}
    return addRearDoorEmblem;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addAntennaArray(b: Builder) {
  const r = rng(77);
  const BASE_Y = 2.98; // top of cab roof plate
  const PLATE = "#3a4247";
  const WIRE = "#9aa5ad";

  // mounting rail plate across the roof rear
  b.part(new THREE.BoxGeometry(1.9, 0.05, 0.36), PLATE, { at: [0, BASE_Y + 0.02, 1.3], name: "antRail" });
  for (const sx of [-0.9, 0.9]) {
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.4), HULL_DARK, { at: [sx, BASE_Y + 0.05, 1.3], name: "antEndBracket" });
  }

  // whip antennas of varied heights
  const whips = [
    { x: -0.8, h: 1.25, lean: 0.06 },
    { x: -0.5, h: 0.8, lean: -0.04 },
    { x: -0.2, h: 1.1, lean: 0.03 },
    { x: 0.45, h: 0.9, lean: -0.05 },
    { x: 0.7, h: 1.3, lean: 0.05 },
    { x: 0.95, h: 0.7, lean: -0.03 },
  ];
  whips.forEach((w, i) => {
    const z = 1.3 + (i % 2 ? 0.07 : -0.07);
    const base: [number, number, number] = [w.x, BASE_Y + 0.04, z];
    const tip: [number, number, number] = [w.x + w.lean * w.h, BASE_Y + 0.04 + w.h, z];
    // mounting collar and spring base
    b.part(new THREE.CylinderGeometry(0.06, 0.08, 0.09, 6), STEEL, { at: [w.x, BASE_Y + 0.07, z], name: "antCollar" });
    b.part(new THREE.CylinderGeometry(0.035, 0.05, 0.1, 6), BLACK, { at: [w.x, BASE_Y + 0.15, z], name: "antBoot" });
    b.rod(base, tip, [0.022, 0.008], WIRE, { name: "whip" });
    // segmented joints along the whip
    for (const t of [0.35, 0.65]) {
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 5), STEEL, {
        at: [base[0] + (tip[0] - base[0]) * t, base[1] + (tip[1] - base[1]) * t, z],
        name: "whipRing",
      });
    }
    // blinking beacon tip
    const col = i % 2 ? AMBER : AMBER;
    glow(b.part(new THREE.SphereGeometry(0.045, 5, 4), col, { at: tip, name: "antBeacon" }), 1.8);
  });

  // satellite dome (centre rear)
  const dx = 0.1;
  const dz = 1.28;
  b.part(new THREE.CylinderGeometry(0.2, 0.26, 0.1, 8), HULL_DARK, { at: [dx, BASE_Y + 0.08, dz], name: "domeBase" });
  b.part(new THREE.SphereGeometry(0.22, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#cfd6da", {
    at: [dx, BASE_Y + 0.13, dz],
    name: "satDome",
  });
  b.part(new THREE.TorusGeometry(0.22, 0.015, 4, 8), STEEL, {
    at: [dx, BASE_Y + 0.14, dz],
    rotation: [90, 0, 0],
    name: "domeSeam",
  });
  // dome panel seams
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.BoxGeometry(0.01, 0.2, 0.01), STEEL, {
      at: [dx + Math.cos((i * Math.PI) / 4) * 0.1, BASE_Y + 0.27, dz + Math.sin((i * Math.PI) / 4) * 0.1],
      rotation: [0, -45 * i, 0],
      name: "domeRib",
    });
  }
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), CYAN, { at: [dx, BASE_Y + 0.37, dz], name: "domeLamp" }), 1.4);

  // small yagi / directional antenna
  b.rod([-0.35, BASE_Y + 0.1, 1.25], [-0.35, BASE_Y + 0.4, 1.25], 0.025, STEEL, { name: "yagiMast" });
  b.rod([-0.55, BASE_Y + 0.4, 1.25], [-0.15, BASE_Y + 0.4, 1.25], 0.015, WIRE, { name: "yagiBoom" });
  for (let i = 0; i < 4; i++) {
    const x = -0.52 + i * 0.1;
    const len = 0.22 - i * 0.03;
    b.part(new THREE.BoxGeometry(0.015, 0.015, len), WIRE, { at: [x, BASE_Y + 0.4, 1.25], name: "yagiElement" });
  }

  // cable run with clamps to the roof plate
  b.rod([0.1, BASE_Y + 0.03, 1.2], [0.6, BASE_Y + 0.03, 1.12], 0.02, BLACK, { name: "antCable" });
  for (let i = 0; i < 3; i++) {
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.07), MAGENTA, { at: [0.2 + i * 0.17, BASE_Y + 0.05, 1.18 - i * 0.025 + r() * 0.01], name: "cableClamp" });
  }
}
    return addAntennaArray;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addBumperPlow(b: Builder) {
  const r = rng(77);
  const BOLT = "#a9b3bd";
  const box = (name: string, s: number[], at: number[], color: string, o: Record<string, unknown> = {}) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), color, { at, name, ...o });

  // ---------- bumper plow ----------
  // central wedge: two angled blades meeting in a V
  for (const s of [1, -1]) {
    box("plowBlade", [1.35, 0.62, 0.1], [s * 0.62, 0.78, 4.38], HULL_DARK, { rotation: [0, s * -22, 0] });
    box("plowBladeEdge", [1.3, 0.06, 0.12], [s * 0.62, 1.1, 4.4], STEEL, { rotation: [0, s * -22, 0] });
    box("plowBrace", [0.1, 0.5, 0.45], [s * 0.95, 0.8, 4.25], BLACK);
    // tow hooks
    b.rod([s * 0.5, 0.58, 4.28], [s * 0.5, 0.58, 4.58], 0.04, STEEL, { name: "towHook" });
    b.part(new THREE.TorusGeometry(0.09, 0.025, 5, 8), STEEL, { at: [s * 0.5, 0.58, 4.64], dir: [0, 1, 0], axis: "z", name: "towRing" });
    // amber fog lamps with bezel
    box("lampBezel", [0.3, 0.22, 0.08], [s * 1.0, 0.95, 4.34], BLACK);
    glow(box("plowLamp", [0.22, 0.14, 0.05], [s * 1.0, 0.95, 4.39], AMBER), 1.6);
    // end caps
    box("plowEnd", [0.12, 0.62, 0.5], [s * 1.3, 0.8, 4.2], HULL_DARK, { rotation: [0, s * -15, 0] });
  }
  b.part(new THREE.ConeGeometry(0.2, 0.7, 4), HULL_DARK, { at: [0, 0.78, 4.52], dir: [0, 0, 1], name: "plowNose" });
  glow(box("plowStrip", [1.8, 0.04, 0.05], [0, 1.12, 4.43], CYAN), 1.2);

  // lower-lip spikes
  for (let i = 0; i < 9; i++) {
    const x = -1.0 + i * 0.25;
    b.part(new THREE.ConeGeometry(0.06, 0.32, 4), STEEL, { at: [x, 0.5, 4.48], dir: [0, -0.5, 1], name: "lipSpike" });
  }
  // bolts across the blade
  for (let i = 0; i < 8; i++) {
    const x = -1.0 + i * 0.285;
    b.part(new THREE.SphereGeometry(0.03, 5, 4), BOLT, { at: [x, 0.95, 4.46 + Math.abs(x) * 0.0], name: "plowBolt" });
  }

  // ---------- wheel armor ----------
  const flapTex = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#111"/><path d="M0 24 L8 16 L16 24 L24 16 L32 24 V32 H0Z" fill="#ffb21a"/><path d="M0 30 H32" stroke="#19f0ff" stroke-width="2"/></svg>`,
    { size: 64 },
  );
  for (const z of [2.7, -0.7, -2.5]) {
    for (const s of [1, -1]) {
      const x = s * 1.55;
      // arch guard plate on outer lip
      box("archGuard", [0.08, 0.16, 1.7], [s * 2.03, 1.62, z], HULL);
      glow(box("archNeon", [0.03, 0.04, 1.6], [s * 2.08, 1.72, z], CYAN), 1.2);
      // spikes along the arch
      for (let i = 0; i < 4; i++) {
        const zz = z - 0.66 + i * 0.44;
        b.part(new THREE.ConeGeometry(0.06, 0.26, 5), STEEL, { at: [s * 2.06, 1.6, zz], dir: [s, 0.5, 0], name: "archSpike" });
        b.part(new THREE.SphereGeometry(0.03, 5, 4), BOLT, { at: [s * 2.1, 1.54, zz + 0.2 * (r() - 0.5)], name: "archBolt" });
      }
      // mud flap with hazard texture
      b.part(new THREE.PlaneGeometry(0.62, 0.5), "#ffffff", { at: [x, 0.62, z - 1.0], dir: [0, 0, -1], axis: "z", texture: flapTex, name: "flapArt" });
      box("flapBar", [0.7, 0.06, 0.08], [x, 0.9, z - 0.98], STEEL);
    }
  }
}
    return addBumperPlow;
  })(),
);
