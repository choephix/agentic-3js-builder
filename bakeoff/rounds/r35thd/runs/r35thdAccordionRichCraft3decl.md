```ts
import * as THREE from "three";
import {
  createBuilder,
  mix,
  noise,
  paint,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A compact, ornate piano accordion with iridescent shell cases, pleated bellows, pearl keys, bass buttons, engraved grillework, brass fittings, and decorative Italian filigree.",
};

const PEARL = paint((p, n, _s) => {
  const shimmer =
    0.5 +
    0.5 *
      Math.sin(
        p.x * 34 +
          p.y * 18 +
          p.z * 47 +
          noise(p, 0.075, 17) * 7,
      );
  let c = mix("#fff4d9", "#b9f2e7", 0.17 + shimmer * 0.2);
  c = mix(c, "#f3b7d0", 0.08 + 0.1 * (0.5 + 0.5 * Math.sin(p.z * 63 + p.x * 19)));
  c = mix(c, "#fffdf2", Math.max(0, n.y) * 0.16);
  return c;
});

const PEARL_DARK = paint((p, n, _s) => {
  const shimmer = 0.5 + 0.5 * Math.sin(p.x * 25 - p.z * 38 + noise(p, 0.06, 29) * 8);
  let c = mix("#b9c9bd", "#6bbeb9", 0.24 + shimmer * 0.2);
  c = mix(c, "#c989a9", 0.1 + 0.08 * (0.5 + 0.5 * Math.sin(p.y * 70)));
  c = mix(c, "#f3e8c5", Math.max(0, n.y) * 0.12);
  return c;
});

const SHELL_WHITE = "#fff8df";
const SHELL_HIGHLIGHT = "#dffcf1";
const SHELL_PINK = "#efb5ce";
const INK = "#241a2d";
const DEEP_INK = "#161320";
const BELLOWS = "#3d263d";
const BELLOWS_LIGHT = "#74485d";
const TEAL = "#287b7c";
const TEAL_DARK = "#174c58";
const BRASS = "#c7963f";
const BRASS_LIGHT = "#f3d37b";
const BRASS_DARK = "#765022";
const WOOD = "#552f29";
const LEATHER = "#271b22";
const KEY_IVORY = "#fff4d2";
const KEY_SHADOW = "#c7b99b";
const BLACK_KEY = "#18131d";

const ORNAMENT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
    <defs>
      <radialGradient id="g" cx=".45" cy=".35" r=".7">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset=".4" stop-color="#d9fff1"/>
        <stop offset=".72" stop-color="#e9a9ca"/>
        <stop offset="1" stop-color="#75bfc0"/>
      </radialGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#fff0a5"/>
        <stop offset=".5" stop-color="#b77c2e"/>
        <stop offset="1" stop-color="#ffe294"/>
      </linearGradient>
    </defs>
    <g fill="none" stroke="url(#gold)" stroke-linecap="round">
      <circle cx="80" cy="80" r="66" stroke-width="3"/>
      <circle cx="80" cy="80" r="57" stroke-width="1.4" opacity=".8"/>
      <path d="M80 22 C58 44 55 58 80 80 C105 58 102 44 80 22Z" stroke-width="2.5"/>
      <path d="M138 80 C116 58 102 55 80 80 C102 105 116 102 138 80Z" stroke-width="2.5"/>
      <path d="M80 138 C102 116 105 102 80 80 C55 102 58 116 80 138Z" stroke-width="2.5"/>
      <path d="M22 80 C44 102 58 105 80 80 C58 55 44 58 22 80Z" stroke-width="2.5"/>
      <path d="M47 47 Q80 70 113 47 M47 113 Q80 90 113 113" stroke-width="1.6"/>
      <path d="M47 47 Q70 80 47 113 M113 47 Q90 80 113 113" stroke-width="1.6"/>
    </g>
    <circle cx="80" cy="80" r="25" fill="url(#g)" stroke="url(#gold)" stroke-width="4"/>
    <path d="M80 57 L86 73 L103 74 L90 84 L94 101 L80 91 L66 101 L70 84 L57 74 L74 73Z"
      fill="#fffce4" stroke="#d99abc" stroke-width="1.5"/>
    <circle cx="80" cy="80" r="6" fill="#d895bd"/>
  </svg>`,
  { size: 256 },
);

