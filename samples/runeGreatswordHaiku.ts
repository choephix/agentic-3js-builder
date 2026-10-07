// A runed greatsword, real size (about 1.6 m), stood pommel-down in a socket on a mossy stone display plinth.
// Blizzard/Warcraft manner: chunky heroic proportions, hand-painted steel and gold with painted highlights and
// shadow gradients, a worn crimson leather grip, rivets and gold trim, and self-lit runes (kits/glow).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { countershade, mottle, noise, paint, scales, smoothstep, mix } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Runed Greatsword on a Stone Display",
  description:
    "A real-size runed greatsword stood pommel-down in a socket on a mossy stone plinth. Painted steel and gold trim, a worn crimson grip, rivets, coins and a broken shard at its feet; the runes and gems are self-lit.",
  style: "Blizzard/Warcraft",
  commit: "b816db2",
};

// Palette (sRGB hex): warm saturated gold and crimson against bright steel and warm mossy stone.
const STEEL_HI = "#f4f9ff";
const STEEL_MID = "#c4d2e2";
const STEEL_LO = "#6f7f98";
const FULLER = "#222a3a";
const GOLD_HI = "#ffd36b";
const GOLD = "#e09a2c";
const GOLD_LO = "#7a4512";
const HATCH = "#5a3210";
const CORD = "#f0b84a";
const LEATHER_HI = "#c2373f";
const LEATHER = "#8a1d26";
const LEATHER_LO = "#420d14";
const GEM_RED = "#ff3d24";
const GEM_BLUE = "#3fe6ff";
const RIVET = "#b9742a";
const RUNE_EDGE = "#1f8fc9";
const RUNE_CORE = "#d6f8ff";
const STONE_HI = "#c9c1b2";
const STONE_MID = "#978f82";
const STONE_LO = "#6c665d";
const GROOVE = "#353c48";
const CARVE = "#141820";
const MOSS_LO = "#3d6a2a";
const MOSS_HI = "#86b84e";

// Key light from upper front left; every hand-painted shade reads its normal against it.
const LIGHT = new THREE.Vector3(-0.45, 0.8, 0.55).normalize();
const lit = (lo: string, hi: string) => paint((_p, n) => mix(lo, hi, smoothstep(-0.2, 0.9, n.dot(LIGHT))));

// Blade: half-width by height (metres from the blade's base, which sits in the guard). Tip at BLADE_TIP.
const BLADE_PROFILE: ReadonlyArray<readonly [number, number]> = [
  [-0.03, 0.038], // [y, half width]
  [0.02, 0.041],
  [0.15, 0.043],
  [0.45, 0.042],
  [0.75, 0.037],
  [0.95, 0.029],
  [1.08, 0.018],
];
const BLADE_TIP = 1.16;
const BLADE_BASE_Y = 1.27;
const BLADE_HALF_THICKNESS = 0.009;

function halfWidth(y: number): number {
  const first = BLADE_PROFILE[0];
  if (y <= first[0]) return first[1];
  for (let i = 1; i < BLADE_PROFILE.length; i++) {
    const [y0, w0] = BLADE_PROFILE[i - 1];
    const [y1, w1] = BLADE_PROFILE[i];
    if (y <= y1) return w0 + ((w1 - w0) * (y - y0)) / (y1 - y0);
  }
  const [y0, w0] = BLADE_PROFILE[BLADE_PROFILE.length - 1];
  return Math.max(0, (w0 * (BLADE_TIP - y)) / (BLADE_TIP - y0));
}

// Painted steel: dark fuller, shoulder gradient to bright edges, a diagonal sheen, a shadowed ricasso.
const bladeSteel = paint((p, _n, s) => {
  const [x, y] = s;
  const hw = Math.max(halfWidth(y), 0.002);
  const across = Math.min(Math.abs(x) / hw, 1);
  const fuller = (1 - smoothstep(0.006, 0.014, Math.abs(x))) * smoothstep(0.06, 0.14, y) * (1 - smoothstep(0.9, 1.0, y));
  const streakX = 0.024 - 0.03 * (y - 0.4);
  const sheen = (1 - smoothstep(0.004, 0.012, Math.abs(x - streakX))) * smoothstep(0.1, 0.3, y) * (1 - smoothstep(0.9, 1.05, y));
  let c = mix(STEEL_LO, STEEL_MID, smoothstep(0.1, 0.8, across));
  c = mix(c, STEEL_HI, smoothstep(0.8, 0.99, across));
  c = mix(c, FULLER, fuller * 0.9);
  c = mix(c, STEEL_HI, sheen * 0.8);
  c = mix(c, STEEL_LO, (1 - smoothstep(0.02, 0.14, y)) * 0.55);
  c = mix(c, STEEL_LO, noise(p, 0.02, 4) * 0.25);
  return c;
});

