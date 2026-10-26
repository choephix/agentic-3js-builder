import * as THREE from "three";
import { type Builder, createBuilder, svg, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "synthwave-arcade-cabinet",
  description:
    "A stylized 1980s upright arcade cabinet with a chunky angled silhouette, dark violet housing, cyan and magenta neon trim, marquee, control deck, screen, coin door, and synthwave proportions.",
};

export const PALETTE = {
  CABINET: "#21153f",
  CABINET_DARK: "#120d28",
  CABINET_SIDE: "#34205c",
  EDGE_PURPLE: "#6e35b7",
  MAGENTA: "#ff237f",
  MAGENTA_DARK: "#9b155d",
  CYAN: "#20e7ed",
  CYAN_DARK: "#138fa7",
  SCREEN: "#090b24",
  SCREEN_BLUE: "#152a68",
  BLACK: "#070712",
  METAL: "#8d91ad",
  METAL_DARK: "#39364f",
  COIN: "#f7bb52",
  WHITE: "#f4efff",
  ORANGE: "#ff6b38",
  FLOOR: "#24152e",
} as const;

const SCREEN_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 285">
    <defs>
      <linearGradient id="screen" x2="0" y2="1">
        <stop offset="0" stop-color="#151b61"/>
        <stop offset="0.55" stop-color="#090d35"/>
        <stop offset="1" stop-color="#04051a"/>
      </linearGradient>
      <radialGradient id="bloom" cx="50%" cy="54%" r="55%">
        <stop offset="0" stop-color="#ff237f" stop-opacity=".28"/>
        <stop offset="1" stop-color="#ff237f" stop-opacity="0"/>
      </radialGradient>
      <pattern id="scan" width="460" height="8" patternUnits="userSpaceOnUse">
        <rect width="460" height="3" fill="#20e7ed" opacity=".2"/>
        <rect y="3" width="460" height="5" fill="#020316" opacity=".28"/>
      </pattern>
      <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M24 0H0V24" fill="none" stroke="#20e7ed" stroke-opacity=".13" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="460" height="285" fill="url(#screen)"/>
    <rect width="460" height="285" fill="url(#bloom)"/>
    <path d="M0 218H460" stroke="#ff237f" stroke-width="4" opacity=".6"/>
    <path d="M0 224H460" stroke="#20e7ed" stroke-width="2"/>
    <path d="M0 224L130 145L190 195L280 112L460 224" fill="none" stroke="#20e7ed" stroke-width="3"/>
    <path d="M0 224L130 145L190 195L280 112L460 224" fill="none" stroke="#ff237f" stroke-width="9" opacity=".18"/>
    <path d="M230 224V285M184 224L140 285M276 224L320 285M92 224L0 272M368 224L460 272" stroke="#20e7ed" stroke-opacity=".3" stroke-width="2"/>
    <rect width="460" height="285" fill="url(#grid)"/>
    <rect width="460" height="285" fill="url(#scan)"/>
    <g fill="#f4efff" font-family="monospace" font-weight="bold">
      <text x="18" y="30" font-size="14">PLAYER 1</text>
      <text x="361" y="30" font-size="14">000240</text>
      <text x="181" y="52" font-size="13" fill="#20e7ed">SYNTH CITY</text>
    </g>
    <g fill="#ff237f">
      <rect x="18" y="42" width="55" height="4"/>
      <rect x="386" y="42" width="56" height="4"/>
    </g>
    <g fill="#f4efff">
      <rect x="213" y="177" width="7" height="7"/>
      <rect x="228" y="162" width="7" height="7"/>
      <rect x="243" y="177" width="7" height="7"/>
    </g>
  </svg>`,
  { size: 512 },
);

const SIDE_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 1770">
    <defs>
      <linearGradient id="violet" x2="0" y2="1">
        <stop stop-color="#55318c"/>
        <stop offset=".48" stop-color="#2b1956"/>
        <stop offset="1" stop-color="#160e32"/>
      </linearGradient>
      <pattern id="grid" width="38" height="38" patternUnits="userSpaceOnUse">
        <path d="M38 0H0V38" fill="none" stroke="#090714" stroke-opacity=".45" stroke-width="2"/>
      </pattern>
    </defs>
    <rect width="430" height="1770" fill="url(#violet)"/>
    <rect width="430" height="1770" fill="url(#grid)"/>
    <path d="M22 80H400M22 1690H400" stroke="#20e7ed" stroke-width="9"/>
    <path d="M28 100H390M40 1658H380" stroke="#ff237f" stroke-width="5"/>
    <path d="M40 1400L110 1320L77 1160L196 1010L164 820L295 680L270 500L390 350" fill="none" stroke="#20e7ed" stroke-opacity=".35" stroke-width="8"/>
    <g fill="#f4efff">
      <circle cx="70" cy="220" r="4"/><circle cx="350" cy="310" r="3"/><circle cx="90" cy="590" r="3"/>
      <circle cx="330" cy="870" r="4"/><circle cx="65" cy="1080" r="3"/><circle cx="360" cy="1260" r="3"/>
      <path d="M350 520l5 12 12 5-12 5-5 12-5-12-12-5 12-5z"/>
      <path d="M78 1460l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/>
    </g>
    <path d="M55 1600L375 1550M55 1630L375 1580" stroke="#ff237f" stroke-opacity=".32" stroke-width="4"/>
  </svg>`,
  { size: 512 },
);

const FRONT_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 560">
    <defs>
      <linearGradient id="front" x2="0" y2="1">
        <stop stop-color="#3a2165"/>
        <stop offset="1" stop-color="#170e31"/>
      </linearGradient>
    </defs>
    <rect width="660" height="560" fill="url(#front)"/>
    <path d="M24 30H160M24 30V155M636 30H500M636 30V155M24 530H160M24 530V405M636 530H500M636 530V405"
      fill="none" stroke="#ff237f" stroke-width="7"/>
    <path d="M210 70H450M210 92H450M210 114H450" stroke="#20e7ed" stroke-width="4" opacity=".55"/>
    <path d="M230 475H430M250 450H410" stroke="#20e7ed" stroke-width="3" opacity=".6"/>
    <rect x="282" y="170" width="96" height="48" rx="8" fill="#110a26" stroke="#20e7ed" stroke-width="4"/>
    <text x="330" y="202" text-anchor="middle" fill="#ff237f" font-family="monospace" font-size="20" font-weight="bold">80'S</text>
    <path d="M80 280H215M445 280H580" stroke="#20e7ed" stroke-width="3" opacity=".5"/>
  </svg>`,
  { size: 512 },
);

const DECK_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 690 340">
    <defs>
      <linearGradient id="deck" x2="0" y2="1">
        <stop stop-color="#241348"/>
        <stop offset=".5" stop-color="#090713"/>
        <stop offset="1" stop-color="#160d2e"/>
      </linearGradient>
      <pattern id="pins" width="46" height="18" patternUnits="userSpaceOnUse">
        <path d="M0 2H46" stroke="#20e7ed" stroke-opacity=".22" stroke-width="2"/>
        <path d="M8 12h12l5-5h12" fill="none" stroke="#ff237f" stroke-opacity=".18" stroke-width="2"/>
      </pattern>
    </defs>
    <rect width="690" height="340" fill="url(#deck)"/>
    <rect width="690" height="340" fill="url(#pins)"/>
    <path d="M30 290L130 190H250M420 155H545L650 52M80 320L160 240" fill="none" stroke="#ff237f" stroke-opacity=".42" stroke-width="5"/>
    <path d="M40 62H190M500 285H650" stroke="#20e7ed" stroke-width="5" opacity=".7"/>
    <circle cx="320" cy="92" r="10" fill="none" stroke="#20e7ed" stroke-width="3"/>
    <circle cx="320" cy="92" r="3" fill="#ff237f"/>
  </svg>`,
  { size: 512 },
);

