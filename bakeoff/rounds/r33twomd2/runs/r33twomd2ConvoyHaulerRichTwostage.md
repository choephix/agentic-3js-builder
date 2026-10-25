<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

// ---- palette (top level so stage 2 can use the names) ----
export const HULL = "#3b4452";
export const HULL_DARK = "#1f242d";
export const HULL_LIGHT = "#5d6b7e";
export const ARMOR = "#2a303b";
export const TIRE = "#101216";
export const RIM = "#8b95a6";
export const CYAN = "#19f0ff";
export const MAGENTA = "#ff2bd6";
export const AMBER = "#ffb02e";
export const HAZARD = "#f2c418";
export const POD = "#d9dee6";
export const POD_DARK = "#8d97a8";
export const GLASS = "#0b2a3a";
export const BLACK = "#0a0b0e";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured convoy hauler with a sealed cargo pod, neon trim and a roof turret.",
};

export const REQUESTS = [
  {
    id: "roofLightBar",
    kind: "add",
    part: "cabRoof",
    what: "Neon light bar across the cab roof front: slim black housing, six lamps alternating CYAN and MAGENTA (glowing), and two end brackets.",
    at: [0, 3.2, 3.5],
    normal: [0, 1, 0],
    bone: null,
    room: [2.0, 0.25, 0.35],
  },
  {
    id: "frontGrille",
    kind: "add",
    part: "nose",
    what: "Armoured front grille on the nose: horizontal slats in HULL_DARK, a CYAN glowing centre strip, and a small hazard-yellow bumper chevron row.",
    at: [0, 1.4, 4.95],
    normal: [0, 0, 1],
    bone: null,
    room: [1.8, 0.7, 0.3],
  },
  {
    id: "podEmblem",
    kind: "add",
    part: "podBody",
    what: "Corporate emblem on the left side of the cargo pod: a hexagonal badge in MAGENTA and CYAN outline with a stylised shield glyph, layered as dark outline, main colour and highlight.",
    at: [1.08, 2.4, -1.2],
    normal: [1, 0, 0],
    bone: null,
    room: [0.2, 1.2, 1.2],
  },
  {
    id: "podLockLights",
    kind: "add",
    part: "podSealBand",
    what: "Seal-status lights along the pod's central seal band: a row of eight small AMBER lamps with a dark rail, plus a keypad plate with a tiny red glowing LED on the pod's left.",
    at: [1.1, 2.9, -2.0],
    normal: [1, 0, 0],
    bone: null,
    room: [0.2, 0.5, 1.6],
  },
  {
    id: "roofTurret",
    kind: "add",
    part: "turretBase",
    what: "Twin-barrel autocannon turret on the ring mount: armoured housing, two barrels with muzzle brakes, ammo box on a side, a small CYAN targeting lens.",
    at: [0, 3.35, 2.1],
    normal: [0, 1, 0],
    bone: null,
    room: [1.0, 0.8, 1.6],
  },
  {
    id: "antennaArray",
    kind: "add",
    part: "cabRoof",
    what: "Antenna array behind the cab: one tall whip mast, two shorter masts, a small dish and a flat comm box, with blinking MAGENTA tip lamps.",
    at: [0.9, 3.15, 2.5],
    normal: [0, 1, 0],
    bone: null,
    room: [0.8, 1.6, 0.6],
  },
  {
    id: "exhaustDetail",
    kind: "add",
    part: "exhaustL",
    what: "Exhaust stack details on both stacks: heat-shield slats, rain caps, clamp bands, and glowing AMBER inner rim at the tops.",
    at: [1.25, 3.2, 1.75],
    normal: [0, 1, 0],
    bone: null,
    room: [0.5, 1.0, 0.5],
  },
  {
    id: "underglow",
    kind: "add",
    part: "chassis",
    what: "Underglow neon strips along both lower chassis edges in CYAN with a MAGENTA end cap, plus mud flap panels behind the rear wheels with small hazard stripes.",
    at: [1.12, 0.7, -0.5],
    normal: [1, 0, 0],
    bone: null,
    room: [0.2, 0.2, 6.0],
  },
  {
    id: "sideArmourRivets",
    kind: "add",
    part: "sidePlateL",
    what: "Bolts, rivet rows, vent slits and a fuel-cap hatch on the left side armour plate, plus tow hooks at the front bumper.",
    at: [1.32, 1.2, 1.2],
    normal: [1, 0, 0],
    bone: null,
    room: [0.2, 0.7, 2.4],
  },
  {
    id: "cabCamo",
    kind: "texture",
    part: "cabBody",
    what: "Dark urban digital camo in HULL, HULL_DARK and HULL_LIGHT blocks over the cab sides, with a faded white convoy unit number near the door.",
  },
  {
    id: "podPanels",
    kind: "texture",
    part: "podBody",
    what: "Sealed-pod surface: POD white panel seams, scuff marks near the bottom in POD_DARK, and hazard stripes in HAZARD and BLACK near the end rings.",
  },
  {
    id: "chassisGrime",
    kind: "texture",
    part: "chassis",
    what: "Road grime on the chassis and armour: mud gradient rising from the bottom, oil streaks, stencilled warning text.",
  },
] as const;

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "convoyHauler" });

  const box = (size: [number, number, number], at: [number, number, number], color: string, name?: string, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, name, rotation: rot });
  const cyl = (r0: number, r1: number, len: number, at: [number, number, number], axis: "x" | "y" | "z", color: string, seg = 8, name?: string) =>
    b.part(new THREE.CylinderGeometry(r1, r0, len, seg), color, {
      at,
      name,
      dir: axis === "x" ? [1, 0, 0] : axis === "y" ? [0, 1, 0] : [0, 0, 1],
    });
  const lamp = (size: [number, number, number], at: [number, number, number], color: string, k = 1.4) =>
    glow(box(size, at, color), k);

  // ---------- chassis ----------
  box([2.3, 0.45, 8.9], [0, 0.85, -0.1], HULL_DARK, "chassis");
  box([1.7, 0.3, 8.4], [0, 0.55, -0.1], BLACK, "undercarriage");
  // side armour plates (angled)
  for (const s of [1, -1]) {
    box([0.18, 0.7, 4.2], [s * 1.2, 1.15, 0.9], ARMOR, s > 0 ? "sidePlateL" : "sidePlateR", [0, 0, s * -6]);
    box([0.1, 0.3, 4.0], [s * 1.28, 0.8, 0.9], HULL_LIGHT);
    // underglow
    lamp([0.06, 0.06, 6.4], [s * 1.18, 0.5, -0.5], CYAN, 1.6);
    // rear skirt
    box([0.14, 0.5, 2.2], [s * 1.2, 1.0, -3.2], ARMOR);
  }

  // ---------- wheels ----------
  const axles = [3.1, -1.5, -3.1];
  for (const s of [1, -1])
    for (const z of axles) {
      const R = 0.62;
      cyl(R, R, 0.55, [s * 1.35, R, z], "x", TIRE, 10, "tire");
      cyl(0.38, 0.38, 0.58, [s * 1.35, R, z], "x", RIM, 8, "rim");
      glow(cyl(0.16, 0.16, 0.6, [s * 1.37, R, z], "x", CYAN, 6, "hub"), 1.5);
      // fender arch
      box([0.7, 0.12, 1.6], [s * 1.35, 1.32, z], ARMOR, "fender");
      box([0.12, 0.35, 1.6], [s * 1.68, 1.18, z], ARMOR);
      box([0.12, 0.35, 1.6], [s * 1.02, 1.18, z], ARMOR);
    }
  // axle beams
  for (const z of axles) cyl(0.12, 0.12, 2.8, [0, 0.62, z], "x", HULL_DARK, 6);

  // ---------- cab ----------
  box([2.7, 1.3, 2.3], [0, 1.95, 3.0], HULL, "cabBody");
  box([2.5, 0.2, 2.0], [0, 2.7, 3.0], ARMOR, "cabRoof");
  // upper cab (greenhouse)
  box([2.4, 0.9, 1.7], [0, 2.75, 2.7], HULL_LIGHT, "cabUpper");
  box([2.3, 0.14, 1.6], [0, 3.27, 2.6], ARMOR, "cabRoof");
  // sloped windshield
  box([2.1, 0.75, 0.08], [0, 2.8, 3.6], GLASS, "windshield", [-28, 0, 0]);
  glow(box([1.9, 0.08, 0.06], [0, 3.05, 3.68], CYAN), 1.2);
  // side windows
  for (const s of [1, -1]) {
    box([0.06, 0.55, 1.2], [s * 1.22, 2.8, 2.8], GLASS);
    box([0.1, 0.12, 1.3], [s * 1.22, 3.12, 2.8], BLACK);
    box([0.14, 0.9, 0.1], [s * 1.36, 1.95, 3.7], ARMOR);
    // door seam & handle
    box([0.05, 1.0, 0.05], [s * 1.36, 1.9, 2.3], BLACK);
    box([0.07, 0.07, 0.3], [s * 1.37, 2.05, 2.7], RIM);
    // mirror
    box([0.35, 0.3, 0.06], [s * 1.75, 2.7, 3.6], BLACK);
    box([0.4, 0.05, 0.05], [s * 1.55, 2.6, 3.6], ARMOR);
    // hazard shoulder stripe
    for (let i = 0; i < 4; i++) box([0.06, 0.22, 0.2], [s * 1.37, 1.45, 2.2 + i * 0.4], i % 2 ? BLACK : HAZARD);
    // headlights
    lamp([0.5, 0.18, 0.08], [s * 0.85, 1.65, 4.28], CYAN, 1.8);
    lamp([0.18, 0.18, 0.08], [s * 1.18, 1.65, 4.28], MAGENTA, 1.6);
  }

  // ---------- nose ----------
  box([2.5, 0.95, 1.2], [0, 1.5, 4.3], HULL, "nose");
  box([2.3, 0.25, 1.0], [0, 2.1, 4.2], ARMOR, "hood", [10, 0, 0]);
  box([1.9, 0.6, 0.12], [0, 1.4, 4.92], HULL_DARK, "grilleSlot");
  // ram bumper
  box([2.8, 0.5, 0.35], [0, 0.95, 4.85], ARMOR, "bumper");
  for (let i = 0; i < 7; i++) box([0.22, 0.38, 0.06], [-1.2 + i * 0.4, 0.95, 5.05], i % 2 ? BLACK : HAZARD);
  for (const s of [1, -1]) {
    box([0.3, 0.55, 0.5], [s * 1.5, 1.0, 4.7], ARMOR);
    box([0.1, 0.5, 0.1], [s * 1.5, 1.5, 4.8], HULL_LIGHT);
  }

  // ---------- exhausts ----------
  for (const s of [1, -1]) {
    cyl(0.17, 0.17, 1.9, [s * 1.25, 2.55, 1.75], "y", HULL_LIGHT, 8, s > 0 ? "exhaustL" : "exhaustR");
    cyl(0.2, 0.2, 0.25, [s * 1.25, 3.55, 1.75], "y", BLACK, 8);
    box([0.12, 0.12, 0.5], [s * 1.25, 1.7, 1.78], ARMOR);
  }

  // ---------- turret ----------
  cyl(0.55, 0.55, 0.15, [0, 3.38, 2.1], "y", BLACK, 10, "turretRing");
  cyl(0.45, 0.42, 0.45, [0, 3.62, 2.1], "y", ARMOR, 8, "turretBase");
  box([0.7, 0.35, 0.8], [0, 3.95, 2.15], HULL, "turretHead");
  for (const s of [1, -1]) cyl(0.06, 0.06, 1.2, [s * 0.22, 3.95, 2.95], "z", BLACK, 6, "barrel");
  lamp([0.15, 0.1, 0.06], [0, 4.0, 2.56], CYAN);

  // ---------- cargo pod ----------
  // cradle frame
  box([2.0, 0.2, 5.4], [0, 1.2, -1.4], BLACK, "cradle");
  for (const z of [0.8, -1.2, -3.2]) {
    for (const s of [1, -1]) {
      box([0.18, 0.9, 0.3], [s * 0.85, 1.65, z], ARMOR, "cradleArm");
      box([0.3, 0.14, 0.4], [s * 1.0, 2.0, z], HULL_LIGHT);
    }
  }
  // pod body
  b.rod([0, 2.4, -4.1], [0, 2.4, 1.3], 1.05, POD, { sides: 8, caps: "flat", name: "podBody" });
  b.rod([0, 2.4, -4.5], [0, 2.4, -4.1], [0.65, 1.05], POD_DARK, { sides: 8, caps: "flat", name: "podRear" });
  b.rod([0, 2.4, 1.3], [0, 2.4, 1.55], [1.05, 0.7], POD_DARK, { sides: 8, caps: "flat", name: "podFront" });
  // reinforcing rings
  for (const z of [-3.7, -2.4, -0.4, 0.9]) b.rod([0, 2.4, z - 0.12], [0, 2.4, z + 0.12], 1.12, HULL, { sides: 8, caps: "flat", name: "podRing" });
  // seal band
  b.rod([0, 2.4, -2.3], [0, 2.4, -1.5], 1.09, ARMOR, { sides: 8, caps: "flat", name: "podSealBand" });
  glow(b.rod([0, 2.4, -2.0], [0, 2.4, -1.8], 1.13, AMBER, { sides: 8, caps: "flat" }), 1.3);
  // top ridge and latches
  box([0.5, 0.12, 4.6], [0, 3.5, -1.6], HULL_LIGHT, "podRidge");
  for (const s of [1, -1]) for (const z of [-3.5, -0.7]) box([0.2, 0.3, 0.35], [s * 1.0, 3.0, z], BLACK);
  // rear lights
  for (const s of [1, -1]) {
    lamp([0.25, 0.2, 0.08], [s * 0.5, 2.0, -4.78], MAGENTA, 1.6);
    box([0.5, 0.1, 0.1], [s * 0.5, 1.75, -4.75], HAZARD);
  }
  // rear bumper / hitch
  box([2.4, 0.35, 0.3], [0, 1.0, -4.5], ARMOR, "rearBumper");

  // ---------- cab-to-pod connector ----------
  box([1.6, 0.5, 0.8], [0, 1.6, 1.7], ARMOR, "gooseneck");
  for (const s of [1, -1]) box([0.1, 0.1, 1.2], [s * 0.4, 1.9, 1.5], BLACK); // hoses

  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: texture -->

