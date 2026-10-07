import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { catmull } from "../src/path";
import { rng } from "../src/math";
import { grain, mottle, paint, scales, stripes } from "../src/paint";
import { svg } from "../src/texture";
import { cel, INK, inkLines } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Street Corner",
  description:
    "A sunny street corner in front of a painted brick facade with bunting, a chimney and side windows: a scalloped striped awning over two flower boxes, a teal lamp post with a filigree shaft, a glowing crystal lantern and a hanging shop sign, a mailbox with a hinged door and flag, a bench with a wrapped parcel, an A-board, a potted bush, glowing bollards and chalk hopscotch on the pavement.",
  style: "whimsical Genshin mix",
  commit: "b816db2",
};

// Metres. The pavement top is the ground everything stands on.
const Y0 = 0.12;

// ---------------------------------------------------------------- paints
// Cel paints (lit tone plus a hard hue-shifted shadow) from kits/toon.
const TEAL = cel("#2fb8a8");
const GOLD = cel("#ffd35c", "#e0963f");
const CREAM = cel("#fff4da", "#f2c7a0");
const CORAL = cel("#ff7463");
const GLASS = "#3d6f8a";
const CURB = cel("#f7d9b0", "#e0b08a");
const PAVE = cel(scales(["#f3e4c6", "#eadab8"], "#c4a682", { size: 0.16 }));
const BRICK = cel(
  paint((p) => {
    const row = Math.floor(p.y / 0.11);
    const bx = (((p.x + (row % 2) * 0.16) % 0.32) + 0.32) % 0.32;
    const by = ((p.y % 0.11) + 0.11) % 0.11;
    return bx < 0.012 || by < 0.01 ? "#fff0d2" : "#f5a077";
  }),
);
const AWN = cel(stripes("#fff6e0", "#ff7463", { size: 0.2, axis: "x" }));
const FLOWERBOX = cel(scales("#ff8a6a", "#e8604e", { size: 0.1 }));
const SOIL = cel("#8a5a3c");
const SHUTTER = cel(stripes("#2fb8a8", "#1d8a86", { size: 0.035, axis: "y" }));
const WOOD = cel(grain("#f2b47f", "#c97d4c", { size: 0.03, axis: "x" }));
const PAPER = cel(stripes("#fff4da", "#ffb7a6", { size: 0.05, axis: "y" }));
const POT = cel("#ff9a7a");
const BUSH = cel(mottle("#5ccf74", "#a6ec8c", { size: 0.22 }));
// Gold filigree dots spaced up the lamp shaft.
const SHAFT = cel(paint((_p, _n, s) => (s[0] % 0.16 < 0.035 && ((((s[1] / 45) % 1) + 1) % 1) < 0.25 ? "#ffd35c" : "#2fb8a8")));
// Filigree: gold rings inlaid on the teal bench cheeks.
const CHEEK = cel(
  paint((_p, _n, s) => {
    const d = Math.hypot(s[0] + 0.03, s[1] - 0.3);
    return Math.abs(d - 0.06) < 0.006 || Math.abs(d - 0.09) < 0.006 ? "#ffd35c" : "#2fb8a8";
  }),
);
// Ink rings across the lantern roof, like cel-shaded creases.
const ROOF = inkLines(TEAL, { levels: [0.3], axis: [0, 1, 0] });

