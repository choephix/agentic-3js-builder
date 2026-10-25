import * as THREE from "three";
import { createBuilder, type Builder } from "../../../../src/index";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup converted to hover thrusters, low-poly cyberpunk.",
};

export const REQUESTS = [
  { id: "roofLightBar", kind: "add", part: "cab", what: "Neon light bar across the cab roof: slim housing, six lamps alternating CYAN and MAGENTA, brackets.", at: [0, 1.62, 0.1], normal: [0, 1, 0], bone: null, room: [1.5, 0.2, 0.3] },
  { id: "grille", kind: "add", part: "hood", what: "Front grille: dark mesh with horizontal slats and a glowing CYAN strip, plus an emblem.", at: [0, 0.85, 2.4], normal: [0, 0, 1], bone: null, room: [1.2, 0.4, 0.2] },
  { id: "headlamps", kind: "add", part: "hood", what: "Pair of angular headlamps in MAGENTA glow with dark bezels.", at: [0.7, 0.9, 2.38], normal: [0, 0, 1], bone: null, room: [0.4, 0.2, 0.15] },
  { id: "bedGun", kind: "add", part: "bed", what: "Pintle-mounted autocannon in the bed: ring mount, barrel with shroud, ammo box and feed belt.", at: [0, 1.3, -1.2], normal: [0, 1, 0], bone: null, room: [0.8, 0.8, 1.4] },
  { id: "thrusterFins", kind: "add", part: "thrusterFL", what: "Vent fins and glowing CYAN ring inside each hover thruster, with cable bundles to the chassis.", at: [1.05, 0.35, 1.4], normal: [0, -1, 0], bone: null, room: [0.7, 0.3, 0.7] },
  { id: "antenna", kind: "add", part: "cab", what: "Antenna array on the cab rear: two whips, a dish and blinking MAGENTA lights.", at: [-0.7, 1.6, -0.5], normal: [0, 1, 0], bone: null, room: [0.3, 0.8, 0.3] },
  { id: "sidePlates", kind: "add", part: "chassis", what: "Armour plating on the sides with bolts and hazard stripes.", at: [1.0, 0.7, 0], normal: [1, 0, 0], bone: null, room: [0.2, 0.5, 2.5] },
  { id: "underglow", kind: "add", part: "chassis", what: "Underglow tubes in CYAN along the skirt with mounting clips.", at: [0, 0.35, 0], normal: [0, -1, 0], bone: null, room: [1.6, 0.1, 3] },
  { id: "hullCamo", kind: "texture", part: "hood", what: "Urban digital camo in HULL and HULL_DARK across hood, cab and bed, with a faded unit number." },
  { id: "windowTex", kind: "texture", part: "glass", what: "Windshield with cyan HUD reflections and scratches." },
  { id: "thrusterTex", kind: "texture", part: "thrusterFL", what: "Scorched metal with heat-blue gradient and warning decals." },
];

export const HULL = "#4a5a52";
export const HULL_DARK = "#2e3a36";
export const METAL = "#2a2d36";
export const GLASS = "#1b3a4a";
export const CYAN = "#19f0ff";
export const MAGENTA = "#ff2bd6";
export const RUBBER = "#15161b";
export const STEEL = "#6d7482";

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const box = (w: number, h: number, d: number, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as any, name, ...(rot ? { rotation: rot as any } : {}) });

  // chassis
  box(1.9, 0.3, 4.4, METAL, [0, 0.6, 0], "chassis");
  box(2.0, 0.12, 4.0, HULL_DARK, [0, 0.42, 0], "skirt");
  // hood (sloped)
  box(1.8, 0.4, 1.4, HULL, [0, 0.95, 1.65], "hood");
  box(1.8, 0.1, 0.9, HULL, [0, 1.15, 1.7], "hoodTop", [-8, 0, 0]);
  // cab
  box(1.85, 0.55, 1.6, HULL, [0, 1.0, 0.1], "cab");
  box(1.7, 0.5, 1.3, HULL, [0, 1.5, -0.05], "cabUpper");
  box(1.6, 0.06, 1.2, HULL_DARK, [0, 1.78, -0.05], "roof");
  // glass
  box(1.55, 0.42, 0.06, GLASS, [0, 1.5, 0.64], "glass", [-25, 0, 0]);
  box(1.74, 0.34, 0.8, GLASS, [0, 1.52, -0.05], "sideGlass");
  box(1.5, 0.36, 0.05, GLASS, [0, 1.5, -0.72], "rearGlass");
  // bed
  box(1.9, 0.12, 1.7, HULL_DARK, [0, 0.8, -1.5], "bed");
  box(0.1, 0.45, 1.7, HULL, [0.9, 1.05, -1.5], "bedWallL");
  box(0.1, 0.45, 1.7, HULL, [-0.9, 1.05, -1.5], "bedWallR");
  box(1.9, 0.45, 0.1, HULL, [0, 1.05, -2.3], "tailgate");
  box(1.9, 0.45, 0.1, HULL, [0, 1.05, -0.7], "bedFront");
  // bumpers
  box(2.0, 0.25, 0.25, METAL, [0, 0.65, 2.45], "bumperF");
  box(2.0, 0.25, 0.2, METAL, [0, 0.65, -2.35], "bumperR");
  // thrusters
  for (const sx of [1, -1])
    for (const sz of [1.4, -1.4]) {
      const n = `thruster${sz > 0 ? "F" : "R"}${sx > 0 ? "L" : "R"}`;
      box(0.35, 0.12, 0.35, METAL, [sx * 1.0, 0.65, sz], n + "Arm");
      b.part(new THREE.CylinderGeometry(0.42, 0.5, 0.35, 8), STEEL, { at: [sx * 1.15, 0.45, sz], name: n });
      b.part(new THREE.CylinderGeometry(0.36, 0.36, 0.06, 8), CYAN, { at: [sx * 1.15, 0.26, sz], name: n + "Glow" });
      b.part(new THREE.TorusGeometry(0.45, 0.05, 5, 8), METAL, { at: [sx * 1.15, 0.64, sz], rotation: [90, 0, 0] as any, name: n + "Rim" });
    }
  // roof rack / details
  box(1.2, 0.05, 0.1, METAL, [0, 1.84, 0.4], "roofRail");
  box(0.3, 0.2, 0.3, HULL_DARK, [0.5, 0.95, -1.5], "bedCrate");
  box(1.4, 0.04, 0.5, MAGENTA, [0, 0.4, 2.0], "accentStrip");
  // exhaust stacks
  for (const sx of [1, -1]) b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 6), STEEL, { at: [sx * 0.95, 1.45, -0.75], name: "stack" });
  for (const add of STAGE2) add(b);
  return b.root;
}
