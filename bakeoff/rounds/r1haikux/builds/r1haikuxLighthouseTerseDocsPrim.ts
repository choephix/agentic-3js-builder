import * as THREE from "three";
import { createBuilder, mottle, paint, rng, svg } from "../../../../src/index";

export const meta = {
  name: "lighthouse",
  description:
    "A red-and-white banded lighthouse with a glowing lantern and a gull on the gallery, on a tiny rocky islet with a keeper's cottage, a flagpole, a rowboat and a reef.",
};

// Palette
const SEA_DEEP = "#1d6e95";
const SEA_LIGHT = "#3fa6c8";
const FOAM = "#eef8f6";
const SAND = "#e6d3a0";
const GRASS = "#6f9f47";
const BUSH = "#4a7a3a";
const ROCK = "#8f877b";
const ROCK_DARK = "#625c55";
const STONE = "#c4bdb0";
const WHITE = "#f6f3ec";
const RED = "#c83c2f";
const IRON = "#2c3138";
const GLASS = "#22303f";
const SLATE = "#4d5a6b";
const BRICK = "#8e4b37";
const WOOD = "#6b4327";
const LAMP = "#ffe07a";
const WINDOW = "#ffd27a";
const BEAM = "#fff4c4";
const BRASS = "#dcae4c";
const GULL = "#9ba8b5";
const BEAK = "#e5a13a";

const rad = (deg: number) => (deg * Math.PI) / 180;

// Top of the islet: radius from the axis -> height. Seats the buildings and bushes on it.
const TOP: [number, number][] = [
  [0, 2.03],
  [1.0, 1.98],
  [2.0, 1.82],
  [3.1, 1.58],
  [4.1, 1.25],
  [4.75, 0.95],
  [4.9, 0.6],
];

function groundAt(x: number, z: number): number {
  const r = Math.hypot(x, z);
  for (let i = 0; i < TOP.length - 1; i++) {
    const [r0, y0] = TOP[i];
    const [r1, y1] = TOP[i + 1];
    if (r <= r1) return y0 + ((y1 - y0) * (Math.max(r, r0) - r0)) / (r1 - r0);
  }
  return TOP[TOP.length - 1][1];
}

// Tower: foot on the stone plinth, top under the gallery deck.
const FOOT_Y = 2.5;
const DECK_Y = 12.6;
const R_FOOT = 1.9;
const R_TOP = 1.25;
const towerR = (y: number) => R_FOOT + ((R_TOP - R_FOOT) * (y - FOOT_Y)) / (DECK_Y - FOOT_Y);
const LANTERN_Y = 13.7;

