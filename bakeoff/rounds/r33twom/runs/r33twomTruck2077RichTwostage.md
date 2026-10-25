<!-- call: stage1 -->

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

<!-- call: texture -->

- **hullCamo:** `hullSideL` and `hullSideR` get a blocky night-city digital camo (HULL_DARK, HULL and HULL_LIGHT in 14 cm cells). A faded "77" unit number reads correctly from outside on both sides, and a CYAN circuit trace with nodes runs along the top margin. The stage 1 inset panels cover most of each face, so the number and trace sit in the visible margins.
- **cabPaint:** The cab extrude gets scuffed HULL with STEEL chips along the lower and rear edges. A diagonal WARN stripe sits near the rear, and a MAGENTA diamond emblem with a dark centre sits on each door.
- **roofPlates:** `bedRoof` gets a panel grid with seam bevels and rivets at the panel corners. A hatch outline sits round the hatch, with an anti-slip grid patch and faint CYAN glyph blocks near the rear.

<<<<<<< SEARCH
import { createBuilder, rng } from "agentic-3js-builder";
=======
import { createBuilder, rng, paint, noise, mix } from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
export const RED = "#ff2a3a";
=======
export const RED = "#ff2a3a";

// Stage 2 paints
const hs = (a: number, b: number) => {
  const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const inR = (v: number, a: number, b: number) => v >= a && v <= b;

const CAMO = paint((p, n) => {
  if (Math.abs(n.x) < 0.5) return HULL_DARK;
  const left = n.x > 0;
  const c = 0.14;
  const iz = Math.floor(p.z / c);
  const iy = Math.floor(p.y / c);
  const q = p.clone();
  q.set(left ? 0 : 40, (iy + 0.5) * c, (iz + 0.5) * c);
  const v = noise(q, 0.5, 3) * 0.7 + hs(iz, iy) * 0.3;
  let col: ColorInput = v < 0.4 ? HULL_DARK : v < 0.62 ? HULL : HULL_LIGHT;
  // faded unit number "77" in the lower margin of the middle panel
  const u = left ? -p.z : p.z;
  const uc = left ? 1.55 : -1.55;
  for (const u0 of [uc - 0.14, uc + 0.04]) {
    const du = u - u0;
    const dy = p.y - 1.6;
    if ((inR(du, 0, 0.08) && inR(dy, 0.14, 0.16)) || (inR(du, 0.055, 0.075) && inR(dy, 0, 0.16)))
      col = mix(col instanceof Object ? HULL : (col as string), "#aab3bd", 0.6);
  }
  // cyan circuit trace along the top margin
  const z = p.z;
  const y = p.y;
  const trace =
    (inR(z, -3.8, -2.6) && inR(y, 2.785, 2.805)) ||
    (inR(z, -3.21, -3.19) && inR(y, 2.72, 2.8)) ||
    (inR(z, -2.81, -2.79) && inR(y, 2.8, 2.86)) ||
    (Math.hypot(z + 3.2, y - 2.72) < 0.03) ||
    (Math.hypot(z + 2.8, y - 2.86) < 0.025);
  if (trace) return CYAN;
  return col;
});

const CABPAINT = paint((p, n, s) => {
  const sx = s[0];
  const sy = s[1];
  const nz = noise(p, 0.06, 11);
  let base: ColorInput = nz < 0.3 ? mix(HULL, BLACK, 0.18) : nz > 0.75 ? mix(HULL, HULL_LIGHT, 0.5) : HULL;
  if (n.y > 0.6) return mix(HULL_LIGHT, HULL, 0.4 + 0.2 * nz);
  if (Math.abs(n.x) < 0.5) return base;
  // chipped edges to bare steel
  const edge = Math.min(sy - 1.45, sx - 1.4, 3.9 - sx);
  if (edge < 0.14 && noise(p, 0.05, 5) > 0.45 + edge * 2.2) return STEEL;
  // diagonal warning stripe near the rear
  const d = sx - 1.55 - (sy - 1.45) * 0.5;
  if (inR(d, 0, 0.2) && sx < 2.2 && sy < 2.4) return Math.floor((sy + sx) / 0.1) % 2 ? WARN : mix(WARN, BLACK, 0.8);
  // corporate emblem on the door
  const dz = sx - 2.4;
  const dy = sy - 1.85;
  const m = Math.abs(dz) + Math.abs(dy);
  if (m < 0.075) return BLACK;
  if (m < 0.17) return MAGENTA;
  if (Math.abs(dz) < 0.2 && Math.abs(dy) < 0.02 && m > 0.2) return MAGENTA;
  return base;
});

const ROOFPLATES = paint((p, n) => {
  if (n.y < 0.5) return HULL_DARK;
  const pw = 0.9;
  const pl = 1.0;
  const fx = (((p.x + 1.45) % pw) + pw) % pw;
  const fz = (((p.z + 4) % pl) + pl) % pl;
  let col: ColorInput = mix(HULL_LIGHT, HULL, 0.25 * noise(p, 0.3, 2));
  if (fx < 0.015 || fz < 0.015) return BLACK;
  if (fx < 0.04 || fz < 0.04) col = mix(col as string, STEEL, 0.35);
  // rivets at panel corners and edges
  const rx = ((fx / 0.3) % 1) * 0.3 - 0.15;
  const rz = ((fz / 0.3) % 1) * 0.3 - 0.15;
  if ((fx < 0.075 || fz < 0.075) && Math.hypot(rx + 0.0, rz) < 0.03 + 0 && (fx < 0.075 && fz < 0.075)) return STEEL;
  // hatch outline
  const hx = Math.abs(p.x + 0.7);
  const hz = Math.abs(p.z + 2.2);
  if (hx < 0.52 && hz < 0.52 && (hx > 0.495 || hz > 0.495)) return BLACK;
  // anti-slip grid
  if (inR(p.x, 0.1, 1.3) && inR(p.z, -3.8, -1.0)) {
    const gx = ((p.x * 100) % 6 + 6) % 6;
    const gz = ((p.z * 100) % 6 + 6) % 6;
    if (gx < 1.2 || gz < 1.2) col = mix(col as string, BLACK, 0.5);
  }
  // faint cyan glyph blocks
  if (inR(p.x, -1.3, -0.2) && inR(p.z, -4.0, -3.4)) {
    const iz = Math.floor((p.z + 4) / 0.07);
    const ix = Math.floor((p.x + 1.3) / 0.07);
    if (hs(ix, iz) > 0.62 && hs(iz, 9) > 0.3) col = mix(col as string, CYAN, 0.6);
  }
  return col;
});
>>>>>>> REPLACE

<<<<<<< SEARCH
  const box = (name: string, color: string, size: [number, number, number], at: [number, number, number], rot?: [number, number, number]) =>
=======
  const box = (name: string, color: ColorInput, size: [number, number, number], at: [number, number, number], rot?: [number, number, number]) =>
>>>>>>> REPLACE

<<<<<<< SEARCH
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.6, bevel: 0.06, color: HULL, name: "cab" },
=======
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.6, bevel: 0.06, color: CABPAINT, name: "cab" },
>>>>>>> REPLACE

