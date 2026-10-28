import * as THREE from "three";
import { createBuilder, polyline, catmull, lerp, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cardboard Robot Kid",
  description:
    "A kid in a homemade cardboard-box robot costume: box helmet with a face hole, taped box torso with bottle-cap buttons, a marker-drawn screen, foil tubes on the arms, and yellow rubber gloves.",
};

// Palette
const CARD = "#c9985c";
const CARD_D = "#a67840";
const CARD_L = "#dfb77f";
const TAPE = "#e8d6a0";
const FOIL = "#c9d0d6";
const FOIL_D = "#97a2ad";
const FOIL_H = "#eef2f5";
const RED = "#d83a34";
const BLUE = "#2f6fd0";
const YEL = "#f2c230";
const ORANGE = "#f08a2a";
const GREEN = "#4cc46a";
const INK = "#26262e";
const WHITE = "#f6f4ee";
const GOLD = "#d9a93a";
const SKIN = "#f0be96";
const SKIN_D = "#d99a78";
const HAIR = "#4a2e1c";
const HAIR_L = "#6a4529";
const SHIRT = "#2f8f9d";
const SHIRT_D = "#256f7a";
const JEANS = "#3a5aa0";
const JEANS_L = "#5a7cc4";
const SOLE = "#d83a34";
const GLOVE = "#f2c230";
const GLOVE_D = "#d9a51c";
const MOUTH = "#9a3b3b";
const BLUSH = "#f08a80";
const HOLE = "#3a2a1e";

type V = number[];