cabCamo: a paint on the cab body, with blocky digital camo in the three hull tones, a darker top and a faded white unit number on the door side as a separate textured decal plate.
podPanels: a paint on the pod body with panel seams, scuffs rising from the bottom, and hazard stripes near the end rings.
chassisGrime: a paint on the chassis with mud rising from the bottom, oil streaks, and a stencilled warning-text plate on the side.

The paints are defined before `build`, and the part calls swap their colour for them. The unit number and warning text are SVG textures on thin plates placed next to the painted parts. The `cabBody` box is 2.7 wide, so its side face sits at x = ±1.35, and the plate goes just outside it.

<<<<<<< SEARCH
export const STAGE2: ((b: Builder) => void)[] = [];
=======
export const STAGE2: ((b: Builder) => void)[] = [];

// ---- stage 2 paints and textures ----
const camoPaint = paint((p, n) => {
  const q = 0.18;
  const gx = Math.floor(p.z / q), gy = Math.floor(p.y / q), gz = Math.floor(p.x / q);
  const h = Math.abs(Math.sin(gx * 12.9898 + gy * 78.233 + gz * 37.719) * 43758.5453) % 1;
  const big = noise(new THREE.Vector3(Math.floor(p.x / 0.4) * 0.4, Math.floor(p.y / 0.4) * 0.4, Math.floor(p.z / 0.4) * 0.4), 0.9, 4);
  const v = h * 0.6 + big * 0.5;
  let c: string = v < 0.45 ? HULL_DARK : v < 0.8 ? HULL : HULL_LIGHT;
  if (n.y > 0.7) c = mix(c, HULL_DARK, 0.4) as unknown as string;
  return c;
});

