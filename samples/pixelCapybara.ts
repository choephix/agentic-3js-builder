// Pixel capybara: a very chill capybara soaking in a little octagonal hinoki hot-spring tub, chin resting on the rim
// and front paws draped over it, a folded towel and a yuzu balanced on its head, a duckling perched on its back, and
// steam puffs rising off the water; two more yuzu bob about and mossy onsen rocks sit round the base.
// Style: pixel art, post-Minecraft low-poly, cozy. Everything shares one texel: 1.5 cm on the capybara, tub, water,
// rocks and steam, 0.75 cm (half) on the duckling, yuzu and towel. The wood staves are hand-placed `svg()` pixel
// drawings cropped 1:1 onto boxes; every paint (fur, wet fur, water, rocks, copper hoops,
// steam, yuzu, towel, duckling fluff) is quantised into square hard-edged cells from a small palette. Volumes are
// boxes, stepped ziggurats, an eight-sided faceted body tube and pixel-staircase extrusions (ears, duckling wings).
import { BoxGeometry, CylinderGeometry, PlaneGeometry, SphereGeometry } from "three";
import type { BufferGeometry } from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { paint } from "../src/paint";
import { catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Pixel capybara",
  description:
    "Pixel-art capybara soaking in a wooden hot-spring tub with a yuzu and towel on its head, a duckling on its back and rising steam puffs.",
};

type V3 = [number, number, number];
type Pal = Record<string, string>;

const WHITE = "#ffffff";

/** One pixel, in meters: capybara, tub, water, rocks and steam. The duckling, yuzu and towel use half of it. */
const TEXEL = 0.015;
const HALF = TEXEL / 2;

const RIM = 0.3;
const WATER_TOP = 0.2;
/** Cosine of half an octagon's corner angle: a lathe's corner radius is the flat's distance over this. */
const OCT = Math.cos(Math.PI / 8);

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures.

const canvas = (w: number, h: number, fill = ".") => Array.from({ length: h }, () => Array<string>(w).fill(fill));

