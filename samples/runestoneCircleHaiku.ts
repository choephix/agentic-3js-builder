import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import type { Frame } from "../src/frame";
import { cells, gradient, mottle, noise, paint, scales } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Runestone Circle",
  description:
    "Ten chunky carved runestones, some chipped and mossed, stand in a broken ring round a gold-trimmed altar on a flagstone dais; cyan and violet runes glow, and a crystal cluster burns in the bowl.",
  style: "Blizzard/Warcraft",
  commit: "b816db2",
};

type Vec = [number, number, number];

const D = Math.PI / 180;
const UP: Vec = [0, 1, 0];

// Palette: warm sunlit stone, mauve shadows, saturated gold and bronze, cyan and violet glow.
const STONE_LIGHT = "#ffd98e";
const STONE_TOP = "#ffeab4";
const STONE_MID = "#c48a52";
const STONE_DARK = "#6e4262";
const STONE_DEEP = "#3a2a48";
const CRACK = "#5a3a4e";
const MOSS = "#5f9e3c";
const FLAG_A = "#c9a677";
const FLAG_B = "#b38a5c";
const FLAG_C = "#d6b68a";
const MORTAR = "#4b3749";
const PEBBLE_A = "#a58256";
const PEBBLE_B = "#8a6b72";
const PEBBLE_C = "#d1b587";
const ALTAR_LIGHT = "#c9a9bb";
const ALTAR_MID = "#8a6a88";
const ALTAR_DARK = "#4f3a5a";
const ALTAR_TOP = "#a88aa6";
const GOLD = "#f7c948";
const GOLD_DARK = "#b57a22";
const BRONZE = "#b96d2a";
const CRYSTAL = "#8ff6ff";
const RUNE_CYAN = "#5ff0ff";
const RUNE_VIOLET = "#c98bff";
const GROOVE = "#1e1424";
const WAX = "#f6ead0";
const FLAME = "#ffae3d";
const FLAME_CORE = "#fff0a0";

// Layout, metres. The dais is 2.9 m across; the stones stand on its top at y = 0.2.
const PLAT_TOP = 0.2;
const RING_R = 0.95;
const STONE_T0 = 0.27; // thickness at the foot
const STONE_T1 = 0.19; // thickness at the crown
const STONE_H = [1.26, 1.12, 1.36, 1.18, 1.3, 1.08, 1.34, 1.16, 1.24, 1.1];

// Rune glyphs as polylines in a 40 × 60 box (y down).
const GLYPHS: Record<string, [number, number][][]> = {
  othala: [
    [
      [20, 0],
      [36, 16],
      [20, 32],
      [4, 16],
      [20, 0],
    ],
    [
      [20, 32],
      [8, 60],
    ],
    [
      [20, 32],
      [32, 60],
    ],
  ],
  sowilo: [
    [
      [30, 0],
      [10, 20],
      [30, 40],
      [10, 60],
    ],
  ],
  algiz: [
    [
      [20, 0],
      [20, 60],
    ],
    [
      [20, 16],
      [4, 0],
    ],
    [
      [20, 16],
      [36, 0],
    ],
  ],
  kenaz: [
    [
      [30, 6],
      [10, 30],
      [30, 54],
    ],
  ],
  thurisaz: [
    [
      [10, 0],
      [10, 60],
    ],
    [
      [10, 0],
      [30, 15],
      [10, 30],
    ],
  ],
  berkano: [
    [
      [10, 0],
      [10, 60],
    ],
    [
      [10, 4],
      [30, 14],
      [10, 26],
    ],
    [
      [10, 32],
      [30, 42],
      [10, 56],
    ],
  ],
  fehu: [
    [
      [8, 0],
      [8, 60],
    ],
    [
      [8, 14],
      [34, 2],
    ],
    [
      [8, 32],
      [34, 20],
    ],
  ],
  ansuz: [
    [
      [10, 0],
      [10, 60],
    ],
    [
      [10, 10],
      [30, 2],
    ],
    [
      [10, 26],
      [30, 18],
    ],
  ],
  ingwaz: [
    [
      [20, 0],
      [36, 30],
      [20, 60],
      [4, 30],
      [20, 0],
    ],
  ],
};