const podPaint = paint((p, n) => {
  const base = rgb(POD);
  let c: Rgb = base;
  // panel seams
  const sz = ((p.z % 0.9) + 0.9) % 0.9;
  const ang = Math.atan2(p.y - 2.4, p.x);
  const sa = (((ang / (Math.PI / 4)) % 1) + 1) % 1;
  if (sz < 0.025 || sa < 0.02 || sa > 0.98) c = mix(c, POD_DARK, 0.8);
  // scuffs, heavier toward the bottom
  const low = smoothstep(2.9, 1.5, p.y);
  c = mix(c, POD_DARK, low * smoothstep(0.35, 0.75, noise(p, 0.3, 2)) * 0.85);
  c = mix(c, "#6b7280", smoothstep(0.72, 0.9, noise(p, 0.08, 8)) * 0.5);
  // hazard stripes near the ends
  const nearEnd = p.z > 0.85 && p.z < 1.3 || p.z < -3.4 && p.z > -4.1;
  if (nearEnd && n.z < 0.5 && Math.abs(n.z) < 0.5) {
    const d = ((p.z + p.y + p.x) / 0.22) % 2;
    if (p.z > 1.0 || (p.z < -3.55 && p.z > -3.9)) c = (d + 2) % 2 < 1 ? rgb(HAZARD) : rgb(BLACK);
  }
  return c;
});

