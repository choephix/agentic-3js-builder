import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { Builder, OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { aim, DEG, rng } from "../src/math";
import { catmull, polyline, spiral } from "../src/path";
import { mix, noise, paint, resolve, rgb, smoothstep } from "../src/paint";
import type { ColorInput, Rgb } from "../src/paint";
import type { Fill } from "../src/context";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { cel, zigzag } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Aurora Sky Galleon",
  description:
    "A swan-prowed flying galleon hovering half a metre up: navy and crimson cel-shaded hull with gold filigree, three masts of cream sails, a winged phoenix figurehead, feathered wing-fins and two ducted propellers.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

type P3 = [number, number, number];
const P = (x: number, y: number, z: number): P3 => [x, y, z];
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const fract = (x: number) => x - Math.floor(x);

// ---------------------------------------------------------------- palette (all cel-shaded, lit tone + hue-shifted shadow)
const LIGHT: P3 = [0, 0.75, 0.45];
const C = (lit: ColorInput, shadow?: ColorInput) => cel(lit, shadow, { light: LIGHT, threshold: -0.02 });
const SOFT_LIGHT = new THREE.Vector3(0, 0.45, 0.55).normalize();
/** Cloth cel: two tones, with a lavender shadow only on faces turned well away from the light. */
const softCel = (inner: ColorInput) =>
  paint((p, n) => {
    const base = resolve(inner, p, n);
    return n.dot(SOFT_LIGHT) > -0.15 ? base : mix(base, rgb("#c3b2ee"), 0.4);
  });
const NAVY = rgb("#2d4a9a");
const NAVY_D = rgb("#1b2b6a");
const CRIM = rgb("#dc3a52");
const GOLD = rgb("#ffd24d");
const GOLD_D = rgb("#cf8a22");
const CREAM = rgb("#fff7e6");
const WHITE = rgb("#fffdf6");
const LAV = rgb("#e6d3ee");
const TEAL = rgb("#34dccb");
const SKY = rgb("#bff3f0");
const WOODC = rgb("#cf8a52");
const DECKC = rgb("#ebba7c");
const ROPE = "#d4b27c";

const GOLDM = C("#ffd24d", "#cf7f22");
const WOODM = C("#cf8a52", "#8f4f4c");
const CRIMM = C("#dc3a52", "#8f1f50");
const IRONM = C("#5a5780", "#363358");
const DECKM = C("#ebba7c", "#c4806a");

// ---------------------------------------------------------------- geometry helpers
const V = (p: P3) => new THREE.Vector3(p[0], p[1], p[2]);

/** Frustum rod between two model-space points (4..8 sided), vertices already in model space. */
function rodG(a: P3, b: P3, r: number, sides = 5, r2?: number) {
  const d = V(b).sub(V(a));
  const g = new THREE.CylinderGeometry(r2 ?? r, r, d.length(), sides, 1, r < 0.04);
  g.applyQuaternion(aim(d.normalize()));
  const m = V(a).add(V(b)).multiplyScalar(0.5);
  g.translate(m.x, m.y, m.z);
  return g;
}

/** Box between two points: w across, h the other side. */
function beamG(a: P3, b: P3, w: number, h: number, up?: P3) {
  const d = V(b).sub(V(a));
  const g = new THREE.BoxGeometry(w, d.length(), h);
  g.applyQuaternion(aim(d.normalize(), up));
  const m = V(a).add(V(b)).multiplyScalar(0.5);
  g.translate(m.x, m.y, m.z);
  return g;
}

function xf(g: THREE.BufferGeometry, at: P3, rot: P3 = [0, 0, 0], scale: P3 = [1, 1, 1]) {
  const m = new THREE.Matrix4().compose(
    V(at),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, "YXZ")),
    V(scale),
  );
  return g.applyMatrix4(m);
}

/** Small trim batches use flat colours: they cost no paint-sheet area, which keeps the big painted surfaces sharp. */
const FLAT_OF = new Map<Fill, string>([
  [GOLDM, "#f6c540"],
  [WOODM, "#c47d4a"],
  [IRONM, "#5b5880"],
  [DECKM, "#e6b074"],
]);

class Batch {
  private g: THREE.BufferGeometry[] = [];
  private color: Fill;
  constructor(
    private b: Builder,
    color: Fill,
    private bone: Joint,
    private name: string,
    private flat = true,
  ) {
    this.color = FLAT_OF.get(color) ?? color;
  }
  add(geo: THREE.BufferGeometry) {
    const n = geo.index ? geo.toNonIndexed() : geo;
    for (const k of Object.keys(n.attributes)) if (k !== "position" && k !== "normal" && k !== "uv") n.deleteAttribute(k);
    this.g.push(n);
    return this;
  }
  done() {
    if (!this.g.length) return null;
    const made = this.b.part(mergeGeometries(this.g, false)!, this.color, {
      bone: this.bone,
      at: [0, 0, 0],
      name: this.name,
      flat: this.flat,
    });
    this.g = [];
    return made;
  }
}

// ---------------------------------------------------------------- hull station tables (stern -> bow)
const ZS = [-6.2, -4.6, -3.0, -1.4, 0.2, 1.8, 3.4, 4.9, 6.1, 6.9, 7.5];
const WG = [1.85, 2.15, 2.34, 2.43, 2.45, 2.4, 2.2, 1.75, 1.15, 0.6, 0.14]; // gunwale half width
const YT = [3.95, 3.6, 3.25, 2.85, 2.64, 2.7, 2.95, 3.4, 3.85, 4.15, 4.4]; // gunwale height
const KEEL_LIFT = -0.045;
const YK = [2.15, 1.45, 0.95, 0.68, 0.62, 0.66, 0.92, 1.5, 2.35, 3.3, 4.15].map((y, i) => (i >= 3 && i <= 5 ? y + KEEL_LIFT : y));
const ULV = [0, 0.22, 0.5, 0.76, 1];
const FXV = [0, 0.52, 0.88, 1.0, 0.93];
const WMAX = 0.93;

function lerpArr(arr: number[], z: number) {
  if (z <= ZS[0]) return arr[0];
  if (z >= ZS[ZS.length - 1]) return arr[arr.length - 1];
  let i = 0;
  while (z > ZS[i + 1]) i++;
  const t = (z - ZS[i]) / (ZS[i + 1] - ZS[i]);
  return arr[i] + (arr[i + 1] - arr[i]) * t;
}
function fxAt(u: number) {
  u = clamp(u, 0, 1);
  for (let k = 0; k < ULV.length - 1; k++)
    if (u <= ULV[k + 1]) return FXV[k] + ((FXV[k + 1] - FXV[k]) * (u - ULV[k])) / (ULV[k + 1] - ULV[k]);
  return FXV[FXV.length - 1];
}
function halfWidthAt(z: number, y: number) {
  const yk = lerpArr(YK, z);
  const yt = lerpArr(YT, z);
  return (lerpArr(WG, z) / WMAX) * fxAt((y - yk) / Math.max(0.05, yt - yk));
}
const sheerAt = (z: number) => lerpArr(YT, z);
/** Hull line at fraction u of the depth, as a path-ready point list, stern to bow. */
function hullLine(s: number, u: number, dx = 0, dy = 0): P3[] {
  return ZS.map((z, i) => P(s * ((WG[i] / WMAX) * fxAt(u) + (u > 0 ? dx : 0)), YK[i] + u * (YT[i] - YK[i]) + dy, z));
}

// ---------------------------------------------------------------- paints
const hullPaint = cel(
  paint((p, n) => {
    const yk = lerpArr(YK, p.z);
    const yt = lerpArr(YT, p.z);
    const d = Math.max(0.3, yt - yk);
    const u = (p.y - yk) / d;
    const inner = n.x * (p.x >= 0 ? 1 : -1) < -0.4;
    const rowH = 0.2;
    const row = (p.y - yk) / rowH;
    const rf = fract(row);
    const seam = rf < 0.07;
    const butt = Math.abs(fract((p.z + Math.floor(row) * 0.91) / 1.7) - 0.5) > 0.488;
    if (inner) {
      if (seam || butt) return rgb("#a5604f");
      return u > 0.97 ? GOLD : rgb("#d9955a");
    }
    // keel strip
    if (u < 0.2 && Math.abs(p.x) < 0.1) return GOLD_D;
    if (u > 0.965) return GOLD;
    if (u > 0.8 && u < 0.835) return GOLD;
    if (u > 0.53 && u < 0.567) return GOLD;
    if (u >= 0.567 && u <= 0.8) {
      if (Math.abs(u - 0.585) < 0.008 || Math.abs(u - 0.782) < 0.008) return GOLD;
      return mix(CRIM, rgb("#c32d5a"), (seam ? 0.6 : 0) + 0.2 * noise(p, 0.4, 3));
    }
    const base = u > 0.8 ? NAVY : mix(NAVY, NAVY_D, 0.35 * smoothstep(0.3, 0.0, u));
    // sky-foam waves low on the hull
    const wave = u < 0.45 && Math.abs(u - (0.2 + 0.035 * Math.sin(p.z * 3.1 + 0.4))) < 0.012;
    if (wave) return SKY;
    const wave2 = u < 0.45 && u > 0.09 && Math.abs(u - (0.3 + 0.03 * Math.sin(p.z * 3.1 + 2.2))) < 0.008;
    if (wave2) return mix(SKY, NAVY, 0.45);
    if (seam || butt) return mix(base, NAVY_D, 0.65);
    return base;
  }),
  undefined,
  { light: LIGHT, threshold: -0.3 },
);

const deckPaint = C(
  paint((p, n, s) => {
    if (n.y < 0.5) return rgb("#9a5d46");
    const x = s[0];
    const k = Math.floor(x / 0.3 + 200);
    const fx = fract(x / 0.3);
    if (Math.abs(x) < 0.07) return GOLD;
    if (fx < 0.06) return rgb("#b9744e");
    const butt = Math.abs(fract((s[1] + k * 0.83) / 2.3) - 0.5) > 0.487;
    if (butt) return rgb("#b9744e");
    const tone = k % 3 === 0 ? 0 : k % 3 === 1 ? 0.18 : 0.34;
    return mix(DECKC, WOODC, tone * 0.6 + 0.12 * noise(p, 0.6, 5));
  }),
);

