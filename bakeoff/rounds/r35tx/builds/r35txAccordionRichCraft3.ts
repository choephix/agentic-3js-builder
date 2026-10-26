import * as THREE from "three";
import {
  catmull,
  createBuilder,
  mix,
  noise,
  paint,
  svg,
} from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A richly decorated upright piano accordion with iridescent mother-of-pearl cases, wine-red bellows, gilded filigree, piano keys, bass buttons, Italian inlay, and ornamental side panels.",
};

const DEEP_PLUM = "#241327";
const PLUM = "#4a1e3c";
const WINE = "#6d2341";
const WINE_DARK = "#291525";
const IVORY = "#fff6df";
const KEY_SHADOW = "#d7c8b5";
const BLACK_KEY = "#17121b";
const TEAL = "#42b9b1";
const AQUA = "#91ded1";
const ROSE = "#d6819d";
const ROSE_DARK = "#873b66";
const ITALY_GREEN = "#13875d";
const ITALY_RED = "#c9434d";
const INK = "#2b172d";

const GOLD = metal("gilt", {
  polish: 0.9,
  tarnish: 0.08,
  verdigris: 0.04,
  size: 0.045,
  seed: 18,
});

const OLD_GOLD = metal("bronze", {
  polish: 0.28,
  tarnish: 0.36,
  verdigris: 0.12,
  size: 0.06,
  seed: 27,
});

const MOTHER_OF_PEARL = paint((p, n) => {
  const broad = noise(p, 0.18, 41);
  const fine = noise(p, 0.052, 73);
  const ribbon =
    0.5 +
    0.5 *
      Math.sin(
        p.x * 46 +
          p.y * 18 +
          p.z * 37 +
          broad * 5.8 +
          fine * 2.7,
      );
  const mint = Math.max(
    0,
    Math.min(1, ribbon * 0.58 + Math.max(n.y, 0) * 0.22),
  );
  const rose = Math.max(
    0,
    Math.min(1, 0.18 + fine * 0.34 + Math.max(n.z, 0) * 0.16),
  );
  let c = mix("#fff3df", "#a9e4d5", mint * 0.62);
  c = mix(c, "#e6a6c0", rose * 0.27);
  c = mix(c, "#fffdf3", Math.max(0, n.y) * 0.12);
  return c;
});

const PEARL_BLUE = paint((p, n) => {
  const a = noise(p, 0.11, 94);
  const wave = 0.5 + 0.5 * Math.sin(p.x * 38 + p.z * 51 + a * 5);
  let c = mix("#78d0c9", "#e7f4dc", wave * 0.8);
  c = mix(c, "#cf8ead", noise(p, 0.065, 105) * 0.25);
  return mix(c, "#ffffff", Math.max(0, n.y) * 0.13);
});

const IVORY_KEY = paint((p, n) => {
  const shade = 0.05 + noise(p, 0.09, 128) * 0.08;
  return mix("#fffdf1", "#e8d4bf", shade + Math.max(0, -n.y) * 0.08);
});

const BELLOW_CLOTH = paint((p, n) => {
  const stripe = 0.5 + 0.5 * Math.sin(p.y * 240 + p.z * 27);
  let c = mix(WINE_DARK, WINE, stripe * 0.72);
  c = mix(c, "#9c3f59", noise(p, 0.075, 143) * 0.2);
  return mix(c, "#1a111c", Math.max(0, -n.y) * 0.18);
});

