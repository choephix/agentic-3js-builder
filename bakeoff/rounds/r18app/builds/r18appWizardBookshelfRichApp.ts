// A wizard's bookshelf: indigo-lacquer case with twisted gold-banded columns, an ogee crown carrying a glowing
// moon sigil, five tiers of tomes, scrolls in a diamond rack, orbs, an armillary sphere, candles, potions, an open
// grimoire on a lectern, gold tassels, a hat and candelabra on the cornice and floor clutter on a woven rug.
// High-fantasy anime: cel-shaded paints (kits/toon), gold filigree decals and self-lit magic (kits/glow).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, rng } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { cells, grain, mix, mottle, noise, paint, rgb, smoothstep, spots } from "../../../../src/paint";
import type { Rgb } from "../../../../src/paint";
import type { Fill } from "../../../../src/context";
import type { ExtrudeOptions, LatheOptions, OutlineInput } from "../../../../src/outline";
import type { OutlinePoint } from "../../../../src/builder";
import type { PartOptions } from "../../../../src/parts";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A tall indigo-and-gold wizard's bookcase with twisted columns, an ogee crown with a glowing moon sigil, tiers of tomes, a diamond scroll rack, crystal orbs, an armillary sphere, candles, potions, an open glowing grimoire, tassels, a pointed hat and a woven rug with floor clutter.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const GOLDC = "#f4c95a";
const CREAMC = "#fff0c8";
const TEALC = "#7ff3e8";
const INKC = "#4a2a4f";
const AQUA = "#6ff0ff";
const VIOLET = "#b78cff";
const AMBER = "#ffb347";
const PINK = "#ff6fae";
const MINT = "#6bffb0";

const GOLD = cel("#f6cf62", "#b8782a");
const BRASS = cel("#dca843", "#8a5a2c");
const FRAME = cel(mottle("#3d4299", "#2f3480", { size: 0.12, contrast: 0.5, seed: 3 }));
const GABLE = cel(mottle("#2e3488", "#242a70", { size: 0.08, contrast: 0.6, seed: 5 }));
const WOOD = cel(grain("#bf7c4d", "#a2603a", { size: 0.02, axis: "x", seed: 3 }));
const PLUM = cel(grain("#5f3a5c", "#4b2d4a", { size: 0.02, axis: "x", seed: 8 }));
const PARCH = (c: string) => cel(mottle(c, mix(c, "#9c7a3c", 0.25), { size: 0.025, contrast: 0.8, seed: 2 }));
const WAXP = (c: string) => cel(c);
const COVERP = (c: string) => cel(mottle(c, mix(c, "#1a0f2e", 0.2), { size: 0.04, contrast: 0.7, seed: 4 }));

const TOPS = [0.14, 0.54, 0.94, 1.34, 1.74];
const BT = 0.04;

const shadeRgb = (c: Rgb, k: number): Rgb => [c[0] * k, c[1] * k, c[2] * k];
// Soft contact shadow just above each board and just under the next one.
const occl = (y: number) => {
  let k = 1;
  for (const t of TOPS) {
    const above = y - t;
    if (above > 0 && above < 0.16) k *= 0.55 + 0.45 * smoothstep(0, 0.16, above);
    const below = t - BT - y;
    if (below > 0 && below < 0.1) k *= 0.62 + 0.38 * smoothstep(0, 0.1, below);
  }
  return k;
};
const NAVY_A = rgb("#1b2052");
const NAVY_B = rgb("#2d3285");
const STAR_W = rgb("#fff3c4");
const STAR_B = rgb("#a9b8ff");
const INNER = rgb("#262b6b");
const BACK = paint((p) => {
  const base = mix(NAVY_A, NAVY_B, noise(p, 0.35, 5));
  const c = cells(p, 0.07, 11);
  let col: Rgb = base;
  if (c.id > 0.7 && c.d1 < 0.1) col = mix(base, STAR_W, 0.95);
  else if (c.id > 0.4 && c.d1 < 0.06) col = mix(base, STAR_B, 0.7);
  return shadeRgb(col, occl(p.y));
});
const SIDEP = paint((p, n) => {
  if (n.x * Math.sign(p.x) < -0.5) return shadeRgb(mix(INNER, NAVY_B, noise(p, 0.3, 6)), occl(p.y));
  return FRAME;
});
const COLUMN = cel(
  paint((_p, _n, s) => (((s[1] / 360 + s[0] * 5) % 1 + 1) % 1 < 0.2 ? "#f6cf62" : "#3d4299")),
);

