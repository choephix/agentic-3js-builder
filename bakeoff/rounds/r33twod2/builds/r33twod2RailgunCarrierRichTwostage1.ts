import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier braced on four stabiliser legs, low-poly sci-fi military.",
};

export const REQUESTS = [
  { id: "roofLightBar", kind: "add", part: "cab", what: "Slim amber light bar across the cab roof with six lamps in AMBER and the brackets holding it.", at: [0, 2.55, 2.6], normal: [0, 1, 0], bone: "hull", room: [1.6, 0.25, 0.4] },
  { id: "cabGrille", kind: "add", part: "cab", what: "Armoured radiator grille on the cab front: horizontal slats in STEEL_DARK with a dark frame and two headlamps in GLOW_CYAN.", at: [0, 1.5, 4.0], normal: [0, 0, 1], bone: "hull", room: [1.8, 0.8, 0.3] },
  { id: "antennaArray", kind: "add", part: "deck", what: "Antenna array behind the cab: a whip antenna, a dish and a small sensor mast in STEEL and OLIVE_LIGHT.", at: [-1.0, 2.7, 1.2], normal: [0, 1, 0], bone: "hull", room: [0.6, 1.0, 0.6] },
  { id: "railFittings", kind: "add", part: "rail", what: "Rail fittings: clamp bands, insulator blocks and coil rings spaced along both rails in COPPER and STEEL_DARK.", at: [0, 3.3, -3.0], normal: [0, 1, 0], bone: "gun", room: [1.2, 0.6, 5.0] },
  { id: "muzzleBrake", kind: "add", part: "rail", what: "Muzzle assembly at the rail tip: a flared brake with glowing GLOW_CYAN slit and bolts.", at: [0, 3.5, -9.2], normal: [0, 0, -1], bone: "gun", room: [0.9, 0.9, 0.8] },
  { id: "capacitorCables", kind: "add", part: "capacitor", what: "Thick power cables from the capacitor bank to the rails with clamps, in INK and COPPER.", at: [0, 2.9, -2.0], normal: [0, 1, 0], bone: "hull", room: [1.6, 0.6, 1.5] },
  { id: "sideVents", kind: "add", part: "hullSide", what: "Vent grilles and tool lockers on both hull sides between the wheels in STEEL_DARK.", at: [1.45, 1.6, -1.0], normal: [1, 0, 0], bone: "hull", room: [0.2, 0.8, 2.2] },
  { id: "legPads", kind: "add", part: "legFoot", what: "Stabiliser foot pads: ribbed rubber soles, hydraulic piston sleeves and hazard chevrons in WARN.", at: [2.9, 0.1, -2.8], normal: [0, -1, 0], bone: "legFL", room: [1.0, 0.4, 1.0] },
  { id: "rearLights", kind: "add", part: "hull", what: "Rear tail lights and a tow hook in GLOW_RED and STEEL_DARK.", at: [0, 1.5, -5.6], normal: [0, 0, -1], bone: "hull", room: [2.2, 0.5, 0.3] },
  { id: "hullCamo", kind: "texture", part: "hullSide", what: "Digital camo in OLIVE, OLIVE_DARK and OLIVE_LIGHT blocks on hull sides, with a faded white unit number near the rear." },
  { id: "deckPlating", kind: "texture", part: "deck", what: "Anti-slip diamond tread and worn paint edges in STEEL_DARK on the deck." },
  { id: "cabGlass", kind: "texture", part: "cabGlass", what: "Tinted windscreen with reflection streaks and a cracked corner." },
  { id: "tyreTread", kind: "texture", part: "tyre", what: "Chunky block tread pattern on all six tyres in INK and RUBBER." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const OLIVE = "#5c6b3a";
const OLIVE_DARK = "#43502b";
const OLIVE_LIGHT = "#7e8c52";
const STEEL = "#8a929c";
const STEEL_DARK = "#4a5058";
const INK = "#1a1c20";
const RUBBER = "#26272b";
const COPPER = "#b4672f";
const WARN = "#e8b81c";
const GLOW_CYAN = "#5fe8ff";
const GLOW_RED = "#ff3a2a";
const GLASS = "#2b4a5e";

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const hull = b.joint("hull", { at: [0, 1.4, 0] });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, name?: string, rot?: number[]) =>
    b.part(g, c, { at, bone, name, rotation: rot, flat: true });

  // chassis
  P(box(2.8, 0.7, 11), OLIVE_DARK, [0, 1.3, -0.5], hull, "hull");
  P(box(2.6, 0.5, 10.6), OLIVE, [0, 1.85, -0.5], hull, "hullUpper");
  P(box(0.12, 0.8, 8.6), OLIVE, [1.42, 1.5, -1.0], hull, "hullSide");
  P(box(0.12, 0.8, 8.6), OLIVE, [-1.42, 1.5, -1.0], hull, "hullSide");
  P(box(2.4, 0.12, 6), STEEL_DARK, [0, 2.15, -2.2], hull, "deck");
  // front angled nose
  P(box(2.6, 0.5, 1.0), OLIVE_LIGHT, [0, 1.5, 5.3], hull, "nose", [-18, 0, 0]);
  // cab
  P(box(2.5, 1.3, 2.4), OLIVE, [0, 2.7, 3.2], hull, "cab");
  P(box(2.3, 0.2, 2.2), OLIVE_LIGHT, [0, 3.4, 3.1], hull, "cabRoof");
  P(box(2.2, 0.7, 0.1), GLASS, [0, 2.9, 4.45], hull, "cabGlass", [-15, 0, 0]);
  for (const s of [1, -1]) P(box(0.1, 0.6, 1.2), GLASS, [s * 1.27, 2.9, 3.2], hull, "cabGlass");
  // capacitor bank
  P(box(2.2, 0.9, 2.6), STEEL_DARK, [0, 2.7, -2.0], hull, "capacitor");
  for (let i = 0; i < 3; i++) P(new THREE.CylinderGeometry(0.4, 0.4, 2.0, 8), COPPER, [0, 3.35, -1.2 - i * 0.9], hull, "capCoil", [0, 0, 90]);
  // rear pylon
  P(box(2.0, 1.2, 1.6), OLIVE_DARK, [0, 2.9, -4.4], hull, "pylon");

  // gun
  const gun = b.joint("gun", { parent: hull, at: [0, 3.5, -4.0], dir: [0, 0, -1] });
  for (const s of [1, -1]) {
    P(box(0.28, 0.4, 11), STEEL, [s * 0.4, 3.5, -4.8], gun, "rail");
    P(box(0.12, 0.45, 11), COPPER, [s * 0.24, 3.5, -4.8], gun, "railInner");
  }
  P(box(1.4, 0.8, 1.4), STEEL_DARK, [0, 3.4, -3.6], gun, "breech");
  P(box(1.0, 0.5, 0.6), STEEL_DARK, [0, 3.5, -9.9], gun, "muzzle");
  P(box(0.5, 0.3, 0.1), GLOW_CYAN, [0, 3.5, -10.22], gun, "muzzleGlow");

  // wheels, three per side
  const zs = [3.3, 0.0, -3.3];
  zs.forEach((z, i) => {
    const ax = b.joint(`axle${i + 1}`, { parent: hull, at: [0, 0.9, z] });
    for (const s of [1, -1]) {
      P(new THREE.CylinderGeometry(0.9, 0.9, 0.7, 12), RUBBER, [s * 1.7, 0.9, z], ax, "tyre", [0, 0, 90]);
      P(new THREE.CylinderGeometry(0.5, 0.5, 0.76, 8), STEEL, [s * 1.7, 0.9, z], ax, "hub", [0, 0, 90]);
      P(box(0.9, 0.12, 1.5), OLIVE_DARK, [s * 1.7, 1.9, z], hull, "fender");
    }
    P(new THREE.CylinderGeometry(0.12, 0.12, 3.4, 6), STEEL_DARK, [0, 0.9, z], ax, "axleBar", [0, 0, 90]);
  });

  // stabiliser legs
  for (const [sx, z, n] of [[1, 3.0, "FL"], [-1, 3.0, "FR"], [1, -3.8, "BL"], [-1, -3.8, "BR"]] as [number, number, string][]) {
    const leg = b.joint(`leg${n}`, { parent: hull, at: [sx * 1.5, 1.7, z], dir: [sx, -0.45, 0] });
    P(box(0.5, 0.4, 0.5), STEEL_DARK, [sx * 1.6, 1.7, z], leg, "legHinge");
    const a = [sx * 1.6, 1.7, z], e = [sx * 2.9, 0.15, z];
    b.rod(a, e, 0.17, STEEL, { bone: leg, name: "legArm" });
    b.rod([sx * 1.9, 1.6, z], [sx * 2.9, 0.4, z], 0.1, COPPER, { bone: leg, name: "piston" });
    P(box(1.0, 0.18, 1.0), STEEL_DARK, [sx * 2.9, 0.09, z], leg, "legFoot");
    P(box(0.9, 0.04, 0.9), WARN, [sx * 2.9, 0.2, z], leg, "footStripe");
  }

  // lights
  for (const s of [1, -1]) {
    P(box(0.4, 0.2, 0.1), GLOW_CYAN, [s * 0.8, 1.6, 5.78], hull, "headlamp");
    P(box(0.4, 0.2, 0.1), GLOW_RED, [s * 0.9, 1.5, -6.02], hull, "tailLight");
  }
  void rng;
  for (const add of STAGE2) add(b);
  return b.root;
}
