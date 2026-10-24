import * as THREE from "three";
import {
  bezier,
  catmull,
  cells,
  createBuilder,
  limb,
  mix,
  noise,
  paint,
  rng,
  scales,
  smoothstep,
  stripes,
  svg,
} from "../../../../src/index";
import type { Joint, ColorInput } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "Oaxacan alebrije painted-wood chimera: a rosette-spotted jaguar body with an eagle's hooked beak, crest and ruff, spread feathered wings and a feather-fan tail, covered in dots, flowers and spirals.",
};

// ------------------------------------------------------------------ palette
const C = {
  orange: "#f58a1f",
  yellow: "#ffd530",
  magenta: "#e0237d",
  pink: "#ff86b4",
  turq: "#12b5ae",
  blue: "#2858c8",
  navy: "#1b2a78",
  green: "#45b83c",
  red: "#d52f2a",
  purple: "#7b3fb5",
  cream: "#fff3d6",
  ink: "#2b1233",
  gold: "#f2b632",
};

type Pt = [number, number] | [number, number, "sharp"];
const DEG = Math.PI / 180;
const wrap180 = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;
const fract = (x: number) => x - Math.floor(x);

// ------------------------------------------------------------------ paints
const bodyPaint = paint((p, n) => {
  const base = mix(C.yellow, C.orange, smoothstep(-0.5, 0.35, n.y));
  const c = cells(p, 0.13, 3);
  const d = c.d1 + 0.12 * (noise(p, 0.05, 2) - 0.5);
  const centre = c.id < 0.33 ? C.magenta : c.id < 0.66 ? C.turq : C.blue;
  if (d < 0.17) return centre;
  if (d < 0.25) return C.cream;
  if (d < 0.32) return C.ink;
  const small = cells(p, 0.045, 11);
  if (d > 0.42 && small.d1 < 0.15) return C.cream;
  return base;
});

const headPaint = paint((p, n) => {
  const base = mix(C.cream, C.turq, smoothstep(-0.2, 0.45, n.y));
  const c = cells(p, 0.05, 21);
  if (c.d1 < 0.2) return n.y > 0.3 ? C.magenta : C.blue;
  return base;
});

function dotted(base: string, cols: string[], size: number, r: number, seed: number) {
  return paint((p) => {
    const c = cells(p, size, seed);
    return c.d1 < r ? cols[Math.floor(c.id * cols.length) % cols.length] : base;
  });
}

const legPaint = stripes(C.orange, [C.magenta, C.turq, C.blue], { size: 0.07, axis: "y", width: 0.4, seed: 3 });
const tailPaint = stripes(C.yellow, [C.ink, C.magenta], { size: 0.085, axis: "z", width: 0.4, seed: 5 });
const neckPaint = scales([C.turq, C.blue, C.green], C.ink, { size: 0.06, seed: 8 });
const armPaint = dotted(C.magenta, [C.yellow, C.cream], 0.04, 0.2, 4);
const pawPaint = dotted(C.cream, [C.magenta, C.blue], 0.035, 0.2, 9);

const beakPaint = paint((_p, _n, s) => {
  const t = s[0];
  if (t > 0.9) return C.ink;
  if (Math.abs(wrap180(s[1])) < 14 && fract(t * 11) < 0.4) return C.magenta;
  return mix(C.gold, C.orange, t);
});
const jawBeakPaint = paint((_p, _n, s) => {
  const t = s[0];
  if (t > 0.9) return C.ink;
  return mix(C.orange, C.red, t);
});

function fp(a: string, b: string, tip: string, len: number) {
  return paint((_p, _n, s) => {
    const t = Math.min(Math.max(s[0] / len, 0), 1.2);
    const w = Math.abs(s[1]);
    if (w < 0.0035 && t > 0.05) return C.ink;
    if (t > 0.88) return tip;
    return Math.floor(t * 7 + (w / len) * 9) % 2 ? a : b;
  });
}

const flamePaint = (a: string, b: string, c: string) =>
  paint((_p, _n, s) => (s[0] < 0.045 ? a : s[0] < 0.1 ? b : c));

