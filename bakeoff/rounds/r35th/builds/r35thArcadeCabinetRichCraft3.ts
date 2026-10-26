import * as THREE from "three";
import { createBuilder, paint, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "neon-vector-arcade",
  description: "A detailed 1980s upright arcade cabinet in a bold synthwave palette.",
};

const INK = "#080713";
const BODY = "#17132b";
const BODY_DARK = "#0d0b1d";
const PANEL = "#251343";
const PANEL_LIT = "#39205e";
const MAGENTA = "#ff2bd6";
const HOT_PINK = "#ff5be8";
const CYAN = "#27e4ff";
const BLUE = "#385dff";
const PURPLE = "#8b35ff";
const YELLOW = "#ffd447";
const ORANGE = "#ff7338";
const RED = "#f13b65";
const STEEL = "#5e6078";
const LIGHT_STEEL = "#a2a3bd";
const SCREEN_DARK = "#101333";

const BODY_PAINT = paint((_p, n, _s) => {
  if (n.y > 0.6) return "#21183e";
  if (n.z > 0.45) return "#241441";
  return BODY;
});

const PANEL_PAINT = paint((_p, n, _s) => {
  if (n.y > 0.55) return "#4a2370";
  if (n.z > 0.4) return "#321852";
  return PANEL;
});

const MARQUEE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 180">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#180b42"/>
        <stop offset=".48" stop-color="#4b116f"/>
        <stop offset="1" stop-color="#e31c91"/>
      </linearGradient>
      <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#ffd95a"/>
        <stop offset="1" stop-color="#ff6a32"/>
      </linearGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="3"/></filter>
    </defs>
    <rect width="640" height="180" fill="url(#bg)"/>
    <circle cx="500" cy="80" r="58" fill="#ff4dbb" opacity=".48" filter="url(#soft)"/>
    <circle cx="500" cy="80" r="47" fill="url(#sun)" stroke="#ffd4a1" stroke-width="3"/>
    <g stroke="#ff4e9f" stroke-width="4" opacity=".75">
      <path d="M455 65h90M452 76h96M454 87h92M460 98h80M470 109h60"/>
    </g>
    <path d="M0 150 L640 116 L640 180 L0 180Z" fill="#100d31"/>
    <g stroke="#32eaff" stroke-width="2" opacity=".7">
      <path d="M0 151h640M0 163h640M0 174h640"/>
      <path d="M320 150L320 180M220 150L180 180M420 150L470 180M120 150L20 180M520 150L620 180"/>
    </g>
    <text x="30" y="76" font-family="sans-serif" font-weight="900" font-style="italic"
      font-size="55" letter-spacing="4" fill="#ffffff" stroke="#ff2bd6" stroke-width="7" paint-order="stroke">NEON</text>
    <text x="35" y="123" font-family="sans-serif" font-weight="900" font-style="italic"
      font-size="43" letter-spacing="7" fill="#27e4ff" stroke="#16102e" stroke-width="5" paint-order="stroke">VECTOR</text>
    <path d="M29 138h345" stroke="#ffd447" stroke-width="5"/>
    <path d="M29 145h180" stroke="#ff5be8" stroke-width="3"/>
  </svg>`,
  { size: 512 },
);

const SCREEN = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#05061b"/>
        <stop offset=".55" stop-color="#21165b"/>
        <stop offset="1" stop-color="#e02098"/>
      </linearGradient>
      <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#32136e"/>
        <stop offset="1" stop-color="#070817"/>
      </linearGradient>
    </defs>
    <rect width="480" height="300" fill="url(#sky)"/>
    <circle cx="365" cy="112" r="42" fill="#ffbe4b"/>
    <g stroke="#ff5b9e" stroke-width="3" opacity=".65">
      <path d="M328 92h74M326 102h78M325 112h80M328 122h74M334 132h62"/>
    </g>
    <g fill="#a8f7ff">
      <circle cx="44" cy="42" r="2"/><circle cx="92" cy="79" r="2"/><circle cx="161" cy="36" r="2"/>
      <circle cx="257" cy="68" r="2"/><circle cx="422" cy="45" r="2"/><circle cx="450" cy="89" r="2"/>
    </g>
    <path d="M0 173 L480 173 L480 300 L0 300Z" fill="url(#road)"/>
    <g stroke="#28eaff" stroke-width="2" opacity=".7">
      <path d="M0 183h480M0 199h480M0 219h480M0 245h480M0 277h480"/>
      <path d="M240 173L240 300M240 173L55 300M240 173L-10 240M240 173L425 300M240 173L490 240"/>
    </g>
    <path d="M145 242 L178 207 L304 207 L349 242 L330 257 L157 257Z" fill="#0a0b23" stroke="#27e4ff" stroke-width="5"/>
    <path d="M179 207 L204 186 L280 186 L304 207Z" fill="#24235d" stroke="#ff2bd6" stroke-width="4"/>
    <path d="M202 190h76" stroke="#ffd447" stroke-width="4"/>
    <circle cx="182" cy="250" r="10" fill="#ff5be8"/><circle cx="313" cy="250" r="10" fill="#ff5be8"/>
    <g opacity=".75" stroke="#ff4fb2" stroke-width="2">
      <path d="M0 285h480M0 292h480"/>
    </g>
    <text x="18" y=" thirty" font-family="sans-serif" font-size="1" fill="#fff"> </text>
    <text x="18" y="38" font-family="sans-serif" font-weight="bold" font-size="18" fill="#ffffff">HIGH SCORE 1986</text>
  </svg>`,
  { size: 512 },
);