// Guard plate: gold with engraved diagonal hatching, lit from the upper left.
const plateGold = paint((_p, n, s) => {
  const c = mix(GOLD_LO, GOLD_HI, smoothstep(-0.2, 0.9, n.dot(LIGHT)));
  const hatch = ((((s[0] - s[1]) * 60) % 1) + 1) % 1 < 0.12;
  return hatch ? mix(c, HATCH, 0.5) : c;
});

// Crimson leather with gold cords spiralling round the grip.
const leather = paint((_p, n, s) => {
  const phase = ((s[1] - 1080 * s[0]) % 90 + 90) % 90;
  if (phase < 12) return mix(GOLD_LO, CORD, smoothstep(-0.2, 0.9, n.dot(LIGHT)));
  return mix(LEATHER_LO, LEATHER_HI, smoothstep(-0.3, 0.9, n.dot(LIGHT)));
});

// Stone: grey-blue blocks with dark mortar, shaded from above, and moss on the upward faces.
const stone = countershade(
  scales([STONE_HI, STONE_MID, STONE_LO], GROOVE, { size: 0.2, width: 0.1, seed: 4 }),
  STONE_LO,
  { level: 0.1, soft: 0.4 },
);
const mossPaint = mottle(MOSS_LO, MOSS_HI, { size: 0.07, seed: 2 });
const mossyStone = paint((p, n) => (n.y > 0.5 && noise(p, 0.12, 9) > 0.5 ? mossPaint : stone));

// Runes: an Elder-Futhark-like set in a 40 x 60 cell, drawn as strokes so they glow.
const GLYPHS = [
  "M8 60V0M8 4L32 16M8 30L32 42",
  "M6 0V60M6 0L34 18L6 30",
  "M8 0V60M8 14L30 26L8 38M8 60L30 46",
  "M10 0V60M10 0L32 14L10 28",
  "M30 0L8 26L30 52",
  "M20 0V60M20 22L4 6M20 22L36 6",
  "M26 0L8 24L30 36L10 60",
  "M8 0V60M8 0L32 14L8 28M8 36L32 50L8 60",
  "M4 0L20 20L36 0M20 20V60",
  "M4 0V60M36 0V60M4 30H36",
];

// One glowing rune stroked in an outer halo colour and an inner core, placed in the drawing's units.
function rune(d: string, x: number, y: number, s: number, halo: string, core: string, width: number): string {
  const w = width / s;
  return (
    `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="${d}" stroke="${halo}" stroke-width="${(w * 2.4).toFixed(2)}"/>` +
    `<path d="${d}" stroke="${core}" stroke-width="${w.toFixed(2)}"/></g>`
  );
}

// The blade's inlaid rune strip: a glowing central channel with ten glyphs.
const bladeRunes = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 800">` +
    `<path d="M24 0V800" stroke="${RUNE_EDGE}" stroke-width="4"/>` +
    `<path d="M24 0V800" stroke="${RUNE_CORE}" stroke-width="1.4"/>` +
    GLYPHS.map((d, i) => rune(d, 4, 16 + i * 72, 1, RUNE_EDGE, RUNE_CORE, 3.2)).join("") +
    `</svg>`,
  { size: 1024 },
);

// The stone top's rune ring: a double circle, ten glyphs on a ring, and ticks between.
const ringGlyphs = GLYPHS.map(
  (d, i) =>
    `<g transform="translate(100 100) rotate(${i * 36})"><g transform="translate(-8 -74) scale(0.4)" fill="none" stroke-linecap="round">` +
    `<path d="${d}" stroke="${RUNE_EDGE}" stroke-width="${(8 / 0.4).toFixed(1)}"/>` +
    `<path d="${d}" stroke="${RUNE_CORE}" stroke-width="${(3 / 0.4).toFixed(1)}"/></g></g>`,
).join("");
const ticks = Array.from(
  { length: 12 },
  (_, i) =>
    `<line x1="100" y1="14" x2="100" y2="24" transform="rotate(${i * 30} 100 100)" stroke="${RUNE_CORE}" stroke-width="3"/>`,
).join("");
const circleRunes = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">` +
    `<circle cx="100" cy="100" r="94" stroke="${RUNE_EDGE}" stroke-width="9"/>` +
    `<circle cx="100" cy="100" r="94" stroke="${RUNE_CORE}" stroke-width="2.5"/>` +
    `<circle cx="100" cy="100" r="78" stroke="${RUNE_EDGE}" stroke-width="4"/>` +
    ticks +
    ringGlyphs +
    `</svg>`,
  { size: 512 },
);

