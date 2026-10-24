import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  mix,
  noise,
  paint,
  rng,
  smoothstep,
  stripes,
  countershade,
  svg,
} from "../../../../src/index";
import type { Paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Vaporwave Bust",
  description:
    "A classical marble bust crowned with a laurel wreath, lit pink and cyan, on a fluted glowing column, among pastel palm trees on a neon grid floor.",
};

type V = [number, number, number];
type Col = string | Paint;

// ------------------------------------------------------------------------------------------------
// Palette
const PINK = "#ff6fd8";
const PINK_SOFT = "#ff9ee6";
const CYAN = "#43f0ff";
const MINT = "#7af5cf";
const NIGHT = "#1b0b3b";
const COCONUT = "#6b4535";

// ------------------------------------------------------------------------------------------------
// Paints

// Veined marble, lit pink from the model's left and cyan from its right.
const MARBLE = paint((p, n) => {
  const big = noise(p, 0.22, 11);
  const vein = smoothstep(0.05, 0.0, Math.abs(big - 0.5) * 2);
  const fine = smoothstep(0.04, 0.0, Math.abs(noise(p, 0.07, 23) - 0.5) * 2) * 0.55;
  let c = mix("#f8f2f9", "#e8dcf0", noise(p, 0.3, 5));
  c = mix(c, "#9a86b8", Math.max(vein, fine) * 0.6);
  c = mix(c, "#ff8fd6", smoothstep(0.1, 0.95, n.x) * 0.55);
  c = mix(c, "#7ff0ff", smoothstep(0.1, 0.95, -n.x) * 0.55);
  c = mix(c, "#ffffff", smoothstep(0.6, 1, n.y) * 0.35);
  c = mix(c, "#5b3f8f", smoothstep(-0.1, -1, n.y) * 0.45);
  return c;
});

// Fluted column: dark seams on every facet edge of the 14-sided lathe.
const FLUTES = 14;
const COLUMN = paint((p, n) => {
  const a = Math.atan2(p.x, p.z) / ((Math.PI * 2) / FLUTES);
  const f = Math.abs(a - Math.round(a));
  const base = MARBLE.at(p, n);
  return f < 0.07 ? mix(base, "#7a64a6", 0.7) : base;
});

// ------------------------------------------------------------------------------------------------
// Textures

const GRID = (() => {
  let lines = "";
  for (let i = 0; i <= 20; i++) {
    const major = i % 5 === 0;
    const col = major ? "#43f0ff" : "#ff4fd0";
    const core = major ? "#c9fbff" : "#ff9be8";
    const x = i * 5;
    lines += `<path d="M${x} 0V100M0 ${x}H100" stroke="${col}" stroke-opacity=".3" stroke-width="${major ? 1.8 : 1.4}"/>`;
    lines += `<path d="M${x} 0V100M0 ${x}H100" stroke="${core}" stroke-width="${major ? 0.6 : 0.45}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d0c63"/><stop offset="1" stop-color="#130633"/></linearGradient>
        <radialGradient id="r" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#5b1fa8" stop-opacity=".85"/><stop offset="1" stop-color="#130633" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#g)"/><rect width="100" height="100" fill="url(#r)"/>
      ${lines}
    </svg>`,
    { size: 1024 },
  );
})();

const PLAQUE = svg(
  `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="116" height="36" rx="5" fill="#230a4a" stroke="#43f0ff" stroke-width="1.6"/>
    <rect x="6" y="6" width="108" height="28" rx="3" fill="none" stroke="#ff6fd8" stroke-width=".8"/>
    <text x="60" y="23" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="12.5" fill="#ff9be8">A E S T H E T I C</text>
    <path d="M22 29H98" stroke="#43f0ff" stroke-width="1"/>
    <path d="M14 20l4-4v8zM106 20l-4-4v8z" fill="#43f0ff"/>
  </svg>`,
  { size: 512 },
);

const EYE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#ece3f7" stroke="#8a78ad" stroke-width="3"/>
    <circle cx="32" cy="32" r="19" fill="#c9b8e8" stroke="#7a669f" stroke-width="3"/>
    <circle cx="32" cy="32" r="9" fill="#4a3a73"/>
    <path d="M22 26q6-8 14-4" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

