import * as THREE from "three";
import { createBuilder, paint, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Neon Vector Arcade Cabinet",
  description:
    "A detailed 1980s upright arcade cabinet with a synthwave screen, neon trim, marquee, joystick, buttons, coin door, speaker grille, side art, and glowing accents.",
};

const BLACK = "#080713";
const INK = "#120b25";
const PLUM = "#241044";
const PURPLE = "#472080";
const VIOLET = "#752aa6";
const HOT_PINK = "#ff2ba6";
const MAGENTA = "#d927ff";
const CYAN = "#19e7ff";
const BLUE = "#3157ff";
const ORANGE = "#ff8b35";
const YELLOW = "#ffe14a";
const WHITE = "#fff4ff";
const METAL = "#45405d";
const DARK_METAL = "#1c1930";
const RED = "#ff3f67";
const GREEN = "#39ffb0";

const shellPaint = paint((p, n) => {
  const top = Math.max(0, Math.min(1, (p.y - 0.15) / 1.55));
  if (n.y > 0.45) return top > 0.6 ? "#332064" : "#291750";
  if (n.z > 0.35) return top > 0.55 ? "#1d143c" : "#120d29";
  return top > 0.5 ? "#211341" : "#100b24";
});

const trimPaint = paint((p, n) => {
  const pulse = 0.5 + 0.5 * Math.sin(p.y * 32 + p.z * 18);
  return n.y > 0.35 ? (pulse > 0.52 ? MAGENTA : HOT_PINK) : PURPLE;
});

const screenTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 270">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#110927"/>
        <stop offset="0.58" stop-color="#231157"/>
        <stop offset="1" stop-color="#05030c"/>
      </linearGradient>
      <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff36a"/>
        <stop offset="0.45" stop-color="#ff9635"/>
        <stop offset="1" stop-color="#ff287f"/>
      </linearGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="2"/></filter>
    </defs>
    <rect width="400" height="270" fill="url(#bg)"/>
    <g opacity=".18" stroke="#19e7ff" stroke-width="1">
      <path d="M0 190H400 M0 207H400 M0 224H400 M0 241H400 M0 258H400"/>
      <path d="M200 145L0 270 M200 145L50 270 M200 145L100 270 M200 145L150 270
               M200 145L250 270 M200 145L300 270 M200 145L350 270 M200 145L400 270"/>
    </g>
    <g opacity=".35" filter="url(#soft)">
      <circle cx="200" cy="115" r="67" fill="#ff2ba6"/>
    </g>
    <circle cx="200" cy="115" r="58" fill="url(#sun)" stroke="#ffd8ff" stroke-width="2"/>
    <g stroke="#7b174d" stroke-width="5" opacity=".72">
      <path d="M145 76H255 M140 91H260 M138 106H262 M139 121H261 M144 136H256"/>
    </g>
    <path d="M200 50L106 186H294Z" fill="#13102b" stroke="#20efff" stroke-width="4"/>
    <path d="M200 77L141 174H259Z" fill="#211351" stroke="#ff2ba6" stroke-width="3"/>
    <path d="M200 95L169 160H231Z" fill="#100a28" stroke="#ffe14a" stroke-width="2"/>
    <path d="M0 190H400" stroke="#ff2ba6" stroke-width="3"/>
    <text x="18" y="25" font-family="monospace" font-size="13" font-weight="bold" fill="#19e7ff">INSERT COIN</text>
    <text x="307" y="25" font-family="monospace" font-size="11" fill="#ff5bc5">1UP 004200</text>
  </svg>`,
  { size: 512 },
);

const marqueeTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 180">
    <defs>
      <linearGradient id="m" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#17072d"/>
        <stop offset=".5" stop-color="#6f145f"/>
        <stop offset="1" stop-color="#171054"/>
      </linearGradient>
      <linearGradient id="t" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff6ff"/>
        <stop offset=".35" stop-color="#ff9bea"/>
        <stop offset="1" stop-color="#ff2ba6"/>
      </linearGradient>
    </defs>
    <rect width="640" height="180" rx="12" fill="url(#m)" stroke="#19e7ff" stroke-width="8"/>
    <path d="M20 145H620 M35 130H605 M52 115H588" stroke="#19e7ff" stroke-width="2" opacity=".38"/>
    <circle cx="95" cy="42" r="20" fill="#ffe14a"/>
    <path d="M95 42L59 105H131Z" fill="#1d0d3c" stroke="#ff2ba6" stroke-width="4"/>
    <text x="320" y="91" text-anchor="middle" font-family="Impact, sans-serif" font-size="67"
      font-style="italic" font-weight="bold" fill="#270c42" stroke="#19e7ff" stroke-width="9"
      stroke-linejoin="round">NEON</text>
    <text x="320" y="91" text-anchor="middle" font-family="Impact, sans-serif" font-size="67"
      font-style="italic" font-weight="bold" fill="url(#t)">NEON</text>
    <text x="320" y="146" text-anchor="middle" font-family="monospace" font-size="27"
      letter-spacing="8" fill="#ffe14a">VECTOR RUN</text>
    <path d="M27 16L90 16 M550 164L613 164" stroke="#ff2ba6" stroke-width="7"/>
  </svg>`,
  { size: 512 },
);

const sideArtTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 580">
    <defs>
      <linearGradient id="s" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#110a29"/>
        <stop offset=".5" stop-color="#32115e"/>
        <stop offset="1" stop-color="#090719"/>
      </linearGradient>
      <linearGradient id="sun2" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#ffe65c"/>
        <stop offset=".5" stop-color="#ff713d"/>
        <stop offset="1" stop-color="#eb1e92"/>
      </linearGradient>
    </defs>
    <rect x="5" y="5" width="250" height="570" rx="10" fill="url(#s)" stroke="#54238c" stroke-width="8"/>
    <circle cx="130" cy="202" r="74" fill="url(#sun2)" stroke="#ffb7f0" stroke-width="4"/>
    <g stroke="#7d174d" stroke-width="6" opacity=".75">
      <path d="M65 171H195 M59 190H201 M58 210H202 M62 230H198"/>
    </g>
    <path d="M130 112L46 300H214Z" fill="#15102e" stroke="#19e7ff" stroke-width="6"/>
    <path d="M130 145L82 276H178Z" fill="#29165a" stroke="#ff2ba6" stroke-width="4"/>
    <path d="M130 178L111 250H149Z" fill="#0c0920" stroke="#ffe14a" stroke-width="3"/>
    <path d="M20 332L235 78 M16 405L246 137 M23 476L246 222"
      stroke="#ff2ba6" stroke-width="7" opacity=".82"/>
    <path d="M25 350L238 105 M23 418L242 178 M30 486L232 270"
      stroke="#19e7ff" stroke-width="3" opacity=".8"/>
    <text x="130" y="382" text-anchor="middle" font-family="monospace" font-size="25"
      font-weight="bold" fill="#fff4ff" transform="rotate(-14 130 382)">VECTOR</text>
    <text x="130" y="417" text-anchor="middle" font-family="monospace" font-size="20"
      letter-spacing="4" fill="#ffe14a" transform="rotate(-14 130 417)">RUNNER</text>
    <circle cx="39" cy="530" r="8" fill="#19e7ff"/>
    <circle cx="66" cy="530" r="8" fill="#ff2ba6"/>
    <circle cx="93" cy="530" r="8" fill="#ffe14a"/>
  </svg>`,
  { size: 512 },
);

const coinTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 100">
    <rect width="220" height="100" rx="12" fill="#0c0920" stroke="#19e7ff" stroke-width="7"/>
    <text x="110" y="39" text-anchor="middle" font-family="monospace" font-size="18" fill="#ff2ba6">INSERT</text>
    <text x="110" y="70" text-anchor="middle" font-family="monospace" font-size="22" font-weight="bold" fill="#ffe14a">COIN</text>
    <path d="M25 18H65 M155 82H195" stroke="#19e7ff" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

const controlTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 72">
    <rect width="360" height="72" rx="12" fill="#130b29" stroke="#19e7ff" stroke-width="5"/>
    <text x="180" y="47" text-anchor="middle" font-family="monospace" font-size="29"
      letter-spacing="6" fill="#ff2ba6">PLAYER ONE</text>
  </svg>`,
  { size: 256 },
);

const warningTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60">
    <rect width="220" height="60" fill="#140b25" stroke="#ff2ba6" stroke-width="5"/>
    <path d="M20 45L36 14L52 45Z" fill="#ffe14a"/>
    <text x="68" y="37" font-family="monospace" font-size="15" fill="#fff4ff">HIGH SCORE</text>
  </svg>`,
  { size: 192 },
);

const ventTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 90">
    <rect width="240" height="90" fill="#0d091c"/>
    <g stroke="#19e7ff" stroke-width="7" opacity=".8">
      <path d="M15 15H225 M15 32H225 M15 49H225 M15 66H225"/>
    </g>
    <path d="M12 82H228" stroke="#ff2ba6" stroke-width="5"/>
  </svg>`,
  { size: 256 },
);

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  at: [number, number, number],
  color: string | ReturnType<typeof paint>,
  options: {
    rotation?: [number, number, number];
    texture?: THREE.Texture;
    name?: string;
    flat?: boolean;
  } = {},
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    rotation: options.rotation,
    texture: options.texture,
    name: options.name,
    flat: options.flat ?? true,
  });
}

function cylinder(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  height: number,
  at: [number, number, number],
  color: string,
  options: {
    radial?: number;
    dir?: [number, number, number];
    texture?: THREE.Texture;
    name?: string;
  } = {},
) {
  return b.part(
    new THREE.CylinderGeometry(radius, radius, height, options.radial ?? 10, 1),
    color,
    {
      at,
      dir: options.dir,
      texture: options.texture,
      name: options.name,
      flat: true,
    },
  );
}

function sphere(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  at: [number, number, number],
  color: string,
  name?: string,
) {
  return b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
    at,
    name,
    flat: true,
  });
}

function frontPlane(
  b: ReturnType<typeof createBuilder>,
  width: number,
  height: number,
  at: [number, number, number],
  texture: THREE.Texture,
  name: string,
) {
  return b.part(new THREE.PlaneGeometry(width, height), WHITE, {
    at,
    dir: [0, 0, 1],
    axis: "z",
    up: [0, 1, 0],
    texture,
    name,
  });
}

function sidePlane(
  b: ReturnType<typeof createBuilder>,
  side: number,
  width: number,
  height: number,
  at: [number, number, number],
  texture: THREE.Texture,
  name: string,
) {
  return b.part(new THREE.PlaneGeometry(width, height), WHITE, {
    at,
    dir: [side, 0, 0],
    axis: "z",
    up: [0, 1, 0],
    texture,
    name,
  });
}

function neonRod(
  b: ReturnType<typeof createBuilder>,
  a: [number, number, number],
  c: [number, number, number],
  radius: number,
  color: string,
  name: string,
) {
  const tube = b.rod(a, c, radius, { color, name, sides: 6, caps: "round" });
  glow(tube, 2.4);
  return tube;
}

function neonBox(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  at: [number, number, number],
  color: string,
  name: string,
) {
  const p = box(b, size, at, color, { name });
  glow(p, 2.2);
  return p;
}