// Carved runes on the plinth's faces: dark strokes cut into the stone, three glyphs to a panel.
const carvings = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 55">` +
    `<path d="M3 6H47M3 49H47" stroke="${CARVE}" stroke-width="2"/>` +
    [GLYPHS[0], GLYPHS[4], GLYPHS[9]]
      .map(
        (d, i) =>
          `<g transform="translate(${5 + i * 15} 17.5) scale(0.3)" fill="none" stroke-linecap="round"><path d="${d}" stroke="${CARVE}" stroke-width="${(2.4 / 0.3).toFixed(1)}"/></g>`,
      )
      .join("") +
    `</svg>`,
  { size: 256 },
);

// Hairline cracks running down a column corner.
const cracksTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100" fill="none" stroke-linejoin="round">` +
    `<path d="M14 0L18 14L11 26L20 40L15 56L24 70L19 84L26 100" stroke="${CARVE}" stroke-width="1.8"/>` +
    `<path d="M20 40L30 46L28 54" stroke="${CARVE}" stroke-width="1.2"/></svg>`,
  { size: 256 },
);

// Moss tufts that grow on the plinth's ledges.
const mossTuft = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64" fill="none" stroke-linecap="round">` +
    `<path d="M16 64Q11 40 3 24" stroke="${MOSS_LO}" stroke-width="4"/>` +
    `<path d="M16 64Q18 36 28 14" stroke="#4f7d2c" stroke-width="4"/>` +
    `<path d="M16 64Q14 44 16 22" stroke="${MOSS_HI}" stroke-width="3.5"/>` +
    `<path d="M16 64Q22 50 30 42" stroke="#5f8f36" stroke-width="3.5"/>` +
    `<path d="M16 64Q9 52 6 46" stroke="#8fbf57" stroke-width="3"/>` +
    `</svg>`,
  { size: 128 },
);

// Tassel fringe strands, gold and crimson.
const fringeGold = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 64" fill="none" stroke-linecap="round">` +
    `<path d="M7 0Q9 32 7 64" stroke="#8c5a1a" stroke-width="7"/>` +
    `<path d="M7 0Q9 32 7 64" stroke="#f5cf6a" stroke-width="3.5"/></svg>`,
  { size: 128 },
);
const fringeRed = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 64" fill="none" stroke-linecap="round">` +
    `<path d="M7 0Q9 32 7 64" stroke="#4a0f15" stroke-width="7"/>` +
    `<path d="M7 0Q9 32 7 64" stroke="#c3343c" stroke-width="3.5"/></svg>`,
  { size: 128 },
);

const mergedGeometry = (list: THREE.BufferGeometry[]) => {
  const merged = mergeGeometries(list);
  if (!merged) throw new Error("runeGreatsword: geometries did not merge");
  return merged;
};

