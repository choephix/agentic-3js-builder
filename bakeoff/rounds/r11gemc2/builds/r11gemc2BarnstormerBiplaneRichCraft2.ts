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
    "A whimsical golden-age barnstormer biplane with an exposed radial engine, laminated propeller, intrepid puppet aviator, billowing silk scarf, and grass airstrip staging.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "barnstormer-biplane", detail: 1.0 });

  // ---------------------------------------------------------------------------
  // Color Palette
  // ---------------------------------------------------------------------------
  const CANARY_YELLOW = "#f6b924";
  const RACING_RED = "#cf2328";
  const CHERRY_DARK = "#861216";
  const VINTAGE_CREAM = "#fcf6e2";
  const COCKPIT_INTERIOR = "#241b14";
  const LEATHER_BROWN = "#542713";
  const LEATHER_LIGHT = "#96522a";
  const ENGINE_STEEL = "#4d535c";
  const ENGINE_DARK = "#1e2124";
  const POLISHED_BRASS = "#e5b43e";
  const BRASS_DARK = "#8e6718";
  const COPPER_PIPE = "#ba5a33";
  const RUBBER_BLACK = "#222326";
  const WHEEL_CREAM = "#f4ebd0";
  const PROP_WOOD_LIGHT = "#d89c5b";
  const PROP_WOOD_DARK = "#5c2410";
  const SCARF_WHITE = "#fbfbfa";
  const SCARF_SHADOW = "#dedee6";
  const GLASS_CYAN = "#a8e5f2";
  const FIELD_GRASS = "#4a7c2c";
  const FIELD_GRASS_LGT = "#629e36";
  const DIRT_EARTH = "#423222";
  const CHALK_WHITE = "#ecf0e4";

  // ---------------------------------------------------------------------------
  // Textures (SVG Drawings)
  // ---------------------------------------------------------------------------
  // Lucky 7 Racing Roundel
  const RACE_NUM_7 = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <circle cx="128" cy="128" r="124" fill="${VINTAGE_CREAM}" stroke="${RACING_RED}" stroke-width="12"/>
      <circle cx="128" cy="128" r="106" fill="none" stroke="${POLISHED_BRASS}" stroke-width="5" stroke-dasharray="10 8"/>
      <path d="M72 68 H184 L126 196 H88 L140 88 H72 Z" fill="${RACING_RED}" stroke="${CHERRY_DARK}" stroke-width="4"/>
      <polygon points="128,26 132,38 144,38 134,46 138,58 128,50 118,58 122,46 112,38 124,38" fill="${POLISHED_BRASS}"/>
      <polygon points="128,198 132,210 144,210 134,218 138,230 128,222 118,230 122,218 112,210 124,210" fill="${POLISHED_BRASS}"/>
    </svg>`,
    { size: 256 },
  );

  // Scalloped Airshow Wing Bunting
  const SCALLOP_BUNTING = svg(
    `<svg viewBox="0 0 256 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,0 L256,0 L256,14 
               Q240,48 224,14 Q208,48 192,14 Q176,48 160,14 
               Q144,48 128,14 Q112,48 96,14 Q80,48 64,14 
               Q48,48 32,14 Q16,48 0,14 Z" fill="${RACING_RED}"/>
      <path d="M0,0 L256,0 L256,6 
               Q240,32 224,6 Q208,32 192,6 Q176,32 160,6 
               Q144,32 128,6 Q112,32 96,6 Q80,32 64,6 
               Q48,32 32,6 Q16,32 0,6 Z" fill="${POLISHED_BRASS}"/>
    </svg>`,
    { size: 256 },
  );

  // Rudder Airshow Stripes
  const RUDDER_STRIPES = svg(
    `<svg viewBox="0 0 128 256" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="256" fill="${VINTAGE_CREAM}"/>
      <rect x="0" y="0" width="34" height="256" fill="${RACING_RED}"/>
      <rect x="50" y="0" width="28" height="256" fill="${RACING_RED}"/>
      <rect x="94" y="0" width="34" height="256" fill="${RACING_RED}"/>
      <polygon points="42,45 44,52 52,52 46,57 48,64 42,59 36,64 38,57 32,52 40,52" fill="${POLISHED_BRASS}"/>
      <polygon points="42,125 44,132 52,132 46,137 48,144 42,139 36,144 38,137 32,132 40,132" fill="${POLISHED_BRASS}"/>
      <polygon points="42,205 44,212 52,212 46,217 48,224 42,219 36,224 38,217 32,212 40,212" fill="${POLISHED_BRASS}"/>
    </svg>`,
    { size: 256 },
  );

  // Pilot Puppet Eyes
  const PUPPET_EYE = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="60" fill="#ffffff" stroke="${COCKPIT_INTERIOR}" stroke-width="4"/>
      <ellipse cx="64" cy="64" rx="34" ry="42" fill="#2d527a"/>
      <ellipse cx="64" cy="64" rx="22" ry="28" fill="#11151c"/>
      <circle cx="50" cy="48" r="14" fill="#ffffff"/>
      <circle cx="78" cy="76" r="6" fill="#ffffff"/>
      <path d="M20,24 Q64,8 108,24" stroke="${COCKPIT_INTERIOR}" stroke-width="12" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 128 },
  );

  // Altimeter Instrument Dial
  const DIAL_ALTIMETER = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="62" fill="#1b1c1e" stroke="${POLISHED_BRASS}" stroke-width="6"/>
      <circle cx="64" cy="64" r="50" fill="#111214"/>
      <circle cx="64" cy="64" r="44" fill="none" stroke="${VINTAGE_CREAM}" stroke-width="3" stroke-dasharray="2 12"/>
      <line x1="64" y1="64" x2="64" y2="24" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <line x1="64" y1="64" x2="88" y2="76" stroke="${RACING_RED}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="64" cy="64" r="5" fill="${POLISHED_BRASS}"/>
      <text x="64" y="94" text-anchor="middle" font-size="10" font-family="sans-serif" font-weight="bold" fill="${VINTAGE_CREAM}">ALT</text>
    </svg>`,
    { size: 128 },
  );

  // Airspeed Indicator Dial
  const DIAL_SPEED = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="62" fill="#1b1c1e" stroke="${POLISHED_BRASS}" stroke-width="6"/>
      <circle cx="64" cy="64" r="50" fill="#111214"/>
      <path d="M64,64 L24,64 A40,40 0 0,1 64,24 Z" fill="#2d6e35" opacity="0.6"/>
      <path d="M64,64 L64,24 A40,40 0 0,1 104,64 Z" fill="#cf7a22" opacity="0.6"/>
      <line x1="64" y1="64" x2="42" y2="38" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <circle cx="64" cy="64" r="5" fill="${POLISHED_BRASS}"/>
      <text x="64" y="94" text-anchor="middle" font-size="10" font-family="sans-serif" font-weight="bold" fill="${VINTAGE_CREAM}">MPH</text>
    </svg>`,
    { size: 128 },
  );

  // Aviator Goggles Amber Glint Lens
  const GOGGLE_GLASS = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="62" fill="#d9982e"/>
      <circle cx="64" cy="64" r="56" fill="#f0bc4a"/>
      <path d="M12,70 Q42,50 72,75 Q96,60 122,72 L128,128 L0,128 Z" fill="#aa7016" opacity="0.5"/>
      <circle cx="86" cy="42" r="16" fill="#ffffff" opacity="0.85"/>
      <path d="M26,26 Q46,16 68,22" stroke="#ffffff" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.9"/>
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

  // Fuel Drum Stencil Decal
  const FUEL_DRUM_LABEL = svg(
    `<svg viewBox="0 0 256 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="128" fill="${RACING_RED}"/>
      <rect x="12" y="12" width="232" height="104" fill="none" stroke="${VINTAGE_CREAM}" stroke-width="4" stroke-dasharray="12 6"/>
      <text x="128" y="52" text-anchor="middle" font-size="28" font-family="sans-serif" font-weight="900" fill="${VINTAGE_CREAM}" letter-spacing="4">AERO-OIL</text>
      <text x="128" y="84" text-anchor="middle" font-size="20" font-family="sans-serif" font-weight="700" fill="${POLISHED_BRASS}">GRADE 60 HD</text>
      <polygon points="128,94 133,104 145,104 135,111 139,122 128,115 117,122 121,111 111,104 123,104" fill="${VINTAGE_CREAM}"/>
    </svg>`,
    { size: 256 },
  );

  // Chock Hazard Stripes
  const CHOCK_HAZARD = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" fill="${CANARY_YELLOW}"/>
      <polygon points="0,0 32,0 0,32" fill="#1b1c1e"/>
      <polygon points="64,0 96,0 0,96 0,64" fill="#1b1c1e"/>
      <polygon points="128,0 128,32 32,128 0,128" fill="#1b1c1e"/>
      <polygon points="128,64 128,96 96,128 64,128" fill="#1b1c1e"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------
  // Custom Procedural Paints
  // ---------------------------------------------------------------------------
  // Fuselage clean airshow paint
  const FUSELAGE_PAINT = paint((p, n) => {
    if (n.y < -0.45) return RACING_RED;
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

  // Airfield Runway Grass Paint
  const RUNWAY_GROUND_PAINT = paint((p) => {
    const rDist = Math.hypot(p.x, p.z);
    if (rDist > 1.28) return DIRT_EARTH;
    // Crisp white chalk takeoff line
    const runwayLine = Math.abs(p.x * 0.7 + p.z * 0.7 + 0.08);
    if (runwayLine < 0.032 && rDist < 1.18) return CHALK_WHITE;
    // Gentle mowing directional stripes
    const mowed = Math.sin((p.x - p.z) * 14);
    return mowed > 0 ? FIELD_GRASS_LGT : FIELD_GRASS;
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
    at: [0, 0.66, 0.86],
    dir: [0, 0, 1],
    role: "fan",
  });

  const rudderJoint = b.joint("rudder", {
    parent: fuselage,
    at: [0, 0.82, -1.2],
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
    at: [0, 0.88, -0.04],
    dir: [0, 1, 0.06],
  });

  const pilotHead = b.joint("pilotHead", {
    parent: pilotTorso,
    at: [0, 1.12, -0.02],
    dir: [0, 1, 0.12],
    role: "head",
  });

  const scarfChain = b.chain(
    "scarf",
    catmull([
      [0.08, 1.05, -0.04],
      [0.18, 1.08, -0.18],
      [0.28, 1.12, -0.36],
      [0.36, 1.08, -0.56],
      [0.42, 1.11, -0.74],
    ]),
    { parent: pilotHead, count: 4, role: "tail" },
  );

  const wheelLJoint = b.joint("wheelL", {
    parent: fuselage,
    at: [0.36, 0.18, 0.36],
    dir: [1, 0, 0],
    role: "hinge",
  });

  const wheelRJoint = b.joint("wheelR", {
    parent: fuselage,
    at: [-0.36, 0.18, 0.36],
    dir: [-1, 0, 0],
    role: "hinge",
  });

  // ---------------------------------------------------------------------------
  // 1. Fuselage Body & Livery
  // ---------------------------------------------------------------------------
  const fuselageStations = [
    { at: [0, 0.64, -1.25], w: 0.08, h: 0.1 },  // Tailpost tip
    { at: [0, 0.65, -1.12], w: 0.18, h: 0.22 }, // Tail post
    { at: [0, 0.67, -0.75], w: 0.38, h: 0.4 },  // Aft fuselage
    { at: [0, 0.68, -0.35], w: 0.5, h: 0.52 },  // Mid fuselage
    { at: [0, 0.68, 0.02], w: 0.56, h: 0.54 },  // Cockpit area
    { at: [0, 0.67, 0.35], w: 0.54, h: 0.52 },  // Forward cowl deck
    { at: [0, 0.66, 0.62], w: 0.5, h: 0.5 },    // Firewall
  ];

  b.loft(fuselageStations, {
    bone: fuselage,
    color: FUSELAGE_PAINT,
    caps: { start: "point", end: "flat" },
  });

  // Crisp 3D Red Racing Chevrons along fuselage flanks
  for (const s of [1, -1]) {
    const stripePath = catmull([
      [s * 0.252, 0.65, 0.6],
      [s * 0.275, 0.64, 0.2],
      [s * 0.255, 0.63, -0.3],
      [s * 0.195, 0.62, -0.75],
      [s * 0.095, 0.63, -1.15],
    ]);
    b.sweep(stripePath, [0.065, 0.015], { bone: fuselage, color: RACING_RED });
    // Accompanying Gold Pinstripe
    b.sweep(stripePath, [0.01, 0.018], { bone: fuselage, color: POLISHED_BRASS });
  }

  // Polished Cowl Front Nose Ring (Townend cowl ring)
  b.part(new THREE.TorusGeometry(0.25, 0.018, 10, 24), POLISHED_BRASS, {
    bone: engineJoint,
    at: [0, 0.66, 0.62],
    dir: [0, 0, 1],
    axis: "z",
  });

  // Cockpit rim (Padded chestnut leather coaming)
  const cockpitRimPath = catmull(
    [
      [0, 0.94, 0.2],
      [0.17, 0.92, 0.1],
      [0.18, 0.91, -0.1],
      [0.14, 0.92, -0.22],
      [0, 0.93, -0.26],
      [-0.14, 0.92, -0.22],
      [-0.18, 0.91, -0.1],
      [-0.17, 0.92, 0.1],
    ],
    { closed: true },
  );

  b.sweep(cockpitRimPath, 0.024, { bone: fuselage, color: LEATHER_BROWN });

  // Cockpit interior well
  b.part(new THREE.CylinderGeometry(0.18, 0.15, 0.28, 12), COCKPIT_INTERIOR, {
    bone: fuselage,
    at: [0, 0.78, -0.02],
    scale: [0.95, 1, 1.25],
  });

  // Padded leather backrest
  b.part(new THREE.CylinderGeometry(0.15, 0.13, 0.24, 10, 1, false, 0, Math.PI), LEATHER_LIGHT, {
    bone: fuselage,
    at: [0, 0.88, -0.2],
    rotation: [0, 180, 0],
  });

  // Wooden dashboard with instrument panel
  const dashAt: [number, number, number] = [0, 0.87, 0.17];
  b.part(new THREE.BoxGeometry(0.3, 0.11, 0.02), PROP_WOOD_DARK, {
    bone: fuselage,
    at: dashAt,
    rotation: [-22, 0, 0],
  });

  // Instrument dials (Altimeter & Airspeed)
  glow(
    b.part(new THREE.CircleGeometry(0.036, 16), "#ffffff", {
      bone: fuselage,
      at: [-0.075, 0.87, 0.18],
      rotation: [-22, 0, 0],
      texture: DIAL_ALTIMETER,
    }),
    1.2,
  );

  glow(
    b.part(new THREE.CircleGeometry(0.036, 16), "#ffffff", {
      bone: fuselage,
      at: [0.075, 0.87, 0.18],
      rotation: [-22, 0, 0],
      texture: DIAL_SPEED,
    }),
    1.2,
  );

  // Flight Steering Wheel (Mahogany rim with brass spokes)
  b.rod([0, 0.8, 0.06], [0, 0.91, 0.11], 0.01, ENGINE_STEEL, { bone: fuselage });
  b.part(new THREE.TorusGeometry(0.065, 0.01, 8, 18), PROP_WOOD_DARK, {
    bone: fuselage,
    at: [0, 0.91, 0.11],
    dir: [0, 0.45, 1],
    axis: "z",
  });
  b.part(new THREE.SphereGeometry(0.016, 8, 8), POLISHED_BRASS, {
    bone: fuselage,
    at: [0, 0.91, 0.11],
  });

  // Compact Raked Windscreen (Low profile so pilot face reads unobstructed)
  b.extrude(
    [
      [-0.15, 0],
      [-0.11, 0.075],
      [0, 0.088],
      [0.11, 0.075],
      [0.15, 0],
    ],
    {
      bone: fuselage,
      at: [0, 0.94, 0.19],
      x: [1, 0, 0],
      y: [0, 0.85, 0.52],
      thickness: 0.005,
      bevel: 0.002,
      color: GLASS_CYAN,
    },
  );

  // Brass windscreen frame border
  b.sweep(
    catmull([
      [-0.15, 0.94, 0.185],
      [-0.11, 1.01, 0.23],
      [0, 1.025, 0.24],
      [0.11, 1.01, 0.23],
      [0.15, 0.94, 0.185],
    ]),
    0.006,
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
  // 2. Radial Engine (Detailed 7-Cylinder Exposed Radial)
  // ---------------------------------------------------------------------------
  // Crankcase central cylinder
  b.part(new THREE.CylinderGeometry(0.13, 0.14, 0.15, 16), ENGINE_STEEL, {
    bone: engineJoint,
    at: [0, 0.66, 0.71],
    dir: [0, 0, 1],
  });

  // Front crankcase gearcase nose with brass bolts
  b.part(new THREE.SphereGeometry(0.11, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), POLISHED_BRASS, {
    bone: engineJoint,
    at: [0, 0.66, 0.79],
    dir: [0, 0, 1],
  });

  // 7 radial cylinders
  const numCylinders = 7;
  const cylinderRadius = 0.22;
  for (let i = 0; i < numCylinders; i++) {
    const angle = (i / numCylinders) * Math.PI * 2;
    const cylX = Math.cos(angle) * cylinderRadius;
    const cylY = 0.66 + Math.sin(angle) * cylinderRadius;
    const cylZ = 0.71;

    // Finned cylinder barrel
    b.capsule(
      [cylX * 0.45, 0.66 + (cylY - 0.66) * 0.45, cylZ],
      [cylX * 0.96, 0.66 + (cylY - 0.66) * 0.96, cylZ],
      0.044,
      { bone: engineJoint, color: ENGINE_STEEL },
    );

    // Ribbed black cooling rings
    for (const step of [0.55, 0.7, 0.85]) {
      const ringAt: [number, number, number] = [
        cylX * step,
        0.66 + (cylY - 0.66) * step,
        cylZ,
      ];
      b.part(new THREE.TorusGeometry(0.046, 0.006, 6, 12), ENGINE_DARK, {
        bone: engineJoint,
        at: ringAt,
        dir: [cylX, cylY - 0.66, 0],
        axis: "z",
      });
    }

    // Cylinder head rocker boxes
    b.part(new THREE.BoxGeometry(0.036, 0.026, 0.038), POLISHED_BRASS, {
      bone: engineJoint,
      at: [cylX, cylY, cylZ + 0.01],
      dir: [cylX, cylY - 0.66, 0],
    });

    // Twin chrome pushrod tubes
    b.rod(
      [cylX * 0.35 - 0.013, 0.66 + (cylY - 0.66) * 0.35, cylZ + 0.045],
      [cylX * 0.92 - 0.013, 0.66 + (cylY - 0.66) * 0.92, cylZ + 0.025],
      0.004,
      POLISHED_BRASS,
      { bone: engineJoint },
    );
    b.rod(
      [cylX * 0.35 + 0.013, 0.66 + (cylY - 0.66) * 0.35, cylZ + 0.045],
      [cylX * 0.92 + 0.013, 0.66 + (cylY - 0.66) * 0.92, cylZ + 0.025],
      0.004,
      POLISHED_BRASS,
      { bone: engineJoint },
    );

    // Individual exhaust stub feeding collector ring
    b.rod(
      [cylX * 0.88, cylY, cylZ - 0.01],
      [cylX * 0.72, 0.66 + (cylY - 0.66) * 0.72, 0.66],
      0.009,
      COPPER_PIPE,
      { bone: engineJoint },
    );
  }

  // Exhaust manifold collector ring (Behind cylinders)
  b.part(new THREE.TorusGeometry(0.21, 0.018, 10, 24), COPPER_PIPE, {
    bone: engineJoint,
    at: [0, 0.66, 0.66],
    dir: [0, 0, 1],
    axis: "z",
  });

  // Twin sweeping exhaust pipes down fuselage sides
  for (const s of [1, -1]) {
    const exhaustCurve = catmull([
      [s * 0.2, 0.56, 0.66],
      [s * 0.26, 0.5, 0.48],
      [s * 0.29, 0.46, 0.28],
      [s * 0.31, 0.44, 0.08],
    ]);
    b.sweep(exhaustCurve, [0.022, 0.026], { bone: fuselage, color: COPPER_PIPE });
    // Flared exhaust fishtail
    b.part(new THREE.CylinderGeometry(0.028, 0.02, 0.035, 10, 1, true), ENGINE_DARK, {
      bone: fuselage,
      at: [s * 0.31, 0.44, 0.06],
      dir: [s * 0.1, -0.05, -1],
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Propeller Assembly (Laminated Wood with Brass Leading Edge & Spinner)
  // ---------------------------------------------------------------------------
  // Propeller hub mounting disc
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.05, 16), POLISHED_BRASS, {
    bone: propJoint,
    at: [0, 0.66, 0.84],
    dir: [0, 0, 1],
  });

  // Aerodynamic red conical spinner cone
  b.part(new THREE.ConeGeometry(0.062, 0.11, 16), RACING_RED, {
    bone: propJoint,
    at: [0, 0.66, 0.915],
    dir: [0, 0, 1],
  });

  // Two laminated propeller blades
  const propHalfSpan = 0.47;
  for (const side of [1, -1]) {
    const bladeCurve = catmull([
      [0, 0.66 + side * 0.05, 0.845],
      [side * 0.015, 0.66 + side * 0.24, 0.845],
      [side * 0.008, 0.66 + side * 0.4, 0.845],
      [0, 0.66 + side * propHalfSpan, 0.845],
    ]);

    // Primary wooden paddle blade
    b.sweep(bladeCurve, (t) => [0.042 * Math.sin(t * Math.PI) + 0.014, 0.008], {
      bone: propJoint,
      color: side > 0 ? PROP_WOOD_LIGHT : PROP_WOOD_DARK,
      caps: "round",
    });

    // Lamination inlay plys
    b.sweep(bladeCurve, (t) => [0.03 * Math.sin(t * Math.PI) + 0.007, 0.009], {
      bone: propJoint,
      color: side > 0 ? PROP_WOOD_DARK : PROP_WOOD_LIGHT,
    });

    // Protective brass tip caps
    b.capsule(
      [0, 0.66 + side * (propHalfSpan - 0.09), 0.845],
      [0, 0.66 + side * (propHalfSpan - 0.01), 0.845],
      0.016,
      { bone: propJoint, color: POLISHED_BRASS },
    );
  }

  // ---------------------------------------------------------------------------
  // 4. Wings, Struts, Auxiliary Fuel Tank & Rigging
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

  b.extrude(topWingOutline, {
    bone: fuselage,
    at: [0, 1.34, 0.35],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.032,
    bevel: 0.008,
    smoothing: 1,
    color: WING_PAINT,
  });

  // Scalloped bunting decals on top wing leading edge
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.88, 0.18), "#ffffff", {
      bone: fuselage,
      at: [s * 0.52, 1.36, 0.28],
      rotation: [-90, 0, s > 0 ? 0 : 180],
      texture: SCALLOP_BUNTING,
    });

    // Racing roundel #7 on upper wing surfaces
    b.part(new THREE.CircleGeometry(0.15, 24), "#ffffff", {
      bone: fuselage,
      at: [s * 0.8, 1.36, 0.15],
      rotation: [-90, 0, 0],
      texture: RACE_NUM_7,
    });
  }

  // Wing-Walker Trapeze Handgrip on Left Wingtip (Whimsical stunt signature!)
  b.sweep(
    catmull([
      [-1.08, 1.36, 0.22],
      [-1.14, 1.48, 0.22],
      [-1.14, 1.48, 0.12],
      [-1.08, 1.36, 0.12],
    ]),
    0.007,
    { bone: fuselage, color: POLISHED_BRASS },
  );

  // Auxiliary Center-Section Gravity Fuel Tank (Top wing center)
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.24, 14), POLISHED_BRASS, {
    bone: fuselage,
    at: [0, 1.38, 0.18],
    dir: [1, 0, 0],
  });
  // Brass filler cap
  b.part(new THREE.CylinderGeometry(0.016, 0.018, 0.02, 8), BRASS_DARK, {
    bone: fuselage,
    at: [0, 1.44, 0.18],
  });
  // Fuel feed line down right cabane strut into fuselage
  b.rod([0.08, 1.36, 0.18], [0.15, 0.85, 0.14], 0.005, COPPER_PIPE, { bone: fuselage });

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
    at: [0, 0.52, 0.18],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.028,
    bevel: 0.006,
    smoothing: 1,
    color: WING_PAINT,
  });

  // Wingtip Skid Bows on bottom wings
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.9, 0.52, 0.14],
        [s * 0.94, 0.44, 0.05],
        [s * 0.9, 0.52, -0.08],
      ]),
      0.008,
      { bone: fuselage, color: PROP_WOOD_LIGHT },
    );
    // Boarding wing-root step tread
    b.part(new THREE.BoxGeometry(0.12, 0.006, 0.16), RUBBER_BLACK, {
      bone: fuselage,
      at: [s * 0.34, 0.536, 0.05],
    });
  }

  // Cabane Struts (Fuselage to top wing center)
  const cabanePoints: [number, number, number][][] = [
    [[-0.16, 0.84, 0.28], [-0.14, 1.32, 0.25]],
    [[0.16, 0.84, 0.28], [0.14, 1.32, 0.25]],
    [[-0.16, 0.82, 0.02], [-0.14, 1.32, 0.06]],
    [[0.16, 0.82, 0.02], [0.14, 1.32, 0.06]],
  ];
  for (const [start, end] of cabanePoints) {
    b.rod(start, end, 0.012, POLISHED_BRASS, { bone: fuselage });
  }

  // Interplane N-Struts & Rigging
  for (const s of [1, -1]) {
    const xBase = s * 0.74;
    const xTop = s * 0.78;

    const frontLower: [number, number, number] = [xBase, 0.54, 0.12];
    const frontUpper: [number, number, number] = [xTop, 1.32, 0.26];
    const rearLower: [number, number, number] = [xBase, 0.54, -0.12];
    const rearUpper: [number, number, number] = [xTop, 1.32, 0.02];

    // Front vertical strut
    b.rod(frontLower, frontUpper, 0.015, CANARY_YELLOW, { bone: fuselage });
    // Rear vertical strut
    b.rod(rearLower, rearUpper, 0.015, CANARY_YELLOW, { bone: fuselage });
    // Diagonal cross brace
    b.rod(rearLower, frontUpper, 0.013, RACING_RED, { bone: fuselage });

    // Rigging tension cross-wires with steel sheen & brass turnbuckles
    b.rod(frontLower, rearUpper, 0.003, ENGINE_STEEL, { bone: fuselage });
    b.rod(rearLower, frontUpper, 0.003, ENGINE_STEEL, { bone: fuselage });

    // Turnbuckle sleeves
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 6), POLISHED_BRASS, {
      bone: fuselage,
      at: lerp(frontLower, rearUpper, 0.12),
      dir: [0, 1, 0],
    });
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 6), POLISHED_BRASS, {
      bone: fuselage,
      at: lerp(rearLower, frontUpper, 0.12),
      dir: [0, 1, 0],
    });

    // Landing wires from cabane down to outer wing
    b.rod([-s * 0.14, 1.32, 0.15], frontLower, 0.0035, ENGINE_STEEL, { bone: fuselage });
    b.rod([-s * 0.14, 1.32, 0.15], rearLower, 0.0035, ENGINE_STEEL, { bone: fuselage });

    // Aileron trim capsules on top wing
    b.capsule(
      [s * 0.6, 1.34, -0.04],
      [s * 1.02, 1.34, -0.04],
      0.012,
      { bone: fuselage, color: RACING_RED },
    );
  }

  // Pitot Tube (Airspeed sensor on left strut)
  b.rod([-0.8, 0.95, 0.2], [-0.8, 0.95, 0.36], 0.004, POLISHED_BRASS, { bone: fuselage });
  b.rod([-0.8, 0.95, 0.36], [-0.8, 0.98, 0.38], 0.004, POLISHED_BRASS, { bone: fuselage });

  // ---------------------------------------------------------------------------
  // 5. Tail Unit (Rudder, Stabilizers, Elevators & Sprung Tail Skid)
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

  // Sprung Tail Skid (Grounds cleanly at ground level y = 0.045)
  const tailSkidCurve = catmull([
    [0, 0.58, -1.1],
    [0, 0.36, -1.14],
    [0, 0.18, -1.19],
    [0, 0.06, -1.24],
    [0, 0.045, -1.27],
  ]);
  b.sweep(tailSkidCurve, 0.014, { bone: fuselage, color: ENGINE_DARK });
  // Brass shoe resting securely on ground
  b.part(new THREE.BoxGeometry(0.03, 0.014, 0.06), POLISHED_BRASS, {
    bone: fuselage,
    at: [0, 0.05, -1.26],
  });

  // ---------------------------------------------------------------------------
  // 6. Main Undercarriage & Upright Balloon Wheels
  // ---------------------------------------------------------------------------
  const axleY = 0.18;
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
    b.part(new THREE.TorusGeometry(0.1, 0.04, 12, 22), RUBBER_BLACK, {
      bone: wheelBone,
      at: hubPos,
      dir: [s, 0, 0],
      axis: "z",
    });

    // Inner Cream Wheel Rim
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.055, 18), WHEEL_CREAM, {
      bone: wheelBone,
      at: hubPos,
      dir: [s, 0, 0],
    });

    // Star Hubcap Decal on outer face
    b.part(new THREE.CircleGeometry(0.075, 16), "#ffffff", {
      bone: wheelBone,
      at: [s * (trackX + 0.03), axleY, axleZ],
      dir: [s, 0, 0],
      axis: "z",
      texture: HUBCAP_STAR,
    });

    // Polished Brass Axle Nut
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.07, 8), POLISHED_BRASS, {
      bone: wheelBone,
      at: hubPos,
      dir: [s, 0, 0],
    });
  }

  // Cross axle between wheels
  b.rod([-trackX + 0.03, axleY, axleZ], [trackX - 0.03, axleY, axleZ], 0.012, ENGINE_STEEL, { bone: fuselage });

  // ---------------------------------------------------------------------------
  // 7. Whimsical Puppet Aviator Character (Sitting Proud & Highly Visible)
  // ---------------------------------------------------------------------------
  // Torso (Leather flight jacket sitting tall in cockpit)
  b.part(new THREE.CylinderGeometry(0.13, 0.15, 0.24, 12), LEATHER_BROWN, {
    bone: pilotTorso,
    at: [0, 0.88, -0.04],
    scale: [1.1, 1, 0.9],
  });

  // Fleece shearling collar
  b.part(new THREE.TorusGeometry(0.11, 0.03, 8, 16), VINTAGE_CREAM, {
    bone: pilotTorso,
    at: [0, 1.0, -0.03],
    dir: [0, 1, 0.12],
    axis: "z",
  });

  // Pilot arms with mittens holding the cockpit rim / steering wheel
  for (const s of [1, -1]) {
    const shoulder: [number, number, number] = [s * 0.13, 0.95, -0.03];
    const hand: [number, number, number] = [s * 0.08, 0.93, 0.1];
    b.capsule(shoulder, hand, 0.032, { bone: pilotTorso, color: LEATHER_BROWN });
    // Leather mittens gripping the controls
    b.part(new THREE.SphereGeometry(0.034, 8, 8), LEATHER_LIGHT, {
      bone: pilotTorso,
      at: hand,
    });
  }

  // Aviator Head (Centered at y = 1.12, fully above windscreen)
  const headPos: [number, number, number] = [0, 1.12, -0.02];
  b.part(new THREE.SphereGeometry(0.11, 16, 14), "#f0c29e", {
    bone: pilotHead,
    at: headPos,
  });

  // Leather Flying Helmet (Back and top)
  b.part(new THREE.SphereGeometry(0.116, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), LEATHER_BROWN, {
    bone: pilotHead,
    at: [0, 1.13, -0.03],
  });

  // Helmet earflaps with brass snaps
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.04, 0.044, 0.02, 10), LEATHER_BROWN, {
      bone: pilotHead,
      at: [s * 0.11, 1.09, -0.03],
      dir: [s, 0, 0],
    });
    b.part(new THREE.SphereGeometry(0.012, 8, 6), POLISHED_BRASS, {
      bone: pilotHead,
      at: [s * 0.122, 1.09, -0.03],
    });
  }

  // Expressive Puppet Eyes (Facing front, readable immediately!)
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.028, 16), "#ffffff", {
      bone: pilotHead,
      at: [s * 0.042, 1.14, 0.085],
      dir: [s * 0.1, 0.05, 1],
      axis: "z",
      texture: PUPPET_EYE,
    });

    // Rosy Cheeks
    b.part(new THREE.SphereGeometry(0.018, 8, 6), "#ea7f66", {
      bone: pilotHead,
      at: [s * 0.065, 1.08, 0.065],
    });
  }

  // Cute Button Nose
  b.part(new THREE.SphereGeometry(0.02, 10, 8), "#e89874", {
    bone: pilotHead,
    at: [0, 1.11, 0.095],
  });

  // Whimsical Curly Barnstormer Mustache
  for (const s of [1, -1]) {
    const stacheCurve = catmull([
      [0, 1.08, 0.092],
      [s * 0.04, 1.085, 0.09],
      [s * 0.075, 1.11, 0.07],
    ]);
    b.sweep(stacheCurve, [0.012, 0.003], { bone: pilotHead, color: PROP_WOOD_DARK });
  }

  // Aviator Goggles (Pushed up slightly onto helmet forehead)
  for (const s of [1, -1]) {
    const goggleCenter: [number, number, number] = [s * 0.05, 1.19, 0.065];
    // Brass frame ring
    b.part(new THREE.TorusGeometry(0.032, 0.007, 8, 16), POLISHED_BRASS, {
      bone: pilotHead,
      at: goggleCenter,
      dir: [s * 0.15, 0.25, 0.95],
      axis: "z",
    });
    // Amber glass lens
    b.part(new THREE.CircleGeometry(0.028, 16), "#ffffff", {
      bone: pilotHead,
      at: [s * 0.05, 1.19, 0.068],
      dir: [s * 0.15, 0.25, 0.95],
      axis: "z",
      texture: GOGGLE_GLASS,
    });
  }

  // Goggle bridge & elastic strap around helmet
  b.rod([-0.018, 1.19, 0.072], [0.018, 1.19, 0.072], 0.006, POLISHED_BRASS, { bone: pilotHead });
  b.sweep(
    catmull([
      [-0.08, 1.18, 0.04],
      [-0.115, 1.17, -0.03],
      [0, 1.18, -0.12],
      [0.115, 1.17, -0.03],
      [0.08, 1.18, 0.04],
    ]),
    0.007,
    { bone: pilotHead, color: LEATHER_LIGHT },
  );

  // ---------------------------------------------------------------------------
  // 8. Billowing Silk Aviator Scarf (Floating Free Above Fuselage)
  // ---------------------------------------------------------------------------
  // Neck wrap ring
  b.part(new THREE.TorusGeometry(0.11, 0.026, 10, 18), SCARF_WHITE, {
    bone: pilotHead,
    at: [0, 1.04, -0.03],
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
    [0.08, 1.03, -0.04],
    [0.19, 1.05, -0.22],
    [0.29, 1.08, -0.42],
    [0.37, 1.05, -0.66],
  ]);
  b.sweep(scarfFringe, [0.032, 0.01], { bone: pilotHead, color: SCARF_WHITE });

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

  // Striped Wooden Wheel Chocks in front of both main tires
  for (const s of [1, -1]) {
    const chockOutline: [number, number, "sharp"?][] = [
      [0, 0, "sharp"],
      [0.14, 0, "sharp"],
      [0.14, 0.065, "sharp"],
      [0, 0, "sharp"],
    ];
    b.extrude(chockOutline, {
      at: [s * trackX - 0.05, 0.045, axleZ + 0.14],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.1,
      bevel: 0.004,
      color: CANARY_YELLOW,
    });
    // Hazard stripe decal
    b.part(new THREE.PlaneGeometry(0.12, 0.06), "#ffffff", {
      at: [s * trackX, 0.075, axleZ + 0.2],
      rotation: [-25, 0, 0],
      texture: CHOCK_HAZARD,
    });
    // Chock rope handle
    b.sweep(
      catmull([
        [s * trackX - 0.05, 0.07, axleZ + 0.22],
        [s * trackX - 0.08, 0.1, axleZ + 0.24],
        [s * trackX - 0.08, 0.06, axleZ + 0.18],
      ]),
      0.005,
      { color: VINTAGE_CREAM },
    );
  }

  // Airfield Windsock on Mast (Positioned rear-right to frame biplane clearly)
  const mastPos: [number, number, number] = [1.05, 0.045, -0.55];
  // Post mounting collar
  b.part(new THREE.CylinderGeometry(0.038, 0.042, 0.1, 10), DIRT_EARTH, {
    at: [mastPos[0], mastPos[1] + 0.05, mastPos[2]],
  });

  // Striped mast pole
  b.sweep(
    catmull([
      [mastPos[0], mastPos[1] + 0.08, mastPos[2]],
      [mastPos[0], mastPos[1] + 1.15, mastPos[2]],
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
  b.part(new THREE.SphereGeometry(0.026, 10, 8), POLISHED_BRASS, {
    at: [mastPos[0], mastPos[1] + 1.16, mastPos[2]],
  });

  // Fluttering windsock cone (Blowing rearward, away from plane empennage)
  const sockStart: [number, number, number] = [mastPos[0], mastPos[1] + 1.13, mastPos[2]];
  const sockCurve = catmull([
    sockStart,
    [sockStart[0] + 0.06, sockStart[1] - 0.02, sockStart[2] - 0.12],
    [sockStart[0] + 0.12, sockStart[1] - 0.05, sockStart[2] - 0.26],
    [sockStart[0] + 0.16, sockStart[1] - 0.09, sockStart[2] - 0.4],
  ]);

  b.sweep(sockCurve, [0.07, 0.028], {
    color: VINTAGE_CREAM,
    bands: [
      [0.25, RACING_RED],
      [0.5, VINTAGE_CREAM],
      [0.75, RACING_RED],
      [1.0, VINTAGE_CREAM],
    ],
    caps: { start: "flat", end: "round" },
  });

  // Windsock throat ring
  b.part(new THREE.TorusGeometry(0.07, 0.007, 8, 16), ENGINE_STEEL, {
    at: sockStart,
    dir: [0.35, -0.1, -1],
    axis: "z",
  });

  // Aviation Fuel Barrel & Vintage Jerrycan (Positioned rear-left, clear of wings)
  const drumPos: [number, number, number] = [-0.92, 0.045, -0.32];
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
  // Aero Oil Decal on drum front
  b.part(new THREE.PlaneGeometry(0.18, 0.09), "#ffffff", {
    at: [drumPos[0], drumPos[1] + 0.18, drumPos[2] + 0.142],
    texture: FUEL_DRUM_LABEL,
  });
  // Brass rotary hand pump & crank handle
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.08, 8), POLISHED_BRASS, {
    at: [drumPos[0] + 0.05, drumPos[1] + 0.38, drumPos[2]],
  });
  b.part(new THREE.TorusGeometry(0.026, 0.006, 6, 10), POLISHED_BRASS, {
    at: [drumPos[0] + 0.05, drumPos[1] + 0.42, drumPos[2]],
    dir: [1, 0, 0],
    axis: "z",
  });
  // Black rubber fueling hose coiled gracefully on drum top
  b.part(new THREE.TorusGeometry(0.08, 0.012, 8, 16), RUBBER_BLACK, {
    at: [drumPos[0] - 0.02, drumPos[1] + 0.37, drumPos[2]],
    dir: [0, 1, 0],
    axis: "z",
  });

  // Vintage Brass Jerrycan beside drum
  const canPos: [number, number, number] = [-0.76, 0.045, -0.18];
  b.part(new THREE.BoxGeometry(0.12, 0.16, 0.08), POLISHED_BRASS, {
    at: [canPos[0], canPos[1] + 0.08, canPos[2]],
    rotation: [0, 22, 0],
  });
  // Jerrycan top handle
  b.rod([canPos[0], canPos[1] + 0.16, canPos[2] - 0.02], [canPos[0], canPos[1] + 0.16, canPos[2] + 0.02], 0.006, BRASS_DARK);

  // Wildflower Sprigs & Dandelions on the Airfield
  const flowerRng = rng(42);
  for (let i = 0; i < 28; i++) {
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
  b.pose(rudderJoint, { axis: [0, 1, 0], deg: -8 });

  // Elevator trim angle
  b.pose(elevatorJoint, { axis: [1, 0, 0], deg: -3 });

  // Propeller resting at a brisk diagonal
  b.pose(propJoint, { axis: [0, 0, 1], deg: 24 });

  // Pilot head tilted with adventurous spirit
  b.pose(pilotHead, { axis: [0, 1, 0], deg: 10 });
  b.pose(pilotHead, { axis: [0, 0, 1], deg: -4 });

  return b.root;
}
