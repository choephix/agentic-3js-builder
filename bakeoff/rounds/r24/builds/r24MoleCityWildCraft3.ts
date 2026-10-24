// STYLE: "RISOGRAPH PAPER-CUT SHADOWBOX". The mole's home is a stack of die-cut paper sheets
// printed in a handful of fluorescent spot inks (pink, blue, orange, yellow, teal) on kraft/cream stock.
// Every large surface carries a misregistered halftone-dot screen instead of smooth shading.
// The soil layers are cut-out SVG sheets, the chambers are real holes, and the keylines are dark ink.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, paint, noise, catmull, spiral, frame, svg } from "../../../../src/index";

export const meta = {
  name: "Molehill Manor",
  description:
    "Risograph paper-cut shadowbox: a cutaway of a mole's underground home with nest, worm larder, nursery, glow-worm tunnels, mushroom gallery and crystal cellar.",
};

// ------------------------------------------------------------------ palette (spot inks)
const C = {
  navy: "#161d5c", blue: "#3e55d6", pink: "#ff5aa8", pinkL: "#ff9ccb", orange: "#ff6a2a", yellow: "#ffd92e",
  teal: "#14b3a6", green: "#2ba85c", greenD: "#16743f", lime: "#a6df4a", purple: "#7d5bd6", burg: "#6a2540",
  kraft: "#d8b27a", cream: "#fff1d0", ink: "#3a1426",
};

// ------------------------------------------------------------------ world constants
const W = 1600, BOT = 900, TOP = -60, RIM = 9;
const X = (sx: number) => sx / 1000 - 0.8;
const Y = (sy: number) => 1 - sy / 1000;
const LZ = [0.14, 0.11, 0.08, 0.05];
const BACK = -0.225;

type Chamber = { n: string; cx: number; cy: number; rx: number; ry: number; seed: number };
const CH: Chamber[] = [
  { n: "nest", cx: 800, cy: 560, rx: 240, ry: 150, seed: 1 },
  { n: "larder", cx: 250, cy: 470, rx: 150, ry: 105, seed: 2 },
  { n: "nursery", cx: 1330, cy: 520, rx: 170, ry: 120, seed: 3 },
  { n: "gallery", cx: 430, cy: 770, rx: 120, ry: 65, seed: 4 },
  { n: "cellar", cx: 1150, cy: 775, rx: 130, ry: 62, seed: 5 },
];
const floorSy = (c: Chamber) => c.cy + 0.8 * c.ry;
const MAIN: number[][] = [[170, 232], [360, 226], [550, 232], [800, 228], [1100, 222], [1330, 216], [1470, 224]];
const TUN: { w: number; p: number[][] }[] = [
  { w: 62, p: [[550, -30], [550, 120], [552, 232]] },
  { w: 60, p: MAIN },
  { w: 52, p: [[300, 232], [292, 300], [262, 380]] },
  { w: 54, p: [[1330, 216], [1336, 320], [1330, 430]] },
  { w: 56, p: [[800, 228], [804, 330], [800, 440]] },
  { w: 50, p: [[620, 640], [570, 700], [510, 745]] },
  { w: 50, p: [[980, 640], [1050, 700], [1120, 745]] },
  { w: 46, p: [[210, 560], [230, 650], [350, 745]] },
  { w: 46, p: [[1340, 610], [1310, 700], [1260, 760]] },
  { w: 48, p: [[1020, 545], [1100, 548], [1180, 530]] },
  { w: 48, p: [[580, 520], [480, 500], [390, 480]] },
  { w: 40, p: [[1100, 222], [1150, 150], [1230, 100]] },
];

// ------------------------------------------------------------------ halftone paint (the riso screen)
const LIGHT = new THREE.Vector3(0.3, 0.75, 0.6).normalize();
function halftone(base: any, ink: any, o: { cell?: number; bias?: number; seed?: number } = {}) {
  const cell = o.cell ?? 0.016;
  const bias = o.bias ?? 0;
  const k = Math.SQRT1_2;
  return paint((p, n) => {
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const ru = ((u + v) * k) / cell, rv = ((u - v) * k) / cell;
    const fu = ru - Math.floor(ru) - 0.5, fv = rv - Math.floor(rv) - 0.5;
    const d = Math.hypot(fu, fv);
    const lit = n.dot(LIGHT) * 0.5 + 0.5;
    const cov = Math.min(Math.max(0.8 - lit * 0.9 + bias + (noise(p, 0.12, o.seed ?? 0) - 0.5) * 0.35, 0), 1);
    return d < 0.62 * Math.sqrt(cov) ? ink : base;
  });
}

const STR_COL = [
  ["#34b866", "#1b7a45"], ["#8a3550", "#4a1a30"], ["#d9582f", "#8c2a22"],
  ["#eaa23c", "#c0602a"], ["#f2dca4", "#e08a5a"], ["#3b4fb8", "#1c2670"],
];
const STR_HT = STR_COL.map(([a, c]) => halftone(a, c, { cell: 0.018 }));
const SOIL = paint((p) =>
  p.y > 0.97 ? STR_HT[0] : p.y > 0.87 ? STR_HT[1] : p.y > 0.6 ? STR_HT[2] : p.y > 0.32 ? STR_HT[3] : p.y > 0.15 ? STR_HT[4] : STR_HT[5],
);
const GRASS_HT = halftone("#34b866", "#16743f", { cell: 0.016 });
const STRAW_HT = halftone("#f6c23e", "#d0602a", { cell: 0.012 });
const PLINTH_HT = halftone(C.navy, C.blue, { cell: 0.02, bias: -0.15 });
const TRIM_HT = halftone(C.kraft, C.orange, { cell: 0.016 });
const PINK_HT = halftone(C.pinkL, C.pink, { cell: 0.009 });
const WOOD_HT = halftone("#c98a4a", "#7a3a22", { cell: 0.012 });
const STONE_HT = halftone("#9db2f5", "#3e55d6", { cell: 0.012 });