// Woven rug: border bands, diamond frieze and a star medallion.
const RUG = paint((p) => {
  const dx = p.x;
  const dz = p.z - 0.55;
  const nx = Math.abs(dx) / 1.25;
  const nz = Math.abs(dz) / 0.63;
  const d = Math.max(nx, nz);
  const gold = rgb("#f2c14e");
  const navy = rgb("#26286b");
  const crimson = rgb("#8a2d55");
  const teal = rgb("#2aa59e");
  if (d > 0.965) return gold;
  if (d > 0.9) return navy;
  if (d > 0.76) {
    const u = Math.abs(((dx / 0.07) % 2 + 2) % 2 - 1) + Math.abs(((dz / 0.07) % 2 + 2) % 2 - 1);
    return u < 0.9 ? gold : mix(navy, teal, 0.35);
  }
  if (d > 0.72) return gold;
  const rr = Math.hypot(dx / 0.5, dz / 0.3);
  if (rr < 1.0) {
    if (rr > 0.9) return gold;
    const ang = Math.atan2(dz, dx);
    const star = 0.35 + 0.55 * Math.abs(Math.cos(4 * ang));
    return rr < star ? gold : teal;
  }
  const f = noise(p, 0.12, 4);
  const dot = Math.abs(((dx / 0.12) % 2 + 2) % 2 - 1) + Math.abs(((dz / 0.12) % 2 + 2) % 2 - 1);
  return dot < 0.35 ? mix(crimson, gold, 0.6) : mix(crimson, rgb("#6d2147"), f);
});

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const W = "#ffffff";
const spineSvg = (inner: string) => svg(`<svg viewBox="0 0 40 160">${inner}</svg>`, { size: 256 });
const SPINES = [
  spineSvg(
    `<rect x="3" y="8" width="34" height="7" fill="${W}"/><rect x="3" y="18" width="34" height="3" fill="${W}"/><rect x="3" y="139" width="34" height="3" fill="${W}"/><rect x="3" y="145" width="34" height="7" fill="${W}"/><path d="M20 46 L33 80 L20 114 L7 80 Z" fill="none" stroke="${W}" stroke-width="3.5"/><circle cx="20" cy="80" r="5" fill="${W}"/><circle cx="20" cy="34" r="2.6" fill="${W}"/><circle cx="20" cy="126" r="2.6" fill="${W}"/>`,
  ),
  spineSvg(
    `<rect x="3" y="9" width="34" height="4" fill="${W}"/><rect x="3" y="147" width="34" height="4" fill="${W}"/><rect x="5" y="34" width="30" height="92" rx="3" fill="none" stroke="${W}" stroke-width="3"/><rect x="11" y="48" width="18" height="4" fill="${W}"/><rect x="13" y="60" width="14" height="4" fill="${W}"/><rect x="11" y="72" width="18" height="4" fill="${W}"/><rect x="14" y="84" width="12" height="4" fill="${W}"/><circle cx="20" cy="108" r="5" fill="none" stroke="${W}" stroke-width="3"/>`,
  ),
  spineSvg(
    `<rect x="3" y="8" width="34" height="9" fill="${W}"/><rect x="3" y="143" width="34" height="9" fill="${W}"/><circle cx="20" cy="38" r="10" fill="none" stroke="${W}" stroke-width="3.5"/><path d="M20 62 a10 10 0 1 0 0 20 a7 7 0 1 1 0 -20 Z" fill="${W}"/><path d="M20 98 L32 120 L8 120 Z" fill="none" stroke="${W}" stroke-width="3.5"/>`,
  ),
  spineSvg(
    `<rect x="3" y="8" width="34" height="5" fill="${W}"/><rect x="3" y="147" width="34" height="5" fill="${W}"/><path d="M20 18 C36 36 4 56 20 76 S36 116 20 142" stroke="${W}" stroke-width="3.5" fill="none" stroke-linecap="round"/><ellipse cx="29" cy="40" rx="6" ry="3" fill="${W}" transform="rotate(-35 29 40)"/><ellipse cx="11" cy="62" rx="6" ry="3" fill="${W}" transform="rotate(35 11 62)"/><ellipse cx="29" cy="100" rx="6" ry="3" fill="${W}" transform="rotate(-35 29 100)"/><ellipse cx="11" cy="122" rx="6" ry="3" fill="${W}" transform="rotate(35 11 122)"/>`,
  ),
];
const COVERTEX = svg(
  `<svg viewBox="0 0 100 140"><rect x="8" y="8" width="84" height="124" rx="4" fill="none" stroke="${W}" stroke-width="4"/><rect x="16" y="16" width="68" height="108" fill="none" stroke="${W}" stroke-width="2.6"/><circle cx="50" cy="70" r="27" fill="none" stroke="${W}" stroke-width="4"/><circle cx="50" cy="70" r="19" fill="none" stroke="${W}" stroke-width="2.6"/><path d="M50 48 L55 63 L71 63 L58 73 L63 89 L50 79 L37 89 L42 73 L29 63 L45 63 Z" fill="${W}"/><circle cx="22" cy="22" r="3" fill="${W}"/><circle cx="78" cy="22" r="3" fill="${W}"/><circle cx="22" cy="118" r="3" fill="${W}"/><circle cx="78" cy="118" r="3" fill="${W}"/>`.concat(
    "</svg>",
  ),
  { size: 256 },
);
const G = GOLDC;
const SIGIL = svg(
  `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="94" fill="none" stroke="${G}" stroke-width="4.5"/><circle cx="100" cy="100" r="84" fill="none" stroke="${G}" stroke-width="2.6"/><circle cx="100" cy="100" r="54" fill="none" stroke="${G}" stroke-width="3"/>${Array.from(
    { length: 24 },
    (_, i) => {
      const a = (i * Math.PI * 2) / 24;
      const x1 = 100 + Math.cos(a) * 85;
      const y1 = 100 + Math.sin(a) * 85;
      const x2 = 100 + Math.cos(a) * (i % 2 ? 91 : 96);
      const y2 = 100 + Math.sin(a) * (i % 2 ? 91 : 96);
      return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${G}" stroke-width="2.6"/>`;
    },
  ).join("")}${Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI * 2) / 8 + Math.PI / 8;
    const x2 = 100 + Math.cos(a) * 54;
    const y2 = 100 + Math.sin(a) * 54;
    const x3 = 100 + Math.cos(a) * 80;
    const y3 = 100 + Math.sin(a) * 80;
    return `<path d="M${x2.toFixed(1)} ${y2.toFixed(1)} L${x3.toFixed(1)} ${y3.toFixed(1)}" stroke="${G}" stroke-width="3"/><circle cx="${x3.toFixed(1)}" cy="${y3.toFixed(1)}" r="4" fill="${G}"/>`;
  }).join("")}</svg>`,
  { size: 512 },
);
const FILIGREE = svg(
  `<svg viewBox="0 0 70 380"><rect x="3" y="3" width="64" height="374" fill="none" stroke="${G}" stroke-width="2.6"/><rect x="8" y="8" width="54" height="364" fill="none" stroke="${G}" stroke-width="1.6"/><path d="M35 16 C62 48 8 76 35 104 S62 160 35 190 S8 250 35 280 S62 330 35 364" stroke="${G}" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M35 104 C48 94 60 96 64 82 C58 100 48 104 35 104Z M35 190 C22 180 10 182 6 168 C12 186 22 190 35 190Z M35 280 C48 270 60 272 64 258 C58 276 48 280 35 280Z M35 60 C22 52 14 54 10 42 C16 58 24 60 35 60Z M35 330 C22 322 14 324 10 312 C16 328 24 330 35 330Z" fill="${G}"/><path d="M35 86 L46 104 L35 122 L24 104 Z M35 172 L46 190 L35 208 L24 190 Z M35 262 L46 280 L35 298 L24 280 Z" fill="${G}"/><circle cx="35" cy="104" r="4" fill="#3d4299"/><circle cx="35" cy="190" r="4" fill="#3d4299"/><circle cx="35" cy="280" r="4" fill="#3d4299"/><path d="M35 22 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z M35 350 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="${G}"/></svg>`,
  { size: 1024 },
);
const TASSEL = svg(
  `<svg viewBox="0 0 30 90"><g transform="translate(0 90) scale(1 -1)"><path d="M15 2 C25 2 25 14 15 14 C5 14 5 2 15 2" fill="none" stroke="#f4c95a" stroke-width="2.6"/><rect x="9" y="14" width="12" height="4" rx="1.5" fill="#c58a2c"/><rect x="10" y="18" width="10" height="12" rx="4" fill="#f4c95a"/><rect x="9" y="22" width="12" height="3" fill="#35c6c1"/><rect x="8.5" y="30" width="13" height="3.5" rx="1.5" fill="#c58a2c"/><path d="M8 34 L22 34 L27 86 L3 86 Z" fill="#f4c95a"/><path d="M12 36 L11 86 M15 36 L15 86 M18 36 L19 86" stroke="#d99a34" stroke-width="1.6" fill="none"/><rect x="3" y="80" width="24" height="3" fill="#35c6c1"/></g></svg>`,
  { size: 256 },
);
const ROLLEND = svg(
  `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#f0dfb2"/><circle cx="20" cy="20" r="14" fill="none" stroke="#b98d4a" stroke-width="2.8"/><circle cx="20" cy="20" r="8" fill="none" stroke="#b98d4a" stroke-width="2.8"/><circle cx="20" cy="20" r="3" fill="#b98d4a"/></svg>`,
  { size: 128 },
);
const PAGES = svg(
  `<svg viewBox="0 0 60 80"><rect width="60" height="80" fill="#f6ecd0"/><rect x="4" y="4" width="52" height="72" fill="none" stroke="#c9a766" stroke-width="1.6"/><rect x="8" y="9" width="12" height="12" fill="#c0392b"/><path d="M10 18 L14 11 L18 18" stroke="#f4c95a" stroke-width="1.6" fill="none"/>${Array.from({ length: 11 }, (_, i) => `<rect x="${i < 3 ? 23 : 8}" y="${i < 3 ? 10 + i * 4.5 : 26 + (i - 3) * 6}" width="${i < 3 ? 29 : 44 - (i % 3) * 6}" height="2" fill="#8a6a3c"/>`).join("")}</svg>`,
  { size: 256 },
);
const RUNES = svg(
  `<svg viewBox="0 0 60 80"><g stroke="#6ff0ff" stroke-width="3" fill="none" stroke-linecap="round"><path d="M12 14 L12 30 M12 22 L22 14 M12 22 L22 30"/><path d="M34 14 L34 30 M34 14 L46 22 L34 30"/><path d="M12 42 L22 42 M17 42 L17 58 M12 50 L22 56"/><circle cx="38" cy="50" r="6"/><path d="M12 68 L24 68 M18 64 L18 74"/><path d="M34 64 L46 74 M46 64 L34 74"/></g></svg>`,
  { size: 256 },
);
const orbTex = (a: string, b: string, c: string) =>
  svg(
    `<svg viewBox="0 0 200 100"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b}"/><stop offset="0.55" stop-color="${a}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs><rect width="200" height="100" fill="url(#g)"/><path d="M62 70 C70 30 110 20 130 44 C146 64 120 82 100 70 C86 62 94 48 108 50" stroke="#ffffff" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M58 40 C66 22 90 14 110 22" stroke="${c}" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="78" cy="30" r="2.6" fill="#fff"/><circle cx="124" cy="68" r="2.2" fill="#fff"/><circle cx="112" cy="26" r="1.8" fill="#fff"/><circle cx="90" cy="60" r="1.6" fill="#fff"/><path d="M140 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff"/></svg>`,
    { size: 512 },
  );
const ORB_AQUA = orbTex("#38c9ee", "#1b7fd0", "#b8fbff");
const ORB_VIOLET = orbTex("#9a62f0", "#4b2bb0", "#f1c6ff");
const ORB_SUN = orbTex("#ffb13b", "#e0541f", "#fff2a0");

// ---------------------------------------------------------------------------------------------------------------
// Outline helpers
const starOutline = (R: number, n = 5, k = 0.45): OutlinePoint[] =>
  Array.from({ length: n * 2 }, (_, i): OutlinePoint => {
    const a = Math.PI / 2 + (i * Math.PI) / n;
    const rad = i % 2 ? R * k : R;
    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad;
    return i % 2 ? [x, y] : [x, y, "sharp"];
  });

