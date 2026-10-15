```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { pixelArt, pixelTexture, PixelGrid, bayer } from "agentic-3js-builder/kits/pixel";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dungeon Props Diorama",
  description:
    "Pixel-art dungeon prop set featuring an open treasure chest overflowing with gold, a deadly spike trap with bloodied iron points, torches with glowing flames, wooden barrels, and skeletal remains on a flagstone base.",
};

export default function build() {
  const b = createBuilder({ name: "dungeon_props", detail: 1 });

  // ---------------------------------------------------------------------------
  // 1. Color Palette & Pixel Textures
  // ---------------------------------------------------------------------------

  const P = {
    // Stone
    stone0: "#13121c",
    stone1: "#201e2e",
    stone2: "#353247",
    stone3: "#4d4a63",
    stone4: "#6e6b8a",
    moss: "#2f4223",
    mossHi: "#4f6e3a",
    // Wood
    wood0: "#190d08",
    wood1: "#2e180d",
    wood2: "#4a2816",
    wood3: "#734024",
    wood4: "#9c5a33",
    // Iron & Steel
    iron0: "#101114",
    iron1: "#1d1f26",
    iron2: "#333642",
    iron3: "#4f5466",
    ironHi: "#788099",
    // Gold & Gems
    gold0: "#593608",
    gold1: "#9e6811",
    gold2: "#e09c1b",
    gold3: "#ffd147",
    ruby: "#c41432",
    rubyHi: "#ff4d6d",
    cyan: "#00c4d4",
    cyanHi: "#66f0ff",
    emerald: "#169e4f",
    emeraldHi: "#47e688",
    // Bone & Blood
    bone0: "#363024",
    bone1: "#5e5543",
    bone2: "#91856c",
    bone3: "#cfc4aa",
    blood: "#6b0a15",
    bloodHi: "#991424",
    // Slime & Potions
    slime0: "#1d5c14",
    slime1: "#379924",
    slimeHi: "#6be053",
    // Fire & Glow
    fire0: "#7d0d0d",
    fire1: "#d63811",
    fire2: "#ff8412",
    fire3: "#ffd82b",
    white: "#ffffff",
  };

  // Flagstone tile texture (32x32) with mortar cracks, bevel highlights, and moss
  const FLAGSTONE_TEX = pixelTexture(32, 32, (g: PixelGrid) => {
    g.fill(() => P.stone0);
    const drawStone = (rx: number, ry: number, rw: number, rh: number) => {
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const isTop = y === 0;
          const isLeft = x === 0;
          const isBottom = y === rh - 1;
          const isRight = x === rw - 1;
          let c = P.stone2;
          const d = bayer(rx + x, ry + y);
          if (d > 0.68) c = P.stone3;
          else if (d < 0.22) c = P.stone1;
          if (isTop || isLeft) c = P.stone4;
          if (isBottom || isRight) c = P.stone1;
          if ((x < 2 || y < 2) && (rx * 5 + ry * 11 + x + y) % 7 === 0) c = P.moss;
          if ((x < 1 || y < 1) && (rx * 3 + ry * 7 + x + y) % 11 === 0) c = P.mossHi;
          g.set(rx + x, ry + y, c);
        }
      }
    };
    drawStone(1, 1, 14, 14);
    drawStone(17, 1, 14, 18);
    drawStone(1, 17, 14, 14);
    drawStone(17, 21, 14, 10);
  });

  // Wood planks texture (32x32) with vertical grain, dark joints, and nail rivets
  const WOOD_TEX = pixelTexture(32, 32, (g: PixelGrid) => {
    g.fill((x, y) => {
      const plank = Math.floor(x / 8);
      const px = x % 8;
      if (px === 0) return P.wood0;
      if (px === 1) return P.wood4;
      if (px === 7) return P.wood1;
      const b = bayer(x, y);
      let c = b > 0.55 ? P.wood3 : P.wood2;
      if ((y === 3 || y === 28) && px === 4) c = P.iron2;
      if ((y === 3 || y === 28) && px === 5) c = P.ironHi;
      return c;
    });
  });

  // Iron plating & banding texture (16x16)
  const IRON_TEX = pixelTexture(16, 16, (g: PixelGrid) => {
    g.fill((x, y) => {
      if (x === 0 || y === 0) return P.ironHi;
      if (x === 15 || y === 15) return P.iron0;
      const isRivet = (x === 3 || x === 12) && (y === 3 || y === 12);
      if (isRivet) return P.ironHi;
      const isRivetShadow = (x === 4 || x === 13) && (y === 4 || y === 13);
      if (isRivetShadow) return P.iron0;
      return bayer(x, y) > 0.5 ? P.iron2 : P.iron1;
    });
  });

  // Blazing pixel-art torch flame (16x24)
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
      w: P.white,
      y: P.fire3,
      f: P.fire2,
      o: P.fire1,
      r: P.fire0,
      d: "#450808",
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
      k: "#111018",
    },
  );

  // Ornate chest lock plate (16x16)
  const CHEST_LOCK_TEX = pixelArt(
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
      k: "#1a1208",
    },
  );

  // Glistening treasure pile (16x16)
  const GOLD_PILE_TEX = pixelArt(
    [
      "Yyyy..RR..Yyyy..",
      "yyyyyRRrr.yyyyy.",
      ".yyyy..rr..yyyy.",
      "..Yyyy..EE..Yyyy",
      ".yyyyy.EEee.yyyy",
      "Yyyy...ee..Yyyy.",
      "yyyyy.Yyyy.yyyyy",
      ".yyyy.yyyyy.yyyy",
      "Yyyy..yyyyy..yyy",
      "yyyyy..yyy..CC..",
      ".yyyy.Yyyy.CCcc.",
      "..yy.yyyyy..cc..",
      "Yyyy.yyyyy.Yyyy.",
      "yyyyy.yyy.yyyyy.",
      ".yyyy..y...yyyy.",
      "................",
    ],
    {
      Y: P.gold3,
      y: P.gold2,
      R: P.rubyHi,
      r: P.ruby,
      E: P.emeraldHi,
      e: P.emerald,
      C: P.cyanHi,
      c: P.cyan,
    },
  );

  // ---------------------------------------------------------------------------
  // 2. Skeleton Hierarchy
  // ---------------------------------------------------------------------------

  const dungeonRoot = b.joint("root", { at: [0, 0, 0] });

  // ---------------------------------------------------------------------------
  // 3. Dungeon Flagstone Floor & Plinth
  // ---------------------------------------------------------------------------

  const FLOOR_Y = 0.12;

  // Foundation block (sits right on y = 0)
  b.part(new THREE.BoxGeometry(2.16, 0.1, 2.16), P.stone0, {
    bone: dungeonRoot,
    at: [0, 0.05, 0],
  });

  // Perimeter raised border stone curb
  const curbGeoX = new THREE.BoxGeometry(2.2, 0.035, 0.08);
  const curbGeoZ = new THREE.BoxGeometry(0.08, 0.035, 2.04);
  b.part(curbGeoX, P.stone1, { bone: dungeonRoot, at: [0, FLOOR_Y + 0.015, -1.04] });
  b.part(curbGeoX, P.stone1, { bone: dungeonRoot, at: [0, FLOOR_Y + 0.015, 1.04] });
  b.part(curbGeoZ, P.stone1, { bone: dungeonRoot, at: [-1.04, FLOOR_Y + 0.015, 0] });
  b.part(curbGeoZ, P.stone1, { bone: dungeonRoot, at: [1.04, FLOOR_Y + 0.015, 0] });

  // Grid of individual raised flagstones with subtle height variations
  const stoneTileGeo = new THREE.BoxGeometry(0.31, 0.02, 0.31);
  for (let ix = 0; ix < 6; ix++) {
    for (let iz = 0; iz < 6; iz++) {
      // Leave space for the spike trap pit (around ix: 4..5, iz: 4..5)
      if (ix >= 4 && iz >= 4) continue;
      // Leave space for corner pillar (ix: 0..1, iz: 0..1)
      if (ix <= 1 && iz <= 1) continue;

      const tx = -0.85 + ix * 0.34;
      const tz = -0.85 + iz * 0.34;
      const hOffset = ((ix * 7 + iz * 13) % 5) * 0.002;
      const col = (ix + iz) % 2 === 0 ? P.stone2 : P.stone3;

      b.part(stoneTileGeo, col, {
        bone: dungeonRoot,
        at: [tx, FLOOR_Y + 0.01 + hOffset, tz],
        texture: FLAGSTONE_TEX,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Stone Pillar & Wall Sconce (Back-Left)
  // ---------------------------------------------------------------------------

  const PIL_X = -0.72;
  const PIL_Z = -0.72;

  // Pillar stepped base
  b.part(new THREE.BoxGeometry(0.54, 0.06, 0.54), P.stone1, {
    bone: dungeonRoot,
    at: [PIL_X, FLOOR_Y + 0.03, PIL_Z],
  });
  b.part(new THREE.BoxGeometry(0.48, 0.06, 0.48), P.stone2, {
    bone: dungeonRoot,
    at: [PIL_X, FLOOR_Y + 0.09, PIL_Z],
  });

  // Pillar main shaft
  b.part(new THREE.BoxGeometry(0.42, 1.45, 0.42), P.stone2, {
    bone: dungeonRoot,
    at: [PIL_X, FLOOR_Y + 0.12 + 0.725, PIL_Z],
    texture: FLAGSTONE_TEX,
  });

  // Pillar capital molding
  b.part(new THREE.BoxGeometry(0.48, 0.06, 0.48), P.stone3, {
    bone: dungeonRoot,
    at: [PIL_X, FLOOR_Y + 1.57 + 0.03, PIL_Z],
  });
  b.part(new THREE.BoxGeometry(0.54, 0.08, 0.54), P.stone1, {
    bone: dungeonRoot,
    at: [PIL_X, FLOOR_Y + 1.63 + 0.04, PIL_Z],
  });

  // Wall stub extending from the pillar to the backdrop edge
  b.part(new THREE.BoxGeometry(0.36, 1.35, 0.2), P.stone2, {
    bone: dungeonRoot,
    at: [PIL_X + 0.39, FLOOR_Y + 0.675, PIL_Z - 0.1],
    texture: FLAGSTONE_TEX,
  });

  // Wall-mounted iron sconce bracket
  const SCONCE_Y = FLOOR_Y + 1.05;
  const SCONCE_Z = PIL_Z + 0.21;

  // Iron backplate on the pillar face
  b.part(new THREE.BoxGeometry(0.08, 0.16, 0.02), P.iron0, {
    bone: dungeonRoot,
    at: [PIL_X, SCONCE_Y, SCONCE_Z + 0.01],
    texture: IRON_TEX,
  });

  // Diagonal forged iron arm
  const armGeo = new THREE.BoxGeometry(0.025, 0.025, 0.14);
  b.part(armGeo, P.iron2, {
    bone: dungeonRoot,
    at: [PIL_X, SCONCE_Y + 0.03, SCONCE_Z + 0.07],
    rotation: [25, 0, 0],
  });

  // Iron torch basket cup
  b.part(new THREE.CylinderGeometry(0.04, 0.028, 0.06, 8), P.iron1, {
    bone: dungeonRoot,
    at: [PIL_X, SCONCE_Y + 0.08, SCONCE_Z + 0.13],
  });

  // Wooden torch stick
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 6), P.wood1, {
    bone: dungeonRoot,
    at: [PIL_X, SCONCE_Y + 0.14, SCONCE_Z + 0.13],
    rotation: [12, 0, 0],
  });

  // Pitch-soaked wrapped head
  b.part(new THREE.BoxGeometry(0.05, 0.07, 0.05), P.wood0, {
    bone: dungeonRoot,
    at: [PIL_X, SCONCE_Y + 0.24, SCONCE_Z + 0.14],
  });

  // Torch flames (crossed vertical quads with glow)
  const flamePlaneGeo = new THREE.PlaneGeometry(0.2, 0.3);
  const wallFlame1 = b.part(flamePlaneGeo, P.fire2, {
    bone: dungeonRoot,
    at: [PIL_X, SCONCE_Y + 0.38, SCONCE_Z + 0.14],
    texture: FLAME_TEX,
  });
  const wallFlame2 = b.part(flamePlaneGeo, P.fire2, {
    bone: dungeonRoot,
    at: [PIL_X, SCONCE_Y + 0.38, SCONCE_Z + 0.14],
    rotation: [0, 90, 0],
    texture: FLAME_TEX,
  });
  glow(wallFlame1, 2.2);
  glow(wallFlame2, 2.2);

  // Sparks/embers drifting up from the wall torch
  const emberGeo = new THREE.BoxGeometry(0.016, 0.016, 0.016);
  const ember1 = b.part(emberGeo, P.fire3, {
    bone: dungeonRoot,
    at: [PIL_X + 0.02, SCONCE_Y + 0.52, SCONCE_Z + 0.12],
  });
  const ember2 = b.part(emberGeo, P.fire2, {
    bone: dungeonRoot,
    at: [PIL_X - 0.03, SCONCE_Y + 0.6, SCONCE_Z + 0.15],
  });
  glow(ember1, 3.0);
  glow(ember2, 3.0);

  // Hanging chain from pillar
  const chainLinkGeo = new THREE.BoxGeometry(0.024, 0.045, 0.014);
  for (let cl = 0; cl < 4; cl++) {
    b.part(chainLinkGeo, P.iron1, {
      bone: dungeonRoot,
      at: [PIL_X + 0.22, SCONCE_Y - cl * 0.04, SCONCE_Z - 0.1],
      rotation: [0, cl % 2 === 0 ? 0 : 90, 0],
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Standing Floor Brazier / Iron Torch Stand (Front-Left)
  // ---------------------------------------------------------------------------

  const BRZ_X = -0.72;
  const BRZ_Z = 0.52;

  // Sturdy iron pedestal base
  b.part(new THREE.BoxGeometry(0.34, 0.03, 0.34), P.iron0, {
    bone: dungeonRoot,
    at: [BRZ_X, FLOOR_Y + 0.015, BRZ_Z],
    texture: IRON_TEX,
  });
  b.part(new THREE.CylinderGeometry(0.14, 0.17, 0.06, 8), P.iron1, {
    bone: dungeonRoot,
    at: [BRZ_X, FLOOR_Y + 0.06, BRZ_Z],
  });

  // Central forged shaft with decorative knops
  b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.45, 8), P.iron2, {
    bone: dungeonRoot,
    at: [BRZ_X, FLOOR_Y + 0.315, BRZ_Z],
  });
  b.part(new THREE.BoxGeometry(0.07, 0.035, 0.07), P.ironHi, {
    bone: dungeonRoot,
    at: [BRZ_X, FLOOR_Y + 0.24, BRZ_Z],
  });
  b.part(new THREE.BoxGeometry(0.07, 0.035, 0.07), P.ironHi, {
    bone: dungeonRoot,
    at: [BRZ_X, FLOOR_Y + 0.42, BRZ_Z],
  });

  // Flared iron brazier bowl
  b.part(new THREE.CylinderGeometry(0.24, 0.12, 0.15, 8), P.iron1, {
    bone: dungeonRoot,
    at: [BRZ_X, FLOOR_Y + 0.615, BRZ_Z],
  });
  // Top lip rim band
  b.part(new THREE.CylinderGeometry(0.25, 0.24, 0.03, 8), P.ironHi, {
    bone: dungeonRoot,
    at: [BRZ_X, FLOOR_Y + 0.7, BRZ_Z],
  });

  // Glowing hot coals inside the bowl
  const coalBed = b.part(new THREE.CylinderGeometry(0.2, 0.1, 0.05, 8), P.fire1, {
    bone: dungeonRoot,
    at: [BRZ_X, FLOOR_Y + 0.67, BRZ_Z],
  });
  glow(coalBed, 1.6);

  // Brazier fire (crossed flame cards)
  const brazierFlamePlane = new THREE.PlaneGeometry(0.28, 0.36);
  const brzFlame1 = b.part(brazierFlamePlane, P.fire2, {
    bone: dungeonRoot,
    at: [BRZ_X, FLOOR_Y + 0.85, BRZ_Z],
    texture: FLAME_TEX,
  });
  const brzFlame2 = b.part(brazierFlamePlane, P.fire2, {
    bone: dungeonRoot,
    at: [BRZ_X, FLOOR_Y + 0.85, BRZ_Z],
    rotation: [0, 90, 0],
    texture: FLAME_TEX,
  });
  glow(brzFlame1, 2.4);
  glow(brzFlame2, 2.4);

  // ---------------------------------------------------------------------------
  // 6. The Treasure Chest (Center-Left)
  // ---------------------------------------------------------------------------

  const CH_X = -0.16;
  const CH_Z = -0.14;
  const CH_ROT = 16; // slight jaunty angle

  // Chest Base Box: 0.60m wide, 0.26m high, 0.38m deep
  const chestBaseGeo = new THREE.BoxGeometry(0.58, 0.24, 0.36);
  b.part(chestBaseGeo, P.wood2, {
    bone: dungeonRoot,
    at: [CH_X, FLOOR_Y + 0.12, CH_Z],
    rotation: [0, CH_ROT, 0],
    texture: WOOD_TEX,
  });

  // Base Iron Trim Assemblies (built with rotation matching the chest)
  const angleRad = (CH_ROT * Math.PI) / 180;
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);
  const localToChest = (lx: number, ly: number, lz: number): [number, number, number] => [
    CH_X + lx * cosA + lz * sinA,
    FLOOR_Y + ly,
    CH_Z - lx * sinA + lz * cosA,
  ];

  // 4 Iron corner brackets on chest base
  const cornerAngleGeo = new THREE.BoxGeometry(0.038, 0.245, 0.038);
  for (const sx of [-0.28, 0.28]) {
    for (const sz of [-0.17, 0.17]) {
      b.part(cornerAngleGeo, P.iron1, {
        bone: dungeonRoot,
        at: localToChest(sx, 0.12, sz),
        rotation: [0, CH_ROT, 0],
        texture: IRON_TEX,
      });
    }
  }

  // Horizontal base trim bands
  b.part(new THREE.BoxGeometry(0.59, 0.03, 0.37), P.iron0, {
    bone: dungeonRoot,
    at: localToChest(0, 0.015, 0),
    rotation: [0, CH_ROT, 0],
  });
  b.part(new THREE.BoxGeometry(0.59, 0.03, 0.37), P.iron0, {
    bone: dungeonRoot,
    at: localToChest(0, 0.23, 0),
    rotation: [0, CH_ROT, 0],
  });

  // 2 Vertical reinforcing straps on base
  for (const sx of [-0.14, 0.14]) {
    b.part(new THREE.BoxGeometry(0.035, 0.245, 0.37), P.iron1, {
      bone: dungeonRoot,
      at: localToChest(sx, 0.12, 0),
      rotation: [0, CH_ROT, 0],
    });
  }

  // Inside Treasure Mound
  const treasureGeo = new THREE.BoxGeometry(0.5, 0.16, 0.28);
  b.part(treasureGeo, P.gold2, {
    bone: dungeonRoot,
    at: localToChest(0, 0.15, 0),
    rotation: [0, CH_ROT, 0],
    texture: GOLD_PILE_TEX,
  });

  // Overflowing gold pile mounds and loose coins
  const goldMound1 = b.part(new THREE.BoxGeometry(0.18, 0.08, 0.14), P.gold3, {
    bone: dungeonRoot,
    at: localToChest(-0.1, 0.24, 0.02),
    rotation: [0, CH_ROT + 15, 0],
    texture: GOLD_PILE_TEX,
  });
  const goldMound2 = b.part(new THREE.BoxGeometry(0.16, 0.07, 0.12), P.gold2, {
    bone: dungeonRoot,
    at: localToChest(0.12, 0.23, -0.04),
    rotation: [0, CH_ROT - 20, 0],
    texture: GOLD_PILE_TEX,
  });
  glow(goldMound1, 1.2);
  glow(goldMound2, 1.2);

  // Spilled coin stack on the front lip
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.025, 8), P.gold3, {
    bone: dungeonRoot,
    at: localToChest(0.04, 0.24, 0.17),
    rotation: [15, CH_ROT, 0],
  });

  // Glowing Goblet / Chalice inside
  const gobletBase = localToChest(-0.14, 0.24, -0.05);
  b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.02, 8), P.gold3, {
    bone: dungeonRoot,
    at: gobletBase,
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 6), P.gold2, {
    bone: dungeonRoot,
    at: [gobletBase[0], gobletBase[1] + 0.04, gobletBase[2]],
  });
  const gobletCup = b.part(new THREE.CylinderGeometry(0.04, 0.02, 0.06, 8), P.gold3, {
    bone: dungeonRoot,
    at: [gobletBase[0], gobletBase[1] + 0.08, gobletBase[2]],
  });
  glow(gobletCup, 1.4);

  // Sparkling loose gems
  const rubyGem = b.part(new THREE.OctahedronGeometry(0.028), P.rubyHi, {
    bone: dungeonRoot,
    at: localToChest(0.08, 0.26, 0.06),
  });
  const cyanGem = b.part(new THREE.OctahedronGeometry(0.024), P.cyanHi, {
    bone: dungeonRoot,
    at: localToChest(-0.02, 0.25, -0.06),
  });
  glow(rubyGem, 2.0);
  glow(cyanGem, 2.0);

  // Chest Lid Rigging & Geometry
  // The hinge sits along the rear top edge of the base:
  const hingePoint = localToChest(0, 0.24, -0.18);
  const hingeDir: [number, number, number] = [cosA, 0, -sinA];

  const chestLid = b.joint("chestLid", {
    parent: dungeonRoot,
    at: hingePoint,
    dir: hingeDir,
    role: "hinge",
  });

  // Arched / Vaulted Chest Lid Components (modeled local to the chest orientation, tilted open ~-34 deg)
  // We compose the open lid directly as an assembly
  const LID_OPEN_PITCH = -34; // Open lid angle in degrees
  const lidQuat = new THREE.Quaternion()
    .setFromAxisAngle(new THREE.Vector3(0, 1, 0), angleRad)
    .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), (LID_OPEN_PITCH * Math.PI) / 180));

  const placeOnLid = (lx: number, ly: number, lz: number): [number, number, number] => {
    const v = new THREE.Vector3(lx, ly, lz).applyQuaternion(lidQuat);
    return [hingePoint[0] + v.x, hingePoint[1] + v.y, hingePoint[2] + v.z];
  };

  // Lid central flat top plank
  b.part(new THREE.BoxGeometry(0.58, 0.035, 0.22), P.wood3, {
    bone: chestLid,
    at: placeOnLid(0, 0.16, 0.18),
    quat: lidQuat,
    texture: WOOD_TEX,
  });
  // Lid front slope plank
  b.part(new THREE.BoxGeometry(0.58, 0.035, 0.15), P.wood2, {
    bone: chestLid,
    at: placeOnLid(0, 0.1, 0.31),
    quat: lidQuat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.55)),
    texture: WOOD_TEX,
  });
  // Lid back slope plank
  b.part(new THREE.BoxGeometry(0.58, 0.035, 0.15), P.wood2, {
    bone: chestLid,
    at: placeOnLid(0, 0.1, 0.05),
    quat: lidQuat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.55)),
    texture: WOOD_TEX,
  });

  // Lid wooden side caps
  for (const sx of [-0.28, 0.28]) {
    b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.025, 8, 1, false, 0, Math.PI), P.wood1, {
      bone: chestLid,
      at: placeOnLid(sx, 0.04, 0.18),
      quat: lidQuat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)),
    });
  }

  // Iron straps over the arched lid
  for (const sx of [-0.28, -0.14, 0.14, 0.28]) {
    b.part(new THREE.BoxGeometry(0.032, 0.045, 0.23), P.iron1, {
      bone: chestLid,
      at: placeOnLid(sx, 0.165, 0.18),
      quat: lidQuat,
    });
    b.part(new THREE.BoxGeometry(0.032, 0.045, 0.16), P.iron1, {
      bone: chestLid,
      at: placeOnLid(sx, 0.105, 0.31),
      quat: lidQuat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.55)),
    });
  }

  // Gold keyhole lock plate on the front lip of the chest lid
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.02), P.gold2, {
    bone: chestLid,
    at: placeOnLid(0, 0.02, 0.38),
    quat: lidQuat,
    texture: CHEST_LOCK_TEX,
  });

  // ---------------------------------------------------------------------------
  // 7. Dungeon Barrels (Back-Right)
  // ---------------------------------------------------------------------------

  const BAR1_X = 0.65;
  const BAR1_Z = -0.58;

  // Upright Barrel 1: constructed with bulging faceted staves
  // Lower taper
  b.part(new THREE.CylinderGeometry(0.2, 0.17, 0.18, 10), P.wood2, {
    bone: dungeonRoot,
    at: [BAR1_X, FLOOR_Y + 0.09, BAR1_Z],
    texture: WOOD_TEX,
  });
  // Belly
  b.part(new THREE.CylinderGeometry(0.22, 0.2, 0.18, 10), P.wood3, {
    bone: dungeonRoot,
    at: [BAR1_X, FLOOR_Y + 0.27, BAR1_Z],
    texture: WOOD_TEX,
  });
  // Upper taper
  b.part(new THREE.CylinderGeometry(0.17, 0.22, 0.18, 10), P.wood2, {
    bone: dungeonRoot,
    at: [BAR1_X, FLOOR_Y + 0.45, BAR1_Z],
    texture: WOOD_TEX,
  });

  // Barrel recessed top lid
  b.part(new THREE.CylinderGeometry(0.165, 0.165, 0.02, 10), P.wood1, {
    bone: dungeonRoot,
    at: [BAR1_X, FLOOR_Y + 0.53, BAR1_Z],
  });
  // Bunghole wooden plug
  b.part(new THREE.CylinderGeometry(0.02, 0.015, 0.03, 6), P.wood4, {
    bone: dungeonRoot,
    at: [BAR1_X + 0.06, FLOOR_Y + 0.545, BAR1_Z + 0.04],
  });

  // 4 Iron Hoops around Barrel 1
  b.part(new THREE.CylinderGeometry(0.178, 0.178, 0.03, 10), P.iron1, {
    bone: dungeonRoot,
    at: [BAR1_X, FLOOR_Y + 0.04, BAR1_Z],
    texture: IRON_TEX,
  });
  b.part(new THREE.CylinderGeometry(0.215, 0.215, 0.03, 10), P.iron0, {
    bone: dungeonRoot,
    at: [BAR1_X, FLOOR_Y + 0.2, BAR1_Z],
    texture: IRON_TEX,
  });
  b.part(new THREE.CylinderGeometry(0.215, 0.215, 0.03, 10), P.iron0, {
    bone: dungeonRoot,
    at: [BAR1_X, FLOOR_Y + 0.34, BAR1_Z],
    texture: IRON_TEX,
  });
  b.part(new THREE.CylinderGeometry(0.178, 0.178, 0.03, 10), P.iron1, {
    bone: dungeonRoot,
    at: [BAR1_X, FLOOR_Y + 0.5, BAR1_Z],
    texture: IRON_TEX,
  });

  // Tilted / Leaking Broken Barrel 2
  const BAR2_X = 0.72;
  const BAR2_Z = -0.06;
  const TILT_Z = 24; // Leaning towards front-right
  const bar2Quat = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(1, 0, 0),
    (TILT_Z * Math.PI) / 180,
  );

  // Barrel 2 body
  b.part(new THREE.CylinderGeometry(0.19, 0.16, 0.16, 10), P.wood1, {
    bone: dungeonRoot,
    at: [BAR2_X, FLOOR_Y + 0.1, BAR2_Z],
    quat: bar2Quat,
    texture: WOOD_TEX,
  });
  b.part(new THREE.CylinderGeometry(0.21, 0.19, 0.16, 10), P.wood2, {
    bone: dungeonRoot,
    at: [BAR2_X, FLOOR_Y + 0.24, BAR2_Z - 0.06],
    quat: bar2Quat,
    texture: WOOD_TEX,
  });
  b.part(new THREE.CylinderGeometry(0.16, 0.21, 0.16, 10), P.wood1, {
    bone: dungeonRoot,
    at: [BAR2_X, FLOOR_Y + 0.38, BAR2_Z - 0.12],
    quat: bar2Quat,
    texture: WOOD_TEX,
  });

  // Iron hoops on Barrel 2
  b.part(new THREE.CylinderGeometry(0.205, 0.205, 0.025, 10), P.iron0, {
    bone: dungeonRoot,
    at: [BAR2_X, FLOOR_Y + 0.2, BAR2_Z - 0.04],
    quat: bar2Quat,
  });
  b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.025, 10), P.iron1, {
    bone: dungeonRoot,
    at: [BAR2_X, FLOOR_Y + 0.44, BAR2_Z - 0.15],
    quat: bar2Quat,
  });

  // Broken open lid showing green potion / slime inside
  const slimePoolInside = b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 8), P.slimeHi, {
    bone: dungeonRoot,
    at: [BAR2_X, FLOOR_Y + 0.43, BAR2_Z - 0.14],
    quat: bar2Quat,
  });
  glow(slimePoolInside, 1.2);

  // Slime spill puddle on the stone floor
  const slimePuddle1 = b.part(new THREE.CylinderGeometry(0.16, 0.18, 0.012, 7), P.slime1, {
    bone: dungeonRoot,
    at: [BAR2_X - 0.12, FLOOR_Y + 0.016, BAR2_Z + 0.12],
  });
  const slimePuddle2 = b.part(new THREE.CylinderGeometry(0.09, 0.11, 0.012, 6), P.slimeHi, {
    bone: dungeonRoot,
    at: [BAR2_X - 0.04, FLOOR_Y + 0.017, BAR2_Z + 0.24],
  });
  glow(slimePuddle1, 1.1);
  glow(slimePuddle2, 1.4);

  // Small glass potion bottle on the floor
  b.part(new THREE.CylinderGeometry(0.022, 0.028, 0.06, 6), P.rubyHi, {
    bone: dungeonRoot,
    at: [BAR1_X - 0.26, FLOOR_Y + 0.04, BAR1_Z + 0.08],
  });
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.02, 6), P.wood4, {
    bone: dungeonRoot,
    at: [BAR1_X - 0.26, FLOOR_Y + 0.08, BAR1_Z + 0.08],
  });

  // ---------------------------------------------------------------------------
  // 8. Deadly Spike Trap (Front-Right)
  // ---------------------------------------------------------------------------

  const TRAP_X = 0.52;
  const TRAP_Z = 0.52;
  const PIT_SIZE = 0.54;

  // Sunken Pit Basin
  b.part(new THREE.BoxGeometry(PIT_SIZE, 0.04, PIT_SIZE), P.stone0, {
    bone: dungeonRoot,
    at: [TRAP_X, FLOOR_Y - 0.01, TRAP_Z],
  });

  // Iron grate border frame around the trap pit
  const borderBarGeoX = new THREE.BoxGeometry(PIT_SIZE + 0.04, 0.03, 0.04);
  const borderBarGeoZ = new THREE.BoxGeometry(0.04, 0.03, PIT_SIZE + 0.04);
  b.part(borderBarGeoX, P.iron1, {
    bone: dungeonRoot,
    at: [TRAP_X, FLOOR_Y + 0.015, TRAP_Z - PIT_SIZE / 2],
    texture: IRON_TEX,
  });
  b.part(borderBarGeoX, P.iron1, {
    bone: dungeonRoot,
    at: [TRAP_X, FLOOR_Y + 0.015, TRAP_Z + PIT_SIZE / 2],
    texture: IRON_TEX,
  });
  b.part(borderBarGeoZ, P.iron1, {
    bone: dungeonRoot,
    at: [TRAP_X - PIT_SIZE / 2, FLOOR_Y + 0.015, TRAP_Z],
    texture: IRON_TEX,
  });
  b.part(borderBarGeoZ, P.iron1, {
    bone: dungeonRoot,
    at: [TRAP_X + PIT_SIZE / 2, FLOOR_Y + 0.015, TRAP_Z],
    texture: IRON_TEX,
  });

  // Iron grate crossbars in the floor of the pit
  const grateBarGeoX = new THREE.BoxGeometry(PIT_SIZE, 0.015, 0.02);
  const grateBarGeoZ = new THREE.BoxGeometry(0.02, 0.015, PIT_SIZE);
  for (const off of [-0.14, 0, 0.14]) {
    b.part(grateBarGeoX, P.iron0, {
      bone: dungeonRoot,
      at: [TRAP_X, FLOOR_Y + 0.005, TRAP_Z + off],
    });
    b.part(grateBarGeoZ, P.iron0, {
      bone: dungeonRoot,
      at: [TRAP_X + off, FLOOR_Y + 0.005, TRAP_Z],
    });
  }

  // 3x3 Grid of Menacing Iron Spikes
  // 4-sided sharp pyramid spikes
  const spikeGeo = new THREE.ConeGeometry(0.034, 0.22, 4);
  const bloodTipGeo = new THREE.ConeGeometry(0.018, 0.09, 4);

  for (let sx = -1; sx <= 1; sx++) {
    for (let sz = -1; sz <= 1; sz++) {
      const spx = TRAP_X + sx * 0.14;
      const spz = TRAP_Z + sz * 0.14;
      const spikeH = 0.2 + ((sx * 3 + sz * 7 + 10) % 3) * 0.02;

      // Iron spike main shaft
      b.part(spikeGeo, P.iron2, {
        bone: dungeonRoot,
        at: [spx, FLOOR_Y + spikeH / 2, spz],
        rotation: [0, 45, 0],
      });

      // Blood-stained dried gore on the spike tip
      b.part(bloodTipGeo, P.blood, {
        bone: dungeonRoot,
        at: [spx, FLOOR_Y + spikeH - 0.035, spz],
        rotation: [0, 45, 0],
      });
    }
  }

  // Stone Pressure Plate Trigger (adjacent to the trap in the corridor path)
  const PLATE_X = 0.12;
  const PLATE_Z = 0.52;

  // Beveled pressure tile frame
  b.part(new THREE.BoxGeometry(0.32, 0.015, 0.32), P.stone1, {
    bone: dungeonRoot,
    at: [PLATE_X, FLOOR_Y + 0.008, PLATE_Z],
  });
  // Raised center trigger plate
  b.part(new THREE.BoxGeometry(0.24, 0.022, 0.24), P.stone3, {
    bone: dungeonRoot,
    at: [PLATE_X, FLOOR_Y + 0.022, PLATE_Z],
    texture: FLAGSTONE_TEX,
  });
  // Warning skull / rune symbol on the pressure plate
  b.part(new THREE.BoxGeometry(0.08, 0.004, 0.08), P.ruby, {
    bone: dungeonRoot,
    at: [PLATE_X, FLOOR_Y + 0.034, PLATE_Z],
    rotation: [0, 45, 0],
  });

  // ---------------------------------------------------------------------------
  // 9. Bones, Skull & Adventurer Remains (Center-Foreground)
  // ---------------------------------------------------------------------------

  const SKULL_X = 0.1;
  const SKULL_Z = 0.16;

  // Humanoid Skull: Cranial box + textured face plate
  const craniumGeo = new THREE.BoxGeometry(0.12, 0.095, 0.12);
  b.part(craniumGeo, P.bone3, {
    bone: dungeonRoot,
    at: [SKULL_X, FLOOR_Y + 0.065, SKULL_Z],
    rotation: [-8, 22, -10],
  });

  // Skull face plate with pixel art eyes and teeth
  const skullFaceGeo = new THREE.PlaneGeometry(0.12, 0.12);
  b.part(skullFaceGeo, P.bone3, {
    bone: dungeonRoot,
    at: [SKULL_X + 0.023, FLOOR_Y + 0.065, SKULL_Z + 0.062],
    rotation: [-8, 22, -10],
    texture: SKULL_TEX,
  });

  // Lower jaw piece, slightly ajar on the floor
  b.part(new THREE.BoxGeometry(0.08, 0.025, 0.06), P.bone2, {
    bone: dungeonRoot,
    at: [SKULL_X + 0.015, FLOOR_Y + 0.015, SKULL_Z + 0.05],
    rotation: [0, 28, 0],
  });

  // Scattered Long Bones (Femurs)
  const makeFemur = (at: [number, number, number], rot: [number, number, number]) => {
    // Slender shaft
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 6), P.bone3, {
      bone: dungeonRoot,
      at,
      rotation: rot,
    });
    // Dual condyle knobs at each end
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler((rot[0] * Math.PI) / 180, (rot[1] * Math.PI) / 180, (rot[2] * Math.PI) / 180),
    );
    const endOffset = new THREE.Vector3(0, 0.14, 0).applyQuaternion(q);
    b.part(new THREE.SphereGeometry(0.02, 6, 4), P.bone2, {
      bone: dungeonRoot,
      at: [at[0] + endOffset.x, at[1] + endOffset.y, at[2] + endOffset.z],
    });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), P.bone2, {
      bone: dungeonRoot,
      at: [at[0] - endOffset.x, at[1] - endOffset.y, at[2] - endOffset.z],
    });
  };

  // Femur 1: Lying on the floor beside the skull
  makeFemur([SKULL_X - 0.12, FLOOR_Y + 0.02, SKULL_Z + 0.08], [85, 30, 0]);

  // Femur 2: Impaled & stuck wedged between two spikes of the trap!
  makeFemur([TRAP_X - 0.07, FLOOR_Y + 0.18, TRAP_Z + 0.07], [35, -40, 60]);

  // Curved rib bones scattered on the floor
  const ribGeo = new THREE.TorusGeometry(0.06, 0.008, 4, 8, Math.PI * 0.7);
  b.part(ribGeo, P.bone2, {
    bone: dungeonRoot,
    at: [SKULL_X + 0.18, FLOOR_Y + 0.015, SKULL_Z - 0.06],
    rotation: [80, 20, 0],
  });
  b.part(ribGeo, P.bone3, {
    bone: dungeonRoot,
    at: [SKULL_X + 0.23, FLOOR_Y + 0.015, SKULL_Z + 0.02],
    rotation: [75, -35, 0],
  });

  // Dropped Antique Dungeon Key (near the adventurer's reach)
  const KEY_X = SKULL_X - 0.04;
  const KEY_Z = SKULL_Z + 0.22;

  // Key bow (handle ring)
  b.part(new THREE.TorusGeometry(0.026, 0.006, 6, 8), P.ironHi, {
    bone: dungeonRoot,
    at: [KEY_X, FLOOR_Y + 0.012, KEY_Z],
    rotation: [90, 0, 30],
  });
  // Key stem
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.07, 6), P.iron2, {
    bone: dungeonRoot,
    at: [KEY_X + 0.045, FLOOR_Y + 0.012, KEY_Z + 0.026],
    rotation: [0, 0, 60],
  });
  // Key bit (teeth)
  b.part(new THREE.BoxGeometry(0.018, 0.012, 0.006), P.ironHi, {
    bone: dungeonRoot,
    at: [KEY_X + 0.07, FLOOR_Y + 0.012, KEY_Z + 0.04],
    rotation: [0, -30, 0],
  });

  return b.root;
}
```