const MEDALLION = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs>
      <radialGradient id="m">
        <stop stop-color="#fffdf2"/>
        <stop offset=".42" stop-color="#a9eee1"/>
        <stop offset=".73" stop-color="#eeb0ca"/>
        <stop offset="1" stop-color="#5eafb9"/>
      </radialGradient>
    </defs>
    <circle cx="64" cy="64" r="58" fill="url(#m)" stroke="#bd8b3d" stroke-width="4"/>
    <circle cx="64" cy="64" r="48" fill="none" stroke="#fff0a4" stroke-width="2"/>
    <g fill="#fff7d7" stroke="#ae7032" stroke-width="1.5">
      <path d="M64 13 C72 31 73 42 64 56 C55 42 56 31 64 13Z"/>
      <path d="M115 64 C97 72 86 73 72 64 C86 55 97 56 115 64Z"/>
      <path d="M64 115 C56 97 55 86 64 72 C73 86 72 97 64 115Z"/>
      <path d="M13 64 C31 56 42 55 56 64 C42 73 31 72 13 64Z"/>
    </g>
    <circle cx="64" cy="64" r="17" fill="#fffde5" stroke="#b8793d" stroke-width="3"/>
    <path d="M64 49 L69 60 L81 61 L72 68 L75 80 L64 73 L53 80 L56 68 L47 61 L59 60Z"
      fill="#df8db4"/>
  </svg>`,
  { size: 256 },
);

const GRILLE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 84">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop stop-color="#fff5b5"/>
        <stop offset=".4" stop-color="#b97d2f"/>
        <stop offset=".7" stop-color="#f7d77a"/>
        <stop offset="1" stop-color="#754921"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="116" height="80" rx="12" fill="#182b36" stroke="url(#g)" stroke-width="4"/>
    <g fill="none" stroke="url(#g)" stroke-width="2">
      <path d="M10 42 Q25 8 40 42 T70 42 T100 42 T115 42"/>
      <path d="M10 42 Q25 76 40 42 T70 42 T100 42 T115 42"/>
      <path d="M20 10 Q60 30 100 10 M20 74 Q60 54 100 74"/>
      <circle cx="30" cy="42" r="9"/><circle cx="60" cy="42" r="9"/><circle cx="90" cy="42" r="9"/>
    </g>
    <g fill="#fff5bf">
      <circle cx="30" cy="42" r="2.5"/><circle cx="60" cy="42" r="2.5"/><circle cx="90" cy="42" r="2.5"/>
    </g>
  </svg>`,
  { size: 256 },
);

const EMBLEM = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 70">
    <rect width="180" height="70" rx="14" fill="#173c47" stroke="#e3b45b" stroke-width="4"/>
    <path d="M18 35 Q32 13 48 35 Q32 57 18 35 M132 35 Q148 13 162 35 Q148 57 132 35"
      fill="none" stroke="#fff1ad" stroke-width="3"/>
    <path d="M53 25 Q90 8 127 25 L117 51 Q90 63 63 51Z" fill="#f7d5e0" stroke="#fffce7" stroke-width="2"/>
    <text x="90" y="44" text-anchor="middle" font-family="serif" font-size="22" font-weight="bold"
      letter-spacing="3" fill="#4b2849">AURORA</text>
  </svg>`,
  { size: 384 },
);

const LABEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 44">
    <rect x="2" y="2" width="156" height="40" rx="20" fill="#fbefd0" stroke="#bc8238" stroke-width="4"/>
    <text x="80" y="29" text-anchor="middle" font-family="serif" font-size="20" font-weight="bold"
      letter-spacing="4" fill="#3f2450">ITALIA</text>
  </svg>`,
  { size: 256 },
);

