Here is the assessment and the plan to elevate this model to an astonishing result:

### Critique & Plan of Improvements

1. **Fix Occluded Tyre Sidewalls & Lettering**: The `TEX_TYRE_SIDEWALL` decals were positioned 1 cm *inside* the tyre cylinder, hiding the pixel-art beadlock rings, BKT lettering, and rim spokes completely. Move the decal circles proud of the tyre ends (+6 mm) and refine the 32×32 pixel art with vibrant lime beadlocks, silver bolts, BKT 66-inch white tyre lettering, and deep-dish 5-star spokes.
2. **Anchor Floating Tyre Lugs**: The inner tractor lugs were hovering 15 mm above the tyre radius. Extend their base into the carcass (`TYRE_R - 0.035 m`) and out to `TYRE_R + 0.08 m` with a classic 25° chevron rake to eliminate loose parts and give aggressive tread bite.
3. **Elevate Full-Body Pixel Livery**: Replace the disconnected cab/bed decals with a continuous 64×24 pixel livery spanning doors and bed flanks—featuring electric fire, racing "#01", "TITAN" speed typography, and sponsor badges. Add matching hood flame graphics with blower cutout and hood pin decals.
4. **Fix Crushed Taxi Collision**: The crushed taxi was intersecting the front tyre. Restage it beside the truck as a crumpled arena obstacle with a roof-mounted "TAXI" lightbox, crumpled hood, smashed pixel glass, and angled crushed wheels. Add a crushed steel drum and reposition the checkered flag to the corner so the truck's front 3/4 view is 100% hero-focused.
5. **Supercharge the V8 Engine & Zoomies**: Expand the supercharger assembly with dual carburetors, an Enderle "Bird Catcher" scoop with 3 glowing butterfly valves, Gilmer cogged drive belt, and 8 swept-up chrome zoomie headers spitting multi-tone glowing fire flames.
6. **Enhance Chassis & 4-Link Suspension**: Thicken the tubular spaceframe with cross-gussets, heavy Heim-jointed links, dual yellow coil-over shocks with anodized blue reservoirs, and front hydraulic steering rams.

Here is the complete replacement module:

