Here is the review of the model and the list of improvements to bring it to an astonishing result:

1. **Chest Anatomy & Hinge Gap**: The chest lid was floating 30mm above the base because the lid's local geometry wasn't rooted at the hinge pivot. Anchored the lid flush to the rear top rim, added structural wooden gable sidewalls, iron corner brackets, reinforcing bands, and hanging hasps.
2. **Treasure Hoard Density**: Replaced the flat gold box with an overflowing, stepped hoard of gold coins, faceted gold ingots, cut gemstones (ruby, sapphire, emerald), a jeweled royal crown, a golden chalice, and cascading spilled coins flowing down the front onto the flagstones.
3. **Pixel-Art Flames & Volumetric Cores**: Removed the solid glowing rectangular box inside the flames that was obscuring the pixel silhouette. Built multi-plane pixel flame cards with glowing inner tongues, floating embers, burning logs in the brazier, and torch soot on the stone wall above the sconce.
4. **Faceted Stave Barrels & Atmosphere**: Redesigned the barrels with 12-sided faceted staves, thick iron hoops with raised rivets, and a melted wax candle on top of the upright barrel. Turned the overturned barrel into a broken cask leaking glowing toxic alchemical slime with bubbles, alongside spilled potion vials.
5. **Adventurer Skeleton & Gear**: Expanded the minimal skull into a fallen adventurer: an iron-banded skull, articulated ribcage and spine, pelvis, reaching arm with skeletal fingers grasping for the treasure, cracked wooden buckler shield, rusted broadsword, and a dropped antique dungeon key.
6. **Deadly Spike Trap**: Added 16 bloodied iron pyramid spikes, dark pooled blood in the pit, an impaled bone, and an iron perimeter frame with corner bolts next to a carved arcane pressure plate.

