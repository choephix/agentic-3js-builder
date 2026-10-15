import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { aim, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { cells, grain, mix, mottle, noise, paint, smoothstep } from "../../../../src/paint";
import type { ColorInput } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, furEdge, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A tall violet-wood wizard's bookcase under a gilded ogee crown with a stained-glass moon window: leather tomes with gold spines, a scroll rack, crystal orbs, candles with wax drips, an open spellbook on a lectern, an hourglass, an owl figurine, a hanging star lantern and a banner, standing on a starry rug.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

type V = [number, number, number];
type Joint = ReturnType<ReturnType<typeof createBuilder>["joint"]>;
const DEG = Math.PI / 180;

// ---------------------------------------------------------------------------------------------------------------
// Palette: every surface is a two-tone cel paint (lit tone + hue-shifted shadow tone).

const WOOD_V = cel(grain("#7447a0", "#5f3688", { size: 0.022, axis: "y", seed: 2 }));
const WOOD_H = cel(grain("#7447a0", "#5f3688", { size: 0.022, axis: "x", seed: 4 }));
const WOOD_Z = cel(grain("#7447a0", "#5f3688", { size: 0.022, axis: "z", seed: 6 }));
const WOOD_LIGHT = cel(grain("#a874d6", "#9363c4", { size: 0.02, axis: "x", seed: 9 }));
const GOLD = cel("#ffd44f", "#d58a2a");
const GOLD_DEEP = cel("#e9a935", "#b8691f");
const PARCH = cel(mottle("#fbe9bb", "#f1d79a", { size: 0.04, contrast: 0.6, seed: 3 }));
const PARCH2 = cel(mottle("#f3dcb0", "#e8c78c", { size: 0.04, contrast: 0.6, seed: 5 }));
const PAGES = cel("#fff4da", "#e9cfa6");
const WAX_IVORY = cel("#fff2d8", "#efc9a0");
const WAX_ROSE = cel("#ff9bbd", "#e0638f");
const WAX_TEAL = cel("#7fe3d8", "#3fb0b8");
const RIBBON_ROSE = cel("#f0558a");
const RIBBON_TEAL = cel("#27c4c0");
const RIBBON_GOLD = GOLD;
const VIOLET_DARK = cel("#3a2a78", "#271b57");
const CRIMSON_CLOTH = cel("#c93a5e");

const SKY = paint((p) => {
  const c = cells(p, 0.1, 5);
  const r = c.d1 * 0.1;
  const big = c.id > 0.72;
  if (r < (big ? 0.0075 : 0.0042)) return big ? "#fff0a8" : "#cfe6ff";
  const g = noise(p, 0.3, 3);
  const h = noise(p, 0.18, 8);
  const base = mix("#1b2a74", "#2f3fa6", g);
  return h > 0.62 ? mix(base, "#5b3cb0", smoothstep(0.62, 0.8, h) * 0.8) : base;
});

const BOOK_COLORS = [
  "#d63c5e", // crimson
  "#3b6fe0", // sapphire
  "#1fae78", // emerald
  "#8e55d6", // violet
  "#22b5bd", // teal
  "#e8932f", // amber
  "#f1e4c4", // ivory
  "#f06fa0", // rose
  "#34388f", // midnight
];
const BOOK_PAINTS = BOOK_COLORS.map((c, i) =>
  cel(mottle(c, mix(c, "#ffffff", 0.18), { size: 0.05, contrast: 0.5, seed: 20 + i })),
);

// ---------------------------------------------------------------------------------------------------------------
// Textures (drawings in colour keep their own colours; the glowing ones are drawn bright on purpose)

const star5 = (cx: number, cy: number, r: number, rot = -90) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (rot + i * 36) * DEG;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return pts.join(" ");
};

const SPINE_SVGS = [
  // 0: banded with a dark title plate
  `<svg viewBox="0 0 40 180">
    <rect x="0" y="8" width="40" height="4" fill="#ffd44f"/><rect x="0" y="14.5" width="40" height="2" fill="#d58a2a"/>
    <rect x="0" y="163.5" width="40" height="4" fill="#ffd44f"/><rect x="0" y="157.5" width="40" height="2" fill="#d58a2a"/>
    <rect x="5" y="48" width="30" height="82" rx="3" fill="#2a1646" stroke="#ffd44f" stroke-width="2.4"/>
    <rect x="11" y="60" width="18" height="3" fill="#fff4da"/><rect x="13" y="68" width="14" height="3" fill="#fff4da"/>
    <rect x="11" y="76" width="18" height="3" fill="#fff4da"/>
    <polygon points="${star5(20, 100, 7)}" fill="#ffd44f"/>
    <rect x="12" y="114" width="16" height="3" fill="#ffd44f"/>
  </svg>`,
  // 1: runes between bands
  `<svg viewBox="0 0 40 180">
    <rect x="0" y="10" width="40" height="3" fill="#ffd44f"/><rect x="0" y="167" width="40" height="3" fill="#ffd44f"/>
    <rect x="0" y="16" width="40" height="1.8" fill="#fff4da"/><rect x="0" y="162" width="40" height="1.8" fill="#fff4da"/>
    <g fill="none" stroke="#ffd44f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 38 L20 28 L28 38 M20 28 V52 M13 46 H27"/>
      <path d="M12 62 H28 M12 62 V80 M28 62 V80 M12 80 H28 M12 71 H28"/>
      <path d="M20 90 L12 104 L28 104 Z M20 110 V120"/>
      <path d="M12 130 Q20 124 28 130 Q20 138 12 130 M20 142 V152 M14 147 H26"/>
    </g>
  </svg>`,
  // 2: moon and stars
  `<svg viewBox="0 0 40 180">
    <rect x="0" y="9" width="40" height="3.5" fill="#fff4da"/><rect x="0" y="167.5" width="40" height="3.5" fill="#fff4da"/>
    <path d="M26 56 A18 18 0 1 0 26 104 A13 13 0 1 1 26 56 Z" fill="#ffd44f"/>
    <polygon points="${star5(14, 34, 6)}" fill="#ffd44f"/>
    <polygon points="${star5(28, 126, 5)}" fill="#fff4da"/>
    <polygon points="${star5(13, 144, 4)}" fill="#ffd44f"/>
    <circle cx="30" cy="88" r="3" fill="#2a1646"/>
    <rect x="19" y="20" width="2" height="22" fill="#d58a2a"/>
  </svg>`,
  // 3: diamonds with gems
  `<svg viewBox="0 0 40 180">
    <rect x="0" y="9" width="40" height="3.5" fill="#ffd44f"/><rect x="0" y="167.5" width="40" height="3.5" fill="#ffd44f"/>
    <g fill="#2a1646" stroke="#ffd44f" stroke-width="2.4" stroke-linejoin="round">
      <polygon points="20,26 35,48 20,70 5,48"/><polygon points="20,76 35,98 20,120 5,98"/>
      <polygon points="20,126 35,148 20,170 5,148" transform="translate(0,-16)"/>
    </g>
    <circle cx="20" cy="48" r="5" fill="#27c4c0"/><circle cx="20" cy="98" r="5" fill="#f0558a"/><circle cx="20" cy="132" r="5" fill="#ffd44f"/>
    <circle cx="18.5" cy="46.5" r="1.5" fill="#ffffff"/><circle cx="18.5" cy="96.5" r="1.5" fill="#ffffff"/>
  </svg>`,
];
const SPINE_TEX = SPINE_SVGS.map((s) => svg(s, { size: 360 }));

const TASSEL_TEX = svg(
  `<svg viewBox="0 0 20 70">
    <g stroke="#d58a2a" stroke-width="1.6" stroke-linecap="round"><path d="M3 2V10 M7 2V12 M10 2V13 M13 2V12 M17 2V10"/></g>
    <path d="M1 12 Q10 7 19 12 L17 50 Q10 54 3 50 Z" fill="#27c4c0" stroke="#1b8f97" stroke-width="1.2"/>
    <rect x="2" y="24" width="16" height="3" fill="#ffd44f"/><rect x="3" y="38" width="14" height="3" fill="#ffd44f"/>
    <circle cx="10" cy="60" r="7" fill="#ffd44f" stroke="#d58a2a" stroke-width="1.4"/>
    <circle cx="8" cy="58" r="2" fill="#fff4da"/>
  </svg>`,
  { size: 210 },
);

