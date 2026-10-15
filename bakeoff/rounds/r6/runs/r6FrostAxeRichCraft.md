```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  frame,
  rng,
  paint,
  mix,
  noise,
  cells,
  smoothstep,
  resolve,
  grain,
  stripes,
  svg,
} from "agentic-3js-builder";
import type { ColorInput, Rgb } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Frostforged Battle Axe",
  description:
    "A Freljord-style frost-forged battle axe: crescent steel blade with a glowing ice inlay and snowflake etching, bronze fittings, fur-wrapped haft, ice-crystal spikes, standing in a snowy rune-ringed stone plinth with crystal clusters.",
};

type Pt = [number, number] | [number, number, "sharp"];

// ---------------------------------------------------------------------------------------------------------
// Palette and paints

const ICE = ["#8fe6ff", "#5cc8ff", "#c9f4ff", "#3aa6f0"];
const ICE_EDGE = "#e2f9ff";
const CYAN = "#46c8ff";
const GILT = "#e8b94e";
const LEATHER = "#5b3a2a";
const SNOW_HI = "#f4faff";

/** Cool-underside, light-from-above lighting baked into any base colour or paint. */
const shade = (base: ColorInput) =>
  paint((p, n) => {
    const c = resolve(base, p, n);
    const t = smoothstep(-0.7, 0.9, n.y);
    return [
      Math.min(1, c[0] * (0.62 + 0.5 * t)),
      Math.min(1, c[1] * (0.7 + 0.42 * t)),
      Math.min(1, c[2] * (0.92 + 0.12 * t)),
    ] as Rgb;
  });

const snowOn = (p: THREE.Vector3, n: THREE.Vector3, thr: number, seed: number) =>
  smoothstep(thr, thr + 0.2, n.y + (noise(p, 0.05, seed) - 0.5) * 0.55);

const STONE = shade(
  paint((p, n) => {
    const c = cells(p, 0.13, 3);
    const seam = smoothstep(0.07, 0.0, c.d2 - c.d1);
    let col: Rgb = mix("#323a50", "#5a6684", noise(p, 0.09, 1));
    col = mix(col, "#161b2a", seam * 0.85);
    col = mix(col, "#7fa2c8", smoothstep(0.6, 0.8, noise(p, 0.05, 9)) * 0.35);
    return mix(col, SNOW_HI, snowOn(p, n, 0.45, 4));
  }),
);

const SNOW = shade(paint((p) => mix("#f6fbff", "#bcd6f0", noise(p, 0.06, 5))));

const BLADE = shade(
  paint((p, n, s) => {
    const x = s[0];
    const body: Rgb = mix("#233049", "#55699a", noise(p, 0.1, 2));
    const edgeAmt = smoothstep(0.2, 0.42, x);
    const c = cells(p, 0.07, 6);
    const vein = smoothstep(0.05, 0.0, c.d2 - c.d1);
    let col: Rgb = mix(body, mix("#8fd8ff", ICE_EDGE, noise(p, 0.05, 4)), edgeAmt * 0.92);
    col = mix(col, "#ffffff", vein * edgeAmt * 0.55);
    col = mix(col, SNOW_HI, snowOn(p, n, 0.55, 8) * 0.9);
    return col;
  }),
);

const HAFT = shade(grain("#25304c", "#46598a", { size: 0.012, axis: "y" }));
const WRAP = shade(stripes(LEATHER, "#2c1b15", { size: 0.022, axis: "y", width: 0.45, wobble: 0.15, seed: 3 }));
const BRONZE = shade(metal("bronze", { polish: 0.35, tarnish: 0.25 }));
const BLUED = shade(metal("blued"));
const STEEL = shade(metal("steel"));

// ---------------------------------------------------------------------------------------------------------
// Textures

const RUNE_GLYPHS = [
  "M48 7 V17 M48 9 L53 12 L48 15",
  "M48 7 V17 M48 10 L53 7.5 M48 14 L53 11.5",
  "M48 7 V17 M48 7 L53 10.5 L48 14 L53 17",
  "M47 7 L53 17 M53 7 L47 17",
  "M50 7 L54 12 L50 17 L46 12 Z",
  "M46 7 L50 12 L54 7 M50 12 V17",
];
const RUNES = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#7fe6ff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="50" cy="50" r="44.8" stroke-width="1.4"/>
      <circle cx="50" cy="50" r="32" stroke-width="1.4"/>
      ${Array.from(
        { length: 16 },
        (_, i) => `<g transform="rotate(${i * 22.5} 50 50)"><path d="${RUNE_GLYPHS[i % RUNE_GLYPHS.length]}"/></g>`,
      ).join("")}
    </g>
  </svg>`,
  { size: 512 },
);

