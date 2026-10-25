```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

// ---------- palette (top level so stage 2 can use it) ----------
export const HULL = "#4b5a4a";
export const HULL_DARK = "#2f3a33";
export const ARMOR = "#242a30";
export const METAL = "#5d6670";
export const BLACK = "#0f1217";
export const GLASS = "#0c2a3a";
export const CYAN = "#19f0ff";
export const MAGENTA = "#ff2fa8";
export const AMBER = "#ffb02e";
export const RED = "#ff2a3a";
export const WHITE = "#e8f4ff";
export const RUBBER = "#1a1c20";

export const meta = {
  name: "hoverPickup",
  description: "Militarized pickup truck converted to four hover thrusters, low-poly cyberpunk.",
};

export const REQUESTS = [
  {
    id: "roofLightBar",
    kind: "add",
    part: "cab",
    what: "Neon light bar across the cab roof: a slim black housing, six lamps alternating CYAN and MAGENTA (glowing), end brackets and two small amber strobes at the ends.",
    at: [0, 1.9, 0.25],
    normal: [0, 1, 0],
    bone: null,
    room: [1.6, 0.2, 0.3],
  },
  {
    id: "frontGrille",
    kind: "add",
    part: "frontFascia",
    what: "Aggressive grille on the front fascia: dark slats, a CYAN glowing centre strip, angular ARMOR frame and small tow hooks below.",
    at: [0, 0.85, 2.72],
    normal: [0, 0, 1],
    bone: null,
    room: [1.2, 0.4, 0.15],
  },
  {
    id: "roofTurret",
    kind: "add",
    part: "turretRing",
    what: "Remote weapon station on the roof ring: rotating armoured housing, twin short barrels with muzzle brakes, a camera eye glowing RED and an ammo box on the side.",
    at: [0, 1.95, -0.1],
    normal: [0, 1, 0],
    bone: null,
    room: [0.8, 0.6, 1.0],
  },
  {
    id: "bedCargo",
    kind: "add",
    part: "bedFloor",
    what: "Cargo in the bed: stacked ARMOR crates with CYAN stencil marks, a coil of cables, a glowing AMBER battery cell and tie-down straps.",
    at: [0, 1.25, -1.7],
    normal: [0, 1, 0],
    bone: null,
    room: [1.5, 0.5, 1.6],
  },
  {
    id: "antennaArray",
    kind: "add",
    part: "exhaustL",
    what: "Antenna array on the rear-left of the cab: one tall whip with a MAGENTA tip, a small dish and two shorter rods with blinking AMBER nodes.",
    at: [0.8, 1.7, -0.75],
    normal: [0, 1, 0],
    bone: null,
    room: [0.5, 1.2, 0.4],
  },
  {
    id: "thrusterVentsL",
    kind: "add",
    part: "podFL",
    what: "Detail the outer face of the front-left hover pod: heat-vent louvres, a glowing CYAN status strip, bolted cover plates, and a fan hub inside the top intake.",
    at: [1.65, 0.6, 1.7],
    normal: [1, 0, 0],
    bone: null,
    room: [0.2, 0.5, 0.7],
  },
  {
    id: "thrusterVentsR",
    kind: "add",
    part: "podRL",
    what: "Detail the outer face of the rear-right hover pod: heat-vent louvres, MAGENTA status strip, bolted plates, and a stabiliser fin angled outward.",
    at: [-1.65, 0.6, -1.6],
    normal: [-1, 0, 0],
    bone: null,
    room: [0.3, 0.5, 0.7],
  },
  {
    id: "doorInsignia",
    kind: "add",
    part: "cab",
    what: "Unit emblem on the left cab door: a hexagonal badge with a MAGENTA skull-and-circuit motif, small CYAN stencil numerals and a door handle plus armoured window slit trim.",
    at: [0.93, 1.35, 0.3],
    normal: [1, 0, 0],
    bone: null,
    room: [0.1, 0.5, 0.7],
  },
  {
    id: "hoodScoop",
    kind: "add",
    part: "hood",
    what: "Hood details: an angular armour scoop with CYAN glowing intake edge, two pairs of exposed bolts, a wiper rack at the windshield base and a thin MAGENTA hood-edge line.",
    at: [0, 1.25, 1.9],
    normal: [0, 1, 0],
    bone: null,
    room: [1.2, 0.25, 1.0],
  },
  {
    id: "rearLights",
    kind: "add",
    part: "tailgate",
    what: "Tailgate: licence holo-plate glowing CYAN, a wide RED light strip, hinge latches, and a pair of rear tow shackles.",
    at: [0, 1.25, -2.74],
    normal: [0, 0, -1],
    bone: null,
    room: [1.7, 0.4, 0.12],
  },
  {
    id: "skirtArmor",
    kind: "texture",
    part: "skirtL",
    what: "Side skirts (skirtL and skirtR): hazard chevrons in AMBER and BLACK on the lower edge, scuffs and bolt rows.",
  },
  {
    id: "hullCamo",
    kind: "texture",
    part: "hullSideL",
    what: "Urban digital camo in HULL, HULL_DARK and METAL on hullSideL, hullSideR, hood and cab; faded grime near wheel pods and a neon CYAN pin stripe.",
  },
  {
    id: "windshieldHud",
    kind: "texture",
    part: "windshield",
    what: "Tinted glass with faint CYAN scanlines and a HUD overlay (targeting reticle, small readouts), kept dark so glass reads.",
  },
  {
    id: "bedFloorTread",
    kind: "texture",
    part: "bedFloor",
    what: "Diamond-plate tread pattern in METAL and ARMOR with oil stains and a few glowing CYAN grid lines.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "hoverPickup" });

  const box = (name: string, size: number[], at: number[], color: string, rot?: number[], g = 0) => {
    const p = b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at: at as [number, number, number],
      name,
      ...(rot ? { rotation: rot as [number, number, number] } : {}),
    });
    if (g) glow(p, g);
    return p;
  };
  const cyl = (name: string, rt: number, rb: number, h: number, seg: number, at: number[], color: string, g = 0) => {
    const p = b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: at as [number, number, number], name });
    if (g) glow(p, g);
    return p;
  };

  // ---------- chassis & hull ----------
  box("underbody", [1.7, 0.2, 5.0], [0, 0.52, 0], BLACK);
  box("hull", [1.9, 0.45, 5.4], [0, 0.82, 0], HULL);
  box("hullSideL", [0.06, 0.4, 5.2], [0.96, 0.82, 0], HULL_DARK);
  box("hullSideR", [0.06, 0.4, 5.2], [-0.96, 0.82, 0], HULL_DARK);
  for (const s of [1, -1]) {
    box(s > 0 ? "skirtL" : "skirtR", [0.08, 0.2, 3.2], [s * 1.0, 0.55, 0.1], ARMOR, [0, 0, s * 10]);
    box("underglow", [0.05, 0.03, 4.4], [s * 0.82, 0.38, 0], MAGENTA, undefined, 1.3);
  }

  // hood
  box("hood", [1.85, 0.2, 1.5], [0, 1.15, 1.95], HULL, [-4, 0, 0]);
  box("hoodRidge", [0.5, 0.06, 1.2], [0, 1.27, 1.95], ARMOR, [-4, 0, 0]);
  box("frontFascia", [1.9, 0.5, 0.12], [0, 0.85, 2.7], ARMOR);
  box("bumper", [2.05, 0.22, 0.25], [0, 0.55, 2.78], METAL);
  for (const s of [1, -1]) {
    box("bullBarPost", [0.07, 0.5, 0.07], [s * 0.7, 0.8, 2.9], METAL);
    box("headlight", [0.4, 0.12, 0.05], [s * 0.7, 1.1, 2.73], WHITE, undefined, 1.4);
    box("headlightFrame", [0.5, 0.18, 0.04], [s * 0.7, 1.1, 2.71], BLACK);
  }
  box("bullBar", [1.5, 0.07, 0.07], [0, 1.05, 2.9], METAL);

  // cab
  const cabOutline: [number, number][] = [
    [-0.7, 1.05],
    [-0.7, 1.8],
    [0.45, 1.85],
    [1.2, 1.2],
    [1.2, 1.05],
  ];
  b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.8, color: HULL, name: "cab" });
  const glassOutline: [number, number][] = [
    [-0.5, 1.4],
    [-0.5, 1.72],
    [0.35, 1.76],
    [0.85, 1.4],
  ];
  b.extrude(glassOutline, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.84, color: GLASS, name: "sideGlass" });
  box("windshield", [1.6, 0.03, 0.99], [0, 1.54, 0.84], GLASS, [41, 0, 0]);
  box("rearWindow", [1.5, 0.3, 0.03], [0, 1.55, -0.71], GLASS);
  box("roofPlate", [1.7, 0.06, 1.0], [0, 1.88, -0.1], ARMOR);
  for (const s of [1, -1]) {
    box("pillarArmor", [0.08, 0.5, 0.1], [s * 0.9, 1.5, 0.4], ARMOR, [0, 0, 0]);
    box("mirror", [0.08, 0.14, 0.2], [s * 1.0, 1.45, 0.95], BLACK);
    box("mirrorArm", [0.12, 0.04, 0.04], [s * 0.95, 1.4, 0.95], METAL);
  }
  cyl("turretRing", 0.32, 0.36, 0.1, 10, [0, 1.95, -0.1], METAL);

  // bed
  box("bedFloor", [1.8, 0.06, 1.95], [0, 1.08, -1.72], ARMOR);
  box("tailgate", [1.9, 0.45, 0.08], [0, 1.28, -2.7], HULL);
  for (const s of [1, -1]) {
    box("bedWall", [0.1, 0.45, 2.0], [s * 0.9, 1.3, -1.7], HULL);
    box("bedRail", [0.05, 0.04, 2.0], [s * 0.9, 1.54, -1.7], CYAN, undefined, 1.1);
    const e = cyl(s > 0 ? "exhaustL" : "exhaustR", 0.07, 0.07, 0.9, 6, [s * 0.78, 1.5, -0.78], METAL);
    cyl("exhaustTip", 0.09, 0.09, 0.08, 6, [s * 0.78, 1.97, -0.78], BLACK);
    void e;
    box("rollBarPost", [0.07, 0.5, 0.07], [s * 0.78, 1.35, -0.8], METAL);
    box("taillight", [0.4, 0.1, 0.04], [s * 0.7, 1.12, -2.76], RED, undefined, 1.3);
  }

  // ---------- hover pods ----------
  const pods: [string, number, number][] = [
    ["podFL", 1.3, 1.7],
    ["podFR", -1.3, 1.7],
    ["podRL", 1.3, -1.6],
    ["podRR", -1.3, -1.6],
  ];
  for (const [n, x, z] of pods) {
    const s = Math.sign(x);
    box("podArm", [0.5, 0.18, 0.4], [s * 1.05, 0.75, z], ARMOR);
    cyl(n, 0.44, 0.36, 0.55, 8, [x, 0.6, z], HULL_DARK);
    cyl("podRim", 0.47, 0.47, 0.06, 8, [x, 0.9, z], METAL);
    cyl("intake", 0.32, 0.32, 0.04, 8, [x, 0.94, z], BLACK);
    cyl("thrustCore", 0.28, 0.28, 0.04, 8, [x, 0.3, z], s > 0 ? CYAN : MAGENTA, 1.8);
    cyl("nozzle", 0.38, 0.34, 0.08, 8, [x, 0.34, z], METAL);
    // landing leg + foot
    box("legStrut", [0.08, 0.32, 0.08], [x + s * 0.4, 0.2, z], METAL);
    box("footPad", [0.3, 0.06, 0.5], [x + s * 0.4, 0.03, z], BLACK);
  }

  for (const add of STAGE2) add(b);
  return b.root;
}
```