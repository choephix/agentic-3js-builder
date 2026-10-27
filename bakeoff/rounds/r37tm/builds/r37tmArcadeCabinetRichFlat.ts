import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Neon Vector Arcade Cabinet",
  description:
    "A stylized 1980s upright arcade cabinet with a magenta-and-cyan synthwave palette, glowing marquee, CRT screen, joystick, buttons, coin door, vents, rivets, and neon side trim.",
};

export default function build() {
  const b = createBuilder({ name: "neon-vector-arcade", detail: 1 });

  const BLACK = "#090817";
  const DEEP = "#11102a";
  const VIOLET = "#21134b";
  const PURPLE = "#482080";
  const MAGENTA = "#e928a8";
  const HOTPINK = "#ff4fc8";
  const CYAN = "#20e8e5";
  const BLUE = "#2d73ed";
  const ORANGE = "#ff8b35";
  const YELLOW = "#ffd447";
  const CREAM = "#ffe9c7";
  const STEEL = "#55536e";
  const DARKSTEEL = "#29273c";
  const RED = "#f33c55";

  const modelRng = rng(1984);

  function box(
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    rotation?: [number, number, number],
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      name,
      flat: true,
    });
  }

  function cylinder(
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    radial = 10,
    rotation?: [number, number, number],
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, height, radial, 1),
      color,
      { at, rotation, name, flat: true },
    );
  }

  function neonBar(
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    strength = 1.8,
    rotation?: [number, number, number],
  ) {
    const part = box(name, size, at, color, rotation);
    glow(part, strength);
    return part;
  }

  // The cabinet's side silhouette. The outline is drawn in local Z/Y and
  // extruded sideways, giving the whole machine its unmistakable profile.
  const sideProfile: [number, number, "sharp"][] = [
    [-0.40, 0.04, "sharp"],
    [0.38, 0.04, "sharp"],
    [0.38, 0.96, "sharp"],
    [0.31, 1.08, "sharp"],
    [0.29, 1.70, "sharp"],
    [0.21, 1.82, "sharp"],
    [-0.30, 1.82, "sharp"],
    [-0.40, 1.70, "sharp"],
  ];

  for (const side of [-1, 1]) {
    const panel = b.extrude(sideProfile, {
      at: [side * 0.37, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.034,
      bevel: 0.008,
      color: side > 0 ? PURPLE : VIOLET,
      name: `sidePanel${side > 0 ? "L" : "R"}`,
      group: "cabinet",
    });

    // Large graphic lightning slash on each side.
    b.extrude(
      [
        [-0.33, 0.60, "sharp"],
        [0.11, 0.60, "sharp"],
        [-0.18, 1.17, "sharp"],
        [0.29, 1.17, "sharp"],
        [-0.05, 1.64, "sharp"],
        [-0.37, 1.18, "sharp"],
        [-0.02, 1.18, "sharp"],
      ],
      {
        at: [side * 0.391, 0, 0],
        x: [0, 0, side],
        y: [0, 1, 0],
        thickness: 0.008,
        color: side > 0 ? MAGENTA : BLUE,
        name: `sideLightning${side > 0 ? "L" : "R"}`,
      },
    );

    // Cyan and pink perimeter accents on the side.
    neonBar(
      `sideNeonLow${side > 0 ? "L" : "R"}`,
      [0.025, 0.018, 0.54],
      [side * 0.394, 0.48, 0.10],
      CYAN,
      1.4,
    );
    neonBar(
      `sideNeonHigh${side > 0 ? "L" : "R"}`,
      [0.025, 0.018, 0.42],
      [side * 0.394, 1.48, 0.07],
      HOTPINK,
      1.4,
    );
  }

  // Main lower cabinet shell and the shadowed rear cavity.
  box("lowerCabinet", [0.70, 0.88, 0.72], [0, 0.48, -0.01], DEEP);
  box("lowerFrontInset", [0.57, 0.66, 0.035], [0, 0.51, 0.365], BLACK);
  box("rearUpperShell", [0.70, 0.67, 0.30], [0, 1.42, -0.22], VIOLET);

  // Front bevel strips, arranged like chunky molded plastic.
  box("frontLeftBevel", [0.055, 0.88, 0.065], [-0.335, 0.49, 0.345], PURPLE);
  box("frontRightBevel", [0.055, 0.88, 0.065], [0.335, 0.49, 0.345], PURPLE);
  box("frontTopBevel", [0.66, 0.07, 0.065], [0, 0.93, 0.345], PURPLE);
  box("frontBottomBevel", [0.66, 0.07, 0.065], [0, 0.075, 0.345], DARKSTEEL);

  // Vertical synthwave stripes on the lower front.
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.061;
    const c = i % 2 === 0 ? BLUE : MAGENTA;
    box(`frontStripe${i}`, [0.027, 0.52, 0.009], [x, 0.51, 0.388], c);
  }

  // Marquee header, slightly projecting over the screen.
  box("marqueeHousing", [0.66, 0.25, 0.15], [0, 1.69, 0.285], BLACK, [-8, 0, 0]);
  box("marqueeBorder", [0.61, 0.19, 0.026], [0, 1.69, 0.365], MAGENTA, [-8, 0, 0]);

  const marqueeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 180">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#10082b"/>
          <stop offset="0.48" stop-color="#6c178d"/>
          <stop offset="1" stop-color="#081c57"/>
        </linearGradient>
        <filter id="g"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <rect width="600" height="180" fill="url(#bg)"/>
      <path d="M-20 145 L180 20 L230 20 L35 160Z M350 180 L580 30 L625 35 L410 180Z"
            fill="#ff2cae" opacity=".42" filter="url(#g)"/>
      <path d="M0 148 L190 20 M355 176 L590 25" stroke="#20e8e5" stroke-width="7"/>
      <text x="300" y="111" text-anchor="middle"
        font-family="sans-serif" font-style="italic" font-weight="900"
        font-size="66" letter-spacing="5" fill="#fff1d1"
        stroke="#ff35b6" stroke-width="8" paint-order="stroke">VECTOR</text>
      <text x="300" y="145" text-anchor="middle"
        font-family="sans-serif" font-weight="bold" font-size="17"
        letter-spacing="9" fill="#20e8e5">NIGHT DRIVE</text>
    </svg>`,
    { size: 512 },
  );

  const marquee = b.part(
    new THREE.PlaneGeometry(0.565, 0.165),
    "#ffffff",
    {
      at: [0, 1.69, 0.382],
      dir: [0, 0, 1],
      axis: "z",
      rotation: [-8, 0, 0],
      texture: marqueeTexture,
      name: "marqueeArt",
    },
  );
  glow(marquee, 1.5);

  // CRT screen bezel.
  box("screenBezel", [0.60, 0.51, 0.12], [0, 1.34, 0.275], BLACK, [-5, 0, 0]);
  box("screenInnerBezel", [0.535, 0.445, 0.045], [0, 1.34, 0.342], DARKSTEEL, [-5, 0, 0]);

  const screenGlow = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <defs>
        <linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#07123f"/>
          <stop offset=".5" stop-color="#15177a"/>
          <stop offset="1" stop-color="#09072b"/>
        </linearGradient>
        <filter id="b"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <rect width="400" height="300" fill="url(#s)"/>
      <g opacity=".27" stroke="#28d9ff" stroke-width="2">
        <path d="M0 30H400M0 60H400M0 90H400M0 120H400M0 150H400M0 180H400M0 210H400M0 240H400M0 270H400"/>
      </g>
      <path d="M50 250 L115 150 L165 192 L242 72 L355 250"
        fill="none" stroke="#ff24b9" stroke-width="12" opacity=".8" filter="url(#b)"/>
      <path d="M50 250 L115 150 L165 192 L242 72 L355 250"
        fill="none" stroke="#28f5e8" stroke-width="4"/>
      <circle cx="242" cy="72" r="13" fill="#fff3a5"/>
      <path d="M80 225 Q170 155 315 218" fill="none" stroke="#fff4ba" stroke-width="4"/>
      <text x="200" y="45" text-anchor="middle" font-family="monospace"
        font-size="18" font-weight="bold" fill="#ffed9a">HIGH SCORE 1984</text>
      <text x="200" y="282" text-anchor="middle" font-family="monospace"
        font-size="15" fill="#22e8e6">1UP 004200</text>
    </svg>`,
    { size: 512 },
  );

  const screen = b.part(
    new THREE.PlaneGeometry(0.505, 0.397),
    "#ffffff",
    {
      at: [0, 1.34, 0.371],
      dir: [0, 0, 1],
      axis: "z",
      rotation: [-5, 0, 0],
      texture: screenGlow,
      name: "crtScreen",
    },
  );
  glow(screen, 1.8);

  // CRT glass highlight and scanline-like top bar.
  box("screenGlassTop", [0.46, 0.012, 0.008], [0, 1.53, 0.381], CYAN, [-5, 0, 0]);
  box("screenGlassGlow", [0.32, 0.008, 0.008], [-0.08, 1.20, 0.381], MAGENTA, [-5, 0, 0]);

  // Control deck, sloping toward the player.
  box("controlDeckBody", [0.68, 0.11, 0.39], [0, 1.045, 0.285], BLACK, [-17, 0, 0]);
  box("controlDeckInset", [0.61, 0.025, 0.33], [0, 1.105, 0.31], PURPLE, [-17, 0, 0]);
  box("controlFrontLip", [0.67, 0.055, 0.045], [0, 0.99, 0.455], MAGENTA, [-17, 0, 0]);

  // Neon line around the edge of the control panel.
  neonBar("deckCyanLip", [0.59, 0.012, 0.014], [0, 1.122, 0.472], CYAN, 1.7, [-17, 0, 0]);
  neonBar("deckPinkLip", [0.52, 0.012, 0.012], [0, 1.015, 0.48], HOTPINK, 1.4, [-17, 0, 0]);

  // Joystick shaft and ball.
  cylinder("joystickMount", 0.075, 0.018, [-0.19, 1.17, 0.235], DARKSTEEL, 12);
  const shaft = b.part(
    new THREE.CylinderGeometry(0.018, 0.022, 0.16, 8),
    STEEL,
    { at: [-0.19, 1.245, 0.225], rotation: [-12, 0, 0], name: "joystickShaft" },
  );
  cylinder("joystickBall", 0.052, 0.085, [-0.19, 1.325, 0.205], MAGENTA, 12);
  cylinder("joystickBallHighlight", 0.014, 0.006, [-0.21, 1.35, 0.18], CREAM, 8);

  // Four colorful arcade buttons.
  const buttons: Array<[number, string, string]> = [
    [-0.035, CYAN, "cyan"],
    [0.055, HOTPINK, "pink"],
    [0.145, YELLOW, "yellow"],
    [0.235, ORANGE, "orange"],
  ];
  for (const [x, c, label] of buttons) {
    cylinder(`buttonRing${label}`, 0.041, 0.014, [x, 1.165, 0.25], BLACK, 12);
    const button = cylinder(`button${label}`, 0.032, 0.022, [x, 1.181, 0.25], c, 12);
    glow(button, 1.25);
    cylinder(`buttonShine${label}`, 0.009, 0.006, [x - 0.011, 1.196, 0.238], CREAM, 8);
  }

  // Small illuminated start/select buttons on the left.
  for (const [x, c, label] of [
    [-0.285, BLUE, "start"],
    [-0.245, MAGENTA, "select"],
  ] as const) {
    cylinder(`smallRing${label}`, 0.024, 0.012, [x, 1.151, 0.25], BLACK, 10);
    const p = cylinder(`smallButton${label}`, 0.017, 0.016, [x, 1.164, 0.25], c, 10);
    glow(p, 1.1);
  }

  // Instruction strips behind the controls.
  box("instructionStrip", [0.60, 0.022, 0.006], [0, 0.985, 0.47], CREAM, [-17, 0, 0]);
  box("instructionColorA", [0.13, 0.012, 0.008], [-0.18, 0.999, 0.476], CYAN, [-17, 0, 0]);
  box("instructionColorB", [0.13, 0.012, 0.008], [0.18, 0.999, 0.476], MAGENTA, [-17, 0, 0]);

  // Coin door assembly.
  box("coinDoorShadow", [0.30, 0.39, 0.025], [0, 0.405, 0.391], BLACK);
  box("coinDoor", [0.255, 0.34, 0.018], [0, 0.42, 0.408], DARKSTEEL);
  box("coinDoorTop", [0.22, 0.025, 0.012], [0, 0.575, 0.423], STEEL);
  box("coinDoorBottom", [0.22, 0.025, 0.012], [0, 0.265, 0.423], STEEL);
  box("coinDoorLeft", [0.018, 0.30, 0.012], [-0.105, 0.42, 0.423], STEEL);
  box("coinDoorRight", [0.018, 0.30, 0.012], [0.105, 0.42, 0.423], STEEL);

  // Coin return slot and coin slot.
  box("coinSlotOuter", [0.12, 0.045, 0.012], [0, 0.50, 0.432], BLACK);
  box("coinSlotGlow", [0.085, 0.009, 0.008], [0, 0.50, 0.439], CYAN);
  const coinReturn = box("coinReturn", [0.10, 0.055, 0.016], [0, 0.335, 0.433], MAGENTA);
  glow(coinReturn, 1.3);
  box("coinDoorLabel", [0.16, 0.018, 0.008], [0, 0.238, 0.433], CREAM);

  // Two little coin icons.
  for (const x of [-0.058, 0.058]) {
    cylinder("coinIcon", 0.024, 0.008, [x, 0.42, 0.436], YELLOW, 12, [90, 0, 0]);
    cylinder("coinIconCenter", 0.007, 0.010, [x, 0.42, 0.442], ORANGE, 8, [90, 0, 0]);
  }

  // Ventilation grille on the lower-right front.
  box("ventPanel", [0.19, 0.15, 0.018], [0.21, 0.72, 0.405], BLACK);
  for (let i = 0; i < 7; i++) {
    box(
      `ventSlot${i}`,
      [0.135, 0.009, 0.008],
      [0.21, 0.665 + i * 0.019, 0.418],
      i % 2 === 0 ? CYAN : BLUE,
    );
  }

  // A small warning badge on the left of the coin door.
  const badge = b.part(
    new THREE.CylinderGeometry(0.054, 0.054, 0.012, 8),
    ORANGE,
    {
      at: [-0.225, 0.72, 0.425],
      dir: [0, 0, 1],
      name: "warningBadge",
    },
  );
  cylinder("warningBadgeInner", 0.035, 0.014, [-0.225, 0.72, 0.433], BLACK, 8, [90, 0, 0]);
  box("warningSlash", [0.012, 0.055, 0.008], [-0.225, 0.72, 0.443], ORANGE, [0, 0, 35]);

  // Cabinet feet and small caster-like pads.
  for (const x of [-0.27, 0.27]) {
    box("footBlock", [0.16, 0.10, 0.20], [x, 0.055, -0.12], BLACK);
    cylinder("footPad", 0.068, 0.035, [x, 0.018, 0.02], DARKSTEEL, 8);
    cylinder("footGlow", 0.032, 0.008, [x, 0.039, 0.02], BLUE, 8);
  }

  // Rear power cable, tucked low and behind the cabinet.
  const cablePath = [
    [0.22, 0.16, -0.39],
    [0.29, 0.12, -0.47],
    [0.30, 0.08, -0.54],
  ] as [number, number, number][];
  b.sweep(cablePath, 0.012, {
    color: BLACK,
    caps: "round",
    name: "powerCable",
  });

  // A few exposed fasteners make the molded cabinet feel physical.
  const rivetPositions: Array<[number, number]> = [
    [-0.305, 0.86],
    [0.305, 0.86],
    [-0.305, 0.16],
    [0.305, 0.16],
    [-0.305, 1.61],
    [0.305, 1.61],
  ];
  for (const [x, y] of rivetPositions) {
    cylinder("cabinetRivet", 0.012, 0.012, [x, y, 0.389], STEEL, 8, [90, 0, 0]);
    cylinder("cabinetRivetDot", 0.004, 0.014, [x, y, 0.397], CREAM, 6, [90, 0, 0]);
  }

  // Floating neon pixels around the cabinet front: tiny geometry details rather
  // than decals, keeping the low-poly toy-like construction.
  const pixelPattern = [
    [-0.29, 0.88, CYAN],
    [-0.25, 0.88, MAGENTA],
    [-0.21, 0.88, CYAN],
    [0.21, 0.88, MAGENTA],
    [0.25, 0.88, CYAN],
    [0.29, 0.88, MAGENTA],
  ] as Array<[number, number, string]>;

  for (let i = 0; i < pixelPattern.length; i++) {
    const [x, y, c] = pixelPattern[i];
    const p = box(`frontPixel${i}`, [0.022, 0.022, 0.012], [x, y, 0.406], c);
    glow(p, 1.4);
  }

  // A tiny service lock under the control deck.
  cylinder("serviceLockOuter", 0.025, 0.012, [0.29, 0.88, 0.424], STEEL, 10, [90, 0, 0]);
  box("serviceLockSlot", [0.006, 0.027, 0.009], [0.29, 0.88, 0.433], BLACK, [0, 0, 28]);

  // Decorative side studs, deliberately mirrored.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const y = 0.25 + i * 0.34;
      const stud = cylinder(
        `sideStud${side > 0 ? "L" : "R"}${i}`,
        0.015,
        0.012,
        [side * 0.397, y, 0.18],
        i % 2 ? CYAN : MAGENTA,
        8,
        [0, 0, 90],
      );
      if (i % 2 === 0) glow(stud, 1.1);
    }
  }

  // Keep the deterministic random source meaningfully part of construction:
  // a handful of tiny, fixed "wear pixels" on the side panels.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const x = -0.30 + modelRng() * 0.55;
      const y = 0.22 + modelRng() * 1.35;
      box(
        `sideWear${side > 0 ? "L" : "R"}${i}`,
        [0.006, 0.018, 0.006],
        [side * 0.399, y, x],
        i % 2 ? BLUE : MAGENTA,
      );
    }
  }

  return b.root;
}
