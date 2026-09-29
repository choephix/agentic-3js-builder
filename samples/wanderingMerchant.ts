// Wandering merchant. A travelling trader in a hooded terracotta cloak and patched mustard tunic, a friendly face with
// a big nose and a ginger beard, walking staff in one hand and a paper lantern in the other, pouches on a belt. On
// his back a towering wooden pack frame with a trunk, a bottle crate, standing carpet rolls, a scroll case, a
// birdcage with a songbird, a canvas roof with a pennant, and charms, tassels, bunting, a map and a shop sign
// dangling everywhere. The volumes are plain faceted low-poly shapes in flat colour; the detail is SVG drawings on
// planes: embroidered hem bands, sewn patches, pouch flaps, the drawn face, beard locks, feathers, tassels, fringe,
// ribbons, charms, labels, bunting, carpet ends. Humanoid rig with five-finger hands, jaw and toes.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { offset, rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import type { Joint } from "../src/skeleton";
import type { Surface } from "../src/surface";
import { svg } from "../src/texture";

export const meta = {
  name: "Wandering Merchant",
  description:
    "A 1.7 m travelling merchant NPC in a hooded cloak and patched clothes, with a big-nosed bearded face and five-finger hands, a walking staff and a hand lantern, belt pouches, and a towering pack frame loaded with a trunk, bottles, carpets, scrolls, a birdcage, charms, tassels and bunting, in stylized low-poly with lots of SVG planes.",
};

type V3 = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette: flat fills only.

const SKIN = "#e3aa7c";
const SKIN_RED = "#d98462";
const BEARD = "#b9632b";
const CLOAK = "#a5482a";
const CLOAK_DK = "#7a3220";
const LINING = "#e6c27a";
const TUNIC = "#dba23f";
const TUNIC_DK = "#b47d2a";
const TROUSER = "#5f6c3b";
const BOOT = "#5b3a22";
const BOOT_DK = "#3a2415";
const SOLE = "#25170f";
const LEATHER = "#8b5a31";
const LEATHER_LT = "#b47d49";
const LEATHER_DK = "#5c3a20";
const WOOD = "#a06f3f";
const WOOD_DK = "#6f4a28";
const WOOD_LT = "#c99259";
const ROPE = "#d6b67c";
const ROPE_DK = "#a88652";
const CANVAS = "#ece0c4";
const CANVAS_DK = "#c9b58a";
const TEAL = "#2f8f8a";
const TEAL_DK = "#1f6664";
const RED = "#c93a2c";
const BRASS = "#dcaa3c";
const BRASS_DK = "#9c7626";
const COPPER = "#cb6b3a";
const COPPER_DK = "#8e4326";
const IRON = "#55555e";
const BLUE_GLASS = "#3a6ea8";
const GREEN_GLASS = "#4fa36a";
const AMBER = "#e0902e";
const PURPLE = "#7a4a9a";
const CREAM = "#f3e9d0";
const CORK = "#c4956a";

// ---------------------------------------------------------------------------------------------------------------
// Drawings: flat-filled crisp shapes only. Every helper returns a piece of SVG markup.

const f2 = (n: number) => Math.round(n * 100) / 100;
type Pt = readonly [number, number];
const poly = (pts: readonly Pt[], fill: string, extra = "") =>
  `<polygon points="${pts.map(([x, y]) => `${f2(x)},${f2(y)}`).join(" ")}" fill="${fill}"${extra ? ` ${extra}` : ""}/>`;
const rect = (x: number, y: number, w: number, h: number, fill: string, extra = "") =>
  `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${fill}"${extra ? ` ${extra}` : ""}/>`;
const circ = (cx: number, cy: number, r: number, fill: string, extra = "") =>
  `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(r)}" fill="${fill}"${extra ? ` ${extra}` : ""}/>`;
const seg = (x1: number, y1: number, x2: number, y2: number, stroke: string, w: number) =>
  `<line x1="${f2(x1)}" y1="${f2(y1)}" x2="${f2(x2)}" y2="${f2(y2)}" stroke="${stroke}" stroke-width="${w}"/>`;
const reg = (cx: number, cy: number, r: number, n: number, rot: number, fill: string, extra = "") =>
  poly(
    Array.from(
      { length: n },
      (_, k): Pt => [cx + r * Math.cos(rot + (k * 2 * Math.PI) / n), cy + r * Math.sin(rot + (k * 2 * Math.PI) / n)],
    ),
    fill,
    extra,
  );
const star = (cx: number, cy: number, r1: number, r2: number, n: number, rot: number, fill: string) =>
  poly(
    Array.from({ length: n * 2 }, (_, k): Pt => {
      const r = k % 2 ? r2 : r1;
      const a = rot + (k * Math.PI) / n;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    }),
    fill,
  );
const tex = (w: number, h: number, body: string, size = 128) =>
  svg(`<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`, { size });

const CORD = "#d8c090";
const HANG = (w: number) => rect(w / 2 - 0.6, 0, 1.2, 10, CORD);

/** The drawn face: eyes, brows, blush, laugh lines and freckles, on transparent ground over the skin. */
function faceTex() {
  const eye = (cx: number) => {
    const d = cx < 64 ? -1 : 1;
    return (
      poly(
        [
          [cx - 10, 49],
          [cx - 4, 42.5],
          [cx + 4, 42.5],
          [cx + 10, 48],
          [cx + 4, 54],
          [cx - 4, 54],
        ],
        "#fbf3e4",
      ) +
      circ(cx, 48.2, 5, "#6b4a2b") +
      circ(cx, 48.2, 2.6, "#1e1410") +
      circ(cx - 1.6, 46.4, 1.2, "#ffffff") +
      poly(
        [
          [cx - 11, 49.5],
          [cx - 4, 41.2],
          [cx + 4, 41.2],
          [cx + 11.5, 47.5],
          [cx + 4, 43.4],
          [cx - 4, 43.4],
        ],
        "#3b2418",
      ) +
      poly(
        [
          [cx - d * 14, 36.5],
          [cx - d * 5, 30],
          [cx + d * 7, 29],
          [cx + d * 16, 33],
          [cx + d * 8, 34],
          [cx - d * 4, 35],
          [cx - d * 13, 40],
        ],
        "#7a4a26",
      ) +
      poly(
        [
          [cx - d * 9, 33],
          [cx + d * 4, 30.5],
          [cx + d * 12, 32.5],
          [cx + d * 3, 32.6],
        ],
        "#c98f57",
      ) +
      seg(cx + d * 13, 48, cx + d * 20, 45, "#b97a52", 1.5) +
      seg(cx + d * 13, 51, cx + d * 21, 51.5, "#b97a52", 1.5) +
      seg(cx + d * 12, 54, cx + d * 19, 57.5, "#b97a52", 1.5)
    );
  };
  let dots = "";
  for (const [x, y] of [
    [50, 62],
    [56, 65],
    [44, 66],
    [78, 62],
    [72, 65],
    [84, 66],
    [40, 60],
    [88, 60],
  ] as Pt[])
    dots += circ(x, y, 1.1, "#b97a52");
  return tex(
    128,
    104,
    reg(29, 66, 9, 6, 0.3, "#ec9270") + reg(99, 66, 9, 6, 0.3, "#ec9270") + eye(41) + eye(87) + dots,
    256,
  );
}

const mouthTex = () =>
  tex(
    48,
    26,
    poly(
      [
        [1, 7],
        [10, 2],
        [24, 0.5],
        [38, 2],
        [47, 7],
        [40, 18],
        [24, 25],
        [8, 18],
      ],
      "#c4574a",
    ) +
      poly(
        [
          [5, 7],
          [12, 4.5],
          [24, 3.5],
          [36, 4.5],
          [43, 7],
          [38, 16],
          [24, 22],
          [10, 16],
        ],
        "#3a1712",
      ) +
      poly(
        [
          [8, 7],
          [14, 5.3],
          [24, 4.7],
          [34, 5.3],
          [40, 7],
          [37, 11],
          [24, 12],
          [11, 11],
        ],
        "#fbf3e4",
      ) +
      poly(
        [
          [15, 17],
          [24, 12.5],
          [33, 17],
          [24, 21.5],
        ],
        "#e06a5c",
      ),
    128,
  );

/** Locks of beard or hair rooted along the bottom edge, pointed tips up. */
function locksTex(cols: readonly string[], seed: number, streak = "") {
  const r = rng(seed);
  let body = "";
  for (let k = 0; k < 3; k++) {
    const x = 4.5 + k * 7.5 + (r() - 0.5) * 2;
    const w = 6.4 + r() * 1.8;
    const tip = 4 + r() * 12;
    const sway = (r() - 0.5) * 6;
    body += poly(
      [
        [x - w / 2, 64],
        [x - w * 0.42, 40],
        [x + sway * 0.6, tip + 18],
        [x + sway, tip],
        [x + w * 0.4 + sway * 0.5, tip + 20],
        [x + w * 0.5, 42],
        [x + w / 2, 64],
      ],
      cols[k % cols.length],
    );
    body += poly(
      [
        [x - w * 0.1, 62],
        [x + sway * 0.6, tip + 22],
        [x + sway * 0.9, tip + 3],
        [x + w * 0.25, 46],
      ],
      cols[(k + 1) % cols.length],
    );
    if (streak)
      body += poly(
        [
          [x, 56],
          [x + sway * 0.7, tip + 14],
          [x + sway * 0.4 + 1.2, tip + 20],
          [x + 1.6, 56],
        ],
        streak,
      );
  }
  return tex(24, 64, body, 128);
}

const mustacheTex = () =>
  tex(
    96,
    32,
    [1, -1]
      .map((s) => {
        const X = (x: number) => 48 + s * x;
        return (
          poly(
            [
              [X(0), 6],
              [X(24), 3],
              [X(42), 8],
              [X(47), 20],
              [X(41), 27],
              [X(36), 19],
              [X(24), 20],
              [X(8), 27],
              [X(0), 24],
            ],
            "#b9632b",
          ) +
          poly(
            [
              [X(2), 8],
              [X(24), 5],
              [X(40), 9],
              [X(24), 12],
              [X(3), 14],
            ],
            "#d88a44",
          ) +
          poly(
            [
              [X(4), 24],
              [X(9), 20],
              [X(24), 16],
              [X(36), 22],
              [X(28), 19],
              [X(12), 24],
            ],
            "#8c4820",
          ) +
          poly(
            [
              [X(42), 20],
              [X(47), 14],
              [X(46), 24],
              [X(41), 28],
            ],
            "#d88a44",
          )
        );
      })
      .join(""),
    256,
  );

function featherTex(main: string, dark: string, spot: string, quill = "#efe2c4") {
  let body = "";
  for (const s of [-1, 1]) {
    const X = (x: number) => 12 + s * x;
    body += poly(
      [
        [X(0.5), 76],
        [X(6), 60],
        [X(10), 40],
        [X(9), 20],
        [X(5), 8],
        [X(0.5), 2],
      ],
      main,
    );
    for (let i = 0; i < 5; i++) {
      const y = 66 - i * 11;
      body += poly(
        [
          [X(0.8), y],
          [X(9 - i * 0.6), y - 8],
          [X(9.4 - i * 0.6), y - 11],
          [X(1), y - 6],
        ],
        dark,
      );
    }
  }
  body += poly(
    [
      [11.2, 80],
      [12.8, 80],
      [12.4, 4],
      [11.6, 4],
    ],
    quill,
  );
  body += circ(12, 24, 6.4, dark) + circ(12, 24, 4.6, spot) + circ(12, 24, 2.4, main);
  return tex(24, 80, body, 160);
}

function tasselTex(head: string, skirt: string, dark: string, band = "#e8c05a") {
  let strands = "";
  for (let k = 0; k < 6; k++)
    strands += poly(
      [
        [2.5 + k * 2.2, 18],
        [3.6 + k * 2.2, 18],
        [2.6 + k * 2.3, 47],
        [1.8 + k * 2.3, 47],
      ],
      k % 2 ? dark : skirt,
    );
  return tex(
    16,
    48,
    HANG(16) +
      circ(8, 12.5, 4.4, head) +
      rect(4.6, 15.5, 6.8, 2.6, band) +
      poly(
        [
          [3.2, 18],
          [12.8, 18],
          [15, 47],
          [1, 47],
        ],
        skirt,
      ) +
      strands +
      rect(1, 44, 14, 1.4, band),
    128,
  );
}

/** A hanging fringe of knotted threads: band at the top, threads down (`flip` turns it over: band at the bottom). */
function fringeTex(a: string, b2: string, flip = false) {
  let body = rect(0, 0, 48, 4, a);
  for (let k = 0; k < 12; k++) {
    const long = k % 2 ? 22 : 18;
    body += rect(1.2 + k * 3.9, 3, 1.7, long, k % 3 ? a : b2);
    body += rect(0.8 + k * 3.9, 3 + long - 5, 2.5, 1.6, b2);
  }
  return tex(48, 24, flip ? `<g transform="translate(0,24) scale(1,-1)">${body}</g>` : body, 192);
}

function bandTex(bg: string, c1: string, c2: string, kind: "diamond" | "zig" | "dots" | "wave") {
  let body = rect(0, 0, 128, 20, bg) + rect(0, 1.5, 128, 1.6, c1) + rect(0, 16.9, 128, 1.6, c1);
  for (let k = 0; k < 10; k++) {
    const cx = 6.4 + k * 12.8;
    if (kind === "diamond")
      body +=
        poly(
          [
            [cx, 4.5],
            [cx + 5.4, 10],
            [cx, 15.5],
            [cx - 5.4, 10],
          ],
          c2,
        ) +
        poly(
          [
            [cx, 7.4],
            [cx + 2.6, 10],
            [cx, 12.6],
            [cx - 2.6, 10],
          ],
          c1,
        );
    else if (kind === "zig")
      body +=
        poly(
          [
            [cx - 6.4, 16],
            [cx, 5],
            [cx + 6.4, 16],
          ],
          k % 2 ? c2 : c1,
        ) +
        poly(
          [
            [cx - 2, 16],
            [cx, 11],
            [cx + 2, 16],
          ],
          bg,
        );
    else if (kind === "dots") body += reg(cx, 10, 3.6, 6, 0.3, c2) + reg(cx + 6.4, 10, 1.6, 4, 0.78, c1);
    else
      body += poly(
        [
          [cx - 6.4, 12],
          [cx - 3.2, 6],
          [cx, 12],
          [cx + 3.2, 14],
          [cx + 6.4, 12],
          [cx + 3.2, 10],
          [cx, 16],
          [cx - 3.2, 14],
        ],
        c2,
      );
  }
  return tex(128, 20, body, 384);
}

