import * as THREE from "three";
import { createBuilder, type Builder } from "../../../../src/index";

export const meta = {
  name: "Aegis-77 Combat Hauler",
  description: "Low-poly cyberpunk armoured 6x6 military truck, 2077.",
};

export const REQUESTS = [
  { id: "roofLightBar", kind: "add", part: "cabRoof", what: "Neon light bar across the cab roof: slim housing, six lamps alternating CYAN and MAGENTA, brackets.", at: [0, 2.72, 1.9], normal: [0, 1, 0], bone: null, room: [1.8, 0.25, 0.4] },
  { id: "grille", kind: "add", part: "nose", what: "Aggressive front grille: slatted dark vents with a glowing CYAN strip and armoured mesh.", at: [0, 1.2, 3.55], normal: [0, 0, 1], bone: null, room: [1.6, 0.7, 0.2] },
  { id: "headlights", kind: "add", part: "nose", what: "Pair of angular LED headlights with MAGENTA accent lines, left and right.", at: [0.95, 1.35, 3.5], normal: [0, 0, 1], bone: null, room: [0.5, 0.25, 0.2] },
  { id: "antennaArray", kind: "add", part: "cabRoof", what: "Antenna array: whip antennas, a small dish and a comms mast with blinking MAGENTA tips.", at: [-0.8, 2.75, 1.0], normal: [0, 1, 0], bone: null, room: [0.5, 1.2, 0.5] },
  { id: "turret", kind: "add", part: "bed", what: "Roof-ring remote weapon station on the cargo bed: swivel base, twin barrels, ammo box, glowing CYAN sensor eye.", at: [0, 2.2, -1.2], normal: [0, 1, 0], bone: null, room: [1.2, 0.8, 1.6] },
  { id: "sideExhaust", kind: "add", part: "cab", what: "Vertical twin exhaust stacks behind the cab with heat shields and orange glow rings.", at: [1.25, 2.2, 0.6], normal: [1, 0, 0], bone: null, room: [0.3, 1.3, 0.3] },
  { id: "cableBundle", kind: "add", part: "chassis", what: "Bundles of cables and hydraulic lines along the chassis underside with clamps and neon connectors.", at: [0, 0.75, 0], normal: [0, -1, 0], bone: null, room: [1.2, 0.3, 4] },
  { id: "cargoPlates", kind: "add", part: "bed", what: "Bolt-on armour plates and ribs on the cargo box sides plus a rear hatch with hazard-stripe trim.", at: [1.3, 1.9, -2.2], normal: [1, 0, 0], bone: null, room: [0.2, 1.2, 2.6] },
  { id: "wheelDetail", kind: "add", part: "wheels", what: "Hub caps with bolt rings, brake discs with MAGENTA glowing calipers, and mud flaps on all six wheels.", at: [1.3, 0.6, 2.0], normal: [1, 0, 0], bone: null, room: [0.4, 1.2, 1.2] },
  { id: "hullCamo", kind: "texture", part: "cargoSide", what: "Urban digital camo in HULL and HULL_DARK on cargo box sides, faded unit number near the rear." },
  { id: "cabPanels", kind: "texture", part: "cabBody", what: "Panel seams, scratches and neon-edge warning decals on the cab body in HULL and STEEL." },
  { id: "tireTread", kind: "texture", part: "tire", what: "Chunky tread pattern and grime on the tires in TIRE and DIRT." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const HULL = "#4a5a52";
export const HULL_DARK = "#2f3a36";
export const STEEL = "#7d8794";
export const DARK = "#14161c";
export const TIRE = "#1b1b1f";
export const DIRT = "#5a4a38";
export const CYAN = "#22e6ff";
export const MAGENTA = "#ff2bd6";
export const GLASS = "#0c3a4a";
export const HAZARD = "#e8b81c";

export default function build() {
  const b = createBuilder({ name: "aegisTruck" });
  const box = (w: number, h: number, d: number, c: string, at: number[], name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, name });

  // chassis
  box(2.0, 0.35, 7.2, DARK, [0, 0.85, 0], "chassis");
  box(0.3, 0.3, 7.0, STEEL, [0.7, 0.7, 0], "chassis");
  box(0.3, 0.3, 7.0, STEEL, [-0.7, 0.7, 0], "chassis");
  // axles
  for (const z of [2.2, -0.6, -2.4]) box(2.6, 0.18, 0.2, DARK, [0, 0.62, z], "axle");
  // wheels
  for (const z of [2.2, -0.6, -2.4])
    for (const s of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 10), TIRE, { at: [s * 1.3, 0.62, z], dir: [1, 0, 0], name: "tire" });
      b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.54, 8), STEEL, { at: [s * 1.3, 0.62, z], dir: [1, 0, 0], name: "hub" });
      b.part(new THREE.BoxGeometry(0.6, 0.08, 1.4), HULL_DARK, { at: [s * 1.3, 1.3, z], name: "fender" });
    }
  // cab
  box(2.4, 1.0, 2.0, HULL, [0, 1.55, 2.55], "cabBody");
  box(2.3, 0.7, 1.2, HULL, [0, 1.5, 3.2], "nose");
  b.part(new THREE.BoxGeometry(2.3, 0.2, 0.9), HULL_DARK, { at: [0, 1.1, 3.55], name: "nose" });
  box(2.4, 0.75, 1.7, HULL, [0, 2.4, 2.0], "cabBody");
  box(2.2, 0.1, 1.6, HULL_DARK, [0, 2.82, 1.95], "cabRoof");
  // windshield
  b.part(new THREE.BoxGeometry(2.0, 0.55, 0.08), GLASS, { at: [0, 2.4, 2.9], rotation: [-18, 0, 0], name: "glass" });
  for (const s of [1, -1]) {
    box(0.06, 0.5, 1.0, GLASS, [s * 1.22, 2.4, 2.1], "glass");
    box(0.12, 0.5, 0.5, HULL_DARK, [s * 1.3, 2.1, 3.0], "mirror");
  }
  // bumper
  box(2.6, 0.4, 0.4, STEEL, [0, 0.95, 3.85], "bumper");
  box(2.6, 0.08, 0.42, HAZARD, [0, 1.16, 3.86], "bumper");
  // cargo bed
  box(2.5, 0.2, 4.0, HULL_DARK, [0, 1.15, -1.4], "bed");
  for (const s of [1, -1]) {
    box(0.15, 1.1, 4.0, HULL, [s * 1.2, 1.8, -1.4], "cargoSide");
    box(0.3, 0.3, 4.0, HULL_DARK, [s * 1.2, 2.4, -1.4], "cargoSide");
  }
  box(2.5, 1.1, 0.15, HULL, [0, 1.8, -3.4], "cargoSide");
  box(2.5, 1.1, 0.15, HULL, [0, 1.8, -0.1], "cargoSide");
  // cargo contents: sealed container
  box(2.0, 0.7, 2.4, STEEL, [0, 1.65, -1.4], "bed");
  // exhaust stacks
  for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.1, 0.1, 1.3, 6), STEEL, { at: [s * 1.25, 2.0, 0.9], name: "exhaust" });
  // neon underglow strips
  for (const s of [1, -1]) box(0.05, 0.05, 6.0, CYAN, [s * 1.05, 0.55, 0], "underglow");
  box(1.2, 0.04, 0.05, MAGENTA, [0, 0.9, 3.95], "bumperGlow");

  for (const add of STAGE2) add(b);
  return b.root;
}
