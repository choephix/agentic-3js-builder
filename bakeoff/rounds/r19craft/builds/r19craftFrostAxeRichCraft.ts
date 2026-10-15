// Glacierfang: a frost-forged battle axe on an icy rune plinth, League of Legends style: exaggerated crescent blades,
// saturated cyan magic against deep indigo steel and gold trim, readable from a high top-down camera.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { grain, mix, mottle, noise, paint, patches, smoothstep } from "../../../../src/paint";
import type { ColorInput, Rgb } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Glacierfang, Frost-Forged Battle Axe",
  description:
    "A towering frost-forged battle axe on a rune-lit ice plinth: a huge crescent main blade with glowing glacier veins, a small counter-blade, a crystal spearhead, gold brackets and a frost banner.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const DEEP = "#1c3a7a";
const MID = "#3d86d8";
const ICE = "#a8ecff";
const WHITE = "#effcff";
const CYAN = "#5af0ff";
const GOLD = "#f2bf45";
const STEEL = cel("#7f9bd0", "#465a94");
const STEEL_DARK = cel("#34457c", "#1c2750");
const GOLD_CEL = cel("#f2bf45", "#b97a1c");
const WOOD = cel(grain("#223060", "#38498c", { size: 0.006, axis: "y" }));
const LEATHER = cel(
  paint((_p, _n, s) => {
    const ph = (((s[1] / 360 - s[0] * 11) % 1) + 1) % 1;
    return ph < 0.16 ? "#0e1b3d" : ph < 0.2 ? "#7a98cf" : "#2f4a80";
  }),
);
const SOCKET = cel(paint((_p, _n, s) => (Math.abs(Math.abs(s[0]) - 0.2) < 0.005 ? INK : "#4a6aa8")));
const PLINTH_TOP = mottle(WHITE, "#9fdcf3", { size: 0.05, seed: 2 });
const PLINTH_SIDE = cel(patches("#0e1530", ["#223468", "#2a407a", "#1d2d5c"], { size: 0.07, gap: 0.08, seed: 5 }));
const PLINTH = paint((_p, n) => (n.y > 0.5 ? PLINTH_TOP : PLINTH_SIDE));

const CLOTH = paint((_p, n, s) => {
  if (Math.abs(n.z) < 0.5) return GOLD;
  const x = s[0];
  const y = s[1];
  if (y > -0.014 || Math.abs(x) > 0.028) return GOLD;
  const d = Math.abs(x) * 1.4 + Math.abs(y + 0.09);
  if (d < 0.026) return CYAN;
  if (d < 0.05) return WHITE;
  return mix("#2f6ad0", "#16358a", Math.min(Math.max(-y / 0.24, 0), 1));
});

const SPEAR = paint((_p, _n, s) => mix("#4aa6ec", WHITE, Math.min(Math.max(s[1] / 0.36, 0), 1)));

const bladePaint = (k: number) =>
  paint((p, n, s) => {
    if (Math.abs(n.z) < 0.5) return "#d6f6ff";
    const x = s[0] / k;
    const y = s[1] / k;
    const u = x / 0.52;
    const cloud = noise(p, 0.07, 4);
    const t = Math.min(Math.max(smoothstep(0.05, 0.98, u) + (cloud - 0.5) * 0.3, 0), 1);
    let c: Rgb = t < 0.5 ? mix(DEEP, MID, t * 2) : mix(MID, ICE, (t - 0.5) * 2);
    const d = (x * 0.8 + y * 0.6) / 0.07;
    const f = Math.abs(d - Math.round(d));
    if (f < 0.05 && u > 0.28 && noise(p, 0.09, 8) > 0.42) c = mix(c, "#f2fdff", 0.6);
    if (u < 0.14) c = mix(c, DEEP, 0.45);
    return c;
  });

