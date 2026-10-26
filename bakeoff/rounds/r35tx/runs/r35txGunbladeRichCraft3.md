```ts
import * as THREE from "three";
import {
  catmull,
  bezier,
  createBuilder,
  frame,
  rng,
  svg,
  cel,
  metal,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Final Fantasy Gunblade",
  description:
    "An oversized fantasy gunblade with a silver greatsword, integrated firearm receiver, rotating chamber, luminous runes, ornate guard, wrapped grip, and mana crystal pommel.",
};

export default function build() {
  const b = createBuilder({
    name: "final-fantasy-gunblade",
    detail: 1,
    paintSize: 2048,
  });

  const p = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------------------------------------------------------------------------------------------------------
  // Palette
  // ---------------------------------------------------------------------------------------------------------------

  const BLADE = cel("#dceafd", "#53627f", {
    threshold: 0.04,
    light: [0.32, 0.86, 0.48],
  });

  const BLADE_EDGE = metal("steel", {
    polish: 0.9,
    tarnish: 0.04,
    size: 0.12,
  });

  const FULLER = cel("#4e78b4", "#1b2c58", {
    threshold: 0.02,
  });

  const DARK_IRON = metal("iron", {
    polish: 0.38,
    tarnish: 0.52,
    size: 0.075,
  });

  const BLACK_STEEL = metal("blued", {
    polish: 0.58,
    tarnish: 0.24,
    size: 0.09,
  });

  const GOLD = metal("gilt", {
    polish: 0.82,
    tarnish: 0.08,
    size: 0.06,
  });

  const BRONZE = metal("bronze", {
    polish: 0.32,
    tarnish: 0.35,
    verdigris: 0.16,
    size: 0.07,
  });

  const PURPLE = cel("#c957ff", "#5d198c", {
    threshold: 0.02,
  });

  const CYAN = cel("#72faff", "#147ca4", {
    threshold: 0.02,
  });

  const CRIMSON = cel("#ed4960", "#681d3b", {
    threshold: 0.05,
  });

  const INK = "#151326";
  const WHITE = "#f7fbff";
  const BRIGHT_CYAN = "#a6ffff";
  const CRYSTAL_BLUE = "#63eaff";

  // ---------------------------------------------------------------------------------------------------------------
  // Surface drawings and decals
  // ---------------------------------------------------------------------------------------------------------------

  const RUNE_TEXTURE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 256">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M32 8 L46 34 L36 62 L51 88 L28 112 L40 139 L22 165 L34 190 L20 216 L32 248"
          stroke="#65f9ff" stroke-width="7"/>
        <path d="M32 8 L20 32 M36 62 L16 74 M28 112 L49 124 M22 165 L46 177 M20 216 L43 229"
          stroke="#eaffff" stroke-width="4"/>
        <path d="M11 45 Q32 54 53 45 M8 142 Q32 151 56 142"
          stroke="#2e9fd7" stroke-width="3"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const CREST_TEXTURE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <defs>
        <radialGradient id="crest" cx="50%" cy="35%">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset="0.35" stop-color="#8fffff"/>
          <stop offset="1" stop-color="#257fca"/>
        </radialGradient>
      </defs>
      <circle cx="64" cy="64" r="56" fill="#11162d" stroke="#f3c865" stroke-width="5"/>
      <path d="M64 13 L76 44 L108 48 L83 69 L89 103 L64 86 L39 103 L45 69 L20 48 L52 44 Z"
        fill="url(#crest)" stroke="#e7fbff" stroke-width="3" stroke-linejoin="round"/>
      <path d="M64 28 L69 53 L94 61 L69 68 L64 94 L59 68 L34 61 L59 53 Z"
        fill="#c958ff" stroke="#ffffff" stroke-width="2"/>
      <circle cx="64" cy="61" r="7" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  const SERIAL_TEXTURE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 54">
      <rect x="2" y="2" width="216" height="50" rx="7" fill="#111426" stroke="#f4c85a" stroke-width="4"/>
      <path d="M12 14 H208 M12 40 H208" stroke="#34517b" stroke-width="2"/>
      <text x="110" y="34" text-anchor="middle"
        font-family="monospace" font-size="25" font-weight="bold" letter-spacing="3"
        fill="#f9e3a0">LUNA-07</text>
    </svg>`,
    { size: 256 },
  );

  const WARNING_TEXTURE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 64">
      <rect width="160" height="64" rx="8" fill="#24131f" stroke="#ee5261" stroke-width="4"/>
      <path d="M4 58 L42 4 M34 60 L72 4 M64 60 L102 4 M94 60 L132 4 M124 60 L158 10"
        stroke="#f6bd55" stroke-width="9"/>
      <path d="M4 58 L42 4 M34 60 L72 4 M64 60 L102 4 M94 60 L132 4 M124 60 L158 10"
        stroke="#4d2544" stroke-width="3"/>
      <path d="M80 17 L93 42 H67 Z" fill="#fff1bd" stroke="#1c1428" stroke-width="3"/>
      <path d="M80 25 V34 M80 38 V39" stroke="#28152b" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );

  const GRIP_TEXTURE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 256">
      <rect width="128" height="256" fill="#151424"/>
      <path d="M-20 20 L148 62 M-20 70 L148 112 M-20 120 L148 162 M-20 170 L148 212 M-20 220 L148 262"
        stroke="#563c70" stroke-width="18"/>
      <path d="M-20 20 L148 62 M-20 70 L148 112 M-20 120 L148 162 M-20 170 L148 212 M-20 220 L148 262"
        stroke="#b86bc9" stroke-width="4"/>
      <path d="M-20 40 L148 82 M-20 90 L148 132 M-20 140 L148 182 M-20 190 L148 232"
        stroke="#211b3c" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const CORE_TEXTURE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M32 3 L43 23 L61 32 L43 41 L32 61 L21 41 L3 32 L21 23 Z"
        fill="#dfffff" stroke="#8e4bff" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="32" cy="32" r="8" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Greatsword blade
  // ---------------------------------------------------------------------------------------------------------------

  const bladeOutline: [number, number, "sharp"][] = [
    [-0.102, 0.0, "sharp"],
    [0.102, 0.0, "sharp"],
    [0.162, 0.22, "sharp"],
    [0.146, 0.60, "sharp"],
    [0.096, 1.02, "sharp"],
    [0.044, 1.30, "sharp"],
    [0.018, 1.45, "sharp"],
    [0.0, 1.54, "sharp"],
    [-0.018, 1.45, "sharp"],
    [-0.044, 1.30, "sharp"],
    [-0.096, 1.02, "sharp"],
    [-0.146, 0.60, "sharp"],
    [-0.162, 0.22, "sharp"],
  ];

  const blade = b.extrude(bladeOutline, {
    at: [0, 0.74, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.09, 0.042],
    bevel: 0.008,
    smoothing: 1,
    color: BLADE,
    name: "heroBlade",
    group: "blade",
  });

  const fullerOutline: [number, number, "sharp"][] = [
    [-0.026, 0.02, "sharp"],
    [0.026, 0.02, "sharp"],
    [0.038, 0.36, "sharp"],
    [0.024, 0.82, "sharp"],
    [0.014, 1.23, "sharp"],
    [0.0, 1.39, "sharp"],
    [-0.014, 1.23, "sharp"],
    [-0.024, 0.82, "sharp"],
    [-0.038, 0.36, "sharp"],
  ];

  const fuller = b.extrude(fullerOutline, {
    at: [0, 0.76, 0.045],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.015, 0.004],
    bevel: 0.003,
    smoothing: 1,
    color: FULLER,
    name: "bladeFuller",
    group: "blade",
  });

  const leftBladeEdge = b.sweep(
    catmull([
      [-0.101, 0.75, 0.050],
      [-0.158, 0.96, 0.048],
      [-0.145, 1.34, 0.041],
      [-0.097, 1.70, 0.034],
      [-0.045, 2.02, 0.029],
      [0.0, 2.28, 0.023],
    ]),
    [0.014, 0.008],
    {
      color: BLADE_EDGE,
      section: { ngon: 8 },
      caps: { start: "round", end: "point" },
      name: "bladeEdgeL",
      group: "blade",
    },
  );

  const rightBladeEdge = b.sweep(
    catmull([
      [0.101, 0.75, 0.050],
      [0.158, 0.96, 0.048],
      [0.145, 1.34, 0.041],
      [0.097, 1.70, 0.034],
      [0.045, 2.02, 0.029],
      [0.0, 2.28, 0.023],
    ]),
    [0.014, 0.008],
    {
      color: BLADE_EDGE,
      section: { ngon: 8 },
      caps: { start: "round", end: "point" },
      name: "bladeEdgeR",
      group: "blade",
    },
  );

  const bladeSpine = b.sweep(
    catmull([
      [0, 0.78, 0.057],
      [0, 1.08, 0.051],
      [0, 1.44, 0.046],
      [0, 1.79, 0.040],
      [0, 2.11, 0.034],
      [0, 2.255, 0.027],
    ]),
    [0.010, 0.004],
    {
      color: CYAN,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      name: "luminousBladeSpine",
      group: "blade",
    },
  );

  const bladeShoulder = b.frustumBox(
    [-0.18, 0.75, -0.01],
    [0.18, 0.75, -0.01],
    [0.08, 0.06],
    [0.08, 0.06],
    {
      color: DARK_IRON,
      name: "bladeShoulder",
      group: "blade",
    },
  );

  // A narrow blue-steel plate on the rear of the blade makes the silhouette read as forged rather than magical-only.
  const rearBladePlate = b.extrude(
    [
      [-0.070, 0.12, "sharp"],
      [0.070, 0.12, "sharp"],
      [0.092, 0.38, "sharp"],
      [0.060, 0.78, "sharp"],
      [0.020, 1.22, "sharp"],
      [0.0, 1.37, "sharp"],
      [-0.020, 1.22, "sharp"],
      [-0.060, 0.78, "sharp"],
      [-0.092, 0.38, "sharp"],
    ],
    {
      at: [0, 0.78, -0.048],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.003,
      smoothing: 1,
      color: FULLER,
      name: "rearBladePlate",
      group: "blade",
    },
  );

  // The four serrations are deliberately short and broad, like stylized Final Fantasy manufacturing details.
  const serrationYs = [1.01, 1.18, 1.35, 1.52];
  for (let i = 0; i < serrationYs.length; i++) {
    const y = serrationYs[i];
    const edgeX = -(0.155 - (y - 0.96) * 0.055);
    b.spike(
      [edgeX, y, 0.010],
      [-1, 0, -0.04],
      0.072,
      0.020,
      {
        color: FULLER,
        name: `bladeSerrationL${i}`,
        group: "blade",
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Integrated gun receiver
  // ---------------------------------------------------------------------------------------------------------------

  const receiverLower = b.frustumBox(
    [0, 0.76, -0.035],
    [0, 1.28, 0.035],
    [0.255, 0.145],
    [0.215, 0.125],
    {
      color: DARK_IRON,
      section: "box",
      name: "receiverLower",
      group: "firearm",
    },
  );

  const receiverUpper = b.frustumBox(
    [0, 1.23, 0.035],
    [0, 1.82, 0.135],
    [0.215, 0.125],
    [0.145, 0.095],
    {
      color: BLACK_STEEL,
      section: "box",
      name: "receiverUpper",
      group: "firearm",
    },
  );

  const receiverTopRail = b.rod(
    [-0.105, 1.34, 0.135],
    [0.105, 1.86, 0.220],
    0.018,
    {
      color: GOLD,
      section: { ngon: 6 },
      name: "receiverTopRail",
      group: "firearm",
    },
  );

  const receiverLowerRail = b.rod(
    [-0.145, 0.86, 0.090],
    [-0.115, 1.20, 0.145],
    0.015,
    {
      color: BRONZE,
      section: { ngon: 6 },
      name: "receiverLowerRail",
      group: "firearm",
    },
  );

  const receiverFrontBlock = b.part(
    new THREE.BoxGeometry(0.31, 0.16, 0.15),
    BLACK_STEEL,
    {
      at: [0, 0.91, 0.020],
      rotation: [0, 0, 0],
      flat: true,
      name: "receiverFrontBlock",
      group: "firearm",
    },
  );

  const receiverEndCap = b.part(
    new THREE.CylinderGeometry(0.105, 0.105, 0.08, 8),
    GOLD,
    {
      at: [0, 1.81, 0.135],
      dir: [0, 0.985, 0.17],
      flat: true,
      name: "receiverEndCap",
      group: "firearm",
    },
  );

  const barrelPath = catmull([
    [0.205, 1.03, 0.105],
    [0.215, 1.36, 0.155],
    [0.215, 1.70, 0.215],
    [0.205, 2.00, 0.270],
    [0.200, 2.075, 0.285],
  ]);

  const barrel = b.sweep(barrelPath, [0.058, 0.040], {
    color: BLACK_STEEL,
    section: { ngon: 8 },
    caps: { start: "flat", end: "flat" },
    name: "longGunBarrel",
    group: "firearm",
  });

  const barrelDir = p(0, 0.985, 0.17).normalize();
  const barrelEnd = p(0.2, 2.075, 0.285);

  const muzzleCollar = b.part(
    new THREE.CylinderGeometry(0.074, 0.060, 0.105, 8),
    GOLD,
    {
      at: barrelEnd.clone().addScaledVector(barrelDir, 0.030),
      dir: barrelDir,
      flat: true,
      name: "muzzleCollar",
      group: "firearm",
    },
  );

  const muzzleSocket = b.part(
    new THREE.CylinderGeometry(0.052, 0.052, 0.078, 8),
    DARK_IRON,
    {
      at: barrelEnd.clone().addScaledVector(barrelDir, 0.070),
      dir: barrelDir,
      flat: true,
      name: "muzzleSocket",
      group: "firearm",
    },
  );

  const muzzleEnd = barrelEnd.clone().addScaledVector(barrelDir, 0.112);

  const muzzleCore = b.part(
    new THREE.CircleGeometry(0.040, 12),
    "#20244a",
    {
      at: muzzleEnd,
      dir: barrelDir,
      axis: "z",
      name: "muzzleCore",
      group: "firearm",
    },
  );

  glow(muzzleCore, 1.35);

  const barrelBandTs = [0.24, 0.49, 0.73];
  for (let i = 0; i < barrelBandTs.length; i++) {
    const center = barrelPath.at(barrelBandTs[i]);
    const direction = barrelPath.tangentAt(barrelBandTs[i]).normalize();
    b.part(
      new THREE.CylinderGeometry(0.065, 0.065, 0.030, 8),
      GOLD,
      {
        at: center,
        dir: direction,
        flat: true,
        name: `barrelBand${i}`,
        group: "firearm",
      },
    );
  }

  const barrelUnderside = b.rod(
    [0.125, 1.02, 0.085],
    [0.135, 1.83, 0.220],
    0.017,
    {
      color: DARK_IRON,
      section: { ngon: 6 },
      name: "barrelUnderside",
      group: "firearm",
    },
  );

  const barrelSight = b.spike(
    [0.205, 1.79, 0.245],
    [0, 1, 0],
    0.092,
    0.019,
    {
      color: GOLD,
      name: "barrelSight",
      group: "firearm",
    },
  );

  const sightGuard = b.rod(
    [0.145, 1.77, 0.237],
    [0.265, 1.77, 0.258],
    0.012,
    {
      color: BRONZE,
      section: { ngon: 6 },
      name: "sightGuard",
      group: "firearm",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Rotating chamber and front-facing mechanical ornament
  // ---------------------------------------------------------------------------------------------------------------

  const drum = b.part(
    new THREE.CylinderGeometry(0.135, 0.135, 0.082, 12),
    DARK_IRON,
    {
      at: [0, 1.105, 0.105],
      dir: [0, 0, 1],
      flat: true,
      name: "rotatingChamber",
      group: "firearm",
    },
  );

  const drumFaceRing = b.part(
    new THREE.TorusGeometry(0.113, 0.012, 6, 16),
    GOLD,
    {
      at: [0, 1.105, 0.155],
      dir: [0, 0, 1],
      flat: true,
      name: "chamberFaceRing",
      group: "firearm",
    },
  );

  const drumInnerRing = b.part(
    new THREE.TorusGeometry(0.072, 0.007, 6, 12),
    BRONZE,
    {
      at: [0, 1.105, 0.162],
      dir: [0, 0, 1],
      flat: true,
      name: "chamberInnerRing",
      group: "firearm",
    },
  );

  const drumHub = b.part(
    new THREE.CylinderGeometry(0.043, 0.043, 0.055, 10),
    GOLD,
    {
      at: [0, 1.105, 0.174],
      dir: [0, 0, 1],
      flat: true,
      name: "chamberHub",
      group: "firearm",
    },
  );

  const drumBoltAngles = [0, 60, 120, 180, 240, 300];
  for (let i = 0; i < drumBoltAngles.length; i++) {
    const a = (drumBoltAngles[i] * Math.PI) / 180;
    const bolt = b.part(
      new THREE.SphereGeometry(0.014, 6, 4),
      GOLD,
      {
        at: [
          Math.sin(a) * 0.103,
          1.105 + Math.cos(a) * 0.103,
          0.183,
        ],
        flat: true,
        name: `chamberBolt${i}`,
        group: "firearm",
      },
    );
  }

  const chamberHit = b.surface(drum).nearest([0, 1.105, 0.35]);
  const chamberCrest = b.decal(drum, CREST_TEXTURE, {
    at: chamberHit,
    size: [0.112, 0.112],
    segments: 8,
    lift: 0.002,
    name: "chamberCrest",
    group: "decals",
  });

  glow(chamberCrest, 0.4);

  // ---------------------------------------------------------------------------------------------------------------
  // Receiver side plates
  // ---------------------------------------------------------------------------------------------------------------

  const sidePlateOutline: [number, number, "sharp"][] = [
    [-0.135, 0.0, "sharp"],
    [0.115, 0.0, "sharp"],
    [0.145, 0.08, "sharp"],
    [0.112, 0.27, "sharp"],
    [0.030, 0.34, "sharp"],
    [-0.095, 0.28, "sharp"],
    [-0.145, 0.12, "sharp"],
  ];

  const sidePlateLeft = b.extrude(sidePlateOutline, {
    at: [0.215, 0.84, 0.0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.030,
    bevel: 0.004,
    smoothing: 1,
    color: GOLD,
    name: "receiverSidePlateL",
    group: "firearm",
  });

  const sidePlateRight = b.extrude(sidePlateOutline, {
    at: [-0.215, 0.84, 0.0],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.030,
    bevel: 0.004,
    smoothing: 1,
    color: GOLD,
    name: "receiverSidePlateR",
    group: "firearm",
  });

  const sidePlateInnerLeft = b.extrude(
    [
      [-0.100, 0.045, "sharp"],
      [0.082, 0.045, "sharp"],
      [0.095, 0.11, "sharp"],
      [0.070, 0.23, "sharp"],
      [-0.065, 0.23, "sharp"],
      [-0.102, 0.12, "sharp"],
    ],
    {
      at: [0.233, 0.86, 0.0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.002,
      color: DARK_IRON,
      name: "receiverSideInsetL",
      group: "firearm",
    },
  );

  const sidePlateInnerRight = b.extrude(
    [
      [-0.100, 0.045, "sharp"],
      [0.082, 0.045, "sharp"],
      [0.095, 0.11, "sharp"],
      [0.070, 0.23, "sharp"],
      [-0.065, 0.23, "sharp"],
      [-0.102, 0.12, "sharp"],
    ],
    {
      at: [-0.233, 0.86, 0.0],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.002,
      color: DARK_IRON,
      name: "receiverSideInsetR",
      group: "firearm",
    },
  );

  const sideRivetPositions = [
    [0.248, 0.915, 0.105],
    [0.248, 1.075, 0.105],
    [-0.248, 0.915, 0.105],
    [-0.248, 1.075, 0.105],
  ];

  for (let i = 0; i < sideRivetPositions.length; i++) {
    const x = sideRivetPositions[i][0];
    b.part(
      new THREE.CylinderGeometry(0.018, 0.018, 0.018, 8),
      GOLD,
      {
        at: sideRivetPositions[i],
        dir: [x > 0 ? 1 : -1, 0, 0],
        flat: true,
        name: `sideRivet${i}`,
        group: "firearm",
      },
    );
  }

  const sideSurface = b.surface(sidePlateLeft);
  const warningHit = sideSurface.nearest([0.36, 1.01, 0.0]);

  const warningDecal = b.decal(sidePlateLeft, WARNING_TEXTURE, {
    at: warningHit,
    size: [0.105, 0.050],
    up: [0, 1, 0],
    segments: 5,
    lift: 0.002,
    name: "warningDecal",
    group: "decals",
  });

  const receiverSurface = b.surface([receiverLower, receiverUpper]);
  const serialHit = receiverSurface.nearest([0, 1.46, 0.35]);

  const serialDecal = b.decal([receiverLower, receiverUpper], SERIAL_TEXTURE, {
    at: serialHit,
    size: [0.145, 0.043],
    up: [0, 1, 0],
    segments: 6,
    lift: 0.002,
    name: "serialPlate",
    group: "decals",
  });

  // Deterministic rivets are scattered only across upward/front-facing receiver facets.
  const receiverRivets = receiverSurface.scatter(11, {
    rng: rng(71),
    minDist: 0.060,
    filter: (hit) => hit.n.z > 0.38 && hit.n.y > -0.45,
  });

  for (let i = 0; i < receiverRivets.length; i++) {
    b.stick(
      new THREE.SphereGeometry(0.013, 6, 4),
      GOLD,
      receiverRivets[i],
      {
        embed: 0.35,
        name: `receiverRivet${i}`,
        group: "firearm",
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Blade markings and luminous filigree
  // ---------------------------------------------------------------------------------------------------------------

  const bladeSurface = b.surface(blade);

  const runeHit = bladeSurface.nearest([0, 1.88, 0.20]);
  const runeDecal = b.decal(blade, RUNE_TEXTURE, {
    at: runeHit,
    dir: [0, 0, 1],
    up: [0, 1, 0],
    size: [0.065, 0.285],
    segments: 8,
    lift: 0.003,
    name: "frontRune",
    group: "decals",
  });

  glow(runeDecal, 0.85);

  const bladeCrestHit = bladeSurface.nearest([0, 2.075, 0.20]);
  const bladeCrestDecal = b.decal(blade, CREST_TEXTURE, {
    at: bladeCrestHit,
    dir: [0, 0, 1],
    up: [0, 1, 0],
    size: [0.105, 0.105],
    segments: 8,
    lift: 0.003,
    name: "bladeCrest",
    group: "decals",
  });

  glow(bladeCrestDecal, 0.55);

  const rearRuneHit = bladeSurface.nearest([0, 1.56, -0.20]);
  const rearRuneDecal = b.decal(blade, RUNE_TEXTURE, {
    at: rearRuneHit,
    dir: [0, 0, -1],
    up: [0, 1, 0],
    size: [0.050, 0.225],
    segments: 7,
    lift: 0.003,
    mirror: true,
    name: "rearRune",
    group: "decals",
  });

  glow(rearRuneDecal, 0.45);

  const bladeStudYs = [1.23, 1.47, 1.71, 1.95];
  for (let i = 0; i < bladeStudYs.length; i++) {
    const hit = bladeSurface.nearest([0, bladeStudYs[i], 0.22]);
    b.stick(
      new THREE.CylinderGeometry(0.017, 0.017, 0.010, 8),
      GOLD,
      hit,
      {
        embed: 0.42,
        name: `bladeStud${i}`,
        group: "blade",
      },
    );
  }

  // Thin ornamental diagonals make the broad blade catch light in several bold facets.
  b.rod(
    [-0.072, 0.88, 0.052],
    [-0.035, 1.21, 0.045],
    0.006,
    {
      color: GOLD,
      section: { ngon: 6 },
      name: "bladeFiligreeL1",
      group: "blade",
    },
  );

  b.rod(
    [0.072, 0.88, 0.052],
    [0.035, 1.21, 0.045],
    0.006,
    {
      color: GOLD,
      section: { ngon: 6 },
      name: "bladeFiligreeR1",
      group: "blade",
    },
  );

  b.rod(
    [-0.052, 1.30, 0.042],
    [-0.020, 1.57, 0.037],
    0.005,
    {
      color: CYAN,
      section: { ngon: 6 },
      name: "bladeFiligreeL2",
      group: "blade",
    },
  );

  b.rod(
    [0.052, 1.30, 0.042],
    [0.020, 1.57, 0.037],
    0.005,
    {
      color: CYAN,
      section: { ngon: 6 },
      name: "bladeFiligreeR2",
      group: "blade",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Crossguard and trigger assembly
  // ---------------------------------------------------------------------------------------------------------------

  const crossguardPath = catmull([
    [-0.405, 0.785, -0.105],
    [-0.315, 0.820, -0.105],
    [-0.190, 0.805, -0.105],
    [0.0, 0.785, -0.105],
    [0.190, 0.805, -0.105],
    [0.315, 0.820, -0.105],
    [0.405, 0.785, -0.105],
  ]);

  const crossguard = b.sweep(crossguardPath, 0.045, {
    color: GOLD,
    section: { ngon: 8 },
    caps: "round",
    name: "ornateCrossguard",
    group: "guard",
  });

  b.spike(
    [-0.385, 0.790, -0.105],
    [0, 1, 0],
    0.125,
    0.045,
    {
      color: GOLD,
      name: "guardQuillonL",
      group: "guard",
    },
  );

  b.spike(
    [0.385, 0.790, -0.105],
    [0, 1, 0],
    0.125,
    0.045,
    {
      color: GOLD,
      name: "guardQuillonR",
      group: "guard",
    },
  );

  const guardCenter = b.part(
    new THREE.CylinderGeometry(0.112, 0.112, 0.084, 10),
    BRONZE,
    {
      at: [0, 0.765, -0.105],
      dir: [0, 1, 0],
      flat: true,
      name: "guardCenter",
      group: "guard",
    },
  );

  const guardCenterRing = b.part(
    new THREE.TorusGeometry(0.103, 0.010, 6, 14),
    GOLD,
    {
      at: [0, 0.765, -0.105],
      dir: [0, 1, 0],
      flat: true,
      name: "guardCenterRing",
      group: "guard",
    },
  );

  const guardGemL = b.part(
    new THREE.OctahedronGeometry(0.048, 0),
    CRYSTAL_BLUE,
    {
      at: [-0.405, 0.785, -0.105],
      scale: [0.82, 1.18, 0.82],
      flat: true,
      name: "guardGemL",
      group: "guard",
    },
  );

  const guardGemR = b.part(
    new THREE.OctahedronGeometry(0.048, 0),
    "#d478ff",
    {
      at: [0.405, 0.785, -0.105],
      scale: [0.82, 1.18, 0.82],
      flat: true,
      name: "guardGemR",
      group: "guard",
    },
  );

  glow(guardGemL, 1.25);
  glow(guardGemR, 1.15);

  const triggerGuard = b.sweep(
    catmull([
      [-0.145, 0.750, 0.115],
      [-0.155, 0.645, 0.120],
      [-0.110, 0.555, 0.125],
      [0.0, 0.520, 0.128],
      [0.110, 0.555, 0.125],
      [0.155, 0.645, 0.120],
      [0.145, 0.750, 0.115],
    ]),
    0.020,
    {
      color: BLACK_STEEL,
      section: { ngon: 8 },
      caps: "round",
      name: "triggerGuard",
      group: "guard",
    },
  );

  const trigger = b.sweep(
    bezier(
      [0, 0.748, 0.145],
      [0, 0.690, 0.162],
      [0, 0.625, 0.152],
      [0, 0.590, 0.136],
    ),
    [0.021, 0.010],
    {
      color: CRIMSON,
      section: { ngon: 8 },
      caps: { start: "round", end: "point" },
      name: "crimsonTrigger",
      group: "guard",
    },
  );

  const triggerPin = b.part(
    new THREE.SphereGeometry(0.025, 7, 5),
    GOLD,
    {
      at: [0, 0.750, 0.144],
      flat: true,
      name: "triggerPin",
      group: "guard",
    },
  );

  const guardFinL = b.extrude(
    [
      [0, 0, "sharp"],
      [0.13, 0.02, "sharp"],
      [0.18, 0.10, "sharp"],
      [0.10, 0.14, "sharp"],
      [0.02, 0.08, "sharp"],
    ],
    {
      at: [-0.285, 0.785, -0.115],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.003,
      color: BRONZE,
      name: "guardFinL",
      group: "guard",
    },
  );

  const guardFinR = b.extrude(
    [
      [0, 0, "sharp"],
      [-0.13, 0.02, "sharp"],
      [-0.18, 0.10, "sharp"],
      [-0.10, 0.14, "sharp"],
      [-0.02, 0.08, "sharp"],
    ],
    {
      at: [0.285, 0.785, -0.115],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.003,
      color: BRONZE,
      name: "guardFinR",
      group: "guard",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Wrapped grip
  // ---------------------------------------------------------------------------------------------------------------

  const handleBottom = p(0, 0.205, -0.420);
  const handleTop = p(0, 0.715, -0.145);
  const handleCenter = handleBottom.clone().add(handleTop).multiplyScalar(0.5);
  const handleDirection = handleTop.clone().sub(handleBottom).normalize();
  const handleLength = handleTop.distanceTo(handleBottom);

  const grip = b.part(
    new THREE.CylinderGeometry(0.098, 0.114, handleLength, 8, 1, false),
    DARK_IRON,
    {
      at: handleCenter,
      dir: handleDirection,
      texture: GRIP_TEXTURE,
      flat: true,
      name: "wrappedGrip",
      group: "grip",
    },
  );

  const gripUpperSocket = b.part(
    new THREE.CylinderGeometry(0.108, 0.108, 0.075, 10),
    GOLD,
    {
      at: handleTop,
      dir: handleDirection,
      flat: true,
      name: "gripUpperSocket",
      group: "grip",
    },
  );

  const addGripBand = (t: number, color: any, index: number) => {
    const center = handleBottom.clone().lerp(handleTop, t);
    const bandRing = b.ring(
      frame(center, handleDirection),
      {
        count: 10,
        radius: 0.108,
        fromDeg: 0,
        toDeg: 360,
      },
    );

    b.sweep(catmull(bandRing.items, { closed: true }), 0.012, {
      color,
      section: { ngon: 8 },
      caps: "none",
      name: `gripBand${index}`,
      group: "grip",
    });
  };

  addGripBand(0.12, GOLD, 0);
  addGripBand(0.30, BRONZE, 1);
  addGripBand(0.48, GOLD, 2);
  addGripBand(0.66, BRONZE, 3);
  addGripBand(0.84, GOLD, 4);

  const gripSeam = b.rod(
    handleBottom.clone().add(p(0, 0, 0.082)),
    handleTop.clone().add(p(0, 0, 0.082)),
    0.006,
    {
      color: PURPLE,
      section: { ngon: 6 },
      name: "gripSeam",
      group: "grip",
    },
  );

  const gripEndCap = b.part(
    new THREE.CylinderGeometry(0.116, 0.116, 0.060, 10),
    BRONZE,
    {
      at: handleBottom,
      dir: handleDirection,
      flat: true,
      name: "gripEndCap",
      group: "grip",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Pommel and mana crystal
  // ---------------------------------------------------------------------------------------------------------------

  const pommel = b.lathe(
    [
      [0.0, -0.102],
      [0.080, -0.102],
      [0.125, -0.070],
      [0.145, -0.018],
      [0.132, 0.035],
      [0.092, 0.082],
      [0.052, 0.112],
      [0.0, 0.135],
    ],
    {
      at: [0, 0.125, -0.485],
      axis: [0, 1, 0],
      segments: 12,
      smoothing: 1,
      color: DARK_IRON,
      name: "pommel",
      group: "grip",
    },
  );

  const pommelBand = b.part(
    new THREE.TorusGeometry(0.119, 0.012, 6, 14),
    GOLD,
    {
      at: [0, 0.112, -0.485],
      dir: [0, 1, 0],
      flat: true,
      name: "pommelBand",
      group: "grip",
    },
  );

  const pommelCrown = b.part(
    new THREE.TorusGeometry(0.075, 0.009, 6, 12),
    BRONZE,
    {
      at: [0, 0.188, -0.485],
      dir: [0, 1, 0],
      flat: true,
      name: "pommelCrown",
      group: "grip",
    },
  );

  const crystal = b.part(
    new THREE.OctahedronGeometry(0.098, 0),
    CRYSTAL_BLUE,
    {
      at: [0, 0.186, -0.535],
      scale: [0.72, 1.26, 0.67],
      flat: true,
      name: "manaCrystal",
      group: "magic",
    },
  );

  glow(crystal, 1.7);

  const crystalCore = b.part(
    new THREE.SphereGeometry(0.035, 8, 6),
    WHITE,
    {
      at: [0, 0.186, -0.505],
      flat: true,
      name: "manaCrystalCore",
      group: "magic",
    },
  );

  glow(crystalCore, 2.2);

  const coreHit = b.surface(crystal).nearest([0, 0.186, -0.36]);
  const coreMark = b.decal(crystal, CORE_TEXTURE, {
    at: coreHit,
    dir: [0, 0, 1],
    up: [0, 1, 0],
    size: [0.050, 0.050],
    segments: 5,
    lift: 0.002,
    name: "crystalMark",
    group: "magic",
  });

  glow(coreMark, 1.6);

  const pommelSpur = b.spike(
    [0, 0.055, -0.485],
    [0, -1, 0],
    0.048,
    0.029,
    {
      color: GOLD,
      name: "pommelSpur",
      group: "grip",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Final luminous details
  // ---------------------------------------------------------------------------------------------------------------

  const receiverGem = b.part(
    new THREE.OctahedronGeometry(0.038, 0),
    "#ca55ff",
    {
      at: [0, 1.395, 0.205],
      scale: [0.72, 1.24, 0.58],
      flat: true,
      name: "receiverManaGem",
      group: "magic",
    },
  );

  glow(receiverGem, 1.35);

  const receiverGemRing = b.part(
    new THREE.TorusGeometry(0.048, 0.006, 5, 10),
    GOLD,
    {
      at: [0, 1.395, 0.205],
      dir: [0, 0, 1],
      flat: true,
      name: "receiverManaGemRing",
      group: "magic",
    },
  );

  const smallRuneL = b.sweep(
    bezier(
      [-0.105, 1.48, 0.205],
      [-0.132, 1.56, 0.220],
      [-0.112, 1.64, 0.235],
    ),
    [0.007, 0.002],
    {
      color: CYAN,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      name: "receiverRuneL",
      group: "magic",
    },
  );

  const smallRuneR = b.sweep(
    bezier(
      [0.105, 1.48, 0.205],
      [0.132, 1.56, 0.220],
      [0.112, 1.64, 0.235],
    ),
    [0.007, 0.002],
    {
      color: CYAN,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      name: "receiverRuneR",
      group: "magic",
    },
  );

  const bladeBaseRune = b.sweep(
    bezier(
      [-0.050, 0.815, 0.062],
      [-0.078, 0.850, 0.066],
      [-0.055, 0.895, 0.063],
    ),
    [0.006, 0.002],
    {
      color: CYAN,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      name: "bladeBaseRuneL",
      group: "magic",
    },
  );

  const bladeBaseRuneR = b.sweep(
    bezier(
      [0.050, 0.815, 0.062],
      [0.078, 0.850, 0.066],
      [0.055, 0.895, 0.063],
    ),
    [0.006, 0.002],
    {
      color: CYAN,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      name: "bladeBaseRuneR",
      group: "magic",
    },
  );

  // Two small energy beads sit at the blade throat where the firearm and sword functions meet.
  const throatBeadL = b.part(
    new THREE.SphereGeometry(0.024, 7, 5),
    BRIGHT_CYAN,
    {
      at: [-0.090, 0.825, 0.075],
      flat: true,
      name: "throatBeadL",
      group: "magic",
    },
  );

  const throatBeadR = b.part(
    new THREE.SphereGeometry(0.024, 7, 5),
    BRIGHT_CYAN,
    {
      at: [0.090, 0.825, 0.075],
      flat: true,
      name: "throatBeadR",
      group: "magic",
    },
  );

  glow(throatBeadL, 1.35);
  glow(throatBeadR, 1.35);

  // The final tip cap is a tiny gold point just below the sword's apex.
  const tipCap = b.part(
    new THREE.OctahedronGeometry(0.030, 0),
    GOLD,
    {
      at: [0, 2.235, 0.025],
      scale: [0.75, 1.25, 0.75],
      flat: true,
      name: "bladeTipCap",
      group: "blade",
    },
  );

  return b.root;
}
```