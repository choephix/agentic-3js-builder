// Treehouse Diorama: a 1.2 m tabletop scene. A big old oak on a grassy mound carries a patchwork plank treehouse with
// a tin roof, a rope ladder, a pulley bucket, a tyre swing, a hand-painted sign, a bicycle leaning on the trunk,
// fallen leaves and wildflowers. Flat low-poly: faceted parts, flat colours, SVG drawings and cards for the detail.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { arc, catmull, polyline } from "../src/path";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Treehouse Diorama",
  description:
    "Tabletop diorama: an old oak on a grassy mound with a patchwork plank treehouse, tin roof, rope ladder, pulley bucket, tyre swing, hand-painted sign, a leaning kid's bike, fallen leaves and wildflowers. Flat low-poly.",
};

type V = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------------------------------------------
const BARK = "#6b4a34";
const GRASS = "#6fa043";
const PLINTH_BOT = "#3b2a1e";
const LEAF = ["#4f8a36", "#5f9a3c", "#3f7632", "#7aa83f"];
const GOLD_LEAF = "#94a83a";
const TIMBER = "#5c4232";
const TIMBER_L = "#7a5a40";
const DECK = ["#b98f5e", "#a67f52", "#c39a68", "#9a7448", "#b08658"];
const WALL_RAW = ["#8b7d68", "#9a8a70", "#7a6a56", "#a39580", "#6d5f4e"];
const CREAM = "#e7dcc0";
const ROPE = "#c9b07a";
const ROPE_D = "#9c8455";
const STEEL = "#8d9ba3";
const STEEL_D = "#5b6870";
const RED = "#c4382d";
const BLACK = "#2a2a2f";
const ROCK = ["#8f958f", "#a39c8f", "#78807c"];

// ---------------------------------------------------------------------------------------------------------------
// SVG drawings: flat fills, no gradients
// ---------------------------------------------------------------------------------------------------------------
const S = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const sr = rng(11);
const pick = <T>(list: readonly T[]): T => list[Math.floor(sr() * list.length)] as T;

/** An irregular blob polygon. */
const blob = (cx: number, cy: number, rx: number, ry: number, fill: string, n = 9) => {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 0.78 + sr() * 0.32;
    pts.push(`${(cx + Math.cos(a) * rx * k).toFixed(1)},${(cy + Math.sin(a) * ry * k).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="${fill}" stroke="${fill}" stroke-width="2" stroke-linejoin="round"/>`;
};

const OAK =
  "M0 0 L-3 -5 L-8 -6 L-5 -10 L-10 -13 L-5 -16 L-8 -21 L-3 -21 L0 -28 L3 -21 L8 -21 L5 -16 L10 -13 L5 -10 L8 -6 L3 -5 Z";
const oakLeaf = (fill: string, vein: string, x: number, y: number, rot: number, s: number) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="${OAK}" fill="${fill}" stroke="${fill}" stroke-width="2" stroke-linejoin="round"/><path d="M0 2 L0 -21" stroke="${vein}" stroke-width="1.3" fill="none"/></g>`;

const leafCluster = (base: string, lite: string, vein: string) =>
  svg(
    S(
      64,
      64,
      (
        [
          [-64, 1.0, base],
          [-32, 1.2, lite],
          [0, 1.35, base],
          [32, 1.2, lite],
          [64, 1.0, base],
        ] as const
      )
        .map(([a, s, f]) => oakLeaf(f, vein, 32, 62, a, s))
        .join(""),
    ),
    { size: 160 },
  );
const LEAF_CARDS = [
  leafCluster("#4f8a36", "#66a23e", "#2f5d27"),
  leafCluster("#3f7632", "#5b9a3a", "#2a4f22"),
  leafCluster("#6f9f3a", "#8fb847", "#3f6a25"),
  leafCluster("#b2a83a", "#d0bb45", "#6d6a25"),
];

const fallen = (fill: string, vein: string) => svg(S(48, 64, oakLeaf(fill, vein, 24, 60, 0, 2.0)), { size: 192 });
const FALLEN = [
  fallen("#c9802f", "#7d4a1d"),
  fallen("#d9a93a", "#8a6a1d"),
  fallen("#a4492a", "#612a18"),
  fallen("#8a7a2e", "#544a1c"),
];

const grassClump = (colors: readonly string[]) => {
  let body = "";
  for (let i = 0; i < 9; i++) {
    const x0 = 6 + i * 4.5;
    const h = 20 + sr() * 24;
    const tx = x0 + (i - 4) * 3 + (sr() - 0.5) * 6;
    body += `<path d="M${x0 - 2.8} 48 Q${x0 - 1} ${48 - h * 0.6} ${tx} ${48 - h} Q${x0 + 2} ${48 - h * 0.45} ${x0 + 2.8} 48 Z" fill="${colors[i % colors.length]}"/>`;
  }
  return svg(S(48, 48, body), { size: 144 });
};
const GRASS_CARDS = [
  grassClump(["#5d9a3b", "#75b044", "#4a8232"]),
  grassClump(["#6fa843", "#8cbd4d", "#57903a"]),
  grassClump(["#8aa640", "#b0b84a", "#6c8c34"]),
];

const STEM = "#4f7d36";
const flowerStem = (curve = "M16 64 Q15 40 16 18") =>
  `<path d="${curve}" stroke="${STEM}" stroke-width="3" fill="none"/><ellipse cx="10" cy="48" rx="2.6" ry="6" transform="rotate(-50 10 48)" fill="${STEM}"/><ellipse cx="22" cy="42" rx="2.6" ry="6" transform="rotate(50 22 42)" fill="${STEM}"/>`;
const petals = (n: number, cx: number, cy: number, off: number, rx: number, ry: number, fill: string) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 360;
    return `<ellipse cx="${cx}" cy="${cy - off}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${cx} ${cy})" fill="${fill}"/>`;
  }).join("");
const FLOWERS = [
  // daisy
  svg(
    S(
      32,
      64,
      flowerStem() + petals(9, 16, 14, 7, 2.8, 5.6, "#fbfaf0") + `<circle cx="16" cy="14" r="3.8" fill="#f0b823"/>`,
    ),
    { size: 192 },
  ),
  // poppy
  svg(
    S(
      32,
      64,
      flowerStem() +
        [
          [-4.6, 0],
          [4.6, 0],
          [0, -4.6],
          [0, 4.6],
        ]
          .map(([dx, dy]) => `<circle cx="${16 + (dx ?? 0)}" cy="${14 + (dy ?? 0)}" r="6.6" fill="#d6382c"/>`)
          .join("") +
        `<circle cx="16" cy="14" r="3" fill="#2b1d1d"/>`,
    ),
    { size: 192 },
  ),
  // buttercup
  svg(
    S(
      32,
      64,
      flowerStem() + petals(5, 16, 14, 5.2, 4.6, 4.6, "#f4cf27") + `<circle cx="16" cy="14" r="3.2" fill="#dc9f16"/>`,
    ),
    { size: 192 },
  ),
  // bluebell
  svg(
    S(
      32,
      64,
      `<path d="M16 64 Q14 34 22 12" stroke="${STEM}" stroke-width="3" fill="none"/><ellipse cx="10" cy="54" rx="2.6" ry="7" transform="rotate(-40 10 54)" fill="${STEM}"/>` +
        [
          [21, 14, 5],
          [19, 23, 6],
          [16.5, 32, 6.5],
          [14.5, 41, 6],
        ]
          .map(
            ([x, y, w]) =>
              `<path d="M${x! - w! * 0.45} ${y} Q${x! - w! * 0.5} ${y! + 6} ${x! - w! * 0.9} ${y! + 9} L${x! + w! * 0.9} ${y! + 9} Q${x! + w! * 0.5} ${y! + 6} ${x! + w! * 0.45} ${y} Z" fill="#6a64c8" stroke="#6a64c8" stroke-width="1" stroke-linejoin="round"/><path d="M${x! - 1} ${y! + 9} L${x! + 1} ${y! + 9} L${x} ${y! + 11} Z" fill="#4d47a8"/>`,
          )
          .join(""),
    ),
    { size: 192 },
  ),
  // pink clover
  svg(
    S(
      32,
      64,
      flowerStem() +
        `<ellipse cx="16" cy="13" rx="7" ry="8.5" fill="#e0709d"/>` +
        [
          [13, 9],
          [19, 11],
          [15, 15],
          [19, 17],
          [12, 13],
        ]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.7" fill="#f3a8c4"/>`)
          .join(""),
    ),
    { size: 192 },
  ),
];

