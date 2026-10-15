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
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "barnstormer-biplane",
  description:
    "A whimsical golden-age barnstormer biplane with radial engine, spinning laminated propeller, intrepid puppet aviator, billowing silk scarf, and grass airstrip staging.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "barnstormer-biplane", detail: 1.0 });

  // ---------------------------------------------------------------------------
  // Color Palette & Base Values
  // ---------------------------------------------------------------------------
  const CANARY_YELLOW = "#f5b823";
  const RACING_RED = "#cf262b";
  const CHERRY_DARK = "#8b1419";
  const VINTAGE_CREAM = "#fcf6e2";
  const COCKPIT_INTERIOR = "#2b2118";
  const LEATHER_BROWN = "#5c2c16";
  const LEATHER_LIGHT = "#9a562d";
  const ENGINE_STEEL = "#444951";
  const ENGINE_DARK = "#23262a";
  const POLISHED_BRASS = "#e2b144";
  const BRASS_DARK = "#916c1c";
  const COPPER_PIPE = "#b85c37";
  const RUBBER_BLACK = "#28292c";
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
  // SVG Textures
  // ---------------------------------------------------------------------------
  // Racing roundel #7 with airshow stars
  const RACE_NUM_7 = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <circle cx="128" cy="128" r="124" fill="${VINTAGE_CREAM}" stroke="${RACING_RED}" stroke-width="10"/>
      <circle cx="128" cy="128" r="106" fill="none" stroke="${POLISHED_BRASS}" stroke-width="3" stroke-dasharray="8 6"/>
      <!-- Lucky 7 -->
      <path d="M72 68 H184 L126 196 H88 L140 88 H72 Z" fill="${RACING_RED}" stroke="${CHERRY_DARK}" stroke-width="3"/>
      <!-- Airshow Stars -->
      <polygon points="128,26 132,38 144,38 134,46 138,58 128,50 118,58 122,46 112,38 124,38" fill="${POLISHED_BRASS}"/>
      <polygon points="128,198 132,210 144,210 134,218 138,230 128,222 118,230 122,218 112,210 124,210" fill="${POLISHED_BRASS}"/>
    </svg>`,
    { size: 256 },
  );

  // Scalloped sunburst bunting decal for wings and nose cowl
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

  // Rudder vintage stripes with stars
  const RUDDER_STRIPES = svg(
    `<svg viewBox="0 0 128 256" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="256" fill="${VINTAGE_CREAM}"/>
      <rect x="0" y="0" width="36" height="256" fill="${RACING_RED}"/>
      <rect x="52" y="0" width="24" height="256" fill="${RACING_RED}"/>
      <rect x="92" y="0" width="36" height="256" fill="${RACING_RED}"/>
      <!-- Tiny gold aviation stars -->
      <polygon points="44,40 46,47 54,47 48,52 50,59 44,54 38,59 40,52 34,47 42,47" fill="${POLISHED_BRASS}"/>
      <polygon points="44,120 46,127 54,127 48,132 50,139 44,134 38,139 40,132 34,127 42,127" fill="${POLISHED_BRASS}"/>
      <polygon points="44,200 46,207 54,207 48,212 50,219 44,214 38,219 40,212 34,207 42,207" fill="${POLISHED_BRASS}"/>
    </svg>`,
    { size: 256 },
  );

  // Altimeter instrument dial
  const DIAL_ALTIMETER = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="62" fill="#1b1c1e" stroke="${POLISHED_BRASS}" stroke-width="5"/>
      <circle cx="64" cy="64" r="52" fill="#111214"/>
      <!-- Ticks -->
      <circle cx="64" cy="64" r="46" fill="none" stroke="${VINTAGE_CREAM}" stroke-width="3" stroke-dasharray="2 12"/>
      <circle cx="64" cy="64" r="46" fill="none" stroke="${VINTAGE_CREAM}" stroke-width="1.5" stroke-dasharray="1 4"/>
      <!-- Dial needle -->
      <line x1="64" y1="64" x2="64" y2="24" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <line x1="64" y1="64" x2="88" y2="76" stroke="${RACING_RED}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="64" cy="64" r="5" fill="${POLISHED_BRASS}"/>
      <text x="64" y="92" text-anchor="middle" font-size="10" font-family="monospace" fill="${VINTAGE_CREAM}">ALT</text>
    </svg>`,
    { size: 128 },
  );

  // Airspeed indicator dial
  const DIAL_SPEED = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="62" fill="#1b1c1e" stroke="${POLISHED_BRASS}" stroke-width="5"/>
      <circle cx="64" cy="64" r="52" fill="#111214"/>
      <!-- Colored warning zones -->
      <path d="M64,64 L24,64 A40,40 0 0,1 64,24 Z" fill="#2d6e35" opacity="0.6"/>
      <path d="M64,64 L64,24 A40,40 0 0,1 104,64 Z" fill="#cf7a22" opacity="0.6"/>
      <line x1="64" y1="64" x2="42" y2="38" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <circle cx="64" cy="64" r="5" fill="${POLISHED_BRASS}"/>
      <text x="64" y="94" text-anchor="middle" font-size="10" font-family="monospace" fill="${VINTAGE_CREAM}">MPH</text>
    </svg>`,
    { size: 128 },
  );

  // Aviator goggles lens with reflected cloud & horizon glint
  const GOGGLE_GLASS = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="62" fill="${GLASS_CYAN}"/>
      <!-- Reflected cartoon clouds & sun -->
      <path d="M10,70 Q40,50 70,75 Q95,60 120,72 L128,128 L0,128 Z" fill="#68b4c9" opacity="0.6"/>
      <circle cx="86" cy="42" r="16" fill="#ffffff" opacity="0.75"/>
      <path d="M25,25 Q45,15 65,22" stroke="#ffffff" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.85"/>
    </svg>`,
    { size: 128 },
  );

  // Wheel star hubcap decal
  const HUBCAP_STAR = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="62" fill="${RACING_RED}" stroke="${POLISHED_BRASS}" stroke-width="6"/>
      <polygon points="64,18 76,48 108,50 82,72 90,104 64,86 38,104 46,72 20,50 52,48" fill="${VINTAGE_CREAM}"/>
      <circle cx="64" cy="64" r="14" fill="${POLISHED_BRASS}" stroke="${CHERRY_DARK}" stroke-width="2"/>
    </svg>`,
    { size: 128 },
  );

  // Windsock striped fabric pattern
  const WINDSOCK_TEX = svg(
    `<svg viewBox="0 0 256 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="128" fill="${VINTAGE_CREAM}"/>
      <rect x="0" y="0" width="50" height="128" fill="${RACING_RED}"/>
      <rect x="100" y="0" width="50" height="128" fill="${RACING_RED}"/>
      <rect x="200" y="0" width="56" height="128" fill="${RACING_RED}"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // Custom Procedural Paints
  // ---------------------------------------------------------------------------
  // Airplane fuselage paint: warm yellow with retro red racing side streak
  const FUSELAGE_PAINT = paint((p, n) => {
    // Red belly underside and lower taper
    if (n.y < -0.45) return RACING_RED;
    // Side dart racing stripe along fuselage
    const distFromZAxis = Math.abs(p.x);
    const dartHeight = 0.65 - (p.z + 0.3) * 0.08;
    const isDart = Math.abs(p.y - dartHeight) < 0.12 && p.z > -0.9 && p.z < 0.7;
    if (isDart && distFromZAxis > 0.22) {
      return RACING_RED;
    }
    // Thin gold accent pinstripe above and below dart
    const isGoldTrim = Math.abs(p.y - (dartHeight + 0.13)) < 0.015 || Math.abs(p.y - (dartHeight - 0.13)) < 0.015;
    if (isGoldTrim && distFromZAxis > 0.22 && p.z > -0.85 && p.z < 0.65) {
      return POLISHED_BRASS;
    }
    return CANARY_YELLOW;
  });

  // Wing paint with linen rib stitch lines
  const WING_PAINT = paint((p, n) => {
    // Spaced ribs every 0.12m across span (X axis)
    const ribPos = Math.abs((p.x % 0.12) + 0.12) % 0.12;
    const isRib = ribPos < 0.009 || ribPos > 0.111;
    // Wing tip endcaps in racing red
    if (Math.abs(p.x) > 1.15) {
      return RACING_RED;
    }
    // Gold trim pinstripe before red wingtip
    if (Math.abs(p.x) > 1.12 && Math.abs(p.x) <= 1.15) {
      return POLISHED_BRASS;
    }
    // Main upper/lower surface
    if (isRib && Math.abs(n.y) > 0.3) {
      return CANARY_YELLOW;
    }
    return VINTAGE_CREAM;
  });

  // Airstrip ground paint: mottled green grass, clover specks and worn runway dirt
  const RUNWAY_GROUND_PAINT = paint((p, n) => {
    const rDist = Math.hypot(p.x, p.z);
    // Outer grass edge
    if (rDist > 1.25) return DIRT_EARTH;
    // Diagonal chalk runway line
    const runwayLine = Math.abs(p.x * 0.7 + p.z * 0.7 + 0.1);
    if (runwayLine < 0.035 && rDist < 1.1) return CHALK_WHITE;
    // Subtle grass mottling
    const noiseVal = Math.sin(p.x * 8) * Math.cos(p.z * 8);
    return noiseVal > 0.2 ? FIELD_GRASS_LGT : FIELD_GRASS;
  });

  // ---------------------------------------------------------------------------
  // Skeleton / Hierarchy
  // ---------------------------------------------------------------------------
  // Main aircraft root joint (center of fuselage mass)
  const fuselage = b.joint("fuselage", { at: [0, 0.68, 0.15], role: "spine" });

  // Engine mount joint
  const engineJoint = b.joint("engine", {
    parent: fuselage,
    at: [0, 0.68, 0.88],
    dir: [0, 0, 1],
    role: "hinge",
  });

  // Propeller spin joint (can be rotated to spin the prop!)
  const propJoint = b.joint("propeller", {
    parent: engineJoint,
    at: [0, 0.68, 1.14],
    dir: [0, 0, 1],
    role: "fan",
  });

  // Rudder hinge joint
  const rudderJoint = b.joint("rudder", {
    parent: fuselage,
    at: [0, 0.82, -1.25],
    dir: [0, 1, 0],
    role: "hinge",
  });

  // Elevator hinge joint
  const elevatorJoint = b.joint("elevator", {
    parent: fuselage,
    at: [0, 0.62, -1.22],
    dir: [1, 0, 0],
    role: "hinge",
  });

  // Pilot torso and head joints
  const pilotTorso = b.joint("pilotTorso", {
    parent: fuselage,
    at: [0, 0.72, 0.08],
    dir: [0, 1, 0.1],
  });

  const pilotHead = b.joint("pilotHead", {
    parent: pilotTorso,
    at: [0, 0.92, 0.08],
    dir: [0, 1, 0.15],
    role: "head",
  });

  // Scarf chain fluttering back over pilot's shoulder
  const scarfChain = b.chain(
    "scarf",
    catmull([
      [0.08, 0.88, 0.04],
      [0.15, 0.86, -0.15],
      [0.22, 0.89, -0.36],
      [0.26, 0.85, -0.58],
      [0.32, 0.88, -0.78],
    ]),
    { parent: pilotHead, count: 4, role: "tail" },
  );

  // Landing gear wheels
  const wheelLJoint = b.joint("wheelL", {
    parent: fuselage,
    at: [0.38, 0.16, 0.52],
    dir: [1, 0, 0],
    role: "hinge",
  });

  const wheelRJoint = b.joint("wheelR", {
    parent: fuselage,
    at: [-0.38, 0.16, 0.52],
    dir: [-1, 0, 0],
    role: "hinge",
  });

  // ---------------------------------------------------------------------------
  // 1. Fuselage Body (Bulbous, Friendly Barnstormer Loft)
  // ---------------------------------------------------------------------------
  const fuselageStations = [
    { at: [0, 0.68, 0.96], w: 0.58, h: 0.58 }, // Nose cowl rim
    { at: [0, 0.68, 0.72], w: 0.66, h: 0.64 }, // Forward firewall
    { at: [0, 0.68, 0.38], w: 0.68, h: 0.66 }, // Cockpit forward rim
    { at: [0, 0.67, -0.05], w: 0.62, h: 0.63 }, // Cockpit seat
    { at: [0, 0.65, -0.45], w: 0.52, h: 0.55 }, // Mid fuselage
    { at: [0, 0.64, -0.85], w: 0.36, h: 0.42 }, // Aft taper
    { at: [0, 0.62, -1.22], w: 0.18, h: 0.24 }, // Tail post
    { at: [0, 0.62, -1.35], w: 0.08, h: 0.12 }, // Tail cone tip
  ];

  const mainFuselage = b.loft(fuselageStations, {
    bone: fuselage,
    color: FUSELAGE_PAINT,
    caps: "round",
  });

  // Engine Cowling Nose Ring (Chunky polished brass nose lip)
  b.part(new THREE.TorusGeometry(0.27, 0.035, 12, 24), POLISHED_BRASS, {
    bone: engineJoint,
    at: [0, 0.68, 0.96],
    dir: [0, 0, 1],
  });

  // Nose inner dark intake opening
  b.part(new THREE.CylinderGeometry(0.25, 0.25, 0.06, 20), ENGINE_DARK, {
    bone: engineJoint,
    at: [0, 0.68, 0.94],
    dir: [0, 0, 1],
  });

  // Cockpit Opening Cavity & Coaming (Rim)
  // Cockpit rim path: a rounded teardrop/oval around cockpit seat
  const cockpitHole = b.sweep(
    catmull(
      [
        [0, 0.98, 0.28],
        [0.2, 0.95, 0.16],
        [0.21, 0.93, -0.06],
        [0.17, 0.94, -0.22],
        [0, 0.96, -0.28],
        [-0.17, 0.94, -0.22],
        [-0.21, 0.93, -0.06],
        [-0.2, 0.95, 0.16],
      ],
      { closed: true },
    ),
    0.026,
    { bone: fuselage, color: LEATHER_BROWN },
  );

  // Cockpit interior dark well
  b.part(new THREE.CylinderGeometry(0.2, 0.16, 0.36, 12), COCKPIT_INTERIOR, {
    bone: fuselage,
    at: [0, 0.78, 0.04],
    scale: [0.95, 1, 1.25],
  });

  // Cockpit leather seat backrest cushion
  b.part(new THREE.CylinderGeometry(0.16, 0.14, 0.24, 10, 1, false, 0, Math.PI), LEATHER_LIGHT, {
    bone: fuselage,
    at: [0, 0.86, -0.2],
    rotation: [0, 180, 0],
  });

  // Cockpit wooden dashboard instrument panel
  const dashAt = [0, 0.88, 0.24];
  b.part(new THREE.BoxGeometry(0.32, 0.14, 0.02), PROP_WOOD_DARK, {
    bone: fuselage,
    at: dashAt,
    rotation: [-18, 0, 0],
  });

  // Instrument dials on dashboard
  b.part(new THREE.CircleGeometry(0.04, 16), "#ffffff", {
    bone: fuselage,
    at: [-0.08, 0.88, 0.25],
    rotation: [-18, 0, 0],
    texture: DIAL_ALTIMETER,
  });

  b.part(new THREE.CircleGeometry(0.04, 16), "#ffffff", {
    bone: fuselage,
    at: [0.08, 0.88, 0.25],
    rotation: [-18, 0, 0],
    texture: DIAL_SPEED,
  });

  // Flight joystick with polished brass ball grip
  b.rod([0, 0.65, 0.12], [0, 0.82, 0.14], 0.01, ENGINE_STEEL, { bone: fuselage });
  b.part(new THREE.SphereGeometry(0.02, 10, 8), POLISHED_BRASS, {
    bone: fuselage,
    at: [0, 0.82, 0.14],
  });

  // Vintage curved windscreen (tinted glass arc with brass trim)
  const windscreenFrame = catmull([
    [-0.18, 0.96, 0.22],
    [-0.14, 1.07, 0.25],
    [0, 1.09, 0.27],
    [0.14, 1.07, 0.25],
    [0.18, 0.96, 0.22],
  ]);
  b.sweep(windscreenFrame, 0.008, { bone: fuselage, color: POLISHED_BRASS });

  // Windscreen glass pane
  b.extrude(
    [
      [-0.17, 0],
      [-0.13, 0.1],
      [0, 0.12],
      [0.13, 0.1],
      [0.17, 0],
    ],
    {
      bone: fuselage,
      at: [0, 0.96, 0.25],
      x: [1, 0, 0],
      y: [0, 0.9, 0.4],
      thickness: 0.005,
      color: GLASS_CYAN,
    },
  );

  // Race Number 7 Decals on fuselage flanks
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.14, 20), "#ffffff", {
      bone: fuselage,
      at: [s * 0.33, 0.68, -0.22],
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: RACE_NUM_7,
    });
  }

  // ---------------------------------------------------------------------------
  // 2. Radial Engine (Whimsical 7-Cylinder Radial with Exposed Pushrods)
  // ---------------------------------------------------------------------------
  // Central crankcase hub dome
  b.part(new THREE.CylinderGeometry(0.14, 0.16, 0.15, 14), ENGINE_STEEL, {
    bone: engineJoint,
    at: [0, 0.68, 1.02],
    dir: [0, 0, 1],
  });
  b.part(new THREE.SphereGeometry(0.14, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), POLISHED_BRASS, {
    bone: engineJoint,
    at: [0, 0.68, 1.09],
    dir: [0, 0, 1],
  });

  // 7 radial cylinders arranged in a circle
  const numCylinders = 7;
  const cylinderRadius = 0.23;
  for (let i = 0; i < numCylinders; i++) {
    const angle = (i / numCylinders) * Math.PI * 2;
    const cylX = Math.cos(angle) * cylinderRadius;
    const cylY = 0.68 + Math.sin(angle) * cylinderRadius;
    const cylZ = 0.98;

    // Cylinder fin body
    b.capsule(
      [cylX * 0.45, 0.68 + (cylY - 0.68) * 0.45, cylZ],
      [cylX * 0.95, 0.68 + (cylY - 0.68) * 0.95, cylZ],
      0.048,
      { bone: engineJoint, color: ENGINE_STEEL },
    );

    // Cylinder ribbed cooling rings (stacked black rings)
    for (const step of [0.55, 0.7, 0.85]) {
      const ringAt: [number, number, number] = [
        cylX * step,
        0.68 + (cylY - 0.68) * step,
        cylZ,
      ];
      b.part(new THREE.TorusGeometry(0.052, 0.008, 6, 12), ENGINE_DARK, {
        bone: engineJoint,
        at: ringAt,
        dir: [cylX, cylY - 0.68, 0],
      });
    }

    // Spark plug & rocker arm cover at cylinder top
    b.part(new THREE.BoxGeometry(0.04, 0.03, 0.04), POLISHED_BRASS, {
      bone: engineJoint,
      at: [cylX, cylY, cylZ + 0.01],
      dir: [cylX, cylY - 0.68, 0],
    });

    // Twin pushrod tubes running from crankcase to cylinder head
    b.rod(
      [cylX * 0.35 - 0.015, 0.68 + (cylY - 0.68) * 0.35, cylZ + 0.045],
      [cylX * 0.92 - 0.015, 0.68 + (cylY - 0.68) * 0.92, cylZ + 0.025],
      0.005,
      CHROME_BRIGHT(POLISHED_BRASS),
      { bone: engineJoint },
    );
    b.rod(
      [cylX * 0.35 + 0.015, 0.68 + (cylY - 0.68) * 0.35, cylZ + 0.045],
      [cylX * 0.92 + 0.015, 0.68 + (cylY - 0.68) * 0.92, cylZ + 0.025],
      0.005,
      CHROME_BRIGHT(POLISHED_BRASS),
      { bone: engineJoint },
    );
  }

  function CHROME_BRIGHT(color: string) {
    return color;
  }

  // Exhaust manifold collector ring behind radial engine
  b.part(new THREE.TorusGeometry(0.24, 0.022, 10, 24), COPPER_PIPE, {
    bone: engineJoint,
    at: [0, 0.68, 0.92],
    dir: [0, 0, 1],
  });

  // Twin dramatic swooping exhaust tailpipes on both lower flanks
  for (const s of [1, -1]) {
    const exhaustCurve = catmull([
      [s * 0.22, 0.58, 0.9],
      [s * 0.28, 0.52, 0.7],
      [s * 0.31, 0.49, 0.4],
      [s * 0.34, 0.47, 0.1],
    ]);
    b.sweep(exhaustCurve, [0.024, 0.028], { bone: fuselage, color: COPPER_PIPE });
    // Sooty flared exhaust mouth
    b.part(new THREE.CylinderGeometry(0.03, 0.022, 0.04, 10, 1, true), ENGINE_DARK, {
      bone: fuselage,
      at: [s * 0.34, 0.47, 0.08],
      dir: [s * 0.1, -0.05, -1],
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Propeller Assembly (Two-Blade Laminated Wooden Prop with Brass Tips)
  // ---------------------------------------------------------------------------
  // Propeller central hub dome & retaining nut
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 16), POLISHED_BRASS, {
    bone: propJoint,
    at: [0, 0.68, 1.13],
    dir: [0, 0, 1],
  });
  // Aerodynamic pointed spinner cone
  b.part(new THREE.ConeGeometry(0.07, 0.14, 16), RACING_RED, {
    bone: propJoint,
    at: [0, 0.68, 1.22],
    dir: [0, 0, 1],
  });

  // Two laminated propeller blades
  const propHalfSpan = 0.48;
  for (const side of [1, -1]) {
    const bladeCurve = catmull([
      [0, 0.68 + side * 0.06, 1.14],
      [side * 0.015, 0.68 + side * 0.24, 1.14],
      [side * 0.008, 0.68 + side * 0.42, 1.14],
      [0, 0.68 + side * propHalfSpan, 1.14],
    ]);

    // Swept wooden paddle blade
    b.sweep(bladeCurve, (t) => [0.045 * Math.sin(t * Math.PI) + 0.015, 0.009], {
      bone: propJoint,
      color: side > 0 ? PROP_WOOD_LIGHT : PROP_WOOD_DARK,
      caps: "round",
    });

    // Laminated accent layer
    b.sweep(bladeCurve, (t) => [0.032 * Math.sin(t * Math.PI) + 0.008, 0.01], {
      bone: propJoint,
      color: side > 0 ? PROP_WOOD_DARK : PROP_WOOD_LIGHT,
    });

    // Brass blade protective leading tip caps
    b.capsule(
      [0, 0.68 + side * (propHalfSpan - 0.09), 1.14],
      [0, 0.68 + side * (propHalfSpan - 0.01), 1.14],
      0.018,
      { bone: propJoint, color: POLISHED_BRASS },
    );
  }

  // ---------------------------------------------------------------------------
  // 4. Wings & Struts (Staggered Biplane Configuration)
  // ---------------------------------------------------------------------------
  // Airfoil section station helper
  const topWingSpan = 2.4;
  const topChord = 0.46;
  const topWingY = 1.16;
  const topWingZ = 0.24; // Staggered forward

  const bottomWingSpan = 2.0;
  const bottomChord = 0.38;
  const bottomWingY = 0.52;
  const bottomWingZ = 0.08; // Staggered back

  // TOP WING: Generous gentle curve with center trailing-edge pilot cutout
  const topWingStations = [
    { at: [-topWingSpan * 0.5, topWingY + 0.02, topWingZ], w: 0.16, h: 0.035 }, // Left rounded tip
    { at: [-topWingSpan * 0.42, topWingY + 0.01, topWingZ], w: topChord, h: 0.05 },
    { at: [-topWingSpan * 0.2, topWingY, topWingZ], w: topChord * 1.02, h: 0.052 },
    { at: [-0.14, topWingY, topWingZ], w: topChord, h: 0.05 },
    { at: [0, topWingY, topWingZ + 0.04], w: topChord * 0.78, h: 0.048 }, // Cutout above cockpit
    { at: [0.14, topWingY, topWingZ], w: topChord, h: 0.05 },
    { at: [topWingSpan * 0.2, topWingY, topWingZ], w: topChord * 1.02, h: 0.052 },
    { at: [topWingSpan * 0.42, topWingY + 0.01, topWingZ], w: topChord, h: 0.05 },
    { at: [topWingSpan * 0.5, topWingY + 0.02, topWingZ], w: 0.16, h: 0.035 }, // Right rounded tip
  ];

  b.loft(topWingStations, {
    bone: fuselage,
    color: WING_PAINT,
    caps: "round",
  });

  // Top Wing Scalloped Red Bunting Decal across leading edge
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.9, 0.18), "#ffffff", {
      bone: fuselage,
      at: [s * 0.52, topWingY + 0.028, topWingZ + 0.12],
      rotation: [-90, 0, s > 0 ? 0 : 180],
      texture: SCALLOP_BUNTING,
    });

    // Racing roundel #7 on upper wing tops
    b.part(new THREE.CircleGeometry(0.16, 24), "#ffffff", {
      bone: fuselage,
      at: [s * 0.82, topWingY + 0.028, topWingZ - 0.02],
      rotation: [-90, 0, 0],
      texture: RACE_NUM_7,
    });
  }

  // BOTTOM WING: Mounted at bottom of fuselage
  const bottomWingStations = [
    { at: [-bottomWingSpan * 0.5, bottomWingY + 0.03, bottomWingZ], w: 0.14, h: 0.032 },
    { at: [-bottomWingSpan * 0.38, bottomWingY + 0.015, bottomWingZ], w: bottomChord, h: 0.046 },
    { at: [-0.3, bottomWingY, bottomWingZ], w: bottomChord, h: 0.048 },
    { at: [0, bottomWingY, bottomWingZ], w: bottomChord * 0.95, h: 0.048 },
    { at: [0.3, bottomWingY, bottomWingZ], w: bottomChord, h: 0.048 },
    { at: [bottomWingSpan * 0.38, bottomWingY + 0.015, bottomWingZ], w: bottomChord, h: 0.046 },
    { at: [bottomWingSpan * 0.5, bottomWingY + 0.03, bottomWingZ], w: 0.14, h: 0.032 },
  ];

  b.loft(bottomWingStations, {
    bone: fuselage,
    color: WING_PAINT,
    caps: "round",
  });

  // Wing Struts:
  // A. Center Cabane Struts (Connecting fuselage to center top wing)
  const cabanePoints: [number, number, number][][] = [
    // Front cabane struts
    [[-0.18, 0.95, 0.32], [-0.14, topWingY - 0.02, topWingZ + 0.1]],
    [[0.18, 0.95, 0.32], [0.14, topWingY - 0.02, topWingZ + 0.1]],
    // Rear cabane struts
    [[-0.2, 0.94, 0.06], [-0.14, topWingY - 0.02, topWingZ - 0.12]],
    [[0.2, 0.94, 0.06], [0.14, topWingY - 0.02, topWingZ - 0.12]],
  ];

  for (const [start, end] of cabanePoints) {
    b.rod(start, end, 0.012, POLISHED_BRASS, { bone: fuselage });
  }

  // B. Outer Interplane N-Struts (Connecting top and bottom wings left/right)
  for (const s of [1, -1]) {
    const xBase = s * 0.78;
    const xTop = s * 0.82;

    const frontLower: [number, number, number] = [xBase, bottomWingY + 0.02, bottomWingZ + 0.12];
    const frontUpper: [number, number, number] = [xTop, topWingY - 0.02, topWingZ + 0.14];
    const rearLower: [number, number, number] = [xBase, bottomWingY + 0.02, bottomWingZ - 0.12];
    const rearUpper: [number, number, number] = [xTop, topWingY - 0.02, topWingZ - 0.14];

    // Front vertical strut
    b.rod(frontLower, frontUpper, 0.015, CANARY_YELLOW, { bone: fuselage });
    // Rear vertical strut
    b.rod(rearLower, rearUpper, 0.015, CANARY_YELLOW, { bone: fuselage });
    // Diagonal N-cross brace
    b.rod(rearLower, frontUpper, 0.013, RACING_RED, { bone: fuselage });

    // Rigging tension cross-wires with tiny brass turnbuckle spools
    b.rod(frontLower, rearUpper, 0.003, ENGINE_STEEL, { bone: fuselage });
    b.rod(rearLower, frontUpper, 0.003, ENGINE_STEEL, { bone: fuselage });

    // Wing landing tension wire running from upper cabane down to lower outer wing
    b.rod([-s * 0.14, topWingY - 0.02, topWingZ], frontLower, 0.0035, ENGINE_STEEL, { bone: fuselage });
    b.rod([-s * 0.14, topWingY - 0.02, topWingZ], rearLower, 0.0035, ENGINE_STEEL, { bone: fuselage });

    // Wing ailerons details (tiny hinges on top wing)
    b.capsule(
      [s * 0.65, topWingY, topWingZ - 0.18],
      [s * 1.05, topWingY, topWingZ - 0.18],
      0.012,
      { bone: fuselage, color: RACING_RED },
    );
  }

  // Pitot Tube (Airspeed sensor on left outer wing strut)
  b.rod([-0.84, topWingY - 0.15, topWingZ + 0.14], [-0.84, topWingY - 0.15, topWingZ + 0.32], 0.004, POLISHED_BRASS, {
    bone: fuselage,
  });
  b.rod([-0.84, topWingY - 0.15, topWingZ + 0.32], [-0.84, topWingY - 0.12, topWingZ + 0.34], 0.004, POLISHED_BRASS, {
    bone: fuselage,
  });

  // ---------------------------------------------------------------------------
  // 5. Tail Unit (Rudder, Vertical Fin, Stabilizers, Elevators, Tail Skid)
  // ---------------------------------------------------------------------------
  // Vertical Fin (Fixed portion)
  const finOutline: [number, number, "sharp"?][] = [
    [0, 0, "sharp"],
    [0.45, 0, "sharp"],
    [0.42, 0.32],
    [0.15, 0.44],
    [-0.05, 0.28],
    [-0.08, 0.0],
  ];

  b.extrude(finOutline, {
    bone: fuselage,
    at: [0, 0.66, -0.75],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.035,
    bevel: 0.006,
    color: CANARY_YELLOW,
  });

  // Movable Rudder (Hinged at rudderJoint)
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
    thickness: 0.03,
    bevel: 0.005,
    color: RACING_RED,
  });

  // Rudder stripes decal
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.24, 0.38), "#ffffff", {
      bone: rudderJoint,
      at: [s * 0.017, 0.86, -1.34],
      rotation: [0, s > 0 ? 90 : -90, 0],
      texture: RUDDER_STRIPES,
    });
  }

  // Horizontal Stabilizer & Elevators
  const horizStabStations = [
    { at: [-0.46, 0.64, -1.14], w: 0.08, h: 0.025 },
    { at: [-0.35, 0.64, -1.12], w: 0.28, h: 0.032 },
    { at: [0, 0.64, -1.08], w: 0.34, h: 0.036 },
    { at: [0.35, 0.64, -1.12], w: 0.28, h: 0.032 },
    { at: [0.46, 0.64, -1.14], w: 0.08, h: 0.025 },
  ];

  b.loft(horizStabStations, {
    bone: elevatorJoint,
    color: CANARY_YELLOW,
    caps: "round",
  });

  // Elevator trailing flap bar (Red)
  b.capsule([-0.44, 0.64, -1.24], [0.44, 0.64, -1.24], 0.018, {
    bone: elevatorJoint,
    color: RACING_RED,
  });

  // Tail bracing wire struts
  for (const s of [1, -1]) {
    b.rod([s * 0.32, 0.64, -1.12], [0, 0.94, -1.1], 0.003, ENGINE_STEEL, { bone: fuselage });
    b.rod([s * 0.32, 0.64, -1.12], [0, 0.58, -1.1], 0.003, ENGINE_STEEL, { bone: fuselage });
  }

  // Tail Skid: Curved sprung-steel leaf with brass shoe
  const tailSkidCurve = catmull([
    [0, 0.58, -1.12],
    [0, 0.42, -1.22],
    [0, 0.34, -1.28],
    [0, 0.32, -1.35],
  ]);
  b.sweep(tailSkidCurve, 0.012, { bone: fuselage, color: ENGINE_DARK });
  b.part(new THREE.BoxGeometry(0.03, 0.015, 0.06), POLISHED_BRASS, {
    bone: fuselage,
    at: [0, 0.32, -1.32],
  });

  // ---------------------------------------------------------------------------
  // 6. Main Undercarriage & Balloon Wheels
  // ---------------------------------------------------------------------------
  // Main landing gear legs: V-struts from fuselage belly to wheel hubs
  const axleY = 0.16;
  const axleZ = 0.52;
  const trackX = 0.38;

  for (const s of [1, -1]) {
    const wheelBone = s > 0 ? wheelLJoint : wheelRJoint;
    const hubPos: [number, number, number] = [s * trackX, axleY, axleZ];

    // Forward landing gear strut
    b.rod([s * 0.22, 0.48, 0.68], hubPos, 0.018, CANARY_YELLOW, { bone: fuselage });
    // Rear landing gear strut
    b.rod([s * 0.22, 0.48, 0.36], hubPos, 0.018, CANARY_YELLOW, { bone: fuselage });

    // Streamlined aerodynamic axle spreader fairing
    b.rod([0, axleY + 0.01, axleZ], hubPos, 0.014, RACING_RED, { bone: fuselage });

    // Bungee suspension shock cord wrapping
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.06, 10), LEATHER_BROWN, {
      bone: fuselage,
      at: [s * (trackX - 0.05), axleY + 0.03, axleZ],
      dir: [s, 0.4, 0],
    });

    // FAT BALLOON PNEUMATIC WHEEL:
    // Outer rubber tire (torus)
    b.part(new THREE.TorusGeometry(0.12, 0.045, 12, 24), RUBBER_BLACK, {
      bone: wheelBone,
      at: hubPos,
      dir: [s, 0, 0],
    });

    // Inner painted rim disc
    b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.048, 18), WHEEL_CREAM, {
      bone: wheelBone,
      at: hubPos,
      dir: [s, 0, 0],
    });

    // Star Hubcap Decal on outer wheel face
    b.part(new THREE.CircleGeometry(0.08, 16), "#ffffff", {
      bone: wheelBone,
      at: [s * (trackX + 0.026), axleY, axleZ],
      dir: [s, 0, 0],
      axis: "z",
      texture: HUBCAP_STAR,
    });

    // Inner wheel hub nut
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.07, 8), POLISHED_BRASS, {
      bone: wheelBone,
      at: hubPos,
      dir: [s, 0, 0],
    });
  }

  // Cross-axle connecting both wheels
  b.rod([-trackX + 0.03, axleY, axleZ], [trackX - 0.03, axleY, axleZ], 0.012, ENGINE_STEEL, { bone: fuselage });

  // ---------------------------------------------------------------------------
  // 7. Whimsical Puppet Aviator Character
  // ---------------------------------------------------------------------------
  // Aviator Torso (Leather flight jacket sitting in cockpit)
  b.part(new THREE.CylinderGeometry(0.13, 0.15, 0.22, 12), LEATHER_BROWN, {
    bone: pilotTorso,
    at: [0, 0.76, 0.06],
    scale: [1.1, 1, 0.9],
  });

  // Sheepskin fleece collar
  b.part(new THREE.TorusGeometry(0.11, 0.03, 8, 16), VINTAGE_CREAM, {
    bone: pilotTorso,
    at: [0, 0.86, 0.06],
    dir: [0, 1, 0.2],
  });

  // Pilot arms gripping the cockpit coaming & stick
  for (const s of [1, -1]) {
    const shoulder: [number, number, number] = [s * 0.13, 0.84, 0.06];
    const hand: [number, number, number] = [s * 0.06, 0.84, 0.16];
    b.capsule(shoulder, hand, 0.034, { bone: pilotTorso, color: LEATHER_BROWN });
    // Leather gloves
    b.part(new THREE.SphereGeometry(0.032, 8, 8), LEATHER_LIGHT, {
      bone: pilotTorso,
      at: hand,
    });
  }

  // Aviator Head (Stylized round puppet head)
  const headPos: [number, number, number] = [0, 0.98, 0.09];
  b.part(new THREE.SphereGeometry(0.125, 16, 14), "#f0c29e", {
    bone: pilotHead,
    at: headPos,
  });

  // Leather Aviator Cap / Flying Helmet
  b.part(new THREE.SphereGeometry(0.13, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), LEATHER_BROWN, {
    bone: pilotHead,
    at: [0, 0.99, 0.08],
  });

  // Helmet side earflaps with brass snaps
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.02, 10), LEATHER_BROWN, {
      bone: pilotHead,
      at: [s * 0.125, 0.96, 0.08],
      dir: [s, 0, 0],
    });
    b.part(new THREE.SphereGeometry(0.012, 8, 6), POLISHED_BRASS, {
      bone: pilotHead,
      at: [s * 0.136, 0.96, 0.08],
    });
    // Chin strap under head
    b.rod([s * 0.11, 0.93, 0.08], [0, 0.88, 0.11], 0.008, LEATHER_BROWN, { bone: pilotHead });
  }

  // Whimsical Aviator Goggles (Resting proudly over forehead/eyes)
  for (const s of [1, -1]) {
    const goggleCenter: [number, number, number] = [s * 0.052, 1.01, 0.185];
    // Brass frame ring
    b.part(new THREE.TorusGeometry(0.038, 0.009, 8, 16), POLISHED_BRASS, {
      bone: pilotHead,
      at: goggleCenter,
      dir: [s * 0.2, 0.1, 1],
    });
    // Glass lens with reflection
    b.part(new THREE.CircleGeometry(0.034, 16), "#ffffff", {
      bone: pilotHead,
      at: [s * 0.052, 1.01, 0.188],
      dir: [s * 0.2, 0.1, 1],
      axis: "z",
      texture: GOGGLE_GLASS,
    });
  }
  // Goggle bridge connector & elastic strap around helmet
  b.rod([-0.025, 1.01, 0.19], [0.025, 1.01, 0.19], 0.008, POLISHED_BRASS, { bone: pilotHead });
  b.sweep(
    catmull([
      [-0.08, 1.0, 0.16],
      [-0.13, 1.0, 0.07],
      [0, 1.01, -0.04],
      [0.13, 1.0, 0.07],
      [0.08, 1.0, 0.16],
    ]),
    0.01,
    { bone: pilotHead, color: LEATHER_LIGHT },
  );

  // Friendly Puppet Face Features:
  // Button nose
  b.part(new THREE.SphereGeometry(0.024, 10, 8), "#e89f78", {
    bone: pilotHead,
    at: [0, 0.96, 0.21],
  });

  // Whimsical barnstormer mustache (two curled teardrops)
  for (const s of [1, -1]) {
    const stacheCurve = catmull([
      [0, 0.94, 0.205],
      [s * 0.04, 0.945, 0.2],
      [s * 0.08, 0.96, 0.17],
    ]);
    b.sweep(stacheCurve, [0.014, 0.004], { bone: pilotHead, color: PROP_WOOD_DARK });
  }

  // ---------------------------------------------------------------------------
  // 8. Billowing Silk Aviator Scarf
  // ---------------------------------------------------------------------------
  // Scarf neck wrap loop
  b.part(new THREE.TorusGeometry(0.12, 0.032, 10, 18), SCARF_WHITE, {
    bone: pilotHead,
    at: [0, 0.88, 0.08],
    dir: [0, 1, 0.1],
  });

  // Trailing flutter scarf ribbons blowing in the slipstream
  b.sweep(scarfChain, (t) => [0.07 * (1 - t * 0.3) + 0.02, 0.01], {
    color: countershade(SCARF_WHITE, SCARF_SHADOW, { level: 0.1 }),
    caps: "round",
  });

  // Second decorative fringe strand
  const scarfFringe = catmull([
    [0.08, 0.87, 0.02],
    [0.19, 0.84, -0.18],
    [0.28, 0.82, -0.42],
    [0.34, 0.81, -0.65],
  ]);
  b.sweep(scarfFringe, [0.038, 0.015], { bone: pilotHead, color: SCARF_WHITE });

  // ---------------------------------------------------------------------------
  // 9. Staged Airfield Vignette & Scenic Accessories
  // ---------------------------------------------------------------------------
  // Grassy mound ground base (sitting on y = 0, gently rounded)
  b.lathe(
    [
      [0, 0, "sharp"],
      [1.4, 0, "sharp"],
      [1.38, 0.04],
      [1.25, 0.065],
      [0.8, 0.07],
      [0, 0.07, "sharp"],
    ],
    {
      at: [0, 0, 0],
      axis: [0, 1, 0],
      segments: 32,
      color: RUNWAY_GROUND_PAINT,
    },
  );

  // Dirt bevel edge rim around base perimeter
  b.part(new THREE.TorusGeometry(1.36, 0.025, 8, 36), DIRT_EARTH, {
    at: [0, 0.025, 0],
    dir: [0, 1, 0],
  });

  // Scenic Prop 1: Vintage Wooden Wheel Chock (Planted right in front of right wheel)
  const chockOutline: [number, number, "sharp"?][] = [
    [0, 0, "sharp"],
    [0.16, 0, "sharp"],
    [0.16, 0.07, "sharp"],
    [0, 0, "sharp"],
  ];
  b.extrude(chockOutline, {
    at: [-0.44, 0.065, 0.62],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.12,
    bevel: 0.005,
    color: PROP_WOOD_LIGHT,
  });
  // Chock rope pull handle
  const chockRope = catmull([
    [-0.44, 0.09, 0.72],
    [-0.48, 0.12, 0.74],
    [-0.48, 0.08, 0.68],
  ]);
  b.sweep(chockRope, 0.006, { color: VINTAGE_CREAM });

  // Scenic Prop 2: Airfield Windsock on Striped Mast (Behind left wing)
  const mastPos: [number, number, number] = [0.92, 0.065, -0.65];
  // Wooden mounting base post
  b.part(new THREE.CylinderGeometry(0.04, 0.045, 0.12, 10), DIRT_EARTH, {
    at: [mastPos[0], mastPos[1] + 0.06, mastPos[2]],
  });
  // Red & White striped mast
  b.sweep(
    catmull([
      [mastPos[0], mastPos[1] + 0.1, mastPos[2]],
      [mastPos[0], mastPos[1] + 1.25, mastPos[2]],
    ]),
    0.016,
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
  // Brass pivot finial on top of mast
  b.part(new THREE.SphereGeometry(0.03, 10, 8), POLISHED_BRASS, {
    at: [mastPos[0], mastPos[1] + 1.26, mastPos[2]],
  });

  // Swiveling wire frame ring & fabric windsock cone (Trailing in the breeze)
  const sockStart: [number, number, number] = [mastPos[0], mastPos[1] + 1.24, mastPos[2]];
  const sockCurve = catmull([
    sockStart,
    [sockStart[0] + 0.08, sockStart[1] - 0.02, sockStart[2] - 0.15],
    [sockStart[0] + 0.14, sockStart[1] - 0.06, sockStart[2] - 0.32],
    [sockStart[0] + 0.18, sockStart[1] - 0.12, sockStart[2] - 0.48],
  ]);
  // Tapered windsock body with striped bands
  b.sweep(sockCurve, [0.08, 0.032], {
    color: VINTAGE_CREAM,
    bands: [
      [0.25, RACING_RED],
      [0.5, VINTAGE_CREAM],
      [0.75, RACING_RED],
      [1.0, VINTAGE_CREAM],
    ],
    caps: { start: "flat", end: "round" },
  });
  // Metal throat hoop
  b.part(new THREE.TorusGeometry(0.08, 0.008, 8, 16), ENGINE_STEEL, {
    at: sockStart,
    dir: [0.3, -0.1, -1],
  });

  // Scenic Prop 3: Vintage Aviation Oil Drum & Brass Jerrycan (Ground crew accessories)
  const drumPos: [number, number, number] = [-0.85, 0.065, -0.45];
  // 55-gallon oil drum with rib rings
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.38, 16), RACING_RED, {
    at: [drumPos[0], drumPos[1] + 0.19, drumPos[2]],
  });
  // Drum ribs
  b.part(new THREE.TorusGeometry(0.152, 0.009, 6, 18), CHERRY_DARK, {
    at: [drumPos[0], drumPos[1] + 0.12, drumPos[2]],
    dir: [0, 1, 0],
  });
  b.part(new THREE.TorusGeometry(0.152, 0.009, 6, 18), CHERRY_DARK, {
    at: [drumPos[0], drumPos[1] + 0.26, drumPos[2]],
    dir: [0, 1, 0],
  });
  // Drum brass bung & hand pump
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.08, 8), POLISHED_BRASS, {
    at: [drumPos[0] + 0.05, drumPos[1] + 0.4, drumPos[2]],
  });
  b.part(new THREE.TorusGeometry(0.03, 0.006, 6, 10), POLISHED_BRASS, {
    at: [drumPos[0] + 0.05, drumPos[1] + 0.44, drumPos[2]],
    dir: [1, 0, 0],
  });

  // Vintage Brass Jerrycan beside drum
  const canPos: [number, number, number] = [-0.68, 0.065, -0.28];
  b.part(new THREE.BoxGeometry(0.14, 0.18, 0.09), POLISHED_BRASS, {
    at: [canPos[0], canPos[1] + 0.09, canPos[2]],
    rotation: [0, 24, 0],
  });
  // Jerrycan three-bar top handle
  b.rod([canPos[0], canPos[1] + 0.18, canPos[2] - 0.02], [canPos[0], canPos[1] + 0.18, canPos[2] + 0.02], 0.007, BRASS_DARK);
  // Oily rag draped over edge
  b.part(new THREE.BoxGeometry(0.05, 0.08, 0.06), VINTAGE_CREAM, {
    at: [canPos[0] + 0.05, canPos[1] + 0.12, canPos[2]],
    rotation: [12, 24, -18],
  });

  // Scenic Detail 4: Wildflower / Buttercup Grass Sprigs scattered on airfield
  const flowerRng = rng(42);
  for (let i = 0; i < 22; i++) {
    const fAngle = flowerRng() * Math.PI * 2;
    const fDist = 0.65 + flowerRng() * 0.6;
    const fx = Math.cos(fAngle) * fDist;
    const fz = Math.sin(fAngle) * fDist;
    const fy = 0.068;

    // Tiny clover / leaf blades
    b.part(new THREE.ConeGeometry(0.02, 0.05, 4), FIELD_GRASS_LGT, {
      at: [fx, fy + 0.02, fz],
      dir: [flowerRng() * 0.4 - 0.2, 1, flowerRng() * 0.4 - 0.2],
    });

    // Yellow buttercup or white daisy blossom
    if (i % 3 === 0) {
      const flowerColor = i % 2 === 0 ? CANARY_YELLOW : VINTAGE_CREAM;
      b.part(new THREE.SphereGeometry(0.012, 6, 6), flowerColor, {
        at: [fx, fy + 0.05, fz],
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Gentle Initial Pose for Rig Readiness & Whimsical Character
  // ---------------------------------------------------------------------------
  // Slightly turn rudder to add playful attitude
  b.pose(rudderJoint, { axis: [0, 1, 0], deg: -8 });

  // Slightly elevate tail elevators
  b.pose(elevatorJoint, { axis: [1, 0, 0], deg: -4 });

  // Spin propeller slightly so blades sit at a dynamic 28-degree diagonal
  b.pose(propJoint, { axis: [0, 0, 1], deg: 28 });

  // Pilot heads tilted with adventurous grin
  b.pose(pilotHead, { axis: [0, 1, 0], deg: 12 });
  b.pose(pilotHead, { axis: [0, 0, 1], deg: -6 });

  return b.root;
}
