import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { mix, mottle, noise, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Floating Sky Island",
  description:
    "A cel-shaded floating island with a mossy gate ruin and glowing rune altar, a pond that spills into a waterfall, a swing tree, a blossom tree, a pine, flowers, crystals and drifting islets.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Terrain helpers (all in meters; the island is a lathe about the Y axis)
const RP = [
  [0, 0],
  [0.1, 0.08],
  [0.3, 0.3],
  [0.45, 0.55],
  [0.8, 0.75],
  [1.15, 0.95],
  [1.32, 1.12],
]; // [radius, y] of the rock underside

function rockR(y: number) {
  for (let i = 1; i < RP.length; i++) {
    if (y <= RP[i][1]) {
      const t = (y - RP[i - 1][1]) / (RP[i][1] - RP[i - 1][1]);
      return RP[i - 1][0] + (RP[i][0] - RP[i - 1][0]) * t;
    }
  }
  return RP[RP.length - 1][0];
}

/** Height of the grass top at radius r. */
function gy(r: number) {
  if (r <= 0.8) return 1.3 - 0.02 * (r / 0.8);
  if (r <= 1.2) return 1.28 - 0.04 * ((r - 0.8) / 0.4);
  return Math.max(1.16, 1.24 - 0.08 * ((r - 1.2) / 0.16));
}
const G = (x: number, z: number) => gy(Math.hypot(x, z));

const ico = (d = 1) => new THREE.IcosahedronGeometry(1, d);
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt: number, rb: number, h: number, s: number) => new THREE.CylinderGeometry(rt, rb, h, s);

function circ(cx: number, y: number, cz: number, r: number, n: number, jitter = 0, phase = 0) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rr = r + jitter * Math.sin(i * 2.7 + phase);
    return [cx + Math.cos(a) * rr, y, cz + Math.sin(a) * rr];
  });
}

