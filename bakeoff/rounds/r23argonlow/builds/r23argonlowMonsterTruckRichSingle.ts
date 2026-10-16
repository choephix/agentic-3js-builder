// Monster Truck — "PIXEL CRUSHER"
// Pixel-art monster truck with towering 66-inch chevron-tread tyres, spaceframe roll cage,
// 4-link reservoir coilover suspension, exposed V8 supercharger bug-catcher blower,
// hot-rod flame livery, beadlock rims, roof LED light bar, and detailed cockpit interior.

import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
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
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Pixel Crusher Monster Truck",
  description:
    "Retro pixel-art stadium monster truck with giant 66-inch mud-terrain chevron tyres, neon-green tubular chassis, supercharged V8 blower, 4-link suspension, and hot-rod flame livery.",
  style: "pixel art",
  commit: "88fc1f0",
};

// Master texel size in meters (2.5 cm square texels across all surfaces)
const TEXEL = 0.025;
const FINE_TEXEL = 0.0125;

// Quantized 64-level VGA-style palette ramps
const snapRamp = (hexes: readonly string[]) => hexes.map((c) => snapColor(c, 64));

const RED_RAMP = snapRamp(["#340810", "#680e1c", "#a41624", "#dc2430", "#ff5040", "#ff8c68"]);
const FLAME_RAMP = snapRamp(["#7c180c", "#c83808", "#f46800", "#ffa800", "#ffe020", "#ffff90"]);
const GREEN_RAMP = snapRamp(["#0a2810", "#14541c", "#248c28", "#3cd038", "#78fc54", "#bcfca0"]);
const RUBBER_RAMP = snapRamp(["#0c0d12", "#161820", "#222632", "#303646", "#424a5e"]);
const MUD_RAMP = snapRamp(["#22160e", "#382416", "#523620", "#6c482c"]);
const CHROME_RAMP = snapRamp(["#242c3c", "#48546c", "#7484a0", "#acbcdc", "#dce8fc", "#ffffff"]);
const STEEL_RAMP = snapRamp(["#141822", "#242a38", "#384052", "#525c72", "#707c94"]);
const GOLD_RAMP = snapRamp(["#3c2404", "#784c08", "#b87c10", "#f0b41c", "#ffe058", "#ffffb0"]);
const BLUE_RAMP = snapRamp(["#081838", "#103068", "#1c54a8", "#3084e8", "#68b8ff", "#b8e4ff"]);
const GLASS_RAMP = snapRamp(["#081020", "#10203c", "#1c3864", "#2c5894", "#5088c8", "#8cc8ff"]);
const SEAT_RAMP = snapRamp(["#16121a", "#282030", "#3e324a", "#584868"]);

// Flat snapped colors for small crisp parts & emissives
const C_BLACK = snapColor("#0c0d12", 64);
const C_DARK_STEEL = snapColor("#1e2430", 64);
const C_MID_STEEL = snapColor("#384256", 64);
const C_LIGHT_STEEL = snapColor("#6c7a94", 64);
const C_CHROME = snapColor("#dce8fc", 64);
const C_NEON_GREEN = snapColor("#48ec40", 64);
const C_DARK_GREEN = snapColor("#186420", 64);
const C_RED = snapColor("#dc2430", 64);
const C_DARK_RED = snapColor("#741018", 64);
const C_ORANGE = snapColor("#ff7800", 64);
const C_YELLOW = snapColor("#ffe020", 64);
const C_GOLD = snapColor("#e8a818", 64);
const C_BLUE_SHOCK = snapColor("#2878e0", 64);
const C_HEADLIGHT = snapColor("#fff8c0", 64);
const C_TAILLIGHT = snapColor("#ff2028", 64);
const C_AMBER = snapColor("#ff9010", 64);
const C_CYAN_GLOW = snapColor("#40e8ff", 64);

// -------------------------------------------------------------------------------------------------------------
// Quantized Pixel Paints (`cellPaint`)

const PAINT_RUBBER = cellPaint(
  TEXEL,
  (c) => {
    const r = Math.hypot(c.at.y - 0.84, Math.abs(c.at.z) - 1.5);
    const mud = noise(c.at, 0.28, 19);
    if (c.at.y < 0.36 && mud > 0.56) {
      return c.pick(MUD_RAMP, 0.35 + 0.45 * mud);
    }
    const shade = 0.35 + 0.3 * c.n.y + 0.15 * Math.abs(c.n.x) - 0.08 * (r > 0.7 ? 1 : 0);
    return c.pick(RUBBER_RAMP, shade);
  },
  { dither: true },
);

const PAINT_TREAD_LUG = cellPaint(
  TEXEL,
  (c) => {
    const mud = noise(c.at, 0.22, 41);
    if (c.at.y < 0.28 && mud > 0.48) {
      return c.pick(MUD_RAMP, 0.4 + 0.5 * mud);
    }
    const edge = c.random(7) * 0.12;
    const shade = 0.45 + 0.35 * Math.max(0, c.n.y) + 0.15 * Math.abs(c.n.z) + edge;
    return c.pick(RUBBER_RAMP, shade);
  },
  { dither: true },
);

const PAINT_CHASSIS_GREEN = cellPaint(
  FINE_TEXEL,
  (c) => {
    const spec = Math.max(0, c.n.y * 0.65 + Math.abs(c.n.x) * 0.35);
    return c.pick(GREEN_RAMP, 0.28 + 0.62 * spec);
  },
  { dither: true },
);

const PAINT_ROLLCAGE = cellPaint(
  FINE_TEXEL,
  (c) => {
    const spec = Math.max(0, c.n.y * 0.6 + c.n.z * 0.25 + Math.abs(c.n.x) * 0.25);
    return c.pick(FLAME_RAMP, 0.38 + 0.55 * spec);
  },
  { dither: true },
);

const PAINT_CHROME = cellPaint(
  FINE_TEXEL,
  (c) => {
    // Classic pixel-art horizon reflection banding on chrome
    const band = Math.sin(c.at.y * 18 + c.at.z * 7) * 0.25;
    const up = c.n.y * 0.45 + Math.abs(c.n.x) * 0.25 + band;
    return c.pick(CHROME_RAMP, 0.52 + up);
  },
  { dither: true },
);

const PAINT_STEEL = cellPaint(
  FINE_TEXEL,
  (c) => {
    const wear = (c.random(13) - 0.5) * 0.14;
    const shade = 0.38 + 0.38 * c.n.y + 0.18 * Math.abs(c.n.x) + wear;
    return c.pick(STEEL_RAMP, shade);
  },
  { dither: true },
);

const PAINT_GOLD_TRIM = cellPaint(
  FINE_TEXEL,
  (c) => {
    const shine = 0.45 + 0.42 * c.n.y + 0.2 * Math.abs(c.n.z);
    return c.pick(GOLD_RAMP, shine);
  },
  { dither: true },
);

const PAINT_SHOCK_BLUE = cellPaint(
  FINE_TEXEL,
  (c) => {
    const shine = 0.4 + 0.45 * Math.max(0, c.n.y) + 0.2 * Math.abs(c.n.x);
    return c.pick(BLUE_RAMP, shine);
  },
  { dither: true },
);

// Custom hot-rod flame body paint for non-skinBox body panels (fenders, cowl, roof, visors, spoiler)
const PAINT_BODY_FLAME = cellPaint(
  TEXEL,
  (c) => {
    // Flame tongues sweeping back from the front nose (+Z toward -Z)
    const zRel = 2.25 - c.at.z;
    const wave = Math.sin(c.at.y * 16 + c.at.x * 11) * 0.18 + Math.cos(c.at.y * 9 - c.at.x * 15) * 0.1;
    const flameReach = zRel - wave;
    const shade = 0.36 + 0.42 * Math.max(0, c.n.y) + 0.18 * Math.abs(c.n.x);
    if (flameReach < 0.78 && c.at.y > 1.38) {
      const t = Math.max(0, Math.min(1, 1 - flameReach / 0.78));
      return c.pick(FLAME_RAMP, 0.25 + 0.72 * t);
    }
    // Pin-stripe border
    if (Math.abs(flameReach - 0.8) < 0.035 && c.at.y > 1.38) {
      return C_YELLOW;
    }
    return c.pick(RED_RAMP, shade);
  },
  { dither: true },
);

const PAINT_CAB_GLASS = cellPaint(
  TEXEL,
  (c) => {
    // Diagonal pixel glint lines across dark blue tinted glass
    const diag = (c.u + c.v) % 11;
    if (diag === 0 || diag === 1) return GLASS_RAMP[5];
    if (diag === 4) return GLASS_RAMP[4];
    const shade = 0.28 + 0.38 * Math.max(0, c.n.y) + 0.2 * Math.max(0, c.n.z);
    return c.pick(GLASS_RAMP, shade);
  },
  { dither: true },
);

const PAINT_SEAT = cellPaint(
  FINE_TEXEL,
  (c) => {
    const rib = c.v % 2 === 0 ? 0.08 : -0.05;
    return c.pick(SEAT_RAMP, 0.45 + 0.35 * c.n.y + rib);
  },
  { dither: true },
);

