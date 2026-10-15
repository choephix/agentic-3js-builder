import * as THREE from "three";
import {
  createBuilder,
  frame,
  aim,
  offset,
  rng,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "pixel_monster_truck",
  description:
    "A roaring retro-arcade pixel art monster truck with massive 66-inch chevron-tread tyres, supercharged V8 with glowing zoomie headers, tubular 4-link roll cage chassis, electric flame livery, and an arena dirt staging with a crushed taxi car.",
};

// -----------------------------------------------------------------------------
// PALETTE: Crisp 16-bit arcade pixel colors
// -----------------------------------------------------------------------------
const C = {
  // Body & Liveries
  bodyDark: "#131026",
  bodyMid: "#1f1a3f",
  bodyLight: "#342d62",
  flamePink: "#ff007f",
  flameOrange: "#ff6a00",
  flameYellow: "#ffd600",
  flameCyan: "#00f0ff",

  // Chassis & Cage (Vibrant Safety Lime)
  chassis: "#00e676",
  chassisDark: "#00a34c",
  chassisHighlight: "#69f0ae",

  // Tyres & Rubber
  rubberDark: "#181820",
  rubberMid: "#252532",
  rubberLight: "#38384a",
  treadLug: "#121218",

  // Mechanical / Engine / Chrome
  chrome: "#f0f4f8",
  chromeMid: "#b0bec5",
  chromeDark: "#546e7a",
  ironDark: "#263238",
  engineBlue: "#0288d1",
  brassGold: "#ffb300",

  // Suspension & Accents
  shockBlue: "#2979ff",
  springYellow: "#ffea00",
  nitroCyan: "#00e5ff",
  fireOrange: "#ff3d00",
  fireGlow: "#ffab00",
  hazardYellow: "#ffc400",

  // Interior & Glass
  glassTint: "#102030",
  glassGlare: "#80deea",
  interiorDark: "#1a1a24",
  seatRed: "#d50000",

  // Arena Staging
  dirtDark: "#4e342e",
  dirtMid: "#6d4c41",
  dirtLight: "#8d6e63",
  crushedTaxi: "#ffcc00",
  taxiChecker: "#212121",
};

