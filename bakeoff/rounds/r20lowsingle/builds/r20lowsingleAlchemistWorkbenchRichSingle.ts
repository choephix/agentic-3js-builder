import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "A cel-shaded alchemist's workbench with a bookshelf back, potions, a balance scale, an alembic, a mortar, books, drying herbs, a cauldron and a gold-trimmed rug.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type C = string | Paint;
type O = { rotation?: number[]; name?: string; scale?: number[]; flat?: boolean };

// ---------------------------------------------------------------- palette
const WOOD = cel(grain("#b0703c", "#935a2e", { size: 0.018, axis: "x" }));
const WOOD_V = cel(grain("#b0703c", "#935a2e", { size: 0.018, axis: "y" }));
const WOOD_DK = cel(grain("#7e4a28", "#6a3c20", { size: 0.018, axis: "x" }));
const WOOD_TOP = cel(grain("#cf9150", "#b6773c", { size: 0.02, axis: "x" }));
const STONE = cel("#aaa6bd");
const IRON = cel("#4a4560");
const CLOTH = cel("#d3ab6c");
const RUNNER = cel("#6a3fb5");
const TERRA = cel("#d9794a");
const GOLD = "#f2c14e";
const GOLD_DK = "#c8922a";
const CREAM = "#fff1cf";
const PAGE = "#f6e6bd";
const TEAL = "#2fb5b0";
const NAVY = "#2b3a7a";
const PURPLE = "#7a4bc2";
const ROSE = "#e8648a";
const RED = "#d9473f";
const GREEN = "#58b868";
const GLASS = "#cfeff2";
const CORK = "#c89a62";
const DRY = "#8a6a3a";
const SOIL = "#4a3022";
const AMBER = "#ffb23c";
const SKY = "#59b8ff";
const LIME = "#9be35a";
const FIRE = "#ff8a2a";
const BOOKS = [NAVY, "#a8324a", "#2a8a78", PURPLE, "#c9822a", "#3c6fb5"];

// ---------------------------------------------------------------- textures
const LEAF = svg(
  `<svg viewBox="0 0 32 64">
  <path d="M16 62 C2 44 4 16 16 2 C28 16 30 44 16 62Z" fill="#4fbf6a"/>
  <path d="M16 62 C28 44 28 16 16 2 C18 20 18 44 16 62Z" fill="#7fdc7a"/>
  <path d="M16 62 C16 40 16 20 16 6" stroke="#2c8a4e" stroke-width="2.2" fill="none"/>
  <path d="M16 50 L7 38 M16 40 L26 28 M16 30 L8 20" stroke="#2c8a4e" stroke-width="1.8" fill="none"/>
  </svg>`,
  { size: 128 },
);
const LAVENDER = svg(
  `<svg viewBox="0 0 24 64">
  <path d="M12 64 L12 10" stroke="#4a9a5a" stroke-width="2.4" fill="none"/>
  <ellipse cx="12" cy="8" rx="4" ry="6" fill="#9a6be0"/>
  <ellipse cx="7" cy="20" rx="4" ry="5.5" fill="#7a4bc2"/><ellipse cx="17" cy="22" rx="4" ry="5.5" fill="#b08af0"/>
  <ellipse cx="7" cy="34" rx="4" ry="5.5" fill="#b08af0"/><ellipse cx="17" cy="36" rx="4" ry="5.5" fill="#7a4bc2"/>
  <ellipse cx="8" cy="48" rx="3.6" ry="5" fill="#9a6be0"/><ellipse cx="16" cy="50" rx="3.6" ry="5" fill="#9a6be0"/>
  </svg>`,
  { size: 128 },
);
const FEATHER = svg(
  `<svg viewBox="0 0 32 96">
  <path d="M16 96 C-2 70 2 30 16 2 C30 30 34 70 16 96Z" fill="#fff6e0"/>
  <path d="M16 96 C34 70 30 30 16 2 C20 34 20 70 16 96Z" fill="#9fe0e8"/>
  <path d="M16 96 L16 6" stroke="#d9b45a" stroke-width="2.4" fill="none"/>
  </svg>`,
  { size: 128 },
);
const PAGES = svg(
  `<svg viewBox="0 0 100 130">
  <rect x="0" y="0" width="100" height="130" fill="#f6e6bd"/>
  <path d="M12 16 H88 M12 28 H78 M12 38 H88 M12 48 H70 M12 58 H88" stroke="#8a6a3a" stroke-width="1.8" fill="none"/>
  <circle cx="50" cy="92" r="16" fill="none" stroke="#b8872a" stroke-width="2"/>
  <path d="M50 78 L56 98 L40 86 L60 86 L44 98Z" fill="#7a4bc2"/>
  <path d="M12 118 H88" stroke="#8a6a3a" stroke-width="1.8" fill="none"/>
  </svg>`,
  { size: 512 },
);
const FILIGREE = svg(
  `<svg viewBox="0 0 100 12">
  <path d="M2 6 Q12 -2 22 6 T42 6 T62 6 T82 6 T98 6" stroke="#f2c14e" stroke-width="1.6" fill="none"/>
  <path d="M2 6 Q12 14 22 6 T42 6 T62 6 T82 6 T98 6" stroke="#c8922a" stroke-width="1.2" fill="none"/>
  <circle cx="22" cy="6" r="1.8" fill="#f2c14e"/><circle cx="42" cy="6" r="1.8" fill="#f2c14e"/>
  <circle cx="62" cy="6" r="1.8" fill="#f2c14e"/><circle cx="82" cy="6" r="1.8" fill="#f2c14e"/>
  <circle cx="50" cy="6" r="2.6" fill="#59b8ff"/>
  </svg>`,
  { size: 512 },
);
const RUG = svg(
  `<svg viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="96" fill="none" stroke="#f2c14e" stroke-width="4"/>
  <circle cx="100" cy="100" r="86" fill="none" stroke="#2fb5b0" stroke-width="3"/>
  <circle cx="100" cy="100" r="60" fill="none" stroke="#f2c14e" stroke-width="3"/>
  <polygon points="100,34 112,88 166,100 112,112 100,166 88,112 34,100 88,88" fill="#7a4bc2" stroke="#f2c14e" stroke-width="3"/>
  <polygon points="100,62 106,94 138,100 106,106 100,138 94,106 62,100 94,94" fill="#2fb5b0"/>
  <circle cx="100" cy="100" r="8" fill="#f2c14e"/>
  <g fill="#f2c14e">
  <circle cx="100" cy="14" r="4"/><circle cx="100" cy="186" r="4"/><circle cx="14" cy="100" r="4"/><circle cx="186" cy="100" r="4"/>
  <circle cx="39" cy="39" r="4"/><circle cx="161" cy="39" r="4"/><circle cx="39" cy="161" r="4"/><circle cx="161" cy="161" r="4"/>
  </g></svg>`,
  { size: 512 },
);
const label = (color: string) =>
  svg(
    `<svg viewBox="0 0 40 48">
  <rect x="2" y="2" width="36" height="44" rx="6" fill="#fff1cf" stroke="#f2c14e" stroke-width="3"/>
  <path d="M20 10 C10 22 12 36 20 38 C28 36 30 22 20 10Z" fill="${color}"/>
  <path d="M20 14 C16 22 17 30 20 33" stroke="#ffffff" stroke-width="2.4" fill="none"/>
  </svg>`,
    { size: 128 },
  );
