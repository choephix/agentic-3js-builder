```ts
import * as THREE from "three";
import { catmull, createBuilder, grain, mottle, rng, scales, stripes, svg } from "agentic-3js-builder";

export const meta = {
  name: "Treehouse",
  description: "A red-roofed cabin on a deck in an old oak, with a ladder, a rope swing, flower boxes, a bird and a flag.",
};

// Palette
const BARK_LIGHT = "#8a5d36";
const BARK_DARK = "#4a2f1b";
const PLANK = "#e3ad6f";
const PLANK_DARK = "#c48a4f";
const DECK = "#b98050";
const DECK_DARK = "#9a673b";
const RAIL = "#dfb67f";
const TRIM = "#fbf1d6";
const ROOF = "#d1493a";
const ROOF_DARK = "#8e2c25";
const BRICK = "#a35b43";
const MORTAR = "#e6d5b2";
const DOOR = "#2b8f8c";
const BRASS = "#f0c15a";
const GLASS = "#a8e6ff";
const GLOW = "#ffe79c";
const ROPE = "#d8c09a";
const RUNG = "#a9743f";
const DARK = "#2e2b36";
const LANTERN = "#ffcf5c";
const POT = "#c96d43";
const FLAG = "#ff6a4d";
const BEAK = "#ff9f1c";
const JAY = "#3c74d6";
const PINK = "#ff7ea6";
const YELLOW = "#ffd23f";
const WHITE = "#fff7fb";
const RED = "#ff4d5a";
const LILAC = "#b58cff";

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  type Part = ReturnType<typeof b.part>;
  const base = b.joint("base", { at: [0, 0, 0] });
  const on = { bone: base };
  const R = rng(21);
  const FLOWERS = [PINK, YELLOW, WHITE, LILAC, RED];

  // ---- paints
  const barkPaint = grain(BARK_LIGHT, BARK_DARK, { size: 0.07, axis: "y" });
  const wallPaint = stripes(PLANK, PLANK_DARK, { size: 0.14, axis: "y" });
  const deckPaint = stripes(DECK, DECK_DARK, { size: 0.22, axis: "x" });
  const roofPaint = scales(ROOF, ROOF_DARK, { size: 0.16 });
  const brickPaint = scales(BRICK, MORTAR, { size: 0.09 });
  const grassPaint = mottle("#4f9e3b", "#8bd057", { size: 0.45 });
  const canopyPaint = mottle("#2c7a3a", "#6cc24a", { size: 0.55 });
  const bushPaint = mottle("#3d8f3c", "#93d35e", { size: 0.22 });

  // ---- textures
  const leaf = (fill: string, vein: string) =>
    svg(
      `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">` +
        `<path d="M20 58C4 44 4 18 20 3C36 18 36 44 20 58Z" fill="${fill}"/>` +
        `<path d="M20 55V9M20 27L11 19M20 37L29 29" fill="none" stroke="${vein}" stroke-width="2.2" stroke-linecap="round"/>` +
        `</svg>`,
      { size: 128 },
    );
  const blade = (fill: string) =>
    svg(
      `<svg viewBox="0 0 24 48" xmlns="http://www.w3.org/2000/svg"><path d="M9 48Q2 24 12 0Q14 26 16 48Z" fill="${fill}"/></svg>`,
      { size: 96 },
    );
  const sign = svg(
    `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">` +
      `<rect x="3" y="3" width="194" height="54" rx="10" fill="#fff3d1" stroke="${BARK_DARK}" stroke-width="5"/>` +
      `<text x="100" y="40" text-anchor="middle" font-family="Georgia, serif" font-size="25" font-weight="bold" fill="${BARK_DARK}">TREE HOUSE</text>` +
      `</svg>`,
    { size: 256 },
  );
  const leaves = [
    leaf("#5fb95a", "#2f7d3a"),
    leaf("#3f9d4b", "#23602d"),
    leaf("#8ccb5c", "#4f9a35"),
    leaf("#2f8a52", "#1d5c37"),
  ];

  // ---- ground: a grassy mound with bushes and grass blades
  const mound = b.lathe(
    [
      [0, 0],
      [2.6, 0],
      [2.45, 0.1],
      [1.9, 0.18],
      [0.9, 0.23],
      [0, 0.23],
    ],
    { ...on, at: [0, 0, 0], segments: 20, color: grassPaint },
  );
  b.cards(
    b.surface(mound).scatter(170, {
      rng: rng(41),
      minDist: 0.08,
      filter: (h) => h.n.y > 0.6 && Math.hypot(h.at.x, h.at.z + 1.05) > 0.7,
    }),
    [blade("#7fcc4f"), blade("#4f9e3b")],
    { size: [0.08, 0.16], vary: 0.3, rng: rng(42), color: "#ffffff" },
  );

  const bushList: [number, number, number, number][] = [
    [-2.3, 0.42, -1.3, 0.42],
    [2.4, 0.38, -1.6, 0.38],
    [2.15, 0.36, 2.0, 0.36],
    [-2.05, 0.34, 2.1, 0.34],
  ];
  const bushes: Part[] = bushList.map(([x, y, z, r]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), bushPaint, { ...on, at: [x, y, z], flat: true }),
  );
  b.surface(bushes)
    .scatter(30, { rng: rng(31), minDist: 0.13, filter: (h) => h.n.y > 0.1 })
    .forEach((h, i) => {
      b.stick(new THREE.SphereGeometry(0.05, 6, 4), FLOWERS[i % FLOWERS.length], h, { embed: 0.35, flat: true });
    });

  // ---- tree: trunk, roots and the limbs that carry the deck and the swing
  b.sweep(
    catmull([
      [0, 0, -1.05],
      [0, 1.5, -1.1],
      [0.02, 3.0, -1.1],
      [0.08, 4.6, -1.0],
      [0.13, 6.2, -0.9],
      [0.16, 7.2, -0.85],
    ]),
    (t) => 0.46 - 0.3 * t,
    { ...on, color: barkPaint, caps: { start: "flat", end: "round" } },
  );
  b.sweep(
    catmull([
      [0.15, 0.18, -0.9],
      [0.75, 0.12, -1.05],
      [1.5, 0.06, -0.8],
    ]),
    [0.13, 0.03],
    { ...on, color: barkPaint },
  );
  b.sweep(
    catmull([
      [-0.15, 0.18, -0.9],
      [-0.9, 0.1, -1.3],
      [-1.6, 0.04, -1.1],
    ]),
    [0.12, 0.03],
    { ...on, color: barkPaint },
  );
  b.sweep(
    catmull([
      [0, 0.18, -0.6],
      [0.15, 0.1, 0.3],
      [0.25, 0.05, 1.0],
    ]),
    [0.11, 0.03],
    { ...on, color: barkPaint },
  );
  b.sweep(
    catmull([
      [-0.05, 2.6, -1.15],
      [-0.8, 2.9, -1.1],
      [-1.6, 3.2, -0.95],
      [-2.3, 3.9, -0.9],
      [-2.8, 4.4, -0.9],
    ]),
    [0.13, 0.05],
    { ...on, color: barkPaint },
  );
  b.sweep(
    catmull([
      [0.05, 2.7, -1.15],
      [0.8, 3.0, -1.1],
      [1.6, 3.2, -0.95],
      [2.3, 3.8, -0.9],
      [2.8, 4.3, -0.85],
    ]),
    [0.13, 0.05],
    { ...on, color: barkPaint },
  );
  b.sweep(
    catmull([
      [0.1, 4.35, -1.0],
      [1.2, 4.6, -1.1],
      [2.3, 4.68, -1.0],
      [3.0, 4.5, -0.95],
    ]),
    [0.1, 0.04],
    { ...on, color: barkPaint },
  );

  // ---- canopy: leafy clumps, then leaf cards scattered over them
  const clumps: [number, number, number, number][] = [
    [0.0, 6.9, -1.4, 1.35],
    [-1.5, 6.1, -1.3, 1.1],
    [1.6, 6.2, -1.2, 1.15],
    [-0.7, 7.9, -1.6, 0.95],
    [1.1, 7.8, -1.5, 0.9],
    [0.2, 8.1, -0.6, 0.7],
    [-2.5, 4.5, -1.1, 1.0],
    [2.7, 4.2, -1.4, 1.0],
    [-2.6, 3.4, 0.4, 0.8],
    [2.4, 2.9, 1.6, 0.6],
  ];
  const canopy: Part[] = clumps.map(([x, y, z, r]) =>
    b.part(new THREE.SphereGeometry(r, 9, 6), canopyPaint, { ...on, at: [x, y, z], flat: true }),
  );
  b.cards(
    b.surface(canopy).scatter(460, { rng: rng(11), minDist: 0.09, filter: (h) => h.n.y > -0.6 }),
    leaves,
    { size: [0.2, 0.3], lean: 40, bend: 25, vary: 0.3, rng: rng(12), color: "#ffffff" },
  );

  // ---- deck
  b.part(new THREE.BoxGeometry(3.4, 0.12, 2.7), deckPaint, { ...on, at: [0, 3.24, 0.35] });

  // railings: left side, right side, and the front-right run beside the door
  const rail = (a: [number, number], c: [number, number]) => {
    const n = Math.max(2, Math.round(Math.hypot(c[0] - a[0], c[1] - a[1]) / 0.45));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = a[0] + (c[0] - a[0]) * t;
      const z = a[1] + (c[1] - a[1]) * t;
      b.rod([x, 3.3, z], [x, 4.0, z], { ...on, radius: 0.03, color: RAIL });
    }
    b.rod([a[0], 4.0, a[1]], [c[0], 4.0, c[1]], { ...on, radius: 0.035, color: RAIL });
    b.rod([a[0], 3.65, a[1]], [c[0], 3.65, c[1]], { ...on, radius: 0.02, color: RAIL });
  };
  rail([-1.65, -0.9], [-1.65, 1.65]);
  rail([1.65, -0.9], [1.65, 1.65]);
  rail([0.5, 1.65], [1.65, 1.65]);

  // ---- cabin
  b.part(new THREE.BoxGeometry(2.4, 2.05, 1.9), wallPaint, { ...on, at: [0, 4.325, 0.35] });

  // gable ends (front and back)
  for (const z of [1.3, -0.6]) {
    b.extrude(
      [
        [-1.2, 5.35],
        [1.2, 5.35],
        [1.2, 5.46],
        [0, 6.38],
      ],
      { ...on, at: [0, 0, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.1, color: wallPaint },
    );
  }

  // roof: two slabs meeting at a ridge
  const pitch = Math.atan2(1.2, 1.5);
  const deg = (pitch * 180) / Math.PI;
  const sp = Math.sin(pitch);
  const cp = Math.cos(pitch);
  const thick = 0.14;
  for (const k of [1, -1]) {
    b.part(new THREE.BoxGeometry(2.05, thick, 2.6), roofPaint, {
      ...on,
      at: [k * (0.75 - (thick / 2) * sp), 5.9 - (thick / 2) * cp, 0.35],
      rotation: [0, 0, -k * deg],
    });
  }
  b.part(new THREE.BoxGeometry(0.16, 0.1, 2.7), ROOF_DARK, { ...on, at: [0, 6.5, 0.35] });

  // chimney
  b.part(new THREE.BoxGeometry(0.34, 1.7, 0.34), brickPaint, { ...on, at: [0.8, 6.05, -0.1] });
  b.part(new THREE.BoxGeometry(0.44, 0.08, 0.44), DARK, { ...on, at: [0.8, 6.94, -0.1] });

  // porthole in the front gable
  b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 14), TRIM, { ...on, at: [0, 5.85, 1.36], rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.07, 14), GLASS, { ...on, at: [0, 5.85, 1.38], rotation: [90, 0, 0] });
  b.part(new THREE.BoxGeometry(0.3, 0.035, 0.04), TRIM, { ...on, at: [0, 5.85, 1.42] });
  b.part(new THREE.BoxGeometry(0.035, 0.3, 0.04), TRIM, { ...on, at: [0, 5.85, 1.42] });

  // door with a glowing pane, a welcome sign and a brass knob
  b.part(new THREE.BoxGeometry(0.84, 1.82, 0.06), TRIM, { ...on, at: [0, 4.21, 1.33] });
  b.part(new THREE.BoxGeometry(0.72, 1.7, 0.08), DOOR, { ...on, at: [0, 4.15, 1.37] });
  b.part(new THREE.BoxGeometry(0.3, 0.42, 0.02), GLOW, { ...on, at: [0, 4.55, 1.415] });
  b.part(new THREE.PlaneGeometry(0.42, 0.126), "#ffffff", {
    ...on,
    at: [0, 3.98, 1.43],
    dir: [0, 0, 1],
    axis: "z",
    texture: sign,
  });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), BRASS, { ...on, at: [0.26, 3.75, 1.43] });

  // front windows with window boxes
  for (const x of [-0.8, 0.8]) {
    b.part(new THREE.BoxGeometry(0.66, 0.66, 0.06), TRIM, { ...on, at: [x, 4.3, 1.33] });
    b.part(new THREE.BoxGeometry(0.5, 0.5, 0.07), GLASS, { ...on, at: [x, 4.3, 1.37] });
    b.part(new THREE.BoxGeometry(0.5, 0.05, 0.05), TRIM, { ...on, at: [x, 4.3, 1.4] });
    b.part(new THREE.BoxGeometry(0.05, 0.5, 0.05), TRIM, { ...on, at: [x, 4.3, 1.4] });
    b.part(new THREE.BoxGeometry(0.76, 0.2, 0.26), DECK_DARK, { ...on, at: [x, 3.86, 1.43] });
    for (const dx of [-0.26, 0, 0.26]) {
      b.part(new THREE.SphereGeometry(0.1, 7, 5), bushPaint, { ...on, at: [x + dx, 3.98, 1.43], flat: true });
    }
    for (let i = 0; i < 7; i++) {
      const fx = x + (i - 3) * 0.1 + (R() - 0.5) * 0.03;
      const fy = 4.06 + R() * 0.05;
      b.part(new THREE.SphereGeometry(0.055, 6, 4), FLOWERS[i % FLOWERS.length], { ...on, at: [fx, fy, 1.43] });
    }
  }

  // side windows
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.06, 0.66, 0.66), TRIM, { ...on, at: [s * 1.23, 4.3, 0.35] });
    b.part(new THREE.BoxGeometry(0.07, 0.5, 0.5), GLASS, { ...on, at: [s * 1.25, 4.3, 0.35] });
    b.part(new THREE.BoxGeometry(0.08, 0.05, 0.5), TRIM, { ...on, at: [s * 1.28, 4.3, 0.35] });
    b.part(new THREE.BoxGeometry(0.08, 0.5, 0.05), TRIM, { ...on, at: [s * 1.28, 4.3, 0.35] });
  }

  // hanging lanterns at the front corners
  for (const s of [-1, 1]) {
    const x = s * 1.42;
    b.rod([x, 5.3, 1.55], [x, 4.94, 1.55], { ...on, radius: 0.012, color: DARK });
    b.lathe(
      [
        [0, -0.12],
        [0.08, -0.12],
        [0.11, 0],
        [0.08, 0.1],
        [0, 0.12],
      ],
      { ...on, at: [x, 4.82, 1.55], segments: 6, color: LANTERN },
    );
  }

  // flagpole on the ridge with a swallowtail flag
  b.rod([0, 6.5, 0.9], [0, 7.9, 0.9], { ...on, radius: 0.025, color: DARK });
  b.extrude(
    [
      [0, 0],
      [0.85, 0.1],
      [0.66, 0.25],
      [0.85, 0.4],
      [0, 0.5],
    ],
    { ...on, at: [0, 7.35, 0.9], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: FLAG },
  );

  // a potted plant on the deck
  b.lathe(
    [
      [0, 0],
      [0.13, 0],
      [0.17, 0.2],
      [0.19, 0.32],
      [0.17, 0.36],
      [0, 0.36],
    ],
    { ...on, at: [1.43, 3.3, 1.46], segments: 10, color: POT },
  );
  b.part(new THREE.SphereGeometry(0.18, 8, 6), bushPaint, { ...on, at: [1.43, 3.8, 1.46], flat: true });
  b.part(new THREE.SphereGeometry(0.13, 7, 5), bushPaint, { ...on, at: [1.3, 3.92, 1.4], flat: true });
  b.part(new THREE.SphereGeometry(0.12, 7, 5), bushPaint, { ...on, at: [1.56, 3.95, 1.55], flat: true });
  b.part(new THREE.SphereGeometry(0.05, 6, 4), PINK, { ...on, at: [1.38, 4.02, 1.52] });
  b.part(new THREE.SphereGeometry(0.05, 6, 4), YELLOW, { ...on, at: [1.5, 4.04, 1.36] });

  // a blue jay on the right railing
  const bx = 1.65;
  const by = 4.1;
  const bz = 0.2;
  b.part(new THREE.SphereGeometry(0.08, 8, 6).scale(1, 0.9, 1.25), JAY, { ...on, at: [bx, by, bz] });
  b.part(new THREE.SphereGeometry(0.055, 7, 5), JAY, { ...on, at: [bx, by + 0.1, bz + 0.08] });
  b.part(new THREE.BoxGeometry(0.03, 0.07, 0.12), DARK, { ...on, at: [bx + 0.08, by + 0.01, bz - 0.02] });
  b.part(new THREE.BoxGeometry(0.05, 0.02, 0.14), JAY, {
    ...on,
    at: [bx, by - 0.01, bz - 0.16],
    rotation: [-15, 0, 0],
  });
  b.spike([bx, by + 0.1, bz + 0.13], [0, 0, 1], 0.05, 0.016, { ...on, color: BEAK });

  // wooden ladder from the ground up to the deck's front-left edge
  const lx = -1.25;
  for (const dx of [-0.18, 0.18]) {
    b.rod([lx + dx, 0.02, 2.75], [lx + dx, 3.45, 1.55], { ...on, radius: 0.035, color: RUNG });
  }
  for (let i = 1; i <= 11; i++) {
    const u = i / 12;
    const y = 0.02 + (3.45 - 0.02) * u;
    const z = 2.75 + (1.55 - 2.75) * u;
    b.rod([lx - 0.18, y, z], [lx + 0.18, y, z], { ...on, radius: 0.022, color: RUNG });
  }

  // rope swing hanging from the high limb
  b.part(new THREE.BoxGeometry(0.5, 0.05, 0.3), PLANK, { ...on, at: [2.525, 2.3, -1.0] });
  for (const x of [2.3, 2.75]) {
    const topY = x < 2.5 ? 4.68 : 4.56;
    for (const z of [-1.05, -0.95]) {
      b.rod([x, topY, z], [x, 2.33, z], { ...on, radius: 0.014, color: ROPE });
    }
  }

  return b.root;
}
```