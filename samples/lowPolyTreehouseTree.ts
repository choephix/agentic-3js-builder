// Elder Tree Village: a 28 m game-world landmark. A giant faceted elder with buttress roots on a mossy ground tile
// carries a whole village: a cosy thatched round hut, a tinker's workshop with a pulley lift, a little shop with a
// striped awning, a two-storey lantern lodge with a balcony and a crow's nest lookout poking out of the crown.
// A spiral stair wraps the trunk, a rope bridge spans the front, a ladder climbs to the lookout, a zip line runs
// down to the meadow, and laundry, lanterns, signs, flower boxes, a rain barrel and a rope swing tell the story.
// Flat low-poly: faceted parts, one flat colour per surface, value steps from separate lighter and darker pieces.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { aim, rng } from "../src/math";
import { catmull } from "../src/path";
import { paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Elder Tree Village",
  description:
    "Low-poly game landmark, 28 m: a giant faceted elder tree with buttress roots on a mossy ground tile, carrying a thatched round hut, a workshop with a pulley lift, a little shop, a lantern lodge with a balcony and a crow's nest lookout, linked by a spiral stair, a rope bridge, ladders and a zip line. Rigged doors, lanterns, lift, swing, flag and swaying crown.",
};

type V = [number, number, number];
const D = Math.PI / 180;

// ---------------------------------------------------------------------------------------------------------------
// Palette: six hue families with shadow / base / highlight, one gold accent and two glows
// ---------------------------------------------------------------------------------------------------------------
const BARK_D = "#4a3122";
const BARK = "#6e4832";
const BARK_L = "#916443";
const PLK_D = "#8f5b33";
const PLK = "#b47a45";
const PLK_L = "#d49d5f";
const LEAF_D = "#2d6a3e";
const LEAF = "#3e8a46";
const LEAF_M = "#5aa84a";
const LEAF_L = "#8cc657";
const GRASS_D = "#4f7f33";
const GRASS = "#6b9d3c";
const GRASS_L = "#8fbd4e";
const DIRT_D = "#4d3326";
const DIRT = "#755039";
const RED_D = "#8c2f25";
const RED = "#bc4632";
const RED_L = "#e0694a";
const SLATE_D = "#2c4763";
const SLATE = "#3e6488";
const SLATE_L = "#6290b3";
const TEAL_D = "#2a625e";
const TEAL = "#3a8a83";
const TEAL_L = "#62b1a5";
const STRAW_D = "#b08638";
const STRAW = "#d5ab55";
const STRAW_L = "#ecd182";
const CREAM = "#f0e3c0";
const CREAM_D = "#d6c498";
const STONE_D = "#6a6e75";
const STONE = "#8c9197";
const STONE_L = "#b5babd";
const IRON = "#3a3e46";
const IRON_L = "#5e6570";
const ROPE = "#c9a86b";
const ROPE_D = "#9c7d49";
const GOLD = "#f2b53a";
const PINK = "#e56f9c";
const VIOLET = "#8b6bd1";
const WHITE = "#f7f4ea";
const ORANGE = "#e8842e";
const GLOW_WIN = "#ffcf6a";
const GLOW_LAMP = "#ffb43e";

// ---------------------------------------------------------------------------------------------------------------
// Drawings: flat fills, hard edges
// ---------------------------------------------------------------------------------------------------------------
const S = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const poly = (pts: number[][], fill: string) =>
  `<polygon points="${pts.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ")}" fill="${fill}"/>`;
const flipY = (h: number, body: string) => `<g transform="translate(0 ${h}) scale(1 -1)">${body}</g>`;
const FONT = `font-family="DejaVu Sans, sans-serif" font-weight="bold"`;

