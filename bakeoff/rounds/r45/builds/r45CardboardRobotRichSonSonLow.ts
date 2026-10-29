import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Cardboard Box Robot Kid",
  "description": "A six-year-old in a homemade cardboard-box robot costume: a box torso with a glued-on control panel, a box helmet with a face window and straw antennae, foil-wrapped tube arms with claw mitts, and a paper-cup-and-bottle jetpack."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  cardboard: "#c49453",
  cardboardLight: "#d8ab6a",
  cardboardDark: "#94683a",
  cardboardEdge: "#6b4723",
  tape: "#dcbf84",
  foil: "#c8cdd5",
  foilDark: "#8b919c",
  foilBright: "#f0f3f7",
  marker: "#231c18",
  paperWhite: "#f3eedf",
  paintRed: "#d8412f",
  paintBlue: "#2f6fcf",
  paintYellow: "#f1c232",
  screenGlow: "#86f4ff",
  ledRed: "#ff4a36",
  ledGreen: "#5dff86",
  skin: "#f0c29c",
  skinShade: "#d9a07e",
  hair: "#6a4426",
  cheek: "#f0958a",
  eyeWhite: "#fcfbf6",
  pupil: "#17120f",
  iris: "#4b8a5a",
  jeans: "#3d5c99",
};
const M = {
  neckTop: [0, 0.93, 0] as [number, number, number],
  headBoxBase: [0, 0.93, 0] as [number, number, number],
  faceWindowCenter: [0, 1.07, 0.17] as [number, number, number],
  skullCenter: [0, 1.07, 0] as [number, number, number],
  antennaBaseL: [0.08, 1.23, 0] as [number, number, number],
  antennaBaseR: [-0.08, 1.23, 0] as [number, number, number],
  earCupL: [0.17, 1.07, 0] as [number, number, number],
  earCupR: [-0.17, 1.07, 0] as [number, number, number],
  torsoFront: [0, 0.68, 0.18] as [number, number, number],
  torsoBack: [0, 0.68, -0.18] as [number, number, number],
  torsoBottom: [0, 0.42, 0] as [number, number, number],
  armHoleL: [0.26, 0.84, 0] as [number, number, number],
  armHoleR: [-0.26, 0.84, 0] as [number, number, number],
  wristL: [0.47, 0.5, 0.03] as [number, number, number],
  wristR: [-0.47, 0.5, 0.03] as [number, number, number],
  hipL: [0.1, 0.5, 0] as [number, number, number],
  hipR: [-0.1, 0.5, 0] as [number, number, number],
  kneeL: [0.1, 0.27, 0.01] as [number, number, number],
  kneeR: [-0.1, 0.27, 0.01] as [number, number, number],
  ankleL: [0.1, 0.07, 0] as [number, number, number],
  ankleR: [-0.1, 0.07, 0] as [number, number, number],
  footSoleL: [0.1, 0, 0.04] as [number, number, number],
  footSoleR: [-0.1, 0, 0.04] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torsoBox
  (() => {
function buildTorsoBox({ b, J, P, M }: any) {
  const T = 0.008;
  const bone = J.chest;
  const box = (w: number, h: number, d: number, c: string, at: number[], rot: number[] = [0, 0, 0], bn = bone) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: bn, at, rotation: rot });
  const cyl = (rt: number, h: number, c: string, at: number[], dir: number[], seg = 12) =>
    b.part(new THREE.CylinderGeometry(rt, rt, h, seg), c, { bone, at, dir });
  const Y0 = 0.42, Y1 = 0.93, X = 0.26, Z = 0.18, H = Y1 - Y0, YC = (Y0 + Y1) / 2;

  // back, front
  box(2 * X, H, T, P.cardboard, [0, YC, -Z]);
  box(2 * X, H, T, P.cardboard, [0, YC, Z]);
  box(0.44, 0.42, 0.006, P.cardboardLight, [0, YC, Z + 0.006]);

  // side panels with arm holes (built as bars around hole)
  const hy = 0.84, hr = 0.065;
  for (const s of [1, -1]) {
    const x = s * X;
    box(T, hy - hr - Y0, 2 * Z, P.cardboard, [x, (Y0 + hy - hr) / 2, 0]);
    box(T, Y1 - hy - hr, 2 * Z, P.cardboard, [x, (Y1 + hy + hr) / 2, 0]);
    box(T, 2 * hr, Z - hr, P.cardboard, [x, hy, (Z + hr) / 2]);
    box(T, 2 * hr, Z - hr, P.cardboard, [x, hy, -(Z + hr) / 2]);
    // rim strips
    const cols = [P.cardboardEdge, P.cardboardDark, P.cardboardLight, P.cardboardEdge];
    cols.forEach((c, i) => {
      const r = hr + 0.004 + i * 0.005;
      b.part(new THREE.TorusGeometry(r, 0.0035, 5, 14), c, { bone, at: [x + s * (0.004 + i * 0.001), hy, 0], dir: [1, 0, 0], axis: "z" });
    });
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + 0.4 + s * 0.1;
      box(0.0015, 0.03, 0.05, P.tape, [x + s * 0.006, hy + Math.sin(a) * 0.1, Math.cos(a) * 0.1], [(a * 180) / Math.PI - 90 + 0, 0, 0]);
    }
    // edge strips on side
    box(0.012, 0.006, 2 * Z, P.cardboardEdge, [x, Y0, 0]);
    box(0.012, 0.006, 2 * Z, P.cardboardEdge, [x, Y1, 0]);
  }
  // top panel with neck hole (0.2 square)
  const tw = (2 * X - 0.2) / 2, td = (2 * Z - 0.2) / 2;
  for (const s of [1, -1]) {
    box(tw, T, 2 * Z, P.cardboard, [s * (0.1 + tw / 2), Y1, 0]);
    box(0.2, T, td, P.cardboard, [0, Y1, s * (0.1 + td / 2)]);
  }
  // flaps
  box(0.4, T, 0.1, P.cardboardLight, [0, Y1 + 0.03, Z + 0.04], [-35, 0, 2]);
  box(0.4, T, 0.1, P.cardboardLight, [0, Y1 + 0.015, -Z - 0.05], [20, 0, -3]);
  box(0.1, 0.0015, 0.03, P.tape, [0.08, Y1 + 0.006, Z - 0.005], [0, 4, 0]);
  box(0.1, 0.0015, 0.03, P.tape, [-0.1, Y1 + 0.006, -Z + 0.01], [0, -3, 0]);

  // edge strips on front/back top & bottom
  for (const z of [Z, -Z]) {
    box(2 * X, 0.006, 0.012, P.cardboardEdge, [0, Y0, z]);
    box(2 * X, 0.006, 0.012, P.cardboardEdge, [0, Y1 + 0.002, z]);
  }
  // corner tape seams
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    box(0.03, H, 0.03, P.tape, [sx * (X + 0.001), YC, sz * (Z + 0.001)], [0, 0, sx * 1.5]);
  }
  // hem band
  box(2 * X + 0.012, 0.04, 2 * Z + 0.012, P.tape, [0, Y0 + 0.03, 0]);
  box(0.06, 0.0015, 0.05, P.tape, [-0.15, 0.55, Z + 0.008], [0, 0, 20]);
  box(0.06, 0.0015, 0.05, P.tape, [0.2, 0.9, Z + 0.003], [0, 0, -15]);

  // control board
  const bz = 0.192;
  const bd = (w: number, h: number, c: string, x: number, y: number, t = 0.002, dz = 0.006) =>
    box(w, h, t, c, [x, 0.68 + y, bz + dz], [0, 0, 1.5]);
  bd(0.31, 0.27, P.cardboardEdge, 0, 0, 0.01, 0);
  bd(0.30, 0.26, P.cardboardLight, 0, 0, 0.004, 0.005);
  // screen
  bd(0.18, 0.1, P.marker, 0, 0.07, 0.003, 0.008);
  glow(bd(0.17, 0.09, P.screenGlow, 0, 0.07, 0.003, 0.0105), 1.2);
  const zz = [[-0.07, 0], [-0.04, 0.03], [-0.02, -0.025], [0.01, 0.03], [0.04, -0.02], [0.07, 0]];
  for (let i = 0; i < zz.length - 1; i++) {
    const [x0, y0] = zz[i], [x1, y1] = zz[i + 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    box(len, 0.004, 0.002, P.marker, [(x0 + x1) / 2, 0.75 + (y0 + y1) / 2, bz + 0.0135], [0, 0, (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI]);
  }
  // dials
  [-0.09, 0, 0.09].forEach((x, i) => {
    cyl(0.03, 0.006, P.foil, [x, 0.6, bz + 0.01], [0, 0, 1]);
    cyl(0.012, 0.007, P.foilDark, [x, 0.6, bz + 0.0125], [0, 0, 1], 8);
    box(0.004, 0.022, 0.002, P.marker, [x + 0.006 * (i - 1), 0.612, bz + 0.0145], [0, 0, 20 * (i - 1)]);
    for (let k = 0; k < 5; k++) {
      const a = -0.9 + k * 0.45;
      box(0.003, 0.006, 0.002, P.marker, [x + Math.sin(a) * 0.036, 0.6 + Math.cos(a) * 0.036, bz + 0.011]);
    }
  });
  // buttons
  const bc = [P.paintRed, P.paintBlue, P.paintYellow, P.paintRed, P.paintBlue, P.paintYellow];
  bc.forEach((c, i) => cyl(0.014, 0.008, c, [-0.11 + i * 0.044, 0.545, bz + 0.011], [0, 0, 1], 8));
  // toggles
  [-0.12, -0.08].forEach((x) => {
    cyl(0.003, 0.03, P.foilDark, [x, 0.5, bz + 0.016], [0, 0.4, 1], 5);
    b.part(new THREE.SphereGeometry(0.007, 6, 4), P.paperWhite, { bone, at: [x, 0.512, bz + 0.03] });
  });
  // LEDs
  [P.ledRed, P.ledGreen, P.ledGreen].forEach((c, i) =>
    glow(b.part(new THREE.SphereGeometry(0.007, 6, 4), c, { bone, at: [0.06 + i * 0.03, 0.51, bz + 0.012] }), 1.5));
  // vent slits ring
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    box(0.003, 0.014, 0.002, P.marker, [0.115 + Math.cos(a) * 0.022, 0.5 + Math.sin(a) * 0.022, bz + 0.0115], [0, 0, (a * 180) / Math.PI - 90]);
  }
  // lettering "BOT"-like blocky bars
  const bars: number[][] = [[-0.06, 0], [-0.05, 0], [-0.02, 0], [0.0, 0.0], [0.03, 0], [0.05, 0]];
  bars.forEach(([x], i) => box(0.006, 0.02, 0.002, P.marker, [x + 0.005, 0.605 - 0.07 + 0.0 * i + 0.07 - 0.0, bz + 0.0125]).position.y += 0);
  box(0.03, 0.005, 0.002, P.marker, [-0.03, 0.634 - 0.0, bz + 0.0125]);
  // big red button
  cyl(0.026, 0.01, P.foilBright, [-0.075, 0.45, bz + 0.011], [0, 0, 1]);
  cyl(0.02, 0.014, P.paintRed, [-0.075, 0.45, bz + 0.014], [0, 0, 1]);
  // rivets
  for (const sx of [1, -1]) for (const sy of [1, -1]) for (const o of [0.012, 0.03])
    cyl(0.005, 0.003, P.foil, [sx * (0.14 - (o > 0.02 ? 0.02 : 0)), 0.68 + sy * (0.12 - (o > 0.02 ? 0.02 : 0)), bz + 0.0095], [0, 0, 1], 6);
  // wire loops
  for (const s of [1, -1]) {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.15, 0.58, bz + 0.01),
      new THREE.Vector3(s * 0.2, 0.62, Z + 0.035),
      new THREE.Vector3(s * 0.25, 0.6, 0.12),
      new THREE.Vector3(s * 0.262, 0.56, 0.06),
    ]);
    b.part(new THREE.TubeGeometry(c, 12, 0.003, 5), P.paintBlue, { bone, at: [0, 0, 0] });
  }
  // warning stripe
  box(0.46, 0.05, 0.003, P.marker, [0, 0.46, Z + 0.011]);
  for (let i = 0; i < 12; i++)
    box(0.02, 0.058, 0.003, P.paintYellow, [-0.22 + i * 0.04, 0.46, Z + 0.0135], [0, 0, 30]);
}
    return buildTorsoBox;
  })(),
  // backpackRig
  (() => {
function buildBackpackRig({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const bone = J.chest;
  const box = (w: number, h: number, d: number, c: string, at: number[], rot: number[] = [0, 0, 0], bn = bone) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: bn, at: at as any, rotation: rot as any });
  const cyl = (rt: number, rb: number, h: number, sides: number, c: string, at: number[], rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, sides), c, { bone, at: at as any, rotation: rot as any });

  // body shell
  const cx = 0, cy = 0.68, cz = -0.235;
  box(0.34, 0.36, 0.09, P.cardboard, [cx, cy, cz]);
  // cut-edge strips
  for (const s of [1, -1]) {
    box(0.006, 0.364, 0.094, P.cardboardEdge, [s * 0.171, cy, cz]);
    box(0.344, 0.006, 0.094, P.cardboardEdge, [0, cy + s * 0.181, cz]);
  }
  // face panel (back) lighter inset
  box(0.3, 0.3, 0.004, P.cardboardLight, [0, cy, -0.282]);
  // lid flap lifted
  box(0.35, 0.008, 0.1, P.cardboardDark, [0, 0.872, -0.238], [-6, 0, 0]);
  box(0.35, 0.004, 0.006, P.cardboardEdge, [0, 0.878, -0.29], [-6, 0, 0]);
  // lid dial and led
  cyl(0.025, 0.025, 0.008, 8, P.foil, [-0.07, 0.882, -0.238]);
  box(0.004, 0.003, 0.02, P.marker, [-0.07, 0.888, -0.238], [0, 30, 0]);
  glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), P.ledGreen, { bone, at: [0.08, 0.882, -0.238] }), 1.5);

  // tape on sides/front
  for (const [x, y, r] of [[-0.1, 0.84, 2], [0.09, 0.84, -2]] as number[][])
    box(0.03, 0.04, 0.1, P.tape, [x, y, cz], [0, 0, r]);
  for (const s of [1, -1]) box(0.0015 + 0.002, 0.2, 0.03, P.tape, [s * 0.172, 0.7, cz], [0, 0, 2 * s]);

  // label sticker
  box(0.14, 0.07, 0.003, P.paperWhite, [0, 0.77, -0.2845], [0, 0, 1.5]);
  for (let i = 0; i < 5; i++)
    box(0.012, 0.03 + R() * 0.012, 0.002, P.marker, [-0.05 + i * 0.025, 0.77, -0.2865], [0, 0, (R() - 0.5) * 12]);
  // vent
  box(0.12, 0.07, 0.003, P.cardboardDark, [0, 0.6, -0.2845]);
  for (let i = 0; i < 6; i++) box(0.1, 0.006, 0.002, P.marker, [0, 0.575 + i * 0.012, -0.2865]);

  // thrusters
  for (const s of [1, -1]) {
    const x = s * 0.1, z = -0.27;
    cyl(0.05, 0.05, 0.22, 8, P.foil, [x, 0.6, z]);
    cyl(0.05, 0.05, 0.03, 8, P.foilDark, [x, 0.56, z]);
    cyl(0.05, 0.05, 0.015, 8, P.foilBright, [x, 0.65, z]);
    cyl(0.02, 0.05, 0.05, 8, P.foil, [x, 0.725, z]);
    cyl(0.022, 0.022, 0.03, 8, P.paintBlue, [x, 0.765, z]);
    // nozzle
    cyl(0.05, 0.035, 0.06, 8, P.foilDark, [x, 0.46, z]);
    cyl(0.03, 0.02, 0.01, 8, P.paintRed, [x, 0.428, z]);
    // crisscross tape on neck
    box(0.07, 0.012, 0.01, P.tape, [x, 0.73, z + 0.0], [0, 0, 35 * s]);
    box(0.07, 0.012, 0.01, P.tape, [x, 0.73, z + 0.002], [0, 0, -35 * s]);
    // flame
    const flame = (w: number, h: number, c: string, zo: number) =>
      b.extrude([[-w, 0], [w, 0], [w * 0.5, -h * 0.6], [0, -h, "sharp"], [-w * 0.5, -h * 0.6]] as any, {
        at: [x, 0.43, z + zo] as any, x: [1, 0, 0], thickness: 0.004, color: c, bone,
      });
    flame(0.04, 0.1, P.paintYellow, 0);
    flame(0.022, 0.06, P.paintRed, 0.003);
  }
  // hose between bottles
  b.sweep(
    [[-0.1, 0.55, -0.32], [-0.05, 0.5, -0.33], [0, 0.56, -0.33], [0.05, 0.5, -0.33], [0.1, 0.55, -0.32]] as any,
    0.012, { color: P.foil, bone, sides: 6 } as any,
  );

  // straps
  for (const s of [1, -1]) {
    const x = s * 0.12;
    box(0.045, 0.012, 0.16, P.tape, [x, 0.89, -0.2], [2 * s, 0, 0]);
    box(0.045, 0.34, 0.006, P.tape, [x, 0.7, -0.286], [0, 0, 1.5 * s]);
    box(0.045, 0.012, 0.1, P.tape, [x, 0.92, -0.15], [0, 0, 0]);
    box(0.03, 0.03, 0.006, P.foilBright, [x, 0.86, -0.29]);
    box(0.016, 0.016, 0.008, P.foilDark, [x, 0.86, -0.291]);
  }
}
    return buildBackpackRig;
  })(),
  // headBox
  (() => {
function buildHeadBox({ b, J, P, M }: Ctx) {
  const head = J.head;
  const R = rng(11);
  const T = 0.008;
  const box = (w: number, h: number, d: number, c: string, at: number[], rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: head, at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, s: number, c: string, at: number[], rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, s), c, { bone: head, at, rotation: rot });

  const y0 = 0.93, y1 = 1.23, yc = 1.08, S = 0.17;
  // shell
  box(0.34, 0.3, T, P.cardboard, [0, yc, -S]);
  box(T, 0.3, 0.34, P.cardboard, [S, yc, 0]);
  box(T, 0.3, 0.34, P.cardboard, [-S, yc, 0]);
  // top flaps
  box(0.34, T, 0.172, P.cardboardLight, [0, y1, 0.086], [-1.5, 0, 0.8]);
  box(0.34, T, 0.172, P.cardboard, [0, y1 + 0.002, -0.086], [2, 0, -0.6]);
  box(0.34, 0.002, 0.004, P.cardboardEdge, [0, y1 + 0.006, 0]);
  // front bars around window (x ±0.10, y 0.975..1.165)
  box(0.34, 0.045, T, P.cardboard, [0, 0.9525, S]);
  box(0.34, 0.065, T, P.cardboard, [0, 1.1975 , S]);
  box(0.07, 0.19, T, P.cardboard, [0.135, 1.07, S]);
  box(0.07, 0.19, T, P.cardboard, [-0.135, 1.07, S]);
  // 3-layer window frame
  const fl = [P.cardboardEdge, P.cardboardDark, P.cardboardLight];
  fl.forEach((c, i) => {
    const o = 0.004 + i * 0.006, z = S + 0.004 + i * 0.002;
    const w = 0.2 + 2 * o, h = 0.19 + 2 * o;
    box(w, 0.006, 0.004, c, [0, 1.07 + h / 2 - 0.003, z]);
    box(w, 0.006, 0.004, c, [0, 1.07 - h / 2 + 0.003, z]);
    box(0.006, h, 0.004, c, [w / 2 - 0.003, 1.07, z]);
    box(0.006, h, 0.004, c, [-w / 2 + 0.003, 1.07, z]);
  });
  // tape corner tabs
  for (const sx of [1, -1]) for (const sy of [1, -1])
    box(0.04, 0.012, 0.0015, P.tape, [sx * 0.112, 1.07 + sy * 0.1, S + 0.02], [0, 0, sx * sy * 45 + R() * 3]);
  // edge strips on box verticals
  for (const sx of [1, -1]) {
    box(0.01, 0.3, 0.004, P.cardboardEdge, [sx * S, yc, S + 0.001]);
    box(0.012, 0.3, 0.0015, P.tape, [sx * (S - 0.002), yc, S + 0.006], [0, 0, sx * 1.5]);
    box(0.012, 0.3, 0.0015, P.tape, [sx * (S - 0.002), yc, -S - 0.006], [0, 0, -sx * 1.5]);
  }
  box(0.34, 0.006, 0.004, P.cardboardEdge, [0, y0 + 0.003, S + 0.001]);
  // corrugation strips on sides
  for (const sx of [1, -1]) for (let i = 0; i < 3; i++)
    box(0.002, 0.008, 0.3, i % 2 ? P.cardboardDark : P.cardboardLight, [sx * (S + 0.005), 0.96 + i * 0.01, 0]);
  // top tape X
  box(0.4, 0.0015, 0.03, P.tape, [0, y1 + 0.012, 0], [0, 38, 0]);
  box(0.4, 0.0015, 0.03, P.tape, [0, y1 + 0.0135, 0], [0, -42, 0]);
  // LED hatch
  cyl(0.045, 0.045, 0.006, 12, P.cardboardDark, [0.07, y1 + 0.018, -0.07]);
  cyl(0.05, 0.05, 0.003, 12, P.cardboardEdge, [0.07, y1 + 0.015, -0.07]);
  glow(b.part(new THREE.SphereGeometry(0.025, 8, 4, 0, 6.3, 0, 1.6), P.ledRed, { bone: head, at: [0.07, y1 + 0.02, -0.07] }), 1.4);
  // antennae
  for (const s of [1, -1]) {
    const x = s * 0.08, a = s * 12;
    const dx = Math.sin((a * Math.PI) / 180) * 0.06;
    b.rod([x, y1, 0], [x + s * 0.025, 1.34, 0], 0.005, s > 0 ? P.paintYellow : P.paintRed, { bone: head, sides: 6 });
    for (let i = 0; i < 3; i++) {
      const t = 0.2 + i * 0.28;
      b.part(new THREE.CylinderGeometry(0.0065, 0.0065, 0.008, 6), P.tape, { bone: head, at: [x + s * 0.025 * t, y1 + 0.11 * t, 0], rotation: [0, 0, -s * 12] });
    }
    b.part(new THREE.CylinderGeometry(0.012, 0.015, 0.012, 8), s > 0 ? P.paintBlue : P.paintRed, { bone: head, at: [x + s * 0.025, 1.343, 0] });
    b.part(new THREE.IcosahedronGeometry(0.025, 0), P.foil, { bone: head, at: [x + s * 0.025, 1.368, 0], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.012, 0), P.foilBright, { bone: head, at: [x + s * 0.025 + 0.012, 1.375, 0.012], flat: true });
    void dx;
  }
  // ear cups
  for (const s of [1, -1]) {
    cyl(0.04, 0.03, 0.06, 8, P.paperWhite, [s * 0.2, 1.07, 0], [0, 0, -s * 90]);
    cyl(0.0415, 0.0395, 0.014, 8, P.paintBlue, [s * 0.198, 1.07, 0], [0, 0, -s * 90]);
    cyl(0.036, 0.036, 0.003, 8, P.foil, [s * 0.231, 1.07, 0], [0, 0, -s * 90]);
    cyl(0.039, 0.039, 0.002, 8, P.marker, [s * 0.2295, 1.07, 0], [0, 0, -s * 90]);
    box(0.002, 0.012, 0.05, P.tape, [s * 0.19, 1.1, 0.0], [0, 0, 20]);
    box(0.03, 0.01, 0.0015, P.tape, [s * 0.172, 1.12, 0.02], [0, 90, 0]);
  }
  // mouth grille
  for (let i = 0; i < 6; i++)
    box(0.012, 0.016 + (i % 2) * 0.006, 0.002, P.marker, [-0.055 + i * 0.022, 0.952 + (i % 2) * -0.003, S + 0.005], [0, 0, R() * 6 - 3]);
  // red emblem above window
  cyl(0.026, 0.026, 0.003, 10, P.paintRed, [0, 1.2, S + 0.005], [90, 0, 0]);
  box(0.03, 0.006, 0.002, P.paperWhite, [0, 1.2, S + 0.008]);
  box(0.006, 0.03, 0.002, P.paperWhite, [0, 1.2, S + 0.008]);
  // cheek tape seams
  for (const s of [1, -1]) box(0.012, 0.09, 0.0015, P.tape, [s * 0.145, 1.07, S + 0.006], [0, 0, s * 8]);
}
    return buildHeadBox;
  })(),
  // kidFace
  (() => {
function buildKidFace({ b, J, P, M }: any) {
  const r = rng(11);
  const C = M.skullCenter as number[];
  const [cx, cy, cz] = C;
  const head = J.head, jaw = J.jaw, neck = J.neck;

  const put = (geo: THREE.BufferGeometry, color: string, at: number[], bone: any, opts: any = {}) =>
    b.part(geo, color, { bone, at, ...opts });
  const sph = (rad: number, w = 8, h = 6) => new THREE.SphereGeometry(rad, w, h);

  // Neck
  put(new THREE.CylinderGeometry(0.036, 0.04, 0.07, 8), P.skin, [0, 0.96, 0], neck);
  put(new THREE.CylinderGeometry(0.037, 0.037, 0.012, 8), P.skinShade, [0, 0.945, 0], neck);

  // Skull
  put(sph(1, 14, 10), P.skin, [cx, cy + 0.005, cz], head, { scale: [0.085, 0.095, 0.095] });
  // Jaw / chin on jaw joint
  put(sph(1, 10, 8), P.skin, [0, cy - 0.065, 0.03], jaw, { scale: [0.068, 0.04, 0.062] });
  put(sph(1, 6, 5), P.skin, [0, cy - 0.095, 0.065], jaw, { scale: [0.03, 0.018, 0.02] });
  // Lip line
  put(new THREE.BoxGeometry(0.044, 0.004, 0.006), P.marker, [0, cy - 0.052, 0.088], jaw, { rotation: [0, 0, 0] });

  // Smile (curved bars) with lips
  const smile = [[-0.022, 0.006], [-0.012, 0.0], [0, -0.002], [0.012, 0.0], [0.022, 0.006]];
  smile.forEach(([x, y], i) => {
    put(new THREE.BoxGeometry(0.013, 0.006, 0.006), P.cheek, [x, cy - 0.045 + y, 0.088], jaw, {
      rotation: [0, 0, (i - 2) * -9],
    });
  });

  // Face features
  for (const s of [1, -1]) {
    const ex = s * 0.034, ey = cy + 0.012, ez = 0.082;
    put(sph(1, 10, 8), P.eyeWhite, [ex, ey, ez], head, { scale: [0.022, 0.028, 0.012] });
    put(new THREE.CylinderGeometry(0.0145, 0.0145, 0.004, 10), P.iris, [ex, ey - 0.002, ez + 0.0105], head, { dir: [0, 0, 1] });
    put(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 8), P.pupil, [ex, ey - 0.002, ez + 0.0125], head, { dir: [0, 0, 1] });
    put(new THREE.CylinderGeometry(0.004, 0.004, 0.003, 6), P.eyeWhite, [ex + s * 0.005, ey + 0.006, ez + 0.0145], head, { dir: [0, 0, 1] });
    // brow
    put(new THREE.BoxGeometry(0.03, 0.006, 0.008), P.hair, [ex, ey + 0.04, 0.083], head, { rotation: [0, 0, s * 8] });
    // cheek blush
    put(new THREE.CylinderGeometry(0.014, 0.014, 0.003, 10), P.cheek, [s * 0.052, cy - 0.025, 0.073], head, { dir: [s * 0.3, 0, 1] });
    // ears
    put(sph(1, 8, 6), P.skin, [s * 0.087, cy, 0], head, { scale: [0.01, 0.022, 0.016] });
    put(sph(1, 6, 5), P.skinShade, [s * 0.096, cy, 0.001], head, { scale: [0.004, 0.014, 0.01] });
    // freckles
    for (let i = 0; i < 3; i++)
      put(sph(0.0028, 5, 4), P.skinShade, [s * (0.04 + r() * 0.02), cy - 0.018 + r() * 0.012, 0.081], head);
  }

  // Nose
  put(sph(0.0125, 8, 6), P.skinShade, [0, cy - 0.012, 0.094], head);

  // Hair cap
  put(sph(1, 12, 8), P.hair, [cx, cy + 0.025, cz - 0.008], head, { scale: [0.09, 0.082, 0.098] });
  // Blades
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const x = Math.sin(a) * 0.08, z = Math.cos(a) * 0.085 - 0.005;
    put(new THREE.ConeGeometry(0.02, 0.05, 4), i % 2 ? P.hair : P.cardboardDark, [x, cy + 0.045, z], head, {
      dir: [Math.sin(a), -0.55, Math.cos(a)],
    });
  }
  // Fringe
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.03;
    put(new THREE.ConeGeometry(0.017, 0.045, 4), P.hair, [x, cy + 0.065, 0.082 - Math.abs(i - 2) * 0.006], head, {
      dir: [(i - 2) * 0.15, -1, 0.35],
    });
  }
  // Cowlick tuft
  put(new THREE.ConeGeometry(0.012, 0.045, 5), P.hair, [0.01, cy + 0.108, 0.01], head, { dir: [0.4, 1, 0.2] });
  put(new THREE.ConeGeometry(0.009, 0.035, 5), P.hair, [-0.008, cy + 0.106, 0.0], head, { dir: [-0.5, 1, 0.1] });
}
    return buildKidFace;
  })(),
  // arms
  (() => {
function buildArms({ b, J, P, M }: any) {
  const R = rng(11);
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = J["shoulder" + side];
    const el = J["elbow" + side];
    const wr = J["wrist" + side];
    const th = J["thumb" + side];
    const fi = J["fingers" + side];
    const shP = V([s * 0.27, 0.84, 0]);
    const elP = V([s * 0.38, 0.67, 0]);
    const wrP = V([s * 0.47, 0.5, 0.03]);

    // Upper arm: towel-roll tube
    const upStart = shP.clone().lerp(elP, 0.0);
    const upEnd = shP.clone().lerp(elP, 0.78);
    b.rod(upStart, upEnd, 0.058, P.cardboard, { bone: sh, section: { ngon: 8 } });
    for (const t of [0, 0.78]) {
      const p = shP.clone().lerp(elP, t);
      b.rod(p.clone().lerp(elP, t === 0 ? 0 : -0.01), p.clone().lerp(elP, t === 0 ? 0.03 : -0.0), 0.06, P.cardboardEdge, { bone: sh, section: { ngon: 8 } });
    }
    // tape spiral bands and yellow stripe
    for (let i = 0; i < 3; i++) {
      const t = 0.14 + i * 0.2;
      const a = shP.clone().lerp(elP, t - 0.03 + (R() - 0.5) * 0.01);
      const c = shP.clone().lerp(elP, t + 0.03);
      b.rod(a, c, 0.0605, P.tape, { bone: sh, section: { ngon: 8 } });
    }
    b.rod(shP.clone().lerp(elP, 0.5), shP.clone().lerp(elP, 0.58), 0.0605, P.paintYellow, { bone: sh, section: { ngon: 8 } });

    // Elbow accordion
    const eA = shP.clone().lerp(elP, 0.78);
    const eB = elP.clone().lerp(wrP, 0.12);
    for (let i = 0; i < 6; i++) {
      const t0 = i / 6, t1 = (i + 0.85) / 6;
      b.rod(eA.clone().lerp(eB, t0), eA.clone().lerp(eB, t1), 0.059, i % 2 ? P.foilDark : P.foil, {
        bone: i < 3 ? sh : el,
        section: { ngon: 7 },
      });
    }
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 6), P.foilBright, { bone: el, at: elP.clone().add(new THREE.Vector3(s * 0.058, 0, 0)), dir: [s, 0, 0] });

    // Forearm
    const fS = elP.clone().lerp(wrP, 0.1);
    const fE = elP.clone().lerp(wrP, 0.93);
    b.rod(fS, fE, 0.05, P.foil, { bone: el, section: { ngon: 8 } });
    const bands: [number, string, number][] = [
      [0.15, P.foilBright, 0.0505],
      [0.35, P.paintRed, 0.0508],
      [0.55, P.foilBright, 0.0505],
      [0.75, P.paintBlue, 0.0508],
    ];
    for (const [t, c, r] of bands) {
      b.rod(fS.clone().lerp(fE, t), fS.clone().lerp(fE, t + 0.08), r, c, { bone: el, section: { ngon: 8 } });
    }
    // wire loop
    b.sweep(
      [fS.clone().lerp(fE, 0.2).add(new THREE.Vector3(0, 0, 0.052)), fS.clone().lerp(fE, 0.4).add(new THREE.Vector3(s * 0.01, 0, 0.066)), fS.clone().lerp(fE, 0.6).add(new THREE.Vector3(0, 0, 0.052))],
      0.004, P.paintBlue, { bone: el },
    );

    // Cuff
    const cuffDir = wrP.clone().sub(elP).normalize();
    const cuffAt = wrP.clone().addScaledVector(cuffDir, -0.005);
    b.part(new THREE.CylinderGeometry(0.064, 0.064, 0.016, 8), P.cardboardEdge, { bone: wr, at: cuffAt, dir: cuffDir.toArray() });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8), P.cardboardLight, { bone: wr, at: cuffAt.clone().addScaledVector(cuffDir, -0.002), dir: cuffDir.toArray() });
    for (const a of [0.5, 2.6, 4.4]) {
      const off = new THREE.Vector3(Math.cos(a) * 0.058, 0, Math.sin(a) * 0.058);
      b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.004, 6), P.foilBright, { bone: wr, at: cuffAt.clone().add(off) });
    }
    // skin wrist
    b.rod(wrP.clone().addScaledVector(cuffDir, 0.0), wrP.clone().addScaledVector(cuffDir, 0.04), 0.022, P.skin, { bone: wr, section: { ngon: 8 } });

    // Palm
    const palmAt = wrP.clone().addScaledVector(cuffDir, 0.05);
    b.part(new THREE.BoxGeometry(0.06, 0.05, 0.05), P.cardboard, { bone: wr, at: palmAt, dir: cuffDir.toArray() });
    b.part(new THREE.BoxGeometry(0.062, 0.012, 0.052), P.foil, { bone: wr, at: palmAt.clone().add(new THREE.Vector3(0, 0.012, 0)) });
    b.part(new THREE.BoxGeometry(0.03, 0.003, 0.004), P.marker, { bone: wr, at: palmAt.clone().add(new THREE.Vector3(-s * 0.03, -0.005, 0.0)), rotation: [0, 0, s * 10] });
    // Claws
    const clawLen = 0.075;
    const mk = (jt: any, zOff: number, name: string, ang: number) => {
      const base = V([s * 0.485, 0.455, zOff]);
      const tip = base.clone().add(new THREE.Vector3(s * 0.012, -clawLen, zOff > 0.03 ? 0.03 : -0.02));
      const mid = base.clone().lerp(tip, 0.5);
      const dir = tip.clone().sub(base).normalize();
      b.part(new THREE.BoxGeometry(0.025, clawLen, 0.03), P.foil, { bone: jt, at: mid, dir: dir.toArray() });
      b.part(new THREE.BoxGeometry(0.027, 0.012, 0.032), P.tape, { bone: jt, at: base.clone().lerp(tip, 0.1), dir: dir.toArray() });
      b.part(new THREE.BoxGeometry(0.027, 0.014, 0.032), P.paintRed, { bone: jt, at: base.clone().lerp(tip, 0.95), dir: dir.toArray() });
    };
    mk(th, 0.05, "thumb", 12);
    mk(fi, 0.01, "fingers", -12);
  }
}
    return buildArms;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);

  for (const s of [1, -1]) {
    const hip = s > 0 ? J.hipL : J.hipR;
    const knee = s > 0 ? J.kneeL : J.kneeR;
    const ankle = s > 0 ? J.ankleL : J.ankleR;
    const toe = s > 0 ? J.toeL : J.toeR;
    const x = s * 0.1;

    // Jeans: thigh and shin
    b.rod([x, 0.5, 0], [x, 0.27, 0.01], [0.045, 0.043], P.jeans, { bone: hip, sides: 8 });
    b.rod([x, 0.27, 0.01], [x, 0.09, 0], [0.04, 0.038], P.jeans, { bone: knee, sides: 8 });
    // knee crease
    for (const dz of [0, 0.012]) {
      b.part(box(0.07, 0.003, 0.004), P.marker, { bone: knee, at: [x, 0.272 - dz, 0.05], rotation: [0, 0, s * (2 + R() * 2)] });
    }
    // seam stitching on outer side
    for (let i = 0; i < 6; i++) {
      b.part(box(0.003, 0.014, 0.002), P.marker, { bone: hip, at: [x + s * 0.0455, 0.47 - i * 0.032, 0.0], rotation: [0, 0, 0] });
    }
    // pocket patch
    b.part(box(0.004, 0.05, 0.04), "#4a6bab", { bone: hip, at: [x + s * 0.045, 0.44, 0.01] });
    for (let i = 0; i < 3; i++)
      b.part(box(0.002, 0.003, 0.012), P.marker, { bone: hip, at: [x + s * 0.048, 0.46 - i * 0.015, 0.01] });

    // rolled hem cuff
    b.part(cyl(0.046, 0.046, 0.025, 8), "#4a6bab", { bone: ankle, at: [x, 0.115, 0] });
    b.part(cyl(0.048, 0.048, 0.004, 8), P.cardboardEdge === undefined ? P.marker : "#2f4a80", { bone: ankle, at: [x, 0.127, 0] });
    // sock
    b.part(cyl(0.032, 0.034, 0.03, 8), P.paperWhite, { bone: ankle, at: [x, 0.085, 0] });

    // Shin guard (foil-wrapped cardboard box)
    const gz = 0.048;
    b.part(box(0.08, 0.14, 0.07), P.foil, { bone: knee, at: [x, 0.175, gz - 0.01] });
    for (let i = 0; i < 4; i++) {
      b.part(box(0.082, 0.01, 0.072), i % 2 ? P.foilDark : P.foilBright, { bone: knee, at: [x, 0.115 + i * 0.04, gz - 0.01 + 0.0005] });
    }
    // edge strips
    for (const sx of [-1, 1])
      b.part(box(0.004, 0.142, 0.072), P.cardboardEdge, { bone: knee, at: [x + sx * 0.041, 0.175, gz - 0.01] });
    // tape straps
    for (const y of [0.13, 0.225]) {
      b.part(box(0.086, 0.028, 0.0015), P.tape, { bone: knee, at: [x, y, gz + 0.027], rotation: [0, 0, (R() - 0.5) * 4] });
      b.part(box(0.0015, 0.028, 0.076), P.tape, { bone: knee, at: [x + 0.041, y, gz - 0.01] });
      b.part(box(0.0015, 0.028, 0.076), P.tape, { bone: knee, at: [x - 0.041, y, gz - 0.01] });
    }
    // yellow stripe
    b.part(box(0.07, 0.012, 0.002), P.paintYellow, { bone: knee, at: [x, 0.178, gz + 0.026], rotation: [0, 0, s * 3] });
    // rivets
    for (const sx of [-1, 1])
      b.part(cyl(0.007, 0.007, 0.003, 8), P.foilBright, { bone: knee, at: [x + sx * 0.03, 0.2, gz + 0.027], rotation: [90, 0, 0] });

    // Knee-cap box
    b.part(box(0.075, 0.055, 0.03), P.cardboard, { bone: knee, at: [x, 0.285, 0.05], rotation: [0, 0, s * 2] });
    b.part(box(0.077, 0.005, 0.032), P.cardboardEdge, { bone: knee, at: [x, 0.313, 0.05] });
    b.part(box(0.077, 0.005, 0.032), P.cardboardEdge, { bone: knee, at: [x, 0.257, 0.05] });
    b.part(box(0.077, 0.004, 0.0015), P.cardboardDark, { bone: knee, at: [x, 0.285, 0.0662] });

    // Foot box (z -0.09..0.12, y 0..0.1, half width 0.065)
    b.part(box(0.13, 0.092, 0.21), P.cardboard, { bone: ankle, at: [x, 0.052, 0.015] });
    // sole base strip
    b.part(box(0.134, 0.008, 0.214), P.cardboardEdge, { bone: ankle, at: [x, 0.004, 0.015] });
    // corrugation lip at the top
    b.part(box(0.134, 0.006, 0.214), P.cardboardLight, { bone: ankle, at: [x, 0.099, 0.015] });
    b.part(box(0.134, 0.003, 0.214), P.cardboardEdge, { bone: ankle, at: [x, 0.103, 0.015] });
    // ankle tape band
    b.part(box(0.138, 0.03, 0.0015), P.tape, { bone: ankle, at: [x, 0.07, -0.0915], rotation: [0, 0, 1.5] });
    b.part(box(0.0015, 0.03, 0.216), P.tape, { bone: ankle, at: [x + s * 0.066, 0.07, 0.015] });
    b.part(box(0.138, 0.03, 0.0015), P.tape, { bone: ankle, at: [x, 0.07, 0.1215], rotation: [0, 0, -1.5] });
    // blue stripe on side
    b.part(box(0.0015, 0.014, 0.15), P.paintBlue, { bone: ankle, at: [x + s * 0.066, 0.04, 0.02] });
    // marker scribble
    for (let i = 0; i < 4; i++)
      b.part(box(0.0015, 0.004, 0.02), P.marker, { bone: ankle, at: [x - s * 0.066, 0.055 + (i % 2) * 0.01, -0.05 + i * 0.012], rotation: [0, 0, (i % 2 ? 25 : -25)] });
    // foil bolts
    for (const z of [-0.05, 0.07])
      b.part(cyl(0.008, 0.008, 0.003, 8), P.foilBright, { bone: ankle, at: [x + s * 0.066, 0.075, z], rotation: [0, 0, 90] });

    // Sneaker toe-cap poking out
    b.part(box(0.1, 0.07, 0.065), P.paintRed, { bone: toe, at: [x, 0.037, 0.153] });
    b.part(box(0.1, 0.045, 0.02), P.paintRed, { bone: toe, at: [x, 0.062, 0.115] });
    b.part(new THREE.SphereGeometry(0.05, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), P.paintRed, { bone: toe, at: [x, 0.07, 0.15], scale: [1, 0.35, 0.6] });
    // white bumper
    b.part(box(0.104, 0.02, 0.012), P.paperWhite, { bone: toe, at: [x, 0.012, 0.183] });
    b.part(box(0.104, 0.035, 0.004), P.paperWhite, { bone: toe, at: [x, 0.04, 0.186] });
    // laces
    for (let i = 0; i < 3; i++)
      b.part(box(0.06, 0.004, 0.004), P.paperWhite, { bone: toe, at: [x, 0.083, 0.135 + i * 0.016], rotation: [0, (i - 1) * 8, 0] });
    // sole under toe cap
    b.part(box(0.104, 0.008, 0.07), P.paperWhite, { bone: toe, at: [x, 0.004, 0.15] });
  }
}
    return buildLegs;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "cardboardBoxRobotKid" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.5,0], dir: [0,1,0], role: "spine" });
  J["spine"] = b.joint("spine", { parent: J["hips"], at: [0,0.6,0], dir: [0,1,0], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["spine"], at: [0,0.78,0], dir: [0,1,0], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["chest"], at: [0,0.93,0], dir: [0,1,0], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,0.98,0], dir: [0,1,0], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1,0], dir: [0,-0.2,1], role: "jaw" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["chest"], at: [0.27,0.84,0], dir: [0.54,-0.84,0], role: "arm", group: "arms" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [0.38,0.67,0], dir: [0.46,-0.87,0.15], role: "arm", group: "arms" });
  J["wristL"] = b.joint("wristL", { parent: J["elbowL"], at: [0.47,0.5,0.03], dir: [0.3,-0.95,0.1], role: "arm", group: "arms" });
  J["thumbL"] = b.joint("thumbL", { parent: J["wristL"], at: [0.485,0.455,0.05], dir: [0.3,-0.9,0.3], role: "digit", group: "arms" });
  J["fingersL"] = b.joint("fingersL", { parent: J["wristL"], at: [0.485,0.455,0.01], dir: [0.3,-0.95,-0.05], role: "digit", group: "arms" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["chest"], at: [-0.27,0.84,0], dir: [-0.54,-0.84,0], role: "arm", group: "arms" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-0.38,0.67,0], dir: [-0.46,-0.87,0.15], role: "arm", group: "arms" });
  J["wristR"] = b.joint("wristR", { parent: J["elbowR"], at: [-0.47,0.5,0.03], dir: [-0.3,-0.95,0.1], role: "arm", group: "arms" });
  J["thumbR"] = b.joint("thumbR", { parent: J["wristR"], at: [-0.485,0.455,0.05], dir: [-0.3,-0.9,0.3], role: "digit", group: "arms" });
  J["fingersR"] = b.joint("fingersR", { parent: J["wristR"], at: [-0.485,0.455,0.01], dir: [-0.3,-0.95,-0.05], role: "digit", group: "arms" });
  J["hipL"] = b.joint("hipL", { parent: J["hips"], at: [0.1,0.5,0], dir: [0,-1,0.04], role: "leg", group: "legs" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.1,0.27,0.01], dir: [0,-1,-0.04], role: "leg", group: "legs" });
  J["ankleL"] = b.joint("ankleL", { parent: J["kneeL"], at: [0.1,0.07,0], dir: [0,-1,0], role: "leg", group: "legs" });
  J["toeL"] = b.joint("toeL", { parent: J["ankleL"], at: [0.1,0.03,0.1], dir: [0,0,1], role: "digit", group: "legs" });
  J["hipR"] = b.joint("hipR", { parent: J["hips"], at: [-0.1,0.5,0], dir: [0,-1,0.04], role: "leg", group: "legs" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.1,0.27,0.01], dir: [0,-1,-0.04], role: "leg", group: "legs" });
  J["ankleR"] = b.joint("ankleR", { parent: J["kneeR"], at: [-0.1,0.07,0], dir: [0,-1,0], role: "leg", group: "legs" });
  J["toeR"] = b.joint("toeR", { parent: J["ankleR"], at: [-0.1,0.03,0.1], dir: [0,0,1], role: "digit", group: "legs" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