// ------------------------------------------------------------------ svg helpers
const fmt = (n: number) => n.toFixed(1);
function smoothD(pts: number[][], closed: boolean): string {
  const n = pts.length;
  const g = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    d += `C${fmt(p1[0] + (p2[0] - p0[0]) / 6)} ${fmt(p1[1] + (p2[1] - p0[1]) / 6)} ${fmt(p2[0] - (p3[0] - p1[0]) / 6)} ${fmt(p2[1] - (p3[1] - p1[1]) / 6)} ${fmt(p2[0])} ${fmt(p2[1])}`;
  }
  return closed ? d + "Z" : d;
}
function blobPts(c: Chamber): number[][] {
  const r = rng(c.seed * 31 + 7);
  const N = 18;
  const out: number[][] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const jit = 0.94 + 0.12 * r();
    const sn = Math.sin(a);
    const y = sn < 0 ? c.cy + sn * c.ry * jit : Math.min(c.cy + sn * c.ry * 1.3 * jit, c.cy + 0.8 * c.ry);
    out.push([c.cx + Math.cos(a) * c.rx * jit, y]);
  }
  return out;
}
function holes(grow: number): string {
  let s = "";
  for (const c of CH) {
    const d = smoothD(blobPts(c), true);
    s +=
      grow >= 0
        ? `<path d="${d}" fill="#000" stroke="#000" stroke-width="${fmt(grow * 2)}" stroke-linejoin="round"/>`
        : `<path d="${d}" fill="#000" stroke="#fff" stroke-width="${fmt(-grow * 2)}" stroke-linejoin="round"/>`;
  }
  for (const t of TUN)
    s += `<path d="${smoothD(t.p, false)}" fill="none" stroke="#000" stroke-width="${fmt(Math.max(4, t.w + grow * 2))}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return s;
}
const wave = (x: number, amp: number, ph: number) => amp * (Math.sin(x / 120 + ph) + 0.5 * Math.sin(x / 41 + ph * 2.3));
function bound(y0: number, amp: number, ph: number) {
  let d = `M0 ${fmt(y0 + wave(0, amp, ph))}`;
  for (let x = 40; x <= W; x += 40) d += `L${x} ${fmt(y0 + wave(x, amp, ph))}`;
  return d + `L${W} ${BOT}L0 ${BOT}Z`;
}
function waveLine(y0: number, amp: number, ph: number) {
  let d = `M0 ${fmt(y0 + wave(0, amp, ph))}`;
  for (let x = 40; x <= W; x += 40) d += `L${x} ${fmt(y0 + wave(x, amp, ph))}`;
  return d;
}
const pat = (id: string, color: string, r: number) =>
  `<pattern id="${id}" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="translate(3 2) rotate(45)"><circle cx="8" cy="8" r="${r}" fill="${color}"/></pattern>`;

const STRATA = [
  { y: -30, amp: 0, ph: 0, i: 1, r: 2.8 },
  { y: 130, amp: 9, ph: 0.6, i: 2, r: 3.2 },
  { y: 400, amp: 14, ph: 2.1, i: 3, r: 3.4 },
  { y: 680, amp: 12, ph: 4.0, i: 4, r: 3.0 },
  { y: 850, amp: 6, ph: 1.3, i: 5, r: 3.6 },
];

function blades(): string {
  const r = rng(5);
  const greens = ["#2ba85c", "#1b8a4a", "#7fd24a", "#34b866"];
  let s = "";
  for (let x = -10; x < W; x += 15) {
    if (x > 505 && x < 590) continue;
    const h = 22 + r() * 34, lean = (r() - 0.5) * 26, w = 9 + r() * 5;
    const c = greens[Math.floor(r() * greens.length)];
    s += `<path d="M${x} 8 Q${fmt(x + w * 0.2 + lean * 0.3)} ${fmt(-h * 0.5)} ${fmt(x + lean + w * 0.5)} ${fmt(-h)} Q${fmt(x + w * 0.9 + lean * 0.2)} ${fmt(-h * 0.4)} ${x + w} 8Z" fill="${c}" stroke="#0d4a2a" stroke-width="2.2" stroke-linejoin="round"/>`;
  }
  return s;
}

function decor(): string {
  const r = rng(11);
  let s = "";
  const roots: number[][][] = [
    [[120, 0], [135, 60], [110, 130], [125, 210], [100, 290]],
    [[135, 60], [170, 95], [185, 150]],
    [[430, 0], [420, 70], [450, 120], [430, 180]],
    [[1000, 0], [1020, 80], [990, 150], [1010, 215]],
    [[1020, 80], [1070, 110], [1100, 170]],
    [[1480, 0], [1450, 70], [1500, 140], [1470, 200]],
    [[700, 0], [690, 60], [720, 110]],
  ];
  for (const rt of roots) s += `<path d="${smoothD(rt, false)}" fill="none" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/>`;
  for (const rt of roots) s += `<path d="${smoothD(rt, false)}" fill="none" stroke="#f6e6b8" stroke-width="4.5" stroke-linecap="round"/>`;
  for (let i = 0; i < 150; i++)
    s += `<circle cx="${fmt(r() * W)}" cy="${fmt(60 + r() * 830)}" r="${fmt(1.5 + r() * 2.2)}" fill="#fff" opacity="0.35"/>`;
  for (let i = 0; i < 18; i++) {
    const x = r() * W, y = 150 + r() * 680, rx = 14 + r() * 20, ry = 10 + r() * 14;
    const f = i % 2 ? "#f2e4c4" : "#bfcdf7";
    s += `<ellipse cx="${fmt(x)}" cy="${fmt(y)}" rx="${fmt(rx)}" ry="${fmt(ry)}" fill="${f}" stroke="${C.ink}" stroke-width="4"/>`;
    s += `<path d="M${fmt(x - rx * 0.5)} ${fmt(y - ry * 0.3)} Q${fmt(x)} ${fmt(y - ry * 0.7)} ${fmt(x + rx * 0.4)} ${fmt(y - ry * 0.3)}" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
  const wormAt = [[60, 780, -8], [700, 360, 14], [1450, 360, -20], [620, 820, 5], [980, 170, 10]];
  for (const [x, y, a] of wormAt) {
    const d = `M0 0 q15 -14 30 0 t30 0 t30 0 t30 0`;
    s += `<g transform="translate(${x} ${y}) rotate(${a})"><path d="${d}" fill="none" stroke="${C.ink}" stroke-width="12" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#ff7aa5" stroke-width="6.5" stroke-linecap="round"/></g>`;
  }
  s += `<g transform="translate(655 335) rotate(-20)" fill="${C.cream}" stroke="${C.ink}" stroke-width="4"><circle cx="-42" cy="-8" r="9"/><circle cx="-42" cy="8" r="9"/><circle cx="42" cy="-8" r="9"/><circle cx="42" cy="8" r="9"/><rect x="-40" y="-7" width="80" height="14" rx="5"/></g>`;
  let sp = "";
  for (let k = 0; k < 64; k++) sp += `${k ? "L" : "M"}${fmt(1470 + (3 + k * 0.55) * Math.cos(k * 0.36))} ${fmt(760 + (3 + k * 0.55) * Math.sin(k * 0.36))}`;
  s += `<circle cx="1470" cy="760" r="44" fill="${C.cream}" stroke="${C.ink}" stroke-width="5"/><path d="${sp}" fill="none" stroke="${C.burg}" stroke-width="5" stroke-linecap="round"/>`;
  s += `<g transform="translate(70 640)"><ellipse cx="0" cy="8" rx="18" ry="22" fill="#b5651d" stroke="${C.ink}" stroke-width="4"/><path d="M-20 -6 Q0 -22 20 -6 L18 2 Q0 -6 -18 2Z" fill="#7a3a22" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/></g>`;
  for (let i = 0; i < 9; i++) {
    const x = 20 + i * 190 + r() * 40;
    s += `<path d="M${fmt(x)} ${BOT} L${fmt(x + 14)} ${fmt(870 - r() * 14)} L${fmt(x + 28)} ${BOT}Z" fill="${i % 2 ? C.teal : C.pinkL}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>`;
  }
  return s;
}

