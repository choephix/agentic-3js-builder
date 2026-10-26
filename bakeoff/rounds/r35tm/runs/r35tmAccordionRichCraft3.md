```ts
import * as THREE from "three";
import {
  createBuilder,
  paint,
  noise,
  rng,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "mother-of-pearl piano accordion",
  description:
    "A richly detailed Italian mother-of-pearl piano accordion with iridescent shell panels, pleated bellows, piano keys, pearl buttons, grille, straps, clasps, and ornamental inlay.",
};

const PEARL = paint((p, n) => {
  const a = noise(p, 0.075, 17);
  const b = noise(new THREE.Vector3(p.z * 1.3, p.x * 0.8, p.y), 0.035, 29);
  const shimmer = 0.5 + 0.5 * Math.sin(p.x * 92 + p.y * 31 + p.z * 47);
  const light = Math.max(0, n.dot(new THREE.Vector3(0.35, 0.82, 0.45)));
  const r = 0.68 + a * 0.18 + b * 0.07 + light * 0.08;
  const g = 0.78 + a * 0.13 + shimmer * 0.035 + light * 0.08;
  const bl = 0.81 + a * 0.13 + (1 - b) * 0.045 + light * 0.1;
  return [Math.min(1, r), Math.min(1, g), Math.min(1, bl)];
});

const PEARL_DARK = paint((p, n) => {
  const q = noise(p, 0.11, 43);
  const shine = Math.max(0, n.dot(new THREE.Vector3(-0.4, 0.8, 0.35)));
  return [
    0.28 + q * 0.11 + shine * 0.08,
    0.38 + q * 0.16 + shine * 0.11,
    0.44 + q * 0.19 + shine * 0.13,
  ];
});

const IVORY = "#f4ead0";
const IVORY_HI = "#fff9e8";
const EBONY = "#17151b";
const EBONY_HI = "#302735";
const BELLows = "#25202a";
const BELLows_HI = "#57444e";
const BRASS = "#c89442";
const BRASS_HI = "#f2cb70";
const BRASS_DARK = "#69451c";
const RED = "#7b2635";
const RED_DARK = "#35131d";
const INK = "#1b111a";

const inlay = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <defs>
      <linearGradient id="p" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset=".28" stop-color="#c8f4eb"/>
        <stop offset=".52" stop-color="#e8d6f7"/>
        <stop offset=".75" stop-color="#9fd7d6"/>
        <stop offset="1" stop-color="#fff4ce"/>
      </linearGradient>
      <pattern id="d" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M0 16H32M16 0V32" stroke="#ffffff" stroke-opacity=".42" stroke-width="3"/>
        <circle cx="16" cy="16" r="3" fill="#fff" fill-opacity=".55"/>
      </pattern>
    </defs>
    <rect x="8" y="8" width="240" height="240" rx="18" fill="url(#p)" stroke="#81552c" stroke-width="7"/>
    <rect x="21" y="21" width="214" height="214" rx="11" fill="url(#d)" stroke="#fff" stroke-opacity=".7" stroke-width="3"/>
    <path d="M128 42l20 65 66 21-66 21-20 65-20-65-66-21 66-21z" fill="none" stroke="#8c5a30" stroke-width="5"/>
    <path d="M128 67l11 42 43 19-43 19-11 42-11-42-43-19 43-19z" fill="#fff" fill-opacity=".28" stroke="#fff" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

const grille = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 180">
    <rect width="256" height="180" rx="25" fill="#231b26"/>
    <g fill="none" stroke="#dcb267" stroke-width="8">
      <path d="M18 32Q64 78 18 148M58 18Q110 72 58 162M102 14Q153 73 102 166M148 14Q198 73 148 166M194 18Q246 77 194 162M238 32Q192 78 238 148"/>
      <path d="M18 148Q64 102 18 32M58 162Q110 108 58 18M102 166Q153 107 102 14M148 166Q198 107 148 14M194 162Q246 103 194 18M238 148Q192 102 238 32"/>
    </g>
    <path d="M15 25H241M15 155H241" stroke="#fff0ae" stroke-width="3" opacity=".8"/>
  </svg>`,
  { size: 256 },
);

