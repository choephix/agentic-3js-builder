<!-- call: plan -->

```json
{
  "name": "Warhound 2077 Militarized Truck",
  "description": "A heavy low-poly cyberpunk 6x6 armored military truck with an angular armored cab, a cargo bed with a rocket-launcher turret, neon trim and big chunky wheels.",
  "builderName": "warhound2077",
  "size": [3.0, 3.4, 8.0],
  "layout": "A long, low, wedge-shaped armored truck facing +Z. Front: sloped armored hood with a bull-bar, a wide LED headlight strip and winch bumper. Cab sits just behind the hood at z 1.6..3.0 with a raked angular windshield (glowing cyan slit glass), side armor plates and roof light bar. Behind the cab runs a flat cargo deck with armored side panels, a pintle-mounted roof-of-bed turret near z -1.6 and a rear ramp/exhaust cluster at the back. Three axles (front z=2.9, mid z=-0.7, rear z=-2.7) with six chunky wheels (radius 0.62) under wide wheel arches. Everything is faceted and boxy with chamfered plates, yellow hazard trim, cyan and magenta neon strips along the skirts, and panelled/riveted dark metal paints, decals and glyph textures. Chassis and wheels rest on the floor; the cab, bed and turret sit above on the frame.",
  "palette": {
    "hull": "#2f3540",
    "hullDark": "#161a22",
    "armor": "#4a5160",
    "trim": "#e7b814",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2bb8",
    "glass": "#0e2a3a",
    "tire": "#101114",
    "rim": "#7b8392",
    "brass": "#b88a3c",
    "rust": "#7a3d22",
    "lampWhite": "#fff6d8",
    "warnRed": "#d8262e",
    "olive": "#4b5a3a"
  },
  "mounts": {
    "frameTop": [0, 1.15, 0],
    "frontAxle": [0, 0.62, 2.9],
    "midAxle": [0, 0.62, -0.7],
    "rearAxle": [0, 0.62, -2.7],
    "cabFloor": [0, 1.3, 1.5],
    "cabBack": [0, 1.3, 0.6],
    "bedDeck": [0, 1.45, -1.9],
    "turretRing": [0, 2.0, -1.6],
    "rearBumper": [0, 0.8, -4.0],
    "bumperFront": [0, 0.75, 4.0]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "cab", "parent": "body", "at": [0, 1.3, 1.5], "dir": [0, 0, 1], "role": "hinge", "group": "cab" },
    { "name": "turretYaw", "parent": "body", "at": [0, 2.0, -1.6], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "turretPitch", "parent": "turretYaw", "at": [0, 2.45, -1.6], "dir": [0, 0, -1], "role": "hinge", "group": "turret" },
    { "name": "wheelFL", "parent": "body", "at": [1.3, 0.62, 2.9], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.3, 0.62, 2.9], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.3, 0.62, -0.7], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.3, 0.62, -0.7], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.3, 0.62, -2.7], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.3, 0.62, -2.7], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "rampHinge", "parent": "body", "at": [0, 1.0, -4.0], "dir": [1, 0, 0], "role": "hinge", "group": "bed" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "The load-bearing frame and body underside: two long ladder rails, cross members, skirt armor panels with neon cyan and magenta strips glowing along the lower edges, wheel arches with hazard-yellow trim, three axle housings with differential pumpkins and drive shafts, suspension springs (coil) and shock absorbers, fuel and battery tanks slung between axles, underbody plating with panelled riveted paint, fender flares over all six wheels, front bumper with winch, bull-bar, tow hooks, and headlight/lamp pods (glow). Includes a long sloped armored hood (engine cover) from z 3.0 to 4.0 with vents, grille glyph texture and a roof-ridge, plus front lamp strip.",
      "box": [[-1.5, 0.25, -4.0], [1.5, 1.6, 4.0]],
      "attaches": "Root of the body joint at frameTop. Cab starts at cabFloor; bed deck starts at bedDeck; wheels hang on frontAxle, midAxle, rearAxle; rear bumper at rearBumper; front bumper at bumperFront.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "wheels",
      "builds": "Six chunky low-poly wheels (radius 0.62, width 0.5) as separate parts on wheelFL..wheelRR: faceted 12-sided tires with tread blocks ringed around, rim discs with bolt rings (8 lug nuts), hub caps with a glowing cyan ring or glyph decal, brake discs with drilled holes and calipers in warnRed, mud flaps with decal. Wheel centre heights 0.62 so tires touch y=0. Spokes/rim paint metal-like with grunge dark at the edges.",
      "box": [[-1.6, 0.0, -3.4], [1.6, 1.24, 3.5]],
      "attaches": "Rides the wheel joints at the axle mounts; sits inside chassis fender arches (x from 1.05 to 1.55 each side).",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR"],
      "floor": true,
      "budget": 130
    },
    {
      "id": "cab",
      "builds": "The armored crew cab from z 0.6 to 3.0, floor at cabFloor (y 1.3) up to y 2.9: faceted wedge shell with sloped raked windshield and side windows in dark glass with glowing cyan HUD-like SVG textures and thin armored slits, thick pillar frames, side armor plates with hazard stripe decals and unit emblem decal (angular wolf-head sigil), door seams with handles, side mirrors with camera pods, roof sensor mast, antenna array, roof-mounted light bar (glowing white/magenta), roof hatch, rivets via panelled paint, interior seats and a dashboard with screens glowing (visible through the glass), exhaust stacks behind the cab (two vertical stacks with heat-glow caps) at z 0.5.",
      "box": [[-1.4, 1.3, 0.5], [1.4, 3.1, 3.0]],
      "attaches": "Sits on the chassis at cabFloor; back wall meets bed at cabBack (z 0.6); front meets the hood at z 3.0.",
      "joints": ["cab"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "bed",
      "builds": "The cargo bed from z 0.5 down to -4.0 at deck height bedDeck (y 1.45): armored deck plate with grip-pattern paint, side walls with angled armor panels, cargo ribs, hazard stripes, stencilled serial text decals, tie-down rings, a cargo load of sealed crates and fuel barrels (olive with trim stencils and glowing status lights), a tool rack, tail lights (red glow), the rear drop ramp panel on the rampHinge joint with yellow chevrons, a rear bumper with tow hitch, twin exhaust pipes, fuel filler cap, plus a ring-mount base (rotating track ring with teeth) at turretRing for the turret, and a roll cage hoop behind the cab with a spotlight.",
      "box": [[-1.5, 1.4, -4.1], [1.5, 2.6, 0.6]],
      "attaches": "Rests on the chassis at bedDeck; turret base ring meets the turret at turretRing; ramp hinges at rampHinge; front wall meets cab back at cabBack.",
      "joints": ["body", "rampHinge"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "turret",
      "builds": "The remote weapon station on the turretRing mount (0,2.0,-1.6): a rotating pedestal on turretYaw with a faceted armored housing, a cradle on turretPitch carrying a heavy twin autocannon with perforated barrel shrouds, muzzle brakes, ammo belt feeds and an ammo box, plus a side pod of 6 rocket tubes (2x3) with warhead cones in warnRed, sensor head with a glowing cyan lens (decal reticle) and a laser rangefinder, antenna whip, hazard-yellow trim, kill-mark decals and rivet panelling, and small glowing status LEDs. Barrels point +Z in rest pose, length about 1.6 m.",
      "box": [[-0.9, 2.0, -2.5], [0.9, 3.4, -0.4]],
      "attaches": "Base sits on the bed's ring mount at turretRing; yaw joint turretYaw at turretRing, pitch joint turretPitch above it.",
      "joints": ["turretYaw", "turretPitch"],
      "floor": false,
      "budget": 150
    }
  ]
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { svg, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildCab({ b, J, P }: Ctx) {
  const bone = J.cab;
  const R = rng(77);

  // ---------- textures ----------
  const HUD = svg(
    `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="40" fill="#07202e"/>
    <rect x="1" y="1" width="98" height="38" fill="none" stroke="#2ff3ff" stroke-width="1.2"/>
    <path d="M0 40 L30 0 M100 40 L70 0" stroke="#0f4a60" stroke-width="3"/>
    <circle cx="50" cy="20" r="9" fill="none" stroke="#2ff3ff" stroke-width="1"/>
    <path d="M50 8 V14 M50 26 V32 M38 20 H44 M56 20 H62" stroke="#2ff3ff" stroke-width="1"/>
    <path d="M6 8 H24 M6 12 H18 M76 8 H94 M82 12 H94 M6 32 H20 M80 32 H94" stroke="#2ff3ff" stroke-width="1.2"/>
    <rect x="8" y="26" width="3" height="6" fill="#ff2bb8"/><rect x="13" y="22" width="3" height="10" fill="#2ff3ff"/>
    <rect x="84" y="24" width="3" height="8" fill="#2ff3ff"/><rect x="89" y="20" width="3" height="12" fill="#ff2bb8"/>
    </svg>`,
    { size: 512 },
  );
  const SIDEWIN = svg(
    `<svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="30" fill="#0a2634"/>
    <path d="M0 30 L18 0 H26 L8 30Z M30 30 L48 0 H52 L34 30Z" fill="#12475c"/>
    <path d="M4 6 H22 M4 10 H14 M40 22 H56" stroke="#2ff3ff" stroke-width="1.1"/>
    <rect x="1" y="1" width="58" height="28" fill="none" stroke="#2ff3ff" stroke-width="1"/>
    </svg>`,
    { size: 256 },
  );
  const HAZARD = svg(
    `<svg viewBox="0 0 64 8" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="8" fill="#e7b814"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 8 - 4} 8 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8} 8Z" fill="#14141a"/>`).join("")}
    </svg>`,
    { size: 256 },
  );
  const WOLF = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#161a22" stroke="#e7b814" stroke-width="3"/>
    <path d="M12 12 L24 22 H40 L52 12 L50 34 L40 50 L32 56 L24 50 L14 34Z" fill="#e7b814"/>
    <path d="M20 30 L28 34 L26 38Z M44 30 L36 34 L38 38Z" fill="#161a22"/>
    <path d="M28 46 H36 L32 52Z" fill="#161a22"/>
    <path d="M24 22 L32 28 L40 22" stroke="#161a22" stroke-width="2" fill="none"/>
    <circle cx="25" cy="33" r="1.6" fill="#2ff3ff"/><circle cx="39" cy="33" r="1.6" fill="#2ff3ff"/>
    </svg>`,
    { size: 256 },
  );
  const LENS = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" fill="#052a33"/>
    <circle cx="16" cy="16" r="11" fill="none" stroke="#2ff3ff" stroke-width="2.5"/><circle cx="16" cy="16" r="4" fill="#2ff3ff"/></svg>`,
    { size: 64 },
  );

  // ---------- helpers ----------
  const WHITE = "#ffffff";
  const box = (size: number[], at: number[], color: any, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, ...extra });
  const cyl = (r0: number, r1: number, h: number, seg: number, at: number[], color: any, extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { bone, at, ...extra });
  const plane = (w: number, h: number, at: number[], dir: number[], tex: any, up: number[] = [0, 1, 0]) =>
    b.part(new THREE.PlaneGeometry(w, h), WHITE, { bone, at, dir, axis: "z", up, texture: tex });

  const SHELL = panelled(P.armor, { size: 0.4, aspect: 0.6, rivets: 0.07 });
  const DARKP = panelled(P.hullDark, { size: 0.3, rivets: 0.06 });
  const BRASS = metal("brass", { tarnish: 0.5 });

  // ---------- shell: side-profile wedge ----------
  b.extrude(
    [
      [0.6, 1.3],
      [3.0, 1.3],
      [3.0, 1.95],
      [2.2, 2.85, "sharp"],
      [0.75, 2.85],
      [0.6, 2.7],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.6, bevel: 0.05, color: SHELL, bone },
  );
  // chamfer wedges along roof edges
  for (const s of [1, -1]) {
    box([0.16, 0.12, 1.5], [s * 1.2, 2.88, 1.45], P.hull, { rotation: [0, 0, -s * 25] });
    box([0.1, 0.1, 2.3], [s * 1.33, 1.32, 1.8], P.hullDark);
  }

  // ---------- windshield ----------
  const wn = [0, 0.664, 0.747];
  const wc = [0, 2.4, 2.6];
  const ws = glow(plane(2.2, 1.0, [wc[0], wc[1] + wn[1] * 0.025, wc[2] + wn[2] * 0.025], wn, HUD, [0, 1, -0.0]), 1.1);
  // frame around windshield: top, bottom, pillars
  const rake = Math.atan2(0.9, 0.8);
  const tilt = [-(90 - (rake * 180) / Math.PI) + 0, 0, 0];
  box([2.4, 0.1, 0.12], [0, 2.84, 2.2], P.hullDark);
  box([2.4, 0.1, 0.14], [0, 1.95, 2.99], P.trim);
  for (const s of [1, -1]) {
    const mid = [s * 1.15, 2.4, 2.6];
    b.rod([s * 1.15, 1.98, 3.0], [s * 1.15, 2.86, 2.2], 0.07, P.hullDark, { bone });
    b.rod([s * 1.2, 2.0, 2.97], [s * 1.2, 2.85, 2.2], 0.03, P.neonCyan, { bone });
    void mid;
  }
  void ws; void tilt;
  // armored slit above windshield
  glow(box([1.6, 0.04, 0.05], [0, 2.78, 2.28], P.neonCyan, { rotation: [-42, 0, 0] }), 1.3);

  // ---------- sides ----------
  for (const s of [1, -1]) {
    const x = s * 1.31;
    // side windows
    glow(plane(0.95, 0.5, [x + s * 0.01, 2.48, 2.35], [s, 0, 0], SIDEWIN), 1);
    glow(plane(0.95, 0.5, [x + s * 0.01, 2.48, 1.2], [s, 0, 0], SIDEWIN), 1);
    // frames
    for (const z of [0.68, 1.78, 2.75]) box([0.08, 0.7, 0.1], [s * 1.33, 2.5, z], P.hullDark);
    box([0.08, 0.08, 2.2], [s * 1.33, 2.2, 1.7], P.hullDark);
    box([0.08, 0.08, 2.2], [s * 1.33, 2.78, 1.7], P.hullDark);
    // armor plate on door
    box([0.1, 0.72, 1.3], [s * 1.35, 1.66, 2.0], DARKP);
    box([0.12, 0.06, 1.34], [s * 1.35, 2.04, 2.0], P.trim);
    plane(1.24, 0.155, [s * 1.405, 1.42, 2.0], [s, 0, 0], HAZARD);
    plane(0.5, 0.5, [s * 1.405, 1.78, 2.0], [s, 0, 0], WOLF);
    // door seams + handles
    for (const z of [1.34, 2.66]) box([0.04, 0.9, 0.025], [s * 1.37, 1.82, z], P.hullDark);
    box([0.06, 0.05, 0.22], [s * 1.4, 2.08, 1.5], P.rim);
    box([0.06, 0.05, 0.22], [s * 1.4, 2.08, 1.2], P.rim);
    // rear armor strip + neon sill
    glow(box([0.05, 0.05, 2.3], [s * 1.34, 1.36, 1.8], s > 0 ? P.neonCyan : P.neonMagenta), 1.4);
    // bolts on plate
    for (let i = 0; i < 4; i++)
      cyl(0.025, 0.025, 0.04, 6, [s * 1.41, 1.5 + (i % 2) * 0.35, 1.45 + Math.floor(i / 2) * 1.1], P.brass, { rotation: [0, 0, 90] });
    // mirror
    b.rod([s * 1.3, 2.35, 2.75], [s * 1.62, 2.45, 2.85], 0.025, P.hullDark, { bone });
    box([0.12, 0.34, 0.2], [s * 1.68, 2.45, 2.85], P.hull);
    glow(cyl(0.05, 0.05, 0.03, 8, [s * 1.745, 2.5, 2.88], P.neonCyan, { rotation: [0, 0, 90] }), 1.5);
    plane(0.07, 0.07, [s * 1.765, 2.34, 2.9], [s, 0, 0], LENS);
    // exhaust stacks behind cab
    cyl(0.1, 0.1, 0.08, 8, [s * 1.0, 1.45, 0.54], P.brass);
    cyl(0.07, 0.07, 1.6, 8, [s * 1.0, 2.25, 0.54], BRASS);
    cyl(0.09, 0.07, 0.12, 8, [s * 1.0, 3.05, 0.54], P.hullDark);
    glow(cyl(0.05, 0.05, 0.03, 8, [s * 1.0, 3.1, 0.54], P.rust), 1.6);
    for (const y of [1.8, 2.3, 2.7]) cyl(0.09, 0.09, 0.04, 8, [s * 1.0, y, 0.54], P.hullDark);
    box([0.14, 0.06, 0.1], [s * 1.0, 2.0, 0.6], P.hullDark);
  }

  // ---------- rear wall details ----------
  box([2.0, 1.0, 0.06], [0, 2.1, 0.62], DARKP);
  glow(box([1.2, 0.05, 0.03], [0, 1.55, 0.64], P.warnRed), 1.2);
  for (let i = 0; i < 3; i++) glow(box([0.1, 0.1, 0.03], [-0.3 + i * 0.3, 2.5, 0.65], i === 1 ? P.neonMagenta : P.neonCyan), 1.4);

  // ---------- roof ----------
  box([2.1, 0.07, 1.3], [0, 2.9, 1.5], DARKP);
  // light bar
  box([1.9, 0.12, 0.14], [0, 3.0, 2.15], P.hullDark);
  for (let i = 0; i < 8; i++) {
    const mag = i % 4 === 3 || i % 4 === 0;
    glow(box([0.2, 0.09, 0.05], [-0.8 + i * 0.23, 3.0, 2.235], mag && i > 3 ? P.neonMagenta : P.lampWhite), 1.6);
  }
  box([0.1, 0.1, 0.16], [0.95, 2.97, 2.15], P.hull);
  box([0.1, 0.1, 0.16], [-0.95, 2.97, 2.15], P.hull);
  // hatch
  cyl(0.38, 0.42, 0.08, 8, [0.0, 2.97, 1.4], P.armor);
  cyl(0.3, 0.3, 0.05, 8, [0.0, 3.02, 1.4], P.hull);
  box([0.2, 0.05, 0.05], [0, 3.06, 1.4], P.trim);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cyl(0.02, 0.02, 0.05, 5, [Math.sin(a) * 0.36, 3.0, 1.4 + Math.cos(a) * 0.36], P.brass);
  }
  // sensor mast
  cyl(0.04, 0.05, 0.4, 6, [-0.75, 3.1, 1.1], P.hullDark);
  box([0.2, 0.14, 0.2], [-0.75, 3.3, 1.1], P.hull);
  glow(cyl(0.05, 0.05, 0.03, 8, [-0.75, 3.3, 1.21], P.neonCyan, { rotation: [90, 0, 0] }), 1.6);
  plane(0.1, 0.1, [-0.75, 3.3, 1.213], [0, 0, 1], LENS);
  // radar dish
  cyl(0.02, 0.02, 0.3, 6, [0.8, 3.05, 1.0], P.rim);
  b.lathe([[0, 0], [0.22, 0.07], [0.2, 0.09], [0, 0.03]], { at: [0.8, 3.2, 1.0], axis: [0, 0.6, 0.8], color: P.hull, bone, segments: 8 });
  // antennas
  for (let i = 0; i < 3; i++) {
    const x = 1.0 - i * 0.12;
    const h = 0.7 + R() * 0.7;
    b.rod([x, 2.92, 0.85], [x + 0.05, 2.92 + h, 0.8], 0.012, P.hullDark, { bone });
    glow(b.part(new THREE.SphereGeometry(0.025, 5, 4), P.warnRed, { bone, at: [x + 0.05, 2.94 + h, 0.8] }), 1.5);
  }
  // roof rails
  for (const s of [1, -1]) {
    b.rod([s * 1.0, 2.95, 0.9], [s * 1.0, 2.95, 1.9], 0.02, P.trim, { bone });
    box([0.04, 0.1, 0.04], [s * 1.0, 2.92, 0.9], P.trim);
    box([0.04, 0.1, 0.04], [s * 1.0, 2.92, 1.9], P.trim);
  }

  // ---------- hood-side interface / front details ----------
  box([2.6, 0.1, 0.1], [0, 1.4, 2.98], P.trim);
  for (let i = 0; i < 6; i++) glow(box([0.12, 0.03, 0.03], [-0.8 + i * 0.32, 1.9, 3.01], P.neonCyan), 1.2);
  for (const s of [1, -1]) box([0.12, 0.5, 0.1], [s * 1.28, 1.7, 2.97], P.hullDark);

  // ---------- interior glimpses behind glass ----------
  for (const s of [1, -1]) {
    box([0.45, 0.1, 0.2], [s * 0.55, 2.5, 2.6], P.hullDark, { rotation: [-42, 0, 0] });
    glow(box([0.4, 0.02, 0.02], [s * 0.55, 2.55, 2.53], s > 0 ? P.neonMagenta : P.neonCyan, { rotation: [-42, 0, 0] }), 1.2);
  }
}
```

