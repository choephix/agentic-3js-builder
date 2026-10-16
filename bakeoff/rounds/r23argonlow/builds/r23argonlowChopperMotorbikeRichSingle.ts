import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame, line } from "../../../../src/frame";
import { DEG, lerp, offset } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import { mix, noise, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Custom Chopper Motorbike",
  description:
    "Overwatch-style custom futuristic outrider chopper motorbike with long raked forks, super-wide rear tire, glowing fusion V-twin engine, quad upswept exhausts, sculpted aerodynamic teardrop tank, and articulated controls.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// ============================================================================
// PALETTE & PAINTS (Overwatch Stylized Sci-Fi: Crisp Pearl White, Obsidian,
// Gunmetal, Warm Titanium, and Blazing Outrider Orange + Cyan Plasma Accents)
// ============================================================================

const PEARL_WHITE = "#f2f5fa";
const PEARL_SHADOW = "#cfd7e6";
const OBSIDIAN = "#1b1f2a";
const GUNMETAL = "#32394a";
const DARK_STEEL = "#252a36";
const TITANIUM = "#8c96a8";
const CHROME = "#d8e0ed";
const GOLD_BRASS = "#e5a93c";
const BLAZE_ORANGE = "#ff5500";
const AMBER_ORANGE = "#ff8811";
const PLASMA_CYAN = "#00e5ff";
const PLASMA_BLUE = "#0088ff";
const RUBY_RED = "#ff1e38";
const LEATHER_DARK = "#241d21";
const LEATHER_TAN = "#8a4b29";
const RUBBER_DARK = "#171920";

// Stylized Overwatch painted tank & fender surface: crisp colour blocking with
// bold racing stripe, bevel highlight, and subtle panel-line shading.
const TANK_PAINT = paint((p, n) => {
  const ax = Math.abs(p.x);
  // Central racing stripe in Blaze Orange bordered by dark obsidian & amber pin-stripes
  if (ax < 0.042 && n.y > -0.2) {
    if (ax > 0.034) return OBSIDIAN;
    if (ax > 0.027) return AMBER_ORANGE;
    return BLAZE_ORANGE;
  }
  // Side aerodynamic recessed scallop in Blaze Orange on tank flanks
  const inScallop =
    p.z > -0.02 &&
    p.z < 0.34 &&
    p.y > 0.72 &&
    p.y < 0.90 &&
    ax > 0.095 &&
    p.y - (0.74 + (p.z - 0.0) * 0.22) < 0.065;
  if (inScallop) {
    return n.y > 0.25 ? AMBER_ORANGE : BLAZE_ORANGE;
  }
  // Panel seam line
  const seam = Math.abs(p.y - (0.74 + p.z * 0.22));
  if (seam < 0.005 && p.z > -0.08 && p.z < 0.38 && ax > 0.06) {
    return OBSIDIAN;
  }
  // Top highlight vs lower shadow gradient (stylized Overwatch PBR feel)
  const topLight = smoothstep(-0.2, 0.75, n.y);
  return mix(PEARL_SHADOW, PEARL_WHITE, topLight);
});

// Rear & Front Fender stylized paint with central orange rally stripe and dark carbon edges
const FENDER_PAINT = paint((p, n) => {
  const ax = Math.abs(p.x);
  if (ax < 0.038) {
    if (ax > 0.030) return OBSIDIAN;
    return BLAZE_ORANGE;
  }
  if (ax > 0.145) return OBSIDIAN;
  const light = smoothstep(-0.3, 0.8, n.y);
  return mix(PEARL_SHADOW, PEARL_WHITE, light);
});

// Quilted leather saddle paint with stitched ribbing and subtle wear
const SADDLE_PAINT = paint((p, n) => {
  const ax = Math.abs(p.x);
  // Orange contrast piping along the seat border
  if (ax > 0.145 && ax < 0.165 && p.y > 0.56) {
    return BLAZE_ORANGE;
  }
  // Transverse quilted ribs across the seat pan
  const ribWave = Math.sin(p.z * 110);
  const stitch = smoothstep(0.75, 0.95, Math.abs(ribWave));
  const baseLeather = ax < 0.12 ? mix(LEATHER_DARK, LEATHER_TAN, 0.22) : LEATHER_DARK;
  const shaded = mix(baseLeather, "#110d10", stitch * 0.65);
  return mix(shaded, "#3d3138", smoothstep(0.3, 0.95, n.y) * 0.35);
});

// Tire tread paint: dark vulcanized rubber with diagonal stylized tread grooves & orange sidewall ring
const TIRE_PAINT = paint((p, n, s) => {
  // s[1] is dorsal clock angle around the torus sweep (0 = top, 90 = right, 180 = bottom, 270 = left)
  const sideNorm = Math.abs(n.x);
  // Crisp orange racing sidewall pinstripe
  if (sideNorm > 0.72 && sideNorm < 0.84) {
    return BLAZE_ORANGE;
  }
  if (sideNorm > 0.55) {
    return "#1e212b";
  }
  // Tread pattern on the crown
  const chevron = Math.sin(s[0] * Math.PI * 36 + Math.abs(p.x) * 28);
  const groove = smoothstep(0.55, 0.8, chevron);
  return mix(RUBBER_DARK, "#262a36", groove * 0.5);
});

// Heat-blued titanium exhaust header paint
const EXHAUST_PAINT = paint((p, n, s) => {
  const t = s[0];
  const w = noise(p, 0.18, 17) * 0.08;
  const u = t + w;
  let col = CHROME;
  if (u < 0.22) col = mix(PLASMA_BLUE, "#8a5cf5", smoothstep(0.05, 0.22, u));
  else if (u < 0.42) col = mix("#8a5cf5", GOLD_BRASS, smoothstep(0.22, 0.42, u));
  else col = mix(GOLD_BRASS, CHROME, smoothstep(0.42, 0.72, u));
  const spec = smoothstep(0.2, 0.85, n.y * 0.6 + Math.abs(n.x) * 0.4);
  return mix(GUNMETAL, col, 0.45 + 0.55 * spec);
});

// ============================================================================
// SVG TEXTURES (Crisp Overwatch Decals, Gauges, Emblems, Brake Rotors)
// ============================================================================

const TANK_EMBLEM_SVG = svg(
  `<svg viewBox="0 0 256 128">
    <!-- Stylized Outrider Winged Star / Chevron Emblem -->
    <polygon points="16,44 96,44 114,64 78,64" fill="#ff5500"/>
    <polygon points="34,74 106,74 118,88 54,88" fill="#ff8811"/>
    <polygon points="240,44 160,44 142,64 178,64" fill="#ff5500"/>
    <polygon points="222,74 150,74 138,88 202,88" fill="#ff8811"/>
    <polygon points="128,16 152,58 128,112 104,58" fill="#1b1f2a" stroke="#f2f5fa" stroke-width="5"/>
    <polygon points="128,28 142,58 128,96 114,58" fill="#00e5ff"/>
    <circle cx="128" cy="58" r="7" fill="#ffffff"/>
    <text x="128" y="122" font-family="sans-serif" font-weight="900" font-size="16" fill="#1b1f2a" text-anchor="middle" letter-spacing="4">OUTRIDER-76</text>
  </svg>`,
  { size: 512 },
);

const SPEEDO_GAUGE_SVG = svg(
  `<svg viewBox="0 0 256 256">
    <circle cx="128" cy="128" r="120" fill="#121620" stroke="#32394a" stroke-width="10"/>
    <circle cx="128" cy="128" r="104" fill="none" stroke="#00e5ff" stroke-width="6" stroke-dasharray="16 8"/>
    <path d="M 52 184 A 94 94 0 1 1 204 184" fill="none" stroke="#ff5500" stroke-width="12" stroke-linecap="round"/>
    <!-- Needle -->
    <polygon points="128,136 120,124 186,68 134,132" fill="#ff1e38"/>
    <circle cx="128" cy="128" r="16" fill="#f2f5fa" stroke="#1b1f2a" stroke-width="5"/>
    <text x="128" y="176" font-family="monospace" font-weight="bold" font-size="34" fill="#00e5ff" text-anchor="middle">188</text>
    <text x="128" y="202" font-family="sans-serif" font-weight="bold" font-size="16" fill="#ff8811" text-anchor="middle">KM/H • FUSION</text>
  </svg>`,
  { size: 256 },
);

const NUMBER_PLATE_SVG = svg(
  `<svg viewBox="0 0 256 160">
    <rect x="8" y="8" width="240" height="144" rx="22" fill="#1b1f2a" stroke="#ff5500" stroke-width="10"/>
    <polygon points="22,22 105,22 65,138 22,138" fill="#ff5500" opacity="0.85"/>
    <text x="148" y="108" font-family="sans-serif" font-weight="900" font-size="88" fill="#f2f5fa" text-anchor="middle">07</text>
    <text x="148" y="134" font-family="sans-serif" font-weight="bold" font-size="16" fill="#00e5ff" text-anchor="middle" letter-spacing="3">DEADLOCK</text>
  </svg>`,
  { size: 256 },
);

const HEADLIGHT_LENS_SVG = svg(
  `<svg viewBox="0 0 256 256">
    <circle cx="128" cy="128" r="120" fill="#0d1b2a" stroke="#00e5ff" stroke-width="12"/>
    <circle cx="128" cy="128" r="92" fill="none" stroke="#00e5ff" stroke-width="10" stroke-dasharray="42 18"/>
    <polygon points="68,98 188,98 208,128 188,158 68,158 48,128" fill="#00e5ff"/>
    <polygon points="84,110 172,110 186,128 172,146 84,146 70,128" fill="#ffffff"/>
    <circle cx="128" cy="60" r="10" fill="#ff8811"/>
    <circle cx="128" cy="196" r="10" fill="#ff8811"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "chopperMotorbike", detail: 1, paintSize: 1024 });

  // ==========================================================================
  // DIMENSIONS & KEY COORDINATES (Real-world Custom Chopper: ~2.58m long,
  // ~1.16m tall at handlebars/mirrors, ~0.88m wide across bars/pipes)
  // ==========================================================================
  const REAR_Z = -0.84;
  const REAR_R = 0.34; // 68cm tall fat rear wheel
  const REAR_TUBE_R = 0.095; // 19cm wide fat custom chopper tire

  const FRONT_Z = 0.98;
  const FRONT_R = 0.37; // 74cm tall 21-inch raked chopper front wheel
  const FRONT_TUBE_R = 0.052;

  const STEER_NECK: [number, number, number] = [0, 0.89, 0.38];
  const FORK_DIR: [number, number, number] = [0, FRONT_R - STEER_NECK[1], FRONT_Z - STEER_NECK[2]]; // [0, -0.52, 0.60] (~49° chopper rake!)
  const HANDLEBAR_CENTER: [number, number, number] = [0, 1.07, 0.25];
  const SWINGARM_PIVOT: [number, number, number] = [0, 0.35, -0.30];
  const ENGINE_CENTER: [number, number, number] = [0, 0.37, 0.02];

  // ==========================================================================
  // 1. SKELETON & RIGGING (Role: "hinge" for moving vehicle assemblies)
  // ==========================================================================
  const chassis = b.joint("chassis", {
    at: [0, 0.38, -0.05],
    dir: [0, 0, 1],
    role: "spine",
    group: "chassis",
  });

  // Swingarm hinge joint
  const swingarm = b.joint("swingarm", {
    parent: chassis,
    at: SWINGARM_PIVOT,
    dir: [0, -0.01, -1],
    role: "hinge",
    group: "swingarm",
  });

  // Rear wheel axle hinge (local +X is axle spin axis with default forward/back dir)
  const wheelRear = b.joint("wheelRear", {
    parent: swingarm,
    at: [0, REAR_R, REAR_Z],
    dir: [0, 0, 1],
    role: "hinge",
    group: "wheelRear",
  });

  // Steering column hinge (tilted along the raked fork axis)
  const steering = b.joint("steering", {
    parent: chassis,
    at: STEER_NECK,
    dir: FORK_DIR,
    role: "hinge",
    group: "steering",
  });

  // Front telescopic fork lower slider suspension hinge
  const forkSlider = b.joint("forkSlider", {
    parent: steering,
    at: lerp(STEER_NECK, [0, FRONT_R, FRONT_Z], 0.52),
    dir: FORK_DIR,
    role: "hinge",
    group: "steering",
  });

  // Front wheel axle hinge
  const wheelFront = b.joint("wheelFront", {
    parent: forkSlider,
    at: [0, FRONT_R, FRONT_Z],
    dir: [0, 0, 1],
    role: "hinge",
    group: "wheelFront",
  });

  // Handlebars hinge
  const handlebars = b.joint("handlebars", {
    parent: steering,
    at: HANDLEBAR_CENTER,
    dir: [0, 0.4, -0.9],
    role: "hinge",
    group: "handlebars",
  });

  // Clutch & Front Brake Lever hinges on the handlebars
  const leverL = b.joint("leverL", {
    parent: handlebars,
    at: [0.30, 1.07, 0.20],
    dir: [1, 0, 0.3],
    role: "hinge",
    group: "handlebars",
  });

  const leverR = b.joint("leverR", {
    parent: handlebars,
    at: [-0.30, 1.07, 0.20],
    dir: [-1, 0, 0.3],
    role: "hinge",
    group: "handlebars",
  });

  // Throttle twist grip hinge on right handlebar
  const throttle = b.joint("throttle", {
    parent: handlebars,
    at: [-0.35, 1.07, 0.19],
    dir: [-0.96, -0.08, -0.26],
    role: "hinge",
    group: "handlebars",
  });

  // Foot controls: Left gear shifter & Right rear brake pedal
  const shifterPedal = b.joint("shifterPedal", {
    parent: chassis,
    at: [0.21, 0.30, 0.35],
    dir: [0, 0.15, 1],
    role: "hinge",
    group: "controls",
  });

  const brakePedal = b.joint("brakePedal", {
    parent: chassis,
    at: [-0.21, 0.30, 0.35],
    dir: [0, 0.15, 1],
    role: "hinge",
    group: "controls",
  });

  // Kickstand hinge (deployed so its foot pad rests right on y = 0)
  const kickstand = b.joint("kickstand", {
    parent: chassis,
    at: [0.14, 0.22, -0.08],
    dir: [0.55, -0.82, -0.12],
    role: "hinge",
    group: "controls",
  });

  // Storage saddlebag lid hinges
  const bagLidL = b.joint("bagLidL", {
    parent: swingarm,
    at: [0.23, 0.56, -0.68],
    dir: [0, 0, 1],
    role: "hinge",
    group: "saddlebags",
  });

  const bagLidR = b.joint("bagLidR", {
    parent: swingarm,
    at: [-0.23, 0.56, -0.68],
    dir: [0, 0, 1],
    role: "hinge",
    group: "saddlebags",
  });

  // ==========================================================================
  // 2. WHEELS, TIRES, RIMS, SPOKES & BRAKE DISCS (Front & Fat Rear)
  // ==========================================================================

  // Helper to build a closed circular ring path in the YZ plane at X = x0
  const wheelCirclePoints = (x0: number, cy: number, cz: number, r: number, count = 24) => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      pts.push([x0, cy + Math.cos(a) * r, cz + Math.sin(a) * r]);
    }
    return catmull(pts, { closed: true });
  };

  // --- REAR FAT CHOPPER WHEEL ---
  const rearTirePath = wheelCirclePoints(0, REAR_R, REAR_Z, REAR_R - REAR_TUBE_R, 28);
  b.sweep(rearTirePath, (t) => {
    void t;
    return [REAR_TUBE_R * 1.18, REAR_TUBE_R];
  }, {
    bone: wheelRear,
    color: TIRE_PAINT,
    sides: 14,
    group: "wheelRear",
    name: "rearTire",
  });

  // Rear Outer Dish Rim & Anodized Orange Rim Lip
  const rearRimPath = wheelCirclePoints(0, REAR_R, REAR_Z, REAR_R - REAR_TUBE_R * 1.88, 24);
  b.sweep(rearRimPath, [0.088, 0.024], {
    bone: wheelRear,
    color: OBSIDIAN,
    sides: 10,
    group: "wheelRear",
    name: "rearRim",
  });

  for (const s of [1, -1]) {
    const lipPath = wheelCirclePoints(s * 0.082, REAR_R, REAR_Z, REAR_R - REAR_TUBE_R * 1.72, 24);
    glow(
      b.sweep(lipPath, 0.0075, {
        bone: wheelRear,
        color: BLAZE_ORANGE,
        sides: 6,
        group: "wheelRear",
        name: s > 0 ? "rearRimLipL" : "rearRimLipR",
      }),
      0.65,
    );
  }

  // Rear Hub & Turbine Dual-Split Spokes (merged per colour on wheelRear)
  b.rod([0.11, REAR_R, REAR_Z], [-0.11, REAR_R, REAR_Z], 0.058, GUNMETAL, {
    bone: wheelRear,
    sides: 12,
    group: "wheelRear",
    name: "rearHub",
  });
  b.rod([0.135, REAR_R, REAR_Z], [-0.135, REAR_R, REAR_Z], 0.026, CHROME, {
    bone: wheelRear,
    sides: 10,
    group: "wheelRear",
    name: "rearAxleShaft",
  });

  const rearSpokeGeos: THREE.BufferGeometry[] = [];
  const rearRivetGeos: THREE.BufferGeometry[] = [];
  const rearRimInnerR = REAR_R - REAR_TUBE_R * 1.85;
  for (let i = 0; i < 10; i++) {
    const a0 = (i / 10) * Math.PI * 2;
    const a1 = a0 + 0.16; // directional turbine slant
    for (const s of [1, -1]) {
      const p0 = new THREE.Vector3(s * 0.056, REAR_R + Math.cos(a0) * 0.048, REAR_Z + Math.sin(a0) * 0.048);
      const p1 = new THREE.Vector3(
        s * 0.048,
        REAR_R + Math.cos(a1) * rearRimInnerR,
        REAR_Z + Math.sin(a1) * rearRimInnerR,
      );
      const len = p0.distanceTo(p1);
      const midPt = p0.clone().lerp(p1, 0.5);
      const dir = p1.clone().sub(p0).normalize();
      const g = new THREE.BoxGeometry(0.014, len, 0.026);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      g.applyQuaternion(q);
      g.translate(midPt.x, midPt.y, midPt.z);
      rearSpokeGeos.push(g);

      // Rim perimeter bolt
      const rg = new THREE.CylinderGeometry(0.006, 0.006, 0.016, 6);
      rg.rotateZ(Math.PI / 2);
      rg.translate(s * 0.078, p1.y, p1.z);
      rearRivetGeos.push(rg);
    }
  }
  b.part(mergeGeometries(rearSpokeGeos)!, TITANIUM, {
    bone: wheelRear,
    at: [0, 0, 0],
    group: "wheelRear",
    name: "rearTurbineSpokes",
  });
  b.part(mergeGeometries(rearRivetGeos)!, GOLD_BRASS, {
    bone: wheelRear,
    at: [0, 0, 0],
    group: "wheelRear",
    name: "rearRimBolts",
  });

  // Rear Drive Belt Pulley (Left side, +X) & Rear Brake Rotor (Right side, -X)
  b.part(new THREE.CylinderGeometry(0.125, 0.125, 0.018, 20), GUNMETAL, {
    bone: wheelRear,
    at: [0.105, REAR_R, REAR_Z],
    dir: [1, 0, 0],
    group: "wheelRear",
    name: "rearDrivePulley",
  });
  b.part(new THREE.CylinderGeometry(0.132, 0.132, 0.012, 20), GOLD_BRASS, {
    bone: wheelRear,
    at: [0.105, REAR_R, REAR_Z],
    dir: [1, 0, 0],
    group: "wheelRear",
    name: "rearPulleyTeeth",
  });
  b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.008, 18), CHROME, {
    bone: wheelRear,
    at: [-0.105, REAR_R, REAR_Z],
    dir: [1, 0, 0],
    group: "wheelRear",
    name: "rearBrakeRotor",
  });

  // --- FRONT RAKED 21-INCH CHOPPER WHEEL ---
  const frontTirePath = wheelCirclePoints(0, FRONT_R, FRONT_Z, FRONT_R - FRONT_TUBE_R, 28);
  b.sweep(frontTirePath, (t) => {
    void t;
    return [FRONT_TUBE_R * 1.05, FRONT_TUBE_R];
  }, {
    bone: wheelFront,
    color: TIRE_PAINT,
    sides: 12,
    group: "wheelFront",
    name: "frontTire",
  });

  const frontRimPath = wheelCirclePoints(0, FRONT_R, FRONT_Z, FRONT_R - FRONT_TUBE_R * 1.85, 24);
  b.sweep(frontRimPath, [0.044, 0.020], {
    bone: wheelFront,
    color: OBSIDIAN,
    sides: 10,
    group: "wheelFront",
    name: "frontRim",
  });

  for (const s of [1, -1]) {
    const lipPath = wheelCirclePoints(s * 0.042, FRONT_R, FRONT_Z, FRONT_R - FRONT_TUBE_R * 1.70, 24);
    glow(
      b.sweep(lipPath, 0.006, {
        bone: wheelFront,
        color: BLAZE_ORANGE,
        sides: 6,
        group: "wheelFront",
        name: s > 0 ? "frontRimLipL" : "frontRimLipR",
      }),
      0.65,
    );
  }

  // Front Hub, Dual Brake Rotors & Star-Blade Spokes
  b.rod([0.075, FRONT_R, FRONT_Z], [-0.075, FRONT_R, FRONT_Z], 0.042, GUNMETAL, {
    bone: wheelFront,
    sides: 12,
    group: "wheelFront",
    name: "frontHub",
  });
  b.rod([0.115, FRONT_R, FRONT_Z], [-0.115, FRONT_R, FRONT_Z], 0.020, CHROME, {
    bone: wheelFront,
    sides: 10,
    group: "wheelFront",
    name: "frontAxleShaft",
  });

  const frontSpokeGeos: THREE.BufferGeometry[] = [];
  const frontRotorCarrierGeos: THREE.BufferGeometry[] = [];
  const frontRimInnerR = FRONT_R - FRONT_TUBE_R * 1.82;
  for (let i = 0; i < 12; i++) {
    const a0 = (i / 12) * Math.PI * 2;
    const a1 = a0 + (i % 2 === 0 ? 0.22 : -0.22);
    for (const s of [1, -1]) {
      const p0 = new THREE.Vector3(s * 0.032, FRONT_R + Math.cos(a0) * 0.038, FRONT_Z + Math.sin(a0) * 0.038);
      const p1 = new THREE.Vector3(
        s * 0.024,
        FRONT_R + Math.cos(a1) * frontRimInnerR,
        FRONT_Z + Math.sin(a1) * frontRimInnerR,
      );
      const len = p0.distanceTo(p1);
      const midPt = p0.clone().lerp(p1, 0.5);
      const dir = p1.clone().sub(p0).normalize();
      const g = new THREE.CylinderGeometry(0.0055, 0.007, len, 6);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      g.applyQuaternion(q);
      g.translate(midPt.x, midPt.y, midPt.z);
      frontSpokeGeos.push(g);
    }
  }
  b.part(mergeGeometries(frontSpokeGeos)!, CHROME, {
    bone: wheelFront,
    at: [0, 0, 0],
    group: "wheelFront",
    name: "frontSpokes",
  });

  // Dual Wave Brake Rotors on Front Wheel
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.142, 0.142, 0.007, 20), CHROME, {
      bone: wheelFront,
      at: [s * 0.058, FRONT_R, FRONT_Z],
      dir: [1, 0, 0],
      group: "wheelFront",
      name: s > 0 ? "frontBrakeDiscL" : "frontBrakeDiscR",
    });
    const cg = new THREE.CylinderGeometry(0.088, 0.088, 0.011, 12);
    cg.rotateZ(Math.PI / 2);
    cg.translate(s * 0.058, FRONT_R, FRONT_Z);
    frontRotorCarrierGeos.push(cg);
  }
  b.part(mergeGeometries(frontRotorCarrierGeos)!, GOLD_BRASS, {
    bone: wheelFront,
    at: [0, 0, 0],
    group: "wheelFront",
    name: "frontRotorCarriers",
  });

  // ==========================================================================
  // 3. TUBULAR CHOPPER FRAME, CRADLE & SWINGARM
  // ==========================================================================

  // Heavy Cast Steering Headstock / Neck Gusset
  b.rod([0, 0.81, 0.33], [0, 0.96, 0.43], 0.046, OBSIDIAN, {
    bone: chassis,
    sides: 10,
    group: "chassis",
    name: "headstockTube",
  });

  // Sculpted Gusset Plate behind Steering Neck
  b.extrude(
    [
      [0, 0.72],
      [0.24, 0.88],
      [0.28, 0.94],
      [-0.08, 0.80],
    ],
    {
      bone: chassis,
      at: [0, 0, 0.12],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.068,
      bevel: 0.012,
      color: GUNMETAL,
      group: "chassis",
      name: "neckGussetPlate",
    },
  );

  // Spine Backbone Tube (sweeps from Steering Neck down under the saddle to the seat post)
  const backbonePath = catmull([
    [0, 0.91, 0.37],
    [0, 0.78, 0.10],
    [0, 0.56, -0.20],
    [0, 0.35, -0.32],
  ]);
  b.sweep(backbonePath, [0.036, 0.032, 0.034], {
    bone: chassis,
    color: OBSIDIAN,
    sides: 10,
    group: "chassis",
    name: "frameBackbone",
  });

  // Left & Right Twin Down-Tubes + Lower Engine Cradle Rails + Seat Stays
  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    const cradlePath = catmull([
      [s * 0.035, 0.84, 0.35],
      [s * 0.115, 0.56, 0.39],
      [s * 0.145, 0.22, 0.32],
      [s * 0.145, 0.19, -0.05],
      [s * 0.140, 0.21, -0.30],
      [s * 0.135, 0.36, -0.32],
      [s * 0.095, 0.56, -0.21],
    ]);
    b.sweep(cradlePath, 0.024, {
      bone: chassis,
      color: OBSIDIAN,
      sides: 8,
      group: "chassis",
      name: `frameCradle${sideTag}`,
    });

    // Mid-Frame Aero Shroud / Structural Side Fin (Overwatch crisp angular armor plate)
    b.extrude(
      [
        [-0.36, 0.34],
        [-0.12, 0.42],
        [-0.16, 0.58],
        [-0.42, 0.50],
      ],
      {
        bone: chassis,
        at: [s * 0.125, 0, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.026,
        bevel: 0.006,
        color: PEARL_WHITE,
        group: "chassis",
        name: `sideCoverPlate${sideTag}`,
      },
    );

    // Glowing Cyan Energy Cell Slot embedded in Side Cover
    glow(
      b.rod([s * 0.142, 0.44, -0.34], [s * 0.142, 0.50, -0.18], 0.009, PLASMA_CYAN, {
        bone: chassis,
        sides: 6,
        group: "chassis",
        name: `sideCoverGlow${sideTag}`,
      }),
      1.4,
    );
  }

  // Cross-braces & Chin Spoiler Fairing at the front bottom of the frame
  b.rod([0.145, 0.22, 0.32], [-0.145, 0.22, 0.32], 0.022, GUNMETAL, {
    bone: chassis,
    sides: 8,
    group: "chassis",
    name: "frontCrossmember",
  });
  b.rod([0.140, 0.35, -0.30], [-0.140, 0.35, -0.30], 0.026, TITANIUM, {
    bone: chassis,
    sides: 8,
    group: "chassis",
    name: "swingarmPivotShaft",
  });

  // Aggressive Lower Chin Spoiler / Belly Pan with Orange Accent Louvers
  b.loft(
    [
      { at: [0, 0.21, 0.14], w: 0.31, h: 0.08 },
      { at: [0, 0.20, 0.33], w: 0.28, h: 0.11 },
      { at: [0, 0.23, 0.46], w: 0.15, h: 0.06 },
    ],
    {
      bone: chassis,
      section: "box",
      color: FENDER_PAINT,
      group: "chassis",
      name: "chinSpoiler",
    },
  );
  // Chin spoiler oil-cooler intake grille
  b.part(new THREE.BoxGeometry(0.16, 0.065, 0.03), OBSIDIAN, {
    bone: chassis,
    at: [0, 0.22, 0.43],
    rotation: [18, 0, 0],
    group: "chassis",
    name: "chinIntakeGrille",
  });
  glow(
    b.rod([0.055, 0.22, 0.45], [-0.055, 0.22, 0.45], 0.006, PLASMA_CYAN, {
      bone: chassis,
      sides: 6,
      group: "chassis",
      name: "chinIntakeGlow",
    }),
    1.2,
  );

  // --- REAR SWINGARM, COIL-OVER SHOCKS & DRIVE BELT ---
  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    // triangulated heavy-duty chopper swingarm beams
    const upperArm = polyline([
      [s * 0.135, 0.38, -0.30],
      [s * 0.155, 0.43, -0.56],
      [s * 0.142, REAR_R, REAR_Z],
    ]);
    const lowerArm = polyline([
      [s * 0.135, 0.26, -0.30],
      [s * 0.155, 0.25, -0.58],
      [s * 0.142, REAR_R, REAR_Z],
    ]);
    b.sweep(upperArm, 0.021, {
      bone: swingarm,
      color: GUNMETAL,
      sides: 8,
      group: "swingarm",
      name: `swingarmUpper${sideTag}`,
    });
    b.sweep(lowerArm, 0.023, {
      bone: swingarm,
      color: GUNMETAL,
      sides: 8,
      group: "swingarm",
      name: `swingarmLower${sideTag}`,
    });

    // Billet Axle Adjuster Block at rear tip of swingarm
    b.part(new THREE.BoxGeometry(0.036, 0.068, 0.095), TITANIUM, {
      bone: swingarm,
      at: [s * 0.142, REAR_R, REAR_Z],
      group: "swingarm",
      name: `axleBlock${sideTag}`,
    });

    // Angled Piggyback Coil-Over Rear Suspension Shocks
    const shockTop: [number, number, number] = [s * 0.125, 0.54, -0.25];
    const shockBot: [number, number, number] = [s * 0.155, 0.39, -0.55];
    b.rod(shockTop, shockBot, 0.015, CHROME, {
      bone: swingarm,
      sides: 8,
      group: "swingarm",
      name: `rearShockDamper${sideTag}`,
    });
    // Heavy Orange Coil Spring rings around the shock
    for (let k = 0; k < 6; k++) {
      const u = 0.2 + (k / 5) * 0.6;
      const pt = lerp(shockTop, shockBot, u);
      b.part(new THREE.TorusGeometry(0.022, 0.0055, 6, 12), BLAZE_ORANGE, {
        bone: swingarm,
        at: pt,
        aim: shockBot,
        axis: "z",
        group: "swingarm",
        name: `rearShockCoil${sideTag}_${k}`,
      });
    }
    // Gold anodized piggyback nitrogen reservoir
    b.capsule(
      [s * 0.155, 0.56, -0.23],
      [s * 0.155, 0.49, -0.31],
      0.014,
      GOLD_BRASS,
      {
        bone: swingarm,
        sides: 8,
        group: "swingarm",
        name: `shockReservoir${sideTag}`,
      },
    );
  }

  // Rear Brake Caliper (Right side, -X)
  b.part(new THREE.BoxGeometry(0.042, 0.065, 0.085), BLAZE_ORANGE, {
    bone: swingarm,
    at: [-0.105, REAR_R + 0.095, REAR_Z + 0.04],
    rotation: [-25, 0, 0],
    group: "swingarm",
    name: "rearBrakeCaliper",
  });

  // Kevlar Drive Belt & Belt Guard (Left side, +X)
  b.extrude(
    [
      [-0.22, 0.30],
      [-0.84, 0.455],
      [-0.84, 0.435],
      [-0.22, 0.28],
    ],
    {
      bone: swingarm,
      at: [0.105, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.022,
      color: OBSIDIAN,
      group: "swingarm",
      name: "driveBeltUpper",
    },
  );
  b.extrude(
    [
      [-0.22, 0.23],
      [-0.84, 0.225],
      [-0.84, 0.245],
      [-0.22, 0.25],
    ],
    {
      bone: swingarm,
      at: [0.105, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.022,
      color: OBSIDIAN,
      group: "swingarm",
      name: "driveBeltLower",
    },
  );
  // Chrome & Orange Upper Belt Guard
  b.extrude(
    [
      [-0.28, 0.33],
      [-0.80, 0.48],
      [-0.82, 0.45],
      [-0.28, 0.30],
    ],
    {
      bone: swingarm,
      at: [0.118, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.016,
      bevel: 0.004,
      color: CHROME,
      group: "swingarm",
      name: "beltGuard",
    },
  );

  // ==========================================================================
  // 4. OVERWATCH FUSION V-TWIN ENGINE, SUPERCHARGER & QUAD EXHAUST PIPES
  // ==========================================================================

  // Crankcase Block & Primary Transmission Cover
  b.frustumBox(
    [0, 0.33, -0.16],
    [0, 0.35, 0.18],
    [0.24, 0.21],
    [0.22, 0.23],
    {
      bone: chassis,
      color: GUNMETAL,
      group: "engine",
      name: "crankcaseBlock",
    },
  );

  // Left Primary Chain/Belt Housing (Chunky sculpted stadium cover on +X side)
  const primaryCoverPath = polyline([
    [0.14, 0.29, 0.06],
    [0.14, 0.27, -0.22],
  ]);
  b.sweep(primaryCoverPath, [0.105, 0.082], {
    bone: chassis,
    color: OBSIDIAN,
    sides: 14,
    caps: "round",
    group: "engine",
    name: "primaryDriveHousing",
  });
  // Clutch Derby Cover with glowing Plasma Cyan Core Window
  b.part(new THREE.CylinderGeometry(0.068, 0.074, 0.024, 14), CHROME, {
    bone: chassis,
    at: [0.22, 0.27, -0.22],
    dir: [1, 0, 0],
    group: "engine",
    name: "clutchDerbyCover",
  });
  glow(
    b.part(new THREE.CylinderGeometry(0.044, 0.044, 0.028, 12), PLASMA_CYAN, {
      bone: chassis,
      at: [0.222, 0.27, -0.22],
      dir: [1, 0, 0],
      group: "engine",
      name: "clutchPlasmaCore",
    }),
    1.6,
  );

  // Right Side Cam Gear Cover & Glowing Fusion Core Window (-X side)
  b.part(new THREE.CylinderGeometry(0.088, 0.095, 0.045, 14), TITANIUM, {
    bone: chassis,
    at: [-0.13, 0.32, 0.04],
    dir: [-1, 0, 0],
    group: "engine",
    name: "camGearCover",
  });
  glow(
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.052, 12), BLAZE_ORANGE, {
      bone: chassis,
      at: [-0.135, 0.32, 0.04],
      dir: [-1, 0, 0],
      group: "engine",
      name: "camReactorCore",
    }),
    1.5,
  );

  // Twin V-Twin Cylinders (45° V-angle: Front Cylinder +30°, Rear Cylinder -25°)
  const cylSpecs = [
    {
      name: "Front",
      base: [0, 0.40, 0.06] as [number, number, number],
      top: [0, 0.65, 0.21] as [number, number, number],
      headTop: [0, 0.72, 0.25] as [number, number, number],
    },
    {
      name: "Rear",
      base: [0, 0.40, -0.02] as [number, number, number],
      top: [0, 0.65, -0.15] as [number, number, number],
      headTop: [0, 0.72, -0.19] as [number, number, number],
    },
  ];

  const coolingFinGeos: THREE.BufferGeometry[] = [];
  const pushrodGeos: THREE.BufferGeometry[] = [];

  for (const cyl of cylSpecs) {
    // Cylinder Barrel
    b.rod(cyl.base, cyl.top, 0.078, OBSIDIAN, {
      bone: chassis,
      sides: 12,
      group: "engine",
      name: `cylinderBarrel${cyl.name}`,
    });

    //Glowing Plasma Ring between fins (Overwatch sci-fi power accent)
    const midCyl = lerp(cyl.base, cyl.top, 0.55);
    glow(
      b.rod(
        lerp(cyl.base, cyl.top, 0.42),
        lerp(cyl.base, cyl.top, 0.68),
        0.084,
        PLASMA_CYAN,
        {
          bone: chassis,
          sides: 12,
          group: "engine",
          name: `cylinderPlasmaCore${cyl.name}`,
        },
      ),
      1.5,
    );
    void midCyl;

    // Stacked Machined Cooling Fins (7 fins per cylinder, merged for clean part count)
    const dirVec = new THREE.Vector3(...cyl.top).sub(new THREE.Vector3(...cyl.base)).normalize();
    const finQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirVec);
    for (let f = 0; f < 7; f++) {
      const u = 0.12 + (f / 6) * 0.78;
      const fp = lerp(cyl.base, cyl.top, u);
      const rFin = 0.095 + (f / 6) * 0.016;
      const fg = new THREE.CylinderGeometry(rFin, rFin, 0.010, 12);
      fg.scale(1.12, 1, 0.95);
      fg.applyQuaternion(finQuat);
      fg.translate(fp.x, fp.y, fp.z);
      coolingFinGeos.push(fg);
    }

    // Anodized Blaze-Orange Valve Rocker Cover on top of each cylinder head
    b.frustumBox(
      cyl.top,
      cyl.headTop,
      [0.19, 0.17],
      [0.16, 0.14],
      {
        bone: chassis,
        color: BLAZE_ORANGE,
        group: "engine",
        name: `rockerCover${cyl.name}`,
      },
    );
    // Polished Chrome Rocker Cap Crown
    b.rod(
      cyl.headTop,
      offset(cyl.headTop, dirVec, 0.022),
      [0.072, 0.058],
      CHROME,
      {
        bone: chassis,
        section: "box",
        group: "engine",
        name: `rockerCrown${cyl.name}`,
      },
    );

    // Chrome Pushrod Tubes on Right (-X) & Left (+X)
    for (const side of [-0.098, -0.072]) {
      const pStart = new THREE.Vector3(side, cyl.base[1] - 0.02, cyl.base[2]);
      const pEnd = new THREE.Vector3(side, cyl.top[1] + 0.01, cyl.top[2]);
      const pLen = pStart.distanceTo(pEnd);
      const pMid = pStart.clone().lerp(pEnd, 0.5);
      const pQ = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        pEnd.clone().sub(pStart).normalize(),
      );
      const pg = new THREE.CylinderGeometry(0.009, 0.009, pLen, 8);
      pg.applyQuaternion(pQ);
      pg.translate(pMid.x, pMid.y, pMid.z);
      pushrodGeos.push(pg);
    }
  }

  b.part(mergeGeometries(coolingFinGeos)!, TITANIUM, {
    bone: chassis,
    at: [0, 0, 0],
    group: "engine",
    name: "cylinderCoolingFins",
  });
  b.part(mergeGeometries(pushrodGeos)!, CHROME, {
    bone: chassis,
    at: [0, 0, 0],
    group: "engine",
    name: "enginePushrods",
  });

  // Heavy-Breath Cone Air Cleaner / Supercharger Intake on Right Side (-X)
  const intakeElbow = catmull([
    [-0.06, 0.56, 0.03],
    [-0.17, 0.56, 0.04],
    [-0.21, 0.56, 0.14],
  ]);
  b.sweep(intakeElbow, [0.042, 0.048, 0.058], {
    bone: chassis,
    color: CHROME,
    sides: 10,
    caps: "flat",
    group: "engine",
    name: "superchargerElbow",
  });
  // Pleated Orange & Glowing Cyan Conical Filter Element
  b.rod([-0.21, 0.56, 0.14], [-0.21, 0.56, 0.25], [0.062, 0.044], BLAZE_ORANGE, {
    bone: chassis,
    sides: 12,
    group: "engine",
    name: "airFilterCone",
  });
  glow(
    b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.015, 10), PLASMA_CYAN, {
      bone: chassis,
      at: [-0.21, 0.56, 0.255],
      dir: [0, 0, 1],
      group: "engine",
      name: "airIntakeTurbineGlow",
    }),
    1.5,
  );

  // --- QUAD UPSWEPT CHOPPER EXHAUST PIPES (2 on Right -X, 2 on Left +X for bold symmetry) ---
  for (const s of [-1, 1]) {
    const sideTag = s < 0 ? "R" : "L";
    // Upper Exhaust Pipe (from Front Cylinder sweeping low then kicking up at rear)
    const pipe1Path = catmull([
      [s * 0.085, 0.59, 0.20],
      [s * 0.195, 0.44, 0.26],
      [s * 0.205, 0.24, 0.05],
      [s * 0.205, 0.23, -0.35],
      [s * 0.215, 0.36, -0.68],
      [s * 0.220, 0.52, -0.96],
    ]);
    b.sweep(pipe1Path, [0.025, 0.027, 0.038], {
      bone: chassis,
      color: EXHAUST_PAINT,
      sides: 10,
      caps: "flat",
      group: "exhaust",
      name: `exhaustPipeUpper${sideTag}`,
    });

    // Lower Exhaust Pipe (from Rear Cylinder running parallel below Upper Pipe)
    const pipe2Path = catmull([
      [s * 0.085, 0.57, -0.14],
      [s * 0.195, 0.36, -0.20],
      [s * 0.198, 0.17, -0.38],
      [s * 0.210, 0.28, -0.70],
      [s * 0.218, 0.42, -0.98],
    ]);
    b.sweep(pipe2Path, [0.025, 0.027, 0.038], {
      bone: chassis,
      color: EXHAUST_PAINT,
      sides: 10,
      caps: "flat",
      group: "exhaust",
      name: `exhaustPipeLower${sideTag}`,
    });

    // Perforated Heat Shields along the mid-section of both pipes
    b.rod([s * 0.212, 0.24, 0.02], [s * 0.212, 0.23, -0.34], 0.030, OBSIDIAN, {
      bone: chassis,
      sides: 8,
      group: "exhaust",
      name: `heatShield${sideTag}`,
    });

    // Glowing Afterburner / Plasma Flame Tips inside the 4 upswept exhaust mouths
    const tipDir = [-0.02 * s, 0.52, -0.85];
    glow(
      b.part(new THREE.CylinderGeometry(0.030, 0.022, 0.035, 10), BLAZE_ORANGE, {
        bone: chassis,
        at: [s * 0.220, 0.52, -0.96],
        dir: tipDir,
        group: "exhaust",
        name: `exhaustGlowUpper${sideTag}`,
      }),
      1.8,
    );
    glow(
      b.part(new THREE.CylinderGeometry(0.030, 0.022, 0.035, 10), BLAZE_ORANGE, {
        bone: chassis,
        at: [s * 0.218, 0.42, -0.98],
        dir: tipDir,
        group: "exhaust",
        name: `exhaustGlowLower${sideTag}`,
      }),
      1.8,
    );
  }

  // ==========================================================================
  // 5. SCULPTED AERODYNAMIC TEARDROP FUEL TANK, GAUGE CONSOLE & DECALS
  // ==========================================================================

  const tankLoft = b.loft(
    [
      { at: [0, 0.90, 0.36], w: 0.14, h: 0.11 },
      { at: [0, 0.88, 0.24], w: 0.36, h: 0.21 },
      { at: [0, 0.82, 0.08], w: 0.39, h: 0.22 },
      { at: [0, 0.72, -0.08], w: 0.27, h: 0.15 },
      { at: [0, 0.62, -0.22], w: 0.15, h: 0.08 },
    ],
    {
      bone: chassis,
      color: TANK_PAINT,
      sides: 16,
      group: "bodywork",
      name: "fuelTank",
    },
  );

  // Center Tank Console Spine (Gunmetal + Chrome Dash Spine)
  b.loft(
    [
      { at: [0, 0.95, 0.33], w: 0.075, h: 0.045 },
      { at: [0, 0.95, 0.16], w: 0.088, h: 0.052 },
      { at: [0, 0.85, -0.05], w: 0.068, h: 0.038 },
      { at: [0, 0.68, -0.20], w: 0.045, h: 0.025 },
    ],
    {
      bone: chassis,
      section: "box",
      color: OBSIDIAN,
      group: "bodywork",
      name: "tankDashConsole",
    },
  );

  // Pop-Up Billet Fuel Cap & Glowing Status Ring on the Tank Console
  b.part(new THREE.CylinderGeometry(0.034, 0.038, 0.022, 12), CHROME, {
    bone: chassis,
    at: [0, 0.975, 0.24],
    dir: [0, 0.95, 0.3],
    group: "bodywork",
    name: "fuelCap",
  });
  glow(
    b.part(new THREE.TorusGeometry(0.037, 0.004, 6, 14), PLASMA_CYAN, {
      bone: chassis,
      at: [0, 0.97, 0.24],
      dir: [0, 0.95, 0.3],
      axis: "z",
      group: "bodywork",
      name: "fuelCapGlowRing",
    }),
    1.5,
  );

  // Integrated Tank Digital Speedometer Gauge with SVG Texture
  b.part(new THREE.CylinderGeometry(0.044, 0.048, 0.026, 14), GUNMETAL, {
    bone: chassis,
    at: [0, 0.94, 0.11],
    dir: [0, 0.85, -0.52],
    group: "bodywork",
    name: "tankSpeedoBezel",
  });
  glow(
    b.part(new THREE.CircleGeometry(0.040, 14), "#ffffff", {
      bone: chassis,
      at: [0, 0.952, 0.102],
      dir: [0, 0.85, -0.52],
      axis: "z",
      texture: SPEEDO_GAUGE_SVG,
      group: "bodywork",
      name: "tankSpeedoFace",
    }),
    1.3,
  );

  // Conformed Tank Side Emblem Decals (Left & Right Flanks)
  const tankSurface = b.surface(tankLoft);
  for (const s of [1, -1]) {
    b.decal(tankSurface, TANK_EMBLEM_SVG, {
      bone: chassis,
      at: [s * 0.19, 0.83, 0.15],
      dir: [s, 0.18, 0.08],
      size: [0.24, 0.12],
      mirror: s < 0,
      group: "bodywork",
      name: s > 0 ? "tankDecalL" : "tankDecalR",
    });
  }

  // ==========================================================================
  // 6. LOW-SLUNG QUILTED CHOPPER SADDLE, PASSENGER PAD & TALL SISSY BAR
  // ==========================================================================

  // Deeply Bucketed Solo Rider Saddle + Stepped Passenger Pillion Pad
  b.loft(
    [
      { at: [0, 0.63, -0.17], w: 0.16, h: 0.065 },
      { at: [0, 0.57, -0.32], w: 0.33, h: 0.095 },
      { at: [0, 0.59, -0.47], w: 0.35, h: 0.115 },
      { at: [0, 0.69, -0.60], w: 0.25, h: 0.110 },
      { at: [0, 0.72, -0.74], w: 0.20, h: 0.080 },
    ],
    {
      bone: chassis,
      color: SADDLE_PAINT,
      sides: 12,
      group: "saddle",
      name: "chopperSaddle",
    },
  );

  // Decorative Chrome Saddle Conchos / Studs along Seat Skirt
  const saddleStudGeos: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const zPos = -0.26 - i * 0.075;
    const yPos = i < 3 ? 0.56 : 0.66;
    const xPos = i < 3 ? 0.165 : 0.125;
    for (const s of [1, -1]) {
      const sg = new THREE.SphereGeometry(0.010, 6, 6);
      sg.translate(s * xPos, yPos, zPos);
      saddleStudGeos.push(sg);
    }
  }
  b.part(mergeGeometries(saddleStudGeos)!, CHROME, {
    bone: chassis,
    at: [0, 0, 0],
    group: "saddle",
    name: "saddleChromeStuds",
  });

  // Tall Iconic Chopper Sissy Bar (Twin Chrome Uprights converging into a pointed gothic crest)
  for (const s of [1, -1]) {
    const sissyPath = catmull([
      [s * 0.135, 0.62, -0.66],
      [s * 0.115, 0.78, -0.78],
      [s * 0.065, 0.98, -0.88],
      [0, 1.13, -0.95],
    ]);
    b.sweep(sissyPath, [0.016, 0.014, 0.011], {
      bone: chassis,
      color: CHROME,
      sides: 8,
      group: "saddle",
      name: s > 0 ? "sissyBarL" : "sissyBarR",
    });
  }
  // Sissy Bar Pointed Finial Spike
  b.spike([0, 1.11, -0.94], [0, 1.21, -0.99], null, 0.018, CHROME, {
    bone: chassis,
    sides: 8,
    group: "saddle",
    name: "sissyBarSpike",
  });
  // Quilted Backrest Pad mounted between Sissy Bar Uprights
  b.part(new THREE.BoxGeometry(0.18, 0.16, 0.055), LEATHER_DARK, {
    bone: chassis,
    at: [0, 0.87, -0.82],
    rotation: [26, 0, 0],
    group: "saddle",
    name: "sissyBackrestPad",
  });
  b.part(new THREE.BoxGeometry(0.15, 0.04, 0.062), BLAZE_ORANGE, {
    bone: chassis,
    at: [0, 0.87, -0.82],
    rotation: [26, 0, 0],
    group: "saddle",
    name: "sissyBackrestStripe",
  });

  // ==========================================================================
  // 7. WIDE BOBBED REAR FENDER, TAILLIGHTS, LICENSE PLATE & HINGED SADDLEBAGS
  // ==========================================================================

  // Sweeping Rear Fender hugging the fat rear tire
  const rearFenderPath = catmull([
    [0, 0.44, -0.47],
    [0, 0.66, -0.66],
    [0, 0.73, -0.84],
    [0, 0.64, -1.04],
    [0, 0.46, -1.18],
  ]);
  b.sweep(rearFenderPath, (t) => [0.162 - t * 0.015, 0.022], {
    bone: swingarm,
    color: FENDER_PAINT,
    sides: 12,
    group: "bodywork",
    name: "rearFender",
  });

  // Chrome Rear Fender Struts on Left & Right
  for (const s of [1, -1]) {
    const strutPath = catmull([
      [s * 0.155, 0.48, -0.54],
      [s * 0.162, 0.64, -0.74],
      [s * 0.155, 0.59, -0.98],
    ]);
    b.sweep(strutPath, 0.015, {
      bone: swingarm,
      color: CHROME,
      sides: 8,
      group: "bodywork",
      name: s > 0 ? "rearFenderStrutL" : "rearFenderStrutR",
    });
  }

  // Glowing Ruby Red LED Taillight Bar & Amber Bullet Turn Signals
  b.part(new THREE.BoxGeometry(0.22, 0.042, 0.045), OBSIDIAN, {
    bone: swingarm,
    at: [0, 0.54, -1.14],
    rotation: [-32, 0, 0],
    group: "bodywork",
    name: "taillightHousing",
  });
  glow(
    b.part(new THREE.BoxGeometry(0.19, 0.026, 0.032), RUBY_RED, {
      bone: swingarm,
      at: [0, 0.54, -1.158],
      rotation: [-32, 0, 0],
      group: "bodywork",
      name: "taillightLens",
    }),
    2.0,
  );

  for (const s of [1, -1]) {
    b.rod([s * 0.13, 0.54, -1.12], [s * 0.20, 0.54, -1.12], 0.010, CHROME, {
      bone: swingarm,
      sides: 6,
      group: "bodywork",
      name: s > 0 ? "rearSignalStalkL" : "rearSignalStalkR",
    });
    b.capsule([s * 0.20, 0.54, -1.09], [s * 0.20, 0.54, -1.16], [0.012, 0.022], OBSIDIAN, {
      bone: swingarm,
      sides: 8,
      group: "bodywork",
      name: s > 0 ? "rearSignalPodL" : "rearSignalPodR",
    });
    glow(
      b.part(new THREE.SphereGeometry(0.019, 8, 6), AMBER_ORANGE, {
        bone: swingarm,
        at: [s * 0.20, 0.54, -1.165],
        group: "bodywork",
        name: s > 0 ? "rearSignalLensL" : "rearSignalLensR",
      }),
      1.6,
    );
  }

  // Rear Number Plate Holder & Number Plate SVG Texture
  b.part(new THREE.BoxGeometry(0.18, 0.11, 0.014), GUNMETAL, {
    bone: swingarm,
    at: [0, 0.44, -1.20],
    rotation: [22, 0, 0],
    group: "bodywork",
    name: "licensePlateBracket",
  });
  b.part(new THREE.PlaneGeometry(0.165, 0.10), "#ffffff", {
    bone: swingarm,
    at: [0, 0.44, -1.21],
    dir: [0, -0.37, -0.93],
    axis: "z",
    texture: NUMBER_PLATE_SVG,
    group: "bodywork",
    name: "licensePlate",
  });

  // Compact Hard-Shell Outrider Pannier Cases with Hinged Lids (`bagLidL`, `bagLidR`)
  for (const s of [1, -1]) {
    const lidJoint = s > 0 ? bagLidL : bagLidR;
    const sideTag = s > 0 ? "L" : "R";
    // Lower Pannier Box on swingarm
    b.frustumBox(
      [s * 0.22, 0.44, -0.84],
      [s * 0.22, 0.49, -0.58],
      [0.095, 0.15],
      [0.105, 0.17],
      {
        bone: swingarm,
        color: OBSIDIAN,
        group: "saddlebags",
        name: `saddlebagBody${sideTag}`,
      },
    );
    // Hinged Upper Lid on its own `role: "hinge"` joint
    b.frustumBox(
      [s * 0.22, 0.53, -0.85],
      [s * 0.22, 0.58, -0.57],
      [0.105, 0.055],
      [0.115, 0.062],
      {
        bone: lidJoint,
        color: PEARL_WHITE,
        group: "saddlebags",
        name: `saddlebagLid${sideTag}`,
      },
    );
    // Orange Strap & Chrome Latch Buckle on the Lid
    b.part(new THREE.BoxGeometry(0.022, 0.09, 0.035), BLAZE_ORANGE, {
      bone: lidJoint,
      at: [s * 0.275, 0.52, -0.71],
      group: "saddlebags",
      name: `saddlebagLatch${sideTag}`,
    });
  }

  // ==========================================================================
  // 8. LONG RAKED CHOPPER FRONT FORKS, TRIPLE TREES, HEADLIGHT COWL & HANDLEBARS
  // ==========================================================================

  // Upper & Lower Billet Triple Tree Clamps on `steering`
  for (const [tag, frac] of [
    ["Upper", 0.04],
    ["Lower", 0.22],
  ] as const) {
    const cPt = lerp(STEER_NECK, [0, FRONT_R, FRONT_Z], frac);
    b.extrude(
      [
        [-0.17, -0.035],
        [0.17, -0.035],
        [0.14, 0.055],
        [0, 0.075],
        [-0.14, 0.055],
      ],
      {
        bone: steering,
        at: cPt,
        x: [1, 0, 0],
        y: [0, 0.60, 0.80],
        thickness: 0.036,
        bevel: 0.008,
        color: TITANIUM,
        group: "steering",
        name: `tripleTree${tag}`,
      },
    );
  }

  // Left & Right Long Raked Chopper Fork Stanchions (`steering`) & Lower Sliders (`forkSlider`)
  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    const forkTop: [number, number, number] = [s * 0.135, 0.94, 0.34];
    const forkMid: [number, number, number] = [s * 0.118, 0.61, 0.71];
    const forkBot: [number, number, number] = [s * 0.098, FRONT_R - 0.02, FRONT_Z + 0.02];

    // Gold/Chrome Upper Fork Tube (rides `steering`)
    b.rod(forkTop, forkMid, 0.024, CHROME, {
      bone: steering,
      sides: 10,
      group: "steering",
      name: `forkUpperStanchion${sideTag}`,
    });
    // Top Fork Preload Adjuster Cap
    b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.022, 8), BLAZE_ORANGE, {
      bone: steering,
      at: forkTop,
      dir: FORK_DIR,
      group: "steering",
      name: `forkCap${sideTag}`,
    });

    // Ribbed Rubber Dust Gaiter Boot at the slider junction
    b.rod(
      lerp(forkTop, forkBot, 0.44),
      lerp(forkTop, forkBot, 0.56),
      [0.031, 0.034],
      OBSIDIAN,
      {
        bone: forkSlider,
        sides: 10,
        group: "steering",
        name: `forkDustBoot${sideTag}`,
      },
    );

    // Chunky Overwatch Lower Fork Slider Leg (rides `forkSlider` suspension joint)
    b.rod(forkMid, forkBot, [0.036, 0.031], OBSIDIAN, {
      bone: forkSlider,
      sides: 10,
      group: "steering",
      name: `forkLowerSlider${sideTag}`,
    });
    // White & Orange Aerodynamic Fork Leg Guard
    b.frustumBox(
      lerp(forkMid, forkBot, 0.08),
      lerp(forkMid, forkBot, 0.72),
      [0.032, 0.068],
      [0.024, 0.048],
      {
        bone: forkSlider,
        color: PEARL_WHITE,
        group: "steering",
        name: `forkAeroGuard${sideTag}`,
      },
    );

    // Radial Front Brake Calipers mounted at the bottom of the Fork Sliders
    b.part(new THREE.BoxGeometry(0.038, 0.082, 0.056), BLAZE_ORANGE, {
      bone: forkSlider,
      at: [s * 0.078, FRONT_R + 0.06, FRONT_Z - 0.11],
      rotation: [38, 0, 0],
      group: "steering",
      name: `frontBrakeCaliper${sideTag}`,
    });
  }

  // Sleek Raked Front Fender hugging the 21-inch front wheel (rides `forkSlider`)
  const frontFenderPath = catmull([
    [0, FRONT_R + 0.25, FRONT_Z - 0.30],
    [0, FRONT_R + 0.38, FRONT_Z - 0.08],
    [0, FRONT_R + 0.37, FRONT_Z + 0.14],
    [0, FRONT_R + 0.24, FRONT_Z + 0.31],
  ]);
  b.sweep(frontFenderPath, [0.072, 0.016], {
    bone: forkSlider,
    color: FENDER_PAINT,
    sides: 10,
    group: "steering",
    name: "frontFender",
  });

  // Futuristic Overwatch Angular Headlight Nacelle & Glowing Cyber-Lens (on `steering`)
  b.loft(
    [
      { at: [0, 0.84, 0.42], w: 0.22, h: 0.18 },
      { at: [0, 0.82, 0.54], w: 0.25, h: 0.21 },
      { at: [0, 0.80, 0.63], w: 0.17, h: 0.14 },
    ],
    {
      bone: steering,
      section: "box",
      color: PEARL_WHITE,
      group: "steering",
      name: "headlightNacelle",
    },
  );
  // Tinted Smoked Flyscreen Visor Crest above the Headlight
  b.extrude(
    [
      [-0.11, 0],
      [0.11, 0],
      [0.075, 0.16],
      [0, 0.20, "sharp"],
      [-0.075, 0.16],
    ],
    {
      bone: steering,
      at: [0, 0.90, 0.49],
      x: [1, 0, 0],
      y: [0, 0.72, -0.69],
      thickness: 0.016,
      bevel: 0.005,
      color: OBSIDIAN,
      group: "steering",
      name: "headlightFlyscreen",
    },
  );
  // Glowing Headlight Lens with SVG Visor Graphics
  glow(
    b.part(new THREE.CircleGeometry(0.072, 14), "#ffffff", {
      bone: steering,
      at: [0, 0.80, 0.635],
      dir: [0, -0.18, 0.98],
      axis: "z",
      texture: HEADLIGHT_LENS_SVG,
      group: "steering",
      name: "headlightLens",
    }),
    2.2,
  );
  // Twin Amber Front Turn Signal Pods flanking the Headlight
  for (const s of [1, -1]) {
    b.capsule([s * 0.14, 0.81, 0.48], [s * 0.18, 0.81, 0.54], 0.018, OBSIDIAN, {
      bone: steering,
      sides: 8,
      group: "steering",
      name: s > 0 ? "frontSignalPodL" : "frontSignalPodR",
    });
    glow(
      b.part(new THREE.SphereGeometry(0.015, 8, 6), AMBER_ORANGE, {
        bone: steering,
        at: [s * 0.18, 0.81, 0.55],
        group: "steering",
        name: s > 0 ? "frontSignalGlowL" : "frontSignalGlowR",
      }),
      1.6,
    );
  }

  // --- SWEPT MINI-APE / T-BAR CHOPPER HANDLEBARS, RISERS, LEVERS & MIRRORS ---
  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    // Billet Risers from Upper Triple Tree to Handlebar Clamp
    b.rod([s * 0.055, 0.93, 0.38], [s * 0.055, 1.07, 0.25], 0.018, TITANIUM, {
      bone: steering,
      sides: 8,
      group: "handlebars",
      name: `handlebarRiser${sideTag}`,
    });

    // Swept Chopper Handlebar Horn Tube (rides `handlebars` joint)
    const barPath = catmull([
      [0, 1.07, 0.25],
      [s * 0.14, 1.11, 0.26],
      [s * 0.27, 1.08, 0.22],
      [s * 0.42, 1.06, 0.16],
    ]);
    b.sweep(barPath, 0.015, {
      bone: handlebars,
      color: CHROME,
      sides: 8,
      group: "handlebars",
      name: `handlebarTube${sideTag}`,
    });

    // Switchgear Control Housing Cube
    b.part(new THREE.BoxGeometry(0.042, 0.046, 0.044), OBSIDIAN, {
      bone: handlebars,
      at: [s * 0.29, 1.07, 0.21],
      group: "handlebars",
      name: `switchHousing${sideTag}`,
    });

    // Left Grip (`handlebars`) & Right Twist Throttle Grip (`throttle` hinge joint)
    const gripBone = s > 0 ? handlebars : throttle;
    b.rod([s * 0.31, 1.07, 0.20], [s * 0.43, 1.055, 0.155], 0.020, RUBBER_DARK, {
      bone: gripBone,
      sides: 10,
      group: "handlebars",
      name: `handGrip${sideTag}`,
    });
    // Anodized Orange Bar-End Weight Cap
    b.part(new THREE.SphereGeometry(0.021, 8, 6), BLAZE_ORANGE, {
      bone: gripBone,
      at: [s * 0.435, 1.053, 0.153],
      group: "handlebars",
      name: `barEndCap${sideTag}`,
    });

    // Articulated Clutch Lever (`leverL`) & Front Brake Lever (`leverR`)
    const levJoint = s > 0 ? leverL : leverR;
    const levPath = bezier(
      [s * 0.30, 1.07, 0.22],
      [s * 0.35, 1.07, 0.26],
      [s * 0.41, 1.06, 0.22],
    );
    b.sweep(levPath, [0.008, 0.005], {
      bone: levJoint,
      color: TITANIUM,
      sides: 6,
      group: "handlebars",
      name: `handLever${sideTag}`,
    });

    // Blade-Shaped Custom Chopper Rearview Mirrors
    const mirrorStem = polyline([
      [s * 0.31, 1.09, 0.21],
      [s * 0.38, 1.16, 0.22],
      [s * 0.44, 1.17, 0.20],
    ]);
    b.sweep(mirrorStem, 0.006, {
      bone: handlebars,
      color: CHROME,
      sides: 6,
      group: "handlebars",
      name: `mirrorStem${sideTag}`,
    });
    b.extrude(
      [
        [0, -0.025],
        [0.095, -0.018],
        [0.115, 0.015, "sharp"],
        [0.025, 0.032],
      ],
      {
        bone: handlebars,
        at: [s * 0.42, 1.17, 0.20],
        x: [s, 0, -0.2],
        y: [0, 1, 0],
        thickness: 0.014,
        bevel: 0.004,
        color: OBSIDIAN,
        group: "handlebars",
        name: `mirrorHousing${sideTag}`,
      },
    );
    glow(
      b.part(new THREE.PlaneGeometry(0.075, 0.032), PLASMA_CYAN, {
        bone: handlebars,
        at: [s * 0.465, 1.172, 0.188],
        dir: [0, 0.1, -1],
        axis: "z",
        group: "handlebars",
        name: `mirrorGlass${sideTag}`,
      }),
      0.8,
    );

    // Braided Steel Hydraulic Brake & Clutch Cables curving into the Steering Neck
    const cablePath = bezier(
      [s * 0.29, 1.05, 0.22],
      [s * 0.18, 0.96, 0.38],
      [s * 0.08, 0.85, 0.42],
    );
    b.sweep(cablePath, 0.0055, {
      bone: steering,
      color: DARK_STEEL,
      sides: 6,
      group: "handlebars",
      name: `controlCable${sideTag}`,
    });
  }

  // ==========================================================================
  // 9. FORWARD FOOT CONTROLS, SHIFTER, BRAKE PEDAL & DEPLOYED KICKSTAND
  // ==========================================================================

  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    // Forward-Control Footpeg Outrigger Bracket & Knurled Footpeg
    b.rod([s * 0.145, 0.26, 0.33], [s * 0.25, 0.28, 0.35], 0.016, GUNMETAL, {
      bone: chassis,
      sides: 8,
      group: "controls",
      name: `footpegMount${sideTag}`,
    });
    b.rod([s * 0.25, 0.28, 0.35], [s * 0.34, 0.28, 0.35], 0.018, RUBBER_DARK, {
      bone: chassis,
      sides: 8,
      group: "controls",
      name: `footpegGrip${sideTag}`,
    });
    b.part(new THREE.SphereGeometry(0.019, 8, 6), BLAZE_ORANGE, {
      bone: chassis,
      at: [s * 0.345, 0.28, 0.35],
      group: "controls",
      name: `footpegTip${sideTag}`,
    });

    // Articulated Foot Lever (`shifterPedal` on Left, `brakePedal` on Right)
    const pedalJoint = s > 0 ? shifterPedal : brakePedal;
    const armPath = polyline([
      [s * 0.21, 0.30, 0.35],
      [s * 0.24, 0.33, 0.45],
      [s * 0.29, 0.33, 0.45],
    ]);
    b.sweep(armPath, 0.010, {
      bone: pedalJoint,
      color: CHROME,
      sides: 6,
      group: "controls",
      name: `footLever${sideTag}`,
    });
  }

  // Deployed Kickstand (`kickstand` hinge joint) touching the floor at y = 0.008
  const standPath = polyline([
    [0.14, 0.22, -0.08],
    [0.27, 0.012, -0.13],
  ]);
  b.sweep(standPath, [0.014, 0.011], {
    bone: kickstand,
    color: CHROME,
    sides: 8,
    group: "controls",
    name: "kickstandLeg",
  });
  b.part(new THREE.BoxGeometry(0.055, 0.014, 0.068), GUNMETAL, {
    bone: kickstand,
    at: [0.275, 0.007, -0.13],
    group: "controls",
    name: "kickstandFootPad",
  });

  return b.root;
}