const SMOKE = svg(
  S(
    64,
    64,
    [
      [34, 46, 19, "#c4bfb7"],
      [22, 40, 12, "#c4bfb7"],
      [46, 38, 13, "#c4bfb7"],
      [32, 28, 12, "#c4bfb7"],
      [31, 43, 19, "#ece8e0"],
      [19, 37, 12, "#ece8e0"],
      [43, 35, 13, "#ece8e0"],
      [30, 25, 12, "#ece8e0"],
    ]
      .map(([x, y, r, f]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>`)
      .join(""),
  ),
  { size: 128 },
);

const FRINGE = svg(
  S(
    24,
    32,
    `<rect x="7" y="0" width="10" height="5" fill="#5d4630"/>` +
      [-9, -6, -3, -1, 1, 3, 6, 9]
        .map(
          (dx, i) =>
            `<path d="M${12 + dx * 0.25} 4 Q${12 + dx * 0.7} 16 ${12 + dx} ${26 + (i % 3) * 2}" stroke="${i % 2 ? "#c8b58a" : "#a8915f"}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
        )
        .join(""),
  ),
  { size: 192 },
);

const STREAMER = (a: string, b2: string) =>
  svg(
    S(
      8,
      32,
      [0, 1, 2, 3, 4, 5]
        .map((i) => `<rect x="0" y="${i * 5.4}" width="8" height="5.4" fill="${i % 2 ? b2 : a}"/>`)
        .join(""),
    ),
    { size: 128 },
  );

// Weathered soil cross-section wrapped round the plinth, with a grass lip. 1024 x 64 units, 1 unit = one texel.
const soilTexture = () => {
  let body = `<rect width="1024" height="64" fill="#6b4a32"/>`;
  const wave = (y: number, amp: number, fill: string, bottom: number) =>
    `<path d="M0 ${y} Q128 ${y - amp} 256 ${y} T512 ${y} T768 ${y} T1024 ${y} V${bottom} H0 Z" fill="${fill}"/>`;
  body += wave(12, 0, "#4a3324", 26);
  body += wave(26, 5, "#6b4a32", 40);
  body += wave(40, -5, "#8a6a48", 52);
  body += wave(52, 4, "#9a8a78", 64);
  // stones
  const stones: Array<[number, number, number, number, string]> = [
    [90, 34, 26, 8, "#8f958f"],
    [210, 46, 20, 6, "#b9b1a0"],
    [330, 30, 16, 6, "#7a807c"],
    [450, 56, 24, 7, "#a39c8f"],
    [600, 36, 28, 9, "#8f958f"],
    [730, 48, 18, 6, "#b9b1a0"],
    [860, 32, 22, 7, "#7a807c"],
    [960, 55, 20, 6, "#a39c8f"],
  ];
  for (const [x, y, rx, ry, f] of stones)
    body += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}"/><ellipse cx="${x - rx * 0.25}" cy="${y - ry * 0.3}" rx="${rx * 0.45}" ry="${ry * 0.35}" fill="#ffffff" opacity="0.28"/>`;
  // roots hanging from the lip
  for (const x of [150, 380, 640, 900])
    body += `<path d="M${x} 10 Q${x + 14} 26 ${x - 6} 36 Q${x - 18} 44 ${x - 10} 52" stroke="#b08a5c" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  // a buried shell spiral and an acorn, a worm
  body += `<path d="M300 44 a8 5 0 1 1 6 -6 a5 3 0 1 1 -4 4" stroke="#efe3c5" stroke-width="3" fill="none"/>`;
  body += `<ellipse cx="540" cy="44" rx="10" ry="6" fill="#c8964a"/><rect x="528" y="36" width="24" height="3" fill="#6b4a2a"/>`;
  body += `<path d="M770 40 q10 -6 20 0 t20 0 t20 0" stroke="#d98f86" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  // grass lip, period 32 so it closes round the plinth
  let lip = `M0 0 H1024 V9`;
  for (let x = 1024; x > 0; x -= 32) lip += ` L${x - 8} 19 L${x - 16} 10 L${x - 24} 22 L${x - 32} 9`;
  lip += " Z";
  body += `<path d="${lip}" fill="#6fa043"/>`;
  for (let x = 0; x < 1024; x += 64) body += `<rect x="${x + 6}" y="0" width="20" height="8" fill="#85b850"/>`;
  return svg(S(1024, 64, body), { size: 1024 });
};

// The meadow seen from above, draped over the mound (1.2 m across: 1 unit = 3 mm, up = back, right = +X).
const meadowTexture = () => {
  let body = "";
  for (let i = 0; i < 26; i++) {
    const a = sr() * Math.PI * 2;
    const r = 30 + sr() * 150;
    body += blob(
      200 + Math.cos(a) * r,
      200 + Math.sin(a) * r,
      18 + sr() * 26,
      14 + sr() * 20,
      pick(["#82b352", "#5f9440", "#8fbf58", "#74a84a"]),
    );
  }
  // bare earth: under the tree, the swing, the ladder foot and a path from the front
  body += blob(200, 198, 50, 46, "#8c6b47", 10);
  body += blob(80, 224, 24, 20, "#8c6b47", 8);
  body += blob(230, 314, 22, 16, "#8c6b47", 8);
  body += `<path d="M258 400 Q236 350 230 314 Q176 296 98 236" stroke="#a88d63" stroke-width="13" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  body += `<path d="M258 400 Q236 350 230 314" stroke="#b79c70" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  // pebbles in the path
  for (const [x, y] of [
    [246, 350],
    [236, 332],
    [200, 304],
    [150, 272],
    [120, 252],
  ])
    body += `<ellipse cx="${x}" cy="${y}" rx="3" ry="2" fill="#c9bea4"/>`;
  return svg(S(400, 400, body), { size: 800 });
};

// Bark decals
const barkPatch = (seed: number) => {
  const r = rng(seed);
  let body = "";
  for (let i = 0; i < 4; i++) {
    const x = 10 + i * 14 + r() * 4;
    body += `<path d="M${x} 2 L${x + 3 - r() * 6} 20 L${x - 2 + r() * 4} 40 L${x + 3 - r() * 6} 62 L${x + r() * 4} 86" stroke="#3a281c" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
    body += `<path d="M${x + 5} ${10 + r() * 10} l3 ${14 + r() * 10} l-2 6 z" fill="#8b6848"/>`;
  }
  body += `<circle cx="${18 + r() * 24}" cy="${30 + r() * 30}" r="3.5" fill="#9fb596"/><circle cx="${18 + r() * 24}" cy="${20 + r() * 40}" r="2.5" fill="#b4c4a8"/>`;
  return svg(S(60, 90, body), { size: 240 });
};
const BARK_PATCHES = [barkPatch(3), barkPatch(8), barkPatch(21)];
const MOSS = svg(
  S(
    60,
    50,
    blob(30, 26, 26, 18, "#58883a", 10) +
      blob(22, 24, 11, 8, "#77a94b", 7) +
      blob(40, 28, 10, 7, "#77a94b", 7) +
      `<circle cx="34" cy="20" r="1.8" fill="#3f6428"/><circle cx="18" cy="32" r="1.6" fill="#3f6428"/>`,
  ),
  { size: 180 },
);
const HEART = svg(
  S(
    40,
    40,
    `<path d="M20 35 C2 23 5 7 13 7 C17 7 20 12 20 12 C20 12 23 7 27 7 C35 7 38 23 20 35 Z" fill="#a88558" stroke="#2e1e14" stroke-width="2.6" stroke-linejoin="round"/><text x="20" y="24" font-family="DejaVu Sans, sans-serif" font-weight="bold" font-size="10" text-anchor="middle" fill="#2e1e14">J+M</text>`,
  ),
  { size: 200 },
);
const KNOT = svg(
  S(
    30,
    40,
    `<ellipse cx="15" cy="20" rx="12" ry="17" fill="#7a5a3c"/><ellipse cx="15" cy="21" rx="8" ry="12.5" fill="#2a1a12"/><ellipse cx="12" cy="15" rx="2.4" ry="3.6" fill="#5b4330"/>`,
  ),
  { size: 150 },
);

// Corrugated tin, 1 unit = 1 mm: u runs down the slope, v along the ridge. Rust, a bolted teal patch, nails.
const TIN = (() => {
  let body = `<rect width="190" height="280" fill="#aeb6b8"/>`;
  for (let y = 0; y < 280; y += 8)
    body += `<rect x="0" y="${y}" width="190" height="4" fill="#c4cbcd"/><rect x="0" y="${y + 4}" width="190" height="2" fill="#97a0a3"/>`;
  body += blob(9, 60, 13, 34, "#a3633f", 9) + blob(13, 70, 6, 14, "#7d4a30", 7);
  body += blob(182, 214, 12, 40, "#a3633f", 9) + blob(178, 226, 6, 14, "#7d4a30", 7);
  body += blob(120, 14, 26, 9, "#a3633f", 8) + blob(60, 268, 30, 8, "#a3633f", 8);
  body += `<rect x="70" y="150" width="62" height="56" fill="#5b8a93" stroke="#3e666d" stroke-width="2"/>`;
  for (const [x, y] of [
    [76, 156],
    [126, 156],
    [76, 200],
    [126, 200],
  ])
    body += `<circle cx="${x}" cy="${y}" r="2.2" fill="#2f3a3e"/>`;
  for (let i = 0; i < 6; i++)
    body += `<path d="M${150 + i * 6} 0 l1.6 ${16 + (i % 3) * 14}" stroke="#8a5a3c" stroke-width="1.8" fill="none"/>`;
  for (let i = 0; i < 7; i++) body += `<circle cx="${8 + (i % 2) * 4}" cy="${20 + i * 40}" r="2" fill="#3a4448"/>`;
  return svg(S(190, 280, body), { size: 570 });
})();

// Front wall overlay: nails, rust runs, flaking paint, door, name plate, a growth chart. 240 x 200 units = mm.
const frontWall = (() => {
  let body = "";
  for (let i = 0; i < 10; i++) {
    const cx = 12 + i * 24;
    for (const y of [10, 100, 190]) body += `<circle cx="${cx}" cy="${y}" r="1.5" fill="#2d3b3a"/>`;
    if (i % 3 === 1)
      body += `<path d="M${cx + 1} 12 l1.4 ${18 + (i % 4) * 8}" stroke="#8c5a3a" stroke-width="1.6" fill="none"/>`;
  }
  body += `<rect x="0" y="188" width="240" height="12" fill="#d9a441"/>`;
  for (let x = 4; x < 240; x += 18) body += `<path d="M${x} 188 l4 -4 l4 4" fill="#d9a441"/>`;
  // flaking paint showing cream undercoat
  for (const [x, y, w, h] of [
    [112, 150, 14, 8],
    [196, 160, 10, 14],
    [30, 30, 9, 6],
    [150, 20, 12, 7],
    [218, 100, 8, 12],
    [100, 40, 7, 5],
  ])
    body += `<polygon points="${x},${y} ${x! + w!},${y! + 2} ${x! + w! - 3},${y! + h!} ${x! + 2},${y! + h! - 2}" fill="#efe6cf"/>`;
  // door
  body += `<rect x="21" y="64" width="68" height="136" fill="#eadfc4"/>`;
  body += `<rect x="26" y="70" width="58" height="130" fill="#b98a54"/>`;
  for (const x of [40, 55, 69]) body += `<path d="M${x} 70 V200" stroke="#7f5a34" stroke-width="1.6"/>`;
  body += `<path d="M28 84 H82 M28 176 H82" stroke="#6d4a2a" stroke-width="7"/>`;
  body += `<path d="M30 174 L80 88" stroke="#6d4a2a" stroke-width="6"/>`;
  body += `<circle cx="73" cy="136" r="5.5" fill="#2c2a28"/><circle cx="73" cy="136" r="3" fill="#e0b640"/>`;
  body += `<circle cx="55" cy="108" r="11" fill="#eadfc4"/><circle cx="55" cy="108" r="8" fill="#2d2a35"/><path d="M47 108 H63 M55 100 V116" stroke="#eadfc4" stroke-width="1.6"/>`;
  // name plate
  body += `<rect x="28" y="36" width="54" height="22" fill="#f1e3bb" stroke="#6d4a2a" stroke-width="2"/>`;
  body += `<text x="55" y="53" font-family="DejaVu Sans, sans-serif" font-weight="bold" font-size="14" text-anchor="middle" fill="#b9553f" rotate="-2 1 -1 2">CLUB</text>`;
  // growth chart between door and window
  body += `<path d="M112 70 V180" stroke="#5a2a1e" stroke-width="1.2"/>`;
  for (let i = 0; i < 9; i++)
    body += `<path d="M112 ${180 - i * 12} h${i % 2 ? 6 : 10}" stroke="#5a2a1e" stroke-width="1.4"/>`;
  body += `<path d="M112 120 h14" stroke="#b9553f" stroke-width="2"/><path d="M112 96 h14" stroke="#2f6d8a" stroke-width="2"/>`;
  return svg(S(240, 200, body), { size: 960 });
})();

const WINDOW = svg(
  S(
    70,
    80,
    `<rect width="70" height="80" fill="#ffd87a"/>` +
      `<polygon points="0,0 22,0 0,46" fill="#c9523f"/><polygon points="70,0 48,0 70,46" fill="#c9523f"/>` +
      `<path d="M35 0 V80 M0 40 H70" stroke="#6b4b2e" stroke-width="5"/>` +
      `<path d="M26 80 v-12 h18 v12 z" fill="#8a4f34"/><path d="M35 68 v-14 M35 62 l-7 -6 M35 60 l7 -8" stroke="#3f6d3a" stroke-width="3" fill="none"/>`,
  ),
  { size: 280 },
);

const GABLE = svg(
  S(
    240,
    100,
    `<polygon points="0,100 240,100 120,0" fill="#d8c7a0"/>` +
      Array.from(
        { length: 9 },
        (_, i) =>
          `<path d="M${(i + 1) * 24} 100 L${120 + (Math.min((i + 1) * 24, 240 - (i + 1) * 24) - 120) * 0 + 0} 100" stroke="none"/>`,
      ).join("") +
      Array.from({ length: 9 }, (_, i) => {
        const x = (i + 1) * 24;
        const top = 100 - Math.min(x, 240 - x) * (100 / 120);
        return `<path d="M${x} 100 V${top + 2}" stroke="#b7a57a" stroke-width="1.8"/>`;
      }).join("") +
      `<circle cx="120" cy="62" r="24" fill="#6d4a2a"/>` +
      `<path d="M72 100 L120 4 L168 100" stroke="none" fill="none"/>` +
      Array.from({ length: 4 }, (_, i) => `<circle cx="${30 + i * 60}" cy="92" r="1.6" fill="#3a3024"/>`).join(""),
  ),
  { size: 960 },
);
const GABLE_GLASS = svg(
  S(
    40,
    40,
    `<circle cx="20" cy="20" r="20" fill="#ffd87a"/><path d="M20 0 V40 M0 20 H40" stroke="#6b4b2e" stroke-width="3.5"/><path d="M6 34 L34 34 L20 28 Z" fill="#e9a94a"/>`,
  ),
  { size: 160 },
);

const DOORMAT = svg(
  S(
    40,
    24,
    `<rect width="40" height="24" fill="#7a5a30"/><path d="M0 6 H40 M0 12 H40 M0 18 H40" stroke="#5d4322" stroke-width="2"/><text x="20" y="16" font-family="DejaVu Sans, sans-serif" font-weight="bold" font-size="8" text-anchor="middle" fill="#f1e3bb">HI</text>`,
  ),
  { size: 200 },
);

const ivyLeaf = (fill: string, vein: string) =>
  svg(
    S(
      32,
      32,
      `<polygon points="16,31 7,25 2,16 9,11 13,14 16,2 19,14 23,11 30,16 25,25" fill="${fill}" stroke="${fill}" stroke-width="2" stroke-linejoin="round"/><path d="M16 30 V8 M16 22 L8 17 M16 22 L24 17" stroke="${vein}" stroke-width="1.6" fill="none"/>`,
    ),
    { size: 128 },
  );
const IVY = [ivyLeaf("#3d6f34", "#7fae5a"), ivyLeaf("#4f8a3c", "#9cc673")];

const PLAQUE = svg(
  S(
    140,
    36,
    `<rect x="1.5" y="1.5" width="137" height="33" rx="3" fill="#c9a54a" stroke="#7a5f24" stroke-width="3"/>` +
      `<text x="14" y="23" textLength="112" lengthAdjust="spacingAndGlyphs" font-family="DejaVu Serif, serif" font-weight="bold" font-size="14" fill="#3a2a10">OLD OAK CLUB</text>` +
      [
        [7, 7],
        [133, 7],
        [7, 29],
        [133, 29],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#7a5f24"/>`)
        .join(""),
  ),
  { size: 700 },
);