const RUNE_STRIP = svg(
  `<svg viewBox="0 0 20 100" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#7fe6ff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 6 V30 M10 11 L17 18 L10 25"/>
      <path d="M10 40 V64 M10 45 L17 40 M10 55 L17 50"/>
      <path d="M4 72 L16 96 M16 72 L4 96"/>
    </g>
  </svg>`,
  { size: 256 },
);

const SNOWFLAKE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#0b2f66" stroke-width="4" stroke-linecap="round" fill="none">
      ${[0, 60, 120, 180, 240, 300]
        .map(
          (a) =>
            `<g transform="rotate(${a} 50 50)"><path d="M50 50 V8 M50 26 L40 16 M50 26 L60 16 M50 39 L43 32 M50 39 L57 32"/></g>`,
        )
        .join("")}
    </g>
    <circle cx="50" cy="50" r="6" fill="#effcff" stroke="#0b2f66" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="47" fill="#14233f" stroke="#e8b94e" stroke-width="6"/>
    <circle cx="50" cy="50" r="38" fill="none" stroke="#3a6aa8" stroke-width="2"/>
    <path d="M50 12 L66 50 L50 88 L34 50 Z" fill="#59d2ff" stroke="#e8fbff" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M50 12 L50 88 M18 50 H82" stroke="#e8fbff" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M26 30 L38 38 M74 30 L62 38 M26 70 L38 62 M74 70 L62 62" stroke="#9fe6ff" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const TUFT = svg(
  `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 80 C8 60 4 30 14 4 C18 28 22 50 20 80Z" fill="#e8f2ff" stroke="#9db8d6" stroke-width="1.6"/>
    <path d="M20 80 C30 58 38 34 30 8 C24 30 20 52 20 80Z" fill="#f8fcff" stroke="#a9c2dd" stroke-width="1.6"/>
    <path d="M20 80 C14 64 12 52 6 40 C14 46 18 60 20 80Z" fill="#c4d9ef"/>
    <path d="M20 80 C26 66 30 58 36 48 C28 52 22 62 20 80Z" fill="#d6e6f6"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "frost_axe" });
  const R = rng(11);

  // Skeleton: a simple prop rig (stand, haft, head).
  const HY = 1.12; // head centre height
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  const haft = b.joint("haft", { parent: root, at: [0, 0.11, 0], dir: [0, 1, 0] });
  const head = b.joint("head", { parent: haft, at: [0, HY, 0], dir: [0, 1, 0] });
  const H = (x: number, y: number, z = 0): [number, number, number] => [x, HY + y, z];

  // ---- helpers ------------------------------------------------------------------------------------------

  /** A faceted ice crystal: hex (or 4-sided kite) prism with a pointed tip, base at `at`, growing along `dir`. */
  const crystal = (
    at: [number, number, number] | THREE.Vector3,
    dir: [number, number, number],
    len: number,
    r: number,
    color: string,
    o: { sides?: number; kite?: boolean; strength?: number; bone?: THREE.Object3D | typeof root } = {},
  ) => {
    const pts = o.kite
      ? [
          [0, 0],
          [r * 0.55, len * 0.04],
          [r, len * 0.2],
          [0, len],
        ]
      : [
          [0, 0],
          [r, 0],
          [r, len * 0.62],
          [0, len],
        ];
    const geo = new THREE.LatheGeometry(
      pts.map(([x, y]) => new THREE.Vector2(x, y)),
      o.sides ?? 6,
    );
    const part = b.part(geo, color, { at, dir, flat: true, bone: (o.bone as typeof root) ?? root });
    glow(part, o.strength ?? 0.8);
    return part;
  };

  /** A bronze ring around the haft (or socket) at a height. */
  const band = (cy: number, r: number, h: number, bone: typeof root, color: ColorInput = BRONZE, at0 = 0) =>
    b.lathe(
      [
        [r - 0.016, -h],
        [r, -h * 0.7],
        [r + 0.003, 0],
        [r, h * 0.7],
        [r - 0.016, h],
      ],
      { at: [0, cy, at0], segments: 8, color, bone },
    );

  // ==========================================================================================================
  // BASE: snowy rune plinth, rocks and crystal clusters
  // ==========================================================================================================

  b.lathe(
    [
      [0, 0],
      [0.4, 0],
      [0.42, 0.03],
      [0.4, 0.07],
      [0.36, 0.11],
      [0, 0.11],
    ],
    { at: [0, 0, 0], segments: 8, color: STONE, bone: root, name: "plinth" },
  );
  b.lathe(
    [
      [0, 0.1],
      [0.235, 0.1],
      [0.225, 0.125],
      [0.17, 0.16],
      [0.08, 0.185],
      [0, 0.195],
    ],
    { at: [0, 0, 0], segments: 10, smoothing: 1, color: SNOW, bone: root, name: "snowMound" },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.76, 0.76), "#ffffff", {
      bone: root,
      at: [0, 0.113, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: RUNES,
      name: "runeRing",
    }),
    1.1,
  );

  // Bronze studs and snow dollops around the plinth rim
  for (let i = 0; i < 8; i++) {
    const a = (i * 45 + 22.5) * (Math.PI / 180);
    b.part(new THREE.SphereGeometry(0.017, 6, 4), BRONZE, {
      bone: root,
      at: [Math.sin(a) * 0.405, 0.045, Math.cos(a) * 0.405],
    });
  }
  for (let i = 0; i < 6; i++) {
    const a = (i * 60 + 12 + R() * 20) * (Math.PI / 180);
    b.part(new THREE.SphereGeometry(0.035, 7, 5), SNOW, {
      bone: root,
      at: [Math.sin(a) * 0.385, 0.075, Math.cos(a) * 0.385],
      scale: [1, 0.5, 1],
    });
  }

  // Rocks
  [
    [5, 0.54, 0.075],
    [95, 0.56, 0.06],
    [190, 0.6, 0.09],
    [280, 0.55, 0.07],
    [355, 0.6, 0.05],
  ].forEach(([deg, rad, size], i) => {
    const a = deg * (Math.PI / 180);
    b.part(new THREE.IcosahedronGeometry(size, 0), STONE, {
      bone: root,
      at: [Math.sin(a) * rad, size * 0.58, Math.cos(a) * rad],
      scale: [1, 0.7, 0.9],
      rotation: [0, i * 47, 0],
      flat: true,
    });
  });

  // Crystal clusters on the floor
  const cluster = (deg: number, rad: number, k: number) => {
    const a = deg * (Math.PI / 180);
    const cx = Math.sin(a) * rad;
    const cz = Math.cos(a) * rad;
    const tilt = 0.2;
    crystal(
      [cx, 0.005, cz],
      [Math.sin(a) * tilt, 1, Math.cos(a) * tilt],
      0.3 * k,
      0.05 * k,
      ICE[Math.floor(deg) % 4],
      { strength: 0.7 },
    );
    for (let i = 0; i < 4; i++) {
      const phi = (i * 90 + R() * 40) * (Math.PI / 180);
      const off = (0.05 + R() * 0.04) * k;
      const t = 0.45 + R() * 0.4;
      crystal(
        [cx + Math.cos(phi) * off, 0.005, cz + Math.sin(phi) * off],
        [Math.cos(phi) * Math.sin(t), Math.cos(t), Math.sin(phi) * Math.sin(t)],
        (0.12 + R() * 0.12) * k,
        (0.024 + R() * 0.012) * k,
        ICE[(i + 1 + Math.floor(deg)) % 4],
        { strength: 0.7 },
      );
    }
  };
  cluster(40, 0.5, 0.95);
  cluster(150, 0.54, 1.45);
  cluster(235, 0.5, 1.15);
  cluster(320, 0.5, 0.8);

  // ==========================================================================================================
  // HAFT
  // ==========================================================================================================

  b.sweep(
    [
      [0, 0.12, 0],
      [0, 1.4, 0],
    ],
    0.03,
    { bone: haft, color: HAFT, caps: "flat", sides: 8, smooth: false, name: "haftCore" },
  );
  b.rod([0, 0.27, 0], [0, 0.6, 0], 0.037, { color: WRAP, bone: haft, sides: 8, smooth: false, name: "grip" });
  for (const y of [0.25, 0.265, 0.605, 0.62, 0.66, 0.84]) band(y, 0.042, 0.009, haft);
  // gilt studs on the grip
  for (let i = 0; i < 8; i++) {
    const a = i * 45 * (Math.PI / 180);
    b.part(new THREE.SphereGeometry(0.007, 5, 4), GILT, {
      bone: haft,
      at: [Math.sin(a) * 0.04, 0.43, Math.cos(a) * 0.04],
    });
  }
  // glowing rune strips front and back
  for (const sgn of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.034, 0.17), "#ffffff", {
        bone: haft,
        at: [0, 0.75, sgn * 0.0315],
        dir: [0, 0, sgn],
        axis: "z",
        texture: RUNE_STRIP,
      }),
      1.1,
    );
  }

  // Fur collar under the socket
  const fur1 = b.ring(frame([0, 0.88, 0], [0, 1, 0]), { count: 12, radius: 0.04 });
  b.cards(fur1.items, TUFT, {
    size: [0.055, 0.11],
    lean: 55,
    flow: [0, -1, 0],
    bend: 20,
    vary: 0.25,
    spin: 15,
    rng: rng(5),
    cross: true,
    bone: haft,
  });
  const fur2 = b.ring(frame([0, 0.845, 0], [0, 1, 0]), { count: 9, radius: 0.042 });
  b.cards(fur2.items, TUFT, {
    size: [0.05, 0.1],
    lean: 62,
    flow: [0, -1, 0],
    bend: 24,
    vary: 0.3,
    spin: 20,
    rng: rng(6),
    bone: haft,
  });

  // Hanging cord with beads and an ice charm
  const cordPts: [number, number, number][] = [
    [-0.06, 0.9, 0.03],
    [-0.085, 0.84, 0.04],
    [-0.08, 0.76, 0.035],
    [-0.075, 0.7, 0.03],
  ];
  b.sweep(catmull(cordPts), 0.0045, { color: LEATHER, bone: haft, sides: 5 });
  [0.82, 0.77].forEach((y, i) => {
    b.part(new THREE.SphereGeometry(0.012, 6, 4), i ? GILT : "#efe7d4", {
      bone: haft,
      at: [-0.083, y, 0.038],
    });
  });
  crystal([-0.075, 0.7, 0.03], [0, -1, 0], 0.09, 0.02, ICE[2], { bone: haft, strength: 0.9 });

  // Top cap and crystal spear
  b.lathe(
    [
      [0.03, 0],
      [0.055, 0.012],
      [0.063, 0.04],
      [0.046, 0.08],
      [0.03, 0.09],
    ],
    { at: [0, 1.37, 0], segments: 8, color: BRONZE, bone: haft, name: "topCap" },
  );
  crystal([0, 1.44, 0], [0, 1, 0], 0.28, 0.05, ICE[2], { sides: 4, kite: true, bone: haft, strength: 0.9 });

  // ==========================================================================================================
  // HEAD
  // ==========================================================================================================

  // Socket collar
  b.lathe(
    [
      [0.03, -0.26],
      [0.062, -0.26],
      [0.068, -0.22],
      [0.052, -0.19],
      [0.052, 0.19],
      [0.068, 0.22],
      [0.062, 0.26],
      [0.03, 0.26],
    ],
    { at: H(0, 0), segments: 8, color: BLUED, bone: head, name: "socket" },
  );
  for (const y of [-0.12, 0.12]) band(HY + y, 0.056, 0.012, head, BRONZE);

  // Emblem bosses front and back
  for (const sgn of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.016, 12), BRONZE, {
      bone: head,
      at: H(0, 0, sgn * 0.052),
      dir: [0, 0, sgn],
    });
    glow(
      b.part(new THREE.CircleGeometry(0.034, 14), "#ffffff", {
        bone: head,
        at: H(0, 0, sgn * 0.0612),
        dir: [0, 0, sgn],
        axis: "z",
        texture: EMBLEM,
      }),
      0.7,
    );
  }

  // Main blade
  const bladeOutline: Pt[] = [
    [0.03, 0.16],
    [0.18, 0.26],
    [0.3, 0.34, "sharp"],
    [0.4, 0.21],
    [0.445, 0.0],
    [0.4, -0.21],
    [0.32, -0.38, "sharp"],
    [0.2, -0.28],
    [0.03, -0.16],
  ];
  b.extrude(bladeOutline, {
    at: H(0, 0),
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.032,
    bevel: 0.01,
    smoothing: 1,
    color: BLADE,
    bone: head,
    name: "blade",
  });

  // Glowing edge rim
  glow(
    b.sweep(
      catmull([H(0.295, 0.33), H(0.395, 0.21), H(0.44, 0), H(0.395, -0.21), H(0.315, -0.37)]),
      0.013,
      { color: ICE_EDGE, bone: head, caps: "point", sides: 6, name: "edgeRim" },
    ),
    0.7,
  );

  // Root plate (bronze) both faces thicker
  b.extrude(
    [
      [0.0, 0.19],
      [0.1, 0.24],
      [0.15, 0.1],
      [0.15, -0.1],
      [0.1, -0.24],
      [0.0, -0.19],
    ] as Pt[],
    {
      at: H(0, 0),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.048,
      bevel: 0.008,
      smoothing: 1,
      color: BRONZE,
      bone: head,
      name: "rootPlate",
    },
  );
  for (const sgn of [1, -1]) {
    for (const [x, y] of [
      [0.085, 0.13],
      [0.115, 0],
      [0.085, -0.13],
    ]) {
      b.part(new THREE.SphereGeometry(0.011, 6, 4), GILT, { bone: head, at: H(x, y, sgn * 0.025) });
    }
  }

  // Glowing ice inlay
  const inlay: [number, number][] = [
    [0.17, 0.0],
    [0.22, 0.14],
    [0.31, 0.2],
    [0.37, 0.1],
    [0.39, 0.0],
    [0.37, -0.1],
    [0.31, -0.2],
    [0.22, -0.14],
  ];
  glow(
    b.extrude(inlay as Pt[], {
      at: H(0, 0),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.05,
      bevel: 0.006,
      smoothing: 1,
      color: CYAN,
      bone: head,
      name: "inlay",
    }),
    1.2,
  );
  for (const sgn of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.19, 0.19), "#ffffff", {
      bone: head,
      at: H(0.28, 0, sgn * 0.0262),
      dir: [0, 0, sgn],
      axis: "z",
      texture: SNOWFLAKE,
    });
    // gilt studs around the inlay
    for (const [x, y] of inlay) {
      b.part(new THREE.SphereGeometry(0.01, 6, 4), GILT, {
        bone: head,
        at: H(0.28 + (x - 0.28) * 1.14, y * 1.22, sgn * 0.018),
      });
    }
    // glowing studs along the cutting edge
    for (let i = 0; i < 7; i++) {
      const t = (i + 0.5) / 7;
      const ang = (t - 0.5) * 2.1;
      b.part(new THREE.OctahedronGeometry(0.009), ICE_EDGE, {
        bone: head,
        at: H(0.36 + 0.07 * Math.cos(ang) - 0.0, 0.33 * Math.sin(ang) * 1.05, sgn * 0.0185),
      });
    }
  }

  // Frost crystals on top edge
  const topEdge = polyline([H(0.04, 0.17), H(0.18, 0.255), H(0.3, 0.335)]);
  [0.12, 0.35, 0.58, 0.8].forEach((t, i) => {
    const p = topEdge.at(t);
    crystal(p, [0.15, 1, 0], 0.06 + (i % 2) * 0.04, 0.014 + (i % 2) * 0.004, ICE[i % 4], {
      bone: head,
      strength: 0.8,
    });
  });
  // Horn crystals
  crystal(H(0.29, 0.32), [0.35, 1, 0], 0.27, 0.034, ICE[1], { bone: head, strength: 0.9 });
  crystal(H(0.31, -0.36), [0.35, -1, 0], 0.22, 0.03, ICE[0], { bone: head, strength: 0.9 });
  crystal(H(0.27, 0.3), [0.9, 1, 0.3], 0.1, 0.018, ICE[2], { bone: head });
  crystal(H(0.27, 0.3), [0.9, 1, -0.3], 0.1, 0.018, ICE[3], { bone: head });

  // Rear fluke
  b.extrude(
    [
      [-0.03, 0.12],
      [-0.12, 0.19],
      [-0.26, 0.22],
      [-0.4, 0.12, "sharp"],
      [-0.26, 0.04],
      [-0.14, -0.01],
      [-0.03, -0.07],
    ] as Pt[],
    {
      at: H(0, 0),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.03,
      bevel: 0.009,
      smoothing: 1,
      color: BLADE,
      bone: head,
      name: "fluke",
    },
  );
  b.extrude(
    [
      [0, 0.13],
      [-0.09, 0.15],
      [-0.13, 0.04],
      [-0.09, -0.05],
      [0, -0.07],
    ] as Pt[],
    {
      at: H(0, 0),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.046,
      bevel: 0.008,
      smoothing: 1,
      color: BRONZE,
      bone: head,
      name: "flukePlate",
    },
  );
  crystal(H(-0.39, 0.12), [-1, 0.25, 0], 0.27, 0.04, ICE[1], { bone: head, strength: 0.9 });
  crystal(H(-0.22, 0.21), [-0.3, 1, 0], 0.17, 0.028, ICE[0], { bone: head });
  crystal(H(-0.3, 0.17), [-0.65, 1, 0], 0.12, 0.022, ICE[2], { bone: head });
  crystal(H(-0.2, 0.0), [-0.1, -1, 0], 0.12, 0.025, ICE[3], { bone: head });
  crystal(H(-0.12, -0.04), [0.05, -1, 0], 0.08, 0.018, ICE[2], { bone: head });
  crystal(H(-0.33, 0.1), [-0.5, -0.9, 0.1], 0.09, 0.018, ICE[0], { bone: head });

  // Frost motes drifting around the head
  for (let i = 0; i < 10; i++) {
    const x = -0.5 + R() * 1.1;
    const y = 0.85 + R() * 0.85;
    const z = (R() - 0.5) * 0.36;
    glow(
      b.part(new THREE.OctahedronGeometry(0.008 + R() * 0.007), ICE_EDGE, {
        bone: head,
        at: [x, y, z],
        flat: true,
        rotation: [R() * 90, R() * 90, 0],
      }),
      1,
    );
  }

  // Steel-tipped fittings on the haft below the socket (a pair of langets)
  for (const sgn of [1, -1]) {
    b.rod([0, HY - 0.26, sgn * 0.036], [0, HY - 0.52, sgn * 0.036], [0.012, 0.007], {
      color: STEEL,
      bone: head,
      sides: 6,
    });
  }

  return b.root;
}
```