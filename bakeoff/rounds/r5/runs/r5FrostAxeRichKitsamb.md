```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  frame,
  polyline,
  spiral,
  paint,
  noise,
  mix,
  smoothstep,
  mottle,
  patches,
  grain,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "A towering frost-forged bearded battle axe in a stylized, hand-painted fantasy-MOBA look: blued steel with an icy edge, glowing rune inlay, fur-wrapped haft, hanging war banner, and a snowy rune plinth ringed with glowing ice crystals.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const GOLD = "#e0b050";
const LEATHER = "#5b3a2c";
const ICE_A = "#8eeaff";
const ICE_B = "#c8f6ff";
const ICE_C = "#4fb4ec";
const ICE_D = "#2f86d6";
const INLAY = "#52c4f2";
const WHITE = "#ffffff";
const SNOW_C = "#f4fbff";

// ---------------------------------------------------------------------------------------------------------------
// Paints

const BLADE = paint((p, _n, s) => {
  const r = Math.hypot(s[0], s[1]);
  const streak = noise(p, 0.03, 2);
  const body = mix(mix("#24315a", "#4f6fae", streak), "#9fd6f2", smoothstep(0.24, 0.4, r));
  const edge = mix(body, "#f2feff", smoothstep(0.4, 0.47, r));
  const crack = smoothstep(0.025, 0.0, Math.abs(noise(p, 0.09, 4) - 0.5)) * smoothstep(0.15, 0.3, r);
  return mix(edge, "#e6fbff", crack * 0.85);
});

const BLUED = paint((p, n) => {
  const base = mix(mix("#222f58", "#4b69a8", noise(p, 0.04, 5)), "#a8dcf4", smoothstep(0.3, 0.95, n.y) * 0.6);
  return base;
});

const GOLD_P = paint((p) => mix("#b5822e", "#f2cf78", noise(p, 0.03, 8)));

const WOOD = grain("#4b3b66", "#2a2140", { size: 0.012, axis: "y", seed: 4 });
const FUR_CORE = mottle("#dfeaf5", "#8ea7c4", { size: 0.03, seed: 6 });
const SNOW = mottle(SNOW_C, "#bfe0f2", { size: 0.15, seed: 3 });
const STONE_BASE = patches("#242a3c", ["#36405a", "#434e6c", "#2e364e"], { size: 0.16, gap: 0.07, seed: 2 });
const STONE = paint((p, n) => (n.y > 0.75 && noise(p, 0.12, 7) > 0.3 ? SNOW : STONE_BASE));

// ---------------------------------------------------------------------------------------------------------------
// Textures

const RUNES = svg(
  `<svg viewBox="0 0 60 90">
  <g stroke="#f4ffff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M30 34 V56 M20.5 39.5 L39.5 50.5 M20.5 50.5 L39.5 39.5"/>
    <path d="M30 12 V32 M30 17 L38 12 M30 24 L38 19"/>
    <path d="M30 58 V80 M22 63 L30 70 L38 63"/>
  </g></svg>`,
  { size: 256 },
);

const SNOWFLAKE = svg(
  `<svg viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#12306a" stroke="#e0b050" stroke-width="3"/>
  <g stroke="#e8fcff" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M32 11 V53 M13.8 21.5 L50.2 42.5 M13.8 42.5 L50.2 21.5"/>
    <path d="M26 16 L32 22 L38 16 M26 48 L32 42 L38 48"/>
  </g></svg>`,
  { size: 128 },
);

const FUR = svg(
  `<svg viewBox="0 0 32 64">
  <path d="M16 0 L21 18 L27 30 L30 64 L2 64 L5 32 L11 18Z" fill="#e9f3fb"/>
  <path d="M16 8 L18 30 L22 64 M10 64 L12 38 L16 22" stroke="#9db7d3" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

