<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

export const meta = {
  name: "Wraith-7 Armored Hauler 2077",
  description: "Low-poly cyberpunk militarized six-wheel truck with armored cab, rear cargo bay and roof turret.",
};

export const REQUESTS = [
  { id: "roofLightBar", kind: "add", part: "cab", what: "Neon light bar across the cab roof front: slim housing, six lamps alternating CYAN and MAGENTA, brackets.", at: [0, 2.62, 1.9], normal: [0, 1, 0], bone: null, room: [1.8, 0.2, 0.3] },
  { id: "grille", kind: "add", part: "hood", what: "Front armoured grille: horizontal slats in STEEL with glowing CYAN strips behind, and a central emblem.", at: [0, 1.15, 3.42], normal: [0, 0, 1], bone: null, room: [1.8, 0.8, 0.2] },
  { id: "turretGun", kind: "add", part: "turretBase", what: "Roof turret gun: twin barrels with muzzle brakes, ammo box, sensor eye glowing MAGENTA, cable feed.", at: [0, 3.1, 0.3], normal: [0, 1, 0], bone: null, room: [0.9, 0.7, 1.4] },
  { id: "antennaArray", kind: "add", part: "cargo", what: "Antenna array at cargo front-left roof: three whip antennas of different height, a dish, blinking red tip lamps.", at: [1.0, 3.0, -1.0], normal: [0, 1, 0], bone: null, room: [0.6, 1.2, 0.6] },
  { id: "sideVents", kind: "add", part: "cargo", what: "Exhaust vents and heat fins along both cargo sides with orange glow slits.", at: [1.28, 1.9, -3.2], normal: [1, 0, 0], bone: null, room: [0.2, 0.9, 2.5] },
  { id: "headlights", kind: "add", part: "hood", what: "Pair of angular headlamps with CYAN lens, bezel and small DRL strips under them.", at: [0.8, 1.05, 3.4], normal: [0, 0, 1], bone: null, room: [0.7, 0.3, 0.2] },
  { id: "armorSkirts", kind: "add", part: "chassis", what: "Layered armour skirts and side plates over wheel arches with bolts and hazard stripes.", at: [1.3, 0.8, 0.0], normal: [1, 0, 0], bone: null, room: [0.2, 0.6, 6.0] },
  { id: "rearDoors", kind: "add", part: "cargo", what: "Rear cargo double door detail: hinges, locking bars, tail lights in RED, and a hazard-striped bumper.", at: [0, 1.9, -6.0], normal: [0, 0, -1], bone: null, room: [2.4, 1.8, 0.3] },
  { id: "exhaustStacks", kind: "add", part: "cab", what: "Twin vertical exhaust stacks behind cab with heat shields and glowing rings.", at: [1.2, 2.3, -0.55], normal: [0, 1, 0], bone: null, room: [0.5, 1.4, 0.4] },
  { id: "windowHud", kind: "add", part: "cab", what: "Windshield HUD overlay lines and cab side window frames with cyan reflections.", at: [0, 2.1, 2.2], normal: [0, 0, 1], bone: null, room: [1.6, 0.6, 0.2] },
  { id: "hullCamo", kind: "texture", part: "cargo", what: "Dark urban digital camo in HULL and HULL_DARK on cargo sides, faded unit number near rear." },
  { id: "cabPaint", kind: "texture", part: "cab", what: "Panel seams, scratches and a magenta racing stripe along the cab sides." },
  { id: "hoodPaint", kind: "texture", part: "hood", what: "Hazard chevrons and worn edge paint on the hood." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const HULL = "#4a5560";
export const HULL_DARK = "#2c333b";
export const STEEL = "#8b95a1";
export const BLACK = "#14161b";
export const TIRE = "#1b1c20";
export const CYAN = "#19f0ff";
export const MAGENTA = "#ff2bd6";
export const ORANGE = "#ff8a1f";
export const RED = "#ff2a3a";
export const GLASS = "#0b2a3c";
export const HAZARD = "#f2c40f";

export default function build() {
  const b = createBuilder({ name: "truck2077" });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: string, at: number[], name?: string, rot?: number[]) =>
    b.part(g, c, { at, name, rotation: rot, flat: true } as any);

  // chassis
  P(box(2.2, 0.5, 11), HULL_DARK, [0, 0.75, -0.5], "chassis");
  P(box(1.9, 0.3, 10.5), BLACK, [0, 0.5, -0.5], "underbody");

  // wheels: 3 axles
  const wz = [2.4, -1.6, -4.0];
  for (const z of wz)
    for (const s of [1, -1]) {
      const wheel = new THREE.CylinderGeometry(0.62, 0.62, 0.55, 10);
      P(wheel, TIRE, [s * 1.2, 0.62, z], "wheel", [0, 0, 90]);
      P(new THREE.CylinderGeometry(0.34, 0.34, 0.6, 8), STEEL, [s * 1.2, 0.62, z], "hub", [0, 0, 90]);
      P(new THREE.CylinderGeometry(0.12, 0.12, 0.64, 6), CYAN, [s * 1.2, 0.62, z], "hubGlow", [0, 0, 90]);
      P(box(0.12, 0.08, 1.5), HULL, [s * 1.2, 1.28, z], "fender");
    }
  // axles
  for (const z of wz) P(new THREE.CylinderGeometry(0.1, 0.1, 2.4, 6), BLACK, [0, 0.62, z], "axle", [0, 0, 90]);

  // hood
  P(box(2.0, 0.8, 1.6), HULL, [0, 1.3, 2.6], "hood");
  P(box(1.8, 0.2, 1.2), HULL_DARK, [0, 1.8, 2.5], "hoodTop", [-8, 0, 0]);
  P(box(2.1, 0.5, 0.25), STEEL, [0, 0.9, 3.45], "bumper");
  P(box(1.6, 0.5, 0.05), BLACK, [0, 1.2, 3.42], "grillePlate");
  for (const s of [1, -1]) P(box(0.5, 0.18, 0.06), CYAN, [s * 0.8, 1.55, 3.42], "headlampBase");

  // cab
  P(box(2.2, 1.4, 1.8), HULL, [0, 2.0, 1.2], "cab");
  P(box(2.0, 0.5, 1.6), HULL_DARK, [0, 2.9, 1.1], "cabRoof");
  P(box(1.9, 0.7, 0.08), GLASS, [0, 2.2, 2.12], "windshield", [-12, 0, 0]);
  for (const s of [1, -1]) P(box(0.06, 0.6, 1.1), GLASS, [s * 1.12, 2.3, 1.2], "sideWindow");
  for (const s of [1, -1]) P(box(0.2, 0.25, 0.3), STEEL, [s * 1.25, 2.3, 2.0], "mirror");

  // cargo box
  P(box(2.6, 2.2, 6.2), HULL, [0, 2.1, -3.0], "cargo");
  P(box(2.7, 0.2, 6.3), HULL_DARK, [0, 3.25, -3.0], "cargoRoof");
  P(box(2.7, 0.2, 6.3), HULL_DARK, [0, 1.0, -3.0], "cargoBase");
  for (let i = 0; i < 5; i++) for (const s of [1, -1])
    P(box(0.08, 2.0, 0.15), STEEL, [s * 1.33, 2.1, -0.4 - i * 1.3], "rib");
  for (let i = 0; i < 4; i++) P(box(2.5, 0.12, 0.2), HAZARD, [0, 3.38, -1.0 - i * 1.5], "roofStripe");
  P(box(2.4, 1.8, 0.1), HULL_DARK, [0, 2.0, -6.15], "rearDoor");
  P(box(2.7, 0.35, 0.3), HAZARD, [0, 0.95, -6.3], "rearBumper");
  for (const s of [1, -1]) P(box(0.3, 0.2, 0.08), RED, [s * 1.0, 2.9, -6.22], "tailLight");
  // coupling gap between cab and cargo
  P(box(2.0, 0.6, 0.6), BLACK, [0, 1.9, -0.1], "coupling");

  // turret
  P(new THREE.CylinderGeometry(0.55, 0.65, 0.3, 8), HULL_DARK, [0, 3.0, 0.3], "turretBase");
  P(box(0.7, 0.4, 0.8), HULL, [0, 3.3, 0.3], "turretHead");
  P(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 6), STEEL, [0.15, 3.35, 0.95], "barrel", [90, 0, 0]);
  P(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 6), STEEL, [-0.15, 3.35, 0.95], "barrel", [90, 0, 0]);
  P(new THREE.SphereGeometry(0.08, 6, 4), MAGENTA, [0, 3.35, 0.72], "turretEye");

  // exhaust stacks
  for (const s of [1, -1]) P(new THREE.CylinderGeometry(0.12, 0.12, 1.3, 8), STEEL, [s * 1.2, 2.3, -0.55], "stack");

  // side neon strips
  for (const s of [1, -1]) P(box(0.04, 0.06, 5.5), MAGENTA, [s * 1.32, 1.15, -3.0], "sideNeon");
  for (const s of [1, -1]) P(box(0.04, 0.06, 1.2), CYAN, [s * 1.12, 1.45, 1.5], "cabNeon");

  void rng;
  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: texture -->