const grimePaint = paint((p, n) => {
  let c: Rgb = rgb(HULL_DARK);
  const mud = smoothstep(1.15, 0.6, p.y + (noise(p, 0.25, 3) - 0.5) * 0.35);
  c = mix(c, "#4a3a28", mud * 0.9);
  const streak = Math.abs(Math.sin(p.x * 23 + noise(p, 0.5, 6) * 5)) > 0.93 ? 0.6 : 0;
  c = mix(c, BLACK, streak * smoothstep(0.35, 0.65, noise(p, 0.4, 7)));
  c = mix(c, "#3a3f4a", (n.y > 0.5 ? 0.5 : 0) * smoothstep(0.5, 0.8, noise(p, 0.1, 1)));
  return c;
});

const UNIT_TEX = svg(
  `<svg viewBox="0 0 96 48"><text x="48" y="36" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="38" fill="#e8ecf2" fill-opacity="0.7">C-07</text><rect x="4" y="42" width="88" height="3" fill="#e8ecf2" fill-opacity="0.5"/></svg>`,
  { size: 192 },
);
const WARN_TEX = svg(
  `<svg viewBox="0 0 192 40"><text x="96" y="27" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="24" fill="#f2c418" fill-opacity="0.75">! SEALED CARGO !</text></svg>`,
  { size: 384 },
);

STAGE2.push((b) => {
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.9, 0.45), "#ffffff", {
      at: [s * 1.375, 1.55, 3.2], dir: [s, 0, 0], axis: "z", texture: UNIT_TEX, name: "unitNumber",
    });
    b.part(new THREE.PlaneGeometry(2.2, 0.46), "#ffffff", {
      at: [s * 1.1, 0.95, -2.2], dir: [s, 0, 0], axis: "z", texture: WARN_TEX, name: "warnText",
    });
  }
});
>>>>>>> REPLACE

<<<<<<< SEARCH
import { createBuilder, type Builder } from "agentic-3js-builder";
=======
import { createBuilder, paint, noise, mix, rgb, smoothstep, svg, type Builder, type Rgb } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  box([2.3, 0.45, 8.9], [0, 0.85, -0.1], HULL_DARK, "chassis");
=======
  box([2.3, 0.45, 8.9], [0, 0.85, -0.1], grimePaint as unknown as string, "chassis");
>>>>>>> REPLACE

<<<<<<< SEARCH
  box([2.7, 1.3, 2.3], [0, 1.95, 3.0], HULL, "cabBody");
=======
  box([2.7, 1.3, 2.3], [0, 1.95, 3.0], camoPaint as unknown as string, "cabBody");
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod([0, 2.4, -4.1], [0, 2.4, 1.3], 1.05, POD, { sides: 8, caps: "flat", name: "podBody" });
=======
  b.rod([0, 2.4, -4.1], [0, 2.4, 1.3], 1.05, podPaint, { sides: 8, caps: "flat", name: "podBody" });