const STAR = svg(
  `<svg viewBox="0 0 40 40">
  <path d="M20 0 L24 16 L40 20 L24 24 L20 40 L16 24 L0 20 L16 16Z" fill="#dffaff"/>
  <circle cx="20" cy="20" r="4" fill="#ffffff"/></svg>`,
  { size: 64 },
);

let ringRunes = "";
for (let i = 0; i < 12; i++)
  ringRunes += `<g transform="rotate(${i * 30} 60 60)"><path d="M60 13 V24 M56 17 L60 21 L64 17"/></g>`;
const GROUND = svg(
  `<svg viewBox="0 0 120 120"><g fill="none" stroke="#8aeaff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="60" cy="60" r="57"/><circle cx="60" cy="60" r="49"/><circle cx="60" cy="60" r="31"/>
  ${ringRunes}
  <path d="M60 31 L85.1 74.5 L34.9 74.5Z"/><path d="M60 89 L34.9 45.5 L85.1 45.5Z"/>
  </g></svg>`,
  { size: 512 },
);

const plate = (glyph: string) =>
  svg(
    `<svg viewBox="0 0 40 40">
    <rect x="2" y="2" width="36" height="36" rx="5" fill="#0c1c3a" stroke="#7ee8ff" stroke-width="2"/>
    <path d="${glyph}" stroke="#bff6ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`,
    { size: 128 },
  );
const PLATES = [
  plate("M14 8 V32 M14 14 L28 8 M14 22 L28 16"),
  plate("M12 32 V8 L20 18 L28 8 V32"),
  plate("M20 6 V34 M12 14 L20 22 L28 14"),
];

const TASSEL = svg(
  `<svg viewBox="0 0 40 120">
  <path d="M0 0 L20 22 L40 0 L40 120 L0 120Z" fill="#2a58a8" stroke="#e0b050" stroke-width="2.5" stroke-linejoin="round"/>
  <g stroke="#f2feff" stroke-width="5" fill="none" stroke-linejoin="miter">
    <path d="M2 42 L20 60 L38 42"/><path d="M2 66 L20 84 L38 66"/>
  </g>
  <circle cx="20" cy="104" r="5" fill="#e0b050"/></svg>`,
  { size: 128 },
);