const GRASS_GREEN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48">
<path d="M3 48 Q6 26 1 9 Q12 26 12 48 Z" fill="#2e6b2a"/>
<path d="M9 48 Q11 20 17 2 Q21 22 19 48 Z" fill="#4f9a36"/>
<path d="M16 48 Q18 28 26 13 Q26 31 28 48 Z" fill="#3a8230"/>
<path d="M22 48 Q25 36 31 31 Q29 41 30 48 Z" fill="#7cc046"/>
</svg>`;

const GRASS_DRY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48">
<path d="M4 48 Q7 24 2 8 Q13 24 13 48 Z" fill="#7a5a1f"/>
<path d="M11 48 Q13 18 19 1 Q23 20 21 48 Z" fill="#c99a3e"/>
<path d="M18 48 Q20 30 27 15 Q27 33 29 48 Z" fill="#a9782a"/>
<path d="M23 48 Q26 38 31 34 Q29 43 30 48 Z" fill="#e6c46a"/>
</svg>`;

function xy(r: number, deg: number): [number, number] {
  return [256 + r * Math.sin(deg * D), 256 - r * Math.cos(deg * D)];
}

/** Glowing rune column on a carved tablet: a dark groove under a bright stroke, three glyphs top to bottom. */
function runeTexture(names: string[], color: string) {
  const glyphs = names.map((name, i) => {
    const d = GLYPHS[name].map((stroke) => `M${stroke.map(([x, y]) => `${x} ${y}`).join(" L")}`).join(" ");
    const transform = `translate(38 ${9 + i * 78}) scale(1.1)`;
    const style = `fill="none" stroke-linecap="round" stroke-linejoin="round"`;
    return (
      `<path transform="${transform}" d="${d}" ${style} stroke="${GROOVE}" stroke-width="13"/>` +
      `<path transform="${transform}" d="${d}" ${style} stroke="${color}" stroke-width="5.5"/>`
    );
  });
  const frameLine = `<rect x="5" y="5" width="110" height="230" rx="12" fill="none" stroke="${GROOVE}" stroke-width="5"/>`;
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 240">${frameLine}${glyphs.join("")}</svg>`, {
    size: 384,
  });
}

/** A rune circle for the dais floor: a dark groove and cyan ring, tick marks and boss dots. */
function ringTexture() {
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const [x1, y1] = xy(210, i * 15);
    const [x2, y2] = xy(224, i * 15);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${RUNE_CYAN}" stroke-width="3"/>`;
  }).join("");
  const dots = Array.from({ length: 8 }, (_, i) => {
    const [x, y] = xy(178, i * 45 + 22.5);
    return `<circle cx="${x}" cy="${y}" r="6" fill="${RUNE_CYAN}"/>`;
  }).join("");
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">` +
      `<circle cx="256" cy="256" r="232" fill="none" stroke="${GROOVE}" stroke-width="12"/>` +
      `<circle cx="256" cy="256" r="232" fill="none" stroke="${RUNE_CYAN}" stroke-width="5"/>` +
      `<circle cx="256" cy="256" r="204" fill="none" stroke="${RUNE_CYAN}" stroke-width="2.5"/>` +
      ticks +
      dots +
      `</svg>`,
    { size: 512 },
  );
}

/** Point at polar angle `deg` (0 = +Z, 90 = +X) and radius `r`, at height `y`. */
const polar = (r: number, deg: number, y: number): Vec => [r * Math.sin(deg * D), y, r * Math.cos(deg * D)];

const circle = (r: number, y: number, n: number): number[][] =>
  Array.from({ length: n }, (_, i) => polar(r, (360 * i) / n, y));

/** Menhir outline in (across, height): an arched crown, or a chipped crown with a broken corner. */
function stoneOutline(H: number, chipped: boolean): OutlinePoint[] {
  const w = 0.21;
  return chipped
    ? [
        [-w, 0, "sharp"],
        [w, 0, "sharp"],
        [w, 0.7 * H],
        [0.13, 0.8 * H, "sharp"],
        [0.19, 0.92 * H],
        [0.05, H, "sharp"],
        [-0.14, 0.97 * H],
        [-w, 0.6 * H],
      ]
    : [
        [-w, 0, "sharp"],
        [w, 0, "sharp"],
        [w, 0.62 * H],
        [0.18, 0.88 * H],
        [0, H],
        [-0.18, 0.88 * H],
        [-w, 0.62 * H],
      ];
}