// ---------------------------------------------------------------------------------------------------------------
// Outline helpers (all meters)
function xform(pts: readonly OutlinePoint[], f: (x: number, y: number) => [number, number]): OutlinePoint[] {
  const out: OutlinePoint[] = [];
  for (const p of pts) {
    const [x, y] = f(p[0], p[1]);
    if (p.length === 3) out.push([x, y, "sharp"]);
    else out.push([x, y]);
  }
  return out;
}
const scaleOutline = (pts: readonly OutlinePoint[], k: number, cx = 0, cy = 0) =>
  xform(pts, (x, y) => [cx + (x - cx) * k, cy + (y - cy) * k]);
const mirrorY = (pts: readonly OutlinePoint[]) => xform(pts, (x, y) => [x, -y]).reverse();

// The main crescent blade as drawn (origin on the haft axis at head height, +x out from the haft).
const BLADE_RAW: OutlinePoint[] = [
  [0.03, 0.17],
  [0.075, 0.3],
  [0.13, 0.45],
  [0.2, 0.6, "sharp"],
  [0.34, 0.51],
  [0.44, 0.36],
  [0.5, 0.16],
  [0.515, -0.02],
  [0.49, -0.2],
  [0.42, -0.36],
  [0.32, -0.49],
  [0.215, -0.57, "sharp"],
  [0.15, -0.44],
  [0.09, -0.3],
  [0.03, -0.16],
];

// Gold bracket clamping the upper blade root (main blade size); the lower one is its mirror.
const BRACKET: OutlinePoint[] = [
  [0.02, 0.1],
  [0.075, 0.11],
  [0.13, 0.15],
  [0.16, 0.235, "sharp"],
  [0.105, 0.19],
  [0.06, 0.165],
  [0.02, 0.16],
];

const LEAF: OutlinePoint[] = [
  [-0.034, 0],
  [-0.046, 0.07],
  [-0.036, 0.2],
  [0, 0.36, "sharp"],
  [0.036, 0.2],
  [0.046, 0.07],
  [0.034, 0],
];

const LANGET: OutlinePoint[] = [
  [-0.02, 0],
  [0.02, 0],
  [0.02, -0.34],
  [0, -0.4, "sharp"],
  [-0.02, -0.34],
];

const PENNANT: OutlinePoint[] = [
  [-0.036, 0],
  [0.036, 0],
  [0.033, -0.24],
  [0, -0.18, "sharp"],
  [-0.033, -0.24],
];

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const RUNE_PATHS = [
  "M 36 68 C 60 85 72 105 72 125 C 72 145 60 165 36 182",
  "M 63 125 L 82 125",
  "M 70 125 L 76 117 M 70 125 L 76 133",
  "M 77 125 L 81 120 M 77 125 L 81 130",
  "M 58 114 L 68 98 L 70 88",
  "M 58 136 L 68 152 L 70 162",
  "M 36 34 C 40 54 44 72 46 92",
  "M 38 216 C 40 192 44 172 46 158",
];

function runeTexture(mirror: boolean) {
  const strokes = (w: number, c: string) =>
    RUNE_PATHS.map(
      (d) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`,
    ).join("");
  const dots = [
    [24, 44],
    [30, 204],
    [80, 70],
    [80, 180],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#8ff8ff"/>`)
    .join("");
  const body = `${strokes(3.6, "#35d9ff")}${strokes(1.3, "#ffffff")}${dots}`;
  return svg(
    `<svg viewBox="0 0 100 240">${mirror ? `<g transform="translate(100 0) scale(-1 1)">${body}</g>` : body}</svg>`,
    { size: 720 },
  );
}