// -----------------------------------------------------------------------------
// PIXEL TEXTURE GENERATOR HELPER
// Produces razor-sharp SVG pixel textures with crisp pixelated filtering
// -----------------------------------------------------------------------------
function makePixelTexture(
  w: number,
  h: number,
  draw: (set: (x: number, y: number, color: string) => void) => void,
  scale = 16
): THREE.Texture {
  const grid: string[][] = Array.from({ length: h }, () => Array(w).fill(""));
  draw((x, y, color) => {
    if (x >= 0 && x < w && y >= 0 && y < h && color) {
      grid[y][x] = color;
    }
  });

  let rects = "";
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const col = grid[y][x];
      if (!col) {
        x++;
        continue;
      }
      let len = 1;
      while (x + len < w && grid[y][x + len] === col) len++;
      rects += `<rect x="${x}" y="${y}" width="${len}" height="1" fill="${col}"/>`;
      x += len;
    }
  }

  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects}</svg>`,
    { size: Math.max(w, h) * scale, pixelated: true }
  );
}

// -----------------------------------------------------------------------------
// GLOW HELPER: Self-lit emissive glow for lights, fire & screens
// -----------------------------------------------------------------------------
function glow<T extends THREE.Object3D | { mesh: THREE.Mesh }>(
  target: T,
  colorStr?: string,
  intensity = 1.6
): T {
  const mesh: THREE.Mesh = "mesh" in target ? (target as any).mesh : (target as THREE.Mesh);
  if (mesh && mesh.material instanceof THREE.MeshStandardMaterial) {
    const mat = mesh.material.clone();
    if (colorStr) {
      mat.emissive.set(colorStr);
    } else {
      mat.emissive.copy(mat.color);
    }
    mat.emissiveIntensity = intensity;
    mesh.material = mat;
  }
  return target;
}

// -----------------------------------------------------------------------------
// PIXEL ART TEXTURES
// -----------------------------------------------------------------------------

// 1. Giant Tyre Sidewall with bold beadlock bolts & embossed lettering
const TEX_TYRE_SIDEWALL = makePixelTexture(32, 32, (set) => {
  const cx = 15.5;
  const cy = 15.5;
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d > 15.8) continue;
      if (d > 13.5) {
        // Outer tyre shoulder knobbies
        const angle = Math.atan2(y - cy, x - cx);
        const notch = (Math.sin(angle * 12) + 1) * 0.5;
        set(x, y, notch > 0.4 ? C.rubberLight : C.rubberMid);
      } else if (d > 10.0) {
        // Deep tyre sidewall rubber
        set(x, y, d > 12.0 ? C.rubberMid : C.rubberDark);
        // Lettering "TITAN" at top, "66x43" at bottom
        if (y < 8 && Math.abs(x - cx) < 6 && (x + y) % 2 === 0) {
          set(x, y, C.flameYellow);
        }
        if (y > 23 && Math.abs(x - cx) < 6 && (x + y) % 2 === 0) {
          set(x, y, C.chrome);
        }
      } else if (d > 8.0) {
        // Neon green beadlock ring with steel bolts
        set(x, y, C.chassis);
        const angle = Math.atan2(y - cy, x - cx);
        const bolt = (Math.sin(angle * 8) + 1) * 0.5;
        if (bolt > 0.7 && d > 8.8) {
          set(x, y, C.chrome);
        }
      } else if (d > 4.5) {
        // Deep-dish rim depression
        set(x, y, C.ironDark);
      } else if (d > 2.0) {
        // Heavy planetary reduction hub with lug nuts
        set(x, y, (x + y) % 3 === 0 ? C.flameOrange : C.brassGold);
      } else {
        // Center grease cap
        set(x, y, C.flamePink);
      }
    }
  }
});

// 2. Hood with electric pixel flames and blower cutout border
const TEX_HOOD = makePixelTexture(32, 32, (set) => {
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      set(x, y, C.bodyDark);
      // Flame licking from front (y=0) towards windshield (y=31)
      const dx = Math.abs(x - 15.5);
      const flameProfile = 14 - dx * 0.8 + Math.sin(x * 1.2 + y * 0.5) * 2.5;
      if (y < flameProfile + 12) {
        if (y < flameProfile) {
          set(x, y, C.flameYellow);
        } else if (y < flameProfile + 5) {
          set(x, y, C.flameOrange);
        } else if (y < flameProfile + 9) {
          set(x, y, C.flamePink);
        } else {
          set(x, y, C.flameCyan);
        }
      }
      // Supercharger cutout zone (center hole surrounded by chrome rim)
      if (y > 10 && y < 22 && Math.abs(x - 15.5) < 7) {
        if (y === 11 || y === 21 || Math.abs(x - 15.5) === 6) {
          set(x, y, C.chrome);
        } else {
          set(x, y, C.ironDark);
        }
      }
    }
  }
});

// 3. Doors & Cab sides with racing number 01, flame decals & sponsors
const TEX_DOOR = makePixelTexture(32, 24, (set) => {
  for (let y = 0; y < 24; y++) {
    for (let x = 0; x < 32; x++) {
      set(x, y, C.bodyMid);
      // Flame trail along lower body
      const flame = 16 - (x * 0.25) + Math.sin(x * 0.8) * 2;
      if (y > flame) {
        set(x, y, y > flame + 4 ? C.flameOrange : C.flamePink);
      }
    }
  }
  // Giant pixel "01" racing number badge
  const num0 = [
    ".###.",
    "#...#",
    "#...#",
    "#...#",
    ".###.",
  ];
  const num1 = [
    ".##..",
    "..#..",
    "..#..",
    "..#..",
    ".###.",
  ];
  const drawNum = (grid: string[], ox: number, oy: number) => {
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] === "#") {
          set(ox + c, oy + r, C.chrome);
          set(ox + c + 1, oy + r + 1, C.flameCyan);
        }
      }
    }
  };
  drawNum(num0, 10, 6);
  drawNum(num1, 17, 6);

  // Micro sponsor decals: "NITRO", "BKT"
  for (let i = 0; i < 5; i++) {
    set(6 + i * 2, 18, C.flameYellow);
    set(20 + i * 2, 18, C.flameCyan);
  }
});

// 4. Aggressive front grille with headlights & chrome teeth
const TEX_GRILLE = makePixelTexture(32, 16, (set) => {
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 32; x++) {
      set(x, y, C.ironDark);
      // Grille mesh lines
      if ((x + y) % 2 === 0) set(x, y, "#0f1118");
      // Chrome surround
      if (y === 0 || y === 15 || x === 0 || x === 31) set(x, y, C.chrome);
    }
  }
  // Headlights (Left & Right)
  const drawLight = (cx: number) => {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const d = Math.hypot(dx, dy);
        if (d < 2.8) {
          set(cx + dx, 7 + dy, d < 1.2 ? "#ffffff" : C.flameYellow);
        }
      }
    }
    // Chrome ring around headlight
    set(cx - 4, 7, C.chrome);
    set(cx + 4, 7, C.chrome);
    set(cx, 3, C.chrome);
    set(cx, 11, C.chrome);
  };
  drawLight(6);
  drawLight(25);

  // Chrome skull / monster teeth in center grille
  const teeth = [11, 13, 15, 17, 19, 21];
  for (const tx of teeth) {
    set(tx, 10, C.chrome);
    set(tx, 11, C.chrome);
    set(tx + 1, 6, C.chrome);
    set(tx + 1, 7, C.chrome);
  }
});

// 5. Raked Windshield with sun glare & "CRUSHER" banner
const TEX_WINDSHIELD = makePixelTexture(32, 20, (set) => {
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 32; x++) {
      // Dark glass base
      set(x, y, C.glassTint);
      // 45-degree glare streak
      if (Math.abs((x - y * 1.3) - 6) < 2) {
        set(x, y, C.glassGlare);
      }
      if (Math.abs((x - y * 1.3) - 5) === 0) {
        set(x, y, "#ffffff");
      }
    }
  }
  // Top sun-visor banner
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 32; x++) {
      set(x, y, C.flamePink);
      if (x > 4 && x < 28 && (x + y) % 2 === 0) {
        set(x, y, C.flameYellow);
      }
    }
  }
});

// 6. Tailgate with caution chevron hazard stripes & taillights
const TEX_TAILGATE = makePixelTexture(32, 16, (set) => {
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 32; x++) {
      set(x, y, C.bodyDark);
      // Lower hazard warning stripes
      if (y >= 10) {
        const stripe = Math.floor((x + y) / 3) % 2 === 0;
        set(x, y, stripe ? C.hazardYellow : "#111116");
      }
    }
  }
  // Center logo "TITAN"
  for (let i = 0; i < 9; i++) {
    set(11 + i, 5, C.flameCyan);
    set(11 + i, 6, C.chrome);
  }
  // Taillights
  for (let dy = 2; dy <= 5; dy++) {
    set(2, dy, C.flamePink);
    set(3, dy, "#ff1744");
    set(28, dy, "#ff1744");
    set(29, dy, C.flamePink);
    // Reverse light dot
    set(3, dy === 5 ? 5 : 6, "#ffffff");
    set(28, dy === 5 ? 5 : 6, "#ffffff");
  }
});

// 7. Truck bed floor: diamond-plate aluminum
const TEX_BED_FLOOR = makePixelTexture(16, 16, (set) => {
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      set(x, y, C.chromeDark);
      if ((x + y) % 4 === 0) set(x, y, C.chrome);
      if ((x + y) % 4 === 1) set(x, y, C.ironDark);
    }
  }
});

// 8. Smashed Taxi Car prop texture (crushed yellow compact)
const TEX_CRUSHED_TAXI = makePixelTexture(32, 32, (set) => {
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      set(x, y, C.crushedTaxi);
      // Taxi checker stripe down center
      if (y >= 12 && y <= 16 && (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0) {
        set(x, y, C.taxiChecker);
      }
      // Smashed spiderweb cracked windshield
      if (y >= 6 && y <= 11 && x >= 7 && x <= 24) {
        set(x, y, C.glassTint);
        if ((x + y * 2) % 3 === 0 || (x - y) % 4 === 0) {
          set(x, y, "#ffffff");
        }
      }
      // Crumpled metal creases
      if ((x === 6 || x === 25 || y === 5 || y === 26) && (x + y) % 2 === 0) {
        set(x, y, "#997700");
      }
    }
  }
});

// 9. Arena dirt & clay ground plinth texture with tire tracks
const TEX_ARENA_DIRT = makePixelTexture(32, 32, (set) => {
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const noise = ((x * 17 + y * 29) % 11) / 10;
      set(x, y, noise > 0.6 ? C.dirtLight : noise > 0.3 ? C.dirtMid : C.dirtDark);
      // Heavy chevron tire track impressions in mud
      const track1 = Math.abs(x - 9) < 4;
      const track2 = Math.abs(x - 22) < 4;
      if (track1 || track2) {
        const localX = track1 ? x - 9 : x - 22;
        const chevron = (y + Math.abs(localX) * 2) % 6;
        if (chevron < 2) {
          set(x, y, "#2d1d19");
        }
      }
    }
  }
});

// -----------------------------------------------------------------------------
// BUILDER ENTRY POINT
// -----------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "pixel_monster_truck" });

  // ---------------------------------------------------------------------------
  // SKELETON / JOINT HIERARCHY
  // ---------------------------------------------------------------------------
  // Ground reference: Plinth base touches y = 0.
  // Dirt surface is at y = 0.06.
  // Huge tyres: radius 0.80 m, axle center at y = 0.84 m (sunk 2cm in mud).
  const Y_AXLE = 0.84;
  const Z_AXLE_F = 1.40;
  const Z_AXLE_R = -1.40;
  const X_WHEEL = 1.35; // outer track width

  // Root joint at chassis center
  const root = b.joint("root", { at: [0, 1.30, 0], role: "spine" });

  // Axle joints
  const axleF = b.joint("axleF", { parent: root, at: [0, Y_AXLE, Z_AXLE_F], role: "hinge" });
  const axleR = b.joint("axleR", { parent: root, at: [0, Y_AXLE, Z_AXLE_R], role: "hinge" });

  // Wheel hinge joints (4 giant wheels)
  const wheelFL = b.joint("wheelFL", { parent: axleF, at: [X_WHEEL, Y_AXLE, Z_AXLE_F], role: "hinge" });
  const wheelFR = b.joint("wheelFR", { parent: axleF, at: [-X_WHEEL, Y_AXLE, Z_AXLE_F], role: "hinge" });
  const wheelRL = b.joint("wheelRL", { parent: axleR, at: [X_WHEEL, Y_AXLE, Z_AXLE_R], role: "hinge" });
  const wheelRR = b.joint("wheelRR", { parent: axleR, at: [-X_WHEEL, Y_AXLE, Z_AXLE_R], role: "hinge" });

  // Supercharger / engine joint
  const engineJoint = b.joint("engine", { parent: root, at: [0, 1.85, 0.70] });

  // ---------------------------------------------------------------------------
  // 1. GIANT 66-INCH CHEVRON-TREAD TYRES (FL, FR, RL, RR)
  // ---------------------------------------------------------------------------
  const TYRE_R = 0.80; // Tyre outer carcass radius
  const TYRE_W = 0.72; // Tyre width
  const RIM_R = 0.44;  // Rim radius
  const LUG_COUNT = 14;

  const wheelConfigs = [
    { bone: wheelFL, x: X_WHEEL, z: Z_AXLE_F, isLeft: true, name: "FL" },
    { bone: wheelFR, x: -X_WHEEL, z: Z_AXLE_F, isLeft: false, name: "FR" },
    { bone: wheelRL, x: X_WHEEL, z: Z_AXLE_R, isLeft: true, name: "RL" },
    { bone: wheelRR, x: -X_WHEEL, z: Z_AXLE_R, isLeft: false, name: "RR" },
  ];

  for (const wc of wheelConfigs) {
    const s = wc.isLeft ? 1 : -1;
    const center = [wc.x, Y_AXLE, wc.z] as [number, number, number];

    // Main Tyre Carcass: 16-sided faceted rubber barrel
    b.part(
      new THREE.CylinderGeometry(TYRE_R, TYRE_R, TYRE_W, 16, 1),
      C.rubberDark,
      {
        bone: wc.bone,
        at: center,
        dir: [s, 0, 0],
        name: `tyre_carcass_${wc.name}`,
      }
    );

    // Deep-dish Steel Rim Shell
    b.part(
      new THREE.CylinderGeometry(RIM_R, RIM_R, TYRE_W + 0.02, 12, 1),
      C.ironDark,
      {
        bone: wc.bone,
        at: center,
        dir: [s, 0, 0],
        name: `rim_shell_${wc.name}`,
      }
    );

    // Outer Sidewall Pixel Decal Disc (faces outward)
    b.part(
      new THREE.CircleGeometry(TYRE_R - 0.01, 16),
      "#ffffff",
      {
        bone: wc.bone,
        at: [wc.x + s * (TYRE_W * 0.5 + 0.005), Y_AXLE, wc.z],
        dir: [s, 0, 0],
        axis: "z",
        texture: TEX_TYRE_SIDEWALL,
        name: `sidewall_out_${wc.name}`,
      }
    );

    // Inner Sidewall Pixel Decal Disc (faces inward towards chassis)
    b.part(
      new THREE.CircleGeometry(TYRE_R - 0.01, 16),
      "#ffffff",
      {
        bone: wc.bone,
        at: [wc.x - s * (TYRE_W * 0.5 + 0.005), Y_AXLE, wc.z],
        dir: [-s, 0, 0],
        axis: "z",
        texture: TEX_TYRE_SIDEWALL,
        name: `sidewall_in_${wc.name}`,
      }
    );

    // Deep-Dish Beadlock Outer Ring
    b.part(
      new THREE.TorusGeometry(RIM_R * 0.95, 0.03, 6, 12),
      C.chassis,
      {
        bone: wc.bone,
        at: [wc.x + s * (TYRE_W * 0.5 + 0.012), Y_AXLE, wc.z],
        dir: [s, 0, 0],
        name: `beadlock_ring_${wc.name}`,
      }
    );

    // Massive Planetary Reduction Center Hub
    b.part(
      new THREE.CylinderGeometry(0.14, 0.16, 0.18, 8),
      C.chromeDark,
      {
        bone: wc.bone,
        at: [wc.x + s * (TYRE_W * 0.5 + 0.08), Y_AXLE, wc.z],
        dir: [s, 0, 0],
        name: `planetary_hub_${wc.name}`,
      }
    );

    // Center Red Grease Cap
    b.part(
      new THREE.CylinderGeometry(0.06, 0.06, 0.05, 8),
      C.flamePink,
      {
        bone: wc.bone,
        at: [wc.x + s * (TYRE_W * 0.5 + 0.18), Y_AXLE, wc.z],
        dir: [s, 0, 0],
        name: `grease_cap_${wc.name}`,
      }
    );

    // Heavy Chevron Herringbone Tread Lugs (Directional "V" lugs!)
    // 14 aggressive chevron lugs angled across the wide tread
    for (let i = 0; i < LUG_COUNT; i++) {
      const theta = (i / LUG_COUNT) * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const lugRadius = TYRE_R + 0.045; // 7cm deep lugs

      // Center apex of the chevron
      const apexY = Y_AXLE + sinT * lugRadius;
      const apexZ = wc.z + cosT * lugRadius;

      // Each chevron has an outer wing and an inner wing swept back by 22 degrees
      const sweepAngle = 0.26; // radians swept back
      const cosSweep = Math.cos(theta - sweepAngle);
      const sinSweep = Math.sin(theta - sweepAngle);

      // Outer Half Lug
      const outerX = wc.x + s * (TYRE_W * 0.26);
      const outerY = Y_AXLE + sinSweep * lugRadius;
      const outerZ = wc.z + cosSweep * lugRadius;

      b.rod(
        [wc.x, apexY, apexZ],
        [outerX, outerY, outerZ],
        0.038,
        C.treadLug,
        { bone: wc.bone, name: `lug_out_${wc.name}_${i}` }
      );

      // Inner Half Lug
      const innerX = wc.x - s * (TYRE_W * 0.26);
      const innerY = Y_AXLE + sinSweep * lugRadius;
      const innerZ = wc.z + cosSweep * lugRadius;

      b.rod(
        [wc.x, apexY, apexZ],
        [innerX, innerY, innerZ],
        0.038,
        C.treadLug,
        { bone: wc.bone, name: `lug_in_${wc.name}_${i}` }
      );
    }
  }

  // ---------------------------------------------------------------------------
  // 2. HEAVY BEAM AXLES & CENTRAL DIFFERENTIAL PUMPKINS
  // ---------------------------------------------------------------------------
  for (const [axleJoint, zPos, axleName] of [
    [axleF, Z_AXLE_F, "front"],
    [axleR, Z_AXLE_R, "rear"],
  ] as const) {
    // Axle Main Tube (Square trussed steel housing)
    b.part(
      new THREE.BoxGeometry(2.0, 0.16, 0.16),
      C.ironDark,
      {
        bone: axleJoint,
        at: [0, Y_AXLE, zPos],
        name: `axle_housing_${axleName}`,
      }
    );

    // Heavy Central Differential "Pumpkin"
    b.part(
      new THREE.SphereGeometry(0.24, 10, 8),
      C.ironDark,
      {
        bone: axleJoint,
        at: [0, Y_AXLE, zPos],
        scale: [1.1, 1.0, 1.2],
        name: `diff_pumpkin_${axleName}`,
      }
    );

    // Polished Chrome Diff Cover Plate with bolts
    b.part(
      new THREE.CylinderGeometry(0.18, 0.18, 0.05, 8),
      C.chrome,
      {
        bone: axleJoint,
        at: [0, Y_AXLE, zPos + (axleName === "front" ? -0.16 : 0.16)],
        dir: [0, 0, axleName === "front" ? -1 : 1],
        name: `diff_cover_${axleName}`,
      }
    );

    // Axle Truss Reinforcing Bridge (top spine)
    b.rod(
      [-0.85, Y_AXLE + 0.12, zPos],
      [0.85, Y_AXLE + 0.12, zPos],
      0.032,
      C.chassis,
      { bone: axleJoint, name: `axle_truss_${axleName}` }
    );

    // Heavy Steering Knuckle Yokes (left & right)
    for (const side of [1, -1]) {
      b.part(
        new THREE.BoxGeometry(0.14, 0.22, 0.18),
        C.ironDark,
        {
          bone: axleJoint,
          at: [side * 0.96, Y_AXLE, zPos],
          name: `knuckle_${axleName}_${side > 0 ? "L" : "R"}`,
        }
      );
    }
  }

  // Front Hydraulic Steering Cylinder (double-ended ram)
  b.part(
    new THREE.CylinderGeometry(0.045, 0.045, 0.70, 8),
    C.chassis,
    {
      bone: axleF,
      at: [0, Y_AXLE - 0.08, Z_AXLE_F + 0.12],
      dir: [1, 0, 0],
      name: "steering_ram_cylinder",
    }
  );
  // Chrome Steering Pushrods
  b.rod(
    [-0.35, Y_AXLE - 0.08, Z_AXLE_F + 0.12],
    [-0.92, Y_AXLE - 0.05, Z_AXLE_F + 0.08],
    0.022,
    C.chrome,
    { bone: axleF, name: "steering_tie_R" }
  );
  b.rod(
    [0.35, Y_AXLE - 0.08, Z_AXLE_F + 0.12],
    [0.92, Y_AXLE - 0.05, Z_AXLE_F + 0.08],
    0.022,
    C.chrome,
    { bone: axleF, name: "steering_tie_L" }
  );

  // ---------------------------------------------------------------------------
  // 3. 4-LINK TRIANGULATED SUSPENSION & GIANT NITROGEN COIL-OVERS
  // ---------------------------------------------------------------------------
  // Drop Transfer Case in center chassis cradle
  b.part(
    new THREE.BoxGeometry(0.38, 0.32, 0.44),
    C.ironDark,
    {
      bone: root,
      at: [0, 1.25, 0],
      name: "transfer_case",
    }
  );

  // Front and Rear Heavy Driveshafts with U-joints
  b.rod(
    [0, 1.22, 0.22],
    [0, Y_AXLE + 0.06, Z_AXLE_F - 0.20],
    0.042,
    C.chromeDark,
    { bone: root, name: "driveshaft_front" }
  );
  b.rod(
    [0, 1.22, -0.22],
    [0, Y_AXLE + 0.06, Z_AXLE_R + 0.20],
    0.042,
    C.chromeDark,
    { bone: root, name: "driveshaft_rear" }
  );

  // 4-Link Control Arms per axle (2 lower, 2 upper triangulated)
  for (const [zSign, axleZ, axleJoint, name] of [
    [1, Z_AXLE_F, axleF, "front"],
    [-1, Z_AXLE_R, axleR, "rear"],
  ] as const) {
    for (const side of [1, -1]) {
      // Lower Control Arm: running from lower chassis cradle to axle mount
      b.rod(
        [side * 0.36, 1.22, zSign * 0.35],
        [side * 0.78, Y_AXLE + 0.04, axleZ - zSign * 0.08],
        0.038,
        C.chassis,
        { bone: root, name: `lower_link_${name}_${side > 0 ? "L" : "R"}` }
      );

      // Upper Triangulated Control Arm: high center chassis to top axle mount
      b.rod(
        [side * 0.16, 1.55, zSign * 0.25],
        [side * 0.38, Y_AXLE + 0.14, axleZ - zSign * 0.05],
        0.034,
        C.chassis,
        { bone: root, name: `upper_link_${name}_${side > 0 ? "L" : "R"}` }
      );

      // DUAL COIL-OVER SHOCK ABSORBERS PER WHEEL (4 corners x 2 shocks = 8 massive shocks!)
      for (const shockIdx of [-0.07, 0.07]) {
        const axleMount = [side * 0.88, Y_AXLE + 0.08, axleZ + shockIdx] as [number, number, number];
        const towerMount = [side * 0.52, 1.82, zSign * 1.15 + shockIdx] as [number, number, number];

        // Anodized Blue Shock Cylinder Body (upper half)
        const shockMid = [
          (axleMount[0] + towerMount[0]) * 0.5,
          (axleMount[1] + towerMount[1]) * 0.5,
          (axleMount[2] + towerMount[2]) * 0.5,
        ] as [number, number, number];

        b.rod(shockMid, towerMount, 0.048, C.shockBlue, {
          bone: root,
          name: `shock_body_${name}_${side > 0 ? "L" : "R"}_${shockIdx > 0 ? "1" : "2"}`,
        });

        // Polished Chrome Shaft (lower half)
        b.rod(axleMount, shockMid, 0.026, C.chrome, {
          bone: root,
          name: `shock_shaft_${name}_${side > 0 ? "L" : "R"}_${shockIdx > 0 ? "1" : "2"}`,
        });

        // Giant Coiled Suspension Spring (Hot Yellow)
        b.part(
          new THREE.CylinderGeometry(0.068, 0.068, 0.55, 8, 1, true),
          C.springYellow,
          {
            bone: root,
            at: [
              (axleMount[0] + towerMount[0]) * 0.5,
              (axleMount[1] + towerMount[1]) * 0.5,
              (axleMount[2] + towerMount[2]) * 0.5,
            ],
            aim: towerMount,
            name: `shock_spring_${name}_${side > 0 ? "L" : "R"}_${shockIdx > 0 ? "1" : "2"}`,
          }
        );

        // Piggyback Remote Nitrogen Reservoir Canister
        b.part(
          new THREE.CylinderGeometry(0.028, 0.028, 0.28, 8),
          C.nitroCyan,
          {
            bone: root,
            at: [side * 0.60, 1.70, zSign * 1.15 + shockIdx],
            dir: [0, 1, 0],
            name: `nitrogen_canister_${name}_${side > 0 ? "L" : "R"}_${shockIdx > 0 ? "1" : "2"}`,
          }
        );
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 4. TUBULAR SPACEFRAME ROLL CAGE & CHASSIS CRADLE
  // ---------------------------------------------------------------------------
  // Main Lower Rails (Running longitudinal x = ±0.42)
  for (const side of [1, -1]) {
    b.rod(
      [side * 0.44, 1.20, -1.65],
      [side * 0.44, 1.20, 1.65],
      0.040,
      C.chassis,
      { bone: root, name: `lower_rail_${side > 0 ? "L" : "R"}` }
    );
    // Upper Frame Rails
    b.rod(
      [side * 0.48, 1.72, -1.70],
      [side * 0.48, 1.72, 1.60],
      0.040,
      C.chassis,
      { bone: root, name: `upper_rail_${side > 0 ? "L" : "R"}` }
    );
    // Vertical / Diagonal Truss Stanchions
    for (const zt of [-1.5, -0.9, -0.3, 0.3, 0.9, 1.5]) {
      b.rod(
        [side * 0.44, 1.20, zt],
        [side * 0.48, 1.72, zt],
        0.034,
        C.chassis,
        { bone: root, name: `truss_vert_${side > 0 ? "L" : "R"}_${zt}` }
      );
    }
    // Cross Diagonal Braces
    b.rod(
      [side * 0.44, 1.20, -0.9],
      [side * 0.48, 1.72, -0.3],
      0.030,
      C.chassis,
      { bone: root, name: `diag_brace_1_${side > 0 ? "L" : "R"}` }
    );
    b.rod(
      [side * 0.44, 1.20, 0.3],
      [side * 0.48, 1.72, 0.9],
      0.030,
      C.chassis,
      { bone: root, name: `diag_brace_2_${side > 0 ? "L" : "R"}` }
    );
  }

  // Lateral Crossmembers
  for (const zc of [-1.6, -0.6, 0.0, 0.6, 1.6]) {
    b.rod(
      [-0.44, 1.20, zc],
      [0.44, 1.20, zc],
      0.038,
      C.chassis,
      { bone: root, name: `crossmember_low_${zc}` }
    );
    b.rod(
      [-0.48, 1.72, zc],
      [0.48, 1.72, zc],
      0.038,
      C.chassis,
      { bone: root, name: `crossmember_up_${zc}` }
    );
  }

  // Heavy Front Pre-Runner Bull Bumper Hoop
  b.rod(
    [-0.55, 1.35, 1.75],
    [0.55, 1.35, 1.75],
    0.045,
    C.chassis,
    { bone: root, name: "bumper_front_bar" }
  );
  b.rod(
    [-0.45, 1.20, 1.60],
    [-0.55, 1.35, 1.75],
    0.042,
    C.chassis,
    { bone: root, name: "bumper_strut_R" }
  );
  b.rod(
    [0.45, 1.20, 1.60],
    [0.55, 1.35, 1.75],
    0.042,
    C.chassis,
    { bone: root, name: "bumper_strut_L" }
  );
  // Front Aluminum Skid Plate
  b.part(
    new THREE.BoxGeometry(0.70, 0.38, 0.03),
    C.chrome,
    {
      bone: root,
      at: [0, 1.30, 1.72],
      rotation: [25, 0, 0],
      name: "front_skid_plate",
    }
  );
  // Red Heavy Recovery D-Rings
  for (const side of [1, -1]) {
    b.part(
      new THREE.TorusGeometry(0.045, 0.014, 6, 8),
      C.flamePink,
      {
        bone: root,
        at: [side * 0.28, 1.28, 1.76],
        name: `tow_hook_${side > 0 ? "L" : "R"}`,
      }
    );
  }

  // Rear Wheelie Bar (Extending backwards with dual small roller wheels)
  b.rod(
    [-0.32, 1.20, -1.65],
    [-0.22, 0.35, -2.35],
    0.032,
    C.chassis,
    { bone: root, name: "wheelie_strut_R" }
  );
  b.rod(
    [0.32, 1.20, -1.65],
    [0.22, 0.35, -2.35],
    0.032,
    C.chassis,
    { bone: root, name: "wheelie_strut_L" }
  );
  b.rod(
    [-0.22, 0.35, -2.35],
    [0.22, 0.35, -2.35],
    0.028,
    C.chromeDark,
    { bone: root, name: "wheelie_axle" }
  );
  // Dual Wheelie Roller Wheels
  for (const side of [1, -1]) {
    b.part(
      new THREE.CylinderGeometry(0.09, 0.09, 0.06, 10),
      C.flameYellow,
      {
        bone: root,
        at: [side * 0.22, 0.35, -2.35],
        dir: [1, 0, 0],
        name: `wheelie_wheel_${side > 0 ? "L" : "R"}`,
      }
    );
  }

  // ---------------------------------------------------------------------------
  // 5. SUPERCHARGED 572 BIG BLOCK V8 ENGINE & GLOWING ZOOMIES
  // ---------------------------------------------------------------------------
  // Engine Block (Deep metallic blue cast iron)
  b.part(
    new THREE.BoxGeometry(0.68, 0.42, 0.72),
    C.engineBlue,
    {
      bone: engineJoint,
      at: [0, 1.62, 0.85],
      name: "engine_block",
    }
  );

  // Finned Chrome Valve Covers (angled on V8 heads)
  for (const side of [1, -1]) {
    b.part(
      new THREE.BoxGeometry(0.18, 0.14, 0.65),
      C.chrome,
      {
        bone: engineJoint,
        at: [side * 0.25, 1.84, 0.85],
        rotation: [0, 0, side * 22],
        name: `valve_cover_${side > 0 ? "L" : "R"}`,
      }
    );
    // Chrome Breather Caps
    b.part(
      new THREE.CylinderGeometry(0.04, 0.04, 0.06, 8),
      C.chrome,
      {
        bone: engineJoint,
        at: [side * 0.25, 1.94, 0.72],
        name: `breather_cap_${side > 0 ? "L" : "R"}`,
      }
    );
  }

  // Giant Polished 14-71 Roots Supercharger (Blower)
  b.part(
    new THREE.BoxGeometry(0.42, 0.28, 0.68),
    C.chrome,
    {
      bone: engineJoint,
      at: [0, 1.98, 0.85],
      name: "supercharger_casing",
    }
  );
  // Blower Longitudinal Ribs
  for (const ribX of [-0.15, -0.05, 0.05, 0.15]) {
    b.rod(
      [ribX, 2.13, 0.52],
      [ribX, 2.13, 1.18],
      0.015,
      C.chromeLight ?? "#ffffff",
      { bone: engineJoint, name: `blower_rib_${ribX}` }
    );
  }

  // Blower Front Drive Snout & Cogged Belt System
  b.part(
    new THREE.CylinderGeometry(0.065, 0.065, 0.18, 10),
    C.chromeDark,
    {
      bone: engineJoint,
      at: [0, 1.96, 1.28],
      dir: [0, 0, 1],
      name: "blower_drive_snout",
    }
  );
  // Upper Cogged Blower Pulley
  b.part(
    new THREE.CylinderGeometry(0.11, 0.11, 0.07, 12),
    C.flamePink,
    {
      bone: engineJoint,
      at: [0, 1.96, 1.38],
      dir: [0, 0, 1],
      name: "blower_pulley_top",
    }
  );
  // Lower Crankshaft Pulley
  b.part(
    new THREE.CylinderGeometry(0.13, 0.13, 0.07, 12),
    C.flamePink,
    {
      bone: engineJoint,
      at: [0, 1.48, 1.36],
      dir: [0, 0, 1],
      name: "crank_pulley",
    }
  );
  // Wide Black Cogged Drive Belt
  b.part(
    new THREE.BoxGeometry(0.06, 0.48, 0.05),
    C.ironDark,
    {
      bone: engineJoint,
      at: [0.10, 1.72, 1.37],
      name: "blower_belt_side_L",
    }
  );
  b.part(
    new THREE.BoxGeometry(0.06, 0.48, 0.05),
    C.ironDark,
    {
      bone: engineJoint,
      at: [-0.10, 1.72, 1.37],
      name: "blower_belt_side_R",
    }
  );

  // Enderle / Hilborn "Birdcatcher" Triple-Butterfly Blower Scoop
  b.part(
    new THREE.BoxGeometry(0.48, 0.22, 0.62),
    C.flamePink,
    {
      bone: engineJoint,
      at: [0, 2.22, 0.85],
      name: "blower_scoop_body",
    }
  );
  // Front Angled Intake Mouth
  b.part(
    new THREE.BoxGeometry(0.44, 0.18, 0.12),
    C.ironDark,
    {
      bone: engineJoint,
      at: [0, 2.22, 1.18],
      name: "scoop_mouth_cavity",
    }
  );
  // 3 Bright Red Round Throttle Butterfly Plates
  for (const bfx of [-0.13, 0.0, 0.13]) {
    b.part(
      new THREE.CircleGeometry(0.055, 8),
      C.flameYellow,
      {
        bone: engineJoint,
        at: [bfx, 2.22, 1.23],
        dir: [0, 0, 1],
        axis: "z",
        name: `butterfly_plate_${bfx}`,
      }
    );
  }

  // 8 Zoomie Exhaust Header Pipes (4 per side sweeping out and up like dragon horns)
  for (const side of [1, -1]) {
    for (let pipe = 0; pipe < 4; pipe++) {
      const zOffset = 0.62 + pipe * 0.16;
      const rootP = [side * 0.32, 1.74, zOffset] as [number, number, number];
      const midP = [side * 0.58, 1.86, zOffset - 0.04] as [number, number, number];
      const tipP = [side * 0.72, 2.12 + pipe * 0.04, zOffset - 0.10] as [number, number, number];

      // Lower Header Pipe segment
      b.rod(rootP, midP, 0.030, C.chrome, {
        bone: engineJoint,
        name: `zoomie_lower_${side > 0 ? "L" : "R"}_${pipe}`,
      });
      // Swept-up Zoomie Tip
      b.rod(midP, tipP, 0.032, C.chrome, {
        bone: engineJoint,
        name: `zoomie_upper_${side > 0 ? "L" : "R"}_${pipe}`,
      });

      // Glowing Fire-Orange Internal Exhaust Flare
      glow(
        b.part(
          new THREE.CylinderGeometry(0.024, 0.024, 0.04, 6),
          C.fireOrange,
          {
            bone: engineJoint,
            at: tipP,
            dir: [side * 0.3, 1, -0.2],
            name: `exhaust_fire_${side > 0 ? "L" : "R"}_${pipe}`,
          }
        ),
        C.fireGlow,
        2.2
      );
    }
  }

  // ---------------------------------------------------------------------------
  // 6. THE BEAST TRUCK BODY (Cab, Hood, Bed, Fenders)
  // ---------------------------------------------------------------------------
  // Main Cab Section (High-profile 80s monster truck cab)
  b.part(
    new THREE.BoxGeometry(1.42, 0.72, 1.35),
    C.bodyDark,
    {
      bone: root,
      at: [0, 2.30, 0.05],
      name: "cab_main_block",
    }
  );

  // Door Panels (Left & Right with 01 racing graphics & flame decals)
  for (const side of [1, -1]) {
    b.part(
      new THREE.PlaneGeometry(1.30, 0.65),
      "#ffffff",
      {
        bone: root,
        at: [side * 0.715, 2.30, 0.05],
        dir: [side, 0, 0],
        axis: "z",
        texture: TEX_DOOR,
        name: `door_panel_${side > 0 ? "L" : "R"}`,
      }
    );
  }

  // Raked Windshield (Tinted glass with pixel glare)
  b.part(
    new THREE.PlaneGeometry(1.24, 0.68),
    "#ffffff",
    {
      bone: root,
      at: [0, 2.38, 0.75],
      dir: [0, 0.5, 0.86],
      axis: "z",
      texture: TEX_WINDSHIELD,
      name: "windshield_glass",
    }
  );

  // Rear Cab Window
  b.part(
    new THREE.PlaneGeometry(1.10, 0.45),
    C.glassTint,
    {
      bone: root,
      at: [0, 2.42, -0.63],
      dir: [0, 0, -1],
      axis: "z",
      name: "rear_window",
    }
  );

  // Cab Roof Visor & Sun Shield
  b.part(
    new THREE.BoxGeometry(1.46, 0.08, 0.32),
    C.flamePink,
    {
      bone: root,
      at: [0, 2.70, 0.65],
      rotation: [12, 0, 0],
      name: "cab_roof_visor",
    }
  );

  // 5 Roof-Mounted KC Rally Lights (Yellow glowing glass)
  for (let li = -2; li <= 2; li++) {
    const lx = li * 0.26;
    // Light Pod Housing
    b.part(
      new THREE.CylinderGeometry(0.08, 0.08, 0.08, 8),
      C.ironDark,
      {
        bone: root,
        at: [lx, 2.82, 0.60],
        dir: [0, 0, 1],
        name: `roof_light_housing_${li}`,
      }
    );
    // Glowing Yellow Lens
    glow(
      b.part(
        new THREE.CircleGeometry(0.075, 8),
        C.flameYellow,
        {
          bone: root,
          at: [lx, 2.82, 0.645],
          dir: [0, 0, 1],
          axis: "z",
          name: `roof_light_lens_${li}`,
        }
      ),
      C.flameYellow,
      1.8
    );
  }

  // Sculpted Hood with Flame Decal
  b.part(
    new THREE.BoxGeometry(1.36, 0.22, 1.15),
    C.bodyDark,
    {
      bone: root,
      at: [0, 2.02, 1.30],
      rotation: [-4, 0, 0],
      name: "hood_base",
    }
  );
  // Hood Surface Texture Plate (flames + scoop border)
  b.part(
    new THREE.PlaneGeometry(1.34, 1.12),
    "#ffffff",
    {
      bone: root,
      at: [0, 2.135, 1.30],
      dir: [0, 1, 0],
      axis: "z",
      rotation: [-4, 0, 0],
      texture: TEX_HOOD,
      name: "hood_flame_plate",
    }
  );

  // Front Fascia & Chrome Skull Grille
  b.part(
    new THREE.BoxGeometry(1.38, 0.38, 0.12),
    C.bodyDark,
    {
      bone: root,
      at: [0, 1.95, 1.90],
      name: "front_fascia",
    }
  );
  // Grille Plate with Headlights
  glow(
    b.part(
      new THREE.PlaneGeometry(1.34, 0.36),
      "#ffffff",
      {
        bone: root,
        at: [0, 1.95, 1.965],
        dir: [0, 0, 1],
        axis: "z",
        texture: TEX_GRILLE,
        name: "grille_plate",
      }
    ),
    "#fff5cc",
    1.4
  );

  // Flared Front & Rear Wheel Arch Fenders
  for (const side of [1, -1]) {
    // Front Flared Arch
    b.part(
      new THREE.BoxGeometry(0.18, 0.24, 1.10),
      C.flamePink,
      {
        bone: root,
        at: [side * 0.78, 2.06, 1.35],
        name: `fender_flare_front_${side > 0 ? "L" : "R"}`,
      }
    );
    // Rear Flared Arch
    b.part(
      new THREE.BoxGeometry(0.18, 0.24, 1.25),
      C.flamePink,
      {
        bone: root,
        at: [side * 0.78, 2.06, -1.35],
        name: `fender_flare_rear_${side > 0 ? "L" : "R"}`,
      }
    );
  }

  // Pickup Truck Bed Sides & Floor
  // Left Bed Wall
  b.part(
    new THREE.BoxGeometry(0.12, 0.52, 1.35),
    C.bodyDark,
    {
      bone: root,
      at: [0.68, 2.18, -1.30],
      name: "bed_wall_L",
    }
  );
  // Right Bed Wall
  b.part(
    new THREE.BoxGeometry(0.12, 0.52, 1.35),
    C.bodyDark,
    {
      bone: root,
      at: [-0.68, 2.18, -1.30],
      name: "bed_wall_R",
    }
  );
  // Recessed Diamond-Plate Bed Floor
  b.part(
    new THREE.BoxGeometry(1.24, 0.06, 1.32),
    C.chromeDark,
    {
      bone: root,
      at: [0, 1.94, -1.30],
      name: "bed_floor",
    }
  );
  b.part(
    new THREE.PlaneGeometry(1.20, 1.28),
    "#ffffff",
    {
      bone: root,
      at: [0, 1.975, -1.30],
      dir: [0, 1, 0],
      axis: "z",
      texture: TEX_BED_FLOOR,
      name: "bed_floor_plate",
    }
  );

  // Tailgate with caution chevron stripes & taillights
  b.part(
    new THREE.BoxGeometry(1.36, 0.48, 0.10),
    C.bodyDark,
    {
      bone: root,
      at: [0, 2.18, -1.98],
      name: "tailgate_block",
    }
  );
  b.part(
    new THREE.PlaneGeometry(1.32, 0.44),
    "#ffffff",
    {
      bone: root,
      at: [0, 2.18, -2.035],
      dir: [0, 0, -1],
      axis: "z",
      texture: TEX_TAILGATE,
      name: "tailgate_plate",
    }
  );

  // ---------------------------------------------------------------------------
  // 7. BED ACCESSORIES (Twin Radiators, NOS Bottles, High Trophy Wing)
  // ---------------------------------------------------------------------------
  // Dual Angled Radiator Core Coolers with Electric Fans
  for (const side of [1, -1]) {
    // Radiator Box
    b.part(
      new THREE.BoxGeometry(0.38, 0.38, 0.08),
      C.ironDark,
      {
        bone: root,
        at: [side * 0.32, 2.22, -0.95],
        rotation: [28, 0, 0],
        name: `radiator_box_${side > 0 ? "L" : "R"}`,
      }
    );
    // Circular Fan Cowl & Blade Shroud
    b.part(
      new THREE.TorusGeometry(0.14, 0.02, 6, 10),
      C.chassis,
      {
        bone: root,
        at: [side * 0.32, 2.22, -0.91],
        dir: [0, -0.47, 0.88],
        name: `fan_shroud_${side > 0 ? "L" : "R"}`,
      }
    );
  }

  // Dual Racing NOS (Nitrous Oxide) / Fire Suppression Bottles
  for (const side of [1, -1]) {
    b.part(
      new THREE.CylinderGeometry(0.08, 0.08, 0.42, 8),
      C.nitroCyan,
      {
        bone: root,
        at: [side * 0.44, 2.22, -1.55],
        dir: [0, 1, 0],
        name: `nos_bottle_${side > 0 ? "L" : "R"}`,
      }
    );
    // Chrome Valve & Pressure Gauge
    b.part(
      new THREE.CylinderGeometry(0.03, 0.03, 0.06, 6),
      C.chrome,
      {
        bone: root,
        at: [side * 0.44, 2.45, -1.55],
        dir: [0, 1, 0],
        name: `nos_valve_${side > 0 ? "L" : "R"}`,
      }
    );
  }

  // Racing Aluminum Fuel Cell Tank in Center Bed
  b.part(
    new THREE.BoxGeometry(0.48, 0.28, 0.34),
    C.chrome,
    {
      bone: root,
      at: [0, 2.10, -1.45],
      name: "fuel_cell_tank",
    }
  );
  // Dual Red Quick-Fill Caps
  b.part(
    new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8),
    C.flamePink,
    {
      bone: root,
      at: [-0.10, 2.26, -1.45],
      dir: [0, 1, 0],
      name: "fuel_cap_R",
    }
  );
  b.part(
    new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8),
    C.flamePink,
    {
      bone: root,
      at: [0.10, 2.26, -1.45],
      dir: [0, 1, 0],
      name: "fuel_cap_L",
    }
  );

  // High-Mount Trophy Truck Rear Aero Wing on Tubular Stanchions
  // Twin Tubular Uprights
  b.rod(
    [-0.42, 2.30, -1.75],
    [-0.48, 2.85, -1.88],
    0.028,
    C.chassis,
    { bone: root, name: "wing_strut_R" }
  );
  b.rod(
    [0.42, 2.30, -1.75],
    [0.48, 2.85, -1.88],
    0.028,
    C.chassis,
    { bone: root, name: "wing_strut_L" }
  );
  // Main Wing Blade
  b.part(
    new THREE.BoxGeometry(1.58, 0.06, 0.38),
    C.flamePink,
    {
      bone: root,
      at: [0, 2.85, -1.88],
      rotation: [-8, 0, 0],
      name: "rear_wing_blade",
    }
  );
  // Wing Aggressive Side Endplates
  for (const side of [1, -1]) {
    b.part(
      new THREE.BoxGeometry(0.03, 0.32, 0.44),
      C.flameCyan,
      {
        bone: root,
        at: [side * 0.80, 2.85, -1.88],
        rotation: [-8, 0, 0],
        name: `wing_endplate_${side > 0 ? "L" : "R"}`,
      }
    );
  }

  // ---------------------------------------------------------------------------
  // 8. COCKPIT INTERIOR DETAILS
  // ---------------------------------------------------------------------------
  // High-Back Racing Bucket Seat
  b.part(
    new THREE.BoxGeometry(0.42, 0.52, 0.38),
    C.seatRed,
    {
      bone: root,
      at: [0, 2.30, 0.15],
      name: "racing_seat",
    }
  );
  // Headrest
  b.part(
    new THREE.BoxGeometry(0.24, 0.20, 0.18),
    C.seatRed,
    {
      bone: root,
      at: [0, 2.62, 0.12],
      name: "seat_headrest",
    }
  );
  // Driver Racing Helmet
  b.part(
    new THREE.SphereGeometry(0.12, 8, 6),
    C.flameYellow,
    {
      bone: root,
      at: [0, 2.50, 0.22],
      name: "driver_helmet",
    }
  );
  // Steering Wheel
  b.part(
    new THREE.TorusGeometry(0.10, 0.02, 6, 8),
    C.ironDark,
    {
      bone: root,
      at: [0, 2.35, 0.48],
      dir: [0, 0.5, 0.86],
      name: "steering_wheel",
    }
  );

  // ---------------------------------------------------------------------------
  // 9. ARENA STAGING: Dirt Mound Base, Crushed Taxi & Track Props
  // ---------------------------------------------------------------------------
  // Main Arena Dirt Mound Plinth (Stands on y = 0, surface at y = 0.06)
  b.part(
    new THREE.BoxGeometry(4.2, 0.06, 5.6),
    C.dirtDark,
    {
      at: [0, 0.03, 0],
      name: "arena_plinth_base",
    }
  );
  // Textured Dirt Surface Plate with Chevron Tire Tracks
  b.part(
    new THREE.PlaneGeometry(4.16, 5.56),
    "#ffffff",
    {
      at: [0, 0.062, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: TEX_ARENA_DIRT,
      name: "arena_dirt_plate",
    }
  );

  // Dirt Ramp Mound behind front wheels
  b.part(
    new THREE.BoxGeometry(1.6, 0.10, 0.8),
    C.dirtMid,
    {
      at: [0, 0.08, 0.9],
      rotation: [10, 0, 0],
      name: "dirt_jump_ramp",
    }
  );

  // CRUSHED TAXI CAR PROP (Flattened compact sedan beside the truck)
  // Pancaked car body: 1.8m x 0.22m x 3.2m
  const TAXI_POS: [number, number, number] = [-1.55, 0.16, 0.35];
  b.part(
    new THREE.BoxGeometry(1.65, 0.20, 2.8),
    C.crushedTaxi,
    {
      at: TAXI_POS,
      rotation: [0, 14, 0],
      name: "crushed_taxi_body",
    }
  );
  // Smashed Roof Plate with cracked windshield and taxi checkered stripe
  b.part(
    new THREE.PlaneGeometry(1.62, 2.76),
    "#ffffff",
    {
      at: [TAXI_POS[0], TAXI_POS[1] + 0.102, TAXI_POS[2]],
      dir: [0, 1, 0],
      axis: "z",
      rotation: [0, 14, 0],
      texture: TEX_CRUSHED_TAXI,
      name: "crushed_taxi_roof",
    }
  );
  // Crushed Splayed Taxi Wheels
  for (const [cx, cz] of [
    [-0.85, 0.9],
    [0.85, 0.9],
    [-0.85, -0.9],
    [0.85, -0.9],
  ]) {
    b.part(
      new THREE.CylinderGeometry(0.22, 0.22, 0.14, 8),
      C.rubberDark,
      {
        at: [TAXI_POS[0] + cx, 0.12, TAXI_POS[2] + cz],
        dir: [0.9, 0.4, 0],
        name: `taxi_wheel_${cx}_${cz}`,
      }
    );
  }

  // 2 Orange & White Striped Arena Traffic Cones
  for (const [coneX, coneZ] of [
    [1.75, 2.3],
    [-1.75, -2.2],
  ]) {
    // Cone Base Square
    b.part(
      new THREE.BoxGeometry(0.32, 0.04, 0.32),
      C.flameOrange,
      {
        at: [coneX, 0.08, coneZ],
        name: `cone_base_${coneX}`,
      }
    );
    // Cone Body
    b.part(
      new THREE.ConeGeometry(0.12, 0.48, 8),
      C.flameOrange,
      {
        at: [coneX, 0.32, coneZ],
        name: `cone_body_${coneX}`,
      }
    );
    // White Reflective Stripe Ring
    b.part(
      new THREE.CylinderGeometry(0.075, 0.095, 0.12, 8),
      "#ffffff",
      {
        at: [coneX, 0.30, coneZ],
        name: `cone_stripe_${coneX}`,
      }
    );
  }

  // Squashed 55-Gallon Steel Oil Drum Prop
  b.part(
    new THREE.CylinderGeometry(0.26, 0.28, 0.45, 8),
    C.flamePink,
    {
      at: [1.75, 0.28, -1.8],
      rotation: [65, 20, 0],
      scale: [1.1, 0.7, 1.0], // dented / crushed oval
      name: "crushed_oil_drum",
    }
  );

  // Checkered Victory Flag on Steel Pole
  b.rod(
    [1.85, 0.06, 2.2],
    [1.85, 1.85, 2.2],
    0.022,
    C.chrome,
    { name: "flag_pole" }
  );
  // Pixel Checkered Flag
  const TEX_FLAG = makePixelTexture(16, 12, (set) => {
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 16; x++) {
        const chk = (Math.floor(x / 2) + Math.floor(y / 2)) % 2 === 0;
        set(x, y, chk ? "#ffffff" : "#111116");
      }
    }
  });
  b.part(
    new THREE.PlaneGeometry(0.55, 0.40),
    "#ffffff",
    {
      at: [1.85 + 0.28, 1.62, 2.2],
      dir: [0, 0, 1],
      axis: "z",
      texture: TEX_FLAG,
      name: "checkered_flag_mesh",
    }
  );

  return b.root;
}
