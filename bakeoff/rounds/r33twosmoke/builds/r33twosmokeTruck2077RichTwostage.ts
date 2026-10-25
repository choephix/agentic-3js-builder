import * as THREE from "three";
import { type Builder, createBuilder, paint, noise, mix, panelled, svg, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

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
  const CAMO = paint((p) => {
    const q = 0.22;
    const cx = Math.floor(p.x / q), cy = Math.floor(p.y / q), cz = Math.floor(p.z / q);
    const c = new THREE.Vector3(cx * q, cy * q, cz * q);
    const v = noise(c, 0.6, 3);
    const w = noise(c, 0.25, 8);
    if (v > 0.58) return HULL_DARK;
    if (w > 0.66) return STEEL;
    return HULL;
  });
  const CAB = paint((p, n, s) => {
    const base = noise(p, 0.5, 4) > 0.55 ? HULL : mix(HULL, STEEL, 0.15);
    const scratch = Math.sin(p.y * 90 + p.z * 40 + noise(p, 0.05, 2) * 6) > 0.97 && noise(p, 0.3, 6) > 0.5;
    if (scratch) return STEEL;
    if (n.y > 0.5 && Math.abs((p.x * 7) % 1) < 0.05) return CYAN;
    if (p.y > 2.05 && p.y < 2.1) return CYAN;
    return panelled(base, { size: 0.5, aspect: 0.6, rivets: 0.1 });
  });
  const TREAD = paint((p, n) => {
    const ang = Math.atan2(p.y - 0.62, p.z - 0);
    const dirty = Math.max(0, 1 - (p.y - 0.0) / 0.7);
    const lug = Math.abs(n.x) < 0.5 && Math.floor((ang + Math.PI) / (Math.PI / 9)) % 2 === 0;
    let c: string | readonly [number, number, number] = lug ? "#0e0e11" : TIRE;
    return mix(typeof c === "string" ? c : TIRE, DIRT, Math.min(0.75, dirty * 0.5 + noise(p, 0.15, 5) * 0.25));
  });
  const box = (w: number, h: number, d: number, c: string, at: number[], name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), name === "cargoSide" ? CAMO : name === "cabBody" ? CAB : c, { at, name });

  // chassis
  box(2.0, 0.35, 7.2, DARK, [0, 0.85, 0], "chassis");
  box(0.3, 0.3, 7.0, STEEL, [0.7, 0.7, 0], "chassis");
  box(0.3, 0.3, 7.0, STEEL, [-0.7, 0.7, 0], "chassis");
  // axles
  for (const z of [2.2, -0.6, -2.4]) box(2.6, 0.18, 0.2, DARK, [0, 0.62, z], "axle");
  // wheels
  for (const z of [2.2, -0.6, -2.4])
    for (const s of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 10), TREAD, { at: [s * 1.3, 0.62, z], dir: [1, 0, 0], name: "tire" });
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

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addRoofLightBar(b: Builder) {
  const Y = 2.87; // cab roof top (2.82 + 0.05)
  const Z = 1.9;
  const BRACKET = "#2a2f38";
  const add = (g: THREE.BufferGeometry, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(g, c, { at, name, rotation: rot });

  // main housing: slim dark bar
  add(new THREE.BoxGeometry(1.8, 0.14, 0.26), DARK, [0, Y + 0.17, Z], "lightBarHousing");
  // top armoured hood
  add(new THREE.BoxGeometry(1.84, 0.04, 0.3), BRACKET, [0, Y + 0.26, Z - 0.01], "lightBarHood");
  // front visor lip
  add(new THREE.BoxGeometry(1.84, 0.03, 0.06), STEEL, [0, Y + 0.21, Z + 0.15], "lightBarLip");
  // end caps
  for (const s of [1, -1]) {
    add(new THREE.BoxGeometry(0.06, 0.2, 0.32), STEEL, [s * 0.93, Y + 0.19, Z], "lightBarCap");
    // bolts on caps
    add(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 6), HAZARD, [s * 0.965, Y + 0.19, Z + 0.1], "lightBarBolt", [0, 0, 90]);
    add(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 6), HAZARD, [s * 0.965, Y + 0.19, Z - 0.1], "lightBarBolt", [0, 0, 90]);
  }
  // brackets: legs from roof to housing
  for (const x of [-0.7, -0.25, 0.25, 0.7]) {
    add(new THREE.BoxGeometry(0.08, 0.12, 0.18), BRACKET, [x, Y + 0.06, Z], "lightBarBracket");
    add(new THREE.BoxGeometry(0.14, 0.02, 0.24), STEEL, [x, Y + 0.005, Z], "lightBarFoot");
    for (const dz of [-0.08, 0.08])
      add(new THREE.CylinderGeometry(0.014, 0.014, 0.015, 6), DARK, [x, Y + 0.02, Z + dz], "lightBarFootBolt");
  }
  // six lamps alternating cyan / magenta, with lens frames and glow
  const xs = [-0.72, -0.43, -0.14, 0.14, 0.43, 0.72];
  xs.forEach((x, i) => {
    const c = i % 2 === 0 ? CYAN : MAGENTA;
    add(new THREE.BoxGeometry(0.27, 0.11, 0.03), DARK, [x, Y + 0.17, Z + 0.135], "lampFrame");
    glow(add(new THREE.BoxGeometry(0.23, 0.08, 0.03), c, [x, Y + 0.17, Z + 0.15], "lamp"), 1.8);
    // dividers between lamps
    if (i < 5) add(new THREE.BoxGeometry(0.02, 0.12, 0.05), STEEL, [x + 0.145, Y + 0.17, Z + 0.14], "lampDivider");
  });
  // rear glow strip along the top
  glow(add(new THREE.BoxGeometry(1.5, 0.015, 0.02), CYAN, [0, Y + 0.285, Z + 0.12], "lightBarStrip"), 1.4);
  // small wiring conduit running back from bar to roof
  add(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6), DARK, [0.5, Y + 0.05, Z - 0.3], "lightBarCable", [90, 0, 0]);
  add(new THREE.BoxGeometry(0.1, 0.05, 0.08), BRACKET, [0.5, Y + 0.03, Z - 0.48], "lightBarJunction");
  glow(add(new THREE.BoxGeometry(0.04, 0.02, 0.02), MAGENTA, [0.5, Y + 0.065, Z - 0.48], "lightBarLed"), 1.5);
}
    return addRoofLightBar;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addGrille(b: Builder) {
  const SLAT = "#0b0d12";
  const FRAME = "#2a3138";
  const Z = 3.58;

  // grille frame and backing (nose front face is near z=3.8, below the headlights)
  b.part(new THREE.BoxGeometry(1.5, 0.62, 0.06), SLAT, { at: [0, 1.2, Z + 0.2], name: "grilleBack" });
  for (const y of [0.9, 1.5]) b.part(new THREE.BoxGeometry(1.6, 0.06, 0.1), FRAME, { at: [0, y, Z + 0.24], name: "grilleFrame" });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.06, 0.66, 0.1), FRAME, { at: [s * 0.78, 1.2, Z + 0.24], name: "grilleFrame" });

  // angled slats
  for (let i = 0; i < 7; i++) {
    const y = 0.99 + i * 0.075;
    b.part(new THREE.BoxGeometry(1.4, 0.035, 0.1), i % 2 ? FRAME : STEEL, { at: [0, y, Z + 0.27], rotation: [-25, 0, 0], name: "grilleSlat" });
  }
  // vertical mesh bars
  for (let i = -5; i <= 5; i++) {
    b.part(new THREE.BoxGeometry(0.015, 0.5, 0.02), FRAME, { at: [i * 0.13, 1.2, Z + 0.33], name: "grilleMesh" });
  }
  // glowing cyan strip
  glow(b.part(new THREE.BoxGeometry(1.2, 0.035, 0.03), CYAN, { at: [0, 1.46, Z + 0.3], name: "grilleGlow" }), 1.6);
  glow(b.part(new THREE.BoxGeometry(0.6, 0.02, 0.03), CYAN, { at: [0, 0.94, Z + 0.3], name: "grilleGlow" }), 1.2);
  // tow hooks
  for (const s of [1, -1]) b.part(new THREE.TorusGeometry(0.07, 0.02, 5, 8), HAZARD, { at: [s * 0.55, 0.92, Z + 0.35], name: "towHook" });

  // headlights
  const beam = svg(
    `<svg viewBox="0 0 64 32"><polygon points="2,16 14,3 62,6 62,26 14,29" fill="#e8fbff"/><path d="M8 16 L58 10 M8 16 L58 22" stroke="#9ad8ff" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    const x = s * 0.95;
    b.part(new THREE.BoxGeometry(0.52, 0.26, 0.1), DARK, { at: [x, 1.38, 3.52], name: "lampHousing" });
    b.part(new THREE.PlaneGeometry(0.44, 0.2), "#ffffff", {
      at: [x, 1.38, 3.581],
      dir: [0, 0, 1],
      axis: "z",
      texture: beam,
      name: "lampLens",
    });
    glow(b.part(new THREE.PlaneGeometry(0.44, 0.2), "#ffffff", { at: [x, 1.38, 3.583], dir: [0, 0, 1], axis: "z", texture: beam, name: "lampGlow" }), 1.4);
    // brow plate
    b.part(new THREE.BoxGeometry(0.56, 0.05, 0.14), HULL_DARK, { at: [x, 1.53, 3.55], rotation: [-15, 0, 0], name: "lampBrow" });
    // magenta accent lines
    glow(b.part(new THREE.BoxGeometry(0.5, 0.02, 0.02), MAGENTA, { at: [x, 1.23, 3.575], name: "lampAccent" }), 1.5);
    glow(b.part(new THREE.BoxGeometry(0.02, 0.2, 0.02), MAGENTA, { at: [x - s * 0.27, 1.38, 3.575], name: "lampAccent" }), 1.5);
    // fog lamp
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 8), STEEL, { at: [s * 0.72, 0.98, 3.8], dir: [0, 0, 1], name: "fog" });
    glow(b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.055, 8), "#fff7c0", { at: [s * 0.72, 0.98, 3.8], dir: [0, 0, 1], name: "fogLens" }), 1.2);
  }
}
    return addGrille;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addAntennaArray(b: Builder) {
  const X = -0.8, Y = 2.87, Z = 1.0;
  const part = (g: THREE.BufferGeometry, c: string, at: number[], opts: any = {}) =>
    b.part(g, c, { at, ...opts });

  // mounting base plate with bolts
  part(new THREE.CylinderGeometry(0.24, 0.27, 0.06, 8), DARK, [X, Y - 0.02, Z], { name: "antBase" });
  part(new THREE.CylinderGeometry(0.17, 0.2, 0.05, 8), STEEL, [X, Y + 0.03, Z], { name: "antBase" });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 5), STEEL, [X + Math.cos(a) * 0.21, Y + 0.02, Z + Math.sin(a) * 0.21], { name: "antBolt" });
  }

  // comms mast: tapered tube with collars
  part(new THREE.CylinderGeometry(0.035, 0.055, 0.8, 6), STEEL, [X, Y + 0.45, Z], { name: "mast" });
  for (const h of [0.2, 0.5, 0.8]) {
    part(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 6), DARK, [X, Y + h, Z], { name: "mastCollar" });
  }
  // cross arms
  part(new THREE.BoxGeometry(0.4, 0.03, 0.03), STEEL, [X, Y + 0.7, Z], { name: "mastArm" });
  part(new THREE.BoxGeometry(0.03, 0.03, 0.3), STEEL, [X, Y + 0.6, Z], { name: "mastArm" });
  for (const s of [1, -1]) {
    glow(part(new THREE.SphereGeometry(0.025, 6, 4), MAGENTA, [X + s * 0.2, Y + 0.7, Z], { name: "armLed" }), 1.6);
  }
  // mast top beacon
  part(new THREE.ConeGeometry(0.04, 0.12, 6), STEEL, [X, Y + 0.9, Z], { name: "mastTip" });
  glow(part(new THREE.SphereGeometry(0.04, 6, 4), MAGENTA, [X, Y + 0.98, Z], { name: "mastBeacon" }), 2);

  // whip antennas, leaning outward
  const whips: [number, number, number, number, number][] = [
    [0.14, 0.06, 1.1, 8, 6],
    [-0.14, -0.08, 0.85, -10, 4],
    [0.05, -0.16, 1.0, 3, -9],
  ];
  for (const [dx, dz, len, rx, rz] of whips) {
    const bx = X + dx, bz = Z + dz;
    part(new THREE.CylinderGeometry(0.035, 0.045, 0.1, 6), DARK, [bx, Y + 0.08, bz], { name: "whipMount" });
    part(new THREE.CylinderGeometry(0.006, 0.014, len, 5), DARK, [bx, Y + 0.1 + len / 2, bz], {
      rotation: [rx, 0, rz], name: "whip",
    });
    const tx = bx - Math.sin((rz * Math.PI) / 180) * len;
    const tz = bz + Math.sin((rx * Math.PI) / 180) * len;
    glow(part(new THREE.SphereGeometry(0.022, 6, 4), MAGENTA, [tx, Y + 0.1 + len * 0.99, tz], { name: "whipTip" }), 1.8);
  }

  // small dish on a bracket, facing forward-up
  const dx = X + 0.0, dz = Z + 0.2;
  part(new THREE.BoxGeometry(0.08, 0.2, 0.08), STEEL, [dx + 0.15, Y + 0.14, dz], { name: "dishArm" });
  part(new THREE.SphereGeometry(0.17, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2.2), STEEL, [dx + 0.15, Y + 0.3, dz], {
    rotation: [70, 0, 0], name: "dish",
  });
  part(new THREE.CylinderGeometry(0.01, 0.01, 0.18, 5), DARK, [dx + 0.15, Y + 0.34, dz + 0.1], {
    rotation: [70, 0, 0], name: "dishFeed",
  });
  glow(part(new THREE.SphereGeometry(0.025, 6, 4), CYAN, [dx + 0.15, Y + 0.38, dz + 0.2], { name: "dishLed" }), 1.5);

  // small junction box with status lights
  part(new THREE.BoxGeometry(0.2, 0.08, 0.14), HULL_DARK, [X - 0.1, Y + 0.04, Z - 0.28], { name: "junction" });
  for (let i = 0; i < 3; i++) {
    glow(part(new THREE.BoxGeometry(0.03, 0.02, 0.02), i === 1 ? MAGENTA : CYAN, [X - 0.17 + i * 0.07, Y + 0.09, Z - 0.28], { name: "junctionLed" }), 1.4);
  }
  // hazard stripe on base
  part(new THREE.BoxGeometry(0.3, 0.012, 0.05), HAZARD, [X, Y + 0.006, Z + 0.3], { name: "antHazard" });
}
    return addAntennaArray;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addTurret(b: Builder) {
  const ORANGE = "#ff7a1a";
  const BRASS = "#3a3f4a";
  const box = (w: number, h: number, d: number, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, name, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], name: string, dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at, name, dir });

  // ---- Turret: container top is y = 2.0, so base sits on it
  const cx = 0, cz = -1.2;
  cyl(0.55, 0.62, 0.12, 10, STEEL, [cx, 2.06, cz], "s24turretRing");
  cyl(0.5, 0.5, 0.05, 10, DARK, [cx, 2.14, cz], "s24turretRingDark");
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cyl(0.025, 0.025, 0.05, 5, HAZARD, [cx + Math.cos(a) * 0.57, 2.13, cz + Math.sin(a) * 0.57], "s24bolt");
  }
  cyl(0.32, 0.38, 0.3, 8, HULL_DARK, [cx, 2.3, cz], "s24swivel");
  // gun cradle
  box(0.8, 0.34, 0.5, HULL, [cx, 2.55, cz], "s24cradle");
  box(0.84, 0.06, 0.54, HULL_DARK, [cx, 2.74, cz], "s24cradleTop");
  // twin barrels
  for (const s of [1, -1]) {
    cyl(0.05, 0.05, 1.1, 8, DARK, [cx + s * 0.22, 2.55, cz + 0.8], "s24barrel", [0, 0, 1]);
    cyl(0.075, 0.075, 0.3, 8, STEEL, [cx + s * 0.22, 2.55, cz + 1.3], "s24muzzle", [0, 0, 1]);
    cyl(0.09, 0.09, 0.4, 8, HULL_DARK, [cx + s * 0.22, 2.55, cz + 0.4], "s24jacket", [0, 0, 1]);
  }
  // ammo box
  box(0.4, 0.3, 0.45, HULL, [cx + 0.55, 2.5, cz - 0.1], "s24ammo");
  box(0.42, 0.05, 0.47, HAZARD, [cx + 0.55, 2.67, cz - 0.1], "s24ammoStripe");
  // sensor eye
  box(0.28, 0.2, 0.2, DARK, [cx, 2.88, cz + 0.1], "s24sensorHousing");
  b.part(new THREE.SphereGeometry(0.07, 8, 6), CYAN, { at: [cx, 2.88, cz + 0.22], name: "s24eye" });
  cyl(0.015, 0.015, 0.4, 5, STEEL, [cx - 0.3, 2.95, cz - 0.15], "s24whip");
  b.part(new THREE.SphereGeometry(0.03, 6, 4), MAGENTA, { at: [cx - 0.3, 3.16, cz - 0.15], name: "s24whipTip" });

  // ---- Exhaust stacks (stage 1 stacks at z=0.9; add shields and rings)
  for (const s of [1, -1]) {
    const x = s * 1.25;
    for (const y of [1.5, 1.95, 2.4]) {
      cyl(0.125, 0.125, 0.05, 8, ORANGE, [x, y, 0.9], "s24glowRing");
    }
    cyl(0.13, 0.15, 0.1, 8, BRASS, [x, 1.36, 0.9], "s24stackBase");
    cyl(0.14, 0.11, 0.1, 8, BRASS, [x, 2.68, 0.9], "s24stackCap");
    // heat shield on outer side
    box(0.04, 1.0, 0.26, HULL_DARK, [x + s * 0.16, 2.0, 0.9], "s24heatShield");
    for (const y of [1.65, 2.0, 2.35]) box(0.06, 0.04, 0.3, STEEL, [x + s * 0.16, y, 0.9], "s24shieldBand");
    // brackets to cab
    for (const y of [1.7, 2.3]) box(0.2, 0.05, 0.05, STEEL, [x - s * 0.1, y, 1.05], "s24bracket");
  }
}
    return addTurret;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addCableBundle(b: Builder) {
  const r = rng(77);
  const ORANGE = "#ff8a1c";
  const RUBBER = "#0b0c10";
  const COPPER = "#b8743a";
  const y0 = 0.62;

  const cyl = (rad: number, len: number, c: string, at: number[], dir: number[], seg = 6, name = "cable") =>
    b.part(new THREE.CylinderGeometry(rad, rad, len, seg), c, { at, dir, name });

  // main cable runs under the chassis: three bundles with slight offsets
  const runs = [
    { x: -0.35, y: y0, c: RUBBER, r: 0.06 },
    { x: -0.15, y: y0 - 0.04, c: DARK, r: 0.05 },
    { x: 0.05, y: y0, c: RUBBER, r: 0.065 },
    { x: 0.25, y: y0 - 0.03, c: COPPER, r: 0.035 },
    { x: 0.42, y: y0, c: ORANGE, r: 0.04 },
  ];
  for (const k of runs) cyl(k.r, 5.6, k.c, [k.x, k.y, 0], [0, 0, 1], 6, "cableRun");

  // hydraulic steel lines on the outside
  for (const s of [1, -1]) {
    cyl(0.03, 5.2, STEEL, [s * 0.55, 0.6, 0.2], [0, 0, 1], 6, "hydraulic");
    cyl(0.022, 5.0, HAZARD, [s * 0.62, 0.62, 0.1], [0, 0, 1], 6, "hydraulicStripe");
  }

  // clamps with bolts and neon connectors along the bundle
  const zs = [-2.6, -1.8, -1.0, -0.2, 0.6, 1.4, 2.2, 2.9];
  zs.forEach((z, i) => {
    b.part(new THREE.BoxGeometry(1.0, 0.05, 0.12), STEEL, { at: [0.03, y0 - 0.1, z], name: "clamp" });
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.05, 0.2, 0.12), STEEL, { at: [0.03 + s * 0.5, y0 - 0.02, z], name: "clampArm" });
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6), DARK, { at: [0.03 + s * 0.5, y0 + 0.1, z], name: "bolt" });
    }
    // neon connector blocks
    const col = i % 2 ? CYAN : MAGENTA;
    const x = -0.4 + r() * 0.8;
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.16), DARK, { at: [x, y0 - 0.17, z + 0.25], name: "connector" });
    b.part(new THREE.BoxGeometry(0.06, 0.04, 0.18), col, { at: [x, y0 - 0.23, z + 0.25], name: "connectorGlow" });
  });

  // drooping branch cables to axles
  for (const z of [2.2, -0.6, -2.4]) {
    for (const s of [1, -1]) {
      cyl(0.025, 0.7, RUBBER, [s * 0.3, 0.52, z], [s * 1, -0.2, 0], 6, "branch");
      b.part(new THREE.SphereGeometry(0.05, 6, 4), CYAN, { at: [s * 0.62, 0.48, z], name: "branchTip" });
    }
  }

  // junction boxes with warning light
  for (const z of [-1.4, 1.0]) {
    b.part(new THREE.BoxGeometry(0.5, 0.18, 0.4), HULL_DARK, { at: [0.0, y0 - 0.2, z], name: "junction" });
    b.part(new THREE.BoxGeometry(0.3, 0.03, 0.05), HAZARD, { at: [0.0, y0 - 0.3, z + 0.2], name: "junctionHazard" });
    b.part(new THREE.BoxGeometry(0.08, 0.03, 0.08), MAGENTA, { at: [0.15, y0 - 0.3, z], name: "junctionLed" });
  }
}
    return addCableBundle;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addCargoPlates(b: Builder) {
  const BOLT = "#a9b2bd";
  const box = (w: number, h: number, d: number, c: string, at: number[], name: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, name });

  // ---- cargo plates, ribs, hatch ----
  for (const s of [1, -1]) {
    const x = s * 1.3;
    // vertical ribs
    for (let i = 0; i < 5; i++) {
      const z = -3.1 + i * 0.75;
      box(0.08, 1.0, 0.12, HULL_DARK, [x, 1.8, z], "cargoRib");
    }
    // bolt-on armour plates between ribs
    for (let i = 0; i < 4; i++) {
      const z = -2.72 + i * 0.75;
      box(0.06, 0.6, 0.55, STEEL, [x + s * 0.02, 1.85, z], "cargoPlate");
      // bolts at corners
      for (const dz of [-0.2, 0.2])
        for (const dy of [-0.2, 0.2])
          b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6), BOLT, {
            at: [x + s * 0.06, 1.85 + dy, z + dz],
            dir: [1, 0, 0],
            name: "bolt",
          });
    }
    // top neon strip on the rail
    box(0.04, 0.04, 3.8, CYAN, [s * 1.36, 2.56, -1.4], "railGlow");
  }

  // rear hatch with hazard stripes
  box(2.3, 0.9, 0.08, HULL_DARK, [0, 1.75, -3.52], "hatch");
  for (let i = 0; i < 8; i++) {
    const x = -1.05 + i * 0.3;
    b.part(new THREE.BoxGeometry(0.14, 0.12, 0.04), i % 2 ? DARK : HAZARD, {
      at: [x, 1.32, -3.56],
      name: "hazardTrim",
    });
    b.part(new THREE.BoxGeometry(0.14, 0.12, 0.04), i % 2 ? HAZARD : DARK, {
      at: [x, 2.18, -3.56],
      name: "hazardTrim",
    });
  }
  box(0.1, 0.8, 0.06, STEEL, [-1.1, 1.75, -3.57], "hatchHinge");
  box(0.1, 0.8, 0.06, STEEL, [1.1, 1.75, -3.57], "hatchHinge");
  box(0.5, 0.1, 0.06, STEEL, [0, 1.75, -3.57], "hatchLatch");
  for (const s of [1, -1]) box(0.16, 0.1, 0.05, MAGENTA, [s * 0.9, 1.75, -3.58], "tailLight");

  // ---- wheel detail ----
  for (const z of [2.2, -0.6, -2.4]) {
    for (const s of [1, -1]) {
      const xo = s * 1.58;
      // hub cap
      b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 8), STEEL, {
        at: [xo, 0.62, z],
        dir: [1, 0, 0],
        name: "hubCap",
      });
      // bolt ring
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 6), BOLT, {
          at: [xo + s * 0.02, 0.62 + Math.sin(a) * 0.14, z + Math.cos(a) * 0.14],
          dir: [1, 0, 0],
          name: "wheelBolt",
        });
      }
      // brake disc
      b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 12), DARK, {
        at: [s * 1.1, 0.62, z],
        dir: [1, 0, 0],
        name: "brakeDisc",
      });
      // glowing caliper
      box(0.1, 0.22, 0.2, MAGENTA, [s * 1.1, 0.95, z], "caliper");
      // mud flap
      box(0.05, 0.4, 0.5, TIRE, [s * 1.3, 0.65, z - 0.7], "mudFlap");
      box(0.06, 0.06, 0.5, HAZARD, [s * 1.3, 0.85, z - 0.7], "mudFlapTrim");
    }
  }
}
    return addCargoPlates;
  })(),
);