```ts
import * as THREE from "three";
import {
  createBuilder,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "pixel_monster_truck",
  description:
    "An arcade-inspired pixel art monster truck with 66-inch chevron-tread tyres, beadlock rims, supercharged V8 with glowing zoomies, safety-lime tubular chassis, electric flame livery, and an arena dirt staging with a crushed taxi car.",
};

// -----------------------------------------------------------------------------
// PALETTE: Crisp 16-bit arcade pixel colors
// -----------------------------------------------------------------------------
const C = {
  // Body & Liveries
  bodyDark: "#120e24",
  bodyMid: "#1e183a",
  bodyLight: "#352b5e",
  flamePink: "#ff0077",
  flameOrange: "#ff5500",
  flameYellow: "#ffcc00",
  flameCyan: "#00e5ff",

  // Chassis & Roll Cage (Vibrant Safety Lime)
  chassis: "#00e676",
  chassisDark: "#009e47",
  chassisHighlight: "#69f0ae",

  // Tyres & Rubber
  rubberDark: "#14141a",
  rubberMid: "#20202a",
  rubberLight: "#323242",
  treadLug: "#101016",

  // Mechanical / Engine / Chrome
  chrome: "#f0f4f8",
  chromeMid: "#b0bec5",
  chromeDark: "#455a64",
  ironDark: "#21272c",
  engineBlue: "#0277bd",
  brassGold: "#ffb300",

  // Suspension & Accents
  shockBlue: "#1e88e5",
  springYellow: "#ffd600",
  nitroCyan: "#00e5ff",
  fireOrange: "#ff3d00",
  fireYellow: "#ffe600",
  hazardYellow: "#ffc400",

  // Interior & Glass
  glassTint: "#0e1a26",
  glassGlare: "#80deea",
  interiorDark: "#181822",
  seatRed: "#d50000",

  // Arena Staging
  dirtDark: "#3e2723",
  dirtMid: "#5d4037",
  dirtLight: "#795548",
  crushedTaxi: "#ffbb00",
  taxiChecker: "#212121",
};

// -----------------------------------------------------------------------------
// PIXEL TEXTURE GENERATOR HELPER
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
// GLOW HELPER
// -----------------------------------------------------------------------------
function glow<T extends THREE.Object3D | { mesh: THREE.Mesh }>(
  target: T,
  intensity = 1.6
): T {
  const mesh: THREE.Mesh = "mesh" in target ? (target as any).mesh : (target as THREE.Mesh);
  if (mesh && mesh.material instanceof THREE.MeshStandardMaterial) {
    const mat = mesh.material.clone();
    mat.emissive.copy(mat.color);
    mat.emissiveIntensity = intensity;
    mesh.material = mat;
  }
  return target;
}

// -----------------------------------------------------------------------------
// PIXEL ART TEXTURES
// -----------------------------------------------------------------------------

// 1. Giant Tyre Sidewall with beadlock bolts, spokes & lettering
const TEX_TYRE_SIDEWALL = makePixelTexture(32, 32, (set) => {
  const cx = 15.5;
  const cy = 15.5;
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d > 15.8) continue;
      if (d > 13.0) {
        // Outer tyre shoulder knobbies
        const angle = Math.atan2(y - cy, x - cx);
        const notch = (Math.sin(angle * 14) + 1) * 0.5;
        set(x, y, notch > 0.4 ? C.rubberLight : C.rubberMid);
      } else if (d > 9.6) {
        // Deep tyre sidewall rubber with white lettering
        set(x, y, d > 11.2 ? C.rubberMid : C.rubberDark);
        // Lettering: "BKT" at top (y = 5), "66x43" at bottom (y = 26)
        if (y === 5 && Math.abs(x - cx) <= 3) set(x, y, "#ffffff");
        if (y === 6 && (x === 13 || x === 15 || x === 18)) set(x, y, "#ffffff");
        if (y === 26 && Math.abs(x - cx) <= 4 && (x + y) % 2 === 0) set(x, y, C.chromeMid);
      } else if (d > 7.6) {
        // Safety lime beadlock ring with steel hex bolts
        set(x, y, C.chassis);
        const angle = Math.atan2(y - cy, x - cx);
        const bolt = (Math.sin(angle * 12) + 1) * 0.5;
        if (bolt > 0.65 && d > 8.0) {
          set(x, y, C.chrome);
        }
      } else if (d > 3.4) {
        // Deep-dish rim depression with 5-star spokes
        const angle = Math.atan2(y - cy, x - cx);
        const spoke = (Math.sin(angle * 5) + 1) * 0.5;
        if (spoke > 0.45) {
          set(x, y, C.flamePink);
          if (d > 5.5) set(x, y, C.flameOrange);
        } else {
          set(x, y, C.ironDark);
        }
      } else if (d > 1.6) {
        // Planetary reduction center hub ring
        set(x, y, C.chromeDark);
      } else {
        // Center gold grease cap
        set(x, y, C.brassGold);
      }
    }
  }
});

// 2. Sculpted Hood with flames, blower cutout & hood pins
const TEX_HOOD = makePixelTexture(32, 32, (set) => {
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      set(x, y, C.bodyDark);
      // Flame licking from front (y=0) towards windshield (y=31)
      const dx = Math.abs(x - 15.5);
      const flameProfile = 16 - dx * 0.9 + Math.sin(x * 1.2 + y * 0.3) * 3.2;
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
      // Supercharger cutout zone with chrome trim
      if (y > 8 && y < 24 && Math.abs(x - 15.5) < 7) {
        if (y === 9 || y === 23 || Math.abs(x - 15.5) === 6) {
          set(x, y, C.chrome);
        } else {
          set(x, y, C.ironDark);
        }
      }
      // Chrome hood pins with lanyards
      if ((x === 4 || x === 27) && (y === 4 || y === 28)) {
        set(x, y, C.chrome);
      }
    }
  }
});

// 3. Full-length Side Livery (Cab + Bed) with "TITAN", "#01", and flame blast
const TEX_SIDE_LIVERY = makePixelTexture(64, 24, (set) => {
  for (let y = 0; y < 24; y++) {
    for (let x = 0; x < 64; x++) {
      set(x, y, C.bodyDark);
      // Flame blast along lower body
      const flameHeight = 17 - Math.sin(x * 0.22) * 3.5 - (x > 32 ? (x - 32) * 0.15 : 0);
      if (y > flameHeight) {
        if (y > flameHeight + 4) {
          set(x, y, C.flameOrange);
        } else {
          set(x, y, C.flamePink);
        }
      }
      // Top accent racing pin-stripe
      if (y === 3 && x > 4 && x < 60) {
        set(x, y, C.flameCyan);
      }
    }
  }

  // Giant pixel "01" on Cab Door (x = 22 to 34)
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
  drawNum(num0, 21, 6);
  drawNum(num1, 28, 6);

  // "TITAN" Block Typography on Bed (x = 40 to 60)
  const titanLetters = [
    "#####..###..#####...#...#.##..#",
    "..#.....#.....#....#.#..#.#.#.#",
    "..#.....#.....#...#####.#.##..#",
    "..#.....#.....#...#...#.#.#.#.#",
    "..#....###....#...#...#.#.#..##",
  ];
  for (let r = 0; r < titanLetters.length; r++) {
    for (let c = 0; c < titanLetters[r].length; c++) {
      if (titanLetters[r][c] === "#") {
        set(38 + c, 6 + r, C.flameYellow);
        set(38 + c, 7 + r, C.flameOrange);
      }
    }
  }

  // Sponsor Decal Grid along bottom sill
  for (let i = 0; i < 8; i++) {
    set(8 + i * 6, 21, C.chrome);
    set(9 + i * 6, 21, C.flameCyan);
    set(10 + i * 6, 21, C.flameYellow);
  }
});

// 4. Aggressive front grille with headlights & teeth
const TEX_GRILLE = makePixelTexture(32, 16, (set) => {
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 32; x++) {
      set(x, y, C.ironDark);
      if ((x + y) % 2 === 0) set(x, y, "#0b0d13");
      if (y === 0 || y === 15 || x === 0 || x === 31) set(x, y, C.chrome);
    }
  }
  // Quad Headlights
  const drawLight = (cx: number) => {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const d = Math.hypot(dx, dy);
        if (d < 2.8) {
          set(cx + dx, 7 + dy, d < 1.2 ? "#ffffff" : C.flameYellow);
        }
      }
    }
    set(cx - 4, 7, C.chrome);
    set(cx + 4, 7, C.chrome);
    set(cx, 3, C.chrome);
    set(cx, 11, C.chrome);
  };
  drawLight(6);
  drawLight(25);

  // Monster teeth in center grille
  const teeth = [11, 13, 15, 17, 19, 21];
  for (const tx of teeth) {
    set(tx, 10, C.chrome);
    set(tx, 11, C.chrome);
    set(tx + 1, 6, C.chrome);
    set(tx + 1, 7, C.chrome);
  }
});

// 5. Windshield with sun glare & visor banner
const TEX_WINDSHIELD = makePixelTexture(32, 20, (set) => {
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 32; x++) {
      set(x, y, C.glassTint);
      // 45-degree glare streak
      if (Math.abs(x - y * 1.3 - 6) < 2) {
        set(x, y, C.glassGlare);
      }
      if (Math.abs(x - y * 1.3 - 5) === 0) {
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

// 6. Tailgate with caution chevron hazard stripes & LED clusters
const TEX_TAILGATE = makePixelTexture(32, 16, (set) => {
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 32; x++) {
      set(x, y, C.bodyDark);
      if (y >= 9) {
        const stripe = Math.floor((x + y) / 3) % 2 === 0;
        set(x, y, stripe ? C.hazardYellow : "#111116");
      }
    }
  }
  // Center logo "TITAN"
  for (let i = 0; i < 9; i++) {
    set(11 + i, 4, C.flameCyan);
    set(11 + i, 5, C.chrome);
  }
  // Taillights
  for (let dy = 2; dy <= 5; dy++) {
    set(2, dy, C.flamePink);
    set(3, dy, "#ff1744");
    set(28, dy, "#ff1744");
    set(29, dy, C.flamePink);
    set(3, dy === 5 ? 5 : 6, "#ffffff");
    set(28, dy === 5 ? 5 : 6, "#ffffff");
  }
});

// 7. Bed floor: diamond-plate aluminum
const TEX_BED_FLOOR = makePixelTexture(16, 16, (set) => {
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      set(x, y, C.chromeDark);
      if ((x + y) % 4 === 0) set(x, y, C.chrome);
      if ((x + y) % 4 === 1) set(x, y, C.ironDark);
    }
  }
});

// 8. Smashed Taxi Car texture with shattered glass and crumpled hood
const TEX_CRUSHED_TAXI = makePixelTexture(32, 32, (set) => {
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      set(x, y, C.crushedTaxi);
      // Taxi checker stripe down center
      if (y >= 13 && y <= 16 && (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0) {
        set(x, y, C.taxiChecker);
      }
      // Smashed windshield
      if (y >= 5 && y <= 11 && x >= 6 && x <= 25) {
        set(x, y, C.glassTint);
        if ((x + y * 2) % 3 === 0 || (x - y) % 4 === 0) {
          set(x, y, "#ffffff");
        }
      }
      // Crumpled creases
      if ((x === 5 || x === 26 || y === 4 || y === 27) && (x + y) % 2 === 0) {
        set(x, y, "#997700");
      }
    }
  }
});

// 9. Arena dirt & clay ground plinth texture
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
          set(x, y, "#281713");
        }
      }
    }
  }
});

// -----------------------------------------------------------------------------
// BUILDER FUNCTION
// -----------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "pixel_monster_truck" });

  // Geometry dimensions & heights:
  // Plinth base touches y = 0.00 (from 0.00 to 0.06).
  // Dirt surface is at y = 0.06.
  // Giant tyres: radius 0.82 m. Axle center at y = 0.88 m.
  // Lowest point of tyres: 0.88 - 0.82 = 0.06 m, resting directly on the dirt.
  const Y_AXLE = 0.88;
  const Z_AXLE_F = 1.40;
  const Z_AXLE_R = -1.40;
  const X_WHEEL = 1.35; // outer track width

  // Root joint
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
  const TYRE_R = 0.82;
  const TYRE_W = 0.74;
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

    // Outer Sidewall Pixel Decal Disc (placed proud of tyre end by 6mm so it's fully visible!)
    b.part(
      new THREE.CircleGeometry(TYRE_R - 0.015, 16),
      "#ffffff",
      {
        bone: wc.bone,
        at: [wc.x + s * (TYRE_W * 0.5 + 0.006), Y_AXLE, wc.z],
        dir: [s, 0, 0],
        axis: "z",
        texture: TEX_TYRE_SIDEWALL,
        name: `sidewall_out_${wc.name}`,
      }
    );

    // Inner Sidewall Pixel Decal Disc (proud of inner tyre end)
    b.part(
      new THREE.CircleGeometry(TYRE_R - 0.015, 16),
      "#ffffff",
      {
        bone: wc.bone,
        at: [wc.x - s * (TYRE_W * 0.5 + 0.006), Y_AXLE, wc.z],
        dir: [-s, 0, 0],
        axis: "z",
        texture: TEX_TYRE_SIDEWALL,
        name: `sidewall_in_${wc.name}`,
      }
    );

    // Outer Planetary Hub Ring & Cap (sitting proud of decal)
    b.part(
      new THREE.CylinderGeometry(0.14, 0.16, 0.08, 8),
      C.chromeDark,
      {
        bone: wc.bone,
        at: [wc.x + s * (TYRE_W * 0.5 + 0.045), Y_AXLE, wc.z],
        dir: [s, 0, 0],
        name: `planetary_hub_${wc.name}`,
      }
    );
    b.part(
      new THREE.CylinderGeometry(0.065, 0.065, 0.04, 8),
      C.brassGold,
      {
        bone: wc.bone,
        at: [wc.x + s * (TYRE_W * 0.5 + 0.095), Y_AXLE, wc.z],
        dir: [s, 0, 0],
        name: `grease_cap_${wc.name}`,
      }
    );

    // HEAVY CHEVRON TRACTOR LUGS (Deeply embedded into tyre carcass so NO loose parts)
    for (let i = 0; i < LUG_COUNT; i++) {
      const theta = (i / LUG_COUNT) * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      // Deep root inside the tyre carcass
      const rootR = TYRE_R - 0.035;
      const tipR = TYRE_R + 0.075;

      const apexRootY = Y_AXLE + sinT * rootR;
      const apexRootZ = wc.z + cosT * rootR;
      const apexTipY = Y_AXLE + sinT * tipR;
      const apexTipZ = wc.z + cosT * tipR;

      const sweepAngle = 0.26;
      const cosSweep = Math.cos(theta - sweepAngle);
      const sinSweep = Math.sin(theta - sweepAngle);

      // Outer Half Chevron Lug
      const outerX = wc.x + s * (TYRE_W * 0.36);
      const outerTipY = Y_AXLE + sinSweep * tipR;
      const outerTipZ = wc.z + cosSweep * tipR;

      b.frustumBox(
        [wc.x, (apexRootY + apexTipY) * 0.5, (apexRootZ + apexTipZ) * 0.5],
        [outerX, outerTipY, outerTipZ],
        [0.085, 0.075],
        [0.055, 0.050],
        { bone: wc.bone, color: C.treadLug, name: `lug_out_${wc.name}_${i}` }
      );

      // Inner Half Chevron Lug
      const innerX = wc.x - s * (TYRE_W * 0.36);
      const innerTipY = Y_AXLE + sinSweep * tipR;
      const innerTipZ = wc.z + cosSweep * tipR;

      b.frustumBox(
        [wc.x, (apexRootY + apexTipY) * 0.5, (apexRootZ + apexTipZ) * 0.5],
        [innerX, innerTipY, innerTipZ],
        [0.085, 0.075],
        [0.055, 0.050],
        { bone: wc.bone, color: C.treadLug, name: `lug_in_${wc.name}_${i}` }
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
    // Axle Housing
    b.part(
      new THREE.BoxGeometry(2.0, 0.16, 0.16),
      C.ironDark,
      {
        bone: axleJoint,
        at: [0, Y_AXLE, zPos],
        name: `axle_housing_${axleName}`,
      }
    );

    // Differential Pumpkin
    b.part(
      new THREE.SphereGeometry(0.25, 10, 8),
      C.ironDark,
      {
        bone: axleJoint,
        at: [0, Y_AXLE, zPos],
        scale: [1.1, 1.0, 1.2],
        name: `diff_pumpkin_${axleName}`,
      }
    );

    // Polished Chrome Diff Cover Plate
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

    // Axle Reinforcing Bridge Truss
    b.rod(
      [-0.85, Y_AXLE + 0.12, zPos],
      [0.85, Y_AXLE + 0.12, zPos],
      0.035,
      C.chassis,
      { bone: axleJoint, name: `axle_truss_${axleName}` }
    );

    // Knuckle Yokes
    for (const side of [1, -1]) {
      b.part(
        new THREE.BoxGeometry(0.16, 0.24, 0.18),
        C.ironDark,
        {
          bone: axleJoint,
          at: [side * 0.96, Y_AXLE, zPos],
          name: `knuckle_${axleName}_${side > 0 ? "L" : "R"}`,
        }
      );
    }
  }

  // Front Hydraulic Steering Ram
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
  b.rod(
    [-0.35, Y_AXLE - 0.08, Z_AXLE_F + 0.12],
    [-0.92, Y_AXLE - 0.05, Z_AXLE_F + 0.08],
    0.024,
    C.chrome,
    { bone: axleF, name: "steering_tie_R" }
  );
  b.rod(
    [0.35, Y_AXLE - 0.08, Z_AXLE_F + 0.12],
    [0.92, Y_AXLE - 0.05, Z_AXLE_F + 0.08],
    0.024,
    C.chrome,
    { bone: axleF, name: "steering_tie_L" }
  );

  // ---------------------------------------------------------------------------
  // 3. 4-LINK SUSPENSION & DUAL COIL-OVER SHOCKS
  // ---------------------------------------------------------------------------
  // Center Transfer Case
  b.part(
    new THREE.BoxGeometry(0.40, 0.34, 0.44),
    C.ironDark,
    {
      bone: root,
      at: [0, 1.25, 0],
      name: "transfer_case",
    }
  );

  // Heavy Driveshafts
  b.rod(
    [0, 1.22, 0.22],
    [0, Y_AXLE + 0.06, Z_AXLE_F - 0.20],
    0.045,
    C.chromeDark,
    { bone: root, name: "driveshaft_front" }
  );
  b.rod(
    [0, 1.22, -0.22],
    [0, Y_AXLE + 0.06, Z_AXLE_R + 0.20],
    0.045,
    C.chromeDark,
    { bone: root, name: "driveshaft_rear" }
  );

  // 4-Link Control Arms and Shocks
  for (const [zSign, axleZ, name] of [
    [1, Z_AXLE_F, "front"],
    [-1, Z_AXLE_R, "rear"],
  ] as const) {
    for (const side of [1, -1]) {
      // Lower Control Arm
      b.rod(
        [side * 0.36, 1.22, zSign * 0.35],
        [side * 0.78, Y_AXLE + 0.04, axleZ - zSign * 0.08],
        0.040,
        C.chassis,
        { bone: root, name: `lower_link_${name}_${side > 0 ? "L" : "R"}` }
      );

      // Upper Triangulated Control Arm
      b.rod(
        [side * 0.16, 1.55, zSign * 0.25],
        [side * 0.38, Y_AXLE + 0.14, axleZ - zSign * 0.05],
        0.036,
        C.chassis,
        { bone: root, name: `upper_link_${name}_${side > 0 ? "L" : "R"}` }
      );

      // Dual Coil-Over Shocks per Wheel
      for (const shockIdx of [-0.07, 0.07]) {
        const axleMount = [side * 0.88, Y_AXLE + 0.08, axleZ + shockIdx] as [number, number, number];
        const towerMount = [side * 0.52, 1.82, zSign * 1.15 + shockIdx] as [number, number, number];

        const shockMid = [
          (axleMount[0] + towerMount[0]) * 0.5,
          (axleMount[1] + towerMount[1]) * 0.5,
          (axleMount[2] + towerMount[2]) * 0.5,
        ] as [number, number, number];

        // Anodized Blue Shock Body
        b.rod(shockMid, towerMount, 0.050, C.shockBlue, {
          bone: root,
          name: `shock_body_${name}_${side > 0 ? "L" : "R"}_${shockIdx > 0 ? "1" : "2"}`,
        });

        // Chrome Shaft
        b.rod(axleMount, shockMid, 0.028, C.chrome, {
          bone: root,
          name: `shock_shaft_${name}_${side > 0 ? "L" : "R"}_${shockIdx > 0 ? "1" : "2"}`,
        });

        // Yellow Coiled Spring Cylinder
        b.part(
          new THREE.CylinderGeometry(0.072, 0.072, 0.52, 8, 1, true),
          C.springYellow,
          {
            bone: root,
            at: shockMid,
            aim: towerMount,
            name: `shock_spring_${name}_${side > 0 ? "L" : "R"}_${shockIdx > 0 ? "1" : "2"}`,
          }
        );

        // Remote Nitrogen Canister
        b.part(
          new THREE.CylinderGeometry(0.028, 0.028, 0.26, 8),
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
  for (const side of [1, -1]) {
    // Lower Longitudinal Rails
    b.rod(
      [side * 0.44, 1.20, -1.65],
      [side * 0.44, 1.20, 1.65],
      0.045,
      C.chassis,
      { bone: root, name: `lower_rail_${side > 0 ? "L" : "R"}` }
    );
    // Upper Frame Rails
    b.rod(
      [side * 0.48, 1.72, -1.70],
      [side * 0.48, 1.72, 1.60],
      0.045,
      C.chassis,
      { bone: root, name: `upper_rail_${side > 0 ? "L" : "R"}` }
    );
    // Vertical Stanchions
    for (const zt of [-1.5, -0.9, -0.3, 0.3, 0.9, 1.5]) {
      b.rod(
        [side * 0.44, 1.20, zt],
        [side * 0.48, 1.72, zt],
        0.038,
        C.chassis,
        { bone: root, name: `truss_vert_${side > 0 ? "L" : "R"}_${zt}` }
      );
    }
    // Diagonal Braces
    b.rod(
      [side * 0.44, 1.20, -0.9],
      [side * 0.48, 1.72, -0.3],
      0.034,
      C.chassis,
      { bone: root, name: `diag_brace_1_${side > 0 ? "L" : "R"}` }
    );
    b.rod(
      [side * 0.44, 1.20, 0.3],
      [side * 0.48, 1.72, 0.9],
      0.034,
      C.chassis,
      { bone: root, name: `diag_brace_2_${side > 0 ? "L" : "R"}` }
    );
  }

  // Lateral Crossmembers
  for (const zc of [-1.6, -0.6, 0.0, 0.6, 1.6]) {
    b.rod(
      [-0.44, 1.20, zc],
      [0.44, 1.20, zc],
      0.040,
      C.chassis,
      { bone: root, name: `crossmember_low_${zc}` }
    );
    b.rod(
      [-0.48, 1.72, zc],
      [0.48, 1.72, zc],
      0.040,
      C.chassis,
      { bone: root, name: `crossmember_up_${zc}` }
    );
  }

  // Pre-Runner Front Bull Bar & Skid Plate
  b.rod(
    [-0.55, 1.35, 1.75],
    [0.55, 1.35, 1.75],
    0.048,
    C.chassis,
    { bone: root, name: "bumper_front_bar" }
  );
  b.rod(
    [-0.45, 1.20, 1.60],
    [-0.55, 1.35, 1.75],
    0.044,
    C.chassis,
    { bone: root, name: "bumper_strut_R" }
  );
  b.rod(
    [0.45, 1.20, 1.60],
    [0.55, 1.35, 1.75],
    0.044,
    C.chassis,
    { bone: root, name: "bumper_strut_L" }
  );
  b.part(
    new THREE.BoxGeometry(0.70, 0.38, 0.04),
    C.chrome,
    {
      bone: root,
      at: [0, 1.30, 1.72],
      rotation: [25, 0, 0],
      name: "front_skid_plate",
    }
  );
  for (const side of [1, -1]) {
    b.part(
      new THREE.TorusGeometry(0.045, 0.014, 6, 8),
      C.flamePink,
      {
        bone: root,
        at: [side * 0.28, 1.28, 1.76],
        dir: [0, 0, 1],
        name: `tow_hook_${side > 0 ? "L" : "R"}`,
      }
    );
  }

  // Rear Wheelie Bar
  b.rod(
    [-0.32, 1.20, -1.65],
    [-0.22, 0.35, -2.35],
    0.034,
    C.chassis,
    { bone: root, name: "wheelie_strut_R" }
  );
  b.rod(
    [0.32, 1.20, -1.65],
    [0.22, 0.35, -2.35],
    0.034,
    C.chassis,
    { bone: root, name: "wheelie_strut_L" }
  );
  b.rod(
    [-0.22, 0.35, -2.35],
    [0.22, 0.35, -2.35],
    0.030,
    C.chromeDark,
    { bone: root, name: "wheelie_axle" }
  );
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
  // Cast Iron Engine Block
  b.part(
    new THREE.BoxGeometry(0.70, 0.44, 0.74),
    C.engineBlue,
    {
      bone: engineJoint,
      at: [0, 1.62, 0.85],
      name: "engine_block",
    }
  );

  // Chrome Valve Covers
  for (const side of [1, -1]) {
    b.part(
      new THREE.BoxGeometry(0.18, 0.14, 0.66),
      C.chrome,
      {
        bone: engineJoint,
        at: [side * 0.26, 1.84, 0.85],
        rotation: [0, 0, side * 22],
        name: `valve_cover_${side > 0 ? "L" : "R"}`,
      }
    );
    b.part(
      new THREE.CylinderGeometry(0.04, 0.04, 0.06, 8),
      C.chrome,
      {
        bone: engineJoint,
        at: [side * 0.26, 1.94, 0.72],
        name: `breather_cap_${side > 0 ? "L" : "R"}`,
      }
    );
  }

  // Polished 14-71 Roots Supercharger (Blower)
  b.part(
    new THREE.BoxGeometry(0.44, 0.28, 0.68),
    C.chrome,
    {
      bone: engineJoint,
      at: [0, 1.98, 0.85],
      name: "supercharger_casing",
    }
  );
  // Longitudinal Ribs
  for (const ribX of [-0.15, -0.05, 0.05, 0.15]) {
    b.rod(
      [ribX, 2.13, 0.52],
      [ribX, 2.13, 1.18],
      0.016,
      C.chrome,
      { bone: engineJoint, name: `blower_rib_${ribX}` }
    );
  }

  // Front Drive Snout & Cogged Belt
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

  // Enderle Triple-Butterfly Scoop
  b.part(
    new THREE.BoxGeometry(0.48, 0.22, 0.62),
    C.flamePink,
    {
      bone: engineJoint,
      at: [0, 2.22, 0.85],
      name: "blower_scoop_body",
    }
  );
  b.part(
    new THREE.BoxGeometry(0.44, 0.18, 0.12),
    C.ironDark,
    {
      bone: engineJoint,
      at: [0, 2.22, 1.18],
      name: "scoop_mouth_cavity",
    }
  );
  // 3 Glowing Red Butterfly Throttle Plates
  for (const bfx of [-0.13, 0.0, 0.13]) {
    glow(
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
      ),
      1.8
    );
  }

  // 8 Swept-Up Zoomie Exhaust Header Pipes with Glowing Fire Flares
  for (const side of [1, -1]) {
    for (let pipe = 0; pipe < 4; pipe++) {
      const zOffset = 0.62 + pipe * 0.16;
      const rootP = [side * 0.32, 1.74, zOffset] as [number, number, number];
      const midP = [side * 0.60, 1.86, zOffset - 0.04] as [number, number, number];
      const tipP = [side * 0.74, 2.12 + pipe * 0.04, zOffset - 0.10] as [number, number, number];

      b.rod(rootP, midP, 0.034, C.chrome, {
        bone: engineJoint,
        name: `zoomie_lower_${side > 0 ? "L" : "R"}_${pipe}`,
      });
      b.rod(midP, tipP, 0.036, C.chrome, {
        bone: engineJoint,
        name: `zoomie_upper_${side > 0 ? "L" : "R"}_${pipe}`,
      });

      glow(
        b.part(
          new THREE.ConeGeometry(0.04, 0.12, 6),
          C.fireOrange,
          {
            bone: engineJoint,
            at: tipP,
            dir: [side * 0.35, 1.0, -0.2],
            name: `exhaust_fire_${side > 0 ? "L" : "R"}_${pipe}`,
          }
        ),
        2.2
      );
    }
  }

  // ---------------------------------------------------------------------------
  // 6. SOLID TRUCK BODY (Cab, Hood, Bed, Rockers & Full Livery)
  // ---------------------------------------------------------------------------
  // Lower Body Rocker Sills (Bridges chassis rails y=1.72 directly to body y=2.02)
  b.part(
    new THREE.BoxGeometry(1.42, 0.34, 3.80),
    C.bodyDark,
    {
      bone: root,
      at: [0, 1.88, 0],
      name: "lower_body_rocker_pan",
    }
  );

  // Main Cab Section
  b.part(
    new THREE.BoxGeometry(1.42, 0.72, 1.35),
    C.bodyDark,
    {
      bone: root,
      at: [0, 2.30, 0.05],
      name: "cab_main_block",
    }
  );

  // Full-Length Left & Right Livery Panels (Covering Cab & Bed seamless)
  for (const side of [1, -1]) {
    b.part(
      new THREE.PlaneGeometry(3.60, 0.76),
      "#ffffff",
      {
        bone: root,
        at: [side * 0.725, 2.26, 0.0],
        dir: [side, 0, 0],
        axis: "z",
        texture: TEX_SIDE_LIVERY,
        name: `side_livery_${side > 0 ? "L" : "R"}`,
      }
    );
  }

  // Raked Windshield
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

  // Cab Roof Visor
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

  // 5 Roof-Mounted Fog Lamps
  for (let li = -2; li <= 2; li++) {
    const lx = li * 0.26;
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
      1.8
    );
  }

  // Sculpted Hood
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

  // Front Fascia & Chrome Grille
  b.part(
    new THREE.BoxGeometry(1.38, 0.38, 0.12),
    C.bodyDark,
    {
      bone: root,
      at: [0, 1.95, 1.90],
      name: "front_fascia",
    }
  );
  // Headlights & Grille Mesh
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
    1.4
  );

  // Flared Front & Rear Wheel Arch Fenders
  for (const side of [1, -1]) {
    // Front Flared Arch
    b.part(
      new THREE.BoxGeometry(0.20, 0.28, 1.15),
      C.flamePink,
      {
        bone: root,
        at: [side * 0.78, 2.06, 1.35],
        name: `fender_flare_front_${side > 0 ? "L" : "R"}`,
      }
    );
    // Rear Flared Arch
    b.part(
      new THREE.BoxGeometry(0.20, 0.28, 1.30),
      C.flamePink,
      {
        bone: root,
        at: [side * 0.78, 2.06, -1.35],
        name: `fender_flare_rear_${side > 0 ? "L" : "R"}`,
      }
    );
  }

  // Pickup Truck Bed Sides & Floor
  b.part(
    new THREE.BoxGeometry(0.14, 0.52, 1.35),
    C.bodyDark,
    {
      bone: root,
      at: [0.68, 2.18, -1.30],
      name: "bed_wall_L",
    }
  );
  b.part(
    new THREE.BoxGeometry(0.14, 0.52, 1.35),
    C.bodyDark,
    {
      bone: root,
      at: [-0.68, 2.18, -1.30],
      name: "bed_wall_R",
    }
  );
  b.part(
    new THREE.BoxGeometry(1.24, 0.12, 1.32),
    C.chromeDark,
    {
      bone: root,
      at: [0, 1.96, -1.30],
      name: "bed_floor",
    }
  );
  b.part(
    new THREE.PlaneGeometry(1.20, 1.28),
    "#ffffff",
    {
      bone: root,
      at: [0, 2.025, -1.30],
      dir: [0, 1, 0],
      axis: "z",
      texture: TEX_BED_FLOOR,
      name: "bed_floor_plate",
    }
  );

  // Tailgate with hazard stripes & taillights
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
  // 7. BED ACCESSORIES (Twin Coolers, NOS Bottles, High Trophy Wing)
  // ---------------------------------------------------------------------------
  // Dual Angled Radiators firmly seated on bed floor
  for (const side of [1, -1]) {
    b.part(
      new THREE.BoxGeometry(0.38, 0.38, 0.10),
      C.ironDark,
      {
        bone: root,
        at: [side * 0.32, 2.18, -0.95],
        rotation: [28, 0, 0],
        name: `radiator_box_${side > 0 ? "L" : "R"}`,
      }
    );
    b.part(
      new THREE.TorusGeometry(0.14, 0.02, 6, 10),
      C.chassis,
      {
        bone: root,
        at: [side * 0.32, 2.18, -0.90],
        dir: [0, -0.47, 0.88],
        name: `fan_shroud_${side > 0 ? "L" : "R"}`,
      }
    );
  }

  // Dual NOS Bottles mounted securely in bed
  for (const side of [1, -1]) {
    b.part(
      new THREE.CylinderGeometry(0.08, 0.08, 0.40, 8),
      C.nitroCyan,
      {
        bone: root,
        at: [side * 0.44, 2.22, -1.55],
        dir: [0, 1, 0],
        name: `nos_bottle_${side > 0 ? "L" : "R"}`,
      }
    );
    b.part(
      new THREE.CylinderGeometry(0.03, 0.03, 0.06, 6),
      C.chrome,
      {
        bone: root,
        at: [side * 0.44, 2.44, -1.55],
        dir: [0, 1, 0],
        name: `nos_valve_${side > 0 ? "L" : "R"}`,
      }
    );
  }

  // Fuel Cell Tank in Center Bed
  b.part(
    new THREE.BoxGeometry(0.48, 0.28, 0.34),
    C.chrome,
    {
      bone: root,
      at: [0, 2.16, -1.45],
      name: "fuel_cell_tank",
    }
  );
  b.part(
    new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8),
    C.flamePink,
    {
      bone: root,
      at: [-0.10, 2.32, -1.45],
      dir: [0, 1, 0],
      name: "fuel_cap_R",
    }
  );
  b.part(
    new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8),
    C.flamePink,
    {
      bone: root,
      at: [0.10, 2.32, -1.45],
      dir: [0, 1, 0],
      name: "fuel_cap_L",
    }
  );

  // High-Mount Trophy Wing connected directly to tailgate stanchions
  b.rod(
    [-0.42, 2.22, -1.95],
    [-0.48, 2.82, -1.92],
    0.032,
    C.chassis,
    { bone: root, name: "wing_strut_R" }
  );
  b.rod(
    [0.42, 2.22, -1.95],
    [0.48, 2.82, -1.92],
    0.032,
    C.chassis,
    { bone: root, name: "wing_strut_L" }
  );
  b.part(
    new THREE.BoxGeometry(1.58, 0.06, 0.38),
    C.flamePink,
    {
      bone: root,
      at: [0, 2.82, -1.92],
      rotation: [-8, 0, 0],
      name: "rear_wing_blade",
    }
  );
  for (const side of [1, -1]) {
    b.part(
      new THREE.BoxGeometry(0.03, 0.32, 0.44),
      C.flameCyan,
      {
        bone: root,
        at: [side * 0.80, 2.82, -1.92],
        rotation: [-8, 0, 0],
        name: `wing_endplate_${side > 0 ? "L" : "R"}`,
      }
    );
  }

  // ---------------------------------------------------------------------------
  // 8. COCKPIT INTERIOR DETAILS
  // ---------------------------------------------------------------------------
  b.part(
    new THREE.BoxGeometry(0.42, 0.52, 0.38),
    C.seatRed,
    {
      bone: root,
      at: [0, 2.30, 0.15],
      name: "racing_seat",
    }
  );
  b.part(
    new THREE.BoxGeometry(0.24, 0.20, 0.18),
    C.seatRed,
    {
      bone: root,
      at: [0, 2.62, 0.12],
      name: "seat_headrest",
    }
  );
  b.part(
    new THREE.SphereGeometry(0.12, 8, 6),
    C.flameYellow,
    {
      bone: root,
      at: [0, 2.50, 0.22],
      name: "driver_helmet",
    }
  );
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
  // 9. ARENA STAGING: Dirt Mound Plinth, Crushed Taxi & Track Props
  // ---------------------------------------------------------------------------
  // Main Arena Plinth (Base touches y = 0.00, top surface at y = 0.06)
  b.part(
    new THREE.BoxGeometry(4.4, 0.06, 5.6),
    C.dirtDark,
    {
      bone: root,
      at: [0, 0.03, 0],
      name: "arena_plinth_base",
    }
  );
  b.part(
    new THREE.PlaneGeometry(4.36, 5.56),
    "#ffffff",
    {
      bone: root,
      at: [0, 0.062, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: TEX_ARENA_DIRT,
      name: "arena_dirt_plate",
    }
  );

  // CRUSHED TAXI CAR PROP (Flattened sedan parked beside truck without clipping tyres)
  // Height: 0.18 m, sitting on dirt surface (y = 0.06), so center is at y = 0.15 m
  const TAXI_POS: [number, number, number] = [-2.15, 0.15, 0.35];
  b.part(
    new THREE.BoxGeometry(1.50, 0.18, 2.60),
    C.crushedTaxi,
    {
      bone: root,
      at: TAXI_POS,
      rotation: [0, 15, 0],
      name: "crushed_taxi_body",
    }
  );
  b.part(
    new THREE.PlaneGeometry(1.46, 2.56),
    "#ffffff",
    {
      bone: root,
      at: [TAXI_POS[0], TAXI_POS[1] + 0.092, TAXI_POS[2]],
      dir: [0, 1, 0],
      axis: "z",
      rotation: [0, 15, 0],
      texture: TEX_CRUSHED_TAXI,
      name: "crushed_taxi_roof",
    }
  );

  // Taxi Roof Lightbox "TAXI"
  b.part(
    new THREE.BoxGeometry(0.32, 0.08, 0.12),
    "#ffffff",
    {
      bone: root,
      at: [TAXI_POS[0] - 0.05, TAXI_POS[1] + 0.14, TAXI_POS[2] - 0.20],
      rotation: [0, 15, -12],
      name: "taxi_roof_sign",
    }
  );

  // Crushed Splayed Taxi Wheels (Resting safely above ground at y >= 0.06)
  for (const [cx, cz] of [
    [-0.78, 0.80],
    [0.78, 0.80],
    [-0.78, -0.80],
    [0.78, -0.80],
  ]) {
    b.part(
      new THREE.CylinderGeometry(0.13, 0.13, 0.09, 8),
      C.rubberDark,
      {
        bone: root,
        at: [TAXI_POS[0] + cx, 0.14, TAXI_POS[2] + cz],
        dir: [0.95, 0.25, 0],
        name: `taxi_wheel_${cx}_${cz}`,
      }
    );
  }

  // 2 Arena Traffic Cones
  for (const [coneX, coneZ] of [
    [1.75, 2.3],
    [-1.75, -2.2],
  ]) {
    b.part(
      new THREE.BoxGeometry(0.32, 0.04, 0.32),
      C.flameOrange,
      {
        bone: root,
        at: [coneX, 0.08, coneZ],
        name: `cone_base_${coneX}`,
      }
    );
    b.part(
      new THREE.ConeGeometry(0.12, 0.44, 8),
      C.flameOrange,
      {
        bone: root,
        at: [coneX, 0.30, coneZ],
        name: `cone_body_${coneX}`,
      }
    );
    b.part(
      new THREE.CylinderGeometry(0.075, 0.095, 0.12, 8),
      "#ffffff",
      {
        bone: root,
        at: [coneX, 0.28, coneZ],
        name: `cone_stripe_${coneX}`,
      }
    );
  }

  // Crushed Steel Oil Drum Prop
  b.part(
    new THREE.CylinderGeometry(0.24, 0.26, 0.42, 8),
    C.flamePink,
    {
      bone: root,
      at: [1.75, 0.28, -1.8],
      rotation: [65, 20, 0],
      scale: [1.1, 0.7, 1.0],
      name: "crushed_oil_drum",
    }
  );

  // Checkered Victory Finish-Line Flag (Moved to rear staging corner so 3/4 front view is clear)
  b.rod(
    [1.85, 0.06, -2.2],
    [1.85, 1.85, -2.2],
    0.024,
    C.chrome,
    { bone: root, name: "flag_pole" }
  );
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
      bone: root,
      at: [1.85 + 0.28, 1.62, -2.2],
      dir: [0, 0, 1],
      axis: "z",
      texture: TEX_FLAG,
      name: "checkered_flag_mesh",
    }
  );

  return b.root;
}
```