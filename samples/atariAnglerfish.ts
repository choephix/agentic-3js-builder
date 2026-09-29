// Atari anglerfish: a deep-sea anglerfish as a 1977 cartridge would have drawn it. Everything sits on one giant pixel
// grid (U = 3 cm): the body is a stack of box slices whose widths and heights step in whole pixels, so the silhouette
// is a staircase from every side; fins are stepped, ragged extrusions; the lure stalk is a right-angled staircase
// tube. Surfaces are paints quantised to U cells from a tiny palette (blue back, orange belly, purple jaws, magenta
// fins, cyan stalk) with a horizontal scanline baked in: every cell row alternates a bright and a dark shade, on side
// faces by height and on top faces by depth, so the stripes run across the model at every angle. The 3x3, 4x4 and
// 11x11 drawings (plus-shaped eyes, the hollow throat, the glowing lure and its starburst) are `svg()` pixel
// textures with their own scanline rows.
import { BoxGeometry, ConeGeometry, PlaneGeometry } from "three";
import type { BufferGeometry, Texture } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { paint } from "../src/paint";
import type { Fill } from "../src/context";
import { polyline } from "../src/path";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Atari anglerfish",
  builtBy: "Claude Sonnet 5.5",
  description:
    "Deep-sea anglerfish in Atari 2600 arcade style: stepped box-slice body with scanline stripes, underbite jaw full of needle teeth, a staircase lure stalk with a pixel starburst, ragged stepped fins.",
};

/** One pixel, in meters: every paint cell, texture texel and box step is a multiple of this. */
const U = 0.03;

// ---------------------------------------------------------------------------------------------------------------
// Palette: bold saturated hues on black. Each surface colour is a bright/dark pair that alternates by scanline.
const BLUE = ["#4438ee", "#2a1fa6", "#7a72ff"] as const; // bright, dark, sparkle
const ORANGE = ["#f28a1e", "#b05a0e"] as const;
const PURPLE = ["#8a2ee0", "#5a1a98"] as const;
const RED = ["#e42a2a", "#a01818"] as const;
const MAGENTA = ["#f0388e", "#a4205c"] as const;
const CYAN = ["#28e0f0", "#1a98a8"] as const;
const LIME = ["#6ce03c", "#3f9a22"] as const;
const YELLOW = "#fff45c";
const TOOTH = "#f6f2dc";
const WHITE = "#ffffff";

// ---------------------------------------------------------------------------------------------------------------
// Paints: hard U-sized cells; rows are the scanlines.

const hash = (a: number, b: number, c = 0) => {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/** Row, column and face id of the U cell at `p` on the face `n` looks along. Top and bottom faces run rows by depth. */
function cellOf(p: { x: number; y: number; z: number }, n: { x: number; y: number; z: number }) {
  const ax = Math.abs(n.x);
  const ay = Math.abs(n.y);
  const az = Math.abs(n.z);
  const f = (v: number) => Math.floor((v + 1e-5) / U);
  if (ay >= ax && ay >= az) return { r: f(p.z), c: f(p.x), face: 1 };
  if (ax >= az) return { r: f(p.y), c: f(p.z), face: 2 };
  return { r: f(p.y), c: f(p.x), face: 3 };
}

/** Body: blue back and flanks, orange belly, a dotted cyan lateral line, a few bright pixels. Even rows are bright. */
const BODY = paint((p, n) => {
  const { r, c, face } = cellOf(p, n);
  const bright = (r & 1) === 0;
  if (p.y < 0.24 || n.y < -0.6) return bright ? ORANGE[0] : ORANGE[1];
  if (face !== 1 && r === 13 && (c & 1) === 0) return bright ? CYAN[0] : CYAN[1];
  if (face === 1 && hash(r, c, 1) < 0.08) return BLUE[2];
  if (hash(r, c, face) < 0.06) return BLUE[2];
  return bright ? BLUE[0] : BLUE[1];
});

/** Jaws: purple skin outside, red flesh wherever a face looks into the mouth. */
const JAW = paint((p, n) => {
  const { r, c } = cellOf(p, n);
  const bright = (r & 1) === 0;
  const inward = n.x * Math.sign(p.x) < -0.6 && Math.abs(p.x) > 0.05;
  const inside =
    (n.y > 0.6 && p.y < 0.32) ||
    (n.y < -0.6 && p.y < 0.44) ||
    (inward && p.y > 0.28 && p.z > 0.2) ||
    (n.z < -0.6 && p.z > 0.45);
  if (inside) return bright ? RED[0] : RED[1];
  if (hash(r, c, 7) < 0.07) return bright ? MAGENTA[0] : MAGENTA[1];
  return bright ? PURPLE[0] : PURPLE[1];
});

/** Fins: magenta rays of alternating columns, scanlines through them, sparse lime pixels along the fringe. */
const FIN = paint((p, n) => {
  const { r, c } = cellOf(p, n);
  const bright = (r & 1) === 0;
  if (hash(r, c, 3) < 0.09) return bright ? LIME[0] : LIME[1];
  return (c + (r >> 1)) % 3 === 0 ? (bright ? ORANGE[0] : ORANGE[1]) : bright ? MAGENTA[0] : MAGENTA[1];
});

/** Lure stalk and barbels. */
const STALK = paint((p, n) => {
  const { r } = cellOf(p, n);
  return (r & 1) === 0 ? CYAN[0] : CYAN[1];
});

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures. Odd rows are dimmed: a scanline baked into every drawing.

function dim(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) =>
    Math.round(((n >> s) & 255) * k)
      .toString(16)
      .padStart(2, "0");
  return `#${ch(16)}${ch(8)}${ch(0)}`;
}