const SIDE_ART = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 520">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#0b0921"/><stop offset=".45" stop-color="#45146d"/><stop offset="1" stop-color="#f02a9e"/>
      </linearGradient>
    </defs>
    <rect width="220" height="520" rx="8" fill="url(#g)"/>
    <path d="M-20 425 L230 88" stroke="#27e4ff" stroke-width="18" opacity=".8"/>
    <path d="M-40 475 L210 138" stroke="#ffed62" stroke-width="5"/>
    <path d="M-20 285 L242 24" stroke="#ff2bd6" stroke-width="9"/>
    <path d="M20 520 L190 0" stroke="#8b35ff" stroke-width="34" opacity=".55"/>
    <g fill="none" stroke="#29e6ff" stroke-width="2" opacity=".75">
      <path d="M15 70h190M15 82h190M15 94h190"/>
      <path d="M15 340h190M15 352h190M15 364h190"/>
    </g>
    <path d="M24 212 L105 118 L192 190 L114 270Z" fill="#130d38" stroke="#ff5be8" stroke-width="6"/>
    <path d="M48 210 L105 144 L168 193 L111 244Z" fill="#241e75" stroke="#27e4ff" stroke-width="3"/>
    <circle cx="104" cy="193" r="20" fill="#ffd447" stroke="#ff7138" stroke-width="5"/>
    <path d="M103 176v34M86 193h35" stroke="#fff2a6" stroke-width="4"/>
    <text x="108" y="312" text-anchor="middle" font-family="sans-serif" font-size="23"
      font-weight="900" font-style="italic" fill="#ffffff" transform="rotate(-22 108 312)">VECTOR</text>
    <text x="110" y="337" text-anchor="middle" font-family="sans-serif" font-size="16"
      font-weight="bold" fill="#27e4ff" transform="rotate(-22 110 337)">SYSTEM</text>
  </svg>`,
  { size: 512 },
);

const CONTROL_ART = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 130">
    <defs><linearGradient id="c" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="#160c35"/><stop offset=".5" stop-color="#4c176d"/><stop offset="1" stop-color="#170d39"/>
    </linearGradient></defs>
    <rect width="640" height="130" rx="12" fill="url(#c)" stroke="#ff2bd6" stroke-width="8"/>
    <path d="M25 98h590M25 107h590" stroke="#27e4ff" stroke-width="3"/>
    <g stroke="#784dff" stroke-width="2" opacity=".7">
      <path d="M40 20v70M80 20v70M120 20v70M160 20v70M200 20v70M240 20v70M280 20v70M320 20v70M360 20v70M400 20v70M440 20v70M480 20v70M520 20v70M560 20v70M600 20v70"/>
    </g>
    <text x="38" y="47" font-family="sans-serif" font-size="20" font-weight="bold" fill="#ffd447">PLAYER 1</text>
    <text x="512" y="47" font-family="sans-serif" font-size="20" font-weight="bold" fill="#27e4ff">INSERT COIN</text>
  </svg>`,
  { size: 512 },
);