// Hand-painted signs, 1 unit = 1 mm
const SIGN_W = 168;
const SIGN_H = 54;
const SIGN1_POLY: Array<[number, number]> = [
  [0, 27],
  [24, 0],
  [168, 0],
  [168, 54],
  [24, 54],
];
const SIGN1 = svg(
  S(
    SIGN_W,
    SIGN_H,
    `<polygon points="${SIGN1_POLY.map((p) => p.join(",")).join(" ")}" fill="#4f7f5b" stroke="#2f4d38" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M30 6 H162" stroke="#6f9f7a" stroke-width="2"/>` +
      `<text x="38" y="36" textLength="120" lengthAdjust="spacingAndGlyphs" font-family="DejaVu Sans, sans-serif" font-weight="bold" font-size="22" fill="#f4ead0" rotate="-3 2 -1 3 -2 1 -3 2 -1">CLUBHOUSE</text>` +
      [50, 72, 130].map((x) => `<path d="M${x} 40 v6" stroke="#f4ead0" stroke-width="2.4"/>`).join("") +
      `<circle cx="28" cy="27" r="2.4" fill="#2f4d38"/><circle cx="160" cy="8" r="2" fill="#2f4d38"/><circle cx="160" cy="46" r="2" fill="#2f4d38"/>`,
  ),
  { size: 840 },
);
const SIGN2_W = 150;
const SIGN2_H = 46;
const SIGN2 = svg(
  S(
    SIGN2_W,
    SIGN2_H,
    `<rect x="1.5" y="1.5" width="147" height="43" fill="#d9c38f" stroke="#7a5a34" stroke-width="3"/>` +
      [10, 22, 34].map((y) => `<path d="M4 ${y} H146" stroke="#c6ad74" stroke-width="1.6"/>`).join("") +
      `<text x="10" y="30" textLength="130" lengthAdjust="spacingAndGlyphs" font-family="DejaVu Sans, sans-serif" font-weight="bold" font-size="18" fill="#b23a2c" rotate="2 -2 3 -1 1 0 -2 3 -1 2 -2 1">NO GROWN-UPS</text>` +
      `<circle cx="8" cy="8" r="2" fill="#4a3826"/><circle cx="142" cy="38" r="2" fill="#4a3826"/>`,
  ),
  { size: 750 },
);

const TYRE = svg(
  S(
    210,
    100,
    `<rect width="210" height="100" fill="#26262a"/>` +
      Array.from(
        { length: 14 },
        (_, i) => `<rect x="${i * 15 + 2}" y="30" width="10" height="40" fill="#3c3c44"/>`,
      ).join("") +
      `<rect x="0" y="8" width="210" height="6" fill="#d8d8cf"/>` +
      `<polygon points="30,74 60,74 50,92 20,92" fill="#4a4a52"/>`,
  ),
  { size: 420 },
);
const SPOKES = svg(
  S(
    100,
    100,
    Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return `<path d="M${50 + Math.cos(a) * 7} ${50 + Math.sin(a) * 7} L${50 + Math.cos(a + 0.22) * 47} ${50 + Math.sin(a + 0.22) * 47}" stroke="#dfe5e8" stroke-width="3.6" fill="none"/>`;
    }).join("") + `<circle cx="50" cy="50" r="8" fill="#8a9499"/><circle cx="50" cy="50" r="3" fill="#4a5258"/>`,
  ),
  { size: 400 },
);
const WEAVE = svg(
  S(
    48,
    32,
    `<rect width="48" height="32" fill="#c9a25e"/>` +
      [0, 1, 2, 3].map((i) => `<rect x="0" y="${i * 8 + 5}" width="48" height="2.6" fill="#9f7a3a"/>`).join("") +
      Array.from(
        { length: 12 },
        (_, i) => `<rect x="${i * 4 + 1}" y="0" width="1.8" height="32" fill="#a9803f"/>`,
      ).join(""),
  ),
  { size: 192 },
);
const bunting = (fill: string, accent: string) =>
  svg(
    S(
      32,
      24,
      `<polygon points="0,0 32,0 16,24" fill="${fill}" stroke="${fill}" stroke-width="1"/><path d="M16 6 l-5 8 h10 z" fill="${accent}"/>`,
    ),
    { size: 128 },
  );
const BUNTING = [
  bunting("#e0b640", "#b9553f"),
  bunting("#5d9d9b", "#e7dcc0"),
  bunting("#b9553f", "#e0b640"),
  bunting("#e7dcc0", "#5d9d9b"),
];

