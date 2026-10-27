import * as THREE from "three";
import { createBuilder, rng, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Neon Vector Arcade Cabinet",
  description: "A stylized 1980s synthwave arcade cabinet with a glowing marquee, CRT screen, joystick, buttons, coin door, neon trim, and chunky low-poly construction.",
};

export default function build() {
  const b = createBuilder({ name: "neon-vector-arcade", detail: 1 });

  const INK = "#120b25";
  const BODY = "#24134a";
  const BODY_DARK = "#170d31";
  const EDGE = "#44206f";
  const MAGENTA = "#ff247f";
  const PINK = "#ff5db4";
  const CYAN = "#19e6ff";
  const BLUE = "#315bff";
  const PURPLE = "#8e3dff";
  const YELLOW = "#ffd447";
  const ORANGE = "#ff7b30";
  const METAL = "#73658c";
  const BLACK = "#070510";
  const CREAM = "#f5ddad";

  const marqueeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 160">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#26105c"/>
          <stop offset=".5" stop-color="#e71987"/>
          <stop offset="1" stop-color="#081b69"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="7" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="512" height="160" rx="14" fill="url(#bg)"/>
      <path d="M-20 136 L125 22 M80 170 L250 8 M260 170 L430 0 M390 170 L550 40"
        stroke="#35eaff" stroke-width="4" opacity=".45"/>
      <path d="M0 120 Q125 75 245 116 T512 92" fill="none" stroke="#ffdc44" stroke-width="5" opacity=".8"/>
      <text x="256" y="106" text-anchor="middle"
        font-family="Arial Black, sans-serif" font-size="66" font-style="italic"
        fill="#fff4ff" stroke="#ff2d9b" stroke-width="10" paint-order="stroke"
        filter="url(#glow)">VECTOR</text>
      <text x="256" y="141" text-anchor="middle"
        font-family="monospace" font-size="16" letter-spacing="8" fill="#65f6ff">NIGHT DRIVE</text>
    </svg>`,
    { size: 512 },
  );

  const screenTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 330">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#150b52"/>
          <stop offset=".62" stop-color="#321064"/>
          <stop offset="1" stop-color="#e52b74"/>
        </linearGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <rect width="512" height="330" fill="url(#sky)"/>
      <circle cx="390" cy="84" r="45" fill="#ffb1d8" opacity=".75" filter="url(#soft)"/>
      <circle cx="390" cy="84" r="35" fill="#ffd16a"/>
      <path d="M0 236 Q120 205 244 238 T512 220" fill="none" stroke="#ff2b92" stroke-width="8" opacity=".7"/>
      <path d="M0 270 Q90 250 190 272 T380 258 T512 265" fill="none" stroke="#16ecff" stroke-width="4"/>
      <g stroke="#35dcff" stroke-width="2" opacity=".65">
        <path d="M256 205 L256 330 M225 207 L188 330 M287 207 L324 330 M196 214 L105 330 M316 214 L407 330"/>
        <path d="M0 300 H512 M0 316 H512"/>
      </g>
      <path d="M65 215 L120 165 L175 215 L230 155 L285 215" fill="none" stroke="#fff15d" stroke-width="5"/>
      <text x="256" y="54" text-anchor="middle" font-family="monospace" font-size="24"
        letter-spacing="5" fill="#8fffff">HIGH SCORE 1986</text>
      <text x="256" y="105" text-anchor="middle" font-family="Arial Black" font-size="40"
        font-style="italic" fill="#ffffff" stroke="#ff238b" stroke-width="5" paint-order="stroke">000420</text>
    </svg>`,
    { size: 512 },
  );

  const coinTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <rect width="128" height="128" rx="14" fill="#21152e"/>
      <rect x="7" y="7" width="114" height="114" rx="10" fill="none" stroke="#d9a94f" stroke-width="5"/>
      <circle cx="64" cy="58" r="32" fill="#6d466d" stroke="#f2c75c" stroke-width="4"/>
      <path d="M48 55 Q64 31 80 55 L75 77 H53Z" fill="#ffd45e"/>
      <text x="64" y="105" text-anchor="middle" font-family="monospace" font-size="13" fill="#ffd45e">INSERT</text>
    </svg>`,
    { size: 128 },
  );

  const labelTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 64">
      <rect width="256" height="64" fill="#0e0920"/>
      <path d="M0 48 L70 12 M48 64 L145 8 M142 64 L220 15" stroke="#ff218e" stroke-width="5"/>
      <text x="128" y="43" text-anchor="middle" font-family="Arial Black" font-size="29"
        font-style="italic" fill="#55f5ff">INSERT COIN</text>
    </svg>`,
    { size: 256 },
  );

  function box(
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    opts: Record<string, unknown> = {},
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      flat: true,
      ...opts,
    });
  }

  function cyl(
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    opts: Record<string, unknown> = {},
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, 10), color, {
      at,
      flat: true,
      ...opts,
    });
  }

  // Heavy floor plinth: the cabinet visibly stands on the floor.
  box([0.94, 0.16, 0.65], [0, 0.08, 0], BODY_DARK);
  box([1.02, 0.045, 0.70], [0, 0.17, 0], CYAN);
  box([0.93, 0.035, 0.66], [0, 0.195, 0], MAGENTA);

  // Main upright cabinet, separated into chunky stepped volumes for a readable silhouette.
  box([0.86, 0.78, 0.54], [0, 0.58, -0.015], BODY);
  box([0.86, 0.58, 0.54], [0, 1.24, -0.015], BODY_DARK);
  box([0.86, 0.34, 0.54], [0, 1.70, -0.015], BODY);

  // Side cheeks make the cabinet feel like molded arcade furniture.
  box([0.055, 1.66, 0.61], [0.455, 0.99, -0.01], EDGE);
  box([0.055, 1.66, 0.61], [-0.455, 0.99, -0.01], EDGE);
  box([0.025, 1.54, 0.625], [0.49, 1.02, 0.0], MAGENTA);
  box([0.025, 1.54, 0.625], [-0.49, 1.02, 0.0], CYAN);

  // Sloped control deck and its bright front lip.
  const deck = box([0.84, 0.20, 0.58], [0, 0.79, 0.285], PURPLE, { rotation: [-10, 0, 0] });
  box([0.86, 0.045, 0.59], [0, 0.685, 0.30], MAGENTA, { rotation: [-10, 0, 0] });
  box([0.72, 0.025, 0.02], [0, 0.905, 0.585], CYAN, { rotation: [-10, 0, 0] });

  // CRT bezel and deep screen cavity on the front.
  box([0.70, 0.54, 0.075], [0, 1.31, 0.305], BLACK, { rotation: [-7, 0, 0] });
  box([0.64, 0.46, 0.022], [0, 1.315, 0.347], "#32104f", {
    rotation: [-7, 0, 0],
    texture: screenTexture,
  });
  box([0.73, 0.035, 0.08], [0, 1.60, 0.31], CYAN, { rotation: [-7, 0, 0] });
  box([0.73, 0.035, 0.08], [0, 1.025, 0.31], MAGENTA, { rotation: [-7, 0, 0] });
  box([0.035, 0.54, 0.08], [0.365, 1.31, 0.31], MAGENTA, { rotation: [-7, 0, 0] });
  box([0.035, 0.54, 0.08], [-0.365, 1.31, 0.31], CYAN, { rotation: [-7, 0, 0] });

  // Screen glass highlight strip.
  box([0.52, 0.018, 0.006], [0, 1.54, 0.365], "#b7ffff", { rotation: [-7, 0, 0] });

  // Marquee crown, framed by a chunky neon border.
  box([0.90, 0.32, 0.14], [0, 1.82, 0.285], MAGENTA, { rotation: [-5, 0, 0] });
  box([0.80, 0.235, 0.018], [0, 1.82, 0.365], "#ffffff", {
    rotation: [-5, 0, 0],
    texture: marqueeTexture,
  });
  box([0.91, 0.035, 0.16], [0, 1.985, 0.27], CYAN, { rotation: [-5, 0, 0] });
  box([0.91, 0.035, 0.16], [0, 1.66, 0.30], BLUE, { rotation: [-5, 0, 0] });

  // Control panel graphic.
  box([0.70, 0.012, 0.36], [0, 0.91, 0.285], "#1b0c3b", {
    rotation: [-10, 0, 0],
    texture: labelTexture,
  });

  // Joystick stalk, ball, and square mounting plate.
  box([0.16, 0.018, 0.16], [-0.235, 0.92, 0.30], BLACK, { rotation: [-10, 0, 0] });
  cyl(0.027, 0.18, [-0.235, 1.015, 0.295], METAL, { rotation: [0, 0, 0] });
  cyl(0.072, 0.085, [-0.235, 1.115, 0.295], MAGENTA);
  cyl(0.045, 0.09, [-0.235, 1.12, 0.305], PINK);

  // Three glowing action buttons in a diagonal 80s arrangement.
  const buttons = [
    [0.03, 0.945, 0.335, CYAN],
    [0.14, 0.955, 0.345, YELLOW],
    [0.25, 0.965, 0.355, MAGENTA],
  ] as const;
  for (const [x, y, z, c] of buttons) {
    cyl(0.043, 0.025, [x, y, z], BLACK, { rotation: [-10, 0, 0] });
    const cap = cyl(0.032, 0.035, [x, y + 0.018, z], c, { rotation: [-10, 0, 0] });
    glow(cap, 1.7);
  }

  // Tiny start/select buttons.
  for (const x of [-0.02, 0.065]) {
    const start = cyl(0.017, 0.018, [x, 0.94, 0.405], CREAM, { rotation: [-10, 0, 0] });
    glow(start, 0.8);
  }

  // Coin door and coin slot on the lower front.
  box([0.44, 0.40, 0.035], [0, 0.46, 0.305], "#10091d");
  box([0.36, 0.32, 0.018], [0, 0.47, 0.328], "#29153d");
  const coin = b.part(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", {
    at: [0, 0.49, 0.352],
    dir: [0, 0, 1],
    axis: "z",
    texture: coinTexture,
  });
  box([0.12, 0.025, 0.012], [0, 0.685, 0.35], METAL);
  box([0.16, 0.018, 0.012], [0, 0.255, 0.35], CYAN);

  // Coin return slot, door hinges, and warning LEDs.
  box([0.13, 0.025, 0.025], [0, 0.33, 0.36], BLACK);
  box([0.12, 0.009, 0.008], [0, 0.334, 0.375], YELLOW);
  for (const x of [-0.19, 0.19]) {
    cyl(0.018, 0.012, [x, 0.44, 0.35], METAL, { dir: [0, 0, 1] });
  }
  const ledL = cyl(0.014, 0.012, [-0.29, 0.68, 0.35], MAGENTA, { dir: [0, 0, 1] });
  const ledR = cyl(0.014, 0.012, [0.29, 0.68, 0.35], CYAN, { dir: [0, 0, 1] });
  glow(ledL, 2);
  glow(ledR, 2);

  // Vent slots on the right lower side: little details make the cabinet feel manufactured.
  for (let i = 0; i < 6; i++) {
    box([0.012, 0.025, 0.18], [0.465, 0.30 + i * 0.045, -0.12], BLACK, {
      rotation: [0, 0, 0],
    });
  }

  // Rear-facing top cap and angular feet/shadow breaks.
  box([0.86, 0.07, 0.56], [0, 2.015, -0.02], BODY_DARK);
  box([0.72, 0.035, 0.025], [0, 0.235, 0.29], PURPLE);
  box([0.18, 0.05, 0.55], [-0.34, 0.235, -0.08], BODY_DARK);
  box([0.18, 0.05, 0.55], [0.34, 0.235, -0.08], BODY_DARK);

  // Side neon rods: physical tubes with a clearly readable synthwave outline.
  const leftNeon = b.rod([-0.505, 0.25, 0.31], [-0.505, 1.95, 0.27], 0.012, {
    color: CYAN,
    caps: "round",
    section: { ngon: 6 },
  });
  const rightNeon = b.rod([0.505, 0.25, 0.31], [0.505, 1.95, 0.27], 0.012, {
    color: MAGENTA,
    caps: "round",
    section: { ngon: 6 },
  });
  glow(leftNeon, 2.2);
  glow(rightNeon, 2.2);

  // Small decorative lightning bolts on the side faces.
  const bolt = [
    [-0.035, 0.13],
    [0.02, 0.13],
    [-0.01, 0.0],
    [0.055, 0.0],
    [-0.045, -0.19],
    [-0.015, -0.06],
    [-0.065, -0.06],
  ] as [number, number][];
  b.extrude(bolt, {
    at: [0.515, 1.05, 0.0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.008,
    color: YELLOW,
    bevel: 0.002,
  });
  b.extrude(bolt, {
    at: [-0.515, 1.05, 0.0],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.008,
    color: PINK,
    bevel: 0.002,
  });

  // A pair of tiny service screws below the marquee.
  for (const x of [-0.34, 0.34]) {
    cyl(0.012, 0.012, [x, 1.70, 0.37], METAL, { dir: [0, 0, 1] });
  }

  return b.root;
}
