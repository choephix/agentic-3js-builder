```ts
// STYLE: "NEON UKIYO-E" — a Hiroshige-style woodblock print rebuilt as a 3D shadowbox.
// The usual take on a rainy neon alley is glossy cyberpunk. This one is a night-rain woodblock print instead:
// flat ink-indigo planes, sumi key-lines on every block edge, posterised (stepped) colour washes where light
// spills, slanted hatch-line rain, a bokashi gradient sky on the backdrop, and a vermilion title cartouche with a
// seal. Only the neon, lanterns and windows glow, so they burn like fresh vermilion and pink ink against the
// indigo night. Every pale line and every glow is a woodblock colour.

import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  mix,
  noise,
  paint,
  resolve,
  rgb,
  smoothstep,
  cells,
  catmull,
  svg,
} from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Neon Ukiyo-e: Rainy Noodle Alley",
  description:
    "A woodblock-print shadowbox of a rainy neon alley: glowing ramen shop with noren, cook, customer and steaming pot, a umbrella walker, vending machine, fire escape, bar sign, lantern strings and slanted rain.",
};

type V = [number, number, number];
type C3 = readonly [number, number, number];
type Pt = [number, number, "sharp"];

// ------------------------------------------------------------------------------------------------ palette
const GY = 0.05; // street level
const INK = "#0d1030";
const PAPER = "#efe4c4";
const PLASTER = "#d8cba4";
const PRUSSIAN = "#2c4a96";
const LILAC = "#7f86b8";
const BRICK = "#7a3a36";
const WOOD = "#5a3326";
const WOOD_D = "#34201a";
const WOOD_L = "#a0693c";
const STEEL = "#8a97b8";
const STEEL_D = "#4b5680";
const VERMILION = "#e0432b";
const RED_D = "#a82a24";
const PINK = "#ff3d86";
const CYAN = "#3be3ff";
const AMBER = "#ffb53a";
const LANTERN = "#ff4a2e";
const SKIN = "#f0c49a";
const INDIGO = "#27409a";
const CRATE = "#c8962e";
const INK_RGB = rgb(INK);

// ------------------------------------------------------------------------------------------------ light spill
const LIGHTS: { p: THREE.Vector3; c: C3; r: number }[] = [
  { p: new THREE.Vector3(-0.29, 0.4, 0.3), c: rgb(AMBER), r: 0.3 },
  { p: new THREE.Vector3(-0.22, 0.62, 0.74), c: rgb(PINK), r: 0.4 },
  { p: new THREE.Vector3(-0.2, 0.66, -0.15), c: rgb(CYAN), r: 0.42 },
  { p: new THREE.Vector3(0.26, 0.15, 0.64), c: rgb("#bdeeff"), r: 0.24 },
  { p: new THREE.Vector3(0.28, 0.3, 0.33), c: rgb(AMBER), r: 0.22 },
];
const tmp = new THREE.Vector3();
/** Posterised neon spill: three hard steps of colour, like stacked woodblock impressions. */
function lit(p: THREE.Vector3, n: THREE.Vector3, c: C3): C3 {
  let out = c;
  for (const L of LIGHTS) {
    const d = p.distanceTo(L.p);
    if (d > L.r) continue;
    const t = Math.round((1 - smoothstep(0.03, L.r, d)) * 3) / 3;
    const f = 0.35 + 0.65 * Math.max(0, n.dot(tmp.copy(L.p).sub(p).normalize()));
    out = mix(out, L.c, 0.6 * t * f);
  }
  return out;
}

const q = new THREE.Vector3();
/** A block of wall: sumi key-line on every face edge, rain streaks, bokashi darkening toward the top. */
function inkPaint(base: ColorInput, dims: V, edge = 0.0035) {
  const [w, h, d] = dims;
  return paint((p, n, s) => {
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    const [fw, fh] = ax >= ay && ax >= az ? [d, h] : ay >= az ? [w, d] : [w, h];
    const e = Math.min(s[0] * fw, (1 - s[0]) * fw, s[1] * fh, (1 - s[1]) * fh);
    if (e < edge) return INK_RGB;
    const c = resolve(base, p, n);
    q.set(p.x * 7, p.y * 0.8, p.z * 7);
    const streak = smoothstep(0.55, 0.8, noise(q, 0.05, 7));
    const k = 1 - 0.1 * streak - 0.22 * smoothstep(0.2, 1.3, p.y);
    return lit(p, n, [c[0] * k, c[1] * k, c[2] * k]);
  });
}

const streetPaint = paint((p, n) => {
  const c = cells(p, 0.05, 4);
  if (c.d2 - c.d1 < 0.14) return lit(p, n, INK_RGB);
  const base = mix("#162052", "#2b3f82", c.id);
  const wet = smoothstep(0.55, 0.8, noise(p, 0.18, 9));
  return lit(p, n, mix(base, "#4f6bb8", wet * 0.5));
});

const roofPaint = paint((p, n) => {
  if (Math.abs(n.z) > 0.6) return lit(p, n, mix(PLASTER, INK, 0.35));
  const col = (p.z / 0.02) % 1 < 0.14 || (p.y / 0.03) % 1 < 0.07 ? INK_RGB : rgb("#2c3b78");
  const wet = n.y > 0.35 ? 0.35 * smoothstep(0.4, 0.75, noise(p, 0.05, 3)) : 0;
  return lit(p, n, mix(col, "#7f93d8", wet));
});

const shutterPaint = paint((p, n) => lit(p, n, (p.y / 0.012) % 1 < 0.25 ? rgb("#4a5680") : rgb("#8a97c0")));

const kimono = paint((p, n, s) => {
  const a = ((s[1] % 24) + 24) % 24;
  const hem = s[0] < 0.022;
  return lit(p, n, hem ? rgb(PAPER) : a < 3.2 ? rgb("#8ea8f0") : rgb(INDIGO));
});

function umbrellaPaint(center: THREE.Vector3, axis: THREE.Vector3) {
  const ax = axis.clone().normalize();
  return paint((p, n, s) => {
    const v = p.clone().sub(center);
    const along = v.dot(ax);
    const r = v.sub(ax.clone().multiplyScalar(along)).length();
    if (r < 0.012) return INK_RGB;
    if (((s[1] % 22.5) + 22.5) % 22.5 < 1.5) return lit(p, n, INK_RGB);
    if (r > 0.093 && r < 0.108) return lit(p, n, rgb(PAPER));
    if (r > 0.04 && r < 0.048) return lit(p, n, rgb(PAPER));
    return lit(p, n, rgb(VERMILION));
  });
}

// ------------------------------------------------------------------------------------------------ drawings
const GLYPH = {
  ra: "M30 20H70M22 44H78M64 44C62 70 46 80 26 86",
  me: "M72 22C64 58 44 74 22 84M28 40C46 52 62 66 76 82",
  n: "M26 28L38 40M28 80C58 70 74 50 78 20",
  dai: "M18 40H82M50 16C50 56 36 78 16 90M50 40C54 62 72 80 88 90",
};
const glyph = (d: string, x: number, y: number, s: number, stroke: string, w: number) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

const NEON_RAMEN = svg(
  `<svg viewBox="0 0 50 140" xmlns="http://www.w3.org/2000/svg">
  <rect x="1.5" y="1.5" width="47" height="137" rx="8" fill="#1b0f33"/>
  <rect x="4" y="4" width="42" height="132" rx="6" fill="none" stroke="${PINK}" stroke-width="3.4"/>
  <rect x="4" y="4" width="42" height="132" rx="6" fill="none" stroke="#ffe3ef" stroke-width="1.2"/>
  ${[GLYPH.ra, GLYPH.me, GLYPH.n].map((g, i) => glyph(g, 7, 12 + i * 41, 0.36, PINK, 11) + glyph(g, 7, 12 + i * 41, 0.36, "#ffe3ef", 4.2)).join("")}
  </svg>`,
  { size: 256 },
);

const BAR_SIGN = svg(
  `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="58" height="98" rx="6" fill="#0a1a30"/>
  <rect x="4" y="4" width="52" height="92" rx="4" fill="none" stroke="${CYAN}" stroke-width="3"/>
  <rect x="4" y="4" width="52" height="92" rx="4" fill="none" stroke="#e6fbff" stroke-width="1"/>
  <path d="M14 18 L46 18 L30 44 Z M30 44 V62 M20 62 H40" fill="none" stroke="${CYAN}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M14 18 L46 18 L30 44 Z M30 44 V62 M20 62 H40" fill="none" stroke="#e6fbff" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="38" cy="14" r="4" fill="${PINK}"/>
  <text x="30" y="90" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="24" fill="#e6fbff" stroke="${CYAN}" stroke-width="2">BAR</text>
  </svg>`,
  { size: 256 },
);

const panelX = [1, 26, 51, 76];
const NOREN = svg(
  `<svg viewBox="0 0 100 22" xmlns="http://www.w3.org/2000/svg">
  ${panelX.map((x) => `<rect x="${x}" y="3" width="23" height="19" fill="#1c2a66"/><rect x="${x}" y="18.4" width="23" height="3.6" fill="#e9e0c4"/>`).join("")}
  <rect x="0" y="0" width="100" height="3.6" fill="${INK}"/>
  ${[GLYPH.ra, GLYPH.me, GLYPH.n].map((g, i) => glyph(g, panelX[i] + 4.5, 4.2, 0.14, "#f1ead2", 11)).join("")}
  <circle cx="87.5" cy="11.2" r="5.2" fill="none" stroke="#f1ead2" stroke-width="1.5"/>
  <path d="M85 11 H90 M87.5 8.5 V13.5" stroke="#f1ead2" stroke-width="1.3"/>
  </svg>`,
  { size: 512 },
);

const shoji = (person: boolean) =>
  svg(
    `<svg viewBox="0 0 60 44" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.75"><stop offset="0" stop-color="#fff2b8"/><stop offset="1" stop-color="${AMBER}"/></radialGradient></defs>
  <rect width="60" height="44" fill="url(#g)"/>
  ${person ? `<g fill="#2a1830"><circle cx="22" cy="28" r="5.5"/><circle cx="22" cy="21" r="3"/><path d="M10 44 Q22 29 34 44Z"/></g>` : ""}
  <path d="M15 0V44M30 0V44M45 0V44M0 14.7H60M0 29.3H60" stroke="${INK}" stroke-width="1.7"/>
  <rect x="1.2" y="1.2" width="57.6" height="41.6" fill="none" stroke="${INK}" stroke-width="2.6"/>
  </svg>`,
    { size: 256 },
  );
const SHOJI = shoji(false);
const SHOJI_P = shoji(true);

const WIN_DARK = svg(
  `<svg viewBox="0 0 60 44" xmlns="http://www.w3.org/2000/svg">
  <rect width="60" height="44" fill="#1a2764"/>
  <polygon points="6,44 20,0 30,0 16,44" fill="#3a56a8"/><polygon points="34,44 44,0 50,0 40,44" fill="#2c4290"/>
  <path d="M0 22H60M30 0V44" stroke="${INK}" stroke-width="1.8"/>
  <rect x="1.2" y="1.2" width="57.6" height="41.6" fill="none" stroke="${INK}" stroke-width="2.6"/>
  </svg>`,
  { size: 192 },
);

const can = (x: number, y: number, c: string) => `<rect x="${x}" y="${y}" width="5" height="8" rx="1" fill="${c}" stroke="${INK}" stroke-width="0.7"/>`;
const VENDING = svg(
  `<svg viewBox="0 0 40 70" xmlns="http://www.w3.org/2000/svg">
  <rect width="40" height="70" fill="#d9f4ff"/>
  <rect x="0" y="0" width="40" height="7" fill="${VERMILION}"/>
  ${[0, 1, 2].map((r) => [0, 1, 2, 3, 4].map((c) => can(3.5 + c * 7, 11 + r * 14, ["#e0432b", "#2e6bd8", "#2fb26a", "#ffb53a", "#ff3d86"][(c + r * 2) % 5])).join("")).join("")}
  ${[0, 1, 2].map((r) => `<rect x="3" y="${20 + r * 14}" width="34" height="1.4" fill="${INK}" opacity="1"/>`).join("")}
  <rect x="5" y="54" width="30" height="11" rx="1.5" fill="${INK}"/>
  <rect x="31" y="46" width="5" height="5" fill="${AMBER}" stroke="${INK}" stroke-width="0.6"/>
  <rect x="1" y="1" width="38" height="68" fill="none" stroke="${INK}" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const PUDDLE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="c"><circle cx="50" cy="50" r="47"/></clipPath></defs>
  <circle cx="50" cy="50" r="49" fill="#2b3f86" stroke="${INK}" stroke-width="3"/>
  <g clip-path="url(#c)">
    <rect width="100" height="100" fill="#4a64b4"/>
    <path d="M30 0 Q36 24 28 46 T30 100" fill="none" stroke="${PINK}" stroke-width="9" stroke-linecap="round" stroke-dasharray="26 7"/>
    <path d="M56 0 Q50 30 58 52 T55 100" fill="none" stroke="${CYAN}" stroke-width="8" stroke-linecap="round" stroke-dasharray="20 8"/>
    <path d="M76 0 Q80 26 74 50 T77 100" fill="none" stroke="${AMBER}" stroke-width="7" stroke-linecap="round" stroke-dasharray="18 9"/>
    <g fill="none" stroke="#e6eeff" stroke-width="2">
      <ellipse cx="38" cy="62" rx="10" ry="4"/><ellipse cx="38" cy="62" rx="18" ry="7"/>
      <ellipse cx="68" cy="34" rx="8" ry="3"/><ellipse cx="68" cy="34" rx="15" ry="6"/>
    </g>
  </g></svg>`,
  { size: 256 },
);

const RAIN = svg(
  `<svg viewBox="0 0 8 64" xmlns="http://www.w3.org/2000/svg"><polygon points="4,0 8,56 4,64 0,56" fill="#b9c8f5"/></svg>`,
  { size: 64 },
);

const STEAM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <g fill="${INK}"><circle cx="22" cy="40" r="15.5"/><circle cx="41" cy="38" r="17.5"/><circle cx="31" cy="23" r="15.5"/></g>
  <g fill="#f6efdc"><circle cx="22" cy="40" r="14"/><circle cx="41" cy="38" r="16"/><circle cx="31" cy="23" r="14"/></g>
  <path d="M18 44 Q24 38 30 42 M36 36 Q42 30 48 36 M26 22 Q31 18 36 22" fill="none" stroke="#b9b2c8" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

const NOBORI = svg(
  `<svg viewBox="0 0 30 90" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="28" height="88" fill="${VERMILION}" stroke="${INK}" stroke-width="2"/>
  ${[GLYPH.ra, GLYPH.me, GLYPH.n].map((g, i) => glyph(g, 4, 6 + i * 28, 0.22, PAPER, 12)).join("")}
  </svg>`,
  { size: 192 },
);

const lanternGlyph = (g: string) =>
  svg(`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${glyph(g, 0, 0, 1, INK, 11)}</svg>`, { size: 128 });
const LG_RA = lanternGlyph(GLYPH.ra);
const LG_DAI = lanternGlyph(GLYPH.dai);

function makeBackdrop() {
  const rr = rng(77);
  let s = `<svg viewBox="0 0 124 152" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#090c2a"/><stop offset="0.4" stop-color="#18235e"/><stop offset="0.68" stop-color="#3b3a88"/>
    <stop offset="0.88" stop-color="#b9507f"/><stop offset="1" stop-color="#f08a6a"/></linearGradient></defs>
  <rect width="124" height="152" fill="url(#sky)"/>
  <path d="M0 26 Q30 18 60 26 T124 24 V38 Q90 44 60 38 T0 40Z" fill="#0c1240" opacity="0.55"/>
  <path d="M0 58 Q34 50 70 58 T124 56 V66 Q88 72 52 66 T0 68Z" fill="#1c2870" opacity="0.6"/>
  <path d="M0 84 Q28 78 64 84 T124 82 V90 Q90 95 56 90 T0 92Z" fill="#524a9a" opacity="0.55"/>`;
  for (let i = 0; i < 9; i++) {
    const x = i * 14 - 2;
    const h = 30 + rr() * 52;
    s += `<rect x="${x}" y="${152 - h}" width="14" height="${h}" fill="${i % 2 ? "#141c52" : "#0b1235"}" stroke="${INK}" stroke-width="0.8"/>`;
    for (let wy = 152 - h + 5; wy < 138; wy += 7)
      for (let wx = x + 2; wx < x + 12; wx += 4)
        if (rr() < 0.35) s += `<rect x="${wx}" y="${wy}" width="2.4" height="3" fill="${rr() < 0.7 ? "#ffd27a" : "#9fe8ff"}"/>`;
  }
  s += `<rect x="54" y="20" width="16" height="122" fill="#0a1030" stroke="${INK}" stroke-width="1"/>
  <path d="M56 40H68M56 60H68M56 80H68M56 100H68" stroke="#2c3a80" stroke-width="1.4"/>
  <circle cx="62" cy="15" r="2.4" fill="${VERMILION}"/><rect x="61.4" y="16" width="1.2" height="5" fill="${INK}"/>
  <rect x="42" y="68" width="9" height="28" fill="${PINK}" stroke="#ffe3ef" stroke-width="1"/>
  <rect x="75" y="58" width="9" height="24" fill="${CYAN}" stroke="#e6fbff" stroke-width="1"/>
  <rect x="0" y="138" width="124" height="14" fill="#f1a878"/><rect x="0" y="138" width="124" height="1.2" fill="${INK}"/>`;
  for (let i = 0; i < 7; i++) {
    const ux = 30 + i * 10 + rr() * 4;
    s += `<path d="M${ux - 4} 143 A4 4 0 0 1 ${ux + 4} 143Z" fill="${i % 2 ? VERMILION : "#2a3a8a"}" stroke="${INK}" stroke-width="0.7"/><rect x="${ux - 0.8}" y="143" width="1.6" height="7" fill="${INK}"/>`;
  }
  for (let i = 0; i < 70; i++) {
    const x = rr() * 130;
    const y = rr() * 150;
    s += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l-5 15" stroke="#a9b9ee" stroke-width="0.55" stroke-linecap="round"/>`;
  }
  s += `<rect x="98" y="5" width="19" height="40" fill="${VERMILION}" stroke="${INK}" stroke-width="1.2"/>
  ${[GLYPH.ra, GLYPH.me, GLYPH.n].map((g, i) => glyph(g, 102, 8 + i * 12, 0.11, PAPER, 14)).join("")}
  <rect x="104" y="48" width="9" height="9" fill="#c9312a" stroke="${INK}" stroke-width="0.8"/>${glyph(GLYPH.dai, 105, 49, 0.07, PAPER, 16)}
  <rect x="8" y="6" width="9" height="26" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>${glyph(GLYPH.dai, 9.5, 8, 0.07, INK, 13)}${glyph(GLYPH.n, 9.5, 18, 0.07, INK, 13)}
  </svg>`;
  return svg(s, { size: 1024 });
}
const BACKDROP = makeBackdrop();

