```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Neon Vector Arcade Cabinet",
  description: "A stylized 1980s synthwave arcade cabinet with glowing marquee, CRT screen, joystick, buttons, coin door, speakers, and neon trim.",
};

const PURPLE = "#24103f";
const DEEP = "#100b24";
const BLACK = "#080814";
const MAGENTA = "#ff1f9a";
const CYAN = "#14e6ff";
const VIOLET = "#713cff";
const PINK = "#ff4fc3";
const YELLOW = "#ffe066";
const METAL = "#756b91";
const CHROME = "#c9c7e8";
const DARK_METAL = "#28233e";
const WHITE = "#fff6ff";

const marqueeTexture = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 260">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#12072d"/>
      <stop offset=".48" stop-color="#6d167c"/>
      <stop offset="1" stop-color="#ff267f"/>
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset=".4" stop-color="#65f5ff"/>
      <stop offset="1" stop-color="#ff3eb5"/>
    </linearGradient>
    <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
      <path d="M0 34L34 0M-8 34L34 -8M0 42L42 0" stroke="#ff8ee0" stroke-opacity=".22" stroke-width="2"/>
    </pattern>
  </defs>
  <rect width="900" height="260" fill="url(#bg)"/>
  <rect width="900" height="260" fill="url(#grid)"/>
  <path d="M0 202 Q180 130 360 190 T900 155 V260 H0Z" fill="#160b39" opacity=".85"/>
  <path d="M0 205 Q180 133 360 193 T900 158" fill="none" stroke="#20eaff" stroke-width="5"/>
  <text x="450" y="145" text-anchor="middle"
        font-family="sans-serif" font-size="92" font-weight="900"
        font-style="italic" letter-spacing="9"
        fill="#160724" stroke="#160724" stroke-width="19" opacity=".9">VECTOR</text>
  <text x="450" y="137" text-anchor="middle"
        font-family="sans-serif" font-size="92" font-weight="900"
        font-style="italic" letter-spacing="9"
        fill="url(#glow)" stroke="#fff" stroke-width="2">VECTOR</text>
  <text x="450" y="207" text-anchor="middle" font-family="sans-serif"
        font-size="22" font-weight="bold" letter-spacing="12" fill="#fff6ff">HYPER DRIVE</text>
</svg>`, { size: 512 });

const screenTexture = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 430">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#120b3e"/><stop offset=".65" stop-color="#3e1265"/><stop offset="1" stop-color="#e41b88"/>
    </linearGradient>
    <pattern id="scan" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M0 1H8" stroke="#8ffcff" stroke-opacity=".13"/>
    </pattern>
  </defs>
  <rect width="640" height="430" fill="url(#sky)"/>
  <circle cx="480" cy="126" r="74" fill="#ffb72e" opacity=".9"/>
  <path d="M0 303 L640 303 L640 430 L0 430Z" fill="#160d38"/>
  <path d="M0 319 L640 319 M0 354 L640 354 M0 389 L640 389" stroke="#ff38bd" stroke-width="4" opacity=".75"/>
  <path d="M80 430 L320 303 L390 303 L215 430 M540 430 L365 303 L430 303 L620 430" fill="#25116c"/>
  <path d="M0 430L320 303L640 430" fill="none" stroke="#1ef3ff" stroke-width="5"/>
  <path d="M85 275 Q150 210 224 275 T365 275 T510 275 T650 275" fill="none" stroke="#72faff" stroke-width="8"/>
  <path d="M105 266 L151 235 L191 260 L235 202 L286 246 L341 185 L392 239 L438 204 L492 254 L542 216 L595 263"
        fill="none" stroke="#fff" stroke-width="3"/>
  <text x="28" y="54" fill="#55f6ff" font-family="monospace" font-size="22" font-weight="bold">SCORE 048920</text>
  <text x="500" y="54" fill="#ff76d5" font-family="monospace" font-size="21" font-weight="bold">1UP</text>
  <rect width="640" height="430" fill="url(#scan)"/>
</svg>`, { size: 512 });

const coinTexture = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 320">
  <defs><linearGradient id="c" x2="0" y2="1"><stop stop-color="#fff07b"/><stop offset=".45" stop-color="#ffb22e"/><stop offset="1" stop-color="#d64925"/></linearGradient></defs>
  <rect width="220" height="320" rx="18" fill="#151127" stroke="#ff31ad" stroke-width="8"/>
  <rect x="24" y="25" width="172" height="270" rx="13" fill="#31214e" stroke="#6b5b91" stroke-width="5"/>
  <circle cx="110" cy="105" r="50" fill="none" stroke="url(#c)" stroke-width="13"/>
  <circle cx="110" cy="105" r="22" fill="#110c20" stroke="#fff0a0" stroke-width="4"/>
  <rect x="65" y="181" width="90" height="22" rx="8" fill="#090814" stroke="#ff4bc4" stroke-width="4"/>
  <text x="110" y="250" text-anchor="middle" fill="#8efaff" font-family="sans-serif" font-size="20" font-weight="bold">INSERT</text>
  <text x="110" y="275" text-anchor="middle" fill="#8efaff" font-family="sans-serif" font-size="20" font-weight="bold">COIN</text>
</svg>`, { size: 256 });

