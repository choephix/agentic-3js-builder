```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  createBuilder,
  frame,
  rng,
  svg,
  paint,
  noise,
  mix,
  smoothstep,
  scales,
  mottle,
  grain,
  catmull,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Haunted Victorian Dollhouse",
  description:
    "A gothic open-front dollhouse on a plinth: a turret, a steep cross-gabled wing with a porch, furnished haunted rooms with ghosts, glowing windows, bats, an iron-fenced graveyard yard and a dead tree.",
};

type V3 = [number, number, number];
type Pt = [number, number] | [number, number, "sharp"];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
type Col = string | ReturnType<typeof paint>;

const fract = (x: number) => x - Math.floor(x);
const hash2 = (a: number, c: number) => {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(c | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// ---------------------------------------------------------------------------------------------------------------
// Textures (SVG drawings)

const archD = (x0: number, x1: number, ys: number, yb: number) => {
  const w = x1 - x0;
  return `M${x0} ${yb}V${ys}A${w} ${w} 0 0 1 ${(x0 + x1) / 2} ${(ys - 0.866 * w).toFixed(2)}A${w} ${w} 0 0 1 ${x1} ${ys}V${yb}Z`;
};
const ARCH = archD(0, 60, 52, 99);

const star = (cx: number, cy: number, r: number) => {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    d += `${i ? "L" : "M"}${(cx + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`;
  }
  return d + "Z";
};

const T_PARLOR = (() => {
  let panels = "";
  for (let i = 0; i < 9; i++)
    panels += `<rect x="${(3 + i * 15.7).toFixed(1)}" y="44" width="13" height="12" fill="#2f1e16" stroke="#4a3022" stroke-width="1.2"/>`;
  return svg(
    `<svg viewBox="0 0 142 60">
    <defs>
      <pattern id="d" width="14" height="16" patternUnits="userSpaceOnUse">
        <rect width="14" height="16" fill="#4a1c2c"/>
        <path d="M7 1C11 4 11 8 7 10C3 8 3 4 7 1Z" fill="#6c2b42"/>
        <path d="M7 10C9 12 12 12 14 10C13 14 10 15 7 16C4 15 1 14 0 10C2 12 5 12 7 10Z" fill="#59243a"/>
        <circle cx="7" cy="5" r="1.1" fill="#c9a24a"/>
        <circle cx="0" cy="0" r="1" fill="#8a6a3a"/><circle cx="14" cy="8" r="1" fill="#8a6a3a"/>
      </pattern>
      <radialGradient id="v" cx="0.5" cy="0.45" r="0.75"><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient>
    </defs>
    <rect width="142" height="60" fill="url(#d)"/>
    <path d="M20 4C18 16 24 22 20 34 M96 4C99 14 93 24 97 36 M120 4C118 12 122 18 119 26" stroke="#120708" stroke-width="3" opacity="0.28" fill="none"/>
    <rect y="40.5" width="142" height="19.5" fill="#241610"/>
    ${panels}
    <rect y="38" width="142" height="2.6" fill="#6a4a2e"/><rect y="38" width="142" height="0.8" fill="#9a7448"/>
    <rect width="142" height="3.4" fill="#2a1a14"/><rect y="3.4" width="142" height="1" fill="#b08d4a"/>
    <rect width="142" height="60" fill="url(#v)"/>
  </svg>`,
    { size: 512 },
  );
})();

const T_NURSERY = (() => {
  let stripes = "";
  for (let i = 0; i < 21; i++) stripes += `<rect x="${i * 7}" width="3.5" height="40" fill="#5c6e78"/>`;
  let motifs = "";
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 6; c++) {
      const cx = 12 + c * 24 + (r % 2) * 12;
      const cy = 9 + r * 11;
      motifs += (c + r) % 3 === 0 ? `<circle cx="${cx}" cy="${cy}" r="2.6" fill="#a9b39a"/>` : `<path d="${star(cx, cy, 2.8)}" fill="#a9b39a"/>`;
    }
  let beads = "";
  for (let i = 0; i < 36; i++) beads += `<path d="M${i * 4 + 2} 41V60" stroke="#1d302c" stroke-width="0.7"/>`;
  return svg(
    `<svg viewBox="0 0 142 60">
    <rect width="142" height="60" fill="#4f5f69"/>
    ${stripes}${motifs}
    <path d="M96 3L112 5L118 14L108 22L112 30L98 28L92 18Z" fill="#a39c86" stroke="#d2cab0" stroke-width="1"/>
    <path d="M98 8L108 10M100 16L110 17M104 22L100 26" stroke="#6d6652" stroke-width="0.8"/>
    <path d="M12 4C10 14 16 20 12 32" stroke="#10181a" stroke-width="3" opacity="0.25" fill="none"/>
    <rect y="40.5" width="142" height="19.5" fill="#2f4a44"/>${beads}
    <rect y="38" width="142" height="2.8" fill="#7c8f86"/><rect y="38" width="142" height="0.8" fill="#a9bab0"/>
    <rect width="142" height="3.4" fill="#26302f"/><rect y="3.4" width="142" height="1" fill="#9aa59a"/>
  </svg>`,
    { size: 512 },
  );
})();

const T_WIN_LIT = svg(
  `<svg viewBox="0 0 60 99">
  <defs><clipPath id="c"><path d="${ARCH}"/></clipPath>
  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eaffa0"/><stop offset="0.6" stop-color="#b5f56c"/><stop offset="1" stop-color="#6fc85a"/></linearGradient></defs>
  <g clip-path="url(#c)">
    <rect width="60" height="99" fill="url(#g)"/>
    <ellipse cx="30" cy="72" rx="22" ry="30" fill="#f6ffc8"/>
    <path d="M0 0H14C10 30 16 60 6 99H0Z" fill="#3b1f4a"/>
    <path d="M60 0H46C50 30 44 60 54 99H60Z" fill="#3b1f4a"/>
    <path d="M25 99C23 82 26 70 30 66C34 70 37 82 35 99Z" fill="#5f9a52"/>
    <g stroke="#1a1420" stroke-width="2.6" fill="none"><path d="M30 0V99M0 52H60M0 76H60"/><circle cx="30" cy="30" r="11"/><path d="M30 19V41M19 30H41"/></g>
  </g>
  <path d="${ARCH}" fill="none" stroke="#1a1420" stroke-width="4"/>
</svg>`,
  { size: 384 },
);

const T_WIN_MOON = svg(
  `<svg viewBox="0 0 60 99">
  <defs><clipPath id="c"><path d="${ARCH}"/></clipPath>
  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16163f"/><stop offset="1" stop-color="#4a5a9a"/></linearGradient></defs>
  <g clip-path="url(#c)">
    <rect width="60" height="99" fill="url(#g)"/>
    <circle cx="38" cy="30" r="12" fill="#f4efd0"/><circle cx="34" cy="27" r="2.6" fill="#d9d2ac"/><circle cx="41" cy="35" r="1.8" fill="#d9d2ac"/>
    <path d="${star(10, 14, 2)} ${star(50, 62, 2)} ${star(14, 48, 1.6)}" fill="#fff6c8"/>
    <path d="M0 80C14 74 22 70 30 56C34 50 42 48 52 40M30 56C28 46 22 40 14 38M44 44C46 38 52 34 58 34" stroke="#0b0912" stroke-width="2.4" fill="none"/>
    <path d="M10 62C14 58 18 60 20 64C22 60 26 58 30 62C26 63 24 66 20 68C16 66 12 64 10 62Z" fill="#0b0912"/>
    <g stroke="#1a1420" stroke-width="2.6" fill="none"><path d="M30 0V99M0 52H60"/><circle cx="30" cy="30" r="11"/></g>
  </g>
  <path d="${ARCH}" fill="none" stroke="#1a1420" stroke-width="4"/>
</svg>`,
  { size: 384 },
);

const T_LADY = svg(
  `<svg viewBox="0 0 60 80">
  <defs><radialGradient id="bg" cx="0.5" cy="0.4" r="0.8"><stop offset="0" stop-color="#3a3a2a"/><stop offset="1" stop-color="#0e0d0a"/></radialGradient></defs>
  <rect width="60" height="80" fill="url(#bg)"/>
  <path d="M4 80C6 58 18 52 30 52C42 52 54 58 56 80Z" fill="#14101a"/>
  <path d="M20 54L30 68L40 54C36 50 24 50 20 54Z" fill="#cfc8b0"/>
  <path d="M24 53L30 61L36 53" stroke="#8b8570" fill="none" stroke-width="1"/>
  <rect x="26" y="44" width="8" height="11" fill="#aeb8a4"/>
  <ellipse cx="30" cy="32" rx="12" ry="16" fill="#b9c4ae"/>
  <path d="M17 30C14 10 28 4 30 4C34 4 47 10 43 30C41 20 36 14 30 14C24 14 19 20 17 30Z" fill="#17120f"/>
  <circle cx="30" cy="6" r="6" fill="#17120f"/>
  <ellipse cx="24" cy="34" rx="3.8" ry="2.6" fill="#0b1a10"/><circle cx="24" cy="34" r="1.9" fill="#7dff9a"/>
  <ellipse cx="36" cy="34" rx="3.8" ry="2.6" fill="#0b1a10"/><circle cx="36" cy="34" r="1.9" fill="#7dff9a"/>
  <path d="M20 29Q24 27 28 29M32 29Q36 27 40 29" stroke="#17120f" stroke-width="1.2" fill="none"/>
  <path d="M30 36L28.5 43L31 43.5" stroke="#6d7866" fill="none" stroke-width="1"/>
  <path d="M25 47Q30 49.5 35 47" stroke="#4a2a30" stroke-width="1.4" fill="none"/>
  <ellipse cx="22" cy="42" rx="3" ry="4" fill="#5b6a58" opacity="0.5"/><ellipse cx="38" cy="42" rx="3" ry="4" fill="#5b6a58" opacity="0.5"/>
  <circle cx="30" cy="66" r="2.6" fill="#c9a24a"/>
  <path d="M8 8L22 30L18 52M52 70L40 58" stroke="#000" stroke-width="0.7" opacity="0.6" fill="none"/>
</svg>`,
  { size: 256 },
);

const T_MAN = svg(
  `<svg viewBox="0 0 60 80">
  <defs><radialGradient id="bg" cx="0.5" cy="0.4" r="0.8"><stop offset="0" stop-color="#2c2a3a"/><stop offset="1" stop-color="#0b0a10"/></radialGradient></defs>
  <rect width="60" height="80" fill="url(#bg)"/>
  <path d="M2 80C4 60 16 54 30 54C44 54 56 60 58 80Z" fill="#17131c"/>
  <path d="M22 54L30 80L38 54Z" fill="#cfc8b0"/><path d="M27 58L30 70L33 58Z" fill="#7a1a24"/>
  <rect x="24" y="44" width="12" height="12" fill="#b6b9a8"/>
  <ellipse cx="30" cy="31" rx="13" ry="17" fill="#c0c2b0"/>
  <path d="M17 30C16 14 24 10 30 10C36 10 44 14 43 30C42 24 40 20 38 18C34 20 26 20 22 18C20 20 18 24 17 30Z" fill="#26222a"/>
  <path d="M17 32C14 38 16 46 21 48C19 42 19 36 20 32ZM43 32C46 38 44 46 39 48C41 42 41 36 40 32Z" fill="#2a2630"/>
  <ellipse cx="24" cy="36" rx="3.6" ry="2.4" fill="#0b0a10"/><circle cx="24" cy="36" r="1.8" fill="#ff4a3a"/>
  <ellipse cx="36" cy="36" rx="3.6" ry="2.4" fill="#0b0a10"/><circle cx="36" cy="36" r="1.8" fill="#ff4a3a"/>
  <path d="M19 31L28 33M41 31L32 33" stroke="#26222a" stroke-width="1.6"/>
  <path d="M30 37L28 45L32 45" stroke="#70746a" fill="none" stroke-width="1"/>
  <path d="M23 50Q30 54 37 50" stroke="#3a1a20" stroke-width="1.6" fill="none"/>
  <path d="M26 51L26.8 52.6M30 52L30 53.8M34 51L33.2 52.6" stroke="#e8e0c8" stroke-width="0.8"/>
</svg>`,
  { size: 256 },
);

const T_CLOCK = (() => {
  const nums = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  let t = "";
  nums.forEach((n, k) => {
    const a = (k * Math.PI) / 6;
    t += `<text x="${(50 + 35 * Math.sin(a)).toFixed(1)}" y="${(53.5 - 35 * Math.cos(a)).toFixed(1)}" text-anchor="middle" font-family="serif" font-weight="bold" font-size="10" fill="#2a1d10">${n}</text>`;
  });
  return svg(
    `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="#e8dfc4" stroke="#c9a24a" stroke-width="4"/>
    <circle cx="50" cy="50" r="44" fill="none" stroke="#2a1d10" stroke-width="1.2"/>
    ${t}
    <path d="M48.5 52L47.5 22L50 15L52.5 22L51.5 52Z" fill="#14101a"/>
    <path d="M48.8 52L48 30L50 24L51 30L51.2 52Z" fill="#14101a" transform="rotate(-8 50 50)"/>
    <circle cx="50" cy="50" r="4" fill="#c9a24a" stroke="#14101a" stroke-width="1.5"/>
  </svg>`,
    { size: 192 },
  );
})();

const T_DOOR = svg(
  `<svg viewBox="0 0 44 88">
  <rect width="44" height="88" fill="#2b1a26"/>
  <path d="${archD(7, 37, 34, 34)}" fill="#b8ff6a"/>
  <path d="M22 8V34M7 24H37" stroke="#14101a" stroke-width="2.2"/>
  <path d="${archD(7, 37, 34, 34)}" fill="none" stroke="#14101a" stroke-width="2.4"/>
  <path d="${archD(5, 20, 56, 84)}" fill="#3b2434" stroke="#140c12" stroke-width="1.6"/>
  <path d="${archD(24, 39, 56, 84)}" fill="#3b2434" stroke="#140c12" stroke-width="1.6"/>
  <path d="${archD(8, 17, 58, 80)}" fill="none" stroke="#5a3a4c" stroke-width="1"/>
  <path d="${archD(27, 36, 58, 80)}" fill="none" stroke="#5a3a4c" stroke-width="1"/>
  <path d="M0 42H20L22 44L20 46H0ZM44 42H24L22 44L24 46H44Z" fill="#14101a"/>
  <path d="M0 72H20L22 74L20 76H0ZM44 72H24L22 74L24 76H44Z" fill="#14101a"/>
  <circle cx="19" cy="62" r="3.4" fill="none" stroke="#c9a24a" stroke-width="1.6"/><circle cx="19" cy="57.6" r="1.6" fill="#c9a24a"/>
  <circle cx="25" cy="62" r="3.4" fill="none" stroke="#c9a24a" stroke-width="1.6"/><circle cx="25" cy="57.6" r="1.6" fill="#c9a24a"/>
  <path d="M22 36V88" stroke="#0e0810" stroke-width="1.4"/>
  <circle cx="12" cy="50" r="0.9" fill="#c9a24a"/><circle cx="32" cy="50" r="0.9" fill="#c9a24a"/>
  <rect width="44" height="88" fill="none" stroke="#d9cfb2" stroke-width="3"/>
</svg>`,
  { size: 320 },
);

const T_GHOSTFACE = svg(
  `<svg viewBox="0 0 40 40">
  <ellipse cx="13" cy="16" rx="4.4" ry="6.5" fill="#1b2230"/><ellipse cx="27" cy="16" rx="4.4" ry="6.5" fill="#1b2230"/>
  <circle cx="14.4" cy="13.6" r="1.4" fill="#9fe8d0"/><circle cx="28.4" cy="13.6" r="1.4" fill="#9fe8d0"/>
  <ellipse cx="20" cy="31" rx="4" ry="5.2" fill="#1b2230"/>
</svg>`,
  { size: 128 },
);

const T_BAT = (() => {
  const wing = "M48 24C44 14 30 8 4 10C10 14 12 20 12 26C16 22 20 24 22 30C26 26 30 28 33 34C38 30 44 32 48 38Z";
  return svg(
    `<svg viewBox="0 0 100 50">
    <g fill="#1a1424">
      <path d="${wing}"/><path d="${wing}" transform="matrix(-1 0 0 1 100 0)"/>
      <ellipse cx="50" cy="28" rx="4.8" ry="10"/><circle cx="50" cy="16" r="4.8"/>
      <path d="M45.5 14L44.5 5L49 11Z"/><path d="M54.5 14L55.5 5L51 11Z"/>
    </g>
    <circle cx="48.4" cy="16" r="1.1" fill="#ff4a3a"/><circle cx="51.6" cy="16" r="1.1" fill="#ff4a3a"/>
  </svg>`,
    { size: 256 },
  );
})();

const T_WEB = (() => {
  const N = 6;
  let d = "";
  for (let i = 0; i < N; i++) {
    const a = ((i * 90) / (N - 1) / 180) * Math.PI;
    d += `M0 0L${(98 * Math.cos(a)).toFixed(1)} ${(98 * Math.sin(a)).toFixed(1)}`;
  }
  for (const r of [22, 40, 58, 76, 94])
    for (let i = 0; i < N - 1; i++) {
      const a0 = ((i * 90) / (N - 1) / 180) * Math.PI;
      const a1 = (((i + 1) * 90) / (N - 1) / 180) * Math.PI;
      const am = (a0 + a1) / 2;
      d += `M${(r * Math.cos(a0)).toFixed(1)} ${(r * Math.sin(a0)).toFixed(1)}Q${(r * 0.86 * Math.cos(am)).toFixed(1)} ${(r * 0.86 * Math.sin(am)).toFixed(1)} ${(r * Math.cos(a1)).toFixed(1)} ${(r * Math.sin(a1)).toFixed(1)}`;
    }
  return svg(
    `<svg viewBox="0 0 100 100"><path d="${d}" stroke="#e6e8dc" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>`,
    { size: 256 },
  );
})();

const T_SMOKE = svg(
  `<svg viewBox="0 0 64 128">
  <g fill="#6f7f78"><circle cx="31" cy="112" r="14"/><circle cx="37" cy="92" r="13"/><circle cx="29" cy="72" r="15"/><circle cx="39" cy="50" r="17"/><circle cx="31" cy="26" r="20"/></g>
  <g fill="#a9bbb0"><circle cx="28" cy="109" r="9"/><circle cx="34" cy="89" r="8"/><circle cx="26" cy="68" r="10"/><circle cx="36" cy="46" r="11"/><circle cx="28" cy="22" r="13"/></g>
</svg>`,
  { size: 160 },
);

// ---------------------------------------------------------------------------------------------------------------
// Paints

const IRON = metal("iron", { tarnish: 0.6 });
const BRASS = metal("brass", { tarnish: 0.55, verdigris: 0.5, polish: 0.1 });
const GILT = metal("gilt", { tarnish: 0.35 });
const COPPER = metal("copper", { verdigris: 0.85 });

const SID = paint((p, n) => {
  const f = fract((p.y - 0.05) / 0.02);
  let c = mix("#3b2c4d", "#4f3b66", noise(p, 0.06, 3));
  if (f < 0.1) c = mix(c, "#0e0a14", 0.7);
  else if (f < 0.2) c = mix(c, "#9a86b8", 0.14);
  c = mix(c, "#2c3a22", smoothstep(0.16, 0.05, p.y) * (0.3 + 0.5 * noise(p, 0.03, 9)));
  c = mix(c, "#0b090f", smoothstep(0.4, 0.95, noise(p, 0.12, 21)) * 0.25);
  return n.y > 0.8 ? mix(c, "#556b45", 0.3) : c;
});

const paperSide = paint((p) => {
  const upper = p.y > 0.36;
  const m = p.y - (upper ? 0.37 : 0.05);
  let c: string | readonly [number, number, number];
  if (m < 0.085) c = upper ? "#2f4a44" : "#2a1a14";
  else if (m < 0.1) c = upper ? "#7c8f86" : "#6a4a2e";
  else if (m > 0.3) c = "#2a1a14";
  else {
    const k = fract(p.z / 0.026);
    c = upper ? (k < 0.5 ? "#4f5f69" : "#5c6e78") : k < 0.5 ? "#4a1c2c" : "#58233a";
    if (k < 0.06 || k > 0.94) c = upper ? "#7d8e93" : "#8a6a3a";
  }
  return mix(c, "#150d0f", 0.45 * smoothstep(0.6, 0.9, noise(p, 0.1, 5)));
});

const wallLeft = paint((_p, n) => (n.x > 0.5 ? paperSide : SID));
const wallWing = paint((p, n) => (n.x < -0.5 && p.x < 0.25 ? paperSide : SID));

const planksP = paint((p) => {
  const row = Math.floor(p.z / 0.03);
  const f = fract(p.z / 0.03);
  const col = Math.floor(p.x / 0.2 + hash2(row, 3));
  let c = mix("#3a2518", "#5a3a24", hash2(row, col));
  c = mix(c, "#24150e", noise(p, 0.02, 7) * 0.5);
  return f < 0.07 ? mix(c, "#0d0705", 0.8) : c;
});
const plasterP = mottle("#8d8576", "#5f594e", { size: 0.06, seed: 2 });
const slabP = paint((_p, n) => (n.y > 0.5 ? planksP : n.y < -0.5 ? plasterP : "#2a2034"));

const checker = paint((p) => {
  const k = (Math.floor(p.x / 0.045) + Math.floor(p.z / 0.045)) & 1;
  return k ? mix("#d8d2c2", "#a8a28f", noise(p, 0.05, 2)) : mix("#17131d", "#2a2432", noise(p, 0.05, 3));
});
const rugP = paint((p) => {
  const r = Math.hypot(p.x + 0.12, p.z - 0.0) / 0.13;
  if (r > 0.93) return "#c9a24a";
  if (r > 0.82) return "#2a0f1a";
  if (r > 0.7 && r < 0.74) return "#c9a24a";
  const a = Math.atan2(p.z, p.x + 0.12);
  return Math.abs(Math.sin(a * 4)) < 0.15 && r < 0.6 ? "#8a6a3a" : mix("#6b1f33", "#4a1424", noise(p, 0.03, 4));
});
const brickP = paint((p, n) => {
  const h = Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x;
  const row = Math.floor(p.y / 0.012);
  const u = h / 0.026 + (row & 1) * 0.5;
  if (fract(u) < 0.07 || fract(p.y / 0.012) < 0.12) return "#2a2428";
  return mix(mix("#6e3b32", "#8a4a3a", hash2(row, Math.floor(u))), "#2a2a2a", noise(p, 0.04, 6) * 0.5);
});
const STONE = mottle("#6b6978", "#46444f", { size: 0.04 });
const STONE_D = mottle("#55525f", "#34323c", { size: 0.05, seed: 4 });
const GROUND = paint((p) => {
  const c = mix("#2a3322", "#3f4a2c", noise(p, 0.08, 12));
  return mix(c, "#4a3a2a", smoothstep(0.55, 0.7, noise(p, 0.05, 31)));
});
const PLINTH = grain("#2c1d24", "#171018", { size: 0.01, axis: "x" });
const WOOD_V = grain("#5a3a26", "#3a2418", { size: 0.01, axis: "y" });
const WOOD_H = grain("#5a3a26", "#3a2418", { size: 0.01, axis: "x" });
const BARK = grain("#3a2a30", "#1c141a", { size: 0.008, axis: "y" });
const BONEP = mottle("#dcd2b6", "#b3a78a", { size: 0.05 });
const VELVET = mottle("#6b2340", "#44122a", { size: 0.03 });
const CURTAIN = mottle("#4a2a5c", "#2a163a", { size: 0.04 });
const LINEN = mottle("#d6cdb6", "#b4aa92", { size: 0.03 });
const BLANKET = mottle("#7a2434", "#561826", { size: 0.04 });
const TOMB = paint((p, n) =>
  mix(mix("#7a7886", "#555362", noise(p, 0.03, 2)), "#4d6b3a", smoothstep(0.3, 0.9, n.y) * 0.6 * noise(p, 0.03, 8)),
);
const TURRET = scales(["#41365a", "#4a3e66", "#372e4d"], "#150f1f", { size: 0.03, width: 0.16 });
const SLATE = ["#2b3447", "#343e55", "#262d3f", "#3a4560"];
const MOSS = "#4d6b3a";

const shingles = (coord: (p: THREE.Vector3) => [number, number], w: number, h: number) =>
  paint((p, n) => {
    const [along, across] = coord(p);
    const u = along / h;
    const row = Math.floor(u);
    const fu = u - row;
    const v = across / w + (row & 1) * 0.5;
    const col = Math.floor(v);
    const fv = v - col;
    const id = hash2(row, col);
    let c = mix(SLATE[Math.floor(id * 4) % 4], SLATE[(Math.floor(id * 4) + 1) % 4], noise(p, 0.05, 4));
    if (fv < 0.07 || fv > 0.93 || fu < 0.12) c = mix(c, "#0d0f16", 0.75);
    else if (fu < 0.2) c = mix(c, "#8ea0c4", 0.12);
    return mix(c, MOSS, 0.5 * smoothstep(0.58, 0.75, noise(p, 0.06, 8)) * smoothstep(-0.2, 0.6, n.y));
  });
const BOARDS = paint((p) => {
  const f = fract(p.y / 0.03 + p.z / 0.05);
  return mix(mix("#3a2a20", "#4c3628", noise(p, 0.03, 5)), "#0e0907", f < 0.08 ? 0.8 : 0);
});

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "haunted_dollhouse", paintSize: 2048 });
  const R = rng(1887);

  // house constants
  const X0 = -0.55,
    X1 = 0.55,
    XS = 0.19,
    ZB = -0.29,
    ZF = 0.19,
    WT = 0.02;
  const PY = 0.05,
    F1 = 0.37,
    F2 = 0.69,
    SL = 0.02;
  const BZ = ZB + WT;
  const RUN = 0.24,
    RISE = 0.33,
    RIDGE = F2 + RISE,
    ZR = ZB + RUN;
  const CEIL1 = F1 - SL,
    CEIL2 = F2 - SL;

  // palette (flat colours)
  const INKC = "#17121f";
  const BONE = "#d9cfb2";
  const WAX = "#e9dfc4";
  const FLAME = "#ffb43a";
  const EMBER = "#ff6a1a";
  const GREENG = "#a6ff6e";
  const REDEYE = "#ff3b2a";
  const GHOST = "#d4f0e2";
  const CHAR = "#1b1512";
  const LANTERNG = "#ffd36a";
  const BOOKC = ["#5a1a1a", "#1f3a2e", "#2a2a52", "#6b5a2a"];

  // ---------------------------------------------------------------- helpers
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, color: Col, o: Any = {}) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), color, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
      ...o,
    });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: Col, at: V3, o: Any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, ...o });
  const ball = (r: number, color: Col, at: V3, seg = 8, scale?: V3, o: Any = {}) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(3, Math.round(seg / 2))), color, {
      at,
      ...(scale ? { scale } : {}),
      ...o,
    });
  const rod = (a: V3, c: V3, r: number, color: Col, o: Any = {}) => b.rod(a, c, r, color, o);
  const spike = (a: V3, d: V3, len: number, r: number, color: Col, o: Any = {}) =>
    b.spike(a, d, len, r, { color, sides: 6, ...o });
  const pic = (tex: THREE.Texture, w: number, h: number, at: V3, dir: V3 | null, o: Any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      at,
      ...(dir ? { dir, axis: "z" } : {}),
      texture: tex,
      ...o,
    });
  const scalePts = (pts: Pt[], s: number): Pt[] =>
    pts.map((p) => (p.length === 3 ? [p[0] * s, p[1] * s, "sharp"] : [p[0] * s, p[1] * s]) as Pt);
  const lp = (pts: [number, number][], s: number) => pts.map(([a, c]) => [a * s, c * s] as [number, number]);

  const archPts = (w: number, hs: number, n = 4): Pt[] => {
    const pts: Pt[] = [
      [-w / 2, 0],
      [w / 2, 0],
      [w / 2, hs],
    ];
    for (let k = 1; k < n; k++) {
      const a = ((60 * k) / n) * (Math.PI / 180);
      pts.push([-w / 2 + w * Math.cos(a), hs + w * Math.sin(a)]);
    }
    pts.push([0, hs + w * 0.866025, "sharp"]);
    for (let k = n - 1; k >= 1; k--) {
      const a = ((60 * k) / n) * (Math.PI / 180);
      pts.push([w / 2 - w * Math.cos(a), hs + w * Math.sin(a)]);
    }
    pts.push([-w / 2, hs]);
    return pts;
  };

  const flame = (x: number, y: number, z: number, sc = 1, str = 1.6) =>
    glow(
      b.extrude(
        scalePts(
          [
            [0, 0],
            [0.007, 0.006],
            [0.0085, 0.016],
            [0.003, 0.03],
            [0, 0.042, "sharp"],
            [-0.003, 0.03],
            [-0.0085, 0.016],
            [-0.007, 0.006],
          ],
          sc,
        ),
        { at: [x, y, z], x: [1, 0, 0], thickness: 0.004 * sc, color: FLAME },
      ),
      str,
    );
  const candle = (x: number, y: number, z: number, h = 0.024, sc = 1) => {
    cyl(0.0045, 0.005, h, 6, WAX, [x, y + h / 2, z]);
    flame(x, y + h, z, sc);
  };

  // Gothic lancet window with frame, sill and glowing glass (texture aspect 60:99).
  function lancet(tex: THREE.Texture, w: number, base: V3, dir: V3, o: Any = {}) {
    const d = new THREE.Vector3(...dir).normalize();
    const t = o.depth ?? 0.012;
    const f = w * 0.14;
    const across: V3 = [d.z, 0, -d.x];
    const H = (w * 99) / 60;
    const P = (k: number, up: number): V3 => [base[0] + d.x * k, base[1] + up, base[2] + d.z * k];
    b.extrude(archPts(w + 2 * f, w * 0.7833), { at: P(t / 2, -f), x: across, thickness: t, color: o.frame ?? BONEP });
    glow(pic(tex, w, H, P(t + 0.002, H / 2), [d.x, 0, d.z]), o.lit ?? 1.1);
    if (o.sill !== false && (Math.abs(d.x) > 0.99 || Math.abs(d.z) > 0.99)) {
      const wide = w + 2 * f + 0.016;
      const sx = Math.abs(d.x) > 0.5 ? 0.018 : wide;
      const sz = Math.abs(d.x) > 0.5 ? wide : 0.018;
      b.part(new THREE.BoxGeometry(sx, 0.01, sz), o.frame ?? BONEP, { at: P(0.009, -f - 0.005) });
    }
  }

  const bracket = (x: number, y: number, z: number, side: 1 | -1, color: Col = WOOD_V) =>
    b.extrude(
      [
        [0, 0],
        [0.075, 0],
        [0.06, -0.01],
        [0.04, -0.028],
        [0.02, -0.054],
        [0, -0.08],
      ],
      { at: [x, y, z], x: [side, 0, 0], thickness: 0.006, color },
    );

  const portrait = (tex: THREE.Texture, x: number, y: number, z: number, eyeDy: number, eyeCol: string) => {
    const w = 0.075,
      h = 0.1;
    box(x - w / 2 - 0.011, x + w / 2 + 0.011, y - h / 2 - 0.011, y + h / 2 + 0.011, z, z + 0.008, GILT);
    pic(tex, w, h, [x, y, z + 0.0085], [0, 0, 1]);
    for (const sx of [-1, 1]) {
      ball(0.005, GILT, [x + sx * (w / 2 + 0.011), y + h / 2 + 0.011, z + 0.006], 6);
      ball(0.005, GILT, [x + sx * (w / 2 + 0.011), y - h / 2 - 0.011, z + 0.006], 6);
      glow(
        b.part(new THREE.CircleGeometry(0.0034, 6), eyeCol, {
          at: [x + sx * 0.0075, y + eyeDy, z + 0.0092],
          dir: [0, 0, 1],
          axis: "z",
        }),
        1.6,
      );
    }
    spike([x, y + h / 2 + 0.011, z + 0.004], [0, 1, 0], 0.014, 0.005, GILT);
  };

  const curtain = (x: number, yTop: number, z: number, w: number, len: number, side: 1 | -1) =>
    b.extrude(
      [
        [0, 0],
        [w, 0],
        [w * 0.9, -len * 0.4],
        [w * 1.05, -len * 0.75],
        [w * 0.8, -len * 0.9],
        [w * 0.6, -len],
        [w * 0.4, -len * 0.85],
        [w * 0.2, -len * 0.97],
        [0, -len * 0.7],
      ],
      { at: [x, yTop, z], x: [side, 0, 0], thickness: 0.006, color: CURTAIN },
    );

  function lantern(x: number, y: number, z: number, s: number) {
    const capY = y - 0.05 * s;
    rod([x, y, z], [x, capY + 0.02 * s, z], 0.0015, IRON);
    b.lathe(
      lp(
        [
          [0, 0],
          [0.022, 0],
          [0.016, 0.01],
          [0.006, 0.018],
          [0, 0.02],
        ],
        s,
      ),
      { at: [x, capY, z], segments: 6, color: IRON },
    );
    glow(box(x - 0.014 * s, x + 0.014 * s, capY - 0.04 * s, capY, z - 0.014 * s, z + 0.014 * s, LANTERNG), 1.4);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        rod([x + sx * 0.0145 * s, capY, z + sz * 0.0145 * s], [x + sx * 0.0145 * s, capY - 0.04 * s, z + sz * 0.0145 * s], 0.0013, IRON);
    cyl(0.018 * s, 0.012 * s, 0.008 * s, 6, IRON, [x, capY - 0.044 * s, z]);
  }

  // ------------------------------------------------------------ ghosts, bats
  const GH_PROFILE: [number, number][] = [
    [0, 0],
    [0.075, 0],
    [0.072, 0.03],
    [0.058, 0.07],
    [0.046, 0.105],
    [0.05, 0.135],
    [0.05, 0.16],
    [0.04, 0.19],
    [0.02, 0.212],
    [0, 0.22],
  ];
  function ghost(x: number, y: number, z: number, s: number, yaw: number, armUp: number) {
    const rad = (yaw * Math.PI) / 180;
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rad);
    const P = (lx: number, ly: number, lz: number): V3 => {
      const v = new THREE.Vector3(lx * s, ly * s, lz * s).applyQuaternion(q);
      return [x + v.x, y + v.y, z + v.z];
    };
    glow(b.lathe(lp(GH_PROFILE, s), { at: [x, y, z], segments: 8, color: GHOST }), 0.6);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      glow(
        b.spike(
          [x + Math.sin(a) * 0.07 * s, y + 0.012 * s, z + Math.cos(a) * 0.07 * s],
          [Math.sin(a) * 0.35, -1, Math.cos(a) * 0.35],
          0.05 * s,
          0.02 * s,
          { color: GHOST, sides: 5 },
        ),
        0.6,
      );
    }
    for (const sd of [1, -1])
      glow(b.capsule(P(sd * 0.05, 0.13, 0.01), P(sd * 0.11, 0.13 + armUp, 0.045), 0.013 * s, GHOST), 0.6);
    pic(T_GHOSTFACE, 0.056 * s, 0.056 * s, P(0, 0.163, 0.054), [Math.sin(rad), 0, Math.cos(rad)]);
  }

  function hangBat(x: number, y: number, z: number, s: number) {
    ball(0.011 * s, INKC, [x, y - 0.024 * s, z], 6, [0.9, 1.5, 0.8]);
    ball(0.008 * s, INKC, [x, y - 0.046 * s, z + 0.002 * s], 6);
    for (const sd of [-1, 1]) {
      spike([x + sd * 0.005 * s, y - 0.052 * s, z + 0.002 * s], [sd * 0.2, -1, 0], 0.011 * s, 0.003 * s, INKC, { sides: 4 });
      glow(ball(0.0018 * s, REDEYE, [x + sd * 0.003 * s, y - 0.046 * s, z + 0.0095 * s], 4), 2);
      b.extrude(
        [
          [0, 0],
          [0.012 * s, -0.012 * s],
          [0.011 * s, -0.035 * s],
          [0, -0.056 * s, "sharp"],
          [-0.011 * s, -0.035 * s],
          [-0.012 * s, -0.012 * s],
        ],
        { at: [x + sd * 0.011 * s, y, z], x: [0, 0, 1], thickness: 0.004 * s, color: INKC },
      );
    }
    rod([x, y, z], [x, y - 0.012 * s, z], 0.0015 * s, INKC);
  }

  // ======================================================================= PLINTH & GROUND
  box(-0.9, 0.9, 0, 0.03, -0.4, 0.64, PLINTH);
  box(-0.915, 0.915, 0.03, 0.04, -0.415, 0.655, PLINTH);
  box(-0.88, 0.88, 0.04, PY, -0.38, 0.62, GROUND);
  for (const sx of [-1, 1])
    for (const [zz, sz] of [
      [-0.415, 1],
      [0.655, -1],
    ] as [number, number][])
      box(sx * 0.915 - 0.035, sx * 0.915 + 0.035, 0.03, 0.044, zz - sz * 0.0, zz + sz * 0.07, GILT, { at: undefined }).mesh;
  box(-0.12, 0.12, 0.007, 0.024, 0.64, 0.646, BRASS);

  // ======================================================================= HOUSE SHELL
  box(X0, X1, PY, F2, ZB, BZ, SID); // back wall
  box(X0, X0 + WT, PY, F2, ZB, ZF, wallLeft); // left wall
  box(XS - 0.01, X1, PY, F2, ZB, ZF, wallWing); // right wing block
  box(X0 + WT, XS - 0.01, PY, PY + 0.006, BZ, ZF, checker); // parlor floor
  box(X0, X1, CEIL1, F1, ZB, ZF + 0.01, slabP); // first floor slab
  box(X0, XS, CEIL2, F2, ZB, ZF + 0.01, slabP); // attic floor slab
  box(X0, X0 + 0.035, PY, F2, ZF - 0.03, ZF + 0.012, BONEP); // left front post
  box(XS - 0.04, XS, PY, F2, ZF - 0.02, ZF + 0.012, BONEP); // partition front board
  box(X0 - 0.01, XS, F1 - 0.006, F1 + 0.004, ZF + 0.01, ZF + 0.016, BONEP); // slab lip trims
  box(X0 - 0.01, XS, F2 - 0.006, F2 + 0.004, ZF + 0.01, ZF + 0.016, BONEP);
  for (let i = 0; i < 3; i++) {
    // ceiling beams
    for (const cy of [CEIL1, CEIL2]) {
      const zz = -0.2 + i * 0.15;
      box(X0 + WT, XS - 0.01, cy - 0.012, cy, zz - 0.01, zz + 0.01, WOOD_H);
    }
  }
  // gothic spandrel brackets at the opening corners
  bracket(X0 + 0.035, CEIL1, ZF + 0.002, 1);
  bracket(XS - 0.04, CEIL1, ZF + 0.002, -1);
  bracket(X0 + 0.035, CEIL2, ZF + 0.002, 1);
  bracket(XS - 0.04, CEIL2, ZF + 0.002, -1);

  // wallpaper on the back walls
  pic(T_PARLOR, 0.71, 0.3, [-0.175, 0.2, BZ + 0.0015], [0, 0, 1]);
  pic(T_NURSERY, 0.71, 0.3, [-0.175, 0.52, BZ + 0.0015], [0, 0, 1]);

  // cobwebs
  pic(T_WEB, 0.075, 0.075, [X0 + WT + 0.0375, CEIL1 - 0.0375, BZ + 0.003], [0, 0, 1]);
  pic(T_WEB, 0.075, 0.075, [XS - 0.01 - 0.0375, CEIL1 - 0.0375, BZ + 0.003], null, { rotation: [0, 0, -90] });
  pic(T_WEB, 0.08, 0.08, [X0 + WT + 0.04, CEIL2 - 0.04, BZ + 0.003], [0, 0, 1]);
  pic(T_WEB, 0.06, 0.06, [XS - 0.01 - 0.03, CEIL2 - 0.03, BZ + 0.003], null, { rotation: [0, 0, -90] });

  // ======================================================================= PARLOR (ground floor, open wing)
  const FX = -0.33;
  box(FX - 0.075, FX - 0.05, PY, PY + 0.15, BZ, BZ + 0.045, STONE);
  box(FX + 0.05, FX + 0.075, PY, PY + 0.15, BZ, BZ + 0.045, STONE);
  box(FX - 0.085, FX + 0.085, PY + 0.15, PY + 0.172, BZ, BZ + 0.05, STONE_D);
  box(FX - 0.105, FX + 0.105, PY + 0.172, PY + 0.185, BZ, BZ + 0.065, WOOD_H);
  box(FX - 0.08, FX + 0.08, PY + 0.185, CEIL1, BZ, BZ + 0.03, STONE);
  box(FX - 0.05, FX + 0.05, PY, PY + 0.15, BZ, BZ + 0.006, CHAR);
  box(FX - 0.11, FX + 0.11, PY, PY + 0.008, BZ, BZ + 0.08, STONE_D);
  glow(box(FX - 0.04, FX + 0.04, PY + 0.008, PY + 0.014, BZ + 0.008, BZ + 0.04, EMBER), 1.4);
  rod([FX - 0.04, PY + 0.022, BZ + 0.03], [FX + 0.03, PY + 0.03, BZ + 0.012], 0.007, CHAR);
  rod([FX + 0.04, PY + 0.022, BZ + 0.03], [FX - 0.03, PY + 0.03, BZ + 0.012], 0.007, CHAR);
  flame(FX - 0.02, PY + 0.02, BZ + 0.025, 1.6);
  flame(FX + 0.015, PY + 0.02, BZ + 0.022, 2.1);
  flame(FX + 0.035, PY + 0.02, BZ + 0.03, 1.3);
  // mantle: skull + candles
  ball(0.011, BONE, [FX - 0.06, PY + 0.185 + 0.011, BZ + 0.03], 7, [1, 0.95, 1.05]);
  box(FX - 0.065, FX - 0.055, PY + 0.185, PY + 0.19, BZ + 0.03, BZ + 0.042, BONE);
  for (const sx of [-1, 1]) ball(0.0033, CHAR, [FX - 0.06 + sx * 0.0045, PY + 0.2, BZ + 0.04], 5);
  candle(FX + 0.06, PY + 0.185, BZ + 0.03, 0.022);
  candle(FX + 0.088, PY + 0.185, BZ + 0.03, 0.016);
  portrait(T_LADY, FX, 0.258, BZ + 0.031, 0.0075, GREENG);

  // grandfather clock
  const CK = -0.495,
    CZ = -0.235;
  box(CK - 0.032, CK + 0.032, PY, PY + 0.045, CZ - 0.022, CZ + 0.022, WOOD_V);
  box(CK - 0.022, CK + 0.022, PY + 0.045, PY + 0.14, CZ - 0.018, CZ + 0.018, WOOD_V);
  box(CK - 0.015, CK + 0.015, PY + 0.06, PY + 0.13, CZ + 0.0175, CZ + 0.0185, INKC);
  rod([CK, PY + 0.13, CZ + 0.02], [CK, PY + 0.085, CZ + 0.02], 0.0008, GILT);
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.003, 8), GILT, { at: [CK, PY + 0.078, CZ + 0.0205], dir: [0, 0, 1] });
  box(CK - 0.03, CK + 0.03, PY + 0.14, PY + 0.2, CZ - 0.022, CZ + 0.022, WOOD_V);
  pic(T_CLOCK, 0.048, 0.048, [CK, PY + 0.17, CZ + 0.0225], [0, 0, 1]);
  b.extrude(
    [
      [-0.034, 0],
      [0.034, 0],
      [0, 0.04, "sharp"],
    ],
    { at: [CK, PY + 0.2, CZ], x: [1, 0, 0], thickness: 0.04, color: WOOD_V },
  );
  spike([CK, PY + 0.24, CZ], [0, 1, 0], 0.02, 0.004, GILT);

  // window on the back wall + curtains
  lancet(T_WIN_MOON, 0.09, [-0.08, 0.17, BZ], [0, 0, 1], { depth: 0.008, frame: WOOD_V, lit: 0.9 });
  curtain(-0.135, 0.33, BZ + 0.012, 0.03, 0.16, 1);
  curtain(-0.025, 0.33, BZ + 0.012, 0.03, 0.16, -1);
  rod([-0.15, 0.33, BZ + 0.012], [-0.01, 0.33, BZ + 0.012], 0.0025, GILT);

  // sofa
  const SX = -0.08,
    SZ = -0.2;
  for (const sx of [-0.09, 0.09])
    for (const sz of [-0.035, 0.035]) cyl(0.004, 0.006, 0.014, 5, WOOD_V, [SX + sx, PY + 0.007, SZ + sz]);
  box(SX - 0.1, SX + 0.1, PY + 0.012, PY + 0.045, SZ - 0.045, SZ + 0.045, VELVET);
  box(SX - 0.092, SX - 0.002, PY + 0.045, PY + 0.062, SZ - 0.024, SZ + 0.043, VELVET);
  box(SX + 0.002, SX + 0.092, PY + 0.045, PY + 0.062, SZ - 0.024, SZ + 0.043, VELVET);
  box(SX - 0.1, SX + 0.1, PY + 0.045, PY + 0.115, SZ - 0.048, SZ - 0.024, VELVET);
  b.capsule([SX - 0.09, PY + 0.118, SZ - 0.036], [SX + 0.09, PY + 0.118, SZ - 0.036], 0.014, VELVET, { sides: 6 });
  for (const sx of [-1, 1]) {
    box(SX + sx * 0.1 - 0.011, SX + sx * 0.1 + 0.011, PY + 0.012, PY + 0.08, SZ - 0.045, SZ + 0.045, VELVET);
    b.capsule([SX + sx * 0.1, PY + 0.082, SZ - 0.038], [SX + sx * 0.1, PY + 0.082, SZ + 0.04], 0.013, VELVET, { sides: 6 });
  }
  for (let i = 0; i < 5; i++) ball(0.004, GILT, [SX - 0.07 + i * 0.035, PY + 0.085, SZ - 0.0235], 5);

  // bookshelf
  const BKX = 0.12;
  box(BKX - 0.045, BKX - 0.039, PY, PY + 0.26, BZ, BZ + 0.045, WOOD_V);
  box(BKX + 0.039, BKX + 0.045, PY, PY + 0.26, BZ, BZ + 0.045, WOOD_V);
  box(BKX - 0.045, BKX + 0.045, PY + 0.255, PY + 0.265, BZ, BZ + 0.05, WOOD_H);
  box(BKX - 0.039, BKX + 0.039, PY, PY + 0.255, BZ, BZ + 0.003, INKC);
  for (let i = 0; i < 4; i++) box(BKX - 0.045, BKX + 0.045, PY + i * 0.062, PY + i * 0.062 + 0.005, BZ, BZ + 0.045, WOOD_H);
  const bookGeo: Record<string, THREE.BufferGeometry[]> = {};
  BOOKC.forEach((c) => (bookGeo[c] = []));
  for (let i = 0; i < 4; i++) {
    let x = BKX - 0.036;
    while (x < BKX + 0.032) {
      if (R() < 0.1) {
        x += 0.012;
        continue;
      }
      const w = 0.004 + R() * 0.004;
      const h = 0.026 + R() * 0.02;
      const g = new THREE.BoxGeometry(w, h, 0.028 + R() * 0.01);
      if (R() < 0.08) g.rotateZ(-0.25);
      g.translate(x + w / 2, PY + i * 0.062 + 0.005 + h / 2, BZ + 0.024);
      bookGeo[BOOKC[Math.floor(R() * BOOKC.length)]].push(g);
      x += w + 0.0006;
    }
  }
  for (const c of BOOKC) if (bookGeo[c].length) b.part(mergeGeometries(bookGeo[c])!, c, { at: [0, 0, 0] });

  // rug, tea table and tea set
  cyl(0.13, 0.13, 0.003, 16, rugP, [-0.12, PY + 0.0075, 0]);
  const TX = -0.1,
    TZ = 0.02;
  cyl(0.055, 0.05, 0.006, 12, WOOD_H, [TX, PY + 0.067, TZ]);
  cyl(0.008, 0.012, 0.06, 6, WOOD_V, [TX, PY + 0.036, TZ]);
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3 + 0.4;
    rod([TX, PY + 0.02, TZ], [TX + Math.sin(a) * 0.04, PY + 0.008, TZ + Math.cos(a) * 0.04], 0.004, WOOD_V);
  }
  const ty = PY + 0.07;
  b.lathe(
    [
      [0, 0],
      [0.012, 0],
      [0.016, 0.008],
      [0.016, 0.016],
      [0.01, 0.022],
      [0.005, 0.024],
      [0, 0.026],
    ],
    { at: [TX - 0.014, ty, TZ], segments: 8, color: BONE },
  );
  rod([TX - 0.002, ty + 0.01, TZ], [TX + 0.012, ty + 0.02, TZ], 0.0028, BONE);
  b.part(new THREE.TorusGeometry(0.007, 0.0017, 4, 8), BONE, { at: [TX - 0.03, ty + 0.014, TZ] });
  ball(0.0035, BONE, [TX - 0.014, ty + 0.028, TZ], 5);
  for (const sx of [0.012, 0.03])
    b.lathe(
      [
        [0, 0],
        [0.006, 0],
        [0.009, 0.011],
        [0.0075, 0.011],
        [0, 0.003],
      ],
      { at: [TX + sx, ty, TZ + (sx > 0.02 ? 0.02 : -0.018)], segments: 7, color: BONE },
    );
  candle(TX + 0.02, ty, TZ - 0.025, 0.018, 0.8);

  // chandelier
  const CHX = -0.18,
    CHZ = 0.02,
    CHY = 0.28;
  rod([CHX, CEIL1, CHZ], [CHX, CHY, CHZ], 0.0018, IRON);
  b.part(new THREE.TorusGeometry(0.055, 0.003, 5, 14), IRON, { at: [CHX, CHY, CHZ], rotation: [90, 0, 0] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const cx = CHX + Math.sin(a) * 0.055;
    const cz = CHZ + Math.cos(a) * 0.055;
    cyl(0.006, 0.006, 0.004, 5, IRON, [cx, CHY + 0.005, cz]);
    candle(cx, CHY + 0.007, cz, 0.014, 0.65);
    rod([CHX, CHY, CHZ], [cx, CHY, cz], 0.0016, IRON);
  }
  b.lathe(
    [
      [0, 0],
      [0.01, 0.01],
      [0.004, 0.022],
      [0, 0.03],
    ],
    { at: [CHX, CHY - 0.03, CHZ], segments: 6, color: GILT },
  );
  ghost(0.04, 0.1, 0.07, 0.9, -15, 0.05);

  // ======================================================================= BEDROOM (second floor)
  const BXa = -0.525,
    BXb = -0.265,
    BZa = -0.262,
    BZb = -0.108;
  for (const sx of [BXa + 0.004, BXb - 0.004])
    for (const sz of [BZa + 0.004, BZb - 0.004]) box(sx - 0.004, sx + 0.004, F1, F1 + 0.012, sz - 0.004, sz + 0.004, WOOD_V);
  box(BXa, BXb, F1 + 0.012, F1 + 0.03, BZa, BZb, WOOD_H);
  box(BXa + 0.005, BXb - 0.005, F1 + 0.03, F1 + 0.058, BZa + 0.005, BZb - 0.005, LINEN);
  box(-0.43, BXb - 0.002, F1 + 0.056, F1 + 0.066, BZa + 0.002, BZb - 0.002, BLANKET);
  box(-0.43, BXb - 0.002, F1 + 0.03, F1 + 0.066, BZb - 0.007, BZb - 0.002, BLANKET);
  ball(0.03, LINEN, [BXa + 0.04, F1 + 0.07, (BZa + BZb) / 2], 8, [0.7, 0.4, 1.4]);
  const postTops = [0.275, 0.275, 0.245, 0.245];
  [
    [BXa + 0.006, BZa + 0.006],
    [BXa + 0.006, BZb - 0.006],
    [BXb - 0.006, BZa + 0.006],
    [BXb - 0.006, BZb - 0.006],
  ].forEach(([px, pz], i) => {
    cyl(0.0055, 0.0065, postTops[i], 6, WOOD_V, [px, F1 + postTops[i] / 2, pz]);
    ball(0.009, GILT, [px, F1 + postTops[i] + 0.006, pz], 6);
  });
  b.extrude(archPts(0.15, 0.06), {
    at: [BXa + 0.005, F1 + 0.01, (BZa + BZb) / 2],
    x: [0, 0, 1],
    thickness: 0.008,
    color: WOOD_V,
  });
  box(BXb - 0.012, BXb - 0.004, F1 + 0.03, F1 + 0.1, BZa, BZb, WOOD_V);
  const cTop = F1 + 0.245;
  box(BXa, BXb, cTop, cTop + 0.007, BZa, BZb, CURTAIN);
  for (let i = 0; i < 9; i++)
    spike([BXa + 0.012 + i * 0.0275, cTop, BZb - 0.002], [0, -1, 0], 0.028, 0.012, CURTAIN, { sides: 4 });
  for (let i = 0; i < 5; i++)
    spike([BXb - 0.002, cTop, BZa + 0.012 + i * 0.03], [0, -1, 0], 0.028, 0.012, CURTAIN, { sides: 4 });
  curtain(BXb - 0.006, cTop, BZb + 0.004, 0.045, 0.17, -1);
  curtain(BXa + 0.006, cTop, BZb + 0.004, 0.045, 0.17, 1);
  // nightstand + candle
  box(-0.255, -0.215, F1, F1 + 0.05, -0.255, -0.215, WOOD_V);
  box(-0.25, -0.22, F1 + 0.028, F1 + 0.04, -0.215, -0.213, WOOD_H);
  ball(0.002, GILT, [-0.235, F1 + 0.034, -0.2125], 4);
  candle(-0.235, F1 + 0.05, -0.235, 0.02);

  // wall: window + portrait
  lancet(T_WIN_MOON, 0.09, [0.07, 0.51, BZ], [0, 0, 1], { depth: 0.008, frame: WOOD_V, lit: 0.9 });
  curtain(0.012, 0.66, BZ + 0.012, 0.028, 0.15, 1);
  curtain(0.128, 0.66, BZ + 0.012, 0.028, 0.15, -1);
  rod([0.0, 0.66, BZ + 0.012], [0.14, 0.66, BZ + 0.012], 0.0025, GILT);
  portrait(T_MAN, -0.15, 0.5, BZ + 0.031, 0.005, REDEYE);

  // rocking horse
  const HX = -0.03,
    HZ = -0.03,
    HY = F1;
  const rockerPts: Pt[] = [];
  for (let i = 0; i <= 7; i++) {
    const a = ((-35 + (i * 70) / 7) * Math.PI) / 180;
    rockerPts.push([0.18 * Math.sin(a), 0.18 * (1 - Math.cos(a))]);
  }
  for (let i = 7; i >= 0; i--) {
    const a = ((-35 + (i * 70) / 7) * Math.PI) / 180;
    rockerPts.push([0.18 * Math.sin(a), 0.18 * (1 - Math.cos(a)) + 0.008]);
  }
  for (const sz of [-1, 1]) {
    b.extrude(rockerPts, { at: [HX, HY, HZ + sz * 0.028], x: [1, 0, 0], thickness: 0.006, color: WOOD_H });
    for (const lx of [-0.035, 0.037])
      rod([HX + lx, HY + 0.087, HZ + sz * 0.018], [HX + lx * 1.0, HY + 0.014, HZ + sz * 0.028], 0.004, WOOD_V);
  }
  b.capsule([HX - 0.04, HY + 0.095, HZ], [HX + 0.045, HY + 0.095, HZ], 0.021, WOOD_V, { sides: 6 });
  box(HX - 0.012, HX + 0.012, HY + 0.114, HY + 0.12, HZ - 0.016, HZ + 0.016, BLANKET);
  b.capsule([HX + 0.04, HY + 0.1, HZ], [HX + 0.062, HY + 0.145, HZ], 0.012, WOOD_V, { sides: 6 });
  b.frustumBox([HX + 0.058, HY + 0.15, HZ], [HX + 0.1, HY + 0.136, HZ], [0.03, 0.036], [0.022, 0.026], { color: WOOD_V });
  for (const sz of [-1, 1]) {
    spike([HX + 0.056, HY + 0.165, HZ + sz * 0.009], [-0.2, 1, 0], 0.016, 0.005, WOOD_V, { sides: 4 });
    glow(ball(0.0042, REDEYE, [HX + 0.076, HY + 0.152, HZ + sz * 0.0155], 5), 2);
  }
  for (let i = 0; i < 3; i++)
    spike([HX + 0.044 + i * 0.006, HY + 0.12 + i * 0.012, HZ], [-1, 0.7, 0], 0.014, 0.004, INKC, { sides: 4 });
  b.sweep(
    catmull([
      [HX - 0.042, HY + 0.1, HZ],
      [HX - 0.062, HY + 0.088, HZ],
      [HX - 0.07, HY + 0.062, HZ],
    ]),
    [0.007, 0.002],
    { color: INKC, sides: 5 },
  );

  // cradle
  box(0.1, 0.152, F1, F1 + 0.008, -0.235, -0.165, WOOD_H);
  b.frustumBox([0.126, F1 + 0.008, -0.2], [0.126, F1 + 0.05, -0.2], [0.05, 0.07], [0.062, 0.082], { color: LINEN });
  box(0.099, 0.153, F1 + 0.046, F1 + 0.054, -0.239, -0.161, WOOD_V);
  b.extrude(archPts(0.06, 0.0, 3), { at: [0.126, F1 + 0.05, -0.236], x: [1, 0, 0], thickness: 0.006, color: WOOD_V });
  for (const sz of [-1, 1]) glow(ball(0.0035, GREENG, [0.126 + sz * 0.009, F1 + 0.056, -0.22], 5), 2);
  lantern(-0.2, CEIL2, 0.08, 0.9);
  ghost(-0.19, 0.46, 0.04, 0.65, 20, 0.08);

  // ======================================================================= ATTIC + ROOF
  const THETA = Math.atan2(RISE, RUN);
  const THD = (THETA * 180) / Math.PI;
  const SLOPE = Math.hypot(RUN, RISE);
  const upDir: V3 = [0, Math.sin(THETA), Math.cos(THETA)];
  const nOut = new THREE.Vector3(0, Math.cos(THETA), -Math.sin(THETA));
  const mainShingle = shingles((p) => [p.y * Math.sin(THETA) + p.z * Math.cos(THETA), p.x], 0.034, 0.03);
  const mainRoofP = paint((_p, n) => (n.dot(nOut) > 0.2 ? mainShingle : BOARDS));
  {
    const s0 = -0.03,
      s1 = SLOPE + 0.02;
    const mid = (s0 + s1) / 2;
    const cx = (-0.585 + 0.3) / 2;
    b.part(new THREE.BoxGeometry(0.885, 0.02, s1 - s0), mainRoofP, {
      at: [cx, F2 + upDir[1] * mid + nOut.y * 0.01, ZB + upDir[2] * mid + nOut.z * 0.01],
      rotation: [-THD, 0, 0],
    });
  }
  // gable end walls
  const triPts: Pt[] = [
    [ZB, 0],
    [ZF, 0],
    [ZR, RISE, "sharp"],
  ];
  b.extrude(triPts, { at: [X0 + WT / 2, F2, 0], x: [0, 0, 1], thickness: WT, color: SID });
  b.extrude(triPts, { at: [XS - 0.01, F2, 0], x: [0, 0, 1], thickness: 0.02, color: BOARDS });
  // rose window in the left gable
  glow(
    b.part(new THREE.CircleGeometry(0.036, 12), GREENG, { at: [X0 - 0.002, F2 + 0.1, ZR], dir: [-1, 0, 0], axis: "z" }),
    1.2,
  );
  b.part(new THREE.TorusGeometry(0.038, 0.005, 4, 12), BONEP, { at: [X0 - 0.002, F2 + 0.1, ZR], rotation: [0, 90, 0] });
  box(X0 - 0.005, X0, F2 + 0.1 - 0.036, F2 + 0.1 + 0.036, ZR - 0.0025, ZR + 0.0025, INKC);
  box(X0 - 0.005, X0, F2 + 0.1 - 0.0025, F2 + 0.1 + 0.0025, ZR - 0.036, ZR + 0.036, INKC);
  // ridge beam + ridge cap + finials
  rod([X0 + 0.01, RIDGE - 0.012, ZR], [XS - 0.01, RIDGE - 0.012, ZR], 0.011, WOOD_H);
  box(-0.585, 0.3, RIDGE + 0.004, RIDGE + 0.022, ZR - 0.022, ZR + 0.022, COPPER);
  spike([-0.58, RIDGE + 0.02, ZR], [0, 1, 0], 0.08, 0.008, GILT);
  ball(0.009, GILT, [-0.58, RIDGE + 0.02, ZR], 6);
  // front rafters, plate, collar ties
  box(X0, XS, F2, F2 + 0.02, ZF - 0.014, ZF, WOOD_H);
  for (const rx of [-0.53, -0.36, -0.19, -0.02, 0.15]) {
    rod([rx, RIDGE - 0.01, ZR], [rx, F2 + 0.015, ZF - 0.007], 0.0065, WOOD_V);
    const t = 0.16 / RISE;
    rod([rx, F2 + 0.16, ZB + RUN * t], [rx, F2 + 0.16, ZF - RUN * t], 0.005, WOOD_V);
  }
  // attic furnishings: trunk
  box(-0.3, -0.14, F2, F2 + 0.07, -0.2, -0.1, "#4a2f22");
  for (const tx of [-0.27, -0.17]) box(tx - 0.007, tx + 0.007, F2, F2 + 0.07, -0.1, -0.0985, BRASS);
  glow(box(-0.295, -0.145, F2 + 0.07, F2 + 0.0725, -0.195, -0.105, GREENG), 1.3);
  b.part(new THREE.BoxGeometry(0.16, 0.012, 0.1), "#4a2f22", {
    at: [-0.22, F2 + 0.07 + 0.0054 + 0.021, -0.2 + 0.045 - 0.0025 + 0.0],
    rotation: [-25, 0, 0],
  });
  ghost(-0.22, F2 + 0.07, -0.15, 0.4, 10, 0.1);
  // doll sitting on the floor
  const DX = -0.08,
    DZ = -0.08;
  b.lathe(
    [
      [0, 0],
      [0.035, 0],
      [0.03, 0.02],
      [0.018, 0.045],
      [0.012, 0.055],
      [0, 0.055],
    ],
    { at: [DX, F2, DZ], segments: 8, color: "#7e2a3a" },
  );
  ball(0.022, "#e8dccb", [DX, F2 + 0.078, DZ], 8);
  ball(0.0235, "#2a1a14", [DX, F2 + 0.084, DZ - 0.004], 8, [1, 0.8, 1]);
  for (const sx of [-1, 1]) {
    ball(0.009, "#2a1a14", [DX + sx * 0.022, F2 + 0.07, DZ], 5);
    glow(ball(0.0045, GREENG, [DX + sx * 0.0085, F2 + 0.08, DZ + 0.02], 5), 2);
    rod([DX + sx * 0.02, F2 + 0.05, DZ + 0.004], [DX + sx * 0.03, F2 + 0.03, DZ + 0.03], 0.005, "#e8dccb");
  }
  // dress form
  const MX = -0.44,
    MZ = -0.05;
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.055, 0.04],
      [0.035, 0.09],
      [0.026, 0.11],
      [0, 0.11],
    ],
    { at: [MX, F2, MZ], segments: 8, color: CURTAIN },
  );
  b.lathe(
    [
      [0, 0],
      [0.026, 0],
      [0.03, 0.014],
      [0.022, 0.034],
      [0.01, 0.05],
      [0, 0.052],
    ],
    { at: [MX, F2 + 0.1, MZ], segments: 8, color: LINEN },
  );
  rod([MX, F2 + 0.15, MZ], [MX, F2 + 0.175, MZ], 0.004, WOOD_V);
  ball(0.007, GILT, [MX, F2 + 0.18, MZ], 5);
  lantern(-0.14, RIDGE - 0.02, ZR, 1);
  hangBat(-0.47, RIDGE - 0.02, ZR, 1);
  hangBat(-0.4, RIDGE - 0.02, ZR + 0.01, 0.85);
  hangBat(-0.3, RIDGE - 0.02, ZR - 0.01, 0.95);
  spike([-0.02, F2 + 0.0, -0.22], [0, 1, 0], 0.004, 0.004, INKC);

  // ======================================================================= RIGHT WING: facade, door, porch
  const WCX = 0.37;
  // trims on the facade
  box(0.535, 0.552, PY, F2, ZF, ZF + 0.008, BONEP);
  box(0.19, 0.55, F1 - 0.012, F1 + 0.004, ZF, ZF + 0.014, BONEP);
  box(0.185, 0.565, F2, F2 + 0.014, ZF - 0.0, ZF + 0.03, BONEP);
  for (let i = 0; i < 9; i++) box(0.195 + i * 0.043, 0.203 + i * 0.043, F2 - 0.014, F2, ZF, ZF + 0.02, BONEP);
  // door
  box(0.308, 0.316, PY + 0.014, 0.3, ZF, ZF + 0.012, BONEP);
  box(0.424, 0.432, PY + 0.014, 0.3, ZF, ZF + 0.012, BONEP);
  box(0.308, 0.432, 0.284, 0.3, ZF, ZF + 0.014, BONEP);
  pic(T_DOOR, 0.11, 0.22, [WCX, PY + 0.014 + 0.11, ZF + 0.002], [0, 0, 1]);
  glow(
    b.extrude(archPts(0.075, 0), {
      at: [WCX, PY + 0.014 + 0.135, ZF + 0.004],
      x: [1, 0, 0],
      thickness: 0.002,
      color: GREENG,
    }),
    1.3,
  );
  box(WCX - 0.0015, WCX + 0.0015, PY + 0.014 + 0.135, PY + 0.014 + 0.2, ZF + 0.0035, ZF + 0.0055, INKC);
  box(WCX - 0.036, WCX + 0.036, PY + 0.014 + 0.16, PY + 0.014 + 0.1635, ZF + 0.0035, ZF + 0.0055, INKC);
  // second-floor window and shutters
  lancet(T_WIN_LIT, 0.09, [WCX, 0.45, ZF], [0, 0, 1]);
  for (const sx of [-1, 1])
    b.extrude(archPts(0.034, 0.1, 3), {
      at: [WCX + sx * 0.071, 0.44, ZF],
      x: [1, 0, 0],
      thickness: 0.008,
      color: WOOD_V,
    });
  // side-wall windows
  lancet(T_WIN_LIT, 0.07, [X1, 0.1, -0.1], [1, 0, 0]);
  lancet(T_WIN_LIT, 0.07, [X1, 0.45, -0.1], [1, 0, 0]);
  lancet(T_WIN_LIT, 0.07, [X1, 0.45, 0.07], [1, 0, 0]);
  lancet(T_WIN_LIT, 0.07, [0.3, 0.45, ZB], [0, 0, -1]);
  lancet(T_WIN_LIT, 0.07, [0.2, 0.1, ZB], [0, 0, -1], { sill: true });
  lancet(T_WIN_MOON, 0.09, [-0.08, 0.17, ZB], [0, 0, -1], { lit: 0.6 });
  lancet(T_WIN_MOON, 0.09, [0.07, 0.51, ZB], [0, 0, -1], { lit: 0.6 });

  // porch
  box(0.22, 0.52, PY, PY + 0.014, ZF, 0.31, WOOD_H);
  box(0.3, 0.44, PY, PY + 0.009, 0.31, 0.345, STONE_D);
  for (const px of [0.235, 0.505]) {
    cyl(0.008, 0.01, 0.01, 6, BONEP, [px, PY + 0.019, 0.295]);
    cyl(0.006, 0.007, 0.235, 6, BONEP, [px, PY + 0.014 + 0.12, 0.295]);
    ball(0.009, BONEP, [px, 0.292, 0.295], 6);
    bracket(px - (px < 0.37 ? 0 : 0), 0.295, 0.304, px < 0.37 ? 1 : -1, BONEP);
  }
  box(0.225, 0.515, 0.294, 0.312, 0.288, 0.302, BONEP);
  b.part(new THREE.BoxGeometry(0.34, 0.012, 0.19), mainShingle, {
    at: [0.37, 0.33, 0.24],
    rotation: [6, 0, 0],
  });
  box(0.2, 0.54, 0.3, 0.318, ZF, ZF + 0.012, BONEP);
  lantern(0.3, 0.3, 0.26, 0.8);
  // porch railing (balusters merged)
  {
    const geos: THREE.BufferGeometry[] = [];
    const addBal = (x: number, z: number) =>
      geos.push(new THREE.CylinderGeometry(0.0016, 0.0016, 0.034, 5).translate(x, PY + 0.014 + 0.017, z));
    for (let x = 0.245; x < 0.3; x += 0.011) addBal(x, 0.3);
    for (let x = 0.446; x < 0.5; x += 0.011) addBal(x, 0.3);
    for (let z = 0.2; z < 0.29; z += 0.011) {
      addBal(0.235, z);
      addBal(0.505, z);
    }
    b.part(mergeGeometries(geos)!, IRON, { at: [0, 0, 0] });
    rod([0.235, PY + 0.052, 0.3], [0.3, PY + 0.052, 0.3], 0.003, IRON);
    rod([0.44, PY + 0.052, 0.3], [0.505, PY + 0.052, 0.3], 0.003, IRON);
    rod([0.235, PY + 0.052, 0.19], [0.235, PY + 0.052, 0.3], 0.003, IRON);
    rod([0.505, PY + 0.052, 0.19], [0.505, PY + 0.052, 0.3], 0.003, IRON);
  }

  // cross-gable roof over the wing
  const CRISE = 0.5,
    CRUN = 0.22;
  const CTH = Math.atan2(CRISE, CRUN);
  const CTD = (CTH * 180) / Math.PI;
  const CLEN = Math.hypot(CRISE, CRUN);
  const rightP = shingles((p) => [-0.403 * p.x + 0.916 * p.y, p.z], 0.034, 0.03);
  const leftP = shingles((p) => [0.403 * p.x + 0.916 * p.y, p.z], 0.034, 0.03);
  const nx = Math.sin(CTH),
    ny = Math.cos(CTH);
  b.part(new THREE.BoxGeometry(CLEN + 0.05, 0.02, 0.53), rightP, {
    at: [0.48 + nx * 0.01, F2 + 0.25 + ny * 0.01, -0.045],
    rotation: [0, 0, -CTD],
  });
  b.part(new THREE.BoxGeometry(CLEN + 0.05, 0.02, 0.53), leftP, {
    at: [0.26 - nx * 0.01, F2 + 0.25 + ny * 0.01, -0.045],
    rotation: [0, 0, CTD],
  });
  box(0.355, 0.385, F2 + CRISE - 0.004, F2 + CRISE + 0.02, -0.31, 0.225, COPPER);
  // front gable
  b.extrude(
    [
      [-0.18, 0],
      [0.18, 0],
      [0.18, 0.091],
      [0, CRISE, "sharp"],
      [-0.18, 0.091],
    ],
    { at: [WCX, F2, ZF - 0.01], x: [1, 0, 0], thickness: 0.02, color: SID },
  );
  lancet(T_WIN_LIT, 0.09, [WCX, F2 + 0.13, ZF], [0, 0, 1]);
  glow(
    b.part(new THREE.CircleGeometry(0.02, 10), GREENG, { at: [WCX, F2 + 0.4, ZF + 0.002], dir: [0, 0, 1], axis: "z" }),
    1.2,
  );
  b.part(new THREE.TorusGeometry(0.021, 0.003, 4, 10), BONEP, { at: [WCX, F2 + 0.4, ZF + 0.004] });
  box(WCX - 0.0015, WCX + 0.0015, F2 + 0.38, F2 + 0.42, ZF + 0.0025, ZF + 0.0045, INKC);
  box(WCX - 0.02, WCX + 0.02, F2 + 0.3985, F2 + 0.4015, ZF + 0.0025, ZF + 0.0045, INKC);
  // bargeboards with pendants
  for (const sd of [-1, 1]) {
    const a: V3 = [WCX + sd * 0.215, F2 + 0.045, ZF + 0.026];
    const c: V3 = [WCX + sd * 0.005, F2 + CRISE - 0.015, ZF + 0.026];
    rod(a, c, 0.006, BONEP);
    for (let i = 1; i < 11; i++) {
      const t = i / 11;
      spike(
        [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t - 0.004, ZF + 0.026],
        [0, -1, 0],
        i % 2 ? 0.032 : 0.02,
        0.007,
        BONEP,
        { sides: 4 },
      );
    }
  }
  spike([WCX, F2 + CRISE + 0.01, ZF + 0.03], [0, 1, 0], 0.09, 0.009, GILT);
  ball(0.011, GILT, [WCX, F2 + CRISE + 0.01, ZF + 0.03], 6);

  // ======================================================================= TURRET
  const TCX = -0.68,
    TCZ = 0.1,
    TR = 0.14;
  cyl(0.15, 0.158, 0.03, 8, STONE, [TCX, PY + 0.015, TCZ], { flat: true });
  b.part(new THREE.CylinderGeometry(TR, TR, 0.74, 8), TURRET, { at: [TCX, PY + 0.37, TCZ], flat: true });
  for (const by of [F1, F2 - 0.01]) cyl(TR + 0.012, TR + 0.012, 0.014, 8, BONEP, [TCX, by, TCZ], { flat: true });
  const apothem = TR * Math.cos(Math.PI / 8);
  for (const phi of [-67.5, -22.5, 22.5, 67.5]) {
    const a = (phi * Math.PI) / 180;
    const dir: V3 = [Math.sin(a), 0, Math.cos(a)];
    for (const wy of [0.18, 0.5]) {
      lancet(T_WIN_LIT, 0.046, [TCX + dir[0] * (apothem - 0.001), wy, TCZ + dir[2] * (apothem - 0.001)], dir, {
        depth: 0.008,
        sill: false,
        lit: 1.0,
      });
    }
  }
  // spire
  b.lathe(
    [
      [0, 0],
      [0.185, 0],
      [0.185, 0.012],
      [0.16, 0.035],
      [0.115, 0.12],
      [0.065, 0.22],
      [0.03, 0.3],
      [0.012, 0.35],
      [0, 0.36],
    ],
    {
      at: [TCX, 0.795, TCZ],
      segments: 8,
      color: shingles((p) => [p.y - 0.79, Math.atan2(p.x - TCX, p.z - TCZ) * 0.12], 0.03, 0.028),
    },
  );
  spike([TCX, 1.15, TCZ], [0, 1, 0], 0.12, 0.007, GILT);
  ball(0.01, GILT, [TCX, 1.15, TCZ], 6);
  // gargoyle-ish bat finials on the belt
  for (const phi of [-45, 45]) {
    const a = (phi * Math.PI) / 180;
    spike([TCX + Math.sin(a) * TR, F2 - 0.012, TCZ + Math.cos(a) * TR], [Math.sin(a), -0.3, Math.cos(a)], 0.03, 0.01, STONE_D, {
      sides: 5,
    });
  }

  // ======================================================================= CHIMNEYS, VANE, SMOKE
  const CHX1 = FX;
  box(CHX1 - 0.036, CHX1 + 0.036, F2, 1.12, -0.235, -0.165, brickP);
  box(CHX1 - 0.044, CHX1 + 0.044, 1.12, 1.136, -0.243, -0.157, STONE_D);
  for (const sx of [-1, 1]) cyl(0.013, 0.015, 0.045, 6, "#7a4a34", [CHX1 + sx * 0.018, 1.158, -0.2]);
  box(0.43, 0.5, 0.88, 1.13, -0.235, -0.165, brickP);
  box(0.422, 0.508, 1.13, 1.146, -0.243, -0.157, STONE_D);
  cyl(0.014, 0.016, 0.045, 6, "#7a4a34", [0.465, 1.168, -0.2]);
  b.cards(
    [
      frame([CHX1 - 0.018, 1.18, -0.2], [0, 1, 0]),
      frame([CHX1 + 0.004, 1.27, -0.2], [0, 1, 0]),
      frame([CHX1 + 0.03, 1.36, -0.2], [0, 1, 0]),
      frame([0.465, 1.19, -0.2], [0, 1, 0]),
      frame([0.485, 1.28, -0.2], [0, 1, 0]),
    ],
    T_SMOKE,
    { size: [0.07, 0.15], lean: 14, flow: [1, 0.1, 0], cross: true, vary: 0.2, rng: R, sink: 0 },
  );
  // weathervane
  rod([-0.05, RIDGE + 0.02, ZR], [-0.05, RIDGE + 0.14, ZR], 0.0025, IRON);
  rod([-0.1, RIDGE + 0.1, ZR], [0.0, RIDGE + 0.1, ZR], 0.002, IRON);
  spike([0.0, RIDGE + 0.1, ZR], [1, 0, 0], 0.03, 0.01, IRON, { sides: 4 });
  b.extrude(
    [
      [0, 0],
      [-0.02, 0.016],
      [-0.03, 0.016],
      [-0.024, 0],
      [-0.03, -0.016],
      [-0.02, -0.016],
    ],
    { at: [-0.1, RIDGE + 0.1, ZR], x: [1, 0, 0], thickness: 0.003, color: IRON },
  );
  ball(0.006, GILT, [-0.05, RIDGE + 0.14, ZR], 5);

  // ======================================================================= YARD
  // fence (merged)
  {
    const geos: THREE.BufferGeometry[] = [];
    const picket = (x: number, z: number) => {
      geos.push(new THREE.BoxGeometry(0.006, 0.085, 0.006).translate(x, PY + 0.0425, z));
      geos.push(new THREE.ConeGeometry(0.006, 0.018, 4).translate(x, PY + 0.094, z));
    };
    for (let x = -0.84; x <= 0.845; x += 0.035) {
      if (x > 0.3 && x < 0.44) continue;
      picket(x, 0.58);
    }
    for (let z = 0.3; z < 0.58; z += 0.035) {
      picket(-0.84, z);
      picket(0.84, z);
    }
    b.part(mergeGeometries(geos)!, IRON, { at: [0, 0, 0] });
    for (const ry of [0.03, 0.075]) {
      rod([-0.84, PY + ry, 0.58], [0.3, PY + ry, 0.58], 0.0028, IRON);
      rod([0.44, PY + ry, 0.58], [0.84, PY + ry, 0.58], 0.0028, IRON);
      rod([-0.84, PY + ry, 0.3], [-0.84, PY + ry, 0.58], 0.0028, IRON);
      rod([0.84, PY + ry, 0.3], [0.84, PY + ry, 0.58], 0.0028, IRON);
    }
    for (const [fx, fz] of [
      [-0.84, 0.58],
      [0.84, 0.58],
      [-0.84, 0.3],
      [0.84, 0.3],
    ] as [number, number][]) {
      box(fx - 0.012, fx + 0.012, PY, PY + 0.115, fz - 0.012, fz + 0.012, STONE);
      ball(0.013, STONE, [fx, PY + 0.125, fz], 6);
    }
  }
  // gate pillars + iron arch + lantern
  for (const gx of [0.3, 0.44]) {
    box(gx - 0.013, gx + 0.013, PY, PY + 0.13, 0.567, 0.593, STONE);
    ball(0.015, STONE, [gx, PY + 0.14, 0.58], 6);
  }
  b.sweep(
    catmull([
      [0.313, PY + 0.14, 0.58],
      [0.325, PY + 0.19, 0.58],
      [0.37, PY + 0.235, 0.58],
      [0.415, PY + 0.19, 0.58],
      [0.427, PY + 0.14, 0.58],
    ]),
    0.0035,
    { color: IRON, sides: 5 },
  );
  lantern(0.37, PY + 0.232, 0.58, 0.9);
  // flagstone path
  for (let i = 0; i < 6; i++) {
    const z = 0.56 - i * 0.04;
    b.part(new THREE.BoxGeometry(0.08 + R() * 0.03, 0.005, 0.034), STONE_D, {
      at: [0.37 + (R() - 0.5) * 0.04, PY + 0.002, z],
      rotation: [0, (R() - 0.5) * 20, 0],
    });
  }
  // gravestones
  const tomb = (x: number, z: number, yaw: number, lean: number) => {
    b.extrude(
      [
        [-0.03, 0],
        [0.03, 0],
        [0.03, 0.05],
        [0.022, 0.068],
        [0, 0.076],
        [-0.022, 0.068],
        [-0.03, 0.05],
      ],
      { at: [x, PY - 0.004, z], x: [Math.cos(yaw), 0, -Math.sin(yaw)], thickness: 0.012, color: TOMB, smoothing: 0 },
    );
    box(x - 0.013, x + 0.013, PY + 0.05, PY + 0.054, z + 0.006, z + 0.0075, INKC, { rotation: [0, (yaw * 180) / Math.PI, lean] });
    ball(0.025, GROUND, [x, PY, z - 0.025], 6, [1, 0.35, 1.8]);
  };
  tomb(-0.62, 0.46, 0.15, 0);
  tomb(-0.45, 0.5, -0.2, 0);
  tomb(-0.28, 0.43,