// ------------------------------------------------------------------ textures
const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="${C.ink}"/>
  <circle cx="50" cy="50" r="40" fill="${C.gold}"/>
  <circle cx="50" cy="50" r="40" fill="none" stroke="${C.magenta}" stroke-width="5" stroke-dasharray="4 6"/>
  <circle cx="50" cy="50" r="30" fill="${C.yellow}"/>
  <circle cx="50" cy="50" r="19" fill="${C.ink}"/>
  <circle cx="38" cy="38" r="7" fill="#ffffff"/>
  <circle cx="60" cy="61" r="3.2" fill="#ffffff"/>
  <path d="M6 42 Q50 2 94 42" stroke="${C.ink}" stroke-width="10" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

function flowerSvg() {
  let outer = "";
  let inner = "";
  for (let i = 0; i < 8; i++) {
    outer += `<ellipse cx="50" cy="22" rx="10" ry="20" fill="${C.magenta}" stroke="${C.ink}" stroke-width="2.5" transform="rotate(${i * 45} 50 50)"/>`;
    inner += `<ellipse cx="50" cy="31" rx="5.5" ry="11" fill="${C.turq}" stroke="${C.ink}" stroke-width="2" transform="rotate(${i * 45 + 22.5} 50 50)"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${outer}${inner}
    <circle cx="50" cy="50" r="13" fill="${C.yellow}" stroke="${C.ink}" stroke-width="3"/>
    <circle cx="50" cy="50" r="5" fill="${C.red}"/></svg>`,
    { size: 192 },
  );
}
const FLOWER = flowerSvg();

function spiralSvg() {
  let d = "";
  for (let i = 0; i <= 60; i++) {
    const a = (i / 60) * Math.PI * 5;
    const r = 3 + a * 2.7;
    d += `${i ? "L" : "M"}${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="${d}" fill="none" stroke="${C.ink}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${C.yellow}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="50" cy="50" r="5" fill="${C.magenta}" stroke="${C.ink}" stroke-width="2"/></svg>`,
    { size: 192 },
  );
}
const SPIRAL = spiralSvg();

function sunSvg() {
  let rays = "";
  for (let i = 0; i < 12; i++) {
    rays += `<path d="M44 20 L50 2 L56 20Z" fill="${i % 2 ? C.orange : C.red}" stroke="${C.ink}" stroke-width="2" stroke-linejoin="round" transform="rotate(${i * 30} 50 50)"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${rays}
    <circle cx="50" cy="50" r="24" fill="${C.yellow}" stroke="${C.ink}" stroke-width="3"/>
    <circle cx="50" cy="50" r="15" fill="${C.turq}" stroke="${C.ink}" stroke-width="2.5"/>
    <circle cx="50" cy="50" r="6" fill="${C.magenta}"/></svg>`,
    { size: 192 },
  );
}
const SUN = sunSvg();