const FLORAL_INLAY = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 240">
    <defs>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff1a5"/>
        <stop offset=".48" stop-color="#c89135"/>
        <stop offset="1" stop-color="#fff0a0"/>
      </linearGradient>
      <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#9bf0cf"/>
        <stop offset="1" stop-color="#168c86"/>
      </linearGradient>
    </defs>
    <g fill="none" stroke="url(#gold)" stroke-width="2.2" stroke-linecap="round">
      <path d="M60 228 C34 203 35 181 61 158 C83 138 85 112 60 91 C36 70 35 45 60 12"/>
      <path d="M59 158 C35 157 22 143 24 124 C42 125 54 135 59 148"/>
      <path d="M61 91 C87 91 99 77 97 58 C79 60 67 69 61 81"/>
      <path d="M60 228 C83 215 91 199 84 183 C72 188 64 198 60 211"/>
      <path d="M60 12 C40 25 32 40 39 55 C50 51 57 41 60 29"/>
      <path d="M23 121 Q60 107 97 121"/>
      <path d="M21 124 Q60 139 99 124"/>
    </g>
    <g fill="url(#leaf)" stroke="#d7fff0" stroke-width="1">
      <path d="M26 121 C13 111 11 98 17 89 C29 92 35 104 26 121Z"/>
      <path d="M94 121 C107 111 109 98 103 89 C91 92 85 104 94 121Z"/>
      <path d="M45 158 C29 169 26 183 34 191 C48 187 53 174 45 158Z"/>
      <path d="M75 91 C91 80 94 66 86 58 C72 62 67 75 75 91Z"/>
      <path d="M65 184 C79 174 82 162 75 154 C63 159 58 171 65 184Z"/>
      <path d="M52 59 C39 67 38 80 45 87 C57 82 61 70 52 59Z"/>
    </g>
    <g stroke="#e6a3bf" stroke-width="2" fill="#e6a3bf">
      <circle cx="60" cy="123" r="8"/>
      <circle cx="34" cy="190" r="5"/>
      <circle cx="86" cy="57" r="5"/>
    </g>
    <g fill="#fff9df">
      <circle cx="57" cy="120" r="2"/>
      <circle cx="63" cy="122" r="1.7"/>
      <circle cx="33" cy="188" r="1.4"/>
      <circle cx="85" cy="55" r="1.4"/>
    </g>
  </svg>`,
  { size: 512 },
);

const CREST_INLAY = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 90">
    <defs>
      <linearGradient id="shield" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff6df"/>
        <stop offset=".45" stop-color="#d6f3df"/>
        <stop offset="1" stop-color="#d68cac"/>
      </linearGradient>
      <linearGradient id="gold2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff4b0"/>
        <stop offset=".5" stop-color="#b57a28"/>
        <stop offset="1" stop-color="#ffe898"/>
      </linearGradient>
    </defs>
    <path d="M90 8 C61 8 39 18 27 34 C37 50 50 70 90 84 C130 70 143 50 153 34 C141 18 119 8 90 8Z"
      fill="url(#shield)" stroke="url(#gold2)" stroke-width="4"/>
    <path d="M90 20 C67 20 52 27 43 37 C55 51 68 61 90 70 C112 61 125 51 137 37 C128 27 113 20 90 20Z"
      fill="none" stroke="#2b9d91" stroke-width="2"/>
    <path d="M90 23 L90 67 M53 37 Q90 47 127 37" fill="none" stroke="#c9983c" stroke-width="2"/>
    <path d="M66 32 L79 39 L68 47 M114 32 L101 39 L112 47" fill="none" stroke="#d77999" stroke-width="3"/>
    <circle cx="90" cy="45" r="8" fill="#b43859" stroke="#fff3cf" stroke-width="2"/>
    <path d="M86 45 L90 38 L94 45 L90 52Z" fill="#fff3cf"/>
  </svg>`,
  { size: 384 },
);

const GRILLE_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 70">
    <g fill="none" stroke="#eac15d" stroke-width="3" opacity=".98">
      <path d="M-10 35 L20 5 L50 35 L80 5 L110 35 L140 5 L170 35"/>
      <path d="M-10 35 L20 65 L50 35 L80 65 L110 35 L140 65 L170 35"/>
      <path d="M5 5 L35 35 L5 65 M55 5 L85 35 L55 65 M105 5 L135 35 L105 65 M155 5 L185 35 L155 65"/>
    </g>
    <g fill="#f8e69a">
      <circle cx="20" cy="5" r="3"/>
      <circle cx="50" cy="35" r="3"/>
      <circle cx="80" cy="5" r="3"/>
      <circle cx="110" cy="35" r="3"/>
      <circle cx="140" cy="5" r="3"/>
    </g>
  </svg>`,
  { size: 384 },
);

const BELLOWS_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 240">
    <g fill="none" stroke-linecap="round">
      <path d="M-20 28 L140 -5 M-20 68 L140 35 M-20 108 L140 75 M-20 148 L140 115 M-20 188 L140 155 M-20 228 L140 195"
        stroke="#d2798c" stroke-width="4" opacity=".8"/>
      <path d="M-20 8 L140 -25 M-20 48 L140 15 M-20 88 L140 55 M-20 128 L140 95 M-20 168 L140 135 M-20 208 L140 175"
        stroke="#edb3a9" stroke-width="1.6" opacity=".72"/>
      <path d="M-20 34 L140 1 M-20 74 L140 41 M-20 114 L140 81 M-20 154 L140 121 M-20 194 L140 161 M-20 234 L140 201"
        stroke="#3e182c" stroke-width="2.4" opacity=".9"/>
    </g>
  </svg>`,
  { size: 384 },
);

