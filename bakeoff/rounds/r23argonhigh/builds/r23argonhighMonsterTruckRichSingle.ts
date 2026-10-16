import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import { glow } from "../../../../kits/glow";
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
import type { PixelGrid, Rect } from "../../../../kits/pixel";

export const meta = {
  name: "Pixel Crusher Monster Truck",
  description:
    "A pixel-art stadium monster truck with 66-inch chevron mud tyres, beadlock rims, planetary hubs, 4-wheel hydraulic steering, neon-green tube-frame chassis, 4-link suspension with 8 nitrogen coilover shocks, supercharged V8 blower engine with zoomie headers, hot-rod flame pickup body, cab interior, roll cage, and glowing stadium light bar.",
  style: "pixel art",
  commit: "88fc1f0",
};

// Master pixel grid scale: 2.5 cm square texels across the entire vehicle
const TEXEL = 0.025;

// Snapped 6-bit VGA pixel-art ramps and flat colours
const RAMP_BLUE = ["#0b1026", "#131e47", "#1d3175", "#294ba8", "#3b6ee0", "#689dff"].map((c) =>
  snapColor(c, 64),
);
const RAMP_FLAME = ["#7a0909", "#c8190e", "#f24c00", "#ff8c00", "#ffd000", "#ffff99"].map((c) =>
  snapColor(c, 64),
);
const RAMP_GREEN = ["#092410", "#12471e", "#1d7530", "#2eb344", "#55e663", "#9dff99"].map((c) =>
  snapColor(c, 64),
);
const RAMP_RUBBER = ["#0d0f14", "#161922", "#222734", "#303747", "#434c61"].map((c) =>
  snapColor(c, 64),
);
const RAMP_STEEL = ["#161a24", "#262d3d", "#3c465c", "#596680", "#8292b0", "#b8c7e0"].map((c) =>
  snapColor(c, 64),
);
const RAMP_CHROME = ["#1c2436", "#394866", "#6b82a8", "#a8c0e0", "#dee9f7", "#ffffff"].map((c) =>
  snapColor(c, 64),
);
const RAMP_GOLD = ["#4d2c00", "#804d00", "#bf7a00", "#f2ad00", "#ffe047", "#ffffaa"].map((c) =>
  snapColor(c, 64),
);
const RAMP_RED = ["#38060a", "#6e0c14", "#ab1622", "#e02432", "#ff5252", "#ff9999"].map((c) =>
  snapColor(c, 64),
);

const COL_BLACK = RAMP_RUBBER[0];
const COL_RUBBER = RAMP_RUBBER[1];
const COL_DARK_STEEL = RAMP_STEEL[1];
const COL_MID_STEEL = RAMP_STEEL[2];
const COL_LIGHT_STEEL = RAMP_STEEL[4];
const COL_CHROME = RAMP_CHROME[4];
const COL_WHITE = RAMP_CHROME[5];
const COL_BLUE = RAMP_BLUE[3];
const COL_DARK_BLUE = RAMP_BLUE[1];
const COL_GREEN = RAMP_GREEN[3];
const COL_DARK_GREEN = RAMP_GREEN[1];
const COL_GOLD = RAMP_GOLD[3];
const COL_YELLOW = RAMP_GOLD[4];
const COL_ORANGE = RAMP_FLAME[3];
const COL_RED = RAMP_RED[3];
const COL_DARK_RED = RAMP_RED[1];
const COL_CYAN = snapColor("#18b8e8", 64);
const COL_DARK_CYAN = snapColor("#0c5878", 64);
const COL_AMBER = snapColor("#ff9914", 64);

// Helper to draw a pixel border on a rect
function drawBorder(g: PixelGrid, rect: Rect, outer: string, inner?: string) {
  const [rx, ry, rw, rh] = rect;
  for (let x = 0; x < rw; x++) {
    g.set(rx + x, ry, outer);
    g.set(rx + x, ry + rh - 1, outer);
    if (inner && x > 0 && x < rw - 1) {
      g.set(rx + x, ry + 1, inner);
      g.set(rx + x, ry + rh - 2, inner);
    }
  }
  for (let y = 0; y < rh; y++) {
    g.set(rx, ry + y, outer);
    g.set(rx + rw - 1, ry + y, outer);
    if (inner && y > 0 && y < rh - 1) {
      g.set(rx + 1, ry + y, inner);
      g.set(rx + rw - 2, ry + y, inner);
    }
  }
}

// Helper to draw hot-rod pixel flames propagating from one side of a face rectangle
function drawPixelFlames(
  g: PixelGrid,
  rect: Rect,
  direction: "leftToRight" | "rightToLeft" | "bottomToTop" | "topToBottom",
  reachShare = 0.72,
) {
  const [rx, ry, rw, rh] = rect;
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      let along = 0;
      let across = 0;
      let spanAlong = 1;
      if (direction === "leftToRight") {
        along = x;
        across = y;
        spanAlong = rw;
      } else if (direction === "rightToLeft") {
        along = rw - 1 - x;
        across = y;
        spanAlong = rw;
      } else if (direction === "bottomToTop") {
        along = rh - 1 - y;
        across = x;
        spanAlong = rh;
      } else {
        along = y;
        across = x;
        spanAlong = rh;
      }
      const wave1 = Math.sin(across * 0.52 + 0.7) * 0.22;
      const wave2 = Math.cos(across * 1.15 - 0.4) * 0.14;
      const tongueReach = Math.max(0.12, (reachShare + wave1 + wave2) * spanAlong);
      if (along < tongueReach) {
        const t = 1 - along / tongueReach;
        const idx = Math.min(
          RAMP_FLAME.length - 1,
          Math.max(0, Math.floor(t * RAMP_FLAME.length + (bayer(x, y) - 0.5) * 0.85)),
        );
        g.set(rx + x, ry + y, RAMP_FLAME[idx]);
      }
    }
  }
}

