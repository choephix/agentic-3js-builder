import * as THREE from "three";
import { createBuilder, type Builder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured convoy hauler guarding a sealed cargo pod.",
};

// ---- palette (top level, stage 2 may use these by name)
export const HULL = "#3b4452";
export const HULL_DARK = "#232a35";
export const HULL_LIGHT = "#5a6677";
export const POD = "#cdd5dd";
export const POD_SHADE = "#9aa6b4";
export const STEEL = "#6d7480";
export const BLACK = "#101216";
export const RUBBER = "#17181c";
export const CYAN = "#19e6ff";
export const MAGENTA = "#ff2bd6";
export const AMBER = "#ffb02e";
export const RED = "#ff2b3a";
export const GLASS = "#0f3a4a";
export const HAZARD = "#ffd21f";

export const REQUESTS = [
  {
    id: "roofLightBar", kind: "add", part: "cabHull",
    what: "Neon light bar across the cab roof: slim black housing, six lamps alternating CYAN and MAGENTA (glowing), end brackets and a small mounting riser.",
    at: [0, 3.22, 3.1], normal: [0, 1, 0], bone: null, room: [1.8, 0.25, 0.4],
  },
  {
    id: "frontGrille", kind: "add", part: "cabHull",
    what: "Armoured front grille: dark slatted louvres inside a HULL_DARK frame, a glowing CYAN horizontal slit, and a small magenta corp emblem plate in the centre.",
    at: [0, 1.7, 4.62], normal: [0, 0, 1], bone: null, room: [1.8, 0.7, 0.3],
  },
  {
    id: "bumperRam", kind: "add", part: "bumper",
    what: "Ram bumper fittings: row of angular steel teeth/spikes, two tow hooks and amber hazard chevrons along the bumper.",
    at: [0, 1.0, 4.85], normal: [0, 0, 1], bone: null, room: [2.6, 0.5, 0.4],
  },
  {
    id: "antennaArray", kind: "add", part: "cabHull",
    what: "Antenna array on the cab rear roof corner: three rods of different heights, a small dish, a blinking RED tip lamp, and cable runs.",
    at: [-1.0, 3.2, 2.2], normal: [0, 1, 0], bone: null, room: [0.5, 1.2, 0.5],
  },
  {
    id: "podHatch", kind: "add", part: "podShell",
    what: "Sealed inspection hatch on the pod's left flank: recessed hex door in HULL_DARK, four bolts, a glowing MAGENTA keypad and a hazard-striped frame.",
    at: [1.27, 2.4, -1.6], normal: [1, 0, 0], bone: null, room: [0.3, 1.2, 1.8],
  },
  {
    id: "podRoofArray", kind: "add", part: "podShell",
    what: "Roof equipment on the pod: vent grilles, two small cooling fans, a flat solar/sensor panel and cable conduits.",
    at: [0, 3.68, -1.6], normal: [0, 1, 0], bone: null, room: [1.2, 0.3, 2.8],
  },
  {
    id: "rearSealLock", kind: "add", part: "podShell",
    what: "Rear pod door: big circular vault seal with radial locking bolts, a CYAN status ring, a MAGENTA lock light and hazard stripes.",
    at: [0, 2.4, -4.95], normal: [0, 0, -1], bone: null, room: [1.8, 1.8, 0.3],
  },
  {
    id: "turretFittings", kind: "add", part: "turret",
    what: "Turret detail: ammo box with feed belt, barrel shroud with vents, targeting sensor with a RED glowing lens and a small shield plate.",
    at: [0, 4.05, 1.0], normal: [0, 1, 0], bone: null, room: [1.0, 0.6, 1.6],
  },
  {
    id: "underglow",kind: "add", part: "chassisFrame",
    what: "Underglow and undercarriage: CYAN neon strips under the chassis both sides, cable bundles, and a drive shaft with joints.",
    at: [0, 0.75, 0], normal: [0, -1, 0], bone: null, room: [1.6, 0.3, 8.0],
  },
  {
    id: "sideArmourStuds", kind: "add", part: "skirtPlate",
    what: "Skirt plate detail: rivets, a faded unit number, angled reactive-armour blocks and small amber marker lamps.",
    at: [1.1, 1.0, -1.6], normal: [1, 0, 0], bone: null, room: [0.3, 0.5, 2.2],
  },
  {
    id: "cabCamo", kind: "texture", part: "cabHull",
    what: "Dark urban digital camo in HULL, HULL_DARK and HULL_LIGHT blocks, with a CYAN stripe and a faded convoy number on the doors.",
  },
  {
    id: "podPanels", kind: "texture", part: "podShell",
    what: "Panel seams, rivets and scuffs on the pod in POD and POD_SHADE, with a MAGENTA corp logo band and warning text near the front.",
  },
  {
    id: "tyreTread", kind: "texture", part: "tyre",
    what: "Chunky tread blocks on all tyres in RUBBER and BLACK with dust at the edges.",
  },
  {
    id: "chassisGrime", kind: "texture", part: "chassisFrame",
    what: "Oil, grease and rust grime in dark browns over the HULL_DARK chassis rails.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "convoyHauler" });

  const bx = (w: number, h: number, d: number, x: number, y: number, z: number, color: string, name?: string, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], name, rotation: rot });
  // cylinder along an axis: "z" | "x" | "y"
  const cyl = (rt: number, rb: number, len: number, seg: number, ax: "x" | "y" | "z", x: number, y: number, z: number, color: string, name?: string) =>
    b.part(new THREE.CylinderGeometry(rt, rb, len, seg), color, {
      at: [x, y, z], name, rotation: ax === "z" ? [90, 0, 0] : ax === "x" ? [0, 0, 90] : [0, 0, 0],
    });

  // ---- chassis
  bx(1.5, 0.32, 8.8, 0, 0.98, 0, HULL_DARK, "chassisFrame");
  bx(0.2, 0.3, 8.6, 0.6, 0.78, 0, BLACK, "chassisFrame");
  bx(0.2, 0.3, 8.6, -0.6, 0.78, 0, BLACK, "chassisFrame");
  for (const z of [2.2, 0.6, -1.0, -2.6, -4.0]) bx(1.4, 0.18, 0.2, 0, 0.7, z, BLACK, "crossMember");
  // underglow (simple stage-1 strips)
  for (const s of [1, -1]) glow(bx(0.06, 0.05, 7.6, s * 0.78, 0.62, 0, CYAN, "underglowStrip"), 1.2);

  // ---- wheels
  const axles = [3.1, -0.9, -2.3, -3.7];
  for (const z of axles)
    for (const s of [1, -1]) {
      const x = s * 1.32;
      cyl(0.62, 0.62, 0.46, 10, "x", x, 0.62, z, RUBBER, "tyre");
      cyl(0.36, 0.36, 0.5, 8, "x", x, 0.62, z, STEEL, "wheelRim");
      cyl(0.18, 0.18, 0.54, 6, "x", x, 0.62, z, HULL_DARK, "hubCap");
      glow(cyl(0.1, 0.1, 0.58, 6, "x", x, 0.62, z, CYAN, "hubGlow"), 1.2);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        b.part(new THREE.BoxGeometry(0.56, 0.07, 0.07), STEEL, {
          at: [x, 0.62 + Math.cos(a) * 0.27, z + Math.sin(a) * 0.27], rotation: [(a * 180) / Math.PI, 0, 0], name: "lugBolt",
        });
      }
      // fender arch cap
      bx(0.6, 0.1, 1.5, s * 1.32, 1.3, z, HULL, "fender");
    }
  for (const z of [3.1, -0.9, -3.7]) for (const s of [1, -1]) bx(0.06, 0.06, 0.06, s * 1.6, 0.62, z, STEEL);

  // ---- cab (side-profile extrude, z forward)
  const cabOutline: [number, number][] = [
    [0, 0], [2.6, 0], [2.6, 0.85], [2.0, 0.95], [1.5, 1.9], [0.15, 1.9], [0, 1.5],
  ];
  b.extrude(cabOutline, { at: [0, 1.25, 2.0], x: [0, 0, 1], thickness: 2.5, bevel: 0.05, color: HULL, name: "cabHull" });
  // hood armour plates
  bx(2.2, 0.1, 1.0, 0, 2.23, 4.1, HULL_LIGHT, "hoodPlate", [-6, 0, 0]);
  for (const s of [1, -1]) bx(0.12, 0.14, 1.5, s * 1.0, 2.25, 3.9, HULL_DARK, "hoodRib");
  // windscreen & windows
  b.part(new THREE.BoxGeometry(2.2, 1.06, 0.06), GLASS, { at: [0, 2.7, 3.72], rotation: [-22.8, 0, 0], name: "windscreen" });
  for (const s of [1, -1]) {
    bx(0.05, 0.75, 1.1, s * 1.27, 2.75, 3.0, GLASS, "sideWindow");
    bx(0.07, 0.04, 1.2, s * 1.27, 3.15, 3.0, HULL_DARK, "windowFrame");
    bx(0.07, 0.8, 0.05, s * 1.27, 2.75, 2.45, HULL_DARK, "doorSeam");
    bx(0.07, 0.8, 0.05, s * 1.27, 2.75, 3.55, HULL_DARK, "doorSeam");
    bx(0.08, 0.06, 0.3, s * 1.28, 2.2, 3.5, STEEL, "doorHandle");
    // mirrors
    bx(0.08, 0.5, 0.05, s * 1.5, 2.85, 3.85, BLACK, "mirrorArm");
    bx(0.1, 0.4, 0.3, s * 1.55, 2.85, 3.85, HULL_DARK, "mirror");
    glow(bx(0.02, 0.06, 0.24, s * 1.61, 2.85, 3.85, CYAN, "mirrorGlow"), 1);
    // headlights
    glow(bx(0.5, 0.18, 0.06, s * 0.95, 1.75, 4.62, AMBER, "headlight"), 1.4);
    bx(0.6, 0.28, 0.05, s * 0.95, 1.75, 4.6, BLACK, "headlightBezel");
    // side armour on cab
    bx(0.1, 0.6, 1.8, s * 1.28, 1.7, 3.3, HULL_LIGHT, "doorArmour");
    bx(0.12, 0.1, 1.9, s * 1.28, 1.35, 3.3, HAZARD, "hazardRail");
  }
  // grille surface plain panel
  bx(1.5, 0.6, 0.08, 0, 1.7, 4.58, HULL_DARK, "grilleBase");
  // bumper
  bx(2.7, 0.4, 0.55, 0, 1.0, 4.55, HULL_LIGHT, "bumper");
  bx(2.2, 0.3, 0.3, 0, 1.0, 4.85, HULL_DARK, "bumper", [0, 0, 0]);
  // roof plate and sirens
  bx(1.9, 0.1, 1.4, 0, 3.2, 2.85, HULL_DARK, "roofPlate");
  bx(2.4, 0.5, 0.5, 0, 1.55, 2.0, HULL_DARK, "cabRearArmour");
  // exhaust stacks
  for (const s of [1, -1]) {
    cyl(0.12, 0.14, 2.4, 8, "y", s * 1.05, 2.5, 1.75, STEEL, "exhaust");
    cyl(0.17, 0.17, 0.12, 8, "y", s * 1.05, 3.72, 1.75, BLACK, "exhaustTip");
    cyl(0.18, 0.18, 0.2, 8, "y", s * 1.05, 1.7, 1.75, HULL_DARK, "exhaustBand");
    cyl(0.18, 0.18, 0.2, 8, "y", s * 1.05, 2.9, 1.75, HULL_DARK, "exhaustBand");
  }

  // ---- fuel tanks & skirts
  for (const s of [1, -1]) {
    cyl(0.32, 0.32, 1.3, 8, "z", s * 0.98, 0.95, 1.2, HULL_LIGHT, "fuelTank");
    for (const z of [0.7, 1.7]) cyl(0.34, 0.34, 0.08, 8, "z", s * 0.98, 0.95, z, BLACK, "tankStrap");
    // skirt plates beside pod bay
    bx(0.12, 0.55, 2.8, s * 1.0, 1.0, -1.6, HULL, "skirtPlate");
    bx(0.14, 0.12, 2.8, s * 1.0, 1.32, -1.6, HULL_LIGHT, "skirtPlate");
    bx(0.12, 0.45, 1.0, s * 1.0, 1.0, -4.2, HULL, "skirtPlate");
    for (const z of [-0.6, -1.6, -2.6]) glow(bx(0.05, 0.08, 0.2, s * 1.08, 0.85, z, AMBER, "markerLamp"), 1.2);
  }

  // ---- cargo pod (sealed capsule)
  const PZ = -1.6, PY = 2.45, PL = 5.6, PR = 1.22;
  cyl(PR, PR, PL, 10, "z", 0, PY, PZ, POD, "podShell");
  // end caps
  cyl(PR * 0.7, PR, 0.55, 10, "z", 0, PY, PZ + PL / 2 + 0.27, POD_SHADE, "podShell");
  cyl(PR, PR * 0.7, 0.55, 10, "z", 0, PY, PZ - PL / 2 - 0.27, POD_SHADE, "podShell");
  cyl(PR * 0.55, PR * 0.55, 0.12, 10, "z", 0, PY, PZ - PL / 2 - 0.58, HULL_DARK, "podRearPlate");
  // armour bands
  for (const z of [1.0, -0.2, -1.4, -2.6, -3.8]) {
    cyl(PR + 0.07, PR + 0.07, 0.22, 10, "z", 0, PY, z, HULL_DARK, "podBand");
  }
  // neon seam strips on flanks
  for (const s of [1, -1]) {
    glow(bx(0.05, 0.07, 5.0, s * 1.15, PY + 0.5, PZ, MAGENTA, "podNeon"), 1.2);
    glow(bx(0.05, 0.05, 5.0, s * 1.2, PY - 0.55, PZ, CYAN, "podNeon"), 1.2);
  }
  // saddle cradle
  for (const z of [0.6, -1.6, -3.6]) {
    bx(2.2, 0.35, 0.5, 0, 1.38, z, HULL_DARK, "cradle");
    for (const s of [1, -1]) bx(0.2, 0.55, 0.5, s * 1.0, 1.7, z, HULL, "cradleArm", [0, 0, s * -25]);
  }
  // hazard stripes at pod nose ring
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    if (i % 2 === 0) b.part(new THREE.BoxGeometry(0.28, 0.06, 0.3), HAZARD, {
      at: [Math.sin(a) * (PR * 0.86), PY + Math.cos(a) * PR * 0.86, PZ + PL / 2 + 0.5],
      rotation: [0, 0, -(a * 180) / Math.PI], name: "hazardMark",
    });
  }

  // ---- turret on pod roof front
  cyl(0.5, 0.58, 0.2, 8, "y", 0, 3.78, 1.0, HULL_DARK, "turretRing");
  bx(0.9, 0.4, 1.0, 0, 4.05, 1.0, HULL, "turret");
  bx(0.7, 0.2, 0.7, 0, 4.35, 0.95, HULL_LIGHT, "turret");
  for (const s of [1, -1]) {
    cyl(0.06, 0.07, 1.5, 6, "z", s * 0.25, 4.1, 1.95, BLACK, "turretBarrel");
    cyl(0.1, 0.1, 0.25, 6, "z", s * 0.25, 4.1, 2.7, STEEL, "muzzle");
  }
  glow(bx(0.12, 0.12, 0.08, 0, 4.4, 1.3, RED, "turretLens"), 1.5);

  // ---- rear
  bx(2.6, 0.35, 0.4, 0, 1.0, -4.75, HULL_LIGHT, "rearBumper");
  for (const s of [1, -1]) {
    glow(bx(0.4, 0.15, 0.06, s * 0.95, 1.0, -4.97, RED, "tailLight"), 1.3);
    // mud flaps
    bx(0.5, 0.45, 0.05, s * 1.32, 0.45, -4.2, BLACK, "mudFlap");
  }
  // antenna stub
  cyl(0.02, 0.03, 1.0, 5, "y", -1.0, 3.7, 2.2, BLACK, "antenna");
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { at: [-1.0, 4.22, 2.2], name: "antennaTip" }), 1.5);

  for (const add of STAGE2) add(b);
  return b.root;
}