const crest = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <path d="M128 16l20 61 62 7-47 39 15 63-50-33-50 33 15-63-47-39 62-7z" fill="#f7e9bd" stroke="#5e3421" stroke-width="8"/>
    <path d="M128 49l10 39 39 5-30 24 9 39-28-19-28 19 9-39-30-24 39-5z" fill="#a7e2dc" stroke="#fff" stroke-width="4"/>
    <circle cx="128" cy="117" r="10" fill="#b44d67"/>
  </svg>`,
  { size: 256 },
);

const label = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80">
    <rect x="5" y="5" width="310" height="70" rx="22" fill="#eee4c8" stroke="#8d622b" stroke-width="7"/>
    <text x="160" y="54" text-anchor="middle" font-family="serif" font-size=" thirty" font-weight="bold" fill="#442318">VENEZIA • 1958</text>
  </svg>`,
  { size: 256 },
);

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  at: [number, number, number],
  color: any,
  name: string,
  texture?: THREE.Texture,
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    texture,
    name,
    flat: true,
  });
}

function cylinder(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  depth: number,
  at: [number, number, number],
  color: any,
  name: string,
  texture?: THREE.Texture,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, depth, 12), color, {
    at,
    dir: [0, 0, 1],
    texture,
    name,
    flat: true,
  });
}

function frontPlate(
  b: ReturnType<typeof createBuilder>,
  size: [number, number],
  at: [number, number, number],
  color: any,
  name: string,
  texture?: THREE.Texture,
) {
  return b.part(new THREE.PlaneGeometry(size[0], size[1]), color, {
    at,
    dir: [0, 0, 1],
    axis: "z",
    texture,
    name,
  });
}

function rivet(
  b: ReturnType<typeof createBuilder>,
  at: [number, number, number],
  radius = 0.012,
  color: any = BRASS_HI,
  name = "rivet",
) {
  return b.part(new THREE.SphereGeometry(radius, 8, 5), color, { at, name });
}

