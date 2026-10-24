import * as THREE from "three";
import { createBuilder, catmull, frame, mix, mottle, noise, paint, rgb, rng, smoothstep, svg } from "../../../../src/index";
import type { Paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Solar Barque of Ra",
  description:
    "The Mandjet, the sacred day-boat of Ra: a gilded papyrus-prowed barque with a lotus-column shrine, falcon-headed Ra under a winged sun cornice, Maat, ibis-headed Thoth at the helm, steering oars topped with Hathor plaques, and the glowing scarab sun disc on a crescent cradle at the bow.",
};

type V = [number, number, number];
type Col = string | Paint;
type Rgb = readonly [number, number, number];
type PathT = ReturnType<typeof catmull>;

// ---------------------------------------------------------------------------------------------------------------
// Palette
const GOLD = "#e3b23c";
const GOLD_D = "#a8741a";
const GOLD_L = "#ffe08a";
const LAPIS = "#1d4aa0";
const LAPIS_D = "#122c66";
const TURQ = "#2fb3a6";
const RED = "#b3301d";
const CARN = "#e8572b";
const CEDAR = "#9a6236";
const CEDAR_D = "#5e3a20";
const LINEN = "#f1e6c9";
const PAPY = "#5a9a3e";
const PAPY_D = "#356b2c";
const SKIN_M = "#b3593a";
const SKIN_F = "#dca45c";
const SAND = "#e5d6a5";
const ROPE = "#c9a86a";

// ---------------------------------------------------------------------------------------------------------------
// Hull stations: z, bottom y, top y, full width
const ST: number[][] = [
  [-3.95, 1.05, 1.62, 0.42],
  [-3.4, 0.6, 1.28, 0.8],
  [-2.5, 0.2, 0.98, 1.25],
  [-1.4, 0.02, 0.86, 1.5],
  [0, 0, 0.82, 1.56],
  [1.4, 0.02, 0.86, 1.5],
  [2.5, 0.2, 0.98, 1.25],
  [3.4, 0.6, 1.28, 0.8],
  [3.95, 1.05, 1.62, 0.42],
];
const stAt = (z: number, k: number) => {
  if (z <= ST[0][0]) return ST[0][k];
  for (let i = 0; i < ST.length - 1; i++) {
    if (z <= ST[i + 1][0]) {
      const t = (z - ST[i][0]) / (ST[i + 1][0] - ST[i][0]);
      return ST[i][k] + (ST[i + 1][k] - ST[i][k]) * t;
    }
  }
  return ST[ST.length - 1][k];
};
const topAt = (z: number) => stAt(z, 2);
const widthAt = (z: number) => stAt(z, 3);

// ---------------------------------------------------------------------------------------------------------------
// Paints
const fract = (x: number) => x - Math.floor(x);
const q = new THREE.Vector3();

const shade = (c: Rgb, n: THREE.Vector3): Rgb => {
  const t = smoothstep(-0.7, 0.8, n.y);
  return [Math.min(1, c[0] * (0.7 + 0.4 * t)), Math.min(1, c[1] * (0.74 + 0.3 * t)), Math.min(1, c[2] * (0.88 + 0.14 * t))];
};

const wood = (p: THREE.Vector3, lo: string, hi: string, seed: number): Rgb => {
  const a = noise(q.set(p.x * 4, p.y * 4, p.z * 0.5), 0.3, seed);
  const f = noise(q.set(p.x * 6, p.y * 6, p.z * 0.8), 0.05, seed + 4);
  return mix(lo, hi, 0.15 + 0.55 * a + 0.3 * f);
};

const hullPaint = paint((p, n) => {
  let c: Rgb;
  const d = topAt(p.z) - p.y;
  if (n.y > 0.6) {
    c = wood(p, "#a8763f", "#d3a468", 21);
    if (fract(p.z / 0.17) < 0.07) c = mix(c, "#3d2411", 0.6);
  } else if (n.y < -0.6 || p.y < 0.05) {
    c = mix(CEDAR_D, "#2e1b0c", 0.4);
  } else if (d < 0.07) c = rgb(GOLD);
  else if (d < 0.1) c = rgb(RED);
  else if (d < 0.5) {
    c = mix(LAPIS_D, LAPIS, 0.35 + 0.5 * noise(p, 0.12, 5));
    if ((d > 0.1 && d < 0.13) || d > 0.47) c = rgb(TURQ);
  } else if (d < 0.53) c = rgb(GOLD);
  else {
    c = wood(p, CEDAR_D, CEDAR, 33);
    if (fract(p.y / 0.12) < 0.08) c = mix(c, "#2a170a", 0.6);
    if (fract((p.z + 0.3 * Math.floor(p.y / 0.12)) / 0.9) < 0.015) c = mix(c, "#2a170a", 0.6);
  }
  return shade(c, n);
});

const GILT = paint((p, n) => {
  const v = noise(p, 0.25, 3);
  const s = noise(p, 0.04, 8);
  return shade(mix(GOLD_D, GOLD_L, 0.25 + 0.5 * v + 0.25 * s), n);
});

const LAPIS_P = paint((p, n) => {
  const base = mix(LAPIS_D, LAPIS, 0.3 + 0.6 * noise(p, 0.15, 6));
  return shade(noise(p, 0.025, 9) > 0.8 ? rgb(GOLD) : base, n);
});

const SANDSTONE = paint((p, n) => shade(mix("#d6c28c", SAND, noise(p, 0.1, 4)), n));

const UMBEL = (() => {
  const prof: [number, number][] = [
    [0, 0], [0.1, 0], [0.14, 0.1], [0.3, 0.25], [0.34, 0.42], [0.28, 0.4], [0.14, 0.22], [0, 0.2],
  ];
  return prof;
})();
const UMBEL_P = paint((_p, n, s) => {
  const k = ((Math.floor(s[1] / 30) % 2) + 2) % 2;
  let c: Rgb = k ? rgb(TURQ) : rgb(GOLD);
  if (s[0] > 0.36) c = rgb(RED);
  if (s[0] < 0.07) c = rgb(GOLD_D);
  return shade(c, n);
});

