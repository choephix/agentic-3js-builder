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
  const rand = rng(1994);

  // ---------------------------------------------------------------------------
  // 1. PALETTES & RETRO PIXEL ART TEXTURES
  // ---------------------------------------------------------------------------

  // Texture 1: Slate-Heather Koala Body Fur (32x32)
  const FUR_BODY_TEX = pixelTexture(32, 32, (g) => {
    const furPal = ["#4e5461", "#646b79", "#7f8796", "#9aa3b2", "#b5becd", "#cfd7e4"];
    g.fill((x, y) => {
      const v = 0.5 + 0.22 * Math.sin(x * 0.35) + 0.18 * Math.cos(y * 0.4);
      return pick(furPal, v, bayer(x, y));
    });
    // Distinctive pixel fur tuft flecks
    const flecks: [number, number][] = [
      [3, 5],
      [11, 13],
      [21, 7],
      [7, 21],
      [17, 27],
      [27, 19],
      [2, 15],
      [15, 3],
      [25, 29],
      [9, 11],
    ];
    for (const [fx, fy] of flecks) {
      g.set(fx, fy, "#dce3ef");
      g.set(fx + 1, fy, "#b5becd");
      g.set(fx, fy + 1, "#3c414c");
    }
  });

  // Texture 2: Fluffy Cream Chest & Belly Bib (32x32)
  const BELLY_FLUFF_TEX = pixelTexture(32, 32, (g) => {
    const creamPal = ["#9c907a", "#b7aa92", "#d2c7b0", "#e8dfcb", "#f7f2e4", "#ffffff"];
    g.fill((x, y) => {
      const d = Math.hypot(x - 16, y - 16) / 18;
      const v = 0.88 - d * 0.42;
      return pick(creamPal, v, bayer(x, y));
    });
    // Layered white fur tooth waves
    for (let x = 1; x < 31; x += 2) {
      g.set(x, 7 + (x % 3), "#ffffff");
      g.set(x, 15 + ((x + 1) % 3), "#ffffff");
      g.set(x, 23 + (x % 3), "#ffffff");
      g.set(x, 29, "#f0eade");
    }
  });

  // Texture 3: Detailed Koala Muzzle & Big Leathery Nose (32x32)
  const FACE_TEX = pixelTexture(32, 32, (g) => {
    const creamPal = ["#b2a792", "#cbc1ad", "#dfd7c5", "#eee7d8", "#fbf8f0"];
    g.fill((x, y) => {
      const v = 0.62 + 0.35 * (1 - Math.abs(x - 16) / 16);
      return pick(creamPal, v, bayer(x, y));
    });

    // Big black leathery oval/shield nose
    for (let y = 6; y <= 23; y++) {
      const dy = (y - 14.5) / 8.5;
      const hw = Math.round(5.8 * Math.sqrt(Math.max(0, 1 - dy * dy * 0.88)));
      for (let x = 16 - hw; x <= 16 + hw; x++) {
        g.set(x, y, "#212229");
      }
    }
    // Deep dark border around nose
    for (let y = 6; y <= 23; y++) {
      const dy = (y - 14.5) / 8.5;
      const hw = Math.round(5.8 * Math.sqrt(Math.max(0, 1 - dy * dy * 0.88)));
      g.set(16 - hw, y, "#121318");
      g.set(16 + hw, y, "#121318");
    }

    // Specular leather glints on top bridge
    g.set(14, 8, "#6f7688");
    g.set(15, 8, "#8e96aa");
    g.set(14, 9, "#8e96aa");
    g.set(15, 9, "#6f7688");
    g.set(17, 10, "#4d5362");

    // Nostril cavities
    g.set(13, 20, "#0b0c10");
    g.set(14, 20, "#0b0c10");
    g.set(18, 20, "#0b0c10");
    g.set(19, 20, "#0b0c10");
    g.set(13, 21, "#17181f");
    g.set(19, 21, "#17181f");

    // Seam line down to lips
    g.set(16, 24, "#17181f");
    g.set(16, 25, "#17181f");
    g.set(15, 26, "#17181f");
    g.set(16, 26, "#17181f");
    g.set(17, 26, "#17181f");
    g.set(14, 27, "#17181f");
    g.set(18, 27, "#17181f");

    // Whisker freckles on cheeks
    const freckles: [number, number][] = [
      [6, 18],
      [8, 19],
      [5, 21],
      [25, 18],
      [23, 19],
      [26, 21],
      [7, 23],
      [24, 23],
    ];
    for (const [fx, fy] of freckles) {
      g.set(fx, fy, "#584e3f");
    }

    // Cute blush accents
    g.set(5, 24, "#e0ada4");
    g.set(6, 24, "#e0ada4");
    g.set(25, 24, "#e0ada4");
    g.set(26, 24, "#e0ada4");
  });

  // Texture 4: Glossy Koala Eye with Double White Glints (16x16)
  const EYE_TEX = pixelTexture(16, 16, (g) => {
    // Dark outer eye socket
    for (let y = 2; y <= 13; y++) {
      const dy = (y - 7.5) / 5.5;
      const hw = Math.round(5.5 * Math.sqrt(Math.max(0, 1 - dy * dy)));
      for (let x = 8 - hw; x <= 8 + hw; x++) {
        g.set(x, y, "#121217");
      }
    }
    // Warm amber iris crescent
    for (let y = 7; y <= 12; y++) {
      for (let x = 6; x <= 11; x++) {
        const d = Math.hypot(x - 8, y - 8);
        if (d <= 4.4 && d >= 1.8) {
          g.set(x, y, y >= 10 ? "#c46e24" : "#823f10");
        }
      }
    }
    // Deep obsidian pupil
    for (let y = 6; y <= 9; y++) {
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
    const woodPal = ["#bfb095", "#d6c9b0", "#e8dec9"];
    const barkPal = ["#394333", "#4e5b46", "#66765d", "#819477", "#9db293"];
    g.fill((x, y) => {
      const isBark = Math.sin(x * 0.32 + Math.sin(y * 0.16) * 2.2) + Math.cos(y * 0.11) > 0.12;
      if (isBark) {
        const v = 0.5 + 0.3 * Math.sin(y * 0.24) + 0.2 * Math.cos(x * 0.45);
        return pick(barkPal, v, bayer(x, y));
      } else {
        const v = 0.5 + 0.4 * Math.sin(x * 0.5);
        return pick(woodPal, v, bayer(x, y));
      }
    });
    // Red gum tree sap fissures
    for (let y = 4; y < 60; y += 11) {
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
      const isMoss = Math.sin(x * 0.42) + Math.cos(y * 0.36) > 0.38;
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

  // Palette constants
  const C_DARK_GREY = "#636a77";
  const C_WHITE = "#ffffff";
  const C_CREAM = "#ded7c8";
  const C_NOSE_BLACK = "#212229";
  const C_CLAW = "#18181f";
  const C_WOOD_CAMBIUM = "#d8ccb6";
  const C_SAGE_BARK = "#707f68";
  const C_LEAF_GREEN = "#4a7455";
  const C_RED_GUM = "#852c2c";
  const C_DIRT = "#3b261b";
  const C_MOSS = "#416524";
  const C_STONE = "#787e8a";
  const C_RUMP_LIGHT = "#cbd2de";

  // ---------------------------------------------------------------------------
  // 2. STEPPED PIXEL SILHOUETTES
  // ---------------------------------------------------------------------------

  const EAR_OUTLINE = stepped(
    [
      [0, 5],
      [0, 7],
      [0, 8],
      [1, 9],
      [1, 9],
      [2, 8],
      [2, 7],
      [2, 5],
    ],
    0.011,
  );

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
  // 3. KOALA SKELETON (HERO IN FOREGROUND FACING +Z)
  // ---------------------------------------------------------------------------

  // ROOT: Pelvis & Hips nestled against trunk
  const hips = b.joint("hips", {
    at: [0, 0.35, 0.03],
    dir: [0, 0.25, 0.97],
    role: "spine",
  });

  // Spine Mid (hunching slightly forward)
  const spineMid = b.joint("spineMid", {
    parent: hips,
    at: [0, 0.47, 0.05],
    dir: [0, 0.45, 0.89],
    role: "spine",
  });

  // Chest & Shoulders
  const chest = b.joint("chest", {
    parent: spineMid,
    at: [0, 0.59, 0.06],
    dir: [0, 0.75, 0.66],
    role: "spine",
  });

  // Neck
  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 0.66, 0.08],
    dir: [0, 0.70, 0.71],
    role: "neck",
  });

  // Head (curious, characterful gaze directly facing front)
  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.74, 0.11],
    dir: [0, 0.15, 0.99],
    role: "head",
  });

  // Articulated Lower Jaw
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.69, 0.15],
    dir: [0, 0.05, 1.0],
    role: "jaw",
  });

  // Fluffy Big Ears
  const earL = b.joint("earL", {
    parent: head,
    at: [0.13, 0.77, 0.10],
    dir: [0.85, 0.35, 0.39],
  });
  const earR = b.joint("earR", {
    parent: head,
    at: [-0.13, 0.77, 0.10],
    dir: [-0.85, 0.35, 0.39],
  });

  // Arms wrapping around the trunk sides to grip the bark
  const shoulderL = b.joint("shoulderL", {
    parent: chest,
    at: [0.12, 0.58, 0.04],
    dir: [0.4, -0.3, -0.86],
    role: "arm",
  });
  const elbowL = b.joint("elbowL", {
    parent: shoulderL,
    at: [0.16, 0.52, -0.02],
    dir: [-0.4, -0.2, -0.9],
    role: "arm",
  });
  const wristL = b.joint("wristL", {
    parent: elbowL,
    at: [0.10, 0.48, -0.06],
    dir: [-0.5, 0.1, -0.86],
    role: "arm",
  });

  const shoulderR = b.joint("shoulderR", {
    parent: chest,
    at: [-0.12, 0.58, 0.04],
    dir: [-0.4, -0.3, -0.86],
    role: "arm",
  });
  const elbowR = b.joint("elbowR", {
    parent: shoulderR,
    at: [-0.16, 0.52, -0.02],
    dir: [0.4, -0.2, -0.9],
    role: "arm",
  });
  const wristR = b.joint("wristR", {
    parent: elbowR,
    at: [-0.10, 0.48, -0.06],
    dir: [0.5, 0.1, -0.86],
    role: "arm",
  });

  // Legs clamping the trunk below the rump
  const hipL = b.joint("hipL", {
    parent: hips,
    at: [0.11, 0.35, 0.02],
    dir: [0.35, -0.15, -0.92],
    role: "leg",
  });
  const kneeL = b.joint("kneeL", {
    parent: hipL,
    at: [0.16, 0.33, -0.02],
    dir: [-0.35, -0.25, -0.9],
    role: "leg",
  });
  const ankleL = b.joint("ankleL", {
    parent: kneeL,
    at: [0.10, 0.28, -0.06],
    dir: [-0.4, 0.0, -0.92],
    role: "leg",
  });

  const hipR = b.joint("hipR", {
    parent: hips,
    at: [-0.11, 0.35, 0.02],
    dir: [-0.35, -0.15, -0.92],
    role: "leg",
  });
  const kneeR = b.joint("kneeR", {
    parent: hipR,
    at: [-0.16, 0.33, -0.02],
    dir: [0.35, -0.25, -0.9],
    role: "leg",
  });
  const ankleR = b.joint("ankleR", {
    parent: kneeR,
    at: [-0.10, 0.28, -0.06],
    dir: [0.4, 0.0, -0.92],
    role: "leg",
  });

  // ---------------------------------------------------------------------------
  // 4. EUCALYPTUS BRANCH STAND (SCENERY ON bone: hips)
  // ---------------------------------------------------------------------------

  // Ground Pedestal (stands firmly on y = 0)
  b.part(new THREE.CylinderGeometry(0.28, 0.29, 0.035, 16), C_DIRT, {
    bone: hips,
    at: [0, 0.0175, 0],
    texture: GROUND_TEX,
    name: "base_tier1",
  });
  b.part(new THREE.CylinderGeometry(0.24, 0.25, 0.025, 16), C_DIRT, {
    bone: hips,
    at: [0, 0.0475, 0],
    texture: GROUND_TEX,
    name: "base_tier2",
  });

  // Moss Patches on Base
  const mossCoords: [number, number, number, number][] = [
    [-0.12, 0.061, 0.11, 0.07],
    [0.14, 0.061, -0.09, 0.06],
    [0.10, 0.061, 0.13, 0.05],
    [-0.15, 0.061, -0.10, 0.065],
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
    [0.18, 0.045, 0.08, 0.035, 0.018, 0.025],
    [-0.19, 0.045, 0.05, 0.03, 0.015, 0.02],
    [0.05, 0.068, 0.20, 0.028, 0.016, 0.022],
    [-0.08, 0.068, -0.18, 0.032, 0.018, 0.024],
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
    [0.14, 0.063, 0.06, 35],
    [-0.13, 0.063, 0.08, -60],
    [-0.05, 0.063, 0.17, 110],
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

  // Lower Trunk Segment (behind koala, y = 0.06 to 0.34)
  b.part(
    tileBox([0.16, 0.28, 0.16], BARK_TEX, 0.011),
    C_SAGE_BARK,
    { bone: hips, at: [0, 0.20, -0.08], name: "trunk_lower" },
  );

  // Lower Peeling Bark Strip
  b.extrude(BARK_STRIP_OUTLINE, {
    bone: hips,
    at: [0.082, 0.18, -0.08],
    x: [0.3, 0.95, 0],
    y: [0.1, 0, 0.99],
    thickness: 0.006,
    color: C_SAGE_BARK,
    name: "bark_peel_lower",
  });

  // Shelf Fungus on Lower Trunk
  b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.012, 8, 1, false, 0, Math.PI), "#d2a36d", {
    bone: hips,
    at: [-0.082, 0.22, -0.08],
    dir: [-1, 0.1, 0],
    name: "bracket_mushroom_top",
  });

  // Side Branch Fork (projecting to right-rear)
  b.part(new THREE.CylinderGeometry(0.048, 0.058, 0.18, 8), C_SAGE_BARK, {
    bone: hips,
    at: [-0.12, 0.35, -0.12],
    dir: [-0.7, 0.4, -0.6],
    texture: BARK_TEX,
    name: "branch_fork_r",
  });
  b.part(new THREE.CircleGeometry(0.046, 10), C_WOOD_CAMBIUM, {
    bone: hips,
    at: [-0.18, 0.38, -0.17],
    dir: [-0.7, 0.4, -0.6],
    axis: "z",
    texture: TREE_RING_TEX,
    name: "branch_cut_face_r",
  });

  // Middle Trunk Segment (Gripping Perch directly behind koala, y = 0.34 to 0.62)
  b.part(
    tileBox([0.15, 0.28, 0.15], BARK_TEX, 0.011),
    C_SAGE_BARK,
    { bone: hips, at: [0, 0.48, -0.09], name: "trunk_mid" },
  );

  // Peeling Bark Ribbon beside Koala
  b.extrude(BARK_STRIP_OUTLINE, {
    bone: hips,
    at: [-0.078, 0.46, -0.09],
    x: [-0.2, 0.95, -0.2],
    y: [0.2, 0, 0.98],
    thickness: 0.006,
    color: C_SAGE_BARK,
    name: "bark_peel_mid",
  });

  // Upper Trunk Segment (y = 0.62 to 0.88, behind koala's head)
  b.part(
    tileBox([0.13, 0.26, 0.13], BARK_TEX, 0.011),
    C_SAGE_BARK,
    { bone: hips, at: [0, 0.75, -0.11], name: "trunk_upper" },
  );
  b.part(new THREE.CircleGeometry(0.062, 12), C_WOOD_CAMBIUM, {
    bone: hips,
    at: [0, 0.88, -0.11],
    dir: [0, 1, 0],
    axis: "z",
    texture: TREE_RING_TEX,
    name: "trunk_top_ring",
  });

  // High Foliage Boughs Arching Behind & Above Koala
  // Left High Bough
  b.part(new THREE.CylinderGeometry(0.035, 0.045, 0.22, 8), C_SAGE_BARK, {
    bone: hips,
    at: [0.10, 0.84, -0.06],
    dir: [0.65, 0.5, 0.55],
    texture: BARK_TEX,
    name: "bough_high_l",
  });
  // Right High Bough
  b.part(new THREE.CylinderGeometry(0.035, 0.045, 0.20, 8), C_SAGE_BARK, {
    bone: hips,
    at: [-0.09, 0.83, -0.08],
    dir: [-0.6, 0.55, 0.5],
    texture: BARK_TEX,
    name: "bough_high_r",
  });

  // Framing Leaf Clusters (positioned so they frame, rather than cover, the koala)
  const canopyLeaves: { pos: [number, number, number]; dirX: [number, number, number]; dirY: [number, number, number] }[] = [
    // Left cluster
    { pos: [0.18, 0.90, -0.02], dirX: [0.7, -0.2, 0.6], dirY: [-0.2, 0.9, 0.3] },
    { pos: [0.22, 0.86, 0.01], dirX: [0.5, -0.6, 0.6], dirY: [0.4, 0.7, -0.5] },
    { pos: [0.15, 0.93, -0.05], dirX: [-0.2, 0.4, 0.9], dirY: [0.8, 0.5, -0.3] },
    { pos: [0.24, 0.91, 0.04], dirX: [0.7, 0.2, -0.6], dirY: [0.3, 0.9, 0.3] },
    // Right cluster
    { pos: [-0.16, 0.89, -0.04], dirX: [-0.7, -0.2, 0.6], dirY: [0.2, 0.9, 0.3] },
    { pos: [-0.21, 0.85, -0.01], dirX: [-0.5, -0.6, 0.6], dirY: [-0.4, 0.7, -0.5] },
    { pos: [-0.14, 0.92, -0.07], dirX: [0.2, 0.4, 0.9], dirY: [-0.8, 0.5, -0.3] },
    // Crown top crest
    { pos: [0.01, 0.94, -0.11], dirX: [0.0, 0.3, 0.95], dirY: [0.0, 0.95, -0.3] },
    { pos: [-0.03, 0.96, -0.08], dirX: [-0.7, 0.4, 0.5], dirY: [0.3, 0.8, -0.5] },
  ];

  for (let i = 0; i < canopyLeaves.length; i++) {
    const s = canopyLeaves[i];
    b.part(new THREE.CylinderGeometry(0.003, 0.004, 0.032, 4), C_RED_GUM, {
      bone: hips,
      at: s.pos,
      dir: s.dirY,
      name: `canopy_stem_${i}`,
    });
    b.extrude(SICKLE_OUTLINE, {
      bone: hips,
      at: offset(s.pos, s.dirY, 0.018),
      x: s.dirX,
      y: s.dirY,
      thickness: 0.003,
      color: C_LEAF_GREEN,
      name: `canopy_leaf_${i}`,
    });
  }

  // Woody Gum Nut Capsules
  const nutLocations: [number, number, number][] = [
    [0.17, 0.87, -0.04],
    [0.19, 0.84, -0.01],
    [-0.15, 0.86, -0.06],
    [-0.18, 0.82, -0.03],
  ];
  for (let i = 0; i < nutLocations.length; i++) {
    b.part(new THREE.CylinderGeometry(0.014, 0.009, 0.018, 6), "#63563e", {
      bone: hips,
      at: nutLocations[i],
      dir: [0.2, -0.8, 0.5],
      texture: GUM_NUT_TEX,
      name: `gum_nut_${i}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 5. KOALA BODY (PELVIS, BELLY, CHEST)
  // ---------------------------------------------------------------------------

  // Pelvis / Hips Core
  b.part(
    tileBox([0.23, 0.16, 0.20], FUR_BODY_TEX, 0.012),
    C_DARK_GREY,
    { bone: hips, at: hips.local([0, 0, 0]), name: "pelvis_core" },
  );

  // Plump Rump Contour
  b.part(
    tileBox([0.21, 0.14, 0.08], FUR_BODY_TEX, 0.012),
    C_DARK_GREY,
    { bone: hips, at: hips.local([0, -0.01, -0.10]), name: "rump_contour" },
  );

  // White Speckled Rump Camouflage Patch
  b.part(new THREE.BoxGeometry(0.15, 0.10, 0.02), C_RUMP_LIGHT, {
    bone: hips,
    at: hips.local([0, -0.02, -0.145]),
    name: "rump_patch",
  });

  // Mid-Spine & Torso
  b.part(
    tileBox([0.22, 0.15, 0.19], FUR_BODY_TEX, 0.012),
    C_DARK_GREY,
    { bone: spineMid, at: spineMid.local([0, 0, 0]), name: "torso_mid" },
  );

  // Fluffy Lower Belly Bib
  b.part(new THREE.BoxGeometry(0.15, 0.13, 0.03), C_WHITE, {
    bone: spineMid,
    at: spineMid.local([0, 0.01, 0.10]),
    texture: BELLY_FLUFF_TEX,
    name: "belly_fluff_mid",
  });

  // Chest & Shoulders
  b.part(
    tileBox([0.21, 0.16, 0.17], FUR_BODY_TEX, 0.012),
    C_DARK_GREY,
    { bone: chest, at: chest.local([0, 0, 0]), name: "chest_core" },
  );

  // Main Fluffy White Bib on Chest
  b.part(new THREE.BoxGeometry(0.16, 0.15, 0.035), C_WHITE, {
    bone: chest,
    at: chest.local([0, 0.01, 0.09]),
    texture: BELLY_FLUFF_TEX,
    name: "chest_bib_front",
  });

  // Upper Throat Fluff Collar
  b.part(new THREE.BoxGeometry(0.13, 0.05, 0.04), C_WHITE, {
    bone: chest,
    at: chest.local([0, 0.07, 0.075]),
    name: "throat_fluff_collar",
  });

  // Neck Cylinder
  b.part(new THREE.CylinderGeometry(0.08, 0.09, 0.06, 8), C_DARK_GREY, {
    bone: neck,
    at: neck.local([0, 0, 0]),
    name: "neck_cylinder",
  });

  // ---------------------------------------------------------------------------
  // 6. KOALA HEAD, FACE, EARS, JAW
  // ---------------------------------------------------------------------------

  // Main Cranium Box
  b.part(
    tileBox([0.18, 0.16, 0.17], FUR_BODY_TEX, 0.011),
    C_DARK_GREY,
    { bone: head, at: head.local([0, 0.02, 0]), name: "cranium_box" },
  );

  // Forehead Fur Ridge
  b.part(new THREE.BoxGeometry(0.10, 0.035, 0.10), "#7f8796", {
    bone: head,
    at: head.local([0, 0.105, 0.01]),
    name: "forehead_ridge",
  });

  // Wide Fluffy Cheeks & Ruffs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(
      tileBox([0.05, 0.10, 0.12], FUR_BODY_TEX, 0.011),
      C_DARK_GREY,
      { bone: head, at: head.local([s * 0.105, -0.01, 0.01]), name: `cheek_puff_${side}` },
    );
    b.part(new THREE.BoxGeometry(0.035, 0.055, 0.06), C_WHITE, {
      bone: head,
      at: head.local([s * 0.12, -0.045, 0.01]),
      name: `cheek_fluff_tuft_${side}`,
    });
  }

  // Snout / Muzzle Block
  b.part(
    tileBox([0.10, 0.08, 0.08], BELLY_FLUFF_TEX, 0.010),
    C_CREAM,
    { bone: head, at: head.local([0, -0.01, 0.095]), name: "snout_block" },
  );

  // Muzzle Front Quad with Freckles & Blush
  b.part(new THREE.PlaneGeometry(0.10, 0.09), C_WHITE, {
    bone: head,
    at: head.local([0, -0.01, 0.136]),
    texture: FACE_TEX,
    name: "face_muzzle_quad",
  });

  // 3D Rounded Black Leathery Nose Shield
  b.part(new THREE.BoxGeometry(0.068, 0.088, 0.038), C_NOSE_BLACK, {
    bone: head,
    at: head.local([0, 0.005, 0.142]),
    name: "nose_3d_leather",
  });

  // Specular Glint Bar on Nose
  b.part(new THREE.BoxGeometry(0.024, 0.028, 0.008), "#8e96aa", {
    bone: head,
    at: head.local([0, 0.03, 0.162]),
    name: "nose_specular_glint",
  });

  // Nostril Cavities (flush inside nose)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.BoxGeometry(0.012, 0.008, 0.01), "#0b0c10", {
      bone: head,
      at: head.local([s * 0.016, -0.022, 0.155]),
      name: `nostril_${side}`,
    });
  }

  // Big Shiny Anime/Pixel Eyes (on angled front cheeks)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eyePos = head.local([s * 0.076, 0.02, 0.086]);
    const eyeDir = head.dir([s * 0.52, 0, 0.85]);

    b.part(new THREE.BoxGeometry(0.034, 0.034, 0.014), "#121217", {
      bone: head,
      at: eyePos,
      dir: eyeDir,
      name: `eye_socket_${side}`,
    });
    b.part(new THREE.PlaneGeometry(0.032, 0.032), C_WHITE, {
      bone: head,
      at: offset(eyePos, eyeDir, 0.008),
      dir: eyeDir,
      axis: "z",
      texture: EYE_TEX,
      name: `eye_quad_${side}`,
    });
    b.part(new THREE.BoxGeometry(0.036, 0.012, 0.016), "#4e5461", {
      bone: head,
      at: offset(eyePos, [0, 1, 0], 0.023),
      dir: eyeDir,
      name: `brow_ridge_${side}`,
    });
  }

  // Articulated Lower Jaw
  b.part(new THREE.BoxGeometry(0.072, 0.032, 0.08), C_CREAM, {
    bone: jaw,
    at: jaw.local([0, -0.015, 0.035]),
    name: "lower_jaw_plate",
  });
  b.part(new THREE.BoxGeometry(0.052, 0.022, 0.045), C_WHITE, {
    bone: jaw,
    at: jaw.local([0, -0.032, 0.05]),
    name: "chin_fluff",
  });
  b.part(new THREE.BoxGeometry(0.028, 0.008, 0.024), "#d65d70", {
    bone: jaw,
    at: jaw.local([0, 0.003, 0.042]),
    name: "tongue_tip",
  });

  // Huge Round Fluffy Koala Ears
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const earJoint = s > 0 ? earL : earR;

    b.extrude(EAR_OUTLINE, {
      bone: earJoint,
      at: earJoint.local([0, 0, 0]),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.015,
      color: C_DARK_GREY,
      name: `ear_shell_${side}`,
    });

    b.part(new THREE.PlaneGeometry(0.08, 0.08), C_WHITE, {
      bone: earJoint,
      at: earJoint.local([s * 0.042, 0.044, 0.009]),
      dir: earJoint.dir([0, 0, 1]),
      axis: "z",
      texture: EAR_INNER_TEX,
      name: `ear_inner_quad_${side}`,
    });

    const tuftAngles = [-35, -15, 5, 25, 45, 65, 85];
    for (let j = 0; j < tuftAngles.length; j++) {
      const ang = (tuftAngles[j] * Math.PI) / 180;
      const tx = Math.cos(ang) * 0.075;
      const ty = Math.sin(ang) * 0.075 + 0.035;
      b.part(new THREE.BoxGeometry(0.02, 0.025, 0.018), C_WHITE, {
        bone: earJoint,
        at: earJoint.local([s * tx, ty, 0.002]),
        name: `ear_fluff_rim_${side}_${j}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 7. KOALA ARMS & GRIPPING FOREPAWS
  // ---------------------------------------------------------------------------

  const armSides = [
    { s: 1, tag: "L", shoulder: shoulderL, elbow: elbowL, wrist: wristL },
    { s: -1, tag: "R", shoulder: shoulderR, elbow: elbowR, wrist: wristR },
  ];

  for (const { s, tag, shoulder, elbow, wrist } of armSides) {
    b.part(
      tileBox([0.08, 0.14, 0.08], FUR_BODY_TEX, 0.011),
      C_DARK_GREY,
      { bone: shoulder, at: mid(shoulder.at, elbow.at), name: `upper_arm_${tag}` },
    );
    b.part(new THREE.BoxGeometry(0.035, 0.035, 0.035), C_WHITE, {
      bone: elbow,
      at: elbow.local([s * 0.02, 0, -0.03]),
      name: `elbow_tuft_${tag}`,
    });
    b.part(
      tileBox([0.07, 0.13, 0.07], FUR_BODY_TEX, 0.011),
      C_DARK_GREY,
      { bone: elbow, at: mid(elbow.at, wrist.at), name: `forearm_${tag}` },
    );
    b.part(new THREE.BoxGeometry(0.065, 0.035, 0.06), C_DARK_GREY, {
      bone: wrist,
      at: wrist.at,
      name: `wrist_palm_${tag}`,
    });
    b.part(new THREE.BoxGeometry(0.055, 0.01, 0.05), "#3f3c40", {
      bone: wrist,
      at: offset(wrist.at, [0, -1, 0], 0.016),
      name: `palm_pad_${tag}`,
    });

    // 5 Digits per Forepaw: opposable thumb pair + finger trio
    const digitAngles = [
      { id: 1, angle: -50, reach: 0.028 },
      { id: 2, angle: -25, reach: 0.032 },
      { id: 3, angle: 15, reach: 0.035 },
      { id: 4, angle: 40, reach: 0.033 },
      { id: 5, angle: 65, reach: 0.028 },
    ];

    for (const d of digitAngles) {
      const rad = (d.angle * Math.PI) / 180;
      const dx = Math.sin(rad) * d.reach;
      const dz = -Math.cos(rad) * d.reach; // pointing back toward tree
      const digitPos = wrist.at.clone().add(new THREE.Vector3(s * dx, -0.005, dz));

      b.part(new THREE.BoxGeometry(0.016, 0.016, 0.022), C_DARK_GREY, {
        bone: wrist,
        at: digitPos,
        name: `digit_${tag}_${d.id}`,
      });

      // Claws firmly anchored at digit end
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
  // 8. KOALA LEGS & CLAMPING HINDPAWS
  // ---------------------------------------------------------------------------

  const legSides = [
    { s: 1, tag: "L", hip: hipL, knee: kneeL, ankle: ankleL },
    { s: -1, tag: "R", hip: hipR, knee: kneeR, ankle: ankleR },
  ];

  for (const { s, tag, hip, knee, ankle } of legSides) {
    b.part(
      tileBox([0.11, 0.16, 0.11], FUR_BODY_TEX, 0.012),
      C_DARK_GREY,
      { bone: hip, at: mid(hip.at, knee.at), name: `thigh_${tag}` },
    );
    b.part(
      tileBox([0.09, 0.14, 0.09], FUR_BODY_TEX, 0.012),
      C_DARK_GREY,
      { bone: knee, at: mid(knee.at, ankle.at), name: `shin_${tag}` },
    );
    b.part(new THREE.BoxGeometry(0.075, 0.04, 0.08), C_DARK_GREY, {
      bone: ankle,
      at: ankle.at,
      name: `foot_block_${tag}`,
    });
    b.part(new THREE.BoxGeometry(0.065, 0.012, 0.065), "#3f3c40", {
      bone: ankle,
      at: offset(ankle.at, [0, -1, 0], 0.018),
      name: `sole_pad_${tag}`,
    });

    const hindToeAngles = [
      { id: 1, angle: -30, reach: 0.030 },
      { id: 2, angle: 0, reach: 0.034 },
      { id: 3, angle: 30, reach: 0.032 },
      { id: 4, angle: 60, reach: 0.026 },
    ];

    for (const t of hindToeAngles) {
      const rad = (t.angle * Math.PI) / 180;
      const tx = Math.sin(rad) * t.reach;
      const tz = -Math.cos(rad) * t.reach;
      const toePos = ankle.at.clone().add(new THREE.Vector3(s * tx, -0.005, tz));

      b.part(new THREE.BoxGeometry(0.018, 0.018, 0.022), C_DARK_GREY, {
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
  // 9. KOALA SNACK (FRESH GUM TWIG HELD OUT TO THE SIDE)
  // ---------------------------------------------------------------------------

  // Fresh tender twig gripped in left paw, angled out to the side so it does not block the face
  const snackBase = wristL.local([0.02, 0.01, 0.02]);
  const snackTip = wristL.local([0.10, 0.08, 0.06]);
  const snackDir = new THREE.Vector3().subVectors(snackTip, snackBase).normalize();

  b.part(new THREE.CylinderGeometry(0.004, 0.005, 0.11, 6), C_RED_GUM, {
    bone: wristL,
    at: mid(snackBase, snackTip),
    dir: snackDir,
    name: "snack_twig_stem",
  });

  const snackLeaves: [number, number, number, [number, number, number], [number, number, number]][] = [
    [0.05, 0.03, 0.03, [0.4, 0.6, 0.6], [0.2, 0.9, -0.2]],
    [0.08, 0.06, 0.05, [-0.5, 0.6, 0.6], [0.4, 0.8, -0.4]],
    [0.10, 0.08, 0.06, [0.3, 0.8, 0.4], [0.1, 0.9, 0.3]],
  ];
  for (let i = 0; i < snackLeaves.length; i++) {
    const [lx, ly, lz, dx, dy] = snackLeaves[i];
    b.extrude(SICKLE_OUTLINE, {
      bone: wristL,
      at: wristL.local([lx, ly, lz]),
      x: dx,
      y: dy,
      thickness: 0.0025,
      color: "#6aa57c",
      name: `snack_leaf_${i}`,
    });
  }

  return b.root;
}
