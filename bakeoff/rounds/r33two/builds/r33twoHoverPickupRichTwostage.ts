import * as THREE from "three";
import { type Builder, createBuilder, paint, noise, mix, rgb, smoothstep, svg, type Rgb, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

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

const CAMO = paint((p, n) => {
  const q = new THREE.Vector3(Math.floor(p.x / 0.09), Math.floor(p.y / 0.09), Math.floor(p.z / 0.09));
  const a = noise(q.multiplyScalar(0.09), 0.35, 3);
  const c = noise(q.multiplyScalar(1), 0.2, 8);
  let col: string | Rgb = a > 0.58 ? HULL_DARK : a < 0.4 ? "#5d7066" : HULL;
  if (c > 0.72) col = "#1f2825";
  const f = 0.85 + 0.15 * Math.max(0, n.y);
  const r = rgb(col);
  return [r[0] * f, r[1] * f, r[2] * f] as Rgb;
});
const SCORCH = paint((p, n, s) => {
  const heat = smoothstep(0.55, 0.15, p.y);
  const soot = noise(p, 0.12, 5);
  const base = mix("#3a3c44", "#16171c", soot);
  const c = mix(base, "#3a7bff", heat * (0.5 + 0.5 * soot));
  return n.y < -0.5 ? mix(c, "#9fd8ff", 0.4) : c;
});
const GLASS_TEX = svg(
  `<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#1b3a4a"/>
  <path d="M0 64 L50 0 L70 0 L20 64Z" fill="#19f0ff" opacity="0.18"/>
  <path d="M60 64 L100 0 L108 0 L68 64Z" fill="#19f0ff" opacity="0.12"/>
  <g stroke="#19f0ff" stroke-width="1.4" fill="none"><circle cx="64" cy="32" r="12"/><path d="M64 14V22M64 42V50M46 32H54M74 32H82"/><path d="M8 8H24V12M120 8H104V12"/></g>
  <g stroke="#bfefff" stroke-width="0.8" opacity="0.6"><path d="M90 50 L112 40"/><path d="M20 20 L34 30"/><path d="M100 14 L106 24"/></g>
  <text x="8" y="58" font-size="7" fill="#19f0ff" font-family="monospace">SYS 07 // LINK OK</text></svg>`,
  { size: 256 },
);
const UNIT_TEX = svg(
  `<svg viewBox="0 0 64 64"><text x="32" y="46" font-size="40" text-anchor="middle" font-family="sans-serif" font-weight="bold" fill="#c8d4cc" opacity="0.55">07</text></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const box = (w: number, h: number, d: number, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as any, name, ...(rot ? { rotation: rot as any } : {}) });

  // chassis
  box(1.9, 0.3, 4.4, METAL, [0, 0.6, 0], "chassis");
  box(2.0, 0.12, 4.0, HULL_DARK, [0, 0.42, 0], "skirt");
  // hood (sloped)
  box(1.8, 0.4, 1.4, CAMO as any, [0, 0.95, 1.65], "hood");
  box(1.8, 0.1, 0.9, CAMO as any, [0, 1.15, 1.7], "hoodTop", [-8, 0, 0]);
  b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { at: [0.4, 1.211, 1.7], dir: [0, 1, 0.14], axis: "z", texture: UNIT_TEX, name: "unitNumber" });
  // cab
  box(1.85, 0.55, 1.6, CAMO as any, [0, 1.0, 0.1], "cab");
  box(1.7, 0.5, 1.3, CAMO as any, [0, 1.5, -0.05], "cabUpper");
  box(1.6, 0.06, 1.2, HULL_DARK, [0, 1.78, -0.05], "roof");
  // glass
  b.part(new THREE.BoxGeometry(1.55, 0.42, 0.06), "#ffffff", { at: [0, 1.5, 0.64], rotation: [-25, 0, 0] as any, name: "glass", texture: GLASS_TEX });
  box(1.74, 0.34, 0.8, GLASS, [0, 1.52, -0.05], "sideGlass");
  box(1.5, 0.36, 0.05, GLASS, [0, 1.5, -0.72], "rearGlass");
  // bed
  box(1.9, 0.12, 1.7, HULL_DARK, [0, 0.8, -1.5], "bed");
  box(0.1, 0.45, 1.7, CAMO as any, [0.9, 1.05, -1.5], "bedWallL");
  box(0.1, 0.45, 1.7, CAMO as any, [-0.9, 1.05, -1.5], "bedWallR");
  box(1.9, 0.45, 0.1, CAMO as any, [0, 1.05, -2.3], "tailgate");
  box(1.9, 0.45, 0.1, CAMO as any, [0, 1.05, -0.7], "bedFront");
  // bumpers
  box(2.0, 0.25, 0.25, METAL, [0, 0.65, 2.45], "bumperF");
  box(2.0, 0.25, 0.2, METAL, [0, 0.65, -2.35], "bumperR");
  // thrusters
  for (const sx of [1, -1])
    for (const sz of [1.4, -1.4]) {
      const n = `thruster${sz > 0 ? "F" : "R"}${sx > 0 ? "L" : "R"}`;
      box(0.35, 0.12, 0.35, METAL, [sx * 1.0, 0.65, sz], n + "Arm");
      b.part(new THREE.CylinderGeometry(0.42, 0.5, 0.35, 8), SCORCH as any, { at: [sx * 1.15, 0.45, sz], name: n });
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

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addRoofLightBar(b: Builder) {
  const Y = 1.81; // roof top surface (roof box centre 1.78, half height 0.03)
  const Z = 0.1;
  const BRACKET = "#1c1e25";
  const HOUSING = "#14161c";

  const box = (w: number, h: number, d: number, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as any, name, ...(rot ? { rotation: rot as any } : {}) });

  // housing: slim main bar with end caps
  box(1.5, 0.1, 0.2, HOUSING, [0, Y + 0.1, Z], "lbHousing");
  box(1.46, 0.025, 0.24, METAL, [0, Y + 0.16, Z], "lbTopPlate");
  for (const s of [1, -1]) {
    box(0.06, 0.13, 0.24, METAL, [s * 0.75, Y + 0.1, Z], "lbEndCap");
    box(0.03, 0.05, 0.1, STEEL, [s * 0.78, Y + 0.1, Z], "lbEndBolt");
  }

  // brackets with feet and bolts
  for (const s of [1, -1]) {
    for (const k of [0.5, 0.0]) {
      const x = s * (k + 0.2);
      box(0.1, 0.06, 0.28, BRACKET, [x, Y + 0.025, Z], "lbFoot");
      box(0.05, 0.1, 0.06, BRACKET, [x, Y + 0.06, Z], "lbPost");
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 6), STEEL, { at: [x, Y + 0.058, Z + 0.1], name: "lbBolt" });
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 6), STEEL, { at: [x, Y + 0.058, Z - 0.1], name: "lbBolt" });
    }
  }

  // lamps: 6 alternating, with dark bezels and glowing lenses facing forward
  const cols = [CYAN, MAGENTA, CYAN, MAGENTA, CYAN, MAGENTA];
  for (let i = 0; i < 6; i++) {
    const x = -0.6 + i * 0.24;
    box(0.2, 0.08, 0.03, BRACKET, [x, Y + 0.1, Z + 0.105], "lbBezel");
    glow(box(0.16, 0.055, 0.03, cols[i], [x, Y + 0.1, Z + 0.115], "lbLamp"), 1.6);
    // rear small indicator
    glow(box(0.05, 0.03, 0.02, cols[i], [x, Y + 0.1, Z - 0.105], "lbRearLamp"), 1.2);
    // top glow fin
    glow(box(0.1, 0.012, 0.1, cols[i], [x, Y + 0.176, Z], "lbTopGlow"), 1.2);
  }

  // dividers between lamps
  for (let i = 0; i < 5; i++) {
    box(0.015, 0.09, 0.04, METAL, [-0.48 + i * 0.24, Y + 0.1, Z + 0.11], "lbDivider");
  }

  // cable running down the roof to the rear
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 5), BRACKET, {
    at: [0.0, Y + 0.012, Z - 0.35],
    rotation: [90, 0, 0] as any,
    name: "lbCable",
  });
}
    return addRoofLightBar;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addGrille(b: Builder) {
  const Z = 2.4;
  const DARK = "#0c0d12";
  const GOLD = "#c9a23a";
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, name: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], name });

  // recessed dark frame
  box(1.3, 0.42, 0.06, METAL, 0, 0.85, Z - 0.02, "grilleFrame");
  // mesh backing with drawn diamond mesh texture
  const mesh = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#07080c"/>
    <path d="M0 0L64 32M0 32L64 0M16 0L64 24M0 8L48 32M32 0L64 16M0 16L32 32M48 0L64 8M0 24L16 32M0 0V32M64 0V32" stroke="#3a4050" stroke-width="1.2"/></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(1.14, 0.34), "#ffffff", {
    at: [0, 0.85, Z + 0.015],
    dir: [0, 0, 1],
    axis: "z",
    texture: mesh,
    name: "grilleMesh",
  });
  // horizontal slats
  for (let i = 0; i < 4; i++) {
    const y = 0.72 + i * 0.075 + (i > 1 ? 0.07 : 0);
    box(1.18, 0.025, 0.05, i % 2 ? HULL_DARK : METAL, 0, y, Z + 0.04, "slat" + i);
  }
  // glowing cyan strip
  glow(box(1.1, 0.025, 0.03, CYAN, 0, 0.86, Z + 0.045, "grilleGlow"), 1.6);
  // vertical posts
  for (const x of [-0.55, -0.28, 0, 0.28, 0.55]) box(0.03, 0.34, 0.04, METAL, x, 0.85, Z + 0.05, "post");
  // frame corner bolts
  for (const sx of [1, -1])
    for (const sy of [1, -1])
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), STEEL, {
        at: [sx * 0.6, 0.85 + sy * 0.18, Z + 0.04],
        dir: [0, 0, 1],
        axis: "y",
        name: "bolt",
      });
  // emblem: hex badge with drawn glyph
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 3L58 18V46L32 61L6 46V18Z" fill="#14161c" stroke="#c9a23a" stroke-width="4"/>
    <path d="M32 14L46 38H18Z" fill="none" stroke="#19f0ff" stroke-width="4"/>
    <circle cx="32" cy="42" r="4" fill="#ff2bd6"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 6), GOLD, {
    at: [0, 0.85, Z + 0.09],
    dir: [0, 0, 1],
    name: "emblemBase",
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.17, 0.17), "#ffffff", {
      at: [0, 0.85, Z + 0.108],
      dir: [0, 0, 1],
      axis: "z",
      texture: emblem,
      name: "emblem",
    }),
    0.8,
  );
  // tow hooks below grille
  for (const sx of [1, -1]) {
    box(0.08, 0.06, 0.12, METAL, sx * 0.5, 0.58, Z + 0.1, "towMount");
    b.part(new THREE.TorusGeometry(0.04, 0.012, 5, 8), STEEL, {
      at: [sx * 0.5, 0.58, Z + 0.17],
      name: "towRing",
    });
  }
}
    return addGrille;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addHeadlamps(b: Builder) {
  const BEZEL = "#101218";
  const AMBER = "#ffb02e";
  const box = (w: number, h: number, d: number, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as any, name, ...(rot ? { rotation: rot as any } : {}) });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: at as any, name, ...(rot ? { rotation: rot as any } : {}) });

  // headlamps
  for (const s of [1, -1]) {
    const x = s * 0.7;
    box(0.42, 0.2, 0.06, BEZEL, [x, 0.9, 2.37], "s23bezel");
    box(0.3, 0.1, 0.05, BEZEL, [x - s * 0.12, 0.98, 2.4], "s23brow", [0, 0, -s * 12]);
    glow(box(0.32, 0.11, 0.04, MAGENTA, [x, 0.89, 2.41], "s23lamp"), 1.6);
    glow(box(0.14, 0.04, 0.04, "#ffd6f6", [x + s * 0.05, 0.9, 2.435], "s23lampCore"), 1.8);
    box(0.36, 0.02, 0.05, AMBER, [x, 0.79, 2.4], "s23drl");
  }

  // bed gun
  const gz = -1.2;
  box(0.8, 0.06, 0.8, METAL, [0, 0.89, gz], "s23gunBase");
  cyl(0.3, 0.34, 0.08, 8, STEEL, [0, 0.95, gz], "s23ring");
  b.part(new THREE.TorusGeometry(0.28, 0.035, 5, 10), HULL_DARK, { at: [0, 1.0, gz] as any, rotation: [90, 0, 0] as any, name: "s23ringRail" });
  cyl(0.07, 0.09, 0.45, 6, METAL, [0, 1.2, gz], "s23post");
  box(0.34, 0.26, 0.5, HULL_DARK, [0, 1.4, gz], "s23receiver");
  box(0.1, 0.1, 0.3, CYAN, [0, 1.4, gz - 0.2], "s23sight");
  glow(b.part(new THREE.BoxGeometry(0.2, 0.02, 0.2), CYAN, { at: [0, 1.545, gz - 0.2] as any, name: "s23sightLED" }), 1.5);
  box(0.06, 0.06, 0.3, METAL, [0, 1.56, gz - 0.05], "s23rail");
  // barrel + shroud
  cyl(0.11, 0.11, 0.55, 8, METAL, [0, 1.4, gz + 0.5], "s23shroud", [90, 0, 0]);
  for (let i = 0; i < 4; i++) cyl(0.125, 0.125, 0.03, 8, STEEL, [0, 1.4, gz + 0.32 + i * 0.12], "s23shroudBand", [90, 0, 0]);
  cyl(0.04, 0.04, 0.45, 6, STEEL, [0, 1.4, gz + 0.95], "s23barrel", [90, 0, 0]);
  cyl(0.075, 0.06, 0.1, 6, RUBBER, [0, 1.4, gz + 1.2], "s23muzzle", [90, 0, 0]);
  // ammo box and belt
  box(0.26, 0.26, 0.34, HULL_DARK, [0.36, 1.1, gz - 0.1], "s23ammo");
  box(0.28, 0.04, 0.36, AMBER, [0.36, 1.24, gz - 0.1], "s23ammoStripe");
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    cyl(0.025, 0.025, 0.08, 5, AMBER, [0.3 - t * 0.18, 1.22 + t * 0.12, gz - 0.02 - t * 0.04], "s23round", [0, 0, 70]);
  }
  // spent-shell tray and handles
  box(0.3, 0.04, 0.24, METAL, [-0.3, 1.05, gz - 0.05], "s23tray");
  for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 5), RUBBER, { at: [s * 0.2, 1.4, gz - 0.35] as any, rotation: [60, 0, 0] as any, name: "s23handle" });
}
    return addHeadlamps;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addThrusterFins(b: Builder) {
  const DARK = "#0c0e12";
  const WARN = "#ffb020";
  const CABLE = "#1a1c22";
  const P = (g: THREE.BufferGeometry, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(g, c, { at: at as any, name, ...(rot ? { rotation: rot as any } : {}) });

  for (const sx of [1, -1]) {
    for (const sz of [1.4, -1.4]) {
      const cx = sx * 1.15;
      const tag = `s24t${sz > 0 ? "F" : "R"}${sx > 0 ? "L" : "R"}`;
      // glowing inner ring on the underside
      P(new THREE.TorusGeometry(0.3, 0.025, 4, 12), CYAN, [cx, 0.235, sz], tag + "ring", [90, 0, 0]);
      P(new THREE.TorusGeometry(0.2, 0.02, 4, 10), CYAN, [cx, 0.235, sz], tag + "ring2", [90, 0, 0]);
      // dark intake core
      P(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 8), DARK, [cx, 0.235, sz], tag + "core");
      // radial vent fins
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const r = 0.24;
        P(
          new THREE.BoxGeometry(0.2, 0.025, 0.04),
          i % 2 ? STEEL : METAL,
          [cx + Math.cos(a) * r * 0.9, 0.225, sz + Math.sin(a) * r * 0.9],
          tag + "fin" + i,
          [0, (-a * 180) / Math.PI, 0],
        );
      }
      // hazard ticks on the outer rim
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        P(
          new THREE.BoxGeometry(0.1, 0.03, 0.05),
          WARN,
          [cx + Math.cos(a) * 0.47, 0.5, sz + Math.sin(a) * 0.47],
          tag + "haz" + i,
          [0, (-a * 180) / Math.PI, 0],
        );
      }
      // cable bundle from thruster up to chassis
      const dir = -sx;
      P(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5), CABLE, [sx * 1.0, 0.62, sz + 0.12], tag + "cableA", [0, 0, 90]);
      P(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 5), CABLE, [sx * 1.0, 0.68, sz - 0.1], tag + "cableB", [0, 0, 90]);
      P(new THREE.BoxGeometry(0.08, 0.12, 0.08), METAL, [sx * 0.8 + dir * 0.0, 0.7, sz], tag + "clamp");
      P(new THREE.SphereGeometry(0.04, 5, 4), MAGENTA, [sx * 0.8, 0.77, sz], tag + "led");
    }
  }
}
    return addThrusterFins;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addAntenna(b: Builder) {
  const BASE: [number, number, number] = [-0.7, 1.81, -0.5];
  const DARK = "#14161c";
  const AMBER = "#ffb02e";
  const part = (g: THREE.BufferGeometry, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(g, c, { at: at as any, name, ...(rot ? { rotation: rot as any } : {}) });

  // mounting plate and bolts
  part(new THREE.BoxGeometry(0.3, 0.04, 0.3), METAL, [BASE[0], BASE[1] + 0.02, BASE[2]], "s25Plate");
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      part(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 6), STEEL, [BASE[0] + sx * 0.12, BASE[1] + 0.055, BASE[2] + sz * 0.12], "s25Bolt");

  // whips: tall and short, with segments, tips and blinking lights
  const whips = [
    { x: -0.1, z: -0.08, h: 0.78, c: MAGENTA },
    { x: 0.1, z: 0.08, h: 0.55, c: MAGENTA },
  ];
  whips.forEach((w, i) => {
    const x = BASE[0] + w.x;
    const z = BASE[2] + w.z;
    const y0 = BASE[1] + 0.04;
    part(new THREE.CylinderGeometry(0.035, 0.045, 0.08, 6), DARK, [x, y0 + 0.04, z], `s25WhipBase${i}`);
    part(new THREE.CylinderGeometry(0.012, 0.02, w.h * 0.5, 6), STEEL, [x, y0 + 0.08 + w.h * 0.25, z], `s25WhipLo${i}`);
    part(new THREE.CylinderGeometry(0.006, 0.012, w.h * 0.5, 6), STEEL, [x, y0 + 0.08 + w.h * 0.75, z], `s25WhipHi${i}`);
    part(new THREE.CylinderGeometry(0.024, 0.024, 0.02, 6), METAL, [x, y0 + 0.08 + w.h * 0.5, z], `s25WhipJoint${i}`);
    const lamp = part(new THREE.SphereGeometry(0.03, 6, 4), w.c, [x, y0 + 0.1 + w.h, z], `s25WhipLamp${i}`);
    const m = lamp.mesh.material as THREE.MeshStandardMaterial;
    m.emissive = new THREE.Color(w.c);
    m.emissiveIntensity = 1.6;
  });

  // dish on a mast, facing back and up
  const dx = BASE[0] - 0.02;
  const dz = BASE[2] + 0.02;
  part(new THREE.CylinderGeometry(0.02, 0.025, 0.3, 6), STEEL, [dx, BASE[1] + 0.19, dz], "s25DishMast");
  part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), METAL, [dx, BASE[1] + 0.34, dz], "s25DishHub", [90, 0, 0]);
  part(
    new THREE.SphereGeometry(0.17, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2.2),
    HULL,
    [dx, BASE[1] + 0.38, dz - 0.02],
    "s25Dish",
    [-110, 0, 0],
  );
  part(new THREE.CylinderGeometry(0.01, 0.01, 0.17, 5), STEEL, [dx, BASE[1] + 0.4, dz - 0.1], "s25Feed", [-110, 0, 0]);
  part(new THREE.SphereGeometry(0.022, 6, 4), STEEL, [dx, BASE[1] + 0.43, dz - 0.19], "s25FeedTip");

  // small amber and magenta status blinkers on the plate
  const blink = [
    { x: 0.1, z: -0.1, c: MAGENTA },
    { x: -0.12, z: 0.1, c: AMBER },
  ];
  blink.forEach((p, i) => {
    const l = part(new THREE.BoxGeometry(0.04, 0.03, 0.04), p.c, [BASE[0] + p.x, BASE[1] + 0.06, BASE[2] + p.z], `s25Blink${i}`);
    const m = l.mesh.material as THREE.MeshStandardMaterial;
    m.emissive = new THREE.Color(p.c);
    m.emissiveIntensity = 1.8;
  });

  // cable run down the cab rear
  part(new THREE.BoxGeometry(0.05, 0.3, 0.03), DARK, [BASE[0] + 0.05, BASE[1] - 0.15, BASE[2] - 0.14], "s25Cable");
  part(new THREE.BoxGeometry(0.1, 0.05, 0.05), METAL, [BASE[0] + 0.05, BASE[1] - 0.05, BASE[2] - 0.14], "s25CableClamp");
}
    return addAntenna;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addSidePlates(b: Builder) {
  const R = rng(26);
  const HAZ = "#e8b21a";
  const BOLT = "#8d94a3";
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e8b21a"/>` +
      Array.from({ length: 9 }, (_, i) => `<path d="M${i * 10 - 8} 16 L${i * 10} 0 L${i * 10 + 5} 0 L${i * 10 - 3} 16Z" fill="#15161b"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const numTex = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#2e3a36"/><rect x="2" y="2" width="60" height="28" fill="none" stroke="#19f0ff" stroke-width="2"/><text x="32" y="23" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#19f0ff">HT-07</text></svg>`,
    { size: 128 },
  );

  // ---- side armour plates
  for (const s of [1, -1]) {
    const x = s * 1.0;
    // main layered plates
    const zs = [-1.0, 0.0, 1.0];
    zs.forEach((z, i) => {
      b.part(new THREE.BoxGeometry(0.1, 0.42, 0.9), i % 2 ? "#3a4842" : "#4a5a52", { at: [x + s * 0.03, 0.72, z], name: "sidePlate" });
      b.part(new THREE.BoxGeometry(0.04, 0.34, 0.8), "#2e3a36", { at: [x + s * 0.1, 0.72, z], name: "sidePlateInner" });
      // bolts
      for (const dz of [-0.36, 0.36])
        for (const dy of [-0.15, 0.15])
          b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), BOLT, {
            at: [x + s * 0.14, 0.72 + dy, z + dz],
            rotation: [0, 0, 90] as any,
            name: "bolt",
          });
    });
    // hazard stripe strips
    for (const z of [-1.0, 0.0, 1.0])
      b.part(new THREE.PlaneGeometry(0.8, 0.1), "#ffffff", {
        at: [x + s * 0.082, 0.56, z],
        dir: [s, 0, 0],
        axis: "z",
        texture: hazard,
        name: "hazard",
      });
    // top rail and bottom rail
    b.part(new THREE.BoxGeometry(0.06, 0.05, 2.9), "#2a2d36", { at: [x + s * 0.08, 0.96, 0], name: "plateRail" });
    b.part(new THREE.BoxGeometry(0.06, 0.05, 2.9), "#2a2d36", { at: [x + s * 0.08, 0.47, 0], name: "plateRail" });
    // unit number plate
    b.part(new THREE.PlaneGeometry(0.4, 0.2), "#ffffff", {
      at: [x + s * 0.092, 0.78, 0],
      dir: [s, 0, 0],
      axis: "z",
      texture: numTex,
      name: "unitTag",
    });
    // scratch vents
    for (let k = 0; k < 4; k++)
      b.part(new THREE.BoxGeometry(0.02, 0.04, 0.2), "#15161b", {
        at: [x + s * 0.092, 0.62 + (R() - 0.5) * 0.04, -1.2 + k * 0.1 - 0.15],
        name: "vent",
      });
  }

  // ---- underglow
  for (const s of [1, -1]) {
    const x = s * 0.92;
    glow(
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 3.2, 6), CYAN, {
        at: [x, 0.33, 0],
        rotation: [90, 0, 0] as any,
        name: "underglowTube",
      }),
      1.6,
    );
    for (const z of [-1.4, -0.7, 0, 0.7, 1.4]) {
      b.part(new THREE.BoxGeometry(0.1, 0.03, 0.08), METAL, { at: [x, 0.37, z], name: "clip" });
      b.part(new THREE.BoxGeometry(0.03, 0.08, 0.08), METAL, { at: [x - s * 0.04, 0.35, z], name: "clipArm" });
    }
  }
  // cross glow tubes front and back
  for (const z of [1.9, -1.9])
    glow(
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 1.7, 6), CYAN, {
        at: [0, 0.33, z],
        rotation: [0, 0, 90] as any,
        name: "underglowCross",
      }),
      1.4,
    );
  // glow panel under chassis
  glow(b.part(new THREE.BoxGeometry(1.4, 0.02, 3.0), "#0b4a55", { at: [0, 0.34, 0], name: "underglowFloor" }), 0.8);
  void HAZ;
}
    return addSidePlates;
  })(),
);
