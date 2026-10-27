import * as THREE from "three";
import {
  createBuilder,
  paint,
  noise,
  svg,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A richly detailed low-poly piano accordion with pearlescent Italian shell panels, ivory piano keys, bellows, bass buttons, chrome trim, straps, grillework, and ornamental inlay.",
};

const PEARL = paint((p, n) => {
  const wave =
    0.5 +
    0.5 *
      Math.sin(
        p.x * 31 +
          p.y * 17 +
          p.z * 23 +
          noise(p, 0.17, 14) * 5.2,
      );
  const top = Math.max(0, n.y) * 0.22;
  const r = 0.78 + wave * 0.15 + top;
  const g = 0.88 + wave * 0.09 + top * 0.6;
  const b = 0.84 + (1 - wave) * 0.13 + top * 0.8;
  return [Math.min(r, 1), Math.min(g, 1), Math.min(b, 1)];
});

const PEARL_DARK = paint((p, n) => {
  const v = noise(p, 0.11, 41);
  return [
    0.34 + v * 0.16 + Math.max(n.y, 0) * 0.08,
    0.54 + v * 0.16,
    0.58 + (1 - v) * 0.16,
  ];
});

const IVORY = "#fff0c9";
const IVORY_SHADOW = "#cda875";
const EBONY = "#17131a";
const EBONY_HIGHLIGHT = "#3b3039";
const BELLOWS = "#38233a";
const BELLOWS_EDGE = "#b996b0";
const BRASS = "#c99142";
const GOLD = "#f0c96d";
const CHROME = "#b8c6c9";
const DARK_CHROME = "#47525a";
const RED = "#8e2330";
const LEATHER = "#24131b";

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  at: [number, number, number],
  color: any,
  options: any = {},
) {
  return b.part(
    new THREE.BoxGeometry(size[0], size[1], size[2]),
    color,
    {
      at,
      flat: true,
      ...options,
    },
  );
}

function cylinder(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  height: number,
  at: [number, number, number],
  color: any,
  dir: [number, number, number] = [0, 0, 1],
  options: any = {},
) {
  return b.part(
    new THREE.CylinderGeometry(radius, radius, height, 10, 1),
    color,
    {
      at,
      dir,
      flat: true,
      ...options,
    },
  );
}

function pearlInset(
  b: ReturnType<typeof createBuilder>,
  at: [number, number, number],
  size: [number, number, number],
  color: any = PEARL,
) {
  box(b, size, at, color);
  box(
    b,
    [size[0] * 0.82, size[1] * 0.82, size[2] + 0.004],
    [at[0], at[1], at[2] + 0.004],
    PEARL_DARK,
  );
  box(
    b,
    [size[0] * 0.72, size[1] * 0.72, size[2] + 0.008],
    [at[0], at[1], at[2] + 0.008],
    color,
  );
}

function cornerStuds(
  b: ReturnType<typeof createBuilder>,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  color: any = GOLD,
) {
  for (const dx of [-sx, sx]) {
    for (const dy of [-sy, sy]) {
      cylinder(b, 0.012, 0.012, [x + dx, y + dy, z], color);
    }
  }
}

