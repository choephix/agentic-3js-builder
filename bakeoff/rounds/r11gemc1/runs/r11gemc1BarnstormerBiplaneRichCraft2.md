Here is the breakdown of the changes to transform the model:

1. **Eliminated the giant 1.36m vertical hoop**: The ground base border torus had an inverted axis that projected it vertically through the entire model deep into the floor (causing the warning: -1364 mm below y=0). Replaced it with a clean single-piece lathe pedestal whose lowest point is exactly y = 0.
2. **Exposed the 7-cylinder radial engine**: Changed the fuselage loft's forward cap from `"round"` (which created a giant dome that swallowed the entire engine) to `"flat"` at the firewall. The detailed radial engine, finned cylinders, brass rocker boxes, dual pushrod tubes, copper exhaust collector ring, and twin swooping exhaust pipes are now fully exposed in front of the cowl.
3. **Redesigned the biplane wings**: Replaced the puffy, oversized loft wings with crisp, aerodynamically proportioned extruded wings featuring rounded wingtips, leading-edge camber, center pilot trailing-edge cutout, scalloped bunting, and roundel decals.
4. **Hero treatment for the puppet aviator**: Raised the pilot up out of the cockpit well and elevated the top wing on brass cabane struts. The intrepid aviator now sits tall and proud with his leather flight jacket, fleece collar, leather helmet, shiny brass-framed goggles with sky-reflection lenses, button nose, curled mustache, and a long white silk scarf billowing back over his shoulder.
5. **Fixed landing gear wheel orientation**: Corrected the wheel torus orientation so the fat balloon tires and cream rims stand upright and roll forward, resting on the turf at y = 0.
6. **Polished staging & accessories**: Tuned the windsock, vintage oil drum with brass hand pump, fuel jerrycan, wheel chock, and wildflower tufts to frame the aircraft without obstructing views.