// -------------------------------------------------------------------------------------------------------------
// Pixel Textures (`pixelTexture` and `pixelArt`)

function makeTextures() {
  // 1. Skin sheet for main truck body blocks: hood, cab lower, truck bed
  // Using TEXEL = 0.025 (40 px per meter)
  const layout = skinLayout(
    {
      hood: [48, 16, 42], // 1.20m W x 0.40m H x 1.05m D
      cab: [50, 20, 44], // 1.25m W x 0.50m H x 1.10m D
      bed: [50, 16, 48], // 1.25m W x 0.40m H x 1.20m D
      grille: [44, 14, 6], // 1.10m W x 0.35m H x 0.15m D
      tailgate: [46, 14, 4], // 1.15m W x 0.35m H x 0.10m D
    },
    256,
  );

  // Helper to draw pixel flames sweeping left-to-right or right-to-left on side faces
  const drawSideFlames = (
    g: Parameters<Parameters<typeof pixelTexture>[2]>[0],
    rect: readonly [number, number, number, number],
    frontOnRight: boolean,
    withNumber: boolean,
  ) => {
    const [rx, ry, rw, rh] = rect;
    g.fill((x, y) => {
      // Base crimson body with top highlight bevel and bottom dark skirt
      if (y === 0) return RED_RAMP[5];
      if (y === 1) return RED_RAMP[4];
      if (y >= rh - 2) return RED_RAMP[0];
      if (y === rh - 3) return C_CHROME; // chrome rocker trim strip

      const fx = frontOnRight ? rw - 1 - x : x;
      // Multi-tongue pixel flame profile
      const rowWave = Math.sin(y * 0.75) * 5 + Math.cos(y * 1.35) * 3;
      const len = rw * 0.62 + rowWave;
      if (fx < len) {
        const heat = 1 - fx / Math.max(1, len);
        return pick(FLAME_RAMP, 0.25 + heat * 0.75, bayer(x, y));
      }
      if (Math.abs(fx - len) < 1.3) return FLAME_RAMP[4];
      const v = 0.68 - (y / rh) * 0.42;
      return pick(RED_RAMP, v, bayer(x, y));
    }, rect);

    // Door seam & pixel racing number "88" on cab doors
    if (withNumber) {
      const cx = Math.floor(rw * 0.48);
      const cy = Math.floor(rh * 0.2);
      // White racing number plate with black border & #88
      const plate = [
        "kkkkkkkkkkkkkk",
        "kwwwwwwwwwwwwk",
        "kwwoooowoooowk",
        "kwokkkkwkkkkwk",
        "kwok..kwk..kwk",
        "kwokkkkwkkkkwk",
        "kwok..kwk..kwk",
        "kwokkkkwkkkkwk",
        "kwwwwwwwwwwwwk",
        "kkkkkkkkkkkkkk",
      ];
      g.stamp(rx + cx - 7, ry + cy, plate, {
        k: C_BLACK,
        w: C_CHROME,
        o: C_RED,
      });
      // Chrome door handle
      g.stamp(rx + cx - 10, ry + cy + 2, ["kkkk", "kcck"], {
        k: C_BLACK,
        c: C_CHROME,
      });
    }
  };

  const BODY_SHEET = pixelTexture(layout.size[0], layout.size[1], (g) => {
    // Default fill all faces with shaded red metal
    for (const faces of Object.values(layout.faces)) {
      for (const [faceName, rect] of Object.entries(faces)) {
        g.fill((x, y, w, h) => {
          const border = x === 0 || y === 0 || x === w - 1 || y === h - 1;
          if (border) return RED_RAMP[1];
          const shade = faceName === "py" ? 0.78 : faceName === "ny" ? 0.18 : 0.62 - (y / h) * 0.35;
          return pick(RED_RAMP, shade, bayer(x, y));
        }, rect);
      }
    }

    // Hood top (py): back is top row (y=0), front is bottom row (y=d-1)
    {
      const rect = layout.faces.hood.py;
      g.fill((x, y, w, h) => {
        const cx = Math.abs(x - (w - 1) / 2);
        // Center raised power-bulge stripes & hot-rod flames from front (y near h-1)
        const fy = h - 1 - y;
        const tongue = Math.cos(cx * 0.55) * 9 + Math.sin(cx * 1.1) * 5;
        if (cx < 8) {
          // Black & chrome supercharger cutout surround
          if (y > 8 && y < h - 10) return cx < 6 ? C_BLACK : C_CHROME;
        }
        if (fy < 22 + tongue) {
          const heat = 1 - fy / Math.max(1, 22 + tongue);
          return pick(FLAME_RAMP, 0.3 + 0.7 * heat, bayer(x, y));
        }
        return pick(RED_RAMP, 0.75 - (cx / w) * 0.25, bayer(x, y));
      }, rect);
    }

    // Hood sides (px = left side, front is on left x=0? Wait: on BoxGeometry px (+X left face), u=0 is +Z (front) and u=1 is -Z (back).
    // On nx (-X right face), u=0 is -Z (back) and u=1 is +Z (front).)
    drawSideFlames(g, layout.faces.hood.px, false, false);
    drawSideFlames(g, layout.faces.hood.nx, true, false);

    // Cab sides with racing number plate
    drawSideFlames(g, layout.faces.cab.px, false, true);
    drawSideFlames(g, layout.faces.cab.nx, true, true);

    // Bed sides with rear checker & flame licks
    drawSideFlames(g, layout.faces.bed.px, false, false);
    drawSideFlames(g, layout.faces.bed.nx, true, false);
    // Add checkered racing flag stripe near rear of bed sides
    for (const [faceKey, frontRight] of [
      ["px", false],
      ["nx", true],
    ] as const) {
      const [rx, ry, rw, rh] = layout.faces.bed[faceKey];
      for (let y = 2; y < rh - 3; y++) {
        for (let k = 0; k < 6; k++) {
          const x = frontRight ? 3 + k : rw - 9 + k;
          const chk = ((x >> 1) + (y >> 1)) & 1;
          g.set(rx + x, ry + y, chk ? C_CHROME : C_BLACK);
        }
      }
    }

    // Grille front face (pz): chrome teeth, angry pixel headlights, "CRUSHER" badge
    {
      const rect = layout.faces.grille.pz;
      g.fill((x, y, w, h) => {
        // Outer chrome bezel
        if (x < 2 || x >= w - 2 || y < 2 || y >= h - 2) return C_CHROME;
        // Headlight housings on left & right
        if ((x >= 3 && x <= 10) || (x >= w - 11 && x <= w - 4)) {
          if (y >= 3 && y <= 9) {
            // Angry slanted brow on top rows
            const distIn = x < w / 2 ? x - 3 : w - 4 - x;
            if (y - 3 < distIn >> 1) return RED_RAMP[3];
            return (x + y) % 2 === 0 ? C_HEADLIGHT : "#ffffff";
          }
          if (y >= 10 && y <= 11) return C_AMBER; // turn signal bar
        }
        // Center grille bars
        if (x >= 12 && x <= w - 13) {
          if (y === Math.floor(h / 2)) return C_RED; // red center crossbar
          if (x % 3 === 0) return C_CHROME;
          return y % 2 === 0 ? C_BLACK : C_DARK_STEEL;
        }
        return C_DARK_STEEL;
      }, rect);
    }

    // Tailgate back face (nz): "88" + ribbed steel + taillights
    {
      const rect = layout.faces.tailgate.nz;
      g.fill((x, y, w, h) => {
        if (x < 2 || x >= w - 2 || y < 2 || y >= h - 2) return RED_RAMP[1];
        // Taillights on outer edges
        if (x >= 2 && x <= 5 && y >= 2 && y <= h - 3) {
          return y < 6 ? C_TAILLIGHT : y < 9 ? C_AMBER : C_CHROME;
        }
        if (x >= w - 6 && x <= w - 3 && y >= 2 && y <= h - 3) {
          return y < 6 ? C_TAILLIGHT : y < 9 ? C_AMBER : C_CHROME;
        }
        // Horizontal embossed ribs with yellow hazard border at bottom
        if (y >= h - 4) {
          return ((x + y) >> 1) & 1 ? C_YELLOW : C_BLACK;
        }
        if (y % 3 === 0) return RED_RAMP[4];
        return pick(RED_RAMP, 0.48, bayer(x, y));
      }, rect);
    }
  });

  // 2. Diamond-plate metal tile for truck bed floor, step bars, and skid plates
  const DIAMOND_PLATE = pixelTexture(16, 16, (g) => {
    g.fill((x, y) => {
      const base = pick(STEEL_RAMP, 0.55, bayer(x, y));
      const mx = x % 8;
      const my = y % 8;
      if ((mx === 2 && my === 2) || (mx === 3 && my === 3)) return C_CHROME;
      if ((mx === 6 && my === 5) || (mx === 5 && my === 6)) return C_CHROME;
      if ((mx === 2 && my === 3) || (mx === 6 && my === 6)) return STEEL_RAMP[1];
      return base;
    });
  });

  // 3. Radiator / intercooler mesh tile
  const RADIATOR_TILE = pixelTexture(16, 16, (g) => {
    g.fill((x, y) => {
      if (x === 0 || x === 15 || y === 0 || y === 15) return STEEL_RAMP[3];
      if (y % 2 === 0) return x % 4 === 0 ? STEEL_RAMP[2] : C_BLACK;
      return STEEL_RAMP[1];
    });
  });

  // 4. Monster wheel hub & beadlock disc pixel art (32x32)
  const WHEEL_DISC = pixelTexture(32, 32, (g) => {
    const cx = 15.5;
    const cy = 15.5;
    g.fill((x, y) => {
      const dx = x - cx;
      const dy = y - cy;
      const r = Math.hypot(dx, dy);
      if (r > 15.5) return "";
      // Outer neon-green beadlock ring with 16 chrome bolts
      if (r > 12.2) {
        const ang = ((Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI)) * 16;
        const frac = Math.abs(ang - Math.round(ang));
        if (r > 13.0 && r < 14.8 && frac < 0.16) return C_CHROME;
        return pick(GREEN_RAMP, r > 14 ? 0.45 : 0.78, bayer(x, y));
      }
      // Deep dish dark steel rim well with 5 heavy spokes
      if (r > 5.2) {
        const ang = ((Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI)) * 5;
        const spoke = Math.abs(ang - Math.round(ang));
        if (spoke < 0.18) {
          return pick(CHROME_RAMP, 0.65 - (r / 15) * 0.25, bayer(x, y));
        }
        if (spoke < 0.24) return STEEL_RAMP[2];
        return C_BLACK;
      }
      // Planetary gear hub + 8 lug nuts + red center cap
      if (r > 3.2) {
        const ang = ((Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI)) * 8;
        if (Math.abs(ang - Math.round(ang)) < 0.2) return C_GOLD;
        return STEEL_RAMP[1];
      }
      return r < 1.8 ? C_RED : C_CHROME;
    });
  });

  // 5. Roof LED Lightbar glowing pixel strip
  const LED_BAR_TEX = pixelTexture(36, 6, (g) => {
    g.fill((x, y, w, h) => {
      if (x === 0 || x === w - 1 || y === 0 || y === h - 1) return C_DARK_STEEL;
      if (x % 3 === 0) return C_MID_STEEL;
      return y === 2 || y === 3 ? "#ffffff" : C_HEADLIGHT;
    });
  });

  // 6. Monster skull hood/door emblem decal (16x16 pixelArt)
  const SKULL_BADGE = pixelArt(
    [
      "....kkkkkkkk....",
      "..kkwwwwwwwwkk..",
      ".kwwwwwwwwwwwwk.",
      ".kwwrrrrrrrrwwk.",
      "kwwrwwwwwwwwrwwk",
      "kwwkkkkkkkkkkwwk",
      "kwkggkwwwwkggkwk",
      "kwkggkwwwwkggkwk",
      "kwwkkkkkkkkkkwwk",
      ".kwwwwk..kwwwwk.",
      ".kwwwkkkkkkwwwk.",
      "..kwwk.kk.kwwk..",
      "..kwwk.kk.kwwk..",
      "...kkkkkkkkkk...",
      "....k.k..k.k....",
      "................",
    ],
    {
      k: C_BLACK,
      w: C_CHROME,
      r: C_RED,
      g: C_NEON_GREEN,
    },
  );

  // 7. Whip antenna racing flag (pixelArt)
  const WHIP_FLAG = pixelArt(
    [
      "kkkkkkkkkkkk",
      "krrryyyooook",
      "krkkyykoook.",
      "krrryyyook..",
      "krkkyykok...",
      "krrryyok....",
      "kkkkkkk.....",
    ],
    {
      k: C_BLACK,
      r: C_RED,
      y: C_YELLOW,
      o: C_ORANGE,
    },
  );

  // 8. Dashboard illuminated pixel gauges
  const DASH_GAUGES = pixelTexture(24, 8, (g) => {
    g.fill((x, y, w, h) => {
      if (x === 0 || x === w - 1 || y === 0 || y === h - 1) return C_BLACK;
      // Three circular-ish gauge pods + toggle switches
      if ((x >= 2 && x <= 6) || (x >= 8 && x <= 12) || (x >= 14 && x <= 18)) {
        if (y >= 2 && y <= 5) {
          if (x % 6 === 4 && y <= 4) return C_RED; // needle
          return C_CYAN_GLOW;
        }
      }
      if (x >= 20 && x <= 22 && y % 2 === 1) return y === 3 ? C_NEON_GREEN : C_RED;
      return C_DARK_STEEL;
    });
  });

  return {
    layout,
    BODY_SHEET,
    DIAMOND_PLATE,
    RADIATOR_TILE,
    WHEEL_DISC,
    LED_BAR_TEX,
    SKULL_BADGE,
    WHIP_FLAG,
    DASH_GAUGES,
  };
}