// ---------------------------------------------------------------- textures
const flowerSvg = (petal: string, centre: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96">
<path d="M32 96 C30 82 35 64 32 44" fill="none" stroke="#3f9e4a" stroke-width="2.4" stroke-linecap="round"/>
<path d="M32 84 C38 74 46 73 52 66 C46 60 38 63 32 76 Z" fill="#7ddc6a" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
<g transform="translate(32 28)">
${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-12" rx="8.5" ry="11" transform="rotate(${a})" fill="${petal}" stroke="${INK}" stroke-width="1.8"/>`).join("\n")}
<circle r="6" fill="${centre}" stroke="${INK}" stroke-width="1.6"/>
<circle cx="-2" cy="-2.2" r="1.4" fill="#ffffff" opacity="0.85"/>
</g>
</svg>`;
const FL_PINK = svg(flowerSvg("#ff9ec4", "#ffe066"), { size: 256 });
const FL_YELLOW = svg(flowerSvg("#ffe066", "#ff8a3d"), { size: 256 });
const FL_VIOLET = svg(flowerSvg("#b59cff", "#ffd35c"), { size: 256 });
const FL_WHITE = svg(flowerSvg("#ffffff", "#ffb347"), { size: 256 });

const VINE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 96">
<path d="M16 0 C6 18 26 34 16 52 C8 66 22 78 16 96" fill="none" stroke="#3f9e4a" stroke-width="2"/>
${[
  [10, 20, -40],
  [22, 36, 40],
  [9, 56, -35],
  [22, 72, 30],
  [12, 88, -30],
]
  .map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="3.4" transform="rotate(${r} ${x} ${y})" fill="#7ddc6a" stroke="${INK}" stroke-width="1.1"/>`)
  .join("\n")}
</svg>`,
  { size: 256 },
);

const leafSvg = (c: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
<path d="M24 46 C8 36 6 14 24 2 C42 14 40 36 24 46 Z" fill="${c}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
<path d="M24 42 L24 10" stroke="#2f8a48" stroke-width="1.6" fill="none"/>
<path d="M24 26 L14 18 M24 32 L34 24" stroke="#2f8a48" stroke-width="1.2" fill="none"/>
</svg>`;
const LEAF_A = svg(leafSvg("#7ddc6a"), { size: 128 });
const LEAF_B = svg(leafSvg("#4fbf63"), { size: 128 });

const SIGN = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 52">
<rect x="1" y="1" width="58" height="50" rx="8" fill="#fff4da" stroke="#ffd35c" stroke-width="2.5"/>
<ellipse cx="29" cy="38" rx="16" ry="3.6" fill="#2fb8a8" stroke="${INK}" stroke-width="1.4"/>
<path d="M17 22 H39 Q39 36 28 36 Q17 36 17 22 Z" fill="#ff7463" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M38 25 Q47 24 46 30 Q45 34 38 33" fill="none" stroke="#ff7463" stroke-width="3"/>
<path d="M23 16 Q20 11 24 7 M30 16 Q27 11 31 7" fill="none" stroke="#2fb8a8" stroke-width="1.6" stroke-linecap="round"/>
<path d="M47 9 L48.4 12.2 L52 12.6 L49.2 14.8 L50 18 L47 16.2 L44 18 L44.8 14.8 L42 12.6 L45.6 12.2 Z" fill="#ffd35c" stroke="${INK}" stroke-width="0.8"/>
</svg>`,
  { size: 256 },
);

// Self-lit shop window: warm room, curtains and a potted plant. Glows in its own colours.
const WINDOW = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 56">
<rect width="60" height="56" fill="#ffe9a6"/>
<path d="M0 0 H14 Q10 18 16 34 Q6 40 0 36 Z" fill="#ff7463"/>
<path d="M60 0 H46 Q50 18 44 34 Q54 40 60 36 Z" fill="#ff7463"/>
<path d="M22 56 V44 H38 V56 Z" fill="#f2a06b"/>
<path d="M30 46 C26 36 20 30 22 22 C26 28 28 30 30 34 C32 28 36 22 38 20 C38 30 34 36 30 46 Z" fill="#2c8f7a"/>
<circle cx="44" cy="24" r="3" fill="#fff4da"/>
</svg>`,
  { size: 256 },
);

const TASSEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 80">
<path d="M12 0 V14" stroke="#ffd35c" stroke-width="2"/>
<circle cx="12" cy="18" r="4.5" fill="#ffd35c" stroke="${INK}" stroke-width="1.2"/>
<path d="M7.5 24 H16.5 L19 56 H5 Z" fill="#ff7463" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
<path d="M6 34 H18 M5.8 44 H18.2" stroke="#ffd35c" stroke-width="2"/>
${[6, 8, 10, 12, 14, 16, 18]
  .map((x) => `<path d="M${x} 56 V${72 + (x % 3) * 2}" stroke="#ff7463" stroke-width="1.6" stroke-linecap="round"/>`)
  .join("\n")}
</svg>`,
  { size: 256 },
);

// Hopscotch in chalk: outlined squares, dashed like hand-drawn chalk.
const CHALK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
${[
  [50, 10, "#ff5f9e"],
  [50, 33, "#12a596"],
  [30, 58, "#ffb020"],
  [70, 58, "#ff5f9e"],
  [50, 84, "#12a596"],
]
  .map(
    ([x, y, c]) =>
      `<rect x="${Number(x) - 14}" y="${Number(y) - 10}" width="28" height="20" rx="5" fill="none" stroke="${c}" stroke-width="4.5" stroke-dasharray="7 4"/>`,
  )
  .join("\n")}
<circle cx="88" cy="10" r="5" fill="none" stroke="#ffd35c" stroke-width="2.6" stroke-dasharray="4 2.5"/>
</svg>`,
  { size: 256 },
);

const BOARD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 70">
<rect x="1" y="1" width="48" height="68" rx="5" fill="#3d5a6c" stroke="#ffd35c" stroke-width="2"/>
<circle cx="25" cy="22" r="10" fill="none" stroke="#ff8fb1" stroke-width="2.6" stroke-dasharray="5 2.5"/>
<path d="M17 31 L25 56 L33 31" fill="none" stroke="#ffd35c" stroke-width="2.6" stroke-linejoin="round" stroke-dasharray="5 2.5"/>
<path d="M18 40 H32 M20 47 H30" stroke="#fff4da" stroke-width="1.8" stroke-dasharray="3 2"/>
<circle cx="11" cy="48" r="1.6" fill="#33b9b0"/>
<circle cx="39" cy="12" r="1.6" fill="#ffb020"/>
<circle cx="40" cy="58" r="1.6" fill="#ff8fb1"/>
</svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------- outlines
// Scalloped awning valance: a row of hanging arcs under a striped strip.
const valance: [number, number][] = [
  [-1.9, 0.02],
  [1.9, 0.02],
];
for (let i = 0; i <= 120; i++) {
  const x = 1.9 - (3.8 * i) / 120;
  const u = ((((x + 1.9) / 0.38) % 1) + 1) % 1;
  valance.push([x, -0.14 * Math.sqrt(Math.max(0, 1 - (2 * u - 1) ** 2))]);
}