const KEY_BADGE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="29" fill="#fff9da" stroke="#c58e3b" stroke-width="3"/>
    <path d="M32 9 L38 25 L55 25 L41 35 L46 52 L32 42 L18 52 L23 35 L9 25 L26 25Z"
      fill="#db9abb" stroke="#70b9b7" stroke-width="2"/>
  </svg>`,
  { size: 128 },
);

const FILIGREE_SMALL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 36">
    <path d="M4 18 C12 2 24 2 32 18 C40 34 52 34 60 18 C68 2 80 2 92 18"
      fill="none" stroke="#f7d47b" stroke-width="3"/>
    <path d="M4 18 C12 34 24 34 32 18 C40 2 52 2 60 18 C68 34 80 34 92 18"
      fill="none" stroke="#d88caf" stroke-width="1.5"/>
    <circle cx="32" cy="18" r="3" fill="#fffbe5"/>
    <circle cx="60" cy="18" r="3" fill="#fffbe5"/>
  </svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "italian-mother-of-pearl-accordion", detail: 1 });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      flat: true,
      name,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    name: string,
    radial = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      dir: [0, 0, 1],
      flat: true,
      name,
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: any,
    name: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      flat: true,
      name,
    });

  const torus = (
    radius: number,
    tube: number,
    at: [number, number, number],
    color: any,
    name: string,
  ) =>
    b.part(new THREE.TorusGeometry(radius, tube, 5, 16), color, {
      at,
      flat: true,
      name,
    });

  const frontPlane = (
    width: number,
    height: number,
    at: [number, number, number],
    texture: THREE.Texture,
    name: string,
  ) =>
    b.part(new THREE.PlaneGeometry(width, height), SHELL_WHITE, {
      at,
      dir: [0, 0, 1],
      axis: "z",
      texture,
      name,
    });

  const diamond = (
    x: number,
    y: number,
    z: number,
    scale: number,
    color: any,
    name: string,
  ) =>
    b.extrude(
      [
        [0, scale],
        [scale * 0.72, 0],
        [0, -scale],
        [-scale * 0.72, 0],
      ],
      {
        at: [x, y, z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.006,
        bevel: 0.001,
        color,
        name,
      },
    );

  // Main body dimensions: approximately 60 cm wide, 48 cm tall, 27 cm deep.
  const leftX = -0.225;
  const rightX = 0.225;
  const front = 0.132;

  // Dark inner bellows chamber.
  box([0.32, 0.38, 0.205], [0, 0.255, -0.005], DEEP_INK, "bellows_core");

  // Mother-of-pearl end cases.
  box([0.15, 0.45, 0.25], [leftX, 0.25, 0], PEARL, "bass_case");
  box([0.15, 0.45, 0.25], [rightX, 0.25, 0], PEARL_DARK, "keyboard_case");

  // Dark inset front plates.
  box([0.119, 0.355, 0.018], [leftX, 0.245, 0.132], TEAL_DARK, "bass_inset");
  box([0.119, 0.355, 0.018], [rightX, 0.245, 0.132], TEAL_DARK, "keyboard_inset");

  // Case rails and corner bands.
  for (const s of [-1, 1]) {
    const x = s === -1 ? leftX : rightX;
    box([0.13, 0.018, 0.028], [x, 0.048, front + 0.006], BRASS, `case_${s}_bottom_rail`);
    box([0.13, 0.018, 0.028], [x, 0.452, front + 0.006], BRASS_LIGHT, `case_${s}_top_rail`);
    box([0.018, 0.39, 0.027], [x - 0.062, 0.25, front + 0.006], BRASS, `case_${s}_inner_rail`);
    box([0.018, 0.39, 0.027], [x + 0.062, 0.25, front + 0.006], BRASS_LIGHT, `case_${s}_outer_rail`);

    box([0.015, 0.40, 0.018], [x - 0.057, 0.25, -0.132], PEARL_DARK, `case_${s}_back_inner`);
    box([0.015, 0.40, 0.018], [x + 0.057, 0.25, -0.132], PEARL, `case_${s}_back_outer`);

    for (const yy of [0.06, 0.44]) {
      sphere(0.012, [x - 0.057, yy, 0.151], BRASS_LIGHT, `case_${s}_rivet_inner_${yy}`);
      sphere(0.012, [x + 0.057, yy, 0.151], BRASS_LIGHT, `case_${s}_rivet_outer_${yy}`);
      torus(0.014, 0.0025, [x - 0.057, yy, 0.164], BRASS_DARK, `case_${s}_ring_inner_${yy}`);
      torus(0.014, 0.0025, [x + 0.057, yy, 0.164], BRASS_DARK, `case_${s}_ring_outer_${yy}`);
    }

    for (const yy of [0.09, 0.22, 0.35, 0.42]) {
      diamond(x - 0.052, yy, 0.148, 0.009, SHELL_HIGHLIGHT, `case_${s}_pearl_left_${yy}`);
      diamond(x + 0.052, yy, 0.148, 0.009, SHELL_PINK, `case_${s}_pearl_right_${yy}`);
    }
  }

  // Bellows: broad pleat block and repeated vertical ribs.
  box([0.31, 0.385, 0.20], [0, 0.255, -0.005], BELLOWS, "bellows_body");
  const pleatX = [-0.145, -0.108, -0.071, -0.034, 0.003, 0.04, 0.077, 0.114, 0.145];
  pleatX.forEach((x, i) => {
    box(
      [0.017, 0.392, 0.022],
      [x, 0.255, 0.104],
      i % 2 ? BELLOWS_LIGHT : PEARL_DARK,
      `bellows_front_pleat_${i}`,
      [0, 0, i % 2 ? 3 : -3],
    );
    box(
      [0.015, 0.392, 0.018],
      [x, 0.255, -0.112],
      i % 2 ? BELLOWS_LIGHT : BELLOWS,
      `bellows_back_pleat_${i}`,
      [0, 0, i % 2 ? -3 : 3],
    );
  });
  box([0.32, 0.024, 0.215], [0, 0.062, -0.005], BRASS_DARK, "bellows_lower_frame");
  box([0.32, 0.024, 0.448,], [0, 0.448, -0.005], BRASS_LIGHT, "bellows_upper_frame");

  // Bellows corner diamonds and long front inlay ribbons.
  for (const x of [-0.14, -0.07, 0, 0.07, 0.14]) {
    diamond(x, 0.428, 0.118, 0.008, BRASS_LIGHT, `bellows_top_jewel_${x}`);
    diamond(x, 0.08, 0.118, 0.008, SHELL_PINK, `bellows_bottom_jewel_${x}`);
  }
  box([0.28, 0.008, 0.009], [0, 0.414, 0.121], BRASS_LIGHT, "bellows_front_top_trim");
  box([0.28, 0.008, 0.009], [0, 0.095, 0.121], BRASS_DARK, "bellows_front_bottom_trim");

  // Bass side ornate panel and medallion.
  frontPlane(0.105, 0.105, [leftX, 0.365, 0.145], ORNAMENT, "bass_ornament");
  frontPlane(0.072, 0.072, [leftX, 0.365, 0.149], MEDALLION, "bass_medallion");
  cylinder(0.052, 0.008, [leftX, 0.365, 0.141], BRASS_DARK, "bass_medallion_rim", 16);
  torus(0.054, 0.004, [leftX, 0.365, 0.153], BRASS_LIGHT, "bass_medallion_gold_ring");

  // Bass button field: three columns of pearl buttons with brass collars.
  const bassXs = [-0.264, -0.225, -0.186];
  const bassYs = [0.135, 0.19, 0.245, 0.30, 0.355];
  bassYs.forEach((y, row) =>
    bassXs.forEach((x, col) => {
      const r = row === 2 && col === 1 ? 0.019 : 0.014;
      cylinder(r + 0.004, 0.006, [x, y, 0.145], BRASS_DARK, `bass_collar_${row}_${col}`, 10);
      cylinder(r, 0.009, [x, y, 0.152], row % 2 ? PEARL : SHELL_HIGHLIGHT, `bass_button_${row}_${col}`, 10);
      torus(r + 0.002, 0.0018, [x, y, 0.158], BRASS_LIGHT, `bass_button_ring_${row}_${col}`);
    }),
  );

  // Small bass-side label and a row of engraved shell inlays.
  frontPlane(0.078, 0.022, [leftX, 0.084, 0.148], LABEL, "bass_italia_label");
  for (const x of [-0.267, -0.246, -0.225, -0.204, -0.183]) {
    diamond(x, 0.414, 0.15, 0.006, SHELL_PINK, `bass_top_inlay_${x}`);
  }

  // Keyboard panel: ivory keys stacked vertically, with black raised accidentals.
  box([0.125, 0.335, 0.024], [rightX, 0.235, 0.149], BLACK_KEY, "keyboard_well");
  const keyStart = 0.105;
  const keyStep = 0.0275;
  for (let i = 0; i < 12; i++) {
    const y = keyStart + i * keyStep;
    box([0.098, 0.023, 0.039], [rightX, y, 0.166], i % 4 === 0 ? SHELL_WHITE : KEY_IVORY, `white_key_${i}`);
    box([0.098, 0.003, 0.006], [rightX, y + 0.012, 0.188], KEY_SHADOW, `key_gap_${i}`);
  }
  const blackIndices = [0, 1, 3, 4, 5, 7, 8, 10];
  blackIndices.forEach((i, k) => {
    const y = keyStart + (i + 1) * keyStep - 0.004;
    box([0.072, 0.014, 0.048], [rightX - 0.008, y, 0.184], BLACK_KEY, `black_key_${k}`);
    box([0.055, 0.003, 0.004], [rightX - 0.008, y + 0.006, 0.209], TEAL, `black_key_glint_${k}`);
  });
  box([0.125, 0.017, 0.028], [rightX, 0.083, 0.16], BRASS, "keyboard_lower_rail");
  box([0.125, 0.017, 0.028], [rightX, 0.405, 0.16], BRASS_LIGHT, "keyboard_upper_rail");

  // Individual pearl key badges.
  [1, 4, 7, 10].forEach((i, k) => {
    frontPlane(0.018, 0.018, [rightX + 0.049, keyStart + i * keyStep, 0.192], KEY_BADGE, `key_badge_${k}`);
  });

  // Decorative keyboard grille above the keys.
  box([0.125, 0.102, 0.025], [rightX, 0.422, 0.145], TEAL_DARK, "keyboard_grille_back");
  frontPlane(0.105, 0.073, [rightX, 0.422, 0.162], GRILLE, "keyboard_grille_texture");
  box([0.125, 0.012, 0.027], [rightX, 0.369, 0.164], BRASS_DARK, "grille_lower_bar");
  box([0.125, 0.012, 0.027], [rightX, 0.475, 0.164], BRASS_LIGHT, "grille_upper_bar");
  for (const x of [-0.272, -0.246, -0.22, -0.194, -0.168]) {
    cylinder(0.004, 0.009, [x, 0.422, 0.174], BRASS_LIGHT, `grille_rivet_${x}`, 8);
  }

  // Tiny Italian maker's plaque on the keyboard side.
  frontPlane(0.095, 0.026, [rightX, 0.075, 0.151], EMBLEM, "maker_plaque");

  // Mother-of-pearl shell mosaic on the upper keyboard case.
  frontPlane(0.10, 0.09, [rightX, 0.305, 0.147], ORNAMENT, "keyboard_shell_mosaic");
  for (const y of [0.263, 0.305, 0.347]) {
    diamond(rightX - 0.05, y, 0.153, 0.007, SHELL_PINK, `keyboard_mosaic_left_${y}`);
    diamond(rightX + 0.05, y, 0.153, 0.007, SHELL_HIGHLIGHT, `keyboard_mosaic_right_${y}`);
  }

  // Gold and pearl filigree strips running over both end cases.
  for (const s of [-1, 1]) {
    const x = s === -1 ? leftX : rightX;
    frontPlane(0.092, 0.019, [x, 0.115, 0.153], FILIGREE_SMALL, `filigree_lower_${s}`);
    frontPlane(0.092, 0.019, [x, 0.438, 0.153], FILIGREE_SMALL, `filigree_upper_${s}`);
  }

  // Top shell cap, a slightly raised pearl crown between the cases.
  box([0.31, 0.026, 0.22], [0, 0.465, -0.005], PEARL, "top_shell_cap");
  box([0.27, 0.009, 0.018], [0, 0.481, 0.104], BRASS_LIGHT, "top_front_gold_edge");
  frontPlane(0.18, 0.021, [0, 0.468, 0.108], FILIGREE_SMALL, "top_center_filigree");
  for (const x of [-0.11, -0.055, 0, 0.055, 0.11]) {
    sphere(0.009, [x, 0.488, 0.06], SHELL_PINK, `top_pearl_${x}`);
  }

  // Rear shoulder strap glimpses: dark leather with brass keeper blocks.
  for (const x of [-0.205, 0.205]) {
    b.rod(
      [x, 0.08, -0.143],
      [x, 0.44, -0.143],
      0.012,
      LEATHER,
      { caps: "flat", name: `rear_strap_${x}` },
    );
    box([0.037, 0.052, 0.012], [x, 0.40, -0.151], BRASS_DARK, `strap_keeper_${x}`);
    box([0.025, 0.012, 0.014], [x, 0.40, -0.158], BRASS_LIGHT, `strap_buckle_${x}`);
  }

  // Lower protective feet and small brass corner shoes.
  for (const x of [-0.278, -0.172, 0.172, 0.278]) {
    box([0.028, 0.024, 0.09], [x, 0.021, -0.055], BRASS_DARK, `lower_foot_${x}`);
    sphere(0.014, [x, 0.012, 0.012], BRASS, `foot_cap_${x}`);
  }

  // Side shell pins, repeated like hand-set pearl studs.
  for (const s of [-1, 1]) {
    const x = s === -1 ? leftX : rightX;
    for (const y of [0.145, 0.195, 0.245, 0.295, 0.345]) {
      sphere(0.0065, [x - 0.066, y, 0.146], SHELL_HIGHLIGHT, `side_shell_pin_${s}_${y}`);
      sphere(0.0065, [x + 0.066, y, 0.146], SHELL_PINK, `side_shell_pin_outer_${s}_${y}`);
    }
  }

  // A small brass central clasp and pearl lozenge on the bellows front.
  cylinder(0.018, 0.01, [0, 0.255, 0.122], BRASS_DARK, "central_clasp_base", 12);
  diamond(0, 0.255, 0.13, 0.018, SHELL_HIGHLIGHT, "central_clasp_pearl");
  torus(0.021, 0.003, [0, 0.255, 0.137], BRASS_LIGHT, "central_clasp_ring");

  return b.root;
}
```