const SHARD = svg(
  `<svg viewBox="0 0 32 64">
  <path d="M16 0 L26 40 L22 64 L10 64 L6 38Z" fill="#8eeaff"/>
  <path d="M16 0 L16 64 L22 64 L26 40Z" fill="#c8f6ff"/>
  <path d="M16 0 L6 38 L10 64 L16 64Z" fill="#4fb4ec"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "frost_axe" });
  const R = rng(11);

  const BL_Y = 1.34; // blade centre height
  const root = b.joint("root", { at: [0, 0, 0] });
  const head = b.joint("head", { parent: root, at: [0, BL_Y, 0], dir: [0, 1, 0] });

  // A hexagonal crystal that grows along `dir` from `at`.
  const iceColors = [ICE_A, ICE_B, ICE_C];
  function crystal(
    at: number[],
    dir: number[],
    r: number,
    h: number,
    color: string,
    str = 0.55,
    bone: typeof root = root,
  ) {
    const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
    const base = new THREE.Vector3(at[0], at[1], at[2]).addScaledVector(d, -h * 0.12);
    const part = b.lathe(
      [
        [0, 0],
        [r * 0.75, 0],
        [r, h * 0.12],
        [r, h * 0.68],
        [0, h],
      ],
      { at: base, axis: d, segments: 6, spin: Math.round(R() * 60), color, bone },
    );
    return glow(part, str);
  }

  // ---------------------------------------------------------------- Staged base
  const plinth = b.lathe(
    [
      [0, 0],
      [0.54, 0],
      [0.53, 0.09],
      [0.49, 0.115],
      [0.44, 0.125],
      [0, 0.125],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: STONE, bone: root, name: "plinth" },
  );
  b.lathe(
    [
      [0, 0.115],
      [0.43, 0.115],
      [0.43, 0.13],
      [0.37, 0.16],
      [0.27, 0.178],
      [0, 0.185],
    ],
    { at: [0, 0, 0], segments: 12, color: SNOW, bone: root, name: "snowCap" },
  );

  // glowing rune plates round the plinth
  const plinthSurf = b.surface(plinth);
  for (let i = 0; i < 8; i++) {
    const hit = plinthSurf.around([0, 0.05, 0]).at(i * 45, 0);
    if (!hit) continue;
    glow(b.decal(plinth, PLATES[i % 3], { at: hit, size: [0.075, 0.075], bone: root }), 0.7);
  }

  // summoning circle on the snow
  glow(
    b.part(new THREE.PlaneGeometry(0.5, 0.5), WHITE, {
      bone: root,
      at: [0, 0.187, 0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: GROUND,
      name: "summonCircle",
    }),
    0.9,
  );

  // snow drifts
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.5;
    const s = 0.06 + R() * 0.03;
    b.part(new THREE.IcosahedronGeometry(s, 0), SNOW, {
      bone: root,
      at: [Math.sin(a) * 0.4, 0.13, Math.cos(a) * 0.4],
      scale: [1.2, 0.45, 1.1],
      rotation: [0, R() * 360, 0],
      flat: true,
    });
  }

  // boulders around the plinth, snow capped
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const rr = 0.6 + R() * 0.08;
    const s = 0.06 + R() * 0.06;
    const pos = [Math.sin(a) * rr, s * 0.55, Math.cos(a) * rr];
    const rot: [number, number, number] = [R() * 40, R() * 360, R() * 40];
    b.part(new THREE.IcosahedronGeometry(s, 0), STONE, {
      bone: root,
      at: pos,
      scale: [1, 0.7, 1.1],
      rotation: rot,
      flat: true,
    });
    b.part(new THREE.IcosahedronGeometry(s * 0.7, 0), SNOW, {
      bone: root,
      at: [pos[0], pos[1] + s * 0.38, pos[2]],
      scale: [1, 0.4, 1.05],
      rotation: rot,
      flat: true,
    });
  }

  // crystal ring on the snow
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    const rr = 0.33 + (i % 2) * 0.04;
    crystal(
      [Math.sin(a) * rr, 0.155, Math.cos(a) * rr],
      [Math.sin(a) * 0.5, 1, Math.cos(a) * 0.5],
      0.022 + R() * 0.02,
      0.14 + R() * 0.18,
      iceColors[i % 3],
      0.5 + R() * 0.2,
    );
  }
  // outer crystals on the plinth rim
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.9;
    crystal(
      [Math.sin(a) * 0.49, 0.115, Math.cos(a) * 0.49],
      [Math.sin(a) * 0.9, 1, Math.cos(a) * 0.9],
      0.025 + R() * 0.015,
      0.1 + R() * 0.12,
      iceColors[(i + 1) % 3],
      0.5,
    );
  }

  // ice shards (cards) on the snow
  const shardFrames = [];
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.28 + R() * 0.12;
    shardFrames.push(frame([Math.sin(a) * rr, rr < 0.3 ? 0.17 : 0.15, Math.cos(a) * rr], [0, 1, 0]));
  }
  glow(b.cards(shardFrames, SHARD, { size: [0.05, 0.12], cross: true, vary: 0.4, spin: 180, rng: rng(21) }), 0.4);

  // ---------------------------------------------------------------- Haft
  b.sweep(
    polyline([
      [0, 0.14, 0],
      [0, 1.56, 0],
    ]),
    (t) => 0.026 + 0.003 * Math.sin(t * Math.PI),
    { color: WOOD, bone: root, sides: 8, name: "haft" },
  );

  // leather grip wrap
  b.sweep(spiral([0, 0.53, 0], [0.035, 0.53, 0], [0, 1, 0], { turns: 8, r1: 0.035, pitch: 0.055 }), 0.011, {
    color: LEATHER,
    bone: root,
    sides: 6,
    name: "gripWrap",
  });

  // gold bands
  for (const y of [0.2, 0.5, 1.0]) {
    b.lathe(
      [
        [0.026, 0],
        [0.04, 0],
        [0.04, 0.028],
        [0.026, 0.028],
      ],
      { at: [0, y - 0.014, 0], segments: 8, color: GOLD_P, bone: root },
    );
  }

  // fur wrap under the head
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.058, 0.02],
      [0.062, 0.07],
      [0.056, 0.125],
      [0.05, 0.133],
      [0, 0.133],
    ],
    { at: [0, 1.04, 0], segments: 8, color: FUR_CORE, bone: root, name: "furCore" },
  );
  const furA = b.ring(frame([0, 1.11, 0], [0, 1, 0]), { count: 14, radius: 0.05, tilt: -35 });
  const furB = b.ring(frame([0, 1.15, 0], [0, 1, 0]), { count: 11, radius: 0.05, tilt: -20 });
  for (const ringItems of [furA.items, furB.items])
    b.cards(ringItems, FUR, {
      size: [0.06, 0.11],
      lean: 35,
      flow: [0, -1, 0],
      bend: 25,
      vary: 0.25,
      cross: true,
      rng: rng(5),
    });

  // hanging war banner
  b.cards(
    [
      frame([0.045, 1.12, 0.05], [0, 1, 0]),
      frame([-0.05, 1.1, -0.04], [0, 1, 0]),
      frame([0.0, 1.12, -0.065], [0, 1, 0]),
    ],
    TASSEL,
    { size: [0.07, 0.3], lean: 180, flow: [0, 0, 1], sink: 0 },
  );

  // ---------------------------------------------------------------- Socket and spear point
  const socket = b.lathe(
    [
      [0, 0],
      [0.052, 0],
      [0.052, 0.02],
      [0.044, 0.03],
      [0.044, 0.31],
      [0.052, 0.32],
      [0.052, 0.35],
      [0, 0.35],
    ],
    { at: [0, 1.18, 0], segments: 8, color: BLUED, bone: head, name: "socket" },
  );
  for (const y of [1.175, 1.515]) {
    b.lathe(
      [
        [0.044, 0],
        [0.064, 0],
        [0.064, 0.02],
        [0.044, 0.02],
      ],
      { at: [0, y, 0], segments: 8, color: GOLD_P, bone: head },
    );
  }
  b.lathe(
    [
      [0, 0],
      [0.052, 0],
      [0.052, 0.03],
      [0.035, 0.05],
      [0.03, 0.1],
      [0, 0.34],
    ],
    { at: [0, 1.53, 0], segments: 4, spin: 45, color: BLUED, bone: head, name: "spear" },
  );
  // snowflake emblems on the socket
  for (const z of [1, -1])
    glow(
      b.decal(socket, SNOWFLAKE, { at: [0, 1.3, z * 0.05], dir: [0, 0, z], size: [0.05, 0.05], bone: head }),
      0.6,
    );

  // ---------------------------------------------------------------- Blade
  const AT_HEAD: [number, number, number] = [0, BL_Y, 0];
  b.extrude(
    [
      [0.03, 0.16],
      [0.1, 0.2],
      [0.16, 0.3],
      [0.24, 0.44, "sharp"],
      [0.34, 0.3],
      [0.42, 0.14],
      [0.46, 0.0],
      [0.42, -0.14],
      [0.35, -0.3],
      [0.28, -0.42, "sharp"],
      [0.19, -0.28],
      [0.1, -0.2],
      [0.03, -0.16],
    ],
    {
      at: AT_HEAD,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.028,
      bevel: 0.007,
      smoothing: 1,
      color: BLADE,
      bone: head,
      name: "blade",
    },
  );

  // back fluke
  b.extrude(
    [
      [0.03, 0.09],
      [0.14, 0.095],
      [0.24, 0.14, "sharp"],
      [0.2, 0.06],
      [0.36, 0.0, "sharp"],
      [0.18, -0.07],
      [0.12, -0.095],
      [0.03, -0.09],
    ],
    {
      at: AT_HEAD,
      x: [-1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.006,
      color: BLADE,
      bone: head,
      name: "fluke",
    },
  );

  // glowing inlay + runes
  glow(
    b.extrude(
      [
        [0.1, 0],
        [0.16, 0.1],
        [0.27, 0.17, "sharp"],
        [0.33, 0, "sharp"],
        [0.27, -0.17, "sharp"],
        [0.16, -0.1],
      ],
      { at: AT_HEAD, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.034, color: INLAY, bone: head, name: "inlay" },
    ),
    0.45,
  );
  for (const z of [1, -1])
    glow(
      b.part(new THREE.PlaneGeometry(0.2, 0.3), WHITE, {
        bone: head,
        at: [0.21, BL_Y, z * 0.0185],
        dir: [0, 0, z],
        axis: "z",
        texture: RUNES,
        name: z > 0 ? "runesFront" : "runesBack",
      }),
      1,
    );

  // gold studs on the blade shoulders
  for (const z of [1, -1])
    for (const y of [-0.11, -0.05, 0.05, 0.11])
      b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, {
        bone: head,
        at: [0.065, BL_Y + y, z * 0.013],
      });

  // frost growing on the blade
  for (const z of [1, -1]) {
    crystal([0.15, BL_Y - 0.23, z * 0.012], [0.4, -0.3, z * 0.9], 0.012, 0.06, ICE_B, 0.6, head);
    crystal([0.2, BL_Y + 0.26, z * 0.012], [0.3, 0.5, z], 0.012, 0.055, ICE_A, 0.6, head);
    crystal([0.12, BL_Y + 0.18, z * 0.012], [0.1, 0.6, z], 0.009, 0.04, ICE_C, 0.6, head);
  }
  // icicle under the lower horn, crystal on the upper horn
  crystal([0.28, BL_Y - 0.4, 0], [0.1, -1, 0], 0.016, 0.1, ICE_A, 0.6, head);
  crystal([0.245, BL_Y + 0.42, 0], [0.2, 1, 0], 0.016, 0.09, ICE_B, 0.6, head);

  // crystal cluster crowning the poll
  crystal([-0.04, 1.5, 0], [-0.7, 1, 0.1], 0.026, 0.2, ICE_A, 0.6, head);
  crystal([-0.02, 1.5, 0.03], [-0.2, 1, 0.5], 0.02, 0.15, ICE_B, 0.6, head);
  crystal([-0.03, 1.5, -0.03], [-0.3, 1, -0.5], 0.02, 0.14, ICE_C, 0.6, head);
  crystal([-0.1, 1.5, 0], [-1, 0.6, 0], 0.018, 0.12, ICE_D, 0.6, head);
  // crystals on the fluke
  crystal([-0.14, BL_Y + 0.09, 0], [-0.2, 1, 0], 0.018, 0.09, ICE_A, 0.6, head);
  crystal([-0.17, BL_Y - 0.06, 0], [-0.3, -1, 0], 0.014, 0.07, ICE_B, 0.6, head);

  // ---------------------------------------------------------------- Floating frost motes
  const moteFrames = [];
  for (let i = 0; i < 18; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.25 + R() * 0.4;
    moteFrames.push(frame([Math.sin(a) * rr, 0.4 + R() * 1.4, Math.cos(a) * rr], [0, 1, 0]));
  }
  glow(b.cards(moteFrames, STAR, { size: 0.05, cross: true, vary: 0.45, spin: 180, sink: 0, rng: rng(9) }), 1);

  return b.root;
}
```