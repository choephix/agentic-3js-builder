```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  paint,
  mix,
  noise,
  svg,
  catmull,
  bezier,
} from "agentic-3js-builder";
import type { Paint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Aetherfall — Ruins Above the Clouds",
  description:
    "A floating, faceted sky island in an anime-fantasy palette: ancient ivory arches, luminous turquoise water, wind-shaped trees, wildflowers and suspended stone roots.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Aetherfall", paintSize: 2048 });
  const random = rng(71429);
  const root = b.joint("island", { at: [0, 0, 0] });
  type Color = string | Paint;
  type P = [number, number, number];

  const C = {
    rock: "#324c68",
    rockDeep: "#23344e",
    rockLight: "#597c89",
    rockEdge: "#81a29e",
    grass: "#78b777",
    grassLight: "#b1d98a",
    grassDark: "#3f7e70",
    earth: "#456c67",
    ivory: "#e6e3c4",
    cream: "#fff2cc",
    stoneShade: "#9baea5",
    stoneDark: "#617e83",
    gold: "#c6a66a",
    goldLight: "#f3d68f",
    teal: "#278e9b",
    blue: "#35c5ce",
    white: "#e6ffff",
    leaf: "#47a58a",
    leafDark: "#237a79",
    leafLight: "#8ed69d",
    bark: "#6f7260",
    barkLight: "#a49b72",
    flower: "#f1dc9a",
    flowerBlue: "#87e9ee",
  };

  const rockPaint = paint((p, n) => {
    const strata = Math.sin(p.y * 6 + p.x * 0.5 + p.z * 0.7);
    const light = 0.22 + Math.max(0, n.y) * 0.3 + noise(p, 1.4, 6) * 0.26;
    return mix(C.rockDeep, strata > 0.75 ? C.rockLight : C.rock, light + 0.2);
  });
  const stonePaint = paint((p, n) => {
    const shade = 0.5 + n.y * 0.16 + noise(p, 0.65, 4) * 0.26;
    return mix(C.stoneShade, C.cream, shade);
  });
  const grassPaint = paint((p, n) => {
    const v = noise(p, 1.6, 13);
    return mix(C.grassDark, n.y > 0.4 ? C.grassLight : C.grass, 0.35 + v * 0.5);
  });
  const woodPaint = paint((p, n) =>
    mix(C.bark, C.barkLight, 0.15 + Math.max(0, n.y) * 0.3 + noise(p, 0.15, 12) * 0.3),
  );

  function box(
    name: string,
    at: P,
    size: P,
    color: Color,
    rotation: P = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      bone: root,
      name,
    });
  }

  function ico(name: string, at: P, size: P, color: Color, detail = 0) {
    return b.part(new THREE.IcosahedronGeometry(1, detail), color, {
      at,
      scale: size,
      bone: root,
      flat: true,
      name,
    });
  }

  function rod(name: string, a: P, z: P, radius: number, color: Color) {
    return b.rod(a, z, radius, {
      color,
      bone: root,
      sides: 6,
      smooth: false,
      name,
    });
  }

  function slab(name: string, points: P[], color: Color, thickness = 0.06) {
    return b.slab(points, { color, thickness, bone: root, name });
  }

  function plane(
    name: string,
    at: P,
    size: [number, number],
    texture: THREE.Texture,
    dir: P = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(...size), "#ffffff", {
      at,
      bone: root,
      texture,
      dir,
      axis: "z",
      name,
    });
  }

  // Drawings are deliberately graphic: dark outlines, quiet main colours,
  // and a final bright stroke instead of photographic surface noise.
  const runeTexture = svg(
    `<svg viewBox="0 0 128 256">
      <path d="M64 8 L110 42 V214 L64 248 L18 214 V42Z"
        fill="#234e66" stroke="#d1c28e" stroke-width="6"/>
      <path d="M64 24 L96 49 V204 L64 229 L32 204 V49Z"
        fill="none" stroke="#488d97" stroke-width="3"/>
      <g fill="none" stroke="#9ffcf0" stroke-width="6" stroke-linejoin="miter">
        <path d="M64 47 L83 72 L64 99 L45 72Z M64 99 V151"/>
        <path d="M43 122 L64 140 L85 122 M43 156 L64 178 L85 156"/>
        <path d="M64 178 V205 M48 193 H80"/>
      </g>
      <path d="M64 48 V92 M64 102 V148" stroke="#f0ffdf" stroke-width="3"/>
    </svg>`,
    { size: 384 },
  );

  const medallionTexture = svg(
    `<svg viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="59" fill="#31566a" stroke="#d1b97d" stroke-width="5"/>
      <circle cx="64" cy="64" r="48" fill="none" stroke="#6eaea9" stroke-width="3"/>
      <g fill="none" stroke="#c0fff0" stroke-width="5">
        <path d="M64 17 L77 49 L109 64 L77 78 L64 110 L50 78 L19 64 L50 49Z"/>
        <path d="M64 40 L86 64 L64 88 L42 64Z"/>
      </g>
      <circle cx="64" cy="64" r="7" fill="#f7ffe6"/>
      <g fill="#d1b97d">
        <circle cx="30" cy="30" r="4"/><circle cx="98" cy="30" r="4"/>
        <circle cx="30" cy="98" r="4"/><circle cx="98" cy="98" r="4"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const friezeTexture = svg(
    `<svg viewBox="0 0 512 64">
      <rect width="512" height="64" fill="#c6cfb4"/>
      <path d="M0 6 H512 M0 58 H512" stroke="#f6efd1" stroke-width="5"/>
      <path d="M0 16 H512 M0 48 H512" stroke="#72958c" stroke-width="3"/>
      <g fill="none" stroke="#5f817f" stroke-width="4">
        ${Array.from({ length: 8 }, (_, i) => {
          const x = i * 64;
          return `<path d="M${x + 9} 32 L${x + 32} 20 L${x + 55} 32 L${x + 32} 44Z
            M${x + 24} 32 H${x + 40}"/>`;
        }).join("")}
      </g>
    </svg>`,
    { size: 512 },
  );

  const crackTexture = svg(
    `<svg viewBox="0 0 128 128">
      <g fill="none" stroke="#708780" stroke-width="3.2" stroke-linejoin="bevel">
        <path d="M78 0 L67 27 L76 43 L50 68 L56 91 L39 128"/>
        <path d="M50 68 L24 62 L7 75 M76 43 L102 50 L116 38"/>
      </g>
      <path d="M81 0 L70 26 M53 72 L59 91 L43 128"
        fill="none" stroke="#fff5cf" stroke-width="2.4"/>
    </svg>`,
    { size: 256 },
  );

  const grassTexture = svg(
    `<svg viewBox="0 0 128 128">
      <path d="M14 128 Q24 77 6 43 Q44 57 47 114
        Q36 47 48 10 Q65 49 66 107 Q73 53 105 28
        Q85 79 85 119 Q104 87 124 81 L112 128Z" fill="#4b9477"/>
      <path d="M36 128 Q41 81 30 55 Q56 76 58 123
        Q61 62 73 31 Q80 84 75 126 Q99 82 113 70 L96 128Z" fill="#b7d989"/>
      <path d="M65 121 L70 65 M51 120 L40 82" stroke="#d5e7a3" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );

  const vineTexture = svg(
    `<svg viewBox="0 0 96 256">
      <path d="M48 256 Q32 186 54 131 Q66 72 42 0"
        fill="none" stroke="#39796c" stroke-width="7"/>
      <g fill="#69b988" stroke="#3c8b78" stroke-width="2">
        <path d="M47 235 Q5 234 10 200 Q39 200 47 235Z"/>
        <path d="M44 204 Q81 197 88 167 Q54 166 44 204Z"/>
        <path d="M47 175 Q12 167 7 138 Q42 138 47 175Z"/>
        <path d="M55 139 Q89 131 88 103 Q62 103 55 139Z"/>
        <path d="M56 108 Q21 97 20 72 Q51 75 56 108Z"/>
        <path d="M51 69 Q79 56 75 31 Q53 38 51 69Z"/>
        <path d="M45 37 Q22 28 29 7 Q48 17 45 37Z"/>
      </g>
      <path d="M18 208 L42 230 M80 175 L49 199 M29 82 L52 101"
        stroke="#c0dc96" stroke-width="3"/>
    </svg>`,
    { size: 384 },
  );

  const waterfallTexture = svg(
    `<svg viewBox="0 0 256 512">
      <rect width="256" height="512" fill="#45bbc9"/>
      <path d="M0 0 H59 L47 114 L63 208 L40 320 L52 512 H0Z" fill="#bafbed"/>
      <path d="M87 0 H116 L101 129 L119 215 L97 369 L105 512 H73
        L88 343 L76 220 L95 107Z" fill="#76e7e3"/>
      <path d="M152 0 H190 L181 134 L196 259 L175 398 L186 512 H148
        L160 356 L146 225 L162 98Z" fill="#dcfff4"/>
      <path d="M231 0 H256 V512 H225 L237 407 L218 271 L235 123Z" fill="#91f6e8"/>
      <g fill="none" stroke="#effff8" stroke-width="5">
        <path d="M29 15 L20 96 L27 181 M33 226 L22 353 L31 433"/>
        <path d="M171 38 L169 132 M175 270 L164 371 L168 459"/>
        <path d="M108 260 L103 328"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const rippleTexture = svg(
    `<svg viewBox="0 0 256 256">
      <g fill="none" stroke="#c0fff0" stroke-width="4">
        <path d="M42 105 Q128 70 213 105 M30 129 Q128 88 228 129"/>
        <path d="M53 157 Q125 181 202 157 M77 177 Q130 195 181 179"/>
        <path d="M78 94 Q125 80 173 94"/>
      </g>
      <g fill="#f0ffed">
        <path d="M52 65 L56 77 L68 81 L56 85 L52 97 L48 85 L36 81 L48 77Z"/>
        <path d="M209 171 L212 180 L221 183 L212 186 L209 195 L206 186 L197 183 L206 180Z"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  // The silhouette is a single crag, not a pile of disconnected spheres.
  const N = 13;
  const perimeter: P[] = [];
  const radii: number[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = 0.91 + random() * 0.17;
    radii.push(r);
    perimeter.push([Math.sin(a) * 5.25 * r, 5.22, Math.cos(a) * 4.25 * r]);
  }

  function cragGeometry(): THREE.BufferGeometry {
    const vertices: number[] = [];
    const indices: number[] = [];
    const rings = [
      { y: 5.22, scale: 1, twist: 0 },
      { y: 4.48, scale: 1.02, twist: 0.035 },
      { y: 2.95, scale: 0.68, twist: -0.07 },
      { y: 1.64, scale: 0.33, twist: 0.12 },
    ];
    rings.forEach((ring, row) => {
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2 + ring.twist;
        const jitter = row === 0 ? 0 : (random() - 0.5) * 0.65;
        vertices.push(
          Math.sin(a) * 5.25 * radii[i] * ring.scale,
          ring.y + jitter,
          Math.cos(a) * 4.25 * radii[i] * ring.scale - row * 0.12,
        );
      }
    });
    for (let row = 0; row < rings.length - 1; row++) {
      for (let i = 0; i < N; i++) {
        const j = (i + 1) % N;
        const a = row * N + i;
        const d = row * N + j;
        const c = (row + 1) * N + j;
        const e = (row + 1) * N + i;
        indices.push(a, d, e, d, c, e);
      }
    }
    const bottom = vertices.length / 3;
    vertices.push(-0.25, 0.75, -0.3);
    for (let i = 0; i < N; i++)
      indices.push(3 * N + i, 3 * N + ((i + 1) % N), bottom);
    const top = vertices.length / 3;
    vertices.push(0, 5.22, 0);
    for (let i = 0; i < N; i++) indices.push(top, (i + 1) % N, i);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }

  b.part(cragGeometry(), rockPaint, {
    at: [0, 0, 0],
    bone: root,
    flat: true,
    name: "great suspended basalt crag",
  });

  slab(
    "thick mossy island crown",
    perimeter.map(([x, , z]) => [x, 5.31, z] as P),
    grassPaint,
    0.23,
  );

  // Broad rock splinters continue the geological planes into the silhouette.
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    const f = 0.78 + random() * 0.13;
    const x = Math.sin(a) * 4.65 * f;
    const z = Math.cos(a) * 3.6 * f;
    const y = 3.65 + random() * 0.72;
    ico(
      `rim stone ${i}`,
      [x, y, z],
      [0.62 + random() * 0.44, 0.75 + random() * 0.65, 0.6 + random() * 0.4],
      i % 4 === 0 ? C.rockLight : rockPaint,
    );
  }

  for (let i = 0; i < 7; i++) {
    const a = i * 2.4;
    const x = Math.sin(a) * (0.8 + random() * 1.15);
    const z = Math.cos(a) * (0.7 + random());
    b.sweep(
      [
        [x, 3.3, z],
        [x * 0.84, 2.05, z * 0.78],
        [x * 0.72 - 0.12, 1.05 + random() * 0.35, z * 0.65],
      ],
      [0.5, 0.31, 0],
      {
        bone: root,
        color: i % 2 ? C.rockDeep : C.rock,
        section: { ngon: 5 },
        caps: "flat",
        name: `downward stone root ${i}`,
      },
    );
  }

  // A few small exposed aether minerals are embedded in the lower rock.
  for (const p of [
    [-3.3, 3.5, 1.3],
    [-2.75, 3.8, 1.6],
    [2.65, 3.15, 1.1],
    [2.9, 3.55, 1.3],
    [-0.8, 1.8, 0.8],
  ] as P[]) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.25), "#75d9d4", {
        at: p,
        scale: [0.65, 1.7, 0.8],
        rotation: [8, 12, -17],
        bone: root,
        flat: true,
        name: "aether vein",
      }),
      0.4,
    );
  }

  // Pool, stream bed and a wide lip on the front edge.
  const poolOutline: P[] = [
    [-0.15, 5.47, -1.9],
    [1.15, 5.47, -2.25],
    [2.2, 5.47, -1.65],
    [2.6, 5.47, -0.5],
    [2.08, 5.47, 0.45],
    [1.85, 5.47, 1.3],
    [2.0, 5.47, 2.15],
    [2.12, 5.47, 3.65],
    [0.65, 5.47, 3.98],
    [0.59, 5.47, 2.85],
    [0.3, 5.47, 1.75],
    [0.64, 5.47, 0.75],
    [-0.45, 5.47, 0.08],
    [-0.85, 5.47, -0.95],
  ];
  slab(
    "pale stone shoreline",
    poolOutline.map(([x, y, z]) => [1 + (x - 1) * 1.12, y - 0.075, z * 1.035] as P),
    C.stoneDark,
    0.1,
  );
  slab("deep turquoise pool", poolOutline, "#268f9f", 0.045);
  slab(
    "jade shallows",
    [
      [-0.45, 5.498, -0.9],
      [0.06, 5.498, -1.65],
      [1.2, 5.498, -1.95],
      [2.12, 5.498, -1.4],
      [2.3, 5.498, -0.6],
      [1.58, 5.498, -0.82],
      [0.7, 5.498, -0.5],
      [0.28, 5.498, 0.12],
    ],
    "#46bdb6",
    0.01,
  );
  slab(
    "stream sunlit current",
    [
      [0.7, 5.51, -0.5],
      [1.3, 5.51, -0.85],
      [1.76, 5.51, -0.1],
      [1.45, 5.51, 1.2],
      [1.79, 5.51, 2.35],
      [1.85, 5.51, 3.76],
      [0.96, 5.51, 3.92],
      [1.1, 5.51, 2.7],
      [0.83, 5.51, 1.6],
      [1.04, 5.51, 0.7],
    ],
    "#6cdbd4",
    0.012,
  );

  plane("pool reflected ripples", [0.9, 5.526, -0.95], [1.8, 1.8], rippleTexture, [0, 1, 0]);
  plane("stream eddies", [1.27, 5.53, 2.1], [0.95, 1.3], rippleTexture, [0, 1, 0]);

  for (let i = 0; i < 9; i++) {
    const a = -1.4 + i * 0.41;
    const x = 0.9 + Math.cos(a) * 1.65;
    const z = -0.93 + Math.sin(a) * 1.24;
    ico(`pool bank pebble ${i}`, [x, 5.52, z], [0.25, 0.13, 0.19], C.stoneShade);
  }

  // A UV-mapped, folded curtain rather than an opaque rectangular box.
  function waterfall() {
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const rows = [
      { y: 5.51, z: 3.72, half: 0.59, x: 1.42 },
      { y: 5.25, z: 4.05, half: 0.65, x: 1.42 },
      { y: 4.5, z: 4.16, half: 0.61, x: 1.44 },
      { y: 3.35, z: 4.25, half: 0.64, x: 1.49 },
      { y: 2.15, z: 4.4, half: 0.58, x: 1.58 },
      { y: 1.1, z: 4.54, half: 0.49, x: 1.7 },
      { y: 0.38, z: 4.69, half: 0.37, x: 1.82 },
    ];
    const cols = 8;
    rows.forEach((r, j) => {
      for (let i = 0; i <= cols; i++) {
        const u = i / cols;
        positions.push(
          r.x + (u * 2 - 1) * r.half,
          r.y + (j === rows.length - 1 ? Math.sin(i * 2.7) * 0.19 : 0),
          r.z + (i % 2 ? -0.025 : 0.045),
        );
        uvs.push(u, 1 - j / (rows.length - 1));
      }
    });
    for (let j = 0; j < rows.length - 1; j++) {
      for (let i = 0; i < cols; i++) {
        const a = j * (cols + 1) + i;
        const c = a + cols + 1;
        indices.push(a, c, a + 1, a + 1, c, c + 1);
        indices.push(a + 1, c, a, c + 1, c, a + 1);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    glow(
      b.part(geometry, "#ffffff", {
        at: [0, 0, 0],
        texture: waterfallTexture,
        bone: root,
        name: "folded waterfall curtain",
      }),
      0.28,
    );
  }
  waterfall();

  for (let i = 0; i < 5; i++) {
    const x = 0.88 + i * 0.26;
    b.sweep(
      catmull([
        [x, 5.55, 3.15],
        [x + 0.015, 5.54, 3.67],
        [x + 0.025, 5.3, 4.04],
        [x + 0.06, 4.92 - i * 0.08, 4.2],
      ]),
      [0.04, 0.025, 0.013],
      { color: C.white, sides: 5, bone: root, name: "whitewater crest" },
    );
  }
  for (let i = 0; i < 12; i++) {
    const y = 0.13 + random() * 1.3;
    const x = 1.2 + random() * 1.25;
    ico(
      "falling spray",
      [x, y, 4.6 + random() * 0.26],
      [0.025 + random() * 0.035, 0.08 + random() * 0.16, 0.035],
      i % 3 === 0 ? "#80e3dd" : C.white,
    );
  }

  // Hero ruin. A true open arch made of individually readable wedge stones.
  const archX = -1.7;
  const archZ = -1.6;
  const springY = 7.45;
  const outerR = 1.92;
  const innerR = 1.4;
  const feet = [archX - 1.66, archX + 1.66];

  for (const [side, x] of feet.entries()) {
    box(`arch footing ${side}`, [x, 5.53, archZ], [1.1, 0.22, 1.13], stonePaint);
    box(`arch plinth ${side}`, [x, 5.72, archZ], [0.87, 0.17, 0.92], C.ivory);
    box(`arch foot bevel ${side}`, [x, 5.85, archZ], [0.73, 0.12, 0.8], C.gold);
    for (let j = 0; j < 3; j++) {
      box(
        `pier ${side} course ${j}`,
        [x, 6.11 + j * 0.48, archZ],
        [0.64, 0.46, 0.69],
        stonePaint,
      );
    }
    box(`pier ${side} capital neck`, [x, 7.35, archZ], [0.73, 0.15, 0.8], C.ivory);
    box(`pier ${side} capital`, [x, 7.49, archZ], [0.94, 0.14, 0.94], stonePaint);

    // Vertical fluting and a gold-edged inset protect the main silhouette.
    for (const dx of [-0.23, 0.23]) {
      box("pier raised moulding", [x + dx, 6.57, archZ + 0.365], [0.045, 1.34, 0.045], C.cream);
    }
    box("pier rune backing", [x, 6.54, archZ + 0.36], [0.35, 0.96, 0.055], C.gold);
    glow(plane("pier carved aether script", [x, 6.54, archZ + 0.393], [0.3, 0.9], runeTexture), 0.22);
    plane("pier fracture", [x + 0.03, 7.07, archZ + 0.351], [0.54, 0.38], crackTexture);
  }

  function archWedge(name: string, a0: number, a1: number, r0: number, r1: number, z: number, depth: number, color: Color) {
    const point = (r: number, a: number) => [Math.cos(a) * r, Math.sin(a) * r];
    return b.extrude(
      [point(r0, a0), point(r1, a0), point(r1, a1), point(r0, a1)],
      {
        at: [archX, springY, z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: depth,
        color,
        bone: root,
        bevel: 0.018,
        name,
      },
    );
  }

  for (let i = 0; i < 11; i++) {
    const a0 = (i / 11) * Math.PI + 0.009;
    const a1 = ((i + 1) / 11) * Math.PI - 0.009;
    archWedge(`arch voussoir ${i}`, a0, a1, innerR, outerR, archZ, 0.73, stonePaint);
    archWedge(`outer arch gold fillet ${i}`, a0, a1, 1.83, 1.89, archZ + 0.382, 0.045, C.gold);
    archWedge(`inner arch light edge ${i}`, a0, a1, 1.4, 1.465, archZ + 0.38, 0.05, C.cream);
  }

  box("keystone proud face", [archX, 9.13, archZ + 0.42], [0.62, 0.75, 0.18], stonePaint);
  glow(
    plane("keystone wind-star medallion", [archX, 9.16, archZ + 0.517], [0.5, 0.5], medallionTexture),
    0.35,
  );
  box("keystone top lip", [archX, 9.52, archZ + 0.02], [0.81, 0.13, 0.91], C.cream);

  // Broken rear colonnade: empty gaps are as important as the remaining blocks.
  const wallZ = -2.85;
  for (let i = 0; i < 4; i++) {
    const x = -3.72 + i * 0.76;
    const count = i === 0 ? 3 : i === 1 ? 2 : 1;
    for (let j = 0; j < count; j++) {
      box(
        "rear wall ashlar",
        [x + (j % 2) * 0.09, 5.67 + j * 0.42, wallZ],
        [0.735, 0.4, 0.48],
        stonePaint,
        [0, 0, (random() - 0.5) * 2],
      );
    }
  }

  const brokenX = -4.08;
  const brokenZ = 0.42;
  box("broken column square foot", [brokenX, 5.53, brokenZ], [1.0, 0.24, 1.0], stonePaint);
  box("broken column base cap", [brokenX, 5.73, brokenZ], [0.78, 0.16, 0.78], C.cream);
  b.lathe(
    [
      [0, 0],
      [0.33, 0],
      [0.33, 0.12],
      [0.26, 0.19],
      [0.25, 1.15],
      [0.2, 1.25],
      [0, 1.2],
    ],
    { at: [brokenX, 5.8, brokenZ], segments: 8, color: stonePaint, bone: root, name: "snapped octagonal column" },
  );
  ico("jagged column break", [brokenX + 0.03, 7.01, brokenZ], [0.28, 0.18, 0.24], C.ivory);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    box(
      "column fallen fragment",
      [-3.6 + Math.sin(a) * 0.65, 5.51 + (i % 2) * 0.05, 1.18 + Math.cos(a) * 0.43],
      [0.32 + random() * 0.18, 0.19, 0.39],
      stonePaint,
      [0, i * 43, 4],
    );
  }

  // Low ruined balcony on the opposite bank.
  for (const x of [2.95, 4.12]) {
    box("balcony post footing", [x, 5.51, 0.35], [0.56, 0.18, 0.62], stonePaint);
    box("balcony post", [x, 5.98, 0.35], [0.33, 0.8, 0.36], stonePaint);
    box("balcony capital", [x, 6.4, 0.35], [0.49, 0.14, 0.51], C.cream);
  }
  box("remaining carved rail", [3.52, 6.17, 0.35], [1.1, 0.29, 0.23], stonePaint);
  plane("balcony diamond frieze", [3.52, 6.17, 0.472], [1.05, 0.22], friezeTexture);
  box("broken rail stump", [4.32, 6.18, 0.35], [0.22, 0.28, 0.23], stonePaint, [0, 0, -13]);

  // A softened path meanders from the arch to the waterfall overlook.
  const pathStones: [number, number, number, number][] = [
    [-1.67, -0.8, 0.86, 0.7],
    [-1.54, 0.04, 0.8, 0.66],
    [-1.83, 0.83, 0.89, 0.59],
    [-1.56, 1.55, 0.75, 0.59],
    [-1.05, 2.12, 0.72, 0.58],
    [-0.62, 2.76, 0.77, 0.62],
    [-0.22, 3.3, 0.7, 0.5],
  ];
  for (const [i, [x, z, w, d]] of pathStones.entries()) {
    box(`weathered path flag ${i}`, [x, 5.455, z], [w, 0.11, d], stonePaint, [0, i % 2 ? -9 : 7, 0]);
    if (i === 2 || i === 5)
      plane("flagstone hairline crack", [x, 5.515, z], [w * 0.8, d * 0.8], crackTexture, [0, 1, 0]);
  }
  for (let i = 0; i < 5; i++) {
    box(
      "arch approach step",
      [-1.7, 5.46 + i * 0.025, -0.83 - i * 0.23],
      [1.67, 0.12, 0.23],
      i % 2 ? C.ivory : stonePaint,
    );
  }

  // Wind-shaped trees: angular branching trunks with broad, tiered canopies.
  function tree(name: string, origin: P, scale: number, yaw: number) {
    const angle = (yaw * Math.PI) / 180;
    function p(x: number, y: number, z: number): P {
      return [
        origin[0] + (x * Math.cos(angle) + z * Math.sin(angle)) * scale,
        origin[1] + y * scale,
        origin[2] + (-x * Math.sin(angle) + z * Math.cos(angle)) * scale,
      ];
    }
    const trunk = [
      p(0, 0, 0),
      p(-0.14, 0.8, 0.02),
      p(0.05, 1.7, 0.02),
      p(0.42, 2.6, 0.03),
      p(0.78, 3.15, 0.03),
    ];
    b.sweep(trunk, [0.27 * scale, 0.23 * scale, 0.17 * scale, 0.1 * scale, 0.025], {
      color: woodPaint,
      section: { ngon: 6 },
      caps: "flat",
      bone: root,
      name: `${name} bent trunk`,
    });

    const branches = [
      [p(-0.02, 1.35, 0), p(-0.62, 2.08, -0.03), p(-1.18, 2.48, 0.03)],
      [p(0.12, 1.95, 0), p(0.88, 2.35, 0.35), p(1.55, 2.72, 0.42)],
      [p(0.33, 2.4, 0), p(0.04, 2.9, -0.65), p(-0.35, 3.2, -0.85)],
      [p(-0.08, 1.75, 0.02), p(-0.4, 2.38, 0.75), p(-0.62, 2.62, 1.05)],
    ];
    branches.forEach((branch, i) =>
      b.sweep(branch, [0.14 * scale, 0.08 * scale, 0.015], {
        color: woodPaint,
        section: { ngon: 5 },
        bone: root,
        name: `${name} bough ${i}`,
      }),
    );
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.sweep(
        [p(0, 0.3, 0), p(Math.sin(a) * 0.4, 0.07, Math.cos(a) * 0.4), p(Math.sin(a) * 0.8, 0.025, Math.cos(a) * 0.8)],
        [0.14 * scale, 0.08 * scale, 0.012],
        { color: woodPaint, section: { ngon: 5 }, bone: root, name: `${name} spreading root` },
      );
    }

    const clusters: [number, number, number, number, number, number][] = [
      [-1.13, 2.63, 0.02, 1.0, 0.46, 0.83],
      [-0.54, 2.93, -0.63, 1.05, 0.51, 0.86],
      [0.42, 3.27, -0.25, 1.14, 0.6, 0.95],
      [1.19, 2.92, 0.31, 1.12, 0.48, 0.8],
      [-0.54, 2.72, 0.89, 0.91, 0.43, 0.82],
      [0.35, 2.97, 0.78, 1.02, 0.43, 0.8],
      [0.83, 3.52, -0.17, 0.82, 0.36, 0.67],
    ];
    clusters.forEach(([x, y, z, sx, sy, sz], i) => {
      ico(`${name} canopy shadow ${i}`, p(x, y - 0.13, z), [sx * scale, sy * scale, sz * scale], C.leafDark, 0);
      ico(
        `${name} broad canopy ${i}`,
        p(x - 0.05, y + 0.12, z + 0.01),
        [sx * scale * 1.03, sy * scale, sz * scale],
        [C.leaf, C.leafLight, "#65bf91"][i % 3],
        1,
      );
    });

    // Small leaf plates break selected edges, never a furry cloud of tiny balls.
    for (let i = 0; i < 12; i++) {
      const c = clusters[i % clusters.length];
      const a = random() * Math.PI * 2;
      const at = p(c[0] + Math.cos(a) * c[3] * 0.7, c[1] + 0.25, c[2] + Math.sin(a) * c[5] * 0.8);
      b.extrude(
        [[-0.14, 0], [0, -0.08], [0.31, 0.02], [0.08, 0.13]],
        {
          at,
          x: [scale, 0.12, 0.18],
          y: [0, 0.18, -scale],
          thickness: 0.025,
          color: i % 3 ? C.leafLight : "#c3df9c",
          bone: root,
          name: `${name} canopy edge leaf`,
        },
      );
    }
  }

  tree("east windtree", [3.03, 5.43, -1.8], 1.32, -28);
  tree("western sapling", [-3.35, 5.43, 2.06], 0.63, 28);

  // Grass patches are rooted on the crown, kept out of the path and water.
  const grassFrames = [];
  const grassPositions: P[] = [];
  for (let i = 0; i < 110; i++) {
    const x = (random() - 0.5) * 9.5;
    const z = (random() - 0.5) * 7.3;
    if ((x / 4.8) ** 2 + (z / 3.85) ** 2 > 0.92) continue;
    if (x > -0.6 && x < 2.65 && z > -2.5) continue;
    if (x > -2.35 && x < -0.65 && z > -2.4 && z < 2.8) continue;
    if (z < -1.1 && x < 0.1) continue;
    const p: P = [x, 5.43, z];
    grassPositions.push(p);
    grassFrames.push(frame(p, [0, 1, 0]));
  }
  b.cards(grassFrames, grassTexture, {
    size: [0.38, 0.41],
    cross: true,
    vary: 0.35,
    rng: random,
    spin: 40,
    flow: [0, 0, 1],
    bone: root,
    name: "painted meadow grass",
  });

  // Broad moss shelves cap the cliff without obscuring the hanging rock shape.
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const x = Math.sin(a) * 4.63;
    const z = Math.cos(a) * 3.73;
    if (x > 0.4 && x < 2.5 && z > 2.8) continue;
    ico("mossy cliff overhang", [x, 5.23, z], [0.6, 0.17, 0.45], i % 3 ? C.grass : C.grassLight);
  }

  const vines: P[] = [
    [-4.1, 5.35, 1.8],
    [-3.6, 5.35, 2.8],
    [-2.7, 5.35, 3.35],
    [-0.9, 5.35, 3.95],
    [2.9, 5.35, 3.08],
    [4.1, 5.35, 1.85],
    [-3.42, 8.0, -1.17],
  ];
  vines.forEach((p, i) => {
    b.cards([frame(p, [0, 1, 0])], vineTexture, {
      size: [i === 6 ? 0.44 : 0.53, i === 6 ? 1.9 : 1.25 + (i % 3) * 0.28],
      lean: 180,
      bend: 8,
      flow: [0, 0, 1],
      bone: root,
      name: "hanging ivy",
    });
  });

  // Ivy follows one pier and winds over the old capital.
  b.sweep(
    catmull([
      [-3.62, 5.48, -1.13],
      [-3.73, 6.0, -1.12],
      [-3.53, 6.6, -1.09],
      [-3.69, 7.16, -1.08],
      [-3.55, 7.62, -1.08],
      [-3.18, 8.04, -1.11],
    ]),
    0.028,
    { color: C.leafDark, bone: root, sides: 5, name: "ivy climbing ancient pier" },
  );
  for (let i = 0; i < 10; i++) {
    const y = 5.7 + i * 0.22;
    const x = -3.62 + Math.sin(i * 1.6) * 0.1;
    const s = i % 2 ? 1 : -1;
    b.extrude(
      [[0, 0], [s * 0.18, 0.02], [s * 0.28, 0.18], [s * 0.09, 0.23]],
      {
        at: [x, y, -1.04],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.023,
        color: i % 3 ? C.leaf : C.leafLight,
        bone: root,
        name: "ivy heart leaf",
      },
    );
  }

  // Small flower groups are punctuation marks in the grass.
  const flowerSites: P[] = [
    [-2.65, 5.43, 2.9],
    [-2.4, 5.43, 2.74],
    [-2.8, 5.43, 3.05],
    [3.1, 5.43, 1.8],
    [3.38, 5.43, 1.64],
    [3.66, 5.43, 1.95],
    [-0.16, 5.43, 2.2],
    [-0.38, 5.43, 2.04],
    [3.75, 5.43, -0.75],
  ];
  flowerSites.forEach(([x, y, z], i) => {
    const h = 0.22 + random() * 0.16;
    rod("wildflower stem", [x, y, z], [x + 0.025, y + h, z], 0.013, C.leafDark);
    const center: P = [x + 0.025, y + h, z];
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      ico(
        "five pointed wildflower petal",
        [center[0] + Math.sin(a) * 0.064, center[1] + 0.01, center[2] + Math.cos(a) * 0.064],
        [0.055, 0.025, 0.055],
        i < 3 || i > 6 ? C.flower : C.flowerBlue,
      );
    }
    ico("wildflower golden heart", [center[0], center[1] + 0.027, center[2]], [0.028, 0.024, 0.028], C.goldLight);
  });

  // Fern-like plants use a few large, plainly shaped fronds.
  for (const [plantIndex, origin] of ([
    [3.5, 5.44, 2.55],
    [-4.18, 5.43, -0.85],
    [2.56, 5.44, -2.7],
  ] as P[]).entries()) {
    for (let j = 0; j < 5; j++) {
      const a = (j / 5) * Math.PI * 2;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      const tip: P = [origin[0] + dx * 0.52, origin[1] + 0.44, origin[2] + dz * 0.52];
      b.sweep(bezier(origin, [origin[0] + dx * 0.2, origin[1] + 0.53, origin[2] + dz * 0.2], tip), [0.021, 0.005], {
        color: C.leafDark,
        bone: root,
        sides: 5,
        name: "fern spine",
      });
      const side = new THREE.Vector3(dz, 0, -dx);
      slab(
        `broad fern frond ${plantIndex} ${j}`,
        [
          origin,
          [origin[0] + dx * 0.24 + side.x * 0.12, origin[1] + 0.33, origin[2] + dz * 0.24 + side.z * 0.12],
          tip,
          [origin[0] + dx * 0.24 - side.x * 0.12, origin[1] + 0.33, origin[2] + dz * 0.24 - side.z * 0.12],
        ],
        j % 2 ? C.leafLight : C.leaf,
        0.018,
      );
    }
  }

  // A handful of chips and ancient inlays settle the masonry into its meadow.
  for (const [x, z, yaw] of [
    [-2.9, 0.14, 18],
    [-2.8, -0.6, -12],
    [2.9, 0.8, 32],
    [3.9, 0.97, -18],
    [-0.45, -2.7, 28],
  ]) {
    box("buried ruin chip", [x, 5.46, z], [0.35, 0.11, 0.3], stonePaint, [0, yaw, 0]);
  }

  // Blue-white motifs repeat in the portal, balcony and water; the final
  // restrained glints make the island feel enchanted without hiding its forms.
  for (const p of [
    [-1.8, 5.65, 3.0],
    [2.7, 5.8, -0.3],
    [-2.7, 6.1, -1.02],
  ] as P[]) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.045), "#d5fff0", {
        at: p,
        scale: [0.55, 1.9, 0.55],
        bone: root,
        name: "quiet aether glint",
      }),
      0.8,
    );
  }

  return b.root;
}
```