/** `rows` are strings of palette letters ("." = transparent); one rect per horizontal run. */
function pixelTexture(rows: string[], pal: Record<string, string>, scan = 0.72) {
  const h = rows.length;
  const w = rows[0].length;
  const rects: string[] = [];
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const ch = rows[y][x];
      let n = 1;
      while (x + n < w && rows[y][x + n] === ch) n++;
      if (ch !== ".")
        rects.push(`<rect x="${x}" y="${y}" width="${n}" height="1" fill="${y & 1 ? dim(pal[ch], scan) : pal[ch]}"/>`);
      x += n;
    }
  }
  // `svg()` rasterises at 8 px or more, so small grids scale up by a whole number and every pixel stays square.
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects.join("")}</svg>`,
    { size: Math.max(w, h) * Math.ceil(8 / Math.max(w, h)), pixelated: true },
  );
}

/** The starburst around the lure: white near the bulb, yellow, then cyan tips; short diagonals. */
function starTexture() {
  const N = 13;
  const mid = 6;
  const rows: string[] = [];
  for (let y = 0; y < N; y++) {
    let row = "";
    for (let x = 0; x < N; x++) {
      const dx = Math.abs(x - mid);
      const dy = Math.abs(y - mid);
      let ch = ".";
      if (dx === 0 || dy === 0) {
        const d = Math.max(dx, dy);
        ch = d <= 2 ? "." : d <= 4 ? "W" : d === 5 ? "Y" : "C";
      } else if (dx === dy && dx >= 3 && dx <= 4) ch = "Y";
      row += ch;
    }
    rows.push(row);
  }
  return pixelTexture(rows, { W: WHITE, Y: YELLOW, C: CYAN[0] }, 0.84);
}

// ---------------------------------------------------------------------------------------------------------------

type V3 = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "atariAnglerfish", paintSize: 512 });
  const random = rng(77);

  // Plus-shaped eye (yellow cross, red pupil); the hollow throat (black, red uvula and gullet); the lure (orange
  // corners, yellow rim, white core); and the starburst.
  const EYE = pixelTexture(["YYY", "YRY", "YYY"], { Y: YELLOW, R: RED[0] }, 0.8);
  const THROAT = pixelTexture(
    ["KKKKKKKKKK", "KKKKRRKKKK", "KKKKRRKKKK", "KRRRRRRRRK"],
    { K: "#000000", R: RED[1] },
    0.7,
  );
  const BULB = pixelTexture(["OYYYO", "YYWYY", "YWWWY", "YYWYY", "OYYYO"], { O: ORANGE[0], Y: YELLOW, W: WHITE }, 0.88);
  const STAR = starTexture();

  const box = (
    w: number,
    h: number,
    d: number,
    at: V3,
    color: Fill,
    bone: Joint,
    group: string,
    opts: { texture?: Texture; name?: string } = {},
  ) => b.part(new BoxGeometry(w, h, d), color, { bone, at, group, ...opts });

  // ------------------------------------------------------------------------------------------------ skeleton
  const BODY_Y = 0.39;
  const hips = b.joint("hips", { at: [0, BODY_Y, 0], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, BODY_Y, 0.06],
      [0, BODY_Y, 0.2],
    ]),
    { parent: hips, count: 2, names: ["spine1", "spine2"], role: "spine", group: "body" },
  );
  const head = b.joint("head", {
    parent: spine.joints[1],
    at: [0, BODY_Y, 0.2],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.27, 0.18],
    aim: [0, 0.27, 0.54],
    role: "jaw",
    group: "jaw",
  });
  const tail = b.chain(
    "tail",
    polyline([
      [0, BODY_Y, -0.12],
      [0, BODY_Y, -0.5],
    ]),
    { parent: hips, count: 4, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail", group: "tail" },
  );

  /** The bone a body slice centred at depth z rides. */
  const boneAt = (z: number): Joint => {
    if (z > 0.2) return head;
    if (z > 0.13) return spine.joints[1];
    if (z > 0.06) return spine.joints[0];
    if (z > -0.12) return hips;
    if (z > -0.22) return tail.joints[0];
    if (z > -0.31) return tail.joints[1];
    if (z > -0.41) return tail.joints[2];
    return tail.joints[3];
  };

  // ------------------------------------------------------------------------------------------------ body slices
  // [z, yBottom, yTop, half width]: every number a whole number of pixels, so the outline is a staircase.
  const slices: [number, number, number, number][] = [
    [0.18, 0.24, 0.6, 0.18],
    [0.12, 0.15, 0.66, 0.24],
    [0.06, 0.12, 0.69, 0.27],
    [0.0, 0.12, 0.69, 0.27],
    [-0.06, 0.12, 0.66, 0.24],
    [-0.12, 0.15, 0.6, 0.21],
    [-0.18, 0.21, 0.51, 0.15],
    [-0.24, 0.27, 0.45, 0.12],
    [-0.3, 0.3, 0.45, 0.09],
    [-0.36, 0.3, 0.42, 0.06],
  ];
  for (const [z, y0, y1, hw] of slices) {
    const g = z > 0.15 ? "head" : z < -0.15 ? "tail" : "body";
    const bone = boneAt(z);
    const depth = U * 2 + 0.006;
    // Stepped octagonal cross-section: a full-width core, then a cap of two pixels top and bottom pulled in by up to two pixels.
    const inset = Math.min(Math.max(hw - 0.06, 0), 0.06);
    if (inset === 0) {
      box(hw * 2, y1 - y0, depth, [0, (y0 + y1) / 2, z], BODY, bone, g, { name: "slice" });
      continue;
    }
    box(hw * 2, y1 - y0 - 4 * U, depth, [0, (y0 + y1) / 2, z], BODY, bone, g, { name: "slice" });
    box((hw - inset) * 2, 2 * U, depth, [0, y0 + U, z], BODY, bone, g, { name: "slice" });
    box((hw - inset) * 2, 2 * U, depth, [0, y1 - U, z], BODY, bone, g, { name: "slice" });
  }

  // ------------------------------------------------------------------------------------------------ eyes and throat
  for (const s of [1, -1]) {
    box(0.09, 0.09, 0.09, [s * 0.12, 0.705, 0.13], WHITE, head, "head", { texture: EYE, name: "eye" });
  }
  b.part(new PlaneGeometry(0.3, 0.12), WHITE, {
    bone: head,
    at: [0, 0.36, 0.222],
    group: "head",
    texture: THROAT,
    name: "throat",
  });

  // ------------------------------------------------------------------------------------------------ upper jaw
  box(0.42, 0.15, 0.18, [0, 0.495, 0.27], JAW, head, "head", { name: "brow" });
  box(0.42, 0.09, 0.12, [0, 0.465, 0.42], JAW, head, "head", { name: "upperLip" });
  for (const s of [1, -1]) box(0.06, 0.09, 0.27, [s * 0.18, 0.465, 0.315], JAW, head, "head", { name: "cheek" });

  // ------------------------------------------------------------------------------------------------ lower jaw
  box(0.54, 0.06, 0.36, [0, 0.27, 0.33], JAW, jaw, "jaw", { name: "jawFloor" });
  box(0.54, 0.18, 0.06, [0, 0.39, 0.54], JAW, jaw, "jaw", { name: "chin" });
  for (const s of [1, -1]) {
    box(0.06, 0.12, 0.18, [s * 0.24, 0.36, 0.24], JAW, jaw, "jaw", { name: "jawWall" });
    box(0.06, 0.18, 0.18, [s * 0.24, 0.39, 0.42], JAW, jaw, "jaw", { name: "jawWall" });
  }
  // The throat steps down under the jaw hinge in two orange pixel steps.
  box(0.42, 0.06, 0.21, [0, 0.21, 0.255], BODY, jaw, "jaw", { name: "underJaw" });
  box(0.3, 0.06, 0.12, [0, 0.15, 0.21], BODY, jaw, "jaw", { name: "underJaw" });

  // ------------------------------------------------------------------------------------------------ needle teeth
  const needle = (r: number, len: number): BufferGeometry => {
    const g = new ConeGeometry(r, len, 4, 1);
    g.rotateY(Math.PI / 4);
    return g;
  };
  const upperTooth = (x: number, z: number, y0: number) => {
    const len = 0.06 + random() * 0.03;
    b.part(needle(0.017, len), TOOTH, {
      bone: head,
      at: [x, y0 - len / 2, z],
      rotation: [180, 0, 0],
      group: "head",
      name: "tooth",
    });
  };
  const lowerTooth = (x: number, z: number, y0: number, min = 0.06, span = 0.03) => {
    const len = min + random() * span;
    b.part(needle(0.017, len), TOOTH, { bone: jaw, at: [x, y0 + len / 2, z], group: "jaw", name: "tooth" });
  };
  for (let i = 0; i < 9; i++) upperTooth(-0.18 + 0.045 * i, 0.465, 0.42);
  for (const s of [1, -1]) for (let i = 0; i < 5; i++) upperTooth(s * 0.18, 0.24 + 0.045 * i, 0.42);
  for (let i = 0; i < 11; i++) {
    const x = -0.24 + 0.048 * i;
    const fang = i === 1 || i === 9;
    lowerTooth(x, 0.54, 0.48, fang ? 0.17 : 0.09, fang ? 0.02 : 0.05);
  }
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) {
      const z = 0.24 + 0.055 * i;
      lowerTooth(s * 0.24, z, z < 0.33 ? 0.42 : 0.48, 0.06, 0.04);
    }

  // ------------------------------------------------------------------------------------------------ lure stalk
  const stalkPath: V3[] = [
    [0, 0.63, 0.14],
    [0, 0.87, 0.14],
    [0, 0.87, 0.32],
    [0, 0.99, 0.32],
    [0, 0.99, 0.5],
    [0, 0.87, 0.5],
  ];
  const stalk = b.chain("stalk", polyline(stalkPath), {
    parent: head,
    names: ["stalk1", "stalk2", "stalk3", "stalk4", "stalk5"],
    role: "tentacle",
    group: "lure",
  });
  b.sweep(stalk, 0.024, { section: "box", skin: "rigid", caps: "flat", overlap: 1, color: STALK, group: "lure" });
  const esca = b.joint("esca", { parent: stalk.joints[4], at: stalkPath[5], dir: [0, -1, 0], group: "lure" });
  const LURE_Y = 0.795;
  box(0.15, 0.15, 0.15, [0, LURE_Y, 0.5], WHITE, esca, "lure", { texture: BULB, name: "lure" });
  for (const x of [-0.06, 0, 0.06])
    b.rod([x, LURE_Y - 0.075, 0.5], [x, LURE_Y - 0.15, 0.5], 0.015, {
      section: "box",
      color: WHITE,
      bone: esca,
      group: "lure",
    });
  const glow = 13 * U;
  b.cards([frame([0, LURE_Y - glow / 2, 0.5], [0, 1, 0])], STAR, {
    size: glow,
    cross: true,
    sink: 0,
    bone: esca,
    color: WHITE,
  });
  b.cards([frame([0, LURE_Y, 0.5 + glow / 2], [0, 1, 0])], STAR, {
    size: glow,
    lean: 90,
    sink: 0,
    bone: esca,
    color: WHITE,
  });

  // ------------------------------------------------------------------------------------------------ pectoral and pelvic fins
  const pad = [
    [-0.06, -0.03],
    [0.09, -0.03],
    [0.09, 0.03],
    [0.12, 0.03],
    [0.12, 0.06],
    [0.06, 0.06],
    [0.06, 0.12],
    [0.03, 0.12],
    [0.03, 0.06],
    [-0.03, 0.06],
    [-0.03, 0.12],
    [-0.06, 0.12],
    [-0.06, 0.06],
    [-0.09, 0.06],
    [-0.09, 0.0],
    [-0.06, 0.0],
  ] as [number, number][];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `pectoral${side}`,
      polyline([
        [s * 0.24, 0.33, 0.06],
        [s * 0.36, 0.33, 0.06],
        [s * 0.36, 0.03, 0.06],
        [s * 0.36, 0.03, 0.15],
      ]),
      { parent: hips, names: [`pectoral${side}1`, `pectoral${side}2`, `pectoral${side}3`], role: "arm", group: "fins" },
    );
    b.sweep(arm, 0.024, { section: "box", skin: "rigid", caps: "flat", overlap: 1, color: BODY, group: "fins" });
    b.extrude(pad, {
      at: [s * 0.36, 0.015, 0.09],
      x: [0, 0, 1],
      y: [s, 0, 0],
      thickness: U,
      color: FIN,
      bone: arm.joints[2],
      group: "fins",
      name: "pectoralFin",
    });

    const leg = b.chain(
      `pelvic${side}`,
      polyline([
        [s * 0.12, 0.15, 0.0],
        [s * 0.12, 0.03, 0.0],
        [s * 0.12, 0.03, 0.09],
      ]),
      { parent: hips, names: [`pelvic${side}1`, `pelvic${side}2`], role: "leg", group: "fins" },
    );
    b.sweep(leg, 0.021, { section: "box", skin: "rigid", caps: "flat", overlap: 1, color: FIN, group: "fins" });
  }

  // ------------------------------------------------------------------------------------------------ dorsal and anal fins
  const dorsalTeeth = (h: number): [number, number][] => [
    [0, 0],
    [0.15, 0],
    [0.15, h * 0.4],
    [0.12, h * 0.4],
    [0.12, h * 0.75],
    [0.09, h * 0.75],
    [0.09, h * 0.5],
    [0.06, h * 0.5],
    [0.06, h],
    [0.03, h],
    [0.03, h * 0.6],
    [0, h * 0.6],
  ];
  const dorsals: [number, number, number, Joint][] = [
    [-0.03, 0.48, 0.33, hips],
    [-0.18, 0.39, 0.27, tail.joints[0]],
    [-0.3, 0.36, 0.21, tail.joints[1]],
  ];
  dorsals.forEach(([z, y, h, parent], i) => {
    const j = b.joint(`dorsal${i + 1}`, { parent, at: [0, y, z], dir: [0, 1, 0], role: "fan", group: "fins" });
    const hh = Math.round(h / 0.03) * 0.03;
    const outline = dorsalTeeth(hh).map(([u, v]): [number, number] => [u, Math.round(v / 0.03) * 0.03]);
    b.extrude(outline, {
      at: [0, y, z],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: U,
      color: FIN,
      bone: j,
      group: "fins",
      name: "dorsalFin",
    });
  });
  const anal = b.joint("anal1", {
    parent: tail.joints[1],
    at: [0, 0.33, -0.24],
    dir: [0, -1, 0],
    role: "fan",
    group: "fins",
  });
  b.extrude(
    [
      [0, 0],
      [0.12, 0],
      [0.12, -0.06],
      [0.09, -0.06],
      [0.09, -0.15],
      [0.06, -0.15],
      [0.06, -0.09],
      [0.03, -0.09],
      [0.03, -0.12],
      [0, -0.12],
    ],
    {
      at: [0, 0.33, -0.24],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: U,
      color: FIN,
      bone: anal,
      group: "fins",
      name: "analFin",
    },
  );

  // ------------------------------------------------------------------------------------------------ tail fin
  const tailEnd = tail.joints[3];
  b.extrude(
    [
      [0, 0.06],
      [0.03, 0.06],
      [0.03, 0.12],
      [0.06, 0.12],
      [0.06, 0.18],
      [0.09, 0.18],
      [0.09, 0.27],
      [0.12, 0.27],
      [0.12, 0.15],
      [0.15, 0.15],
      [0.15, 0.03],
      [0.12, 0.03],
      [0.12, -0.09],
      [0.15, -0.09],
      [0.15, -0.18],
      [0.12, -0.18],
      [0.12, -0.24],
      [0.09, -0.24],
      [0.09, -0.15],
      [0.06, -0.15],
      [0.06, -0.09],
      [0.03, -0.09],
      [0.03, -0.06],
      [0, -0.06],
    ],
    {
      at: [0, BODY_Y, -0.36],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: U,
      color: FIN,
      bone: tailEnd,
      group: "tail",
      name: "tailFin",
    },
  );

  // Open the mouth a little so the teeth show.
  b.pose(jaw, { axis: [1, 0, 0], deg: 18 });

  return b.root;
}
