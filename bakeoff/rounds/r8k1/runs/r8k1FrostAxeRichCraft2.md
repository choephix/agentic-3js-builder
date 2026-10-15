1. **Handle:** `HC = 1.6`, the haft runs to y = 1.88 at radius 0.043–0.047 (now an 8-sided shaft with slight swells), and the socket, spear and fur collar rise by the same 0.30 m. `gripWrap` is a 12-turn spiral at radius 0.05 from y = 0.42 to about 1.16, in a lighter leather brown so it reads. The end bands moved to 0.38/0.44 and 1.16/1.22, and the ferrule is thicker.
2. **Forged head:** `bladeMain` and `pick` are now custom wedge solids from a new `wedge()` helper. The blade is 0.08 thick over its body and slopes through a broad bevel to a 0.008 cutting edge. The pick is 0.08 at the root and tapers to its fine point. `bladePlate` is a hand-drawn 0.09 thick panel with a shallow rounded rim, and `spearBlade` is 0.045 at the base, tapering. The hub is 0.12 thick, so the 0.08 blade body sits inside it.
3. **Shards:** the two hanging pick shards now start at (0.3, 0.115) and (0.1, −0.045). Every blade shard sinks 0.02 m into the metal (`embed`). The eight "frost ridge" shards are removed, so the crescent has one clean cutting edge.
4. **Fur and ribbons:** there are 17 fur cards (9 + 8) at 0.075 × 0.11, rooted at the torus centre circles, plus 10 solid low-poly cone tufts for volume. Each ribbon is 0.27 m long, hangs at x = ±0.085 from beneath the collar, and flares 0.05 m outward. The gold studs sit on the swallow-tail tips and the top fastening, and the grip stays clear.
5. **Display:** the plinth, foot, rocks, rune planes and cluster positions are scaled to 75% in X/Z. The ground crystals are 0.30 m at most, set at the rear and sides, with the front-centre left open. There are 5 sparks, each within about 0.1 m of the head silhouette.
6. **Heart crystal:** a hexagonal gold bezel, 0.16 × 0.34, is seated on a dark pocket. The faceted crystal projects 0.04 beyond the frame on each face. The hub is about 10% wider with a taller outline, so a dark border sits between the bezel and the retained `hubTrim`.
7. **Frost inlay:** the fern card is 0.42 × 0.58 and sits 0.0015 above a dark panel that fully contains it. Strokes are 4 with a 1.4 core, and glow is 0.5. The pick rune is toned down the same way and tilted to lie on the pick's sloped face. `pickGlint` and `edgeGlint` are thin and dim, so the heart crystal is the strongest light.
8. **Materials:** `BLADE` uses a deep blue body with broad highlights and pale silver only on the bevel and rim. `PLATE`, `HUB` and `STEEL` are low-contrast blue steel, and gold is limited to the bezel, trims, rivets, fastening points and the ferrule ring. Crystals have darker cyan sides and pale tips.

