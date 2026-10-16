import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "../../../../kits/glow";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, DEG, lerp, offset } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import { countershade, grain, mix, mottle, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A chubby whimsical 1920s flying-circus biplane in crimson and buttercream with scalloped sunburst wings, a roaring 7-cylinder radial engine, wicker pilot seat, fluttering silk scarf, and a 'SKY CIRCUS' wing-walker ladder.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------
// Palette — cheerful storybook flying-circus colours
// ---------------------------------------------------------------------------
const RED_LIT = "#d82e26";
const RED_DARK = "#8c1712";
const CREAM_LIT = "#fff5d6";
const CREAM_DARK = "#d9c28c";
const GOLD = "#f4b41a";
const GOLD_DARK = "#b37708";
const TEAL = "#1f9ca6";
const NAVY = "#1c2d4a";

const BRASS = "#d89c28";
const COPPER = "#b85c28";
const IRON = "#2d323a";
const STEEL = "#7b8492";
const CHROME = "#cdd5e0";
const EXHAUST_SOOT = "#362b28";

const WOOD_LIGHT = "#c98542";
const WOOD_DARK = "#7d4618";
const LEATHER = "#5e2d16";
const LEATHER_TAN = "#965228";
const WICKER = "#d49b4b";
const RUBBER = "#212328";
const ROPE = "#d9c398";
const SCARF_SILK = "#fff8eb";

const NAV_RED = "#ff3b30";
const NAV_GREEN = "#28cd41";
const HEADLIGHT_AMBER = "#ffdf70";
const GLASS_CYAN = "#9ee8ff";

export default function build() {
  const b = createBuilder({ name: "barnstormerBiplane", paintSize: 2048 });

  // -------------------------------------------------------------------------
  // Paints (world-space & surface-coord patterns baked onto 2048 sheet)
  // -------------------------------------------------------------------------

  // Fuselage paint: warm doped-canvas mottle with cream belly, crimson top,
  // gold pin-stripe, and nose checker band behind the brass cowling.
  const fuselagePaint = paint((p, n) => {
    const shade = 0.5 + 0.5 * n.y;
    const redCanvas = mix(RED_DARK, RED_LIT, shade * 0.85 + 0.15);
    const creamCanvas = mix(CREAM_DARK, CREAM_LIT, shade * 0.85 + 0.15);

    // Checkerboard collar right behind the engine cowling (z from 1.24 to 1.56)
    if (p.z > 1.24 && p.z < 1.56) {
      const row = Math.floor((p.z - 1.24) / 0.08);
      const ang = Math.atan2(p.x, p.y);
      const col = Math.floor(((ang + Math.PI) / (2 * Math.PI)) * 18);
      if ((row + col) % 2 === 0) return GOLD;
      return (row + col) % 4 === 1 ? NAVY : redCanvas;
    }

    // Swooping side divider line from nose down toward tail
    const splitY = 0.96 + 0.09 * Math.sin((p.z + 0.6) * 1.1) - 0.04 * p.z;
    const dy = p.y - splitY;

    // Gold and teal trim pinstripe separating upper crimson and lower cream
    if (Math.abs(dy) < 0.024) return GOLD;
    if (dy < -0.024 && dy > -0.052) return TEAL;

    // Vertical speed chevrons on the aft flank
    if (p.z > -1.35 && p.z < -0.55 && Math.abs(dy - 0.16) < 0.16) {
      const chev = p.z + Math.abs(dy - 0.16) * 0.85;
      const stripe = ((chev % 0.22) + 0.22) % 0.22;
      if (stripe < 0.055) return GOLD;
    }

    return dy >= 0 ? redCanvas : creamCanvas;
  });

  // Cowling paint: polished crimson lacquer with a gleaming brass lip and louvered vents
  const cowlPaint = paint((p, n) => {
    const shade = 0.5 + 0.5 * n.y;
    if (p.z > 1.88) return mix(GOLD_DARK, BRASS, shade);
    if (p.z > 1.83) return TEAL;
    // Cooling louver slots along the side of the cowl
    if (p.z > 1.54 && p.z < 1.79 && Math.abs(p.y - 1.07) < 0.22 && Math.abs(p.x) > 0.35) {
      const slot = ((p.z - 1.54) % 0.042 + 0.042) % 0.042;
      if (slot < 0.016) return IRON;
    }
    return mix(RED_DARK, RED_LIT, shade);
  });

  // Wing paint: cream doped fabric with crimson leading edge, gold sunburst rays on top,
  // subtle stitched rib lines, and navy/gold wingtip bands.
  const wingPaint = paint((p, n) => {
    const absX = Math.abs(p.x);
    const shade = 0.5 + 0.5 * Math.abs(n.y);
    const cream = mix(CREAM_DARK, CREAM_LIT, shade * 0.85 + 0.15);
    const red = mix(RED_DARK, RED_LIT, shade * 0.85 + 0.15);

    // Wingtip band + roundel zone
    if (absX > 2.38) {
      if (absX < 2.43) return GOLD;
      if (absX < 2.48) return TEAL;
      return red;
    }

    // Stitched fabric rib shadow every 0.30 m along span
    const ribPhase = ((absX % 0.3) + 0.3) % 0.3;
    const onRib = ribPhase < 0.018;

    // Top surface gets bold barnstormer sunburst rays radiating from centre front
    if (n.y > 0.25) {
      const dz = p.z - (p.y > 1.4 ? 0.82 : 0.45);
      const ang = Math.atan2(absX, -dz + 0.45);
      const ray = Math.floor((ang / (Math.PI / 2)) * 13);
      if (dz > -0.12) return red; // Crimson leading edge wrap
      if (dz > -0.16) return GOLD;
      if (ray % 2 === 0 && absX > 0.28 && absX < 2.28) {
        return onRib ? mix(RED_DARK, red, 0.65) : red;
      }
      return onRib ? mix(CREAM_DARK, cream, 0.7) : cream;
    }

    // Underside: bright cream with broad crimson bands so it reads from below
    if (absX > 1.15 && absX < 1.55) return red;
    if (Math.abs(absX - 1.15) < 0.03 || Math.abs(absX - 1.55) < 0.03) return GOLD;
    return onRib ? mix(CREAM_DARK, cream, 0.75) : cream;
  });

  // Control surfaces (ailerons, elevators, rudder): red & cream circus stripes
  const controlPaint = paint((p, n) => {
    const shade = 0.5 + 0.5 * Math.abs(n.y);
    const red = mix(RED_DARK, RED_LIT, shade);
    const cream = mix(CREAM_DARK, CREAM_LIT, shade);
    const coord = Math.abs(p.x) > 0.35 ? Math.abs(p.x) : p.y + p.z * 0.5;
    const band = Math.floor(coord / 0.13);
    return band % 2 === 0 ? red : cream;
  });

  // Laminated mahogany & birch propeller blades with brass tip sheathing
  const propWoodPaint = paint((p, n) => {
    const r = Math.hypot(p.x, p.y - 1.07);
    if (r > 0.72) return BRASS;
    if (r > 0.69) return RED_LIT;
    const lam = Math.floor((p.z * 140 + r * 18) % 2);
    const base = lam === 0 ? WOOD_LIGHT : WOOD_DARK;
    return mix(base, "#ffffff", 0.08 * Math.max(0, n.y));
  });

  const strutWoodPaint = grain(WOOD_LIGHT, WOOD_DARK, { size: 0.03, axis: "y", seed: 11 });
  const leatherPaint = mottle(LEATHER, LEATHER_TAN, { size: 0.08, seed: 23 });
  const tirePaint = countershade("#2b2e36", "#16181c", { level: 0, soft: 0.5 });

  // -------------------------------------------------------------------------
  // SVG Textures & Decals
  // -------------------------------------------------------------------------

  // Barnstormer star roundel for wing tops, undersides, and fuselage flanks
  const roundelTex = svg(
    `<svg viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="120" fill="${NAVY}" stroke="${GOLD}" stroke-width="12"/>
      <circle cx="128" cy="128" r="92" fill="${CREAM_LIT}" stroke="${RED_LIT}" stroke-width="10"/>
      <circle cx="128" cy="128" r="64" fill="${TEAL}"/>
      <polygon points="128,22 153,92 228,92 168,136 190,208 128,164 66,208 88,136 28,92 103,92"
        fill="${GOLD}" stroke="${NAVY}" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="128" cy="128" r="22" fill="${RED_LIT}" stroke="${CREAM_LIT}" stroke-width="5"/>
    </svg>`,
    { size: 512 },
  );

  // "LUCKY № 7 — SKY CIRCUS" fuselage emblem
  const lucky7Tex = svg(
    `<svg viewBox="0 0 360 180">
      <path d="M18,90 L70,38 L342,24 L318,90 L342,156 L70,142 Z"
        fill="${CREAM_LIT}" stroke="${NAVY}" stroke-width="8" stroke-linejoin="round"/>
      <path d="M32,90 L76,48 L324,36 L304,90 L324,144 L76,132 Z"
        fill="${GOLD}" stroke="${RED_LIT}" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="122" cy="90" r="54" fill="${NAVY}" stroke="${CREAM_LIT}" stroke-width="6"/>
      <text x="122" y="116" text-anchor="middle" font-family="Georgia, serif" font-weight="900"
        font-size="78" fill="${GOLD}" stroke="${RED_LIT}" stroke-width="2">7</text>
      <text x="234" y="82" text-anchor="middle" font-family="Impact, sans-serif" font-weight="900"
        font-size="34" fill="${NAVY}">SKY CIRCUS</text>
      <text x="234" y="122" text-anchor="middle" font-family="Georgia, serif" font-weight="bold"
        font-size="24" fill="${RED_LIT}">★ DAREDEVIL ★</text>
    </svg>`,
    { size: 512 },
  );

  // Illuminated brass cockpit instrument dial face
  const dialTex = svg(
    `<svg viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="60" fill="#182232" stroke="${BRASS}" stroke-width="8"/>
      <circle cx="64" cy="64" r="50" fill="#fff8e4"/>
      <path d="M64,18 L64,28 M64,100 L64,110 M18,64 L28,64 M100,64 L110,64 M31,31 L39,39 M97,31 L89,39 M31,97 L39,89 M97,97 L89,89"
        stroke="#182232" stroke-width="4" stroke-linecap="round"/>
      <path d="M64,64 L88,36" stroke="${RED_LIT}" stroke-width="5" stroke-linecap="round"/>
      <path d="M64,64 L44,72" stroke="#182232" stroke-width="4" stroke-linecap="round"/>
      <circle cx="64" cy="64" r="6" fill="${BRASS}"/>
    </svg>`,
    { size: 256 },
  );

  // Compass rose top glass texture
  const compassTex = svg(
    `<svg viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="60" fill="#152636" stroke="${BRASS}" stroke-width="8"/>
      <polygon points="64,14 74,54 114,64 74,74 64,114 54,74 14,64 54,54" fill="${GOLD}"/>
      <polygon points="64,14 70,54 64,64 58,54" fill="${RED_LIT}"/>
      <circle cx="64" cy="64" r="7" fill="${CREAM_LIT}"/>
    </svg>`,
    { size: 256 },
  );

  // Silk scarf texture with red polka dots and gold fringe
  const scarfTex = svg(
    `<svg viewBox="0 0 128 256">
      <rect x="10" y="0" width="108" height="232" rx="18" fill="${SCARF_SILK}" stroke="${GOLD}" stroke-width="6"/>
      <rect x="20" y="0" width="10" height="232" fill="${RED_LIT}"/>
      <rect x="98" y="0" width="10" height="232" fill="${RED_LIT}"/>
      <circle cx="64" cy="36" r="11" fill="${RED_LIT}"/>
      <circle cx="48" cy="86" r="9" fill="${TEAL}"/>
      <circle cx="80" cy="118" r="11" fill="${RED_LIT}"/>
      <circle cx="52" cy="162" r="10" fill="${GOLD}"/>
      <circle cx="74" cy="202" r="11" fill="${RED_LIT}"/>
      <path d="M16,232 L16,254 M32,232 L32,254 M48,232 L48,254 M64,232 L64,254 M80,232 L80,254 M96,232 L96,254 M112,232 L112,254"
        stroke="${GOLD}" stroke-width="6" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // Festive triangular pennant flags for wing struts
  const pennantTex = svg(
    `<svg viewBox="0 0 128 256">
      <polygon points="8,4 120,4 64,248" fill="${GOLD}" stroke="${RED_LIT}" stroke-width="10" stroke-linejoin="round"/>
      <polygon points="28,20 100,20 64,190" fill="${TEAL}"/>
      <circle cx="64" cy="64" r="20" fill="${CREAM_LIT}"/>
      <circle cx="64" cy="64" r="10" fill="${RED_LIT}"/>
    </svg>`,
    { size: 256 },
  );

  // Towed tail sky-banner card texture
  const bannerTex = svg(
    `<svg viewBox="0 0 256 512">
      <path d="M18,0 L238,0 L246,490 L128,425 L10,490 Z"
        fill="${CREAM_LIT}" stroke="${RED_LIT}" stroke-width="14" stroke-linejoin="round"/>
      <path d="M36,16 L220,16 L226,452 L128,398 L30,452 Z"
        fill="none" stroke="${GOLD}" stroke-width="6"/>
      <circle cx="128" cy="86" r="42" fill="${RED_LIT}" stroke="${GOLD}" stroke-width="6"/>
      <polygon points="128,50 138,75 165,75 143,91 151,117 128,101 105,117 113,91 91,75 118,75" fill="${GOLD}"/>
      <rect x="52" y="156" width="152" height="44" rx="10" fill="${NAVY}"/>
      <text x="128" y="187" text-anchor="middle" font-family="Impact, sans-serif" font-size="30" fill="${GOLD}">FLYING</text>
      <rect x="44" y="216" width="168" height="48" rx="10" fill="${RED_LIT}"/>
      <text x="128" y="250" text-anchor="middle" font-family="Impact, sans-serif" font-size="34" fill="${CREAM_LIT}">CIRCUS</text>
      <circle cx="128" cy="322" r="28" fill="${TEAL}" stroke="${NAVY}" stroke-width="5"/>
      <text x="128" y="334" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="34" fill="${CREAM_LIT}">5¢</text>
    </svg>`,
    { size: 512 },
  );

  // -------------------------------------------------------------------------
  // Skeleton — Root & Moving Vehicle Joints (all moving parts use role: "hinge")
  // -------------------------------------------------------------------------
  const fuselage = b.joint("fuselage", {
    at: [0, 0.98, 0.15],
    dir: [0, 0.14, 0.99],
  });

  // Propeller hub at the nose
  const propeller = b.joint("propeller", {
    parent: fuselage,
    at: [0, 1.07, 1.97],
    dir: [0, 0, 1],
    role: "hinge",
  });

  // Main landing gear suspension & wheels (touching y = 0 precisely)
  // Wheel radius = 0.30 m -> wheel centre at y = 0.30 m
  const strutGearL = b.joint("strutGearL", {
    parent: fuselage,
    at: [0.34, 0.72, 0.92],
    aim: [0.58, 0.3, 1.05],
    role: "hinge",
  });
  const wheelL = b.joint("wheelL", {
    parent: strutGearL,
    at: [0.58, 0.3, 1.05],
    dir: [1, 0, 0],
    role: "hinge",
  });

  const strutGearR = b.joint("strutGearR", {
    parent: fuselage,
    at: [-0.34, 0.72, 0.92],
    aim: [-0.58, 0.3, 1.05],
    role: "hinge",
  });
  const wheelR = b.joint("wheelR", {
    parent: strutGearR,
    at: [-0.58, 0.3, 1.05],
    dir: [-1, 0, 0],
    role: "hinge",
  });

  // Tail skid assembly & caster wheel (touching y = 0 at rear)
  // Tail wheel radius = 0.09 m -> centre at y = 0.09 m
  const tailSkid = b.joint("tailSkid", {
    parent: fuselage,
    at: [0, 0.62, -1.58],
    aim: [0, 0.09, -1.78],
    role: "hinge",
  });
  const tailWheel = b.joint("tailWheel", {
    parent: tailSkid,
    at: [0, 0.09, -1.78],
    dir: [1, 0, 0],
    role: "hinge",
  });

  // Upper & lower ailerons (left and right)
  const aileronUpperL = b.joint("aileronUpperL", {
    parent: fuselage,
    at: [1.75, 1.84, 0.14],
    dir: [1, 0.04, 0],
    role: "hinge",
  });
  const aileronUpperR = b.joint("aileronUpperR", {
    parent: fuselage,
    at: [-1.75, 1.84, 0.14],
    dir: [-1, 0.04, 0],
    role: "hinge",
  });
  const aileronLowerL = b.joint("aileronLowerL", {
    parent: fuselage,
    at: [1.58, 0.79, -0.02],
    dir: [1, 0.05, 0],
    role: "hinge",
  });
  const aileronLowerR = b.joint("aileronLowerR", {
    parent: fuselage,
    at: [-1.58, 0.79, -0.02],
    dir: [-1, 0.05, 0],
    role: "hinge",
  });

  // Tail elevators and rudder
  const elevatorL = b.joint("elevatorL", {
    parent: fuselage,
    at: [0.45, 0.87, -1.82],
    dir: [1, 0, 0],
    role: "hinge",
  });
  const elevatorR = b.joint("elevatorR", {
    parent: fuselage,
    at: [-0.45, 0.87, -1.82],
    dir: [-1, 0, 0],
    role: "hinge",
  });
  const rudder = b.joint("rudder", {
    parent: fuselage,
    at: [0, 1.15, -1.84],
    dir: [0, 1, 0],
    role: "hinge",
  });

  // Cockpit controls & whimsical hinged accessories
  const controlStick = b.joint("controlStick", {
    parent: fuselage,
    at: [0, 0.72, -0.02],
    dir: [0, 1, 0.12],
    role: "hinge",
  });
  const throttleLever = b.joint("throttleLever", {
    parent: fuselage,
    at: [0.34, 1.08, 0.05],
    dir: [0, 0.85, 0.5],
    role: "hinge",
  });
  const cockpitDoor = b.joint("cockpitDoor", {
    parent: fuselage,
    at: [0.43, 0.96, -0.14],
    dir: [0, 0, 1],
    role: "hinge",
  });
  const anemometer = b.joint("anemometer", {
    parent: fuselage,
    at: [-1.36, 1.56, 0.48],
    dir: [0, 1, 0],
    role: "hinge",
  });
  const ropeLadder = b.joint("ropeLadder", {
    parent: fuselage,
    at: [1.05, 0.71, 0.18],
    dir: [0, -1, -0.08],
    role: "hinge",
  });

  // -------------------------------------------------------------------------
  // 1. Chubby Teardrop Fuselage & Nose Cowling
  // -------------------------------------------------------------------------
  const bodyLoft = b.loft(
    [
      { at: [0, 0.92, -1.84], w: 0.12, h: 0.28 },
      { at: [0, 0.9, -1.35], w: 0.38, h: 0.46 },
      { at: [0, 0.92, -0.75], w: 0.72, h: 0.74 },
      { at: [0, 0.96, -0.15], w: 0.92, h: 0.88 },
      { at: [0, 1.01, 0.52], w: 0.98, h: 0.94 },
      { at: [0, 1.05, 1.15], w: 0.94, h: 0.92 },
      { at: [0, 1.07, 1.54], w: 0.86, h: 0.86 },
    ],
    {
      bone: fuselage,
      color: fuselagePaint,
      sides: 16,
      caps: { start: "round", end: "flat" },
      group: "fuselage",
      name: "fuselageBody",
    },
  );

  // Raised turtle-deck fairing spine from rear of cockpit to fin base
  b.sweep(
    catmull([
      [0, 1.38, -0.34],
      [0, 1.26, -0.82],
      [0, 1.12, -1.32],
      [0, 1.02, -1.76],
    ]),
    (t) => [0.24 * (1 - 0.72 * t), 0.15 * (1 - 0.65 * t)],
    {
      bone: fuselage,
      color: RED_LIT,
      sides: 10,
      caps: "round",
      group: "fuselage",
      name: "turtleDeck",
    },
  );

  // Forward engine cowling (lathed around +Z axis at nose)
  const cowlOutline: OutlinePoint[] = [
    [0.24, 0, "sharp"],
    [0.44, 0, "sharp"],
    [0.47, 0.12],
    [0.46, 0.28],
    [0.41, 0.39],
    [0.33, 0.43, "sharp"],
    [0.26, 0.41, "sharp"],
    [0.31, 0.34],
    [0.31, 0.05, "sharp"],
  ];
  b.lathe(cowlOutline, {
    bone: fuselage,
    at: [0, 1.07, 1.5],
    axis: [0, 0, 1],
    segments: 20,
    smoothing: 1,
    color: cowlPaint,
    group: "cowling",
    name: "engineCowl",
  });

  // Deep recessed crankcase shadow disk inside cowling opening
  b.part(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 16), IRON, {
    bone: fuselage,
    at: [0, 1.07, 1.56],
    dir: [0, 0, 1],
    group: "cowling",
    name: "cowlInteriorPlate",
  });

  // Lower oil-cooler scoop under the chin of the cowling
  b.frustumBox([0, 0.61, 1.32], [0, 0.64, 1.76], [0.24, 0.12], [0.28, 0.16], {
    bone: fuselage,
    color: BRASS,
    group: "cowling",
    name: "chinScoop",
  });
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 10), IRON, {
    bone: fuselage,
    at: [0, 0.63, 1.76],
    dir: [0, 0, 1],
    group: "cowling",
    name: "chinScoopGrille",
  });

  // Fuselage side emblems ("LUCKY 7 — SKY CIRCUS") conformed onto both flanks
  const bodySurface = b.surface(bodyLoft);
  for (const s of [1, -1]) {
    b.decal(bodySurface, lucky7Tex, {
      bone: fuselage,
      at: [s * 0.45, 0.94, -0.58],
      dir: [s, 0.05, 0],
      up: [0, 1, 0],
      size: [0.82, 0.41],
      group: "markings",
      name: s > 0 ? "emblemL" : "emblemR",
    });
  }

  // -------------------------------------------------------------------------
  // 2. Exposed 7-Cylinder Radial Engine & Exhaust Manifold
  // -------------------------------------------------------------------------
  const ENGINE_Z = 1.73;
  const ENGINE_Y = 1.07;
  const engineLine = frame([0, ENGINE_Y, ENGINE_Z], [0, 0, 1]);

  // Central crankcase hub & bolt ring
  b.part(new THREE.CylinderGeometry(0.22, 0.25, 0.26, 14), IRON, {
    bone: fuselage,
    at: [0, ENGINE_Y, ENGINE_Z],
    dir: [0, 0, 1],
    group: "engine",
    name: "crankcase",
  });
  b.part(new THREE.CylinderGeometry(0.16, 0.21, 0.12, 14), COPPER, {
    bone: fuselage,
    at: [0, ENGINE_Y, ENGINE_Z + 0.15],
    dir: [0, 0, 1],
    group: "engine",
    name: "crankcaseNoseCone",
  });

  // 7 radial cylinders with cooling fins, brass rocker boxes, pushrods, and spark plugs
  const cylBarrelParts: THREE.BufferGeometry[] = [];
  const cylFinParts: THREE.BufferGeometry[] = [];
  const cylBrassParts: THREE.BufferGeometry[] = [];
  const cylChromeParts: THREE.BufferGeometry[] = [];

  const placeGeo = (geo: THREE.BufferGeometry, at: V3, dir: V3) => {
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(...at),
      aim(dir),
      new THREE.Vector3(1, 1, 1),
    );
    return geo.clone().applyMatrix4(m);
  };

  for (let i = 0; i < 7; i++) {
    const ang = (i / 7) * Math.PI * 2;
    const dx = Math.sin(ang);
    const dy = Math.cos(ang);
    const dir: V3 = [dx, dy, 0];
    const sideDir: V3 = [dy, -dx, 0];

    const basePos: V3 = [dx * 0.21, ENGINE_Y + dy * 0.21, ENGINE_Z];
    const midPos: V3 = [dx * 0.35, ENGINE_Y + dy * 0.35, ENGINE_Z];
    const headPos: V3 = [dx * 0.49, ENGINE_Y + dy * 0.49, ENGINE_Z];

    // Cylinder core barrel
    cylBarrelParts.push(
      placeGeo(new THREE.CylinderGeometry(0.068, 0.062, 0.28, 10), midPos, dir),
    );

    // 5 stacked cooling fins per cylinder
    for (let f = 0; f < 5; f++) {
      const rFin = 0.25 + f * 0.046;
      const finPos: V3 = [dx * rFin, ENGINE_Y + dy * rFin, ENGINE_Z];
      cylFinParts.push(
        placeGeo(new THREE.CylinderGeometry(0.095, 0.095, 0.016, 10), finPos, dir),
      );
    }

    // Twin brass valve rocker boxes on top of each cylinder head
    for (const vSide of [-1, 1]) {
      const rockerPos: V3 = [
        headPos[0] + sideDir[0] * vSide * 0.036 + dx * 0.03,
        headPos[1] + sideDir[1] * vSide * 0.036 + dy * 0.03,
        ENGINE_Z + 0.01,
      ];
      cylBrassParts.push(
        placeGeo(new THREE.BoxGeometry(0.042, 0.055, 0.065), rockerPos, dir),
      );

      // Chrome pushrod tubes from crankcase to rocker box
      const rodMid: V3 = [
        basePos[0] * 0.45 + rockerPos[0] * 0.55,
        basePos[1] * 0.45 + rockerPos[1] * 0.55,
        ENGINE_Z + 0.07,
      ];
      const rodDir: V3 = [
        rockerPos[0] - basePos[0] * 0.7,
        rockerPos[1] - basePos[1] * 0.7,
        -0.04,
      ];
      cylChromeParts.push(
        placeGeo(new THREE.CylinderGeometry(0.009, 0.009, 0.29, 6), rodMid, rodDir),
      );
    }

    // Spark plug + copper ignition lead stub
    const plugPos: V3 = [dx * 0.46, ENGINE_Y + dy * 0.46, ENGINE_Z + 0.065];
    cylBrassParts.push(
      placeGeo(new THREE.CylinderGeometry(0.014, 0.014, 0.04, 6), plugPos, [0, 0, 1]),
    );
  }

  b.part(mergeGeometries(cylBarrelParts)!, IRON, {
    bone: fuselage,
    at: [0, 0, 0],
    group: "engine",
    name: "cylinderBarrels",
  });
  b.part(mergeGeometries(cylFinParts)!, STEEL, {
    bone: fuselage,
    at: [0, 0, 0],
    group: "engine",
    name: "cylinderFins",
  });
  b.part(mergeGeometries(cylBrassParts)!, BRASS, {
    bone: fuselage,
    at: [0, 0, 0],
    group: "engine",
    name: "rockerBoxesAndPlugs",
  });
  b.part(mergeGeometries(cylChromeParts)!, CHROME, {
    bone: fuselage,
    at: [0, 0, 0],
    group: "engine",
    name: "pushrodTubes",
  });

  // Copper collector exhaust ring behind cylinders + twin swept side exhaust pipes
  const exhaustRingPts = Array.from({ length: 14 }, (_, k) => {
    const a = (k / 14) * Math.PI * 2;
    return [Math.sin(a) * 0.36, ENGINE_Y + Math.cos(a) * 0.36, 1.58];
  });
  b.sweep(catmull(exhaustRingPts, { closed: true }), 0.028, {
    bone: fuselage,
    color: COPPER,
    sides: 8,
    group: "engine",
    name: "exhaustCollectorRing",
  });

  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    // Swept dual exhaust stacks venting past the lower cockpit flank
    for (const [idx, yOff] of [0, -0.075].entries()) {
      const pipePath = catmull([
        [s * 0.36, 0.92 + yOff, 1.56],
        [s * 0.49, 0.86 + yOff, 1.38],
        [s * 0.52, 0.82 + yOff, 1.02],
        [s * 0.54, 0.79 + yOff, 0.64 - idx * 0.14],
      ]);
      b.sweep(pipePath, [0.032, 0.038], {
        bone: fuselage,
        color: idx === 0 ? COPPER : EXHAUST_SOOT,
        sides: 8,
        caps: { start: "round", end: "flat" },
        group: "engine",
        name: `exhaustPipe${sideTag}${idx + 1}`,
      });
      // Flared dark soot mouth at the tip of each exhaust pipe
      b.part(new THREE.CylinderGeometry(0.028, 0.036, 0.03, 8), IRON, {
        bone: fuselage,
        at: [s * 0.54, 0.79 + yOff, 0.63 - idx * 0.14],
        dir: [s * 0.15, -0.08, -1],
        group: "engine",
        name: `exhaustMouth${sideTag}${idx + 1}`,
      });
    }
  }

  // Top radiator filler cap with winged brass ornament & sight glass tube on the nose
  b.part(new THREE.CylinderGeometry(0.036, 0.042, 0.06, 10), BRASS, {
    bone: fuselage,
    at: [0, 1.52, 1.44],
    dir: [0, 1, 0],
    group: "cowling",
    name: "radiatorCapBase",
  });
  glow(
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.07, 8), HEADLIGHT_AMBER, {
      bone: fuselage,
      at: [0, 1.58, 1.44],
      dir: [0, 1, 0],
      group: "cowling",
      name: "thermometerSightGlass",
    }),
    1.1,
  );
  for (const s of [1, -1]) {
    b.spike([0, 1.56, 1.44], [s * 0.09, 1.59, 1.42], null, 0.016, {
      bone: fuselage,
      color: GOLD,
      sides: 6,
      group: "cowling",
      name: s > 0 ? "radiatorWingL" : "radiatorWingR",
    });
  }

  // -------------------------------------------------------------------------
  // 3. Oversized Whimsical Spinner & Two-Bladed Wooden Propeller (hinge joint)
  // -------------------------------------------------------------------------
  // Bullet spinner cone in polished brass and crimson bands
  const spinnerOutline: OutlinePoint[] = [
    [0, 0, "sharp"],
    [0.18, 0, "sharp"],
    [0.19, 0.08],
    [0.15, 0.21],
    [0.07, 0.31],
    [0, 0.35, "sharp"],
  ];
  b.lathe(spinnerOutline, {
    bone: propeller,
    at: [0, 1.07, 1.93],
    axis: [0, 0, 1],
    segments: 16,
    smoothing: 1,
    color: BRASS,
    group: "propeller",
    name: "propSpinner",
  });

  // Hub flange & 8 brass mounting bolts
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 12), STEEL, {
    bone: propeller,
    at: [0, 1.07, 1.92],
    dir: [0, 0, 1],
    group: "propeller",
    name: "propHubFlange",
  });
  b.ring(
    frame([0, 1.07, 1.97], [0, 0, 1]),
    { count: 8, radius: 0.115, group: "propeller" },
    (bolt) => {
      b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, {
        bone: propeller,
        at: bolt.at,
        group: "propeller",
      });
    },
  );

  // Two broad paddle-shaped laminated wood blades with brass tip caps
  const bladeOutline: OutlinePoint[] = [
    [0.05, -0.032, "sharp"],
    [0.24, -0.072],
    [0.54, -0.095],
    [0.78, -0.068],
    [0.86, 0.0],
    [0.78, 0.068],
    [0.54, 0.085],
    [0.24, 0.058],
    [0.05, 0.032, "sharp"],
  ];
  for (const s of [1, -1]) {
    b.extrude(bladeOutline, {
      bone: propeller,
      at: [0, 1.07, 1.97],
      x: [0, s, 0],
      y: [s, 0, -0.22], // 12.5° aerodynamic blade pitch
      thickness: [0.042, 0.014],
      bevel: 0.006,
      smoothing: 1,
      color: propWoodPaint,
      group: "propeller",
      name: s > 0 ? "propBladeTop" : "propBladeBottom",
    });
  }

  // -------------------------------------------------------------------------
  // 4. Upper & Lower Biplane Wings (Swept back slightly with dihedral & scallops)
  // -------------------------------------------------------------------------
  // Upper wing is a two-panel gull/cabane-mounted parasol wing with a centre cutout
  // so the pilot can look straight up at the sky.
  const upperWingHalfOutline: OutlinePoint[] = [
    [0.0, 0.44, "sharp"],
    [0.35, 0.44],
    [1.15, 0.43],
    [1.95, 0.41],
    [2.38, 0.34],
    [2.58, 0.14],
    [2.56, -0.16],
    [2.35, -0.34],
    // Scalloped trailing edge inboard of aileron bay, and recessed aileron bay outboard
    [2.22, -0.25, "sharp"],
    [1.32, -0.25, "sharp"],
    [1.26, -0.4, "sharp"],
    [1.08, -0.33],
    [0.9, -0.41, "sharp"],
    [0.72, -0.33],
    [0.54, -0.41, "sharp"],
    [0.36, -0.32],
    [0.18, -0.18],
    [0.0, -0.14, "sharp"],
  ];

  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    b.extrude(upperWingHalfOutline, {
      bone: fuselage,
      at: [0, 1.81, 0.44],
      x: [s, 0.028, -0.02], // gentle 1.6° upward dihedral + slight sweep
      y: [0, 0.06, 1], // 3.5° positive angle of attack
      thickness: [0.065, 0.095],
      bevel: 0.022,
      smoothing: 1,
      color: wingPaint,
      group: "upperWing",
      name: `upperWing${sideTag}`,
    });

    // Upper wingtip star roundels (top and bottom faces)
    b.part(new THREE.CircleGeometry(0.31, 18), "#ffffff", {
      bone: fuselage,
      at: [s * 2.02, 1.92, 0.44],
      dir: [-s * 0.028, 1, -0.06],
      up: [0, 0, 1],
      axis: "z",
      texture: roundelTex,
      group: "markings",
      name: `roundelUpperTop${sideTag}`,
    });
    b.part(new THREE.CircleGeometry(0.28, 18), "#ffffff", {
      bone: fuselage,
      at: [s * 2.02, 1.81, 0.44],
      dir: [s * 0.028, -1, 0.06],
      up: [0, 0, 1],
      axis: "z",
      texture: roundelTex,
      group: "markings",
      name: `roundelUpperBot${sideTag}`,
    });
  }

  // Centre brass fuel header tank faired into the upper wing centre section
  b.capsule([-0.26, 1.85, 0.56], [0.26, 1.85, 0.56], 0.085, {
    bone: fuselage,
    color: BRASS,
    sides: 12,
    group: "upperWing",
    name: "upperHeaderTank",
  });
  // Fuel tank filler cap + copper gravity feed line down to engine
  b.part(new THREE.CylinderGeometry(0.028, 0.032, 0.04, 8), GOLD, {
    bone: fuselage,
    at: [0.08, 1.94, 0.58],
    dir: [0, 1, 0],
    group: "upperWing",
    name: "headerTankCap",
  });
  b.sweep(
    catmull([
      [0.12, 1.78, 0.62],
      [0.24, 1.56, 0.78],
      [0.31, 1.34, 0.94],
    ]),
    0.011,
    {
      bone: fuselage,
      color: COPPER,
      sides: 6,
      group: "upperWing",
      name: "gravityFuelLine",
    },
  );

  // Lower wing panels (mounted to lower fuselage sides with 2.6° dihedral)
  const lowerWingOutline: OutlinePoint[] = [
    [0.0, 0.38, "sharp"],
    [0.65, 0.38],
    [1.45, 0.36],
    [1.88, 0.29],
    [2.06, 0.11],
    [2.04, -0.14],
    [1.86, -0.29],
    // Aileron cutout bay outboard + scalloped trailing edge inboard
    [1.76, -0.21, "sharp"],
    [1.08, -0.21, "sharp"],
    [1.02, -0.35, "sharp"],
    [0.84, -0.28],
    [0.66, -0.35, "sharp"],
    [0.48, -0.28],
    [0.3, -0.35, "sharp"],
    [0.0, -0.32, "sharp"],
  ];

  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    b.extrude(lowerWingOutline, {
      bone: fuselage,
      at: [s * 0.38, 0.72, 0.24],
      x: [s, 0.045, -0.015],
      y: [0, 0.06, 1],
      thickness: [0.058, 0.085],
      bevel: 0.02,
      smoothing: 1,
      color: wingPaint,
      group: "lowerWing",
      name: `lowerWing${sideTag}`,
    });

    // Wing-walk grip mats on the inboard lower wing roots (for boarding & wing-walking)
    b.part(new THREE.BoxGeometry(0.32, 0.018, 0.48), RUBBER, {
      bone: fuselage,
      at: [s * 0.58, 0.77, 0.28],
      rotation: [-3.5, 0, -s * 2.5],
      group: "lowerWing",
      name: `wingWalkMat${sideTag}`,
    });
    // Brass edge trim strips along wing-walk mat
    for (const xEdge of [-0.15, 0.15]) {
      b.rod(
        [s * (0.58 + xEdge), 0.78, 0.05],
        [s * (0.58 + xEdge), 0.8, 0.51],
        0.008,
        {
          bone: fuselage,
          color: BRASS,
          sides: 6,
          group: "lowerWing",
          name: `wingWalkTrim${sideTag}_${xEdge > 0 ? "O" : "I"}`,
        },
      );
    }
  }

  // -------------------------------------------------------------------------
  // 5. Hinged Ailerons (4 independent moving joints with control horns)
  // -------------------------------------------------------------------------
  const upperAileronOutline: OutlinePoint[] = [
    [-0.43, 0.02, "sharp"],
    [0.43, 0.02, "sharp"],
    [0.41, -0.15],
    [0.22, -0.11],
    [0.0, -0.16, "sharp"],
    [-0.22, -0.11],
    [-0.43, -0.15, "sharp"],
  ];
  for (const [s, jnt, sideTag] of [
    [1, aileronUpperL, "L"],
    [-1, aileronUpperR, "R"],
  ] as const) {
    b.extrude(upperAileronOutline, {
      bone: jnt,
      at: [s * 1.77, 1.84, 0.14],
      x: [s, 0.028, -0.02],
      y: [0, 0.06, 1],
      thickness: [0.022, 0.052],
      bevel: 0.008,
      smoothing: 1,
      color: controlPaint,
      group: "ailerons",
      name: `aileronUpperMesh${sideTag}`,
    });
    // Brass control horn on upper aileron
    b.spike(
      [s * 1.77, 1.87, 0.12],
      [s * 1.77, 1.95, 0.09],
      null,
      0.016,
      {
        bone: jnt,
        color: BRASS,
        sides: 6,
        group: "ailerons",
        name: `aileronHornUpper${sideTag}`,
      },
    );
  }

  const lowerAileronOutline: OutlinePoint[] = [
    [-0.33, 0.02, "sharp"],
    [0.33, 0.02, "sharp"],
    [0.31, -0.13],
    [0.16, -0.09],
    [0.0, -0.14, "sharp"],
    [-0.16, -0.09],
    [-0.33, -0.13, "sharp"],
  ];
  for (const [s, jnt, sideTag] of [
    [1, aileronLowerL, "L"],
    [-1, aileronLowerR, "R"],
  ] as const) {
    b.extrude(lowerAileronOutline, {
      bone: jnt,
      at: [s * 1.8, 0.79, -0.01],
      x: [s, 0.045, -0.015],
      y: [0, 0.06, 1],
      thickness: [0.02, 0.046],
      bevel: 0.008,
      smoothing: 1,
      color: controlPaint,
      group: "ailerons",
      name: `aileronLowerMesh${sideTag}`,
    });
    // Inter-aileron slave pushrod linking lower aileron to upper aileron
    b.rod([s * 1.77, 0.81, -0.05], [s * 1.77, 1.82, 0.09], 0.009, {
      bone: jnt,
      color: CHROME,
      sides: 6,
      group: "ailerons",
      name: `aileronSlaveRod${sideTag}`,
    });
  }

  // -------------------------------------------------------------------------
  // 6. Interplane N-Struts, Cabane Struts, Flying Wires & Festive Pennants
  // -------------------------------------------------------------------------
  const fittingCuffs: THREE.BufferGeometry[] = [];
  const riggingWires: THREE.BufferGeometry[] = [];

  const addWire = (a: V3, c: V3, r = 0.0055) => {
    const va = new THREE.Vector3(...a);
    const vc = new THREE.Vector3(...c);
    const midPt = va.clone().lerp(vc, 0.5);
    const dir = vc.clone().sub(va);
    const len = dir.length();
    riggingWires.push(
      placeGeo(new THREE.CylinderGeometry(r, r, len, 5), midPt.toArray(), dir.toArray()),
    );
    // Brass turnbuckles near each end of the wire
    for (const t of [0.12, 0.88]) {
      const tbPt = va.clone().lerp(vc, t);
      fittingCuffs.push(
        placeGeo(new THREE.CylinderGeometry(r * 2.2, r * 2.2, 0.065, 6), tbPt.toArray(), dir.toArray()),
      );
    }
  };

  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";

    // Outboard wooden N-struts (front vertical, rear vertical, and diagonal brace)
    const lowFront: V3 = [s * 1.82, 0.8, 0.44];
    const topFront: V3 = [s * 1.9, 1.84, 0.62];
    const lowRear: V3 = [s * 1.82, 0.78, 0.02];
    const topRear: V3 = [s * 1.9, 1.81, 0.18];

    b.capsule(lowFront, topFront, 0.026, {
      bone: fuselage,
      color: strutWoodPaint,
      sides: 8,
      group: "struts",
      name: `nStrutFront${sideTag}`,
    });
    b.capsule(lowRear, topRear, 0.026, {
      bone: fuselage,
      color: strutWoodPaint,
      sides: 8,
      group: "struts",
      name: `nStrutRear${sideTag}`,
    });
    b.capsule(lowRear, topFront, 0.022, {
      bone: fuselage,
      color: strutWoodPaint,
      sides: 8,
      group: "struts",
      name: `nStrutDiag${sideTag}`,
    });

    // Brass end cuffs for N-struts
    for (const pt of [lowFront, topFront, lowRear, topRear]) {
      fittingCuffs.push(
        placeGeo(new THREE.CylinderGeometry(0.033, 0.033, 0.05, 8), pt, [0, 1, 0]),
      );
    }

    // Wingtip glowing navigation lights (Port = +X = Red, Starboard = -X = Green)
    const navColor = s > 0 ? NAV_RED : NAV_GREEN;
    b.part(new THREE.CylinderGeometry(0.032, 0.04, 0.055, 10), BRASS, {
      bone: fuselage,
      at: [s * 2.48, 1.91, 0.52],
      dir: [0, 0, 1],
      group: "lights",
      name: `navLightHousing${sideTag}`,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.03, 10, 8), navColor, {
        bone: fuselage,
        at: [s * 2.48, 1.91, 0.55],
        group: "lights",
        name: `navLightBulb${sideTag}`,
      }),
      1.8,
    );

    // Centre cabane N-struts supporting the upper wing above the forward fuselage
    const cabLowF: V3 = [s * 0.34, 1.32, 0.88];
    const cabTopF: V3 = [s * 0.42, 1.81, 0.68];
    const cabLowR: V3 = [s * 0.35, 1.31, 0.34];
    const cabTopR: V3 = [s * 0.42, 1.79, 0.24];

    b.capsule(cabLowF, cabTopF, 0.022, {
      bone: fuselage,
      color: BRASS,
      sides: 8,
      group: "struts",
      name: `cabaneFront${sideTag}`,
    });
    b.capsule(cabLowR, cabTopR, 0.022, {
      bone: fuselage,
      color: BRASS,
      sides: 8,
      group: "struts",
      name: `cabaneRear${sideTag}`,
    });
    b.capsule(cabLowR, cabTopF, 0.018, {
      bone: fuselage,
      color: BRASS,
      sides: 8,
      group: "struts",
      name: `cabaneDiag${sideTag}`,
    });

    for (const pt of [cabLowF, cabTopF, cabLowR, cabTopR]) {
      fittingCuffs.push(
        placeGeo(new THREE.SphereGeometry(0.03, 8, 6), pt, [0, 1, 0]),
      );
    }

    // Crossed stainless steel flying & landing wires in each wing bay
    addWire([s * 0.44, 0.74, 0.44], topFront);
    addWire(cabTopF, lowFront);
    addWire([s * 0.44, 0.73, 0.05], topRear);
    addWire(cabTopR, lowRear);
    // Cabane X-bracing wires
    addWire(cabLowF, [-s * 0.42, 1.81, 0.68]);
  }

  // Pitot-static airspeed tube mounted on the port (+X) outboard front strut
  b.rod([1.87, 1.48, 0.56], [1.87, 1.48, 0.94], [0.014, 0.008], {
    bone: fuselage,
    color: BRASS,
    sides: 8,
    group: "instruments",
    name: "pitotTube",
  });
  b.part(new THREE.SphereGeometry(0.022, 8, 6), CHROME, {
    bone: fuselage,
    at: [1.87, 1.48, 0.72],
    group: "instruments",
    name: "pitotCollar",
  });

  // Festive circus pennants fluttering behind the outer front struts
  const pennantFrames = [
    frame([1.86, 1.56, 0.55], [0, 0, -1], [0, 1, 0]),
    frame([1.84, 1.22, 0.49], [0, 0, -1], [0, 1, 0]),
    frame([-1.86, 1.56, 0.55], [0, 0, -1], [0, 1, 0]),
    frame([-1.84, 1.22, 0.49], [0, 0, -1], [0, 1, 0]),
  ];
  b.cards(pennantFrames, pennantTex, {
    bone: fuselage,
    size: [0.14, 0.3],
    lean: 8,
    bend: 18,
    flow: [0, -0.15, -1],
    sink: 0.02,
    group: "props",
    name: "strutPennants",
  });

  // -------------------------------------------------------------------------
  // 7. Tail Empennage (Horizontal Stabilizer, Vertical Fin, Hinged Elevators & Rudder)
  // -------------------------------------------------------------------------
  // Horizontal stabilizer (fixed forward tailplane)
  const hStabOutline: OutlinePoint[] = [
    [0.0, 0.34, "sharp"],
    [0.38, 0.31],
    [0.76, 0.21],
    [0.92, 0.07],
    [0.88, -0.04, "sharp"],
    [0.0, -0.04, "sharp"],
  ];
  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    b.extrude(hStabOutline, {
      bone: fuselage,
      at: [0, 0.87, -1.78],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: [0.032, 0.048],
      bevel: 0.012,
      smoothing: 1,
      color: wingPaint,
      group: "tail",
      name: `horizStab${sideTag}`,
    });

    // Under-tail bracing strut + upper bracing wire
    b.capsule([s * 0.14, 0.72, -1.62], [s * 0.62, 0.86, -1.66], 0.014, {
      bone: fuselage,
      color: BRASS,
      sides: 6,
      group: "tail",
      name: `tailBraceStrut${sideTag}`,
    });
    addWire([0, 1.38, -1.66], [s * 0.64, 0.89, -1.66], 0.0045);
  }

  // Hinged left & right elevators with scalloped trailing edges
  const elevatorOutline: OutlinePoint[] = [
    [-0.38, 0.02, "sharp"],
    [0.42, 0.02, "sharp"],
    [0.4, -0.16],
    [0.24, -0.26, "sharp"],
    [0.06, -0.19],
    [-0.12, -0.27, "sharp"],
    [-0.28, -0.19],
    [-0.38, -0.24, "sharp"],
  ];
  for (const [s, jnt, sideTag] of [
    [1, elevatorL, "L"],
    [-1, elevatorR, "R"],
  ] as const) {
    b.extrude(elevatorOutline, {
      bone: jnt,
      at: [s * 0.46, 0.87, -1.82],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: [0.022, 0.04],
      bevel: 0.008,
      smoothing: 1,
      color: controlPaint,
      group: "tail",
      name: `elevatorMesh${sideTag}`,
    });
    // Elevator control horn + cable back into rear fuselage
    b.spike([s * 0.22, 0.89, -1.86], [s * 0.22, 0.98, -1.88], null, 0.013, {
      bone: jnt,
      color: BRASS,
      sides: 6,
      group: "tail",
      name: `elevatorHorn${sideTag}`,
    });
  }

  // Rounded storybook vertical fin
  const vFinOutline: OutlinePoint[] = [
    [0.0, -0.06, "sharp"],
    [0.58, -0.06, "sharp"],
    [0.48, 0.14],
    [0.28, 0.36],
    [0.08, 0.48],
    [0.0, 0.49, "sharp"],
  ];
  b.extrude(vFinOutline, {
    bone: fuselage,
    at: [0, 0.96, -1.82],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: [0.052, 0.028],
    bevel: 0.012,
    smoothing: 1,
    color: RED_LIT,
    group: "tail",
    name: "verticalFin",
  });

  // Tall rounded circus rudder (hinged on `rudder` joint)
  const rudderOutline: OutlinePoint[] = [
    [0.02, -0.34, "sharp"],
    [0.02, 0.3, "sharp"],
    [-0.12, 0.34],
    [-0.3, 0.24],
    [-0.38, 0.04],
    [-0.34, -0.18],
    [-0.18, -0.34],
  ];
  b.extrude(rudderOutline, {
    bone: rudder,
    at: [0, 1.15, -1.84],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: [0.036, 0.02],
    bevel: 0.009,
    smoothing: 1,
    color: controlPaint,
    group: "tail",
    name: "rudderMesh",
  });
  for (const s of [1, -1]) {
    b.spike([0, 1.05, -1.88], [s * 0.09, 1.05, -1.9], null, 0.013, {
      bone: rudder,
      color: BRASS,
      sides: 6,
      group: "tail",
      name: s > 0 ? "rudderHornL" : "rudderHornR",
    });
    addWire([s * 0.16, 0.95, -1.38], [s * 0.08, 1.05, -1.89], 0.004);
  }

  // Towed "FLYING CIRCUS 5¢" mini sky-banner fluttering behind the rudder
  b.rod([0, 1.18, -2.2], [0, 1.18, -2.35], 0.008, {
    bone: rudder,
    color: BRASS,
    sides: 6,
    group: "tail",
    name: "bannerTowBar",
  });
  b.cards([frame([0, 1.18, -2.22], [0, 0, -1], [0, 1, 0])], bannerTex, {
    bone: rudder,
    size: [0.3, 0.62],
    lean: 6,
    bend: 22,
    flow: [0, -0.08, -1],
    sink: 0.02,
    group: "tail",
    name: "towedSkyBanner",
  });

  // Merge all turnbuckles/cuffs and all rigging wires into single static parts
  b.part(mergeGeometries(fittingCuffs)!, BRASS, {
    bone: fuselage,
    at: [0, 0, 0],
    group: "struts",
    name: "strutFittingsAndTurnbuckles",
  });
  b.part(mergeGeometries(riggingWires)!, STEEL, {
    bone: fuselage,
    at: [0, 0, 0],
    group: "struts",
    name: "flyingAndLandingWires",
  });

  // -------------------------------------------------------------------------
  // 8. Cockpit Interior, Leather Coaming, Windscreen & Hinged Side Door
  // -------------------------------------------------------------------------
  // Dark cockpit tub interior recess
  b.part(new THREE.CylinderGeometry(0.36, 0.32, 0.34, 14), "#1b1410", {
    bone: fuselage,
    at: [0, 1.24, -0.08],
    dir: [0, 1, 0.06],
    group: "cockpit",
    name: "cockpitWell",
  });

  // Plush stitched brown leather coaming ring around the cockpit rim
  const coamingPts: V3[] = [
    [0, 1.43, 0.25],
    [0.28, 1.4, 0.16],
    [0.37, 1.37, -0.08],
    [0.28, 1.39, -0.32],
    [0, 1.42, -0.4],
    [-0.28, 1.39, -0.32],
    [-0.37, 1.37, -0.08],
    [-0.28, 1.4, 0.16],
  ];
  b.sweep(catmull(coamingPts, { closed: true }), 0.052, {
    bone: fuselage,
    color: leatherPaint,
    sides: 10,
    group: "cockpit",
    name: "cockpitLeatherCoaming",
  });

  // Quilted leather headrest pad behind pilot
  b.capsule([0, 1.42, -0.38], [0, 1.48, -0.48], [0.14, 0.08], {
    bone: fuselage,
    color: leatherPaint,
    sides: 10,
    group: "cockpit",
    name: "pilotHeadrest",
  });

  // Woven wicker pilot bucket seat with red seat cushion and brass harness buckles
  b.part(new THREE.CylinderGeometry(0.24, 0.21, 0.28, 12, 1, true), WICKER, {
    bone: fuselage,
    at: [0, 1.02, -0.18],
    dir: [0, 1, 0.1],
    group: "cockpit",
    name: "wickerBucketSeat",
  });
  b.part(new THREE.BoxGeometry(0.34, 0.09, 0.32), RED_LIT, {
    bone: fuselage,
    at: [0, 0.9, -0.14],
    group: "cockpit",
    name: "seatCushion",
  });
  // Shoulder harness straps draped over seat back
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.1, 1.38, -0.34],
        [s * 0.11, 1.18, -0.26],
        [s * 0.09, 0.96, -0.16],
      ]),
      0.02,
      {
        bone: fuselage,
        color: CREAM_LIT,
        sides: 6,
        group: "cockpit",
        name: s > 0 ? "harnessStrapL" : "harnessStrapR",
      },
    );
  }

  // Mahogany instrument panel board + 5 glowing dials + central brass compass
  b.part(new THREE.BoxGeometry(0.56, 0.24, 0.05), WOOD_DARK, {
    bone: fuselage,
    at: [0, 1.28, 0.22],
    rotation: [10, 0, 0],
    group: "cockpit",
    name: "instrumentBoard",
  });
  const dialCoords: Array<[number, number, number]> = [
    [0, 1.33, 0.068],
    [-0.14, 1.3, 0.056],
    [0.14, 1.3, 0.056],
    [-0.23, 1.24, 0.044],
    [0.23, 1.24, 0.044],
  ];
  dialCoords.forEach(([dx, dy, r], idx) => {
    b.part(new THREE.CylinderGeometry(r + 0.01, r + 0.01, 0.03, 12), BRASS, {
      bone: fuselage,
      at: [dx, dy, 0.2],
      dir: [0, -0.17, -0.98],
      group: "cockpit",
      name: `dialBezel${idx + 1}`,
    });
    glow(
      b.part(new THREE.CircleGeometry(r, 14), "#ffffff", {
        bone: fuselage,
        at: [dx, dy, 0.182],
        dir: [0, -0.17, -0.98],
        up: [0, 1, 0],
        axis: "z",
        texture: dialTex,
        group: "cockpit",
        name: `dialFace${idx + 1}`,
      }),
      0.9,
    );
  });

  // Binnacle compass housing atop the coaming
  b.part(new THREE.CylinderGeometry(0.052, 0.058, 0.06, 12), BRASS, {
    bone: fuselage,
    at: [0, 1.47, 0.25],
    dir: [0, 1, 0],
    group: "cockpit",
    name: "compassHousing",
  });
  glow(
    b.part(new THREE.CircleGeometry(0.046, 12), "#ffffff", {
      bone: fuselage,
      at: [0, 1.502, 0.25],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      axis: "z",
      texture: compassTex,
      group: "cockpit",
      name: "compassGlass",
    }),
    1.0,
  );

  // Tri-pane brass-framed windscreen in front of the cockpit
  const paneAngles = [
    { x: 0, z: 0.24, rotY: 0, w: 0.24, name: "Centre" },
    { x: 0.2, z: 0.18, rotY: -36, w: 0.2, name: "L" },
    { x: -0.2, z: 0.18, rotY: 36, w: 0.2, name: "R" },
  ];
  for (const pane of paneAngles) {
    b.part(new THREE.BoxGeometry(pane.w + 0.025, 0.19, 0.02), BRASS, {
      bone: fuselage,
      at: [pane.x, 1.51, pane.z],
      rotation: [-22, pane.rotY, 0],
      group: "cockpit",
      name: `windscreenFrame${pane.name}`,
    });
    glow(
      b.part(new THREE.BoxGeometry(pane.w - 0.015, 0.15, 0.024), GLASS_CYAN, {
        bone: fuselage,
        at: [pane.x, 1.51, pane.z],
        rotation: [-22, pane.rotY, 0],
        group: "cockpit",
        name: `windscreenGlass${pane.name}`,
      }),
      0.55,
    );
  }

  // Hinged control stick with rubber grip & brass trigger button
  b.rod([0, 0.72, -0.02], [0, 1.16, 0.04], 0.016, {
    bone: controlStick,
    color: BRASS,
    sides: 8,
    group: "cockpit",
    name: "controlStickShaft",
  });
  b.capsule([0, 1.14, 0.04], [0, 1.26, 0.06], 0.026, {
    bone: controlStick,
    color: RUBBER,
    sides: 8,
    group: "cockpit",
    name: "controlStickGrip",
  });
  b.part(new THREE.SphereGeometry(0.016, 6, 4), RED_LIT, {
    bone: controlStick,
    at: [0, 1.27, 0.06],
    group: "cockpit",
    name: "stickTriggerButton",
  });

  // Hinged side throttle quadrant & brass ball lever
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.025, 10), BRASS, {
    bone: fuselage,
    at: [0.33, 1.08, 0.05],
    dir: [1, 0, 0],
    group: "cockpit",
    name: "throttleQuadrant",
  });
  b.rod([0.34, 1.08, 0.05], [0.34, 1.22, 0.12], 0.01, {
    bone: throttleLever,
    color: CHROME,
    sides: 6,
    group: "cockpit",
    name: "throttleArm",
  });
  b.part(new THREE.SphereGeometry(0.026, 8, 6), RED_LIT, {
    bone: throttleLever,
    at: [0.34, 1.23, 0.125],
    group: "cockpit",
    name: "throttleBallKnob",
  });

  // Hinged fold-down cockpit boarding door on port (+X) side with brass latch handle
  b.part(new THREE.BoxGeometry(0.032, 0.26, 0.34), RED_LIT, {
    bone: cockpitDoor,
    at: [0.44, 1.18, -0.08],
    rotation: [0, 0, -8],
    group: "cockpit",
    name: "cockpitSideDoor",
  });
  b.capsule([0.46, 1.24, -0.18], [0.46, 1.24, -0.04], 0.014, {
    bone: cockpitDoor,
    color: BRASS,
    sides: 6,
    group: "cockpit",
    name: "cockpitDoorLatch",
  });

  // -------------------------------------------------------------------------
  // 9. Whimsical Story Details (Scarf, Goggles, megaphone, Thermos, Anemometer, Ladder)
  // -------------------------------------------------------------------------
  // Pilot's leather flying helmet & brass aviator goggles perched on the headrest
  b.part(new THREE.SphereGeometry(0.12, 12, 10), leatherPaint, {
    bone: fuselage,
    at: [0, 1.48, -0.32],
    scale: [0.95, 0.88, 1.05],
    group: "storyProps",
    name: "aviatorHelmet",
  });
  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    // Ear flaps on leather helmet
    b.capsule([s * 0.11, 1.46, -0.32], [s * 0.12, 1.36, -0.3], 0.032, {
      bone: fuselage,
      color: LEATHER,
      sides: 8,
      group: "storyProps",
      name: `helmetEarFlap${sideTag}`,
    });
    // Brass goggle frames + glowing cyan lenses resting on the helmet brow
    b.part(new THREE.CylinderGeometry(0.044, 0.048, 0.036, 10), BRASS, {
      bone: fuselage,
      at: [s * 0.052, 1.53, -0.22],
      dir: [s * 0.18, 0.25, 0.95],
      group: "storyProps",
      name: `goggleFrame${sideTag}`,
    });
    glow(
      b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.04, 10), GLASS_CYAN, {
        bone: fuselage,
        at: [s * 0.052, 1.53, -0.218],
        dir: [s * 0.18, 0.25, 0.95],
        group: "storyProps",
        name: `goggleLens${sideTag}`,
      }),
      0.8,
    );
  }

  // Fluttering white silk aviator scarf streaming back from the cockpit rim
  const scarfMainPath = catmull([
    [0.14, 1.45, -0.32],
    [0.26, 1.49, -0.56],
    [0.2, 1.44, -0.86],
    [0.31, 1.48, -1.16],
    [0.24, 1.42, -1.44],
  ]);
  b.sweep(scarfMainPath, (t) => [0.065 * (1 - 0.35 * t), 0.012], {
    bone: fuselage,
    color: SCARF_SILK,
    sides: 8,
    caps: "round",
    group: "storyProps",
    name: "silkScarfStream",
  });
  // Double-sided textured fringe tail card at the end of the scarf
  b.cards(
    [
      frame([0.26, 1.46, -0.78], [0, 1, 0]),
      frame([0.28, 1.44, -1.18], [0, 1, 0]),
    ],
    scarfTex,
    {
      bone: fuselage,
      size: [0.15, 0.38],
      lean: 84,
      bend: 24,
      flow: [0.15, 0.05, -1],
      mirror: true,
      group: "storyProps",
      name: "silkScarfCards",
    },
  );

  // Brass barnstormer announcer's megaphone & klaxon horn mounted on starboard (-X) cockpit side
  const megaOutline: OutlinePoint[] = [
    [0.018, 0, "sharp"],
    [0.025, 0, "sharp"],
    [0.048, 0.18],
    [0.095, 0.34],
    [0.125, 0.38, "sharp"],
    [0.105, 0.38, "sharp"],
    [0.078, 0.32],
    [0.018, 0.02, "sharp"],
  ];
  b.lathe(megaOutline, {
    bone: fuselage,
    at: [-0.46, 1.24, -0.06],
    axis: [-0.12, -0.05, 0.99],
    segments: 14,
    smoothing: 1,
    color: BRASS,
    group: "storyProps",
    name: "announcerMegaphone",
  });
  b.part(new THREE.SphereGeometry(0.042, 8, 6), RUBBER, {
    bone: fuselage,
    at: [-0.45, 1.25, -0.09],
    group: "storyProps",
    name: "klaxonRubberBulb",
  });

  // Leather dispatch saddlebag & brass thermos strapped to the fuselage behind cockpit
  b.part(new THREE.BoxGeometry(0.11, 0.24, 0.28), leatherPaint, {
    bone: fuselage,
    at: [-0.44, 1.02, -0.42],
    rotation: [0, 6, 8],
    group: "storyProps",
    name: "dispatchMailBag",
  });
  b.part(new THREE.BoxGeometry(0.12, 0.09, 0.3), LEATHER_TAN, {
    bone: fuselage,
    at: [-0.44, 1.11, -0.42],
    rotation: [0, 6, 8],
    group: "storyProps",
    name: "dispatchBagFlap",
  });
  b.capsule([-0.46, 0.95, -0.64], [-0.46, 1.15, -0.64], 0.042, {
    bone: fuselage,
    color: TEAL,
    bands: [
      [0.25, BRASS],
      [0.78, TEAL],
      [1.0, BRASS],
    ],
    sides: 10,
    group: "storyProps",
    name: "pilotThermos",
  });

  // Whimsical spinning 3-cup anemometer wind-speed gadget on the starboard cabane strut (`anemometer` hinge joint)
  b.rod([-1.36, 0.78, 0.48], [-1.36, 1.56, 0.48], 0.012, {
    bone: fuselage,
    color: BRASS,
    sides: 6,
    group: "storyProps",
    name: "anemometerMast",
  });
  b.part(new THREE.SphereGeometry(0.026, 8, 6), GOLD, {
    bone: anemometer,
    at: [-1.36, 1.56, 0.48],
    group: "storyProps",
    name: "anemometerHub",
  });
  b.ring(
    frame([-1.36, 1.56, 0.48], [0, 1, 0]),
    { count: 3, radius: 0.09, group: "storyProps" },
    (cupFrame) => {
      b.rod([-1.36, 1.56, 0.48], cupFrame.at, 0.007, {
        bone: anemometer,
        color: CHROME,
        sides: 5,
        group: "storyProps",
      });
      b.part(new THREE.SphereGeometry(0.028, 8, 6), RED_LIT, {
        bone: anemometer,
        at: cupFrame.at,
        group: "storyProps",
      });
    },
  );

  // Wing-walker's rope & ash-wood boarding ladder hanging under the port (+X) lower wing (`ropeLadder` hinge joint)
  // Carefully kept above y = 0.22 m so the landing gear wheels remain the sole floor contact at y = 0.
  for (const zOff of [-0.11, 0.11]) {
    b.sweep(
      catmull([
        [1.05, 0.72, 0.18 + zOff],
        [1.08, 0.5, 0.15 + zOff],
        [1.06, 0.28, 0.11 + zOff],
      ]),
      0.009,
      {
        bone: ropeLadder,
        color: ROPE,
        sides: 6,
        group: "storyProps",
        name: zOff > 0 ? "ladderRopeFront" : "ladderRopeBack",
      },
    );
  }
  for (const [idx, [ry, rz]] of [
    [0.6, 0.165],
    [0.45, 0.14],
    [0.3, 0.115],
  ].entries()) {
    b.capsule([1.06, ry, rz - 0.13], [1.06, ry, rz + 0.13], 0.015, {
      bone: ropeLadder,
      color: WOOD_LIGHT,
      sides: 8,
      group: "storyProps",
      name: `ladderRung${idx + 1}`,
    });
  }

  // -------------------------------------------------------------------------
  // 10. Main Landing Gear, Spats, Bungee Struts & Tail Skid (Resting on y = 0)
  // -------------------------------------------------------------------------
  // Main wheels have outer radius 0.30 m and centre at y = 0.30 m -> bottom sits at y = 0.000 m.
  const wheelProfile: OutlinePoint[] = [
    [0.0, -0.055, "sharp"],
    [0.06, -0.055],
    [0.17, -0.038],
    [0.2, -0.072],
    [0.26, -0.088],
    [0.295, -0.048],
    [0.3, 0.0],
    [0.295, 0.048],
    [0.26, 0.088],
    [0.2, 0.072],
    [0.17, 0.038],
    [0.06, 0.055],
    [0.0, 0.055, "sharp"],
  ];

  // Streamlined teardrop wheel fairing ("spat") over upper half of each wheel
  const spatOutline: OutlinePoint[] = [
    [-0.36, -0.04, "sharp"],
    [0.34, -0.04, "sharp"],
    [0.38, 0.06],
    [0.28, 0.24],
    [0.04, 0.35],
    [-0.24, 0.26],
    [-0.42, 0.08],
  ];

  for (const [s, gearJnt, whlJnt, sideTag] of [
    [1, strutGearL, wheelL, "L"],
    [-1, strutGearR, wheelR, "R"],
  ] as const) {
    const wheelCenter: V3 = [s * 0.58, 0.3, 1.05];

    // Forward & rear V-struts from lower fuselage to axle + bungee shock-absorber wrap
    b.capsule([s * 0.34, 0.72, 1.18], wheelCenter, 0.026, {
      bone: gearJnt,
      color: RED_LIT,
      sides: 8,
      group: "landingGear",
      name: `gearStrutFront${sideTag}`,
    });
    b.capsule([s * 0.34, 0.7, 0.74], wheelCenter, 0.024, {
      bone: gearJnt,
      color: RED_LIT,
      sides: 8,
      group: "landingGear",
      name: `gearStrutRear${sideTag}`,
    });
    // Inboard spreader bar to fuselage centreline belly
    b.capsule([0, 0.52, 1.02], wheelCenter, 0.022, {
      bone: gearJnt,
      color: BRASS,
      sides: 8,
      group: "landingGear",
      name: `gearAxleStrut${sideTag}`,
    });
    // Cord-wrapped bungee shock absorber cylinder
    b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.14, 10), GOLD, {
      bone: gearJnt,
      at: lerp([s * 0.34, 0.72, 1.18], wheelCenter, 0.65),
      aim: wheelCenter,
      group: "landingGear",
      name: `gearBungeeWrap${sideTag}`,
    });

    // Streamlined wheel spat fender (rides the suspension strut joint above the wheel)
    b.extrude(spatOutline, {
      bone: gearJnt,
      at: [s * 0.58, 0.34, 1.05],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.22, 0.14],
      bevel: 0.035,
      smoothing: 1,
      color: fuselagePaint,
      group: "landingGear",
      name: `wheelSpat${sideTag}`,
    });

    // Headlight pod mounted on the front of each wheel spat
    b.part(new THREE.CylinderGeometry(0.045, 0.032, 0.07, 10), BRASS, {
      bone: gearJnt,
      at: [s * 0.58, 0.52, 1.41],
      dir: [0, 0, 1],
      group: "lights",
      name: `landingLightPod${sideTag}`,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.038, 10, 8), HEADLIGHT_AMBER, {
        bone: gearJnt,
        at: [s * 0.58, 0.52, 1.44],
        group: "lights",
        name: `landingLightLens${sideTag}`,
      }),
      1.6,
    );

    // Chubby balloon tire + brass wheel disc + knocked-off hubcap (rides `wheelL`/`wheelR` hinge joint)
    b.lathe(wheelProfile, {
      bone: whlJnt,
      at: wheelCenter,
      axis: [1, 0, 0],
      segments: 20,
      smoothing: 1,
      color: tirePaint,
      group: "landingGear",
      name: `mainTire${sideTag}`,
    });
    b.part(new THREE.CylinderGeometry(0.175, 0.175, 0.12, 16), CREAM_LIT, {
      bone: whlJnt,
      at: wheelCenter,
      dir: [1, 0, 0],
      group: "landingGear",
      name: `wheelRimDisc${sideTag}`,
    });
    b.part(new THREE.CylinderGeometry(0.065, 0.085, 0.16, 12), BRASS, {
      bone: whlJnt,
      at: wheelCenter,
      dir: [1, 0, 0],
      group: "landingGear",
      name: `wheelHubcap${sideTag}`,
    });
  }

  // Rear tail skid & caster wheel touching y = 0 at [0, 0.09, -1.78] (radius 0.09 m)
  b.capsule([0, 0.62, -1.58], [0, 0.11, -1.78], [0.028, 0.02], {
    bone: tailSkid,
    color: strutWoodPaint,
    sides: 8,
    group: "landingGear",
    name: "tailSkidStrut",
  });
  b.capsule([0, 0.52, -1.72], [0, 0.16, -1.78], 0.016, {
    bone: tailSkid,
    color: BRASS,
    sides: 6,
    group: "landingGear",
    name: "tailSkidSpring",
  });
  // Tail wheel tire (radius 0.09 m at y = 0.09 -> bottom at y = 0.000 m)
  const tailWheelProfile: OutlinePoint[] = [
    [0.0, -0.024, "sharp"],
    [0.05, -0.024],
    [0.082, -0.032],
    [0.09, 0.0],
    [0.082, 0.032],
    [0.05, 0.024],
    [0.0, 0.024, "sharp"],
  ];
  b.lathe(tailWheelProfile, {
    bone: tailWheel,
    at: [0, 0.09, -1.78],
    axis: [1, 0, 0],
    segments: 14,
    smoothing: 1,
    color: RUBBER,
    group: "landingGear",
    name: "tailWheelTire",
  });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.058, 10), BRASS, {
    bone: tailWheel,
    at: [0, 0.09, -1.78],
    dir: [1, 0, 0],
    group: "landingGear",
    name: "tailWheelHub",
  });

  // -------------------------------------------------------------------------
  // 11. Merged Brass Rivet &Inspection Plate Trim Pass
  // -------------------------------------------------------------------------
  const rivetGeos: THREE.BufferGeometry[] = [];
  const rivetSphere = new THREE.SphereGeometry(0.009, 5, 4);

  // Cowling seam rivets & fuselage longeron rivets
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * Math.PI * 2;
    rivetGeos.push(
      rivetSphere
        .clone()
        .translate(Math.sin(a) * 0.44, 1.07 + Math.cos(a) * 0.44, 1.52),
    );
    rivetGeos.push(
      rivetSphere
        .clone()
        .translate(Math.sin(a) * 0.46, 1.07 + Math.cos(a) * 0.46, 1.81),
    );
  }
  // Cockpit coaming brass studs
  for (const pt of coamingPts) {
    const p = offset(pt, [0, 1, 0], 0.048);
    rivetGeos.push(rivetSphere.clone().translate(p.x, p.y, p.z));
  }
  b.part(mergeGeometries(rivetGeos)!, GOLD, {
    bone: fuselage,
    at: [0, 0, 0],
    group: "cowling",
    name: "brassRivetsAndStuds",
  });

  return b.root;
}