function patchTex(bg: string, fg: string, kind: "plaid" | "star" | "diamond" | "flower" | "stripes", seed: number) {
  const r = rng(seed);
  const j = () => (r() - 0.5) * 3;
  const shape: Pt[] = [
    [2 + j(), 3 + j()],
    [30 + j(), 2 + j()],
    [30 + j(), 29 + j()],
    [3 + j(), 30 + j()],
  ];
  let m = "";
  if (kind === "plaid")
    m = rect(2, 9, 28, 3.5, fg) + rect(2, 20, 28, 3.5, fg) + rect(9, 2, 3.5, 28, fg) + rect(20, 2, 3.5, 28, fg);
  else if (kind === "star") m = star(16, 16, 10.5, 4.6, 5, -Math.PI / 2, fg);
  else if (kind === "diamond")
    m =
      poly(
        [
          [16, 4],
          [27, 16],
          [16, 28],
          [5, 16],
        ],
        fg,
      ) +
      poly(
        [
          [16, 10],
          [21, 16],
          [16, 22],
          [11, 16],
        ],
        bg,
      );
  else if (kind === "flower") {
    for (let k = 0; k < 5; k++)
      m += circ(16 + 6.5 * Math.cos(k * 1.2566 - 1.57), 16 + 6.5 * Math.sin(k * 1.2566 - 1.57), 4.6, fg);
    m += circ(16, 16, 3.6, "#f4d466");
  } else m = rect(2, 6, 28, 4, fg) + rect(2, 14, 28, 4, fg) + rect(2, 22, 28, 4, fg);
  return tex(
    32,
    32,
    poly(shape, bg) +
      `<clipPath id="c"><polygon points="${shape.map(([x, y]) => `${f2(x)},${f2(y)}`).join(" ")}"/></clipPath><g clip-path="url(#c)">${m}</g>` +
      poly(
        shape.map(([x, y]): Pt => [16 + (x - 16) * 0.86, 16 + (y - 16) * 0.86]),
        "none",
        `stroke="#f4e6bd" stroke-width="1.2" stroke-dasharray="3 2"`,
      ),
    128,
  );
}

function flapTex(bg: string, motif: string, kind: "sun" | "leaf" | "eye" | "diamond") {
  let m = "";
  if (kind === "sun") {
    for (let k = 0; k < 8; k++)
      m += poly(
        [
          [16 + 4.6 * Math.cos(k * 0.785 - 0.2), 12 + 4.6 * Math.sin(k * 0.785 - 0.2)],
          [16 + 9 * Math.cos(k * 0.785), 12 + 9 * Math.sin(k * 0.785)],
          [16 + 4.6 * Math.cos(k * 0.785 + 0.2), 12 + 4.6 * Math.sin(k * 0.785 + 0.2)],
        ],
        motif,
      );
    m += circ(16, 12, 4.4, motif);
  } else if (kind === "leaf")
    m =
      poly(
        [
          [16, 4],
          [23, 12],
          [16, 21],
          [9, 12],
        ],
        motif,
      ) + rect(15.4, 6, 1.2, 15, bg);
  else if (kind === "eye")
    m =
      poly(
        [
          [6, 12],
          [16, 5],
          [26, 12],
          [16, 19],
        ],
        motif,
      ) +
      circ(16, 12, 3.8, bg) +
      circ(16, 12, 1.8, "#1c1512");
  else
    m =
      poly(
        [
          [16, 3],
          [24, 11],
          [16, 19],
          [8, 11],
        ],
        motif,
      ) +
      poly(
        [
          [16, 8],
          [20, 11],
          [16, 14],
          [12, 11],
        ],
        bg,
      );
  return tex(
    32,
    32,
    poly(
      [
        [2, 1],
        [30, 1],
        [30, 20],
        [16, 30],
        [2, 20],
      ],
      bg,
    ) +
      poly(
        [
          [4.5, 3.5],
          [27.5, 3.5],
          [27.5, 18.6],
          [16, 26.6],
          [4.5, 18.6],
        ],
        "none",
        `stroke="#f4e6bd" stroke-width="1.1" stroke-dasharray="2.6 1.8"`,
      ) +
      m +
      circ(16, 26.2, 2.4, "#dcaa3c") +
      circ(16, 26.2, 1, "#9c7626"),
    128,
  );
}

const broochTex = () => {
  let rays = "";
  for (let k = 0; k < 10; k++)
    rays += poly(
      [
        [16 + 10 * Math.cos(k * 0.628), 16 + 10 * Math.sin(k * 0.628)],
        [16 + 15 * Math.cos(k * 0.628 + 0.314), 16 + 15 * Math.sin(k * 0.628 + 0.314)],
        [16 + 10 * Math.cos(k * 0.628 + 0.628), 16 + 10 * Math.sin(k * 0.628 + 0.628)],
      ],
      "#dcaa3c",
    );
  return tex(
    32,
    32,
    rays +
      circ(16, 16, 11, "#dcaa3c") +
      circ(16, 16, 8.6, "#9c7626") +
      reg(16, 16, 6.6, 6, 0, "#c93a2c") +
      poly(
        [
          [16, 10],
          [20, 13],
          [16, 16],
          [12, 13],
        ],
        "#f08a70",
      ),
    128,
  );
};

const buckleTex = () =>
  tex(
    36,
    24,
    rect(0, 8, 36, 8, "#8b5a31") +
      rect(4, 2, 28, 20, "#dcaa3c") +
      rect(8, 6, 20, 12, "#8b5a31") +
      rect(15, 4, 6, 16, "#9c7626") +
      rect(4, 2, 28, 2.4, "#f0cc6a"),
    144,
  );

const lacingTex = () => {
  let body = poly(
    [
      [6, 0],
      [14, 0],
      [13, 88],
      [7, 88],
    ],
    "#7a3220",
  );
  for (let k = 0; k < 7; k++) {
    const y = 6 + k * 11.5;
    body += circ(4.5, y, 1.7, "#e8c05a") + circ(15.5, y, 1.7, "#e8c05a");
    if (k < 6) body += seg(4.5, y, 15.5, y + 11.5, "#f3e9d0", 1.4) + seg(15.5, y, 4.5, y + 11.5, "#f3e9d0", 1.4);
  }
  return tex(20, 96, body + rect(9.3, 88, 1.4, 8, "#f3e9d0"), 160);
};

function charmTex(kind: string) {
  const G = "#dcaa3c";
  const GD = "#9c7626";
  let m = "";
  if (kind === "star") m = star(16, 28, 15, 6.6, 5, -Math.PI / 2, G) + star(16, 28, 9, 4, 5, -Math.PI / 2, "#f0cc6a");
  else if (kind === "moon") {
    const arc = (cx: number, cy: number, r: number, keep: (p: Pt) => boolean): Pt[] => {
      const ring = Array.from(
        { length: 30 },
        (_, k): Pt => [cx + r * Math.cos((k * Math.PI) / 15), cy + r * Math.sin((k * Math.PI) / 15)],
      );
      const start = ring.findIndex((p, k) => keep(p) && !keep(ring[(k + 29) % 30]));
      const out: Pt[] = [];
      for (let k = 0; k < 30; k++) if (keep(ring[(start + k) % 30])) out.push(ring[(start + k) % 30]);
      return out;
    };
    const outer = arc(16, 28, 14, (p) => Math.hypot(p[0] - 22, p[1] - 25) >= 11.5);
    const inner = arc(22, 25, 11.5, (p) => Math.hypot(p[0] - 16, p[1] - 28) <= 14);
    const dist = (p: Pt, q: Pt) => Math.hypot(p[0] - q[0], p[1] - q[1]);
    const end = outer[outer.length - 1];
    const ordered = dist(inner[0], end) < dist(inner[inner.length - 1], end) ? inner : [...inner].reverse();
    m = poly([...outer, ...ordered], "#c8d6ea") + circ(9.5, 27, 1.5, "#5b7aa8");
  } else if (kind === "fish")
    m =
      poly(
        [
          [16, 12],
          [23, 22],
          [21, 36],
          [16, 40],
          [11, 36],
          [9, 22],
        ],
        "#2f8f8a",
      ) +
      poly(
        [
          [16, 38],
          [25, 47],
          [16, 45],
          [7, 47],
        ],
        "#1f6664",
      ) +
      poly(
        [
          [9, 24],
          [3, 30],
          [10, 32],
        ],
        "#1f6664",
      ) +
      poly(
        [
          [23, 24],
          [29, 30],
          [22, 32],
        ],
        "#1f6664",
      ) +
      poly(
        [
          [12, 26],
          [20, 26],
          [19, 29],
          [13, 29],
        ],
        "#e0902e",
      ) +
      circ(13.4, 19, 2, "#fbf3e4") +
      circ(13.4, 19, 0.9, "#1c1512");
  else if (kind === "key")
    m =
      `<circle cx="16" cy="18" r="7" fill="none" stroke="#55555e" stroke-width="3.6"/>` +
      rect(14.5, 24, 3, 20, "#55555e") +
      rect(17.5, 36, 5, 2.6, "#55555e") +
      rect(17.5, 41, 4, 2.6, "#55555e");
  else if (kind === "horseshoe")
    m =
      `<path d="M8,14 L8,30 A8,8 0 0 0 24,30 L24,14" fill="none" stroke="#6f6f7a" stroke-width="5.4"/>` +
      circ(8, 19, 1.1, "#2b1d17") +
      circ(8, 26, 1.1, "#2b1d17") +
      circ(24, 19, 1.1, "#2b1d17") +
      circ(24, 26, 1.1, "#2b1d17") +
      circ(12, 34, 1.1, "#2b1d17") +
      circ(20, 34, 1.1, "#2b1d17");
  else if (kind === "coin")
    m =
      reg(16, 28, 14, 8, 0.39, G) +
      reg(16, 28, 11, 8, 0.39, GD) +
      reg(16, 28, 9.6, 8, 0.39, G) +
      rect(12, 24, 8, 8, "#6f4a28");
  else if (kind === "eye")
    m =
      circ(16, 28, 14, "#3a6ea8") +
      circ(16, 28, 10.4, "#fbf3e4") +
      circ(16, 28, 7, "#5aa0d8") +
      circ(16, 28, 3.6, "#1c1512");
  else if (kind === "clover") {
    for (const [dx, dy] of [
      [-5.4, -5.4],
      [5.4, -5.4],
      [-5.4, 5.4],
      [5.4, 5.4],
    ])
      m += reg(16 + dx, 26 + dy, 5.6, 5, 0.3, "#4fa36a");
    m +=
      circ(16, 26, 3, "#2f7a4a") +
      poly(
        [
          [16, 30],
          [17.6, 30],
          [21, 46],
          [19.6, 46],
        ],
        "#2f7a4a",
      );
  } else if (kind === "bell")
    m =
      poly(
        [
          [5, 40],
          [6.5, 26],
          [11, 17],
          [16, 14],
          [21, 17],
          [25.5, 26],
          [27, 40],
        ],
        G,
      ) +
      poly(
        [
          [9, 38],
          [10, 27],
          [13, 20],
          [14, 20],
          [13, 38],
        ],
        "#f0cc6a",
      ) +
      rect(4, 39, 24, 4, GD) +
      circ(16, 46, 2.6, GD);
  else if (kind === "shell") {
    for (let k = 0; k < 5; k++) {
      const a = -2.2 + k * 0.55;
      m += poly(
        [
          [16, 44],
          [16 + 17 * Math.sin(a - 0.26), 44 - 30 * Math.cos(a - 0.26)],
          [16 + 17 * Math.sin(a + 0.26), 44 - 30 * Math.cos(a + 0.26)],
        ],
        k % 2 ? "#f2b8b0" : "#f8d6cc",
      );
    }
    m += rect(11, 42, 10, 4, "#c98a7a");
  }
  return tex(32, 48, HANG(32) + m, 128);
}

function dreamcatcherTex() {
  let web = "";
  for (let k = 0; k < 8; k++) {
    const a = k * 0.785;
    web += seg(
      20 + 10 * Math.cos(a),
      30 + 10 * Math.sin(a),
      20 + 10 * Math.cos(a + 2.36),
      30 + 10 * Math.sin(a + 2.36),
      "#f3e9d0",
      0.9,
    );
  }
  const feather = (x: number, top: number, fill: string, dark: string) =>
    poly(
      [
        [x, top + 26],
        [x - 3.6, top + 14],
        [x - 2.4, top + 4],
        [x, top],
        [x + 2.4, top + 4],
        [x + 3.6, top + 14],
      ],
      fill,
    ) + seg(x, top + 26, x, top + 3, dark, 0.9);
  return tex(
    40,
    80,
    HANG(40) +
      `<circle cx="20" cy="30" r="12" fill="none" stroke="#a06f3f" stroke-width="3"/>` +
      web +
      circ(20, 30, 2, "#3a6ea8") +
      seg(14, 41, 9, 46, CORD, 1) +
      seg(20, 42, 20, 47, CORD, 1) +
      seg(26, 41, 31, 46, CORD, 1) +
      feather(9, 46, "#2f8f8a", "#1f6664") +
      feather(20, 47, "#c93a2c", "#8f2620") +
      feather(31, 46, "#dcaa3c", "#9c7626") +
      circ(9, 46, 1.6, "#f3e9d0") +
      circ(20, 47, 1.6, "#f3e9d0") +
      circ(31, 46, 1.6, "#f3e9d0"),
    160,
  );
}

function ribbonTex(a: string, b2: string) {
  return tex(
    12,
    56,
    HANG(12) +
      poly(
        [
          [1, 8],
          [11, 8],
          [11, 56],
          [6, 47],
          [1, 56],
        ],
        a,
      ) +
      rect(1, 16, 10, 3, b2) +
      rect(1, 24, 10, 1.6, b2) +
      rect(1, 34, 10, 3, b2),
    96,
  );
}

function flagTex(bg: string, fg: string, kind: number) {
  let m = "";
  if (kind === 0) m = circ(12, 9, 4.4, fg);
  else if (kind === 1) m = rect(0, 6, 24, 3, fg) + rect(0, 12, 24, 2, fg);
  else if (kind === 2) m = star(12, 10, 5.6, 2.4, 5, -Math.PI / 2, fg);
  else
    m = poly(
      [
        [3, 3],
        [7, 10],
        [11, 3],
        [15, 10],
        [19, 3],
        [21, 6],
        [17, 13],
        [13, 6],
        [9, 13],
        [5, 6],
      ],
      fg,
    );
  return tex(
    24,
    30,
    rect(11.4, 0, 1.2, 3, "#5c3a20") +
      rect(0, 2, 24, 2.4, "#3a2415") +
      `<clipPath id="f"><polygon points="0,4 24,4 12,29"/></clipPath>` +
      poly(
        [
          [0, 4],
          [24, 4],
          [12, 29],
        ],
        bg,
      ) +
      `<g clip-path="url(#f)">${m}</g>`,
    96,
  );
}