export default function build() {
  const b = createBuilder({ name: "runestoneCircle" });
  // One root bone: a prop group is rigid, so every part hangs from it.
  b.joint("base", { at: [0, 0, 0] });

  // Paints. Stone is a warm gradient with mottling, a mauve ground shadow, cracks, and painted lichen on the crowns.
  const STONE_BODY = mottle(gradient(STONE_LIGHT, STONE_MID, [0, 1.5, 0], [0, 0.15, 0]), STONE_DARK, {
    size: 0.2,
    contrast: 0.5,
  });
  const stoneSkin = paint((p, n) => {
    if (p.y < PLAT_TOP + 0.09) return STONE_DEEP;
    if (n.y > 0.55) return noise(p, 0.12, 3) > 0.45 ? MOSS : STONE_TOP;
    const c = cells(p, 0.5, 5);
    return c.d2 - c.d1 < 0.014 ? CRACK : STONE_BODY;
  });
  const looseStone = paint((_p, n) => (n.y > 0.5 ? STONE_TOP : STONE_BODY));
  const flags = scales([FLAG_A, FLAG_B, FLAG_C], MORTAR, { size: 0.34 });
  const daisSide = mottle(STONE_MID, STONE_DEEP, { size: 0.22 });
  const daisSkin = paint((_p, n) => (n.y > 0.5 ? flags : daisSide));
  const altarBody = mottle(gradient(ALTAR_LIGHT, ALTAR_MID, [0, 1.0, 0], [0, 0.2, 0]), ALTAR_DARK, {
    size: 0.14,
    contrast: 0.4,
  });
  const altarSkin = paint((p, n) => {
    if (n.y > 0.5) return ALTAR_TOP;
    if (p.y < PLAT_TOP + 0.12) return STONE_DEEP;
    return altarBody;
  });

  // Textures.
  const RUNE_A = runeTexture(["othala", "sowilo", "algiz"], RUNE_CYAN);
  const RUNE_B = runeTexture(["kenaz", "thurisaz", "berkano"], RUNE_CYAN);
  const RUNE_C = runeTexture(["fehu", "ansuz", "ingwaz"], RUNE_VIOLET);
  const RUNES = [RUNE_A, RUNE_B, RUNE_C];
  const RING = ringTexture();
  const GRASS = [svg(GRASS_GREEN, { size: 128 }), svg(GRASS_DRY, { size: 128 })];

  const tufts: Frame[] = [];

  // The dais: a two-tier flagstone disc with a gold band round its lower tier and a bronze lip on its top edge.
  b.lathe(
    [
      [0, 0],
      [1.5, 0],
      [1.5, 0.1],
      [1.42, 0.14],
      [1.36, 0.14],
      [1.36, PLAT_TOP],
      [0, PLAT_TOP],
    ],
    { at: [0, 0, 0], segments: 32, color: daisSkin, name: "dais" },
  );
  b.sweep(catmull(circle(1.505, 0.06, 56), { closed: true }), 0.011, { color: GOLD, sides: 6, name: "daisBandLow" });
  b.sweep(catmull(circle(1.355, PLAT_TOP, 56), { closed: true }), 0.009, {
    color: GOLD_DARK,
    sides: 6,
    name: "daisLip",
  });

  // Bronze rivets along the skirt below the gold band.
  for (let j = 0; j < 24; j++) b.part(new THREE.SphereGeometry(0.014, 5, 3), BRONZE, { at: polar(1.5, j * 15, 0.024) });

  // The rune circle inlaid on the flagstones just outside the stones, where it reads clear of them.
  glow(
    b.part(new THREE.CircleGeometry(1.3, 48), "#ffffff", {
      at: [0, PLAT_TOP + 0.004, 0],
      dir: UP,
      axis: "z",
      up: [0, 0, -1],
      texture: RING,
      name: "runeCircle",
    }),
    1.0,
  );

  // The runestones.
  for (let k = 0; k < 10; k++) {
    const deg = 18 + 36 * k; // the gap is at the front, +Z, where the entrance is
    const H = STONE_H[k];
    const chipped = k % 3 === 1;
    const s = Math.sin(deg * D);
    const c = Math.cos(deg * D);
    const rad: Vec = [s, 0, c]; // outward
    const tan: Vec = [c, 0, -s];
    const base = polar(RING_R, deg, PLAT_TOP);
    const thick = (h: number) => STONE_T0 + ((STONE_T1 - STONE_T0) * h) / H;
    // Point on the stone: u across, h above the foot, r along the normal from the centreline (default: the outer face).
    const onFace = (u: number, h: number, r = thick(h) / 2): Vec => [
      base[0] + tan[0] * u + rad[0] * r,
      PLAT_TOP + h,
      base[2] + tan[2] * u + rad[2] * r,
    ];

    const stone = b.extrude(stoneOutline(H, chipped), {
      at: base,
      x: tan,
      y: UP,
      thickness: [STONE_T0, STONE_T1],
      bevel: 0.03,
      smoothing: chipped ? 0 : 1,
      color: stoneSkin,
      name: `runestone${k}`,
      group: "runestones",
    });
    const hits = b.surface(stone);

    // A glowing rune column on the inner face, in a carved bronze-cornered panel.
    const yc = 0.46 * H;
    glow(
      b.decal(stone, RUNES[k % 3], {
        at: onFace(0, yc),
        dir: rad,
        up: UP,
        size: [0.24, 0.48],
        name: `rune${k}`,
      }),
      1.1,
    );
    for (const u of [-0.135, 0.135])
      for (const dh of [-0.265, 0.265])
        b.stick(new THREE.SphereGeometry(0.011, 5, 3), BRONZE, hits.nearest(onFace(u, yc + dh)), { embed: 0.35 });

    // A bronze strap round the foot of the inner face.
    b.stick(new THREE.BoxGeometry(0.03, 0.03, 0.36), BRONZE, hits.nearest(onFace(0, 0.1)), {
      flow: tan,
      embed: 0.3,
      name: `strap${k}`,
    });

    // Pebbles and tufts at the foot.
    b.part(new THREE.DodecahedronGeometry(0.05, 0), PEBBLE_A, {
      at: onFace(-0.3, 0.02, 0.16),
      scale: [1, 0.6, 0.85],
    });
    b.part(new THREE.DodecahedronGeometry(0.04, 0), PEBBLE_B, {
      at: onFace(0.3, 0.015, -0.12),
      scale: [1, 0.55, 0.9],
    });
    b.part(new THREE.DodecahedronGeometry(0.035, 0), PEBBLE_C, {
      at: onFace(0.27, 0.012, 0.2),
      scale: [1, 0.6, 1],
    });
    tufts.push(frame(onFace(-0.27, 0, 0.02), UP), frame(onFace(0.25, 0, -0.05), UP));
  }

  // Grass tufts round the dais rim, kept clear of the entrance.
  for (let j = 0; j < 24; j++) {
    const deg = 15 * j + 7.5;
    const off = Math.min(deg, 360 - deg);
    if (off < 18) continue;
    tufts.push(frame(polar(1.26, deg, PLAT_TOP), UP));
  }
  b.cards(tufts, GRASS, { size: [0.1, 0.16], vary: 0.3, rng: rng(7), bend: 12 });

  // A fallen tablet lying in the entrance, its rune face up.
  const tabletY = 0.235;
  const tablet = b.extrude(
    [
      [-0.12, -0.16],
      [0.12, -0.16],
      [0.12, 0.16],
      [-0.12, 0.16],
    ],
    {
      at: [0, tabletY, 1.16],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.07,
      bevel: 0.012,
      smoothing: 2,
      color: looseStone,
      name: "fallenTablet",
    },
  );
  glow(
    b.decal(tablet, RUNE_B, {
      at: [0, PLAT_TOP + 0.07, 1.16],
      dir: [0, 1, 0],
      up: [0, 0, -1],
      size: [0.15, 0.3],
      name: "tabletRune",
    }),
    1.0,
  );

  // Two bronze braziers flank the entrance, each with a glowing flame.
  for (const x of [-0.62, 0.62]) {
    b.lathe(
      [
        [0, 0],
        [0.09, 0],
        [0.09, 0.04],
        [0.035, 0.12],
        [0.035, 0.2],
        [0.12, 0.22],
        [0.16, 0.28],
        [0.14, 0.3],
        [0, 0.3],
      ],
      { at: [x, PLAT_TOP, 1.1], segments: 12, color: BRONZE, name: "brazier" },
    );
    glow(
      b.lathe(
        [
          [0, 0],
          [0.07, 0.03],
          [0.08, 0.1],
          [0.05, 0.17],
          [0, 0.23],
        ],
        { at: [x, PLAT_TOP + 0.3, 1.1], segments: 8, color: FLAME, name: "brazierFlame" },
      ),
      1.4,
    );
    glow(
      b.lathe(
        [
          [0, 0],
          [0.035, 0.02],
          [0.04, 0.09],
          [0, 0.14],
        ],
        { at: [x, PLAT_TOP + 0.3, 1.1], segments: 6, color: FLAME_CORE, name: "brazierCore" },
      ),
      1.8,
    );
  }

  // Broken rubble lying on the dais outside the stones.
  for (const [deg, w] of [
    [118, 0.1],
    [205, 0.12],
    [300, 0.09],
  ] as const) {
    const sn = Math.sin(deg * D);
    const cs = Math.cos(deg * D);
    const p = polar(1.2, deg, tabletY);
    b.extrude(
      [
        [-w, -0.06],
        [0.05, -0.09],
        [w, 0.01],
        [0.03, 0.08],
        [-0.08, 0.05],
      ],
      {
        at: p,
        x: [cs, 0, -sn],
        y: [sn, 0, cs],
        thickness: 0.07,
        bevel: 0.01,
        smoothing: 1,
        color: STONE_MID,
        name: `rubble${deg}`,
      },
    );
  }

  // The altar: a stepped octagonal-ish drum with gold bands, a bronze stud row and a carved bowl.
  b.lathe(
    [
      [0, 0],
      [0.8, 0],
      [0.8, 0.07],
      [0.72, 0.11],
      [0.66, 0.13],
      [0.66, 0.66],
      [0.7, 0.68],
      [0.7, 0.76],
      [0.66, 0.8],
      [0, 0.8],
    ],
    { at: [0, PLAT_TOP, 0], segments: 16, color: altarSkin, name: "altar" },
  );
  b.sweep(catmull(circle(0.655, PLAT_TOP + 0.16, 40), { closed: true }), 0.02, { color: GOLD, sides: 6 });
  b.sweep(catmull(circle(0.655, PLAT_TOP + 0.62, 40), { closed: true }), 0.02, { color: GOLD, sides: 6 });
  for (let k = 0; k < 6; k++)
    b.part(new THREE.SphereGeometry(0.025, 6, 4), BRONZE, { at: polar(0.66, k * 60, 0.6), name: `stud${k}` });

  b.lathe(
    [
      [0, 0],
      [0.46, 0],
      [0.52, 0.1],
      [0.46, 0.16],
      [0.38, 0.16],
      [0.32, 0.07],
      [0, 0.07],
    ],
    { at: [0, 1.0, 0], segments: 14, color: GOLD_DARK, name: "bowl" },
  );

  // Crystal cluster in the bowl: a tall central shard and four leaning shards.
  glow(
    b.part(new THREE.OctahedronGeometry(0.12, 0), CRYSTAL, {
      at: [0, 1.22, 0],
      scale: [1, 1.9, 1],
      name: "crystalCore",
    }),
    1.6,
  );
  for (const deg of [0, 90, 180, 270]) {
    const tilt: Vec = [22 * Math.cos(deg * D), 0, -22 * Math.sin(deg * D)];
    glow(
      b.part(new THREE.OctahedronGeometry(0.06, 0), CRYSTAL, {
        at: polar(0.24, deg, 1.1),
        scale: [1, 2.3, 1],
        rotation: tilt,
        name: `crystalShard${deg}`,
      }),
      1.6,
    );
  }

  // Three candles on the altar top, each with a gold drip-cup and a glowing flame.
  for (const deg of [40, 160, 280]) {
    const [x, , z] = polar(0.6, deg, 0);
    b.part(new THREE.CylinderGeometry(0.055, 0.06, 0.025, 10), GOLD, { at: [x, 1.0125, z] });
    b.part(new THREE.CylinderGeometry(0.035, 0.04, 0.16, 8), WAX, { at: [x, 1.1, z] });
    glow(
      b.lathe(
        [
          [0, 0],
          [0.026, 0.02],
          [0.03, 0.06],
          [0, 0.1],
        ],
        { at: [x, 1.18, z], segments: 6, color: FLAME, name: "candleFlame" },
      ),
      1.4,
    );
  }

  return b.root;
}