export default function build() {
  const b = createBuilder({ name: "cardboard_robot_kid" });

  // ---------- Skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.6, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.joint("spine", { parent: hips, at: [0, 0.68, 0], dir: [0, 1, 0], role: "spine" });
  const chest = b.joint("chest", { parent: spine, at: [0, 0.84, 0], dir: [0, 1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.98, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.05, 0], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.09, 0.03], aim: [0, 1.09, 0.13], role: "jaw" });

  // ---------- Helpers ----------
  const bx = (w: number, h: number, d: number, c: string, bone: any, at: V, rot?: V) => {
    const o: any = { bone, at };
    if (rot) o.rotation = rot;
    return b.part(new THREE.BoxGeometry(w, h, d), c, o);
  };
  const cy = (rt: number, rb: number, h: number, c: string, bone: any, at: V, dir?: V, seg = 10) => {
    const o: any = { bone, at };
    if (dir) o.dir = dir;
    return b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, o);
  };
  const ball = (r: number, c: string, bone: any, at: V, scale?: V, seg = 10) => {
    const o: any = { bone, at };
    if (scale) o.scale = scale;
    return b.part(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), c, o);
  };
  const plane = (w: number, h: number, tex: THREE.Texture, bone: any, at: V, dir: V) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });
  const foilTube = (a: V, c: V, r: number, bone: any) => {
    b.rod(a, c, r, FOIL, { bone, sides: 10 });
    b.rod(lerp(a, c, 0), lerp(a, c, 0.07), r + 0.004, FOIL_D, { bone, sides: 10 });
    b.rod(lerp(a, c, 0.93), lerp(a, c, 1), r + 0.004, FOIL_D, { bone, sides: 10 });
    b.rod(lerp(a, c, 0.44), lerp(a, c, 0.56), r + 0.003, TAPE, { bone, sides: 10 });
    b.rod(lerp(a, c, 0.2), lerp(a, c, 0.24), r + 0.002, FOIL_H, { bone, sides: 10 });
    b.rod(lerp(a, c, 0.7), lerp(a, c, 0.73), r + 0.002, FOIL_H, { bone, sides: 10 });
  };
  const brad = (at: V, dir: V, bone: any) => cy(0.008, 0.008, 0.006, GOLD, bone, at, dir, 8);

  // ---------- Textures (marker drawings) ----------
  const SCREEN = svg(
    `<svg viewBox="0 0 90 50" xmlns="http://www.w3.org/2000/svg">
      <rect width="90" height="50" rx="4" fill="#0a2e1e"/>
      <polyline points="6,34 16,34 20,20 26,40 32,26 38,30 44,30 50,12 56,38 62,28 70,28 76,22 84,22" fill="none" stroke="#6dff9a" stroke-width="2.6" stroke-linejoin="round"/>
      <text x="8" y="14" font-family="monospace" font-weight="bold" font-size="10" fill="#6dff9a">HELLO HUMAN</text>
      <rect x="6" y="42" width="30" height="4" fill="#6dff9a"/>
      <rect x="40" y="42" width="12" height="4" fill="#3a9a62"/>
    </svg>`,
    { size: 256 },
  );
  const FRAGILE = svg(
    `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="50" rx="4" fill="#f6f4ee" stroke="#d83a34" stroke-width="3"/>
      <rect x="4" y="4" width="92" height="14" fill="#d83a34"/>
      <text x="50" y="15" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#ffffff">FRAGILE</text>
      <text x="50" y="38" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="#26262e">ROBOT!</text>
      <path d="M12 28 l6 -8 l6 8 z" fill="#26262e"/>
    </svg>`,
    { size: 256 },
  );
  const BACKLABEL = svg(
    `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#26262e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 50 V16 M12 26 L22 14 L32 26"/>
        <path d="M60 50 V16 M50 26 L60 14 L70 26"/>
      </g>
      <text x="84" y="30" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="9" fill="#26262e">THIS</text>
      <text x="84" y="40" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="9" fill="#26262e">SIDE</text>
      <text x="84" y="50" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="9" fill="#26262e">UP</text>
    </svg>`,
    { size: 256 },
  );
  const NAME = svg(
    `<svg viewBox="0 0 100 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="24" rx="3" fill="#e8d6a0"/>
      <text x="50" y="18" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="16" fill="#d83a34">BOT-9</text>
    </svg>`,
    { size: 256 },
  );

  // ================= HEAD =================
  // Skin head (upper dome), jaw, face details
  b.part(new THREE.SphereGeometry(0.1, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), SKIN, {
    bone: head,
    at: [0, 1.13, 0.03],
    scale: [1, 1.05, 1],
  });
  ball(0.082, SKIN, jaw, [0, 1.075, 0.035], [1, 0.58, 0.95], 12);
  ball(0.012, SKIN_D, head, [0, 1.118, 0.131], [1, 0.9, 0.9], 6); // nose
  // eyes
  for (const s of [1, -1]) {
    ball(0.019, WHITE, head, [s * 0.04, 1.15, 0.117], [1, 1.2, 0.5], 8);
    ball(0.0115, INK, head, [s * 0.04, 1.15, 0.126], [1, 1.15, 0.4], 6);
    ball(0.004, WHITE, head, [s * 0.043, 1.157, 0.131], [1, 1, 0.5], 4);
    bx(0.036, 0.007, 0.006, HAIR, head, [s * 0.04, 1.18, 0.113], [0, 0, -s * 8]); // brows
    cy(0.017, 0.017, 0.004, BLUSH, head, [s * 0.066, 1.103, 0.1], [s * 0.4, 0.1, 1], 8); // cheeks
    ball(0.018, SKIN, head, [s * 0.1, 1.12, 0.01], [0.5, 1, 0.7], 6); // ears
  }
  // smile (on jaw)
  for (let i = 0; i < 7; i++) {
    const k = i - 3;
    bx(0.012, 0.008, 0.006, MOUTH, jaw, [k * 0.0105, 1.081 + k * k * 0.0013, 0.119 - Math.abs(k) * 0.002]);
  }
  bx(0.034, 0.006, 0.005, WHITE, jaw, [0, 1.085, 0.12]);

  // hair
  b.part(new THREE.SphereGeometry(0.106, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), HAIR, {
    bone: head,
    at: [0, 1.15, -0.005],
    rotation: [-18, 0, 0],
    scale: [1, 1.0, 1.02],
  });
  ball(0.09, HAIR, head, [0, 1.15, -0.04], [1.05, 1, 0.85], 8);
  const bangs: [number, number, number, number][] = [
    [-0.06, 1.205, 0.112, 14],
    [-0.025, 1.212, 0.118, 4],
    [0.015, 1.213, 0.118, -6],
    [0.055, 1.205, 0.112, -16],
  ];
  for (const [x, y, z, r] of bangs) {
    bx(0.04, 0.03, 0.012, HAIR, head, [x, y, z], [-10, 0, r]);
    bx(0.014, 0.022, 0.008, HAIR_L, head, [x + 0.008, y + 0.004, z + 0.007], [-10, 0, r]);
  }
  bx(0.02, 0.05, 0.02, HAIR, head, [-0.1, 1.15, 0.02], [0, 0, 10]);
  bx(0.02, 0.05, 0.02, HAIR, head, [0.1, 1.15, 0.02], [0, 0, -10]);
  // cowlick
  b.sweep(catmull([[0.02, 1.245, -0.02], [0.03, 1.275, -0.02], [0.015, 1.29, -0.03]]), [0.012, 0.002], {
    bone: head,
    color: HAIR,
    caps: { start: "flat", end: "point" },
  });

  // neck
  b.capsule([0, 0.97, 0], [0, 1.06, 0], 0.035, SKIN, { bone: neck });

  // ---------- Helmet box ----------
  const HW = 0.32, HH = 0.3, HD = 0.3, T = 0.01, HY = 1.17;
  bx(HW, HH, T, CARD, head, [0, HY, -HD / 2 + T / 2]); // back
  bx(T, HH, HD, CARD, head, [HW / 2 - T / 2, HY, 0]);
  bx(T, HH, HD, CARD, head, [-HW / 2 + T / 2, HY, 0]);
  bx(HW, T, HD, CARD_L, head, [0, HY + HH / 2 - T / 2, 0]); // top
  // front frame around face hole (hole y 1.04..1.22, x ±0.095)
  const FZ = HD / 2 - T / 2;
  bx(HW, 0.1, T, CARD, head, [0, 1.27, FZ]);
  bx(HW, 0.02, T, CARD, head, [0, 1.03, FZ]);
  for (const s of [1, -1]) {
    bx(0.065, 0.18, T, CARD, head, [s * 0.1275, 1.13, FZ]);
    // cut-edge liner inside the hole
    bx(0.006, 0.18, 0.03, CARD_D, head, [s * 0.092, 1.13, FZ - 0.012]);
    // marker outline on face
    bx(0.006, 0.19, 0.003, INK, head, [s * 0.1, 1.13, HD / 2 + 0.0015]);
  }
  bx(0.006, 0.006, 0.03, CARD_D, head, [0, 1.223, FZ - 0.012]).mesh.scale.set(30, 1, 1);
  bx(0.2, 0.006, 0.003, INK, head, [0, 1.225, HD / 2 + 0.0015]);
  bx(0.2, 0.006, 0.003, INK, head, [0, 1.037, HD / 2 + 0.0015]);
  bx(0.19, 0.006, 0.03, CARD_D, head, [0, 1.043, FZ - 0.012]);
  // tape on helmet
  bx(0.05, 0.003, HD + 0.004, TAPE, head, [0, 1.3225, 0]);
  bx(0.05, HH + 0.004, 0.003, TAPE, head, [0, HY, -HD / 2 - 0.0015]);
  bx(0.08, 0.02, 0.003, TAPE, head, [0.13, 1.31, HD / 2 + 0.0015], [0, 0, 40]);
  bx(0.08, 0.02, 0.003, TAPE, head, [-0.13, 1.31, HD / 2 + 0.0015], [0, 0, -40]);
  // corner edge trims
  for (const sx of [1, -1])
    for (const sz of [1, -1]) bx(0.012, HH, 0.012, CARD_D, head, [sx * (HW / 2), HY, sz * (HD / 2)]);
  // brads
  for (const s of [1, -1]) {
    brad([s * 0.1275, 1.2, HD / 2 + 0.003], [0, 0, 1], head);
    brad([s * 0.1275, 1.06, HD / 2 + 0.003], [0, 0, 1], head);
  }
  // LED lights on forehead strip
  const leds: [number, string][] = [[-0.06, RED], [0, YEL], [0.06, GREEN]];
  for (const [x, c] of leds) {
    cy(0.017, 0.017, 0.006, FOIL_D, head, [x, 1.265, HD / 2 + 0.003], [0, 0, 1], 10);
    glow(cy(0.012, 0.012, 0.01, c, head, [x, 1.265, HD / 2 + 0.006], [0, 0, 1], 10), 1.3);
  }
  // name tag
  plane(0.1, 0.024, NAME, head, [0.0, 1.31, HD / 2 + 0.0055], [0, 0, 1]).mesh.position.y += 0;
  // cup ears
  for (const s of [1, -1]) {
    cy(0.055, 0.04, 0.06, FOIL, head, [s * 0.19, 1.17, 0], [s, 0, 0], 12);
    cy(0.058, 0.058, 0.008, FOIL_D, head, [s * 0.218, 1.17, 0], [s, 0, 0], 12);
    cy(0.03, 0.03, 0.004, RED, head, [s * 0.224, 1.17, 0], [s, 0, 0], 10);
    cy(0.012, 0.012, 0.006, GOLD, head, [s * 0.227, 1.17, 0], [s, 0, 0], 8);
    cy(0.012, 0.012, 0.03, FOIL_D, head, [s * 0.165, 1.17, 0], [s, 0, 0], 8);
    // side marker stripes
    for (let i = 0; i < 3; i++) bx(0.003, 0.012, 0.08, INK, head, [s * (HW / 2 + 0.0015), 1.1 + i * 0.03, -0.04]);
  }
  // antenna
  cy(0.02, 0.026, 0.02, FOIL, head, [0.03, 1.332, -0.02], undefined, 10);
  b.sweep(
    catmull([
      [0.03, 1.34, -0.02],
      [0.05, 1.385, -0.02],
      [0.0, 1.42, -0.02],
      [0.05, 1.455, -0.02],
      [0.02, 1.495, -0.02],
    ]),
    0.005,
    { bone: head, color: RED, caps: "round" },
  );
  ball(0.032, YEL, head, [0.02, 1.52, -0.02], undefined, 8);
  for (const [x, y, z] of [[0.04, 1.535, -0.01], [-0.005, 1.535, -0.03], [0.02, 1.55, -0.02], [0.045, 1.51, -0.035]])
    ball(0.014, ORANGE, head, [x, y, z], undefined, 5);

  // ================= TORSO =================
  // inner clothes
  bx(0.25, 0.3, 0.15, SHIRT, chest, [0, 0.8, 0]);
  bx(0.29, 0.09, 0.16, SHIRT_D, chest, [0, 0.95, 0]);
  bx(0.2, 0.12, 0.13, JEANS, hips, [0, 0.58, 0]);
  bx(0.205, 0.02, 0.135, "#7a4a28", hips, [0, 0.635, 0]); // belt
  bx(0.025, 0.02, 0.005, GOLD, hips, [0, 0.635, 0.069]);

  // cardboard box body
  const BW = 0.46, BH = 0.4, BD = 0.32, BY = 0.8;
  bx(BW, BH, T, CARD, chest, [0, BY, BD / 2 - T / 2]); // front
  bx(BW, BH, T, CARD_D, chest, [0, BY, -BD / 2 + T / 2]); // back
  bx(T, BH, BD, CARD, chest, [BW / 2 - T / 2, BY, 0]);
  bx(T, BH, BD, CARD, chest, [-BW / 2 + T / 2, BY, 0]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) bx(0.014, BH, 0.014, CARD_D, chest, [sx * (BW / 2), BY, sz * (BD / 2)]);
  // folded top flaps
  const A = 25 * (Math.PI / 180);
  const top = BY + BH / 2;
  const fl = 0.05;
  const fa = 25;
  bx(BW, 0.005, 0.1, CARD_L, chest, [0, top + Math.sin(A) * fl, BD / 2 + Math.cos(A) * fl], [-fa, 0, 0]);
  bx(BW, 0.005, 0.1, CARD_L, chest, [0, top + Math.sin(A) * fl, -BD / 2 - Math.cos(A) * fl], [fa, 0, 0]);
  for (const s of [1, -1]) {
    bx(0.1, 0.005, BD, CARD_L, chest, [s * (BW / 2 + Math.cos(A) * fl), top + Math.sin(A) * fl, 0], [0, 0, s * fa]);
    bx(0.016, 0.012, BD * 0.9, TAPE, chest, [s * (BW / 2 + Math.cos(A) * fl), top + Math.sin(A) * fl + 0.004, 0], [
      0,
      0,
      s * fa,
    ]);
  }
  bx(0.06, 0.004, 0.1, TAPE, chest, [0, top + Math.sin(A) * fl + 0.004, BD / 2 + Math.cos(A) * fl], [-fa, 0, 0]);

  // arm holes
  for (const s of [1, -1]) {
    cy(0.068, 0.068, 0.004, HOLE, chest, [s * (BW / 2 + 0.002), 0.9, 0.01], [s, 0, 0], 12);
    cy(0.075, 0.075, 0.003, CARD_D, chest, [s * (BW / 2 + 0.001), 0.9, 0.01], [s, 0, 0], 12);
  }

  // control screen
  const FZ2 = BD / 2;
  bx(0.2, 0.125, 0.01, INK, chest, [0, 0.9, FZ2 + 0.005]);
  glow(plane(0.18, 0.1, SCREEN, chest, [0, 0.9, FZ2 + 0.0108], [0, 0, 1]), 1.0);
  for (const s of [1, -1]) brad([s * 0.1, 0.96, FZ2 + 0.003], [0, 0, 1], chest);
  // bottle-cap buttons
  const caps: [number, string][] = [[-0.15, RED], [-0.05, YEL], [0.05, BLUE], [0.15, GREEN]];
  for (const [x, c] of caps) {
    cy(0.028, 0.028, 0.012, FOIL_D, chest, [x, 0.8, FZ2 + 0.006], [0, 0, 1], 12);
    cy(0.02, 0.02, 0.016, c, chest, [x, 0.8, FZ2 + 0.008], [0, 0, 1], 12);
    cy(0.007, 0.007, 0.02, WHITE, chest, [x, 0.8, FZ2 + 0.008], [0, 0, 1], 6);
  }
  // dials
  for (const s of [1, -1]) {
    const dx = s * 0.12;
    cy(0.046, 0.046, 0.012, FOIL, chest, [dx, 0.7, FZ2 + 0.006], [0, 0, 1], 14);
    cy(0.036, 0.036, 0.016, FOIL_D, chest, [dx, 0.7, FZ2 + 0.008], [0, 0, 1], 14);
    bx(0.008, 0.036, 0.006, RED, chest, [dx - s * 0.008, 0.7 + 0.01, FZ2 + 0.018], [0, 0, s * 25]);
    for (let i = 0; i < 7; i++) {
      const ang = -120 + i * 40;
      const rad = (ang * Math.PI) / 180;
      bx(0.004, 0.012, 0.002, INK, chest, [dx + Math.sin(rad) * 0.062, 0.7 + Math.cos(rad) * 0.062, FZ2 + 0.0015], [
        0,
        0,
        -ang,
      ]);
    }
  }
  // lightning bolt emblem (ink underlay, yellow top)
  const bolt: [number, number][] = [
    [0.012, 0.05],
    [-0.03, -0.006],
    [-0.004, -0.006],
    [-0.014, -0.05],
    [0.032, 0.012],
    [0.005, 0.012],
  ];
  const big = bolt.map(([x, y]) => [x * 1.3, y * 1.2] as [number, number]);
  b.extrude(big, { at: [0, 0.7, FZ2 + 0.001], x: [1, 0, 0], thickness: 0.004, color: INK, bone: chest });
  b.extrude(bolt, { at: [0, 0.7, FZ2 + 0.004], x: [1, 0, 0], thickness: 0.006, color: YEL, bone: chest });
  // tape and brads on front corners
  for (const s of [1, -1]) {
    bx(0.09, 0.022, 0.003, TAPE, chest, [s * 0.19, 0.985, FZ2 + 0.0015], [0, 0, -s * 40]);
    brad([s * 0.2, 0.64, FZ2 + 0.003], [0, 0, 1], chest);
    // marker stitches along bottom
    for (let i = 0; i < 5; i++) bx(0.02, 0.004, 0.002, INK, chest, [s * (0.06 + i * 0.03), 0.615, FZ2 + 0.001]);
  }
  // side labels
  for (const s of [1, -1]) plane(0.12, 0.06, FRAGILE, chest, [s * (BW / 2 + 0.0035), 0.7, -0.06], [s, 0, 0]);
  // back label + rocket tubes
  plane(0.2, 0.12, BACKLABEL, chest, [0, 0.84, -BD / 2 - 0.0035], [0, 0, -1]);
  bx(0.46, 0.03, 0.003, TAPE, chest, [0, 0.66, -BD / 2 - 0.0015]);
  for (const s of [1, -1]) {
    const bz = -BD / 2;
    cy(0.04, 0.04, 0.14, FOIL, chest, [s * 0.11, 0.7, bz - 0.07], [0, 0.04, -1], 12);
    cy(0.043, 0.043, 0.012, FOIL_D, chest, [s * 0.11, 0.7, bz - 0.14], [0, 0, -1], 12);
    cy(0.043, 0.043, 0.02, TAPE, chest, [s * 0.11, 0.7, bz - 0.06], [0, 0, -1], 12);
    // tissue-paper flames
    b.part(new THREE.ConeGeometry(0.035, 0.1, 6), ORANGE, {
      bone: chest,
      at: [s * 0.11, 0.7, bz - 0.2],
      dir: [0, 0, -1],
    });
    b.part(new THREE.ConeGeometry(0.02, 0.07, 6), YEL, { bone: chest, at: [s * 0.11, 0.7, bz - 0.19], dir: [0, 0, -1] });
  }

  // ================= ARMS =================
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const sh: V = [s * 0.14, 0.92, 0];
    const el: V = [s * 0.35, 0.86, 0.01];
    const wr: V = [s * 0.54, 0.78, 0.04];
    const arm = b.chain(`arm${sd}`, polyline([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "arm",
    });
    b.sweep(arm, (t: number) => 0.038 - 0.006 * t, { color: SHIRT });
    foilTube(lerp(sh, el, 0.55) as unknown as V, lerp(sh, el, 1.03) as unknown as V, 0.052, arm.joints[0]);
    foilTube(lerp(el, wr, 0.02) as unknown as V, lerp(el, wr, 0.92) as unknown as V, 0.048, arm.joints[1]);
    // elbow joint cap
    ball(0.045, FOIL_D, arm.joints[1], el, undefined, 8);

    // glove
    const tip = arm.tip!;
    const d = new THREE.Vector3(...wr).sub(new THREE.Vector3(...el)).normalize();
    const at = (k: number, z = 0, y = 0) => wr.slice() && new THREE.Vector3(...wr).addScaledVector(d, k).add(new THREE.Vector3(0, y, z));
    b.rod(at(-0.045), at(0.0), 0.038, GLOVE_D, { bone: tip, sides: 10 }); // cuff
    ball(0.032, GLOVE, tip, at(0.04).toArray(), [1.1, 0.55, 0.95], 8);
    const fingerZ = [-0.02, -0.007, 0.006, 0.019];
    const fingerL = [0.05, 0.058, 0.055, 0.045];
    fingerZ.forEach((z, i) => {
      b.capsule(at(0.06, z, -0.002), at(0.06 + fingerL[i], z, -0.006), 0.0095, GLOVE, { bone: tip });
    });
    b.capsule(at(0.03, 0.03, 0), at(0.06, 0.062, -0.002), 0.011, GLOVE, { bone: tip });
  }

  // ================= LEGS =================
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const hp: V = [s * 0.07, 0.58, 0];
    const kn: V = [s * 0.072, 0.33, 0.02];
    const an: V = [s * 0.075, 0.075, 0];
    const leg = b.chain(`leg${sd}`, polyline([hp, kn, an]), {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`],
      role: "leg",
      contact: [s * 0.075, 0, 0.04],
    });
    b.sweep(leg, (t: number) => 0.056 - 0.014 * t, { color: JEANS });
    const tip = leg.tip!;
    const kj = leg.joints[1];
    // knee patch
    bx(0.07, 0.06, 0.012, JEANS_L, kj, [s * 0.072, 0.33, 0.07]);
    // shin box
    bx(0.12, 0.13, 0.12, FOIL, kj, [s * 0.075, 0.2, 0.015]);
    bx(0.124, 0.02, 0.124, FOIL_D, kj, [s * 0.075, 0.27, 0.015]);
    bx(0.124, 0.02, 0.124, FOIL_D, kj, [s * 0.075, 0.14, 0.015]);
    bx(0.126, 0.03, 0.126, TAPE, kj, [s * 0.075, 0.2, 0.015]);
    brad([s * 0.075, 0.2, 0.0775], [0, 0, 1], kj);
    bx(0.04, 0.012, 0.003, RED, kj, [s * 0.075, 0.235, 0.0765]);
    bx(0.04, 0.012, 0.003, BLUE, kj, [s * 0.075, 0.165, 0.0765]);
    // cuff + sock
    b.rod([s * 0.075, 0.115, 0], [s * 0.075, 0.085, 0], 0.044, JEANS_L, { bone: tip, sides: 10 });
    b.rod([s * 0.075, 0.095, 0], [s * 0.075, 0.06, 0], 0.036, WHITE, { bone: tip, sides: 10 });
    // sneaker
    bx(0.095, 0.06, 0.16, WHITE, tip, [s * 0.075, 0.055, 0.035]);
    ball(0.05, WHITE, tip, [s * 0.075, 0.045, 0.105], [0.95, 0.7, 0.85], 8);
    bx(0.098, 0.028, 0.22, SOLE, tip, [s * 0.075, 0.014, 0.04]);
    ball(0.05, SOLE, tip, [s * 0.075, 0.014, 0.15], [0.95, 0.28, 0.6], 8);
    bx(0.09, 0.08, 0.04, WHITE, tip, [s * 0.075, 0.065, -0.03]);
    bx(0.07, 0.02, 0.07, INK, tip, [s * 0.075, 0.09, 0.0], [-10, 0, 0]);
    for (let i = 0; i < 3; i++) bx(0.07, 0.007, 0.01, RED, tip, [s * 0.075, 0.088 - i * 0.003, 0.05 + i * 0.022], [-25, 0, 0]);
    bx(0.098, 0.014, 0.1, FOIL_H, tip, [s * 0.075, 0.032, 0.04]).mesh.visible = true;
  }

  return b.root;
}