/** A swallow-tailed pennant, wide at the pole end (bottom of the drawing) and pointed at the far end. */
function pennantTex() {
  return tex(
    24,
    40,
    poly(
      [
        [0, 40],
        [24, 40],
        [21, 20],
        [12, 0],
        [3, 20],
      ],
      "#c93a2c",
    ) +
      poly(
        [
          [3, 20],
          [21, 20],
          [19, 26],
          [5, 26],
        ],
        "#f3e9d0",
      ) +
      star(12, 32, 4.6, 1.9, 5, -Math.PI / 2, "#f0cc6a") +
      poly(
        [
          [12, 0],
          [15, 8],
          [9, 8],
        ],
        "#dcaa3c",
      ),
    128,
  );
}

/** Carpet roll side (u round the roll, v along it): woven bands at both ends and a lozenge motif field. */
function carpetSideTex(bg: string, c1: string, c2: string) {
  let body =
    rect(0, 0, 64, 32, bg) +
    rect(0, 0, 64, 3, c1) +
    rect(0, 29, 64, 3, c1) +
    rect(0, 4.5, 64, 1.4, c2) +
    rect(0, 26.1, 64, 1.4, c2);
  for (let k = 0; k < 8; k++) {
    const cx = 4 + k * 8;
    body +=
      poly(
        [
          [cx, 9],
          [cx + 3.6, 16],
          [cx, 23],
          [cx - 3.6, 16],
        ],
        c1,
      ) +
      poly(
        [
          [cx, 12.4],
          [cx + 1.6, 16],
          [cx, 19.6],
          [cx - 1.6, 16],
        ],
        c2,
      );
  }
  return tex(64, 32, body, 128);
}

function carpetEndTex(c1: string, c2: string, c3: string) {
  const cols = [c1, c2, c3, c2];
  let body = "";
  for (let i = 0; i < 6; i++) body += reg(16, 16, 15.5 - i * 2.6, 8, 0.39 + i * 0.2, cols[i % 4]);
  return tex(32, 32, body, 64);
}

function bottleLabelTex(bg: string, band: string) {
  return tex(
    14,
    18,
    rect(0, 0, 14, 18, bg) + rect(0, 3, 14, 3, band) + rect(0, 12, 14, 2, band) + reg(7, 9, 2.6, 6, 0, band),
    56,
  );
}

function mapTex() {
  return tex(
    64,
    48,
    poly(
      [
        [2, 5],
        [12, 1],
        [24, 4],
        [38, 1],
        [52, 4],
        [62, 2],
        [61, 16],
        [63, 30],
        [60, 46],
        [46, 44],
        [32, 47],
        [18, 44],
        [4, 47],
        [1, 30],
        [3, 18],
      ],
      "#e7d3a0",
    ) +
      poly(
        [
          [8, 8],
          [24, 7],
          [32, 12],
          [28, 20],
          [16, 22],
          [9, 16],
        ],
        "#c9b27a",
      ) +
      poly(
        [
          [40, 26],
          [54, 24],
          [58, 34],
          [50, 42],
          [38, 40],
        ],
        "#c9b27a",
      ) +
      poly(
        [
          [14, 30],
          [17, 24],
          [20, 30],
        ],
        "#6f8a4a",
      ) +
      poly(
        [
          [19, 32],
          [23, 25],
          [27, 32],
        ],
        "#5a7a3a",
      ) +
      `<polyline points="12,12 20,16 28,13 34,24 42,30 50,32" fill="none" stroke="#c93a2c" stroke-width="1.4" stroke-dasharray="3 2"/>` +
      seg(50, 29, 56, 35, "#c93a2c", 1.8) +
      seg(56, 29, 50, 35, "#c93a2c", 1.8) +
      `<polyline points="36,3 34,12 38,22 33,34 36,46" fill="none" stroke="#5aa0d8" stroke-width="1.6"/>` +
      star(10, 38, 5, 1.6, 4, -Math.PI / 2, "#5c3a20"),
    256,
  );
}

function signTex() {
  return tex(
    96,
    44,
    rect(0, 4, 96, 40, "#6f4a28") +
      rect(3, 7, 90, 34, "#c99259") +
      rect(3, 7, 90, 2.4, "#e0b070") +
      rect(3, 38.6, 90, 2.4, "#a06f3f") +
      circ(9, 12, 2.4, "#3a2415") +
      circ(87, 12, 2.4, "#3a2415") +
      reg(30, 24, 11, 8, 0.39, "#dcaa3c") +
      reg(30, 24, 8.6, 8, 0.39, "#9c7626") +
      reg(30, 24, 7.4, 8, 0.39, "#dcaa3c") +
      rect(26.5, 20.5, 7, 7, "#6f4a28") +
      star(60, 22, 10, 4.4, 5, -Math.PI / 2, "#c93a2c") +
      star(60, 22, 5.6, 2.4, 5, -Math.PI / 2, "#f0cc6a") +
      poly(
        [
          [76, 33],
          [80, 14],
          [84, 33],
        ],
        "#2f8f8a",
      ) +
      poly(
        [
          [80, 14],
          [88, 33],
          [80, 33],
        ],
        "#1f6664",
      ) +
      rect(14, 34, 68, 2, "#6f4a28"),
    256,
  );
}

const crateLabelTex = () =>
  tex(
    24,
    16,
    rect(0, 0, 24, 16, "#c99259") +
      `<rect x="1.4" y="1.4" width="21.2" height="13.2" fill="none" stroke="#2b1d17" stroke-width="1.2"/>` +
      poly(
        [
          [6, 8],
          [11, 4.6],
          [17, 8],
          [11, 11.4],
        ],
        "#2b1d17",
      ) +
      poly(
        [
          [17, 8],
          [20, 5.6],
          [20, 10.4],
        ],
        "#2b1d17",
      ) +
      circ(8.4, 7.4, 0.9, "#c99259"),
    96,
  );

const trunkPlateTex = () =>
  tex(
    40,
    28,
    rect(0, 0, 40, 28, "#9c7626") +
      rect(1.6, 1.6, 36.8, 24.8, "#dcaa3c") +
      poly(
        [
          [20, 4],
          [31, 7],
          [31, 16],
          [20, 25],
          [9, 16],
          [9, 7],
        ],
        "#8f2620",
      ) +
      poly(
        [
          [20, 6.4],
          [28.4, 8.6],
          [28.4, 15.4],
          [20, 22.4],
          [11.6, 15.4],
          [11.6, 8.6],
        ],
        "#c93a2c",
      ) +
      star(20, 14, 5.6, 2.4, 5, -Math.PI / 2, "#f0cc6a") +
      circ(4, 4, 1.3, "#9c7626") +
      circ(36, 4, 1.3, "#9c7626") +
      circ(4, 24, 1.3, "#9c7626") +
      circ(36, 24, 1.3, "#9c7626"),
    160,
  );

const haspTex = () =>
  tex(
    20,
    30,
    rect(3, 0, 14, 20, "#9c7626") +
      poly(
        [
          [3, 20],
          [17, 20],
          [10, 29],
        ],
        "#9c7626",
      ) +
      rect(5, 2, 10, 16, "#dcaa3c") +
      circ(10, 11, 3.2, "#2b1d17") +
      poly(
        [
          [8.6, 12],
          [11.4, 12],
          [12, 17],
          [8, 17],
        ],
        "#2b1d17",
      ),
    100,
  );

function lanternPanelTex(bg: string, motif: string) {
  return tex(
    24,
    32,
    rect(0, 0, 24, 32, bg) +
      `<rect x="1.6" y="1.6" width="20.8" height="28.8" fill="none" stroke="${motif}" stroke-width="1.4"/>` +
      circ(12, 16, 6.4, motif) +
      circ(12, 16, 4, bg) +
      star(12, 16, 3, 1.2, 4, 0.78, motif) +
      poly(
        [
          [12, 3],
          [14, 6],
          [10, 6],
        ],
        motif,
      ) +
      poly(
        [
          [12, 29],
          [14, 26],
          [10, 26],
        ],
        motif,
      ),
    96,
  );
}

/** Travel stickers pasted on the trunk: a round postmark, a ticket, an oval label. */
function stickerTex(kind: number) {
  if (kind === 0) {
    let ticks = "";
    for (let k = 0; k < 12; k++)
      ticks += seg(
        16 + 11 * Math.cos(k * 0.5236),
        16 + 11 * Math.sin(k * 0.5236),
        16 + 13.6 * Math.cos(k * 0.5236),
        16 + 13.6 * Math.sin(k * 0.5236),
        "#8f2620",
        1.6,
      );
    return tex(
      32,
      32,
      circ(16, 16, 14.5, "#f3e9d0") +
        `<circle cx="16" cy="16" r="10.4" fill="none" stroke="#c93a2c" stroke-width="2"/>` +
        ticks +
        star(16, 16, 6.4, 2.6, 5, -Math.PI / 2, "#c93a2c") +
        rect(2, 15, 28, 2, "#8f2620"),
      128,
    );
  }
  if (kind === 1)
    return tex(
      40,
      24,
      poly(
        [
          [0, 0],
          [40, 0],
          [40, 9],
          [37, 12],
          [40, 15],
          [40, 24],
          [0, 24],
          [0, 15],
          [3, 12],
          [0, 9],
        ],
        "#4f8a52",
      ) +
        rect(4, 4, 32, 3, "#f3e9d0") +
        rect(4, 17, 32, 3, "#f3e9d0") +
        poly(
          [
            [14, 12],
            [20, 8],
            [26, 12],
            [20, 16],
          ],
          "#f4d466",
        ),
      160,
    );
  return tex(
    40,
    28,
    `<ellipse cx="20" cy="14" rx="19" ry="13" fill="#3a6ea8"/><ellipse cx="20" cy="14" rx="16" ry="10.4" fill="none" stroke="#f3e9d0" stroke-width="1.4"/>` +
      star(20, 14, 7, 3, 5, -Math.PI / 2, "#f4d466"),
    160,
  );
}

const birdTex = () =>
  tex(
    36,
    32,
    rect(3, 24, 30, 2.4, "#a06f3f") +
      poly(
        [
          [3, 12],
          [9, 8],
          [19, 5],
          [26, 9],
          [28, 18],
          [22, 24],
          [12, 25],
          [6, 20],
        ],
        "#f0c53a",
      ) +
      poly(
        [
          [6, 12],
          [3, 8],
          [10, 10],
        ],
        "#f0c53a",
      ) +
      poly(
        [
          [26, 14],
          [35, 12],
          [34, 17],
        ],
        "#e0902e",
      ) +
      poly(
        [
          [3, 14],
          [-0.5, 19],
          [8, 20],
        ],
        "#dc9a2c",
      ) +
      poly(
        [
          [12, 12],
          [21, 14],
          [19, 21],
          [10, 19],
        ],
        "#e0902e",
      ) +
      poly(
        [
          [17, 6],
          [24, 9],
          [21, 11],
        ],
        "#f6df7a",
      ) +
      circ(21.6, 11.4, 1.5, "#1c1512") +
      circ(22, 11, 0.5, "#ffffff") +
      seg(14, 24, 14, 27, "#c4956a", 1) +
      seg(19, 24, 19, 27, "#c4956a", 1),
    144,
  );

function awningTex() {
  let body = rect(0, 0, 64, 40, "#ece0c4");
  const cols = ["#ece0c4", "#c93a2c", "#ece0c4", "#2f8f8a"];
  for (let i = 0; i < 8; i++)
    body += poly(
      [
        [32, 0],
        [i * 8, 34],
        [(i + 1) * 8, 34],
      ],
      cols[i % 4],
    );
  for (let k = 0; k < 8; k++)
    body += poly(
      [
        [k * 8, 33],
        [k * 8 + 8, 33],
        [k * 8 + 4, 40],
      ],
      k % 2 ? "#dba23f" : "#a5482a",
    );
  return tex(64, 40, body + rect(0, 32.4, 64, 1.6, "#dba23f"), 256);
}

const herbTex = () =>
  tex(
    24,
    44,
    HANG(24) +
      rect(10.6, 10, 2.8, 8, "#a88652") +
      [
        [-7, 0],
        [-3.4, 3],
        [0, 5],
        [3.4, 3],
        [7, 0],
      ]
        .map(([dx, dy], i) =>
          poly(
            [
              [12, 18],
              [12 + dx * 1.6, 24 + dy],
              [12 + dx * 1.9, 42 - dy],
              [12 + dx * 0.9, 30],
            ],
            i % 2 ? "#5a7a3a" : "#7a4a9a",
          ),
        )
        .join("") +
      rect(9, 17, 6, 2.6, "#c93a2c"),
    96,
  );

const garlicTex = () => {
  let body = HANG(20) + rect(9.2, 10, 1.6, 40, "#c4956a");
  for (let k = 0; k < 4; k++) {
    const x = k % 2 ? 6 : 14;
    body +=
      poly(
        [
          [x, 12 + k * 9.4],
          [x + 3.4, 15 + k * 9.4],
          [x + 3, 20 + k * 9.4],
          [x, 22 + k * 9.4],
          [x - 3, 20 + k * 9.4],
          [x - 3.4, 15 + k * 9.4],
        ],
        "#f3e9d0",
      ) + seg(x, 12 + k * 9.4, x, 22 + k * 9.4, "#d8c9a8", 0.8);
  }
  return tex(20, 52, body, 104);
};

// ---------------------------------------------------------------------------------------------------------------
// Geometry helpers.

/** Unshared vertices so every triangle shades as one crisp facet. */
function facet<T extends THREE.BufferGeometry>(g: T): THREE.BufferGeometry {
  const n = g.index ? g.toNonIndexed() : g;
  n.computeVertexNormals();
  return n;
}

/** The same surface turned inside out: seen from within, its faces are the front. */
function inside(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const n = g.index ? g.toNonIndexed() : g.clone();
  for (const name of ["position", "uv"]) {
    const a = n.getAttribute(name) as THREE.BufferAttribute;
    const k = a.itemSize;
    for (let t = 0; t < a.count; t += 3)
      for (let c = 0; c < k; c++) {
        const v1 = a.getComponent(t + 1, c);
        a.setComponent(t + 1, c, a.getComponent(t + 2, c));
        a.setComponent(t + 2, c, v1);
      }
  }
  n.deleteAttribute("normal");
  n.computeVertexNormals();
  return n;
}