<!-- call: wheels -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildWheels({ b, J, P }: Ctx) {
  const AXLES = [2.9, -0.7, -2.7];
  const NAMES = [
    ["wheelFL", "wheelFR"],
    ["wheelML", "wheelMR"],
    ["wheelRL", "wheelRR"],
  ];
  const CY = 0.62;
  const CX = 1.3;

  // ---------- textures ----------
  const GLYPH = svg(
    `<svg viewBox="0 0 64 64">
      <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill="none" stroke="#2ff3ff" stroke-width="5"/>
      <path d="M32 16 L44 26 L38 26 L38 44 L26 44 L26 26 L20 26 Z" fill="#2ff3ff"/>
      <circle cx="32" cy="50" r="3" fill="#2ff3ff"/>
    </svg>`,
    { size: 128 },
  );
  const DISC = svg(
    `<svg viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="31" fill="#b9c0cc"/>
      <circle cx="32" cy="32" r="9" fill="#000" fill-opacity="0"/>
      ${Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const r = i % 2 ? 20 : 25;
        return `<circle cx="${(32 + Math.cos(a) * r).toFixed(1)}" cy="${(32 + Math.sin(a) * r).toFixed(1)}" r="2.6" fill="#000"/>`;
      }).join("")}
      <circle cx="32" cy="32" r="31" fill="none" stroke="#6b7280" stroke-width="2"/>
    </svg>`,
    { size: 128 },
  );
  // alpha-less holes: draw holes via transparency using mask instead
  const DISC_T = svg(
    `<svg viewBox="0 0 64 64">
      <defs><mask id="m"><rect width="64" height="64" fill="#fff"/>
      ${Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const r = i % 2 ? 20 : 25;
        return `<circle cx="${(32 + Math.cos(a) * r).toFixed(1)}" cy="${(32 + Math.sin(a) * r).toFixed(1)}" r="2.8" fill="#000"/>`;
      }).join("")}
      </mask></defs>
      <circle cx="32" cy="32" r="31" fill="#aeb6c4" mask="url(#m)"/>
      <circle cx="32" cy="32" r="31" fill="none" stroke="#6b7280" stroke-width="2"/>
    </svg>`,
    { size: 128 },
  );
  void DISC;
  const FLAP = svg(
    `<svg viewBox="0 0 48 64">
      <rect width="48" height="64" fill="#15161a"/>
      <rect x="2" y="2" width="44" height="60" fill="none" stroke="#e7b814" stroke-width="2"/>
      <path d="M2 50 L14 40 L26 50 L38 40 L46 46 L46 58 L2 58Z" fill="#e7b814"/>
      <path d="M2 56 L14 46 L26 56 L38 46 L46 52" fill="none" stroke="#15161a" stroke-width="3"/>
      <path d="M12 8 L24 24 L36 8 L36 22 L24 34 L12 22Z" fill="#ff2bb8"/>
      <circle cx="19" cy="17" r="2" fill="#15161a"/><circle cx="29" cy="17" r="2" fill="#15161a"/>
    </svg>`,
    { size: 128 },
  );

  // ---------- geometry helpers (wheel-local: axis Y, outward = +Y) ----------
  const treadGeo = () => {
    const parts: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 12; k++) {
      for (const row of [-1, 1]) {
        const a = (k * 30 + 15 + (row > 0 ? 0 : 0)) * (Math.PI / 180);
        const g = new THREE.BoxGeometry(0.15, 0.2, 0.045);
        g.rotateY(a);
        g.translate(Math.sin(a) * 0.598, row * 0.13, Math.cos(a) * 0.598);
        parts.push(g);
      }
      // center rib
      const a = (k * 30 + 15) * (Math.PI / 180);
      const g = new THREE.BoxGeometry(0.1, 0.06, 0.04);
      g.rotateY(a);
      g.translate(Math.sin(a) * 0.6, 0, Math.cos(a) * 0.6);
      parts.push(g);
    }
    return mergeGeometries(parts)!;
  };
  const spokeGeo = () => {
    const parts: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const g = new THREE.BoxGeometry(0.09, 0.035, 0.34);
      g.translate(0, 0, 0.2);
      g.rotateY(a);
      parts.push(g);
    }
    return mergeGeometries(parts)!;
  };
  const lugGeo = () => {
    const parts: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const g = new THREE.CylinderGeometry(0.026, 0.026, 0.04, 6);
      g.translate(Math.sin(a) * 0.185, 0, Math.cos(a) * 0.185);
      parts.push(g);
    }
    return mergeGeometries(parts)!;
  };
  const TREAD = treadGeo();
  const SPOKES = spokeGeo();
  const LUGS = lugGeo();
  const TIRE = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 12);
  const CAP = new THREE.CylinderGeometry(0.12, 0.14, 0.1, 8);
  const WELL = new THREE.CylinderGeometry(0.42, 0.42, 0.02, 12);
  const BRAKE = new THREE.CylinderGeometry(0.3, 0.3, 0.025, 16);
  const CALIPER = new THREE.BoxGeometry(0.12, 0.05, 0.2);
  const RIMLIP: [number, number][] = [
    [0.34, 0],
    [0.46, 0],
    [0.46, 0.055],
    [0.34, 0.04],
  ];
  const RINGSIDE: [number, number][] = [
    [0.47, 0],
    [0.51, 0],
    [0.51, 0.012],
    [0.47, 0.012],
  ];
  const GLOWRING = new THREE.TorusGeometry(0.095, 0.014, 4, 12).rotateX(Math.PI / 2);
  const GLYPH_PLANE = new THREE.PlaneGeometry(0.15, 0.15);
  const FLAPG = new THREE.BoxGeometry(0.32, 0.36, 0.03);

  AXLES.forEach((az, ai) => {
    [1, -1].forEach((s, si) => {
      const name = NAMES[ai][si];
      const bone = J[name];
      const cx = s * CX;
      const C = new THREE.Vector3(cx, CY, az);
      const ax = new THREE.Vector3(s, 0, 0);
      const at = (d: number) => C.clone().addScaledVector(ax, d);
      const dir: [number, number, number] = [s, 0, 0];

      const tirePaint = paint((p, n) => {
        const r = Math.hypot(p.y - CY, p.z - az);
        let c = mix(P.tire, "#24262b", noise(p, 0.12, ai * 7 + si));
        c = mix(c, "#4a3a2c", 0.55 * smoothstep(0.3, 0.05, p.y) * noise(p, 0.07, 3));
        c = mix(c, "#1d1f24", 0.3 * smoothstep(0.45, 0.62, r));
        return mix(c, "#3a3d44", 0.2 * Math.max(0, n.y));
      });
      const rimPaint = paint((p, n) => {
        const r = Math.hypot(p.y - CY, p.z - az);
        let c = mix(P.rim, "#a9b2c2", noise(p, 0.05, 5));
        c = mix(c, P.hullDark, 0.55 * smoothstep(0.3, 0.46, r) * (0.5 + noise(p, 0.04, 9)));
        c = mix(c, "#3c3f48", 0.25 * (1 - Math.max(0, n.y)));
        return c;
      });

      const opt = (d: number, extra: object = {}) => ({ bone, at: at(d), dir, ...extra });
      b.part(TIRE, tirePaint, opt(0, { name: `tire.${name}` }));
      b.part(TREAD, tirePaint, opt(0, { name: `tread.${name}` }));
      for (const o of [1, -1]) {
        b.lathe(RINGSIDE, {
          at: at(o * 0.25 - (o < 0 ? 0.012 : 0)),
          axis: [o * s, 0, 0],
          segments: 12,
          bone,
          color: P.trim,
          name: `sidewall.${name}.${o}`,
        });
      }
      b.part(WELL, P.hullDark, opt(0.255, { name: `well.${name}` }));
      b.lathe(RIMLIP, {
        at: at(0.225),
        axis: dir,
        segments: 12,
        bone,
        color: rimPaint,
        name: `rimlip.${name}`,
      });
      b.part(SPOKES, rimPaint, opt(0.265, { name: `spokes.${name}` }));
      b.part(BRAKE, "#ffffff", opt(0.215, { texture: DISC_T, name: `brake.${name}` }));
      // caliper at the top of the disc
      const ang = Math.PI * 0.5;
      b.part(CALIPER, P.warnRed, {
        bone,
        at: C.clone().add(new THREE.Vector3(s * 0.245, Math.sin(ang) * 0.27, Math.cos(ang) * 0.0)),
        dir,
        name: `caliper.${name}`,
      });
      b.part(LUGS, P.rim, opt(0.29, { name: `lugs.${name}` }));
      b.part(CAP, rimPaint, opt(0.285, { name: `cap.${name}` }));
      glow(
        b.part(GLOWRING, P.neonCyan, opt(0.336, { name: `ring.${name}` })),
        1.6,
      );
      glow(
        b.part(GLYPH_PLANE, "#ffffff", {
          bone,
          at: at(0.339),
          dir,
          axis: "z",
          texture: GLYPH,
          name: `glyph.${name}`,
        }),
        1.4,
      );
      // mud flap, behind the tire, on the body
      b.part(FLAPG, "#ffffff", {
        bone: J.body,
        at: [s * CX, 0.43, az - 0.7],
        texture: FLAP,
        name: `flap.${name}`,
      });
    });
  });
  void P;
}
```

<!-- call: bed -->

```ts
import * as THREE from "three";
import { paint, svg, rng, noise } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildBed({ b, J, P, M }: Ctx) {
  const body = J.body;
  const ramp = J.rampHinge;
  const R = rng(77);
  const DECK = M.bedDeck[1]; // 1.45 top of deck
  const TR = M.turretRing;

  // ---------- paints ----------
  const armorPaint = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.42, rivets: 0.05 });
  const hullPaint = panelled(P.hull, { size: 0.5, rivets: 0.06 });
  const grip = paint((p, n) => {
    if (n.y < 0.6) return P.hullDark;
    const u = ((p.x * 12) % 1 + 1) % 1;
    const v = ((p.z * 12) % 1 + 1) % 1;
    const diamond = Math.abs(u - 0.5) + Math.abs(v - 0.5) < 0.34;
    const grime = noise(p, 0.5, 4);
    const base = diamond ? "#3b414e" : "#1b1f27";
    return grime > 0.68 ? P.rust : base;
  });
  const crateOlive = paint((p, _n) => (noise(p, 0.12, 9) > 0.62 ? "#3d4a2f" : P.olive));
  const barrelPaint = paint((p, n) => {
    if (n.y > 0.9) return P.rim;
    return Math.abs(((p.y * 9) % 1)) < 0.08 ? P.hullDark : noise(p, 0.15, 3) > 0.66 ? "#3d4a2f" : P.olive;
  });

  // ---------- textures ----------
  const HAZ = svg(
    `<svg viewBox="0 0 128 16" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="16" fill="#e7b814"/>${Array.from(
      { length: 12 },
      (_, i) => `<polygon points="${i * 12 - 4},16 ${i * 12 + 2},16 ${i * 12 + 14},0 ${i * 12 + 8},0" fill="#111"/>`,
    ).join("")}<rect width="128" height="16" fill="none" stroke="#111" stroke-width="1.5"/></svg>`,
    { size: 256 },
  );
  const SERIAL = svg(
    `<svg viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg"><text x="4" y="18" font-family="monospace" font-weight="bold" font-size="16" fill="#e8e4cf">WH-2077/C7</text><text x="4" y="35" font-family="monospace" font-size="11" fill="#e7b814">CARGO // HAZMAT-4</text><rect x="118" y="4" width="38" height="12" fill="none" stroke="#e8e4cf" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  const STENCIL = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="56" height="56" fill="none" stroke="#e7b814" stroke-width="4"/><path d="M12 12 L52 52 M52 12 L12 52" stroke="#e7b814" stroke-width="3"/><text x="32" y="38" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#e8e4cf">AMMO</text></svg>`,
    { size: 128 },
  );
  const CHEV = svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="64" fill="#1a1d24"/>${Array.from(
      { length: 4 },
      (_, i) => `<path d="M${6 + i * 32} 8 L${26 + i * 32} 32 L${6 + i * 32} 56 L${16 + i * 32} 56 L${36 + i * 32} 32 L${16 + i * 32} 8Z" fill="#e7b814"/>`,
    ).join("")}<rect x="2" y="2" width="124" height="60" fill="none" stroke="#e7b814" stroke-width="3"/></svg>`,
    { size: 256 },
  );
  const RADIATION = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="28" fill="#e7b814" stroke="#111" stroke-width="3"/><circle cx="32" cy="32" r="5" fill="#111"/><path d="M32 32 L32 8 A24 24 0 0 1 52.8 20Z M32 32 L52.8 44 A24 24 0 0 1 11.2 44Z M32 32 L11.2 20 A24 24 0 0 1 32 8Z" fill="#111" opacity="0.9"/></svg>`,
    { size: 128 },
  );

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: number[], rot?: number[], bone: any = body) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot });
  const cyl = (r0: number, r1: number, h: number, seg: number, color: any, at: number[], dir: number[], bone: any = body) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { bone, at, dir, flat: true });
  const decal = (tex: any, w: number, h: number, at: number[], dir: number[], bone: any = body, up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, up, axis: "z", texture: tex });

  // ---------- deck ----------
  box(2.9, 0.12, 4.5, grip, [0, DECK - 0.06, -1.75]);
  box(3.0, 0.1, 4.5, P.hullDark, [0, DECK - 0.17, -1.75]);
  // deck cross ribs & longitudinal rails
  for (let i = 0; i < 8; i++) box(2.8, 0.03, 0.08, P.hullDark, [0, DECK + 0.012, 0.2 - i * 0.6]);
  for (const s of [1, -1]) box(0.08, 0.04, 4.4, P.trim, [s * 0.95, DECK + 0.015, -1.8]);

  // ---------- side walls ----------
  for (const s of [1, -1]) {
    const wx = s * 1.43;
    box(0.14, 0.6, 4.35, armorPaint, [wx, DECK + 0.3, -1.85]);
    // upper angled armor
    box(0.12, 0.35, 4.35, hullPaint, [s * 1.4, DECK + 0.76, -1.85], [0, 0, s * 12]);
    box(0.2, 0.07, 4.4, P.hullDark, [s * 1.36, DECK + 0.96, -1.85]);
    // cargo ribs on the outside
    for (let i = 0; i < 7; i++) {
      const z = 0.1 - i * 0.68;
      box(0.06, 0.9, 0.1, P.armor, [s * 1.51, DECK + 0.45, z]);
      box(0.1, 0.06, 0.14, P.trim, [s * 1.51, DECK + 0.92, z]);
    }
    // neon skirt strip
    glow(box(0.04, 0.04, 4.2, s > 0 ? P.neonCyan : P.neonMagenta, [s * 1.5, DECK - 0.06, -1.85]), 1.6);
    glow(box(0.04, 0.03, 4.0, s > 0 ? P.neonMagenta : P.neonCyan, [s * 1.5, DECK - 0.14, -1.85]), 1.4);
    // hazard stripe band
    decal(HAZ, 4.1, 0.12, [s * 1.505, DECK + 0.62, -1.85], [s, 0, 0], body, [0, 0, 1]);
    // serial stencil
    decal(SERIAL, 0.9, 0.22, [s * 1.505, DECK + 0.34, -2.9], [s, 0, 0]);
    decal(RADIATION, 0.3, 0.3, [s * 1.505, DECK + 0.34, -0.9], [s, 0, 0]);
    // tie-down rings on wall top
    for (const z of [-0.4, -1.8, -3.2]) {
      b.part(new THREE.TorusGeometry(0.07, 0.015, 5, 8), P.brass, { bone: body, at: [s * 1.3, DECK + 0.98, z], rotation: [90, 0, 0], flat: true });
      box(0.1, 0.03, 0.1, P.brass, [s * 1.3, DECK + 0.97, z]);
    }
    // corner posts
    box(0.2, 1.0, 0.2, P.armor, [s * 1.42, DECK + 0.5, -4.0]);
    // tail lights
    glow(box(0.16, 0.22, 0.05, P.warnRed, [s * 1.35, DECK + 0.45, -4.12]), 1.8);
    box(0.22, 0.28, 0.04, P.hullDark, [s * 1.35, DECK + 0.45, -4.09]);
    glow(box(0.1, 0.06, 0.05, P.lampWhite, [s * 1.35, DECK + 0.2, -4.12]), 1.2);
  }
  // front wall (against cab back)
  box(2.9, 1.0, 0.14, armorPaint, [0, DECK + 0.5, 0.45]);
  box(2.9, 0.08, 0.2, P.trim, [0, DECK + 1.02, 0.45]);
  // vent slots in front wall
  for (let i = 0; i < 5; i++) box(0.4, 0.05, 0.03, P.hullDark, [-0.9 + i * 0.45, DECK + 0.3, 0.37]);

  // fuel filler cap (left side)
  cyl(0.11, 0.11, 0.06, 8, P.brass, [1.56, DECK + 0.45, -2.5], [1, 0, 0]);
  cyl(0.06, 0.06, 0.08, 6, P.hullDark, [1.58, DECK + 0.45, -2.5], [1, 0, 0]);

  // ---------- turret ring mount ----------
  cyl(0.8, 0.85, DECK - 1.45 + 0.35, 12, armorPaint, [TR[0], DECK + 0.175, TR[2]], [0, 1, 0]);
  cyl(0.78, 0.78, 0.04, 12, P.trim, [TR[0], DECK + 0.36, TR[2]], [0, 1, 0]);
  b.lathe(
    [[0.55, 0], [0.8, 0], [0.8, 0.2], [0.72, 0.26], [0.55, 0.2]],
    { at: [TR[0], DECK + 0.38, TR[2]], bone: body, color: metal("steel"), segments: 16 },
  );
  const teeth = 20;
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    box(0.08, 0.1, 0.07, P.rim, [TR[0] + Math.sin(a) * 0.82, DECK + 0.5, TR[2] + Math.cos(a) * 0.82], [0, (a * 180) / Math.PI, 0]);
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    glow(box(0.06, 0.04, 0.06, i % 2 ? P.neonCyan : P.neonMagenta, [TR[0] + Math.sin(a) * 0.6, DECK + 0.6, TR[2] + Math.cos(a) * 0.6]), 1.8);
  }
  // support braces from ring to walls
  for (const s of [1, -1]) box(0.6, 0.12, 0.12, P.armor, [s * 1.0, DECK + 0.1, TR[2]]);

  // ---------- roll cage hoop behind cab ----------
  const hz = 0.25;
  for (const s of [1, -1]) {
    b.rod([s * 1.32, DECK, hz], [s * 1.32, DECK + 1.1, hz], 0.045, P.armor, { bone: body, sides: 6 });
    b.rod([s * 1.32, DECK + 1.1, hz], [s * 1.1, DECK + 1.15, hz], 0.045, P.armor, { bone: body, sides: 6 });
    b.rod([s * 1.32, DECK + 0.1, hz - 0.1], [s * 1.32, DECK + 0.9, hz + 0.0], 0.03, P.trim, { bone: body, sides: 5 });
  }
  b.rod([1.1, DECK + 1.15, hz], [-1.1, DECK + 1.15, hz], 0.05, P.armor, { bone: body, sides: 6 });
  b.rod([-1.3, DECK + 0.05, hz], [0, DECK + 1.15, hz], 0.025, P.hullDark, { bone: body, sides: 5 });
  b.rod([1.3, DECK + 0.05, hz], [0, DECK + 1.15, hz], 0.025, P.hullDark, { bone: body, sides: 5 });
  // spotlight on hoop
  box(0.14, 0.14, 0.14, P.hullDark, [0.7, DECK + 1.25, hz + 0.0]);
  cyl(0.11, 0.09, 0.16, 8, P.hull, [0.7, DECK + 1.3, hz - 0.1], [0, 0.2, -1]);
  glow(cyl(0.085, 0.085, 0.03, 8, P.lampWhite, [0.7, DECK + 1.33, hz - 0.2], [0, 0.2, -1]), 2);
  cyl(0.11, 0.09, 0.16, 8, P.hull, [-0.7, DECK + 1.3, hz + 0.1], [0, 0.2, 1]);
  glow(cyl(0.085, 0.085, 0.03, 8, P.lampWhite, [-0.7, DECK + 1.33, hz + 0.2], [0, 0.2, 1]), 2);

  // ---------- cargo ----------
  const crate = (x: number, z: number, y0: number, s: number, rotY: number) => {
    const y = y0 + s / 2;
    box(s, s, s, crateOlive, [x, y, z], [0, rotY, 0]);
    // straps
    for (const k of [-0.28, 0.28]) {
      box(s * 1.03, s * 1.03, s * 0.08, P.trim, [x, y, z], [0, rotY, 0]);
      break;
    }
    const c = Math.cos((rotY * Math.PI) / 180), sn = Math.sin((rotY * Math.PI) / 180);
    const fx = x + sn * (s / 2 + 0.006), fz = z + c * (s / 2 + 0.006);
    decal(STENCIL, s * 0.55, s * 0.55, [fx, y, fz], [sn, 0, c]);
    // status light
    const lx = x + sn * (s / 2) + c * s * 0.38, lz = z + c * (s / 2) - sn * s * 0.38;
    glow(box(0.06, 0.06, 0.04, R() > 0.5 ? P.neonCyan : P.warnRed, [lx, y + s * 0.38, lz], [0, rotY, 0]), 2);
    // corner brackets
    for (const sx of [-1, 1]) for (const sy of [-1, 1])
      box(0.06, 0.06, 0.06, P.hullDark, [x + c * sx * s * 0.5, y + sy * s * 0.5, z - sn * sx * s * 0.5], [0, rotY, 0]);
  };
  crate(-0.7, -3.2, DECK, 0.75, 4);
  crate(0.55, -3.3, DECK, 0.8, -6);
  crate(-0.6, -3.15, DECK + 0.75, 0.6, 12);
  crate(1.0, -2.55, DECK, 0.5, 0);
  crate(-1.0, -0.25, DECK, 0.55, -3);
  crate(-0.35, -0.3, DECK, 0.5, 8);

  const barrel = (x: number, z: number) => {
    cyl(0.22, 0.22, 0.7, 8, barrelPaint, [x, DECK + 0.35, z], [0, 1, 0]);
    for (const dy of [0.12, 0.58]) cyl(0.235, 0.235, 0.04, 8, P.hullDark, [x, DECK + dy, z], [0, 1, 0]);
    cyl(0.1, 0.1, 0.05, 6, P.brass, [x, DECK + 0.72, z], [0, 1, 0]);
    glow(box(0.05, 0.05, 0.03, P.trim, [x + 0.05, DECK + 0.4, z + 0.22]), 1.6);
  };
  barrel(0.9, -0.3);
  barrel(0.45, -0.28);
  barrel(1.0, -1.0);
  barrel(-0.05, -3.85 + 0.2);
  // lashing strap across barrels
  box(0.9, 0.04, 0.05, P.trim, [0.9, DECK + 0.55, -0.3 + 0.0]);

  // ---------- tool rack (left inner wall) ----------
  box(0.05, 0.5, 1.0, P.hullDark, [1.33, DECK + 0.55, -1.0]);
  for (let i = 0; i < 3; i++) {
    const z = -0.7 - i * 0.28;
    b.rod([1.28, DECK + 0.3, z], [1.28, DECK + 0.78, z], 0.02, i === 1 ? P.brass : P.rim, { bone: body, sides: 5 });
    box(0.08, 0.1, 0.06, i === 2 ? P.warnRed : P.rim, [1.28, DECK + 0.8, z]);
  }
  // shovel
  box(0.04, 0.2, 0.14, P.rim, [1.28, DECK + 0.25, -1.6]);
  b.rod([1.28, DECK + 0.35, -1.6], [1.28, DECK + 0.9, -1.6], 0.018, P.rust, { bone: body, sides: 5 });
  // clamps
  for (const y of [0.4, 0.7]) box(0.07, 0.04, 1.3, P.trim, [1.31, DECK + y, -1.1]);

  // ---------- ramp / tailgate on rampHinge ----------
  const rz = -4.02;
  box(2.9, 0.95, 0.1, hullPaint, [0, 1.5, rz], undefined, ramp);
  box(2.9, 0.1, 0.14, P.trim, [0, 1.98, rz], undefined, ramp);
  box(2.9, 0.1, 0.14, P.hullDark, [0, 1.03, rz], undefined, ramp);
  for (const s of [-1, 1]) {
    box(0.12, 0.95, 0.14, P.armor, [s * 1.4, 1.5, rz], undefined, ramp);
    cyl(0.07, 0.07, 0.18, 6, P.brass, [s * 1.2, 1.12, rz - 0.07], [1, 0, 0], ramp);
    box(0.1, 0.1, 0.08, P.rim, [s * 1.0, 1.9, rz - 0.08], undefined, ramp); // latch
  }
  decal(CHEV, 2.3, 0.6, [0, 1.52, rz - 0.056], [0, 0, -1], ramp);
  box(2.4, 0.025, 0.02, P.hullDark, [0, 1.84, rz - 0.06], undefined, ramp);
  // ramp neon edge
  glow(box(2.6, 0.03, 0.03, P.neonMagenta, [0, 1.92, rz - 0.08], undefined, ramp), 1.6);

  // ---------- rear bumper, hitch, exhaust ----------
  const BZ = M.rearBumper[2];
  const BY = M.rearBumper[1];
  box(3.0, 0.3, 0.3, armorPaint, [0, BY, BZ - 0.12]);
  box(3.0, 0.06, 0.34, P.trim, [0, BY + 0.17, BZ - 0.12]);
  for (const s of [1, -1]) {
    decal(HAZ, 0.9, 0.12, [s * 1.0, BY, BZ - 0.28], [0, 0, -1]);
    box(0.2, 0.2, 0.3, P.hullDark, [s * 1.35, BY - 0.12, BZ - 0.05]);
  }
  // tow hitch
  box(0.3, 0.2, 0.3, P.hullDark, [0, BY - 0.02, BZ - 0.38]);
  cyl(0.06, 0.06, 0.16, 8, P.rim, [0, BY + 0.1, BZ - 0.42], [0, 1, 0]);
  b.part(new THREE.SphereGeometry(0.09, 8, 6), P.rim, { bone: body, at: [0, BY + 0.2, BZ - 0.42] });
  // tow rings
  for (const s of [1, -1]) b.part(new THREE.TorusGeometry(0.08, 0.02, 5, 8), P.brass, { bone: body, at: [s * 0.6, BY - 0.02, BZ - 0.3], flat: true });
  // exhaust pipes
  for (const s of [1, -1]) {
    const ex = s * 0.75;
    cyl(0.1, 0.1, 0.5, 8, metal("steel"), [ex, 1.15, -3.95], [0, 0.15, -1]);
    cyl(0.075, 0.075, 0.06, 8, P.hullDark, [ex, 1.14, -4.22], [0, 0.15, -1]);
    cyl(0.11, 0.11, 0.05, 8, P.brass, [ex, 1.16, -3.78], [0, 0.15, -1]);
    glow(cyl(0.05, 0.05, 0.02, 8, P.rust, [ex, 1.14, -4.2], [0, 0.15, -1]), 1.3);
    box(0.1, 0.35, 0.1, P.armor, [ex, 1.3, -3.8]);
  }
  // license plate
  box(0.5, 0.14, 0.02, P.lampWhite, [0, BY + 0.04, BZ - 0.28]);
  decal(SERIAL, 0.46, 0.12, [0, BY + 0.04, BZ - 0.295], [0, 0, -1]);

  // ---------- roof-of-bed status / misc ----------
  for (let i = 0; i < 4; i++)
    glow(box(0.08, 0.04, 0.04, i % 2 ? P.neonCyan : P.neonMagenta, [-0.9 + i * 0.12, DECK + 1.02, 0.44]), 2);
  // wall-top light strips
  for (const s of [1, -1]) glow(box(0.03, 0.03, 4.0, P.lampWhite, [s * 1.43, DECK + 1.0, -1.85]), 0.9);
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, rng } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildTurret({ b, J, P, M }: Ctx) {
  const Y = J.turretYaw;
  const T = J.turretPitch;
  const cx = M.turretRing[0];
  const cz = M.turretRing[2];
  const R = rng(77);

  // ---------- paints & textures ----------
  const HULLP = panelled(
    paint((p, n) => mix(mix(P.hull, P.armor, noise(p, 0.25, 3)), P.hullDark, 0.35 * Math.max(0, -n.y))),
    { size: 0.2, rivets: 0.04 },
  );
  const ARMORP = panelled(paint((p) => mix(P.armor, P.hull, noise(p, 0.18, 8))), { size: 0.16, rivets: 0.035 });
  const GUNMETAL = metal("blued", { tarnish: 0.3 });
  const BRASSP = metal("brass", { tarnish: 0.4 });

  const HAZARD = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#e7b814"/>
    ${Array.from({ length: 9 }, (_, i) => `<polygon points="${i * 8 - 4},16 ${i * 8},16 ${i * 8 + 8},0 ${i * 8 + 4},0" fill="#16181d"/>`).join("")}
    <rect width="64" height="16" fill="none" stroke="#16181d" stroke-width="1.5"/></svg>`,
    { size: 128 },
  );
  const RETICLE = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="31" fill="#04202b"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="#2ff3ff" stroke-width="2.5"/>
    <circle cx="32" cy="32" r="8" fill="none" stroke="#2ff3ff" stroke-width="2"/>
    <path d="M32 2V20M32 44V62M2 32H20M44 32H62" stroke="#2ff3ff" stroke-width="3"/>
    <circle cx="32" cy="32" r="2.5" fill="#ff2bb8"/></svg>`,
    { size: 128 },
  );
  const KILLS = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="40" rx="3" fill="#161a22"/>
    ${[0, 1].map((r) => [0, 1, 2, 3].map((c) => `<path d="M${6 + c * 8} ${6 + r * 10}v7M${8 + c * 8} ${6 + r * 10}v7" stroke="#e8e8e0" stroke-width="1.6"/>`).join("")).join("")}
    <path d="M40 8h16v10h-16z" fill="#d8262e"/><path d="M44 12h3v3h-3zM50 12h3v3h-3z" fill="#161a22"/><path d="M45 18v3h6v-3" fill="#161a22"/>
    <path d="M6 30h52" stroke="#e7b814" stroke-width="2" stroke-dasharray="6 3"/></svg>`,
    { size: 128 },
  );
  const WOLF = svg(
    `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M4 6L16 14H32L44 6L40 26L30 42H18L8 26Z" fill="#161a22" stroke="#e7b814" stroke-width="2"/>
    <path d="M14 22L20 26L22 22M34 22L28 26L26 22" stroke="#2ff3ff" stroke-width="3" fill="none"/><path d="M20 34H28L24 40Z" fill="#e7b814"/></svg>`,
    { size: 96 },
  );

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const add = (geo: THREE.BufferGeometry, color: any, at: number[], bone: any, o: any = {}) =>
    b.part(geo, color, { bone, at, flat: true, ...o });
  const decal = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], bone: any, lit = false) => {
    const part = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });
    return lit ? glow(part, 1.3) : part;
  };
  const bucket = new Map<string, { bone: any; color: string; geos: THREE.BufferGeometry[] }>();
  const mg = (bone: any, color: string, geo: THREE.BufferGeometry, pos: number[], rot: number[] = [0, 0, 0]) => {
    const key = bone.name + color;
    if (!bucket.has(key)) bucket.set(key, { bone, color, geos: [] });
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(...pos),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot.map((d) => (d * Math.PI) / 180) as [number, number, number])),
      new THREE.Vector3(1, 1, 1),
    );
    bucket.get(key)!.geos.push(geo.clone().applyMatrix4(m));
  };

  // ---------- yaw base ----------
  add(cyl(0.7, 0.7, 0.12, 12), P.hullDark, [cx, 2.06, cz], Y);
  add(cyl(0.64, 0.64, 0.04, 12), P.trim, [cx, 2.14, cz], Y);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    mg(Y, P.brass, cyl(0.03, 0.03, 0.05, 6), [cx + Math.sin(a) * 0.67, 2.1, cz + Math.cos(a) * 0.67]);
  }
  // housing: 8-sided, flats on axes
  add(cyl(0.62, 0.66, 0.4, 8), HULLP, [cx, 2.35, cz], Y, { rotation: [0, 22.5, 0] });
  add(cyl(0.5, 0.58, 0.07, 8), ARMORP, [cx, 2.585, cz], Y, { rotation: [0, 22.5, 0] });
  // rear bustle with vents
  add(box(0.9, 0.42, 0.4), HULLP, [cx, 2.36, cz - 0.62], Y);
  for (let i = 0; i < 4; i++) add(box(0.7, 0.025, 0.02), P.hullDark, [cx, 2.22 + i * 0.07, cz - 0.83], Y);
  // front brow wedge
  add(box(0.8, 0.12, 0.2), ARMORP, [cx, 2.56, cz + 0.52], Y, { rotation: [-18, 0, 0] });
  // rivets around the deck
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    mg(Y, P.brass, new THREE.SphereGeometry(0.018, 5, 4), [cx + Math.sin(a) * 0.46, 2.625, cz + Math.cos(a) * 0.46]);
  }
  // hazard & decals on housing
  decal(HAZARD, 0.56, 0.1, [cx, 2.18, cz + 0.577], [0, 0, 1], Y);
  for (const s of [1, -1]) {
    decal(HAZARD, 0.4, 0.07, [cx + s * 0.579, 2.18, cz + 0.05], [s, 0, 0], Y);
    decal(HAZARD, 0.4, 0.07, [cx + s * 0.579, 2.5, cz + 0.05], [s, 0, 0], Y);
  }
  decal(KILLS, 0.4, 0.25, [cx + 0.582, 2.34, cz + 0.05], [1, 0, 0], Y);
  decal(WOLF, 0.22, 0.22, [cx - 0.582, 2.34, cz + 0.05], [-1, 0, 0], Y);
  // status LEDs on bustle top
  const ledCols = [P.neonCyan, P.neonMagenta, P.warnRed, P.neonCyan, P.neonMagenta];
  ledCols.forEach((c, i) => glow(add(box(0.06, 0.04, 0.06), c, [cx - 0.3 + i * 0.15, 2.59, cz - 0.7], Y), 1.6));

  // ---------- cheeks / yoke ----------
  for (const s of [1, -1]) {
    add(box(0.12, 0.55, 0.7), HULLP, [cx + s * 0.42, 2.78, cz], Y);
    add(box(0.14, 0.12, 0.76), P.trim, [cx + s * 0.42, 2.5, cz], Y);
    add(cyl(0.1, 0.1, 0.16, 8), P.hullDark, [cx + s * 0.42, 2.8, cz], Y, { rotation: [0, 0, 90] });
    glow(add(box(0.03, 0.03, 0.03), s > 0 ? P.neonCyan : P.neonMagenta, [cx + s * 0.5, 2.95, cz + 0.2], Y), 1.8);
  }
  add(cyl(0.05, 0.05, 0.96, 8), GUNMETAL, [cx, 2.8, cz], T, { rotation: [0, 0, 90] }); // trunnion axle

  // ---------- twin autocannon on pitch ----------
  add(box(0.62, 0.38, 0.72), GUNMETAL, [cx, 2.78, cz - 0.35], T);
  add(box(0.5, 0.1, 0.5), P.hullDark, [cx, 3.0, cz - 0.35], T); // top cover
  add(box(0.66, 0.06, 0.2), P.trim, [cx, 2.97, cz - 0.62], T);
  // mantlet
  add(box(0.66, 0.42, 0.1), ARMORP, [cx, 2.78, cz + 0.28], T, { rotation: [-8, 0, 0] });
  decal(HAZARD, 0.6, 0.07, [cx, 2.62, cz + 0.335], [0, 0, 1], T);
  for (const s of [1, -1]) {
    const bx = cx + s * 0.17;
    add(cyl(0.085, 0.085, 0.62, 8), GUNMETAL, [bx, 2.78, cz + 0.07 + 0.31 - 0.31 + 0.31], T, { rotation: [90, 0, 0] }); // shroud
    add(cyl(0.04, 0.04, 0.9, 6), P.hullDark, [bx, 2.78, cz + 0.17], T, { rotation: [90, 0, 0] }); // barrel
    add(box(0.18, 0.18, 0.1), P.hullDark, [bx, 2.78, cz + 1.15], T); // muzzle brake
    for (const k of [1, -1]) {
      mg(T, P.neonCyan, box(0.01, 0.1, 0.012), [bx + k * 0.091, 2.78, cz + 1.12]);
    }
    mg(T, P.rust, box(0.2, 0.02, 0.1), [bx, 2.875, cz + 1.15]);
    // perforations on shroud
    for (let z = 0; z < 5; z++)
      for (let a = 0; a < 4; a++) {
        const ang = (a / 4) * Math.PI * 2 + Math.PI / 4;
        mg(T, "#000000", box(0.035, 0.035, 0.035), [
          bx + Math.sin(ang) * 0.082,
          2.78 + Math.cos(ang) * 0.082,
          cz + 0.12 + z * 0.1,
        ], [0, 0, (-ang * 180) / Math.PI]);
      }
    // shroud collars
    for (const z of [0.0, 0.3]) mg(T, P.trim, cyl(0.095, 0.095, 0.03, 8), [bx, 2.78, cz + 0.02 + z], [90, 0, 0]);
  }
  // ejection ports + side bolts
  for (const s of [1, -1]) for (let i = 0; i < 4; i++) mg(T, P.brass, new THREE.SphereGeometry(0.016, 5, 4), [cx + s * 0.315, 2.68 + (i % 2) * 0.2, cz - 0.15 - Math.floor(i / 2) * 0.35]);

  // ---------- ammo box (right) + belt ----------
  add(box(0.3, 0.3, 0.44), P.olive, [cx - 0.68, 2.7, cz + 0.2], T);
  add(box(0.32, 0.05, 0.1), P.trim, [cx - 0.68, 2.86, cz + 0.2], T);
  add(box(0.04, 0.05, 0.1), P.hullDark, [cx - 0.68, 2.9, cz + 0.2], T);
  decal(HAZARD, 0.26, 0.05, [cx - 0.84, 2.62, cz + 0.2], [-1, 0, 0], T);
  glow(add(box(0.03, 0.03, 0.03), P.neonCyan, [cx - 0.84, 2.78, cz + 0.05], T), 1.8);
  glow(add(box(0.03, 0.03, 0.03), P.warnRed, [cx - 0.84, 2.78, cz + 0.12], T), 1.8);
  const belt = b.catmull ? null : null;
  const beltPath = new THREE.CubicBezierCurve3(
    new THREE.Vector3(cx - 0.62, 2.88, cz + 0.2),
    new THREE.Vector3(cx - 0.55, 3.1, cz + 0.1),
    new THREE.Vector3(cx - 0.4, 3.1, cz - 0.05),
    new THREE.Vector3(cx - 0.28, 2.95, cz - 0.1),
  );
  for (let i = 0; i < 9; i++) {
    const p = beltPath.getPoint(i / 8);
    const t = beltPath.getTangent(i / 8);
    mg(T, P.brass, box(0.05, 0.035, 0.04), [p.x, p.y, p.z], [0, 0, (Math.atan2(t.y, t.x) * 180) / Math.PI]);
    mg(T, P.warnRed, cyl(0.014, 0.014, 0.05, 5), [p.x, p.y + 0.03, p.z], [90, 0, 0]);
  }

  // ---------- rocket pod (left) ----------
  const px = cx + 0.72;
  const py = 2.78;
  add(box(0.42, 0.7, 0.95), HULLP, [px, py, cz + 0.52], T);
  add(box(0.44, 0.05, 0.97), P.trim, [px, py + 0.35, cz + 0.52], T);
  add(box(0.2, 0.15, 0.4), ARMORP, [cx + 0.55, py, cz + 0.1], T); // bracket
  for (let c = 0; c < 2; c++)
    for (let r = 0; r < 3; r++) {
      const tx = px - 0.085 + c * 0.17;
      const ty = py - 0.21 + r * 0.21;
      add(cyl(0.075, 0.075, 0.12, 8), P.hullDark, [tx, ty, cz + 1.04], T, { rotation: [90, 0, 0] });
      add(cyl(0.058, 0.058, 0.04, 8), "#000000", [tx, ty, cz + 1.1], T, { rotation: [90, 0, 0] });
      add(new THREE.ConeGeometry(0.055, 0.14, 8), P.warnRed, [tx, ty, cz + 1.12], T, { rotation: [90, 0, 0] });
    }
  decal(HAZARD, 0.38, 0.06, [px, py - 0.355, cz + 0.52], [0, -1, 0], T);
  glow(add(box(0.04, 0.04, 0.04), P.warnRed, [px, py + 0.4, cz + 0.2], T), 1.8);

  // ---------- sensor head (on yaw, rear right) ----------
  const sx = cx - 0.45;
  const sz = cz - 0.4;
  add(cyl(0.1, 0.13, 0.28, 8), HULLP, [sx, 2.74, sz], Y);
  add(box(0.4, 0.26, 0.34), ARMORP, [sx, 2.98, sz], Y);
  add(box(0.42, 0.04, 0.36), P.trim, [sx, 3.12, sz], Y);
  glow(add(cyl(0.09, 0.09, 0.07, 10), P.neonCyan, [sx, 2.98, sz + 0.2], Y, { rotation: [90, 0, 0] }), 1.2);
  decal(RETICLE, 0.16, 0.16, [sx, 2.98, sz + 0.238], [0, 0, 1], Y, true);
  // rangefinder pair
  add(cyl(0.035, 0.035, 0.26, 6), P.hullDark, [sx - 0.12, 3.19, sz], Y, { rotation: [90, 0, 0] });
  add(cyl(0.035, 0.035, 0.26, 6), P.hullDark, [sx + 0.12, 3.19, sz], Y, { rotation: [90, 0, 0] });
  glow(add(cyl(0.028, 0.028, 0.02, 6), P.warnRed, [sx + 0.12, 3.19, sz + 0.14], Y, { rotation: [90, 0, 0] }), 2);
  glow(add(cyl(0.028, 0.028, 0.02, 6), P.neonMagenta, [sx - 0.12, 3.19, sz + 0.14], Y, { rotation: [90, 0, 0] }), 2);

  // ---------- antenna whip ----------
  add(cyl(0.05, 0.06, 0.1, 8), P.hullDark, [cx + 0.38, 2.66, cz - 0.42], Y);
  const whip = b.sweep(
    [
      [cx + 0.38, 2.7, cz - 0.42],
      [cx + 0.4, 3.0, cz - 0.44],
      [cx + 0.45, 3.38, cz - 0.5],
    ],
    [0.014, 0.005],
    { color: P.rim, bone: Y, caps: "point" },
  );
  glow(add(box(0.025, 0.025, 0.025), P.warnRed, [cx + 0.45, 3.39, cz - 0.5], Y), 2);

  // flush merged detail
  for (const { bone, color, geos } of bucket.values()) {
    const merged = mergeGeometries(geos);
    if (!merged) continue;
    const part = b.part(merged, color, { bone, at: [0, 0, 0], flat: true });
    if (color === P.neonCyan) glow(part, 1.8);
  }
  return whip;
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { arc, paint, svg } from "agentic-3js-builder";
import { coil, metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;

  // ---- paints ----
  const HULL = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.3, rivets: 0.06 });
  const ARMOR = panelled(
    paint((p, n) => {
      const k = n.y > 0.5 ? 1.15 : n.y < -0.3 ? 0.75 : 1;
      const c = new THREE.Color(P.armor);
      return [Math.min(c.r * k, 1), Math.min(c.g * k, 1), Math.min(c.b * k, 1)];
    }),
    { size: 0.26, rivets: 0.05 },
  );
  const PLATE = panelled(metal("steel", { tarnish: 0.6, polish: 0.1 }), { size: 0.4, rivets: 0.08 });
  const BRASS = metal("brass", { tarnish: 0.5 });
  const STEEL = metal("steel", { tarnish: 0.3 });
  const GRUNGE = paint((p, n) => {
    const d = n.y < -0.5 ? 0.6 : 1;
    const c = new THREE.Color(P.hullDark);
    return [c.r * d + 0.04 * Math.abs(Math.sin(p.z * 9)), c.g * d, c.b * d + 0.02];
  });

  // ---- textures ----
  let slats = "";
  for (let i = 0; i < 24; i++)
    slats += `<rect x="${6 + i * 6.6}" y="4" width="2.6" height="18" fill="#2ff3ff"/>`;
  const GRILLE = svg(
    `<svg viewBox="0 0 170 26" xmlns="http://www.w3.org/2000/svg">
    <rect width="170" height="26" fill="#0a0d12"/><rect x="2" y="2" width="166" height="22" fill="none" stroke="#e7b814" stroke-width="2"/>
    ${slats}
    <path d="M85 3 L95 13 L85 23 L75 13Z" fill="#0a0d12" stroke="#ff2bb8" stroke-width="2"/>
    <path d="M80 9 L85 6 L90 9 M80 17 L85 20 L90 17" stroke="#ff2bb8" stroke-width="1.6" fill="none"/></svg>`,
    { size: 512 },
  );
  let hz = "";
  for (let i = -2; i < 22; i++) hz += `<polygon points="${i * 10},12 ${i * 10 + 6},12 ${i * 10 + 12},0 ${i * 10 + 6},0" fill="#111"/>`;
  const HAZARD = svg(
    `<svg viewBox="0 0 200 12" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="12" fill="#e7b814"/>${hz}</svg>`,
    { size: 512 },
  );
  const LABEL = svg(
    `<svg viewBox="0 0 120 20" xmlns="http://www.w3.org/2000/svg">
    <text x="4" y="14" font-family="monospace" font-weight="bold" font-size="13" fill="#2ff3ff">WARHOUND-77</text>
    <rect x="100" y="4" width="16" height="3" fill="#ff2bb8"/><rect x="100" y="10" width="10" height="3" fill="#e7b814"/></svg>`,
    { size: 512 },
  );
  const LENS = svg(
    `<svg viewBox="0 0 32 20" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="20" fill="#fff6d8"/>
    <path d="M2 10 H30 M2 5 H30 M2 15 H30" stroke="#d8c88a" stroke-width="1.2"/><rect x="1" y="1" width="30" height="18" fill="none" stroke="#887744" stroke-width="2"/></svg>`,
    { size: 128 },
  );

  // ---- helpers ----
  const box = (sz: number[], col: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(sz[0], sz[1], sz[2]), col, { bone, at, ...o });
  const cyl = (r: number, len: number, col: any, at: number[], dir: number[], seg = 10, r2?: number) =>
    b.part(new THREE.CylinderGeometry(r2 ?? r, r, len, seg), col, { bone, at, dir });
  const rod = (a: number[], c: number[], r: number, col: any) => b.rod(a, c, r, col, { bone, sides: 6 });
  const decal = (tex: any, at: number[], dir: number[], w: number, h: number) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });

  const AX = [2.9, -0.7, -2.7];
  const WY = 0.62;

  // ---- ladder frame ----
  for (const s of [1, -1]) {
    box([0.14, 0.3, 7.3], GRUNGE, [s * 0.55, 1.0, -0.35]);
    box([0.26, 0.035, 7.3], PLATE, [s * 0.55, 1.15, -0.35]);
    box([0.26, 0.035, 7.3], PLATE, [s * 0.55, 0.85, -0.35]);
  }
  for (let i = 0; i < 11; i++) {
    const z = 3.0 - i * 0.68;
    box([1.0, 0.16, 0.12], GRUNGE, [0, 1.0, z]);
    box([1.0, 0.03, 0.2], PLATE, [0, 0.91, z]);
  }
  box([2.2, 0.28, 0.2], HULL, [0, 1.0, -3.9]);
  for (const s of [1, -1]) {
    box([0.12, 0.12, 0.3], P.trim, [s * 0.8, 0.98, -3.95]);
    cyl(0.07, 0.1, STEEL, [s * 0.8, 0.98, -4.0], [0, 0, 1], 8);
  }

  // underbody plate
  box([1.7, 0.05, 6.1], PLATE, [0, 1.2, -0.45]);
  box([1.5, 0.05, 0.8], HULL, [0, 0.66, 1.2]);
  box([0.5, 0.35, 0.7], GRUNGE, [0, 0.95, 0.9]); // transfer case

  // ---- axles, diffs, springs, shocks ----
  for (const z of AX) {
    cyl(0.09, 2.1, STEEL, [0, WY, z], [1, 0, 0], 8);
    const pump = b.part(new THREE.SphereGeometry(0.22, 8, 6), BRASS, { bone, at: [0, WY, z], scale: [1, 0.9, 1.05] });
    cyl(0.12, 0.05, PLATE, [0, WY, z + 0.22], [0, 0, 1], 8);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 5), P.rim, {
        bone,
        at: [Math.cos(a) * 0.085, WY + Math.sin(a) * 0.085, z + 0.25],
        dir: [0, 0, 1],
      });
    }
    for (const s of [1, -1]) {
      cyl(0.11, 0.18, GRUNGE, [s * 1.0, WY, z], [1, 0, 0], 8);
      b.sweep(coil([s * 0.8, 0.72, z], [s * 0.8, 0.95, z], 0.065, 5), 0.013, { bone, color: STEEL, sides: 5 });
      box([0.3, 0.05, 0.2], PLATE, [s * 0.8, 0.7, z]);
      rod([s * 0.62, 0.68, z - 0.2], [s * 0.62, 0.84, z - 0.05], 0.035, BRASS);
      rod([s * 0.62, 0.84, z - 0.05], [s * 0.62, 1.0, z + 0.1], 0.02, STEEL);
      box([0.05, 0.08, 0.05], P.warnRed, [s * 0.62, 0.68, z - 0.2]);
    }
  }
  // drive shafts
  rod([0, WY + 0.02, AX[0] - 0.2], [0, WY + 0.02, AX[1] + 0.25], 0.05, STEEL);
  rod([0, WY + 0.02, AX[1] - 0.25], [0, WY + 0.02, AX[2] + 0.25], 0.05, STEEL);
  for (const z of [1.5, 0.3, -1.1, -2.2]) b.part(new THREE.OctahedronGeometry(0.075), BRASS, { bone, at: [0, WY + 0.02, z] });
  rod([-0.95, 0.5, 2.55], [0.95, 0.5, 2.55], 0.03, P.rim); // steering link
  box([0.2, 0.1, 0.12], P.rust, [0, 0.5, 2.55]);

  // ---- tanks ----
  cyl(0.26, 1.3, ARMOR, [0.72, 0.62, 1.0], [0, 0, 1], 10);
  for (const z of [0.5, 1.5]) cyl(0.275, 0.07, P.trim, [0.72, 0.62, z], [0, 0, 1], 10);
  cyl(0.06, 0.1, P.brass, [0.72, 0.62, 1.67], [0, 0, 1], 6);
  glow(box([0.05, 0.05, 0.05], P.neonCyan, [0.72, 0.88, 1.5]), 1.5);
  cyl(0.24, 1.0, ARMOR, [-0.72, 0.62, 1.0], [0, 0, 1], 10);
  for (const z of [0.7, 1.3]) cyl(0.255, 0.06, P.trim, [-0.72, 0.62, z], [0, 0, 1], 10);
  box([0.5, 0.3, 0.7], HULL, [-0.72, 0.65, -1.9]);
  box([0.5, 0.05, 0.72], P.trim, [-0.72, 0.82, -1.9]);
  glow(box([0.08, 0.04, 0.08], P.warnRed, [-0.72, 0.87, -1.7]), 1.6);
  glow(box([0.08, 0.04, 0.08], P.neonCyan, [-0.72, 0.87, -2.0]), 1.6);
  box([0.5, 0.26, 0.7], PLATE, [0.72, 0.62, -1.9]);
  rod([0.55, 0.8, -1.6], [0.9, 0.8, -1.6], 0.02, P.brass);

  // ---- skirts, neon, hazard ----
  const segs = [
    [-2.08, -1.32],
    [-0.08, 2.28],
  ];
  for (const s of [1, -1])
    for (const [z0, z1] of segs) {
      const len = z1 - z0 - 0.04;
      const cz = (z0 + z1) / 2;
      box([0.08, 0.5, len], ARMOR, [s * 1.36, 0.78, cz]);
      box([0.1, 0.05, len + 0.02], P.trim, [s * 1.36, 1.05, cz]);
      box([0.1, 0.06, len - 0.08], HULL, [s * 1.36, 0.5, cz], { rotation: [0, 0, 0] });
      glow(box([0.03, 0.035, len - 0.12], s > 0 ? P.neonCyan : P.neonMagenta, [s * 1.41, 0.58, cz]), 1.6);
      glow(box([0.03, 0.03, len - 0.12], s > 0 ? P.neonMagenta : P.neonCyan, [s * 1.41, 0.66, cz]), 1.4);
      decal(HAZARD, [s * 1.405, 0.93, cz], [s, 0, 0], Math.min(len - 0.1, 1.4), 0.1);
      for (let k = 0; k < 4; k++) {
        const z = z0 + 0.1 + ((len - 0.1) * k) / 3;
        box([0.03, 0.06, 0.06], P.rim, [s * 1.405, 0.86, z]);
      }
    }
  for (const s of [1, -1]) decal(LABEL, [s * 1.405, 0.77, 1.1], [s, 0, 0], 1.2, 0.2);

  // ---- fender flares & arches ----
  for (const s of [1, -1])
    for (const z of AX) {
      const x = s * 1.28;
      box([0.55, 0.05, 1.0], ARMOR, [x, 1.37, z]);
      box([0.55, 0.05, 0.4], ARMOR, [x, 1.31, z + 0.62], { rotation: [32, 0, 0] });
      box([0.55, 0.05, 0.4], ARMOR, [x, 1.31, z - 0.62], { rotation: [-32, 0, 0] });
      box([0.05, 0.07, 1.5], P.trim, [s * 1.54, 1.38, z]);
      box([0.06, 0.2, 0.06], PLATE, [s * 1.54, 1.28, z + 0.78]);
      box([0.06, 0.2, 0.06], PLATE, [s * 1.54, 1.28, z - 0.78]);
      for (const xx of [s * 1.57, s * 1.03])
        b.sweep(arc([xx, WY, z], [xx, WY, z - 0.72], [1, 0, 0], 180), 0.03, {
          bone,
          color: P.trim,
          sides: 6,
        });
      box([0.5, 0.09, 0.9], GRUNGE, [x, 1.28, z]);
    }

  // ---- hood ----
  b.extrude(
    [
      [2.95, 1.2],
      [3.85, 1.0],
      [3.85, 1.3],
      [3.55, 1.58],
      [2.95, 1.6],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.0, bevel: 0.03, color: ARMOR, bone },
  );
  box([0.16, 0.05, 0.7], PLATE, [0, 1.63, 3.25]);
  box([0.1, 0.04, 0.3], PLATE, [0, 1.58, 3.7], { rotation: [43, 0, 0] });
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) {
      box([0.45, 0.025, 0.04], P.hullDark, [s * 0.55, 1.605, 3.05 + i * 0.09]);
      if (i % 2 == 0) glow(box([0.4, 0.01, 0.015], P.neonMagenta, [s * 0.55, 1.6, 3.09 + i * 0.09]), 1.2);
    }
  for (const s of [1, -1]) {
    box([0.05, 0.3, 0.8], P.trim, [s * 1.02, 1.3, 3.25]);
    box([0.04, 0.2, 0.6], HULL, [s * 1.03, 1.15, 3.35]);
  }
  decal(GRILLE, [0, 1.15, 3.857], [0, 0, 1], 1.7, 0.26);
  glow(box([1.6, 0.03, 0.04], P.neonCyan, [0, 1.455, 3.7], { rotation: [43, 0, 0] }), 1.8);

  // ---- front bumper ----
  box([2.5, 0.42, 0.18], ARMOR, [0, 0.74, 3.91]);
  box([2.5, 0.06, 0.2], P.trim, [0, 0.97, 3.91]);
  box([1.9, 0.18, 0.2], HULL, [0, 0.46, 3.88], { rotation: [-35, 0, 0] });
  decal(HAZARD, [0, 0.8, 4.006], [0, 0, 1], 1.6, 0.1);
  glow(box([1.5, 0.07, 0.03], P.lampWhite, [0, 0.9, 4.0]), 2);
  for (const s of [1, -1]) {
    box([0.34, 0.34, 0.28], PLATE, [s * 1.15, 1.12, 3.86]);
    glow(
      b.part(new THREE.PlaneGeometry(0.26, 0.2), "#ffffff", {
        bone,
        at: [s * 1.15, 1.12, 4.003],
        dir: [0, 0, 1],
        axis: "z",
        texture: LENS,
      }),
      2.2,
    );
    glow(box([0.3, 0.035, 0.03], P.neonMagenta, [s * 1.15, 0.95, 4.0]), 1.6);
    rod([s * 0.5, 0.62, 3.98], [s * 0.5, 0.62, 4.1], 0.03, P.warnRed);
    b.part(new THREE.TorusGeometry(0.06, 0.016, 5, 8), P.warnRed, { bone, at: [s * 0.5, 0.62, 4.12], dir: [0, 1, 0], axis: "z" });
  }
  // winch
  cyl(0.1, 0.75, STEEL, [0, 0.74, 4.04], [1, 0, 0], 8);
  for (const s of [1, -1]) cyl(0.14, 0.04, P.trim, [s * 0.4, 0.74, 4.04], [1, 0, 0], 8);
  rod([0, 0.64, 4.12], [0, 0.55, 4.2], 0.02, P.hullDark);
  box([0.08, 0.07, 0.1], P.warnRed, [0, 0.52, 4.2]);
  // bull bar
  for (const x of [-0.9, -0.45, 0.45, 0.9]) rod([x, 0.95, 4.0], [x, 1.38, 4.12], 0.04, P.hull);
  rod([-1.0, 1.38, 4.12], [1.0, 1.38, 4.12], 0.045, P.hull);
  rod([-1.0, 1.05, 4.1], [1.0, 1.05, 4.1], 0.035, P.trim);
  rod([-1.0, 1.38, 4.12], [-1.0, 1.05, 4.1], 0.04, P.hull);
  rod([1.0, 1.38, 4.12], [1.0, 1.05, 4.1], 0.04, P.hull);
  for (const s of [1, -1]) rod([s * 1.0, 1.38, 4.12], [s * 1.0, 1.55, 3.95], 0.03, P.hull);
  // skid plate
  box([1.4, 0.04, 0.8], PLATE, [0, 0.42, 3.4], { rotation: [8, 0, 0] });

  return bone;
}
```