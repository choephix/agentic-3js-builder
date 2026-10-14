```ts
import * as THREE from "three";
import type { ExtrudeOptions, Fill, PartOptions } from "agentic-3js-builder";
import { arc, catmull, createBuilder, grain, mix, mottle, paint, polyline, smoothstep, svg } from "agentic-3js-builder";

export const meta = {
  name: "Melodeon Jukebox",
  description:
    "A 1950s bubble-tube jukebox: walnut arch cabinet, rainbow glass tube, chrome trim and tailfin crest, a sunburst record window with a spinning carousel, quilted burgundy speaker grille with a gold sunburst, coin slot and selector buttons.",
};

const RAD = Math.PI / 180;
type V3 = [number, number, number];

// Palette
const CHROME = "#e2e8ec";
const CHROME_SH = "#9aa6b1";
const EBONY = "#211812";
const CREAM = "#f1e3bc";
const GOLD = "#e8b83e";
const RED = "#c4302a";
const TEAL = "#2bb3ae";
const BULB = "#fff4c8";
const VINYL = "#16110f";
const LABELS = ["#d9382b", "#f1c232", "#2aa7a1", "#f1e3bc", "#e8792a", "#3b6fc9", "#e4688f", "#7bbf4a"];

/** Rounded rectangle outline, centred on the origin, counter-clockwise. */
const rr = (w: number, h: number, r: number, n = 2): Array<[number, number]> => {
  const corners: Array<[number, number, number]> = [
    [w / 2 - r, -(h / 2 - r), -90],
    [w / 2 - r, h / 2 - r, 0],
    [-(w / 2 - r), h / 2 - r, 90],
    [-(w / 2 - r), -(h / 2 - r), 180],
  ];
  const pts: Array<[number, number]> = [];
  for (const [cx, cy, a0] of corners)
    for (let k = 0; k <= n; k++) {
      const a = (a0 + (90 * k) / n) * RAD;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  return pts;
};

/** Points on a circle arc (degrees), both ends included. */
const arcPts = (r: number, yc: number, from: number, to: number, n: number): Array<[number, number]> =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = (from + ((to - from) * i) / n) * RAD;
    return [r * Math.cos(a), yc + r * Math.sin(a)];
  });

export default function build() {
  const b = createBuilder({ name: "jukebox" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const carousel = b.joint("carousel", { parent: root, at: [0, 0.99, 0] });

  // Dimensions (meters)
  const HW = 0.41; // half width of the cabinet
  const D = 0.62; // depth
  const F = D / 2; // front face z
  const Y_BASE = 0.065;
  const Y_MOULD = 0.72;
  const Y_FLOOR = 0.75; // window floor
  const Y_U0 = 0.745;
  const Y_SPRING = 1.04; // where the arch starts
  const R_OUT = 0.41;
  const R_IN = 0.285;

  // ---------- helpers ----------
  const put = (g: THREE.BufferGeometry, color: Fill, at: V3, o: PartOptions = {}) =>
    b.part(g, color, { at, bone: root, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cylY = (r0: number, r1: number, h: number, seg = 12) => new THREE.CylinderGeometry(r0, r1, h, seg);
  const cylZ = (r0: number, r1: number, h: number, seg = 12) => cylY(r0, r1, h, seg).rotateX(Math.PI / 2);
  const cylX = (r0: number, r1: number, h: number, seg = 12) => cylY(r0, r1, h, seg).rotateZ(-Math.PI / 2);
  const ball = (r: number, seg = 8) => new THREE.SphereGeometry(r, seg, Math.max(3, Math.floor(seg / 2)));
  /** A front-facing rounded plate: outline in x/y, thickness centred on z. */
  const plate = (
    w: number,
    h: number,
    r: number,
    thick: number,
    color: Fill,
    at: V3,
    o: Partial<ExtrudeOptions> = {},
  ) => b.extrude(rr(w, h, r), { x: [1, 0, 0], y: [0, 1, 0], bone: root, ...o, color, at, thickness: thick });
  const half = (rx: number, ry: number) => (): [number, number] => [rx, ry];
  /** Path up the left pillar, over the arch, down the right pillar. */
  const archPath = (r: number, y0: number, z: number) =>
    polyline([
      [-r, y0, z],
      [-r, Y_SPRING, z],
    ])
      .concat(arc([0, Y_SPRING, z], [-r, Y_SPRING, z], [0, 0, 1], -180))
      .concat(
        polyline([
          [r, Y_SPRING, z],
          [r, y0, z],
        ]),
      );

  // ---------- paints ----------
  const wood = grain(mottle("#5b2b13", "#72391b", { size: 0.18, seed: 4 }), "#92562b", {
    size: 0.011,
    axis: "y",
    seed: 2,
  });
  const quilt = paint((p) => {
    const s = 0.034;
    const u = (p.x + p.y) / s;
    const v = (p.x - p.y) / s;
    const d = Math.min(Math.abs(u - Math.round(u)), Math.abs(v - Math.round(v)));
    return mix("#9d2e3a", "#47100f", smoothstep(0.12, 0.04, d));
  });
  const burst = paint((p) => {
    const dx = p.x;
    const dy = p.y - 0.8;
    const ang = Math.atan2(dx, dy);
    const ray = 0.5 + 0.5 * Math.sin(ang * 14);
    const base = mix("#ffe38e", "#ffb53c", smoothstep(0.35, 0.65, ray));
    return mix(base, "#e8731f", smoothstep(0.25, 0.6, Math.hypot(dx, dy)));
  });

  // ---------- textures ----------
  const titleTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 105">
      <rect width="400" height="105" fill="#f3e6c1"/>
      <rect x="5" y="5" width="390" height="95" rx="9" fill="none" stroke="#b02a22" stroke-width="3"/>
      <rect x="9" y="9" width="382" height="87" rx="6" fill="none" stroke="#d9a21b" stroke-width="1.5"/>
      <text x="200" y="58" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-weight="bold" font-size="46" fill="#b02a22">Melodeon</text>
      <rect x="70" y="67" width="260" height="3" fill="#d9a21b"/>
      <text x="200" y="89" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" letter-spacing="5" fill="#3a2a1c">SELECT YOUR HIT</text>
      <path d="M28 52 l8 -8 l8 8 l-8 8z M356 52 l8 -8 l8 8 l-8 8z" fill="#d9a21b"/>
    </svg>`,
    { size: 512 },
  );
  const rays = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const tip = i % 2 === 0 ? 96 : 70;
    const w = 0.075;
    const pt = (r: number, ang: number) =>
      `${(100 + r * Math.cos(ang)).toFixed(1)},${(100 + r * Math.sin(ang)).toFixed(1)}`;
    return `<polygon points="${pt(40, a - w)} ${pt(tip, a)} ${pt(40, a + w)}"/>`;
  }).join("");
  const emblemTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><g fill="#fff">${rays}<circle cx="100" cy="100" r="38" fill="none" stroke="#fff" stroke-width="5"/><circle cx="100" cy="100" r="24"/></g></svg>`,
    { size: 256 },
  );

  // ---------- base and cabinet ----------
  put(box(0.86, 0.045, 0.67), EBONY, [0, 0.0225, 0], { name: "plinth" });
  put(box(0.85, 0.02, 0.66), CHROME_SH, [0, 0.055, 0], { name: "plinthTrim" });

  b.extrude(
    [
      [-HW, Y_BASE],
      [HW, Y_BASE],
      [HW, Y_MOULD],
      [-HW, Y_MOULD],
    ],
    {
      color: wood,
      at: [0, 0, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: D,
      bevel: 0.02,
      bone: root,
      name: "cabinet.lower",
    },
  );
  put(box(0.85, 0.032, 0.65), CHROME, [0, 0.735, 0], { name: "moulding" });

  // Arch housing: a hollow U, open to the window.
  const uOutline: Array<[number, number]> = [
    [-R_OUT, Y_U0],
    ...arcPts(R_OUT, Y_SPRING, 180, 0, 16),
    [R_OUT, Y_U0],
    [R_IN, Y_U0],
    ...arcPts(R_IN, Y_SPRING, 0, 180, 16),
    [-R_IN, Y_U0],
  ];
  b.extrude(uOutline, {
    color: wood,
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: D,
    bevel: 0.02,
    bone: root,
    name: "cabinet.arch",
  });

  // Window backdrop: sunburst
  const winOutline: Array<[number, number]> = [
    [-R_IN - 0.005, Y_FLOOR],
    [R_IN + 0.005, Y_FLOOR],
    ...arcPts(R_IN + 0.005, Y_SPRING, 0, 180, 16),
  ];
  b.extrude(winOutline, {
    color: burst,
    at: [0, 0, -0.29],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    bone: root,
    name: "window.back",
  });

  // ---------- chrome around the window, bubble tube ----------
  b.sweep(archPath(0.298, Y_FLOOR, F + 0.004), half(0.012, 0.012), {
    color: CHROME,
    section: "box",
    caps: "flat",
    up: [0, 0, 1],
    bone: root,
    name: "bezel",
  });
  for (const z of [F + 0.002, -F - 0.002])
    b.sweep(archPath(0.402, Y_FLOOR, z), half(0.008, 0.01), {
      color: CHROME,
      section: "box",
      caps: "flat",
      up: [0, 0, 1],
      bone: root,
      name: "rim",
    });
  put(box(0.576, 0.025, 0.015), CHROME, [0, 0.7625, F], { name: "sill" });

  // Rainbow bubble tube following the arch
  const tubeY0 = 0.77;
  const tubeZ = F + 0.025;
  const P = Y_SPRING - tubeY0;
  const A = Math.PI * 0.35;
  const L = 2 * P + A;
  const tubeBands: Array<[number, string]> = [];
  let acc = 0;
  const add = (len: number, col: string) => {
    acc += len;
    tubeBands.push([Math.min(acc / L, 1), col]);
  };
  add(P / 2, "#ff6a2b");
  add(P / 2, "#ffa927");
  const arcCols = ["#ffe14d", "#a8e04a", "#3fd68a", "#33c7e6", "#4c86f0", "#33c7e6", "#3fd68a", "#a8e04a", "#ffe14d"];
  arcCols.forEach((c) => add(A / arcCols.length, c));
  add(P / 2, "#ffa927");
  add(P / 2, "#ff6a2b");
  tubeBands[tubeBands.length - 1][0] = 1;
  b.sweep(archPath(0.35, tubeY0, tubeZ), 0.032, {
    bands: tubeBands,
    sides: 10,
    bone: root,
    name: "bubbleTube",
  });
  // glassy highlight streak along the inner side of the tube
  b.sweep(archPath(0.339, tubeY0 + 0.04, tubeZ + 0.0283), half(0.0035, 0.0035), {
    color: "#fffbe8",
    section: "box",
    caps: "flat",
    up: [0, 0, 1],
    bone: root,
    name: "tubeGloss",
  });
  for (const s of [-1, 1]) put(cylY(0.04, 0.044, 0.03, 12), CHROME, [s * 0.35, 0.765, tubeZ], { name: "tubeCollar" });

  // ---------- control strip ----------
  plate(0.76, 0.15, 0.02, 0.016, CHROME, [0, 0.6, F], { name: "strip.frame" });
  plate(0.74, 0.13, 0.015, 0.016, EBONY, [0, 0.6, F + 0.002], { name: "strip.inlay" });
  plate(0.42, 0.12, 0.012, 0.016, CHROME, [0, 0.6, F + 0.006], { name: "title.frame" });
  put(new THREE.PlaneGeometry(0.4, 0.105), "#ffffff", [0, 0.6, F + 0.0146], { texture: titleTex, name: "title.card" });

  // coin mechanism (left)
  plate(0.1, 0.105, 0.012, 0.016, CHROME, [-0.29, 0.6, F + 0.006], { name: "coin.plate" });
  put(box(0.046, 0.007, 0.004), EBONY, [-0.29, 0.628, F + 0.0145], { name: "coin.slot" });
  put(box(0.04, 0.02, 0.004), EBONY, [-0.29, 0.572, F + 0.0145], { name: "coin.return" });
  put(ball(0.008, 8), RED, [-0.32, 0.6, F + 0.017], { name: "coin.lamp" });
  put(ball(0.008, 8), GOLD, [-0.26, 0.6, F + 0.017], { name: "coin.lamp" });

  // selector buttons (right)
  plate(0.1, 0.105, 0.012, 0.016, CHROME, [0.29, 0.6, F + 0.006], { name: "buttons.plate" });
  const btn = cylZ(0.01, 0.01, 0.012, 10);
  const btnColors = [RED, CREAM, TEAL];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      put(btn, btnColors[(i + j) % 3], [0.29 + (i - 1) * 0.028, 0.6 + (j - 1) * 0.028, F + 0.0175], {
        name: "button",
      });

  // ---------- speaker grille ----------
  plate(0.68, 0.4, 0.025, 0.02, CHROME, [0, 0.3, F], { name: "grille.frame" });
  plate(0.64, 0.36, 0.018, 0.014, quilt, [0, 0.3, F], { name: "grille.cloth" });
  put(new THREE.PlaneGeometry(0.3, 0.3), "#f2c244", [0, 0.3, F + 0.0075], { texture: emblemTex, name: "grille.sunburst" });
  const bar = cylX(0.0075, 0.0075, 0.62, 8);
  for (let i = 0; i < 9; i++) put(bar, CHROME, [0, 0.3 + (i - 4) * 0.0375, F + 0.0125], { name: "grille.bar" });

  // ---------- edge rods ----------
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      b.capsule([sx * 0.4, 0.1, sz * 0.3], [sx * 0.4, 0.7, sz * 0.3], 0.011, {
        color: CHROME,
        sides: 8,
        bone: root,
        name: "edgeRod",
      });

  // ---------- side panels ----------
  for (const s of [1, -1]) {
    const x = s * HW;
    b.extrude(rr(0.46, 0.54, 0.045), { color: CHROME, at: [x, 0.4, 0], thickness: 0.01, bone: root, name: "side.frame" });
    b.extrude(rr(0.43, 0.51, 0.035), { color: CREAM, at: [x, 0.4, 0], thickness: 0.014, bone: root, name: "side.panel" });
    b.extrude(rr(0.34, 0.42, 0.025), { color: TEAL, at: [x, 0.4, 0], thickness: 0.018, bone: root, name: "side.inset" });
    for (let k = -2; k <= 2; k++) put(box(0.004, 0.3, 0.012), GOLD, [s * (HW + 0.0095), 0.4, k * 0.055], { name: "side.louvre" });
  }

  // ---------- crest fin ----------
  b.extrude(
    [
      [-0.26, 0, "sharp"],
      [0.27, 0, "sharp"],
      [0.21, 0.03],
      [0.08, 0.07],
      [-0.1, 0.08],
      [-0.22, 0.05],
    ],
    {
      color: CHROME,
      at: [0, Y_SPRING + R_OUT - 0.006, 0],
      thickness: 0.022,
      bevel: 0.004,
      smoothing: 1,
      bone: root,
      name: "crest",
    },
  );
  put(ball(0.016, 8), RED, [0, Y_SPRING + R_OUT + 0.03, 0.2], { name: "crest.jewel" });

  // ---------- window interior: deck, carousel, bulbs ----------
  b.lathe(
    [
      [0, 0],
      [0.25, 0],
      [0.25, 0.012],
      [0.17, 0.028],
      [0.05, 0.045],
      [0.05, 0.09],
      [0, 0.09],
    ],
    { color: RED, at: [0, Y_FLOOR, 0], segments: 20, bone: root, name: "deck" },
  );

  const trayProfile: Array<[number, number]> = [
    [0.025, 0],
    [0.19, 0],
    [0.215, 0.014],
    [0.19, 0.03],
    [0.025, 0.03],
  ];
  b.lathe(trayProfile, { color: CHROME, at: [0, 0.84, 0], segments: 20, bone: carousel, name: "tray.bottom" });
  b.lathe(trayProfile, { color: CHROME, at: [0, 1.11, 0], segments: 20, bone: carousel, name: "tray.top" });
  put(cylY(0.013, 0.013, 0.4, 10), CHROME, [0, 1.04, 0], { bone: carousel, name: "mast" });
  put(cylY(0.03, 0.03, 0.05, 10), CHROME_SH, [0, 0.99, 0], { bone: carousel, name: "hub" });
  put(ball(0.02, 8), GOLD, [0, 1.245, 0], { bone: carousel, name: "finial" });

  // Records standing on edge, fanned radially round the mast.
  const CY = 0.99;
  const REC_R = 0.12;
  const REC_RC = 0.14;
  const disc = cylZ(REC_R, REC_R, 0.004, 22);
  const label = cylZ(0.045, 0.045, 0.0046, 14);
  const hole = cylZ(0.006, 0.006, 0.0052, 6);
  const COUNT = 16;
  for (let i = 0; i < COUNT; i++) {
    const th = (i + 0.5) * (360 / COUNT);
    const rad = th * RAD;
    const at: V3 = [REC_RC * Math.sin(rad), CY, REC_RC * Math.cos(rad)];
    const rotation: V3 = [0, th + 90, 0];
    put(disc, VINYL, at, { rotation, bone: carousel, name: "record" });
    put(label, LABELS[i % LABELS.length], at, { rotation, bone: carousel, name: "record.label" });
    put(hole, "#1a1410", at, { rotation, bone: carousel, name: "record.hole" });
  }

  // Marquee bulbs round the back of the window
  const bulb = ball(0.011, 6);
  for (let i = 0; i <= 12; i++) {
    const a = i * 15 * RAD;
    put(bulb, BULB, [0.268 * Math.cos(a), Y_SPRING + 0.268 * Math.sin(a), -0.262], { name: "bulb" });
  }
  for (const y of [0.8, 0.865, 0.93, 0.995])
    for (const s of [-1, 1]) put(bulb, BULB, [s * 0.268, y, -0.262], { name: "bulb" });

  // ---------- back: service door, handle, vents, cord ----------
  plate(0.5, 0.44, 0.03, 0.016, CREAM, [0, 0.38, -F], { name: "door" });
  for (let k = 0; k < 5; k++) put(box(0.3, 0.01, 0.006), EBONY, [0, 0.22 + k * 0.022, -F - 0.009], { name: "door.vent" });
  for (const s of [-1, 1]) put(cylZ(0.006, 0.006, 0.026, 8), CHROME, [s * 0.07, 0.5, -F - 0.012], { name: "door.post" });
  put(cylX(0.009, 0.009, 0.16, 10), CHROME, [0, 0.5, -F - 0.026], { name: "door.handle" });

  put(cylZ(0.02, 0.022, 0.012, 10), EBONY, [0.18, 0.12, -F - 0.002], { name: "grommet" });
  const cord = catmull([
    [0.18, 0.12, -0.3],
    [0.18, 0.11, -0.36],
    [0.19, 0.06, -0.41],
    [0.22, 0.008, -0.45],
    [0.3, 0.008, -0.5],
    [0.3, 0.008, -0.56],
  ]);
  b.sweep(cord, 0.007, { color: EBONY, sides: 6, bone: root, name: "cord" });
  put(box(0.026, 0.018, 0.04), "#2c2623", [0.3, 0.01, -0.585], { name: "plug" });
  for (const s of [-1, 1]) put(cylZ(0.0025, 0.0025, 0.02, 5), CHROME, [0.3 + s * 0.008, 0.01, -0.615], { name: "plug.prong" });

  return b.root;
}
```