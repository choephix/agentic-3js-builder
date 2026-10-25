import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

export const meta = {
  name: "hoverTruck",
  description: "Militarized pickup converted to hover thrusters, low-poly cyberpunk.",
};

export const REQUESTS = [
  { id: "roofLightBar", kind: "add", part: "cab", what: "Neon light bar across the cab roof: slim housing, six lamps alternating CYAN and MAGENTA, brackets.", at: [0, 1.72, 0.2], normal: [0, 1, 0], bone: null, room: [1.5, 0.2, 0.4] },
  { id: "grille", kind: "add", part: "hood", what: "Front grille: dark mesh slats with a glowing CYAN strip and a small emblem.", at: [0, 0.8, 2.52], normal: [0, 0, 1], bone: null, room: [1.2, 0.4, 0.15] },
  { id: "headlights", kind: "add", part: "hood", what: "Pair of angular headlights in AMBER with dark bezels, set into the front corners.", at: [0.7, 0.9, 2.5], normal: [0, 0, 1], bone: null, room: [1.6, 0.2, 0.2] },
  { id: "bedTurret", kind: "add", part: "bed", what: "Pintle-mounted machine gun in the bed: ring mount, gun with barrel shroud, ammo box, MAGENTA sight.", at: [0, 1.1, -1.3], normal: [0, 1, 0], bone: null, room: [0.9, 0.7, 1.2] },
  { id: "thrusterDetail", kind: "add", part: "thrusterFL", what: "Glowing CYAN turbine fan blades inside each thruster nacelle, plus intake vanes and exhaust rim glow.", at: [1.05, 0.35, 1.5], normal: [0, -1, 0], bone: null, room: [0.7, 0.4, 0.9] },
  { id: "antennaArray", kind: "add", part: "cab", what: "Antenna cluster behind the cab: whip antennas, a small dish, blinking MAGENTA tip lights.", at: [-0.6, 1.75, -0.5], normal: [0, 1, 0], bone: null, room: [0.5, 0.8, 0.5] },
  { id: "armorPlates", kind: "add", part: "bed", what: "Bolted armour plates and ribs along the bed sides with hazard stripes.", at: [0.98, 1.0, -1.3], normal: [1, 0, 0], bone: null, room: [0.1, 0.5, 2] },
  { id: "underglow", kind: "add", part: "chassis", what: "Neon underglow tubes along chassis underside in MAGENTA with cable runs.", at: [0, 0.4, 0], normal: [0, -1, 0], bone: null, room: [1.6, 0.1, 4] },
  { id: "mirrors", kind: "add", part: "cab", what: "Side mirrors with angular housings and small CYAN indicator strips.", at: [1.05, 1.3, 0.9], normal: [1, 0, 0], bone: null, room: [0.3, 0.3, 0.3] },
  { id: "hullCamo", kind: "texture", part: "hullSide", what: "Urban digital camo in HULL and HULL_DARK on the body sides, faded unit number near the rear." },
  { id: "windowGlass", kind: "texture", part: "windshield", what: "Tinted glass with CYAN HUD reflections and scanline streaks." },
  { id: "bedFloor", kind: "texture", part: "bedFloor", what: "Scuffed diamond-plate metal in GUNMETAL with oil stains and neon spill." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const HULL = "#4a5a4a";
export const HULL_DARK = "#2f3a30";
export const GUNMETAL = "#2a2d36";
export const DARK = "#14151b";
export const CYAN = "#19f0ff";
export const MAGENTA = "#ff2bd6";
export const AMBER = "#ffb02e";
export const GLASS = "#10303a";
export const STEEL = "#7b8190";

export default function build() {
  const b = createBuilder({ name: "hoverTruck" });
  const box = (w: number, h: number, d: number, c: string, at: number[], name?: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as any, name, rotation: rot as any });

  // chassis
  box(1.9, 0.25, 4.8, GUNMETAL, [0, 0.55, 0], "chassis");
  box(1.5, 0.12, 4.4, DARK, [0, 0.4, 0], "belly");
  // hull sides lower body
  for (const s of [1, -1]) box(0.12, 0.5, 4.8, HULL, [s * 0.98, 0.85, 0], "hullSide");
  // hood
  box(1.9, 0.45, 1.5, HULL, [0, 0.95, 1.75], "hood");
  b.part(new THREE.BoxGeometry(1.9, 0.12, 1.2), HULL_DARK, { at: [0, 1.2, 1.8], rotation: [-8, 0, 0], name: "hoodTop" });
  // cab
  box(1.9, 0.75, 1.5, HULL, [0, 1.2, 0.35], "cab");
  box(1.7, 0.1, 1.2, HULL_DARK, [0, 1.62, 0.2], "roof");
  // windshield (sloped)
  box(1.7, 0.55, 0.08, GLASS, [0, 1.38, 1.08], "windshield", [-28, 0, 0]);
  box(1.7, 0.4, 0.08, GLASS, [0, 1.38, -0.4], "rearGlass", [18, 0, 0]);
  for (const s of [1, -1]) {
    box(0.06, 0.4, 0.9, GLASS, [s * 0.96, 1.4, 0.4], "sideGlass");
    box(0.14, 0.55, 0.14, HULL_DARK, [s * 0.9, 1.38, 1.0], "pillar", [-28, 0, 0]);
  }
  // bed
  box(1.9, 0.12, 2.0, GUNMETAL, [0, 0.8, -1.5], "bedFloor");
  for (const s of [1, -1]) box(0.12, 0.5, 2.0, HULL, [s * 0.9, 1.05, -1.5], "bed");
  box(1.9, 0.5, 0.12, HULL, [0, 1.05, -2.5], "bed");
  box(1.9, 0.5, 0.12, HULL_DARK, [0, 1.05, -0.5], "bedFront");
  // bumpers
  box(2.0, 0.28, 0.25, DARK, [0, 0.6, 2.6], "bumperF");
  box(2.0, 0.22, 0.2, DARK, [0, 0.6, -2.5], "bumperR");
  // thrusters
  for (const sx of [1, -1])
    for (const [i, z] of [[0, 1.5], [1, -1.5]] as const) {
      const n = (i ? "thrusterR" : "thrusterF") + (sx > 0 ? "L" : "R");
      b.part(new THREE.CylinderGeometry(0.4, 0.34, 0.9, 8), GUNMETAL, { at: [sx * 1.25, 0.4, z], rotation: [90, 0, 0], name: n });
      b.part(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 8), DARK, { at: [sx * 1.25, 0.4, z + 0.45], rotation: [90, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 8), CYAN, { at: [sx * 1.25, 0.4, z - 0.47], rotation: [90, 0, 0] });
      box(0.3, 0.12, 0.8, HULL_DARK, [sx * 1.2, 0.7, z], "pylon");
      box(0.5, 0.06, 1.0, CYAN, [sx * 1.25, 0.08, z], "pad");
    }
  // lights
  for (const s of [1, -1]) {
    box(0.3, 0.14, 0.06, AMBER, [s * 0.7, 0.95, 2.52], "headlight");
    box(0.3, 0.12, 0.06, MAGENTA, [s * 0.7, 1.0, -2.57], "taillight");
  }
  box(0.9, 0.2, 0.06, DARK, [0, 0.9, 2.52], "grilleBase");
  // random neon accents
  const r = rng(3);
  for (let i = 0; i < 6; i++) box(0.04, 0.04, 0.3, i % 2 ? CYAN : MAGENTA, [(i % 2 ? 1 : -1) * 1.05, 0.9, -1.8 + r() * 3.6], "strip");

  for (const add of STAGE2) add(b);
  return b.root;
}
