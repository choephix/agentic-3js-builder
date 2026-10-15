import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { arc, catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { noise } from "../../../../src/paint";
import {
  bayer,
  cellPaint,
  pick,
  pixelArt,
  pixelTexture,
  skinBox,
  skinLayout,
  snapColor,
  stepped,
  tileBox,
} from "../../../../kits/pixel";

export const meta = {
  name: "Koala on a Eucalyptus Branch Stand",
  description:
    "A pixel-art koala sitting astride a smooth-barked eucalyptus branch, hugging it with both opposable-thumbed paws and clasping it with its feet, mounted on a wooden display plinth with a brass plaque, leaf litter and moss.",
  style: "pixel art",
  commit: "88fc1f0",
};

const T = 0.02; // body texel
const H = 0.01; // fine texel (half)

// ---------------------------------------------------------------------------------------------------------------
// Palette
const GREY = ["#23262d", "#383c45", "#4e535f", "#666c79", "#80868f", "#9fa5ae", "#bcc1c9", "#d8dbe0", "#eef0f2"].map((c) =>
  snapColor(c, 32),
);
const RUMP = ["#3b322f", "#52463f", "#6b5c52", "#857465"];
const PAWC = ["#15151a", "#202027", "#2f2f39", "#454552"];
const BARKC = ["#6a5c4e", "#8a7b66", "#a79a82", "#c3b79d", "#d9cdb3", "#e8dfca"];
const BARK_GREEN = ["#8f9a7c", "#a9b394", "#bcc4a6"];
const BARK_PINK = ["#b98f7b", "#cfa890"];
const WOOD = ["#3a2616", "#51351e", "#6b4828", "#85603a", "#a37a4c"];
const MOSS = ["#24401c", "#34581f", "#4a7a2a", "#6ea03c"];
const CLAW = "#efe6d0";
const TWIG = "#7a4a3a";
const BRASS = "#d3a53c";
const BRASS_D = "#8b6a22";
const NUT = "#8a7a4a";
const NUT_D = "#5b4c2c";
const PEBBLE = "#8c8c92";
const PEBBLE_D = "#5f5f68";
const FLOWER = "#f0c34a";

const r = rng(11);

// ---------------------------------------------------------------------------------------------------------------
// Paints
const FUR = cellPaint(
  T,
  (c) => {
    const { x, y, z } = c.at;
    let v = 0.4 + 0.1 * c.n.y + 0.26 * (noise(c.at, 0.1, 4) - 0.5);
    const chest = c.n.z > 0.25 && Math.abs(x) < 0.12 && y > 0.64 && y < 1.07 && z > -0.02;
    if (chest && c.random(5) < 0.9 - Math.abs(x) * 3) v = 0.82 + 0.12 * (noise(c.at, 0.06, 2) - 0.5);
    if (y < 0.78 && z < 0.02 && c.n.z < 0.1 && Math.abs(x) < 0.17 && noise(c.at, 0.12, 9) > 0.46)
      return c.pick(RUMP, 0.35 + 0.5 * (noise(c.at, 0.05, 3) - 0.3));
    // pale inner arms and thigh fronts
    if (c.n.z > 0.5 && y < 0.9 && Math.abs(x) > 0.1) v += 0.14;
    const k = c.random(1);
    if (k < 0.08) v += 0.2;
    else if (k < 0.15) v -= 0.18;
    return c.pick(GREY, Math.min(Math.max(v, 0), 1));
  },
  { dither: true },
);

const PAW = cellPaint(
  H * 2,
  (c) => c.pick(PAWC, 0.35 + 0.5 * c.random(2) + 0.15 * c.n.y),
  { dither: true },
);

const BARK = cellPaint(
  T,
  (c) => {
    const q = new THREE.Vector3(c.at.x * 3.2, c.at.y * 0.45, c.at.z * 3.2);
    const n1 = noise(q, 0.11, 7);
    const n2 = noise(q, 0.045, 3);
    const y = c.at.y;
    if (y < 0.3 && n2 > 0.52 + y * 0.4) return c.pick(["#4d4036", "#625246", "#7a6957"], 0.3 + 0.7 * n1);
    const tint = noise(new THREE.Vector3(c.at.x * 2, c.at.y * 0.25, c.at.z * 2), 0.18, 21);
    if (tint > 0.62) return c.pick(BARK_GREEN, n1);
    if (tint < 0.3 && n2 > 0.4) return c.pick(BARK_PINK, n1);
    if (c.random(4) < 0.04) return "#4d4036"; // lenticels
    if (c.random(8) < 0.06) return "#f1ead8";
    return c.pick(BARKC, 0.25 + 0.7 * n1 - (n2 > 0.62 ? 0.25 : 0));
  },
  { dither: true },
);

const EARIN = cellPaint(
  H,
  (c) => {
    const k = c.random(3);
    const v = 0.78 + 0.18 * (noise(c.at, 0.03, 1) - 0.5) - (k < 0.12 ? 0.25 : 0);
    return c.pick(GREY, v);
  },
  { dither: true },
);

// ---------------------------------------------------------------------------------------------------------------
// Textures
const TUFT = pixelArt(["w...w", "w.w.w", "wwwww", "wgwgw", "ggggg"], { w: "#ffffff", g: "#d2d2d2" });
const BIGTUFT = pixelArt(
  ["..w..w.", "w.w..ww", "ww.w.ww", "wwwwwww", "wgwwgww", "ggggggg"],
  { w: "#ffffff", g: "#c8c8c8" },
);

function leafTexture(pal: string[], rib: string) {
  const w = 6;
  const h = 19;
  return pixelTexture(w, h, (g) => {
    for (let y = h - 1; y >= 0; y--) {
      const t = (h - 1 - y) / (h - 1);
      if (y >= h - 2) {
        g.set(2, y, "#7a5a3a");
        continue;
      }
      const hw = 2.6 * Math.sin(Math.PI * Math.pow(t, 0.72)) + 0.2;
      const cx = 2 + 1.5 * t * t;
      const x0 = Math.round(cx - hw);
      const x1 = Math.round(cx + hw);
      for (let x = x0; x <= x1; x++) {
        const edge = x === x0 || x === x1;
        const ribc = x === Math.round(cx);
        g.set(x, y, ribc ? rib : edge ? pal[0] : x < cx ? pal[1] : pal[2]);
      }
    }
  });
}
const LEAF_A = leafTexture(["#2b5448", "#3c7461", "#4f8c76"], "#a7cdb4");
const LEAF_B = leafTexture(["#35604f", "#4a8470", "#69a58c"], "#c4dfcc");
const LEAF_C = leafTexture(["#4a6b3c", "#6a8f4a", "#86ad60"], "#d6e6b0");

const BARKSTRIP = pixelArt(
  ["bbc", "bdc", "bdc", "bdb", "bdb", "cdb", "ccb", ".cb", ".b."],
  { b: "#b8a78a", c: "#d9ccb0", d: "#8f7f66" },
);
const BARKSTRIP2 = pixelArt(
  ["pp.", "pdp", "pdp", "pdp", ".dp", ".pp", "..p"],
  { p: "#d2b2a0", d: "#a0806c" },
);

const GLYPH: Record<string, string[]> = {
  K: ["x.x", "x.x", "xx.", "x.x", "x.x"],
  O: ["xxx", "x.x", "x.x", "x.x", "xxx"],
  A: [".x.", "x.x", "xxx", "x.x", "x.x"],
  L: ["x..", "x..", "x..", "x..", "xxx"],
};
const PLAQUE = pixelTexture(23, 9, (g) => {
  g.fill((x, y) => (x === 0 || y === 0 ? "#f0cf6a" : x === 22 || y === 8 ? "#7a5a1c" : "#c99a34"));
  g.set(1, 1, "#7a5a1c");
  g.set(21, 1, "#7a5a1c");
  g.set(1, 7, "#7a5a1c");
  g.set(21, 7, "#7a5a1c");
  "KOALA".split("").forEach((ch, i) => g.stamp(3 + i * 4, 2, GLYPH[ch], { x: "#3b2808" }));
});

const WOODTILE = pixelTexture(88, 72, (g) => {
  g.fill((x, y) => {
    const row = Math.floor(y / 8);
    const ly = y % 8;
    if (ly === 0) return WOOD[0];
    const base = [0.45, 0.6, 0.38, 0.55, 0.7][row % 5];
    const grain = Math.sin(x * 0.35 + row * 2.3) * 0.12 + (((x * 7 + row * 13) % 11) < 1 ? -0.15 : 0);
    const seam = (x + row * 29) % 44 === 0;
    if (seam) return WOOD[0];
    return pick(WOOD, base + grain + (ly === 1 ? 0.08 : 0), bayer(x, y));
  });
});
const DARKWOOD = pixelTexture(96, 80, (g) => {
  g.fill((x, y) => {
    const base = 0.25 + 0.15 * Math.sin(x * 0.3 + Math.floor(y / 10) * 1.9);
    return pick(WOOD, base + (y % 10 === 0 ? -0.12 : 0) + (r() < 0.05 ? 0.1 : 0), bayer(x, y));
  });
});
const MOSSTILE = pixelTexture(16, 16, (g) => {
  g.fill((x, y) => pick(MOSS, 0.35 + 0.55 * r() + (y < 6 ? 0.1 : 0), bayer(x, y)));
});

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "koala" });

  // =============================================================================================================
  // Skeleton
  const stand = b.joint("stand", { at: [0, 0, 0] });

  const spinePts = [
    [0, 0.74, -0.07],
    [0, 0.87, -0.04],
    [0, 0.99, 0.0],
    [0, 1.07, 0.03],
  ];
  const spine = b.chain("spine", catmull(spinePts), {
    parent: stand,
    names: ["hips", "spine", "chest"],
    role: "spine",
  });
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    [
      [0, 1.07, 0.03],
      [0, 1.11, 0.05],
    ],
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 1.11, 0.05], dir: [0, 0.2, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.09, up: -0.02 }),
    aim: head.local({ forward: 0.2, up: -0.02 }),
    role: "jaw",
  });

  // eucalyptus seat branch (centreline) -- defined early: hands and feet grip it
  const SEAT = [
    [0, 0.4, -0.36],
    [0, 0.46, -0.28],
    [0, 0.52, -0.14],
    [0, 0.555, 0.02],
    [0, 0.585, 0.18],
    [0, 0.63, 0.34],
    [0, 0.69, 0.5],
    [0, 0.76, 0.64],
  ];
  const SEATR = [0.062, 0.056, 0.05, 0.047, 0.044, 0.04, 0.034, 0.027];
  const seatPath = catmull(SEAT);
  const seatR = (t: number) => {
    const f = t * (SEATR.length - 1);
    const i = Math.min(Math.floor(f), SEATR.length - 2);
    return SEATR[i] + (SEATR[i + 1] - SEATR[i]) * (f - i);
  };
  const grabAt = (z: number) => {
    const t = seatPath.closestT([0, 0.6, z]);
    return { p: seatPath.at(t), tan: seatPath.tangentAt(t), r: seatR(t) };
  };

  // =============================================================================================================
  // Body
  const bodyTable: [number, number, number][] = [
    [0, 0.168, 0.168],
    [0.3, 0.172, 0.168],
    [0.55, 0.16, 0.155],
    [0.8, 0.135, 0.13],
    [1, 0.09, 0.09],
  ];
  const bodyR = (t: number): [number, number] => {
    for (let i = 0; i < bodyTable.length - 1; i++) {
      const a = bodyTable[i];
      const c = bodyTable[i + 1];
      if (t <= c[0]) {
        const k = (t - a[0]) / (c[0] - a[0]);
        return [a[1] + (c[1] - a[1]) * k, a[2] + (c[2] - a[2]) * k];
      }
    }
    return [bodyTable[4][1], bodyTable[4][2]];
  };
  const body = b.sweep(spine, bodyR, { color: FUR, sides: 10, name: "body" });
  b.sweep(neck, 0.085, { color: FUR, sides: 8, name: "neckTube" });

  // =============================================================================================================
  // Head
  const layout = skinLayout(
    { skull: [22, 17, 17], muzzle: [10, 7, 5], nose: [9, 5, 5], jaw: [9, 3, 9] },
    80,
  );
  const SHEET = pixelTexture(layout.size[0], layout.size[1], (g) => {
    const fur = (rect: readonly [number, number, number, number], base: number, spread = 0.2) =>
      g.fill((x, y) => pick(GREY, base + spread * (r() - 0.5) + (r() < 0.07 ? 0.14 : r() < 0.1 ? -0.14 : 0), bayer(x, y)), rect);
    // skull
    const sk = layout.faces.skull;
    fur(sk.py, 0.42);
    fur(sk.ny, 0.6);
    fur(sk.nz, 0.45);
    for (const side of [sk.px, sk.nx]) {
      g.fill((x, y, w, h) => {
        const down = y / h;
        const cheek = Math.max(0, down - 0.45) * 1.6;
        return pick(GREY, 0.45 + cheek + 0.2 * (r() - 0.5) + (r() < 0.07 ? 0.14 : 0), bayer(x, y));
      }, side);
    }
    g.fill((x, y, w, h) => {
      const fx = Math.min(x, w - 1 - x);
      const cheek = Math.max(0, 1 - fx / 7) * Math.max(0, (y - 6) / 11);
      const brow = y >= 3 && y <= 4 ? -0.1 : 0;
      return pick(GREY, 0.46 + 0.75 * cheek + brow + 0.2 * (r() - 0.5) + (r() < 0.06 ? 0.14 : 0), bayer(x, y));
    }, sk.pz);
    // eyes: dark ring, black bead, highlight
    const fz = sk.pz;
    for (const ex of [3, 16]) {
      g.stamp(fz[0] + ex, fz[1] + 5, ["dddd", "dkkd", "dkkd", "dkkd", ".dd."], { d: GREY[1], k: "#08080c" });
      g.set(fz[0] + ex + (ex < 10 ? 2 : 1), fz[1] + 7, "#e8eef5");
    }
    // eyebrow shadow
    g.stamp(fz[0] + 2, fz[1] + 4, ["ddddd"], { d: GREY[2] });
    g.stamp(fz[0] + 15, fz[1] + 4, ["ddddd"], { d: GREY[2] });
    // muzzle
    const mz = layout.faces.muzzle;
    for (const f of Object.values(mz)) fur(f, 0.74, 0.18);
    g.fill((x, y) => (y === 5 ? GREY[1] : undefined), mz.pz);
    g.stamp(mz.pz[0] + 1, mz.pz[1] + 3, ["k...k"], { k: GREY[3] });
    g.stamp(mz.pz[0] + 4, mz.pz[1] + 6, ["kk"], { k: GREY[2] });
    // nose
    const ns = layout.faces.nose;
    for (const f of Object.values(ns))
      g.fill((x, y) => pick(["#0a0a0e", "#16161d", "#262631", "#3e3e4c"], 0.3 + 0.35 * r(), bayer(x, y)), f);
    g.stamp(ns.pz[0], ns.pz[1], ["..........", ".hh.......", ".h........", ".........."], { h: "#80849a", ".": "" });
    g.stamp(ns.pz[0] + 1, ns.pz[1] + 3, ["k.....k"], { k: "#000000" });
    g.stamp(ns.py[0] + 1, ns.py[1] + 1, ["hhh"], { h: "#6b6f84" });
    // jaw
    const jw = layout.faces.jaw;
    for (const f of Object.values(jw)) fur(f, 0.85, 0.12);
    g.fill(() => "#2a2228", jw.py);
    g.fill((x, y) => (y === 0 ? GREY[1] : undefined), jw.pz);
  });

  const skullC = head.local({ forward: 0.06, up: 0.055 });
  const skull = b.part(skinBox(SHEET, layout.faces.skull, H), "#ffffff", { texture: SHEET, bone: head, at: skullC, name: "skull" });
  b.part(skinBox(SHEET, layout.faces.muzzle, H), "#ffffff", {
    texture: SHEET,
    bone: head,
    at: head.local({ forward: 0.131, up: 0.025 }),
    name: "muzzle",
  });
  b.part(skinBox(SHEET, layout.faces.nose, H), "#ffffff", {
    texture: SHEET,
    bone: head,
    at: head.local({ forward: 0.162, up: 0.065 }),
    name: "nose",
  });
  b.part(skinBox(SHEET, layout.faces.jaw, H), "#ffffff", {
    texture: SHEET,
    bone: jaw,
    at: head.local({ forward: 0.076, up: -0.022 }),
    name: "lowerJaw",
  });
  // cheek fluff blocks (stepped, chunky)
  const FLUFF = stepped(
    [
      [0, 2],
      [0, 3],
      [0, 3],
      [1, 3],
      [1, 2],
    ],
    H * 2,
    { rows: true },
  );
  for (const s of [1, -1]) {
    b.extrude(FLUFF, {
      at: head.local({ forward: 0.09, up: -0.005, left: s * 0.105 }),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.05,
      color: cellPaint(H * 2, (c) => c.pick(GREY, 0.82 + 0.15 * (c.random(1) - 0.5)), { dither: true }),
      bone: head,
      name: s > 0 ? "cheekL" : "cheekR",
    });
  }

  // ears
  const EAR = stepped(
    [3, 4, 5, 6, 6, 7, 7, 7, 7, 6, 6, 5, 4, 3].map((hw) => [-hw, hw] as [number, number]),
    H * 1.6,
    { rows: true, start: -7 },
  );
  const EARIN_O = stepped(
    [2, 3, 4, 5, 5, 5, 5, 5, 5, 5, 4, 3, 2].map((hw) => [-hw, hw] as [number, number]),
    H * 1.6,
    { rows: true, start: -6.5 },
  );
  for (const [s, N] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const n = new THREE.Vector3(s * 0.5, 0.1, 0.85).normalize();
    const base = head.local({ forward: 0.06, up: 0.13, left: s * 0.105 });
    const ear = b.joint(`ear${N}`, {
      parent: head,
      at: base,
      dir: [s * 0.35, 1, -0.1],
      role: "hinge",
    });
    const ec = new THREE.Vector3(base.x + s * 0.035, base.y + 0.04, base.z - 0.005);
    const xDir: [number, number, number] = [0.85, 0, -0.5 * s];
    b.extrude(EAR, { at: ec, x: xDir, y: [0, 1, 0], thickness: 0.03, bevel: 0.004, color: FUR, bone: ear, name: `ear${N}` });
    const ec2 = ec.clone().addScaledVector(n, 0.017);
    b.extrude(EARIN_O, { at: ec2, x: xDir, y: [0, 1, 0], thickness: 0.012, color: EARIN, bone: ear, name: `earIn${N}` });
    // fringe of white tufts round the ear
    const rim = b.ring(frame(ec2, n), { count: 16, radius: 0.088, fromDeg: 0, toDeg: 337 });
    b.cards(rim.items, TUFT, { size: [0.04, 0.045], lean: 62, flow: [0, 0, 1], bone: ear, color: "#ffffff", vary: 0.25, rng: r });
  }

  // forehead and cheek tufts
  const crownHits = b.surface(skull).scatter(14, { rng: rng(3), minDist: 0.045, filter: (h) => h.n.y > 0.7 });
  b.cards(crownHits, TUFT, { size: [0.035, 0.04], lean: 35, flow: [0, 0, -1], color: GREY[4], vary: 0.3, rng: rng(5), bone: head });
  const cheekHits = b.surface(skull).scatter(40, {
    rng: rng(6),
    minDist: 0.03,
    filter: (h) => (Math.abs(h.n.x) > 0.7 && h.at.y < 1.2) || (h.n.z > 0.7 && Math.abs(h.at.x) > 0.06 && h.at.y < 1.17),
  });
  b.cards(cheekHits, BIGTUFT, {
    size: [0.045, 0.05],
    lean: 60,
    flow: (f) => [Math.sign(f.at.x) * 0.5, -0.8, -0.3],
    color: "#ffffff",
    vary: 0.3,
    rng: rng(8),
    bone: head,
  });
  // chin tuft
  const chinHits = b.surface(skull).scatter(6, { rng: rng(9), minDist: 0.03, filter: (h) => h.n.y < -0.7 });
  b.cards(chinHits, BIGTUFT, { size: [0.04, 0.045], lean: 50, flow: [0, -0.5, 0.5], color: "#ffffff", rng: rng(2), bone: head });

  // =============================================================================================================
  // Eucalyptus stand: plinth, trunk, seat branch, limbs
  const wood = (size: [number, number, number], tile: THREE.Texture, texel: number, at: [number, number, number]) =>
    b.part(tileBox(size, tile, texel, { rand: rng(4) }), "#ffffff", { texture: tile, bone: stand, at });
  wood([0.9, 0.04, 0.76], DARKWOOD, H, [0, 0.02, 0]);
  wood([0.82, 0.03, 0.68], WOODTILE, H, [0, 0.055, 0]);
  // brass corner caps and screws (merged)
  const caps: THREE.BufferGeometry[] = [];
  const screws: THREE.BufferGeometry[] = [];
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      caps.push(new THREE.BoxGeometry(0.1, 0.012, 0.014).translate(sx * 0.36, 0.0705, sz * 0.335));
      caps.push(new THREE.BoxGeometry(0.014, 0.012, 0.1).translate(sx * 0.405, 0.0705, sz * 0.29));
      caps.push(new THREE.BoxGeometry(0.014, 0.012, 0.1).translate(sx * 0.405, 0.0705, sz * 0.29));
      screws.push(new THREE.BoxGeometry(0.012, 0.006, 0.012).translate(sx * 0.4, 0.0755, sz * 0.335));
      screws.push(new THREE.BoxGeometry(0.012, 0.006, 0.012).translate(sx * 0.36, 0.0755, sz * 0.36));
    }
  b.part(mergeGeometries(caps), BRASS, { bone: stand, at: [0, 0, 0] });
  b.part(mergeGeometries(screws), BRASS_D, { bone: stand, at: [0, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.23, 0.09), "#ffffff", {
    texture: PLAQUE,
    bone: stand,
    at: [0, 0.0715, 0.27],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    name: "plaque",
  });
  b.part(new THREE.BoxGeometry(0.25, 0.004, 0.11), BRASS_D, { bone: stand, at: [0, 0.0705, 0.27] });

  // trunk
  const TRUNK = [
    [0, 0.05, -0.34],
    [0, 0.25, -0.335],
    [0, 0.5, -0.32],
    [0, 0.75, -0.31],
    [0, 1.0, -0.3],
    [0.01, 1.2, -0.3],
    [0.03, 1.4, -0.31],
  ];
  const trunkPath = catmull(TRUNK);
  const trunk = b.sweep(trunkPath, [0.098, 0.074, 0.064, 0.058, 0.052, 0.046, 0.04, 0.034].slice(0, 7), {
    color: BARK,
    bone: stand,
    sides: 10,
    name: "trunk",
  });
  b.sweep(seatPath, SEATR, { color: BARK, bone: stand, sides: 10, name: "seatBranch" });
  // trunk flange on the plinth
  b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.15, 0.022],
      [0.125, 0.034],
      [0.1, 0.05],
      [0.1, 0.06],
      [0, 0.06],
    ],
    { at: [0, 0.07, -0.34], segments: 8, bone: stand, color: "#3e2a1a", name: "flange" },
  );
  const bolts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    bolts.push(new THREE.BoxGeometry(0.014, 0.01, 0.014).translate(Math.sin(a) * 0.13, 0.095, -0.34 + Math.cos(a) * 0.13));
  }
  b.part(mergeGeometries(bolts), BRASS, { bone: stand, at: [0, 0, 0] });

  // upper limbs
  const limbL = catmull([
    [0, 0.92, -0.3],
    [0.15, 1.06, -0.29],
    [0.34, 1.17, -0.27],
    [0.55, 1.3, -0.22],
  ]);
  const limbR = catmull([
    [0, 1.12, -0.3],
    [-0.14, 1.22, -0.31],
    [-0.33, 1.3, -0.33],
    [-0.52, 1.43, -0.31],
  ]);
  b.sweep(limbL, [0.042, 0.018], { color: BARK, bone: stand, sides: 8, name: "limbL" });
  b.sweep(limbR, [0.038, 0.016], { color: BARK, bone: stand, sides: 8, name: "limbR" });
  b.sweep(
    catmull([
      [0.03, 1.38, -0.31],
      [0.1, 1.5, -0.29],
      [0.2, 1.58, -0.26],
    ]),
    [0.028, 0.012],
    { color: BARK, bone: stand, sides: 8, name: "crown" },
  );
  // stubs and knot
  b.spike([0, 0.7, -0.3], [0.7, 0.3, -0.5], 0.09, 0.022, { color: "#7a6a58", bone: stand });
  b.spike([0, 0.86, -0.28], [-0.8, 0.4, -0.2], 0.08, 0.02, { color: "#7a6a58", bone: stand });
  b.part(new THREE.BoxGeometry(0.04, 0.05, 0.012), "#2e2420", { bone: stand, at: [0.0, 0.6, -0.245], rotation: [0, 0, 6] });
  b.part(new THREE.BoxGeometry(0.022, 0.03, 0.012), "#4c3d33", { bone: stand, at: [0.0, 0.6, -0.242], rotation: [0, 0, 6] });

  // peeling bark ribbons on trunk and seat branch
  const stripFrames: ReturnType<typeof trunk.at>[] = [];
  for (let i = 0; i < 26; i++) {
    const t = 0.1 + 0.8 * r();
    stripFrames.push(trunk.at(t, (r() - 0.5) * 220 + 180 * (r() < 0.5 ? 1 : 0)));
  }
  b.cards(stripFrames, [BARKSTRIP, BARKSTRIP2, BARKSTRIP], {
    size: [0.04, 0.12],
    lean: 28,
    bend: 25,
    flow: [0, -1, 0],
    vary: 0.35,
    rng: rng(13),
    bone: stand,
  });

  // =============================================================================================================
  // Leafy twigs
  const LEAVES = [LEAF_A, LEAF_B, LEAF_A, LEAF_C, LEAF_B];
  const lr = rng(21);
  const twig = (pts: number[][], r0: number, count: number, size: [number, number] = [0.06, 0.19]) => {
    const path = catmull(pts);
    b.sweep(path, [r0, 0.006], { color: TWIG, bone: stand, sides: 5 });
    const frames = [];
    for (let i = 0; i < count; i++) frames.push(frame(path.at(0.22 + (0.78 * (i + 0.5)) / count), [0, 1, 0]));
    b.cards(frames, LEAVES, {
      size,
      lean: 150,
      flow: () => [lr() - 0.5, 0, lr() - 0.5],
      vary: 0.3,
      rng: lr,
      spin: 40,
      bone: stand,
      bend: 15,
    });
    // end leaves
    const tip = path.at(1);
    const ef = [frame(tip, [0, 1, 0]), frame(tip, [0, 1, 0])];
    b.cards(ef, LEAVES, { size, lean: 135, flow: () => [lr() - 0.5, 0, lr() - 0.5], rng: lr, bone: stand });
  };
  // from limb ends and the crown
  const fan = (root: number[], dirs: number[][], len: number, r0: number, count: number) => {
    dirs.forEach((d) => {
      const m = Math.hypot(d[0], d[1], d[2]);
      const e = root.map((v, i) => v + (d[i] / m) * len);
      const mid2 = root.map((v, i) => v + (d[i] / m) * len * 0.55 + (i === 1 ? 0.03 : 0));
      twig([root, mid2, e], r0, count);
    });
  };
  fan([0.55, 1.3, -0.22], [[0.6, 0.5, 0.2], [0.7, -0.1, 0.3], [0.3, 0.6, 0.5], [0.5, 0.4, -0.6]], 0.3, 0.012, 5);
  fan([-0.52, 1.43, -0.31], [[-0.6, 0.4, 0.2], [-0.4, 0.6, 0.5], [-0.7, 0, -0.2], [-0.2, 0.7, -0.6]], 0.3, 0.012, 5);
  fan([0.2, 1.58, -0.26], [[0.4, 0.5, 0.4], [0.1, 0.8, 0.3], [-0.5, 0.5, 0.2], [0.5, 0.2, -0.4]], 0.28, 0.011, 5);
  fan([0.34, 1.17, -0.27], [[0.4, 0.2, 0.9], [0.5, -0.2, 0.2]], 0.28, 0.012, 5);
  fan([-0.33, 1.3, -0.33], [[-0.3, 0.3, 0.9], [0.3, 0.6, 0.5]], 0.26, 0.011, 5);
  fan([0.15, 1.06, -0.29], [[0.5, 0.2, 0.9]], 0.26, 0.011, 4);
  // seat branch tip, leaves right in front of the koala's face
  fan([0, 0.76, 0.64], [[0.3, 0.5, 0.7], [-0.4, 0.5, 0.5], [0.0, 0.8, 0.5]], 0.3, 0.011, 5);
  // gumnuts
  for (const [x, y, z] of [
    [0.4, 1.21, -0.25],
    [-0.38, 1.34, -0.33],
    [0.12, 1.12, -0.28],
    [-0.08, 1.2, -0.31],
    [0.06, 1.44, -0.3],
    [0.0, 0.84, 0.66],
  ]) {
    b.part(new THREE.SphereGeometry(0.018, 6, 4), NUT, { bone: stand, at: [x, y - 0.02, z] });
    b.part(new THREE.CylinderGeometry(0.0105, 0.014, 0.008, 6), NUT_D, { bone: stand, at: [x, y - 0.0, z] });
  }

  // =============================================================================================================
  // Litter on the plinth
  const litter: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 9; i++) litter.push(frame([(r() - 0.5) * 0.6, 0.0715, (r() - 0.5) * 0.45 - 0.05], [0, 1, 0]));
  b.cards(litter, [LEAF_A, LEAF_B, LEAF_C], {
    size: [0.05, 0.15],
    lean: 90,
    flow: () => [r() - 0.5, 0, r() - 0.5],
    mirror: true,
    bone: stand,
    rng: r,
    sink: 0,
  });
  for (const [x, z, w] of [
    [0.1, -0.2, 0.07],
    [-0.14, -0.18, 0.06],
    [0.22, -0.36, 0.05],
  ] as const)
    b.part(tileBox([w, 0.025, w * 0.8], MOSSTILE, H), "#ffffff", {
      texture: MOSSTILE,
      bone: stand,
      at: [x, 0.0825, z],
      rotation: [0, r() * 90, 0],
    });
  for (const [x, z, s, col] of [
    [-0.3, 0.12, 0.035, PEBBLE],
    [0.31, 0.1, 0.028, PEBBLE_D],
    [0.28, 0.2, 0.02, PEBBLE],
    [-0.27, -0.25, 0.026, PEBBLE_D],
  ] as const)
    b.part(new THREE.BoxGeometry(s * 1.3, s * 0.7, s), col, { bone: stand, at: [x, 0.0715 + s * 0.3, z], rotation: [0, r() * 90, 0] });
  // a yellow wattle blossom
  for (const [x, z] of [
    [-0.18, 0.2],
    [-0.15, 0.22],
    [-0.2, 0.23],
  ] as const)
    b.part(new THREE.BoxGeometry(0.014, 0.014, 0.014), FLOWER, { bone: stand, at: [x, 0.078, z], rotation: [0, 20, 0] });

  // =============================================================================================================
  // Limbs: arms and hind legs, both grip the branch
  const gripDigits = (
    N: string,
    sx: number,
    z: number,
    owner: { tip: THREE.Object3D | null },
    wristJoint: Parameters<typeof b.chain>[2] extends infer _ ? ReturnType<typeof b.joint> : never,
    over: number[],
    under: number[],
    rad: number,
    clawLen: number,
    prefix: string,
  ) => {
    void owner;
    const g = grabAt(z);
    const R = g.r + rad + 0.003;
    const mk = (dz: number, dir: number, ang: number, nm: string) => {
      const center = g.p.clone().addScaledVector(g.tan, dz);
      const from = center.clone().add(new THREE.Vector3(sx * R, 0.004, 0));
      const axis = g.tan.clone().multiplyScalar(dir * sx);
      const a = arc(center, from, axis, ang);
      const pts = [a.at(0), a.at(0.5), a.at(1)];
      const ch = b.chain(`${prefix}${N}${nm}`, pts, {
        parent: wristJoint,
        names: [`${prefix}${N}${nm}a`, `${prefix}${N}${nm}b`, `${prefix}${N}${nm}c`],
        role: "digit",
      });
      b.sweep(ch, [rad, rad * 0.75], { color: PAW, sides: 6 });
      b.spike(ch.tip!, ch.tip!, clawLen, rad * 0.7, { color: CLAW });
      return pts[0];
    };
    const roots: THREE.Vector3[] = [];
    over.forEach((dz, i) => roots.push(mk(dz, 1, 112, `f${i + 1}`)));
    under.forEach((dz, i) => roots.push(mk(dz, -1, 108, `t${i + 1}`)));
    return { g, roots };
  };

  for (const [sx, N] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    // ---- arm
    const zH = sx > 0 ? 0.27 : 0.35;
    const g = grabAt(zH);
    const Rg = g.r + 0.015;
    const wristT: [number, number, number] = [sx * (Rg + 0.05), g.p.y + 0.02, g.p.z - 0.06];
    const armPts = limb([sx * 0.15, 0.95, 0.02], wristT, [0.21, 0.2], [[sx, -0.25, -0.35]]);
    const arm = b.chain(`arm${N}`, armPts, {
      parent: chest,
      names: [`shoulder${N}`, `elbow${N}`, `wrist${N}`],
      role: "arm",
    });
    b.sweep(arm, [0.062, 0.05, 0.04], { color: FUR, sides: 8, name: `arm${N}` });
    const wrist = arm.tip!;
    const dg = gripDigits(N, sx, zH, arm, wrist, [-0.026, 0, 0.026], [-0.013, 0.013], 0.0125, 0.032, "finger");
    b.capsule(wrist, [sx * Rg, g.p.y + 0.012, g.p.z], [0.036, 0.03], { color: PAW, sides: 8, name: `palm${N}` });
    // wrist fur cuff
    b.ring(wrist, { count: 5, radius: 0.04 }, (it) => b.cards([it], TUFT, { size: [0.035, 0.04], lean: 50, flow: [0, -1, 0], color: GREY[5] }));
    void dg;

    // ---- hind leg
    const zF = 0.08;
    const gf = grabAt(zF);
    const Rf = gf.r + 0.016;
    const ankleT: [number, number, number] = [sx * (Rf + 0.05), gf.p.y + 0.018, gf.p.z - 0.05];
    const legPts = limb([sx * 0.13, 0.74, -0.07], ankleT, [0.24, 0.2], [[sx, 0.55, 0.3]]);
    const leg = b.chain(`leg${N}`, legPts, {
      parent: spine.joints[0],
      names: [`hip${N}`, `knee${N}`, `ankle${N}`],
      role: "leg",
      contact: [sx * 0.07, gf.p.y, gf.p.z],
    });
    b.sweep(leg, [0.088, 0.062, 0.045], { color: FUR, sides: 8, name: `leg${N}` });
    const ankle = leg.tip!;
    gripDigits(N, sx, zF, leg, ankle, [-0.04, -0.013, 0.013, 0.04], [0.0], 0.0135, 0.034, "toe");
    b.capsule(ankle, [sx * Rf, gf.p.y + 0.01, gf.p.z], [0.042, 0.034], { color: PAW, sides: 8, name: `sole${N}` });
  }

  // =============================================================================================================
  // Fur coat of tufts over the body
  const furHits = b.surface(body).scatter(90, { rng: rng(31), minDist: 0.05, filter: (h) => h.n.y > -0.4 });
  b.cards(furHits, TUFT, {
    size: [0.04, 0.05],
    lean: 55,
    flow: [0, -1, -0.2],
    color: FUR,
    vary: 0.3,
    rng: rng(33),
  });
  // rump bum fluff
  const bum = b.surface(body).scatter(18, { rng: rng(35), minDist: 0.04, filter: (h) => h.n.z < -0.3 && h.at.y < 0.85 });
  b.cards(bum, TUFT, { size: [0.045, 0.05], lean: 60, flow: [0, -1, 0], color: FUR, rng: rng(36) });
  // chest fluff
  const chestHits = b.surface(body).scatter(24, {
    rng: rng(37),
    minDist: 0.04,
    filter: (h) => h.n.z > 0.4 && h.at.y > 0.8 && Math.abs(h.at.x) < 0.1,
  });
  b.cards(chestHits, BIGTUFT, { size: [0.045, 0.05], lean: 55, flow: [0, -1, 0.2], color: "#f5f5f5", rng: rng(38) });

  return b.root;
}
