import * as THREE from "three";
import { type Builder, createBuilder, rng, paint, noise } from "../../../../src/index";

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

const CAMO = paint((p, _n) => {
  const q = Math.floor(p.z / 0.35) * 7 + Math.floor(p.y / 0.3) * 3;
  const v = noise(new THREE.Vector3(Math.floor(p.z / 0.35) * 0.35, Math.floor(p.y / 0.3) * 0.3, 0), 0.9, 4);
  void q;
  let c = v < 0.38 ? OLIVE_DARK : v > 0.62 ? OLIVE_LIGHT : OLIVE;
  const zz = p.z + 4.6, yy = p.y - 1.25;
  const bar = (x0: number, x1: number, y0: number, y1: number) => zz > x0 && zz < x1 && yy > y0 && yy < y1;
  if (bar(0, 0.08, 0, 0.5) || bar(0.3, 0.38, 0, 0.5) || bar(0.0, 0.38, 0, 0.07) || bar(0.5, 0.58, 0, 0.5) || bar(0.5, 0.9, 0.43, 0.5) || bar(0.82, 0.9, 0, 0.5) || bar(0.5, 0.9, 0, 0.07))
    c = "#c9cbbd";
  return c;
});
const DECK = paint((p, n) => {
  const u = Math.abs(((p.x / 0.16) % 1 + 1) % 1 - 0.5);
  const v = Math.abs(((p.z / 0.16) % 1 + 1) % 1 - 0.5);
  const wear = noise(p, 0.5, 8) > 0.68 || Math.abs(p.x) > 1.12;
  if (n.y > 0.5 && u + v < 0.28) return wear ? "#6c7178" : "#5a6068";
  return wear ? "#7a7f86" : STEEL_DARK;
});
const GLASSP = paint((p, _n) => {
  const d = p.x * 0.8 + p.y * 1.6;
  const streak = Math.abs(((d / 0.45) % 1 + 1) % 1 - 0.5) < 0.07 || Math.abs(((d / 0.45 + 0.37) % 1 + 1) % 1 - 0.5) < 0.025;
  const cx = p.x - 0.9, cy = p.y - 2.75;
  const a = Math.atan2(cy, cx), r = Math.hypot(cx, cy);
  const crack = r < 0.45 && Math.abs(Math.sin(a * 3.5)) < 0.06 + r * 0.05;
  return crack ? "#c8e4ee" : streak ? "#5c8296" : GLASS;
});
const TYRE = paint((p, n) => {
  if (Math.abs(n.x) > 0.8) return "#303136";
  const zc = p.z > 1.6 ? 3.3 : p.z > -1.6 ? 0 : -3.3;
  const a = Math.atan2(p.y - 0.9, p.z - zc);
  const k = ((a / (Math.PI * 2)) * 18) % 1;
  const block = Math.abs((k + 1) % 1 - 0.5) < 0.3;
  const lat = Math.abs(Math.abs(p.x) - 1.7) < 0.06;
  return block && !lat ? RUBBER : INK;
});

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const hull = b.joint("hull", { at: [0, 1.4, 0] });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: any, at: number[], bone: any, name?: string, rot?: number[]) =>
    b.part(g, c, { at, bone, name, rotation: rot, flat: true });

  // chassis
  P(box(2.8, 0.7, 11), OLIVE_DARK, [0, 1.3, -0.5], hull, "hull");
  P(box(2.6, 0.5, 10.6), OLIVE, [0, 1.85, -0.5], hull, "hullUpper");
  P(box(0.12, 0.8, 8.6), CAMO, [1.42, 1.5, -1.0], hull, "hullSide");
  P(box(0.12, 0.8, 8.6), CAMO, [-1.42, 1.5, -1.0], hull, "hullSide");
  P(box(2.4, 0.12, 6), DECK, [0, 2.15, -2.2], hull, "deck");
  // front angled nose
  P(box(2.6, 0.5, 1.0), OLIVE_LIGHT, [0, 1.5, 5.3], hull, "nose", [-18, 0, 0]);
  // cab
  P(box(2.5, 1.3, 2.4), OLIVE, [0, 2.7, 3.2], hull, "cab");
  P(box(2.3, 0.2, 2.2), OLIVE_LIGHT, [0, 3.4, 3.1], hull, "cabRoof");
  P(box(2.2, 0.7, 0.1), GLASSP, [0, 2.9, 4.45], hull, "cabGlass", [-15, 0, 0]);
  for (const s of [1, -1]) P(box(0.1, 0.6, 1.2), GLASSP, [s * 1.27, 2.9, 3.2], hull, "cabGlass");
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
      P(new THREE.CylinderGeometry(0.9, 0.9, 0.7, 12), TYRE, [s * 1.7, 0.9, z], ax, "tyre", [0, 0, 90]);
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

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addRoofLightBar(b: Builder) {
  const AMBER = "#ffb21e";
  const AMBER_DARK = "#8a5a10";
  const BAR_Y = 3.5 + 0.12; // cab roof top is at about 3.5
  const z = 2.6;
  const P = (g: THREE.BufferGeometry, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(g, c, { at, bone: "hull", name, rotation: rot, flat: true });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // housing
  P(box(1.6, 0.14, 0.34), STEEL_DARK, [0, BAR_Y + 0.12, z], "lightBarBase");
  P(box(1.64, 0.04, 0.38), INK, [0, BAR_Y + 0.03, z], "lightBarSkirt");
  // brackets
  for (const s of [1, -1]) {
    P(box(0.14, 0.14, 0.26), STEEL, [s * 0.65, BAR_Y - 0.02, z], "lightBarBracket");
    P(box(0.2, 0.03, 0.3), STEEL_DARK, [s * 0.65, BAR_Y - 0.09, z], "lightBarFoot");
    for (const bx of [-1, 1])
      P(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), STEEL, [s * 0.65 + bx * 0.06, BAR_Y - 0.07, z + 0.1], "lightBarBolt");
  }
  // six lamps: amber lenses with dark housings
  for (let i = 0; i < 6; i++) {
    const x = -0.65 + i * 0.26;
    P(box(0.22, 0.16, 0.3), AMBER_DARK, [x, BAR_Y + 0.27, z], "lampHousing");
    const lens = P(box(0.18, 0.12, 0.26), AMBER, [x, BAR_Y + 0.3, z], "lampLens");
    lens.mesh.material = (lens.mesh.material as THREE.MeshStandardMaterial).clone();
    const m = lens.mesh.material as THREE.MeshStandardMaterial;
    m.emissive.set(AMBER);
    m.emissiveIntensity = 1.4;
    P(box(0.1, 0.03, 0.14), "#ffe9a8", [x, BAR_Y + 0.37, z], "lampGlint");
  }
  // end caps
  for (const s of [1, -1]) P(box(0.06, 0.2, 0.36), INK, [s * 0.83, BAR_Y + 0.2, z], "lightBarCap");
  // cable
  b.rod([0.5, BAR_Y + 0.05, z - 0.18], [0.5, 3.45, z - 0.5], 0.025, INK, { bone: "hull", name: "lightBarCable" });
}
    return addRoofLightBar;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addCabGrille(b: Builder) {
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(g, c, { at, bone: "hull", name, rotation: rot, flat: true });

  // ---- cab grille (front of nose, z ~ 5.8 is nose face; cab front glass at 4.45) ----
  const gz = 5.86;
  P(box(1.9, 0.9, 0.08), INK, [0, 1.5, gz], "grilleBack");
  // frame
  P(box(2.0, 0.08, 0.14), STEEL_DARK, [0, 1.98, gz + 0.03], "grilleFrameT");
  P(box(2.0, 0.08, 0.14), STEEL_DARK, [0, 1.02, gz + 0.03], "grilleFrameB");
  for (const s of [1, -1]) P(box(0.08, 0.96, 0.14), STEEL_DARK, [s * 0.96, 1.5, gz + 0.03], "grilleFrameS");
  // slats
  for (let i = 0; i < 6; i++) {
    P(box(1.8, 0.07, 0.1), i % 2 ? STEEL_DARK : STEEL, [0, 1.12 + i * 0.15, gz + 0.08], "grilleSlat", [-20, 0, 0]);
  }
  // centre emblem
  P(box(0.18, 0.18, 0.06), WARN, [0, 1.5, gz + 0.14], "grilleBadge", [0, 0, 45]);
  // headlamps with housings
  for (const s of [1, -1]) {
    P(box(0.5, 0.34, 0.12), STEEL_DARK, [s * 0.62, 1.78, gz + 0.1], "lampHousing");
    const lamp = P(new THREE.CylinderGeometry(0.12, 0.14, 0.1, 8), GLOW_CYAN, [s * 0.62, 1.78, gz + 0.19], "grilleLamp", [90, 0, 0]);
    void lamp;
    P(box(0.5, 0.05, 0.16), INK, [s * 0.62, 1.98, gz + 0.12], "lampBrow");
  }
  // tow bolts
  for (const s of [1, -1]) P(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 6), STEEL, [s * 0.9, 1.1, gz + 0.12], "grilleBolt", [90, 0, 0]);

  // ---- antenna array ----
  const ax = -1.0, ay = 2.26, az = 1.2;
  P(box(0.6, 0.1, 0.6), STEEL_DARK, [ax, ay, az], "antBase");
  // whip antenna
  P(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 6), STEEL, [ax - 0.18, ay + 0.15, az - 0.18], "whipMount");
  P(new THREE.CylinderGeometry(0.012, 0.025, 1.6, 5), STEEL, [ax - 0.18, ay + 0.95, az - 0.18], "whip");
  P(new THREE.SphereGeometry(0.035, 5, 4), GLOW_RED, [ax - 0.18, ay + 1.77, az - 0.18], "whipTip");
  // sensor mast
  P(new THREE.CylinderGeometry(0.05, 0.07, 0.8, 6), OLIVE_LIGHT, [ax + 0.15, ay + 0.45, az + 0.15], "mast");
  P(box(0.26, 0.16, 0.2), OLIVE_LIGHT, [ax + 0.15, ay + 0.9, az + 0.15], "sensorBox");
  P(box(0.1, 0.1, 0.05), GLOW_CYAN, [ax + 0.15, ay + 0.9, az + 0.27], "sensorEye");
  // dish
  P(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6), STEEL, [ax + 0.12, ay + 0.25, az - 0.2], "dishPost");
  const dish = new THREE.SphereGeometry(0.28, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2.4);
  P(dish, STEEL, [ax + 0.12, ay + 0.5, az - 0.2], "dish", [-70, 0, 0]);
  P(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 4), STEEL_DARK, [ax + 0.12, ay + 0.62, az - 0.08], "dishFeed", [-70, 0, 0]);
  // guy brackets
  for (const s of [1, -1]) P(box(0.08, 0.08, 0.2), STEEL_DARK, [ax + s * 0.25, ay + 0.08, az], "antClamp");
}
    return addCabGrille;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addRailFittings(b: Builder) {
  const gun = "gun";
  const BRASS = "#d9944a";
  const BOLT = "#2f343a";
  const cyl = (rt: number, rb: number, h: number, s: number) => new THREE.CylinderGeometry(rt, rb, h, s);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(g, c, { at, bone: gun, name, rotation: rot, flat: true });

  // rails sit at x = +-0.4, y = 3.5, z from -10.3 to -0.3 (width 0.28, height 0.4/0.45)
  const railY = 3.5;
  const zs = [-1.2, -2.4, -3.6, -4.8, -6.0, -7.2];

  zs.forEach((z, i) => {
    // clamp band wrapping both rails
    P(box(1.28, 0.1, 0.22), STEEL_DARK, [0, railY + 0.27, z], "railClampTop");
    P(box(1.28, 0.1, 0.22), STEEL_DARK, [0, railY - 0.27, z], "railClampBot");
    for (const s of [1, -1]) {
      P(box(0.1, 0.5, 0.22), STEEL_DARK, [s * 0.62, railY, z], "railClampSide");
      P(box(0.1, 0.5, 0.22), STEEL_DARK, [s * 0.18, railY, z], "railClampMid");
      // bolt heads
      P(cyl(0.045, 0.045, 0.05, 6), BOLT, [s * 0.4, railY + 0.34, z], "clampBolt");
    }
    // insulator block bridging the gap between rails
    if (i % 2 === 0) {
      P(box(0.22, 0.3, 0.3), COPPER, [0, railY, z - 0.6], "insulator");
      P(box(0.26, 0.05, 0.34), STEEL_DARK, [0, railY + 0.17, z - 0.6], "insulatorCap");
      P(box(0.26, 0.05, 0.34), STEEL_DARK, [0, railY - 0.17, z - 0.6], "insulatorBase");
    }
  });

  // coil rings around each rail (copper discs), grouped in the rear half
  for (const s of [1, -1]) {
    for (let k = 0; k < 7; k++) {
      const z = -2.0 - k * 0.8;
      const ring = P(cyl(0.3, 0.3, 0.1, 8), COPPER, [s * 0.4, railY, z], "coilRing", [90, 0, 0]);
      void ring;
      P(cyl(0.2, 0.2, 0.12, 8), BRASS, [s * 0.4, railY, z], "coilHub", [90, 0, 0]);
    }
    // conductor strap on the outer side
    P(box(0.05, 0.12, 6.0), COPPER, [s * 0.56, railY - 0.12, -4.6], "railStrap");
    // top spine rib
    P(box(0.08, 0.06, 7.0), STEEL, [s * 0.4, railY + 0.25, -5.0], "railRib");
  }
}
    return addRailFittings;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addMuzzleBrake(b: Builder) {
  const gunJ = "gun";
  const P = (g: THREE.BufferGeometry, c: string, at: number[], rot?: number[], name?: string) =>
    b.part(g, c, { at, bone: gunJ, rotation: rot, name, flat: true });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // ---- muzzle brake: flared housing at the rail tip (rails end near z=-10.3)
  const cx = 0, cy = 3.5;
  // flared frustum: wide at the back, narrowing slightly forward (z negative)
  P(new THREE.CylinderGeometry(0.42, 0.34, 0.5, 8), STEEL_DARK, [cx, cy, -10.4], [90, 0, 0], "brakeCore");
  // flared plates: four fins around the muzzle, flaring outward
  for (const s of [1, -1]) {
    P(box(0.08, 0.7, 0.7), STEEL, [s * 0.5, cy, -10.55], [0, s * -14, 0], "brakeFin");
    P(box(0.7, 0.08, 0.7), STEEL, [0, cy + s * 0.5, -10.55], [s * 14, 0, 0], "brakeFin");
    // side vent slits
    P(box(0.1, 0.38, 0.1), INK, [s * 0.545, cy, -10.55], undefined, "brakeVent");
    P(box(0.1, 0.38, 0.1), INK, [s * 0.57, cy, -10.4], undefined, "brakeVent");
  }
  // rings
  P(new THREE.CylinderGeometry(0.48, 0.48, 0.1, 8), COPPER, [cx, cy, -10.18], [90, 0, 0], "brakeRing");
  P(new THREE.CylinderGeometry(0.46, 0.46, 0.08, 8), COPPER, [cx, cy, -10.68], [90, 0, 0], "brakeRing");
  // front face with glowing slit
  P(box(0.7, 0.7, 0.06), STEEL_DARK, [cx, cy, -10.74], undefined, "brakeFace");
  P(box(0.5, 0.1, 0.05), GLOW_CYAN, [cx, cy, -10.79], undefined, "brakeSlit");
  P(box(0.12, 0.5, 0.05), GLOW_CYAN, [cx, cy, -10.79], undefined, "brakeSlitV");
  // bolts at corners of the face
  for (const sx of [1, -1])
    for (const sy of [1, -1])
      P(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 6), STEEL, [sx * 0.28, cy + sy * 0.28, -10.8], [90, 0, 0], "brakeBolt");
  // bolts on the rings
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    P(new THREE.SphereGeometry(0.035, 5, 4), STEEL, [cx + Math.cos(a) * 0.48, cy + Math.sin(a) * 0.48, -10.18], undefined, "ringBolt");
  }

  // ---- capacitor cables: arcs from capacitor bank top up to the rails
  const cable = (x0: number, z0: number, x1: number, z1: number, tag: string) => {
    const pts = [
      [x0, 3.15, z0],
      [x0 * 0.8 + x1 * 0.2, 3.7, z0 * 0.7 + z1 * 0.3],
      [x1 * 0.8 + x0 * 0.2, 3.85, z0 * 0.3 + z1 * 0.7],
      [x1, 3.7, z1],
    ];
    b.sweep(pts, 0.07, { color: INK, bone: "hull", name: "cable" + tag });
    // clamps along the cable
    for (let k = 1; k < 3; k++) {
      const t = k / 3;
      const x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
      b.part(box(0.2, 0.18, 0.14), COPPER, { at: [x, 3.78, z], bone: "hull", name: "clamp" + tag } as any);
    }
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.12, 6), COPPER, { at: [x0, 3.17, z0], bone: "hull", name: "cableLug" });
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.12, 6), COPPER, { at: [x1, 3.7, z1], bone: "hull", rotation: [0, 0, 90], name: "cableLug" });
  };
  for (const s of [1, -1]) {
    cable(s * 0.9, -1.4, s * 0.45, -3.0, "A" + s);
    cable(s * 0.6, -2.4, s * 0.4, -3.8, "B" + s);
  }
  // terminal posts on capacitor top
  for (const s of [1, -1])
    for (const z of [-1.4, -2.4]) {
      b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.14, 6), STEEL, { at: [s * (z === -1.4 ? 0.9 : 0.6), 3.2, z], bone: "hull", name: "terminal" });
    }
}
    return addMuzzleBrake;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addSideVents(b: Builder) {
  const LATCH = "#2a2d33";
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], name: string) =>
    b.part(g, c, { at, bone: "hull", name, flat: true });

  for (const s of [1, -1]) {
    const x = s * 1.5; // hull side panel outer face is at about 1.48
    // vent grille: frame, dark recess, slats
    const vz = -0.2, vy = 1.75;
    put(box(0.06, 0.62, 1.1), STEEL_DARK, [x, vy, vz], "ventFrame");
    put(box(0.04, 0.5, 0.98), INK, [x + s * 0.025, vy, vz], "ventRecess");
    for (let i = 0; i < 6; i++) {
      put(box(0.05, 0.05, 0.94), STEEL_DARK, [x + s * 0.05, vy - 0.2 + i * 0.08, vz], "ventSlat");
    }
    // tool locker
    const lz = -2.1, ly = 1.6;
    put(box(0.08, 0.7, 1.3), STEEL_DARK, [x, ly, lz], "locker");
    put(box(0.05, 0.6, 1.2), OLIVE_DARK, [x + s * 0.05, ly, lz], "lockerDoor");
    // hinge and handle
    put(box(0.06, 0.55, 0.05), STEEL, [x + s * 0.09, ly, lz - 0.6], "lockerHinge");
    put(box(0.07, 0.1, 0.22), LATCH, [x + s * 0.1, ly, lz + 0.35], "lockerHandle");
    put(box(0.07, 0.04, 0.3), WARN, [x + s * 0.09, ly + 0.28, lz], "lockerStripe");
    // small second locker and bolts
    put(box(0.07, 0.4, 0.6), STEEL_DARK, [x, 1.55, 0.9], "smallLocker");
    put(box(0.07, 0.1, 0.12), LATCH, [x + s * 0.06, 1.55, 0.8], "smallLatch");
    for (const dz of [-0.6, 0.6]) for (const dy of [-0.3, 0.3]) {
      put(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), STEEL, [x + s * 0.05, vy + dy, vz + dz * 0.8 + 0.0], "bolt").mesh.rotation.z = Math.PI / 2;
    }
  }
}
    return addSideVents;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addLegPads(b: Builder) {
  const RUBBER_HI = "#3a3b41";
  const CHROME = "#c9d0d8";
  const HOOK = "#6b727b";

  const mk = (g: THREE.BufferGeometry, c: string, at: number[], bone: string, name: string, rot?: number[]) =>
    b.part(g, c, { at, bone, name, rotation: rot, flat: true });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // ---- Stabiliser foot pads on all four legs
  const legs: [string, number, number][] = [
    ["legFL", 1, 3.0],
    ["legFR", -1, 3.0],
    ["legBL", 1, -3.8],
    ["legBR", -1, -3.8],
  ];
  for (const [bone, sx, z] of legs) {
    const x = sx * 2.9;
    // rubber sole under the steel foot
    mk(box(1.08, 0.1, 1.08), RUBBER, [x, 0.0, z], bone, "padSole");
    // ribs across the sole
    for (let i = -2; i <= 2; i++) mk(box(1.0, 0.05, 0.08), RUBBER_HI, [x, -0.02, z + i * 0.2], bone, "padRib");
    // corner bolts
    for (const cx of [-0.4, 0.4])
      for (const cz of [-0.4, 0.4])
        mk(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 6), CHROME, [x + cx, 0.21, z + cz], bone, "padBolt");
    // hazard chevrons on top plate
    for (let i = -2; i <= 2; i++) {
      mk(box(0.1, 0.03, 0.34), WARN, [x + i * 0.17, 0.215, z + 0.3], bone, "chevron", [0, i % 2 ? 30 : -30, 0]);
      mk(box(0.1, 0.03, 0.34), WARN, [x + i * 0.17, 0.215, z - 0.3], bone, "chevron", [0, i % 2 ? -30 : 30, 0]);
    }
    // piston sleeve with chrome rod
    const topX = sx * 2.55;
    mk(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 8), STEEL_DARK, [topX, 0.55, z + 0.28], bone, "sleeve", [0, 0, sx * 30]);
    mk(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6), CHROME, [sx * 2.7, 0.35, z + 0.28], bone, "pistonRod", [0, 0, sx * 30]);
    mk(box(0.3, 0.12, 0.12), WARN, [x, 0.3, z + 0.52], bone, "footMark");
  }

  // ---- Rear lights and tow hook
  const zr = -6.05;
  for (const s of [1, -1]) {
    mk(box(0.62, 0.34, 0.08), STEEL_DARK, [s * 0.9, 1.5, zr + 0.02], "hull", "tailHousing");
    mk(box(0.5, 0.22, 0.06), GLOW_RED, [s * 0.9, 1.5, zr - 0.04], "hull", "tailLens");
    mk(box(0.5, 0.06, 0.06), GLOW_RED, [s * 0.9, 1.72, zr - 0.04], "hull", "tailStrip");
    mk(box(0.14, 0.14, 0.08), WARN, [s * 1.2, 1.25, zr - 0.02], "hull", "reflector");
  }
  // tow hook assembly
  mk(box(0.5, 0.3, 0.3), STEEL_DARK, [0, 1.3, zr - 0.1], "hull", "towMount");
  mk(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 6), HOOK, [0, 1.3, zr - 0.4], "hull", "towShank", [90, 0, 0]);
  mk(new THREE.TorusGeometry(0.17, 0.05, 5, 8, Math.PI * 1.5), HOOK, [0, 1.15, zr - 0.6], "hull", "towHook", [0, 0, 45]);
  for (const s of [1, -1]) mk(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6), CHROME, [s * 0.2, 1.3, zr - 0.27], "hull", "towBolt", [90, 0, 0]);
  // bumper bar
  mk(box(2.5, 0.14, 0.14), STEEL_DARK, [0, 1.0, zr - 0.05], "hull", "bumper");
}
    return addLegPads;
  })(),
);