// Crescent whose horns point to +x.
const crescentOutline = (R: number, off = 0.4, ri = 0.82): OutlinePoint[] => {
  const r = R * ri;
  const o = R * off;
  const th = Math.acos((R * R + o * o - r * r) / (2 * R * o));
  const pts: OutlinePoint[] = [];
  const n = 10;
  for (let i = 0; i <= n; i++) {
    const a = th + ((2 * Math.PI - 2 * th) * i) / n;
    pts.push(i === 0 || i === n ? [R * Math.cos(a), R * Math.sin(a), "sharp"] : [R * Math.cos(a), R * Math.sin(a)]);
  }
  const ex = R * Math.cos(2 * Math.PI - th);
  const ey = R * Math.sin(2 * Math.PI - th);
  const psi1 = Math.atan2(ey, ex - o);
  const ex2 = R * Math.cos(th);
  const ey2 = R * Math.sin(th);
  const psi2 = Math.atan2(ey2, ex2 - o) - 2 * Math.PI;
  for (let i = 1; i < n; i++) {
    const a = psi1 + ((psi2 - psi1) * i) / n;
    pts.push([o + r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
};

type V3a = readonly [number, number, number];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const IDQ = new THREE.Quaternion();
const ONE = new THREE.Vector3(1, 1, 1);
const xf = <T extends THREE.BufferGeometry>(g: T, at: V3a, q: THREE.Quaternion = IDQ): T => {
  g.applyMatrix4(new THREE.Matrix4().compose(V(at[0], at[1], at[2]), q, ONE));
  return g;
};

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf", paintSize: 1024 });
  const R = rng(7);
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });

  const part = (geo: THREE.BufferGeometry, color: Fill, o: PartOptions = {}) => b.part(geo, color, { bone: root, ...o });
  const lathe = (outline: OutlineInput, o: LatheOptions) => b.lathe(outline, { bone: root, ...o });
  const extrude = (outline: OutlineInput, o: ExtrudeOptions) => b.extrude(outline, { bone: root, ...o });

  // Merge buckets: many small static pieces of one colour are one part.
  const buckets = new Map<string, { fill: Fill; geos: THREE.BufferGeometry[]; glowK: number }>();
  const gather = (key: string, fill: Fill, g: THREE.BufferGeometry, glowK = 0) => {
    let k = buckets.get(key);
    if (!k) {
      k = { fill, geos: [], glowK };
      buckets.set(key, k);
    }
    k.geos.push(g);
  };
  const texBuckets = new Map<string, { tex: THREE.Texture; tint: string; geos: THREE.BufferGeometry[]; glowK: number }>();
  const gatherTex = (key: string, tex: THREE.Texture, tint: string, g: THREE.BufferGeometry, glowK = 0) => {
    let k = texBuckets.get(key);
    if (!k) {
      k = { tex, tint, geos: [], glowK };
      texBuckets.set(key, k);
    }
    k.geos.push(g);
  };

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // =============================================================================================================
  // Rug
  {
    const rr = 0.08;
    const hx = 1.25;
    const hz = 0.63;
    const out: [number, number][] = [];
    const corner = (cx: number, cy: number, a0: number) => {
      for (let i = 0; i <= 4; i++) {
        const a = a0 + (i * Math.PI) / 8;
        out.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
      }
    };
    corner(hx - rr, hz - rr, 0);
    corner(-hx + rr, hz - rr, Math.PI / 2);
    corner(-hx + rr, -hz + rr, Math.PI);
    corner(hx - rr, -hz + rr, (3 * Math.PI) / 2);
    extrude(out, { at: [0, 0.01, 0.55], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.02, bevel: 0.005, color: RUG, name: "rug" });
    // rug fringe, both short ends
    const fr = [];
    for (let i = 0; i < 24; i++) for (const s of [1, -1]) fr.push(frame([s * (hx + 0.002), 0.012, 0.55 - hz + 0.03 + (i * (2 * hz - 0.06)) / 23], [0, 1, 0]));
    b.cards(fr, TASSEL, { size: [0.03, 0.06], lean: 90, flow: [1, 0, 0], bone: root, color: "#e9c46a" });
  }

  // =============================================================================================================
  // Case structure
  // plinth
  part(box(1.74, 0.06, 0.54), PLUM, { at: [0, 0.03, 0.0], name: "plinth1" });
  part(box(1.66, 0.05, 0.5), PLUM, { at: [0, 0.085, 0.0], name: "plinth2" });
  part(box(1.68, 0.014, 0.52), GOLD, { at: [0, 0.062, 0.0], name: "plinthTrim" });
  part(box(1.6, 0.012, 0.48), GOLD, { at: [0, 0.114, 0.0], name: "plinthTrim2" });
  // back and sides
  part(box(1.3, 2.0, 0.03), BACK, { at: [0, 1.1, -0.19], name: "back" });
  for (const s of [1, -1]) part(box(0.12, 2.0, 0.42), SIDEP, { at: [s * 0.68, 1.1, 0.0], name: "side" });
  // boards
  TOPS.forEach((top, k) => {
    part(box(1.3, BT, 0.43), WOOD, { at: [0, top - BT / 2, 0.02], name: `board${k}` });
    part(box(1.3, 0.028, 0.012), GOLD, { at: [0, top - 0.02, 0.2285], name: `boardTrim${k}` });
    part(box(1.3, 0.008, 0.012), GOLD, { at: [0, top + 0.001, 0.222], name: `boardBead${k}` });
    for (let i = 0; i < 13; i++) {
      gather("studs", GOLD, new THREE.SphereGeometry(0.0085, 6, 4).translate(-0.6 + i * 0.1, top - 0.02, 0.236));
    }
  });
  // cornice
  part(box(1.72, 0.04, 0.52), PLUM, { at: [0, 2.12, 0.0], name: "cornice1" });
  part(box(1.64, 0.04, 0.46), PLUM, { at: [0, 2.16, 0.0], name: "cornice2" });
  part(box(1.7, 0.014, 0.53), GOLD, { at: [0, 2.099, 0.0], name: "corniceTrim" });
  part(box(1.62, 0.012, 0.47), GOLD, { at: [0, 2.181, 0.0], name: "corniceTrim2" });
  for (let i = 0; i < 17; i++) {
    gather("studs", GOLD, new THREE.SphereGeometry(0.01, 6, 4).translate(-0.8 + i * 0.1, 2.12, 0.261));
  }

  // twisted columns, bases, capitals, finials
  for (const s of [1, -1]) {
    const x = s * 0.745;
    const z = 0.215;
    lathe(
      [
        [0, 0],
        [0.078, 0],
        [0.078, 0.03],
        [0.062, 0.05],
        [0.062, 0.075],
        [0.05, 0.09],
        [0, 0.09],
      ],
      { at: [x, 0.11, z], segments: 10, color: GOLD, name: "colBase" },
    );
    b.sweep(polyline([[x, 0.2, z], [x, 2.04, z]]), (_t) => [0.054, 0.038], COLUMN, {
      sides: 10,
      twist: 720,
      caps: "flat",
      name: "colShaft",
      bone: root,
    });
    lathe(
      [
        [0, 0],
        [0.05, 0],
        [0.056, 0.012],
        [0.07, 0.03],
        [0.08, 0.06],
        [0.09, 0.09],
        [0.07, 0.105],
        [0, 0.105],
      ],
      { at: [x, 2.04, z], segments: 10, color: GOLD, name: "colCapital" },
    );
    // gold collar rings on the shaft
    for (const y of [0.45, 1.1, 1.75]) {
      lathe(
        [
          [0.05, 0],
          [0.066, 0.006],
          [0.066, 0.026],
          [0.05, 0.032],
        ],
        { at: [x, y, z], segments: 10, color: GOLD, name: "colRing" },
      );
    }
    // finial spire with glow bead
    lathe(
      [
        [0, 0],
        [0.05, 0],
        [0.055, 0.02],
        [0.038, 0.04],
        [0.04, 0.06],
        [0.052, 0.085],
        [0.046, 0.115],
        [0.026, 0.14],
        [0.012, 0.19],
        [0, 0.215],
      ],
      { at: [x, 2.14, z], segments: 8, color: GOLD, name: "finial" },
    );
    glow(part(new THREE.SphereGeometry(0.026, 8, 6), AQUA, { at: [x, 2.375, z], name: "finialGem" }), 1.2);
    // tassel hanging in front of the column
    b.cards([frame([x, 2.05, z + 0.082], [0, 1, 0])], TASSEL, {
      size: [0.07, 0.3],
      lean: 180,
      flow: [0, 0, 1],
      bone: root,
    });
  }

  // gable
  const GW = 0.46;
  const GH = 0.36;
  const GZ = 0.1;
  const GT = 0.14;
  const GY = 2.18;
  const GF = GZ + GT / 2;
  const ogee = (t: number) => GH * (t - 0.12 * Math.sin(2 * Math.PI * t));
  const half: [number, number][] = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    return [GW * (1 - t), ogee(t)];
  });
  {
    const gout: OutlinePoint[] = [];
    half
      .slice(0, -1)
      .forEach(([x, y], i) => gout.push(i === 0 ? [-x, y, "sharp"] : [-x, y]));
    gout.push([0, GH, "sharp"]);
    for (const [x, y] of half.slice(0, -1).reverse()) gout.push([x, y]);
    gout[gout.length - 1] = [GW, 0, "sharp"];
    extrude(gout, { at: [0, GY, GZ], x: [1, 0, 0], thickness: GT, bevel: 0.01, color: GABLE, name: "gable" });
    const path = [...half.map(([x, y]) => [-x, GY + y - 0.016, GF + 0.006]), ...half.slice(0, -1).reverse().map(([x, y]) => [x, GY + y - 0.016, GF + 0.006])];
    // half[] runs base→peak on +x; mirrored it runs base(-x)→peak. Then the +x side descends peak→base.
    b.sweep(catmull(path), 0.011, GOLD, { sides: 6, caps: "round", name: "gableTrim", bone: root });
    // crockets
    half.slice(1, -1).forEach(([x, y], idx) => {
      const i = idx + 1;
      const [xa, ya] = half[i - 1];
      const [xb, yb] = half[i + 1];
      const tx = xb - xa;
      const ty = yb - ya;
      const nrm = V(ty, -tx, 0).normalize();
      for (const s of [1, -1]) {
        const dir = V(nrm.x * s, nrm.y, 0.0);
        const cone = new THREE.ConeGeometry(0.014, 0.05, 4).translate(0, 0.025, 0);
        gather("crockets", GOLD, xf(cone, [s * x, GY + y - 0.002, GF + 0.004], aim(dir)));
      }
    });
    // gable peak finial and glowing bead
    lathe(
      [
        [0, 0],
        [0.034, 0],
        [0.03, 0.02],
        [0.016, 0.04],
        [0.02, 0.065],
        [0.028, 0.085],
        [0.012, 0.11],
        [0, 0.14],
      ],
      { at: [0, GY + GH - 0.012, GZ], segments: 8, color: GOLD, name: "gableFinial" },
    );
    glow(part(new THREE.SphereGeometry(0.024, 8, 6), VIOLET, { at: [0, GY + GH + 0.14, GZ], name: "gableGem" }), 1.2);
    // sigil ring on the gable face
    gatherTex("sigil", SIGIL, "#ffffff", xf(new THREE.PlaneGeometry(0.23, 0.23), [0, GY + 0.165, GF + 0.003]));
    // glowing crescent + star inside the sigil
    glow(
      extrude(crescentOutline(0.062), {
        at: [-0.02, GY + 0.165, GF + 0.004],
        x: [1, 0, 0],
        thickness: 0.012,
        color: "#fff1b0",
        name: "sigilMoon",
      }),
      1.3,
    );
    glow(
      extrude(starOutline(0.026), {
        at: [0.022, GY + 0.165, GF + 0.004],
        x: [1, 0, 0],
        thickness: 0.01,
        color: AQUA,
        name: "sigilStar",
      }),
      1.3,
    );
    // little stars scattered on the gable
    const gs: [number, number, number][] = [
      [-0.34, 0.07, 0.022],
      [0.34, 0.07, 0.022],
      [-0.27, 0.12, 0.016],
      [0.27, 0.12, 0.016],
      [-0.2, 0.05, 0.014],
      [0.2, 0.05, 0.014],
    ];
    gs.forEach(([x, y, r], i) => {
      glow(
        extrude(starOutline(r), { at: [x, GY + y, GF + 0.004], x: [1, 0, 0], thickness: 0.008, color: i % 2 ? AQUA : "#fff1b0", name: `gStar${i}` }),
        1.2,
      );
    });
  }

  // valance under the cornice with gold fringe
  {
    const vw = 0.69;
    const n = 8;
    const w = (2 * vw) / n;
    const out: OutlinePoint[] = [[-vw, 0, "sharp"]];
    for (let i = 0; i < n; i++) {
      const x0 = -vw + i * w;
      out.push([x0, -0.07, "sharp"]);
      out.push([x0 + w * 0.25, -0.1]);
      out.push([x0 + w * 0.5, -0.112]);
      out.push([x0 + w * 0.75, -0.1]);
    }
    out.push([vw, -0.07, "sharp"], [vw, 0, "sharp"]);
    const VALP = cel(
      paint((_p, _n, s) => {
        if (s[1] > -0.016) return "#f6cf62";
        const cx = ((s[0] + vw) / w) % 1;
        if (Math.abs(cx - 0.5) < 0.07 && s[1] < -0.045 && s[1] > -0.075) return "#f6cf62";
        return mix("#7a3fc0", "#5a2fa0", smoothstep(0, -0.1, s[1]));
      }),
    );
    extrude(out, { at: [0, 2.098, 0.246], x: [1, 0, 0], thickness: 0.01, color: VALP, name: "valance" });
    const fr = [];
    for (let i = 0; i < n; i++) fr.push(frame([-vw + (i + 0.5) * w, 2.098 - 0.108, 0.249], [0, 1, 0]));
    b.cards(fr, TASSEL, { size: [0.035, 0.07], lean: 180, flow: [0, 0, 1], bone: root });
  }

  // side panel filigree
  for (const s of [1, -1]) {
    gatherTex("filigree", FILIGREE, "#ffffff", xf(new THREE.PlaneGeometry(0.34, 1.82), [s * 0.7415, 1.1, 0.0], aim([s, 0, 0], [0, 1, 0], "z")));
  }

  // =============================================================================================================
  // Books
  const COVERS = ["#c2385a", "#2fa7a0", "#33986a", "#8a49b8", "#3f6fd6", "#e0832f", "#e8798f", "#34305f", "#d7c27f", "#a63a3a", "#4fc3e8"];
  const tintFor = (c: string) => (["#e8798f", "#d7c27f", "#4fc3e8"].includes(c) ? INKC : ["#34305f", "#3f6fd6"].includes(c) ? TEALC : R() < 0.25 ? CREAMC : GOLDC);
  const bookBucket = (c: string) => `book:${c}`;
  const addBook = (s: {
    T: number;
    H: number;
    D: number;
    cx: number;
    cy: number;
    cz: number;
    yaw?: number;
    rz?: number;
    color: string;
    orn: number;
    top?: boolean;
    hero?: boolean;
  }) => {
    const { T, H, D } = s;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, s.yaw ?? 0, s.rz ?? 0, "YXZ"));
    const M = new THREE.Matrix4().compose(V(s.cx, s.cy, s.cz), q, ONE);
    const put = (g: THREE.BufferGeometry, x: number, y: number, z: number) => g.translate(x, y, z).applyMatrix4(M);
    const key = bookBucket(s.color);
    const fill = COVERP(s.color);
    gather(key, fill, put(box(T, H, 0.012), 0, 0, D / 2 - 0.006));
    gather(key, fill, put(box(0.008, H, D), -T / 2 + 0.004, 0, 0));
    gather(key, fill, put(box(0.008, H, D), T / 2 - 0.004, 0, 0));
    gather("pages", cel("#f3e7c9", "#d9c391"), put(box(T - 0.016, H - 0.014, D - 0.018), 0, 0, -0.003));
    const tint = tintFor(s.color);
    gatherTex(`spine${s.orn}:${tint}`, SPINES[s.orn], tint, put(new THREE.PlaneGeometry(T * 0.92, H * 0.94), 0, 0, D / 2 + 0.0015));
    if (s.top) {
      gatherTex(`cover:${tint}`, COVERTEX, tint, put(new THREE.PlaneGeometry(D * 0.8, H * 0.82).rotateY(-Math.PI / 2), -T / 2 - 0.0015, 0, 0));
      for (const sy of [1, -1])
        for (const sz of [1, -1])
          gather("corners", GOLD, put(box(0.012, 0.05, 0.05), -T / 2 - 0.001, sy * (H / 2 - 0.022), sz * (D / 2 - 0.022)));
    }
    if (s.hero) {
      gather("gemSetting", GOLD, put(new THREE.TorusGeometry(0.03, 0.007, 4, 10).rotateY(Math.PI / 2), -T / 2 - 0.004, 0, 0));
      gather("gem:aqua", AQUA, put(new THREE.SphereGeometry(0.022, 8, 6), -T / 2 - 0.006, 0, 0), 1.2);
    }
    return M;
  };
  const standing = (xL: number, w: number, y0: number, h: number, d: number, zf: number, color: string, orn: number, lean = 0) => {
    let cx = xL + w / 2;
    let cy = y0 + h / 2;
    if (lean) {
      const px = lean > 0 ? xL + w : xL;
      const rx = cx - px;
      const ry = cy - y0;
      const th = -lean;
      cx = px + rx * Math.cos(th) - ry * Math.sin(th);
      cy = y0 + rx * Math.sin(th) + ry * Math.cos(th);
    }
    addBook({ T: w, H: h, D: d, cx, cy, cz: zf - d / 2, rz: -lean, color, orn });
  };
  const lying = (cx: number, yb: number, cz: number, len: number, T: number, D: number, yaw: number, color: string, orn: number, hero = false) =>
    addBook({ T, H: len, D, cx, cy: yb + T / 2, cz, yaw, rz: -Math.PI / 2, color, orn, top: true, hero });
  const row = (x0: number, x1: number, y0: number, hMin: number, hMax: number, leanEnd = 0) => {
    let x = x0;
    const limit = x1 - (leanEnd ? 0.09 : 0);
    let last = x0;
    while (true) {
      const w = 0.035 + R() * 0.05;
      if (x + w > limit) break;
      const h = hMin + R() * (hMax - hMin);
      const d = 0.19 + R() * 0.07;
      const color = COVERS[Math.floor(R() * COVERS.length)];
      standing(x, w, y0, h, d, 0.145 + R() * 0.03, color, Math.floor(R() * 4));
      last = x + w;
      x += w + 0.002 + (R() < 0.08 ? 0.015 : 0);
    }
    if (leanEnd) {
      const w = 0.05;
      const h = (hMin + hMax) / 2 + 0.01;
      standing(last + 0.004, w, y0, h, 0.23, 0.16, COVERS[Math.floor(R() * COVERS.length)], Math.floor(R() * 4), leanEnd);
      last += 0.06;
    }
    return last;
  };

  // =============================================================================================================
  // Candles
  const flameOut: THREE.BufferGeometry[] = [];
  const flameIn: THREE.BufferGeometry[] = [];
  const flameProfile = (s: number, pts: [number, number][]) => pts.map(([x, y]) => new THREE.Vector2(x * s, y * s));
  const candle = (x: number, y: number, z: number, h: number, r: number, wax = "#fff1d0", holder = false, drips = 3, fs = 1) => {
    let by = y;
    if (holder) {
      lathe(
        [
          [0, 0],
          [r * 2.4, 0],
          [r * 2.7, 0.008],
          [r * 2.6, 0.016],
          [r * 1.5, 0.014],
          [r * 1.2, 0.028],
          [0, 0.028],
        ],
        { at: [x, y, z], segments: 10, color: BRASS, name: "holder" },
      );
      by += 0.026;
    }
    gather(`wax:${wax}`, WAXP(wax), xf(new THREE.CylinderGeometry(r * 0.93, r, h, 8), [x, by + h / 2, z]));
    gather("waxTop", WAXP("#fffbe9"), xf(new THREE.CylinderGeometry(r * 0.8, r * 0.8, 0.004, 8), [x, by + h + 0.001, z]));
    gather(`wax:${wax}`, WAXP(wax), xf(new THREE.CylinderGeometry(r * 1.6, r * 1.7, 0.006, 8), [x, by + 0.003, z]));
    for (let i = 0; i < drips; i++) {
      const a = R() * Math.PI * 2;
      const len = h * (0.15 + R() * 0.3);
      const px = x + Math.cos(a) * r * 0.97;
      const pz = z + Math.sin(a) * r * 0.97;
      gather(`wax:${wax}`, WAXP(wax), xf(new THREE.CylinderGeometry(r * 0.2, r * 0.24, len, 5), [px, by + h - len / 2, pz]));
      gather(`wax:${wax}`, WAXP(wax), xf(new THREE.SphereGeometry(r * 0.28, 5, 4), [px, by + h - len, pz]));
    }
    gather("wick", "#3a2a2a", xf(new THREE.CylinderGeometry(0.0016, 0.0016, 0.014, 4), [x, by + h + 0.007, z]));
    const lean = (R() - 0.5) * 0.25;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, lean));
    flameOut.push(
      xf(
        new THREE.LatheGeometry(
          flameProfile(fs, [
            [0, 0],
            [0.011, 0.006],
            [0.0135, 0.017],
            [0.0095, 0.032],
            [0.004, 0.048],
            [0, 0.06],
          ]),
          6,
        ),
        [x, by + h + 0.008, z],
        q,
      ),
    );
    flameIn.push(
      xf(
        new THREE.LatheGeometry(
          flameProfile(fs, [
            [0, 0.003],
            [0.0065, 0.008],
            [0.007, 0.016],
            [0.003, 0.03],
            [0, 0.036],
          ]),
          5,
        ),
        [x, by + h + 0.009, z],
        q,
      ),
    );
    return by + h + 0.06 * fs;
  };

  // =============================================================================================================
  // Scrolls
  const scroll = (a: V3a, dir: V3a, len: number, r: number, paper: string, ribbon: string | null, knobs: boolean) => {
    const d = V(dir[0], dir[1], dir[2]).normalize();
    const q = aim(d);
    const mid = V(a[0], a[1], a[2]).addScaledVector(d, len / 2);
    gather(`paper:${paper}`, PARCH(paper), xf(new THREE.CylinderGeometry(r, r, len, 8, 1, false), [mid.x, mid.y, mid.z], q));
    const end = V(a[0], a[1], a[2]).addScaledVector(d, len + 0.001);
    if (!knobs) gatherTex("rollEnd", ROLLEND, "#ffffff", xf(new THREE.CircleGeometry(r * 0.97, 10), [end.x, end.y, end.z], aim(d, undefined, "z")));
    if (knobs) {
      for (const sgn of [0, 1]) {
        const p = V(a[0], a[1], a[2]).addScaledVector(d, sgn ? len + 0.02 : -0.02);
        gather("knobs", GOLD, xf(new THREE.SphereGeometry(r * 0.8, 6, 4), [p.x, p.y, p.z]));
        const m = V(a[0], a[1], a[2]).addScaledVector(d, sgn ? len + 0.01 : -0.01);
        gather("knobs", GOLD, xf(new THREE.CylinderGeometry(r * 0.35, r * 0.35, 0.03, 6), [m.x, m.y, m.z], q));
      }
    }
    if (ribbon) {
      const rp = V(a[0], a[1], a[2]).addScaledVector(d, len * 0.62);
      gather(`ribbon:${ribbon}`, cel(ribbon), xf(new THREE.CylinderGeometry(r * 1.16, r * 1.16, 0.016, 8, 1, true), [rp.x, rp.y, rp.z], q));
      gather("seal", cel("#d33a4a"), xf(new THREE.SphereGeometry(0.011, 6, 4).scale(1, 0.5, 1), [rp.x, rp.y + r * 1.15, rp.z]));
    }
  };
  const PAPERS = ["#f1e2bd", "#e9d3a0", "#f6ecd2"];
  const RIBBONS = ["#c2385a", "#2fa7a0", "#8a49b8", "#3f6fd6"];

  // =============================================================================================================
  // Orbs
  const orb = (x: number, y0: number, z: number, r: number, tex: THREE.Texture) => {
    lathe(
      [
        [0, 0],
        [0.075, 0],
        [0.082, 0.012],
        [0.062, 0.025],
        [0.04, 0.04],
        [0.03, 0.06],
        [0.046, 0.08],
        [0.055, 0.088],
        [0, 0.088],
      ],
      { at: [x, y0, z], segments: 10, color: GOLD, name: "orbStand" },
    );
    const cy = y0 + 0.085 + r * 0.72;
    glow(part(new THREE.SphereGeometry(r, 14, 10), "#ffffff", { at: [x, cy, z], rotation: [0, -90, 0], texture: tex, name: "orb" }), 1);
    for (let k = 0; k < 3; k++) {
      const phi = (k * Math.PI * 2) / 3 + 0.5;
      b.sweep(
        catmull([
          [x + 0.046 * Math.cos(phi), y0 + 0.075, z + 0.046 * Math.sin(phi)],
          [x + r * 1.08 * Math.cos(phi), cy - r * 0.55, z + r * 1.08 * Math.sin(phi)],
          [x + r * 1.04 * Math.cos(phi), cy - r * 0.05, z + r * 1.04 * Math.sin(phi)],
          [x + r * 0.7 * Math.cos(phi), cy + r * 0.62, z + r * 0.7 * Math.sin(phi)],
        ]),
        [0.009, 0.0035],
        GOLD,
        { sides: 5, caps: { start: "round", end: "point" }, bone: root, name: "orbClaw" },
      );
    }
    const d = V(-0.35, 0.55, 0.75).normalize();
    glow(
      part(new THREE.SphereGeometry(1, 6, 4).scale(r * 0.2, r * 0.07, r * 0.12), "#ffffff", {
        at: [x + d.x * r * 0.97, cy + d.y * r * 0.97, z + d.z * r * 0.97],
        dir: [d.x, d.y, d.z],
        name: "orbGlint",
      }),
      1.3,
    );
    glow(
      extrude(starOutline(r * 0.16, 4, 0.3), { at: [x + r * 0.35, cy + r * 0.45, z + r * 0.9], x: [1, 0, 0], thickness: 0.004, color: "#ffffff", name: "orbSpark" }),
      1.3,
    );
  };

  // =============================================================================================================
  // T0 — bottom tier: a stack of great tomes, standing folios, a violet crystal ball
  {
    const y0 = TOPS[0];
    const stack: [number, number, number, string, number][] = [
      [0.37, 0.078, 0.27, "#34305f", 0],
      [0.33, 0.062, 0.25, "#a63a3a", 2],
      [0.35, 0.07, 0.26, "#2fa7a0", 3],
    ];
    let y = y0;
    stack.forEach(([len, T, D, color, orn], i) => {
      lying(-0.4 + (R() - 0.5) * 0.02, y, 0.0, len, T, D, (R() - 0.5) * 0.14, color, orn, i === 2);
      y += T;
    });
    candle(-0.4, y, 0.0, 0.055, 0.02, "#d9c8ff", true, 3);
    row(-0.12, 0.2, y0, 0.27, 0.34);
    orb(0.4, y0, 0.03, 0.095, ORB_VIOLET);
  }

  // T1 — folios with a moon bookend, hourglass, potions
  {
    const y0 = TOPS[1];
    const end = row(-0.62, -0.14, y0, 0.26, 0.33, 0.22);
    // moon bookend (right of the leaning book)
    extrude(crescentOutline(0.1), {
      at: [end + 0.03, y0 + 0.108, 0.07],
      x: [0, 0, 1],
      thickness: 0.014,
      bevel: 0.003,
      color: GOLD,
      name: "bookendMoon",
    });
    part(box(0.07, 0.01, 0.2), GOLD, { at: [end + 0.03, y0 + 0.005, 0.06], name: "bookendBase" });
    // hourglass
    {
      const hx = 0.06;
      const hz = 0.04;
      const s = 0.62;
      const SAND = "#ffd37a";
      const GLASS = "#c8f1ff";
      const hgPaint = cel(paint((p) => ((p.y - y0 - 0.014) / s < 0.05 ? SAND : (p.y - y0 - 0.014) / s > 0.125 && (p.y - y0 - 0.014) / s < 0.15 ? SAND : GLASS)));
      const prof: [number, number][] = [
        [0, 0],
        [0.02, 0],
        [0.038, 0.02],
        [0.045, 0.05],
        [0.036, 0.08],
        [0.012, 0.1],
        [0.006, 0.108],
        [0.012, 0.116],
        [0.036, 0.136],
        [0.045, 0.166],
        [0.038, 0.196],
        [0.02, 0.216],
        [0, 0.216],
      ];
      lathe(
        prof.map(([r, y]) => [r * s, y * s]),
        { at: [hx, y0 + 0.014 + 0.0, hz], segments: 10, color: hgPaint, name: "hourglass" },
      );
      for (const yy of [0, 0.216 * s + 0.014]) {
        lathe(
          [
            [0, 0],
            [0.062 * s * 1.4, 0],
            [0.066 * s * 1.4, 0.007],
            [0.062 * s * 1.4, 0.014],
            [0, 0.014],
          ],
          { at: [hx, y0 + yy, hz], segments: 10, color: BRASS, name: "hgPlate" },
        );
      }
      for (let k = 0; k < 3; k++) {
        const a = (k * Math.PI * 2) / 3 + 0.4;
        b.rod([hx + Math.cos(a) * 0.052, y0 + 0.014, hz + Math.sin(a) * 0.052], [hx + Math.cos(a) * 0.052, y0 + 0.014 + 0.216 * s, hz + Math.sin(a) * 0.052], 0.004, BRASS, { bone: root, name: "hgPost" });
      }
    }
    // potions
    const potions: [number, string, number, number][] = [
      [0.32, PINK, 1.0, 0.06],
      [0.43, MINT, 1.25, 0.0],
      [0.55, VIOLET, 0.9, 0.07],
    ];
    potions.forEach(([x, col, s, z], i) => {
      lathe(
        [
          [0, 0],
          [0.03 * s, 0],
          [0.04 * s, 0.012 * s],
          [0.043 * s, 0.04 * s],
          [0.038 * s, 0.065 * s],
          [0.03 * s, 0.075 * s],
          [0, 0.075 * s],
        ],
        { at: [x, y0, z], segments: 10, color: col, name: `potionLiquid${i}` },
      );
      lathe(
        [
          [0, 0.074 * s],
          [0.031 * s, 0.074 * s],
          [0.028 * s, 0.088 * s],
          [0.016 * s, 0.104 * s],
          [0.014 * s, 0.13 * s],
          [0.017 * s, 0.135 * s],
          [0, 0.135 * s],
        ],
        { at: [x, y0, z], segments: 10, color: cel("#d8f5ff"), name: `potionGlass${i}` },
      );
      part(new THREE.CylinderGeometry(0.014 * s, 0.012 * s, 0.026, 8), cel("#a8703c"), { at: [x, y0 + 0.14 * s, z], name: "cork" });
      gather("potionRing", GOLD, xf(new THREE.TorusGeometry(0.032 * s, 0.004, 4, 10).rotateX(Math.PI / 2), [x, y0 + 0.075 * s, z]));
      gather("potionRing", GOLD, xf(new THREE.TorusGeometry(0.0155 * s, 0.003, 4, 8).rotateX(Math.PI / 2), [x, y0 + 0.126 * s, z]));
    });
    // glow the potion liquids by recolouring: add small glowing sphere inside each (visible through shoulders)
    potions.forEach(([x, col, s, z]) => {
      glow(part(new THREE.SphereGeometry(0.02 * s, 6, 4), col, { at: [x, y0 + 0.072 * s, z + 0.03 * s], name: "potionShine" }), 1.2);
    });
  }

  // T2 — scroll rack, folios, armillary sphere
  {
    const y0 = TOPS[2];
    const y1 = TOPS[3] - BT;
    const X0 = -0.62;
    const X1 = -0.12;
    const ox = -0.37;
    const oy = (y0 + y1) / 2;
    const d = 0.16;
    const slat = (s: number, c: number) => {
      // line y = oy + s*(x-ox) + c, clipped to the rack rectangle
      const xa = s > 0 ? ox + (y0 - oy - c) : ox + (oy + c - y1);
      const xb = s > 0 ? ox + (y1 - oy - c) : ox + (oy + c - y0);
      const lo = Math.max(X0, Math.min(xa, xb));
      const hi = Math.min(X1, Math.max(xa, xb));
      if (hi - lo < 0.02) return;
      const xm = (lo + hi) / 2;
      const ym = oy + s * (xm - ox) + c;
      const len = (hi - lo) * Math.SQRT2;
      part(box(len, 0.014, 0.32), WOOD, { at: [xm, ym, 0.0], rotation: [0, 0, s > 0 ? 45 : -45], name: "rackSlat" });
    };
    for (let k = -4; k <= 4; k++) {
      slat(1, k * d);
      slat(-1, k * d);
    }
    part(box(0.014, y1 - y0, 0.32), WOOD, { at: [X1 + 0.004, (y0 + y1) / 2, 0.0], name: "rackPost" });
    gather("studs", GOLD, new THREE.SphereGeometry(0.01, 6, 4).translate(X1 + 0.004, y1 - 0.01, 0.165));
    gather("studs", GOLD, new THREE.SphereGeometry(0.01, 6, 4).translate(X1 + 0.004, y0 + 0.01, 0.165));
    const cellsXY: [number, number][] = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
      [2, 1],
      [2, -1],
      [-2, 1],
      [-2, -1],
    ];
    cellsXY.forEach(([i, j], idx) => {
      const cx = ox + (i * d) / 2;
      const cy = oy + (j * d) / 2;
      scroll([cx, cy, -0.17], [0, 0, 1], 0.38, 0.03, PAPERS[idx % 3], RIBBONS[(idx * 3) % 4], false);
    });
    row(-0.06, 0.28, y0, 0.26, 0.33);
    // armillary sphere
    const ax = 0.46;
    const az = 0.02;
    lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.075, 0.012],
        [0.05, 0.025],
        [0.025, 0.04],
        [0.02, 0.07],
        [0.03, 0.08],
        [0.03, 0.09],
        [0, 0.09],
      ],
      { at: [ax, y0, az], segments: 10, color: GOLD, name: "armStand" },
    );
    const cy = y0 + 0.09 + 0.12;
    const ringA = b.joint("armRingA", { parent: root, at: [ax, cy, az], dir: [0, 1, 0], role: "hinge" });
    const ringB = b.joint("armRingB", { parent: root, at: [ax, cy, az], dir: [0, 1, 0], role: "hinge" });
    b.rod([ax, cy - 0.135, az], [ax, cy + 0.135, az], 0.005, GOLD, { bone: root, name: "armAxis" });
    glow(part(new THREE.SphereGeometry(0.03, 8, 6), AQUA, { at: [ax, cy, az], name: "armCore" }), 1.3);
    part(new THREE.TorusGeometry(0.115, 0.006, 4, 28).rotateX(Math.PI / 2), GOLD, { at: [ax, cy, az], name: "armEquator" });
    part(new THREE.TorusGeometry(0.115, 0.006, 4, 28), GOLD, { at: [ax, cy, az], bone: ringA, name: "armRingA" });
    part(new THREE.TorusGeometry(0.1, 0.006, 4, 28), GOLD, { at: [ax, cy, az], rotation: [0, 58, 0], bone: ringB, name: "armRingB" });
    {
      const th = (58 * Math.PI) / 180;
      const ph = 0.7;
      const rr = 0.1;
      glow(
        part(new THREE.SphereGeometry(0.017, 8, 6), AMBER, {
          at: [ax + rr * Math.cos(ph) * Math.cos(th), cy + rr * Math.sin(ph), az - rr * Math.cos(ph) * Math.sin(th)],
          bone: ringB,
          name: "armPlanet",
        }),
        1.2,
      );
    }
    part(new THREE.ConeGeometry(0.01, 0.03, 5), GOLD, { at: [ax, cy + 0.15, az], name: "armTip" });
    part(new THREE.ConeGeometry(0.01, 0.03, 5), GOLD, { at: [ax, cy - 0.15, az], rotation: [180, 0, 0], name: "armTip2" });
  }

  // T3 — lectern with open glowing grimoire, candles, folios, hanging star charm, crystals, inkwell
  {
    const y0 = TOPS[3];
    // lectern
    const lx = -0.36;
    const lz = 0.02;
    part(box(0.18, 0.02, 0.17), PLUM, { at: [lx, y0 + 0.01, lz], name: "lecternBase" });
    part(box(0.034, 0.1, 0.034), PLUM, { at: [lx, y0 + 0.07, lz], name: "lecternPost" });
    part(box(0.07, 0.014, 0.07), GOLD, { at: [lx, y0 + 0.025, lz], name: "lecternBand" });
    const tilt = (28 * Math.PI) / 180;
    const M = new THREE.Matrix4()
      .makeTranslation(lx, y0 + 0.14, lz)
      .multiply(new THREE.Matrix4().makeRotationX(tilt));
    const gM = (g: THREE.BufferGeometry) => g.applyMatrix4(M);
    part(gM(box(0.3, 0.012, 0.19)), PLUM, { at: [0, 0, 0], name: "lecternBoard" });
    part(gM(box(0.3, 0.012, 0.014).translate(0, 0.008, 0.088)), GOLD, { at: [0, 0, 0], name: "lecternLip" });
    // open book
    const th = (9 * Math.PI) / 180;
    const covers = [box(0.145, 0.008, 0.17), box(0.145, 0.008, 0.17)];
    covers[0].translate(0.0725, 0.01, 0).rotateZ(th);
    covers[1].translate(-0.0725, 0.01, 0).rotateZ(-th);
    covers.forEach((c) => gM(c));
    part(mergeGeometries(covers)!, cel(mottle("#3f6fd6", "#34305f", { size: 0.05, contrast: 0.7 })), { at: [0, 0, 0], name: "openCovers" });
    const blocks = [box(0.13, 0.022, 0.15), box(0.13, 0.022, 0.15)];
    blocks[0].translate(0.067, 0.026, 0).rotateZ(th);
    blocks[1].translate(-0.067, 0.026, 0).rotateZ(-th);
    blocks.forEach((c) => gM(c));
    part(mergeGeometries(blocks)!, cel("#f3e7c9", "#d9c391"), { at: [0, 0, 0], name: "openPages" });
    const pageTex = (sx: number) => {
      const pl = new THREE.PlaneGeometry(0.115, 0.14).rotateX(-Math.PI / 2);
      pl.translate(sx * 0.067, 0.0385, 0).rotateZ(sx * th);
      return gM(pl);
    };
    gatherTex("pages", PAGES, "#ffffff", pageTex(1));
    gatherTex("pages", PAGES, "#ffffff", pageTex(-1));
    // glowing runes lifted just above the pages
    const runeL = new THREE.PlaneGeometry(0.1, 0.12).rotateX(-Math.PI / 2).translate(0.067, 0.045, 0).rotateZ(th);
    const runeR = new THREE.PlaneGeometry(0.1, 0.12).rotateX(-Math.PI / 2).translate(-0.067, 0.045, 0).rotateZ(-th);
    gatherTex("runes", RUNES, "#ffffff", gM(runeL), 1.3);
    gatherTex("runes", RUNES, "#ffffff", gM(runeR), 1.3);
    // floating sparkles over the book
    const sp: [number, number, number, number][] = [
      [lx + 0.03, y0 + 0.27, 0.06, 0.016],
      [lx - 0.06, y0 + 0.31, 0.04, 0.012],
      [lx + 0.09, y0 + 0.23, 0.07, 0.01],
      [lx - 0.02, y0 + 0.33, 0.05, 0.009],
    ];
    sp.forEach(([x, y, z, r], i) => {
      glow(extrude(starOutline(r, 4, 0.28), { at: [x, y, z], x: [1, 0, 0], thickness: 0.004, color: i % 2 ? "#fff1b0" : AQUA, name: `spark${i}` }), 1.3);
    });
    // candle left of lectern, in holder
    candle(-0.6, y0, 0.05, 0.17, 0.021, "#fff1d0", true, 4);
    candle(-0.185, y0, -0.02, 0.1, 0.017, "#d9c8ff", true, 3);
    // folios right of the lectern
    row(-0.12, 0.2, y0, 0.26, 0.33);
    // crystal cluster behind the charm
    {
      const cx = 0.34;
      const cz = -0.07;
      const crystals: [number, number, number, number, number][] = [
        [0, 0, 0.1, 0.022, 0],
        [0.03, 0.01, 0.07, 0.016, 14],
        [-0.03, 0.0, 0.06, 0.016, -16],
        [0.0, 0.03, 0.05, 0.012, 8],
      ];
      crystals.forEach(([dx, dz, h, r, tl], i) => {
        const g = new THREE.ConeGeometry(r, h, 5).translate(0, h / 2, 0);
        glow(part(g, i % 2 ? TEALC : AQUA, { at: [cx + dx, y0, cz + dz], rotation: [0, 0, tl], name: "crystal" }), 1.1);
      });
    }
    // inkwell, quill and a lying book on the right
    const bx = 0.52;
    lying(bx, y0, 0.03, 0.28, 0.06, 0.2, 0.15, "#d7c27f", 1);
    lying(bx - 0.01, y0 + 0.06, 0.03, 0.24, 0.05, 0.18, -0.1, "#8a49b8", 3);
    const iy = y0 + 0.11;
    lathe(
      [
        [0, 0],
        [0.034, 0],
        [0.04, 0.012],
        [0.04, 0.04],
        [0.03, 0.05],
        [0.016, 0.054],
        [0.016, 0.062],
        [0, 0.062],
      ],
      { at: [bx + 0.04, iy, 0.05], segments: 10, color: cel("#2a2d6d"), name: "inkwell" },
    );
    lathe(
      [
        [0, 0],
        [0.019, 0],
        [0.019, 0.01],
        [0, 0.01],
      ],
      { at: [bx + 0.04, iy + 0.06, 0.05], segments: 8, color: GOLD, name: "inkCap" },
    );
    b.rod([bx + 0.04, iy + 0.06, 0.05], [bx + 0.0, iy + 0.19, 0.09], 0.0035, "#f6ecd2", { bone: root, name: "quillShaft" });
    {
      const qa = V(bx + 0.04, iy + 0.1, 0.05);
      const qb = V(bx + 0.0, iy + 0.19, 0.09);
      const qd = qb.clone().sub(qa);
      const feather: OutlinePoint[] = [
        [0, 0, "sharp"],
        [0.012, 0.03],
        [0.016, 0.07],
        [0.01, 0.105],
        [0, 0.13, "sharp"],
        [-0.011, 0.1],
        [-0.015, 0.06],
        [-0.009, 0.025],
      ];
      const tx = qd.clone().setY(0).normalize();
      extrude(feather, {
        at: [qa.x, qa.y, qa.z],
        x: [tx.z, 0, -tx.x],
        y: [qd.x, qd.y, qd.z],
        thickness: 0.003,
        color: cel(paint((_p, _n, s) => mix("#38c9ee", "#f1fbff", smoothstep(0.02, 0.12, s[1])))),
        name: "quill",
      });
    }
    // hanging star charm on a hinge
    {
      const hx = 0.255;
      const hz = 0.1;
      const hy = TOPS[4] - BT;
      const charm = b.joint("charm", { parent: root, at: [hx, hy, hz], dir: [0, -1, 0], role: "hinge" });
      b.rod([hx, hy, hz], [hx, hy - 0.06, hz], 0.0028, GOLD, { bone: charm, name: "charmChain" });
      for (const yy of [0.012, 0.03, 0.048])
        part(new THREE.TorusGeometry(0.0075, 0.0022, 4, 6).rotateY(yy > 0.02 ? 0 : Math.PI / 2), GOLD, { at: [hx, hy - yy, hz], bone: charm, name: "charmLink" });
      extrude(starOutline(0.045), { at: [hx, hy - 0.11, hz], x: [1, 0, 0], thickness: 0.012, bevel: 0.003, color: GOLD, bone: charm, name: "charmStar" });
      glow(part(new THREE.OctahedronGeometry(0.02, 0).scale(1, 1.5, 1), VIOLET, { at: [hx, hy - 0.11, hz + 0.01], bone: charm, name: "charmGem" }), 1.3);
      glow(part(new THREE.SphereGeometry(0.014, 6, 4), AQUA, { at: [hx, hy - 0.19, hz], bone: charm, name: "charmBead" }), 1.2);
      b.rod([hx, hy - 0.155, hz], [hx, hy - 0.178, hz], 0.0025, GOLD, { bone: charm, name: "charmChain2" });
    }
  }

  // T4 — tall grimoires, candelabra, sun orb
  {
    const y0 = TOPS[4];
    row(-0.62, -0.2, y0, 0.29, 0.34);
    // three-candle stand in the middle
    const cx = -0.04;
    lathe(
      [
        [0, 0],
        [0.06, 0],
        [0.065, 0.01],
        [0.045, 0.022],
        [0.022, 0.04],
        [0.018, 0.1],
        [0.026, 0.11],
        [0.02, 0.125],
        [0, 0.125],
      ],
      { at: [cx, y0, 0.02], segments: 10, color: BRASS, name: "standBase" },
    );
    for (const [dx, h, wx] of [[0, 0.12, "#fff1d0"], [-0.05, 0.08, "#d9c8ff"], [0.05, 0.1, "#fff1d0"]] as const) {
      b.sweep(catmull([[cx, y0 + 0.11, 0.02], [cx + dx * 0.6, y0 + 0.12, 0.02], [cx + dx, y0 + 0.14, 0.02]]), 0.005, BRASS, { sides: 5, bone: root, caps: "round", name: "standArm" });
      candle(cx + dx, y0 + 0.14, 0.02, h * 0.55, 0.014, wx, false, 2, 0.9);
    }
    // sun orb
    orb(0.4, y0, 0.03, 0.095, ORB_SUN);
    row(0.5, 0.62, y0, 0.26, 0.3);
    // aqua orb between the stand and the sun orb
    orb(0.2, y0, 0.03, 0.065, ORB_AQUA);
  }

  // =============================================================================================================
  // Cornice shoulders: candelabra and wizard hat
  {
    const cx = -0.58;
    const cz = 0.03;
    const y0 = 2.18;
    lathe(
      [
        [0, 0],
        [0.09, 0],
        [0.095, 0.012],
        [0.075, 0.028],
        [0.04, 0.045],
        [0.022, 0.07],
        [0.03, 0.09],
        [0.02, 0.11],
        [0.02, 0.19],
        [0.03, 0.2],
        [0.026, 0.22],
        [0, 0.22],
      ],
      { at: [cx, y0, cz], segments: 10, color: GOLD, name: "candelabra" },
    );
    const arms: [number, number, number, string][] = [
      [-0.085, 0.27, 0.1, "#fff1d0"],
      [0.085, 0.27, 0.12, "#d9c8ff"],
      [0, 0.22, 0.15, "#fff1d0"],
    ];
    arms.forEach(([dx, hy, h, wx]) => {
      if (dx !== 0) {
        b.sweep(
          catmull([
            [cx, y0 + 0.19, cz],
            [cx + dx * 0.5, y0 + 0.2, cz],
            [cx + dx, y0 + 0.24, cz],
            [cx + dx, y0 + hy - 0.006, cz],
          ]),
          0.007,
          GOLD,
          { sides: 6, bone: root, caps: "round", name: "candArm" },
        );
      }
      lathe(
        [
          [0, 0],
          [0.026, 0.006],
          [0.032, 0.02],
          [0.022, 0.022],
          [0, 0.012],
        ],
        { at: [cx + dx, y0 + hy - 0.004, cz], segments: 8, color: GOLD, name: "candCup" },
      );
      candle(cx + dx, y0 + hy + 0.012, cz, h, 0.017, wx, false, 3);
    });

    // wizard hat
    const hx = 0.58;
    const hz = 0.0;
    const HAT = cel(spots("#4b2bb0", "#f6cf62", { size: 0.05, amount: 0.3, seed: 4 }));
    lathe(
      [
        [0, 0],
        [0.16, 0],
        [0.172, 0.008],
        [0.16, 0.016],
        [0.11, 0.025],
        [0.085, 0.07],
        [0.066, 0.12],
        [0, 0.12],
      ],
      { at: [hx, y0, hz], segments: 12, color: HAT, name: "hatBrim" },
    );
    b.sweep(
      catmull([
        [hx, y0 + 0.11, hz],
        [hx, y0 + 0.18, hz],
        [hx + 0.02, y0 + 0.25, hz],
        [hx + 0.07, y0 + 0.285, hz],
        [hx + 0.12, y0 + 0.27, hz],
      ]),
      [0.066, 0.05, 0.034, 0.016, 0.004],
      HAT,
      { sides: 10, caps: { start: "none", end: "point" }, bone: root, name: "hatTip" },
    );
    part(new THREE.TorusGeometry(0.098, 0.009, 4, 16).rotateX(Math.PI / 2), GOLD, { at: [hx, y0 + 0.04, hz], name: "hatBand" });
    part(box(0.034, 0.03, 0.01), GOLD, { at: [hx, y0 + 0.04, hz + 0.102], name: "hatBuckle" });
    glow(extrude(starOutline(0.02), { at: [hx, y0 + 0.04, hz + 0.109], x: [1, 0, 0], thickness: 0.004, color: AQUA, name: "hatStar" }), 1.2);
    // two lying books beside the hat
    lying(hx - 0.02, y0, 0.18, 0.2, 0.05, 0.15, 0.3, "#c2385a", 0);
  }

  // =============================================================================================================
  // Floor clutter on the rug
  {
    const fy = 0.02;
    // left: tome pile with candle
    let y = fy;
    const pile: [number, number, number, string, number, number][] = [
      [0.44, 0.085, 0.32, "#8a49b8", 2, 0.2],
      [0.38, 0.07, 0.28, "#e0832f", 1, -0.25],
      [0.34, 0.06, 0.25, "#2fa7a0", 3, 0.5],
      [0.28, 0.05, 0.2, "#c2385a", 0, -0.1],
    ];
    pile.forEach(([len, T, D, c, orn, yaw], i) => {
      lying(-1.02 + (i % 2) * 0.02, y, 0.42, len, T, D, yaw, c, orn, i === 3);
      y += T;
    });
    candle(-1.02, y, 0.42, 0.1, 0.024, "#fff1d0", true, 4);
    // right: urn with scrolls
    const ux = 1.02;
    const uz = 0.38;
    const URN = cel(
      paint((p, _n, s) => {
        const h = s[0];
        if ((h > 0.2 && h < 0.215) || (h > 0.315 && h < 0.33) || (h > 0.04 && h < 0.052)) return "#f6cf62";
        if (h > 0.23 && h < 0.3) {
          const k = Math.abs(((s[1] / 30) % 2 + 2) % 2 - 1);
          return k < 0.35 ? "#f6cf62" : "#2aa59e";
        }
        return mix("#2aa59e", "#1f7f87", noise(p, 0.1, 2));
      }),
    );
    lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.11, 0.03],
        [0.15, 0.12],
        [0.16, 0.22],
        [0.14, 0.34],
        [0.09, 0.42],
        [0.085, 0.46],
        [0.11, 0.49],
        [0.115, 0.515],
        [0.1, 0.52],
        [0.075, 0.495],
        [0, 0.49],
      ],
      { at: [ux, fy, uz], segments: 14, smoothing: 1, color: URN, name: "urn" },
    );
    part(new THREE.CylinderGeometry(0.078, 0.078, 0.004, 12), cel("#1b1740"), { at: [ux, fy + 0.494, uz], name: "urnMouth" });
    const dirs: V3a[] = [
      [0.1, 1, 0.05],
      [-0.2, 1, 0.1],
      [0.05, 1, -0.22],
      [-0.08, 1, -0.1],
      [0.22, 1, -0.12],
      [-0.05, 1, 0.28],
    ];
    dirs.forEach((dv, i) => {
      const dn = V(dv[0], dv[1], dv[2]).normalize();
      const base = V(ux + dv[0] * 0.05, fy + 0.5, uz + dv[2] * 0.05).addScaledVector(dn, -0.12);
      scroll([base.x, base.y, base.z], dv, 0.42 + (i % 3) * 0.04, 0.026, PAPERS[i % 3], RIBBONS[i % 4], true);
    });
    // front: candle cluster on a brass tray
    const tx = 0.12;
    const tz = 0.82;
    lathe(
      [
        [0, 0],
        [0.15, 0],
        [0.17, 0.012],
        [0.17, 0.024],
        [0.14, 0.02],
        [0, 0.016],
      ],
      { at: [tx, fy, tz], segments: 14, color: BRASS, name: "tray" },
    );
    const cs: [number, number, number, number, string][] = [
      [0, 0, 0.26, 0.05, "#fff1d0"],
      [-0.095, 0.03, 0.18, 0.04, "#d9c8ff"],
      [0.09, -0.04, 0.13, 0.036, "#fff1d0"],
      [0.03, 0.09, 0.2, 0.026, "#ffd6e6"],
      [-0.04, -0.09, 0.09, 0.028, "#fff1d0"],
    ];
    cs.forEach(([dx, dz, h, r, w]) => candle(tx + dx, fy + 0.02, tz + dz, h, r, w, false, 4));
    // loose scrolls and an open-ish book on the rug
    scroll([-0.5, fy + 0.026, 0.95], [1, 0, 0.25], 0.4, 0.026, PAPERS[1], RIBBONS[0], true);
    scroll([-0.45, fy + 0.026, 1.03], [1, 0, -0.1], 0.36, 0.026, PAPERS[0], RIBBONS[1], true);
    lying(0.72, fy, 0.98, 0.3, 0.055, 0.22, -0.4, "#3f6fd6", 0, true);
    candle(0.72, fy + 0.055, 0.98, 0.07, 0.02, "#fff1d0", true, 3);
  }

  // =============================================================================================================
  // Flush merged buckets
  const flameOuter = mergeGeometries(flameOut)!;
  const flameInner = mergeGeometries(flameIn)!;
  glow(part(flameOuter, "#ff9f3a", { at: [0, 0, 0], name: "flames" }), 1.3);
  glow(part(flameInner, "#fff0a0", { at: [0, 0, 0], name: "flameCores" }), 1.5);
  for (const [key, k] of buckets) {
    const merged = mergeGeometries(k.geos);
    if (!merged) continue;
    const p = part(merged, k.fill, { at: [0, 0, 0], name: key });
    if (k.glowK) glow(p, k.glowK);
  }
  for (const [key, k] of texBuckets) {
    const merged = mergeGeometries(k.geos);
    if (!merged) continue;
    const p = part(merged, k.tint, { at: [0, 0, 0], texture: k.tex, name: key });
    if (k.glowK) glow(p, k.glowK);
  }

  return b.root;
}