export default function build() {
  const b = createBuilder({ name: "runeGreatsword" });
  const root = b.joint("root", { at: [0, 0, 0] });
  // The tassel hangs from the left guard hook and sways on its hinge.
  const tassel = b.joint("tassel", { parent: root, at: [-0.31, 1.155, 0], dir: [0, -1, 0], role: "hinge" });

  // ---- Stone display: stepped base, pedestal with a gold band, ledge, capstone. Top at y = 0.80 ----
  const tier1 = b.part(new THREE.BoxGeometry(0.82, 0.1, 0.82), mossyStone, { bone: root, at: [0, 0.05, 0], name: "plinthBase" });
  const tier2 = b.part(new THREE.BoxGeometry(0.74, 0.06, 0.74), stone, { bone: root, at: [0, 0.13, 0], name: "plinthStep" });
  const pedestal = b.part(new THREE.BoxGeometry(0.56, 0.52, 0.56), stone, { bone: root, at: [0, 0.42, 0], name: "plinthColumn" });
  b.part(new THREE.BoxGeometry(0.6, 0.04, 0.6), lit(GOLD_LO, GOLD_HI), { bone: root, at: [0, 0.46, 0], name: "plinthBand" });
  const ledge = b.part(new THREE.BoxGeometry(0.66, 0.04, 0.66), stone, { bone: root, at: [0, 0.7, 0], name: "plinthLedge" });
  b.part(new THREE.BoxGeometry(0.6, 0.08, 0.6), mossyStone, { bone: root, at: [0, 0.76, 0], name: "plinthCap" });

  // Gold corner brackets running the full height of the column.
  const brackets: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) for (const t of [1, -1]) brackets.push(new THREE.BoxGeometry(0.036, 0.5, 0.036).translate(s * 0.28, 0.42, t * 0.28));
  b.part(mergedGeometry(brackets), lit(GOLD_LO, GOLD_HI), { bone: root, at: [0, 0, 0], name: "columnBrackets" });

  // Cracks down the column's corners.
  for (const [at, dir] of [
    [[0.2, 0.3, 0.287], [0, 0, 1]],
    [[-0.2, 0.3, -0.287], [0, 0, -1]],
    [[0.287, 0.3, -0.2], [1, 0, 0]],
    [[-0.287, 0.3, 0.2], [-1, 0, 0]],
  ] as const)
    b.part(new THREE.PlaneGeometry(0.09, 0.22), "#ffffff", { bone: root, at: [...at], dir: [...dir], axis: "z", texture: cracksTexture, name: "crack" });

  // Carved rune panels on the four faces of the column.
  const panels: Array<readonly [readonly number[], readonly number[]]> = [
    [[0, 0.3, 0.284], [0, 0, 1]],
    [[0, 0.3, -0.284], [0, 0, -1]],
    [[0.284, 0.3, 0], [1, 0, 0]],
    [[-0.284, 0.3, 0], [-1, 0, 0]],
  ];
  for (const [at, dir] of panels)
    b.part(new THREE.PlaneGeometry(0.2, 0.22), "#ffffff", { bone: root, at: [...at], dir: [...dir], axis: "z", texture: carvings, name: "carving" });

  // The rune ring lying on the cap; the sword's pommel sits in its centre.
  glow(b.part(new THREE.PlaneGeometry(0.46, 0.46), "#ffffff", { bone: root, at: [0, 0.803, 0], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: circleRunes, name: "stoneRing" }), 1.4);

  // Rivets: four to each face of the gold band, and one at each corner of the capstone.
  const rivets: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (const t of [-0.2, -0.07, 0.07, 0.2]) {
      rivets.push(new THREE.SphereGeometry(0.012, 6, 4).translate(t, 0.46, s * 0.302));
      rivets.push(new THREE.SphereGeometry(0.012, 6, 4).translate(s * 0.302, 0.46, t));
    }
  for (const s of [1, -1]) for (const t of [1, -1]) rivets.push(new THREE.SphereGeometry(0.014, 6, 4).translate(s * 0.27, 0.8, t * 0.27));
  b.part(mergedGeometry(rivets), RIVET, { bone: root, at: [0, 0, 0], name: "plinthRivets" });

  // Gold trim along the capstone's top edges.
  b.part(
    mergedGeometry([
      new THREE.BoxGeometry(0.6, 0.014, 0.014).translate(0, 0.8, 0.3),
      new THREE.BoxGeometry(0.6, 0.014, 0.014).translate(0, 0.8, -0.3),
      new THREE.BoxGeometry(0.014, 0.014, 0.6).translate(0.3, 0.8, 0),
      new THREE.BoxGeometry(0.014, 0.014, 0.6).translate(-0.3, 0.8, 0),
    ]),
    lit(GOLD_LO, GOLD_HI),
    { bone: root, at: [0, 0, 0], name: "capTrim" },
  );

  // Moss on the upward ledges of the base, pedestal and step.
  const mossHits = b.surface([tier1, tier2, ledge, pedestal]).scatter(48, {
    rng: rng(11),
    minDist: 0.035,
    filter: (h) => h.n.y > 0.9 && h.at.y < 0.2,
  });
  b.cards(mossHits, mossTuft, { size: [0.05, 0.075], vary: 0.3, rng: rng(12), bone: root });

  // Rubble, a broken shard and scattered coins at the foot of the plinth.
  b.part(new THREE.DodecahedronGeometry(0.065, 0), stone, { bone: root, at: [0.52, 0.06, 0.16], rotation: [20, 35, 10], flat: true, name: "rubbleA" });
  b.part(new THREE.DodecahedronGeometry(0.045, 0), mossyStone, { bone: root, at: [0.5, 0.045, -0.2], rotation: [60, 10, 40], flat: true, name: "rubbleB" });
  const shardOutline: OutlinePoint[] = [
    [0, 0],
    [0.07, 0.02],
    [0.03, 0.15],
    [-0.02, 0.06],
  ];
  b.extrude(shardOutline, {
    at: [0.5, 0.008, -0.05],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.012,
    bevel: 0.004,
    color: lit(STEEL_LO, STEEL_HI),
    bone: root,
    name: "shard",
  });
  const coins: THREE.BufferGeometry[] = [
    [0.62, 0.002, 0.3],
    [0.64, 0.002, 0.33],
    [0.62, 0.006, 0.31],
    [0.6, 0.002, 0.36],
    [0.67, 0.002, 0.29],
    [0.66, 0.006, 0.31],
    [0.63, 0.002, 0.27],
  ].map(([x, y, z]) => new THREE.CylinderGeometry(0.02, 0.02, 0.004, 12).translate(x, y, z));
  b.part(mergedGeometry(coins), GOLD, { bone: root, at: [0, 0, 0], name: "coins" });

  // ---- The greatsword, real size: pommel on the socket at y = 0.80, blade tip at y = 2.43 ----
  // Socket collar and pommel with its gem.
  const collar: OutlinePoint[] = [
    [0, 0],
    [0.062, 0],
    [0.064, 0.012],
    [0.05, 0.024],
    [0.04, 0.03],
    [0, 0.03],
  ];
  b.lathe(collar, { at: [0, 0.8, 0], segments: 12, color: lit(GOLD_LO, GOLD_HI), bone: root, name: "socketCollar" });
  const pommelProfile: OutlinePoint[] = [
    [0, 0],
    [0.06, 0],
    [0.068, 0.016],
    [0.056, 0.036],
    [0.05, 0.05],
    [0.062, 0.068],
    [0.056, 0.086],
    [0, 0.094],
  ];
  b.lathe(pommelProfile, { at: [0, 0.83, 0], segments: 10, color: lit(GOLD_LO, GOLD_HI), bone: root, name: "pommel" });
  glow(b.part(new THREE.OctahedronGeometry(0.024), GEM_RED, { bone: root, at: [0, 0.868, 0.058], name: "pommelGem" }), 1.5);
  // A gold wire band round the pommel's widest ring.
  b.sweep(
    catmull(
      Array.from({ length: 12 }, (_, i) => [0.066 * Math.sin((i / 12) * Math.PI * 2), 0.846, 0.066 * Math.cos((i / 12) * Math.PI * 2)]),
      { closed: true },
    ),
    0.006,
    { color: lit(GOLD_LO, GOLD_HI), bone: root, name: "pommelBand" },
  );

  // Crimson leather grip with gold cords, and a gold ring where it meets the guard.
  b.sweep(
    [
      [0, 0.9, 0],
      [0, 1.2, 0],
    ],
    0.021,
    { color: leather, caps: "flat", bone: root, name: "grip" },
  );
  const gripRing: OutlinePoint[] = [
    [0, 0],
    [0.032, 0],
    [0.034, 0.012],
    [0.03, 0.02],
    [0, 0.02],
  ];
  b.lathe(gripRing, { at: [0, 1.19, 0], segments: 10, color: lit(GOLD_LO, GOLD_HI), bone: root, name: "gripRing" });

  // Guard: a hooked gold plate with a block at its centre, filigree on its face, orbs and gems on the hooks.
  const GUARD: ReadonlyArray<readonly [number, number]> = [
    [0.035, 0.03],
    [0.2, 0.028],
    [0.29, 0.012],
    [0.335, -0.03],
    [0.325, -0.065],
    [0.31, -0.09],
    [0.28, -0.05],
    [0.22, -0.025],
    [0.035, -0.03],
  ];
  const guardOutline: OutlinePoint[] = [
    ...GUARD.map(([x, y]): OutlinePoint => [x, y]),
    ...GUARD.slice()
      .reverse()
      .map(([x, y]): OutlinePoint => [-x, y]),
  ];
  b.extrude(guardOutline, {
    at: [0, 1.245, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.026,
    bevel: 0.006,
    color: plateGold,
    bone: root,
    name: "guardPlate",
  });
  b.part(new THREE.BoxGeometry(0.13, 0.085, 0.07), lit(GOLD_LO, GOLD_HI), { bone: root, at: [0, 1.245, 0], name: "guardBlock" });
  glow(b.part(new THREE.OctahedronGeometry(0.024), GEM_RED, { bone: root, at: [0, 1.245, 0.045], name: "guardGem" }), 1.5);
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.022, 8, 6), lit(GOLD_LO, GOLD_HI), { bone: root, at: [s * 0.31, 1.157, 0], name: "hookOrb" });
    glow(b.part(new THREE.OctahedronGeometry(0.016), GEM_BLUE, { bone: root, at: [s * 0.33, 1.22, 0.02], name: "hookGem" }), 1.4);
    // Filigree scroll on the plate's face, one per arm.
    b.sweep(
      catmull([
        [s * 0.07, 1.245, 0.02],
        [s * 0.15, 1.27, 0.026],
        [s * 0.23, 1.255, 0.026],
        [s * 0.2, 1.222, 0.024],
        [s * 0.14, 1.232, 0.024],
      ]),
      0.0055,
      { color: lit(GOLD_LO, GOLD_HI), bone: root, name: "filigree" },
    );
  }
  const guardRivets: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    for (const x of [0.13, 0.24]) guardRivets.push(new THREE.SphereGeometry(0.008, 6, 4).translate(s * x, 1.245, 0.016));
    for (const y of [1.27, 1.22]) guardRivets.push(new THREE.SphereGeometry(0.008, 6, 4).translate(s * 0.05, y, 0.037));
  }
  b.part(mergedGeometry(guardRivets), RIVET, { bone: root, at: [0, 0, 0], name: "guardRivets" });

  // Blade: a broad clip-point with a sharp tip, beveled edges, painted steel.
  const bladeOutline: OutlinePoint[] = [
    ...BLADE_PROFILE.map(([y, w]): OutlinePoint => [w, y]),
    [0, BLADE_TIP],
    ...BLADE_PROFILE.slice()
      .reverse()
      .map(([y, w]): OutlinePoint => [-w, y]),
  ];
  b.extrude(bladeOutline, {
    at: [0, BLADE_BASE_Y, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 2 * BLADE_HALF_THICKNESS,
    bevel: 0.005,
    color: bladeSteel,
    bone: root,
    name: "blade",
  });
  // Ricasso rivets just above the guard, two per face.
  const ricasso: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) for (const x of [-0.02, 0.02]) ricasso.push(new THREE.SphereGeometry(0.0065, 6, 4).translate(x, 1.31, s * (BLADE_HALF_THICKNESS + 0.0005)));
  b.part(mergedGeometry(ricasso), RIVET, { bone: root, at: [0, 0, 0], name: "ricassoRivets" });
  // The inlaid rune strip on both faces, glowing; the back face is turned so it reads from behind.
  const runeZ = BLADE_HALF_THICKNESS + 0.0025;
  glow(
    b.part(new THREE.PlaneGeometry(0.048, 0.8), "#ffffff", { bone: root, at: [0, BLADE_BASE_Y + 0.5, runeZ], texture: bladeRunes, name: "runesFront" }),
    1.6,
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.048, 0.8), "#ffffff", {
      bone: root,
      at: [0, BLADE_BASE_Y + 0.5, -runeZ],
      rotation: [0, 180, 0],
      texture: bladeRunes,
      name: "runesBack",
    }),
    1.6,
  );

  // Tassel on the left hook: a leather strap, a gold bead and a fringe of strands that hangs and sways.
  b.sweep(
    [
      [-0.31, 1.15, 0],
      [-0.31, 1.01, 0.01],
    ],
    (): [number, number] => [0.014, 0.005],
    { bone: tassel, color: LEATHER, name: "tassel" },
  );
  b.part(new THREE.SphereGeometry(0.02, 8, 6), GOLD, { bone: tassel, at: [-0.31, 0.99, 0.01], name: "tasselBead" });
  const fringe = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    return frame([-0.31 + 0.012 * Math.cos(a), 0.985, 0.01 + 0.012 * Math.sin(a)], [0, 1, 0]);
  });
  b.cards(fringe, [fringeGold, fringeRed], { size: [0.016, 0.12], lean: 180, vary: 0.2, rng: rng(5), bone: tassel });

  return b.root;
}
