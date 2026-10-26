import * as THREE from "three";
import { type Builder, createBuilder, paint, mix, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Neon Racer Arcade Cabinet",
  description: "1980s upright arcade cabinet in synthwave colours: glowing marquee, CRT screen, tilted control panel and coin door.",
};

// Palette (top level so stage 2 can use the names)
export const BODY = "#1a1033";
export const BODY_DARK = "#0f0820";
export const PANEL = "#2b1659";
export const MAGENTA = "#ff2bd6";
export const CYAN = "#19f0ff";
export const SUN = "#ffb02e";
export const BLACK = "#0b0716";
export const CHROME = "#c9c7e6";
export const RED = "#ff2a4d";
export const YELLOW = "#ffe14a";
export const SCREEN = "#1b0a4a";
export const PURPLE = "#6a2cff";

export const REQUESTS = [
  {
    id: "marqueeArt",
    kind: "add",
    part: "marquee",
    what: "Marquee lettering: the title NEON RACER in chunky retro block letters, MAGENTA with a CYAN outline and a SUN-orange underline stripe, glowing, plus a small chrome racing-car silhouette at each end of the light box.",
    at: [0, 1.66, 0.375],
    normal: [0, 0, 1],
    bone: null,
    room: [0.58, 0.24, 0.05],
  },
  {
    id: "screenScene",
    kind: "add",
    part: "screen",
    what: "Attract-mode image on the CRT: a synthwave sunset with SUN striped sun on the horizon, a PURPLE/MAGENTA perspective grid floor, a CYAN road with dashed centre line and a tiny car, as thin glowing layered parts sitting on the screen; plus 'INSERT COIN' text row at the bottom.",
    at: [0, 1.25, 0.322],
    normal: [0, 0, 1],
    bone: null,
    room: [0.5, 0.38, 0.03],
  },
  {
    id: "bezelTrim",
    kind: "add",
    part: "bezel",
    what: "Screen bezel details: a curved-glass highlight corner on the screen, four small chrome corner screws, and a thin CYAN glowing inner frame line.",
    at: [0, 1.25, 0.318],
    normal: [0, 0, 1],
    bone: null,
    room: [0.6, 0.5, 0.05],
  },
  {
    id: "speakerGrilles",
    kind: "add",
    part: "marqueeBase",
    what: "Two speaker grilles flanking the marquee base: rows of small round holes or slats in BLACK on BODY_DARK with MAGENTA trim rings (a pair, left at +x, right at -x).",
    at: [0.22, 1.43, 0.32],
    normal: [0, 0, 1],
    bone: null,
    room: [0.14, 0.07, 0.04],
  },
  {
    id: "controlDetails",
    kind: "add",
    part: "controlPanel",
    what: "Control panel detail: player 1 START and player 2 START small lit buttons with labels, a CYAN grid-line pattern etched on the PANEL surface, chrome mounting screws, and a MAGENTA neon edge strip along the front lip.",
    at: [0, 1.0, 0.43],
    normal: [0, 0.95, 0.31],
    bone: null,
    room: [0.56, 0.05, 0.2],
  },
  {
    id: "coinDoor",
    kind: "add",
    part: "coinDoorPlate",
    what: "Coin door: two coin mechanisms with chrome slot plates, glowing RED and YELLOW coin-return buttons, 'INSERT COIN' small label, a CYAN-lit coin return cup and four screws.",
    at: [0, 0.6, 0.405],
    normal: [0, 0, 1],
    bone: null,
    room: [0.26, 0.3, 0.04],
  },
  {
    id: "tMolding",
    kind: "add",
    part: "sideL",
    what: "Neon T-molding: slim glowing MAGENTA tube strips hugging the front and top edges of both side panels, with CYAN tube strips along the control-panel step, and end caps.",
    at: [0.33, 1.0, 0.4],
    normal: [1, 0, 0],
    bone: null,
    room: [0.04, 1.8, 0.9],
  },
  {
    id: "backDetails",
    kind: "add",
    part: "backPanel",
    what: "Back of the cabinet: ventilation slots near the top, a power cord plug and cable looping down to the floor, a warning label, and a ribbon of PURPLE cables to the monitor.",
    at: [0, 0.9, -0.42],
    normal: [0, 0, -1],
    bone: null,
    room: [0.5, 1.2, 0.12],
  },
  {
    id: "kickGlow",
    kind: "add",
    part: "kickPlate",
    what: "Underglow: a CYAN glowing light strip along the kick plate bottom and a soft MAGENTA floor-glow disc beneath the cabinet front, sized to the cabinet footprint.",
    at: [0, 0.06, 0.4],
    normal: [0, 0, 1],
    bone: null,
    room: [0.6, 0.1, 0.1],
  },
  {
    id: "sideTopFins",
    kind: "add",
    part: "marquee",
    what: "Retro-futurist top ornaments: a small CYAN/MAGENTA glowing chevron fin pair on the marquee roof corners and a tiny antenna-style light beacon.",
    at: [0, 1.84, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [0.6, 0.12, 0.6],
  },
  {
    id: "sideArt",
    kind: "texture",
    part: "sideL",
    what: "Synthwave side art on both side panels (parts sideL and sideR): a BODY_DARK field with a big SUN-orange striped setting sun, MAGENTA and CYAN diagonal speed stripes sweeping to the rear, and a PURPLE perspective grid at the bottom.",
  },
  {
    id: "controlPanelPaint",
    kind: "texture",
    part: "controlPanel",
    what: "Control panel top printed in PANEL with MAGENTA and CYAN geometric zigzag borders and faint player-zone outlines around the joystick and buttons.",
  },
  {
    id: "frontPaint",
    kind: "texture",
    part: "lowerFront",
    what: "Lower front panel painted in BODY with a gradient of MAGENTA to PURPLE horizontal stripes and a faded checker band.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const tri = (x: number) => Math.abs((x - Math.floor(x)) * 2 - 1);

// Side panels: s = [z, y] in meters of the outline.
const SIDE_PAINT = paint((_p, n, s) => {
  if (Math.abs(n.x) < 0.5) return BODY;
  const z = s[0];
  const y = s[1];
  // base field with a slight vertical fade
  let c: any = mix(BODY_DARK, "#2a0f52", smoothstep(0.2, 1.8, y) * 0.6);
  // purple perspective grid at the bottom
  if (y < 0.3) {
    const k = 1 - y / 0.3;
    const lineH = Math.abs(((y * 14) % 1) - 0.5) > 0.44;
    const lineV = Math.abs(tri((z * (0.8 + (0.3 - y) * 5)) / 0.12) - 0.5) > 0.46;
    c = mix(c, PURPLE, (lineH || lineV ? 0.9 : 0.12) * (0.5 + 0.5 * k));
  }
  // diagonal speed stripes sweeping to the rear (-z)
  const d = y + 0.45 * z;
  if (y > 0.35 && y < 1.75) {
    const bands = [
      [1.0, 1.04, MAGENTA],
      [1.08, 1.1, CYAN],
      [1.15, 1.2, MAGENTA],
      [0.86, 0.9, CYAN],
      [0.74, 0.76, MAGENTA],
    ] as const;
    for (const [a, b2, col] of bands) if (d > a && d < b2 && z < 0.3) c = mix(c, col, 0.95);
  }
  // striped setting sun
  const dx = z - 0.0;
  const dy = y - 0.62;
  const r = Math.hypot(dx, dy);
  if (r < 0.26) {
    const gap = dy < 0.06 && ((dy + 0.3) * 18) % 1 > 0.62 - (0.06 - dy) * 1.2;
    if (!gap) c = mix(SUN, MAGENTA, smoothstep(0.62 + 0.26, 0.62 - 0.26, y) * 0.9);
  } else if (r < 0.285) c = mix(c, CYAN, 0.85);
  return c;
});

// Control panel: s = uv of the box (u across 0.6 m, v across 0.2 m).
const PANEL_PAINT = paint((_p, n, s) => {
  if (n.y < 0.3) return PANEL;
  const u = s[0];
  const v = s[1];
  let c = mix(PANEL, "#3a1d7a", v * 0.5);
  // zigzag borders along the two long edges
  const zz = tri((u * 0.6) / 0.05) * 0.03;
  const edge = Math.min(v, 1 - v) * 0.2;
  if (Math.abs(edge - 0.012 - zz) < 0.0035) c = v < 0.5 ? MAGENTA : CYAN;
  if (edge < 0.004) c = v < 0.5 ? CYAN : MAGENTA;
  // faint player-zone outlines
  const jr = Math.hypot((u - 0.3) * 0.6, (v - 0.5) * 0.2);
  if (Math.abs(jr - 0.075) < 0.002) c = mix(c, CYAN, 0.55);
  const bx = (u - 0.68) * 0.6;
  const by = (v - 0.5) * 0.2;
  if (Math.max(Math.abs(bx) - 0.1, Math.abs(by) - 0.07) > -0.002 && Math.max(Math.abs(bx) - 0.1, Math.abs(by) - 0.07) < 0.0005 + 0.002)
    c = mix(c, MAGENTA, 0.55);
  return c;
});

// Lower front: s = uv (v 0 bottom, 1 top of the panel).
const FRONT_PAINT = paint((_p, n, s) => {
  if (Math.abs(n.z) < 0.5) return BODY;
  const u = s[0];
  const v = s[1];
  let c: any = BODY;
  const lowerBand = v < 0.4;
  if (v > 0.9 || (lowerBand && v > 0.4 - 0.001)) c = BODY;
  // gradient stripes below and above the coin door
  if (v < 0.27 || v > 0.9) {
    const k = v < 0.27 ? v / 0.27 : (v - 0.9) / 0.1;
    if ((v * 30) % 1 < 0.6) c = mix(MAGENTA, PURPLE, k);
  }
  // faded checker band
  if (v >= 0.29 && v < 0.38) {
    const chk = (Math.floor(u * 12) + Math.floor((v - 0.29) * 12 * 0.78 * 3.3)) % 2 === 0;
    if (chk) c = mix(BODY, CYAN, 0.28 * (1 - Math.abs(u - 0.5) * 1.6));
  }
  return c;
});

export default function build() {
  const b = createBuilder({ name: "arcadeCabinet" });

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    rot?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      ...(rot ? { rotation: rot } : {}),
    });

  const cyl = (
    name: string,
    r1: number,
    r2: number,
    h: number,
    at: [number, number, number],
    color: string,
    seg = 12,
    rot?: [number, number, number],
  ) =>
    b.part(new THREE.CylinderGeometry(r1, r2, h, seg), color, {
      at,
      name,
      ...(rot ? { rotation: rot } : {}),
    });

  const W = 0.6; // interior width
  const SX = 0.315; // side panel x

  // ---- side panels (profile drawn as z along u, y along v)
  const profile: [number, number][] = [
    [-0.42, 0],
    [0.4, 0],
    [0.4, 0.88],
    [0.48, 0.98],
    [0.3, 1.04],
    [0.3, 1.46],
    [0.36, 1.5],
    [0.36, 1.82],
    [-0.28, 1.82],
    [-0.28, 1.4],
    [-0.42, 1.3],
  ];
  for (const s of [1, -1]) {
    b.extrude(profile, {
      at: [s * SX, 0, 0],
      x: [0, 0, 1],
      thickness: 0.035,
      color: SIDE_PAINT,
      name: s > 0 ? "sideL" : "sideR",
    });
    // neon edge strips on the outer faces
    const sx = s * (SX + 0.021);
    glow(box("neonFront" + s, [0.012, 0.86, 0.012], [sx, 0.43, 0.397], MAGENTA), 1.3);
    glow(box("neonMarqueeEdge" + s, [0.012, 0.32, 0.012], [sx, 1.66, 0.357], MAGENTA), 1.3);
    glow(box("neonTop" + s, [0.012, 0.012, 0.64], [sx, 1.815, 0.04], CYAN), 1.3);
    glow(box("neonStep" + s, [0.012, 0.012, 0.2], [sx, 1.01, 0.38], CYAN, [-18, 0, 0]), 1.3);
    // feet
    box("foot" + s, [0.09, 0.025, 0.09], [s * 0.26, 0.0125, 0.33], BLACK);
    box("footB" + s, [0.09, 0.025, 0.09], [s * 0.26, 0.0125, -0.33], BLACK);
  }

  // ---- core body
  box("lowerCore", [W, 0.88, 0.8], [0, 0.44, -0.01], BODY_DARK);
  box("upperCore", [W, 0.96, 0.56], [0, 1.36, 0.0], BODY_DARK);
  b.part(new THREE.BoxGeometry(W, 0.78, 0.02), FRONT_PAINT, { at: [0, 0.49, 0.4], name: "lowerFront" });
  box("kickPlate", [W, 0.1, 0.025], [0, 0.05, 0.4], BLACK);
  box("backPanel", [W, 1.7, 0.02], [0, 0.88, -0.41], BODY);
  box("backPanelTop", [W, 0.5, 0.02], [0, 1.57, -0.285], BODY, [0, 0, 0]);

  // ---- coin door
  box("coinDoorPlate", [0.28, 0.34, 0.02], [0, 0.6, 0.41], BLACK);
  box("coinDoorFrame", [0.3, 0.36, 0.01], [0, 0.6, 0.405], CHROME);
  for (const s of [1, -1]) {
    box("coinSlotPlate" + s, [0.06, 0.1, 0.012], [s * 0.065, 0.67, 0.422], CHROME);
    glow(box("coinSlotLight" + s, [0.012, 0.05, 0.006], [s * 0.065, 0.67, 0.43], s > 0 ? YELLOW : CYAN), 1.2);
    glow(cyl("coinReturnBtn" + s, 0.018, 0.018, 0.012, [s * 0.065, 0.55, 0.425], s > 0 ? RED : YELLOW, 10, [90, 0, 0]), 1.2);
  }
  box("coinCup", [0.1, 0.06, 0.03], [0, 0.46, 0.42], BODY_DARK);

  // ---- control panel (sloped)
  const TILT = 18;
  const cp = (x: number, u: number, lift = 0): [number, number, number] => {
    const t = (TILT * Math.PI) / 180;
    return [x, 1.01 - u * Math.sin(t) + lift * Math.cos(t), 0.39 + u * Math.cos(t) + lift * Math.sin(t)];
  };
  b.part(new THREE.BoxGeometry(W, 0.04, 0.2), PANEL_PAINT, { at: cp(0, 0, -0.02), name: "controlPanel", rotation: [TILT, 0, 0] });
  glow(b.part(new THREE.BoxGeometry(W, 0.012, 0.012), MAGENTA, { at: cp(0, 0.102, -0.02), name: "panelLip", rotation: [TILT, 0, 0] }), 1.3);

  // joystick
  const jp = cp(-0.12, 0.0, 0);
  cyl("joyBase", 0.04, 0.045, 0.012, jp, BLACK, 14, [TILT, 0, 0]);
  const jt = (TILT * Math.PI) / 180;
  const shaft = cp(-0.12, 0, 0.055);
  cyl("joyShaft", 0.007, 0.007, 0.11, shaft, CHROME, 8, [TILT, 0, 0]);
  const ball = cp(-0.12, 0, 0.12);
  b.part(new THREE.SphereGeometry(0.03, 12, 8), RED, { at: ball, name: "joyBall" });
  b.part(new THREE.SphereGeometry(0.008, 6, 4), "#ffffff", {
    at: [ball[0] + 0.01, ball[1] + 0.018, ball[2] + 0.012],
    name: "joyShine",
  });
  void jt;

  // action buttons: two rows
  const btnCols = [CYAN, MAGENTA, YELLOW, RED, SUN, PURPLE];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      const p = cp(0.03 + i * 0.075, -0.035 + j * 0.065, 0.006);
      const c = btnCols[(i + j * 3) % btnCols.length];
      cyl(`btnRing${i}${j}`, 0.03, 0.03, 0.01, cp(0.03 + i * 0.075, -0.035 + j * 0.065, 0.0), BLACK, 14, [TILT, 0, 0]);
      glow(cyl(`btn${i}${j}`, 0.024, 0.026, 0.02, p, c, 14, [TILT, 0, 0]), 1.0);
    }
  }
  // start buttons
  for (const s of [1, -1]) {
    glow(cyl("startBtn" + s, 0.016, 0.016, 0.014, cp(s * 0.22, 0.03, 0.005), s > 0 ? CYAN : MAGENTA, 10, [TILT, 0, 0]), 1.1);
  }
  // trackball-style spinner knob
  cyl("spinnerBase", 0.035, 0.035, 0.01, cp(0.23, -0.04, 0), BLACK, 14, [TILT, 0, 0]);
  b.part(new THREE.SphereGeometry(0.028, 10, 8), CHROME, { at: cp(0.23, -0.04, 0.01), name: "spinnerBall" });

  // ---- monitor area
  box("bezel", [0.58, 0.48, 0.02], [0, 1.25, 0.305], BLACK);
  box("bezelFrame", [0.6, 0.5, 0.012], [0, 1.25, 0.298], PANEL);
  glow(box("screen", [0.5, 0.38, 0.01], [0, 1.25, 0.318], SCREEN), 0.9);
  box("monitorHood", [W, 0.03, 0.06], [0, 1.495, 0.33], BLACK);
  // bottom bezel strip under monitor
  box("monitorSill", [W, 0.03, 0.05], [0, 1.045, 0.32], BODY);

  // ---- marquee
  box("marqueeBase", [W, 0.1, 0.07], [0, 1.54, 0.325], BODY);
  box("marquee", [W, 0.3, 0.06], [0, 1.66, 0.33], BLACK);
  glow(box("marqueeLight", [0.54, 0.24, 0.01], [0, 1.66, 0.365], PURPLE), 1.0);
  box("marqueeFrame", [W, 0.02, 0.07], [0, 1.815, 0.33], CHROME);
  box("marqueeRoof", [W, 0.02, 0.66], [0, 1.82, 0.03], BODY);
  glow(box("marqueeEdgeGlow", [0.58, 0.012, 0.012], [0, 1.52, 0.364], CYAN), 1.3);

  // speaker slots strip hint
  for (const s of [1, -1]) box("speakerPlate" + s, [0.14, 0.06, 0.01], [s * 0.2, 1.43, 0.32], BODY_DARK);

  // ---- back details base
  box("backVent", [0.3, 0.05, 0.01], [0, 1.65, -0.42], BLACK);

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addMarqueeArt(b: Builder) {
  // Marquee light box face: z = 1.66 centre, front at ~0.37. Room 0.58 x 0.24.
  const TITLE = svg(
    `<svg viewBox="0 0 290 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ff7bea"/>
          <stop offset="1" stop-color="#ff2bd6"/>
        </linearGradient>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2a0f6e"/>
          <stop offset="1" stop-color="#120640"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="290" height="120" fill="url(#bg)"/>
      <g stroke="#6a2cff" stroke-width="1" opacity="0.7">
        <path d="M0 100 H290 M0 108 H290 M0 116 H290"/>
        <path d="M145 92 L-40 120 M145 92 L40 120 M145 92 L110 120 M145 92 L180 120 M145 92 L250 120 M145 92 L330 120"/>
      </g>
      <g font-family="Impact, Arial Black, sans-serif" font-weight="900" text-anchor="middle">
        <text x="145" y="52" font-size="44" letter-spacing="3" fill="none" stroke="#19f0ff" stroke-width="7" stroke-linejoin="round">NEON</text>
        <text x="145" y="52" font-size="44" letter-spacing="3" fill="url(#g)">NEON</text>
        <text x="145" y="92" font-size="44" letter-spacing="3" fill="none" stroke="#19f0ff" stroke-width="7" stroke-linejoin="round">RACER</text>
        <text x="145" y="92" font-size="44" letter-spacing="3" fill="url(#g)">RACER</text>
      </g>
      <rect x="40" y="98" width="210" height="5" rx="2" fill="#ffb02e"/>
      <rect x="60" y="106" width="170" height="3" rx="1.5" fill="#ffb02e" opacity="0.7"/>
    </svg>`,
    { size: 512 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.52, 0.215), "#ffffff", {
      at: [0, 1.66, 0.3705],
      dir: [0, 0, 1],
      axis: "z",
      texture: TITLE,
      name: "marqueeTitle",
    }),
    1.2,
  );

  // Chrome racing car silhouettes at each end
  const CAR = svg(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 28 L10 20 L26 18 L36 8 L54 8 L62 18 L76 21 L78 28 Z" fill="#c9c7e6" stroke="#19f0ff" stroke-width="2" stroke-linejoin="round"/>
      <path d="M38 11 L52 11 L57 18 L32 18 Z" fill="#2a0f6e"/>
      <circle cx="20" cy="29" r="7" fill="#0b0716" stroke="#c9c7e6" stroke-width="2"/>
      <circle cx="62" cy="29" r="7" fill="#0b0716" stroke="#c9c7e6" stroke-width="2"/>
      <path d="M2 14 H16 M0 20 H8" stroke="#ff2bd6" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.075, 0.0375), "#ffffff", {
      at: [s * 0.235, 1.745, 0.3715],
      dir: [0, 0, 1],
      axis: "z",
      texture: CAR,
      name: "marqueeCar" + s,
    });
  }

  // Light-box frame trim (thin bars around the lit face)
  const trim = (name: string, sz: [number, number, number], at: [number, number, number], c: string, g = 0) => {
    const p = b.part(new THREE.BoxGeometry(sz[0], sz[1], sz[2]), c, { at, name });
    if (g) glow(p, g);
  };
  trim("marqTrimTop", [0.56, 0.012, 0.012], [0, 1.786, 0.372], "#c9c7e6");
  trim("marqTrimBot", [0.56, 0.012, 0.012], [0, 1.534, 0.372], "#c9c7e6");
  for (const s of [1, -1]) {
    trim("marqTrimSide" + s, [0.012, 0.26, 0.012], [s * 0.277, 1.66, 0.372], "#c9c7e6");
    // corner rivets
    for (const y of [1.54, 1.78]) {
      b.part(new THREE.SphereGeometry(0.007, 6, 4), "#ffffff", {
        at: [s * 0.277, y, 0.379],
        name: "marqRivet",
      });
    }
  }
  // glowing accent under title

  glow(
    b.part(new THREE.BoxGeometry(0.5, 0.006, 0.006), "#ffb02e", {
      at: [0, 1.543, 0.374],
      name: "marqSunLine",
    }),
    1.3,
  );
}
    return addMarqueeArt;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addScreenScene(b: Builder) {
  // Screen front face is at z = 0.318 + 0.005 = 0.323. Room: 0.5 x 0.38.
  const Z = 0.3245;

  const scene = svg(
    `<svg viewBox="0 0 100 76" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1b0a4a"/>
          <stop offset="0.55" stop-color="#7a1fb0"/>
          <stop offset="1" stop-color="#ff2bd6"/>
        </linearGradient>
        <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffe14a"/>
          <stop offset="1" stop-color="#ff2bd6"/>
        </linearGradient>
        <clipPath id="sc"><circle cx="50" cy="38" r="17"/></clipPath>
      </defs>
      <rect width="100" height="44" fill="url(#sky)"/>
      <g fill="#ffffff" opacity="0.9">
        <rect x="8" y="6" width="1" height="1"/><rect x="22" y="12" width="1" height="1"/>
        <rect x="78" y="8" width="1" height="1"/><rect x="90" y="16" width="1" height="1"/>
        <rect x="36" y="5" width="1" height="1"/><rect x="66" y="14" width="1" height="1"/>
      </g>
      <g clip-path="url(#sc)">
        <rect x="30" y="20" width="40" height="24" fill="url(#sun)"/>
        <rect x="30" y="32" width="40" height="1.2" fill="#7a1fb0"/>
        <rect x="30" y="36" width="40" height="1.8" fill="#7a1fb0"/>
        <rect x="30" y="40" width="40" height="2.4" fill="#7a1fb0"/>
      </g>
      <path d="M0 44 L14 40 L26 44 L40 38 L52 44 L100 44 L100 46 L0 46Z" fill="#2a0a5e"/>
      <rect y="44" width="100" height="32" fill="#12062e"/>
      <g stroke="#ff2bd6" stroke-width="0.7" fill="none">
        <line x1="0" y1="46" x2="100" y2="46"/>
        <line x1="0" y1="49" x2="100" y2="49"/>
        <line x1="0" y1="53" x2="100" y2="53"/>
        <line x1="0" y1="58" x2="100" y2="58"/>
        <line x1="0" y1="64" x2="100" y2="64"/>
        <line x1="0" y1="71" x2="100" y2="71"/>
      </g>
      <g stroke="#6a2cff" stroke-width="0.7">
        <line x1="50" y1="44" x2="-30" y2="76"/><line x1="50" y1="44" x2="-5" y2="76"/>
        <line x1="50" y1="44" x2="20" y2="76"/><line x1="50" y1="44" x2="80" y2="76"/>
        <line x1="50" y1="44" x2="105" y2="76"/><line x1="50" y1="44" x2="130" y2="76"/>
      </g>
      <polygon points="48.5,44 51.5,44 66,76 34,76" fill="#0b0716" stroke="#19f0ff" stroke-width="0.9"/>
      <g fill="#ffe14a">
        <rect x="49.6" y="47" width="0.8" height="2"/>
        <rect x="49.4" y="53" width="1.2" height="3"/>
        <rect x="49.1" y="60" width="1.8" height="4"/>
        <rect x="48.7" y="68" width="2.6" height="5"/>
      </g>
      <g>
        <rect x="45" y="55" width="10" height="4" rx="1" fill="#ff2a4d"/>
        <rect x="46.5" y="53" width="7" height="3" rx="1" fill="#19f0ff"/>
        <rect x="45" y="58.5" width="2" height="1.5" fill="#0b0716"/>
        <rect x="53" y="58.5" width="2" height="1.5" fill="#0b0716"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const insert = svg(
    `<svg viewBox="0 0 100 12" xmlns="http://www.w3.org/2000/svg">
      <text x="50" y="9.5" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="10" letter-spacing="2" fill="#000000" opacity="0.7" transform="translate(0.6 0.6)">INSERT COIN</text>
      <text x="50" y="9.5" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="10" letter-spacing="2" fill="#ffe14a">INSERT COIN</text>
    </svg>`,
    { size: 512 },
  );

  glow(
    b.part(new THREE.PlaneGeometry(0.5, 0.38), "#ffffff", {
      at: [0, 1.25, Z],
      dir: [0, 0, 1],
      axis: "z",
      texture: scene,
      name: "screenScene",
    }),
    1.0,
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.3, 0.036), "#ffffff", {
      at: [0, 1.087, Z + 0.002],
      dir: [0, 0, 1],
      axis: "z",
      texture: insert,
      name: "insertCoinText",
    }),
    1.3,
  );

  // Scanline overlay: thin dark strips
  const scan = svg(
    `<svg viewBox="0 0 8 32" xmlns="http://www.w3.org/2000/svg"><g fill="#000000" opacity="0.18">${Array.from(
      { length: 16 },
      (_, i) => `<rect x="0" y="${i * 2 + 1}" width="8" height="1"/>`,
    ).join("")}</g></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.38), "#ffffff", {
    at: [0, 1.25, Z + 0.0015],
    dir: [0, 0, 1],
    axis: "z",
    texture: scan,
    name: "scanlines",
  });

  // ---- bezel trim
  const ZB = Z + 0.003;
  // thin cyan inner frame
  const fw = 0.51;
  const fh = 0.39;
  const t = 0.005;
  const frame: [number, number, number, number][] = [
    [fw, t, 0, fh / 2],
    [fw, t, 0, -fh / 2],
    [t, fh, fw / 2, 0],
    [t, fh, -fw / 2, 0],
  ];
  frame.forEach(([w, h, x, y], i) =>
    glow(
      b.part(new THREE.BoxGeometry(w, h, 0.004), CYAN, {
        at: [x, 1.25 + y, ZB],
        name: "cyanFrame" + i,
      }),
      1.4,
    ),
  );

  // chrome corner screws on the bezel
  for (const sx of [1, -1])
    for (const sy of [1, -1]) {
      const at: [number, number, number] = [sx * 0.285, 1.25 + sy * 0.225, 0.318];
      b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.008, 10), CHROME, {
        at,
        rotation: [90, 0, 0],
        name: `bezelScrew${sx}${sy}`,
      });
      b.part(new THREE.BoxGeometry(0.012, 0.002, 0.002), BLACK, {
        at: [at[0], at[1], at[2] + 0.0045],
        rotation: [0, 0, sx * sy * 40],
        name: `screwSlot${sx}${sy}`,
      });
    }

  // curved-glass highlight, top-left of screen (viewer's left = model +x)
  const hl = svg(
    `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2 H34 Q14 8 6 28 Z" fill="#ffffff" opacity="0.28"/>
      <path d="M40 2 H48 Q30 6 22 22 Z" fill="#ffffff" opacity="0.16"/>
    </svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.2, 0.15), "#ffffff", {
    at: [0.15, 1.25 + 0.115, Z + 0.0025],
    dir: [0, 0, 1],
    axis: "z",
    texture: hl,
    mirror: false,
    rotation: [0, 0, 0],
    name: "glassHighlight",
  } as never);
}
    return addScreenScene;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addSpeakerGrilles(b: Builder) {
  // ---------- Speaker grilles (marqueeBase front face z ~ 0.36, plates at z 0.325..0.33 -> front 0.335)
  const grilleTex = svg(
    `<svg viewBox="0 0 140 60" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="140" height="60" rx="6" fill="#0f0820"/>
      ${Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 11 }, (_, c) =>
          `<circle cx="${15 + c * 11 + (r % 2) * 5}" cy="${12 + r * 12}" r="3.6" fill="#0b0716" stroke="#3a2570" stroke-width="1"/>`).join("")).join("")}
      <rect x="2" y="2" width="136" height="56" rx="6" fill="none" stroke="#ff2bd6" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.13, 0.056), "#ffffff", {
      at: [s * 0.2, 1.43, 0.3365],
      dir: [0, 0, 1],
      axis: "z",
      texture: grilleTex,
      name: "grilleFace" + s,
    });
    // magenta trim frame (4 thin bars)
    const cx = s * 0.2, cy = 1.43, z = 0.338;
    glow(b.part(new THREE.BoxGeometry(0.136, 0.004, 0.004), MAGENTA, { at: [cx, cy + 0.03, z], name: "grilleTrimT" + s }), 1.1);
    glow(b.part(new THREE.BoxGeometry(0.136, 0.004, 0.004), MAGENTA, { at: [cx, cy - 0.03, z], name: "grilleTrimB" + s }), 1.1);
    for (const e of [1, -1])
      glow(b.part(new THREE.BoxGeometry(0.004, 0.06, 0.004), MAGENTA, { at: [cx + e * 0.068, cy, z], name: `grilleTrimE${s}${e}` }), 1.1);
    // tiny corner screws
    for (const e of [1, -1])
      b.part(new THREE.SphereGeometry(0.004, 6, 4), CHROME, { at: [cx + e * 0.072, cy + 0.0, 0.336], name: `grilleScrew${s}${e}` });
  }

  // ---------- Control panel details
  const TILT = 18;
  const t = (TILT * Math.PI) / 180;
  const cp = (x: number, u: number, lift = 0): [number, number, number] => [
    x,
    1.01 - u * Math.sin(t) + lift * Math.cos(t),
    0.39 + u * Math.cos(t) + lift * Math.sin(t),
  ];
  const surf = -0.0 + 0.0; // panel top sits at lift 0 (centre lift -0.02, half thickness 0.02)

  // etched cyan grid + zigzag artwork as a decal plane on the panel top
  const gridTex = svg(
    `<svg viewBox="0 0 280 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#19f0ff" stroke-width="1.2" opacity="0.8" fill="none">
        ${Array.from({ length: 15 }, (_, i) => `<path d="M${i * 20} 8 V92"/>`).join("")}
        ${Array.from({ length: 6 }, (_, i) => `<path d="M0 ${8 + i * 16.8} H280"/>`).join("")}
      </g>
      <path d="M0 4 ${Array.from({ length: 28 }, (_, i) => `L${(i + 1) * 10} ${i % 2 ? 4 : 10}`).join(" ")}" stroke="#ff2bd6" stroke-width="2.5" fill="none"/>
      <path d="M0 96 ${Array.from({ length: 28 }, (_, i) => `L${(i + 1) * 10} ${i % 2 ? 96 : 90}`).join(" ")}" stroke="#ff2bd6" stroke-width="2.5" fill="none"/>
    </svg>`,
    { size: 512 },
  );
  // plane normal: panel top faces up-forward; rotate via aim to normal
  const n: [number, number, number] = [0, Math.cos(t), Math.sin(t)];
  const topAt = cp(0, 0, 0.0005);
  b.part(new THREE.PlaneGeometry(0.56, 0.19), "#ffffff", {
    at: topAt,
    dir: n,
    axis: "z",
    up: [0, -Math.sin(t), Math.cos(t)],
    texture: gridTex,
    name: "panelGrid",
  });
  void surf;

  // START labels + buttons
  const labelTex = (txt: string, col: string) =>
    svg(
      `<svg viewBox="0 0 80 24" xmlns="http://www.w3.org/2000/svg"><text x="40" y="18" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="17" fill="${col}">${txt}</text></svg>`,
      { size: 192 },
    );
  const up: [number, number, number] = [0, -Math.sin(t), Math.cos(t)];
  [
    [1, "1P START", CYAN],
    [-1, "2P START", MAGENTA],
  ].forEach(([s, txt, col]) => {
    const sx = (s as number) * 0.22;
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.006, 14), BLACK, {
      at: cp(sx, 0.03, 0.002),
      rotation: [TILT, 0, 0],
      name: "startRing" + s,
    });
    b.part(new THREE.PlaneGeometry(0.07, 0.021), "#ffffff", {
      at: cp(sx, 0.07, 0.002),
      dir: n,
      axis: "z",
      up,
      texture: labelTex(txt as string, col as string),
      name: "startLabel" + s,
    });
  });

  // chrome screws at corners
  for (const sx of [-1, 1])
    for (const u of [-0.085, 0.085])
      b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.004, 8), CHROME, {
        at: cp(sx * 0.27, u, 0.003),
        rotation: [TILT, 0, 0],
        name: `panelScrew${sx}${u}`,
      });

  // magenta neon strip on the front lip (rounded tube look)
  glow(
    b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.58, 8), MAGENTA, {
      at: cp(0, 0.104, -0.02),
      rotation: [0, 0, 90],
      name: "panelLipTube",
    }),
    1.5,
  );
  // lip end caps
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.008, 6, 4), CHROME, { at: cp(s * 0.29, 0.104, -0.02), name: "lipCap" + s });
}
    return addSpeakerGrilles;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addCoinDoor(b: Builder) {
  const Z = 0.42; // front face of coin door plate (plate centre 0.41, half thickness 0.01)
  const cx = 0;
  const cy = 0.6;

  const label = svg(
    `<svg viewBox="0 0 120 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="118" height="22" rx="3" fill="#0b0716" stroke="#19f0ff" stroke-width="2"/>
      <text x="60" y="17" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#ffe14a">INSERT COIN</text>
    </svg>`,
    { size: 256 },
  );
  const slotTex = svg(
    `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="36" height="56" rx="5" fill="#c9c7e6" stroke="#6a6a8a" stroke-width="2"/>
      <rect x="17" y="10" width="6" height="22" rx="2" fill="#0b0716"/>
      <circle cx="20" cy="45" r="6" fill="none" stroke="#6a6a8a" stroke-width="2"/>
      <text x="20" y="48" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="8" fill="#6a6a8a">25</text>
    </svg>`,
    { size: 128 },
  );

  // label above the mechanisms
  b.part(new THREE.PlaneGeometry(0.2, 0.04), "#ffffff", {
    at: [cx, cy + 0.14, Z + 0.001],
    dir: [0, 0, 1],
    axis: "z",
    texture: label,
    name: "coinLabel",
  });

  for (const s of [1, -1]) {
    const x = cx + s * 0.065;
    // coin mechanism housing
    b.part(new THREE.BoxGeometry(0.08, 0.13, 0.014), BODY_DARK, { at: [x, cy + 0.03, Z + 0.007], name: "coinMech" + s });
    // chrome slot plate with drawn slot
    b.part(new THREE.PlaneGeometry(0.06, 0.09), "#ffffff", {
      at: [x, cy + 0.04, Z + 0.0151],
      dir: [0, 0, 1],
      axis: "z",
      texture: slotTex,
      name: "coinSlotArt" + s,
    });
    // slot lit bezel
    glow(
      b.part(new THREE.BoxGeometry(0.05, 0.006, 0.004), s > 0 ? YELLOW : CYAN, {
        at: [x, cy + 0.088, Z + 0.016],
        name: "coinSlotGlow" + s,
      }),
      1.3,
    );
    // coin return button housing + glowing button
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.008, 12), CHROME, {
      at: [x, cy - 0.07, Z + 0.004],
      dir: [0, 0, 1],
      name: "returnRing" + s,
    });
    glow(
      b.part(new THREE.CylinderGeometry(0.019, 0.02, 0.014, 12), s > 0 ? YELLOW : RED, {
        at: [x, cy - 0.07, Z + 0.011],
        dir: [0, 0, 1],
        name: "returnBtn" + s,
      }),
      1.5,
    );
    // little ridges on button face
    b.part(new THREE.BoxGeometry(0.02, 0.003, 0.002), "#ffffff", {
      at: [x + 0.004, cy - 0.062, Z + 0.0185],
      name: "returnShine" + s,
    });
  }

  // CYAN-lit coin return cup
  b.part(new THREE.BoxGeometry(0.11, 0.07, 0.012), BLACK, { at: [cx, cy - 0.125, Z + 0.006], name: "cupFrame" });
  b.part(new THREE.BoxGeometry(0.09, 0.05, 0.012), BODY_DARK, { at: [cx, cy - 0.125, Z + 0.011], name: "cupWell" });
  glow(
    b.part(new THREE.BoxGeometry(0.084, 0.006, 0.004), CYAN, { at: [cx, cy - 0.104, Z + 0.0175], name: "cupGlow" }),
    1.4,
  );
  b.part(new THREE.BoxGeometry(0.11, 0.008, 0.02), CHROME, { at: [cx, cy - 0.16, Z + 0.012], name: "cupLip" });

  // four corner screws with slots
  for (const sx of [1, -1])
    for (const sy of [1, -1]) {
      const p: [number, number, number] = [cx + sx * 0.13, cy + sy * 0.16, Z + 0.003];
      b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 8), CHROME, {
        at: p,
        dir: [0, 0, 1],
        name: "doorScrew",
      });
      b.part(new THREE.BoxGeometry(0.011, 0.002, 0.002), BLACK, {
        at: [p[0], p[1], p[2] + 0.0035],
        rotation: [0, 0, sx * sy > 0 ? 35 : -35],
        name: "screwSlot",
      });
    }

  // chrome door handle bar and hinge pins on the edges
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.08, 8), CHROME, {
      at: [s * 0.158, cy, Z - 0.005],
      name: "doorHinge" + s,
    });
  }
}
    return addCoinDoor;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addTMolding(b: Builder) {
  const WARN = "#ffd23a";
  const PLUG = "#2a2438";
  const CABLE = "#14101e";

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    rot?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, name, ...(rot ? { rotation: rot } : {}) });

  // ---------- T-molding ----------
  for (const s of [1, -1]) {
    const x = s * 0.337;
    const n = s > 0 ? "L" : "R";
    // rear vertical edge and bottom/top rear edges
    glow(box(`s25tmRear${n}`, [0.01, 1.4, 0.01], [x, 0.7, -0.415], MAGENTA), 1.2);
    glow(box(`s25tmBase${n}`, [0.01, 0.01, 0.8], [x, 0.012, -0.01], MAGENTA), 1.1);
    glow(box(`s25tmMarqFront${n}`, [0.01, 0.01, 0.1], [x, 1.815, 0.375], MAGENTA), 1.2);
    // control panel step: cyan along the sloped top edge of the side
    glow(box(`s25tmStepA${n}`, [0.01, 0.012, 0.1], [x, 0.93, 0.44], CYAN, [38, 0, 0]), 1.3);
    glow(box(`s25tmStepB${n}`, [0.01, 0.1, 0.012], [x, 0.93, 0.405], CYAN), 1.2);
    glow(box(`s25tmStepC${n}`, [0.01, 0.012, 0.12], [x, 1.045, 0.34], CYAN), 1.2);
    // end caps (small chrome blocks at corners)
    const caps: [number, number, number][] = [
      [x, 0.0, 0.398],
      [x, 1.82, 0.36],
      [x, 1.82, -0.28],
      [x, 0.9, 0.4],
      [x, 1.3, -0.415],
    ];
    caps.forEach((c, i) => {
      const cap = b.part(new THREE.SphereGeometry(0.009, 6, 4), CHROME, { at: c, name: `s25tmCap${n}${i}` });
      void cap;
    });
    // mid-edge neon clips
    for (let i = 0; i < 4; i++) {
      box(`s25tmClip${n}${i}`, [0.014, 0.02, 0.014], [x, 0.2 + i * 0.2, 0.4], BLACK);
    }
  }

  // ---------- Back details ----------
  const bz = -0.425;
  // vent slots near top, plus frame
  box("s25ventFrame", [0.34, 0.09, 0.006], [0, 1.65, bz + 0.002], CHROME);
  for (let i = 0; i < 6; i++) box(`s25vent${i}`, [0.3, 0.008, 0.008], [0, 1.625 + i * 0.0105, bz - 0.001], BLACK);
  // lower vent
  box("s25ventLowFrame", [0.2, 0.07, 0.006], [0, 0.35, bz + 0.002], BODY_DARK);
  for (let i = 0; i < 4; i++) box(`s25ventLow${i}`, [0.17, 0.007, 0.008], [0, 0.33 + i * 0.014, bz - 0.001], BLACK);

  // warning label (svg)
  const label = svg(
    `<svg viewBox="0 0 64 48"><rect width="64" height="48" rx="3" fill="#ffd23a"/>
    <rect x="2" y="2" width="60" height="44" rx="2" fill="none" stroke="#14101e" stroke-width="2"/>
    <path d="M14 8 L24 26 L4 26Z" fill="#14101e"/><rect x="13" y="13" width="2" height="7" fill="#ffd23a"/>
    <rect x="13" y="22" width="2" height="2" fill="#ffd23a"/>
    <g fill="#14101e"><rect x="30" y="10" width="28" height="3"/><rect x="30" y="17" width="24" height="2"/>
    <rect x="30" y="23" width="28" height="2"/><rect x="8" y="33" width="48" height="2"/><rect x="8" y="39" width="36" height="2"/></g></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.14, 0.105), "#ffffff", {
    at: [-0.12, 1.2, bz - 0.0015],
    dir: [0, 0, -1],
    axis: "z",
    texture: label,
    name: "s25warnLabel",
  });
  // rating plate
  box("s25ratingPlate", [0.1, 0.05, 0.004], [0.15, 1.22, bz - 0.0005], CHROME);
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.005, 6, 4), BLACK, { at: [0.15 + s * 0.042, 1.22, bz - 0.003], name: "s25plateScrew" });

  // power inlet + plug
  box("s25inletPlate", [0.07, 0.09, 0.006], [0.18, 0.2, bz], CHROME);
  box("s25inlet", [0.045, 0.06, 0.012], [0.18, 0.2, bz - 0.008], BLACK);
  box("s25plug", [0.05, 0.07, 0.04], [0.18, 0.2, bz - 0.035], PLUG);
  for (const s of [1, -1]) box("s25plugPin" + s, [0.006, 0.02, 0.01], [0.18 + s * 0.012, 0.2, bz - 0.058], CHROME);
  // cable looping down to the floor
  const pts: [number, number, number][] = [
    [0.18, 0.2, -0.47],
    [0.17, 0.16, -0.5],
    [0.1, 0.06, -0.54],
    [0.0, 0.015, -0.56],
    [-0.12, 0.015, -0.52],
    [-0.2, 0.015, -0.6],
    [-0.1, 0.015, -0.68],
  ];
  b.sweep(pts, 0.011, { color: CABLE, sides: 6, caps: "round", bone: undefined as never });
  // strain relief
  b.part(new THREE.CylinderGeometry(0.015, 0.011, 0.04, 8), PLUG, {
    at: [0.18, 0.2, bz - 0.07],
    rotation: [90, 0, 0],
    name: "s25strain",
  });

  // ribbon of purple cables to the monitor
  for (let i = 0; i < 4; i++) {
    const x = -0.09 + i * 0.012;
    const cab: [number, number, number][] = [
      [x, 1.5, bz - 0.004],
      [x - 0.01, 1.4, bz - 0.03],
      [x + 0.02, 1.3, bz - 0.04],
      [x, 1.2, bz - 0.02],
    ];
    b.sweep(cab, 0.005, { color: i % 2 ? PURPLE : MAGENTA, sides: 5, caps: "round" });
  }
  // cable clips
  for (const y of [1.4, 1.3]) box("s25clip" + y, [0.06, 0.012, 0.012], [-0.07, y, bz - 0.01], BLACK);
  // corner screws on back
  for (const sx of [1, -1])
    for (const y of [0.1, 1.75])
      b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 8), CHROME, {
        at: [sx * 0.27, y, bz - 0.002],
        rotation: [90, 0, 0],
        name: "s25backScrew",
      });
}
    return addTMolding;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addKickGlow(b: Builder) {
  const DEEP = "#3a0f7a";
  const HOT = "#ff7ae8";
  const WHITE = "#ffffff";

  // ---------- Request 1: kick plate underglow ----------
  // cyan light strip along the bottom of the kick plate
  glow(
    b.part(new THREE.BoxGeometry(0.56, 0.012, 0.012), CYAN, { at: [0, 0.012, 0.416], name: "s26kickStrip" }),
    1.6,
  );
  // white-hot core line
  glow(
    b.part(new THREE.BoxGeometry(0.5, 0.004, 0.004), WHITE, { at: [0, 0.012, 0.423], name: "s26kickCore" }),
    1.4,
  );
  // end caps
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.014, 0.022, 0.018), BLACK, { at: [s * 0.288, 0.013, 0.412], name: "s26kickCap" + s });
    // small chrome screws on the kick plate
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 8), CHROME, {
      at: [s * 0.26, 0.055, 0.416],
      rotation: [90, 0, 0],
      name: "s26kickScrew" + s,
    });
  }
  // vertical tick marks on the kick plate (racing-stripe vents)
  for (let i = -4; i <= 4; i++) {
    if (i === 0) continue;
    b.part(new THREE.BoxGeometry(0.008, 0.04, 0.004), i % 2 ? PURPLE : MAGENTA, {
      at: [i * 0.05, 0.058, 0.414],
      name: "s26kickTick" + i,
    });
  }

  // floor glow disc: radial gradient texture on a flat plane (cutout edges)
  const floorTex = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#ff2bd6" stop-opacity="1"/>
        <stop offset="0.55" stop-color="#d21bff" stop-opacity="0.95"/>
        <stop offset="1" stop-color="#6a2cff" stop-opacity="0.55"/>
      </radialGradient></defs>
      <ellipse cx="64" cy="64" rx="62" ry="62" fill="url(#g)"/>
      <ellipse cx="64" cy="64" rx="44" ry="44" fill="none" stroke="#19f0ff" stroke-width="3" stroke-dasharray="10 8"/>
      <ellipse cx="64" cy="64" rx="26" ry="26" fill="none" stroke="#ffb02e" stroke-width="2.5"/>
    </svg>`,
    { size: 256 },
  );
  const disc = b.part(new THREE.PlaneGeometry(1, 1), WHITE, {
    at: [0, 0.003, 0.36],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    scale: [0.96, 0.96, 1],
    texture: floorTex,
    name: "s26floorGlow",
  });
  glow(disc, 0.9);
  // thin cyan ring on floor under the front
  glow(
    b.part(new THREE.RingGeometry(0.5, 0.515, 24), CYAN, {
      at: [0, 0.004, 0.36],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      name: "s26floorRing",
    }),
    1.3,
  );

  // ---------- Request 2: top ornaments ----------
  const roofY = 1.83;
  // chevron fins on marquee roof corners (extruded, glowing)
  const fin: [number, number][] = [
    [0, 0],
    [0.16, 0],
    [0.2, 0.05],
    [0.1, 0.05],
    [0.06, 0.11],
    [0.02, 0.11],
  ];
  for (const s of [1, -1]) {
    // outer fin, drawn along z, sitting at front corners
    b.extrude(fin, {
      at: [s * 0.27, roofY, 0.3],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.003,
      color: s > 0 ? CYAN : MAGENTA,
      name: "s26finA" + s,
    });
    glow(
      b.part(new THREE.BoxGeometry(0.01, 0.01, 0.2), s > 0 ? MAGENTA : CYAN, {
        at: [s * 0.27, roofY + 0.004, 0.2],
        name: "s26finEdge" + s,
      }),
      1.4,
    );
    // rear smaller fin
    const small = fin.map(([x, y]) => [x * 0.7, y * 0.8] as [number, number]);
    b.extrude(small, {
      at: [s * 0.27, roofY, -0.1],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.016,
      bevel: 0.002,
      color: s > 0 ? MAGENTA : CYAN,
      name: "s26finB" + s,
    });
  }
  // cross chevron on the roof top (a flat V stripe)
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.BoxGeometry(0.2, 0.006, 0.014), s > 0 ? CYAN : MAGENTA, {
        at: [s * 0.1, roofY - 0.0, 0.1],
        rotation: [0, s * 22, 0],
        name: "s26chevron" + s,
      }),
      1.3,
    );
  }

  // antenna beacon
  b.part(new THREE.CylinderGeometry(0.03, 0.036, 0.016, 10), BLACK, { at: [0, roofY + 0.008, -0.05], name: "s26beaconBase" });
  b.part(new THREE.CylinderGeometry(0.004, 0.006, 0.17, 6), CHROME, { at: [0, roofY + 0.1, -0.05], name: "s26mast" });
  for (let i = 0; i < 3; i++) {
    b.part(new THREE.TorusGeometry(0.014 + i * 0.004, 0.003, 4, 10), i % 2 ? MAGENTA : CYAN, {
      at: [0, roofY + 0.05 + i * 0.03, -0.05],
      rotation: [90, 0, 0],
      name: "s26mastRing" + i,
    });
  }
  glow(
    b.part(new THREE.OctahedronGeometry(0.024, 0), RED, { at: [0, roofY + 0.2, -0.05], name: "s26beacon" }),
    2.0,
  );
  glow(
    b.part(new THREE.SphereGeometry(0.01, 6, 4), WHITE, { at: [0, roofY + 0.2, -0.05], name: "s26beaconCore" }),
    1.6,
  );
  void DEEP;
  void HOT;
}
    return addKickGlow;
  })(),
);