function part(
  b: ReturnType<typeof createBuilder>,
  geometry: THREE.BufferGeometry,
  color: string,
  at: [number, number, number],
  extra: Record<string, unknown> = {},
) {
  return b.part(geometry, color, { at, ...extra });
}

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  color: string,
  at: [number, number, number],
  extra: Record<string, unknown> = {},
) {
  return part(b, new THREE.BoxGeometry(...size), color, at, extra);
}

function cyl(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  height: number,
  color: string,
  at: [number, number, number],
  radial = 12,
  extra: Record<string, unknown> = {},
) {
  return part(b, new THREE.CylinderGeometry(radius, radius, height, radial), color, at, extra);
}

function neonBar(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  color: string,
  at: [number, number, number],
) {
  const p = box(b, size, color, at, { name: "neonTrim" });
  glow(p, 2.5);
  return p;
}

export default function build() {
  const b = createBuilder({ name: "synthwaveArcade", detail: 1 });

  // Footprint and lower cabinet.
  box(b, [0.78, 0.08, 0.72], BLACK, [0, 0.04, -0.02], { name: "rubberFoot" });
  box(b, [0.72, 0.48, 0.64], PURPLE, [0, 0.29, -0.02], { name: "lowerCabinet" });
  box(b, [0.68, 0.48, 0.58], DEEP, [0, 0.34, 0.015], { name: "lowerInset" });

  // Tall CRT housing, with a wedge-like upper silhouette.
  box(b, [0.72, 0.82, 0.58], PURPLE, [0, 0.93, -0.045], { name: "upperCabinet" });
  box(b, [0.63, 0.69, 0.54], BLACK, [0, 0.96, 0.005], { name: "screenCavity" });

  // Side cheek panels, shaped as classic arcade side profiles.
  const sideOutline: [number, number][] = [
    [-0.32, 0.56],
    [-0.32, 1.72],
    [-0.22, 1.88],
    [0.27, 1.88],
    [0.31, 1.70],
    [0.30, 1.31],
    [0.42, 1.14],
    [0.42, 0.56],
  ];
  for (const s of [-1, 1]) {
    const panel = b.extrude(sideOutline, {
      at: [s * 0.37, 0, -0.04],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.055,
      bevel: 0.012,
      color: VIOLET,
      name: s > 0 ? "sidePanelL" : "sidePanelR",
    });
    // Graphic stripes on the outward face.
    neonBar(b, [0.018, 0.94, 0.012], CYAN, [s * 0.405, 1.18, 0.10]);
    neonBar(b, [0.018, 0.72, 0.012], MAGENTA, [s * 0.407, 1.01, -0.12]);
    void panel;
  }

  // Marquee header and its luminous border.
  box(b, [0.69, 0.29, 0.13], BLACK, [0, 1.72, 0.31], { name: "marqueeHousing" });
  const marquee = part(
    b,
    new THREE.PlaneGeometry(0.61, 0.215),
    WHITE,
    [0, 1.73, 0.382],
    { dir: [0, 0, 1], axis: "z", texture: marqueeTexture, name: "marqueeArt" },
  );
  glow(marquee, 1.8);
  neonBar(b, [0.68, 0.018, 0.025], CYAN, [0, 1.885, 0.39]);
  neonBar(b, [0.68, 0.018, 0.025], MAGENTA, [0, 1.565, 0.39]);
  neonBar(b, [0.018, 0.30, 0.025], CYAN, [-0.345, 1.725, 0.39]);
  neonBar(b, [0.018, 0.30, 0.025], MAGENTA, [0.345, 1.725, 0.39]);

  // CRT glass rim and screen.
  box(b, [0.58, 0.47, 0.035], DARK_METAL, [0, 1.22, 0.299], { name: "crtBezel" });
  box(b, [0.535, 0.405, 0.018], BLACK, [0, 1.22, 0.322], { name: "crtGlass" });
  const screen = part(
    b,
    new THREE.PlaneGeometry(0.505, 0.365),
    WHITE,
    [0, 1.22, 0.334],
    { dir: [0, 0, 1], axis: "z", texture: screenTexture, name: "gameScreen" },
  );
  glow(screen, 1.3);
  // CRT corner bolts.
  for (const x of [-0.275, 0.275]) {
    for (const y of [1.00, 1.44]) {
      const bolt = cyl(b, 0.014, 0.012, CHROME, [x, y, 0.345], 8, { dir: [0, 0, 1], name: "bezelBolt" });
      glow(bolt, 0.4);
    }
  }

  // Control deck, angled-looking through stacked slabs.
  box(b, [0.70, 0.075, 0.36], PURPLE, [0, 0.76, 0.285], { name: "controlDeck" });
  box(b, [0.63, 0.025, 0.29], BLACK, [0, 0.807, 0.315], { name: "controlSurface" });
  neonBar(b, [0.66, 0.018, 0.018], CYAN, [0, 0.84, 0.49]);
  neonBar(b, [0.66, 0.014, 0.014], MAGENTA, [0, 0.705, 0.105]);

  // Joystick shaft, collar, ball and four buttons.
  cyl(b, 0.055, 0.025, CHROME, [-0.16, 0.842, 0.30], 12, { name: "joystickCollar" });
  const shaft = b.rod([-0.16, 0.84, 0.30], [-0.16, 0.98, 0.30], 0.018, {
    color: METAL,
    caps: "flat",
    name: "joystickShaft",
  });
  const ball = part(b, new THREE.SphereGeometry(0.067, 12, 8), MAGENTA, [-0.16, 1.025, 0.30], { name: "joystickBall" });
  glow(ball, 1.3);
  void shaft;

  const buttonPositions: [number, number, number][] = [
    [0.075, 0.865, 0.32],
    [0.17, 0.865, 0.32],
    [0.075, 0.865, 0.415],
    [0.17, 0.865, 0.415],
  ];
  const buttonColors = [CYAN, MAGENTA, YELLOW, PINK];
  buttonPositions.forEach((p, i) => {
    const rim = cyl(b, 0.043, 0.018, CHROME, [p[0], p[1] - 0.004, p[2]], 12, { name: "buttonRim" });
    const button = cyl(b, 0.032, 0.027, buttonColors[i], [p[0], p[1] + 0.012, p[2]], 12, { name: "actionButton" });
    glow(button, 1.5);
    void rim;
  });

  // Start buttons and tiny printed labels.
  const start = cyl(b, 0.027, 0.02, YELLOW, [0.27, 0.864, 0.30], 10, { name: "startButton" });
  glow(start, 1.2);
  const startLabel = part(
    b,
    new THREE.PlaneGeometry(0.12, 0.035),
    WHITE,
    [0.27, 0.885, 0.335],
    {
      dir: [0, 0, 1],
      axis: "z",
      texture: svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70"><text x="120" y="52" text-anchor="middle" font-family="sans-serif" font-size="48" font-weight="bold" fill="#14e6ff">START</text></svg>`, { size: 128 }),
      name: "startLabel",
    },
  );
  glow(startLabel, 0.8);

  // Lower coin door with glowing printed artwork.
  box(b, [0.43, 0.34, 0.025], DARK_METAL, [0, 0.34, 0.326], { name: "coinDoorFrame" });
  const coin = part(
    b,
    new THREE.PlaneGeometry(0.30, 0.27),
    WHITE,
    [0, 0.37, 0.344],
    { dir: [0, 0, 1], axis: "z", texture: coinTexture, name: "coinDoorArt" },
  );
  glow(coin, 0.8);
  for (const x of [-0.24, 0.24]) {
    const rivet = cyl(b, 0.012, 0.012, CHROME, [x, 0.49, 0.35], 8, { dir: [0, 0, 1], name: "coinRivet" });
    void rivet;
  }

  // Speaker grille: three cyan bars above the controls.
  for (let i = 0; i < 5; i++) {
    const grille = box(b, [0.22, 0.012, 0.014], CYAN, [0.22, 1.53 + i * 0.035, 0.337], { name: "speakerSlot" });
    glow(grille, 1.1);
  }

  // A few hot-pink cabinet seams and feet.
  neonBar(b, [0.012, 0.55, 0.012], MAGENTA, [-0.333, 0.34, 0.345]);
  neonBar(b, [0.012, 0.55, 0.012], CYAN, [0.333, 0.34, 0.345]);
  for (const x of [-0.28, 0.28]) {
    box(b, [0.13, 0.045, 0.14], BLACK, [x, 0.02, -0.22], { name: "levelFoot" });
  }

  return b.root;
}
```