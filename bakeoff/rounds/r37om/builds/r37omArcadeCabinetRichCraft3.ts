import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Neon Vector 84",
  description: "A stylized 1980s synthwave arcade cabinet with a glowing marquee, vector screen, joystick, buttons, coin door, side art, neon trim, and chunky cabinet silhouette.",
};

export default function build() {
  const b = createBuilder({ name: "neon-vector-84", detail: 1 });

  const INK = "#120b2b";
  const DEEP = "#1b1240";
  const PURPLE = "#3d176b";
  const VIOLET = "#7922a8";
  const MAGENTA = "#ff2ca8";
  const PINK = "#ff65d1";
  const CYAN = "#18e8ff";
  const BLUE = "#246bff";
  const ORANGE = "#ff8b2d";
  const YELLOW = "#ffe45e";
  const CREAM = "#ffeac4";
  const RED = "#ff315d";
  const STEEL = "#53516c";
  const DARK_STEEL = "#27263b";
  const BLACK = "#090815";

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    rotation: [number, number, number] = [0, 0, 0],
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      name,
      flat: true,
    });

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    segments = 12,
    rotation: [number, number, number] = [0, 0, 0],
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      rotation,
      name,
      flat: true,
    });

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    segments = 10,
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, segments, Math.max(6, Math.floor(segments * 0.7))), color, {
      at,
      name,
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) => b.rod(a, c, radius, { color, caps: "round", name });

  const neonRod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) => glow(rod(a, c, radius, color, name), 2.2);

  const marquee = svg(
    `<svg viewBox="0 0 640 170" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x2="0" y2="1">
          <stop stop-color="#281060"/>
          <stop offset="1" stop-color="#09051f"/>
        </linearGradient>
        <linearGradient id="word" x2="0" y2="1">
          <stop stop-color="#fff57b"/>
          <stop offset=".48" stop-color="#ff50c8"/>
          <stop offset="1" stop-color="#b31eff"/>
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="640" height="170" rx="12" fill="url(#bg)" stroke="#ff37bb" stroke-width="8"/>
      <path d="M0 130 L640 45 M0 158 L640 73" stroke="#1cecff" stroke-width="3" opacity=".8"/>
      <text x="320" y="106" text-anchor="middle" font-family="sans-serif" font-style="italic" font-weight="900" font-size="76" letter-spacing="3" fill="#ff28b7" opacity=".8" transform="translate(4 7)" filter="url(#glow)">VECTOR</text>
      <text x="320" y="106" text-anchor="middle" font-family="sans-serif" font-style="italic" font-weight="900" font-size="76" letter-spacing="3" fill="url(#word)" stroke="#fff4ff" stroke-width="2">VECTOR</text>
      <text x="320" y="143" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="19" letter-spacing="8" fill="#28eaff">84 // INSERT COIN</text>
    </svg>`,
    { size: 512 },
  );

  const screen = svg(
    `<svg viewBox="0 0 512 360" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky" y2="1">
          <stop stop-color="#090825"/><stop offset=".58" stop-color="#2c1163"/><stop offset="1" stop-color="#f22a91"/>
        </linearGradient>
        <linearGradient id="sun" y2="1"><stop stop-color="#fff68a"/><stop offset="1" stop-color="#ff6c3d"/></linearGradient>
        <pattern id="grid" width="42" height="24" patternUnits="userSpaceOnUse">
          <path d="M0 0H42M0 0V24" stroke="#ff48ce" stroke-width="1.5" opacity=".65"/>
        </pattern>
        <filter id="blur"><feGaussianBlur stdDeviation="8"/></filter>
      </defs>
      <rect width="512" height="360" fill="url(#sky)"/>
      <circle cx="256" cy="203" r="67" fill="#ff447f" opacity=".7" filter="url(#blur)"/>
      <circle cx="256" cy="203" r="58" fill="url(#sun)"/>
      <g stroke="#ee397b" stroke-width="5" opacity=".8">
        <path d="M198 190H314M204 205H308M211 220H301M221 235H291"/>
      </g>
      <path d="M0 288 L512 288 L512 360 L0 360Z" fill="#100b35"/>
      <path d="M0 288 L256 214 L512 288" fill="none" stroke="#2be8ff" stroke-width="4"/>
      <path d="M256 214L256 360M0 360L256 214L512 360M40 360L256 214L472 360" fill="none" stroke="#26dfff" stroke-width="2" opacity=".85"/>
      <rect width="512" height="360" fill="url(#grid)" opacity=".85"/>
      <text x="22" y="35" font-family="monospace" font-weight="bold" font-size="20" fill="#fff48a">SCORE 084200</text>
      <text x="386" y="35" font-family="monospace" font-weight="bold" font-size="20" fill="#62f5ff">1UP</text>
      <text x="256" y="332" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="18" fill="#ff6dd7">READY PLAYER ONE</text>
    </svg>`,
    { size: 512 },
  );

  const sideArt = svg(
    `<svg viewBox="0 0 240 800" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x2="0" y2="1"><stop stop-color="#241050"/><stop offset=".55" stop-color="#721da1"/><stop offset="1" stop-color="#120b35"/></linearGradient></defs>
      <rect width="240" height="800" fill="url(#g)"/>
      <path d="M-20 640 Q80 470 260 360 M-20 700 Q95 525 260 445 M-30 755 Q100 610 260 535" fill="none" stroke="#18eaff" stroke-width="12"/>
      <path d="M-10 635 Q95 480 250 390 M-10 695 Q105 540 250 470" fill="none" stroke="#ff31ad" stroke-width="7"/>
      <circle cx="130" cy="265" r="105" fill="#ff2eae" opacity=".22"/>
      <path d="M38 300 L88 175 L124 210 L168 130 L206 280 L160 252 L119 330 Z" fill="#ffe95e" stroke="#180b38" stroke-width="9"/>
      <path d="M72 282 L112 210 L141 239 L172 188" fill="none" stroke="#fff5b1" stroke-width="8"/>
      <text x="120" y="420" text-anchor="middle" font-family="sans-serif" font-weight="900" font-style="italic" font-size="34" fill="#fff17a" transform="rotate(-12 120 420)">VECTOR</text>
    </svg>`,
    { size: 384 },
  );

  const coinTexture = svg(
    `<svg viewBox="0 0 180 220" xmlns="http://www.w3.org/2000/svg">
      <rect width="180" height="220" rx="12" fill="#141226" stroke="#ff39b8" stroke-width="7"/>
      <rect x="20" y="22" width="140" height="115" rx="9" fill="#332e4d" stroke="#66617e" stroke-width="5"/>
      <rect x="57" y="42" width="66" height="63" rx="4" fill="#05050d" stroke="#17eaff" stroke-width="5"/>
      <path d="M67 88H113M73 78H107" stroke="#ff4ebd" stroke-width="5"/>
      <text x="90" y="175" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#ffe76c">COIN</text>
      <text x="90" y="198" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="12" fill="#20eaff">1 CREDIT</text>
    </svg>`,
    { size: 256 },
  );

  const controlTexture = svg(
    `<svg viewBox="0 0 500 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="500" height="100" fill="#190e37"/>
      <path d="M0 85H500" stroke="#ff2baa" stroke-width="8"/>
      <text x="250" y="51" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="23" fill="#1ceaff">VECTOR // HYPERDRIVE</text>
    </svg>`,
    { size: 384 },
  );

  // Main cabinet shell: broad lower body and tall upper body.
  box([0.72, 0.72, 0.58], DEEP, [0, 0.43, -0.01], [0, 0, 0], "lowerCabinet");
  box([0.68, 0.92, 0.50], PURPLE, [0, 1.18, -0.035], [-7, 0, 0], "upperCabinet");
  box([0.70, 0.10, 0.58], INK, [0, 0.82, 0.0], [0, 0, 0], "controlDeckBase");
  box([0.69, 0.10, 0.51], BLACK, [0, 1.66, -0.055], [-7, 0, 0], "topCap");
  box([0.73, 0.06, 0.62], INK, [0, 0.08, -0.02], [0, 0, 0], "plinth");

  // Side panels, each with a recognizable sloping arcade silhouette.
  const profile: [number, number, "sharp"][] = [
    [-0.31, 0, "sharp"],
    [0.28, 0, "sharp"],
    [0.28, 0.78, "sharp"],
    [0.20, 0.98, "sharp"],
    [0.17, 1.80, "sharp"],
    [-0.25, 1.80, "sharp"],
    [-0.31, 1.54, "sharp"],
  ];
  for (const s of [-1, 1]) {
    b.extrude(profile, {
      at: [s * 0.365, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.012,
      color: PURPLE,
      name: s < 0 ? "sidePanelR" : "sidePanelL",
    });
    const art = b.part(new THREE.PlaneGeometry(0.56, 1.48), "#ffffff", {
      at: [s * 0.392, 0.86, -0.015],
      dir: [s, 0, 0],
      axis: "z",
      texture: sideArt,
      name: s < 0 ? "sideArtR" : "sideArtL",
    });
    glow(art, 0.35);
  }

  // Bright cabinet outline and side-panel edge piping.
  neonRod([-0.37, 0.11, 0.29], [-0.37, 0.80, 0.29], 0.012, MAGENTA, "frontTrimR");
  neonRod([0.37, 0.11, 0.29], [0.37, 0.80, 0.29], 0.012, CYAN, "frontTrimL");
  neonRod([-0.37, 0.83, 0.28], [-0.34, 1.65, 0.20], 0.011, CYAN, "screenTrimR");
  neonRod([0.37, 0.83, 0.28], [0.34, 1.65, 0.20], 0.011, MAGENTA, "screenTrimL");
  neonRod([-0.34, 1.66, 0.20], [0.34, 1.66, 0.20], 0.012, CYAN, "marqueeTrim");

  // Screen bezel and glowing vector screen.
  box([0.60, 0.50, 0.055], BLACK, [0, 1.35, 0.232], [-7, 0, 0], "screenBezel");
  box([0.555, 0.435, 0.016], DARK_STEEL, [0, 1.35, 0.267], [-7, 0, 0], "screenGlassFrame");
  const screenPart = b.part(new THREE.PlaneGeometry(0.525, 0.405), "#ffffff", {
    at: [0, 1.35, 0.279],
    dir: [0, 0.13, 1],
    up: [0, 1, 0],
    axis: "z",
    texture: screen,
    name: "vectorScreen",
  });
  glow(screenPart, 1.8);

  // Marquee housing and illuminated title.
  box([0.66, 0.20, 0.09], INK, [0, 1.73, 0.11], [-7, 0, 0], "marqueeHousing");
  const marqueePart = b.part(new THREE.PlaneGeometry(0.59, 0.155), "#ffffff", {
    at: [0, 1.73, 0.17],
    dir: [0, 0.13, 1],
    up: [0, 1, 0],
    axis: "z",
    texture: marquee,
    name: "neonMarquee",
  });
  glow(marqueePart, 2.3);

  // Sloping control panel.
  box([0.64, 0.075, 0.27], DEEP, [0, 0.91, 0.245], [-13, 0, 0], "controlPanel");
  const controlLabel = b.part(new THREE.PlaneGeometry(0.43, 0.085), "#ffffff", {
    at: [0, 0.948, 0.292],
    dir: [0, 0.23, 0.97],
    up: [0, 1, 0],
    axis: "z",
    texture: controlTexture,
    name: "controlLabel",
  });
  glow(controlLabel, 0.8);

  // Joystick stem, collar, and oversized ball.
  cyl(0.045, 0.025, CYAN, [0, 0.976, 0.205], 12, [0, 0, 0], "stickCollar");
  cyl(0.014, 0.19, STEEL, [0, 1.065, 0.205], 8, [0, 0, 0], "joystickStem");
  sphere(0.055, RED, [0, 1.165, 0.205], 10, "joystickBall");
  neonRod([0, 1.17, 0.205], [0, 1.17, 0.205], 0.055, RED, "joystickGlow");

  // Three luminous action buttons and a smaller start button.
  const buttons = [
    { x: -0.18, color: MAGENTA, name: "buttonA" },
    { x: -0.055, color: CYAN, name: "buttonB" },
    { x: 0.07, color: YELLOW, name: "buttonC" },
  ];
  for (const button of buttons) {
    cyl(0.043, 0.025, BLACK, [button.x, 0.977, 0.17], 12, [0, 0, 0], `${button.name}Socket`);
    const p = cyl(0.034, 0.031, button.color, [button.x, 0.997, 0.17], 12, [0, 0, 0], button.name);
    glow(p, 1.7);
    cyl(0.041, 0.008, PINK, [button.x, 1.014, 0.17], 12, [0, 0, 0], `${button.name}Rim`);
  }
  const start = cyl(0.024, 0.018, YELLOW, [0.245, 0.978, 0.19], 10, [0, 0, 0], "startButton");
  glow(start, 1.5);

  // Front coin door, coin slot, return button, and lower neon badge.
  box([0.37, 0.34, 0.025], DARK_STEEL, [0, 0.43, 0.292], [0, 0, 0], "coinDoor");
  box([0.31, 0.275, 0.009], BLACK, [0, 0.43, 0.309], [0, 0, 0], "coinDoorInset");
  const coin = b.part(new THREE.PlaneGeometry(0.245, 0.295), "#ffffff", {
    at: [0, 0.43, 0.316],
    dir: [0, 0, 1],
    axis: "z",
    texture: coinTexture,
    name: "coinDoorGraphic",
  });
  glow(coin, 0.5);
  cyl(0.031, 0.012, YELLOW, [-0.11, 0.48, 0.326], 12, [Math.PI / 2, 0, 0], "coinSlot");
  cyl(0.019, 0.012, RED, [0.11, 0.48, 0.326], 10, [Math.PI / 2, 0, 0], "returnButton");

  box([0.43, 0.045, 0.018], BLACK, [0, 0.20, 0.311], [0, 0, 0], "badgePlate");
  const badge = b.part(new THREE.PlaneGeometry(0.35, 0.025), "#ffffff", {
    at: [0, 0.20, 0.323],
    dir: [0, 0, 1],
    axis: "z",
    texture: marquee,
    name: "lowerBadge",
  });
  glow(badge, 1.1);

  // Feet and small hardware.
  for (const x of [-0.27, 0.27]) {
    box([0.12, 0.09, 0.17], BLACK, [x, 0.035, -0.10], [0, 0, 0], "rubberFoot");
    cyl(0.027, 0.012, CYAN, [x, 0.098, 0.29], 8, [Math.PI / 2, 0, 0], "lowerRivet");
  }

  // Decorative rivets marching around the cabinet front.
  for (const x of [-0.29, 0.29]) {
    for (const y of [0.16, 0.31, 0.55, 0.73, 0.91, 1.08, 1.38, 1.60]) {
      const r = sphere(0.012, x < 0 ? CYAN : MAGENTA, [x, y, y > 0.8 ? 0.292 : 0.323], 7, "cabinetRivet");
      glow(r, 1.1);
    }
  }

  // Tiny power indicator and speaker grille.
  const power = sphere(0.014, GREEN(), [0.27, 0.69, 0.323], 8, "powerLED");
  glow(power, 2);

  for (let i = 0; i < 7; i++) {
    rod(
      [-0.16 + i * 0.052, 0.69, 0.326],
      [-0.16 + i * 0.052, 0.62, 0.326],
      0.006,
      i % 2 ? CYAN : MAGENTA,
      "speakerSlot",
    );
  }

  // A few floating-looking but physically seated neon accents on the side/front silhouette.
  neonRod([-0.335, 0.12, 0.31], [0.335, 0.12, 0.31], 0.009, MAGENTA, "plinthNeon");
  neonRod([-0.31, 0.78, 0.31], [0.31, 0.78, 0.31], 0.008, CYAN, "deckNeon");

  return b.root;

  function GREEN() {
    return "#52ff9b";
  }
}
