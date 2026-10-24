import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  paint,
  grain,
  mix,
  noise,
  resolve,
  smoothstep,
  cells,
  scales,
  mottle,
  svg,
} from "../../../../src/index";
import type { ColorInput, Rgb, Fill } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Night Ramen Yatai",
  description:
    "A Ghibli-style night ramen stall diorama: a weathered wooden yatai cart on big spoked wheels under a mossy tiled roof, indigo noren curtains, glowing red chochin lanterns, a lit rooftop sign, steaming pots, filled bowls, and three wooden stools on a cobbled base with a lantern-lit puddle.",
};

// ---------------------------------------------------------------------------------------------------------------
// Scale constants (meters)

const G = 0.12; // top of the diorama base
const CT = G + 0.98; // customer counter top
const E = 0.9; // roof eave half depth
const RT = 0.07; // roof thickness
const DEG = Math.PI / 180;

type P3 = [number, number, number];
type OP = [number, number] | [number, number, "sharp"];

const rgb3 = (r: number, g: number, b: number): Rgb => [r, g, b];
const hash1 = (i: number, seed = 0) => {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const frac = (x: number) => x - Math.floor(x);

// ---------------------------------------------------------------------------------------------------------------
// Light: lanterns, bulb, andon and stove warm the surfaces near them; everything else sinks into blue night.

const LIGHTS = [
  { p: new THREE.Vector3(1.05, G + 1.555, 0.78), k: 1.0, r: 0.75 },
  { p: new THREE.Vector3(-1.05, G + 1.555, 0.78), k: 1.0, r: 0.75 },
  { p: new THREE.Vector3(0, G + 1.775, 0.05), k: 0.9, r: 0.65 },
  { p: new THREE.Vector3(0.86, G + 1.09, 0.6), k: 0.6, r: 0.4 },
  { p: new THREE.Vector3(-0.45, G + 0.96, -0.05), k: 0.4, r: 0.3 },
];

function lit(base: ColorInput, amount = 1) {
  return paint((p, n) => {
    const c = resolve(base, p, n);
    let w = 0;
    for (const L of LIGHTS) {
      const dx = L.p.x - p.x;
      const dy = L.p.y - p.y;
      const dz = L.p.z - p.z;
      const d = Math.hypot(dx, dy, dz) + 1e-4;
      const face = Math.max(0, (n.x * dx + n.y * dy + n.z * dz) / d);
      w += (L.k * (0.3 + 0.7 * face)) / (1 + (d / L.r) ** 2);
    }
    w = Math.min(1, w * amount);
    const night = rgb3(c[0] * 0.68, c[1] * 0.74, Math.min(1, c[2] * 0.92 + 0.03));
    const warm = rgb3(Math.min(1, c[0] * 1.12 + 0.09), Math.min(1, c[1] * 1.0 + 0.035), c[2] * 0.8);
    const out = mix(night, warm, smoothstep(0.05, 0.75, w));
    const under = smoothstep(0.2, -0.8, n.y) * 0.22;
    return mix(out, rgb3(out[0] * 0.7, out[1] * 0.72, out[2] * 0.86), under);
  });
}

const MUD = "#3a2b20";
function grime(base: ColorInput) {
  return paint((p, n) => {
    const c = resolve(base, p, n);
    const t = smoothstep(G + 0.32, G + 0.02, p.y) * (0.45 + 0.55 * noise(p, 0.08, 31));
    return mix(c, MUD, t * 0.7);
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Material paints

const SEAM = "#2b1b12";
function planks(a: string, c: string, seam: number, seed: number) {
  const gx = grain(a, c, { size: 0.011, axis: "x", seed });
  const gz = grain(a, c, { size: 0.011, axis: "z", seed: seed + 3 });
  return paint((p, n) => {
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    const top = ay > Math.max(ax, az);
    const coord = top ? p.z : p.y;
    const k = coord / seam;
    const i = Math.floor(k);
    const f = k - i;
    if (f < 0.05) return SEAM;
    const g = resolve(top ? gx : ax > az ? gz : gx, p, n);
    const t = 0.84 + 0.3 * hash1(i, seed);
    const knot = 1 - 0.25 * smoothstep(0.74, 0.8, noise(p, 0.06, seed + 7));
    return rgb3(Math.min(1, g[0] * t * knot), Math.min(1, g[1] * t * knot), Math.min(1, g[2] * t * knot));
  });
}

const BODY = lit(grime(planks("#a8723f", "#86552e", 0.09, 1)));
const COUNTER = lit(planks("#dcb27a", "#c08f58", 0.1, 3));
const BOARD = lit(planks("#e6c896", "#d0aa72", 0.06, 5));
const POST_V = lit(grime(grain("#5e3c25", "#47291a", { size: 0.009, axis: "y", seed: 2 })));
const POST_H = lit(grain("#5e3c25", "#47291a", { size: 0.009, axis: "x", seed: 6 }));
const TRIM = lit(grime(grain("#6a3626", "#4e2419", { size: 0.01, axis: "y", seed: 8 })));
const FASCIA_RED = lit(grain("#7a3226", "#5a2219", { size: 0.012, axis: "x", seed: 9 }));
const WHEEL_WOOD = lit(grime(grain("#7a5232", "#5d3c23", { size: 0.008, axis: "y", seed: 4 })));
const LACQUER = "#1d1a1c";
const IRON = lit(metal("iron"));
const STEEL = lit(metal("steel", { tarnish: 0.25 }));
const COPPER = lit(metal("copper", { verdigris: 0.3 }));
const BRASS = lit(metal("brass"));
const BROTH = mottle("#c98a3e", "#e8b868", { size: 0.035, seed: 5 });
const CRATE = lit(grime(planks("#b88a52", "#9a6e3e", 0.055, 11)));

const BAMBOO = lit(
  paint((p) => {
    const f = frac(p.x / 0.2);
    if (f < 0.04) return "#6f6a2c";
    return mix("#b8b25a", "#d6c97a", noise(p, 0.05, 3));
  }),
);
const BAMBOO_V = lit(
  paint((p) => {
    const f = frac(p.y / 0.05);
    if (f < 0.12) return "#7a6f30";
    return mix("#c8b866", "#e0d08a", noise(p, 0.03, 4));
  }),
);
const SUDARE = lit(
  paint((p) => {
    if (frac((p.y - G) / 0.12) < 0.06) return "#4a3a22";
    const f = frac(p.x / 0.012);
    if (f < 0.22) return "#6e5a30";
    return mix("#c9b06c", "#dcc68a", noise(p, 0.05, 21));
  }),
);
const ICHIMATSU = lit(
  paint((p) => {
    const k = Math.floor(p.x / 0.045) + Math.floor(p.z / 0.045);
    return ((k % 2) + 2) % 2 === 0 ? "#b5384a" : "#f0dcc8";
  }),
);

// Roof: rounded clay tiles in slate-teal, moss creeping between them, plank soffit and dark fascia ends.
const TILE_A = "#4c6478";
const TILE_B = "#5d7488";
const TILE_D = "#2b3a4a";
const MOSS = "#7b9a3e";
const MOSS_D = "#46612a";
const soffit = grain("#6e4a2e", "#55371f", { size: 0.012, axis: "z", seed: 14 });
const ROOF = lit(
  paint((p, n) => {
    if (n.y > 0.3) {
      const cx = (p.x + 5) / 0.115;
      const col = Math.floor(cx);
      const fx = cx - col;
      const rz = Math.abs(p.z) / 0.085;
      const row = Math.floor(rz);
      const fz = rz - row;
      let c = mix(TILE_A, TILE_B, hash1(col * 31 + row, 2));
      const bulge = Math.sin(fx * Math.PI);
      c = mix(TILE_D, c, 0.5 + 0.5 * bulge);
      if (fz > 0.86) c = mix(c, "#a3b8c6", 0.4);
      else if (fz < 0.12) c = mix(c, TILE_D, 0.6);
      const m = noise(p, 0.3, 11);
      if (m > 0.56)
        c = mix(c, mix(MOSS_D, MOSS, noise(p, 0.05, 12)), smoothstep(0.56, 0.68, m) * (1 - bulge * 0.45));
      return c;
    }
    if (n.y < -0.3) {
      if (frac((p.x + 5) / 0.14) < 0.05) return SEAM;
      return soffit;
    }
    return "#3a2418";
  }),
);

// Ground: cobbles with moss in the joints, a puddle holding a lantern's reflection, layered earth sides.
const PUD = { x: 1.1, z: 1.22 };
const COBBLE = scales(["#8a8592", "#7a7f8c", "#948a86", "#6f7684"], "#2e2b35", { size: 0.14, width: 0.16, seed: 4 });
const SOIL = ["#5a4030", "#6b4d36", "#4c3628", "#7a5a3e"];
const GROUND = lit(
  paint((p, n) => {
    if (n.y > 0.6) {
      const px = (p.x - PUD.x) / 0.36;
      const pz = (p.z - PUD.z) / 0.2;
      const r = Math.hypot(px, pz) + (noise(p, 0.15, 3) - 0.5) * 0.5;
      if (r < 1) {
        const refl = Math.exp(-(((p.x - 1.05) / 0.07) ** 2)) * smoothstep(1, 0.2, r);
        const sky = mix("#1b2442", "#2f3e6a", noise(p, 0.1, 6));
        const star = cells(p, 0.05, 19).d1 < 0.08 ? 0.5 : 0;
        return mix(mix(sky, "#dfe6ff", star), "#ffb05a", refl * 0.85);
      }
      if (r < 1.12) return "#3b3842";
      const c = cells(p, 0.14, 4);
      const mossy = c.d2 - c.d1 < 0.12 && noise(p, 0.35, 8) > 0.48;
      if (mossy) return mix(MOSS_D, MOSS, noise(p, 0.04, 2));
      return COBBLE;
    }
    if (n.y < -0.5) return "#2a2320";
    if (p.y > G - 0.022 + (noise(p, 0.05, 2) - 0.5) * 0.02) return mix(MOSS_D, MOSS, noise(p, 0.03, 4));
    const pebble = cells(p, 0.03, 9);
    if (pebble.d1 < 0.3 && pebble.id > 0.6) return "#8a8478";
    const k = Math.floor(p.y / 0.028 + (noise(p, 0.25, 5) - 0.5) * 1.4);
    return SOIL[((k % 4) + 4) % 4];
  }),
);

function stoolWood(cx: number, cz: number, a: string, c: string, seed: number) {
  const side = grain(a, c, { size: 0.008, axis: "y", seed });
  return lit(
    paint((p, n) => {
      if (n.y > 0.5) {
        const r = Math.hypot(p.x - cx, p.z - cz);
        const ring = 0.5 + 0.5 * Math.sin(r * 140 + noise(p, 0.04, seed) * 5);
        return mix(a, c, ring * 0.7);
      }
      return side;
    }),
  );
}

const LEAF_TINT = paint((p) => {
  const v = noise(p, 0.2, 13);
  return v < 0.38 ? "#c8452a" : v < 0.5 ? "#de7a2e" : v < 0.62 ? "#e8b040" : "#a8a03a";
});
const GRASS_TINT = paint((p) => (noise(p, 0.15, 7) > 0.5 ? "#6f9a44" : "#4f7a34"));

// ---------------------------------------------------------------------------------------------------------------
// Brush katakana for ラーメン, in a unit box

const KANA: Record<string, string> = {
  ra: "M0.28 0.14 L0.7 0.14 M0.16 0.38 L0.8 0.38 Q0.78 0.74 0.32 0.92",
  ch: "M0.1 0.5 L0.9 0.5",
  cv: "M0.5 0.1 L0.5 0.9",
  me: "M0.78 0.08 Q0.62 0.62 0.14 0.92 M0.26 0.34 Q0.58 0.56 0.84 0.86",
  n: "M0.16 0.2 L0.4 0.4 M0.14 0.9 Q0.62 0.78 0.86 0.22",
};
function kana(k: string, x: number, y: number, s: number, color: string, w = 0.14) {
  return `<path d="${KANA[k]}" transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function spiralPath(cx: number, cy: number, r: number, turns: number) {
  let d = "";
  for (let i = 0; i <= 48; i++) {
    const t = i / 48;
    const a = t * turns * Math.PI * 2;
    const rr = r * (0.12 + 0.82 * t);
    d += `${i ? "L" : "M"}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }
  return d;
}
function naruto(cx: number, cy: number, r: number) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fdf7f2" stroke="#eadad2" stroke-width="${r * 0.12}"/>
    <path d="${spiralPath(cx, cy, r * 0.82, 2.2)}" fill="none" stroke="#e0507a" stroke-width="${r * 0.16}" stroke-linecap="round"/>`;
}

// ---------------------------------------------------------------------------------------------------------------
// Drawings

function norenTexture(R: () => number) {
  const chars = ["ra", "ch", "me", "n"];
  let s = `<svg viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg">`;
  for (let i = 0; i < 4; i++) {
    const x0 = i * 100;
    s += `<rect x="${x0}" y="0" width="100" height="150" fill="#25355f"/>`;
    for (let k = 0; k < 3; k++)
      s += `<ellipse cx="${x0 + 15 + 70 * R()}" cy="${30 + 90 * R()}" rx="${12 + 14 * R()}" ry="${18 + 20 * R()}" fill="#30447a" opacity="0.55"/>`;
    s += `<rect x="${x0}" y="0" width="100" height="14" fill="#18223f"/>`;
    s += `<rect x="${x0}" y="0" width="4" height="150" fill="#1b2748"/><rect x="${x0 + 96}" y="0" width="4" height="150" fill="#1b2748"/>`;
    s += `<rect x="${x0 + 8}" y="19" width="84" height="2.5" fill="#e8dcc0"/>`;
    for (const [row, off] of [
      [138, 0],
      [150, 12.5],
    ] as const) {
      for (let w = -1; w < 5; w++) {
        const cx = x0 + off + w * 25;
        if (cx < x0 - 12 || cx > x0 + 112) continue;
        s += `<path d="M${cx - 12.5} ${row} A12.5 12.5 0 0 1 ${cx + 12.5} ${row} Z" fill="#25355f"/>`;
        for (const rr of [12, 8, 4])
          s += `<path d="M${cx - rr} ${row} A${rr} ${rr} 0 0 1 ${cx + rr} ${row}" fill="none" stroke="#6680ba" stroke-width="2"/>`;
      }
    }
    s += kana(chars[i], x0 + 16, 32, 68, "#f4ecd8", 0.15);
  }
  return svg(s + `</svg>`, { size: 1024 });
}

function lanternTexture() {
  let ribs = "";
  for (let y = 8; y < 140; y += 7.5)
    ribs += `<line x1="0" y1="${y}" x2="200" y2="${y}" stroke="#7e140e" stroke-width="1.3" opacity="0.55"/>`;
  return svg(
    `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a81e16"/><stop offset="0.5" stop-color="#ff5a2e"/><stop offset="1" stop-color="#a81e16"/></linearGradient>
        <radialGradient id="lh" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffc080" stop-opacity="0.7"/><stop offset="1" stop-color="#ff5a2e" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="200" height="140" fill="url(#lg)"/>
      <ellipse cx="100" cy="70" rx="48" ry="58" fill="url(#lh)"/>
      ${ribs}
      ${kana("ra", 88, 16, 24, "#1a0d0e", 0.17)}
      ${kana("cv", 88, 42, 24, "#1a0d0e", 0.17)}
      ${kana("me", 88, 68, 24, "#1a0d0e", 0.17)}
      ${kana("n", 88, 94, 24, "#1a0d0e", 0.17)}
      ${naruto(0, 70, 20)}
      ${naruto(200, 70, 20)}
    </svg>`,
    { size: 512 },
  );
}

function signTexture() {
  return svg(
    `<svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6dc"/><stop offset="1" stop-color="#ffd38a"/></linearGradient></defs>
      <rect width="300" height="100" fill="#b8281e"/>
      <rect x="7" y="7" width="286" height="86" fill="url(#p)"/>
      <rect x="11" y="11" width="278" height="78" fill="none" stroke="#3a2416" stroke-width="1.6"/>
      <circle cx="18" cy="18" r="3" fill="#b8281e"/><circle cx="282" cy="18" r="3" fill="#b8281e"/>
      <circle cx="18" cy="82" r="3" fill="#b8281e"/><circle cx="282" cy="82" r="3" fill="#b8281e"/>
      ${kana("ra", 22, 20, 60, "#1d1418", 0.15)}
      ${kana("ch", 88, 20, 60, "#1d1418", 0.15)}
      ${kana("me", 154, 20, 60, "#1d1418", 0.15)}
      ${kana("n", 220, 20, 60, "#1d1418", 0.15)}
    </svg>`,
    { size: 768 },
  );
}

function menuTexture(R: () => number) {
  let s = `<svg viewBox="0 0 240 110" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="110" fill="#5b3a24"/>`;
  for (let i = 0; i < 6; i++) {
    const x = 5 + i * 38.5;
    s += `<rect x="${x}" y="6" width="33" height="98" rx="3" fill="#f0dcae" stroke="#8a6238" stroke-width="1.5"/>`;
    s += `<circle cx="${x + 16.5}" cy="12" r="2.2" fill="#3a2416"/>`;
    for (let g = 0; g < 3; g++) {
      const gx = x + 7;
      const gy = 19 + g * 21;
      let d = "";
      const strokes = 2 + Math.floor(R() * 3);
      for (let k = 0; k < strokes; k++) {
        const ax = gx + R() * 19;
        const ay = gy + R() * 16;
        const bx = gx + R() * 19;
        const by = gy + R() * 16;
        d += `M${ax.toFixed(1)} ${ay.toFixed(1)} L${bx.toFixed(1)} ${by.toFixed(1)} `;
      }
      s += `<path d="${d}" stroke="#20161a" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
    }
    s += `<rect x="${x + 9}" y="86" width="15" height="12" rx="2" fill="#c0392b"/>`;
    s += `<path d="M${x + 12} 92 L${x + 21} 92" stroke="#f0dcae" stroke-width="2"/>`;
  }
  return svg(s + `</svg>`, { size: 512 });
}

function bowlTopTexture(R: () => number) {
  let s = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="b" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#f0b45e"/><stop offset="0.8" stop-color="#cf8436"/><stop offset="1" stop-color="#a45f26"/></radialGradient></defs>
    <circle cx="50" cy="50" r="50" fill="url(#b)"/>`;
  for (let k = 0; k < 14; k++)
    s += `<circle cx="${(10 + R() * 80).toFixed(1)}" cy="${(10 + R() * 80).toFixed(1)}" r="${(1 + R() * 2).toFixed(1)}" fill="#ffd890" opacity="0.8"/>`;
  for (let k = 0; k < 7; k++) {
    const d = `M${18 + k * 5} 90 C${8 + k * 6} 72, ${44 + k * 3} 66, ${28 + k * 5} 48 S${20 + k * 4} 30, ${30 + k * 6} 22`;
    s += `<path d="${d}" stroke="#c99a40" stroke-width="4.6" fill="none" stroke-linecap="round"/>`;
    s += `<path d="${d}" stroke="#f7dc84" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
  s += `<rect x="56" y="4" width="26" height="34" rx="2" fill="#1d3226" stroke="#33503d" stroke-width="1.5" transform="rotate(12 69 21)"/>
    <circle cx="34" cy="34" r="17" fill="#e7c6a2"/><circle cx="34" cy="34" r="14" fill="#b9724a"/>
    <path d="M26 32 Q34 24 42 34 Q36 42 28 38" stroke="#8a4a2c" stroke-width="2" fill="none"/>
    <rect x="50" y="40" width="5" height="16" rx="1" fill="#d9a85a" transform="rotate(20 52 48)"/>
    <rect x="56" y="42" width="5" height="15" rx="1" fill="#c99448" transform="rotate(-10 58 49)"/>
    <ellipse cx="70" cy="66" rx="15" ry="12" fill="#fbf6ea"/>
    <ellipse cx="70" cy="66" rx="9" ry="7" fill="#f09a18"/><ellipse cx="68" cy="64" rx="4" ry="3" fill="#ffd25a"/>
    ${naruto(38, 72, 10)}`;
  for (let k = 0; k < 16; k++)
    s += `<circle cx="${(25 + R() * 50).toFixed(1)}" cy="${(25 + R() * 50).toFixed(1)}" r="2.2" fill="#c8e89a" stroke="#4f9e34" stroke-width="1.3"/>`;
  return svg(s + `</svg>`, { size: 256 });
}

function bandTexture() {
  let s = `<svg viewBox="0 0 800 40" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="40" fill="#f6f1e6"/>
    <rect y="1" width="800" height="3.5" fill="#c4352a"/><rect y="35.5" width="800" height="3.5" fill="#c4352a"/>`;
  for (let k = 0; k < 20; k++) {
    const x = k * 40;
    s += `<path d="M${x + 5} 31 V9 H${x + 33} V27 H${x + 15} V16 H${x + 25}" stroke="#c4352a" stroke-width="3.6" fill="none"/>`;
  }
  return svg(s + `</svg>`, { size: 1024 });
}

function steamTexture() {
  return svg(
    `<svg viewBox="0 0 64 160" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 158 C8 132, 52 112, 28 86 S12 44, 34 14" stroke="#ffffff" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M46 150 C60 128, 30 104, 46 80 S56 50, 44 30" stroke="#e4e4e4" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="36" cy="8" r="4.5" fill="#ffffff"/><circle cx="50" cy="20" r="3" fill="#e4e4e4"/>
    </svg>`,
    { size: 160 },
  );
}

function leafTexture() {
  return svg(
    `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 58 Q2 34 20 3 Q38 34 20 58Z" fill="#e6e6e6" stroke="#a0a0a0" stroke-width="1.5"/>
      <path d="M20 56 L20 8 M20 40 L10 30 M20 40 L30 30 M20 26 L12 18 M20 26 L28 18" stroke="#7a7a7a" stroke-width="1.6" fill="none"/>
    </svg>`,
    { size: 96 },
  );
}

function grassTexture() {
  return svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 64 L14 18 L20 64Z" fill="#c8c8c8"/><path d="M18 64 Q22 30 34 4 Q28 34 28 64Z" fill="#e0e0e0"/>
      <path d="M30 64 L40 14 L42 64Z" fill="#b8b8b8"/><path d="M40 64 Q46 36 58 22 Q52 42 50 64Z" fill="#d8d8d8"/>
      <rect x="0" y="56" width="64" height="8" fill="#909090"/>
    </svg>`,
    { size: 128 },
  );
}

function andonTexture() {
  return svg(
    `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="a" cx="0.5" cy="0.55" r="0.6"><stop offset="0" stop-color="#fff4d0"/><stop offset="1" stop-color="#ffc870"/></radialGradient></defs>
      <rect width="60" height="100" fill="url(#a)"/>
      <rect x="2.5" y="2.5" width="55" height="95" fill="none" stroke="#3b2416" stroke-width="5"/>
      <rect x="0" y="32" width="60" height="3" fill="#3b2416"/><rect x="0" y="66" width="60" height="3" fill="#3b2416"/>
      <rect x="29" y="0" width="2.4" height="100" fill="#3b2416"/>
      <circle cx="30" cy="50" r="15" fill="#c8342a"/>
      ${kana("ra", 19, 39, 22, "#fff4d8", 0.16)}
    </svg>`,
    { size: 256 },
  );
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "ramen-yatai", paintSize: 2048 });
  const R = rng(11);

  const NOREN = norenTexture(rng(3));
  const LANTERN = lanternTexture();
  const SIGN = signTexture();
  const MENU = menuTexture(rng(42));
  const BOWLTOP = bowlTopTexture(rng(17));
  const BAND = bandTexture();
  const STEAM = steamTexture();
  const LEAF = leafTexture();
  const GRASS = grassTexture();
  const ANDON = andonTexture();

  // ----- placement helpers -----
  const box = (w: number, h: number, d: number, color: Fill, at: P3, rotation?: P3) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, rotation ? { at, rotation } : { at });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: Fill, at: P3, dir: P3 = [0, 1, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, dir });
  const ball = (r: number, color: Fill, at: P3, scale?: P3, ws = 10, hs = 8) =>
    b.part(new THREE.SphereGeometry(r, ws, hs), color, scale ? { at, scale } : { at });
  const flatRing = (r: number, tube: number, color: Fill, at: P3, seg = 16) =>
    b.part(new THREE.TorusGeometry(r, tube, 4, seg), color, { at, dir: [0, 1, 0], axis: "z" });
  const vpost = (x: number, z: number, y0: number, y1: number, w: number, color: Fill) =>
    b.frustumBox([x, y0, z], [x, y1, z], [w, w], [w, w], { color });
  const disc = (r: number, color: Fill, at: P3, seg = 14) =>
    b.part(new THREE.CircleGeometry(r, seg), color, { at, dir: [0, 1, 0], axis: "z" });

  // =============================================================================================================
  // Diorama base: a cobbled island of street, mossy lip, layered earth below.
  const baseOutline: OP[] = [
    [-1.7, 0],
    [-1.68, -1.15],
    [-1.45, -1.52],
    [0, -1.6],
    [1.45, -1.52],
    [1.68, -1.15],
    [1.72, 0],
    [1.66, 1.18],
    [1.4, 1.42],
    [0, 1.46],
    [-1.4, 1.42],
    [-1.66, 1.18],
  ];
  const base = b.extrude(baseOutline, {
    at: [0, G / 2, 0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: G,
    bevel: 0.02,
    smoothing: 2,
    color: GROUND,
    name: "base",
  });

  // =============================================================================================================
  // Wheels and axle
  for (const s of [1, -1]) {
    const wc: P3 = [s * 1.03, G + 0.372, 0];
    b.lathe(
      [
        [0.3, -0.028],
        [0.352, -0.028],
        [0.352, 0.028],
        [0.3, 0.028],
      ],
      { at: wc, axis: [1, 0, 0], segments: 24, color: WHEEL_WOOD },
    );
    b.lathe(
      [
        [0.35, -0.034],
        [0.374, -0.034],
        [0.374, 0.034],
        [0.35, 0.034],
      ],
      { at: wc, axis: [1, 0, 0], segments: 24, color: IRON },
    );
    cyl(0.075, 0.075, 0.15, 10, WHEEL_WOOD, wc, [1, 0, 0]);
    cyl(0.04, 0.04, 0.2, 8, IRON, wc, [1, 0, 0]);
    flatRing(0.0, 0.0, IRON, wc); // placeholder removed below
    for (let k = 0; k < 12; k++) {
      const a = k * 30 * DEG;
      const dy = Math.cos(a);
      const dz = Math.sin(a);
      b.rod([wc[0], wc[1] + dy * 0.07, wc[2] + dz * 0.07], [wc[0], wc[1] + dy * 0.305, wc[2] + dz * 0.305], [0.018, 0.013], {
        color: WHEEL_WOOD,
        sides: 6,
      });
    }
  }
  b.rod([-1.1, G + 0.372, 0], [1.1, G + 0.372, 0], 0.028, { color: IRON, sides: 8 });
  for (const s of [1, -1]) box(0.08, 0.09, 0.12, POST_H, [s * 0.75, G + 0.41, 0]);

  // =============================================================================================================
  // Cart body
  box(1.9, 0.45, 0.9, BODY, [0, G + 0.675, 0]);
  for (const sx of [1, -1]) for (const sz of [1, -1]) box(0.07, 0.47, 0.07, TRIM, [sx * 0.95, G + 0.675, sz * 0.45]);
  box(1.96, 0.05, 0.05, TRIM, [0, G + 0.905, -0.45]);
  for (const sx of [1, -1]) box(0.05, 0.05, 0.9, TRIM, [sx * 0.955, G + 0.905, 0]);
  for (const sz of [1, -1]) box(1.97, 0.05, 0.05, TRIM, [0, G + 0.47, sz * 0.46]);
  box(1.96, 0.06, 0.06, TRIM, [0, G + 0.92, 0.42]);
  // counter plank and nosing
  box(2.06, 0.045, 0.4, COUNTER, [0, G + 0.9575, 0.57]);
  b.rod([-1.03, G + 0.957, 0.77], [1.03, G + 0.957, 0.77], 0.024, { color: COUNTER, sides: 8 });
  // brackets under the counter
  for (const bx of [-0.85, 0, 0.85])
    b.extrude(
      [
        [0, 0],
        [0.28, 0],
        [0, -0.22],
      ],
      { at: [bx, G + 0.935, 0.45], x: [0, 0, 1], thickness: 0.045, bevel: 0.006, color: TRIM },
    );
  // bamboo blind on the body front
  box(1.6, 0.36, 0.012, SUDARE, [0, G + 0.69, 0.462]);
  b.rod([-0.82, G + 0.875, 0.468], [0.82, G + 0.875, 0.468], 0.011, { color: BAMBOO, sides: 6 });
  // brass foot rail
  b.rod([-0.88, G + 0.55, 0.6], [0.88, G + 0.55, 0.6], 0.016, { color: BRASS, sides: 8 });
  for (const x of [-0.7, 0, 0.7]) b.rod([x, G + 0.55, 0.6], [x, G + 0.55, 0.44], 0.011, { color: BRASS, sides: 6 });

  // pulling shafts
  for (const s of [1, -1]) {
    b.rod([s * 0.7, G + 0.5, -0.4], [s * 0.7, G + 0.3, -1.18], [0.032, 0.026], { color: WHEEL_WOOD, sides: 8 });
    b.rod([s * 0.7, G + 0.31, -1.1], [s * 0.7, G, -1.1], 0.02, { color: WHEEL_WOOD, sides: 6 });
  }
  b.rod([-0.72, G + 0.31, -1.14], [0.72, G + 0.31, -1.14], 0.025, { color: WHEEL_WOOD, sides: 8 });
  for (const x of [-0.12, -0.04, 0.04, 0.12])
    b.part(new THREE.TorusGeometry(0.03, 0.007, 4, 10), "#c9b48a", { at: [x, G + 0.31, -1.14], dir: [1, 0, 0], axis: "z" });

  // =============================================================================================================
  // Frame: posts, tie beams, king posts, ridge beam
  for (const sx of [1, -1]) for (const sz of [1, -1]) vpost(sx * 0.92, sz * 0.4, G + 0.88, G + 1.99, 0.07, POST_V);
  for (const sz of [1, -1]) box(2.02, 0.11, 0.07, POST_H, [0, G + 2.025, sz * 0.4]);
  for (const sx of [1, -1]) {
    box(0.07, 0.11, 0.87, POST_H, [sx * 0.92, G + 2.025, 0]);
    vpost(sx * 0.92, 0, G + 2.06, G + 2.21, 0.06, POST_V);
  }
  box(2.12, 0.09, 0.08, POST_H, [0, G + 2.245, 0]);

  // =============================================================================================================
  // Roof: a sagging gable of clay tiles, swept from one curved profile
  const roofTop = (z: number) => G + 2.0 + 0.36 * Math.pow(1 - Math.min(1, Math.abs(z) / E), 1.5);
  const roofPts: OP[] = [];
  const NS = 8;
  for (let i = 0; i <= 2 * NS; i++) {
    const z = E - (i / NS) * E;
    roofPts.push([z, roofTop(z), "sharp"]);
  }
  for (let i = 2 * NS; i >= 0; i--) {
    const z = E - (i / NS) * E;
    roofPts.push([z, roofTop(z) - RT, "sharp"]);
  }
  b.extrude(roofPts, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.44, color: ROOF, name: "roof" });
  cyl(0.05, 0.05, 2.52, 8, lit(TILE_D), [0, roofTop(0) + 0.012, 0], [1, 0, 0]);
  for (const s of [1, -1]) {
    cyl(0.078, 0.078, 0.04, 12, lit("#3a4e60"), [s * 1.27, roofTop(0) + 0.012, 0], [1, 0, 0]);
    ball(0.03, BRASS, [s * 1.292, roofTop(0) + 0.012, 0], [0.6, 1, 1], 8, 6);
  }
  for (const sz of [1, -1]) box(2.46, 0.075, 0.03, FASCIA_RED, [0, G + 1.965, sz * 0.905]);
  // gable boards
  for (const s of [1, -1])
    for (const sz of [1, -1]) {
      const z0 = sz * 0.02;
      const z1 = sz * 0.9;
      b.rod([s * 1.225, roofTop(z0) - 0.03, z0], [s * 1.225, roofTop(z1) - 0.03, z1 * 0.98], 0.022, {
        color: FASCIA_RED,
        sides: 4,
      });
    }

  // =============================================================================================================
  // Noren: four indigo panels spelling ラーメン, hung from a bamboo pole under the front eave
  b.rod([-0.88, G + 1.92, 0.8], [0.88, G + 1.92, 0.8], 0.016, { color: BAMBOO, sides: 8 });
  for (const x of [-0.82, 0.82]) b.rod([x, G + 1.905, 0.8], [x, G + 1.96, 0.8], 0.006, { color: IRON, sides: 5 });
  for (let i = 0; i < 4; i++) {
    const geo = new THREE.BoxGeometry(0.385, 0.6, 0.008);
    const uv = geo.getAttribute("uv") as THREE.BufferAttribute;
    for (let k = 0; k < uv.count; k++) uv.setX(k, (i + uv.getX(k)) / 4);
    b.part(geo, "#ffffff", {
      at: [-0.6 + i * 0.4, G + 1.615, 0.805],
      rotation: [0, (i - 1.5) * 2.5, 0],
      texture: NOREN,
      name: `noren${i + 1}`,
    });
  }

  // =============================================================================================================
  // Chochin lanterns at the front corners
  function chochin(x: number, z: number) {
    b.rod([x, G + 1.97, z], [x, G + 1.9, z], 0.007, { color: IRON, sides: 5 });
    b.part(new THREE.TorusGeometry(0.016, 0.004, 4, 8), IRON, { at: [x, G + 1.888, z] });
    b.rod([x, G + 1.875, z], [x, G + 1.815, z], 0.005, { color: "#2a1a14", sides: 5 });
    cyl(0.07, 0.088, 0.05, 12, LACQUER, [x, G + 1.795, z]);
    flatRing(0.088, 0.006, "#c9a24a", [x, G + 1.772, z]);
    const body = b.part(new THREE.SphereGeometry(1, 20, 14), "#ffffff", {
      at: [x, G + 1.555, z],
      scale: [0.17, 0.225, 0.17],
      rotation: [0, -90, 0],
      texture: LANTERN,
      name: "chochin",
    });
    glow(body, 1.4);
    cyl(0.088, 0.07, 0.05, 12, LACQUER, [x, G + 1.335, z]);
    flatRing(0.088, 0.006, "#c9a24a", [x, G + 1.358, z]);
    b.rod([x, G + 1.31, z], [x, G + 1.27, z], 0.005, { color: "#2a1a14", sides: 5 });
    ball(0.014, "#c9a24a", [x, G + 1.265, z], undefined, 8, 6);
    cyl(0.009, 0.026, 0.11, 8, "#c23a2a", [x, G + 1.2, z]);
  }
  chochin(1.05, 0.78);
  chochin(-1.05, 0.78);

  // =============================================================================================================
  // Rooftop andon sign
  const SY = G + 2.62;
  for (const sx of [-0.36, 0.36]) vpost(sx, 0, G + 2.3, SY - 0.15, 0.05, POST_V);
  box(0.94, 0.34, 0.11, lit("#3a2418"), [0, SY, 0]);
  glow(
    b.part(new THREE.PlaneGeometry(0.86, 0.287), "#ffffff", { at: [0, SY, 0.0565], dir: [0, 0, 1], axis: "z", texture: SIGN }),
    1.1,
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.86, 0.287), "#ffffff", { at: [0, SY, -0.0565], dir: [0, 0, -1], axis: "z", texture: SIGN }),
    1.1,
  );
  b.extrude(
    [
      [-0.12, 0, "sharp"],
      [0.12, 0, "sharp"],
      [0.0, 0.07, "sharp"],
    ],
    { at: [0, SY + 0.17, 0], x: [0, 0, 1], thickness: 1.02, color: lit(TILE_D) },
  );
  for (const s of [1, -1]) {
    b.rod([s * 0.47, SY - 0.17, 0], [s * 0.47, SY - 0.24, 0], 0.004, { color: "#2a1a14", sides: 4 });
    cyl(0.006, 0.018, 0.06, 6, "#c23a2a", [s * 0.47, SY - 0.27, 0]);
  }

  // =============================================================================================================
  // Menu board on the right side, tea towel on the left
  b.part(new THREE.BoxGeometry(0.016, 0.33, 0.72), "#ffffff", { at: [-0.967, G + 1.25, 0], texture: MENU, name: "menu" });
  for (const y of [G + 1.075, G + 1.425]) box(0.03, 0.03, 0.86, POST_H, [-0.972, y, 0]);
  const TOWEL = lit(paint((p) => (frac(p.z / 0.03) < 0.5 === frac(p.y / 0.03) < 0.5 ? "#2f4a7a" : "#e9e1cc")));
  box(0.006, 0.26, 0.2, TOWEL, [0.962, G + 1.93, 0.05]);
  box(0.006, 0.18, 0.2, TOWEL, [0.878, G + 1.97, 0.05]);

  // =============================================================================================================
  // Kitchen: stock pot on glowing coals, noodle boiler with tebo baskets, cutting board
  const PX = -0.45;
  const PZ = -0.05;
  cyl(0.21, 0.21, 0.06, 14, IRON, [PX, G + 0.93, PZ]);
  glow(b.part(new THREE.TorusGeometry(0.19, 0.014, 5, 20), "#ff7a2a", { at: [PX, G + 0.962, PZ], dir: [0, 1, 0], axis: "z" }), 1.6);
  b.lathe(
    [
      [0, 0],
      [0.17, 0],
      [0.18, 0.012],
      [0.18, 0.31],
      [0.19, 0.32],
      [0.185, 0.332],
      [0.172, 0.32],
      [0.168, 0.014],
      [0, 0.014],
    ],
    { at: [PX, G + 0.96, PZ], segments: 16, color: STEEL, name: "stockpot" },
  );
  disc(0.17, BROTH, [PX, G + 1.23, PZ], 16);
  for (let k = 0; k < 4; k++) ball(0.02, "#efe2c8", [PX - 0.08 + k * 0.05, G + 1.232, PZ + (k % 2) * 0.06 - 0.03], [1.6, 0.5, 0.8], 6, 4);
  for (const s of [1, -1]) b.part(new THREE.TorusGeometry(0.03, 0.008, 5, 10), STEEL, { at: [PX + s * 0.19, G + 1.23, PZ] });
  b.lathe(
    [
      [0, 0],
      [0.185, 0],
      [0.185, 0.008],
      [0.05, 0.03],
      [0.022, 0.032],
      [0.026, 0.055],
      [0, 0.058],
    ],
    { at: [PX + 0.07, G + 1.295, PZ], axis: [0.22, 0.97, 0], segments: 14, color: STEEL },
  );
  b.rod([PX - 0.08, G + 1.2, PZ - 0.02], [PX + 0.14, G + 1.52, PZ + 0.18], 0.008, { color: STEEL, sides: 6 });

  const BX = 0.42;
  const BZ = -0.08;
  cyl(0.22, 0.22, 0.06, 14, IRON, [BX, G + 0.93, BZ]);
  glow(b.part(new THREE.TorusGeometry(0.205, 0.012, 5, 20), "#ff8a3a", { at: [BX, G + 0.962, BZ], dir: [0, 1, 0], axis: "z" }), 1.4);
  b.lathe(
    [
      [0, 0],
      [0.19, 0],
      [0.2, 0.012],
      [0.2, 0.22],
      [0.21, 0.235],
      [0.205, 0.245],
      [0.19, 0.235],
      [0.188, 0.014],
      [0, 0.014],
    ],
    { at: [BX, G + 0.96, BZ], segments: 16, color: COPPER, name: "boiler" },
  );
  disc(0.19, lit("#c8d2c2"), [BX, G + 1.16, BZ], 16);
  const baskets: [number, number][] = [
    [-0.08, 0.05],
    [0.08, 0.05],
    [0, -0.09],
  ];
  for (const [dx, dz] of baskets) {
    const cx = BX + dx;
    const cz = BZ + dz;
    b.lathe(
      [
        [0, 0],
        [0.045, 0],
        [0.058, 0.13],
        [0.053, 0.13],
        [0.04, 0.006],
        [0, 0.006],
      ],
      { at: [cx, G + 1.08, cz], segments: 10, color: lit("#a3a9b0") },
    );
    flatRing(0.058, 0.004, STEEL, [cx, G + 1.21, cz], 10);
    const l = Math.hypot(dx, dz);
    const ox = dx / l;
    const oz = dz / l;
    b.rod([cx + ox * 0.05, G + 1.205, cz + oz * 0.05], [cx + ox * 0.3, G + 1.36, cz + oz * 0.3], 0.008, {
      color: WHEEL_WOOD,
      sides: 5,
    });
  }

  // cutting board with chopped negi and a knife
  box(0.34, 0.025, 0.18, BOARD, [-0.01, G + 0.9125, 0.25]);
  for (let k = 0; k < 10; k++)
    cyl(0.008, 0.008, 0.006, 7, k % 3 === 0 ? "#e8f0c8" : "#6fba44", [0.03 + R() * 0.08, G + 0.928, 0.21 + R() * 0.08]);
  b.extrude(
    [
      [0, 0],
      [0.15, 0],
      [0.16, 0.012],
      [0.03, 0.035],
      [0, 0.03],
    ],
    { at: [-0.16, G + 0.927, 0.3], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.003, color: STEEL },
  );
  box(0.09, 0.016, 0.022, lit("#3a2418"), [-0.205, G + 0.933, 0.285]);

  // bare bulb under an enamel shade
  b.rod([0, G + 2.2, 0.05], [0, G + 1.83, 0.05], 0.004, { color: "#1a1412", sides: 4 });
  b.lathe(
    [
      [0.015, 0],
      [0.11, -0.065],
      [0.104, -0.07],
      [0.01, -0.008],
    ],
    { at: [0, G + 1.835, 0.05], segments: 14, color: "#3e5a4a" },
  );
  cyl(0.018, 0.018, 0.04, 8, BRASS, [0, G + 1.81, 0.05]);
  glow(ball(0.036, "#ffe0a0", [0, G + 1.772, 0.05], [1, 1.2, 1], 10, 8), 2.0);

  // steam over the pots
  const steamFrames = [
    frame([PX - 0.05, G + 1.3, PZ + 0.02], [0, 1, 0]),
    frame([PX + 0.06, G + 1.32, PZ - 0.05], [0, 1, 0]),
    frame([PX - 0.02, G + 1.33, PZ - 0.08], [0, 1, 0]),
    frame([BX - 0.04, G + 1.22, BZ], [0, 1, 0]),
    frame([BX + 0.06, G + 1.22, BZ - 0.04], [0, 1, 0]),
  ];
  glow(
    b.cards(steamFrames, STEAM, { size: [0.16, 0.36], cross: true, vary: 0.25, spin: 40, rng: rng(9), color: "#f2eee8" }),
    0.35,
  );

  // =============================================================================================================
  // Bowls
  const BOWL_OUT: OP[] = [
    [0, 0],
    [0.04, 0],
    [0.042, 0.012],
    [0.05, 0.014],
    [0.085, 0.05],
    [0.097, 0.08],
    [0.09, 0.083],
    [0.08, 0.056],
    [0.045, 0.023],
    [0, 0.021],
  ];
  function bowl(x: number, y: number, z: number, inverted: boolean, filled: boolean) {
    const up: P3 = inverted ? [0, -1, 0] : [0, 1, 0];
    b.lathe(BOWL_OUT, { at: [x, y, z], axis: up, segments: 16, color: "#f2ede2" });
    const h0 = 0.054;
    const h1 = 0.078;
    const r0 = 0.085 + 0.4 * (h0 - 0.05) + 0.0018;
    const r1 = 0.085 + 0.4 * (h1 - 0.05) + 0.0018;
    const hc = (h0 + h1) / 2;
    b.part(new THREE.CylinderGeometry(r1, r0, h1 - h0, 20, 1, true), "#ffffff", {
      at: [x, inverted ? y - hc : y + hc, z],
      dir: up,
      texture: BAND,
    });
    if (filled)
      b.part(new THREE.CircleGeometry(0.084, 16), "#ffffff", {
        at: [x, y + 0.063, z],
        dir: [0, 1, 0],
        axis: "z",
        up: [0, 0, -1],
        texture: BOWLTOP,
      });
  }

  const RENGE = new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const counterBowls: [number, number][] = [
    [-0.62, 0.58],
    [0.06, 0.6],
  ];
  for (const [x, z] of counterBowls) {
    bowl(x, CT, z, false, true);
    b.part(RENGE, "#f4efe4", { at: [x + 0.035, CT + 0.07, z + 0.025], scale: [0.02, 0.012, 0.03] });
    b.rod([x + 0.035, CT + 0.072, z + 0.05], [x + 0.06, CT + 0.11, z + 0.13], 0.006, { color: "#f4efe4", sides: 5 });
    box(0.03, 0.01, 0.012, lit("#c84a3a"), [x + 0.145, CT + 0.005, z - 0.07]);
    for (const dx of [0.138, 0.152])
      b.rod([x + dx, CT + 0.013, z - 0.09], [x + dx, CT + 0.008, z + 0.12], [0.0045, 0.003], { color: "#d9b88a", sides: 5 });
  }
  glow(
    b.cards(
      counterBowls.map(([x, z]) => frame([x, CT + 0.075, z], [0, 1, 0])),
      STEAM,
      { size: [0.09, 0.2], cross: true, vary: 0.2, spin: 30, rng: rng(12), color: "#f2eee8" },
    ),
    0.3,
  );
  // waribashi in paper sleeves at the empty seat
  box(0.025, 0.006, 0.21, "#f4eee0", [0.7, CT + 0.003, 0.6]);
  box(0.026, 0.007, 0.04, lit("#c4352a"), [0.7, CT + 0.004, 0.66]);

  // chopstick holder
  const CHX = 0.34;
  const CHZ = 0.5;
  b.lathe(
    [
      [0, 0],
      [0.035, 0],
      [0.035, 0.11],
      [0.03, 0.11],
      [0.03, 0.008],
      [0, 0.008],
    ],
    { at: [CHX, CT, CHZ], segments: 10, color: BAMBOO_V },
  );
  for (let k = 0; k < 9; k++) {
    const a = k * 40 * DEG;
    b.rod(
      [CHX + Math.cos(a) * 0.012, CT + 0.012, CHZ + Math.sin(a) * 0.012],
      [CHX + Math.cos(a) * 0.05, CT + 0.215 + (k % 3) * 0.006, CHZ + Math.sin(a) * 0.05],
      [0.0035, 0.0025],
      { color: k % 4 === 0 ? "#8a3a2a" : "#e8cf9e", sides: 4 },
    );
  }
  // shichimi gourd
  b.lathe(
    [
      [0, 0],
      [0.028, 0.004],
      [0.033, 0.025],
      [0.026, 0.048],
      [0.015, 0.058],
      [0.02, 0.072],
      [0.018, 0.088],
      [0.006, 0.095],
      [0, 0.095],
    ],
    { at: [0.46, CT, 0.53], segments: 10, color: lit("#b5302a") },
  );
  flatRing(0.016, 0.003, "#d8b04a", [0.46, CT + 0.058, 0.53], 10);
  cyl(0.006, 0.008, 0.016, 6, "#a8875a", [0.46, CT + 0.1, 0.53]);
  // soy dispenser
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.032, 0.05],
      [0.02, 0.075],
      [0.012, 0.085],
      [0, 0.085],
    ],
    { at: [0.56, CT, 0.5], segments: 10, color: "#2b1a12" },
  );
  cyl(0.016, 0.02, 0.025, 8, "#c8342a", [0.56, CT + 0.095, 0.5]);
  b.rod([0.56, CT + 0.105, 0.5], [0.56, CT + 0.11, 0.53], 0.004, { color: "#c8342a", sides: 4 });
  // pepper shaker
  cyl(0.018, 0.018, 0.07, 8, "#f2ede2", [0.63, CT + 0.035, 0.58]);
  cyl(0.016, 0.019, 0.02, 8, STEEL, [0.63, CT + 0.08, 0.58]);
  // sake tokkuri and ochoko
  const TOKKURI = lit(paint((_p, _n, s) => ((s[0] > 0.06 && s[0] < 0.07) || (s[0] > 0.1 && s[0] < 0.106) ? "#2c4f8c" : "#f3eee2")));
  b.lathe(
    [
      [0, 0],
      [0.035, 0],
      [0.046, 0.045],
      [0.038, 0.09],
      [0.015, 0.12],
      [0.013, 0.148],
      [0.019, 0.156],
      [0, 0.158],
    ],
    { at: [-0.9, CT, 0.55], segments: 12, color: TOKKURI },
  );
  b.lathe(
    [
      [0, 0],
      [0.02, 0],
      [0.026, 0.03],
      [0.022, 0.03],
      [0.016, 0.006],
      [0, 0.006],
    ],
    { at: [-0.82, CT, 0.64], segments: 10, color: "#f3eee2" },
  );
  // water glass
  b.lathe(
    [
      [0, 0],
      [0.032, 0],
      [0.036, 0.1],
      [0.032, 0.1],
      [0.029, 0.006],
      [0, 0.006],
    ],
    { at: [-0.34, CT, 0.62], segments: 10, color: "#cfe4ec" },
  );
  disc(0.031, "#8fb9cf", [-0.34, CT + 0.07, 0.62], 10);

  // paper andon lantern on the counter
  const AX = 0.86;
  const AZ = 0.6;
  box(0.16, 0.018, 0.16, LACQUER, [AX, CT + 0.009, AZ]);
  glow(b.part(new THREE.BoxGeometry(0.13, 0.2, 0.13), "#ffffff", { at: [AX, CT + 0.118, AZ], texture: ANDON, name: "andon" }), 1.0);
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.rod([AX + sx * 0.068, CT + 0.018, AZ + sz * 0.068], [AX + sx * 0.068, CT + 0.218, AZ + sz * 0.068], 0.007, {
        color: LACQUER,
        sides: 4,
      });
  box(0.16, 0.014, 0.16, LACQUER, [AX, CT + 0.225, AZ]);
  b.part(new THREE.TorusGeometry(0.035, 0.005, 4, 10, Math.PI), LACQUER, { at: [AX, CT + 0.232, AZ] });

  // =============================================================================================================
  // Back shelves: bowl stack, bottles, crock, daruma, lucky cat, a little plant
  const SZ = -0.33;
  const LS = G + 1.2325;
  const US = G + 1.5325;
  for (const y of [G + 1.22, G + 1.52]) {
    box(1.77, 0.025, 0.17, BOARD, [0, y, SZ]);
    for (const s of [1, -1]) box(0.03, 0.04, 0.15, POST_H, [s * 0.87, y - 0.03, SZ]);
  }
  for (let k = 0; k < 4; k++) bowl(-0.62, LS + 0.083 + k * 0.022, SZ, true, false);
  const bottle = (x: number, y: number, glass: string, cap: string, h = 1) => {
    b.lathe(
      [
        [0, 0],
        [0.045, 0],
        [0.048, 0.01],
        [0.048, 0.15 * h],
        [0.02, 0.19 * h],
        [0.016, 0.23 * h],
        [0, 0.23 * h],
      ],
      { at: [x, y, SZ], segments: 10, color: glass },
    );
    b.part(new THREE.CylinderGeometry(0.0495, 0.0495, 0.07, 12, 1, true), lit("#efe2c2"), { at: [x, y + 0.08, SZ] });
    cyl(0.019, 0.019, 0.025, 8, cap, [x, y + 0.235 * h, SZ]);
  };
  bottle(-0.3, LS, "#3a1d10", "#c8342a");
  bottle(-0.17, LS, "#2f5a3a", "#d8b04a", 1.1);
  const CROCK = lit(paint((p, _n, s) => (s[0] > 0.085 + 0.02 * noise(p, 0.03, 4) ? "#35577a" : "#8a5a36")));
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.085, 0.06],
      [0.08, 0.12],
      [0.05, 0.14],
      [0.05, 0.15],
      [0, 0.15],
    ],
    { at: [0.2, LS, SZ], segments: 14, color: CROCK },
  );
  cyl(0.055, 0.058, 0.02, 12, WHEEL_WOOD, [0.2, LS + 0.16, SZ]);
  cyl(0.045, 0.045, 0.12, 12, lit("#3f6a4a"), [0.52, LS + 0.06, SZ]);
  for (const y of [0.02, 0.1]) flatRing(0.046, 0.004, BRASS, [0.52, LS + y, SZ], 12);
  cyl(0.047, 0.047, 0.02, 12, BRASS, [0.52, LS + 0.125, SZ]);

  // daruma
  const DX = -0.55;
  ball(0.05, lit("#c42d24"), [DX, US + 0.056, SZ], [1, 1.15, 0.92], 12, 10);
  ball(0.03, "#f4ead8", [DX, US + 0.07, SZ + 0.034], [1, 0.85, 0.45], 10, 8);
  for (const s of [1, -1]) ball(0.006, "#1a1214", [DX + s * 0.011, US + 0.074, SZ + 0.047], [1, 1, 0.5], 6, 4);
  ball(0.022, "#e0b24a", [DX, US + 0.032, SZ + 0.04], [1, 0.5, 0.35], 8, 6);
  for (const s of [1, -1]) box(0.014, 0.004, 0.004, "#1a1214", [DX + s * 0.012, US + 0.086, SZ + 0.045], [0, 0, s * 15]);

  // potted plant
  const PPX = -0.2;
  b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.05, 0.07],
      [0.055, 0.075],
      [0.05, 0.08],
      [0.044, 0.075],
      [0.036, 0.01],
      [0, 0.01],
    ],
    { at: [PPX, US, SZ], segments: 10, color: lit("#b8643a") },
  );
  disc(0.046, "#3a2a20", [PPX, US + 0.068, SZ], 10);
  for (let k = 0; k < 7; k++) {
    const a = (k * 360) / 7 + 15;
    const ca = Math.cos(a * DEG);
    const sa = Math.sin(a * DEG);
    const lift = 0.6 + 0.3 * (k % 2);
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.04, 0.018],
        [0.1, 0.012],
        [0.13, 0, "sharp"],
        [0.1, -0.012],
        [0.04, -0.018],
      ],
      {
        at: [PPX, US + 0.07, SZ],
        x: [ca * (1 - lift * 0.5), lift, sa * (1 - lift * 0.5)],
        y: [-sa, 0, ca],
        thickness: 0.003,
        smoothing: 1,
        color: lit(k % 2 ? "#5f9a3e" : "#4a8034"),
      },
    );
  }

  // stack of folded towels
  const towels = ["#e7d7b0", "#9fb7c8", "#d98e7a"];
  towels.forEach((c, k) => box(0.14, 0.025, 0.1, lit(c), [0.12, US + 0.0125 + k * 0.026, SZ], [0, k * 6 - 6, 0]));

  // maneki-neko
  const MX = 0.48;
  const CAT = "#f7f1e6";
  ball(0.042, CAT, [MX, US + 0.05, SZ], [1, 1.2, 0.86], 12, 10);
  ball(0.04, CAT, [MX, US + 0.118, SZ], [1, 0.88, 0.85], 12, 10);
  for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(0.014, 0.026, 4), s > 0 ? CAT : "#e8a050", {
      at: [MX + s * 0.024, US + 0.148, SZ],
      dir: [s * 0.4, 1, 0],
    });
  ball(0.018, "#e8a050", [MX + 0.018, US + 0.138, SZ + 0.008], [1, 0.6, 1], 8, 6);
  flatRing(0.031, 0.006, "#c8342a", [MX, US + 0.088, SZ], 12);
  ball(0.009, "#e0b24a", [MX, US + 0.083, SZ + 0.035], undefined, 8, 6);
  b.capsule([MX - 0.03, US + 0.08, SZ + 0.012], [MX - 0.036, US + 0.14, SZ + 0.018], 0.011, { color: CAT, sides: 6 });
  b.capsule([MX + 0.022, US + 0.05, SZ + 0.03], [MX + 0.014, US + 0.035, SZ + 0.036], 0.01, { color: CAT, sides: 6 });
  ball(0.016, "#e8c45a", [MX + 0.008, US + 0.04, SZ + 0.042], [1, 1.4, 0.3], 8, 6);
  for (const s of [1, -1]) ball(0.005, "#1a1214", [MX + s * 0.014, US + 0.122, SZ + 0.033], [1.2, 0.5, 0.5], 6, 4);
  ball(0.004, "#e07a8a", [MX, US + 0.112, SZ + 0.035], undefined, 6, 4);

  // =============================================================================================================
  // Furin wind chime under the back-left eave
  const FX = 1.0;
  const FZ = -0.78;
  b.rod([FX, G + 1.96, FZ], [FX, G + 1.875, FZ], 0.003, { color: "#c8342a", sides: 4 });
  b.lathe(
    [
      [0, 0.05],
      [0.02, 0.047],
      [0.036, 0.03],
      [0.042, 0.0],
      [0.038, 0.0],
      [0.032, 0.028],
      [0.018, 0.042],
      [0, 0.045],
    ],
    { at: [FX, G + 1.83, FZ], segments: 12, color: "#bfe6ef" },
  );
  ball(0.008, "#e85a3a", [FX + 0.03, G + 1.85, FZ + 0.025], [1.4, 0.8, 0.5], 6, 4);
  b.rod([FX, G + 1.87, FZ], [FX, G + 1.74, FZ], 0.002, { color: "#f0e6d0", sides: 3 });
  box(0.04, 0.13, 0.003, "#e86a7a", [FX, G + 1.675, FZ], [0, 20, 0]);

  // =============================================================================================================
  // Stools
  function stool(x: number, z: number, yaw: number, seed: number, a: string, c: string) {
    const top = G + 0.55;
    const wood = stoolWood(x, z, a, c, seed);
    b.lathe(
      [
        [0, 0],
        [0.15, 0],
        [0.17, 0.012],
        [0.172, 0.038],
        [0.158, 0.05],
        [0, 0.05],
      ],
      { at: [x, top - 0.05, z], segments: 14, color: wood },
    );
    const tops: THREE.Vector3[] = [];
    const bots: THREE.Vector3[] = [];
    for (let k = 0; k < 4; k++) {
      const ang = (yaw + 45 + k * 90) * DEG;
      const t = new THREE.Vector3(x + Math.cos(ang) * 0.105, top - 0.05, z + Math.sin(ang) * 0.105);
      const bt = new THREE.Vector3(x + Math.cos(ang) * 0.16, G, z + Math.sin(ang) * 0.16);
      tops.push(t);
      bots.push(bt);
      b.rod(t, bt, [0.02, 0.017], { color: wood, sides: 6 });
    }
    for (let k = 0; k < 4; k++) {
      const f = k % 2 ? 0.62 : 0.72;
      const p0 = tops[k].clone().lerp(bots[k], f);
      const p1 = tops[(k + 1) % 4].clone().lerp(bots[(k + 1) % 4], f);
      b.rod(p0, p1, 0.01, { color: wood, sides: 5 });
    }
  }
  stool(-0.62, 1.05, 10, 31, "#b07a46", "#8c5a32");
  stool(0.02, 1.08, -8, 32, "#c08a52", "#9a683a");
  stool(0.64, 1.04, 25, 33, "#a26c3c", "#7e4e2a");
  b.lathe(
    [
      [0, 0],
      [0.14, 0],
      [0.16, 0.012],
      [0.165, 0.025],
      [0.15, 0.038],
      [0, 0.042],
    ],
    { at: [0.02, G + 0.55, 1.08], segments: 14, color: ICHIMATSU },
  );
  for (const s of [1, -1]) cyl(0.004, 0.012, 0.03, 5, "#e0b24a", [0.02 + s * 0.11, G + 0.585, 1.08 + s * 0.11]);

  // =============================================================================================================
  // Crate of bottles and a water bucket beside the cart
  const KX = 1.28;
  const KZ = -0.82;
  box(0.36, 0.22, 0.28, CRATE, [KX, G + 0.11, KZ]);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 2; j++) {
      const x = KX - 0.11 + i * 0.11;
      const z = KZ - 0.065 + j * 0.13;
      b.lathe(
        [
          [0, 0],
          [0.03, 0],
          [0.03, 0.12],
          [0.014, 0.15],
          [0.012, 0.19],
          [0, 0.19],
        ],
        { at: [x, G + 0.06, z], segments: 8, color: "#4a2a14" },
      );
      cyl(0.014, 0.014, 0.01, 8, "#d8b04a", [x, G + 0.255, z]);
    }

  const UX = -1.32;
  const UZ = -0.78;
  const staves = grain("#9a6e3e", "#7c5430", { size: 0.008, axis: "y", seed: 41 });
  const BUCKET = lit(grime(paint((_p, _n, s) => (frac(s[1] / 22.5) < 0.07 ? SEAM : staves))));
  b.lathe(
    [
      [0, 0],
      [0.12, 0],
      [0.14, 0.24],
      [0.13, 0.24],
      [0.11, 0.02],
      [0, 0.02],
    ],
    { at: [UX, G, UZ], segments: 16, color: BUCKET },
  );
  for (const h of [0.05, 0.19]) {
    const r = 0.12 + (0.02 * h) / 0.24;
    b.lathe(
      [
        [r - 0.003, h - 0.012],
        [r + 0.006, h - 0.012],
        [r + 0.006, h + 0.012],
        [r - 0.003, h + 0.012],
      ],
      { at: [UX, G, UZ], segments: 16, color: COPPER },
    );
  }
  disc(0.128, "#3d5a78", [UX, G + 0.2, UZ], 16);
  cyl(0.03, 0.026, 0.045, 8, WHEEL_WOOD, [UX + 0.04, G + 0.215, UZ + 0.02]);
  b.rod([UX + 0.06, G + 0.23, UZ + 0.03], [UX + 0.2, G + 0.38, UZ + 0.1], 0.007, { color: WHEEL_WOOD, sides: 5 });

  // =============================================================================================================
  // Fallen leaves and grass tufts on the cobbles
  const ground = b.surface(base);
  const leafHits = ground.scatter(16, {
    rng: rng(21),
    minDist: 0.22,
    filter: (h) => h.n.y > 0.9 && !(Math.abs(h.at.x) < 1.15 && h.at.z > -0.55 && h.at.z < 0.8),
  });
  b.cards(leafHits, LEAF, {
    size: 0.075,
    lean: 90,
    flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
    mirror: true,
    color: LEAF_TINT,
    vary: 0.3,
    rng: rng(5),
  });
  const grassHits = ground.scatter(40, {
    rng: rng(23),
    minDist: 0.12,
    filter: (h) => h.n.y > 0.9 && (Math.abs(h.at.x) > 1.42 || h.at.z > 1.3 || h.at.z < -1.22),
  });
  b.cards(grassHits, GRASS, {
    size: [0.1, 0.12],
    cross: true,
    lean: 8,
    vary: 0.35,
    spin: 60,
    rng: rng(24),
    color: GRASS_TINT,
  });

  return b.root;
}