```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  mix,
  noise,
  paint,
  smoothstep,
  grain,
  polyline,
  spiral,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Frost-forged Battle Axe",
  description:
    "A Freljord-style battle axe: a wedge-forged crescent blade with a restrained glowing fern inlay, a tapering ice pick, a gem-set hexagonal heart core, leather-wrapped haft, chunky fur collar and flared cloth tails, planted in a small frozen runic plinth.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette and constants

const HC = 1.6; // height of the axe head centre
const GOLD = "#e2c77a";
const GOLDD = "#a8863c";
const CYANL = "#d2f8ff";
const FURC = "#e9f1f9";
const CRYSTAL_SIDES = ["#2f93c9", "#2579b4", "#48a9d8", "#1f6aa6"];
const CRYSTAL_TIPS = ["#d9f7ff", "#bff0ff", "#e8fcff", "#a8e6fb"];

type Pt = [number, number] | [number, number, "sharp"];
type V = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Paints (large, intentional shapes)

const BLADE = paint((p, n) => {
  const az = Math.abs(n.z);
  if (az < 0.35) return "#f2fdff"; // honed rim
  if (az < 0.985) return mix("#a9c8de", "#d3eaf7", smoothstep(0.1, 0.55, Math.abs(p.x))); // sharpened bevel
  const g = smoothstep(0.05, 0.55, Math.abs(p.x));
  return mix(mix("#263f6c", "#355a8e", g), "#4a77ad", smoothstep(0.58, 0.9, noise(p, 0.3, 5)) * 0.3);
});

const PLATE = paint((p, n) => {
  const az = Math.abs(n.z);
  if (az < 0.4) return "#6a9cc8";
  if (az < 0.98) return "#2f5a92";
  return mix("#14264d", "#1f3a6c", smoothstep(0.55, 0.85, noise(p, 0.3, 8)) * 0.8);
});

const HUB = paint((p, n) =>
  mix(mix("#182a52", "#233f74", smoothstep(0.5, 0.85, noise(p, 0.3, 6)) * 0.7), "#3a5f9a", smoothstep(0.75, 1, n.y) * 0.5),
);

const STEEL = paint((p, n) =>
  mix(mix("#41567e", "#6580ad", noise(p, 0.25, 4) * 0.7), "#a9c0de", smoothstep(0.7, 1, n.y) * 0.4),
);

const HAFT = grain("#1b2a4d", "#2f4a7c", { size: 0.012, axis: "y", seed: 2 });
const LEATHER = paint((p) => mix("#5a4338", "#7e6048", noise(p, 0.03, 2)));

const CLOTH = paint((p, n, s) => {
  if (Math.abs(n.z) < 0.7) return "#0d1a3a";
  if (Math.abs(s[0]) > 0.03) return GOLD;
  if (s[1] > -0.02) return GOLDD;
  return mix("#1f4f9a", "#2f78cc", noise(p, 0.05, 9) * 0.8);
});

const STONE = paint((p, n) => {
  if (n.y > 0.6) return mix("#eaf7ff", "#cde9f6", noise(p, 0.25, 1) * 0.8);
  return mix("#27324d", "#394868", noise(p, 0.25, 2));
});

// ---------------------------------------------------------------------------------------------------------------
// Textures

function frostSvg() {
  let d = "M4 80 C30 76 60 84 94 80";
  for (let i = 0; i < 6; i++) {
    const x = 12 + i * 11;
    const L = 50 - i * 7;
    for (const k of [-1, 1]) {
      const ex = x + L * 0.5;
      const ey = 80 + k * L;
      const mx = x + L * 0.25;
      const my = 80 + k * L * 0.5;
      d += ` M${x} 80 L${ex} ${ey} M${mx} ${my} l${L * 0.32} ${k * L * 0.12}`;
    }
  }
  return svg(
    `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
      <path d="${d}" stroke="#3fb6e0" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${d}" stroke="#d6faff" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M94 80 l6 -4 l0 8z" fill="#bff4ff"/>
    </svg>`,
    { size: 512 },
  );
}
const FROST = frostSvg();

const PICK_RUNE = svg(
  `<svg viewBox="0 0 110 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 92 L104 8" stroke="#3fb6e0" stroke-width="4" stroke-linecap="round"/>
    <path d="M7 92 L104 8" stroke="#d6faff" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M30 72 l-8 -14 M46 58 l-8 -14 M62 44 l-8 -14 M78 30 l-8 -14 M30 72 l12 6 M46 58 l12 6 M62 44 l12 6" stroke="#8fe3f8" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 384 },
);

function runeRingSvg() {
  const glyphs = [
    "M0 -9 L0 9 M0 -9 L7 -2 M0 2 L7 9",
    "M-6 -9 L-6 9 M-6 -9 L6 9 M6 -9 L6 9",
    "M0 -9 L7 0 L0 9 L-7 0 Z",
    "M-6 -9 L6 -9 M0 -9 L0 9 M-6 9 L6 5",
    "M-6 9 L0 -9 L6 9 M-4 2 L4 2",
  ];
  let g = "";
  for (let i = 0; i < 12; i++)
    g += `<g transform="translate(100 100) rotate(${i * 30}) translate(0 -80)"><path d="${glyphs[i % glyphs.length]}" stroke="#9cefff" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  let ticks = "";
  for (let i = 0; i < 36; i++)
    ticks += `<path d="M100 8 L100 14" transform="rotate(${i * 10} 100 100)" stroke="#6fdcff" stroke-width="2.6"/>`;
  return svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="94" fill="none" stroke="#7fe6ff" stroke-width="3"/>
      <circle cx="100" cy="100" r="64" fill="none" stroke="#7fe6ff" stroke-width="2.6"/>
      ${ticks}${g}
    </svg>`,
    { size: 512 },
  );
}
const RUNE_RING = runeRingSvg();

