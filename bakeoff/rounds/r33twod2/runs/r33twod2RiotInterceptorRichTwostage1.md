```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control interceptor with roof water cannon and neon light bars, cyberpunk style.",
};

export const REQUESTS = [
  { id: "roofLightBar", kind: "add", part: "cab", what: "Neon light bar across the cab roof: slim housing, six lamps alternating CYAN and MAGENTA, brackets.", at: [0, 2.0, 0.6], normal: [0, 1, 0], bone: null, room: [1.8, 0.2, 0.3] },
  { id: "bumperBar", kind: "add", part: "hull", what: "Front bumper neon strip in MAGENTA with a dark housing and end caps.", at: [0, 0.7, 3.1], normal: [0, 0, 1], bone: null, room: [2.0, 0.2, 0.2] },
  { id: "grille", kind: "add", part: "hull", what: "Armoured front grille with horizontal slats in DARK and thin CYAN glow lines.", at: [0, 1.0, 3.05], normal: [0, 0, 1], bone: null, room: [1.4, 0.5, 0.2] },
  { id: "cannonNozzle", kind: "add", part: "cannon", what: "Water cannon nozzle fittings: collar rings, pressure gauge, hose clamps in STEEL and a cyan glow tip.", at: [0, 2.45, 1.9], normal: [0, 0, 1], bone: null, room: [0.5, 0.5, 0.5] },
  { id: "sideLightBars", kind: "add", part: "hull", what: "Vertical neon bars along both side flanks, alternating CYAN and MAGENTA, with dark housings.", at: [1.05, 1.2, 0], normal: [1, 0, 0], bone: null, room: [0.2, 0.3, 3.0] },
  { id: "roofAntennas", kind: "add", part: "cab", what: "Antenna array at the cab rear: three whip antennas, a dish and a small blinking beacon.", at: [0.5, 2.0, -0.6], normal: [0, 1, 0], bone: null, room: [0.6, 0.8, 0.5] },
  { id: "wheelRims", kind: "add", part: "wheel", what: "Neon ring rims and bolt patterns on all four wheels, CYAN glow inside STEEL hubs.", at: [1.0, 0.5, 1.9], normal: [1, 0, 0], bone: null, room: [0.3, 0.9, 0.9] },
  { id: "cageWindow", kind: "add", part: "cab", what: "Windscreen wire mesh guard and a CORP emblem decal on each door.", at: [0, 1.65, 1.35], normal: [0, 0.4, 1], bone: null, room: [1.6, 0.6, 0.2] },
  { id: "hullPaint", kind: "texture", part: "hullSide", what: "Corporate riot livery: HULL with diagonal DARK hazard stripes at the lower sill, a large faded unit number and logo.", },
  { id: "tireTread", kind: "texture", part: "tire", what: "Chunky tread pattern with grime on the tires." },
  { id: "plating", kind: "texture", part: "cab", what: "Scuffed armour panel seams, rivets and scratches on the cab." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const HULL = "#2b2f3a";
export const HULL_DARK = "#14161c";
export const STEEL = "#8a93a3";
export const CYAN = "#19f0ff";
export const MAGENTA = "#ff2bd6";
export const GLASS = "#0b2a3a";
export const DARK = "#0a0b0f";
export const YELLOW = "#f2c200";

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(g, c, { at, name, rotation: rot });

  // chassis and hull
  P(box(2.0, 0.35, 6.0), HULL_DARK, [0, 0.55, 0], "chassis");
  P(box(2.1, 0.8, 5.6), HULL, [0, 1.0, 0], "hull");
  P(box(2.12, 0.18, 5.4), YELLOW, [0, 0.72, 0], "hullSide");
  P(box(1.9, 0.12, 2.2), HULL, [0, 1.46, 1.8], "hood");
  // sloped hood
  P(box(2.0, 0.5, 0.8), HULL, [0, 1.0, 2.9], "nose", [-12, 0, 0].map((d) => d));
  // cab
  P(box(1.9, 0.8, 2.4), HULL, [0, 1.8, -0.6], "cab");
  P(box(1.7, 0.55, 0.1), GLASS, [0, 1.8, 0.62], "windscreen", [-18, 0, 0]);
  P(box(0.1, 0.5, 1.8), GLASS, [0.96, 1.85, -0.6], "windowL");
  P(box(0.1, 0.5, 1.8), GLASS, [-0.96, 1.85, -0.6], "windowR");
  P(box(1.8, 0.15, 2.3), HULL_DARK, [0, 2.25, -0.6], "roof");
  // rear
  P(box(1.9, 0.9, 1.6), HULL_DARK, [0, 1.5, -2.4], "rearBox");
  // bumper and grille
  P(box(2.2, 0.3, 0.3), STEEL, [0, 0.62, 3.15], "bumper");
  P(box(1.4, 0.45, 0.1), DARK, [0, 1.0, 3.12], "grilleBase");
  // neon strips
  P(box(2.0, 0.06, 0.06), MAGENTA, [0, 0.82, 3.3], "bumperGlow");
  for (const s of [1, -1]) {
    P(box(0.05, 0.05, 4.8), CYAN, [s * 1.08, 0.9, 0], "sideGlow");
    P(box(0.25, 0.14, 0.06), "#fff6d0", [s * 0.7, 1.2, 3.14], "headlight");
  }
  // wheels
  for (const s of [1, -1])
    for (const z of [1.9, -1.9]) {
      const t = P(new THREE.CylinderGeometry(0.5, 0.5, 0.45, 14), DARK, [s * 1.0, 0.5, z], "tire", [0, 0, 90]);
      P(new THREE.CylinderGeometry(0.28, 0.28, 0.48, 10), STEEL, [s * 1.0, 0.5, z], "wheelHub", [0, 0, 90]);
      void t;
    }
  // water cannon turret on roof
  P(new THREE.CylinderGeometry(0.4, 0.5, 0.25, 12), HULL_DARK, [0, 2.45, 0.4], "turretBase");
  P(box(0.6, 0.35, 0.6), HULL, [0, 2.7, 0.4], "turretHead");
  P(new THREE.CylinderGeometry(0.12, 0.16, 1.4, 10), STEEL, [0, 2.75, 1.1], "cannon", [90, 0, 0]);
  P(new THREE.CylinderGeometry(0.2, 0.14, 0.25, 10), HULL_DARK, [0, 2.75, 1.9], "cannonMuzzle", [90, 0, 0]);
  P(new THREE.CylinderGeometry(0.3, 0.3, 0.7, 10), HULL, [0, 2.7, -0.1], "waterTank", [0, 0, 90]);

  for (const add of STAGE2) add(b);
  return b.root;
}
```