// -------------------------------------------------------------------------------------------------------------
// Wheel & Giant Chevron Tyre Assembly Builder

function buildMonsterWheel(
  b: ReturnType<typeof createBuilder>,
  wheelJoint: ReturnType<typeof b.joint>,
  side: number, // +1 for Left (+X), -1 for Right (-X)
  tag: string,
  wheelDiscTex: THREE.Texture,
) {
  const wc = wheelJoint.at;
  const group = `wheel_${tag}`;

  // Tyre dimensions:
  // Outer tread contact radius = 0.84m (1.68m / 66-inch diameter, sits exactly at y = 0)
  // Core carcass radius = 0.77m, width = 0.92m
  const halfW = 0.46;
  const carcassR = 0.77;
  const rimR = 0.41;

  const pInner = [wc.x - side * halfW, wc.y, wc.z];
  const pOuter = [wc.x + side * halfW, wc.y, wc.z];

  // 1. Main tyre carcass (16-sided faceted low-poly cylinder with flat bottom face)
  b.rod(pInner, pOuter, carcassR, {
    sides: 16,
    smooth: false,
    color: PAINT_RUBBER,
    bone: wheelJoint,
    group,
    name: `tyreCarcass_${tag}`,
  });

  // 2. Bulging sidewall shoulders (stepped pixel-art bevel profile on both inner & outer walls)
  for (const wallSide of [-1, 1]) {
    const wallA = [wc.x + wallSide * side * (halfW - 0.02), wc.y, wc.z];
    const wallB = [wc.x + wallSide * side * (halfW + 0.045), wc.y, wc.z];
    b.rod(wallA, wallB, [carcassR - 0.04, carcassR - 0.12], {
      sides: 16,
      smooth: false,
      color: PAINT_RUBBER,
      bone: wheelJoint,
      group,
      name: `sidewallBulge_${tag}_${wallSide > 0 ? "out" : "in"}`,
    });
  }

  // 3. Recessed rim well & neon-green beadlock flange
  const rimOuterX = wc.x + side * (halfW + 0.015);
  const rimInnerX = wc.x - side * (halfW - 0.06);
  b.rod([rimInnerX, wc.y, wc.z], [rimOuterX, wc.y, wc.z], rimR, {
    sides: 12,
    smooth: false,
    color: PAINT_STEEL,
    bone: wheelJoint,
    group,
    name: `rimBarrel_${tag}`,
  });

  // Outer beadlock ring (neon green)
  b.rod(
    [wc.x + side * (halfW + 0.005), wc.y, wc.z],
    [wc.x + side * (halfW + 0.048), wc.y, wc.z],
    [rimR + 0.045, rimR + 0.025],
    {
      sides: 12,
      smooth: false,
      color: PAINT_CHASSIS_GREEN,
      bone: wheelJoint,
      group,
      name: `beadlockRing_${tag}`,
    },
  );

  // Textured pixel-art wheel dish & spoke face on outer face
  b.part(new THREE.CircleGeometry(rimR + 0.02, 12), "#ffffff", {
    texture: wheelDiscTex,
    bone: wheelJoint,
    at: [wc.x + side * (halfW + 0.05), wc.y, wc.z],
    dir: [side, 0, 0],
    axis: "z",
    group,
    name: `wheelDisc_${tag}`,
  });

  // Heavy planetary hub protruding from wheel center
  b.rod(
    [wc.x + side * (halfW - 0.08), wc.y, wc.z],
    [wc.x + side * (halfW + 0.12), wc.y, wc.z],
    [0.18, 0.13],
    {
      sides: 8,
      smooth: false,
      color: PAINT_STEEL,
      bone: wheelJoint,
      group,
      name: `planetaryHub_${tag}`,
    },
  );

  b.rod(
    [wc.x + side * (halfW + 0.12), wc.y, wc.z],
    [wc.x + side * (halfW + 0.155), wc.y, wc.z],
    0.085,
    {
      sides: 8,
      smooth: false,
      color: C_RED,
      bone: wheelJoint,
      group,
      name: `hubCap_${tag}`,
    },
  );

  // Inner brake rotor on backside of wheel
  b.rod(
    [wc.x - side * (halfW - 0.04), wc.y, wc.z],
    [wc.x - side * (halfW + 0.02), wc.y, wc.z],
    0.32,
    {
      sides: 12,
      smooth: false,
      color: PAINT_CHROME,
      bone: wheelJoint,
      group,
      name: `brakeRotor_${tag}`,
    },
  );

  // 4. Aggressive Terra-Cross Chevron Tread Lugs (16 pairs of angled V-bars around circumference)
  // Arranged so the bottom-most lugs touch y = 0.00m cleanly within the 2% ground tolerance
  const lugCount = 16;
  for (let i = 0; i < lugCount; i++) {
    // Phase offset by half-step so pairs straddle the bottom contact patch evenly
    const theta = ((i + 0.5) / lugCount) * Math.PI * 2;
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    // Radial center of lug bar: carcassR (0.77) to outer tip (0.842) -> center at r = 0.795
    const rLug = 0.795;
    const ly = wc.y - cosT * rLug;
    const lz = wc.z + sinT * rLug;

    // Tangent direction along tyre rotation
    const tanY = sinT;
    const tanZ = cosT;
    // Outward normal direction
    const normY = -cosT;
    const normZ = sinT;

    // Alternating left/right chevron halves that meet at the center crown with a V-angle
    const chevronSweep = 0.12; // forward/back offset at outer shoulder vs center crown
    for (const half of [-1, 1]) {
      const xIn = wc.x + half * 0.025;
      const xOut = wc.x + half * (halfW + 0.02);
      const zIn = lz + tanZ * (chevronSweep * 0.5);
      const yIn = ly + tanY * (chevronSweep * 0.5);
      const zOut = lz - tanZ * (chevronSweep * 0.5);
      const yOut = ly - tanY * (chevronSweep * 0.5);

      b.frustumBox([xIn, yIn, zIn], [xOut, yOut, zOut], [0.11, 0.095], [0.095, 0.085], {
        up: [normX(0), normY, normZ],
        color: PAINT_TREAD_LUG,
        bone: wheelJoint,
        group,
        name: `treadLug_${tag}_${i}_${half > 0 ? "L" : "R"}`,
      });
    }

    // Sidewall bite cleats every 2nd lug
    if (i % 2 === 0) {
      const rCleat = 0.69;
      const cy = wc.y - cosT * rCleat;
      const cz = wc.z + sinT * rCleat;
      const cleatOutX = wc.x + side * (halfW + 0.048);
      const cleatInX = wc.x + side * (halfW - 0.01);
      b.frustumBox([cleatInX, cy, cz], [cleatOutX, cy, cz], [0.08, 0.12], [0.06, 0.09], {
        up: [0, normY, normZ],
        color: PAINT_TREAD_LUG,
        bone: wheelJoint,
        group,
        name: `sideCleat_${tag}_${i}`,
      });
    }
  }
}

