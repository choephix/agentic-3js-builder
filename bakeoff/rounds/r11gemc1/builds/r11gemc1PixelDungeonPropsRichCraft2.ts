import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { pixelArt, pixelTexture, PixelGrid, bayer, tileBox } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dungeon Props Diorama",
  description:
    "Pixel-art dungeon prop diorama with an open treasure chest overflowing with gold and gems, a 16-spike bloodied iron trap, burning torches and brazier, oak barrels with potion spill, and a fallen adventurer's skeletal remains on stone flagstones.",
};

export default function build() {
  const b = createBuilder({ name: "dungeon_props", detail: 1 });

  // ---------------------------------------------------------------------------
  // 1. Color Palette & Pixel Textures
  // ---------------------------------------------------------------------------

  const P = {
    // Stone masonry
    stone0: "#111019",
    stone1: "#1d1b29",
    stone2: "#2d2a3d",
    stone3: "#444159",
    stone4: "#646082",
    stoneHi: "#8d89b0",
    moss: "#2c3d1e",
    mossHi: "#4d6b33",
    // Aged Oak Wood
    wood0: "#160c07",
    wood1: "#2b170c",
    wood2: "#452614",
    wood3: "#6e3d21",
    wood4: "#995832",
    woodHi: "#ba7245",
    // Wrought Iron & Steel
    iron0: "#0e0f14",
    iron1: "#1a1c24",
    iron2: "#2e323e",
    iron3: "#474d5e",
    ironHi: "#717b94",
    ironShine: "#a6b0cc",
    // Treasure Gold & Gems
    gold0: "#523206",
    gold1: "#8f5c0c",
    gold2: "#d49219",
    gold3: "#ffd147",
    goldHi: "#fff0a3",
    ruby: "#b80f2d",
    rubyHi: "#ff3d62",
    cyan: "#0ea5b8",
    cyanHi: "#52f0ff",
    emerald: "#148c44",
    emeraldHi: "#45f585",
    // Bone & Blood
    bone0: "#302b20",
    bone1: "#524a38",
    bone2: "#857a62",
    bone3: "#bfb397",
    boneHi: "#ded6c3",
    blood: "#570811",
    bloodHi: "#8f1322",
    // Slime & Potions
    slime0: "#13420d",
    slime1: "#257d19",
    slime2: "#44cc2e",
    slimeHi: "#7dff66",
    // Fire & Embers
    fire0: "#690a0a",
    fire1: "#c7300c",
    fire2: "#ff7b12",
    fire3: "#ffd42b",
    fireWhite: "#ffffff",
  };

  // Flagstone tile texture (32x32) with mortar bevels and moss
  const STONE_TILE_TEX = pixelTexture(32, 32, (g: PixelGrid) => {
    g.fill(() => P.stone0);
    const drawSlab = (rx: number, ry: number, rw: number, rh: number) => {
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const isTop = y === 0;
          const isLeft = x === 0;
          const isBottom = y === rh - 1;
          const isRight = x === rw - 1;
          let c = P.stone2;
          const d = bayer(rx + x, ry + y);
          if (d > 0.65) c = P.stone3;
          else if (d < 0.25) c = P.stone1;
          if (isTop || isLeft) c = P.stone4;
          if (isBottom || isRight) c = P.stone1;
          if ((x <= 1 || y <= 1) && (rx * 7 + ry * 13 + x + y) % 9 === 0) c = P.moss;
          if ((x === 0 || y === 0) && (rx * 3 + ry * 5 + x + y) % 13 === 0) c = P.mossHi;
          g.set(rx + x, ry + y, c);
        }
      }
    };
    drawSlab(1, 1, 14, 14);
    drawSlab(17, 1, 14, 18);
    drawSlab(1, 17, 14, 14);
    drawSlab(17, 21, 14, 10);
  });

  // Masonry Wall Brick texture (32x32)
  const BRICK_TEX = pixelTexture(32, 32, (g: PixelGrid) => {
    g.fill(() => P.stone0);
    const drawBrick = (bx: number, by: number, bw: number, bh: number) => {
      for (let y = 0; y < bh; y++) {
        for (let x = 0; x < bw; x++) {
          let c = bayer(bx + x, by + y) > 0.5 ? P.stone2 : P.stone3;
          if (y === 0 || x === 0) c = P.stone4;
          if (y === bh - 1 || x === bw - 1) c = P.stone1;
          if ((bx + by + x + y) % 19 === 0) c = P.moss;
          g.set(bx + x, by + y, c);
        }
      }
    };
    // Row 1
    drawBrick(1, 1, 14, 6);
    drawBrick(17, 1, 14, 6);
    // Row 2 (staggered)
    drawBrick(1, 9, 7, 6);
    drawBrick(10, 9, 14, 6);
    drawBrick(26, 9, 5, 6);
    // Row 3
    drawBrick(1, 17, 14, 6);
    drawBrick(17, 17, 14, 6);
    // Row 4 (staggered)
    drawBrick(1, 25, 10, 6);
    drawBrick(13, 25, 14, 6);
    drawBrick(29, 25, 2, 6);
  });

  // Wood planks texture (32x32) with rivets and weathered grain
  const WOOD_TEX = pixelTexture(32, 32, (g: PixelGrid) => {
    g.fill((x, y) => {
      const px = x % 8;
      if (px === 0) return P.wood0;
      if (px === 1) return P.woodHi;
      if (px === 7) return P.wood1;
      const b = bayer(x, y);
      let c = b > 0.6 ? P.wood3 : P.wood2;
      if ((y === 3 || y === 28) && px === 4) c = P.iron2;
      if ((y === 3 || y === 28) && px === 5) c = P.ironHi;
      return c;
    });
  });

  // Wrought Iron Texture (16x16)
  const IRON_TEX = pixelTexture(16, 16, (g: PixelGrid) => {
    g.fill((x, y) => {
      if (x === 0 || y === 0) return P.ironHi;
      if (x === 15 || y === 15) return P.iron0;
      const isRivet = (x === 3 || x === 12) && (y === 3 || y === 12);
      if (isRivet) return P.ironShine;
      const isRivetShadow = (x === 4 || x === 13) && (y === 4 || y === 13);
      if (isRivetShadow) return P.iron0;
      return bayer(x, y) > 0.5 ? P.iron2 : P.iron1;
    });
  });

  // Blazing Torch Flame (16x24)
  const FLAME_TEX = pixelArt(
    [
      "......yyyy......",
      ".....ywwwwy.....",
      "....ywwwwwwy....",
      "...ywwfffffwy...",
      "...ywfffffffy...",
      "..ywfoooooofwy..",
      "..ywfoooooofwy..",
      ".ywfoorrrrooffy.",
      ".ywfoorrrrooffy.",
      ".ywfoorrrrooffy.",
      ".ywforrddrrooffy",
      ".ywforrddrrooffy",
      ".ywforrddrrooffy",
      "..wforrddrrooff.",
      "..wforrddrroof..",
      "...forrddrroof..",
      "...forrddrroo...",
      "....orrddrro....",
      "....orrddrro....",
      ".....rrddrr.....",
      ".....rrddrr.....",
      "......rddr......",
      ".......dd.......",
      "................",
    ],
    {
      w: P.fireWhite,
      y: P.fire3,
      f: P.fire2,
      o: P.fire1,
      r: P.fire0,
      d: "#380606",
    },
  );

  // Treasure gold & gems texture (32x32)
  const TREASURE_TEX = pixelTexture(32, 32, (g: PixelGrid) => {
    g.fill((x, y) => {
      const b = bayer(x, y);
      let c = b > 0.65 ? P.gold3 : b > 0.35 ? P.gold2 : P.gold1;
      // Clusters of sparkling gems
      const gem1 = (x - 6) ** 2 + (y - 8) ** 2 < 9;
      if (gem1) return (x + y) % 2 === 0 ? P.rubyHi : P.ruby;
      const gem2 = (x - 22) ** 2 + (y - 12) ** 2 < 8;
      if (gem2) return (x + y) % 2 === 0 ? P.cyanHi : P.cyan;
      const gem3 = (x - 14) ** 2 + (y - 24) ** 2 < 9;
      if (gem3) return (x + y) % 2 === 0 ? P.emeraldHi : P.emerald;
      if ((x * 7 + y * 13) % 23 === 0) c = P.goldHi;
      if ((x * 11 + y * 17) % 29 === 0) c = P.gold0;
      return c;
    });
  });

  // Chest lock escutcheon plate (16x16)
  const LOCK_TEX = pixelArt(
    [
      "gggggggggggggggg",
      "gYYYYYYYYYYYYYYg",
      "gYrrYYYYYYYYrrYg",
      "gYrRYYYYYYYYrRYg",
      "gYYYYYkYkYYYYYYg",
      "gYYYYkkkkkYYYYYg",
      "gYYYYkkkkkYYYYYg",
      "gYYYYYkkkYYYYYYg",
      "gYYYYYYkYYYYYYYg",
      "gYYYYYYkYYYYYYYg",
      "gYrRYYYkYYYYrRYg",
      "gYrrYYYYYYYYrrYg",
      "gYYYYYYYYYYYYYYg",
      "gggggggggggggggg",
      "................",
      "................",
    ],
    {
      g: P.gold0,
      Y: P.gold2,
      r: P.iron0,
      R: P.iron2,
      k: "#170f06",
    },
  );

  // Skull face pixel art (16x16)
  const SKULL_TEX = pixelArt(
    [
      "...bbbbbbbb.....",
      "..bwwwwwwwwb....",
      ".bwwwwwwwwwwb...",
      ".bwwwwwwwwwwb...",
      ".bwwkkwwwwkkb...",
      ".bwwkkwwwwkkb...",
      ".bwwkkwwwwkkb...",
      ".bwwwwkwwkwwb...",
      "..bwwwwkkwwb....",
      "...bwwwwwwb.....",
      "...bkwkwkwb.....",
      "...bwwwwwwb.....",
      "....bbbbbb......",
      "................",
      "................",
      "................",
    ],
    {
      b: P.bone0,
      w: P.bone3,
      k: "#100f14",
    },
  );

  // Pressure Plate Trap Rune (16x16)
  const RUNE_TEX = pixelArt(
    [
      "................",
      "....rrddrr......",
      "...rRRDDDRr.....",
      "..rRDkkkkDRr....",
      ".rRDk....kDRr...",
      ".rDk..rr..kDr...",
      ".rDk.rRDr.kDr...",
      ".rDk.rRDr.kDr...",
      ".rDk..rr..kDr...",
      ".rRDk....kDRr...",
      "..rRDkkkkDRr....",
      "...rRRDDDRr.....",
      "....rrddrr......",
      "................",
      "................",
      "................",
    ],
    {
      r: P.blood,
      R: P.ruby,
      D: P.rubyHi,
      d: P.bloodHi,
      k: P.stone1,
    },
  );

  // ---------------------------------------------------------------------------
  // 2. Root Skeleton Joint
  // ---------------------------------------------------------------------------

  const root = b.joint("root", { at: [0, 0, 0] });

  // ---------------------------------------------------------------------------
  // 3. Flagstone Base & Plinth
  // ---------------------------------------------------------------------------

  const FLOOR_Y = 0.12;
  const TEXEL = 0.02;

  // Solid dark plinth foundation on the ground y = 0
  b.part(tileBox([2.16, 0.1, 2.16], BRICK_TEX, TEXEL), P.stone0, {
    bone: root,
    at: [0, 0.05, 0],
    texture: BRICK_TEX,
  });

  // Raised stone perimeter curbstones
  b.part(new THREE.BoxGeometry(2.2, 0.04, 0.08), P.stone1, { bone: root, at: [0, FLOOR_Y + 0.02, -1.04] });
  b.part(new THREE.BoxGeometry(2.2, 0.04, 0.08), P.stone1, { bone: root, at: [0, FLOOR_Y + 0.02, 1.04] });
  b.part(new THREE.BoxGeometry(0.08, 0.04, 2.04), P.stone1, { bone: root, at: [-1.04, FLOOR_Y + 0.02, 0] });
  b.part(new THREE.BoxGeometry(0.08, 0.04, 2.04), P.stone1, { bone: root, at: [1.04, FLOOR_Y + 0.02, 0] });

  // Individual flagstone floor tiles with subtle stepped elevations
  const stoneTileGeo = new THREE.BoxGeometry(0.31, 0.02, 0.31);
  for (let ix = 0; ix < 6; ix++) {
    for (let iz = 0; iz < 6; iz++) {
      // Clear zone for spike trap pit (ix: 4..5, iz: 4..5)
      if (ix >= 4 && iz >= 4) continue;
      // Clear zone for rear-left stone pillar (ix <= 1 && iz <= 1)
      if (ix <= 1 && iz <= 1) continue;

      const tx = -0.85 + ix * 0.34;
      const tz = -0.85 + iz * 0.34;
      const hOffset = ((ix * 7 + iz * 13) % 5) * 0.0025;
      const col = (ix + iz) % 2 === 0 ? P.stone2 : P.stone3;

      b.part(stoneTileGeo, col, {
        bone: root,
        at: [tx, FLOOR_Y + 0.01 + hOffset, tz],
        texture: STONE_TILE_TEX,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Dungeon Masonry Wall & Pillar (Back-Left)
  // ---------------------------------------------------------------------------

  const PIL_X = -0.72;
  const PIL_Z = -0.72;

  // Stepped stone pillar pedestal
  b.part(tileBox([0.56, 0.08, 0.56], BRICK_TEX, TEXEL), P.stone1, {
    bone: root,
    at: [PIL_X, FLOOR_Y + 0.04, PIL_Z],
    texture: BRICK_TEX,
  });
  b.part(tileBox([0.48, 0.06, 0.48], BRICK_TEX, TEXEL), P.stone2, {
    bone: root,
    at: [PIL_X, FLOOR_Y + 0.11, PIL_Z],
    texture: BRICK_TEX,
  });

  // Main Pillar Shaft (Uses tileBox so bricks remain square, no vertical distortion!)
  b.part(tileBox([0.42, 1.4, 0.42], BRICK_TEX, TEXEL), P.stone2, {
    bone: root,
    at: [PIL_X, FLOOR_Y + 0.14 + 0.7, PIL_Z],
    texture: BRICK_TEX,
  });

  // Pillar Capital Molding
  b.part(tileBox([0.48, 0.06, 0.48], BRICK_TEX, TEXEL), P.stone3, {
    bone: root,
    at: [PIL_X, FLOOR_Y + 1.57, PIL_Z],
    texture: BRICK_TEX,
  });
  b.part(tileBox([0.54, 0.08, 0.54], BRICK_TEX, TEXEL), P.stone1, {
    bone: root,
    at: [PIL_X, FLOOR_Y + 1.64, PIL_Z],
    texture: BRICK_TEX,
  });

  // Low Dungeon Wall extending right along the backdrop
  b.part(tileBox([0.72, 1.15, 0.22], BRICK_TEX, TEXEL), P.stone2, {
    bone: root,
    at: [PIL_X + 0.57, FLOOR_Y + 0.575, PIL_Z - 0.08],
    texture: BRICK_TEX,
  });
  // Wall stone coping slabs
  b.part(new THREE.BoxGeometry(0.76, 0.06, 0.26), P.stone3, {
    bone: root,
    at: [PIL_X + 0.57, FLOOR_Y + 1.18, PIL_Z - 0.08],
    texture: STONE_TILE_TEX,
  });

  // Dungeon Wall Shackle & Hanging Chains
  const SHACKLE_X = PIL_X + 0.5;
  const SHACKLE_Y = FLOOR_Y + 0.85;
  const SHACKLE_Z = PIL_Z + 0.035;

  b.part(new THREE.BoxGeometry(0.08, 0.08, 0.02), P.iron0, {
    bone: root,
    at: [SHACKLE_X, SHACKLE_Y, SHACKLE_Z],
    texture: IRON_TEX,
  });
  b.part(new THREE.TorusGeometry(0.035, 0.008, 6, 8), P.iron1, {
    bone: root,
    at: [SHACKLE_X, SHACKLE_Y - 0.02, SHACKLE_Z + 0.02],
    rotation: [0, 0, 0],
  });
  // Dangling iron chain links
  for (let cl = 0; cl < 4; cl++) {
    b.part(new THREE.BoxGeometry(0.02, 0.04, 0.012), P.iron2, {
      bone: root,
      at: [SHACKLE_X, SHACKLE_Y - 0.07 - cl * 0.035, SHACKLE_Z + 0.02],
      rotation: [0, cl % 2 === 0 ? 0 : 90, 0],
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Wall Sconce Torch & 3-Way Volumetric Flame
  // ---------------------------------------------------------------------------

  const SCONCE_Y = FLOOR_Y + 1.05;
  const SCONCE_Z = PIL_Z + 0.21;

  // Iron Wall Backplate
  b.part(new THREE.BoxGeometry(0.08, 0.16, 0.02), P.iron0, {
    bone: root,
    at: [PIL_X, SCONCE_Y, SCONCE_Z + 0.01],
    texture: IRON_TEX,
  });

  // Forged angled bracket arm
  b.part(new THREE.BoxGeometry(0.024, 0.024, 0.15), P.iron1, {
    bone: root,
    at: [PIL_X, SCONCE_Y + 0.035, SCONCE_Z + 0.08],
    rotation: [28, 0, 0],
  });

  // Iron torch holder cup
  b.part(new THREE.CylinderGeometry(0.045, 0.03, 0.06, 8), P.iron2, {
    bone: root,
    at: [PIL_X, SCONCE_Y + 0.09, SCONCE_Z + 0.15],
  });

  // Wooden torch handle
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.24, 6), P.wood1, {
    bone: root,
    at: [PIL_X, SCONCE_Y + 0.15, SCONCE_Z + 0.15],
    rotation: [12, 0, 0],
  });

  // Pitch-wrapped torch head
  b.part(new THREE.BoxGeometry(0.055, 0.08, 0.055), P.wood0, {
    bone: root,
    at: [PIL_X, SCONCE_Y + 0.25, SCONCE_Z + 0.16],
  });

  // Volumetric 3-Plane Torch Fire Function
  const makeFlameCards = (
    pos: [number, number, number],
    width: number,
    height: number,
    glowIntensity = 2.4,
  ) => {
    const geo = new THREE.PlaneGeometry(width, height);
    const angles = [0, 60, 120];
    for (const ang of angles) {
      const flm = b.part(geo, P.fire2, {
        bone: root,
        at: pos,
        rotation: [0, ang, 0],
        texture: FLAME_TEX,
      });
      glow(flm, glowIntensity);
    }
    // Glowing inner core box
    const core = b.part(new THREE.BoxGeometry(width * 0.35, height * 0.5, width * 0.35), P.fire3, {
      bone: root,
      at: [pos[0], pos[1] - height * 0.1, pos[2]],
    });
    glow(core, glowIntensity * 1.3);
  };

  makeFlameCards([PIL_X, SCONCE_Y + 0.4, SCONCE_Z + 0.16], 0.22, 0.34, 2.5);

  // Sparks/embers drifting up
  const ember1 = b.part(new THREE.BoxGeometry(0.016, 0.016, 0.016), P.fire3, {
    bone: root,
    at: [PIL_X + 0.02, SCONCE_Y + 0.58, SCONCE_Z + 0.14],
  });
  const ember2 = b.part(new THREE.BoxGeometry(0.014, 0.014, 0.014), P.fire2, {
    bone: root,
    at: [PIL_X - 0.03, SCONCE_Y + 0.65, SCONCE_Z + 0.18],
  });
  glow(ember1, 3.2);
  glow(ember2, 3.2);

  // ---------------------------------------------------------------------------
  // 6. Standing Dungeon Brazier (Mid-Left, framed cleanly)
  // ---------------------------------------------------------------------------

  const BRZ_X = -0.72;
  const BRZ_Z = 0.16;

  // Tripod Iron Base Stand
  b.part(new THREE.CylinderGeometry(0.18, 0.22, 0.05, 8), P.iron0, {
    bone: root,
    at: [BRZ_X, FLOOR_Y + 0.025, BRZ_Z],
    texture: IRON_TEX,
  });
  // 3 Curved forged footing legs
  for (let li = 0; li < 3; li++) {
    const la = (li * 120 * Math.PI) / 180;
    b.part(new THREE.BoxGeometry(0.04, 0.05, 0.14), P.iron1, {
      bone: root,
      at: [BRZ_X + Math.sin(la) * 0.18, FLOOR_Y + 0.025, BRZ_Z + Math.cos(la) * 0.18],
      rotation: [0, (li * 120), 0],
    });
  }

  // Central forged shaft with decorative knop rings
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 8), P.iron2, {
    bone: root,
    at: [BRZ_X, FLOOR_Y + 0.26, BRZ_Z],
  });
  b.part(new THREE.BoxGeometry(0.08, 0.035, 0.08), P.ironHi, {
    bone: root,
    at: [BRZ_X, FLOOR_Y + 0.18, BRZ_Z],
  });
  b.part(new THREE.BoxGeometry(0.08, 0.035, 0.08), P.ironHi, {
    bone: root,
    at: [BRZ_X, FLOOR_Y + 0.36, BRZ_Z],
  });

  // Flared Octagonal Brazier Bowl
  b.part(new THREE.CylinderGeometry(0.25, 0.12, 0.14, 8), P.iron1, {
    bone: root,
    at: [BRZ_X, FLOOR_Y + 0.54, BRZ_Z],
  });
  // Upper reinforced rim hoop
  b.part(new THREE.CylinderGeometry(0.26, 0.25, 0.03, 8), P.ironHi, {
    bone: root,
    at: [BRZ_X, FLOOR_Y + 0.625, BRZ_Z],
  });

  // Glowing Hot Charcoal Bed
  const brazierCoals = b.part(new THREE.CylinderGeometry(0.22, 0.12, 0.04, 8), P.fire1, {
    bone: root,
    at: [BRZ_X, FLOOR_Y + 0.59, BRZ_Z],
  });
  glow(brazierCoals, 1.8);

  // Brazier Volumetric 3-Plane Flame
  makeFlameCards([BRZ_X, FLOOR_Y + 0.77, BRZ_Z], 0.32, 0.42, 2.6);

  // ---------------------------------------------------------------------------
  // 7. The Treasure Chest (Hero Prop, Center)
  // ---------------------------------------------------------------------------

  const CH_X = -0.15;
  const CH_Z = -0.18;
  const CH_ROT = 16;
  const chRad = (CH_ROT * Math.PI) / 180;
  const cosC = Math.cos(chRad);
  const sinC = Math.sin(chRad);

  const chestPos = (lx: number, ly: number, lz: number): [number, number, number] => [
    CH_X + lx * cosC + lz * sinC,
    FLOOR_Y + ly,
    CH_Z - lx * sinC + lz * cosC,
  ];

  // Chest Base Box: Width 0.62m, Height 0.25m, Depth 0.40m
  b.part(tileBox([0.62, 0.25, 0.4], WOOD_TEX, TEXEL), P.wood2, {
    bone: root,
    at: chestPos(0, 0.125, 0),
    rotation: [0, CH_ROT, 0],
    texture: WOOD_TEX,
  });

  // Base Iron Trim Fittings
  // Bottom and Top Perimeter Iron Bands
  b.part(new THREE.BoxGeometry(0.63, 0.035, 0.41), P.iron0, {
    bone: root,
    at: chestPos(0, 0.018, 0),
    rotation: [0, CH_ROT, 0],
    texture: IRON_TEX,
  });
  b.part(new THREE.BoxGeometry(0.63, 0.035, 0.41), P.iron0, {
    bone: root,
    at: chestPos(0, 0.235, 0),
    rotation: [0, CH_ROT, 0],
    texture: IRON_TEX,
  });

  // 4 Iron Corner Brackets
  const cornerBktGeo = new THREE.BoxGeometry(0.04, 0.25, 0.04);
  for (const sx of [-0.295, 0.295]) {
    for (const sz of [-0.185, 0.185]) {
      b.part(cornerBktGeo, P.iron1, {
        bone: root,
        at: chestPos(sx, 0.125, sz),
        rotation: [0, CH_ROT, 0],
        texture: IRON_TEX,
      });
    }
  }

  // 2 Vertical Iron Reinforcing Straps
  for (const sx of [-0.15, 0.15]) {
    b.part(new THREE.BoxGeometry(0.035, 0.252, 0.41), P.iron1, {
      bone: root,
      at: chestPos(sx, 0.125, 0),
      rotation: [0, CH_ROT, 0],
      texture: IRON_TEX,
    });
  }

  // Chest Base Front Lock Catch
  b.part(new THREE.BoxGeometry(0.08, 0.08, 0.02), P.ironHi, {
    bone: root,
    at: chestPos(0, 0.2, 0.21),
    rotation: [0, CH_ROT, 0],
    texture: LOCK_TEX,
  });

  // Inside Treasure Mound
  const treasureBed = b.part(new THREE.BoxGeometry(0.54, 0.15, 0.32), P.gold2, {
    bone: root,
    at: chestPos(0, 0.165, 0),
    rotation: [0, CH_ROT, 0],
    texture: TREASURE_TEX,
  });
  glow(treasureBed, 1.2);

  // Overflows & Mounds
  const goldMoundL = b.part(new THREE.BoxGeometry(0.2, 0.09, 0.16), P.gold3, {
    bone: root,
    at: chestPos(-0.12, 0.245, 0.03),
    rotation: [0, CH_ROT + 15, 0],
    texture: TREASURE_TEX,
  });
  const goldMoundR = b.part(new THREE.BoxGeometry(0.18, 0.08, 0.14), P.gold2, {
    bone: root,
    at: chestPos(0.14, 0.24, -0.04),
    rotation: [0, CH_ROT - 20, 0],
    texture: TREASURE_TEX,
  });
  glow(goldMoundL, 1.4);
  glow(goldMoundR, 1.4);

  // Gold Chalice resting inside
  const chaliceBase = chestPos(-0.16, 0.24, -0.06);
  b.part(new THREE.CylinderGeometry(0.035, 0.045, 0.025, 8), P.gold3, {
    bone: root,
    at: chaliceBase,
  });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.07, 6), P.gold2, {
    bone: root,
    at: [chaliceBase[0], chaliceBase[1] + 0.045, chaliceBase[2]],
  });
  const chaliceCup = b.part(new THREE.CylinderGeometry(0.045, 0.02, 0.07, 8), P.gold3, {
    bone: root,
    at: [chaliceBase[0], chaliceBase[1] + 0.09, chaliceBase[2]],
  });
  glow(chaliceCup, 1.6);

  // Jeweled King's Crown resting atop the gold pile
  const crownBase = chestPos(0.12, 0.28, 0.03);
  const crown = b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.045, 8, 1, true), P.gold3, {
    bone: root,
    at: crownBase,
    rotation: [15, CH_ROT, 0],
  });
  glow(crown, 1.5);
  // Crown jewel spikes
  for (let ci = 0; ci < 8; ci++) {
    const ca = (ci * 45 * Math.PI) / 180;
    const col = ci % 2 === 0 ? P.rubyHi : P.cyanHi;
    const jw = b.part(new THREE.ConeGeometry(0.012, 0.03, 4), col, {
      bone: root,
      at: [crownBase[0] + Math.sin(ca) * 0.062, crownBase[1] + 0.035, crownBase[2] + Math.cos(ca) * 0.062],
      rotation: [15, 0, 0],
    });
    glow(jw, 2.2);
  }

  // Sparkling Loose Cut Gemstones
  const ruby1 = b.part(new THREE.OctahedronGeometry(0.032), P.rubyHi, {
    bone: root,
    at: chestPos(0.05, 0.27, 0.08),
  });
  const cyan1 = b.part(new THREE.OctahedronGeometry(0.028), P.cyanHi, {
    bone: root,
    at: chestPos(-0.04, 0.26, -0.05),
  });
  const emerald1 = b.part(new THREE.OctahedronGeometry(0.026), P.emeraldHi, {
    bone: root,
    at: chestPos(0.02, 0.26, -0.08),
  });
  glow(ruby1, 2.5);
  glow(cyan1, 2.5);
  glow(emerald1, 2.5);

  // Coins spilling down over front rim onto the flagstones
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), P.gold3, {
    bone: root,
    at: chestPos(0.04, 0.25, 0.19),
    rotation: [20, CH_ROT, 0],
  });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6), P.gold2, {
    bone: root,
    at: chestPos(0.08, 0.12, 0.23),
    rotation: [45, CH_ROT, 0],
  });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.015, 8), P.gold3, {
    bone: root,
    at: chestPos(0.12, 0.01, 0.32),
  });

  // Chest Hinges & Arched Open Lid (Rigged Joint)
  const HINGE_Y = 0.25;
  const HINGE_Z = -0.2;
  const hingePoint = chestPos(0, HINGE_Y, HINGE_Z);
  const hingeDir: [number, number, number] = [cosC, 0, -sinC];

  const chestLidJoint = b.joint("chestLid", {
    parent: root,
    at: hingePoint,
    dir: hingeDir,
    role: "hinge",
  });

  // Iron Hinge Brackets on rear
  for (const sx of [-0.18, 0.18]) {
    b.part(new THREE.BoxGeometry(0.04, 0.08, 0.02), P.iron0, {
      bone: root,
      at: chestPos(sx, HINGE_Y - 0.02, HINGE_Z - 0.005),
      rotation: [0, CH_ROT, 0],
      texture: IRON_TEX,
    });
  }

  // Open Lid Orientation (~-40 degrees open)
  const LID_PITCH = -42;
  const lidQuat = new THREE.Quaternion()
    .setFromAxisAngle(new THREE.Vector3(0, 1, 0), chRad)
    .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), (LID_PITCH * Math.PI) / 180));

  const lidPos = (lx: number, ly: number, lz: number): [number, number, number] => {
    const v = new THREE.Vector3(lx, ly, lz).applyQuaternion(lidQuat);
    return [hingePoint[0] + v.x, hingePoint[1] + v.y, hingePoint[2] + v.z];
  };

  // Lid Frame: Arch roof constructed from 3 angled faceted planks
  // Central flat top
  b.part(new THREE.BoxGeometry(0.62, 0.035, 0.24), P.wood3, {
    bone: chestLidJoint,
    at: lidPos(0, 0.17, 0.2),
    quat: lidQuat,
    texture: WOOD_TEX,
  });
  // Front slope
  b.part(new THREE.BoxGeometry(0.62, 0.035, 0.16), P.wood2, {
    bone: chestLidJoint,
    at: lidPos(0, 0.11, 0.34),
    quat: lidQuat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.52)),
    texture: WOOD_TEX,
  });
  // Back slope
  b.part(new THREE.BoxGeometry(0.62, 0.035, 0.16), P.wood2, {
    bone: chestLidJoint,
    at: lidPos(0, 0.11, 0.06),
    quat: lidQuat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.52)),
    texture: WOOD_TEX,
  });

  // Solid wooden gable ends (left and right arches)
  for (const sx of [-0.3, 0.3]) {
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.025, 8, 1, false, 0, Math.PI), P.wood1, {
      bone: chestLidJoint,
      at: lidPos(sx, 0.05, 0.2),
      quat: lidQuat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)),
    });
  }

  // Iron straps over the open arched lid
  for (const sx of [-0.295, -0.15, 0.15, 0.295]) {
    b.part(new THREE.BoxGeometry(0.035, 0.045, 0.25), P.iron1, {
      bone: chestLidJoint,
      at: lidPos(sx, 0.175, 0.2),
      quat: lidQuat,
      texture: IRON_TEX,
    });
    b.part(new THREE.BoxGeometry(0.035, 0.045, 0.17), P.iron1, {
      bone: chestLidJoint,
      at: lidPos(sx, 0.115, 0.34),
      quat: lidQuat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.52)),
      texture: IRON_TEX,
    });
  }

  // Golden Hasps & Lock Plate on Lid Lip
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.025), P.gold2, {
    bone: chestLidJoint,
    at: lidPos(0, 0.035, 0.41),
    quat: lidQuat,
    texture: LOCK_TEX,
  });

  // ---------------------------------------------------------------------------
  // 8. Dungeon Oak Barrels (Back-Right)
  // ---------------------------------------------------------------------------

  // Helper to build a completely seamless pixel-art oak barrel with staves & iron bands
  const makeBarrel = (
    center: [number, number, number],
    quat: THREE.Quaternion = new THREE.Quaternion(),
    options: { broken?: boolean; slime?: boolean } = {},
  ) => {
    const toWorld = (lx: number, ly: number, lz: number): [number, number, number] => {
      const v = new THREE.Vector3(lx, ly, lz).applyQuaternion(quat);
      return [center[0] + v.x, center[1] + v.y, center[2] + v.z];
    };

    // Stave barrel body: 3 bulged cylinder sections along local Y
    // Bottom taper
    b.part(new THREE.CylinderGeometry(0.2, 0.17, 0.18, 10), P.wood2, {
      bone: root,
      at: toWorld(0, -0.18, 0),
      quat,
      texture: WOOD_TEX,
    });
    // Center belly bulge
    b.part(new THREE.CylinderGeometry(0.22, 0.2, 0.18, 10), P.wood3, {
      bone: root,
      at: toWorld(0, 0, 0),
      quat,
      texture: WOOD_TEX,
    });
    // Top taper (or broken if specified)
    if (!options.broken) {
      b.part(new THREE.CylinderGeometry(0.17, 0.22, 0.18, 10), P.wood2, {
        bone: root,
        at: toWorld(0, 0.18, 0),
        quat,
        texture: WOOD_TEX,
      });
      // Flat recessed top lid
      b.part(new THREE.CylinderGeometry(0.165, 0.165, 0.025, 10), P.wood1, {
        bone: root,
        at: toWorld(0, 0.26, 0),
        quat,
      });
      // Wooden bunghole cork
      b.part(new THREE.CylinderGeometry(0.02, 0.016, 0.03, 6), P.woodHi, {
        bone: root,
        at: toWorld(0.06, 0.275, 0.04),
        quat,
      });
    } else {
      // Broken open stave mouth showing inside contents
      b.part(new THREE.CylinderGeometry(0.17, 0.22, 0.18, 10, 1, true, 0, Math.PI * 1.5), P.wood2, {
        bone: root,
        at: toWorld(0, 0.18, 0),
        quat,
        texture: WOOD_TEX,
      });
      if (options.slime) {
        const slimeInterior = b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8), P.slime2, {
          bone: root,
          at: toWorld(0, 0.16, 0),
          quat,
        });
        glow(slimeInterior, 1.4);
      }
    }

    // 4 Wrought Iron Hoops
    b.part(new THREE.CylinderGeometry(0.178, 0.178, 0.03, 10), P.iron1, {
      bone: root,
      at: toWorld(0, -0.24, 0),
      quat,
      texture: IRON_TEX,
    });
    b.part(new THREE.CylinderGeometry(0.215, 0.215, 0.03, 10), P.iron0, {
      bone: root,
      at: toWorld(0, -0.08, 0),
      quat,
      texture: IRON_TEX,
    });
    b.part(new THREE.CylinderGeometry(0.215, 0.215, 0.03, 10), P.iron0, {
      bone: root,
      at: toWorld(0, 0.08, 0),
      quat,
      texture: IRON_TEX,
    });
    b.part(new THREE.CylinderGeometry(0.178, 0.178, 0.03, 10), P.iron1, {
      bone: root,
      at: toWorld(0, 0.24, 0),
      quat,
      texture: IRON_TEX,
    });
  };

  // Barrel 1: Sturdy Upright Oak Barrel
  const BAR1_X = 0.66;
  const BAR1_Z = -0.52;
  makeBarrel([BAR1_X, FLOOR_Y + 0.27, BAR1_Z], new THREE.Quaternion());

  // Barrel 2: Overturned, Resting cleanly on its side on the stones
  // Diameter is ~0.44m, so when lying on side (rotated 90 deg), center axis is at y = FLOOR_Y + 0.22m
  const BAR2_X = 0.62;
  const BAR2_Z = -0.02;
  const bar2Quat = new THREE.Quaternion()
    .setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.45)
    .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2));

  makeBarrel([BAR2_X, FLOOR_Y + 0.22, BAR2_Z], bar2Quat, { broken: true, slime: true });

  // Potion / Slime Spill Puddles spreading from Barrel 2 mouth
  const puddle1 = b.part(new THREE.CylinderGeometry(0.16, 0.19, 0.012, 8), P.slime1, {
    bone: root,
    at: [BAR2_X - 0.16, FLOOR_Y + 0.015, BAR2_Z + 0.18],
  });
  const puddle2 = b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.012, 7), P.slime2, {
    bone: root,
    at: [BAR2_X - 0.06, FLOOR_Y + 0.016, BAR2_Z + 0.32],
  });
  const puddleDrip = b.part(new THREE.SphereGeometry(0.03, 6, 4), P.slimeHi, {
    bone: root,
    at: [BAR2_X - 0.12, FLOOR_Y + 0.02, BAR2_Z + 0.42],
  });
  glow(puddle1, 1.2);
  glow(puddle2, 1.5);
  glow(puddleDrip, 2.0);

  // Dropped glass potion bottle with red healing elixir
  b.part(new THREE.CylinderGeometry(0.024, 0.03, 0.065, 6), P.rubyHi, {
    bone: root,
    at: [BAR1_X - 0.25, FLOOR_Y + 0.035, BAR1_Z + 0.14],
    rotation: [70, 20, 0],
  });
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.02, 6), P.woodHi, {
    bone: root,
    at: [BAR1_X - 0.23, FLOOR_Y + 0.05, BAR1_Z + 0.18],
    rotation: [70, 20, 0],
  });

  // ---------------------------------------------------------------------------
  // 9. Deadly Spike Trap (Front-Right)
  // ---------------------------------------------------------------------------

  const TRAP_X = 0.52;
  const TRAP_Z = 0.52;
  const PIT_SIZE = 0.62;

  // Recessed Dark Pit Basin
  b.part(new THREE.BoxGeometry(PIT_SIZE, 0.05, PIT_SIZE), P.stone0, {
    bone: root,
    at: [TRAP_X, FLOOR_Y - 0.015, TRAP_Z],
  });

  // Heavy Riveted Iron Grate Perimeter Frame
  const frameBarX = new THREE.BoxGeometry(PIT_SIZE + 0.04, 0.035, 0.04);
  const frameBarZ = new THREE.BoxGeometry(0.04, 0.035, PIT_SIZE + 0.04);
  b.part(frameBarX, P.iron1, { bone: root, at: [TRAP_X, FLOOR_Y + 0.018, TRAP_Z - PIT_SIZE / 2], texture: IRON_TEX });
  b.part(frameBarX, P.iron1, { bone: root, at: [TRAP_X, FLOOR_Y + 0.018, TRAP_Z + PIT_SIZE / 2], texture: IRON_TEX });
  b.part(frameBarZ, P.iron1, { bone: root, at: [TRAP_X - PIT_SIZE / 2, FLOOR_Y + 0.018, TRAP_Z], texture: IRON_TEX });
  b.part(frameBarZ, P.iron1, { bone: root, at: [TRAP_X + PIT_SIZE / 2, FLOOR_Y + 0.018, TRAP_Z], texture: IRON_TEX });

  // Iron Crossbeams in pit bottom
  for (const bo of [-0.18, 0, 0.18]) {
    b.part(new THREE.BoxGeometry(PIT_SIZE, 0.02, 0.025), P.iron0, {
      bone: root,
      at: [TRAP_X, FLOOR_Y + 0.005, TRAP_Z + bo],
    });
    b.part(new THREE.BoxGeometry(0.025, 0.02, PIT_SIZE), P.iron0, {
      bone: root,
      at: [TRAP_X + bo, FLOOR_Y + 0.005, TRAP_Z],
    });
  }

  // 4x4 Grid of Vicious 4-Sided Pyramid Spikes (16 Spikes)
  const spikeConeGeo = new THREE.ConeGeometry(0.035, 0.22, 4);
  const bloodTipGeo = new THREE.ConeGeometry(0.02, 0.1, 4);

  for (let sx = 0; sx < 4; sx++) {
    for (let sz = 0; sz < 4; sz++) {
      const spx = TRAP_X - 0.225 + sx * 0.15;
      const spz = TRAP_Z - 0.225 + sz * 0.15;
      const spikeH = 0.2 + ((sx * 5 + sz * 11) % 4) * 0.015;

      // Iron spike body
      b.part(spikeConeGeo, P.iron2, {
        bone: root,
        at: [spx, FLOOR_Y + spikeH / 2, spz],
        rotation: [0, 45, 0],
      });
      // Blood-soaked gory tip
      b.part(bloodTipGeo, P.blood, {
        bone: root,
        at: [spx, FLOOR_Y + spikeH - 0.04, spz],
        rotation: [0, 45, 0],
      });
    }
  }

  // Pressure Plate Mechanism (In front of the chest path)
  const PLATE_X = -0.02;
  const PLATE_Z = 0.58;

  // Recessed Outer Stone Frame
  b.part(new THREE.BoxGeometry(0.34, 0.015, 0.34), P.stone1, {
    bone: root,
    at: [PLATE_X, FLOOR_Y + 0.008, PLATE_Z],
  });
  // Beveled Raised Pressure Slab
  b.part(new THREE.BoxGeometry(0.26, 0.025, 0.26), P.stone3, {
    bone: root,
    at: [PLATE_X, FLOOR_Y + 0.022, PLATE_Z],
    texture: STONE_TILE_TEX,
  });
  // Inlaid Warning Arcane Rune with ominous glow
  const runePlate = b.part(new THREE.PlaneGeometry(0.18, 0.18), P.rubyHi, {
    bone: root,
    at: [PLATE_X, FLOOR_Y + 0.036, PLATE_Z],
    rotation: [-90, 0, 0],
    texture: RUNE_TEX,
  });
  glow(runePlate, 1.8);

  // ---------------------------------------------------------------------------
  // 10. Skeleton Remains, Rusted Sword & Dungeon Key
  // ---------------------------------------------------------------------------

  const SK_X = -0.06;
  const SK_Z = 0.24;

  // 3D Voxel Pixel Skull (Modeled with cranium, recessed eye sockets, teeth & jaw)
  // Cranial Vault
  b.part(new THREE.BoxGeometry(0.13, 0.11, 0.13), P.bone3, {
    bone: root,
    at: [SK_X, FLOOR_Y + 0.075, SK_Z],
    rotation: [-10, 25, -6],
  });
  // Textured Skull Face
  b.part(new THREE.PlaneGeometry(0.13, 0.13), P.bone3, {
    bone: root,
    at: [SK_X + 0.028, FLOOR_Y + 0.075, SK_Z + 0.067],
    rotation: [-10, 25, -6],
    texture: SKULL_TEX,
  });
  // Detached Mandible (Lower Jaw)
  b.part(new THREE.BoxGeometry(0.08, 0.03, 0.06), P.bone2, {
    bone: root,
    at: [SK_X + 0.025, FLOOR_Y + 0.018, SK_Z + 0.075],
    rotation: [0, 32, 0],
  });

  // Ribcage (Voxel arch formed by vertebrae column and curved ribs)
  const spineGeo = new THREE.BoxGeometry(0.03, 0.03, 0.2);
  b.part(spineGeo, P.bone2, {
    bone: root,
    at: [SK_X + 0.14, FLOOR_Y + 0.03, SK_Z - 0.04],
    rotation: [12, -30, 0],
  });
  for (let ri = 0; ri < 3; ri++) {
    b.part(new THREE.TorusGeometry(0.065, 0.01, 4, 8, Math.PI * 0.75), P.bone3, {
      bone: root,
      at: [SK_X + 0.11 + ri * 0.04, FLOOR_Y + 0.03, SK_Z - 0.09 + ri * 0.05],
      rotation: [75, 20 + ri * 10, 0],
    });
  }

  // Longbones / Femurs with condyle knobs
  const buildBone = (at: [number, number, number], rot: [number, number, number]) => {
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.26, 6), P.bone3, {
      bone: root,
      at,
      rotation: rot,
    });
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler((rot[0] * Math.PI) / 180, (rot[1] * Math.PI) / 180, (rot[2] * Math.PI) / 180),
    );
    const endOff = new THREE.Vector3(0, 0.13, 0).applyQuaternion(q);
    b.part(new THREE.SphereGeometry(0.02, 6, 4), P.bone2, {
      bone: root,
      at: [at[0] + endOff.x, at[1] + endOff.y, at[2] + endOff.z],
    });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), P.bone2, {
      bone: root,
      at: [at[0] - endOff.x, at[1] - endOff.y, at[2] - endOff.z],
    });
  };

  // Crossed longbones near the skull
  buildBone([SK_X - 0.12, FLOOR_Y + 0.02, SK_Z + 0.08], [88, 35, 0]);
  buildBone([SK_X - 0.1, FLOOR_Y + 0.028, SK_Z + 0.09], [86, -45, 0]);

  // Impaled bone stuck through the spike trap!
  buildBone([TRAP_X - 0.08, FLOOR_Y + 0.18, TRAP_Z + 0.08], [35, -40, 60]);

  // Dropped Knight's Rusted Broadsword
  const SW_X = SK_X - 0.28;
  const SW_Z = SK_Z + 0.08;
  const SW_ROT = 28;

  // Double-edged iron blade
  b.part(new THREE.BoxGeometry(0.045, 0.012, 0.44), P.iron2, {
    bone: root,
    at: [SW_X, FLOOR_Y + 0.008, SW_Z],
    rotation: [0, SW_ROT, 0],
  });
  // Blade central fuller groove
  b.part(new THREE.BoxGeometry(0.012, 0.013, 0.36), P.iron0, {
    bone: root,
    at: [SW_X, FLOOR_Y + 0.009, SW_Z],
    rotation: [0, SW_ROT, 0],
  });
  // Crossguard
  b.part(new THREE.BoxGeometry(0.14, 0.018, 0.025), P.iron1, {
    bone: root,
    at: [SW_X - 0.1 * Math.sin((SW_ROT * Math.PI) / 180), FLOOR_Y + 0.01, SW_Z - 0.1 * Math.cos((SW_ROT * Math.PI) / 180)],
    rotation: [0, SW_ROT, 0],
  });
  // Wrapped leather hilt
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.11, 6), P.wood0, {
    bone: root,
    at: [SW_X - 0.16 * Math.sin((SW_ROT * Math.PI) / 180), FLOOR_Y + 0.01, SW_Z - 0.16 * Math.cos((SW_ROT * Math.PI) / 180)],
    rotation: [0, 0, 90 + SW_ROT],
  });
  // Brass pommel ring
  b.part(new THREE.SphereGeometry(0.022, 6, 4), P.gold1, {
    bone: root,
    at: [SW_X - 0.22 * Math.sin((SW_ROT * Math.PI) / 180), FLOOR_Y + 0.01, SW_Z - 0.22 * Math.cos((SW_ROT * Math.PI) / 180)],
  });

  // Dropped Antique Iron Dungeon Key
  const KEY_X = SK_X + 0.06;
  const KEY_Z = SK_Z + 0.24;

  b.part(new THREE.TorusGeometry(0.028, 0.006, 6, 8), P.ironHi, {
    bone: root,
    at: [KEY_X, FLOOR_Y + 0.012, KEY_Z],
    rotation: [90, 0, 30],
  });
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.08, 6), P.iron2, {
    bone: root,
    at: [KEY_X + 0.048, FLOOR_Y + 0.012, KEY_Z + 0.028],
    rotation: [0, 0, 60],
  });
  b.part(new THREE.BoxGeometry(0.02, 0.014, 0.006), P.ironHi, {
    bone: root,
    at: [KEY_X + 0.076, FLOOR_Y + 0.012, KEY_Z + 0.044],
    rotation: [0, -30, 0],
  });

  return b.root;
}