export default function build() {
  const b = createBuilder({ name: "mother-of-pearl piano accordion", detail: 1 });

  // Main end cabinets: chunky, slightly overlapping shells.
  box(b, [0.29, 0.66, 0.38], [-0.48, 0.36, 0], PEARL, "left shell");
  box(b, [0.29, 0.66, 0.38], [0.48, 0.36, 0], PEARL, "right shell");

  // Dark inset side rails make the instrument silhouette crisp.
  for (const s of [-1, 1]) {
    box(b, [0.035, 0.58, 0.40], [s * 0.322, 0.36, 0], BRASS_DARK, "shell edge");
    box(b, [0.035, 0.60, 0.32], [s * 0.63, 0.36, 0], BRASS, "outer binding");
    box(b, [0.018, 0.57, 0.27], [s * 0.649, 0.36, 0], BRASS_HI, "outer highlight");
  }

  // Bellows core and pleated folds between the two cabinets.
  box(b, [0.64, 0.54, 0.31], [0, 0.36, 0], BELLows, "bellows shadow");
  for (let i = 0; i < 11; i++) {
    const x = -0.305 + i * 0.061;
    box(b, [0.022, 0.55, 0.325], [x, 0.36, 0], i % 2 ? BELLows_HI : BELLows, `bellows fold ${i}`);
    box(b, [0.013, 0.50, 0.337], [x + 0.013, 0.36, 0.006], RED_DARK, `bellows seam ${i}`);
  }
  // Upper and lower bellows binding strips.
  for (const y of [0.095, 0.625]) {
    box(b, [0.66, 0.035, 0.34], [0, y, 0], BRASS_DARK, "bellows binding");
    box(b, [0.61, 0.012, 0.35], [0, y + (y < 0.3 ? -0.012 : 0.012), 0.012], BRASS_HI, "bellows binding glint");
  }

  // Front shell plaques with mother-of-pearl mosaic drawings.
  frontPlate(b, [0.245, 0.50], [-0.48, 0.38, 0.196], PEARL_DARK, "left inset");
  frontPlate(b, [0.245, 0.50], [0.48, 0.38, 0.196], PEARL_DARK, "right inset");
  frontPlate(b, [0.20, 0.42], [-0.48, 0.38, 0.204], "#ffffff", "left mosaic", inlay);
  frontPlate(b, [0.20, 0.42], [0.48, 0.38, 0.204], "#ffffff", "right mosaic", inlay);

  // Ornamental brass corner plates and their rivets.
  for (const s of [-1, 1]) {
    for (const y of [0.12, 0.60]) {
      box(b, [0.22, 0.025, 0.012], [s * 0.48, y, 0.214], BRASS, "plaque trim horizontal");
      for (const x of [s * 0.39, s * 0.57]) rivet(b, [x, y, 0.224], 0.011, BRASS_HI, "plaque corner rivet");
    }
    box(b, [0.025, 0.47, 0.012], [s * 0.37, 0.36, 0.214], BRASS_DARK, "plaque trim side");
    box(b, [0.025, 0.47, 0.012], [s * 0.59, 0.36, 0.214], BRASS_DARK, "plaque trim side");
  }

  // Left-hand grille and bass-button field.
  frontPlate(b, [0.235, 0.18], [-0.48, 0.22, 0.218], "#ffffff", "bass grille", grille);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = -0.548 + col * 0.067;
      const y = 0.39 + row * 0.075;
      cylinder(b, 0.023, 0.018, [x, y, 0.225], PEARL, `bass button ${row}-${col}`);
      cylinder(b, 0.014, 0.020, [x, y, 0.238], BRASS_DARK, `bass button ring ${row}-${col}`);
      rivet(b, [x, y, 0.250], 0.008, IVORY_HI, "button pearl");
    }
  }

  // Right-hand piano keyboard ledge.
  box(b, [0.255, 0.055, 0.075], [0.48, 0.185, 0.235], BRASS_DARK, "keyboard lower rail");
  box(b, [0.255, 0.035, 0.08], [0.48, 0.545, 0.235], BRASS_DARK, "keyboard upper rail");

  const whiteCount = 9;
  for (let i = 0; i < whiteCount; i++) {
    const x = 0.37 + i * 0.0275;
    box(b, [0.024, 0.34, 0.062], [x, 0.365, 0.248], i % 2 ? IVORY_HI : IVORY, `ivory key ${i}`);
    box(b, [0.021, 0.006, 0.064], [x, 0.197, 0.283], "#b5a98c", `key front edge ${i}`);
  }
  for (const i of [0, 1, 3, 4, 5, 7, 8]) {
    const x = 0.3837 + i * 0.0275;
    box(b, [0.016, 0.20, 0.042], [x, 0.455, 0.286], EBONY, `black key ${i}`);
    box(b, [0.012, 0.015, 0.044], [x, 0.555, 0.289], EBONY_HI, `black key highlight ${i}`);
  }

  // Keyboard-side shell ornament.
  frontPlate(b, [0.20, 0.105], [0.48, 0.635, 0.207], "#ffffff", "crest plate", crest);
  frontPlate(b, [0.205, 0.045], [0.48, 0.105, 0.209], "#ffffff", "maker label", label);

  // Brass latch bars across the bellows edges.
  for (const s of [-1, 1]) {
    box(b, [0.032, 0.58, 0.025], [s * 0.285, 0.36, 0.205], BRASS, "bellows latch bar");
    for (const y of [0.13, 0.59]) rivet(b, [s * 0.285, y, 0.222], 0.014, BRASS_HI, "latch rivet");
  }

  // Crown, base, and side binding strips.
  for (const s of [-1, 1]) {
    box(b, [0.29, 0.025, 0.405], [s * 0.48, 0.695, 0], BRASS_DARK, "top binding");
    box(b, [0.29, 0.018, 0.405], [s * 0.48, 0.015, 0], BRASS_DARK, "bottom binding");
    box(b, [0.30, 0.014, 0.37], [s * 0.48, 0.704, 0], BRASS_HI, "top binding highlight");
    for (const z of [-0.14, 0.14]) {
      rivet(b, [s * 0.48, 0.715, z], 0.013, BRASS_HI, "top cap rivet");
      rivet(b, [s * 0.48, 0.005, z], 0.013, BRASS_HI, "base rivet");
    }
  }

  // Shoulder-strap anchor loops and a pair of dark leather straps behind the shell.
  for (const s of [-1, 1]) {
    cylinder(b, 0.032, 0.025, [s * 0.48, 0.45, -0.218], BRASS, "strap anchor");
    box(b, [0.055, 0.19, 0.025], [s * 0.48, 0.56, -0.225], "#21151a", "rear strap");
    box(b, [0.055, 0.19, 0.012], [s * 0.48, 0.56, -0.241], RED_DARK, "strap inset");
  }

  // Small pearl and brass ornaments around the face, placed symmetrically.
  for (const s of [-1, 1]) {
    for (const y of [0.075, 0.665]) {
      cylinder(b, 0.018, 0.015, [s * 0.405, y, 0.22], PEARL, "shell pearl stud");
      rivet(b, [s * 0.555, y, 0.223], 0.012, BRASS_HI, "shell brass stud");
    }
  }

  // A few inset dark seams make the mother-of-pearl plates read as assembled parts.
  for (const s of [-1, 1]) {
    box(b, [0.19, 0.009, 0.008], [s * 0.48, 0.098, 0.216], INK, "lower plaque seam");
    box(b, [0.19, 0.009, 0.008], [s * 0.48, 0.662, 0.216], INK, "upper plaque seam");
  }

  return b.root;
}
```