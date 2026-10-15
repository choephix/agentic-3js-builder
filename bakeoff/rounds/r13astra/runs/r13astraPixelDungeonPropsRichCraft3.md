```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import {
  pixelArt,
  pixelTexture,
  tileBox,
  stepped,
  cellPaint,
} from "agentic-3js-builder/kits/pixel";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dungeon Inventory — Pixel Art",
  description:
    "A chunky pixel-art dungeon prop collection: an open ironbound treasure chest, two stave barrels, standing fire torches, scattered bones and a raised spike-trap mechanism.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "pixelDungeonProps", paintSize: 1024 });
  const root = b.joint("props", { at: [0, 0, 0] });
  const random = rng(4827);

  type V = [number, number, number];

  const C = {
    ink: "#20212c",
    ironDark: "#303442",
    iron: "#535967",
    ironLight: "#89919a",
    edge: "#b0b4ad",
    woodDark: "#3c2423",
    wood: "#71432d",
    woodLight: "#a76a3c",
    woodBright: "#cc9353",
    goldDark: "#90602b",
    gold: "#e6ad38",
    goldLight: "#ffe17a",
    boneDark: "#a79b80",
    bone: "#d5ccb0",
    boneLight: "#f5e6bf",
    cloth: "#492739",
    red: "#bb4938",
    stoneDark: "#343b45",
    stone: "#626976",
    stoneLight: "#858c92",
  };

  // All drawings share a hard-edged, deliberately limited pixel palette.
  const WOOD = pixelTexture(64, 64, (g) => {
    const r = rng(29);
    g.fill((x, y) => {
      const band = Math.floor(x / 9);
      const v = (x + band * 3) % 9;
      if (v === 0) return "#5a3428";
      if (v === 1) return "#a56a3d";
      return ["#875232", "#925c36", "#7a472e"][band % 3];
    });
    for (let i = 0; i < 110; i++) {
      const x = Math.floor(r() * 64);
      const y = Math.floor(r() * 64);
      const len = 2 + Math.floor(r() * 9);
      for (let j = 0; j < len; j++) {
        g.set(x, y + j, i % 4 === 0 ? "#bc8047" : "#633b2b");
      }
    }
    g.stamp(
      28,
      22,
      ["..dd...", ".dwwd..", "dwlwwd.", "dwddwd.", ".dwwd..", "..dd..."],
      { d: "#5a3428", w: "#925c36", l: "#c08a4c" },
    );
  });

  const BARREL_WOOD = pixelTexture(32, 64, (g) => {
    const r = rng(75);
    g.fill((x) => {
      if (x % 8 === 0) return "#54362b";
      if (x % 8 === 1) return "#b8864a";
      return ["#967040", "#a17a45", "#8c643b"][Math.floor(x / 8) % 3];
    });
    for (let i = 0; i < 65; i++) {
      const x = Math.floor(r() * 32);
      const y = Math.floor(r() * 64);
      for (let j = 0; j < 2 + Math.floor(r() * 10); j++) {
        g.set(x, y + j, i % 3 === 0 ? "#c39a59" : "#765234");
      }
    }
  });

  const IRON = pixelTexture(32, 32, (g) => {
    const r = rng(61);
    g.fill((_x, y) => (y % 8 === 0 ? "#666e7b" : "#515764"));
    for (let i = 0; i < 80; i++) {
      const x = Math.floor(r() * 32);
      const y = Math.floor(r() * 32);
      g.set(x, y, i % 3 ? "#424852" : "#7c8490");
      if (i % 4 === 0) g.set(x + 1, y, "#7c8490");
    }
    g.stamp(19, 21, ["rr..", ".rr.", "..d."], {
      r: "#8e6748",
      d: "#594434",
    });
  });

  const STONE = pixelTexture(48, 48, (g) => {
    const r = rng(87);
    g.fill((_x, y) => (y < 3 ? "#828991" : "#606875"));
    for (let i = 0; i < 140; i++) {
      const x = Math.floor(r() * 48);
      const y = Math.floor(r() * 48);
      const color = ["#515966", "#727c87", "#656d78"][i % 3];
      g.set(x, y, color);
      if (i % 2 === 0) g.set(x + 1, y, color);
    }
    g.stamp(6, 15, ["d.....", ".d....", ".dd...", "...d..", "...dd.", ".....d"], {
      d: "#414955",
    });
    g.stamp(29, 33, ["...d", "..d.", "dd..", ".d.."], { d: "#414955" });
  });

  const LINING = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      if ((x + y) % 7 === 0) return "#623746";
      if ((x - y + 32) % 11 === 0) return "#321f31";
      return "#492739";
    });
    for (let x = 2; x < 32; x += 4) {
      g.set(x, 1, "#bc8d52");
      g.set(x, 30, "#bc8d52");
    }
  });

  const BONE = pixelTexture(24, 24, (g) => {
    g.fill((_x, y) =>
      y < 4 ? "#f5e6bf" : y > 18 ? "#b8aa8a" : "#d5ccb0",
    );
    g.stamp(5, 8, ["d...", ".d..", ".d..", "..d.", "..dd"], { d: "#b6a585" });
    g.stamp(16, 3, ["ll", ".l", ".."], { l: "#fff0cd" });
    g.stamp(14, 18, ["ddd", ".d."], { d: "#a7987d" });
  });

  const COIN = pixelArt(
    [
      "....dddd....",
      "..ddyyyydd..",
      ".dyylllllyd.",
      ".dyllyyylyd.",
      "dylyylllylyd",
      "dylylyyylyyd",
      "dylyylllyyyd",
      "dyylyyylyyyd",
      ".dylllllyyd.",
      ".dyyyyyyyyd.",
      "..ddyyyydd..",
      "....dddd....",
    ],
    { d: "#986327", y: "#e6ad38", l: "#ffe789" },
  );

  const SEAL = pixelArt(
    [
      "................",
      "......gggg......",
      "....ggyyyygg....",
      "...gyyywwyyyg...",
      "..gyyywwwwyyyg..",
      "..gyyywddwyyyg..",
      ".gyyyywddwyyyyg.",
      ".gyyyywwwwyyyyg.",
      ".gyyyyywwyyyyyg.",
      ".gyyyyywwyyyyyg.",
      "..gyyywwwwyyyg..",
      "..gyyyyyyyyyyg..",
      "...gyyyyyyyyg...",
      "....ggyyyygg....",
      "......gggg......",
      "................",
    ],
    {
      g: "#a77432",
      y: "#e9bd57",
      w: "#fff0ab",
      d: "#5b3e31",
    },
  );

  const danger = pixelArt(
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
    { r: "#5f302c", y: "#c9954a", d: "#252630" },
  );

  function box(
    name: string,
    at: V,
    size: V,
    color: string,
    texture?: THREE.Texture,
    rotation: V = [0, 0, 0],
    texel = 0.025,
  ) {
    return b.part(
      texture
        ? tileBox(size, texture, texel, { rand: random })
        : new THREE.BoxGeometry(...size),
      color,
      { at, rotation, texture, bone: root, name },
    );
  }

  function rivet(name: string, at: V, size = 0.035, rotation: V = [0, 0, 0]) {
    box(name, at, [size, size, size * 0.45], C.ironLight, undefined, rotation);
  }

  function frontDrawing(
    name: string,
    at: V,
    size: [number, number],
    texture: THREE.Texture,
    dir: V = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(...size), "#ffffff", {
      at,
      bone: root,
      name,
      dir,
      axis: "z",
      texture,
    });
  }

  // CHEST ------------------------------------------------------------------
  // A hollow assembly, not a solid box with treasure sitting on its roof.
  const chestZ = -0.64;
  const chestWidth = 1.22;
  const chestDepth = 0.76;
  const chestFront = chestZ + chestDepth / 2;
  const chestBack = chestZ - chestDepth / 2;

  for (const s of [-1, 1]) {
    for (const z of [chestBack + 0.1, chestFront - 0.1]) {
      box("chest_ironFoot", [s * 0.49, 0.07, z], [0.19, 0.14, 0.19], C.ironDark, IRON);
      box("chest_footToe", [s * 0.49, 0.025, z], [0.22, 0.05, 0.21], C.ink);
    }
  }

  box("chest_bottom", [0, 0.17, chestZ], [1.19, 0.14, 0.73], C.wood, WOOD);
  box("chest_velvetWell", [0, 0.25, chestZ], [1.07, 0.05, 0.62], C.cloth, LINING);

  for (let i = 0; i < 10; i++) {
    const x = -0.54 + i * 0.12;
    box("chest_frontPlank", [x, 0.46, chestFront], [0.116, 0.48, 0.065], C.wood, WOOD);
    box("chest_backPlank", [x, 0.46, chestBack], [0.116, 0.48, 0.065], C.wood, WOOD);
  }
  for (const s of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      box(
        "chest_sidePlank",
        [s * 0.585, 0.46, chestBack + 0.065 + i * 0.126],
        [0.07, 0.48, 0.12],
        C.wood,
        WOOD,
      );
    }
    box("chest_sideInnerLining", [s * 0.542, 0.46, chestZ], [0.012, 0.39, 0.64], C.cloth, LINING);
    for (const z of [chestFront, chestBack]) {
      box("chest_cornerAngle", [s * 0.574, 0.47, z], [0.115, 0.52, 0.085], C.iron, IRON);
    }
  }

  for (const y of [0.23, 0.695]) {
    box("chest_frontRail", [0, y, chestFront + 0.015], [1.29, 0.075, 0.105], C.iron, IRON);
    box("chest_backRail", [0, y, chestBack - 0.015], [1.29, 0.075, 0.105], C.iron, IRON);
    for (const s of [-1, 1]) {
      box("chest_sideRail", [s * 0.606, y, chestZ], [0.08, 0.075, 0.76], C.iron, IRON);
    }
  }

  for (const x of [-0.39, 0.39]) {
    box("chest_frontStrap", [x, 0.46, chestFront + 0.045], [0.105, 0.46, 0.035], C.ironDark, IRON);
    for (const y of [0.285, 0.435, 0.62]) {
      rivet("chest_strapRivet", [x, y, chestFront + 0.071]);
    }
  }
  for (const x of [-0.57, -0.18, 0.18, 0.57]) {
    for (const y of [0.23, 0.695]) {
      rivet("chest_railRivet", [x, y, chestFront + 0.075], 0.028);
    }
  }

  // Substantial square lock with a legible black keyhole.
  box("chest_lockBacking", [0, 0.48, chestFront + 0.074], [0.225, 0.26, 0.065], C.ink);
  box("chest_lockBrass", [0, 0.485, chestFront + 0.112], [0.18, 0.205, 0.025], C.gold);
  box("chest_lockHighlight", [-0.066, 0.49, chestFront + 0.128], [0.018, 0.175, 0.008], C.goldLight);
  box("chest_keyholeHead", [0, 0.51, chestFront + 0.129], [0.05, 0.05, 0.009], C.ink);
  box("chest_keyholeStem", [0, 0.466, chestFront + 0.129], [0.025, 0.05, 0.009], C.ink);
  box("chest_latch", [0, 0.665, chestFront + 0.09], [0.072, 0.125, 0.05], C.goldDark);

  // Local lid coordinates: u across, v from the rear hinge toward the lid lip,
  // w through its thickness. Opening it reveals the lined underside.
  const lidAngle = -112 * Math.PI / 180;
  const hinge: V = [0, 0.76, chestBack];
  function lidPoint(u: number, v: number, w = 0): V {
    return [
      hinge[0] + u,
      hinge[1] + w * Math.cos(lidAngle) - v * Math.sin(lidAngle),
      hinge[2] + w * Math.sin(lidAngle) + v * Math.cos(lidAngle),
    ];
  }
  function lidBox(name: string, u: number, v: number, w: number, size: V, color: string, texture?: THREE.Texture) {
    return box(name, lidPoint(u, v, w), size, color, texture, [-112, 0, 0]);
  }

  for (const x of [-0.4, 0.4]) {
    box("chest_hingeBlock", [x, 0.747, chestBack - 0.02], [0.21, 0.1, 0.13], C.ironDark, IRON);
    b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.24, 8), C.ironLight, {
      bone: root,
      at: [x, 0.76, chestBack],
      dir: [1, 0, 0],
      name: "chest_hingePin",
    });
  }

  for (let i = 0; i < 10; i++) {
    lidBox("chest_lidBoard", -0.54 + i * 0.12, 0.38, 0, [0.117, 0.075, 0.76], C.wood, WOOD);
  }
  lidBox("chest_lidLining", 0, 0.38, -0.044, [1.08, 0.012, 0.62], C.cloth, LINING);
  for (const x of [-0.61, 0.61, -0.39, 0.39]) {
    lidBox("chest_lidLongBand", x, 0.38, 0, [0.075, 0.105, 0.81], C.iron, IRON);
  }
  for (const v of [0, 0.76]) {
    lidBox("chest_lidCrossBand", 0, v, 0, [1.3, 0.115, 0.075], C.iron, IRON);
    for (const u of [-0.57, -0.39, 0.39, 0.57]) {
      lidBox("chest_lidStud", u, v, -0.065, [0.028, 0.018, 0.028], C.ironLight);
    }
  }

  const lidNormal: V = [0, -Math.cos(lidAngle), -Math.sin(lidAngle)];
  b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", {
    at: lidPoint(0, 0.4, -0.052),
    bone: root,
    dir: lidNormal,
    axis: "z",
    texture: SEAL,
    name: "chest_lidKeyEmblem",
  });

  // A shallow stepped treasure heap lets the hollow walls remain readable.
  box("chest_coinBed", [0, 0.37, chestZ], [0.95, 0.13, 0.55], C.goldDark);
  for (let i = 0; i < 27; i++) {
    const x = (random() - 0.5) * 0.91;
    const z = chestZ + (random() - 0.5) * 0.48;
    const h = 0.045 + Math.floor(random() * 3) * 0.025;
    const y = 0.45 + h / 2 + (1 - Math.abs(x) / 0.5) * 0.06;
    const side = 0.065 + Math.floor(random() * 3) * 0.018;
    const angle = Math.floor(random() * 4) * 90;
    box("chest_goldCoinStack", [x, y, z], [side, h, side], i % 3 ? C.gold : C.goldLight, undefined, [0, angle, 0]);
    b.part(new THREE.PlaneGeometry(side, side), "#ffffff", {
      at: [x, y + h / 2 + 0.001, z],
      dir: [0, 1, 0],
      axis: "z",
      bone: root,
      texture: COIN,
      name: "chest_stampedCoin",
    });
  }

  for (const [x, z, color] of [
    [-0.23, chestZ + 0.1, "#29a7a4"],
    [0.21, chestZ - 0.06, "#ba405c"],
  ] as [number, number, string][]) {
    box("chest_gemMount", [x, 0.565, z], [0.13, 0.045, 0.13], C.goldDark);
    b.part(new THREE.OctahedronGeometry(0.09, 0), color, {
      at: [x, 0.625, z],
      bone: root,
      name: "chest_cutGem",
      scale: [0.75, 1, 0.75],
    });
  }

  // BARRELS ----------------------------------------------------------------
  // Eight broad angular staves preserve the puppet-like primitive silhouette.
  function barrel(name: string, x: number, z: number, height: number, radius: number) {
    const ringCount = 8;
    const stavePaint = cellPaint(0.022, (c) => {
      const lit = c.n.y > 0.5 ? 1 : 0;
      const v = c.random(31);
      return lit
        ? (v < 0.25 ? "#c29354" : "#ac8047")
        : (v < 0.16 ? "#785134" : v > 0.8 ? "#ad8147" : "#956b3d");
    });

    b.lathe(
      [
        [0, 0.025],
        [radius * 0.83, 0.025],
        [radius * 0.98, height * 0.29],
        [radius, height * 0.5],
        [radius * 0.97, height * 0.73],
        [radius * 0.83, height - 0.035],
        [0, height - 0.035],
      ],
      { at: [x, 0, z], segments: 8, color: stavePaint, bone: root, name: `${name}_staveBody` },
    );

    // Dark seams are actual narrow strips, not dense geometry noise.
    for (let i = 0; i < ringCount; i++) {
      const a = (i * Math.PI * 2) / ringCount;
      const sx = Math.sin(a);
      const sz = Math.cos(a);
      const p = (y: number, r: number): V => [x + sx * r, y, z + sz * r];
      b.sweep(
        [
          p(0.04, radius * 0.84),
          p(height * 0.29, radius * 0.985),
          p(height * 0.5, radius * 1.005),
          p(height * 0.73, radius * 0.975),
          p(height - 0.035, radius * 0.84),
        ],
        0.0065,
        { color: "#533a2b", sides: 4, bone: root, caps: "flat", name: `${name}_staveSeam` },
      );
    }

    for (const [cy, r, h] of [
      [height * 0.12, radius * 0.9, 0.085],
      [height * 0.5, radius * 1.035, 0.072],
      [height * 0.86, radius * 0.91, 0.085],
    ]) {
      b.lathe(
        [
          [r - 0.025, -h / 2],
          [r + 0.008, -h / 2],
          [r + 0.008, h / 2],
          [r - 0.025, h / 2],
        ],
        { at: [x, cy, z], segments: 8, color: C.iron, bone: root, name: `${name}_ironHoop` },
      );
      b.lathe(
        [
          [r - 0.01, 0],
          [r + 0.011, 0],
          [r + 0.011, 0.013],
          [r - 0.01, 0.013],
        ],
        { at: [x, cy + h / 2 - 0.013, z], segments: 8, color: C.ironLight, bone: root, name: `${name}_hoopEdge` },
      );
      for (let i = 0; i < 4; i++) {
        const a = Math.PI / 8 + i * Math.PI / 2;
        const rr = (r + 0.008) * Math.cos(Math.PI / 8);
        box(
          `${name}_hoopRivet`,
          [x + Math.sin(a) * rr, cy, z + Math.cos(a) * rr],
          [0.035, 0.035, 0.022],
          C.ironLight,
          undefined,
          [0, a * 180 / Math.PI, 0],
        );
      }
    }

    const topR = radius * 0.815;
    b.part(new THREE.CylinderGeometry(topR, topR, 0.035, 8), C.woodLight, {
      at: [x, height - 0.027, z],
      bone: root,
      name: `${name}_lid`,
      texture: BARREL_WOOD,
    });
    for (const dx of [-0.12, 0, 0.12]) {
      const halfLength = Math.sqrt(Math.max(0.001, topR * topR - dx * dx)) * 0.91;
      box(`${name}_lidSeam`, [x + dx, height - 0.007, z], [0.009, 0.005, halfLength * 2], C.woodDark);
    }
    box(`${name}_lidCrossbar`, [x, height + 0.008, z + 0.08], [topR * 1.65, 0.035, 0.06], C.wood, BARREL_WOOD);
    for (const dx of [-topR * 0.62, topR * 0.62]) {
      box(`${name}_lidNail`, [x + dx, height + 0.029, z + 0.08], [0.023, 0.009, 0.023], C.ironDark);
    }

    box(`${name}_bungBacking`, [x, height * 0.65, z + radius * 0.94], [0.11, 0.105, 0.035], C.woodDark);
    box(`${name}_squareBung`, [x, height * 0.65, z + radius * 0.94 + 0.022], [0.067, 0.067, 0.025], C.woodBright);
  }

  barrel("barrelLeft", 1.1, -0.45, 0.88, 0.32);
  barrel("barrelRight", -1.12, -0.53, 0.72, 0.3);

  // TORCHES ----------------------------------------------------------------
  // Freestanding iron torches keep this a prop set without adding dungeon walls.
  const flameSpans: [number, number][] = [
    [3, 9], [2, 10], [1, 11], [1, 11], [0, 12], [0, 12],
    [1, 11], [1, 10], [2, 10], [2, 11], [3, 11], [3, 10],
    [4, 9], [4, 8], [5, 8], [5, 7], [6, 7], [6, 7],
  ];

  const FIRE = pixelTexture(12, 18, (g) => {
    for (let y = 0; y < 18; y++) {
      const [lo, hi] = flameSpans[y];
      for (let x = lo; x < hi; x++) {
        let color = "#f46b23";
        if (x === lo || x === hi - 1) color = y > 12 ? "#ffb138" : "#bd3f27";
        else if (y < 11 && x >= 3 && x <= 8) color = "#ffca47";
        if (y < 6 && x >= 4 && x <= 7) color = "#fff2a3";
        if (y >= 6 && y < 9 && x >= 5 && x <= 6) color = "#ffe67c";
        g.set(x, 17 - y, color);
      }
    }
  });

  function torch(name: string, x: number, z: number, bowlY: number) {
    box(`${name}_foot`, [x, 0.045, z], [0.34, 0.09, 0.34], C.ironDark, IRON);
    box(`${name}_footStep`, [x, 0.11, z], [0.23, 0.06, 0.23], C.iron, IRON);
    box(`${name}_socket`, [x, 0.19, z], [0.14, 0.12, 0.14], C.ironDark, IRON);
    box(`${name}_shaft`, [x, (0.23 + bowlY) / 2, z], [0.075, bowlY - 0.23, 0.075], C.woodDark, WOOD);

    for (const cy of [0.32, bowlY * 0.59, bowlY - 0.19]) {
      box(`${name}_shaftFerrule`, [x, cy, z], [0.12, 0.07, 0.12], C.iron, IRON);
      box(`${name}_ferruleGlint`, [x - 0.042, cy, z + 0.063], [0.018, 0.05, 0.008], C.ironLight);
    }

    box(`${name}_basketBase`, [x, bowlY - 0.05, z], [0.23, 0.075, 0.23], C.ink);
    box(`${name}_basketRim`, [x, bowlY + 0.045, z], [0.3, 0.055, 0.28], C.iron, IRON);
    box(`${name}_coalBed`, [x, bowlY + 0.077, z], [0.24, 0.018, 0.22], "#602c27");
    for (const s of [-1, 1]) {
      for (const t of [-1, 1]) {
        box(`${name}_basketCorner`, [x + s * 0.12, bowlY, z + t * 0.11], [0.04, 0.21, 0.04], C.ironDark);
      }
    }
    for (let i = 0; i < 4; i++) {
      const ex = x - 0.085 + i * 0.055;
      glow(box(`${name}_ember`, [ex, bowlY + 0.09, z + (i % 2 ? 0.045 : -0.035)], [0.045, 0.026, 0.055], i % 2 ? "#ed6628" : "#a93627"), 0.9);
    }

    const fy = bowlY + 0.09;
    glow(b.extrude(stepped(flameSpans, 0.024, { rows: true }), {
      at: [x - 0.144, fy, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.12,
      color: "#f78029",
      bone: root,
      name: `${name}_steppedFlame`,
    }), 1.1);

    glow(frontDrawing(`${name}_fireFront`, [x, fy + 0.216, z + 0.061], [0.288, 0.432], FIRE), 1.35);
    glow(frontDrawing(`${name}_fireBack`, [x, fy + 0.216, z - 0.061], [0.288, 0.432], FIRE, [0, 0, -1]), 1.35);

    glow(box(`${name}_flameCore`, [x - 0.012, fy + 0.095, z + 0.073], [0.1, 0.14, 0.045], "#ffdf72"), 1.3);
    glow(box(`${name}_flameWhite`, [x - 0.012, fy + 0.055, z + 0.101], [0.05, 0.06, 0.012], "#fff1af"), 1.25);
    glow(box(`${name}_sparkLow`, [x - 0.13, fy + 0.39, z + 0.01], [0.024, 0.048, 0.024], "#ffb23c"), 1.2);
    glow(box(`${name}_sparkHigh`, [x + 0.065, fy + 0.51, z - 0.02], [0.024, 0.024, 0.024], "#ef7830"), 1.2);
  }

  torch("torchLeft", 1.6, -1.03, 1.43);
  torch("torchRight", -1.6, -1.03, 1.56);

  // SPIKE TRAP -------------------------------------------------------------
  // The low stone-and-iron case is the trap itself, not a display platform.
  const trapZ = 0.87;
  box("trap_shadowCase", [0, 0.055, trapZ], [1.31, 0.11, 1.25], C.ink);
  box("trap_recess", [0, 0.108, trapZ], [1.12, 0.035, 1.06], C.ironDark, IRON);

  for (const s of [-1, 1]) {
    box("trap_sideCoping", [s * 0.63, 0.105, trapZ], [0.17, 0.21, 1.39], C.stone, STONE);
    box("trap_endCoping", [0, 0.105, trapZ + s * 0.61], [1.1, 0.21, 0.17], C.stone, STONE);
    box("trap_innerSideRail", [s * 0.535, 0.15, trapZ], [0.045, 0.065, 1.08], C.ironLight, IRON);
    box("trap_innerEndRail", [0, 0.15, trapZ + s * 0.515], [1.11, 0.065, 0.045], C.ironLight, IRON);
  }

  for (const x of [-0.63, 0.63]) {
    for (const z of [trapZ - 0.61, trapZ + 0.61]) {
      box("trap_cornerPlate", [x, 0.217, z], [0.17, 0.025, 0.17], C.ironDark, IRON);
      box("trap_cornerBolt", [x, 0.241, z], [0.052, 0.025, 0.052], C.ironLight);
    }
  }

  // Four rows of four independently socketed square pyramids.
  const spikePaint = cellPaint(0.024, (c) => {
    if (c.at.y > 0.43) return c.n.x > 0 ? "#e4e0c7" : "#a5b0b3";
    if (c.at.y < 0.22) return c.random(8) < 0.25 ? "#866652" : "#596271";
    return c.n.x > 0 ? "#b8c2c2" : c.n.z > 0 ? "#8d9ba6" : "#626d7f";
  });

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const x = -0.39 + col * 0.26;
      const z = trapZ - 0.375 + row * 0.25;
      const h = 0.34 + ((col + row) % 2) * 0.065;
      box("trap_socketShadow", [x, 0.136, z], [0.185, 0.025, 0.18], C.ink);
      box("trap_socketCollar", [x, 0.155, z], [0.145, 0.027, 0.145], C.iron, IRON);
      b.part(new THREE.ConeGeometry(0.085, h, 4), spikePaint, {
        at: [x, 0.166 + h / 2, z],
        bone: root,
        rotation: [0, 45, 0],
        name: "trap_squareSpike",
      });
    }
  }

  box("trap_warningPlate", [0, 0.115, trapZ + 0.703], [0.25, 0.145, 0.024], C.ironDark);
  frontDrawing("trap_warningGlyph", [0, 0.12, trapZ + 0.716], [0.15, 0.15], danger);
  for (const x of [-0.104, 0.104]) {
    rivet("trap_warningScrew", [x, 0.115, trapZ + 0.72], 0.023);
  }

  // BONES ------------------------------------------------------------------
  // Short block-ended bones sit beside, rather than over, the trap.
  function looseBone(name: string, center: V, length: number, yaw: number) {
    const a = yaw * Math.PI / 180;
    const axis = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const across = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    const p = (along: number, side: number, y: number): V => [
      center[0] + axis.x * along + across.x * side,
      y,
      center[2] + axis.z * along + across.z * side,
    ];
    box(`${name}_shaft`, p(0, 0, center[1]), [0.065, 0.065, length - 0.07], C.bone, BONE, [0, yaw, 0], 0.018);
    box(`${name}_shaftLight`, p(0, -0.018, center[1] + 0.034), [0.022, 0.008, length - 0.13], C.boneLight, undefined, [0, yaw, 0]);
    for (const e of [-1, 1]) {
      for (const side of [-1, 1]) {
        box(
          `${name}_knuckle`,
          p(e * (length / 2 - 0.035), side * 0.033, center[1]),
          [0.076, 0.09, 0.085],
          C.bone,
          BONE,
          [0, yaw, 0],
          0.018,
        );
      }
    }
  }

  looseBone("boneFrontLeft", [1.05, 0.046, 0.93], 0.49, 28);
  looseBone("boneFrontRight", [-1.08, 0.046, 1.22], 0.43, -58);
  looseBone("boneCrossed", [-1.1, 0.12, 1.19], 0.35, 31);
  looseBone("boneSmall", [1.22, 0.046, 1.42], 0.28, 72);

  // A readable voxel skull: brows and cheeks frame deep inset square sockets.
  const skullX = -1.1;
  const skullZ = 0.62;
  box("skull_cranium", [skullX, 0.185, skullZ], [0.28, 0.25, 0.255], C.bone, BONE, [0, 0, 0], 0.018);
  box("skull_crown", [skullX, 0.326, skullZ - 0.015], [0.22, 0.055, 0.205], C.boneLight, BONE, [0, 0, 0], 0.018);
  box("skull_backStep", [skullX, 0.18, skullZ - 0.14], [0.21, 0.18, 0.045], C.boneDark, BONE);
  box("skull_faceShadow", [skullX, 0.17, skullZ + 0.14], [0.24, 0.18, 0.028], C.woodDark);

  for (const s of [-1, 1]) {
    box("skull_eyeSocket", [skullX + s * 0.074, 0.205, skullZ + 0.158], [0.086, 0.086, 0.018], C.ink);
    box("skull_brow", [skullX + s * 0.07, 0.266, skullZ + 0.16], [0.125, 0.035, 0.045], C.boneLight);
    box("skull_outerOrbit", [skullX + s * 0.13, 0.205, skullZ + 0.157], [0.025, 0.092, 0.044], C.bone);
    box("skull_cheek", [skullX + s * 0.098, 0.135, skullZ + 0.158], [0.074, 0.052, 0.052], C.bone);
  }
  box("skull_noseBridge", [skullX, 0.211, skullZ + 0.169], [0.036, 0.112, 0.045], C.boneLight);
  box("skull_noseCavity", [skullX, 0.132, skullZ + 0.173], [0.038, 0.045, 0.013], C.ink);
  box("skull_upperJaw", [skullX, 0.092, skullZ + 0.14], [0.17, 0.035, 0.09], C.bone);
  box("skull_lowerJaw", [skullX, 0.026, skullZ + 0.12], [0.22, 0.052, 0.14], C.boneDark, BONE);
  for (let i = 0; i < 4; i++) {
    const x = skullX - 0.0675 + i * 0.045;
    box("skull_upperTooth", [x, 0.065, skullZ + 0.18], [0.034, 0.037, 0.034], C.boneLight);
    box("skull_lowerTooth", [x, 0.044, skullZ + 0.18], [0.034, 0.021, 0.034], C.bone);
  }

  return b.root;
}
```