>>>>>>> REPLACE

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addRoofLightBar(b: Builder) {
  const Y = 3.36; // top of cab roof (stage 1 roof box centre 3.27, half 0.07)
  const Z = 3.5;
  const SIL = "#1a1d24";

  const box = (size: [number, number, number], at: [number, number, number], color: string, name: string) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, name });

  // slim black housing with a raised rear spine and a lower front lip
  box([1.96, 0.12, 0.3], [0, Y + 0.09, Z], BLACK, "lightBarHousing");
  box([1.9, 0.06, 0.1], [0, Y + 0.18, Z - 0.1], SIL, "lightBarSpine");
  box([1.9, 0.04, 0.06], [0, Y + 0.05, Z + 0.15], HULL_DARK, "lightBarLip");

  // six alternating glowing lamps with small dark separators and visors
  const n = 6;
  const span = 1.7;
  for (let i = 0; i < n; i++) {
    const x = -span / 2 + (span / (n - 1)) * i;
    const c = i % 2 ? MAGENTA : CYAN;
    glow(box([0.24, 0.09, 0.05], [x, Y + 0.1, Z + 0.155], c, "lightBarLamp"), 1.8);
    box([0.28, 0.025, 0.09], [x, Y + 0.165, Z + 0.17], BLACK, "lightBarVisor");
    if (i < n - 1) box([0.03, 0.1, 0.07], [x + span / (n - 1) / 2, Y + 0.1, Z + 0.16], SIL, "lightBarDivider");
  }

  // end brackets with bolts and feet
  for (const s of [1, -1]) {
    box([0.08, 0.2, 0.3], [s * 1.02, Y + 0.1, Z], ARMOR, "lightBarBracket");
    box([0.16, 0.04, 0.34], [s * 1.02, Y + 0.02, Z], HULL_LIGHT, "lightBarFoot");
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), RIM, {
      at: [s * 1.07, Y + 0.12, Z + 0.15],
      dir: [s, 0, 0],
      name: "lightBarBolt",
    });
    // little glowing end cap
    glow(box([0.03, 0.06, 0.2], [s * 1.0, Y + 0.1, Z], s > 0 ? CYAN : MAGENTA, "lightBarEnd"), 1.4);
  }

  // cable run back to the roof
  box([0.05, 0.03, 0.4], [0.55, Y + 0.02, Z - 0.3], BLACK, "lightBarCable");
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addFrontGrille(b: Builder) {
  const box = (size: [number, number, number], at: [number, number, number], color: string, name?: string) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, name });

  // ---------- FRONT GRILLE (nose front face at z ~ 4.9) ----------
  const gz = 5.0;
  // frame
  box([1.9, 0.08, 0.1], [0, 1.74, gz], HULL_LIGHT, "grilleFrameTop");
  box([1.9, 0.08, 0.1], [0, 1.06, gz], HULL_LIGHT, "grilleFrameBot");
  for (const s of [1, -1]) box([0.08, 0.7, 0.1], [s * 0.95, 1.4, gz], HULL_LIGHT, "grilleFrameSide");
  // slats, angled
  for (let i = 0; i < 6; i++) {
    const y = 1.18 + i * 0.1;
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.78, 0.045, 0.1), HULL_DARK, {
        at: [s * 0.5, y, gz + 0.01],
        rotation: [-18, 0, 0],
        name: "grilleSlat",
      });
    }
  }
  // glowing centre strip with dark casing
  box([0.2, 0.62, 0.08], [0, 1.4, gz + 0.02], BLACK, "grilleCore");
  glow(box([0.09, 0.56, 0.06], [0, 1.4, gz + 0.06], CYAN, "grilleStrip"), 1.8);
  for (let i = 0; i < 5; i++) glow(box([0.2, 0.025, 0.07], [0, 1.2 + i * 0.1, gz + 0.065], CYAN), 1.2);
  // bolts on frame
  for (const s of [1, -1])
    for (const y of [1.1, 1.7]) b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), RIM, { at: [s * 0.95, y, gz + 0.06], dir: [0, 0, 1], name: "grilleBolt" });
  // chevron row on bumper
  const chev = svg(
    `<svg viewBox="0 0 32 16"><rect width="32" height="16" fill="#0a0b0e"/>
    <g fill="none" stroke="#f2c418" stroke-width="4" stroke-linejoin="miter">
    <path d="M-2 0 L6 8 L-2 16"/><path d="M6 0 L14 8 L6 16"/><path d="M14 0 L22 8 L14 16"/><path d="M22 0 L30 8 L22 16"/></g></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(2.4, 0.2), "#ffffff", { at: [0, 0.82, 5.04], dir: [0, 0, 1], axis: "z", texture: chev, name: "bumperChevrons" });
  // tow hooks
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), RIM, { at: [s * 0.7, 0.7, 5.0], name: "towHook" });
  }

  // ---------- POD EMBLEM (left side, x ~ 1.08 +, surface of octagon radius ~1.05) ----------
  const ex = 1.075;
  const emblem = svg(
    `<svg viewBox="0 0 100 100">
    <polygon points="50,2 92,26 92,74 50,98 8,74 8,26" fill="#0a0b0e"/>
    <polygon points="50,8 87,29 87,71 50,92 13,71 13,29" fill="#2a1236" stroke="#ff2bd6" stroke-width="5"/>
    <polygon points="50,14 82,32 82,68 50,86 18,68 18,32" fill="none" stroke="#19f0ff" stroke-width="2.5"/>
    <path d="M50 27 L68 35 L68 54 Q68 68 50 76 Q32 68 32 54 L32 35 Z" fill="#0a0b0e" stroke="#19f0ff" stroke-width="3.5"/>
    <path d="M50 33 L62 39 L62 53 Q62 62 50 68 Z" fill="#ff2bd6"/>
    <path d="M50 33 L38 39 L38 53 Q38 62 50 68 Z" fill="#19f0ff"/>
    <path d="M50 33 L50 68" stroke="#ffffff" stroke-width="2.5"/>
    <circle cx="50" cy="45" r="3.5" fill="#ffffff"/>
    </svg>`,
    { size: 384 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(1.1, 1.1), "#ffffff", { at: [ex, 2.4, -1.2], dir: [1, 0, 0], axis: "z", up: [0, 1, 0], texture: emblem, name: "podEmblemDecal" }),
    0.9,
  );
  // backing plate and corner studs
  box([0.05, 1.2, 1.2], [1.02, 2.4, -1.2], BLACK, "emblemPlate");
  for (const dy of [-0.55, 0.55])
    for (const dz of [-0.55, 0.55])
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), RIM, { at: [1.07, 2.4 + dy, -1.2 + dz], dir: [1, 0, 0], name: "emblemStud" });
  // caption strip
  const cap = svg(
    `<svg viewBox="0 0 80 12"><rect width="80" height="12" fill="#0a0b0e"/><text x="40" y="9.5" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="#19f0ff">AEGIS-LOGI</text></svg>`,
    { size: 256 },
  );
  glow(b.part(new THREE.PlaneGeometry(0.9, 0.135), "#ffffff", { at: [1.08, 1.75, -1.2], dir: [1, 0, 0], axis: "z", texture: cap, name: "emblemCaption" }), 0.8);
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addPodLockLights(b: Builder) {
  // The pod is an 8-sided prism of radius 1.05 centred x=0,y=2.4; left side face is at x ~ 1.05..1.13 (band radius 1.09 / 1.13).
  const X = 1.15;
  const RED = "#ff2a2a";
  const PLATE = "#161a22";
  const TRIM = "#6b7686";

  const box = (size: [number, number, number], at: [number, number, number], color: string, name: string) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, name });

  // dark rail along the seal band (left side)
  box([0.07, 0.2, 1.5], [X, 2.9, -2.0], PLATE, "s23_rail");
  box([0.05, 0.03, 1.55], [X + 0.01, 3.0, -2.0], TRIM, "s23_railTop");
  box([0.05, 0.03, 1.55], [X + 0.01, 2.8, -2.0], TRIM, "s23_railBot");

  // eight amber lamps with small housings
  for (let i = 0; i < 8; i++) {
    const z = -2.0 - 0.65 + i * (1.3 / 7);
    box([0.04, 0.12, 0.14], [X + 0.03, 2.9, z], BLACK, "s23_lampHousing");
    glow(box([0.05, 0.08, 0.1], [X + 0.05, 2.9, z], AMBER, "s23_lamp"), 1.6);
  }

  // end bolts on the rail
  for (const z of [-2.8, -1.2])
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), TRIM, {
      at: [X + 0.03, 2.9, z],
      dir: [1, 0, 0],
      name: "s23_bolt",
    });

  // keypad plate below the rail, with drawn keys
  const keys = svg(
    `<svg viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="30" height="40" rx="3" fill="#0c0e13"/>
      <rect x="2" y="2" width="26" height="9" fill="#06242c" stroke="#19f0ff" stroke-width="1"/>
      <path d="M5 7 h4 m3 0 h4 m3 0 h4" stroke="#19f0ff" stroke-width="1.6"/>
      ${[0, 1, 2, 3]
        .map((r) =>
          [0, 1, 2]
            .map(
              (c) =>
                `<rect x="${4 + c * 8}" y="${14 + r * 6.5}" width="6" height="4.5" rx="1" fill="#39414f" stroke="#8b95a6" stroke-width="0.6"/>`,
            )
            .join(""),
        )
        .join("")}
    </svg>`,
    { size: 192 },
  );
  box([0.06, 0.5, 0.38], [X, 2.4, -2.0], PLATE, "s23_keypadFrame");
  b.part(new THREE.PlaneGeometry(0.32, 0.43), "#ffffff", {
    at: [X + 0.035, 2.4, -2.0],
    dir: [1, 0, 0],
    axis: "z",
    up: [0, 1, 0],
    texture: keys,
    name: "s23_keypad",
  });

  // tiny red LED above the keypad, with a bezel
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), TRIM, {
    at: [X + 0.03, 2.67, -2.0],
    dir: [1, 0, 0],
    name: "s23_ledBezel",
  });
  glow(
    b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, {
      at: [X + 0.05, 2.67, -2.0],
      name: "s23_led",
    }),
    2,
  );

  // hazard tick marks under the keypad
  for (let i = 0; i < 4; i++) box([0.04, 0.05, 0.07], [X, 2.1, -2.12 + i * 0.08], i % 2 ? BLACK : HAZARD, "s23_tick");
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addRoofTurret(b: Builder) {
  const STEEL = "#4a5566";
  const OLIVE = "#2f3a30";
  const WHIP = "#c6ccd6";
  const RED = "#ff3b3b";

  const box = (s: [number, number, number], at: [number, number, number], c: string, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...s), c, { at, rotation: rot });
  const cylY = (r: number, h: number, at: [number, number, number], c: string, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at });
  const cylZ = (r: number, h: number, at: [number, number, number], c: string, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at, dir: [0, 0, 1] });

  // ===== Roof turret (ring mount at 0, 3.35, 2.1) =====
  const TX = 0, TZ = 2.1;
  // rotating collar and armoured skirt
  cylY(0.5, 0.1, [TX, 3.72, TZ], STEEL, 10);
  // armoured housing: angled front plate and side cheeks
  box([0.8, 0.12, 0.9], [TX, 4.15, TZ + 0.05], HULL_LIGHT);
  box([0.72, 0.2, 0.3], [TX, 4.05, TZ + 0.5], HULL, [-25, 0, 0]);
  for (const s of [1, -1]) {
    box([0.1, 0.34, 0.8], [s * 0.4, 3.98, TZ + 0.05], ARMOR, [0, 0, s * 8]);
    // barrel cradle, sleeve, barrel and muzzle brake
    box([0.14, 0.16, 0.3], [s * 0.22, 3.95, TZ + 0.5], BLACK);
    cylZ(0.095, 0.5, [s * 0.22, 3.95, TZ + 0.75], STEEL, 8);
    cylZ(0.055, 0.9, [s * 0.22, 3.95, TZ + 1.4], BLACK, 6);
    box([0.16, 0.16, 0.2], [s * 0.22, 3.95, TZ + 1.9], ARMOR);
    box([0.2, 0.04, 0.12], [s * 0.22, 3.95, TZ + 1.9], BLACK);
    glow(box([0.04, 0.1, 0.03], [s * 0.22, 3.95, TZ + 2.0], AMBER), 1.2);
    // hazard tick on cheek
    box([0.04, 0.08, 0.2], [s * 0.46, 4.02, TZ + 0.3], HAZARD);
  }
  // ammo box on left side with feed belt
  box([0.34, 0.3, 0.5], [0.6, 3.95, TZ - 0.05], OLIVE);
  box([0.36, 0.05, 0.52], [0.6, 4.12, TZ - 0.05], ARMOR);
  box([0.1, 0.1, 0.05], [0.6, 3.98, TZ + 0.22], HAZARD);
  for (let i = 0; i < 4; i++) box([0.2, 0.04, 0.06], [0.42 - i * 0.04, 4.0 - i * 0.015, TZ + 0.3 + i * 0.08], HAZARD);
  // rear counterweight and hatch
  box([0.6, 0.28, 0.3], [TX, 4.0, TZ - 0.5], ARMOR);
  cylY(0.14, 0.05, [TX, 4.23, TZ - 0.1], BLACK, 8);
  // sensor lens on top front
  box([0.22, 0.2, 0.2], [TX, 4.3, TZ + 0.25], BLACK);
  cylZ(0.065, 0.06, [TX, 4.3, TZ + 0.37], CYAN, 8);
  glow(b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 8), CYAN, { at: [TX, 4.3, TZ + 0.4], dir: [0, 0, 1] }), 2);
  // small whip on turret
  b.rod([-0.3, 4.2, TZ - 0.4], [-0.3, 4.75, TZ - 0.4], 0.01, WHIP);

  // ===== Antenna array behind the cab (around 0.9, 3.15, 2.5) =====
  const AX = 0.9, AY = 3.34, AZ = 2.2;
  // base plate and comm box
  box([0.8, 0.05, 0.55], [AX, AY - 0.02, AZ], ARMOR);
  box([0.45, 0.12, 0.3], [AX - 0.12, AY + 0.07, AZ + 0.1], HULL_DARK);
  box([0.3, 0.02, 0.1], [AX - 0.12, AY + 0.14, AZ + 0.1], HULL_LIGHT);
  glow(box([0.04, 0.03, 0.03], [AX + 0.05, AY + 0.1, AZ + 0.26], CYAN), 1.5);
  // tall whip mast with tip lamp, base spring and guy ring
  cylY(0.05, 0.12, [AX + 0.28, AY + 0.08, AZ - 0.1], BLACK, 6);
  b.rod([AX + 0.28, AY + 0.1, AZ - 0.1], [AX + 0.28, AY + 1.7, AZ - 0.1], [0.025, 0.008], WHIP, { sides: 6 });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), MAGENTA, { at: [AX + 0.28, AY + 1.72, AZ - 0.1] }), 2.2);
  // two shorter masts
  b.rod([AX - 0.3, AY, AZ - 0.15], [AX - 0.3, AY + 0.95, AZ - 0.15], [0.02, 0.01], WHIP, { sides: 6 });
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), MAGENTA, { at: [AX - 0.3, AY + 0.97, AZ - 0.15] }), 2);
  b.rod([AX, AY, AZ - 0.2], [AX, AY + 0.65, AZ - 0.2], [0.02, 0.01], WHIP, { sides: 6 });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), MAGENTA, { at: [AX, AY + 0.67, AZ - 0.2] }), 2);
  for (const y of [0.35, 0.65]) box([0.12, 0.02, 0.02], [AX - 0.3, AY + y, AZ - 0.15], BLACK);
  // small dish on a stalk
  b.rod([AX - 0.1, AY + 0.14, AZ + 0.12], [AX - 0.1, AY + 0.42, AZ + 0.12], 0.02, STEEL, { sides: 6 });
  b.part(new THREE.CylinderGeometry(0.17, 0.04, 0.08, 10), POD, { at: [AX - 0.1, AY + 0.5, AZ + 0.17], rotation: [60, 0, 0] });
  b.rod([AX - 0.1, AY + 0.52, AZ + 0.2], [AX - 0.1, AY + 0.62, AZ + 0.3], 0.01, BLACK, { sides: 4 });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { at: [AX - 0.1, AY + 0.63, AZ + 0.31] });
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder, paint, noise, mix, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addExhaustDetail(b: Builder) {
  const SOOT = "#15110e";
  const COPPER = "#a8683a";
  const EMBER = "#ff7a1a";
  const STEEL = "#6d7684";
  const HOT = "#ffd27a";

  // heat-stained paint for the stacks' shields
  const shield = paint((p, n) => {
    const grime = noise(p, 0.18, 4);
    const heat = smoothstep(2.9, 3.6, p.y);
    const base = mix(HULL_LIGHT, "#2c2420", 0.35 + 0.35 * grime);
    return mix(base, "#7a4a2a", heat * 0.5 * smoothstep(0.3, 0.8, grime) + (n.y > 0.7 ? 0.1 : 0));
  });

  // slatted vent texture for the heat shield
  const slats = svg(
    `<svg viewBox="0 0 32 64"><rect width="32" height="64" fill="#2a2d33"/>${Array.from({ length: 8 }, (_, i) => `<rect x="3" y="${4 + i * 7.5}" width="26" height="3.2" rx="1" fill="#0a0b0e"/><rect x="3" y="${7 + i * 7.5}" width="26" height="1" fill="#8b95a6"/>`).join("")}</svg>`,
    { size: 128 },
  );

  for (const s of [1, -1]) {
    const x = s * 1.25;
    const z = 1.75;

    // outer heat shield: half-open faceted sleeve on the outboard side
    b.part(new THREE.CylinderGeometry(0.235, 0.235, 1.1, 8, 1, true, s > 0 ? -Math.PI / 2 : Math.PI / 2, Math.PI), shield, {
      at: [x, 2.85, z],
      name: "s25shield",
    });
    // slat card on the outboard face
    b.part(new THREE.PlaneGeometry(0.3, 0.95), "#ffffff", {
      at: [x + s * 0.245, 2.85, z],
      dir: [s, 0, 0],
      axis: "z",
      texture: slats,
      name: "s25slats",
    });
    // shield stand-off bars
    for (const dz of [-0.14, 0.14]) {
      b.part(new THREE.BoxGeometry(0.05, 0.08, 0.05), STEEL, { at: [x + s * 0.2, 2.35, z + dz], name: "s25standoff" });
      b.part(new THREE.BoxGeometry(0.05, 0.08, 0.05), STEEL, { at: [x + s * 0.2, 3.35, z + dz], name: "s25standoff" });
    }

    // clamp bands with bolt lugs
    for (const y of [1.95, 2.45, 3.2]) {
      b.part(new THREE.CylinderGeometry(0.205, 0.205, 0.07, 8), COPPER, { at: [x, y, z], name: "s25clamp" });
      b.part(new THREE.BoxGeometry(0.1, 0.08, 0.06), STEEL, { at: [x - s * 0.2, y, z + 0.06], name: "s25lug" });
      b.part(new THREE.SphereGeometry(0.025, 5, 4), HOT, { at: [x - s * 0.24, y, z + 0.06], name: "s25bolt" });
    }

    // top: soot collar, glowing rim, hinged rain cap
    b.part(new THREE.CylinderGeometry(0.235, 0.2, 0.16, 8), SOOT, { at: [x, 3.55, z], name: "s25collar" });
    glow(
      b.part(new THREE.TorusGeometry(0.17, 0.028, 5, 10), EMBER, {
        at: [x, 3.69, z],
        dir: [0, 1, 0],
        axis: "z",
        name: "s25rim",
      }),
      2,
    );
    glow(b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 8), AMBER, { at: [x, 3.665, z], name: "s25ember" }), 1.6);
    // rain cap: shallow cone raised on three struts
    b.part(new THREE.ConeGeometry(0.27, 0.12, 8), HULL_DARK, { at: [x, 3.98, z], name: "s25cap" });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 6), STEEL, { at: [x, 3.92, z], name: "s25capHub" });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      b.part(new THREE.BoxGeometry(0.03, 0.22, 0.03), STEEL, {
        at: [x + Math.cos(a) * 0.17, 3.8, z + Math.sin(a) * 0.17],
        name: "s25strut",
      });
    }

    // base flange where stack meets the chassis, plus a rear bracket to the cab
    b.part(new THREE.CylinderGeometry(0.28, 0.3, 0.1, 8), HULL_DARK, { at: [x, 1.62, z], name: "s25flange" });
    b.part(new THREE.BoxGeometry(0.36, 0.06, 0.1), ARMOR, { at: [x - s * 0.18, 2.3, z + 0.22], name: "s25bracket" });
    // amber warning dot on the shield
    glow(b.part(new THREE.BoxGeometry(0.04, 0.04, 0.02), AMBER, { at: [x + s * 0.0, 2.2, z + 0.205], name: "s25warn" }), 1.5);
  }
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addUnderglow(b: Builder) {
  const box = (size: [number, number, number], at: [number, number, number], color: string, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, rotation: rot });
  const cyl = (r: number, len: number, at: [number, number, number], dir: [number, number, number], color: string, seg = 6) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, dir });
  const RED = "#ff2a2a";

  // ---- underglow: strips, housings, end caps, mud flaps ----
  for (const s of [1, -1]) {
    // dark rail housings under the glowing strips
    box([0.1, 0.12, 6.5], [s * 1.17, 0.56, -0.5], HULL_DARK);
    glow(box([0.05, 0.05, 6.2], [s * 1.23, 0.5, -0.5], CYAN), 1.8);
    // magenta end caps
    for (const z of [2.8, -3.8]) glow(box([0.09, 0.09, 0.2], [s * 1.23, 0.5, z], MAGENTA), 1.8);
    // mounting brackets
    for (let i = 0; i < 6; i++) box([0.14, 0.05, 0.1], [s * 1.2, 0.62, -3.3 + i * 1.2], BLACK);
    // mud flaps behind rear wheels
    const fz = -3.78;
    box([0.08, 0.6, 0.85], [s * 1.35, 0.65, fz], BLACK);
    box([0.1, 0.07, 0.95], [s * 1.35, 0.97, fz], ARMOR);
    for (let i = 0; i < 4; i++) box([0.1, 0.1, 0.16], [s * 1.4, 0.38 + i * 0.0, fz - 0.3 + i * 0.2], i % 2 ? BLACK : HAZARD);
    box([0.11, 0.2, 0.4], [s * 1.41, 0.7, fz], HAZARD, [0, 0, 0]);
    // front flaps
    box([0.08, 0.45, 0.7], [s * 1.35, 0.7, 2.35], BLACK);
    box([0.1, 0.06, 0.8], [s * 1.35, 0.95, 2.35], ARMOR);
  }

  // ---- left armour plate: rivets, vents, fuel hatch ----
  const X = 1.31;
  // rivet rows top and bottom
  for (let i = 0; i < 12; i++) {
    const z = 0.2 + i * 0.2;
    cyl(0.035, 0.05, [X + 0.05, 1.46, z], [1, 0, 0], RIM, 6);
    cyl(0.035, 0.05, [X + 0.05, 0.9, z], [1, 0, 0], RIM, 6);
  }
  // vent slits
  box([0.05, 0.38, 0.62], [X + 0.03, 1.18, 0.55], HULL_DARK);
  for (let i = 0; i < 5; i++) box([0.04, 0.025, 0.54], [X + 0.06, 1.04 + i * 0.075, 0.55], BLACK);
  // fuel hatch
  box([0.05, 0.4, 0.4], [X + 0.03, 1.18, 1.75], HULL_DARK);
  box([0.04, 0.32, 0.32], [X + 0.07, 1.18, 1.75], HULL_LIGHT);
  cyl(0.07, 0.05, [X + 0.11, 1.18, 1.75], [1, 0, 0], BLACK, 8);
  box([0.04, 0.03, 0.1], [X + 0.14, 1.18, 1.75], AMBER);
  for (const [dy, dz] of [[0.14, 0.14], [0.14, -0.14], [-0.14, 0.14], [-0.14, -0.14]])
    cyl(0.022, 0.04, [X + 0.1, 1.18 + dy, 1.75 + dz], [1, 0, 0], RIM, 6);
  // stencil panel stripe
  for (let i = 0; i < 3; i++) box([0.03, 0.12, 0.14], [X + 0.03, 1.4 - 0.0, 1.1 + i * 0.2], i % 2 ? BLACK : HAZARD, [0, 0, 0]);

  // ---- tow hooks at front bumper ----
  for (const s of [1, -1]) {
    box([0.22, 0.22, 0.1], [s * 0.8, 0.82, 5.08], BLACK);
    box([0.12, 0.12, 0.3], [s * 0.8, 0.82, 5.2], HULL_LIGHT);
    b.sweep(
      [[s * 0.8, 0.82, 5.3], [s * 0.8, 0.68, 5.46], [s * 0.8, 0.5, 5.4], [s * 0.8, 0.42, 5.26]],
      0.04,
      { color: RIM, sides: 6 },
    );
    cyl(0.03, 0.18, [s * 0.8, 0.42, 5.2], [1, 0, 0], RED, 6);
  }
}
```