function layerSvg(front: boolean, shrink: number): string {
  const H = BOT - TOP;
  const silD = (() => {
    let d = `M0 ${fmt(4 + wave(0, 2.5, 1.1))}`;
    for (let x = 20; x <= W; x += 20) d += `L${x} ${fmt(4 + wave(x, 2.5, 1.1))}`;
    return d + `L${W} ${BOT}L0 ${BOT}Z`;
  })();
  const mask = (id: string, g: number) =>
    `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="${TOP}" width="${W}" height="${H}"><rect x="0" y="${TOP}" width="${W}" height="${H}" fill="#fff"/>${holes(g)}</mask>`;
  let pats = "";
  let strata = "";
  STRATA.forEach((st, k) => {
    const [fill, dot] = STR_COL[st.i];
    pats += pat(`p${k}`, dot, st.r);
    strata += `<path d="${bound(st.y, st.amp, st.ph)}" fill="${fill}"/><path d="${bound(st.y, st.amp, st.ph)}" fill="url(#p${k})"/>`;
    if (k > 0) strata += `<path d="${waveLine(st.y, st.amp, st.ph)}" fill="none" stroke="${C.ink}" stroke-width="3" opacity="0.55"/>`;
  });
  pats += pat("pt", STR_COL[0][1], 2.8);
  let turf = `M0 -20 L${W} -20`;
  for (let x = W; x >= 0; x -= 20) turf += `L${x} ${fmt(30 + wave(x, 4, 0.4))}`;
  turf += "Z";
  strata += `<path d="${turf}" fill="${STR_COL[0][0]}"/><path d="${turf}" fill="url(#pt)"/><path d="${waveLine(30, 4, 0.4)}" fill="none" stroke="${C.ink}" stroke-width="3" opacity="0.6"/>`;
  const defs = `<defs><clipPath id="sil"><path d="${silD}"/></clipPath>${mask("mA", -shrink)}${mask("mB", RIM - shrink)}${pats}</defs>`;
  const rim = `<g clip-path="url(#sil)" mask="url(#mA)"><rect x="0" y="${TOP}" width="${W}" height="${H}" fill="${front ? C.ink : "#2a1030"}"/></g>`;
  const body = `<g clip-path="url(#sil)" mask="url(#mB)">${strata}${front ? decor() : ""}</g>`;
  return `<svg viewBox="0 ${TOP} ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${defs}${rim}${body}${front ? blades() : ""}</svg>`;
}