const COL_PROFILE: [number, number][] = [
  [0, 0], [0.16, 0], [0.16, 0.07], [0.11, 0.1], [0.1, 0.18], [0.115, 1.0], [0.13, 1.06], [0.095, 1.1],
  [0.13, 1.14], [0.095, 1.18], [0.2, 1.32], [0.21, 1.48], [0.14, 1.62], [0, 1.7],
];
const COL_P = paint((_p, n, s) => {
  const y = s[0];
  const k = ((Math.floor(s[1] / 40) % 2) + 2) % 2;
  let c: Rgb;
  if (y < 0.1) c = rgb(GOLD_D);
  else if (y < 1.02) c = k ? rgb("#d9c999") : rgb(LINEN);
  else if (y < 1.07) c = rgb(GOLD);
  else if (y < 1.11) c = rgb(TURQ);
  else if (y < 1.15) c = rgb(RED);
  else if (y < 1.19) c = rgb(GOLD);
  else if (y > 1.5) c = rgb(GOLD);
  else c = k ? rgb(LAPIS) : rgb(TURQ);
  return shade(c, n);
});

const ROOF_P = paint((p, n) => {
  if (p.y < 2.8) return shade(rgb(GOLD), n);
  const base = mix(LAPIS_D, LAPIS, 0.3 + 0.6 * noise(p, 0.15, 6));
  return shade(noise(p, 0.03, 9) > 0.78 ? rgb(GOLD_L) : base, n);
});