export const REQUESTS = [
  {
    id: "marqueeLogo",
    kind: "add",
    part: "marqueeFace",
    what: "Large glowing SYNTHWAVE arcade logo across the marquee: angular 1980s lettering in CYAN, MAGENTA, and WHITE, with a dark outline and tiny starbursts.",
    at: [0, 1.78, 0.39],
    normal: [0, 0, 1],
    bone: null,
    room: [0.62, 0.2, 0.025],
  },
  {
    id: "screenScanlines",
    kind: "texture",
    part: "screenSurface",
    what: "Paint the screen as a deep indigo CRT display with horizontal CYAN scanlines, subtle MAGENTA bloom, a bright pixel horizon, and a tiny retro game HUD.",
  },
  {
    id: "controlButtons",
    kind: "add",
    part: "controlDeck",
    what: "On the control deck, add a black joystick pedestal with a glowing MAGENTA ball, six chunky arcade buttons alternating CYAN and MAGENTA, and two small START buttons.",
    at: [0, 0.96, 0.38],
    normal: [0, 1, 0],
    bone: null,
    room: [0.58, 0.12, 0.3],
  },
  {
    id: "coinDoor",
    kind: "add",
    part: "coinPanel",
    what: "Decorate the coin panel with two brass coin slots, a bright CYAN return button, small MAGENTA indicator lamps, and engraved 1980s arcade lettering.",
    at: [0, 0.53, 0.405],
    normal: [0, 0, 1],
    bone: null,
    room: [0.34, 0.3, 0.025],
  },
  {
    id: "sideLightningL",
    kind: "add",
    part: "leftSidePanel",
    what: "A long angular MAGENTA lightning-bolt neon graphic running up the cabinet side, with a thin CYAN offset glow and small geometric star decals.",
    at: [0.405, 1.02, 0.02],
    normal: [1, 0, 0],
    bone: null,
    room: [0.018, 1.4, 0.58],
  },
  {
    id: "sideLightningR",
    kind: "add",
    part: "rightSidePanel",
    what: "Mirror the long angular MAGENTA lightning-bolt neon graphic on the opposite cabinet side, with a thin CYAN offset glow and small geometric star decals.",
    at: [-0.405, 1.02, 0.02],
    normal: [-1, 0, 0],
    bone: null,
    room: [0.018, 1.4, 0.58],
  },
  {
    id: "roofLightBar",
    kind: "add",
    part: "cabinetTop",
    what: "A narrow synthwave light bar across the cabinet roof: a dark housing, six alternating CYAN and MAGENTA lamps, and two small chrome brackets.",
    at: [0, 1.94, 0.02],
    normal: [0, 1, 0],
    bone: null,
    room: [0.62, 0.11, 0.12],
  },
  {
    id: "ventGrille",
    kind: "add",
    part: "rearTop",
    what: "A compact rear ventilation grille made from seven evenly spaced dark METAL slats with CYAN end caps, inset into the upper rear housing.",
    at: [0, 1.48, -0.39],
    normal: [0, 0, -1],
    bone: null,
    room: [0.45, 0.18, 0.025],
  },
  {
    id: "powerCable",
    kind: "add",
    part: "cabinetRear",
    what: "A thick coiled BLACK power cable dropping from the rear, with a MAGENTA plug head and a small CYAN strain-relief ring.",
    at: [0.27, 0.24, -0.4],
    normal: [0, 0, -1],
    bone: null,
    room: [0.22, 0.48, 0.12],
  },
  {
    id: "floorGlow",
    kind: "add",
    part: "basePlinth",
    what: "A thin glowing floor halo beneath the cabinet, a rounded rectangular strip alternating CYAN and MAGENTA like reflected neon on a dark arcade floor.",
    at: [0, 0.035, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [0.95, 0.02, 0.95],
  },
  {
    id: "sidePanelTexture",
    kind: "texture",
    part: "leftSidePanel",
    what: "Paint the side panel with a deep violet-to-purple synthwave gradient, hard-edged CYAN and MAGENTA geometric bands, tiny stars, and a subtle black grid. Keep the large central area readable for the lightning graphic.",
  },
  {
    id: "cabinetFrontTexture",
    kind: "texture",
    part: "frontLower",
    what: "Add a restrained dark purple synthwave panel pattern to the lower front: thin MAGENTA corner lines, CYAN pinstripes, and a small centered retro badge, leaving the coin panel clear.",
  },
  {
    id: "controlDeckTexture",
    kind: "texture",
    part: "controlDeck",
    what: "Paint the control deck BLACK with a glossy violet edge, fine CYAN pinstripes, and a subtle diagonal MAGENTA circuit pattern around the button area.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "synthwave-arcade-cabinet", detail: 1 });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      name,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name: string,
    segments = 10,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      rotation,
      name,
    });

  // Broad side silhouette: the characteristic upright cabinet profile has a heavy lower body,
  // a sloping control section, and a projecting marquee crown.
  const sideProfile: [number, number][] = [
    [-0.43, 0.06],
    [0.43, 0.06],
    [0.43, 1.24],
    [0.34, 1.39],
    [0.34, 1.77],
    [-0.28, 1.77],
    [-0.39, 1.63],
    [-0.43, 1.45],
  ];

  for (const side of [-1, 1]) {
    b.extrude(sideProfile, {
      at: [side * 0.39, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.008,
      smoothing: 0,
      color: PALETTE.CABINET_SIDE,

      name: side > 0 ? "leftSidePanel" : "rightSidePanel",
    });

    // Thick luminous edge pieces leave the broad purple side surface uncluttered.
    box(
      [0.018, 1.23, 0.026],
      [side * 0.418, 0.78, 0.05],
      PALETTE.EDGE_PURPLE,
      side > 0 ? "leftEdgeRail" : "rightEdgeRail",
    );
    box(
      [0.02, 0.035, 0.67],
      [side * 0.421, 1.76, 0.04],
      PALETTE.MAGENTA,
      side > 0 ? "leftMarqueeEdge" : "rightMarqueeEdge",
    );
  }

  // Main inner shell, kept behind the side cheeks.
  box([0.73, 0.78, 0.72], [0, 0.47, -0.02], PALETTE.CABINET_DARK, "cabinetLowerShell");
  box([0.72, 0.53, 0.53], [0, 1.22, -0.015], PALETTE.CABINET, "cabinetUpperShell");
  box([0.72, 0.13, 0.62], [0, 1.73, -0.015], PALETTE.CABINET_DARK, "cabinetTop");

  // Lower front apron and its inset decorative panel.
  box([0.66, 0.56, 0.055], [0, 0.49, 0.365], PALETTE.CABINET, "frontLower");
  b.part(new THREE.BoxGeometry(0.66, 0.56, 0.003), PALETTE.WHITE, {
    at: [0, 0.49, 0.397],
    texture: FRONT_TEXTURE,
    name: "frontLowerTexture",
  });
  box([0.48, 0.31, 0.018], [0, 0.54, 0.399], PALETTE.CABINET_DARK, "coinPanel");
  box([0.53, 0.035, 0.026], [0, 0.83, 0.405], PALETTE.MAGENTA_DARK, "lowerFrontTrim");
  box([0.53, 0.025, 0.022], [0, 0.205, 0.405], PALETTE.CYAN_DARK, "lowerFrontBaseTrim");

  // Coin door frame and simple flat coin door, intentionally clear for Stage 2.
  box([0.38, 0.27, 0.025], [0, 0.53, 0.418], PALETTE.METAL_DARK, "coinDoorFrame");
  box([0.31, 0.195, 0.018], [0, 0.53, 0.435], PALETTE.BLACK, "coinDoorFace");
  box([0.13, 0.012, 0.018], [0, 0.615, 0.447], PALETTE.METAL, "coinDoorTopRail");
  box([0.13, 0.012, 0.018], [0, 0.445, 0.447], PALETTE.METAL_DARK, "coinDoorBottomRail");

  // Sloped control deck: its front lip is slightly higher than the rear.
  b.part(new THREE.BoxGeometry(0.69, 0.12, 0.34), PALETTE.WHITE, {
    at: [0, 0.91, 0.31],
    rotation: [8, 0, 0],
    texture: DECK_TEXTURE,
    name: "controlDeck",
  });
  box([0.68, 0.07, 0.025], [0, 0.865, 0.48], PALETTE.EDGE_PURPLE, "controlFrontLip", [8, 0, 0]);
  box([0.57, 0.018, 0.025], [0, 0.984, 0.315], PALETTE.CYAN_DARK, "controlRearTrim", [8, 0, 0]);

  // Placeholder joystick and button islands. These are deliberately simple, with room around them.
  box([0.12, 0.025, 0.11], [-0.205, 0.985, 0.33], PALETTE.BLACK, "joystickBase", [8, 0, 0]);
  cyl(0.025, 0.13, [-0.205, 1.065, 0.34], PALETTE.METAL_DARK, "joystickStem", 8);
  cyl(0.052, 0.052, [-0.205, 1.14, 0.34], PALETTE.MAGENTA, "joystickBall", 10);

  const buttonXs = [-0.055, 0.025, 0.105, 0.185];
  buttonXs.forEach((x, i) => {
    cyl(
      0.026,
      0.018,
      [x, 1.0, 0.36],
      i % 2 === 0 ? PALETTE.CYAN : PALETTE.MAGENTA,
      `controlButton${i + 1}`,
      10,
      [8, 0, 0],
    );
  });
  cyl(0.018, 0.016, [0.22, 0.996, 0.27], PALETTE.ORANGE, "startButtonA", 10, [8, 0, 0]);
  cyl(0.018, 0.016, [0.27, 0.996, 0.27], PALETTE.CYAN, "startButtonB", 10, [8, 0, 0]);

  // Screen hood and thick CRT bezel.
  box([0.64, 0.47, 0.11], [0, 1.37, 0.275], PALETTE.BLACK, "screenHousing", [-8, 0, 0]);
  box([0.56, 0.38, 0.075], [0, 1.36, 0.345], PALETTE.METAL_DARK, [-8, 0, 0]);
  box([0.51, 0.325, 0.038], [0, 1.36, 0.39], PALETTE.BLACK, "screenBezel", [-8, 0, 0]);

  // The named flat screen surface is intentionally plain for scanline artwork.
  b.part(new THREE.PlaneGeometry(0.46, 0.285), PALETTE.SCREEN, {
    at: [0, 1.36, 0.414],
    dir: [0, 0, 1],
    axis: "z",
    rotation: [-8, 0, 0],
    texture: SCREEN_TEXTURE,
    name: "screenSurface",
  });

  // Small bezel corner bolts and a lower CRT highlight.
  for (const x of [-0.27, 0.27]) {
    for (const y of [1.18, 1.54]) {
      cyl(0.012, 0.012, [x, y, 0.421], PALETTE.CYAN, `screenBolt${x}${y}`, 8, [90, 0, 0]);
    }
  }
  box([0.42, 0.018, 0.018], [0, 1.155, 0.43], PALETTE.MAGENTA_DARK, "screenLowerGlow");

  // Projecting marquee crown.
  box([0.69, 0.22, 0.09], [0, 1.76, 0.335], PALETTE.CABINET_DARK, "marqueeHousing", [-3, 0, 0]);
  box([0.61, 0.15, 0.025], [0, 1.78, 0.392], PALETTE.MAGENTA_DARK, "marqueeFrame", [-3, 0, 0]);
  b.part(new THREE.PlaneGeometry(0.56, 0.105), PALETTE.SCREEN_BLUE, {
    at: [0, 1.785, 0.412],
    dir: [0, 0, 1],
    axis: "z",
    rotation: [-3, 0, 0],
    name: "marqueeFace",
  });
  box([0.62, 0.018, 0.02], [0, 1.865, 0.41], PALETTE.CYAN, "marqueeTopGlow");
  box([0.62, 0.018, 0.02], [0, 1.705, 0.41], PALETTE.MAGENTA, "marqueeBottomGlow");

  // Rear footed plinth and four low-profile feet. The lowest geometry remains above y=0.
  box([0.78, 0.09, 0.76], [0, 0.09, -0.015], PALETTE.BLACK, "basePlinth");
  box([0.72, 0.025, 0.7], [0, 0.145, 0.015], PALETTE.CYAN_DARK, "baseNeonBand");
  for (const x of [-0.29, 0.29]) {
    for (const z of [-0.27, 0.27]) {
      cyl(0.055, 0.045, [x, 0.035, z], PALETTE.BLACK, `foot${x}${z}`, 8);
    }
  }

  // Side-facing geometric trim, kept narrow so the future lightning artwork has a clear field.
  for (const side of [-1, 1]) {
    box([0.012, 0.82, 0.025], [side * 0.426, 0.89, 0.36], PALETTE.CYAN, side > 0 ? "leftSideCyan" : "rightSideCyan");
    box([0.012, 0.025, 0.48], [side * 0.426, 1.34, 0.055], PALETTE.MAGENTA, side > 0 ? "leftSideMagenta" : "rightSideMagenta");
  }

  // A dark rear cap completes the readable cabinet silhouette.
  box([0.72, 1.18, 0.035], [0, 0.84, -0.405], PALETTE.CABINET_DARK, "cabinetRear");
  box([0.55, 0.022, 0.025], [0, 1.55, -0.43], PALETTE.EDGE_PURPLE, "rearTopTrim");
  box([0.62, 0.022, 0.025], [0, 0.2, -0.43], PALETTE.MAGENTA_DARK, "rearBottomTrim");

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addMarqueeLogo(b: Builder) {
  const logoTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 190">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#21104d"/>
          <stop offset="0.48" stop-color="#120b32"/>
          <stop offset="1" stop-color="#08071d"/>
        </linearGradient>
        <linearGradient id="cyan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#b9ffff"/>
          <stop offset="0.3" stop-color="#20e7ed"/>
          <stop offset="1" stop-color="#087898"/>
        </linearGradient>
        <linearGradient id="pink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffb1df"/>
          <stop offset="0.35" stop-color="#ff237f"/>
          <stop offset="1" stop-color="#9b155d"/>
        </linearGradient>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="grid" width="28" height="18" patternUnits="userSpaceOnUse">
          <path d="M0 0H28 M0 0V18" stroke="#3c2c79" stroke-width="1" opacity=".35"/>
        </pattern>
      </defs>

      <rect x="3" y="3" width="614" height="184" rx="13" fill="#050516" stroke="#ff237f" stroke-width="6"/>
      <rect x="12" y="12" width="596" height="166" rx="9" fill="url(#bg)" stroke="#20e7ed" stroke-width="3"/>
      <rect x="15" y="15" width="590" height="160" rx="7" fill="url(#grid)" opacity=".68"/>

      <g opacity=".85" filter="url(#softGlow)" fill="none" stroke-linecap="round">
        <path d="M28 150 L92 150 L112 132" stroke="#20e7ed" stroke-width="3"/>
        <path d="M510 151 L575 151 L593 132" stroke="#ff237f" stroke-width="3"/>
        <path d="M32 40 L72 40 L84 52" stroke="#ff237f" stroke-width="3"/>
        <path d="M540 39 L583 39 L596 53" stroke="#20e7ed" stroke-width="3"/>
      </g>

      <!-- broad dark offset outline -->
      <text x="310" y="113" text-anchor="middle"
        font-family="Impact, Arial Black, sans-serif" font-size="67" font-weight="900"
        letter-spacing="3" fill="#050516" stroke="#050516" stroke-width="14"
        stroke-linejoin="bevel">SYNTHWAVE</text>
      <!-- cyan offset extrusion -->
      <text x="306" y="108" text-anchor="middle"
        font-family="Impact, Arial Black, sans-serif" font-size="67" font-weight="900"
        letter-spacing="3" fill="url(#cyan)" stroke="#062c58" stroke-width="7"
        stroke-linejoin="bevel">SYNTHWAVE</text>
      <!-- magenta highlight offset gives the chunky 80s print registration -->
      <text x="312" y="103" text-anchor="middle"
        font-family="Impact, Arial Black, sans-serif" font-size="67" font-weight="900"
        letter-spacing="3" fill="url(#pink)" stroke="#ffb1df" stroke-width="2"
        stroke-linejoin="bevel">SYNTHWAVE</text>
      <path d="M104 121 Q310 143 516 121" fill="none" stroke="#20e7ed" stroke-width="3" opacity=".9"/>
      <path d="M144 132 Q310 149 476 132" fill="none" stroke="#ff237f" stroke-width="2" opacity=".8"/>

      <!-- tiny starbursts and arcade sparkles -->
      <g filter="url(#softGlow)" stroke-linecap="round">
        <path d="M57 93v25 M44.5 105.5h25 M48 96l18 18 M66 96l-18 18"
          stroke="#ffffff" stroke-width="3"/>
        <path d="M553 75v25 M540.5 87.5h25 M544 78l18 18 M562 78l-18 18"
          stroke="#20e7ed" stroke-width="3"/>
        <path d="M84 67v12 M78 73h12" stroke="#ffb1df" stroke-width="3"/>
        <path d="M527 132v12 M521 138h12" stroke="#ffffff" stroke-width="3"/>
      </g>
      <circle cx="31" cy="31" r="4" fill="#ff237f"/>
      <circle cx="589" cy="31" r="4" fill="#20e7ed"/>
      <circle cx="31" cy="159" r="4" fill="#20e7ed"/>
      <circle cx="589" cy="159" r="4" fill="#ff237f"/>
    </svg>`,
    { size: 768 },
  );

  const logo = b.part(new THREE.PlaneGeometry(0.575, 0.112), "#ffffff", {
    at: [0, 1.785, 0.421],
    rotation: [-3, 0, 0],
    texture: logoTexture,
    name: "marqueeLogo",
    group: "stage2-marquee",
  });
  glow(logo, 1.55);

  // Raised corner caps and a thin, deliberately faceted neon frame reinforce the sign
  // without covering the artwork.
  const cap = (x: number, y: number, color: string, name: string) =>
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.012, 8), color, {
      at: [x, y, 0.426],
      rotation: [90, 0, 0],
      name,
      group: "stage2-marquee",
    });

  const caps = [
    cap(-0.287, 1.735, "#20e7ed", "marqueeLogoBoltL1"),
    cap(0.287, 1.735, "#ff237f", "marqueeLogoBoltR1"),
    cap(-0.287, 1.835, "#ff237f", "marqueeLogoBoltL2"),
    cap(0.287, 1.835, "#20e7ed", "marqueeLogoBoltR2"),
  ];
  for (const c of caps) glow(c, 1.2);

  const topSpark = b.part(
    new THREE.OctahedronGeometry(0.012, 0),
    "#ffffff",
    {
      at: [-0.235, 1.875, 0.424],
      rotation: [0, 0, 45],
      name: "marqueeLogoSpark",
      group: "stage2-marquee",
    },
  );
  glow(topSpark, 1.8);
}
    return addMarqueeLogo;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addControlButtons(b: Builder) {
  const P = PALETTE;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    name: string,
    options: {
      rotation?: [number, number, number];
      scale?: [number, number, number];
      texture?: THREE.Texture;
    } = {},
  ) =>
    b.part(geometry, color, {
      at,
      name,
      rotation: options.rotation,
      scale: options.scale,
      texture: options.texture,
    });

  const deckTilt = "8,0,0";

  const buttonCap = (
    x: number,
    z: number,
    color: string,
    name: string,
    scale = 1,
  ) => {
    const cap = part(
      new THREE.SphereGeometry(0.034 * scale, 10, 6),
      color,
      [x, 1.015, z],
      name,
      { scale: [1.08, 0.55, 1.08], rotation: deckTilt },
    );
    const rim = part(
      new THREE.CylinderGeometry(0.037 * scale, 0.037 * scale, 0.012, 10),
      P.BLACK,
      [x, 0.993, z],
      `${name}Rim`,
      { rotation: deckTilt },
    );
    glow(cap, 1.25);
    return { cap, rim };
  };

  // A raised, beveled black joystick pedestal. The stage-one stem and ball sit
  // inside this assembly; the extra collar makes the control read clearly.
  part(
    new THREE.CylinderGeometry(0.071, 0.078, 0.026, 10),
    P.BLACK,
    [-0.205, 0.988, 0.34],
    "s22JoystickPedestal",
    { rotation: deckTilt },
  );
  part(
    new THREE.CylinderGeometry(0.058, 0.063, 0.014, 10),
    P.MAGENTA_DARK,
    [-0.205, 1.007, 0.34],
    "s22JoystickCollar",
    { rotation: deckTilt },
  );
  const joystickGlow = part(
    new THREE.SphereGeometry(0.057, 12, 8),
    P.MAGENTA,
    [-0.205, 1.145, 0.34],
    "s22JoystickGlowBall",
  );
  glow(joystickGlow, 1.7);

  // Six deliberate arcade buttons in two readable rows. They sit beside the
  // joystick, leaving the START controls at the far right.
  const buttons: [number, number, string, string][] = [
    [-0.085, 0.285, P.CYAN, "s22ButtonCyanA"],
    [0.005, 0.285, P.MAGENTA, "s22ButtonMagentaA"],
    [0.095, 0.285, P.CYAN, "s22ButtonCyanB"],
    [-0.085, 0.385, P.MAGENTA, "s22ButtonMagentaB"],
    [0.005, 0.385, P.CYAN, "s22ButtonCyanC"],
    [0.095, 0.385, P.MAGENTA, "s22ButtonMagentaC"],
  ];
  for (const [x, z, color, name] of buttons) buttonCap(x, z, color, name);

  // Tiny indicator collars beneath the buttons add a layered manufactured look.
  for (const [x, z, color, name] of [
    [-0.085, 0.285, P.CYAN, "s22ButtonLampA"],
    [0.005, 0.285, P.MAGENTA, "s22ButtonLampB"],
    [0.095, 0.285, P.CYAN, "s22ButtonLampC"],
    [-0.085, 0.385, P.MAGENTA, "s22ButtonLampD"],
    [0.005, 0.385, P.CYAN, "s22ButtonLampE"],
    [0.095, 0.385, P.MAGENTA, "s22ButtonLampF"],
  ] as [number, number, string, string][]) {
    const lamp = part(
      new THREE.CylinderGeometry(0.012, 0.012, 0.008, 8),
      color,
      [x, 0.984, z],
      name,
      { rotation: deckTilt },
    );
    glow(lamp, 1.1);
  }

  // Two inset START buttons, each with a dark outer bezel and luminous center.
  for (const [x, color, label] of [
    [0.218, P.ORANGE, "s22StartOrange"],
    [0.272, P.CYAN, "s22StartCyan"],
  ] as [number, string, string][]) {
    part(
      new THREE.CylinderGeometry(0.025, 0.028, 0.014, 10),
      P.BLACK,
      [x, 0.989, 0.27],
      `${label}Bezel`,
      { rotation: deckTilt },
    );
    const start = part(
      new THREE.CylinderGeometry(0.017, 0.019, 0.016, 10),
      color,
      [x, 1.003, 0.27],
      label,
      { rotation: deckTilt },
    );
    glow(start, 1.35);
  }

  // Small front-edge screws make the control panel feel assembled rather than
  // like one unbroken primitive.
  for (const x of [-0.31, 0.31]) {
    part(
      new THREE.CylinderGeometry(0.009, 0.009, 0.008, 8),
      P.METAL,
      [x, 0.905, 0.484],
      `s22DeckScrew${x}`,
      { rotation: [90, 0, 0] },
    );
  }

  const coinText = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 64">
      <rect width="256" height="64" rx="8" fill="#070712"/>
      <path d="M8 8H248V56H8Z" fill="none" stroke="#20e7ed" stroke-width="4"/>
      <text x="128" y="39" text-anchor="middle"
        font-family="monospace" font-size="25" font-weight="bold"
        letter-spacing="5" fill="#ff237f" stroke="#120d28" stroke-width="2"
        paint-order="stroke">INSERT COIN</text>
    </svg>`,
    { size: 256 },
  );

  // Coin slots: layered brass escutcheons, black slot cuts, and cyan return
  // button. All are on the clear front of the coin door.
  for (const x of [-0.105, 0.105]) {
    part(
      new THREE.BoxGeometry(0.105, 0.074, 0.012),
      P.METAL_DARK,
      [x, 0.555, 0.451],
      `s22CoinSlotHousing${x}`,
    );
    part(
      new THREE.BoxGeometry(0.082, 0.053, 0.009),
      P.COIN,
      [x, 0.555, 0.459],
      `s22CoinSlotBrass${x}`,
    );
    part(
      new THREE.BoxGeometry(0.058, 0.009, 0.006),
      P.BLACK,
      [x, 0.555, 0.466],
      `s22CoinSlotOpening${x}`,
    );
    part(
      new THREE.BoxGeometry(0.012, 0.003, 0.004),
      P.WHITE,
      [x - 0.024, 0.576, 0.469],
      `s22CoinSlotHighlight${x}`,
    );
  }

  part(
    new THREE.CylinderGeometry(0.032, 0.032, 0.012, 12),
    P.METAL_DARK,
    [0, 0.465, 0.451],
    "s22CoinReturnBezel",
    { rotation: [90, 0, 0] },
  );
  const returnButton = part(
    new THREE.CylinderGeometry(0.023, 0.023, 0.014, 12),
    P.CYAN,
    [0, 0.465, 0.462],
    "s22CoinReturnButton",
    { rotation: [90, 0, 0] },
  );
  glow(returnButton, 1.45);

  // Magenta status lamps flank the return button.
  for (const x of [-0.165, 0.165]) {
    part(
      new THREE.CylinderGeometry(0.014, 0.014, 0.009, 10),
      P.BLACK,
      [x, 0.465, 0.451],
      `s22CoinLampBezel${x}`,
      { rotation: [90, 0, 0] },
    );
    const lamp = part(
      new THREE.CylinderGeometry(0.009, 0.009, 0.012, 10),
      P.MAGENTA,
      [x, 0.465, 0.461],
      `s22CoinLamp${x}`,
      { rotation: [90, 0, 0] },
    );
    glow(lamp, 1.2);
  }

  // Engraved-looking label, kept below the slots so the coin panel remains
  // visually balanced and legible from the front.
  part(
    new THREE.PlaneGeometry(0.26, 0.065),
    P.WHITE,
    [0, 0.405, 0.463],
    "s22CoinInstructionLabel",
    { texture: coinText },
  );

  // Four tiny brass fasteners complete the coin-door hardware.
  for (const [x, y] of [
    [-0.17, 0.64],
    [0.17, 0.64],
    [-0.17, 0.42],
    [0.17, 0.42],
  ] as [number, number][]) {
    part(
      new THREE.CylinderGeometry(0.008, 0.008, 0.007, 8),
      P.COIN,
      [x, y, 0.463],
      `s22CoinFastener${x}${y}`,
      { rotation: [90, 0, 0] },
    );
  }
}
    return addControlButtons;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addSideLightningL(b: Builder) {
  const sideX = 0.418;

  const lightning: [number, number][] = [
    [-0.045, -0.56],
    [0.105, -0.16],
    [0.025, -0.16],
    [0.17, 0.18],
    [0.075, 0.18],
    [0.205, 0.56],
    [-0.095, 0.08],
    [-0.012, 0.08],
    [-0.17, -0.25],
    [-0.075, -0.25],
  ];

  const cyanBolt = b.extrude(lightning, {
    at: [sideX - 0.004, 1.02, 0.048],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.004,
    smoothing: 0,
    color: PALETTE.CYAN,
    name: "leftLightningCyanGlow",
    group: "synthwave-side-art",
  });
  glow(cyanBolt, 1.8);

  const magentaBolt = b.extrude(lightning, {
    at: [sideX + 0.006, 1.02, 0.018],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.014,
    bevel: 0.003,
    smoothing: 0,
    color: PALETTE.MAGENTA,
    name: "leftLightningMagenta",
    group: "synthwave-side-art",
  });
  glow(magentaBolt, 2.2);

  // A dark inset shadow makes the neon graphic read as a raised sign rather than paint.
  const shadowBolt = b.extrude(lightning, {
    at: [sideX - 0.012, 1.02, 0.018],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.018,
    bevel: 0.002,
    smoothing: 0,
    color: PALETTE.CABINET_DARK,
    name: "leftLightningInsetShadow",
    group: "synthwave-side-art",
  });

  const diamond = (z: number, y: number, radius: number, color: string, name: string) => {
    const star: [number, number][] = [
      [0, radius],
      [radius * 0.42, radius * 0.22],
      [radius, 0],
      [radius * 0.42, -radius * 0.22],
      [0, -radius],
      [-radius * 0.42, -radius * 0.22],
      [-radius, 0],
      [-radius * 0.42, radius * 0.22],
    ];
    const part = b.extrude(star, {
      at: [sideX + 0.008, y, z],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.009,
      bevel: 0.002,
      smoothing: 0,
      color,
      name,
      group: "synthwave-side-art",
    });
    glow(part, 1.5);
  };

  // Small offset diamonds and four-point stars keep the large panel from feeling empty.
  diamond(-0.205, 1.49, 0.034, PALETTE.CYAN, "leftSideStarTop");
  diamond(0.205, 0.62, 0.027, PALETTE.MAGENTA, "leftSideStarBottom");

  const fourPoint = (z: number, y: number, h: number, color: string, name: string) => {
    const outline: [number, number][] = [
      [0, h],
      [h * 0.18, h * 0.18],
      [h, 0],
      [h * 0.18, -h * 0.18],
      [0, -h],
      [-h * 0.18, -h * 0.18],
      [-h, 0],
      [-h * 0.18, h * 0.18],
    ];
    const part = b.extrude(outline, {
      at: [sideX + 0.009, y, z],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.0015,
      smoothing: 0,
      color,
      name,
      group: "synthwave-side-art",
    });
    glow(part, 1.3);
  };

  fourPoint(-0.19, 0.91, 0.018, PALETTE.MAGENTA, "leftSideSparkA");
  fourPoint(0.17, 1.33, 0.021, PALETTE.CYAN, "leftSideSparkB");
  fourPoint(-0.17, 1.64, 0.014, PALETTE.MAGENTA, "leftSideSparkC");
  fourPoint(0.16, 0.43, 0.016, PALETTE.CYAN, "leftSideSparkD");

  // Short segmented rays echo the bolt's angular language without crowding its silhouette.
  const ray = (
    z: number,
    y: number,
    length: number,
    rise: number,
    color: string,
    name: string,
  ) => {
    const part = b.extrude(
      [
        [0, 0],
        [length, rise],
        [length * 0.78, rise + 0.006],
        [-0.006, 0.008],
      ],
      {
        at: [sideX + 0.01, y, z],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.006,
        bevel: 0.001,
        smoothing: 0,
        color,
        name,
        group: "synthwave-side-art",
      },
    );
    glow(part, 1.25);
  };

  ray(-0.19, 1.53, 0.055, 0.022, PALETTE.CYAN, "leftRayUpperA");
  ray(-0.16, 1.57, 0.035, -0.018, PALETTE.MAGENTA, "leftRayUpperB");
  ray(0.15, 0.72, 0.06, -0.02, PALETTE.CYAN, "leftRayLowerA");
  ray(0.18, 0.76, 0.04, 0.022, PALETTE.MAGENTA, "leftRayLowerB");

  // Tiny illuminated rivets at the ends of the composition provide a manufactured arcade-panel finish.
  for (const [z, y, color, name] of [
    [-0.285, 1.58, PALETTE.MAGENTA, "leftPanelRivetTop"],
    [0.285, 0.50, PALETTE.CYAN, "leftPanelRivetBottom"],
    [-0.29, 0.39, PALETTE.CYAN, "leftPanelRivetLow"],
  ] as const) {
    const rivet = b.part(new THREE.SphereGeometry(0.012, 8, 5), color, {
      at: [sideX + 0.018, y, z],
      name,
      group: "synthwave-side-art",
    });
    glow(rivet, 1.35);
  }

  // A very fine cyan edge slash ties the lightning to the cabinet's existing trim.
  const edgeSlash = b.extrude(
    [
      [0, 0],
      [0.23, 0],
      [0.23, 0.006],
      [0, 0.006],
    ],
    {
      at: [sideX + 0.011, 0.31, -0.275],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.005,
      bevel: 0.001,
      color: PALETTE.CYAN_DARK,
      name: "leftSideBottomSlash",
      group: "synthwave-side-art",
    },
  );
  glow(edgeSlash, 1.15);

  void shadowBolt;
}
    return addSideLightningL;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addSideLightningR(b: Builder) {
  const P = PALETTE;

  // -----------------------------------------------------------------------------------------------
  // Right side: a layered, raised lightning-bolt emblem. The outline is drawn in the side-panel
  // plane: local outline X runs toward the rear (+Z), local outline Y runs upward.
  const bolt: [number, number][] = [
    [-0.055, 1.49],
    [0.115, 1.49],
    [0.025, 1.24],
    [0.13, 1.24],
    [-0.105, 0.78],
    [-0.025, 1.08],
    [-0.13, 1.08],
  ];

  const boltGlow: [number, number][] = [
    [-0.07, 1.52],
    [0.135, 1.52],
    [0.045, 1.27],
    [0.155, 1.27],
    [-0.125, 0.74],
    [-0.045, 1.11],
    [-0.155, 1.11],
  ];

  // The side surface faces -X. Using x=[0,0,1] and y=[0,1,0] makes the extrusion face
  // point toward -X, with a small embedded layer followed by the bright raised layer.
  const cyanBolt = b.extrude(boltGlow, {
    at: [-0.431, 0, 0.035],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.009,
    bevel: 0.003,
    color: P.CYAN,
    name: "rightLightningCyanGlow",
  });

  const magentaBolt = b.extrude(bolt, {
    at: [-0.442, 0, 0.035],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.003,
    color: P.MAGENTA,
    name: "rightLightningMagenta",
  });

  glow(cyanBolt, 1.45);
  glow(magentaBolt, 1.8);

  // A narrow dark break line gives the bolt a graphic, printed-outline quality.
  const boltInk: [number, number][] = [
    [-0.041, 1.455],
    [0.091, 1.455],
    [0.002, 1.205],
    [0.091, 1.205],
    [-0.079, 0.825],
    [-0.003, 1.115],
    [-0.105, 1.115],
  ];
  b.extrude(boltInk, {
    at: [-0.449, 0, 0.035],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.004,
    bevel: 0.0015,
    color: P.CABINET_DARK,
    name: "rightLightningInset",
  });

  // Three little geometric stars around the bolt, each with a cyan under-glow and magenta face.
  const star = (z: number, y: number, size: number, index: number) => {
    const outline: [number, number][] = [
      [0, size],
      [size * 0.22, size * 0.25],
      [size, 0],
      [size * 0.22, -size * 0.25],
      [0, -size],
      [-size * 0.22, -size * 0.25],
      [-size, 0],
      [-size * 0.22, size * 0.25],
    ];
    const under = outline.map(([u, v]) => [u * 1.22, v * 1.22] as [number, number]);

    const c = b.extrude(under, {
      at: [-0.431, y, z],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.006,
      bevel: 0.002,
      color: P.CYAN,
      name: `rightSideStarCyan${index}`,
    });
    const m = b.extrude(outline, {
      at: [-0.441, y, z],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.002,
      color: P.MAGENTA,
      name: `rightSideStarMagenta${index}`,
    });
    glow(c, 1.25);
    glow(m, 1.55);
  };

  star(-0.17, 1.47, 0.035, 1);
  star(0.22, 1.15, 0.025, 2);
  star(-0.16, 0.73, 0.021, 3);

  // Tiny cyan rivet-like dots reinforce the side graphic without competing with the main bolt.
  for (let i = 0; i < 5; i++) {
    const z = -0.27 + i * 0.13;
    const dot = b.part(new THREE.SphereGeometry(0.009, 7, 5), P.CYAN, {
      at: [-0.452, 0.54 + i * 0.045, z],
      name: `rightSideGraphicDot${i}`,
    });
    glow(dot, 1.4);
  }

  // -----------------------------------------------------------------------------------------------
  // Roof light bar: a dark, inset housing with a cyan/magenta alternating lamp sequence.
  const housing = b.part(new THREE.BoxGeometry(0.58, 0.045, 0.095), P.BLACK, {
    at: [0, 1.908, 0.035],
    name: "roofLightBarHousing",
  });

  // Violet and cyan rails make the bar read as a complete illuminated assembly from above.
  const upperRail = b.part(new THREE.BoxGeometry(0.555, 0.012, 0.012), P.MAGENTA, {
    at: [0, 1.935, 0.035],
    name: "roofLightBarMagentaRail",
  });
  const frontRail = b.part(new THREE.BoxGeometry(0.555, 0.012, 0.012), P.CYAN, {
    at: [0, 1.887, 0.082],
    name: "roofLightBarCyanRail",
  });
  glow(upperRail, 1.45);
  glow(frontRail, 1.45);

  // Six squat faceted lamps sit in individual black sockets.
  const lampXs = [-0.225, -0.135, -0.045, 0.045, 0.135, 0.225];
  lampXs.forEach((x, i) => {
    b.part(new THREE.CylinderGeometry(0.027, 0.031, 0.014, 8), P.CABINET_DARK, {
      at: [x, 1.946, 0.035],
      name: `roofLampSocket${i}`,
    });

    const lamp = b.part(
      new THREE.CylinderGeometry(0.018, 0.021, 0.018, 8),
      i % 2 === 0 ? P.CYAN : P.MAGENTA,
      {
        at: [x, 1.958, 0.035],
        name: `roofLamp${i}`,
      },
    );
    glow(lamp, i % 2 === 0 ? 1.8 : 2.0);

    // A tiny pale cap catches the key light and gives every bulb a readable highlight.
    const highlight = b.part(new THREE.SphereGeometry(0.006, 6, 4), P.WHITE, {
      at: [x - 0.006, 1.967, 0.024],
      name: `roofLampHighlight${i}`,
    });
    glow(highlight, 1.2);
  });

  // Two chrome feet clamp the bar to the roof. Each is a short faceted bracket with a dark fastener.
  for (const side of [-1, 1]) {
    const bracket = b.part(new THREE.BoxGeometry(0.045, 0.07, 0.055), P.METAL, {
      at: [side * 0.255, 1.878, 0.02],
      rotation: [0, 0, side * 8],
      name: `roofLightBracket${side > 0 ? "L" : "R"}`,
    });

    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.008, 8), P.METAL_DARK, {
      at: [side * 0.255, 1.918, 0.051],
      name: `roofBracketFastener${side > 0 ? "L" : "R"}`,
    });

    // Short cyan edge glints on the outer side of each bracket.
    const glint = b.part(new THREE.BoxGeometry(0.008, 0.047, 0.009), P.CYAN, {
      at: [side * 0.281, 1.879, 0.049],
      name: `roofBracketGlint${side > 0 ? "L" : "R"}`,
    });
    glow(glint, 1.3);
  }

  // A small central dark divider makes the six-lamp rhythm legible from a distance.
  b.part(new THREE.BoxGeometry(0.008, 0.026, 0.075), P.CABINET_DARK, {
    at: [0, 1.971, 0.035],
    name: "roofLightCenterDivider",
  });
}
    return addSideLightningR;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addVentGrille(b: Builder) {
  const STEEL = metal("steel", {
    polish: 0.18,
    tarnish: 0.55,
    size: 0.045,
    seed: 25,
  });
  const DARK_STEEL = metal("iron", {
    polish: 0.08,
    tarnish: 0.35,
    size: 0.035,
    seed: 26,
  });

  const at: [number, number, number] = [0, 1.48, -0.39];
  const rearZ = -0.426;

  const part = (
    geometry: THREE.BufferGeometry,
    color: any,
    position: [number, number, number],
    name: string,
    options: Record<string, unknown> = {},
  ) =>
    b.part(geometry, color, {
      at: position,
      name,
      ...options,
    });

  // A shallow inset surround makes the grille read as a real cut-in panel rather
  // than seven floating strips on the rear shell.
  part(
    new THREE.BoxGeometry(0.46, 0.185, 0.012),
    PALETTE.BLACK,
    [at[0], at[1], rearZ + 0.004],
    "s25VentRecess",
  );

  part(
    new THREE.BoxGeometry(0.445, 0.172, 0.009),
    DARK_STEEL,
    [at[0], at[1], rearZ - 0.003],
    "s25VentBacking",
  );

  // Violet outer gasket, with the cyan end rails sitting just proud of it.
  part(
    new THREE.BoxGeometry(0.47, 0.012, 0.018),
    PALETTE.EDGE_PURPLE,
    [0, 1.575, rearZ - 0.009],
    "s25VentTopGasket",
  );
  part(
    new THREE.BoxGeometry(0.47, 0.012, 0.018),
    PALETTE.EDGE_PURPLE,
    [0, 1.385, rearZ - 0.009],
    "s25VentBottomGasket",
  );

  part(
    new THREE.BoxGeometry(0.018, 0.19, 0.022),
    PALETTE.CYAN_DARK,
    [-0.228, 1.48, rearZ - 0.011],
    "s25VentLeftCap",
  );
  part(
    new THREE.BoxGeometry(0.018, 0.19, 0.022),
    PALETTE.CYAN_DARK,
    [0.228, 1.48, rearZ - 0.011],
    "s25VentRightCap",
  );

  // Seven broad, low-poly slats. Their alternating tiny y offsets give the grille
  // a stepped, manufactured depth under the rear light.
  const ys = [1.405, 1.43, 1.455, 1.48, 1.505, 1.53, 1.555];
  ys.forEach((y, i) => {
    part(
      new THREE.BoxGeometry(0.398, 0.0115, 0.016),
      i % 2 === 0 ? STEEL : DARK_STEEL,
      [0, y, rearZ - 0.018 - (i % 2) * 0.002],
      `s25VentSlat${i + 1}`,
    );

    // A tiny cyan glint on the left end of each slat makes the spacing legible
    // without turning the whole grille into a glowing panel.
    part(
      new THREE.BoxGeometry(0.012, 0.006, 0.019),
      PALETTE.CYAN,
      [-0.198, y + 0.001, rearZ - 0.028],
      `s25VentGlintL${i + 1}`,
    );
    part(
      new THREE.BoxGeometry(0.012, 0.006, 0.019),
      PALETTE.MAGENTA_DARK,
      [0.198, y + 0.001, rearZ - 0.028],
      `s25VentGlintR${i + 1}`,
    );
  });

  // Four recessed fasteners, cylinders facing outward along the rear normal.
  const screwGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.008, 8);
  for (const x of [-0.205, 0.205]) {
    for (const y of [1.405, 1.555]) {
      part(
        screwGeo,
        PALETTE.METAL,
        [x, y, rearZ - 0.034],
        `s25VentFastener${x}${y}`,
        { dir: [0, 0, -1], axis: "y" },
      );
    }
  }

  // A small central service badge below the slats: a simple cyan/magenta
  // diagnostic mark that enriches the rear silhouette while staying inside room.
  part(
    new THREE.BoxGeometry(0.065, 0.012, 0.006),
    PALETTE.CYAN_DARK,
    [0, 1.355, rearZ - 0.021],
    "s25VentServiceBadge",
  );
  part(
    new THREE.BoxGeometry(0.025, 0.004, 0.004),
    PALETTE.MAGENTA,
    [-0.016, 1.355, rearZ - 0.026],
    "s25VentBadgeMarkL",
  );
  part(
    new THREE.BoxGeometry(0.025, 0.004, 0.004),
    PALETTE.CYAN,
    [0.016, 1.355, rearZ - 0.026],
    "s25VentBadgeMarkR",
  );
}
    return addVentGrille;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addPowerCable(b: Builder) {
  const BLACK = PALETTE.BLACK;
  const MAGENTA = PALETTE.MAGENTA;
  const CYAN = PALETTE.CYAN;
  const METAL = PALETTE.METAL_DARK;

  const cablePath = catmull([
    [0.27, 0.255, -0.425],
    [0.27, 0.205, -0.438],
    [0.295, 0.155, -0.452],
    [0.335, 0.115, -0.445],
    [0.345, 0.075, -0.418],
    [0.315, 0.047, -0.397],
    [0.27, 0.042, -0.412],
    [0.235, 0.043, -0.455],
    [0.225, 0.045, -0.492],
  ]);

  const cable = b.sweep(cablePath, 0.014, {
    color: BLACK,
    sides: 8,
    caps: "round",
    name: "powerCable",
  });
  glow(cable, 0.22);

  const socket = b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.038, 10), METAL, {
    at: [0.27, 0.247, -0.426],
    rotation: [90, 0, 0],
    name: "powerSocketCollar",
  });

  const relief = b.part(new THREE.TorusGeometry(0.021, 0.0048, 6, 12), CYAN, {
    at: [0.27, 0.222, -0.429],
    name: "cyanStrainRelief",
  });
  glow(relief, 1.4);

  const washer = b.part(new THREE.TorusGeometry(0.026, 0.0024, 6, 12), MAGENTA, {
    at: [0.27, 0.245, -0.428],
    name: "socketWasher",
  });
  glow(washer, 1.2);

  b.part(new THREE.BoxGeometry(0.065, 0.058, 0.052), BLACK, {
    at: [0.225, 0.052, -0.492],
    rotation: [0, -12, 0],
    name: "powerPlugBody",
  });

  const plugFace = b.part(new THREE.BoxGeometry(0.05, 0.012, 0.043), MAGENTA, {
    at: [0.225, 0.082, -0.492],
    rotation: [0, -12, 0],
    name: "powerPlugFace",
  });
  glow(plugFace, 0.9);

  b.part(new THREE.BoxGeometry(0.009, 0.068, 0.056), METAL, {
    at: [0.197, 0.052, -0.492],
    rotation: [0, -12, 0],
    name: "plugGripRibA",
  });

  b.part(new THREE.BoxGeometry(0.009, 0.068, 0.056), METAL, {
    at: [0.254, 0.052, -0.492],
    rotation: [0, -12, 0],
    name: "plugGripRibB",
  });

  const plugLamp = b.part(new THREE.SphereGeometry(0.008, 8, 5), CYAN, {
    at: [0.225, 0.088, -0.492],
    name: "plugLamp",
  });
  glow(plugLamp, 1.5);

  const halo: [number, number, number][] = [
    [-0.39, 0.028, -0.47],
    [0.39, 0.028, -0.47],
    [0.47, 0.028, -0.39],
    [0.47, 0.028, 0.39],
    [0.39, 0.028, 0.47],
    [-0.39, 0.028, 0.47],
    [-0.47, 0.028, 0.39],
    [-0.47, 0.028, -0.39],
  ];

  for (let i = 0; i < halo.length; i++) {
    const strip = b.rod(halo[i], halo[(i + 1) % halo.length], 0.009, {
      color: i % 2 === 0 ? CYAN : MAGENTA,
      sides: 6,
      caps: "round",
      name: `floorHalo${i}`,
    });
    glow(strip, 1.8);
  }

  for (let i = 0; i < halo.length; i++) {
    const node = b.part(
      new THREE.SphereGeometry(0.015, 8, 5),
      i % 2 === 0 ? CYAN : MAGENTA,
      {
        at: halo[i],
        name: `floorHaloNode${i}`,
      },
    );
    glow(node, 1.6);
  }

  const inner: [number, number, number][] = [
    [-0.34, 0.021, -0.405],
    [0.34, 0.021, -0.405],
    [0.405, 0.021, -0.34],
    [0.405, 0.021, 0.34],
    [0.34, 0.021, 0.405],
    [-0.34, 0.021, 0.405],
    [-0.405, 0.021, 0.34],
    [-0.405, 0.021, -0.34],
  ];

  for (let i = 0; i < inner.length; i++) {
    const reflection = b.rod(inner[i], inner[(i + 1) % inner.length], 0.004, {
      color: i % 2 === 0 ? PALETTE.CYAN_DARK : PALETTE.MAGENTA_DARK,
      sides: 5,
      caps: "round",
      name: `innerFloorReflection${i}`,
    });
    glow(reflection, 0.55);
  }
}
    return addPowerCable;
  })(),
);