export default function build() {
  const b = createBuilder({ name: "floatingIsland", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);

  // ------------------------------------------------------------------------------------------------------------
  // Palette
  const ROCK = cel(
    paint((p) => mix(mix("#5b5278", "#b9a6a4", smoothstep(0.1, 1.15, p.y)), "#8c7a8e", noise(p, 0.22, 3) * 0.35)),
  );
  const ROCK_D = cel("#6e6286");
  const ROCK_L = cel(mottle("#aa9ba9", "#8e7f98", { size: 0.15, seed: 4 }));
  const STONE = cel(mottle("#f3ebd6", "#dccfae", { size: 0.12, seed: 3, contrast: 1.5 }));
  const STONE_W = cel(mottle("#d4c9ae", "#b6aa91", { size: 0.1, seed: 8 }));
  const MOSS = cel(mottle("#7ccc4c", "#559f3f", { size: 0.07, seed: 7 }));
  const GOLD = cel("#f2bb3e", "#b8741f");
  const TEAL = cel("#3fd8cc");
  const BARK = cel(mottle("#8d5c3e", "#6b4330", { size: 0.07, seed: 2 }));
  const CAP = cel(
    paint((p, n) =>
      n.y > 0.45 ? mix("#7fd44b", "#b4e861", Math.min(1, Math.max(0, noise(p, 0.2, 6) - 0.25) * 1.4)) : "#7d5a45",
    ),
  );
  const CLOUD = cel("#ffffff", "#cde2f6");
  const foliage = (y0: number, y1: number, a: string, c: string, seed: number) =>
    cel(paint((p) => mix(a, c, smoothstep(y0, y1, p.y) * 0.85 + (noise(p, 0.14, seed) - 0.5) * 0.5)));
  const WATER = "#4fd3ea";
  const WATER_L = "#bff6ff";
  const CRYSTAL = "#7aeaff";

  // ------------------------------------------------------------------------------------------------------------
  // Textures
  const leaf = svg(
    `<svg viewBox="0 0 32 40"><path d="M16 38 C2 28 2 10 16 2 C30 10 30 28 16 38Z" fill="#ffffff"/><path d="M16 36 L16 8" stroke="#cfcfcf" stroke-width="1.6"/></svg>`,
    { size: 128 },
  );
  const petal = svg(`<svg viewBox="0 0 16 24"><path d="M8 22 C0 14 2 4 8 2 C14 4 16 14 8 22Z" fill="#ffc9da"/></svg>`, {
    size: 64,
  });
  const tuft = svg(
    `<svg viewBox="0 0 32 32"><path d="M2 32 Q6 14 1 2 Q13 12 13 32Z" fill="#66c43f"/><path d="M10 32 Q12 10 14 0 Q22 12 20 32Z" fill="#8fdc54"/><path d="M18 32 Q22 14 30 4 Q31 18 27 32Z" fill="#5db83a"/><path d="M12 32 Q16 18 24 12 Q24 24 21 32Z" fill="#a6e86a"/></svg>`,
    { size: 128 },
  );
  const flowerSvg = (petals: string, centre: string) => {
    const dots = Array.from({ length: 5 }, (_, i) => {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      return `<circle cx="${16 + Math.cos(a) * 6.5}" cy="${15 + Math.sin(a) * 6.5}" r="5.5" fill="${petals}"/>`;
    }).join("");
    return svg(
      `<svg viewBox="0 0 32 48"><path d="M16 47 L16 22" stroke="#4aa83c" stroke-width="2.6" stroke-linecap="round"/><path d="M16 38 q-9 -2 -11 -11 q9 0 11 11z" fill="#5cc24a"/>${dots}<circle cx="16" cy="15" r="4.2" fill="${centre}"/></svg>`,
      { size: 192 },
    );
  };
  const flowers = [
    flowerSvg("#ffffff", "#ffcf3d"),
    flowerSvg("#ff8fb5", "#fff3b0"),
    flowerSvg("#ffd23f", "#e0792a"),
    flowerSvg("#b49cff", "#fff3b0"),
  ];
  const tassel = svg(
    `<svg viewBox="0 0 16 48"><path d="M3 2 L5 22 M6 2 L7 24 M9 2 L9 25 M12 2 L11 24 M13 2 L12 22" stroke="#d9962a" stroke-width="2.2" stroke-linecap="round"/><path d="M4 22 L12 22 L10 36 L6 36Z" fill="#2cc4b8"/><rect x="5" y="34" width="6" height="3" fill="#f2bb3e"/><circle cx="8" cy="41" r="5" fill="#f2bb3e"/><circle cx="8" cy="41" r="2" fill="#d9962a"/></svg>`,
    { size: 192 },
  );
  const fallSvg = (() => {
    const light: Array<[number, number, number]> = [
      [14, 10, 58],
      [24, 30, 150],
      [32, 6, 120],
      [40, 24, 180],
      [49, 14, 100],
      [28, 120, 215],
    ];
    const dark: Array<[number, number, number]> = [
      [19, 50, 120],
      [36, 60, 170],
      [44, 90, 150],
      [30, 140, 205],
      [9, 20, 80],
      [54, 30, 90],
    ];
    const line = (c: string) => (l: [number, number, number]) =>
      `<path d="M${l[0]} ${l[1]} L${l[0]} ${l[2]}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
    return svg(
      `<svg viewBox="0 0 64 256"><polygon points="0,0 64,0 61,102 52,203 32,256 12,203 3,102" fill="#8be6f4"/>${dark
        .map(line("#4fc2e2"))
        .join("")}${light.map(line("#ffffff")).join("")}<rect x="0" y="0" width="64" height="9" fill="#ffffff"/></svg>`,
      { size: 256 },
    );
  })();
  const runeCircle = (() => {
    const ticks = Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      return `M${50 + Math.cos(a) * 41} ${50 + Math.sin(a) * 41} L${50 + Math.cos(a) * 45} ${50 + Math.sin(a) * 45}`;
    }).join(" ");
    return svg(
      `<svg viewBox="0 0 100 100"><g fill="none" stroke="#6ff0ff" stroke-width="1.6"><circle cx="50" cy="50" r="47"/><circle cx="50" cy="50" r="38" stroke-width="1"/><circle cx="50" cy="50" r="24"/><path d="M50 12 L82 68 L18 68 Z"/><path d="M50 88 L18 32 L82 32 Z"/></g><path d="${ticks}" stroke="#ffd35a" stroke-width="2" stroke-linecap="round"/></svg>`,
      { size: 512 },
    );
  })();
  const glyph = svg(
    `<svg viewBox="0 0 40 80"><g fill="none" stroke="#7ff3ff" stroke-width="2.6" stroke-linecap="round"><path d="M20 6 L20 74"/><path d="M20 20 L6 32 M20 20 L34 32"/><path d="M20 44 L8 56 M20 44 L32 56"/><circle cx="20" cy="66" r="4"/></g></svg>`,
    { size: 320 },
  );

  // ------------------------------------------------------------------------------------------------------------
  // Island body
  b.lathe([...RP.map(([r, y]) => [r, y] as [number, number]), [0, 1.12]], {
    at: [0, 0, 0],
    segments: 14,
    color: ROCK,
    name: "rock",
  });
  const cap = b.lathe(
    [
      [0, 1.1],
      [1.3, 1.1],
      [1.36, 1.16],
      [1.2, 1.24],
      [0.8, 1.28],
      [0, 1.3],
    ],
    { at: [0, 0, 0], segments: 14, color: CAP, name: "grassCap" },
  );

  // Strata bands and lumps on the rock
  [0.22, 0.4, 0.58, 0.76, 0.92, 1.04].forEach((y, i) => {
    b.sweep(catmull(circ(0, y, 0, rockR(y) + 0.014, 16, 0.018, i * 1.7), { closed: true }), 0.02, {
      color: i % 2 ? ROCK_D : ROCK_L,
      sides: 5,
      smooth: false,
    });
  });
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4 + 0.5;
    const y = 0.45 + 0.1 * ((i * 5) % 6);
    const r = rockR(y) * 0.92;
    b.part(ico(1), i % 2 ? ROCK_L : ROCK_D, {
      at: [Math.cos(a) * r, y, Math.sin(a) * r],
      scale: [0.14 + 0.02 * (i % 3), 0.12, 0.14],
      flat: true,
      rotation: [20 * i, 37 * i, 0],
    });
  }
  // Hanging stalactite spikes
  for (let i = 0; i < 7; i++) {
    const a = i * 0.9 + 0.2;
    const y = 0.5 + 0.045 * ((i * 3) % 7);
    const r = rockR(y) - 0.02;
    b.spike([Math.cos(a) * r, y, Math.sin(a) * r], [Math.cos(a) * 0.5, -1, Math.sin(a) * 0.5], 0.26, 0.08, {
      color: i % 2 ? ROCK_L : ROCK_D,
      sides: 6,
      smooth: false,
    });
  }
  // Hanging roots
  for (let i = 0; i < 10; i++) {
    const a = i * 0.63 + 0.3;
    const pts = Array.from({ length: 5 }, (_, j) => {
      const y = 1.1 - j * 0.14 - 0.02 * (i % 3);
      const rr = rockR(y) + 0.03 + 0.012 * Math.sin(j * 1.9 + i);
      const aa = a + 0.05 * Math.sin(j * 1.3 + i);
      return [Math.cos(aa) * rr, y, Math.sin(aa) * rr];
    });
    b.sweep(catmull(pts), [0.026, 0.005], { color: BARK, sides: 5, caps: { start: "flat", end: "point" } });
  }
  // Glowing crystal clusters on the underside
  const sites: number[][] = [
    [40, 0.62, 0.26],
    [150, 0.5, 0.22],
    [250, 0.68, 0.28],
    [330, 0.55, 0.24],
    [95, 0.82, 0.24],
    [200, 0.85, 0.2],
  ];
  sites.forEach(([deg, y, len], s) => {
    const a = (deg * Math.PI) / 180;
    const r = rockR(y) - 0.02;
    for (let k = 0; k < 3; k++) {
      const tilt = k - 1;
      const m = k === 1 ? 1 : 0.65;
      glow(
        b.spike(
          [Math.cos(a) * r - Math.sin(a) * tilt * 0.05, y + 0.03 * k, Math.sin(a) * r + Math.cos(a) * tilt * 0.05],
          [Math.cos(a) * 0.8 - Math.sin(a) * tilt * 0.25, -0.5 + 0.2 * (k === 1 ? 1 : 0), Math.sin(a) * 0.8 + Math.cos(a) * tilt * 0.25],
          len * m,
          0.04,
          { color: s % 2 ? CRYSTAL : "#9df4e6", sides: 5, smooth: false },
        ),
        1.4,
      );
    }
  });

  // ------------------------------------------------------------------------------------------------------------
  // Obstacles for scatter (x, z, radius)
  const obstacles: Array<[number, number, number]> = [];
  const free = (x: number, z: number) =>
    Math.hypot(x, z) < 1.2 && !obstacles.some(([ox, oz, or]) => Math.hypot(x - ox, z - oz) < or);

  // ------------------------------------------------------------------------------------------------------------
  // Ruins: plaza slab, altar, gate, columns
  const S = [-0.5, -0.12];
  const y0 = 1.34;
  obstacles.push([S[0], S[1], 0.64]);
  b.part(cyl(0.56, 0.6, 0.12, 12), STONE_W, { at: [S[0], 1.28, S[1]], name: "plazaSlab" });
  b.sweep(catmull(circ(S[0], y0 + 0.002, S[1], 0.55, 12), { closed: true }), 0.012, {
    color: GOLD,
    sides: 4,
    name: "plazaTrim",
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.62, 0.62), "#ffffff", {
      at: [S[0], y0 + 0.004, S[1]],
      dir: [0, 1, 0],
      axis: "z",
      texture: runeCircle,
    }),
    1,
  );
  // altar
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.2, 0.04],
      [0.16, 0.06],
      [0.16, 0.1],
      [0.12, 0.13],
      [0.1, 0.3],
      [0.14, 0.34],
      [0.14, 0.38],
      [0, 0.38],
    ],
    { at: [S[0], y0, S[1]], segments: 8, color: STONE, name: "altar" },
  );
  b.sweep(catmull(circ(S[0], y0 + 0.095, S[1], 0.165, 8, 0, 0), { closed: true }), 0.01, { color: GOLD, sides: 4 });
  b.sweep(catmull(circ(S[0], y0 + 0.365, S[1], 0.145, 8), { closed: true }), 0.01, { color: GOLD, sides: 4 });
  glow(
    b.part(new THREE.PlaneGeometry(0.07, 0.14), "#ffffff", {
      at: [S[0], y0 + 0.21, S[1] + 0.108],
      dir: [0, 0, 1],
      axis: "z",
      texture: glyph,
    }),
    1,
  );
  const cy = y0 + 0.62;
  glow(
    b.part(new THREE.OctahedronGeometry(1), CRYSTAL, {
      at: [S[0], cy, S[1]],
      scale: [0.07, 0.14, 0.07],
      flat: true,
      name: "altarCrystal",
    }),
    1.6,
  );
  b.part(new THREE.TorusGeometry(0.15, 0.007, 4, 28), GOLD, {
    at: [S[0], cy, S[1]],
    rotation: [70, 0, 20],
  });
  b.part(new THREE.TorusGeometry(0.19, 0.006, 4, 28), GOLD, {
    at: [S[0], cy, S[1]],
    rotation: [20, 40, -60],
  });
  for (let i = 0; i < 7; i++) {
    const a = i * 0.9;
    glow(
      b.part(new THREE.OctahedronGeometry(1), i % 2 ? "#ffe08a" : CRYSTAL, {
        at: [S[0] + Math.cos(a) * 0.24, cy - 0.12 + 0.07 * ((i * 3) % 5), S[1] + Math.sin(a) * 0.24],
        scale: 0.016 + 0.004 * (i % 3),
        flat: true,
      }),
      1.2,
    );
  }

  const column = (x: number, z: number, h: number, broken: boolean) => {
    const prof: Array<[number, number]> = broken
      ? [
          [0, 0],
          [0.09, 0],
          [0.09, 0.04],
          [0.07, 0.07],
          [0.058, 0.12],
          [0.054, h - 0.04],
          [0.05, h],
          [0.02, h + 0.04],
          [0, h + 0.03],
        ]
      : [
          [0, 0],
          [0.09, 0],
          [0.09, 0.04],
          [0.07, 0.07],
          [0.058, 0.12],
          [0.054, h - 0.1],
          [0.06, h - 0.07],
          [0.08, h - 0.06],
          [0.095, h - 0.03],
          [0.095, h],
          [0, h],
        ];
    b.lathe(prof, { at: [x, y0, z], segments: 8, color: STONE });
    b.sweep(catmull(circ(x, y0 + 0.1, z, 0.062, 8), { closed: true }), 0.008, { color: GOLD, sides: 4 });
    if (!broken) {
      b.sweep(catmull(circ(x, y0 + h - 0.12, z, 0.062, 8), { closed: true }), 0.008, { color: GOLD, sides: 4 });
      glow(
        b.part(new THREE.OctahedronGeometry(1), "#3fe0d0", {
          at: [x, y0 + h - 0.045, z + 0.09],
          scale: [0.018, 0.026, 0.018],
          flat: true,
        }),
        1.3,
      );
    } else {
      b.part(ico(0), MOSS, { at: [x + 0.01, y0 + h + 0.005, z], scale: [0.05, 0.02, 0.045], flat: true });
    }
  };
  // Gate
  const gz = S[1] - 0.42;
  column(S[0] - 0.235, gz, 0.82, false);
  column(S[0] + 0.235, gz, 0.82, false);
  const ay = y0 + 0.82;
  b.extrude(
    [
      [-0.3, 0],
      [-0.2598, 0.15],
      [-0.15, 0.2598],
      [0, 0.3],
      [0.1268, 0.2719],
      [0.165, 0.21],
      [0.11, 0.19],
      [0.0718, 0.154],
      [0, 0.17],
      [-0.085, 0.1472],
      [-0.1472, 0.085],
      [-0.17, 0],
    ],
    { at: [S[0], ay, gz], x: [1, 0, 0], thickness: 0.1, bevel: 0.012, color: STONE, name: "gateArch" },
  );
  b.sweep(
    catmull(
      Array.from({ length: 7 }, (_, i) => {
        const a = Math.PI - (i / 6) * (Math.PI - 1.2);
        return [S[0] + Math.cos(a) * 0.235, ay + Math.sin(a) * 0.235, gz + 0.056];
      }),
    ),
    0.011,
    { color: GOLD, sides: 4, caps: "flat" },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(1), "#3fe0d0", {
      at: [S[0], ay + 0.235, gz + 0.062],
      scale: [0.022, 0.032, 0.012],
      flat: true,
    }),
    1.3,
  );
  b.part(ico(1), MOSS, { at: [S[0] - 0.12, ay + 0.265, gz], scale: [0.09, 0.03, 0.065], flat: true });
  b.part(ico(1), MOSS, { at: [S[0] + 0.04, ay + 0.3, gz + 0.005], scale: [0.06, 0.02, 0.06], flat: true });
  b.cards(
    [
      frame([S[0], ay + 0.17, gz + 0.02], [0, 1, 0]),
      frame([S[0] - 0.1, ay + 0.138, gz + 0.02], [0, 1, 0]),
      frame([S[0] - 0.15, ay + 0.085, gz + 0.02], [0, 1, 0]),
    ],
    tassel,
    { size: [0.05, 0.15], lean: 180, flow: [0, 0, 1], sink: 0 },
  );
  // vines on the gate
  for (const vx of [-0.235, 0.235]) {
    b.sweep(
      catmull([
        [S[0] + vx + 0.09, y0 + 0.78, gz + 0.03],
        [S[0] + vx + 0.095, y0 + 0.6, gz + 0.05],
        [S[0] + vx + 0.09, y0 + 0.45, gz + 0.03],
      ]),
      [0.01, 0.004],
      { color: cel("#4f9a3e"), sides: 4, caps: "point" },
    );
  }
  // other columns
  column(S[0] + 0.5, S[1] + 0.12, 0.55, false);
  column(S[0] - 0.5, S[1] + 0.18, 0.34, true);
  column(S[0] + 0.38, S[1] - 0.38, 0.22, true);
  // broken walls
  [
    [0.5, -0.4, 0.3, 0.2, 25],
    [-0.52, -0.38, 0.22, 0.14, -12],
    [0.02, -0.54, 0.16, 0.1, 5],
  ].forEach(([dx, dz, w, h, rot], i) => {
    b.part(box(w, h, 0.09), STONE_W, {
      at: [S[0] + dx, y0 + h / 2 - 0.03, S[1] + dz],
      rotation: [0, rot, 0],
    });
    b.part(box(w * 0.95, 0.02, 0.1), GOLD, {
      at: [S[0] + dx, y0 + h - 0.03, S[1] + dz],
      rotation: [0, rot, 0],
    });
    b.part(ico(1), MOSS, {
      at: [S[0] + dx + 0.04 * i, y0 + h - 0.015, S[1] + dz],
      scale: [w * 0.35, 0.025, 0.055],
      flat: true,
    });
  });
  // stairs
  b.part(box(0.46, 0.08, 0.13), STONE, { at: [S[0], 1.28, S[1] + 0.5], name: "stepA" });
  b.part(box(0.46, 0.08, 0.13), STONE_W, { at: [S[0], 1.255, S[1] + 0.62], name: "stepB" });
  obstacles.push([S[0], S[1] + 0.58, 0.15]);
  // fallen column drum and rubble
  const fx = -0.22;
  const fz = 0.6;
  b.part(cyl(0.07, 0.07, 0.46, 8), STONE, {
    at: [fx, G(fx, fz) + 0.055, fz],
    rotation: [0, 18, 90],
    name: "fallenColumn",
  });
  b.part(cyl(0.085, 0.085, 0.04, 8), STONE, {
    at: [fx - 0.2, G(fx, fz) + 0.055, fz + 0.07],
    rotation: [0, 18, 90],
  });
  b.part(ico(1), MOSS, { at: [fx, G(fx, fz) + 0.115, fz], scale: [0.14, 0.025, 0.04], flat: true, rotation: [0, 18, 0] });
  obstacles.push([fx, fz, 0.28]);
  [
    [-0.78, 0.38, 0.06],
    [-0.7, 0.3, 0.045],
    [-0.32, 0.38, 0.05],
    [-1.0, -0.38, 0.06],
    [-0.12, -0.62, 0.05],
  ].forEach(([x, z, s], i) => {
    b.part(box(s * 2, s * 1.4, s * 1.6), i % 2 ? STONE : STONE_W, {
      at: [x, G(x, z) + s * 0.5, z],
      rotation: [10 * i, 33 * i, 7 * i],
    });
  });

  // stone lantern
  const lx = -0.02;
  const lz = 0.2;
  const lg = G(lx, lz) - 0.01;
  obstacles.push([lx, lz, 0.14]);
  b.part(box(0.13, 0.04, 0.13), STONE_W, { at: [lx, lg + 0.02, lz] });
  b.part(cyl(0.032, 0.04, 0.16, 8), STONE, { at: [lx, lg + 0.12, lz] });
  b.part(box(0.1, 0.03, 0.1), STONE, { at: [lx, lg + 0.215, lz] });
  glow(b.part(box(0.085, 0.085, 0.085), "#ffcf6a", { at: [lx, lg + 0.272, lz], name: "lanternLight" }), 1.5);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) b.part(box(0.016, 0.09, 0.016), STONE, { at: [lx + sx * 0.048, lg + 0.272, lz + sz * 0.048] });
  b.part(new THREE.ConeGeometry(0.11, 0.08, 4), STONE, { at: [lx, lg + 0.355, lz], rotation: [0, 45, 0] });
  b.part(new THREE.SphereGeometry(0.016, 6, 4), GOLD, { at: [lx, lg + 0.405, lz] });

  // glowing mushrooms
  [
    [-0.96, 0.06],
    [-0.9, -0.62],
    [-0.14, -0.75],
    [0.9, -0.62],
    [-0.35, 0.82],
  ].forEach(([x, z], i) => {
    const g = G(x, z);
    obstacles.push([x, z, 0.1]);
    for (let k = 0; k < 2; k++) {
      const mx = x + k * 0.05;
      const mz = z + k * 0.03;
      const h = 0.05 + 0.03 * k;
      b.part(cyl(0.008, 0.011, h, 5), cel("#fff1d0"), { at: [mx, g + h / 2 - 0.005, mz] });
      glow(
        b.part(new THREE.SphereGeometry(0.03 - 0.008 * k, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), i % 2 ? "#53e6d6" : "#8f7bff", {
          at: [mx, g + h - 0.005, mz],
          scale: [1, 0.7, 1],
        }),
        1,
      );
    }
  });

  // ------------------------------------------------------------------------------------------------------------
  // Pond, river, waterfall
  const PO = [0.5, 0.08];
  const pTop = G(PO[0], PO[1]) + 0.03;
  obstacles.push([PO[0], PO[1], 0.44]);
  glow(b.part(cyl(0.3, 0.3, 0.06, 16), WATER, { at: [PO[0], pTop - 0.03, PO[1]], name: "pond" }), 0.4);
  glow(b.part(cyl(0.2, 0.2, 0.06, 14), "#7fe6f4", { at: [PO[0], pTop - 0.027, PO[1]] }), 0.4);
  for (const rr of [0.1, 0.17])
    b.sweep(catmull(circ(PO[0], pTop + 0.004, PO[1], rr, 10), { closed: true }), 0.004, {
      color: WATER_L,
      sides: 4,
    });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    if (Math.abs(Math.atan2(Math.sin(a - 0.17), Math.cos(a - 0.17))) < 0.45) continue;
    const x = PO[0] + Math.cos(a) * 0.33;
    const z = PO[1] + Math.sin(a) * 0.33;
    b.part(ico(1), i % 2 ? ROCK_L : STONE_W, {
      at: [x, pTop - 0.01, z],
      scale: [0.06 + 0.015 * (i % 3), 0.045, 0.06],
      flat: true,
      rotation: [0, i * 40, 0],
    });
  }
  [
    [0.42, 0.18],
    [0.6, 0.0],
    [0.38, -0.02],
  ].forEach(([x, z], i) => {
    b.part(cyl(0.055, 0.055, 0.008, 9), cel("#5fc25a"), { at: [x, pTop + 0.006, z], rotation: [0, i * 30, 0] });
  });
  const lotus = [0.42, pTop + 0.012, 0.18];
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    b.spike(lotus, [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5], 0.05, 0.014, {
      color: cel("#ff9ec0"),
      sides: 4,
      smooth: false,
    });
  }
  b.part(new THREE.SphereGeometry(0.011, 5, 4), GOLD, { at: [lotus[0], lotus[1] + 0.02, lotus[2]] });

  const riverXZ = [
    [0.62, 0.1],
    [0.9, 0.16],
    [1.1, 0.27],
    [1.27, 0.36],
  ];
  const riverPts = riverXZ.map(([x, z]) => [x, G(x, z) + 0.012, z]);
  riverPts.push([1.365, 1.165, 0.39]);
  glow(
    b.sweep(catmull(riverPts), (t) => [0.085 + 0.03 * t, 0.016], {
      color: WATER,
      sides: 6,
      caps: "flat",
      name: "river",
    }),
    0.4,
  );
  b.sweep(catmull(riverPts.slice(0, 4).map(([x, y, z]) => [x, y + 0.016, z + 0.04])), 0.004, {
    color: WATER_L,
    sides: 4,
  });
  obstacles.push(...riverXZ.map(([x, z]) => [x, z, 0.16] as [number, number, number]));
  // stepping stones
  for (let k = -2; k <= 2; k++) {
    const x = 1.03 - 0.6 * k * 0.11;
    const z = 0.24 + 0.8 * k * 0.11;
    b.part(cyl(0.045, 0.05, 0.04, 7), STONE_W, { at: [x, G(x, z) + 0.012, z], rotation: [0, k * 20, 0] });
  }
  // waterfall
  const d = new THREE.Vector3(0.963, 0, 0.27);
  const WF = [1.37, 1.17, 0.39];
  const tangent = [-0.27, 0, 0.963];
  glow(
    b.extrude(
      [
        [-0.105, 0],
        [0.105, 0],
        [0.095, -0.35],
        [0.065, -0.7],
        [0, -0.87, "sharp"],
        [-0.065, -0.7],
        [-0.095, -0.35],
      ],
      { at: WF, x: tangent, thickness: 0.05, bevel: 0.008, color: "#6fdcef", name: "waterfallCore" },
    ),
    0.45,
  );
  for (const sg of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.22, 0.88), "#ffffff", {
        at: [WF[0] + d.x * 0.03 * sg, WF[1] - 0.44, WF[2] + d.z * 0.03 * sg],
        dir: [d.x * sg, 0, d.z * sg],
        axis: "z",
        texture: fallSvg,
      }),
      0.5,
    );
  }
  // lip foam
  for (let i = 0; i < 4; i++) {
    b.part(ico(1), cel("#ffffff", "#bfeaf5"), {
      at: [WF[0] - 0.03 + 0.02 * i, WF[1] + 0.012, WF[2] + (i - 1.5) * 0.045],
      scale: 0.032,
      flat: true,
    });
  }
  // mist and clouds
  const cloud = (x: number, y: number, z: number, s: number) => {
    [
      [0, 0, 0, 1],
      [0.8, -0.1, 0.3, 0.75],
      [-0.8, -0.05, -0.2, 0.8],
      [0.2, 0.2, -0.7, 0.7],
      [-0.2, 0.1, 0.8, 0.7],
      [0.1, 0.35, 0.05, 0.65],
    ].forEach(([ox, oy, oz, k]) => {
      b.part(ico(1), CLOUD, {
        at: [x + ox * s, y + oy * s, z + oz * s],
        scale: [s * k, s * k * 0.62, s * k],
        rotation: [0, ox * 40, 0],
      });
    });
  };
  cloud(1.45, 0.3, 0.44, 0.15);
  cloud(1.3, 0.22, 0.72, 0.12);
  cloud(-1.2, 0.28, 0.8, 0.2);
  cloud(-0.3, 0.22, 1.25, 0.16);
  cloud(1.0, 0.26, -1.05, 0.19);
  cloud(-1.1, 0.24, -0.95, 0.15);
  for (let i = 0; i < 6; i++) {
    glow(
      b.part(new THREE.SphereGeometry(0.012, 5, 4), WATER_L, {
        at: [1.46 + 0.06 * Math.sin(i * 2), 0.34 + 0.05 * i, 0.42 + 0.06 * Math.cos(i * 3)],
      }),
      0.8,
    );
  }

  // ------------------------------------------------------------------------------------------------------------
  // Trees
  const trunk = (pts: number[][], r0: number, r1: number) =>
    b.sweep(catmull(pts), [r0, r1], { color: BARK, sides: 7, caps: { start: "flat", end: "round" } });
  const rootsFlare = (x: number, z: number, g: number, r: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const a = i * ((Math.PI * 2) / n) + 0.4;
      b.sweep(
        [
          [x + Math.cos(a) * r * 0.3, g + 0.17, z + Math.sin(a) * r * 0.3],
          [x + Math.cos(a) * r * 0.9, g + 0.05, z + Math.sin(a) * r * 0.9],
          [x + Math.cos(a) * r * 1.6, g - 0.01, z + Math.sin(a) * r * 1.6],
        ],
        [0.05, 0.014],
        { color: BARK, sides: 5, caps: "flat" },
      );
    }
  };

  // Big swing tree
  const T1 = [0.12, -0.72];
  const g1 = G(T1[0], T1[1]);
  obstacles.push([T1[0], T1[1], 0.3], [T1[0] + 0.4, T1[1] + 0.05, 0.12]);
  trunk(
    [
      [T1[0], g1 - 0.03, T1[1]],
      [T1[0] + 0.02, g1 + 0.3, T1[1] - 0.01],
      [T1[0] - 0.06, g1 + 0.58, T1[1] + 0.02],
      [T1[0] - 0.02, g1 + 0.82, T1[1]],
    ],
    0.11,
    0.05,
  );
  rootsFlare(T1[0], T1[1], g1, 0.11, 5);
  const C1 = [T1[0] - 0.02, g1 + 0.88, T1[1]];
  b.sweep(
    catmull([
      [T1[0] - 0.05, g1 + 0.52, T1[1] + 0.02],
      [T1[0] + 0.2, g1 + 0.64, T1[1] + 0.04],
      [T1[0] + 0.42, g1 + 0.7, T1[1] + 0.05],
    ]),
    [0.04, 0.02],
    { color: BARK, sides: 6 },
  );
  b.sweep(
    [
      [T1[0] - 0.05, g1 + 0.6, T1[1] + 0.02],
      [T1[0] - 0.22, g1 + 0.78, T1[1] + 0.1],
    ],
    [0.035, 0.018],
    { color: BARK, sides: 5 },
  );
  // swing
  for (const sz of [-0.07, 0.07]) {
    b.rod([T1[0] + 0.4, g1 + 0.7, T1[1] + 0.05 + sz], [T1[0] + 0.4, g1 + 0.16, T1[1] + 0.05 + sz], 0.005, {
      color: cel("#c8a46a"),
      sides: 4,
    });
  }
  b.part(box(0.1, 0.02, 0.2), cel("#a9754a"), { at: [T1[0] + 0.4, g1 + 0.15, T1[1] + 0.05], name: "swingSeat" });
  const leaf1 = foliage(g1 + 0.55, g1 + 1.4, "#3f9d46", "#9be85c", 5);
  const puffs1 = [
    [0, 0, 0, 0.36],
    [0.28, -0.05, 0.05, 0.28],
    [-0.3, -0.06, -0.04, 0.27],
    [0.05, -0.08, 0.28, 0.26],
    [-0.05, -0.06, -0.28, 0.26],
    [0.05, 0.22, 0, 0.26],
    [0.2, 0.14, -0.2, 0.2],
    [-0.2, 0.12, 0.2, 0.2],
  ].map(([ox, oy, oz, r]) =>
    b.part(ico(1), leaf1, { at: [C1[0] + ox, C1[1] + oy, C1[2] + oz], scale: [r, r * 0.85, r], rotation: [10, ox * 90, 0] }),
  );
  b.cards(
    b.surface(puffs1).scatter(70, { rng: rng(21), minDist: 0.11, filter: (h) => h.n.y > -0.2 }),
    leaf,
    { size: [0.12, 0.14], lean: 60, bend: 25, vary: 0.3, spin: 180, rng: rng(22), color: "#9be85c" },
  );

  // Blossom tree
  const T2 = [-0.85, 0.72];
  const g2 = G(T2[0], T2[1]);
  obstacles.push([T2[0] + 0.1, T2[1] - 0.05, 0.3]);
  trunk(
    [
      [T2[0], g2 - 0.03, T2[1]],
      [T2[0] + 0.04, g2 + 0.2, T2[1] - 0.02],
      [T2[0] + 0.12, g2 + 0.42, T2[1] - 0.06],
      [T2[0] + 0.12, g2 + 0.55, T2[1] - 0.06],
    ],
    0.075,
    0.035,
  );
  rootsFlare(T2[0], T2[1], g2, 0.075, 4);
  const C2 = [T2[0] + 0.12, g2 + 0.62, T2[1] - 0.06];
  const pink = foliage(g2 + 0.35, g2 + 0.95, "#f27fa6", "#ffc9db", 9);
  const puffs2 = [
    [0, 0, 0, 0.26],
    [0.2, -0.05, 0.05, 0.19],
    [-0.2, -0.04, -0.02, 0.2],
    [0, -0.05, 0.2, 0.18],
    [0, 0.15, -0.05, 0.17],
    [0.05, -0.04, -0.2, 0.17],
  ].map(([ox, oy, oz, r]) =>
    b.part(ico(1), pink, { at: [C2[0] + ox, C2[1] + oy, C2[2] + oz], scale: [r, r * 0.85, r], rotation: [0, ox * 90, 8] }),
  );
  b.cards(
    b.surface(puffs2).scatter(55, { rng: rng(23), minDist: 0.1, filter: (h) => h.n.y > -0.2 }),
    leaf,
    { size: [0.1, 0.12], lean: 60, bend: 25, vary: 0.3, spin: 180, rng: rng(24), color: "#ffc2d4" },
  );
  b.cards(
    Array.from({ length: 22 }, (_, i) => {
      const a = i * 2.39;
      const rr = 0.08 + 0.3 * ((i * 7) % 11) / 11;
      return frame([T2[0] + 0.1 + Math.cos(a) * rr, G(T2[0], T2[1]) + 0.004, T2[1] - 0.05 + Math.sin(a) * rr], [0, 1, 0]);
    }),
    petal,
    { size: [0.04, 0.06], lean: 90, sink: 0, flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)], mirror: true },
  );

  // Pine
  const T3 = [0.98, -0.42];
  const g3 = G(T3[0], T3[1]);
  obstacles.push([T3[0], T3[1], 0.27]);
  b.rod([T3[0], g3 - 0.02, T3[1]], [T3[0], g3 + 0.3, T3[1]], [0.05, 0.03], { color: BARK, sides: 7 });
  const pineC = foliage(g3 + 0.1, g3 + 0.95, "#1f7f5e", "#5fcf7a", 13);
  [
    [0.27, 0.28, 0.2],
    [0.22, 0.26, 0.4],
    [0.17, 0.24, 0.58],
    [0.11, 0.22, 0.75],
  ].forEach(([r, h, y], i) => {
    b.part(new THREE.ConeGeometry(r, h, 8, 1), pineC, {
      at: [T3[0], g3 + y + h / 2 - 0.1, T3[1]],
      rotation: [0, i * 20, 0],
    });
    b.part(new THREE.ConeGeometry(r * 0.98, 0.03, 8, 1), cel("#ffd86a"), {
      at: [T3[0], g3 + y - 0.095, T3[1]],
      scale: [1, 0.1, 1],
      rotation: [180, 0, 0],
    });
  });
  glow(b.part(new THREE.OctahedronGeometry(1), "#ffe08a", { at: [T3[0], g3 + 0.98, T3[1]], scale: [0.028, 0.045, 0.028], flat: true }), 1.2);

  // Bushes
  [
    [0.55, -0.32],
    [0.2, 0.62],
    [0.88, -0.1],
    [-0.65, 0.95],
    [0.3, -0.38],
    [-1.0, 0.25],
  ].forEach(([x, z], i) => {
    const g = G(x, z);
    obstacles.push([x, z, 0.16]);
    const bush = foliage(g, g + 0.2, "#3f9d46", "#8fdc54", 30 + i);
    [
      [0, 0.06, 0, 0.11],
      [0.1, 0.04, 0.03, 0.08],
      [-0.09, 0.04, -0.03, 0.08],
    ].forEach(([ox, oy, oz, r]) => {
      b.part(ico(1), bush, { at: [x + ox, g + oy, z + oz], scale: [r, r * 0.8, r] });
    });
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.SphereGeometry(0.014, 5, 4), i % 2 ? cel("#ff5a7a") : cel("#ffe14a"), {
        at: [x + 0.08 * Math.cos(k * 2.3 + i), g + 0.08 + 0.03 * k, z + 0.08 * Math.sin(k * 2.3 + i)],
      });
    }
  });

  // Boulders
  [
    [-0.2, -0.95],
    [0.75, -0.75],
    [-1.1, -0.55],
    [-0.6, 0.95],
    [1.0, 0.7],
  ].forEach(([x, z], i) => {
    const g = G(x, z);
    obstacles.push([x, z, 0.22]);
    b.part(ico(1), ROCK_L, {
      at: [x, g + 0.03, z],
      scale: [0.15 + 0.02 * (i % 2), 0.1, 0.13],
      flat: true,
      rotation: [0, i * 50, 0],
    });
    b.part(ico(1), MOSS, { at: [x, g + 0.095, z], scale: [0.12, 0.04, 0.1], flat: true, rotation: [0, i * 50, 0] });
  });

  // ------------------------------------------------------------------------------------------------------------
  // Floating islets
  const islet = (x: number, y: number, z: number, r: number, crystal: string, withPine: boolean) => {
    b.lathe(
      [
        [0, 0],
        [0.4 * r, 0.55 * r],
        [r, 1.0 * r],
        [1.06 * r, 1.18 * r],
        [0, 1.18 * r],
      ],
      { at: [x, y, z], segments: 8, color: ROCK },
    );
    b.lathe(
      [
        [0, 1.14 * r],
        [1.1 * r, 1.14 * r],
        [1.04 * r, 1.24 * r],
        [0.6 * r, 1.32 * r],
        [0, 1.34 * r],
      ],
      { at: [x, y, z], segments: 8, color: CAP },
    );
    glow(
      b.spike([x + 0.2 * r, y + 1.3 * r, z], [0.15, 1, 0.05], 0.28 * r + 0.08, 0.1 * r + 0.012, {
        color: crystal,
        sides: 5,
        smooth: false,
      }),
      1.4,
    );
    if (withPine) {
      b.rod([x - 0.3 * r, y + 1.3 * r, z], [x - 0.3 * r, y + 1.3 * r + 0.1, z], 0.012, { color: BARK, sides: 5 });
      b.part(new THREE.ConeGeometry(0.1, 0.2, 7), cel("#2a8f64"), { at: [x - 0.3 * r, y + 1.3 * r + 0.2, z] });
    }
    b.spike([x, y + 0.2 * r, z], [0, -1, 0], 0.18 * r + 0.05, 0.1 * r, { color: ROCK_D, sides: 6, smooth: false });
  };
  islet(-1.5, 0.75, 0.15, 0.2, "#ff9ad5", true);
  islet(1.45, 0.5, -0.75, 0.15, CRYSTAL, false);
  islet(-1.0, 0.4, -1.1, 0.12, "#ffe08a", false);
  for (let i = 0; i < 12; i++) {
    const a = i * 0.55;
    glow(
      b.part(new THREE.OctahedronGeometry(1), i % 3 ? CRYSTAL : "#ffe08a", {
        at: [Math.cos(a) * (0.5 + 0.09 * i), 1.75 + 0.5 * R(), Math.sin(a) * (0.5 + 0.09 * i) * 0.9],
        scale: 0.014 + 0.006 * R(),
        flat: true,
      }),
      1.3,
    );
  }

  // ------------------------------------------------------------------------------------------------------------
  // Ground cover: tufts and flowers (last, after obstacles are known)
  const skin = b.surface(cap);
  b.cards(
    skin.scatter(260, { rng: rng(31), minDist: 0.07, filter: (h) => h.n.y > 0.85 && free(h.at.x, h.at.z) }),
    tuft,
    { size: [0.09, 0.12], cross: true, vary: 0.35, spin: 180, rng: rng(32) },
  );
  b.cards(
    skin.scatter(80, { rng: rng(33), minDist: 0.12, filter: (h) => h.n.y > 0.85 && free(h.at.x, h.at.z) }),
    flowers,
    { size: [0.06, 0.09], cross: true, vary: 0.3, spin: 180, rng: rng(34) },
  );
  // rim tufts hanging over the edge
  b.cards(
    Array.from({ length: 26 }, (_, i) => {
      const a = i * 0.24;
      const r = 1.3;
      return frame([Math.cos(a) * r, 1.12, Math.sin(a) * r], [0, 1, 0]);
    }).filter((_f, i) => Math.abs(Math.atan2(Math.sin(i * 0.24 - 0.37), Math.cos(i * 0.24 - 0.37))) > 0.3),
    tuft,
    { size: [0.1, 0.16], lean: 180, flow: [0, 0, 1], sink: 0, cross: true },
  );

  return b.root;
}