const SIDE_INLAY = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 220">
    <defs>
      <radialGradient id="pearl">
        <stop offset="0" stop-color="#fff8e8"/>
        <stop offset=".45" stop-color="#8de0d2"/>
        <stop offset="1" stop-color="#ca739b"/>
      </radialGradient>
    </defs>
    <path d="M50 8 C31 35 26 61 38 87 C49 110 49 130 38 153 C28 175 32 196 50 212 C68 196 72 175 62 153 C51 130 51 110 62 87 C74 61 69 35 50 8Z"
      fill="none" stroke="#e7bb55" stroke-width="3"/>
    <path d="M50 25 C39 48 39 64 48 80 C55 92 55 104 50 118 C45 104 45 92 52 80 C61 64 61 48 50 25Z"
      fill="url(#pearl)" stroke="#fff1bf" stroke-width="1.5"/>
    <g fill="none" stroke="#51b8ad" stroke-width="2">
      <path d="M24 53 Q50 71 76 53"/>
      <path d="M22 163 Q50 145 78 163"/>
    </g>
    <g fill="#e7a2bb">
      <circle cx="23" cy="53" r="4"/>
      <circle cx="77" cy="53" r="4"/>
      <circle cx="22" cy="163" r="4"/>
      <circle cx="78" cy="163" r="4"/>
    </g>
  </svg>`,
  { size: 384 },
);

const LABEL_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 48">
    <defs>
      <linearGradient id="label" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#f8d37b"/>
        <stop offset=".45" stop-color="#fff1b1"/>
        <stop offset="1" stop-color="#bb8234"/>
      </linearGradient>
    </defs>
    <rect x="3" y="5" width="254" height="38" rx="18" fill="#31182c" stroke="url(#label)" stroke-width="3"/>
    <path d="M17 24 H243" stroke="#8b5b29" stroke-width="1" opacity=".7"/>
    <text x="130" y="30" text-anchor="middle" font-family="Georgia,serif" font-size="17"
      font-weight="bold" letter-spacing="3" fill="#ffeaa2">VENEZIA</text>
    <circle cx="22" cy="24" r="4" fill="#42b9b1"/>
    <circle cx="238" cy="24" r="4" fill="#d6819d"/>
  </svg>`,
  { size: 512 },
);