function backSvg(): string {
  const H = BOT - TOP;
  const glows = [["#ff8a4a", 0.7], ["#ffd24a", 0.6], ["#ff5aa8", 0.6], ["#14b3a6", 0.6], ["#7d5bd6", 0.7]];
  let defs = `<pattern id="bd" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="7" cy="7" r="2.3" fill="#2c4fd8" opacity="0.7"/></pattern>`;
  let over = "";
  CH.forEach((c, i) => {
    defs += `<radialGradient id="g${i}" gradientUnits="userSpaceOnUse" cx="${c.cx}" cy="${c.cy}" r="${c.rx * 1.25}"><stop offset="0" stop-color="${glows[i][0]}" stop-opacity="${glows[i][1]}"/><stop offset="1" stop-color="${glows[i][0]}" stop-opacity="0"/></radialGradient>`;
    over += `<circle cx="${c.cx}" cy="${c.cy}" r="${c.rx * 1.25}" fill="url(#g${i})"/>`;
  });
  const r = rng(77);
  let claws = "";
  for (let i = 0; i < 14; i++) {
    const x = r() * W, y = 100 + r() * 760;
    for (let k = 0; k < 3; k++) claws += `<path d="M${fmt(x + k * 9)} ${fmt(y)} q6 18 2 36" stroke="#3a4cc0" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
  return `<svg viewBox="0 ${TOP} ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs><rect x="0" y="${TOP}" width="${W}" height="${H}" fill="#141b55"/><rect x="0" y="${TOP}" width="${W}" height="${H}" fill="url(#bd)"/>${over}${claws}</svg>`;
}

const bladeTex = (c1: string, c2: string) =>
  svg(
    `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg"><path d="M6 100 Q12 50 2 8 Q22 40 26 100Z" fill="${c2}" stroke="#0d4a2a" stroke-width="2.5" stroke-linejoin="round"/><path d="M22 100 Q28 40 30 0 Q42 40 40 100Z" fill="${c1}" stroke="#0d4a2a" stroke-width="2.5" stroke-linejoin="round"/><path d="M38 100 Q48 55 58 14 Q58 60 52 100Z" fill="${c2}" stroke="#0d4a2a" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
    { size: 160 },
  );

// ------------------------------------------------------------------ small geometry helpers
function petalGeo(n: number, r: number, len: number, wid: number) {
  const gs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < n; i++) {
    const g = new THREE.SphereGeometry(1, 6, 4);
    g.scale(len, wid, 0.003);
    g.translate(r, 0, 0);
    g.rotateZ((i / n) * Math.PI * 2);
    gs.push(g);
  }
  return mergeGeometries(gs)!;
}
const lathe = (pts: number[][], seg: number) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);

// ------------------------------------------------------------------ the model
export default function build() {
  const b = createBuilder({ name: "molehill-manor", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const P = (g: THREE.BufferGeometry, color: any, o: any = {}) => b.part(g, color, { bone: root, ...o });
  const SW = (path: any, r: any, o: any = {}) => b.sweep(path, r, { bone: root, ...o });

  const glowCache = new Map<THREE.Material, Map<number, THREE.MeshStandardMaterial>>();
  const glow = (part: any, k = 1) => {
    const mesh: THREE.Mesh = part.mesh ?? part;
    const m = mesh.material as THREE.MeshStandardMaterial;
    let byK = glowCache.get(m);
    if (!byK) glowCache.set(m, (byK = new Map()));
    let c = byK.get(k);
    if (!c) {
      c = m.clone();
      c.emissive.copy(m.color);
      c.emissiveMap = m.map;
      c.emissiveIntensity = k;
      byK.set(k, c);
    }
    mesh.material = c;
    return part;
  };

  // ---------------------------------------------------------------- textures
  const FRONT = svg(layerSvg(true, 0), { size: 2048 });
  const MIDS = [3, 6, 9].map((sh) => svg(layerSvg(false, sh), { size: 900 }));
  const BACKT = svg(backSvg(), { size: 1024 });
  const PLAQUE = svg(
    `<svg viewBox="0 0 900 55" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="896" height="51" rx="6" fill="${C.cream}" stroke="${C.navy}" stroke-width="3"/><text x="450" y="30" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="26" fill="${C.navy}" letter-spacing="5">MOLEHILL MANOR</text><text x="450" y="47" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="12" fill="${C.pink}">Talpa europaea · cross-section no. 7 · every room with a view</text><circle cx="40" cy="27" r="7" fill="${C.pink}"/><circle cx="860" cy="27" r="7" fill="${C.teal}"/></svg>`,
    { size: 1600 },
  );
  const SIGN = svg(
    `<svg viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="114" height="42" rx="6" fill="#e0a560" stroke="${C.ink}" stroke-width="4"/><path d="M12 14 H108 M12 36 H108" stroke="#b5762f" stroke-width="2.5"/><text x="60" y="34" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="22" fill="${C.ink}" letter-spacing="2">WORMS</text></svg>`,
    { size: 320 },
  );
  const SAMPLER = svg(
    `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="90" fill="${C.cream}"/><rect x="6" y="6" width="108" height="78" fill="none" stroke="${C.pink}" stroke-width="3" stroke-dasharray="4 3"/><text x="60" y="30" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="16" fill="${C.blue}">HOME</text><text x="60" y="50" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="16" fill="${C.blue}">SWEET</text><text x="60" y="70" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="16" fill="${C.blue}">HOLE</text><path d="M96 66 c-6 -8 -14 0 -8 6 l8 7 l8 -7 c6 -6 -2 -14 -8 -6Z" fill="${C.pink}"/></svg>`,
    { size: 512 },
  );
  const BLADE1 = bladeTex("#34b866", "#1b8a4a");
  const BLADE2 = bladeTex("#a6df4a", "#2ba85c");

  // ---------------------------------------------------------------- plinth, walls, layers
  P(new THREE.BoxGeometry(1.8, 0.07, 0.5), PLINTH_HT, { at: [0, 0.035, -0.04] });
  P(new THREE.BoxGeometry(1.7, 0.03, 0.42), TRIM_HT, { at: [0, 0.085, -0.04] });
  P(new THREE.PlaneGeometry(0.9, 0.055), "#ffffff", { at: [0, 0.037, 0.2115], texture: PLAQUE });
  for (const s of [1, -1]) {
    P(new THREE.BoxGeometry(0.03, 0.9, 0.4), SOIL, { at: [s * 0.815, 0.55, -0.04] });
    for (const z of [-0.2, 0.12]) P(new THREE.CylinderGeometry(0.02, 0.026, 0.02, 6), C.orange, { at: [s * 0.82, 0.02, z], flat: true });
  }
  P(new THREE.BoxGeometry(1.6, 0.9, 0.03), "#141b55", { at: [0, 0.55, -0.24] });
  P(new THREE.PlaneGeometry(1.6, 0.96), "#ffffff", { at: [0, 0.58, BACK + 0.001], texture: BACKT });
  LZ.forEach((z, i) =>
    P(new THREE.PlaneGeometry(1.6, 0.96), "#ffffff", { at: [0, 0.58, z], texture: i === 0 ? FRONT : MIDS[i - 1] }),
  );
  P(new THREE.BoxGeometry(0.545, 0.03, 0.4), GRASS_HT, { at: [-0.5575, 0.985, -0.04] });
  P(new THREE.BoxGeometry(1.045, 0.03, 0.4), GRASS_HT, { at: [0.3075, 0.985, -0.04] });

  // chamber floors (ledges that run back to the wall)
  for (const c of CH)
    P(new THREE.BoxGeometry((c.rx * 1.7) / 1000, 0.05, 0.28), SOIL, { at: [X(c.cx), Y(floorSy(c)) - 0.025, -0.09] });

  // ---------------------------------------------------------------- surface: molehill, grass, flowers
  const MX = X(550);
  P(
    lathe([[0, -0.02], [0.125, -0.02], [0.118, 0.0], [0.098, 0.034], [0.07, 0.07], [0.042, 0.094], [0.03, 0.086], [0, 0.068]], 10),
    halftone("#9a4058", "#4a1a30", { cell: 0.014 }),
    { at: [MX, 1.0, -0.04], flat: true },
  );
  P(new THREE.CircleGeometry(0.028, 8), C.navy, { at: [MX, 1.07, -0.04], rotation: [-90, 0, 0] });
  const clr = rng(21);
  for (let i = 0; i < 6; i++) {
    const a = clr() * 6.28, d = 0.12 + clr() * 0.05;
    P(new THREE.IcosahedronGeometry(0.014 + clr() * 0.01, 0), halftone("#9a4058", "#4a1a30", { cell: 0.01 }), {
      at: [MX + Math.cos(a) * d, 1.008, -0.04 + Math.sin(a) * d * 0.9],
      rotation: [clr() * 90, clr() * 90, 0],
      flat: true,
    });
  }
  const tufts = (count: number, seed: number) => {
    const r = rng(seed);
    const out: any[] = [];
    while (out.length < count) {
      const x = -0.78 + r() * 1.56;
      if (x > -0.4 && x < -0.1) continue;
      out.push(frame([x, 1.0, -0.22 + r() * 0.37], [0, 1, 0]));
    }
    return out;
  };
  b.cards(tufts(36, 31), BLADE1, { size: [0.05, 0.085], lean: 12, flow: [0, 0, 1], bend: 20, vary: 0.35, spin: 40, rng: rng(32), cross: true, bone: root });
  b.cards(tufts(28, 41), BLADE2, { size: [0.045, 0.07], lean: 18, flow: [0, 0, 1], bend: 25, vary: 0.35, spin: 40, rng: rng(42), cross: true, bone: root });

  const daisy = (x: number, z: number, h: number, petal: string, centre: string) => {
    SW(catmull([[x, 1.0, z], [x + 0.012, 1.0 + h * 0.5, z], [x, 1.0 + h, z]]), 0.0035, { color: C.greenD, sides: 5 });
    P(petalGeo(9, 0.013, 0.013, 0.005), petal, { at: [x, 1.0 + h, z + 0.004], rotation: [-18, 0, 0] });
    P(new THREE.SphereGeometry(0.0095, 7, 5), centre, { at: [x, 1.0 + h, z + 0.007], flat: true });
    P(new THREE.SphereGeometry(0.01, 5, 4), C.green, { at: [x + 0.012, 1.0 + h * 0.3, z + 0.004], scale: [1.8, 0.4, 0.8], flat: true });
  };
  daisy(0.2, 0.06, 0.1, C.cream, C.orange);
  daisy(0.44, -0.04, 0.13, C.pinkL, C.yellow);
  daisy(0.63, 0.08, 0.09, C.cream, C.yellow);
  daisy(-0.62, 0.02, 0.12, C.yellow, C.orange);
  daisy(-0.7, 0.09, 0.08, C.pinkL, C.yellow);

  const mushroom = (x: number, y: number, z: number, h: number, r: number, cap: any, spot: string, g: number) => {
    P(new THREE.CylinderGeometry(r * 0.28, r * 0.36, h, 6), C.cream, { at: [x, y + h / 2, z], flat: true });
    const dome = P(new THREE.SphereGeometry(r, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), cap, { at: [x, y + h, z], scale: [1, 0.7, 1], flat: true });
    if (g) glow(dome, g);
    for (let k = 0; k < 4; k++) {
      const a = k * 1.7 + x * 10, rr = r * 0.55;
      const hy = r * 0.7 * Math.sqrt(1 - (rr / r) ** 2);
      P(new THREE.SphereGeometry(r * 0.13, 5, 4), spot, { at: [x + Math.cos(a) * rr, y + h + hy * 0.97, z + Math.sin(a) * rr], scale: [1, 0.5, 1] });
    }
  };
  mushroom(0.1, 1.0, 0.07, 0.04, 0.032, "#ff4f7b", "#ffffff", 0);
  mushroom(0.16, 1.0, 0.0, 0.025, 0.02, "#ff6a2a", "#ffffff", 0);
  P(new THREE.IcosahedronGeometry(0.035, 0), STONE_HT, { at: [-0.05, 1.012, 0.08], scale: [1.3, 0.8, 1], flat: true });
  P(new THREE.IcosahedronGeometry(0.02, 0), STONE_HT, { at: [-0.01, 1.006, 0.1], flat: true });

  // ---------------------------------------------------------------- helpers for the rooms
  const ceilY = (c: Chamber, xm: number) => {
    const dx = ((xm + 0.8) * 1000 - c.cx) / c.rx;
    return Y(c.cy - c.ry * Math.sqrt(Math.max(0, 1 - dx * dx)));
  };
  const mainCeil = (xm: number) => {
    const sx = (xm + 0.8) * 1000;
    for (let i = 0; i < MAIN.length - 1; i++)
      if (sx >= MAIN[i][0] && sx <= MAIN[i + 1][0]) {
        const t = (sx - MAIN[i][0]) / (MAIN[i + 1][0] - MAIN[i][0]);
        return Y(MAIN[i][1] + t * (MAIN[i + 1][1] - MAIN[i][1]) - 30);
      }
    return Y(200);
  };
  const worm = (x: number, top: number, z: number, len: number, col: string, k: number) => {
    P(new THREE.CylinderGeometry(0.0012, 0.0012, len, 4), C.cream, { at: [x, top - len / 2, z] });
    glow(P(new THREE.SphereGeometry(0.0075, 6, 4), col, { at: [x, top - len, z], flat: true }), k);
  };
  const bowl = (cx: number, y: number, cz: number, R: number, zs: number, hh: number, n: number, seed: number) => {
    P(lathe([[0, 0], [0.7 * R, 0], [0.96 * R, 0.4 * hh], [R, hh], [0.9 * R, hh * 1.02], [0.8 * R, 0.6 * hh], [0, 0.35 * hh]], 14), STRAW_HT, { at: [cx, y, cz], scale: [1, 1, zs], flat: true });
    const r = rng(seed);
    const cols = [C.yellow, C.orange, C.cream, "#f2c14e"];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r() * 0.2;
      const pt = (rad: number, da: number, hf: number) => [cx + R * rad * Math.cos(a + da), y + hh * hf, cz + R * zs * rad * Math.sin(a + da)];
      SW(catmull([pt(0.85, 0, 0.5), pt(1.0, 0.12, 1.1 + r() * 0.5), pt(1.12, 0.32, 0.9 + r() * 0.4)]), [0.0045, 0.0012], { color: cols[i % 4], sides: 4 });
    }
  };
  const leaf = (x: number, y: number, z: number, a: number, col: string) =>
    b.extrude([[0, 0, "sharp"], [0.025, 0.014], [0.06, 0, "sharp"], [0.025, -0.014]] as any, {
      at: [x, y, z], x: [Math.cos(a), 0, Math.sin(a)], y: [-Math.sin(a), 0, Math.cos(a)], thickness: 0.004, smoothing: 1, color: col, bone: root,
    });

  // ---------------------------------------------------------------- the mole (hero, reused for the pups)
  const mole = (pf: string, o: number[], yaw: number, S: number, adult: boolean, fur: any, belly: any) => {
    const phi = (yaw * Math.PI) / 180;
    const F = new THREE.Vector3(Math.sin(phi), 0, Math.cos(phi));
    const Lf = new THREE.Vector3(Math.cos(phi), 0, -Math.sin(phi));
    const UP = new THREE.Vector3(0, 1, 0);
    const M = (f: number, y: number, l: number) =>
      new THREE.Vector3(o[0], o[1], o[2]).addScaledVector(F, f * S).addScaledVector(Lf, l * S).addScaledVector(UP, y * S);
    const D = (f: number, y: number, l: number) => new THREE.Vector3().addScaledVector(F, f).addScaledVector(Lf, l).addScaledVector(UP, y);

    const spine = b.chain(`${pf}spine`, catmull([M(-0.1, 0.075, 0), M(-0.02, 0.082, 0), M(0.07, 0.08, 0), M(0.13, 0.076, 0)]), {
      parent: root, names: [`${pf}hips`, `${pf}spine1`, `${pf}chest`, `${pf}neck`], role: "spine",
    });
    const chest = spine.joints[2];
    const head = b.joint(`${pf}head`, { parent: spine, at: M(0.13, 0.076, 0), aim: M(0.26, 0.058, 0), role: "head" });
    const jaw = b.joint(`${pf}jaw`, { parent: head, at: M(0.13, 0.05, 0), aim: M(0.23, 0.044, 0), role: "jaw" });

    b.sweep(spine, [0.05, 0.066, 0.068, 0.056].map((r) => r * S), { color: fur, sectors: [[120, 240, belly]] });
    const snoutPaint = paint((p) => (((p.x - o[0]) * F.x + (p.z - o[2]) * F.z) / S > 0.215 ? PINK_HT : fur));
    b.sweep([M(0.12, 0.077, 0), M(0.262, 0.057, 0)], [0.056 * S, 0.011 * S], { bone: head, color: snoutPaint });
    b.sweep([M(0.125, 0.047, 0), M(0.225, 0.043, 0)], [0.036 * S, 0.012 * S], { bone: jaw, color: belly });
    b.part(new THREE.SphereGeometry(0.0165 * S, 7, 5), PINK_HT, { bone: head, at: M(0.263, 0.057, 0), scale: [1.1, 0.9, 1] });
    for (const s of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.0042 * S, 5, 4), C.navy, { bone: head, at: M(0.276, 0.06, s * 0.007) });
      const eye = M(0.19, 0.078, s * 0.025);
      b.part(new THREE.SphereGeometry(0.0088 * S, 7, 5), C.navy, { bone: head, at: eye });
      b.part(new THREE.SphereGeometry(0.003 * S, 5, 4), "#ffffff", { bone: head, at: eye.clone().add(D(0.004, 0.005, s * 0.0055).multiplyScalar(S)) });
    }

    for (const s of [1, -1]) {
      const sd = s > 0 ? "L" : "R";
      const arm = b.chain(`${pf}arm${sd}`, catmull([M(0.07, 0.062, s * 0.045), M(0.05, 0.04, s * 0.085), M(0.085, 0.034, s * 0.105)]), {
        parent: chest, names: [`${pf}shoulder${sd}`, `${pf}elbow${sd}`, `${pf}hand${sd}`], role: "arm",
      });
      b.sweep(arm, [0.03 * S, 0.022 * S, 0.02 * S], { color: fur });
      const hand = arm.joints[arm.joints.length - 1];
      const w = M(0.085, 0.034, s * 0.105);
      const outline: [number, number][] = [[0, -0.013], [0.02, -0.03]];
      for (let a = -80; a <= 80; a += 20) outline.push([0.052 + 0.036 * Math.cos((a * Math.PI) / 180), 0.034 * Math.sin((a * Math.PI) / 180)]);
      outline.push([0.02, 0.03], [0, 0.013]);
      b.extrude(outline.map(([x, y]) => [x * S, y * S] as [number, number]), {
        at: w, x: F, y: UP, thickness: 0.014 * S, bevel: 0.002 * S, smoothing: 1, color: PINK_HT, bone: hand,
      });
      for (let k = -2; k <= 2; k++) {
        const a = k * 0.5;
        const base = w.clone().addScaledVector(F, (0.052 + 0.034 * Math.cos(a)) * S).addScaledVector(UP, 0.032 * Math.sin(a) * S);
        b.spike(base, D(Math.cos(a), Math.sin(a) * 0.9 - 0.15, 0).normalize(), 0.032 * S, 0.0075 * S, { color: C.cream, bone: hand });
      }
      const leg = b.chain(`${pf}leg${sd}`, catmull([M(-0.09, 0.052, s * 0.05), M(-0.115, 0.03, s * 0.075), M(-0.082, 0.011, s * 0.085)]), {
        parent: spine.joints[0], names: [`${pf}hip${sd}`, `${pf}knee${sd}`, `${pf}foot${sd}`], role: "leg",
      });
      b.sweep(leg, [0.026 * S, 0.017 * S, 0.012 * S], { color: fur });
      const foot = leg.joints[leg.joints.length - 1];
      b.part(new THREE.BoxGeometry(0.03 * S, 0.012 * S, 0.05 * S), PINK_HT, { bone: foot, at: M(-0.058, 0.006, s * 0.085), dir: F, axis: "z" });
      for (let k = -1; k <= 1; k++)
        b.spike(M(-0.036, 0.007, s * 0.085 + k * 0.012 * S / S), D(1, 0, k * 0.25).normalize(), 0.02 * S, 0.0045 * S, { color: C.cream, bone: foot });
    }
    const tail = b.chain(`${pf}tail`, catmull([M(-0.14, 0.07, 0), M(-0.185, 0.064, 0), M(-0.225, 0.074, 0)]), {
      parent: spine.joints[0], names: [`${pf}tail1`, `${pf}tail2`, `${pf}tail3`], role: "tail",
    });
    b.sweep(tail, [0.016 * S, 0.006 * S], { color: PINK_HT });

    if (adult) {
      const stripe = (k: number) => paint((_p, _n, s) => (Math.floor(s[0] * k) % 2 ? C.yellow : C.pink));
      const ring = Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return M(0.118, 0.077 + Math.sin(a) * 0.058, Math.cos(a) * 0.058);
      });
      b.sweep(catmull(ring, { closed: true }), 0.0135 * S, { color: stripe(30), bone: chest });
      b.sweep(catmull([M(0.118, 0.05, -0.058), M(0.097, 0.026, -0.074), M(0.076, 0.015, -0.072)]), 0.011 * S, { color: stripe(7), bone: chest });
      for (const s of [1, -1]) {
        b.part(new THREE.TorusGeometry(0.016 * S, 0.0018 * S, 5, 12), C.yellow, { bone: head, at: M(0.19, 0.079, s * 0.033), dir: Lf, axis: "z" });
        b.rod(M(0.19, 0.082, s * 0.047), M(0.125, 0.084, s * 0.063), 0.0016 * S, { color: C.yellow, bone: head });
        for (let k = -1; k <= 1; k++) b.rod(M(0.245, 0.06, s * 0.012), M(0.288, 0.06 + k * 0.012, s * 0.05), 0.0011 * S, { color: C.cream, bone: head });
      }
      b.sweep(catmull([M(0.19, 0.094, -0.03), M(0.19, 0.103, 0), M(0.19, 0.094, 0.03)]), 0.0016 * S, { color: C.yellow, bone: head });
    }
    return head;
  };

  // ---------------------------------------------------------------- nest (mother mole)
  const nest = CH[0];
  const nestFloor = Y(floorSy(nest));
  bowl(X(nest.cx), nestFloor, -0.09, 0.2, 0.46, 0.05, 28, 3);
  for (let i = 0; i < 5; i++) leaf(-0.17 + i * 0.085, nestFloor + 0.044, 0.0 + (i % 2) * 0.012, 0.3 + i * 1.3, i % 2 ? C.pinkL : C.lime);
  const FUR = halftone(C.blue, C.navy, { cell: 0.0105, seed: 3 });
  const BELLY = halftone("#9aa8f5", "#5568d6", { cell: 0.0105, seed: 3 });
  mole("mom_", [-0.05, nestFloor + 0.0175, -0.09], 80, 1, true, FUR, BELLY);
  // wall sconce lantern
  b.rod([0.1, 0.545, BACK + 0.002], [0.1, 0.545, -0.17], 0.004, { color: C.yellow, bone: root });
  P(new THREE.CylinderGeometry(0.0012, 0.0012, 0.02, 4), C.cream, { at: [0.1, 0.535, -0.17] });
  glow(P(new THREE.CylinderGeometry(0.03, 0.026, 0.05, 6), C.orange, { at: [0.1, 0.5, -0.17], flat: true }), 1.5);
  P(new THREE.CylinderGeometry(0.033, 0.033, 0.006, 6), C.pink, { at: [0.1, 0.527, -0.17], flat: true });
  P(new THREE.CylinderGeometry(0.027, 0.03, 0.006, 6), C.pink, { at: [0.1, 0.472, -0.17], flat: true });
  for (const [x, len, z] of [[-0.17, 0.05, 0.03], [-0.1, 0.07, 0.04], [0.03, 0.045, 0.03], [0.12, 0.065, 0.04], [0.17, 0.04, 0.035]])
    worm(x, ceilY(nest, x) + 0.02, z, len, C.lime, 1.6);

  // ---------------------------------------------------------------- larder (worm pantry)
  const lar = CH[1];
  const larFloor = Y(floorSy(lar));
  const lx = X(lar.cx);
  P(new THREE.BoxGeometry(0.12, 0.07, 0.14), SOIL, { at: [lx - 0.08, larFloor + 0.035, -0.155] });
  P(new THREE.BoxGeometry(0.1, 0.035, 0.12), SOIL, { at: [lx + 0.06, larFloor + 0.0175, -0.165] });
  const wormCoil = (x: number, y: number, z: number, R: number, turns: number, col: string) =>
    SW(spiral(new THREE.Vector3(x, y, z), new THREE.Vector3(x + R, y, z), [0, 1, 0], { turns, r1: R * 0.3, pitch: 0.006 }), 0.0062, {
      bands: [[0.45, col], [0.53, "#ffc2d6"], [1, col]], sides: 5,
    });
  wormCoil(lx - 0.08, larFloor + 0.078, -0.155, 0.032, 2, "#ff6f9f");
  wormCoil(lx + 0.06, larFloor + 0.042, -0.165, 0.028, 2, "#ff9a5a");
  wormCoil(lx - 0.1, larFloor + 0.01, -0.06, 0.034, 2.2, "#ff6f9f");
  wormCoil(lx + 0.0, larFloor + 0.01, -0.03, 0.03, 2, "#ff5a8a");
  wormCoil(lx + 0.09, larFloor + 0.01, -0.08, 0.026, 1.8, "#ff9a5a");
  SW(catmull([[lx - 0.045, larFloor + 0.081, -0.12], [lx - 0.02, larFloor + 0.065, -0.1], [lx - 0.012, larFloor + 0.02, -0.095]]), 0.006, { bands: [[1, "#ff6f9f"]], sides: 5 });
  P(new THREE.PlaneGeometry(0.1, 0.042), "#ffffff", { at: [lx, larFloor + 0.145, BACK + 0.0015], texture: SIGN });
  for (const [x, z, len] of [[lx - 0.09, 0.02, 0.07], [lx + 0.02, 0.03, 0.05], [lx + 0.1, 0.025, 0.08], [lx - 0.03, 0.035, 0.04]]) {
    const top = ceilY(lar, x) + 0.02;
    SW(catmull([[x, top, z], [x + 0.01, top - len * 0.5, z], [x - 0.005, top - len, z]]), [0.006, 0.0015], { color: C.cream, sides: 5 });
  }
  for (const [x, len] of [[lx - 0.05, 0.05], [lx + 0.07, 0.04]]) worm(x, ceilY(lar, x) + 0.02, 0.03, len, C.yellow, 1.5);

  // ---------------------------------------------------------------- nursery (two pups)
  const nur = CH[2];
  const nurFloor = Y(floorSy(nur));
  const nx = X(nur.cx);
  bowl(nx, nurFloor, -0.08, 0.15, 0.5, 0.045, 20, 8);
  for (let i = 0; i < 3; i++) leaf(nx - 0.09 + i * 0.09, nurFloor + 0.04, 0.01, 0.8 + i * 1.7, i === 1 ? C.pinkL : C.lime);
  const PFUR = halftone("#8d7be8", "#4a3aa8", { cell: 0.0105, seed: 5 });
  const PBEL = halftone("#d4c9ff", "#8d7be8", { cell: 0.0105, seed: 5 });
  mole("pupA_", [nx + 0.05, nurFloor + 0.016, -0.075], -80, 0.45, false, PFUR, PBEL);
  mole("pupB_", [nx - 0.1, nurFloor + 0.016, -0.115], 70, 0.42, false, PFUR, PBEL);
  P(new THREE.BoxGeometry(0.14, 0.11, 0.006), WOOD_HT, { at: [nx, 0.51, BACK + 0.003] });
  P(new THREE.PlaneGeometry(0.12, 0.09), "#ffffff", { at: [nx, 0.51, BACK + 0.0065], texture: SAMPLER });
  for (const [x, len, z] of [[nx - 0.12, 0.05, 0.03], [nx - 0.02, 0.07, 0.04], [nx + 0.1, 0.045, 0.03]])
    worm(x, ceilY(nur, x) + 0.02, z, len, C.pink, 1.6);

  // ---------------------------------------------------------------- gallery (glowing mushrooms)
  const gal = CH[3];
  const galFloor = Y(floorSy(gal));
  const gx = X(gal.cx);
  mushroom(gx - 0.07, galFloor, -0.06, 0.03, 0.025, C.teal, "#ffffff", 1.3);
  mushroom(gx + 0.0, galFloor, -0.12, 0.05, 0.03, C.pink, "#ffffff", 1.3);
  mushroom(gx - 0.12, galFloor, -0.12, 0.022, 0.018, C.lime, "#ffffff", 1.3);
  mushroom(gx + 0.07, galFloor, -0.04, 0.04, 0.022, C.teal, "#ffffff", 1.3);
  mushroom(gx + 0.1, galFloor, -0.14, 0.06, 0.035, C.purple, "#ffffff", 1.2);
  P(new THREE.IcosahedronGeometry(0.018, 0), STONE_HT, { at: [gx - 0.03, galFloor + 0.008, 0.0], flat: true });
  worm(gx - 0.04, ceilY(gal, gx - 0.04) + 0.02, 0.03, 0.04, C.lime, 1.6);

  // ---------------------------------------------------------------- cellar (crystals)
  const cel = CH[4];
  const celFloor = Y(floorSy(cel));
  const cx = X(cel.cx);
  const crystal = (x: number, z: number, h: number, r: number, col: string, tx: number, tz: number) =>
    glow(
      P(lathe([[0, 0], [r, 0], [r, h * 0.7], [0, h]], 6), col, { at: [x, celFloor - 0.004, z], rotation: [tx, 0, tz], flat: true }),
      1.15,
    );
  crystal(cx - 0.05, -0.1, 0.085, 0.017, C.purple, 8, -10);
  crystal(cx - 0.02, -0.12, 0.06, 0.013, C.pink, -12, 14);
  crystal(cx + 0.03, -0.09, 0.1, 0.019, C.teal, 5, 12);
  crystal(cx + 0.08, -0.12, 0.055, 0.012, C.purple, -8, -22);
  crystal(cx + 0.11, -0.07, 0.07, 0.015, C.pink, 12, 20);
  crystal(cx - 0.1, -0.06, 0.05, 0.012, C.teal, -10, -16);
  crystal(cx + 0.0, -0.03, 0.035, 0.01, C.pink, 15, 5);
  P(new THREE.IcosahedronGeometry(0.022, 0), STONE_HT, { at: [cx - 0.08, celFloor + 0.01, -0.01], flat: true });
  P(new THREE.IcosahedronGeometry(0.014, 0), STONE_HT, { at: [cx + 0.06, celFloor + 0.007, -0.01], flat: true });

  // ---------------------------------------------------------------- glow-worm curtain along the main run
  for (const x of [-0.62, -0.46, -0.1, 0.12, 0.3, 0.52, 0.66]) {
    const rr = rng(Math.floor((x + 1) * 100));
    worm(x, mainCeil(x) + 0.02, 0.025 + rr() * 0.02, 0.025 + rr() * 0.03, rr() > 0.5 ? C.lime : C.yellow, 1.6);
  }

  return b.root;
}