export default function build() {
  const b = createBuilder({ name: "monsterTruck", detail: 0.6, paintSize: 2048 });
  const rand = rng(8801);

  // ---------------------------------------------------------------------------
  // 1. PIXEL TEXTURES, TILES & SKIN SHEET
  // ---------------------------------------------------------------------------

  // Tile 1: BKT-style heavy rubber tread & sidewall pattern
  const TREAD_TILE = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      const chevron = ((x + ((y >> 1) & 3)) % 8) < 5 ? 0.58 : 0.22;
      const edge = y === 0 || y === 31 || x === 0 || x === 31 ? 0.82 : chevron;
      return pick(RAMP_RUBBER, edge, bayer(x, y));
    });
    for (let x = 2; x < 30; x += 6) {
      g.set(x, 3, RAMP_RUBBER[4]);
      g.set(x + 1, 3, RAMP_RUBBER[4]);
      g.set(x, 28, RAMP_RUBBER[0]);
    }
  });

  // Tile 2: Diamond-plate aluminum / steel deck
  const DIAMOND_TILE = pixelTexture(24, 24, (g) => {
    g.fill((x, y) => {
      const base = pick(RAMP_STEEL, 0.48, bayer(x, y));
      const gx = x % 6;
      const gy = y % 6;
      const half = Math.floor(x / 6 + y / 6) % 2 === 0;
      if (half && ((gx === 2 && gy >= 1 && gy <= 3) || (gx === 3 && gy >= 2 && gy <= 4))) {
        return RAMP_CHROME[4];
      }
      if (!half && ((gy === 2 && gx >= 1 && gx <= 3) || (gy === 3 && gx >= 2 && gx <= 4))) {
        return RAMP_CHROME[3];
      }
      if (x === 0 || y === 0) return RAMP_STEEL[1];
      return base;
    });
  });

  // Tile 3: Heavy structural gunmetal steel with pixel rivets and weld seams
  const STEEL_TILE = pixelTexture(24, 24, (g) => {
    g.fill((x, y) => {
      if (x === 0 || y === 0) return RAMP_STEEL[0];
      if (x === 23 || y === 23) return RAMP_STEEL[3];
      return pick(RAMP_STEEL, 0.28, bayer(x, y));
    });
    for (const [rx, ry] of [
      [3, 3],
      [20, 3],
      [3, 20],
      [20, 20],
      [11, 3],
      [11, 20],
    ]) {
      g.set(rx, ry, RAMP_STEEL[4]);
      g.set(rx + 1, ry, RAMP_STEEL[0]);
    }
  });

  // Tile 4: Retro VGA high-contrast chrome reflection bands
  const CHROME_TILE = pixelTexture(16, 16, (g) => {
    g.fill((x, y) => {
      const v = 0.5 + 0.48 * Math.sin((y / 16) * Math.PI * 2 + x * 0.15);
      return pick(RAMP_CHROME, v, bayer(x, y));
    });
  });

  // Emissive pixel art textures for lights & displays
  const HEADLIGHT_TEX = pixelArt(
    [
      "kkkkkkkkkkkkkkkk",
      "kcccccccccccccck",
      "kcwwwwwwwwwwwwck",
      "kcwyyyyyyyyyywck",
      "kcwywwwwwwwwywck",
      "kcwyyyyyyyyyywck",
      "kcwwwwwwwwwwwwck",
      "kcccccccccccccck",
      "kkkkkkkkkkkkkkkk",
      "kddddddddddddddk",
      "kdaaaaaaaaaaaadk",
      "kdayyyyyyyyyyadk",
      "kdaaaaaaaaaaaadk",
      "kkkkkkkkkkkkkkkk",
    ],
    {
      k: COL_BLACK,
      c: COL_CHROME,
      w: COL_WHITE,
      y: RAMP_GOLD[5],
      d: RAMP_GOLD[1],
      a: COL_AMBER,
    },
  );

  const TAILLIGHT_TEX = pixelArt(
    [
      "kkkkkkkk",
      "krrrrrrk",
      "krffffrk",
      "krfwwfrk",
      "krffffrk",
      "krrrrrrk",
      "kkkkkkkk",
      "kaaaaaak",
      "kayyyyak",
      "kaaaaaak",
      "kkkkkkkk",
      "kcccccck",
      "kcwwwwck",
      "kkkkkkkk",
    ],
    {
      k: COL_BLACK,
      r: COL_DARK_RED,
      f: COL_RED,
      w: "#ffcccc",
      a: COL_ORANGE,
      y: COL_YELLOW,
      c: COL_LIGHT_STEEL,
    },
  );

  const SPOTLIGHT_TEX = pixelArt(
    [
      "kkkkkkkkkk",
      "kcccccccck",
      "kcwwwwwwck",
      "kcwyyyywck",
      "kcwywwywck",
      "kcwywwywck",
      "kcwyyyywck",
      "kcwwwwwwck",
      "kcccccccck",
      "kkkkkkkkkk",
    ],
    {
      k: COL_BLACK,
      c: COL_CHROME,
      w: COL_WHITE,
      y: RAMP_GOLD[5],
    },
  );

  const DASH_GAUGE_TEX = pixelArt(
    [
      "kkkkkkkkkkkkkkkkkkkkkkkk",
      "kbbbbbbbbbbkkbbbbbbbbbbk",
      "kbccccccccbkkbggggggggbk",
      "kbcwwwwwwcbkkbgwwwwwwgbk",
      "kbccccccccbkkbggggggggbk",
      "kbbbbbbbbbbkkbbbbbbbbbbk",
      "kkkkkkkkkkkkkkkkkkkkkkkk",
      "krrkkyykkggkkcckkrryyggk",
      "kkkkkkkkkkkkkkkkkkkkkkkk",
    ],
    {
      k: COL_BLACK,
      b: COL_DARK_BLUE,
      c: COL_CYAN,
      w: COL_WHITE,
      g: COL_GREEN,
      r: COL_RED,
      y: COL_YELLOW,
    },
  );

  // Skin sheet layout for the main pickup body panels, engine blower, interior & fuel cell
  const layout = skinLayout(
    {
      grille: [68, 22, 10],
      hood: [64, 8, 56],
      cabRoof: [64, 6, 48],
      doorL: [8, 22, 44],
      doorR: [8, 22, 44],
      fenderFL: [14, 20, 56],
      fenderFR: [14, 20, 56],
      bedSideL: [12, 22, 68],
      bedSideR: [12, 22, 68],
      tailgate: [68, 20, 6],
      blower: [18, 12, 26],
      fuelCell: [26, 14, 18],
      seatBack: [22, 26, 8],
    },
    256,
  );

  const BODY_SHEET = pixelTexture(...layout.size, (g) => {
    // Default Cobalt Blue metallic gradient fill for all body faces
    for (const [name, faces] of Object.entries(layout.faces)) {
      for (const rect of Object.values(faces)) {
        g.fill((x, y, _w, h) => {
          const shade = 0.25 + 0.65 * (1 - y / Math.max(1, h));
          if (name === "blower") return pick(RAMP_CHROME, shade, bayer(x, y));
          if (name === "fuelCell") return pick(RAMP_RED, shade, bayer(x, y));
          if (name === "seatBack") return pick(RAMP_RUBBER, shade * 0.8, bayer(x, y));
          return pick(RAMP_BLUE, shade, bayer(x, y));
        }, rect);
        drawBorder(g, rect, RAMP_BLUE[0], RAMP_BLUE[4]);
      }
    }

    // 1) Front Grille (pz = front face)
    {
      const pz = layout.faces.grille.pz;
      g.fill((x, y, w, h) => {
        if (x < 3 || x >= w - 3 || y < 2 || y >= h - 2) return pick(RAMP_CHROME, 0.75, bayer(x, y));
        // Slotted dark radiator grille bars with central vertical divider
        if (Math.abs(x - Math.floor(w / 2)) <= 2) return RAMP_CHROME[4];
        if (y % 3 === 0) return RAMP_CHROME[3];
        return x % 2 === 0 ? RAMP_RUBBER[0] : RAMP_STEEL[1];
      }, pz);
      // Central Pixel Monster Skull / Fang Emblem on the grille
      g.stamp(
        pz[0] + Math.floor(pz[2] / 2) - 6,
        pz[1] + 4,
        [
          "..kkkkkkkk..",
          ".kwwwwwwwwk.",
          "kwrrwwwwrrwk",
          "kwrrwwwwrrwk",
          "kwwwwkkwwwwk",
          ".kwwwwwwwwk.",
          ".kwkwkwkwkw.",
          "..kkkkkkkk..",
        ],
        { k: COL_BLACK, w: COL_YELLOW, r: COL_RED },
      );
    }

    // 2) Hood (py = top face: back edge at top row, front edge at bottom row)
    {
      const py = layout.faces.hood.py;
      drawPixelFlames(g, py, "bottomToTop", 0.78);
      drawBorder(g, py, RAMP_BLUE[0], RAMP_BLUE[5]);
      // Central supercharger cutout collar and twin racing stripes
      const cx = py[0] + Math.floor(py[2] / 2);
      for (let y = py[1] + 2; y < py[1] + py[3] - 2; y++) {
        g.set(cx - 12, y, COL_YELLOW);
        g.set(cx + 12, y, COL_YELLOW);
      }
      // Hood louver vents
      for (let row = 6; row < 22; row += 3) {
        for (let dx = -22; dx <= -15; dx++) {
          g.set(cx + dx, py[1] + row, COL_BLACK);
          g.set(cx - dx, py[1] + row, COL_BLACK);
        }
      }
    }

    // 3) Cab Roof (py = top face) with big stadium number "88" & roof hatch
    {
      const py = layout.faces.cabRoof.py;
      drawBorder(g, py, RAMP_BLUE[0], COL_YELLOW);
      const cx = py[0] + Math.floor(py[2] / 2);
      const cy = py[1] + Math.floor(py[3] / 2);
      // White racing number backing plate
      const plate: Rect = [cx - 16, cy - 11, 32, 22];
      g.fill(() => COL_WHITE, plate);
      drawBorder(g, plate, COL_BLACK, COL_RED);
      const digit8 = [
        ".kkkkkk.",
        "krrrrrrk",
        "krkkkktrk",
        "krrrrrrk",
        "krkkkktrk",
        "krrrrrrk",
        ".kkkkkk.",
      ];
      g.stamp(cx - 11, cy - 3, digit8, { k: COL_BLACK, r: COL_RED, t: COL_WHITE });
      g.stamp(cx + 2, cy - 3, digit8, { k: COL_BLACK, r: COL_RED, t: COL_WHITE });
    }

    // 4) Front Fenders (px = left outer face of fenderFL, nx = right outer face of fenderFR)
    {
      const fL = layout.faces.fenderFL.px;
      drawPixelFlames(g, fL, "leftToRight", 0.85);
      drawBorder(g, fL, RAMP_BLUE[0], RAMP_FLAME[4]);

      const fR = layout.faces.fenderFR.nx;
      drawPixelFlames(g, fR, "rightToLeft", 0.85);
      drawBorder(g, fR, RAMP_BLUE[0], RAMP_FLAME[4]);
    }

    // 5) Cab Doors (px = outer face of doorL, nx = outer face of doorR)
    {
      for (const [faceRect, dir] of [
        [layout.faces.doorL.px, "leftToRight"],
        [layout.faces.doorR.nx, "rightToLeft"],
      ] as const) {
        drawPixelFlames(g, faceRect, dir, 0.65);
        drawBorder(g, faceRect, RAMP_BLUE[0], RAMP_BLUE[4]);
        const cx = faceRect[0] + Math.floor(faceRect[2] / 2);
        const cy = faceRect[1] + Math.floor(faceRect[3] / 2);
        const badge: Rect = [cx - 9, cy - 6, 18, 13];
        g.fill(() => COL_WHITE, badge);
        drawBorder(g, badge, COL_BLACK, COL_GOLD);
        const small8 = [
          "kkkk",
          "krrk",
          "kkkk",
          "krrk",
          "kkkk",
        ];
        g.stamp(cx - 5, cy - 2, small8, { k: COL_BLACK, r: COL_DARK_RED });
        g.stamp(cx + 1, cy - 2, small8, { k: COL_BLACK, r: COL_DARK_RED });
      }
    }

    // 6) Pickup Bed Sides (px on bedSideL, nx on bedSideR)
    {
      for (const [faceRect, dir] of [
        [layout.faces.bedSideL.px, "leftToRight"],
        [layout.faces.bedSideR.nx, "rightToLeft"],
      ] as const) {
        drawPixelFlames(g, faceRect, dir, 0.52);
        drawBorder(g, faceRect, RAMP_BLUE[0], RAMP_BLUE[4]);
        // Yellow/Gold racing stripe along upper bed line
        for (let x = 2; x < faceRect[2] - 2; x++) {
          g.set(faceRect[0] + x, faceRect[1] + 3, COL_YELLOW);
          g.set(faceRect[0] + x, faceRect[1] + 4, COL_ORANGE);
          g.set(faceRect[0] + x, faceRect[1] + faceRect[3] - 4, COL_GREEN);
        }
        // Pixel "4X4" emblem near rear of bed
        const bx = dir === "leftToRight" ? faceRect[0] + faceRect[2] - 22 : faceRect[0] + 6;
        g.stamp(
          bx,
          faceRect[1] + 7,
          [
            "y..y.y...y.y..y",
            "y..y..y.y..y..y",
            "yyyy...y...yyyy",
            "...y..y.y.....y",
            "...y.y...y....y",
          ],
          { y: COL_YELLOW },
        );
      }
    }

    // 7) Tailgate (nz = back outer face)
    {
      const nz = layout.faces.tailgate.nz;
      drawBorder(g, nz, RAMP_BLUE[0], COL_CHROME);
      // Hazard stripe along bottom of tailgate
      for (let y = nz[3] - 5; y < nz[3] - 1; y++) {
        for (let x = 2; x < nz[2] - 2; x++) {
          const stripe = ((x + y) >> 2) & 1;
          g.set(nz[0] + x, nz[1] + y, stripe ? COL_YELLOW : COL_BLACK);
        }
      }
      // Giant pixel "CRUSHER" / "4X4" bar across tailgate centre
      const banner: Rect = [nz[0] + 6, nz[1] + 4, nz[2] - 12, 9];
      g.fill(() => RAMP_RUBBER[0], banner);
      drawBorder(g, banner, COL_GOLD);
      g.stamp(
        nz[0] + 15,
        nz[1] + 6,
        [
          "yyyy.yyyy..y..y..yyyy.y..y.yyyy.yyyy.",
          "y....y..y..y..y..y....y..y.y....y..y.",
          "y....yyyy..y..y..yyyy.yyyy.yyy..yyyy.",
          "y....y.y...y..y.....y.y..y.y....y.y..",
          "yyyy.y..y..yyyy..yyyy.y..y.yyyy.y..y.",
        ],
        { y: COL_YELLOW },
      );
    }

    // 8) Supercharger Blower Housing (cooling fins on sides and top)
    {
      for (const rect of [layout.faces.blower.px, layout.faces.blower.nx, layout.faces.blower.py]) {
        g.fill((x, y) => (y % 2 === 0 ? RAMP_CHROME[4] : RAMP_STEEL[1]), rect);
        drawBorder(g, rect, RAMP_STEEL[1], RAMP_CHROME[5]);
      }
    }

    // 9) Racing Fuel Cell (red cell with yellow hazard label and silver straps)
    {
      for (const rect of Object.values(layout.faces.fuelCell)) {
        drawBorder(g, rect, RAMP_RED[0], RAMP_RED[4]);
        for (let y = 0; y < rect[3]; y++) {
          g.set(rect[0] + 5, rect[1] + y, COL_CHROME);
          g.set(rect[0] + 6, rect[1] + y, COL_LIGHT_STEEL);
          g.set(rect[0] + rect[2] - 6, rect[1] + y, COL_CHROME);
          g.set(rect[0] + rect[2] - 7, rect[1] + y, COL_LIGHT_STEEL);
        }
      }
    }

    // 10) Racing Bucket Seat Back (pz = front face with 5-point red/yellow harness straps)
    {
      const pz = layout.faces.seatBack.pz;
      drawBorder(g, pz, COL_BLACK, RAMP_STEEL[2]);
      const cx = pz[0] + Math.floor(pz[2] / 2);
      for (let y = 3; y < pz[3] - 2; y++) {
        // Left and right shoulder harness belts
        for (const dx of [-4, -3, 3, 4]) {
          g.set(cx + dx, pz[1] + y, COL_RED);
        }
      }
      // Central cam-lock buckle
      g.stamp(
        cx - 2,
        pz[1] + 15,
        [
          "ccccc",
          "cyyyc",
          "cyryc",
          "cyyyc",
          "ccccc",
        ],
        { c: COL_CHROME, y: COL_YELLOW, r: COL_RED },
      );
    }
  });

  // Pixel flag texture for twin rear whip antennas
  const FLAG_TEX = pixelArt(
    [
      "kkkkkkkkkkkkkkkk",
      "krrrrrrrrrrrrrrk",
      "kryyyyyyyyyyrrrk",
      "kryykkkkkkkkrrrk",
      "kryyyyyyyyyyrrrk",
      "krrrrrrrrrrrrrrk",
      "kkkkkkkkkkkkkkkk",
    ],
    {
      k: COL_BLACK,
      r: COL_RED,
      y: COL_YELLOW,
    },
  );

  // ---------------------------------------------------------------------------
  // 2. QUANTIZED PIXEL PAINTS (`cellPaint`)
  // ---------------------------------------------------------------------------

  // Tyre carcass & tread rubber paint with quantized square cells and Bayer dither
  const TYRE_RUBBER_PAINT = cellPaint(
    TEXEL,
    (c) => {
      const shade = 0.25 + 0.35 * (c.n.y * 0.5 + 0.5) + 0.2 * (noise(c.at, 0.18, 11) - 0.5);
      const rib = (c.u + c.v) % 3 === 0 ? 0.12 : 0;
      return c.pick(RAMP_RUBBER, Math.max(0.05, Math.min(0.92, shade + rib)));
    },
    { dither: true },
  );

  // Tyre sidewall paint with yellow/white pixel sidewall ring accents
  const TYRE_SIDEWALL_PAINT = cellPaint(
    TEXEL,
    (c) => {
      const shade = 0.32 + 0.3 * (c.n.y * 0.5 + 0.5);
      return c.pick(RAMP_RUBBER, shade);
    },
    { dither: true },
  );

  // Beadlock rim paint (arcade gold/yellow with dark bolt cells around rim)
  const BEADLOCK_PAINT = cellPaint(
    TEXEL,
    (c) => {
      if ((Math.abs(c.u) + Math.abs(c.v)) % 4 === 0) return COL_DARK_STEEL;
      const v = 0.48 + 0.38 * c.n.y + 0.15 * (c.random(5) - 0.5);
      return c.pick(RAMP_GOLD, v);
    },
    { dither: true },
  );

  // Neon-green monster-truck tubular spaceframe paint
  const CHASSIS_PAINT = cellPaint(
    TEXEL,
    (c) => {
      const v = 0.45 + 0.38 * c.n.y + 0.18 * (noise(c.at, 0.25, 23) - 0.5);
      return c.pick(RAMP_GREEN, v);
    },
    { dither: true },
  );

  // Cobalt blue + hot-rod flame quantized paint for extruded arches, pillars & cowls
  const FLAME_BODY_PAINT = cellPaint(
    TEXEL,
    (c) => {
      const wave = Math.sin(c.at.y * 14 + c.at.x * 9) * 0.18;
      const flameZone = c.at.z - 0.85 + wave;
      if (flameZone > 0.35) {
        const t = Math.min(1, (flameZone - 0.35) / 1.15);
        return c.pick(RAMP_FLAME, 0.25 + 0.7 * t);
      }
      const shade = 0.38 + 0.42 * c.n.y + 0.15 * (noise(c.at, 0.3, 41) - 0.5);
      return c.pick(RAMP_BLUE, shade);
    },
    { dither: true },
  );

  // Coilover shock absorber spring paint (alternating yellow & cyan pixel bands)
  const SHOCK_COIL_PAINT = cellPaint(
    TEXEL,
    (c) => {
      const band = Math.abs(c.v) % 3;
      if (band === 0) return COL_DARK_STEEL;
      return c.pick(RAMP_GOLD, 0.55 + 0.3 * c.n.y);
    },
    { dither: true },
  );

  // Heavy axle & drivetrain steel paint
  const AXLE_STEEL_PAINT = cellPaint(
    TEXEL,
    (c) => {
      const v = 0.28 + 0.36 * c.n.y + 0.15 * (c.random(19) - 0.5);
      return c.pick(RAMP_STEEL, v);
    },
    { dither: true },
  );

  // ---------------------------------------------------------------------------
  // 3. VEHICLE SKELETON (19 joints: 1 root spine + 18 vehicle hinges)
  // ---------------------------------------------------------------------------
  const Y_HUB = 0.84;
  const Z_FRONT = 1.70;
  const Z_REAR = -1.70;
  const X_HUB = 1.28;

  const chassis = b.joint("chassis", {
    at: [0, 1.45, 0],
    dir: [0, 0, 1],
    role: "spine",
    group: "chassis",
  });

  const axleFront = b.joint("axleFront", {
    parent: chassis,
    at: [0, Y_HUB, Z_FRONT],
    dir: [0, 0, 1],
    role: "hinge",
    group: "axleFront",
  });

  const axleRear = b.joint("axleRear", {
    parent: chassis,
    at: [0, Y_HUB, Z_REAR],
    dir: [0, 0, -1],
    role: "hinge",
    group: "axleRear",
  });

  const suspFL = b.joint("suspFL", {
    parent: chassis,
    at: [0.52, 1.28, 0.55],
    dir: [0, -0.3, 1],
    role: "hinge",
    group: "suspension",
  });
  const suspFR = b.joint("suspFR", {
    parent: chassis,
    at: [-0.52, 1.28, 0.55],
    dir: [0, -0.3, 1],
    role: "hinge",
    group: "suspension",
  });
  const suspRL = b.joint("suspRL", {
    parent: chassis,
    at: [0.52, 1.28, -0.55],
    dir: [0, -0.3, -1],
    role: "hinge",
    group: "suspension",
  });
  const suspRR = b.joint("suspRR", {
    parent: chassis,
    at: [-0.52, 1.28, -0.55],
    dir: [0, -0.3, -1],
    role: "hinge",
    group: "suspension",
  });

  const steerFL = b.joint("steerFL", {
    parent: axleFront,
    at: [0.88, Y_HUB, Z_FRONT],
    dir: [0, 1, 0],
    role: "hinge",
    group: "steering",
  });
  const steerFR = b.joint("steerFR", {
    parent: axleFront,
    at: [-0.88, Y_HUB, Z_FRONT],
    dir: [0, 1, 0],
    role: "hinge",
    group: "steering",
  });
  const steerRL = b.joint("steerRL", {
    parent: axleRear,
    at: [0.88, Y_HUB, Z_REAR],
    dir: [0, 1, 0],
    role: "hinge",
    group: "steering",
  });
  const steerRR = b.joint("steerRR", {
    parent: axleRear,
    at: [-0.88, Y_HUB, Z_REAR],
    dir: [0, 1, 0],
    role: "hinge",
    group: "steering",
  });

  const wheelFL = b.joint("wheelFL", {
    parent: steerFL,
    at: [X_HUB, Y_HUB, Z_FRONT],
    dir: [1, 0, 0],
    role: "hinge",
    group: "wheelFL",
  });
  const wheelFR = b.joint("wheelFR", {
    parent: steerFR,
    at: [-X_HUB, Y_HUB, Z_FRONT],
    dir: [-1, 0, 0],
    role: "hinge",
    group: "wheelFR",
  });
  const wheelRL = b.joint("wheelRL", {
    parent: steerRL,
    at: [X_HUB, Y_HUB, Z_REAR],
    dir: [1, 0, 0],
    role: "hinge",
    group: "wheelRL",
  });
  const wheelRR = b.joint("wheelRR", {
    parent: steerRR,
    at: [-X_HUB, Y_HUB, Z_REAR],
    dir: [-1, 0, 0],
    role: "hinge",
    group: "wheelRR",
  });

  const cabBody = b.joint("cabBody", {
    parent: chassis,
    at: [0, 1.84, 0],
    dir: [0, 0, 1],
    role: "hinge",
    group: "body",
  });

  const hood = b.joint("hood", {
    parent: cabBody,
    at: [0, 2.38, 0.78],
    dir: [0, 0, 1],
    role: "hinge",
    group: "hood",
  });

  const doorL = b.joint("doorL", {
    parent: cabBody,
    at: [0.92, 2.12, 0.68],
    dir: [0, 1, 0],
    role: "hinge",
    group: "doorL",
  });
  const doorR = b.joint("doorR", {
    parent: cabBody,
    at: [-0.92, 2.12, 0.68],
    dir: [0, 1, 0],
    role: "hinge",
    group: "doorR",
  });

  const tailgate = b.joint("tailgate", {
    parent: cabBody,
    at: [0, 1.88, -2.36],
    dir: [0, 0, -1],
    role: "hinge",
    group: "tailgate",
  });

  const steeringWheel = b.joint("steeringWheel", {
    parent: cabBody,
    at: [0, 2.30, 0.34],
    dir: [0, 0.42, -0.91],
    role: "hinge",
    group: "interior",
  });

  const blowerPulley = b.joint("blowerPulley", {
    parent: chassis,
    at: [0, 2.52, 1.62],
    dir: [0, 0, 1],
    role: "hinge",
    group: "engine",
  });

  const whipAntennaL = b.joint("whipAntennaL", {
    parent: cabBody,
    at: [0.90, 2.38, -2.28],
    dir: [0, 1, -0.1],
    role: "hinge",
    group: "antenna",
  });
  const whipAntennaR = b.joint("whipAntennaR", {
    parent: cabBody,
    at: [-0.90, 2.38, -2.28],
    dir: [0, 1, -0.1],
    role: "hinge",
    group: "antenna",
  });

  // ---------------------------------------------------------------------------
  // 4. HUGE 66-INCH MONSTER TYRES, BEADLOCK RIMS & PLANETARY HUBS
  // ---------------------------------------------------------------------------
  const wheelConfigs = [
    { joint: wheelFL, s: 1, z: Z_FRONT, tag: "FL" },
    { joint: wheelFR, s: -1, z: Z_FRONT, tag: "FR" },
    { joint: wheelRL, s: 1, z: Z_REAR, tag: "RL" },
    { joint: wheelRR, s: -1, z: Z_REAR, tag: "RR" },
  ] as const;

  for (const { joint, s, z, tag } of wheelConfigs) {
    const grp = `wheel${tag}`;

    // Main carcass cylinder (radius 0.76 m, width 1.00 m from |x|=0.78 to |x|=1.78)
    b.rod([s * 0.78, Y_HUB, z], [s * 1.78, Y_HUB, z], 0.76, TYRE_RUBBER_PAINT, {
      bone: joint,
      sides: 16,
      smooth: false,
      group: grp,
      name: `tyreCarcass_${tag}`,
    });

    // Stepped pixel sidewall shoulders (outer & inner)
    b.rod([s * 1.76, Y_HUB, z], [s * 1.82, Y_HUB, z], 0.68, TYRE_SIDEWALL_PAINT, {
      bone: joint,
      sides: 16,
      smooth: false,
      group: grp,
      name: `tyreShoulderOut_${tag}`,
    });
    b.rod([s * 0.74, Y_HUB, z], [s * 0.80, Y_HUB, z], 0.68, TYRE_SIDEWALL_PAINT, {
      bone: joint,
      sides: 16,
      smooth: false,
      group: grp,
      name: `tyreShoulderIn_${tag}`,
    });

    // Sidewall raised rib ring
    b.rod([s * 1.80, Y_HUB, z], [s * 1.835, Y_HUB, z], 0.57, COL_RUBBER, {
      bone: joint,
      sides: 16,
      smooth: false,
      group: grp,
      name: `tyreRibOut_${tag}`,
    });

    // 16 Paired Herringbone Chevron Mud Lugs around the 66-inch tyre
    // At k=8 (bottom, theta=PI), radial center is 0.778 + half-height 0.065 = 0.843 m below Y_HUB (0.840 m),
    // placing the lowest tread contact patch at y = -0.003 m (3 mm floor contact).
    const lugCount = 16;
    const lugGeo = tileBox([0.48, 0.13, 0.14], TREAD_TILE, TEXEL, { rand });
    const bridgeGeo = tileBox([0.24, 0.11, 0.12], TREAD_TILE, TEXEL, { rand });

    for (let k = 0; k < lugCount; k++) {
      const theta = (k / lugCount) * Math.PI * 2;
      const ny = Math.cos(theta);
      const nz = Math.sin(theta);
      const ty = -Math.sin(theta);
      const tz = Math.cos(theta);
      const rCenter = 0.778;
      const baseY = Y_HUB + ny * rCenter;
      const baseZ = z + nz * rCenter;

      // Outer half-chevron lug (angled +22 deg across tread)
      const shiftOut = 0.032;
      b.part(lugGeo, COL_RUBBER, {
        texture: TREAD_TILE,
        bone: joint,
        at: [s * 1.52, baseY + ty * shiftOut, baseZ + tz * shiftOut],
        dir: [0, ny, nz],
        up: [s * 0.36, ty, tz],
        axis: "y",
        group: grp,
        name: `lugOut_${tag}_${k}`,
      });

      // Inner half-chevron lug (angled -22 deg across tread)
      const shiftIn = -0.032;
      b.part(lugGeo, COL_RUBBER, {
        texture: TREAD_TILE,
        bone: joint,
        at: [s * 1.04, baseY + ty * shiftIn, baseZ + tz * shiftIn],
        dir: [0, ny, nz],
        up: [-s * 0.36, ty, tz],
        axis: "y",
        group: grp,
        name: `lugIn_${tag}_${k}`,
      });

      // Alternating central crown bite block every second station
      if (k % 2 === 0) {
        b.part(bridgeGeo, COL_BLACK, {
          texture: TREAD_TILE,
          bone: joint,
          at: [s * 1.28, Y_HUB + ny * 0.768, z + nz * 0.768],
          dir: [0, ny, nz],
          up: [0, ty, tz],
          axis: "y",
          group: grp,
          name: `lugCrown_${tag}_${k}`,
        });
      }
    }

    // Deep-dish steel wheel barrel (spans through tyre core from |x|=0.73 to |x|=1.84)
    b.rod([s * 0.73, Y_HUB, z], [s * 1.84, Y_HUB, z], 0.44, AXLE_STEEL_PAINT, {
      bone: joint,
      sides: 12,
      smooth: false,
      group: grp,
      name: `rimBarrel_${tag}`,
    });

    // Outer Yellow/Gold Beadlock Ring
    b.rod([s * 1.81, Y_HUB, z], [s * 1.855, Y_HUB, z], 0.46, BEADLOCK_PAINT, {
      bone: joint,
      sides: 12,
      smooth: false,
      group: grp,
      name: `beadlock_${tag}`,
    });

    // Inner recessed dish pocket
    b.rod([s * 1.68, Y_HUB, z], [s * 1.86, Y_HUB, z], 0.34, COL_BLACK, {
      bone: joint,
      sides: 12,
      smooth: false,
      group: grp,
      name: `rimDish_${tag}`,
    });

    // 6 Heavy Mag Spokes inside wheel dish
    const spokeGeo = new THREE.BoxGeometry(0.12, 0.68, 0.11);
    for (let sp = 0; sp < 3; sp++) {
      const ang = (sp / 3) * Math.PI;
      b.part(spokeGeo, COL_LIGHT_STEEL, {
        bone: joint,
        at: [s * 1.82, Y_HUB, z],
        dir: [0, Math.cos(ang), Math.sin(ang)],
        up: [1, 0, 0],
        axis: "y",
        group: grp,
        name: `rimSpoke_${tag}_${sp}`,
      });
    }

    // Planetary Gear Reduction Hub & Cap in wheel centre
    b.rod([s * 1.55, Y_HUB, z], [s * 1.89, Y_HUB, z], 0.18, COL_DARK_STEEL, {
      bone: joint,
      sides: 8,
      smooth: false,
      group: grp,
      name: `planetaryHub_${tag}`,
    });
    b.rod([s * 1.86, Y_HUB, z], [s * 1.92, Y_HUB, z], 0.12, COL_GREEN, {
      bone: joint,
      sides: 8,
      smooth: false,
      group: grp,
      name: `planetaryCap_${tag}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 5. HEAVY PLANETARY AXLES, 4-WHEEL STEERING KNUCKLES & HYDRAULIC RAMS
  // ---------------------------------------------------------------------------
  const axleConfigs = [
    {
      axleJoint: axleFront,
      steerL: steerFL,
      steerR: steerFR,
      z: Z_FRONT,
      end: 1,
      tag: "Front",
    },
    {
      axleJoint: axleRear,
      steerL: steerRL,
      steerR: steerRR,
      z: Z_REAR,
      end: -1,
      tag: "Rear",
    },
  ] as const;

  for (const { axleJoint, steerL, steerR, z, end, tag } of axleConfigs) {
    const grp = `axle${tag}`;

    // Main heavy solid axle tube spanning between left and right steering knuckles
    b.rod([-0.86, Y_HUB, z], [0.86, Y_HUB, z], 0.11, AXLE_STEEL_PAINT, {
      bone: axleJoint,
      sides: 8,
      smooth: false,
      group: grp,
      name: `axleTube_${tag}`,
    });

    // Heavy central differential housing ("pumpkin")
    b.part(tileBox([0.46, 0.44, 0.44], STEEL_TILE, TEXEL, { rand }), COL_DARK_STEEL, {
      texture: STEEL_TILE,
      bone: axleJoint,
      at: [0, Y_HUB, z],
      group: grp,
      name: `diffHousing_${tag}`,
    });

    // Finned differential cover plate (gold/green armored skid cover)
    b.part(tileBox([0.34, 0.34, 0.12], DIAMOND_TILE, TEXEL, { rand }), COL_GOLD, {
      texture: DIAMOND_TILE,
      bone: axleJoint,
      at: [0, Y_HUB, z + end * 0.23],
      group: grp,
      name: `diffCover_${tag}`,
    });

    // Differential pinion nose pointing inward toward transfer case
    b.rod([0, Y_HUB + 0.03, z], [0, Y_HUB + 0.08, z - end * 0.36], 0.11, COL_DARK_STEEL, {
      bone: axleJoint,
      sides: 8,
      smooth: false,
      group: grp,
      name: `diffPinion_${tag}`,
    });

    // Pixel-stepped Upper Axle Truss Bridge (welded across top of axle tube)
    const trussOutline = stepped(
      [
        [-11, 11],
        [-9, 9],
        [-6, 6],
        [-4, 4],
      ],
      [0.055, 0.055],
      { rows: true },
    );
    b.extrude(trussOutline, {
      at: [0, Y_HUB + 0.07, z],
      x: [1, 0, 0],
      thickness: 0.16,
      color: CHASSIS_PAINT,
      bone: axleJoint,
      group: grp,
      name: `axleTruss_${tag}`,
    });

    // Double-ended Hydraulic Steering Cylinder & Tie Rod across the axle
    b.rod([-0.38, Y_HUB - 0.04, z + end * 0.26], [0.38, Y_HUB - 0.04, z + end * 0.26], 0.055, COL_GREEN, {
      bone: axleJoint,
      sides: 6,
      smooth: false,
      group: grp,
      name: `steerRamBody_${tag}`,
    });
    b.rod([-0.86, Y_HUB - 0.04, z + end * 0.26], [0.86, Y_HUB - 0.04, z + end * 0.26], 0.036, COL_CHROME, {
      bone: axleJoint,
      sides: 6,
      smooth: false,
      group: grp,
      name: `steerTieRod_${tag}`,
    });

    // Left and Right Steering Knuckles & Inboard Disc Brakes
    for (const [s, steerJoint, sideTag] of [
      [1, steerL, "L"],
      [-1, steerR, "R"],
    ] as const) {
      // Heavy C-hub & kingpin steering knuckle overlapping both axle tube (|x|=0.86) and wheel rim (|x|=0.73)
      b.part(tileBox([0.32, 0.36, 0.34], STEEL_TILE, TEXEL, { rand }), COL_MID_STEEL, {
        texture: STEEL_TILE,
        bone: steerJoint,
        at: [s * 0.82, Y_HUB, z],
        group: grp,
        name: `knuckle_${tag}_${sideTag}`,
      });

      // High-steer knuckle arm reaching out to the hydraulic tie rod
      b.part(new THREE.BoxGeometry(0.12, 0.12, 0.32), COL_GREEN, {
        bone: steerJoint,
        at: [s * 0.82, Y_HUB - 0.04, z + end * 0.16],
        group: grp,
        name: `steerArm_${tag}_${sideTag}`,
      });

      // Heavy vented brake rotor & red caliper at axle hub
      b.rod([s * 0.64, Y_HUB, z], [s * 0.72, Y_HUB, z], 0.24, COL_LIGHT_STEEL, {
        bone: steerJoint,
        sides: 12,
        smooth: false,
        group: grp,
        name: `brakeRotor_${tag}_${sideTag}`,
      });
      b.part(new THREE.BoxGeometry(0.14, 0.18, 0.22), COL_RED, {
        bone: steerJoint,
        at: [s * 0.68, Y_HUB + 0.18, z],
        group: grp,
        name: `brakeCaliper_${tag}_${sideTag}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 6. 4-LINK SUSPENSION & 8 NITROGEN BYPASS COILOVER SHOCKS
  // ---------------------------------------------------------------------------
  const suspCorners = [
    { joint: suspFL, s: 1, end: 1, tag: "FL" },
    { joint: suspFR, s: -1, end: 1, tag: "FR" },
    { joint: suspRL, s: 1, end: -1, tag: "RL" },
    { joint: suspRR, s: -1, end: -1, tag: "RR" },
  ] as const;

  for (const { joint, s, end, tag } of suspCorners) {
    const zAxle = end * 1.70;
    const grp = `susp_${tag}`;

    // Lower heavy tubular 4-link bar (from chassis belly cradle to lower axle bracket)
    b.rod([s * 0.48, 1.18, end * 0.34], [s * 0.58, 0.78, zAxle - end * 0.04], 0.048, CHASSIS_PAINT, {
      bone: joint,
      sides: 6,
      smooth: false,
      group: grp,
      name: `lowerLink_${tag}`,
    });

    // Upper triangulated 4-link bar (from mid-chassis rail to axle top truss)
    b.rod([s * 0.42, 1.40, end * 0.46], [s * 0.22, 1.04, zAxle - end * 0.04], 0.044, CHASSIS_PAINT, {
      bone: joint,
      sides: 6,
      smooth: false,
      group: grp,
      name: `upperLink_${tag}`,
    });

    // Axle link mounting bracket block
    b.part(new THREE.BoxGeometry(0.14, 0.24, 0.22), COL_DARK_STEEL, {
      bone: joint,
      at: [s * 0.58, 0.84, zAxle - end * 0.06],
      group: grp,
      name: `axleLinkBracket_${tag}`,
    });

    // Dual Long-Travel Nitrogen Coilover Shocks per wheel (2 per corner = 8 total)
    for (const [idx, zOff] of [
      [1, -0.13],
      [2, 0.13],
    ] as const) {
      const zTop = end * 1.56 + zOff;
      const zBot = zAxle + zOff * 0.85;
      const topPt: [number, number, number] = [s * 0.62, 1.86, zTop];
      const midPt: [number, number, number] = [s * 0.64, 1.32, (zTop + zBot) * 0.5];
      const botPt: [number, number, number] = [s * 0.66, 0.86, zBot];

      // Upper coilover body & spring
      b.rod(topPt, midPt, 0.056, SHOCK_COIL_PAINT, {
        bone: joint,
        sides: 8,
        smooth: false,
        group: grp,
        name: `shockCoil_${tag}_${idx}`,
      });

      // Lower chrome shock shaft
      b.rod(midPt, botPt, 0.036, COL_CHROME, {
        bone: joint,
        sides: 6,
        smooth: false,
        group: grp,
        name: `shockShaft_${tag}_${idx}`,
      });

      // Piggyback blue anodized nitrogen reservoir cylinder
      b.rod(
        [s * 0.70, 1.84, zTop],
        [s * 0.70, 1.54, zTop],
        0.038,
        COL_CYAN,
        {
          bone: joint,
          sides: 6,
          smooth: false,
          group: grp,
          name: `shockRes_${tag}_${idx}`,
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // 7. TUBE-FRAME SPACEFRAME CHASSIS, TRANSFER CASE & SUPERCHARGED V8 ENGINE
  // ---------------------------------------------------------------------------

  // Central diamond-plate belly skid pan & cradle
  b.part(tileBox([1.08, 0.12, 1.96], DIAMOND_TILE, TEXEL, { rand }), COL_MID_STEEL, {
    texture: DIAMOND_TILE,
    bone: chassis,
    at: [0, 1.18, 0],
    group: "chassis",
    name: "bellySkidPlate",
  });

  // Lower & Upper longitudinal spaceframe rails + diagonal truss members
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // Lower main rail
    b.part(new THREE.BoxGeometry(0.11, 0.11, 3.60), CHASSIS_PAINT, {
      bone: chassis,
      at: [s * 0.48, 1.22, 0],
      group: "chassis",
      name: `lowerFrameRail_${side}`,
    });

    // Upper main rail
    b.part(new THREE.BoxGeometry(0.11, 0.11, 4.30), CHASSIS_PAINT, {
      bone: chassis,
      at: [s * 0.56, 1.82, 0],
      group: "chassis",
      name: `upperFrameRail_${side}`,
    });

    // Diagonal spaceframe triangulation struts along flank
    const bayZs = [-1.72, -1.04, -0.36, 0.36, 1.04, 1.72];
    for (let i = 0; i < bayZs.length - 1; i++) {
      const z0 = bayZs[i];
      const z1 = bayZs[i + 1];
      const upFirst = i % 2 === 0;
      b.rod(
        [s * 0.50, upFirst ? 1.22 : 1.82, z0],
        [s * 0.54, upFirst ? 1.82 : 1.22, z1],
        0.044,
        CHASSIS_PAINT,
        {
          bone: chassis,
          sides: 6,
          smooth: false,
          group: "chassis",
          name: `frameDiag_${side}_${i}`,
        },
      );
      // Vertical post at bay station
      b.rod([s * 0.48, 1.22, z0], [s * 0.56, 1.82, z0], 0.044, CHASSIS_PAINT, {
        bone: chassis,
        sides: 6,
        smooth: false,
        group: "chassis",
        name: `framePost_${side}_${i}`,
      });
    }

    // Front and Rear Dual-Shock Tower Bridges
    for (const [end, endTag] of [
      [1, "F"],
      [-1, "R"],
    ] as const) {
      b.part(new THREE.BoxGeometry(0.28, 0.14, 0.44), CHASSIS_PAINT, {
        bone: chassis,
        at: [s * 0.62, 1.86, end * 1.56],
        group: "chassis",
        name: `shockTower_${side}_${endTag}`,
      });
    }

    // Heavy chrome nerf / cab step bars hung from the lower cradle
    b.rod([s * 0.48, 1.32, -0.45], [s * 1.02, 1.32, -0.45], 0.045, COL_CHROME, {
      bone: chassis,
      sides: 6,
      smooth: false,
      group: "chassis",
      name: `stepOutriggerR_${side}`,
    });
    b.rod([s * 0.48, 1.32, 0.65], [s * 1.02, 1.32, 0.65], 0.045, COL_CHROME, {
      bone: chassis,
      sides: 6,
      smooth: false,
      group: "chassis",
      name: `stepOutriggerF_${side}`,
    });
    b.part(tileBox([0.14, 0.08, 1.24], DIAMOND_TILE, TEXEL, { rand }), COL_CHROME, {
      texture: DIAMOND_TILE,
      bone: chassis,
      at: [s * 1.00, 1.32, 0.10],
      group: "chassis",
      name: `stepBar_${side}`,
    });
  }

  // Crossmembers tying left and right frame rails together
  for (const [idx, zCross] of [
    [0, -1.72],
    [1, -0.92],
    [2, 0.0],
    [3, 0.92],
    [4, 1.72],
  ] as const) {
    b.part(new THREE.BoxGeometry(1.14, 0.10, 0.12), CHASSIS_PAINT, {
      bone: chassis,
      at: [0, 1.80, zCross],
      group: "chassis",
      name: `crossmember_${idx}`,
    });
  }

  // Central Drop-Box Transfer Case & Heavy Driveshafts with U-joint Yokes
  b.part(tileBox([0.44, 0.42, 0.48], STEEL_TILE, TEXEL, { rand }), COL_DARK_STEEL, {
    texture: STEEL_TILE,
    bone: chassis,
    at: [0, 1.28, -0.05],
    group: "drivetrain",
    name: "transferCase",
  });
  // Front driveshaft
  b.rod([0, 1.18, 0.14], [0, 0.90, 1.42], 0.055, COL_LIGHT_STEEL, {
    bone: chassis,
    sides: 6,
    smooth: false,
    group: "drivetrain",
    name: "driveshaftFront",
  });
  // Rear driveshaft
  b.rod([0, 1.18, -0.22], [0, 0.90, -1.42], 0.055, COL_LIGHT_STEEL, {
    bone: chassis,
    sides: 6,
    smooth: false,
    group: "drivetrain",
    name: "driveshaftRear",
  });

  // Supercharged 540ci Monster V8 Engine (front-mid bay rising through hood cutout)
  const Z_ENG = 1.28;
  // Engine block & deep-sump racing oil pan
  b.part(tileBox([0.56, 0.52, 0.74], STEEL_TILE, TEXEL, { rand }), COL_RED, {
    texture: STEEL_TILE,
    bone: chassis,
    at: [0, 1.54, Z_ENG],
    group: "engine",
    name: "engineBlock",
  });
  // Angled cylinder heads & finned valve covers
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.part(tileBox([0.22, 0.22, 0.68], CHROME_TILE, TEXEL), COL_CHROME, {
      texture: CHROME_TILE,
      bone: chassis,
      at: [s * 0.26, 1.82, Z_ENG],
      rotation: [0, 0, -s * 28],
      group: "engine",
      name: `valveCover_${side}`,
    });

    // 4 Zoomie Side-Exit Exhaust Header Pipes per bank
    for (let p = 0; p < 4; p++) {
      const zp = Z_ENG - 0.24 + p * 0.16;
      b.rod([s * 0.28, 1.76, zp], [s * 0.68, 1.44, zp - 0.06], 0.042, COL_CHROME, {
        bone: chassis,
        sides: 6,
        smooth: false,
        group: "engine",
        name: `zoomieHeader_${side}_${p}`,
      });
      // Glowing hot exhaust tip
      glow(
        b.part(new THREE.BoxGeometry(0.07, 0.07, 0.07), COL_ORANGE, {
          bone: chassis,
          at: [s * 0.69, 1.43, zp - 0.06],
          group: "engine",
          name: `zoomieGlow_${side}_${p}`,
        }),
        1.4,
      );
    }
  }

  // Tall polished intake riser tower extending up through hood opening
  b.part(tileBox([0.42, 0.62, 0.58], STEEL_TILE, TEXEL, { rand }), COL_MID_STEEL, {
    texture: STEEL_TILE,
    bone: chassis,
    at: [0, 2.12, Z_ENG],
    group: "engine",
    name: "intakeRiser",
  });

  // Roots Supercharger Blower Case (protruding above hood)
  b.part(skinBox(BODY_SHEET, layout.faces.blower, TEXEL), COL_WHITE, {
    texture: BODY_SHEET,
    bone: chassis,
    at: [0, 2.52, Z_ENG],
    group: "engine",
    name: "superchargerCase",
  });

  // Blower Gilmer Belt Drive & Pulleys on `blowerPulley` hinge joint
  b.rod([0, 2.52, 1.60], [0, 2.52, 1.70], 0.12, COL_CHROME, {
    bone: blowerPulley,
    sides: 10,
    smooth: false,
    group: "engine",
    name: "upperBlowerPulley",
  });
  b.rod([0, 2.14, 1.56], [0, 2.14, 1.66], 0.12, COL_CHROME, {
    bone: blowerPulley,
    sides: 10,
    smooth: false,
    group: "engine",
    name: "lowerCrankPulley",
  });
  b.part(new THREE.BoxGeometry(0.22, 0.44, 0.08), COL_BLACK, {
    bone: blowerPulley,
    at: [0, 2.33, 1.62],
    group: "engine",
    name: "blowerDriveBelt",
  });

  // Triple-Barrel "Bugcatcher" Scoop on top of Supercharger
  b.part(tileBox([0.48, 0.20, 0.56], CHROME_TILE, TEXEL), COL_CHROME, {
    texture: CHROME_TILE,
    bone: blowerPulley,
    at: [0, 2.74, Z_ENG + 0.02],
    group: "engine",
    name: "bugcatcherScoop",
  });
  // Glowing red butterfly intake throats on front of scoop
  for (const dx of [-0.14, 0, 0.14]) {
    glow(
      b.part(new THREE.BoxGeometry(0.10, 0.11, 0.08), COL_RED, {
        bone: blowerPulley,
        at: [dx, 2.74, Z_ENG + 0.28],
        group: "engine",
        name: `butterflyValve_${dx}`,
      }),
      1.2,
    );
  }

  // ---------------------------------------------------------------------------
  // 8. PICKUP TRUCK BODY SHELL, HOT-ROD FLAMES, DOORS, HOOD & TAILGATE
  // ---------------------------------------------------------------------------

  // Front Grille & Headlight Fascia (`z = 2.28`)
  b.part(skinBox(BODY_SHEET, layout.faces.grille, TEXEL), COL_WHITE, {
    texture: BODY_SHEET,
    bone: cabBody,
    at: [0, 2.11, 2.28],
    group: "body",
    name: "frontGrille",
  });

  // Glowing Quad Pixel Headlights + Amber Turn Signals on Front Fascia
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    glow(
      b.part(new THREE.BoxGeometry(0.34, 0.30, 0.08), COL_WHITE, {
        texture: HEADLIGHT_TEX,
        bone: cabBody,
        at: [s * 0.62, 2.12, 2.39],
        group: "lights",
        name: `headlight_${side}`,
      }),
      1.5,
    );
  }

  // Hinged Hood Panel (`hood` joint)
  b.part(skinBox(BODY_SHEET, layout.faces.hood, TEXEL), COL_WHITE, {
    texture: BODY_SHEET,
    bone: hood,
    at: [0, 2.38, 1.54],
    group: "hood",
    name: "hoodPanel",
  });

  // Left and Right Front Fenders & Flared Pixel Wheel Arches
  const archFlareOutline = stepped(
    [
      [-26, 26],
      [-24, 24],
      [-20, 20],
      [-14, 14],
    ],
    [0.025, 0.04],
    { rows: true },
  );

  for (const [s, fenderFaces, side] of [
    [1, layout.faces.fenderFL, "L"],
    [-1, layout.faces.fenderFR, "R"],
  ] as const) {
    b.part(skinBox(BODY_SHEET, fenderFaces, TEXEL), COL_WHITE, {
      texture: BODY_SHEET,
      bone: cabBody,
      at: [s * 0.76, 2.13, 1.54],
      group: "body",
      name: `frontFender_${side}`,
    });

    // Wide stepped fender flare over front wheel
    b.extrude(archFlareOutline, {
      at: [s * 0.94, 1.98, Z_FRONT],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.22,
      color: FLAME_BODY_PAINT,
      bone: cabBody,
      group: "body",
      name: `frontArchFlare_${side}`,
    });
  }

  // Cab Floor Pan, Firewall & Rear Bulkhead
  b.part(tileBox([1.84, 0.12, 1.44], DIAMOND_TILE, TEXEL, { rand }), COL_DARK_STEEL, {
    texture: DIAMOND_TILE,
    bone: cabBody,
    at: [0, 1.84, 0.12],
    group: "body",
    name: "cabFloorPan",
  });
  b.part(new THREE.BoxGeometry(1.80, 0.56, 0.12), COL_DARK_BLUE, {
    bone: cabBody,
    at: [0, 2.12, 0.78],
    group: "body",
    name: "cabFirewall",
  });
  b.part(new THREE.BoxGeometry(1.80, 0.56, 0.12), COL_BLUE, {
    bone: cabBody,
    at: [0, 2.12, -0.54],
    group: "body",
    name: "cabRearWall",
  });

  // Cab Roof & Forward Sun Visor with 5 Amber Clearance Lights
  b.part(skinBox(BODY_SHEET, layout.faces.cabRoof, TEXEL), COL_WHITE, {
    texture: BODY_SHEET,
    bone: cabBody,
    at: [0, 2.96, 0.10],
    group: "body",
    name: "cabRoofPanel",
  });
  b.part(new THREE.BoxGeometry(1.66, 0.10, 0.22), COL_DARK_BLUE, {
    bone: cabBody,
    at: [0, 2.90, 0.72],
    group: "body",
    name: "windshieldVisor",
  });
  for (const dx of [-0.60, -0.30, 0, 0.30, 0.60]) {
    glow(
      b.part(new THREE.BoxGeometry(0.11, 0.07, 0.09), COL_AMBER, {
        bone: cabBody,
        at: [dx, 3.02, 0.64],
        group: "lights",
        name: `cabMarkerLight_${dx}`,
      }),
      1.5,
    );
  }

  // Cab A-Pillars & B-Pillars
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    // Angled A-pillar
    b.rod([s * 0.84, 2.36, 0.74], [s * 0.78, 2.94, 0.58], 0.06, FLAME_BODY_PAINT, {
      bone: cabBody,
      section: "box",
      smooth: false,
      group: "body",
      name: `aPillar_${side}`,
    });
    // Vertical B-pillar
    b.part(new THREE.BoxGeometry(0.14, 0.64, 0.18), FLAME_BODY_PAINT, {
      bone: cabBody,
      at: [s * 0.83, 2.66, -0.48],
      group: "body",
      name: `bPillar_${side}`,
    });
  }

  // Left and Right Hinged Cab Doors (`doorL`, `doorR`) with Side Mirrors & Handles
  for (const [s, doorJoint, doorFaces, side] of [
    [1, doorL, layout.faces.doorL, "L"],
    [-1, doorR, layout.faces.doorR, "R"],
  ] as const) {
    const grp = `door${side}`;
    b.part(skinBox(BODY_SHEET, doorFaces, TEXEL), COL_WHITE, {
      texture: BODY_SHEET,
      bone: doorJoint,
      at: [s * 0.88, 2.12, 0.12],
      group: grp,
      name: `doorPanel_${side}`,
    });

    // Chrome exterior door handle
    b.part(new THREE.BoxGeometry(0.08, 0.08, 0.20), COL_CHROME, {
      bone: doorJoint,
      at: [s * 0.99, 2.26, -0.18],
      group: grp,
      name: `doorHandle_${side}`,
    });

    // West-Coast Chrome Towing Mirror & Bracket Arms
    b.rod([s * 0.92, 2.42, 0.54], [s * 1.14, 2.42, 0.54], 0.03, COL_CHROME, {
      bone: doorJoint,
      sides: 6,
      smooth: false,
      group: grp,
      name: `mirrorArmBot_${side}`,
    });
    b.rod([s * 0.88, 2.72, 0.52], [s * 1.14, 2.72, 0.52], 0.03, COL_CHROME, {
      bone: doorJoint,
      sides: 6,
      smooth: false,
      group: grp,
      name: `mirrorArmTop_${side}`,
    });
    b.part(tileBox([0.08, 0.34, 0.16], CHROME_TILE, TEXEL), COL_CHROME, {
      texture: CHROME_TILE,
      bone: doorJoint,
      at: [s * 1.15, 2.57, 0.53],
      group: grp,
      name: `sideMirror_${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 9. CAB INTERIOR: DASHBOARD, CENTER RACING SEAT, HARNESS, SHIFTER & ROLL CAGE
  // ---------------------------------------------------------------------------

  // Dashboard Beam & Glowing Digital Telemetry Cluster
  b.part(tileBox([1.68, 0.28, 0.28], STEEL_TILE, TEXEL, { rand }), COL_DARK_STEEL, {
    texture: STEEL_TILE,
    bone: cabBody,
    at: [0, 2.28, 0.62],
    group: "interior",
    name: "dashboardMain",
  });
  glow(
    b.part(new THREE.BoxGeometry(0.68, 0.20, 0.08), COL_WHITE, {
      texture: DASH_GAUGE_TEX,
      bone: cabBody,
      at: [0, 2.32, 0.47],
      group: "interior",
      name: "dashTelemetryScreen",
    }),
    1.2,
  );

  // Steering Column & 3-Spoke Dish Steering Wheel (`steeringWheel` joint)
  b.rod([0, 2.22, 0.58], [0, 2.30, 0.34], 0.045, COL_DARK_STEEL, {
    bone: cabBody,
    sides: 6,
    smooth: false,
    group: "interior",
    name: "steeringColumn",
  });
  b.rod([0, 2.29, 0.36], [0, 2.33, 0.28], 0.18, COL_RED, {
    bone: steeringWheel,
    sides: 10,
    smooth: false,
    group: "interior",
    name: "steeringWheelRim",
  });
  b.rod([0, 2.28, 0.37], [0, 2.34, 0.27], 0.08, COL_BLACK, {
    bone: steeringWheel,
    sides: 8,
    smooth: false,
    group: "interior",
    name: "steeringWheelHub",
  });

  // Centre Stadium Racing Bucket Seat with 5-Point Harness
  b.part(new THREE.BoxGeometry(0.56, 0.16, 0.54), COL_BLACK, {
    bone: cabBody,
    at: [0, 1.96, -0.08],
    group: "interior",
    name: "seatCushion",
  });
  b.part(skinBox(BODY_SHEET, layout.faces.seatBack, TEXEL), COL_WHITE, {
    texture: BODY_SHEET,
    bone: cabBody,
    at: [0, 2.34, -0.26],
    group: "interior",
    name: "seatBackrest",
  });
  // Side head/shoulder containment bolsters
  for (const s of [1, -1] as const) {
    b.part(new THREE.BoxGeometry(0.10, 0.56, 0.28), COL_RED, {
      bone: cabBody,
      at: [s * 0.28, 2.36, -0.18],
      group: "interior",
      name: `seatBolster_${s > 0 ? "L" : "R"}`,
    });
  }

  // Tall Floor Shifter & Red Reverse-Lockout Lever
  b.rod([-0.34, 1.88, 0.14], [-0.30, 2.32, 0.20], 0.032, COL_CHROME, {
    bone: cabBody,
    sides: 6,
    smooth: false,
    group: "interior",
    name: "shifterStick",
  });
  b.part(new THREE.BoxGeometry(0.10, 0.10, 0.10), COL_RED, {
    bone: cabBody,
    at: [-0.30, 2.34, 0.20],
    group: "interior",
    name: "shifterKnob",
  });

  // Interior Green Roll Cage Halo & Rear Cross-Brace
  b.rod([-0.72, 2.86, -0.42], [0.72, 2.86, -0.42], 0.044, CHASSIS_PAINT, {
    bone: cabBody,
    sides: 6,
    smooth: false,
    group: "interior",
    name: "rollCageHaloRear",
  });
  b.rod([-0.68, 1.92, -0.42], [0.68, 2.86, -0.42], 0.040, CHASSIS_PAINT, {
    bone: cabBody,
    sides: 6,
    smooth: false,
    group: "interior",
    name: "rollCageXBrace1",
  });
  b.rod([0.68, 1.92, -0.42], [-0.68, 2.86, -0.42], 0.040, CHASSIS_PAINT, {
    bone: cabBody,
    sides: 6,
    smooth: false,
    group: "interior",
    name: "rollCageXBrace2",
  });

  // ---------------------------------------------------------------------------
  // 10. PICKUP BED, BED ROLL BAR, RADIATOR, FUEL CELL & ROOF STADIUM LIGHT BAR
  // ---------------------------------------------------------------------------

  // Diamond-plate pickup bed floor
  b.part(tileBox([1.72, 0.12, 1.84], DIAMOND_TILE, TEXEL, { rand }), COL_MID_STEEL, {
    texture: DIAMOND_TILE,
    bone: cabBody,
    at: [0, 1.86, -1.46],
    group: "bed",
    name: "bedFloor",
  });

  // Left and Right Pickup Bed Sides + Flared Rear Wheel Arches
  for (const [s, bedFaces, side] of [
    [1, layout.faces.bedSideL, "L"],
    [-1, layout.faces.bedSideR, "R"],
  ] as const) {
    b.part(skinBox(BODY_SHEET, bedFaces, TEXEL), COL_WHITE, {
      texture: BODY_SHEET,
      bone: cabBody,
      at: [s * 0.78, 2.13, -1.46],
      group: "bed",
      name: `bedSide_${side}`,
    });

    // Wide stepped fender flare over rear 66-inch tyre
    b.extrude(archFlareOutline, {
      at: [s * 0.94, 1.98, Z_REAR],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.22,
      color: FLAME_BODY_PAINT,
      bone: cabBody,
      group: "bed",
      name: `rearArchFlare_${side}`,
    });
  }

  // Bed-Mounted Red Anodized Racing Fuel Cell & Dual Competition Radiator Assembly
  b.part(skinBox(BODY_SHEET, layout.faces.fuelCell, TEXEL), COL_WHITE, {
    texture: BODY_SHEET,
    bone: cabBody,
    at: [0, 2.08, -1.78],
    group: "bed",
    name: "racingFuelCell",
  });
  b.part(tileBox([1.12, 0.42, 0.22], STEEL_TILE, TEXEL, { rand }), COL_DARK_STEEL, {
    texture: STEEL_TILE,
    bone: cabBody,
    at: [0, 2.14, -1.04],
    group: "bed",
    name: "rearRadiatorCore",
  });
  for (const s of [1, -1] as const) {
    b.rod([s * 0.28, 2.14, -1.12], [s * 0.28, 2.14, -1.20], 0.16, COL_GOLD, {
      bone: cabBody,
      sides: 8,
      smooth: false,
      group: "bed",
      name: `radiatorFan_${s > 0 ? "L" : "R"}`,
    });
  }

  // Heavy Double-Hoop Chrome Bed Roll Bar & Rear Kicker Bars
  for (const zHoop of [-0.72, -0.96] as const) {
    const tag = zHoop === -0.72 ? "Front" : "Rear";
    b.rod([-0.74, 2.34, zHoop], [-0.70, 3.04, zHoop], 0.055, COL_CHROME, {
      bone: cabBody,
      sides: 6,
      smooth: false,
      group: "rollBar",
      name: `bedBarPostR_${tag}`,
    });
    b.rod([0.74, 2.34, zHoop], [0.70, 3.04, zHoop], 0.055, COL_CHROME, {
      bone: cabBody,
      sides: 6,
      smooth: false,
      group: "rollBar",
      name: `bedBarPostL_${tag}`,
    });
    b.rod([-0.72, 3.04, zHoop], [0.72, 3.04, zHoop], 0.055, COL_CHROME, {
      bone: cabBody,
      sides: 6,
      smooth: false,
      group: "rollBar",
      name: `bedBarCross_${tag}`,
    });
  }
  for (const s of [1, -1] as const) {
    b.rod([s * 0.70, 3.00, -0.96], [s * 0.74, 2.34, -2.08], 0.052, COL_CHROME, {
      bone: cabBody,
      sides: 6,
      smooth: false,
      group: "rollBar",
      name: `bedBarKicker_${s > 0 ? "L" : "R"}`,
    });
  }

  // 5-Lamp Stadium Floodlight Bar atop the Bed Roll Bar (`y = 3.08..3.32`)
  b.part(new THREE.BoxGeometry(1.48, 0.08, 0.14), COL_CHROME, {
    bone: cabBody,
    at: [0, 3.08, -0.78],
    group: "lights",
    name: "roofLightBarMount",
  });
  for (const [idx, lx] of [
    [0, -0.56],
    [1, -0.28],
    [2, 0],
    [3, 0.28],
    [4, 0.56],
  ] as const) {
    // Black spotlight bucket
    b.part(new THREE.BoxGeometry(0.22, 0.22, 0.16), COL_BLACK, {
      bone: cabBody,
      at: [lx, 3.21, -0.80],
      group: "lights",
      name: `spotlightBucket_${idx}`,
    });
    // Glowing pixel spotlight lens face
    glow(
      b.part(new THREE.BoxGeometry(0.20, 0.20, 0.07), COL_WHITE, {
        texture: SPOTLIGHT_TEX,
        bone: cabBody,
        at: [lx, 3.21, -0.71],
        group: "lights",
        name: `spotlightLens_${idx}`,
      }),
      1.8,
    );
  }

  // Hinged Tailgate (`tailgate` joint) & Glowing Pixel Tail Lights
  b.part(skinBox(BODY_SHEET, layout.faces.tailgate, TEXEL), COL_WHITE, {
    texture: BODY_SHEET,
    bone: tailgate,
    at: [0, 2.13, -2.36],
    group: "tailgate",
    name: "tailgatePanel",
  });
  for (const s of [1, -1] as const) {
    glow(
      b.part(new THREE.BoxGeometry(0.20, 0.36, 0.09), COL_WHITE, {
        texture: TAILLIGHT_TEX,
        bone: cabBody,
        at: [s * 0.80, 2.13, -2.41],
        group: "lights",
        name: `taillight_${s > 0 ? "L" : "R"}`,
      }),
      1.4,
    );
  }

  // Twin Rear Whip Antennas with Pixel Flags (`whipAntennaL`, `whipAntennaR`)
  for (const [s, antJoint, side] of [
    [1, whipAntennaL, "L"],
    [-1, whipAntennaR, "R"],
  ] as const) {
    b.rod([s * 0.90, 2.36, -2.28], [s * 0.94, 3.36, -2.42], 0.032, COL_WHITE, {
      bone: antJoint,
      sides: 6,
      smooth: false,
      group: "antenna",
      name: `whipMast_${side}`,
    });
    b.part(new THREE.BoxGeometry(0.05, 0.20, 0.34), COL_WHITE, {
      texture: FLAG_TEX,
      bone: antJoint,
      at: [s * 0.94, 3.24, -2.56],
      group: "antenna",
      name: `whipFlag_${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 11. FRONT STINGER BULL BAR, WINCH, FOG LAMPS & REAR WHEELIE BAR
  // ---------------------------------------------------------------------------

  // Front Bumper & Winch Cradle
  b.part(tileBox([1.88, 0.20, 0.24], CHROME_TILE, TEXEL), COL_CHROME, {
    texture: CHROME_TILE,
    bone: cabBody,
    at: [0, 1.82, 2.46],
    group: "bumperFront",
    name: "frontBumperMain",
  });
  b.part(tileBox([0.68, 0.22, 0.26], STEEL_TILE, TEXEL, { rand }), COL_DARK_STEEL, {
    texture: STEEL_TILE,
    bone: cabBody,
    at: [0, 1.84, 2.54],
    group: "bumperFront",
    name: "winchBox",
  });
  // Winch cable spool & red tow hooks
  b.rod([-0.18, 1.84, 2.66], [0.18, 1.84, 2.66], 0.075, COL_GOLD, {
    bone: cabBody,
    sides: 8,
    smooth: false,
    group: "bumperFront",
    name: "winchSpool",
  });
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.BoxGeometry(0.10, 0.16, 0.16), COL_RED, {
      bone: cabBody,
      at: [s * 0.42, 1.78, 2.60],
      group: "bumperFront",
      name: `frontTowHook_${side}`,
    });
    // Angled Stinger Hoop & Gussets
    b.rod([s * 0.42, 1.86, 2.52], [s * 0.24, 2.34, 2.70], 0.048, CHASSIS_PAINT, {
      bone: cabBody,
      sides: 6,
      smooth: false,
      group: "bumperFront",
      name: `stingerStrut_${side}`,
    });
    // Glowing bumper fog light
    glow(
      b.part(new THREE.BoxGeometry(0.18, 0.16, 0.09), COL_WHITE, {
        texture: SPOTLIGHT_TEX,
        bone: cabBody,
        at: [s * 0.68, 1.84, 2.58],
        group: "lights",
        name: `bumperFogLight_${side}`,
      }),
      1.5,
    );
  }
  b.rod([-0.26, 2.34, 2.70], [0.26, 2.34, 2.70], 0.048, CHASSIS_PAINT, {
    bone: cabBody,
    sides: 6,
    smooth: false,
    group: "bumperFront",
    name: "stingerTopBar",
  });

  // Rear Tubular Bumper & Stadium Wheelie Bar with Caster Rollers
  b.part(tileBox([1.84, 0.18, 0.22], CHROME_TILE, TEXEL), COL_CHROME, {
    texture: CHROME_TILE,
    bone: cabBody,
    at: [0, 1.80, -2.44],
    group: "bumperRear",
    name: "rearBumperMain",
  });

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    // Upper and lower wheelie-bar struts extending from rear chassis to caster axle
    b.rod([s * 0.44, 1.24, -1.78], [s * 0.30, 0.62, -2.70], 0.042, CHASSIS_PAINT, {
      bone: chassis,
      sides: 6,
      smooth: false,
      group: "wheelieBar",
      name: `wheelieLower_${side}`,
    });
    b.rod([s * 0.48, 1.76, -1.86], [s * 0.30, 0.62, -2.70], 0.040, CHASSIS_PAINT, {
      bone: chassis,
      sides: 6,
      smooth: false,
      group: "wheelieBar",
      name: `wheelieUpper_${side}`,
    });
    // Wheelie bar roller wheel
    b.rod([s * 0.24, 0.62, -2.70], [s * 0.36, 0.62, -2.70], 0.14, COL_RUBBER, {
      bone: chassis,
      sides: 10,
      smooth: false,
      group: "wheelieBar",
      name: `wheelieRoller_${side}`,
    });
  }
  b.rod([-0.38, 0.62, -2.70], [0.38, 0.62, -2.70], 0.045, COL_GOLD, {
    bone: chassis,
    sides: 6,
    smooth: false,
    group: "wheelieBar",
    name: "wheelieCrossAxle",
  });

  return b.root;
}
