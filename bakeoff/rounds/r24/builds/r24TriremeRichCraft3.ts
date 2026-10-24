import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  aim,
  bezier,
  catmull,
  createBuilder,
  grain,
  mix,
  mottle,
  noise,
  paint,
  polyline,
  rng,
  stripes,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Greek Trireme",
  description:
    "Ancient Greek war galley: pitch-black hull with painted wale bands and a meander frieze, bronze ram, wide-open apotropaic eyes, " +
    "three tiers of oars with rowers, a striped square sail, goose-neck stern with aphlaston fan, hoplites, shields and a glowing stern lantern.",
};

type V = [number, number, number];
const v3 = (a: V) => new THREE.Vector3(a[0], a[1], a[2]);

// ---------------------------------------------------------------- palette
const PITCH = "#241a14";
const PITCH2 = "#35271c";
const WOOD = "#b9854f";
const WOOD_D = "#7d5330";
const OAK = "#9a6a3c";
const RED = "#a63b28";
const RED_D = "#6e2418";
const OCHRE = "#d9a23f";
const CREAM = "#efe3c4";
const BLUE = "#1f4f80";
const BLACK = "#15110e";
const ROPE = "#c8b080";
const SKIN = "#d79a6c";
const SKIN_D = "#b87a52";
const HAIR = "#3b2616";
const BRONZE = "#b07a3c";
const STEEL = "#aeb4bc";
const LEATHER = "#6a4528";

// ---------------------------------------------------------------- hull maths
const HW = 2.2;
const keelY = (t: number) => (t > 0 ? 0.9 : 0.6) * Math.abs(t) ** 3;
const topY = (t: number) => 3.2 + (t > 0 ? 0.9 : 1.6) * Math.abs(t) ** 3;
const halfW = (t: number) => HW * Math.max(0, 1 - Math.abs(t) ** (t > 0 ? 2.5 : 2.2)) ** 0.55;
const prof = (k: number) => Math.sin((k * Math.PI) / 2) ** 0.4;
const zAt = (t: number, k: number) => (t >= 0 ? t * (14 + 1.2 * (1 - k) ** 1.5) : t * (14 + 1.6 * k));
const hullPt = (t: number, k: number, s: number): V => [
  s * halfW(t) * prof(k),
  keelY(t) + (topY(t) - keelY(t)) * k,
  zAt(t, k),
];
const kOf = (t: number, y: number) => Math.min(1, Math.max(0, (y - keelY(t)) / (topY(t) - keelY(t))));
function solveT(z: number, y: number) {
  let lo = -1;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (zAt(m, kOf(m, y)) < z) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}
const widthAt = (z: number, y: number) => {
  const t = solveT(z, y);
  return halfW(t) * prof(kOf(t, y));
};
const tTop = (z: number) => (z >= 0 ? z / 14 : z / 15.6);
const outOff = (t: number) => 0.42 * Math.max(0, 1 - (Math.abs(t) / 0.64) ** 4);
const beamX = (z: number) => halfW(tTop(z)) + outOff(tTop(z));
const beamY = (z: number) => topY(tTop(z)) - 0.14;

const T = [-1, -0.94, -0.84, -0.7, -0.55, -0.4, -0.25, -0.12, 0, 0.12, 0.25, 0.4, 0.55, 0.7, 0.84, 0.94, 1];
const K = [0, 0.14, 0.3, 0.46, 0.6, 0.74, 0.88, 1];

// ---------------------------------------------------------------- paints
const PITCH_P = mottle(PITCH, PITCH2, { size: 0.9, seed: 3 });
const RED_P = mottle(RED, "#8a2f20", { size: 1.1, seed: 5 });
const PLANK_P = grain(WOOD, "#8a5a30", { size: 0.12, axis: "z", seed: 2 });
const CREAM_BASE = mottle(CREAM, "#dccda5", { size: 0.8, seed: 8 });
const KEEL_P = grain("#6e4a2a", "#4a2f19", { size: 0.1, axis: "z", seed: 4 });
const POST_P = grain(OAK, "#6f4a28", { size: 0.1, axis: "y", seed: 9 });
const RAM_P = metal("bronze", { verdigris: 0.6, tarnish: 0.5, seed: 2 });
const DECK_P = paint((p) => {
  const f = ((p.x / 0.26) % 1 + 1) % 1;
  if (f < 0.06) return "#4d3220";
  return mix("#b78650", "#9c6c3e", noise(p, 0.5, 6));
});
const DECK_DARK = paint((p) => {
  const f = ((p.x / 0.3) % 1 + 1) % 1;
  return f < 0.07 ? "#1c130d" : mix("#4b3422", "#3a281a", noise(p, 0.6, 3));
});
const ROOF_P = stripes(RED, CREAM, { size: 0.42, axis: "x", width: 0.5, wobble: 0, seed: 1 });

