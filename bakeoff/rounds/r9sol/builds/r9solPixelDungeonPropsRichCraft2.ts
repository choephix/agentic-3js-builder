import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  paint,
  mix,
  noise,
} from "../../../../src/index";
import type { Fill, Joint, OutlinePoint } from "../../../../src/index";
import {
  pixelArt,
  pixelTexture,
  tileBox,
  cellPaint,
} from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "The Forgotten Loot Room",
  description:
    "A pixel-art dungeon vignette: an open ironbound treasure chest, burning torches, stave barrels, scattered bones, and a nine-spike floor trap on a chunky stone platform.",
};

type V = [number, number, number];

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "forgottenLootRoom",
    detail: 1,
    paintSize: 1024,
  });

  const random = rng(61492);
  const textureRandom = rng(4281);

  const C = {
    ink: "#171c27",
    shadow: "#252838",
    iron: "#414858",
    steel: "#8997a4",
    silver: "#d3dedc",
    gold: "#d4a34c",
    goldLight: "#ffe098",
    goldDark: "#80512a",
    wood: "#8c502e",
    woodDark: "#422a25",
    woodLight: "#c78743",
    stone: "#64677b",
    stoneDark: "#373b50",
    stoneLight: "#92929a",
    mortar: "#282f40",
    bone: "#e0d3a4",
    boneLight: "#fff0c4",
    boneShade: "#9b927b",
    rust: "#8d4136",
    moss: "#506955",
    mossLight: "#829363",
    ember: "#e75529",
    orange: "#ff9138",
    yellow: "#ffd667",
    flameLight: "#fff2ad",
    cyan: "#4cdacb",
    cyanDark: "#196e7b",
    violet: "#b174d0",
    burgundy: "#673244",
  };

  // All articulated pieces are declared before their geometry.
  const stage = b.joint("stage", { at: [0, 0, 0] });
  const chestX = -0.35;
  const chestZ = 0.02;
  const chestBack = chestZ - 0.4;
  const lid = b.joint("chestLid", {
    parent: stage,
    at: [chestX, 0.84, chestBack],
    dir: [0, 0, 1],
    role: "hinge",
  });
  const skullJaw = b.joint("skullJaw", {
    parent: stage,
    at: [-1.08, 0.235, 0.87],
    dir: [0, 0, 1],
    role: "jaw",
  });

  // A common physical pixel pitch keeps the whole collection coherent.
  const TEXEL = 0.022;

  const woodTexture = pixelTexture(48, 40, (g) => {
    const ramp = [
      "#57362a",
      "#75422d",
      "#96582f",
      "#b27139",
      "#ce8d49",
    ];
    g.fill((x, y) => {
      if (x % 12 === 0) return "#382726";
      if (x % 12 === 1) return "#d59b53";
      const wav = Math.floor(
        1.6 + Math.sin(y * 0.24 + Math.floor(x / 12)) * 0.7,
      );
      const streak = (x + wav) % 7;
      if (streak === 0) return ramp[1];
      return ramp[2 + (textureRandom() > 0.77 ? 1 : 0)];
    });
    for (const [x, y] of [
      [7, 10],
      [29, 26],
      [42, 16],
    ]) {
      g.stamp(
        x,
        y,
        ["..dd..", ".dwwd.", "dwddwd", ".dwwd.", "..dd.."],
        { d: "#57362a", w: "#b27139" },
      );
    }
    for (let i = 0; i < 32; i++) {
      const x = Math.floor(textureRandom() * 48);
      const y = Math.floor(textureRandom() * 40);
      g.set(x, y, "#ce8d49");
      if (y + 1 < 40) g.set(x, y + 1, "#ce8d49");
    }
  });

  const stoneTexture = pixelTexture(40, 40, (g) => {
    const colors = [
      "#565c72",
      "#63697b",
      "#737787",
      "#848591",
      "#96949b",
    ];
    g.fill((x, y) => {
      if (x === 0 || y === 39) return "#3b4257";
      if (y < 2 || x === 39) return "#97959c";
      const broad =
        Math.sin(x * 0.23) * 0.7 + Math.cos(y * 0.19) * 0.5;
      const value = Math.max(
        0,
        Math.min(4, Math.floor(2 + broad + textureRandom() * 0.7)),
      );
      return colors[value];
    });
    for (let i = 0; i < 48; i++) {
      const x = Math.floor(textureRandom() * 37) + 2;
      const y = Math.floor(textureRandom() * 37) + 2;
      g.set(x, y, textureRandom() > 0.5 ? "#a19ca1" : "#495169");
    }
    g.stamp(
      8,
      12,
      [
        "...d....",
        "..d.....",
        "..d.....",
        "...d....",
        "....dd..",
        "......d.",
        "......d.",
        ".......d",
      ],
      { d: "#3c445a" },
    );
  });

  // Greyscale metal gets tinted per assembly.
  const metalTexture = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      if (x === 0 || y === 31) return "#494949";
      if (y < 2 || x === 31) return "#ededed";
      if (x === 2 || y === 29) return "#727272";
      const stripe = (x + Math.floor(y / 9)) % 13;
      if (stripe === 4) return "#bcbcbc";
      return textureRandom() < 0.05 ? "#818181" : "#9c9c9c";
    });
    for (const [x, y] of [
      [4, 4],
      [25, 4],
      [4, 25],
      [25, 25],
    ]) {
      g.stamp(x, y, ["ddd", "dwd", "ddd"], {
        d: "#555555",
        w: "#f2f2f2",
      });
    }
  });

  const boneTexture = pixelTexture(24, 24, (g) => {
    g.fill((x, y) => {
      if (y < 2) return "#fff0c4";
      if (y > 20) return "#aaa083";
      return (x + y * 3) % 19 === 0 ? "#c4b791" : "#e0d3a4";
    });
    g.stamp(
      12,
      3,
      [
        "d....",
        ".d...",
        ".d...",
        "..d..",
        "..d..",
        ".d...",
        ".d...",
        "..dd.",
        "....d",
      ],
      { d: "#9b927b" },
    );
  });

  const chestEmblem = pixelArt(
    [
      "................",
      ".....gggggg.....",
      "...ggyyyyyygg...",
      "..gyyyyyyyyyyg..",
      ".gyyywwwwwwyyyg.",
      ".gyywwwwwwwwyyg.",
      ".gyywwdwwdwwyyg.",
      ".gyywwddwwddyyg.",
      ".gyyywwddwwyyyg.",
      ".gyyyywwwwyyyyg.",
      "..gyyywdwyyyyg..",
      "...gyywdwyyyg...",
      "...gyyyyyyyyg...",
      "....ggyyyygg....",
      "......gggg......",
      "................",
    ],
    {
      g: "#80512a",
      y: "#d4a34c",
      w: "#fff0c4",
      d: "#252838",
    },
  );

  const barrelLabel = pixelTexture(24, 24, (g) => {
    g.fill((x, y) => {
      if (x < 2 || x > 21 || y < 2 || y > 21) return "";
      if (x < 4 || x > 19 || y < 4 || y > 19) return "#986438";
      return "#d9bd82";
    });
    g.stamp(
      6,
      5,
      [
        "...rrr......",
        "..rrrrr.....",
        "...rrr......",
        "....r.......",
        "..rrrrr.....",
        "............",
        "ddd..d...d..",
        ".d....d.d...",
        ".d.....d....",
        ".d....d.d...",
        "ddd..d...d..",
      ],
      { r: "#8d4136", d: "#493c35" },
    );
    g.set(5, 18, "#9b865c");
    g.set(17, 17, "#9b865c");
    g.set(16, 18, "#9b865c");
  });

  const hazardTexture = pixelArt(
    [
      "................",
      ".......rr.......",
      "......ryyr......",
      "......ryyr......",
      ".....ryyyyr.....",
      ".....ryddyr.....",
      "....ryyddyyr....",
      "....ryyddyyr....",
      "...ryyyddyyyr...",
      "...ryyyyyyyyr...",
      "..ryyyyddyyyyr..",
      "..ryyyyyyyyyyr..",
      ".rrrrrrrrrrrrrr.",
      "................",
      "................",
      "................",
    ],
    {
      r: "#8d4136",
      y: "#d4a34c",
      d: "#252838",
    },
  );

  const flameTexture = pixelArt(
    [
      "................",
      "........y.......",
      ".......yy.......",
      ".......yyo......",
      "......yyyo......",
      "...o..yyyoo.....",
      "...oo.yyyoo.....",
      "..oooyyyyooo....",
      "..oooyyyyooo....",
      "..ooyywwyyoo....",
      ".oooyywwyyooo...",
      ".ooyywwwyyyoo...",
      ".ooyywwwyyyoo...",
      ".ooywwwwwyyoo...",
      ".ooywwwwwyyooo..",
      ".ooywwwwwyyooo..",
      ".ooyywwwyyyooo..",
      "..oyywwwyyyoo...",
      "..ooyywwyyooo...",
      "..oooyyyyooo....",
      "...ooyyyyoo.....",
      "....oooooo......",
      ".....rrrr.......",
      "................",
    ],
    {
      r: "#ba392a",
      o: "#ff9138",
      y: "#ffd667",
      w: "#fff2ad",
    },
  );

  const stonePaint = cellPaint(
    0.028,
    (c) => {
      const value = 0.4 + 0.22 * c.n.y + (c.random(19) - 0.5) * 0.3;
      return c.pick(
        [C.stoneDark, "#535a70", C.stone, C.stoneLight],
        value,
      );
    },
    { dither: true },
  );

  const woodPaint = cellPaint(0.018, (c) => {
    const streak = Math.abs(Math.sin(c.at.x * 85 + c.at.z * 13));
    return c.pick(
      [C.woodDark, C.wood, C.woodLight],
      0.4 + 0.25 * c.n.y + streak * 0.15 + c.random(8) * 0.12,
    );
  });

  const ironPaint = cellPaint(0.017, (c) =>
    c.pick(
      [C.ink, C.iron, C.steel, C.silver],
      0.24 + 0.36 * Math.max(c.n.y, 0) + c.random(4) * 0.14,
    ),
  );

  const spikePaint = cellPaint(
    0.014,
    (c) => {
      if (c.at.y < 0.28 && c.random(31) < 0.34) return C.rust;
      return c.pick(
        [C.iron, C.steel, C.silver, "#f0f0dc"],
        0.45 + c.n.y * 0.21 + c.random(5) * 0.17,
      );
    },
    { dither: true },
  );

  const goldPaint = paint((p, n) =>
    mix(
      C.goldDark,
      C.goldLight,
      0.46 + 0.32 * Math.max(n.y, 0) + noise(p, 0.04, 5) * 0.2,
    ),
  );

  function box(
    at: V,
    size: V,
    color: Fill,
    bone: Joint = stage,
    rotation: V = [0, 0, 0],
    name?: string,
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      rotation,
      name,
    });
  }

  function tiledBox(
    at: V,
    size: V,
    texture: THREE.Texture,
    color: string = "#ffffff",
    bone: Joint = stage,
    rotation: V = [0, 0, 0],
    texel = TEXEL,
    name?: string,
  ) {
    return b.part(
      tileBox(size, texture, texel, {
        rand: random,
        step: texture === woodTexture ? [12, 1] : 1,
      }),
      color,
      { at, bone, rotation, texture, name },
    );
  }

  function plateDrawing(
    at: V,
    size: [number, number],
    texture: THREE.Texture,
    bone: Joint = stage,
    dir: V = [0, 0, 1],
    name?: string,
  ) {
    return b.part(new THREE.PlaneGeometry(...size), "#ffffff", {
      at,
      bone,
      dir,
      axis: "z",
      texture,
      name,
    });
  }

  function rivet(at: V, color = C.steel, bone: Joint = stage) {
    return box(at, [0.026, 0.026, 0.019], color, bone);
  }

  function uprightHoop(
    x: number,
    y: number,
    z: number,
    radius: number,
    height: number,
    color: Fill,
  ) {
    return b.lathe(
      [
        [radius - 0.017, 0],
        [radius + 0.018, 0],
        [radius + 0.018, height],
        [radius - 0.017, height],
      ],
      {
        at: [x, y, z],
        color,
        bone: stage,
        segments: 12,
        name: "barrelIronHoop",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Cutaway floor: large simple blocks, small pixel wear, no towering back wall.
  // ---------------------------------------------------------------------------

  box([0, 0.055, 0], [3.3, 0.11, 2.66], C.mortar, stage, [0, 0, 0], "foundation");

  for (let ix = 0; ix < 5; ix++) {
    for (let iz = 0; iz < 4; iz++) {
      const x = (ix - 2) * 0.645;
      const z = (iz - 1.5) * 0.645;
      tiledBox(
        [x, 0.115, z],
        [0.625, 0.07, 0.625],
        stoneTexture,
        "#ffffff",
        stage,
        [0, (ix + iz) % 2 === 0 ? 0 : 90, 0],
        0.022,
        `flagstone${ix}_${iz}`,
      );
    }
  }

  for (const s of [-1, 1]) {
    box([s * 1.622, 0.085, 0], [0.045, 0.1, 2.66], stonePaint);
    box([0, 0.085, s * 1.307], [3.2, 0.1, 0.045], stonePaint);
    for (const x of [-1.4, -0.7, 0, 0.7, 1.4]) {
      box([x, 0.07, s * 1.334], [0.043, 0.043, 0.018], C.iron);
    }
  }

  // Low rubble behind the central chest.
  for (let i = 0; i < 5; i++) {
    tiledBox(
      [-0.75 + i * 0.32, 0.245, -1.045],
      [0.305, 0.19 + (i % 2) * 0.03, 0.25],
      stoneTexture,
      "#ffffff",
      stage,
      [0, 0, 0],
      0.024,
    );
  }
  tiledBox([-0.48, 0.44, -1.045], [0.45, 0.2, 0.25], stoneTexture);
  tiledBox([0.0, 0.4, -1.045], [0.34, 0.15, 0.25], stoneTexture);

  for (let i = 0; i < 23; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const x = side * (1.32 + random() * 0.2);
    const z = -1.13 + random() * 0.52;
    box(
      [x, 0.155 + random() * 0.016, z],
      [0.028 + random() * 0.045, 0.016, 0.026 + random() * 0.045],
      i % 3 === 0 ? C.mossLight : C.moss,
    );
  }

  // ---------------------------------------------------------------------------
  // Treasure chest. The chest is a shell, not a solid box with loot stuck on it.
  // ---------------------------------------------------------------------------

  const chestFront = chestZ + 0.4;
  tiledBox(
    [chestX, 0.245, chestZ],
    [1.16, 0.17, 0.8],
    woodTexture,
    "#ffffff",
    stage,
    [0, 0, 0],
    0.021,
    "chestBottom",
  );

  tiledBox(
    [chestX, 0.56, chestFront - 0.04],
    [1.16, 0.56, 0.08],
    woodTexture,
    "#ffffff",
    stage,
    [0, 0, 0],
    0.021,
    "chestFront",
  );
  tiledBox(
    [chestX, 0.56, chestBack + 0.04],
    [1.16, 0.56, 0.08],
    woodTexture,
  );

  for (const s of [-1, 1]) {
    tiledBox(
      [chestX + s * 0.55, 0.56, chestZ],
      [0.08, 0.56, 0.66],
      woodTexture,
    );
    box(
      [chestX + s * 0.545, 0.813, chestZ],
      [0.085, 0.042, 0.81],
      C.goldDark,
    );
  }

  box([chestX, 0.808, chestZ], [1.0, 0.012, 0.59], C.woodDark);
  box([chestX, 0.316, chestZ], [1.0, 0.035, 0.59], C.woodDark);

  for (const z of [chestBack - 0.012, chestFront + 0.012]) {
    tiledBox(
      [chestX, 0.314, z],
      [1.21, 0.073, 0.044],
      metalTexture,
      C.iron,
    );
    tiledBox(
      [chestX, 0.812, z],
      [1.21, 0.052, 0.044],
      metalTexture,
      C.gold,
    );

    for (const s of [-1, 1]) {
      const x = chestX + s * 0.397;
      tiledBox([x, 0.555, z], [0.082, 0.52, 0.046], metalTexture, C.iron);
      for (const y of [0.35, 0.53, 0.75]) {
        rivet([x, y, z + (z > chestZ ? 0.027 : -0.027)], C.gold);
      }
    }
  }

  for (const s of [-1, 1]) {
    for (const z of [chestBack + 0.015, chestFront - 0.015]) {
      tiledBox(
        [chestX + s * 0.559, 0.355, z],
        [0.071, 0.13, 0.125],
        metalTexture,
        C.iron,
      );
    }
    box([chestX + s * 0.449, 0.194, chestBack + 0.11], [0.19, 0.088, 0.18], C.woodDark);
    box([chestX + s * 0.449, 0.194, chestFront - 0.11], [0.19, 0.088, 0.18], C.woodDark);

    // Rectangular wrought-iron carrying handles.
    const sideX = chestX + s * 0.612;
    box([sideX, 0.6, chestZ - 0.13], [0.045, 0.075, 0.065], C.goldDark);
    box([sideX, 0.6, chestZ + 0.13], [0.045, 0.075, 0.065], C.goldDark);
    box([sideX + s * 0.048, 0.572, chestZ - 0.13], [0.052, 0.045, 0.046], C.iron);
    box([sideX + s * 0.048, 0.572, chestZ + 0.13], [0.052, 0.045, 0.046], C.iron);
    box([sideX + s * 0.068, 0.524, chestZ], [0.043, 0.042, 0.3], C.iron);
  }

  tiledBox(
    [chestX, 0.673, chestFront + 0.045],
    [0.225, 0.275, 0.035],
    metalTexture,
    C.goldDark,
  );
  plateDrawing(
    [chestX, 0.679, chestFront + 0.065],
    [0.232, 0.257],
    chestEmblem,
    stage,
    [0, 0, 1],
    "skullLockEscutcheon",
  );
  box([chestX, 0.55, chestFront + 0.07], [0.08, 0.042, 0.042], C.gold);
  box([chestX, 0.552, chestFront + 0.094], [0.024, 0.018, 0.009], C.ink);

  // The roof is a thick angular arch with a genuinely hollow underside.
  const archShell: OutlinePoint[] = [
    [0, 0],
    [0, 0.075],
    [0.105, 0.205],
    [0.28, 0.3],
    [0.52, 0.3],
    [0.695, 0.205],
    [0.8, 0.075],
    [0.8, 0],
    [0.745, 0.035],
    [0.655, 0.15],
    [0.5, 0.232],
    [0.3, 0.232],
    [0.145, 0.15],
    [0.055, 0.035],
  ];
  const archEnd: OutlinePoint[] = [
    [0, 0],
    [0, 0.075],
    [0.105, 0.205],
    [0.28, 0.3],
    [0.52, 0.3],
    [0.695, 0.205],
    [0.8, 0.075],
    [0.8, 0],
  ];

  b.extrude(archShell, {
    at: [chestX, 0.84, chestBack],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 1.17,
    color: woodPaint,
    bone: lid,
    name: "angularChestLid",
  });

  for (const s of [-1, 1]) {
    b.extrude(archEnd, {
      at: [chestX + s * 0.556, 0.84, chestBack],
      thickness: 0.055,
      color: woodPaint,
      bone: lid,
    });
    b.extrude(archShell, {
      at: [chestX + s * 0.397, 0.843, chestBack - 0.004],
      thickness: 0.079,
      color: ironPaint,
      bone: lid,
      name: "lidIronBand",
    });
    box(
      [chestX + s * 0.397, 0.871, chestFront + 0.014],
      [0.079, 0.052, 0.031],
      C.gold,
      lid,
    );
    for (const z of [0.06, 0.25, 0.55, 0.74]) {
      const y =
        z < 0.12 || z > 0.68
          ? 0.944
          : z < 0.28 || z > 0.52
            ? 1.101
            : 1.153;
      box(
        [chestX + s * 0.397, y, chestBack + z],
        [0.027, 0.024, 0.027],
        C.goldLight,
        lid,
      );
    }
  }

  for (const z of [chestBack, chestFront]) {
    box([chestX, 0.853, z], [1.21, 0.045, 0.044], C.goldDark, lid);
  }
  for (const s of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.16, 8), C.goldDark, {
      at: [chestX + s * 0.397, 0.846, chestBack - 0.025],
      bone: stage,
      dir: [1, 0, 0],
    });
    box(
      [chestX + s * 0.397, 0.9, chestBack + 0.035],
      [0.08, 0.12, 0.025],
      C.iron,
      lid,
    );
  }

  // Lift the front while leaving the back edge on its hinge.
  b.pose(lid, { axis: [1, 0, 0], deg: -32 });

  // Treasure sits below the open lid, inside the chest.
  box([chestX, 0.783, chestZ], [0.94, 0.055, 0.55], C.goldDark);

  for (let i = 0; i < 19; i++) {
    const x = chestX - 0.43 + random() * 0.86;
    const z = chestZ - 0.22 + random() * 0.44;
    const count = 1 + Math.floor(random() * 3);
    const radius = 0.038 + random() * 0.018;
    for (let j = 0; j < count; j++) {
      b.part(
        new THREE.CylinderGeometry(radius, radius, 0.013, 8),
        goldPaint,
        {
          at: [x, 0.821 + j * 0.014, z],
          bone: stage,
          rotation: [0, i * 27, 0],
          name: "treasureCoin",
        },
      );
    }
  }

  for (const gem of [
    { at: [chestX - 0.29, 0.902, chestZ + 0.16] as V, r: 0.085, c: C.cyan },
    { at: [chestX + 0.22, 0.898, chestZ - 0.13] as V, r: 0.067, c: C.violet },
    { at: [chestX + 0.05, 0.883, chestZ + 0.16] as V, r: 0.057, c: C.cyan },
  ]) {
    glow(
      b.part(new THREE.OctahedronGeometry(gem.r, 0), gem.c, {
        at: gem.at,
        bone: stage,
        rotation: [8, 28, 17],
        flat: true,
        name: "cutTreasureGem",
      }),
      0.65,
    );
  }

  // One tiny stoppered alchemical bottle.
  b.lathe(
    [
      [0, 0],
      [0.051, 0],
      [0.061, 0.055],
      [0.058, 0.11],
      [0.027, 0.142],
      [0.027, 0.184],
      [0, 0.184],
    ],
    {
      at: [chestX + 0.34, 0.835, chestZ + 0.12],
      color: C.cyanDark,
      bone: stage,
      segments: 8,
      name: "lootPotion",
    },
  );
  glow(
    box(
      [chestX + 0.34, 0.918, chestZ + 0.178],
      [0.058, 0.047, 0.012],
      C.cyan,
    ),
    0.65,
  );
  box([chestX + 0.34, 1.026, chestZ + 0.12], [0.057, 0.035, 0.057], C.woodLight);

  // ---------------------------------------------------------------------------
  // Two barrels: stepped stave profiles, inset tops, chunky hoops and rivets.
  // ---------------------------------------------------------------------------

  function barrel(x: number, z: number, scale: number, label: boolean) {
    const bottom = 0.15;
    const h = 0.78 * scale;
    const r = 0.285 * scale;

    b.lathe(
      [
        [0, 0],
        [r * 0.81, 0],
        [r * 0.94, h * 0.2],
        [r, h * 0.5],
        [r * 0.94, h * 0.8],
        [r * 0.81, h],
        [0, h],
      ],
      {
        at: [x, bottom, z],
        segments: 12,
        color: C.woodDark,
        bone: stage,
        name: "barrelCore",
      },
    );

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const degrees = (angle * 180) / Math.PI;
      const rows = [
        { y: h * 0.145, h: h * 0.29, r: r * 0.87 },
        { y: h * 0.5, h: h * 0.42, r: r * 0.98 },
        { y: h * 0.855, h: h * 0.29, r: r * 0.87 },
      ];
      for (const row of rows) {
        tiledBox(
          [
            x + Math.sin(angle) * row.r,
            bottom + row.y,
            z + Math.cos(angle) * row.r,
          ],
          [
            2 * row.r * Math.tan(Math.PI / 12) * 0.955,
            row.h,
            0.047 * scale,
          ],
          woodTexture,
          "#ffffff",
          stage,
          [0, degrees, 0],
          0.016 * scale,
          "barrelStave",
        );
      }
    }

    for (const t of [0.13, 0.51, 0.87]) {
      const hoopR = r * (t === 0.51 ? 1.07 : 0.96);
      const yy = bottom + h * t - 0.024 * scale;
      uprightHoop(x, yy, z, hoopR, 0.05 * scale, ironPaint);

      b.ring(
        frame([x, yy + 0.026 * scale, z], [0, 1, 0]),
        { count: 12, radius: hoopR + 0.019 },
        (item) => {
          b.stick(
            new THREE.BoxGeometry(
              0.023 * scale,
              0.014 * scale,
              0.023 * scale,
            ),
            C.steel,
            item,
            { embed: 0.35, name: "hoopRivet" },
          );
        },
      );
    }

    const topY = bottom + h + 0.001;
    b.part(
      new THREE.CylinderGeometry(r * 0.83, r * 0.83, 0.023, 12),
      woodPaint,
      { at: [x, topY - 0.013, z], bone: stage, name: "barrelTop" },
    );

    for (let i = -2; i <= 2; i++) {
      const zz = i * r * 0.3;
      const half = Math.sqrt(Math.max(0.001, (r * 0.78) ** 2 - zz ** 2));
      box(
        [x, topY + 0.001, z + zz],
        [half * 2, 0.006, 0.009],
        C.woodDark,
      );
    }

    box([x, topY + 0.007, z], [r * 1.65, 0.018, 0.043 * scale], C.iron);
    for (const s of [-1, 1]) {
      box(
        [x + s * r * 0.62, topY + 0.02, z],
        [0.026, 0.012, 0.026],
        C.steel,
      );
    }
    b.part(new THREE.CylinderGeometry(0.037 * scale, 0.04 * scale, 0.022, 6), C.goldDark, {
      at: [x + r * 0.28, topY + 0.02, z + r * 0.32],
      bone: stage,
    });

    if (label) {
      box([x, bottom + h * 0.66, z + r + 0.028], [0.21 * scale, 0.205 * scale, 0.015], C.woodDark);
      plateDrawing(
        [x, bottom + h * 0.66, z + r + 0.037],
        [0.21 * scale, 0.205 * scale],
        barrelLabel,
      );
    }
  }

  barrel(0.76, -0.63, 1, true);
  barrel(1.275, -0.305, 0.73, true);

  // ---------------------------------------------------------------------------
  // Torch pillars and torches. Pixel fire is supported by solid ember shapes.
  // ---------------------------------------------------------------------------

  function torchPillar(x: number, z: number, variant: number) {
    tiledBox([x, 0.2, z], [0.47, 0.1, 0.43], stoneTexture);
    for (let course = 0; course < 4; course++) {
      const yy = 0.375 + course * 0.25;
      if (course % 2 === 0) {
        for (const s of [-1, 1]) {
          tiledBox(
            [x + s * 0.105, yy, z],
            [0.2, 0.235, 0.31],
            stoneTexture,
            "#ffffff",
            stage,
            [0, 0, 0],
            0.018,
          );
        }
      } else {
        tiledBox([x, yy, z], [0.41, 0.235, 0.31], stoneTexture);
      }
    }
    tiledBox([x, 1.3, z], [0.47, 0.09, 0.39], stoneTexture);

    const faceZ = z + 0.19;
    tiledBox([x, 1.025, faceZ], [0.135, 0.25, 0.027], metalTexture, C.iron);
    for (const dy of [-0.077, 0.077]) {
      rivet([x, 1.025 + dy, faceZ + 0.022], C.steel);
    }

    box([x, 0.986, z + 0.29], [0.051, 0.047, 0.24], C.iron);
    box([x, 1.038, z + 0.394], [0.055, 0.145, 0.049], C.iron);

    const shaftZ = z + 0.39;
    tiledBox(
      [x, 1.24, shaftZ],
      [0.065, 0.4, 0.065],
      woodTexture,
      "#ffffff",
      stage,
      [0, 0, 0],
      0.009,
      "torchHandle",
    );

    for (const yy of [1.105, 1.35]) {
      box([x, yy, shaftZ], [0.091, 0.041, 0.091], C.iron);
    }

    b.lathe(
      [
        [0.036, 0],
        [0.055, 0],
        [0.093, 0.115],
        [0.075, 0.115],
      ],
      {
        at: [x, 1.383, shaftZ],
        segments: 8,
        color: ironPaint,
        bone: stage,
        name: "torchBasket",
      },
    );

    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      box(
        [x + Math.sin(a) * 0.073, 1.47, shaftZ + Math.cos(a) * 0.073],
        [0.022, 0.14, 0.022],
        C.iron,
      );
    }

    glow(box([x, 1.494, shaftZ], [0.118, 0.057, 0.118], C.ember), 1.4);
    glow(box([x, 1.57, shaftZ], [0.104, 0.12, 0.095], C.orange), 1.25);
    glow(box([x + 0.009, 1.642, shaftZ + 0.01], [0.064, 0.112, 0.058], C.yellow), 1.6);

    glow(
      b.cards(
        [frame([x, 1.49, shaftZ], [0, 1, 0])],
        flameTexture,
        {
          size: [0.255, 0.405 + variant * 0.022],
          flow: [0, 0, 1],
          cross: true,
          sink: 0,
          bone: stage,
          name: "pixelTorchFlame",
        },
      ),
      1.5,
    );

    for (let i = 0; i < 3; i++) {
      glow(
        box(
          [
            x + (i - 1) * 0.071,
            1.824 + i * 0.056,
            shaftZ + (i % 2 ? -0.025 : 0.017),
          ],
          [0.017, 0.025, 0.017],
          i % 2 ? C.orange : C.yellow,
        ),
        1.35,
      );
    }
  }

  torchPillar(-1.29, -0.91, 0);
  torchPillar(1.285, -1.035, 1);

  // ---------------------------------------------------------------------------
  // Spike trap: recessed checkerboard sockets, thick frame and warning plaque.
  // ---------------------------------------------------------------------------

  const trapX = 0.92;
  const trapZ = 0.765;

  box([trapX, 0.171, trapZ], [0.985, 0.045, 0.985], C.ink, stage, [0, 0, 0], "trapRecess");
  tiledBox([trapX, 0.192, trapZ], [0.925, 0.03, 0.925], metalTexture, C.iron);

  for (const s of [-1, 1]) {
    tiledBox(
      [trapX + s * 0.458, 0.214, trapZ],
      [0.045, 0.036, 0.95],
      metalTexture,
      C.goldDark,
    );
    tiledBox(
      [trapX, 0.214, trapZ + s * 0.458],
      [0.91, 0.036, 0.045],
      metalTexture,
      C.goldDark,
    );
    for (const t of [-0.35, 0, 0.35]) {
      box([trapX + t, 0.239, trapZ + s * 0.458], [0.028, 0.017, 0.028], C.steel);
      box([trapX + s * 0.458, 0.239, trapZ + t], [0.028, 0.017, 0.028], C.steel);
    }
  }

  for (let ix = -1; ix <= 1; ix++) {
    for (let iz = -1; iz <= 1; iz++) {
      const x = trapX + ix * 0.278;
      const z = trapZ + iz * 0.278;
      box([x, 0.212, z], [0.201, 0.022, 0.201], C.ink);
      box([x, 0.229, z], [0.147, 0.022, 0.147], C.iron);
      const height = 0.295 + ((ix + iz + 2) % 3) * 0.022;
      b.part(new THREE.ConeGeometry(0.09, height, 4, 1), spikePaint, {
        at: [x, 0.239 + height / 2, z],
        bone: stage,
        rotation: [0, 45, 0],
        flat: true,
        name: `trapSpike${ix + 1}_${iz + 1}`,
      });
      box([x - 0.043, 0.247, z + 0.051], [0.024, 0.009, 0.024], C.rust);
    }
  }

  tiledBox(
    [trapX, 0.172, trapZ + 0.503],
    [0.24, 0.073, 0.025],
    metalTexture,
    C.iron,
  );
  plateDrawing(
    [trapX, 0.178, trapZ + 0.518],
    [0.104, 0.066],
    hazardTexture,
    stage,
    [0, 0, 1],
    "trapWarning",
  );

  // ---------------------------------------------------------------------------
  // Bone pile and a small squared-off skull; empty sockets, separate lower jaw.
  // ---------------------------------------------------------------------------

  function longBone(a: V, end: V, radius = 0.027) {
    b.frustumBox(
      a,
      end,
      [radius * 1.28, radius * 1.15],
      [radius * 1.05, radius * 1.02],
      {
        color: C.bone,
        bone: stage,
        name: "scatteredBoneShaft",
      },
    );

    const direction = new THREE.Vector3(
      end[0] - a[0],
      0,
      end[2] - a[2],
    ).normalize();
    const across = new THREE.Vector3(direction.z, 0, -direction.x);
    for (const p of [a, end]) {
      for (const s of [-1, 1]) {
        tiledBox(
          [
            p[0] + across.x * radius * 0.58 * s,
            p[1],
            p[2] + across.z * radius * 0.58 * s,
          ],
          [radius * 1.55, radius * 1.65, radius * 1.55],
          boneTexture,
          "#ffffff",
          stage,
          [0, (Math.atan2(direction.x, direction.z) * 180) / Math.PI, 0],
          0.007,
          "boneKnuckle",
        );
      }
    }
  }

  longBone([-1.36, 0.195, 0.56], [-1.02, 0.195, 0.67], 0.027);
  longBone([-1.37, 0.199, 0.975], [-1.02, 0.199, 1.11], 0.029);
  longBone([-0.9, 0.193, 0.66], [-0.69, 0.193, 0.925], 0.025);
  longBone([-1.26, 0.207, 1.12], [-0.96, 0.207, 0.99], 0.025);
  longBone([-0.785, 0.194, 1.095], [-0.59, 0.194, 1.04], 0.023);

  for (let i = 0; i < 3; i++) {
    const x = -1.31 + i * 0.08;
    b.sweep(
      [
        [x, 0.19, 0.29],
        [x - 0.065, 0.19, 0.345],
        [x - 0.08, 0.19, 0.43],
        [x - 0.035, 0.19, 0.48],
      ],
      0.015,
      {
        bone: stage,
        section: "box",
        caps: "flat",
        color: C.boneShade,
        name: "looseRib",
      },
    );
  }

  const sx = -1.08;
  const sz = 0.865;
  tiledBox([sx, 0.397, sz - 0.055], [0.27, 0.216, 0.105], boneTexture, "#ffffff", stage, [0, 0, 0], 0.011, "skullRear");
  tiledBox([sx, 0.47, sz + 0.025], [0.272, 0.086, 0.205], boneTexture);
  tiledBox([sx, 0.503, sz - 0.005], [0.213, 0.028, 0.151], boneTexture);

  // Darkness is recessed behind the solid brow, temples and bridge.
  box([sx - 0.064, 0.379, sz + 0.058], [0.083, 0.094, 0.034], C.ink);
  box([sx + 0.064, 0.379, sz + 0.058], [0.083, 0.094, 0.034], C.ink);

  for (const s of [-1, 1]) {
    tiledBox([sx + s * 0.111, 0.375, sz + 0.033], [0.051, 0.115, 0.15], boneTexture);
    tiledBox([sx + s * 0.087, 0.321, sz + 0.072], [0.088, 0.042, 0.108], boneTexture);
    box([sx + s * 0.067, 0.427, sz + 0.112], [0.09, 0.022, 0.029], C.boneLight);
  }

  tiledBox([sx, 0.388, sz + 0.087], [0.041, 0.091, 0.068], boneTexture);
  box([sx, 0.313, sz + 0.11], [0.035, 0.037, 0.027], C.ink);
  box([sx, 0.291, sz + 0.095], [0.168, 0.025, 0.073], C.bone);

  for (let i = 0; i < 5; i++) {
    box(
      [sx + (i - 2) * 0.033, 0.268, sz + 0.118],
      [0.024, 0.037 - (i % 2) * 0.006, 0.035],
      C.boneLight,
    );
  }

  tiledBox(
    [sx, 0.214, sz + 0.05],
    [0.216, 0.046, 0.166],
    boneTexture,
    "#ffffff",
    skullJaw,
  );
  for (const s of [-1, 1]) {
    box(
      [sx + s * 0.091, 0.238, sz - 0.013],
      [0.036, 0.086, 0.063],
      C.boneShade,
      skullJaw,
    );
  }
  for (let i = 0; i < 5; i++) {
    box(
      [sx + (i - 2) * 0.033, 0.243, sz + 0.116],
      [0.024, 0.025, 0.033],
      C.bone,
      skullJaw,
    );
  }

  // Two small chips and a dropped coin tie the groups into the same room.
  tiledBox([-0.44, 0.171, 0.87], [0.084, 0.039, 0.062], stoneTexture, "#ffffff", stage, [0, 18, 0]);
  tiledBox([0.29, 0.171, 0.61], [0.072, 0.039, 0.092], stoneTexture, "#ffffff", stage, [0, -17, 0]);
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.014, 8), goldPaint, {
    at: [-0.205, 0.158, 0.68],
    bone: stage,
    name: "droppedCoin",
  });

  return b.root;
}