const DEGR = Math.PI / 180;
const sphere = (r: number, w = 8, h = 6) => facet(new THREE.SphereGeometry(r, w, h));
const v3 = (p: V3) => new THREE.Vector3(...p);
/** A four-sided pyramid roof whose faces each carry the whole drawing (apex at the top middle). */
function pyramid(hx: number, hz: number, h: number) {
  const corner: V3[] = [
    [-hx, 0, hz],
    [hx, 0, hz],
    [hx, 0, -hz],
    [-hx, 0, -hz],
  ];
  const pos: number[] = [];
  const uv: number[] = [];
  for (let k = 0; k < 4; k++) {
    pos.push(...corner[k], ...corner[(k + 1) % 4], 0, h, 0);
    uv.push(0, 0, 1, 0, 0.5, 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}
/** A half-cylinder lying along x with its arch up (a trunk lid). */
function lidGeo(r: number, len: number) {
  const g = new THREE.CylinderGeometry(r, r, len, 8, 1, false, -Math.PI / 2, Math.PI);
  g.rotateX(-Math.PI / 2);
  g.rotateY(Math.PI / 2);
  return facet(g);
}

export default function build() {
  const b = createBuilder({ name: "wanderingMerchant" });
  const R = rng(23);

  // ---- Textures -------------------------------------------------------------------------------------------------
  const T = {
    face: faceTex(),
    mouth: mouthTex(),
    beard: [
      locksTex(["#b9632b", "#cf7d35", "#9a4e20"], 1, "#e8b070"),
      locksTex(["#c8712f", "#a95a26", "#dc9046"], 2),
      locksTex(["#a95a26", "#b9632b", "#cf7d35"], 3, "#e8b070"),
    ],
    mustache: mustacheTex(),
    hair: locksTex(["#7a4a26", "#94592d", "#5c3a1e"], 4),
    featherTeal: featherTex("#2f8f8a", "#1f6664", "#dcaa3c"),
    featherRed: featherTex("#c93a2c", "#8f2620", "#f0cc6a"),
    featherGold: featherTex("#e0a83a", "#a5482a", "#2f8f8a"),
    tasselRed: tasselTex("#c93a2c", "#e0503e", "#8f2620"),
    tasselTeal: tasselTex("#2f8f8a", "#3fb0a8", "#1f6664"),
    tasselGold: tasselTex("#dcaa3c", "#f0cc6a", "#9c7626", "#c93a2c"),
    fringeCloak: fringeTex("#dcaa3c", "#c93a2c"),
    fringeTunic: fringeTex("#f3e9d0", "#dba23f"),
    fringeCarpetUp: fringeTex("#f3e9d0", "#c93a2c", true),
    capeBand: bandTex("#7a3220", "#dcaa3c", "#f3e9d0", "diamond"),
    tunicBand: bandTex("#b47d2a", "#f3e9d0", "#a5482a", "zig"),
    cuffBand: bandTex("#a5482a", "#dcaa3c", "#f3e9d0", "dots"),
    bootBand: bandTex("#3a2415", "#dcaa3c", "#c93a2c", "wave"),
    potBand: bandTex("#1f6664", "#f3e9d0", "#dcaa3c", "diamond"),
    patches: [
      patchTex("#3a6ea8", "#f3e9d0", "plaid", 5),
      patchTex("#c93a2c", "#f4d466", "star", 6),
      patchTex("#4f8a52", "#f3e9d0", "diamond", 7),
      patchTex("#e8709a", "#f4e6bd", "flower", 8),
      patchTex("#7a4a9a", "#dcaa3c", "stripes", 9),
      patchTex("#e0902e", "#7a3220", "plaid", 10),
    ],
    flaps: [
      flapTex("#8b5a31", "#dcaa3c", "sun"),
      flapTex("#5f6c3b", "#f3e9d0", "leaf"),
      flapTex("#7a3220", "#dcaa3c", "eye"),
      flapTex("#2f8f8a", "#f3e9d0", "diamond"),
    ],
    brooch: broochTex(),
    buckle: buckleTex(),
    lacing: lacingTex(),
    charms: ["star", "moon", "fish", "key", "horseshoe", "coin", "eye", "clover", "bell", "shell"].map(charmTex),
    dream: dreamcatcherTex(),
    ribbons: [
      ribbonTex("#c93a2c", "#f3e9d0"),
      ribbonTex("#2f8f8a", "#dcaa3c"),
      ribbonTex("#dcaa3c", "#7a3220"),
      ribbonTex("#e8709a", "#f3e9d0"),
    ],
    flags: [
      flagTex("#c93a2c", "#f3e9d0", 0),
      flagTex("#2f8f8a", "#f3e9d0", 1),
      flagTex("#dcaa3c", "#7a3220", 2),
      flagTex("#e8709a", "#f3e9d0", 3),
      flagTex("#3a6ea8", "#f4d466", 2),
      flagTex("#7a4a9a", "#f3e9d0", 0),
    ],
    carpetSide: [
      carpetSideTex("#c93a2c", "#f3e9d0", "#dcaa3c"),
      carpetSideTex("#2f8f8a", "#f3e9d0", "#c93a2c"),
      carpetSideTex("#7a4a9a", "#dcaa3c", "#f3e9d0"),
      carpetSideTex("#e0902e", "#7a3220", "#f3e9d0"),
    ],
    carpetEnd: [
      carpetEndTex("#c93a2c", "#f3e9d0", "#dcaa3c"),
      carpetEndTex("#2f8f8a", "#f3e9d0", "#c93a2c"),
      carpetEndTex("#7a4a9a", "#dcaa3c", "#f3e9d0"),
      carpetEndTex("#e0902e", "#7a3220", "#f3e9d0"),
    ],
    scrollEnd: carpetEndTex("#f3e9d0", "#d8c090", "#a88652"),
    labels: [
      bottleLabelTex("#f3e9d0", "#c93a2c"),
      bottleLabelTex("#f3e9d0", "#2f8f8a"),
      bottleLabelTex("#f3e9d0", "#7a4a9a"),
    ],
    map: mapTex(),
    sign: signTex(),
    crateLabel: crateLabelTex(),
    trunkPlate: trunkPlateTex(),
    hasp: haspTex(),
    stickers: [stickerTex(0), stickerTex(1), stickerTex(2)],
    lanternRed: lanternPanelTex("#c93a2c", "#f0cc6a"),
    lanternTeal: lanternPanelTex("#2f8f8a", "#f3e9d0"),
    bird: birdTex(),
    awning: awningTex(),
    herb: herbTex(),
    pennant: pennantTex(),
    garlic: garlicTex(),
  };

  // ---- Placement helpers ----------------------------------------------------------------------------------------
  const WHITE = "#ffffff";
  /** A drawing on a plane facing `normal` (upright along `up`), front face only. */
  const plane = (
    t: THREE.Texture,
    at: THREE.Vector3 | V3,
    normal: THREE.Vector3 | V3,
    w: number,
    h: number,
    bone: Joint,
    group: string,
    up: V3 = [0, 1, 0],
    tint = WHITE,
  ) => b.part(new THREE.PlaneGeometry(w, h), tint, { bone, at, dir: normal, axis: "z", up, texture: t, group });
  /** A card hung from `anchor`: the drawing's top edge at the anchor, hanging down. Double-sided. */
  const hang = (
    t: THREE.Texture | THREE.Texture[],
    anchor: V3,
    w: number,
    h: number,
    bone: Joint,
    group: string,
    flow: V3 = [0, 0, -1],
    extra: { cross?: boolean; vary?: number; tint?: string } = {},
  ) =>
    b.cards([frame([anchor[0], anchor[1] - h, anchor[2]], [0, 1, 0])], t, {
      size: [w, h],
      flow,
      sink: 0,
      bone,
      group,
      ...extra,
    });
  const cyl = (a: V3, c: V3, r: number, color: string, bone: Joint, group: string, sides = 6) =>
    b.rod(a, c, r, { color, bone, sides, group, smooth: false });
  const box = (
    color: string,
    at: V3,
    size: V3,
    bone: Joint,
    group: string,
    o: { dir?: V3 | THREE.Vector3; up?: V3; axis?: "x" | "y" | "z"; quat?: THREE.Quaternion; rotation?: V3 } = {},
  ) => b.part(new THREE.BoxGeometry(...size), color, { bone, at, group, ...o });
  const torus = (at: V3, dir: V3, r: number, tube: number, color: string, bone: Joint, group: string, seg = 8) =>
    b.part(facet(new THREE.TorusGeometry(r, tube, 4, seg)), color, { bone, at, dir, axis: "z", group });

  // ---- Skeleton -------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.9, 0], group: "body" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.94, 0],
      [0, 1.06, 0.005],
      [0, 1.18, 0.01],
      [0, 1.36, 0.01],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine", group: "body" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 1.36, 0.01],
    aim: [0, 1.44, 0.015],
    role: "neck",
    group: "head",
  });
  const head = b.joint("head", { parent: neck, at: [0, 1.44, 0.015], dir: [0, 1, 0], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.505, 0.0], aim: [0, 1.49, 0.1], role: "jaw", group: "head" });
  const pack = b.joint("pack", { parent: chest, at: [0, 1.2, -0.27], dir: [0, 1, 0], group: "pack" });

  const SIDES = [
    { s: 1, L: "L" },
    { s: -1, L: "R" },
  ] as const;

  const clav = SIDES.map(({ s, L }) =>
    b.joint(`clavicle${L}`, {
      parent: chest,
      at: [s * 0.05, 1.33, 0.02],
      aim: [s * 0.19, 1.34, 0.0],
      group: `arm${L}`,
    }),
  );
  // Left arm hangs in an A-pose; the right elbow bends forward so the hand can hold the staff.
  const armPts: Record<string, V3[]> = {
    L: [
      [0.19, 1.34, 0],
      [0.36, 1.09, 0.0],
      [0.5, 0.855, 0.05],
      [0.55, 0.775, 0.065],
    ],
    R: [
      [-0.19, 1.34, 0],
      [-0.36, 1.09, -0.01],
      [-0.44, 1.01, 0.235],
      [-0.46, 0.985, 0.31],
    ],
  };
  const arms = SIDES.map(({ L }, i) =>
    b.chain(`arm${L}`, armPts[L], {
      parent: clav[i],
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
      group: `arm${L}`,
    }),
  );
  const legs = SIDES.map(({ s, L }) =>
    b.chain(
      `leg${L}`,
      [
        [s * 0.1, 0.9, 0],
        [s * 0.105, 0.5, 0.03],
        [s * 0.105, 0.095, -0.01],
        [s * 0.105, 0.045, 0.1],
        [s * 0.105, 0.02, 0.2],
      ],
      {
        parent: hips,
        names: [`hip${L}`, `knee${L}`, `ankle${L}`, `toe${L}`],
        role: "leg",
        group: `leg${L}`,
        contact: [s * 0.105, 0, 0.1],
      },
    ),
  );

  // ---- Torso: patched mustard tunic, belt and pouches ------------------------------------------------------------
  const tunicY = (y: number) => (y - 0.6) / 0.81;
  const torso = b.loft(
    [
      { at: [0, 0.6, 0], w: 0.44, h: 0.31 },
      { at: [0, 0.76, 0], w: 0.42, h: 0.3 },
      { at: [0, 0.92, 0], w: 0.38, h: 0.27 },
      { at: [0, 1.05, 0.005], w: 0.38, h: 0.27 },
      { at: [0, 1.18, 0.01], w: 0.36, h: 0.24 },
      { at: [0, 1.3, 0.01], w: 0.4, h: 0.23 },
      { at: [0, 1.37, 0.01], w: 0.3, h: 0.19 },
      { at: [0, 1.41, 0.01], w: 0.13, h: 0.13 },
    ],
    {
      bone: [hips, spine],
      section: "circle",
      sides: 8,
      smooth: false,
      caps: "flat",
      bands: [
        [tunicY(0.66), TUNIC_DK],
        [1, TUNIC],
      ],
      group: "body",
    },
  );
  const torsoS = b.surface(torso);
  const onTorso = (p: V3) => torsoS.nearest(p);
  // Tunic hem: a knotted fringe ring and embroidered band panels.
  {
    const hem = b.ring(frame([0, 0.615, 0], [0, 1, 0]), { count: 14, radius: 0.215 });
    b.cards(
      hem.items.map((it) => frame([it.at.x * 1.02, 0.56, it.at.z * 0.74], [0, 1, 0])),
      T.fringeTunic,
      { size: [0.1, 0.055], flow: (f) => [f.at.x / 0.22, 0, f.at.z / 0.16], sink: 0, bone: hips, group: "body" },
    );
    for (const [x, z, nx, nz, w] of [
      [0, 0.155, 0, 1, 0.17],
      [0, -0.155, 0, -1, 0.17],
      [0.222, 0, 1, 0, 0.14],
      [-0.222, 0, -1, 0, 0.14],
    ] as [number, number, number, number, number][]) {
      const h = onTorso([x + nx, 0.7, z + nz]);
      plane(T.tunicBand, offset(h, h, 0.004), h.axis, w, w * 0.16, hips, "body");
    }
  }
  // Patches on the tunic.
  for (const [i, p, w, up] of [
    [1, [0.1, 0.82, 1], 0.075, [0.2, 1, 0]],
    [3, [-0.13, 0.75, 1], 0.07, [-0.25, 1, 0]],
    [4, [0.22, 0.74, 0.4], 0.065, [0, 1, 0.15]],
    [0, [-0.04, 1.02, 1], 0.06, [0.4, 1, 0]],
  ] as [number, V3, number, V3][]) {
    const h = onTorso(p);
    plane(T.patches[i], offset(h, h, 0.004), h.axis, w, w, hips, "body", up);
  }
  // Belt with buckle.
  {
    const beltPts: V3[] = Array.from({ length: 12 }, (_, k): V3 => {
      const a = (k / 12) * Math.PI * 2;
      return [Math.sin(a) * 0.205, 0.965, Math.cos(a) * 0.152];
    });
    b.sweep(catmull(beltPts, { closed: true }), 0.017, {
      sides: 6,
      smooth: false,
      color: LEATHER_DK,
      bone: hips,
      group: "body",
    });
    const front = onTorso([0, 0.965, 1]);
    plane(T.buckle, offset(front, front, 0.024), front.axis, 0.05, 0.034, hips, "body");
    // Belt tails and hanging keys.
    hang(T.charms[3], [0.045, 0.955, 0.168], 0.038, 0.057, hips, "body", [0, 0, 1]);
    hang(T.tasselRed, [-0.05, 0.955, 0.168], 0.028, 0.085, hips, "body", [0, 0, 1]);
  }
  // Pouches.
  const pouch = (at: V3, size: V3, nrm: V3, flap: THREE.Texture, color: string) => {
    const n = v3(nrm).normalize();
    const p = v3(at);
    box(color, at, size, hips, "body", { dir: n, axis: "z", up: [0, 1, 0] });
    plane(
      flap,
      p.clone().addScaledVector(n, size[2] / 2 + 0.003),
      n,
      size[0] * 0.98,
      size[0] * 0.98,
      hips,
      "body",
      [0, 1, 0],
    );
    // Two little loops to the belt.
    for (const d of [-1, 1]) {
      const side = new THREE.Vector3(0, 1, 0).cross(n).normalize();
      const top = p
        .clone()
        .addScaledVector(side, d * size[0] * 0.3)
        .add(new THREE.Vector3(0, size[1] / 2, 0));
      cyl(top.toArray() as V3, [top.x, 0.968, top.z], 0.005, LEATHER_DK, hips, "body", 4);
    }
  };
  pouch([0.12, 0.91, 0.158], [0.1, 0.105, 0.05], [0.3, 0, 1], T.flaps[0], LEATHER);
  pouch([-0.125, 0.905, 0.154], [0.12, 0.115, 0.055], [-0.3, 0, 1], T.flaps[2], LEATHER_LT);
  pouch([0.222, 0.905, 0.02], [0.065, 0.11, 0.09], [1, 0, 0.1], T.flaps[1], LEATHER);
  // A water gourd on the right hip with its cord and a tied bell tassel.
  b.part(sphere(0.07, 8, 6), "#b98c4a", {
    bone: hips,
    at: [-0.235, 0.83, 0.03],
    scale: [0.85, 1.1, 0.85],
    group: "body",
  });
  b.part(sphere(0.042, 6, 5), "#b98c4a", { bone: hips, at: [-0.235, 0.925, 0.03], group: "body" });
  b.part(new THREE.CylinderGeometry(0.014, 0.018, 0.03, 6), CORK, {
    bone: hips,
    at: [-0.235, 0.96, 0.03],
    group: "body",
  });
  b.sweep(
    polyline([
      [-0.235, 0.975, 0.03],
      [-0.215, 0.99, 0.03],
      [-0.2, 0.968, 0.06],
    ]),
    0.004,
    { sides: 4, color: ROPE_DK, bone: hips, group: "body" },
  );
  hang(T.tasselTeal, [-0.255, 0.79, 0.03], 0.03, 0.09, hips, "body", [1, 0, 0]);

  // ---- Cloak: a shoulder mantle with an embroidered hem, pinned with a brooch --------------------------------------
  const capeCentre = [0, -0.03] as const;
  const cape = b.loft(
    [
      { at: [0, 1.03, capeCentre[1]], w: 0.78, h: 0.37 },
      { at: [0, 1.15, capeCentre[1]], w: 0.7, h: 0.35 },
      { at: [0, 1.28, capeCentre[1]], w: 0.6, h: 0.32 },
      { at: [0, 1.38, capeCentre[1]], w: 0.4, h: 0.27 },
      { at: [0, 1.46, capeCentre[1]], w: 0.29, h: 0.24 },
    ],
    { bone: chest, section: "circle", sides: 8, smooth: false, caps: "flat", color: CLOAK, group: "cloak" },
  );
  const capeS = b.surface(cape);
  {
    const dirs = [0, 45, 90, 135, 180, 225, 270, 315];
    const widths = [0.29, 0.2, 0.135, 0.2, 0.29, 0.2, 0.135, 0.2];
    dirs.forEach((az, i) => {
      const d: V3 = [Math.sin(az * DEGR), 0, Math.cos(az * DEGR)];
      const h = capeS.nearest([d[0] * 1.2, 1.075, capeCentre[1] + d[2] * 1.2]);
      plane(T.capeBand, offset(h, h, 0.004), h.axis, widths[i], widths[i] * 0.156, chest, "cloak");
    });
    // Hem fringe.
    const fr: Frame[] = [];
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      fr.push(frame([Math.sin(a) * 0.37, 1.03, capeCentre[1] + Math.cos(a) * 0.17], [0, 1, 0]));
    }
    b.cards(
      fr.map((f) => frame([f.at.x, f.at.y - 0.07, f.at.z], [0, 1, 0])),
      T.fringeCloak,
      {
        size: [0.12, 0.07],
        flow: (f) => [f.at.x / 0.37, 0, (f.at.z - capeCentre[1]) / 0.17],
        sink: 0,
        bone: chest,
        group: "cloak",
      },
    );
    // Front lacing below the beard and the brooch on the left shoulder.
    const lace = capeS.nearest([0, 1.12, 1]);
    plane(T.lacing, offset(lace, lace, 0.004), lace.axis, 0.05, 0.24, chest, "cloak");
    const bro = capeS.nearest([0.11, 1.29, 1]);
    plane(T.brooch, offset(bro, bro, 0.005), bro.axis, 0.05, 0.05, chest, "cloak");
    hang(T.tasselGold, [0.11, 1.265, 0.15], 0.032, 0.095, chest, "cloak", [0, 0, 1]);
    // Tunic placket below the belt line, a patch on the right shoulder.
    const placket = onTorso([0, 0.79, 1]);
    plane(T.lacing, offset(placket, placket, 0.004), placket.axis, 0.04, 0.19, hips, "body");
    const sh = capeS.nearest([-0.2, 1.3, 0.7]);
    plane(T.patches[1], offset(sh, sh, 0.004), sh.axis, 0.07, 0.07, chest, "cloak", [-0.3, 1, 0]);
    // Patches on the back of the cape, and a fringe collar.
    for (const [i, p, w] of [
      [2, [0.13, 1.16, -1], 0.09],
      [5, [-0.16, 1.1, -1], 0.075],
    ] as [number, V3, number][]) {
      const h = capeS.nearest(p);
      plane(T.patches[i], offset(h, h, 0.004), h.axis, w, w, chest, "cloak");
    }
  }

  // ---- Head ------------------------------------------------------------------------------------------------------
  const HC: V3 = [0, 1.56, 0.015];
  const HS: V3 = [1, 1.1, 1.02];
  const RH = 0.114;
  b.part(sphere(RH, 12, 8), SKIN, { bone: head, at: HC, scale: HS, group: "head" });
  // The drawn face: a partial sphere shell one facet grid wide, wrapping the front of the skull.
  b.part(facet(new THREE.SphereGeometry(RH, 4, 4, Math.PI / 6, (2 * Math.PI) / 3, Math.PI / 4, Math.PI / 2)), WHITE, {
    bone: head,
    at: HC,
    scale: [HS[0] * 1.04, HS[1] * 1.04, HS[2] * 1.04],
    texture: T.face,
    group: "head",
  });
  // Big nose: a four-sided bridge tapering to a bulb, with nostril wings.
  const noseTip: V3 = [0, 1.512, 0.19];
  b.part(facet(new THREE.ConeGeometry(0.028, 0.105, 4)), SKIN, {
    bone: head,
    at: [0, 1.545, 0.142],
    aim: noseTip,
    group: "head",
  });
  b.part(sphere(0.032, 7, 5), SKIN_RED, { bone: head, at: [0, 1.508, 0.184], scale: [1, 0.92, 1.1], group: "head" });
  for (const s of [1, -1])
    b.part(sphere(0.017, 5, 4), SKIN_RED, { bone: head, at: [s * 0.024, 1.5, 0.166], group: "head" });
  // Ears.
  for (const s of [1, -1])
    b.part(sphere(0.026, 5, 4), SKIN, {
      bone: head,
      at: [s * 0.108, 1.552, 0.0],
      scale: [0.5, 1.2, 0.9],
      group: "head",
    });
  // Moustache and a fringe of hair under the hood rim.
  b.part(new THREE.PlaneGeometry(0.135, 0.045), WHITE, {
    bone: head,
    at: [0, 1.492, 0.142],
    dir: [0, -0.28, 1],
    axis: "z",
    up: [0, 1, 0],
    texture: T.mustache,
    group: "head",
  });
  {
    const bangs: Frame[] = [];
    for (let k = 0; k < 9; k++) {
      const a = (-40 + k * 10) * DEGR;
      bangs.push(frame([Math.sin(a) * 0.098, 1.632, 0.015 + Math.cos(a) * 0.098], [Math.sin(a), 0.3, Math.cos(a)]));
    }
    b.cards(bangs, T.hair, {
      size: [0.04, 0.05],
      lean: 70,
      flow: [0, -1, 0],
      vary: 0.25,
      spin: 15,
      rng: rng(31),
      bone: head,
      group: "head",
    });
  }
  // Lower jaw: chin, ginger beard slab, its locks and the laughing mouth.
  b.part(sphere(0.058, 7, 5), SKIN, { bone: jaw, at: [0, 1.472, 0.072], scale: [1.2, 0.9, 1], group: "head" });
  const beardOutline: [number, number][] = [
    [-0.104, 0.03],
    [-0.058, 0.006],
    [-0.032, -0.014],
    [0.032, -0.014],
    [0.058, 0.006],
    [0.104, 0.03],
    [0.112, -0.03],
    [0.098, -0.1],
    [0.075, -0.17],
    [0.048, -0.24],
    [0.018, -0.3],
    [0, -0.34],
    [-0.018, -0.3],
    [-0.048, -0.24],
    [-0.075, -0.17],
    [-0.098, -0.1],
    [-0.112, -0.03],
  ];
  const beard = b.extrude(beardOutline, {
    at: [0, 1.5, 0.086],
    x: [1, 0, 0],
    y: [0, 1, -0.22],
    thickness: 0.1,
    bevel: 0.022,
    detail: 0.5,
    color: BEARD,
    bone: jaw,
    group: "head",
  });
  plane(T.mouth, [0, 1.474, 0.144], [0, -0.2, 1], 0.062, 0.034, jaw, "head");
  {
    // Locks over the beard's front, fanning down.
    const rows: [number, number, number][] = [];
    for (const [y, xs] of [
      [-0.04, [-0.085, -0.055, 0.055, 0.085]],
      [-0.09, [-0.09, -0.06, -0.03, 0.03, 0.06, 0.09]],
      [-0.15, [-0.07, -0.04, -0.013, 0.013, 0.04, 0.07]],
      [-0.21, [-0.05, -0.025, 0, 0.025, 0.05]],
      [-0.27, [-0.025, 0, 0.025]],
    ] as [number, number[]][])
      for (const x of xs) rows.push([x, y, 0]);
    const fr = rows.map(([x, y]) => {
      const q = beard.local([x, y, 0.05 + 0.0]);
      return frame(q, [0, 0.35, 1]);
    });
    b.cards(fr, T.beard, {
      size: [0.048, 0.1],
      lean: 60,
      flow: [0, -1, 0],
      vary: 0.25,
      spin: 12,
      rng: rng(32),
      bone: jaw,
      sink: 0.25,
      group: "head",
    });
    // Locks over the face edge of the beard sides.
    const side: Frame[] = [];
    for (const s of [1, -1])
      for (const y of [-0.01, -0.06, -0.11])
        side.push(frame(beard.local([s * (0.108 - Math.abs(y) * 0.1), y, 0.0]), [s, 0, 0.3]));
    b.cards(side, T.beard, {
      size: [0.04, 0.085],
      lean: 65,
      flow: [0, -1, 0],
      vary: 0.2,
      rng: rng(33),
      bone: jaw,
      sink: 0.25,
      group: "head",
    });
  }
  // A bead ring tied into the beard.
  torus([0, 1.4, 0.13], [0, -1, 0.22], 0.05, 0.007, BRASS, jaw, "head", 8);

  // ---- Hood ------------------------------------------------------------------------------------------------------
  {
    const HC2: V3 = [0, 1.575, 0.0];
    const RHO = 0.148;
    const sc: V3 = [1.02, 1.08, 1.08];
    const cap = new THREE.SphereGeometry(RHO, 12, 8, 0, Math.PI * 2, 0, (67.5 * Math.PI) / 180);
    const sideG = new THREE.SphereGeometry(
      RHO,
      12,
      8,
      (150 * Math.PI) / 180,
      (240 * Math.PI) / 180,
      (67.5 * Math.PI) / 180,
      (67.5 * Math.PI) / 180,
    );
    const capPart = b.part(facet(cap), CLOAK, { bone: head, at: HC2, scale: sc, group: "hood" });
    b.part(facet(sideG), CLOAK, { bone: head, at: HC2, scale: sc, group: "hood" });
    const k = 0.955;
    const lin: V3 = [sc[0] * k, sc[1] * k, sc[2] * k];
    b.part(inside(new THREE.SphereGeometry(RHO, 12, 8, 0, Math.PI * 2, 0, (67.5 * Math.PI) / 180)), LINING, {
      bone: head,
      at: HC2,
      scale: lin,
      group: "hood",
    });
    b.part(
      inside(
        new THREE.SphereGeometry(
          RHO,
          12,
          8,
          (150 * Math.PI) / 180,
          (240 * Math.PI) / 180,
          (67.5 * Math.PI) / 180,
          (67.5 * Math.PI) / 180,
        ),
      ),
      LINING,
      { bone: head, at: HC2, scale: lin, group: "hood" },
    );
    // Trim tube along the opening: up one side, over the brow, down the other.
    const P = (phi: number, theta: number, r = 1.03): V3 => [
      HC2[0] - RHO * r * sc[0] * Math.cos(phi * DEGR) * Math.sin(theta * DEGR),
      HC2[1] + RHO * r * sc[1] * Math.cos(theta * DEGR),
      HC2[2] + RHO * r * sc[2] * Math.sin(phi * DEGR) * Math.sin(theta * DEGR),
    ];
    const rim: V3[] = [
      P(150, 135),
      P(150, 112),
      P(150, 90),
      P(150, 67.5),
      P(120, 67.5),
      P(90, 67.5),
      P(60, 67.5),
      P(30, 67.5),
      P(30, 90),
      P(30, 112),
      P(30, 135),
    ];
    b.sweep(catmull(rim), 0.0065, { sides: 5, smooth: false, color: BRASS, bone: head, group: "hood", caps: "flat" });
    // Peak: a drooping point behind, with a tassel.
    b.sweep(bezier([0, 1.7, -0.06], [0, 1.74, -0.17], [0, 1.6, -0.25]), [0.065, 0.006], {
      section: { ngon: 6 },
      color: CLOAK,
      bone: head,
      group: "hood",
      caps: { start: "none", end: "point" },
    });
    hang(T.tasselRed, [0, 1.6, -0.25], 0.035, 0.11, head, "hood", [1, 0, 0]);
    // Feather pinned at the side, and a band of embroidery across the brow.
    b.cards([frame([-0.115, 1.66, 0.045], [-0.5, 1, -0.1])], T.featherTeal, {
      size: [0.06, 0.24],
      lean: 0,
      flow: [0, 0, -1],
      bend: 24,
      sink: 0.05,
      bone: head,
      group: "hood",
    });
    b.cards([frame([-0.118, 1.655, 0.035], [-0.7, 0.9, 0.2])], T.featherRed, {
      size: [0.045, 0.17],
      lean: 0,
      flow: [0, 0, -1],
      bend: 20,
      sink: 0.05,
      bone: head,
      group: "hood",
    });
    b.part(sphere(0.022, 6, 4), BRASS, { bone: head, at: [-0.118, 1.65, 0.045], group: "hood" });
    // Patches and an embroidered band on the hood's sides.
    const hoodS = b.surface(capPart);
    for (const [s, i] of [
      [1, 3],
      [-1, 4],
    ] as [number, number][]) {
      const hh = hoodS.nearest([s * 1, 1.635, 0.02]);
      plane(T.patches[i], offset(hh, hh, 0.004), hh.axis, 0.06, 0.06, head, "hood", [0, 1, 0]);
      const hb = hoodS.nearest([s * 1, 1.6, -0.09]);
      plane(T.capeBand, offset(hb, hb, 0.004), hb.axis, 0.075, 0.075 * 0.156, head, "hood", [0, 1, 0]);
    }
    // Cowl collar under the hood.
    b.lathe(
      [
        [0, 0.012],
        [0.14, 0.005],
        [0.17, -0.05],
        [0.16, -0.056],
        [0.13, -0.02],
        [0, -0.005],
      ],
      { at: [0, 1.455, -0.01], segments: 8, color: CLOAK_DK, bone: chest, group: "hood", spin: 22.5 },
    );
  }

  // ---- Arms, hands, staff and lantern -----------------------------------------------------------------------------
  const sleeveS: Surface[] = [];
  arms.forEach((arm, i) => {
    const { s, L } = SIDES[i];
    const [, elbow, wrist] = arm.joints;
    const sleeve = b.sweep(arm, [0.058, 0.043], {
      to: arm.ts[2],
      sides: 6,
      smooth: false,
      color: TUNIC,
      caps: { start: "round", end: "flat" },
      group: `arm${L}`,
    });
    sleeveS.push(b.surface(sleeve));
    // Cuff: a darker rolled band with embroidery on the outer side.
    const dir = wrist.at.clone().sub(elbow.at).normalize();
    const cuffA = wrist.at.clone().addScaledVector(dir, -0.055);
    b.rod(cuffA, wrist.at.clone().addScaledVector(dir, 0.006), 0.05, {
      bone: elbow,
      color: TUNIC_DK,
      sides: 6,
      smooth: false,
      group: `arm${L}`,
    });
    const ch = sleeveS[i].nearest(
      cuffA
        .clone()
        .addScaledVector(dir, 0.03)
        .add(new THREE.Vector3(s * 0.2, 0.06, -0.02)),
    );
    plane(T.cuffBand, offset(ch, ch, 0.004), ch.axis, 0.075, 0.075 * 0.156, elbow, `arm${L}`, [dir.x, dir.y, dir.z]);
    // Elbow patch.
    const eh = sleeveS[i].nearest(elbow.at.clone().add(new THREE.Vector3(s * 0.3, 0.1, -0.3)));
    plane(
      T.patches[i === 0 ? 3 : 4],
      offset(eh, eh, 0.004),
      eh.axis,
      0.06,
      0.06,
      i === 0 ? arm.joints[0] : elbow,
      `arm${L}`,
      [0, 1, 0],
    );
  });

  /** A five-finger hand: palm, four fingers and a thumb as skinned chains, curled by `curl` about the grip axis. */
  const hand = (idx: number, D: THREE.Vector3, P: THREE.Vector3, curl: number[], thumbCurl: number[]) => {
    const { s, L } = SIDES[idx];
    const wrist = arms[idx].joints[2];
    const W = wrist.at.clone();
    let N = new THREE.Vector3().crossVectors(D, P).normalize();
    if (N.x * s > 0) N = N.negate(); // the palm faces the body
    const basis = new THREE.Matrix4().makeBasis(P, D, new THREE.Vector3().crossVectors(P, D).normalize());
    const quat = new THREE.Quaternion().setFromRotationMatrix(basis);
    b.part(new THREE.BoxGeometry(0.086, 0.09, 0.034), SKIN, {
      bone: wrist,
      at: W.clone().addScaledVector(D, 0.042),
      quat,
      group: `arm${L}`,
    });
    b.part(sphere(0.02, 5, 4), SKIN, { bone: wrist, at: W.clone().addScaledVector(D, 0.005), group: `arm${L}` });
    const rot = (a: number) => D.clone().multiplyScalar(Math.cos(a)).addScaledVector(N, Math.sin(a));
    const base = W.clone().addScaledVector(D, 0.082).addScaledVector(N, 0.004);
    const names = ["index", "middle", "ring", "pinky"];
    const off = [-0.03, -0.01, 0.01, 0.029];
    const len = [1, 1.1, 1, 0.82];
    names.forEach((n, k) => {
      const seg3 = [0.036 * len[k], 0.024 * len[k], 0.02 * len[k]];
      const pts = [base.clone().addScaledVector(P, off[k])];
      let a = 0;
      seg3.forEach((l, j) => {
        a += curl[j] * DEGR * (1 + 0.06 * k);
        pts.push(pts[j].clone().addScaledVector(rot(a), l));
      });
      const chain = b.chain(`${n}${L}`, polyline(pts), { parent: wrist, role: "digit", group: `arm${L}` });
      b.sweep(chain, [0.0105, 0.0072], {
        sides: 4,
        smooth: false,
        detail: 0.5,
        color: SKIN,
        caps: { start: "round", end: "round" },
        group: `arm${L}`,
      });
    });
    // Thumb: from the palm's index side, swung across the fingers.
    {
      const start = W.clone().addScaledVector(D, 0.03).addScaledVector(P, -0.04).addScaledVector(N, 0.006);
      let dir = D.clone().multiplyScalar(0.8).addScaledVector(P, -0.5).addScaledVector(N, 0.3).normalize();
      const pts = [start];
      [0.034, 0.028, 0.022].forEach((l, j) => {
        const a = thumbCurl[j] * DEGR;
        dir = dir
          .clone()
          .multiplyScalar(Math.cos(a))
          .addScaledVector(N, Math.sin(a))
          .addScaledVector(P, 0.15 * (j + 1) * 0.3)
          .normalize();
        pts.push(pts[j].clone().addScaledVector(dir, l));
      });
      const chain = b.chain(`thumb${L}`, polyline(pts), { parent: wrist, role: "digit", group: `arm${L}` });
      b.sweep(chain, [0.0125, 0.008], {
        sides: 4,
        smooth: false,
        detail: 0.5,
        color: SKIN,
        caps: { start: "round", end: "round" },
        group: `arm${L}`,
      });
    }
    return { W, D, P, N, grip: W.clone().addScaledVector(D, 0.072).addScaledVector(N, 0.03), wrist };
  };

  // Right hand: thumb up, fist round the staff.
  const dR = wristDir(arms[1]);
  const pR = new THREE.Vector3(0, -1, 0).addScaledVector(dR, dR.y).normalize();
  const hR = hand(1, dR, pR, [72, 76, 62], [8, 24, 26]);
  // Left hand: hanging, thumb forward, a loose grip on the lantern's handle.
  const dL = wristDir(arms[0]);
  const pL = new THREE.Vector3(0, 0, -1).addScaledVector(dL, dL.z).normalize();
  const hL = hand(0, dL, pL, [60, 66, 52], [8, 22, 24]);

  function wristDir(arm: (typeof arms)[number]) {
    return arm.joints[2].at.clone().sub(arm.joints[1].at).normalize();
  }

  // Walking staff: knotted wood from a steel-shod tip to a crook, riding the right hand.
  {
    const u = pR.clone().negate();
    const S = hR.grip;
    const bottom = S.clone().addScaledVector(u, -S.y / u.y);
    const topT = (1.98 - S.y) / u.y;
    const top = S.clone().addScaledVector(u, topT);
    const wr = hR.wrist;
    b.rod(bottom.clone().addScaledVector(u, 0.06), top, 0.016, {
      bone: wr,
      color: WOOD,
      sides: 6,
      smooth: false,
      group: "staff",
    });
    b.spike(bottom.clone().addScaledVector(u, 0.06), bottom, null, 0.017, {
      bone: wr,
      color: IRON,
      sides: 6,
      smooth: false,
      group: "staff",
    });
    // Grip wrap and knots.
    b.rod(S.clone().addScaledVector(u, -0.06), S.clone().addScaledVector(u, 0.06), 0.019, {
      bone: wr,
      color: LEATHER_DK,
      sides: 6,
      smooth: false,
      group: "staff",
    });
    for (const t of [0.35, 0.55, 0.8])
      torus(
        bottom
          .clone()
          .addScaledVector(u, topT * 0.98 * t * 0.9 + 0.2)
          .toArray() as V3,
        u.toArray() as V3,
        0.018,
        0.006,
        WOOD_DK,
        wr,
        "staff",
        6,
      );
    // Crook: a curl at the top, a hanging bell, ribbons and charms.
    const side = new THREE.Vector3(-1, 0, 0);
    const cr = bezier(
      top.clone().addScaledVector(u, -0.04),
      top.clone().addScaledVector(u, 0.12).addScaledVector(side, 0.02),
      top
        .clone()
        .addScaledVector(u, 0.09)
        .addScaledVector(side, -0.14)
        .addScaledVector(new THREE.Vector3(0, 0, 1), 0.02),
      top.clone().addScaledVector(u, -0.04).addScaledVector(side, -0.14),
    );
    b.sweep(cr, [0.019, 0.012], {
      sides: 6,
      smooth: false,
      color: WOOD,
      bone: wr,
      group: "staff",
      caps: { start: "none", end: "round" },
    });
    const hook = top.clone().addScaledVector(u, -0.04).addScaledVector(side, -0.14);
    b.part(facet(new THREE.CylinderGeometry(0.005, 0.03, 0.05, 8)), BRASS, {
      bone: wr,
      at: [hook.x, hook.y - 0.06, hook.z],
      group: "staff",
    });
    b.part(sphere(0.01, 5, 4), BRASS_DK, { bone: wr, at: [hook.x, hook.y - 0.09, hook.z], group: "staff" });
    cyl([hook.x, hook.y, hook.z], [hook.x, hook.y - 0.04, hook.z], 0.003, ROPE_DK, wr, "staff", 4);
    const tp: V3 = [top.x, top.y - 0.03, top.z];
    hang(T.ribbons[0], [tp[0] - 0.02, tp[1], tp[2]], 0.05, 0.3, wr, "staff", [0, 0, -1]);
    hang(T.ribbons[1], [tp[0] + 0.02, tp[1] + 0.01, tp[2] + 0.01], 0.05, 0.24, wr, "staff", [0, 0, -1]);
    hang(T.ribbons[2], [tp[0], tp[1] - 0.02, tp[2]], 0.045, 0.18, wr, "staff", [1, 0, 0]);
    hang(T.charms[5], [tp[0] + 0.02, tp[1] - 0.05, tp[2] + 0.02], 0.045, 0.068, wr, "staff", [0, 0, 1]);
    b.cards([frame([tp[0], tp[1] + 0.09, tp[2]], [0.2, 1, 0])], T.featherGold, {
      size: [0.05, 0.2],
      flow: [0, 0, -1],
      bend: 26,
      sink: 0,
      bone: wr,
      group: "staff",
    });
  }

  // Hand lantern: a crossbar through the fist, a cord, and a red paper lantern.
  const lantern = (top: V3, r: number, h: number, panel: THREE.Texture, color: string, bone: Joint, group: string) => {
    const [x, y, z] = top;
    b.part(new THREE.CylinderGeometry(r * 0.55, r * 0.45, 0.012, 6), BRASS_DK, { bone, at: [x, y - 0.006, z], group });
    b.part(facet(new THREE.CylinderGeometry(r * 0.75, r * 0.75, h, 6, 1, false)), color, {
      bone,
      at: [x, y - 0.012 - h / 2, z],
      scale: [1.0, 1, 1],
      group,
    });
    b.part(new THREE.CylinderGeometry(r * 0.5, r * 0.5, 0.012, 6), BRASS_DK, {
      bone,
      at: [x, y - 0.018 - h, z],
      group,
    });
    b.part(new THREE.CylinderGeometry(r * 0.12, r * 0.12, h * 0.6, 4), "#f5d47a", {
      bone,
      at: [x, y - 0.012 - h / 2, z],
      group,
    });
    for (let k = 0; k < 6; k++) {
      const a = (30 + k * 60) * DEGR;
      const rr = r * 0.75 * Math.cos(30 * DEGR) + 0.002;
      plane(
        panel,
        [x + Math.sin(a) * rr, y - 0.012 - h / 2, z + Math.cos(a) * rr],
        [Math.sin(a), 0, Math.cos(a)],
        r * 0.75 * 0.9,
        h * 0.9,
        bone,
        group,
      );
    }
    hang(T.tasselGold, [x, y - 0.018 - h, z], r * 0.35, h * 0.55, bone, group, [0, 0, -1], { cross: true });
  };
  {
    const G = hL.grip;
    const wl = hL.wrist;
    b.rod(G.clone().addScaledVector(hL.P, -0.065), G.clone().addScaledVector(hL.P, 0.065), 0.008, {
      bone: wl,
      color: WOOD_DK,
      sides: 5,
      group: "lantern",
    });
    const lt: V3 = [G.x, G.y - 0.2, G.z];
    b.sweep(polyline([[G.x, G.y - 0.005, G.z], [G.x, G.y - 0.1, G.z], lt]), 0.0035, {
      sides: 4,
      color: ROPE_DK,
      bone: wl,
      group: "lantern",
    });
    lantern(lt, 0.055, 0.15, T.lanternRed, RED, wl, "lantern");
  }

  // ---- Legs: olive trousers, knee patches, cuffed boots -----------------------------------------------------------
  legs.forEach((leg, i) => {
    const { s, L } = SIDES[i];
    const [, knee, ankle, toe] = leg.joints;
    const trouser = b.sweep(leg, [0.075, 0.048], {
      to: leg.ts[2],
      sides: 6,
      smooth: false,
      color: TROUSER,
      caps: { start: "round", end: "flat" },
      group: `leg${L}`,
    });
    const ls = b.surface(trouser);
    const kh = ls.nearest([s * 0.105, 0.5, 1]);
    plane(T.patches[i === 0 ? 4 : 5], offset(kh, kh, 0.004), kh.axis, 0.07, 0.07, knee, `leg${L}`);
    // Boot shaft with folded cuff, sole, toe cap.
    const A = ankle.at;
    b.rod([A.x, A.y + 0.16, A.z - 0.002], [A.x, A.y - 0.05, A.z - 0.005], 0.06, {
      bone: ankle,
      color: BOOT,
      sides: 6,
      smooth: false,
      group: `leg${L}`,
    });
    b.rod([A.x, A.y + 0.19, A.z - 0.002], [A.x, A.y + 0.14, A.z - 0.002], 0.068, {
      bone: ankle,
      color: BOOT_DK,
      sides: 6,
      smooth: false,
      group: `leg${L}`,
    });
    const bh = b.surface(ankle).nearest([A.x, A.y + 0.165, 1]);
    plane(T.bootBand, offset(bh, bh, 0.004), bh.axis, 0.085, 0.085 * 0.156, ankle, `leg${L}`);
    const bk = b.surface(ankle).nearest([A.x, A.y + 0.09, 1]);
    plane(T.buckle, offset(bk, bk, 0.004), bk.axis, 0.04, 0.027, ankle, `leg${L}`);
    box(BOOT, [s * 0.105, 0.05, 0.075], [0.105, 0.09, 0.2], toe, `leg${L}`);
    b.part(sphere(0.055, 7, 5), BOOT, {
      bone: toe,
      at: [s * 0.105, 0.045, 0.165],
      scale: [0.98, 0.75, 1.05],
      group: `leg${L}`,
    });
    b.frustumBox([s * 0.105, 0.012, -0.04], [s * 0.105, 0.012, 0.212], [0.112, 0.024], [0.098, 0.024], {
      bone: toe,
      color: SOLE,
      group: `leg${L}`,
    });
    box(SOLE, [s * 0.105, 0.028, -0.04], [0.11, 0.05, 0.05], ankle, `leg${L}`);
    box(BOOT_DK, [s * 0.105, 0.08, 0.13], [0.1, 0.03, 0.05], toe, `leg${L}`);
    for (let k = 0; k < 3; k++)
      cyl(
        [s * 0.05, 0.085 + k * 0.01, 0.05 + k * 0.03],
        [s * 0.16, 0.085 + k * 0.01, 0.05 + k * 0.03],
        0.004,
        ROPE,
        toe,
        `leg${L}`,
        4,
      );
  });

  // ---- Pack frame ------------------------------------------------------------------------------------------------
  const G = "pack";
  const fz = (y: number) => -0.27 - 0.04 * (y - 1.2);
  const TOP = 2.26;
  for (const s of [1, -1]) {
    cyl([s * 0.16, 0.78, fz(0.78)], [s * 0.16, TOP + 0.04, fz(TOP)], 0.021, WOOD, pack, G);
    // Diagonal strut from the pole up to the shelf's back edge.
    cyl([s * 0.16, 1.2, fz(1.2)], [s * 0.26, 0.86, -0.86], 0.014, WOOD_DK, pack, G, 5);
  }
  for (const y of [0.95, 1.5, 1.95, TOP]) {
    cyl([0.24, y, fz(y)], [-0.24, y, fz(y)], 0.016, WOOD_DK, pack, G);
    for (const s of [1, -1]) torus([s * 0.16, y, fz(y)], [0, 1, 0.04], 0.026, 0.006, ROPE, pack, G, 6);
  }
  // Shelf with a front lip and rails.
  b.frustumBox([0, 0.85, -0.26], [0, 0.85, -0.95], [0.6, 0.035], [0.6, 0.035], {
    bone: pack,
    color: WOOD_LT,
    group: G,
  });
  for (const s of [1, -1]) cyl([s * 0.295, 0.9, -0.26], [s * 0.295, 0.9, -0.95], 0.012, WOOD_DK, pack, G);
  cyl([0.295, 0.9, -0.95], [-0.295, 0.9, -0.95], 0.012, WOOD_DK, pack, G);
  // Shoulder straps: leather loops over each shoulder, a chest strap and a hip belt.
  for (const s of [1, -1]) {
    const loop = catmull([
      [s * 0.13, 1.36, fz(1.36) + 0.005],
      [s * 0.15, 1.47, -0.09],
      [s * 0.16, 1.47, 0.03],
      [s * 0.13, 1.3, 0.13],
      [s * 0.13, 1.1, 0.14],
      [s * 0.18, 1.0, 0.03],
      [s * 0.15, 0.98, fz(1.0)],
    ]);
    b.sweep(loop, [0.026, 0.008], { section: "box", color: LEATHER, bone: chest, group: G, caps: "flat" });
  }
  b.sweep(
    polyline([
      [0.135, 1.24, 0.132],
      [-0.135, 1.24, 0.132],
    ]),
    [0.008, 0.008],
    { section: "box", color: LEATHER_LT, bone: chest, group: G, caps: "flat" },
  );
  torus([0, 1.24, 0.14], [0, 0, 1], 0.014, 0.004, BRASS, chest, G, 6);

  // -- Trunk with an arched lid, leather bands, brass plate and hasp
  const TR: V3 = [0, 1.065, -0.56];
  box(WOOD, TR, [0.54, 0.36, 0.4], pack, G);
  b.part(lidGeo(0.2, 0.54), WOOD_LT, { bone: pack, at: [0, TR[1] + 0.18, TR[2]], group: G });
  for (const x of [-0.19, 0.19]) {
    box(LEATHER_DK, [x, TR[1], TR[2]], [0.04, 0.37, 0.41], pack, G);
    b.part(lidGeo(0.205, 0.04), LEATHER_DK, { bone: pack, at: [x, TR[1] + 0.18, TR[2]], group: G });
    for (const y of [-0.16, 0.16])
      for (const z of [-0.2, 0.2])
        b.part(sphere(0.009, 4, 3), BRASS, { bone: pack, at: [x, TR[1] + y, TR[2] + z * 1.03], group: G });
  }
  plane(T.trunkPlate, [0, TR[1] + 0.05, TR[2] - 0.203], [0, 0, -1], 0.14, 0.098, pack, G);
  plane(T.hasp, [0, TR[1] + 0.165, TR[2] - 0.203], [0, 0, -1], 0.045, 0.068, pack, G);
  plane(T.map, [-0.135, TR[1] - 0.02, TR[2] - 0.203], [0, 0, -1], 0.1, 0.075, pack, G, [0.1, 1, 0]);
  plane(T.stickers[0], [0.135, TR[1] - 0.07, TR[2] - 0.203], [0, 0, -1], 0.075, 0.075, pack, G);
  plane(T.stickers[1], [0.125, TR[1] + 0.055, TR[2] - 0.203], [0, 0, -1], 0.07, 0.042, pack, G, [0.25, 1, 0]);
  plane(T.stickers[2], [-0.13, TR[1] + 0.085, TR[2] - 0.203], [0, 0, -1], 0.07, 0.049, pack, G, [-0.2, 1, 0]);
  plane(T.stickers[0], [-0.115, TR[1] - 0.115, TR[2] - 0.203], [0, 0, -1], 0.05, 0.05, pack, G, [0.4, 1, 0]);
  hang(T.tasselTeal, [0.25, TR[1] - 0.14, TR[2] - 0.15], 0.04, 0.12, pack, G, [1, 0, 0]);

  // -- Bottle crate at the back
  const CR: V3 = [0, 0.955, -0.82];
  box(WOOD, [0, 0.9, -0.82], [0.42, 0.06, 0.2], pack, G);
  for (const [dx, dz, w, d] of [
    [0, 0.098, 0.42, 0.012],
    [0, -0.098, 0.42, 0.012],
    [0.208, 0, 0.012, 0.2],
    [-0.208, 0, 0.012, 0.2],
  ] as [number, number, number, number][])
    box(WOOD_LT, [dx, 0.955, -0.82 + dz], [w, 0.09, d], pack, G);
  plane(T.crateLabel, [0.11, 0.952, -0.926], [0, 0, -1], 0.09, 0.06, pack, G);
  const bottleCols = [BLUE_GLASS, GREEN_GLASS, AMBER, PURPLE, GREEN_GLASS, BLUE_GLASS];
  for (let k = 0; k < 6; k++) {
    const x = -0.13 + (k % 3) * 0.13;
    const z = -0.78 - Math.floor(k / 3) * 0.08;
    const base: V3 = [x, 0.93, z];
    b.lathe(
      [
        [0, 0],
        [0.027, 0, "sharp"],
        [0.03, 0.02],
        [0.03, 0.09],
        [0.012, 0.125],
        [0.011, 0.17],
        [0.014, 0.176, "sharp"],
        [0, 0.176],
      ],
      { at: base, segments: 8, color: bottleCols[k], bone: pack, group: G },
    );
    b.part(new THREE.CylinderGeometry(0.0095, 0.008, 0.02, 6), CORK, { bone: pack, at: [x, 1.112, z], group: G });
    if (k < 3) plane(T.labels[k], [x, 0.99, z - 0.0305], [0, 0, -1], 0.04, 0.05, pack, G);
  }
  void CR;

  // -- Carpet roll across the top of the trunk, and three standing carpets on the left
  const carpet = (a: V3, c: V3, r: number, ti: number) => {
    const A = v3(a);
    const C = v3(c);
    const d = C.clone().sub(A);
    const len = d.length();
    const dir = d.clone().normalize();
    b.part(facet(new THREE.CylinderGeometry(r, r, len, 8, 1, true)), WHITE, {
      bone: pack,
      at: A.clone().addScaledVector(dir, len / 2),
      dir,
      axis: "y",
      texture: T.carpetSide[ti],
      group: G,
    });
    for (const [p, n] of [
      [A, dir.clone().negate()],
      [C, dir.clone()],
    ] as [THREE.Vector3, THREE.Vector3][])
      b.part(new THREE.CircleGeometry(r, 8), WHITE, {
        bone: pack,
        at: p.clone().addScaledVector(n, 0.001),
        dir: n,
        axis: "z",
        up: [0, 1, 0.0001],
        texture: T.carpetEnd[ti],
        group: G,
      });
  };
  const CAY = 1.55;
  carpet([0.34, CAY, -0.5], [-0.34, CAY, -0.5], 0.105, 0);
  for (const t of [-0.22, 0.22]) torus([t, CAY, -0.5], [1, 0, 0], 0.109, 0.008, LEATHER_DK, pack, G, 8);
  {
    for (const s of [1, -1]) {
      const ends = Array.from({ length: 8 }, (_, k) => {
        const a = (k / 8) * Math.PI * 2;
        return frame([s * 0.34, CAY + Math.sin(a) * 0.075, -0.5 + Math.cos(a) * 0.075], [s, 0, 0]);
      });
      b.cards(ends, T.fringeCarpetUp, {
        size: [0.075, 0.07],
        lean: 20,
        flow: [0, -1, 0],
        sink: 0,
        bone: pack,
        group: G,
      });
    }
  }
  carpet([0.3, 0.9, -0.36], [0.28, 2.1, -0.38], 0.058, 1);
  carpet([0.4, 0.9, -0.42], [0.42, 1.95, -0.45], 0.05, 2);
  carpet([0.34, 0.9, -0.5], [0.39, 2.22, -0.52], 0.053, 3);
  for (const t of [0.3, 0.65])
    for (const [bx, bz, r] of [[0.35, -0.44, 0.115]] as [number, number, number][])
      torus([bx + t * 0.02, 0.9 + t * 1.2, bz], [0, 1, 0.02], r, 0.007, ROPE, pack, G, 8);
  hang(T.tasselRed, [0.3, 2.13, -0.4], 0.04, 0.13, pack, G, [1, 0, 0]);

  // -- Scroll case and loose scrolls on the right
  {
    const base: V3 = [-0.33, 1.28, -0.4];
    const dir = v3([-0.06, 1, -0.05]).normalize();
    const top = v3(base).addScaledVector(dir, 0.62);
    b.rod(base, top.toArray() as V3, 0.06, { bone: pack, color: LEATHER, sides: 8, smooth: false, group: G });
    for (const t of [0.06, 0.94])
      torus(
        v3(base)
          .addScaledVector(dir, 0.62 * t)
          .toArray() as V3,
        dir.toArray() as V3,
        0.062,
        0.008,
        BRASS,
        pack,
        G,
        8,
      );
    const scrollTops: V3[] = [];
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      const p = top.clone().add(new THREE.Vector3(Math.sin(a) * 0.028, 0, Math.cos(a) * 0.028));
      const q = p.clone().addScaledVector(dir, 0.12 + (k % 3) * 0.06);
      b.rod(p.toArray() as V3, q.toArray() as V3, 0.017, {
        bone: pack,
        color: k % 2 ? CANVAS : CREAM,
        sides: 6,
        smooth: false,
        group: G,
      });
      b.part(new THREE.CircleGeometry(0.017, 6), WHITE, {
        bone: pack,
        at: q.clone().addScaledVector(dir, 0.001),
        dir,
        axis: "z",
        texture: T.scrollEnd,
        group: G,
      });
      scrollTops.push(q.toArray() as V3);
    }
    torus(top.clone().addScaledVector(dir, 0.07).toArray() as V3, dir.toArray() as V3, 0.045, 0.007, RED, pack, G, 8);
    const seal = v3(base).addScaledVector(dir, 0.35);
    hang(T.ribbons[3], [seal.x - 0.03, seal.y + 0.1, seal.z - 0.062], 0.045, 0.24, pack, G);
    hang(T.tasselGold, [seal.x + 0.03, seal.y + 0.05, seal.z - 0.062], 0.032, 0.1, pack, G);
    b.part(sphere(0.02, 6, 4), RED, {
      bone: pack,
      at: [seal.x + 0.0, seal.y - 0.03, seal.z - 0.062],
      scale: [1, 1, 0.5],
      group: G,
    });
  }

  // -- Birdcage with a songbird, hung under the roof
  {
    const c: V3 = [0, 1.655, -0.5];
    const rBase = 0.155;
    b.lathe(
      [
        [0, 0],
        [rBase, 0],
        [rBase + 0.01, 0.014],
        [rBase, 0.03],
        [0, 0.03],
      ],
      { at: c, segments: 12, color: BRASS_DK, bone: pack, group: G },
    );
    const topC: V3 = [c[0], c[1] + 0.34, c[2]];
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      const p: V3 = [c[0] + Math.sin(a) * rBase * 0.95, c[1] + 0.03, c[2] + Math.cos(a) * rBase * 0.95];
      const q: V3 = [c[0] + Math.sin(a) * rBase * 0.72, c[1] + 0.26, c[2] + Math.cos(a) * rBase * 0.72];
      b.rod(p, q, 0.0035, { bone: pack, color: BRASS, sides: 4, group: G, smooth: false });
      b.rod(q, topC, 0.0035, { bone: pack, color: BRASS, sides: 4, group: G, smooth: false });
    }
    torus([c[0], c[1] + 0.15, c[2]], [0, 1, 0], rBase * 0.86, 0.004, BRASS, pack, G, 12);
    torus([c[0], c[1] + 0.26, c[2]], [0, 1, 0], rBase * 0.72, 0.005, BRASS, pack, G, 12);
    b.part(sphere(0.016, 6, 4), BRASS, { bone: pack, at: [topC[0], topC[1], topC[2]], group: G });
    torus([topC[0], topC[1] + 0.03, topC[2]], [1, 0, 0], 0.025, 0.004, BRASS, pack, G, 8);
    // Perch and bird.
    b.rod([c[0] - 0.1, c[1] + 0.09, c[2]], [c[0] + 0.1, c[1] + 0.09, c[2]], 0.005, {
      bone: pack,
      color: WOOD_DK,
      sides: 4,
      group: G,
    });
    b.cards([frame([c[0], c[1] + 0.094, c[2]], [0, 1, 0])], T.bird, {
      size: [0.11, 0.098],
      flow: [1, 0, 0],
      sink: 0,
      cross: true,
      bone: pack,
      group: G,
    });
    // Half-cover: a quilted cloth draped over the back of the cage.
    plane(T.patches[0], [0, c[1] + 0.13, c[2] - 0.147], [0, 0.2, -1], 0.13, 0.13, pack, G);
    hang(T.tasselRed, [c[0] + 0.12, c[1] + 0.02, c[2] - 0.1], 0.03, 0.09, pack, G);
    cyl([c[0], c[1] + 0.4, c[2]], [c[0], TOP, c[2]], 0.004, BRASS_DK, pack, G, 4);
  }

  // -- Canvas roof, pennant, bunting and charms
  {
    const rc: V3 = [0, TOP + 0.005, -0.5];
    const HX = 0.44;
    const HZ = 0.37;
    b.part(pyramid(HX, HZ, 0.2), WHITE, { bone: pack, at: rc, texture: T.awning, group: G });
    const under = new THREE.PlaneGeometry(HX * 2, HZ * 2);
    under.rotateX(Math.PI / 2);
    b.part(under, CANVAS_DK, { bone: pack, at: rc, group: G });
    // Rafters: cords from the pole tops to the roof corners.
    const corners: V3[] = [
      [HX, rc[1], rc[2] + HZ],
      [-HX, rc[1], rc[2] + HZ],
      [HX, rc[1], rc[2] - HZ],
      [-HX, rc[1], rc[2] - HZ],
    ];
    for (const [x, y, z] of corners)
      cyl([Math.sign(x) * 0.16, TOP + 0.02, fz(TOP)], [x, y - 0.005, z], 0.006, ROPE_DK, pack, G, 4);
    // Pennant pole + flag + ribbons.
    const tip: V3 = [0, rc[1] + 0.2, rc[2]];
    cyl(tip, [0, tip[1] + 0.17, tip[2]], 0.008, WOOD_DK, pack, G, 5);
    b.part(sphere(0.016, 6, 4), BRASS, { bone: pack, at: [0, tip[1] + 0.18, tip[2]], group: G });
    b.cards([frame([0.005, tip[1] + 0.06, tip[2]], [1, 0.08, 0])], T.pennant, {
      size: [0.075, 0.28],
      lean: 0,
      flow: [0, 0, -1],
      bend: 50,
      sink: 0,
      bone: pack,
      group: G,
    });
    hang(T.ribbons[0], [0.01, tip[1] + 0.03, tip[2] - 0.01], 0.05, 0.3, pack, G);
    hang(T.ribbons[1], [-0.01, tip[1] + 0.03, tip[2] + 0.01], 0.05, 0.36, pack, G, [1, 0, 0]);
    // Roof-edge fringe on the four sides.
    const fringeCards = (a: V3, c: V3, n: number, flow: V3) => {
      const fr: Frame[] = [];
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n;
        fr.push(frame([a[0] + (c[0] - a[0]) * t, a[1] - 0.065, a[2] + (c[2] - a[2]) * t], [0, 1, 0]));
      }
      b.cards(fr, T.fringeCloak, { size: [(0.9 / n) * 1.5, 0.065], flow, sink: 0, bone: pack, group: G });
    };
    fringeCards(corners[3], corners[2], 7, [0, 0, -1]);
    fringeCards(corners[1], corners[0], 7, [0, 0, 1]);
    fringeCards(corners[2], corners[0], 6, [1, 0, 0]);
    fringeCards(corners[3], corners[1], 6, [-1, 0, 0]);
    // Bunting strung round all four roof edges.
    const bunting = (pts: V3[], n: number, flow: V3, seed: number) => {
      const line = catmull(pts);
      b.sweep(line, 0.0035, { sides: 4, color: ROPE_DK, bone: pack, group: G });
      const flags: Frame[] = [];
      for (let k = 0; k < n; k++) {
        const p = line.at((k + 0.5) / n);
        flags.push(frame([p.x, p.y - 0.115, p.z], [0, 1, 0]));
      }
      b.cards(flags, T.flags, { size: [0.095, 0.115], flow, sink: 0, rng: rng(seed), bone: pack, group: G });
    };
    const eave = rc[1] - 0.005;
    bunting(
      [
        [HX, eave, -0.87],
        [0.22, eave - 0.07, -0.9],
        [0, eave - 0.1, -0.91],
        [-0.22, eave - 0.07, -0.9],
        [-HX, eave, -0.87],
      ],
      8,
      [0, 0, -1],
      41,
    );
    bunting(
      [
        [HX, eave, -0.13],
        [0.22, eave - 0.07, -0.1],
        [0, eave - 0.1, -0.09],
        [-0.22, eave - 0.07, -0.1],
        [-HX, eave, -0.13],
      ],
      8,
      [0, 0, 1],
      42,
    );
    bunting(
      [
        [HX + 0.005, eave, -0.13],
        [HX + 0.01, eave - 0.07, -0.35],
        [HX + 0.01, eave - 0.09, -0.5],
        [HX + 0.01, eave - 0.07, -0.65],
        [HX + 0.005, eave, -0.87],
      ],
      7,
      [1, 0, 0],
      43,
    );
    bunting(
      [
        [-HX - 0.005, eave, -0.13],
        [-HX - 0.01, eave - 0.07, -0.35],
        [-HX - 0.01, eave - 0.09, -0.5],
        [-HX - 0.01, eave - 0.07, -0.65],
        [-HX - 0.005, eave, -0.87],
      ],
      7,
      [-1, 0, 0],
      44,
    );
    // Charms hung along the roof's back eave, tassels at the corners, dream-catchers at the sides.
    const order = [3, 0, 7, 5, 2, 9, 8, 1, 4, 6];
    order.forEach((ci, k) => {
      const w = [0.07, 0.085, 0.08, 0.075, 0.09, 0.08, 0.07, 0.085, 0.08, 0.085][ci];
      hang(T.charms[ci], [0.36 - (k / 9) * 0.72, 2.14 - (k % 2) * 0.09, -0.915], w, w * 1.5, pack, G);
    });
    [
      [T.tasselRed, 1, 1],
      [T.tasselTeal, -1, 1],
      [T.tasselGold, 1, -1],
      [T.tasselRed, -1, -1],
    ].forEach(([t, sx, sz]) =>
      hang(t as THREE.Texture, [(sx as number) * HX, eave, rc[2] + (sz as number) * HZ], 0.055, 0.17, pack, G, [
        0,
        0,
        sz as number,
      ]),
    );
    hang(T.dream, [HX + 0.03, eave - 0.005, -0.62], 0.14, 0.28, pack, G, [1, 0, 0]);
    hang(T.dream, [-HX - 0.03, eave - 0.005, -0.4], 0.12, 0.24, pack, G, [-1, 0, 0]);
    hang(T.herb, [0.2, 1.95, -0.36], 0.08, 0.145, pack, G, [0, 0, 1]);
    hang(T.garlic, [-0.2, 1.95, -0.36], 0.065, 0.17, pack, G, [0, 0, 1]);
  }

  // -- Side hangings: hooked lanterns, a kettle, a teal pot and pans, a shop sign under the shelf
  {
    // Lantern hooks on both poles' outer ends.
    const hookL: V3 = [0.5, 2.0, fz(2.0) - 0.02];
    b.sweep(bezier([0.16, 1.95, fz(1.95)], [0.4, 2.1, fz(2)], [hookL[0], hookL[1] - 0.02, hookL[2]]), 0.011, {
      sides: 5,
      smooth: false,
      color: WOOD_DK,
      bone: pack,
      group: G,
      caps: "round",
    });
    b.sweep(
      polyline([
        [hookL[0], hookL[1] - 0.02, hookL[2]],
        [hookL[0], hookL[1] - 0.12, hookL[2]],
      ]),
      0.003,
      { sides: 4, color: ROPE_DK, bone: pack, group: G },
    );
    lantern([hookL[0], hookL[1] - 0.12, hookL[2]], 0.07, 0.19, T.lanternTeal, TEAL, pack, G);
    const hookR: V3 = [-0.52, 1.82, fz(1.8) - 0.02];
    b.sweep(bezier([-0.16, 1.77, fz(1.77)], [-0.4, 1.92, fz(1.8)], [hookR[0], hookR[1] - 0.02, hookR[2]]), 0.011, {
      sides: 5,
      smooth: false,
      color: WOOD_DK,
      bone: pack,
      group: G,
      caps: "round",
    });
    b.sweep(
      polyline([
        [hookR[0], hookR[1] - 0.02, hookR[2]],
        [hookR[0], hookR[1] - 0.1, hookR[2]],
      ]),
      0.003,
      { sides: 4, color: ROPE_DK, bone: pack, group: G },
    );
    lantern([hookR[0], hookR[1] - 0.1, hookR[2]], 0.065, 0.17, T.lanternRed, AMBER, pack, G);
    // Kettle on the right.
    const KC: V3 = [-0.46, 1.03, -0.5];
    b.sweep(
      polyline([
        [-0.16, 1.15, fz(1.15)],
        [-0.35, 1.28, -0.4],
        [KC[0], KC[1] + 0.24, KC[2]],
      ]),
      0.01,
      { sides: 5, smooth: false, color: WOOD_DK, bone: pack, group: G },
    );
    b.lathe(
      [
        [0, 0],
        [0.075, 0, "sharp"],
        [0.092, 0.05],
        [0.08, 0.11],
        [0.048, 0.14],
        [0.05, 0.155],
        [0.012, 0.16],
        [0.014, 0.19],
        [0, 0.192],
      ],
      { at: KC, segments: 8, color: COPPER, bone: pack, group: G, smoothing: 0 },
    );
    b.sweep(
      bezier(
        [KC[0], KC[1] + 0.15, KC[2] - 0.08],
        [KC[0] - 0.02, KC[1] + 0.32, KC[2]],
        [KC[0], KC[1] + 0.15, KC[2] + 0.08],
      ),
      0.006,
      { sides: 5, color: COPPER_DK, bone: pack, group: G },
    );
    b.sweep(
      bezier(
        [KC[0] - 0.02, KC[1] + 0.06, KC[2] - 0.085],
        [KC[0] - 0.09, KC[1] + 0.12, KC[2] - 0.15],
        [KC[0] - 0.14, KC[1] + 0.13, KC[2] - 0.18],
      ),
      [0.014, 0.006],
      { sides: 5, color: COPPER, bone: pack, group: G },
    );
    // Teal glazed pot on the left, with rope and a decorative band.
    const PC: V3 = [0.5, 0.94, -0.6];
    b.lathe(
      [
        [0, 0],
        [0.06, 0, "sharp"],
        [0.098, 0.045],
        [0.115, 0.11],
        [0.098, 0.18],
        [0.066, 0.21],
        [0.076, 0.226, "sharp"],
        [0.05, 0.226],
        [0, 0.222],
      ],
      { at: PC, segments: 8, color: TEAL, bone: pack, group: G },
    );
    b.part(facet(new THREE.ConeGeometry(0.06, 0.04, 8)), TEAL_DK, {
      bone: pack,
      at: [PC[0], PC[1] + 0.245, PC[2]],
      group: G,
    });
    b.part(sphere(0.014, 5, 4), BRASS, { bone: pack, at: [PC[0], PC[1] + 0.272, PC[2]], group: G });
    for (const t of [0, 1])
      plane(
        T.potBand,
        [PC[0] + (t ? 0.09 : 0), PC[1] + 0.11, PC[2] - (t ? 0.06 : 0.108)],
        t ? [0.8, 0, -0.6] : [0, 0, -1],
        0.11,
        0.035,
        pack,
        G,
      );
    b.sweep(
      catmull([
        [0.19, 1.05, fz(1.05) - 0.02],
        [0.4, 1.02, -0.5],
        [PC[0], PC[1] + 0.29, PC[2] + 0.1],
        [PC[0] + 0.02, PC[1] + 0.12, PC[2] + 0.11],
        [PC[0], PC[1] + 0.04, PC[2] + 0.1],
      ]),
      0.006,
      { sides: 4, color: ROPE, bone: pack, group: G },
    );
    // Tin cups and a copper pan on the shelf's side rail.
    for (const [k, x] of [0.2, -0.06, -0.2].entries()) {
      const cx = 0.3 + k * 0.05;
      void x;
      b.lathe(
        [
          [0, 0],
          [0.025, 0],
          [0.032, 0.05],
          [0.03, 0.05],
          [0.0, 0.048],
        ],
        { at: [cx, 0.62 - k * 0.03, -0.92 + k * 0.02], segments: 6, color: "#a8a8b0", bone: pack, group: G },
      );
    }
    const panC: V3 = [-0.26, 0.55, -0.93];
    b.lathe(
      [
        [0, 0],
        [0.085, 0],
        [0.1, 0.03],
        [0.088, 0.032],
        [0.075, 0.008],
        [0, 0.008],
      ],
      { at: panC, axis: [0, 0.2, -1], segments: 10, color: COPPER, bone: pack, group: G },
    );
    b.rod([panC[0], panC[1] + 0.09, panC[2]], [panC[0], panC[1] + 0.3, panC[2] + 0.02], 0.009, {
      bone: pack,
      color: WOOD_DK,
      sides: 5,
      group: G,
    });
    b.rod([panC[0], panC[1] + 0.3, panC[2] + 0.02], [panC[0] + 0.04, 0.86, -0.94], 0.003, {
      bone: pack,
      color: ROPE_DK,
      sides: 4,
      group: G,
    });
    // Shop sign under the shelf on two ropes.
    plane(T.sign, [0, 0.66, -0.965], [0, 0, -1], 0.42, 0.193, pack, G);
    for (const s of [1, -1]) cyl([s * 0.19, 0.85, -0.955], [s * 0.19, 0.738, -0.96], 0.004, ROPE, pack, G, 4);
    box(WOOD_DK, [0, 0.66, -0.958], [0.4, 0.17, 0.01], pack, G);
  }

  void R;
  return b.root;
}
