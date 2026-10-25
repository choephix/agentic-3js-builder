import * as THREE from "three";
import { createBuilder, type Builder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

// ---- palette (top level so stage 2 can use the names) ----
export const HULL = "#3b4452";
export const HULL_DARK = "#1f242d";
export const HULL_LIGHT = "#5d6b7e";
export const ARMOR = "#2a303b";
export const TIRE = "#101216";
export const RIM = "#8b95a6";
export const CYAN = "#19f0ff";
export const MAGENTA = "#ff2bd6";
export const AMBER = "#ffb02e";
export const HAZARD = "#f2c418";
export const POD = "#d9dee6";
export const POD_DARK = "#8d97a8";
export const GLASS = "#0b2a3a";
export const BLACK = "#0a0b0e";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured convoy hauler with a sealed cargo pod, neon trim and a roof turret.",
};

export const REQUESTS = [
  {
    id: "roofLightBar",
    kind: "add",
    part: "cabRoof",
    what: "Neon light bar across the cab roof front: slim black housing, six lamps alternating CYAN and MAGENTA (glowing), and two end brackets.",
    at: [0, 3.2, 3.5],
    normal: [0, 1, 0],
    bone: null,
    room: [2.0, 0.25, 0.35],
  },
  {
    id: "frontGrille",
    kind: "add",
    part: "nose",
    what: "Armoured front grille on the nose: horizontal slats in HULL_DARK, a CYAN glowing centre strip, and a small hazard-yellow bumper chevron row.",
    at: [0, 1.4, 4.95],
    normal: [0, 0, 1],
    bone: null,
    room: [1.8, 0.7, 0.3],
  },
  {
    id: "podEmblem",
    kind: "add",
    part: "podBody",
    what: "Corporate emblem on the left side of the cargo pod: a hexagonal badge in MAGENTA and CYAN outline with a stylised shield glyph, layered as dark outline, main colour and highlight.",
    at: [1.08, 2.4, -1.2],
    normal: [1, 0, 0],
    bone: null,
    room: [0.2, 1.2, 1.2],
  },
  {
    id: "podLockLights",
    kind: "add",
    part: "podSealBand",
    what: "Seal-status lights along the pod's central seal band: a row of eight small AMBER lamps with a dark rail, plus a keypad plate with a tiny red glowing LED on the pod's left.",
    at: [1.1, 2.9, -2.0],
    normal: [1, 0, 0],
    bone: null,
    room: [0.2, 0.5, 1.6],
  },
  {
    id: "roofTurret",
    kind: "add",
    part: "turretBase",
    what: "Twin-barrel autocannon turret on the ring mount: armoured housing, two barrels with muzzle brakes, ammo box on a side, a small CYAN targeting lens.",
    at: [0, 3.35, 2.1],
    normal: [0, 1, 0],
    bone: null,
    room: [1.0, 0.8, 1.6],
  },
  {
    id: "antennaArray",
    kind: "add",
    part: "cabRoof",
    what: "Antenna array behind the cab: one tall whip mast, two shorter masts, a small dish and a flat comm box, with blinking MAGENTA tip lamps.",
    at: [0.9, 3.15, 2.5],
    normal: [0, 1, 0],
    bone: null,
    room: [0.8, 1.6, 0.6],
  },
  {
    id: "exhaustDetail",
    kind: "add",
    part: "exhaustL",
    what: "Exhaust stack details on both stacks: heat-shield slats, rain caps, clamp bands, and glowing AMBER inner rim at the tops.",
    at: [1.25, 3.2, 1.75],
    normal: [0, 1, 0],
    bone: null,
    room: [0.5, 1.0, 0.5],
  },
  {
    id: "underglow",
    kind: "add",
    part: "chassis",
    what: "Underglow neon strips along both lower chassis edges in CYAN with a MAGENTA end cap, plus mud flap panels behind the rear wheels with small hazard stripes.",
    at: [1.12, 0.7, -0.5],
    normal: [1, 0, 0],
    bone: null,
    room: [0.2, 0.2, 6.0],
  },
  {
    id: "sideArmourRivets",
    kind: "add",
    part: "sidePlateL",
    what: "Bolts, rivet rows, vent slits and a fuel-cap hatch on the left side armour plate, plus tow hooks at the front bumper.",
    at: [1.32, 1.2, 1.2],
    normal: [1, 0, 0],
    bone: null,
    room: [0.2, 0.7, 2.4],
  },
  {
    id: "cabCamo",
    kind: "texture",
    part: "cabBody",
    what: "Dark urban digital camo in HULL, HULL_DARK and HULL_LIGHT blocks over the cab sides, with a faded white convoy unit number near the door.",
  },
  {
    id: "podPanels",
    kind: "texture",
    part: "podBody",
    what: "Sealed-pod surface: POD white panel seams, scuff marks near the bottom in POD_DARK, and hazard stripes in HAZARD and BLACK near the end rings.",
  },
  {
    id: "chassisGrime",
    kind: "texture",
    part: "chassis",
    what: "Road grime on the chassis and armour: mud gradient rising from the bottom, oil streaks, stencilled warning text.",
  },
] as const;

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "convoyHauler" });

  const box = (size: [number, number, number], at: [number, number, number], color: string, name?: string, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, name, rotation: rot });
  const cyl = (r0: number, r1: number, len: number, at: [number, number, number], axis: "x" | "y" | "z", color: string, seg = 8, name?: string) =>
    b.part(new THREE.CylinderGeometry(r1, r0, len, seg), color, {
      at,
      name,
      dir: axis === "x" ? [1, 0, 0] : axis === "y" ? [0, 1, 0] : [0, 0, 1],
    });
  const lamp = (size: [number, number, number], at: [number, number, number], color: string, k = 1.4) =>
    glow(box(size, at, color), k);

  // ---------- chassis ----------
  box([2.3, 0.45, 8.9], [0, 0.85, -0.1], HULL_DARK, "chassis");
  box([1.7, 0.3, 8.4], [0, 0.55, -0.1], BLACK, "undercarriage");
  // side armour plates (angled)
  for (const s of [1, -1]) {
    box([0.18, 0.7, 4.2], [s * 1.2, 1.15, 0.9], ARMOR, s > 0 ? "sidePlateL" : "sidePlateR", [0, 0, s * -6]);
    box([0.1, 0.3, 4.0], [s * 1.28, 0.8, 0.9], HULL_LIGHT);
    // underglow
    lamp([0.06, 0.06, 6.4], [s * 1.18, 0.5, -0.5], CYAN, 1.6);
    // rear skirt
    box([0.14, 0.5, 2.2], [s * 1.2, 1.0, -3.2], ARMOR);
  }

  // ---------- wheels ----------
  const axles = [3.1, -1.5, -3.1];
  for (const s of [1, -1])
    for (const z of axles) {
      const R = 0.62;
      cyl(R, R, 0.55, [s * 1.35, R, z], "x", TIRE, 10, "tire");
      cyl(0.38, 0.38, 0.58, [s * 1.35, R, z], "x", RIM, 8, "rim");
      glow(cyl(0.16, 0.16, 0.6, [s * 1.37, R, z], "x", CYAN, 6, "hub"), 1.5);
      // fender arch
      box([0.7, 0.12, 1.6], [s * 1.35, 1.32, z], ARMOR, "fender");
      box([0.12, 0.35, 1.6], [s * 1.68, 1.18, z], ARMOR);
      box([0.12, 0.35, 1.6], [s * 1.02, 1.18, z], ARMOR);
    }
  // axle beams
  for (const z of axles) cyl(0.12, 0.12, 2.8, [0, 0.62, z], "x", HULL_DARK, 6);

  // ---------- cab ----------
  box([2.7, 1.3, 2.3], [0, 1.95, 3.0], HULL, "cabBody");
  box([2.5, 0.2, 2.0], [0, 2.7, 3.0], ARMOR, "cabRoof");
  // upper cab (greenhouse)
  box([2.4, 0.9, 1.7], [0, 2.75, 2.7], HULL_LIGHT, "cabUpper");
  box([2.3, 0.14, 1.6], [0, 3.27, 2.6], ARMOR, "cabRoof");
  // sloped windshield
  box([2.1, 0.75, 0.08], [0, 2.8, 3.6], GLASS, "windshield", [-28, 0, 0]);
  glow(box([1.9, 0.08, 0.06], [0, 3.05, 3.68], CYAN), 1.2);
  // side windows
  for (const s of [1, -1]) {
    box([0.06, 0.55, 1.2], [s * 1.22, 2.8, 2.8], GLASS);
    box([0.1, 0.12, 1.3], [s * 1.22, 3.12, 2.8], BLACK);
    box([0.14, 0.9, 0.1], [s * 1.36, 1.95, 3.7], ARMOR);
    // door seam & handle
    box([0.05, 1.0, 0.05], [s * 1.36, 1.9, 2.3], BLACK);
    box([0.07, 0.07, 0.3], [s * 1.37, 2.05, 2.7], RIM);
    // mirror
    box([0.35, 0.3, 0.06], [s * 1.75, 2.7, 3.6], BLACK);
    box([0.4, 0.05, 0.05], [s * 1.55, 2.6, 3.6], ARMOR);
    // hazard shoulder stripe
    for (let i = 0; i < 4; i++) box([0.06, 0.22, 0.2], [s * 1.37, 1.45, 2.2 + i * 0.4], i % 2 ? BLACK : HAZARD);
    // headlights
    lamp([0.5, 0.18, 0.08], [s * 0.85, 1.65, 4.28], CYAN, 1.8);
    lamp([0.18, 0.18, 0.08], [s * 1.18, 1.65, 4.28], MAGENTA, 1.6);
  }

  // ---------- nose ----------
  box([2.5, 0.95, 1.2], [0, 1.5, 4.3], HULL, "nose");
  box([2.3, 0.25, 1.0], [0, 2.1, 4.2], ARMOR, "hood", [10, 0, 0]);
  box([1.9, 0.6, 0.12], [0, 1.4, 4.92], HULL_DARK, "grilleSlot");
  // ram bumper
  box([2.8, 0.5, 0.35], [0, 0.95, 4.85], ARMOR, "bumper");
  for (let i = 0; i < 7; i++) box([0.22, 0.38, 0.06], [-1.2 + i * 0.4, 0.95, 5.05], i % 2 ? BLACK : HAZARD);
  for (const s of [1, -1]) {
    box([0.3, 0.55, 0.5], [s * 1.5, 1.0, 4.7], ARMOR);
    box([0.1, 0.5, 0.1], [s * 1.5, 1.5, 4.8], HULL_LIGHT);
  }

  // ---------- exhausts ----------
  for (const s of [1, -1]) {
    cyl(0.17, 0.17, 1.9, [s * 1.25, 2.55, 1.75], "y", HULL_LIGHT, 8, s > 0 ? "exhaustL" : "exhaustR");
    cyl(0.2, 0.2, 0.25, [s * 1.25, 3.55, 1.75], "y", BLACK, 8);
    box([0.12, 0.12, 0.5], [s * 1.25, 1.7, 1.78], ARMOR);
  }

  // ---------- turret ----------
  cyl(0.55, 0.55, 0.15, [0, 3.38, 2.1], "y", BLACK, 10, "turretRing");
  cyl(0.45, 0.42, 0.45, [0, 3.62, 2.1], "y", ARMOR, 8, "turretBase");
  box([0.7, 0.35, 0.8], [0, 3.95, 2.15], HULL, "turretHead");
  for (const s of [1, -1]) cyl(0.06, 0.06, 1.2, [s * 0.22, 3.95, 2.95], "z", BLACK, 6, "barrel");
  lamp([0.15, 0.1, 0.06], [0, 4.0, 2.56], CYAN);

  // ---------- cargo pod ----------
  // cradle frame
  box([2.0, 0.2, 5.4], [0, 1.2, -1.4], BLACK, "cradle");
  for (const z of [0.8, -1.2, -3.2]) {
    for (const s of [1, -1]) {
      box([0.18, 0.9, 0.3], [s * 0.85, 1.65, z], ARMOR, "cradleArm");
      box([0.3, 0.14, 0.4], [s * 1.0, 2.0, z], HULL_LIGHT);
    }
  }
  // pod body
  b.rod([0, 2.4, -4.1], [0, 2.4, 1.3], 1.05, POD, { sides: 8, caps: "flat", name: "podBody" });
  b.rod([0, 2.4, -4.5], [0, 2.4, -4.1], [0.65, 1.05], POD_DARK, { sides: 8, caps: "flat", name: "podRear" });
  b.rod([0, 2.4, 1.3], [0, 2.4, 1.55], [1.05, 0.7], POD_DARK, { sides: 8, caps: "flat", name: "podFront" });
  // reinforcing rings
  for (const z of [-3.7, -2.4, -0.4, 0.9]) b.rod([0, 2.4, z - 0.12], [0, 2.4, z + 0.12], 1.12, HULL, { sides: 8, caps: "flat", name: "podRing" });
  // seal band
  b.rod([0, 2.4, -2.3], [0, 2.4, -1.5], 1.09, ARMOR, { sides: 8, caps: "flat", name: "podSealBand" });
  glow(b.rod([0, 2.4, -2.0], [0, 2.4, -1.8], 1.13, AMBER, { sides: 8, caps: "flat" }), 1.3);
  // top ridge and latches
  box([0.5, 0.12, 4.6], [0, 3.5, -1.6], HULL_LIGHT, "podRidge");
  for (const s of [1, -1]) for (const z of [-3.5, -0.7]) box([0.2, 0.3, 0.35], [s * 1.0, 3.0, z], BLACK);
  // rear lights
  for (const s of [1, -1]) {
    lamp([0.25, 0.2, 0.08], [s * 0.5, 2.0, -4.78], MAGENTA, 1.6);
    box([0.5, 0.1, 0.1], [s * 0.5, 1.75, -4.75], HAZARD);
  }
  // rear bumper / hitch
  box([2.4, 0.35, 0.3], [0, 1.0, -4.5], ARMOR, "rearBumper");

  // ---------- cab-to-pod connector ----------
  box([1.6, 0.5, 0.8], [0, 1.6, 1.7], ARMOR, "gooseneck");
  for (const s of [1, -1]) box([0.1, 0.1, 1.2], [s * 0.4, 1.9, 1.5], BLACK); // hoses

  for (const add of STAGE2) add(b);
  return b.root;
}
