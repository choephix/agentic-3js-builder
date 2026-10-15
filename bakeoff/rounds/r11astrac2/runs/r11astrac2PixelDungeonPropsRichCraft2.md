```ts
import * as THREE from "three";
import { createBuilder, rng, type Fill } from "agentic-3js-builder";
import { pixelTexture, pixelArt, tileBox, cellPaint, stepped } from "agentic-3js-builder/kits/pixel";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "The Forgotten Strongroom",
  description: "Pixel-art dungeon props: an open ironbound treasure chest, coopered barrels, sculptural torchlight, a stepped skull and scattered bones beside an armed spike trap.",
};

type P = [number, number, number];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "forgottenStrongroom", paintSize: 1024 });
  const random = rng(47021);
  const root = b.joint("dungeon", { at: [0, 0, 0] });

  // Art-direction changes:
  // 1. Replace the skull's box-and-sticker read with a stepped cranium,
  //    inset paired sockets, cheek arches and a narrower articulated jaw.
  // 2. Give the chest lid a complete gold inner border and corner fittings.
  // 3. Carry the fire's bright core around its sides, not just its front.
  // 4. Keep the clean composition and intentionally suspended pixel embers.

  const C = {
    void: "#171d29", deep: "#25303e", stone: "#596b74",
    iron: "#263d46", ironLight: "#57737a", ironEdge: "#8ba6a3",
    woodDark: "#452d28", goldDark: "#85522d", gold: "#d9a14b",
    goldLight: "#ffe198", boneShade: "#a99575",
    bone: "#d9cba5", boneLight: "#f5e5bd",
  };

  const stoneTex = pixelTexture(64, 64, (g) => {
    const r = rng(16);
    const palette = ["#52636e", "#596b75", "#60727a", "#667980"];
    g.fill((x, y) => palette[Math.max(0, Math.min(3,
      Math.floor(1.5 + (Math.sin(x * 0.12) + Math.cos(y * 0.14 - x * 0.035)) * 0.55)))]);
    for (let i = 0; i < 28; i++) {
      const x = Math.floor(r() * 61), y = Math.floor(r() * 62);
      const c = i % 3 ? "#6e8086" : "#495d6b";
      g.set(x, y, c); g.set(x + 1, y, c);
      if (i % 4 === 0) g.set(x + 1, y + 1, c);
    }
    for (let i = 0; i < 5; i++) {
      const x = 3 + Math.floor(r() * 50), y = 3 + Math.floor(r() * 55);
      const len = 3 + Math.floor(r() * 5);
      for (let j = 0; j < len; j++) {
        const yy = y + Math.floor(j / 3);
        g.set(x + j, yy, "#455965"); g.set(x + j, yy + 1, "#78898c");
      }
    }
  });

  const warmStoneTex = pixelTexture(32, 32, (g) => {
    const r = rng(101);
    g.fill((_x, y) => y < 8 ? "#72796f" : y < 20 ? "#68726f" : "#5a686c");
    for (let i = 0; i < 19; i++) {
      const x = Math.floor(r() * 30), y = Math.floor(r() * 31);
      const c = i % 3 ? "#7c8275" : "#4b5b60";
      g.set(x, y, c); g.set(x + 1, y, c);
    }
  });

  const woodTex = pixelTexture(64, 64, (g) => {
    const r = rng(39);
    const colors = ["#69402e", "#7c4930", "#925735", "#a76538", "#b77642"];
    for (let x = 0; x < 64; x++) {
      const shade = Math.floor(r() * colors.length);
      for (let y = 0; y < 64; y++) {
        g.set(x, y, colors[shade]);
        if (r() < 0.035) g.set(x, y, colors[Math.max(0, shade - 1)]);
      }
    }
    for (let i = 0; i < 17; i++) {
      const x = Math.floor(r() * 62), y = Math.floor(r() * 53);
      const len = 3 + Math.floor(r() * 8);
      for (let j = 0; j < len; j++) {
        g.set(x, y + j, "#57352a"); g.set(x + 1, y + j, "#bf8046");
      }
    }
    g.stamp(21, 28, ["..dddd..", ".dmmmmd.", "dmhmmmd.", "dmhmmmd.", ".dmmmd..", "..ddd..."],
      { d: "#57352a", m: "#875032", h: "#c18647" });
  });

  const ironTex = pixelTexture(32, 32, (g) => {
    const r = rng(92);
    g.fill((x, y) => x === 0 || y === 0 ? "#617d81"
      : x === 31 || y === 31 ? "#182b36" : "#304a56");
    for (let i = 0; i < 9; i++) {
      const x = 2 + Math.floor(r() * 26), y = 2 + Math.floor(r() * 26);
      g.set(x, y, i % 3 ? "#46616b" : "#6b634d"); g.set(x + 1, y, "#46616b");
    }
  });

  const goldTex = pixelTexture(24, 24, (g) => {
    const r = rng(41);
    g.fill((x, y) => y < 2 || x < 2 ? "#ffe39a"
      : y > 21 || x > 21 ? "#8b572b" : r() < 0.045 ? "#f2c467" : "#cf963d");
  });

  const lockTex = pixelArt([
    "................", ".....hhhhhh.....", "....hggggggh....",
    "...hggggggggh...", "..hgggddddgggh..", "..hggdkkkkdggh..",
    "..hggdkkkkdggh..", "..hgggdkkdgggh..", "..hgggdkkdgggh..",
    "..hggdkkkkdggh..", "..hggddddddggh..", "...hggggggggh...",
    "....hggggggh....", ".....hhhhhh.....", "................", "................",
  ], { h: "#ffe198", g: "#d9a14b", d: "#87552f", k: "#1b2931" });

  const runeTex = pixelArt([
    "................", "....ssssssss....", "...srrrrrrrrs...",
    "..srrrhhhhrrrs..", "..srrhrrrrhrrs..", "..srrrrhhrrrrs..",
    "..srrrhhhhrrrs..", "..srrhrhhrhrrs..", "..srrhrhhrhrrs..",
    "..srrrrhhrrrrs..", "..srrrhhhhrrrs..", "..srrrrhhrrrrs..",
    "..srrrrhhrrrrs..", "...srrrrrrrrs...", "....ssssssss....", "................",
  ], { s: "#111e2b", r: "#354953", h: "#74d6b4" });

  const barrelMarkTex = pixelArt([
    "................", "...dddddddddd...", "..dccccccccccd..",
    "..dccddddddccd..", "..dccdccccdccd..", "..dccdccccdccd..",
    "..dccddccddccd..", "..dcccdccdcccd..", "..dccccddccccd..",
    "..dccccddccccd..", "..dccddddddccd..", "..dccccccccccd..",
    "..dccdcdcdcccd..", "..dccccccccccd..", "...dddddddddd...", "................",
  ], { d: "#533b2e", c: "#c6a56d" });

  const socketTex = pixelArt([
    "..dddd..", ".dkkkkd.", "dkkkkkkd", "dkkkkkkd",
    "dkkkkkkd", ".dkkkkd.", "..dddd..", "........",
  ], { d: "#74654f", k: "#18232b" });

  const stonePaint = cellPaint(0.025, (c) =>
    c.pick(["#40535f", "#596e79", "#78898d", "#9aa8a1"],
      0.43 + c.n.y * 0.22 + (c.random(7) - 0.5) * 0.12));
  const barrelWood = cellPaint(0.018, (c) =>
    c.pick(["#50362b", "#74452e", "#925934", "#b67942"],
      0.43 + c.n.y * 0.15 + (c.random(31) - 0.5) * 0.26));
  const steelPaint = cellPaint(0.018, (c) =>
    c.pick(["#243d49", "#45636d", "#739194", "#b7c8ba"],
      0.42 + c.n.y * 0.25 + c.n.x * 0.17 + (c.random(5) - 0.5) * 0.045));
  const bonePaint = cellPaint(0.016, (c) =>
    c.pick([C.boneShade, C.bone, C.boneLight],
      0.6 + c.n.y * 0.22 + (c.random(11) - 0.5) * 0.12));

  type Bone = typeof root;
  function box(name: string, at: P, size: P, color: Fill,
    rotation: P = [0, 0, 0], bone: Bone = root) {
    return b.part(new THREE.BoxGeometry(...size), color, { at, rotation, bone, name });
  }
  function tiled(name: string, at: P, size: P, texture: THREE.Texture,
    texel = 0.018, rotation: P = [0, 0, 0], bone: Bone = root) {
    return b.part(tileBox(size, texture, texel, { rand: random }), "#ffffff",
      { at, rotation, bone, texture, name });
  }
  function plate(name: string, at: P, size: [number, number], texture: THREE.Texture,
    direction: P = [0, 0, 1], bone: Bone = root) {
    return b.part(new THREE.PlaneGeometry(...size), "#ffffff",
      { at, dir: direction, axis: "z", texture, bone, name });
  }
  function rivet(at: P, size = 0.026) {
    return box("squareForgedRivet", at, [size, size, size * 0.5], C.goldLight);
  }
  function beam(a: P, end: P, width: number, color: Fill, name: string) {
    return b.rod(a, end, width / 2, { section: "box", color, bone: root, name });
  }

  tiled("foundation", [0, 0.055, 0.025], [2.78, 0.11, 2.37], stoneTex, 0.024);
  box("foundationLowerShadow", [0, 0.018, 0.025], [2.70, 0.036, 2.29], C.deep);
  box("floorMortar", [0, 0.105, 0.025], [2.73, 0.055, 2.32], C.deep);
  for (let iz = 0; iz < 5; iz++) for (let ix = 0; ix < 6; ix++) {
    const x = (ix - 2.5) * 0.45, z = (iz - 2) * 0.45 + 0.025;
    const h = 0.038 + random() * 0.012;
    tiled(`floorFlag_${ix}_${iz}`, [x, 0.13 + h / 2, z], [0.436, h, 0.435], stoneTex, 0.0225);
    if ((ix + iz * 2) % 7 === 0)
      box("flagEdgeChip", [x - 0.14, 0.157, z + 0.213], [0.09, 0.014, 0.018], C.deep);
  }
  for (let i = 0; i < 6; i++)
    tiled("lowBackWall", [(i - 2.5) * 0.43, 0.285, -1.015], [0.418, 0.23, 0.20], stoneTex, 0.022);
  for (const s of [-1, 1]) {
    const x = s * 1.10;
    for (let row = 0; row < 5; row++) {
      const y = 0.16 + row * 0.235 + 0.113;
      tiled("torchPierBlock", [x, y, -0.94], [row % 2 ? 0.34 : 0.38, 0.222, 0.31],
        row >= 3 ? warmStoneTex : stoneTex, 0.023);
      if (row === 1 || row === 3)
        box("pierMortarNotch", [x + s * 0.06, y, -0.780], [0.014, 0.22, 0.009], C.deep);
    }
    tiled("pierCapital", [x, 1.365, -0.94], [0.43, 0.092, 0.37], warmStoneTex, 0.023);
    tiled("pierBrokenCrown", [x + s * 0.055, 1.445, -0.96], [0.26, 0.07, 0.29], warmStoneTex, 0.023);
    box("runeInset", [x, 0.71, -0.773], [0.17, 0.20, 0.024], C.void);
    glow(plate("oldWardRune", [x, 0.71, -0.758], [0.16, 0.19], runeTex), 0.35);
  }

  const cx = 0.18, cz = -0.47, top = 0.765;
  const front = cz + 0.37, back = cz - 0.37;
  const lid = b.joint("chestLid", {
    parent: root, at: [cx, top, back], dir: [0, 0, 1], role: "hinge",
  });

  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    tiled("chestFoot", [cx + sx * 0.414, 0.209, cz + sz * 0.265], [0.145, 0.085, 0.15], ironTex, 0.015);
  tiled("chestBottom", [cx, 0.255, cz], [1.015, 0.065, 0.73], woodTex, 0.014);
  box("treasureWellShadow", [cx, 0.286, cz], [0.88, 0.018, 0.61], C.woodDark);
  for (let i = 0; i < 7; i++) for (const z of [front, back])
    tiled("chestVerticalPlank", [cx + (i - 3) * 0.142, 0.51, z],
      [0.137, 0.48, 0.067], woodTex, 0.013);

  for (const s of [-1, 1]) {
    for (let i = 0; i < 5; i++)
      tiled("chestSidePlank", [cx + s * 0.48, 0.51, cz + (i - 2) * 0.139],
        [0.067, 0.48, 0.134], woodTex, 0.013);
    for (const y of [0.293, 0.738])
      tiled("chestSideBinding", [cx + s * 0.502, y, cz], [0.05, 0.067, 0.80], ironTex, 0.015);
    for (const z of [front + 0.015, back - 0.015]) {
      tiled("cornerIron", [cx + s * 0.459, 0.52, z], [0.083, 0.49, 0.05], ironTex, 0.015);
      for (const y of [0.32, 0.49, 0.70])
        rivet([cx + s * 0.46, y, z + (z > cz ? 0.03 : -0.03)]);
    }
    const sideX = cx + s * 0.535;
    for (const dz of [-0.115, 0.115]) {
      tiled("sideHandleMount", [sideX, 0.566, cz + dz], [0.035, 0.11, 0.077], ironTex, 0.012);
      box("handleMountBolt", [sideX + s * 0.022, 0.590, cz + dz], [0.015, 0.023, 0.023], C.goldLight);
      b.rod([sideX, 0.55, cz + dz], [sideX + s * 0.058, 0.55, cz + dz], 0.025,
        { color: C.goldDark, sides: 6, bone: root, name: "carryHandlePivot" });
      beam([sideX + s * 0.060, 0.55, cz + dz], [sideX + s * 0.070, 0.438, cz + dz],
        0.032, C.iron, "carryHandleArm");
    }
    beam([sideX + s * 0.070, 0.438, cz - 0.115], [sideX + s * 0.070, 0.438, cz + 0.115],
      0.038, steelPaint, "carryHandleGrip");
  }
  for (const y of [0.292, 0.741]) {
    tiled("frontIronRail", [cx, y, front + 0.025], [1.06, 0.075, 0.058], ironTex, 0.014);
    tiled("backIronRail", [cx, y, back - 0.025], [1.06, 0.075, 0.058], ironTex, 0.014);
    for (const dx of [-0.33, -0.15, 0.15, 0.33]) rivet([cx + dx, y, front + 0.058]);
  }
  tiled("goldFrontLip", [cx, 0.782, front], [0.95, 0.025, 0.075], goldTex, 0.015);
  for (const s of [-1, 1])
    tiled("goldSideLip", [cx + s * 0.47, 0.782, cz], [0.025, 0.025, 0.68], goldTex, 0.012);
  tiled("lockBacking", [cx, 0.56, front + 0.073], [0.225, 0.26, 0.038], ironTex, 0.012);
  tiled("lockGoldPlate", [cx, 0.565, front + 0.1], [0.17, 0.205, 0.024], goldTex, 0.011);
  plate("pixelKeyhole", [cx, 0.565, front + 0.114], [0.18, 0.21], lockTex);
  for (const dx of [-0.085, 0.085]) {
    rivet([cx + dx, 0.66, front + 0.098], 0.022);
    rivet([cx + dx, 0.46, front + 0.098], 0.022);
  }

  for (let i = 0; i < 7; i++)
    tiled("lidPlank", [cx + (i - 3) * 0.146, top + 0.085, cz],
      [0.141, 0.13, 0.775], woodTex, 0.013, [0, 0, 0], lid);
  for (const s of [-1, 1]) {
    tiled("lidSideFrame", [cx + s * 0.505, top + 0.09, cz],
      [0.07, 0.19, 0.84], ironTex, 0.014, [0, 0, 0], lid);
    tiled("lidEndFrame", [cx, top + 0.09, cz + s * 0.394],
      [1.07, 0.19, 0.065], ironTex, 0.014, [0, 0, 0], lid);
    // Fine continuous gold inset, visible on the underside when open.
    box("lidInnerSideInlay", [cx + s * 0.442, top + 0.012, cz],
      [0.018, 0.018, 0.69], C.gold, [0, 0, 0], lid);
    box("lidInnerEndInlay", [cx, top + 0.012, cz + s * 0.338],
      [0.89, 0.018, 0.018], C.gold, [0, 0, 0], lid);
    for (const t of [-1, 1]) {
      box("lidCornerGoldSquare", [cx + s * 0.442, top - 0.002, cz + t * 0.338],
        [0.047, 0.016, 0.047], C.goldLight, [0, 0, 0], lid);
    }
  }
  for (const dx of [-0.32, 0.32]) {
    tiled("lidGoldStrap", [cx + dx, top + 0.159, cz],
      [0.075, 0.025, 0.77], goldTex, 0.012, [0, 0, 0], lid);
    tiled("innerLidBrace", [cx + dx, top + 0.013, cz],
      [0.064, 0.023, 0.70], ironTex, 0.012, [0, 0, 0], lid);
    for (const dz of [-0.28, 0, 0.28]) {
      box("lidStrapStud", [cx + dx, top + 0.18, cz + dz],
        [0.026, 0.018, 0.026], C.goldLight, [0, 0, 0], lid);
      box("innerBraceStud", [cx + dx, top - 0.003, cz + dz],
        [0.022, 0.012, 0.022], C.gold, [0, 0, 0], lid);
    }
    b.rod([cx + dx - 0.085, top, back], [cx + dx + 0.085, top, back], 0.04,
      { bone: root, color: C.goldDark, sides: 8, name: "chestHingeBarrel" });
  }
  plate("innerLidWard", [cx, top + 0.012, cz], [0.30, 0.30], runeTex, [0, -1, 0], lid);
  b.pose(lid, { axis: [1, 0, 0], deg: -62 });

  box("treasureFalseBottom", [cx, 0.635, cz], [0.88, 0.08, 0.59], C.goldDark);
  for (let i = 0; i < 23; i++) {
    const x = cx + (random() - 0.5) * 0.76, z = cz + (random() - 0.5) * 0.49;
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.018, 8), i % 4 ? C.gold : C.goldLight, {
      at: [x, 0.69 + random() * 0.065, z],
      rotation: [(random() - 0.5) * 22, random() * 90, (random() - 0.5) * 20],
      bone: root, name: "octagonalTreasureCoin",
    });
  }
  for (const [dx, dz, color] of [
    [-0.23, 0.08, "#46dfc3"], [0.20, -0.06, "#bc6dc8"], [0.02, 0.15, "#7ad5e3"],
  ] as [number, number, string][]) {
    glow(b.part(new THREE.OctahedronGeometry(0.10, 0), color, {
      at: [cx + dx, 0.78, cz + dz], scale: [0.72, 1.15, 0.72], bone: root, name: "lootGem",
    }), 0.32);
  }
  for (const [x, z, stack] of [
    [-0.25, 0.10, 3], [-0.34, 0.17, 1], [-0.42, 0.28, 1], [-0.20, 0.29, 2], [-0.05, 0.17, 1],
  ]) {
    for (let j = 0; j < stack; j++)
      b.part(new THREE.CylinderGeometry(0.040, 0.040, 0.014, 8), C.gold,
        { at: [x, 0.181 + j * 0.014, z], bone: root, name: "spilledGoldCoin" });
    box("coinStampedSquare", [x, 0.190 + (stack - 1) * 0.014, z],
      [0.017, 0.004, 0.017], C.goldLight, [0, 45, 0]);
  }

  function barrel(x: number, z: number, radius: number, height: number, label: boolean) {
    const y0 = 0.17;
    b.lathe([
      [0, 0], [radius * 0.82, 0], [radius * 0.94, height * 0.16],
      [radius, height * 0.47], [radius * 0.94, height * 0.84],
      [radius * 0.82, height], [0, height],
    ], { at: [x, y0, z], segments: 10, color: barrelWood, bone: root, name: "tenStaveBarrel" });
    for (let j = 0; j < 10; j++) {
      const a = j / 10 * Math.PI * 2;
      const points = [[0.82, 0.015], [0.94, 0.16], [1, 0.47], [0.94, 0.84], [0.82, 0.985]]
        .map(([r, h]) => [x + Math.sin(a) * radius * r, y0 + h * height, z + Math.cos(a) * radius * r]);
      b.sweep(points, radius * 0.022, {
        section: "box", caps: "flat", color: C.woodDark, bone: root, name: "barrelStaveJoint",
      });
    }
    for (const level of [0.15, 0.50, 0.85]) {
      const r = radius * (level === 0.50 ? 1.018 : 0.953);
      const y = y0 + level * height, h = height * 0.083;
      b.lathe([[r - 0.025, -h / 2], [r + 0.012, -h / 2], [r + 0.012, h / 2], [r - 0.025, h / 2]],
        { at: [x, y, z], segments: 10, color: steelPaint, bone: root, name: "barrelIronHoop" });
      for (let j = 0; j < 5; j++) {
        const a = j / 5 * Math.PI * 2 + Math.PI / 10;
        box("hoopSquareNail", [x + Math.sin(a) * (r + 0.008), y, z + Math.cos(a) * (r + 0.008)],
          [0.025, 0.022, 0.015], C.goldDark, [0, a * 180 / Math.PI, 0]);
      }
    }
    b.part(new THREE.CylinderGeometry(radius * 0.79, radius * 0.79, 0.026, 10), barrelWood,
      { at: [x, y0 + height + 0.006, z], bone: root, name: "barrelLid" });
    for (const dx of [-0.38, 0, 0.38]) {
      const half = Math.sqrt(0.77 * 0.77 - dx * dx) * radius;
      box("barrelLidSeam", [x + dx * radius, y0 + height + 0.021, z], [0.008, 0.005, half * 2], C.woodDark);
    }
    tiled("barrelBung", [x + radius * 0.27, y0 + height + 0.028, z], [0.058, 0.025, 0.058], woodTex, 0.013);
    if (label) {
      box("barrelInventoryTag", [x, y0 + height * 0.67, z + radius * 0.98], [0.14, 0.135, 0.015], C.boneShade);
      plate("barrelInventoryStamp", [x, y0 + height * 0.67, z + radius * 0.98 + 0.009],
        [0.14, 0.135], barrelMarkTex);
    }
  }
  barrel(-0.96, -0.35, 0.255, 0.70, true);
  barrel(-1.01, 0.285, 0.205, 0.47, false);

  const tx = 0.64, tz = 0.68;
  box("trapBlackRecess", [tx, 0.181, tz], [1.035, 0.026, 0.93], C.void);
  tiled("trapBed", [tx, 0.194, tz], [0.95, 0.026, 0.85], ironTex, 0.017);
  for (const s of [-1, 1]) {
    tiled("trapLongFrame", [tx + s * 0.505, 0.214, tz], [0.065, 0.07, 0.985], ironTex, 0.015);
    tiled("trapShortFrame", [tx, 0.214, tz + s * 0.455], [1.075, 0.07, 0.066], ironTex, 0.015);
    box("trapEdgeHighlight", [tx + s * 0.505, 0.252, tz], [0.025, 0.008, 0.94], C.ironLight);
    for (const t of [-0.34, 0, 0.34])
      box("trapFrameBolt", [tx + t, 0.255, tz + s * 0.455], [0.032, 0.018, 0.032], C.ironEdge);
  }
  for (let iz = 0; iz < 3; iz++) for (let ix = 0; ix < 3; ix++) {
    const x = tx + (ix - 1) * 0.285, z = tz + (iz - 1) * 0.25;
    box("squareSpikeSocket", [x, 0.215, z], [0.194, 0.025, 0.18], C.void);
    tiled("spikeSlidingCollar", [x, 0.23, z], [0.137, 0.045, 0.137], ironTex, 0.014);
    const height = 0.34 + (ix === 1 && iz === 1 ? 0.075 : 0);
    b.part(new THREE.ConeGeometry(0.089, height, 4, 1), steelPaint, {
      at: [x, 0.25 + height / 2, z], rotation: [0, 45, 0], bone: root, name: "fourSidedTrapSpike",
    });
  }
  tiled("trapWarningPlate", [tx - 0.31, 0.266, tz + 0.454], [0.13, 0.015, 0.065], goldTex, 0.012);
  for (let i = 0; i < 3; i++)
    box("trapWarningBars", [tx - 0.35 + i * 0.038, 0.277, tz + 0.454], [0.014, 0.007, 0.05], C.void);

  // The skull has an anatomical stepped silhouette rather than a cubic face block.
  const sx = -0.62, sz = 0.89;
  box("skullCranium", [sx, 0.345, sz - 0.027], [0.238, 0.143, 0.194], bonePaint);
  box("skullUpperVault", [sx, 0.425, sz - 0.036], [0.204, 0.040, 0.166], bonePaint);
  box("skullCrown", [sx, 0.452, sz - 0.041], [0.145, 0.018, 0.115], bonePaint);
  box("skullOcciput", [sx, 0.310, sz - 0.114], [0.171, 0.105, 0.051], bonePaint);
  box("skullForehead", [sx, 0.383, sz + 0.077], [0.214, 0.068, 0.043], bonePaint);
  // A backing recessed behind the brows and cheekbones makes real eye wells.
  box("skullOrbitalBacking", [sx, 0.320, sz + 0.073], [0.186, 0.095, 0.036], C.boneShade);
  for (const s of [-1, 1]) {
    plate("insetPixelEyeSocket", [sx + s * 0.054, 0.324, sz + 0.093],
      [0.092, 0.084], socketTex);
    box("skullBrow", [sx + s * 0.056, 0.364, sz + 0.100],
      [0.095, 0.023, 0.036], C.boneLight);
    box("skullOuterOrbit", [sx + s * 0.108, 0.323, sz + 0.073],
      [0.028, 0.068, 0.067], bonePaint);
    box("skullCheekArch", [sx + s * 0.104, 0.279, sz + 0.076],
      [0.052, 0.032, 0.086], bonePaint);
    box("jawHinge", [sx + s * 0.079, 0.231, sz + 0.010],
      [0.027, 0.105, 0.041], bonePaint);
    box("jawSide", [sx + s * 0.069, 0.189, sz + 0.060],
      [0.028, 0.028, 0.123], bonePaint);
  }
  box("skullNoseBridge", [sx, 0.330, sz + 0.104], [0.024, 0.063, 0.031], C.bone);
  box("skullMaxilla", [sx, 0.258, sz + 0.092], [0.135, 0.044, 0.069], bonePaint);
  box("nasalCavityTop", [sx, 0.288, sz + 0.128], [0.020, 0.027, 0.007], C.void);
  box("nasalCavityBase", [sx, 0.276, sz + 0.129], [0.037, 0.014, 0.007], C.void);
  box("skullJawChin", [sx, 0.186, sz + 0.108], [0.151, 0.028, 0.037], bonePaint);
  for (let i = 0; i < 5; i++) {
    const x = sx + (i - 2) * 0.026;
    box("upperTooth", [x, 0.228, sz + 0.117], [0.020, 0.023, 0.024], C.boneLight);
    box("lowerTooth", [x, 0.207, sz + 0.117], [0.020, 0.017, 0.024], C.bone);
  }
  box("skullCrownCrackA", [sx - 0.029, 0.462, sz - 0.045], [0.009, 0.003, 0.064], C.boneShade);
  box("skullCrownCrackB", [sx - 0.017, 0.462, sz - 0.072], [0.033, 0.003, 0.009], C.boneShade);

  function looseBone(x: number, z: number, length: number, angle: number) {
    const a = angle * Math.PI / 180;
    const axis = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    const side = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));
    const center = new THREE.Vector3(x, 0.211, z);
    const p0 = center.clone().addScaledVector(axis, -length / 2);
    const p1 = center.clone().addScaledVector(axis, length / 2);
    b.rod(p0, p1, 0.022, { section: "box", bone: root, color: bonePaint, name: "looseBoneShaft" });
    for (const p of [p0, p1]) for (const s of [-1, 1]) {
      const q = p.clone().addScaledVector(side, s * 0.023);
      box("boneKnuckle", [q.x, 0.215, q.z], [0.056, 0.067, 0.052], bonePaint, [0, -angle, 0]);
    }
  }
  looseBone(-0.88, 0.69, 0.30, 37);
  looseBone(-0.29, 0.94, 0.30, -32);
  looseBone(-0.34, 0.59, 0.22, 75);
  looseBone(-1.01, 1.01, 0.22, -12);

  function torch(s: number) {
    const x = s * 1.10, z = -0.665;
    tiled("torchWallPlate", [x, 1.13, -0.767], [0.15, 0.29, 0.045], ironTex, 0.014);
    for (const dy of [-0.10, 0.10]) rivet([x, 1.13 + dy, -0.737], 0.026);
    beam([x, 1.04, -0.74], [x, 1.04, -0.47], 0.052, C.iron, "sconceBracket");
    beam([x, 1.04, -0.47], [x, 1.33, z], 0.052, C.iron, "sconceDiagonal");
    beam([x, 1.13, z], [x, 1.55, z], 0.063, barrelWood, "torchWoodHandle");
    for (const y of [1.23, 1.39, 1.49])
      tiled("torchHandleBand", [x, y, z], [0.083, 0.038, 0.083], ironTex, 0.013);
    b.lathe([
      [0.035, 0], [0.08, 0.035], [0.115, 0.11],
      [0.095, 0.13], [0.065, 0.055], [0.027, 0.025],
    ], { at: [x, 1.43, z], segments: 8, color: steelPaint, bone: root, name: "torchIronBasket" });
    glow(box("hotCoals", [x, 1.555, z], [0.135, 0.035, 0.12], "#e95325"), 0.8);
    const outer = stepped([[0, 3], [0, 6], [0, 8], [0, 11], [0, 9], [0, 7], [0, 10], [0, 6]], 0.032);
    const middle = stepped([[0, 3], [0, 5], [0, 8], [0, 7], [0, 5]], 0.032);
    const core = stepped([[0, 2], [0, 4], [0, 5], [0, 3]], 0.026);
    glow(b.extrude(outer, {
      at: [x - 0.128, 1.55, z], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.055, color: "#dc4d27", bone: root, name: "steppedOuterFlame",
    }), 1);
    for (const face of [-1, 1]) {
      glow(b.extrude(middle, {
        at: [x - 0.080, 1.554, z + face * 0.036], x: [1, 0, 0], y: [0, 1, 0],
        thickness: 0.032, color: "#ffac32", bone: root, name: "amberFlameFace",
      }), 1.25);
      glow(b.extrude(core, {
        at: [x - 0.052, 1.556, z + face * 0.059], x: [1, 0, 0], y: [0, 1, 0],
        thickness: 0.025, color: "#fff0a1", bone: root, name: "flameHeartFace",
      }), 1.4);
    }
    glow(b.extrude(middle, {
      at: [x, 1.552, z - 0.080], x: [0, 0, 1], y: [0, 1, 0],
      thickness: 0.045, color: "#ff8a29", bone: root, name: "crosswiseFlame",
    }), 1);
    for (const face of [-1, 1]) {
      glow(b.extrude(core, {
        at: [x + face * 0.032, 1.556, z - 0.052], x: [0, 0, 1], y: [0, 1, 0],
        thickness: 0.025, color: "#ffcf63", bone: root, name: "sideFlameHeart",
      }), 1.25);
    }
    for (let i = 0; i < 3; i++)
      glow(box("squareFloatingEmber", [x + (i % 2 ? -0.045 : 0.06), 1.94 + i * 0.075, z],
        [0.021, i === 1 ? 0.04 : 0.023, 0.019], i === 1 ? "#fff0a1" : "#ffac32"), 1.2);
  }
  torch(-1);
  torch(1);

  const rubble: P[] = [
    [-1.25, 0.19, -0.72], [-0.55, 0.19, -0.99], [0.86, 0.19, -0.78],
    [1.23, 0.19, -0.18], [-1.28, 0.19, 0.76], [0.03, 0.19, 1.07],
  ];
  for (let i = 0; i < rubble.length; i++) {
    const p = rubble[i];
    box("fallenMasonryChip", p, [0.10 + random() * 0.05, 0.045, 0.065],
      stonePaint, [0, random() * 70, 0]);
    if (i % 2 === 0)
      box("smallMasonryChip", [p[0] + 0.08, 0.182, p[2] + 0.055], [0.038, 0.025, 0.035], C.stone);
  }
  for (const [x, z] of [[-1.22, -0.84], [1.23, -0.83], [-1.19, 0.48], [0.84, -0.98]])
    for (let i = 0; i < 4; i++)
      box("squareMossPatch", [x + (i % 2) * 0.035, 0.179, z + Math.floor(i / 2) * 0.027],
        [0.033, 0.008, 0.025], i % 2 ? "#586c48" : "#3d5242");

  return b.root;
}
```