function sailPaint(hwTop: number, hwFoot: number, yTop: number, yFoot: number, sag = 0.3) {
  return softCel(
    paint((p) => {
      const t = (p.y - yFoot) / (yTop - yFoot);
      const hw = hwFoot + (hwTop - hwFoot) * t;
      const dSide = hw - Math.abs(p.x);
      const footY = yFoot + sag * (1 - (p.x / hwFoot) ** 2);
      const dFoot = p.y - footY;
      const dTop = yTop - p.y;
      if (dTop < 0.1) return GOLD;
      if (dTop < 0.34) return Math.abs(dTop - 0.22) < 0.025 ? GOLD : CRIM;
      if (dSide < 0.08) return GOLD;
      if (dSide < 0.2) return dSide < 0.14 ? CRIM : mix(CRIM, GOLD, 0.0);
      if (dFoot < 0.09) return GOLD;
      if (dFoot < 0.3) {
        const zz = zigzag(p.x / 0.5);
        return dFoot - 0.09 < 0.21 * (1 - zz) ? CRIM : CREAM;
      }
      const seam = Math.abs(fract(p.x / 0.9 + 0.5) - 0.5) < 0.012;
      const cloud = noise(p, 0.9, 11);
      const c = mix(CREAM, LAV, 0.22 * cloud + 0.1 * (1 - t));
      const swirl = Math.abs(fract((p.y - yFoot + 0.3 * Math.sin(p.x * 1.4 + yFoot)) / 0.75) - 0.5) > 0.47;
      const cc = swirl ? mix(c, SKY, 0.4) : c;
      return seam ? mix(cc, LAV, 0.7) : cc;
    }),
  );
}

function featherPaint(len: number, c1: Rgb, c2: Rgb) {
  return C(
    paint((_p, _n, s) => {
      const x = s[0];
      const y = s[1];
      if (Math.abs(y) < 0.02) return GOLD;
      const t = clamp(x / len, 0, 1);
      if (t > 0.9) return GOLD;
      const bar = fract(x * 4.2 - Math.abs(y) * 2.2);
      const base = mix(c1, c2, smoothstep(0.35, 0.95, t));
      return bar < 0.07 ? mix(base, c1, 0.45) : base;
    }),
  );
}