hullCamo: a custom paint on the cargo box, with blocky digital camo cells in HULL and HULL_DARK plus a darker third tone, vertical edge rivet seams, and a faded stencilled unit number near the rear on the side faces.
cabPaint: a paint on the cab with panel seams, noise scratches, and a magenta racing stripe along the side faces at a fixed height.
hoodPaint: a paint on the hood with hazard chevrons on the top and front faces and worn edge paint near the box edges.

<<<<<<< SEARCH
export default function build() {
=======
const camoPaint = paint((p, n) => {
  const q = 0.22;
  const cx = Math.floor(p.x / q), cy = Math.floor(p.y / q), cz = Math.floor(p.z / q);
  const h = Math.abs(Math.sin(cx * 12.9898 + cy * 78.233 + cz * 37.719) * 43758.5453) % 1;
  const nx = noise(new THREE.Vector3((cx + 0.5) * q, (cy + 0.5) * q, (cz + 0.5) * q), 0.9, 4);
  let c: ColorInput = h * 0.5 + nx * 0.7 > 0.75 ? HULL_DARK : nx > 0.5 ? HULL : "#3a444e";
  if (Math.abs(n.x) > 0.8 && p.z < -4.9 && p.z > -5.9 && p.y > 1.6 && p.y < 2.4) {
    const u = (p.z + 5.9);
    if (Math.abs(u - 0.5) < 0.2 && Math.abs(p.y - 2.0) < 0.2 && Math.sin(p.y * 40) > -0.3) c = mix(c as string, STEEL, 0.45);
  }
  if (Math.abs(n.x) > 0.8 && Math.abs(p.z + 0.4 + Math.round((p.z + 0.4) / 1.3) * 0 ) % 1.3 < 0.02) c = BLACK;
  return c;
});

const cabPaintFn = paint((p, n) => {
  let c: ColorInput = HULL;
  const scratch = noise(new THREE.Vector3(p.x * 6, p.y * 0.4, p.z * 6), 0.15, 8);
  if (scratch > 0.72) c = mix(HULL, STEEL, 0.6);
  if (Math.abs(n.x) > 0.8 && Math.abs(p.y - 1.8) < 0.07) c = MAGENTA;
  if (Math.abs(n.x) > 0.8 && Math.abs(p.y - 1.64) < 0.02) c = CYAN;
  const sz = 0.4;
  if (Math.abs(p.y / sz - Math.round(p.y / sz)) < 0.02 || Math.abs(p.z / sz - Math.round(p.z / sz)) < 0.02) c = mix(c as any, BLACK, 0.6);
  return c;
});

const hoodPaintFn = paint((p, n) => {
  let c: ColorInput = HULL;
  if (n.y > 0.5 || n.z > 0.5) {
    const u = n.y > 0.5 ? p.z : p.x;
    const stripeBand = n.y > 0.5 ? Math.abs(p.x) < 0.9 && p.z > 2.55 : Math.abs(p.y - 1.1) < 0.15;
    if (stripeBand) {
      const k = Math.floor((u * 0.8 + Math.abs(n.y > 0.5 ? p.x : p.y) * 1.2) / 0.16);
      c = k % 2 === 0 ? HAZARD : BLACK;
    }
  }
  const edge = Math.min(0.8 - Math.abs(p.x), 1.0 - Math.abs(p.x), 1.7 - Math.abs(p.y));
  if (noise(p, 0.12, 3) > 0.62 && (Math.abs(Math.abs(p.x) - 1.0) < 0.1 || Math.abs(p.y - 1.7) < 0.1 || edge < 0)) c = STEEL;
  return c;
});

export default function build() {
>>>>>>> REPLACE
<<<<<<< SEARCH
import { createBuilder, rng } from "agentic-3js-builder";
=======
import { createBuilder, rng, paint, noise, mix } from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
>>>>>>> REPLACE
<<<<<<< SEARCH
  P(box(2.0, 0.8, 1.6), HULL, [0, 1.3, 2.6], "hood");
=======
  P(box(2.0, 0.8, 1.6), hoodPaintFn as any, [0, 1.3, 2.6], "hood");
>>>>>>> REPLACE
<<<<<<< SEARCH
  P(box(2.2, 1.4, 1.8), HULL, [0, 2.0, 1.2], "cab");
=======
  P(box(2.2, 1.4, 1.8), cabPaintFn as any, [0, 2.0, 1.2], "cab");
>>>>>>> REPLACE
<<<<<<< SEARCH
  P(box(2.6, 2.2, 6.2), HULL, [0, 2.1, -3.0], "cargo");
=======
  P(box(2.6, 2.2, 6.2), camoPaint as any, [0, 2.1, -3.0], "cargo");
>>>>>>> REPLACE

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addRoofLightBar(b: Builder) {
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(g, c, { at, name, rotation: rot, flat: true } as any);

  const y = 2.62; // cab roof front at ~2.62 from stage 1 (cabRoof top 3.15 is behind; bar sits on windshield header)
  const z = 1.9;

  // main housing
  P(box(1.8, 0.1, 0.22), BLACK, [0, y + 0.1, z], "lbHousing");
  // top cap and bottom lip
  P(box(1.84, 0.03, 0.26), HULL_DARK, [0, y + 0.17, z], "lbCap");
  P(box(1.84, 0.03, 0.26), HULL_DARK, [0, y + 0.03, z], "lbLip");
  // end caps
  for (const s of [1, -1]) {
    P(box(0.05, 0.16, 0.28), STEEL, [s * 0.91, y + 0.1, z], "lbEnd");
    // brackets down to roof
    P(box(0.08, 0.12, 0.08), STEEL, [s * 0.7, y - 0.01, z], "lbBracket");
    P(box(0.08, 0.12, 0.08), STEEL, [s * 0.0 + s * 0.2, y - 0.01, z], "lbBracket");
    // bolts
    P(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), HAZARD, [s * 0.91, y + 0.1, z + 0.15], "lbBolt", [90, 0, 0]);
  }

  // six lamps alternating cyan / magenta
  for (let i = 0; i < 6; i++) {
    const x = -0.725 + i * 0.29;
    const c = i % 2 ? MAGENTA : CYAN;
    glow(P(box(0.24, 0.07, 0.04), c, [x, y + 0.1, z + 0.12], "lbLamp"), 1.6);
    // lens bezel
    P(box(0.27, 0.095, 0.015), BLACK, [x, y + 0.1, z + 0.105], "lbBezel");
    // dividers between lamps
    if (i < 5) P(box(0.02, 0.09, 0.05), STEEL, [x + 0.145, y + 0.1, z + 0.12], "lbDivider");
  }

  // soft glow strip on top rear to suggest light spill
  glow(P(box(1.6, 0.01, 0.04), CYAN, [0, y + 0.19, z - 0.06], "lbTopGlow"), 1.2);

  // small wiring conduit running back on roof
  P(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), BLACK, [0, y + 0.0, z - 0.3], "lbCable", [90, 0, 0]);
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";

export function addGrille(b: Builder) {
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: string, at: number[], name: string, rot?: number[], texture?: THREE.Texture) =>
    b.part(g, c, { at, name, rotation: rot, flat: true, texture } as any);
  const NEON = "#7fffff";
  const DARKSTEEL = "#5a636e";

  // ---------- GRILLE (front face of hood at z ~3.42) ----------
  const gz = 3.46;
  // glowing cyan strips behind slats
  for (const s of [1, -1]) {
    P(box(0.62, 0.5, 0.03), CYAN, [s * 0.5, 1.15, gz - 0.01], "s2GrilleGlow");
  }
  // frame
  P(box(1.8, 0.06, 0.1), STEEL, [0, 1.46, gz + 0.02], "s2GrilleFrameTop");
  P(box(1.8, 0.06, 0.1), STEEL, [0, 0.86, gz + 0.02], "s2GrilleFrameBot");
  for (const s of [1, -1]) P(box(0.06, 0.66, 0.1), STEEL, [s * 0.9, 1.16, gz + 0.02], "s2GrilleFrameSide");
  // horizontal slats, angled
  for (let i = 0; i < 7; i++) {
    const y = 0.93 + i * 0.075;
    for (const s of [1, -1]) {
      P(box(0.74, 0.035, 0.08), i % 2 ? STEEL : DARKSTEEL, [s * 0.5, y, gz + 0.04], "s2Slat", [-20, 0, 0]);
    }
  }
  // central pillar + emblem
  P(box(0.2, 0.6, 0.1), HULL_DARK, [0, 1.16, gz + 0.04], "s2GrillePillar");
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#14161b" stroke="#19f0ff" stroke-width="4"/>
    <path d="M32 8 L52 50 L32 40 L12 50Z" fill="#ff2bd6" stroke="#ffffff" stroke-width="2"/>
    <circle cx="32" cy="32" r="4" fill="#19f0ff"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
    at: [0, 1.16, gz + 0.1],
    dir: [0, 0, 1],
    axis: "z",
    texture: emblem,
    name: "s2Emblem",
  } as any);
  // bumper bolts and tow hooks
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++)
      P(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), BLACK, [s * (0.35 + k * 0.28), 0.9, 3.59], "s2Bolt", [90, 0, 0]);
    P(box(0.14, 0.1, 0.22), HAZARD, [s * 0.75, 0.72, 3.55], "s2TowHook");
  }

  // ---------- TURRET GUN (turret head at 0, 3.3, 0.3) ----------
  const ty = 3.35;
  // mantle / cradle
  P(box(0.8, 0.46, 0.2), HULL_DARK, [0, ty, 0.78], "s2Mantle");
  for (const s of [1, -1]) {
    P(box(0.08, 0.3, 0.5), STEEL, [s * 0.4, 3.45, 0.3], "s2TurretCheek");
    // barrel shrouds
    P(new THREE.CylinderGeometry(0.09, 0.09, 0.4, 8), HULL, [s * 0.15, ty, 0.95], "s2Shroud", [90, 0, 0]);
    // long barrels
    P(new THREE.CylinderGeometry(0.045, 0.045, 0.7, 6), BLACK, [s * 0.15, ty, 1.55], "s2Barrel", [90, 0, 0]);
    // muzzle brakes
    P(new THREE.CylinderGeometry(0.085, 0.085, 0.16, 8), STEEL, [s * 0.15, ty, 1.95], "s2Muzzle", [90, 0, 0]);
    P(box(0.2, 0.025, 0.1), BLACK, [s * 0.15, ty, 1.95], "s2MuzzleSlot");
    // ammo boxes on sides
    P(box(0.22, 0.26, 0.4), HULL, [s * 0.52, 3.3, 0.3], "s2AmmoBox");
    P(box(0.23, 0.05, 0.42), HAZARD, [s * 0.52, 3.45, 0.3], "s2AmmoLid");
    // glowing heat rings
    P(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 8), ORANGE, [s * 0.15, ty, 1.82], "s2HeatRing", [90, 0, 0]);
  }
  // sensor eye
  P(new THREE.CylinderGeometry(0.11, 0.11, 0.1, 8), BLACK, [0, 3.5, 0.62], "s2SensorHousing", [75, 0, 0]);
  P(new THREE.SphereGeometry(0.075, 6, 4), MAGENTA, [0, 3.51, 0.67], "s2SensorEye");
  // top hatch + antenna
  P(box(0.3, 0.06, 0.3), STEEL, [0, 3.53, 0.1], "s2Hatch");
  P(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 4), BLACK, [-0.25, 3.8, 0.05], "s2Whip");
  P(new THREE.SphereGeometry(0.03, 5, 4), RED, [-0.25, 4.05, 0.05], "s2WhipLamp");
  // ring of bolts on base
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    P(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 5), STEEL, [Math.sin(a) * 0.58, 3.16, 0.3 + Math.cos(a) * 0.58], "s2BaseBolt");
  }
  // cable feed from roof to turret
  const cable = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.35, 3.15, -0.2),
    new THREE.Vector3(-0.45, 3.25, 0.0),
    new THREE.Vector3(-0.42, 3.35, 0.25),
    new THREE.Vector3(-0.3, 3.4, 0.35),
  ]);
  b.part(new THREE.TubeGeometry(cable, 10, 0.025, 5, false), BLACK, { at: [0, 0, 0], name: "s2Cable", flat: true } as any);
  for (const z of [-0.1, 0.1])
    P(box(0.12, 0.05, 0.05), NEON, [-0.42, 3.3 + (z + 0.1) * 0.2, z + 0.12], "s2CableClip");
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addAntennaArray(b: Builder) {
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r1: number, r2: number, h: number, s = 6) => new THREE.CylinderGeometry(r1, r2, h, s);
  const P = (g: THREE.BufferGeometry, c: string, at: number[], rot?: number[], name?: string) =>
    b.part(g, c, { at, rotation: rot, name, flat: true } as any);

  // ---------- Antenna array on cargo front-left roof (roof top y ~3.35) ----------
  const bx = 1.0, bz = -1.0, top = 3.35;
  P(box(0.6, 0.08, 0.6), HULL_DARK, [bx, top + 0.04, bz], undefined, "antBase");
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      P(cyl(0.025, 0.025, 0.06, 6), STEEL, [bx + sx * 0.25, top + 0.1, bz + sz * 0.25], undefined, "antBolt");
  P(cyl(0.12, 0.16, 0.14, 8), BLACK, [bx, top + 0.15, bz], undefined, "antMount");

  // three whips of different height
  const whips = [
    { x: bx - 0.15, z: bz - 0.12, h: 1.1 },
    { x: bx + 0.12, z: bz - 0.15, h: 0.8 },
    { x: bx - 0.02, z: bz + 0.18, h: 0.55 },
  ];
  for (const w of whips) {
    P(cyl(0.035, 0.035, 0.12, 6), STEEL, [w.x, top + 0.22, w.z], undefined, "whipSocket");
    P(cyl(0.012, 0.022, w.h, 5), BLACK, [w.x, top + 0.28 + w.h / 2, w.z], undefined, "whip");
    P(cyl(0.02, 0.02, 0.05, 5), STEEL, [w.x, top + 0.28 + w.h * 0.5, w.z], undefined, "whipRing");
    P(new THREE.SphereGeometry(0.035, 6, 4), RED, [w.x, top + 0.3 + w.h, w.z], undefined, "tipLamp");
  }

  // dish on a tilted arm
  P(cyl(0.025, 0.025, 0.45, 6), STEEL, [bx + 0.2, top + 0.35, bz + 0.18], [0, 0, 0], "dishMast");
  P(new THREE.SphereGeometry(0.22, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2.4), STEEL, [bx + 0.2, top + 0.62, bz + 0.18], [-110, 0, 0], "dish");
  P(cyl(0.012, 0.012, 0.22, 5), HULL, [bx + 0.2, top + 0.7, bz + 0.3], [-110, 0, 0], "dishFeed");
  P(new THREE.SphereGeometry(0.03, 6, 4), CYAN, [bx + 0.2, top + 0.75, bz + 0.4], undefined, "dishLamp");

  // ---------- Side vents along both cargo sides ----------
  const z0 = -3.2;
  for (const s of [1, -1]) {
    const x = s * 1.3;
    // vent housing
    P(box(0.12, 0.9, 2.5), HULL_DARK, [s * 1.35, 1.9, z0], undefined, "ventHousing");
    P(box(0.05, 0.08, 2.5), STEEL, [s * 1.42, 2.38, z0], undefined, "ventTopRim");
    P(box(0.05, 0.08, 2.5), STEEL, [s * 1.42, 1.42, z0], undefined, "ventBotRim");
    // heat fins and glow slits
    for (let i = 0; i < 9; i++) {
      const z = z0 - 1.1 + i * 0.275;
      P(box(0.12, 0.7, 0.04), STEEL, [s * 1.45, 1.9, z], undefined, "heatFin");
      for (let j = 0; j < 3; j++)
        P(box(0.03, 0.1, 0.18), ORANGE, [s * 1.4, 1.65 + j * 0.25, z + 0.135], undefined, "glowSlit");
    }
    // end caps
    for (const e of [-1, 1]) {
      P(box(0.14, 0.9, 0.06), BLACK, [s * 1.36, 1.9, z0 + e * 1.28], undefined, "ventCap");
      P(box(0.04, 0.5, 0.04), HAZARD, [s * 1.44, 1.9, z0 + e * 1.28], undefined, "ventHazard");
    }
    // exhaust duct on top
    P(cyl(0.07, 0.07, 0.3, 6), BLACK, [x + s * 0.05, 2.5, z0 + 0.9], undefined, "ventDuct");
    void x;
  }
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addHeadlights(b: Builder) {
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: string, at: number[], rot?: number[]) =>
    b.part(g, c, { at, rotation: rot, flat: true } as any);

  // angular lamp shape: a wedge-like extrude, front face at z ~ 3.43
  const lamp = [
    [-0.3, -0.1],
    [0.3, -0.13],
    [0.3, 0.1],
    [-0.18, 0.13],
    [-0.3, 0.02],
  ] as [number, number][];

  for (const s of [1, -1]) {
    const x = s * 0.8;
    const sh = lamp.map(([u, v]) => [u * s, v] as [number, number]);
    // black bezel (slightly larger)
    b.extrude(
      sh.map(([u, v]) => [u * 1.12, v * 1.2] as [number, number]),
      { at: [x, 1.05, 3.42], x: [1, 0, 0], thickness: 0.06, color: BLACK },
    );
    // cyan lens
    b.extrude(sh.map(([u, v]) => [u * 0.9, v * 0.85] as [number, number]), {
      at: [x, 1.05, 3.46],
      x: [1, 0, 0],
      thickness: 0.04,
      color: CYAN,
    });
    // inner projector reflector and bulb
    P(new THREE.CylinderGeometry(0.07, 0.09, 0.05, 8), STEEL, [x - s * 0.08, 1.06, 3.5], [90, 0, 0]);
    P(new THREE.SphereGeometry(0.04, 6, 4), "#ffffff", [x - s * 0.08, 1.06, 3.53]);
    // brow plate above
    P(box(0.7, 0.05, 0.14), HULL_DARK, [x, 1.2, 3.46], [-10, 0, 0]);
    // bolts on the bezel corners
    for (const u of [-0.3, 0.3])
      P(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 6), STEEL, [x + u, 0.93, 3.46], [90, 0, 0]);
    // DRL strips under the lamp
    for (let i = 0; i < 3; i++)
      P(box(0.5 - i * 0.1, 0.022, 0.03), i === 1 ? MAGENTA : CYAN, [x - s * i * 0.03, 0.88 - i * 0.04, 3.46]);
    // lower vent slats
    P(box(0.6, 0.02, 0.05), BLACK, [x, 0.76, 3.46]);
  }
  // linking strip between lamps across the grille
  P(box(0.9, 0.025, 0.03), CYAN, [0, 1.0, 3.45]);
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addArmorSkirts(b: Builder) {
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(g, c, { at, name, rotation: rot, flat: true } as any);
  const BOLT = "#b7c0cb";

  // ---- armour skirts, both sides: layered plates between the wheels
  for (const s of [1, -1]) {
    const x = s * 1.34;
    // plates between axles (wheels at z 2.4, -1.6, -4.0)
    const spans = [
      { z: 0.4, len: 2.2 },
      { z: -2.8, len: 1.9 },
    ];
    for (const sp of spans) {
      P(box(0.1, 0.5, sp.len), HULL, [x, 0.82, sp.z], "skirtMain");
      P(box(0.08, 0.3, sp.len - 0.2), HULL_DARK, [x + s * 0.07, 0.68, sp.z], "skirtLower");
      P(box(0.06, 0.12, sp.len), STEEL, [x + s * 0.04, 1.1, sp.z], "skirtTopEdge");
      // hazard stripe: alternating blocks along the lower edge
      const n = Math.floor(sp.len / 0.22);
      for (let i = 0; i < n; i++) {
        const z = sp.z - sp.len / 2 + 0.15 + i * 0.22;
        P(box(0.04, 0.09, 0.11), i % 2 ? BLACK : HAZARD, [x + s * 0.12, 0.56, z], "hazard", [s * 0, 0, 0]);
      }
      // bolts
      for (let i = 0; i < 5; i++) {
        const z = sp.z - sp.len / 2 + 0.2 + (i * (sp.len - 0.4)) / 4;
        P(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), BOLT, [x + s * 0.07, 0.95, z], "bolt", [0, 0, 90]);
      }
    }
    // wheel-arch plates: angled layered fenders over each wheel
    for (const z of [2.4, -1.6, -4.0]) {
      P(box(0.14, 0.1, 1.3), HULL_DARK, [s * 1.38, 1.36, z], "archCap");
      P(box(0.1, 0.1, 0.7), HULL, [s * 1.42, 1.44, z], "archCap2");
      P(box(0.1, 0.4, 0.1), HULL_DARK, [s * 1.38, 1.12, z + 0.7], "archStrutF");
      P(box(0.1, 0.4, 0.1), HULL_DARK, [s * 1.38, 1.12, z - 0.7], "archStrutB");
      for (const dz of [-0.45, 0, 0.45])
        P(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), BOLT, [s * 1.46, 1.44, z + dz], "archBolt", [0, 0, 90]);
    }
    // underglow strip
    P(box(0.03, 0.04, 6.4), MAGENTA, [x + s * 0.1, 0.42, -0.8], "skirtGlow");
  }

  // ---- rear doors
  const zr = -6.22;
  for (const s of [1, -1]) {
    // door panels
    P(box(1.15, 1.7, 0.08), HULL, [s * 0.6, 2.0, zr], "doorPanel");
    P(box(0.95, 0.6, 0.04), HULL_DARK, [s * 0.6, 2.45, zr - 0.05], "doorInset");
    P(box(0.95, 0.6, 0.04), HULL_DARK, [s * 0.6, 1.6, zr - 0.05], "doorInset2");
    // hinges on outer edge
    for (const y of [1.4, 2.0, 2.6]) {
      P(new THREE.CylinderGeometry(0.06, 0.06, 0.22, 8), STEEL, [s * 1.2, y, zr - 0.04], "hinge");
      P(box(0.14, 0.16, 0.05), BLACK, [s * 1.12, y, zr - 0.02], "hingePlate");
    }
    // vertical locking bars
    P(new THREE.CylinderGeometry(0.04, 0.04, 1.7, 6), STEEL, [s * 0.25, 2.0, zr - 0.1], "lockBar");
    P(box(0.12, 0.1, 0.08), BLACK, [s * 0.25, 2.5, zr - 0.1], "lockClamp");
    P(box(0.12, 0.1, 0.08), BLACK, [s * 0.25, 1.5, zr - 0.1], "lockClamp");
    // tail lights, bright red with housing
    P(box(0.4, 0.3, 0.06), BLACK, [s * 1.0, 2.9, zr - 0.02], "tailHousing");
    P(box(0.32, 0.22, 0.05), RED, [s * 1.0, 2.9, zr - 0.06], "tailLamp");
    P(box(0.3, 0.06, 0.05), ORANGE, [s * 1.0, 1.3, zr - 0.06], "indicator");
    // bumper hazard stripes
    for (let i = 0; i < 5; i++)
      P(box(0.2, 0.2, 0.05), i % 2 ? BLACK : HAZARD, [s * (0.15 + i * 0.22), 0.95, -6.47], "bumperStripe", [0, 0, 20]);
  }
  // central seam and handle
  P(box(0.06, 1.7, 0.1), BLACK, [0, 2.0, zr - 0.04], "doorSeam");
  P(box(0.1, 0.4, 0.08), STEEL, [0, 2.0, zr - 0.12], "handle");
  // cyan status strip over door and license plate
  P(box(1.8, 0.05, 0.04), CYAN, [0, 2.95, zr - 0.07], "doorStatus");
  P(box(0.7, 0.2, 0.04), STEEL, [0, 1.15, zr - 0.08], "plate");
  P(box(0.55, 0.1, 0.03), BLACK, [0, 1.15, zr - 0.11], "plateText");
  // bumper tow hooks
  for (const s of [1, -1]) P(new THREE.TorusGeometry(0.1, 0.03, 5, 8), STEEL, [s * 0.9, 0.8, -6.5], "towHook");
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";

