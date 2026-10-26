import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import type { Builder } from "../../../../src/index";
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
      color: BODY,
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
  box("lowerFront", [W, 0.78, 0.02], [0, 0.49, 0.4], BODY);
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
  b.part(new THREE.BoxGeometry(W, 0.04, 0.2), PANEL, { at: cp(0, 0, -0.02), name: "controlPanel", rotation: [TILT, 0, 0] });
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