function featherCard(a: string, bcol: string) {
  let chev = "";
  for (let i = 0; i < 4; i++) {
    const y = 74 - i * 14;
    chev += `<path d="M9 ${y} L20 ${y - 11} L31 ${y}" fill="none" stroke="${bcol}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return svg(
    `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 99 C2 70 2 30 20 2 C38 30 38 70 20 99Z" fill="${a}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>
    ${chev}
    <path d="M20 96 L20 14" stroke="${C.ink}" stroke-width="2.5"/>
    <circle cx="20" cy="16" r="4.5" fill="${C.cream}" stroke="${C.ink}" stroke-width="1.5"/></svg>`,
    { size: 128 },
  );
}
const F1 = featherCard(C.turq, C.blue);
const F2 = featherCard(C.magenta, C.orange);
const F3 = featherCard(C.yellow, C.green);

// ------------------------------------------------------------------ outlines
const featherOutline = (len: number, w: number): Pt[] => [
  [0, 0, "sharp"],
  [len * 0.3, w * 0.9],
  [len * 0.7, w],
  [len, 0, "sharp"],
  [len * 0.7, -w],
  [len * 0.3, -w * 0.9],
];
const FLAME: Pt[] = [
  [-0.02, -0.045],
  [0.07, -0.04],
  [0.15, -0.012],
  [0.19, 0, "sharp"],
  [0.15, 0.012],
  [0.07, 0.04],
  [-0.02, 0.045],
];
const TONGUE: Pt[] = [
  [0, -0.016],
  [0.08, -0.016],
  [0.125, -0.034],
  [0.105, -0.004],
  [0.125, 0.034],
  [0.08, 0.016],
  [0, 0.016],
];
const disc = (r: number, n = 10): Pt[] =>
  Array.from({ length: n }, (_, i): Pt => [Math.cos((i / n) * Math.PI * 2) * r, Math.sin((i / n) * Math.PI * 2) * r]);

// ------------------------------------------------------------------ build
export default function build() {
  const b = createBuilder({ name: "alebrije_jaguar_eagle", paintSize: 2048 });
  const UP = new THREE.Vector3(0, 1, 0);
  const sph = (seg = 10, rows = 8) => new THREE.SphereGeometry(1, seg, rows);

  // One flat feather blade: a drawn, painted leaf shape lying on the plane spanned by its direction and a sideways axis.
  const feather = (
    at: THREE.Vector3,
    dirIn: number[],
    len: number,
    w: number,
    color: ColorInput,
    bone: Joint,
    thick = 0.008,
  ) => {
    const d = new THREE.Vector3(dirIn[0], dirIn[1], dirIn[2]).normalize();
    const r = new THREE.Vector3().crossVectors(d, UP).normalize();
    return b.extrude(featherOutline(len, w), {
      at,
      x: d,
      y: r,
      thickness: thick,
      bevel: Math.min(0.002, thick / 2.5),
      smoothing: 1,
      color,
      bone,
    });
  };

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.72, -0.55], dir: [0, 0.05, 1] });
  const spinePath = catmull([
    [0, 0.72, -0.55],
    [0, 0.76, -0.18],
    [0, 0.78, 0.2],
    [0, 0.82, 0.5],
  ]);
  const spine = b.chain("spine", spinePath, { parent: hips, role: "spine" });
  const chest = spine.joints[2];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.84, 0.46],
      [0, 1.0, 0.64],
      [0, 1.16, 0.74],
    ]),
    { parent: chest, role: "neck" },
  );
  const head = b.joint("head", { at: neck.at(1), dir: [0, 0.15, 1], role: "head" });
  const hp = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });
  const jaw = b.joint("jaw", { parent: head, at: hp(0.02, -0.045), aim: hp(0.2, -0.05), role: "jaw" });

  const tailPath = catmull([
    [0, 0.72, -0.6],
    [0, 0.66, -1.0],
    [0, 0.62, -1.35],
    [0, 0.7, -1.65],
    [0, 0.9, -1.85],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, role: "tail" });

  // ---------------------------------------------------------------- body
  const body = b.sweep(
    spine,
    (t) => [
      0.2 + 0.03 * Math.sin(Math.PI * t),
      0.215 + 0.045 * Math.sin(Math.PI * Math.min(1, t * 1.15)),
    ],
    { color: bodyPaint },
  );

  // dorsal flame plates
  let fi = 0;
  const flameA = flamePaint(C.magenta, C.yellow, C.red);
  const flameB = flamePaint(C.turq, C.cream, C.blue);
  b.along(
    body,
    6,
    (at) => {
      const k = fi++;
      b.extrude(FLAME, {
        at,
        x: at.axis,
        y: at.tangent,
        thickness: 0.03,
        bevel: 0.006,
        color: k % 2 ? flameA : flameB,
      });
    },
    { from: 0.08, to: 0.6 },
  );

  // flank flowers, chest sun
  for (const s of [1, -1]) {
    b.decal(body, FLOWER, { at: [s * 0.23, 0.75, 0.03], dir: [s, 0, 0], size: [0.3, 0.3], segments: 14 });
  }
  b.decal(body, SUN, { at: [0, 0.64, 0.66], dir: [0, -0.2, 1], size: [0.26, 0.26], segments: 14 });

  // ---------------------------------------------------------------- neck, ruff, collar
  b.sweep(neck, [0.165, 0.125], { color: neckPaint });
  const ruff1 = b.ring(neck.at(0.75), { count: 14, radius: 0.13 }).items;
  b.cards(ruff1, [F1, F2, F3], {
    size: [0.075, 0.2],
    lean: 55,
    flow: [0, -1, -0.3],
    bend: 30,
    vary: 0.2,
    rng: rng(5),
  });
  const ruff2 = b.ring(neck.at(0.35), { count: 16, radius: 0.16 }).items;
  b.cards(ruff2, [F2, F3, F1], {
    size: [0.09, 0.24],
    lean: 62,
    flow: [0, -1, -0.3],
    bend: 30,
    vary: 0.2,
    rng: rng(6),
  });
  const collar = b.ring(neck.at(0.2), { count: 12, radius: 0.16 });
  b.sweep(catmull(collar.items, { closed: true }), 0.022, { color: C.magenta });
  b.ring(neck.at(0.2), { count: 12, radius: 0.175 }, (item) => {
    b.part(new THREE.SphereGeometry(0.026, 6, 5), item.i % 2 ? C.yellow : C.turq, { at: item });
  });

  // ---------------------------------------------------------------- head
  const H = 1;
  const skull = b.part(sph(), headPaint, {
    bone: head,
    at: hp(0.04, 0),
    scale: [0.13 * H, 0.125 * H, 0.15 * H],
    flat: true,
  });
  b.part(sph(), headPaint, {
    bone: jaw,
    at: hp(0.04, -0.06),
    scale: [0.07 * H, 0.045 * H, 0.09 * H],
    flat: true,
  });

  // upper beak (hooked) and lower beak on the jaw
  const upperPath = bezier(hp(0.12, -0.005), hp(0.26, 0.035), hp(0.37, 0.01), hp(0.37, -0.11));
  b.sweep(upperPath, (t) => [0.058 * (1 - t) + 0.01, 0.07 * (1 - t) + 0.012], {
    bone: head,
    color: beakPaint,
    caps: { start: "flat", end: "point" },
    sides: 8,
  });
  const lowerPath = bezier(hp(0.07, -0.05), hp(0.2, -0.06), hp(0.28, -0.065), hp(0.31, -0.055));
  b.sweep(lowerPath, (t) => [0.05 * (1 - t) + 0.01, 0.03 * (1 - t) + 0.008], {
    bone: jaw,
    color: jawBeakPaint,
    caps: { start: "flat", end: "point" },
    sides: 8,
  });
  b.extrude(TONGUE, {
    at: hp(0.09, -0.03),
    x: [0, 0.1, 1],
    y: [1, 0, 0],
    thickness: 0.008,
    color: C.pink,
    bone: jaw,
  });

  for (const s of [1, -1]) {
    // nostril
    b.part(new THREE.SphereGeometry(0.012, 6, 4), C.ink, { bone: head, at: hp(0.2, 0.025, s * 0.042) });
    // cheek
    b.part(sph(), headPaint, {
      bone: head,
      at: hp(0.03, -0.03, s * 0.09),
      scale: [0.07, 0.07, 0.09],
      flat: true,
    });
    // eye + decal
    const eyeC = hp(0.07, 0.045, s * 0.105);
    const eyeBall = b.part(sph(10, 8), C.gold, {
      bone: head,
      at: eyeC,
      scale: [0.046, 0.046, 0.046],
    });
    const out = new THREE.Vector3(s * 0.75, 0.1, 0.65).normalize();
    b.decal(eyeBall, EYE, {
      at: eyeC.clone().addScaledVector(out, 0.045),
      dir: out,
      size: [0.072, 0.072],
      segments: 8,
    });
    // brow ridge
    b.rod(hp(0.0, 0.085, s * 0.14), hp(0.15, 0.065, s * 0.035), [0.024, 0.012], {
      bone: head,
      color: C.navy,
      sides: 6,
    });
    // jaguar ear: outer disc + pink inner disc
    const earAt = hp(-0.06, 0.13, s * 0.1);
    b.extrude(disc(0.055), {
      at: earAt,
      x: [1, 0, 0],
      y: [s * 0.4, 1, 0],
      thickness: 0.03,
      bevel: 0.006,
      color: C.magenta,
      bone: head,
    });
    b.extrude(disc(0.032), {
      at: earAt,
      x: [1, 0, 0],
      y: [s * 0.4, 1, 0],
      thickness: 0.038,
      bevel: 0.004,
      color: C.pink,
      bone: head,
    });
  }

  // crest plumes
  const plume = [fp(C.turq, C.blue, C.magenta, 0.3), fp(C.magenta, C.orange, C.ink, 0.3), fp(C.yellow, C.orange, C.red, 0.3)];
  [-0.06, -0.03, 0, 0.03, 0.06].forEach((lat, i) => {
    const len = 0.3 - Math.abs(lat) * 1.5;
    feather(hp(-0.03, 0.1, lat), [lat * 6, 0.7, -0.55], len, 0.032, plume[i % 3], head, 0.01);
  });

  // third-eye gem
  glow(b.part(new THREE.OctahedronGeometry(0.03), "#7ffff0", { bone: head, at: hp(0.1, 0.115), flat: true }), 1.4);

  // ---------------------------------------------------------------- tail
  b.sweep(tail, [0.08, 0.03], { color: tailPaint });
  const tailBone = tail.joints[tail.joints.length - 1];
  const tailEnd = tailPath.at(1);
  const fanDir = new THREE.Vector3(0, 0.22, -1).normalize();
  const tailPaints = [fp(C.turq, C.blue, C.ink, 0.46), fp(C.magenta, C.orange, C.ink, 0.46), fp(C.yellow, C.red, C.ink, 0.46)];
  const tailPaints2 = [fp(C.yellow, C.orange, C.magenta, 0.28), fp(C.green, C.turq, C.yellow, 0.28)];
  for (let k = -3; k <= 3; k++) {
    const d = fanDir.clone().applyAxisAngle(UP, k * 0.3);
    const base = tailEnd.clone().addScaledVector(d, -0.02);
    feather(base, [d.x, d.y, d.z], 0.46 - Math.abs(k) * 0.05, 0.05, tailPaints[Math.abs(k) % 3], tailBone, 0.008);
    const base2 = base.clone();
    base2.y += 0.014;
    feather(base2, [d.x, d.y + 0.03, d.z], (0.46 - Math.abs(k) * 0.05) * 0.6, 0.04, tailPaints2[Math.abs(k) % 2], tailBone, 0.008);
  }

  // ---------------------------------------------------------------- legs
  const pawToes = [C.magenta, C.turq, C.magenta];
  const buildPaw = (leg: { joints: Joint[] }, F: THREE.Vector3) => {
    const foot = leg.joints[leg.joints.length - 1];
    b.part(sph(8, 6), pawPaint, {
      bone: foot,
      at: [F.x, 0.048, F.z + 0.045],
      scale: [0.075, 0.048, 0.1],
      flat: true,
    });
    [-1, 0, 1].forEach((dx, i) => {
      const tx = F.x + dx * 0.036;
      const tz = F.z + 0.1 + (dx === 0 ? 0.016 : 0);
      b.part(sph(6, 5), pawToes[i], { bone: foot, at: [tx, 0.032, tz], scale: [0.032, 0.028, 0.04] });
      b.spike([tx, 0.036, tz + 0.03], [0, -0.25, 1], 0.07, 0.013, { color: C.cream, bone: foot, sides: 6 });
    });
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // front
    const fRoot = new THREE.Vector3(s * 0.18, 0.6, 0.36);
    const fFoot = new THREE.Vector3(s * 0.19, 0.075, 0.42);
    const fPts = limb(fRoot, fFoot, [0.3, 0.3], [[0, 0, -1]]);
    const fLeg = b.chain(`legF${S}`, fPts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "leg",
    });
    b.sweep(fLeg, [0.1, 0.08, 0.06], { color: legPaint });
    b.part(sph(), bodyPaint, { bone: chest, at: [s * 0.18, 0.66, 0.36], scale: [0.12, 0.17, 0.18], flat: true });
    buildPaw(fLeg, fFoot);

    // hind
    const hRoot = new THREE.Vector3(s * 0.2, 0.62, -0.48);
    const hFoot = new THREE.Vector3(s * 0.2, 0.075, -0.46);
    const hPts = limb(hRoot, hFoot, [0.27, 0.27, 0.17], [[0, 0, 1], [0, 0, -1]]);
    const hLeg = b.chain(`legH${S}`, hPts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `ankle${S}`],
      role: "leg",
    });
    b.sweep(hLeg, [0.1, 0.085, 0.065, 0.058], { color: legPaint });
    const thigh = b.part(sph(), bodyPaint, {
      bone: hips,
      at: [s * 0.19, 0.63, -0.5],
      scale: [0.12, 0.17, 0.2],
      flat: true,
    });
    b.decal(thigh, SPIRAL, { at: [s * 0.31, 0.63, -0.5], dir: [s, 0, 0], size: [0.2, 0.2], segments: 10 });
    buildPaw(hLeg, hFoot);
  }

  // ---------------------------------------------------------------- wings
  const ROWS = [
    {
      sc: 1,
      lift: 0,
      w: 0.05,
      prim: [fp(C.blue, C.turq, C.ink, 0.5), fp(C.turq, C.blue, C.ink, 0.5)],
      sec: [fp(C.magenta, C.orange, C.ink, 0.45), fp(C.orange, C.magenta, C.ink, 0.45)],
    },
    {
      sc: 0.62,
      lift: 0.014,
      w: 0.042,
      prim: [fp(C.yellow, C.orange, C.magenta, 0.3), fp(C.orange, C.yellow, C.magenta, 0.3)],
      sec: [fp(C.turq, C.cream, C.blue, 0.28), fp(C.blue, C.cream, C.turq, 0.28)],
    },
    {
      sc: 0.36,
      lift: 0.028,
      w: 0.036,
      prim: [fp(C.green, C.turq, C.yellow, 0.18), fp(C.pink, C.magenta, C.cream, 0.18)],
      sec: [fp(C.pink, C.magenta, C.cream, 0.18), fp(C.green, C.turq, C.yellow, 0.18)],
    },
  ];

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `wing${S}`,
      catmull([
        [s * 0.16, 1.0, 0.22],
        [s * 0.42, 1.12, 0.14],
        [s * 0.7, 1.15, 0.08],
      ]),
      {
        parent: chest,
        names: [`wingShoulder${S}`, `wingElbow${S}`, `wingWrist${S}`],
        role: "wing",
      },
    );
    b.sweep(arm, [0.07, 0.06, 0.045, 0.03], { color: armPaint });
    b.part(sph(8, 6), armPaint, { bone: arm.joints[0], at: [s * 0.16, 1.0, 0.22], scale: [0.09, 0.08, 0.09], flat: true });

    const wrist = arm.at(1).at;
    const wristBone = arm.joints[2];
    for (const row of ROWS) {
      // primaries fan from the wrist
      for (let i = 0; i < 7; i++) {
        const a = (72 - i * 9) * DEG;
        const len = (0.42 + 0.03 * i - (i === 6 ? 0.07 : 0)) * row.sc;
        const base = wrist.clone();
        base.y += row.lift;
        feather(base, [s * Math.cos(a), 0.12, -Math.sin(a)], len, row.w, row.prim[i % 2], wristBone);
      }
      // secondaries along the forearm and upper arm
      for (let j = 0; j < 9; j++) {
        const t = 0.04 + j * 0.1;
        const cp = arm.at(t);
        const a = (100 - 30 * (j / 8)) * DEG;
        const len = (0.36 + 0.13 * (j / 8)) * row.sc;
        const base = cp.at.clone();
        base.y += row.lift;
        feather(base, [s * Math.cos(a), 0.1, -Math.sin(a)], len, row.w, row.sec[j % 2], cp.bone as Joint);
      }
    }
  }

  // open the beak a little: rest pose with the tongue showing
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  return b.root;
}