const SPEAKER_ART = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 180">
    <rect width="360" height="180" rx="12" fill="#0c0920" stroke="#8b35ff" stroke-width="8"/>
    <g fill="#27e4ff" opacity=".85">
      ${Array.from({ length: 7 }, (_, y) =>
        Array.from({ length: 15 }, (_, x) => `<circle cx="${28 + x * 22}" cy="${24 + y * 22}" r="5"/>`).join(""),
      ).join("")}
    </g>
    <path d="M15 16h330M15 164h330" stroke="#ff2bd6" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

const COIN_ART = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 250">
    <rect width="180" height="250" rx="10" fill="#131126" stroke="#ff2bd6" stroke-width="7"/>
    <rect x="24" y="27" width="132" height="30" rx="5" fill="#070711" stroke="#27e4ff" stroke-width="4"/>
    <path d="M42 42h96" stroke="#a8f7ff" stroke-width="5"/>
    <circle cx="90" cy="123" r="47" fill="#d18a32" stroke="#ffd447" stroke-width="7"/>
    <circle cx="90" cy="123" r="32" fill="none" stroke="#6e351d" stroke-width="5"/>
    <path d="M90 95v57M62 123h57" stroke="#ffe995" stroke-width="7"/>
    <rect x="47" y="194" width="86" height="22" rx="7" fill="#282743" stroke="#8b35ff" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

