import * as THREE from "three";
import { type Builder, createBuilder, rng, paint, noise, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

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
  const camo = paint((p, n) => {
    const q = 0.11;
    const u = Math.floor(p.z / q);
    const v = Math.floor(p.y / q);
    const h = Math.abs(Math.sin(u * 12.9898 + v * 78.233) * 43758.5453) % 1;
    const big = noise(new THREE.Vector3(Math.floor(p.z / q) * q, Math.floor(p.y / q) * q, 0), 0.5, 4);
    let c: string = big > 0.6 ? "#3b4a3d" : big > 0.45 ? HULL : h > 0.5 ? HULL_DARK : "#566a58";
    // faded unit number near the rear (z < -1.4), blocky digits
    const digit = Math.abs(n.x) > 0.5 && p.z < -1.2 && p.z > -2.1 && p.y > 0.72 && p.y < 0.98;
    if (digit) {
      const cu = Math.floor((p.z + 2.1) / 0.06);
      const cv = Math.floor((p.y - 0.72) / 0.052);
      const rows = ["111101101101111", "010110010010111", "111001111100111"];
      const d = Math.floor(cu / 4);
      const lx = cu % 4;
      if (d < 3 && lx < 3 && cv < 5 && rows[d][cv * 3 + lx] === "1") c = h > 0.4 ? "#b9c2b4" : "#8b968a";
    }
    return c;
  });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.12, 0.5, 4.8), camo, { at: [s * 0.98, 0.85, 0], name: "hullSide" });
  // hood
  box(1.9, 0.45, 1.5, HULL, [0, 0.95, 1.75], "hood");
  b.part(new THREE.BoxGeometry(1.9, 0.12, 1.2), HULL_DARK, { at: [0, 1.2, 1.8], rotation: [-8, 0, 0], name: "hoodTop" });
  // cab
  box(1.9, 0.75, 1.5, HULL, [0, 1.2, 0.35], "cab");
  box(1.7, 0.1, 1.2, HULL_DARK, [0, 1.62, 0.2], "roof");
  // windshield (sloped)
  const glassTex = svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="64" fill="#0c2a33"/>
      <path d="M0 64 L128 0 L128 22 L40 64Z" fill="#19f0ff" opacity="0.13"/>
      <path d="M60 64 L128 20 L128 30 L80 64Z" fill="#19f0ff" opacity="0.1"/>
      ${Array.from({ length: 16 }, (_, i) => `<rect x="0" y="${i * 4 + 1}" width="128" height="1" fill="#000" opacity="0.22"/>`).join("")}
      <path d="M8 18 V8 H20 M120 18 V8 H108 M8 46 V56 H20 M120 46 V56 H108" stroke="#19f0ff" stroke-width="2" fill="none"/>
      <circle cx="64" cy="32" r="9" stroke="#19f0ff" stroke-width="1.5" fill="none"/>
      <path d="M64 20 V26 M64 38 V44 M52 32 H58 M70 32 H76" stroke="#19f0ff" stroke-width="1.5"/>
      <rect x="14" y="48" width="26" height="3" fill="#ff2bd6" opacity="0.8"/>
      <rect x="14" y="53" width="16" height="2" fill="#19f0ff" opacity="0.8"/>
      <text x="92" y="52" font-size="7" font-family="monospace" fill="#19f0ff">HVR 042</text>
    </svg>`,
    { size: 384 },
  );
  b.part(new THREE.BoxGeometry(1.7, 0.55, 0.08), "#ffffff", { at: [0, 1.38, 1.08], rotation: [-28, 0, 0], name: "windshield", texture: glassTex });
  box(1.7, 0.4, 0.08, GLASS, [0, 1.38, -0.4], "rearGlass", [18, 0, 0]);
  for (const s of [1, -1]) {
    box(0.06, 0.4, 0.9, GLASS, [s * 0.96, 1.4, 0.4], "sideGlass");
    box(0.14, 0.55, 0.14, HULL_DARK, [s * 0.9, 1.38, 1.0], "pillar", [-28, 0, 0]);
  }
  // bed
  const plate = paint((p, n) => {
    let c: string = GUNMETAL;
    if (n.y > 0.5) {
      const a = (p.x * 0.7 + p.z * 0.7) / 0.09;
      const bb = (p.x * 0.7 - p.z * 0.7) / 0.09;
      const fa = a - Math.floor(a);
      const fb = bb - Math.floor(bb);
      if ((Math.abs(fa - 0.5) < 0.12 && fb < 0.55) || (Math.abs(fb - 0.5) < 0.12 && fa >= 0.55)) c = "#4a4f5c";
      const m = noise(p, 0.12, 8);
      if (m > 0.68) c = "#34363f";
      const oil = noise(p, 0.45, 2);
      if (oil > 0.66) c = "#0d0e12";
      const edge = Math.min(Math.abs(p.x) > 0.7 ? 1 - (0.95 - Math.abs(p.x)) / 0.25 : 0, 1);
      if (edge > 0.3) c = p.x > 0 ? "#1a8c99" : "#992a85";
      if (p.z < -2.35 && noise(p, 0.1, 5) > 0.45) c = "#7a1f6c";
    }
    return c;
  });
  b.part(new THREE.BoxGeometry(1.9, 0.12, 2.0), plate, { at: [0, 0.8, -1.5], name: "bedFloor" });
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

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addRoofLightBar(b: Builder) {
  const Y = 1.67; // roof top surface
  const Z = 0.2;
  const part = (g: THREE.BufferGeometry, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(g, c, { at: at as any, rotation: rot as any, name });

  // main slim housing
  part(new THREE.BoxGeometry(1.5, 0.1, 0.3), DARK, [0, Y + 0.09, Z], "lightBarHousing");
  // top cap, slightly narrower and angled front lip
  part(new THREE.BoxGeometry(1.46, 0.03, 0.26), GUNMETAL, [0, Y + 0.155, Z], "lightBarCap");
  part(new THREE.BoxGeometry(1.5, 0.04, 0.05), GUNMETAL, [0, Y + 0.12, Z + 0.17], "lightBarVisor", [-25, 0, 0]);
  // end caps
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(0.06, 0.13, 0.34), HULL_DARK, [s * 0.75, Y + 0.095, Z], "lightBarEnd");
    // brackets
    for (const dx of [0.55, 0.0]) {
      const x = s * dx;
      if (dx === 0 && s < 0) continue;
      part(new THREE.BoxGeometry(0.12, 0.05, 0.22), GUNMETAL, [x, Y + 0.02, Z], "lightBarBracket");
      part(new THREE.BoxGeometry(0.04, 0.06, 0.04), STEEL, [x - 0.04, Y + 0.045, Z + 0.09], "bolt");
      part(new THREE.BoxGeometry(0.04, 0.06, 0.04), STEEL, [x + 0.04, Y + 0.045, Z - 0.09], "bolt");
    }
  }
  // six lamps alternating cyan / magenta, each with dark bezel and a lens
  for (let i = 0; i < 6; i++) {
    const x = -0.55 + i * 0.22;
    const c = i % 2 ? MAGENTA : CYAN;
    part(new THREE.BoxGeometry(0.2, 0.09, 0.04), DARK, [x, Y + 0.09, Z + 0.155], "lampBezel");
    glow(part(new THREE.BoxGeometry(0.16, 0.06, 0.03), c, [x, Y + 0.09, Z + 0.175], "lamp"), 1.6);
    // glow strip on top
    glow(part(new THREE.BoxGeometry(0.12, 0.012, 0.1), c, [x, Y + 0.175, Z], "lampTop"), 1.2);
    // divider fin
    if (i < 5) part(new THREE.BoxGeometry(0.02, 0.1, 0.32), GUNMETAL, [x + 0.11, Y + 0.09, Z], "lampFin");
  }
  // rear status strip
  glow(part(new THREE.BoxGeometry(1.2, 0.015, 0.02), AMBER, [0, Y + 0.09, Z - 0.155], "lightBarRear"), 1);
  // cable run to the roof
  part(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 5), DARK, [-0.35, Y + 0.02, Z - 0.28], "cable", [90, 0, 0]);
}
    return addRoofLightBar;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addGrille(b: Builder) {
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[], name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as any, rotation: rot as any, name });

  // ---------- grille ----------
  const FRONT = 2.56;
  // frame
  box(1.3, 0.05, 0.08, GUNMETAL, [0, 1.02, FRONT], undefined, "grilleFrameTop");
  box(1.3, 0.05, 0.08, GUNMETAL, [0, 0.68, FRONT], undefined, "grilleFrameBot");
  for (const s of [1, -1]) box(0.05, 0.37, 0.08, GUNMETAL, [s * 0.65, 0.85, FRONT], undefined, "grilleFrameSide");
  // dark backing
  box(1.2, 0.3, 0.04, DARK, [0, 0.85, FRONT - 0.01], undefined, "grilleBack");
  // slats (angled)
  for (let i = 0; i < 5; i++) {
    box(1.16, 0.025, 0.07, i % 2 ? GUNMETAL : STEEL, [0, 0.72 + i * 0.065, FRONT + 0.03], [-25, 0, 0], "slat");
  }
  // vertical mesh ribs
  for (let i = -4; i <= 4; i++) box(0.015, 0.3, 0.03, DARK, [i * 0.13, 0.85, FRONT + 0.05], undefined, "rib");
  // glowing strip
  box(1.1, 0.025, 0.03, CYAN, [0, 0.79, FRONT + 0.075], undefined, "grilleStrip");
  // emblem texture
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#14151b" stroke="#19f0ff" stroke-width="5"/><path d="M32 12 L50 46 L32 38 L14 46Z" fill="#ff2bd6"/><path d="M32 22 L40 38 L32 34 L24 38Z" fill="#14151b"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", { at: [0, 0.89, FRONT + 0.095], dir: [0, 0, 1], axis: "z", texture: emblem, name: "emblem" });
  // tow hooks under grille
  for (const s of [1, -1]) box(0.06, 0.06, 0.12, STEEL, [s * 0.45, 0.62, FRONT + 0.1], undefined, "towHook");

  // ---------- headlights ----------
  const HZ = 2.53;
  const bar = new THREE.TetrahedronGeometry(0.1);
  void bar;
  for (const s of [1, -1]) {
    const x = s * 0.7;
    // bezel
    box(0.4, 0.2, 0.05, DARK, [x, 0.95, HZ], undefined, "bezel");
    // angular lens: slanted slab
    b.part(
      new THREE.CylinderGeometry(0.1, 0.1, 0.05, 4),
      AMBER,
      { at: [x, 0.95, HZ + 0.04], rotation: [90, 45, 0] as any, scale: [1.6, 1, 0.8] as any, name: "lens" },
    );
    // inner glow core
    box(0.26, 0.04, 0.03, "#fff0b8", [x, 0.95, HZ + 0.075], undefined, "lensCore");
    // brow
    box(0.42, 0.04, 0.09, HULL_DARK, [x, 1.07, HZ + 0.02], [-10, 0, 0], "headBrow");
    // outer cyan accent
    box(0.04, 0.16, 0.04, CYAN, [x + s * 0.22, 0.95, HZ + 0.02], undefined, "headAccent");
    // lower fog lamp
    box(0.12, 0.07, 0.05, AMBER, [x, 0.8, HZ + 0.03], undefined, "fogLamp");
    // bolts
    for (const dx of [-0.17, 0.17]) box(0.02, 0.02, 0.02, STEEL, [x + dx, 1.02, HZ + 0.03], undefined, "bolt");
  }
}
    return addGrille;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addBedTurret(b: Builder) {
  const R = rng(11);
  const BRASS = "#a8863a";
  const OLIVE = "#3a4538";
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], rot: number[] = [0, 0, 0], name?: string) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: at as any, rotation: rot as any, name });
  const box = (w: number, h: number, d: number, c: string, at: number[], rot: number[] = [0, 0, 0], name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as any, rotation: rot as any, name });

  const cx = 0, cz = -1.3, fy = 0.86; // bed floor top

  // base plate with bolts
  cyl(0.38, 0.42, 0.06, 8, GUNMETAL, [cx, fy + 0.03, cz], [0, 0, 0], "s23base");
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    cyl(0.03, 0.03, 0.04, 6, STEEL, [cx + Math.cos(a) * 0.34, fy + 0.08, cz + Math.sin(a) * 0.34]);
  }
  // hazard ring on the plate
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    box(0.07, 0.012, 0.05, i % 2 ? AMBER : DARK, [cx + Math.cos(a) * 0.28, fy + 0.066, cz + Math.sin(a) * 0.28], [0, -a * 180 / Math.PI, 0]);
  }
  // pedestal post
  cyl(0.07, 0.1, 0.5, 8, HULL_DARK, [cx, fy + 0.31, cz], [0, 0, 0], "s23post");
  cyl(0.12, 0.12, 0.05, 8, STEEL, [cx, fy + 0.18, cz]);
  // ring mount (torus facing up)
  b.part(new THREE.TorusGeometry(0.3, 0.035, 5, 12), GUNMETAL, { at: [cx, fy + 0.6, cz], rotation: [90, 0, 0], name: "s23ring" });
  for (const s of [1, -1]) {
    box(0.06, 0.12, 0.06, STEEL, [cx + s * 0.3, fy + 0.6, cz]);
    box(0.04, 0.3, 0.04, DARK, [cx + s * 0.18, fy + 0.45, cz], [0, 0, -s * 30]);
  }
  // cradle yoke
  for (const s of [1, -1]) {
    box(0.06, 0.28, 0.2, HULL_DARK, [cx + s * 0.13, fy + 0.74, cz + 0.02], [0, 0, 0], "s23yoke");
    cyl(0.04, 0.04, 0.05, 6, STEEL, [cx + s * 0.17, fy + 0.8, cz + 0.02], [0, 0, 90]);
  }
  // gun body
  box(0.18, 0.2, 0.5, GUNMETAL, [cx, fy + 0.8, cz + 0.12], [-4, 0, 0], "s23receiver");
  box(0.2, 0.06, 0.34, HULL_DARK, [cx, fy + 0.93, cz + 0.1]);
  box(0.1, 0.05, 0.12, STEEL, [cx + 0.1, fy + 0.8, cz + 0.05]); // charging handle
  // barrel shroud
  cyl(0.065, 0.065, 0.6, 8, DARK, [cx, fy + 0.8, cz + 0.65], [90, 0, 0], "s23shroud");
  for (let i = 0; i < 5; i++) {
    const z = cz + 0.45 + i * 0.1;
    box(0.15, 0.015, 0.03, STEEL, [cx, fy + 0.8, z]);
    box(0.015, 0.15, 0.03, STEEL, [cx, fy + 0.8, z]);
  }
  // barrel + muzzle
  cyl(0.028, 0.028, 0.35, 6, STEEL, [cx, fy + 0.8, cz + 1.12], [90, 0, 0], "s23barrel");
  cyl(0.05, 0.04, 0.09, 6, DARK, [cx, fy + 0.8, cz + 1.32], [90, 0, 0], "s23muzzle");
  glow(cyl(0.025, 0.025, 0.02, 6, AMBER, [cx, fy + 0.8, cz + 1.375], [90, 0, 0]), 1.2);
  // rear grips
  box(0.04, 0.04, 0.22, DARK, [cx, fy + 0.8, cz - 0.28], [0, 0, 0], "s23stock");
  for (const s of [1, -1]) {
    box(0.03, 0.03, 0.14, STEEL, [cx + s * 0.07, fy + 0.84, cz - 0.38], [0, s * 10, 0]);
  }
  // sight with magenta lens
  box(0.06, 0.1, 0.1, GUNMETAL, [cx + 0.1, fy + 0.98, cz + 0.12], [0, 0, 0], "s23sight");
  cyl(0.032, 0.032, 0.1, 8, DARK, [cx + 0.1, fy + 1.05, cz + 0.12], [90, 0, 0]);
  glow(cyl(0.028, 0.028, 0.012, 8, MAGENTA, [cx + 0.1, fy + 1.05, cz + 0.18], [90, 0, 0]), 1.6);
  glow(box(0.03, 0.012, 0.2, MAGENTA, [cx + 0.1, fy + 0.945, cz + 0.12]), 1.2);
  // ammo box on the side with feed belt
  box(0.2, 0.2, 0.3, OLIVE, [cx - 0.3, fy + 0.7, cz + 0.05], [0, 0, 0], "s23ammo");
  box(0.21, 0.03, 0.31, HULL_DARK, [cx - 0.3, fy + 0.81, cz + 0.05]);
  box(0.06, 0.05, 0.05, AMBER, [cx - 0.3, fy + 0.7, cz + 0.21]);
  cyl(0.03, 0.03, 0.06, 6, STEEL, [cx - 0.3, fy + 0.84, cz + 0.05], [0, 0, 90]);
  // belt links
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    box(0.045, 0.035, 0.05, BRASS, [cx - 0.3 + t * 0.2, fy + 0.72 + Math.sin(t * 3) * 0.06 + t * 0.04, cz + 0.05 - t * 0.0 - 0.0 + 0.0 + 0.0 - 0.14 * t], [0, 0, t * 20]);
  }
  // spent shells on the floor
  for (let i = 0; i < 7; i++) {
    cyl(0.012, 0.012, 0.045, 5, BRASS, [cx + 0.35 + R() * 0.4, fy + 0.02, cz - 0.4 + R() * 0.8], [90, R() * 360, 0]);
  }
  // small status light on post
  glow(box(0.04, 0.04, 0.04, CYAN, [cx, fy + 0.5, cz + 0.11]), 1.5);
}
    return addBedTurret;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addThrusterDetail(b: Builder) {
  const BLADE = "#0fb8c8";
  const WHIP = "#9aa0b0";
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as any, rotation: rot as any });

  // Thrusters: nacelles are cylinders along z, centred x=±1.25, y=0.4, z=±1.5, length 0.9, radius ~0.4
  for (const sx of [1, -1]) {
    for (const z of [1.5, -1.5]) {
      const cx = sx * 1.25;
      const cy = 0.4;
      // turbine hub
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 8), DARK, { at: [cx, cy, z - 0.38], rotation: [90, 0, 0] });
      // fan blades (glowing)
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const blade = b.part(new THREE.BoxGeometry(0.2, 0.012, 0.07), CYAN, {
          at: [cx + Math.cos(a) * 0.15, cy + Math.sin(a) * 0.15, z - 0.4],
          rotation: [0, 0, (a * 180) / Math.PI],
        });
        glow(blade, 1.6);
      }
      // intake vanes at front
      for (let i = 0; i < 5; i++) {
        const y = cy - 0.24 + i * 0.12;
        box(0.62, 0.025, 0.04, STEEL, [cx, y, z + 0.5]);
      }
      box(0.025, 0.6, 0.04, STEEL, [cx, cy, z + 0.5]);
      // intake ring
      b.part(new THREE.TorusGeometry(0.4, 0.025, 4, 12), STEEL, { at: [cx, cy, z + 0.5] });
      // exhaust rim glow
      glow(b.part(new THREE.TorusGeometry(0.33, 0.03, 4, 12), CYAN, { at: [cx, cy, z - 0.5] }), 1.8);
      // side cooling ribs
      for (let k = 0; k < 3; k++)
        b.part(new THREE.TorusGeometry(0.405, 0.015, 4, 12), DARK, { at: [cx, cy, z - 0.2 + k * 0.2] });
    }
  }

  // Antenna cluster behind cab, around (-0.6, 1.75, -0.5)
  const bx = -0.6;
  const by = 1.67;
  const bz = -0.5;
  b.part(new THREE.CylinderGeometry(0.16, 0.19, 0.06, 8), GUNMETAL, { at: [bx, by, bz] });
  // whip antennas
  const whips: [number, number, number, number][] = [
    [-0.12, -0.1, 0.8, 6],
    [0.1, 0.08, 0.6, -5],
    [0.0, 0.14, 0.45, 8],
  ];
  whips.forEach(([dx, dz, h, tilt], i) => {
    const x = bx + dx;
    const z = bz + dz;
    b.part(new THREE.CylinderGeometry(0.008, 0.016, h, 5), WHIP, {
      at: [x, by + 0.03 + h / 2, z],
      rotation: [tilt, 0, -tilt],
    });
    b.part(new THREE.CylinderGeometry(0.03, 0.035, 0.05, 6), DARK, { at: [x, by + 0.06, z] });
    const tx = x - Math.sin((tilt * Math.PI) / 180) * 0;
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), MAGENTA, {
      at: [tx + Math.sin((-tilt * Math.PI) / 180) * h * 0.5, by + 0.03 + h, z + Math.sin((tilt * Math.PI) / 180) * h * 0.5],
    }), 2);
  });
  // small dish on a mast
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 5), WHIP, { at: [bx + 0.1, by + 0.18, bz - 0.1] });
  const dish = b.part(new THREE.CylinderGeometry(0.16, 0.04, 0.07, 10, 1, true), STEEL, {
    at: [bx + 0.1, by + 0.36, bz - 0.12],
    rotation: [-60, 0, 0],
  });
  void dish;
  b.part(new THREE.CylinderGeometry(0.16, 0.03, 0.02, 10), GUNMETAL, { at: [bx + 0.1, by + 0.355, bz - 0.12], rotation: [-60, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 4), WHIP, { at: [bx + 0.1, by + 0.43, bz - 0.02], rotation: [-60, 0, 0] });
  glow(b.part(new THREE.SphereGeometry(0.022, 6, 4), MAGENTA, { at: [bx + 0.1, by + 0.5, bz + 0.04] }), 2);
}
    return addThrusterDetail;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addArmorPlates(b: Builder) {
  const R = rng(11);
  const HAZ = "#ffcf1f";
  const BOLT = "#9aa0ae";
  const RUST = "#5a3a22";

  const hazard = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="16" fill="#ffcf1f"/>
      <path d="M-8 16 L8 0 L16 0 L0 16Z M8 16 L24 0 L32 0 L16 16Z M24 16 L40 0 L48 0 L32 16Z M40 16 L56 0 L64 0 L48 16Z M56 16 L72 0 L80 0 L64 16Z" fill="#14151b"/>
    </svg>`,
    { size: 128 },
  );

  const part = (g: THREE.BufferGeometry, c: string, at: number[], extra: any = {}) =>
    b.part(g, c, { at: at as any, ...extra });

  for (const s of [1, -1]) {
    const xo = s * 1.07; // outside the bed wall (wall outer face is about 0.96)
    // main armour plates, three per side
    for (let i = 0; i < 3; i++) {
      const z = -2.1 + i * 0.8;
      part(new THREE.BoxGeometry(0.06, 0.4, 0.66), i % 2 ? "#3a463b" : "#4a5a4a", [xo, 1.02, z], { name: "armorPlate" });
      // angled top lip
      part(new THREE.BoxGeometry(0.08, 0.06, 0.7), GUNMETAL, [xo + s * 0.01, 1.25, z], { rotation: [0, 0, s * 12] });
      // hazard stripe on the plate's lower edge
      part(new THREE.PlaneGeometry(0.62, 0.1), "#ffffff", {
        at: [xo + s * 0.032, 0.87, z],
        dir: [s, 0, 0],
        axis: "z",
        texture: hazard,
      } as any);
      // bolts at four corners
      for (const dz of [-0.26, 0.26])
        for (const dy of [-0.12, 0.12])
          part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6), BOLT, [xo + s * 0.04, 1.02 + dy, z + dz], {
            rotation: [0, 0, 90],
          });
    }
    // vertical ribs between plates
    for (let i = 0; i < 4; i++) {
      const z = -2.5 + i * 0.8 + 0.4 - 0.4;
      part(new THREE.BoxGeometry(0.09, 0.5, 0.07), GUNMETAL, [xo + s * 0.01, 1.03, -2.5 + i * 0.8 + 0.0 + 0.02], {
        name: "rib",
      });
      void z;
    }
    // top rail with scuffs
    part(new THREE.BoxGeometry(0.08, 0.05, 2.0), DARK, [s * 0.98, 1.31, -1.5], { name: "rail" });
    // grime patches
    for (let k = 0; k < 3; k++)
      part(new THREE.BoxGeometry(0.01, 0.08, 0.2), RUST, [xo + s * 0.034, 0.95 + R() * 0.2, -2.2 + R() * 1.6]);
    // cyan edge light on top of the rail
    part(new THREE.BoxGeometry(0.03, 0.02, 1.6), CYAN, [s * 1.0, 1.345, -1.5], { name: "railGlow" });
  }
  // hazard-striped tailgate band
  part(new THREE.PlaneGeometry(1.7, 0.1), "#ffffff", {
    at: [0, 0.9, -2.57],
    dir: [0, 0, -1],
    axis: "z",
    texture: hazard,
  } as any);
}
    return addArmorPlates;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addUnderglow(b: Builder) {
  const NEON_DIM = "#8a1273";
  const CABLE = "#0b0c10";
  const WHITE = "#e8fbff";

  const tube = (a: number[], c: number[], r: number, col: string) =>
    b.rod(a as any, c as any, r, col, { sides: 6 } as any);
  const box = (w: number, h: number, d: number, col: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at: at as any, rotation: rot as any });

  // ---------- UNDERGLOW ----------
  // long side tubes under chassis, with bright core and dim housing
  for (const s of [1, -1]) {
    const x = s * 0.72;
    tube([x, 0.33, -2.2], [x, 0.33, 2.2], 0.035, MAGENTA);
    tube([x, 0.31, -2.2], [x, 0.31, 2.2], 0.05, NEON_DIM);
    // mounting brackets
    for (const z of [-2.0, -1.0, 0, 1.0, 2.0]) {
      box(0.08, 0.1, 0.1, DARK, [x, 0.38, z]);
      box(0.1, 0.03, 0.12, STEEL, [x, 0.325, z]);
    }
    // end caps
    for (const z of [-2.24, 2.24]) box(0.1, 0.1, 0.06, DARK, [x, 0.33, z]);
  }
  // cross tubes front and rear
  for (const z of [-2.1, 2.1]) {
    tube([-0.72, 0.33, z], [0.72, 0.33, z], 0.035, MAGENTA);
    tube([-0.72, 0.31, z], [0.72, 0.31, z], 0.05, NEON_DIM);
  }
  // central spine glow strip
  box(0.12, 0.02, 3.4, MAGENTA, [0, 0.33, 0]);

  // cable runs: conduit along the belly with zigzag branches
  tube([-0.3, 0.335, -2.0], [-0.3, 0.335, 2.0], 0.018, CABLE);
  tube([0.3, 0.335, -2.0], [0.3, 0.335, 2.0], 0.018, CABLE);
  const zs = [-1.6, -0.8, 0, 0.8, 1.6];
  zs.forEach((z, i) => {
    const s = i % 2 ? 1 : -1;
    tube([s * 0.3, 0.335, z], [s * 0.72, 0.33, z + 0.15], 0.014, CABLE);
    box(0.09, 0.05, 0.09, GUNMETAL, [s * 0.3, 0.34, z]);
    box(0.04, 0.04, 0.04, CYAN, [s * 0.3, 0.31, z]);
  });
  // power junction box
  box(0.4, 0.08, 0.3, GUNMETAL, [0, 0.335, -0.4]);
  box(0.3, 0.02, 0.05, MAGENTA, [0, 0.29, -0.4]);

  // ---------- MIRRORS ----------
  const eye = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#1a2a30"/>
     <path d="M2 28 L30 4 L62 4 L62 10 L36 28Z" fill="#2c5663" opacity="0.8"/>
     <path d="M8 22 L28 8" stroke="${WHITE}" stroke-width="3" opacity="0.7"/>
     <rect x="0" y="0" width="64" height="32" fill="none" stroke="#000" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    const x = s * 1.0;
    // stalk arm
    b.rod([x, 1.22, 0.92] as any, [x + s * 0.14, 1.32, 0.95] as any, 0.025, DARK, { sides: 6 } as any);
    box(0.1, 0.12, 0.08, GUNMETAL, [x + s * 0.02, 1.22, 0.92]);
    // angular housing: wedge made from two boxes
    box(0.1, 0.22, 0.26, HULL_DARK, [x + s * 0.2, 1.36, 0.95]);
    box(0.08, 0.16, 0.12, HULL, [x + s * 0.2, 1.38, 0.82], [0, s * -20, 0]);
    // top cap
    box(0.12, 0.03, 0.28, DARK, [x + s * 0.2, 1.48, 0.95]);
    // mirror glass facing back
    b.part(new THREE.PlaneGeometry(0.2, 0.17), "#ffffff", {
      at: [x + s * 0.2, 1.36, 0.81] as any,
      dir: [0, 0, -1],
      axis: "z",
      texture: eye,
    } as any);
    // cyan indicator strip on outer face
    box(0.025, 0.04, 0.2, CYAN, [x + s * 0.26, 1.3, 0.95]);
    // tiny indicator lens at the front
    box(0.06, 0.04, 0.02, AMBER, [x + s * 0.2, 1.3, 1.09]);
    // fastening bolts
    for (const dz of [-0.03, 0.03]) b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.03, 6), STEEL, { at: [x + s * 0.04, 1.22, 0.92 + dz] as any, rotation: [0, 0, 90] as any });
  }
}
    return addUnderglow;
  })(),
);
