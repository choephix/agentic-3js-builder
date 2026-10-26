import * as THREE from "three";
import {
  createBuilder,
  rng,
  offset,
  lerp,
  limb,
  countershade,
  mottle,
  grain,
  stripes,
  scales,
  spots,
  paint,
  mix,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Baba Yaga's Hut",
  description:
    "Slavic folk-art izba standing on two giant chicken legs: carved and painted window frames, kokoshnik crests, scalloped shingles, a horse-head ridge beam, a ladder porch, and a fence of glowing-eyed skulls.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette and constants
const RED = "#c8281e";
const WHITE = "#f6ecd2";
const YEL = "#f2b628";
const BLUE = "#1d4f9c";
const INK = "#2a1710";
const BONE = "#e6dbbd";
const BONE_D = "#cfc19f";
const CLAW = "#3b2a1a";
const DARK_IN = "#3a2514";
const LEG_FLAT = "#e0a22a";
const RUST = "#b8431f";
const OCHRE = "#e2902e";
const EMBER = "#ffb02e";
const SMOKE = ["#e0dad0", "#cfc8bd", "#bcb5aa", "#a9a399"];

const GY = 0.14; // ground top
const FLOOR = 2.7; // hut floor top
const RIDGE = 6.4;
const UP = new THREE.Vector3(0, 1, 0);
const arr = (v: THREE.Vector3) => [v.x, v.y, v.z];

// ---------------------------------------------------------------------------------------------------------------
// Paints
const woodP = (axis: "x" | "y" | "z", hi: string, lo: string, seed = 1) =>
  countershade(
    grain(hi, lo, { size: 0.05, axis, seed }),
    grain(mix(hi, "#241408", 0.45), mix(lo, "#241408", 0.5), { size: 0.05, axis, seed }),
    { level: -0.1, soft: 0.6 },
  );
const WOOD_X = woodP("x", "#c98a45", "#9a6030");
const WOOD_Z = woodP("z", "#c98a45", "#9a6030");
const WOOD_PLANK = woodP("y", "#dcae66", "#b27d3d", 3);
const WOOD_DARK = woodP("x", "#6d4524", "#4d2f16", 2);
const WOOD_POST = woodP("y", "#80593200".slice(0, 7) === "#805932" ? "#805932" : "#805932", "#52371c", 5);
const DOOR_WOOD = woodP("y", "#8a5a2c", "#5e3a1c", 4);
const LEG_P = scales(["#efb835", "#e0a22a", "#f2c44a"], "#7a4c10", { size: 0.075, width: 0.16, seed: 4 });
const PUFF_P = mottle("#9e3a1c", "#c25a2a", { size: 0.22, seed: 12 });
const RIDGE_P = stripes(RED, WHITE, { size: 0.36, axis: "z", width: 0.3, wobble: 0.05 });
const CHIMNEY_P = scales(["#e2d8c2", "#d0c4aa"], "#6e6454", { size: 0.17, width: 0.12, seed: 9 });
const SH_A = mottle("#2c6b63", "#1e4d4a", { size: 0.35, seed: 7 });
const SH_B = mottle("#d09238", "#a8691f", { size: 0.3, seed: 8 });
const SH_C = mottle("#a8321f", "#7e2216", { size: 0.3, seed: 10 });
const SHINGLES = [SH_A, SH_B, SH_A, SH_C];
const LACE = paint((_p, _n, s) => {
  const dx = (((s[0] % 0.22) + 0.22) % 0.22) - 0.11;
  return Math.hypot(dx, s[1] + 0.05) < 0.035 ? RED : WHITE;
});
const GRASS = mottle("#5e8f3a", "#3f6f2c", { size: 0.8, seed: 5 });
const DIRT = mottle("#8a6238", "#6e4a2a", { size: 0.4, seed: 6 });
const GROUND_P = paint((p, n) => {
  if (n.y < 0.5) return "#4a3020";
  const path = p.z > 1.9 && Math.abs(p.x) < 0.7 + 0.15 * Math.sin(p.z * 2.2);
  return path ? DIRT : GRASS;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures
const sunSvg = () => {
  const P = (r: number, a: number) => `${(50 + r * Math.sin(a)).toFixed(1)} ${(50 - r * Math.cos(a)).toFixed(1)}`;
  let rays = "";
  for (let k = 0; k < 16; k++) {
    const a = (k * 22.5 * Math.PI) / 180;
    rays += `<path d="M${P(28, a - 0.18)} L${P(48, a)} L${P(28, a + 0.18)}Z" fill="${k % 2 ? RED : YEL}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
  }
  return `<svg viewBox="0 0 100 100">${rays}
    <circle cx="50" cy="50" r="27" fill="${YEL}" stroke="${INK}" stroke-width="3"/>
    <circle cx="50" cy="50" r="22" fill="none" stroke="#e8602a" stroke-width="1.6" stroke-dasharray="2 3"/>
    <path d="M38 46 q4 -5 8 0 M54 46 q4 -5 8 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M50 48 v7" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="36" cy="56" r="4" fill="#e8602a"/><circle cx="64" cy="56" r="4" fill="#e8602a"/>
    <path d="M41 59 q9 9 18 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>`;
};
const friezeSvg = () => {
  let s = `<svg viewBox="0 0 350 20"><rect width="350" height="20" fill="${RED}"/>`;
  for (let i = 0; i < 35; i++) {
    const x = i * 10;
    s += `<path d="M${x} 20 L${x + 5} 8 L${x + 10} 20Z" fill="${i % 2 ? YEL : WHITE}"/><circle cx="${x + 5}" cy="4" r="2.2" fill="${BLUE}"/>`;
  }
  return s + `<rect width="350" height="1.4" fill="${INK}"/><rect y="18.6" width="350" height="1.4" fill="${INK}"/></svg>`;
};
const towelSvg = () => {
  let band = (y: number) => {
    let s = `<rect y="${y}" width="40" height="6" fill="${RED}"/>`;
    for (let x = 2; x < 40; x += 4) s += `<path d="M${x} ${y + 3} l2 -2 l2 2 l-2 2z" fill="${WHITE}"/>`;
    return s;
  };
  let fringe = "";
  for (let x = 3; x < 40; x += 4) fringe += `<path d="M${x} 55 v9" stroke="${WHITE}" stroke-width="2.2"/>`;
  return `<svg viewBox="0 0 40 64"><rect width="40" height="56" fill="${WHITE}" stroke="#b9a984" stroke-width="1"/>
    ${band(4)}${band(46)}
    <path d="M20 14 l9 12 l-9 12 l-9 -12z" fill="${RED}"/><path d="M20 20 l4 6 l-4 6 l-4 -6z" fill="${WHITE}"/>
    <path d="M20 14 v-3 M29 26 h3 M11 26 h-3 M20 38 v3" stroke="${RED}" stroke-width="2.4"/>${fringe}</svg>`;
};
const SUN = svg(sunSvg(), { size: 256 });
const FRIEZE = svg(friezeSvg(), { size: 1024 });
const TOWEL = svg(towelSvg(), { size: 192 });
const WINDOW = svg(
  `<svg viewBox="0 0 50 66"><defs><radialGradient id="g" cx=".5" cy=".6" r=".75"><stop offset="0" stop-color="#fff2a8"/><stop offset=".6" stop-color="#ffc247"/><stop offset="1" stop-color="#e8872a"/></radialGradient></defs>
  <rect width="50" height="66" rx="3" fill="url(#g)"/>
  <rect x="23" width="4" height="66" fill="#3a2010"/><rect y="30" width="50" height="4" fill="#3a2010"/>
  <path d="M0 0 H12 Q8 18 12 36 Q6 30 0 36Z" fill="${RED}"/><path d="M50 0 H38 Q42 18 38 36 Q44 30 50 36Z" fill="${RED}"/>
  <path d="M32 66 q2 -12 4 0 M36 66 l1 -8 l3 8Z" fill="#6a3a14"/>
  <rect x="1" y="1" width="48" height="64" rx="3" fill="none" stroke="${INK}" stroke-width="2.4"/></svg>`,
  { size: 192 },
);
const ROUNDWIN = svg(
  `<svg viewBox="0 0 100 100"><defs><radialGradient id="r" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff2a8"/><stop offset=".7" stop-color="#ffc247"/><stop offset="1" stop-color="#e8872a"/></radialGradient></defs>
  <circle cx="50" cy="50" r="47" fill="url(#r)" stroke="${INK}" stroke-width="5"/>
  <path d="M50 3 V97 M3 50 H97 M17 17 L83 83 M83 17 L17 83" stroke="#3a2010" stroke-width="4"/>
  <circle cx="50" cy="50" r="9" fill="${RED}" stroke="#3a2010" stroke-width="3"/></svg>`,
  { size: 192 },
);
const SHUTTER = svg(
  `<svg viewBox="0 0 20 70"><rect width="20" height="70" fill="${BLUE}" stroke="${INK}" stroke-width="1.6"/>
  <rect x="2" y="2" width="16" height="66" fill="none" stroke="${WHITE}" stroke-width="1.2"/>
  <path d="M10 66 V14" stroke="#2f7a2a" stroke-width="1.6"/><path d="M10 52 q-6 -2 -6 -8 q6 0 6 8 M10 40 q6 -2 6 -8 q-6 0 -6 8" fill="#3f9a38"/>
  <circle cx="10" cy="12" r="5.5" fill="${RED}" stroke="${INK}" stroke-width="1"/><circle cx="10" cy="12" r="2.2" fill="${YEL}"/>
  <circle cx="6" cy="30" r="3.4" fill="${YEL}" stroke="${INK}" stroke-width=".8"/><circle cx="14" cy="24" r="3.4" fill="${WHITE}" stroke="${INK}" stroke-width=".8"/>
  <path d="M3 6 l2 -3 l2 3 M13 6 l2 -3 l2 3" stroke="${WHITE}" stroke-width="1" fill="none"/></svg>`,
  { size: 160 },
);
const DOOR = svg(
  `<svg viewBox="0 0 40 70"><defs><clipPath id="c"><path d="M0 70V20 L3.5 10 L11 3.5 L20 1 L29 3.5 L36.5 10 L40 20 V70Z"/></clipPath></defs>
  <g clip-path="url(#c)">
   <g stroke="#2a1608" stroke-width="1" opacity=".6"><path d="M10 0V70M20 0V70M30 0V70"/></g>
   <path d="M0 18 H40 M0 54 H40" stroke="#1d1a1c" stroke-width="4"/>
   <path d="M4 18 q-5 -7 1 -10 M36 18 q5 -7 -1 -10 M4 54 q-5 7 1 10 M36 54 q5 7 -1 10" stroke="#1d1a1c" stroke-width="2.4" fill="none"/>
   <g fill="#8c8a90"><circle cx="8" cy="18" r="1"/><circle cx="16" cy="18" r="1"/><circle cx="24" cy="18" r="1"/><circle cx="32" cy="18" r="1"/>
   <circle cx="8" cy="54" r="1"/><circle cx="16" cy="54" r="1"/><circle cx="24" cy="54" r="1"/><circle cx="32" cy="54" r="1"/></g>
   <g transform="translate(20 35)"><g fill="${RED}" stroke="${INK}" stroke-width=".8"><circle cx="0" cy="-6" r="3.8"/><circle cx="6" cy="0" r="3.8"/><circle cx="0" cy="6" r="3.8"/><circle cx="-6" cy="0" r="3.8"/></g><circle r="3.4" fill="${YEL}" stroke="${INK}" stroke-width=".8"/></g>
   <circle cx="31" cy="38" r="3.4" fill="none" stroke="#1d1a1c" stroke-width="1.6"/>
  </g></svg>`,
  { size: 256 },
);
const FEATHER = svg(
  `<svg viewBox="0 0 40 80"><defs><linearGradient id="f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8a8a8a"/><stop offset=".6" stop-color="#d8d8d8"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
  <path d="M20 79 C4 60 2 30 20 2 C38 30 36 60 20 79Z" fill="url(#f)" stroke="#555555" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M20 78 L20 8" stroke="#666666" stroke-width="2.4"/>
  <path d="M20 60 L9 46 M20 48 L8 32 M20 36 L12 22 M20 60 L31 46 M20 48 L32 32 M20 36 L28 22" stroke="#777777" stroke-width="2" fill="none"/></svg>`,
  { size: 128 },
);
const TUFT = svg(
  `<svg viewBox="0 0 40 40"><g stroke="#244d16" stroke-width="1.2" stroke-linejoin="round">
  <path d="M4 40 Q7 22 2 6 Q13 20 13 40Z" fill="#4f8f2c"/><path d="M12 40 Q14 18 12 2 Q22 18 22 40Z" fill="#6aa83a"/>
  <path d="M20 40 Q24 20 30 8 Q31 24 29 40Z" fill="#4f8f2c"/><path d="M28 40 Q32 28 38 18 Q38 30 36 40Z" fill="#7bb840"/></g></svg>`,
  { size: 96 },
);
const TEETH = svg(
  `<svg viewBox="0 0 64 20"><rect width="64" height="20" rx="3" fill="#efe5cc" stroke="${INK}" stroke-width="2.4"/>
  <path d="M10 2V18M21 2V18M32 2V18M43 2V18M54 2V18 M2 10 H62" stroke="${INK}" stroke-width="1.8"/></svg>`,
  { size: 96 },
);

// ---------------------------------------------------------------------------------------------------------------
// Outline helpers
type O2 = [number, number];
const rect = (hw: number, hh: number): O2[] => [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]];
const sym = (half: number[][]): O2[] => [
  ...half.map(([x, y]) => [x, y] as O2),
  ...half
    .slice(1)
    .reverse()
    .map(([x, y]) => [-x, y] as O2),
];
const OGEE = [[0, 1], [0.12, 0.8], [0.28, 0.6], [0.5, 0.43], [0.78, 0.29], [0.95, 0.12], [1, 0]];
const ogee = (w: number, h: number) => sym(OGEE.map(([x, y]) => [x * w, y * h]));
const shingle = (top: number): O2[] => {
  const N = 17;
  const pts: O2[] = [];
  for (let k = 0; k < N; k++)
    for (const t of [0, 0.25, 0.5, 0.75]) pts.push([-2.1 + (k + t) * (4.2 / N), -0.09 * Math.sin(Math.PI * t)]);
  pts.push([2.1, 0], [2.1, top], [-2.1, top]);
  return pts;
};
const wallFrame = (origin: THREE.Vector3, n: THREE.Vector3) => {
  const t = new THREE.Vector3().crossVectors(UP, n).normalize();
  return {
    t,
    n,
    p: (u: number, v: number, w: number) =>
      origin.clone().addScaledVector(t, u).addScaledVector(UP, v).addScaledVector(n, w),
  };
};

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "baba_yaga_hut", paintSize: 2048 });
  const R = rng(11);

  // Skeleton: ground root, the hut body, then chicken legs and toes.
  const ground = b.joint("ground", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: ground, at: [0, 2.6, 0], dir: [0, 1, 0], role: "spine" });

  const box = (w: number, h: number, d: number, color: any, bone: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...o });
  const cyl = (r: number, len: number, seg: number, color: any, bone: any, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { bone, at, dir, flat: true, ...o });

  // ------------------------------------------------------------------ ground
  const groundPart = b.lathe(
    [[0, 0], [5.2, 0], [5.4, 0.07], [5.15, GY], [2, GY], [0, GY]],
    { at: [0, 0, 0], bone: ground, color: GROUND_P, segments: 28 },
  );
  const tufts = b
    .surface(groundPart)
    .scatter(150, {
      rng: R,
      minDist: 0.3,
      filter: (h: any) => h.n.y > 0.8 && Math.hypot(h.at.x, h.at.z) > 1.8 && !(Math.abs(h.at.x) < 0.8 && h.at.z > 1.5),
    });
  b.cards(tufts, TUFT, { size: [0.26, 0.3], lean: 8, vary: 0.35, rng: R, cross: true, bone: ground });

  // mushrooms (fly agarics)
  const mush: number[][] = [[2.4, 2.2, 1], [2.75, 1.6, 0.7], [-2.2, 2.3, 0.9], [-2.65, 1.5, 1.2], [1.9, -2.4, 0.8], [-1.7, -2.7, 1.1]];
  mush.forEach(([x, z, k], i) => {
    const h = 0.24 * k;
    cyl(0.045 * k, h, 6, "#efe3c4", ground, [x, GY + h / 2 - 0.01, z], [0, 1, 0]);
    b.part(new THREE.SphereGeometry(0.13 * k, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), spots("#d1281c", "#fff3dc", { size: 0.08 * k, amount: 0.6, seed: i }), {
      bone: ground,
      at: [x, GY + h - 0.02, z],
      scale: [1, 0.75, 1],
      flat: true,
    });
  });

  // ------------------------------------------------------------------ chicken legs
  const LEG_R = [0.3, 0.2, 0.15, 0.13, 0.12, 0.11];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipP = [s * 0.95, 2.4, 0.05];
    const footP = [s * 1.0, GY + 0.11, 0.4];
    const pts = limb(hipP, footP, [0.85, 1.0, 0.7], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      contact: [footP[0], GY, footP[2]],
    });
    b.sweep(leg, LEG_R, { color: LEG_P });
    const foot: any = leg.tip;

    // feathered "trousers"
    const puff = b.part(new THREE.SphereGeometry(0.5, 8, 6), PUFF_P, {
      bone: leg.joints[0],
      at: [s * 0.95, 2.28, 0.05],
      scale: [1, 1.25, 1.05],
      flat: true,
    });
    const hits = b.surface(puff).scatter(34, { rng: R, minDist: 0.1, filter: (h: any) => h.n.y > -0.3 });
    const fOpts = { size: [0.22, 0.4] as [number, number], lean: 72, bend: 20, flow: [0, -1, 0.1], vary: 0.25, rng: R };
    b.cards(hits.filter((_h: any, k: number) => k % 2 === 0), FEATHER, { ...fOpts, color: RUST });
    b.cards(hits.filter((_h: any, k: number) => k % 2 === 1), FEATHER, { ...fOpts, color: OCHRE });

    // spur
    b.spike(offset(pts[2], [0, 0, -1], 0.1), [0, 0.35, -1], 0.3, 0.055, { color: CLAW, bone: leg.joints[2] });
    // foot pad
    b.part(new THREE.SphereGeometry(0.17, 7, 5), LEG_FLAT, { bone: foot, at: footP, scale: [1, 0.75, 1.1], flat: true });

    // toes: three forward, one back
    [-38, 0, 38, 180].forEach((deg, i) => {
      const a = (deg * Math.PI) / 180;
      const d = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
      const len = i === 3 ? 0.6 : 1.0;
      const f0 = new THREE.Vector3(footP[0], footP[1], footP[2]);
      const f1 = f0.clone().addScaledVector(d, len * 0.5);
      const f2 = f0.clone().addScaledVector(d, len);
      const toe = b.chain(`toe${i + 1}${side}`, [f0, f1, f2], {
        parent: foot,
        names: [`toe${i + 1}${side}a`, `toe${i + 1}${side}b`],
        role: "digit",
      });
      b.sweep(toe, [0.115, 0.085], { color: LEG_P });
      b.part(new THREE.SphereGeometry(0.1, 6, 4), LEG_FLAT, { bone: toe.joints[0], at: f1, flat: true });
      b.spike(f2, [d.x, -0.25, d.z], 0.34, 0.075, { color: CLAW, bone: toe.joints[1] });
    });
  }

  // ------------------------------------------------------------------ platform and logs
  box(3.5, 0.2, 3.5, "#ffffff", hips, [0, 2.6, 0], { texture: FRIEZE });
  box(1.8, 0.2, 0.8, WOOD_X, hips, [0, 2.6, 2.1]);
  for (const z of [-1.1, 1.1]) cyl(0.09, 3.9, 6, WOOD_DARK, hips, [0, 2.4, z], [1, 0, 0]);
  box(2.9, 1.9, 2.9, DARK_IN, hips, [0, FLOOR + 0.95, 0]);

  const LOG = 0.14;
  const PITCH = 0.27;
  for (let i = 0; i < 7; i++) {
    const y = FLOOR + LOG + i * PITCH;
    const longX = i % 2 === 0;
    for (const s of [1, -1]) {
      cyl(LOG, longX ? 3.5 : 2.72, 8, WOOD_X, hips, [0, y, s * 1.36], [1, 0, 0]);
      cyl(LOG, longX ? 2.72 : 3.5, 8, WOOD_Z, hips, [s * 1.36, y, 0], [0, 0, 1]);
    }
  }
  for (const s of [1, -1]) cyl(0.1, 4.0, 6, WOOD_DARK, hips, [s * 1.5, 4.7, 0], [0, 0, 1]);

  // ------------------------------------------------------------------ wall furniture
  const onWall = (geo: THREE.BufferGeometry, color: any, wf: ReturnType<typeof wallFrame>, u: number, v: number, w: number, o: any = {}) =>
    b.part(geo, color, { bone: hips, at: wf.p(u, v, w), dir: arr(wf.n), axis: "z", ...o });
  const flatShape = (outline: O2[], color: any, wf: ReturnType<typeof wallFrame>, u: number, v: number, w: number, th: number) =>
    b.extrude(outline, { at: wf.p(u, v, w), x: arr(wf.t), y: [0, 1, 0], thickness: th, color, bone: hips });

  const windowAt = (cx: number, cy: number, cz: number, n: THREE.Vector3, shutters: boolean) => {
    const wf = wallFrame(new THREE.Vector3(cx, cy, cz), n);
    flatShape(rect(0.32, 0.42), RED, wf, 0, 0, 0, 0.07);
    flatShape(ogee(0.38, 0.3), WHITE, wf, 0, 0.38, -0.005, 0.06);
    flatShape(ogee(0.24, 0.18), RED, wf, 0, 0.42, 0.03, 0.06);
    onWall(new THREE.BoxGeometry(0.8, 0.06, 0.16), WHITE, wf, 0, -0.45, 0.07);
    glow(onWall(new THREE.PlaneGeometry(0.5, 0.66), "#ffffff", wf, 0, 0, 0.04, { texture: WINDOW }), 1.1);
    if (shutters)
      for (const sx of [1, -1]) {
        const ang = (66 * Math.PI) / 180;
        const d = wf.t.clone().multiplyScalar(sx * Math.cos(ang)).addScaledVector(wf.n, Math.sin(ang));
        const hinge = wf.p(sx * 0.34, 0, 0.05);
        b.part(new THREE.BoxGeometry(0.2, 0.74, 0.03), "#ffffff", {
          bone: hips,
          at: hinge.clone().addScaledVector(d, 0.1),
          dir: arr(d),
          axis: "x",
          texture: SHUTTER,
        });
      }
  };
  const FRONT = new THREE.Vector3(0, 0, 1);
  windowAt(1.0, 3.55, 1.5, FRONT, true);
  windowAt(-1.0, 3.55, 1.5, FRONT, true);
  windowAt(1.5, 3.6, 0, new THREE.Vector3(1, 0, 0), true);
  windowAt(-1.5, 3.6, 0, new THREE.Vector3(-1, 0, 0), true);
  windowAt(0, 3.6, -1.5, new THREE.Vector3(0, 0, -1), false);

  // door with kokoshnik crest
  {
    const wf = wallFrame(new THREE.Vector3(0, 0, 1.5), FRONT);
    flatShape(
      [[-0.52, 0], [0.52, 0], [0.52, 1.05], [0.46, 1.25], [0.32, 1.43], [0.15, 1.52], [0, 1.54], [-0.15, 1.52], [-0.32, 1.43], [-0.46, 1.25], [-0.52, 1.05]],
      RED, wf, 0, FLOOR, 0, 0.06,
    );
    flatShape(
      [[-0.4, 0], [0.4, 0], [0.4, 1.0], [0.33, 1.2], [0.18, 1.33], [0, 1.38], [-0.18, 1.33], [-0.33, 1.2], [-0.4, 1.0]],
      DOOR_WOOD, wf, 0, FLOOR, 0.03, 0.08,
    );
    onWall(new THREE.PlaneGeometry(0.8, 1.4), "#ffffff", wf, 0, FLOOR + 0.7, 0.075, { texture: DOOR });
    flatShape(ogee(0.62, 0.5), WHITE, wf, 0, 4.02, 0.0, 0.06);
    flatShape(ogee(0.46, 0.36), RED, wf, 0, 4.06, 0.04, 0.06);
    onWall(new THREE.SphereGeometry(0.05, 6, 4), YEL, wf, 0, 4.3, 0.09);
  }

  // ------------------------------------------------------------------ porch, ladder, lantern, towel
  const post = (x: number) => {
    cyl(0.06, 1.0, 6, RED, hips, [x, 3.2, 2.35], [0, 1, 0]);
    b.part(new THREE.SphereGeometry(0.08, 6, 4), YEL, { bone: hips, at: [x, 3.74, 2.35], flat: true });
  };
  post(0.88);
  post(-0.88);
  for (const s of [1, -1]) {
    b.rod([s * 0.88, 3.4, 2.35], [s * 0.88, 3.4, 1.55], 0.04, WHITE, { bone: hips });
    b.rod([s * 0.88, 3.05, 2.35], [s * 0.88, 3.05, 1.55], 0.03, WHITE, { bone: hips });
    b.rod([s * 0.88, 3.4, 2.35], [s * 0.42, 3.4, 2.35], 0.04, WHITE, { bone: hips });
    b.rod([s * 0.88, 3.05, 2.35], [s * 0.42, 3.05, 2.35], 0.03, WHITE, { bone: hips });
  }
  box(0.4, 0.6, 0.012, "#ffffff", hips, [-0.65, 3.08, 2.4], { texture: TOWEL });
  // lantern
  b.rod([0.88, 3.7, 2.35], [0.88, 3.7, 2.72], 0.025, CLAW, { bone: hips });
  glow(b.part(new THREE.CylinderGeometry(0.09, 0.07, 0.24, 6), "#ffcf5a", { bone: hips, at: [0.88, 3.5, 2.72], flat: true }), 1.5);
  b.part(new THREE.ConeGeometry(0.12, 0.1, 6), CLAW, { bone: hips, at: [0.88, 3.67, 2.72], flat: true });
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 6), CLAW, { bone: hips, at: [0.88, 3.37, 2.72], flat: true });
  // ladder
  const top: number[][] = [[0.42, 2.78, 2.45], [-0.42, 2.78, 2.45]];
  const bot: number[][] = [[0.5, GY + 0.03, 3.45], [-0.5, GY + 0.03, 3.45]];
  b.rod(top[0], bot[0], 0.05, "#6b4524", { bone: ground });
  b.rod(top[1], bot[1], 0.05, "#6b4524", { bone: ground });
  for (let i = 1; i <= 9; i++) b.rod(lerp(top[0], bot[0], i / 10), lerp(top[1], bot[1], i / 10), 0.035, "#9a6a38", { bone: ground });

  // ------------------------------------------------------------------ gables
  for (const sz of [1, -1]) {
    const wf = wallFrame(new THREE.Vector3(0, 0, sz * 1.62), new THREE.Vector3(0, 0, sz));
    flatShape([[-1.5, 4.6], [1.5, 4.6], [1.5, 4.8], [0, 6.3], [-1.5, 4.8]], WOOD_PLANK, wf, 0, 0, 0, 0.14);
    cyl(0.42, 0.06, 12, RED, hips, arr(wf.p(0, 5.0, 0.09)), arr(wf.n));
    glow(onWall(new THREE.CircleGeometry(0.3, 14), "#ffffff", wf, 0, 5.0, 0.125, { texture: ROUNDWIN }), 1.1);
    onWall(new THREE.CircleGeometry(0.17, 12), "#ffffff", wf, 0, 5.78, 0.075, { texture: SUN });
    if (sz > 0)
      for (let k = 0; k < 11; k++) {
        const a = ((-15 + k * 21) * Math.PI) / 180;
        const d = wf.t.clone().multiplyScalar(Math.cos(a)).addScaledVector(UP, Math.sin(a));
        b.spike(wf.p(Math.cos(a) * 0.44, 5.0 + Math.sin(a) * 0.44, 0.075), d, 0.16, 0.055, { color: YEL, bone: hips });
      }
  }

  // ------------------------------------------------------------------ roof
  const inv = Math.SQRT1_2;
  for (const sx of [1, -1]) {
    const u = new THREE.Vector3(-sx * inv, inv, 0);
    const nrm = new THREE.Vector3(sx * inv, inv, 0);
    const E = new THREE.Vector3(sx * 2.05, 4.35, 0);
    b.extrude([[-2.1, 0], [2.1, 0], [2.1, 2.9], [-2.1, 2.9]], {
      at: E.clone().addScaledVector(nrm, -0.1),
      x: [0, 0, 1],
      y: arr(u),
      thickness: 0.1,
      color: WOOD_DARK,
      bone: hips,
    });
    for (let j = 0; j < 12; j++) {
      const sd = 0.24 * j;
      const top = Math.min(0.42, 2.9 - sd + 0.02);
      b.extrude(shingle(top), {
        at: E.clone().addScaledVector(u, sd).addScaledVector(nrm, 0.02 + 0.007 * j),
        x: [0, 0, 1],
        y: arr(u),
        thickness: 0.05,
        color: SHINGLES[j % 4],
        bone: hips,
      });
    }
    // lace bargeboards on both gable ends
    const lace: O2[] = [[0, 0.04], [0, -0.12]];
    for (let k = 0; k < 13; k++) lace.push([0.11 + 0.22 * k, -0.3], [0.22 * (k + 1), -0.12]);
    lace.push([2.86, 0.04]);
    for (const sz of [1, -1])
      b.extrude(lace, {
        at: [0, 6.36, sz * 2.14],
        x: [sx * inv, -inv, 0],
        y: [sx * inv, inv, 0],
        thickness: 0.06,
        color: LACE,
        bone: hips,
      });
  }
  // purlin ends under the eaves
  for (const x of [0.55, -0.55, 1.1, -1.1, 1.65, -1.65]) cyl(0.07, 4.5, 6, WOOD_DARK, hips, [x, RIDGE - Math.abs(x) - 0.28, 0], [0, 0, 1]);

  // ridge beam, horse head and flame tail
  cyl(0.15, 4.5, 8, RIDGE_P, hips, [0, 6.47, 0], [0, 0, 1]);
  b.extrude(
    [[-0.25, -0.05], [-0.05, 0.32], [-0.02, 0.58], [0.08, 0.36], [0.3, 0.28], [0.52, 0.05], [0.5, -0.07], [0.32, -0.05], [0.22, -0.22], [0.05, -0.3], [-0.1, -0.35]],
    { at: [0, 6.5, 2.2], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.16, color: RED, bone: hips },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.035, 6, 4), INK, { bone: hips, at: [s * 0.085, 6.65, 2.4], flat: true });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), YEL, { bone: hips, at: [s * 0.083, 6.5, 2.6], flat: true });
  }
  b.extrude(
    [[0, 0], [0.3, 0.05], [0.5, 0.3], [0.38, 0.28], [0.42, 0.5], [0.28, 0.4], [0.25, 0.62], [0.1, 0.42], [0, 0.5]],
    { at: [0, 6.45, -2.2], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.12, color: YEL, bone: hips },
  );

  // chimney and smoke
  box(0.55, 1.7, 0.55, CHIMNEY_P, hips, [-0.95, 5.95, -0.9]);
  box(0.75, 0.14, 0.75, BONE_D, hips, [-0.95, 6.87, -0.9]);
  box(0.4, 0.02, 0.4, INK, hips, [-0.95, 6.95, -0.9]);
  SMOKE.forEach((c, i) =>
    b.part(new THREE.IcosahedronGeometry(0.28 + 0.1 * i, 1), c, {
      bone: hips,
      at: [-0.95 - 0.12 * i, 7.35 + 0.5 * i, -0.9 - 0.18 * i],
      flat: true,
    }),
  );

  // ------------------------------------------------------------------ skull fence
  const posts: THREE.Vector3[] = [];
  const RF = 4.2;
  for (let k = 0; k < 9; k++) {
    const th = ((70 + k * (220 / 8)) * Math.PI) / 180;
    const pos = new THREE.Vector3(RF * Math.sin(th), 0, RF * Math.cos(th));
    posts.push(pos);
    const fwd = new THREE.Vector3(-Math.sin(th), 0, -Math.cos(th));
    const right = new THREE.Vector3().crossVectors(UP, fwd).normalize();
    const sk = pos.clone().add(new THREE.Vector3(0, 2.4, 0));
    const Lp = (u: number, v: number, w: number) => sk.clone().addScaledVector(right, u).addScaledVector(UP, v).addScaledVector(fwd, w);
    const F = arr(fwd);
    cyl(0.085, 2.3, 6, WOOD_POST, ground, [pos.x, GY + 1.0, pos.z], [0, 1, 0]);
    b.part(new THREE.SphereGeometry(0.22, 8, 6), BONE, { bone: ground, at: arr(sk), dir: F, axis: "z", scale: [0.92, 0.95, 1.05], flat: true });
    b.part(new THREE.BoxGeometry(0.26, 0.11, 0.22), BONE, { bone: ground, at: arr(Lp(0, -0.16, 0.06)), dir: F, axis: "z" });
    b.part(new THREE.PlaneGeometry(0.22, 0.07), "#ffffff", { bone: ground, at: arr(Lp(0, -0.19, 0.172)), dir: F, axis: "z", texture: TEETH });
    b.part(new THREE.BoxGeometry(0.22, 0.07, 0.18), BONE_D, { bone: ground, at: arr(Lp(0, -0.285, 0.04)), dir: F, axis: "z" });
    b.part(new THREE.SphereGeometry(0.03, 5, 4), INK, { bone: ground, at: arr(Lp(0, -0.1, 0.215)), dir: F, axis: "z", scale: [1, 1.5, 0.6] });
    for (const s of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.07, 6, 5), INK, { bone: ground, at: arr(Lp(s * 0.09, -0.01, 0.185)), dir: F, axis: "z", scale: [1, 1.15, 0.7] });
      glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), EMBER, { bone: ground, at: arr(Lp(s * 0.09, -0.01, 0.195)) }), 1.7);
    }
  }
  for (let k = 0; k < posts.length - 1; k++)
    for (const y of [GY + 0.9, GY + 1.5]) {
      const a = new THREE.Vector3(posts[k].x, y, posts[k].z);
      const c = new THREE.Vector3(posts[k + 1].x, y, posts[k + 1].z);
      b.rod(a, c, 0.04, "#6b4524", { bone: ground });
    }

  return b.root;
}