export default function build() {
  const b = createBuilder({
    name: "neon-vector-arcade-cabinet",
    detail: 1,
    paintSize: 1024,
  });

  // Main cabinet body and characteristic wedge-shaped side cheeks.
  box(b, [0.57, 1.41, 0.56], [0, 0.76, -0.01], shellPaint, {
    name: "main cabinet shell",
  });

  const sideOutline: [number, number][] = [
    [-0.34, 0.035],
    [0.34, 0.035],
    [0.34, 0.82],
    [0.315, 1.03],
    [0.315, 1.54],
    [0.23, 1.69],
    [-0.205, 1.69],
    [-0.34, 1.55],
  ];

  for (const side of [-1, 1]) {
    b.extrude(sideOutline, {
      at: [side * 0.31, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.085,
      bevel: 0.012,
      smoothing: 1,
      color: shellPaint,
      name: side < 0 ? "right side cheek" : "left side cheek",
    });

    sidePlane(
      b,
      side,
      0.31,
      0.82,
      [side * 0.356, 0.83, -0.015],
      sideArtTexture,
      side < 0 ? "right synthwave side art" : "left synthwave side art",
    );

    neonRod(
      b,
      [side * 0.366, 0.12, 0.285],
      [side * 0.366, 0.86, 0.285],
      0.008,
      side < 0 ? CYAN : HOT_PINK,
      side < 0 ? "right front cyan rail" : "left front pink rail",
    );

    neonRod(
      b,
      [side * 0.366, 1.08, 0.285],
      [side * 0.366, 1.53, 0.205],
      0.008,
      side < 0 ? HOT_PINK : CYAN,
      side < 0 ? "right monitor pink rail" : "left monitor cyan rail",
    );

    neonRod(
      b,
      [side * 0.366, 0.11, -0.275],
      [side * 0.366, 1.5, -0.275],
      0.006,
      PURPLE,
      side < 0 ? "right rear purple rail" : "left rear purple rail",
    );

    for (let i = 0; i < 4; i++) {
      neonRod(
        b,
        [side * 0.365, 0.32 + i * 0.045, -0.26],
        [side * 0.365, 0.34 + i * 0.045, 0.18],
        0.0035,
        i % 2 === 0 ? CYAN : MAGENTA,
        `${side < 0 ? "right" : "left"} side diagonal accent ${i}`,
      );
    }
  }

  // Bottom plinth, feet, and lower kick panel.
  box(b, [0.63, 0.09, 0.58], [0, 0.07, -0.01], DARK_METAL, {
    name: "bottom plinth",
  });
  box(b, [0.54, 0.12, 0.045], [0, 0.15, 0.287], BLACK, {
    name: "lower kick shadow",
  });
  neonBox(b, [0.56, 0.018, 0.018], [0, 0.14, 0.314], MAGENTA, "lower magenta neon line");

  for (const side of [-1, 1]) {
    box(b, [0.12, 0.055, 0.16], [side * 0.215, 0.018, -0.16], BLACK, {
      name: side < 0 ? "right foot" : "left foot",
    });
    box(b, [0.08, 0.018, 0.13], [side * 0.215, 0.007, -0.16], PURPLE, {
      name: side < 0 ? "right foot highlight" : "left foot highlight",
    });
  }

  // Upper monitor housing and deep bezel.
  box(b, [0.58, 0.53, 0.27], [0, 1.36, 0.125], PLUM, {
    name: "monitor housing",
  });
  box(b, [0.525, 0.405, 0.055], [0, 1.385, 0.286], BLACK, {
    name: "monitor black bezel",
  });
  box(b, [0.458, 0.335, 0.018], [0, 1.39, 0.32], DARK_METAL, {
    name: "monitor inner bezel",
  });

  const screen = frontPlane(
    b,
    0.405,
    0.275,
    [0, 1.39, 0.333],
    screenTexture,
    "glowing synthwave screen",
  );
  glow(screen, 1.8);

  // Bright screen frame, with deliberately chunky 1980s geometry.
  neonBox(b, [0.44, 0.014, 0.018], [0, 1.545, 0.349], CYAN, "screen top cyan tube");
  neonBox(b, [0.44, 0.014, 0.018], [0, 1.235, 0.349], HOT_PINK, "screen bottom pink tube");
  neonBox(b, [0.014, 0.32, 0.018], [-0.224, 1.39, 0.349], HOT_PINK, "screen left pink tube");
  neonBox(b, [0.014, 0.32, 0.018], [0.224, 1.39, 0.349], CYAN, "screen right cyan tube");

  // Little monitor corner caps.
  for (const x of [-0.225, 0.225]) {
    for (const y of [1.235, 1.545]) {
      sphere(b, 0.014, [x, y, 0.36], y > 1.4 ? CYAN : HOT_PINK, "screen corner cap");
    }
  }

  // Marquee crown and marquee artwork.
  box(b, [0.59, 0.19, 0.23], [0, 1.655, 0.125], PURPLE, {
    name: "marquee crown",
  });
  box(b, [0.535, 0.145, 0.035], [0, 1.655, 0.255], BLACK, {
    name: "marquee recess",
  });
  const marquee = frontPlane(
    b,
    0.485,
    0.115,
    [0, 1.655, 0.28],
    marqueeTexture,
    "NEON VECTOR marquee",
  );
  glow(marquee, 1.35);

  neonRod(b, [-0.27, 1.58, 0.29], [0.27, 1.58, 0.29], 0.009, CYAN, "marquee lower cyan edge");
  neonRod(b, [-0.27, 1.73, 0.29], [0.27, 1.73, 0.29], 0.009, HOT_PINK, "marquee upper pink edge");

  // Angular crown fins and side cap shapes.
  for (const side of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.13, 0],
        [0.09, 0.075],
        [0.015, 0.1],
      ],
      {
        at: [side * 0.28, 1.675, 0.08],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.018,
        color: side < 0 ? CYAN : HOT_PINK,
        name: side < 0 ? "right crown fin" : "left crown fin",
      },
    );
  }

  // Control deck, front lip, and player label.
  box(
    b,
    [0.575, 0.14, 0.345],
    [0, 0.925, 0.235],
    shellPaint,
    {
      rotation: [-0.16, 0, 0],
      name: "sloped control deck",
    },
  );
  box(
    b,
    [0.56, 0.035, 0.05],
    [0, 0.86, 0.405],
    BLACK,
    {
      rotation: [-0.16, 0, 0],
      name: "control deck front lip",
    },
  );
  neonRod(b, [-0.27, 0.86, 0.422], [0.27, 0.86, 0.422], 0.007, CYAN, "control cyan lip");
  neonRod(b, [-0.25, 1.00, 0.29], [0.25, 1.00, 0.29], 0.005, HOT_PINK, "control rear pink trim");

  const controlLabel = frontPlane(
    b,
    0.285,
    0.057,
    [0, 0.875, 0.434],
    controlTexture,
    "PLAYER ONE control label",
  );
  glow(controlLabel, 0.8);

  // Control panel corner bolts.
  for (const x of [-0.255, 0.255]) {
    sphere(b, 0.012, [x, 0.875, 0.429], CYAN, "control panel corner bolt");
  }

  // Joystick assembly, deliberately oversized and readable.
  cylinder(b, 0.065, 0.022, [0.135, 1.012, 0.32], DARK_METAL, {
    radial: 12,
    name: "joystick base",
  });
  cylinder(b, 0.047, 0.018, [0.135, 1.031, 0.32], MAGENTA, {
    radial: 10,
    name: "joystick base neon ring",
  });
  const stick = b.rod([0.135, 1.035, 0.32], [0.135, 1.145, 0.32], 0.015, {
    color: METAL,
    sides: 8,
    name: "joystick shaft",
  });
  const ball = sphere(b, 0.054, [0.135, 1.175, 0.32], RED, "red joystick ball");
  glow(ball, 0.9);
  neonRod(b, [0.135, 1.11, 0.335], [0.135, 1.155, 0.345], 0.004, YELLOW, "joystick shaft highlight");
  void stick;

  // Main colored action buttons.
  const buttons: Array<[number, string, string]> = [
    [-0.13, CYAN, "cyan button"],
    [-0.055, HOT_PINK, "pink button"],
    [0.02, YELLOW, "yellow button"],
    [0.095, GREEN, "green button"],
  ];
  for (const [x, color, name] of buttons) {
    cylinder(b, 0.029, 0.016, [x, 1.025, 0.325], DARK_METAL, {
      radial: 12,
      name: `${name} socket`,
    });
    const button = sphere(b, 0.027, [x, 1.041, 0.325], color, name);
    glow(button, 1.45);
    cylinder(b, 0.008, 0.004, [x - 0.008, 1.064, 0.337], WHITE, {
      radial: 8,
      name: `${name} highlight`,
    });
  }

  // Small start/select buttons at the back of the deck.
  for (const [x, color, label] of [
    [-0.09, CYAN, "start cyan"],
    [-0.025, HOT_PINK, "select pink"],
  ] as Array<[number, string, string]>) {
    cylinder(b, 0.018, 0.012, [x, 1.008, 0.275], BLACK, {
      radial: 10,
      name: `${label} socket`,
    });
    const p = sphere(b, 0.016, [x, 1.02, 0.275], color, label);
    glow(p, 1.2);
  }

  // Tiny button labels and warning badge.
  const warning = frontPlane(
    b,
    0.145,
    0.04,
    [-0.185, 0.88, 0.433],
    warningTexture,
    "high score warning badge",
  );
  glow(warning, 0.7);

  // Lower coin door.
  box(b, [0.41, 0.42, 0.035], [0, 0.41, 0.286], DARK_METAL, {
    name: "coin door",
  });
  box(b, [0.36, 0.37, 0.014], [0, 0.41, 0.31], BLACK, {
    name: "coin door inset",
  });
  neonRod(b, [-0.19, 0.61, 0.32], [0.19, 0.61, 0.32], 0.006, CYAN, "coin door top cyan trim");
  neonRod(b, [-0.19, 0.21, 0.32], [0.19, 0.21, 0.32], 0.006, HOT_PINK, "coin door bottom pink trim");
  neonRod(b, [-0.19, 0.21, 0.32], [-0.19, 0.61, 0.32], 0.006, HOT_PINK, "coin door left pink trim");
  neonRod(b, [0.19, 0.21, 0.32], [0.19, 0.61, 0.32], 0.006, CYAN, "coin door right cyan trim");

  const coinLabel = frontPlane(
    b,
    0.155,
    0.07,
    [0, 0.535, 0.323],
    coinTexture,
    "INSERT COIN label",
  );
  glow(coinLabel, 0.95);

  // Coin slot, return button, lock, and glowing credit lamp.
  box(b, [0.075, 0.018, 0.014], [0, 0.445, 0.327], BLACK, {
    name: "coin slot",
  });
  neonBox(b, [0.045, 0.006, 0.006], [0, 0.452, 0.335], YELLOW, "coin slot highlight");
  cylinder(b, 0.031, 0.012, [-0.115, 0.42, 0.326], BLACK, {
    radial: 12,
    dir: [0, 0, 1],
    name: "coin return socket",
  });
  const returnButton = cylinder(b, 0.022, 0.009, [-0.115, 0.42, 0.335], RED, {
    radial: 12,
    dir: [0, 0, 1],
    name: "coin return button",
  });
  glow(returnButton, 1.1);
  cylinder(b, 0.015, 0.008, [0.115, 0.42, 0.326], BLACK, {
    radial: 12,
    dir: [0, 0, 1],
    name: "service lock",
  });
  cylinder(b, 0.008, 0.009, [0.115, 0.42, 0.335], YELLOW, {
    radial: 8,
    dir: [0, 0, 1],
    name: "service lock brass center",
  });

  // Speaker grille and lower venting.
  box(b, [0.30, 0.19, 0.018], [0, 0.69, 0.314], BLACK, {
    name: "speaker recess",
  });
  const vent = frontPlane(
    b,
    0.275,
    0.125,
    [0, 0.69, 0.327],
    ventTexture,
    "cyan speaker grille",
  );
  glow(vent, 0.55);

  for (let i = 0; i < 7; i++) {
    cylinder(b, 0.009, 0.012, [-0.11 + i * 0.036, 0.69, 0.34], DARK_METAL, {
      radial: 8,
      dir: [0, 0, 1],
      name: "speaker grille hole",
    });
  }

  // Small lower vents, arranged as a graphic rather than a realistic perforated panel.
  for (let i = 0; i < 5; i++) {
    neonRod(
      b,
      [-0.115 + i * 0.057, 0.19, 0.331],
      [-0.135 + i * 0.057, 0.235, 0.331],
      0.003,
      i % 2 ? MAGENTA : CYAN,
      "lower vent slash",
    );
  }

  // Cabinet side edge studs and little fasteners.
  for (const side of [-1, 1]) {
    for (const y of [0.22, 0.72, 1.15, 1.52]) {
      const stud = sphere(b, 0.012, [side * 0.372, y, 0.275], y > 1 ? CYAN : MAGENTA, "side edge stud");
      glow(stud, 1.1);
    }
  }

  // Extra synthwave pinstripes across the front fascia.
  neonRod(b, [-0.285, 0.805, 0.305], [0.285, 0.805, 0.305], 0.004, PURPLE, "front fascia purple stripe");
  neonRod(b, [-0.28, 1.075, 0.305], [0.28, 1.075, 0.305], 0.004, MAGENTA, "front fascia pink stripe");

  // Small animated-looking indicators on either side of the coin door.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const indicator = cylinder(
        b,
        0.009,
        0.008,
        [side * (0.235 + i * 0.022), 0.54 - i * 0.035, 0.331],
        i === 0 ? CYAN : i === 1 ? YELLOW : HOT_PINK,
        {
          radial: 8,
          dir: [0, 0, 1],
          name: "credit indicator",
        },
      );
      glow(indicator, 1.6);
    }
  }

  // A few chunky rear and top highlights make the silhouette read from three-quarter views.
  neonRod(b, [-0.25, 1.69, -0.28], [0.25, 1.69, -0.28], 0.006, PURPLE, "rear crown edge");
  neonRod(b, [-0.30, 0.12, -0.28], [-0.30, 1.52, -0.28], 0.005, BLUE, "rear left edge light");
  neonRod(b, [0.30, 0.12, -0.28], [0.30, 1.52, -0.28], 0.005, BLUE, "rear right edge light");

  // A final set of tiny colored rivets along the control lip.
  for (let i = 0; i < 9; i++) {
    const x = -0.22 + i * 0.055;
    const r = sphere(b, 0.006, [x, 0.85, 0.431], i % 3 === 0 ? YELLOW : CYAN, "control lip rivet");
    glow(r, 1.25);
  }

  return b.root;
}