// ---------------------------------------------------------------- drawings
const EMBLEM = svg(
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#7a3a14" stroke-width="3" stroke-linejoin="round">
    <path d="M100 98 C74 66 34 56 4 74 C26 76 36 86 42 98 C26 100 18 112 22 128 C42 114 60 114 78 124 Z" fill="#fff7e6"/>
    <path d="M100 98 C126 66 166 56 196 74 C174 76 164 86 158 98 C174 100 182 112 178 128 C158 114 140 114 122 124 Z" fill="#fff7e6"/>
    <path d="M18 76 C40 78 52 86 58 98 M24 118 C44 108 60 108 76 116" fill="none" stroke="#e0a028" stroke-width="4"/>
    <path d="M182 76 C160 78 148 86 142 98 M176 118 C156 108 140 108 124 116" fill="none" stroke="#e0a028" stroke-width="4"/>
    <polygon fill="#ffd24d" points="100,6 112,48 152,24 140,66 188,62 156,94 196,118 150,124 172,166 128,150 128,192 100,162 72,192 72,150 28,166 50,124 4,118 44,94 12,62 60,66 48,24 88,48"/>
    <circle cx="100" cy="100" r="46" fill="#dc3a52"/>
    <circle cx="100" cy="100" r="46" fill="none" stroke="#fff7e6" stroke-width="5"/>
    <circle cx="100" cy="100" r="30" fill="#2d4a9a"/>
    <circle cx="100" cy="100" r="30" fill="none" stroke="#ffd24d" stroke-width="4"/>
    <path d="M100 76 L110 100 L100 124 L90 100 Z" fill="#34dccb" stroke="#fff7e6" stroke-width="3"/>
  </g></svg>`,
  { size: 512 },
);

const FILIGREE = svg(
  `<svg viewBox="0 0 240 60" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#ffd24d" stroke-width="3.6" stroke-linecap="round">
    <path d="M2 30 C14 6 38 6 38 30 C38 46 22 48 20 36 C19 28 28 26 30 31"/>
    <path d="M78 30 C66 54 42 54 42 30 C42 14 58 12 60 24 C61 32 52 34 50 29"/>
    <path d="M78 30 C90 6 114 6 114 30 C114 46 98 48 96 36 C95 28 104 26 106 31"/>
    <path d="M154 30 C142 54 118 54 118 30 C118 14 134 12 136 24 C137 32 128 34 126 29"/>
    <path d="M154 30 C166 6 190 6 190 30 C190 46 174 48 172 36 C171 28 180 26 182 31"/>
    <path d="M238 30 C226 54 202 54 202 30 C202 14 218 12 220 24 C221 32 212 34 210 29"/>
  </g>
  <g fill="#34dccb" stroke="#fff7e6" stroke-width="1.6">
    <circle cx="40" cy="30" r="4.2"/><circle cx="116" cy="30" r="4.2"/><circle cx="192" cy="30" r="4.2"/>
  </g>
  <g fill="#ffd24d"><circle cx="78" cy="30" r="3"/><circle cx="154" cy="30" r="3"/><circle cx="2" cy="30" r="3"/><circle cx="238" cy="30" r="3"/></g>
</svg>`,
  { size: 1024 },
);

const TASSEL = svg(
  `<svg viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="7" r="6" fill="#ffd24d" stroke="#cf8a22" stroke-width="1.5"/>
  <rect x="8.5" y="12" width="7" height="8" fill="#dc3a52"/>
  <rect x="7.5" y="18" width="9" height="3" fill="#ffd24d"/>
  <path d="M5 22 H19 L22 62 H2 Z" fill="#dc3a52"/>
  <g stroke="#ffd24d" stroke-width="1.6"><path d="M8 24 V60 M12 24 V61 M16 24 V60"/><path d="M4 30 H20"/></g>
</svg>`,
  { size: 192 },
);

const WINDOW = svg(
  `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 63 V24 Q2 3 20 3 Q38 3 38 24 V63 Z" fill="#a9701f"/>
  <path d="M6 59 V25 Q6 8 20 8 Q34 8 34 25 V59 Z" fill="#ffe3a0"/>
  <path d="M6 59 V42 L34 32 V59 Z" fill="#ffb347"/>
  <path d="M10 22 Q12 14 20 12" fill="none" stroke="#fffbe8" stroke-width="2.4" stroke-linecap="round"/>
  <rect x="18.4" y="8" width="3.2" height="51" fill="#a9701f"/>
  <rect x="6" y="31" width="28" height="3" fill="#a9701f"/>
</svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "skyship_galleon", paintSize: 2048 });

  // ------------------------------------------------------------ skeleton
  const hull = b.joint("hull", { at: [0, 2.0, 0] });
  const rudder = b.joint("rudder", { parent: hull, at: [0, 2.3, -6.4], dir: [0, -1, 0], role: "hinge" });
  const wheel = b.joint("helmWheel", { parent: hull, at: [0, 3.78, -4.45], dir: [0, 0, 1], role: "hinge" });
  const PROP_C: Record<number, P3> = { 1: [3.95, 1.95, 1.7], [-1]: [-3.95, 1.95, 1.7] };
  const propL = b.joint("propL", { parent: hull, at: PROP_C[1], dir: [0, 0, 1], role: "hinge" });
  const propR = b.joint("propR", { parent: hull, at: PROP_C[-1], dir: [0, 0, 1], role: "hinge" });
  const MASTS = { fore: 3.3, main: -0.3, mizzen: -3.75 };
  const yard = (name: string, z: number, y: number) =>
    b.joint(name, { parent: hull, at: [0, y, z], dir: [0, 1, 0], role: "hinge" });
  const yFC = yard("yardForeCourse", MASTS.fore, 7.5);
  const yFT = yard("yardForeTop", MASTS.fore, 10.0);
  const yFG = yard("yardForeGallant", MASTS.fore, 11.7);
  const yMC = yard("yardMainCourse", MASTS.main, 8.4);
  const yMT = yard("yardMainTop", MASTS.main, 11.2);
  const yMG = yard("yardMainGallant", MASTS.main, 13.1);
  const yZT = yard("yardMizzenTop", MASTS.mizzen, 9.6);
  const gaff = yard("gaffMizzen", MASTS.mizzen, 4.4);
  const flagMain = b.joint("flagMain", { parent: hull, at: [0, 14.9, MASTS.main], dir: [0, 1, 0], role: "hinge" });
  const flagFore = b.joint("flagFore", { parent: hull, at: [0, 12.6, MASTS.fore], dir: [0, 1, 0], role: "hinge" });
  const flagMiz = b.joint("flagMizzen", { parent: hull, at: [0, 11.2, MASTS.mizzen], dir: [0, 1, 0], role: "hinge" });

  // ------------------------------------------------------------ hull shell (ruled membranes between five hull lines)
  const hullMeshes: THREE.Mesh[] = [];
  for (const s of [1, -1])
    for (let k = 0; k < 4; k++)
      hullMeshes.push(
        ...b.membrane(hullLine(s, ULV[k]), hullLine(s, ULV[k + 1]), {
          color: hullPaint,
          thickness: 0.14,
          rows: 1,
          cols: 46,
          bone: hull,
          name: `hull${s > 0 ? "L" : "R"}${k}`,
        }),
      );
  const hullSkin = b.surface(hullMeshes);

  // transom: the stern wall closing the hull, with gallery windows
  const tr = ULV.map((u, k) => P((WG[0] / WMAX) * FXV[k] - 0.02, YK[0] + u * (YT[0] - YK[0]), 0)).slice(1);
  const transomOutline: OutlinePoint[] = [
    [0, YK[0]],
    ...tr.map((p) => [p[0], p[1]] as OutlinePoint),
    ...tr
      .slice()
      .reverse()
      .map((p) => [-p[0], p[1]] as OutlinePoint),
  ];
  b.extrude(transomOutline, {
    at: [0, 0, -6.2],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.3,
    color: hullPaint,
    bone: hull,
    name: "transom",
  });
  // gallery windows + frames
  const winGold = new Batch(b, GOLDM, hull, "windowFrames");
  for (const x of [-0.66, 0, 0.66]) {
    glow(b.part(new THREE.PlaneGeometry(0.46, 0.73), "#ffffff", { bone: hull, at: [x, 2.95, -6.365], dir: [0, 0, -1], axis: "z", texture: WINDOW, name: "window" }), 1.1);
    winGold.add(xf(new THREE.BoxGeometry(0.56, 0.06, 0.06), [x, 2.58, -6.37]));
    winGold.add(xf(new THREE.BoxGeometry(0.06, 0.82, 0.06), [x - 0.26, 2.98, -6.37]));
    winGold.add(xf(new THREE.BoxGeometry(0.06, 0.82, 0.06), [x + 0.26, 2.98, -6.37]));
    winGold.add(xf(new THREE.SphereGeometry(0.05, 6, 4), [x, 3.4, -6.37]));
  }
  winGold.done();

  // ------------------------------------------------------------ gold hull trim: rail caps, wales, gunwale posts
  const rails = new Batch(b, GOLDM, hull, "railPosts");
  const woodPosts = new Batch(b, WOODM, hull, "balusters");
  for (const s of [1, -1]) {
    const railP = catmull(hullLine(s, 1, -0.05, 0.46));
    b.sweep(railP, 0.055, { bone: hull, color: GOLDM, sides: 6, caps: "round", name: `railCap${s > 0 ? "L" : "R"}` });
    b.sweep(catmull(hullLine(s, 1, 0.04, -0.05)), 0.05, { bone: hull, color: GOLDM, sides: 6, caps: "none", name: `gunwaleCap${s > 0 ? "L" : "R"}` });
    b.sweep(catmull(hullLine(s, 0.55, 0.045, 0)), 0.045, { bone: hull, color: GOLDM, sides: 5, caps: "none", name: `wale${s > 0 ? "L" : "R"}` });
    b.sweep(catmull(hullLine(s, 0.8, 0.045, 0)), 0.04, { bone: hull, color: GOLDM, sides: 5, caps: "none", name: `waleUp${s > 0 ? "L" : "R"}` });
    const N = 44;
    for (let i = 1; i < N; i++) {
      const p = railP.at(i / N);
      woodPosts.add(rodG(P(p.x, p.y - 0.46, p.z), P(p.x, p.y - 0.03, p.z), 0.03, 5));
      if (i % 4 === 0) {
        rails.add(rodG(P(p.x, p.y - 0.46, p.z), P(p.x, p.y + 0.06, p.z), 0.05, 6));
        rails.add(xf(new THREE.SphereGeometry(0.085, 6, 5), [p.x, p.y + 0.1, p.z]));
      }
    }
  }
  // stern rail across the transom
  b.sweep(polyline([P(1.84, 4.42, -6.22), P(1.2, 4.44, -6.34), P(0, 4.46, -6.4), P(-1.2, 4.44, -6.34), P(-1.84, 4.42, -6.22)]), 0.05, {
    bone: hull,
    color: GOLDM,
    sides: 6,
    caps: "round",
    name: "sternRail",
  });
  for (let i = 0; i <= 12; i++) {
    const x = -1.8 + (3.6 * i) / 12;
    const z = -6.3 - 0.1 * (1 - (x / 1.84) ** 2);
    woodPosts.add(rodG(P(x, 3.96, z), P(x, 4.44, z), 0.028, 5));
  }
  rails.done();
  woodPosts.done();

  // ------------------------------------------------------------ decks
  function deckOutline(y: number, z0: number, z1: number, inset = 0.12): OutlinePoint[] {
    const n = Math.max(2, Math.round((z1 - z0) / 0.7));
    const left: OutlinePoint[] = [];
    for (let i = 0; i <= n; i++) {
      const z = z0 + ((z1 - z0) * i) / n;
      left.push([Math.max(0.2, halfWidthAt(z, y) - inset), z]);
    }
    return [...left, ...left.slice().reverse().map((q) => [-q[0], q[1]] as OutlinePoint)];
  }
  const deck = (y: number, z0: number, z1: number, name: string) =>
    b.extrude(deckOutline(y, z0, z1), {
      at: [0, y - 0.07, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.14,
      color: deckPaint,
      bone: hull,
      name,
    });
  const Y_MAIN = 2.0;
  const Y_QUARTER = 2.95;
  const Y_FORE = 3.0;
  deck(Y_MAIN, -2.95, 4.55, "deckMain");
  deck(Y_QUARTER, -6.12, -2.85, "deckQuarter");
  deck(Y_FORE, 4.45, 6.85, "deckFore");

  // bulkheads, stairs
  const woodWall = (w: number) =>
    C(
      paint((p, n, s) => {
        if (Math.abs(n.z) < 0.6) return rgb("#9a5d46");
        const u = s[0];
        const v = s[1];
        const dx = Math.abs(u - 0.5) * w;
        const door = dx < 0.42 && v < 0.78 - 0.5 * (dx / 0.42) ** 2 * 0.3;
        if (door) {
          if (dx < 0.03) return GOLD;
          return mix(rgb("#4a3250"), rgb("#6a4466"), 0.4 * noise(p, 0.2, 2));
        }
        if (dx < 0.5 && v < 0.84) return GOLD;
        if (v > 0.9) return GOLD;
        const plank = fract(u * w / 0.22) < 0.07;
        return plank ? rgb("#a5604f") : mix(WOODC, DECKC, 0.2 + 0.2 * noise(p, 0.5, 8));
      }),
    );
  b.part(new THREE.BoxGeometry(4.3, 0.95, 0.16), woodWall(4.3), { bone: hull, at: [0, Y_MAIN + 0.475, -2.92], name: "bulkheadQuarter" });
  b.part(new THREE.BoxGeometry(3.4, 1.0, 0.16), woodWall(3.4), { bone: hull, at: [0, Y_MAIN + 0.5, 4.55], name: "bulkheadFore" });
  const steps = new Batch(b, DECKM, hull, "stairs");
  const stepTrim = new Batch(b, GOLDM, hull, "stairTrim");
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const h = 0.19 * (i + 1);
      steps.add(xf(new THREE.BoxGeometry(0.85, h, 0.34), [s * 1.55, Y_MAIN + h / 2, -2.84 + 0.17 + 0.34 * (4 - i) + 0.17]));
      stepTrim.add(xf(new THREE.BoxGeometry(0.87, 0.03, 0.04), [s * 1.55, Y_MAIN + h + 0.005, -2.84 + 0.34 * (4 - i) + 0.4]));
      const hf = 0.2 * (i + 1);
      steps.add(xf(new THREE.BoxGeometry(0.85, hf, 0.34), [s * 1.2, Y_MAIN + hf / 2, 4.47 - 0.17 - 0.34 * (4 - i) - 0.17]));
      stepTrim.add(xf(new THREE.BoxGeometry(0.87, 0.03, 0.04), [s * 1.2, Y_MAIN + hf + 0.005, 4.47 - 0.34 * (4 - i) - 0.4]));
    }
    // stair handrails
    rails.add(rodG(P(s * 1.97, 2.75, -2.55), P(s * 1.97, 3.55, -3.0), 0.03, 5));
  }
  steps.done();
  stepTrim.done();
  rails.done();

  // ------------------------------------------------------------ stern balcony and swan necks
  b.extrude(
    [
      [0.95, -6.12],
      [1.28, -6.5],
      [0.95, -6.95],
      [0, -7.1],
      [-0.95, -6.95],
      [-1.28, -6.5],
      [-0.95, -6.12],
    ],
    { at: [0, 2.42, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.12, bevel: 0.025, color: GOLDM, bone: hull, name: "balcony" },
  );
  b.sweep(
    catmull([P(0.95, 2.88, -6.2), P(1.28, 2.88, -6.5), P(0.95, 2.88, -6.95), P(0, 2.88, -7.1), P(-0.95, 2.88, -6.95), P(-1.28, 2.88, -6.5), P(-0.95, 2.88, -6.2)]),
    0.035,
    { bone: hull, color: GOLDM, sides: 5, name: "balconyRail" },
  );
  const balPosts = new Batch(b, GOLDM, hull, "balconyPosts");
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const ang = (-80 + 160 * t) * DEG;
    const x = 1.28 * Math.sin(ang) * 0.9;
    const z = -6.55 - 0.55 * Math.cos(ang) * 0.9 + 0.05;
    balPosts.add(rodG(P(x, 2.47, z), P(x, 2.88, z), 0.022, 5));
  }
  balPosts.done();

  // swan-neck stern horns with hanging lanterns
  const lanternGlow = new Batch(b, "#ffd98a", hull, "lanternGlass", false);
  const lanternGold = new Batch(b, GOLDM, hull, "lanternCaps");
  function lantern(at: P3, scale = 1) {
    lanternGlow.add(xf(new THREE.CylinderGeometry(0.11 * scale, 0.14 * scale, 0.34 * scale, 6), [at[0], at[1], at[2]]));
    lanternGold.add(xf(new THREE.CylinderGeometry(0.05 * scale, 0.17 * scale, 0.12 * scale, 6), [at[0], at[1] + 0.23 * scale, at[2]]));
    lanternGold.add(xf(new THREE.ConeGeometry(0.04 * scale, 0.1 * scale, 6), [at[0], at[1] + 0.34 * scale, at[2]]));
    lanternGold.add(xf(new THREE.CylinderGeometry(0.16 * scale, 0.1 * scale, 0.07 * scale, 6), [at[0], at[1] - 0.2 * scale, at[2]]));
    lanternGold.add(xf(new THREE.SphereGeometry(0.035 * scale, 5, 4), [at[0], at[1] - 0.27 * scale, at[2]]));
  }
  for (const s of [1, -1]) {
    const neck = catmull([
      P(s * 1.78, 4.0, -6.1),
      P(s * 1.95, 4.9, -6.5),
      P(s * 1.78, 5.9, -6.45),
      P(s * 1.3, 6.7, -6.0),
      P(s * 0.85, 6.85, -5.55),
      P(s * 0.6, 6.55, -5.35),
      P(s * 0.72, 6.2, -5.4),
    ]);
    b.sweep(neck, [0.17, 0.06], { bone: hull, color: GOLDM, sides: 7, caps: "round", name: `swanNeck${s > 0 ? "L" : "R"}` });
    for (let i = 1; i < 6; i++) {
      const p = neck.at(0.12 + 0.12 * i);
      b.part(new THREE.SphereGeometry(0.2 - i * 0.02, 6, 5), WOODM, { bone: hull, at: [p.x, p.y, p.z], scale: [0.7, 1, 1], name: "swanBead" });
    }
    // feather fin standing on the neck
    b.rod(P(s * 0.72, 6.2, -5.4), P(s * 0.72, 5.75, -5.4), 0.015, { bone: hull, color: ROPE, name: "lanternChain" });
    lantern(P(s * 0.72, 5.5, -5.4), 1.1);
  }

  // ------------------------------------------------------------ gun ports, jewels and filigree on the hull flanks
  const portFrame = new Batch(b, GOLDM, hull, "portFrames");
  const portDark = new Batch(b, "#2a2548", hull, "portDark", true);
  const muzzleGlow = new Batch(b, "#ffd98a", hull, "portGlow", false);
  const jewels = new Batch(b, "#7ffff0", hull, "hullJewels", false);
  const jewelSet = new Batch(b, GOLDM, hull, "jewelSettings");
  for (const s of [1, -1]) {
    for (const z of [-3.0, -1.7, -0.4, 0.9, 2.2, 3.5]) {
      const yk = lerpArr(YK, z);
      const yt = lerpArr(YT, z);
      const y = yk + 0.36 * (yt - yk);
      const hit = hullSkin.ray([s * 9, y, z], [-s, 0, 0]);
      if (!hit) continue;
      const n = hit.n.clone();
      const q = aim(n, [0, 1, 0]);
      const at = hit.at.clone();
      const place = (g: THREE.BufferGeometry, off: number, bag: Batch) => {
        g.applyQuaternion(q);
        g.translate(at.x + n.x * off, at.y + n.y * off, at.z + n.z * off);
        bag.add(g);
      };
      place(new THREE.CylinderGeometry(0.25, 0.25, 0.05, 10), 0.025, portFrame);
      place(new THREE.TorusGeometry(0.24, 0.035, 4, 10).rotateX(Math.PI / 2), 0.06, portFrame);
      place(new THREE.CylinderGeometry(0.19, 0.19, 0.06, 10), 0.04, portDark);
      place(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 10), 0.065, muzzleGlow);
      place(new THREE.BoxGeometry(0.3, 0.04, 0.025), 0.095, portFrame);
      place(new THREE.BoxGeometry(0.025, 0.04, 0.3), 0.095, portFrame);
    }
    // jewels along the crimson band between the filigree
    for (let z = -5.2; z <= 5.8; z += 0.55) {
      const yk = lerpArr(YK, z);
      const yt = lerpArr(YT, z);
      const y = yk + 0.675 * (yt - yk);
      const hit = hullSkin.ray([s * 9, y, z], [-s, 0, 0]);
      if (!hit) continue;
      const q = aim(hit.n, [0, 1, 0]);
      const g1 = new THREE.OctahedronGeometry(0.055).scale(1, 0.55, 1.35);
      g1.applyQuaternion(q);
      g1.translate(hit.at.x + hit.n.x * 0.025, hit.at.y + hit.n.y * 0.025, hit.at.z + hit.n.z * 0.025);
      jewels.add(g1);
      const g2 = new THREE.CylinderGeometry(0.075, 0.08, 0.025, 6);
      g2.applyQuaternion(q);
      g2.translate(hit.at.x + hit.n.x * 0.012, hit.at.y + hit.n.y * 0.012, hit.at.z + hit.n.z * 0.012);
      jewelSet.add(g2);
    }
    for (const z of [-4.2, -2.3, -0.3, 1.7, 3.5]) {
      const yk = lerpArr(YK, z);
      const yt = lerpArr(YT, z);
      const y = yk + 0.68 * (yt - yk);
      const hit = hullSkin.ray([s * 9, y, z], [-s, 0, 0]);
      if (hit) b.decal(hullSkin, FILIGREE, { at: hit, dir: [s, 0, 0], size: [2.0, 0.52], segments: [24, 5], name: "hullFiligree", mirror: s < 0 });
    }
    for (const z of [-3.6, -1.6, 0.4, 2.4, 4.1]) {
      const yk = lerpArr(YK, z);
      const yt = lerpArr(YT, z);
      const hit = hullSkin.ray([s * 9, yk + 0.2 * (yt - yk), z], [-s, 0, 0]);
      if (hit) b.decal(hullSkin, FILIGREE, { at: hit, size: [1.6, 0.38], segments: [20, 4], name: "hullFiligreeLow", mirror: s < 0 });
    }
  }
  portFrame.done();
  portDark.done();
  glow(muzzleGlow.done()!, 1.1);
  glow(jewels.done()!, 1.1);
  jewelSet.done();
  for (const s of [1, -1])
    glow(b.sweep(catmull(hullLine(s, 0.13, 0.035, 0)), 0.03, { bone: hull, color: "#7ffff0", sides: 4, caps: "none", name: "bellyGlow" }), 1.3);

  // stern roundel above the windows
  b.decal(hullSkin, EMBLEM, { at: [0, 3.62, -6.3], dir: [0, 0, -1], size: [0.62, 0.62], segments: 8 });

  // ------------------------------------------------------------ masts
  const hoops = new Batch(b, GOLDM, hull, "mastHoops");
  const finials = new Batch(b, GOLDM, hull, "finials");
  function mast(z: number, y0: number, y1: number, r0: number, name: string) {
    b.sweep([P(0, y0 - 0.1, z), P(0, y1, z)], [r0, r0 * 0.38], { bone: hull, color: WOODM, sides: 8, caps: "flat", name });
    for (const t of [0.04, 0.3, 0.55, 0.8]) {
      const y = y0 + (y1 - y0) * t;
      const r = r0 * (1 - 0.62 * t) + 0.045;
      hoops.add(rodG(P(0, y - 0.06, z), P(0, y + 0.06, z), r, 8));
    }
    finials.add(xf(new THREE.SphereGeometry(r0 * 0.5, 7, 5), [0, y1 + 0.02, z]));
    finials.add(xf(new THREE.ConeGeometry(r0 * 0.28, r0 * 3.2, 6), [0, y1 + r0 * 1.7, z]));
    // mast partner at the deck
    hoops.add(xf(new THREE.CylinderGeometry(r0 * 1.5, r0 * 1.8, 0.2, 8), [0, y0 + 0.1, z]));
  }
  mast(MASTS.main, Y_MAIN, 14.6, 0.27, "mastMain");
  mast(MASTS.fore, Y_MAIN, 12.4, 0.23, "mastFore");
  mast(MASTS.mizzen, Y_QUARTER, 11.0, 0.19, "mastMizzen");
  hoops.done();
  finials.done();

  // crow's nests
  const nestWood = new Batch(b, WOODM, hull, "nestPosts");
  const nestGold = new Batch(b, GOLDM, hull, "nestRims");
  function nest(z: number, y: number, r: number) {
    b.lathe(
      [
        [0, 0],
        [r * 0.8, 0],
        [r, 0.22],
        [r * 0.9, 0.22],
        [r * 0.72, 0.06],
        [0, 0.06],
      ],
      { at: [0, y, z], color: WOODM, bone: hull, segments: 10, name: "crowsNest" },
    );
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      nestWood.add(rodG(P(Math.cos(a) * r * 0.96, y + 0.2, z + Math.sin(a) * r * 0.96), P(Math.cos(a) * r, y + 0.62, z + Math.sin(a) * r), 0.026, 4));
    }
    const ring: P3[] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      ring.push(P(Math.cos(a) * r, y + 0.64, z + Math.sin(a) * r));
    }
    b.sweep(catmull(ring, { closed: true }), 0.04, { bone: hull, color: GOLDM, sides: 5, name: "nestRail" });
    nestGold.add(xf(new THREE.CylinderGeometry(r * 1.02, r * 1.02, 0.05, 10), [0, y + 0.03, z]));
  }
  nest(MASTS.main, 8.7, 0.7);
  nest(MASTS.fore, 8.05, 0.6);
  nestWood.done();
  nestGold.done();
  // mizzen top
  b.part(new THREE.CylinderGeometry(0.46, 0.5, 0.1, 8), GOLDM, { bone: hull, at: [0, 7.6, MASTS.mizzen], name: "mizzenTop" });

  // ------------------------------------------------------------ yards and sails
  const tassels: Frame[] = [];
  const yardWood = new Map<Joint, Batch>();
  const yardGold = new Map<Joint, Batch>();
  const wood = (j: Joint) => yardWood.get(j) ?? (yardWood.set(j, new Batch(b, WOODM, j, `yardWood.${j.name}`)), yardWood.get(j)!);
  const gold = (j: Joint) => yardGold.get(j) ?? (yardGold.set(j, new Batch(b, GOLDM, j, `yardGold.${j.name}`)), yardGold.get(j)!);

  function yardSpar(j: Joint, z: number, y: number, hw: number) {
    wood(j).add(rodG(P(0, y, z), P(hw * 0.86, y, z), 0.095, 6, 0.065));
    wood(j).add(rodG(P(0, y, z), P(-hw * 0.86, y, z), 0.095, 6, 0.065));
    for (const s of [1, -1]) {
      gold(j).add(rodG(P(s * hw * 0.86, y, z), P(s * hw * 0.98, y, z), 0.07, 6, 0.045));
      gold(j).add(xf(new THREE.ConeGeometry(0.045, 0.2, 6), [s * (hw + 0.07), y, z], [0, 0, -s * 90]));
      gold(j).add(xf(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 6), [s * hw * 0.5, y, z], [0, 0, 90]));
      gold(j).add(xf(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 6), [s * hw * 0.22, y, z], [0, 0, 90]));
    }
    gold(j).add(xf(new THREE.SphereGeometry(0.16, 6, 5), [0, y, z]));
  }

  const ropes = new Batch(b, ROPE, hull, "ropes");
  const rope = (a: P3, c: P3, r = 0.022) => ropes.add(rodG(a, c, r, 4));

  function squareSail(
    j: Joint,
    zm: number,
    yTop: number,
    yFoot: number,
    hwTop: number,
    hwFoot: number,
    bulge: number,
    name: string,
    emblem = 0,
  ) {
    const z0 = zm + 0.48;
    const sag = 0.32;
    const nx = 7;
    const topE: P3[] = [];
    const midE: P3[] = [];
    const footE: P3[] = [];
    const yMid = yFoot + (yTop - yFoot) * 0.52;
    for (let i = 0; i < nx; i++) {
      const f = -1 + (2 * i) / (nx - 1); // -1..1 across
      const bl = 1 - f * f * 0.82;
      topE.push(P(f * hwTop, yTop - 0.02, z0 + 0.03 * bl));
      midE.push(P(f * (hwTop + hwFoot) * 0.5, yMid, z0 + bulge * bl));
      footE.push(P(f * hwFoot, yFoot + sag * (1 - f * f), z0 + bulge * 0.85 * bl));
    }
    const color = sailPaint(hwTop, hwFoot, yTop, yFoot, sag);
    const meshes = [
      ...b.membrane(catmull(topE), catmull(midE), { color, thickness: 0.05, rows: 2, cols: 16, bone: j, name: `${name}Up` }),
      ...b.membrane(catmull(midE), catmull(footE), { color, thickness: 0.05, rows: 2, cols: 16, bone: j, name: `${name}Low` }),
    ];
    if (emblem > 0) {
      b.decal(b.surface(meshes), EMBLEM, {
        at: [0, yMid + 0.15, z0 + bulge + 0.5],
        dir: [0, 0, 1],
        size: [emblem, emblem],
        segments: [18, 18],
        name: `${name}Emblem`,
      });
    }
    // tassels hang from the clews and the middle of the foot
    for (const f of [-1, 1]) tassels.push(frame(P(f * hwFoot, yFoot + 0.02, z0 + bulge * 0.02), [0, 1, 0]));
    // sheets: clew to hull, lifts: yard end to mast
    for (const f of [-1, 1]) {
      rope(P(f * hwFoot, yFoot + 0.03, z0 + 0.02), P(f * (hwFoot * 0.78), Math.max(3.2, sheerAt(zm + 0.6) + 0.1), zm + 0.7 + (zm > 0 ? 0.2 : -0.3)), 0.022);
      rope(P(f * hwTop, yTop, z0), P(f * 0.22, yTop + 0.5, zm + 0.1), 0.02);
    }
    return meshes;
  }

  yardSpar(yMC, MASTS.main + 0.38, 8.4, 3.55);
  yardSpar(yMT, MASTS.main + 0.38, 11.2, 2.75);
  yardSpar(yMG, MASTS.main + 0.38, 13.1, 1.85);
  yardSpar(yFC, MASTS.fore + 0.38, 7.5, 3.05);
  yardSpar(yFT, MASTS.fore + 0.38, 10.0, 2.3);
  yardSpar(yFG, MASTS.fore + 0.38, 11.7, 1.55);
  yardSpar(yZT, MASTS.mizzen + 0.38, 9.6, 2.1);

  squareSail(yMC, MASTS.main, 8.3, 4.15, 3.05, 3.45, 0.9, "sailMainCourse", 2.1);
  squareSail(yMT, MASTS.main, 11.1, 8.6, 2.05, 2.55, 0.62, "sailMainTop", 1.1);
  squareSail(yMG, MASTS.main, 13.0, 11.4, 1.25, 1.65, 0.45, "sailMainGallant");
  squareSail(yFC, MASTS.fore, 7.4, 4.1, 2.55, 2.95, 0.8, "sailForeCourse", 1.8);
  squareSail(yFT, MASTS.fore, 9.9, 7.7, 1.75, 2.15, 0.58, "sailForeTop", 0.9);
  squareSail(yFG, MASTS.fore, 11.6, 10.2, 1.1, 1.4, 0.4, "sailForeGallant");
  squareSail(yZT, MASTS.mizzen, 9.5, 7.2, 1.55, 1.95, 0.5, "sailMizzenTop", 0.9);

  // spanker on a gaff and boom
  {
    const mz = MASTS.mizzen - 0.25;
    wood(gaff).add(rodG(P(0, 8.9, mz), P(0, 7.3, mz - 2.9), 0.075, 6, 0.05));
    wood(gaff).add(rodG(P(0, 4.45, mz), P(0, 4.75, mz - 3.0), 0.085, 6, 0.055));
    gold(gaff).add(xf(new THREE.SphereGeometry(0.09, 6, 5), [0, 7.3, mz - 2.92]));
    gold(gaff).add(xf(new THREE.SphereGeometry(0.1, 6, 5), [0, 4.75, mz - 3.02]));
    gold(gaff).add(xf(new THREE.SphereGeometry(0.14, 6, 5), [0, 4.45, mz]));
    const sp: OutlinePoint[] = [
      [0, 4.55],
      [-1.0, 4.62],
      [-2.0, 4.7],
      [-2.78, 4.82],
      [-2.78, 7.3],
      [-1.5, 8.05],
      [0, 8.85],
    ];
    const spanker = b.extrude(sp, {
      at: [0, 0, mz - 0.05],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.06,
      bevel: 0.012,
      color: softCel(
        paint((_p, _n, s) => {
          const [zz, yy] = s;
          const dTop = 8.85 + (7.3 - 8.85) * (-zz / 2.78) - yy; // distance under the gaff line
          const dFoot = yy - (4.55 + 0.27 * (-zz / 2.78));
          const dLeech = 2.78 + zz;
          if (dTop < 0.12 || dFoot < 0.1) return GOLD;
          if (dLeech < 0.1) return GOLD;
          if (dTop < 0.28 || dLeech < 0.2) return CRIM;
          if (dFoot < 0.3) return zigzag(-zz / 0.5) > 0.5 ? CRIM : CREAM;
          return fract(yy / 0.8) < 0.02 ? LAV : mix(WHITE, LAV, 0.12 * noise(new THREE.Vector3(zz, yy, 0), 0.9, 4));
        }),
      ),
      bone: gaff,
      name: "sailSpanker",
    });
    for (const s of [1, -1])
      b.decal(b.surface(spanker), EMBLEM, { at: [s * 0.05, 6.4, mz - 1.5], dir: [s, 0, 0], size: [1.2, 1.2], segments: 12, name: "spankerEmblem" });
    tassels.push(frame(P(0, 4.6, mz - 3.0), [0, 1, 0]));
  }

  // jibs flying from the forestay
  const bowTip = P(0, 7.2, 11.2);
  const jibPaint = (poly: Array<[number, number]>) =>
    softCel(
      paint((_p, _n, s) => {
        let dmin = 9;
        for (let i = 0; i < poly.length; i++) {
          const a = poly[i];
          const c = poly[(i + 1) % poly.length];
          const ex = c[0] - a[0];
          const ey = c[1] - a[1];
          const t = clamp(((s[0] - a[0]) * ex + (s[1] - a[1]) * ey) / (ex * ex + ey * ey), 0, 1);
          dmin = Math.min(dmin, Math.hypot(s[0] - (a[0] + ex * t), s[1] - (a[1] + ey * t)));
        }
        if (dmin < 0.1) return GOLD;
        if (dmin < 0.2) return CRIM;
        return mix(WHITE, LAV, 0.12 * noise(new THREE.Vector3(s[0], s[1], 0), 1.0, 9));
      }),
    );
  const jib1: Array<[number, number]> = [
    [3.95, 12.1],
    [10.5, 7.7],
    [6.0, 5.0],
  ];
  const jib2: Array<[number, number]> = [
    [10.9, 7.55],
    [7.1, 9.9],
    [6.7, 6.2],
  ];
  const jibPart = (poly: Array<[number, number]>, name: string, x: number) =>
    b.extrude(poly, { at: [x, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.05, bevel: 0.01, color: jibPaint(poly), bone: hull, name });
  const jibA = jibPart(jib1, "sailJibOuter", -0.06);
  jibPart(jib2, "sailJibInner", 0.06);
  for (const s of [1, -1]) b.decal(b.surface(jibA), EMBLEM, { at: [s * 0.05 - 0.06, 7.7, 5.9], dir: [s, 0, 0], size: [0.95, 0.95], segments: 10, name: "jibEmblem" });
  tassels.push(frame(P(-0.06, 5.05, 6.0), [0, 1, 0]), frame(P(0.06, 6.25, 6.7), [0, 1, 0]));

  // bowsprit
  b.sweep([P(0, 3.45, 4.9), P(0, 7.1, 11.2)], [0.16, 0.06], { bone: hull, color: WOODM, sides: 8, caps: "flat", name: "bowsprit" });
  for (const t of [0.3, 0.6, 0.9]) {
    const p = V(P(0, 3.45, 4.9)).lerp(V(P(0, 7.1, 11.2)), t);
    hoops.add(rodG(P(0, p.y - 0.06, p.z - 0.03), P(0, p.y + 0.06, p.z + 0.03), 0.2 * (1 - t) + 0.07 * t + 0.04, 8));
  }
  hoops.done();
  b.part(new THREE.SphereGeometry(0.12, 6, 5), GOLDM, { bone: hull, at: bowTip, name: "bowspritCap" });
  // pennants
  const pennant = (j: Joint, zm: number, y: number, len: number, hgt: number, name: string) => {
    const A: P3[] = [];
    const B: P3[] = [];
    for (let i = 0; i <= 7; i++) {
      const t = i / 7;
      const x = 0.32 * Math.sin(t * 6.5 + 0.6) * t;
      A.push(P(x, y + 0.05 * Math.sin(t * 5), zm - 0.1 - len * t));
      B.push(P(x, y - hgt * (1 - t * 0.93) + 0.05 * Math.sin(t * 5), zm - 0.1 - len * t));
    }
    b.membrane(catmull(A), catmull(B), {
      color: softCel(
        paint((_p, _n, s) => {
          const [al, ac] = s;
          const ed = Math.min(ac, 1 - ac) * hgt * (1 - al * 0.93);
          if (ed < 0.045) return GOLD;
          if (al < 0.14 && Math.hypot(al * len - 0.3, (ac - 0.5) * hgt) < 0.16) return TEAL;
          if (al > 0.9) return GOLD;
          return fract(al * 5 + 0.5) < 0.12 ? mix(CRIM, GOLD, 0.2) : CRIM;
        }),
      ),
      thickness: 0.035,
      rows: 2,
      cols: 14,
      bone: j,
      name,
    });
  };
  pennant(flagMain, MASTS.main, 14.7, 3.5, 0.8, "flagMain");
  pennant(flagFore, MASTS.fore, 12.5, 2.8, 0.65, "flagFore");
  pennant(flagMiz, MASTS.mizzen, 11.1, 2.4, 0.55, "flagMizzen");

  for (const j of yardWood.values()) j.done();
  for (const j of yardGold.values()) j.done();

  // ------------------------------------------------------------ rigging: shrouds, ratlines, stays, backstays
  const deadeyes = new Batch(b, GOLDM, hull, "deadeyes");
  function shrouds(zm: number, yTop: number, nPairs: number, xr: number) {
    for (const s of [1, -1]) {
      const ends: Array<[P3, P3]> = [];
      for (let i = 0; i < nPairs; i++) {
        const zoff = -0.95 + (i * 0.95) / Math.max(1, nPairs - 1) * 1.0;
        const zh = zm + zoff - 0.1;
        const top = P(s * 0.3, yTop, zm - 0.18 + (i - (nPairs - 1) / 2) * 0.14);
        const hy = sheerAt(zh) + 0.4;
        const bot = P(s * (halfWidthAt(zh, hy) - 0.05) * xr, hy - 0.1, zh);
        rope(top, bot, 0.026);
        ends.push([top, bot]);
        deadeyes.add(xf(new THREE.SphereGeometry(0.075, 6, 4), bot));
        deadeyes.add(rodG(bot, P(bot[0], bot[1] - 0.6, bot[2]), 0.02, 4));
      }
      const rows = 9;
      for (let r = 1; r <= rows; r++) {
        const t = r / (rows + 1);
        for (let i = 0; i < nPairs - 1; i++) {
          const a = V(ends[i][1]).lerp(V(ends[i][0]), t);
          const c = V(ends[i + 1][1]).lerp(V(ends[i + 1][0]), t);
          rope(P(a.x, a.y, a.z), P(c.x, c.y, c.z), 0.016);
        }
      }
    }
  }
  shrouds(MASTS.main, 8.55, 4, 1.0);
  shrouds(MASTS.fore, 7.9, 4, 1.0);
  shrouds(MASTS.mizzen, 7.5, 3, 1.0);
  // stays
  rope(P(0, 12.3, MASTS.fore + 0.05), bowTip, 0.03);
  rope(P(0, 14.4, MASTS.main), P(0, 12.2, MASTS.fore + 0.1), 0.028);
  rope(P(0, 10.8, MASTS.mizzen), P(0, 8.9, MASTS.main - 0.1), 0.028);
  rope(P(0, 13.0, MASTS.main), P(0, 11.5, MASTS.fore), 0.02);
  // bobstay and bowsprit shrouds
  for (const s of [1, -1]) {
    rope(P(0, 6.9, 10.9), P(s * 0.5, 4.2, 6.6), 0.024);
    rope(P(0, 6.9, 10.9), P(s * 0.9, 4.0, 6.0), 0.02);
  }
  // backstays to the quarter
  for (const s of [1, -1]) {
    rope(P(s * 0.12, 14.0, MASTS.main - 0.15), P(s * 2.05, 3.7, -3.9), 0.022);
    rope(P(s * 0.12, 11.9, MASTS.fore - 0.1), P(s * 1.9, 3.1, 1.0), 0.02);
    rope(P(s * 0.1, 10.5, MASTS.mizzen - 0.1), P(s * 1.75, 4.4, -6.15), 0.02);
  }
  ropes.done();
  deadeyes.done();

  // tassels hang from sail corners, rail posts and the swan necks
  for (const s of [1, -1]) tassels.push(frame(P(s * 0.72, 5.34, -5.4), [0, 1, 0]));
  b.cards(tassels, TASSEL, { size: [0.14, 0.42], lean: 180, flow: [0, 0, 1], sink: 0, cross: true, name: "tassels" });

  // ------------------------------------------------------------ deck clutter, helm, crystal core
  const crates = new Batch(b, C("#c98a54", "#8a4f48"), hull, "crates");
  const crateTrim = new Batch(b, GOLDM, hull, "crateStraps");
  const barrelsM = new Batch(b, C("#a35a3a", "#6a3248"), hull, "barrels", false);
  const barrelBands = new Batch(b, IRONM, hull, "barrelBands");
  const coils = new Batch(b, C("#d9b57a", "#a47a62"), hull, "ropeCoils");
  function crate(x: number, z: number, s: number, rot: number, y = Y_MAIN) {
    crates.add(xf(new THREE.BoxGeometry(s, s, s), [x, y + s / 2, z], [0, rot, 0]));
    for (const k of [-1, 1]) {
      crateTrim.add(xf(new THREE.BoxGeometry(s + 0.03, 0.05, s + 0.03), [x, y + s / 2 + k * s * 0.33, z], [0, rot, 0]));
    }
    crateTrim.add(xf(new THREE.BoxGeometry(0.05, s + 0.03, s + 0.03), [x, y + s / 2, z], [0, rot, 0]));
  }
  function barrel(x: number, z: number, y = Y_MAIN) {
    barrelsM.add(xf(new THREE.CylinderGeometry(0.3, 0.3, 0.7, 10).scale(1, 1, 1), [x, y + 0.35, z]));
    barrelsM.add(xf(new THREE.CylinderGeometry(0.34, 0.3, 0.2, 10), [x, y + 0.45, z]));
    for (const k of [0.12, 0.35, 0.58]) barrelBands.add(xf(new THREE.CylinderGeometry(0.325, 0.325, 0.045, 10), [x, y + k, z]));
  }
  crate(1.5, -1.5, 0.62, 12);
  crate(1.55, -2.15, 0.46, -20);
  crate(1.5, -1.55, 0.4, 5, Y_MAIN + 0.62);
  crate(-1.55, -2.0, 0.6, -8);
  crate(-1.4, 4.05, 0.55, 30);
  crate(1.55, 3.55, 0.5, 8);
  barrel(-1.6, 2.6);
  barrel(-1.65, 3.2);
  barrel(-1.1, 2.9);
  barrel(1.6, 0.9);
  barrel(1.7, 1.55);
  for (const [x, z, y] of [
    [0.55, -0.9, Y_MAIN],
    [-0.5, 3.0, Y_MAIN],
    [1.2, -3.55, Y_QUARTER],
  ] as P3[]) {
    coils.add(xf(new THREE.TorusGeometry(0.26, 0.07, 5, 12), [x, y + 0.08, z], [90, 0, 0]));
    coils.add(xf(new THREE.TorusGeometry(0.26, 0.07, 5, 12), [x, y + 0.2, z], [90, 0, 0]));
  }
  crates.done();
  crateTrim.done();
  barrelsM.done();
  barrelBands.done();
  coils.done();

  // main hatch with a barred grating, and two gold-banded chests on the forecastle
  const hatchDark = new Batch(b, "#2a2548", hull, "hatchWell");
  const hatchGold = new Batch(b, GOLDM, hull, "hatchFrame");
  const hatchBars = new Batch(b, WOODM, hull, "hatchBars");
  hatchDark.add(xf(new THREE.BoxGeometry(1.3, 0.1, 1.0), [0, Y_MAIN + 0.05, -1.45]));
  for (const [w, d, x, z] of [
    [1.46, 0.08, 0, -1.97],
    [1.46, 0.08, 0, -0.93],
    [0.08, 1.0, -0.69, -1.45],
    [0.08, 1.0, 0.69, -1.45],
  ] as Array<[number, number, number, number]>)
    hatchGold.add(xf(new THREE.BoxGeometry(w, 0.16, d), [x, Y_MAIN + 0.08, z]));
  for (let i = 0; i < 6; i++) hatchBars.add(xf(new THREE.BoxGeometry(1.3, 0.06, 0.05), [0, Y_MAIN + 0.13, -1.85 + i * 0.2]));
  for (const [x, z, rot] of [
    [-1.25, 5.7, 18],
    [1.2, 6.15, -24],
  ] as P3[]) {
    crates.add(xf(new THREE.BoxGeometry(0.62, 0.3, 0.38), [x, Y_FORE + 0.15, z], [0, rot, 0]));
    crates.add(xf(new THREE.BoxGeometry(0.64, 0.12, 0.4), [x, Y_FORE + 0.36, z], [0, rot, 0]));
    for (const k of [-0.2, 0.2]) crateTrim.add(xf(new THREE.BoxGeometry(0.07, 0.46, 0.42), [x + k * Math.cos(rot * DEG), Y_FORE + 0.23, z - k * Math.sin(rot * DEG)], [0, rot, 0]));
    crateTrim.add(xf(new THREE.BoxGeometry(0.1, 0.1, 0.1), [x + 0.31 * Math.sin(rot * DEG) * 0.0, Y_FORE + 0.3, z + 0.2 * Math.cos(rot * DEG)], [0, rot, 0]));
  }
  crates.done();
  crateTrim.done();
  hatchDark.done();
  hatchGold.done();
  hatchBars.done();

  // capstan
  b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.3, 0.12],
      [0.2, 0.2],
      [0.2, 0.62],
      [0.3, 0.7],
      [0.3, 0.78],
      [0, 0.78],
    ],
    { at: [0, Y_MAIN, 4.0], color: GOLDM, bone: hull, segments: 8, name: "capstan" },
  );
  const capBars = new Batch(b, WOODM, hull, "capstanBars");
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI + 0.4;
    capBars.add(rodG(P(Math.cos(a) * 0.62, Y_MAIN + 0.7, 4.0 + Math.sin(a) * 0.62), P(-Math.cos(a) * 0.62, Y_MAIN + 0.7, 4.0 - Math.sin(a) * 0.62), 0.04, 5));
  }
  capBars.done();

  // helm wheel with pedestal (wheel spins on its own hinge)
  b.part(new THREE.BoxGeometry(0.7, 0.5, 0.34), C("#7a3d46", "#4a2a46"), { bone: hull, at: [0, Y_QUARTER + 0.25, -4.45], name: "helmPedestal" });
  b.part(new THREE.BoxGeometry(0.76, 0.06, 0.4), GOLDM, { bone: hull, at: [0, Y_QUARTER + 0.52, -4.45], name: "helmCap" });
  const wGold = new Batch(b, GOLDM, wheel, "wheelRim");
  const wWood = new Batch(b, WOODM, wheel, "wheelSpokes");
  wGold.add(xf(new THREE.TorusGeometry(0.46, 0.04, 5, 16), [0, 3.78, -4.45]));
  wGold.add(xf(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 8), [0, 3.78, -4.45], [90, 0, 0]));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    wWood.add(rodG(P(0, 3.78, -4.45), P(Math.cos(a) * 0.72, 3.78 + Math.sin(a) * 0.72, -4.45), 0.026, 5));
    wGold.add(xf(new THREE.SphereGeometry(0.05, 5, 4), [Math.cos(a) * 0.74, 3.78 + Math.sin(a) * 0.74, -4.45]));
  }

  // stern cabin under a raised poop deck: front wall with door, glowing portholes, skylight
  const Y_POOP = 3.85;
  const cabinW = 2 * (halfWidthAt(-5.0, 3.4) - 0.1);
  b.part(new THREE.BoxGeometry(cabinW, Y_POOP - Y_QUARTER, 0.16), woodWall(cabinW), { bone: hull, at: [0, (Y_POOP + Y_QUARTER) / 2, -4.98], name: "cabinFront" });
  deck(Y_POOP, -6.12, -4.9, "deckPoop");
  const cabinGlass = new Batch(b, "#ffe3a0", hull, "cabinGlass", false);
  const cabinGold = new Batch(b, GOLDM, hull, "cabinTrim");
  for (const x of [-1.15, 1.15]) {
    cabinGlass.add(xf(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 10), [x, 3.4, -4.88], [90, 0, 0]));
    cabinGold.add(xf(new THREE.TorusGeometry(0.2, 0.04, 4, 10), [x, 3.4, -4.9]));
  }
  cabinGlass.add(xf(new THREE.BoxGeometry(0.8, 0.14, 0.45), [0, Y_POOP + 0.17, -5.55]));
  cabinGold.add(xf(new THREE.BoxGeometry(0.96, 0.07, 0.62), [0, Y_POOP + 0.07, -5.55]));
  cabinGold.add(xf(new THREE.BoxGeometry(0.96, 0.05, 0.05), [0, Y_POOP + 0.2, -5.28]));
  cabinGold.add(xf(new THREE.BoxGeometry(0.96, 0.05, 0.05), [0, Y_POOP + 0.2, -5.82]));
  cabinGold.add(xf(new THREE.BoxGeometry(0.05, 0.05, 0.62), [0, Y_POOP + 0.2, -5.55]));
  glow(cabinGlass.done()!, 1.1);
  cabinGold.done();
  wGold.done();
  wWood.done();

  // aether core: caged crystal on a hatch amidships
  b.lathe(
    [
      [0, 0],
      [0.9, 0],
      [0.9, 0.16],
      [0.62, 0.3],
      [0.5, 0.5],
      [0.18, 0.6],
      [0, 0.6],
    ],
    { at: [0, Y_MAIN, 1.95], color: GOLDM, bone: hull, segments: 8, name: "corePedestal" },
  );
  const coreRods = new Batch(b, GOLDM, hull, "coreCage");
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const c = Math.cos(a);
    const s2 = Math.sin(a);
    const pts: P3[] = [P(c * 0.5, Y_MAIN + 0.55, 1.95 + s2 * 0.5), P(c * 0.74, Y_MAIN + 1.4, 1.95 + s2 * 0.74), P(c * 0.5, Y_MAIN + 2.3, 1.95 + s2 * 0.5), P(c * 0.1, Y_MAIN + 2.75, 1.95 + s2 * 0.1)];
    b.sweep(catmull(pts), 0.035, { bone: hull, color: GOLDM, sides: 4, caps: "round", name: "coreCageBar" });
  }
  coreRods.add(xf(new THREE.TorusGeometry(0.72, 0.035, 4, 12), [0, Y_MAIN + 1.4, 1.95], [90, 0, 0]));
  coreRods.done();
  const crystal = new Batch(b, "#7ffff0", hull, "aetherCrystal", false);
  crystal.add(xf(new THREE.OctahedronGeometry(0.55), [0, Y_MAIN + 1.45, 1.95], [0, 20, 0], [0.8, 1.55, 0.8]));
  glow(crystal.done()!, 1.4);
  const shards = new Batch(b, "#bffff6", hull, "aetherShards", false);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.5;
    shards.add(xf(new THREE.OctahedronGeometry(0.1), [Math.cos(a) * 1.05, Y_MAIN + 1.0 + (i % 3) * 0.55, 1.95 + Math.sin(a) * 1.05], [i * 20, i * 33, 0], [0.7, 1.4, 0.7]));
  }
  glow(shards.done()!, 1.4);

  // lantern posts at stairs and forecastle
  for (const [x, y, z] of [
    [1.95, Y_QUARTER, -2.95],
    [-1.95, Y_QUARTER, -2.95],
    [0.9, Y_FORE, 6.0],
    [-0.9, Y_FORE, 6.0],
    [1.65, Y_MAIN + 1, 4.3],
    [-1.65, Y_MAIN + 1, 4.3],
  ] as P3[]) {
    rails.add(rodG(P(x, y, z), P(x, y + 0.9, z), 0.04, 5));
    lantern(P(x, y + 1.15, z), 0.9);
  }
  rails.done();
  glow(lanternGlow.done()!, 1.3);
  lanternGold.done();

  // ------------------------------------------------------------ rudder
  b.extrude(
    [
      [0, 0],
      [1.0, -0.05],
      [1.15, -0.5],
      [0.95, -1.15],
      [0.45, -1.5],
      [0, -1.45],
    ],
    {
      at: [0, 2.3, -6.4],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.12,
      bevel: 0.025,
      smoothing: 1,
      bone: rudder,
      name: "rudderBlade",
      color: C(
        paint((_p, n, s) => {
          if (Math.abs(n.x) < 0.5) return GOLD;
          const [rx, ry] = s;
          if (ry > -0.16) return GOLD;
          if (Math.abs(fract(ry / 0.28) - 0.5) > 0.46) return GOLD;
          return rx > 0.88 + 0.1 * Math.min(0, ry + 0.5) ? GOLD : mix(NAVY, CRIM, smoothstep(-1.4, -0.1, ry));
        }),
      ),
    },
  );
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.6, 6), GOLDM, { bone: rudder, at: [0, 2.15, -6.5], name: "rudderStock" });

  // ------------------------------------------------------------ wing-fins and propeller pods
  function featherFan(
    bone: Joint,
    root: P3,
    s: number,
    count: number,
    len0: number,
    lenStep: number,
    a0: number,
    aStep: number,
    c1: Rgb,
    c2: Rgb,
    width: number,
    name: string,
    aftDir: P3 = [0, 0, -1],
    lean = 0.28,
  ) {
    for (let i = 0; i < count; i++) {
      const a = (a0 + aStep * i) * DEG;
      const L = len0 - lenStep * i;
      const dirX = V(aftDir).multiplyScalar(Math.cos(a)).add(new THREE.Vector3(0, Math.sin(a), 0)).add(new THREE.Vector3(s * lean, 0, 0)).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const dirY = up.sub(dirX.clone().multiplyScalar(up.dot(dirX))).normalize();
      const w = width * (0.85 + 0.15 * (1 - i / count));
      b.extrude(
        [
          [0, -0.1 * w],
          [L * 0.2, -0.32 * w],
          [L * 0.62, -0.4 * w],
          [L * 0.93, -0.18 * w],
          [L, 0.0, "sharp"],
          [L * 0.7, 0.34 * w],
          [L * 0.3, 0.38 * w],
          [0, 0.16 * w],
        ],
        {
          at: root,
          x: dirX,
          y: dirY,
          thickness: 0.06,
          bevel: 0.015,
          smoothing: 1,
          color: featherPaint(L, c1, c2),
          bone,
          name: `${name}${i}`,
        },
      );
    }
  }

  const struts = new Batch(b, GOLDM, hull, "podStruts");
  const podTrim = new Batch(b, GOLDM, hull, "podTrim");
  const podGlow = new Batch(b, "#7ffff0", hull, "podGlow", false);
  for (const s of [1, -1]) {
    const C0 = PROP_C[s];
    const prop = s > 0 ? propL : propR;
    // pod body (lathe along +Z)
    b.lathe(
      [
        [0, 0],
        [0.3, 0.05],
        [0.46, 0.4],
        [0.5, 0.9],
        [0.46, 1.5],
        [0.38, 1.95],
        [0.2, 2.2],
        [0, 2.28],
      ],
      {
        at: [C0[0], C0[1], C0[2] - 2.35],
        axis: [0, 0, 1],
        segments: 10,
        bone: hull,
        name: `pod${s > 0 ? "L" : "R"}`,
        color: C(
          paint((_p, _n, sc) => {
            const h = sc[0];
            if (Math.abs(h - 0.55) < 0.05 || Math.abs(h - 1.75) < 0.05) return GOLD;
            if (Math.abs(h - 1.1) < 0.1) return NAVY;
            return mix(TEAL, SKY, smoothstep(1.4, 2.3, h) * 0.6);
          }),
        ),
      },
    );
    podTrim.add(xf(new THREE.CylinderGeometry(0.4, 0.4, 0.07, 10), [C0[0], C0[1], C0[2] - 1.0], [90, 0, 0]));
    podGlow.add(xf(new THREE.TorusGeometry(0.4, 0.03, 4, 10), [C0[0], C0[1], C0[2] - 0.45]));
    // struts to the hull flank
    for (const zz of [C0[2] - 1.5, C0[2] - 0.6]) {
      const hy = 1.7;
      const hxx = halfWidthAt(zz, hy) - 0.08;
      struts.add(beamG(P(s * hxx, hy + 0.25, zz), P(C0[0], C0[1] + 0.12, zz), 0.16, 0.12, [0, 0, 1]));
      struts.add(beamG(P(s * hxx, hy - 0.35, zz), P(C0[0], C0[1] - 0.2, zz), 0.14, 0.1, [0, 0, 1]));
      struts.add(xf(new THREE.SphereGeometry(0.15, 6, 5), [s * hxx, hy - 0.05, zz]));
    }
    // wing-fin: a fan of long feathers on the flank, opening outward and aft
    for (let i = 0; i < 6; i++) {
      const k = i / 5;
      featherFan(hull, P(s * (2.42 + 0.03 * i), 2.0 + 0.04 * i, -0.45 - 0.05 * i), s, 1, 4.1 - 0.42 * i, 0, -6 + 15 * i, 0, mix(NAVY, TEAL, k), mix(TEAL, CREAM, k), 0.95 - 0.05 * i, `wing${s > 0 ? "L" : "R"}${i}_`, [0, 0, -1], 0.5);
    }
    b.part(new THREE.SphereGeometry(0.26, 7, 5), GOLDM, { bone: hull, at: [s * 2.48, 2.05, -0.5], scale: [0.8, 1, 1.2], name: "wingRoot" });
    b.part(new THREE.SphereGeometry(0.14, 6, 5), GOLDM, { bone: hull, at: [s * 2.62, 2.1, -0.52], name: "wingJewel" });

    // propeller on its own hinge: hub, spinner, four blades, ducting ring
    const hubG = new Batch(b, GOLDM, prop, `propHub${s > 0 ? "L" : "R"}`);
    hubG.add(xf(new THREE.SphereGeometry(0.2, 8, 6), [C0[0], C0[1], C0[2]]));
    hubG.add(xf(new THREE.ConeGeometry(0.17, 0.44, 8), [C0[0], C0[1], C0[2] + 0.3], [90, 0, 0]));
    const ringPts: P3[] = [];
    const RR = 1.3;
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      ringPts.push(P(C0[0] + Math.cos(a) * RR, C0[1] + Math.sin(a) * RR, C0[2] + 0.05));
    }
    b.sweep(catmull(ringPts, { closed: true }), 0.045, { bone: prop, color: GOLDM, sides: 5, name: `propRing${s > 0 ? "L" : "R"}` });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const rad = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
      const tan = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
      const pitch = tan.clone().multiplyScalar(Math.cos(0.32)).add(new THREE.Vector3(0, 0, Math.sin(0.32)));
      b.extrude(
        [
          [0.14, -0.1],
          [0.42, -0.22],
          [0.95, -0.24],
          [1.28, -0.1],
          [1.28, 0.1],
          [0.95, 0.2],
          [0.42, 0.18],
          [0.14, 0.09],
        ],
        {
          at: [C0[0], C0[1], C0[2] + 0.02],
          x: rad,
          y: pitch,
          thickness: 0.05,
          bevel: 0.012,
          smoothing: 1,
          bone: prop,
          name: `propBlade${s > 0 ? "L" : "R"}${i}`,
          color: C(
            paint((_p, _n, sc) => {
              const x = sc[0];
              if (x > 1.12) return GOLD;
              if (Math.abs(sc[1]) < 0.018) return GOLD;
              return mix(TEAL, SKY, smoothstep(0.3, 1.1, x));
            }),
          ),
        },
      );
    }
    hubG.done();
  }
  struts.done();
  podTrim.done();
  glow(podGlow.done()!, 1.3);

  // ------------------------------------------------------------ bow: stem scroll, figurehead (winged phoenix)
  const stemRoot = P(0, 4.3, 7.3);
  const neck = catmull([stemRoot, P(0, 4.55, 7.9), P(0, 4.55, 8.45), P(0, 4.15, 8.85)]);
  b.sweep(neck, [0.22, 0.14], { bone: hull, color: GOLDM, sides: 8, caps: "round", name: "phoenixNeck" });
  b.part(new THREE.SphereGeometry(1, 8, 6), GOLDM, { bone: hull, at: [0, 4.05, 8.95], scale: [0.2, 0.19, 0.27], name: "phoenixHead" });
  b.part(new THREE.ConeGeometry(0.1, 0.42, 6), CRIMM, { bone: hull, at: [0, 3.98, 9.3], dir: [0, -0.2, 1], name: "phoenixBeak" });
  for (const s of [1, -1]) {
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), "#7ffff0", { bone: hull, at: [s * 0.15, 4.12, 9.0], name: "phoenixEye" }), 1.4);
    b.spike(P(s * 0.1, 4.2, 8.85), P(s * 0.35, 4.75, 8.4), null, 0.045, { bone: hull, color: CRIMM, name: "phoenixCrest" });
  }
  b.spike(P(0, 4.25, 8.85), P(0, 4.95, 8.35), null, 0.05, { bone: hull, color: CRIMM, name: "phoenixCrest" });
  for (const s of [1, -1]) {
    featherFan(hull, P(s * 0.22, 4.15, 7.3), s, 4, 1.6, 0.18, 10, 16, CREAM, GOLD, 0.5, `phoenixWing${s > 0 ? "L" : "R"}`, [0, 0, -1], 0.9);
  }
  // stem scroll under the figurehead
  b.sweep(catmull([P(0, 4.0, 7.35), P(0, 3.4, 7.15), P(0, 2.9, 6.5)]), [0.1, 0.06], { bone: hull, color: GOLDM, sides: 6, name: "stemGold" });
  // anchor hung on the left bow flank
  const anchorAt = hullSkin.ray([9, 3.0, 5.5], [-1, 0, 0]);
  if (anchorAt) {
    const ax = anchorAt.at.x + 0.12;
    const ay = anchorAt.at.y + 0.1;
    const az = anchorAt.at.z;
    b.extrude(
      [
        [-0.46, 0.12],
        [-0.4, -0.05],
        [-0.22, -0.2],
        [0, -0.26],
        [0.22, -0.2],
        [0.4, -0.05],
        [0.46, 0.12],
        [0.36, 0.06],
        [0.2, -0.08],
        [0, -0.14],
        [-0.2, -0.08],
        [-0.36, 0.06],
      ],
      { at: [ax, ay, az], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.08, bevel: 0.015, color: IRONM, bone: hull, name: "anchorArms" },
    );
    const ironBits = new Batch(b, IRONM, hull, "anchorShank");
    ironBits.add(xf(new THREE.BoxGeometry(0.08, 0.72, 0.1), [ax, ay + 0.2, az]));
    ironBits.add(xf(new THREE.BoxGeometry(0.07, 0.07, 0.5), [ax, ay + 0.42, az]));
    ironBits.add(xf(new THREE.TorusGeometry(0.08, 0.025, 4, 8), [ax, ay + 0.6, az], [0, 90, 0]));
    ironBits.done();
  }

  // ------------------------------------------------------------ streamers, bunting, rivets, bell, volutes, fife rails
  const ribbon = (root: P3, dir: P3, len: number, w: number, name: string, colA: Rgb, colB: Rgb) => {
    const d = V(dir).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const side = up.clone().cross(d).normalize();
    const A: P3[] = [];
    const B: P3[] = [];
    for (let i = 0; i <= 9; i++) {
      const t = i / 9;
      const c = V(root)
        .addScaledVector(d, len * t)
        .addScaledVector(side, 0.4 * Math.sin(t * 7 + 0.5) * t)
        .addScaledVector(up, -0.7 * t * t + 0.12 * Math.sin(t * 9));
      const half = (w * (1 - 0.8 * t)) / 2;
      const ang = t * 2.4;
      const wv = up.clone().multiplyScalar(Math.cos(ang)).addScaledVector(side, Math.sin(ang));
      A.push(P(c.x + wv.x * half, c.y + wv.y * half, c.z + wv.z * half));
      B.push(P(c.x - wv.x * half, c.y - wv.y * half, c.z - wv.z * half));
    }
    b.membrane(catmull(A), catmull(B), {
      color: softCel(
        paint((_p, _n, s) => {
          if (Math.min(s[1], 1 - s[1]) < 0.12) return GOLD;
          return mix(colA, colB, s[0]);
        }),
      ),
      thickness: 0.03,
      rows: 2,
      cols: 16,
      bone: hull,
      name,
    });
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    ribbon(P(s * 0.72, 6.25, -5.4), [s * 0.18, 0.06, -1], 4.8, 0.6, `ribbonSwan${side}`, TEAL, SKY);
    ribbon(P(s * 1.9, 13.1, MASTS.main + 0.38), [s * 0.25, 0, -1], 2.8, 0.34, `ribbonMain${side}`, CRIM, GOLD);
    ribbon(P(s * 1.5, 11.7, MASTS.fore + 0.38), [s * 0.25, 0, -1], 2.4, 0.3, `ribbonFore${side}`, CRIM, GOLD);
  }

  // signal bunting strung from the main masthead to the mizzen
  const FLAG = svg(
    `<svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg"><path d="M1 1 H23 V20 L12 31 L1 20 Z" fill="#ffffff"/><path d="M1 1 H23 V8 H1 Z" fill="#d6d6d6"/></svg>`,
    { size: 96 },
  );
  const buntLine = catmull([P(0, 13.5, MASTS.main - 0.2), P(0, 11.4, -2.2), P(0, 10.5, MASTS.mizzen - 0.2)]);
  b.sweep(buntLine, 0.02, { bone: hull, color: ROPE, sides: 4, caps: "none", name: "buntingLine" });
  const flagSets: Frame[][] = [[], [], []];
  for (let i = 1; i <= 17; i++) {
    const p = buntLine.at(i / 18);
    flagSets[i % 3].push(frame(P(p.x, p.y, p.z), [0, 1, 0]));
  }
  ["#dc3a52", "#34dccb", "#ffd24d"].forEach((col, i) =>
    b.cards(flagSets[i], FLAG, { size: [0.28, 0.38], lean: 180, flow: [1, 0, 0], color: col, sink: 0, name: `bunting${i}` }),
  );

  // fife rails round the mast feet, with belaying pins
  const fife = new Batch(b, GOLDM, hull, "fifeRails");
  const pins = new Batch(b, WOODM, hull, "belayingPins");
  for (const [mz, y0] of [
    [MASTS.main, Y_MAIN],
    [MASTS.fore, Y_MAIN],
    [MASTS.mizzen, Y_QUARTER],
  ] as Array<[number, number]>) {
    fife.add(xf(new THREE.TorusGeometry(0.55, 0.035, 4, 14), [0, y0 + 0.62, mz], [90, 0, 0]));
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const cx = Math.cos(a) * 0.55;
      const cz = mz + Math.sin(a) * 0.55;
      pins.add(rodG(P(cx, y0 + 0.5, cz), P(cx, y0 + 0.86, cz), 0.022, 4));
      if (i % 2 === 0) fife.add(rodG(P(cx, y0, cz), P(cx, y0 + 0.62, cz), 0.03, 4));
    }
  }
  fife.done();
  pins.done();

  // gold rivets along the upper strake
  const rivets = new Batch(b, GOLDM, hull, "hullRivets");
  for (const s of [1, -1]) {
    const line = catmull(hullLine(s, 0.915, 0.03, 0));
    for (let i = 1; i < 56; i++) {
      const p = line.at(i / 56);
      rivets.add(xf(new THREE.BoxGeometry(0.055, 0.055, 0.03), [p.x, p.y, p.z], [0, s * 90, 0]));
    }
  }
  rivets.done();

  // forecastle bell on a gold gallows
  const gallows = new Batch(b, GOLDM, hull, "bellGallows");
  for (const x of [-0.38, 0.38]) gallows.add(rodG(P(x, Y_FORE, 5.45), P(x, Y_FORE + 1.12, 5.45), 0.04, 5));
  gallows.add(rodG(P(-0.4, Y_FORE + 1.12, 5.45), P(0.4, Y_FORE + 1.12, 5.45), 0.035, 5));
  gallows.done();
  b.lathe(
    [
      [0, 0.3],
      [0.12, 0.28],
      [0.16, 0.12],
      [0.24, -0.02],
      [0.2, -0.02],
      [0.12, 0.1],
      [0.08, 0.2],
      [0, 0.2],
    ],
    { at: [0, Y_FORE + 0.8, 5.45], color: GOLDM, bone: hull, segments: 8, name: "shipBell" },
  );

  // gold volutes carved on the flanks near bow and stern
  for (const s of [1, -1])
    for (const z of [5.3, -5.2]) {
      const yk = lerpArr(YK, z);
      const yt = lerpArr(YT, z);
      const hit = hullSkin.ray([s * 9, yk + 0.34 * (yt - yk), z], [-s, 0, 0]);
      if (!hit) continue;
      const c = hit.at.clone().addScaledVector(hit.n, 0.04);
      const from = c.clone().add(new THREE.Vector3(0, 0.34, 0));
      b.sweep(spiral(c, from, hit.n, { turns: -s * 1.35, r1: 0.06 }), [0.04, 0.022], { bone: hull, color: GOLDM, sides: 5, caps: "round", name: "volute" });
    }

  // drifting aether sparkles around the wings, props and wake (glowing four-point star cards)
  const starSvg = (outer: string, inner: string) =>
    svg(
      `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 1 L19.5 12.5 L31 16 L19.5 19.5 L16 31 L12.5 19.5 L1 16 L12.5 12.5 Z" fill="${outer}"/><path d="M16 8 L18 14 L24 16 L18 18 L16 24 L14 18 L8 16 L14 14 Z" fill="${inner}"/></svg>`,
      { size: 96 },
    );
  const STARS = [starSvg("#ffd24d", "#fffbe0"), starSvg("#5ff2e0", "#eaffff")];
  const sparkR = rng(5);
  const sparkFrames: Frame[] = [];
  for (let i = 0; i < 26; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    sparkFrames.push(frame(P(side * (3.0 + sparkR() * 2.6), 0.9 + sparkR() * 4.6, -2.8 + sparkR() * 6.2), [0, 1, 0]));
  }
  for (let i = 0; i < 12; i++) sparkFrames.push(frame(P((sparkR() - 0.5) * 3.4, 3.0 + sparkR() * 3.2, -7.4 - sparkR() * 2.2), [0, 1, 0]));
  glow(b.cards(sparkFrames, STARS, { size: [0.22, 0.22], vary: 0.55, rng: sparkR, spin: 25, cross: true, sink: 0, lean: 0, flow: [0, 0, 1], name: "sparkles" }), 1.3);
  return b.root;
}