function ornament(
  b: ReturnType<typeof createBuilder>,
  x: number,
  y: number,
  z: number,
  scale: number,
) {
  const gem = svg(
    `<svg viewBox="0 0 100 100">
      <path d="M50 7 L61 38 L94 50 L61 62 L50 94 L39 62 L6 50 L39 38 Z"
        fill="#fff5bd" stroke="#4d1733" stroke-width="7" stroke-linejoin="round"/>
      <path d="M50 22 L55 45 L78 50 L55 55 L50 78 L45 55 L22 50 L45 45 Z"
        fill="#a7e6df" stroke="#d9a44e" stroke-width="3"/>
      <circle cx="50" cy="50" r="7" fill="#c43672"/>
    </svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(scale, scale), "#ffffff", {
    at: [x, y, z],
    dir: [0, 0, 1],
    axis: "z",
    texture: gem,
  });
}

export default function build() {
  const b = createBuilder({ name: "italian-mother-of-pearl-accordion", detail: 1 });

  // Overall instrument: two rigid shell halves with a pleated bellows core.
  const left = 0.30;
  const right = -0.30;
  const bodyY = 0.62;

  // Left bass case, right piano case.
  box(b, [0.25, 0.78, 0.38], [left, bodyY, 0], PEARL, { name: "bassShell" });
  box(b, [0.25, 0.80, 0.42], [right, bodyY, 0], PEARL, { name: "keyboardShell" });

  // Dark side rails and shell edging.
  for (const x of [left - 0.132, left + 0.132, right - 0.132, right + 0.132]) {
    box(b, [0.018, 0.82, 0.40], [x, bodyY, 0], BRASS);
  }
  for (const x of [left, right]) {
    box(b, [0.25, 0.025, 0.40], [x, 0.225, 0], DARK_CHROME);
    box(b, [0.25, 0.025, 0.40], [x, 1.015, 0], GOLD);
    box(b, [0.25, 0.78, 0.025], [x, bodyY, 0.205], DARK_CHROME);
    box(b, [0.25, 0.78, 0.025], [x, bodyY, -0.205], BRASS);
  }

  // Large pearl plates on both cases.
  pearlInset(b, [left, 0.69, 0.208], [0.19, 0.55, 0.018]);
  pearlInset(b, [right, 0.77, 0.224], [0.19, 0.50, 0.018]);
  ornament(b, left, 0.75, 0.222, 0.13);
  ornament(b, right, 0.91, 0.238, 0.12);

  // Decorative horizontal inlay bars.
  for (const x of [left, right]) {
    for (const y of [0.37, 0.47, 0.92]) {
      box(b, [0.18, 0.018, 0.012], [x, y, 0.226], GOLD);
      box(b, [0.145, 0.009, 0.016], [x, y, 0.236], RED);
    }
  }

  // Bellows, seven broad pleats, compressed between shells.
  const folds = [-0.175, -0.125, -0.075, -0.025, 0.025, 0.075, 0.125, 0.175];
  for (let i = 0; i < folds.length; i++) {
    const x = folds[i];
    const h = i % 2 ? 0.68 : 0.73;
    box(b, [0.033, h, 0.31], [x, 0.62, 0], i % 2 ? BELLOWS : BELLOWS_EDGE);
    box(b, [0.011, h - 0.04, 0.325], [x + 0.018, 0.62, 0], BELLOWS);
    box(b, [0.012, h - 0.08, 0.34], [x - 0.019, 0.62, 0], GOLD);
  }
  for (const x of [-0.18, 0.18]) {
    box(b, [0.035, 0.76, 0.36], [x, 0.62, 0], RED);
    box(b, [0.047, 0.68, 0.375], [x, 0.62, 0.01], PEARL);
  }

  // Piano keyboard ledge and ivory keys facing +Z.
  box(b, [0.24, 0.20, 0.10], [right - 0.01, 0.31, 0.265], EBONY);
  box(b, [0.235, 0.025, 0.12], [right - 0.01, 0.205, 0.27], GOLD);

  const keyXs = [
    -0.387, -0.357, -0.327, -0.297, -0.267, -0.237, -0.207,
  ];
  for (let i = 0; i < keyXs.length; i++) {
    const x = keyXs[i];
    box(b, [0.026, 0.145, 0.060], [x, 0.405, 0.287], IVORY, {
      name: `ivoryKey${i}`,
    });
    box(b, [0.024, 0.006, 0.065], [x, 0.333, 0.318], IVORY_SHADOW);
  }

  const blackKeys = [-0.372, -0.342, -0.282, -0.252, -0.222];
  for (let i = 0; i < blackKeys.length; i++) {
    box(
      b,
      [0.018, 0.105, 0.052],
      [blackKeys[i], 0.465, 0.323],
      EBONY,
      { name: `blackKey${i}` },
    );
    box(
      b,
      [0.012, 0.012, 0.008],
      [blackKeys[i], 0.515, 0.353],
      EBONY_HIGHLIGHT,
    );
  }

  // Keyboard cheek blocks and top name rail.
  box(b, [0.025, 0.19, 0.085], [-0.415, 0.405, 0.285], PEARL);
  box(b, [0.025, 0.19, 0.085], [-0.185, 0.405, 0.285], PEARL);
  box(b, [0.21, 0.04, 0.018], [right, 0.555, 0.235], GOLD);
  const label = svg(
    `<svg viewBox="0 0 240 48">
      <rect width="240" height="48" rx="8" fill="#211326"/>
      <text x="120" y="33" text-anchor="middle"
        font-family="serif" font-weight="bold" font-size="25"
        fill="#f6d47b" letter-spacing="3">VENEZIA</text>
    </svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.17, 0.034), "#ffffff", {
    at: [right, 0.555, 0.248],
    dir: [0, 0, 1],
    axis: "z",
    texture: label,
  });

  // Bass button field on the left case, in a readable diamond pattern.
  const buttons: Array<[number, number]> = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 4; col++) {
      const y = 0.38 + row * 0.115;
      const z = -0.12 + col * 0.075 + (row % 2 ? 0.037 : 0);
      buttons.push([y, z]);
    }
  }
  for (let i = 0; i < buttons.length; i++) {
    const [y, z] = buttons[i];
    cylinder(b, 0.026, 0.018, [left, y, z], i % 5 === 0 ? GOLD : IVORY, [1, 0, 0]);
    cylinder(b, 0.014, 0.021, [left + 0.014, y, z], i % 5 === 0 ? RED : CHROME, [1, 0, 0]);
  }

  // Bass grille: dark inset rectangle with repeating brass slats.
  box(b, [0.018, 0.30, 0.27], [left + 0.135, 0.77, 0], EBONY);
  for (let i = 0; i < 9; i++) {
    const y = 0.625 + i * 0.037;
    box(b, [0.012, 0.015, 0.235], [left + 0.148, y, 0], GOLD);
  }
  for (let z of [-0.10, 0, 0.10]) {
    box(b, [0.014, 0.32, 0.012], [left + 0.154, 0.77, z], BRASS);
  }

  // Bass grille corner rivets.
  cornerStuds(b, left + 0.158, 0.77, 0, 0.0, 0.135, GOLD);
  for (const y of [0.63, 0.91]) {
    for (const z of [-0.115, 0.115]) {
      cylinder(b, 0.012, 0.016, [left + 0.16, y, z], CHROME, [1, 0, 0]);
    }
  }

  // Small air-valve and register switches.
  for (let i = 0; i < 5; i++) {
    box(b, [0.035, 0.035, 0.055], [right - 0.14 + i * 0.035, 0.905, 0.245], EBONY);
    cylinder(b, 0.011, 0.012, [right - 0.14 + i * 0.035, 0.945, 0.245], GOLD);
  }
  cylinder(b, 0.025, 0.022, [left + 0.16, 0.29, -0.16], CHROME, [1, 0, 0]);
  cylinder(b, 0.014, 0.028, [left + 0.178, 0.29, -0.16], RED, [1, 0, 0]);

  // Pearl crown caps on the top corners.
  for (const x of [left, right]) {
    box(b, [0.19, 0.035, 0.36], [x, 1.04, 0], PEARL);
    for (const z of [-0.14, 0, 0.14]) {
      cylinder(b, 0.014, 0.016, [x, 1.065, z], GOLD);
    }
  }

  // Lower feet / protective shell corners, keeping the instrument firmly on the floor.
  for (const x of [left - 0.09, left + 0.09, right - 0.09, right + 0.09]) {
    box(b, [0.045, 0.08, 0.18], [x, 0.14, 0], LEATHER);
    cylinder(b, 0.025, 0.025, [x, 0.095, 0], DARK_CHROME);
  }

  // Shoulder strap anchors on the back and bright strap hardware.
  for (const x of [-0.33, 0.33]) {
    box(b, [0.055, 0.09, 0.025], [x, 0.73, -0.225], LEATHER);
    cylinder(b, 0.018, 0.018, [x, 0.73, -0.245], GOLD, [0, 0, 1]);
  }
  box(b, [0.035, 0.62, 0.025], [-0.43, 0.62, -0.19], LEATHER);
  box(b, [0.035, 0.62, 0.025], [0.43, 0.62, -0.19], LEATHER);

  // Strap stitching.
  for (const x of [-0.452, 0.452]) {
    for (let i = 0; i < 10; i++) {
      box(b, [0.006, 0.018, 0.031], [x, 0.35 + i * 0.06, -0.207], GOLD);
    }
  }

  // Tiny pearl diamonds along the outer shell rails.
  for (const x of [left - 0.145, right + 0.145]) {
    for (let i = 0; i < 6; i++) {
      const y = 0.32 + i * 0.13;
      box(b, [0.012, 0.026, 0.018], [x, y, 0.216], PEARL_DARK);
      cylinder(b, 0.009, 0.012, [x, y, 0.228], GOLD);
    }
  }

  return b.root;
}