export function addExhaustStacks(b: Builder) {
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: string, at: number[], name: string, rot?: number[], tex?: THREE.Texture) =>
    b.part(g, c, { at, name, rotation: rot, flat: true, texture: tex } as any);

  // ---- Exhaust stacks (behind cab, both sides) ----
  for (const s of [1, -1]) {
    const x = s * 1.2;
    const z = -0.55;
    // base mount plate and flange
    P(box(0.44, 0.08, 0.36), HULL_DARK, [x, 1.62, z], "stackPlate");
    P(new THREE.CylinderGeometry(0.19, 0.19, 0.08, 8), BLACK, [x, 1.7, z], "stackFlange");
    // bolts
    for (const dx of [-0.17, 0.17])
      for (const dz of [-0.13, 0.13]) P(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 5), STEEL, [x + dx, 1.67, z + dz], "bolt");
    // glowing rings along the stack
    for (let i = 0; i < 4; i++) {
      const y = 1.85 + i * 0.3;
      P(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8), i % 2 ? ORANGE : CYAN, [x, y, z], "stackRing");
      P(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 8), BLACK, [x, y + 0.1, z], "stackClamp");
    }
    // top cap and rain hood
    P(new THREE.CylinderGeometry(0.17, 0.13, 0.12, 8), BLACK, [x, 3.02, z], "stackCap");
    P(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 8), ORANGE, [x, 3.09, z], "stackGlowTop");
    // heat shield on the outer side: slatted plate
    const sx = x + s * 0.2;
    P(box(0.05, 1.2, 0.34), HULL, [sx, 2.3, z], "heatShield");
    for (let i = 0; i < 6; i++) P(box(0.07, 0.04, 0.3), STEEL, [sx + s * 0.02, 1.8 + i * 0.2, z], "shieldSlat");
    // brackets to the cab back
    for (const y of [1.95, 2.55]) P(box(0.08, 0.06, 0.4), STEEL, [x - s * 0.02, y, z + 0.3], "stackBracket");
  }

  // ---- Windshield HUD ----
  const hud = svg(
    `<svg viewBox="0 0 160 60">
      <g fill="none" stroke="#19f0ff" stroke-width="2.5" stroke-linecap="round">
        <path d="M6 10 H40 M6 10 V24"/><path d="M154 10 H120 M154 10 V24"/>
        <path d="M6 52 H40 M6 52 V38"/><path d="M154 52 H120 M154 52 V38"/>
        <circle cx="80" cy="30" r="14"/><path d="M80 10 V20 M80 40 V50 M56 30 H66 M94 30 H104"/>
        <path d="M20 30 H44 M116 30 H140" stroke-dasharray="4 4"/>
      </g>
      <rect x="48" y="50" width="64" height="4" fill="#ff2bd6"/>
    </svg>`,
    { size: 256 },
  );
  const tilt = -12;
  P(new THREE.PlaneGeometry(1.5, 0.5), "#ffffff", [0, 2.25, 2.17], "hudOverlay", [tilt, 0, 0], hud);
  // windshield frame
  P(box(1.95, 0.07, 0.1), BLACK, [0, 2.58, 2.1], "wsTop");
  P(box(1.95, 0.07, 0.1), BLACK, [0, 1.84, 2.17], "wsBottom");
  for (const s of [1, -1]) P(box(0.07, 0.78, 0.1), BLACK, [s * 0.97, 2.21, 2.13], "wsPillar", [tilt, 0, 0]);
  P(box(0.05, 0.7, 0.09), BLACK, [0, 2.21, 2.14], "wsCenter", [tilt, 0, 0]);
  // wipers
  for (const s of [1, -1]) P(box(0.6, 0.025, 0.03), BLACK, [s * 0.4, 1.9, 2.2], "wiper", [tilt, 0, s * 8]);

  // ---- Side window frames with cyan reflections ----
  for (const s of [1, -1]) {
    const x = s * 1.14;
    P(box(0.05, 0.05, 1.2), BLACK, [x, 2.62, 1.2], "swTop");
    P(box(0.05, 0.05, 1.2), BLACK, [x, 1.98, 1.2], "swBottom");
    for (const z of [0.62, 1.78]) P(box(0.05, 0.68, 0.05), BLACK, [x, 2.3, z], "swPost");
    P(box(0.05, 0.64, 0.04), BLACK, [x, 2.3, 1.2], "swDivider");
    // reflection streaks
    for (let i = 0; i < 3; i++)
      P(box(0.02, 0.5, 0.05), CYAN, [x + s * 0.01, 2.3, 0.9 + i * 0.25], "swReflect", [0, 0, 0]);
    // door handle and seam
    P(box(0.06, 0.06, 0.2), STEEL, [x + s * 0.02, 1.85, 1.65], "doorHandle");
    P(box(0.03, 1.2, 0.03), BLACK, [x, 2.0, 0.55], "doorSeam");
  }
}
```