const vineSvg = () => {
  const stars = [
    [30, 60, 9],
    [14, 140, 6],
    [46, 210, 7],
    [30, 300, 9],
  ]
    .map(([x, y, r]) => `<polygon points="${star5(x, y, r)}" fill="#ffd44f"/>`)
    .join("");
  const leaves = [
    [20, 110, -30],
    [40, 170, 30],
    [18, 245, -35],
    [42, 275, 35],
    [24, 340, -25],
  ]
    .map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="10" fill="#27c4c0" transform="rotate(${a} ${x} ${y})"/>`)
    .join("");
  return `<svg viewBox="0 0 60 400">
    <path d="M30 392 C8 350 52 320 30 280 S10 200 30 160 S52 80 30 20" fill="none" stroke="#ffd44f" stroke-width="3.4" stroke-linecap="round"/>
    ${leaves}${stars}
    <circle cx="30" cy="380" r="6" fill="#ffd44f"/><circle cx="30" cy="20" r="4" fill="#fff4da"/>
  </svg>`;
};
const VINE_TEX = svg(vineSvg(), { size: 560 });

const MOON_EMBLEM = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill="none" stroke="#ffd44f" stroke-width="3"/>
    <path d="M58 22 A30 30 0 1 0 58 78 A22 22 0 1 1 58 22 Z" fill="#ffd44f"/>
    <polygon points="${star5(66, 38, 8)}" fill="#fff4da"/>
    <polygon points="${star5(70, 66, 5)}" fill="#ffd44f"/>
  </svg>`,
  { size: 256 },
);
const SUN_EMBLEM = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill="none" stroke="#ffd44f" stroke-width="3"/>
    <polygon points="${star5(50, 50, 40, -90)}" fill="#ffd44f"/>
    <polygon points="${star5(50, 50, 28, -54)}" fill="#fff4da"/>
    <circle cx="50" cy="50" r="12" fill="#f0558a" stroke="#ffd44f" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

const glassSvg = () => {
  const cols = ["#ffd44f", "#f0558a", "#27c4c0", "#9a6bff"];
  let petals = "";
  for (let i = 0; i < 8; i++) {
    const a0 = (i * 45 - 22.5 - 90) * DEG;
    const a1 = (i * 45 + 22.5 - 90) * DEG;
    const p = (a: number, r: number) => `${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)}`;
    petals += `<polygon points="50,50 ${p(a0, 30)} ${p((a0 + a1) / 2, 40)} ${p(a1, 30)}" fill="${cols[i % 4]}" stroke="#2a1646" stroke-width="2.4" stroke-linejoin="round"/>`;
    petals += `<polygon points="${p(a0, 30)} ${p(a0, 46)} ${p(a1, 46)} ${p(a1, 30)}" fill="${cols[(i + 2) % 4]}" stroke="#2a1646" stroke-width="2.4" opacity="0.95"/>`;
  }
  return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="#2a1646"/>${petals}
    <circle cx="50" cy="50" r="10" fill="#fff4da" stroke="#2a1646" stroke-width="2.4"/></svg>`;
};
const GLASS_TEX = svg(glassSvg(), { size: 256 });

const orbSvg = (top: string, mid: string, bot: string, swirl: string) => `<svg viewBox="0 0 256 128">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="0.5" stop-color="${mid}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs>
  <rect width="256" height="128" fill="url(#g)"/>
  <path d="M0 60 C40 20 70 110 128 64 S220 20 256 60" fill="none" stroke="#ffffff" stroke-opacity="0.75" stroke-width="7" stroke-linecap="round"/>
  <path d="M0 92 C50 60 90 124 150 90 S226 70 256 96" fill="none" stroke="${swirl}" stroke-opacity="0.9" stroke-width="9" stroke-linecap="round"/>
  <path d="M0 34 C30 14 60 50 100 30 S180 6 256 36" fill="none" stroke="${swirl}" stroke-opacity="0.6" stroke-width="6" stroke-linecap="round"/>
  <g fill="#ffffff"><circle cx="30" cy="50" r="3"/><circle cx="90" cy="88" r="2.5"/><circle cx="150" cy="40" r="3"/><circle cx="200" cy="80" r="2.5"/><circle cx="240" cy="30" r="2.5"/><circle cx="120" cy="108" r="2"/></g>
</svg>`;
const ORB_CYAN = svg(orbSvg("#e4fcff", "#5ed6f0", "#2f78e0", "#b9a4ff"), { size: 256 });
const ORB_VIOLET = svg(orbSvg("#ffe6fb", "#c77cf0", "#5a3cc8", "#6ff0e0"), { size: 256 });

const pageLines = (rows: number[], x0: number) =>
  rows.map((w, i) => `<rect x="${x0}" y="${22 + i * 8}" width="${w}" height="2.6" rx="1" fill="#6a4a82"/>`).join("");
const PAGE_L = svg(
  `<svg viewBox="0 0 70 100"><rect width="70" height="100" fill="#fff0cc"/>
    <rect x="8" y="9" width="14" height="14" fill="#f0558a"/><rect x="10" y="11" width="10" height="10" fill="#ffd44f"/>
    ${pageLines([40, 52, 54, 50, 54, 46, 54, 52, 38, 54, 50], 8)}
    <rect x="26" y="12" width="36" height="3" fill="#6a4a82"/><rect x="26" y="18" width="30" height="2.6" fill="#6a4a82"/></svg>`,
  { size: 256 },
);
const PAGE_R = svg(
  `<svg viewBox="0 0 70 100"><rect width="70" height="100" fill="#fff0cc"/>
    <g fill="none" stroke="#2a8f98" stroke-width="2.4"><circle cx="35" cy="32" r="21"/><circle cx="35" cy="32" r="13"/>
      <polygon points="${star5(35, 32, 20)}" stroke="#8a4fc0"/></g>
    ${pageLines([54, 50, 54, 40, 54, 52, 46, 54, 30], 8).replace(/y="(\d+)"/g, (_m, y) => `y="${Number(y) + 40}"`)}</svg>`,
  { size: 256 },
);
const RUNE_CIRCLE = svg(
  `<svg viewBox="0 0 100 100">
    <g fill="none" stroke="#7ff6ea" stroke-width="3.4" stroke-linecap="round">
      <circle cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="33" stroke="#fff4a8"/>
      <polygon points="${star5(50, 50, 33)}" stroke="#bfa6ff"/>
    </g>
    <g fill="#fff4a8"><circle cx="50" cy="6" r="3.4"/><circle cx="94" cy="50" r="3.4"/><circle cx="50" cy="94" r="3.4"/><circle cx="6" cy="50" r="3.4"/></g>
  </svg>`,
  { size: 256 },
);

const spiralSvg = () => {
  let d = "M32 32";
  for (let i = 1; i <= 90; i++) {
    const a = i * 0.28;
    const r = 1.2 + a * 1.35;
    d += ` L${(32 + Math.cos(a) * r).toFixed(1)} ${(32 + Math.sin(a) * r).toFixed(1)}`;
  }
  return `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#f6e2b0"/><path d="${d}" fill="none" stroke="#a8743a" stroke-width="2.6" stroke-linecap="round"/></svg>`;
};
const SCROLL_END = svg(spiralSvg(), { size: 128 });

