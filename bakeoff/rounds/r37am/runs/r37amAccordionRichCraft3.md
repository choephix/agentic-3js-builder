```ts
import * as THREE from "three";
import {
  createBuilder,
  paint,
  mix,
  svg,
  rng,
} from "agentic-3js-builder";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A stylized, richly detailed piano accordion with pearlescent Italian shell panels, bellows, piano keys, bass buttons, grillework, straps, rivets, and ornamental inlays.",
};

const PEARL = paint((p, _n, _s) => {
  const wave =
    0.5 +
    0.5 *
      Math.sin(
        p.x * 32 +
          p.y * 21 +
          p.z * 17 +
          Math.sin(p.z * 28 + p.x * 9) * 1.4,
      );
  const warm = mix("#fff8e8", "#f6c5d7", wave * 0.38);
  return mix(warm, "#bfe8e3", Math.max(0, Math.sin(p.x * 19 - p.y * 14 + p.z * 31)) * 0.18);
});

const PEARL_DARK = paint((p, _n, _s) => {
  const wave = 0.5 + 0.5 * Math.sin(p.x * 40 + p.y * 23 + p.z * 18);
  return mix("#a96e8c", "#75bdb8", wave * 0.5);
});

const IVORY = "#fff4d4";
const IVORY_SHADOW = "#d6b991";
const EBONY = "#16131c";
const EBONY_HI = "#352936";
const WINE = "#641c38";
const WINE_DARK = "#2a0e1d";
const BRASS = "#c8913d";
const BRASS_HI = "#f3d27b";
const BRASS_DARK = "#70451f";
const FELT = "#43253b";
const RUBBER = "#17131a";
const KEY_EDGE = "#a97b54";

const pearlOrnament = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" fill="none"/>
    <path d="M64 8 L74 49 L120 64 L74 79 L64 120 L54 79 L8 64 L54 49 Z"
      fill="#fff5dc" stroke="#613040" stroke-width="4"/>
    <path d="M64 22 L69 55 L104 64 L69 73 L64 106 L59 73 L24 64 L59 55 Z"
      fill="#df9db9" stroke="#5b3150" stroke-width="3"/>
    <circle cx="64" cy="64" r="10" fill="#7ac8c3" stroke="#55304e" stroke-width="3"/>
    <path d="M15 18 Q32 10 48 18 M80 110 Q97 118 113 110" fill="none"
      stroke="#e9c86d" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const grilleTexture = svg(
  `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="80" rx="8" fill="#271520"/>
    <g fill="none" stroke="#e3b866" stroke-width="3">
      <path d="M4 40 Q20 8 36 40 T68 40 T100 40 T132 40 T164 40"/>
      <path d="M4 58 Q20 26 36 58 T68 58 T100 58 T132 58 T164 58"/>
      <path d="M4 22 Q20 -10 36 22 T68 22 T100 22 T132 22 T164 22"/>
    </g>
    <g fill="#f8d889">
      <circle cx="20" cy="40" r="3"/><circle cx="52" cy="40" r="3"/>
      <circle cx="84" cy="40" r="3"/><circle cx="116" cy="40" r="3"/>
      <circle cx="148" cy="40" r="3"/>
    </g>
  </svg>`,
  { size: 256 },
);

const makerBadge = svg(
  `<svg viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="116" height="46" rx="22" fill="#f9e6ba" stroke="#64334d" stroke-width="4"/>
    <path d="M15 25 Q30 8 45 25 T75 25 T105 25" fill="none" stroke="#c28743" stroke-width="3"/>
    <text x="60" y="32" text-anchor="middle" font-family="serif" font-size="15"
      font-weight="bold" fill="#402033">VITTORIA</text>
  </svg>`,
  { size: 256 },
);

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  at: [number, number, number],
  color: any,
  extra: any = {},
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    ...extra,
  });
}

function cylinder(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  depth: number,
  at: [number, number, number],
  color: any,
  dir: [number, number, number] = [0, 1, 0],
  extra: any = {},
) {
  return b.part(
    new THREE.CylinderGeometry(radius, radius, depth, 12),
    color,
    { at, dir, ...extra },
  );
}

function pearlStud(
  b: ReturnType<typeof createBuilder>,
  at: [number, number, number],
  r = 0.012,
) {
  cylinder(b, r, 0.008, at, PEARL_DARK, [0, 0, 1]);
  cylinder(b, r * 0.42, 0.011, [at[0], at[1], at[2] + 0.006], BRASS_HI, [0, 0, 1]);
}

function brassCorner(
  b: ReturnType<typeof createBuilder>,
  at: [number, number, number],
  s: number,
) {
  cylinder(b, 0.014, 0.012, at, BRASS_HI, [0, 0, 1], {
    rotation: [0, 0, s * 45],
  });
}

export default function build() {
  const b = createBuilder({ name: "italian-mother-of-pearl-accordion", detail: 1 });

  // Root silhouette: two substantial wooden shell boxes with a recessed bellows cavity.
  box(b, [0.235, 0.60, 0.27], [-0.285, 0.34, 0], PEARL, { name: "bassShell" });
  box(b, [0.235, 0.60, 0.27], [0.285, 0.34, 0], PEARL, { name: "trebleShell" });

  // Dark inset side rails, giving the accordion its characteristic waist and depth.
  box(b, [0.035, 0.55, 0.30], [-0.155, 0.34, -0.005], WINE_DARK);
  box(b, [0.035, 0.55, 0.30], [0.155, 0.34, -0.005], WINE_DARK);
  box(b, [0.66, 0.045, 0.29], [0, 0.63, 0], BRASS_DARK);
  box(b, [0.66, 0.045, 0.29], [0, 0.055, 0], BRASS_DARK);

  // Bellows core and its alternating pleats.
  box(b, [0.28, 0.48, 0.20], [0, 0.34, -0.015], FELT);
  for (let i = 0; i < 11; i++) {
    const y = 0.105 + i * 0.046;
    box(
      b,
      [0.285, 0.019, 0.225],
      [0, y, 0.012],
      i % 2 ? WINE : WINE_DARK,
      { name: `bellowsFold${i}` },
    );
    box(b, [0.296, 0.006, 0.231], [0, y + 0.012, 0.018], BRASS_DARK);
  }

  // Pearlescent front plaques.
  box(b, [0.19, 0.47, 0.018], [-0.285, 0.35, 0.146], PEARL);
  box(b, [0.19, 0.47, 0.018], [0.285, 0.35, 0.146], PEARL);

  // Raised wine-colored borders around both shell fronts.
  for (const x of [-0.285, 0.285]) {
    box(b, [0.205, 0.018, 0.025], [x, 0.105, 0.162], BRASS);
    box(b, [0.205, 0.018, 0.025], [x, 0.595, 0.162], BRASS);
    box(b, [0.018, 0.49, 0.025], [x - 0.102, 0.35, 0.162], BRASS);
    box(b, [0.018, 0.49, 0.025], [x + 0.102, 0.35, 0.162], BRASS);
  }

  // Large starburst inlays.
  for (const x of [-0.285, 0.285]) {
    b.part(new THREE.PlaneGeometry(0.115, 0.115), "#ffffff", {
      at: [x, 0.39, 0.165],
      dir: [0, 0, 1],
      axis: "z",
      texture: pearlOrnament,
      name: x < 0 ? "bassStarInlay" : "trebleStarInlay",
    });
    cylinder(b, 0.064, 0.012, [x, 0.20, 0.164], PEARL_DARK, [0, 0, 1]);
    cylinder(b, 0.047, 0.014, [x, 0.20, 0.172], PEARL, [0, 0, 1]);
    cylinder(b, 0.064, 0.012, [x, 0.535, 0.164], PEARL_DARK, [0, 0, 1]);
    cylinder(b, 0.047, 0.014, [x, 0.535, 0.172], PEARL, [0, 0, 1]);
  }

  // Corner rivets and shell hardware.
  for (const x of [-0.285, 0.285]) {
    for (const y of [0.115, 0.585]) {
      for (const sx of [-1, 1]) {
        pearlStud(b, [x + sx * 0.082, y, 0.179], 0.009);
      }
    }
    for (const y of [0.16, 0.28, 0.40, 0.52]) {
      pearlStud(b, [x - 0.094, y, 0.178], 0.007);
      pearlStud(b, [x + 0.094, y, 0.178], 0.007);
    }
  }

  // Bass button field: four rows of ivory, rose and turquoise buttons.
  const bassColors = [IVORY, "#e9a9c4", "#a9dcd4", IVORY];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const x = -0.322 + col * 0.037;
      const y = 0.215 + row * 0.073;
      cylinder(b, 0.014, 0.012, [x, y, 0.18], BRASS_DARK, [0, 0, 1]);
      cylinder(b, 0.011, 0.014, [x, y, 0.188], bassColors[(row + col) % bassColors.length], [0, 0, 1]);
      cylinder(b, 0.003, 0.016, [x - 0.003, y + 0.003, 0.196], "#ffffff", [0, 0, 1]);
    }
  }

  // Bass grille and decorative badge.
  b.part(new THREE.PlaneGeometry(0.14, 0.075), "#ffffff", {
    at: [-0.285, 0.50, 0.182],
    dir: [0, 0, 1],
    axis: "z",
    texture: grilleTexture,
  });
  b.part(new THREE.PlaneGeometry(0.15, 0.0625), "#ffffff", {
    at: [-0.285, 0.275, 0.183],
    dir: [0, 0, 1],
    axis: "z",
    texture: makerBadge,
  });

  // Treble grille above the keyboard.
  b.part(new THREE.PlaneGeometry(0.16, 0.105), "#ffffff", {
    at: [0.285, 0.505, 0.184],
    dir: [0, 0, 1],
    axis: "z",
    texture: grilleTexture,
  });

  // Piano keyboard frame.
  box(b, [0.17, 0.54, 0.035], [0.285, 0.335, 0.190], EBONY, { name: "keyboardBed" });
  box(b, [0.19, 0.025, 0.044], [0.285, 0.065, 0.195], BRASS_DARK);
  box(b, [0.19, 0.025, 0.044], [0.285, 0.605, 0.195], BRASS_DARK);

  // White piano keys in a vertical Italian accordion keyboard.
  const whiteKeyY = [0.115, 0.175, 0.235, 0.295, 0.355, 0.415, 0.475, 0.535];
  for (let i = 0; i < whiteKeyY.length; i++) {
    const y = whiteKeyY[i];
    box(
      b,
      [0.154, 0.052, 0.031],
      [0.285, y, 0.222],
      i % 3 === 1 ? "#fff9e9" : IVORY,
      { name: `whiteKey${i}` },
    );
    box(b, [0.151, 0.004, 0.007], [0.285, y + 0.025, 0.240], KEY_EDGE);
  }

  // Black keys, offset to make a readable piano pattern.
  for (const i of [0, 1, 3, 4, 5, 7]) {
    const y = whiteKeyY[i] + 0.031;
    box(b, [0.090, 0.029, 0.041], [0.255, y, 0.238], EBONY, { name: `blackKey${i}` });
    box(b, [0.075, 0.005, 0.008], [0.255, y + 0.010, 0.259], EBONY_HI);
  }

  // Fine brass key separators and a mother-of-pearl treble medallion.
  for (const y of [0.145, 0.205, 0.265, 0.325, 0.385, 0.445, 0.505]) {
    box(b, [0.158, 0.004, 0.036], [0.285, y, 0.224], BRASS_DARK);
  }
  cylinder(b, 0.032, 0.009, [0.285, 0.615, 0.188], PEARL_DARK, [0, 0, 1]);
  b.part(new THREE.PlaneGeometry(0.043, 0.043), "#ffffff", {
    at: [0.285, 0.615, 0.197],
    dir: [0, 0, 1],
    axis: "z",
    texture: pearlOrnament,
  });

  // End blocks and feet; the lowest surfaces touch y = 0.
  for (const x of [-0.285, 0.285]) {
    box(b, [0.205, 0.035, 0.30], [x, 0.035, 0], RUBBER);
    box(b, [0.23, 0.025, 0.32], [x, 0.018, 0], BRASS_DARK);
    cylinder(b, 0.022, 0.026, [x - 0.075, 0.014, 0.115], RUBBER);
    cylinder(b, 0.022, 0.026, [x + 0.075, 0.014, 0.115], RUBBER);
  }

  // A decorative line of brass studs around the bellows mouth.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 7; i++) {
      pearlStud(b, [s * (0.16 + i * 0.005), 0.105 + i * 0.075, 0.135], 0.006);
    }
  }

  // Shoulder straps behind the body, visible at the top and lower sides.
  b.rod([-0.43, 0.64, -0.105], [0.43, 0.64, -0.105], 0.020, {
    color: WINE_DARK,
    caps: "round",
    name: "upperShoulderStrap",
  });
  b.rod([-0.43, 0.09, -0.105], [0.43, 0.09, -0.105], 0.018, {
    color: WINE_DARK,
    caps: "round",
    name: "lowerShoulderStrap",
  });
  b.rod([-0.43, 0.13, -0.12], [-0.43, 0.58, -0.12], 0.014, {
    color: BRASS_DARK,
    caps: "round",
  });
  b.rod([0.43, 0.13, -0.12], [0.43, 0.58, -0.12], 0.014, {
    color: BRASS_DARK,
    caps: "round",
  });

  // Strap adjustment buckles.
  for (const x of [-0.43, 0.43]) {
    box(b, [0.065, 0.055, 0.012], [x, 0.48, -0.135], BRASS);
    box(b, [0.038, 0.025, 0.015], [x, 0.48, -0.145], WINE_DARK);
    box(b, [0.065, 0.055, 0.012], [x, 0.22, -0.135], BRASS);
    box(b, [0.038, 0.025, 0.015], [x, 0.22, -0.145], WINE_DARK);
  }

  // Four ornate brass corner caps and tiny pearl highlights.
  for (const x of [-0.387, -0.183, 0.183, 0.387]) {
    brassCorner(b, [x, 0.635, 0.155], x > 0 ? 1 : -1);
    brassCorner(b, [x, 0.045, 0.155], x > 0 ? -1 : 1);
  }

  // A small hanging tassel on the left strap, made from repeated dark cords.
  b.rod([-0.455, 0.20, -0.14], [-0.455, 0.095, -0.14], 0.008, {
    color: BRASS_DARK,
    caps: "round",
  });
  for (let i = -2; i <= 2; i++) {
    b.rod(
      [-0.455 + i * 0.008, 0.10, -0.14],
      [-0.455 + i * 0.008, 0.035 - Math.abs(i) * 0.004, -0.14],
      0.0035,
      { color: i % 2 ? WINE : BRASS_DARK, caps: "round" },
    );
  }

  // Subtle pearl buttons on the top rim.
  for (let i = 0; i < 9; i++) {
    const x = -0.34 + i * 0.085;
    cylinder(b, 0.009, 0.009, [x, 0.675, -0.02], PEARL_DARK, [0, 1, 0]);
    cylinder(b, 0.004, 0.011, [x, 0.682, -0.02], BRASS_HI, [0, 1, 0]);
  }

  // A few crisp side reflections sell the lacquered mother-of-pearl shell.
  for (const x of [-0.405, -0.165, 0.165, 0.405]) {
    box(b, [0.008, 0.30, 0.008], [x, 0.37, 0.173], "#ffffff");
  }

  return b.root;
}
```