```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  bezier,
  catmull,
  paint,
  mottle,
  scales,
  grain,
  noise,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Lighthouse Cove Diorama",
  description:
    "A cozy diorama: a red-and-white lighthouse with a glowing lantern and iron gallery, a keeper's cottage with a crooked chimney and blue door, a wooden jetty with a moored rowboat, two seagulls, grass and wildflowers on a rocky island, in turquoise water with foam, on a round wooden display base.",
};

const D = Math.PI / 180;
type P3 = [number, number, number];

// ---------- palette ----------
const RED = "#d23b33";
const WHITE = "#f6f1e6";
const STONE = "#9a958c";
const STONE_D = "#6f6b66";
const IRON = "#22262b";
const GLOW = "#ffd34d";
const HOT = "#fff4c4";
const ROOF_RED = "#c7362f";
const WALL_A = "#f3e8cf";
const WALL_B = "#e5d3b0";
const SLATE = "#3f4b5e";
const SLATE_E = "#2a3242";
const BRICK = "#a24b36";
const MORTAR = "#d9c7ae";
const DOOR = "#2f6fb5";
const BRASS = "#c9a24a";
const WOOD = "#9a6b40";
const WOOD_L = "#b6844f";
const WOOD_D = "#6a4526";
const ROPE = "#d8c08a";
const FOAM = "#f4fbff";
const SHALLOW = "#5fd8c8";
const MID = "#2fb3b4";
const DEEP = "#1b8798";
const GULL_GRAY = "#9eabb8";
const INK = "#1d1f24";
const BEAK = "#f2c230";
const LEG = "#e8955a";
const SMOKE = "#e6ebef";
const HULL = "#f4efe2";

export default function build() {
  const b = createBuilder({ name: "lighthouseDiorama", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });

  const R0 = rng(11) as unknown as any;
  const rand: () => number = typeof R0 === "function" ? () => R0() : () => R0.next();

  // ---------- textures ----------
  const grassTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M3 32 L7 8 L10 32Z" fill="#3f7d34"/>
      <path d="M8 32 L13 2 L16 32Z" fill="#5a9e3f"/>
      <path d="M14 32 L19 6 L21 32Z" fill="#4a8a37"/>
      <path d="M19 32 L26 10 L25 32Z" fill="#6cb04a"/>
      <path d="M24 32 L30 15 L29 32Z" fill="#3f7d34"/>
    </svg>`,
    { size: 128 },
  );
  const flowerTex = (c: string, centre: string) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48">
        <rect x="15" y="18" width="2.4" height="30" fill="#3f7d34"/>
        <path d="M16 42 Q7 36 8 28 Q14 32 16.5 39Z" fill="#5a9e3f"/>
        <g fill="${c}"><circle cx="16" cy="8" r="5"/><circle cx="9" cy="13" r="5"/><circle cx="23" cy="13" r="5"/><circle cx="11" cy="20" r="5"/><circle cx="21" cy="20" r="5"/></g>
        <circle cx="16" cy="14" r="4" fill="${centre}"/>
      </svg>`,
      { size: 128 },
    );
  const flowers = [
    flowerTex("#ffd23f", "#e07a1f"),
    flowerTex("#f48fb1", "#ffe066"),
    flowerTex("#9b7be0", "#ffe066"),
    flowerTex("#ffffff", "#f2b51d"),
  ];
  const cottageWin = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect x="0" y="0" width="32" height="32" fill="#f7f3ea"/>
      <rect x="4" y="4" width="24" height="24" fill="#ffc94f"/>
      <rect x="4" y="18" width="24" height="10" fill="#ffe7a0"/>
      <path d="M4 28 L12 28 L4 10Z" fill="#d0574f"/>
      <path d="M28 28 L20 28 L28 10Z" fill="#d0574f"/>
      <rect x="14.5" y="4" width="3" height="24" fill="#f7f3ea"/>
      <rect x="4" y="14.5" width="24" height="3" fill="#f7f3ea"/>
    </svg>`,
    { size: 128 },
  );
  const towerWin = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 24">
      <path d="M2 24 L2 9 A6 6 0 0 1 14 9 L14 24Z" fill="#f4f1e8"/>
      <path d="M4 22 L4 9.5 A4 4 0 0 1 12 9.5 L12 22Z" fill="#ffcf5a"/>
      <rect x="7.3" y="5" width="1.4" height="18" fill="#f4f1e8"/>
      <rect x="4" y="14" width="8" height="1.4" fill="#f4f1e8"/>
    </svg>`,
    { size: 128 },
  );
  const towerDoor = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 32">
      <path d="M1 32 L1 10 A9 9 0 0 1 19 10 L19 32Z" fill="#2b2b2b"/>
      <path d="M3 32 L3 10.5 A7 7 0 0 1 17 10.5 L17 32Z" fill="#2f6b4f"/>
      <rect x="7.2" y="4" width="1.2" height="28" fill="#1e4a36"/>
      <rect x="11.6" y="4" width="1.2" height="28" fill="#1e4a36"/>
      <circle cx="14.5" cy="20" r="1.4" fill="#e3c46a"/>
    </svg>`,
    { size: 128 },
  );
  const plaqueText = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 40">
      <text x="120" y="28" font-family="Georgia, serif" font-size="22" font-weight="bold" text-anchor="middle" fill="#3a2a12" letter-spacing="2">LIGHTHOUSE COVE</text>
    </svg>`,
    { size: 1024 },
  );

  // ---------- paints ----------
  const wood = grain(WOOD_D, "#7a5030", { size: 0.012, axis: "x", seed: 2 });
  const rockPaints = [
    mottle("#8a8f96", "#6c7178", { size: 0.02, seed: 3 }),
    mottle("#a39e94", "#7f7a72", { size: 0.02, seed: 4 }),
    mottle("#787e88", "#5b6069", { size: 0.018, seed: 5 }),
  ];
  const grassPaint = mottle("#6cb04a", "#4f9438", { size: 0.03, seed: 6 });
  const wallPaint = mottle(WALL_A, WALL_B, { size: 0.015, contrast: 0.6, seed: 7 });
  const roofPaint = scales(SLATE, SLATE_E, { size: 0.008, seed: 8 });
  const brick = paint((p) => {
    const row = Math.floor(p.y / 0.004);
    const u = (p.x + p.z) / 0.007 + (row % 2) * 0.5;
    const fy = p.y / 0.004 - row;
    const fu = u - Math.floor(u);
    return fy < 0.18 || fu < 0.12 ? MORTAR : BRICK;
  });
  const water = paint((p) => {
    const r = Math.hypot(p.x, p.z);
    const nz = noise(p, 0.03, 3);
    if (r < 0.188 + nz * 0.018) return FOAM;
    const ripple = Math.sin(r * 170 + nz * 9);
    if (r < 0.25 && ripple > 0.94) return "#c9f3ee";
    if (r < 0.215 + nz * 0.03) return SHALLOW;
    if (r < 0.27 + nz * 0.02) return MID;
    return DEEP;
  });

  // ---------- display base ----------
  b.lathe(
    [
      [0, 0],
      [0.33, 0],
      [0.334, 0.006],
      [0.33, 0.022],
      [0.318, 0.026],
      [0.318, 0.05],
      [0.312, 0.055],
      [0, 0.055],
    ],
    { at: [0, 0, 0], segments: 32, color: wood, bone: root, name: "base" },
  );
  b.part(new THREE.TorusGeometry(0.332, 0.003, 4, 32), BRASS, {
    bone: root,
    at: [0, 0.013, 0],
    rotation: [90, 0, 0],
    name: "baseTrim",
  });
  b.part(new THREE.BoxGeometry(0.125, 0.022, 0.012), BRASS, {
    bone: root,
    at: [0, 0.036, 0.316],
    flat: true,
    name: "plaque",
  });
  b.part(new THREE.PlaneGeometry(0.11, 0.0183), "#ffffff", {
    bone: root,
    at: [0, 0.036, 0.3225],
    dir: [0, 0, 1],
    axis: "z",
    texture: plaqueText,
    name: "plaqueText",
  });

  // ---------- water ----------
  b.part(new THREE.CylinderGeometry(0.306, 0.306, 0.023, 40, 1), water, {
    bone: root,
    at: [0, 0.0635, 0],
    name: "water",
  });

  // ---------- island ----------
  const rockIsland = b.lathe(
    [
      [0, 0.066],
      [0.172, 0.066],
      [0.177, 0.078],
      [0.166, 0.1],
      [0.15, 0.116],
      [0, 0.118],
    ],
    { at: [0, 0, 0], segments: 11, spin: 13, color: rockPaints[0], bone: root, name: "islandRock" },
  );
  const grass = b.lathe(
    [
      [0, 0.112],
      [0.152, 0.112],
      [0.157, 0.117],
      [0.14, 0.125],
      [0.08, 0.13],
      [0, 0.132],
    ],
    { at: [0, 0, 0], segments: 13, smoothing: 1, color: grassPaint, bone: root, name: "islandGrass" },
  );

  // boulders round the shore
  const jettyAng = Math.atan2(0.1, 0.135) / D;
  for (let i = 0; i < 32; i++) {
    const ang = i * (360 / 32) + (rand() - 0.5) * 8;
    let dA = Math.abs(((ang - jettyAng + 540) % 360) - 180);
    const back = Math.abs(((ang - 236 + 540) % 360) - 180) < 35;
    let s = 0.015 + rand() * 0.014 + (back ? 0.014 : 0);
    if (dA < 10) s *= 0.5;
    const r = 0.155 + rand() * 0.02;
    const y = 0.08 + rand() * 0.018 + (back ? 0.012 : 0);
    b.part(new THREE.DodecahedronGeometry(1, 0), rockPaints[i % 3], {
      bone: root,
      at: [Math.sin(ang * D) * r, y, Math.cos(ang * D) * r],
      rotation: [rand() * 90, rand() * 180, rand() * 90],
      scale: [s * (0.9 + rand() * 0.4), s * 0.75, s * (0.9 + rand() * 0.4)],
      flat: true,
      name: `boulder${i}`,
    });
  }
  // little rocks out in the water
  const outRocks: P3[] = [
    [-0.2, 0.072, 0.15],
    [-0.235, 0.07, -0.08],
    [0.22, 0.07, -0.12],
  ];
  outRocks.forEach((p, i) => {
    const s = 0.014 + i * 0.004;
    b.part(new THREE.DodecahedronGeometry(1, 0), rockPaints[(i + 1) % 3], {
      bone: root,
      at: p,
      rotation: [rand() * 90, rand() * 180, 0],
      scale: [s, s * 0.9, s * 1.1],
      flat: true,
      name: `seaRock${i}`,
    });
    b.part(new THREE.TorusGeometry(s * 1.2, 0.0025, 4, 10), FOAM, {
      bone: root,
      at: [p[0], 0.0755, p[2]],
      rotation: [90, 0, 0],
      name: `seaRockFoam${i}`,
    });
  });

  // foam blobs along the shore
  for (let i = 0; i < 40; i++) {
    const ang = i * 9 + rand() * 6;
    const r = 0.174 + rand() * 0.016;
    b.part(new THREE.IcosahedronGeometry(1, 0), FOAM, {
      bone: root,
      at: [Math.sin(ang * D) * r, 0.0755, Math.cos(ang * D) * r],
      rotation: [0, ang + 90, 0],
      scale: [0.009 + rand() * 0.008, 0.0028, 0.006 + rand() * 0.004],
      flat: true,
      name: `foam${i}`,
    });
  }

  // ---------- lighthouse ----------
  const T = new THREE.Vector3(-0.06, 0.122, -0.04);
  const H = 0.24;
  const top = T.y + H;
  const tower = b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.05, 0.014, "sharp"],
      [0.045, 0.016, "sharp"],
      [0.035, 0.233, "sharp"],
      [0.038, 0.236, "sharp"],
      [0.038, H],
      [0, H],
    ],
    {
      at: [T.x, T.y, T.z],
      segments: 14,
      bone: root,
      name: "tower",
      color: paint((_p, _n, s) =>
        s[0] < 0.0155
          ? STONE
          : s[0] > 0.2335
            ? IRON
            : Math.floor((s[0] - 0.016) / 0.0362) % 2 === 0
              ? RED
              : WHITE,
      ),
    },
  );
  const towerR = (h: number) => 0.045 - (0.01 * (h - 0.016)) / 0.217;
  const onTower = (h: number, angDeg: number): { at: P3; dir: P3 } => {
    const d: P3 = [Math.sin(angDeg * D), 0, Math.cos(angDeg * D)];
    const r = towerR(h);
    return { at: [T.x + d[0] * r, T.y + h, T.z + d[2] * r], dir: d };
  };
  {
    const d = onTower(0.032, 15);
    b.decal(tower, towerDoor, { at: d.at, dir: d.dir, size: [0.02, 0.032], name: "towerDoor" });
    // door step
    b.part(new THREE.BoxGeometry(0.026, 0.006, 0.012), STONE, {
      bone: root,
      at: [T.x + Math.sin(15 * D) * 0.052, T.y + 0.003, T.z + Math.cos(15 * D) * 0.052],
      rotation: [0, 15, 0],
      flat: true,
      name: "towerStep",
    });
  }
  (
    [
      [0.09, 40],
      [0.15, -35],
      [0.205, 25],
      [0.12, 160],
    ] as [number, number][]
  ).forEach(([h, a], i) => {
    const d = onTower(h, a);
    b.decal(tower, towerWin, { at: d.at, dir: d.dir, size: [0.012, 0.018], name: `towerWin${i}` });
  });

  // gallery
  b.lathe(
    [
      [0, 0],
      [0.036, 0],
      [0.053, 0.011],
      [0.053, 0.015],
      [0, 0.015],
    ],
    { at: [T.x, top - 0.004, T.z], segments: 16, color: IRON, bone: root, name: "gallery" },
  );
  const deckTop = top + 0.011;
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.0012, 0.0012, 0.022, 4), IRON, {
      bone: root,
      at: [T.x + Math.sin(a) * 0.049, deckTop + 0.011, T.z + Math.cos(a) * 0.049],
      name: `railPost${i}`,
    });
  }
  for (const h of [0.011, 0.022])
    b.part(new THREE.TorusGeometry(0.049, 0.0014, 4, 28), IRON, {
      bone: root,
      at: [T.x, deckTop + h, T.z],
      rotation: [90, 0, 0],
      name: `rail${h}`,
    });

  // lantern room
  b.part(new THREE.CylinderGeometry(0.031, 0.031, 0.01, 8), ROOF_RED, {
    bone: root,
    at: [T.x, deckTop + 0.005, T.z],
    flat: true,
    name: "lanternBase",
  });
  const glassY = deckTop + 0.01 + 0.017;
  b.part(
    new THREE.CylinderGeometry(0.027, 0.027, 0.034, 8),
    paint((p) => (Math.abs(p.y - glassY) < 0.0075 ? HOT : GLOW)),
    { bone: root, at: [T.x, glassY, T.z], flat: true, name: "lanternGlass" },
  );
  for (let k = 0; k < 8; k++) {
    const a = k * 45 * D;
    b.part(new THREE.BoxGeometry(0.003, 0.034, 0.003), IRON, {
      bone: root,
      at: [T.x + Math.sin(a) * 0.0272, glassY, T.z + Math.cos(a) * 0.0272],
      rotation: [0, k * 45, 0],
      name: `mullion${k}`,
    });
  }
  const glassTop = glassY + 0.017;
  b.part(new THREE.CylinderGeometry(0.031, 0.031, 0.004, 8), IRON, {
    bone: root,
    at: [T.x, glassTop + 0.002, T.z],
    flat: true,
    name: "lanternRing",
  });
  b.lathe(
    [
      [0, 0],
      [0.037, 0],
      [0.036, 0.005],
      [0.022, 0.018],
      [0.008, 0.028],
      [0, 0.03],
    ],
    { at: [T.x, glassTop + 0.004, T.z], segments: 8, spin: 22.5, color: ROOF_RED, bone: root, name: "lanternRoof" },
  );
  const capY = glassTop + 0.004 + 0.03;
  b.part(new THREE.SphereGeometry(0.006, 8, 6), IRON, { bone: root, at: [T.x, capY + 0.003, T.z], name: "vent" });
  b.rod([T.x, capY + 0.006, T.z], [T.x, capY + 0.028, T.z], 0.0011, { color: IRON, sides: 4, bone: root });
  b.part(new THREE.BoxGeometry(0.022, 0.0015, 0.0025), IRON, {
    bone: root,
    at: [T.x, capY + 0.022, T.z],
    rotation: [0, 30, 0],
    name: "vaneArrow",
  });
  b.part(new THREE.ConeGeometry(0.003, 0.006, 4), IRON, {
    bone: root,
    at: [T.x + Math.cos(30 * D) * 0.013, capY + 0.022, T.z - Math.sin(30 * D) * 0.013],
    dir: [Math.cos(30 * D), 0, -Math.sin(30 * D)],
    flat: true,
    name: "vaneTip",
  });

  // ---------- keeper's cottage ----------
  const C0 = new THREE.Vector3(0.07, 0.124, 0.035);
  const yawDeg = 20;
  const yawR = yawDeg * D;
  const UP = new THREE.Vector3(0, 1, 0);
  const cp = (x: number, y: number, z: number): P3 => {
    const v = new THREE.Vector3(x, y, z).applyAxisAngle(UP, yawR).add(C0);
    return [v.x, v.y, v.z];
  };
  const cd = (x: number, y: number, z: number): P3 => {
    const v = new THREE.Vector3(x, y, z).applyAxisAngle(UP, yawR);
    return [v.x, v.y, v.z];
  };
  const yq = (xDeg: number, zDeg = 0) =>
    new THREE.Quaternion().setFromEuler(new THREE.Euler(xDeg * D, yawR, zDeg * D, "YXZ"));

  b.part(new THREE.BoxGeometry(0.091, 0.01, 0.071), STONE_D, { bone: root, at: cp(0, 0.002, 0), quat: yq(0), flat: true, name: "foundation" });
  b.part(new THREE.BoxGeometry(0.085, 0.055, 0.065), wallPaint, { bone: root, at: cp(0, 0.0275, 0), quat: yq(0), flat: true, name: "cottage" });
  b.extrude(
    [
      [-0.058, -0.008],
      [0, 0.046, "sharp"],
      [0.058, -0.008],
      [0.047, -0.008],
      [0, 0.033, "sharp"],
      [-0.047, -0.008],
    ],
    { at: cp(0, 0.055, 0), x: cd(1, 0, 0), y: [0, 1, 0], thickness: 0.082, bevel: 0.001, color: roofPaint, bone: root, name: "roof" },
  );
  b.extrude(
    [
      [-0.0425, 0],
      [0.0425, 0],
      [0, 0.032],
    ],
    { at: cp(0, 0.055, 0), x: cd(1, 0, 0), y: [0, 1, 0], thickness: 0.064, color: wallPaint, bone: root, name: "gable" },
  );
  b.part(new THREE.BoxGeometry(0.006, 0.006, 0.086), SLATE_E, { bone: root, at: cp(0, 0.1, 0), quat: yq(0, 45), flat: true, name: "ridge" });

  // round attic window in the gable
  b.part(new THREE.CircleGeometry(0.0065, 10), "#ffffff", {
    bone: root,
    at: cp(0, 0.068, 0.0325),
    dir: cd(0, 0, 1),
    axis: "z",
    texture: cottageWin,
    name: "atticWin",
  });

  // crooked chimney
  b.part(new THREE.BoxGeometry(0.014, 0.04, 0.014), brick, { bone: root, at: cp(-0.03, 0.083, -0.015), quat: yq(0, -7), flat: true, name: "chimney1" });
  b.part(new THREE.BoxGeometry(0.0125, 0.016, 0.0125), brick, { bone: root, at: cp(-0.0285, 0.109, -0.015), quat: yq(0, 6), flat: true, name: "chimney2" });
  b.part(new THREE.BoxGeometry(0.018, 0.004, 0.018), STONE_D, { bone: root, at: cp(-0.0295, 0.1175, -0.015), quat: yq(0, 6), flat: true, name: "chimneyCap" });
  b.part(new THREE.CylinderGeometry(0.0035, 0.004, 0.006, 6), "#8a3a28", { bone: root, at: cp(-0.0302, 0.1215, -0.015), flat: true, name: "chimneyPot" });
  (
    [
      [-0.031, 0.128, -0.015, 0.0045],
      [-0.036, 0.137, -0.019, 0.0062],
      [-0.044, 0.149, -0.022, 0.0078],
      [-0.055, 0.161, -0.024, 0.0068],
    ] as number[][]
  ).forEach(([x, y, z, r], i) =>
    b.part(new THREE.IcosahedronGeometry(r, 1), SMOKE, { bone: root, at: cp(x, y, z), flat: true, name: `smoke${i}` }),
  );

  // door
  b.part(new THREE.BoxGeometry(0.025, 0.036, 0.002), WHITE, { bone: root, at: cp(0.018, 0.018, 0.033), quat: yq(0), name: "doorFrame" });
  b.part(new THREE.BoxGeometry(0.02, 0.032, 0.003), DOOR, { bone: root, at: cp(0.018, 0.017, 0.0335), quat: yq(0), flat: true, name: "door" });
  b.part(new THREE.BoxGeometry(0.008, 0.007, 0.001), "#bfe4ff", { bone: root, at: cp(0.018, 0.026, 0.0352), quat: yq(0), name: "doorPane" });
  b.part(new THREE.SphereGeometry(0.0016, 6, 4), BRASS, { bone: root, at: cp(0.0115, 0.016, 0.0356), name: "doorKnob" });
  b.part(new THREE.BoxGeometry(0.03, 0.004, 0.012), STONE, { bone: root, at: cp(0.018, 0.001, 0.04), quat: yq(0), flat: true, name: "doorStep" });
  b.part(new THREE.BoxGeometry(0.03, 0.002, 0.012), SLATE_E, { bone: root, at: cp(0.018, 0.038, 0.038), quat: yq(-15), flat: true, name: "doorAwning" });
  b.part(new THREE.BoxGeometry(0.004, 0.006, 0.004), GLOW, { bone: root, at: cp(0.035, 0.03, 0.035), quat: yq(0), name: "doorLamp" });

  // windows
  const winSpots: [P3, P3][] = [
    [cp(-0.02, 0.03, 0.0337), cd(0, 0, 1)],
    [cp(0.0437, 0.03, 0), cd(1, 0, 0)],
    [cp(-0.0437, 0.03, 0.006), cd(-1, 0, 0)],
    [cp(0, 0.03, -0.0337), cd(0, 0, -1)],
  ];
  winSpots.forEach(([at, dir], i) => {
    b.part(new THREE.PlaneGeometry(0.019, 0.019), "#ffffff", { bone: root, at, dir, axis: "z", texture: cottageWin, name: `win${i}` });
  });
  // flower box under front window
  b.part(new THREE.BoxGeometry(0.023, 0.005, 0.006), WOOD, { bone: root, at: cp(-0.02, 0.0175, 0.036), quat: yq(0), flat: true, name: "flowerBox" });
  b.part(new THREE.BoxGeometry(0.021, 0.003, 0.005), "#4f9438", { bone: root, at: cp(-0.02, 0.0205, 0.036), quat: yq(0), flat: true, name: "flowerBoxLeaves" });
  ["#e8433a", "#f48fb1", "#ffd23f", "#e8433a", "#ffffff"].forEach((c, i) =>
    b.part(new THREE.IcosahedronGeometry(0.0022, 0), c, { bone: root, at: cp(-0.028 + i * 0.004, 0.0225, 0.036 + (i % 2) * 0.0015), flat: true, name: `boxFlower${i}` }),
  );

  // ---------- jetty ----------
  const JX = 0.1;
  b.part(new THREE.BoxGeometry(0.006, 0.006, 0.115), WOOD_D, { bone: root, at: [JX - 0.019, 0.091, 0.19], flat: true, name: "stringerA" });
  b.part(new THREE.BoxGeometry(0.006, 0.006, 0.115), WOOD_D, { bone: root, at: [JX + 0.019, 0.091, 0.19], flat: true, name: "stringerB" });
  for (let i = 0; i < 9; i++) {
    b.part(new THREE.BoxGeometry(0.05, 0.004, 0.0112), i % 3 === 1 ? WOOD_L : WOOD, {
      bone: root,
      at: [JX + (rand() - 0.5) * 0.003, 0.096, 0.141 + i * 0.0128],
      rotation: [0, (rand() - 0.5) * 6, 0],
      flat: true,
      name: `plank${i}`,
    });
  }
  const posts: P3[] = [
    [JX - 0.027, 0, 0.17],
    [JX + 0.027, 0, 0.17],
    [JX - 0.027, 0, 0.24],
    [JX + 0.027, 0, 0.24],
  ];
  posts.forEach((p, i) => {
    const h = i === 3 ? 0.06 : 0.05;
    b.part(new THREE.CylinderGeometry(0.0045, 0.0045, h, 7), WOOD_D, { bone: root, at: [p[0], 0.06 + h / 2, p[2]], flat: true, name: `post${i}` });
    b.part(new THREE.TorusGeometry(0.0075, 0.0016, 4, 10), FOAM, { bone: root, at: [p[0], 0.0757, p[2]], rotation: [90, 0, 0], name: `postFoam${i}` });
  });
  // rope wraps on the mooring post
  for (const y of [0.099, 0.103])
    b.part(new THREE.TorusGeometry(0.005, 0.0012, 4, 10), ROPE, { bone: root, at: [JX + 0.027, y, 0.17], rotation: [90, 0, 0], name: `wrap${y}` });
  // lifebuoy
  b.part(
    new THREE.TorusGeometry(0.008, 0.0026, 6, 16),
    paint((_p, _n, s) => (Math.floor(s[0] * 8) % 2 ? RED : WHITE)),
    { bone: root, at: [JX - 0.034, 0.093, 0.24], rotation: [0, 90, 0], name: "lifebuoy" },
  );
  // barrel and crate
  b.part(new THREE.CylinderGeometry(0.008, 0.0075, 0.018, 8), "#8a5a32", { bone: root, at: [JX - 0.012, 0.107, 0.152], flat: true, name: "barrel" });
  for (const y of [0.102, 0.112])
    b.part(new THREE.TorusGeometry(0.0081, 0.0009, 3, 8), IRON, { bone: root, at: [JX - 0.012, y, 0.152], rotation: [90, 0, 0], name: `barrelBand${y}` });
  b.part(new THREE.BoxGeometry(0.014, 0.012, 0.014), WOOD_L, { bone: root, at: [JX + 0.012, 0.104, 0.15], rotation: [0, 12, 0], flat: true, name: "crate" });

  // ---------- rowboat ----------
  const BX = 0.16,
    BZ = 0.16,
    rimY = 0.088;
  b.part(
    new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    paint((p) => (p.y > rimY - 0.0045 ? "#2f6fb5" : HULL)),
    { bone: root, at: [BX, rimY, BZ], scale: [0.026, 0.02, 0.058], flat: true, name: "hull" },
  );
  b.part(new THREE.CircleGeometry(1, 14), WOOD, {
    bone: root,
    at: [BX, rimY - 0.004, BZ],
    rotation: [-90, 0, 0],
    scale: [0.025, 0.056, 1],
    name: "boatFloor",
  });
  const rimPts: P3[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    rimPts.push([BX + Math.cos(a) * 0.026, rimY, BZ + Math.sin(a) * 0.058]);
  }
  b.sweep(catmull(rimPts, { closed: true }), 0.0022, { color: WOOD_D, sides: 5, bone: root, name: "boatRim" });
  for (const z of [-0.022, 0.018])
    b.part(new THREE.BoxGeometry(0.047, 0.003, 0.01), WOOD_L, { bone: root, at: [BX, rimY - 0.001, BZ + z], flat: true, name: `seat${z}` });
  for (const s of [1, -1]) {
    const a: P3 = [BX + s * 0.008, rimY + 0.002, BZ - 0.045];
    const e: P3 = [BX + s * 0.014, rimY + 0.003, BZ + 0.03];
    b.rod(a, e, 0.0013, { color: WOOD_L, sides: 4, bone: root, name: `oar${s}` });
    b.part(new THREE.BoxGeometry(0.006, 0.0015, 0.016), WOOD_L, { bone: root, at: [e[0], e[1], e[2] + 0.006], flat: true, name: `oarBlade${s}` });
  }
  b.part(new THREE.TorusGeometry(0.0025, 0.0007, 4, 8), BRASS, { bone: root, at: [BX, rimY + 0.002, BZ + 0.058], rotation: [0, 90, 0], name: "bowRing" });
  b.sweep(bezier([JX + 0.027, 0.101, 0.17], [0.15, 0.08, 0.195], [BX, rimY + 0.002, BZ + 0.057]), 0.0011, {
    color: ROPE,
    sides: 4,
    bone: root,
    name: "mooringRope",
  });
  for (let i = 0; i < 6; i++) {
    const a = (-30 + i * 12) * D;
    b.part(new THREE.IcosahedronGeometry(1, 0), FOAM, {
      bone: root,
      at: [BX + Math.sin(a) * 0.03, 0.0755, BZ + 0.06 + Math.cos(a) * 0.006],
      scale: [0.006, 0.0018, 0.004],
      flat: true,
      name: `bowFoam${i}`,
    });
  }

  // ---------- seagulls ----------
  const gull = (pos: P3, yaw: number, name: string) => {
    const yr = yaw * D;
    const f = [Math.sin(yr), Math.cos(yr)];
    const sd = [Math.cos(yr), -Math.sin(yr)];
    const L = (x: number, y: number, z: number): P3 => [pos[0] + sd[0] * x + f[0] * z, pos[1] + y, pos[2] + sd[1] * x + f[1] * z];
    const q = (tilt: number) => new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt * D, yr, 0, "YXZ"));
    for (const s of [1, -1]) {
      b.rod(L(s * 0.003, 0.0005, 0), L(s * 0.003, 0.011, 0), 0.0008, { color: LEG, sides: 4, bone: root, name: `${name}Leg${s}` });
      b.part(new THREE.BoxGeometry(0.004, 0.001, 0.006), LEG, { bone: root, at: L(s * 0.003, 0.0005, 0.002), quat: q(0), name: `${name}Foot${s}` });
      b.capsule(L(s * 0.0075, 0.019, 0.006), L(s * 0.0025, 0.0165, -0.027), [0.0048, 0.0022], {
        sides: 6,
        bands: [
          [0.72, GULL_GRAY],
          [1, INK],
        ],
        bone: root,
        name: `${name}Wing${s}`,
      });
      b.part(new THREE.SphereGeometry(0.0012, 6, 4), INK, { bone: root, at: L(s * 0.0045, 0.0285, 0.0145), name: `${name}Eye${s}` });
    }
    b.part(new THREE.SphereGeometry(1, 10, 7), WHITE, { bone: root, at: L(0, 0.017, 0), quat: q(-10), scale: [0.0085, 0.0085, 0.017], name: `${name}Body` });
    b.part(new THREE.SphereGeometry(0.0068, 9, 7), WHITE, { bone: root, at: L(0, 0.027, 0.012), name: `${name}Head` });
    b.part(new THREE.ConeGeometry(0.0018, 0.009, 5), BEAK, { bone: root, at: L(0, 0.0255, 0.021), dir: [f[0], -0.12, f[1]], flat: true, name: `${name}Beak` });
    b.part(new THREE.SphereGeometry(0.0009, 4, 3), RED, { bone: root, at: L(0, 0.0245, 0.0215), name: `${name}BeakSpot` });
    b.part(new THREE.ConeGeometry(0.0042, 0.011, 5), WHITE, { bone: root, at: L(0, 0.0175, -0.02), dir: [-f[0], 0.15, -f[1]], flat: true, name: `${name}Tail` });
  };
  gull([JX + 0.027, 0.11, 0.24], 120, "gullPost");
  gull(cp(0.004, 0.101, 0.014), yawDeg + 90 + 30, "gullRoof");

  // ---------- grass, flowers, path ----------
  const islandSurf = b.surface([grass, rockIsland]);
  const doorP = new THREE.Vector3(...cp(0.018, 0, 0.05));
  const jettyP = new THREE.Vector3(JX, 0, 0.138);
  const stonePts: THREE.Vector3[] = [];
  for (let i = 0; i < 5; i++) {
    const p = doorP.clone().lerp(jettyP, 0.1 + i * 0.2);
    p.x += (i % 2 ? 1 : -1) * 0.003;
    stonePts.push(p);
    const hit = islandSurf.ray([p.x, 0.4, p.z], [0, -1, 0]);
    if (hit)
      b.stick(new THREE.CylinderGeometry(0.0085, 0.0095, 0.004, 7), i % 2 ? STONE : "#b1aca2", hit, {
        embed: 0.5,
        spin: i * 37,
        flat: true,
        name: `pathStone${i}`,
      });
  }
  const clear = (p: THREE.Vector3) => {
    if (Math.hypot(p.x - T.x, p.z - T.z) < 0.058) return false;
    const v = p.clone().sub(C0).applyAxisAngle(UP, -yawR);
    if (Math.abs(v.x) < 0.052 && Math.abs(v.z) < 0.046) return false;
    for (const s of stonePts) if (Math.hypot(p.x - s.x, p.z - s.z) < 0.011) return false;
    if (Math.abs(p.x - JX) < 0.032 && p.z > 0.125) return false;
    return true;
  };
  const topHits = b
    .surface(grass)
    .scatter(130, { rng: rng(5), minDist: 0.013, filter: (h) => h.n.y > 0.5 && clear(h.at) });
  const grassHits = topHits.filter((_h, i) => i % 3 !== 0);
  const flowerHits = topHits.filter((_h, i) => i % 3 === 0);
  const rimHits = b
    .surface(rockIsland)
    .scatter(60, {
      rng: rng(6),
      minDist: 0.016,
      filter: (h) => h.n.y > 0.4 && h.at.y > 0.088 && Math.hypot(h.at.x, h.at.z) > 0.148 && clear(h.at),
    });
  b.cards([...grassHits, ...rimHits], grassTex, {
    size: [0.024, 0.019],
    cross: true,
    vary: 0.35,
    spin: 45,
    lean: 8,
    rng: rng(8),
    name: "grassTufts",
  });
  b.cards(flowerHits, flowers, {
    size: [0.012, 0.019],
    cross: true,
    vary: 0.25,
    spin: 60,
    rng: rng(9),
    name: "wildflowers",
  });

  // a few pebbles on the grass near the tower
  for (let i = 0; i < 5; i++) {
    const a = (150 + i * 40) * D;
    const p = [T.x + Math.sin(a) * 0.058, T.z + Math.cos(a) * 0.058];
    const hit = islandSurf.ray([p[0], 0.4, p[1]], [0, -1, 0]);
    if (hit)
      b.stick(new THREE.DodecahedronGeometry(0.006 + (i % 2) * 0.003, 0), rockPaints[i % 3], hit, {
        embed: 0.4,
        spin: i * 50,
        flat: true,
        name: `pebble${i}`,
      });
  }

  return b.root;
}
```