// ------------------------------------------------------------------------------------------------ build
export default function build() {
  const b = createBuilder({ name: "neon-ukiyoe-noodle-alley", paintSize: 2048 });
  const R = rng(2024);

  type O = { rotation?: V; dir?: V; axis?: "x" | "y" | "z"; up?: V; scale?: V; texture?: THREE.Texture; flat?: boolean };

  const blk = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, base: ColorInput, edge?: number) => {
    const dims: V = [x1 - x0, y1 - y0, z1 - z0];
    return b.part(new THREE.BoxGeometry(...dims), inkPaint(base, dims, edge), {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    });
  };
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, color: string, o: O = {}) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), color, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
      ...o,
    });
  const cyl = (r0: number, r1: number, h: number, seg: number, color: string, at: V, o: O = {}) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { at, flat: true, ...o });
  const ball = (r: number, color: string, at: V, scale?: V, seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), color, { at, flat: true, ...(scale ? { scale } : {}) });
  const rod = (a: V, c: V, r: number, color: string) => b.rod(a, c, r, color, { sides: 6, smooth: false });
  const plane = (tex: THREE.Texture, w: number, h: number, at: V, dir: V, g = 0, up?: V) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...(up ? { up } : {}) });
    if (g > 0) glow(p, g);
    return p;
  };
  const wire = (a: V, c: V, sag = 0.03, r = 0.0018) =>
    b.sweep(catmull([a, [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2 - sag, (a[2] + c[2]) / 2], c]), r, { color: INK, sides: 4 });

  // ---- lantern (chochin): glowing paper body, ink ribs and caps, optional brush glyph
  const LP: [number, number][] = [
    [0, -0.032], [0.012, -0.032], [0.02, -0.026], [0.03, -0.012], [0.032, 0], [0.03, 0.012], [0.02, 0.026], [0.012, 0.032], [0, 0.032],
  ];
  const lantern = (x: number, y: number, z: number, k: number, strength = 1.3, g?: THREE.Texture, cord = 0.025) => {
    const body = glow(
      b.lathe(LP.map(([a, c]) => [a * k, c * k] as [number, number]), { at: [x, y, z], segments: 8, color: LANTERN }),
      strength,
    );
    for (const [dy, r] of [[0, 0.0325], [0.017, 0.0265], [-0.017, 0.0265]] as const)
      cyl(r * k + 0.0007, r * k + 0.0007, 0.0018 * k, 8, INK, [x, y + dy * k, z]);
    cyl(0.015 * k, 0.015 * k, 0.007 * k, 8, INK, [x, y + 0.035 * k, z]);
    cyl(0.015 * k, 0.015 * k, 0.007 * k, 8, INK, [x, y - 0.035 * k, z]);
    rod([x, y + 0.038 * k, z], [x, y + 0.038 * k + cord, z], 0.0013, INK);
    b.spike([x, y - 0.039 * k, z], [0, -1, 0], 0.03 * k, 0.003 * k, { color: PAPER });
    if (g) b.decal(body, g, { at: [x, y, z + 0.034 * k], dir: [0, 0, 1], size: [0.04 * k, 0.05 * k], segments: 6 });
  };

  // ---- window with frame, sill and glass
  const windowAt = (wallX: number, face: 1 | -1, y: number, z: number, isLit: boolean, person = false, w = 0.07, h = 0.1) => {
    const a = face > 0 ? wallX : wallX - 0.008;
    box(a, a + 0.008, y - h / 2 - 0.007, y + h / 2 + 0.007, z - w / 2 - 0.007, z + w / 2 + 0.007, WOOD_D);
    plane(isLit ? (person ? SHOJI_P : SHOJI) : WIN_DARK, w, h, [wallX + face * 0.0085, y, z], [face, 0, 0], isLit ? 0.9 : 0);
    const s0 = face > 0 ? wallX : wallX - 0.016;
    box(s0, s0 + 0.016, y - h / 2 - 0.012, y - h / 2 - 0.006, z - w / 2 - 0.012, z + w / 2 + 0.012, STEEL);
  };

  // ---- tile roof from a profile measured from the wall (u negative = toward the alley)
  const ROOF: Pt[] = [
    [-0.06, 0.04, "sharp"], [-0.03, 0, "sharp"], [0.36, 0, "sharp"], [0.39, 0.04, "sharp"],
    [0.28, 0.105, "sharp"], [0.165, 0.2, "sharp"], [0.05, 0.105, "sharp"],
  ];
  const roofAt = (wallX: number, away: 1 | -1, yBase: number, z0: number, z1: number) => {
    b.extrude(ROOF, { at: [wallX, yBase, (z0 + z1) / 2], x: [away, 0, 0], thickness: z1 - z0, color: roofPaint });
    rod([wallX + away * 0.165, yBase + 0.205, z0], [wallX + away * 0.165, yBase + 0.205, z1], 0.01, INK);
    for (const z of [z0, z1]) box(wallX + away * 0.165 - 0.014, wallX + away * 0.165 + 0.014, yBase + 0.2, yBase + 0.235, z - 0.006, z + 0.006, INK);
  };

  // ================================================================== TRAY, STREET, BACKDROP
  b.part(new THREE.BoxGeometry(1.28, 0.04, 1.74), inkPaint(WOOD_D, [1.28, 0.04, 1.74], 0.004), { at: [0, 0.02, 0] });
  b.part(new THREE.BoxGeometry(1.24, 0.012, 1.7), streetPaint, { at: [0, 0.044, 0] });
  blk(-0.64, 0.64, 0, 1.6, -0.9, -0.872, WOOD_D);
  plane(BACKDROP, 1.24, 1.52, [0, GY + 0.76, -0.868], [0, 0, 1], 0.55);

  const puddles: [number, number, number, number][] = [
    [0.04, 0.52, 0.13, 0.07], [-0.1, -0.18, 0.1, 0.19], [0.12, -0.45, 0.09, 0.12], [-0.02, 0.74, 0.17, 0.06], [0.1, 0.1, 0.08, 0.05],
  ];
  for (const [x, z, rx, rz] of puddles)
    glow(
      b.part(new THREE.CircleGeometry(1, 14), "#ffffff", {
        at: [x, GY + 0.0035, z], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], scale: [rx, rz, 1], texture: PUDDLE,
      }),
      0.7,
    );
  // gutter grate down the middle
  box(-0.012, 0.012, GY, GY + 0.002, -0.8, 0.8, INK);

  // ================================================================== NOODLE SHOP (left, faces +X)
  const SX0 = -0.62;
  const SXF = -0.3;
  blk(SX0, SXF, GY, GY + 0.02, 0.12, 0.8, WOOD);
  glow(box(SX0, SX0 + 0.02, GY + 0.02, 0.45, 0.14, 0.78, "#f4a640"), 0.9);
  blk(SX0, SXF, GY, 0.45, 0.12, 0.14, PLASTER);
  blk(SX0, SXF, GY, 0.45, 0.78, 0.8, PLASTER);
  blk(SX0, SXF + 0.01, 0.45, 0.74, 0.12, 0.8, PLASTER);
  box(SXF - 0.015, SXF + 0.01, 0.41, 0.455, 0.12, 0.8, WOOD_D);
  box(SXF - 0.012, SXF + 0.008, GY, 0.45, 0.12, 0.15, WOOD_D);
  box(SXF - 0.012, SXF + 0.008, GY, 0.45, 0.77, 0.8, WOOD_D);
  // counter
  blk(-0.4, -0.28, GY, 0.2, 0.17, 0.74, WOOD);
  blk(-0.41, -0.265, 0.2, 0.213, 0.16, 0.75, WOOD_L);
  box(-0.2805, -0.2785, 0.1, 0.17, 0.17, 0.74, VERMILION);
  // noren curtain
  plane(NOREN, 0.52, 0.114, [SXF + 0.012, 0.385, 0.46], [1, 0, 0]);
  // hisashi eave and roof
  b.extrude([[0, 0, "sharp"], [-0.09, 0, "sharp"], [-0.105, 0.02, "sharp"], [0, 0.045, "sharp"]] as Pt[], {
    at: [SXF + 0.01, 0.455, 0.46], x: [-1, 0, 0], thickness: 0.7, color: roofPaint,
  });
  roofAt(SXF + 0.01, -1, 0.73, 0.1, 0.82);
  // vent stack with steam
  box(-0.58, -0.54, 0.84, 0.95, 0.2, 0.24, STEEL_D);
  box(-0.585, -0.535, 0.95, 0.97, 0.195, 0.245, INK);

  // upper windows
  windowAt(SXF + 0.01, 1, 0.6, 0.28, true, true, 0.2, 0.15);
  windowAt(SXF + 0.01, 1, 0.6, 0.52, true, false, 0.2, 0.15);
  box(SXF + 0.01, SXF + 0.03, 0.455, 0.462, 0.17, 0.75, WOOD_D);

  // neon ramen sign
  box(-0.292, -0.218, 0.515, 0.735, 0.731, 0.749, INK);
  plane(NEON_RAMEN, 0.078, 0.218, [-0.255, 0.625, 0.7495], [0, 0, 1], 1.4);
  plane(NEON_RAMEN, 0.078, 0.218, [-0.255, 0.625, 0.7305], [0, 0, -1], 1.4);
  rod([-0.29, 0.7, 0.74], [-0.222, 0.7, 0.74], 0.003, INK);
  rod([-0.29, 0.55, 0.74], [-0.222, 0.55, 0.74], 0.003, INK);

  // nobori banner
  rod([-0.2, GY, 0.64], [-0.2, 0.4, 0.64], 0.003, WOOD_D);
  rod([-0.2, 0.395, 0.64], [-0.2, 0.395, 0.7], 0.0025, WOOD_D);
  plane(NOBORI, 0.05, 0.15, [-0.2, 0.32, 0.6965], [0, 0, 1]);
  plane(NOBORI, 0.05, 0.15, [-0.2, 0.32, 0.6935], [0, 0, -1]);

  // hanging lanterns under the eave
  lantern(-0.25, 0.4, 0.17, 1.15, 1.4, LG_RA, 0.05);
  lantern(-0.25, 0.4, 0.75, 1.15, 1.4, LG_DAI, 0.05);
  // bare bulb inside
  rod([-0.45, 0.45, 0.45], [-0.45, 0.405, 0.45], 0.0012, INK);
  glow(ball(0.012, "#fff2b0", [-0.45, 0.395, 0.45]), 2);

  // shelf and bottles
  box(SX0 + 0.02, SX0 + 0.07, 0.29, 0.296, 0.2, 0.72, WOOD_D);
  for (let i = 0; i < 9; i++) {
    const z = 0.22 + i * 0.058;
    cyl(0.009, 0.009, 0.04, 6, i % 3 === 0 ? "#3a8a5a" : i % 3 === 1 ? "#8a5a2a" : "#5a74c8", [SX0 + 0.045, 0.316, z]);
    cyl(0.004, 0.004, 0.014, 6, INK, [SX0 + 0.045, 0.343, z]);
  }
  // cook
  cyl(0.03, 0.04, 0.2, 8, PAPER, [-0.5, 0.15, 0.42]);
  ball(0.027, SKIN, [-0.5, 0.282, 0.42]);
  cyl(0.0285, 0.0285, 0.008, 8, "#f4f0e2", [-0.5, 0.294, 0.42]);
  box(-0.53, -0.522, 0.288, 0.3, 0.41, 0.43, "#f4f0e2");
  ball(0.0035, INK, [-0.4745, 0.283, 0.411], undefined, 5);
  ball(0.0035, INK, [-0.4745, 0.283, 0.429], undefined, 5);
  rod([-0.49, 0.235, 0.39], [-0.37, 0.228, 0.31], 0.009, PAPER);
  rod([-0.49, 0.235, 0.45], [-0.37, 0.228, 0.38], 0.009, PAPER);
  ball(0.009, SKIN, [-0.365, 0.228, 0.31], undefined, 6);
  ball(0.009, SKIN, [-0.365, 0.228, 0.38], undefined, 6);

  // pot on a burner
  box(-0.385, -0.315, 0.213, 0.222, 0.585, 0.655, INK);
  cyl(0.04, 0.036, 0.05, 10, STEEL, [-0.35, 0.247, 0.62]);
  cyl(0.036, 0.036, 0.003, 10, "#f0e0b0", [-0.35, 0.272, 0.62]);
  cyl(0.042, 0.042, 0.005, 10, INK, [-0.35, 0.274, 0.62]);
  b.cards(
    [[-0.35, 0.28, 0.62], [-0.34, 0.33, 0.63], [-0.32, 0.37, 0.6], [-0.27, 0.4, 0.62], [-0.24, 0.3, 0.58]].map((p) => frame(p as V, [0, 1, 0])),
    STEAM, { size: [0.055, 0.055], vary: 0.3, rng: R },
  );
  b.cards([-0.56, 0.98, 0.22], STEAM.constructor === Object ? STEAM : STEAM, { size: 0.05 });
  b.cards([frame([-0.56, 0.975, 0.22], [0, 1, 0]), frame([-0.55, 1.03, 0.23], [0, 1, 0]), frame([-0.52, 1.08, 0.22], [0, 1, 0])], STEAM, {
    size: [0.06, 0.06], vary: 0.25, rng: R,
  });

  // bowls
  const BOWL: [number, number][] = [[0, 0], [0.011, 0], [0.015, 0.005], [0.03, 0.025], [0.027, 0.027], [0.012, 0.011], [0, 0.011]];
  const bowl = (x: number, z: number) => {
    const y0 = 0.213;
    b.lathe(BOWL, { at: [x, y0, z], segments: 8, color: "#cf3a2c" });
    cyl(0.0305, 0.0305, 0.003, 8, PAPER, [x, y0 + 0.0245, z]);
    cyl(0.026, 0.026, 0.003, 8, "#f2d98a", [x, y0 + 0.0235, z]);
    cyl(0.007, 0.007, 0.002, 8, "#f4f0e6", [x + 0.01, y0 + 0.026, z + 0.008]);
    ball(0.007, "#f7edd0", [x - 0.009, y0 + 0.027, z - 0.006], [1, 0.6, 1], 6);
    box(x + 0.004, x + 0.006, y0 + 0.024, y0 + 0.04, z - 0.012, z + 0.002, "#1d3d2c");
    box(x - 0.012, x - 0.008, y0 + 0.025, y0 + 0.028, z + 0.008, z + 0.016, "#4aa860");
    b.cards([frame([x, y0 + 0.03, z], [0, 1, 0])], STEAM, { size: 0.03 });
  };
  bowl(-0.33, 0.3);
  bowl(-0.31, 0.46);
  bowl(-0.3, 0.7);

  // stools and customer
  const stool = (x: number, z: number) => {
    cyl(0.03, 0.03, 0.014, 8, VERMILION, [x, 0.133, z]);
    cyl(0.033, 0.033, 0.004, 8, INK, [x, 0.124, z]);
    for (let i = 0; i < 3; i++) {
      const a = i * 2.094 + 0.5;
      rod([x + Math.cos(a) * 0.012, 0.124, z + Math.sin(a) * 0.012], [x + Math.cos(a) * 0.03, GY, z + Math.sin(a) * 0.03], 0.0035, WOOD_D);
    }
  };
  stool(-0.19, 0.28);
  stool(-0.19, 0.46);
  stool(-0.19, 0.64);
  cyl(0.028, 0.032, 0.12, 8, INDIGO, [-0.2, 0.2, 0.46]);
  ball(0.022, SKIN, [-0.212, 0.285, 0.46]);
  b.part(new THREE.ConeGeometry(0.045, 0.03, 8), "#d8b268", { at: [-0.212, 0.318, 0.46], flat: true });
  box(-0.275, -0.19, 0.15, 0.17, 0.44, 0.48, INDIGO);
  box(-0.27, -0.25, GY + 0.01, 0.16, 0.44, 0.48, INDIGO);
  rod([-0.205, 0.24, 0.435], [-0.31, 0.226, 0.45], 0.008, INDIGO);
  rod([-0.205, 0.24, 0.485], [-0.31, 0.226, 0.47], 0.008, INDIGO);

  // ================================================================== REAR LEFT BUILDING (bar)
  blk(-0.62, -0.3, GY, 1.02, -0.72, 0.08, PRUSSIAN);
  b.part(new THREE.BoxGeometry(0.004, 0.2, 0.3), shutterPaint, { at: [-0.298, GY + 0.1, -0.5] });
  box(-0.3, -0.294, GY, 0.25, -0.1, 0.0, VERMILION);
  glow(box(-0.294, -0.292, 0.12, 0.2, -0.08, -0.02, AMBER), 1);
  lantern(-0.262, 0.28, -0.115, 0.8, 1.3, LG_DAI, 0.0);
  for (const y of [0.3, 0.52, 0.74, 0.96]) box(-0.3, -0.288, y, y + 0.012, -0.72, 0.08, STEEL_D);
  for (const y of [0.4, 0.62, 0.84])
    for (const z of [-0.62, -0.46, -0.3, 0.0]) windowAt(-0.3, 1, y, z, R() < 0.55, R() < 0.2);
  for (const [z, y] of [[-0.54, 0.51], [-0.38, 0.73]] as const) {
    box(-0.3, -0.268, y - 0.02, y + 0.02, z - 0.03, z + 0.03, "#c9d0e6");
    box(-0.268, -0.265, y - 0.015, y + 0.015, z - 0.022, z + 0.022, INK);
  }
  rod([-0.294, GY, 0.07], [-0.294, 1.0, 0.07], 0.006, STEEL);
  // BAR neon sign
  box(-0.302, -0.15, 0.535, 0.785, -0.159, -0.141, INK);
  plane(BAR_SIGN, 0.15, 0.25, [-0.226, 0.66, -0.1395], [0, 0, 1], 1.3);
  plane(BAR_SIGN, 0.15, 0.25, [-0.226, 0.66, -0.1605], [0, 0, -1], 1.3);
  // roof and tank
  blk(-0.62, -0.3, 1.02, 1.05, -0.72, 0.08, STEEL_D);
  cyl(0.045, 0.045, 0.085, 8, WOOD, [-0.5, 1.1, -0.4]);
  b.part(new THREE.ConeGeometry(0.052, 0.03, 8), INK, { at: [-0.5, 1.168, -0.4], flat: true });
  for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) rod([-0.5 + dx * 0.035, 1.05, -0.4 + dz * 0.035], [-0.5 + dx * 0.035, 1.07, -0.4 + dz * 0.035], 0.004, INK);
  rod([-0.4, 1.05, -0.2], [-0.4, 1.2, -0.2], 0.0025, INK);
  rod([-0.43, 1.17, -0.2], [-0.37, 1.17, -0.2], 0.0025, INK);
  rod([-0.425, 1.13, -0.2], [-0.375, 1.13, -0.2], 0.0025, INK);

  // ================================================================== RIGHT FRONT BLOCK (izakaya)
  blk(0.3, 0.62, GY, 0.3, 0.12, 0.8, WOOD);
  blk(0.3, 0.62, 0.3, 0.62, 0.12, 0.8, PLASTER);
  roofAt(0.3, 1, 0.6, 0.1, 0.82);
  plane(SHOJI, 0.17, 0.2, [0.2985, GY + 0.105, 0.34], [-1, 0, 0], 0.9);
  box(0.292, 0.3, GY, GY + 0.215, 0.24, 0.255, WOOD_D);
  box(0.292, 0.3, GY, GY + 0.215, 0.425, 0.44, WOOD_D);
  box(0.292, 0.3, GY + 0.205, GY + 0.222, 0.24, 0.44, WOOD_D);
  plane(NOREN, 0.17, 0.037, [0.2965, GY + 0.185, 0.34], [-1, 0, 0]);
  lantern(0.27, 0.19, 0.22, 0.95, 1.4, LG_DAI, 0.03);
  lantern(0.27, 0.19, 0.46, 0.95, 1.4, LG_RA, 0.03);
  box(0.3, 0.3 + 0.012, 0.3, 0.308, 0.12, 0.8, STEEL_D);
  windowAt(0.3, -1, 0.46, 0.26, true, false, 0.12, 0.1);
  windowAt(0.3, -1, 0.46, 0.5, true, true, 0.12, 0.1);
  windowAt(0.3, -1, 0.46, 0.7, false, false, 0.12, 0.1);
  // vending machine
  box(0.248, 0.3, GY, GY + 0.145, 0.605, 0.675, "#27407a");
  box(0.245, 0.3, GY + 0.145, GY + 0.155, 0.6, 0.68, INK);
  plane(VENDING, 0.056, 0.098, [0.2475, GY + 0.085, 0.64], [-1, 0, 0], 1);
  // crates and cat
  box(0.255, 0.295, GY, GY + 0.05, 0.49, 0.55, CRATE);
  box(0.255, 0.295, GY + 0.05, GY + 0.1, 0.49, 0.55, "#b0801f");
  box(0.254, 0.296, GY + 0.045, GY + 0.055, 0.488, 0.552, WOOD_D);
  ball(0.02, INK, [0.275, 0.17, 0.52], [1, 1.15, 1.1]);
  ball(0.014, INK, [0.262, 0.202, 0.52]);
  b.spike([0.264, 0.212, 0.51], [0, 1, 0], 0.014, 0.006, { color: INK });
  b.spike([0.264, 0.212, 0.53], [0, 1, 0], 0.014, 0.006, { color: INK });
  glow(ball(0.0033, "#ffe45a", [0.2495, 0.204, 0.513], undefined, 5), 2);
  glow(ball(0.0033, "#ffe45a", [0.2495, 0.204, 0.527], undefined, 5), 2);
  b.sweep(catmull([[0.29, 0.155, 0.52], [0.296, 0.152, 0.55], [0.28, 0.152, 0.57], [0.262, 0.16, 0.565]]), [0.006, 0.003], { color: INK, sides: 5 });

  // ================================================================== RIGHT REAR BLOCK (apartments + fire escape)
  blk(0.3, 0.62, GY, 1.18, -0.72, 0.12, LILAC);
  b.part(new THREE.BoxGeometry(0.004, 0.2, 0.3), shutterPaint, { at: [0.302, GY + 0.1, -0.55] });
  box(0.294, 0.3, GY, 0.22, -0.02, 0.09, VERMILION);
  lantern(0.27, 0.2, 0.02, 0.8, 1.3, undefined, 0.02);
  for (const y of [0.4, 0.62, 0.84, 1.06])
    for (const z of [-0.62, -0.46, 0.03]) windowAt(0.3, -1, y, z, R() < 0.5, R() < 0.2);
  const FLOORS = [0.31, 0.53, 0.75, 0.97];
  for (const y of FLOORS) {
    box(0.24, 0.3, y - 0.006, y, -0.33, -0.07, STEEL_D);
    rod([0.241, y + 0.05, -0.33], [0.241, y + 0.05, -0.07], 0.0035, STEEL_D);
    for (const z of [-0.33, -0.25, -0.17, -0.07]) rod([0.242, y, z], [0.242, y + 0.05, z], 0.003, STEEL_D);
  }
  for (let i = 0; i < 3; i++) {
    const zA = i % 2 === 0 ? -0.09 : -0.31;
    const zB = i % 2 === 0 ? -0.31 : -0.09;
    rod([0.25, FLOORS[i], zA], [0.25, FLOORS[i + 1], zB], 0.004, STEEL_D);
    rod([0.245, FLOORS[i] + 0.05, zA], [0.245, FLOORS[i + 1] + 0.05, zB], 0.003, STEEL_D);
    for (let k = 1; k < 7; k++) {
      const t = k / 7;
      box(0.25, 0.3, FLOORS[i] + (FLOORS[i + 1] - FLOORS[i]) * t - 0.002, FLOORS[i] + (FLOORS[i + 1] - FLOORS[i]) * t + 0.002, zA + (zB - zA) * t - 0.011, zA + (zB - zA) * t + 0.011, STEEL);
    }
  }
  rod([0.25, GY, -0.12], [0.25, FLOORS[0], -0.12], 0.003, STEEL_D);
  rod([0.25, GY, -0.06], [0.25, FLOORS[0], -0.06], 0.003, STEEL_D);
  for (let k = 1; k < 6; k++) rod([0.25, GY + k * 0.043, -0.12], [0.25, GY + k * 0.043, -0.06], 0.002, STEEL_D);
  blk(0.3, 0.62, 1.18, 1.21, -0.72, 0.12, STEEL_D);
  cyl(0.055, 0.055, 0.1, 8, WOOD, [0.5, 1.27, -0.45]);
  b.part(new THREE.ConeGeometry(0.062, 0.035, 8), INK, { at: [0.5, 1.345, -0.45], flat: true });
  for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) rod([0.5 + dx * 0.04, 1.21, -0.45 + dz * 0.04], [0.5 + dx * 0.04, 1.22, -0.45 + dz * 0.04], 0.004, INK);
  box(0.4, 0.46, 1.21, 1.26, -0.1, 0.0, "#c9d0e6");

  // ================================================================== BICYCLE
  const wheel = (z: number) => {
    b.part(new THREE.TorusGeometry(0.05, 0.004, 5, 14), INK, { at: [0.27, GY + 0.054, z], rotation: [0, 90, 0], flat: true });
    rod([0.27, GY + 0.054, z - 0.05], [0.27, GY + 0.054, z + 0.05], 0.0012, STEEL);
    rod([0.27, GY + 0.004, z], [0.27, GY + 0.104, z], 0.0012, STEEL);
  };
  wheel(-0.62);
  wheel(-0.48);
  const R_: V = [0.27, GY + 0.054, -0.62];
  const F_: V = [0.27, GY + 0.054, -0.48];
  const BB: V = [0.27, GY + 0.04, -0.57];
  const ST: V = [0.27, GY + 0.115, -0.597];
  const HD: V = [0.27, GY + 0.108, -0.5];
  for (const [a, c] of [[R_, BB], [R_, ST], [BB, ST], [ST, HD], [BB, HD], [HD, F_]] as [V, V][]) rod(a, c, 0.0028, VERMILION);
  rod(HD, [0.27, GY + 0.125, -0.505], 0.003, INK);
  rod([0.256, GY + 0.126, -0.505], [0.284, GY + 0.126, -0.505], 0.003, INK);
  box(0.264, 0.276, GY + 0.117, GY + 0.122, -0.61, -0.585, INK);
  box(0.258, 0.282, GY + 0.1, GY + 0.126, -0.465, -0.44, WOOD_L);

  // ================================================================== UTILITY POLE AND WIRES
  cyl(0.006, 0.01, 1.1, 6, WOOD_D, [0.255, GY + 0.55, 0.08]);
  box(0.2, 0.31, 1.0, 1.012, 0.074, 0.086, WOOD_D);
  for (const x of [0.21, 0.255, 0.3]) cyl(0.0035, 0.0035, 0.012, 5, "#c9d0e6", [x, 1.018, 0.08]);
  cyl(0.02, 0.02, 0.05, 8, STEEL_D, [0.235, 0.9, 0.08]);
  wire([0.21, 1.02, 0.08], [-0.3, 0.9, 0.0], 0.04);
  wire([0.255, 1.02, 0.08], [-0.29, 0.72, 0.5], 0.04);
  wire([0.3, 1.02, 0.08], [0.3, 1.1, -0.5], 0.02);
  wire([0.255, 1.0, 0.08], [-0.3, 0.8, -0.4], 0.05);

  // lantern string across the alley
  const strand = catmull([[-0.3, 0.8, 0.02], [0, 0.762, 0.02], [0.3, 0.84, 0.02]]);
  b.sweep(strand, 0.0015, { color: INK, sides: 4 });
  b.along(strand, 7, (at) => lantern(at.at.x, at.at.y - 0.03, at.at.z, 0.55, 1.2, undefined, 0.012), { from: 0.08, to: 0.92 });

  // ================================================================== THE WALKER WITH THE UMBRELLA
  const WX = 0.02;
  const WZ = 0.3;
  box(WX - 0.022, WX - 0.004, GY, GY + 0.012, WZ - 0.014, WZ + 0.016, WOOD_D);
  box(WX + 0.004, WX + 0.022, GY, GY + 0.012, WZ - 0.014, WZ + 0.016, WOOD_D);
  b.lathe([[0, 0], [0.02, 0], [0.028, 0.01], [0.03, 0.04], [0.026, 0.12], [0.02, 0.15], [0, 0.15]], {
    at: [WX, GY + 0.012, WZ], segments: 10, color: kimono,
  });
  cyl(0.0275, 0.0275, 0.03, 10, RED_D, [WX, GY + 0.162, WZ]);
  box(WX - 0.017, WX + 0.017, GY + 0.145, GY + 0.185, WZ + 0.02, WZ + 0.034, VERMILION);
  ball(0.021, SKIN, [WX, GY + 0.188, WZ]);
  ball(0.0235, INK, [WX, GY + 0.193, WZ + 0.005]);
  ball(0.009, INK, [WX, GY + 0.222, WZ + 0.012], undefined, 6);
  rod([WX + 0.003, GY + 0.22, WZ + 0.012], [WX + 0.02, GY + 0.232, WZ + 0.012], 0.0015, "#ffd27a");
  rod([WX + 0.028, GY + 0.15, WZ], [WX + 0.036, GY + 0.172, WZ - 0.014], 0.008, INDIGO);
  ball(0.007, SKIN, [WX + 0.037, GY + 0.176, WZ - 0.016], undefined, 6);
  const uAxis = new THREE.Vector3(0.3, 1, -0.1).normalize();
  const uBase = new THREE.Vector3(WX + 0.037, GY + 0.255, WZ - 0.016);
  b.lathe([[0, 0.075], [0.05, 0.054], [0.115, 0.003], [0.113, -0.002], [0.05, 0.044], [0, 0.062]], {
    at: uBase.toArray() as V, axis: uAxis.toArray() as V, segments: 16, color: umbrellaPaint(uBase, uAxis),
  });
  const shaftLo = uBase.clone().addScaledVector(uAxis, -0.085).toArray() as V;
  const shaftHi = uBase.clone().addScaledVector(uAxis, 0.095).toArray() as V;
  rod(shaftLo, shaftHi, 0.0025, WOOD);
  b.spike(shaftHi, uAxis.toArray() as V, 0.02, 0.003, { color: INK });
  // reflection of the umbrella: a vermilion smear underfoot
  glow(
    b.part(new THREE.CircleGeometry(1, 10), VERMILION, { at: [WX + 0.01, GY + 0.0045, WZ + 0.1], dir: [0, 1, 0], axis: "z", scale: [0.045, 0.1, 1] }),
    0.5,
  );

  // ================================================================== RAIN
  const rainFrames = [];
  while (rainFrames.length < 300) {
    const x = -0.6 + R() * 1.2;
    const z = -0.8 + R() * 1.6;
    const y = 0.1 + R() * 1.4;
    const roof = x < -0.3 ? (z > 0.1 ? 0.98 : 1.1) : x > 0.3 ? (z > 0.1 ? 0.7 : 1.25) : 0;
    if (y < roof) continue;
    rainFrames.push(frame([x, y, z], [0.22, 1, 0.03]));
  }
  b.cards(rainFrames, RAIN, { size: [0.008, 0.11], vary: 0.35, rng: rng(5), cross: true });

  return b.root;
}
```