```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  line,
  aim,
  lerp,
  mid,
  offset,
  rng,
  arc,
  bezier,
  catmull,
  polyline,
  spiral,
  countershade,
  paint,
  spots,
  stripes,
  grain,
  mottle,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "barnstormer-biplane",
  description:
    "A whimsical golden-age barnstormer biplane with an exposed radial engine, spinning laminated propeller, intrepid puppet aviator, billowing silk scarf, and grass airstrip staging.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "barnstormer-biplane", detail: 1.0 });

  // ---------------------------------------------------------------------------
  // Color Palette
  // ---------------------------------------------------------------------------
  const CANARY_YELLOW = "#f5b823";
  const RACING_RED = "#cf262b";
  const CHERRY_DARK = "#8b1419";
  const VINTAGE_CREAM = "#fcf6e2";
  const COCKPIT_INTERIOR = "#2b2118";
  const LEATHER_BROWN = "#5c2c16";
  const LEATHER_LIGHT = "#9a562d";
  const ENGINE_STEEL = "#4c525b";
  const ENGINE_DARK = "#202326";
  const POLISHED_BRASS = "#e2b144";
  const BRASS_DARK = "#916c1c";
  const COPPER_PIPE = "#b85c37";
  const RUBBER_BLACK = "#242528";
  const WHEEL_CREAM = "#f4ebd0";
  const PROP_WOOD_LIGHT = "#d49a5b";
  const PROP_WOOD_DARK = "#622915";
  const SCARF_WHITE = "#fbfbfa";
  const SCARF_SHADOW = "#dedee6";
  const GLASS_CYAN = "#a9e4f2";
  const FIELD_GRASS = "#47782b";
  const FIELD_GRASS_LGT = "#66a33c";
  const DIRT_EARTH = "#483626";
  const CHALK_WHITE = "#e8ede0";

  // ---------------------------------------------------------------------------
  // Textures (SVG Drawings)
  // ---------------------------------------------------------------------------
  // Lucky 7 Racing Roundel
  const RACE_NUM_7 = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <circle cx="128" cy="128" r="124" fill="${VINTAGE_CREAM}" stroke="${RACING_RED}" stroke-width="12"/>
      <circle cx="128" cy="128" r="106" fill="none" stroke="${POLISHED_BRASS}" stroke-width="4" stroke-dasharray="8 6"/>
      <!-- Lucky 7 -->
      <path d="M72 68 H184 L126 196 H88 L140 88 H72 Z" fill="${RACING_RED}" stroke="${CHERRY_DARK}" stroke-width="3"/>
      <!-- Gold Stars -->
      <polygon points="128,26 132,38 144,38 134,46 138,58 128,50 118,58 122,46 112,38 124,38" fill="${POLISHED_BRASS}"/>
      <polygon points="128,198 132,210 144,210 134,218 138,230 128,222 118,230 122,218 112,210 124,210" fill="${POLISHED_BRASS}"/>
    </svg>`,
    { size: 256 },
  );

  // Scalloped Sunburst Bunting Decal
  const SCALLOP_BUNTING = svg(
    `<svg viewBox="0 0 256 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,0 L256,0 L256,16 
               Q240,48 224,16 Q208,48 192,16 Q176,48 160,16 
               Q144,48 128,16 Q112,48 96,16 Q80,48 64,16 
               Q48,48 32,16 Q16,48 0,16 Z" fill="${RACING_RED}"/>
      <path d="M0,0 L256,0 L256,8 
               Q240,36 224,8 Q208,36 192,8 Q176,36 160,8 
               Q144,36 128,8 Q112,36 96,8 Q80,36 64,8 
               Q48,36 32,8 Q16,36 0,8 Z" fill="${POLISHED_BRASS}"/>
    </svg>`,
    { size: 256 },
  );

  // Rudder Airshow Stripes
  const RUDDER_STRIPES = svg(
    `<svg viewBox="0 0 128 256" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="256" fill="${VINTAGE_CREAM}"/>
      <rect x="0" y="0" width="36" height="256" fill="${RACING_RED}"/>
      <rect x="52" y="0" width="24" height="256" fill="${RACING_RED}"/>
      <rect x="92" y="0" width="36" height="256" fill="${RACING_RED}"/>
      <polygon points="44,40 46,47 54,47 48,52 50,59 44,54 38,59 40,52 34,47 42,47" fill="${POLISHED_BRASS}"/>
      <polygon points="44,120 46,127 54,127 48,132 50,139 44,134 38,139 40,132 34,127 42,127" fill="${POLISHED_BRASS}"/>
      <polygon points="44,200 46,207 54,207 48,212 50,219 44,214 38,219 40,212 34,207 42,207" fill="${POLISHED_BRASS}"/>
    </svg>`,
    { size: 256 },
  );

  // Altimeter Instrument Dial
  const DIAL_ALTIMETER = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="62" fill="#1b1c1e" stroke="${POLISHED_BRASS}" stroke-width="5"/>
      <circle cx="64" cy="64" r="52" fill="#111214"/>
      <circle cx="64" cy="64" r="46" fill="none" stroke="${VINTAGE_CREAM}" stroke-width="3" stroke-dasharray="2 12"/>
      <line x1="64" y1="64" x2="64" y2="24" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <line x1="64" y1="64" x2="88" y2="76" stroke="${RACING_RED}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="64" cy="64" r="5" fill="${POLISHED_BRASS}"/>
      <text x="64" y="94" text-anchor="middle" font-size="10" font-family="sans-serif" font-weight="bold" fill="${VINTAGE_CREAM}">ALT</text>
    </svg>`,
    { size: 128 },
  );

  // Airspeed Indicator Dial
  const DIAL_SPEED = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="62" fill="#1b1c1e" stroke="${POLISHED_BRASS}" stroke-width="5"/>
      <circle cx="64" cy="64" r="52" fill="#111214"/>
      <path d="M64,64 L24,64 A40,40 0 0,1 64,24 Z" fill="#2d6e35" opacity="0.6"/>
      <path d="M64,64 L64,24 A40,40 0 0,1 104,64 Z" fill="#cf7a22" opacity="0.6"/>
      <line x1="64" y1="64" x2="42" y2="38" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <circle cx="64" cy="64" r="5" fill="${POLISHED_BRASS}"/>
      <text x="64" y="94" text-anchor="middle" font-size="10" font-family="sans-serif" font-weight="bold" fill="${VINTAGE_CREAM}">MPH</text>
    </svg>`,
    { size: 128 },
  );

  // Aviator Goggles Glint Lens
  const GOGGLE_GLASS = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="62" fill="${GLASS_CYAN}"/>
      <path d="M10,70 Q40,50 70,75 Q95,60 120,72 L128,128 L0,128 Z" fill="#68b4c9" opacity="0.6"/>
      <circle cx="86" cy="42" r="16" fill="#ffffff" opacity="0.8"/>
      <path d="M25,25 Q45,15 65,22" stroke="#ffffff" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.9"/>
    </svg>`,
    { size: 128 },
  );

  // Wheel Star Hubcap
  const HUBCAP_STAR = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="62" fill="${RACING_RED}" stroke="${POLISHED_BRASS}" stroke-width="6"/>
      <polygon points="64,18 76,48 108,50 82,72 90,104 64,86 38,104 46,72 20,50 52,48" fill="${VINTAGE_CREAM}"/>
      <circle cx="64" cy="64" r="14" fill="${POLISHED_BRASS}" stroke="${CHERRY_DARK}" stroke-width="2"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------
  // Custom Procedural Paints
  // ---------------------------------------------------------------------------
  // Fuselage paint: canary yellow with bold red belly and side speed streak
  const FUSELAGE_PAINT = paint((p, n) => {
    if (n.y < -0.35) return RACING_RED;
    const dartY = 0.64 - (p.z + 0.3) * 0.08;
    const isDart = Math.abs(p.y - dartY) < 0.11 && p.z > -0.95 && p.z < 0.58;
    if (isDart && Math.abs(p.x) > 0.18) return RACING_RED;
    const isGoldTrim = Math.abs(p.y - (dartY + 0.12)) < 0.012 || Math.abs(p.y - (dartY - 0.12)) < 0.012;
    if (isGoldTrim && Math.abs(p.x) > 0.18 && p.z > -0.9 && p.z < 0.55) return POLISHED_BRASS;
    return CANARY_YELLOW;
  });

  // Wing fabric paint: cream vintage linen with subtle yellow rib stitches and red tips
  const WING_PAINT = paint((p, n) => {
    if (Math.abs(p.x) > 1.05) return RACING_RED;
    if (Math.abs(p.x) > 1.02 && Math.abs(p.x) <= 1.05) return POLISHED_BRASS;
    const ribPos = Math.abs((p.x % 0.11) + 0.11) % 0.11;
    if ((ribPos < 0.008 || ribPos > 0.102) && Math.abs(n.y) > 0.4) return CANARY_YELLOW;
    return VINTAGE_CREAM;
  });

  // Grass runway ground
  const RUNWAY_GROUND_PAINT = paint((p) => {
    const rDist = Math.hypot(p.x, p.z);
    if (rDist > 1.28) return DIRT_EARTH;
    const runwayLine = Math.abs(p.x * 0.7 + p.z * 0.7 + 0.08);
    if (runwayLine < 0.032 && rDist < 1.15) return CHALK_WHITE;
    const noiseVal = Math.sin(p.x * 9) * Math.cos(p.z * 9);
    return noiseVal > 0.25 ? FIELD_GRASS_LGT : FIELD_GRASS;
  });

  // ---------------------------------------------------------------------------
  // Skeleton / Hierarchy
  // ---------------------------------------------------------------------------
  const fuselage = b.joint("fuselage", { at: [0, 0.66, 0.0], role: "spine" });

  const engineJoint = b.joint("engine", {
    parent: fuselage,
    at: [0, 0.66, 0.62],
    dir: [0, 0, 1],
    role: "hinge",
  });

  const propJoint = b.joint("propeller", {
    parent: engineJoint,
    at: [0, 0.66, 0.88],
    dir: [0, 0, 1],
    role: "fan",
  });

  const rudderJoint = b.joint("rudder", {
    parent: fuselage,
    at: [0, 0.82, -1.22],
    dir: [0, 1, 0],
    role: "hinge",
  });

  const elevatorJoint = b.joint("elevator", {
    parent: fuselage,
    at: [0, 0.64, -1.16],
    dir: [1, 0, 0],
    role: "hinge",
  });

  const pilotTorso = b.joint("pilotTorso", {
    parent: fuselage,
    at: [0, 0.82, 0.02],
    dir: [0, 1, 0.05],
  });

  const pilotHead = b.joint("pilotHead", {
    parent: pilotTorso,
    at: [0, 1.05, 0.05],
    dir: [0, 1, 0.12],
    role: "head",
  });

  const scarfChain = b.chain(
    "scarf",
    catmull([
      [0.08, 0.96, 0.02],
      [0.17, 0.95, -0.16],
      [0.23, 0.97, -0.36],
      [0.27, 0.93, -0.56],
      [0.32, 0.95, -0.74],
    ]),
    { parent: pilotHead, count: 4, role: "tail" },
  );

  const wheelLJoint = b.joint("wheelL", {
    parent: fuselage,
    at: [0.36, 0.16, 0.36],
    dir: [1, 0, 0],
    role: "hinge",
  });

  const wheelRJoint = b.joint("wheelR", {
    parent: fuselage,
    at: [-0.36, 0.16, 0.36],
    dir: [-1, 0, 0],
    role: "hinge",
  });

  // ---------------------------------------------------------------------------
  // 1. Fuselage Body
  // ---------------------------------------------------------------------------
  // Stops cleanly at firewall z = 0.62 with a flat end cap so the engine is exposed
  const fuselageStations = [
    { at: [0, 0.64, -1.25], w: 0.08, h: 0.1 },  // Tail tip
    { at: [0, 0.65, -1.12], w: 0.18, h: 0.22 }, // Tail post
    { at: [0, 0.67, -0.75], w: 0.38, h: 0.4 },  // Aft fuselage
    { at: [0, 0.68, -0.35], w: 0.5, h: 0.52 },  // Mid fuselage
    { at: [0, 0.68, 0.02], w: 0.56, h: 0.54 },  // Cockpit area
    { at: [0, 0.67, 0.35], w: 0.54, h: 0.52 },  // Forward deck
    { at: [0, 0.66, 0.62], w: 0.5, h: 0.5 },    // Firewall
  ];

  b.loft(fuselageStations, {
    bone: fuselage,
    color: FUSELAGE_PAINT,
    caps: { start: "point", end: "flat" },
  });

  // Firewall plate (Steel firewall bulkhead)
  b.part(new THREE.CylinderGeometry(0.25, 0.25, 0.02, 20), ENGINE_DARK, {
    bone: engineJoint,
    at: [0, 0.66, 0.625],
    dir: [0, 0, 1],
  });

  // Cockpit rim (Padded leather coaming)
  const cockpitRimPath = catmull(
    [
      [0, 0.94, 0.22],
      [0.17, 0.92, 0.12],
      [0.18, 0.91, -0.08],
      [0.14, 0.92, -0.2],
      [0, 0.93, -0.24],
      [-0.14, 0.92, -0.2],
      [-0.18, 0.91, -0.08],
      [-0.17, 0.92, 0.12],
    ],
    { closed: true },
  );

  b.sweep(cockpitRimPath, 0.024, { bone: fuselage, color: LEATHER_BROWN });

  // Cockpit interior dark well
  b.part(new THREE.CylinderGeometry(0.18, 0.15, 0.3, 12), COCKPIT_INTERIOR, {
    bone: fuselage,
    at: [0, 0.77, 0.0],
    scale: [0.95, 1, 1.25],
  });

  // Padded leather seat backrest
  b.part(new THREE.CylinderGeometry(0.15, 0.13, 0.22, 10, 1, false, 0, Math.PI), LEATHER_LIGHT, {
    bone: fuselage,
    at: [0, 0.86, -0.16],
    rotation: [0, 180, 0],
  });

  // Wooden dashboard with instrument panel
  const dashAt: [number, number, number] = [0, 0.88, 0.19];
  b.part(new THREE.BoxGeometry(0.3, 0.12, 0.02), PROP_WOOD_DARK, {
    bone: fuselage,
    at: dashAt,
    rotation: [-18, 0, 0],
  });

  // Instrument dials (Glow in the cockpit)
  glow(
    b.part(new THREE.CircleGeometry(0.038, 16), "#ffffff", {
      bone: fuselage,
      at: [-0.075, 0.88, 0.2],
      rotation: [-18, 0, 0],
      texture: DIAL_ALTIMETER,
    }),
    1.2,
  );

  glow(
    b.part(new THREE.CircleGeometry(0.038, 16), "#ffffff", {
      bone: fuselage,
      at: [0.075, 0.88, 0.2],
      rotation: [-18, 0, 0],
      texture: DIAL_SPEED,
    }),
    1.2,
  );

  // Flight joystick with brass grip
  b.rod([0, 0.68, 0.08], [0, 0.84, 0.1], 0.01, ENGINE_STEEL, { bone: fuselage });
  b.part(new THREE.SphereGeometry(0.018, 8, 8), POLISHED_BRASS, {
    bone: fuselage,
    at: [0, 0.84, 0.1],
  });

  // Curved Windscreen
  b.extrude(
    [
      [-0.16, 0],
      [-0.12, 0.11],
      [0, 0.13],
      [0.12, 0.11],
      [0.16, 0],
    ],
    {
      bone: fuselage,
      at: [0, 0.94, 0.22],
      x: [1, 0, 0],
      y: [0, 0.9, 0.4],
      thickness: 0.006,
      bevel: 0.003,
      color: GLASS_CYAN,
    },
  );

  // Brass windscreen frame border
  b.sweep(
    catmull([
      [-0.16, 0.94, 0.21],
      [-0.12, 1.05, 0.25],
      [0, 1.07, 0.26],
      [0.12, 1.05, 0.25],
      [0.16, 0.94, 0.21],
    ]),
    0.007,
    { bone: fuselage, color: POLISHED_BRASS },
  );

  // Racing roundels #7 on fuselage flanks
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.14, 20), "#ffffff", {
      bone: fuselage,
      at: [s * 0.28, 0.66, -0.25],
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: RACE_NUM_7,
    });
  }

  // ---------------------------------------------------------------------------
  // 2. Radial Engine (Exposed 7-Cylinder Radial with Exposed Pushrods)
  // ---------------------------------------------------------------------------
  // Crankcase central cylinder
  b.part(new THREE.CylinderGeometry(0.13, 0.14, 0.16, 16), ENGINE_STEEL, {
    bone: engineJoint,
    at: [0, 0.66, 0.72],
    dir: [0, 0, 1],
  });

  // Front crankcase nose dome with brass bolts
  b.part(new THREE.SphereGeometry(0.12, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), POLISHED_BRASS, {
    bone: engineJoint,
    at: [0, 0.66, 0.8],
    dir: [0, 0, 1],
  });

  // 7 radial cylinders
  const numCylinders = 7;
  const cylinderRadius = 0.22;
  for (let i = 0; i < numCylinders; i++) {
    const angle = (i / numCylinders) * Math.PI * 2;
    const cylX = Math.cos(angle) * cylinderRadius;
    const cylY = 0.66 + Math.sin(angle) * cylinderRadius;
    const cylZ = 0.72;

    // Finned cylinder body
    b.capsule(
      [cylX * 0.45, 0.66 + (cylY - 0.66) * 0.45, cylZ],
      [cylX * 0.96, 0.66 + (cylY - 0.66) * 0.96, cylZ],
      0.045,
      { bone: engineJoint, color: ENGINE_STEEL },
    );

    // Ribbed black cooling rings
    for (const step of [0.55, 0.7, 0.85]) {
      const ringAt: [number, number, number] = [
        cylX * step,
        0.66 + (cylY - 0.66) * step,
        cylZ,
      ];
      b.part(new THREE.TorusGeometry(0.048, 0.007, 6, 12), ENGINE_DARK, {
        bone: engineJoint,
        at: ringAt,
        dir: [cylX, cylY - 0.66, 0],
        axis: "z",
      });
    }

    // Brass rocker arm box at cylinder head
    b.part(new THREE.BoxGeometry(0.038, 0.028, 0.04), POLISHED_BRASS, {
      bone: engineJoint,
      at: [cylX, cylY, cylZ + 0.01],
      dir: [cylX, cylY - 0.66, 0],
    });

    // Twin chrome pushrod tubes running forward from crankcase
    b.rod(
      [cylX * 0.35 - 0.014, 0.66 + (cylY - 0.66) * 0.35, cylZ + 0.05],
      [cylX * 0.92 - 0.014, 0.66 + (cylY - 0.66) * 0.92, cylZ + 0.025],
      0.0045,
      POLISHED_BRASS,
      { bone: engineJoint },
    );
    b.rod(
      [cylX * 0.35 + 0.014, 0.66 + (cylY - 0.66) * 0.35, cylZ + 0.05],
      [cylX * 0.92 + 0.014, 0.66 + (cylY - 0.66) * 0.92, cylZ + 0.025],
      0.0045,
      POLISHED_BRASS,
      { bone: engineJoint },
    );
  }

  // Exhaust manifold collector ring (Copper ring behind cylinders)
  b.part(new THREE.TorusGeometry(0.22, 0.02, 10, 24), COPPER_PIPE, {
    bone: engineJoint,
    at: [0, 0.66, 0.66],
    dir: [0, 0, 1],
    axis: "z",
  });

  // Twin sweeping exhaust pipes down fuselage sides
  for (const s of [1, -1]) {
    const exhaustCurve = catmull([
      [s * 0.2, 0.56, 0.66],
      [s * 0.26, 0.5, 0.5],
      [s * 0.29, 0.46, 0.3],
      [s * 0.31, 0.44, 0.1],
    ]);
    b.sweep(exhaustCurve, [0.022, 0.026], { bone: fuselage, color: COPPER_PIPE });
    // Flared exhaust tip
    b.part(new THREE.CylinderGeometry(0.028, 0.02, 0.035, 10, 1, true), ENGINE_DARK, {
      bone: fuselage,
      at: [s * 0.31, 0.44, 0.08],
      dir: [s * 0.1, -0.05, -1],
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Propeller Assembly (Laminated Wood with Brass Leading Edge & Red Spinner)
  // ---------------------------------------------------------------------------
  // Propeller hub mounting plate
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.06, 16), POLISHED_BRASS, {
    bone: propJoint,
    at: [0, 0.66, 0.86],
    dir: [0, 0, 1],
  });

  // Aerodynamic red conical spinner cone
  b.part(new THREE.ConeGeometry(0.065, 0.13, 16), RACING_RED, {
    bone: propJoint,
    at: [0, 0.66, 0.94],
    dir: [0, 0, 1],
  });

  // Two laminated propeller blades
  const propHalfSpan = 0.47;
  for (const side of [1, -1]) {
    const bladeCurve = catmull([
      [0, 0.66 + side * 0.06, 0.865],
      [side * 0.015, 0.66 + side * 0.24, 0.865],
      [side * 0.008, 0.66 + side * 0.4, 0.865],
      [0, 0.66 + side * propHalfSpan, 0.865],
    ]);

    // Primary wooden paddle blade
    b.sweep(bladeCurve, (t) => [0.042 * Math.sin(t * Math.PI) + 0.014, 0.008], {
      bone: propJoint,
      color: side > 0 ? PROP_WOOD_LIGHT : PROP_WOOD_DARK,
      caps: "round",
    });

    // Lamination inlay stripe
    b.sweep(bladeCurve, (t) => [0.03 * Math.sin(t * Math.PI) + 0.007, 0.009], {
      bone: propJoint,
      color: side > 0 ? PROP_WOOD_DARK : PROP_WOOD_LIGHT,
    });

    // Protective brass tip caps
    b.capsule(
      [0, 0.66 + side * (propHalfSpan - 0.09), 0.865],
      [0, 0.66 + side * (propHalfSpan - 0.01), 0.865],
      0.016,
      { bone: propJoint, color: POLISHED_BRASS },
    );
  }

  // ---------------------------------------------------------------------------
  // 4. Wings & Struts (Extruded Aerofoil Planforms with Stagger)
  // ---------------------------------------------------------------------------
  // TOP WING: Generous span, graceful rounded tips, pilot trailing edge cutout
  const topWingOutline: [number, number, "sharp"?][] = [
    [-1.08, 0, "sharp"],
    [1.08, 0, "sharp"],
    [1.14, 0.08],
    [1.14, 0.32],
    [1.08, 0.4, "sharp"],
    [0.18, 0.4, "sharp"],
    [0.14, 0.27],
    [0, 0.25],
    [-0.14, 0.27],
    [-0.18, 0.4, "sharp"],
    [-1.08, 0.4, "sharp"],
    [-1.14, 0.32],
    [-1.14, 0.08],
  ];

  // Extrude top wing horizontally: x along X (span), y along -Z (chord), thickness along Y
  b.extrude(topWingOutline, {
    bone: fuselage,
    at: [0, 1.32, 0.35],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.032,
    bevel: 0.008,
    smoothing: 1,
    color: WING_PAINT,
  });

  // Scalloped bunting decal on top wing leading edge
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.88, 0.18), "#ffffff", {
      bone: fuselage,
      at: [s * 0.52, 1.34, 0.28],
      rotation: [-90, 0, s > 0 ? 0 : 180],
      texture: SCALLOP_BUNTING,
    });

    // Racing roundel #7 on upper wing surfaces
    b.part(new THREE.CircleGeometry(0.15, 24), "#ffffff", {
      bone: fuselage,
      at: [s * 0.8, 1.34, 0.15],
      rotation: [-90, 0, 0],
      texture: RACE_NUM_7,
    });
  }

  // BOTTOM WING: Staggered aft, narrower span
  const bottomWingOutline: [number, number, "sharp"?][] = [
    [-0.88, 0, "sharp"],
    [0.88, 0, "sharp"],
    [0.94, 0.07],
    [0.94, 0.27],
    [0.88, 0.34, "sharp"],
    [-0.88, 0.34, "sharp"],
    [-0.94, 0.27],
    [-0.94, 0.07],
  ];

  b.extrude(bottomWingOutline, {
    bone: fuselage,
    at: [0, 0.48, 0.18],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.028,
    bevel: 0.006,
    smoothing: 1,
    color: WING_PAINT,
  });

  // Cabane Struts (Connecting fuselage to top wing center)
  const cabanePoints: [number, number, number][][] = [
    [[-0.16, 0.84, 0.28], [-0.14, 1.3, 0.25]],
    [[0.16, 0.84, 0.28], [0.14, 1.3, 0.25]],
    [[-0.16, 0.82, 0.02], [-0.14, 1.3, 0.06]],
    [[0.16, 0.82, 0.02], [0.14, 1.3, 0.06]],
  ];
  for (const [start, end] of cabanePoints) {
    b.rod(start, end, 0.012, POLISHED_BRASS, { bone: fuselage });
  }

  // Interplane N-Struts (Connecting top & bottom wings on left & right)
  for (const s of [1, -1]) {
    const xBase = s * 0.74;
    const xTop = s * 0.78;

    const frontLower: [number, number, number] = [xBase, 0.5, 0.12];
    const frontUpper: [number, number, number] = [xTop, 1.3, 0.26];
    const rearLower: [number, number, number] = [xBase, 0.5, -0.12];
    const rearUpper: [number, number, number] = [xTop, 1.3, 0.02];

    // Front vertical strut
    b.rod(frontLower, frontUpper, 0.015, CANARY_YELLOW, { bone: fuselage });
    // Rear vertical strut
    b.rod(rearLower, rearUpper, 0.015, CANARY_YELLOW, { bone: fuselage });
    // Diagonal cross brace
    b.rod(rearLower, frontUpper, 0.013, RACING_RED, { bone: fuselage });

    // Rigging tension cross-wires with steel sheen
    b.rod(frontLower, rearUpper, 0.003, ENGINE_STEEL, { bone: fuselage });
    b.rod(rearLower, frontUpper, 0.003, ENGINE_STEEL, { bone: fuselage });

    // Landing wires from cabane down to outer wing
    b.rod([-s * 0.14, 1.3, 0.15], frontLower, 0.0035, ENGINE_STEEL, { bone: fuselage });
    b.rod([-s * 0.14, 1.3, 0.15], rearLower, 0.0035, ENGINE_STEEL, { bone: fuselage });

    // Aileron trim capsules on top wing
    b.capsule(
      [s * 0.6, 1.32, -0.04],
      [s * 1.02, 1.32, -0.04],
      0.012,
      { bone: fuselage, color: RACING_RED },
    );
  }

  // Pitot Tube (Airspeed sensor on left strut)
  b.rod([-0.8, 0.95, 0.2], [-0.8, 0.95, 0.36], 0.004, POLISHED_BRASS, { bone: fuselage });
  b.rod([-0.8, 0.95, 0.36], [-0.8, 0.98, 0.38], 0.004, POLISHED_BRASS, { bone: fuselage });

  // ---------------------------------------------------------------------------
  // 5. Tail Unit (Rudder, Stabilizers, Elevators, Tail Skid)
  // ---------------------------------------------------------------------------
  // Vertical Fin
  const finOutline: [number, number, "sharp"?][] = [
    [0, 0, "sharp"],
    [0.44, 0, "sharp"],
    [0.4, 0.32],
    [0.15, 0.44],
    [-0.04, 0.28],
    [-0.06, 0.0],
  ];

  b.extrude(finOutline, {
    bone: fuselage,
    at: [0, 0.66, -0.75],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.032,
    bevel: 0.006,
    color: CANARY_YELLOW,
  });

  // Movable Rudder
  const rudderOutline: [number, number, "sharp"?][] = [
    [0, 0, "sharp"],
    [0.32, 0, "sharp"],
    [0.36, 0.26],
    [0.26, 0.46],
    [0.02, 0.48],
    [0.0, 0.0, "sharp"],
  ];

  b.extrude(rudderOutline, {
    bone: rudderJoint,
    at: [0, 0.64, -1.2],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.028,
    bevel: 0.005,
    color: RACING_RED,
  });

  // Rudder stripes decal
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.24, 0.38), "#ffffff", {
      bone: rudderJoint,
      at: [s * 0.016, 0.86, -1.34],
      rotation: [0, s > 0 ? 90 : -90, 0],
      texture: RUDDER_STRIPES,
    });
  }

  // Horizontal Stabilizer
  const horizStabStations = [
    { at: [-0.44, 0.64, -1.14], w: 0.08, h: 0.022 },
    { at: [-0.34, 0.64, -1.12], w: 0.26, h: 0.03 },
    { at: [0, 0.64, -1.08], w: 0.32, h: 0.034 },
    { at: [0.34, 0.64, -1.12], w: 0.26, h: 0.03 },
    { at: [0.44, 0.64, -1.14], w: 0.08, h: 0.022 },
  ];

  b.loft(horizStabStations, {
    bone: elevatorJoint,
    color: CANARY_YELLOW,
    caps: "round",
  });

  // Elevator trailing bar (Red)
  b.capsule([-0.42, 0.64, -1.22], [0.42, 0.64, -1.22], 0.016, {
    bone: elevatorJoint,
    color: RACING_RED,
  });

  // Tail bracing wire struts
  for (const s of [1, -1]) {
    b.rod([s * 0.3, 0.64, -1.1], [0, 0.94, -1.08], 0.003, ENGINE_STEEL, { bone: fuselage });
    b.rod([s * 0.3, 0.64, -1.1], [0, 0.58, -1.08], 0.003, ENGINE_STEEL, { bone: fuselage });
  }

  // Tail Skid (Spring leaf with brass wear shoe)
  const tailSkidCurve = catmull([
    [0, 0.58, -1.12],
    [0, 0.36, -1.2],
    [0, 0.22, -1.26],
    [0, 0.12, -1.32],
    [0, 0.09, -1.35],
  ]);
  b.sweep(tailSkidCurve, 0.012, { bone: fuselage, color: ENGINE_DARK });
  b.part(new THREE.BoxGeometry(0.028, 0.014, 0.05), POLISHED_BRASS, {
    bone: fuselage,
    at: [0, 0.09, -1.33],
  });

  // ---------------------------------------------------------------------------
  // 6. Main Undercarriage & Upright Balloon Wheels
  // ---------------------------------------------------------------------------
  const axleY = 0.16;
  const axleZ = 0.36;
  const trackX = 0.36;

  for (const s of [1, -1]) {
    const wheelBone = s > 0 ? wheelLJoint : wheelRJoint;
    const hubPos: [number, number, number] = [s * trackX, axleY, axleZ];

    // V-struts from fuselage belly to axle
    b.rod([s * 0.2, 0.46, 0.5], hubPos, 0.016, CANARY_YELLOW, { bone: fuselage });
    b.rod([s * 0.2, 0.46, 0.22], hubPos, 0.016, CANARY_YELLOW, { bone: fuselage });

    // Streamlined spreader bar
    b.rod([0, axleY + 0.01, axleZ], hubPos, 0.013, RACING_RED, { bone: fuselage });

    // Bungee suspension shock wrap
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 10), LEATHER_BROWN, {
      bone: fuselage,
      at: [s * (trackX - 0.05), axleY + 0.03, axleZ],
      dir: [s, 0.4, 0],
    });

    // Outer Rubber Tire (Upright Torus: axis "z" ensures axle points along X)
    b.part(new THREE.TorusGeometry(0.11, 0.045, 12, 22), RUBBER_BLACK, {
      bone: wheelBone,
      at: hubPos,
      dir: [s, 0, 0],
      axis: "z",
    });

    // Inner Cream Wheel Rim
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.055, 18), WHEEL_CREAM, {
      bone: wheelBone,
      at: hubPos,
      dir: [s, 0, 0],
    });

    // Star Hubcap Decal on outer face
    b.part(new THREE.CircleGeometry(0.078, 16), "#ffffff", {
      bone: wheelBone,
      at: [s * (trackX + 0.03), axleY, axleZ],
      dir: [s, 0, 0],
      axis: "z",
      texture: HUBCAP_STAR,
    });

    // Polished Brass Axle Nut
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.07, 8), POLISHED_BRASS, {
      bone: wheelBone,
      at: hubPos,
      dir: [s, 0, 0],
    });
  }

  // Cross axle between wheels
  b.rod([-trackX + 0.03, axleY, axleZ], [trackX - 0.03, axleY, axleZ], 0.012, ENGINE_STEEL, { bone: fuselage });

  // ---------------------------------------------------------------------------
  // 7. Whimsical Puppet Aviator Character
  // ---------------------------------------------------------------------------
  // Torso (Leather flight jacket sitting tall in cockpit)
  b.part(new THREE.CylinderGeometry(0.13, 0.15, 0.22, 12), LEATHER_BROWN, {
    bone: pilotTorso,
    at: [0, 0.82, 0.02],
    scale: [1.1, 1, 0.9],
  });

  // Fleece shearling collar
  b.part(new THREE.TorusGeometry(0.11, 0.028, 8, 16), VINTAGE_CREAM, {
    bone: pilotTorso,
    at: [0, 0.94, 0.03],
    dir: [0, 1, 0.15],
    axis: "z",
  });

  // Pilot arms with mittens resting on cockpit rim
  for (const s of [1, -1]) {
    const shoulder: [number, number, number] = [s * 0.13, 0.9, 0.03];
    const hand: [number, number, number] = [s * 0.14, 0.92, 0.14];
    b.capsule(shoulder, hand, 0.034, { bone: pilotTorso, color: LEATHER_BROWN });
    // Leather mittens gripping coaming
    b.part(new THREE.SphereGeometry(0.034, 8, 8), LEATHER_LIGHT, {
      bone: pilotTorso,
      at: hand,
    });
  }

  // Aviator Head
  const headPos: [number, number, number] = [0, 1.05, 0.05];
  b.part(new THREE.SphereGeometry(0.12, 16, 14), "#f0c29e", {
    bone: pilotHead,
    at: headPos,
  });

  // Leather Flying Helmet
  b.part(new THREE.SphereGeometry(0.126, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.65), LEATHER_BROWN, {
    bone: pilotHead,
    at: [0, 1.06, 0.04],
  });

  // Helmet earflaps with brass snap rivets
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.042, 0.046, 0.02, 10), LEATHER_BROWN, {
      bone: pilotHead,
      at: [s * 0.12, 1.03, 0.04],
      dir: [s, 0, 0],
    });
    b.part(new THREE.SphereGeometry(0.012, 8, 6), POLISHED_BRASS, {
      bone: pilotHead,
      at: [s * 0.132, 1.03, 0.04],
    });
    // Chin strap
    b.rod([s * 0.11, 0.98, 0.05], [0, 0.95, 0.08], 0.007, LEATHER_BROWN, { bone: pilotHead });
  }

  // Aviator Goggles
  for (const s of [1, -1]) {
    const goggleCenter: [number, number, number] = [s * 0.05, 1.08, 0.155];
    // Brass frame ring
    b.part(new THREE.TorusGeometry(0.036, 0.008, 8, 16), POLISHED_BRASS, {
      bone: pilotHead,
      at: goggleCenter,
      dir: [s * 0.15, 0.05, 1],
      axis: "z",
    });
    // Lens with sky reflection
    b.part(new THREE.CircleGeometry(0.032, 16), "#ffffff", {
      bone: pilotHead,
      at: [s * 0.05, 1.08, 0.158],
      dir: [s * 0.15, 0.05, 1],
      axis: "z",
      texture: GOGGLE_GLASS,
    });
  }

  // Goggle bridge connector & elastic headband
  b.rod([-0.02, 1.08, 0.16], [0.02, 1.08, 0.16], 0.007, POLISHED_BRASS, { bone: pilotHead });
  b.sweep(
    catmull([
      [-0.08, 1.07, 0.13],
      [-0.125, 1.07, 0.04],
      [0, 1.08, -0.06],
      [0.125, 1.07, 0.04],
      [0.08, 1.07, 0.13],
    ]),
    0.008,
    { bone: pilotHead, color: LEATHER_LIGHT },
  );

  // Friendly puppet face details:
  // Button nose
  b.part(new THREE.SphereGeometry(0.024, 10, 8), "#e89f78", {
    bone: pilotHead,
    at: [0, 1.03, 0.17],
  });

  // Whimsical curly barnstormer mustache
  for (const s of [1, -1]) {
    const stacheCurve = catmull([
      [0, 1.01, 0.168],
      [s * 0.04, 1.015, 0.165],
      [s * 0.08, 1.035, 0.14],
    ]);
    b.sweep(stacheCurve, [0.013, 0.004], { bone: pilotHead, color: PROP_WOOD_DARK });
  }

  // ---------------------------------------------------------------------------
  // 8. Billowing Silk Aviator Scarf
  // ---------------------------------------------------------------------------
  // Neck wrap ring
  b.part(new THREE.TorusGeometry(0.12, 0.03, 10, 18), SCARF_WHITE, {
    bone: pilotHead,
    at: [0, 0.95, 0.04],
    dir: [0, 1, 0.1],
    axis: "z",
  });

  // Trailing flutter ribbons in slipstream
  b.sweep(scarfChain, (t) => [0.065 * (1 - t * 0.25) + 0.02, 0.009], {
    color: countershade(SCARF_WHITE, SCARF_SHADOW, { level: 0.1 }),
    caps: "round",
  });

  // Second decorative fringe strand
  const scarfFringe = catmull([
    [0.08, 0.94, 0.0],
    [0.18, 0.92, -0.18],
    [0.26, 0.9, -0.4],
    [0.32, 0.88, -0.62],
  ]);
  b.sweep(scarfFringe, [0.034, 0.012], { bone: pilotHead, color: SCARF_WHITE });

  // ---------------------------------------------------------------------------
  // 9. Staged Airfield Vignette & Scenic Accessories
  // ---------------------------------------------------------------------------
  // Grassy runway pedestal base (Lowest point EXACTLY y = 0)
  b.lathe(
    [
      [0, 0, "sharp"],
      [1.35, 0, "sharp"],
      [1.35, 0.02],
      [1.25, 0.04],
      [0.8, 0.045],
      [0, 0.045, "sharp"],
    ],
    {
      at: [0, 0, 0],
      axis: [0, 1, 0],
      segments: 32,
      color: RUNWAY_GROUND_PAINT,
    },
  );

  // Wooden Wheel Chock in front of right wheel
  const chockOutline: [number, number, "sharp"?][] = [
    [0, 0, "sharp"],
    [0.15, 0, "sharp"],
    [0.15, 0.07, "sharp"],
    [0, 0, "sharp"],
  ];
  b.extrude(chockOutline, {
    at: [-0.42, 0.045, 0.45],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.11,
    bevel: 0.005,
    color: PROP_WOOD_LIGHT,
  });

  // Chock rope handle
  b.sweep(
    catmull([
      [-0.42, 0.08, 0.54],
      [-0.46, 0.11, 0.56],
      [-0.46, 0.07, 0.5],
    ]),
    0.005,
    { color: VINTAGE_CREAM },
  );

  // Airfield Windsock on Mast (Behind left wing)
  const mastPos: [number, number, number] = [0.88, 0.045, -0.65];
  // Post mounting collar
  b.part(new THREE.CylinderGeometry(0.038, 0.042, 0.1, 10), DIRT_EARTH, {
    at: [mastPos[0], mastPos[1] + 0.05, mastPos[2]],
  });

  // Striped mast pole
  b.sweep(
    catmull([
      [mastPos[0], mastPos[1] + 0.08, mastPos[2]],
      [mastPos[0], mastPos[1] + 1.25, mastPos[2]],
    ]),
    0.015,
    {
      bands: [
        [0.2, RACING_RED],
        [0.4, VINTAGE_CREAM],
        [0.6, RACING_RED],
        [0.8, VINTAGE_CREAM],
        [1.0, RACING_RED],
      ],
    },
  );

  // Brass mast finial ball
  b.part(new THREE.SphereGeometry(0.028, 10, 8), POLISHED_BRASS, {
    at: [mastPos[0], mastPos[1] + 1.26, mastPos[2]],
  });

  // Fluttering windsock cone
  const sockStart: [number, number, number] = [mastPos[0], mastPos[1] + 1.23, mastPos[2]];
  const sockCurve = catmull([
    sockStart,
    [sockStart[0] + 0.07, sockStart[1] - 0.02, sockStart[2] - 0.14],
    [sockStart[0] + 0.13, sockStart[1] - 0.06, sockStart[2] - 0.3],
    [sockStart[0] + 0.17, sockStart[1] - 0.11, sockStart[2] - 0.46],
  ]);

  b.sweep(sockCurve, [0.075, 0.03], {
    color: VINTAGE_CREAM,
    bands: [
      [0.25, RACING_RED],
      [0.5, VINTAGE_CREAM],
      [0.75, RACING_RED],
      [1.0, VINTAGE_CREAM],
    ],
    caps: { start: "flat", end: "round" },
  });

  // Windsock metal throat ring
  b.part(new THREE.TorusGeometry(0.075, 0.007, 8, 16), ENGINE_STEEL, {
    at: sockStart,
    dir: [0.3, -0.1, -1],
    axis: "z",
  });

  // Aviation Fuel Barrel & Brass Jerrycan (Behind right wing)
  const drumPos: [number, number, number] = [-0.82, 0.045, -0.45];
  // 55-gallon red drum
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.36, 16), RACING_RED, {
    at: [drumPos[0], drumPos[1] + 0.18, drumPos[2]],
  });
  // Drum ribs
  b.part(new THREE.TorusGeometry(0.142, 0.008, 6, 18), CHERRY_DARK, {
    at: [drumPos[0], drumPos[1] + 0.11, drumPos[2]],
    dir: [0, 1, 0],
    axis: "z",
  });
  b.part(new THREE.TorusGeometry(0.142, 0.008, 6, 18), CHERRY_DARK, {
    at: [drumPos[0], drumPos[1] + 0.25, drumPos[2]],
    dir: [0, 1, 0],
    axis: "z",
  });
  // Brass hand pump & handle
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.08, 8), POLISHED_BRASS, {
    at: [drumPos[0] + 0.05, drumPos[1] + 0.38, drumPos[2]],
  });
  b.part(new THREE.TorusGeometry(0.028, 0.006, 6, 10), POLISHED_BRASS, {
    at: [drumPos[0] + 0.05, drumPos[1] + 0.42, drumPos[2]],
    dir: [1, 0, 0],
    axis: "z",
  });

  // Vintage Brass Jerrycan beside drum
  const canPos: [number, number, number] = [-0.66, 0.045, -0.3];
  b.part(new THREE.BoxGeometry(0.13, 0.17, 0.09), POLISHED_BRASS, {
    at: [canPos[0], canPos[1] + 0.085, canPos[2]],
    rotation: [0, 24, 0],
  });
  // Jerrycan top handle
  b.rod([canPos[0], canPos[1] + 0.17, canPos[2] - 0.02], [canPos[0], canPos[1] + 0.17, canPos[2] + 0.02], 0.006, BRASS_DARK);
  // Oily cotton rag on top
  b.part(new THREE.BoxGeometry(0.05, 0.07, 0.05), VINTAGE_CREAM, {
    at: [canPos[0] + 0.04, canPos[1] + 0.12, canPos[2]],
    rotation: [12, 24, -18],
  });

  // Wildflower Sprigs on the Airfield
  const flowerRng = rng(42);
  for (let i = 0; i < 24; i++) {
    const fAngle = flowerRng() * Math.PI * 2;
    const fDist = 0.65 + flowerRng() * 0.6;
    const fx = Math.cos(fAngle) * fDist;
    const fz = Math.sin(fAngle) * fDist;
    const fy = 0.045;

    b.part(new THREE.ConeGeometry(0.018, 0.045, 4), FIELD_GRASS_LGT, {
      at: [fx, fy + 0.02, fz],
      dir: [flowerRng() * 0.4 - 0.2, 1, flowerRng() * 0.4 - 0.2],
    });

    if (i % 3 === 0) {
      const flowerColor = i % 2 === 0 ? CANARY_YELLOW : VINTAGE_CREAM;
      b.part(new THREE.SphereGeometry(0.011, 6, 6), flowerColor, {
        at: [fx, fy + 0.045, fz],
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Gentle Rest Poses
  // ---------------------------------------------------------------------------
  // Rudder jaunty angle
  b.pose(rudderJoint, { axis: [0, 1, 0], deg: -9 });

  // Elevator trim angle
  b.pose(elevatorJoint, { axis: [1, 0, 0], deg: -4 });

  // Propeller resting at a brisk diagonal
  b.pose(propJoint, { axis: [0, 0, 1], deg: 26 });

  // Pilot head tilted with adventurous spirit
  b.pose(pilotHead, { axis: [0, 1, 0], deg: 12 });
  b.pose(pilotHead, { axis: [0, 0, 1], deg: -5 });

  return b.root;
}
```