function crackSvg() {
  let d = "";
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    d += `M50 50`;
    for (let k = 1; k <= 4; k++) {
      const aa = a + (k % 2 ? 0.18 : -0.15);
      const r = 8 + k * 9 + (i % 3) * 2;
      d += ` L${(50 + Math.cos(aa) * r).toFixed(1)} ${(50 + Math.sin(aa) * r).toFixed(1)}`;
    }
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="${d}" stroke="#bfeaff" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="9" fill="none" stroke="#e6faff" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );
}
const CRACK = crackSvg();

const RIBBON_RUNE = svg(
  `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4 L34 30 L20 56 L6 30 Z" stroke="#e2c77a" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <path d="M20 14 L20 46 M20 20 L28 30 M20 34 L28 42 M12 24 L20 32" stroke="#8ff0ff" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 160 },
);

const SPARK = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 2 L58 42 L98 50 L58 58 L50 98 L42 58 L2 50 L42 42Z" fill="#e8fcff" stroke="#6fdcff" stroke-width="4" stroke-linejoin="round"/>
  </svg>`,
  { size: 128 },
);

const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 64 Q4 30 12 6 Q16 28 18 64Z" fill="#dce9f6"/>
    <path d="M10 64 Q12 24 18 0 Q24 26 26 64Z" fill="#f4f9ff"/>
    <path d="M18 64 Q22 34 28 12 Q31 36 30 64Z" fill="#c4d8ee"/>
    <path d="M18 60 Q19 30 18 6" stroke="#aac4e0" stroke-width="1.6" fill="none"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Outlines (relative to the head centre; blade on +x, pick drawn on +x and mirrored)

const MAIN: Pt[] = [
  [0.03, 0.24],
  [0.18, 0.3],
  [0.34, 0.42],
  [0.5, 0.58, "sharp"],
  [0.47, 0.4],
  [0.56, 0.26],
  [0.63, 0.08],
  [0.65, -0.1],
  [0.6, -0.28],
  [0.5, -0.46],
  [0.4, -0.6, "sharp"],
  [0.34, -0.42],
  [0.2, -0.3],
  [0.03, -0.22],
];

// A hand-drawn dark panel that sits inside the blade's flat body and holds the fern inlay.
const PANEL: Pt[] = [
  [0.04, 0.16],
  [0.17, 0.215],
  [0.3, 0.29],
  [0.4, 0.3],
  [0.45, 0.2],
  [0.5, 0.09],
  [0.51, -0.07],
  [0.46, -0.19],
  [0.4, -0.27],
  [0.3, -0.25],
  [0.17, -0.21],
  [0.04, -0.14],
];

const PICK: Pt[] = [
  [0.0, 0.16],
  [0.18, 0.22],
  [0.36, 0.34],
  [0.54, 0.52],
  [0.68, 0.7, "sharp"],
  [0.57, 0.4],
  [0.42, 0.22],
  [0.25, 0.04],
  [0.0, -0.14],
];

// Hub: ~10% wider, a little taller than before.
const KITE: Pt[] = [
  [-0.077, 0.24],
  [0.077, 0.24],
  [0.127, 0.065],
  [0.127, -0.065],
  [0.077, -0.24],
  [-0.077, -0.24],
  [-0.127, -0.065],
  [-0.127, 0.065],
];

// Elongated hexagonal bezel: 0.16 wide x 0.34 high.
const BEZ: Pt[] = [
  [0, 0.17],
  [0.08, 0.085],
  [0.08, -0.085],
  [0, -0.17],
  [-0.08, -0.085],
  [-0.08, 0.085],
];