// A faceted leaf: two flat halves, one lighter, like a folded low-poly leaf.
const leafShape = (x: number, y: number, rot: number, s: number, a: string, b: string) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${poly(
    [
      [0, 0],
      [-8, -11],
      [-6.5, -24],
      [0, -34],
    ],
    a,
  )}${poly(
    [
      [0, 0],
      [8, -11],
      [6.5, -24],
      [0, -34],
    ],
    b,
  )}</g>`;
const leafCard = (a: string, b: string, c: string) =>
  svg(
    S(
      64,
      64,
      (
        [
          [-62, 0.85, c],
          [-31, 1.05, a],
          [0, 1.25, a],
          [31, 1.05, c],
          [62, 0.85, a],
        ] as const
      )
        .map(([r, s, f]) => leafShape(32, 63, r, s, f, b))
        .join(""),
    ),
    { size: 128 },
  );
const LEAVES = [leafCard(LEAF, LEAF_M, LEAF_D), leafCard(LEAF_M, LEAF_L, LEAF)];

const tuft = (cols: string[]) =>
  svg(
    S(
      48,
      48,
      Array.from({ length: 7 }, (_, i) => {
        const x = 6 + i * 6;
        const h = 24 + ((i * 37) % 19);
        const tx = x + (i - 3) * 2.6;
        return poly(
          [
            [x - 3.2, 48],
            [tx, 48 - h],
            [x + 3.2, 48],
          ],
          cols[i % cols.length]!,
        );
      }).join(""),
    ),
    { size: 96 },
  );
const TUFTS = [tuft([GRASS, GRASS_L, GRASS_D]), tuft([GRASS_L, GRASS, LEAF_M])];

const flowerCard = (petal: string, centre: string) =>
  svg(
    S(
      32,
      64,
      `<rect x="14.8" y="18" width="2.6" height="46" fill="${GRASS_D}"/>` +
        poly(
          [
            [16, 52],
            [7, 40],
            [16, 45],
          ],
          GRASS,
        ) +
        poly(
          [
            [16, 44],
            [25, 34],
            [16, 39],
          ],
          GRASS,
        ) +
        Array.from({ length: 6 }, (_, i) => {
          const a = i * 60 * D;
          return poly(
            [
              [16, 14],
              [16 + Math.cos(a - 0.4) * 10, 14 + Math.sin(a - 0.4) * 10],
              [16 + Math.cos(a + 0.4) * 10, 14 + Math.sin(a + 0.4) * 10],
            ],
            petal,
          );
        }).join("") +
        `<circle cx="16" cy="14" r="3.4" fill="${centre}"/>`,
    ),
    { size: 128 },
  );
const FLOWERS = [flowerCard(WHITE, GOLD), flowerCard(PINK, GOLD), flowerCard(GOLD, RED_D), flowerCard(VIOLET, CREAM)];

const SHOP_SIGN = svg(
  S(
    128,
    80,
    `<rect width="128" height="80" fill="${BARK}"/><rect x="5" y="5" width="118" height="70" fill="${PLK_L}"/>` +
      `<rect x="5" y="5" width="118" height="9" fill="${STRAW_L}"/>` +
      `<rect x="19" y="18" width="10" height="12" fill="${PLK_D}"/><rect x="17" y="27" width="14" height="6" fill="${TEAL_D}"/>` +
      `<circle cx="24" cy="49" r="17" fill="${TEAL_D}"/><circle cx="24" cy="49" r="13" fill="${TEAL_L}"/>` +
      `<rect x="11" y="49" width="26" height="14" fill="${VIOLET}"/><circle cx="19" cy="44" r="3" fill="${WHITE}"/>` +
      `<text x="82" y="54" ${FONT} font-size="27" text-anchor="middle" fill="${RED_D}">SHOP</text>`,
  ),
  { size: 512 },
);
const gearPath = (() => {
  const pts: number[][] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r = i % 2 ? 26 : 34;
    pts.push([48 + Math.cos(a - 0.12) * r, 48 + Math.sin(a - 0.12) * r]);
    pts.push([48 + Math.cos(a + 0.12) * r, 48 + Math.sin(a + 0.12) * r]);
  }
  return pts;
})();
const GEAR_SIGN = svg(
  S(
    96,
    96,
    `<circle cx="48" cy="48" r="47" fill="${TEAL_D}"/><circle cx="48" cy="48" r="42" fill="${TEAL}"/>` +
      poly(gearPath, CREAM) +
      `<circle cx="48" cy="48" r="12" fill="${TEAL}"/>` +
      `<g transform="rotate(-40 48 48)"><rect x="45" y="20" width="6" height="52" fill="${PLK_D}"/><rect x="34" y="16" width="28" height="12" fill="${IRON}"/></g>`,
  ),
  { size: 384 },
);
const LODGE_SIGN = svg(
  S(
    200,
    50,
    `<rect width="200" height="50" fill="${GOLD}"/><rect x="4" y="4" width="192" height="42" fill="${SLATE_D}"/>` +
      `<text x="100" y="33" ${FONT} font-size="22" text-anchor="middle" fill="${CREAM}" textLength="168" lengthAdjust="spacingAndGlyphs">LANTERN LODGE</text>`,
  ),
  { size: 800 },
);
const WELCOME_SIGN = svg(
  S(
    220,
    56,
    `<rect width="220" height="56" fill="${BARK_D}"/><rect x="4" y="4" width="212" height="48" fill="${PLK}"/>` +
      `<rect x="4" y="4" width="212" height="8" fill="${PLK_L}"/>` +
      leafShape(24, 46, -20, 0.95, LEAF, LEAF_M) +
      leafShape(196, 46, 20, 0.95, LEAF, LEAF_M) +
      `<text x="110" y="39" ${FONT} font-size="25" text-anchor="middle" fill="${CREAM}" textLength="140" lengthAdjust="spacingAndGlyphs">ELDER TREE</text>`,
  ),
  { size: 880 },
);
const arrowSign = (label: string, fill: string) =>
  svg(
    S(
      160,
      44,
      poly(
        [
          [0, 4],
          [132, 4],
          [158, 22],
          [132, 40],
          [0, 40],
        ],
        BARK_D,
      ) +
        poly(
          [
            [4, 8],
            [130, 8],
            [151, 22],
            [130, 36],
            [4, 36],
          ],
          fill,
        ) +
        `<text x="70" y="30" ${FONT} font-size="19" text-anchor="middle" fill="${CREAM}" textLength="104" lengthAdjust="spacingAndGlyphs">${label}</text>`,
    ),
    { size: 640 },
  );
const ARROW_SHOP = arrowSign("SHOP", RED);
const ARROW_LOOKOUT = arrowSign("LOOKOUT", SLATE);
const NOTICE = svg(
  S(
    120,
    90,
    `<rect width="120" height="90" fill="${PLK_D}"/><rect x="5" y="5" width="110" height="80" fill="${PLK}"/>` +
      `<g transform="rotate(-4 32 40)"><rect x="10" y="12" width="44" height="56" fill="${CREAM}"/>` +
      `<text x="32" y="26" ${FONT} font-size="10" text-anchor="middle" fill="${RED_D}">QUEST</text>` +
      [36, 44, 52, 60].map((y) => `<rect x="15" y="${y}" width="34" height="3" fill="${CREAM_D}"/>`).join("") +
      `</g>` +
      `<g transform="rotate(5 84 34)"><rect x="64" y="10" width="44" height="40" fill="${STRAW_L}"/>` +
      `<path d="M70 40 L80 30 L90 36 L100 18" stroke="${BARK}" stroke-width="3" fill="none"/>` +
      `<path d="M95 14 l8 8 M103 14 l-8 8" stroke="${RED}" stroke-width="3.4"/></g>` +
      `<rect x="66" y="58" width="40" height="22" fill="${WHITE}" transform="rotate(-6 86 69)"/>` +
      `<rect x="72" y="66" width="28" height="3" fill="${STONE_L}" transform="rotate(-6 86 69)"/>` +
      `<circle cx="32" cy="14" r="3" fill="${RED}"/><circle cx="86" cy="12" r="3" fill="${TEAL}"/><circle cx="86" cy="60" r="3" fill="${GOLD}"/>`,
  ),
  { size: 480 },
);

// Laundry, drawn upside down: a hanging card shows its root edge on top.
const SHIRT = svg(
  S(
    48,
    48,
    flipY(
      48,
      poly(
        [
          [4, 4],
          [16, 2],
          [24, 7],
          [32, 2],
          [44, 4],
          [46, 18],
          [37, 18],
          [37, 46],
          [11, 46],
          [11, 18],
          [2, 18],
        ],
        RED,
      ) +
        `<rect x="11" y="16" width="26" height="5" fill="${RED_L}"/><rect x="11" y="30" width="26" height="5" fill="${RED_L}"/>`,
    ),
  ),
  { size: 192 },
);
const TROUSERS = svg(
  S(
    40,
    56,
    flipY(
      56,
      poly(
        [
          [4, 2],
          [36, 2],
          [38, 54],
          [24, 54],
          [20, 20],
          [16, 54],
          [2, 54],
        ],
        SLATE,
      ) + `<rect x="4" y="2" width="32" height="6" fill="${SLATE_D}"/>`,
    ),
  ),
  { size: 192 },
);
const SOCKS = svg(
  S(
    40,
    40,
    flipY(
      40,
      poly(
        [
          [3, 2],
          [15, 2],
          [15, 28],
          [20, 38],
          [6, 38],
          [3, 30],
        ],
        CREAM,
      ) +
        poly(
          [
            [23, 2],
            [35, 2],
            [35, 28],
            [40, 38],
            [26, 38],
            [23, 30],
          ],
          CREAM,
        ) +
        `<rect x="3" y="8" width="12" height="4" fill="${RED}"/><rect x="23" y="8" width="12" height="4" fill="${RED}"/>`,
    ),
  ),
  { size: 160 },
);
const TOWEL = svg(
  S(
    40,
    48,
    `<rect width="40" height="48" fill="${GOLD}"/>` +
      [8, 20, 32].map((y) => `<rect x="0" y="${y}" width="40" height="5" fill="${WHITE}"/>`).join(""),
  ),
  { size: 160 },
);
const DRESS = svg(
  S(
    44,
    56,
    flipY(
      56,
      poly(
        [
          [14, 2],
          [30, 2],
          [32, 16],
          [42, 54],
          [2, 54],
          [12, 16],
        ],
        TEAL,
      ) + `<rect x="8" y="40" width="28" height="5" fill="${TEAL_L}"/>`,
    ),
  ),
  { size: 192 },
);
const pennant = (fill: string, accent: string) =>
  svg(
    S(
      32,
      32,
      poly(
        [
          [0, 32],
          [32, 32],
          [16, 0],
        ],
        fill,
      ) +
        poly(
          [
            [10, 26],
            [22, 26],
            [16, 14],
          ],
          accent,
        ),
    ),
    { size: 96 },
  );
const PENNANTS = [pennant(RED, GOLD), pennant(TEAL, CREAM), pennant(GOLD, RED), pennant(SLATE, CREAM)];

// ---------------------------------------------------------------------------------------------------------------
// The tree's shape: one axis, one radius profile, everything else derives from them
// ---------------------------------------------------------------------------------------------------------------
const GY = 0.55; // ground top
const RK: Array<[number, number]> = [
  [-0.4, 2.65],
  [0, 2.55],
  [1.2, 2.12],
  [3, 1.82],
  [6, 1.62],
  [9, 1.46],
  [12, 1.34],
  [15, 1.2],
  [18, 1.0],
  [20.5, 0.8],
  [23.8, 0.52],
];
function R(y: number) {
  if (y <= RK[0]![0]) return RK[0]![1];
  for (let i = 1; i < RK.length; i++) {
    const [y1, r1] = RK[i]!;
    const [y0, r0] = RK[i - 1]!;
    if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return RK[RK.length - 1]![1];
}
const axis = (y: number): V => [0.22 * Math.sin(y / 6.5), y, 0.18 * (Math.sin(y / 8 + 0.8) - Math.sin(0.8))];
const P = (az: number, r: number, y: number): V => {
  const a = axis(y);
  return [a[0] + r * Math.sin(az * D), y, a[2] + r * Math.cos(az * D)];
};
const rg = (az: number) =>
  9.1 + 0.45 * Math.sin(3 * az * D + 0.6) + 0.3 * Math.sin(5 * az * D + 2.1) + 0.25 * Math.sin(2 * az * D);

// ---------------------------------------------------------------------------------------------------------------
// Model-space geometry helpers (merged per bone and colour at the end)
// ---------------------------------------------------------------------------------------------------------------
const vec = (p: V) => new THREE.Vector3(p[0], p[1], p[2]);
const hash = (x: number, y: number, z: number, s: number) => {
  const h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + s * 11.13) * 43758.5453;
  return h - Math.floor(h);
};

function boxG(w: number, h: number, d: number, at: V, rot?: V) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rot)
    g.applyMatrix4(
      new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D, "YXZ")),
    );
  return g.translate(at[0], at[1], at[2]);
}
function placeG(g: THREE.BufferGeometry, a: V, e: V) {
  const A = vec(a);
  const B = vec(e);
  g.applyQuaternion(aim(B.clone().sub(A)));
  const m = A.add(B).multiplyScalar(0.5);
  return g.translate(m.x, m.y, m.z);
}
function beamG(a: V, e: V, w: number, h: number, up?: V) {
  const A = vec(a);
  const B = vec(e);
  const g = new THREE.BoxGeometry(w, A.distanceTo(B), h);
  g.applyQuaternion(aim(B.clone().sub(A), up ?? [0, 1, 0]));
  const m = A.add(B).multiplyScalar(0.5);
  return g.translate(m.x, m.y, m.z);
}
function cylG(a: V, e: V, r0: number, r1 = r0, sides = 6) {
  return placeG(new THREE.CylinderGeometry(r1, r0, vec(a).distanceTo(vec(e)), sides, 1), a, e);
}
/** A faceted tube through points, tapering r0 → r1, open ends. */
function tubeG(pts: V[], r0: number, r1 = r0, sides = 5, segs = 0, closed = false) {
  const curve = new THREE.CatmullRomCurve3(
    pts.map((p) => vec(p)),
    closed,
  );
  const n = segs || Math.max(2, (pts.length - 1) * 3);
  const C = curve.getSpacedPoints(n);
  const pos: number[] = [];
  const idx: number[] = [];
  let normal: THREE.Vector3 | null = null;
  for (let i = 0; i <= n; i++) {
    const t = curve.getTangentAt(Math.min(1, i / n)).normalize();
    if (!normal) normal = Math.abs(t.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    normal = normal
      .clone()
      .sub(t.clone().multiplyScalar(normal.dot(t)))
      .normalize();
    const bin = t.clone().cross(normal).normalize();
    const r = r0 + ((r1 - r0) * i) / n;
    const c = C[i]!;
    for (let k = 0; k < sides; k++) {
      const a = (k / sides) * Math.PI * 2;
      pos.push(
        c.x + (normal.x * Math.cos(a) + bin.x * Math.sin(a)) * r,
        c.y + (normal.y * Math.cos(a) + bin.y * Math.sin(a)) * r,
        c.z + (normal.z * Math.cos(a) + bin.z * Math.sin(a)) * r,
      );
    }
  }
  for (let i = 0; i < n; i++)
    for (let k = 0; k < sides; k++) {
      const a = i * sides + k;
      const b2 = i * sides + ((k + 1) % sides);
      const c = (i + 1) * sides + k;
      const d = (i + 1) * sides + ((k + 1) % sides);
      idx.push(a, b2, c, b2, d, c);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
/** A lumpy faceted blob (foliage, rocks, pumpkins): an icosahedron with its corners nudged by a position hash. */
function blobG(r: number, at: V, scale: V = [1, 1, 1], seed = 1, detail = 1, lump = 0.22) {
  const g = new THREE.IcosahedronGeometry(r, detail);
  const pos = g.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const k = 1 + (hash(Math.round(x * 50), Math.round(y * 50), Math.round(z * 50), seed) - 0.5) * lump;
    pos.setXYZ(i, x * k, y * k, z * k);
  }
  g.scale(scale[0], scale[1], scale[2]);
  return g.translate(at[0], at[1], at[2]);
}
function triG(w: number, h: number, th: number) {
  const sh = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, h)]);
  return new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false }).translate(0, 0, -th / 2);
}
/** A horizontal slab whose outline is radius(az) around the origin, from y0 to y1. */
function slabG(radius: (az: number) => number, n: number, y0: number, y1: number, cx = 0, cz = 0) {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < n; i++) {
    const az = (i / n) * 360;
    const r = radius(az);
    pts.push(new THREE.Vector2(cx + r * Math.sin(az * D), -(cz + r * Math.cos(az * D))));
  }
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: y1 - y0, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  return g.translate(0, y0, 0);
}
function orientG(g: THREE.BufferGeometry, at: V, dir: V, axisName: "y" | "z" = "y") {
  g.applyQuaternion(aim(dir, undefined, axisName));
  return g.translate(at[0], at[1], at[2]);
}

/** A local frame (position and yaw, plus optional tilt), mapping local geometry to model space. */
class Site {
  constructor(readonly m: THREE.Matrix4) {}
  static at(az: number, y: number, r = 0) {
    const o = P(az, r, y);
    return new Site(new THREE.Matrix4().makeRotationY(az * D).setPosition(o[0], o[1], o[2]));
  }
  static world() {
    return new Site(new THREE.Matrix4());
  }
  sub(x = 0, y = 0, z = 0, yaw = 0, pitch = 0, roll = 0) {
    const l = new THREE.Matrix4()
      .makeRotationFromEuler(new THREE.Euler(pitch * D, yaw * D, roll * D, "YXZ"))
      .setPosition(x, y, z);
    return new Site(this.m.clone().multiply(l));
  }
  p(x: number, y: number, z: number): V {
    const v = new THREE.Vector3(x, y, z).applyMatrix4(this.m);
    return [v.x, v.y, v.z];
  }
  d(x: number, y: number, z: number): V {
    const v = new THREE.Vector3(x, y, z).transformDirection(this.m);
    return [v.x, v.y, v.z];
  }
  g<T extends THREE.BufferGeometry>(geo: T) {
    geo.applyMatrix4(this.m);
    return geo;
  }
}

type AddFn = (bone: Joint, color: string, geo: THREE.BufferGeometry, glowS?: number) => void;

/** Draws in a Site onto one bone. */
class Kit {
  constructor(
    readonly add: AddFn,
    readonly s: Site,
    readonly bone: Joint,
  ) {}
  sub(x = 0, y = 0, z = 0, yaw = 0, pitch = 0, roll = 0) {
    return new Kit(this.add, this.s.sub(x, y, z, yaw, pitch, roll), this.bone);
  }
  on(bone: Joint) {
    return new Kit(this.add, this.s, bone);
  }
  p(x: number, y: number, z: number) {
    return this.s.p(x, y, z);
  }
  d(x: number, y: number, z: number) {
    return this.s.d(x, y, z);
  }
  geo(c: string, g: THREE.BufferGeometry, glowS = 0) {
    this.add(this.bone, c, this.s.g(g), glowS);
  }
  box(c: string, w: number, h: number, d: number, x: number, y: number, z: number, rot?: V, glowS = 0) {
    this.geo(c, boxG(w, h, d, [x, y, z], rot), glowS);
  }
  beam(c: string, a: V, e: V, w: number, h: number, up?: V) {
    this.geo(c, beamG(a, e, w, h, up));
  }
  cyl(c: string, a: V, e: V, r0: number, r1 = r0, sides = 6, glowS = 0) {
    this.geo(c, cylG(a, e, r0, r1, sides), glowS);
  }
  tube(c: string, pts: V[], r0: number, r1 = r0, sides = 5, segs = 0) {
    this.geo(c, tubeG(pts, r0, r1, sides, segs));
  }
  blob(c: string, r: number, at: V, scale?: V, seed = 1, detail = 0, lump = 0.2) {
    this.geo(c, blobG(r, at, scale, seed, detail, lump));
  }
}

/** A rope sagging between two points, as points. */
function sag(a: V, e: V, drop: number, n = 6): V[] {
  const out: V[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    out.push([a[0] + (e[0] - a[0]) * t, a[1] + (e[1] - a[1]) * t - drop * 4 * t * (1 - t), a[2] + (e[2] - a[2]) * t]);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "lowPolyTreehouseTree" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const rnd = rng(1207);
  const rr = (a: number, z: number) => a + (z - a) * rnd();

  // --- batching: one merged part per bone, colour and glow ----------------------------------------------------
  const batch = new Map<string, { bone: Joint; color: string; glowS: number; geos: THREE.BufferGeometry[] }>();
  const add: AddFn = (bone, color, geo, glowS = 0) => {
    const key = `${bone.name}|${color}|${glowS}`;
    let e = batch.get(key);
    if (!e) {
      e = { bone, color, glowS, geos: [] };
      batch.set(key, e);
    }
    const g = geo.index ? geo.toNonIndexed() : geo;
    for (const name of Object.keys(g.attributes)) if (name !== "position" && name !== "uv") g.deleteAttribute(name);
    if (!g.getAttribute("uv"))
      g.setAttribute(
        "uv",
        new THREE.Float32BufferAttribute(new Array(g.getAttribute("position").count * 2).fill(0), 2),
      );
    e.geos.push(g);
  };
  const W = new Kit(add, Site.world(), base);
  const kitAt = (az: number, y: number, bone: Joint = base) => new Kit(add, Site.at(az, y), bone);

  // ===========================================================================================================
  // GROUND TILE: stepped strata, a jagged grass lip, moss, rocks, roots
  // ===========================================================================================================
  W.geo(
    DIRT_D,
    slabG((az) => rg(az) * 0.88, 22, 0, 0.24),
  );
  W.geo(
    DIRT,
    slabG((az) => rg(az) * 0.955, 26, 0.2, 0.44),
  );
  const grassGeo = slabG((az) => rg(az) * (Math.round(az / (360 / 30)) % 2 ? 0.985 : 1.0), 30, 0.4, GY);
  const ground = b.part(grassGeo, GRASS, { bone: base, at: [0, 0, 0], flat: true, name: "groundTop" });
  // grass lip drips over the dirt edge
  for (let i = 0; i < 44; i++) {
    const az = (i / 44) * 360 + rr(-2, 2);
    const r = rg(az) * 0.975;
    W.geo(i % 3 ? GRASS : GRASS_D, orientG(new THREE.ConeGeometry(0.2, rr(0.25, 0.45), 4), P(az, r, 0.33), [0, -1, 0]));
  }
  // strata rocks peeking out of the cliff
  for (let i = 0; i < 16; i++) {
    const az = i * 22.5 + rr(-6, 6);
    const r = rg(az) * rr(0.86, 0.9);
    W.blob(i % 2 ? STONE : STONE_D, rr(0.22, 0.38), P(az, r, rr(0.1, 0.3)), [1.3, 0.8, 1.1], i, 0, 0.3);
  }
  // moss patches and darker grass patches on the top
  for (let i = 0; i < 12; i++) {
    const az = i * 30 + rr(0, 20);
    const r = rr(4.6, 7.4);
    const c = P(az, r, 0);
    const s = rr(0.7, 1.3);
    W.geo(
      i % 2 ? GRASS_L : GRASS_D,
      slabG((a) => s * (1 + 0.25 * Math.sin(a * 3 * D + i)), 9, GY - 0.02, GY + 0.035, c[0], c[2]),
    );
  }

  // ===========================================================================================================
  // TRUNK, BUTTRESS ROOTS, BARK DETAIL
  // ===========================================================================================================
  const TOP = 23.7;
  const trunkYs = [-0.4, 2, 4.5, 7, 9.5, 12, 14.5, 17, 19.5, 21.6, TOP];
  const trunkPath = catmull(trunkYs.map((y) => axis(y)));
  const NR = 24;
  b.sweep(
    trunkPath,
    Array.from({ length: NR + 1 }, (_, i) => R(-0.4 + (i / NR) * (TOP + 0.4))),
    { bone: base, color: BARK, sides: 10, smooth: false, caps: { start: "flat", end: "flat" }, name: "trunk" },
  );

  // buttress fins: thick at the foot, thin at the crest, with a lighter crest strip
  const FINS = [115, 165, 210, 255, 300, 340];
  const finOutline: OutlinePoint[] = [
    [0, 0],
    [4.9, 0],
    [4.3, 0.35],
    [3.5, 0.8],
    [2.9, 1.45],
    [2.5, 2.3],
    [2.15, 3.4],
    [1.6, 4.4],
    [0, 4.6],
  ];
  FINS.forEach((az, i) => {
    const a0 = axis(GY - 0.3);
    b.extrude(finOutline, {
      at: a0,
      x: [Math.sin(az * D), 0, Math.cos(az * D)],
      y: [0, 1, 0],
      thickness: [1.15, 0.3],
      color: BARK,
      bone: base,
      name: `fin${i}`,
    });
    W.tube(
      BARK_L,
      (
        [
          [4.55, 0.25],
          [3.5, 0.86],
          [2.9, 1.52],
          [2.5, 2.38],
          [2.15, 3.48],
          [1.7, 4.3],
        ] as const
      ).map(([d, y]) => P(az, d, GY - 0.3 + y)),
      0.16,
      0.12,
      4,
    );
    // root tail snaking into the meadow
    const sw = i % 2 ? 6 : -6;
    W.tube(
      BARK,
      [
        P(az, 4.2, GY + 0.05),
        P(az + sw * 0.5, 5.3, GY + 0.08),
        P(az + sw, 6.3, GY - 0.02),
        P(az + sw * 1.6, 7.0, GY - 0.25),
      ],
      0.42,
      0.1,
      5,
    );
  });
  // small surface roots between the fins
  [140, 188, 232, 278, 320, 20, 60].forEach((az, i) => {
    const sw = i % 2 ? 7 : -7;
    W.tube(BARK, [P(az, 2.0, GY + 0.45), P(az + sw, 3.2, GY + 0.12), P(az + sw * 1.7, 4.3, GY - 0.12)], 0.32, 0.08, 5);
  });
  // bark ridges climbing the trunk
  for (let i = 0; i < 16; i++) {
    const az0 = i * 22.5 + rr(-5, 5);
    const y0 = FINS.some((f) => Math.abs(((az0 - f + 540) % 360) - 180) < 14) ? 4.2 : GY + 0.2;
    const y1 = rr(9, 19);
    const pts: V[] = [];
    for (let k = 0; k <= 5; k++) {
      const y = y0 + ((y1 - y0) * k) / 5;
      pts.push(P(az0 + k * 3, R(y) + 0.02, y));
    }
    W.tube(i % 4 === 0 ? BARK_L : BARK_D, pts, 0.17, 0.05, 4, 10);
  }
  // knot holes and shelf fungus
  for (const [az, y] of [
    [200, 7.2],
    [-30, 16.5],
    [95, 13.5],
  ] as const) {
    const r = R(y);
    W.cyl(DIRT_D, P(az, r - 0.15, y), P(az, r + 0.06, y), 0.34, 0.34, 7);
    W.geo(
      BARK_L,
      orientG(
        new THREE.TorusGeometry(0.4, 0.1, 4, 8),
        P(az, r + 0.04, y),
        [Math.sin(az * D), 0, Math.cos(az * D)],
        "z",
      ),
    );
  }
  for (const [az, y, s] of [
    [170, 3.6, 1],
    [178, 3.15, 0.75],
    [-150, 11.6, 0.9],
    [-142, 11.2, 0.7],
    [80, 17.4, 0.8],
  ] as const) {
    const k = kitAt(az, y);
    const r = R(y) - 0.08;
    k.geo(
      s > 0.8 ? STRAW_L : CREAM,
      new THREE.CylinderGeometry(0.62 * s, 0.68 * s, 0.13, 7, 1, false, -Math.PI / 2, Math.PI).translate(0, 0, r),
    );
    k.geo(
      ORANGE,
      new THREE.CylinderGeometry(0.5 * s, 0.6 * s, 0.05, 7, 1, false, -Math.PI / 2, Math.PI).translate(0, -0.08, r),
    );
  }

  // ===========================================================================================================
  // SHARED CARPENTRY
  // ===========================================================================================================
  const PLANKS = [PLK, PLK_L, PLK, PLK_D];
  /** A plank deck in kit space: planks across x, joists below, top at y = 0. */
  function deck(k: Kit, x0: number, x1: number, z0: number, z1: number, seed = 0) {
    const n = Math.max(2, Math.round((z1 - z0) / 0.34));
    const step = (z1 - z0) / n;
    for (let i = 0; i < n; i++) {
      const j = hash(i, seed, 3, 7);
      k.box(
        PLANKS[(i + seed) % 4]!,
        x1 - x0 + (j - 0.5) * 0.12,
        0.12,
        step - 0.035,
        (x0 + x1) / 2 + (j - 0.5) * 0.06,
        -0.06,
        z0 + step * (i + 0.5),
        [0, (j - 0.5) * 1.6, 0],
      );
    }
    for (const z of [z0 + 0.1, z1 - 0.1]) k.box(BARK_D, x1 - x0, 0.24, 0.16, (x0 + x1) / 2, -0.24, z);
    const nj = Math.max(2, Math.round((x1 - x0) / 1.2) + 1);
    for (let i = 0; i < nj; i++) {
      const x = x0 + 0.1 + ((x1 - x0 - 0.2) * i) / (nj - 1);
      k.box(BARK_D, 0.16, 0.24, z1 - z0 - 0.1, x, -0.24, (z0 + z1) / 2);
    }
  }
  /** A railing from a to b (kit space, at deck level): posts, a light top rail and a rope mid rail. */
  function railing(k: Kit, a: V, e: V, opts: { h?: number; ends?: boolean; rope?: boolean } = {}) {
    const h = opts.h ?? 1.0;
    const A = vec(a);
    const B = vec(e);
    const len = A.distanceTo(B);
    const n = Math.max(1, Math.round(len / 1.1));
    for (let i = opts.ends === false ? 1 : 0; i <= (opts.ends === false ? n - 1 : n); i++) {
      const p = A.clone().lerp(B, i / n);
      k.box(BARK_D, 0.13, h + 0.05, 0.13, p.x, p.y + h / 2 - 0.02, p.z);
      k.box(PLK_L, 0.18, 0.06, 0.18, p.x, p.y + h + 0.03, p.z);
    }
    k.beam(PLK_L, [a[0], a[1] + h - 0.04, a[2]], [e[0], e[1] + h - 0.04, e[2]], 0.12, 0.08);
    if (opts.rope === false) k.beam(PLK_D, [a[0], a[1] + h * 0.45, a[2]], [e[0], e[1] + h * 0.45, e[2]], 0.07, 0.07);
    else k.tube(ROPE, sag([a[0], a[1] + h * 0.5, a[2]], [e[0], e[1] + h * 0.5, e[2]], 0.08, 4), 0.035, 0.035, 4, 4);
  }
  /** Vertical or horizontal plank cladding over a wall face at z = 0 of k, w wide, h tall, from y = 0. */
  function cladding(k: Kit, w: number, h: number, vertical: boolean, cols: string[]) {
    if (vertical) {
      const n = Math.max(2, Math.round(w / 0.3));
      for (let i = 0; i < n; i++) {
        const j = hash(i, w, h, 2);
        k.box(
          cols[i % cols.length]!,
          w / n - 0.04,
          h - j * 0.06,
          0.05,
          -w / 2 + (w * (i + 0.5)) / n,
          (h - j * 0.06) / 2,
          0.025,
        );
      }
    } else {
      const n = Math.max(2, Math.round(h / 0.26));
      for (let i = 0; i < n; i++)
        k.box(cols[i % cols.length]!, w + 0.02, h / n - 0.035, 0.05, 0, (h * (i + 0.5)) / n, 0.025 + (i % 2) * 0.012);
    }
  }
  /** A window centred on a wall (k at the window centre, +z out of the wall). */
  function windowAt(k: Kit, w: number, h: number, opts: { shutters?: string; box?: boolean; cross?: boolean } = {}) {
    k.box(GLOW_WIN, w, h, 0.08, 0, 0, 0.0, undefined, 1.3);
    const t = 0.1;
    k.box(BARK_D, w + 2 * t, t, 0.16, 0, h / 2 + t / 2, 0.05);
    k.box(PLK_L, w + 0.34, 0.08, 0.26, 0, -h / 2 - 0.04, 0.09);
    k.box(BARK_D, t, h, 0.16, -w / 2 - t / 2, 0, 0.05);
    k.box(BARK_D, t, h, 0.16, w / 2 + t / 2, 0, 0.05);
    if (opts.cross !== false) {
      k.box(BARK_D, 0.06, h, 0.1, 0, 0, 0.05);
      k.box(BARK_D, w, 0.06, 0.1, 0, 0, 0.05);
    }
    if (opts.shutters) {
      for (const s of [-1, 1]) {
        const sk = k.sub(s * (w / 2 + t + w / 4 + 0.02), 0, 0.06);
        sk.box(opts.shutters, w / 2, h + 0.06, 0.05, 0, 0, 0);
        sk.box(BARK_D, w / 2 - 0.08, 0.06, 0.04, 0, h / 4, 0.04);
        sk.box(BARK_D, w / 2 - 0.08, 0.06, 0.04, 0, -h / 4, 0.04);
      }
    }
    if (opts.box) flowerBox(k.sub(0, -h / 2 - 0.2, 0.2), w + 0.2);
  }
  function flowerBox(k: Kit, w: number) {
    k.box(PLK_D, w, 0.22, 0.26, 0, 0, 0);
    k.box(PLK_L, w + 0.06, 0.05, 0.3, 0, 0.11, 0);
    const n = Math.max(3, Math.round(w / 0.2));
    const cols = [RED_L, PINK, GOLD, WHITE, VIOLET];
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + 0.1 + ((w - 0.2) * i) / (n - 1);
      k.blob(LEAF_M, 0.11, [x, 0.17, 0.02], [1.2, 0.7, 1], i + 3);
      k.blob(
        cols[(i + Math.round(w * 10)) % cols.length]!,
        0.075,
        [x + 0.02, 0.27 + (i % 2) * 0.05, 0.05],
        [1, 1, 1],
        i,
      );
    }
  }
  /** A plank door hung on its own hinge joint. k sits at the door's bottom centre on the wall, +z out. */
  function door(name: string, k: Kit, w: number, h: number, color: string, hinge: 1 | -1, arched = false) {
    // frame (static)
    k.box(BARK_D, 0.14, h + 0.14, 0.2, -w / 2 - 0.07, (h + 0.14) / 2, 0.05);
    k.box(BARK_D, 0.14, h + 0.14, 0.2, w / 2 + 0.07, (h + 0.14) / 2, 0.05);
    k.box(BARK_D, w + 0.42, 0.16, 0.24, 0, h + 0.08, 0.06);
    k.box(STONE_L, w + 0.3, 0.08, 0.36, 0, 0.04, 0.16);
    const j = b.joint(name, {
      parent: base,
      at: k.p((hinge * w) / 2, 0.06, 0.1),
      dir: k.d(-hinge, 0, 0),
      up: k.d(0, 0, 1),
      role: "hinge",
    });
    const dk = k.on(j);
    const n = Math.max(3, Math.round(w / 0.22));
    const cols = [color, PLANKS.includes(color) ? PLK_L : color === SLATE ? SLATE_L : color === RED ? RED_L : TEAL_L];
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + (w * (i + 0.5)) / n;
      const top = arched ? h - 0.06 - Math.pow(Math.abs(x) / (w / 2), 2) * 0.3 : h - 0.06;
      dk.box(cols[i % 2]!, w / n - 0.02, top - 0.06, 0.08, x, 0.06 + (top - 0.06) / 2, 0.1);
    }
    dk.box(BARK_D, w - 0.06, 0.1, 0.05, 0, h * 0.22, 0.16);
    dk.box(BARK_D, w - 0.06, 0.1, 0.05, 0, h * 0.72, 0.16);
    dk.beam(BARK_D, [-w / 2 + 0.08, h * 0.22, 0.17], [w / 2 - 0.08, h * 0.72, 0.17], 0.09, 0.04);
    for (const y of [h * 0.22, h * 0.72]) dk.box(IRON, 0.3, 0.07, 0.03, hinge * (w / 2 - 0.16), y, 0.19);
    dk.cyl(GOLD, [-hinge * (w / 2 - 0.14), h * 0.48, 0.14], [-hinge * (w / 2 - 0.14), h * 0.48, 0.26], 0.05, 0.05, 6);
    return j;
  }
  /** A gable roof: k at the centre of the eave line, ridge along x, eaves at z = ±dz. */
  function gableRoof(k: Kit, L: number, dz: number, H: number, cols: [string, string, string], corrugated = false) {
    const ang = Math.atan2(H, dz);
    const slope = Math.hypot(dz, H);
    for (const s of [-1, 1]) {
      const sk = k.sub(0, 0, s * dz, 0, s * ang * (180 / Math.PI), 0);
      // in sk, local -z*s runs up the slope from the eave
      if (corrugated) {
        const n = Math.round(L / 0.22);
        for (let i = 0; i < n; i++)
          sk.box(
            i % 2 ? cols[1] : cols[0],
            L / n + 0.01,
            i % 2 ? 0.08 : 0.12,
            slope + 0.06,
            -L / 2 + (L * (i + 0.5)) / n,
            0.06,
            (-s * slope) / 2,
          );
        sk.box(cols[2], L + 0.04, 0.16, 0.12, 0, 0.02, s * 0.02);
      } else {
        const n = Math.max(3, Math.round(slope / 0.34));
        for (let i = 0; i < n; i++) {
          const rowCol = i === 0 ? cols[2] : i % 2 ? cols[1] : cols[0];
          sk.box(
            rowCol,
            L + (i % 2) * 0.06,
            0.12,
            slope / n + 0.1,
            ((i % 2) - 0.5) * 0.04,
            0.06 + (i % 2) * 0.035,
            -s * (slope / n) * (i + 0.5),
          );
        }
      }
    }
    k.box(cols[2], L + 0.12, 0.2, 0.2, 0, H + 0.08, 0, [45, 0, 0]);
    for (const x of [-L / 2, L / 2])
      for (const s of [-1, 1]) k.beam(BARK_D, [x, -0.02, s * (dz + 0.04)], [x, H + 0.08, 0], 0.1, 0.22, [0, 0, s]);
  }
  /** A hanging lantern on its own swing joint. */
  function lantern(name: string, hook: V, drop = 0.4, size = 1) {
    const j = b.joint(name, { parent: base, at: hook, dir: [0, -1, 0] });
    const k = new Kit(add, Site.world(), j);
    const s = size;
    const c: V = [hook[0], hook[1] - drop - 0.3 * s, hook[2]];
    k.cyl(IRON, hook, [hook[0], c[1] + 0.27 * s, hook[2]], 0.02, 0.02, 4);
    k.geo(IRON, new THREE.ConeGeometry(0.22 * s, 0.16 * s, 6).translate(c[0], c[1] + 0.26 * s, c[2]));
    k.geo(IRON_L, new THREE.TorusGeometry(0.05 * s, 0.018, 4, 6).translate(c[0], c[1] + 0.37 * s, c[2]));
    k.geo(GLOW_LAMP, new THREE.CylinderGeometry(0.13 * s, 0.11 * s, 0.32 * s, 6).translate(c[0], c[1], c[2]), 1.6);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      k.box(IRON, 0.03, 0.34 * s, 0.03, c[0] + Math.sin(a) * 0.135 * s, c[1], c[2] + Math.cos(a) * 0.135 * s);
    }
    k.geo(IRON, new THREE.CylinderGeometry(0.15 * s, 0.1 * s, 0.07 * s, 6).translate(c[0], c[1] - 0.19 * s, c[2]));
    k.geo(GOLD, new THREE.CylinderGeometry(0.16 * s, 0.16 * s, 0.035, 6).translate(c[0], c[1] + 0.17 * s, c[2]));
    return j;
  }
  /** A ladder from a to e (model space): two rails and rungs. */
  function ladder(k: Kit, a: V, e: V, w = 0.6, side: V = [1, 0, 0]) {
    const A = vec(a);
    const B = vec(e);
    const sd = vec(side)
      .normalize()
      .multiplyScalar(w / 2);
    for (const s of [-1, 1])
      k.beam(
        BARK,
        A.clone().addScaledVector(sd, s).toArray() as V,
        B.clone().addScaledVector(sd, s).toArray() as V,
        0.1,
        0.12,
      );
    const n = Math.floor(A.distanceTo(B) / 0.34);
    for (let i = 1; i < n; i++) {
      const p = A.clone().lerp(B, i / n);
      k.beam(
        i % 3 ? PLK_L : PLK,
        p.clone().addScaledVector(sd, -1.1).toArray() as V,
        p.clone().addScaledVector(sd, 1.1).toArray() as V,
        0.07,
        0.07,
      );
    }
  }

  // ===========================================================================================================
  // SPIRAL STAIR round the trunk, with landings at the hut, the shop deck and the lodge
  // ===========================================================================================================
  type Seg = { a0: number; a1: number; y0: number; y1: number; landing?: boolean };
  const STAIR: Seg[] = [
    { a0: 30, a1: 3, y0: 2.8, y1: 2.8, landing: true },
    { a0: 3, a1: -98, y0: 2.8, y1: 5.0 },
    { a0: -98, a1: -126, y0: 5.0, y1: 5.0, landing: true },
    { a0: -126, a1: -373, y0: 5.0, y1: 9.0 },
    { a0: -373, a1: -397, y0: 9.0, y1: 9.0, landing: true },
    { a0: -397, a1: -700, y0: 9.0, y1: 13.5 },
    { a0: -700, a1: -722, y0: 13.5, y1: 13.5, landing: true },
  ];
  const stringer: V[] = [];
  STAIR.forEach((sg, si) => {
    const rise = sg.y1 - sg.y0;
    const n = sg.landing ? Math.max(3, Math.round(Math.abs(sg.a1 - sg.a0) / 7)) : Math.max(2, Math.round(rise / 0.27));
    const tops: V[] = [];
    for (let i = 0; i < n; i++) {
      const az = sg.a0 + ((sg.a1 - sg.a0) * (i + 0.5)) / n;
      const y = sg.landing ? sg.y0 : sg.y0 + (rise * (i + 1)) / n;
      const r0 = R(y) - 0.15;
      const r1 = R(y) + (sg.landing ? 1.75 : 1.2);
      const arc = (Math.abs(sg.a1 - sg.a0) * D * (R(y) + 0.6)) / n;
      const k = kitAt(az, y);
      const wTread = sg.landing ? arc + 0.05 : Math.min(0.56, arc * 0.88);
      k.box(sg.landing ? PLANKS[i % 4]! : i % 2 ? PLK : PLK_L, wTread, 0.11, r1 - r0, 0, -0.055, (r0 + r1) / 2);
      if (!sg.landing) {
        k.box(PLK_D, wTread, 0.05, 0.08, 0, -0.08, r1 - 0.05);
        k.beam(BARK_D, [0, -0.12, r1 - 0.25], [0, -0.75, R(y - 0.7) - 0.05], 0.09, 0.09);
      } else {
        k.beam(BARK_D, [0, -0.14, r1 - 0.2], [0, -1.2, R(y - 1.2) - 0.05], 0.13, 0.13);
      }
      stringer.push(P(az, R(y) + 0.95, y - 0.2));
      if (!sg.landing && i % 2 === 0) {
        k.box(BARK_D, 0.1, 1.05, 0.1, 0, 0.5, r1 - 0.1);
        k.box(PLK_L, 0.14, 0.05, 0.14, 0, 1.04, r1 - 0.1);
      }
      tops.push(P(az, R(y) + 1.1, y + 1.0));
    }
    if (!sg.landing && tops.length > 1) {
      W.tube(PLK_L, tops, 0.05, 0.05, 5, tops.length * 2);
      W.tube(
        ROPE,
        tops.map((p) => [p[0], p[1] - 0.5, p[2]] as V),
        0.03,
        0.03,
        4,
        tops.length * 2,
      );
    }
    void si;
  });
  W.tube(BARK_D, stringer, 0.09, 0.09, 4, stringer.length * 2);

  // the entry flight from the meadow up to the first landing
  {
    const top = P(30, R(2.8) + 0.62, 2.8);
    const tdir = vec([Math.cos(30 * D), 0, -Math.sin(30 * D)]);
    const run = 4.4;
    const bot = vec(top).addScaledVector(tdir, run);
    bot.y = GY;
    const side = new THREE.Vector3(0, 1, 0).cross(tdir).normalize();
    const n = 9;
    for (const s of [-1, 1]) {
      const a = vec(top).addScaledVector(side, s * 0.62);
      const e = bot.clone().addScaledVector(side, s * 0.62);
      W.beam(BARK_D, [a.x, a.y - 0.2, a.z], [e.x, e.y + 0.05, e.z], 0.12, 0.3, [0, 1, 0]);
      // rail posts and rail
      const posts: V[] = [];
      for (let i = 0; i <= 3; i++) {
        const p = a.clone().lerp(e, i / 3);
        W.box(BARK_D, 0.12, 1.05, 0.12, p.x, p.y + 0.45, p.z);
        posts.push([p.x, p.y + 0.98, p.z]);
      }
      W.tube(PLK_L, posts, 0.05, 0.05, 5, 8);
    }
    for (let i = 0; i < n; i++) {
      const p = vec(top).lerp(bot, (i + 1) / (n + 1));
      const g = boxG(1.24, 0.1, 0.36, [0, 0, 0]);
      g.applyQuaternion(aim(side, [0, 1, 0]));
      W.geo(i % 2 ? PLK : PLK_L, g.translate(p.x, p.y + 0.02, p.z));
    }
    W.box(STONE, 1.6, 0.2, 0.9, bot.x + tdir.x * 0.3, GY + 0.04, bot.z + tdir.z * 0.3, [
      0,
      Math.atan2(tdir.x, tdir.z) / D,
      0,
    ]);
  }

  // ===========================================================================================================
  // THE ROUND HUT (thatched), level 5 m, az -112
  // ===========================================================================================================
  const HUT_AZ = -112;
  const HUT_Y = 5.0;
  const HUT_R = 5.6;
  {
    const k = kitAt(HUT_AZ, HUT_Y);
    const hk = k.sub(0, 0, HUT_R);
    // connector walk from the stair landing and the round deck
    deck(k, -0.65, 0.65, R(HUT_Y) + 1.4, HUT_R - 1.6, 1);
    const DR = 2.15;
    for (let i = 0; i < 12; i++) {
      const a0 = (i / 12) * Math.PI * 2;
      hk.geo(
        PLANKS[i % 4]!,
        new THREE.CylinderGeometry(DR, DR, 0.13, 2, 1, false, a0, (Math.PI * 2) / 12 - 0.02).translate(0, -0.065, 0),
      );
    }
    hk.geo(BARK_D, new THREE.CylinderGeometry(DR - 0.05, DR - 0.25, 0.28, 12).translate(0, -0.27, 0));
    hk.geo(BARK, new THREE.TorusGeometry(DR, 0.09, 4, 12).rotateX(Math.PI / 2).translate(0, -0.1, 0));
    // stilts and a supporting branch
    for (const a of [40, 160, -80]) {
      const p = hk.p(Math.sin(a * D) * (DR - 0.4), -0.3, Math.cos(a * D) * (DR - 0.4));
      W.cyl(BARK, [p[0], GY - 0.2, p[2]], p, 0.17, 0.15, 6);
      W.beam(BARK_D, [p[0], GY + 0.9, p[2]], hk.p(Math.sin(a * D) * 0.6, -0.35, Math.cos(a * D) * 0.6), 0.1, 0.1);
    }
    b.sweep(
      catmull([P(HUT_AZ, R(2.6) - 0.6, 2.6), P(HUT_AZ + 4, 3.4, 3.6), hk.p(0.3, -0.45, -0.6), hk.p(0, -0.42, 0.9)]),
      [0.55, 0.42, 0.3, 0.22],
      {
        bone: base,
        color: BARK,
        sides: 6,
        smooth: false,
        name: "hutBranch",
      },
    );
    // walls: vertical log staves on a ring
    const WR = 1.5;
    const WH = 2.2;
    hk.geo(PLK_D, new THREE.CylinderGeometry(WR - 0.06, WR - 0.06, WH, 12).translate(0, WH / 2, 0));
    const NST = 22;
    for (let i = 0; i < NST; i++) {
      const a = ((i + 0.5) / NST) * 360;
      if (Math.abs(((a + 180) % 360) - 180) < 22) continue; // door gap (front, +z)
      const h = WH - (i % 3) * 0.05;
      hk.sub(0, 0, 0, a).box(i % 2 ? PLK : PLK_L, ((2 * Math.PI * WR) / NST) * 0.98, h, 0.14, 0, h / 2, WR);
    }
    hk.geo(BARK_D, new THREE.TorusGeometry(WR + 0.08, 0.07, 4, 12).rotateX(Math.PI / 2).translate(0, 0.35, 0));
    hk.geo(BARK_D, new THREE.TorusGeometry(WR + 0.08, 0.07, 4, 12).rotateX(Math.PI / 2).translate(0, WH - 0.2, 0));
    // round porthole windows
    for (const a of [-70, 70, 150]) {
      const wk = hk.sub(0, 1.35, 0, a).sub(0, 0, WR + 0.06);
      wk.geo(GLOW_WIN, new THREE.CylinderGeometry(0.3, 0.3, 0.08, 8).rotateX(Math.PI / 2), 1.3);
      wk.geo(BARK_D, new THREE.TorusGeometry(0.34, 0.08, 4, 8).translate(0, 0, 0.05));
      wk.box(BARK_D, 0.05, 0.6, 0.06, 0, 0, 0.06);
      wk.box(BARK_D, 0.6, 0.05, 0.06, 0, 0, 0.06);
      flowerBox(wk.sub(0, -0.55, 0.16), 0.75);
    }
    door("hutDoor", hk.sub(0, 0, WR + 0.02), 0.95, 1.75, TEAL, -1, true);
    // layered thatch
    const tiers: Array<[number, number, number, number, string]> = [
      [2.25, 1.55, 0.95, WH - 0.15, STRAW_D],
      [1.75, 0.95, 0.95, WH + 0.6, STRAW],
      [1.15, 0.12, 1.15, WH + 1.35, STRAW_L],
    ];
    tiers.forEach(([r0, r1, h, y, c], ti) => {
      hk.geo(c, new THREE.CylinderGeometry(r1, r0, h, 9, 1).translate(0, y + h / 2, 0));
      const nT = 18 - ti * 4;
      for (let i = 0; i < nT; i++) {
        const a = (i / nT) * Math.PI * 2 + ti * 0.3;
        hk.geo(
          c,
          orientG(
            new THREE.ConeGeometry(0.13, 0.32, 4),
            [Math.sin(a) * (r0 - 0.05), y - 0.08, Math.cos(a) * (r0 - 0.05)],
            [0, -1, 0],
          ),
        );
      }
      hk.geo(
        STRAW_D,
        new THREE.TorusGeometry(r0 * 0.82, 0.05, 3, 9).rotateX(Math.PI / 2).translate(0, y + h * 0.35, 0),
      );
    });
    hk.geo(BARK_D, new THREE.CylinderGeometry(0.05, 0.08, 0.6, 5).translate(0, WH + 2.75, 0));
    hk.blob(GOLD, 0.12, [0, WH + 3.1, 0], [1, 1, 1], 4);
    // stovepipe chimney
    hk.cyl(IRON, [0.75, WH + 0.6, -0.6], [0.75, WH + 2.4, -0.6], 0.14, 0.14, 6);
    hk.geo(IRON_L, new THREE.ConeGeometry(0.28, 0.25, 6).translate(0.75, WH + 2.55, -0.6));
    // deck railing (leave the connector and the door path open)
    for (let i = 0; i < 12; i++) {
      const a0 = (i / 12) * 360;
      const a1 = ((i + 1) / 12) * 360;
      const mid = (a0 + a1) / 2;
      const am = ((mid + 180) % 360) - 180;
      if (Math.abs(am - 180) < 20 || Math.abs(am + 180) < 20) continue; // connector toward the trunk (-z)
      railing(
        hk,
        [Math.sin(a0 * D) * (DR - 0.1), 0, Math.cos(a0 * D) * (DR - 0.1)],
        [Math.sin(a1 * D) * (DR - 0.1), 0, Math.cos(a1 * D) * (DR - 0.1)],
        { h: 0.9 },
      );
    }
    lantern("lanternHut", hk.p(0.75, WH - 0.05, WR + 0.45), 0.25, 0.9);
    hk.beam(BARK_D, [0.75, WH - 0.05, WR], [0.75, WH - 0.05, WR + 0.5], 0.07, 0.07);
    // rain barrel on the ground below the deck, fed by a downpipe
    const bp = P(HUT_AZ - 13, HUT_R + 1.85, GY);
    const bk = new Kit(add, Site.world().sub(bp[0], bp[1], bp[2]), base);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * 360;
      bk.sub(0, 0, 0, a).box(i % 2 ? PLK : PLK_L, 0.33, 1.05, 0.08, 0, 0.53, 0.47);
    }
    bk.geo(PLK_D, new THREE.CylinderGeometry(0.47, 0.47, 1.0, 10).translate(0, 0.5, 0));
    bk.geo(SLATE_L, new THREE.CylinderGeometry(0.46, 0.46, 0.04, 10).translate(0, 0.98, 0));
    for (const y of [0.2, 0.85])
      bk.geo(IRON, new THREE.TorusGeometry(0.53, 0.035, 3, 10).rotateX(Math.PI / 2).translate(0, y, 0));
    const pipeTop = hk.p(Math.sin(-25 * D) * 1.9, -0.3, Math.cos(-25 * D) * 1.9);
    W.tube(
      IRON_L,
      [pipeTop, [pipeTop[0], 2.6, pipeTop[2]], [bp[0], 1.45, bp[2]], [bp[0], 1.12, bp[2]]],
      0.08,
      0.08,
      6,
      10,
    );
  }

  // ===========================================================================================================
  // SHOP, level 9 m, az -50
  // ===========================================================================================================
  const SHOP_AZ = -50;
  const WORK_AZ = 50;
  const L2 = 9.0;
  const shopSite = Site.at(SHOP_AZ, L2);
  const workSite = Site.at(WORK_AZ, L2);
  {
    const k = new Kit(add, shopSite, base);
    deck(k, -2.3, 2.3, R(L2) + 1.3, 6.8, 2);
    // support: a branch and struts
    b.sweep(
      catmull([P(SHOP_AZ, R(6.2) - 0.6, 6.2), P(SHOP_AZ - 3, 3.0, 7.0), k.p(0.2, -0.45, 4.6), k.p(0, -0.42, 6.3)]),
      [0.55, 0.42, 0.3, 0.2],
      {
        bone: base,
        color: BARK,
        sides: 6,
        smooth: false,
        name: "shopBranch",
      },
    );
    for (const s of [-1, 1]) k.beam(BARK_D, [s * 2.1, -0.3, 6.5], [s * 0.6, -2.6, R(L2 - 2.6) + 0.1], 0.14, 0.14);
    // body: horizontal clapboard
    const X0 = -1.6;
    const X1 = 1.6;
    const Z0 = 3.0;
    const Z1 = 5.1;
    const H = 2.35;
    k.box(PLK_D, X1 - X0, H, Z1 - Z0, 0, H / 2, (Z0 + Z1) / 2);
    cladding(k.sub(0, 0, Z1), X1 - X0, H, false, [PLK, PLK_L]);
    cladding(k.sub(X1, 0, (Z0 + Z1) / 2, 90), Z1 - Z0, H, false, [PLK, PLK_L]);
    cladding(k.sub(X0, 0, (Z0 + Z1) / 2, -90), Z1 - Z0, H, false, [PLK, PLK_L]);
    for (const x of [X0, X1]) for (const z of [Z0, Z1]) k.box(BARK_D, 0.18, H + 0.05, 0.18, x, H / 2, z);
    k.box(BARK_D, X1 - X0 + 0.2, 0.16, Z1 - Z0 + 0.2, 0, 0.08, (Z0 + Z1) / 2);
    // counter window with goods
    const cw = k.sub(-0.55, 0, Z1 + 0.06);
    cw.box(BARK_D, 1.7, 1.05, 0.06, 0, 1.5, -0.02);
    cw.box(GLOW_WIN, 1.5, 0.9, 0.04, 0, 1.48, -0.04, undefined, 1.0);
    cw.box(PLK_D, 1.4, 0.06, 0.25, 0, 1.28, -0.0);
    cw.box(PLK_D, 1.4, 0.06, 0.25, 0, 1.7, -0.0);
    for (let i = 0; i < 6; i++) {
      const c = [TEAL_L, RED_L, VIOLET, GOLD, LEAF_L, PINK][i]!;
      cw.cyl(c, [-0.55 + i * 0.22, 1.31, 0.02], [-0.55 + i * 0.22, 1.45, 0.02], 0.06, 0.06, 5);
      cw.cyl(c, [-0.5 + i * 0.21, 1.73, 0.02], [-0.5 + i * 0.21, 1.86, 0.02], 0.05, 0.03, 5);
    }
    cw.box(PLK_L, 1.95, 0.1, 0.55, 0, 0.98, 0.18);
    cw.box(BARK_D, 1.9, 0.06, 0.45, 0, 0.9, 0.15);
    for (const x of [-0.75, 0.75]) cw.beam(BARK_D, [x, 0.92, 0.38], [x, 0.4, 0.02], 0.07, 0.07);
    // goods on the counter: potions, an apple crate, a scale
    const potions: Array<[number, string]> = [
      [-0.7, TEAL_L],
      [-0.55, VIOLET],
      [-0.42, RED_L],
    ];
    for (const [x, c] of potions) {
      cw.blob(c, 0.09, [x, 1.13, 0.22], [1, 1, 1], 9, 0);
      cw.cyl(CREAM, [x, 1.18, 0.22], [x, 1.32, 0.22], 0.03, 0.03, 4);
    }
    cw.box(PLK_D, 0.42, 0.18, 0.3, 0.1, 1.12, 0.2);
    for (let i = 0; i < 6; i++)
      cw.blob(
        i % 2 ? RED : RED_L,
        0.07,
        [-0.03 + (i % 3) * 0.13, 1.25, 0.13 + Math.floor(i / 3) * 0.13],
        [1, 1, 1],
        i,
        0,
      );
    cw.cyl(GOLD, [0.6, 1.03, 0.22], [0.6, 1.33, 0.22], 0.025, 0.025, 4);
    cw.beam(GOLD, [0.42, 1.33, 0.22], [0.78, 1.33, 0.22], 0.03, 0.03);
    cw.geo(GOLD, new THREE.CylinderGeometry(0.1, 0.06, 0.04, 6).translate(0.44, 1.22, 0.22));
    cw.geo(GOLD, new THREE.CylinderGeometry(0.1, 0.06, 0.04, 6).translate(0.76, 1.22, 0.22));
    // striped awning with a scalloped valance
    const aw = k.sub(-0.55, 2.2, Z1 + 0.05);
    const NA = 8;
    for (let i = 0; i < NA; i++) {
      const x = -1.0 + (2.0 * (i + 0.5)) / NA;
      aw.beam(i % 2 ? CREAM : RED, [x, 0, 0], [x, -0.42, 0.95], 2.0 / NA + 0.005, 0.06, [0, 1, 0]);
      aw.geo(
        i % 2 ? CREAM : RED,
        triG(2.0 / NA, 0.18, 0.04)
          .rotateZ(Math.PI)
          .translate(x, -0.42, 0.97),
      );
    }
    for (const x of [-1.0, 1.0]) aw.beam(IRON, [x, 0.02, 0], [x, -0.42, 0.95], 0.04, 0.04);
    door("shopDoor", k.sub(1.0, 0, Z1 + 0.02), 0.82, 1.9, RED, 1);
    // side window with a flower box
    windowAt(k.sub(X0 - 0.02, 1.35, 4.05, -90), 0.7, 0.7, { shutters: RED, box: true });
    windowAt(k.sub(X1 + 0.02, 1.35, 4.05, 90), 0.6, 0.7, { shutters: RED });
    // roof: red shingles, ridge along x
    gableRoof(k.sub(0, H, (Z0 + Z1) / 2), X1 - X0 + 0.7, (Z1 - Z0) / 2 + 0.4, 1.25, [RED, RED_L, RED_D]);
    for (const s of [-1, 1]) {
      const g = triG(Z1 - Z0, 1.2, 0.08);
      k.geo(CREAM_D, g.rotateY(Math.PI / 2).translate(s * (X1 + 0.02), H, (Z0 + Z1) / 2));
    }
    k.cyl(GLOW_WIN, [X1 + 0.06, H + 0.5, 4.05], [X1 + 0.12, H + 0.5, 4.05], 0.18, 0.18, 8, 1.2);
    // hanging sign on a bracket at the front corner
    k.beam(BARK_D, [X1, 2.05, Z1 + 0.1], [X1 + 0.95, 2.05, Z1 + 0.1], 0.08, 0.08);
    k.beam(BARK_D, [X1, 1.65, Z1 + 0.1], [X1 + 0.6, 2.05, Z1 + 0.1], 0.06, 0.06);
    const sj = b.joint("shopSign", { parent: base, at: k.p(X1 + 0.62, 2.0, Z1 + 0.1), dir: [0, -1, 0] });
    const sk = k.on(sj);
    for (const x of [-0.25, 0.25])
      sk.cyl(IRON, [X1 + 0.62 + x, 2.0, Z1 + 0.1], [X1 + 0.62 + x, 1.8, Z1 + 0.1], 0.015, 0.015, 3);
    sk.box(BARK_D, 0.84, 0.54, 0.06, X1 + 0.62, 1.52, Z1 + 0.1);
    for (const s of [-1, 1])
      b.part(new THREE.PlaneGeometry(0.8, 0.5), "#ffffff", {
        bone: sj,
        at: k.p(X1 + 0.62, 1.52, Z1 + 0.1 + s * 0.035),
        dir: k.d(0, 0, s),
        axis: "z",
        texture: SHOP_SIGN,
        name: `shopSign${s > 0 ? "F" : "B"}`,
      });
    lantern("lanternShop", k.p(X0 - 0.15, H - 0.1, Z1 + 0.35), 0.25, 0.85);
    k.beam(BARK_D, [X0, H - 0.1, Z1], [X0 - 0.15, H - 0.1, Z1 + 0.42], 0.07, 0.07);
    // porch: barrels, crates and sacks
    const bk = k.sub(-1.75, 0, 6.25);
    for (const [x, z] of [
      [0, 0],
      [0.62, 0.1],
    ] as const) {
      bk.geo(PLK, new THREE.CylinderGeometry(0.3, 0.3, 0.75, 8).translate(x, 0.38, z));
      for (const y of [0.15, 0.6]) bk.geo(IRON, new THREE.CylinderGeometry(0.315, 0.315, 0.06, 8).translate(x, y, z));
      for (let i = 0; i < 5; i++)
        bk.blob(
          x ? GOLD : RED,
          0.08,
          [x - 0.13 + (i % 3) * 0.13, 0.8, z - 0.06 + Math.floor(i / 3) * 0.13],
          [1, 1, 1],
          i,
          0,
        );
    }
    k.box(PLK_L, 0.55, 0.45, 0.55, 1.5, 0.23, 6.3, [0, 15, 0]);
    k.box(PLK_D, 0.6, 0.05, 0.6, 1.5, 0.47, 6.3, [0, 15, 0]);
    k.blob(CREAM_D, 0.28, [1.55, 0.25, 5.6], [1, 1.1, 0.9], 8, 0);
    railing(k, [-2.2, 0, R(L2) + 1.4], [-2.2, 0, 5.6]);
    railing(k, [-2.2, 0, 6.7], [1.2, 0, 6.7]);
    railing(k, [2.2, 0, R(L2) + 1.4], [2.2, 0, 5.4]);
  }

  // ===========================================================================================================
  // WORKSHOP, level 9 m, az 50, with the pulley lift
  // ===========================================================================================================
  {
    const k = new Kit(add, workSite, base);
    deck(k, -2.5, 2.5, R(L2) + 1.3, 6.8, 3);
    b.sweep(
      catmull([P(WORK_AZ, R(5.3) - 0.6, 5.3), P(WORK_AZ + 3, 2.9, 6.1), k.p(-0.2, -0.45, 4.4), k.p(0, -0.42, 6.3)]),
      [0.6, 0.45, 0.32, 0.22],
      {
        bone: base,
        color: BARK,
        sides: 6,
        smooth: false,
        name: "workBranch",
      },
    );
    for (const s of [-1, 1]) k.beam(BARK_D, [s * 2.3, -0.3, 6.5], [s * 0.7, -3.4, R(L2 - 3.4) + 0.1], 0.14, 0.14);
    const X0 = -1.75;
    const X1 = 1.75;
    const Z0 = 2.95;
    const Z1 = 5.25;
    const H = 2.45;
    k.box(PLK_D, X1 - X0, H, Z1 - Z0, 0, H / 2, (Z0 + Z1) / 2);
    cladding(k.sub(0, 0, Z1), X1 - X0, H, true, [PLK, PLK_L, PLK]);
    cladding(k.sub(X1, 0, (Z0 + Z1) / 2, 90), Z1 - Z0, H, true, [PLK, PLK_L, PLK]);
    cladding(k.sub(X0, 0, (Z0 + Z1) / 2, -90), Z1 - Z0, H, true, [PLK, PLK_L, PLK]);
    for (const x of [X0, X1]) for (const z of [Z0, Z1]) k.box(BARK_D, 0.2, H + 0.05, 0.2, x, H / 2, z);
    k.box(BARK_D, X1 - X0 + 0.15, 0.14, 0.1, 0, H - 0.07, Z1 + 0.05);
    k.box(BARK_D, X1 - X0 + 0.2, 0.16, Z1 - Z0 + 0.2, 0, 0.08, (Z0 + Z1) / 2);
    // big double doors
    const dk = k.sub(0, 0, Z1 + 0.04);
    door("workDoorL", dk.sub(0.43, 0, 0), 0.82, 1.95, TEAL, 1);
    door("workDoorR", dk.sub(-0.43, 0, 0), 0.82, 1.95, TEAL, -1);
    windowAt(k.sub(X1 + 0.02, 1.35, 4.1, 90), 0.8, 0.65, { shutters: TEAL, box: true });
    windowAt(k.sub(X0 - 0.02, 1.35, 4.1, -90), 0.8, 0.65, { shutters: TEAL });
    // corrugated tin roof, ridge running radially, gable to the front
    const rk = k.sub(0, H, (Z0 + Z1) / 2, 90);
    gableRoof(rk, Z1 - Z0 + 0.65, (X1 - X0) / 2 + 0.38, 1.1, [TEAL, TEAL_L, TEAL_D], true);
    k.geo(PLK_D, triG(X1 - X0, 1.05, 0.1).translate(0, H, Z1 + 0.02));
    k.geo(PLK_D, triG(X1 - X0, 1.05, 0.1).translate(0, H, Z0 - 0.02));
    b.part(new THREE.CircleGeometry(0.36, 16), "#ffffff", {
      bone: base,
      at: k.p(0, H + 0.42, Z1 + 0.09),
      dir: k.d(0, 0, 1),
      axis: "z",
      texture: GEAR_SIGN,
      name: "gearSign",
    });
    // stovepipe and wind vane
    k.cyl(IRON, [0.8, H + 0.3, 3.4], [0.8, H + 1.9, 3.4], 0.13, 0.13, 6);
    k.geo(IRON_L, new THREE.ConeGeometry(0.26, 0.22, 6).translate(0.8, H + 2.02, 3.4));
    k.cyl(BARK_D, [0, H + 1.05, Z0 + 0.3], [0, H + 2.3, Z0 + 0.3], 0.05, 0.05, 5);
    const vj = b.joint("windVane", { parent: base, at: k.p(0, H + 2.3, Z0 + 0.62), dir: k.d(0, 0, 1) });
    const vk = k.on(vj);
    vk.cyl(IRON, [0, H + 2.3, Z0 + 0.27], [0, H + 2.3, Z0 + 0.72], 0.07, 0.07, 6);
    for (let i = 0; i < 4; i++) {
      const a = (i * 90 + 20) * D;
      const tip: V = [Math.cos(a) * 0.62, H + 2.3 + Math.sin(a) * 0.62, Z0 + 0.62];
      const g = boxG(0.12, 0.56, 0.03, [0, 0.36, 0], [0, 25, 0]);
      g.rotateZ(a - Math.PI / 2);
      vk.geo(i % 2 ? RED : CREAM, g.translate(0, H + 2.3, Z0 + 0.62));
      void tip;
    }
    k.beam(BARK_D, [0, H + 2.3, Z0 + 0.3], [0, H + 2.3, Z0 - 0.5], 0.04, 0.04);
    k.geo(
      RED,
      triG(0.4, 0.35, 0.03)
        .rotateY(Math.PI / 2)
        .translate(0, H + 2.18, Z0 - 0.55),
    );
    // porch: workbench with vice, sawhorse with a log, tool rack
    const wb = k.sub(1.3, 0, 6.15, 90);
    wb.box(PLK_L, 1.3, 0.1, 0.55, 0, 0.85, 0);
    for (const x of [-0.55, 0.55]) for (const z of [-0.2, 0.2]) wb.box(BARK_D, 0.08, 0.82, 0.08, x, 0.41, z);
    wb.box(IRON, 0.18, 0.14, 0.18, 0.45, 0.97, 0.16);
    wb.box(IRON_L, 0.06, 0.06, 0.3, 0.45, 0.97, 0.3);
    wb.box(STONE_L, 0.38, 0.06, 0.12, -0.2, 0.93, 0.1);
    wb.cyl(PLK_D, [-0.4, 0.92, -0.1], [-0.05, 0.92, -0.15], 0.025, 0.025, 4);
    wb.box(IRON, 0.12, 0.08, 0.06, -0.02, 0.92, -0.15);
    const sh = k.sub(-1.2, 0, 6.05, 20);
    for (const s of [-1, 1]) {
      sh.beam(BARK_D, [s * 0.45, 0.62, 0], [s * 0.45 - 0.2, 0, 0.25], 0.06, 0.06);
      sh.beam(BARK_D, [s * 0.45, 0.62, 0], [s * 0.45 - 0.2, 0, -0.25], 0.06, 0.06);
      sh.beam(BARK_D, [s * 0.45, 0.62, 0], [s * 0.45 + 0.2, 0, 0], 0.06, 0.06);
    }
    sh.box(PLK, 1.1, 0.08, 0.12, 0, 0.64, 0);
    sh.cyl(BARK, [-0.8, 0.85, 0], [0.75, 0.85, 0], 0.18, 0.18, 7);
    sh.cyl(PLK_L, [0.75, 0.85, 0], [0.77, 0.85, 0], 0.17, 0.17, 7);
    sh.geo(STONE_L, new THREE.CylinderGeometry(0.2, 0.2, 0.02, 10).rotateX(Math.PI / 2).translate(0.1, 1.05, 0.05));
    // tool rack on the side wall
    const tr = k.sub(X0 - 0.06, 0, 3.4, -90);
    tr.box(PLK_D, 0.9, 0.12, 0.06, 0, 1.95, 0);
    tr.box(IRON, 0.08, 0.6, 0.02, -0.25, 1.6, 0.03);
    tr.box(IRON_L, 0.3, 0.18, 0.02, -0.25, 1.32, 0.03);
    tr.box(PLK, 0.05, 0.55, 0.04, 0.05, 1.62, 0.04);
    tr.box(IRON, 0.22, 0.08, 0.06, 0.05, 1.9, 0.05);
    tr.box(PLK, 0.05, 0.6, 0.04, 0.3, 1.6, 0.04);
    tr.box(STONE_L, 0.18, 0.2, 0.03, 0.3, 1.32, 0.05);
    railing(k, [-2.4, 0, R(L2) + 1.4], [-2.4, 0, 5.4]);
    railing(k, [-0.6, 0, 6.7], [2.4, 0, 6.7]);
    railing(k, [2.4, 0, R(L2) + 1.4], [2.4, 0, 5.2]);
    lantern("lanternWork", k.p(X1 + 0.2, H - 0.1, Z1 + 0.4), 0.25, 0.85);
    k.beam(BARK_D, [X1, H - 0.1, Z1], [X1 + 0.2, H - 0.1, Z1 + 0.47], 0.07, 0.07);

    // the crane: post at the porch corner, boom out over the meadow, pulley, basket
    const PX = 2.35;
    const PZ = 5.85;
    k.cyl(BARK, [PX, -0.1, PZ], [PX, 3.7, PZ], 0.14, 0.12, 6);
    const boomEnd: V = [5.2, 3.5, PZ];
    k.beam(BARK, [PX - 0.2, 3.5, PZ], boomEnd, 0.18, 0.2);
    k.beam(BARK_D, [PX, 2.2, PZ], [PX + 1.6, 3.42, PZ], 0.12, 0.12);
    k.box(IRON, 0.24, 0.24, 0.24, boomEnd[0] - 0.1, 3.5, PZ);
    // winch drum on the post
    k.cyl(PLK_D, [PX - 0.3, 1.0, PZ + 0.22], [PX + 0.3, 1.0, PZ + 0.22], 0.14, 0.14, 7);
    k.cyl(ROPE, [PX - 0.22, 1.0, PZ + 0.22], [PX + 0.22, 1.0, PZ + 0.22], 0.17, 0.17, 7);
    k.beam(IRON, [PX + 0.32, 1.0, PZ + 0.22], [PX + 0.32, 1.25, PZ + 0.4], 0.04, 0.04);
    const wheelAt = k.p(boomEnd[0] - 0.15, 3.3, PZ);
    const wj = b.joint("liftWheel", { parent: base, at: wheelAt, dir: k.d(0, 0, 1) });
    const wk = new Kit(add, workSite, wj);
    wk.geo(
      IRON_L,
      new THREE.CylinderGeometry(0.26, 0.26, 0.08, 8).rotateX(Math.PI / 2).translate(boomEnd[0] - 0.15, 3.3, PZ),
    );
    wk.geo(
      IRON,
      new THREE.CylinderGeometry(0.08, 0.08, 0.14, 6).rotateX(Math.PI / 2).translate(boomEnd[0] - 0.15, 3.3, PZ),
    );
    k.beam(IRON, [boomEnd[0] - 0.15, 3.48, PZ - 0.07], [boomEnd[0] - 0.15, 3.25, PZ - 0.07], 0.03, 0.04);
    k.tube(
      ROPE,
      [
        [boomEnd[0] - 0.4, 3.32, PZ],
        [(PX + boomEnd[0]) / 2, 2.2, PZ + 0.1],
        [PX + 0.05, 1.15, PZ + 0.25],
      ],
      0.03,
      0.03,
      4,
      8,
    );
    const ropeTop = k.p(boomEnd[0] + 0.1, 3.3, PZ);
    const BASKET_Y = 3.4; // model space
    const lj = b.joint("liftBasket", { parent: base, at: ropeTop, dir: [0, -1, 0] });
    const lk = new Kit(add, Site.world().sub(ropeTop[0], BASKET_Y, ropeTop[2], WORK_AZ + 90), lj);
    W.on(lj).cyl(ROPE, ropeTop, [ropeTop[0], BASKET_Y + 1.25, ropeTop[2]], 0.03, 0.03, 4);
    lk.geo(IRON, new THREE.TorusGeometry(0.1, 0.03, 4, 6).translate(0, 1.3, 0));
    for (const [x, z] of [
      [-0.5, -0.4],
      [0.5, -0.4],
      [-0.5, 0.4],
      [0.5, 0.4],
    ] as const)
      lk.beam(ROPE_D, [0, 1.25, 0], [x, 0.62, z], 0.03, 0.03);
    lk.box(PLK_D, 1.1, 0.1, 0.9, 0, 0.05, 0);
    for (let i = 0; i < 4; i++) {
      lk.box(i % 2 ? PLK : PLK_L, 1.12, 0.13, 0.06, 0, 0.17 + i * 0.15, 0.45);
      lk.box(i % 2 ? PLK_L : PLK, 1.12, 0.13, 0.06, 0, 0.17 + i * 0.15, -0.45);
      lk.box(i % 2 ? PLK : PLK_L, 0.06, 0.13, 0.9, 0.55, 0.17 + i * 0.15, 0);
      lk.box(i % 2 ? PLK_L : PLK, 0.06, 0.13, 0.9, -0.55, 0.17 + i * 0.15, 0);
    }
    for (const x of [-0.55, 0.55]) for (const z of [-0.45, 0.45]) lk.box(BARK_D, 0.09, 0.66, 0.09, x, 0.33, z);
    lk.box(PLK_L, 0.4, 0.35, 0.4, -0.2, 0.3, 0.1, [0, 20, 0]);
    lk.blob(CREAM_D, 0.24, [0.25, 0.32, -0.1], [1, 1.1, 0.9], 3, 0);
    lk.blob(ORANGE, 0.18, [0.2, 0.62, 0.15], [1.2, 0.85, 1.2], 12, 1, 0.15);
  }

  // ===========================================================================================================
  // ROPE BRIDGE between the shop and workshop porches, and the laundry line above it
  // ===========================================================================================================
  {
    const A = shopSite.p(2.0, 0, 6.3);
    const B = workSite.p(-2.0, 0, 6.3);
    const dir = vec(B).sub(vec(A));
    const len = dir.length();
    dir.normalize();
    const side = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
    const SAG = 0.45;
    const at = (t: number, s: number, lift = 0): V => {
      const p = vec(A).lerp(vec(B), t).addScaledVector(side, s);
      return [p.x, p.y - SAG * 4 * t * (1 - t) + lift, p.z];
    };
    const n = Math.round(len / 0.33);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const j = hash(i, 4, 4, 9);
      const g = boxG(1.15 + (j - 0.5) * 0.12, 0.07, 0.24, [0, 0, 0], [0, (j - 0.5) * 8, 0]);
      g.applyQuaternion(aim(side, [0, 1, 0]));
      const p = at(t, 0);
      W.geo(PLANKS[i % 4]!, g.translate(p[0], p[1] - 0.035, p[2]));
    }
    for (const s of [-0.55, 0.55]) {
      const lo: V[] = [];
      const hi: V[] = [];
      for (let i = 0; i <= 12; i++) {
        lo.push(at(i / 12, s, -0.08));
        const t = i / 12;
        const p = vec(A)
          .lerp(vec(B), t)
          .addScaledVector(side, s * 1.05);
        hi.push([p.x, p.y + 1.15 - SAG * 0.55 * 4 * t * (1 - t), p.z]);
      }
      W.tube(ROPE, lo, 0.04, 0.04, 4, 24);
      W.tube(ROPE, hi, 0.045, 0.045, 4, 24);
      // fairy lights strung along the hand rope
      for (let i = 1; i < 16; i++) {
        const t = i / 16;
        const p = vec(A)
          .lerp(vec(B), t)
          .addScaledVector(side, s * 1.05);
        W.geo(
          i % 2 ? GLOW_LAMP : GLOW_WIN,
          new THREE.OctahedronGeometry(0.09).translate(p.x, p.y + 1.07 - SAG * 0.55 * 4 * t * (1 - t), p.z),
          1.8,
        );
      }
      for (let i = 1; i < 12; i++) W.cyl(ROPE_D, lo[i]!, hi[i]!, 0.018, 0.018, 3);
      for (const [p, q] of [
        [A, -1],
        [B, 1],
      ] as const) {
        const post = vec(p)
          .addScaledVector(side, s * 1.05)
          .addScaledVector(dir, q * 0.05);
        W.cyl(BARK, [post.x, post.y - 0.4, post.z], [post.x, post.y + 1.35, post.z], 0.12, 0.1, 6);
        W.geo(PLK_L, new THREE.ConeGeometry(0.15, 0.18, 6).translate(post.x, post.y + 1.44, post.z));
      }
    }
    // lanterns on hooks over the bridge ends
    for (const [p, q, name] of [
      [A, 1, "lanternBridgeA"],
      [B, -1, "lanternBridgeB"],
    ] as const) {
      const post = vec(p).addScaledVector(side, 0.55 * 1.05);
      const arm = post.clone().addScaledVector(dir, q * 0.45);
      W.beam(BARK_D, [post.x, post.y + 1.3, post.z], [arm.x, arm.y + 1.3, arm.z], 0.06, 0.06);
      lantern(name, [arm.x, arm.y + 1.27, arm.z], 0.12, 0.8);
    }
    // laundry line from the shop eave to the workshop eave
    const la = shopSite.p(1.95, 2.25, 5.35);
    const lb = workSite.p(-2.05, 2.35, 5.3);
    const line = sag(la, lb, 0.42, 10);
    const lj = b.joint("laundry", { parent: base, at: line[5]!, dir: [0, -1, 0] });
    W.tube(STONE_L, line, 0.02, 0.02, 3, 20);
    const pegs = [0.14, 0.27, 0.4, 0.52, 0.64, 0.77, 0.88];
    const tex = [SHIRT, SOCKS, TROUSERS, TOWEL, DRESS, SHIRT, SOCKS];
    const sizes: Array<[number, number]> = [
      [0.62, 0.62],
      [0.44, 0.44],
      [0.5, 0.72],
      [0.48, 0.6],
      [0.56, 0.72],
      [0.62, 0.62],
      [0.44, 0.44],
    ];
    const lineP = (t: number): V => {
      const k2 = Math.min(9.999, t * 10);
      const i = Math.floor(k2);
      const f = k2 - i;
      const p0 = line[i]!;
      const p1 = line[i + 1]!;
      return [p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f, p0[2] + (p1[2] - p0[2]) * f];
    };
    const ld = vec(lb).sub(vec(la)).normalize();
    const lflow = new THREE.Vector3(0, 1, 0).cross(ld).normalize();
    pegs.forEach((t, i) => {
      b.cards([frame(lineP(t), [0, 1, 0])], tex[i]!, {
        size: sizes[i]!,
        lean: 180,
        flow: lflow.toArray() as V,
        bone: lj,
        sink: 0.02,
      });
      const p = lineP(t);
      W.on(lj).box(PLK_L, 0.04, 0.09, 0.04, p[0], p[1], p[2]);
    });
  }

  // ===========================================================================================================
  // LANTERN LODGE, level 13.5 m, az -8: two storeys, a balcony, lanterns
  // ===========================================================================================================
  const LODGE_AZ = -8;
  const L3 = 13.5;
  const lodgeSite = Site.at(LODGE_AZ, L3);
  {
    const k = new Kit(add, lodgeSite, base);
    deck(k, -2.6, 2.6, R(L3) + 1.25, 6.3, 0);
    b.sweep(
      catmull([P(LODGE_AZ, R(10.8) - 0.5, 10.8), P(LODGE_AZ + 2, 2.6, 11.8), k.p(0.1, -0.45, 4.4), k.p(0, -0.42, 6.0)]),
      [0.5, 0.38, 0.28, 0.2],
      {
        bone: base,
        color: BARK,
        sides: 6,
        smooth: false,
        name: "lodgeBranch",
      },
    );
    for (const s of [-1, 1]) k.beam(BARK_D, [s * 2.4, -0.3, 6.0], [s * 0.6, -2.4, R(L3 - 2.4) + 0.05], 0.14, 0.14);
    const X = 1.8;
    const Z0 = 2.85;
    const Z1 = 4.95;
    const H1 = 2.3;
    const H2 = 2.0;
    const J = 0.32; // jetty overhang of the upper floor
    // ground floor: cream plaster in a dark timber frame
    k.box(CREAM, 2 * X, H1, Z1 - Z0, 0, H1 / 2, (Z0 + Z1) / 2);
    k.box(STONE, 2 * X + 0.14, 0.32, Z1 - Z0 + 0.14, 0, 0.16, (Z0 + Z1) / 2);
    k.box(STONE_L, 2 * X + 0.2, 0.06, Z1 - Z0 + 0.2, 0, 0.33, (Z0 + Z1) / 2);
    const frameFace = (fk: Kit, w: number, y0: number, h: number, diag: boolean) => {
      fk.box(BARK_D, w + 0.1, 0.14, 0.08, 0, y0 + h - 0.07, 0.04);
      for (const x of [-w / 2, w / 2]) fk.box(BARK_D, 0.16, h, 0.1, x, y0 + h / 2, 0.04);
      if (diag) {
        fk.beam(BARK_D, [-w / 2 + 0.1, y0 + 0.4, 0.05], [-w / 2 + 0.55, y0 + h - 0.15, 0.05], 0.12, 0.06, [0, 0, 1]);
        fk.beam(BARK_D, [w / 2 - 0.1, y0 + 0.4, 0.05], [w / 2 - 0.55, y0 + h - 0.15, 0.05], 0.12, 0.06, [0, 0, 1]);
      }
    };
    frameFace(k.sub(0, 0, Z1), 2 * X, 0.3, H1 - 0.3, false);
    frameFace(k.sub(X, 0, (Z0 + Z1) / 2, 90), Z1 - Z0, 0.3, H1 - 0.3, true);
    frameFace(k.sub(-X, 0, (Z0 + Z1) / 2, -90), Z1 - Z0, 0.3, H1 - 0.3, true);
    door("lodgeDoor", k.sub(0, 0.3, Z1 + 0.02), 0.85, 1.75, SLATE, -1, true);
    b.part(new THREE.PlaneGeometry(1.6, 0.4), "#ffffff", {
      bone: base,
      at: k.p(0, H1 + 0.2, Z1 + J + 0.07),
      dir: k.d(0, 0, 1),
      axis: "z",
      texture: LODGE_SIGN,
      name: "lodgeSign",
    });
    for (const s of [-1, 1]) windowAt(k.sub(s * 1.15, 1.3, Z1 + 0.04), 0.6, 0.75, { shutters: SLATE, box: true });
    windowAt(k.sub(X + 0.04, 1.3, (Z0 + Z1) / 2, 90), 0.55, 0.7, { cross: true });
    windowAt(k.sub(-X - 0.04, 1.3, (Z0 + Z1) / 2, -90), 0.55, 0.7, { cross: true });
    // upper floor, jettied out over the front
    const U0 = H1;
    k.box(BARK_D, 2 * X + 0.3, 0.2, Z1 - Z0 + J + 0.15, 0, U0 + 0.1, (Z0 + Z1 + J) / 2);
    for (let i = 0; i < 6; i++) k.box(BARK, 0.12, 0.14, 0.3, -X + 0.15 + (i * (2 * X - 0.3)) / 5, U0 - 0.02, Z1 + 0.12);
    k.box(CREAM, 2 * X + 0.1, H2, Z1 - Z0 + J, 0, U0 + 0.2 + H2 / 2, (Z0 + Z1 + J) / 2);
    frameFace(k.sub(0, U0 + 0.2, Z1 + J), 2 * X + 0.1, 0, H2, true);
    frameFace(k.sub(X + 0.05, U0 + 0.2, (Z0 + Z1 + J) / 2, 90), Z1 - Z0 + J, 0, H2, true);
    frameFace(k.sub(-X - 0.05, U0 + 0.2, (Z0 + Z1 + J) / 2, -90), Z1 - Z0 + J, 0, H2, true);
    door("balconyDoor", k.sub(0, U0 + 0.2, Z1 + J + 0.02), 0.8, 1.6, SLATE, 1);
    windowAt(k.sub(X + 0.09, U0 + 1.2, (Z0 + Z1 + J) / 2, 90), 0.5, 0.6, { shutters: SLATE });
    windowAt(k.sub(-X - 0.09, U0 + 1.2, (Z0 + Z1 + J) / 2, -90), 0.5, 0.6, { shutters: SLATE });
    // balcony
    const BZ0 = Z1 + J;
    const BZ1 = BZ0 + 1.0;
    const BY = U0 + 0.2;
    const bk = k.sub(0, BY, 0);
    deck(bk, -1.4, 1.4, BZ0, BZ1, 1);
    for (const s of [-1, 1]) k.beam(BARK_D, [s * 1.2, BY - 0.25, BZ1 - 0.15], [s * 1.2, 0.9, Z1 + 0.05], 0.12, 0.12);
    railing(bk, [-1.35, 0, BZ1 - 0.06], [1.35, 0, BZ1 - 0.06], { h: 0.9, rope: false });
    railing(bk, [-1.35, 0, BZ0 + 0.05], [-1.35, 0, BZ1 - 0.06], { h: 0.9, rope: false });
    railing(bk, [1.35, 0, BZ0 + 0.05], [1.35, 0, BZ1 - 0.06], { h: 0.9, rope: false });
    flowerBox(bk.sub(-0.75, 0.95, BZ1 + 0.1), 0.9);
    flowerBox(bk.sub(0.75, 0.95, BZ1 + 0.1), 0.9);
    lantern("lanternLodgeL", k.p(1.25, BY - 0.25, BZ1 - 0.1), 0.2, 0.9);
    lantern("lanternLodgeR", k.p(-1.25, BY - 0.25, BZ1 - 0.1), 0.2, 0.9);
    // roof: steep slate shingles, ridge along x
    const RY = U0 + 0.2 + H2;
    gableRoof(k.sub(0, RY, (Z0 + Z1 + J) / 2), 2 * X + 0.8, (Z1 - Z0 + J) / 2 + 0.42, 1.9, [SLATE, SLATE_L, SLATE_D]);
    for (const s of [-1, 1])
      k.geo(
        CREAM,
        triG(Z1 - Z0 + J, 1.85, 0.1)
          .rotateY(Math.PI / 2)
          .translate(s * (X + 0.05), RY, (Z0 + Z1 + J) / 2),
      );
    for (const s of [-1, 1]) {
      const wk = k.sub(s * (X + 0.1), RY + 0.6, (Z0 + Z1 + J) / 2, s * 90);
      wk.geo(GLOW_WIN, new THREE.CylinderGeometry(0.24, 0.24, 0.06, 8).rotateX(Math.PI / 2), 1.3);
      wk.geo(BARK_D, new THREE.TorusGeometry(0.27, 0.06, 4, 8).translate(0, 0, 0.04));
      wk.box(BARK_D, 0.04, 0.48, 0.05, 0, 0, 0.05);
      lantern(s > 0 ? "lanternGableL" : "lanternGableR", wk.p(0, -0.55, 0.55), 0.15, 0.8);
      wk.beam(BARK_D, [0, -0.55, 0], [0, -0.55, 0.6], 0.07, 0.07);
    }
    // stone chimney on the +x gable
    const cx = X - 0.5;
    for (let i = 0; i < 9; i++)
      k.box(
        i % 2 ? STONE : STONE_L,
        0.62 - (i % 2) * 0.04,
        0.4,
        0.62 - (i % 2) * 0.04,
        cx,
        RY - 0.6 + i * 0.4,
        Z0 + 0.6,
      );
    k.box(STONE_D, 0.75, 0.12, 0.75, cx, RY - 0.6 + 9 * 0.4 - 0.15, Z0 + 0.6);
    k.box(IRON, 0.3, 0.06, 0.3, cx, RY - 0.6 + 9 * 0.4 - 0.08, Z0 + 0.6);
    // deck railing: front and +x side; the -x side carries the lookout ladder
    railing(k, [-2.5, 0, 6.2], [-0.7, 0, 6.2]);
    railing(k, [0.7, 0, 6.2], [2.5, 0, 6.2]);
    railing(k, [2.5, 0, R(L3) + 1.35], [2.5, 0, 6.2]);
    railing(k, [-2.5, 0, 3.6], [-2.5, 0, 6.2]);
    // potted tree, bench and a little telescope stand on the porch
    k.box(PLK_D, 1.2, 0.08, 0.4, 1.7, 0.45, 5.6, [0, 90, 0]);
    for (const z of [5.1, 6.1]) k.box(BARK_D, 0.35, 0.42, 0.08, 1.7, 0.21, z);
    k.cyl(RED_D, [-1.8, 0, 5.6], [-1.8, 0.45, 5.6], 0.26, 0.32, 7);
    k.blob(LEAF_M, 0.4, [-1.8, 0.85, 5.6], [1, 1.1, 1], 21, 0);
    k.blob(LEAF_L, 0.22, [-1.7, 1.15, 5.65], [1, 1, 1], 22, 0);
    // lookout ladder
    const lb = lodgeSite.p(-2.35, 0, 3.1);
    const lt = P(-38, 1.25, TOP);
    ladder(W, lb, [lt[0], TOP - 0.05, lt[2]], 0.6, [Math.cos(-38 * D), 0, -Math.sin(-38 * D)]);
  }

  // ===========================================================================================================
  // CROW'S NEST LOOKOUT at the top of the trunk
  // ===========================================================================================================
  {
    const k = kitAt(0, TOP);
    const NR2 = 2.0;
    for (let i = 0; i < 12; i++) {
      const a0 = (i / 12) * Math.PI * 2;
      k.geo(
        PLANKS[i % 4]!,
        new THREE.CylinderGeometry(NR2, NR2, 0.15, 2, 1, false, a0, (Math.PI * 2) / 12 - 0.02).translate(0, -0.075, 0),
      );
    }
    k.geo(BARK_D, new THREE.CylinderGeometry(NR2 - 0.1, NR2 - 0.5, 0.35, 12).translate(0, -0.32, 0));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * 360 + 22;
      k.sub(0, 0, 0, a).beam(BARK_D, [0, -0.35, NR2 - 0.4], [0, -2.0, R(TOP - 2) - 0.05], 0.13, 0.13);
    }
    const NST = 24;
    for (let i = 0; i < NST; i++) {
      const a = ((i + 0.5) / NST) * 360;
      if (Math.abs(((a + 38 + 360) % 360) - 180) > 168) continue; // ladder gap at az -38
      k.sub(0, 0, 0, a).box(
        i % 2 ? PLK : PLK_L,
        ((2 * Math.PI * NR2) / NST) * 0.96,
        1.05 - (i % 3) * 0.04,
        0.1,
        0,
        0.5,
        NR2 - 0.05,
      );
    }
    for (const y of [0.25, 0.85])
      k.geo(IRON, new THREE.TorusGeometry(NR2 + 0.02, 0.045, 3, 14).rotateX(Math.PI / 2).translate(0, y, 0));
    k.geo(PLK_L, new THREE.TorusGeometry(NR2 - 0.05, 0.09, 4, 14).rotateX(Math.PI / 2).translate(0, 1.07, 0));
    // hatch over the ladder
    const ha = k.sub(0, 0, 0, -38);
    const hj = b.joint("nestHatch", {
      parent: base,
      at: ha.p(-0.4, 0.02, 0.9),
      dir: ha.d(1, 0, 0),
      up: [0, 1, 0],
      role: "hinge",
    });
    const hk = ha.on(hj);
    for (let i = 0; i < 4; i++) hk.box(i % 2 ? PLK : PLK_L, 0.2, 0.06, 0.62, -0.3 + i * 0.2, 0.04, 1.22);
    hk.box(IRON, 0.7, 0.03, 0.06, 0, 0.08, 1.05);
    hk.box(IRON, 0.7, 0.03, 0.06, 0, 0.08, 1.4);
    // roof on four posts
    const RY = 2.35;
    for (let i = 0; i < 4; i++) {
      const a = (i * 90 + 45) * D;
      k.box(BARK_D, 0.16, RY + 0.1, 0.16, Math.sin(a) * (NR2 - 0.2), RY / 2, Math.cos(a) * (NR2 - 0.2));
    }
    k.geo(RED_D, new THREE.CylinderGeometry(2.35, 2.35, 0.14, 10).translate(0, RY + 0.05, 0));
    k.geo(RED, new THREE.ConeGeometry(2.3, 1.15, 10).translate(0, RY + 0.12 + 0.575, 0));
    k.geo(RED_L, new THREE.ConeGeometry(1.25, 0.66, 10).translate(0, RY + 0.12 + 1.15 - 0.3, 0));
    k.geo(GOLD, new THREE.CylinderGeometry(0.1, 0.12, 0.25, 6).translate(0, RY + 1.32, 0));
    k.cyl(BARK_D, [0, RY + 1.2, 0], [0, 28.0 - TOP, 0], 0.06, 0.045, 5);
    k.blob(GOLD, 0.11, [0, 28.0 - TOP - 0.02, 0], [1, 1, 1], 2, 0);
    // pennant bunting under the roof edge
    const bunt: Frame[] = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      bunt.push(frame(k.p(Math.sin(a) * 2.3, RY - 0.06, Math.cos(a) * 2.3), [0, 1, 0]));
    }
    b.cards(bunt, PENNANTS, {
      size: [0.32, 0.36],
      lean: 180,
      flow: (f) => [f.at.x, 0, f.at.z],
      bone: base,
      rng: rng(5),
      sink: 0,
    });
    // telescope on a tripod, a bell and a lantern
    const tk = k.sub(0, 0, 0, 140);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      tk.beam(BARK_D, [0, 1.0, 1.2], [Math.sin(a) * 0.35, 0, 1.2 + Math.cos(a) * 0.35], 0.05, 0.05);
    }
    tk.cyl(GOLD, [0, 1.05, 0.85], [0, 1.35, 2.0], 0.1, 0.13, 7);
    tk.cyl(IRON, [0, 1.3, 1.85], [0, 1.38, 2.15], 0.15, 0.15, 7);
    tk.cyl(IRON, [0, 1.05, 0.85], [0, 1.02, 0.75], 0.08, 0.06, 6);
    const bellAt = k.p(0, RY - 0.1, 0);
    const bj = b.joint("nestBell", { parent: base, at: bellAt, dir: [0, -1, 0] });
    const bkk = k.on(bj);
    bkk.cyl(IRON, [0, RY - 0.05, 0], [0, RY - 0.3, 0], 0.02, 0.02, 4);
    bkk.geo(GOLD, new THREE.CylinderGeometry(0.12, 0.3, 0.4, 8).translate(0, RY - 0.5, 0));
    bkk.geo(GOLD, new THREE.CylinderGeometry(0.31, 0.31, 0.06, 8).translate(0, RY - 0.71, 0));
    bkk.blob(IRON, 0.07, [0, RY - 0.78, 0], [1, 1, 1], 3, 0);
    lantern("lanternNest", k.p(Math.sin(45 * D) * 1.55, RY - 0.1, Math.cos(45 * D) * 1.55), 0.2, 0.85);
    // flag on the mast
    const poleTop: V = k.p(0, 28.0 - TOP - 0.15, 0);
    const flagPts: V[] = [0, 0.33, 0.66, 1].map((t) => [
      poleTop[0] + t * 1.5,
      poleTop[1] - 0.05 * Math.sin(t * Math.PI),
      poleTop[2] + 0.12 * Math.sin(t * Math.PI * 2),
    ]);
    const flag = b.chain("flag", catmull(flagPts), { parent: base, count: 3 });
    b.membrane(
      flag,
      flagPts.map((p, i) => [p[0] - i * 0.05, p[1] - 0.85 + i * 0.12, p[2]] as V),
      {
        thickness: 0.03,
        scallop: 0.18,
        color: paint((_p, _n, s) => (s[0] < 0.2 ? (s[1] < 0.5 ? GOLD : RED) : s[1] > 0.38 && s[1] < 0.62 ? GOLD : RED)),
        name: "flag",
      },
    );
  }

  // ===========================================================================================================
  // CROWN: swaying limbs with chunky faceted foliage and leaf cards
  // ===========================================================================================================
  type Limb = { name: string; az: number; pts: Array<[number, number, number]>; k: number; big: number };
  const LIMBS: Limb[] = [
    {
      name: "limbA",
      az: 62,
      pts: [
        [0.4, 15.6, 0],
        [2.4, 17.0, 3],
        [4.8, 18.6, 6],
        [7.0, 19.4, 4],
      ],
      k: 5,
      big: 2.4,
    },
    {
      name: "limbB",
      az: 122,
      pts: [
        [0.4, 15.2, 0],
        [2.6, 16.7, -3],
        [5.0, 18.2, -5],
        [7.2, 18.8, -2],
      ],
      k: 5,
      big: 2.5,
    },
    {
      name: "limbC",
      az: 188,
      pts: [
        [0.4, 16.0, 0],
        [2.6, 17.5, 3],
        [5.0, 19.0, 5],
        [7.3, 19.6, 3],
      ],
      k: 5,
      big: 2.5,
    },
    {
      name: "limbD",
      az: 248,
      pts: [
        [0.4, 15.6, 0],
        [2.5, 17.0, -2],
        [4.8, 18.4, -5],
        [7.0, 19.0, -4],
      ],
      k: 5,
      big: 2.4,
    },
    {
      name: "limbE",
      az: 292,
      pts: [
        [0.4, 17.0, 0],
        [2.4, 18.5, 4],
        [4.6, 19.8, 6],
        [6.6, 20.6, 4],
      ],
      k: 4,
      big: 2.3,
    },
    {
      name: "limbF",
      az: 15,
      pts: [
        [0.3, 20.0, 0],
        [2.0, 21.2, 3],
        [3.8, 22.3, 5],
        [5.4, 22.9, 4],
      ],
      k: 4,
      big: 2.2,
    },
    {
      name: "limbG",
      az: 150,
      pts: [
        [0.3, 19.6, 0],
        [2.0, 21.0, -3],
        [3.8, 22.2, -4],
        [5.2, 22.9, -2],
      ],
      k: 4,
      big: 2.2,
    },
    {
      name: "limbH",
      az: 262,
      pts: [
        [0.3, 20.2, 0],
        [1.9, 21.4, 3],
        [3.6, 22.5, 5],
        [5.0, 23.2, 3],
      ],
      k: 4,
      big: 2.0,
    },
    {
      name: "limbI",
      az: 82,
      pts: [
        [0.3, 19.8, 0],
        [1.9, 21.0, -2],
        [3.6, 22.1, -3],
        [5.0, 22.8, 0],
      ],
      k: 3,
      big: 2.0,
    },
  ];
  LIMBS.forEach((L, li) => {
    const pts = L.pts.map(([r, y, da]) => P(L.az + da, r, y));
    const ch = b.chain(L.name, catmull(pts), { parent: base, count: 2 });
    b.sweep(ch, [0.62, 0.48, 0.3, 0.16], {
      color: BARK,
      sides: 6,
      smooth: false,
      caps: { start: "flat", end: "round" },
      name: `${L.name}Wood`,
    });
    const j2 = ch.joints[1]!;
    const lk = new Kit(add, Site.world(), j2);
    const end = vec(pts[pts.length - 1]!);
    const out = new THREE.Vector3(end.x, 0, end.z).normalize();
    const lr = rng(300 + li);
    const blobs: Array<[THREE.Vector3, number, string]> = [];
    blobs.push([end.clone().add(new THREE.Vector3(0, 0.5, 0)), L.big, LEAF]);
    for (let i = 0; i < L.k; i++) {
      const a = (i / L.k) * Math.PI * 2 + lr() * 0.8;
      const d = L.big * (0.75 + lr() * 0.3);
      const side = new THREE.Vector3(-out.z, 0, out.x);
      const off = out
        .clone()
        .multiplyScalar(Math.cos(a) * d)
        .addScaledVector(side, Math.sin(a) * d * 1.1);
      const yo = -0.5 + lr() * 1.4;
      const c = end
        .clone()
        .add(off)
        .add(new THREE.Vector3(0, yo, 0));
      blobs.push([c, L.big * (0.62 + lr() * 0.2), yo < 0.1 ? LEAF_D : LEAF]);
    }
    // a cluster midway along the limb
    const midP = ch
      .at(0.5)
      .at.clone()
      .add(new THREE.Vector3(0, 0.9, 0))
      .addScaledVector(out, 0.4);
    blobs.push([midP, L.big * 0.62, LEAF_D]);
    const byCol = new Map<string, THREE.BufferGeometry[]>();
    const push = (c: string, g: THREE.BufferGeometry) => {
      const list = byCol.get(c) ?? [];
      list.push(g);
      byCol.set(c, list);
    };
    blobs.forEach(([c, r, col], i) => {
      push(col, blobG(r, [c.x, c.y, c.z], [1, 0.74, 1], li * 20 + i, 1, 0.26));
      // highlight cap up and out
      const hc = c
        .clone()
        .add(new THREE.Vector3(0, r * 0.42, 0))
        .addScaledVector(out, r * 0.18);
      push(col === LEAF_D ? LEAF : LEAF_M, blobG(r * 0.62, [hc.x, hc.y, hc.z], [1, 0.7, 1], li * 20 + i + 7, 1, 0.24));
      if (i % 2 === 0) {
        const tc = hc
          .clone()
          .add(new THREE.Vector3(0, r * 0.3, 0))
          .addScaledVector(out, r * 0.12);
        push(LEAF_L, blobG(r * 0.32, [tc.x, tc.y, tc.z], [1, 0.75, 1], li * 20 + i + 13, 0, 0.2));
      }
      const from = ch.at(0.72).at;
      lk.cyl(BARK, [from.x, from.y, from.z], [c.x, c.y - r * 0.3, c.z], 0.13, 0.07, 5);
    });
    const parts = [...byCol.entries()].map(([c, list]) =>
      b.part(mergeGeometries(list.map((g) => (g.index ? g.toNonIndexed() : g)))!, c, {
        bone: j2,
        at: [0, 0, 0],
        flat: true,
        name: `${L.name}Leaves${c.slice(1)}`,
      }),
    );
    const leafSurf = b.surface(parts);
    const hits = leafSurf.scatter(34 + L.k * 5, { rng: rng(500 + li), minDist: 0.85, filter: (h) => h.n.y > -0.35 });
    b.cards(hits, LEAVES, {
      size: [1.45, 1.3],
      lean: 35,
      flow: (f) => [f.at.x - end.x + out.x * 0.5, -0.6, f.at.z - end.z + out.z * 0.5],
      vary: 0.3,
      spin: 35,
      rng: rng(700 + li),
      sink: 0.3,
      bone: j2,
    });
    // elderflower umbels: creamy flat heads on the sunny side
    for (const h of leafSurf.scatter(7, { rng: rng(900 + li), minDist: 1.6, filter: (hh) => hh.n.y > 0.35 })) {
      const p = h.at;
      lk.blob(CREAM, 0.24, [p.x, p.y + 0.04, p.z], [1.3, 0.45, 1.3], li * 7 + p.x, 0, 0.15);
      lk.blob(WHITE, 0.1, [p.x + 0.08, p.y + 0.14, p.z - 0.05], [1, 0.7, 1], 2, 0);
      lk.blob(STRAW_L, 0.08, [p.x - 0.1, p.y + 0.12, p.z + 0.07], [1, 0.7, 1], 3, 0);
    }
    // red paper lanterns swinging under the lower limbs
    if (["limbA", "limbB", "limbD", "limbE"].includes(L.name)) {
      const hp = ch.at(0.62).at;
      const hook: V = [hp.x, hp.y - 0.25, hp.z];
      const pj = b.joint(`${L.name}Lantern`, { parent: j2, at: hook, dir: [0, -1, 0] });
      const pk = W.on(pj);
      const c: V = [hook[0], hook[1] - 0.9, hook[2]];
      pk.cyl(IRON, hook, [c[0], c[1] + 0.32, c[2]], 0.02, 0.02, 3);
      pk.geo(RED_L, new THREE.CylinderGeometry(0.22, 0.22, 0.42, 8).translate(c[0], c[1], c[2]), 1.3);
      pk.geo(RED, new THREE.CylinderGeometry(0.2, 0.3, 0.12, 8).translate(c[0], c[1] + 0.27, c[2]), 1.0);
      pk.geo(RED, new THREE.CylinderGeometry(0.3, 0.2, 0.12, 8).translate(c[0], c[1] - 0.27, c[2]), 1.0);
      pk.geo(GOLD, new THREE.CylinderGeometry(0.12, 0.12, 0.06, 6).translate(c[0], c[1] + 0.36, c[2]));
      pk.geo(GOLD, new THREE.CylinderGeometry(0.1, 0.12, 0.06, 6).translate(c[0], c[1] - 0.36, c[2]));
      pk.cyl(GOLD, [c[0], c[1] - 0.39, c[2]], [c[0], c[1] - 0.62, c[2]], 0.025, 0.025, 3);
    }
  });

  // ===========================================================================================================
  // LOW BRANCH with the rope swing
  // ===========================================================================================================
  {
    const SAZ = 186;
    const pts: V[] = [P(SAZ, R(8.0) - 0.5, 8.0), P(SAZ + 3, 2.8, 8.5), P(SAZ + 5, 5.0, 8.7), P(SAZ + 4, 7.2, 9.3)];
    b.sweep(catmull(pts), [0.5, 0.38, 0.25, 0.14], {
      bone: base,
      color: BARK,
      sides: 6,
      smooth: false,
      caps: { start: "flat", end: "round" },
      name: "swingBranch",
    });
    const tip = vec(pts[3]!);
    const out = new THREE.Vector3(tip.x, 0, tip.z).normalize();
    const side = new THREE.Vector3(-out.z, 0, out.x);
    const leafy: Array<[number, number, number, number, string]> = [
      [0, 0.35, 0, 1.15, LEAF],
      [-1.1, 0.0, 0.7, 0.85, LEAF_D],
      [0.2, 0.15, -0.9, 0.8, LEAF_D],
      [0.7, 0.2, 0.5, 0.7, LEAF],
      [-0.1, 0.95, 0.1, 0.72, LEAF_M],
      [-0.9, 0.55, 0.6, 0.5, LEAF_M],
      [0.05, 1.35, 0.05, 0.36, LEAF_L],
    ];
    leafy.forEach(([o, u, sd, r, c], i) => {
      const p = tip.clone().addScaledVector(out, o).addScaledVector(side, sd);
      W.blob(c, r, [p.x, p.y + u, p.z], [1, 0.75, 1], 801 + i, r > 0.6 ? 1 : 0, 0.26);
    });
    const hook = P(SAZ + 5, 4.9, 8.62);
    const sj = b.joint("ropeSwing", { parent: base, at: hook, dir: [0, -1, 0] });
    const sk = new Kit(add, Site.world().sub(hook[0], 0, hook[2], SAZ + 90), sj);
    const seatY = 1.25;
    for (const s of [-1, 1]) {
      sk.cyl(ROPE, [s * 0.32, hook[1] - 0.1, 0], [s * 0.3, seatY + 0.05, 0], 0.03, 0.03, 4);
      sk.geo(ROPE_D, new THREE.TorusGeometry(0.1, 0.035, 3, 6).translate(s * 0.32, hook[1] - 0.05, 0));
    }
    sk.box(PLK_L, 0.8, 0.07, 0.3, 0, seatY, 0);
    sk.box(PLK_D, 0.8, 0.04, 0.3, 0, seatY - 0.055, 0);
  }

  // ===========================================================================================================
  // ZIP LINE from the hut down to a post at the meadow's edge
  // ===========================================================================================================
  {
    const hutK = kitAt(HUT_AZ, HUT_Y).sub(0, 0, HUT_R);
    const top = hutK.p(Math.sin(70 * D) * 1.95, 0, Math.cos(70 * D) * 1.95);
    W.cyl(BARK_D, [top[0], top[1] - 0.2, top[2]], [top[0], top[1] + 2.7, top[2]], 0.13, 0.11, 6);
    const zt: V = [top[0], top[1] + 2.5, top[2]];
    const ZAZ = -28;
    const zr = rg(ZAZ) - 1.1;
    const zp = P(ZAZ, zr, GY);
    W.cyl(BARK_D, [zp[0], GY - 0.2, zp[2]], [zp[0], GY + 2.6, zp[2]], 0.16, 0.13, 6);
    W.geo(PLK_L, new THREE.ConeGeometry(0.2, 0.22, 6).translate(zp[0], GY + 2.72, zp[2]));
    const zb: V = [zp[0], GY + 2.35, zp[2]];
    const zline = sag(zt, zb, 0.3, 10);
    W.tube(IRON_L, zline, 0.03, 0.03, 4, 20);
    // tyre bumper and stake ropes at the bottom post
    W.geo(IRON, new THREE.TorusGeometry(0.32, 0.12, 4, 8).translate(zp[0], GY + 1.6, zp[2]).rotateY(0));
    for (const a of [ZAZ - 20, ZAZ + 20]) {
      const st = P(a, zr + 1.0, GY);
      W.cyl(ROPE_D, [zp[0], GY + 2.3, zp[2]], [st[0], GY + 0.1, st[2]], 0.025, 0.025, 3);
      W.box(PLK, 0.1, 0.35, 0.1, st[0], GY + 0.1, st[2]);
    }
    const tt = zline[2]!;
    const tj = b.joint("zipTrolley", { parent: base, at: tt, dir: [0, -1, 0] });
    const tk = W.on(tj);
    tk.box(IRON, 0.2, 0.14, 0.28, tt[0], tt[1] - 0.02, tt[2]);
    tk.cyl(IRON_L, [tt[0], tt[1] - 0.08, tt[2]], [tt[0], tt[1] - 0.7, tt[2]], 0.03, 0.03, 4);
    tk.cyl(RED, [tt[0] - 0.3, tt[1] - 0.72, tt[2]], [tt[0] + 0.3, tt[1] - 0.72, tt[2]], 0.045, 0.045, 6);
  }

  // ===========================================================================================================
  // MEADOW PROPS: trunk door, signposts, notice board, lift landing, garden, firewood, mushrooms, lamps, stones
  // ===========================================================================================================
  {
    // round-topped door into the trunk, between two buttress fins
    const DAZ = 140;
    const dk = kitAt(DAZ, GY).sub(0, 0, R(1.4) + 0.05, 0, -12, 0);
    dk.box(BARK_D, 1.5, 2.15, 0.3, 0, 1.07, -0.15);
    dk.geo(
      BARK_D,
      new THREE.CylinderGeometry(0.75, 0.75, 0.3, 8, 1, false, -Math.PI / 2, Math.PI)
        .rotateX(Math.PI / 2)
        .rotateZ(-Math.PI / 2)
        .translate(0, 2.15, -0.15),
    );
    door("trunkDoor", dk, 1.05, 1.9, RED, 1, true);
    for (let i = 0; i < 7; i++) {
      const a = (-90 + (i * 180) / 6) * D;
      dk.box(i % 2 ? STONE : STONE_L, 0.32, 0.26, 0.24, Math.sin(a) * 0.78, 2.0 + Math.cos(a) * 0.65, 0.05, [
        0,
        0,
        -a / D,
      ]);
    }
    lantern("lanternTrunk", dk.p(0.95, 2.05, 0.4), 0.15, 0.8);
    dk.beam(BARK_D, [0.85, 2.05, 0.0], [0.95, 2.05, 0.45], 0.06, 0.06);
    // firewood stack beside the door
    const fk = kitAt(DAZ + 16, GY).sub(0, 0, 3.6, 0);
    for (let row = 0; row < 3; row++)
      for (let i = 0; i < 4 - row; i++) {
        const x = -0.45 + i * 0.3 + row * 0.15;
        fk.cyl(i % 2 ? BARK : BARK_L, [x, 0.14 + row * 0.26, -0.4], [x, 0.14 + row * 0.26, 0.4], 0.13, 0.13, 6);
        fk.cyl(PLK_L, [x, 0.14 + row * 0.26, 0.4], [x, 0.14 + row * 0.26, 0.42], 0.11, 0.11, 6);
      }
    fk.box(IRON_L, 0.06, 0.4, 0.2, 0.62, 0.35, 0.2, [0, 0, -20]);
    fk.box(PLK, 0.05, 0.8, 0.05, 0.75, 0.5, 0.2, [0, 0, -20]);
    // welcome signpost with arrows
    const SP = P(14, rg(14) - 1.6, GY);
    W.cyl(BARK, [SP[0], GY - 0.2, SP[2]], [SP[0], GY + 2.6, SP[2]], 0.1, 0.09, 6);
    W.geo(PLK_L, new THREE.ConeGeometry(0.14, 0.2, 6).translate(SP[0], GY + 2.7, SP[2]));
    const signs: Array<[THREE.Texture, number, number, number, [number, number]]> = [
      [WELCOME_SIGN, 2.05, 14, 0, [1.4, 0.36]],
      [ARROW_SHOP, 1.55, -20, 0.4, [1.0, 0.28]],
      [ARROW_LOOKOUT, 1.15, 60, 0.4, [1.0, 0.28]],
    ];
    signs.forEach(([tex, y, yaw, off, size], i) => {
      const sk = new Kit(add, Site.world().sub(SP[0], GY + y, SP[2], yaw), base);
      sk.box(BARK_D, size[0] + 0.06, size[1] + 0.06, 0.06, off, 0, 0);
      for (const s of [-1, 1])
        b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
          bone: base,
          at: sk.p(off, 0, s * 0.035),
          dir: sk.d(0, 0, s),
          axis: "z",
          texture: tex,
          name: `signpost${i}${s > 0 ? "F" : "B"}`,
        });
    });
    // notice board at the foot of the stairs
    const nk = kitAt(66, GY).sub(0, 0, 6.3, 0);
    for (const x of [-0.6, 0.6]) nk.cyl(BARK, [x, -0.2, 0], [x, 2.0, 0], 0.08, 0.07, 6);
    nk.box(BARK_D, 1.35, 1.0, 0.08, 0, 1.4, 0);
    nk.box(RED_D, 1.6, 0.08, 0.4, 0, 2.02, 0, [8, 0, 0]);
    b.part(new THREE.PlaneGeometry(1.25, 0.92), "#ffffff", {
      bone: base,
      at: nk.p(0, 1.4, 0.05),
      dir: nk.d(0, 0, 1),
      axis: "z",
      texture: NOTICE,
      name: "noticeBoard",
    });
    // lift landing pad under the basket
    const lp = workSite.p(5.55, 0, 5.85);
    const lpk = new Kit(add, Site.world().sub(lp[0], GY, lp[2], WORK_AZ + 90), base);
    for (let i = 0; i < 5; i++) lpk.box(PLANKS[i % 4]!, 1.6, 0.08, 0.28, 0, 0.1, -0.64 + i * 0.32);
    for (const x of [-0.6, 0.6]) lpk.box(BARK_D, 0.14, 0.1, 1.6, x, 0.03, 0);
    // pumpkin and cabbage patch with a little fence
    const gk = kitAt(222, GY).sub(0, 0, 6.6, 0);
    gk.geo(
      DIRT,
      slabG(() => 1.15, 8, -0.03, 0.06),
    );
    for (const [x, z, s] of [
      [-0.5, -0.3, 1],
      [0.35, 0.35, 0.8],
      [0.4, -0.45, 0.65],
    ] as const) {
      gk.blob(ORANGE, 0.32 * s, [x, 0.22 * s, z], [1.2, 0.8, 1.2], 40, 1, 0.12);
      gk.cyl(LEAF_D, [x, 0.4 * s, z], [x + 0.04, 0.52 * s, z], 0.04, 0.03, 4);
    }
    for (const [x, z] of [
      [-0.2, 0.6],
      [0.75, 0.0],
      [-0.85, 0.35],
    ] as const) {
      gk.blob(LEAF_L, 0.2, [x, 0.17, z], [1, 0.8, 1], 41, 0);
      gk.blob(LEAF_M, 0.15, [x, 0.25, z], [1, 0.8, 1], 42, 0);
    }
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      gk.box(PLK_L, 0.08, 0.55, 0.08, Math.sin(a) * 1.35, 0.25, Math.cos(a) * 1.35);
    }
    for (let i = 0; i < 9; i++) {
      if (i === 4) continue;
      const a0 = (i / 9) * Math.PI * 2;
      const a1 = ((i + 1) / 9) * Math.PI * 2;
      gk.beam(
        PLK,
        [Math.sin(a0) * 1.35, 0.4, Math.cos(a0) * 1.35],
        [Math.sin(a1) * 1.35, 0.4, Math.cos(a1) * 1.35],
        0.05,
        0.08,
      );
    }
    // mushroom rings and rocks
    const mush = (p: V, s: number, cap: string) => {
      W.cyl(CREAM, [p[0], GY - 0.05, p[2]], [p[0], GY + 0.3 * s, p[2]], 0.08 * s, 0.06 * s, 5);
      W.geo(cap, new THREE.CylinderGeometry(0.06 * s, 0.3 * s, 0.2 * s, 7).translate(p[0], GY + 0.36 * s, p[2]));
      W.geo(CREAM_D, new THREE.CylinderGeometry(0.28 * s, 0.24 * s, 0.03, 7).translate(p[0], GY + 0.25 * s, p[2]));
      for (let i = 0; i < 3; i++) {
        const a = i * 2.1 + s;
        W.blob(
          WHITE,
          0.035 * s,
          [p[0] + Math.sin(a) * 0.17 * s, GY + 0.38 * s, p[2] + Math.cos(a) * 0.17 * s],
          [1, 0.6, 1],
          i,
          0,
        );
      }
    };
    for (const [az, r, s, c] of [
      [300, 5.3, 1.3, RED_L],
      [306, 5.7, 0.9, RED_L],
      [296, 5.9, 0.7, RED_L],
      [176, 6.0, 1.1, GOLD],
      [170, 6.4, 0.75, GOLD],
      [104, 6.3, 1.0, RED_L],
      [236, 4.3, 0.8, VIOLET],
    ] as const)
      mush(P(az, r, 0), s, c);
    for (const [az, r, s] of [
      [42, 7.6, 0.6],
      [47, 8.0, 0.35],
      [130, 7.8, 0.55],
      [276, 7.9, 0.7],
      [282, 7.4, 0.35],
      [200, 8.1, 0.45],
      [320, 7.8, 0.4],
    ] as const) {
      const p = P(az, r, GY + s * 0.25);
      W.blob(STONE, s, p, [1.3, 0.7, 1.1], az, 0, 0.3);
      W.blob(STONE_L, s * 0.55, [p[0], p[1] + s * 0.35, p[2]], [1.2, 0.5, 1.1], az + 1, 0, 0.25);
    }
    // stepping stones from the meadow's front edge to the stairs
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const az = 20 + t * 62;
      const r = 8.3 - t * 3.0;
      const p = P(az, r, GY);
      W.geo(
        i % 2 ? STONE_L : STONE,
        new THREE.CylinderGeometry(0.34, 0.38, 0.1, 7).rotateY(i).translate(p[0], GY + 0.02, p[2]),
      );
    }
    // bushes: big lumpy clumps with a lighter cap, some with berries
    for (const [az, r, s, berry] of [
      [190, 3.9, 1.0, 1],
      [280, 3.6, 0.9, 0],
      [322, 3.9, 0.8, 1],
      [150, 7.9, 1.1, 0],
      [262, 8.1, 1.0, 1],
      [350, 7.7, 0.85, 0],
      [120, 7.8, 0.8, 1],
      [5, 4.1, 0.7, 0],
    ] as const) {
      const p = P(az, r, GY);
      const t = new THREE.Vector3(Math.cos(az * D), 0, -Math.sin(az * D));
      W.blob(LEAF, 0.75 * s, [p[0], GY + 0.35 * s, p[2]], [1.2, 0.8, 1.1], az, 1, 0.28);
      W.blob(
        LEAF_D,
        0.55 * s,
        [p[0] + t.x * 0.7 * s, GY + 0.22 * s, p[2] + t.z * 0.7 * s],
        [1.1, 0.8, 1.1],
        az + 2,
        1,
        0.28,
      );
      W.blob(
        LEAF_M,
        0.45 * s,
        [p[0] - t.x * 0.15 * s, GY + 0.75 * s, p[2] - t.z * 0.15 * s],
        [1.1, 0.75, 1.1],
        az + 3,
        0,
        0.2,
      );
      if (berry)
        for (let i = 0; i < 5; i++) {
          const a = i * 1.3 + az;
          W.blob(
            i % 2 ? RED_L : VIOLET,
            0.07,
            [p[0] + Math.sin(a) * 0.7 * s, GY + (0.45 + (i % 3) * 0.12) * s, p[2] + Math.cos(a) * 0.7 * s],
            [1, 1, 1],
            i,
            0,
          );
        }
    }
    // ivy climbing the back of the trunk
    const ivy: V[] = [];
    for (let i = 0; i <= 8; i++) {
      const y = GY + 0.1 + i * 0.6;
      ivy.push(P(190 + Math.sin(i * 1.3) * 6, R(y) + 0.06, y));
    }
    W.tube(LEAF_D, ivy, 0.06, 0.04, 4, 16);
    const ivyLeaves: Frame[] = [];
    for (let i = 0; i < 22; i++) {
      const y = GY + 0.3 + i * 0.22;
      const az = 190 + Math.sin(((y - GY - 0.1) / 0.6) * 1.3) * 6 + (i % 2 ? 7 : -7);
      ivyLeaves.push(frame(P(az, R(y) + 0.04, y), [Math.sin(az * D), 0.2, Math.cos(az * D)]));
    }
    b.cards(ivyLeaves, LEAVES, {
      size: [0.55, 0.5],
      lean: 60,
      flow: [0, -1, 0],
      vary: 0.25,
      spin: 30,
      rng: rng(61),
      bone: base,
      sink: 0.15,
    });
    // birdhouse on the trunk
    const bh = kitAt(75, 4.3).sub(0, 0, R(4.3) + 0.12);
    bh.box(BARK_D, 0.12, 0.7, 0.24, 0, 0, -0.06);
    bh.box(PLK_L, 0.42, 0.46, 0.36, 0, 0.05, 0.2);
    for (const s of [-1, 1]) bh.box(RED, 0.34, 0.05, 0.48, s * 0.13, 0.38, 0.2, [0, 0, -s * 38]);
    bh.cyl(DIRT_D, [0, 0.1, 0.36], [0, 0.1, 0.39], 0.08, 0.08, 6);
    bh.cyl(BARK_D, [0, -0.06, 0.37], [0, -0.06, 0.5], 0.02, 0.02, 4);
    // two lamp posts along the path
    for (const [az, r, name] of [
      [34, 7.6, 0],
      [74, 5.4, 1],
    ] as const) {
      const p = P(az, r, GY);
      W.cyl(BARK_D, [p[0], GY - 0.2, p[2]], [p[0], GY + 1.8, p[2]], 0.08, 0.06, 6);
      W.box(STONE_D, 0.3, 0.3, 0.3, p[0], GY + 0.1, p[2]);
      W.beam(BARK_D, [p[0], GY + 1.75, p[2]], [p[0] + 0.4, GY + 1.75, p[2]], 0.06, 0.06);
      lantern(name ? "lanternPathB" : "lanternPathA", [p[0] + 0.38, GY + 1.72, p[2]], 0.08, 0.75);
    }
  }

  // ===========================================================================================================
  // GROUND CARDS: grass tufts and flowers, kept off the paths, roots and props
  // ===========================================================================================================
  {
    const gs = b.surface(ground);
    const keep = (p: THREE.Vector3) => {
      const r = Math.hypot(p.x, p.z);
      const az = (Math.atan2(p.x, p.z) / D + 360) % 360;
      if (r < 3.9) return true;
      if (az > 15 && az < 95 && r < 8.6 && r > 4.0 && Math.abs(r - (8.3 - ((az - 20) / 62) * 3.0)) < 0.7) return true; // path
      if (FINS.some((f) => Math.abs(((az - f + 540) % 360) - 180) < 8 && r < 7.2)) return true;
      return r > rg(az) * 0.95;
    };
    const tufts = gs.scatter(150, { rng: rng(41), minDist: 0.55, keepOut: keep, filter: (h) => h.n.y > 0.9 });
    b.cards(tufts, TUFTS, {
      size: [0.6, 0.45],
      cross: true,
      vary: 0.35,
      spin: 90,
      rng: rng(42),
      sink: 0.15,
      bone: base,
    });
    const fl = gs.scatter(46, { rng: rng(43), minDist: 0.7, keepOut: keep, filter: (h) => h.n.y > 0.9 });
    b.cards(fl, FLOWERS, { size: [0.3, 0.6], cross: true, vary: 0.25, spin: 90, rng: rng(44), sink: 0.1, bone: base });
  }

  // --- flush the batches ---------------------------------------------------------------------------------------
  let pi = 0;
  for (const e of batch.values()) {
    const merged = mergeGeometries(e.geos);
    if (!merged) throw new Error(`merge failed for ${e.bone.name} ${e.color}`);
    const part = b.part(merged, e.color, {
      bone: e.bone,
      at: [0, 0, 0],
      flat: true,
      name: `${e.bone.name}_${e.color.slice(1)}${e.glowS ? "_glow" : ""}_${pi++}`,
    });
    if (e.glowS) glow(part, e.glowS);
  }
  return b.root;
}
