import * as THREE from "three";
import { createBuilder, type Builder } from "../../../../src/index";

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control interceptor with roof water cannon and neon light bars, cyberpunk style.",
};

export const REQUESTS = [
  { id: "roofLightBar", kind: "add", part: "cab", what: "Neon light bar across the cab roof: slim housing, six lamps alternating CYAN and MAGENTA, end brackets.", at: [0, 2.0, 0.5], normal: [0, 1, 0], bone: null, room: [1.7, 0.2, 0.3] },
  { id: "frontBumperBar", kind: "add", part: "bumper", what: "Wide neon strip and push-bar on the front bumper: dark bull-bar frame with a CYAN glowing strip and corner lamps.", at: [0, 0.6, 2.75], normal: [0, 0, 1], bone: null, room: [2.0, 0.4, 0.3] },
  { id: "grille", kind: "add", part: "hood", what: "Aggressive slatted grille with a corporate emblem in MAGENTA between two slim headlamp strips.", at: [0, 0.95, 2.62], normal: [0, 0, 1], bone: null, room: [1.2, 0.4, 0.2] },
  { id: "cannonNozzle", kind: "add", part: "turretBarrel", what: "Water cannon nozzle: flared muzzle ring, pressure gauge, hose clamps and a CYAN glow ring.", at: [0, 2.55, 1.9], normal: [0, 0, 1], bone: "cannonPitch", room: [0.4, 0.4, 0.3] },
  { id: "sideLightBarL", kind: "add", part: "hullSide", what: "Left side rocker neon strip in MAGENTA with small vent slats above.", at: [1.05, 0.55, 0], normal: [1, 0, 0], bone: null, room: [0.2, 0.15, 3.0] },
  { id: "sideLightBarR", kind: "add", part: "hullSide", what: "Right side rocker neon strip in MAGENTA with small vent slats above.", at: [-1.05, 0.55, 0], normal: [-1, 0, 0], bone: null, room: [0.2, 0.15, 3.0] },
  { id: "antennaArray", kind: "add", part: "cab", what: "Rear roof antenna array: three whip antennas of different heights, a dish and a small blinking beacon.", at: [0.6, 2.0, -0.9], normal: [0, 1, 0], bone: null, room: [0.6, 0.8, 0.5] },
  { id: "windowDetail", kind: "add", part: "windshield", what: "Armoured window wire grilles on the side windows and a HUD-like cyan sticker strip on the windshield top.", at: [0, 1.65, 1.1], normal: [0, 0, 1], bone: null, room: [1.6, 0.5, 0.2] },
  { id: "rearDetail", kind: "add", part: "rearDeck", what: "Rear lights bar in RED, exhaust pipes, tank hatch and hose reel with coiled hose.", at: [0, 1.2, -2.6], normal: [0, 0, -1], bone: null, room: [1.8, 0.8, 0.3] },
  { id: "hullCamo", kind: "texture", part: "hullSide", what: "Corporate livery on hull sides: diagonal HULL_DARK hazard chevrons, white unit number and faded scratches.", },
  { id: "tankTexture", kind: "texture", part: "tank", what: "Water tank with warning stripes, corporate logo and weathered grime in TANK and HULL_DARK.", },
  { id: "tyreTexture", kind: "texture", part: "wheel", what: "Tyre tread pattern and brushed hubcap with CYAN rim glow lines.", },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const HULL = "#2b3140";
const HULL_DARK = "#14171f";
const HULL_LIGHT = "#4a546a";
const TANK = "#3d4a5c";
const GLASS = "#0b2a3a";
const CYAN = "#19f0ff";
const MAGENTA = "#ff2bd6";
const RED = "#ff2a3a";
const YELLOW = "#ffd400";
const TYRE = "#0c0c0f";
const RIM = "#8b93a6";

export default function build() {
  const b = createBuilder({ name: "riotInterceptor" });
  const root = b.joint("chassis", { at: [0, 0.6, 0] });
  const cannonYaw = b.joint("cannonYaw", { parent: root, at: [0, 2.05, -0.4], dir: [0, 1, 0] });
  const cannonPitch = b.joint("cannonPitch", { parent: cannonYaw, at: [0, 2.3, -0.2], dir: [0, 0, 1] });

  const box = (w: number, h: number, d: number, c: string, at: number[], name: string, bone: any = root) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as any, bone, name });

  // underbody & hull
  box(2.0, 0.35, 5.2, HULL_DARK, [0, 0.55, 0], "underbody");
  box(1.9, 0.5, 5.2, HULL, [0, 0.95, 0], "hullSide");
  for (const s of [1, -1]) {
    box(0.1, 0.45, 5.0, HULL_LIGHT, [s * 1.0, 0.95, 0], "hullSide");
    box(0.08, 0.1, 4.2, HULL_DARK, [s * 1.02, 0.6, 0], "rocker");
    box(0.04, 0.05, 3.2, MAGENTA, [s * 1.07, 0.52, 0], "rockerNeon");
  }
  // hood sloped
  b.frustumBox([0, 1.2, 1.4], [0, 1.2, 2.55], [1.9, 0.6], [1.8, 0.45], { color: HULL, name: "hood" });
  box(1.4, 0.06, 0.9, HULL_LIGHT, [0, 1.52, 1.85], "hoodPlate");
  // bumper
  box(2.1, 0.35, 0.3, HULL_DARK, [0, 0.65, 2.65], "bumper");
  box(1.6, 0.08, 0.1, CYAN, [0, 0.65, 2.82], "bumperNeon");
  // grille
  box(1.1, 0.3, 0.06, HULL_DARK, [0, 1.0, 2.62], "grille");
  for (const s of [1, -1]) {
    box(0.4, 0.08, 0.05, "#fff6c8", [s * 0.7, 1.15, 2.6], "headlamp");
    box(0.25, 0.1, 0.1, MAGENTA, [s * 0.95, 0.65, 2.8], "cornerLamp");
  }
  // cab
  box(1.85, 0.75, 2.0, HULL, [0, 1.65, 0.2], "cab");
  box(1.75, 0.08, 1.9, HULL_LIGHT, [0, 2.06, 0.2], "cabRoof");
  b.part(new THREE.BoxGeometry(1.6, 0.55, 0.06), GLASS, { at: [0, 1.7, 1.2], rotation: [-18, 0, 0], bone: root, name: "windshield" });
  for (const s of [1, -1]) {
    box(0.05, 0.4, 1.4, GLASS, [s * 0.93, 1.75, 0.3], "sideWindow");
    box(0.08, 0.05, 1.5, CYAN, [s * 0.94, 1.5, 0.3], "windowTrim");
  }
  // rear body / tank
  box(1.95, 0.9, 2.2, HULL, [0, 1.3, -1.5], "rearDeck");
  b.part(new THREE.CylinderGeometry(0.7, 0.7, 1.8, 10), TANK, { at: [0, 1.95, -1.55], rotation: [0, 0, 90], bone: root, name: "tank" });
  for (const z of [-0.9, -1.55, -2.2]) b.part(new THREE.CylinderGeometry(0.73, 0.73, 0.1, 10), HULL_DARK, { at: [0, 1.95, z], rotation: [90, 0, 0], bone: root, name: "tankBand" });
  box(1.9, 0.08, 0.1, RED, [0, 1.3, -2.62], "tailLight");
  // roof light bar housing
  box(1.5, 0.1, 0.22, HULL_DARK, [0, 2.15, 0.5], "lightBarHousing");
  for (let i = 0; i < 6; i++)
    box(0.2, 0.07, 0.18, i % 2 ? MAGENTA : CYAN, [-0.6 + i * 0.24, 2.22, 0.5], "roofLamp");
  // wheels
  for (const s of [1, -1])
    for (const z of [1.7, -1.6]) {
      box(0.5, 0.2, 1.0, HULL_DARK, [s * 0.98, 0.9, z], "arch");
      b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12), TYRE, { at: [s * 1.0, 0.5, z], rotation: [0, 0, 90], bone: root, name: "wheel" });
      b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.42, 8), RIM, { at: [s * 1.0, 0.5, z], rotation: [0, 0, 90], bone: root, name: "hub" });
      b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.44, 8), CYAN, { at: [s * 1.0, 0.5, z], rotation: [0, 0, 90], bone: root, name: "hubGlow" });
    }
  // turret
  b.part(new THREE.CylinderGeometry(0.5, 0.6, 0.25, 10), HULL_DARK, { at: [0, 2.2, -0.4], bone: cannonYaw, name: "turretBase" });
  box(0.7, 0.5, 0.8, HULL, [0, 2.55, -0.4], "turretBody", cannonYaw);
  b.part(new THREE.CylinderGeometry(0.15, 0.2, 1.4, 8), HULL_LIGHT, { at: [0, 2.6, 0.7], rotation: [90, 0, 0], bone: cannonPitch, name: "turretBarrel" });
  b.part(new THREE.CylinderGeometry(0.24, 0.17, 0.25, 8), HULL_DARK, { at: [0, 2.6, 1.5], rotation: [90, 0, 0], bone: cannonPitch, name: "nozzle" });
  box(0.1, 0.1, 0.3, YELLOW, [0, 2.9, 0.2], "turretMark", cannonPitch);

  for (const add of STAGE2) add(b);
  return b.root;
}
