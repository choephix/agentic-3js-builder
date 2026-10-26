```ts
import * as THREE from "three";
import { createBuilder, polyline, grain, mottle, svg } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Cardboard Robot Kid",
  description: "A small kid in a handmade cardboard-box robot costume: foil arms, taped box torso, dial panel, antenna.",
};

const SKIN = "#f0b98d";
const HAIR = "#4a2c1a";
const PANTS = "#3b5a9a";
const SHOE = "#d83a34";
const SOLE = "#f4f1e8";
const TAPE = "#d9c27a";
const DARK = "#2a1d14";
const MITT = "#f2c21b";

const CARD = grain("#c9965b", "#b4813f", { size: 0.012, axis: "x" });
const CARD_B = mottle("#b98650", "#a8743a", { size: 0.05, seed: 4 });
const CARD_DARK = grain("#9a6a36", "#855a2c", { size: 0.01, axis: "y" });
const FOIL = metal("steel", { polish: 0.7, tarnish: 0.05 });

const PANEL = svg(
  `<svg viewBox="0 0 100 120">
  <rect x="3" y="3" width="94" height="114" rx="6" fill="#e9e2cf" stroke="#2a1d14" stroke-width="3"/>
  <rect x="10" y="10" width="80" height="26" rx="3" fill="#1b2a2a" stroke="#2a1d14" stroke-width="2"/>
  <path d="M14 26 L26 16 L38 30 L50 14 L62 28 L74 18 L86 26" stroke="#56f0a0" stroke-width="3" fill="none" stroke-linejoin="round"/>
  <circle cx="26" cy="58" r="14" fill="#fff" stroke="#2a1d14" stroke-width="3"/>
  <path d="M26 58 L35 49" stroke="#d83a34" stroke-width="3" stroke-linecap="round"/>
  <circle cx="74" cy="58" r="14" fill="#fff" stroke="#2a1d14" stroke-width="3"/>
  <path d="M74 58 L66 66" stroke="#2a1d14" stroke-width="3" stroke-linecap="round"/>
  <g stroke="#2a1d14" stroke-width="2">
   <circle cx="20" cy="88" r="7" fill="#d83a34"/><circle cx="40" cy="88" r="7" fill="#3a8fd8"/>
   <circle cx="60" cy="88" r="7" fill="#f2c21b"/><circle cx="80" cy="88" r="7" fill="#4cc46a"/>
  </g>
  <g stroke="#2a1d14" stroke-width="2.5" stroke-linecap="round"><path d="M14 105 H86 M14 111 H70"/></g>
  <text x="50" y="52" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="9" fill="#2a1d14">BEEP</text>
  </svg>`,
  { size: 256 },
);

const FACE = svg(
  `<svg viewBox="0 0 150 130">
  <circle cx="44" cy="42" r="15" fill="#fff" stroke="#2a1d14" stroke-width="3"/>
  <circle cx="106" cy="42" r="15" fill="#fff" stroke="#2a1d14" stroke-width="3"/>
  <circle cx="47" cy="44" r="8" fill="#4a2c1a"/><circle cx="103" cy="44" r="8" fill="#4a2c1a"/>
  <circle cx="49" cy="41" r="3" fill="#fff"/><circle cx="105" cy="41" r="3" fill="#fff"/>
  <path d="M28 20 Q44 10 60 18 M90 18 Q106 10 122 20" stroke="#4a2c1a" stroke-width="5" fill="none" stroke-linecap="round"/>
  <ellipse cx="22" cy="75" rx="12" ry="8" fill="#ff8a8a" opacity="0.7"/>
  <ellipse cx="128" cy="75" rx="12" ry="8" fill="#ff8a8a" opacity="0.7"/>
  <path d="M72 58 Q75 70 80 66" stroke="#b5714f" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M46 92 Q75 124 104 92 Z" fill="#7a1f26" stroke="#2a1d14" stroke-width="3" stroke-linejoin="round"/>
  <path d="M54 94 H96 V100 H54 Z" fill="#fff"/>
  </svg>`,
  { size: 256 },
);

const SCRIBBLE = svg(
  `<svg viewBox="0 0 100 40"><rect width="100" height="40" fill="#e9e2cf" stroke="#2a1d14" stroke-width="3"/>
  <text x="50" y="27" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="20" fill="#d83a34">ROBO-5</text></svg>`,
  { size: 192 },
);

const VENT = svg(
  `<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#e9e2cf" stroke="#2a1d14" stroke-width="3"/>
  <g stroke="#2a1d14" stroke-width="4" stroke-linecap="round"><path d="M10 10 H50 M10 20 H50 M10 30 H50"/></g></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "cardboard_robot_kid" });

  const hips = b.joint("hips", { at: [0, 0.5, 0], role: "spine" });
  const spine = b.chain("spine", polyline([[0, 0.5, 0], [0, 0.65, 0], [0, 0.82, 0]]), {
    parent: hips, names: ["spine1", "spine2"], role: "spine",
  });
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.88, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.93, 0], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.95, 0.02], aim: [0, 0.95, 0.12], role: "jaw" });

  const box = (w: number, h: number, d: number, at: number[], color: any, bone: any, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...opts });
  const disc = (at: number[], r: number, h: number, color: any, bone: any, dir: number[] = [0, 0, 1], seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at, dir });
  const ball = (at: number[], r: number, color: any, bone: any, sc: number[] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 10, 7), color, { bone, at, scale: sc });
  const tape = (at: number[], w: number, h: number, d: number, bone: any, rot: number[] = [0, 0, 0]) =>
    box(w, h, d, at, TAPE, bone, { rotation: rot });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.07;
    const leg = b.chain(`leg${S}`, polyline([[x, 0.5, 0], [x, 0.27, 0.01], [x, 0.07, 0]]), {
      parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg",
    });
    b.sweep(leg, 0.05, {
      bands: [[0.45, PANTS], [1, FOIL]], sides: 8,
    } as any);
    // foil wrinkles / tape bands at knee and ankle
    tape([x, 0.255, 0.012], 0.115, 0.022, 0.115, leg.joints[1]);
    tape([x, 0.095, 0], 0.115, 0.02, 0.115, leg.joints[2]);
    const foot = leg.tip ?? leg.joints[leg.joints.length - 1];
    box(0.1, 0.05, 0.2, [x, 0.045, 0.04], SHOE, foot);
    box(0.108, 0.02, 0.208, [x, 0.01, 0.04], SOLE, foot);
    ball([x, 0.06, 0.15], 0.045, SHOE, foot, [1.05, 0.7, 0.9]);
    box(0.06, 0.012, 0.03, [x, 0.073, 0.1], "#f4f1e8", foot);
  }

  // ---------- torso box ----------
  const T = chest;
  box(0.36, 0.4, 0.26, [0, 0.69, 0], CARD, T);
  // darker inner shading panel on back
  box(0.34, 0.38, 0.01, [0, 0.69, -0.135], CARD_DARK, T);
  // top flaps
  for (const s of [1, -1]) {
    box(0.17, 0.008, 0.26, [s * 0.09, 0.9, 0], CARD_B, T, { rotation: [0, 0, -s * 14] });
    box(0.36, 0.008, 0.09, [0, 0.9, 0], CARD_B, T, { rotation: [0, 0, 0] });
  }
  // tape across edges
  tape([0, 0.885, 0.13], 0.37, 0.02, 0.006, T);
  tape([0, 0.885, -0.13], 0.37, 0.02, 0.006, T);
  for (const s of [1, -1]) {
    tape([s * 0.181, 0.69, 0], 0.006, 0.41, 0.06, T);
    tape([s * 0.165, 0.5, 0.131], 0.04, 0.03, 0.006, T, [0, 0, s * 25]);
  }
  tape([0, 0.495, 0.13], 0.37, 0.02, 0.006, T);
  // arm holes (dark discs on sides)
  for (const s of [1, -1]) disc([s * 0.183, 0.8, 0], 0.045, 0.008, DARK, T, [s, 0, 0]);

  // chest panel
  b.part(new THREE.PlaneGeometry(0.2, 0.24), "#ffffff", { bone: T, at: [0, 0.7, 0.1325], dir: [0, 0, 1], axis: "z", texture: PANEL });
  // name tag
  b.part(new THREE.PlaneGeometry(0.1, 0.04), "#ffffff", { bone: T, at: [0.09, 0.58, 0.1325], dir: [0, 0, 1], axis: "z", texture: SCRIBBLE, rotation: [0, 0, 6] });
  b.part(new THREE.PlaneGeometry(0.07, 0.047), "#ffffff", { bone: T, at: [-0.11, 0.56, 0.1325], dir: [0, 0, 1], axis: "z", texture: VENT });
  // 3D dials and buttons on panel
  for (const [dx, col] of [[-0.075, "#d83a34"], [-0.025, "#3a8fd8"], [0.025, "#f2c21b"], [0.075, "#4cc46a"]] as [number, string][]) {
    glow(disc([dx, 0.63, 0.14], 0.013, 0.012, col, T), 0.9);
  }
  disc([-0.055, 0.735, 0.14], 0.02, 0.015, FOIL, T);
  disc([0.055, 0.735, 0.14], 0.02, 0.015, FOIL, T);
  box(0.004, 0.03, 0.006, [-0.055, 0.742, 0.149], "#d83a34", T, { rotation: [0, 0, 40] });
  box(0.004, 0.03, 0.006, [0.055, 0.735, 0.149], DARK, T, { rotation: [0, 0, -30] });
  // big red button
  disc([0, 0.835, 0.14], 0.03, 0.02, "#a31f1f", T);
  glow(disc([0, 0.835, 0.152], 0.024, 0.01, "#ff4a3a", T), 1.2);
  // bottle-cap belt
  for (let i = -5; i <= 5; i++) {
    disc([i * 0.03, 0.525, 0.136], 0.013, 0.006, i % 2 ? FOIL : "#c23a3a", T, [0, 0, 1], 8);
  }
  // bolts (screws) on corners
  for (const sx of [1, -1]) for (const sy of [0.87, 0.51]) disc([sx * 0.16, sy, 0.134], 0.01, 0.008, FOIL, T, [0, 0, 1], 6);

  // backpack: box with paper-towel tubes
  box(0.24, 0.26, 0.1, [0, 0.7, -0.19], CARD_B, T);
  tape([0, 0.83, -0.19], 0.25, 0.018, 0.105, T);
  for (const s of [1, -1]) {
    disc([s * 0.07, 0.7, -0.27], 0.035, 0.18, "#c9a46a", T, [0, 1, 0], 10);
    disc([s * 0.07, 0.61, -0.27], 0.036, 0.018, TAPE, T, [0, 1, 0], 10);
    disc([s * 0.07, 0.79, -0.27], 0.03, 0.01, DARK, T, [0, 1, 0], 10);
  }
  // straps
  for (const s of [1, -1]) box(0.03, 0.4, 0.012, [s * 0.1, 0.69, 0.133], "#2e4a7a", T);

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(`arm${S}`, polyline([[s * 0.2, 0.8, 0], [s * 0.26, 0.64, 0.02], [s * 0.28, 0.49, 0.09]]), {
      parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm",
    });
    b.sweep(arm, 0.04, { color: FOIL, sides: 8 } as any);
    tape([s * 0.263, 0.64, 0.02], 0.1, 0.02, 0.1, arm.joints[1]);
    const hand = arm.tip ?? arm.joints[arm.joints.length - 1];
    disc([s * 0.283, 0.5, 0.09], 0.047, 0.03, TAPE, hand, [0, 1, 0.1], 10);
    ball([s * 0.287, 0.455, 0.1], 0.052, MITT, hand, [1, 1.05, 0.9]);
    ball([s * 0.32, 0.46, 0.12], 0.02, MITT, hand);
    ball([s * 0.287, 0.405, 0.105], 0.016, MITT, hand);
  }

  // ---------- kid neck + head ----------
  disc([0, 0.9, 0], 0.04, 0.08, SKIN, neck, [0, 1, 0], 8);
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), SKIN, { bone: head, at: [0, 1.0, 0], scale: [0.098, 0.106, 0.102] });
  b.decal(skull, FACE, { at: [0, 0.985, 0.1], dir: [0, 0, 1], size: [0.15, 0.13] });
  ball([0, 0.925, 0.03], 0.07, SKIN, jaw, [1, 0.5, 1]);
  for (const s of [1, -1]) {
    ball([s * 0.1, 1.0, 0], 0.02, SKIN, head, [0.6, 1.1, 0.9]);
  }
  // hair
  b.part(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.46), HAIR, {
    bone: head, at: [0, 1.03, -0.008], scale: [0.108, 0.098, 0.112],
  });
  for (const [hx, hz, hr] of [[-0.06, 0.1, 20], [-0.02, 0.105, 8], [0.03, 0.105, -8], [0.07, 0.095, -22]] as number[][]) {
    b.part(new THREE.ConeGeometry(0.022, 0.05, 5), HAIR, { bone: head, at: [hx, 1.105, hz - 0.03], rotation: [60, 0, hr] });
  }
  box(0.19, 0.06, 0.05, [0, 1.0, -0.085], HAIR, head);

  // ---------- box head ----------
  const H = head, HC = 1.0, HS = 0.17;
  box(0.34, 0.012, 0.32, [0, HC + HS, 0], CARD, H);
  box(0.34, 0.012, 0.32, [0, HC - HS, 0], CARD_DARK, H);
  box(0.012, 0.34, 0.32, [HS, HC, 0], CARD_B, H);
  box(0.012, 0.34, 0.32, [-HS, HC, 0], CARD_B, H);
  box(0.34, 0.34, 0.012, [0, HC, -0.16], CARD_DARK, H);
  // front frame around face window
  const fz = 0.16;
  box(0.34, 0.07, 0.012, [0, HC + 0.135, fz], CARD, H);
  box(0.34, 0.06, 0.012, [0, HC - 0.14, fz], CARD, H);
  for (const s of [1, -1]) box(0.065, 0.21, 0.012, [s * 0.1375, HC - 0.005, fz], CARD, H);
  // window trim
  tape([0, HC + 0.098, fz + 0.008], 0.215, 0.012, 0.004, H);
  tape([0, HC - 0.108, fz + 0.008], 0.215, 0.012, 0.004, H);
  for (const s of [1, -1]) tape([s * 0.1, HC - 0.005, fz + 0.008], 0.012, 0.21, 0.004, H);
  // edge tape on head
  for (const s of [1, -1]) {
    tape([s * HS, HC + HS, 0], 0.016, 0.016, 0.33, H);
    tape([s * HS, HC, fz], 0.016, 0.34, 0.016, H);
  }
  tape([0, HC + HS, fz], 0.34, 0.016, 0.016, H);
  // top forehead label & vent
  b.part(new THREE.PlaneGeometry(0.1, 0.04), "#ffffff", { bone: H, at: [0, HC + 0.135, fz + 0.0075], dir: [0, 0, 1], axis: "z", texture: SCRIBBLE });
  // ear speakers (cardboard tubes)
  for (const s of [1, -1]) {
    disc([s * 0.215, HC, 0], 0.05, 0.09, "#c9a46a", H, [s, 0, 0], 10);
    disc([s * 0.263, HC, 0], 0.052, 0.014, FOIL, H, [s, 0, 0], 10);
    disc([s * 0.272, HC, 0], 0.035, 0.006, DARK, H, [s, 0, 0], 10);
    disc([s * 0.178, HC, 0], 0.022, 0.012, TAPE, H, [s, 0, 0], 8);
    // side flaps (hinged cardboard)
    box(0.012, 0.1, 0.1, [s * 0.178, HC + 0.215 - 0.0, -0.06], CARD_B, H, { rotation: [0, 0, 0] });
  }
  // antennas
  disc([0.07, HC + 0.2, 0.0], 0.006, 0.07, FOIL, H, [0, 1, 0], 6);
  glow(ball([0.07, HC + 0.25, 0.0], 0.022, "#ff3b3b", H), 1.4);
  disc([-0.07, HC + 0.2, 0.0], 0.006, 0.07, FOIL, H, [0, 1, 0], 6);
  const pipe = b.rod([-0.07, HC + 0.17, 0], [-0.1, HC + 0.28, 0.02], 0.005, FOIL, { bone: H });
  void pipe;
  glow(ball([-0.1, HC + 0.29, 0.02], 0.02, "#4cd8ff", H), 1.4);
  // coil spring neck of foil on top: spring stub
  disc([0, HC + 0.18, -0.06], 0.025, 0.03, TAPE, H, [0, 1, 0], 8);
  // cheek bolts / cereal-box accents
  for (const s of [1, -1]) {
    disc([s * 0.125, HC - 0.145, fz + 0.007], 0.011, 0.006, FOIL, H, [0, 0, 1], 6);
    disc([s * 0.125, HC + 0.14, fz + 0.01], 0.011, 0.006, FOIL, H, [0, 0, 1], 6);
  }
  // glowing mouth-grill lights on chin strip
  for (let i = -2; i <= 2; i++)
    glow(box(0.016, 0.014, 0.004, [i * 0.03, HC - 0.14, fz + 0.008], i % 2 ? "#4cc46a" : "#f2c21b", H), 1.1);

  return b.root;
}
```