export default function build() {
  const b = createBuilder({ name: "lighthouse" });
  const rand = rng(8);

  // Skeleton: the islet is the root; the lantern (beam included) and the flag turn on their own joints.
  const island = b.joint("island", { at: [0, 0, 0] });
  const lantern = b.joint("lantern", { parent: island, at: [0, LANTERN_Y, 0] });
  const flag = b.joint("flag", { parent: island, at: [-1.0, 3.75, 3.2] });

  // Plain parts sit on the islet's bone, flat-shaded for the faceted look.
  const put = (geo: THREE.BufferGeometry, color: string, opts: object = {}) =>
    b.part(geo, color, { bone: island, flat: true, ...opts });
  const lamp = { bone: lantern, group: "lantern" };

  // ---- Sea -----------------------------------------------------------------
  b.lathe(
    [[0, 0, "sharp"], [6.6, 0], [6.95, 0.22], [6.75, 0.42], [6.2, 0.5], [0, 0.5, "sharp"]],
    {
      at: [0, 0, 0],
      segments: 14,
      smoothing: 1,
      color: mottle(SEA_DEEP, SEA_LIGHT, { size: 1.6, contrast: 0.7, seed: 11 }),
      bone: island,
      group: "sea",
    },
  );

  const FOAMS: [number, number][] = [
    [6.08, 0.12],
    [5.05, 0.09],
  ];
  for (const [radius, tube] of FOAMS) {
    put(new THREE.TorusGeometry(radius, tube, 4, 30), FOAM, {
      at: [0, 0.5, 0],
      rotation: [90, 0, 0],
      group: "surf",
    });
  }

  for (const deg of [165, 205, 255, 300, 335]) {
    const a = rad(deg);
    const r = 5.5 + (rand() - 0.5) * 0.4;
    const size = 0.3 + rand() * 0.2;
    const tone = rand() > 0.5 ? ROCK : ROCK_DARK;
    put(new THREE.DodecahedronGeometry(size, 0), tone, {
      at: [Math.sin(a) * r, 0.46, Math.cos(a) * r],
      rotation: [rand() * 360, rand() * 360, rand() * 360],
      group: "reef",
    });
  }

  // ---- Islet -----------------------------------------------------------------
  const rockPaint = mottle(ROCK, ROCK_DARK, { size: 0.6, contrast: 0.6, seed: 5 });
  const islandPaint = paint((p, n) => (p.y < 0.78 ? SAND : n.y > 0.4 ? GRASS : rockPaint));
  const islandPart = b.lathe(
    [
      [0, 0.2, "sharp"],
      [4.5, 0.2],
      [4.9, 0.6],
      [4.75, 0.95],
      [4.1, 1.25],
      [3.1, 1.58],
      [2.0, 1.82],
      [1.0, 1.98],
      [0, 2.03, "sharp"],
    ],
    { at: [0, 0, 0], segments: 10, smoothing: 1, color: islandPaint, bone: island, group: "island" },
  );

  // Grass tufts on the top of the islet, kept clear of the buildings.
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M5 32 Q8 16 2 5 Q12 15 14 32 Z" fill="#7aaa4a"/>
      <path d="M12 32 Q13 11 11 1 Q19 12 20 32 Z" fill="#94c25e"/>
      <path d="M19 32 Q23 17 30 9 Q24 19 27 32 Z" fill="#679a43"/>
    </svg>`,
    { size: 128 },
  );
  const clear = (x: number, z: number) =>
    Math.hypot(x, z) > 2.7 && Math.hypot(x + 3.0, z - 0.2) > 1.3 && Math.hypot(x + 1.0, z - 3.2) > 0.6;
  const tufts = b.surface(islandPart).scatter(70, {
    rng: rng(12),
    minDist: 0.42,
    filter: (h) => h.n.y > 0.55 && clear(h.at.x, h.at.z),
  });
  b.cards(tufts, tuft, { size: [0.16, 0.28], lean: 12, cross: true, vary: 0.3, rng: rng(13) });

  const BUSHES: [number, number, number][] = [
    [-4.4, -0.9, 0.3],
    [-3.7, -1.9, 0.26],
    [1.9, -2.4, 0.3],
    [-1.6, -2.9, 0.24],
  ];
  for (const [x, z, r] of BUSHES) {
    put(new THREE.SphereGeometry(r, 7, 5), BUSH, {
      at: [x, groundAt(x, z) + 0.2 * r, z],
      scale: [1, 0.75, 1],
      group: "bush",
    });
  }

  // ---- Tower -----------------------------------------------------------------
  put(new THREE.CylinderGeometry(2.3, 2.5, 1.0, 12), STONE, { at: [0, 2.0, 0], group: "base" });

  const bands: [number, number, string][] = [
    [FOOT_Y, 4.6, WHITE],
    [4.6, 6.6, RED],
    [6.6, 8.6, WHITE],
    [8.6, 10.6, RED],
    [10.6, DECK_Y, WHITE],
  ];
  for (const [y0, y1, c] of bands) {
    put(new THREE.CylinderGeometry(towerR(y1), towerR(y0), y1 - y0, 12), c, {
      at: [0, (y0 + y1) / 2, 0],
      group: "tower",
    });
  }

  // A box stuck to the tower wall at compass angle deg (0 = the front, +Z).
  const onTower = (deg: number, y: number, w: number, h: number, out: number, color: string) => {
    const depth = 0.16;
    const r = towerR(y) + out - depth / 2;
    put(new THREE.BoxGeometry(w, h, depth), color, {
      at: [Math.sin(rad(deg)) * r, y, Math.cos(rad(deg)) * r],
      rotation: [0, deg, 0],
      group: "tower",
    });
  };

  // Door in a white surround, then two rows of windows.
  onTower(0, 3.05, 0.62, 1.1, 0.05, WHITE);
  onTower(0, 3.0, 0.46, 1.0, 0.03, WOOD);
  for (const deg of [0, 90, 180, 270]) {
    onTower(deg, 5.6, 0.34, 0.56, 0.05, WHITE);
    onTower(deg, 5.6, 0.22, 0.42, 0.03, GLASS);
  }
  for (const deg of [45, 135, 225, 315]) {
    onTower(deg, 9.6, 0.34, 0.56, 0.05, WHITE);
    onTower(deg, 9.6, 0.22, 0.42, 0.03, GLASS);
  }

  // ---- Gallery -----------------------------------------------------------------
  put(new THREE.CylinderGeometry(1.95, 1.9, 0.35, 12), IRON, { at: [0, 12.625, 0], group: "gallery" });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    put(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 4), IRON, {
      at: [Math.sin(a) * 1.83, 13.15, Math.cos(a) * 1.83],
      group: "gallery",
    });
  }
  put(new THREE.TorusGeometry(1.83, 0.045, 4, 36), IRON, {
    at: [0, 13.5, 0],
    rotation: [90, 0, 0],
    group: "gallery",
  });

  // ---- Lantern (rides the lantern joint) ----------------------------------------
  put(new THREE.CylinderGeometry(1.12, 1.12, 0.14, 8), IRON, { ...lamp, at: [0, 12.86, 0] });
  put(new THREE.CylinderGeometry(0.92, 0.92, 1.66, 8), LAMP, { ...lamp, at: [0, LANTERN_Y, 0] });
  for (let i = 0; i < 8; i++) {
    const a = rad(i * 45);
    put(new THREE.BoxGeometry(0.1, 1.76, 0.1), IRON, {
      ...lamp,
      at: [Math.sin(a) * 0.98, LANTERN_Y, Math.cos(a) * 0.98],
    });
  }
  put(new THREE.CylinderGeometry(1.12, 1.12, 0.14, 8), IRON, { ...lamp, at: [0, 14.6, 0] });
  b.lathe(
    [
      [0, 14.64, "sharp"],
      [1.2, 14.64],
      [1.15, 14.79],
      [0.97, 14.95],
      [0.62, 15.09],
      [0.26, 15.16],
      [0, 15.19, "sharp"],
    ],
    { at: [0, 0, 0], segments: 8, smoothing: 1, color: RED, bone: lantern, group: "lantern" },
  );
  put(new THREE.SphereGeometry(0.16, 8, 6), BRASS, { ...lamp, at: [0, 15.3, 0] });
  put(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 4), IRON, { ...lamp, at: [0, 15.75, 0] });

  // The beam: a flat wedge reaching out in front of the lantern.
  b.extrude(
    [
      [0.9, -0.1],
      [6.0, -1.7],
      [6.0, 1.7],
      [0.9, 0.1],
    ],
    {
      at: [0, LANTERN_Y, 0],
      x: [0, 0, 1],
      y: [1, 0, 0],
      thickness: 0.08,
      color: BEAM,
      bone: lantern,
      group: "lantern",
    },
  );

  // ---- Gull perched on the gallery deck --------------------------------------------
  const gull = (deg: number, r: number) => {
    const a = rad(deg);
    const fwd = [Math.sin(a), 0, Math.cos(a)];
    const right = [Math.cos(a), 0, -Math.sin(a)];
    const base = [Math.sin(a) * r, 12.8, Math.cos(a) * r];
    // side across the bird, up, and along it (forward), from its feet
    const P = (side: number, up: number, along: number): number[] => [
      base[0] + right[0] * side + fwd[0] * along,
      base[1] + up,
      base[2] + right[2] * side + fwd[2] * along,
    ];
    const turn: [number, number, number] = [0, deg, 0];
    put(new THREE.SphereGeometry(0.12, 8, 6), WHITE, {
      at: P(0, 0.1, 0),
      rotation: turn,
      scale: [0.85, 0.8, 1.6],
      group: "gull",
    });
    put(new THREE.SphereGeometry(0.07, 7, 5), WHITE, { at: P(0, 0.21, 0.14), group: "gull" });
    put(new THREE.ConeGeometry(0.028, 0.12, 4), BEAK, { at: P(0, 0.21, 0.22), dir: fwd, group: "gull" });
    for (const s of [1, -1]) {
      put(new THREE.SphereGeometry(0.016, 5, 4), IRON, { at: P(s * 0.065, 0.22, 0.14), group: "gull" });
      b.extrude(
        [
          [0.1, 0.06],
          [-0.16, 0.08],
          [-0.4, 0, "sharp"],
          [-0.14, -0.03],
          [0.1, -0.02],
        ],
        {
          at: P(s * 0.1, 0.11, 0),
          x: fwd,
          y: [0, 1, 0],
          thickness: 0.025,
          color: GULL,
          bone: island,
          group: "gull",
        },
      );
    }
  };
  gull(-25, 1.45);

  // ---- Keeper's cottage -----------------------------------------------------------------
  const CX = -3.0;
  const CZ = 0.2;
  put(new THREE.BoxGeometry(1.8, 1.5, 1.5), WHITE, { at: [CX, 1.75, CZ], group: "cottage" });
  for (const z of [CZ + 0.78, CZ - 0.78]) {
    b.extrude(
      [
        [-0.9, 0],
        [0.9, 0],
        [0, 0.8],
      ],
      { at: [CX, 2.5, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.06, color: WHITE, bone: island, group: "cottage" },
    );
  }
  const pitch = Math.atan2(0.8, 0.9) * (180 / Math.PI);
  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(1.26, 0.08, 1.7), SLATE, {
      at: [CX + s * 0.45, 2.9, CZ],
      rotation: [0, 0, -s * pitch],
      group: "cottage",
    });
  }
  put(new THREE.BoxGeometry(0.24, 0.9, 0.24), BRICK, { at: [CX + 0.55, 3.2, CZ - 0.35], group: "cottage" });
  put(new THREE.BoxGeometry(0.3, 0.08, 0.3), IRON, { at: [CX + 0.55, 3.66, CZ - 0.35], group: "cottage" });
  put(new THREE.BoxGeometry(0.34, 0.64, 0.08), WOOD, { at: [CX, 1.72, CZ + 0.76], group: "cottage" });
  put(new THREE.BoxGeometry(0.46, 0.08, 0.08), WHITE, { at: [CX, 2.08, CZ + 0.77], group: "cottage" });
  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(0.4, 0.46, 0.06), WHITE, {
      at: [CX + s * 0.58, 2.05, CZ + 0.78],
      group: "cottage",
    });
    put(new THREE.BoxGeometry(0.3, 0.36, 0.08), WINDOW, {
      at: [CX + s * 0.58, 2.05, CZ + 0.75],
      group: "cottage",
    });
  }

  // ---- Flagpole and flag ------------------------------------------------------------------
  const poleBase = groundAt(-1.0, 3.2) - 0.1;
  put(new THREE.CylinderGeometry(0.035, 0.045, 2.9, 6), IRON, {
    at: [-1.0, poleBase + 1.45, 3.2],
    group: "flag",
  });
  b.extrude(
    [
      [0, 0],
      [0.5, 0.03],
      [0.92, 0],
      [0.8, 0.22],
      [0.93, 0.44],
      [0.5, 0.42],
      [0, 0.44],
    ],
    {
      at: [-0.96, 3.75, 3.2],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      color: paint((_p, _n, s) => (s[1] > 0.22 ? RED : WHITE)),
      bone: flag,
      group: "flag",
    },
  );

  // ---- Rowboat on the sea -----------------------------------------------------------------------
  b.extrude(
    [
      [-0.9, 0.3],
      [-0.8, 0],
      [0.7, 0],
      [1.0, 0.3, "sharp"],
    ],
    {
      at: [3.6, 0.44, 4.2],
      x: [0.76, 0, -0.65],
      y: [0, 1, 0],
      thickness: [0.42, 0.62],
      color: paint((_p, _n, s) => (s[1] > 0.2 ? WHITE : RED)),
      bone: island,
      group: "boat",
    },
  );

  return b.root;
}