// ---------------------------------------------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "treehouseDiorama" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const R = rng(7);

  const box = (w: number, h: number, d: number, color: string, at: V, rot?: V, bone: Joint = base) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot });
  const rod = (p: V, q: V, r: number, color: string, sides = 5, bone: Joint = base) =>
    b.rod(p, q, r, { color, sides, smooth: false, bone });
  const ropeSweep = (path: V[], r: number, color: string, bone: Joint = base, smoothPath = false) =>
    b.sweep(smoothPath ? catmull(path) : polyline(path), r, { color, sides: 5, smooth: false, bone, caps: "flat" });
  const polar = (r: number, azDeg: number): [number, number] => [
    r * Math.sin((azDeg * Math.PI) / 180),
    r * Math.cos((azDeg * Math.PI) / 180),
  ];

  // --- ground: soil plinth with strata, grassy mound ------------------------------------------------------------
  const PLINTH_H = 0.09;
  b.part(new THREE.CylinderGeometry(0.6, 0.6, PLINTH_H, 12, 1, true), "#ffffff", {
    bone: base,
    at: [0, PLINTH_H / 2, 0],
    texture: soilTexture(),
    flat: true,
  });
  b.part(new THREE.CircleGeometry(0.6, 12), PLINTH_BOT, { bone: base, at: [0, 0.001, 0], rotation: [90, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.14, 0.036), "#ffffff", {
    bone: base,
    at: [0.1505, 0.045, 0.5618],
    rotation: [0, 15, 0],
    texture: PLAQUE,
  });

  const profile = [
    [0.6, PLINTH_H],
    [0.54, 0.105],
    [0.46, 0.135],
    [0.36, 0.175],
    [0.24, 0.215],
    [0.12, 0.243],
    [0, 0.252],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const moundGeo = new THREE.LatheGeometry(profile, 12);
  {
    const pos = moundGeo.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const rad = Math.hypot(x, z);
      if (rad > 0.05 && rad < 0.56) {
        const h = Math.sin(Math.round(x * 400) * 12.9898 + Math.round(z * 400) * 78.233) * 43758.5453;
        pos.setY(i, y + (h - Math.floor(h) - 0.5) * 0.014);
      }
    }
    moundGeo.computeVertexNormals();
  }
  const mound = b.part(moundGeo, GRASS, { bone: base, at: [0, 0, 0], flat: true, name: "mound" });
  const moundSurf = b.surface(mound);
  const gy = (x: number, z: number) => moundSurf.ray([x, 1, z], [0, -1, 0])?.at.y ?? PLINTH_H;
  b.decal(moundSurf, meadowTexture(), {
    at: [0, 0.3, 0],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    size: [1.2, 1.2],
    segments: 34,
    lift: 0.0015,
    bone: base,
  });

  // --- the oak: trunk on a chain, roots, branches ---------------------------------------------------------------
  const trunkPath = catmull([
    [0, 0.12, 0],
    [0, 0.3, 0.005],
    [-0.012, 0.5, 0],
    [-0.02, 0.68, -0.012],
    [-0.012, 0.84, -0.02],
    [0, 0.98, -0.03],
    [0, 1.1, -0.04],
  ]);
  const trunkTube = b.sweep(trunkPath, [0.14, 0.088, 0.072, 0.064, 0.054, 0.042, 0.026], {
    bone: base,
    color: BARK,
    sides: 7,
    smooth: false,
    caps: { start: "flat", end: "round" },
    name: "trunk",
  });
  const trunkSurf = b.surface(trunkTube);
  const axisAt = (y: number) => trunkPath.at(trunkPath.closestT([0, y, 0]));

  // roots gripping the mound
  for (const az of [-160, -110, 38, 84, 128, 172]) {
    const [x0, z0] = polar(0.075, az);
    const [x1, z1] = polar(0.16, az + 6);
    const [x2, z2] = polar(0.3 + R() * 0.05, az + 12);
    const pts: V[] = [
      [x0, gy(x0, z0) + 0.07, z0],
      [x1, gy(x1, z1) + 0.018, z1],
      [x2, gy(x2, z2) - 0.004, z2],
    ];
    b.sweep(catmull(pts), [0.036, 0.01], { color: BARK, sides: 5, smooth: false, bone: base, caps: "round" });
  }

  // branches: [name, y on trunk, azimuth, path after the start, radius, leaf blobs (centre, radius)]
  type BlobSpec = [V, number];
  const branches: Array<[string, number, number, V[], [number, number], BlobSpec[]]> = [
    [
      "brLeft",
      0.72,
      -72,
      [
        [-0.14, 0.76, 0.03],
        [-0.27, 0.86, 0.04],
        [-0.38, 0.94, 0.02],
      ],
      [0.038, 0.011],
      [
        [[-0.38, 0.97, 0.02], 0.145],
        [[-0.24, 0.99, -0.07], 0.12],
      ],
    ],
    [
      "brRight",
      0.78,
      96,
      [
        [0.13, 0.88, -0.02],
        [0.27, 0.97, -0.06],
        [0.37, 1.02, -0.06],
      ],
      [0.036, 0.011],
      [
        [[0.36, 1.05, -0.07], 0.145],
        [[0.2, 1.11, -0.12], 0.12],
      ],
    ],
    [
      "brBack",
      0.74,
      185,
      [
        [-0.04, 0.86, -0.15],
        [-0.05, 0.97, -0.27],
        [-0.02, 1.05, -0.37],
      ],
      [0.036, 0.011],
      [
        [[-0.02, 1.08, -0.37], 0.155],
        [[-0.06, 1.04, -0.22], 0.13],
      ],
    ],
    [
      "brBackL",
      0.84,
      -132,
      [
        [-0.13, 0.96, -0.1],
        [-0.23, 1.04, -0.2],
        [-0.3, 1.1, -0.27],
      ],
      [0.03, 0.009],
      [[[-0.3, 1.13, -0.27], 0.135]],
    ],
    [
      "brBackR",
      0.86,
      142,
      [
        [0.13, 0.98, -0.12],
        [0.23, 1.06, -0.2],
        [0.3, 1.12, -0.27],
      ],
      [0.03, 0.009],
      [[[0.3, 1.14, -0.27], 0.13]],
    ],
    [
      "brFront",
      0.9,
      22,
      [
        [0.04, 0.98, 0.13],
        [0.07, 1.04, 0.22],
      ],
      [0.026, 0.009],
      [[[0.07, 1.07, 0.23], 0.11]],
    ],
  ];
  const foliage: THREE.Mesh[] = [];
  const jitterBlob = (r: number) => {
    const g = new THREE.IcosahedronGeometry(r, 1);
    const pos = g.getAttribute("position");
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const h = Math.sin(v.x * 311.7 + v.y * 183.3 + v.z * 97.1) * 43758.5453;
      v.multiplyScalar(0.86 + (h - Math.floor(h)) * 0.3);
      v.y *= 0.82;
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    return g;
  };
  let blobCount = 0;
  const addBlob = (c: V, r: number, bone: Joint) => {
    const color = blobCount % 7 === 6 ? GOLD_LEAF : LEAF[blobCount % LEAF.length]!;
    blobCount++;
    const p = b.part(jitterBlob(r), color, { bone, at: c, flat: true, rotation: [0, blobCount * 40, 0] });
    foliage.push(p.mesh);
  };
  for (const [name, y, az, pts, rad, blobs] of branches) {
    const ax = axisAt(y);
    const hit = trunkSurf.around([ax.x, y, ax.z]).at(az, 0);
    if (!hit) throw new Error(`no trunk hit for ${name}`);
    const br = b.sprout(name, hit, catmull([hit, ...pts]), rad, {
      count: 3,
      color: BARK,
      sides: 6,
      smooth: false,
      role: "arm",
      caps: "round",
    });
    const joints = br.chain!.joints;
    for (const [c, r] of blobs) addBlob(c, r, joints[joints.length - 1]!);
  }
  // crown on the trunk tip
  const trunkTip = base;
  addBlob([0.0, 1.18, -0.06], 0.17, trunkTip);
  addBlob([-0.14, 1.1, -0.1], 0.13, trunkTip);
  addBlob([0.14, 1.11, -0.12], 0.13, trunkTip);

  // bark detail: cracks, moss, a knot hole and a carved heart
  const bark = (tex: THREE.Texture, y: number, az: number, w: number, h: number) => {
    const ax = axisAt(y);
    const hit = trunkSurf.around([ax.x, y, ax.z]).at(az, 0);
    if (hit) b.decal(trunkSurf, tex, { at: hit, size: [w, h], segments: [6, 9], lift: 0.0015, up: [0, 1, 0] });
  };
  bark(BARK_PATCHES[0]!, 0.36, 10, 0.1, 0.15);
  bark(BARK_PATCHES[1]!, 0.46, -60, 0.11, 0.16);
  bark(BARK_PATCHES[2]!, 0.6, 60, 0.1, 0.15);
  bark(BARK_PATCHES[1]!, 0.72, -25, 0.1, 0.14);
  bark(BARK_PATCHES[0]!, 0.85, 150, 0.09, 0.13);
  bark(BARK_PATCHES[2]!, 0.4, 120, 0.12, 0.17);
  bark(BARK_PATCHES[0]!, 0.3, -130, 0.12, 0.17);
  bark(MOSS, 0.3, -40, 0.11, 0.09);
  bark(MOSS, 0.52, 100, 0.09, 0.075);
  bark(KNOT, 0.44, 28, 0.04, 0.055);
  bark(HEART, 0.54, -8, 0.055, 0.055);
  bark(BARK_PATCHES[1]!, 0.42, 78, 0.11, 0.16);
  bark(BARK_PATCHES[2]!, 0.64, -100, 0.1, 0.15);
  bark(BARK_PATCHES[0]!, 0.5, 205, 0.12, 0.17);
  bark(MOSS, 0.6, -150, 0.08, 0.07);
  // ivy climbing the front-left of the trunk
  {
    const rough = catmull(
      Array.from({ length: 9 }, (_, i): V => {
        const t = i / 8;
        const y = 0.2 + 0.5 * t;
        const c = axisAt(y);
        const [x, z] = polar(0.14, -150 + 115 * t + Math.sin(t * 9) * 8);
        return [c.x + x, y, c.z + z];
      }),
    );
    const vine = trunkSurf.drape(rough, { lift: 0.004 });
    b.sweep(vine, 0.0035, { color: "#3f5d2f", sides: 4, smooth: false, bone: base, caps: "flat" });
    const leaves = Array.from({ length: 34 }, (_, i) => trunkSurf.nearest(vine.at((i + 0.5) / 34)));
    b.cards(leaves, IVY, {
      size: [0.036, 0.036],
      lean: 70,
      flow: [0, -1, 0],
      spin: 150,
      vary: 0.3,
      rng: rng(61),
      bone: base,
      sink: 0.05,
    });
  }

  // --- mushrooms, rocks ------------------------------------------------------------------------------------------
  const mushroom = (x: number, z: number, s: number) => {
    const y = gy(x, z);
    b.part(new THREE.CylinderGeometry(0.006 * s, 0.008 * s, 0.03 * s, 6), "#efe6cf", {
      bone: base,
      at: [x, y + 0.012 * s, z],
    });
    b.part(new THREE.SphereGeometry(0.02 * s, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), RED, {
      bone: base,
      at: [x, y + 0.026 * s, z],
      flat: true,
    });
    for (const [dx, dz, dy] of [
      [0.008, 0.004, 0.018],
      [-0.006, 0.009, 0.016],
      [-0.01, -0.005, 0.014],
      [0.004, -0.011, 0.014],
    ] as const)
      b.part(new THREE.SphereGeometry(0.0035 * s, 4, 3), "#f7f1df", {
        bone: base,
        at: [x + dx * s, y + (0.026 + dy) * s, z + dz * s],
        flat: true,
      });
  };
  for (const [x, z, s] of [
    [0.15, 0.12, 1],
    [0.19, 0.1, 0.7],
    [0.165, 0.15, 0.55],
    [-0.2, -0.12, 0.9],
    [-0.23, -0.1, 0.6],
  ] as const)
    mushroom(x, z, s);
  const rocks: Array<[number, number, number, number]> = [
    [-0.33, 0.25, 0.03, 0],
    [-0.4, 0.12, 0.022, 1],
    [0.36, 0.3, 0.026, 2],
    [0.3, -0.3, 0.035, 0],
    [-0.12, -0.36, 0.028, 1],
    [0.12, 0.47, 0.02, 2],
  ];
  for (const [x, z, s, c] of rocks)
    b.part(new THREE.DodecahedronGeometry(s, 0), ROCK[c]!, {
      bone: base,
      at: [x, gy(x, z) + s * 0.25, z],
      scale: [1.3, 0.7, 1],
      rotation: [0, x * 400, 0],
      flat: true,
    });

  // --- treehouse --------------------------------------------------------------------------------------------------
  const DECK_Y = 0.58;
  const DX0 = -0.12;
  const DX1 = 0.36;
  const DZ0 = -0.14;
  const DZ1 = 0.25;
  // deck planks run along X, stacked along Z
  const nPlanks = 10;
  const pd = (DZ1 - DZ0) / nPlanks;
  for (let i = 0; i < nPlanks; i++)
    box(DX1 - DX0 - (i % 3) * 0.01, 0.014, pd - 0.003, DECK[i % DECK.length]!, [
      (DX0 + DX1) / 2 + (i % 3) * 0.005,
      DECK_Y - 0.007 + (R() - 0.5) * 0.002,
      DZ0 + pd * (i + 0.5),
    ]);
  // joists and bearers
  for (const z of [-0.1, 0.055, 0.21]) box(DX1 - DX0 + 0.04, 0.03, 0.03, TIMBER, [(DX0 + DX1) / 2, DECK_Y - 0.029, z]);
  for (const x of [0.0, 0.3]) box(0.03, 0.028, DZ1 - DZ0 + 0.03, TIMBER_L, [x, DECK_Y - 0.059, (DZ0 + DZ1) / 2]);
  // braces from the trunk
  rod([0.03, 0.36, 0.06], [0.3, 0.52, 0.21], 0.011, TIMBER, 4);
  rod([0.03, 0.36, -0.05], [0.3, 0.52, -0.1], 0.011, TIMBER, 4);
  rod([-0.05, 0.38, 0.05], [-0.1, 0.52, 0.21], 0.009, TIMBER, 4);
  for (const p of [
    [0.3, 0.52, 0.21],
    [0.3, 0.52, -0.1],
    [-0.1, 0.52, 0.21],
  ] as V[])
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 6), STEEL_D, {
      bone: base,
      at: [p[0], p[1], p[2] + 0.017],
      rotation: [90, 0, 0],
    });
  // door mat at the porch
  b.part(new THREE.PlaneGeometry(0.05, 0.03), "#ffffff", {
    bone: base,
    at: [0.115, DECK_Y + 0.001, 0.14],
    rotation: [-90, 0, 0],
    texture: DOORMAT,
  });

  // house box
  const HX0 = 0.06;
  const HX1 = 0.3;
  const HZ0 = -0.12;
  const HZ1 = 0.1;
  const WH = 0.2;
  const board = (cx: number, cz: number, w: number, d: number, color: string, hJit: number) =>
    box(w, WH + hJit, d, color, [cx, DECK_Y + (WH + hJit) / 2, cz]);
  const frontN = 10;
  const fw = (HX1 - HX0) / frontN;
  const frontCols = [
    "#5d9d9b",
    "#6fb0a8",
    "#4d8c90",
    "#6fb0a8",
    "#5d9d9b",
    "#d9a441",
    "#4d8c90",
    "#6fb0a8",
    "#b9553f",
    "#5d9d9b",
  ];
  for (let i = 0; i < frontN; i++)
    board(HX0 + fw * (i + 0.5), HZ1 - 0.004, fw - 0.0015, 0.008, frontCols[i]!, (R() - 0.5) * 0.004);
  const backN = 10;
  for (let i = 0; i < backN; i++)
    board(HX0 + fw * (i + 0.5), HZ0 + 0.004, fw - 0.0015, 0.008, WALL_RAW[i % WALL_RAW.length]!, (R() - 0.5) * 0.006);
  const sideN = 9;
  const sw = (HZ1 - HZ0 - 0.016) / sideN;
  for (let i = 0; i < sideN; i++) {
    const z = HZ0 + 0.008 + sw * (i + 0.5);
    board(
      HX1 - 0.004,
      z,
      0.008,
      sw - 0.0015,
      i === 3 ? "#e6d8b2" : WALL_RAW[(i * 2) % WALL_RAW.length]!,
      (R() - 0.5) * 0.006,
    );
    board(HX0 + 0.004, z, 0.008, sw - 0.0015, WALL_RAW[(i * 3 + 1) % WALL_RAW.length]!, (R() - 0.5) * 0.006);
  }
  // interior floor shadow so the walls read as a room seen through gaps
  box(HX1 - HX0 - 0.016, 0.004, HZ1 - HZ0 - 0.016, "#3a2a1f", [(HX0 + HX1) / 2, DECK_Y + 0.003, (HZ0 + HZ1) / 2]);
  // corner posts
  for (const x of [HX0, HX1])
    for (const z of [HZ0, HZ1]) box(0.014, WH + 0.012, 0.014, TIMBER, [x, DECK_Y + (WH + 0.012) / 2, z]);
  // top plate
  box(HX1 - HX0 + 0.016, 0.01, 0.012, TIMBER, [(HX0 + HX1) / 2, DECK_Y + WH + 0.002, HZ1 + 0.001]);
  box(HX1 - HX0 + 0.016, 0.01, 0.012, TIMBER, [(HX0 + HX1) / 2, DECK_Y + WH + 0.002, HZ0 - 0.001]);

  // front overlay (door, nails, chart) and glowing window
  b.part(new THREE.PlaneGeometry(HX1 - HX0, WH), "#ffffff", {
    bone: base,
    at: [(HX0 + HX1) / 2, DECK_Y + WH / 2, HZ1 + 0.0012],
    texture: frontWall,
  });
  const WIN_C: V = [0.235, 0.685, HZ1 + 0.0028];
  glow(b.part(new THREE.PlaneGeometry(0.07, 0.08), "#ffffff", { bone: base, at: WIN_C, texture: WINDOW }), 1.1);
  for (const [dx, dy, w, h] of [
    [0, 0.044, 0.084, 0.008],
    [0, -0.044, 0.088, 0.01],
    [-0.039, 0, 0.008, 0.088],
    [0.039, 0, 0.008, 0.088],
  ] as const)
    box(w, h, 0.01, CREAM, [WIN_C[0] + dx, WIN_C[1] + dy, HZ1 + 0.004]);
  // window box with flowers
  box(0.092, 0.03, 0.026, "#8a4f34", [WIN_C[0], 0.632, HZ1 + 0.016]);
  box(0.092, 0.006, 0.028, "#6d3c28", [WIN_C[0], 0.648, HZ1 + 0.016]);
  b.cards(
    Array.from({ length: 9 }, (_, i) =>
      frame([WIN_C[0] - 0.038 + i * 0.0095, 0.65, HZ1 + 0.012 + (i % 2) * 0.008], [0, 1, 0]),
    ),
    FLOWERS,
    { size: [0.028, 0.05], vary: 0.25, rng: rng(5), bone: base, cross: true, flow: [0, 0, 1], lean: 10 },
  );
  // door lintel and step
  box(0.08, 0.012, 0.018, TIMBER, [0.117, DECK_Y + 0.135, HZ1 + 0.008]);
  box(0.07, 0.012, 0.03, TIMBER_L, [0.115, DECK_Y + 0.006, HZ1 + 0.02]);
  box(0.008, 0.136, 0.012, TIMBER, [0.078, DECK_Y + 0.068, HZ1 + 0.006]);
  box(0.008, 0.136, 0.012, TIMBER, [0.154, DECK_Y + 0.068, HZ1 + 0.006]);

  // gables
  const gableTri: Array<[number, number]> = [
    [-0.12, 0],
    [0.12, 0],
    [0, 0.1],
  ];
  for (const z of [HZ1 - 0.004, HZ0 + 0.004])
    b.extrude(gableTri, {
      at: [(HX0 + HX1) / 2, DECK_Y + WH, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      color: z > 0 ? "#d8c7a0" : WALL_RAW[1]!,
      bone: base,
    });
  b.part(new THREE.PlaneGeometry(0.24, 0.1), "#ffffff", {
    bone: base,
    at: [(HX0 + HX1) / 2, DECK_Y + WH + 0.05, HZ1 + 0.0012],
    texture: GABLE,
  });
  glow(
    b.part(new THREE.CircleGeometry(0.0185, 10), "#ffffff", {
      bone: base,
      at: [(HX0 + HX1) / 2, DECK_Y + WH + 0.0385, HZ1 + 0.0026],
      texture: GABLE_GLASS,
    }),
    1.1,
  );

  // roof: two tin panels, ridge cap, barge boards, chimney
  const RIDGE: V = [0.18, DECK_Y + WH + 0.1, 0];
  const slope = Math.hypot(0.12, 0.1);
  const slopeAng = Math.atan2(0.1, 0.12);
  const panelLen = slope + 0.04;
  const roofZ = 0.3;
  for (const s of [1, -1]) {
    const dx = s * Math.cos(slopeAng);
    const dy = -Math.sin(slopeAng);
    const half = panelLen / 2 - 0.012;
    const nx = -dy * s; // outward normal x (perpendicular to slope, up side)
    const ny = Math.cos(slopeAng);
    b.part(new THREE.BoxGeometry(panelLen, 0.01, roofZ), "#ffffff", {
      bone: base,
      at: [RIDGE[0] + dx * half + nx * 0.007, RIDGE[1] + dy * half + ny * 0.007, 0.0],
      rotation: [0, 0, s * -slopeAng * (180 / Math.PI) + (s < 0 ? 180 : 0)],
      texture: TIN,
    });
    // barge boards along both gable edges
    for (const z of [roofZ / 2 - 0.004, -roofZ / 2 + 0.004])
      rod(
        [RIDGE[0] + dx * (panelLen - 0.012), RIDGE[1] + dy * (panelLen - 0.012) + 0.0, z],
        [RIDGE[0], RIDGE[1] + 0.002, z],
        0.0065,
        CREAM,
        4,
      );
  }
  b.rod([RIDGE[0], RIDGE[1] + 0.006, -roofZ / 2 - 0.004], [RIDGE[0], RIDGE[1] + 0.006, roofZ / 2 + 0.004], 0.008, {
    color: TIMBER,
    sides: 4,
    smooth: false,
    bone: base,
  });
  // chimney with smoke
  const CH: V = [0.26, 0.808, -0.07];
  b.part(new THREE.CylinderGeometry(0.0115, 0.0115, 0.1, 7), "#7b5a4a", {
    bone: base,
    at: [CH[0], CH[1] + 0.035, CH[2]],
    flat: true,
  });
  b.part(new THREE.ConeGeometry(0.02, 0.014, 7), STEEL, { bone: base, at: [CH[0], CH[1] + 0.092, CH[2]], flat: true });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.008, 7), STEEL, {
    bone: base,
    at: [CH[0], CH[1] - 0.004, CH[2]],
    flat: true,
  });
  b.cards(
    [0, 1, 2, 3].map((i) => frame([CH[0] + 0.012 * i, CH[1] + 0.108 + 0.05 * i, CH[2] + 0.03 * i], [0, 1, 0])),
    SMOKE,
    { size: [0.07, 0.07], vary: 0.15, rng: rng(9), bone: base, cross: true, flow: [0, 0, 1], sink: 0 },
  );
  // pennant
  const PP: V = [0.18, RIDGE[1] + 0.008, roofZ / 2 - 0.01];
  rod(PP, [PP[0], PP[1] + 0.11, PP[2]], 0.0035, TIMBER_L, 4);
  b.extrude(
    [
      [0, 0],
      [0.085, -0.008],
      [0.04, -0.02],
      [0.092, -0.034],
      [0, -0.042],
    ],
    { at: [PP[0] + 0.002, PP[1] + 0.11, PP[2]], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.003, color: RED, bone: base },
  );

  // porch railing with a gap for the ladder
  const RAIL_H = 0.082;
  const post = (x: number, z: number) => box(0.012, RAIL_H, 0.012, TIMBER_L, [x, DECK_Y + RAIL_H / 2, z]);
  const railX = (x0: number, x1: number, z: number) => {
    rod([x0, DECK_Y + RAIL_H - 0.004, z], [x1, DECK_Y + RAIL_H - 0.004, z], 0.0055, TIMBER, 4);
    rod([x0, DECK_Y + 0.04, z], [x1, DECK_Y + 0.04, z], 0.004, TIMBER, 4);
  };
  const railZ = (x: number, z0: number, z1: number) => {
    rod([x, DECK_Y + RAIL_H - 0.004, z0], [x, DECK_Y + RAIL_H - 0.004, z1], 0.0055, TIMBER, 4);
    rod([x, DECK_Y + 0.04, z0], [x, DECK_Y + 0.04, z1], 0.004, TIMBER, 4);
  };
  const zF = DZ1 - 0.006;
  for (const x of [-0.114, -0.04, 0.03, 0.15, 0.25, 0.354]) post(x, zF);
  railX(-0.114, -0.04, zF);
  railX(-0.04, 0.03, zF);
  railX(0.15, 0.25, zF);
  railX(0.25, 0.354, zF);
  for (const z of [0.12, -0.0, -0.07, -0.134]) post(-0.114, z);
  railZ(-0.114, zF, 0.12);
  railZ(-0.114, 0.12, -0.07);
  railZ(-0.114, -0.07, -0.134);
  for (const z of [0.12, 0.0, -0.134]) post(0.354, z);
  railZ(0.354, zF, 0.12);
  railZ(0.354, 0.12, 0.0);
  // lantern on a bracket at the front corner
  rod([0.3, 0.77, 0.105], [0.335, 0.77, 0.13], 0.004, TIMBER, 4);
  rod([0.335, 0.77, 0.13], [0.335, 0.755, 0.13], 0.0016, STEEL_D, 4);
  b.part(new THREE.ConeGeometry(0.012, 0.01, 6), STEEL_D, { bone: base, at: [0.335, 0.752, 0.13], flat: true });
  glow(
    b.part(new THREE.CylinderGeometry(0.0085, 0.0085, 0.022, 6), "#ffcf66", {
      bone: base,
      at: [0.335, 0.736, 0.13],
      flat: true,
    }),
    1.3,
  );
  b.part(new THREE.CylinderGeometry(0.0105, 0.0085, 0.005, 6), STEEL_D, {
    bone: base,
    at: [0.335, 0.7225, 0.13],
    flat: true,
  });
  // a drift of leaves and a cat-sized pumpkin on the deck
  b.cards(
    [
      [-0.05, 0.2],
      [-0.09, 0.15],
      [0.01, 0.23],
      [0.33, 0.22],
      [0.32, 0.04],
      [-0.1, -0.1],
      [0.2, 0.2],
    ].map(([x, z]) => frame([x!, DECK_Y + 0.001, z!], [0, 1, 0])),
    FALLEN,
    {
      size: [0.028, 0.036],
      lean: 90,
      flow: (_f, i) => [Math.cos(i * 2.1), 0, Math.sin(i * 2.1)],
      mirror: true,
      rng: rng(13),
      bone: base,
      vary: 0.2,
    },
  );
  b.part(new THREE.IcosahedronGeometry(0.02, 0), "#d9782c", {
    bone: base,
    at: [-0.075, DECK_Y + 0.016, -0.06],
    scale: [1.2, 0.85, 1.2],
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.003, 0.004, 0.01, 4), "#4f7d36", {
    bone: base,
    at: [-0.075, DECK_Y + 0.034, -0.06],
  });

  // --- outrigger with pulley and bucket ------------------------------------------------------------------------
  const BEAM_Y = 0.725;
  box(0.31, 0.02, 0.02, TIMBER, [0.355, BEAM_Y, 0.0]);
  rod([0.3, 0.655, 0], [0.44, BEAM_Y - 0.008, 0], 0.007, TIMBER, 4);
  const WHEEL: V = [0.48, 0.69, 0];
  for (const z of [-0.0075, 0.0075]) box(0.006, 0.04, 0.003, STEEL_D, [WHEEL[0], 0.705, z]);
  const pulley = b.joint("pulley", { parent: base, at: WHEEL, dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.CylinderGeometry(0.0145, 0.0145, 0.008, 8), STEEL, {
    bone: pulley,
    at: WHEEL,
    rotation: [90, 0, 0],
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.02, 6), STEEL_D, {
    bone: pulley,
    at: WHEEL,
    rotation: [90, 0, 0],
    flat: true,
  });
  // rope over the wheel and down to the bucket (chain), slack end to a cleat
  const overWheel = arc(WHEEL, [WHEEL[0] + 0.0175, WHEEL[1], 0], [0, 0, 1], 180);
  b.sweep(overWheel, 0.003, { color: ROPE, sides: 5, smooth: false, bone: pulley, caps: "flat" });
  const haul = catmull([
    [WHEEL[0] - 0.0175, WHEEL[1], 0],
    [0.455, 0.65, 0.0],
    [0.42, 0.612, 0.0],
    [0.37, 0.605, 0.0],
    [0.33, 0.62, 0.0],
    [0.312, 0.641, 0.0],
  ]);
  b.sweep(haul, 0.003, { color: ROPE, sides: 5, smooth: false, bone: base, caps: "flat" });
  box(0.012, 0.008, 0.034, TIMBER_L, [0.306, 0.641, 0]);
  b.part(new THREE.SphereGeometry(0.006, 5, 4), ROPE_D, { bone: base, at: [0.318, 0.641, 0], flat: true });
  b.cards([frame([0.3155, 0.636, 0.0], [0, 1, 0])], FRINGE, {
    size: [0.011, 0.016],
    lean: 180,
    flow: [0, 0, 1],
    bone: base,
    cross: true,
    sink: 0,
  });

  const BX = WHEEL[0] + 0.0175;
  const bucketRope = b.chain(
    "bucketRope",
    polyline([
      [BX, 0.69, 0],
      [BX, 0.58, 0],
      [BX, 0.46, 0],
    ]),
    { parent: pulley, names: ["bucketRope1", "bucketRope2", "bucket"], role: "tentacle" },
  );
  b.sweep(bucketRope, 0.003, { color: ROPE, sides: 5, smooth: false, caps: "flat" });
  const bucket = bucketRope.tip!;
  const BRIM = 0.425;
  b.lathe(
    [
      [0, 0],
      [0.023, 0],
      [0.032, 0.05],
      [0.029, 0.05],
      [0.0205, 0.005],
      [0, 0.005],
    ],
    { at: [BX, BRIM - 0.05, 0], bone: bucket, segments: 8, color: STEEL, name: "bucket" },
  );
  b.lathe(
    [
      [0.0305, 0.036],
      [0.0335, 0.036],
      [0.0335, 0.05],
      [0.0295, 0.05],
    ],
    { at: [BX, BRIM - 0.05, 0], bone: bucket, segments: 8, color: STEEL_D },
  );
  b.lathe(
    [
      [0.0225, 0],
      [0.025, 0],
      [0.025, 0.007],
      [0.0225, 0.007],
    ],
    { at: [BX, BRIM - 0.05, 0], bone: bucket, segments: 8, color: STEEL_D },
  );
  b.part(new THREE.CylinderGeometry(0.0262, 0.0205, 0.03, 8), "#d8c9a0", {
    bone: bucket,
    at: [BX, BRIM - 0.027, 0],
    flat: true,
  });
  for (const [dx, dz, dy] of [
    [0.011, 0.005, 0.0],
    [-0.011, 0.007, 0.002],
    [0.0, -0.013, 0.001],
    [0.0, 0.0, 0.012],
    [-0.004, 0.014, 0.0],
  ] as const)
    b.part(new THREE.IcosahedronGeometry(0.0125, 0), RED, {
      bone: bucket,
      at: [BX + dx, BRIM + dy - 0.004, dz],
      flat: true,
    });
  b.sweep(arc([BX, BRIM, 0], [BX, BRIM, 0.031], [1, 0, 0], -180), 0.0018, {
    color: STEEL_D,
    sides: 4,
    smooth: false,
    bone: bucket,
    caps: "flat",
  });
  b.part(new THREE.SphereGeometry(0.005, 5, 4), ROPE_D, { bone: bucket, at: [BX, BRIM + 0.032, 0], flat: true });

  // --- rope ladder ----------------------------------------------------------------------------------------------
  const LX = 0.09;
  const footY = gy(LX, 0.33) + 0.01;
  const ladderPath = catmull([
    [LX, DECK_Y + 0.004, zF + 0.01],
    [LX, 0.5, 0.272],
    [LX, 0.4, 0.29],
    [LX, 0.3, 0.308],
    [LX, footY, 0.325],
  ]);
  const ladder = b.chain("ladder", ladderPath, { parent: base, count: 4, role: "tentacle" });
  const offsetPath = (dx: number) =>
    catmull(
      [0, 0.25, 0.5, 0.75, 1].map((t) =>
        ladderPath
          .at(t)
          .clone()
          .add(new THREE.Vector3(dx, 0, 0)),
      ),
    );
  for (const dx of [-0.026, 0.026])
    b.sweep(offsetPath(dx), 0.0035, { color: ROPE, sides: 5, smooth: false, bone: ladder, caps: "flat" });
  const nRungs = 10;
  for (let i = 1; i <= nRungs; i++) {
    const t = i / (nRungs + 1);
    const p = ladderPath.at(t);
    const j = ladder.joints[Math.min(ladder.joints.length - 1, Math.floor(t * ladder.joints.length))]!;
    b.part(new THREE.CylinderGeometry(0.0048, 0.0048, 0.062, 5), "#9a7448", {
      bone: j,
      at: [p.x, p.y, p.z],
      rotation: [0, 0, 90],
      flat: true,
    });
    for (const dx of [-0.026, 0.026])
      b.part(new THREE.SphereGeometry(0.0055, 4, 3), ROPE_D, { bone: j, at: [p.x + dx, p.y, p.z], flat: true });
  }
  // top bar
  b.part(new THREE.CylinderGeometry(0.0065, 0.0065, 0.078, 6), TIMBER_L, {
    bone: base,
    at: [LX, DECK_Y + 0.0035, zF + 0.012],
    rotation: [0, 0, 90],
    flat: true,
  });
  b.cards(
    [-0.026, 0.026].map((dx) => frame([LX + dx, footY + 0.014, 0.325], [0, 1, 0], [0, 0, 1])),
    FRINGE,
    { size: [0.012, 0.022], lean: 180, flow: [0, 0, 1], bone: ladder.joints[3]!, cross: true, sink: 0 },
  );

  // --- tyre swing ------------------------------------------------------------------------------------------------
  {
    const hit = trunkSurf.around([axisAt(0.5).x, 0.5, axisAt(0.5).z]).at(-84, 0);
    if (!hit) throw new Error("no swing branch hit");
    const swingPath = catmull([hit, [-0.19, 0.53, 0.04], [-0.34, 0.565, 0.06], [-0.46, 0.63, 0.05]]);
    const sb = b.sprout("swingBranch", hit, swingPath, [0.046, 0.014], {
      count: 3,
      color: BARK,
      sides: 6,
      smooth: false,
      role: "arm",
      caps: "round",
    });
    const sj = sb.chain!.joints;
    for (const [c, r] of [
      [[-0.43, 0.7, 0.04], 0.1],
      [[-0.29, 0.67, -0.03], 0.08],
    ] as Array<[V, number]>)
      addBlob(c, r, sj[2]!);
    const tHang = swingPath.closestT([-0.35, 0.56, 0.06]);
    const H = swingPath.at(tHang);
    const swing = b.joint("swing", { parent: sj[1]!, at: [H.x, H.y - 0.008, H.z], dir: [0, -1, 0], role: "hinge" });
    const hy = H.y - 0.008;
    const Kp: V = [H.x, hy - 0.115, H.z];
    const Cp: V = [H.x, Kp[1] - 0.075, H.z];
    const tilt: V = [7, 0, -6];
    b.part(new THREE.TorusGeometry(0.038, 0.0175, 6, 12), "#ffffff", {
      bone: swing,
      at: Cp,
      rotation: [90 + tilt[0], 0, tilt[2]],
      texture: TYRE,
      flat: true,
      name: "tyre",
    });
    // rope: branch loop, hanging line, knot, three legs to the tyre
    b.part(new THREE.TorusGeometry(0.0115, 0.0035, 4, 7), ROPE, {
      bone: swing,
      at: [H.x, hy + 0.001, H.z],
      rotation: [0, 90, 0],
      flat: true,
    });
    ropeSweep([[H.x, hy + 0.005, H.z], [H.x, hy - 0.05, H.z], Kp], 0.0038, ROPE, swing);
    b.part(new THREE.SphereGeometry(0.0075, 5, 4), ROPE_D, { bone: swing, at: Kp, flat: true });
    const eul = new THREE.Euler(tilt[0] * (Math.PI / 180), 0, tilt[2] * (Math.PI / 180));
    for (const az of [90, 210, 330]) {
      const a = (az * Math.PI) / 180;
      const v = new THREE.Vector3(Math.cos(a) * 0.038, 0.012, Math.sin(a) * 0.038).applyEuler(eul);
      ropeSweep([Kp, [Cp[0] + v.x, Cp[1] + v.y, Cp[2] + v.z]], 0.0028, ROPE, swing);
    }
    b.cards([frame([Kp[0], Kp[1] + 0.004, Kp[2]], [0, 1, 0])], FRINGE, {
      size: [0.01, 0.014],
      lean: 180,
      flow: [0, 0, 1],
      bone: swing,
      cross: true,
      sink: 0,
    });
    // a robin perched on the branch
    const tPerch = swingPath.closestT([-0.25, 0.55, 0.05]);
    const perch = swingPath.at(tPerch);
    const rb: V = [perch.x, perch.y + (0.046 - 0.032 * tPerch) * 0.9 + 0.012, perch.z];
    const bird = (geo: THREE.BufferGeometry, color: string, d: V, rot?: V, scale?: V) =>
      b.part(geo, color, {
        bone: sj[1]!,
        at: [rb[0] + d[0], rb[1] + d[1], rb[2] + d[2]],
        rotation: rot,
        scale,
        flat: true,
      });
    bird(new THREE.IcosahedronGeometry(0.013, 1), "#8a6a4a", [0, 0, 0], [-12, 0, 0], [1, 0.95, 1.4]);
    bird(new THREE.IcosahedronGeometry(0.0105, 1), "#df6a2c", [0, -0.002, 0.008]);
    bird(new THREE.IcosahedronGeometry(0.0088, 1), "#8a6a4a", [0, 0.012, 0.014]);
    bird(new THREE.IcosahedronGeometry(0.0058, 0), "#df6a2c", [0, 0.0105, 0.0195]);
    bird(new THREE.ConeGeometry(0.0025, 0.008, 4), "#e8b23a", [0, 0.0115, 0.0262], [90, 0, 0]);
    for (const s of [-1, 1]) bird(new THREE.IcosahedronGeometry(0.0017, 0), BLACK, [s * 0.0052, 0.0135, 0.0195]);
    bird(new THREE.BoxGeometry(0.008, 0.002, 0.022), "#6a4f38", [0, 0.001, -0.026], [-18, 0, 0]);
    for (const s of [-1, 1])
      bird(new THREE.CylinderGeometry(0.0009, 0.0009, 0.011, 3), "#6a4f38", [s * 0.004, -0.0125, 0.002]);
  }

  // --- the bike, leaning on the trunk ---------------------------------------------------------------------------
  {
    const az = -36;
    const [px, pz] = polar(0.15, az);
    const out = new THREE.Vector3(Math.sin((az * Math.PI) / 180), 0, Math.cos((az * Math.PI) / 180));
    const fwd = new THREE.Vector3(0, 1, 0).cross(out).normalize();
    const basis = new THREE.Matrix4().makeBasis(fwd, new THREE.Vector3(0, 1, 0), out);
    const qBasis = new THREE.Quaternion().setFromRotationMatrix(basis);
    const SC = 1.3;
    const WB = 0.065;
    const RW = 0.036;
    const rearG = gy(px - fwd.x * WB * SC, pz - fwd.z * WB * SC);
    const frontG = gy(px + fwd.x * WB * SC, pz + fwd.z * WB * SC);
    const pitch = Math.atan2(frontG - rearG, 2 * WB * SC);
    const qRoll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), (-13 * Math.PI) / 180);
    const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), pitch);
    const qBike = qBasis.clone().multiply(qRoll).multiply(qPitch);
    const origin = new THREE.Vector3(px, (rearG + frontG) / 2 - 0.001, pz);
    const W = (p: V) => new THREE.Vector3(p[0], p[1], p[2]).multiplyScalar(SC).applyQuaternion(qBike).add(origin);
    const Wv = (p: V): V => {
      const v = W(p);
      return [v.x, v.y, v.z];
    };
    const mk = (geo: THREE.BufferGeometry, color: string, p: V, rot?: V, texture?: THREE.Texture) => {
      const q = qBike.clone();
      if (rot)
        q.multiply(
          new THREE.Quaternion().setFromEuler(
            new THREE.Euler(rot[0] * (Math.PI / 180), rot[1] * (Math.PI / 180), rot[2] * (Math.PI / 180)),
          ),
        );
      return b.part(geo, color, { bone: base, at: Wv(p), quat: q, texture, flat: true, scale: SC });
    };
    const FRAME = "#c84a3c";
    const tube = (p: V, q: V, r = 0.0032, color = FRAME) => rod(Wv(p), Wv(q), r * SC, color, 5);
    const rear: V = [-WB, RW, 0];
    const front: V = [WB, RW, 0];
    const bb: V = [-0.004, 0.024, 0];
    const seatTop: V = [-0.03, 0.085, 0];
    const headTop: V = [0.05, 0.088, 0];
    const headBot: V = [0.053, 0.066, 0];
    for (const ctr of [rear, front]) {
      mk(new THREE.TorusGeometry(RW - 0.0065, 0.0065, 5, 14), BLACK, ctr);
      mk(
        new THREE.PlaneGeometry(2 * (RW - 0.009), 2 * (RW - 0.009)),
        "#ffffff",
        [ctr[0], ctr[1], ctr[2] + 0.001],
        undefined,
        SPOKES,
      );
      mk(
        new THREE.PlaneGeometry(2 * (RW - 0.009), 2 * (RW - 0.009)),
        "#ffffff",
        [ctr[0], ctr[1], ctr[2] - 0.001],
        [0, 180, 0],
        SPOKES,
      );
      mk(new THREE.CylinderGeometry(0.0035, 0.0035, 0.03, 5), STEEL_D, ctr, [90, 0, 0]);
    }
    tube(seatTop, headTop);
    tube(bb, seatTop);
    tube(bb, headBot);
    tube([-0.03, 0.075, 0], [rear[0], rear[1], 0.0075], 0.002);
    tube([-0.03, 0.075, 0], [rear[0], rear[1], -0.0075], 0.002);
    tube(bb, [rear[0], rear[1], 0.0075], 0.002);
    tube(bb, [rear[0], rear[1], -0.0075], 0.002);
    tube([headBot[0], headBot[1] + 0.006, 0], headTop, 0.0045);
    for (const z of [-0.0085, 0.0085]) tube([headBot[0], headBot[1], z], [front[0], front[1], z], 0.0024, STEEL_D);
    tube(headBot, [headBot[0], headBot[1], 0.0085], 0.0024, STEEL_D);
    tube(headBot, [headBot[0], headBot[1], -0.0085], 0.0024, STEEL_D);
    // bars, grips, saddle, post
    tube([headTop[0], headTop[1], 0], [headTop[0] - 0.004, headTop[1] + 0.012, 0], 0.0028, STEEL_D);
    tube(
      [headTop[0] - 0.004, headTop[1] + 0.012, -0.032],
      [headTop[0] - 0.004, headTop[1] + 0.012, 0.032],
      0.0024,
      STEEL_D,
    );
    for (const z of [-0.032, 0.032])
      mk(
        new THREE.CylinderGeometry(0.0038, 0.0038, 0.012, 5),
        "#e8e0c8",
        [headTop[0] - 0.004, headTop[1] + 0.012, z + Math.sign(z) * 0.002],
        [90, 0, 0],
      );
    tube(seatTop, [seatTop[0] - 0.003, seatTop[1] + 0.014, 0], 0.0028, STEEL_D);
    mk(new THREE.BoxGeometry(0.034, 0.007, 0.018), "#5b3a29", [seatTop[0] - 0.002, seatTop[1] + 0.017, 0]);
    mk(new THREE.BoxGeometry(0.014, 0.006, 0.014), "#5b3a29", [seatTop[0] + 0.014, seatTop[1] + 0.0155, 0]);
    // crank, chainring, pedals
    mk(new THREE.CylinderGeometry(0.012, 0.012, 0.003, 8), STEEL_D, [bb[0], bb[1], 0.006], [90, 0, 0]);
    tube([bb[0], bb[1], 0.009], [bb[0] + 0.012, bb[1] - 0.012, 0.011], 0.0022, STEEL_D);
    tube([bb[0], bb[1], -0.009], [bb[0] - 0.012, bb[1] + 0.012, -0.011], 0.0022, STEEL_D);
    mk(new THREE.BoxGeometry(0.014, 0.003, 0.008), BLACK, [bb[0] + 0.012, bb[1] - 0.012, 0.016]);
    mk(new THREE.BoxGeometry(0.014, 0.003, 0.008), BLACK, [bb[0] - 0.012, bb[1] + 0.012, -0.016]);
    // basket, bell, streamers
    mk(
      new THREE.BoxGeometry(0.03, 0.022, 0.05),
      "#ffffff",
      [headTop[0] + 0.022, headTop[1] + 0.0, 0],
      undefined,
      WEAVE,
    );
    mk(new THREE.BoxGeometry(0.032, 0.003, 0.052), "#8f6a30", [headTop[0] + 0.022, headTop[1] + 0.012, 0]);
    mk(new THREE.SphereGeometry(0.0045, 5, 4), "#e8c24a", [headTop[0] - 0.004, headTop[1] + 0.017, 0.012]);
    const streamTex = [STREAMER("#e8c24a", "#ffffff"), STREAMER("#3a86c8", "#ffffff")];
    b.cards(
      [-1, 1].map((s) => frame(Wv([headTop[0] - 0.004, headTop[1] + 0.012, s * 0.036]), [0, 1, 0], [0, 0, 1])),
      streamTex,
      {
        size: [0.007, 0.038],
        lean: 180,
        flow: [out.x * 0.6, 0, out.z * 0.6],
        bone: base,
        sink: 0,
        rng: rng(3),
        cross: true,
      },
    );
    // mudguard flecks: a rear rack and reflector
    mk(new THREE.BoxGeometry(0.004, 0.006, 0.008), RED, [rear[0] - 0.012, 0.072, 0]);
    mk(new THREE.BoxGeometry(0.03, 0.002, 0.022), STEEL, [rear[0] + 0.004, 0.06, 0]);
  }

  // --- hand-painted sign on a stake -----------------------------------------------------------------------------
  {
    const sx = 0.29;
    const sz = 0.41;
    const y0 = gy(sx, sz);
    const yaw = (28 * Math.PI) / 180;
    const face = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const up = new THREE.Vector3(0, 1, 0);
    rod([sx, y0 - 0.012, sz], [sx, y0 + 0.235, sz], 0.0075, TIMBER_L, 4);
    b.part(new THREE.ConeGeometry(0.0106, 0.012, 4), TIMBER_L, {
      bone: base,
      at: [sx, y0 + 0.241, sz],
      rotation: [0, 45, 0],
    });
    const sign = (
      tex: THREE.Texture,
      poly: Array<[number, number]>,
      w: number,
      h: number,
      yOff: number,
      xOff: number,
      tiltDeg: number,
      wood: string,
    ) => {
      const q = new THREE.Quaternion()
        .setFromAxisAngle(up, yaw)
        .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), (tiltDeg * Math.PI) / 180));
      const c = new THREE.Vector3(sx, y0 + yOff, sz).addScaledVector(right, xOff).addScaledVector(face, 0.0105);
      const rx = right
        .clone()
        .applyQuaternion(new THREE.Quaternion().setFromAxisAngle(face, (tiltDeg * Math.PI) / 180));
      const ry = up.clone().applyQuaternion(new THREE.Quaternion().setFromAxisAngle(face, (tiltDeg * Math.PI) / 180));
      b.extrude(
        poly.map(([x, y]): [number, number] => [(x - w / 2) * 0.001, (h / 2 - y) * 0.001]),
        { at: c, x: rx, y: ry, thickness: 0.008, color: wood, bone: base },
      );
      b.part(new THREE.PlaneGeometry(w * 0.001, h * 0.001), "#ffffff", {
        bone: base,
        at: c.clone().addScaledVector(face, 0.0062),
        quat: q,
        texture: tex,
      });
    };
    sign(SIGN1, SIGN1_POLY, SIGN_W, SIGN_H, 0.19, 0.012, -4, "#3c5e45");
    sign(
      SIGN2,
      [
        [0, 0],
        [SIGN2_W, 0],
        [SIGN2_W, SIGN2_H],
        [0, SIGN2_H],
      ],
      SIGN2_W,
      SIGN2_H,
      0.128,
      -0.004,
      3,
      "#8a6a44",
    );
  }

  // --- meadow: grass, wildflowers, fallen leaves -----------------------------------------------------------------
  const keepOut: Array<[number, number, number]> = [
    [0, 0, 0.13],
    [0.09, 0.325, 0.05],
    [-0.095, 0.135, 0.11],
    [-0.36, 0.06, 0.05],
    [0.29, 0.41, 0.045],
    [0.49, 0.0, 0.03],
  ];
  const free = (x: number, z: number, pad = 0) =>
    keepOut.every(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) > kr + pad);
  const grassHits = moundSurf.scatter(520, {
    rng: rng(21),
    minDist: 0.028,
    filter: (h) => h.n.y > 0.5 && free(h.at.x, h.at.z),
  });
  b.cards(grassHits, GRASS_CARDS, {
    size: [0.058, 0.062],
    vary: 0.3,
    rng: rng(22),
    cross: true,
    bone: base,
    lean: 8,
    flow: [0, 0, 1],
    sink: 0.15,
  });
  const flowerHits = moundSurf.scatter(80, {
    rng: rng(31),
    minDist: 0.075,
    filter: (h) => h.n.y > 0.5 && free(h.at.x, h.at.z, 0.03) && Math.hypot(h.at.x, h.at.z) > 0.15,
  });
  b.cards(flowerHits, FLOWERS, {
    size: [0.042, 0.085],
    vary: 0.3,
    rng: rng(32),
    cross: true,
    bone: base,
    flow: [0, 0, 1],
    sink: 0.12,
    spin: 40,
  });
  const leafHits = moundSurf.scatter(120, {
    rng: rng(41),
    minDist: 0.05,
    filter: (h) => h.n.y > 0.5 && free(h.at.x, h.at.z, 0.01),
  });
  b.cards(leafHits, FALLEN, {
    size: [0.034, 0.045],
    lean: 90,
    flow: (_f, i) => [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)],
    mirror: true,
    rng: rng(42),
    bone: base,
    vary: 0.25,
    sink: 0,
  });

  // --- canopy cards ----------------------------------------------------------------------------------------------
  const leafHitsCanopy = b.surface(foliage).scatter(460, { rng: rng(51), minDist: 0.05, filter: (h) => h.n.y > -0.45 });
  b.cards(leafHitsCanopy, LEAF_CARDS, {
    size: [0.1, 0.1],
    vary: 0.3,
    rng: rng(52),
    lean: 62,
    bend: 25,
    sink: 0.2,
    flow: [0, -1, 0.15],
    spin: 180,
  });
  // bunting strung along the porch front
  {
    const pts: V[] = [0, 0.25, 0.5, 0.75, 1].map(
      (t): V => [-0.114 + t * 0.364, DECK_Y + RAIL_H + 0.006 - Math.sin(t * Math.PI) * 0.028, zF + 0.006],
    );
    const string = catmull(pts);
    b.sweep(string, 0.0016, { color: ROPE_D, sides: 4, smooth: false, bone: base, caps: "flat" });
    b.cards(
      Array.from({ length: 11 }, (_, i) => frame(string.at((i + 0.5) / 11), [0, 1, 0])),
      BUNTING,
      { size: [0.024, 0.028], lean: 180, flow: [0, 0, 1], bone: base, cross: false, sink: 0, rng: rng(17) },
    );
  }

  return b.root;
}