function frondTexture(tip: string) {
  let leaves = "";
  const n = 24;
  for (let i = 0; i < n; i++) {
    const y = 150 - i * 5.8;
    const L = 27 * Math.pow(1 - i / (n + 3), 0.7) + 3;
    for (const s of [-1, 1]) {
      leaves += `<path d="M32 ${(y + 2.2).toFixed(1)}L${(32 + s * L).toFixed(1)} ${(y - L * 0.45).toFixed(1)}L32 ${(y - 1.6).toFixed(1)}Z"/>`;
    }
  }
  return svg(
    `<svg viewBox="0 0 64 160" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="gr" gradientUnits="userSpaceOnUse" x1="0" y1="160" x2="0" y2="0">
        <stop offset="0" stop-color="#0b5f63"/><stop offset=".45" stop-color="#17c29d"/><stop offset="1" stop-color="${tip}"/>
      </linearGradient></defs>
      <path d="M32 160V4" stroke="#0a4a47" stroke-width="2.6" stroke-linecap="round"/>
      <g fill="url(#gr)" stroke="#0a4a47" stroke-width=".5" stroke-linejoin="round">${leaves}
        <path d="M32 18L28 4L32 -0L36 4Z"/></g>
    </svg>`,
    { size: 640 },
  );
}
const FROND_MINT = frondTexture("#b9ffe0");
const FROND_PINK = frondTexture("#ff9ee6");

// ------------------------------------------------------------------------------------------------

const DY = 0.02; // the whole head rides this high on the neck
const H = (x: number, y: number, z: number): V => [x, y + DY, z];
const unit = (v: V): V => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