function normX(v: number) {
  return v;
}

// -------------------------------------------------------------------------------------------------------------
// Main Build

export default function build() {
  const b = createBuilder({ name: "monsterTruck", detail: 1, paintSize: 2048 });
  const rand = rng(8801);
  const {
    layout,
    BODY_SHEET,
    DIAMOND_PLATE,
    RADIATOR_TILE,
    WHEEL_DISC,
    LED_BAR_TEX,
    SKULL_BADGE,
    WHIP_FLAG,
    DASH_GAUGES,
  } = makeTextures();

  // Key vehicle coordinates (in meters):
  // Wheel radius = 0.84m -> Wheel centers at y = 0.84m
  // Wheelbase = 3.00m (Front z = +1.50m, Rear z = -1.50m)
  // Track width between wheel centers = 2.24m (Left x = +1.12m, Right x = -1.12m)
  // Overall width ~ 3.22m, Overall length ~ 4.85m, Overall height ~ 2.95m
  const WHEEL_Y = 0.84;
  const FRONT_Z = 1.5;
  const REAR_Z = -1.5;
  const TRACK_X = 1.12;

  // -----------------------------------------------------------------------------------------------------------
  // 1. SKELETON & MOVING JOINTS (`role: "hinge"` for all mechanical moving parts)

  const chassis = b.joint("chassis", {
    at: [0, 1.18, 0],
    dir: [0, 0, 1],
    role: "spine",
  });

  // Suspension & Axle Joints
  const suspFront = b.joint("suspFront", {
    parent: chassis,
    at: [0, 1.05, 0.45],
    dir: [0, -0.18, 1],
    role: "hinge",
  });
  const axleFront = b.joint("axleFront", {
    parent: suspFront,
    at: [0, WHEEL_Y, FRONT_Z],
    dir: [0, 0, 1],
    role: "hinge",
  });

  const suspRear = b.joint("suspRear", {
    parent: chassis,
    at: [0, 1.05, -0.45],
    dir: [0, -0.18, -1],
    role: "hinge",
  });
  const axleRear = b.joint("axleRear", {
    parent: suspRear,
    at: [0, WHEEL_Y, REAR_Z],
    dir: [0, 0, -1],
    role: "hinge",
  });

  // Front & Rear Steering Knuckles + Rotating Wheel Hubs
  const steerFL = b.joint("steerFL", {
    parent: axleFront,
    at: [TRACK_X - 0.25, WHEEL_Y, FRONT_Z],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    role: "hinge",
  });
  const wheelFL = b.joint("wheelFL", {
    parent: steerFL,
    at: [TRACK_X, WHEEL_Y, FRONT_Z],
    dir: [0, 0, 1],
    role: "hinge",
  });

  const steerFR = b.joint("steerFR", {
    parent: axleFront,
    at: [-TRACK_X + 0.25, WHEEL_Y, FRONT_Z],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    role: "hinge",
  });
  const wheelFR = b.joint("wheelFR", {
    parent: steerFR,
    at: [-TRACK_X, WHEEL_Y, FRONT_Z],
    dir: [0, 0, 1],
    role: "hinge",
  });

  // Rear 4-wheel steering knuckles + rotating wheel hubs
  const steerRL = b.joint("steerRL", {
    parent: axleRear,
    at: [TRACK_X - 0.25, WHEEL_Y, REAR_Z],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    role: "hinge",
  });
  const wheelRL = b.joint("wheelRL", {
    parent: steerRL,
    at: [TRACK_X, WHEEL_Y, REAR_Z],
    dir: [0, 0, 1],
    role: "hinge",
  });

  const steerRR = b.joint("steerRR", {
    parent: axleRear,
    at: [-TRACK_X + 0.25, WHEEL_Y, REAR_Z],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    role: "hinge",
  });
  const wheelRR = b.joint("wheelRR", {
    parent: steerRR,
    at: [-TRACK_X, WHEEL_Y, REAR_Z],
    dir: [0, 0, 1],
    role: "hinge",
  });

  // Body & Cab Mount Joint + Opening Doors, Tailgate, Blower Hat & Whip Antenna
  const cabBody = b.joint("cabBody", {
    parent: chassis,
    at: [0, 1.55, 0],
    dir: [0, 0, 1],
    role: "spine",
  });

  const doorL = b.joint("doorL", {
    parent: cabBody,
    at: [0.63, 1.78, 0.58],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    role: "hinge",
  });
  const doorR = b.joint("doorR", {
    parent: cabBody,
    at: [-0.63, 1.78, 0.58],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    role: "hinge",
  });

  const tailgateJoint = b.joint("tailgate", {
    parent: cabBody,
    at: [0, 1.62, -2.02],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    role: "hinge",
  });

  const blowerJoint = b.joint("blower", {
    parent: cabBody,
    at: [0, 2.02, 1.32],
    dir: [0, 0, 1],
    role: "hinge",
  });

  const steeringWheelJoint = b.joint("steeringWheel", {
    parent: cabBody,
    at: [0.28, 1.98, 0.42],
    dir: [0, 0.42, -0.9],
    role: "hinge",
  });

  const antennaJoint = b.joint("whipAntenna", {
    parent: cabBody,
    at: [0.58, 1.98, -1.92],
    dir: [-0.08, 1, -0.18],
    role: "tail",
  });

  // -----------------------------------------------------------------------------------------------------------
  // 2. BUILD THE 4 GIANT MONSTER WHEELS

  buildMonsterWheel(b, wheelFL, 1, "FL", WHEEL_DISC);
  buildMonsterWheel(b, wheelFR, -1, "FR", WHEEL_DISC);
  buildMonsterWheel(b, wheelRL, 1, "RL", WHEEL_DISC);
  buildMonsterWheel(b, wheelRR, -1, "RR", WHEEL_DISC);

  // -----------------------------------------------------------------------------------------------------------
  // 3. HEAVY SOLID AXLES, DIFFERENTIAL PUMPKINS, STEERING KNUCKLES & TIE RODS

  for (const [axleJoint, zPos, tag, steerL, steerR] of [
    [axleFront, FRONT_Z, "F", steerFL, steerFR],
    [axleRear, REAR_Z, "R", steerRL, steerRR],
  ] as const) {
    const grp = `axle_${tag}`;
    // Main axle housing tube
    b.rod([-0.88, WHEEL_Y, zPos], [0.88, WHEEL_Y, zPos], 0.095, {
      sides: 8,
      smooth: false,
      color: PAINT_STEEL,
      bone: axleJoint,
      group: grp,
      name: `axleTube_${tag}`,
    });

    // Upper & lower axle truss gussets
    b.frustumBox([-0.58, WHEEL_Y + 0.08, zPos], [0.58, WHEEL_Y + 0.08, zPos], [0.1, 0.09], [0.1, 0.09], {
      color: PAINT_CHASSIS_GREEN,
      bone: axleJoint,
      group: grp,
      name: `axleTruss_${tag}`,
    });

    // Center differential pumpkin housing + ribbed cover
    b.frustumBox(
      [0, WHEEL_Y, zPos - 0.16],
      [0, WHEEL_Y, zPos + 0.16],
      [0.34, 0.34],
      [0.28, 0.28],
      {
        color: PAINT_STEEL,
        bone: axleJoint,
        group: grp,
        name: `diffPumpkin_${tag}`,
      },
    );
    const coverZ = zPos + (tag === "F" ? 0.175 : -0.175);
    b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 8), C_RED, {
      bone: axleJoint,
      at: [0, WHEEL_Y, coverZ],
      dir: [0, 0, 1],
      flat: true,
      group: grp,
      name: `diffCover_${tag}`,
    });

    // Hydraulic steering ram cylinder & chrome tie-rod across the axle
    const ramZ = zPos + (tag === "F" ? 0.18 : -0.18);
    b.rod([-0.38, WHEEL_Y - 0.06, ramZ], [0.38, WHEEL_Y - 0.06, ramZ], 0.042, {
      sides: 6,
      smooth: false,
      color: PAINT_GOLD_TRIM,
      bone: axleJoint,
      group: grp,
      name: `steerRam_${tag}`,
    });
    b.rod([-0.82, WHEEL_Y - 0.06, ramZ], [0.82, WHEEL_Y - 0.06, ramZ], 0.022, {
      sides: 6,
      smooth: false,
      color: PAINT_CHROME,
      bone: axleJoint,
      group: grp,
      name: `tieRod_${tag}`,
    });

    // Steering C-knuckles on each side
    for (const [s, stJoint, sideTag] of [
      [1, steerL, "L"],
      [-1, steerR, "R"],
    ] as const) {
      b.frustumBox(
        [s * 0.78, WHEEL_Y, zPos],
        [s * 0.94, WHEEL_Y, zPos],
        [0.18, 0.26],
        [0.16, 0.22],
        {
          color: C_RED,
          bone: stJoint,
          group: grp,
          name: `knuckle_${tag}${sideTag}`,
        },
      );
    }
  }

  // -----------------------------------------------------------------------------------------------------------
  // 4. NEON-GREEN TUBULAR SPACEFRAME CHASSIS, SKID PLATES, DRIVESHAFTS & 4-LINK SUSPENSION

  const chassisGrp = "chassisFrame";

  // Center transfer-case / transmission belly cradle & diamond-plate skid pan
  b.part(tileBox([0.84, 0.12, 1.36], DIAMOND_PLATE, TEXEL, { rand }), "#ffffff", {
    texture: DIAMOND_PLATE,
    bone: chassis,
    at: [0, 1.02, 0],
    group: chassisGrp,
    name: "bellySkidPlate",
  });

  // Heavy transfer case gearbox in the middle of the chassis
  b.frustumBox([0, 1.12, -0.28], [0, 1.12, 0.28], [0.46, 0.28], [0.42, 0.26], {
    color: PAINT_STEEL,
    bone: chassis,
    group: chassisGrp,
    name: "transferCase",
  });

  // Front and rear driveshafts with red U-joint yokes connecting transfer case to axle pumpkins
  for (const [zEnd, suspJ, tag] of [
    [FRONT_Z - 0.14, suspFront, "F"],
    [REAR_Z + 0.14, suspRear, "R"],
  ] as const) {
    const zStart = tag === "F" ? 0.24 : -0.24;
    b.rod([0, 1.06, zStart], [0, WHEEL_Y + 0.04, zEnd], 0.042, {
      sides: 6,
      smooth: false,
      color: PAINT_CHROME,
      bone: suspJ,
      group: chassisGrp,
      name: `driveshaft_${tag}`,
    });
    b.rod([0, 1.06, zStart], [0, 1.03, zStart + (tag === "F" ? 0.14 : -0.14)], 0.058, {
      sides: 6,
      smooth: false,
      color: C_RED,
      bone: suspJ,
      group: chassisGrp,
      name: `uJoint_${tag}`,
    });
  }

  // Left & Right tubular spaceframe rails + triangulated side trusses
  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";

    // Lower main frame rail
    b.sweep(
      [
        [s * 0.4, 1.04, -0.78],
        [s * 0.4, 1.04, 0.78],
      ],
      0.042,
      {
        sides: 6,
        smooth: false,
        color: PAINT_CHASSIS_GREEN,
        bone: chassis,
        group: chassisGrp,
        name: `lowerFrameRail_${sideTag}`,
      },
    );

    // Upper main frame rail (runs full length from front bumper to rear bumper)
    b.sweep(
      [
        [s * 0.44, 1.48, -2.02],
        [s * 0.44, 1.48, -0.85],
        [s * 0.44, 1.42, 0],
        [s * 0.44, 1.48, 0.85],
        [s * 0.44, 1.48, 2.08],
      ],
      0.042,
      {
        sides: 6,
        smooth: false,
        color: PAINT_CHASSIS_GREEN,
        bone: chassis,
        group: chassisGrp,
        name: `upperFrameRail_${sideTag}`,
      },
    );

    // Triangulated diagonal spaceframe struts connecting lower cradle to upper rails & shock towers
    const diagStruts: Array<[[number, number, number], [number, number, number]]> = [
      [
        [s * 0.4, 1.04, -0.72],
        [s * 0.44, 1.48, -1.55],
      ],
      [
        [s * 0.4, 1.04, -0.72],
        [s * 0.44, 1.48, -0.72],
      ],
      [
        [s * 0.4, 1.04, -0.25],
        [s * 0.44, 1.48, -0.72],
      ],
      [
        [s * 0.4, 1.04, 0],
        [s * 0.44, 1.42, 0],
      ],
      [
        [s * 0.4, 1.04, 0.25],
        [s * 0.44, 1.48, 0.72],
      ],
      [
        [s * 0.4, 1.04, 0.72],
        [s * 0.44, 1.48, 0.72],
      ],
      [
        [s * 0.4, 1.04, 0.72],
        [s * 0.44, 1.48, 1.55],
      ],
      // Tall dual shock hoop towers at front & rear
      [
        [s * 0.44, 1.48, 1.22],
        [s * 0.48, 1.72, 1.48],
      ],
      [
        [s * 0.48, 1.72, 1.48],
        [s * 0.44, 1.48, 1.76],
      ],
      [
        [s * 0.44, 1.48, -1.22],
        [s * 0.48, 1.72, -1.48],
      ],
      [
        [s * 0.48, 1.72, -1.48],
        [s * 0.44, 1.48, -1.76],
      ],
    ];
    diagStruts.forEach(([p0, p1], idx) => {
      b.rod(p0, p1, 0.032, {
        sides: 6,
        smooth: false,
        color: PAINT_CHASSIS_GREEN,
        bone: chassis,
        group: chassisGrp,
        name: `spaceframeStrut_${sideTag}_${idx}`,
      });
    });

    // Heavy 4-link suspension bars (lower & upper triangulated links front & rear)
    for (const [zAxle, zFrame, suspJ, fTag] of [
      [FRONT_Z, 0.58, suspFront, "F"],
      [REAR_Z, -0.58, suspRear, "R"],
    ] as const) {
      // Lower link bar (neon green)
      b.rod([s * 0.38, 1.0, zFrame], [s * 0.56, WHEEL_Y - 0.08, zAxle], 0.038, {
        sides: 6,
        smooth: false,
        color: PAINT_CHASSIS_GREEN,
        bone: suspJ,
        group: `susp_${fTag}`,
        name: `fourLinkLower_${fTag}${sideTag}`,
      });
      // Upper link bar (chrome)
      b.rod([s * 0.34, 1.18, zFrame * 0.85], [s * 0.46, WHEEL_Y + 0.14, zAxle], 0.032, {
        sides: 6,
        smooth: false,
        color: PAINT_CHROME,
        bone: suspJ,
        group: `susp_${fTag}`,
        name: `fourLinkUpper_${fTag}${sideTag}`,
      });

      // Dual Nitrogen Reservoir Coilover Shocks per corner (8 shocks total!)
      for (const [k, zOff] of [
        [0, -0.11],
        [1, 0.11],
      ] as const) {
        const topP: [number, number, number] = [s * 0.48, 1.68, zAxle + zOff * 0.85];
        const midP: [number, number, number] = [s * 0.55, 1.26, zAxle + zOff];
        const botP: [number, number, number] = [s * 0.62, WHEEL_Y + 0.08, zAxle + zOff];

        // Blue anodized upper shock body + coil spring rings
        b.rod(topP, midP, 0.048, {
          sides: 6,
          smooth: false,
          color: PAINT_SHOCK_BLUE,
          bone: suspJ,
          group: `susp_${fTag}`,
          name: `shockBody_${fTag}${sideTag}_${k}`,
        });
        // Yellow/red coilover spring bands around shock body
        b.rod(
          [
            topP[0] + (midP[0] - topP[0]) * 0.18,
            topP[1] + (midP[1] - topP[1]) * 0.18,
            topP[2] + (midP[2] - topP[2]) * 0.18,
          ],
          [
            topP[0] + (midP[0] - topP[0]) * 0.92,
            topP[1] + (midP[1] - topP[1]) * 0.92,
            topP[2] + (midP[2] - topP[2]) * 0.92,
          ],
          0.062,
          {
            sides: 6,
            smooth: false,
            bands: [
              [0.2, C_YELLOW],
              [0.35, C_BLACK],
              [0.55, C_YELLOW],
              [0.7, C_BLACK],
              [0.9, C_YELLOW],
              [1.0, C_RED],
            ],
            bone: suspJ,
            group: `susp_${fTag}`,
            name: `shockSpring_${fTag}${sideTag}_${k}`,
          },
        );
        // Chrome lower piston shaft
        b.rod(midP, botP, 0.026, {
          sides: 6,
          smooth: false,
          color: PAINT_CHROME,
          bone: suspJ,
          group: `susp_${fTag}`,
          name: `shockShaft_${fTag}${sideTag}_${k}`,
        });
        // Piggyback gold nitrogen reservoir canister
        b.rod(
          [topP[0] + s * 0.065, topP[1] - 0.04, topP[2]],
          [topP[0] + s * 0.065, topP[1] - 0.24, topP[2]],
          0.028,
          {
            sides: 6,
            smooth: false,
            color: PAINT_GOLD_TRIM,
            bone: suspJ,
            group: `susp_${fTag}`,
            name: `shockRes_${fTag}${sideTag}_${k}`,
          },
        );
      }
    }
  }

  // Crossmembers connecting left & right frame rails
  for (const zCross of [-2.0, -1.48, -0.75, 0.75, 1.48, 2.04]) {
    b.rod([-0.44, 1.48, zCross], [0.44, 1.48, zCross], 0.038, {
      sides: 6,
      smooth: false,
      color: PAINT_CHASSIS_GREEN,
      bone: chassis,
      group: chassisGrp,
      name: `crossmember_${zCross}`,
    });
  }

  // Zoomie Side-Exit Exhaust Headers (4 angled chrome pipes per side with glowing orange inner tips)
  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const zPipe = 1.05 + i * 0.14;
      const pStart: [number, number, number] = [s * 0.32, 1.52, zPipe];
      const pMid: [number, number, number] = [s * 0.56, 1.32, zPipe - 0.04];
      const pTip: [number, number, number] = [s * 0.72, 1.24, zPipe - 0.1];
      b.sweep([pStart, pMid, pTip], [0.028, 0.038], {
        sides: 6,
        smooth: false,
        caps: "flat",
        color: PAINT_CHROME,
        bone: chassis,
        group: "exhaust",
        name: `zoomiePipe_${sideTag}_${i}`,
      });
      // Glowing hot ember core inside each zoomie tip
      glow(
        b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.02, 6), C_ORANGE, {
          bone: chassis,
          at: pTip,
          dir: [s * 0.7, -0.35, -0.3],
          flat: true,
          group: "exhaust",
          name: `zoomieGlow_${sideTag}_${i}`,
        }),
        1.4,
      );
    }
  }

  // -----------------------------------------------------------------------------------------------------------
  // 5. TRUCK BODY PANELS (SkinBoxes + Stepped Pixel Fender Flares + Stepped Cowl)

  const bodyGrp = "truckBody";

  // Front Hood block (skinBox)
  b.part(skinBox(BODY_SHEET, layout.faces.hood, TEXEL), "#ffffff", {
    texture: BODY_SHEET,
    bone: cabBody,
    at: [0, 1.76, 1.48],
    group: bodyGrp,
    name: "hoodBlock",
  });

  // Front Grille & Headlight block (skinBox)
  b.part(skinBox(BODY_SHEET, layout.faces.grille, TEXEL), "#ffffff", {
    texture: BODY_SHEET,
    bone: cabBody,
    at: [0, 1.73, 2.04],
    group: bodyGrp,
    name: "grilleBlock",
  });

  // Glowing 3D pixel headlight lenses & amber markers over the grille face
  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    glow(
      b.part(new THREE.BoxGeometry(0.18, 0.12, 0.03), C_HEADLIGHT, {
        bone: cabBody,
        at: [s * 0.38, 1.77, 2.12],
        group: bodyGrp,
        name: `headlightLens_${sideTag}`,
      }),
      1.6,
    );
    glow(
      b.part(new THREE.BoxGeometry(0.18, 0.045, 0.03), C_AMBER, {
        bone: cabBody,
        at: [s * 0.38, 1.65, 2.12],
        group: bodyGrp,
        name: `amberMarker_${sideTag}`,
      }),
      1.2,
    );
  }

  // Cab Lower Body block (skinBox)
  b.part(skinBox(BODY_SHEET, layout.faces.cab, TEXEL), "#ffffff", {
    texture: BODY_SHEET,
    bone: cabBody,
    at: [0, 1.81, 0.42],
    group: bodyGrp,
    name: "cabLowerBlock",
  });

  // Hinged left & right outer door skins with side mirrors and window frames (attached to `doorL` / `doorR`)
  for (const [s, dJoint, sideTag] of [
    [1, doorL, "L"],
    [-1, doorR, "R"],
  ] as const) {
    // Raised door blister panel with skull emblem decal
    const doorPanel = b.part(new THREE.BoxGeometry(0.04, 0.44, 0.86), PAINT_BODY_FLAME, {
      bone: dJoint,
      at: [s * 0.64, 1.8, 0.18],
      group: `door_${sideTag}`,
      name: `doorSkin_${sideTag}`,
    });
    b.decal(doorPanel, SKULL_BADGE, {
      at: [s * 0.66, 1.82, 0.38],
      dir: [s, 0, 0],
      size: [0.28, 0.28],
      bone: dJoint,
      group: `door_${sideTag}`,
      name: `doorSkullDecal_${sideTag}`,
    });

    // Heavy west-coast pixelated side mirror on chrome bracket arms
    b.rod([s * 0.64, 2.02, 0.56], [s * 0.84, 2.06, 0.54], 0.016, {
      sides: 6,
      smooth: false,
      color: PAINT_CHROME,
      bone: dJoint,
      group: `door_${sideTag}`,
      name: `mirrorArmTop_${sideTag}`,
    });
    b.rod([s * 0.64, 1.86, 0.56], [s * 0.84, 1.9, 0.54], 0.016, {
      sides: 6,
      smooth: false,
      color: PAINT_CHROME,
      bone: dJoint,
      group: `door_${sideTag}`,
      name: `mirrorArmBot_${sideTag}`,
    });
    b.part(new THREE.BoxGeometry(0.06, 0.24, 0.1), PAINT_CHROME, {
      bone: dJoint,
      at: [s * 0.85, 1.98, 0.53],
      group: `door_${sideTag}`,
      name: `mirrorHead_${sideTag}`,
    });
  }

  // Cab Upper Greenhouse (Stepped pixel-art slanted windshield, side windows & roof)
  const CAB_GREENHOUSE = stepped(
    [
      [-20, 22],
      [-20, 21],
      [-19, 19],
      [-19, 17],
      [-18, 15],
      [-18, 13],
      [-17, 11],
      [-16, 9],
    ],
    [0.025, 0.055],
    { rows: true },
  );
  b.extrude(CAB_GREENHOUSE, {
    at: [0, 2.04, 0.38],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 1.18,
    color: PAINT_CAB_GLASS,
    bone: cabBody,
    group: bodyGrp,
    name: "cabGreenhouseGlass",
  });

  // Stepped Roof Cap & A/B-Pillar Frame over Greenhouse
  const ROOF_CAP = stepped(
    [
      [-18, 11],
      [-17, 10],
      [-15, 8],
    ],
    [0.025, 0.03],
    { rows: true },
  );
  b.extrude(ROOF_CAP, {
    at: [0, 2.46, 0.38],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 1.22,
    color: PAINT_BODY_FLAME,
    bone: cabBody,
    group: bodyGrp,
    name: "cabRoofCap",
  });

  // Pixel Sun Visor over front windshield
  const SUN_VISOR = stepped(
    [
      [-22, 22],
      [-24, 24],
      [-22, 22],
    ],
    [0.025, 0.03],
    { rows: true },
  );
  b.extrude(SUN_VISOR, {
    at: [0, 2.42, 0.69],
    x: [1, 0, 0],
    y: [0, 0.25, 1],
    thickness: 0.06,
    color: PAINT_BODY_FLAME,
    bone: cabBody,
    group: bodyGrp,
    name: "sunVisor",
  });

  // A-pillars & B-pillars framing the cab windows
  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    b.frustumBox(
      [s * 0.59, 2.04, 0.9],
      [s * 0.56, 2.48, 0.62],
      [0.07, 0.07],
      [0.06, 0.06],
      {
        color: PAINT_BODY_FLAME,
        bone: cabBody,
        group: bodyGrp,
        name: `aPillar_${sideTag}`,
      },
    );
    b.frustumBox(
      [s * 0.59, 2.04, -0.08],
      [s * 0.56, 2.48, -0.04],
      [0.09, 0.08],
      [0.08, 0.08],
      {
        color: PAINT_BODY_FLAME,
        bone: cabBody,
        group: bodyGrp,
        name: `bPillar_${sideTag}`,
      },
    );
    // Chrome step nerf bars under cab doors
    b.rod([s * 0.68, 1.48, -0.05], [s * 0.68, 1.48, 0.82], 0.036, {
      sides: 6,
      smooth: false,
      color: PAINT_CHROME,
      bone: cabBody,
      group: bodyGrp,
      name: `nerfStepBar_${sideTag}`,
    });
    b.rod([s * 0.44, 1.48, 0.05], [s * 0.68, 1.48, 0.05], 0.03, {
      sides: 6,
      smooth: false,
      color: PAINT_CHROME,
      bone: cabBody,
      group: bodyGrp,
      name: `nerfBracketRear_${sideTag}`,
    });
    b.rod([s * 0.44, 1.48, 0.72], [s * 0.68, 1.48, 0.72], 0.03, {
      sides: 6,
      smooth: false,
      color: PAINT_CHROME,
      bone: cabBody,
      group: bodyGrp,
      name: `nerfBracketFront_${sideTag}`,
    });
  }

  // Rear Pickup Bed Block (skinBox) + Recessed Diamond-Plate Cargo Bed Floor + Fuel Cell + Nitrous Bottles
  b.part(skinBox(BODY_SHEET, layout.faces.bed, TEXEL), "#ffffff", {
    texture: BODY_SHEET,
    bone: cabBody,
    at: [0, 1.76, -1.36],
    group: bodyGrp,
    name: "bedBlock",
  });

  // Diamond-plate bed liner platform on top of bed
  b.part(tileBox([1.14, 0.06, 1.12], DIAMOND_PLATE, TEXEL, { rand }), "#ffffff", {
    texture: DIAMOND_PLATE,
    bone: cabBody,
    at: [0, 1.97, -1.36],
    group: bodyGrp,
    name: "bedDiamondDeck",
  });

  // Hinged Tailgate at rear of bed
  b.part(skinBox(BODY_SHEET, layout.faces.tailgate, TEXEL), "#ffffff", {
    texture: BODY_SHEET,
    bone: tailgateJoint,
    at: [0, 1.76, -2.01],
    group: "tailgate",
    name: "tailgatePanel",
  });

  // Glowing 3D LED Taillight blocks on rear corners
  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    glow(
      b.part(new THREE.BoxGeometry(0.09, 0.22, 0.04), C_TAILLIGHT, {
        bone: cabBody,
        at: [s * 0.54, 1.78, -2.04],
        group: bodyGrp,
        name: `taillightLens_${sideTag}`,
      }),
      1.5,
    );
  }

  // Wide Stepped Pixel Fender Flares over all 4 wheel arches
  const FENDER_ARCH = stepped(
    [
      [-15, 15],
      [-13, 13],
      [-11, 11],
      [-8, 8],
    ],
    [0.035, 0.045],
    { rows: true },
  );
  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    for (const [zArch, fTag] of [
      [FRONT_Z, "F"],
      [REAR_Z, "R"],
    ] as const) {
      b.extrude(FENDER_ARCH, {
        at: [s * 0.72, 1.62, zArch],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.24,
        color: PAINT_BODY_FLAME,
        bone: cabBody,
        group: bodyGrp,
        name: `fenderFlare_${fTag}${sideTag}`,
      });
    }
  }

  // -----------------------------------------------------------------------------------------------------------
  // 6. COCKPIT INTERIOR (Steering Wheel, Racing Bucket Seat, Roll Harness, Illuminated Dash)

  const cockpitGrp = "cockpit";

  // Racing bucket seat inside cab
  b.frustumBox([0, 1.72, 0.18], [0, 2.28, 0.08], [0.46, 0.14], [0.36, 0.1], {
    color: PAINT_SEAT,
    bone: cabBody,
    group: cockpitGrp,
    name: "racingSeatBack",
  });
  b.part(new THREE.BoxGeometry(0.46, 0.1, 0.42), PAINT_SEAT, {
    bone: cabBody,
    at: [0, 1.72, 0.28],
    group: cockpitGrp,
    name: "racingSeatBase",
  });

  // Dashboard console with glowing pixel instrument panel
  b.part(new THREE.BoxGeometry(1.06, 0.22, 0.28), C_DARK_STEEL, {
    bone: cabBody,
    at: [0, 1.98, 0.68],
    group: cockpitGrp,
    name: "dashboardConsole",
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.54, 0.16), "#ffffff", {
      texture: DASH_GAUGES,
      bone: cabBody,
      at: [0, 2.0, 0.53],
      dir: [0, 0.2, -1],
      axis: "z",
      group: cockpitGrp,
      name: "dashGaugeCluster",
    }),
    1.2,
  );

  // Hinged Steering Column & Pixel Racing Wheel
  b.rod([0.28, 1.98, 0.58], steeringWheelJoint.at, 0.025, {
    sides: 6,
    smooth: false,
    color: PAINT_STEEL,
    bone: steeringWheelJoint,
    group: cockpitGrp,
    name: "steeringColumn",
  });
  b.part(new THREE.TorusGeometry(0.13, 0.024, 6, 8), C_RED, {
    bone: steeringWheelJoint,
    at: steeringWheelJoint.at,
    dir: [0, 0.42, -0.9],
    axis: "z",
    flat: true,
    group: cockpitGrp,
    name: "steeringWheelRim",
  });

  // -----------------------------------------------------------------------------------------------------------
  // 7. EXPOSED SUPERCHARGED V8 ENGINE & BUG-CATCHER BLOWER HAT (on `blowerJoint`)

  const engineGrp = "supercharger";

  // Chrome blower manifold base rising out of hood cutout
  b.part(new THREE.BoxGeometry(0.44, 0.16, 0.56), PAINT_STEEL, {
    bone: blowerJoint,
    at: [0, 1.98, 1.38],
    group: engineGrp,
    name: "intakeManifold",
  });

  // Finned Roots Supercharger Rotor Case (chrome with gold pulley belt at front)
  b.frustumBox([0, 2.14, 1.12], [0, 2.14, 1.64], [0.38, 0.2], [0.38, 0.2], {
    color: PAINT_CHROME,
    bone: blowerJoint,
    group: engineGrp,
    name: "rootsBlowerCase",
  });

  // Front drive snout, ribbed belt & twin chrome pulleys
  b.rod([0, 2.14, 1.64], [0, 2.14, 1.78], 0.085, {
    sides: 8,
    smooth: false,
    color: PAINT_GOLD_TRIM,
    bone: blowerJoint,
    group: engineGrp,
    name: "blowerTopPulley",
  });
  b.frustumBox([0, 1.88, 1.72], [0, 2.14, 1.72], [0.14, 0.05], [0.14, 0.05], {
    color: C_BLACK,
    bone: blowerJoint,
    group: engineGrp,
    name: "blowerDriveBelt",
  });

  // Bug-Catcher Scoop Hat on top of supercharger
  b.frustumBox([0, 2.31, 1.16], [0, 2.31, 1.66], [0.3, 0.15], [0.42, 0.18], {
    color: PAINT_CHROME,
    bone: blowerJoint,
    group: engineGrp,
    name: "bugCatcherScoop",
  });

  // 3 Red Butterfly Intake Throttle Valves inside the front of the bug-catcher scoop
  for (const s of [-1, 0, 1]) {
    glow(
      b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.025, 8), C_RED, {
        bone: blowerJoint,
        at: [s * 0.115, 2.31, 1.665],
        dir: [0, 0.15, 1],
        flat: true,
        group: engineGrp,
        name: `butterflyValve_${s + 1}`,
      }),
      0.8,
    );
  }

  // Skull emblem decal on front of hood ahead of blower
  b.Part;
  b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
    texture: SKULL_BADGE,
    bone: cabBody,
    at: [0, 1.965, 1.84],
    dir: [0, 1, 0.08],
    up: [0, 0, -1],
    axis: "z",
    group: engineGrp,
    name: "hoodSkullEmblem",
  });

  // -----------------------------------------------------------------------------------------------------------
  // 8. HEAVY ROLL CAGE, ROOF LED LIGHTBAR, BED EQUIPMENT, BULLBARS & WHIP ANTENNA

  const cageGrp = "rollCage";

  // Twin vertical roll-bar hoops behind cab + angled backstays into the truck bed
  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    b.sweep(
      [
        [s * 0.48, 1.96, -0.82],
        [s * 0.48, 2.58, -0.82],
        [s * 0.48, 2.58, -1.04],
        [s * 0.48, 1.96, -1.86],
      ],
      0.042,
      {
        sides: 6,
        smooth: false,
        color: PAINT_ROLLCAGE,
        bone: cabBody,
        group: cageGrp,
        name: `bedRollBar_${sideTag}`,
      },
    );
  }

  // Upper rollbar cross-tubes & diagonal X-brace behind cab
  b.rod([-0.48, 2.58, -0.82], [0.48, 2.58, -0.82], 0.044, {
    sides: 6,
    smooth: false,
    color: PAINT_ROLLCAGE,
    bone: cabBody,
    group: cageGrp,
    name: "rollBarTopCrossF",
  });
  b.rod([-0.48, 2.58, -1.04], [0.48, 2.58, -1.04], 0.044, {
    sides: 6,
    smooth: false,
    color: PAINT_ROLLCAGE,
    bone: cabBody,
    group: cageGrp,
    name: "rollBarTopCrossR",
  });
  b.rod([-0.44, 1.98, -0.82], [0.44, 2.54, -0.82], 0.03, {
    sides: 6,
    smooth: false,
    color: PAINT_ROLLCAGE,
    bone: cabBody,
    group: cageGrp,
    name: "rollBarXBrace1",
  });
  b.rod([0.44, 1.98, -0.82], [-0.44, 2.54, -0.82], 0.03, {
    sides: 6,
    smooth: false,
    color: PAINT_ROLLCAGE,
    bone: cabBody,
    group: cageGrp,
    name: "rollBarXBrace2",
  });

  // 4 Round Rally Floodlights mounted across the top of the rollbar
  for (const xLamp of [-0.36, -0.12, 0.12, 0.36]) {
    b.rod([xLamp, 2.67, -0.96], [xLamp, 2.67, -0.84], 0.082, {
      sides: 8,
      smooth: false,
      color: PAINT_CHROME,
      bone: cabBody,
      group: cageGrp,
      name: `rallyLampHousing_${xLamp}`,
    });
    glow(
      b.part(new THREE.CircleGeometry(0.072, 8), C_HEADLIGHT, {
        bone: cabBody,
        at: [xLamp, 2.67, -0.835],
        dir: [0, 0, 1],
        axis: "z",
        group: cageGrp,
        name: `rallyLampLens_${xLamp}`,
      }),
      1.7,
    );
  }

  // Forward Cab Roof LED Lightbar
  b.part(new THREE.BoxGeometry(0.96, 0.09, 0.08), C_DARK_STEEL, {
    bone: cabBody,
    at: [0, 2.58, 0.56],
    group: cageGrp,
    name: "roofLedBarHousing",
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.9, 0.07), "#ffffff", {
      texture: LED_BAR_TEX,
      bone: cabBody,
      at: [0, 2.58, 0.605],
      dir: [0, 0, 1],
      axis: "z",
      group: cageGrp,
      name: "roofLedBarFace",
    }),
    1.8,
  );

  // Rear Bed Equipment: Red Racing Fuel Cell, Twin Blue Nitrous Oxide Bottles & Rear Radiator Pack
  b.part(new THREE.BoxGeometry(0.56, 0.24, 0.38), C_RED, {
    bone: cabBody,
    at: [0, 2.1, -1.56],
    group: "bedGear",
    name: "racingFuelCell",
  });
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 8), PAINT_GOLD_TRIM, {
    bone: cabBody,
    at: [0, 2.23, -1.56],
    flat: true,
    group: "bedGear",
    name: "fuelFillerCap",
  });

  // Rear competition radiator + twin electric cooling fans mounted between rollbars
  b.part(tileBox([0.74, 0.34, 0.08], RADIATOR_TILE, FINE_TEXEL), "#ffffff", {
    texture: RADIATOR_TILE,
    bone: cabBody,
    at: [0, 2.18, -1.08],
    group: "bedGear",
    name: "rearRadiatorCore",
  });

  // Twin Blue Nitrous Bottles on angled brackets in bed
  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    b.capsule([s * 0.38, 2.04, -1.24], [s * 0.38, 2.24, -1.52], 0.068, {
      sides: 8,
      smooth: false,
      color: PAINT_SHOCK_BLUE,
      bone: cabBody,
      group: "bedGear",
      name: `nitrousBottle_${sideTag}`,
    });
    b.rod([s * 0.38, 2.24, -1.52], [s * 0.38, 2.29, -1.58], 0.025, {
      sides: 6,
      smooth: false,
      color: PAINT_GOLD_TRIM,
      bone: cabBody,
      group: "bedGear",
      name: `nitrousValve_${sideTag}`,
    });
  }

  // Front Heavy Push-Bar Bullbar, Winch Fairlead & Tow Hooks
  const bullGrp = "bullbar";
  b.rod([-0.68, 1.54, 2.16], [0.68, 1.54, 2.16], 0.055, {
    sides: 8,
    smooth: false,
    color: PAINT_STEEL,
    bone: chassis,
    group: bullGrp,
    name: "frontBumperTube",
  });
  // Angled A-frame bullbar hoop protecting the grille
  b.sweep(
    [
      [-0.42, 1.54, 2.16],
      [-0.3, 1.92, 2.26],
      [0.3, 1.92, 2.26],
      [0.42, 1.54, 2.16],
    ],
    0.038,
    {
      sides: 6,
      smooth: false,
      color: PAINT_CHROME,
      bone: chassis,
      group: bullGrp,
      name: "bullbarHoop",
    },
  );
  // Front skid plate & winch drum under bullbar
  b.frustumBox([0, 1.24, 1.88], [0, 1.52, 2.16], [0.68, 0.06], [0.76, 0.06], {
    color: PAINT_CHROME,
    bone: chassis,
    group: bullGrp,
    name: "frontSkidGuard",
  });
  b.rod([-0.16, 1.56, 2.2], [0.16, 1.56, 2.2], 0.05, {
    sides: 8,
    smooth: false,
    color: C_RED,
    bone: chassis,
    group: bullGrp,
    name: "winchDrum",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.055, 0.018, 6, 8), C_YELLOW, {
      bone: chassis,
      at: [s * 0.48, 1.52, 2.22],
      dir: [1, 0, 0],
      axis: "z",
      flat: true,
      group: bullGrp,
      name: `frontTowShackle_${s > 0 ? "L" : "R"}`,
    });
  }

  // Rear Heavy Tube Bumper & Wheelie Bar
  b.rod([-0.68, 1.52, -2.1], [0.68, 1.52, -2.1], 0.052, {
    sides: 8,
    smooth: false,
    color: PAINT_STEEL,
    bone: chassis,
    group: "rearBumper",
    name: "rearBumperTube",
  });
  // Rear Wheelie Bar extending back from lower chassis with twin caster rollers
  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    b.rod([s * 0.34, 1.12, -1.55], [s * 0.24, 0.68, -2.36], 0.026, {
      sides: 6,
      smooth: false,
      color: PAINT_CHASSIS_GREEN,
      bone: chassis,
      group: "rearBumper",
      name: `wheelieStrutLow_${sideTag}`,
    });
    b.rod([s * 0.38, 1.46, -1.96], [s * 0.24, 0.68, -2.36], 0.024, {
      sides: 6,
      smooth: false,
      color: PAINT_CHROME,
      bone: chassis,
      group: "rearBumper",
      name: `wheelieStrutHigh_${sideTag}`,
    });
  }
  b.rod([-0.3, 0.68, -2.36], [0.3, 0.68, -2.36], 0.08, {
    sides: 8,
    smooth: false,
    bands: [
      [0.22, C_RED],
      [0.78, C_DARK_STEEL],
      [1.0, C_RED],
    ],
    bone: chassis,
    group: "rearBumper",
    name: "wheelieRollerAxle",
  });

  // Flexible Whip Antenna with Pixel Pennant Flag at Rear Corner (`antennaJoint`)
  const antTip: [number, number, number] = [0.64, 2.78, -2.08];
  b.rod(antennaJoint.at, antTip, [0.016, 0.008], {
    sides: 5,
    smooth: false,
    color: C_CHROME,
    bone: antennaJoint,
    group: "antenna",
    name: "whipAntennaRod",
  });
  b.cards([frame([0.63, 2.66, -2.05], [0, 1, 0])], WHIP_FLAG, {
    size: [0.24, 0.14],
    lean: 90,
    flow: [0, 0, -1],
    bone: antennaJoint,
    group: "antenna",
    name: "whipAntennaFlag",
  });

  // Slight dynamic rest pose on front steering knuckles so it reads alive while keeping all 4 tyres grounded
  b.pose(steerFL, { axis: [0, 1, 0], deg: 6 });
  b.pose(steerFR, { axis: [0, 1, 0], deg: 6 });

  return b.root;
}
