```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Neon Vector 1980s Arcade Cabinet",
  description:
    "A stylized synthwave 1980s upright arcade cabinet with a glowing marquee, CRT screen, control deck, joystick, buttons, coin door, side neon trim, and retro vector graphics.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "neon-arcade-cabinet", detail: 1 });

  const INK = "#09091c";
  const BODY = "#14152d";
  const BODY2 = "#202047";
  const BLACK = "#03030a";
  const PURPLE = "#54269c";
  const VIOLET = "#8b35d1";
  const MAGENTA = "#ff2fa8";
  const PINK = "#ff76d5";
  const CYAN = "#25eaff";
  const BLUE = "#2779ff";
  const ORANGE = "#ff8b38";
  const YELLOW = "#ffd34e";
  const WHITE = "#effcff";
  const STEEL = "#777da8";
  const DARK_STEEL = "#292c4a";
  const COIN = "#ffbd4a";

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    options: any = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      ...options,
    });

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    options: any = {},
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, height, options.segments ?? 10),
      color,
      { at, ...options },
    );

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    options: any = {},
  ) =>
    b.part(new THREE.SphereGeometry(radius, options.segments ?? 10, options.rings ?? 6), color, {
      at,
      ...options,
    });

  const neonRod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
  ) => glow(b.rod(a, z, radius, { color }), 2.2);

  const frontPlane = (
    width: number,
    height: number,
    color: string,
    at: [number, number, number],
    texture?: THREE.Texture,
  ) =>
    b.part(new THREE.PlaneGeometry(width, height), color, {
      at,
      dir: [0, 0, 1],
      axis: "z",
      texture,
    });

  const marqueeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 180">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#160d46"/>
          <stop offset=".48" stop-color="#6c168f"/>
          <stop offset="1" stop-color="#f52ca9"/>
        </linearGradient>
        <filter id="g">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="640" height="180" rx="20" fill="url(#bg)" stroke="#28efff" stroke-width="8"/>
      <path d="M0 140 L110 30 L190 105 L285 18 L390 125 L480 38 L640 145" fill="none" stroke="#ff65d1" stroke-width="6" opacity=".8"/>
      <path d="M0 160 L100 60 L180 135 L280 42 L390 150 L480 62 L640 160" fill="none" stroke="#24eaff" stroke-width="3"/>
      <text x="320" y="112" text-anchor="middle" font-family="Arial Black, sans-serif" font-style="italic" font-size="74" font-weight="900" fill="#fff7ff" stroke="#ff2fa8" stroke-width="8" paint-order="stroke" filter="url(#g)">NIGHT//DRIVE</text>
      <text x="320" y="151" text-anchor="middle" font-family="monospace" font-size="17" letter-spacing="8" fill="#bffcff">INSERT COIN • INSERT COIN</text>
    </svg>`,
    { size: 512 },
  );

  const screenTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 430">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="#09052a"/>
          <stop offset=".5" stop-color="#241065"/>
          <stop offset="1" stop-color="#e5229d"/>
        </linearGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <rect width="512" height="430" fill="url(#sky)"/>
      <circle cx="370" cy="112" r="62" fill="#ff9d42" opacity=".9" filter="url(#blur)"/>
      <circle cx="370" cy="112" r="50" fill="#ffd05a"/>
      <path d="M0 300 Q120 220 240 300 T512 280 L512 430 L0 430Z" fill="#0a0631"/>
      <path d="M0 317 Q110 240 240 317 T512 298" fill="none" stroke="#ff38b7" stroke-width="6"/>
      <path d="M0 338 Q125 264 250 337 T512 319" fill="none" stroke="#602eff" stroke-width="4"/>
      <g stroke="#27eaff" stroke-width="2" opacity=".8">
        <path d="M256 310 L256 430 M256 310 L70 430 M256 310 L140 430 M256 310 L372 430 M256 310 L455 430"/>
        <path d="M190 340 L322 340 M155 370 L358 370 M110 405 L410 405"/>
      </g>
      <path d="M55 263 L105 208 L155 263 L205 208 L255 263 L305 208 L355 263 L405 208 L455 263" fill="none" stroke="#ffffff" stroke-width="5"/>
      <text x="256" y="73" text-anchor="middle" font-family="monospace" font-size="28" font-weight="bold" fill="#fff">VECTOR RUNNER</text>
      <text x="256" y="105" text-anchor="middle" font-family="monospace" font-size="14" fill="#25eaff">HIGH SCORE 008840</text>
      <path d="M0 0H512V430H0Z" fill="none" stroke="#ff9de4" stroke-width="2" opacity=".35"/>
      <path d="M0 8H512 M0 18H512 M0 28H512 M0 38H512 M0 48H512 M0 58H512 M0 68H512 M0 78H512 M0 88H512 M0 98H512 M0 108H512 M0 118H512 M0 128H512 M0 138H512 M0 148H512 M0 158H512 M0 168H512 M0 178H512 M0 188H512 M0 198H512 M0 208H512 M0 218H512 M0 228H512 M0 238H512 M0 248H512 M0 258H512 M0 268H512 M0 278H512 M0 288H512 M0 298H512 M0 308H512 M0 318H512 M0 328H512 M0 338H512 M0 348H512 M0 358H512 M0 368H512 M0 378H512 M0 388H512 M0 398H512 M0 408H512 M0 418H512" stroke="#ffffff" stroke-width="1" opacity=".09"/>
    </svg>`,
    { size: 512 },
  );

  const coinTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220">
      <rect width="160" height="220" rx="13" fill="#202346" stroke="#ff2fa8" stroke-width="6"/>
      <rect x="13" y="13" width="134" height="194" rx="8" fill="#0a0c1d" stroke="#25eaff" stroke-width="3"/>
      <circle cx="80" cy="71" r="25" fill="#ffbd4a" stroke="#fff0a0" stroke-width="5"/>
      <circle cx="80" cy="71" r="13" fill="#7d4a21"/>
      <rect x="43" y="119" width="74" height="15" rx="4" fill="#ffbd4a"/>
      <rect x="53" y="153" width="54" height="10" rx="3" fill="#25eaff"/>
      <text x="80" y="190" text-anchor="middle" font-family="monospace" font-size="13" fill="#ff76d5">COIN</text>
    </svg>`,
    { size: 256 },
  );

  // Main cabinet shell. The feet touch y = 0.
  box([0.78, 1.46, 0.58], BODY, [0, 0.86, 0], { name: "cabinet.shell" });
  box([0.70, 0.14, 0.56], BLACK, [0, 0.14, 0.015], { name: "cabinet.plinth" });
  box([0.83, 0.10, 0.62], PURPLE, [0, 0.055, 0], { name: "cabinet.base" });
  box([0.72, 0.08, 0.52], INK, [0, 0.205, 0.02], { name: "cabinet.base.shadow" });

  // Broad side silhouettes give the cabinet its unmistakable wedge profile.
  const sideOutline: [number, number, "sharp"][] = [
    [-0.30, 0.10, "sharp"],
    [0.30, 0.10, "sharp"],
    [0.30, 1.64, "sharp"],
    [0.22, 1.76, "sharp"],
    [-0.28, 1.76, "sharp"],
    [-0.30, 1.62, "sharp"],
  ];

  for (const s of [-1, 1]) {
    b.extrude(sideOutline, {
      at: [s * 0.405, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.008,
      color: s > 0 ? BODY2 : PURPLE,
      name: `side.panel.${s}`,
    });

    neonRod(
      [s * 0.425, 0.22, -0.285],
      [s * 0.425, 1.56, -0.285],
      0.012,
      MAGENTA,
    );
    neonRod(
      [s * 0.425, 1.56, -0.285],
      [s * 0.425, 1.71, -0.16],
      0.011,
      CYAN,
    );
    neonRod(
      [s * 0.425, 0.22, 0.285],
      [s * 0.425, 1.50, 0.285],
      0.007,
      BLUE,
    );

    // Side panel angular synthwave graphics.
    b.extrude(
      [
        [0.03, 0.38],
        [0.22, 0.62],
        [0.11, 0.68],
        [0.26, 0.91],
        [0.05, 0.79],
        [-0.09, 0.50],
      ],
      {
        at: [s * 0.428, 0, -0.02],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.008,
        color: MAGENTA,
        name: `side.lightning.${s}`,
      },
    );
    b.extrude(
      [
        [-0.22, 0.28],
        [-0.05, 0.48],
        [-0.16, 0.53],
        [-0.02, 0.72],
        [-0.25, 0.55],
      ],
      {
        at: [s * 0.431, 0, 0.01],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.009,
        color: CYAN,
        name: `side.chevron.${s}`,
      },
    );
  }

  // Upper fascia and the recessed CRT.
  box([0.69, 0.66, 0.075], INK, [0, 1.19, 0.315], { name: "screen.recess" });
  box([0.61, 0.55, 0.028], PURPLE, [0, 1.19, 0.362], { name: "screen.bezel" });
  frontPlane(0.535, 0.445, "#ffffff", [0, 1.205, 0.381], screenTexture);

  // CRT frame bevels.
  box([0.035, 0.57, 0.045], MAGENTA, [-0.323, 1.19, 0.392]);
  box([0.035, 0.57, 0.045], CYAN, [0.323, 1.19, 0.394]);
  box([0.66, 0.035, 0.045], CYAN, [0, 1.485, 0.394]);
  box([0.66, 0.035, 0.045], MAGENTA, [0, 0.895, 0.394]);
  neonRod([-0.30, 0.93, 0.42], [-0.30, 1.45, 0.42], 0.006, BLUE);
  neonRod([0.30, 0.93, 0.42], [0.30, 1.45, 0.42], 0.006, PINK);

  // Tiny screen status lights.
  cyl(0.012, 0.01, CYAN, [-0.245, 0.855, 0.425]);
  cyl(0.012, 0.01, MAGENTA, [-0.205, 0.855, 0.425]);
  cyl(0.012, 0.01, YELLOW, [-0.165, 0.855, 0.425]);
  box([0.17, 0.014, 0.012], STEEL, [0.145, 0.855, 0.425]);

  // Marquee housing and glowing sign.
  box([0.77, 0.19, 0.15], INK, [0, 1.72, 0.10], { name: "marquee.housing" });
  box([0.72, 0.13, 0.025], PURPLE, [0, 1.72, 0.185]);
  const marquee = frontPlane(0.66, 0.112, "#ffffff", [0, 1.72, 0.205], marqueeTexture);
  glow(marquee, 1.8);
  neonRod([-0.37, 1.64, 0.225], [0.37, 1.64, 0.225], 0.009, CYAN);
  neonRod([-0.37, 1.80, 0.225], [0.37, 1.80, 0.225], 0.009, MAGENTA);

  // Small roof cap and antenna-like corner highlights.
  box([0.72, 0.035, 0.56], BODY2, [0, 1.835, 0], { name: "cabinet.top.cap" });
  neonRod([-0.34, 1.855, -0.23], [-0.34, 1.855, 0.23], 0.006, CYAN);
  neonRod([0.34, 1.855, -0.23], [0.34, 1.855, 0.23], 0.006, MAGENTA);

  // Sloped control deck, kept chunky and puppet-like.
  box([0.74, 0.14, 0.33], BODY2, [0, 0.735, 0.205], {
    rotation: [-10, 0, 0],
    name: "control.deck",
  });
  box([0.67, 0.027, 0.27], INK, [0, 0.805, 0.285], {
    rotation: [-10, 0, 0],
    name: "control.deck.top",
  });
  neonRod([-0.35, 0.83, 0.30], [0.35, 0.83, 0.30], 0.009, MAGENTA);
  neonRod([-0.36, 0.70, 0.105], [-0.36, 0.82, 0.30], 0.006, CYAN);
  neonRod([0.36, 0.70, 0.105], [0.36, 0.82, 0.30], 0.006, CYAN);

  // Joystick: chrome shaft, magenta collar, cyan ball.
  cyl(0.028, 0.16, STEEL, [-0.19, 0.925, 0.265], { segments: 8 });
  cyl(0.052, 0.018, MAGENTA, [-0.19, 0.846, 0.265], { segments: 10 });
  glow(sphere(0.062, MAGENTA, [-0.19, 1.02, 0.265], { segments: 10, rings: 6 }), 2.1);
  sphere(0.023, WHITE, [-0.208, 1.045, 0.301], { segments: 8, rings: 5 });

  // Button wells.
  for (const x of [-0.02, 0.08, 0.18, 0.28]) {
    cyl(0.043, 0.012, DARK_STEEL, [x, 0.848, 0.27], { segments: 10 });
  }

  // Four glowing action buttons with little highlights.
  const buttonData: [number, string][] = [
    [-0.02, CYAN],
    [0.08, MAGENTA],
    [0.18, YELLOW],
    [0.28, ORANGE],
  ];
  for (const [x, c] of buttonData) {
    glow(cyl(0.031, 0.025, c, [x, 0.872, 0.27], { segments: 10 }), 1.8);
    sphere(0.010, WHITE, [x - 0.010, 0.891, 0.285], { segments: 6, rings: 4 });
  }

  // Start/select buttons.
  cyl(0.023, 0.018, DARK_STEEL, [-0.275, 0.856, 0.27], { segments: 8 });
  cyl(0.018, 0.023, CYAN, [-0.275, 0.878, 0.27], { segments: 8 });
  cyl(0.023, 0.018, DARK_STEEL, [0.35, 0.856, 0.27], { segments: 8 });
  cyl(0.018, 0.023, MAGENTA, [0.35, 0.878, 0.27], { segments: 8 });

  // Control panel labels as tiny neon bars.
  box([0.095, 0.012, 0.006], CYAN, [-0.23, 0.895, 0.293]);
  box([0.095, 0.012, 0.006], MAGENTA, [0.335, 0.895, 0.293]);
  box([0.055, 0.008, 0.005], WHITE, [-0.23, 0.910, 0.294]);
  box([0.055, 0.008, 0.005], WHITE, [0.335, 0.910, 0.294]);

  // Front lower coin door surround.
  box([0.40, 0.47, 0.045], PURPLE, [0, 0.445, 0.315], { name: "coin.door.frame" });
  box([0.34, 0.40, 0.022], BLACK, [0, 0.445, 0.347], { name: "coin.door.recess" });
  const coinDoor = frontPlane(0.255, 0.35, "#ffffff", [0, 0.445, 0.363], coinTexture);
  glow(coinDoor, 0.75);

  // Coin return and service hardware.
  box([0.095, 0.018, 0.018], DARK_STEEL, [0, 0.282, 0.378]);
  box([0.072, 0.009, 0.012], CYAN, [0, 0.286, 0.390]);
  cyl(0.034, 0.014, COIN, [-0.095, 0.575, 0.380], { segments: 12 });
  cyl(0.034, 0.014, COIN, [0.095, 0.575, 0.380], { segments: 12 });
  cyl(0.014, 0.020, STEEL, [0, 0.575, 0.382], { segments: 8 });
  box([0.13, 0.012, 0.012], MAGENTA, [0, 0.625, 0.382]);
  box([0.08, 0.008, 0.010], WHITE, [0, 0.645, 0.383]);

  // Lower front edge trim.
  neonRod([-0.34, 0.225, 0.365], [0.34, 0.225, 0.365], 0.008, BLUE);
  neonRod([-0.34, 0.665, 0.37], [-0.34, 0.215, 0.37], 0.006, MAGENTA);
  neonRod([0.34, 0.665, 0.37], [0.34, 0.215, 0.37], 0.006, CYAN);

  // Decorative vent slats under the screen.
  for (let i = -4; i <= 4; i++) {
    const slat = box([0.018, 0.105, 0.012], i % 2 ? MAGENTA : CYAN, [i * 0.036, 0.765, 0.355], {
      rotation: [0, 0, i * 2.5],
    });
    if (i % 2 === 0) glow(slat, 1.25);
  }

  // Speaker grille and radial speaker cones.
  box([0.42, 0.11, 0.025], BLACK, [0, 1.585, 0.31], { name: "speaker.grille" });
  for (let i = -5; i <= 5; i++) {
    box([0.012, 0.075, 0.012], i % 2 ? PURPLE : VIOLET, [i * 0.032, 1.585, 0.332]);
  }
  for (const x of [-0.16, 0, 0.16]) {
    cyl(0.035, 0.012, DARK_STEEL, [x, 1.585, 0.345], { dir: [0, 0, 1], segments: 12 });
    cyl(0.018, 0.014, MAGENTA, [x, 1.585, 0.355], { dir: [0, 0, 1], segments: 10 });
  }

  // Bolts around cabinet front and side panels.
  for (const x of [-0.34, 0.34]) {
    for (const y of [0.245, 0.70, 1.53, 1.80]) {
      cyl(0.012, 0.008, STEEL, [x, y, 0.382], { dir: [0, 0, 1], segments: 8 });
      sphere(0.004, WHITE, [x - 0.004, y + 0.004, 0.389], { segments: 5, rings: 3 });
    }
  }

  // Four squat feet keep the machine planted on the floor.
  for (const x of [-0.30, 0.30]) {
    for (const z of [-0.20, 0.20]) {
      box([0.12, 0.045, 0.12], BLACK, [x, 0.0225, z], { name: "rubber.foot" });
      cyl(0.037, 0.012, MAGENTA, [x, 0.05, z], { segments: 8 });
    }
  }

  // A few exposed neon cables and side rivets sell the hand-built arcade-machine silhouette.
  neonRod([-0.405, 0.34, -0.23], [-0.405, 0.58, -0.23], 0.004, CYAN);
  neonRod([0.405, 0.38, -0.23], [0.405, 0.62, -0.23], 0.004, MAGENTA);

  for (const s of [-1, 1]) {
    for (const y of [0.31, 0.47, 0.93, 1.28, 1.48]) {
      sphere(0.011, STEEL, [s * 0.438, y, -0.12], { segments: 6, rings: 4 });
      sphere(0.006, WHITE, [s * 0.442, y + 0.004, -0.13], { segments: 5, rings: 3 });
    }
  }

  return b.root;
}
```