const LABELS = [label("#2fb5b0"), label("#e8648a"), label("#7a4bc2"), label("#e0962a")];

export default function build() {
  const b = createBuilder({ name: "alchemistWorkbench" });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);
  const T = 0.88;

  // ------------------------------------------------------------ helpers
  const P = (g: THREE.BufferGeometry, color: C, at: number[], o: O = {}) => b.part(g, color, { at, ...o });
  const box = (sx: number, sy: number, sz: number, at: number[], color: C, o: O = {}) =>
    P(new THREE.BoxGeometry(sx, sy, sz), color, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, at: number[], color: C, o: O = {}) =>
    P(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, o);
  const ball = (r: number, at: number[], color: C, o: O = {}) => P(new THREE.SphereGeometry(r, 8, 6), color, at, o);
  const yb = (
    o: number[],
    yaw: number,
    l: number[],
    s: number[],
    color: C,
  ) => {
    const c = Math.cos((yaw * Math.PI) / 180);
    const sn = Math.sin((yaw * Math.PI) / 180);
    return box(s[0], s[1], s[2], [o[0] + l[0] * c + l[2] * sn, o[1] + l[1], o[2] - l[0] * sn + l[2] * c], color, {
      rotation: [0, yaw, 0],
    });
  };
  const so = (o: number[][], s: number): Array<[number, number]> => o.map(([x, y]): [number, number] => [x * s, y * s]);

  const book = (x: number, y: number, z: number, t: number, h: number, d: number, color: C, trim: C) => {
    const o = [x, y, z];
    yb(o, 0, [-(t / 2 - 0.0025), h / 2, 0], [0.005, h, d], color);
    yb(o, 0, [t / 2 - 0.0025, h / 2, 0], [0.005, h, d], color);
    yb(o, 0, [0, h / 2, d / 2 - 0.003], [t, h, 0.006], color);
    yb(o, 0, [0, h / 2, -0.003], [t - 0.012, h - 0.008, d - 0.012], PAGE);
    yb(o, 0, [0, h * 0.14, d / 2], [t + 0.002, 0.01, 0.004], trim);
    yb(o, 0, [0, h * 0.86, d / 2], [t + 0.002, 0.01, 0.004], trim);
    yb(o, 0, [0, h / 2, d / 2], [t * 0.7, h * 0.22, 0.004], trim);
  };
  const flatBook = (x: number, y: number, z: number, w: number, th: number, d: number, color: C, yaw: number) => {
    const o = [x, y, z];
    yb(o, yaw, [0, 0.003, 0], [w, 0.006, d], color);
    yb(o, yaw, [0, th - 0.003, 0], [w, 0.006, d], color);
    yb(o, yaw, [0.004, th / 2, 0], [w - 0.012, th - 0.012, d - 0.01], PAGE);
    yb(o, yaw, [-w / 2 + 0.003, th / 2, 0], [0.006, th, d], color);
    yb(o, yaw, [w * 0.15, th / 2, 0], [0.018, th + 0.004, d + 0.004], GOLD);
  };
  const row = (x0: number, y: number, z: number, n: number) => {
    let x = x0;
    for (let i = 0; i < n; i++) {
      const t = 0.03 + R() * 0.025;
      const h = 0.17 + R() * 0.08;
      book(x + t / 2, y, z, t, h, 0.17, BOOKS[i % BOOKS.length], i % 2 ? GOLD : CREAM);
      x += t + 0.002;
    }
    return x;
  };

  const PROFILES = [
    {
      body: [[0, 0], [0.5, 0], [0.9, 0.2], [1, 0.65], [0.85, 1.15], [0.45, 1.5], [0, 1.5]],
      neck: [[0, 1.45], [0.3, 1.45], [0.3, 2.3], [0.38, 2.4], [0, 2.4]],
      top: 2.4, ring: 1.85, lab: 0.75, lr: 1.0, lw: 0.8, lh: 0.9,
    },
    {
      body: [[0, 0], [0.6, 0], [0.72, 0.12], [0.72, 2.0], [0.5, 2.4], [0, 2.4]],
      neck: [[0, 2.35], [0.28, 2.35], [0.28, 3.0], [0.36, 3.1], [0, 3.1]],
      top: 3.1, ring: 2.6, lab: 1.2, lr: 0.72, lw: 0.6, lh: 0.8,
    },
    {
      body: [[0, 0], [0.4, 0], [0.8, 0.25], [1, 0.8], [0.8, 1.35], [0.4, 1.6], [0, 1.7]],
      neck: [[0, 1.65], [0.35, 1.65], [0.35, 2.2], [0.45, 2.3], [0, 2.3]],
      top: 2.3, ring: 1.95, lab: 0.8, lr: 1.0, lw: 0.8, lh: 0.9,
    },
  ];
  const potion = (x: number, y: number, z: number, r: number, kind: number, liquid: string, cap: string, lab = true) => {
    const p = PROFILES[kind];
    glow(b.lathe(so(p.body, r), { at: [x, y, z], color: liquid }), 1.1);
    b.lathe(so(p.neck, r), { at: [x, y, z], color: GLASS });
    cyl(0.4 * r, 0.4 * r, 0.1 * r, 8, [x, y + p.ring * r, z], GOLD);
    cyl(0.34 * r, 0.27 * r, 0.38 * r, 8, [x, y + (p.top + 0.14) * r, z], cap);
    ball(0.1 * r, [x, y + (p.top + 0.38) * r, z], GOLD);
    if (lab)
      P(new THREE.PlaneGeometry(p.lw * r, p.lh * r), "#ffffff", [x, y + p.lab * r, z + p.lr * r + 0.003], {
        texture: LABELS[Math.floor(R() * LABELS.length)],
      });
    glow(
      ball(1, [x - 0.5 * r, y + (p.lab + 0.45) * r, z + 0.78 * p.lr * r], "#ffffff", { scale: [0.09 * r, 0.26 * r, 0.05 * r] }),
      1,
    );
  };
  const crystals = (x: number, y: number, z: number, color: string) => {
    b.lathe(
      [[0, 0], [0.07, 0], [0.06, 0.03], [0.03, 0.045], [0, 0.045]],
      { at: [x, y, z], color: STONE },
    );
    const spec = [
      [0, 0, 0.035, 0, 0],
      [0.035, 0.01, 0.025, 0, 18],
      [-0.03, -0.015, 0.022, 0, -22],
      [0.005, -0.04, 0.018, 0, 30],
    ];
    for (const [dx, dz, r, , tilt] of spec)
      glow(
        P(new THREE.OctahedronGeometry(r, 0), color, [x + dx, y + 0.04 + r * 1.2, z + dz], {
          scale: [0.7, 1.7, 0.7],
          rotation: [0, 0, tilt],
          flat: true,
        }),
        1.2,
      );
  };
  const flame = (x: number, y: number, z: number, s: number) => {
    glow(P(new THREE.ConeGeometry(0.012 * s, 0.045 * s, 6), FIRE, [x, y + 0.022 * s, z]), 1.3);
    glow(P(new THREE.ConeGeometry(0.006 * s, 0.026 * s, 6), "#ffe27a", [x, y + 0.014 * s, z]), 1.3);
  };
  const plantAt = (x: number, y: number, z: number, n: number, size: number, tex: typeof LEAF, lean: number) => {
    const fr = [];
    for (let i = 0; i < n; i++) {
      const a = i * 2.4;
      fr.push(frame([x + 0.025 * Math.cos(a), y, z + 0.025 * Math.sin(a)], [0.4 * Math.cos(a), 1, 0.4 * Math.sin(a)]));
    }
    b.cards(fr, tex, {
      size: [size * 0.32, size],
      lean,
      flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
      vary: 0.3,
      rng: rng(5 + n),
    });
  };

  // ------------------------------------------------------------ rug and floor
  cyl(1.15, 1.15, 0.012, 24, [0.1, 0.006, 0.3], NAVY, { scale: [1, 1, 0.7] });
  P(new THREE.CircleGeometry(1.12, 32), "#ffffff", [0.1, 0.0135, 0.3], {
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: RUG,
    scale: [1, 0.7, 1],
  });

  // ------------------------------------------------------------ table frame
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      const rear = sz < 0;
      const h = rear ? 1.8 : 0.82;
      box(0.08, h, 0.08, [sx * 0.8, h / 2, sz * 0.3], WOOD_V);
      box(0.1, 0.03, 0.1, [sx * 0.8, 0.015, sz * 0.3], GOLD_DK);
      if (!rear) {
        box(0.095, 0.03, 0.095, [sx * 0.8, 0.79, sz * 0.3], GOLD_DK);
        ball(0.03, [sx * 0.8, 0.83, sz * 0.3], GOLD);
      }
    }
    box(0.04, 0.05, 0.56, [sx * 0.8, 0.5, 0], WOOD_DK);
  }
  box(1.74, 0.06, 0.74, [0, 0.85, 0], WOOD_TOP);
  box(1.76, 0.014, 0.012, [0, 0.882, 0.372], GOLD);
  box(1.76, 0.014, 0.012, [0, 0.882, -0.372], GOLD);
  for (const sx of [1, -1]) box(0.012, 0.014, 0.74, [sx * 0.875, 0.882, 0], GOLD);
  box(1.56, 0.1, 0.02, [0, 0.765, 0.31], WOOD);
  box(1.56, 0.1, 0.02, [0, 0.765, -0.31], WOOD);
  for (const sx of [1, -1]) {
    box(0.6, 0.08, 0.016, [sx * 0.3, 0.765, 0.328], WOOD_DK);
    box(0.62, 0.012, 0.01, [sx * 0.3, 0.808, 0.332], GOLD);
    box(0.62, 0.012, 0.01, [sx * 0.3, 0.722, 0.332], GOLD);
    P(new THREE.PlaneGeometry(0.5, 0.06), "#ffffff", [sx * 0.3, 0.765, 0.3365], { texture: FILIGREE });
    ball(0.016, [sx * 0.3, 0.765, 0.348], GOLD);
    box(0.03, 0.03, 0.006, [sx * 0.3, 0.765, 0.337], GOLD_DK);
  }
  box(1.56, 0.03, 0.6, [0, 0.25, 0], WOOD_DK);
  box(1.58, 0.012, 0.012, [0, 0.262, 0.302], GOLD);
  // table runner with tassels
  box(1.0, 0.006, 0.5, [0.1, 0.883, 0.1], RUNNER);
  box(1.0, 0.008, 0.02, [0.1, 0.884, 0.34], GOLD);
  box(1.0, 0.008, 0.02, [0.1, 0.884, -0.14], GOLD);
  for (let i = 0; i < 8; i++)
    P(new THREE.ConeGeometry(0.01, 0.05, 5), GOLD, [0.6 + 0.012, 0.86, -0.12 + i * 0.058 + 0.012], {
      rotation: [180, 0, 0],
    });

  // ------------------------------------------------------------ back shelf unit
  box(1.52, 0.84, 0.02, [0, 1.34, -0.33], WOOD_DK);
  for (const y of [1.18, 1.5]) {
    box(1.7, 0.03, 0.26, [0, y, -0.22], WOOD_TOP);
    box(1.7, 0.012, 0.012, [0, y + 0.006, -0.094], GOLD);
    for (const sx of [1, -1]) {
      box(0.03, 0.06, 0.2, [sx * 0.74, y - 0.045, -0.22], GOLD_DK);
    }
  }
  box(1.84, 0.05, 0.34, [0, 1.78, -0.2], WOOD);
  box(1.86, 0.012, 0.012, [0, 1.79, -0.03], GOLD);
  box(1.86, 0.012, 0.012, [0, 1.76, -0.03], GOLD);
  P(new THREE.PlaneGeometry(0.9, 0.1), "#ffffff", [0, 1.78, -0.0285], { texture: FILIGREE });
  for (const sx of [1, -1]) {
    ball(0.035, [sx * 0.8, 1.83, -0.3], GOLD);
    cyl(0.012, 0.02, 0.04, 6, [sx * 0.8, 1.815, -0.3], GOLD_DK);
  }

  // shelf 1 (top y 1.195)
  const s1 = 1.195;
  row(-0.74, s1, -0.2, 7);
  potion(-0.14, s1, -0.2, 0.05, 2, "#e8648a", RED);
  potion(0.0, s1, -0.2, 0.045, 2, "#59b8ff", GOLD_DK);
  crystals(0.22, s1, -0.2, SKY);
  // hourglass
  {
    const x = 0.5;
    cyl(0.05, 0.05, 0.012, 8, [x, s1 + 0.006, -0.2], GOLD);
    cyl(0.05, 0.05, 0.012, 8, [x, s1 + 0.134, -0.2], GOLD);
    for (let i = 0; i < 3; i++) {
      const a = (i * 2 * Math.PI) / 3;
      cyl(0.004, 0.004, 0.12, 5, [x + 0.04 * Math.cos(a), s1 + 0.07, -0.2 + 0.04 * Math.sin(a)], GOLD_DK);
    }
    glow(b.lathe([[0, 0], [0.04, 0], [0.008, 0.055], [0.04, 0.11], [0, 0.11]], { at: [x, s1 + 0.018, -0.2], color: "#ffd98a" }), 1);
  }
  flatBook(0.66, s1, -0.2, 0.16, 0.025, 0.12, "#a8324a", 10);
  flatBook(0.66, s1 + 0.025, -0.2, 0.14, 0.02, 0.11, NAVY, -14);
  ball(0.02, [0.66, s1 + 0.065, -0.2], TEAL);

  // shelf 2 (top y 1.515)
  const s2 = 1.515;
  const kinds = [0, 1, 2, 1, 0, 2];
  const liquids = [TEAL, ROSE, AMBER, LIME, PURPLE, SKY];
  const caps = [GOLD_DK, RED, CORK, NAVY, GOLD, CORK];
  for (let i = 0; i < 6; i++) potion(-0.72 + i * 0.1, s2, -0.2, 0.034 + (i % 2) * 0.006, kinds[i], liquids[i], caps[i]);
  // glowing orb on a stand
  b.lathe([[0, 0], [0.06, 0], [0.05, 0.015], [0.015, 0.04], [0.02, 0.07], [0.05, 0.085], [0, 0.085]], { at: [-0.04, s2, -0.2], color: GOLD });
  glow(ball(0.065, [-0.04, s2 + 0.145, -0.2], PURPLE), 1.3);
  for (let i = 0; i < 4; i++) {
    const a = i * 1.57 + 0.4;
    glow(P(new THREE.OctahedronGeometry(0.01, 0), GOLD, [-0.04 + 0.1 * Math.cos(a), s2 + 0.15 + 0.03 * i, -0.2 + 0.1 * Math.sin(a)]), 1.3);
  }
  const endX = row(0.18, s2, -0.2, 6);
  book(endX + 0.04, s2, -0.2, 0.035, 0.2, 0.17, "#2a8a78", GOLD);
  flatBook(0.72, s2 + 0.24, -0.2, 0.0001, 0.0001, 0.0001, GOLD, 0);

  // ------------------------------------------------------------ hanging herb bundles
  const hang = (x: number, z: number, tex: typeof LEAF, size: number) => {
    ball(0.007, [x, 1.162, z], IRON);
    b.rod([x, 1.16, z], [x, 1.1, z], 0.002, CREAM, { sides: 4 });
    cyl(0.01, 0.014, 0.06, 6, [x, 1.08, z], DRY);
    cyl(0.017, 0.017, 0.016, 8, [x, 1.045, z], RED);
    const fr = [];
    for (let i = 0; i < 6; i++) fr.push(frame([x + (R() - 0.5) * 0.02, 1.05, z + (R() - 0.5) * 0.02], [0, 1, 0]));
    b.cards(fr, tex, { size: [size * 0.35, size], lean: 180, flow: [0, 0, 1], cross: true, vary: 0.25, spin: 180, rng: rng(21 + Math.round(x * 100)) });
  };
  hang(0.1, -0.2, LEAF, 0.15);
  hang(0.28, -0.2, LAVENDER, 0.15);
  hang(0.46, -0.2, LEAF, 0.14);

  // ------------------------------------------------------------ balance scale
  {
    const cx = -0.05;
    const cz = 0.05;
    b.lathe([[0, 0], [0.1, 0], [0.1, 0.02], [0.06, 0.04], [0.04, 0.1], [0, 0.1]], { at: [cx, T, cz], color: GOLD_DK });
    cyl(0.012, 0.018, 0.3, 8, [cx, T + 0.19, cz], GOLD);
    ball(0.02, [cx, T + 0.35, cz], GOLD);
    box(0.52, 0.014, 0.016, [cx, T + 0.35, cz], GOLD, { rotation: [0, 0, -3.4] });
    box(0.004, 0.09, 0.004, [cx, T + 0.29, cz + 0.012], RED);
    const ends: Array<[number[], number]> = [
      [[cx + 0.25, T + 0.335, cz], 1],
      [[cx - 0.25, T + 0.365, cz], -1],
    ];
    for (const [e, side] of ends) {
      ball(0.012, e, GOLD);
      const py = e[1] - 0.19;
      b.lathe([[0, 0], [0.05, 0], [0.075, 0.02], [0.078, 0.025], [0.07, 0.025], [0.045, 0.008], [0, 0.008]], { at: [e[0], py, e[2]], color: GOLD });
      for (let k = 0; k < 3; k++) {
        const a = k * 2.09 + 0.5;
        b.rod(e, [e[0] + 0.07 * Math.cos(a), py + 0.026, e[2] + 0.07 * Math.sin(a)], 0.0025, GOLD_DK, { sides: 4 });
      }
      if (side > 0) {
        cyl(0.02, 0.02, 0.012, 8, [e[0] - 0.02, py + 0.014, e[2]], GOLD);
        cyl(0.014, 0.014, 0.014, 8, [e[0] + 0.02, py + 0.015, e[2] + 0.02], GOLD_DK);
        cyl(0.01, 0.01, 0.01, 8, [e[0] + 0.01, py + 0.013, e[2] - 0.03], GOLD);
      } else {
        glow(P(new THREE.OctahedronGeometry(0.025, 0), TEAL, [e[0], py + 0.04, e[2]], { scale: [0.8, 1.3, 0.8], flat: true }), 1.2);
        ball(0.018, [e[0] + 0.03, py + 0.03, e[2] + 0.02], LIME);
      }
    }
  }

  // ------------------------------------------------------------ alembic on tripod
  {
    const x = 0.52;
    const z = 0.08;
    b.lathe([[0, 0], [0.05, 0], [0.055, 0.02], [0.03, 0.045], [0.02, 0.05], [0, 0.05]], { at: [x, T, z], color: GOLD_DK });
    flame(x, T + 0.045, z, 1.8);
    P(new THREE.TorusGeometry(0.07, 0.006, 5, 10), IRON, [x, T + 0.12, z], { rotation: [90, 0, 0] });
    for (let i = 0; i < 3; i++) {
      const a = i * 2.09 + 0.3;
      b.rod([x + 0.07 * Math.cos(a), T + 0.12, z + 0.07 * Math.sin(a)], [x + 0.09 * Math.cos(a), T, z + 0.09 * Math.sin(a)], 0.005, IRON, { sides: 4 });
    }
    glow(ball(0.1, [x, T + 0.191, z], TEAL), 1.1);
    glow(ball(0.014, [x - 0.04, T + 0.24, z + 0.075], "#ffffff", { scale: [0.6, 1.6, 0.4] }), 1);
    cyl(0.022, 0.034, 0.12, 8, [x, 1.21, z], GLASS);
    cyl(0.03, 0.03, 0.015, 8, [x, 1.265, z], GOLD);
    b.sweep(
      catmull([[x, 1.275, z], [x + 0.04, 1.33, z], [x + 0.14, 1.3, z], [x + 0.21, 1.2, z], [x + 0.23, 1.0, z]]),
      0.011,
      { color: GLASS, sides: 6 },
    );
    potion(x + 0.23, T, z, 0.028, 1, TEAL, CORK, false);
    glow(ball(0.007, [x + 0.23, 1.0, z], TEAL), 1.3);
  }

  // ------------------------------------------------------------ mortar and pestle
  {
    const x = 0.2;
    const z = 0.27;
    b.lathe([[0, 0], [0.05, 0], [0.08, 0.06], [0.085, 0.075], [0.07, 0.075], [0.06, 0.03], [0, 0.025]], { at: [x, T, z], color: STONE });
    cyl(0.04, 0.04, 0.012, 8, [x, T + 0.006, z], STONE);
    ball(0.045, [x, T + 0.045, z], GREEN, { scale: [1, 0.5, 1] });
    b.rod([x + 0.045, T + 0.17, z - 0.01], [x + 0.005, T + 0.04, z + 0.005], [0.013, 0.02], STONE);
    ball(0.016, [x + 0.045, T + 0.175, z - 0.01], STONE);
    plantAt(x - 0.01, T + 0.07, z + 0.02, 3, 0.1, LEAF, 40);
    ball(0.012, [x + 0.1, T + 0.01, z + 0.07], GREEN);
    ball(0.01, [x + 0.12, T + 0.008, z + 0.04], PURPLE);
  }

  // ------------------------------------------------------------ potions on the table
  potion(-0.14, T, 0.27, 0.042, 0, ROSE, RED);
  potion(-0.05, T, 0.3, 0.036, 2, AMBER, CORK);
  potion(0.05, T, 0.32, 0.03, 1, LIME, GOLD_DK);
  potion(0.62, T, 0.3, 0.046, 0, PURPLE, GOLD);
  potion(0.72, T, 0.25, 0.038, 1, SKY, RED);
  potion(0.66, T, 0.18, 0.03, 2, TEAL, CORK);
  crystals(0.77, T, -0.08, TEAL);

  // ------------------------------------------------------------ open book, ink, quill
  {
    const x = -0.52;
    const z = 0.14;
    box(0.44, 0.012, 0.3, [x, T + 0.006, z], TEAL);
    box(0.2, 0.025, 0.27, [x - 0.1, T + 0.0245, z], PAGE);
    box(0.2, 0.025, 0.27, [x + 0.1, T + 0.0245, z], PAGE);
    P(new THREE.PlaneGeometry(0.19, 0.26), "#ffffff", [x - 0.1, T + 0.0375, z], { dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: PAGES });
    P(new THREE.PlaneGeometry(0.19, 0.26), "#ffffff", [x + 0.1, T + 0.0375, z], { dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: PAGES });
    for (const sx of [1, -1])
      for (const sz of [1, -1]) box(0.03, 0.014, 0.03, [x + sx * 0.215, T + 0.007, z + sz * 0.145], GOLD);
    b.rod([x, T + 0.04, z - 0.1], [x + 0.03, T + 0.04, z + 0.2], 0.003, RED, { sides: 4 });
    // ink well and quill
    const ix = -0.25;
    const iz = 0.3;
    b.lathe([[0, 0], [0.03, 0], [0.04, 0.02], [0.04, 0.05], [0.02, 0.06], [0, 0.06]], { at: [ix, T, iz], color: NAVY });
    cyl(0.02, 0.02, 0.006, 8, [ix, T + 0.063, iz], INK);
    cyl(0.043, 0.043, 0.008, 8, [ix, T + 0.035, iz], GOLD);
    b.rod([ix, T + 0.06, iz], [ix + 0.07, T + 0.2, iz - 0.05], 0.003, CREAM, { sides: 4 });
    b.cards([frame([ix + 0.035, T + 0.13, iz - 0.025], [0.07, 0.14, -0.05])], FEATHER, { size: [0.05, 0.17], flow: [0, 0, 1], sink: 0 });
  }

  // ------------------------------------------------------------ candle and potted herb
  {
    const x = -0.75;
    const z = -0.22;
    b.lathe([[0, 0], [0.04, 0], [0.05, 0.012], [0.05, 0.016], [0.045, 0.016], [0.038, 0.006], [0, 0.006]], { at: [x, T, z], color: GOLD });
    cyl(0.016, 0.018, 0.12, 8, [x, T + 0.076, z], CREAM);
    ball(0.008, [x + 0.012, T + 0.1, z + 0.015], CREAM);
    ball(0.012, [x, T + 0.012, z + 0.03], CREAM, { scale: [1.5, 0.5, 1] });
    flame(x, T + 0.136, z, 1.2);
    const px = -0.5;
    const pz = -0.2;
    b.lathe([[0, 0], [0.042, 0], [0.062, 0.085], [0.068, 0.1], [0.068, 0.115], [0.058, 0.115], [0.056, 0.105], [0, 0.105]], { at: [px, T, pz], color: TERRA });
    cyl(0.06, 0.06, 0.012, 8, [px, T + 0.108, pz], GOLD);
    cyl(0.056, 0.056, 0.01, 8, [px, T + 0.11, pz], SOIL);
    plantAt(px, T + 0.11, pz, 7, 0.17, LEAF, 22);
    ball(0.012, [px + 0.02, T + 0.27, pz], ROSE);
    ball(0.01, [px - 0.03, T + 0.25, pz + 0.02], GOLD);
  }

  // ------------------------------------------------------------ book stack on table
  flatBook(-0.74, T, 0.0, 0.2, 0.04, 0.15, BOOKS[1], 8);
  flatBook(-0.74, T + 0.04, 0.0, 0.18, 0.032, 0.13, BOOKS[3], -12);
  flatBook(-0.74, T + 0.072, 0.0, 0.16, 0.03, 0.12, BOOKS[4], 20);
  glow(P(new THREE.OctahedronGeometry(0.02, 0), SKY, [-0.74, T + 0.12, 0.0], { scale: [0.8, 1.4, 0.8], flat: true }), 1.2);

  // ------------------------------------------------------------ lower shelf
  {
    const y = 0.265;
    ball(0.14, [-0.55, y + 0.14, 0.05], CLOTH, { scale: [1, 1.05, 0.9] });
    cyl(0.04, 0.05, 0.03, 8, [-0.55, y + 0.285, 0.05], RED);
    ball(0.025, [-0.55, y + 0.31, 0.05], CLOTH);
    flatBook(-0.3, y, 0.1, 0.22, 0.04, 0.16, BOOKS[0], 10);
    flatBook(-0.3, y + 0.04, 0.1, 0.2, 0.034, 0.14, BOOKS[2], -8);
    box(0.28, 0.2, 0.24, [0.0, y + 0.1, 0.05], WOOD);
    for (const dz of [-0.121, 0.121]) {
      box(0.29, 0.02, 0.006, [0, y + 0.03, 0.05 + dz], GOLD_DK);
      box(0.29, 0.02, 0.006, [0, y + 0.17, 0.05 + dz], GOLD_DK);
    }
    potion(0.0, y + 0.2, 0.05, 0.03, 0, SKY, GOLD);
    potion(0.4, y, 0.1, 0.075, 2, TEAL, CORK);
    potion(0.58, y, 0.0, 0.07, 2, AMBER, CORK);
    potion(0.7, y, 0.15, 0.06, 0, ROSE, GOLD_DK);
  }

  // ------------------------------------------------------------ cauldron
  {
    const x = 1.25;
    const z = 0.2;
    b.lathe([[0, 0.08], [0.14, 0.06], [0.26, 0.14], [0.31, 0.26], [0.3, 0.4], [0.32, 0.43], [0.28, 0.45], [0.26, 0.42], [0, 0.42]], { at: [x, 0, z], color: IRON });
    glow(cyl(0.26, 0.26, 0.012, 12, [x, 0.426, z], LIME), 1.2);
    for (let i = 0; i < 3; i++) {
      const a = i * 2.09 + 0.7;
      b.rod([x + 0.2 * Math.cos(a), 0.12, z + 0.2 * Math.sin(a)], [x + 0.26 * Math.cos(a), 0.0, z + 0.26 * Math.sin(a)], [0.03, 0.02], IRON, { sides: 5 });
    }
    b.sweep(catmull([[x - 0.3, 0.4, z], [x, 0.68, z], [x + 0.3, 0.4, z]]), 0.008, { color: IRON, sides: 5 });
    for (const sx of [1, -1]) ball(0.02, [x + sx * 0.3, 0.4, z], GOLD);
    for (let i = 0; i < 5; i++) {
      const a = i * 1.3;
      glow(ball(0.015 + (i % 3) * 0.008, [x + 0.12 * Math.cos(a), 0.47 + i * 0.06, z + 0.1 * Math.sin(a)], i % 2 ? LIME : "#d6ffa0"), 1.2);
    }
    const ps = 0.2;
    glow(P(new THREE.ConeGeometry(0.04, 0.12, 5), FIRE, [x + ps, 0.06, z + 0.1]), 1.2);
    cyl(0.025, 0.025, 0.28, 6, [x - 0.15, 0.025, z + 0.32], WOOD_DK, { rotation: [0, 0, 90] });
    cyl(0.025, 0.025, 0.28, 6, [x + 0.1, 0.025, z + 0.34], WOOD_DK, { rotation: [0, 0, 90] });
  }

  // ------------------------------------------------------------ stool
  {
    const x = 0.35;
    const z = 0.8;
    cyl(0.17, 0.17, 0.04, 10, [x, 0.44, z], WOOD_TOP);
    cyl(0.175, 0.175, 0.012, 10, [x, 0.462, z], GOLD);
    cyl(0.17, 0.17, 0.008, 10, [x, 0.405, z], GOLD_DK);
    for (let i = 0; i < 3; i++) {
      const a = i * 2.09 + 0.4;
      b.rod([x + 0.1 * Math.cos(a), 0.42, z + 0.1 * Math.sin(a)], [x + 0.17 * Math.cos(a), 0, z + 0.17 * Math.sin(a)], 0.02, WOOD_V, { sides: 6 });
    }
    cyl(0.14, 0.14, 0.03, 10, [x, 0.472, z], PURPLE);
    ball(0.02, [x, 0.495, z], GOLD);
  }

  return b.root;
}