// Greek key (meander) painted on the cream strake, following the sheer through membrane coordinates.
const KEY_SEGS: [number, number, number, number][] = [
  [0, 3, 40, 3],
  [0, 3, 0, 22],
  [0, 22, 32, 22],
  [32, 22, 32, 9],
  [32, 9, 10, 9],
  [10, 9, 10, 15],
  [10, 15, 22, 15],
];
function segDist(px: number, py: number, s: [number, number, number, number]) {
  const [ax, ay, bx, by] = s;
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.min(1, Math.max(0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}
const MEANDER_P = paint((p, _n, s) => {
  if (Math.abs(p.z) > 9.5) return CREAM_BASE;
  const u = (((s[0] * 33) / 0.0175) % 40 + 40) % 40;
  const v = Math.min(25, Math.max(0, s[1] * 25));
  let d = 99;
  for (const seg of KEY_SEGS) d = Math.min(d, segDist(u, v, seg), segDist(u - 40, v, seg));
  return d < 2.1 ? "#6b2418" : CREAM_BASE;
});

const oarPaint = (Lo: number, Li: number, bl: number) =>
  paint((p, _n, s) => {
    const x = s[0];
    if (x > Lo - 0.3) return RED_D;
    if (x > Lo - 0.42) return CREAM;
    if (x > Lo - bl) return OCHRE;
    if (x < -Li + 0.3) return "#5a3a20";
    return mix(WOOD, WOOD_D, noise(p, 0.3, 4));
  });

// ---------------------------------------------------------------- textures
function eyeTexture() {
  const lid = "M6 40 Q60 0 114 40 Q60 80 6 40Z";
  return svg(
    `<svg viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="c"><path d="${lid}"/></clipPath></defs>
    <path d="${lid}" fill="#f6efdc"/>
    <g clip-path="url(#c)">
      <circle cx="60" cy="40" r="22" fill="#1f4f80"/>
      <circle cx="60" cy="40" r="22" fill="none" stroke="#12263f" stroke-width="3"/>
      <circle cx="60" cy="40" r="10" fill="#0e0b09"/>
      <circle cx="53" cy="33" r="3.5" fill="#ffffff"/>
    </g>
    <path d="${lid}" fill="none" stroke="#15110e" stroke-width="5" stroke-linejoin="round"/>
    <path d="M2 40 L8 40 M112 40 L119 44" stroke="#15110e" stroke-width="4" stroke-linecap="round"/>
    <path d="M10 22 Q60 -12 112 22" stroke="#15110e" stroke-width="7" fill="none" stroke-linecap="round"/>
  </svg>`,
    { size: 256 },
  );
}

function sailTexture() {
  let s = `<svg viewBox="0 0 208 106" xmlns="http://www.w3.org/2000/svg"><rect width="208" height="106" fill="#efe3c4"/>`;
  for (let i = 0; i < 13; i++) {
    if (i % 2 === 0) s += `<rect x="${i * 16}" y="0" width="16" height="106" fill="#a63b28"/>`;
    s += `<rect x="${i * 16 - 0.7}" y="0" width="1.4" height="106" fill="#d9a23f"/>`;
  }
  for (let i = 1; i < 7; i++) s += `<path d="M${i * 32} 0V106" stroke="#3a2a1a" stroke-opacity="0.22" stroke-width="0.8"/>`;
  let zz = "";
  for (let i = 0; i <= 52; i++) zz += `${i * 4},${i % 2 ? 6.8 : 2.2} `;
  s += `<rect y="0" width="208" height="9" fill="#1f4f80"/><polyline points="${zz}" fill="none" stroke="#d9a23f" stroke-width="1.6"/>`;
  s += `<g transform="translate(0 97)"><rect width="208" height="9" fill="#1f4f80"/><polyline points="${zz}" fill="none" stroke="#d9a23f" stroke-width="1.6"/></g>`;
  s += `<circle cx="104" cy="53" r="37" fill="#15110e"/><circle cx="104" cy="53" r="34" fill="#efe3c4"/><circle cx="104" cy="53" r="29" fill="#1f4f80"/>`;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r1 = i % 2 ? 20 : 27;
    const px = (r: number, da: number) =>
      `${(104 + Math.cos(a + da) * r).toFixed(1)},${(53 + Math.sin(a + da) * r).toFixed(1)}`;
    s += `<polygon points="${px(6, -0.18)} ${px(r1, 0)} ${px(6, 0.18)}" fill="${i % 2 ? "#efe3c4" : "#d9a23f"}"/>`;
  }
  s += `<circle cx="104" cy="53" r="9" fill="#a63b28" stroke="#15110e" stroke-width="2"/><circle cx="104" cy="53" r="3.5" fill="#d9a23f"/></svg>`;
  return svg(s, { size: 1024 });
}

function gorgonShield() {
  let snakes = "";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const f = (n: number) => n.toFixed(1);
    snakes += `<path d="M${f(50 + Math.cos(a) * 28)} ${f(50 + Math.sin(a) * 28)} Q${f(50 + Math.cos(a - 0.2) * 38)} ${f(50 + Math.sin(a - 0.2) * 38)} ${f(50 + Math.cos(a + 0.35) * 43)} ${f(50 + Math.sin(a + 0.35) * 43)}" stroke="#15110e" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="49" fill="#15110e"/><circle cx="50" cy="50" r="45" fill="#a63b28"/>${snakes}
    <circle cx="50" cy="50" r="29" fill="#e6c27a" stroke="#15110e" stroke-width="3"/>
    <ellipse cx="39" cy="44" rx="7" ry="5" fill="#fff"/><ellipse cx="61" cy="44" rx="7" ry="5" fill="#fff"/>
    <circle cx="39" cy="44" r="2.8" fill="#15110e"/><circle cx="61" cy="44" r="2.8" fill="#15110e"/>
    <path d="M30 36 L46 39 M70 36 L54 39" stroke="#15110e" stroke-width="3" stroke-linecap="round"/>
    <path d="M47 50 L50 56 L53 50" stroke="#15110e" stroke-width="2.5" fill="none"/>
    <path d="M36 62 Q50 72 64 62 Q50 66 36 62Z" fill="#15110e"/>
    <path d="M44 63 l2 5 l2 -4 M52 64 l2 4 l2 -5" stroke="#fff" stroke-width="2" fill="none"/>
    <path d="M47 67 Q50 80 53 67Z" fill="#a63b28" stroke="#15110e" stroke-width="1.5"/></svg>`,
    { size: 256 },
  );
}