function plinthTexture() {
  let marks = "";
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r0 = i % 3 === 0 ? 76 : 82;
    marks += `<line x1="${100 + Math.sin(a) * r0}" y1="${100 + Math.cos(a) * r0}" x2="${100 + Math.sin(a) * 90}" y2="${100 + Math.cos(a) * 90}"/>`;
  }
  let chevrons = "";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const cx = 100 + Math.sin(a) * 66;
    const cy = 100 + Math.cos(a) * 66;
    const deg = (-a * 180) / Math.PI;
    chevrons += `<path transform="translate(${cx} ${cy}) rotate(${deg})" d="M -6 -5 L 0 5 L 6 -5"/>`;
  }
  const star = (r: number, rot: number) => {
    const pts = [0, 1, 2]
      .map((i) => {
        const a = rot + (i / 3) * Math.PI * 2;
        return `${100 + Math.sin(a) * r},${100 + Math.cos(a) * r}`;
      })
      .join(" ");
    return `<polygon points="${pts}"/>`;
  };
  const art = `<circle cx="100" cy="100" r="95"/><circle cx="100" cy="100" r="54"/>${marks}${chevrons}${star(50, 0)}${star(50, Math.PI)}`;
  return svg(
    `<svg viewBox="0 0 200 200"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="#35d9ff" stroke-width="3.6">${art}</g><g stroke="#ffffff" stroke-width="1.2">${art}</g></g></svg>`,
    { size: 768 },
  );
}

