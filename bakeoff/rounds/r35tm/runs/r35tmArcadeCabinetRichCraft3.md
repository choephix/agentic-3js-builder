```ts
import * as THREE from "three";
import { createBuilder, rng, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Neon Vector 1984",
  description:
    "A stylized 1980s synthwave arcade cabinet with a glowing CRT, marquee, joystick, buttons, side neon, vents, coin door, and pixel-inspired decals.",
};

export default function build() {
  const b = createBuilder({ name: "neonVector1984", detail: 1 });

  const BLACK = "#09091a";
  const INK = "#17132d";
  const CABINET = "#211a42";
  const CABINET_LIT = "#342264";
  const PURPLE = "#6b2fa6";
  const PINK = "#ff2c91";
  const MAGENTA = "#e633d7";
  const CYAN = "#22e6ff";
  const BLUE = "#397bff";
  const ORANGE = "#ff914d";
  const YELLOW = "#ffd447";
  const WHITE = "#fff6df";
  const STEEL = "#51506c";
  const DARK_STEEL = "#25253c";
  const GLASS = "#08152e";
  const GREEN = "#55f0bc";

  const rand = rng(1984);

  const marqueeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 260">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#120b36"/>
          <stop offset=".5" stop-color="#40206e"/>
          <stop offset="1" stop-color="#090b2c"/>
        </linearGradient>
        <linearGradient id="letters" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff8c8"/>
          <stop offset=".34" stop-color="#ff81cf"/>
          <stop offset="1" stop-color="#ff176d"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="7" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="900" height="260" rx="22" fill="url(#bg)" stroke="#ff35ba" stroke-width="12"/>
      <path d="M20 210 Q180 115 335 190 T650 150 T880 100" fill="none" stroke="#24eaff" stroke-width="5" opacity=".8"/>
      <path d="M10 232 Q180 137 335 212 T650 172 T890 122" fill="none" stroke="#ff2f9b" stroke-width="3"/>
      <g filter="url(#glow)" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-style="italic">
        <text x="450" y="157" font-size="112" fill="#ff176d" stroke="#24134c" stroke-width="18" paint-order="stroke">NEON</text>
        <text x="450" y="157" font-size="112" fill="url(#letters)" stroke="#fff0d2" stroke-width="3">NEON</text>
        <text x="450" y="220" font-size="39" letter-spacing="13" fill="#26eaff">VECTOR 84</text>
      </g>
      <circle cx="75" cy="65" r="5" fill="#fff" opacity=".8"/>
      <circle cx="810" cy="52" r="4" fill="#fff" opacity=".8"/>
      <circle cx="745" cy="84" r="2.5" fill="#fff"/>
    </svg>`,
    { size: 512 },
  );

  const screenTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 450">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#090d43"/>
          <stop offset=".55" stop-color="#162d77"/>
          <stop offset="1" stop-color="#ee276e"/>
        </linearGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <rect width="640" height="450" fill="url(#sky)"/>
      <circle cx="470" cy="130" r="76" fill="#ffcf56" opacity=".9" filter="url(#soft)"/>
      <circle cx="470" cy="130" r="62" fill="#ffea89"/>
      <path d="M0 265 L90 250 L135 275 L220 220 L295 268 L375 235 L445 270 L535 224 L640 260 L640 450 L0 450Z" fill="#141453"/>
      <path d="M0 292 L640 292" stroke="#ff3cbd" stroke-width="5"/>
      <g stroke="#31e9ff" stroke-width="3" opacity=".9">
        <path d="M0 315H640M0 345H640M0 380H640M0 420H640"/>
        <path d="M320 292L320 450M255 292L205 450M385 292L435 450M185 292L70 450M455 292L570 450"/>
      </g>
      <g fill="none" stroke="#ffef9b" stroke-width="7" stroke-linejoin="round">
        <path d="M150 230 L205 175 L270 230 L330 145 L390 230 L450 185 L500 230"/>
        <path d="M218 201 L270 230 L330 145 L370 210"/>
      </g>
      <text x="25" y="43" font-family="monospace" font-weight="bold" font-size="23" fill="#5dffff">STAGE 01</text>
      <text x="492" y="43" font-family="monospace" font-weight="bold" font-size="23" fill="#ff75cf">000420</text>
      <path d="M25 404 Q120 370 205 402 T390 397 T615 390" stroke="#fff" stroke-width="4" fill="none"/>
    </svg>`,
    { size: 512 },
  );

  const sideTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 700">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#29144e"/><stop offset=".5" stop-color="#12163f"/><stop offset="1" stop-color="#39104c"/>
        </linearGradient>
      </defs>
      <rect width="240" height="700" fill="url(#g)"/>
      <path d="M-40 540 L275 180 M-20 630 L260 310 M-60 430 L220 90" stroke="#ff249b" stroke-width="10" opacity=".72"/>
      <path d="M-40 555 L275 195 M-20 645 L260 325 M-60 445 L220 105" stroke="#28eaff" stroke-width="3"/>
      <circle cx="125" cy="350" r="72" fill="none" stroke="#ff48c4" stroke-width="5" opacity=".7"/>
      <circle cx="125" cy="350" r="45" fill="none" stroke="#29eaff" stroke-width="3"/>
      <path d="M125 280 L137 337 L185 350 L137 363 L125 420 L113 363 L65 350 L113 337Z" fill="#ffde64" opacity=".9"/>
    </svg>`,
    { size: 384 },
  );

  const coinTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 220">
      <rect width="180" height="220" rx="12" fill="#141428" stroke="#4c4b73" stroke-width="8"/>
      <rect x="30" y="27" width="120" height="35" rx="8" fill="#292944" stroke="#77749d" stroke-width="4"/>
      <rect x="43" y="36" width="94" height="15" rx="5" fill="#05050f"/>
      <circle cx="90" cy="112" r="29" fill="#b46dff" stroke="#ffe18b" stroke-width="7"/>
      <circle cx="90" cy="112" r="17" fill="#47236f" stroke="#f7b2ff" stroke-width="3"/>
      <path d="M70 165 H110 L120 186 H60Z" fill="#ff2c91"/>
      <text x="90" y="207" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="15" fill="#55f0bc">INSERT</text>
    </svg>`,
    { size: 256 },
  );

  const ventTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100">
      <rect width="300" height="100" rx="12" fill="#101020"/>
      <g stroke="#31eaff" stroke-width="10" stroke-linecap="round" opacity=".85">
        <path d="M25 15L75 85M75 15L125 85M125 15L175 85M175 15L225 85M225 15L275 85"/>
      </g>
      <g stroke="#ff269f" stroke-width="3" opacity=".8">
        <path d="M25 15L75 85M75 15L125 85M125 15L175 85M175 15L225 85M225 15L275 85"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    options: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      ...options,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    segments = 12,
    options: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      ...options,
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    options: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      at,
      ...options,
    });

  const neonRod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) => glow(b.rod(a, c, radius, { color, caps: "round", sides: 6 }), 2.2);

  // Main dark carcass, deliberately chunky and slightly overbuilt.
  box([0.72, 1.38, 0.52], [0, 0.79, -0.015], CABINET);
  box([0.67, 0.58, 0.48], [0, 1.49, 0.045], CABINET_LIT);
  box([0.70, 0.40, 0.52], [0, 0.34, -0.01], BLACK);

  // Side panels with the classic arcade profile: tall marquee, sloping control area, square foot.
  const panelOutline: [number, number, "sharp"][] = [
    [-0.30, 0.06, "sharp"],
    [-0.30, 1.48, "sharp"],
    [-0.18, 1.72, "sharp"],
    [0.20, 1.72, "sharp"],
    [0.30, 1.59, "sharp"],
    [0.30, 0.06, "sharp"],
  ];

  for (const s of [-1, 1]) {
    const side = b.extrude(panelOutline, {
      at: [s * 0.375, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.008,
      color: CABINET_LIT,
      name: `sidePanel${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.PlaneGeometry(0.50, 1.46), "#ffffff", {
      at: [s * 0.403, 0.80, 0.015],
      dir: [s, 0, 0],
      axis: "z",
      texture: sideTexture,
      name: `sideArt${s > 0 ? "L" : "R"}`,
    });

    // Side silhouette neon piping, broken into readable primitive segments.
    neonRod([s * 0.407, 0.08, -0.305], [s * 0.407, 1.48, -0.305], 0.009, PINK);
    neonRod([s * 0.407, 1.48, -0.305], [s * 0.407, 1.72, -0.18], 0.009, CYAN);
    neonRod([s * 0.407, 1.72, -0.18], [s * 0.407, 1.72, 0.20], 0.009, PINK);
    neonRod([s * 0.407, 1.72, 0.20], [s * 0.407, 1.59, 0.30], 0.009, CYAN);
    neonRod([s * 0.407, 1.59, 0.30], [s * 0.407, 0.06, 0.30], 0.009, PINK);
  }

  // Lower kick plate and feet.
  box([0.73, 0.10, 0.54], [0, 0.105, -0.01], DARK_STEEL);
  box([0.62, 0.05, 0.50], [0, 0.045, -0.01], BLACK);
  for (const s of [-1, 1]) {
    cylinder(0.055, 0.045, [s * 0.25, 0.022, -0.15], STEEL, 8);
    cylinder(0.055, 0.045, [s * 0.25, 0.022, 0.16], STEEL, 8);
  }

  // Marquee housing and luminous marquee face.
  box([0.66, 0.27, 0.10], [0, 1.67, 0.255], BLACK);
  box([0.60, 0.19, 0.035], [0, 1.68, 0.315], PURPLE);
  glow(
    b.part(new THREE.PlaneGeometry(0.56, 0.155), "#ffffff", {
      at: [0, 1.685, 0.338],
      dir: [0, 0, 1],
      axis: "z",
      texture: marqueeTexture,
      name: "glowingMarquee",
    }),
    1.5,
  );
  neonRod([-0.31, 1.56, 0.347], [0.31, 1.56, 0.347], 0.008, CYAN);
  neonRod([-0.31, 1.79, 0.30], [0.31, 1.79, 0.30], 0.008, PINK);

  // CRT bezel and screen.
  box([0.61, 0.50, 0.065], [0, 1.27, 0.292], BLACK);
  box([0.55, 0.44, 0.025], [0, 1.27, 0.335], PURPLE);
  const screen = b.part(new THREE.PlaneGeometry(0.49, 0.345), "#ffffff", {
    at: [0, 1.29, 0.357],
    dir: [0, 0.08, 1],
    up: [0, 1, 0],
    axis: "z",
    texture: screenTexture,
    name: "crtScreen",
  });
  glow(screen, 0.65);

  // CRT glass glints and scanline-like neon rails.
  box([0.50, 0.012, 0.012], [-0.02, 1.445, 0.371], "#75ffff");
  box([0.50, 0.008, 0.008], [0.02, 1.12, 0.371], "#ff65c6");
  neonRod([-0.29, 1.03, 0.37], [0.29, 1.03, 0.37], 0.006, PINK);

  // Control deck, front lip, and chrome edge.
  box([0.70, 0.10, 0.37], [0, 0.91, 0.23], BLACK);
  box([0.62, 0.075, 0.34], [0, 0.955, 0.245], CABINET_LIT);
  box([0.68, 0.035, 0.035], [0, 0.875, 0.425], PINK);
  neonRod([-0.32, 0.975, 0.43], [0.32, 0.975, 0.43], 0.006, CYAN);

  // Control panel inset and angular synthwave stripes.
  box([0.57, 0.012, 0.25], [0, 0.998, 0.25], "#151331");
  for (let i = -2; i <= 2; i++) {
    neonRod(
      [i * 0.115 - 0.055, 1.007, 0.14],
      [i * 0.115 + 0.055, 1.007, 0.36],
      0.0045,
      i % 2 === 0 ? MAGENTA : BLUE,
    );
  }

  // Joystick assembly on the left.
  cylinder(0.07, 0.018, [-0.20, 1.018, 0.265], DARK_STEEL, 10);
  b.rod([-0.20, 1.018, 0.265], [-0.20, 1.14, 0.265], 0.018, {
    color: STEEL,
    sides: 8,
    caps: "round",
  });
  sphere(0.052, [-0.20, 1.18, 0.265], PINK);
  sphere(0.036, [-0.215, 1.195, 0.287], "#ff9ddc");

  // Six arcade buttons, colored in a deliberate candy palette.
  const buttonColors = [PINK, CYAN, YELLOW, ORANGE, MAGENTA, GREEN];
  const buttonPositions: [number, number][] = [
    [-0.04, 0.27],
    [0.055, 0.27],
    [0.15, 0.27],
    [-0.04, 0.38],
    [0.055, 0.38],
    [0.15, 0.38],
  ];
  buttonPositions.forEach(([x, z], i) => {
    cylinder(0.034, 0.022, [x, 1.025, z], DARK_STEEL, 10);
    const button = cylinder(0.026, 0.027, [x, 1.045, z], buttonColors[i], 10);
    glow(button, 1.2);
    sphere(0.011, [x - 0.008, 1.062, z + 0.009], WHITE);
  });

  // Small illuminated START / SELECT controls.
  for (const [x, labelColor] of [
    [-0.02, CYAN],
    [0.10, PINK],
  ] as [number, string][]) {
    const start = cylinder(0.018, 0.018, [x, 1.027, 0.16], labelColor, 8);
    glow(start, 1.4);
  }
  box([0.22, 0.012, 0.035], [0.055, 1.012, 0.16], "#241b45");

  // Coin door with glowing coin return.
  box([0.34, 0.32, 0.025], [0, 0.52, 0.277], DARK_STEEL);
  box([0.29, 0.27, 0.012], [0, 0.52, 0.294], BLACK);
  const coinFace = b.part(new THREE.PlaneGeometry(0.19, 0.235), "#ffffff", {
    at: [0, 0.52, 0.304],
    dir: [0, 0, 1],
    axis: "z",
    texture: coinTexture,
    name: "coinDoor",
  });
  glow(coinFace, 0.45);
  neonRod([-0.16, 0.70, 0.315], [0.16, 0.70, 0.315], 0.005, CYAN);
  neonRod([-0.16, 0.34, 0.315], [0.16, 0.34, 0.315], 0.005, PINK);

  // Side vents near the lower rear, each with cyan slashes.
  for (const s of [-1, 1]) {
    const vent = b.part(new THREE.PlaneGeometry(0.20, 0.068), "#ffffff", {
      at: [s * 0.412, 0.34, -0.10],
      dir: [s, 0, 0],
      axis: "z",
      texture: ventTexture,
      name: `vent${s > 0 ? "L" : "R"}`,
    });
    glow(vent, 0.55);
  }

  // Speaker grille above the controls: dark panel, bars, and a bright center badge.
  box([0.34, 0.14, 0.018], [0, 0.77, 0.278], BLACK);
  for (let i = -5; i <= 5; i++) {
    const bar = box([0.012, 0.09, 0.012], [i * 0.027, 0.77, 0.292], i % 2 ? PINK : CYAN);
    if (i === 0) glow(bar, 1.1);
  }
  cylinder(0.028, 0.012, [0, 0.77, 0.305], PINK, 10, { dir: [0, 0, 1] });

  // Cabinet trim bolts and panel fasteners.
  for (const s of [-1, 1]) {
    for (const [y, z] of [
      [0.10, 0.26],
      [0.10, -0.22],
      [1.51, 0.26],
      [1.70, -0.12],
    ] as [number, number][]) {
      sphere(0.012, [s * 0.414, y, z], YELLOW);
    }
  }

  // Tiny decorative stars on the cabinet front, adding authored detail without clutter.
  const stars: [number, number, number][] = [
    [-0.24, 1.53, 0.37],
    [0.23, 1.56, 0.37],
    [-0.27, 0.73, 0.31],
    [0.26, 0.68, 0.31],
    [-0.28, 0.23, 0.29],
    [0.28, 0.24, 0.29],
  ];
  stars.forEach(([x, y, z], i) => {
    const star = b.part(
      new THREE.CircleGeometry(i % 2 ? 0.009 : 0.013, 5),
      i % 2 ? CYAN : PINK,
      {
        at: [x, y, z],
        dir: [0, 0, 1],
        axis: "z",
        name: `star${i}`,
      },
    );
    glow(star, 1.6);
  });

  // A small embossed model badge on the lower front.
  box([0.22, 0.045, 0.012], [0, 0.20, 0.292], PURPLE);
  neonRod([-0.085, 0.205, 0.301], [0.085, 0.205, 0.301], 0.004, YELLOW);

  return b.root;
}
```