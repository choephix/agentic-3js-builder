import * as THREE from "three";
import {
  createBuilder,
  aim,
  DEG,
  lerp,
  mid,
  offset,
  rng,
  catmull,
  polyline,
  paint,
  noise,
  mix,
  smoothstep,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Deadlock Custom Chopper",
  description:
    "An Overwatch-inspired custom chopper motorbike, featuring an exaggerated raked front fork, high ape-hanger handlebars, a roaring V-twin fusion powerplant, dual slash-cut drag exhausts, and custom Deadlock Rebels graphics, staged on a Route 66 desert highway base.",
};

export default function build() {
  const b = createBuilder({ name: "deadlock_chopper", detail: 1.2 });
  const rand = rng(86);

  // ---------------------------------------------------------------------------
  // Materials & Shaders (Overwatch dead-stock hero palette)
  // ---------------------------------------------------------------------------

  // Candy Crimson Red: deep rich undertones with gold/orange highlight falloff
  const CANDY_RED = paint((p, n) => {
    const up = n.y;
    const spec = Math.pow(Math.max(0, n.dot(new THREE.Vector3(0.3, 0.8, 0.5).normalize())), 6);
    const baseRed: [number, number, number] = [0.72, 0.08, 0.14];
    const highlight: [number, number, number] = [0.98, 0.36, 0.22];
    const shadow: [number, number, number] = [0.32, 0.03, 0.07];
    let c = mix(shadow, baseRed, smoothstep(-0.4, 0.6, up));
    c = mix(c, highlight, spec * 0.65);
    return c;
  });

  // Stylized Overwatch Horizon Chrome: crisp sky-blue above, desert-tan below, glint line
  const CHROME = paint((_p, n) => {
    const ny = n.y;
    const sky: [number, number, number] = [0.88, 0.93, 0.98];
    const earth: [number, number, number] = [0.28, 0.22, 0.18];
    const glint: [number, number, number] = [1.0, 1.0, 1.0];
    const horizon = 1.0 - smoothstep(0.0, 0.09, Math.abs(ny - 0.08));
    let c = ny > 0.08 ? sky : earth;
    c = mix(c, glint, horizon * 0.85);
    return c;
  });

  // Dark Carbon Titanium
  const DARK_CARBON = paint((p, n) => {
    const grain = noise(p, 0.04, 5);
    const base: [number, number, number] = [0.10, 0.11, 0.14];
    const light: [number, number, number] = [0.18, 0.20, 0.24];
    return mix(base, light, grain * 0.3 + smoothstep(-0.2, 0.8, n.y) * 0.2);
  });

  // Quilted Saddle Leather
  const SADDLE_LEATHER = paint((p, n) => {
    const base: [number, number, number] = [0.16, 0.10, 0.07];
    const worn: [number, number, number] = [0.28, 0.17, 0.12];
    const m = noise(p, 0.06, 12);
    return mix(base, worn, m * 0.45 + smoothstep(0.2, 0.85, n.y) * 0.3);
  });

  // Road Asphalt
  const ASPHALT_ROAD = paint((p) => {
    const n1 = noise(p, 0.08, 1);
    const n2 = noise(p, 0.02, 7);
    const darkAsphalt: [number, number, number] = [0.18, 0.19, 0.21];
    const lightGrit: [number, number, number] = [0.30, 0.31, 0.34];
    return mix(darkAsphalt, lightGrit, n1 * 0.4 + n2 * 0.3);
  });

  // Desert Dirt Shoulder
  const DESERT_SHOULDER = paint((p) => {
    const n1 = noise(p, 0.06, 3);
    const sandDark: [number, number, number] = [0.46, 0.30, 0.20];
    const sandLight: [number, number, number] = [0.65, 0.45, 0.28];
    return mix(sandDark, sandLight, n1 * 0.5);
  });

  // Flat accent colours
  const GOLD_BILLET = "#d49b38";
  const ENGINE_GUNMETAL = "#2a2d34";
  const FRAME_BLACK = "#15171b";
  const TIRE_BLACK = "#141517";
  const ROAD_YELLOW = "#f2b705";
  const ROAD_WHITE = "#e8eaed";
  const DESERT_ROCK = "#b05e3b";
  const IGNITION_RED = "#d62828";

  // Glowing flat colors for self-lit components
  const GLOW_CYAN = "#00e5ff";
  const GLOW_WHITE = "#ffffff";
  const GLOW_AMBER = "#ffaa00";
  const GLOW_RED = "#ff1f38";
  const GLOW_BLUE = "#1a8cff";

  // ---------------------------------------------------------------------------
  // Vector Textures (SVG decals & displays)
  // ---------------------------------------------------------------------------

  // Digital Cockpit HUD Speedometer
  const speedoTex = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" rx="36" fill="#0b0e14"/>
      <circle cx="128" cy="128" r="116" fill="none" stroke="#1f2937" stroke-width="8"/>
      <path d="M 45 185 A 100 100 0 1 1 211 185" fill="none" stroke="#00e5ff" stroke-width="12" stroke-linecap="round" stroke-dasharray="380" stroke-dashoffset="60"/>
      <path d="M 180 65 A 100 100 0 0 1 211 185" fill="none" stroke="#ff3366" stroke-width="12" stroke-linecap="round"/>
      <circle cx="128" cy="128" r="88" fill="none" stroke="#00e5ff" stroke-width="3" stroke-dasharray="4 16"/>
      <text x="128" y="132" text-anchor="middle" font-family="monospace, sans-serif" font-weight="900" font-size="64" fill="#ffffff" letter-spacing="-2">168</text>
      <text x="128" y="160" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="16" fill="#00e5ff" letter-spacing="4">MPH</text>
      <rect x="108" y="176" width="40" height="26" rx="6" fill="#00e5ff"/>
      <text x="128" y="195" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="20" fill="#0b0e14">6</text>
      <text x="128" y="52" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="13" fill="#ffe600" letter-spacing="3">FUSION // READY</text>
    </svg>`,
    { size: 256 },
  );

  // Deadlock Rebels Steer Skull & Flame Graphic
  const tankEmblemTex = svg(
    `<svg viewBox="0 0 512 256" xmlns="http://www.w3.org/2000/svg">
      <g fill="#e5a93b" stroke="#101216" stroke-width="4" stroke-linejoin="round">
        <path d="M 80 140 Q 150 90 230 110 Q 180 140 100 160 Z"/>
        <path d="M 40 110 Q 130 60 220 90 Q 160 120 70 140 Z"/>
        <path d="M 432 140 Q 362 90 282 110 Q 332 140 412 160 Z"/>
        <path d="M 472 110 Q 382 60 292 90 Q 352 120 442 140 Z"/>
      </g>
      <path d="M 20 180 L 492 180 L 460 200 L 52 200 Z" fill="#b81424" stroke="#e5a93b" stroke-width="4"/>
      <path d="M 60 208 L 452 208 L 436 218 L 76 218 Z" fill="#e5a93b"/>
      <path d="M 256 50 L 306 90 L 290 170 L 256 195 L 222 170 L 206 90 Z" fill="#14171d" stroke="#e5a93b" stroke-width="6"/>
      <path d="M 226 70 Q 180 20 140 50 Q 180 55 220 85 Z" fill="#e5a93b"/>
      <path d="M 286 70 Q 332 20 372 50 Q 332 55 292 85 Z" fill="#e5a93b"/>
      <polygon points="234,115 248,115 244,135 232,130" fill="#e5a93b"/>
      <polygon points="278,115 264,115 268,135 280,130" fill="#e5a93b"/>
      <polygon points="256,138 252,150 260,150" fill="#e5a93b"/>
      <text x="256" y="240" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="28" fill="#ffffff" stroke="#101216" stroke-width="4" letter-spacing="6">DEADLOCK</text>
    </svg>`,
    { size: 512 },
  );

  // Slotted & Drilled Brake Rotor Disc
  const brakeRotorTex = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <circle cx="128" cy="128" r="120" fill="#c0c5cc" stroke="#757d8a" stroke-width="4"/>
      <circle cx="128" cy="128" r="68" fill="none" stroke="#14171d" stroke-width="8"/>
      <circle cx="128" cy="128" r="48" fill="#14171d"/>
      <g fill="#e5a93b" stroke="#734e12" stroke-width="2">
        <circle cx="128" cy="68" r="8"/><circle cx="180" cy="98" r="8"/>
        <circle cx="180" cy="158" r="8"/><circle cx="128" cy="188" r="8"/>
        <circle cx="76" cy="158" r="8"/><circle cx="76" cy="98" r="8"/>
      </g>
      <g fill="#20242b">
        <circle cx="128" cy="24" r="4"/><circle cx="160" cy="30" r="4"/>
        <circle cx="190" cy="50" r="4"/><circle cx="214" cy="80" r="4"/>
        <circle cx="226" cy="116" r="4"/><circle cx="224" cy="150" r="4"/>
        <circle cx="206" cy="184" r="4"/><circle cx="176" cy="212" r="4"/>
        <circle cx="138" cy="226" r="4"/><circle cx="102" cy="224" r="4"/>
        <circle cx="68" cy="204" r="4"/><circle cx="44" cy="172" r="4"/>
        <circle cx="30" cy="134" r="4"/><circle cx="34" cy="96" r="4"/>
        <circle cx="54" cy="62" r="4"/><circle cx="86" cy="38" r="4"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  // Route 66 Shield Sign
  const route66SignTex = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <path d="M 38 40 Q 128 20 218 40 C 228 100 236 170 128 236 C 20 170 28 100 38 40 Z" fill="#ffffff" stroke="#1b212c" stroke-width="12"/>
      <path d="M 46 48 Q 128 30 210 48 C 220 102 226 164 128 224 C 30 164 36 102 46 48 Z" fill="#1b212c"/>
      <text x="128" y="86" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="28" fill="#ffffff" letter-spacing="4">ROUTE</text>
      <text x="128" y="172" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="92" fill="#ffffff" letter-spacing="-4">66</text>
      <text x="128" y="206" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="18" fill="#e5a93b" letter-spacing="2">DEADLOCK</text>
    </svg>`,
    { size: 256 },
  );

  // License Plate
  const licensePlateTex = svg(
    `<svg viewBox="0 0 256 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="128" rx="16" fill="#181c24" stroke="#e5a93b" stroke-width="8"/>
      <text x="128" y="32" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="16" fill="#e5a93b" letter-spacing="4">NEW MEXICO</text>
      <text x="128" y="88" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="52" fill="#ffffff" letter-spacing="6">DL-66</text>
      <circle cx="32" cy="64" r="14" fill="#b81424"/>
      <polygon points="32,54 36,62 44,62 38,68 40,76 32,71 24,76 26,68 20,62 28,62" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // Skeleton Rig
  // ---------------------------------------------------------------------------
  const BASE_TOP_Y = 0.04;
  const REAR_AXLE: [number, number, number] = [0, BASE_TOP_Y + 0.35, -0.74];
  const FRONT_AXLE: [number, number, number] = [0, BASE_TOP_Y + 0.40, 1.38];
  const STEERING_HEAD: [number, number, number] = [0, 0.98, 0.52];

  // Fork rake direction vector (from steering head down-forward to front axle)
  const forkDir = new THREE.Vector3(...FRONT_AXLE).sub(new THREE.Vector3(...STEERING_HEAD)).normalize();

  // Root joint
  const root = b.joint("root", { at: [0, 0, 0] });

  // Chassis / frame backbone
  const chassis = b.joint("chassis", { parent: root, at: [0, 0.45, 0.0], role: "spine" });

  // Steering neck / triple tree assembly
  const steering = b.joint("steering", { parent: chassis, at: STEERING_HEAD, dir: forkDir, role: "neck" });

  // Wheels
  const frontWheel = b.joint("frontWheel", { parent: steering, at: FRONT_AXLE, dir: [1, 0, 0], role: "hinge" });
  const rearWheel = b.joint("rearWheel", { parent: chassis, at: REAR_AXLE, dir: [1, 0, 0], role: "hinge" });

  // Handlebars
  const handlebars = b.joint("handlebars", { parent: steering, at: [0, 1.14, 0.46], role: "fan" });

  // Kickstand on left (+X) side
  const KICKSTAND_PIVOT: [number, number, number] = [0.13, 0.22, -0.05];
  const KICKSTAND_TIP: [number, number, number] = [0.32, BASE_TOP_Y + 0.005, 0.06];
  const kickstandDir = new THREE.Vector3(...KICKSTAND_TIP).sub(new THREE.Vector3(...KICKSTAND_PIVOT)).normalize();
  const kickstand = b.joint("kickstand", { parent: chassis, at: KICKSTAND_PIVOT, dir: kickstandDir, role: "hinge" });

  // ---------------------------------------------------------------------------
  // Staged Base (Route 66 Desert Highway)
  // Asphalt road on left/center, dirt shoulder on the right (+X side).
  // ---------------------------------------------------------------------------
  // Main road asphalt base slab
  const baseOutline: [number, number, "sharp"][] = [
    [-0.85, -1.45, "sharp"],
    [0.75, -1.45, "sharp"],
    [0.85, -1.35, "sharp"],
    [0.85, 1.85, "sharp"],
    [0.75, 1.98, "sharp"],
    [-0.85, 1.98, "sharp"],
  ];

  b.extrude(baseOutline, {
    at: [0, BASE_TOP_Y / 2, 0.25],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: BASE_TOP_Y,
    bevel: 0.008,
    color: ASPHALT_ROAD,
    bone: root,
    group: "scenery",
  });

  // Desert dirt/sand roadside shoulder strip (+X side)
  b.part(new THREE.BoxGeometry(0.38, 0.003, 3.40), DESERT_SHOULDER, {
    bone: root,
    at: [0.66, BASE_TOP_Y + 0.0015, 0.25],
    group: "scenery",
  });

  // Center double solid yellow road stripes on the traffic side (-X side)
  b.part(new THREE.BoxGeometry(0.035, 0.002, 3.35), ROAD_YELLOW, {
    bone: root,
    at: [-0.50, BASE_TOP_Y + 0.002, 0.25],
    group: "scenery",
  });
  b.part(new THREE.BoxGeometry(0.035, 0.002, 3.35), ROAD_YELLOW, {
    bone: root,
    at: [-0.56, BASE_TOP_Y + 0.002, 0.25],
    group: "scenery",
  });

  // Solid white shoulder line separating lane from dirt shoulder
  b.part(new THREE.BoxGeometry(0.04, 0.002, 3.35), ROAD_WHITE, {
    bone: root,
    at: [0.46, BASE_TOP_Y + 0.002, 0.25],
    group: "scenery",
  });

  // Roadside red sandstone rocks placed strictly on the dirt shoulder
  b.part(new THREE.DodecahedronGeometry(0.12, 0), DESERT_ROCK, {
    bone: root,
    at: [0.72, BASE_TOP_Y + 0.05, -0.65],
    scale: [1.3, 0.7, 1.0],
    rotation: [15, 25, -10],
    group: "scenery",
  });
  b.part(new THREE.DodecahedronGeometry(0.14, 0), DESERT_ROCK, {
    bone: root,
    at: [0.73, BASE_TOP_Y + 0.06, 0.85],
    scale: [1.1, 0.8, 1.4],
    rotation: [-15, 40, 20],
    group: "scenery",
  });
  b.part(new THREE.DodecahedronGeometry(0.08, 0), DESERT_ROCK, {
    bone: root,
    at: [0.68, BASE_TOP_Y + 0.03, 1.55],
    scale: [1.2, 0.5, 0.9],
    rotation: [20, -30, 10],
    group: "scenery",
  });

  // Route 66 Shield Signpost on shoulder
  b.rod([0.72, BASE_TOP_Y, -1.15], [0.72, 0.75, -1.15], 0.016, DARK_CARBON, { bone: root, group: "scenery" });
  b.part(new THREE.BoxGeometry(0.24, 0.24, 0.008), "#ffffff", {
    bone: root,
    at: [0.72, 0.64, -1.14],
    dir: [0, 0, 1],
    axis: "z",
    texture: route66SignTex,
    group: "scenery",
  });

  // Spent brass shell casing on asphalt (Overwatch lore detail)
  b.rod([0.22, BASE_TOP_Y + 0.006, -0.3], [0.24, BASE_TOP_Y + 0.006, -0.26], 0.006, GOLD_BILLET, {
    bone: root,
    group: "scenery",
  });

  // ---------------------------------------------------------------------------
  // Frame & Chassis Construction
  // ---------------------------------------------------------------------------
  // Steering neck casting
  b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.20, 16), FRAME_BLACK, {
    bone: chassis,
    at: STEERING_HEAD,
    dir: forkDir,
  });

  // Top backbone tube rising high to steering neck (Frisco chopper stance)
  b.sweep(
    catmull([
      [0, 0.96, 0.50],
      [0, 0.82, 0.22],
      [0, 0.62, -0.06],
      [0, 0.53, -0.24],
    ]),
    0.038,
    { color: FRAME_BLACK, bone: chassis },
  );

  // Twin cradle down-tubes
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.045, 0.94, 0.48],
        [s * 0.115, 0.60, 0.38],
        [s * 0.125, 0.23, 0.32],
        [s * 0.125, 0.17, 0.08],
        [s * 0.125, 0.17, -0.34],
      ]),
      0.024,
      { color: FRAME_BLACK, bone: chassis },
    );

    // Rear upper triangulation struts (Hardtail chopper wishbone)
    b.sweep(
      catmull([
        [0, 0.53, -0.24],
        [s * 0.14, 0.46, -0.47],
        [s * 0.19, REAR_AXLE[1], REAR_AXLE[2]],
      ]),
      0.022,
      { color: FRAME_BLACK, bone: chassis },
    );

    // Rear lower triangulation struts
    b.sweep(
      catmull([
        [s * 0.125, 0.17, -0.34],
        [s * 0.16, 0.24, -0.56],
        [s * 0.19, REAR_AXLE[1], REAR_AXLE[2]],
      ]),
      0.022,
      { color: FRAME_BLACK, bone: chassis },
    );

    // Axle dropout plates with gold billet bolts
    b.part(new THREE.BoxGeometry(0.02, 0.08, 0.11), GOLD_BILLET, {
      bone: chassis,
      at: [s * 0.195, REAR_AXLE[1], REAR_AXLE[2]],
    });
  }

  // Cross brace connecting upper rear wishbones
  b.rod([-0.14, 0.46, -0.47], [0.14, 0.46, -0.47], 0.018, FRAME_BLACK, { bone: chassis });

  // Aerodynamic Chin Spoiler / Front Frame Cowl (Overwatch styling)
  b.frustumBox([0, 0.17, 0.38], [0, 0.38, 0.44], [0.22, 0.12], [0.16, 0.10], {
    color: CANDY_RED,
    bone: chassis,
  });
  b.part(new THREE.BoxGeometry(0.18, 0.08, 0.03), DARK_CARBON, {
    bone: chassis,
    at: [0, 0.26, 0.45],
  });

  // ---------------------------------------------------------------------------
  // Rear Fat Drag Wheel Assembly
  // ---------------------------------------------------------------------------
  // Massive 300-series rear drag tire: radius 0.35m, width 0.36m (-0.18 to +0.18)
  const rearTireProfile: [number, number][] = [
    [0.21, -0.18],
    [0.32, -0.18],
    [0.35, -0.13],
    [0.35, 0.13],
    [0.32, 0.18],
    [0.21, 0.18],
    [0.19, 0.14],
    [0.19, -0.14],
  ];

  b.lathe(rearTireProfile, {
    at: REAR_AXLE,
    axis: [1, 0, 0],
    segments: 28,
    color: TIRE_BLACK,
    bone: rearWheel,
  });

  // Rear rim barrel
  b.part(new THREE.CylinderGeometry(0.21, 0.21, 0.34, 24, 1, true), CHROME, {
    bone: rearWheel,
    at: REAR_AXLE,
    dir: [1, 0, 0],
  });

  // Anodized gold rim outer beads (using axis: "z" so torus lies parallel to wheel face!)
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.212, 0.012, 8, 24), GOLD_BILLET, {
      bone: rearWheel,
      at: [s * 0.17, REAR_AXLE[1], REAR_AXLE[2]],
      dir: [1, 0, 0],
      axis: "z",
    });
  }

  // Rear wheel hub
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.20, 16), CHROME, {
    bone: rearWheel,
    at: REAR_AXLE,
    dir: [1, 0, 0],
  });

  // 5 Spoke Turbine Blades on Rear Wheel
  b.ring(
    { at: REAR_AXLE, axis: [1, 0, 0] },
    { count: 5, radius: 0.07 },
    (item) => {
      const tip = offset(item, item, 0.12);
      b.rod(item, tip, [0.026, 0.016], GOLD_BILLET, { bone: rearWheel });
      b.rod(offset(item, [0.03, 0, 0], 0.01), offset(tip, [0.03, 0, 0], 0.01), 0.01, CHROME, { bone: rearWheel });
    },
  );

  // Rear brake disc on right (-X) side
  b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.005, 20), "#ffffff", {
    bone: rearWheel,
    at: [-0.175, REAR_AXLE[1], REAR_AXLE[2]],
    dir: [1, 0, 0],
    texture: brakeRotorTex,
  });

  // Rear brake caliper (fixed to frame)
  b.part(new THREE.BoxGeometry(0.04, 0.07, 0.09), "#b81424", {
    bone: chassis,
    at: [-0.175, REAR_AXLE[1] + 0.10, REAR_AXLE[2] - 0.08],
    rotation: [25, 0, 0],
  });

  // Rear drive belt pulley (left +X side)
  b.part(new THREE.CylinderGeometry(0.175, 0.175, 0.022, 24), GOLD_BILLET, {
    bone: rearWheel,
    at: [0.175, REAR_AXLE[1], REAR_AXLE[2]],
    dir: [1, 0, 0],
  });

  // Drive belt running from transmission to rear wheel
  b.rod([0.16, 0.35, -0.20], [0.175, REAR_AXLE[1] + 0.08, REAR_AXLE[2]], 0.013, DARK_CARBON, { bone: chassis });
  b.rod([0.16, 0.23, -0.20], [0.175, REAR_AXLE[1] - 0.08, REAR_AXLE[2]], 0.013, DARK_CARBON, { bone: chassis });

  // ---------------------------------------------------------------------------
  // Front End: Forks, Wheel, Headlight & Cockpit
  // ---------------------------------------------------------------------------
  // Triple Tree Clamps
  const TOP_CLAMP_POS: [number, number, number] = [0, 1.04, 0.46];
  const BTM_CLAMP_POS: [number, number, number] = [0, 0.90, 0.58];

  b.part(new THREE.BoxGeometry(0.32, 0.04, 0.09), CHROME, {
    bone: steering,
    at: TOP_CLAMP_POS,
    dir: forkDir,
  });
  b.part(new THREE.BoxGeometry(0.32, 0.04, 0.09), CHROME, {
    bone: steering,
    at: BTM_CLAMP_POS,
    dir: forkDir,
  });

  // Dual telescopic hydraulic fork stanchions
  for (const s of [1, -1]) {
    const upperStart: [number, number, number] = [s * 0.12, TOP_CLAMP_POS[1], TOP_CLAMP_POS[2]];
    const sliderMid: [number, number, number] = [s * 0.12, 0.66, 0.98];
    const sliderEnd: [number, number, number] = [s * 0.12, FRONT_AXLE[1], FRONT_AXLE[2]];

    // Upper fork shroud (Dark carbon with gold accent ring)
    b.rod(upperStart, sliderMid, 0.028, DARK_CARBON, { bone: steering });
    b.part(new THREE.TorusGeometry(0.03, 0.005, 8, 16), GOLD_BILLET, {
      bone: steering,
      at: [s * 0.12, 0.76, 0.84],
      dir: forkDir,
      axis: "z",
    });

    // Lower chrome slider cylinder
    b.rod(sliderMid, sliderEnd, 0.022, CHROME, { bone: steering });

    // Axle clamp lug
    b.part(new THREE.BoxGeometry(0.04, 0.05, 0.05), GOLD_BILLET, {
      bone: steering,
      at: sliderEnd,
    });
  }

  // Fork brace stabilizing front sliders
  b.sweep(
    catmull([
      [-0.12, 0.56, 1.16],
      [-0.07, 0.60, 1.20],
      [0.07, 0.60, 1.20],
      [0.12, 0.56, 1.16],
    ]),
    0.016,
    { color: CHROME, bone: steering },
  );

  // Front Hugger Minimalist Fender
  b.sweep(
    catmull([
      [0, 0.54, 1.05],
      [0, 0.62, 1.22],
      [0, 0.59, 1.42],
    ]),
    [0.08, 0.08],
    { color: CANDY_RED, bone: steering, section: "box", shift: [0, -0.02] },
  );

  // Front 23-inch Tall Custom Wheel
  const frontTireProfile: [number, number][] = [
    [0.28, -0.045],
    [0.38, -0.045],
    [0.40, -0.025],
    [0.40, 0.025],
    [0.38, 0.045],
    [0.28, 0.045],
    [0.26, 0.03],
    [0.26, -0.03],
  ];

  b.lathe(frontTireProfile, {
    at: FRONT_AXLE,
    axis: [1, 0, 0],
    segments: 28,
    color: TIRE_BLACK,
    bone: frontWheel,
  });

  // Front rim barrel
  b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.09, 24, 1, true), CHROME, {
    bone: frontWheel,
    at: FRONT_AXLE,
    dir: [1, 0, 0],
  });

  // Front rim gold inner bead
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.282, 0.008, 8, 24), GOLD_BILLET, {
      bone: frontWheel,
      at: [s * 0.044, FRONT_AXLE[1], FRONT_AXLE[2]],
      dir: [1, 0, 0],
      axis: "z",
    });
  }

  // Front hub
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.11, 16), CHROME, {
    bone: frontWheel,
    at: FRONT_AXLE,
    dir: [1, 0, 0],
  });

  // Front wheel 5 spoke turbine blades
  b.ring(
    { at: FRONT_AXLE, axis: [1, 0, 0] },
    { count: 5, radius: 0.06 },
    (item) => {
      const tip = offset(item, item, 0.20);
      b.rod(item, tip, [0.020, 0.012], GOLD_BILLET, { bone: frontWheel });
    },
  );

  // Dual slotted front brake rotors
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.005, 20), "#ffffff", {
      bone: frontWheel,
      at: [s * 0.055, FRONT_AXLE[1], FRONT_AXLE[2]],
      dir: [1, 0, 0],
      texture: brakeRotorTex,
    });

    // Radial mount brake calipers (fixed to fork sliders)
    b.part(new THREE.BoxGeometry(0.035, 0.07, 0.07), GOLD_BILLET, {
      bone: steering,
      at: [s * 0.058, 0.52, 1.28],
      rotation: [30, 0, 0],
    });
  }

  // Headlight Assembly - elevated prominently in front of the top clamp
  const HEADLIGHT_POS: [number, number, number] = [0, 0.98, 0.72];

  // Headlight bracket extending from top and bottom trees
  b.rod([0, TOP_CLAMP_POS[1], TOP_CLAMP_POS[2]], HEADLIGHT_POS, 0.018, DARK_CARBON, { bone: steering });
  b.rod([0, BTM_CLAMP_POS[1], BTM_CLAMP_POS[2]], HEADLIGHT_POS, 0.018, DARK_CARBON, { bone: steering });

  // Faceted angular cowl
  b.frustumBox(
    [0, HEADLIGHT_POS[1] - 0.06, HEADLIGHT_POS[2] - 0.08],
    [0, HEADLIGHT_POS[1] + 0.06, HEADLIGHT_POS[2] + 0.06],
    [0.18, 0.18],
    [0.14, 0.14],
    { color: CANDY_RED, bone: steering },
  );

  // Visor brow plate
  b.part(new THREE.BoxGeometry(0.18, 0.025, 0.08), DARK_CARBON, {
    bone: steering,
    at: [0, HEADLIGHT_POS[1] + 0.065, HEADLIGHT_POS[2] + 0.03],
    rotation: [-18, 0, 0],
  });

  // High-beam Upper Projector
  const upperBeam = b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.02, 18), GLOW_WHITE, {
    bone: steering,
    at: [0, HEADLIGHT_POS[1] + 0.02, HEADLIGHT_POS[2] + 0.065],
    dir: forkDir,
  });
  glow(upperBeam, 2.5);

  // Low-beam Lower Projector
  const lowerBeam = b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 18), GLOW_CYAN, {
    bone: steering,
    at: [0, HEADLIGHT_POS[1] - 0.035, HEADLIGHT_POS[2] + 0.045],
    dir: forkDir,
  });
  glow(lowerBeam, 2.2);

  // Amber Daytime Running Light Halo (using axis: "z" to face forward!)
  const halo = b.part(new THREE.TorusGeometry(0.046, 0.005, 8, 20), GLOW_AMBER, {
    bone: steering,
    at: [0, HEADLIGHT_POS[1] + 0.02, HEADLIGHT_POS[2] + 0.07],
    dir: forkDir,
    axis: "z",
  });
  glow(halo, 1.8);

  // ---------------------------------------------------------------------------
  // Handlebars & Cockpit
  // ---------------------------------------------------------------------------
  // Billet risers clamped to top tree
  for (const s of [1, -1]) {
    b.rod([s * 0.07, TOP_CLAMP_POS[1], TOP_CLAMP_POS[2]], [s * 0.07, 1.14, 0.46], 0.018, DARK_CARBON, {
      bone: steering,
    });
  }

  // Digital HUD Speedo Pod centered between risers
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.025, 8), DARK_CARBON, {
    bone: steering,
    at: [0, 1.12, 0.48],
    dir: [0, 0.7, -0.7],
  });

  const hudFace = b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", {
    bone: steering,
    at: [0, 1.135, 0.465],
    dir: [0, 0.7, -0.7],
    axis: "z",
    texture: speedoTex,
  });
  glow(hudFace, 1.8);

  // Ape-Hanger Z-Bars with corner gussets
  b.rod([-0.09, 1.14, 0.46], [0.09, 1.14, 0.46], 0.016, CHROME, { bone: handlebars });

  for (const s of [1, -1]) {
    // Vertical rise
    b.rod([s * 0.09, 1.14, 0.46], [s * 0.12, 1.26, 0.44], 0.016, CHROME, { bone: handlebars });
    // Upper horizontal bar
    b.rod([s * 0.12, 1.26, 0.44], [s * 0.35, 1.29, 0.40], 0.016, CHROME, { bone: handlebars });
    // Grip downward droop
    b.rod([s * 0.35, 1.29, 0.40], [s * 0.44, 1.25, 0.32], 0.016, CHROME, { bone: handlebars });

    // Triangular Z-bar corner gusset
    b.part(new THREE.BoxGeometry(0.008, 0.04, 0.04), GOLD_BILLET, {
      bone: handlebars,
      at: [s * 0.11, 1.23, 0.45],
      rotation: [0, 0, s * 25],
    });

    // Ergonomic knurled rubber grips
    b.rod([s * 0.36, 1.28, 0.39], [s * 0.43, 1.25, 0.33], 0.022, TIRE_BLACK, { bone: handlebars });

    // Glowing amber bar-end turn indicators
    const barEnd = b.part(new THREE.SphereGeometry(0.018, 10, 8), GLOW_AMBER, {
      bone: handlebars,
      at: [s * 0.44, 1.25, 0.32],
    });
    glow(barEnd, 2.0);

    // Skeletonized chrome brake/clutch levers
    b.rod([s * 0.36, 1.27, 0.40], [s * 0.42, 1.29, 0.42], 0.007, CHROME, { bone: handlebars });

    // Undermount low-profile teardrop mirrors
    b.rod([s * 0.38, 1.26, 0.37], [s * 0.38, 1.17, 0.37], 0.006, DARK_CARBON, { bone: handlebars });
    b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.008, 16), CHROME, {
      bone: handlebars,
      at: [s * 0.38, 1.16, 0.37],
      dir: [0, 0, -1],
    });
  }

  // ---------------------------------------------------------------------------
  // Custom Teardrop Fuel Tank & Bodywork
  // ---------------------------------------------------------------------------
  const tank = b.loft(
    [
      { at: [0, 0.65, -0.14], w: 0.14, h: 0.12 },
      { at: [0, 0.77, 0.04], w: 0.34, h: 0.22 },
      { at: [0, 0.90, 0.24], w: 0.42, h: 0.28 },
      { at: [0, 0.95, 0.38], w: 0.36, h: 0.24 },
      { at: [0, 0.94, 0.50], w: 0.20, h: 0.18 },
    ],
    { bone: chassis, color: CANDY_RED },
  );

  // Chrome aircraft pop-up fuel filler cap
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.014, 16), CHROME, {
    bone: chassis,
    at: [0, 0.98, 0.34],
    dir: [0, 1, 0],
  });

  // Sculpted dark carbon knee indent inserts
  b.part(new THREE.BoxGeometry(0.02, 0.13, 0.22), DARK_CARBON, {
    bone: chassis,
    at: [0.18, 0.82, 0.12],
    rotation: [0, 14, 10],
  });
  b.part(new THREE.BoxGeometry(0.02, 0.13, 0.22), DARK_CARBON, {
    bone: chassis,
    at: [-0.18, 0.82, 0.12],
    rotation: [0, -14, -10],
  });

  // Deadlock outlaw tank decals on both flanks
  b.decal(tank, tankEmblemTex, {
    at: [0.18, 0.86, 0.24],
    dir: [0.92, 0.2, 0.2],
    size: [0.26, 0.14],
  });
  b.decal(tank, tankEmblemTex, {
    at: [-0.18, 0.86, 0.24],
    dir: [-0.92, 0.2, 0.2],
    size: [0.26, 0.14],
    mirror: true,
  });

  // ---------------------------------------------------------------------------
  // Custom Solo Saddle, Horseshoe Oil Tank & Rear Fender
  // ---------------------------------------------------------------------------
  // Horseshoe Oil Tank / Battery Box (fills the frame void under the seat!)
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.26, 20), CHROME, {
    bone: chassis,
    at: [0, 0.45, -0.30],
    dir: [1, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 12), GOLD_BILLET, {
    bone: chassis,
    at: [0.14, 0.48, -0.30],
    dir: [1, 0, 0],
  });

  // Sculpted solo bucket seat
  b.loft(
    [
      { at: [0, 0.65, -0.14], w: 0.16, h: 0.08 },
      { at: [0, 0.55, -0.26], w: 0.26, h: 0.08 },
      { at: [0, 0.64, -0.42], w: 0.22, h: 0.14 },
    ],
    { bone: chassis, color: SADDLE_LEATHER },
  );

  // Bobbed Rear Fender
  b.loft(
    [
      { at: [0, 0.60, -0.38], w: 0.38, h: 0.04 },
      { at: [0, 0.71, -0.58], w: 0.39, h: 0.04 },
      { at: [0, 0.67, -0.80], w: 0.39, h: 0.04 },
      { at: [0, 0.55, -0.96], w: 0.36, h: 0.04 },
    ],
    { bone: chassis, color: CANDY_RED },
  );

  // Center carbon racing spine along fender
  b.sweep(
    catmull([
      [0, 0.62, -0.38],
      [0, 0.73, -0.58],
      [0, 0.69, -0.80],
      [0, 0.57, -0.96],
    ]),
    [0.05, 0.01],
    { color: DARK_CARBON, bone: chassis },
  );

  // Curved tubular gold fender strut supports connecting rear axle to fender
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.19, REAR_AXLE[1], REAR_AXLE[2]],
        [s * 0.20, 0.55, -0.66],
        [s * 0.18, 0.68, -0.74],
      ]),
      0.014,
      { color: GOLD_BILLET, bone: chassis },
    );
  }

  // Trailing-edge LED taillight blade
  const tailLight = b.part(new THREE.BoxGeometry(0.24, 0.02, 0.025), GLOW_RED, {
    bone: chassis,
    at: [0, 0.55, -0.97],
  });
  glow(tailLight, 2.5);

  // Side-mounted license plate holder on left (+X) side
  b.rod([0.19, REAR_AXLE[1], REAR_AXLE[2]], [0.26, 0.34, -0.74], 0.012, DARK_CARBON, { bone: chassis });
  b.part(new THREE.BoxGeometry(0.01, 0.11, 0.20), "#ffffff", {
    bone: chassis,
    at: [0.265, 0.34, -0.74],
    dir: [1, 0, 0],
    axis: "z",
    texture: licensePlateTex,
  });

  // ---------------------------------------------------------------------------
  // V-Twin Fusion Powerplant
  // ---------------------------------------------------------------------------
  // Main crankcase & transmission housing
  b.frustumBox([0, 0.22, -0.32], [0, 0.22, 0.20], [0.28, 0.22], [0.28, 0.22], {
    color: ENGINE_GUNMETAL,
    bone: chassis,
  });

  // Left primary drive outer cover (Chrome with gold inspection cover)
  b.part(new THREE.CylinderGeometry(0.14, 0.15, 0.06, 18), CHROME, {
    bone: chassis,
    at: [0.15, 0.31, -0.06],
    dir: [1, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16), GOLD_BILLET, {
    bone: chassis,
    at: [0.18, 0.31, -0.06],
    dir: [1, 0, 0],
  });

  // Right cam gear chest cover
  b.part(new THREE.BoxGeometry(0.05, 0.14, 0.24), CHROME, {
    bone: chassis,
    at: [-0.15, 0.28, 0.02],
  });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 16), GOLD_BILLET, {
    bone: chassis,
    at: [-0.18, 0.28, 0.02],
    dir: [1, 0, 0],
  });

  // Front V-Cylinder (angled forward)
  const FRONT_CYL_BASE: [number, number, number] = [0, 0.44, 0.09];
  const FRONT_CYL_TOP: [number, number, number] = [0, 0.70, 0.23];
  b.rod(FRONT_CYL_BASE, FRONT_CYL_TOP, 0.075, ENGINE_GUNMETAL, { bone: chassis });

  // Rear V-Cylinder (angled backward)
  const REAR_CYL_BASE: [number, number, number] = [0, 0.44, -0.13];
  const REAR_CYL_TOP: [number, number, number] = [0, 0.70, -0.27];
  b.rod(REAR_CYL_BASE, REAR_CYL_TOP, 0.075, ENGINE_GUNMETAL, { bone: chassis });

  // 10 Horizontal Cooling Fin Plates on each cylinder with chrome edge discs
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    // Front cylinder fin
    const fPos = lerp(FRONT_CYL_BASE, FRONT_CYL_TOP, t);
    b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.008, 16), ENGINE_GUNMETAL, {
      bone: chassis,
      at: fPos,
      dir: [0, 1, 0.4],
    });
    // Chrome thin edge rim
    b.part(new THREE.CylinderGeometry(0.107, 0.107, 0.002, 16), CHROME, {
      bone: chassis,
      at: fPos,
      dir: [0, 1, 0.4],
    });

    // Rear cylinder fin
    const rPos = lerp(REAR_CYL_BASE, REAR_CYL_TOP, t);
    b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.008, 16), ENGINE_GUNMETAL, {
      bone: chassis,
      at: rPos,
      dir: [0, 1, -0.4],
    });
    b.part(new THREE.CylinderGeometry(0.107, 0.107, 0.002, 16), CHROME, {
      bone: chassis,
      at: rPos,
      dir: [0, 1, -0.4],
    });
  }

  // Polished Chrome Rocker Head Covers
  b.part(new THREE.BoxGeometry(0.18, 0.06, 0.16), CHROME, {
    bone: chassis,
    at: [0, FRONT_CYL_TOP[1] + 0.02, FRONT_CYL_TOP[2] + 0.01],
    rotation: [22, 0, 0],
  });
  b.part(new THREE.BoxGeometry(0.18, 0.06, 0.16), CHROME, {
    bone: chassis,
    at: [0, REAR_CYL_TOP[1] + 0.02, REAR_CYL_TOP[2] - 0.01],
    rotation: [-22, 0, 0],
  });

  // Brass Rocker Cap Nuts
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.015, 6), GOLD_BILLET, {
      bone: chassis,
      at: [s * 0.06, FRONT_CYL_TOP[1] + 0.05, FRONT_CYL_TOP[2] + 0.01],
    });
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.015, 6), GOLD_BILLET, {
      bone: chassis,
      at: [s * 0.06, REAR_CYL_TOP[1] + 0.05, REAR_CYL_TOP[2] - 0.01],
    });
  }

  // Red Ignition Coils & Spark Plug Wires
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 12), IGNITION_RED, {
    bone: chassis,
    at: [0.10, 0.58, -0.02],
    dir: [0, 0, 1],
  });
  b.sweep(
    catmull([
      [0.10, 0.58, 0.01],
      [0.08, 0.65, 0.12],
      [0.05, 0.72, 0.20],
    ]),
    0.005,
    { color: IGNITION_RED, bone: chassis },
  );
  b.sweep(
    catmull([
      [0.10, 0.58, -0.05],
      [0.08, 0.65, -0.16],
      [0.05, 0.72, -0.24],
    ]),
    0.005,
    { color: IGNITION_RED, bone: chassis },
  );

  // Fusion Power Core centered in V-crotch
  const corePos: [number, number, number] = [0, 0.52, -0.02];
  const fusionCore = b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.16, 16), GLOW_CYAN, {
    bone: chassis,
    at: corePos,
    dir: [1, 0, 0],
  });
  glow(fusionCore, 2.2);

  // Core confinement cage rings (using axis: "z" so rings surround cylinder!)
  b.part(new THREE.TorusGeometry(0.048, 0.008, 8, 16), GOLD_BILLET, {
    bone: chassis,
    at: [0.05, corePos[1], corePos[2]],
    dir: [1, 0, 0],
    axis: "z",
  });
  b.part(new THREE.TorusGeometry(0.048, 0.008, 8, 16), GOLD_BILLET, {
    bone: chassis,
    at: [-0.05, corePos[1], corePos[2]],
    dir: [1, 0, 0],
    axis: "z",
  });

  // Blue Energy Plasma Conduits
  const conduit1 = b.sweep(
    catmull([
      [0, 0.54, -0.02],
      [0.08, 0.58, 0.05],
      [0.06, 0.67, 0.18],
    ]),
    0.009,
    { color: GLOW_BLUE, bone: chassis },
  );
  glow(conduit1, 1.8);

  const conduit2 = b.sweep(
    catmull([
      [0, 0.54, -0.02],
      [0.08, 0.58, -0.09],
      [0.06, 0.67, -0.22],
    ]),
    0.009,
    { color: GLOW_BLUE, bone: chassis },
  );
  glow(conduit2, 1.8);

  // Chrome Pushrod Tubes on right (-X) side
  for (const s of [0.03, -0.03]) {
    b.rod([-0.12, 0.35, 0.02 + s], [-0.10, FRONT_CYL_TOP[1], FRONT_CYL_TOP[2] + s], 0.009, CHROME, {
      bone: chassis,
    });
    b.rod([-0.12, 0.35, -0.04 + s], [-0.10, REAR_CYL_TOP[1], REAR_CYL_TOP[2] + s], 0.009, CHROME, {
      bone: chassis,
    });
  }

  // Forward Velocity Stack Air Intake Scoop on right (-X) side
  b.part(new THREE.CylinderGeometry(0.065, 0.045, 0.14, 18), CHROME, {
    bone: chassis,
    at: [-0.18, 0.60, 0.04],
    dir: [0, 0.18, 1],
  });
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.01, 16), "#b81424", {
    bone: chassis,
    at: [-0.18, 0.61, 0.11],
    dir: [0, 0.18, 1],
  });

  // ---------------------------------------------------------------------------
  // Dual Staggered Slash-Cut Exhaust System
  // ---------------------------------------------------------------------------
  // Front header pipe
  b.sweep(
    catmull([
      [-0.06, 0.67, 0.24],
      [-0.17, 0.54, 0.25],
      [-0.20, 0.34, 0.12],
      [-0.20, 0.26, -0.20],
      [-0.20, 0.26, -0.90],
    ]),
    0.024,
    { color: CHROME, bone: chassis },
  );

  // Front exhaust glowing internal flame disk
  const flame1 = b.part(new THREE.CircleGeometry(0.021, 12), GLOW_AMBER, {
    bone: chassis,
    at: [-0.20, 0.26, -0.89],
    dir: [0, 0, -1],
  });
  glow(flame1, 2.0);

  // Rear header pipe
  b.sweep(
    catmull([
      [-0.06, 0.67, -0.24],
      [-0.17, 0.52, -0.28],
      [-0.20, 0.38, -0.15],
      [-0.20, 0.36, -0.45],
      [-0.20, 0.36, -0.78],
    ]),
    0.024,
    { color: CHROME, bone: chassis },
  );

  // Rear exhaust glowing internal flame disk
  const flame2 = b.part(new THREE.CircleGeometry(0.021, 12), GLOW_AMBER, {
    bone: chassis,
    at: [-0.20, 0.36, -0.77],
    dir: [0, 0, -1],
  });
  glow(flame2, 2.0);

  // Slotted exhaust heat shields
  b.sweep(
    catmull([
      [-0.205, 0.28, 0.02],
      [-0.205, 0.26, -0.22],
    ]),
    0.028,
    { color: GOLD_BILLET, bone: chassis },
  );
  b.sweep(
    catmull([
      [-0.205, 0.38, -0.18],
      [-0.205, 0.36, -0.42],
    ]),
    0.028,
    { color: GOLD_BILLET, bone: chassis },
  );

  // ---------------------------------------------------------------------------
  // Forward Foot Controls
  // ---------------------------------------------------------------------------
  // Forward foot pegs & control levers
  for (const s of [1, -1]) {
    // Peg support bracket
    b.rod([s * 0.125, 0.28, 0.40], [s * 0.26, 0.28, 0.46], 0.015, CHROME, { bone: chassis });

    // Knurled foot peg
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.10, 12), TIRE_BLACK, {
      bone: chassis,
      at: [s * 0.31, 0.28, 0.46],
      dir: [s, 0, 0],
    });
    b.part(new THREE.SphereGeometry(0.022, 8, 8), GOLD_BILLET, {
      bone: chassis,
      at: [s * 0.36, 0.28, 0.46],
    });
  }

  // Left toe gear shifter peg
  b.rod([0.26, 0.28, 0.46], [0.26, 0.32, 0.53], 0.01, CHROME, { bone: chassis });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.04, 10), TIRE_BLACK, {
    bone: chassis,
    at: [0.28, 0.32, 0.53],
    dir: [1, 0, 0],
  });

  // Right rear brake pedal
  b.rod([-0.26, 0.28, 0.46], [-0.26, 0.33, 0.53], 0.01, CHROME, { bone: chassis });
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.04), GOLD_BILLET, {
    bone: chassis,
    at: [-0.27, 0.33, 0.53],
  });

  // ---------------------------------------------------------------------------
  // Kickstand (resting solidly on road base)
  // ---------------------------------------------------------------------------
  b.rod(KICKSTAND_PIVOT, KICKSTAND_TIP, [0.016, 0.012], CHROME, { bone: kickstand });

  // Wide kickstand ground pad
  b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.008, 12), DARK_CARBON, {
    bone: kickstand,
    at: KICKSTAND_TIP,
    dir: [0, 1, 0],
  });

  // Tension return coil spring
  b.rod([0.15, 0.20, -0.04], [0.23, 0.12, 0.02], 0.007, GOLD_BILLET, { bone: kickstand });

  return b.root;
}