function triskelionShield() {
  const leg = (a: number) =>
    `<g transform="rotate(${a} 50 50)"><path d="M50 50 Q74 42 66 14" stroke="#e8c26a" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="68" cy="28" r="6" fill="#e8c26a"/><path d="M66 14 l10 -3" stroke="#e8c26a" stroke-width="6" stroke-linecap="round"/></g>`;
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="49" fill="#15110e"/><circle cx="50" cy="50" r="45" fill="#1f4f80"/>
    <circle cx="50" cy="50" r="41" fill="none" stroke="#e8c26a" stroke-width="2.5" stroke-dasharray="3 3"/>
    ${leg(0)}${leg(120)}${leg(240)}<circle cx="50" cy="50" r="6" fill="#e8c26a" stroke="#15110e" stroke-width="2"/></svg>`,
    { size: 256 },
  );
}

function sunShield() {
  let rays = "";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const p = (r: number, d: number) => `${(50 + Math.cos(a + d) * r).toFixed(1)},${(50 + Math.sin(a + d) * r).toFixed(1)}`;
    rays += `<polygon points="${p(14, -0.2)} ${p(40, 0)} ${p(14, 0.2)}" fill="${i % 2 ? "#a63b28" : "#15110e"}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="49" fill="#15110e"/><circle cx="50" cy="50" r="45" fill="#efe3c4"/>
    <circle cx="50" cy="50" r="42" fill="none" stroke="#a63b28" stroke-width="3"/>${rays}
    <circle cx="50" cy="50" r="13" fill="#d9a23f" stroke="#15110e" stroke-width="2.5"/><circle cx="50" cy="50" r="5" fill="#15110e"/></svg>`,
    { size: 256 },
  );
}

function bannerTexture() {
  return svg(
    `<svg viewBox="0 0 90 130" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0H90V130L45 112L0 130Z" fill="#15110e"/>
    <path d="M5 5H85V120L45 104L5 120Z" fill="#1f4f80"/>
    <path d="M10 10H80V112L45 98L10 112Z" fill="none" stroke="#d9a23f" stroke-width="2.5"/>
    <path d="M45 24V94" stroke="#e8c26a" stroke-width="6" stroke-linecap="round"/>
    <path d="M24 30 Q24 56 45 58 Q66 56 66 30" stroke="#e8c26a" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M24 22 L24 36 M66 22 L66 36 M45 16 L45 30" stroke="#e8c26a" stroke-width="6" stroke-linecap="round"/>
    <path d="M18 28 L24 20 L30 28 M60 28 L66 20 L72 28 M39 24 L45 14 L51 24" fill="#e8c26a"/>
    <path d="M22 98 Q45 110 68 98" stroke="#efe3c4" stroke-width="3" fill="none"/></svg>`,
    { size: 256 },
  );
}

// ---------------------------------------------------------------- the ship
export default function build() {
  const b = createBuilder({ name: "trireme", paintSize: 2048 });
  const R = rng(7);
  const hull = b.joint("hull", { at: [0, 1, 0], dir: [0, 0, 1] });
  const mastJ = b.joint("mast", { parent: hull, at: [0, 3.0, 1.0], dir: [0, 1, 0] });
  const yardJ = b.joint("yard", { parent: mastJ, at: [0, 9.7, 1.3], dir: [1, 0, 0] });

  const EYE = eyeTexture();
  const SAIL = sailTexture();
  const SHIELDS = [gorgonShield(), triskelionShield(), sunShield()];
  const BANNER = bannerTexture();

  // merge helper: many small same-colour pieces on one bone become one part
  const bucket = () => {
    const geos: THREE.BufferGeometry[] = [];
    const add = (g: THREE.BufferGeometry, pos: V | THREE.Vector3, q?: THREE.Quaternion) => {
      if (q) g.applyQuaternion(q);
      const p = Array.isArray(pos) ? pos : [pos.x, pos.y, pos.z];
      g.translate(p[0], p[1], p[2]);
      geos.push(g);
    };
    const cyl = (a: THREE.Vector3, c: THREE.Vector3, r: number, seg = 6) => {
      const d = c.clone().sub(a);
      add(new THREE.CylinderGeometry(r, r, d.length(), seg, 1), a.clone().add(c).multiplyScalar(0.5), aim(d));
    };
    const flush = (color: string, bone: typeof hull) => {
      if (geos.length) b.part(mergeGeometries(geos)!, color, { bone, at: [0, 0, 0], flat: true });
    };
    return { add, cyl, flush };
  };

  // ============================================================ HULL
  const line = (k: number, s: number) => catmull(T.map((t) => hullPt(t, k, s)));
  const BANDS = [PITCH_P, PITCH_P, PITCH_P, RED_P, PLANK_P, MEANDER_P, RED_P];
  for (const s of [1, -1])
    for (let j = 0; j < K.length - 1; j++)
      b.membrane(line(K[j], s), line(K[j + 1], s), { color: BANDS[j], thickness: 0.12, rows: 2, cols: 18, bone: hull });

  // keel
  b.sweep(catmull(T.map((t) => [0, keelY(t) + 0.04, zAt(t, 0)] as V)), () => [0.11, 0.2], {
    section: "box", color: KEEL_P, bone: hull, caps: "flat",
  });
  // wales, gunwale rails
  for (const s of [1, -1]) {
    b.sweep(line(1, s), 0.1, { color: WOOD_D, bone: hull, sides: 6 });
    b.sweep(line(0.46, s), 0.07, { color: "#4d3220", bone: hull, sides: 6 });
    b.sweep(line(0.74, s), 0.06, { color: OCHRE, bone: hull, sides: 6 });
  }

  // outrigger beams (parexeiresia)
  const Tb = [-0.62, -0.5, -0.36, -0.2, 0, 0.2, 0.36, 0.5, 0.62];
  for (const s of [1, -1])
    b.sweep(
      catmull(Tb.map((t) => [s * (halfW(t) + outOff(t)), topY(t) - 0.14, t >= 0 ? t * 14 : t * 15.6] as V)),
      () => [0.17, 0.13],
      { section: "box", color: OAK, bone: hull, caps: "flat" },
    );

  // stem post with curled top, ram
  b.sweep(
    catmull([[0, 0.9, 15.2], [0, 1.9, 14.7], [0, 3.0, 14.35], [0, 4.1, 14.0], [0, 4.9, 13.85], [0, 5.6, 13.5], [0, 5.95, 12.9]]),
    [0.18, 0.07],
    { color: POST_P, bone: hull, sides: 8 },
  );
  b.part(new THREE.SphereGeometry(0.16, 7, 5), OCHRE, { at: [0, 6.0, 12.85], bone: hull });
  b.sweep(polyline([[0, 1.1, 14.2], [0, 1.05, 15.8], [0, 1.0, 17.4]]), (t) => [0.42 * (1 - t * 0.85), 0.34 * (1 - t * 0.85)], {
    color: RAM_P, bone: hull, caps: { start: "flat", end: "point" }, sides: 8,
  });
  for (const [y, len, hw] of [[0.78, 3.2, 0.7], [1.1, 3.6, 0.9], [1.42, 3.0, 0.6]] as const)
    b.extrude([[-hw, 0], [-hw * 0.8, len * 0.5], [0, len], [hw * 0.8, len * 0.5], [hw, 0]], {
      at: [0, y, 14.2], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.07, color: RAM_P, bone: hull,
    });

  // stern post: goose-neck curl, goose head, aphlaston fan
  b.sweep(
    catmull([[0, 0.6, -14.0], [0, 1.5, -14.3], [0, 2.5, -14.74], [0, 3.7, -15.18], [0, 4.8, -15.6], [0, 5.7, -15.9], [0, 6.7, -15.85], [0, 7.6, -15.35], [0, 8.2, -14.6]]),
    [0.2, 0.1],
    { color: POST_P, bone: hull, sides: 8 },
  );
  b.part(new THREE.SphereGeometry(0.2, 8, 6), CREAM, { at: [0, 8.3, -14.45], bone: hull, flat: true });
  b.part(new THREE.ConeGeometry(0.09, 0.4, 6), OCHRE, { at: [0, 8.22, -14.15], dir: [0, -0.2, 1], bone: hull, flat: true });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.03, 5, 4), BLACK, { at: [s * 0.14, 8.36, -14.36], bone: hull });
  const fanBlades = [RED, OCHRE, CREAM, BLUE, CREAM, OCHRE, RED];
  const pivot: V = [0, 5.3, -15.78];
  fanBlades.forEach((c, i) => {
    const th = ((-5 + i * 14) * Math.PI) / 180;
    const d = new THREE.Vector3(0, Math.sin(th), -Math.cos(th));
    const e = new THREE.Vector3(0, -d.z, d.y);
    const len = 1.9 - Math.abs(i - 3) * 0.12;
    b.extrude(
      [[0, -0.05], [len * 0.35, -0.2], [len * 0.75, -0.16], [len, 0], [len * 0.75, 0.16], [len * 0.35, 0.2], [0, 0.05]],
      { at: pivot, x: d, y: e, thickness: 0.06, color: c, bone: hull },
    );
  });

  // lantern hung from the stern neck
  b.rod([0, 7.0, -15.8], [0, 7.0, -14.9], 0.04, { color: BRONZE, bone: hull });
  b.rod([0, 7.0, -14.9], [0, 6.75, -14.9], 0.015, { color: BLACK, bone: hull });
  glow(b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.3, 6), "#ffb347", { at: [0, 6.55, -14.9], bone: hull, flat: true }), 1.7);
  b.part(new THREE.ConeGeometry(0.19, 0.16, 6), BRONZE, { at: [0, 6.78, -14.9], bone: hull, flat: true });
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 6), BRONZE, { at: [0, 6.38, -14.9], bone: hull, flat: true });

  // painted eyes (decals on the built bow flanks)
  const skin = b.surface(b.root);
  for (const s of [1, -1])
    b.decal(skin, EYE, {
      at: [s * (widthAt(10.2, 2.35) + 0.05), 2.35, 10.2],
      dir: [s * 0.93, 0, 0.36],
      size: [1.5, 0.875],
      segments: 12,
      bone: hull,
    });

  // ============================================================ INTERIOR & DECKS
  const deckOutline = (z0: number, z1: number, y: number, margin: number): [number, number][] => {
    const Lp: [number, number][] = [];
    const Rp: [number, number][] = [];
    for (let i = 0; i <= 10; i++) {
      const z = z0 + ((z1 - z0) * i) / 10;
      const w = Math.max(0.06, widthAt(z, y) - margin);
      Lp.push([w, z]);
      Rp.push([-w, z]);
    }
    return [...Lp, ...Rp.reverse()];
  };
  const deck = (z0: number, z1: number, y: number, c: unknown) =>
    b.extrude(deckOutline(z0, z1, y, 0.06), {
      at: [0, y, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.14, color: c as string, bone: hull,
    });
  deck(-9, 9, 0.95, DECK_DARK);
  deck(9, 14, 3.35, DECK_P);
  deck(-14.9, -9.2, 3.55, DECK_P);
  b.part(new THREE.BoxGeometry(1.1, 0.12, 18), DECK_P, { at: [0, 3.05, 0], bone: hull, flat: true });
  for (const s of [1, -1]) b.rod([s * 0.58, 3.11, -9], [s * 0.58, 3.11, 9], 0.05, { color: WOOD_D, bone: hull });

  // benches, beams, stanchions
  const zs = Array.from({ length: 9 }, (_, i) => -8.2 + 1.9 * i);
  const wood = bucket();
  for (const z of zs) {
    wood.add(new THREE.BoxGeometry(2.6, 0.12, 0.3), [0, 2.95, z + 0.95]);
    for (const s of [1, -1]) {
      const w = widthAt(z, 2.3) - 0.08;
      const cx = (0.62 + w) / 2;
      wood.add(new THREE.BoxGeometry(w - 0.62, 0.12, 0.34), [s * cx, 2.3, z]);
      wood.cyl(new THREE.Vector3(s * 0.5, 1.0, z + 0.95), new THREE.Vector3(s * 0.5, 3.0, z + 0.95), 0.06, 6);
      // outrigger struts
      const zz = z + 0.95;
      wood.cyl(
        new THREE.Vector3(s * widthAt(zz, 2.6), 2.6, zz),
        new THREE.Vector3(s * beamX(zz), beamY(zz) - 0.1, zz),
        0.06, 5,
      );
    }
  }
  wood.flush(OAK, hull);

  // ============================================================ OARS + ROWERS
  const makeOar = (name: string, P: THREE.Vector3, d: THREE.Vector3, Lo: number, Li: number, bl: number, bw: number, sw: number, thick: number) => {
    const j = b.joint(name, { parent: hull, at: P, dir: d });
    const up = new THREE.Vector3(0, 1, 0);
    const u = up.clone().sub(d.clone().multiplyScalar(up.dot(d))).normalize();
    return b.extrude(
      [[-Li, -sw], [Lo - bl, -sw], [Lo - bl + 0.2, -bw * 0.7], [Lo - 0.12, -bw], [Lo, -bw * 0.6], [Lo, bw * 0.6], [Lo - 0.12, bw], [Lo - bl + 0.2, bw * 0.7], [Lo - bl, sw], [-Li, sw]],
      { at: P, x: d, y: u, thickness: thick, color: oarPaint(Lo, Li, bl), bone: j },
    );
  };
  const tiers = [
    { n: "T", y: 0, Lo: 4.4, Li: 1.5, dz: 0 },
    { n: "M", y: 2.15, Lo: 3.9, Li: 1.3, dz: 0.63 },
    { n: "B", y: 1.55, Lo: 3.4, Li: 1.1, dz: 1.27 },
  ];
  const ports = bucket();
  const tun = [bucket(), bucket(), bucket()];
  const skinB = bucket();
  const hairB = bucket();
  const pilosB = bucket();
  for (const tier of tiers)
    for (const s of [1, -1])
      zs.forEach((z0, i) => {
        const z = z0 + tier.dz;
        const top = tier.n === "T";
        const py = top ? beamY(z) : tier.y;
        const px = top ? beamX(z) + 0.19 : widthAt(z, tier.y) + 0.07;
        const P = new THREE.Vector3(s * px, py, z);
        const h = new THREE.Vector3(s, 0, -0.32).normalize();
        const sinP = Math.min(0.6, (py - 0.95) / tier.Lo);
        const cosP = Math.sqrt(1 - sinP * sinP);
        const d = h.multiplyScalar(cosP).add(new THREE.Vector3(0, -sinP, 0));
        makeOar(`oar${s > 0 ? "L" : "R"}${tier.n}${i + 1}`, P, d, tier.Lo, tier.Li, 1.15, 0.17, 0.045, 0.07);
        ports.add(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 8).rotateZ(Math.PI / 2), [P.x - s * 0.02, P.y, P.z]);
        if (top) {
          const H = P.clone().addScaledVector(d, -(tier.Li - 0.3));
          const rx = s * 1.0;
          const jit = (R() - 0.5) * 0.05;
          tun[i % 3].add(new THREE.BoxGeometry(0.44, 0.8, 0.28), [rx, 2.75, z]);
          skinB.add(new THREE.SphereGeometry(0.15, 7, 5), [rx, 3.45 + jit, z - 0.02]);
          if (i % 2) pilosB.add(new THREE.ConeGeometry(0.15, 0.26, 7), [rx, 3.69 + jit, z - 0.02]);
          else hairB.add(new THREE.SphereGeometry(0.165, 7, 4, 0, Math.PI * 2, 0, Math.PI * 0.55), [rx, 3.47 + jit, z - 0.03]);
          for (const sd of [1, -1])
            skinB.cyl(new THREE.Vector3(rx + sd * 0.21, 3.1, z), H.clone().add(new THREE.Vector3(0, 0, sd * 0.1)), 0.05, 5);
        }
      });
  ports.flush("#2a1d14", hull);
  tun[0].flush("#b3402c", hull);
  tun[1].flush("#2f5f93", hull);
  tun[2].flush("#d8a444", hull);
  skinB.flush(SKIN, hull);
  hairB.flush(HAIR, hull);
  pilosB.flush("#e3d3a8", hull);

  // steering oars
  for (const s of [1, -1]) {
    const P = new THREE.Vector3(s * (widthAt(-13, 3.95) + 0.3), 3.95, -13);
    const d = new THREE.Vector3(s * 0.3, -0.85, -0.4).normalize();
    makeOar(`rudder${s > 0 ? "L" : "R"}`, P, d, 3.6, 1.2, 1.3, 0.3, 0.06, 0.09);
    b.part(new THREE.BoxGeometry(0.34, 0.2, 0.34), WOOD_D, { at: [P.x - s * 0.1, P.y - 0.15, P.z], bone: hull, flat: true });
  }

  // ============================================================ SHIELDS
  const rim = bucket();
  zs.forEach((z0, i) => {
    const z = z0 + 0.95;
    for (const s of [1, -1]) {
      const c = new THREE.Vector3(s * (beamX(z) + 0.12), beamY(z) + 0.5, z);
      const dir = new THREE.Vector3(s, 0.28, 0).normalize();
      b.part(new THREE.CircleGeometry(0.45, 20), "#ffffff", { texture: SHIELDS[(i + (s > 0 ? 0 : 1)) % 3], at: c, dir, axis: "z", bone: hull });
      rim.add(new THREE.TorusGeometry(0.45, 0.035, 4, 18), c, aim(dir, undefined, "z"));
      rim.add(new THREE.SphereGeometry(0.09, 6, 4), c.clone().addScaledVector(dir, 0.05));
    }
  });
  rim.flush(BRONZE, hull);

  // ============================================================ CANOPY ON THE STERN DECK
  const CZ = -11;
  const canopy = bucket();
  for (const sx of [1, -1])
    for (const dz of [1, -1]) {
      b.rod([sx * 0.9, 3.62, CZ + dz], [sx * 0.9, 5.6, CZ + dz], 0.06, { color: OCHRE, bone: hull });
    }
  b.lathe([[0, 0.75], [1.84, 0.0], [1.84, -0.1], [0, -0.1]], { at: [0, 5.6, CZ], segments: 4, spin: 45, color: ROOF_P, bone: hull });
  b.sweep(polyline([[1.3, 5.52, CZ + 1.3], [-1.3, 5.52, CZ + 1.3], [-1.3, 5.52, CZ - 1.3], [1.3, 5.52, CZ - 1.3]], { closed: true }), 0.05, {
    color: OCHRE, bone: hull, sides: 5,
  });
  for (let i = 0; i < 6; i++) {
    const f = -1.1 + i * 0.44;
    for (const [x, z] of [[f, CZ + 1.3], [f, CZ - 1.3], [1.3, CZ + f], [-1.3, CZ + f]])
      canopy.add(new THREE.ConeGeometry(0.05, 0.22, 5).rotateX(Math.PI), [x, 5.38, z]);
  }
  canopy.flush(RED, hull);
  b.part(new THREE.SphereGeometry(0.1, 6, 4), OCHRE, { at: [0, 6.4, CZ], bone: hull });

  // ============================================================ FIGURES
  const person = (base: V, yaw: number, o: { tunic: string; trim: string; helmet?: boolean; shield?: THREE.Texture; spear?: boolean; cloak?: string; beard?: boolean }) => {
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const D = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(q);
    const L = (x: number, y: number, z: number) => D(x, y, z).add(v3(base));
    for (const s of [1, -1]) b.rod(L(s * 0.1, 0, 0), L(s * 0.1, 0.55, 0), 0.065, { color: SKIN_D, bone: hull });
    b.part(new THREE.CylinderGeometry(0.2, 0.26, 0.64, 8), o.tunic, { at: L(0, 0.82, 0), quat: q, bone: hull, flat: true });
    b.part(new THREE.CylinderGeometry(0.215, 0.225, 0.07, 8), o.trim, { at: L(0, 0.84, 0), quat: q, bone: hull, flat: true });
    const lh = o.shield ? L(0.3, 0.95, 0.14) : L(0.3, 0.75, 0.08);
    const rh = o.spear ? L(-0.3, 0.85, 0.12) : L(-0.3, 0.75, 0.08);
    b.rod(L(0.24, 1.08, 0), lh, 0.05, { color: SKIN, bone: hull });
    b.rod(L(-0.24, 1.08, 0), rh, 0.05, { color: SKIN, bone: hull });
    b.part(new THREE.SphereGeometry(0.15, 8, 6), SKIN, { at: L(0, 1.3, 0), bone: hull });
    if (o.helmet) {
      b.part(new THREE.SphereGeometry(0.18, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.62), RAM_P, { at: L(0, 1.32, 0), bone: hull });
      b.part(new THREE.BoxGeometry(0.035, 0.12, 0.03), BRONZE, { at: L(0, 1.27, 0.165), quat: q, bone: hull });
      b.sweep(bezier(L(0, 1.5, 0.12), L(0, 1.78, 0.12), L(0, 1.8, -0.16), L(0, 1.5, -0.26)), [0.05, 0.035], { color: RED, bone: hull, sides: 5 });
    } else {
      b.part(new THREE.SphereGeometry(0.16, 7, 4, 0, Math.PI * 2, 0, Math.PI * 0.55), HAIR, { at: L(0, 1.34, -0.02), bone: hull });
    }
    if (o.beard) b.part(new THREE.SphereGeometry(0.1, 6, 4), HAIR, { at: L(0, 1.2, 0.08), bone: hull });
    if (o.cloak) b.part(new THREE.BoxGeometry(0.5, 0.95, 0.05), o.cloak, { at: L(0, 0.98, -0.2), quat: q, bone: hull, flat: true });
    if (o.shield) {
      const dir = D(1, 0, 0.35).normalize();
      b.part(new THREE.CircleGeometry(0.4, 16), "#ffffff", { texture: o.shield, at: L(0.38, 1.0, 0.12), dir, axis: "z", bone: hull });
      b.part(new THREE.TorusGeometry(0.4, 0.03, 4, 16), BRONZE, { at: L(0.38, 1.0, 0.125), dir, axis: "z", bone: hull });
    }
    if (o.spear) {
      b.rod(L(-0.3, 0.1, 0.1), L(-0.3, 2.15, 0.1), 0.02, { color: WOOD, bone: hull });
      b.spike(L(-0.3, 2.15, 0.1), D(0, 1, 0), 0.28, 0.04, { color: STEEL, bone: hull });
    }
  };
  person([-0.75, 3.42, 10.0], 0.15, { tunic: RED, trim: OCHRE, helmet: true, shield: SHIELDS[0], spear: true });
  person([0.75, 3.42, 10.0], -0.15, { tunic: BLUE, trim: OCHRE, helmet: true, shield: SHIELDS[1], spear: true });
  person([0.2, 3.62, CZ + 0.1], 0, { tunic: "#efe3c4", trim: RED, cloak: RED, beard: true });
  person([0, 3.62, -13.7], Math.PI, { tunic: OCHRE, trim: RED_D });

  // bow banner with trident
  b.rod([0, 3.42, 11.5], [0, 6.1, 11.5], 0.04, { color: WOOD_D, bone: hull });
  b.rod([0, 6.0, 11.5], [0, 6.0, 10.5], 0.03, { color: WOOD_D, bone: hull });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.9, 1.3), "#ffffff", { texture: BANNER, at: [s * 0.02, 5.3, 11.0], dir: [s, 0, 0], axis: "z", bone: hull });
  b.part(new THREE.SphereGeometry(0.07, 6, 4), OCHRE, { at: [0, 6.15, 11.5], bone: hull });

  // stone anchor on the bow deck
  b.part(new THREE.BoxGeometry(0.34, 0.9, 0.26), "#9b9a92", { at: [-0.7, 3.65, 12.2], rotation: [0, 20, 0], bone: hull, flat: true });
  b.rod([-1.15, 3.55, 12.3], [-0.25, 3.55, 12.1], 0.045, { color: WOOD, bone: hull });
  b.part(new THREE.TorusGeometry(0.14, 0.03, 4, 10), ROPE, { at: [-0.75, 4.12, 12.2], bone: hull });
  b.part(new THREE.TorusGeometry(0.28, 0.07, 5, 12), ROPE, { at: [0.4, 3.5, 12.4], rotation: [90, 0, 0], bone: hull });

  // ============================================================ MAST, YARD, SAIL, RIGGING
  b.rod([0, 1.0, 1.0], [0, 11.1, 1.0], [0.19, 0.1], { color: grain(OAK, "#6f4a28", { size: 0.1, axis: "y", seed: 5 }), bone: mastJ });
  b.part(new THREE.BoxGeometry(0.7, 0.3, 0.7), WOOD_D, { at: [0, 3.2, 1.0], bone: mastJ, flat: true });
  b.part(new THREE.SphereGeometry(0.14, 7, 5), BRONZE, { at: [0, 11.2, 1.0], bone: mastJ });
  for (const s of [1, -1]) {
    b.rod([0, 9.7, 1.3], [s * 5.9, 9.7, 1.3], [0.12, 0.06], { color: OAK, bone: yardJ });
    b.part(new THREE.SphereGeometry(0.08, 6, 4), OCHRE, { at: [s * 5.95, 9.7, 1.3], bone: yardJ });
  }
  b.rod([0, 9.7, 1.0], [0, 9.7, 1.3], 0.07, { color: BRONZE, bone: yardJ });

  const sg = new THREE.PlaneGeometry(10.4, 5.3, 14, 6);
  const sp = sg.attributes.position;
  for (let i = 0; i < sp.count; i++) {
    const u = sp.getX(i) / 5.2;
    const v = (sp.getY(i) + 2.65) / 5.3;
    sp.setZ(i, 0.85 * (1 - u * u) * (0.3 + 0.7 * (1 - v)));
  }
  sg.computeVertexNormals();
  const sb = sg.clone();
  const arr = sb.index!.array as Uint16Array;
  for (let i = 0; i < arr.length; i += 3) {
    const t = arr[i + 1];
    arr[i + 1] = arr[i + 2];
    arr[i + 2] = t;
  }
  const sn = sb.attributes.normal;
  const suv = sb.attributes.uv;
  for (let i = 0; i < sn.count; i++) {
    sn.setXYZ(i, -sn.getX(i), -sn.getY(i), -sn.getZ(i));
    suv.setX(i, 1 - suv.getX(i));
  }
  sb.translate(0, 0, -0.025);
  b.part(sg, "#ffffff", { texture: SAIL, at: [0, 7.0, 1.36], bone: yardJ });
  b.part(sb, "#ffffff", { texture: SAIL, at: [0, 7.0, 1.36], bone: yardJ });
  b.rod([-5.2, 4.35, 1.4], [5.2, 4.35, 1.4], 0.05, { color: ROPE, bone: yardJ });

  const rig = bucket();
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  rig.cyl(V(0, 11.0, 1.0), V(0, 5.95, 12.9), 0.03, 5); // forestay
  rig.cyl(V(0, 11.0, 1.0), V(0, 6.7, -15.85), 0.03, 5); // backstay
  for (const s of [1, -1]) {
    for (const z of [-0.6, -2.4]) rig.cyl(V(0, 9.0, 1.0), V(s * (beamX(z) + 0.1), 3.4, z), 0.025, 5); // shrouds
    rig.cyl(V(s * 5.8, 9.75, 1.3), V(0, 11.0, 1.0), 0.025, 5); // lifts
    rig.cyl(V(s * 5.9, 9.65, 1.3), V(s * 2.6, 3.5, -4.0), 0.025, 5); // braces
    rig.cyl(V(s * 5.2, 4.35, 1.4), V(s * 2.5, 3.5, 3.4), 0.025, 5); // sheets
  }
  rig.flush(ROPE, hull);

  // masthead pennant
  b.extrude([[0, -0.25], [1.8, -0.12], [1.45, 0], [1.8, 0.12], [0, 0.25]], {
    at: [0, 11.0, 1.0], x: [0, 0.05, 1], y: [0, 1, -0.05], thickness: 0.03, color: RED, bone: mastJ,
  });

  // oar-gap rope fenders along the waterline wale
  const fenders = bucket();
  for (let i = 0; i < 9; i++) {
    const z = zs[i] + 0.3;
    for (const s of [1, -1]) fenders.add(new THREE.SphereGeometry(0.1, 5, 4), [s * (widthAt(z, 1.2) + 0.1), 1.2, z]);
  }
  fenders.flush(ROPE, hull);

  return b.root;
}