const KILT_P = paint((p, n) => shade(fract(p.x / 0.04) < 0.3 ? rgb("#cdbf98") : rgb(LINEN), n));
const WIG_P = paint((p, n) => shade(fract(p.y / 0.034) < 0.5 ? rgb(LAPIS_D) : rgb("#0b1230"), n));
const DRESS_P = paint((p, n) => {
  const net = fract((p.x + p.y) / 0.07) < 0.14 || fract((p.x - p.y) / 0.07) < 0.14;
  return shade(net ? rgb(GOLD) : rgb("#a52a1c"), n);
});
const APRON_P = paint((_p, _n, s) => (Math.floor(-s[1] / 0.045) % 2 === 0 ? GOLD : LAPIS));
const COLLAR_P = paint((_p, _n, s) => {
  const k = Math.floor(Math.hypot(s[0], s[1]) / 0.024) % 4;
  return [GOLD, TURQ, LAPIS, RED][k];
});
const OAR_P = paint((_p, n, s) => {
  let c: Rgb;
  if (s[0] < 0.12) c = rgb(RED);
  else if (Math.abs(s[1]) < 0.035) c = rgb(GOLD);
  else c = Math.floor(s[0] / 0.12) % 2 ? rgb(LAPIS) : rgb(TURQ);
  return shade(c, n);
});
const FEATHER_P = paint((_p, _n, s) => (Math.abs(s[0]) < 0.007 ? GOLD : LINEN));
const SKIN_MP = mottle(SKIN_M, "#9c4a30", { size: 0.12, contrast: 0.5, seed: 2 });
const SKIN_FP = mottle(SKIN_F, "#c78a45", { size: 0.12, contrast: 0.5, seed: 3 });

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "solar_barque_of_ra", paintSize: 2048 });
  const R = rng(5);

  // ---- textures ----------------------------------------------------------------------------------------------
  const WEDJAT = svg(
    `<svg viewBox="0 0 120 84" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 22 Q46 -2 98 14" fill="none" stroke="#0e1b3a" stroke-width="10" stroke-linecap="round"/>
    <path d="M8 22 Q46 -2 98 14" fill="none" stroke="#e8c35a" stroke-width="5" stroke-linecap="round"/>
    <path d="M6 44 Q38 18 72 26 Q100 32 112 44 Q84 66 44 62 Q18 58 6 44Z" fill="#f7efd8" stroke="#0e1b3a" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="60" cy="43" r="15" fill="#1f4fa0" stroke="#0e1b3a" stroke-width="4"/>
    <circle cx="60" cy="43" r="7" fill="#0e1b3a"/><circle cx="55" cy="38" r="3" fill="#ffffff"/>
    <path d="M40 64 L34 76 Q30 82 22 78" fill="none" stroke="#0e1b3a" stroke-width="5" stroke-linecap="round"/>
    <path d="M86 58 Q104 66 98 80 Q92 86 86 80 Q84 74 90 72" fill="none" stroke="#0e1b3a" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
    { size: 256 },
  );

  let fr = `<rect x="0" y="0" width="240" height="4" fill="#e3b23c"/><rect x="0" y="52" width="240" height="4" fill="#e3b23c"/>`;
  for (let i = 0; i < 6; i++) {
    const x = 20 + i * 40;
    fr += `<path d="M${x} 48 Q${x - 10} 28 ${x} 8 Q${x + 10} 28 ${x} 48Z" fill="#33b9ac" stroke="#0a1a3a" stroke-width="2"/>`;
    fr += `<path d="M${x - 2} 48 Q${x - 18} 36 ${x - 15} 14 Q${x - 5} 26 ${x - 2} 48Z" fill="#f2e7c8" stroke="#0a1a3a" stroke-width="1.8"/>`;
    fr += `<path d="M${x + 2} 48 Q${x + 18} 36 ${x + 15} 14 Q${x + 5} 26 ${x + 2} 48Z" fill="#f2e7c8" stroke="#0a1a3a" stroke-width="1.8"/>`;
    if (i < 5) {
      const y = x + 20;
      fr += `<path d="M${y} 48 V22" stroke="#4fa247" stroke-width="3.4"/>`;
      fr += `<path d="M${y - 11} 8 Q${y} 30 ${y + 11} 8 Q${y} 14 ${y - 11} 8Z" fill="#6bbd56" stroke="#0a1a3a" stroke-width="1.8"/>`;
    }
  }
  const FRIEZE = svg(`<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">${fr}</svg>`, { size: 768 });

  const SCARAB = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="d" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="#ffe9a0"/><stop offset="0.6" stop-color="#ff9a34"/><stop offset="1" stop-color="#e5481c"/></radialGradient></defs>
    <circle cx="50" cy="50" r="49" fill="url(#d)"/>
    <circle cx="50" cy="50" r="44" fill="none" stroke="#fff1b8" stroke-width="2" stroke-dasharray="3 3"/>
    <path d="M42 58 Q18 38 6 50 Q16 52 14 60 Q26 58 24 68 Q36 66 40 74Z" fill="#f6d36a" stroke="#6b2a10" stroke-width="2"/>
    <path d="M58 58 Q82 38 94 50 Q84 52 86 60 Q74 58 76 68 Q64 66 60 74Z" fill="#f6d36a" stroke="#6b2a10" stroke-width="2"/>
    <ellipse cx="50" cy="60" rx="12" ry="18" fill="#16357a" stroke="#0b1840" stroke-width="2.4"/>
    <path d="M50 44 V78" stroke="#8fb4ff" stroke-width="1.8"/>
    <ellipse cx="50" cy="40" rx="8" ry="6" fill="#16357a" stroke="#0b1840" stroke-width="2.2"/>
    <path d="M44 36 L40 32 M56 36 L60 32 M38 56 L30 54 M62 56 L70 54 M39 66 L31 70 M61 66 L69 70" stroke="#0b1840" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M42 34 Q36 22 44 16 M58 34 Q64 22 56 16" fill="none" stroke="#0b1840" stroke-width="2.4"/>
    <circle cx="50" cy="16" r="8" fill="#d8261c" stroke="#ffe08a" stroke-width="2.4"/>
  </svg>`,
    { size: 384 },
  );

  const GL = "#e7be4c";
  const glyphList = [
    `<ellipse cx="10" cy="7" rx="4.2" ry="5.6"/><path d="M10 12.6V27M3.5 16.5H16.5"/>`,
    `<path d="M10 4V23M10 23L5.5 27.5M10 23L14.5 27.5M10 4Q15.5 4.5 15 0.5"/>`,
    `<path d="M10 27V4M4 27H16M5.5 9H14.5M6.5 14H13.5M7.5 19H12.5"/><path d="M6 4Q10 -1 14 4"/>`,
    `<path d="M2 12Q10 3 18 12Q10 21 2 12Z"/><circle cx="10" cy="12" r="2.6" fill="${GL}"/><path d="M10 20V27M10 22Q5 26 3 27"/>`,
    `<path d="M10 27V3"/><path d="M10 4Q17 9 10 21Q3 9 10 4Z"/>`,
    `<path d="M2 9l4-4 4 4 4-4 4 4M2 16l4-4 4 4 4-4 4 4M2 23l4-4 4 4 4-4 4 4"/>`,
    `<circle cx="10" cy="14" r="8"/><circle cx="10" cy="14" r="1.8" fill="${GL}"/>`,
    `<path d="M5 27Q12 25 11 18Q9 10 10 6Q13 2 15 8Q16 12 11 14"/>`,
  ];
  const HIERO = svg(
    `<svg viewBox="0 0 160 28" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="${GL}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${glyphList
      .map((g, i) => `<g transform="translate(${i * 20} 0)">${g}</g>`)
      .join("")}</g></svg>`,
    { size: 400 },
  );

  const wing = `<path d="M108 22 Q150 6 196 14 L192 21 Q150 15 108 29Z" fill="#1d4aa0" stroke="#0a1a3a" stroke-width="1.6"/>
    <path d="M108 29 Q150 21 190 27 L186 34 Q150 31 108 34Z" fill="#2fb3a6" stroke="#0a1a3a" stroke-width="1.6"/>
    <path d="M108 34 Q150 35 182 41 L176 47 Q146 43 108 39Z" fill="#c23a22" stroke="#0a1a3a" stroke-width="1.6"/>
    <path d="M108 39 Q140 45 168 53 L160 57 Q132 51 108 42Z" fill="#e3b23c" stroke="#0a1a3a" stroke-width="1.6"/>`;
  const WINGED = svg(
    `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
    <g>${wing}</g><g transform="translate(200 0) scale(-1 1)">${wing}</g>
    <circle cx="100" cy="28" r="14" fill="#e0381f" stroke="#e3b23c" stroke-width="3.5"/>
    <path d="M86 40 Q96 52 100 56 Q104 52 114 40" fill="none" stroke="#e3b23c" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M88 28 Q82 18 88 12 M112 28 Q118 18 112 12" fill="none" stroke="#e3b23c" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`,
    { size: 640 },
  );

  const FALCON_EYE = svg(
    `<svg viewBox="0 0 60 50" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 20 Q22 6 40 14 Q48 18 58 12 Q48 28 30 28 Q14 28 6 20Z" fill="#101010"/>
    <circle cx="26" cy="19" r="6.5" fill="#f2c230"/><circle cx="26" cy="19" r="3" fill="#000"/>
    <path d="M18 28 Q12 40 16 48 Q24 40 28 28Z" fill="#101010"/>
  </svg>`,
    { size: 192 },
  );

  const FACE = svg(
    `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <g id="e"><path d="M8 28 Q24 16 40 26" fill="none" stroke="#1a1008" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M10 38 Q24 27 38 38 Q24 47 10 38Z" fill="#f6efe0" stroke="#111" stroke-width="3"/>
    <circle cx="24" cy="38" r="5.2" fill="#1b1209"/><path d="M10 38 L2 41" stroke="#111" stroke-width="3" stroke-linecap="round"/></g>
    <g transform="translate(80 0) scale(-1 1)"><path d="M8 28 Q24 16 40 26" fill="none" stroke="#1a1008" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M10 38 Q24 27 38 38 Q24 47 10 38Z" fill="#f6efe0" stroke="#111" stroke-width="3"/>
    <circle cx="24" cy="38" r="5.2" fill="#1b1209"/><path d="M10 38 L2 41" stroke="#111" stroke-width="3" stroke-linecap="round"/></g>
    <path d="M40 42 L36 58 Q40 61 44 58Z" fill="none" stroke="#7a3f22" stroke-width="2"/>
    <path d="M30 66 Q40 62 50 66 Q40 72 30 66Z" fill="#8f2d1d"/>
  </svg>`,
    { size: 192 },
  );

  const HATHOR = svg(
    `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="18" cy="54" rx="9" ry="13" transform="rotate(-18 18 54)" fill="#c2833f" stroke="#2a1608" stroke-width="2.4"/>
    <ellipse cx="82" cy="54" rx="9" ry="13" transform="rotate(18 82 54)" fill="#c2833f" stroke="#2a1608" stroke-width="2.4"/>
    <path d="M50 6 Q18 8 16 44 L10 112 L30 106 L34 70 Q50 78 66 70 L70 106 L90 112 L84 44 Q82 8 50 6Z" fill="#1c2f66" stroke="#0a1230" stroke-width="2.4"/>
    <path d="M20 50 L16 104 M26 52 L22 106 M80 50 L84 104 M74 52 L78 106" stroke="#e3b23c" stroke-width="2" fill="none"/>
    <ellipse cx="50" cy="54" rx="21" ry="26" fill="#e0ac66" stroke="#2a1608" stroke-width="2.4"/>
    <path d="M26 30 Q50 14 74 30" fill="none" stroke="#e3b23c" stroke-width="6" stroke-linecap="round"/>
    <path d="M32 46 Q40 41 47 46 M53 46 Q60 41 68 46" fill="none" stroke="#111" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M33 51 Q40 47 46 51 Q40 55 33 51Z M54 51 Q60 47 67 51 Q60 55 54 51Z" fill="#f6efe0" stroke="#111" stroke-width="1.8"/>
    <circle cx="40" cy="51" r="2.2" fill="#111"/><circle cx="60" cy="51" r="2.2" fill="#111"/>
    <path d="M50 54 L47 65 Q50 67 53 65Z" fill="none" stroke="#7a3f22" stroke-width="1.8"/>
    <path d="M42 73 Q50 69 58 73 Q50 78 42 73Z" fill="#8f2d1d"/>
  </svg>`,
    { size: 256 },
  );

  // ---- small helpers -----------------------------------------------------------------------------------------
  const part = (geo: THREE.BufferGeometry, color: Col, at: V, o: any = {}) => b.part(geo, color, { at, ...o });
  const box = (w: number, h: number, d: number, color: Col, at: V, o: any = {}) =>
    part(new THREE.BoxGeometry(w, h, d), color, at, o);
  const ball = (r: number, color: Col, at: V, o: any = {}) =>
    part(new THREE.SphereGeometry(r, 8, 6), color, at, { flat: true, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: Col, at: V, o: any = {}) =>
    part(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, { flat: true, ...o });
  const ringAt = (Rr: number, r: number, color: Col, at: V, dir: any, seg = 12) =>
    part(new THREE.TorusGeometry(Rr, r, 5, seg), color, at, { dir, axis: "z", flat: true });
  const face = (tex: THREE.Texture, w: number, h: number, at: V, dir: V) =>
    part(new THREE.PlaneGeometry(w, h), "#ffffff", at, { dir, axis: "z", texture: tex });
  const sided = (tex: THREE.Texture, w: number, h: number, at: V) => {
    for (const s of [1, -1]) face(tex, w, h, [at[0] + s * 0.003, at[1], at[2]], [s, 0, 0]);
  };

  // =============================================================================================================
  // HULL
  const hull = b.loft(
    ST.map(([z, bt, tp, w]) => ({ at: [0, (bt + tp) / 2, z] as V, w, h: tp - bt })),
    { section: "box", caps: "flat", color: hullPaint, name: "hull" },
  );

  for (const s of [1, -1]) {
    // gilded gunwale rails
    const pts = ST.map(([z, , tp, w]) => [s * (w / 2 - 0.01), tp + 0.02, z] as V);
    b.sweep(catmull(pts), 0.055, { color: GILT, sides: 6, name: "gunwale" });
    // lower red rail
    const low = ST.slice(1, ST.length - 1).map(([z, bt, , w]) => [s * (w / 2 + 0.01), bt + 0.14, z] as V);
    b.sweep(catmull(low), 0.035, { color: CEDAR_D, sides: 5, name: "strake" });
    // beam ends
    for (let z = -2.6; z <= 2.61; z += 0.52) {
      const len = 0.16 + 0.06 * R();
      cyl(0.05, 0.05, len, 7, CEDAR_D, [s * (widthAt(z) / 2 + len / 2 - 0.02), topAt(z) - 0.62, z], { dir: [1, 0, 0] });
    }
    // wedjat eye on the bow
    b.decal(hull, WEDJAT, {
      at: [s * 0.6, 0.7, 2.6],
      dir: [s, 0, 0],
      size: [0.58, 0.4],
      mirror: s < 0,
      segments: 10,
    });
    // lotus & papyrus friezes
    for (const zc of [-1.05, 1.05])
      b.decal(hull, FRIEZE, { at: [s * 0.78, topAt(zc) - 0.3, zc], dir: [s, 0, 0], size: [2.0, 0.34], segments: 14 });
  }

  // =============================================================================================================
  // PAPYRUS STEMS
  const stemBow = catmull([[0, 1.32, 3.7], [0, 1.85, 4.15], [0, 2.55, 4.38], [0, 3.15, 4.28]]);
  const stemStern = catmull([[0, 1.32, -3.7], [0, 1.85, -4.05], [0, 2.5, -4.05], [0, 3.05, -3.68]]);

  const papyrusStem = (path: PathT) => {
    b.sweep(path, [0.13, 0.095], { color: PAPY_D, sides: 8, caps: "flat", name: "stem" });
    const N = 6;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const pts: V[] = [];
      for (let k = 0; k <= 6; k++) {
        const t = k / 6;
        const pt = path.at(t);
        const T = path.tangentAt(t).clone().normalize();
        const X = new THREE.Vector3(1, 0, 0);
        const Nn = new THREE.Vector3().crossVectors(X, T).normalize();
        const r = 0.105 * (1 - 0.25 * t);
        const off = X.clone().multiplyScalar(Math.cos(a) * r).addScaledVector(Nn, Math.sin(a) * r);
        pts.push([pt.x + off.x, pt.y + off.y, pt.z + off.z]);
      }
      b.sweep(catmull(pts), [0.05, 0.04], { color: i % 2 ? PAPY : PAPY_D, sides: 6, name: "strand" });
    }
    b.along(path, 5, (pt: any) => {
      const geo = new THREE.TorusGeometry(0.165 * (1 - 0.22 * pt.t), 0.03, 5, 12).rotateX(Math.PI / 2);
      b.part(geo, GOLD, { frame: pt, flat: true });
    });
    const e = path.at(1);
    const T = path.tangentAt(1).clone().normalize();
    b.lathe(UMBEL, { at: [e.x, e.y, e.z], axis: [T.x, T.y, T.z], segments: 12, color: UMBEL_P, name: "umbel" });
    const top = e.clone().addScaledVector(T, 0.2);
    b.ring(frame([top.x, top.y, top.z], [T.x, T.y, T.z]), { count: 9, radius: 0.05, tilt: 68 }, (it: any) =>
      b.spike(it, it, 0.3, 0.02, { color: "#79b44a", sides: 4 }),
    );
    ball(0.055, CARN, [top.x, top.y, top.z]);
  };
  papyrusStem(stemBow);
  papyrusStem(stemStern);

  // =============================================================================================================
  // COBRA (uraeus)
  const cobra = (x: number, y: number, z: number, sc: number) => {
    const c = (a: number, h: number, d: number): V => [x + a * sc, y + h * sc, z + d * sc];
    b.sweep(catmull([c(0, 0, -0.12), c(0, 0.03, 0.02), c(0, 0.1, -0.03), c(0, 0.2, 0.0), c(0, 0.3, 0.02)]), [0.04 * sc, 0.022 * sc], {
      color: GOLD, sides: 6, name: "uraeus",
    });
    const hood: [number, number][] = [
      [-0.04, 0], [0.04, 0], [0.085, 0.11], [0.05, 0.19], [0, 0.22], [-0.05, 0.19], [-0.085, 0.11],
    ].map(([a, h]) => [a * sc, h * sc]);
    b.extrude(hood, { at: c(0, 0.24, 0.02), x: [1, 0, 0], thickness: 0.026 * sc, bevel: 0.006 * sc, smoothing: 1, color: GOLD });
    b.extrude(hood.map(([a, h]) => [a * 0.5, 0.04 * sc + h * 0.55] as [number, number]), {
      at: c(0, 0.24, 0.02), x: [1, 0, 0], thickness: 0.032 * sc, color: RED,
    });
    ball(0.035 * sc, GOLD, c(0, 0.47, 0.05));
    ball(0.012 * sc, CARN, c(0.025, 0.48, 0.075));
    ball(0.012 * sc, CARN, c(-0.025, 0.48, 0.075));
  };

  // =============================================================================================================
  // SUN DISC AT THE BOW
  const DZ = 2.25;
  const DC: V = [0, 1.82, DZ];
  box(0.56, 0.1, 0.9, GILT, [0, topAt(DZ) + 0.05, DZ]);
  b.frustumBox([0, topAt(DZ) + 0.1, DZ], [0, 1.2, DZ], [0.3, 0.5], [0.14, 0.18], { color: GILT });
  const cres: [number, number][] = [];
  for (let i = 0; i <= 7; i++) {
    const a = ((200 + (140 * i) / 7) * Math.PI) / 180;
    cres.push([Math.cos(a) * 0.7, Math.sin(a) * 0.7]);
  }
  for (let i = 7; i >= 0; i--) {
    const a = ((200 + (140 * i) / 7) * Math.PI) / 180;
    cres.push([Math.cos(a) * 0.57, Math.sin(a) * 0.57]);
  }
  b.extrude(cres, { at: DC, x: [0, 0, 1], thickness: 0.18, bevel: 0.025, color: GILT, name: "cradle" });
  glow(cyl(0.55, 0.55, 0.1, 24, CARN, DC, { dir: [1, 0, 0] }), 1.1);
  ringAt(0.55, 0.04, GOLD, DC, [1, 0, 0], 24);
  for (const s of [1, -1]) {
    glow(part(new THREE.CircleGeometry(0.5, 28), "#ffffff", [s * 0.056, DC[1], DC[2]], { dir: [s, 0, 0], axis: "z", texture: SCARAB }), 1);
  }
  b.ring(frame(DC, [1, 0, 0]), { count: 16, radius: 0.58 }, (it: any) =>
    glow(b.spike(it, it, 0.17, 0.035, { color: GOLD_L, sides: 4 }), 0.6),
  );
  cobra(0, 1.58, DZ - 0.63, 1.1);
  cobra(0, 1.58, DZ + 0.63, 1.1);

  // =============================================================================================================
  // SHRINE
  const SZ = -0.55;
  const DAIS = 0.95;
  box(1.5, 0.1, 2.2, SANDSTONE, [0, 0.9, SZ]);
  box(1.56, 0.03, 2.26, GILT, [0, 0.855, SZ]);

  for (const x of [0.55, -0.55])
    for (const z of [-1.4, -0.55, 0.3]) {
      b.lathe(COL_PROFILE, { at: [x, DAIS, z], segments: 8, color: COL_P, name: "column" });
      box(0.36, 0.1, 0.36, GILT, [x, DAIS + 1.75, z]);
    }

  // side screens with hieroglyph bands
  for (const s of [1, -1]) {
    box(0.07, 0.6, 1.5, LAPIS_P, [s * 0.55, DAIS + 0.3, SZ]);
    box(0.09, 0.05, 1.54, GILT, [s * 0.55, DAIS + 0.625, SZ]);
    face(HIERO, 1.3, 0.23, [s * 0.592, 1.25, SZ], [s, 0, 0]);
    face(HIERO, 1.3, 0.23, [s * 0.508, 1.25, SZ], [-s, 0, 0]);
  }
  // back wall
  box(0.9, 1.45, 0.08, LAPIS_P, [0, DAIS + 0.725, -1.42]);
  for (const [i, y] of [1.15, 1.5, 1.85, 2.2].entries()) {
    face(HIERO, 0.8, 0.14, [0, y, -1.378], [0, 0, 1]);
    if (i < 3) face(HIERO, 0.8, 0.14, [0, y + 0.1, -1.462], [0, 0, -1]);
  }

  // roof: flared cavetto block
  b.frustumBox([0, 2.75, SZ], [0, 3.1, SZ], [1.5, 2.2], [1.85, 2.55], { color: ROOF_P, name: "roof" });
  box(1.4, 0.04, 2.1, GILT, [0, 2.77, SZ]);
  const rc = [
    [0.925, 3.1, SZ + 1.275], [-0.925, 3.1, SZ + 1.275], [-0.925, 3.1, SZ - 1.275], [0.925, 3.1, SZ - 1.275],
  ] as V[];
  const rb = [
    [0.75, 2.75, SZ + 1.1], [-0.75, 2.75, SZ + 1.1], [-0.75, 2.75, SZ - 1.1], [0.75, 2.75, SZ - 1.1],
  ] as V[];
  for (let i = 0; i < 4; i++) {
    b.rod(rc[i], rc[(i + 1) % 4], 0.04, GOLD, { sides: 6 });
    b.rod(rb[i], rc[i], 0.04, GOLD, { sides: 6 });
    ball(0.055, GOLD, rc[i]);
  }
  box(1.6, 0.06, 2.3, GOLD_D, [0, 3.12, SZ]);
  for (const zz of [SZ + 1.28, SZ - 1.28]) {
    for (let i = 0; i < 9; i++)
      b.spike([-0.8 + i * 0.2, 3.13, zz], [0, 1, 0], 0.13, 0.03, { color: i % 2 ? TURQ : GOLD, sides: 4 });
  }
  b.decal(b.surface(b.root), WINGED, { at: [0, 2.93, SZ + 1.19], dir: [0, 0, 1], size: [1.3, 0.39], segments: 12 });
  b.decal(b.surface(b.root), WINGED, { at: [0, 2.93, SZ - 1.19], dir: [0, 0, -1], size: [1.3, 0.39], segments: 12 });

  // =============================================================================================================
  // OFFERING TABLE & DECK ITEMS
  const table: [number, number][] = [
    [0, 0], [0.14, 0], [0.14, 0.03], [0.07, 0.08], [0.06, 0.3], [0.1, 0.36], [0.2, 0.38], [0.2, 0.41], [0, 0.41],
  ];
  b.lathe(table, { at: [0, DAIS, 0.02], segments: 10, color: GILT, name: "offering_table" });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    part(new THREE.ConeGeometry(0.06, 0.11, 6), "#c8863a", [Math.cos(a) * 0.12, DAIS + 0.47, 0.02 + Math.sin(a) * 0.12], { flat: true });
  }

  const lotus = (x: number, y: number, z: number, sc: number, col: string) => {
    b.rod([x, y - 0.18 * sc, z], [x, y, z], 0.014 * sc, PAPY, { sides: 5 });
    b.ring(frame([x, y, z], [0, 1, 0]), { count: 8, radius: 0.025 * sc, tilt: 60 }, (it: any) =>
      b.spike(it, it, 0.14 * sc, 0.034 * sc, { color: col, sides: 4 }),
    );
    ball(0.028 * sc, GOLD, [x, y + 0.02 * sc, z]);
  };
  lotus(0, DAIS + 0.5, 0.02, 1.2, "#8fb7f0");
  for (const s of [1, -1]) {
    const vz = 1.55;
    const vy = topAt(vz);
    const vase: [number, number][] = [[0, 0], [0.07, 0], [0.11, 0.1], [0.06, 0.2], [0.08, 0.25], [0, 0.25]];
    b.lathe(vase, { at: [s * 0.46, vy, vz], segments: 8, color: GILT, name: "vase" });
    lotus(s * 0.46, vy + 0.4, vz, 1.1, "#f2f0e4");
    lotus(s * 0.5, vy + 0.33, vz + 0.06, 0.9, "#8fb7f0");
  }
  // rope coils
  for (const zc of [3.15, -3.2]) {
    for (let k = 0; k < 3; k++)
      part(new THREE.TorusGeometry(0.17 - 0.012 * k, 0.045, 5, 14).rotateX(Math.PI / 2), ROPE, [0, topAt(zc) + 0.045 + 0.075 * k, zc], { flat: true });
  }

  // =============================================================================================================
  // FIGURES
  type Hold = "was" | "ankh" | "none";
  type FigOpts = {
    x: number; y: number; z: number; sc: number;
    head: "falcon" | "human" | "ibis";
    skin: Col;
    crown: "disc" | "feather" | "moon";
    hands: [Hold, Hold];
    dress?: boolean;
  };

  const was = (x: number, y0: number, z: number, h: number) => {
    b.rod([x, y0, z], [x, y0 + h, z], 0.018, "#e4c15a", { sides: 5 });
    b.sweep(catmull([[x, y0 + h - 0.02, z], [x, y0 + h + 0.05, z + 0.03], [x, y0 + h + 0.06, z + 0.1]]), [0.022, 0.014], { color: "#e4c15a", sides: 5 });
    b.rod([x, y0 + 0.1, z], [x, y0, z - 0.05], 0.014, "#e4c15a", { sides: 4 });
    b.rod([x, y0 + 0.1, z], [x, y0, z + 0.05], 0.014, "#e4c15a", { sides: 4 });
  };
  const ankh = (x: number, y: number, z: number, sc: number) => {
    b.rod([x, y, z], [x, y + 0.26 * sc, z], 0.014 * sc, GOLD, { sides: 5 });
    b.rod([x - 0.075 * sc, y + 0.17 * sc, z], [x + 0.075 * sc, y + 0.17 * sc, z], 0.014 * sc, GOLD, { sides: 5 });
    part(new THREE.TorusGeometry(0.05 * sc, 0.014 * sc, 5, 12), GOLD, [x, y + 0.31 * sc, z], { flat: true });
  };

  const figure = (o: FigOpts) => {
    const sc = o.sc;
    const S = (v: number) => v * sc;
    const P = (px: number, py: number, pz: number): V => [o.x + px * sc, o.y + py * sc, o.z + pz * sc];

    for (const s of [1, -1]) {
      const fz = s > 0 ? 0.12 : -0.03;
      box(S(0.11), S(0.06), S(0.22), o.skin, P(s * 0.09, 0.03, fz + 0.05));
      if (!o.dress) b.capsule(P(s * 0.085, 0.5, 0), P(s * 0.09, 0.07, fz), [S(0.062), S(0.048)], o.skin);
    }
    if (o.dress) {
      b.frustumBox(P(0, 0.06, 0), P(0, 0.98, 0), [S(0.3), S(0.2)], [S(0.34), S(0.21)], { color: DRESS_P, name: "dress" });
    } else {
      b.frustumBox(P(0, 0.28, 0.01), P(0, 0.64, 0), [S(0.34), S(0.24)], [S(0.28), S(0.2)], { color: KILT_P, name: "kilt" });
      b.extrude(
        [[-0.06, 0], [0.06, 0], [0.09, -0.3], [-0.09, -0.3]].map(([a, h]) => [a * sc, h * sc] as [number, number]),
        { at: P(0, 0.64, 0.12), x: [1, 0, 0], thickness: S(0.025), color: APRON_P },
      );
      b.frustumBox(P(0, 0.61, 0), P(0, 0.69, 0), [S(0.3), S(0.22)], [S(0.3), S(0.22)], { color: GOLD });
    }
    b.frustumBox(P(0, 0.68, 0), P(0, 1.05, 0), [S(0.27), S(0.17)], [S(0.36), S(0.2)], { color: o.skin, name: "torso" });
    const collar: [number, number][] = [];
    for (let i = 0; i <= 6; i++) {
      const a = Math.PI + (i / 6) * Math.PI;
      collar.push([Math.cos(a) * 0.2 * sc, Math.sin(a) * 0.19 * sc]);
    }
    for (let i = 6; i >= 0; i--) {
      const a = Math.PI + (i / 6) * Math.PI;
      collar.push([Math.cos(a) * 0.075 * sc, Math.sin(a) * 0.075 * sc]);
    }
    b.extrude(collar, { at: P(0, 1.07, 0.108), x: [1, 0, 0], thickness: S(0.03), color: COLLAR_P, name: "collar" });
    cyl(S(0.05), S(0.055), S(0.1), 7, o.skin, P(0, 1.1, 0));

    // arms and held items
    for (const s of [1, -1]) {
      const sh = P(s * 0.2, 0.99, 0);
      const el = P(s * 0.245, 0.8, 0.04);
      const hd = P(s * 0.215, 0.72, 0.26);
      b.capsule(sh, el, [S(0.052), S(0.042)], o.skin);
      b.capsule(el, hd, [S(0.042), S(0.036)], o.skin);
      ball(S(0.056), o.skin, sh);
      ball(S(0.046), o.skin, hd);
      ringAt(S(0.042), S(0.012), GOLD, P(s * 0.23, 0.76, 0.17), [0, -0.3, 1], 8);
      const h = o.hands[s > 0 ? 0 : 1];
      if (h === "was") was(hd[0], o.y, hd[2], S(1.5));
      else if (h === "ankh") ankh(hd[0], hd[1] - 0.02, hd[2], sc);
    }

    // wig
    box(S(0.3), S(0.34), S(0.16), WIG_P, P(0, 1.17, -0.1));
    for (const s of [1, -1]) box(S(0.07), S(0.34), S(0.1), WIG_P, P(s * 0.16, 1.0, 0.07));

    // head
    const hc = P(0, 1.2, 0.01);
    if (o.head === "falcon") {
      const head = b.part(new THREE.SphereGeometry(S(0.12), 10, 8), "#2a2d3a", { at: hc, scale: [0.95, 1.05, 1.1], flat: true });
      part(new THREE.ConeGeometry(S(0.05), S(0.16), 6), "#e6b422", P(0, 1.18, 0.2), { dir: [0, -0.15, 1], flat: true });
      part(new THREE.ConeGeometry(S(0.03), S(0.07), 5), "#e6b422", P(0, 1.14, 0.265), { dir: [0, -1, 0.5], flat: true });
      for (const s of [1, -1])
        b.decal(head, FALCON_EYE, { at: P(s * 0.115, 1.215, 0.07), dir: [s, 0, 0], size: [S(0.17), S(0.14)], mirror: s < 0, segments: 8 });
    } else if (o.head === "ibis") {
      const head = b.part(new THREE.SphereGeometry(S(0.11), 10, 8), "#20242f", { at: hc, flat: true });
      b.sweep(catmull([P(0, 1.2, 0.1), P(0, 1.19, 0.25), P(0, 1.12, 0.38), P(0, 1.0, 0.43)]), [S(0.045), S(0.01)], { color: "#3a342a", sides: 6, name: "beak" });
      for (const s of [1, -1])
        b.decal(head, FALCON_EYE, { at: P(s * 0.105, 1.215, 0.06), dir: [s, 0, 0], size: [S(0.14), S(0.115)], mirror: s < 0, segments: 8 });
    } else {
      const head = b.part(new THREE.SphereGeometry(S(0.125), 10, 8), o.skin, { at: hc, flat: true });
      box(S(0.03), S(0.05), S(0.04), o.skin, P(0, 1.19, 0.13));
      b.decal(head, FACE, { at: P(0, 1.2, 0.12), dir: [0, 0, 1], size: [S(0.2), S(0.2)], segments: 8 });
    }

    // crowns
    if (o.crown === "disc") {
      glow(cyl(S(0.15), S(0.15), S(0.06), 14, CARN, P(0, 1.47, 0), { dir: [1, 0, 0] }), 1.2);
      ringAt(S(0.15), S(0.018), GOLD, P(0, 1.47, 0), [1, 0, 0], 14);
      cobra(...P(0, 1.3, 0.1), S(0.55) as any);
    } else if (o.crown === "feather") {
      const f: [number, number][] = [
        [0, 0], [0.05, 0.1], [0.06, 0.25], [0.03, 0.36], [0, 0.4], [-0.03, 0.36], [-0.06, 0.25], [-0.05, 0.1],
      ].map(([a, h]) => [a * sc, h * sc]);
      b.extrude(f, { at: P(0, 1.34, -0.02), x: [1, 0, 0], thickness: S(0.02), smoothing: 1, color: FEATHER_P, name: "feather" });
      cyl(S(0.07), S(0.09), S(0.06), 8, GOLD, P(0, 1.33, -0.02));
    } else {
      const m: [number, number][] = [];
      for (let i = 0; i <= 6; i++) {
        const a = ((200 + (140 * i) / 6) * Math.PI) / 180;
        m.push([Math.cos(a) * 0.17 * sc, Math.sin(a) * 0.17 * sc]);
      }
      for (let i = 6; i >= 0; i--) {
        const a = ((200 + (140 * i) / 6) * Math.PI) / 180;
        m.push([Math.cos(a) * 0.1 * sc, Math.sin(a) * 0.1 * sc]);
      }
      b.extrude(m, { at: P(0, 1.5, 0), x: [1, 0, 0], thickness: S(0.05), color: GILT, name: "moon_crescent" });
      glow(ball(S(0.075), "#f4f1e6", P(0, 1.5, 0)), 1);
    }
  };

  figure({ x: 0, y: DAIS - 0.01, z: SZ - 0.2, sc: 0.95, head: "falcon", skin: SKIN_MP, crown: "disc", hands: ["was", "ankh"] });
  figure({ x: 0, y: topAt(1.15) - 0.01, z: 1.15, sc: 0.85, head: "human", skin: SKIN_FP, crown: "feather", hands: ["ankh", "none"], dress: true });
  figure({ x: 0, y: topAt(-2.6) - 0.01, z: -2.6, sc: 0.9, head: "ibis", skin: SKIN_MP, crown: "moon", hands: ["was", "ankh"] });

  // =============================================================================================================
  // STEERING OARS
  const BLADE: [number, number][] = [
    [0, -0.04], [0.1, -0.1], [0.5, -0.19], [0.85, -0.17], [1.05, 0], [0.85, 0.17], [0.5, 0.19], [0.1, 0.1], [0, 0.04],
  ];
  for (const s of [1, -1]) {
    const A = new THREE.Vector3(s * 0.45, 2.5, -2.2);
    const B = new THREE.Vector3(s * 1.35, 0.32, -3.5);
    const d = B.clone().sub(A).normalize();
    const side = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 1, 0)).normalize();
    const top = A.clone().addScaledVector(d, -0.18);
    b.rod(top, B, 0.042, "#8a5630", { sides: 6, name: "oar_shaft" });
    for (const t of [0.05, 0.3, 0.55, 0.78]) {
      const pos = top.clone().lerp(B, t);
      ringAt(0.05, 0.014, GOLD, [pos.x, pos.y, pos.z], d, 8);
    }
    b.extrude(BLADE, { at: B.clone().addScaledVector(d, -1.05), x: d, y: side, thickness: 0.045, bevel: 0.01, smoothing: 1, color: OAR_P, name: "oar_blade" });
    // Hathor plaque on top
    const pc: V = [top.x, top.y + 0.2, top.z];
    sided(HATHOR, 0.3, 0.36, pc);
    box(0.12, 0.05, 0.12, GOLD, [top.x, top.y + 0.02, top.z]);
    // crutch
    const cp = A.clone().add(B.clone().sub(A).multiplyScalar(0.538));
    b.rod([s * 0.42, topAt(-2.9), -2.9], [s * 0.934, 1.41, -2.9], 0.045, GOLD, { sides: 6 });
    ringAt(0.075, 0.02, GOLD, [cp.x, cp.y, cp.z], d, 10);
  }

  // end: bow and stern ornaments at the base of each stem
  for (const [z, sgn] of [[3.9, 1], [-3.9, -1]] as [number, number][]) {
    box(0.4, 0.09, 0.14, GILT, [0, 1.12, z]);
    for (const s of [1, -1]) ball(0.05, TURQ, [s * 0.2, 1.12, z + sgn * 0.0]);
  }

  return b.root;
}
