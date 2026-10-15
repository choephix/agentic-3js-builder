// Wizard's bookshelf: a tall walnut-and-gold bookcase under a moon-crowned pediment, crammed with cel-shaded tomes,
// scrolls, glowing orbs, crystals, potions and melting candles. High-fantasy anime: toon kit paints (lit tone + one
// hard hue-shifted shadow tone), gold filigree drawn as SVG inlays, and glow kit for every magic light.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { rng } from "../../../../src/math";
import { grain, paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A tall walnut bookcase with gold filigree doors, a crescent-moon pediment and four shelves of cel-shaded tomes, scrolls, a crystal ball, a floating orb, an armillary sphere, potions, crystals and melting candles.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

type V = [number, number, number];
type O2 = Array<[number, number]>;

const DEG = Math.PI / 180;
const ONE = new THREE.Vector3(1, 1, 1);

const quatOf = (x: number, y: number, z: number) =>
  new THREE.Quaternion().setFromEuler(new THREE.Euler(x * DEG, y * DEG, z * DEG));

const sc = (o: O2, sx: number, sy = sx): O2 => o.map(([x, y]) => [x * sx, y * sy] as [number, number]);

const merge = (gs: THREE.BufferGeometry[]) => {
  const g = mergeGeometries(gs);
  if (!g) throw new Error("wizardBookshelf: geometries could not be merged");
  return g;
};

const starPath = (cx: number, cy: number, r1: number, r2: number, n: number) => {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    const r = i % 2 === 0 ? r1 : r2;
    d += `${i === 0 ? "M" : "L"}${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)} `;
  }
  return `${d}Z`;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const S = (markup: string, size: number) => svg(markup, { size });

const GOLD_LINE = "#f4c95a";
const GOLD_DEEP = "#d99a34";
const RUNE_INK = "#3a2350";

const labelSvg = (v: number) => {
  const glyph =
    v === 0
      ? `<circle cx="15" cy="24" r="5.5" fill="none" stroke="${RUNE_INK}" stroke-width="1.7"/>
         <path d="M15 14 V34 M8 24 H22" stroke="${RUNE_INK}" stroke-width="1.7" stroke-linecap="round"/>
         <path d="M8 48 l3.5 -5 l3.5 5 l3.5 -5 l3.5 5" stroke="${RUNE_INK}" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
         <circle cx="15" cy="60" r="1.8" fill="${RUNE_INK}"/>`
      : v === 1
        ? `<path d="M15 13 L23 30 H7 Z" fill="none" stroke="${RUNE_INK}" stroke-width="1.7" stroke-linejoin="round"/>
           <circle cx="15" cy="24" r="1.9" fill="${RUNE_INK}"/>
           <path d="M8 42 H22 M10 48 H20 M12 54 H18 M15 58 V64" stroke="${RUNE_INK}" stroke-width="1.7" stroke-linecap="round"/>`
        : `<path d="M7 22 Q11 14 15 22 T23 22" stroke="${RUNE_INK}" stroke-width="1.7" fill="none" stroke-linecap="round"/>
           <path d="${starPath(15, 42, 7, 3, 5)}" fill="none" stroke="${RUNE_INK}" stroke-width="1.5" stroke-linejoin="round"/>
           <path d="M9 58 H21 M12 63 H18" stroke="${RUNE_INK}" stroke-width="1.7" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 30 72">
    <rect x="1" y="1" width="28" height="70" rx="3" fill="#f6e6bb" stroke="#c28a2c" stroke-width="1.6"/>
    ${glyph}
  </svg>`;
};

const emblemSvg = (v: number) =>
  v === 0
    ? `<svg viewBox="0 0 30 72">
        <path d="M15 10 L25 36 L15 62 L5 36 Z" fill="none" stroke="${GOLD_LINE}" stroke-width="2.2" stroke-linejoin="round"/>
        <circle cx="15" cy="36" r="4" fill="${GOLD_LINE}"/>
      </svg>`
    : `<svg viewBox="0 0 30 72">
        <circle cx="15" cy="22" r="9" fill="none" stroke="${GOLD_LINE}" stroke-width="2.2"/>
        <path d="${starPath(15, 22, 6, 2.6, 6)}" fill="${GOLD_LINE}"/>
        <path d="M15 34 V50" stroke="${GOLD_LINE}" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="15" cy="58" r="3.4" fill="${GOLD_LINE}"/>
      </svg>`;

const orbSvg = (deep: string, mid: string, bright: string, accent: string, seed: number) => {
  const r = rng(seed);
  let dots = "";
  for (let i = 0; i < 26; i++)
    dots += `<circle cx="${(r() * 128).toFixed(1)}" cy="${(6 + r() * 52).toFixed(1)}" r="${(0.6 + r() * 1.1).toFixed(2)}" fill="${bright}" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
  return `<svg viewBox="0 0 128 64">
    <defs>
      <linearGradient id="h" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="${deep}"/><stop offset="0.25" stop-color="${deep}"/>
        <stop offset="0.5" stop-color="${mid}"/>
        <stop offset="0.75" stop-color="${deep}"/><stop offset="1" stop-color="${deep}"/>
      </linearGradient>
      <linearGradient id="v" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="${deep}" stop-opacity="0.85"/><stop offset="0.3" stop-color="${deep}" stop-opacity="0"/>
        <stop offset="0.7" stop-color="${deep}" stop-opacity="0"/><stop offset="1" stop-color="${deep}" stop-opacity="0.85"/>
      </linearGradient>
    </defs>
    <rect width="128" height="64" fill="url(#h)"/>
    <ellipse cx="64" cy="34" rx="22" ry="20" fill="${mid}" opacity="0.7"/>
    <path d="M30 40 Q50 12 72 30 T108 22" stroke="${accent}" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.8"/>
    <path d="M34 50 Q60 28 84 46 T112 40" stroke="${bright}" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6"/>
    ${dots}
    <rect width="128" height="64" fill="url(#v)"/>
    <ellipse cx="53" cy="17" rx="7" ry="4.2" fill="#ffffff" opacity="0.92" transform="rotate(-24 53 17)"/>
    <circle cx="72" cy="48" r="2.2" fill="#ffffff" opacity="0.7"/>
  </svg>`;
};

const doorSvg = `<svg viewBox="0 0 130 90">
  <rect x="1.5" y="1.5" width="127" height="87" rx="7" fill="#2b2368" stroke="${GOLD_LINE}" stroke-width="2.2"/>
  <rect x="7" y="7" width="116" height="76" rx="4" fill="none" stroke="${GOLD_DEEP}" stroke-width="1.2"/>
  <circle cx="65" cy="45" r="25" fill="#1f1a55" stroke="${GOLD_LINE}" stroke-width="2"/>
  <circle cx="65" cy="45" r="19.5" fill="none" stroke="${GOLD_DEEP}" stroke-width="1.2"/>
  <path d="${starPath(65, 45, 18, 8, 8)}" fill="${GOLD_LINE}"/>
  <circle cx="65" cy="45" r="5" fill="#8fe8ff"/>
  <path d="M38 45 C30 30 18 36 22 46 C25 54 34 52 32 46" stroke="${GOLD_LINE}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M92 45 C100 30 112 36 108 46 C105 54 96 52 98 46" stroke="${GOLD_LINE}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M14 22 C14 13 22 12 28 14 M116 22 C116 13 108 12 102 14 M14 68 C14 77 22 78 28 76 M116 68 C116 77 108 78 102 76" stroke="${GOLD_LINE}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <circle cx="45" cy="45" r="1.8" fill="${GOLD_LINE}"/><circle cx="85" cy="45" r="1.8" fill="${GOLD_LINE}"/>
  <path d="${starPath(20, 20, 3.4, 1.5, 4)}" fill="${GOLD_LINE}"/><path d="${starPath(110, 20, 3.4, 1.5, 4)}" fill="${GOLD_LINE}"/>
  <path d="${starPath(20, 70, 3.4, 1.5, 4)}" fill="${GOLD_LINE}"/><path d="${starPath(110, 70, 3.4, 1.5, 4)}" fill="${GOLD_LINE}"/>
</svg>`;

const sideSvg = `<svg viewBox="0 0 60 300">
  <rect x="1.5" y="1.5" width="57" height="297" rx="8" fill="#2b2368" stroke="${GOLD_LINE}" stroke-width="2.2"/>
  <rect x="6" y="6" width="48" height="288" rx="5" fill="none" stroke="${GOLD_DEEP}" stroke-width="1.2"/>
  <path d="M30 18 C10 48 50 78 30 108 S10 168 30 198 S50 258 30 288" stroke="${GOLD_LINE}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <ellipse cx="20" cy="40" rx="6" ry="3" fill="${GOLD_DEEP}" transform="rotate(-35 20 40)"/>
  <ellipse cx="42" cy="70" rx="6" ry="3" fill="${GOLD_DEEP}" transform="rotate(35 42 70)"/>
  <ellipse cx="18" cy="100" rx="6" ry="3" fill="${GOLD_DEEP}" transform="rotate(-35 18 100)"/>
  <ellipse cx="42" cy="130" rx="6" ry="3" fill="${GOLD_DEEP}" transform="rotate(35 42 130)"/>
  <ellipse cx="18" cy="170" rx="6" ry="3" fill="${GOLD_DEEP}" transform="rotate(-35 18 170)"/>
  <ellipse cx="42" cy="200" rx="6" ry="3" fill="${GOLD_DEEP}" transform="rotate(35 42 200)"/>
  <ellipse cx="20" cy="232" rx="6" ry="3" fill="${GOLD_DEEP}" transform="rotate(-35 20 232)"/>
  <ellipse cx="42" cy="262" rx="6" ry="3" fill="${GOLD_DEEP}" transform="rotate(35 42 262)"/>
  <circle cx="30" cy="48" r="8.5" fill="${GOLD_LINE}"/><circle cx="34.5" cy="46" r="7.5" fill="#2b2368"/>
  <circle cx="30" cy="150" r="8.5" fill="${GOLD_LINE}"/><circle cx="30" cy="150" r="5" fill="#2b2368"/><circle cx="30" cy="150" r="2.2" fill="${GOLD_LINE}"/>
  <circle cx="30" cy="252" r="8.5" fill="${GOLD_LINE}"/><circle cx="25.5" cy="254" r="7.5" fill="#2b2368"/>
  <path d="${starPath(30, 100, 5, 2, 4)}" fill="${GOLD_LINE}"/><path d="${starPath(30, 202, 5, 2, 4)}" fill="${GOLD_LINE}"/>
  <path d="${starPath(30, 16, 4, 1.7, 5)}" fill="${GOLD_LINE}"/><path d="${starPath(30, 286, 4, 1.7, 5)}" fill="${GOLD_LINE}"/>
</svg>`;

const crownSvg = `<svg viewBox="0 0 100 22">
  <circle cx="50" cy="11" r="9.2" fill="none" stroke="${GOLD_LINE}" stroke-width="1"/>
  <circle cx="50" cy="11" r="7.2" fill="none" stroke="${GOLD_DEEP}" stroke-width="0.7"/>
  <path d="M47.5 5.2 A6 6 0 1 0 47.5 16.8 A4.6 4.6 0 1 1 47.5 5.2 Z" fill="${GOLD_LINE}"/>
  <path d="${starPath(54.5, 11, 3.2, 1.4, 5)}" fill="${GOLD_LINE}"/>
  <path d="M40 15 Q34 20 28 17 T16 17 T6 17" stroke="${GOLD_LINE}" stroke-width="1" fill="none" stroke-linecap="round"/>
  <path d="M60 15 Q66 20 72 17 T84 17 T94 17" stroke="${GOLD_LINE}" stroke-width="1" fill="none" stroke-linecap="round"/>
  <circle cx="22" cy="14" r="1.1" fill="${GOLD_LINE}"/><circle cx="78" cy="14" r="1.1" fill="${GOLD_LINE}"/>
  <path d="${starPath(10, 12, 2.4, 1, 4)}" fill="${GOLD_LINE}"/><path d="${starPath(90, 12, 2.4, 1, 4)}" fill="${GOLD_LINE}"/>
</svg>`;

const runeTextSvg = (() => {
  const r = rng(91);
  let rows = "";
  for (let row = 0; row < 8; row++) {
    let x = 12;
    const y = 16 + row * 15;
    while (x < 84) {
      const w = 4 + r() * 10;
      if (x + w > 88) break;
      rows += `<path d="M${x.toFixed(1)} ${y} h${w.toFixed(1)}" stroke="#6bf1ff" stroke-width="2.2" stroke-linecap="round"/>`;
      if (r() < 0.5) rows += `<path d="M${(x + w / 2).toFixed(1)} ${y - 3} v6" stroke="#6bf1ff" stroke-width="1.8" stroke-linecap="round"/>`;
      x += w + 5;
    }
  }
  return `<svg viewBox="0 0 100 140">${rows}</svg>`;
})();

const runeCircleSvg = `<svg viewBox="0 0 100 140">
  <circle cx="50" cy="70" r="40" fill="none" stroke="#6bf1ff" stroke-width="2.4"/>
  <circle cx="50" cy="70" r="30" fill="none" stroke="#6bf1ff" stroke-width="1.8"/>
  <path d="${starPath(50, 70, 30, 14, 6)}" fill="none" stroke="#6bf1ff" stroke-width="1.8" stroke-linejoin="round"/>
  <circle cx="50" cy="70" r="4" fill="#6bf1ff"/>
  <path d="M50 22 v-6 M50 118 v6 M12 70 h-6 M88 70 h6" stroke="#6bf1ff" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

const scrollEndSvg = `<svg viewBox="0 0 40 40">
  <circle cx="20" cy="20" r="19" fill="#f1dca6" stroke="#c59a5c" stroke-width="2"/>
  <circle cx="20" cy="20" r="14" fill="none" stroke="#b98d58" stroke-width="1.8"/>
  <circle cx="20" cy="20" r="9" fill="none" stroke="#b98d58" stroke-width="1.8"/>
  <circle cx="20" cy="20" r="4" fill="#b98d58"/>
</svg>`;

const starfieldSvg = (() => {
  const r = rng(515);
  let s = "";
  for (let i = 0; i < 110; i++) {
    const col = r() < 0.2 ? "#ffd9a0" : r() < 0.4 ? "#9fb6ff" : "#ffffff";
    s += `<circle cx="${(r() * 118).toFixed(1)}" cy="${(r() * 133).toFixed(1)}" r="${(0.35 + r() * 0.8).toFixed(2)}" fill="${col}" opacity="${(0.55 + r() * 0.45).toFixed(2)}"/>`;
  }
  for (let i = 0; i < 12; i++) {
    const x = 6 + r() * 106;
    const y = 6 + r() * 120;
    const q = 1.8 + r() * 1.6;
    s += `<path d="M${x.toFixed(1)} ${(y - q).toFixed(1)} Q${x.toFixed(1)} ${y.toFixed(1)} ${(x + q).toFixed(1)} ${y.toFixed(1)} Q${x.toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${(y + q).toFixed(1)} Q${x.toFixed(1)} ${y.toFixed(1)} ${(x - q).toFixed(1)} ${y.toFixed(1)} Q${x.toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${(y - q).toFixed(1)} Z" fill="${GOLD_LINE}"/>`;
  }
  return `<svg viewBox="0 0 118 133">
    <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#352c80"/><stop offset="1" stop-color="#17133f"/></linearGradient></defs>
    <rect width="118" height="133" fill="url(#g)"/>
    <ellipse cx="30" cy="30" rx="36" ry="18" fill="#6a3fb0" opacity="0.28"/>
    <ellipse cx="92" cy="86" rx="40" ry="20" fill="#2c7fbf" opacity="0.25"/>
    <ellipse cx="50" cy="118" rx="34" ry="12" fill="#b04fa0" opacity="0.2"/>
    <path d="M12 20 L30 34 L46 22 L66 40 L84 28 M24 90 L44 78 L62 96 L90 84 L106 100" stroke="#8d96ff" stroke-width="0.4" fill="none" opacity="0.7"/>
    ${s}
  </svg>`;
})();

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf", paintSize: 2048 });
  const R = rng(1337);
  const base = b.joint("base", { at: [0, 0, 0] });

  // ---- Palette --------------------------------------------------------------------------------------------------
  const GOLD = "#f2c14e";
  const PARCH = "#f3e1b3";
  const RED = "#c2262e";
  const BLUE = "#2e5cc7";
  const JADE = "#1f9a73";
  const RIBBONS = [RED, BLUE, JADE];

  const WOOD = cel(grain("#94583b", "#7f4731", { size: 0.022, axis: "x" }));
  const WOOD_V = cel(grain("#94583b", "#7f4731", { size: 0.022, axis: "y" }));
  const WOOD_D = cel(grain("#5e3446", "#4b2939", { size: 0.022, axis: "x" }));
  const WOOD_DV = cel(grain("#5e3446", "#4b2939", { size: 0.022, axis: "y" }));
  const GOLDP = cel("#f7cd5c", "#c98a2b");
  const PAGE = cel("#fff0cd", "#e6c694");
  const PARCHP = cel("#f4e2b6", "#d9b889");
  const PARCHDP = cel("#d9b27a", "#b98d58");
  const NAVYP = cel("#2c2a78", "#1d1a58");
  const STONE = cel("#6a5f86", "#4c4468");
  const VASE = cel("#2f6fb0");
  const SAND = cel("#f0b95e");
  const GLASS = cel("#bfe9f2");
  const WAXES = [cel("#f5ebd3"), cel("#c9a8f0"), cel("#ec7580")];
  const COVERS = ["#a8324a", "#2f55b0", "#1f8f70", "#6d42a8", "#1f93a6", "#d9812e", "#3b3f8f", "#b7457a"].map((c) =>
    cel(c),
  );
  const FEATHER = cel("#eef3ff", "#bccaf5");

  // ---- Helpers --------------------------------------------------------------------------------------------------
  const P = (g: THREE.BufferGeometry, color: Fill, o: PartOptions = {}) => b.part(g, color, { bone: base, ...o });
  const box = (w: number, h: number, d: number, color: Fill, x: number, y: number, z: number, o: PartOptions = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...o });

  /** Merged flat-colour model-space bits, one part per colour at the end. */
  const bits = new Map<string, THREE.BufferGeometry[]>();
  const addBit = (color: string, g: THREE.BufferGeometry) => {
    const list = bits.get(color);
    if (list) list.push(g);
    else bits.set(color, [g]);
  };
  const bitAt = (color: string, g: THREE.BufferGeometry, at: V, rot: V = [0, 0, 0]) => {
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(at[0], at[1], at[2]), quatOf(rot[0], rot[1], rot[2]), ONE));
    addBit(color, g);
  };

  /** Merged textured decal planes, one part per drawing. */
  const decals = new Map<string, { tex: THREE.Texture; geos: THREE.BufferGeometry[] }>();
  const decalTex = (key: string, tex: THREE.Texture) => decals.set(key, { tex, geos: [] });
  for (let v = 0; v < 3; v++) decalTex(`label${v}`, S(labelSvg(v), 144));
  for (let v = 0; v < 2; v++) decalTex(`emblem${v}`, S(emblemSvg(v), 144));
  decalTex("scrollEnd", S(scrollEndSvg, 64));
  const addDecal = (key: string, g: THREE.BufferGeometry) => decals.get(key)!.geos.push(g);

  const ORB_COSMOS = S(orbSvg("#1b1f6b", "#4a6bff", "#9ef0ff", "#d98cff", 3), 256);
  const ORB_EMBER = S(orbSvg("#8a1d0c", "#ff7a1a", "#ffe27a", "#ffb13a", 5), 256);
  const ORB_VERDANT = S(orbSvg("#0c4a3a", "#27c98a", "#c8ffd8", "#7dffc4", 8), 256);
  const RUNE_TEXT = S(runeTextSvg, 400);
  const RUNE_CIRCLE = S(runeCircleSvg, 400);

  const orb = (tex: THREE.Texture, x: number, y: number, z: number, r: number, strength = 1) =>
    glow(
      P(new THREE.SphereGeometry(r, 14, 10), "#ffffff", { at: [x, y, z], rotation: [0, -90, 0], texture: tex }),
      strength,
    );

  /** Parts placed in a tilted local frame. */
  const placeIn = (origin: THREE.Vector3, Q: THREE.Quaternion) => {
    return (g: THREE.BufferGeometry, color: Fill, lp: V, le: V = [0, 0, 0], o: PartOptions = {}) => {
      const pos = new THREE.Vector3(lp[0], lp[1], lp[2]).applyQuaternion(Q).add(origin);
      const quat = Q.clone().multiply(quatOf(le[0], le[1], le[2]));
      return P(g, color, { at: [pos.x, pos.y, pos.z], quat, ...o });
    };
  };

  // ---- Structure ------------------------------------------------------------------------------------------------
  const CY = [0.6, 0.94, 1.28, 1.62];
  const BT = 0.035;
  const FY = CY.map((c) => c + BT / 2);
  const TOP = 1.96;
  const TS = TOP + BT / 2;

  // Plinth
  box(1.46, 0.07, 0.5, WOOD_D, 0, 0.035, 0);
  box(1.4, 0.05, 0.46, WOOD, 0, 0.095, 0);
  addBit(GOLD, new THREE.BoxGeometry(1.4, 0.008, 0.004).translate(0, 0.095, 0.2315));
  addBit(GOLD, new THREE.BoxGeometry(1.46, 0.006, 0.004).translate(0, 0.055, 0.2515));
  for (let x = -0.66; x <= 0.661; x += 0.11) addBit(GOLD, new THREE.SphereGeometry(0.008, 6, 4).translate(x, 0.035, 0.252));

  // Corner columns
  const CH = TS - 0.12;
  const colO: O2 = [
    [0, 0], [0.058, 0], [0.058, 0.025], [0.046, 0.04], [0.036, 0.1], [0.036, CH - 0.17], [0.05, CH - 0.125],
    [0.05, CH - 0.1], [0.04, CH - 0.075], [0.058, CH - 0.045], [0.058, CH], [0, CH],
  ];
  const colPaint = paint((_p, _n, s) => {
    const y = s[0];
    if (y > CH - 0.1) return GOLDP;
    for (const c of [0.35, 0.75, 1.15, 1.5]) if (Math.abs(y - c) < 0.012) return GOLDP;
    return WOOD_DV;
  });

  for (const s of [1, -1]) {
    b.lathe(colO, { at: [s * 0.63, 0.12, 0.19], segments: 10, color: colPaint, bone: base });
    // side panel with gold-vine inlay
    box(0.06, TS - 0.12, 0.38, WOOD_V, s * 0.62, 0.12 + (TS - 0.12) / 2, 0);
    addDecal; // (decal map is for books; the side inlay is its own part)
    P(new THREE.PlaneGeometry(0.28, 1.5), "#ffffff", {
      at: [s * 0.6515, 1.0, -0.03],
      rotation: [0, s * 90, 0],
      texture: S(sideSvg, 1200),
    });
    // little gold feet and rivets on the panel face
    for (const y of [0.2, 1.84]) addBit(GOLD, new THREE.SphereGeometry(0.01, 6, 4).translate(s * 0.652, y, 0.1));
  }

  // Back panels with the starry night inlay
  box(1.18, 1.325, 0.02, WOOD_D, 0, 1.28, -0.18);
  box(1.18, 0.46, 0.02, WOOD_D, 0, 0.36, -0.18);
  P(new THREE.PlaneGeometry(1.17, 1.31), "#ffffff", {
    at: [0, 1.28, -0.1695],
    texture: S(starfieldSvg, 1024),
  });

  // Shelves
  const shelfTrim = (c: number, w: number, z: number) => {
    addBit(GOLD, new THREE.BoxGeometry(w, 0.007, 0.003).translate(0, c + 0.0115, z + 0.0015));
    addBit(GOLD, new THREE.BoxGeometry(w, 0.007, 0.003).translate(0, c - 0.0275, z + 0.0015));
    for (let x = -w / 2 + 0.06; x <= w / 2 - 0.05; x += 0.12)
      addBit(GOLD, new THREE.SphereGeometry(0.0065, 6, 4).translate(x, c - 0.0075, z + 0.002));
  };
  for (const c of CY) {
    box(1.18, BT, 0.37, WOOD, 0, c, 0.005);
    box(1.18, 0.05, 0.012, WOOD_D, 0, c - 0.0075, 0.196);
    shelfTrim(c, 1.18, 0.202);
  }
  // top board with overhang
  box(1.36, BT, 0.43, WOOD, 0, TOP, 0);
  box(1.36, 0.05, 0.012, WOOD_D, 0, TOP - 0.0075, 0.221);
  shelfTrim(TOP, 1.36, 0.227);
  addBit(GOLD, new THREE.BoxGeometry(1.36, 0.006, 0.43).translate(0, TOP + 0.0205, 0).scale(1, 0.0001, 1));

  // ---- Crown ----------------------------------------------------------------------------------------------------
  const CROWN: O2 = [
    [-0.72, 0], [0.72, 0], [0.72, 0.05], [0.55, 0.08], [0.35, 0.15], [0.14, 0.27], [0, 0.4],
    [-0.14, 0.27], [-0.35, 0.15], [-0.55, 0.08], [-0.72, 0.05],
  ];
  const scaleO = (pts: O2, s: number, cy: number): O2 => pts.map(([x, y]) => [x * s, cy + (y - cy) * s] as [number, number]);
  const CZ = -0.12;
  b.extrude(CROWN, { at: [0, TS, CZ], x: [1, 0, 0], thickness: 0.14, bevel: 0.006, color: WOOD, bone: base });
  b.extrude(scaleO(CROWN, 0.92, 0.15), {
    at: [0, TS, CZ], x: [1, 0, 0], thickness: 0.146, bevel: 0.003, color: GOLDP, bone: base,
  });
  b.extrude(scaleO(CROWN, 0.8, 0.15), {
    at: [0, TS, CZ], x: [1, 0, 0], thickness: 0.15, bevel: 0.002, color: NAVYP, bone: base,
  });
  P(new THREE.PlaneGeometry(1.0, 0.22), "#ffffff", {
    at: [0, TS + 0.15, CZ + 0.0765],
    texture: S(crownSvg, 1000),
  });
  b.sweep(
    CROWN.slice(2).map(([x, y]) => [x, TS + y + 0.002, CZ + 0.072]),
    0.007,
    { color: GOLDP, sides: 6, bone: base },
  );
  // apex moon: pedestal, crescent and a star orb
  b.lathe(
    [[0, 0], [0.032, 0], [0.022, 0.02], [0.012, 0.05], [0.012, 0.07], [0, 0.07]],
    { at: [0, TS + 0.395, CZ], segments: 8, color: GOLDP, bone: base },
  );
  const moonY = TS + 0.395 + 0.07 + 0.063;
  b.extrude(
    (() => {
      const Ro = 0.07;
      const d = 0.03;
      const ri = 0.06;
      const n = 14;
      const phi = Math.acos((Ro * Ro + d * d - ri * ri) / (2 * Ro * d));
      const psi = Math.atan2(Ro * Math.sin(phi), Ro * Math.cos(phi) - d);
      const pts: O2 = [];
      for (let i = 0; i <= n; i++) {
        const a = phi + ((2 * Math.PI - 2 * phi) * i) / n;
        pts.push([Ro * Math.cos(a), Ro * Math.sin(a)]);
      }
      for (let i = 1; i < n; i++) {
        const a = 2 * Math.PI - psi - ((2 * Math.PI - 2 * psi) * i) / n;
        pts.push([d + ri * Math.cos(a), ri * Math.sin(a)]);
      }
      return pts;
    })(),
    { at: [0, moonY, CZ], x: [1, 0, 0], thickness: 0.022, bevel: 0.004, color: GOLDP, bone: base },
  );
  orb(ORB_COSMOS, 0.03, moonY, CZ, 0.026, 1.2);
  // side finials
  for (const s of [1, -1]) {
    b.lathe(
      [[0, 0], [0.034, 0], [0.034, 0.02], [0.022, 0.04], [0.028, 0.08], [0.012, 0.115], [0, 0.125]],
      { at: [s * 0.7, TS + 0.04, CZ], segments: 8, color: GOLDP, bone: base },
    );
    orb(ORB_VERDANT, s * 0.7, TS + 0.04 + 0.145, CZ, 0.022, 1.1);
  }

  // ---- Cabinet doors (hinged) ----------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const door = b.joint(s > 0 ? "doorL" : "doorR", {
      parent: base, at: [s * 0.575, 0.345, 0.2], dir: [0, 1, 0], role: "hinge",
    });
    const DP = (g: THREE.BufferGeometry, color: Fill, o: PartOptions = {}) => P(g, color, { bone: door, ...o });
    const cx = s * 0.2925;
    DP(new THREE.BoxGeometry(0.565, 0.43, 0.03), WOOD, { at: [cx, 0.345, 0.195] });
    DP(new THREE.BoxGeometry(0.45, 0.31, 0.012), WOOD_D, { at: [cx, 0.345, 0.2155] });
    DP(new THREE.PlaneGeometry(0.43, 0.3), "#ffffff", { at: [cx, 0.345, 0.2228], texture: S(doorSvg, 700) });
    const dg: THREE.BufferGeometry[] = [];
    dg.push(new THREE.BoxGeometry(0.46, 0.01, 0.006).translate(cx, 0.345 + 0.16, 0.2235));
    dg.push(new THREE.BoxGeometry(0.46, 0.01, 0.006).translate(cx, 0.345 - 0.16, 0.2235));
    dg.push(new THREE.BoxGeometry(0.01, 0.32, 0.006).translate(cx + 0.23, 0.345, 0.2235));
    dg.push(new THREE.BoxGeometry(0.01, 0.32, 0.006).translate(cx - 0.23, 0.345, 0.2235));
    for (const y of [0.2, 0.49]) {
      dg.push(new THREE.BoxGeometry(0.16, 0.03, 0.006).translate(s * 0.495, y, 0.2125));
      for (const dx of [-0.055, 0, 0.055]) dg.push(new THREE.SphereGeometry(0.005, 6, 4).translate(s * 0.495 + dx, y, 0.2165));
      dg.push(new THREE.CylinderGeometry(0.012, 0.012, 0.034, 6).rotateX(Math.PI / 2).translate(s * 0.575, y, 0.2));
    }
    dg.push(new THREE.SphereGeometry(0.014, 8, 6).translate(s * 0.05, 0.345, 0.2245));
    if (s > 0) dg.push(new THREE.BoxGeometry(0.026, 0.048, 0.003).translate(0.05, 0.27, 0.2235));
    DP(merge(dg), GOLD, { at: [0, 0, 0] });
    DP(new THREE.TorusGeometry(0.02, 0.004, 5, 16), GOLDP, { at: [s * 0.05, 0.322, 0.2255] });
    if (s > 0) {
      DP(new THREE.CircleGeometry(0.005, 6), INK, { at: [0.05, 0.274, 0.2255] });
      DP(new THREE.BoxGeometry(0.003, 0.014, 0.001), INK, { at: [0.05, 0.264, 0.2255] });
    }
  }

  // ---- Books ----------------------------------------------------------------------------------------------------
  type BookOpts = {
    x: number; y: number; z: number; t: number; h: number; d: number; cover: number;
    deco?: string | null; lying?: boolean; roll?: number; yaw?: number; ornate?: boolean;
  };
  let lastCover = -1;
  const pickCover = () => {
    let c = Math.floor(R() * COVERS.length);
    if (c === lastCover) c = (c + 1) % COVERS.length;
    lastCover = c;
    return c;
  };
  const pickDeco = () => {
    const r = R();
    return r < 0.55 ? `label${Math.floor(R() * 3)}` : r < 0.85 ? `emblem${Math.floor(R() * 2)}` : null;
  };

  /** Places one tome; `x` is its centre, `y` the surface it rests on. Returns the new surface height above it. */
  const book = (o: BookOpts) => {
    const lying = o.lying ?? false;
    const roll = o.roll ?? 0;
    const q = quatOf(0, o.yaw ?? 0, 0).multiply(quatOf(0, 0, (lying ? 90 : 0) + roll));
    const lift = lying ? o.t / 2 : (o.t / 2) * Math.abs(Math.sin(roll * DEG)) + 0.0004;
    const at = new THREE.Vector3(lying ? o.x + o.h / 2 : o.x, o.y + lift, o.z);
    const M = new THREE.Matrix4().compose(at, q, ONE);
    const inv = M.clone().invert();
    const { t, h, d } = o;
    const cover = COVERS[o.cover];
    const ornate = o.ornate ?? false;
    const coverPaint = paint((p, n) => {
      const lp = p.clone().applyMatrix4(inv);
      const m = n.clone().transformDirection(inv);
      if (m.z > 0.6) {
        for (const c of [0.025, 0.036, h - 0.025, h - 0.036]) if (Math.abs(lp.y - c) < 0.0042) return GOLDP;
        return cover;
      }
      if (m.z < -0.6) return PAGE;
      if (Math.abs(m.y) > 0.6) return Math.abs(lp.x) < t / 2 - 0.006 ? PAGE : cover;
      if (ornate) {
        const e = Math.min(lp.y, h - lp.y, d / 2 - lp.z, lp.z + d / 2);
        if (e > 0.01 && e < 0.016) return GOLDP;
        const rr = Math.hypot(lp.y - h * 0.5, lp.z + d * 0.04);
        const ring = Math.min(h, d) * 0.22;
        if (Math.abs(rr - ring) < 0.0045 || rr < 0.008) return GOLDP;
      }
      return cover;
    });
    P(new THREE.BoxGeometry(t, h, d).translate(0, h / 2, 0), coverPaint, { at: [at.x, at.y, at.z], quat: q });
    if (o.deco) {
      const w = t * 0.8;
      const hh = Math.min(h * 0.42, w * 2.4);
      addDecal(o.deco, new THREE.PlaneGeometry(w, hh).translate(0, h * 0.58, d / 2 + 0.0016).applyMatrix4(M));
    }
    if (ornate) {
      for (const sy of [0.014, h - 0.014])
        for (const sz of [-1, 1])
          addBit(GOLD, new THREE.BoxGeometry(t + 0.005, 0.026, 0.026).translate(0, sy, sz * (d / 2 - 0.011)).applyMatrix4(M));
      addBit(GOLD, new THREE.BoxGeometry(t + 0.006, 0.03, 0.006).translate(0, h / 2, -d / 2 - 0.001).applyMatrix4(M));
      addBit(GOLD, new THREE.BoxGeometry(t + 0.008, 0.012, 0.01).translate(0, h / 2, -d / 2 - 0.004).applyMatrix4(M));
    }
    return lying ? o.y + o.t : o.y + o.h;
  };

  const SPINE_Z = 0.145;
  const row = (x0: number, x1: number, fy: number, hMin: number, hMax: number) => {
    let x = x0;
    for (;;) {
      const t = 0.026 + R() * 0.034;
      if (x + t > x1) break;
      const h = hMin + R() * (hMax - hMin);
      const d = 0.2 + R() * 0.06;
      const spine = SPINE_Z + (R() - 0.5) * 0.012;
      book({ x: x + t / 2, y: fy, z: spine - d / 2, t, h, d, cover: pickCover(), deco: pickDeco(), ornate: R() < 0.25 });
      x += t + 0.001;
    }
    return x;
  };
  const leanBook = (x: number, fy: number, h: number, roll = 12) =>
    book({ x, y: fy, z: SPINE_Z - 0.115, t: 0.034, h, d: 0.23, cover: pickCover(), deco: pickDeco(), roll });
  /** A pile of lying tomes centred on `cx`; returns the surface height on top. */
  const pile = (cx: number, fy: number, z: number, list: Array<{ h: number; t: number; d: number }>, ornate = true) => {
    let y = fy;
    for (const it of list)
      y = book({
        x: cx + (R() - 0.5) * 0.02, y, z: z - it.d / 2 + 0.145, t: it.t, h: it.h, d: it.d,
        cover: pickCover(), deco: pickDeco(), lying: true, yaw: (R() - 0.5) * 14, ornate,
      });
    return y;
  };

  // ---- Candles --------------------------------------------------------------------------------------------------
  const FLAME_O: O2 = [[0, 0], [0.009, 0.005], [0.012, 0.015], [0.009, 0.028], [0.004, 0.04], [0, 0.052]];
  const flame = (x: number, y: number, z: number, s = 1) => {
    glow(b.lathe(sc(FLAME_O, s), { at: [x, y, z], segments: 6, color: "#ffab2e", bone: base }), 1.4);
    glow(b.lathe(sc(FLAME_O, s * 0.55), { at: [x, y + 0.002 * s, z], segments: 6, color: "#fff4b8", bone: base }), 1.6);
  };
  const candle = (x: number, y: number, z: number, h: number, r: number, wax: number, drips = 3, flameScale = 1) => {
    const W = WAXES[wax];
    P(new THREE.CylinderGeometry(r * 0.94, r, h, 9), W, { at: [x, y + h / 2, z] });
    P(new THREE.CylinderGeometry(r * 1.07, r * 1.0, 0.008, 9), W, { at: [x, y + h - 0.003, z] });
    for (let i = 0; i < drips; i++) {
      const a = (i / drips) * Math.PI * 2 + R() * 0.8;
      const len = Math.min(0.02 + R() * 0.04, h * 0.6);
      const rr = 0.0042 + R() * 0.002 + r * 0.05;
      P(new THREE.CapsuleGeometry(rr, len, 2, 5), W, {
        at: [x + Math.cos(a) * r * 1.02, y + h - len / 2 - 0.004, z + Math.sin(a) * r * 1.02],
      });
    }
    P(new THREE.CylinderGeometry(0.0018, 0.0018, 0.014, 4), INK, { at: [x, y + h + 0.005, z] });
    flame(x, y + h + 0.008, z, flameScale);
  };
  const stickO = (h: number): O2 => [
    [0, 0], [0.05, 0], [0.052, 0.008], [0.04, 0.016], [0.014, 0.03], [0.012, 0.05], [0.02, 0.058], [0.012, 0.066],
    [0.012, h - 0.03], [0.026, h - 0.014], [0.03, h - 0.008], [0.03, h], [0, h],
  ];
  const candleStick = (x: number, y: number, z: number, h = 0.12) => {
    b.lathe(stickO(h), { at: [x, y, z], segments: 8, color: GOLDP, bone: base });
    return y + h;
  };
  const candelabra = (x: number, y: number, z: number) => {
    b.lathe(
      [[0, 0], [0.06, 0], [0.064, 0.01], [0.04, 0.025], [0.016, 0.05], [0.014, 0.08], [0.024, 0.095], [0.014, 0.11], [0.014, 0.18], [0.03, 0.19], [0, 0.19]],
      { at: [x, y, z], segments: 8, color: GOLDP, bone: base },
    );
    candle(x, y + 0.186, z, 0.13, 0.015, 0, 4);
    for (const s of [1, -1]) {
      b.sweep(
        [[x, y + 0.12, z], [x + s * 0.07, y + 0.115, z], [x + s * 0.12, y + 0.165, z]],
        0.006,
        { color: GOLDP, sides: 5, bone: base },
      );
      b.lathe([[0, 0], [0.022, 0], [0.026, 0.02], [0.014, 0.02], [0, 0.02]], {
        at: [x + s * 0.12, y + 0.165, z], segments: 8, color: GOLDP, bone: base,
      });
      candle(x + s * 0.12, y + 0.18, z, s > 0 ? 0.1 : 0.085, 0.014, s > 0 ? 1 : 2, 3);
    }
  };

  // ---- Scrolls --------------------------------------------------------------------------------------------------
  const scrollRoll = (cx: number, cy: number, cz: number, len: number, r: number, axis: "x" | "z", ribbon: string) => {
    const ax: V = axis === "x" ? [1, 0, 0] : [0, 0, 1];
    const rot: V = axis === "x" ? [0, 0, 90] : [90, 0, 0];
    const at = (k: number): V => [cx + ax[0] * k, cy, cz + ax[2] * k];
    P(new THREE.CylinderGeometry(r, r, len, 10), PARCHP, { at: [cx, cy, cz], rotation: rot });
    for (const k of [-1, 1]) {
      P(new THREE.CylinderGeometry(r * 1.07, r * 1.07, 0.014, 10), PARCHDP, { at: at(k * (len / 2 - 0.007)), rotation: rot });
      bitAt(GOLD, new THREE.SphereGeometry(r * 0.55, 6, 4), at(k * (len / 2 + 0.012)));
      bitAt(GOLD, new THREE.CylinderGeometry(r * 0.3, r * 0.3, 0.02, 6), at(k * (len / 2 + 0.002)), rot);
    }
    const tr: V = axis === "x" ? [0, 90, 0] : [0, 0, 0];
    bitAt(ribbon, new THREE.TorusGeometry(r * 1.08, 0.004, 4, 12), at(len * 0.16), tr);
    bitAt(RED, new THREE.SphereGeometry(0.008, 6, 4).scale(1, 1, 0.6), [cx + ax[0] * len * 0.16, cy + r * 1.1, cz + ax[2] * len * 0.16]);
    bitAt(ribbon, new THREE.BoxGeometry(0.008, 0.03, 0.003), [cx + ax[0] * len * 0.16 + 0.004, cy + r * 1.1 - 0.02, cz + ax[2] * len * 0.16 + 0.004]);
  };

  // ---- Props: orbs, crystals, potions ---------------------------------------------------------------------------
  const crystalCluster = (cx: number, y: number, cz: number) => {
    P(new THREE.DodecahedronGeometry(0.065, 0), STONE, { at: [cx, y + 0.025, cz], scale: [1.2, 0.55, 1], flat: true });
    const list: Array<[number, number, number, number, number, number, string]> = [
      [-0.015, 0.0, 0.17, 0.018, -6, 3, "#a56bff"],
      [0.03, 0.02, 0.12, 0.014, 16, -12, "#ff7bd8"],
      [-0.05, 0.015, 0.1, 0.013, -22, 10, "#6be6ff"],
      [0.012, -0.03, 0.14, 0.015, 8, 18, "#ff7bd8"],
      [0.055, -0.02, 0.07, 0.01, 30, 6, "#a56bff"],
    ];
    for (const [dx, dz, h, r, tx, tz, color] of list) {
      const body = new THREE.CylinderGeometry(r, r * 1.05, h * 0.65, 6).translate(0, h * 0.325, 0);
      const tip = new THREE.ConeGeometry(r, h * 0.35, 6).translate(0, h * 0.825, 0);
      glow(P(merge([body, tip]), color, { at: [cx + dx, y + 0.035, cz + dz], quat: quatOf(tx, 0, tz), flat: true }), 0.6);
    }
  };
  const BOTTLE: O2 = [[0, 0], [0.03, 0], [0.034, 0.01], [0.034, 0.05], [0.02, 0.075], [0.012, 0.09], [0.012, 0.105], [0, 0.105]];
  const potion = (x: number, y: number, z: number, color: string, k = 1) => {
    glow(b.lathe(sc(BOTTLE, k), { at: [x, y, z], segments: 8, color, bone: base }), 0.7);
    P(new THREE.CylinderGeometry(0.011 * k, 0.013 * k, 0.02, 6), "#b8884f", { at: [x, y + 0.113 * k, z] });
    bitAt(GOLD, new THREE.TorusGeometry(0.013 * k, 0.0025, 4, 8), [x, y + 0.103 * k, z], [90, 0, 0]);
  };
  const hourglass = (x: number, y: number, z: number) => {
    const O: O2 = [[0, 0], [0.03, 0], [0.034, 0.012], [0.034, 0.05], [0.008, 0.085], [0.008, 0.095], [0.034, 0.13], [0.034, 0.168], [0.03, 0.18], [0, 0.18]];
    const hg = paint((_p, _n, s) => (s[0] < 0.05 || (s[0] > 0.108 && s[0] < 0.14) ? SAND : GLASS));
    b.lathe(O, { at: [x, y + 0.012, z], segments: 10, color: hg, bone: base });
    P(new THREE.CylinderGeometry(0.046, 0.046, 0.012, 10), GOLDP, { at: [x, y + 0.006, z] });
    P(new THREE.CylinderGeometry(0.046, 0.046, 0.012, 10), GOLDP, { at: [x, y + 0.198, z] });
    for (const a of [90, 210, 330])
      P(new THREE.CylinderGeometry(0.004, 0.004, 0.18, 5), GOLDP, {
        at: [x + Math.cos(a * DEG) * 0.04, y + 0.105, z + Math.sin(a * DEG) * 0.04],
      });
    return y + 0.204;
  };
  const armillary = (x: number, y: number, z: number) => {
    b.lathe(
      [[0, 0], [0.07, 0], [0.072, 0.01], [0.05, 0.02], [0.02, 0.035], [0.012, 0.06], [0.012, 0.065], [0, 0.065]],
      { at: [x, y, z], segments: 10, color: GOLDP, bone: base },
    );
    const c = new THREE.Vector3(x, y + 0.065 + 0.105, z);
    const Qt = quatOf(0, 0, 23);
    const put = placeIn(c, Qt);
    const ring = (rad: number, le: V) => put(new THREE.TorusGeometry(rad, 0.0035, 4, 28), GOLDP, [0, 0, 0], le);
    ring(0.1, [90, 0, 0]);
    ring(0.096, [0, 0, 0]);
    ring(0.096, [0, 60, 0]);
    ring(0.096, [0, 120, 0]);
    ring(0.074, [90 + 24, 0, 0]);
    put(new THREE.CylinderGeometry(0.0035, 0.0035, 0.25, 5), GOLDP, [0, 0, 0]);
    put(new THREE.SphereGeometry(0.01, 6, 4), GOLDP, [0, 0.125, 0]);
    put(new THREE.SphereGeometry(0.01, 6, 4), GOLDP, [0, -0.125, 0]);
    glow(put(new THREE.SphereGeometry(0.026, 10, 8), "#ffffff", [0, 0, 0], [0, -90, 0], { texture: ORB_EMBER }), 1.1);
    glow(put(new THREE.SphereGeometry(0.011, 8, 6), "#9ff0ff", [0.074, 0, 0], [0, 0, 0]), 1.2);
  };

  // ---- Bay 1: crystal ball, tomes, a stack with a candle ---------------------------------------------------------
  {
    const fy = FY[0];
    let e = row(-0.585, -0.21, fy, 0.2, 0.285);
    leanBook(e + 0.045, fy, 0.27);
    e += 0.01;
    b.lathe(
      [[0, 0], [0.07, 0], [0.072, 0.012], [0.05, 0.026], [0.03, 0.04], [0.034, 0.06], [0.06, 0.078], [0.062, 0.086], [0.05, 0.084], [0.04, 0.07], [0, 0.07]],
      { at: [-0.04, fy, 0.03], segments: 10, color: GOLDP, bone: base },
    );
    orb(ORB_COSMOS, -0.04, fy + 0.146, 0.03, 0.085, 1.0);
    bitAt(GOLD, new THREE.TorusGeometry(0.058, 0.004, 4, 16), [-0.04, fy + 0.092, 0.03], [90, 0, 0]);
    const top = pile(0.27, fy, 0.03, [
      { h: 0.3, t: 0.04, d: 0.22 }, { h: 0.27, t: 0.05, d: 0.2 }, { h: 0.24, t: 0.04, d: 0.19 },
    ]);
    b.lathe([[0, 0], [0.05, 0], [0.052, 0.006], [0.04, 0.012], [0, 0.012]], {
      at: [0.27, top, 0.0], segments: 10, color: GOLDP, bone: base,
    });
    candle(0.27, top + 0.01, 0.0, 0.075, 0.03, 1, 4, 1.1);
    row(0.46, 0.585, fy, 0.2, 0.28);
  }

  // ---- Bay 2: books, scroll rack, hourglass, potions ---------------------------------------------------------------
  {
    const fy = FY[1];
    const e = row(-0.585, -0.33, fy, 0.2, 0.285);
    leanBook(e + 0.045, fy, 0.26, 11);
    // pigeonhole rack
    const rx = -0.1;
    const rz = 0.07;
    const W = 0.34;
    const H = 0.25;
    const D = 0.2;
    const ry = fy + 0.007;
    box(W, 0.014, D, WOOD_D, rx, ry, rz);
    box(W, 0.014, D, WOOD_D, rx, ry + H, rz);
    box(0.014, H, D, WOOD_DV, rx - W / 2 + 0.007, ry + H / 2, rz);
    box(0.014, H, D, WOOD_DV, rx + W / 2 - 0.007, ry + H / 2, rz);
    box(0.012, H, D, WOOD_DV, rx, ry + H / 2, rz);
    box(W, 0.012, D, WOOD_D, rx, ry + H / 2, rz);
    box(W + 0.03, 0.016, D + 0.02, WOOD, rx, ry + H + 0.015, rz);
    addBit(GOLD, new THREE.BoxGeometry(W + 0.03, 0.006, 0.003).translate(rx, ry + H + 0.015, rz + D / 2 + 0.0115));
    let ribbonIdx = 0;
    for (const [cx0, cy0] of [[-W / 4, ry + H / 4], [W / 4, ry + H / 4], [-W / 4, ry + (3 * H) / 4], [W / 4, ry + (3 * H) / 4]] as Array<[number, number]>) {
      const ribbon = RIBBONS[ribbonIdx++ % 3];
      const spots: Array<[number, number]> = [[-0.027, 0.0], [0.027, 0.0], [0, 0.047]];
      for (const [dx, dy] of spots) {
        const sx = rx + cx0 - rx + dx;
        const sy = cy0 - (H / 4) + 0.027 + dy + 0.006;
        const slen = D - 0.012;
        addBit(PARCH, new THREE.CylinderGeometry(0.026, 0.026, slen, 8).rotateX(Math.PI / 2).translate(rx + sx - rx + 0, sy, rz));
        addBit(ribbon, new THREE.TorusGeometry(0.0275, 0.004, 4, 10).translate(sx, sy, rz + 0.05));
        addDecal("scrollEnd", new THREE.CircleGeometry(0.0255, 10).translate(sx, sy, rz + slen / 2 + 0.001));
      }
    }
    hourglass(0.17, fy, 0.05);
    potion(0.29, fy, 0.07, "#ff6fae");
    potion(0.36, fy, 0.05, "#5fe0ff", 0.9);
    const top = pile(0.5, fy, 0.05, [
      { h: 0.17, t: 0.03, d: 0.16 }, { h: 0.15, t: 0.03, d: 0.15 }, { h: 0.16, t: 0.03, d: 0.15 },
    ]);
    b.lathe([[0, 0], [0.026, 0], [0.028, 0.006], [0.016, 0.014], [0, 0.014]], {
      at: [0.5, top, 0.04], segments: 8, color: GOLDP, bone: base,
    });
    orb(ORB_EMBER, 0.5, top + 0.014 + 0.03, 0.04, 0.032, 1.0);
  }

  // ---- Bay 3: open grimoire, floating orb, candlestick -------------------------------------------------------------
  {
    const fy = FY[2];
    // lectern with the open book
    const lx = -0.4;
    const lz = 0.04;
    box(0.24, 0.1, 0.04, WOOD_D, lx, fy + 0.05, lz - 0.09);
    box(0.24, 0.028, 0.04, WOOD_D, lx, fy + 0.014, lz + 0.09);
    const put = placeIn(new THREE.Vector3(lx, fy + 0.07, lz), quatOf(22, 0, 0));
    put(new THREE.BoxGeometry(0.3, 0.012, 0.22), WOOD, [0, -0.006, 0]);
    put(new THREE.BoxGeometry(0.3, 0.016, 0.012), GOLDP, [0, 0.004, 0.11]);
    put(new THREE.BoxGeometry(0.26, 0.008, 0.19), COVERS[1], [0, 0.004, 0]);
    put(new THREE.BoxGeometry(0.12, 0.012, 0.17), PAGE, [-0.063, 0.014, 0]);
    put(new THREE.BoxGeometry(0.12, 0.012, 0.17), PAGE, [0.063, 0.014, 0]);
    glow(put(new THREE.PlaneGeometry(0.1, 0.14), "#ffffff", [-0.063, 0.0225, 0], [-90, 0, 0], { texture: RUNE_TEXT }), 1.2);
    glow(put(new THREE.PlaneGeometry(0.1, 0.14), "#ffffff", [0.063, 0.0225, 0], [-90, 0, 0], { texture: RUNE_CIRCLE }), 1.2);
    put(new THREE.BoxGeometry(0.012, 0.002, 0.1), RED, [0.02, 0.024, 0.12]);
    for (const [mx, my, mz] of [[-0.06, 0.1, 0.0], [0.05, 0.14, -0.02], [0.0, 0.18, 0.02]] as V[])
      glow(P(new THREE.SphereGeometry(0.006, 6, 4), "#9ff0ff", { at: [lx + mx, fy + 0.07 + my, lz + mz] }), 1.3);
    // floating orb over a brass dish
    const ox = -0.02;
    const oz = 0.03;
    b.lathe([[0, 0], [0.06, 0], [0.065, 0.01], [0.05, 0.022], [0.02, 0.03], [0, 0.03]], {
      at: [ox, fy, oz], segments: 10, color: GOLDP, bone: base,
    });
    const cyO = fy + 0.125;
    for (const a of [20, 140, 260]) {
      const ca = Math.cos(a * DEG);
      const sa = Math.sin(a * DEG);
      b.sweep(
        [[ox + ca * 0.045, fy + 0.02, oz + sa * 0.045], [ox + ca * 0.08, fy + 0.105, oz + sa * 0.08], [ox + ca * 0.05, fy + 0.195, oz + sa * 0.05]],
        [0.005, 0.003],
        { color: GOLDP, sides: 5, bone: base },
      );
    }
    orb(ORB_VERDANT, ox, cyO, oz, 0.068, 1.0);
    const putO = placeIn(new THREE.Vector3(ox, cyO, oz), new THREE.Quaternion());
    glow(putO(new THREE.TorusGeometry(0.11, 0.003, 4, 28), GOLD, [0, 0, 0], [62, 0, 18]), 1.0);
    glow(putO(new THREE.TorusGeometry(0.095, 0.003, 4, 28), GOLD, [0, 0, 0], [-35, 0, -60]), 1.0);
    for (const [a, rad, le] of [[40, 0.11, [62, 0, 18]], [200, 0.11, [62, 0, 18]], [100, 0.095, [-35, 0, -60]], [290, 0.095, [-35, 0, -60]]] as Array<[number, number, V]>) {
      const v = new THREE.Vector3(Math.cos(a * DEG) * rad, Math.sin(a * DEG) * rad, 0).applyQuaternion(quatOf(le[0], le[1], le[2]));
      glow(P(new THREE.SphereGeometry(0.0075, 6, 4), "#9ff0ff", { at: [ox + v.x, cyO + v.y, oz + v.z] }), 1.4);
    }
    // scrolls lying in front of the dish
    scrollRoll(0.0, fy + 0.02, 0.15, 0.28, 0.02, "x", RED);
    scrollRoll(0.04, fy + 0.058, 0.148, 0.22, 0.017, "x", BLUE);
    // right: books, candlestick
    const e = row(0.12, 0.43, fy, 0.2, 0.285);
    leanBook(e + 0.045, fy, 0.25, 12);
    const topStick = candleStick(0.53, fy, 0.05, 0.12);
    candle(0.53, topStick - 0.004, 0.05, 0.1, 0.017, 2, 5);
    // a couple of leaning books on the far left
    leanBook(-0.565, fy, 0.24, 8);
  }

  // ---- Bay 4: crystals, books, armillary sphere, candle trio ----------------------------------------------------
  {
    const fy = FY[3];
    crystalCluster(-0.5, fy, 0.04);
    const e = row(-0.4, 0.0, fy, 0.2, 0.285);
    leanBook(e + 0.045, fy, 0.26, 12);
    armillary(0.2, fy, 0.02);
    scrollRoll(0.2, fy + 0.018, 0.15, 0.3, 0.018, "x", JADE);
    row(0.34, 0.42, fy, 0.2, 0.27);
    b.lathe([[0, 0], [0.075, 0], [0.078, 0.008], [0.06, 0.016], [0, 0.016]], {
      at: [0.5, fy, 0.05], segments: 10, color: GOLDP, bone: base,
    });
    candle(0.47, fy + 0.014, 0.05, 0.11, 0.015, 0, 3);
    candle(0.53, fy + 0.014, 0.06, 0.15, 0.017, 1, 4, 1.1);
    candle(0.5, fy + 0.014, 0.0, 0.08, 0.014, 2, 3, 0.9);
  }

  // ---- Top of the case: candelabra, tome stack with a glowing orb, inkwell and quill, candles -------------------
  {
    candelabra(-0.5, TS, 0.08);
    const top = pile(-0.12, TS, 0.08, [
      { h: 0.34, t: 0.055, d: 0.24 }, { h: 0.3, t: 0.05, d: 0.22 }, { h: 0.26, t: 0.045, d: 0.2 },
    ]);
    b.lathe([[0, 0], [0.034, 0], [0.036, 0.008], [0.022, 0.02], [0.012, 0.03], [0.026, 0.04], [0, 0.04]], {
      at: [-0.12, top, 0.08], segments: 8, color: GOLDP, bone: base,
    });
    orb(ORB_COSMOS, -0.12, top + 0.04 + 0.036, 0.08, 0.042, 1.1);
    scrollRoll(0.1, TS + 0.02, 0.15, 0.3, 0.02, "x", BLUE);
    // inkwell and quill
    b.lathe([[0, 0], [0.04, 0], [0.042, 0.02], [0.03, 0.04], [0.02, 0.05], [0.024, 0.054], [0, 0.054]], {
      at: [0.2, TS, 0.1], segments: 8, color: NAVYP, bone: base,
    });
    bitAt(GOLD, new THREE.TorusGeometry(0.03, 0.003, 4, 12), [0.2, TS + 0.036, 0.1], [90, 0, 0]);
    const qd = new THREE.Vector3(-0.35, 1, -0.15).normalize();
    const qb = new THREE.Vector3(0.2, TS + 0.05, 0.1);
    b.extrude(
      [[0, 0], [0.014, 0.04], [0.018, 0.1], [0.01, 0.18], [0, 0.24], [-0.012, 0.17], [-0.016, 0.09], [-0.01, 0.035]],
      { at: [qb.x, qb.y, qb.z], x: [1, 0, 0], y: [-0.35, 1, -0.15], thickness: 0.003, smoothing: 1, color: FEATHER, bone: base },
    );
    b.rod(qb, qb.clone().addScaledVector(qd, 0.24), 0.0025, "#d9c9a0", { bone: base, sides: 4 });
    // pillar candles on the right
    b.lathe([[0, 0], [0.08, 0], [0.083, 0.008], [0.064, 0.016], [0, 0.016]], {
      at: [0.5, TS, 0.1], segments: 10, color: GOLDP, bone: base,
    });
    candle(0.47, TS + 0.014, 0.1, 0.17, 0.02, 0, 4);
    candle(0.535, TS + 0.014, 0.115, 0.11, 0.018, 1, 3, 1.0);
    candle(0.5, TS + 0.014, 0.05, 0.14, 0.017, 2, 4);
  }

  // ---- Floor dressing -------------------------------------------------------------------------------------------
  {
    const topY = pile(1.02, 0, 0.1, [
      { h: 0.46, t: 0.075, d: 0.32 }, { h: 0.42, t: 0.06, d: 0.3 }, { h: 0.38, t: 0.07, d: 0.28 },
      { h: 0.34, t: 0.05, d: 0.26 }, { h: 0.3, t: 0.055, d: 0.24 },
    ]);
    // wax pool, big pillar candle with heavy drips
    P(new THREE.CylinderGeometry(0.075, 0.08, 0.01, 10), WAXES[0], { at: [1.0, topY + 0.005, 0.12] });
    candle(1.0, topY + 0.008, 0.12, 0.2, 0.04, 0, 6, 1.5);
    scrollRoll(1.02, 0.02, 0.38, 0.32, 0.02, "x", RED);

    // ceramic vase of scrolls
    const vx = -1.0;
    const vz = 0.1;
    const vasePaint = paint((_p, _n, s) => {
      const y = s[0];
      if (y > 0.34 || Math.abs(y - 0.14) < 0.012 || Math.abs(y - 0.2) < 0.006) return GOLDP;
      return VASE;
    });
    b.lathe(
      [[0, 0], [0.07, 0], [0.1, 0.05], [0.115, 0.15], [0.1, 0.28], [0.085, 0.33], [0.095, 0.345], [0.095, 0.365], [0, 0.365]],
      { at: [vx, 0, vz], segments: 12, color: vasePaint, bone: base },
    );
    for (let i = 0; i < 6; i++) {
      const a = i * 60 * DEG + 0.3;
      const tilt = (10 + (i % 3) * 3) * DEG;
      const dir = new THREE.Vector3(Math.sin(tilt) * Math.cos(a), Math.cos(tilt), Math.sin(tilt) * Math.sin(a));
      const bp = new THREE.Vector3(vx + Math.cos(a) * 0.035, 0.3, vz + Math.sin(a) * 0.035);
      const on = (k: number): V => [bp.x + dir.x * k, bp.y + dir.y * k, bp.z + dir.z * k];
      P(new THREE.CylinderGeometry(0.022, 0.022, 0.5, 8), PARCHP, { at: on(0.25), dir: [dir.x, dir.y, dir.z] });
      P(new THREE.CylinderGeometry(0.0235, 0.0235, 0.014, 8), PARCHDP, { at: on(0.493), dir: [dir.x, dir.y, dir.z] });
      P(new THREE.SphereGeometry(0.012, 6, 4), "#ffffff", { at: on(0.512), color: GOLD } as PartOptions);
      P(new THREE.TorusGeometry(0.0235, 0.004, 4, 10), RIBBONS[i % 3], { at: on(0.4), dir: [dir.x, dir.y, dir.z], axis: "z" });
    }
    // a few loose tomes beside the vase
    const t2 = pile(-0.78, 0, 0.3, [{ h: 0.26, t: 0.04, d: 0.19 }, { h: 0.22, t: 0.035, d: 0.17 }]);
    glow(P(new THREE.SphereGeometry(0.03, 8, 6), "#ffffff", { at: [-0.78, t2 + 0.03, 0.3], rotation: [0, -90, 0], texture: ORB_EMBER }), 1.0);
  }

  // ---- Flush merged bits and decals ----------------------------------------------------------------------------
  for (const [color, list] of bits) {
    if (list.length) P(merge(list), color, { at: [0, 0, 0] });
  }
  for (const { tex, geos } of decals.values()) {
    if (geos.length) P(merge(geos), "#ffffff", { at: [0, 0, 0], texture: tex });
  }

  return b.root;
}