const SMALL_LABEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80">
    <rect width="300" height="80" rx="10" fill="#130d2b" stroke="#27e4ff" stroke-width="5"/>
    <text x="150" y="52" text-anchor="middle" font-family="sans-serif" font-size="31"
      font-weight="900" letter-spacing="5" fill="#ffd447">READY!</text>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "neon-vector-arcade", detail: 1 });

  const part = (
    geometry: THREE.BufferGeometry,
    color: any,
    at: [number, number, number],
    options: Record<string, any> = {},
  ) => b.part(geometry, color, { at, flat: true, ...options });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    options: Record<string, any> = {},
  ) => part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, options);

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    options: Record<string, any> = {},
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, options.segments ?? 10),
      color,
      at,
      options,
    );

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: any,
    options: Record<string, any> = {},
  ) => part(new THREE.SphereGeometry(radius, options.segments ?? 10, options.rings ?? 6), color, at, options);

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: any,
    options: Record<string, any> = {},
  ) => b.rod(a, c, radius, { color, ...options });

  // Feet and concealed undercarriage.
  box([0.62, 0.08, 0.62], [0, 0.075, -0.02], BODY_DARK, { name: "undercarriage" });
  for (const x of [-0.25, 0.25]) {
    for (const z of [-0.24, 0.24]) {
      box([0.13, 0.07, 0.16], [x, 0.035, z], INK, { name: "foot" });
      cylinder(0.045, 0.075, [x, 0.075, z], STEEL, { segments: 8, name: "leveler" });
    }
  }

  // Strong cabinet silhouette: side shells are the recognizable arcade profile.
  const sideProfile: [number, number][] = [
    [-0.38, 0.04],
    [0.34, 0.04],
    [0.35, 0.90],
    [0.43, 1.00],
    [0.40, 1.08],
    [0.30, 1.14],
    [0.25, 1.64],
    [0.16, 1.88],
    [-0.27, 1.88],
    [-0.38, 1.75],
  ];

  for (const s of [-1, 1]) {
    b.extrude(sideProfile, {
      at: [s * 0.35, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.042,
      bevel: 0.008,
      smoothing: 1,
      color: PANEL_PAINT,
      name: `sideShell${s > 0 ? "L" : "R"}`,
      group: "cabinet",
    });

    const art = part(
      new THREE.PlaneGeometry(0.285, 1.48),
      "#ffffff",
      [s * 0.374, 0.91, -0.03],
      {
        dir: [s, 0, 0],
        axis: "z",
        up: [0, 1, 0],
        texture: SIDE_ART,
        name: `sideArt${s > 0 ? "L" : "R"}`,
      },
    );

    // A second translucent-looking dark frame around the side art.
    box([0.012, 1.52, 0.34], [s * 0.382, 0.91, -0.03], INK, {
      name: `sideArtFrame${s > 0 ? "L" : "R"}`,
    });
    box([0.014, 1.46, 0.295], [s * 0.391, 0.91, -0.03], "#241039", {
      name: `sideArtInset${s > 0 ? "L" : "R"}`,
    });
    // Re-seat the art on top of the inset.
    part(new THREE.PlaneGeometry(0.285, 1.48), "#ffffff", [s * 0.401, 0.91, -0.03], {
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: SIDE_ART,
      name: `sideArtFace${s > 0 ? "L" : "R"}`,
    });

    // Side neon rails follow the cabinet's stepped silhouette.
    rod([s * 0.405, 0.10, 0.37], [s * 0.405, 0.91, 0.37], 0.009, CYAN, {
      name: `sideRailLower${s}`,
    });
    rod([s * 0.405, 0.94, 0.42], [s * 0.405, 1.10, 0.35], 0.009, MAGENTA, {
      name: `sideRailControl${s}`,
    });
    rod([s * 0.405, 1.12, 0.31], [s * 0.405, 1.65, 0.255], 0.009, CYAN, {
      name: `sideRailSlope${s}`,
    });
    rod([s * 0.405, 1.67, 0.25], [s * 0.405, 1.84, 0.15], 0.009, MAGENTA, {
      name: `sideRailTop${s}`,
    });

    // Bolts around both side shells.
    const bolts: [number, number, number][] = [
      [s * 0.407, 0.13, 0.32],
      [s * 0.407, 0.86, 0.32],
      [s * 0.407, 1.10, 0.34],
      [s * 0.407, 1.70, 0.20],
      [s * 0.407, 1.82, -0.20],
      [s * 0.407, 0.18, -0.29],
    ];
    for (const p of bolts) sphere(0.014, p, YELLOW, { segments: 8, rings: 4, name: "sideRivet" });
  }

  // Main inner cabinet volumes.
  box([0.66, 0.86, 0.68], [0, 0.47, -0.015], BODY_PAINT, {
    name: "lowerCabinet",
    group: "cabinet",
  });
  box([0.655, 0.70, 0.57], [0, 1.40, -0.015], BODY_PAINT, {
    name: "upperCabinet",
    rotation: [5, 0, 0],
    group: "cabinet",
  });
  box([0.635, 0.11, 0.07], [0, 0.94, 0.34], INK, { name: "controlSupport" });

  // Lower front fascia and its decorative framing.
  box([0.635, 0.83, 0.055], [0, 0.50, 0.35], PANEL, { name: "frontFascia" });
  box([0.66, 0.035, 0.65], [0, 0.075, 0.315], INK, { name: "kickplate" });
  box([0.59, 0.025, 0.045], [0, 0.13, 0.385], MAGENTA, { name: "kickNeon" });
  box([0.55, 0.022, 0.042], [0, 0.86, 0.386], CYAN, { name: "lowerTrim" });

  // Vertical front frame rails.
  box([0.028, 0.82, 0.065], [-0.315, 0.51, 0.382], MAGENTA, { name: "frontRailL" });
  box([0.028, 0.82, 0.065], [0.315, 0.51, 0.382], CYAN, { name: "frontRailR" });
  box([0.64, 0.026, 0.055], [0, 0.90, 0.389], PURPLE, { name: "speakerHeader" });

  // Control panel, slightly proud of the body.
  const controlPanel = box([0.68, 0.135, 0.47], [0, 1.045, 0.36], PANEL_PAINT, {
    name: "controlDeck",
    rotation: [10, 0, 0],
  });
  const controlFront = part(new THREE.PlaneGeometry(0.615, 0.105), "#ffffff", [0, 1.035, 0.605], {
    dir: [0, 0, 1],
    axis: "z",
    texture: CONTROL_ART,
    name: "controlDeckGraphic",
  });
  glow(controlFront, 0.35);
  box([0.68, 0.022, 0.49], [0, 1.115, 0.36], MAGENTA, {
    name: "controlDeckLip",
    rotation: [10, 0, 0],
  });
  box([0.61, 0.016, 0.44], [0, 1.123, 0.36], CYAN, {
    name: "controlDeckInnerLip",
    rotation: [10, 0, 0],
  });

  // Joystick with chunky octagonal collar, shaft, ball, and side button.
  cylinder(0.075, 0.018, [-0.18, 1.135, 0.30], INK, { segments: 10, name: "joystickBase" });
  cylinder(0.057, 0.012, [-0.18, 1.148, 0.30], PURPLE, { segments: 10, name: "joystickCollar" });
  rod([-0.18, 1.145, 0.30], [-0.18, 1.275, 0.30], 0.018, STEEL, { name: "joystickStem" });
  const stickBall = sphere(0.058, [-0.18, 1.30, 0.30], MAGENTA, {
    segments: 10,
    rings: 6,
    name: "joystickBall",
  });
  glow(stickBall, 1.1);
  cylinder(0.035, 0.014, [0.205, 1.145, 0.34], CYAN, { segments: 10, name: "sideStartButton" });
  cylinder(0.022, 0.012, [0.205, 1.157, 0.34], INK, { segments: 10, name: "sideStartInset" });

  // Six big arcade buttons.
  const buttonData: [number, number, any][] = [
    [-0.04, 0.38, RED],
    [0.055, 0.39, YELLOW],
    [0.14, 0.40, CYAN],
    [0.055, 0.285, MAGENTA],
    [0.14, 0.29, ORANGE],
    [0.225, 0.30, PURPLE],
  ];
  for (let i = 0; i < buttonData.length; i++) {
    const [x, z, color] = buttonData[i];
    cylinder(0.038, 0.016, [x, 1.137, z], INK, { segments: 10, name: `buttonSocket${i}` });
    const button = cylinder(0.029, 0.024, [x, 1.158, z], color, {
      segments: 10,
      name: `button${i}`,
    });
    glow(button, 0.8);
    torusAt(b, [x, 1.151, z], 0.034, 0.004, INK, `buttonRing${i}`);
  }

  // Speaker panel and its glowing grille.
  box([0.42, 0.24, 0.035], [0, 0.80, 0.392], INK, { name: "speakerHousing" });
  const speaker = part(new THREE.PlaneGeometry(0.36, 0.18), "#ffffff", [0, 0.80, 0.414], {
    dir: [0, 0, 1],
    axis: "z",
    texture: SPEAKER_ART,
    name: "speakerGrille",
  });
  glow(speaker, 0.42);
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 9; x++) {
      sphere(0.008, [-0.145 + x * 0.036, 0.75 + y * 0.033, 0.422], CYAN, {
        segments: 6,
        rings: 4,
        scale: [1, 1, 0.35],
        name: "grillePin",
      });
    }
  }
  box([0.46, 0.018, 0.026], [0, 0.935, 0.416], MAGENTA, { name: "speakerTrimTop" });
  box([0.46, 0.018, 0.026], [0, 0.665, 0.416], PURPLE, { name: "speakerTrimBottom" });

  // Coin door assembly.
  box([0.35, 0.37, 0.045], [0, 0.34, 0.395], INK, { name: "coinDoorFrame" });
  const coinDoor = part(new THREE.PlaneGeometry(0.30, 0.33), "#ffffff", [0, 0.34, 0.421], {
    dir: [0, 0, 1],
    axis: "z",
    texture: COIN_ART,
    name: "coinDoorGraphic",
  });
  glow(coinDoor, 0.28);
  box([0.20, 0.018, 0.025], [0, 0.13, 0.424], CYAN, { name: "coinDoorBottomTrim" });
  box([0.22, 0.018, 0.025], [0, 0.55, 0.424], MAGENTA, { name: "coinDoorTopTrim" });
  cylinder(0.015, 0.012, [-0.115, 0.285, 0.434], YELLOW, {
    segments: 8,
    dir: [0, 0, 1],
    name: "coinLock",
  });
  cylinder(0.025, 0.014, [0.10, 0.245, 0.434], RED, {
    segments: 10,
    dir: [0, 0, 1],
    name: "coinReturn",
  });

  // Upper bezel and CRT screen.
  box([0.60, 0.50, 0.08], [0, 1.45, 0.29], INK, { name: "crtBezel" });
  box([0.545, 0.435, 0.035], [0, 1.45, 0.337], PURPLE, { name: "crtPurpleInset" });
  box([0.505, 0.395, 0.028], [0, 1.45, 0.359], INK, { name: "crtInnerBezel" });
  const screen = part(new THREE.PlaneGeometry(0.455, 0.345), "#ffffff", [0, 1.45, 0.378], {
    dir: [0, 0, 1],
    axis: "z",
    texture: SCREEN,
    name: "crtScreen",
  });
  glow(screen, 1.8);

  // CRT glass highlight and colored bezel bars.
  part(new THREE.PlaneGeometry(0.455, 0.345), "#ffffff", [0, 1.45, 0.381], {
    dir: [0, 0, 1],
    axis: "z",
    texture: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
        <path d="M22 25 Q110 8 184 18" stroke="#ffffff" stroke-width="9" opacity=".32" fill="none" stroke-linecap="round"/>
        <path d="M24 42 Q80 28 120 31" stroke="#ffffff" stroke-width="3" opacity=".25" fill="none"/>
      </svg>`,
      { size: 256 },
    ),
    name: "crtGlassReflection",
  });
  box([0.53, 0.018, 0.025], [0, 1.692, 0.386], MAGENTA, { name: "screenTopTrim" });
  box([0.53, 0.018, 0.025], [0, 1.208, 0.386], CYAN, { name: "screenBottomTrim" });
  box([0.018, 0.47, 0.025], [-0.275, 1.45, 0.386], CYAN, { name: "screenLeftTrim" });
  box([0.018, 0.47, 0.025], [0.275, 1.45, 0.386], MAGENTA, { name: "screenRightTrim" });

  // Small CRT corner rivets.
  for (const x of [-0.285, 0.285]) {
    for (const y of [1.22, 1.68]) {
      sphere(0.012, [x, y, 0.405], YELLOW, { segments: 8, rings: 4, name: "crtRivet" });
    }
  }

  // Marquee housing and luminous marquee face.
  box([0.67, 0.25, 0.18], [0, 1.765, 0.22], INK, { name: "marqueeHousing" });
  box([0.635, 0.21, 0.032], [0, 1.765, 0.323], MAGENTA, { name: "marqueeColorBed" });
  const marquee = part(new THREE.PlaneGeometry(0.60, 0.17), "#ffffff", [0, 1.765, 0.344], {
    dir: [0, 0, 1],
    axis: "z",
    texture: MARQUEE,
    name: "marqueeGraphic",
  });
  glow(marquee, 1.7);
  box([0.64, 0.018, 0.026], [0, 1.895, 0.22], CYAN, { name: "marqueeTopNeon" });
  box([0.64, 0.018, 0.026], [0, 1.635, 0.22], MAGENTA, { name: "marqueeBottomNeon" });
  box([0.018, 0.26, 0.026], [-0.327, 1.765, 0.22], CYAN, { name: "marqueeLeftNeon" });
  box([0.018, 0.26, 0.026], [0.327, 1.765, 0.22], MAGENTA, { name: "marqueeRightNeon" });

  // Marquee side caps and corner hardware.
  for (const s of [-1, 1]) {
    box([0.035, 0.23, 0.19], [s * 0.345, 1.765, 0.22], PANEL_LIT, {
      name: "marqueeSideCap",
    });
    sphere(0.014, [s * 0.365, 1.66, 0.30], YELLOW, { segments: 8, rings: 4, name: "marqueeRivet" });
    sphere(0.014, [s * 0.365, 1.87, 0.30], YELLOW, { segments: 8, rings: 4, name: "marqueeRivet" });
  }

  // Back edge and top service vents.
  box([0.62, 0.62, 0.045], [0, 1.40, -0.32], BODY_DARK, { name: "rearServicePanel" });
  for (let i = 0; i < 7; i++) {
    box([0.045, 0.012, 0.17], [-0.18 + i * 0.06, 1.825, -0.29], INK, {
      name: "topVent",
    });
  }

  // A few exposed synthwave cable/trim traces on the lower front.
  rod([-0.28, 0.16, 0.425], [-0.28, 0.60, 0.425], 0.006, PURPLE, { name: "frontCableL" });
  rod([0.28, 0.16, 0.425], [0.28, 0.60, 0.425], 0.006, BLUE, { name: "frontCableR" });
  rod([-0.25, 0.63, 0.426], [-0.12, 0.72, 0.426], 0.006, MAGENTA, { name: "frontCableAccentL" });
  rod([0.25, 0.63, 0.426], [0.12, 0.72, 0.426], 0.006, CYAN, { name: "frontCableAccentR" });

  // Tiny "READY!" service label under the controls.
  const ready = part(new THREE.PlaneGeometry(0.20, 0.053), "#ffffff", [0, 0.615, 0.429], {
    dir: [0, 0, 1],
    axis: "z",
    texture: SMALL_LABEL,
    name: "readyLabel",
  });
  glow(ready, 0.55);

  // Four cabinet corner caps make the blocky silhouette feel manufactured.
  for (const s of [-1, 1]) {
    sphere(0.022, [s * 0.36, 0.055, 0.35], CYAN, { segments: 8, rings: 4, name: "lowerCornerCap" });
    sphere(0.022, [s * 0.36, 0.985, 0.43], MAGENTA, { segments: 8, rings: 4, name: "controlCornerCap" });
    sphere(0.022, [s * 0.36, 1.14, 0.31], CYAN, { segments: 8, rings: 4, name: "screenCornerCap" });
    sphere(0.022, [s * 0.36, 1.86, 0.16], MAGENTA, { segments: 8, rings: 4, name: "topCornerCap" });
  }

  return b.root;
}

function torusAt(
  b: ReturnType<typeof createBuilder>,
  at: [number, number, number],
  radius: number,
  tube: number,
  color: any,
  name: string,
) {
  return b.part(new THREE.TorusGeometry(radius, tube, 6, 12), color, {
    at,
    rotation: [90, 0, 0],
    flat: true,
    name,
  });
}
