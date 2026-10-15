import * as THREE from "three";
import { createBuilder, rng, mid, offset } from "../../../../src/index";
import { bayer, pick, pixelTexture, stepped, tileBox } from "../../../../kits/pixel";

export const meta = {
  name: "pixel-koala-eucalyptus-stand",
  description:
    "An endearing voxel-art koala clinging to a weathered eucalyptus branch stand, complete with peeling gum bark, sickle leaves, gum nuts, and an articulated jaw.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "pixel_koala" });
  const rand = rng(2024);

  // ---------------------------------------------------------------------------
  // 1. PALETTES & RETRO PIXEL ART TEXTURES
  // ---------------------------------------------------------------------------

  // Texture 1: Slate-Heather Koala Body Fur (32x32)
  const FUR_BODY_TEX = pixelTexture(32, 32, (g) => {
    const furPal = ["#474c57", "#5a616e", "#737a88", "#8e96a4", "#a9b2c0", "#c4cbd8"];
    g.fill((x, y) => {
      const v = 0.5 + 0.24 * Math.sin(x * 0.38) + 0.20 * Math.cos(y * 0.42);
      return pick(furPal, v, bayer(x, y));
    });
    // Distinctive pixel fur tuft flecks
    const flecks: [number, number][] = [
      [4, 6],
      [12, 14],
      [22, 8],
      [8, 22],
      [18, 28],
      [28, 20],
      [3, 16],
      [16, 4],
      [26, 30],
      [10, 12],
    ];
    for (const [fx, fy] of flecks) {
      g.set(fx, fy, "#dce3ef");
      g.set(fx + 1, fy, "#a9b2c0");
      g.set(fx, fy + 1, "#363a43");
    }
  });

  // Texture 2: Fluffy Cream Chest & Belly Bib (32x32)
  const BELLY_FLUFF_TEX = pixelTexture(32, 32, (g) => {
    const creamPal = ["#9c907a", "#b7aa92", "#d2c7b0", "#e8dfcb", "#f7f2e4", "#ffffff"];
    g.fill((x, y) => {
      const d = Math.hypot(x - 16, y - 16) / 18;
      const v = 0.90 - d * 0.45;
      return pick(creamPal, v, bayer(x, y));
    });
    // Layered white fur tooth waves
    for (let x = 1; x < 31; x += 2) {
      g.set(x, 6 + (x % 3), "#ffffff");
      g.set(x, 14 + ((x + 1) % 3), "#ffffff");
      g.set(x, 22 + (x % 3), "#ffffff");
      g.set(x, 28, "#f0eade");
    }
  });

  // Texture 3: Soft Muzzle with Freckles & Blush (32x32)
  const FACE_TEX = pixelTexture(32, 32, (g) => {
    const creamPal = ["#b2a792", "#cbc1ad", "#dfd7c5", "#eee7d8", "#fbf8f0"];
    g.fill((x, y) => {
      const v = 0.65 + 0.35 * (1 - Math.abs(x - 16) / 16);
      return pick(creamPal, v, bayer(x, y));
    });
    // Whisker freckles on cheeks
    const freckles: [number, number][] = [
      [5, 16],
      [7, 18],
      [4, 20],
      [26, 16],
      [24, 18],
      [27, 20],
      [6, 22],
      [25, 22],
    ];
    for (const [fx, fy] of freckles) {
      g.set(fx, fy, "#4a3f32");
    }
    // Rosy cheek blush accents
    g.set(4, 23, "#dfa49d");
    g.set(5, 23, "#dfa49d");
    g.set(26, 23, "#dfa49d");
    g.set(27, 23, "#dfa49d");
  });

  // Texture 4: Glossy Koala Eye with Double White Glints (16x16)
  const EYE_TEX = pixelTexture(16, 16, (g) => {
    for (let y = 1; y <= 14; y++) {
      const dy = (y - 7.5) / 6.5;
      const hw = Math.round(6.0 * Math.sqrt(Math.max(0, 1 - dy * dy)));
      for (let x = 8 - hw; x <= 8 + hw; x++) {
        g.set(x, y, "#121217");
      }
    }
    // Warm amber iris crescent
    for (let y = 6; y <= 12; y++) {
      for (let x = 5; x <= 12; x++) {
        const d = Math.hypot(x - 8, y - 8);
        if (d <= 4.8 && d >= 1.6) {
          g.set(x, y, y >= 9 ? "#c86e24" : "#863d12");
        }
      }
    }
    // Deep obsidian pupil
    for (let y = 5; y <= 9; y++) {
      for (let x = 6; x <= 9; x++) {
        g.set(x, y, "#07070b");
      }
    }
    // Primary prominent white glint (2x2)
    g.set(5, 4, "#ffffff");
    g.set(6, 4, "#ffffff");
    g.set(5, 5, "#ffffff");
    g.set(6, 5, "#ffffff");
    // Secondary twinkle glint
    g.set(10, 10, "#ffffff");
    // Eyelid line
    for (let x = 3; x <= 12; x++) {
      g.set(x, 1, "#26222f");
    }
  });

  // Texture 5: Fluffy Inner Ear with Mauve Hollow (32x32)
  const EAR_INNER_TEX = pixelTexture(32, 32, (g) => {
    const earPal = ["#3e2f31", "#594346", "#75595d", "#947378", "#b18f95", "#ceaab0"];
    g.fill((x, y) => {
      const d = Math.hypot(x - 16, y - 18) / 14;
      return pick(earPal, 1 - d * 0.72, bayer(x, y));
    });
    // Thick white fluff rim along perimeter
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const d = Math.hypot(x - 16, y - 16);
        if (d > 10.5 && d <= 15) {
          g.set(x, y, bayer(x, y) > 0.28 ? "#ffffff" : "#ece4d5");
        }
      }
    }
  });

  // Texture 6: Eucalyptus Bark with Peeling Layers & Sap (32x64)
  const BARK_TEX = pixelTexture(32, 64, (g) => {
    const woodPal = ["#b8a88c", "#cfc1a5", "#e2d7bf"];
    const barkPal = ["#343e2e", "#495641", "#5f6f56", "#788a6f", "#93a689"];
    g.fill((x, y) => {
      const isBark = Math.sin(x * 0.34 + Math.sin(y * 0.18) * 2.2) + Math.cos(y * 0.12) > 0.15;
      if (isBark) {
        const v = 0.5 + 0.3 * Math.sin(y * 0.26) + 0.2 * Math.cos(x * 0.48);
        return pick(barkPal, v, bayer(x, y));
      } else {
        const v = 0.5 + 0.4 * Math.sin(x * 0.52);
        return pick(woodPal, v, bayer(x, y));
      }
    });
    // Red gum tree sap fissures
    for (let y = 4; y < 60; y += 12) {
      const x0 = (y * 7) % 27 + 2;
      g.set(x0, y, "#612012");
      g.set(x0, y + 1, "#812e1c");
      g.set(x0 + 1, y + 1, "#3e1208");
    }
  });

  // Texture 7: Tree Growth Rings for Cut Branch Ends (32x32)
  const TREE_RING_TEX = pixelTexture(32, 32, (g) => {
    const ringPal = ["#54432e", "#735c42", "#917656", "#b09470", "#c7ae8c", "#dcceb5"];
    g.fill((x, y) => {
      const r = Math.hypot(x - 16, y - 16);
      if (r > 15) return "#343c2e";
      if (r > 13.5) return "#4d5844";
      const ring = Math.sin(r * 1.45) * 0.5 + 0.5;
      return pick(ringPal, ring, bayer(x, y));
    });
    g.set(15, 15, "#3b2c1b");
    g.set(16, 15, "#3b2c1b");
    g.set(15, 16, "#3b2c1b");
    g.set(16, 16, "#3b2c1b");
  });

  // Texture 8: Forest Floor Stand Base Dirt, Moss & Pebbles (32x32)
  const GROUND_TEX = pixelTexture(32, 32, (g) => {
    const dirtPal = ["#21150e", "#312016", "#422b1f", "#543727", "#65422f"];
    const mossPal = ["#213612", "#314f1a", "#446c25", "#5c8f35"];
    g.fill((x, y) => {
      const isMoss = Math.sin(x * 0.42) + Math.cos(y * 0.36) > 0.35;
      if (isMoss) {
        return pick(mossPal, 0.5 + 0.3 * Math.sin(x + y), bayer(x, y));
      }
      return pick(dirtPal, 0.5 + 0.3 * Math.cos(x * 0.55), bayer(x, y));
    });
    const pebbles: [number, number][] = [
      [6, 8],
      [24, 12],
      [14, 22],
      [26, 26],
      [4, 28],
    ];
    for (const [px, py] of pebbles) {
      g.set(px, py, "#838994");
      g.set(px + 1, py, "#616670");
      g.set(px, py + 1, "#a4abb7");
    }
  });

  // Texture 9: Woody Eucalyptus Gum Nut Capsule (16x16)
  const GUM_NUT_TEX = pixelTexture(16, 16, (g) => {
    const nutPal = ["#2c261b", "#3d3525", "#514632", "#675940", "#7f6e4f"];
    g.fill((x, y) => {
      const d = Math.hypot(x - 8, y - 8);
      if (d > 7) return "";
      return pick(nutPal, 0.5 + 0.4 * (y / 16), bayer(x, y));
    });
    g.set(8, 3, "#1e1a12");
    g.set(8, 12, "#1e1a12");
    g.set(3, 8, "#1e1a12");
    g.set(12, 8, "#1e1a12");
    g.set(8, 8, "#938363");
  });

  // Flat color tokens
  const C_DARK_GREY = "#606774";
  const C_WHITE = "#ffffff";
  const C_CREAM = "#ded7c8";
  const C_NOSE_BLACK = "#18181f";
  const C_CLAW = "#141419";
  const C_WOOD_CAMBIUM = "#d8ccb6";
  const C_SAGE_BARK = "#6b7a63";
  const C_LEAF_GREEN = "#44704f";
  const C_RED_GUM = "#852c2c";
  const C_DIRT = "#3b261b";
  const C_MOSS = "#416524";
  const C_STONE = "#787e8a";
  const C_RUMP_LIGHT = "#c2cbd8";

  // Stepped pixel outlines
  const SICKLE_OUTLINE = stepped(
    [
      [0, 2],
      [0, 3],
      [1, 4],
      [1, 5],
      [2, 5],
      [2, 4],
      [1, 3],
      [0, 2],
    ],
    0.012,
    { rows: true },
  );

  const CLAW_OUTLINE = stepped(
    [
      [0, 2],
      [0, 3],
      [1, 3],
    ],
    0.006,
    { rows: true },
  );

  const BARK_STRIP_OUTLINE = stepped(
    [
      [0, 2],
      [0, 2],
      [1, 3],
      [1, 3],
      [2, 4],
      [2, 4],
      [3, 4],
    ],
    0.014,
    { rows: true },
  );

  // ---------------------------------------------------------------------------
  // 2. SKELETON
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.34, 0.04],
    dir: [0, 0.2, 0.98],
    role: "spine",
  });

  const spineMid = b.joint("spineMid", {
    parent: hips,
    at: [0, 0.46, 0.05],
    dir: [0, 0.35, 0.94],
    role: "spine",
  });

  const chest = b.joint("chest", {
    parent: spineMid,
    at: [0, 0.58, 0.06],
    dir: [0, 0.6, 0.8],
    role: "spine",
  });

  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 0.65, 0.08],
    dir: [0, 0.65, 0.76],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.72, 0.10],
    dir: [0, 0.1, 0.99],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.64, 0.16],
    dir: [0, 0.05, 1.0],
    role: "jaw",
  });

  const earL = b.joint("earL", {
    parent: head,
    at: [0.12, 0.78, 0.08],
    dir: [0.9, 0.3, 0.3],
  });
  const earR = b.joint("earR", {
    parent: head,
    at: [-0.12, 0.78, 0.08],
    dir: [-0.9, 0.3, 0.3],
  });

  const shoulderL = b.joint("shoulderL", {
    parent: chest,
    at: [0.12, 0.58, 0.06],
    dir: [0.4, -0.3, -0.86],
    role: "arm",
  });
  const elbowL = b.joint("elbowL", {
    parent: shoulderL,
    at: [0.15, 0.51, 0.01],
    dir: [-0.4, -0.2, -0.9],
    role: "arm",
  });
  const wristL = b.joint("wristL", {
    parent: elbowL,
    at: [0.10, 0.47, -0.03],
    dir: [-0.5, 0.1, -0.86],
    role: "arm",
  });

  const shoulderR = b.joint("shoulderR", {
    parent: chest,
    at: [-0.12, 0.58, 0.06],
    dir: [-0.4, -0.3, -0.86],
    role: "arm",
  });
  const elbowR = b.joint("elbowR", {
    parent: shoulderR,
    at: [-0.15, 0.51, 0.01],
    dir: [0.4, -0.2, -0.9],
    role: "arm",
  });
  const wristR = b.joint("wristR", {
    parent: elbowR,
    at: [-0.10, 0.47, -0.03],
    dir: [0.5, 0.1, -0.86],
    role: "arm",
  });

  const hipL = b.joint("hipL", {
    parent: hips,
    at: [0.11, 0.36, 0.04],
    dir: [0.35, -0.15, -0.92],
    role: "leg",
  });
  const kneeL = b.joint("kneeL", {
    parent: hipL,
    at: [0.15, 0.30, 0.01],
    dir: [-0.35, -0.25, -0.9],
    role: "leg",
  });
  const ankleL = b.joint("ankleL", {
    parent: kneeL,
    at: [0.09, 0.25, -0.03],
    dir: [-0.4, 0.0, -0.92],
    role: "leg",
  });

  const hipR = b.joint("hipR", {
    parent: hips,
    at: [-0.11, 0.36, 0.04],
    dir: [-0.35, -0.15, -0.92],
    role: "leg",
  });
  const kneeR = b.joint("kneeR", {
    parent: hipR,
    at: [-0.15, 0.30, 0.01],
    dir: [0.35, -0.25, -0.9],
    role: "leg",
  });
  const ankleR = b.joint("ankleR", {
    parent: kneeR,
    at: [-0.09, 0.25, -0.03],
    dir: [0.4, 0.0, -0.92],
    role: "leg",
  });

  // ---------------------------------------------------------------------------
  // 3. EUCALYPTUS BRANCH STAND (SCENERY ON bone: hips)
  // ---------------------------------------------------------------------------

  // Ground Pedestal (stands firmly on y = 0)
  b.part(new THREE.CylinderGeometry(0.27, 0.28, 0.03, 16), C_DIRT, {
    bone: hips,
    at: [0, 0.015, 0],
    texture: GROUND_TEX,
    name: "base_tier1",
  });
  b.part(new THREE.CylinderGeometry(0.23, 0.24, 0.025, 16), C_DIRT, {
    bone: hips,
    at: [0, 0.040, 0],
    texture: GROUND_TEX,
    name: "base_tier2",
  });

  // Moss Patches on Base
  const mossCoords: [number, number, number, number][] = [
    [-0.12, 0.054, 0.11, 0.065],
    [0.13, 0.054, -0.09, 0.055],
    [0.10, 0.054, 0.12, 0.05],
    [-0.14, 0.054, -0.10, 0.06],
  ];
  for (let i = 0; i < mossCoords.length; i++) {
    const [mx, my, mz, mr] = mossCoords[i];
    b.part(new THREE.CylinderGeometry(mr, mr * 1.08, 0.006, 8), C_MOSS, {
      bone: hips,
      at: [mx, my, mz],
      name: `moss_patch_${i}`,
    });
  }

  // River Pebbles on Base
  const pebbleCoords: [number, number, number, number, number, number][] = [
    [0.16, 0.040, 0.07, 0.032, 0.016, 0.024],
    [-0.17, 0.040, 0.05, 0.028, 0.014, 0.020],
    [0.05, 0.058, 0.18, 0.026, 0.015, 0.022],
    [-0.07, 0.058, -0.16, 0.030, 0.016, 0.024],
  ];
  for (let i = 0; i < pebbleCoords.length; i++) {
    const [px, py, pz, pw, ph, pd] = pebbleCoords[i];
    b.part(new THREE.BoxGeometry(pw, ph, pd), C_STONE, {
      bone: hips,
      at: [px, py, pz],
      name: `stone_${i}`,
    });
  }

  // Fallen Gum Leaves on Ground
  const groundLeaves: [number, number, number, number][] = [
    [0.13, 0.055, 0.06, 35],
    [-0.12, 0.055, 0.08, -60],
    [-0.04, 0.055, 0.16, 110],
  ];
  for (let i = 0; i < groundLeaves.length; i++) {
    const [lx, ly, lz, rotY] = groundLeaves[i];
    b.extrude(SICKLE_OUTLINE, {
      bone: hips,
      at: [lx, ly, lz],
      x: [Math.cos((rotY * Math.PI) / 180), 0, Math.sin((rotY * Math.PI) / 180)],
      y: [0, 0, 1],
      thickness: 0.003,
      color: C_LEAF_GREEN,
      name: `fallen_leaf_${i}`,
    });
  }

  // Main Eucalyptus Trunk (stacked textured segments)
  b.part(
    tileBox([0.16, 0.30, 0.16], BARK_TEX, 0.011),
    C_SAGE_BARK,
    { bone: hips, at: [0, 0.20, -0.06], texture: BARK_TEX, name: "trunk_lower" },
  );

  // Lower Peeling Bark Strip
  b.extrude(BARK_STRIP_OUTLINE, {
    bone: hips,
    at: [0.082, 0.18, -0.06],
    x: [0.3, 0.95, 0],
    y: [0.1, 0, 0.99],
    thickness: 0.006,
    color: C_SAGE_BARK,
    name: "bark_peel_lower",
  });

  // Shelf Fungus on Lower Trunk
  b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.012, 8, 1, false, 0, Math.PI), "#d2a36d", {
    bone: hips,
    at: [0.082, 0.22, -0.05],
    dir: [1, 0.1, 0],
    name: "bracket_mushroom",
  });

  // Side Branch Fork (projecting to right-rear)
  b.part(new THREE.CylinderGeometry(0.045, 0.055, 0.16, 8), C_SAGE_BARK, {
    bone: hips,
    at: [-0.12, 0.36, -0.10],
    dir: [-0.7, 0.4, -0.6],
    texture: BARK_TEX,
    name: "branch_fork_r",
  });
  b.part(new THREE.CircleGeometry(0.043, 10), C_WOOD_CAMBIUM, {
    bone: hips,
    at: [-0.175, 0.39, -0.15],
    dir: [-0.7, 0.4, -0.6],
    axis: "z",
    texture: TREE_RING_TEX,
    name: "branch_cut_face_r",
  });

  // Middle Trunk Segment (Gripping Perch directly behind koala)
  b.part(
    tileBox([0.15, 0.30, 0.15], BARK_TEX, 0.011),
    C_SAGE_BARK,
    { bone: hips, at: [0, 0.50, -0.07], texture: BARK_TEX, name: "trunk_mid" },
  );

  // Peeling Bark Ribbon beside Koala
  b.extrude(BARK_STRIP_OUTLINE, {
    bone: hips,
    at: [-0.078, 0.48, -0.07],
    x: [-0.2, 0.95, -0.2],
    y: [0.2, 0, 0.98],
    thickness: 0.006,
    color: C_SAGE_BARK,
    name: "bark_peel_mid",
  });

  // Upper Trunk Segment
  b.part(
    tileBox([0.14, 0.23, 0.14], BARK_TEX, 0.011),
    C_SAGE_BARK,
    { bone: hips, at: [0, 0.76, -0.08], texture: BARK_TEX, name: "trunk_upper" },
  );
  b.part(new THREE.CircleGeometry(0.065, 12), C_WOOD_CAMBIUM, {
    bone: hips,
    at: [0, 0.875, -0.08],
    dir: [0, 1, 0],
    axis: "z",
    texture: TREE_RING_TEX,
    name: "trunk_top_ring",
  });

  // High Foliage Boughs Arching Behind & Above Koala
  // Left High Bough: from [0.05, 0.80, -0.07] to [0.18, 0.88, -0.02]
  const boughL_start = new THREE.Vector3(0.05, 0.80, -0.07);
  const boughL_end = new THREE.Vector3(0.18, 0.88, -0.02);
  const boughL_dir = new THREE.Vector3().subVectors(boughL_end, boughL_start).normalize();
  b.part(new THREE.CylinderGeometry(0.032, 0.042, boughL_start.distanceTo(boughL_end), 8), C_SAGE_BARK, {
    bone: hips,
    at: mid(boughL_start, boughL_end),
    dir: boughL_dir,
    texture: BARK_TEX,
    name: "bough_high_l",
  });

  // Right High Bough: from [-0.05, 0.79, -0.07] to [-0.17, 0.86, -0.03]
  const boughR_start = new THREE.Vector3(-0.05, 0.79, -0.07);
  const boughR_end = new THREE.Vector3(-0.17, 0.86, -0.03);
  const boughR_dir = new THREE.Vector3().subVectors(boughR_end, boughR_start).normalize();
  b.part(new THREE.CylinderGeometry(0.032, 0.042, boughR_start.distanceTo(boughR_end), 8), C_SAGE_BARK, {
    bone: hips,
    at: mid(boughR_start, boughR_end),
    dir: boughR_dir,
    texture: BARK_TEX,
    name: "bough_high_r",
  });

  // Canopy Leaf Sprigs - firmly anchored to the boughs (no loose parts)
  const canopySprigs: {
    base: THREE.Vector3;
    tip: THREE.Vector3;
    leafX: [number, number, number];
    leafY: [number, number, number];
  }[] = [
    // Left bough sprigs
    {
      base: new THREE.Vector3(0.14, 0.85, -0.04),
      tip: new THREE.Vector3(0.22, 0.91, -0.01),
      leafX: [0.7, -0.2, 0.6],
      leafY: [-0.2, 0.9, 0.3],
    },
    {
      base: new THREE.Vector3(0.18, 0.88, -0.02),
      tip: new THREE.Vector3(0.26, 0.92, 0.02),
      leafX: [0.5, -0.5, 0.7],
      leafY: [0.3, 0.8, -0.5],
    },
    {
      base: new THREE.Vector3(0.12, 0.84, -0.05),
      tip: new THREE.Vector3(0.18, 0.94, -0.04),
      leafX: [-0.2, 0.4, 0.9],
      leafY: [0.8, 0.5, -0.3],
    },
    // Right bough sprigs
    {
      base: new THREE.Vector3(-0.13, 0.84, -0.05),
      tip: new THREE.Vector3(-0.21, 0.90, -0.02),
      leafX: [-0.7, -0.2, 0.6],
      leafY: [0.2, 0.9, 0.3],
    },
    {
      base: new THREE.Vector3(-0.17, 0.86, -0.03),
      tip: new THREE.Vector3(-0.25, 0.89, 0.01),
      leafX: [-0.5, -0.5, 0.7],
      leafY: [-0.3, 0.8, -0.5],
    },
    {
      base: new THREE.Vector3(-0.11, 0.83, -0.06),
      tip: new THREE.Vector3(-0.16, 0.93, -0.05),
      leafX: [0.2, 0.4, 0.9],
      leafY: [-0.8, 0.5, -0.3],
    },
    // Top crest sprig
    {
      base: new THREE.Vector3(0.00, 0.87, -0.08),
      tip: new THREE.Vector3(0.02, 0.96, -0.07),
      leafX: [0.0, 0.3, 0.95],
      leafY: [0.0, 0.95, -0.3],
    },
  ];

  for (let i = 0; i < canopySprigs.length; i++) {
    const s = canopySprigs[i];
    const stemDir = new THREE.Vector3().subVectors(s.tip, s.base).normalize();
    const len = s.base.distanceTo(s.tip);
    b.part(new THREE.CylinderGeometry(0.003, 0.004, len, 5), C_RED_GUM, {
      bone: hips,
      at: mid(s.base, s.tip),
      dir: stemDir,
      name: `canopy_stem_${i}`,
    });
    b.extrude(SICKLE_OUTLINE, {
      bone: hips,
      at: s.tip,
      x: s.leafX,
      y: s.leafY,
      thickness: 0.003,
      color: C_LEAF_GREEN,
      name: `canopy_leaf_${i}`,
    });
  }

  // Woody Gum Nut Capsules clustered at branch axils
  const nutLocations: [number, number, number][] = [
    [0.16, 0.86, -0.03],
    [0.19, 0.83, 0.00],
    [-0.14, 0.85, -0.04],
    [-0.18, 0.81, -0.01],
  ];
  for (let i = 0; i < nutLocations.length; i++) {
    b.part(new THREE.CylinderGeometry(0.013, 0.008, 0.016, 6), "#63563e", {
      bone: hips,
      at: nutLocations[i],
      dir: [0.2, -0.8, 0.5],
      texture: GUM_NUT_TEX,
      name: `gum_nut_${i}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 4. KOALA BODY (PELVIS, BELLY, CHEST)
  // ---------------------------------------------------------------------------

  // Pelvis / Hips Core
  b.part(
    tileBox([0.22, 0.16, 0.18], FUR_BODY_TEX, 0.012),
    C_DARK_GREY,
    { bone: hips, at: [0, 0.36, 0.04], texture: FUR_BODY_TEX, name: "pelvis_core" },
  );

  // Plump Rump Contour
  b.part(
    tileBox([0.20, 0.14, 0.09], FUR_BODY_TEX, 0.012),
    C_DARK_GREY,
    { bone: hips, at: [0, 0.33, -0.05], texture: FUR_BODY_TEX, name: "rump_contour" },
  );

  // White Speckled Rump Camouflage Patch
  b.part(new THREE.BoxGeometry(0.14, 0.09, 0.015), C_RUMP_LIGHT, {
    bone: hips,
    at: [0, 0.33, -0.098],
    name: "rump_patch",
  });

  // Mid-Torso
  b.part(
    tileBox([0.21, 0.15, 0.17], FUR_BODY_TEX, 0.012),
    C_DARK_GREY,
    { bone: spineMid, at: [0, 0.47, 0.05], texture: FUR_BODY_TEX, name: "torso_mid" },
  );

  // Lower Belly Fluff (facing +Z front)
  b.part(new THREE.BoxGeometry(0.16, 0.13, 0.025), C_WHITE, {
    bone: spineMid,
    at: [0, 0.46, 0.14],
    texture: BELLY_FLUFF_TEX,
    name: "belly_fluff_mid",
  });

  // Chest Core
  b.part(
    tileBox([0.20, 0.15, 0.16], FUR_BODY_TEX, 0.012),
    C_DARK_GREY,
    { bone: chest, at: [0, 0.58, 0.06], texture: FUR_BODY_TEX, name: "chest_core" },
  );

  // Main Fluffy White Bib on Chest (facing +Z front)
  b.part(new THREE.BoxGeometry(0.17, 0.14, 0.03), C_WHITE, {
    bone: chest,
    at: [0, 0.58, 0.145],
    texture: BELLY_FLUFF_TEX,
    name: "chest_bib_front",
  });

  // Upper Throat Fluff Collar
  b.part(new THREE.BoxGeometry(0.13, 0.04, 0.04), C_WHITE, {
    bone: chest,
    at: [0, 0.64, 0.14],
    name: "throat_fluff_collar",
  });

  // Neck Cylinder
  b.part(new THREE.CylinderGeometry(0.08, 0.09, 0.06, 8), C_DARK_GREY, {
    bone: neck,
    at: [0, 0.65, 0.08],
    name: "neck_cylinder",
  });

  // ---------------------------------------------------------------------------
  // 5. KOALA HEAD, FACE, EARS, JAW
  // ---------------------------------------------------------------------------

  // Cranium Box (centered squarely at [0, 0.73, 0.10])
  b.part(
    tileBox([0.19, 0.16, 0.17], FUR_BODY_TEX, 0.011),
    C_DARK_GREY,
    { bone: head, at: [0, 0.73, 0.10], texture: FUR_BODY_TEX, name: "cranium_box" },
  );

  // Forehead Fur Ridge
  b.part(new THREE.BoxGeometry(0.12, 0.03, 0.11), "#737a88", {
    bone: head,
    at: [0, 0.815, 0.10],
    name: "forehead_ridge",
  });

  // Chubby Cheeks & Ruffs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(
      tileBox([0.06, 0.10, 0.12], FUR_BODY_TEX, 0.011),
      C_DARK_GREY,
      { bone: head, at: [s * 0.105, 0.70, 0.12], texture: FUR_BODY_TEX, name: `cheek_puff_${side}` },
    );
    // Fluffy white cheek ruff tufts
    b.part(new THREE.BoxGeometry(0.035, 0.05, 0.06), C_WHITE, {
      bone: head,
      at: [s * 0.135, 0.675, 0.13],
      name: `cheek_fluff_tuft_${side}`,
    });
  }

  // Snout / Muzzle Base Block (at lower front of head)
  b.part(new THREE.BoxGeometry(0.11, 0.08, 0.06), C_CREAM, {
    bone: head,
    at: [0, 0.685, 0.19],
    name: "snout_block",
  });

  // Muzzle Front Quad with Freckles & Blush
  b.part(new THREE.PlaneGeometry(0.11, 0.08), C_WHITE, {
    bone: head,
    at: [0, 0.685, 0.221],
    dir: [0, 0, 1],
    axis: "z",
    texture: FACE_TEX,
    name: "face_muzzle_quad",
  });

  // Iconic Big 3D Rounded Black Leathery Nose Shield
  b.part(new THREE.BoxGeometry(0.066, 0.085, 0.03), C_NOSE_BLACK, {
    bone: head,
    at: [0, 0.70, 0.228],
    name: "nose_3d_leather",
  });

  // Specular Highlight Glint on Nose
  b.part(new THREE.BoxGeometry(0.018, 0.022, 0.006), "#858d9e", {
    bone: head,
    at: [-0.012, 0.725, 0.244],
    name: "nose_specular_glint",
  });

  // Nostril Cavities
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.BoxGeometry(0.014, 0.008, 0.01), "#090a0d", {
      bone: head,
      at: [s * 0.016, 0.672, 0.240],
      name: `nostril_${side}`,
    });
  }

  // Big Shiny Anime/Pixel Eyes (facing front +Z)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eyeCenter = [s * 0.062, 0.73, 0.185] as const;

    b.part(new THREE.BoxGeometry(0.036, 0.036, 0.012), "#16161c", {
      bone: head,
      at: eyeCenter,
      name: `eye_socket_${side}`,
    });
    b.part(new THREE.PlaneGeometry(0.034, 0.034), C_WHITE, {
      bone: head,
      at: [s * 0.062, 0.73, 0.192],
      dir: [0, 0, 1],
      axis: "z",
      texture: EYE_TEX,
      name: `eye_quad_${side}`,
    });
    b.part(new THREE.BoxGeometry(0.038, 0.010, 0.014), "#4a505c", {
      bone: head,
      at: [s * 0.062, 0.752, 0.188],
      name: `brow_ridge_${side}`,
    });
  }

  // Articulated Lower Jaw
  b.part(new THREE.BoxGeometry(0.075, 0.030, 0.07), C_CREAM, {
    bone: jaw,
    at: [0, 0.635, 0.18],
    name: "lower_jaw_plate",
  });
  b.part(new THREE.BoxGeometry(0.055, 0.018, 0.045), C_WHITE, {
    bone: jaw,
    at: [0, 0.622, 0.19],
    name: "chin_fluff",
  });
  b.part(new THREE.BoxGeometry(0.024, 0.006, 0.016), "#db5c75", {
    bone: jaw,
    at: [0, 0.645, 0.205],
    name: "tongue_tip",
  });

  // Huge Round Fluffy Koala Ears (Voxel Step Discs)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const earJoint = s > 0 ? earL : earR;

    // Base connection to cranium
    b.part(new THREE.BoxGeometry(0.04, 0.06, 0.05), C_DARK_GREY, {
      bone: earJoint,
      at: [s * 0.10, 0.75, 0.08],
      name: `ear_base_${side}`,
    });

    // Main ear backing slab
    b.part(new THREE.BoxGeometry(0.11, 0.11, 0.02), C_DARK_GREY, {
      bone: earJoint,
      at: [s * 0.145, 0.77, 0.075],
      name: `ear_back_${side}`,
    });

    // Front inner ear quad
    b.part(new THREE.PlaneGeometry(0.095, 0.095), C_WHITE, {
      bone: earJoint,
      at: [s * 0.145, 0.77, 0.086],
      dir: [0, 0, 1],
      axis: "z",
      texture: EAR_INNER_TEX,
      name: `ear_inner_${side}`,
    });

    // Stepped perimeter white fluffy rim
    const earRimTufts: [number, number, number, number, number][] = [
      [0.11, 0.835, 0.03, 0.025, 0.025],
      [0.145, 0.845, 0.035, 0.03, 0.025],
      [0.18, 0.835, 0.03, 0.025, 0.025],
      [0.20, 0.80, 0.03, 0.035, 0.025],
      [0.21, 0.76, 0.035, 0.04, 0.025],
      [0.20, 0.72, 0.03, 0.035, 0.025],
      [0.17, 0.69, 0.03, 0.025, 0.025],
    ];

    for (let j = 0; j < earRimTufts.length; j++) {
      const [tx, ty, tw, th, td] = earRimTufts[j];
      b.part(new THREE.BoxGeometry(tw, th, td), C_WHITE, {
        bone: earJoint,
        at: [s * tx, ty, 0.08],
        name: `ear_tuft_${side}_${j}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 6. KOALA ARMS & GRIPPING FOREPAWS
  // ---------------------------------------------------------------------------

  const armSides = [
    { s: 1, tag: "L", shoulder: shoulderL, elbow: elbowL, wrist: wristL },
    { s: -1, tag: "R", shoulder: shoulderR, elbow: elbowR, wrist: wristR },
  ];

  for (const { s, tag, shoulder, elbow, wrist } of armSides) {
    // Upper arm
    b.part(
      tileBox([0.07, 0.12, 0.08], FUR_BODY_TEX, 0.011),
      C_DARK_GREY,
      { bone: shoulder, at: [s * 0.14, 0.55, 0.03], texture: FUR_BODY_TEX, name: `upper_arm_${tag}` },
    );
    // Elbow tuft
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.03), C_WHITE, {
      bone: elbow,
      at: [s * 0.16, 0.51, 0.01],
      name: `elbow_tuft_${tag}`,
    });
    // Forearm
    b.part(
      tileBox([0.07, 0.08, 0.10], FUR_BODY_TEX, 0.011),
      C_DARK_GREY,
      { bone: elbow, at: [s * 0.12, 0.50, -0.01], texture: FUR_BODY_TEX, name: `forearm_${tag}` },
    );
    // Wrist / Palm block
    b.part(new THREE.BoxGeometry(0.06, 0.04, 0.06), C_DARK_GREY, {
      bone: wrist,
      at: [s * 0.09, 0.48, -0.04],
      name: `wrist_palm_${tag}`,
    });
    // Dark paw pad
    b.part(new THREE.BoxGeometry(0.048, 0.008, 0.048), "#363338", {
      bone: wrist,
      at: [s * 0.09, 0.458, -0.04],
      name: `palm_pad_${tag}`,
    });

    // 5 Digits gripping the trunk: 2 opposable thumbs + 3 fingers
    const digitAngles = [
      { id: 1, angle: -45, reach: 0.026 },
      { id: 2, angle: -20, reach: 0.030 },
      { id: 3, angle: 15, reach: 0.032 },
      { id: 4, angle: 40, reach: 0.030 },
      { id: 5, angle: 65, reach: 0.025 },
    ];

    for (const d of digitAngles) {
      const rad = (d.angle * Math.PI) / 180;
      const dx = Math.sin(rad) * d.reach;
      const dz = -Math.cos(rad) * d.reach;
      const digitPos = [s * (0.09 + dx), 0.475, -0.04 + dz] as const;

      b.part(new THREE.BoxGeometry(0.015, 0.015, 0.02), C_DARK_GREY, {
        bone: wrist,
        at: digitPos,
        name: `digit_${tag}_${d.id}`,
      });

      b.extrude(CLAW_OUTLINE, {
        bone: wrist,
        at: digitPos,
        x: [s * Math.sin(rad), -0.2, -Math.cos(rad)],
        y: [0, -1, 0],
        thickness: 0.005,
        color: C_CLAW,
        name: `claw_${tag}_${d.id}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 7. KOALA LEGS & CLAMPING HINDPAWS
  // ---------------------------------------------------------------------------

  const legSides = [
    { s: 1, tag: "L", hip: hipL, knee: kneeL, ankle: ankleL },
    { s: -1, tag: "R", hip: hipR, knee: kneeR, ankle: ankleR },
  ];

  for (const { s, tag, hip, knee, ankle } of legSides) {
    // Thigh
    b.part(
      tileBox([0.09, 0.14, 0.10], FUR_BODY_TEX, 0.012),
      C_DARK_GREY,
      { bone: hip, at: [s * 0.12, 0.35, 0.02], texture: FUR_BODY_TEX, name: `thigh_${tag}` },
    );
    // Shin
    b.part(
      tileBox([0.08, 0.10, 0.09], FUR_BODY_TEX, 0.012),
      C_DARK_GREY,
      { bone: knee, at: [s * 0.13, 0.29, -0.01], texture: FUR_BODY_TEX, name: `shin_${tag}` },
    );
    // Foot block
    b.part(new THREE.BoxGeometry(0.065, 0.035, 0.07), C_DARK_GREY, {
      bone: ankle,
      at: [s * 0.09, 0.25, -0.04],
      name: `foot_block_${tag}`,
    });
    // Sole pad
    b.part(new THREE.BoxGeometry(0.052, 0.010, 0.055), "#363338", {
      bone: ankle,
      at: [s * 0.09, 0.231, -0.04],
      name: `sole_pad_${tag}`,
    });

    const hindToeAngles = [
      { id: 1, angle: -25, reach: 0.028 },
      { id: 2, angle: 5, reach: 0.032 },
      { id: 3, angle: 35, reach: 0.030 },
      { id: 4, angle: 60, reach: 0.025 },
    ];

    for (const t of hindToeAngles) {
      const rad = (t.angle * Math.PI) / 180;
      const tx = Math.sin(rad) * t.reach;
      const tz = -Math.cos(rad) * t.reach;
      const toePos = [s * (0.09 + tx), 0.245, -0.04 + tz] as const;

      b.part(new THREE.BoxGeometry(0.016, 0.016, 0.02), C_DARK_GREY, {
        bone: ankle,
        at: toePos,
        name: `toe_${tag}_${t.id}`,
      });

      b.extrude(CLAW_OUTLINE, {
        bone: ankle,
        at: toePos,
        x: [s * Math.sin(rad), -0.2, -Math.cos(rad)],
        y: [0, -1, 0],
        thickness: 0.005,
        color: C_CLAW,
        name: `hind_claw_${tag}_${t.id}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 8. KOALA SNACK (GUM TWIG HELD IN LEFT PAW)
  // ---------------------------------------------------------------------------

  const snackBase = new THREE.Vector3(0.10, 0.49, -0.02);
  const snackTip = new THREE.Vector3(0.18, 0.57, 0.03);
  const snackDir = new THREE.Vector3().subVectors(snackTip, snackBase).normalize();

  b.part(new THREE.CylinderGeometry(0.0035, 0.0045, snackBase.distanceTo(snackTip), 5), C_RED_GUM, {
    bone: wristL,
    at: mid(snackBase, snackTip),
    dir: snackDir,
    name: "snack_twig_stem",
  });

  const snackLeaves: [number, number, number, [number, number, number], [number, number, number]][] = [
    [0.13, 0.52, 0.00, [0.4, 0.6, 0.6], [0.2, 0.9, -0.2]],
    [0.16, 0.55, 0.02, [-0.5, 0.6, 0.6], [0.4, 0.8, -0.4]],
    [0.18, 0.57, 0.03, [0.3, 0.8, 0.4], [0.1, 0.9, 0.3]],
  ];
  for (let i = 0; i < snackLeaves.length; i++) {
    const [lx, ly, lz, dx, dy] = snackLeaves[i];
    b.extrude(SICKLE_OUTLINE, {
      bone: wristL,
      at: [lx, ly, lz],
      x: dx,
      y: dy,
      thickness: 0.0025,
      color: "#5b946d",
      name: `snack_leaf_${i}`,
    });
  }

  return b.root;
}