const ITALIAN_ROSETTE_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="43" fill="#2b172d" stroke="#efd27d" stroke-width="4"/>
    <path d="M50 10 A40 40 0 0 1 50 90 A40 40 0 0 1 50 10Z" fill="#13875d"/>
    <path d="M50 10 A40 40 0 0 1 50 90 A40 40 0 0 1 50 10Z" fill="#fff2d3" transform="rotate(120 50 50)"/>
    <path d="M50 10 A40 40 0 0 1 50 90 A40 40 0 0 1 50 10Z" fill="#c9434d" transform="rotate(240 50 50)"/>
    <circle cx="50" cy="50" r="18" fill="#f5d77f" stroke="#6f4426" stroke-width="3"/>
    <path d="M50 36 L54 46 L65 46 L56 53 L60 64 L50 57 L40 64 L44 53 L35 46 L46 46Z" fill="#6a2c4e"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({
    name: "italian-mother-of-pearl-piano-accordion",
    detail: 1,
    paintSize: 2048,
  });

  const GROUP_BODY = "accordion-body";
  const GROUP_TRIM = "gilded-trim";
  const GROUP_KEYS = "piano-keyboard";
  const GROUP_BASS = "bass-register";
  const GROUP_BELLOWS = "bellows";
  const GROUP_INLAY = "mother-of-pearl-inlay";

  const box = (
    size: [number, number, number],
    color: any,
    at: any,
    name: string,
    extra: any = {},
  ) =>
    b.part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      {
        at,
        name,
        group: GROUP_BODY,
        flat: true,
        ...extra,
      },
    );

  const sphere = (
    radius: number,
    color: any,
    at: any,
    name: string,
    extra: any = {},
  ) =>
    b.part(
      new THREE.SphereGeometry(radius, extra.segments ?? 8, extra.rows ?? 5),
      color,
      {
        at,
        name,
        group: GROUP_TRIM,
        flat: true,
        ...extra,
      },
    );

  const cylinder = (
    radius: number,
    depth: number,
    color: any,
    at: any,
    name: string,
    segments = 12,
    extra: any = {},
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, depth, segments, 1, false),
      color,
      {
        at,
        name,
        group: GROUP_TRIM,
        flat: true,
        dir: [0, 0, 1],
        axis: "y",
        ...extra,
      },
    );

  const planeTexture = (
    width: number,
    height: number,
    texture: THREE.Texture,
    at: any,
    name: string,
    dir: [number, number, number] = [0, 0, 1],
    up: [number, number, number] = [0, 1, 0],
    group = GROUP_INLAY,
  ) =>
    b.part(
      new THREE.PlaneGeometry(width, height),
      "#ffffff",
      {
        at,
        name,
        group,
        texture,
        dir,
        up,
        axis: "z",
      },
    );

  const torus = (
    major: number,
    minor: number,
    color: any,
    at: any,
    name: string,
    extra: any = {},
  ) =>
    b.part(
      new THREE.TorusGeometry(major, minor, extra.radialSegments ?? 6, extra.tubularSegments ?? 16),
      color,
      {
        at,
        name,
        group: GROUP_TRIM,
        flat: true,
        ...extra,
      },
    );

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: any,
    name: string,
    group = GROUP_TRIM,
  ) =>
    b.rod(a, c, radius, {
      color,
      name,
      group,
      caps: "round",
      sides: 6,
    });

  const curve = (
    points: [number, number, number][],
    radius: number,
    color: any,
    name: string,
    group = GROUP_TRIM,
  ) =>
    b.sweep(catmull(points), radius, {
      color,
      name,
      group,
      caps: "round",
      sides: 6,
    });

  const frontPanel = (
    x: number,
    y: number,
    width: number,
    height: number,
    name: string,
  ) => {
    box([0.164, 0.478, 0.014], DEEP_PLUM, [x, 0.31, 0.105], `${name}-dark-recess`);
    box([width, height, 0.012], MOTHER_OF_PEARL, [x, y, 0.115], `${name}-pearl-panel`);

    box([width + 0.012, 0.012, 0.014], GOLD, [x, y + height * 0.5 + 0.006, 0.126], `${name}-trim-top`);
    box([width + 0.012, 0.012, 0.014], GOLD, [x, y - height * 0.5 - 0.006, 0.126], `${name}-trim-bottom`);
    box([0.012, height, 0.014], GOLD, [x - width * 0.5 - 0.006, y, 0.126], `${name}-trim-left`);
    box([0.012, height, 0.014], GOLD, [x + width * 0.5 + 0.006, y, 0.126], `${name}-trim-right`);

    const studs = [
      [x - width * 0.5 - 0.004, y - height * 0.5 - 0.004],
      [x + width * 0.5 + 0.004, y - height * 0.5 - 0.004],
      [x - width * 0.5 - 0.004, y + height * 0.5 + 0.004],
      [x + width * 0.5 + 0.004, y + height * 0.5 + 0.004],
    ];
    studs.forEach(([sx, sy], i) => {
      sphere(0.006, GOLD, [sx, sy, 0.137], `${name}-corner-stud-${i}`, {
        segments: 7,
        rows: 4,
      });
    });
  };

  const rosette = (
    cx: number,
    cy: number,
    z: number,
    scale: number,
    name: string,
  ) => {
    const petalColors = [AQUA, ROSE, IVORY, TEAL, ROSE, AQUA];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const px = cx + Math.cos(angle) * scale * 1.15;
      const py = cy + Math.sin(angle) * scale * 1.15;
      sphere(scale * 0.62, petalColors[i], [px, py, z], `${name}-petal-${i}`, {
        scale: [0.62, 1.38, 0.36],
        rotation: [0, 0, (angle * 180) / Math.PI],
        segments: 7,
        rows: 4,
      });
    }
    cylinder(scale * 0.62, 0.006, GOLD, [cx, cy, z + 0.002], `${name}-gold-center`, 12);
    sphere(scale * 0.32, ROSE_DARK, [cx, cy, z + 0.007], `${name}-center-gem`, {
      segments: 8,
      rows: 5,
    });
  };

  const vine = (
    cx: number,
    cy: number,
    z: number,
    scale: number,
    name: string,
    mirror = 1,
  ) => {
    curve(
      [
        [cx, cy - 0.070 * scale, z],
        [cx + mirror * 0.028 * scale, cy - 0.040 * scale, z],
        [cx - mirror * 0.020 * scale, cy, z],
        [cx + mirror * 0.028 * scale, cy + 0.042 * scale, z],
        [cx, cy + 0.072 * scale, z],
      ],
      0.0022,
      GOLD,
      `${name}-stem`,
      GROUP_INLAY,
    );

    const leafData = [
      [-0.030, -0.038, -35],
      [0.028, -0.012, 45],
      [-0.030, 0.026, -45],
      [0.025, 0.052, 38],
    ];
    leafData.forEach(([dx, dy, rot], i) => {
      sphere(0.008 * scale, i % 2 ? TEAL : AQUA, [
        cx + mirror * dx * scale,
        cy + dy * scale,
        z + 0.002,
      ], `${name}-leaf-${i}`, {
        scale: [0.55, 1.45, 0.28],
        rotation: [0, 0, Number(rot) * mirror],
        segments: 7,
        rows: 4,
      });
    });
  };

  const shield = (x: number, y: number, z: number, name: string) => {
    b.extrude(
      [
        [0, -0.031],
        [-0.027, -0.014],
        [-0.024, 0.020],
        [0, 0.042],
        [0.024, 0.020],
        [0.027, -0.014],
      ],
      {
        at: [x, y, z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.006,
        bevel: 0.002,
        color: PEARL_BLUE,
        name,
        group: GROUP_INLAY,
      },
    );
    rod([x - 0.020, y - 0.006, z + 0.004], [x, y + 0.031, z + 0.004], 0.0015, GOLD, `${name}-left`);
    rod([x, y + 0.031, z + 0.004], [x + 0.020, y - 0.006, z + 0.004], 0.0015, GOLD, `${name}-right`);
    sphere(0.006, ROSE, [x, y + 0.006, z + 0.008], `${name}-jewel`, {
      segments: 8,
      rows: 5,
    });
  };

  const bassButton = (x: number, y: number, row: number, col: number) => {
    cylinder(0.0185, 0.008, OLD_GOLD, [x, y, 0.129], `bass-ring-${row}-${col}`, 12);
    cylinder(0.0135, 0.009, MOTHER_OF_PEARL, [x, y, 0.136], `bass-pearl-${row}-${col}`, 12, {
      group: GROUP_BASS,
    });
    torus(0.011, 0.0018, GOLD, [x, y, 0.142], `bass-bezel-${row}-${col}`, {
      radialSegments: 5,
      tubularSegments: 12,
      group: GROUP_BASS,
    });
    sphere(0.0026, "#fffdf2", [x - 0.003, y + 0.003, 0.145], `bass-glint-${row}-${col}`, {
      segments: 5,
      rows: 3,
      group: GROUP_BASS,
    });
  };

  // ---------------------------------------------------------------------------
  // Main mother-of-pearl cases and the recessed central bellows.

  const leftCaseX = 0.215;
  const rightCaseX = -0.215;

  box([0.18, 0.54, 0.19], MOTHER_OF_PEARL, [leftCaseX, 0.31, 0], "bass-case-shell");
  box([0.18, 0.54, 0.19], MOTHER_OF_PEARL, [rightCaseX, 0.31, 0], "treble-case-shell");

  box([0.235, 0.46, 0.115], BELLOW_CLOTH, [0, 0.31, -0.020], "bellows-core");
  planeTexture(0.222, 0.438, BELLOWS_TEXTURE, [0, 0.31, 0.040], "bellows-woven-front", [0, 0, 1], [0, 1, 0], GROUP_BELLOWS);

  frontPanel(leftCaseX, 0.31, 0.145, 0.445, "bass-front");
  frontPanel(rightCaseX, 0.31, 0.145, 0.445, "treble-front");

  planeTexture(0.112, 0.382, FLORAL_INLAY, [leftCaseX, 0.315, 0.124], "bass-floral-inlay");
  planeTexture(0.136, 0.060, CREST_INLAY, [rightCaseX, 0.544, 0.128], "treble-crest-inlay");

  for (const side of [1, -1]) {
    const x = side * 0.311;
    planeTexture(
      0.17,
      0.43,
      SIDE_INLAY,
      [x, 0.31, -0.005],
      `side-inlay-${side > 0 ? "left" : "right"}`,
      [side, 0, 0],
      [0, 1, 0],
      GROUP_INLAY,
    );

    rod(
      [x + side * 0.003, 0.095, -0.065],
      [x + side * 0.003, 0.525, -0.065],
      0.0024,
      GOLD,
      `side-gold-spine-${side}`,
      GROUP_TRIM,
    );
    rod(
      [x + side * 0.003, 0.095, 0.065],
      [x + side * 0.003, 0.525, 0.065],
      0.0024,
      GOLD,
      `side-gold-front-${side}`,
      GROUP_TRIM,
    );

    for (let i = 0; i < 4; i++) {
      const sy = 0.145 + i * 0.115;
      sphere(0.007, GOLD, [x + side * 0.006, sy, -0.069], `side-rivet-${side}-${i}`, {
        segments: 7,
        rows: 4,
      });
    }
  }

  // Bellows side guards and folded ridges.
  box([0.014, 0.462, 0.040], OLD_GOLD, [-0.120, 0.31, 0.082], "bellows-left-guard");
  box([0.014, 0.462, 0.040], OLD_GOLD, [0.120, 0.31, 0.082], "bellows-right-guard");
  box([0.232, 0.016, 0.048], OLD_GOLD, [0, 0.077, 0.070], "bellows-bottom-cap");
  box([0.232, 0.016, 0.048], OLD_GOLD, [0, 0.543, 0.070], "bellows-top-cap");

  for (let i = 0; i < 9; i++) {
    const y = 0.105 + i * 0.0515;
    const foldColor = i % 2 === 0 ? WINE : DEEP_PLUM;
    box([0.224, 0.028, 0.018], foldColor, [0, y, 0.093], `bellows-fold-${i}`, {
      group: GROUP_BELLOWS,
    });
    rod(
      [-0.108, y + 0.013, 0.105],
      [0.108, y - 0.013, 0.105],
      0.0017,
      GOLD,
      `bellows-diagonal-gold-${i}`,
      GROUP_BELLOWS,
    );
    rod(
      [-0.109, y, 0.107],
      [0.109, y, 0.107],
      0.0012,
      ROSE,
      `bellows-fold-highlight-${i}`,
      GROUP_BELLOWS,
    );
  }

  // Lower feet, small gilded toe plates, and the bottom case ledges.
  for (const side of [1, -1]) {
    const x = side * 0.215;
    box([0.115, 0.040, 0.145], DEEP_PLUM, [x, 0.020, 0], `foot-${side}`);
    box([0.088, 0.010, 0.015], GOLD, [x, 0.044, 0.076], `foot-front-plate-${side}`);
    box([0.155, 0.016, 0.024], OLD_GOLD, [x, 0.066, 0.094], `case-bottom-ledge-${side}`);
    sphere(0.008, GOLD, [x - side * 0.067, 0.074, 0.090], `bottom-corner-${side}-a`, {
      segments: 7,
      rows: 4,
    });
    sphere(0.008, GOLD, [x + side * 0.067, 0.074, 0.090], `bottom-corner-${side}-b`, {
      segments: 7,
      rows: 4,
    });
  }

  // ---------------------------------------------------------------------------
  // Bass register: fifteen pearl buttons, bezels, and an Italian emblem.

  const bassXs = [0.174, 0.215, 0.256];
  for (let row = 0; row < 5; row++) {
    const y = 0.155 + row * 0.067;
    for (let col = 0; col < bassXs.length; col++) {
      bassButton(bassXs[col], y, row, col);
    }
  }

  rosette(leftCaseX, 0.512, 0.139, 0.0145, "bass-upper-rosette");
  shield(leftCaseX, 0.100, 0.137, "bass-lower-shield");
  planeTexture(0.042, 0.042, ITALIAN_ROSETTE_TEXTURE, [leftCaseX, 0.513, 0.145], "bass-italian-medallion");

  vine(0.165, 0.475, 0.139, 0.63, "bass-vine-left", 1);
  vine(0.265, 0.475, 0.139, 0.63, "bass-vine-right", -1);

  // Tiny pearl studs form a crown around the bass emblem.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    sphere(
      0.0039,
      i % 2 ? AQUA : ROSE,
      [
        leftCaseX + Math.cos(a) * 0.033,
        0.512 + Math.sin(a) * 0.033,
        0.148,
      ],
      `bass-medallion-stud-${i}`,
      { segments: 6, rows: 3 },
    );
  }

  // ---------------------------------------------------------------------------
  // Treble keyboard and its gilded frame.

  box([0.150, 0.410, 0.018], DEEP_PLUM, [rightCaseX, 0.315, 0.123], "keyboard-bed", {
    group: GROUP_KEYS,
  });
  box([0.012, 0.386, 0.014], GOLD, [-0.286, 0.315, 0.178], "keyboard-outer-rail", {
    group: GROUP_KEYS,
  });
  box([0.012, 0.386, 0.014], GOLD, [-0.144, 0.315, 0.178], "keyboard-inner-rail", {
    group: GROUP_KEYS,
  });

  const keyStart = 0.143;
  const keySpacing = 0.0292;
  const whiteKeyCount = 13;

  for (let i = 0; i < whiteKeyCount; i++) {
    const y = keyStart + i * keySpacing;
    box(
      [0.116, 0.024, 0.046],
      i % 3 === 0 ? IVORY_KEY : IVORY,
      [rightCaseX, y, 0.153],
      `white-key-${i + 1}`,
      { group: GROUP_KEYS },
    );
    rod(
      [-0.271, y - 0.0132, 0.178],
      [-0.159, y - 0.0132, 0.178],
      0.0011,
      KEY_SHADOW,
      `white-key-seam-${i + 1}`,
      GROUP_KEYS,
    );
  }

  const blackKeyPositions = [0, 1, 3, 4, 5, 7, 8, 10, 11];
  for (let i = 0; i < blackKeyPositions.length; i++) {
    const whiteIndex = blackKeyPositions[i];
    const y = keyStart + (whiteIndex + 0.5) * keySpacing;
    box(
      [0.076, 0.0145, 0.021],
      BLACK_KEY,
      [-0.204, y, 0.181],
      `black-key-${i + 1}`,
      { group: GROUP_KEYS },
    );
    sphere(0.003, "#70606d", [-0.226, y + 0.002, 0.193], `black-key-glint-${i + 1}`, {
      segments: 6,
      rows: 3,
      group: GROUP_KEYS,
    });
  }

  // Decorative grille above the keys.
  box([0.144, 0.070, 0.014], DEEP_PLUM, [rightCaseX, 0.542, 0.119], "keyboard-upper-grille");
  planeTexture(0.124, 0.050, GRILLE_TEXTURE, [rightCaseX, 0.542, 0.128], "keyboard-gold-grille");
  box([0.151, 0.010, 0.016], GOLD, [rightCaseX, 0.584, 0.122], "keyboard-top-gold-cap");
  box([0.010, 0.076, 0.016], GOLD, [-0.290, 0.542, 0.122], "keyboard-grille-left-cap");
  box([0.010, 0.076, 0.016], GOLD, [-0.140, 0.542, 0.122], "keyboard-grille-right-cap");

  // Three register switches sit above the keyboard like little pearl-capped pistons.
  for (let i = 0; i < 3; i++) {
    const x = -0.263 + i * 0.048;
    cylinder(0.010, 0.013, OLD_GOLD, [x, 0.591, 0.130], `register-switch-base-${i}`, 10, {
      group: GROUP_KEYS,
    });
    cylinder(0.0075, 0.012, PEARL_BLUE, [x, 0.599, 0.130], `register-switch-pearl-${i}`, 10, {
      group: GROUP_KEYS,
    });
    sphere(0.002, "#ffffff", [x - 0.002, 0.604, 0.134], `register-switch-glint-${i}`, {
      segments: 5,
      rows: 3,
      group: GROUP_KEYS,
    });
  }

  vine(-0.215, 0.095, 0.139, 0.72, "keyboard-lower-vine", 1);
  rosette(-0.215, 0.095, 0.141, 0.0125, "keyboard-lower-rosette");

  // ---------------------------------------------------------------------------
  // Central Italian maker's plaque and tricolour accent.

  planeTexture(0.185, 0.034, LABEL_TEXTURE, [0, 0.563, 0.131], "maker-label");
  const flagX = [-0.027, 0, 0.027];
  const flagColors = [ITALY_GREEN, IVORY, ITALY_RED];
  for (let i = 0; i < 3; i++) {
    box([0.018, 0.022, 0.004], flagColors[i], [flagX[i], 0.563, 0.151], `italian-flag-${i}`, {
      group: GROUP_INLAY,
    });
  }

  // Fine gold scrollwork bridges the two case fronts without hiding the bellows.
  curve(
    [
      [-0.112, 0.548, 0.132],
      [-0.073, 0.566, 0.133],
      [-0.029, 0.551, 0.133],
      [0, 0.565, 0.133],
      [0.029, 0.551, 0.133],
      [0.073, 0.566, 0.133],
      [0.112, 0.548, 0.132],
    ],
    0.002,
    GOLD,
    "top-connecting-scroll",
    GROUP_INLAY,
  );

  // ---------------------------------------------------------------------------
  // Mother-of-pearl corner ornaments and tiny iridescent highlights.

  for (const side of [1, -1]) {
    const x = side * 0.215;
    for (let i = 0; i < 4; i++) {
      const y = 0.145 + i * 0.115;
      sphere(
        0.0045,
        i % 2 ? PEARL_BLUE : MOTHER_OF_PEARL,
        [x + side * 0.071, y, 0.141],
        `case-edge-pearl-${side}-${i}`,
        { segments: 7, rows: 4 },
      );
    }
    for (let i = 0; i < 3; i++) {
      const y = 0.205 + i * 0.125;
      rod(
        [x - side * 0.069, y, 0.140],
        [x + side * 0.069, y + side * 0.013, 0.140],
        0.0014,
        GOLD,
        `case-cross-inlay-${side}-${i}`,
        GROUP_INLAY,
      );
    }
  }

  // Floral corner pieces on the visible front corners.
  const cornerOrnaments = [
    [0.154, 0.536, "bass-top-left"],
    [0.276, 0.536, "bass-top-right"],
    [-0.276, 0.112, "treble-bottom-left"],
    [-0.154, 0.112, "treble-bottom-right"],
  ];
  cornerOrnaments.forEach(([x, y, name], i) => {
    rosette(Number(x), Number(y), 0.141, 0.0085, String(name));
    sphere(0.003, i % 2 ? AQUA : ROSE, [Number(x), Number(y), 0.151], `${name}-highlight`, {
      segments: 6,
      rows: 3,
    });
  });

  // ---------------------------------------------------------------------------
  // Top strap anchors and compact gold hardware.

  for (const side of [1, -1]) {
    const x = side * 0.245;
    box([0.050, 0.014, 0.026], DEEP_PLUM, [x, 0.589, -0.005], `strap-anchor-${side}`);
    box([0.028, 0.008, 0.030], GOLD, [x, 0.598, -0.005], `strap-buckle-${side}`);

    curve(
      [
        [side * 0.256, 0.596, 0.031],
        [side * 0.285, 0.606, 0.004],
        [side * 0.256, 0.596, -0.031],
      ],
      0.0032,
      OLD_GOLD,
      `strap-loop-${side}`,
      GROUP_TRIM,
    );

    sphere(0.006, GOLD, [side * 0.291, 0.557, 0.078], `top-side-jewel-${side}`, {
      segments: 7,
      rows: 4,
    });
  }

  // A final ring of pearl studs around each case's top edge.
  for (const side of [1, -1]) {
    const x = side * 0.215;
    for (let i = 0; i < 5; i++) {
      const px = x - 0.055 + i * 0.0275;
      sphere(0.0033, i % 2 ? AQUA : ROSE, [px, 0.574, 0.139], `top-pearl-${side}-${i}`, {
        segments: 6,
        rows: 3,
      });
    }
  }

  return b.root;
}
