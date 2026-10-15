```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  svg,
  paint,
  mix,
  noise,
  type Fill,
  type JointRef,
} from "agentic-3js-builder";
import {
  pixelTexture,
  pixelArt,
  tileBox,
  cellPaint,
  stepped,
} from "agentic-3js-builder/kits/pixel";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "The Forgotten Strongroom",
  description:
    "A pixel-art dungeon vignette: an ironbound treasure chest, burning wall torches, coopered barrels, scattered bones, and a raised nine-spike trap on a chipped stone floor.",
};

type P = [number, number, number];

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "forgottenStrongroom",
    paintSize: 1024,
    detail: 1,
  });
  const random = rng(47021);
  const root = b.joint("dungeon", { at: [0, 0, 0] });

  const C = {
    void: "#171d29",
    deep: "#25303e",
    slate: "#3b4a58",
    stone: "#596b74",
    lightStone: "#819294",
    edge: "#a4b0a6",
    moss: "#465943",
    iron: "#263d46",
    ironLight: "#57737a",
    ironEdge: "#8ba6a3",
    woodDark: "#452d28",
    wood: "#885032",
    woodLight: "#ba7940",
    goldDark: "#85522d",
    gold: "#d9a14b",
    goldLight: "#ffe198",
    boneShade: "#a99575",
    bone: "#d9cba5",
    boneLight: "#f5e5bd",
    red: "#a03832",
    teal: "#39ac9a",
  };

  // All surface drawings use one intentionally chunky texel language.
  const stoneTex = pixelTexture(64, 64, (g) => {
    const r = rng(16);
    const palette = ["#4b5d68", "#566974", "#60737b", "#697d82"];
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const cloud =
          Math.sin(x * 0.22 + Math.sin(y * 0.15)) +
          Math.cos(y * 0.28 - x * 0.08);
        g.set(x, y, palette[Math.max(0, Math.min(3, Math.floor(1.7 + cloud * 0.6)))]);
        if (r() < 0.055) g.set(x, y, "#81908e");
        if (r() < 0.04) g.set(x, y, "#3e505c");
      }
    }
    for (let i = 0; i < 18; i++) {
      const x = Math.floor(r() * 58);
      const y = Math.floor(r() * 61);
      const len = 2 + Math.floor(r() * 6);
      for (let j = 0; j < len; j++) {
        g.set(x + j, y, "#394b57");
        if (j < len - 1) g.set(x + j, y + 1, "#87948e");
      }
    }
  });

  const woodTex = pixelTexture(64, 64, (g) => {
    const r = rng(39);
    const colors = ["#69402e", "#7c4930", "#925735", "#a76538", "#b77642"];
    for (let x = 0; x < 64; x++) {
      const shade = Math.floor(r() * colors.length);
      for (let y = 0; y < 64; y++) {
        g.set(x, y, colors[shade]);
        if (r() < 0.08) g.set(x, y, colors[Math.max(0, shade - 1)]);
      }
    }
    for (let i = 0; i < 23; i++) {
      const x = Math.floor(r() * 62);
      const y = Math.floor(r() * 53);
      for (let j = 0; j < 3 + Math.floor(r() * 8); j++) {
        g.set(x, y + j, "#57352a");
        g.set(x + 1, y + j, "#bf8046");
      }
    }
    g.stamp(21, 28, [
      "..dddd..",
      ".dmmmm d".replace(" ", "m"),
      "dmhmmmd.",
      "dmhmmmd.",
      ".dmmmd..",
      "..ddd...",
    ], { d: "#57352a", m: "#875032", h: "#c18647" });
  });

  const ironTex = pixelTexture(32, 32, (g) => {
    const r = rng(92);
    g.fill((x, y) => {
      if (x === 0 || y === 0) return "#78918f";
      if (x === 31 || y === 31) return "#182b36";
      if ((x + y * 3) % 17 === 0) return "#425f68";
      return r() < 0.08 ? "#4a6670" : "#2d4652";
    });
    for (let i = 0; i < 12; i++) {
      const x = 2 + Math.floor(r() * 25);
      const y = 2 + Math.floor(r() * 26);
      g.set(x, y, "#8b7451");
      g.set(x + 1, y, "#5a5141");
    }
  });

  const goldTex = pixelTexture(24, 24, (g) => {
    const r = rng(41);
    g.fill((x, y) => {
      if (y < 2 || x < 2) return "#ffe39a";
      if (y > 21 || x > 21) return "#8b572b";
      return r() < 0.12 ? "#f2c467" : "#cf963d";
    });
    for (let i = 0; i < 8; i++) {
      const x = 3 + Math.floor(r() * 15);
      const y = 3 + Math.floor(r() * 16);
      g.set(x, y, "#986231");
      g.set(x + 1, y, "#ffe39a");
    }
  });

  const skullTex = pixelArt([
    "................",
    "...bbbbbbbbbb...",
    "..bllllllllllb..",
    ".bllllllllllllb.",
    ".blddddll ddddlb.".replace(" ", ""),
    ".bldkkdll dkkdlb.".replace(" ", ""),
    ".bldkkdll dkkdlb.".replace(" ", ""),
    ".blddddll ddddlb.".replace(" ", ""),
    ".blllllddlllllb.",
    "..bllldkkdlllb..",
    "..bllll ddlllb..".replace(" ", "l"),
    "...bddddddddb...",
    "...blblblblb....",
    "...blblblblb....",
    "....bbbbbbb.....",
    "................",
  ].map((row) => row.padEnd(16, ".").slice(0, 16)), {
    b: "#b6a381",
    l: "#eddfb5",
    d: "#6d6258",
    k: "#202b36",
  });

  const lockTex = pixelArt([
    "................",
    ".....hhhhhh.....",
    "....hggggggh....",
    "...hggggggggh...",
    "..hgggddddgggh..",
    "..hggdkkkkdggh..",
    "..hggdkkkkdggh..",
    "..hgggdkkdgggh..",
    "..hgggdkkdgggh..",
    "..hggdkkkkdggh..",
    "..hggddddddggh..",
    "...hggggggggh...",
    "....hggggggh....",
    ".....hhhhhh.....",
    "................",
    "................",
  ], {
    h: "#ffe198",
    g: "#d9a14b",
    d: "#87552f",
    k: "#1b2931",
  });

  const runeTex = pixelArt([
    "................",
    "....ssssssss....",
    "...srrrrrrrrs...",
    "..srrrhhhhrrrs..",
    "..srrhrrrrhrrs..",
    "..srrrrhhrrrrs..",
    "..srrrhhhhrrrs..",
    "..srrhrhhrhrrs..",
    "..srrhrhhrhrrs..",
    "..srrrrhhrrrrs..",
    "..srrrhhhhrrrs..",
    "..srrrrhhrrrrs..",
    "..srrrrhhrrrrs..",
    "...srrrrrrrrs...",
    "....ssssssss....",
    "................",
  ], {
    s: "#111e2b",
    r: "#354953",
    h: "#74d6b4",
  });

  const barrelMarkTex = pixelArt([
    "................",
    "...dddddddddd...",
    "..dccccccccccd..",
    "..dccddddddccd..",
    "..dccdccccdccd..",
    "..dccdccccdccd..",
    "..dccddccddccd..",
    "..dcccdccd ccd..".replace(" ", "c"),
    "..dccccddccccd..",
    "..dccccddccccd..",
    "..dccddddddccd..",
    "..dccccccccccd..",
    "..dccdcdcdcccd..",
    "..dccccccccccd..",
    "...dddddddddd...",
    "................",
  ].map((row) => row.padEnd(16, ".").slice(0, 16)), {
    d: "#533b2e",
    c: "#c6a56d",
  });

  const stonePaint = cellPaint(0.025, (c) =>
    c.pick(
      ["#334653", "#526773", "#71858b", "#9aa8a1"],
      0.46 + c.n.y * 0.20 + (c.random(7) - 0.5) * 0.3,
    ),
  );
  const barrelWood = cellPaint(0.018, (c) =>
    c.pick(
      ["#50362b", "#74452e", "#925934", "#b67942"],
      0.43 + c.n.y * 0.15 + (c.random(31) - 0.5) * 0.34,
    ),
  );
  const steelPaint = cellPaint(0.018, (c) =>
    c.pick(
      ["#243d49", "#45636d", "#739194", "#b7c8ba"],
      0.42 + c.n.y * 0.25 + c.n.x * 0.17 + (c.random(5) - 0.5) * 0.15,
    ),
  );
  const bonePaint = cellPaint(0.016, (c) =>
    c.pick(
      [C.boneShade, C.bone, C.boneLight],
      0.6 + c.n.y * 0.22 + (c.random(11) - 0.5) * 0.22,
    ),
  );

  function box(
    name: string,
    at: P,
    size: P,
    color: Fill,
    rotation: P = [0, 0, 0],
    bone: JointRef = root,
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at, rotation, bone, name,
    });
  }

  function tiled(
    name: string,
    at: P,
    size: P,
    texture: THREE.Texture,
    texel = 0.018,
    rotation: P = [0, 0, 0],
    bone: JointRef = root,
  ) {
    return b.part(tileBox(size, texture, texel, { rand: random }), "#ffffff", {
      at, rotation, bone, texture, name,
    });
  }

  function plate(
    name: string,
    at: P,
    size: [number, number],
    texture: THREE.Texture,
    direction: P = [0, 0, 1],
    bone: JointRef = root,
  ) {
    return b.part(new THREE.PlaneGeometry(...size), "#ffffff", {
      at, dir: direction, axis: "z", texture, bone, name,
    });
  }

  function rivet(at: P, size = 0.026, bone: JointRef = root) {
    return box("squareForgedRivet", at, [size, size, size * 0.50], C.goldLight, [0, 0, 0], bone);
  }

  function beam(a: P, z: P, width: number, color: Fill, name: string) {
    return b.rod(a, z, width / 2, {
      section: "box",
      color,
      bone: root,
      name,
    });
  }

  // A compact, stepped slice of dungeon floor. The black joints are real gaps.
  tiled("foundation", [0, 0.055, 0.025], [2.78, 0.11, 2.37], stoneTex, 0.024);
  box("foundationLowerShadow", [0, 0.018, 0.025], [2.70, 0.036, 2.29], C.deep);
  box("floorMortar", [0, 0.105, 0.025], [2.73, 0.055, 2.32], C.deep);

  for (let iz = 0; iz < 5; iz++) {
    for (let ix = 0; ix < 6; ix++) {
      const x = (ix - 2.5) * 0.45;
      const z = (iz - 2) * 0.45 + 0.025;
      const h = 0.038 + random() * 0.012;
      tiled(
        `floorFlag_${ix}_${iz}`,
        [x, 0.13 + h / 2, z],
        [0.436, h, 0.435],
        stoneTex,
        0.0225,
      );
      if ((ix + iz * 2) % 7 === 0) {
        box("flagEdgeChip", [x - 0.14, 0.157, z + 0.213], [0.09, 0.014, 0.018], C.deep);
      }
    }
  }

  // The back wall is deliberately low; only the torch piers rise above the treasure.
  for (let i = 0; i < 6; i++) {
    tiled(
      "lowBackWall",
      [(i - 2.5) * 0.43, 0.285, -1.015],
      [0.418, 0.23, 0.20],
      stoneTex,
      0.022,
    );
  }

  for (const s of [-1, 1]) {
    const x = s * 1.10;
    for (let row = 0; row < 5; row++) {
      const y = 0.16 + row * 0.235 + 0.113;
      tiled(
        "torchPierBlock",
        [x, y, -0.94],
        [row % 2 ? 0.34 : 0.38, 0.222, 0.31],
        stoneTex,
        0.023,
      );
      if (row === 1 || row === 3) {
        box("pierMortarNotch", [x + s * 0.06, y, -0.780], [0.014, 0.22, 0.009], C.deep);
      }
    }
    tiled("pierCapital", [x, 1.365, -0.94], [0.43, 0.092, 0.37], stoneTex, 0.023);
    tiled("pierBrokenCrown", [x + s * 0.055, 1.445, -0.96], [0.26, 0.07, 0.29], stoneTex, 0.023);

    box("runeInset", [x, 0.71, -0.773], [0.17, 0.20, 0.024], C.void);
    glow(plate("oldWardRune", [x, 0.71, -0.758], [0.16, 0.19], runeTex), 0.35);
  }

  // Chest: four thick plank walls and a visible, hollow treasure well.
  const chestX = 0.18;
  const chestZ = -0.47;
  const chestBottom = 0.225;
  const chestTop = 0.765;
  const chestFront = chestZ + 0.37;
  const chestBack = chestZ - 0.37;
  const lid = b.joint("chestLid", {
    parent: root,
    at: [chestX, chestTop, chestBack],
    dir: [0, 0, 1],
    role: "hinge",
  });

  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      tiled(
        "chestFoot",
        [chestX + sx * 0.414, 0.209, chestZ + sz * 0.265],
        [0.145, 0.085, 0.15],
        ironTex,
        0.015,
      );
    }
  }
  tiled("chestBottom", [chestX, 0.255, chestZ], [1.015, 0.065, 0.73], woodTex, 0.014);
  box("treasureWellShadow", [chestX, 0.286, chestZ], [0.88, 0.018, 0.61], C.woodDark);

  for (let i = 0; i < 7; i++) {
    const x = chestX + (i - 3) * 0.142;
    for (const z of [chestFront, chestBack]) {
      tiled("chestVerticalPlank", [x, 0.51, z], [0.137, 0.48, 0.067], woodTex, 0.013);
    }
  }
  for (const s of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      tiled(
        "chestSidePlank",
        [chestX + s * 0.48, 0.51, chestZ + (i - 2) * 0.139],
        [0.067, 0.48, 0.134],
        woodTex,
        0.013,
      );
    }
    for (const y of [0.293, 0.738]) {
      tiled("chestSideBinding", [chestX + s * 0.502, y, chestZ], [0.05, 0.067, 0.80], ironTex, 0.015);
    }
    for (const z of [chestFront + 0.015, chestBack - 0.015]) {
      tiled("cornerIron", [chestX + s * 0.459, 0.52, z], [0.083, 0.49, 0.05], ironTex, 0.015);
      for (const y of [0.32, 0.49, 0.7]) {
        rivet([chestX + s * 0.46, y, z + (z > chestZ ? 0.03 : -0.03)]);
      }
    }
  }

  for (const y of [0.292, 0.741]) {
    tiled("frontIronRail", [chestX, y, chestFront + 0.025], [1.06, 0.075, 0.058], ironTex, 0.014);
    tiled("backIronRail", [chestX, y, chestBack - 0.025], [1.06, 0.075, 0.058], ironTex, 0.014);
    for (const dx of [-0.33, -0.15, 0.15, 0.33]) rivet([chestX + dx, y, chestFront + 0.058]);
  }

  // Warm rim catches and heavy lock plate.
  tiled("goldFrontLip", [chestX, 0.782, chestFront], [0.95, 0.025, 0.075], goldTex, 0.015);
  for (const s of [-1, 1]) {
    tiled("goldSideLip", [chestX + s * 0.47, 0.782, chestZ], [0.025, 0.025, 0.68], goldTex, 0.012);
  }
  tiled("lockBacking", [chestX, 0.56, chestFront + 0.073], [0.225, 0.26, 0.038], ironTex, 0.012);
  tiled("lockGoldPlate", [chestX, 0.565, chestFront + 0.1], [0.17, 0.205, 0.024], goldTex, 0.011);
  plate("pixelKeyhole", [chestX, 0.565, chestFront + 0.114], [0.18, 0.21], lockTex);
  for (const dx of [-0.085, 0.085]) {
    rivet([chestX + dx, 0.66, chestFront + 0.098], 0.022);
    rivet([chestX + dx, 0.46, chestFront + 0.098], 0.022);
  }

  // A plank lid is assembled shut, then opened about its actual back hinge.
  for (let i = 0; i < 7; i++) {
    tiled(
      "lidPlank",
      [chestX + (i - 3) * 0.146, chestTop + 0.085, chestZ],
      [0.141, 0.13, 0.775],
      woodTex, 0.013, [0, 0, 0], lid,
    );
  }
  for (const x of [chestX - 0.505, chestX + 0.505]) {
    tiled("lidSideFrame", [x, chestTop + 0.09, chestZ], [0.07, 0.19, 0.84], ironTex, 0.014, [0, 0, 0], lid);
  }
  for (const z of [chestZ - 0.394, chestZ + 0.394]) {
    tiled("lidEndFrame", [chestX, chestTop + 0.09, z], [1.07, 0.19, 0.065], ironTex, 0.014, [0, 0, 0], lid);
  }
  for (const dx of [-0.32, 0.32]) {
    tiled("lidGoldStrap", [chestX + dx, chestTop + 0.159, chestZ], [0.075, 0.025, 0.77], goldTex, 0.012, [0, 0, 0], lid);
    tiled("innerLidBrace", [chestX + dx, chestTop + 0.013, chestZ], [0.064, 0.023, 0.70], ironTex, 0.012, [0, 0, 0], lid);
    for (const dz of [-0.28, 0, 0.28]) {
      box("lidStrapStud", [chestX + dx, chestTop + 0.18, chestZ + dz], [0.026, 0.018, 0.026], C.goldLight, [0, 0, 0], lid);
    }
    b.rod(
      [chestX + dx - 0.085, chestTop, chestBack],
      [chestX + dx + 0.085, chestTop, chestBack],
      0.04,
      { bone: root, color: C.goldDark, sides: 8, name: "chestHingeBarrel" },
    );
  }
  // The inner lid's ward faces down when shut and toward the viewer when opened.
  plate(
    "innerLidWard",
    [chestX, chestTop + 0.012, chestZ],
    [0.30, 0.30],
    runeTex,
    [0, -1, 0],
    lid,
  );
  b.pose(lid, { axis: [1, 0, 0], deg: -62 });

  // Treasure is set high enough to read inside the open chest.
  box("treasureFalseBottom", [chestX, 0.635, chestZ], [0.88, 0.08, 0.59], C.goldDark);
  for (let i = 0; i < 23; i++) {
    const x = chestX + (random() - 0.5) * 0.76;
    const z = chestZ + (random() - 0.5) * 0.49;
    const y = 0.69 + random() * 0.065;
    const coin = b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.018, 8), i % 4 ? C.gold : C.goldLight, {
      at: [x, y, z],
      rotation: [(random() - 0.5) * 22, random() * 90, (random() - 0.5) * 20],
      bone: root,
      name: "octagonalTreasureCoin",
    });
    if (i % 6 === 0) glow(coin, 0.12);
  }
  for (const [dx, dz, color] of [
    [-0.23, 0.08, "#46dfc3"],
    [0.20, -0.06, "#bc6dc8"],
    [0.02, 0.15, "#7ad5e3"],
  ] as [number, number, string][]) {
    glow(b.part(new THREE.OctahedronGeometry(0.10, 0), color, {
      at: [chestX + dx, 0.78, chestZ + dz],
      scale: [0.72, 1.15, 0.72],
      bone: root,
      name: "lootGem",
    }), 0.32);
  }

  // Coopered barrels: polygonal bodies, dark stave seams, three substantial hoops.
  function barrel(x: number, z: number, radius: number, height: number, label: boolean) {
    const y0 = 0.17;
    const profile: [number, number][] = [
      [0, 0], [radius * 0.82, 0],
      [radius * 0.94, height * 0.16],
      [radius, height * 0.47],
      [radius * 0.94, height * 0.84],
      [radius * 0.82, height],
      [0, height],
    ];
    b.lathe(profile, {
      at: [x, y0, z],
      segments: 10,
      color: barrelWood,
      bone: root,
      name: "tenStaveBarrel",
    });

    for (let j = 0; j < 10; j++) {
      const a = (j / 10) * Math.PI * 2;
      const points = [
        [0.82, 0.015], [0.94, 0.16], [1, 0.47], [0.94, 0.84], [0.82, 0.985],
      ].map(([r, h]) => [
        x + Math.sin(a) * radius * r,
        y0 + h * height,
        z + Math.cos(a) * radius * r,
      ]);
      b.sweep(points, radius * 0.022, {
        section: "box",
        caps: "flat",
        color: C.woodDark,
        bone: root,
        name: "barrelStaveJoint",
      });
    }

    for (const level of [0.15, 0.50, 0.85]) {
      const r = radius * (level === 0.50 ? 1.018 : 0.953);
      const y = y0 + level * height;
      const h = height * 0.083;
      b.lathe([
        [r - 0.025, -h / 2], [r + 0.012, -h / 2],
        [r + 0.012, h / 2], [r - 0.025, h / 2],
      ], {
        at: [x, y, z], segments: 10, color: steelPaint, bone: root,
        name: "barrelIronHoop",
      });
      for (let j = 0; j < 5; j++) {
        const a = (j / 5) * Math.PI * 2 + Math.PI / 10;
        b.part(new THREE.BoxGeometry(0.025, 0.022, 0.015), C.goldDark, {
          at: [x + Math.sin(a) * (r + 0.008), y, z + Math.cos(a) * (r + 0.008)],
          rotation: [0, a * 180 / Math.PI, 0],
          bone: root,
          name: "hoopSquareNail",
        });
      }
    }

    b.part(new THREE.CylinderGeometry(radius * 0.79, radius * 0.79, 0.026, 10), barrelWood, {
      at: [x, y0 + height + 0.006, z], bone: root, name: "barrelLid",
    });
    for (const dx of [-0.38, 0, 0.38]) {
      const half = Math.sqrt(0.77 * 0.77 - dx * dx) * radius;
      box("barrelLidSeam", [x + dx * radius, y0 + height + 0.021, z], [0.008, 0.005, half * 2], C.woodDark);
    }
    tiled("barrelBung", [x + radius * 0.27, y0 + height + 0.028, z], [0.058, 0.025, 0.058], woodTex, 0.013);
    if (label) {
      box("barrelInventoryTag", [x, y0 + height * 0.67, z + radius * 0.98], [0.14, 0.135, 0.015], C.boneShade);
      plate("barrelInventoryStamp", [x, y0 + height * 0.67, z + radius * 0.98 + 0.009], [0.14, 0.135], barrelMarkTex);
    }
  }
  barrel(-0.96, -0.35, 0.255, 0.70, true);
  barrel(-1.01, 0.285, 0.205, 0.47, false);

  // The trap is a dark recess surrounded by a slightly proud, riveted iron frame.
  const trapX = 0.64;
  const trapZ = 0.68;
  box("trapBlackRecess", [trapX, 0.181, trapZ], [1.035, 0.026, 0.93], C.void);
  tiled("trapBed", [trapX, 0.194, trapZ], [0.95, 0.026, 0.85], ironTex, 0.017);

  for (const s of [-1, 1]) {
    tiled("trapLongFrame", [trapX + s * 0.505, 0.214, trapZ], [0.065, 0.07, 0.985], ironTex, 0.015);
    tiled("trapShortFrame", [trapX, 0.214, trapZ + s * 0.455], [1.075, 0.07, 0.066], ironTex, 0.015);
    box("trapEdgeHighlight", [trapX + s * 0.505, 0.252, trapZ], [0.025, 0.008, 0.94], C.ironLight);
    for (const t of [-0.34, 0, 0.34]) {
      box("trapFrameBolt", [trapX + t, 0.255, trapZ + s * 0.455], [0.032, 0.018, 0.032], C.ironEdge);
    }
  }
  for (let iz = 0; iz < 3; iz++) {
    for (let ix = 0; ix < 3; ix++) {
      const x = trapX + (ix - 1) * 0.285;
      const z = trapZ + (iz - 1) * 0.25;
      box("squareSpikeSocket", [x, 0.215, z], [0.194, 0.025, 0.18], C.void);
      tiled("spikeSlidingCollar", [x, 0.23, z], [0.137, 0.045, 0.137], ironTex, 0.014);
      const height = 0.34 + (ix === 1 && iz === 1 ? 0.075 : 0);
      b.part(new THREE.ConeGeometry(0.089, height, 4, 1), steelPaint, {
        at: [x, 0.25 + height / 2, z],
        rotation: [0, 45, 0],
        bone: root,
        name: "fourSidedTrapSpike",
      });
    }
  }
  // A small, damaged warning tile sits flush with the front edge.
  tiled("trapWarningPlate", [trapX - 0.31, 0.266, trapZ + 0.454], [0.13, 0.015, 0.065], goldTex, 0.012);
  for (let i = 0; i < 3; i++) {
    box("trapWarningBars", [trapX - 0.35 + i * 0.038, 0.277, trapZ + 0.454], [0.014, 0.007, 0.05], C.void);
  }

  // A stylized skull has genuine blocky depth; its sockets and teeth are pixel-drawn.
  const skullAt: P = [-0.62, 0.29, 0.88];
  box("skullCranium", skullAt, [0.235, 0.215, 0.205], bonePaint, [0, -12, 0]);
  box("skullCrown", [-0.62, 0.395, 0.865], [0.175, 0.04, 0.16], bonePaint, [0, -12, 0]);
  box("skullJaw", [-0.62, 0.202, 0.969], [0.178, 0.055, 0.10], bonePaint, [0, -12, 0]);
  plate("skullPixelFace", [-0.62, 0.282, 0.991], [0.233, 0.232], skullTex);
  for (const s of [-1, 1]) {
    box("skullCheekbone", [-0.62 + s * 0.099, 0.246, 0.97], [0.04, 0.062, 0.06], C.bone);
  }
  box("skullTempleChip", [-0.725, 0.354, 0.94], [0.025, 0.025, 0.04], C.boneShade);

  function looseBone(x: number, z: number, length: number, angle: number) {
    const a = angle * Math.PI / 180;
    const axis = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    const side = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));
    const center = new THREE.Vector3(x, 0.211, z);
    const p0 = center.clone().addScaledVector(axis, -length / 2);
    const p1 = center.clone().addScaledVector(axis, length / 2);
    b.rod(p0, p1, 0.022, {
      section: "box", bone: root, color: bonePaint, name: "looseBoneShaft",
    });
    for (const p of [p0, p1]) {
      for (const s of [-1, 1]) {
        const q = p.clone().addScaledVector(side, s * 0.023);
        box("boneKnuckle", [q.x, 0.215, q.z], [0.056, 0.067, 0.052], bonePaint, [0, -angle, 0]);
      }
    }
  }
  looseBone(-0.88, 0.69, 0.30, 37);
  looseBone(-0.29, 0.94, 0.30, -32);
  looseBone(-0.34, 0.59, 0.22, 75);
  looseBone(-1.01, 1.01, 0.22, -12);

  // Pixel-stepped flames are small sculptural slabs, not smooth particle blobs.
  function torch(s: number) {
    const x = s * 1.10;
    const z = -0.665;

    tiled("torchWallPlate", [x, 1.13, -0.767], [0.15, 0.29, 0.045], ironTex, 0.014);
    for (const dy of [-0.10, 0.10]) rivet([x, 1.13 + dy, -0.737], 0.026);
    beam([x, 1.04, -0.74], [x, 1.04, -0.47], 0.052, C.iron, "sconceBracket");
    beam([x, 1.04, -0.47], [x, 1.33, z], 0.052, C.iron, "sconceDiagonal");
    beam([x, 1.13, z], [x, 1.55, z], 0.063, barrelWood, "torchWoodHandle");

    for (const y of [1.23, 1.39, 1.49]) {
      tiled("torchHandleBand", [x, y, z], [0.083, 0.038, 0.083], ironTex, 0.013);
    }
    b.lathe([
      [0.035, 0], [0.08, 0.035], [0.115, 0.11],
      [0.095, 0.13], [0.065, 0.055], [0.027, 0.025],
    ], {
      at: [x, 1.43, z],
      segments: 8,
      color: steelPaint,
      bone: root,
      name: "torchIronBasket",
    });
    glow(box("hotCoals", [x, 1.555, z], [0.135, 0.035, 0.12], "#e95325"), 0.8);

    const outer = stepped([
      [0, 3], [0, 6], [0, 8], [0, 11],
      [0, 9], [0, 7], [0, 10], [0, 6],
    ], 0.032);
    const middle = stepped([
      [0, 3], [0, 5], [0, 8], [0, 7], [0, 5],
    ], 0.032);
    const core = stepped([
      [0, 2], [0, 4], [0, 5], [0, 3],
    ], 0.026);

    glow(b.extrude(outer, {
      at: [x - 0.128, 1.55, z],
      x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.055,
      color: "#dc4d27", bone: root, name: "steppedOuterFlame",
    }), 1.0);
    glow(b.extrude(middle, {
      at: [x - 0.080, 1.554, z + 0.036],
      x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.032,
      color: "#ffac32", bone: root, name: "steppedAmberFlame",
    }), 1.25);
    glow(b.extrude(core, {
      at: [x - 0.052, 1.556, z + 0.059],
      x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.025,
      color: "#fff0a1", bone: root, name: "steppedFlameHeart",
    }), 1.4);
    glow(b.extrude(middle, {
      at: [x, 1.552, z - 0.080],
      x: [0, 0, 1], y: [0, 1, 0],
      thickness: 0.045,
      color: "#ff8a29", bone: root, name: "crosswiseFlame",
    }), 1.0);

    for (let i = 0; i < 3; i++) {
      glow(box(
        "squareFloatingEmber",
        [x + (i % 2 ? -0.045 : 0.06), 1.94 + i * 0.075, z],
        [0.021, i === 1 ? 0.04 : 0.023, 0.019],
        i === 1 ? "#fff0a1" : "#ffac32",
      ), 1.2);
    }
  }
  torch(-1);
  torch(1);

  // Sparing rubble and damp patches keep the foreground legible.
  const rubble: P[] = [
    [-1.25, 0.19, -0.72],
    [-0.55, 0.19, -0.99],
    [0.86, 0.19, -0.78],
    [1.23, 0.19, -0.18],
    [-1.28, 0.19, 0.76],
    [0.03, 0.19, 1.07],
  ];
  for (let i = 0; i < rubble.length; i++) {
    const p = rubble[i];
    box("fallenMasonryChip", p, [0.10 + random() * 0.05, 0.045, 0.065], stonePaint, [0, random() * 70, 0]);
    if (i % 2 === 0) {
      box("smallMasonryChip", [p[0] + 0.08, 0.182, p[2] + 0.055], [0.038, 0.025, 0.035], C.stone);
    }
  }
  for (const [x, z] of [
    [-1.22, -0.84], [1.23, -0.83], [-1.19, 0.48], [0.84, -0.98],
  ]) {
    for (let i = 0; i < 4; i++) {
      box(
        "squareMossPatch",
        [x + (i % 2) * 0.035, 0.179, z + Math.floor(i / 2) * 0.027],
        [0.033, 0.008, 0.025],
        i % 2 ? "#586c48" : "#3d5242",
      );
    }
  }

  return b.root;
}
```