const FROST_SHARD = svg(
  `<svg viewBox="0 0 32 64">
    <path d="M16 2 L21 26 L26 12 L24 40 L30 30 L22 62 L10 62 L3 26 L9 40 L7 14 L11 28 Z" fill="#cdf6ff" stroke="#4fc4ee" stroke-width="2" stroke-linejoin="round"/>
    <path d="M16 8 L16 58 M11 34 L16 22 L21 34" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "frostAxe" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);

  const HY = 0.92; // head centre height
  const gold: THREE.BufferGeometry[] = [];
  const rivet = (x: number, y: number, z: number, r = 0.007) =>
    gold.push(new THREE.SphereGeometry(r, 6, 4).translate(x, y, z));

  const band = (y: number, r: number, h: number, color: ColorInput) =>
    b.lathe(
      [
        [r - 0.006, -h / 2],
        [r, -h / 2 + 0.003],
        [r, h / 2 - 0.003],
        [r - 0.006, h / 2],
      ],
      { at: [0, y, 0], segments: 8, color },
    );

  const crystal = (base: number[], dir: number[], len: number, r: number, color: string, g = 0) => {
    const s = b.spike(base, dir, len, r, color, { section: { ngon: 6 } });
    if (g) glow(s, g);
  };

  // ---- Plinth -----------------------------------------------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.36, 0],
      [0.36, 0.045],
      [0.315, 0.075],
      [0.3, 0.075],
      [0.3, 0.12],
      [0.265, 0.15],
      [0, 0.15],
    ],
    { at: [0, 0, 0], segments: 8, color: PLINTH },
  );
  glow(
    b.part(new THREE.CircleGeometry(0.25, 24), "#ffffff", {
      at: [0, 0.153, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: plinthTexture(),
    }),
    1.1,
  );
  const studs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    studs.push(new THREE.OctahedronGeometry(0.022).scale(1, 1.4, 1).translate(Math.sin(a) * 0.29, 0.097, Math.cos(a) * 0.29));
  }
  glow(b.part(mergeGeometries(studs)!, CYAN, { bone: root, at: [0, 0, 0], flat: true }), 1.3);

  // frost around the haft and on the rim
  const rimFrames = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + R() * 0.2;
    rimFrames.push(frame([Math.sin(a) * 0.255, 0.146, Math.cos(a) * 0.255], [0, 1, 0]));
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + R() * 0.4;
    const r = 0.1 + R() * 0.07;
    rimFrames.push(frame([Math.sin(a) * r, 0.148, Math.cos(a) * r], [0, 1, 0]));
  }
  b.cards(rimFrames, FROST_SHARD, { size: [0.055, 0.1], lean: 10, cross: true, vary: 0.35, spin: 180, rng: rng(5) });

  const SHARD_COLORS = ["#bdf4ff", "#7fdcff", "#e8fbff", "#58c0f0"];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    const lean = 0.45 + R() * 0.4;
    const len = 0.13 + R() * 0.17;
    crystal(
      [Math.sin(a) * 0.055, 0.14, Math.cos(a) * 0.055],
      [Math.sin(a) * lean, 1, Math.cos(a) * lean],
      len,
      0.02 + R() * 0.014,
      SHARD_COLORS[i % 4],
      i % 4 === 0 ? 1.1 : 0,
    );
  }

  // ---- Haft -------------------------------------------------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.034, 0],
      [0.052, 0.025],
      [0.036, 0.075],
      [0.034, 0.13],
      [0.046, 0.14],
      [0.046, 0.16],
      [0.034, 0.17],
      [0, 0.17],
    ],
    { at: [0, 0.13, 0], segments: 8, color: STEEL },
  );
  band(0.31, 0.034, 0.014, GOLD_CEL);
  b.rod([0, 0.13, 0], [0, HY + 0.27, 0], 0.024, WOOD, { sides: 8 });
  b.rod([0, 0.46, 0], [0, 0.8, 0], 0.0285, LEATHER, { sides: 8 });
  band(0.34, 0.03, 0.02, GOLD_CEL);
  band(0.375, 0.029, 0.008, STEEL_DARK);
  band(0.46, 0.0325, 0.016, GOLD_CEL);
  band(0.8, 0.0325, 0.016, GOLD_CEL);
  band(HY - 0.295, 0.03, 0.014, GOLD_CEL);

  // ---- Socket and spearhead ----------------------------------------------------------------------------------
  b.lathe(
    [
      [0, -0.26],
      [0.038, -0.26],
      [0.056, -0.24],
      [0.056, -0.215],
      [0.046, -0.2],
      [0.046, 0.2],
      [0.056, 0.215],
      [0.056, 0.24],
      [0.038, 0.26],
      [0.03, 0.28],
      [0, 0.28],
    ],
    { at: [0, HY, 0], segments: 8, color: SOCKET },
  );
  for (const dy of [-0.23, 0.23]) band(HY + dy, 0.062, 0.022, GOLD_CEL);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    for (const dy of [-0.11, 0.11]) rivet(Math.sin(a) * 0.05, HY + dy, Math.cos(a) * 0.05, 0.006);
  }

  const spearAt: [number, number, number] = [0, HY + 0.27, 0];
  b.extrude(LEAF, { at: spearAt, x: [1, 0, 0], thickness: 0.022, bevel: 0.006, color: SPEAR });
  b.extrude(scaleOutline(LEAF, 0.72), { at: spearAt, x: [0, 0, 1], thickness: 0.018, bevel: 0.005, color: SPEAR });
  glow(
    b.extrude(scaleOutline(LEAF, 0.4, 0, 0.12), {
      at: spearAt,
      x: [1, 0, 0],
      thickness: 0.028,
      bevel: 0.004,
      color: CYAN,
    }),
    1.3,
  );

  // ---- Langets, rivets and banner ----------------------------------------------------------------------------
  for (const s of [1, -1]) {
    b.extrude(LANGET, {
      at: [s * 0.0285, HY - 0.22, 0],
      x: [0, 0, 1],
      thickness: 0.008,
      bevel: 0.002,
      color: STEEL,
    });
    for (const dy of [-0.26, -0.32, -0.38]) for (const z of [-0.009, 0.009]) rivet(s * 0.034, HY + dy, z, 0.0055);
  }
  b.extrude(PENNANT, { at: [0, HY - 0.3, 0.032], x: [1, 0, 0], thickness: 0.006, bevel: 0.0015, color: CLOTH });
  rivet(0, HY - 0.305, 0.037, 0.008);

  // ---- Blades -----------------------------------------------------------------------------------------------
  function blade(k: number, side: 1 | -1, thick: number) {
    const r = k / 0.8;
    const O = scaleOutline(BLADE_RAW, k);
    const cx = 0.27 * k;
    const at: [number, number, number] = [0, HY, 0];
    const X: [number, number, number] = [side, 0, 0];
    b.extrude(scaleOutline(O, 1.035, cx, 0), { at, x: X, thickness: thick * 0.45, color: INK });
    b.extrude(O, { at, x: X, thickness: thick * 0.62, bevel: 0.004, color: "#e9fbff" });
    b.extrude(scaleOutline(O, 0.87, cx, 0), { at, x: X, thickness: thick, bevel: 0.006, color: bladePaint(k) });

    // gold brackets clamping the root
    const upper = scaleOutline(BRACKET, r);
    const lower = scaleOutline(mirrorY(BRACKET), r);
    b.extrude(upper, { at, x: X, thickness: thick + 0.01, bevel: 0.003, color: GOLD });
    b.extrude(lower, { at, x: X, thickness: thick + 0.01, bevel: 0.003, color: GOLD });

    // glowing glacier vein along the cutting edge
    for (const zf of [1, -1]) {
      const z = zf * (thick / 2 + 0.002);
      const pts: number[][] = [];
      for (const i of [4, 5, 6, 7, 8, 9, 10]) {
        const q = BLADE_RAW[i];
        const px = cx + 0.809 * (q[0] * k - cx);
        const py = 0.809 * (q[1] * k);
        pts.push([side * px, HY + py, z]);
      }
      glow(b.sweep(catmull(pts), 0.0045, CYAN, { sides: 6 }), 1.4);

      // boss and gem
      const gx = side * 0.2688 * k;
      b.lathe(
        [
          [0.03 * r, 0],
          [0.062 * r, 0],
          [0.062 * r, 0.007],
          [0.05 * r, 0.014],
          [0.03 * r, 0.014],
        ],
        { at: [gx, HY, zf * (thick / 2 - 0.002)], axis: [0, 0, zf], segments: 8, color: GOLD },
      );
      glow(
        b.part(new THREE.OctahedronGeometry(0.05 * r), CYAN, {
          at: [gx, HY, zf * (thick / 2 + 0.016)],
          scale: [1, 1.35, 0.55],
          flat: true,
        }),
        1.6,
      );

      // rune drawing
      const mirror = side * zf === -1;
      glow(
        b.part(new THREE.PlaneGeometry(0.4 * r, 0.96 * r), "#ffffff", {
          at: [side * 0.23 * r, HY + 0.02 * r, zf * (thick / 2 + 0.0015)],
          dir: [0, 0, zf],
          axis: "z",
          texture: runeTexture(mirror),
        }),
        1.2,
      );

      // bracket rivets
      for (const [rx, ry] of [
        [0.07, 0.136],
        [0.12, 0.17],
      ]) {
        const zr = zf * (thick / 2 + 0.0065);
        rivet(side * rx * r, HY + ry * r, zr, 0.0065 * r + 0.002);
        rivet(side * rx * r, HY - ry * r, zr, 0.0065 * r + 0.002);
      }
    }
  }
  blade(0.8, 1, 0.034);
  blade(0.44, -1, 0.028);

  // frost thorns growing from the blade roots
  for (const sz of [1, -1]) {
    crystal([0.085, HY + 0.2, sz * 0.012], [0.3, 0.6, sz * 0.75], 0.13, 0.016, "#bdf4ff", 1);
    crystal([0.085, HY - 0.2, sz * 0.012], [0.3, -0.6, sz * 0.75], 0.11, 0.014, "#7fdcff");
    crystal([-0.07, HY + 0.17, sz * 0.012], [-0.3, 0.6, sz * 0.8], 0.09, 0.013, "#e8fbff");
    crystal([0.2, HY + 0.31, sz * 0.012], [0.4, 0.4, sz * 0.8], 0.07, 0.011, "#58c0f0");
  }
  // icicles under the lower horns
  crystal([0.17, HY - 0.44, 0], [0.1, -1, 0], 0.1, 0.012, "#bdf4ff", 1);
  crystal([-0.095, HY - 0.24, 0], [-0.1, -1, 0], 0.07, 0.009, "#e8fbff");
  crystal([0.17, HY + 0.44, 0], [0.05, 1, 0], 0.06, 0.009, "#e8fbff");

  // ---- Gold hardware as one part ---------------------------------------------------------------------------
  b.part(mergeGeometries(gold)!, GOLD, { bone: root, at: [0, 0, 0] });

  return b.root;
}