<<<<<<< SEARCH
      box(nm, i === 1 ? HULL : HULL_LIGHT, [0.1, 1.3, 1.5], [s * 1.45, 2.25, z]);
=======
      box(nm, CAMO, [0.1, 1.3, 1.5], [s * 1.45, 2.25, z]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  box("bedRoof", HULL_LIGHT, [2.9, 0.12, 5.1], [0, 3.1, -1.5]);
=======
  box("bedRoof", ROOFPLATES, [2.9, 0.12, 5.1], [0, 3.1, -1.5]);
>>>>>>> REPLACE

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { svg } from "agentic-3js-builder";

export function addRoofLightBar(b: Builder) {
  const Y = 3.3;
  const Z = 2.6;
  const BRACKET = "#30363f";

  // housing: long dark body with a lower lip and a front visor
  b.part(new THREE.BoxGeometry(2.1, 0.16, 0.3), BLACK, { at: [0, Y + 0.12, Z], name: "lightBarHousing" });
  b.part(new THREE.BoxGeometry(2.14, 0.04, 0.34), HULL_DARK, { at: [0, Y + 0.04, Z], name: "lightBarBase" });
  b.part(new THREE.BoxGeometry(2.12, 0.04, 0.14), HULL_DARK, { at: [0, Y + 0.24, Z + 0.1], rotation: [-20, 0, 0], name: "lightBarVisor" });

  // six lamps alternating cyan / magenta, each with a frame and lens
  for (let i = 0; i < 6; i++) {
    const x = -0.75 + i * 0.3;
    const c = i % 2 ? MAGENTA : CYAN;
    b.part(new THREE.BoxGeometry(0.26, 0.12, 0.03), STEEL, { at: [x, Y + 0.12, Z + 0.155], name: "lampFrame" });
    glow(b.part(new THREE.BoxGeometry(0.22, 0.08, 0.04), c, { at: [x, Y + 0.12, Z + 0.17], name: "lampLens" }), 1.6);
    // glow reflector on the housing top
    glow(b.part(new THREE.BoxGeometry(0.1, 0.02, 0.1), c, { at: [x, Y + 0.205, Z - 0.02], name: "lampTop" }), 1.2);
  }
  // dividers between lamps
  for (let i = 0; i <= 6; i++) {
    b.part(new THREE.BoxGeometry(0.04, 0.14, 0.05), HULL_DARK, { at: [-0.9 + i * 0.3, Y + 0.12, Z + 0.15], name: "lampDivider" });
  }

  // end brackets, amber beacons and mounting feet
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.28, 0.36), BRACKET, { at: [s * 1.08, Y + 0.14, Z], name: "endBracket" });
    b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.05, 8), STEEL, { at: [s * 1.08, Y + 0.3, Z], name: "beaconBase" });
    glow(b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8), AMBER, { at: [s * 1.08, Y + 0.37, Z], name: "beacon" }), 1.7);
    b.part(new THREE.SphereGeometry(0.05, 6, 4), AMBER, { at: [s * 1.08, Y + 0.43, Z], name: "beaconCap" });
    for (const dx of [0.4, -0.4]) {
      b.part(new THREE.BoxGeometry(0.1, 0.06, 0.2), HULL_DARK, { at: [s * 0.7 + dx * 0.0 + (dx > 0 ? 0.25 : -0.25) * s, Y + 0.02, Z], name: "mountFoot" });
    }
    for (const dz of [0.1, -0.1]) {
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 5), STEEL, { at: [s * 1.08, Y + 0.29, Z + dz], name: "bracketBolt" });
    }
  }

  // small text/glyph decal plate on housing top
  const tex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#101418"/><path d="M2 8H14L18 3H30L34 13H46L50 8H62" stroke="#19f3ff" stroke-width="1.6" fill="none"/><circle cx="6" cy="8" r="1.5" fill="#ff2bd6"/><circle cx="58" cy="8" r="1.5" fill="#ff2bd6"/></svg>`,
    { size: 128 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.7, 0.14), "#ffffff", { at: [0, Y + 0.205, Z + 0.07], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: tex, name: "barGlyph" }),
    0.8,
  );

  // cable run from bar to the roof
  b.rod([0.9, Y + 0.03, Z - 0.17], [0.9, Y + 0.03, Z - 0.5], 0.02, BLACK, { name: "barCable" });
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addFrontGrille(b: Builder) {
  const Z = 3.99;
  const box = (c: string, s: [number, number, number], at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), c, { at, rotation: rot, name: "grille" });

  // steel frame around the grille opening
  box(STEEL, [2.2, 0.07, 0.12], [0, 2.12, Z]);
  box(STEEL, [2.2, 0.07, 0.12], [0, 1.44, Z]);
  for (const s of [1, -1]) {
    box(STEEL, [0.07, 0.75, 0.12], [s * 1.1, 1.78, Z]);
    box(HULL_LIGHT, [0.12, 0.6, 0.1], [s * 1.02, 1.78, Z + 0.02]);
    // corner bolts
    for (const y of [1.5, 2.06]) b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), BLACK, { at: [s * 1.1, y, Z + 0.07], dir: [0, 0, 1], name: "grilleBolt" });
  }

  // angled slats with glowing strips between them
  const n = 7;
  for (let i = 0; i < n; i++) {
    const y = 1.52 + i * 0.09;
    box(HULL_DARK, [1.9, 0.07, 0.14], [0, y, Z + 0.03], [-28, 0, 0]);
    box(HULL_LIGHT, [1.9, 0.015, 0.03], [0, y + 0.03, Z + 0.1], [-28, 0, 0]);
    if (i < n - 1) glow(b.part(new THREE.BoxGeometry(1.8, 0.018, 0.04), CYAN, { at: [0, y + 0.045, Z + 0.01], name: "grilleGlow" }), 1.5);
  }

  // vertical armoured ribs
  for (const x of [-0.75, -0.38, 0.38, 0.75]) box(HULL_DARK, [0.05, 0.62, 0.16], [x, 1.78, Z + 0.06]);

  // central emblem plate
  box(STEEL, [0.46, 0.46, 0.05], [0, 1.78, Z + 0.17], [0, 0, 45]);
  box(BLACK, [0.36, 0.36, 0.03], [0, 1.78, Z + 0.2], [0, 0, 45]);
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 4 L58 18 L58 40 L32 60 L6 40 L6 18Z" fill="#0b0c10" stroke="#19f3ff" stroke-width="5" stroke-linejoin="round"/><path d="M32 16 L44 38 L32 33 L20 38Z" fill="#ff2bd6"/><circle cx="32" cy="46" r="3.5" fill="#19f3ff"/></svg>`,
    { size: 128 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.32, 0.32), "#ffffff", { at: [0, 1.78, Z + 0.225], dir: [0, 0, 1], axis: "z", texture: emblem, name: "grilleEmblem" }),
    1.1,
  );

  // small amber side marker lamps on the frame
  for (const s of [1, -1]) glow(b.part(new THREE.BoxGeometry(0.1, 0.06, 0.05), AMBER, { at: [s * 1.1, 1.78, Z + 0.09], name: "grilleMarker" }), 1.3);
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addTurretFittings(b: Builder) {
  const R = rng(23);
  const part = (g: THREE.BufferGeometry, c: string, at: [number, number, number], o: any = {}) =>
    b.part(g, c, { at, ...o });
  const cylG = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);
  const boxG = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // Railgun turret fittings: turret body centred (0,3.8,-0.8), barrels at x=+-0.3 along z up to 2.0
  for (const s of [1, -1]) {
    // capacitor coils (cyan rings) along barrels
    for (let i = 0; i < 5; i++) {
      const z = 0.5 + i * 0.28;
      glow(part(new THREE.TorusGeometry(0.13, 0.025, 5, 10), CYAN, [s * 0.3, 3.8, z], { name: "capRing" }), 1.4);
      part(cylG(0.15, 0.05, 8), HULL_DARK, [s * 0.3, 3.8, z + 0.1], { dir: [0, 0, 1], name: "capSpacer" });
    }
    // muzzle brake
    part(cylG(0.12, 0.22, 8), HULL_DARK, [s * 0.3, 3.8, 1.92], { dir: [0, 0, 1], name: "muzzleBrake" });
    for (const y of [1, -1]) part(boxG(0.2, 0.03, 0.14), STEEL, [s * 0.3, 3.8 + y * 0.12, 1.92], { name: "brakeFin" });
    part(boxG(0.03, 0.2, 0.14), STEEL, [s * 0.3 + 0.12, 3.8, 1.92], { name: "brakeFinS" });
    part(boxG(0.03, 0.2, 0.14), STEEL, [s * 0.3 - 0.12, 3.8, 1.92], { name: "brakeFinS2" });
    // heat sink fins on turret top
    for (let i = 0; i < 6; i++)
      part(boxG(0.35, 0.16, 0.04), i % 2 ? STEEL : HULL_DARK, [s * 0.38, 4.15, -1.25 + i * 0.1], { name: "heatFin" });
    // side braces
    part(boxG(0.06, 0.3, 0.9), STEEL, [s * 0.78, 3.95, -0.8], { name: "turretBrace" });
  }
  // ammo feed box on the left side
  part(boxG(0.4, 0.45, 0.8), HULL, [0.98, 3.75, -0.9], { name: "ammoBox" });
  part(boxG(0.44, 0.08, 0.84), HULL_DARK, [0.98, 3.99, -0.9], { name: "ammoLid" });
  for (let i = 0; i < 3; i++) glow(part(boxG(0.03, 0.08, 0.2), AMBER, [1.19, 3.75, -1.1 + i * 0.2], { name: "ammoLamp" }), 1.2);
  part(cylG(0.05, 0.5, 6), BLACK, [0.8, 3.75, -0.4], { dir: [0, 0, 1], name: "feedChute" });
  // sensor dome on top
  part(cylG(0.2, 0.1, 8), HULL_DARK, [0, 4.1, -1.0], { name: "domeBase" });
  part(new THREE.SphereGeometry(0.17, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, [0, 4.15, -1.0], { name: "dome" });
  glow(part(new THREE.SphereGeometry(0.07, 6, 4), MAGENTA, [0, 4.2, -0.87], { name: "sensorLens" }), 1.6);
  part(boxG(0.5, 0.04, 0.04), BLACK, [0, 4.35, -1.0], { name: "sensorBar" });
  // front rail glow line
  glow(part(boxG(0.9, 0.04, 0.04), CYAN, [0, 3.62, -0.1], { name: "turretStrip" }), 1.2);

  // Antenna array at rear of bed roof, around (0.8,3.1,-3.2)
  const cx = 0.8, cz = -3.2, y0 = 3.17;
  part(boxG(0.9, 0.08, 0.9), HULL_DARK, [cx, y0, cz], { name: "antennaPlate" });
  const whips: [number, number, number][] = [[-0.3, -0.3, 1.3], [0.3, -0.3, 0.9], [-0.3, 0.3, 0.7], [0.3, 0.3, 1.1]];
  whips.forEach(([dx, dz, h], i) => {
    part(cylG(0.06, 0.12, 6), STEEL, [cx + dx, y0 + 0.1, cz + dz], { name: "whipMount" });
    b.rod([cx + dx, y0 + 0.14, cz + dz], [cx + dx, y0 + 0.14 + h, cz + dz], [0.025, 0.008], BLACK, { name: "whip" });
    part(cylG(0.035, 0.05, 5), STEEL, [cx + dx, y0 + 0.14 + h * 0.5, cz + dz], { name: "whipCollar" });
    glow(part(new THREE.SphereGeometry(0.04, 5, 4), i % 2 ? AMBER : RED, [cx + dx, y0 + 0.16 + h, cz + dz], { name: "tipLamp" }), 1.6);
  });
  // dish
  part(cylG(0.04, 0.5, 6), STEEL, [cx + 0.05, y0 + 0.3, cz], { name: "dishMast" });
  part(new THREE.SphereGeometry(0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2.4), HULL_LIGHT, [cx + 0.05, y0 + 0.62, cz + 0.05],
    { rotation: [-110, 0, 0], name: "dish" });
  part(cylG(0.015, 0.3, 4), STEEL, [cx + 0.05, y0 + 0.65, cz + 0.2], { dir: [0, 0.2, 1], name: "dishFeed" });
  glow(part(new THREE.SphereGeometry(0.03, 5, 4), CYAN, [cx + 0.05, y0 + 0.7, cz + 0.36], { name: "dishLamp" }), 1.4);
  // phased array panel
  part(boxG(0.6, 0.45, 0.05), HULL_DARK, [cx - 0.1, y0 + 0.4, cz - 0.4], { name: "phasedPanel" });
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 4; j++)
      part(boxG(0.1, 0.07, 0.02), (i + j) % 2 ? HULL_LIGHT : STEEL, [cx - 0.28 + j * 0.15, y0 + 0.28 + i * 0.12, cz - 0.44], { name: "arrayCell" });
  part(boxG(0.06, 0.3, 0.06), STEEL, [cx - 0.1, y0 + 0.17, cz - 0.4], { name: "panelStand" });
  void R;
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addSideRocketPodL(b: Builder) {
  const X0 = 1.5; // bed wall outer face is ~1.5 (panel inset at 1.51)
  const Y0 = 2.3;
  const Z0 = -1.55;
  const PANEL = "#2f3640";
  const mirrorSides = [1, -1];

  for (const s of mirrorSides) {
    const wall = X0 + 0.07; // seat on the panel inset
    const podX = wall + 0.28 * 1; // pod centre offset from wall
    const cx = s * podX;

    // main pod housing
    b.part(new THREE.BoxGeometry(0.42, 0.98, 1.38), HULL_DARK, { at: [cx, Y0, Z0], name: `podBody${s}` });
    // outer armour face plate
    b.part(new THREE.BoxGeometry(0.06, 0.9, 1.3), PANEL, { at: [s * (podX + 0.23), Y0, Z0], name: `podFace${s}` });
    // top and bottom bevel caps
    b.part(new THREE.BoxGeometry(0.4, 0.07, 1.4), HULL_LIGHT, { at: [cx, Y0 + 0.5, Z0], name: `podTop${s}`, rotation: [0, 0, s * 8] });
    b.part(new THREE.BoxGeometry(0.4, 0.07, 1.4), HULL_LIGHT, { at: [cx, Y0 - 0.5, Z0], name: `podBot${s}` });

    // mounting arms to bed wall
    for (const dz of [-0.5, 0.5]) {
      for (const dy of [-0.3, 0.3]) {
        b.rod([s * (X0 + 0.02), Y0 + dy, Z0 + dz], [s * (podX - 0.1), Y0 + dy * 1.1, Z0 + dz], 0.035, STEEL, { name: `podArm${s}` });
        b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 6), STEEL, {
          at: [s * (X0 + 0.04), Y0 + dy, Z0 + dz], dir: [1, 0, 0], name: `podArmBase${s}`,
        });
      }
    }

    // 2 columns x 3 rows of launch tubes (columns along z, rows along y)
    const faceX = s * (podX + 0.27);
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 2; col++) {
        const ty = Y0 - 0.3 + row * 0.3;
        const tz = Z0 - 0.33 + col * 0.66;
        // steel rim
        b.part(new THREE.CylinderGeometry(0.135, 0.135, 0.06, 8), STEEL, { at: [faceX, ty, tz], dir: [1, 0, 0], name: `tubeRim${s}` });
        // dark bore
        b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8), BLACK, { at: [faceX + s * 0.01, ty, tz], dir: [1, 0, 0], name: `tubeBore${s}` });
        // tube body behind rim
        b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.3, 8), HULL_DARK, { at: [s * (podX + 0.12), ty, tz], dir: [1, 0, 0], name: `tubeBody${s}` });
        // missile nose inside
        const nose = b.part(new THREE.ConeGeometry(0.07, 0.14, 6), (row + col) % 2 ? RED : AMBER, {
          at: [faceX - s * 0.005, ty, tz], dir: [s, 0, 0], name: `missileNose${s}`,
        });
        glow(nose, 0.9);
        // status lamp
        glow(
          b.part(new THREE.BoxGeometry(0.03, 0.04, 0.04), (row + col) % 2 ? CYAN : MAGENTA, {
            at: [faceX + s * 0.02, ty + 0.16, tz + 0.12], name: `tubeLamp${s}`,
          }),
          1.4,
        );
      }
    }

    // hazard stripe along top edge of face
    for (let i = 0; i < 7; i++) {
      b.part(new THREE.BoxGeometry(0.02, 0.07, 0.18), i % 2 ? BLACK : WARN, {
        at: [faceX + s * 0.01, Y0 + 0.43, Z0 - 0.6 + i * 0.2], name: `podHazard${s}`,
      });
    }
    // bottom hazard strip
    for (let i = 0; i < 7; i++) {
      b.part(new THREE.BoxGeometry(0.02, 0.05, 0.18), i % 2 ? WARN : BLACK, {
        at: [faceX + s * 0.01, Y0 - 0.43, Z0 - 0.6 + i * 0.2], name: `podHazardB${s}`,
      });
    }

    // corner bolts
    for (const dy of [-0.44, 0.44]) {
      for (const dz of [-0.64, 0.64]) {
        b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), STEEL, {
          at: [faceX + s * 0.02, Y0 + dy, Z0 + dz], dir: [1, 0, 0], name: `podBolt${s}`,
        });
      }
    }
  }
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addCableBundles(b: Builder) {
  const R = rng(25);
  const HOSE = "#0f5a66";
  const CABLE = "#1a1b22";
  const COPPER = "#b8602e";

  const part = (g: THREE.BufferGeometry, color: string, at: [number, number, number], name: string, dir?: [number, number, number]) =>
    b.part(g, color, { at, name, dir });
  const cyl = (name: string, color: string, r: number, h: number, at: [number, number, number], dir: [number, number, number], seg = 8) =>
    part(new THREE.CylinderGeometry(r, r, h, seg), color, at, name, dir);

  // Driveshafts: one per axle, from a central transfer case to each diff
  cyl("s25Transfer", HULL_DARK, 0.28, 0.5, [0, 0.62, 0.6], [0, 0, 1], 8);
  b.rod([0, 0.62, 2.6], [0, 0.62, 0.8], 0.07, STEEL, { name: "s25ShaftFront" });
  b.rod([0, 0.62, 0.4], [0, 0.62, -0.8], 0.07, STEEL, { name: "s25ShaftMid" });
  b.rod([0, 0.62, -1.3], [0, 0.62, -2.4], 0.07, STEEL, { name: "s25ShaftRear" });
  for (const z of [-0.75, -1.95, 0.7, 2.2]) {
    cyl("s25UJoint", BLACK, 0.12, 0.16, [0, 0.62, z], [0, 0, 1], 6);
  }

  // Differential housings (front axle too) with bolt rings
  for (const z of [2.7, -1.0, -2.6]) {
    part(new THREE.SphereGeometry(0.3, 8, 6), HULL_DARK, [0, 0.62, z], "s25DiffHousing");
    cyl("s25DiffCover", STEEL, 0.2, 0.08, [0, 0.62, z + (z > 0 ? 0.28 : -0.28)], [0, 0, 1], 8);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const dz = z + (z > 0 ? 0.33 : -0.33);
      part(new THREE.SphereGeometry(0.02, 4, 3), RIM, [0.16 * Math.cos(a), 0.62 + 0.16 * Math.sin(a), dz], "s25DiffBolt");
    }
  }

  // Fuel tanks each side: strapped drums
  for (const s of [1, -1]) {
    cyl("s25FuelDrum", HULL_LIGHT, 0.34, 1.7, [s * 0.88, 0.58, 0.6], [0, 0, 1], 10);
    for (const z of [-0.05, 0.6, 1.25]) cyl("s25TankStrap", STEEL, 0.355, 0.07, [s * 0.88, 0.58, z], [0, 0, 1], 10);
    cyl("s25TankCap", AMBER, 0.1, 0.06, [s * 0.88, 0.58, 1.48], [0, 0, 1], 8);
    glow(b.part(new THREE.BoxGeometry(0.04, 0.06, 0.5), CYAN, { at: [s * 0.88, 0.22, 0.6], name: "s25FuelGauge" }), 1.2);
    // fuel line to engine
    b.sweep([[s * 0.88, 0.7, 1.5], [s * 0.7, 0.75, 1.9], [s * 0.55, 0.78, 2.4]], 0.035, { color: HOSE, name: "s25FuelLine" });
  }

  // Cable bundles: long runs along both sides of the driveline, with clamps
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const ox = s * (0.28 + k * 0.07);
      const oy = 0.95 - (k % 2) * 0.06;
      const pts = [
        [ox, oy, 3.2], [ox + 0.03 * s, oy - 0.1, 1.8], [ox - 0.02 * s, oy - 0.05, 0.2],
        [ox + 0.03 * s, oy - 0.12, -1.6], [ox, oy - 0.05, -3.4],
      ];
      b.sweep(pts, 0.045, { color: k === 1 ? COPPER : CABLE, name: "s25Cable", sides: 6 });
    }
    // hydraulic hoses (cyan sheath)
    const hy = [
      [s * 0.55, 0.88, 2.6], [s * 0.6, 0.7, 1.6], [s * 0.5, 0.74, -0.4],
      [s * 0.62, 0.7, -1.9], [s * 0.6, 0.85, -3.3],
    ];
    b.sweep(hy, 0.04, { color: HOSE, name: "s25Hydraulic", sides: 6 });
    glow(b.sweep(hy.map(([x, y, z]) => [x, y - 0.002, z]), 0.012, { color: CYAN, name: "s25HoseGlow", sides: 4 }), 1.3);
    // clamps along the bundle
    for (let i = 0; i < 7; i++) {
      const z = 3.0 - i * 1.0;
      part(new THREE.BoxGeometry(0.4, 0.14, 0.08), STEEL, [s * 0.4, 0.88, z], "s25Clamp");
      part(new THREE.SphereGeometry(0.025, 4, 3), BLACK, [s * 0.4, 0.8, z], "s25ClampBolt");
    }
    // hose couplings
    for (const z of [1.6, -0.4, -1.9]) cyl("s25Coupling", AMBER, 0.06, 0.1, [s * 0.58, 0.72, z], [0, 0, 1], 6);
  }

  // Suspension leaf springs & shock absorbers at each axle
  for (const z of [2.7, -1.0, -2.6]) {
    for (const s of [1, -1]) {
      for (let i = 0; i < 3; i++)
        part(new THREE.BoxGeometry(0.14, 0.04, 1.0 - i * 0.2), HULL_DARK, [s * 0.95, 0.92 - i * 0.045, z], "s25Leaf");
      cyl("s25Shock", RED, 0.04, 0.5, [s * 0.78, 0.9, z + 0.2], [0, 1, 0], 6);
      cyl("s25ShockSleeve", STEEL, 0.06, 0.25, [s * 0.78, 1.0, z + 0.2], [0, 1, 0], 6);
    }
  }

  // Skid plate under cab front with hazard markings
  part(new THREE.BoxGeometry(1.8, 0.06, 1.0), HULL_DARK, [0, 0.9, 3.5], "s25SkidPlate");
  for (let i = 0; i < 5; i++) part(new THREE.BoxGeometry(0.14, 0.02, 0.2), WARN, [-0.6 + i * 0.3, 0.86, 3.85], "s25SkidStripe");

  // Junction boxes with status lights
  for (const [x, z, c] of [[-0.45, -0.4, CYAN], [0.45, -2.0, MAGENTA], [-0.4, 1.9, AMBER]] as [number, number, string][]) {
    part(new THREE.BoxGeometry(0.3, 0.22, 0.34), HULL, [x, 0.82, z], "s25JunctionBox");
    glow(b.part(new THREE.BoxGeometry(0.07, 0.03, 0.07), c, { at: [x, 0.7, z], name: "s25StatusLamp" }), 1.5);
  }

  // Random dangling zip-tie / wire tails
  for (let i = 0; i < 6; i++) {
    const x = (R() - 0.5) * 1.2;
    const z = 2.8 - i * 1.2;
    b.sweep([[x, 0.8, z], [x + 0.05, 0.68, z + 0.04], [x + 0.08, 0.58, z + 0.02]], [0.02, 0.008], { color: CABLE, name: "s25Pigtail", sides: 4 });
  }
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addRearRamp(b: Builder) {
  const box = (c: string, s: [number, number, number], at: [number, number, number], name: string, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), c, { at, name, rotation: rot });
  const cyl = (c: string, r: number, h: number, at: [number, number, number], dir: [number, number, number], name: string, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at, dir, name });

  // ===== Rear cargo doors =====
  const Z = -4.1;
  for (const s of [1, -1]) {
    box(HULL_LIGHT, [1.22, 1.3, 0.08], [s * 0.64, 2.25, Z - 0.0], "s26doorPanel");
    box(HULL_DARK, [1.0, 1.08, 0.04], [s * 0.64, 2.25, Z - 0.06], "s26doorInset");
    box(STEEL, [1.2, 0.05, 0.05], [s * 0.64, 2.6, Z - 0.09], "s26doorBrace");
    box(STEEL, [1.2, 0.05, 0.05], [s * 0.64, 1.9, Z - 0.09], "s26doorBrace");
    // hinge plates and barrels
    for (const y of [1.75, 2.25, 2.75]) {
      box(STEEL, [0.14, 0.2, 0.05], [s * 1.2, y, Z - 0.08], "s26hingePlate");
      cyl(BLACK, 0.045, 0.24, [s * 1.27, y, Z - 0.06], [0, 1, 0], "s26hingePin", 6);
      for (const dx of [-0.04, 0.04]) b.part(new THREE.SphereGeometry(0.018, 4, 3), STEEL, { at: [s * (1.2 + dx), y + 0.07, Z - 0.11], name: "s26bolt" });
    }
    // tail light clusters
    box(BLACK, [0.5, 0.36, 0.08], [s * 1.0, 1.8, Z - 0.1], "s26lightHousing");
    glow(b.part(new THREE.BoxGeometry(0.4, 0.1, 0.05), RED, { at: [s * 1.0, 1.88, Z - 0.15], name: "s26tailTop" }), 1.4);
    glow(b.part(new THREE.BoxGeometry(0.4, 0.1, 0.05), AMBER, { at: [s * 1.0, 1.74, Z - 0.15], name: "s26tailAmber" }), 1.2);
    // bolts on door
    for (const [x, y] of [[0.2, 2.8], [1.1, 2.8], [0.2, 1.7], [1.1, 1.7]] as [number, number][])
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 5), STEEL, { at: [s * x, y, Z - 0.1], dir: [0, 0, -1], name: "s26rivet" });
  }
  // central locking bar
  box(STEEL, [0.14, 1.4, 0.07], [0, 2.25, Z - 0.12], "s26lockBar");
  for (const y of [1.85, 2.65]) {
    box(BLACK, [0.4, 0.14, 0.08], [0, y, Z - 0.16], "s26lockCatch");
    cyl(HULL_DARK, 0.06, 0.1, [0, y, Z - 0.22], [0, 0, 1], "s26lockKnob", 6);
  }
  box(BLACK, [0.1, 0.2, 0.06], [0, 2.25, Z - 0.18], "s26handle");
  glow(b.part(new THREE.BoxGeometry(0.05, 0.05, 0.03), RED, { at: [0, 2.5, Z - 0.17], name: "s26lockLed" }), 1.5);

  // Licence plate with neon frame
  const plate = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" rx="3" fill="#b9bfc4"/><rect x="2" y="2" width="60" height="28" rx="2" fill="none" stroke="#3b4450" stroke-width="1.5"/><text x="32" y="22" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="15" fill="#3b4450">AG-2077</text><path d="M6 8 L20 26 M10 5 L30 29" stroke="#8a8f94" stroke-width="1" opacity="0.5"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", { at: [0, 1.5, Z - 0.3], dir: [0, 0, -1], axis: "z", texture: plate, name: "s26plate" });
  glow(b.part(new THREE.BoxGeometry(0.6, 0.03, 0.03), CYAN, { at: [0, 1.65, Z - 0.3], name: "s26plateNeonT" }), 1.4);
  glow(b.part(new THREE.BoxGeometry(0.6, 0.03, 0.03), CYAN, { at: [0, 1.35, Z - 0.3], name: "s26plateNeonB" }), 1.4);
  for (const s of [1, -1]) glow(b.part(new THREE.BoxGeometry(0.03, 0.3, 0.03), CYAN, { at: [s * 0.3, 1.5, Z - 0.3], name: "s26plateNeonS" }), 1.4);
  box(HULL_DARK, [0.7, 0.4, 0.05], [0, 1.5, Z - 0.26], "s26plateBack");

  // Hazard bumper stripes
  for (let i = 0; i < 12; i++) box(i % 2 ? BLACK : WARN, [0.24, 0.22, 0.04], [-1.32 + i * 0.24, 1.1, -4.32], "s26bumperHazard", [0, 0, i % 2 ? 20 : -20]);
  box(STEEL, [2.9, 0.05, 0.06], [0, 1.3, -4.32], "s26bumperTrim");
  for (const s of [1, -1]) box(HULL_DARK, [0.3, 0.2, 0.3], [s * 1.2, 0.85, -4.2], "s26mudflap");

  // ===== Cab armour =====
  for (const s of [1, -1]) {
    const x = s * 1.38;
    // door armour plates
    box(HULL_LIGHT, [0.1, 0.5, 1.4], [x + s * 0.02, 1.8, 2.4], "s26doorPlateLow");
    box(HULL_DARK, [0.06, 0.4, 1.3], [x + s * 0.08, 1.8, 2.4], "s26doorPlateInset");
    box(HULL_LIGHT, [0.1, 0.28, 1.4], [x + s * 0.02, 3.0, 2.4], "s26doorPlateTop");
    // shield frames around window
    box(HULL_DARK, [0.12, 0.08, 1.4], [x + s * 0.02, 2.5, 2.4], "s26frameB");
    box(HULL_DARK, [0.12, 0.08, 1.4], [x + s * 0.02, 3.17, 2.4], "s26frameT");
    for (const z of [1.7, 3.1]) box(HULL_DARK, [0.12, 0.7, 0.1], [x + s * 0.02, 2.82, z], "s26frameSide");
    // slits
    for (let i = 0; i < 3; i++) box(BLACK, [0.04, 0.4, 0.04], [x + s * 0.09, 2.82, 2.0 + i * 0.4], "s26slit", [0, 0, 0]);
    // bolts
    for (const z of [1.8, 2.4, 3.0]) {
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 5), STEEL, { at: [x + s * 0.12, 1.65, z], dir: [s, 0, 0], name: "s26armorBolt" });
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 5), STEEL, { at: [x + s * 0.09, 2.98, z], dir: [s, 0, 0], name: "s26armorBolt" });
    }
    // hazard stripe on lower plate
    box(WARN, [0.02, 0.06, 0.5], [x + s * 0.12, 1.7, 2.9], "s26plateStripe", [0, 0, 0]);
    // mirror cameras
    cyl(BLACK, 0.07, 0.12, [s * 1.72, 2.5, 3.0], [0, 1, 0], "s26camBody", 6);
    glow(b.part(new THREE.SphereGeometry(0.05, 5, 4), MAGENTA, { at: [s * 1.72, 2.4, 3.1], name: "s26camLens" }), 1.5);
    box(HULL_DARK, [0.04, 0.5, 0.06], [s * 1.52, 2.7, 3.0], "s26mirrorStrut");
    // bull bar fog lights
    glow(b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 8), AMBER, { at: [s * 0.85, 1.35, 4.42], dir: [0, 0, 1], name: "s26fog" }), 1.5);
    cyl(BLACK, 0.15, 0.06, [s * 0.85, 1.35, 4.39], [0, 0, 1], "s26fogRim", 8);
    // vertical bull bar posts
    b.rod([s * 1.1, 0.95, 4.2], [s * 1.1, 2.0, 4.1], 0.06, STEEL, { name: "s26bullPost" });
    b.rod([s * 0.4, 1.0, 4.25], [s * 0.4, 1.9, 4.05], 0.05, STEEL, { name: "s26bullPostIn" });
  }
  // bull bar rails
  b.rod([-1.1, 1.9, 4.1], [1.1, 1.9, 4.1], 0.07, STEEL, { name: "s26bullTop" });
  b.rod([-1.1, 1.5, 4.35], [1.1, 1.5, 4.35], 0.06, STEEL, { name: "s26bullMid" });
  b.rod([-1.1, 1.12, 4.45], [1.1, 1.12, 4.45], 0.06, STEEL, { name: "s26bullLow" });
  for (const x of [-0.4, 0.4]) b.rod([x, 1.12, 4.45], [x, 1.9, 4.1], 0.04, HULL_LIGHT, { name: "s26bullBrace" });
}
```