// ---------------------------------------------------------------------------------------------------------------
// Wedge solid: a thin edge ring at the outline and an inset, thicker flat body, joined by a broad bevel.
// The inset ring is an affine copy of the outline about c, so it stays a simple polygon. tb(x,y) is the half
// thickness of the body at an inner vertex (linear in x,y gives a planar sloped face). sx mirrors in x.

function wedge(
  pts: Pt[],
  o: { c: [number, number]; k: [number, number]; te: number; tb: (x: number, y: number) => number; sx?: number },
) {
  const sx = o.sx ?? 1;
  const P: [number, number][] = pts.map((p) => [p[0], p[1]]);
  let area = 0;
  for (let i = 0; i < P.length; i++) {
    const a = P[i];
    const c = P[(i + 1) % P.length];
    area += a[0] * sx * c[1] - c[0] * sx * a[1];
  }
  if (area < 0) P.reverse();
  const n = P.length;
  const I2: [number, number][] = P.map((p) => [o.c[0] + (p[0] - o.c[0]) * o.k[0], o.c[1] + (p[1] - o.c[1]) * o.k[1]]);
  const E = (i: number, s: number) => new THREE.Vector3(P[i][0] * sx, P[i][1], s * o.te);
  const I = (i: number, s: number) => new THREE.Vector3(I2[i][0] * sx, I2[i][1], s * o.tb(I2[i][0], I2[i][1]));
  const pos: number[] = [];
  const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) =>
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    tri(E(i, 1), E(j, 1), I(j, 1));
    tri(E(i, 1), I(j, 1), I(i, 1));
    tri(E(j, -1), E(i, -1), I(i, -1));
    tri(E(j, -1), I(i, -1), I(j, -1));
    tri(E(i, 1), E(i, -1), E(j, -1));
    tri(E(i, 1), E(j, -1), E(j, 1));
  }
  const contour = I2.map((p) => new THREE.Vector2(p[0] * sx, p[1]));
  const tris = THREE.ShapeUtils.triangulateShape(
    contour.map((v) => v.clone()),
    [],
  );
  for (const [a, b, c] of tris) {
    const va = contour[a];
    const vb = contour[b];
    const vc = contour[c];
    const cross = (vb.x - va.x) * (vc.y - va.y) - (vb.y - va.y) * (vc.x - va.x);
    const [q, r] = cross >= 0 ? [b, c] : [c, b];
    tri(I(a, 1), I(q, 1), I(r, 1));
    tri(I(a, -1), I(r, -1), I(q, -1));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

export default function build() {
  const b = createBuilder({ name: "frostAxe" });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(21);

  // --------------------------------------------------------------------------------------------------------
  // Helpers

  const P3 = (x: number, y: number, z = 0): V => [x, HC + y, z];

  function planeGeo(w: number, h: number, flip: boolean) {
    const g = new THREE.PlaneGeometry(w, h);
    if (flip) {
      const uv = g.getAttribute("uv");
      for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
    }
    return g;
  }

  // A faceted crystal: darker cyan sides, pale tip, base sunk `embed` metres into its support.
  function crystal(
    base: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    r: number,
    tone: number,
    g = 0.3,
    embed = 0.02,
  ) {
    const d = dir.clone().normalize();
    const bodyLen = len * 0.62;
    const start = base.clone().addScaledVector(d, -embed);
    const body = b.part(new THREE.CylinderGeometry(r * 0.85, r, bodyLen + embed, 6, 1), CRYSTAL_SIDES[tone % 4], {
      at: start.clone().addScaledVector(d, (bodyLen + embed) / 2),
      dir: d,
      flat: true,
    });
    const tip = b.part(new THREE.ConeGeometry(r * 0.85, len * 0.38, 6, 1), CRYSTAL_TIPS[tone % 4], {
      at: base.clone().addScaledVector(d, bodyLen + len * 0.19),
      dir: d,
      flat: true,
    });
    if (g > 0) {
      glow(body, g);
      glow(tip, g * 1.8);
    }
  }

  // a frost crystal growing off a blade edge, mirrored by s
  function bladeShard(
    s: number,
    x: number,
    y: number,
    dx: number,
    dy: number,
    dz: number,
    len: number,
    r: number,
    tone = 0,
    embed = 0.02,
  ) {
    crystal(new THREE.Vector3(s * x, HC + y, 0), new THREE.Vector3(s * dx, dy, dz), len, r, tone, 0.3, embed);
  }

  // --------------------------------------------------------------------------------------------------------
  // Base: small frozen runic plinth (75% footprint)

  b.lathe(
    [
      [0, 0],
      [0.375, 0],
      [0.42, 0.05],
      [0.4125, 0.1],
      [0.375, 0.14],
      [0.33, 0.17],
      [0, 0.17],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: STONE, name: "plinth" },
  );
  b.lathe(
    [
      [0, 0],
      [0.45, 0],
      [0.45, 0.03],
      [0.405, 0.05],
      [0, 0.05],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: "#222d44", name: "plinthFoot" },
  );

  glow(
    b.part(planeGeo(0.68, 0.68, false), "#ffffff", {
      at: [0, 0.174, 0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: RUNE_RING,
    }),
    0.7,
  );
  b.part(planeGeo(0.375, 0.375, false), "#ffffff", {
    at: [0, 0.178, 0],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: CRACK,
  });

  // rocks around the rim, mostly rear and sides
  for (const [deg, r] of [
    [75, 0.1],
    [118, 0.11],
    [160, 0.09],
    [205, 0.12],
    [250, 0.1],
    [290, 0.1],
    [50, 0.055],
    [-50, 0.06],
  ] as [number, number][]) {
    const a = (deg * Math.PI) / 180;
    b.part(new THREE.IcosahedronGeometry(r, 0), STONE, {
      at: [Math.sin(a) * 0.375, 0.1 + r * 0.25, Math.cos(a) * 0.375],
      scale: [1.25, 0.8, 1],
      rotation: [R() * 40, R() * 360, R() * 30],
      flat: true,
    });
  }

  // ice crystal clusters: tall at the rear and sides, low at the front, front-centre open
  const clusters: [number, number, number][] = [
    [110, 0.37, 0.26],
    [150, 0.36, 0.3],
    [195, 0.37, 0.29],
    [240, 0.37, 0.26],
    [285, 0.37, 0.24],
    [70, 0.36, 0.2],
    [320, 0.36, 0.16],
    [40, 0.38, 0.11],
    [-40, 0.38, 0.11],
  ];
  clusters.forEach(([deg, rad, H], ci) => {
    const a = (deg * Math.PI) / 180;
    const bx = Math.sin(a) * rad;
    const bz = Math.cos(a) * rad;
    for (let k = 0; k < 3; k++) {
      const out = 0.25 + R() * 0.3;
      const dir = new THREE.Vector3(Math.sin(a) * out + (R() - 0.5) * 0.4, 1, Math.cos(a) * out + (R() - 0.5) * 0.4);
      const len = H * (k === 0 ? 1 : 0.5 + R() * 0.3);
      crystal(
        new THREE.Vector3(bx + (R() - 0.5) * 0.06, 0.12, bz + (R() - 0.5) * 0.06),
        dir,
        len,
        len * 0.16,
        ci + k,
        0.2,
        0.03,
      );
    }
  });

  // --------------------------------------------------------------------------------------------------------
  // Haft: heavier shaft, leather grip

  b.sweep(
    [
      [0, 0.12, 0],
      [0, 1.88, 0],
    ],
    [0.043, 0.047, 0.043, 0.047, 0.043],
    { sides: 8, color: HAFT, caps: "flat", name: "haft" },
  );

  const wrap = spiral([0, 0.42, 0], [0.05, 0.42, 0], [0, 1, 0], { turns: 12.3, pitch: 0.06, r1: 0.05 });
  b.sweep(wrap, 0.008, { sides: 5, color: LEATHER, name: "gripWrap" });

  // grip end bands (steel), gold limited to a narrow trim ring and a few fastening studs
  for (const y of [0.38, 0.44, 1.16, 1.22]) {
    b.part(new THREE.TorusGeometry(0.053, 0.01, 5, 10), STEEL, { at: [0, y, 0], dir: [0, 1, 0], axis: "z", flat: true });
  }
  b.part(new THREE.TorusGeometry(0.052, 0.006, 5, 10), GOLD, { at: [0, 1.19, 0], dir: [0, 1, 0], axis: "z", flat: true });
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, { at: [Math.sin(a) * 0.058, 1.22, Math.cos(a) * 0.058] });
  }

  // ferrule (butt) planted in the plinth
  b.lathe(
    [
      [0, 0],
      [0.058, 0],
      [0.06, 0.02],
      [0.052, 0.06],
      [0.048, 0.14],
      [0.058, 0.16],
      [0, 0.16],
    ],
    { at: [0, 0.15, 0], segments: 8, color: STEEL, name: "ferrule" },
  );
  b.part(new THREE.TorusGeometry(0.057, 0.007, 5, 8), GOLD, { at: [0, 0.2, 0], dir: [0, 1, 0], axis: "z", flat: true });

  // --------------------------------------------------------------------------------------------------------
  // Fur collar: two chunky toruses, 17 broad cards, and solid tapered tufts

  const FUR_Y1 = HC - 0.3;
  const FUR_Y2 = HC - 0.35;
  b.part(new THREE.TorusGeometry(0.06, 0.03, 5, 9), FURC, { at: [0, FUR_Y1, 0], dir: [0, 1, 0], axis: "z", flat: true });
  b.part(new THREE.TorusGeometry(0.056, 0.026, 5, 9), "#c9dcef", {
    at: [0, FUR_Y2, 0],
    dir: [0, 1, 0],
    axis: "z",
    flat: true,
  });
  const furRng = rng(5);
  for (const [y, count, rad] of [
    [FUR_Y1, 9, 0.06],
    [FUR_Y2, 8, 0.056],
  ] as [number, number, number][]) {
    const ring = b.ring(frame([0, y, 0], [0, 1, 0]), { count, radius: rad });
    b.cards(ring.items, TUFT, {
      size: [0.075, 0.11],
      lean: 60,
      flow: [0, -1, 0],
      bend: 25,
      vary: 0.2,
      spin: 8,
      sink: 0.25,
      rng: furRng,
    });
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + (i % 2) * 0.15;
    const dir = new THREE.Vector3(Math.sin(a) * 0.8, -0.6, Math.cos(a) * 0.8).normalize();
    const base = new THREE.Vector3(Math.sin(a) * 0.064, HC - 0.32, Math.cos(a) * 0.064);
    b.part(new THREE.ConeGeometry(0.03, 0.11, 5, 1), i % 2 ? "#d4e3f2" : "#eef5fc", {
      at: base.clone().addScaledVector(dir, 0.045),
      dir,
      flat: true,
    });
  }

  // --------------------------------------------------------------------------------------------------------
  // Ribbons: attached under the collar, flaring outward, tip studs on the tails

  for (const s of [1, -1]) {
    const k = 0.19;
    const L = Math.hypot(1, k);
    const xdir: V = [1 / L, (s * k) / L, 0];
    const ydir: V = [(-s * k) / L, 1 / L, 0];
    const origin = new THREE.Vector3(s * 0.085, HC - 0.34, 0);
    const at = (u: number, v: number, z = 0) =>
      new THREE.Vector3(
        origin.x + xdir[0] * u + ydir[0] * v,
        origin.y + xdir[1] * u + ydir[1] * v,
        z,
      );
    const rib: Pt[] = [
      [-0.035, 0],
      [0.035, 0],
      [0.038, -0.27],
      [0, -0.2],
      [-0.038, -0.27],
    ];
    b.extrude(rib, {
      at: origin,
      x: xdir,
      y: ydir,
      thickness: 0.008,
      bevel: 0.002,
      color: CLOTH,
      name: "ribbon",
    });
    for (const zs of [1, -1]) {
      glow(
        b.part(planeGeo(0.045, 0.07, false), "#ffffff", {
          at: at(0, -0.12, zs * 0.0055),
          dir: [0, 0, zs],
          axis: "z",
          up: ydir,
          texture: RIBBON_RUNE,
        }),
        0.6,
      );
    }
    b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, { at: at(0, -0.008) }); // fastening stud
    b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, { at: at(-0.038, -0.27) }); // tip studs
    b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, { at: at(0.038, -0.27) });
  }

  // --------------------------------------------------------------------------------------------------------
  // Hub, bezel and heart crystal

  b.extrude(KITE, { at: [0, HC, 0], x: [1, 0, 0], thickness: 0.12, bevel: 0.014, color: HUB, name: "hub" });

  for (const zs of [1, -1]) {
    const trim = KITE.map((p) => [p[0] * 0.88, HC + p[1] * 0.88, zs * 0.061] as V);
    b.sweep(polyline(trim, { closed: true }), 0.005, { sides: 5, color: GOLD, name: "hubTrim" });
    for (const [x, y] of [
      [0.068, 0.211],
      [-0.068, 0.211],
      [0.068, -0.211],
      [-0.068, -0.211],
    ]) {
      b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, { at: [x, HC + y, zs * 0.062] });
    }
  }

  // beveled hex frame (gold rim) around a dark pocket
  b.extrude(BEZ, { at: [0, HC, 0], x: [1, 0, 0], thickness: 0.14, bevel: 0.007, color: GOLD, name: "bezel" });
  b.extrude(
    BEZ.map((p) => [p[0] * 0.78, p[1] * 0.78] as Pt),
    { at: [0, HC, 0], x: [1, 0, 0], thickness: 0.128, bevel: 0.004, color: "#0b1632", name: "bezelPocket" },
  );

  // heart crystal: faceted, projecting 0.04 past the frame on each face
  glow(
    b.part(new THREE.SphereGeometry(1, 6, 5), "#8fe9ff", {
      at: [0, HC, 0],
      scale: [0.058, 0.12, 0.11],
      flat: true,
      name: "heartCrystal",
    }),
    1.0,
  );

  // collars above and below hub
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.076, 0.02],
      [0.076, 0.05],
      [0.06, 0.08],
      [0, 0.08],
    ],
    { at: [0, HC - 0.3, 0], segments: 8, color: STEEL, name: "lowerCollar" },
  );
  b.part(new THREE.TorusGeometry(0.074, 0.007, 5, 8), GOLD, {
    at: [0, HC - 0.26, 0],
    dir: [0, 1, 0],
    axis: "z",
    flat: true,
  });

  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.078, 0.02],
      [0.062, 0.045],
      [0.062, 0.09],
      [0.074, 0.1],
      [0.074, 0.12],
      [0.046, 0.14],
      [0, 0.14],
    ],
    { at: [0, HC + 0.2, 0], segments: 8, color: STEEL, name: "socket" },
  );
  b.part(new THREE.TorusGeometry(0.075, 0.006, 5, 8), GOLD, {
    at: [0, HC + 0.27, 0],
    dir: [0, 1, 0],
    axis: "z",
    flat: true,
  });

  // spear tip, thick at the base and tapering
  b.extrude(
    [
      [-0.04, 0],
      [0.04, 0],
      [0.07, 0.13],
      [0, 0.37, "sharp"],
      [-0.07, 0.13],
    ],
    {
      at: [0, HC + 0.34, 0],
      x: [1, 0, 0],
      thickness: [0.045, 0.006],
      bevel: 0.006,
      color: BLADE,
      name: "spearBlade",
    },
  );
  glow(
    b.extrude(
      [
        [-0.014, 0.03],
        [0.014, 0.03],
        [0.026, 0.13],
        [0, 0.3],
        [-0.026, 0.13],
      ],
      { at: [0, HC + 0.34, 0], x: [1, 0, 0], thickness: [0.05, 0.022], color: CYANL, name: "spearFuller" },
    ),
    0.6,
  );

  // --------------------------------------------------------------------------------------------------------
  // Main crescent blade: wedge body (0.08 thick) sloping to a 0.008 edge, with a dark inlay panel

  b.part(wedge(MAIN, { c: [0.2, 0], k: [0.8, 0.85], te: 0.004, tb: () => 0.04 }), BLADE, {
    at: [0, HC, 0],
    name: "bladeMain",
  });
  b.extrude(PANEL, {
    at: [0, HC, 0],
    x: [1, 0, 0],
    thickness: 0.09,
    bevel: 0.01,
    smoothing: 1,
    color: PLATE,
    name: "bladePlate",
  });

  // thin glowing cutting edge
  const edge = [
    [0.47, 0.4],
    [0.56, 0.26],
    [0.63, 0.08],
    [0.65, -0.1],
    [0.6, -0.28],
    [0.5, -0.46],
  ].map(([x, y]) => P3(x, y));
  glow(b.sweep(polyline(edge), 0.004, { sides: 5, color: CYANL, name: "edgeGlint" }), 0.6);

  // frost fern inlay, fully inside the plate, 1.5 mm above its faces
  for (const zs of [1, -1]) {
    glow(
      b.part(planeGeo(0.42, 0.58, zs < 0), "#ffffff", {
        at: [0.3, HC, zs * 0.0465],
        dir: [0, 0, zs],
        axis: "z",
        texture: FROST,
      }),
      0.5,
    );
  }

  // frost crystals sprouting from the blade's back edges
  bladeShard(1, 0.2, 0.31, -0.15, 1, 0.05, 0.28, 0.034, 0);
  bladeShard(1, 0.1, 0.27, 0.05, 1, -0.05, 0.2, 0.028, 2);
  bladeShard(1, 0.3, 0.39, 0.05, 1, 0.12, 0.16, 0.024, 1);
  bladeShard(1, 0.2, -0.3, -0.1, -1, 0, 0.22, 0.03, 0);
  bladeShard(1, 0.3, -0.385, 0.2, -1, 0.05, 0.15, 0.024, 3);

  // --------------------------------------------------------------------------------------------------------
  // Ice-pick fang: wedge root 0.08 thick, tapering to a fine point

  const A = 0.042;
  const pa = 0.02727;
  const pb = 0.01636;
  b.part(wedge(PICK, { c: [0.3, 0.15], k: [0.8, 0.75], te: 0.004, tb: (x, y) => A - pa * x - pb * y, sx: -1 }), BLADE, {
    at: [0, HC, 0],
    name: "pick",
  });
  // rune card laid on the sloped face (centre at outline 0.31, 0.26)
  const pz = A - pa * 0.31 - pb * 0.26 + 0.0015;
  for (const zs of [1, -1]) {
    glow(
      b.part(planeGeo(0.5, 0.45, zs < 0), "#ffffff", {
        at: [-0.31, HC + 0.26, zs * pz],
        dir: [-pa, pb, zs],
        axis: "z",
        texture: PICK_RUNE,
      }),
      0.5,
    );
  }
  // thin glowing spine along the pick's upper edge
  const pickEdge = [
    [0.18, 0.22],
    [0.36, 0.34],
    [0.54, 0.52],
    [0.66, 0.68],
  ].map(([x, y]) => P3(-x, y));
  glow(b.sweep(polyline(pickEdge), 0.004, { sides: 5, color: CYANL, name: "pickGlint" }), 0.5);

  bladeShard(-1, 0.24, 0.26, 0.2, 1, 0.1, 0.18, 0.026, 0);
  bladeShard(-1, 0.4, 0.37, 0.15, 1, -0.1, 0.15, 0.022, 1);
  bladeShard(-1, 0.3, 0.115, 0.1, -1, 0, 0.18, 0.024, 3, 0);
  bladeShard(-1, 0.1, -0.045, -0.1, -1, 0.1, 0.16, 0.024, 2, 0);

  // --------------------------------------------------------------------------------------------------------
  // A few frost sparkles hugging the head's silhouette

  const sparkFrames = (
    [
      [0.54, HC + 0.66, 0.04],
      [0.66, HC + 0.3, 0.1],
      [-0.74, HC + 0.74, 0.05],
      [0.5, HC - 0.68, 0.08],
      [-0.45, HC + 0.52, 0.1],
    ] as V[]
  ).map((p) => frame(p, [0, 1, 0]));
  glow(b.cards(sparkFrames, SPARK, { size: 0.065, lean: 0, flow: [0, 0, 1], vary: 0.3, spin: 20, rng: rng(9) }), 1.0);

  return b.root;
}
```