const OWL_EYE = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#fff4da" stroke="#2a1646" stroke-width="4"/>
    <circle cx="32" cy="34" r="19" fill="#27c4c0"/><circle cx="32" cy="38" r="11" fill="#7ff0e4"/>
    <ellipse cx="32" cy="32" rx="8" ry="12" fill="#2a1646"/><circle cx="27" cy="26" r="5" fill="#ffffff"/><circle cx="37" cy="40" r="2.4" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const LANTERN_TEX = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#ffd36a"/>
    <polygon points="${star5(32, 33, 22)}" fill="#fff6c8"/>
    <circle cx="32" cy="33" r="7" fill="#ffffff"/>
    <g fill="#ffb347"><circle cx="9" cy="9" r="4"/><circle cx="55" cy="9" r="4"/><circle cx="9" cy="55" r="4"/><circle cx="55" cy="55" r="4"/></g></svg>`,
  { size: 128 },
);
const POTION_LABEL = svg(
  `<svg viewBox="0 0 40 50"><rect width="40" height="50" rx="4" fill="#fff4da"/><rect x="2" y="2" width="36" height="46" rx="3" fill="none" stroke="#c93a5e" stroke-width="2.4"/>
    <polygon points="${star5(20, 20, 10)}" fill="#8e55d6"/><rect x="9" y="36" width="22" height="3" fill="#6a4a82"/></svg>`,
  { size: 96 },
);

// ---------------------------------------------------------------------------------------------------------------
// Geometry helpers: merged by (name, bone) into as few parts as the style needs.

const xf = <G extends THREE.BufferGeometry>(g: G, pos: V = [0, 0, 0], rot: V = [0, 0, 0], scale: V = [1, 1, 1]) => {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, "YXZ"));
  g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...pos), q, new THREE.Vector3(...scale)));
  return g;
};
const box = (w: number, h: number, d: number, pos: V, rot?: V) => xf(new THREE.BoxGeometry(w, h, d), pos, rot);
const cyl = (r0: number, r1: number, h: number, seg: number, pos: V, rot?: V) =>
  xf(new THREE.CylinderGeometry(r1, r0, h, seg), pos, rot);
const ball = (r: number, pos: V, scale: V = [1, 1, 1], ws = 8, hs = 6, rot?: V) =>
  xf(new THREE.SphereGeometry(r, ws, hs), pos, rot, scale);
const turn = (profile: Array<[number, number]>, seg: number, pos: V, rot?: V, scale?: V) =>
  xf(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg), pos, rot, scale);
const mat = (pos: V, rot: V = [0, 0, 0]) =>
  new THREE.Matrix4().compose(
    new THREE.Vector3(...pos),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, "YXZ")),
    new THREE.Vector3(1, 1, 1),
  );

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf", paintSize: 2048 });
  const R = rng(1107);
  const base = b.joint("base", { at: [0, 0, 0], dir: [0, 1, 0] });
  const doorL = b.joint("doorL", { parent: base, at: [0.7, 0.36, 0.235], dir: [0, 1, 0], role: "hinge" });
  const doorR = b.joint("doorR", { parent: base, at: [-0.7, 0.36, 0.235], dir: [0, 1, 0], role: "hinge" });
  const lanternSwing = b.joint("lanternSwing", { parent: base, at: [1.03, 1.78, 0.05], dir: [0, -1, 0], role: "hinge" });
  const bannerSwing = b.joint("bannerSwing", { parent: base, at: [-0.97, 1.72, 0.05], dir: [0, -1, 0], role: "hinge" });

  type Bucket = {
    color: ColorInput;
    bone: Joint;
    geos: THREE.BufferGeometry[];
    texture?: THREE.Texture;
    glow?: number;
    flat?: boolean;
    name: string;
  };
  const buckets = new Map<string, Bucket>();
  const put = (
    name: string,
    color: ColorInput,
    geo: THREE.BufferGeometry,
    o: { bone?: Joint; texture?: THREE.Texture; glow?: number; flat?: boolean } = {},
  ) => {
    const bone = o.bone ?? base;
    const key = `${name}|${bone.name}`;
    let bk = buckets.get(key);
    if (!bk) buckets.set(key, (bk = { color, bone, geos: [], texture: o.texture, glow: o.glow, flat: o.flat, name }));
    bk.geos.push(geo);
    return geo;
  };

  // ---- Books -----------------------------------------------------------------------------------------------
  type Spec = { t: number; h: number; d: number; c: number; v: number };
  const BD = 0.011;
  const addBook = (s: Spec, m: THREE.Matrix4, bone: Joint = base) => {
    const { t, h, d } = s;
    const cov = `book${s.c}`;
    const paintC = BOOK_PAINTS[s.c];
    const place = (g: THREE.BufferGeometry) => g.applyMatrix4(m);
    put(cov, paintC, place(box(t - 2 * BD, h, BD, [0, h / 2, d / 2 - BD / 2])), { bone });
    for (const sx of [1, -1]) put(cov, paintC, place(box(BD, h, d, [sx * (t / 2 - BD / 2), h / 2, 0])), { bone });
    put("pages", PAGES, place(box(t - 2 * BD - 0.002, h - 0.014, d - 0.006 - BD, [0, h / 2, (0.006 - BD) / 2 - 0.0005])), { bone });
    // gold head and tail caps on the spine, hinting at the binding
    put("spineGold", GOLD, place(box(t - 2 * BD, 0.006, 0.004, [0, h - 0.004, d / 2 + 0.001])), { bone });
    put("spineGold", GOLD, place(box(t - 2 * BD, 0.006, 0.004, [0, 0.004, d / 2 + 0.001])), { bone });
    put(
      `spine${s.v}`,
      "#ffffff",
      place(xf(new THREE.PlaneGeometry(t - 0.004, h - 0.026), [0, h / 2, d / 2 + 0.0025])),
      { bone, texture: SPINE_TEX[s.v] },
    );
  };
  const rndBook = (hMin = 0.22, hMax = 0.34): Spec => ({
    t: 0.034 + R() * 0.04,
    h: hMin + R() * (hMax - hMin),
    d: 0.17 + R() * 0.09,
    c: Math.floor(R() * BOOK_COLORS.length),
    v: Math.floor(R() * SPINE_TEX.length),
  });
  /** Upright books from x0 toward x1 (direction from the sign), the last one leaning into the free space. */
  const row = (x0: number, x1: number, floor: number, leanDeg = 0, hMax = 0.34, zFront = 0.185) => {
    const dir = Math.sign(x1 - x0);
    let cur = x0;
    let last = x0;
    for (;;) {
      const s = rndBook(0.22, hMax);
      if (Math.abs(x1 - cur) < s.t + 0.01) break;
      const x = cur + (dir * s.t) / 2;
      const pull = R() < 0.25 ? 0.012 : 0;
      addBook(s, mat([x, floor, zFront - s.d / 2 + pull], [0, (R() - 0.5) * 3, 0]));
      cur += dir * (s.t + 0.003);
      last = cur;
    }
    if (leanDeg) {
      const s = rndBook(0.26, hMax - 0.02);
      const th = -dir * leanDeg;
      const lift = (s.t / 2) * Math.sin(Math.abs(th) * DEG);
      const x = last + dir * (s.t / 2 + 0.016);
      addBook(s, mat([x, floor + lift, zFront - s.d / 2], [0, 0, th]));
    }
  };
  /** A pile of lying books, bottom first. Returns the top height. */
  const stack = (x: number, floor: number, z: number, count: number, w = 0.3) => {
    let y = floor;
    for (let i = 0; i < count; i++) {
      const s: Spec = {
        t: 0.045 + R() * 0.03,
        h: w - i * 0.018 - R() * 0.02,
        d: 0.2 - i * 0.012,
        c: (i * 3 + Math.floor(R() * 3)) % BOOK_COLORS.length,
        v: Math.floor(R() * SPINE_TEX.length),
      };
      const m = mat([x + (R() - 0.5) * 0.025, y + s.t / 2, z], [0, (R() - 0.5) * 16, 0]).multiply(
        mat([0, 0, 0], [0, 0, 90]).multiply(mat([0, -s.h / 2, 0])),
      );
      addBook(s, m);
      // a gold strap and buckle on the bigger tomes
      if (i % 2 === 0) {
        const mm = m.clone();
        put("strap", GOLD_DEEP, box(s.t + 0.004, 0.02, 0.012, [0, s.h * 0.78, -s.d / 2 + 0.004]).applyMatrix4(mm));
        put("strap", GOLD, box(s.t + 0.008, 0.014, 0.008, [0, s.h * 0.78, -s.d / 2 - 0.002]).applyMatrix4(mm));
      }
      y += s.t + 0.002;
    }
    return y;
  };

  // ---- Candle -----------------------------------------------------------------------------------------------
  const candle = (x: number, y: number, z: number, r: number, h: number, wax: ColorInput, key: string, drips = 4) => {
    put(
      `wax${key}`,
      wax,
      turn(
        [
          [0, 0],
          [r, 0],
          [r, h - 0.012],
          [r * 0.82, h - 0.004],
          [r * 0.5, h - 0.014],
          [0, h - 0.016],
        ],
        9,
        [x, y, z],
      ),
    );
    for (let i = 0; i < drips; i++) {
      const a = (-80 + (160 * (i + R() * 0.5)) / drips) * DEG;
      const len = 0.02 + R() * h * 0.45;
      const rr = r * 0.2;
      put(
        `wax${key}`,
        wax,
        cyl(rr, rr, len, 5, [x + Math.sin(a) * (r + rr * 0.4), y + h - 0.008 - len / 2, z + Math.cos(a) * (r + rr * 0.4)]),
      );
      put(`wax${key}`, wax, ball(rr * 1.25, [x + Math.sin(a) * (r + rr * 0.4), y + h - 0.008 - len, z + Math.cos(a) * (r + rr * 0.4)], [1, 1, 1], 6, 4));
    }
    put("wick", INK, box(0.004, 0.016, 0.004, [x, y + h - 0.008, z]));
    put("flameOut", "#ffa733", turn([[0, 0], [0.011, 0.012], [0.013, 0.03], [0.008, 0.052], [0, 0.074]], 6, [x, y + h, z]), { glow: 1.2, flat: true });
    put("flameIn", "#fff4b8", turn([[0, 0.002], [0.006, 0.012], [0.007, 0.024], [0, 0.04]], 6, [x, y + h, z + 0.002]), { glow: 1.4, flat: true });
  };
  const dish = (x: number, y: number, z: number, r: number) => {
    put(
      "dish",
      GOLD,
      turn(
        [
          [0, 0],
          [r * 0.7, 0],
          [r, 0.014],
          [r * 1.05, 0.02],
          [r * 0.92, 0.018],
          [r * 0.7, 0.008],
          [0, 0.008],
        ],
        10,
        [x, y, z],
      ),
    );
  };

  // ---- Orb on a gold cup ------------------------------------------------------------------------------------
  const orb = (x: number, y: number, z: number, r: number, tex: THREE.Texture, key: string) => {
    const cupH = 0.09;
    put(
      "orbCup",
      GOLD,
      turn(
        [
          [0, 0],
          [r * 0.95, 0],
          [r * 1.0, 0.012],
          [r * 0.6, 0.026],
          [r * 0.34, 0.04],
          [r * 0.3, 0.056],
          [r * 0.62, 0.074],
          [r * 0.82, cupH],
          [r * 0.7, cupH + 0.004],
          [r * 0.5, 0.082],
          [0, 0.082],
        ],
        8,
        [x, y, z],
      ),
    );
    for (let i = 0; i < 3; i++) {
      const a = (i * 120 + 30) * DEG;
      put("orbClaw", GOLD_DEEP, cyl(0.004, 0.009, 0.05, 5, [x + Math.sin(a) * r * 0.8, y + cupH + 0.012, z + Math.cos(a) * r * 0.8], [Math.cos(a) * 18, 0, -Math.sin(a) * 18]));
    }
    const cy = y + cupH + r * 0.72;
    put(`orb${key}`, "#ffffff", xf(new THREE.SphereGeometry(r, 14, 10), [x, cy, z], [0, -90, 0]), { texture: tex, glow: 0.95 });
    const dir: V = [-0.42, 0.52, 0.74];
    const q = aim(dir, undefined, "z");
    const e = new THREE.Euler().setFromQuaternion(q, "YXZ");
    const n = new THREE.Vector3(...dir).normalize();
    put(
      "shine",
      "#ffffff",
      xf(new THREE.SphereGeometry(1, 6, 4), [x + n.x * r * 0.9, cy + n.y * r * 0.9, z + n.z * r * 0.9], [e.x / DEG, e.y / DEG, e.z / DEG], [r * 0.2, r * 0.1, r * 0.03]),
      { glow: 1.5, flat: true },
    );
    return cy;
  };

  // ---- Sparkles ---------------------------------------------------------------------------------------------
  const sparkle = (x: number, y: number, z: number, s: number, col: string) =>
    put(`spark${col}`, col, xf(new THREE.OctahedronGeometry(s, 0), [x, y, z], [0, 0, 0], [0.55, 1, 0.55]), { glow: 1.3, flat: true });

  // =============================================================================================================
  // THE CASE
  // =============================================================================================================
  // plinth
  put("plinth", WOOD_Z, box(1.72, 0.06, 0.58, [0, 0.03, 0.05]));
  put("plinth", WOOD_Z, box(1.6, 0.06, 0.52, [0, 0.09, 0.04]));
  put("goldTrim", GOLD, box(1.62, 0.014, 0.006, [0, 0.092, 0.303]));
  put("goldTrim", GOLD, box(1.74, 0.008, 0.006, [0, 0.058, 0.343]));
  for (const s of [1, -1]) {
    put("goldTrim", GOLD, box(0.006, 0.014, 0.52, [s * 0.803, 0.092, 0.04]));
    put("goldTrim", GOLD, box(0.006, 0.008, 0.58, [s * 0.863, 0.058, 0.05]));
  }
  for (let i = 0; i < 9; i++) put("studs", GOLD, ball(0.011, [-0.72 + i * 0.18, 0.03, 0.34], [1, 1, 0.6], 6, 4));

  // sides
  for (const s of [1, -1]) {
    put("sidePanel", WOOD_V, box(0.06, 1.74, 0.43, [s * 0.73, 0.99, 0.005]));
    put("goldTrim", GOLD, box(0.008, 1.74, 0.008, [s * 0.762, 0.99, 0.222]));
    put("goldTrim", GOLD, box(0.008, 1.74, 0.008, [s * 0.698, 0.99, 0.222]));
  }
  // back, painted with a night sky
  put("backSky", SKY, box(1.4, 1.7, 0.03, [0, 0.97, -0.195]));
  // shelf boards
  const boards = [0.12, 0.56, 0.98, 1.4];
  for (const y0 of boards) {
    put("board", WOOD_H, box(1.4, 0.04, 0.4, [0, y0 + 0.02, 0.02]));
    put("goldTrim", GOLD, box(1.4, 0.012, 0.006, [0, y0 + 0.022, 0.223]));
  }
  // tassels hung under each shelf front
  const tasselFrames: ReturnType<typeof import("../../../../src/frame").frame>[] = [];
  void tasselFrames;

  // frieze and cornice
  put("frieze", WOOD_H, box(1.6, 0.06, 0.46, [0, 1.83, 0.03]));
  for (let i = 0; i < 28; i++) put("dentil", GOLD, box(0.024, 0.024, 0.026, [-0.7425 + i * 0.055, 1.822, 0.273]));
  put("cornice", WOOD_H, box(1.72, 0.05, 0.52, [0, 1.885, 0.04]));
  put("cornice", WOOD_H, box(1.64, 0.04, 0.46, [0, 1.93, 0.03]));
  put("goldTrim", GOLD, box(1.72, 0.012, 0.006, [0, 1.885, 0.303]));
  put("goldTrim", GOLD, box(1.64, 0.01, 0.006, [0, 1.935, 0.263]));
  for (const s of [1, -1]) {
    put("goldTrim", GOLD, box(0.006, 0.012, 0.52, [s * 0.863, 1.885, 0.04]));
    put("goldTrim", GOLD, box(0.006, 0.01, 0.46, [s * 0.823, 1.935, 0.03]));
  }

  // turned gold-ringed front columns
  const colProfile: Array<[number, number]> = [
    [0, 0],
    [0.05, 0],
    [0.05, 0.03],
    [0.04, 0.04],
    [0.034, 0.06],
    [0.028, 0.08],
    [0.028, 1.58],
    [0.034, 1.6],
    [0.04, 1.62],
    [0.05, 1.64],
    [0.05, 1.7],
    [0, 1.7],
  ];
  const colPaint = paint((_p, n, s) => {
    const h = s[0];
    const ring = (h > 0.035 && h < 0.07) || (h > 1.57 && h < 1.62) || (h > 0.78 && h < 0.82) || (h > 0.2 && h < 0.215) || (h > 1.38 && h < 1.395);
    return ring || h < 0.03 || h > 1.64 ? GOLD : WOOD_V;
    void n;
  });
  for (const s of [1, -1]) put("column", colPaint, turn(colProfile, 8, [s * 0.775, 0.12, 0.245]));

  // side vines (decals)
  for (const s of [1, -1]) {
    put(
      "vine",
      "#ffffff",
      xf(new THREE.PlaneGeometry(0.2, 1.42), [s * 0.7625, 0.99, -0.01], [0, s * 90, 0]),
      { texture: VINE_TEX },
    );
  }

  // =============================================================================================================
  // CROWN
  // =============================================================================================================
  const half: Array<[number, number]> = [
    [0.76, 0.06],
    [0.7, 0.105],
    [0.58, 0.15],
    [0.45, 0.19],
    [0.34, 0.25],
    [0.24, 0.33],
    [0.14, 0.41],
    [0.06, 0.48],
  ];
  const crown: Array<[number, number] | [number, number, "sharp"]> = [
    [-0.76, 0, "sharp"],
    [0.76, 0, "sharp"],
    ...half,
    [0, 0.52, "sharp"],
    ...[...half].reverse().map(([x, y]) => [-x, y] as [number, number]),
  ];
  const crownGold = crown.map((p) => [p[0] * 1.035, p[1] * 1.035 - 0.004, ...(p.length === 3 ? ["sharp" as const] : [])]) as typeof crown;
  b.extrude(crownGold, { at: [0, 1.95, -0.18], thickness: 0.04, bevel: 0.004, smoothing: 1, color: GOLD_DEEP, bone: base, name: "crownGold" });
  b.extrude(crown, { at: [0, 1.95, -0.17], x: [1, 0, 0], thickness: 0.05, bevel: 0.004, smoothing: 1, color: SKY, bone: base, name: "crownSky" });
  b.extrude(crownGold, { at: [0, 1.95, -0.18], x: [1, 0, 0], thickness: 0.04, bevel: 0.004, smoothing: 1, color: GOLD_DEEP, bone: base, name: "crownGoldBack" });
  // gold edge beads and crockets on both slopes
  for (const s of [1, -1]) {
    const rim = [[0.78, 0.0], ...half, [0, 0.54]].map(([x, y]) => [s * x, 1.95 + y + 0.012, -0.14]);
    b.sweep(catmull(rim), 0.0085, { color: GOLD, bone: base, sides: 6, name: s > 0 ? "crownRimL" : "crownRimR" });
    for (let i = 1; i < rim.length - 1; i++) {
      const a = rim[i - 1];
      const c = rim[i + 1];
      const tx = c[0] - a[0];
      const ty = c[1] - a[1];
      const len = Math.hypot(tx, ty);
      let nx = ty / len;
      let ny = -tx / len;
      if (ny < 0) {
        nx = -nx;
        ny = -ny;
      }
      const phi = (Math.atan2(-nx, ny) / DEG) as number;
      put("crocket", GOLD, xf(new THREE.ConeGeometry(0.013, 0.05, 5), [rim[i][0] + nx * 0.026, rim[i][1] + ny * 0.026, -0.14], [0, 0, phi]));
      put("crocket", GOLD, ball(0.011, [rim[i][0] + nx * 0.052, rim[i][1] + ny * 0.052, -0.14], [1, 1, 1], 5, 4));
    }
  }
  // moon window
  put("windowRing", GOLD, xf(new THREE.TorusGeometry(0.128, 0.017, 6, 20), [0, 2.21, -0.14]));
  put("windowRing", GOLD_DEEP, xf(new THREE.TorusGeometry(0.108, 0.007, 5, 20), [0, 2.21, -0.141]));
  for (let i = 0; i < 8; i++) {
    const a = i * 45 * DEG;
    put("windowStud", GOLD, ball(0.014, [Math.sin(a) * 0.128, 2.21 + Math.cos(a) * 0.128, -0.128], [1, 1, 0.7], 6, 4));
  }
  put("windowGlass", "#ffffff", xf(new THREE.CircleGeometry(0.113, 24), [0, 2.21, -0.1425]), { texture: GLASS_TEX, glow: 0.9 });
  // little stars on the crown wings
  const starOutline = (r: number) => {
    const pts: Array<[number, number, "sharp"]> = [];
    for (let i = 0; i < 10; i++) {
      const a = (90 + i * 36) * DEG;
      const rr = i % 2 ? r * 0.45 : r;
      pts.push([Math.cos(a) * rr, Math.sin(a) * rr, "sharp"]);
    }
    return pts;
  };
  for (const [sx, sy, sr] of [
    [0.4, 0.095, 0.034],
    [-0.4, 0.095, 0.034],
    [0.62, 0.075, 0.024],
    [-0.62, 0.075, 0.024],
    [0.26, 0.17, 0.02],
    [-0.26, 0.17, 0.02],
  ] as const) {
    glow(b.extrude(starOutline(sr), { at: [sx, 1.95 + sy, -0.142], thickness: 0.01, color: "#ffe27a", bone: base, name: "crownStar" }), 1);
  }
  // crescent finial with a star in its horns
  const crescent: Array<[number, number, "sharp"?]> = [];
  {
    const d = 0.35;
    const rIn = 0.8;
    const tipX = (1 - rIn * rIn + d * d) / (2 * d);
    const tipY = Math.sqrt(1 - tipX * tipX);
    const a0 = Math.atan2(tipY, tipX);
    const rot = (x: number, y: number): [number, number] => [-y * 0.078, x * 0.078];
    for (let i = 0; i <= 10; i++) {
      const a = a0 + ((2 * Math.PI - 2 * a0) * i) / 10;
      const [x, y] = rot(Math.cos(a), Math.sin(a));
      crescent.push(i === 0 || i === 10 ? [x, y, "sharp"] : [x, y]);
    }
    const aIn = Math.atan2(tipY, tipX - d);
    for (let i = 1; i < 8; i++) {
      const a = 2 * Math.PI - aIn - ((2 * Math.PI - 2 * aIn) * i) / 8;
      const [x, y] = rot(d + rIn * Math.cos(a), rIn * Math.sin(a));
      crescent.push([x, y]);
    }
  }
  b.extrude(crescent, { at: [0, 2.545, -0.17], thickness: 0.03, bevel: 0.006, color: GOLD, bone: base, name: "finialMoon" });
  put("finialBall", GOLD, ball(0.026, [0, 2.46, -0.17], [1, 1, 1], 8, 6));
  glow(b.extrude(starOutline(0.032), { at: [0, 2.57, -0.17], thickness: 0.016, color: "#fff0a0", bone: base, name: "finialStar" }), 1.4);

  // =============================================================================================================
  // CABINET DOORS (hinged)
  // =============================================================================================================
  const archOutline = (w: number, h: number): Array<[number, number] | [number, number, "sharp"]> => [
    [-w / 2, 0],
    [w / 2, 0],
    [w / 2, h * 0.52],
    [w * 0.4, h * 0.7],
    [w * 0.22, h * 0.87],
    [0, h, "sharp"],
    [-w * 0.22, h * 0.87],
    [-w * 0.4, h * 0.7],
    [-w / 2, h * 0.52],
  ];
  for (const s of [1, -1]) {
    const door = s > 0 ? doorL : doorR;
    const cx = s * 0.355;
    put("door", WOOD_V, box(0.685, 0.385, 0.03, [s * 0.3575, 0.3625, 0.235]), { bone: door });
    // raised rails
    put("doorRail", WOOD_H, box(0.685, 0.03, 0.01, [s * 0.3575, 0.17 + 0.015, 0.2525]), { bone: door });
    put("doorRail", WOOD_H, box(0.685, 0.03, 0.01, [s * 0.3575, 0.555 - 0.015, 0.2525]), { bone: door });
    put("doorRail", WOOD_V, box(0.03, 0.385, 0.01, [s * 0.69 + (s > 0 ? -0.015 : 0.015), 0.3625, 0.2525]), { bone: door });
    put("doorRail", WOOD_V, box(0.03, 0.385, 0.01, [s * 0.02 + (s > 0 ? 0.0 : 0.0), 0.3625, 0.2525]), { bone: door });
    b.extrude(archOutline(0.5, 0.31), { at: [cx, 0.195, 0.253], x: [1, 0, 0], thickness: 0.012, bevel: 0.003, color: GOLD, bone: door, name: s > 0 ? "doorFrameL" : "doorFrameR" });
    b.extrude(archOutline(0.46, 0.285), { at: [cx, 0.2075, 0.2555], x: [1, 0, 0], thickness: 0.012, bevel: 0.003, color: SKY, bone: door, name: s > 0 ? "doorPanelL" : "doorPanelR" });
    put("emblem", "#ffffff", xf(new THREE.PlaneGeometry(0.2, 0.2), [cx, 0.34, 0.2625]), { bone: door, texture: s > 0 ? MOON_EMBLEM : SUN_EMBLEM, glow: 0.6 });
    // strap hinges with scrolled ends
    for (const hy of [0.235, 0.49]) {
      put("doorStrap", GOLD_DEEP, box(0.22, 0.028, 0.006, [s * 0.59, hy, 0.2565]), { bone: door });
      put("doorStrap", GOLD, ball(0.022, [s * 0.48, hy, 0.2565], [1, 1, 0.3], 8, 5), { bone: door });
      for (let k = 0; k < 3; k++) put("doorRivet", GOLD, ball(0.007, [s * (0.64 - k * 0.05), hy, 0.261], [1, 1, 0.7], 5, 4), { bone: door });
      put("hingeBarrel", GOLD, cyl(0.013, 0.013, 0.05, 6, [s * 0.7, hy, 0.235]), { bone: door });
    }
    // knob and star back-plate
    put("knob", GOLD, ball(0.02, [s * 0.05, 0.36, 0.285], [1, 1, 1], 8, 6), { bone: door });
    put("knob", GOLD, cyl(0.008, 0.008, 0.02, 6, [s * 0.05, 0.36, 0.272], [90, 0, 0]), { bone: door });
    glow(b.extrude(starOutline(0.036), { at: [s * 0.05, 0.36, 0.2605], thickness: 0.006, color: "#ffe27a", bone: door, name: s > 0 ? "knobStarL" : "knobStarR" }), 0.7);
  }

  // =============================================================================================================
  // SHELF 1 (floor 0.60)
  // =============================================================================================================
  const S1 = 0.6;
  row(0.685, 0.22, S1, 14);
  // bookend: gold star plate
  put("bookend", GOLD, box(0.09, 0.008, 0.14, [0.185, S1 + 0.004, 0.1]));
  b.extrude(starOutline(0.075), { at: [0.185, S1 + 0.1, 0.03], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.01, color: GOLD, bone: base, name: "bookendStar" });
  // cyan orb
  const o1 = orb(0.035, S1, 0.06, 0.082, ORB_CYAN, "Cyan");
  sparkle(0.12, o1 + 0.07, 0.1, 0.014, "#9ff6ff");
  sparkle(-0.05, o1 + 0.1, 0.12, 0.01, "#fff4a8");
  sparkle(0.09, o1 - 0.05, 0.14, 0.008, "#ffffff");
  // lying tomes with a candle on top
  const topY = stack(-0.27, S1, 0.04, 4, 0.3);
  dish(-0.27, topY, 0.06, 0.05);
  candle(-0.27, topY + 0.012, 0.06, 0.026, 0.1, WAX_IVORY, "Ivory", 5);
  // left cluster
  row(-0.685, -0.45, S1, 12);
  put("bookendB", GOLD, box(0.09, 0.008, 0.14, [-0.43, S1 + 0.004, 0.1]));
  b.extrude(starOutline(0.065), { at: [-0.43, S1 + 0.085, 0.03], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.01, color: GOLD, bone: base, name: "bookendStarB" });

  // =============================================================================================================
  // SHELF 2 (floor 1.02)
  // =============================================================================================================
  const S2 = 1.02;
  // scroll rack on the left
  {
    const rx = 0.515;
    const rw = 0.34;
    const rh = 0.345;
    const cw = rw / 3;
    const ch = rh / 3;
    const rz = 0.03;
    const rd = 0.3;
    for (let i = 0; i <= 3; i++) {
      put("rack", WOOD_LIGHT, box(0.01, rh, rd, [rx - rw / 2 + i * cw, S2 + rh / 2, rz]));
      put("rack", WOOD_LIGHT, box(rw, 0.01, rd, [rx, S2 + 0.005 + i * ch, rz]));
    }
    put("rackTrim", GOLD, box(rw + 0.01, 0.008, 0.008, [rx, S2 + rh + 0.004, rz + rd / 2 - 0.004]));
    const ribbons = [RIBBON_ROSE, RIBBON_TEAL, RIBBON_GOLD];
    let n = 0;
    for (let row_ = 0; row_ < 3; row_++)
      for (let col = 0; col < 3; col++) {
        const cxx = rx - rw / 2 + cw * (col + 0.5);
        const cyy = S2 + 0.01 + ch * (row_ + 0.5) - 0.003;
        n++;
        if (n === 4 || n === 8) continue;
        const len = 0.28 - R() * 0.05;
        const zc = rz + rd / 2 - len / 2 - 0.005 - R() * 0.01;
        const par = n % 2 ? PARCH : PARCH2;
        put(`scroll${n % 2}`, par, cyl(0.036, 0.036, len, 9, [cxx, cyy, zc], [90, 0, 0]));
        const zf = zc + len / 2;
        put("scrollEnd", "#ffffff", xf(new THREE.CircleGeometry(0.035, 12), [cxx, cyy, zf + 0.001]), { texture: SCROLL_END });
        put("scrollKnob", GOLD, cyl(0.014, 0.014, 0.02, 6, [cxx, cyy, zf + 0.008], [90, 0, 0]));
        put("scrollKnob", GOLD, ball(0.016, [cxx, cyy, zf + 0.02], [1, 1, 0.8], 6, 4));
        const rib = ribbons[(n + row_) % 3];
        put(`ribbon${(n + row_) % 3}`, rib, cyl(0.039, 0.039, 0.016, 9, [cxx, cyy, zc + len * 0.18], [90, 0, 0]));
        put("seal", CRIMSON_CLOTH, cyl(0.012, 0.012, 0.006, 8, [cxx, cyy + 0.0, zc + len * 0.18 + 0.001], [0, 0, 0]));
        put("ribbonTail", rib, box(0.012, 0.045, 0.004, [cxx + 0.006, cyy - 0.054, zc + len * 0.18 + 0.002], [0, 0, 8]));
      }
  }
  // books in the middle, candlestick
  row(0.325, 0.13, S2, 0, 0.32);
  {
    const x = 0.052;
    const z = 0.05;
    put(
      "candlestick",
      GOLD,
      turn(
        [
          [0, 0],
          [0.05, 0],
          [0.052, 0.012],
          [0.034, 0.024],
          [0.014, 0.034],
          [0.014, 0.06],
          [0.024, 0.07],
          [0.012, 0.08],
          [0.012, 0.1],
          [0.032, 0.115],
          [0.04, 0.128],
          [0.0, 0.128],
        ],
        8,
        [x, S2, z],
      ),
    );
    candle(x, S2 + 0.128, z, 0.02, 0.12, WAX_ROSE, "Rose", 4);
  }
  // open spellbook on a slanted lectern
  {
    const m0 = mat([-0.225, S2 + 0.0, 0.0], [-22, 0, 0]);
    const L = (g: THREE.BufferGeometry) => g.applyMatrix4(m0);
    put("lectern", WOOD_LIGHT, L(box(0.34, 0.26, 0.012, [0, 0.14, 0])));
    put("lectern", WOOD_LIGHT, L(box(0.34, 0.022, 0.05, [0, 0.036, 0.03])));
    put("lecternTrim", GOLD, L(box(0.346, 0.008, 0.054, [0, 0.05, 0.03])));
    put("lecternTrim", GOLD, L(box(0.346, 0.008, 0.016, [0, 0.272, 0])));
    // feet / prop
    put("lectern", WOOD_LIGHT, box(0.3, 0.012, 0.19, [-0.225, S2 + 0.006, 0.075]));
    for (const sx of [1, -1]) put("lectern", WOOD_LIGHT, box(0.012, 0.1, 0.012, [-0.225 + sx * 0.14, S2 + 0.06, -0.075], [0, 0, 0]));
    // covers and gold corners
    for (const sx of [1, -1]) {
      put("openCover", BOOK_PAINTS[0], L(box(0.165, 0.225, 0.008, [sx * 0.0825, 0.15, 0.01])));
      for (const cy of [0.04, 0.26]) for (const cx of [sx * 0.0075, sx * 0.158]) put("coverCorner", GOLD, L(box(0.016, 0.016, 0.0095, [cx, cy, 0.0105])));
    }
    // page blocks, fanned from the spine
    for (const sx of [1, -1]) {
      const ang = sx * 7;
      const bm = new THREE.Matrix4().multiplyMatrices(m0, mat([0, 0, 0], [0, ang, 0]));
      put("pageBlock", PAGES, box(0.145, 0.205, 0.024, [sx * 0.0725, 0.15, 0.026]).applyMatrix4(bm));
      put("pageBlock", PAGES, box(0.14, 0.2, 0.02, [sx * 0.0725, 0.15, 0.04]).applyMatrix4(bm));
      put("pageTex", "#ffffff", new THREE.PlaneGeometry(0.135, 0.19).translate(sx * 0.0725, 0.15, 0.0515).applyMatrix4(bm), {
        texture: sx > 0 ? PAGE_R : PAGE_L,
      });
    }
    put("bookmark", RIBBON_ROSE, L(box(0.014, 0.12, 0.003, [0.0, 0.01, 0.052], [0, 0, 3])));
    put("bookmark", RIBBON_ROSE, L(box(0.014, 0.12, 0.003, [0.0, 0.01, 0.052], [0, 0, 3])));
    // glowing rune circle above the right page
    const m1 = mat([-0.225 + 0.075, S2 + 0.185, 0.07], [-22, 0, 0]);
    put("runeCircle", "#ffffff", new THREE.PlaneGeometry(0.15, 0.15).applyMatrix4(m1), { texture: RUNE_CIRCLE, glow: 1.1 });
    sparkle(-0.12, S2 + 0.22, 0.1, 0.012, "#7ff6ea");
    sparkle(-0.3, S2 + 0.27, 0.08, 0.01, "#fff4a8");
    sparkle(-0.34, S2 + 0.2, 0.1, 0.008, "#bfa6ff");
  }
  // potion bottle and books on the left
  row(-0.685, -0.54, S2, 10, 0.3);
  {
    const x = -0.46;
    const z = 0.08;
    put(
      "potion",
      "#ff7fb4",
      turn(
        [
          [0, 0],
          [0.034, 0],
          [0.05, 0.02],
          [0.052, 0.05],
          [0.038, 0.08],
          [0.016, 0.1],
          [0.014, 0.14],
          [0.0, 0.14],
        ],
        8,
        [x, S2, z],
      ),
      { glow: 0.55, flat: true },
    );
    put("cork", cel("#c8935a"), cyl(0.014, 0.018, 0.03, 6, [x, S2 + 0.155, z]));
    put("potionCollar", GOLD, cyl(0.02, 0.02, 0.008, 8, [x, S2 + 0.138, z]));
    put("potionLabel", "#ffffff", xf(new THREE.PlaneGeometry(0.052, 0.065), [x, S2 + 0.04, z + 0.0525]), { texture: POTION_LABEL });
    sparkle(x + 0.06, S2 + 0.2, z + 0.04, 0.009, "#ffb0d8");
  }

  // =============================================================================================================
  // SHELF 3 (floor 1.44)
  // =============================================================================================================
  const S3 = 1.44;
  row(0.685, 0.43, S3, 0, 0.34);
  // hourglass
  {
    const x = 0.325;
    const z = 0.05;
    const gold = (g: THREE.BufferGeometry) => put("hourglass", GOLD, g);
    gold(cyl(0.056, 0.056, 0.014, 10, [x, S3 + 0.007, z]));
    gold(cyl(0.056, 0.056, 0.014, 10, [x, S3 + 0.213, z]));
    gold(cyl(0.046, 0.046, 0.008, 10, [x, S3 + 0.018, z]));
    gold(cyl(0.046, 0.046, 0.008, 10, [x, S3 + 0.202, z]));
    for (let i = 0; i < 4; i++) {
      const a = (i * 90 + 45) * DEG;
      gold(cyl(0.005, 0.005, 0.2, 5, [x + Math.sin(a) * 0.044, S3 + 0.11, z + Math.cos(a) * 0.044]));
    }
    // glass bulbs
    const glassP: Array<[number, number]> = [
      [0, 0.024],
      [0.04, 0.034],
      [0.044, 0.06],
      [0.03, 0.09],
      [0.006, 0.108],
      [0.03, 0.126],
      [0.044, 0.156],
      [0.04, 0.186],
      [0, 0.196],
    ];
    put("hourglassGlass", "#cdeef6", turn(glassP, 10, [x, S3, z]), { flat: true });
    // sand: lower mound and upper cone, slightly proud of the glass so it reads through it
    put("sand", cel("#f5c460"), turn([[0, 0.026], [0.039, 0.036], [0.042, 0.046], [0.02, 0.062], [0, 0.075]], 10, [x, S3, z]), {});
    put("sand", cel("#f5c460"), turn([[0, 0.138], [0.024, 0.16], [0.04, 0.17], [0.038, 0.186], [0, 0.19]], 10, [x, S3, z]), {});
    put("sand", cel("#f5c460"), cyl(0.002, 0.002, 0.04, 4, [x, S3 + 0.095, z]));
    sparkle(x + 0.07, S3 + 0.15, z + 0.05, 0.01, "#fff4a8");
  }
  // violet orb on a pedestal, with a halo ring
  {
    const oy = orb(0.0, S3, 0.04, 0.105, ORB_VIOLET, "Violet");
    put("halo", "#ffe27a", xf(new THREE.TorusGeometry(0.17, 0.005, 5, 28), [0, oy, 0.04], [72, 0, 14]), { glow: 1.3, flat: true });
    put("halo", "#ffe27a", xf(new THREE.TorusGeometry(0.15, 0.004, 5, 28), [0, oy, 0.04], [-60, 0, -24]), { glow: 1.3, flat: true });
    sparkle(0.16, oy + 0.02, 0.1, 0.015, "#fff4a8");
    sparkle(-0.15, oy + 0.08, 0.12, 0.012, "#ffd0ff");
    sparkle(0.05, oy + 0.17, 0.1, 0.01, "#9ff6ff");
    sparkle(-0.12, oy - 0.04, 0.14, 0.009, "#ffffff");
  }
  // inkwell, quill and a rolled scroll
  {
    const x = -0.26;
    const z = 0.1;
    put("inkwell", cel("#3b3a9a"), turn([[0, 0], [0.034, 0], [0.042, 0.016], [0.04, 0.04], [0.02, 0.054], [0.018, 0.062], [0, 0.062]], 8, [x, S3, z]));
    put("inkCap", GOLD, cyl(0.022, 0.022, 0.012, 8, [x, S3 + 0.066, z]));
    put("inkShine", "#ffffff", ball(0.006, [x - 0.02, S3 + 0.028, z + 0.036], [1, 1.6, 0.6], 5, 4));
    // quill: shaft + vane
    const qBase: V = [x + 0.004, S3 + 0.066, z];
    b.rod(qBase, [x + 0.075, S3 + 0.25, z - 0.03], 0.0035, { color: GOLD_DEEP, bone: base, name: "quillShaft" });
    b.extrude(
      [
        [0, 0],
        [0.014, 0.03],
        [0.022, 0.09],
        [0.012, 0.15],
        [0, 0.17, "sharp"],
        [-0.012, 0.14],
        [-0.02, 0.08],
        [-0.012, 0.03],
      ],
      { at: [x + 0.03, S3 + 0.12, z - 0.012], x: [0.37, 0, 0.1], y: [0.35, 0.9, -0.1], thickness: 0.004, smoothing: 1, color: cel("#f5f0ff", "#c9b8f0"), bone: base, name: "quillVane" },
    );
    const ma = mat([x - 0.1, S3 + 0.032, 0.09], [0, 20, 0]);
    put("scroll1", PARCH2, cyl(0.03, 0.03, 0.22, 9, [0, 0, 0], [0, 0, 90]).applyMatrix4(ma));
    put("scrollEnd", "#ffffff", xf(new THREE.CircleGeometry(0.029, 10), [0.111, 0, 0], [0, 90, 0]).applyMatrix4(ma), { texture: SCROLL_END });
    put("ribbon1", RIBBON_TEAL, cyl(0.033, 0.033, 0.016, 9, [0.04, 0, 0], [0, 0, 90]).applyMatrix4(ma));
  }
  row(-0.46, -0.685, S3, 13, 0.33);

  // =============================================================================================================
  // CORNICE TOP: candelabra, books, owl
  // =============================================================================================================
  const CT = 1.95;
  // candelabra on the left
  {
    const x = 0.5;
    const z = 0.12;
    put(
      "candelabra",
      GOLD,
      turn(
        [
          [0, 0],
          [0.07, 0],
          [0.075, 0.016],
          [0.04, 0.034],
          [0.016, 0.05],
          [0.016, 0.1],
          [0.03, 0.115],
          [0.014, 0.13],
          [0.014, 0.22],
          [0.026, 0.236],
          [0.0, 0.236],
        ],
        8,
        [x, CT, z],
      ),
    );
    for (const s of [1, -1]) {
      const path = catmull([
        [x, CT + 0.14, z],
        [x + s * 0.07, CT + 0.12, z],
        [x + s * 0.12, CT + 0.17, z],
        [x + s * 0.125, CT + 0.23, z],
      ]);
      b.sweep(path, 0.0075, { color: GOLD, bone: base, sides: 6, name: s > 0 ? "armL" : "armR" });
      dish(x + s * 0.125, CT + 0.218, z, 0.028);
      candle(x + s * 0.125, CT + 0.232, z, 0.016, 0.08, s > 0 ? WAX_TEAL : WAX_ROSE, s > 0 ? "Teal" : "Rose2", 3);
    }
    candle(x, CT + 0.236, z, 0.019, 0.13, WAX_IVORY, "Ivory", 4);
    sparkle(x - 0.04, CT + 0.45, z + 0.02, 0.01, "#fff4a8");
  }
  // owl on a pair of books on the right
  {
    const x = -0.46;
    const z = 0.1;
    const top = stack(x, CT, z, 2, 0.26);
    const oy = top;
    const OWL = cel(furEdge("#fff1ff", "#8a63d8", { axis: [0, 0, 1], level: 0.18, teeth: 0.22, period: 0.02, along: [1, 0, 0] }));
    const OWL_BACK = cel(mottle("#8a63d8", "#6d46c0", { size: 0.03, seed: 4 }));
    put("owlBody", OWL, ball(1, [x, oy + 0.085, z], [0.07, 0.092, 0.065], 10, 8));
    put("owlHead", OWL_BACK, ball(1, [x, oy + 0.19, z + 0.004], [0.072, 0.058, 0.058], 10, 8));
    put("owlFace", cel("#fff1ff"), ball(1, [x, oy + 0.186, z + 0.03], [0.058, 0.044, 0.03], 8, 6));
    for (const s of [1, -1]) {
      put("owlEar", OWL_BACK, xf(new THREE.ConeGeometry(0.02, 0.055, 5), [x + s * 0.052, oy + 0.245, z], [0, 0, -s * 22]));
      put("owlWing", OWL_BACK, ball(1, [x + s * 0.066, oy + 0.09, z - 0.008], [0.02, 0.07, 0.042], 7, 6, [0, 0, s * 8]));
      put("owlFoot", GOLD, box(0.022, 0.012, 0.03, [x + s * 0.026, oy + 0.006, z + 0.036]));
      put("owlEye", "#ffffff", xf(new THREE.CircleGeometry(0.026, 14), [x + s * 0.03, oy + 0.196, z + 0.0612], [0, s * 6, 0]), { texture: OWL_EYE });
      put("owlBrow", cel("#5c3a9e"), box(0.034, 0.008, 0.01, [x + s * 0.034, oy + 0.226, z + 0.042], [0, 0, s * 14]));
    }
    put("owlBeak", GOLD, xf(new THREE.ConeGeometry(0.011, 0.028, 4), [x, oy + 0.176, z + 0.068], [90, 0, 0]));
    put("owlTail", OWL_BACK, box(0.05, 0.05, 0.012, [x, oy + 0.02, z - 0.06], [-30, 0, 0]));
    // little gold scarf
    put("owlScarf", RIBBON_ROSE, xf(new THREE.TorusGeometry(0.056, 0.011, 5, 12), [x, oy + 0.15, z + 0.004], [90, 0, 0], [1, 0.9, 1]));
    put("owlScarf", RIBBON_ROSE, box(0.02, 0.05, 0.008, [x + 0.036, oy + 0.122, z + 0.052], [0, 0, 6]));
  }

  // =============================================================================================================
  // TASSELS under the shelves
  // =============================================================================================================
  {
    const { frame } = (() => {
      return { frame: (at: V, dir: V) => ({ at, dir }) };
    })();
    void frame;
  }

  // =============================================================================================================
  // HANGING LANTERN (left side) and BANNER (right side)
  // =============================================================================================================
  {
    const path = catmull([
      [0.76, 1.64, 0.05],
      [0.84, 1.62, 0.05],
      [0.96, 1.7, 0.05],
      [1.03, 1.78, 0.05],
    ]);
    b.sweep(path, 0.012, { color: GOLD, bone: base, sides: 6, name: "lanternArm" });
    put("armStar", GOLD, ball(0.026, [1.03, 1.8, 0.05], [1, 1, 1], 8, 6));
    put("armBrace", GOLD_DEEP, box(0.04, 0.1, 0.012, [0.78, 1.7, 0.05]));
    put("armBrace", GOLD_DEEP, box(0.04, 0.03, 0.012, [0.78, 1.57, 0.05]));
    put("armBrace", GOLD, ball(0.012, [0.78, 1.7, 0.058], [1, 1, 0.6], 6, 4));
    // chain
    for (let i = 0; i < 4; i++) {
      const y = 1.755 - i * 0.032;
      put("chain", GOLD_DEEP, xf(new THREE.TorusGeometry(0.01, 0.0035, 4, 8), [1.03, y, 0.05], [0, i % 2 ? 90 : 0, 0], [0.8, 1.5, 1]), { bone: lanternSwing });
    }
    const lx = 1.03;
    const lz = 0.05;
    const ly = 1.37; // lantern body centre
    const lb = { bone: lanternSwing };
    put("lanternCap", GOLD, turn([[0, 0], [0.07, 0], [0.056, 0.022], [0.02, 0.06], [0.008, 0.07], [0, 0.07]], 4, [lx, ly + 0.1, lz], [0, 45, 0]), lb);
    put("lanternCap", GOLD, ball(0.014, [lx, ly + 0.178, lz], [1, 1, 1], 6, 4), lb);
    put("lanternCap", GOLD, turn([[0, 0], [0.06, 0], [0.066, 0.01], [0.07, 0.022], [0, 0.022]], 4, [lx, ly - 0.135, lz], [0, 45, 0]), lb);
    put("lanternCap", GOLD, cyl(0.016, 0.004, 0.04, 5, [lx, ly - 0.16, lz]), lb);
    for (const sx of [1, -1]) for (const sz of [1, -1]) put("lanternPost", GOLD_DEEP, box(0.01, 0.23, 0.01, [lx + sx * 0.056, ly - 0.012, lz + sz * 0.056]), lb);
    put("lanternGlow", "#ffffff", box(0.1, 0.2, 0.1, [lx, ly - 0.012, lz]), { ...lb, texture: LANTERN_TEX, glow: 1.0 });
    for (const sx of [1, -1]) put("lanternTrim", GOLD, box(0.114, 0.008, 0.008, [lx, ly + 0.095 - 0.002, lz + sx * 0.056]), lb);
    for (const sx of [1, -1]) put("lanternTrim", GOLD, box(0.008, 0.008, 0.114, [lx + sx * 0.056, ly + 0.09, lz]), lb);
    put("lanternTassel", RIBBON_ROSE, cyl(0.004, 0.012, 0.05, 5, [lx, ly - 0.2, lz]), lb);
    put("lanternTassel", GOLD, ball(0.012, [lx, ly - 0.23, lz], [1, 1, 1], 6, 4), lb);
    sparkle(lx + 0.12, ly + 0.05, lz + 0.03, 0.011, "#fff4a8");
    sparkle(lx - 0.1, ly - 0.1, lz + 0.06, 0.009, "#ffd36a");

    // banner on the right: rod, finials, cloth, tassels
    const rodA: V = [-0.76, 1.74, 0.05];
    const rodB: V = [-1.1, 1.74, 0.05];
    b.rod(rodA, rodB, 0.009, { color: GOLD, bone: base, name: "bannerRod" });
    put("armStar", GOLD, ball(0.022, [-1.11, 1.74, 0.05], [1, 1, 1], 8, 6));
    put("armBrace", GOLD_DEEP, box(0.04, 0.09, 0.012, [-0.78, 1.7, 0.05]));
    put("armBrace", GOLD_DEEP, box(0.04, 0.03, 0.012, [-0.78, 1.64, 0.05]));
    const bannerPaint = paint((p) => {
      const lx2 = p.x + 0.97;
      const ly2 = p.y - 1.72;
      const border = Math.abs(lx2) > 0.092 || ly2 > -0.02 || (ly2 < -0.5 + Math.abs(lx2) * 0.55 + 0.03 && ly2 < -0.4);
      if (border) return "#ffd44f";
      const dm = Math.hypot(lx2, ly2 + 0.17);
      const dm2 = Math.hypot(lx2 - 0.022, ly2 + 0.155);
      if (dm < 0.055 && dm2 > 0.047) return "#ffd44f";
      const ds = Math.hypot(lx2 + 0.03, ly2 + 0.3);
      if (ds < 0.016) return "#fff4da";
      return "#2a8fb0";
    });
    const cloth: Array<[number, number] | [number, number, "sharp"]> = [
      [-0.1, 0],
      [0.1, 0],
      [0.1, -0.5, "sharp"],
      [0.0, -0.43, "sharp"],
      [-0.1, -0.5, "sharp"],
    ];
    b.extrude(cloth, { at: [-0.97, 1.72, 0.05], x: [1, 0, 0], thickness: 0.008, color: cel(bannerPaint), bone: bannerSwing, name: "banner" });
    for (let i = 0; i < 5; i++) put("bannerRing", GOLD, xf(new THREE.TorusGeometry(0.008, 0.0035, 4, 8), [-1.06 + i * 0.045, 1.74, 0.05], [0, 90, 0]), { bone: bannerSwing });
    for (const sx of [1, -1]) {
      put("bannerTassel", RIBBON_ROSE, cyl(0.003, 0.012, 0.06, 5, [-0.97 + sx * 0.1, 1.185, 0.05]), { bone: bannerSwing });
      put("bannerTassel", GOLD, ball(0.011, [-0.97 + sx * 0.1, 1.15, 0.05], [1, 1, 1], 6, 4), { bone: bannerSwing });
    }
  }

  // =============================================================================================================
  // FLOOR: starry rug, book pile, big candle
  // =============================================================================================================
  const rugC: V = [0, 0, 0.72];
  const rugPaint = paint((p) => {
    const dx = p.x - rugC[0];
    const dz = p.z - rugC[2];
    const r = Math.hypot(dx, dz);
    const a = Math.atan2(dz, dx);
    if (r > 0.9) return "#ffd44f";
    if (r > 0.86) return "#f0558a";
    if (r > 0.8) return "#ffd44f";
    if (r > 0.74) {
      const tooth = Math.abs(((a / (Math.PI * 2)) * 24) % 1);
      return tooth < 0.5 ? "#27c4c0" : "#1b8f97";
    }
    const star = 0.28 * (0.55 + 0.45 * Math.abs(Math.cos(4 * a)));
    if (r < star) return r < 0.07 ? "#fff4da" : "#ffd44f";
    if (r > 0.38 && r < 0.42) return "#ffd44f";
    const ring = 0.58 + 0.06 * Math.cos(8 * a);
    if (Math.abs(r - ring) < 0.012) return "#fff4da";
    return r > 0.42 ? mix("#35288a", "#44309e", noise(p, 0.12, 2)) : mix("#8c2850", "#a33566", noise(p, 0.1, 4));
  });
  put("rug", cel(rugPaint), cyl(0.92, 0.92, 0.014, 32, [rugC[0], 0.007, rugC[2]]));
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    put("rugFringe", cel("#fff4da"), box(0.012, 0.006, 0.05, [Math.sin(a) * 0.945 + rugC[0], 0.003, Math.cos(a) * 0.945 + rugC[2]], [0, a / DEG, 0]));
  }
  // book pile on the rug
  {
    const x = -0.52;
    const z = 0.78;
    const top = stack(x, 0.014, z, 5, 0.34);
    put("orbCup", GOLD, turn([[0, 0], [0.04, 0], [0.04, 0.01], [0.0, 0.012]], 8, [x, top, z]));
    sparkle(x + 0.1, top + 0.18, z + 0.04, 0.012, "#fff4a8");
    // an open scroll lying near the pile
    const sm = mat([-0.14, 0.014 + 0.032, 1.0], [0, -18, 0]);
    put("scroll0", PARCH, cyl(0.032, 0.032, 0.26, 9, [0, 0, 0], [0, 0, 90]).applyMatrix4(sm));
    put("scrollEnd", "#ffffff", xf(new THREE.CircleGeometry(0.031, 10), [0.131, 0, 0], [0, 90, 0]).applyMatrix4(sm), { texture: SCROLL_END });
    put("scrollEnd", "#ffffff", xf(new THREE.CircleGeometry(0.031, 10), [-0.131, 0, 0], [0, -90, 0]).applyMatrix4(sm), { texture: SCROLL_END });
    put("ribbon0", RIBBON_ROSE, cyl(0.035, 0.035, 0.016, 9, [0.05, 0, 0], [0, 0, 90]).applyMatrix4(sm));
    put("ribbon0", RIBBON_ROSE, cyl(0.035, 0.035, 0.016, 9, [-0.05, 0, 0], [0, 0, 90]).applyMatrix4(sm));
    put("seal", CRIMSON_CLOTH, cyl(0.014, 0.014, 0.006, 8, [0.05, 0.035, 0], [0, 0, 0]).applyMatrix4(sm));
  }
  // big floor candle
  {
    const x = 0.62;
    const z = 0.62;
    put(
      "floorHolder",
      GOLD,
      turn(
        [
          [0, 0],
          [0.12, 0],
          [0.125, 0.02],
          [0.1, 0.034],
          [0.07, 0.04],
          [0.0, 0.04],
        ],
        10,
        [x, 0.014, z],
      ),
    );
    candle(x, 0.054, z, 0.06, 0.34, WAX_IVORY, "Floor", 7);
    for (let i = 0; i < 6; i++) {
      const a = i * 60 * DEG;
      put("wax" + "Floor", WAX_IVORY, ball(0.016, [x + Math.sin(a) * 0.075, 0.062, z + Math.cos(a) * 0.075], [1.6, 0.5, 1.6], 6, 4));
    }
    sparkle(x + 0.1, 0.5, z, 0.012, "#fff4a8");
    sparkle(x - 0.08, 0.62, z + 0.04, 0.009, "#ffd36a");
  }

  // =============================================================================================================
  // TASSEL CARDS hanging from every shelf front
  // =============================================================================================================
  const tFrames = [];
  for (const y0 of [0.12, 0.56, 0.98, 1.4]) {
    for (let i = 0; i < 9; i++) tFrames.push({ x: -0.64 + i * 0.16, y: y0 });
  }
  void tFrames;

  // ---- flush every bucket into a part ---------------------------------------------------------------------
  for (const bk of buckets.values()) {
    const merged = mergeGeometries(bk.geos);
    if (!merged) throw new Error(`could not merge ${bk.name}`);
    const part = b.part(merged, bk.color, { bone: bk.bone, at: [0, 0, 0], texture: bk.texture, name: bk.name, flat: bk.flat });
    if (bk.glow) glow(part, bk.glow);
  }

  return b.root;
}