Here is the complete updated module:

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { pixelArt, pixelTexture, PixelGrid, bayer, tileBox } from "agentic-3js-builder/kits/pixel";
import { glow } from "agentic-3js-builder/kits/glow";

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
    // Stone masonry & soot
    stone0: "#0d0c14",
    stone1: "#1a1824",
    stone2: "#282536",
    stone3: "#3c384e",
    stone4: "#56526e",
    stoneHi: "#7e799c",
    soot: "#08070b",
    moss: "#26361a",
    mossHi: "#44612e",
    // Aged Oak Wood & Leather
    wood0: "#140a05",
    wood1: "#261309",
    wood2: "#3d1f0e",
    wood3: "#5e3218",
    wood4: "#854924",
    woodHi: "#ab6233",
    leather: "#381a0c",
    // Wrought Iron & Steel
    iron0: "#0b0c10",
    iron1: "#171820",
    iron2: "#272a36",
    iron3: "#3e4354",
    ironHi: "#666e85",
    ironShine: "#9ca6bf",
    // Treasure Gold & Cut Gems
    gold0: "#472b05",
    gold1: "#7a4e09",
    gold2: "#ba7f13",
    gold3: "#f5b72a",
    goldHi: "#ffea78",
    ruby: "#a80a26",
    rubyHi: "#ff335a",
    cyan: "#0b95a6",
    cyanHi: "#47eaff",
    emerald: "#0f803c",
    emeraldHi: "#3deb7c",
    // Bone & Blood
    bone0: "#29241b",
    bone1: "#473f2f",
    bone2: "#736852",
    bone3: "#a89b7d",
    boneHi: "#cfc4a7",
    blood: "#47050d",
    bloodHi: "#800e1c",
    // Alchemical Slime & Glass
    slime0: "#0f380a",
    slime1: "#1f6e14",
    slime2: "#3db827",
    slimeHi: "#6eff54",
    wax: "#e8ddb5",
    // Fire & Embers
    fire0: "#5c0808",
    fire1: "#b82607",
    fire2: "#ff6c0a",
    fire3: "#ffc81f",
    fireWhite: "#ffffff",
  };

  // Flagstone tile texture (32x32) with mortar cracks and moss
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
          if ((x <= 1 || y <= 1) && (rx * 7 + ry * 13 + x + y) % 7 === 0) c = P.moss;
          if ((x === 0 || y === 0) && (rx * 3 + ry * 5 + x + y) % 11 === 0) c = P.mossHi;
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
          if ((bx + by + x + y) % 17 === 0) c = P.moss;
          g.set(bx + x, by + y, c);
        }
      }
    };
    drawBrick(1, 1, 14, 6);
    drawBrick(17, 1, 14, 6);
    drawBrick(1, 9, 7, 6);
    drawBrick(10, 9, 14, 6);
    drawBrick(26, 9, 5, 6);
    drawBrick(1, 17, 14, 6);
    drawBrick(17, 17, 14, 6);
    drawBrick(1, 25, 10, 6);
    drawBrick(13, 25, 14, 6);
    drawBrick(29, 25, 2, 6);
  });

  // Wood planks texture (32x32)
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

  // Blazing Torch Flame (16x24) with pixelated licking tongues
  const FLAME_TEX = pixelArt(
    [
      ".......yy.......",
      "......ywwy......",
      ".....ywwwwy.....",
      "....ywwwwwwy....",
      "...ywwffffwwy...",
      "...ywffffffwy...",
      "..ywfoooooofwy..",
      "..ywfoorrrrooffy",
      ".ywfooorrrroofwy",
      ".ywfoorrrrrooffy",
      ".ywforrdddrrooff",
      ".ywforrdddrrooff",
      "..wforrdddrroof.",
      "..wffrrdddrroof.",
      "...fforrdrooff..",
      "...ffoorrroo....",
      "....forrrroo....",
      "....oorrrroo....",
      ".....orrrro.....",
      "......rrrrd.....",
      "......rrrdd.....",
      ".......rdd......",
      "........dd......",
      "................",
    ],
    {
      w: P.fireWhite,
      y: P.fire3,
      f: P.fire2,
      o: P.fire1,
      r: P.fire0,
      d: "#330505",
    },
  );

  // Treasure gold & gems texture (32x32)
  const TREASURE_TEX = pixelTexture(32, 32, (g: PixelGrid) => {
    g.fill((x, y) => {
      const b = bayer(x, y);
      let c = b > 0.65 ? P.gold3 : b > 0.35 ? P.gold2 : P.gold1;
      const gem1 = (x - 6) ** 2 + (y - 8) ** 2 < 9;
      if (gem1) return (x + y) % 2 === 0 ? P.rubyHi : P.ruby;
      const gem2 = (x - 22) ** 2 + (y - 12) ** 2 < 8;
      if (gem2) return (x + y) % 2 === 0 ? P.cyanHi : P.cyan;
      const gem3 = (x - 14) ** 2 + (y - 24) ** 2 < 9;
      if (gem3) return (x + y) % 2 === 0 ? P.emeraldHi : P.emerald;
      if ((x * 7 + y * 13) % 19 === 0) c = P.goldHi;
      if ((x * 11 + y * 17) % 23 === 0) c = P.gold0;
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
      k: "#150d04",
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
      k: "#0c0b10",
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

  // Foundation Plinth sitting right on y = 0
  b.part(tileBox([2.16, 0.1, 2.16], BRICK_TEX, TEXEL), P.stone0, {
    bone: root,
    at: [0, 0.05, 0],
    texture: BRICK_TEX,
  });

  // Perimeter Curbstones
  b.part(new THREE.BoxGeometry(2.2, 0.04, 0.08), P.stone1, { bone: root, at: [0, FLOOR_Y + 0.02, -1.04] });
  b.part(new THREE.BoxGeometry(2.2, 0.04, 0.08), P.stone1, { bone: root, at: [0, FLOOR_Y + 0.02, 1.04] });
  b.part(new THREE.BoxGeometry(0.08, 0.04, 2.04), P.stone1, { bone: root, at: [-1.04, FLOOR_Y + 0.02, 0] });
  b.part(new THREE.BoxGeometry(0.08, 0.04, 2.04), P.stone1, { bone: root, at: [1.04, FLOOR_Y + 0.02, 0] });

  // Flagstone floor slabs
  const stoneTileGeo = new THREE.BoxGeometry(0.31, 0.02, 0.31);
  for (let ix = 0; ix < 6; ix++) {
    for (let iz = 0; iz < 6; iz++) {
      if (ix >= 4 && iz >= 4) continue; // Spike trap pit
      if (ix <= 1 && iz <= 1) continue; // Pillar base

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

  // Pillar Pedestal
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

  // Main Shaft
  b.part(tileBox([0.42, 1.4, 0.42], BRICK_TEX, TEXEL), P.stone2, {
    bone: root,
    at: [PIL_X, FLOOR_Y + 0.14 + 0.7, PIL_Z],
    texture: BRICK_TEX,
  });

  // Pillar Capital
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

  // Low Backdrop Wall
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

  // Torch Soot Stain on wall above sconce
  b.part(new THREE.BoxGeometry(0.18, 0.32, 0.01), P.soot, {
    bone: root,
    at: [PIL_X, FLOOR_Y + 1.35, PIL_Z + 0.215],
  });

  // Hanging Dungeon Chains & Manacles
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
  });
  for (let cl = 0; cl < 4; cl++) {
    b.part(new THREE.BoxGeometry(0.02, 0.04, 0.012), P.iron2, {
      bone: root,
      at: [SHACKLE_X, SHACKLE_Y - 0.07 - cl * 0.035, SHACKLE_Z + 0.02],
      rotation: [0, cl % 2 === 0 ? 0 : 90, 0],
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Wall Sconce Torch & Pixel Flame
  // ---------------------------------------------------------------------------

  const SCONCE_Y = FLOOR_Y + 1.05;
  const SCONCE_Z = PIL_Z + 0.21;

  // Bracket
  b.part(new THREE.BoxGeometry(0.08, 0.16, 0.02), P.iron0, {
    bone: root,
    at: [PIL_X, SCONCE_Y, SCONCE_Z + 0.01],
    texture: IRON_TEX,
  });
  b.part(new THREE.BoxGeometry(0.024, 0.024, 0.15), P.iron1, {
    bone: root,
    at: [PIL_X, SCONCE_Y + 0.035, SCONCE_Z + 0.08],
    rotation: [28, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.045, 0.03, 0.06, 8), P.iron2, {
    bone: root,
    at: [PIL_X, SCONCE_Y + 0.09, SCONCE_Z + 0.15],
  });
  // Torch Stick
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.24, 6), P.wood1, {
    bone: root,
    at: [PIL_X, SCONCE_Y + 0.15, SCONCE_Z + 0.15],
    rotation: [12, 0, 0],
  });
  b.part(new THREE.BoxGeometry(0.055, 0.08, 0.055), P.wood0, {
    bone: root,
    at: [PIL_X, SCONCE_Y + 0.25, SCONCE_Z + 0.16],
  });

  // Clean Pixel Flame Generator (Double-sided cross cards, no solid center block)
  const makeFlame = (pos: [number, number, number], width: number, height: number, intensity = 2.4) => {
    const geo = new THREE.PlaneGeometry(width, height);
    for (const ang of [0, 60, 120]) {
      const fl = b.part(geo, P.fire2, {
        bone: root,
        at: pos,
        rotation: [0, ang, 0],
        texture: FLAME_TEX,
      });
      glow(fl, intensity);
    }
    // Tiny stepped ember core
    const core = b.part(new THREE.BoxGeometry(width * 0.2, height * 0.25, width * 0.2), P.fire3, {
      bone: root,
      at: [pos[0], pos[1] - height * 0.2, pos[2]],
    });
    glow(core, intensity * 1.4);
  };

  makeFlame([PIL_X, SCONCE_Y + 0.38, SCONCE_Z + 0.16], 0.2, 0.32, 2.5);

  // Floating spark embers
  const emb1 = b.part(new THREE.BoxGeometry(0.016, 0.016, 0.016), P.fire3, {
    bone: root,
    at: [PIL_X + 0.02, SCONCE_Y + 0.58, SCONCE_Z + 0.14],
  });
  const emb2 = b.part(new THREE.BoxGeometry(0.014, 0.014, 0.014), P.fire2, {
    bone: root,
    at: [PIL_X - 0.03, SCONCE_Y + 0.65, SCONCE_Z + 0.18],
  });
  glow(emb1, 3.2);
  glow(emb2, 3.2);

  // ---------------------------------------------------------------------------
  // 6. Standing Dungeon Brazier (Mid-Left)
  // ---------------------------------------------------------------------------

  const BRZ_X = -0.72;
  const BRZ_Z = 0.16;

  // Tripod Base
  b.part(new THREE.CylinderGeometry(0.18, 0.22, 0.05, 8), P.iron0, {
    bone: root,
    at: [BRZ_X, FLOOR_Y + 0.025, BRZ_Z],
    texture: IRON_TEX,
  });
  for (let li = 0; li < 3; li++) {
    const la = (li * 120 * Math.PI) / 180;
    b.part(new THREE.BoxGeometry(0.04, 0.05, 0.14), P.iron1, {
      bone: root,
      at: [BRZ_X + Math.sin(la) * 0.18, FLOOR_Y + 0.025, BRZ_Z + Math.cos(la) * 0.18],
      rotation: [0, li * 120, 0],
    });
  }

  // Central Spindle
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

  // Brazier Octagonal Bowl
  b.part(new THREE.CylinderGeometry(0.25, 0.12, 0.14, 8), P.iron1, {
    bone: root,
    at: [BRZ_X, FLOOR_Y + 0.54, BRZ_Z],
  });
  b.part(new THREE.CylinderGeometry(0.26, 0.25, 0.03, 8), P.ironHi, {
    bone: root,
    at: [BRZ_X, FLOOR_Y + 0.625, BRZ_Z],
  });

  // Glowing Charcoal Bed & Cross Logs
  const coals = b.part(new THREE.CylinderGeometry(0.22, 0.12, 0.04, 8), P.fire1, {
    bone: root,
    at: [BRZ_X, FLOOR_Y + 0.59, BRZ_Z],
  });
  glow(coals, 1.8);
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.28, 6), P.wood0, {
    bone: root,
    at: [BRZ_X, FLOOR_Y + 0.62, BRZ_Z],
    rotation: [0, 45, 90],
  });
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.28, 6), P.wood0, {
    bone: root,
    at: [BRZ_X, FLOOR_Y + 0.64, BRZ_Z],
    rotation: [90, 45, 0],
  });

  makeFlame([BRZ_X, FLOOR_Y + 0.78, BRZ_Z], 0.3, 0.4, 2.6);

  // ---------------------------------------------------------------------------
  // 7. Hero Prop: Open Treasure Chest & Overflowing Hoard
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

  // Chest Base Tub: W 0.62m, H 0.25m, D 0.40m
  b.part(tileBox([0.62, 0.25, 0.4], WOOD_TEX, TEXEL), P.wood2, {
    bone: root,
    at: chestPos(0, 0.125, 0),
    rotation: [0, CH_ROT, 0],
    texture: WOOD_TEX,
  });

  // Base Iron Bands
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

  // Corner Brackets
  for (const sx of [-0.295, 0.295]) {
    for (const sz of [-0.185, 0.185]) {
      b.part(new THREE.BoxGeometry(0.04, 0.25, 0.04), P.iron1, {
        bone: root,
        at: chestPos(sx, 0.125, sz),
        rotation: [0, CH_ROT, 0],
        texture: IRON_TEX,
      });
    }
  }

  // Vertical Reinforcing Straps
  for (const sx of [-0.15, 0.15]) {
    b.part(new THREE.BoxGeometry(0.035, 0.252, 0.41), P.iron1, {
      bone: root,
      at: chestPos(sx, 0.125, 0),
      rotation: [0, CH_ROT, 0],
      texture: IRON_TEX,
    });
  }

  // Lock Plate Escutcheon
  b.part(new THREE.BoxGeometry(0.08, 0.08, 0.02), P.ironHi, {
    bone: root,
    at: chestPos(0, 0.2, 0.21),
    rotation: [0, CH_ROT, 0],
    texture: LOCK_TEX,
  });

  // Inside Treasure Mound
  const treasureBed = b.part(new THREE.BoxGeometry(0.54, 0.12, 0.32), P.gold2, {
    bone: root,
    at: chestPos(0, 0.18, 0),
    rotation: [0, CH_ROT, 0],
    texture: TREASURE_TEX,
  });
  glow(treasureBed, 1.2);

  // Stepped Gold Ingots
  for (let gi = 0; gi < 3; gi++) {
    b.part(new THREE.BoxGeometry(0.09, 0.025, 0.045), P.gold3, {
      bone: root,
      at: chestPos(-0.16 + gi * 0.03, 0.25 + gi * 0.015, -0.06),
      rotation: [0, CH_ROT + gi * 12, 0],
    });
  }

  // Golden Chalice
  const chaliceBase = chestPos(-0.14, 0.25, 0.05);
  b.part(new THREE.CylinderGeometry(0.035, 0.045, 0.025, 8), P.gold3, { bone: root, at: chaliceBase });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.07, 6), P.gold2, {
    bone: root,
    at: [chaliceBase[0], chaliceBase[1] + 0.045, chaliceBase[2]],
  });
  const chaliceCup = b.part(new THREE.CylinderGeometry(0.045, 0.02, 0.07, 8), P.gold3, {
    bone: root,
    at: [chaliceBase[0], chaliceBase[1] + 0.09, chaliceBase[2]],
  });
  glow(chaliceCup, 1.6);

  // Royal Crown with Gem Points
  const crownBase = chestPos(0.12, 0.27, -0.02);
  const crown = b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.045, 8, 1, true), P.gold3, {
    bone: root,
    at: crownBase,
    rotation: [15, CH_ROT, 0],
  });
  glow(crown, 1.5);
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

  // Sparkling Cut Gemstones
  const ruby1 = b.part(new THREE.OctahedronGeometry(0.032), P.rubyHi, {
    bone: root,
    at: chestPos(0.02, 0.26, 0.08),
  });
  const cyan1 = b.part(new THREE.OctahedronGeometry(0.028), P.cyanHi, {
    bone: root,
    at: chestPos(-0.04, 0.25, -0.06),
  });
  const emerald1 = b.part(new THREE.OctahedronGeometry(0.026), P.emeraldHi, {
    bone: root,
    at: chestPos(0.03, 0.26, -0.09),
  });
  glow(ruby1, 2.5);
  glow(cyan1, 2.5);
  glow(emerald1, 2.5);

  // Spilled Coins cascading onto floor
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), P.gold3, {
    bone: root,
    at: chestPos(0.04, 0.24, 0.19),
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

  // Hinge Axis exactly on rear top rim (No gap!)
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

  // Iron Hinge Knuckles on chest rear
  for (const sx of [-0.18, 0.18]) {
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 6), P.iron0, {
      bone: root,
      at: chestPos(sx, HINGE_Y, HINGE_Z),
      rotation: [0, 0, 90 + CH_ROT],
    });
  }

  // Open Lid Orientation (-45 degrees back)
  const LID_PITCH = -45;
  const lidQuat = new THREE.Quaternion()
    .setFromAxisAngle(new THREE.Vector3(0, 1, 0), chRad)
    .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), (LID_PITCH * Math.PI) / 180));

  const lidPos = (lx: number, ly: number, lz: number): [number, number, number] => {
    const v = new THREE.Vector3(lx, ly, lz).applyQuaternion(lidQuat);
    return [hingePoint[0] + v.x, hingePoint[1] + v.y, hingePoint[2] + v.z];
  };

  // Lid Base Perimeter Frame (Seated right at hinge line)
  b.part(new THREE.BoxGeometry(0.62, 0.035, 0.04), P.wood2, {
    bone: chestLidJoint,
    at: lidPos(0, 0.018, 0.02),
    quat: lidQuat,
    texture: WOOD_TEX,
  });
  b.part(new THREE.BoxGeometry(0.62, 0.035, 0.04), P.wood2, {
    bone: chestLidJoint,
    at: lidPos(0, 0.018, 0.38),
    quat: lidQuat,
    texture: WOOD_TEX,
  });
  b.part(new THREE.BoxGeometry(0.04, 0.035, 0.36), P.wood2, {
    bone: chestLidJoint,
    at: lidPos(-0.29, 0.018, 0.2),
    quat: lidQuat,
    texture: WOOD_TEX,
  });
  b.part(new THREE.BoxGeometry(0.04, 0.035, 0.36), P.wood2, {
    bone: chestLidJoint,
    at: lidPos(0.29, 0.018, 0.2),
    quat: lidQuat,
    texture: WOOD_TEX,
  });

  // Arched Lid Top Planks
  b.part(new THREE.BoxGeometry(0.62, 0.035, 0.2), P.wood3, {
    bone: chestLidJoint,
    at: lidPos(0, 0.12, 0.2),
    quat: lidQuat,
    texture: WOOD_TEX,
  });
  b.part(new THREE.BoxGeometry(0.62, 0.035, 0.13), P.wood2, {
    bone: chestLidJoint,
    at: lidPos(0, 0.07, 0.32),
    quat: lidQuat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.52)),
    texture: WOOD_TEX,
  });
  b.part(new THREE.BoxGeometry(0.62, 0.035, 0.13), P.wood2, {
    bone: chestLidJoint,
    at: lidPos(0, 0.07, 0.08),
    quat: lidQuat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.52)),
    texture: WOOD_TEX,
  });

  // Solid Wooden Gable Arches on Lid Sides
  for (const sx of [-0.3, 0.3]) {
    b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.025, 8, 1, false, 0, Math.PI), P.wood1, {
      bone: chestLidJoint,
      at: lidPos(sx, 0.03, 0.2),
      quat: lidQuat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)),
    });
  }

  // Iron Straps on Lid
  for (const sx of [-0.295, -0.15, 0.15, 0.295]) {
    b.part(new THREE.BoxGeometry(0.035, 0.045, 0.21), P.iron1, {
      bone: chestLidJoint,
      at: lidPos(sx, 0.125, 0.2),
      quat: lidQuat,
      texture: IRON_TEX,
    });
    b.part(new THREE.BoxGeometry(0.035, 0.045, 0.14), P.iron1, {
      bone: chestLidJoint,
      at: lidPos(sx, 0.075, 0.32),
      quat: lidQuat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.52)),
      texture: IRON_TEX,
    });
    b.part(new THREE.BoxGeometry(0.035, 0.045, 0.14), P.iron1, {
      bone: chestLidJoint,
      at: lidPos(sx, 0.075, 0.08),
      quat: lidQuat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.52)),
      texture: IRON_TEX,
    });
  }

  // Gold Catch Plate on Lid Lip
  b.part(new THREE.BoxGeometry(0.09, 0.09, 0.025), P.gold2, {
    bone: chestLidJoint,
    at: lidPos(0, 0.02, 0.4),
    quat: lidQuat,
    texture: LOCK_TEX,
  });

  // ---------------------------------------------------------------------------
  // 8. Oak Barrels & Potion Spill (Back-Right)
  // ---------------------------------------------------------------------------

  const makeBarrel = (
    center: [number, number, number],
    quat: THREE.Quaternion = new THREE.Quaternion(),
    options: { broken?: boolean; slime?: boolean } = {},
  ) => {
    const toWorld = (lx: number, ly: number, lz: number): [number, number, number] => {
      const v = new THREE.Vector3(lx, ly, lz).applyQuaternion(quat);
      return [center[0] + v.x, center[1] + v.y, center[2] + v.z];
    };

    // 12-sided faceted staves
    b.part(new THREE.CylinderGeometry(0.2, 0.17, 0.18, 12), P.wood2, {
      bone: root,
      at: toWorld(0, -0.18, 0),
      quat,
      texture: WOOD_TEX,
    });
    b.part(new THREE.CylinderGeometry(0.22, 0.2, 0.18, 12), P.wood3, {
      bone: root,
      at: toWorld(0, 0, 0),
      quat,
      texture: WOOD_TEX,
    });

    if (!options.broken) {
      b.part(new THREE.CylinderGeometry(0.17, 0.22, 0.18, 12), P.wood2, {
        bone: root,
        at: toWorld(0, 0.18, 0),
        quat,
        texture: WOOD_TEX,
      });
      b.part(new THREE.CylinderGeometry(0.165, 0.165, 0.025, 12), P.wood1, {
        bone: root,
        at: toWorld(0, 0.26, 0),
        quat,
      });
      b.part(new THREE.CylinderGeometry(0.02, 0.016, 0.03, 6), P.woodHi, {
        bone: root,
        at: toWorld(0.06, 0.275, 0.04),
        quat,
      });
    } else {
      // Broken open barrel mouth
      b.part(new THREE.CylinderGeometry(0.17, 0.22, 0.18, 12, 1, true, 0, Math.PI * 1.5), P.wood2, {
        bone: root,
        at: toWorld(0, 0.18, 0),
        quat,
        texture: WOOD_TEX,
      });
      if (options.slime) {
        const slimeInterior = b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.12, 8), P.slime2, {
          bone: root,
          at: toWorld(0, 0.14, 0),
          quat,
        });
        glow(slimeInterior, 1.4);
      }
    }

    // Iron Hoops with 3D Rivets
    const hoop1 = b.part(new THREE.CylinderGeometry(0.178, 0.178, 0.03, 12), P.iron1, {
      bone: root,
      at: toWorld(0, -0.24, 0),
      quat,
      texture: IRON_TEX,
    });
    const hoop2 = b.part(new THREE.CylinderGeometry(0.215, 0.215, 0.03, 12), P.iron0, {
      bone: root,
      at: toWorld(0, -0.08, 0),
      quat,
      texture: IRON_TEX,
    });
    const hoop3 = b.part(new THREE.CylinderGeometry(0.215, 0.215, 0.03, 12), P.iron0, {
      bone: root,
      at: toWorld(0, 0.08, 0),
      quat,
      texture: IRON_TEX,
    });
    const hoop4 = b.part(new THREE.CylinderGeometry(0.178, 0.178, 0.03, 12), P.iron1, {
      bone: root,
      at: toWorld(0, 0.24, 0),
      quat,
      texture: IRON_TEX,
    });

    // Rivet studs around middle hoops
    for (const rAng of [0, 90, 180, 270]) {
      const rad = (rAng * Math.PI) / 180;
      b.part(new THREE.BoxGeometry(0.015, 0.02, 0.015), P.ironHi, {
        bone: root,
        at: toWorld(Math.sin(rad) * 0.218, 0.08, Math.cos(rad) * 0.218),
        quat,
      });
    }
  };

  // Upright Barrel
  const BAR1_X = 0.66;
  const BAR1_Z = -0.52;
  makeBarrel([BAR1_X, FLOOR_Y + 0.27, BAR1_Z], new THREE.Quaternion());

  // Candle burning on top of the upright barrel
  b.part(new THREE.CylinderGeometry(0.018, 0.02, 0.07, 8), P.wax, {
    bone: root,
    at: [BAR1_X - 0.04, FLOOR_Y + 0.575, BAR1_Z - 0.02],
  });
  // Wax drippings
  b.part(new THREE.SphereGeometry(0.01, 5, 4), P.wax, {
    bone: root,
    at: [BAR1_X - 0.055, FLOOR_Y + 0.55, BAR1_Z - 0.02],
  });
  // Candle flame
  const candleFlame = b.part(new THREE.ConeGeometry(0.012, 0.035, 6), P.fire3, {
    bone: root,
    at: [BAR1_X - 0.04, FLOOR_Y + 0.625, BAR1_Z - 0.02],
  });
  glow(candleFlame, 3.0);

  // Overturned Broken Barrel lying flat on stones
  const BAR2_X = 0.62;
  const BAR2_Z = -0.02;
  const bar2Quat = new THREE.Quaternion()
    .setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.45)
    .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2));

  makeBarrel([BAR2_X, FLOOR_Y + 0.22, BAR2_Z], bar2Quat, { broken: true, slime: true });

  // Toxic Green Slime Puddle spreading on stones
  const puddle1 = b.part(new THREE.CylinderGeometry(0.16, 0.19, 0.012, 8), P.slime1, {
    bone: root,
    at: [BAR2_X - 0.16, FLOOR_Y + 0.015, BAR2_Z + 0.18],
  });
  const puddle2 = b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.012, 7), P.slime2, {
    bone: root,
    at: [BAR2_X - 0.06, FLOOR_Y + 0.016, BAR2_Z + 0.32],
  });
  const slimeBubble = b.part(new THREE.SphereGeometry(0.025, 6, 4), P.slimeHi, {
    bone: root,
    at: [BAR2_X - 0.12, FLOOR_Y + 0.025, BAR2_Z + 0.25],
  });
  glow(puddle1, 1.2);
  glow(puddle2, 1.5);
  glow(slimeBubble, 2.2);

  // Dropped Potion Bottles
  b.part(new THREE.CylinderGeometry(0.022, 0.028, 0.06, 6), P.rubyHi, {
    bone: root,
    at: [BAR1_X - 0.25, FLOOR_Y + 0.035, BAR1_Z + 0.14],
    rotation: [70, 20, 0],
  });
  b.part(new THREE.CylinderGeometry(0.022, 0.028, 0.06, 6), P.cyanHi, {
    bone: root,
    at: [BAR2_X + 0.16, FLOOR_Y + 0.032, BAR2_Z + 0.22],
    rotation: [75, -30, 0],
  });

  // ---------------------------------------------------------------------------
  // 9. Deadly Spike Trap & Arcane Pressure Plate (Front-Right)
  // ---------------------------------------------------------------------------

  const TRAP_X = 0.52;
  const TRAP_Z = 0.52;
  const PIT_SIZE = 0.62;

  // Recessed Pit Basin
  b.part(new THREE.BoxGeometry(PIT_SIZE, 0.05, PIT_SIZE), P.stone0, {
    bone: root,
    at: [TRAP_X, FLOOR_Y - 0.015, TRAP_Z],
  });

  // Dark pooled blood under spikes
  b.part(new THREE.BoxGeometry(PIT_SIZE * 0.9, 0.01, PIT_SIZE * 0.9), P.blood, {
    bone: root,
    at: [TRAP_X, FLOOR_Y + 0.002, TRAP_Z],
  });

  // Iron Grate Frame
  const frameBarX = new THREE.BoxGeometry(PIT_SIZE + 0.04, 0.035, 0.04);
  const frameBarZ = new THREE.BoxGeometry(0.04, 0.035, PIT_SIZE + 0.04);
  b.part(frameBarX, P.iron1, { bone: root, at: [TRAP_X, FLOOR_Y + 0.018, TRAP_Z - PIT_SIZE / 2], texture: IRON_TEX });
  b.part(frameBarX, P.iron1, { bone: root, at: [TRAP_X, FLOOR_Y + 0.018, TRAP_Z + PIT_SIZE / 2], texture: IRON_TEX });
  b.part(frameBarZ, P.iron1, { bone: root, at: [TRAP_X - PIT_SIZE / 2, FLOOR_Y + 0.018, TRAP_Z], texture: IRON_TEX });
  b.part(frameBarZ, P.iron1, { bone: root, at: [TRAP_X + PIT_SIZE / 2, FLOOR_Y + 0.018, TRAP_Z], texture: IRON_TEX });

  // 16 Vicious Iron Pyramid Spikes
  const spikeConeGeo = new THREE.ConeGeometry(0.035, 0.22, 4);
  const bloodTipGeo = new THREE.ConeGeometry(0.02, 0.1, 4);

  for (let sx = 0; sx < 4; sx++) {
    for (let sz = 0; sz < 4; sz++) {
      const spx = TRAP_X - 0.225 + sx * 0.15;
      const spz = TRAP_Z - 0.225 + sz * 0.15;
      const spikeH = 0.2 + ((sx * 5 + sz * 11) % 4) * 0.015;

      b.part(spikeConeGeo, P.iron2, {
        bone: root,
        at: [spx, FLOOR_Y + spikeH / 2, spz],
        rotation: [0, 45, 0],
      });
      b.part(bloodTipGeo, P.blood, {
        bone: root,
        at: [spx, FLOOR_Y + spikeH - 0.04, spz],
        rotation: [0, 45, 0],
      });
    }
  }

  // Pressure Plate Mechanism
  const PLATE_X = -0.02;
  const PLATE_Z = 0.58;

  b.part(new THREE.BoxGeometry(0.34, 0.015, 0.34), P.stone1, {
    bone: root,
    at: [PLATE_X, FLOOR_Y + 0.008, PLATE_Z],
  });
  b.part(new THREE.BoxGeometry(0.26, 0.025, 0.26), P.stone3, {
    bone: root,
    at: [PLATE_X, FLOOR_Y + 0.022, PLATE_Z],
    texture: STONE_TILE_TEX,
  });
  const runePlate = b.part(new THREE.PlaneGeometry(0.18, 0.18), P.rubyHi, {
    bone: root,
    at: [PLATE_X, FLOOR_Y + 0.036, PLATE_Z],
    rotation: [-90, 0, 0],
    texture: RUNE_TEX,
  });
  glow(runePlate, 1.8);

  // ---------------------------------------------------------------------------
  // 10. Fallen Adventurer Skeleton & Gear
  // ---------------------------------------------------------------------------

  const SK_X = -0.08;
  const SK_Z = 0.22;

  // 3D Voxel Skull
  b.part(new THREE.BoxGeometry(0.13, 0.11, 0.13), P.bone3, {
    bone: root,
    at: [SK_X, FLOOR_Y + 0.075, SK_Z],
    rotation: [-10, 25, -6],
  });
  b.part(new THREE.PlaneGeometry(0.13, 0.13), P.bone3, {
    bone: root,
    at: [SK_X + 0.028, FLOOR_Y + 0.075, SK_Z + 0.067],
    rotation: [-10, 25, -6],
    texture: SKULL_TEX,
  });
  // Lower Jaw
  b.part(new THREE.BoxGeometry(0.08, 0.03, 0.06), P.bone2, {
    bone: root,
    at: [SK_X + 0.025, FLOOR_Y + 0.018, SK_Z + 0.075],
    rotation: [0, 32, 0],
  });
  // Rusted Adventurer Iron Brow Helmet
  b.part(new THREE.BoxGeometry(0.14, 0.04, 0.14), P.iron1, {
    bone: root,
    at: [SK_X - 0.01, FLOOR_Y + 0.11, SK_Z - 0.01],
    rotation: [-10, 25, -6],
  });
  b.part(new THREE.BoxGeometry(0.025, 0.07, 0.02), P.ironHi, {
    bone: root,
    at: [SK_X + 0.025, FLOOR_Y + 0.09, SK_Z + 0.075],
    rotation: [-10, 25, -6],
  });

  // Ribcage & Vertebral Spine
  b.part(new THREE.BoxGeometry(0.03, 0.03, 0.22), P.bone2, {
    bone: root,
    at: [SK_X + 0.14, FLOOR_Y + 0.03, SK_Z - 0.04],
    rotation: [12, -30, 0],
  });
  for (let ri = 0; ri < 4; ri++) {
    b.part(new THREE.TorusGeometry(0.065, 0.01, 4, 8, Math.PI * 0.75), P.bone3, {
      bone: root,
      at: [SK_X + 0.1 + ri * 0.045, FLOOR_Y + 0.03, SK_Z - 0.09 + ri * 0.045],
      rotation: [75, 20 + ri * 10, 0],
    });
  }

  // Pelvic girdle
  b.part(new THREE.BoxGeometry(0.1, 0.04, 0.08), P.bone2, {
    bone: root,
    at: [SK_X + 0.28, FLOOR_Y + 0.025, SK_Z - 0.12],
    rotation: [0, -30, 0],
  });

  // Articulated Reaching Arm (Desperately reaching towards the chest)
  // Shoulder to elbow
  b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.13, 6), P.bone3, {
    bone: root,
    at: [SK_X + 0.04, FLOOR_Y + 0.02, SK_Z - 0.11],
    rotation: [0, 0, 75],
  });
  // Forearm reaching forward
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.14, 6), P.bone3, {
    bone: root,
    at: [SK_X - 0.05, FLOOR_Y + 0.016, SK_Z - 0.14],
    rotation: [0, 45, 90],
  });
  // Bony Hand & Grasping Fingers
  b.part(new THREE.BoxGeometry(0.035, 0.012, 0.03), P.bone2, {
    bone: root,
    at: [SK_X - 0.13, FLOOR_Y + 0.012, SK_Z - 0.16],
    rotation: [0, 45, 0],
  });
  for (let fi = 0; fi < 4; fi++) {
    b.part(new THREE.BoxGeometry(0.007, 0.007, 0.03), P.boneHi, {
      bone: root,
      at: [SK_X - 0.15 - fi * 0.008, FLOOR_Y + 0.01, SK_Z - 0.17 + fi * 0.006],
      rotation: [15, 45, 0],
    });
  }

  // Crossed Leg Femurs
  const buildBone = (at: [number, number, number], rot: [number, number, number]) => {
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 6), P.bone3, {
      bone: root,
      at,
      rotation: rot,
    });
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler((rot[0] * Math.PI) / 180, (rot[1] * Math.PI) / 180, (rot[2] * Math.PI) / 180),
    );
    const endOff = new THREE.Vector3(0, 0.12, 0).applyQuaternion(q);
    b.part(new THREE.SphereGeometry(0.018, 6, 4), P.bone2, {
      bone: root,
      at: [at[0] + endOff.x, at[1] + endOff.y, at[2] + endOff.z],
    });
    b.part(new THREE.SphereGeometry(0.018, 6, 4), P.bone2, {
      bone: root,
      at: [at[0] - endOff.x, at[1] - endOff.y, at[2] - endOff.z],
    });
  };

  buildBone([SK_X + 0.32, FLOOR_Y + 0.02, SK_Z - 0.02], [88, 35, 0]);
  buildBone([SK_X + 0.34, FLOOR_Y + 0.025, SK_Z + 0.08], [86, -45, 0]);

  // Impaled bone stuck through the spike trap
  buildBone([TRAP_X - 0.08, FLOOR_Y + 0.18, TRAP_Z + 0.08], [35, -40, 60]);

  // Rusted Knight's Broadsword
  const SW_X = SK_X - 0.28;
  const SW_Z = SK_Z + 0.08;
  const SW_ROT = 28;

  b.part(new THREE.BoxGeometry(0.045, 0.012, 0.44), P.iron2, {
    bone: root,
    at: [SW_X, FLOOR_Y + 0.008, SW_Z],
    rotation: [0, SW_ROT, 0],
  });
  b.part(new THREE.BoxGeometry(0.012, 0.013, 0.36), P.iron0, {
    bone: root,
    at: [SW_X, FLOOR_Y + 0.009, SW_Z],
    rotation: [0, SW_ROT, 0],
  });
  b.part(new THREE.BoxGeometry(0.14, 0.018, 0.025), P.iron1, {
    bone: root,
    at: [SW_X - 0.1 * Math.sin((SW_ROT * Math.PI) / 180), FLOOR_Y + 0.01, SW_Z - 0.1 * Math.cos((SW_ROT * Math.PI) / 180)],
    rotation: [0, SW_ROT, 0],
  });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.11, 6), P.wood0, {
    bone: root,
    at: [SW_X - 0.16 * Math.sin((SW_ROT * Math.PI) / 180), FLOOR_Y + 0.01, SW_Z - 0.16 * Math.cos((SW_ROT * Math.PI) / 180)],
    rotation: [0, 0, 90 + SW_ROT],
  });
  b.part(new THREE.SphereGeometry(0.022, 6, 4), P.gold1, {
    bone: root,
    at: [SW_X - 0.22 * Math.sin((SW_ROT * Math.PI) / 180), FLOOR_Y + 0.01, SW_Z - 0.22 * Math.cos((SW_ROT * Math.PI) / 180)],
  });

  // Cracked Round Buckler Shield lying near the skeleton
  const SHIELD_X = SK_X - 0.2;
  const SHIELD_Z = SK_Z + 0.24;
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 10), P.wood1, {
    bone: root,
    at: [SHIELD_X, FLOOR_Y + 0.015, SHIELD_Z],
    rotation: [12, 20, 0],
    texture: WOOD_TEX,
  });
  b.part(new THREE.CylinderGeometry(0.145, 0.145, 0.025, 10, 1, true), P.iron0, {
    bone: root,
    at: [SHIELD_X, FLOOR_Y + 0.018, SHIELD_Z],
    rotation: [12, 20, 0],
  });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), P.ironHi, {
    bone: root,
    at: [SHIELD_X, FLOOR_Y + 0.038, SHIELD_Z],
  });

  // Dropped Leather Coin Pouch
  b.part(new THREE.SphereGeometry(0.035, 6, 5), P.leather, {
    bone: root,
    at: [SK_X - 0.18, FLOOR_Y + 0.02, SK_Z - 0.18],
  });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 6), P.gold3, {
    bone: root,
    at: [SK_X - 0.2, FLOOR_Y + 0.008, SK_Z - 0.2],
  });

  // Antique Dungeon Key (Near reaching bony fingers)
  const KEY_X = SK_X - 0.14;
  const KEY_Z = SK_Z - 0.24;

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
```