const cellHash = (x: number, y: number, z: number, seed: number) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177) ^ Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/** A pixel grid as an `svg()` drawing: one rect per horizontal run, rasterised 1:1 without smoothing. */
function pixels(rows: string[][], pal: Pal) {
  const h = rows.length;
  const w = rows[0].length;
  const rects: string[] = [];
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const c = rows[y][x];
      let n = 1;
      while (x + n < w && rows[y][x + n] === c) n++;
      if (c !== ".") rects.push(`<rect x="${x}" y="${y}" width="${n}" height="1" fill="${pal[c]}"/>`);
      x += n;
    }
  }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects.join("")}</svg>`,
    { size: Math.max(w, h), pixelated: true },
  );
}

const STAVE_W = 28;
const STAVE_H = 24;

/** One hinoki stave, 28 pixels wide: vertical grain in four tones with broken runs, a dark seam either side, a knot or two. */
function woodTexture(seed: number) {
  const g = canvas(STAVE_W, STAVE_H, "m");
  const tone = (x: number) => {
    const v = cellHash(Math.floor(x / 2), 0, 0, seed);
    return v < 0.2 ? "d" : v < 0.5 ? "m" : v < 0.85 ? "l" : "h";
  };
  const shift: Record<string, string> = { d: "m", m: "l", l: "m", h: "l" };
  for (let x = 0; x < STAVE_W; x++)
    for (let y = 0; y < STAVE_H; y++) {
      const base = tone(x);
      g[y][x] = cellHash(x, y, 1, seed) < 0.14 ? shift[base] : base;
    }
  for (let k = 0; k < 2; k++) {
    const kx = 4 + Math.floor(cellHash(k, 0, 2, seed) * 18);
    const ky = 4 + Math.floor(cellHash(k, 1, 2, seed) * 14);
    g[ky][kx] = "k";
    g[ky][kx + 1] = "k";
    g[ky + 1][kx] = "k";
    g[ky - 1][kx + 1] = "d";
    g[ky + 2][kx] = "d";
  }
  for (let y = 0; y < STAVE_H; y++) {
    g[y][0] = "s";
    g[y][STAVE_W - 1] = "s";
    g[y][1] = "h";
    g[y][STAVE_W - 2] = "d";
  }
  for (let x = 0; x < STAVE_W; x++) g[STAVE_H - 1][x] = "d";
  return pixels(g, { h: "#f4dcaa", l: "#e8c68c", m: "#dcb476", d: "#c39a5e", s: "#8c6236", k: "#a87844" });
}

// ---------------------------------------------------------------------------------------------------------------
// Paints: square cells in meters, a small palette, clumps of a few cells, no gradients.

function voxels(palette: string[], seed: number, size = TEXEL) {
  return paint((p) => {
    const x = Math.floor(p.x / size);
    const y = Math.floor(p.y / size);
    const z = Math.floor(p.z / size);
    const clump = cellHash(Math.floor(x / 2), Math.floor(y / 2), Math.floor(z / 2), seed + 7);
    const v = clump * 0.5 + cellHash(x, y, z, seed) * 0.5;
    return palette[Math.min(palette.length - 1, Math.floor(v * palette.length))];
  });
}

const FUR_DRY = ["#7c4a2a", "#8f5733", "#a3683b", "#b47a44", "#c28a50"];
const FUR_WET = ["#55301c", "#653a22", "#75442a"];
const FUR_BELLY = ["#c08a58", "#d09c66", "#d9aa74"];
/** Capybara coat: reddish browns in pixel clumps, a darker back, a tan belly, wet dark fur at the waterline. */
const FUR = paint((p, n) => {
  const x = Math.floor(p.x / TEXEL);
  const y = Math.floor(p.y / TEXEL);
  const z = Math.floor(p.z / TEXEL);
  const h = cellHash(x, y, z, 1);
  const clump = cellHash(Math.floor(x / 2), Math.floor(y / 2), Math.floor(z / 2), 5);
  if (p.y < WATER_TOP + 0.02) return FUR_WET[Math.min(2, Math.floor((clump * 0.6 + h * 0.4) * 3))];
  if (n.y < -0.4) return FUR_BELLY[Math.min(2, Math.floor((clump * 0.6 + h * 0.4) * 3))];
  let v = clump * 0.55 + h * 0.45;
  if (n.y > 0.75) v -= 0.1;
  if (h > 0.97) return "#d6a062";
  return FUR_DRY[Math.max(0, Math.min(4, Math.floor(v * 5)))];
});
const LEG_FUR = voxels(["#5e3822", "#6a4027", "#764a2c", "#84532f"], 3);
const NOSE = voxels(["#4a2c1e", "#5b3826", "#5b3826", "#6b4630"], 9);
const WOOD = voxels(["#e8c68c", "#dcb476", "#f0d29c", "#dcb476"], 12);
const COPPER = voxels(["#94492a", "#b45f38", "#b45f38", "#ce7a4c"], 15);
const BAMBOO = voxels(["#b9a04a", "#c8b256", "#d6c368"], 17);
const ROCK = paint((p, n) => {
  const x = Math.floor(p.x / TEXEL);
  const y = Math.floor(p.y / TEXEL);
  const z = Math.floor(p.z / TEXEL);
  const h = cellHash(x, y, z, 31);
  const clump = cellHash(Math.floor(x / 2), Math.floor(y / 2), Math.floor(z / 2), 33);
  if (n.y > 0.6 && clump < 0.55) return h < 0.5 ? "#6f9a48" : h < 0.85 ? "#5b8a3c" : "#8fb85a";
  const v = clump * 0.55 + h * 0.45;
  return ["#585450", "#6e6a66", "#85807a", "#9a948c"][Math.min(3, Math.floor(v * 4))];
});
const STEAM = voxels(["#ffffff", "#f1f9fb", "#dcecf2", "#ffffff"], 41);
const YUZU = paint((p) => {
  const x = Math.floor(p.x / HALF);
  const y = Math.floor(p.y / HALF);
  const z = Math.floor(p.z / HALF);
  const h = cellHash(x, y, z, 51);
  if (h < 0.1) return "#d68f0c";
  if (h > 0.93) return "#fff09a";
  const clump = cellHash(Math.floor(x / 2), Math.floor(y / 2), Math.floor(z / 2), 53);
  return clump < 0.4 ? "#f2b514" : clump < 0.8 ? "#f7c72a" : "#fbd94a";
});
const TOWEL_Z = 0.335;
const TOWEL = paint((p) => {
  const x = Math.floor(p.x / HALF);
  const y = Math.floor(p.y / HALF);
  const z = Math.floor(p.z / HALF);
  const k = Math.floor(Math.abs(p.z - TOWEL_Z) / HALF);
  if (k === 5 || k === 6 || k === 8) return cellHash(x, y, z, 61) < 0.25 ? "#3f6fae" : "#4f86c6";
  return cellHash(x, y, z, 62) < 0.22 ? "#e6dcc6" : "#f7f0e0";
});
const DUCK = paint((p, n) => {
  const x = Math.floor(p.x / HALF);
  const y = Math.floor(p.y / HALF);
  const z = Math.floor(p.z / HALF);
  const h = cellHash(x, y, z, 71);
  if (n.y < -0.3) return h < 0.5 ? "#ffe98a" : "#ffdd55";
  if (h < 0.12) return "#f5bd2a";
  if (h > 0.9) return "#fff0a0";
  return h < 0.55 ? "#ffd23f" : "#ffdd55";
});
const DUCK_WING = voxels(["#f2b52a", "#e8a51e", "#f7c53a"], 73, HALF);

/** Water: turquoise cells, a foam ring hugging the capybara, two faint ripple rings, sparkles, a darker rim. */
const WATER = paint((p, n) => {
  if (n.y < 0.5) return "#3d97b0";
  const x = Math.floor(p.x / TEXEL);
  const z = Math.floor(p.z / TEXEL);
  const cx = (x + 0.5) * TEXEL;
  const cz = (z + 0.5) * TEXEL;
  const h = cellHash(x, 0, z, 21);
  const d = Math.hypot(cx, cz - Math.min(Math.max(cz, -0.27), 0.19));
  if (d < 0.2) return h < 0.7 ? "#eaf9f5" : "#c9efee";
  if (d < 0.24 && h < 0.45) return "#9fe0e2";
  if (d > 0.3 && d < 0.33 && h < 0.3) return "#8fd8dd";
  if (h > 0.985) return "#ffffff";
  if (Math.hypot(cx, cz) > 0.4) return h < 0.5 ? "#3f9fb6" : "#4aa9c0";
  return ["#5cc0d0", "#52b6c9", "#52b6c9", "#63c8d6"][Math.min(3, Math.floor(h * 4))];
});

// ---------------------------------------------------------------------------------------------------------------
// Geometry.

/** A box whose faces show whole-pixel crops of one tile, so any size keeps square texels. */
function pixBox(w: number, h: number, d: number, tw: number, th: number) {
  const geo = new BoxGeometry(w, h, d);
  const uv = geo.getAttribute("uv");
  const faces: [number, number][] = [
    [d, h],
    [d, h],
    [w, d],
    [w, d],
    [w, h],
    [w, h],
  ];
  faces.forEach(([fw, fh], f) => {
    const nu = Math.min(tw, Math.max(1, Math.round(fw / TEXEL)));
    const nv = Math.min(th, Math.max(1, Math.round(fh / TEXEL)));
    for (let i = 0; i < 4; i++) {
      const k = f * 4 + i;
      uv.setXY(k, uv.getX(k) * (nu / tw), uv.getY(k) * (nv / th));
    }
  });
  return geo;
}

const faceted = (geo: BufferGeometry) => {
  const flat = geo.toNonIndexed();
  flat.computeVertexNormals();
  return flat;
};

/** A pixel-staircase outline: columns `u` wide, each spanning [bottom, top] in units of `unit`, traced round. */
function stepped(cols: [number, number][], u: number, unit: number, x0 = 0): [number, number, "sharp"][] {
  const pts: [number, number][] = [];
  const push = (x: number, y: number) => {
    const last = pts[pts.length - 1];
    if (!last || Math.abs(last[0] - x) > 1e-9 || Math.abs(last[1] - y) > 1e-9) pts.push([x, y]);
  };
  cols.forEach(([bot], i) => {
    push((i + x0) * u, bot * unit);
    push((i + 1 + x0) * u, bot * unit);
  });
  for (let i = cols.length - 1; i >= 0; i--) {
    push((i + 1 + x0) * u, cols[i][1] * unit);
    push((i + x0) * u, cols[i][1] * unit);
  }
  return pts.map(([x, y]) => [x, y, "sharp"]);
}

/** Piecewise smoothstep through `[t, value]` keys. */
function keyed(keys: [number, number][], t: number) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, va] = keys[i];
    const [tb, vb] = keys[i + 1];
    if (t <= tb) {
      const k = (t - ta) / (tb - ta);
      return va + (vb - va) * k * k * (3 - 2 * k);
    }
  }
  return keys[keys.length - 1][1];
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "pixelCapybara" });
  const rand = rng(23);

  // ------------------------------------------------------------------------------------------------ skeleton: body
  // One curve from the rump to the neck; the hips sit a little forward of the rump so a one-bone tail nub sits behind.
  const curve = catmull([
    [0, 0.18, -0.33],
    [0, 0.19, -0.24],
    [0, 0.2, -0.12],
    [0, 0.22, 0.0],
    [0, 0.25, 0.15],
    [0, 0.27, 0.25],
    [0, 0.34, 0.3],
  ]);
  const hips = b.joint("hips", { at: [0, 0.19, -0.24], dir: [0, 0, 1], group: "body" });
  const rootT = curve.closestT(hips.at);
  const tailT = curve.knots;
  const tail = b.chain("tail", curve.slice(rootT, 0), { parent: hips, count: 1, role: "tail", group: "body" });
  const spine = b.chain("spine", curve.slice(rootT, tailT[4]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    group: "body",
  });
  const chest = spine.joints[2];
  const neck = b.chain("neck", curve.slice(tailT[4], 1), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
    group: "body",
  });
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.34, 0.3],
    dir: [0, 0.1, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.325, 0.33],
    aim: [0, 0.325, 0.46],
    role: "jaw",
    group: "head",
  });

  // ------------------------------------------------------------------------------------------------ body tube
  const RX = [0.11, 0.15, 0.165, 0.17, 0.155, 0.125, 0.1];
  const RY = [0.1, 0.135, 0.15, 0.155, 0.15, 0.12, 0.1];
  const knots = curve.knots;
  const pair = (t: number): [number, number] => [
    keyed(
      knots.map((k, i) => [k, RX[i]]),
      t,
    ),
    keyed(
      knots.map((k, i) => [k, RY[i]]),
      t,
    ),
  ];
  b.sweep(curve, pair, {
    bone: [tail, hips, spine, neck],
    color: FUR,
    sides: 8,
    smooth: false,
    group: "body",
  });

  // ------------------------------------------------------------------------------------------------ head
  const box = (w: number, h: number, d: number, at: V3, color: string | typeof FUR, bone = head, group = "head") =>
    b.part(new BoxGeometry(w, h, d), color, { bone, at, group });

  box(0.21, 0.18, 0.13, [0, 0.405, 0.33], FUR); // cranium
  box(0.23, 0.08, 0.07, [0, 0.365, 0.355], FUR); // cheeks
  box(0.15, 0.05, 0.07, [0, 0.46, 0.41], FUR); // forehead step
  box(0.17, 0.09, 0.125, [0, 0.395, 0.4375], FUR); // upper jaw / muzzle
  box(0.16, 0.06, 0.03, [0, 0.41, 0.505], NOSE); // blunt nose pad
  for (const s of [1, -1]) {
    box(0.014, 0.004, 0.014, [s * 0.036, 0.442, 0.5], "#170c08"); // nostrils, on top of the pad
    box(0.018, 0.022, 0.008, [s * 0.012, 0.346, 0.503], "#f2c56a"); // incisors
  }
  // Lower jaw with a dark mouth line and a pink tongue, so it reads when the jaw opens.
  box(0.14, 0.05, 0.12, [0, 0.325, 0.435], FUR, jaw);
  box(0.15, 0.008, 0.13, [0, 0.35, 0.435], "#3b2015", jaw);
  box(0.1, 0.012, 0.09, [0, 0.352, 0.44], "#d9727a", jaw);

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // Ears: small stepped plates with a pink inner pixel block, hinged at the top rear of the skull.
    const ear = b.joint(`ear${S}`, {
      parent: head,
      at: [s * 0.09, 0.48, 0.3],
      dir: [s * 0.2, 1, -0.1],
      role: "hinge",
      group: "head",
    });
    b.extrude(
      stepped(
        [
          [0, 3],
          [0, 4],
          [0, 4],
          [0, 3],
        ],
        TEXEL,
        TEXEL,
      ),
      {
        at: [s * 0.06, 0.47, 0.3],
        x: [s, 0, 0],
        thickness: 0.02,
        color: FUR,
        bone: ear,
        group: "head",
      },
    );
    b.extrude(
      stepped(
        [
          [1, 3],
          [1, 3],
        ],
        TEXEL,
        TEXEL,
        1,
      ),
      {
        at: [s * 0.06, 0.47, 0.304],
        x: [s, 0, 0],
        thickness: 0.02,
        color: "#d98c7a",
        bone: ear,
        group: "head",
      },
    );
    // Sleepy half-lidded eyes: a dark slit cube under a fur lid, sitting on the corner of the skull so it reads from
    // the front and the side alike.
    box(0.022, 0.012, 0.022, [s * 0.098, 0.432, 0.388], "#1e1109");
    box(0.026, 0.012, 0.026, [s * 0.098, 0.444, 0.388], FUR);
    b.part(new PlaneGeometry(0.03, 0.02), "#e8907c", {
      bone: head,
      at: [s * 0.118, 0.38, 0.365],
      dir: [s, 0, 0],
      axis: "z",
      group: "head",
    });
    // Whiskers: three thin square rods a side.
    for (const dy of [-0.015, 0, 0.015])
      b.rod([s * 0.083, 0.39 + dy, 0.46], [s * 0.13, 0.394 + dy * 2.2, 0.49], 0.0035, {
        bone: head,
        color: "#4a2c1e",
        sides: 4,
        caps: "flat",
        group: "head",
      });
  }

  // ------------------------------------------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // Front legs: shoulder inside the chest, forearm rising out of the water, paw draped over the rim.
    const pawBase: V3 = [s * 0.18, 0.315, 0.445];
    const front = b.chain(
      `legF${S}`,
      [[s * 0.1, 0.27, 0.14], [s * 0.155, 0.19, 0.29], [s * 0.175, 0.285, 0.4], pawBase, [s * 0.18, 0.315, 0.5]],
      {
        parent: chest,
        names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `paw${S}`],
        role: "leg",
        contact: [s * 0.18, RIM, 0.48],
        group: `legF${S}`,
      },
    );
    const [, f1, f2, f3] = front.ts;
    b.sweep(
      front,
      (t) =>
        keyed(
          [
            [0, 0.055],
            [f1, 0.05],
            [f2, 0.038],
            [f3, 0.032],
          ],
          t,
        ),
      { to: f3, color: LEG_FUR, sides: 6, smooth: false, caps: { start: "round", end: "flat" }, group: `legF${S}` },
    );
    const paw = front.joints[3];
    b.part(new BoxGeometry(0.055, 0.03, 0.06), LEG_FUR, {
      bone: paw,
      at: [s * 0.18, 0.314, 0.4675],
      group: `legF${S}`,
    });
    for (const dx of [-0.02025, -0.00675, 0.00675, 0.02025]) {
      b.part(new BoxGeometry(0.0128, 0.022, 0.02), LEG_FUR, {
        bone: paw,
        at: [s * 0.18 + dx, 0.311, 0.5075],
        group: `legF${S}`,
      });
      b.part(new BoxGeometry(0.01, 0.012, 0.005), "#231710", {
        bone: paw,
        at: [s * 0.18 + dx, 0.306, 0.5205],
        group: `legF${S}`,
      });
    }

    // Hind legs: folded under the body on the tub floor, thigh forward, shin back, foot forward.
    const hind = b.chain(
      `legH${S}`,
      [
        [s * 0.115, 0.22, -0.22],
        [s * 0.175, 0.13, -0.06],
        [s * 0.165, 0.075, -0.2],
        [s * 0.165, 0.045, -0.1],
        [s * 0.165, 0.045, -0.04],
      ],
      {
        parent: hips,
        names: [`hip${S}`, `knee${S}`, `ankle${S}`, `toe${S}`],
        role: "leg",
        contact: [s * 0.165, 0.03, -0.07],
        group: `legH${S}`,
      },
    );
    const [, h1, h2, h3] = hind.ts;
    b.sweep(
      hind,
      (t) =>
        keyed(
          [
            [0, 0.07],
            [h1, 0.05],
            [h2, 0.038],
            [h3, 0.032],
          ],
          t,
        ),
      { to: h3, color: LEG_FUR, sides: 6, smooth: false, caps: { start: "round", end: "flat" }, group: `legH${S}` },
    );
    const toe = hind.joints[3];
    b.part(new BoxGeometry(0.055, 0.03, 0.06), LEG_FUR, {
      bone: toe,
      at: [s * 0.165, 0.045, -0.08],
      group: `legH${S}`,
    });
    for (const dx of [-0.017, 0, 0.017])
      b.part(new BoxGeometry(0.014, 0.022, 0.02), LEG_FUR, {
        bone: toe,
        at: [s * 0.165 + dx, 0.041, -0.041],
        group: `legH${S}`,
      });
  }

  // ------------------------------------------------------------------------------------------------ the tub
  const STAVE_T = 0.045;
  const STAVE_TOP = RIM - 0.03;
  const woods = [woodTexture(3), woodTexture(8)];
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const nx = Math.sin(a);
    const nz = Math.cos(a);
    const r = 0.5 - STAVE_T / 2;
    b.part(pixBox(0.42, STAVE_TOP, STAVE_T, STAVE_W, STAVE_H), WHITE, {
      texture: woods[k % 2],
      bone: hips,
      at: [nx * r, STAVE_TOP / 2, nz * r],
      dir: [nx, 0, nz],
      axis: "z",
      group: "tub",
    });
  }
  const ring = (inner: number, outer: number, y0: number, y1: number, color: typeof COPPER, group = "tub") =>
    b.lathe(
      [
        [inner / OCT, 0],
        [outer / OCT, 0],
        [outer / OCT, y1 - y0],
        [inner / OCT, y1 - y0],
      ],
      { at: [0, y0, 0], segments: 8, spin: 22.5, color, bone: hips, group },
    );
  ring(0.485, 0.512, 0.05, 0.09, COPPER);
  ring(0.485, 0.512, 0.18, 0.22, COPPER);
  ring(0.43, 0.525, STAVE_TOP, RIM, WOOD); // the rim cap
  b.lathe(
    [
      [0, 0],
      [0.47 / OCT, 0],
      [0.47 / OCT, 0.03],
      [0, 0.03],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: WOOD, bone: hips, group: "tub" },
  );
  b.lathe(
    [
      [0, 0],
      [0.462 / OCT, 0],
      [0.462 / OCT, WATER_TOP - 0.12],
      [0, WATER_TOP - 0.12],
    ],
    { at: [0, 0.12, 0], segments: 8, spin: 22.5, color: WATER, bone: hips, group: "water" },
  );

  // Onsen rocks round the back and sides: three stepped blocks each, mossy on top.
  for (const deg of [62, 105, 148, 190, 232, 272, 318]) {
    const a = (deg * Math.PI) / 180;
    const nx = Math.sin(a);
    const nz = Math.cos(a);
    const tx = Math.cos(a);
    const tz = -Math.sin(a);
    const k = 0.85 + rand() * 0.4;
    const rock = (w: number, h: number, d: number, y: number, radial: number, along: number) =>
      b.part(new BoxGeometry(w * k, h * k, d * k), ROCK, {
        bone: hips,
        at: [nx * radial + tx * along, y * k, nz * radial + tz * along],
        dir: [nx, 0, nz],
        axis: "z",
        group: "rocks",
      });
    rock(0.2, 0.1, 0.12, 0.05, 0.555, 0);
    rock(0.13, 0.075, 0.09, 0.1375, 0.55, (rand() - 0.5) * 0.05);
    rock(0.075, 0.05, 0.06, 0.18, 0.55, (rand() - 0.5) * 0.06);
  }

  // A bamboo ladle resting on the rim: a six-sided cup with a dark hollow and a square handle.
  {
    const a = (135 * Math.PI) / 180;
    const n: V3 = [Math.sin(a), 0, Math.cos(a)];
    const t: V3 = [Math.cos(a), 0, -Math.sin(a)];
    const at = (r: number, along: number, y: number): V3 => [n[0] * r + t[0] * along, y, n[2] * r + t[2] * along];
    b.part(new CylinderGeometry(0.034, 0.03, 0.05, 6), BAMBOO, {
      bone: hips,
      at: at(0.478, -0.09, RIM + 0.025),
      group: "props",
    });
    b.part(new CylinderGeometry(0.026, 0.026, 0.004, 6), "#3a2a16", {
      bone: hips,
      at: at(0.478, -0.09, RIM + 0.05),
      group: "props",
    });
    b.rod(at(0.478, -0.09, RIM + 0.04), at(0.478, 0.17, RIM + 0.04), 0.008, {
      bone: hips,
      color: BAMBOO,
      sides: 4,
      caps: "flat",
      group: "props",
    });
  }
  // ------------------------------------------------------------------------------------------------ towel and yuzu
  box(0.1, 0.018, 0.11, [0, 0.504, TOWEL_Z], TOWEL, head, "towel");
  box(0.09, 0.014, 0.1, [0, 0.52, TOWEL_Z + 0.005], TOWEL, head, "towel");
  const yuzu = (at: V3, r: number, bone: typeof head, group: string, tilt = 0) => {
    b.part(faceted(new SphereGeometry(r, 8, 6)), YUZU, { bone, at, scale: [1, 0.88, 1], group });
    b.part(new BoxGeometry(HALF, HALF * 1.2, HALF), "#6b4a1e", {
      bone,
      at: [at[0], at[1] + r * 0.88, at[2]],
      group,
    });
    b.part(new BoxGeometry(0.03, HALF * 0.6, 0.017), "#4f8f3a", {
      bone,
      at: [at[0] + 0.012, at[1] + r * 0.88 + 0.002, at[2]],
      rotation: [0, 30 + tilt, 0],
      group,
    });
    b.part(new BoxGeometry(0.02, HALF * 0.6, 0.012), "#3a7030", {
      bone,
      at: [at[0] - 0.008, at[1] + r * 0.88 + 0.001, at[2] + 0.006],
      rotation: [0, -40 + tilt, 0],
      group,
    });
  };
  yuzu([0, 0.561, TOWEL_Z + 0.005], 0.045, head, "yuzu");
  yuzu([0.3, WATER_TOP + 0.012, 0.13], 0.036, hips, "yuzu", 20);
  yuzu([-0.31, WATER_TOP + 0.012, 0.2], 0.033, hips, "yuzu", 70);
  yuzu([0.17, WATER_TOP + 0.011, -0.3], 0.03, hips, "yuzu", 130);

  // ------------------------------------------------------------------------------------------------ duckling
  const B = 0.368;
  const DZ = -0.04;
  const duckBody = b.joint("duckBody", {
    parent: spine.joints[1],
    at: [0, B + 0.04, DZ],
    dir: [0, 0, 1],
    group: "duck",
  });
  const duckHead = b.joint("duckHead", {
    parent: duckBody,
    at: [0, B + 0.06, DZ + 0.03],
    dir: [0, 0.3, 1],
    group: "duck",
  });
  const duckJaw = b.joint("duckJaw", {
    parent: duckHead,
    at: [0, B + 0.091, DZ + 0.075],
    aim: [0, B + 0.091, DZ + 0.1],
    role: "jaw",
    group: "duck",
  });
  const duckTail = b.joint("duckTail", {
    parent: duckBody,
    at: [0, B + 0.055, DZ - 0.045],
    aim: [0, B + 0.075, DZ - 0.065],
    role: "tail",
    group: "duck",
  });
  const dbox = (w: number, h: number, d: number, at: V3, color: string | typeof DUCK, bone = duckBody) =>
    b.part(new BoxGeometry(w, h, d), color, { bone, at, group: "duck" });
  dbox(0.075, 0.05, 0.095, [0, B + 0.037, DZ], DUCK); // body
  dbox(0.06, 0.02, 0.05, [0, B + 0.07, DZ - 0.015], DUCK); // rounded back
  dbox(0.028, 0.03, 0.022, [0, B + 0.066, DZ - 0.056], DUCK, duckTail); // tail tuft
  dbox(0.066, 0.066, 0.066, [0, B + 0.098, DZ + 0.05], DUCK, duckHead); // head
  dbox(0.032, 0.012, 0.026, [0, B + 0.101, DZ + 0.096], "#f28a24", duckHead); // upper beak
  dbox(0.026, 0.008, 0.02, [0, B + 0.091, DZ + 0.093], "#e07a1a", duckJaw); // lower beak
  dbox(0.012, 0.012, 0.012, [0, B + 0.137, DZ + 0.045], DUCK, duckHead); // head tuft
  dbox(0.008, 0.008, 0.008, [0.004, B + 0.146, DZ + 0.04], DUCK, duckHead);
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    dbox(0.008, 0.008, 0.008, [s * 0.0345, B + 0.108, DZ + 0.062], "#2a1a10", duckHead); // eyes
    dbox(0.007, 0.007, 0.007, [s * 0.0335, B + 0.093, DZ + 0.068], "#f5a38a", duckHead); // blush
    const wing = b.joint(`duckWing${S}`, {
      parent: duckBody,
      at: [s * 0.0385, B + 0.055, DZ + 0.02],
      aim: [s * 0.0385, B + 0.045, DZ - 0.02],
      role: "hinge",
      group: "duck",
    });
    dbox(0.008, 0.03, 0.0225, [s * 0.0385, B + 0.04, DZ + 0.00875], DUCK_WING, wing); // stepped wing: root block
    dbox(0.008, 0.015, 0.015, [s * 0.0385, B + 0.0475, DZ - 0.01], DUCK_WING, wing); // and tapering tip
    const foot = b.joint(`duckFoot${S}`, {
      parent: duckBody,
      at: [s * 0.02, B + 0.012, DZ + 0.03],
      aim: [s * 0.02, B + 0.003, DZ + 0.05],
      role: "leg",
      group: "duck",
    });
    dbox(0.01, 0.014, 0.01, [s * 0.02, B + 0.008, DZ + 0.03], "#e07a1a", foot); // little leg
    dbox(0.022, 0.006, 0.028, [s * 0.02, B + 0.001, DZ + 0.04], "#f28a24", foot); // webbed foot
  }

  // ------------------------------------------------------------------------------------------------ steam
  // Pixel puffs: three stacked slabs each (wider in the middle), grid-aligned, rising in a lazy zigzag.
  const columns: [number, number][] = [
    [0.34, 0.06],
    [-0.33, -0.14],
    [0.16, -0.38],
    [-0.26, 0.28],
  ];
  const CELL = 0.03;
  columns.forEach(([cx, cz], i) => {
    const puffJoint = b.joint(`steam${i + 1}`, {
      parent: hips,
      at: [cx, WATER_TOP + 0.03, cz],
      dir: [0, 1, 0],
      group: "steam",
    });
    const layers = [
      [2, 3, 2],
      [3, 4, 3],
      [2, 3, 2],
    ];
    layers.forEach((rows, k) => {
      const ox = cx + (k % 2 === 0 ? -1 : 1) * CELL * (0.7 + (i % 2) * 0.3);
      const oz = cz + (k === 1 ? CELL * (i % 2 ? 0.5 : -0.5) : 0);
      rows.forEach((cells, r) => {
        b.part(new BoxGeometry(cells * CELL, CELL, cells * CELL), STEAM, {
          bone: puffJoint,
          at: [ox, WATER_TOP + 0.09 + k * 0.125 + r * CELL, oz],
          group: "steam",
        });
      });
    });
    // A stray wisp drifting off the column.
    const wx = cx + (i % 2 ? 1 : -1) * 0.1;
    b.part(new BoxGeometry(CELL, CELL, CELL), STEAM, {
      bone: puffJoint,
      at: [wx, WATER_TOP + 0.17 + rand() * 0.2, cz + (rand() - 0.5) * 0.08],
      group: "steam",
    });
  });

  return b.root;
}