// Bench cheek: scrolled leg and backrest post, in (z, y) metres from the bench centre.
const cheek: [number, number][] = [
  [-0.14, 0],
  [0.22, 0],
  [0.22, 0.1],
  [0.12, 0.18],
  [0.12, 0.42],
  [-0.04, 0.42],
  [-0.1, 0.7],
  [-0.2, 0.94],
  [-0.26, 0.84],
  [-0.2, 0.46],
  [-0.16, 0.2],
];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "streetCorner", paintSize: 2048 });

  // Skeleton: one root for the street group, hinges for the three moving parts.
  const root = b.joint("street", { at: [0, 0, 0] });
  const door = b.joint("mailDoor", { parent: root, at: [-1.35, Y0 + 0.9, 0.4], role: "hinge" });
  const flag = b.joint("mailFlag", { parent: root, at: [-1.55, Y0 + 0.98, 0.3], role: "hinge" });
  const sign = b.joint("signHinge", { parent: root, at: [1.02, Y0 + 2.45, 0.7], role: "hinge" });

  type Color = Parameters<typeof b.part>[1];
  type Bone = typeof root;
  const put = (g: THREE.BufferGeometry, c: Color, bone: Bone = root) => b.part(g, c, { bone, at: [0, 0, 0] });
  const box = (w: number, h: number, d: number, c: Color, x: number, y: number, z: number, bone: Bone = root) =>
    put(new THREE.BoxGeometry(w, h, d).translate(x, y, z), c, bone);
  const ball = (r: number, c: Color, x: number, y: number, z: number, bone: Bone = root) =>
    put(new THREE.SphereGeometry(r, 10, 8).translate(x, y, z), c, bone);

  // ------------------------------------------------ pavement and street
  box(4.0, Y0, 3.1, PAVE, 0, Y0 / 2, 0.05);
  box(4.0, 0.16, 0.18, CURB, 0, 0.08, 1.69);
  // Chalk hopscotch lying flat on the pavement, read from above.
  b.cards([frame([-0.5, Y0 + 0.004, 1.1], [0, 1, 0])], CHALK, {
    size: 1.0,
    lean: 90,
    flow: [0, 0, -1],
    mirror: true,
  });
  // Fallen leaves scattered on the paving.
  const leafSpots: [number, number][] = [
    [-1.7, 0.9],
    [-0.15, 1.5],
    [0.9, 1.3],
    [1.9, 1.0],
    [-1.0, 1.45],
    [0.4, 0.9],
    [-1.9, -0.2],
    [1.1, 0.3],
    [-0.6, 0.2],
  ];
  b.cards(
    leafSpots.map(([x, z]) => frame([x, Y0 + 0.005, z], [0, 1, 0])),
    [LEAF_A, LEAF_B],
    { size: 0.13, lean: 90, flow: [1, 0, 0], mirror: true, spin: 180, vary: 0.2, rng: rng(11) },
  );

  // ------------------------------------------------ facade
  box(3.7, 2.73, 0.3, BRICK, 0, 1.485, -1.35);
  box(3.84, 0.13, 0.42, GOLD, 0, 2.915, -1.35); // cornice
  for (const s of [-1, 1]) box(0.16, 2.73, 0.1, CREAM, s * 1.8, 1.485, -1.17); // pilasters
  // Downspout with gold collars running down the wall beside the left pilaster.
  put(new THREE.CylinderGeometry(0.035, 0.035, 2.7, 8).translate(-1.62, Y0 + 1.35, -1.14), TEAL);
  for (const y of [0.5, 1.9]) put(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 10).translate(-1.62, y, -1.14), GOLD);

  // Bunting strung across the facade above the awning: a gold cord with alternating pennants.
  const sag = (x: number) => 2.72 - 0.12 * (1 - (x / 1.85) ** 2);
  const cord = catmull(
    Array.from({ length: 9 }, (_, i) => {
      const x = -1.85 + (i * 3.7) / 8;
      return [x, sag(x), -1.11] as [number, number, number];
    }),
  );
  b.sweep(cord, 0.008, { color: GOLD, bone: root });
  for (let i = 0; i < 12; i++) {
    const x = -1.75 + (i * 3.5) / 11;
    b.extrude(
      [
        [-0.07, 0],
        [0.07, 0],
        [0, -0.13, "sharp"],
      ],
      {
        at: [x, sag(x) - 0.01, -1.11],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.008,
        color: [CORAL, TEAL, GOLD, CREAM][i % 4],
        bone: root,
      },
    );
  }
  // Roof: a brick chimney with a cream cap, and a rooftop bush.
  box(0.22, 0.46, 0.22, BRICK, 0.6, 3.21, -1.4);
  box(0.28, 0.05, 0.28, CREAM, 0.6, 3.455, -1.4);
  const roofBush = [ball(0.14, BUSH, -0.6, 3.1, -1.4), ball(0.11, BUSH, -0.42, 3.14, -1.32)];
  b.cards(b.surface(roofBush).scatter(22, { rng: rng(31), minDist: 0.05, filter: (h) => h.n.y > -0.2 }), [LEAF_A, LEAF_B], {
    size: [0.1, 0.12],
    lean: 35,
    vary: 0.25,
    rng: rng(32),
  });
  // Rear wall, seen from behind: two windows and a teal door.
  for (const x of [-0.9, 0.4]) {
    box(0.6, 0.66, 0.02, CREAM, x, 1.5, -1.51);
    box(0.5, 0.56, 0.012, GLASS, x, 1.5, -1.528);
  }
  box(0.36, 0.84, 0.03, TEAL, 0.25, 0.54, -1.515);
  ball(0.02, GOLD, 0.12, 0.6, -1.545);
  // Side windows on both ends of the facade.
  for (const s of [-1, 1]) {
    box(0.02, 0.66, 0.26, CREAM, s * 1.86, 1.5, -1.35);
    box(0.012, 0.56, 0.2, GLASS, s * 1.872, 1.5, -1.35);
  }

  // Striped awning: a sloped canopy from the wall, then a scalloped valance at its front edge.
  b.extrude(
    [
      [-1.9, 0],
      [1.9, 0],
      [1.9, 0.53],
      [-1.9, 0.53],
    ],
    {
      at: [0, 2.42, -1.2],
      x: [1, 0, 0],
      y: [0, -0.4167, 0.909],
      thickness: 0.025,
      bevel: 0.006,
      color: AWN,
      bone: root,
    },
  );
  b.extrude(valance, {
    at: [0, 2.2, -0.72],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.02,
    bevel: 0.004,
    color: AWN,
    bone: root,
  });

  // Two windows, each with shutters, a glowing interior and a flower box below.
  for (const xc of [-0.8, 0.55]) {
    const r = rng(xc > 0 ? 5 : 6);

    glow(
      b.part(new THREE.PlaneGeometry(0.6, 0.56), "#ffffff", {
        bone: root,
        at: [xc, 1.52, -1.19],
        dir: [0, 0, 1],
        axis: "z",
        texture: WINDOW,
      }),
    );
    box(0.66, 0.05, 0.06, CREAM, xc, 1.835, -1.17);
    for (const s of [-1, 1]) box(0.04, 0.6, 0.06, CREAM, xc + s * 0.31, 1.52, -1.17);
    box(0.03, 0.56, 0.04, CREAM, xc, 1.52, -1.17);
    box(0.6, 0.03, 0.04, CREAM, xc, 1.52, -1.17);
    for (const s of [-1, 1]) box(0.14, 0.64, 0.035, SHUTTER, xc + s * 0.38, 1.52, -1.16);

    // Flower box: planter, cream rim, soil, gold brackets.
    box(0.84, 0.22, 0.22, FLOWERBOX, xc, 1.08, -1.09);
    box(0.86, 0.04, 0.24, CREAM, xc, 1.21, -1.09);
    box(0.78, 0.05, 0.16, SOIL, xc, 1.225, -1.08);
    for (const s of [-0.3, 0.3])
      b.extrude(
        [
          [-1.2, 0.97],
          [-0.9, 0.97],
          [-1.2, 0.8],
        ],
        { at: [xc + s, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.02, color: GOLD, bone: root },
      );
    // Flower plants standing in the soil, each a cross of two cards.
    const plants = Array.from({ length: 9 }, (_, i) =>
      frame([xc - 0.34 + i * 0.085 + (r() - 0.5) * 0.03, 1.25, -1.09 + (r() - 0.5) * 0.08], [0, 1, 0]),
    );
    b.cards(plants, [FL_PINK, FL_YELLOW, FL_VIOLET, FL_WHITE], {
      size: [0.15, 0.24],
      lean: 0,
      cross: true,
      vary: 0.2,
      rng: r,
    });
    // Trailing vines hanging over the front of the box.
    const vines = [-0.34, -0.17, 0, 0.17, 0.34].map((d) => frame([xc + d, 1.18, -0.97], [0, 1, 0]));
    b.cards(vines, VINE, { size: [0.1, 0.28], lean: 180, vary: 0.15, rng: r });
  }

  // ------------------------------------------------ lamp post at the corner
  const lampAt = (dy: number): [number, number, number] => [1.45, Y0 + dy, 0.7];
  b.lathe(
    [
      [0, 0, "sharp"],
      [0.2, 0],
      [0.21, 0.05],
      [0.17, 0.13],
      [0.11, 0.22],
      [0.08, 0.3],
      [0.07, 0.4],
      [0.05, 0.46],
      [0.045, 0.8],
      [0.058, 1.0],
      [0.042, 1.2],
      [0.042, 2.4],
      [0.055, 2.55],
      [0.036, 2.74],
      [0.03, 3.0],
      [0, 3.0, "sharp"],
    ],
    { at: lampAt(0), color: SHAFT, bone: root, smoothing: 1 },
  );
  for (const dy of [0.6, 1.5, 2.3])
    b.lathe(
      [
        [0.03, 0],
        [0.07, 0],
        [0.08, 0.03],
        [0.07, 0.06],
        [0.03, 0.06],
      ],
      { at: lampAt(dy), color: GOLD, bone: root },
    );
  // Lantern cage, glass and roof.
  for (const [dx, dz] of [
    [0.16, 0],
    [-0.16, 0],
    [0, 0.16],
    [0, -0.16],
  ])
    box(0.026, 0.36, 0.026, GOLD, 1.45 + dx, Y0 + 3.06, 0.7 + dz);
  b.lathe(
    [
      [0.15, 0],
      [0.19, 0],
      [0.19, 0.03],
      [0.15, 0.03],
    ],
    { at: lampAt(2.92), color: GOLD, bone: root },
  );
  glow(
    b.lathe(
      [
        [0, 0, "sharp"],
        [0.13, 0],
        [0.15, 0.12],
        [0.14, 0.26],
        [0.1, 0.32],
        [0, 0.34, "sharp"],
      ],
      { at: lampAt(2.92), color: "#fff0b0", bone: root, smoothing: 1 },
    ),
  );
  b.lathe(
    [
      [0, 0, "sharp"],
      [0.2, 0],
      [0.21, 0.04],
      [0.19, 0.1],
      [0.13, 0.2],
      [0.07, 0.27],
      [0, 0.31, "sharp"],
    ],
    { at: lampAt(3.22), color: ROOF, bone: root, smoothing: 1 },
  );
  b.lathe(
    [
      [0.19, 0],
      [0.23, 0],
      [0.23, 0.025],
      [0.19, 0.025],
    ],
    { at: lampAt(3.19), color: GOLD, bone: root },
  );
  ball(0.035, GOLD, 1.45, Y0 + 3.55, 0.7);
  glow(put(new THREE.OctahedronGeometry(0.06).scale(1, 1.5, 1).translate(1.45, Y0 + 3.63, 0.7), "#7fe8ff"));
  // Tasselled cords hanging from the roof rim.
  const tassels = [0, 1, 2, 3].map((k) => {
    const a = (k * Math.PI) / 2;
    return frame([1.45 + 0.2 * Math.cos(a), Y0 + 3.2, 0.7 + 0.2 * Math.sin(a)], [0, 1, 0]);
  });
  b.cards(tassels, TASSEL, { size: [0.05, 0.17], lean: 180, vary: 0.1, rng: rng(9) });
  // Glowing wisps drifting round the lantern.
  for (const [dx, dy, dz] of [
    [0.34, 2.7, 0.12],
    [-0.3, 3.45, 0.22],
    [0.1, 1.85, 0.36],
  ])
    glow(ball(0.028, "#9ff7ff", 1.45 + dx, Y0 + dy, 0.7 + dz));

  // Hanging shop sign on a gold arm, swinging from the hinge.
  box(0.53, 0.06, 0.05, GOLD, 1.185, Y0 + 2.45, 0.7);
  put(new THREE.TorusGeometry(0.08, 0.012, 6, 12, Math.PI).rotateZ(Math.PI).translate(1.33, Y0 + 2.4, 0.7), GOLD);
  box(0.012, 0.25, 0.012, GOLD, 0.95, Y0 + 2.325, 0.7, sign);
  box(0.012, 0.25, 0.012, GOLD, 1.09, Y0 + 2.325, 0.7, sign);
  b.extrude(
    [
      [-0.15, -0.13],
      [0.15, -0.13],
      [0.15, 0.13],
      [-0.15, 0.13],
    ],
    {
      at: [1.02, Y0 + 2.07, 0.7],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.03,
      bevel: 0.008,
      smoothing: 2,
      color: TEAL,
      bone: sign,
    },
  );
  b.part(new THREE.PlaneGeometry(0.28, 0.24), "#ffffff", {
    bone: sign,
    at: [1.02, Y0 + 2.07, 0.722],
    dir: [0, 0, 1],
    axis: "z",
    texture: SIGN,
  });

  // ------------------------------------------------ mailbox on a post
  b.lathe(
    [
      [0, 0, "sharp"],
      [0.13, 0],
      [0.14, 0.05],
      [0.09, 0.12],
      [0.05, 0.2],
      [0.04, 0.3],
      [0.035, 0.9],
      [0, 0.9, "sharp"],
    ],
    { at: [-1.35, Y0, 0.3], color: TEAL, bone: root, smoothing: 1 },
  );
  box(0.36, 0.12, 0.2, CORAL, -1.35, 1.08, 0.3);
  put(new THREE.CylinderGeometry(0.1, 0.1, 0.36, 12, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).translate(-1.35, 1.14, 0.3), CORAL);
  // Hinged door (closed at rest), with a slot, a gold name plate and a letter poking out.
  put(new THREE.BoxGeometry(0.26, 0.1, 0.012).translate(-1.35, 1.07, 0.406), CORAL, door);
  box(0.14, 0.012, 0.01, INK, -1.35, 1.11, 0.42, door);
  box(0.08, 0.03, 0.006, GOLD, -1.35, 1.04, 0.41, door);
  box(0.11, 0.03, 0.05, CREAM, -1.35, 1.12, 0.44);
  // Flag on a hinge on the side, raised at rest.
  box(0.02, 0.2, 0.02, GOLD, -1.55, 1.2, 0.3, flag);
  box(0.1, 0.07, 0.015, CORAL, -1.6, 1.3, 0.3, flag);
  ball(0.02, GOLD, -1.55, 1.3, 0.3, flag);

  // A-board on the pavement: two wooden panels meeting at the top, chalk drawing on the front.
  const AB_X = 0.95;
  const AB_Z = 1.1;
  put(new THREE.BoxGeometry(0.5, 0.7, 0.02).rotateX(-0.28).translate(AB_X, Y0 + 0.35, AB_Z + 0.1), WOOD);
  put(new THREE.BoxGeometry(0.5, 0.7, 0.02).rotateX(0.28).translate(AB_X, Y0 + 0.35, AB_Z - 0.1), WOOD);
  b.part(new THREE.PlaneGeometry(0.46, 0.66), "#ffffff", {
    bone: root,
    at: [AB_X, Y0 + 0.354, AB_Z + 0.1135],
    dir: [0, 0.276, 0.961],
    up: [0, 0.961, -0.276],
    axis: "z",
    texture: BOARD,
  });
  // ------------------------------------------------ bench with a parcel
  const BX = -0.15;
  const BZ = 0.45;
  for (const xe of [-0.9, 0.6])
    b.extrude(cheek, {
      at: [xe, Y0, BZ],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.05,
      bevel: 0.01,
      smoothing: 1,
      color: CHEEK,
      bone: root,
    });
  for (const dz of [-0.21, -0.105, 0, 0.105, 0.21]) box(1.5, 0.04, 0.09, WOOD, BX, Y0 + 0.44, BZ + dz);
  // Backrest slats, each tipped back along the cheek posts.
  for (const [y, zr] of [
    [0.7, -0.1],
    [0.8, -0.142],
    [0.9, -0.183],
  ])
    put(new THREE.BoxGeometry(1.5, 0.09, 0.035).rotateX(-0.394).translate(BX, Y0 + y, BZ + zr), WOOD);
  box(1.5, 0.05, 0.05, GOLD, BX, Y0 + 0.99, BZ - 0.22);
  for (const xe of [-0.9, 0.6]) ball(0.035, GOLD, xe, Y0 + 0.96, BZ - 0.2);
  // Wrapped parcel with a gold ribbon and bow.
  box(0.26, 0.12, 0.2, PAPER, -0.12, Y0 + 0.52, BZ + 0.04);
  box(0.27, 0.012, 0.035, GOLD, -0.12, Y0 + 0.586, BZ + 0.04);
  box(0.035, 0.012, 0.21, GOLD, -0.12, Y0 + 0.586, BZ + 0.04);
  ball(0.03, GOLD, -0.155, Y0 + 0.61, BZ + 0.04);
  ball(0.03, GOLD, -0.085, Y0 + 0.61, BZ + 0.04);

  // ------------------------------------------------ potted bush
  const PX = 1.5;
  const PZ = -0.45;
  b.lathe(
    [
      [0, 0, "sharp"],
      [0.15, 0],
      [0.18, 0.05],
      [0.23, 0.17],
      [0.26, 0.27],
      [0.27, 0.3],
      [0, 0.3, "sharp"],
    ],
    { at: [PX, Y0, PZ], color: POT, bone: root, smoothing: 1 },
  );
  b.lathe(
    [
      [0.19, 0],
      [0.23, 0],
      [0.235, 0.02],
      [0.2, 0.035],
      [0.19, 0.035],
    ],
    { at: [PX, Y0 + 0.14, PZ], color: GOLD, bone: root },
  );
  put(new THREE.CylinderGeometry(0.25, 0.25, 0.02, 12).translate(PX, Y0 + 0.3, PZ), SOIL);
  const bushParts = [
    put(new THREE.SphereGeometry(0.32, 12, 9).translate(PX, Y0 + 0.58, PZ), BUSH),
    put(new THREE.SphereGeometry(0.22, 10, 8).translate(PX - 0.2, Y0 + 0.5, PZ + 0.12), BUSH),
    put(new THREE.SphereGeometry(0.24, 10, 8).translate(PX + 0.2, Y0 + 0.52, PZ - 0.1), BUSH),
  ];
  const bushSkin = b.surface(bushParts);
  b.cards(bushSkin.scatter(70, { rng: rng(21), minDist: 0.07, filter: (h) => h.n.y > -0.2 }), [LEAF_A, LEAF_B], {
    size: [0.12, 0.14],
    lean: 35,
    vary: 0.25,
    rng: rng(22),
  });
  b.cards(bushSkin.scatter(9, { rng: rng(23), minDist: 0.12, filter: (h) => h.n.y > 0 }), [FL_PINK, FL_YELLOW, FL_WHITE], {
    size: [0.12, 0.2],
    lean: 30,
    vary: 0.2,
    rng: rng(24),
  });

  // ------------------------------------------------ glowing bollards
  for (const [x, z] of [
    [-1.8, 1.25],
    [1.85, 1.3],
  ]) {
    b.lathe(
      [
        [0, 0, "sharp"],
        [0.12, 0, "sharp"],
        [0.12, 0.03],
        [0.07, 0.07],
        [0.065, 0.4],
        [0.085, 0.44],
        [0.09, 0.48],
        [0.08, 0.5],
        [0, 0.52, "sharp"],
      ],
      { at: [x, Y0, z], color: CREAM, bone: root, smoothing: 1 },
    );
    glow(ball(0.06, "#a8f7ff", x, Y0 + 0.5, z));
  }

  return b.root;
}
