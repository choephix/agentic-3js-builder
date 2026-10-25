import * as THREE from "three";
import { createBuilder, type Builder } from "../../../../src/index";

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control interceptor with roof water cannon and neon light bars, cyberpunk style.",
};

export const REQUESTS = [
  { id: "roofLightBar", kind: "add", part: "cab", what: "Neon light bar across the cab roof: slim housing, six lamps alternating CYAN and MAGENTA, brackets.", at: [0, 2.0, 0.5], normal: [0, 1, 0], bone: null, room: [1.6, 0.2, 0.3] },
  { id: "frontBar", kind: "add", part: "hull", what: "Neon strip and grille across the front bumper: CYAN lamp strip, dark mesh grille, small corp logo plate.", at: [0, 0.7, 2.7], normal: [0, 0, 1], bone: null, room: [1.8, 0.4, 0.2] },
  { id: "cannonFit", kind: "add", part: "cannonBarrel", what: "Water cannon fittings: barrel rings, pressure hose, muzzle nozzle with MAGENTA glow ring.", at: [0, 2.55, 0.9], normal: [0, 0, 1], bone: null, room: [0.5, 0.5, 1.4] },
  { id: "sideSkirtLights", kind: "add", part: "hull", what: "Neon underglow strips along both sides: MAGENTA tubes with end caps.", at: [1.05, 0.35, 0], normal: [1, 0, 0], bone: null, room: [0.15, 0.1, 4] },
  { id: "windowGrilles", kind: "add", part: "cab", what: "Armoured slatted grilles over the windshield and side windows, dark steel.", at: [0, 1.5, 1.3], normal: [0, 0.3, 1], bone: null, room: [1.6, 0.6, 0.2] },
  { id: "tankPipes", kind: "add", part: "tank", what: "Water tank piping, valves, gauge and hazard-stripe band on rear tank.", at: [0, 1.7, -1.6], normal: [0, 1, 0], bone: null, room: [1.5, 0.6, 1.8] },
  { id: "antennas", kind: "add", part: "cab", what: "Antenna array and sensor pods at cab roof rear with tiny red blinkers.", at: [0.6, 2.1, -0.2], normal: [0, 1, 0], bone: null, room: [0.5, 0.6, 0.5] },
  { id: "hullCamo", kind: "texture", part: "hull", what: "Corporate livery: HULL navy with MAGENTA diagonal stripes, faded unit number and logo near rear doors." },
  { id: "tankDecal", kind: "texture", part: "tank", what: "Hazard chevrons in YELLOW and DARK with warning text WATER CANNON." },
  { id: "tireTread", kind: "texture", part: "tire", what: "Tread pattern on tyres in DARK and RUBBER." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const HULL = "#1c2438";
export const HULL_DARK = "#10141f";
export const STEEL = "#4a5266";
export const CYAN = "#19f0ff";
export const MAGENTA = "#ff2bd6";
export const YELLOW = "#ffd21f";
export const GLASS = "#0b2a3a";
export const RUBBER = "#15161a";
export const DARK = "#07080c";

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const box = (w: number, h: number, d: number, c: string, at: number[], name?: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as [number, number, number], name, rotation: rot as any });

  // lower hull
  box(2.1, 0.8, 5.2, HULL, [0, 0.85, 0], "hull");
  box(2.2, 0.15, 5.3, HULL_DARK, [0, 0.4, 0], "hullSill");
  // hood slope
  box(1.9, 0.35, 1.2, HULL, [0, 1.15, 2.0], "hood", [-12, 0, 0]);
  // bumper
  box(2.3, 0.4, 0.35, STEEL, [0, 0.6, 2.75], "bumper");
  box(2.0, 0.12, 0.3, CYAN, [0, 0.85, 2.82], "bumperLight");
  // cab
  box(1.9, 0.9, 1.7, HULL, [0, 1.7, 0.7], "cab");
  box(1.7, 0.55, 0.06, GLASS, [0, 1.8, 1.58], "windshield", [-18, 0, 0]);
  for (const s of [1, -1]) {
    box(0.05, 0.5, 1.2, GLASS, [s * 0.96, 1.8, 0.7], "sideWindow");
    box(0.08, 0.14, 0.05, MAGENTA, [s * 0.9, 1.0, 2.6]);
  }
  box(1.95, 0.08, 1.75, HULL_DARK, [0, 2.17, 0.7], "cabRoof");
  // rear tank
  const tank = b.lathe(
    [[0, -1.3], [0.7, -1.3], [0.85, -1.1], [0.85, 1.1], [0.7, 1.3], [0, 1.3]],
    { at: [0, 1.55, -1.5], axis: [0, 0, 1], segments: 10, color: STEEL, name: "tank" },
  );
  void tank;
  for (const z of [-0.6, -1.5, -2.4]) {
    b.part(new THREE.CylinderGeometry(0.88, 0.88, 0.1, 10), YELLOW, { at: [0, 1.55, z], dir: [0, 0, 1], name: "tankBand" });
  }
  // turret + cannon
  b.part(new THREE.CylinderGeometry(0.4, 0.5, 0.25, 10), HULL_DARK, { at: [0, 2.3, 0.9], name: "cannonBase" });
  box(0.5, 0.35, 0.6, STEEL, [0, 2.55, 0.9], "turret");
  b.part(new THREE.CylinderGeometry(0.12, 0.15, 1.5, 8), STEEL, { at: [0, 2.6, 1.6], dir: [0, 0, 1], name: "cannonBarrel" });
  b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 8), MAGENTA, { at: [0, 2.6, 2.4], dir: [0, 0, 1], name: "muzzle" });
  // wheels
  for (const s of [1, -1])
    for (const z of [1.8, -0.2, -2.0]) {
      b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12), RUBBER, { at: [s * 1.1, 0.5, z], dir: [1, 0, 0], name: "tire" });
      b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.42, 8), STEEL, { at: [s * 1.1, 0.5, z], dir: [1, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.44, 6), CYAN, { at: [s * 1.1, 0.5, z], dir: [1, 0, 0] });
    }
  // roof light bar base
  box(1.5, 0.1, 0.25, DARK, [0, 2.27, 0.5], "lightBarBase");

  for (const add of STAGE2) add(b);
  return b.root;
}