export default function build() {
  const b = createBuilder({ name: "vaporwave_bust", paintSize: 2048 });

  const ell = (at: V, r: V, color: Col, seg: [number, number] = [12, 8], opts: Record<string, any> = {}) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), color, { at, scale: r, ...opts });

  const lathe = (pts: [number, number][], segs: number) =>
    new THREE.LatheGeometry(
      pts.map(([r, y]) => new THREE.Vector2(r, y)),
      segs,
    );

  const ringPath = (cy: number, r: number, n = 16) =>
    catmull(
      Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return [Math.sin(a) * r, cy, Math.cos(a) * r];
      }),
      { closed: true },
    );

  // ----------------------------------------------------------------------------------------------
  // Floor: dark slab, glowing grid, neon edging
  const FLOOR = 5.6;
  const S = FLOOR / 2;
  b.part(new THREE.BoxGeometry(FLOOR, 0.04, FLOOR), NIGHT, { at: [0, -0.02, 0] });
  glow(
    b.part(new THREE.PlaneGeometry(FLOOR, FLOOR), "#ffffff", {
      at: [0, 0.002, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: GRID,
    }),
    0.8,
  );
  const edges: [V, V][] = [
    [[-S, 0.008, -S], [S, 0.008, -S]],
    [[S, 0.008, -S], [S, 0.008, S]],
    [[S, 0.008, S], [-S, 0.008, S]],
    [[-S, 0.008, S], [-S, 0.008, -S]],
  ];
  edges.forEach(([a, c], i) => glow(b.rod(a, c, 0.012, { color: i % 2 ? PINK : CYAN, sides: 6 }), 1.2));

  // ----------------------------------------------------------------------------------------------
  // Plinth and fluted column
  b.part(new THREE.BoxGeometry(0.64, 0.08, 0.64), MARBLE, { at: [0, 0.04, 0] });
  b.part(new THREE.BoxGeometry(0.5, 0.05, 0.5), MARBLE, { at: [0, 0.105, 0] });
  const column = b.part(
    lathe(
      [
        [0, 0], [0.205, 0], [0.205, 0.03], [0.175, 0.06], [0.15, 0.08], [0.145, 0.1],
        [0.13, 0.55], [0.13, 0.58], [0.15, 0.6], [0.2, 0.625], [0.215, 0.65], [0, 0.65],
      ],
      FLUTES,
    ),
    COLUMN,
    { at: [0, 0.13, 0], flat: true },
  );
  b.part(new THREE.BoxGeometry(0.58, 0.06, 0.42), MARBLE, { at: [0, 0.81, 0] });
  b.part(new THREE.BoxGeometry(0.6, 0.012, 0.44), MARBLE, { at: [0, 0.846, 0] });

  // Neon rings and the glowing nameplate
  glow(b.sweep(ringPath(0.24, 0.155), 0.006, { color: PINK, sides: 5 }), 1.3);
  glow(b.sweep(ringPath(0.69, 0.138), 0.006, { color: CYAN, sides: 5 }), 1.3);
  glow(
    b.decal(column, PLAQUE, {
      at: [0, 0.42, 0.14],
      dir: [0, 0, 1],
      size: [0.19, 0.063],
      segments: 14,
    }),
    1,
  );

  // ----------------------------------------------------------------------------------------------
  // Bust: socle, torso, toga
  b.part(
    lathe([[0, 0], [0.27, 0], [0.27, 0.018], [0.245, 0.04], [0, 0.04]], 16),
    MARBLE,
    { at: [0, 0.852, 0], scale: [1, 1, 0.66], flat: true },
  );
  const torso = b.part(
    lathe(
      [
        [0, 0], [0.2, 0], [0.22, 0.03], [0.255, 0.1], [0.285, 0.17], [0.27, 0.21],
        [0.2, 0.25], [0.11, 0.28], [0.075, 0.3], [0, 0.3],
      ],
      16,
    ),
    MARBLE,
    { at: [0, 0.89, -0.01], scale: [1, 1, 0.58], flat: true },
  );
  const skin = b.surface(torso);

  const sash: V[] = [
    [-0.15, 1.17, 0.1], [-0.06, 1.1, 0.19], [0.06, 1.03, 0.21], [0.18, 0.96, 0.17], [0.26, 0.92, 0.07],
  ];
  b.sweep(skin.drape(catmull(sash), { lift: 0.004 }), (t) => [0.034 - 0.006 * t, 0.012], {
    color: MARBLE,
    sides: 6,
  });
  for (let k = 1; k <= 3; k++) {
    const pts = sash.map(([x, y, z], i) => [x, y - 0.04 * k - 0.004 * i, z] as V).slice(0, 5 - (k > 2 ? 1 : 0));
    b.sweep(skin.drape(catmull(pts), { lift: 0.002 }), [0.014 - 0.002 * k, 0.006], { color: MARBLE, sides: 5 });
  }
  // brooch pinning the toga
  const pin = skin.nearest([-0.17, 1.12, 0.14]);
  b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 10), MARBLE, pin, { embed: 0.3 });
  glow(b.stick(new THREE.OctahedronGeometry(0.022, 0), PINK, pin.moved([0, 0.012, 0]), { embed: 0.2, flat: true }), 1.3);

  // Neck and tendons
  b.rod([0, 1.12, -0.012], [0, 1.31, 0.0], [0.066, 0.052], { color: MARBLE });
  for (const s of [1, -1]) b.rod([s * 0.05, 1.27, -0.02], [s * 0.026, 1.16, 0.05], 0.014, { color: MARBLE, sides: 6 });

  // ----------------------------------------------------------------------------------------------
  // Head
  ell(H(0, 1.385, -0.012), [0.083, 0.1, 0.104], MARBLE, [16, 10]); // cranium
  ell(H(0, 1.325, 0.02), [0.074, 0.095, 0.082], MARBLE, [16, 10]); // face
  ell(H(0, 1.265, 0.045), [0.054, 0.042, 0.052], MARBLE, [14, 8]); // jaw
  ell(H(0, 1.243, 0.07), [0.026, 0.022, 0.024], MARBLE, [10, 8]); // chin
  for (const s of [1, -1]) {
    ell(H(s * 0.058, 1.335, 0.05), [0.028, 0.022, 0.028], MARBLE, [10, 6]); // cheekbones
    ell(H(s * 0.088, 1.358, -0.005), [0.01, 0.029, 0.02], MARBLE, [8, 6]); // ears
    ell(H(s * 0.088, 1.358, 0.0), [0.004, 0.018, 0.012], "#c9b8de", [6, 4], { at: H(s * 0.095, 1.358, 0.0) });
  }

  // brow ridge
  b.sweep(
    catmull([H(-0.07, 1.375, 0.064), H(-0.035, 1.39, 0.088), H(0, 1.386, 0.093), H(0.035, 1.39, 0.088), H(0.07, 1.375, 0.064)]),
    0.0125,
    { color: MARBLE, sides: 6 },
  );

  // eyes: ball, drawn iris, lids
  for (const s of [1, -1]) {
    ell(H(s * 0.036, 1.368, 0.082), [0.019, 0.014, 0.0099], "#f2ecf8", [10, 6]);
    b.part(new THREE.CircleGeometry(0.0105, 14), "#ffffff", {
      at: H(s * 0.036, 1.367, 0.0925),
      dir: [0, 0, 1],
      axis: "z",
      texture: EYE,
    });
    ell(H(s * 0.036, 1.376, 0.084), [0.0205, 0.0085, 0.0105], MARBLE, [10, 6]); // upper lid
    ell(H(s * 0.036, 1.359, 0.083), [0.0175, 0.0055, 0.009], MARBLE, [10, 6]); // lower lid
  }

  // nose
  b.rod(H(0, 1.385, 0.08), H(0, 1.325, 0.116), [0.011, 0.014], { color: MARBLE, sides: 6 });
  ell(H(0, 1.318, 0.121), [0.017, 0.015, 0.017], MARBLE, [10, 6]);
  for (const s of [1, -1]) {
    ell(H(s * 0.017, 1.314, 0.104), [0.012, 0.011, 0.012], MARBLE, [8, 6]);
    ell(H(s * 0.0085, 1.307, 0.125), [0.005, 0.003, 0.004], "#a89bc0", [6, 4]);
  }

  // mouth
  b.sweep(
    catmull([H(-0.025, 1.284, 0.085), H(-0.011, 1.288, 0.097), H(0, 1.285, 0.099), H(0.011, 1.288, 0.097), H(0.025, 1.284, 0.085)]),
    0.0078,
    { color: MARBLE, sides: 6 },
  );
  b.sweep(catmull([H(-0.021, 1.267, 0.088), H(0, 1.264, 0.099), H(0.021, 1.267, 0.088)]), 0.0095, {
    color: MARBLE,
    sides: 6,
  });
  b.sweep(catmull([H(-0.027, 1.2745, 0.081), H(0, 1.2765, 0.097), H(0.027, 1.2745, 0.081)]), 0.0022, {
    color: "#a89bb8",
    sides: 4,
  });

  // ----------------------------------------------------------------------------------------------
  // Hair: tilted skull cap, nape mass, and curls
  const cap = b.part(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), MARBLE, {
    at: H(0, 1.39, -0.016),
    scale: [0.093, 0.108, 0.114],
    rotation: [-40, 0, 0],
    flat: true,
  });
  const nape = ell(H(0, 1.34, -0.05), [0.086, 0.072, 0.076], MARBLE, [12, 8], { flat: true });
  const hairSkin = b.surface([cap, nape]);
  const CURLS = ["#f4ecf8", "#ece1f3", MARBLE] as const;
  const mainCurls = hairSkin.scatter(80, {
    rng: rng(5),
    minDist: 0.03,
    filter: (h) => h.at.y > 1.32 + DY && h.at.z < 0.07,
  });
  mainCurls.forEach((hit, i) =>
    b.stick(new THREE.IcosahedronGeometry(0.024, 1), CURLS[i % 3], hit, { embed: 0.25, scale: [1, 0.85, 1], flat: true }),
  );
  const fringe = b
    .surface(cap)
    .scatter(26, {
      rng: rng(9),
      minDist: 0.021,
      filter: (h) => h.n.z > 0.3 && h.at.y > 1.42 + DY && h.at.y < 1.5 + DY,
    });
  fringe.forEach((hit, i) =>
    b.stick(new THREE.IcosahedronGeometry(0.015, 1), CURLS[(i + 1) % 3], hit, { embed: 0.25, flat: true }),
  );

  // ----------------------------------------------------------------------------------------------
  // Laurel wreath: stems, pastel leaves, ribbon ties
  const leaf = () => new THREE.SphereGeometry(1, 6, 4);
  for (const s of [1, -1]) {
    const stem: V[] = [];
    for (let i = 0; i <= 13; i++) {
      const th = ((175 - i * (135 / 13)) * Math.PI) / 180;
      const rx = 0.097;
      const rz = 0.111;
      const y = 1.4 + (0.04 * (1 + Math.cos(th))) / 2 + DY;
      const pos: V = [s * rx * Math.sin(th), y, -0.012 + rz * Math.cos(th)];
      stem.push(pos);
      const T = unit([-s * rx * Math.cos(th), 0.1, rz * Math.sin(th)]);
      const out = unit([s * Math.sin(th), 0, Math.cos(th)]);
      const dirs: V[] = [
        unit([T[0] * 0.8 + out[0] * 0.5, T[1] * 0.8 - 0.2, T[2] * 0.8 + out[2] * 0.5]),
        unit([T[0] * 0.8 + out[0] * 0.1, T[1] * 0.8 + 0.5, T[2] * 0.8 + out[2] * 0.1]),
      ];
      dirs.forEach((d, j) => {
        b.part(leaf(), (i + j) % 2 ? MINT : PINK_SOFT, {
          at: [pos[0] + d[0] * 0.02, pos[1] + d[1] * 0.02, pos[2] + d[2] * 0.02],
          dir: d,
          up: [0, 1, 0],
          scale: [0.0085, 0.022, 0.0026],
          flat: true,
        });
      });
    }
    b.sweep(catmull(stem), 0.0055, { color: "#3fa88f", sides: 5 });
    // ribbon tie
    b.sweep(
      catmull([H(s * 0.012, 1.41, -0.128), H(s * 0.035, 1.35, -0.148), H(s * 0.07, 1.28, -0.152)]),
      (t) => [0.014 * (1 - 0.3 * t), 0.0025],
      { section: "box", color: PINK, caps: "flat" },
    );
  }

  // ----------------------------------------------------------------------------------------------
  // Palm trees
  type PalmSpec = { bx: number; bz: number; h: number; lx: number; lz: number; tex: any; seed: number };
  const palms: PalmSpec[] = [
    { bx: 1.2, bz: -0.55, h: 2.35, lx: 0.5, lz: -0.1, tex: FROND_MINT, seed: 1 },
    { bx: -1.3, bz: -0.75, h: 2.1, lx: -0.35, lz: 0.15, tex: FROND_PINK, seed: 2 },
    { bx: -0.95, bz: 1.0, h: 1.3, lx: -0.28, lz: 0.1, tex: FROND_MINT, seed: 3 },
    { bx: 1.0, bz: 0.9, h: 1.6, lx: 0.32, lz: 0.12, tex: FROND_PINK, seed: 4 },
  ];

  for (const pm of palms) {
    const pts = [0, 0.25, 0.55, 0.8, 1].map((t) => [pm.bx + pm.lx * t * t, pm.h * t, pm.bz + pm.lz * t * t] as V);
    const top = pts[4];
    const bark = countershade(
      stripes("#8f6a5e", "#4e3038", { size: 0.075, axis: "y", width: 0.45, wobble: 0.25, seed: pm.seed }),
      "#4a3346",
      { level: -0.3 },
    );
    const scale = pm.h / 2.2;
    b.sweep(catmull(pts), [0.1, 0.07, 0.056, 0.05, 0.05].map((r) => r * Math.max(scale, 0.7)), {
      color: bark,
      sides: 8,
    });
    // crown and coconuts
    ell([top[0], top[1] - 0.01, top[2]], [0.1, 0.07, 0.1], "#0d6a63", [8, 6], { flat: true });
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + pm.seed;
      ell([top[0] + Math.sin(a) * 0.07, top[1] - 0.07, top[2] + Math.cos(a) * 0.07], [0.042, 0.042, 0.042], COCONUT, [7, 5], {
        flat: true,
      });
    }
    // fronds: long arching ring, then a short upright ring
    const crown = frame([top[0], top[1] + 0.02, top[2]], [0, 1, 0]);
    const outer = b.ring(crown, { count: 9, radius: 0.04, fromDeg: pm.seed * 17, toDeg: pm.seed * 17 + (360 * 8) / 9 }).items;
    b.cards(outer, pm.tex, {
      size: [0.5 * scale ** 0.4, 1.25 * scale ** 0.5],
      lean: 40,
      bend: -100,
      flow: [0, 1, 0],
      vary: 0.15,
      spin: 6,
      rng: rng(30 + pm.seed),
    });
    const inner = b.ring(crown, { count: 6, radius: 0.02, fromDeg: 25, toDeg: 25 + 300 }).items;
    b.cards(inner, pm.tex, {
      size: [0.38 * scale ** 0.4, 0.85 * scale ** 0.5],
      lean: 78,
      bend: -35,
      flow: [0, 1, 0],
      vary: 0.2,
      rng: rng(50 + pm.seed),
    });
  }

  return b.root;
}
