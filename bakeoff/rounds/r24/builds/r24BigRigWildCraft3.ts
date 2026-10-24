// STYLE: ART DECO "STREAMLINE MODERNE" (1930s world's-fair poster-machine).
// Lacquered jade and black bodywork, gold pinstriping, ziggurat-stepped grille and roof crown, sunburst medallions
// on every flat face, speed-line streaks, and a mirror-chrome tank that reflects a gold-horizon sky
// with a Deco skyline of stepped towers. Everything is faceted, symmetrical and ornamented with the same few motifs.

import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, noise, svg, catmull } from "../../../../src/index";
import type { Rgb } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Golden Arrow Streamliner Rig",
  description:
    "A chrome tanker big-rig in Art Deco Streamline Moderne: mirror-chrome tank reflecting a stepped skyline, jade and black lacquer cab, ziggurat grille, gold sunburst medallions and speed-line trim.",
};

// ------------------------------------------------------------------------------------------------ palette
const BLACK = "#14121a";
const JADE = "#1f8a78";
const GOLD = "#e2b13c";
const CREAM = "#f6ecd0";
const BURG = "#7a1f2e";
const RUBBER = "#1a1a1e";
const RED = "#d8262c";
const AMBER = "#ffb22e";
const YELLOW = "#f0c93a";
const STEEL = "#8f98a6";
const DSTEEL = "#3a3d4a";
const WHITE = "#ffffff";

// ------------------------------------------------------------------------------------------------ dimensions
const R = 0.52; // tire radius
const WY = 0.515; // wheel centre height (sinks 5 mm into the floor)
const TANK_Y = 2.2;
const TANK_Z0 = -0.9;
const TANK_LEN = 12.4;

const hash2 = (a: number, b: number) => {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// ------------------------------------------------------------------------------------------------ paints
// Mirror chrome: ground below, a hot gold horizon band, a cream-to-teal-to-blue sky above and a stepped Deco skyline.
const CHROME = paint((p, n) => {
  const y = n.y;
  let c: Rgb;
  if (y < -0.1) c = mix("#120d22", "#5a3a5e", smoothstep(-1, -0.1, y));
  else if (y < 0.08) c = mix("#c9863a", "#ffe6a0", smoothstep(-0.1, 0.08, y));
  else {
    c = mix("#fff0c8", "#6fd0c8", smoothstep(0.08, 0.5, y));
    c = mix(c, "#1f4f8a", smoothstep(0.5, 1, y));
    const az = Math.atan2(n.x, n.z);
    const u = az * 3.8 + p.z * 1.7;
    const cell = Math.floor(u);
    const f = u - cell;
    let h = 0.1 + 0.4 * hash2(cell, 3);
    if (f < 0.18 || f > 0.82) h *= 0.62;
    else if (f < 0.3 || f > 0.7) h *= 0.85;
    if (y < 0.08 + h) c = hash2(Math.floor(y * 34), Math.floor(u * 7)) > 0.82 ? mix("#ffd98a", "#ffd98a", 0) : mix("#1d1830", "#1d1830", 0);
  }
  const k = 0.95 + 0.1 * noise(p, 0.5, 4);
  return [c[0] * k, c[1] * k, c[2] * k] as const;
});

// Lacquer: cool in the shade, warm on top, with a glossy hot spot on upward faces.
const lac = (dark: string, light: string, spec = 0.2) =>
  paint((p, n) => {
    let c = mix(dark, light, smoothstep(-0.7, 0.9, n.y));
    c = mix(c, "#ffffff", spec * smoothstep(0.8, 1, n.y));
    const k = 0.97 + 0.06 * noise(p, 0.8, 9);
    return [c[0] * k, c[1] * k, c[2] * k] as const;
  });
const JADE_L = lac("#0f5a4f", "#2fb89e");
const BLACK_L = lac("#08070c", "#3a3650");
const GOLD_L = lac("#a8761c", "#f6d36b", 0.35);
const CAB_PAINT = paint((p) => (p.y < 2.3 ? JADE_L : p.y < 2.37 ? GOLD_L : BLACK_L));
const FENDER_PAINT = paint((_p, n) => (Math.abs(n.x) > 0.6 ? GOLD_L : JADE_L));
const HOOD_PAINT = paint((p, n) => (Math.abs(p.x) < 0.014 && n.y > 0.3 ? GOLD_L : CHROME));
const TREAD = paint((_p, n, s) =>
  Math.abs(n.x) > 0.5 ? "#101014" : Math.floor(s[1] / 12) % 2 ? "#17171c" : "#2b2b33",
);

// ------------------------------------------------------------------------------------------------ outline helpers
function arch(L: number, H: number, t: number, n = 10): [number, number][] {
  const sup = (a: number, l: number, h: number): [number, number] => {
    const c = Math.cos(a);
    const s = Math.sin(a);
    return [l * Math.sign(c) * Math.pow(Math.abs(c), 0.55), h * Math.pow(Math.abs(s), 0.55)];
  };
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) out.push(sup(Math.PI - (Math.PI * i) / n, L, H));
  for (let i = n; i >= 0; i--) out.push(sup(Math.PI - (Math.PI * i) / n, L - t, H - t));
  return out;
}
const zig = (a: number, h: number): [number, number][] => [
  [-a, 0], [a, 0], [a, 0.62 * h], [0.8 * a, 0.62 * h], [0.8 * a, 0.86 * h], [0.56 * a, 0.86 * h],
  [0.56 * a, h], [-0.56 * a, h], [-0.56 * a, 0.86 * h], [-0.8 * a, 0.86 * h], [-0.8 * a, 0.62 * h], [-a, 0.62 * h],
];
const zigTop = (x: number, a: number, h: number) => {
  const ax = Math.abs(x);
  return ax <= 0.56 * a ? h : ax <= 0.8 * a ? 0.86 * h : 0.62 * h;
};
const tireProfile = (h: number): [number, number][] => [
  [0.27, -h], [R - 0.11, -h], [R - 0.04, -h + 0.03], [R, -h + 0.09],
  [R, h - 0.09], [R - 0.04, h - 0.03], [R - 0.11, h], [0.27, h],
];

// ------------------------------------------------------------------------------------------------ svg helpers
function rays(cx: number, cy: number, r: number, n: number, c1: string, c2: string, a0 = 0, a1 = 360) {
  let s = "";
  const step = (a1 - a0) / n;
  for (let i = 0; i < n; i++) {
    const A = ((a0 + i * step) * Math.PI) / 180;
    const B = ((a0 + (i + 1) * step) * Math.PI) / 180;
    s += `<path d="M${cx} ${cy}L${(cx + r * Math.cos(A)).toFixed(2)} ${(cy + r * Math.sin(A)).toFixed(2)}L${(cx + r * Math.cos(B)).toFixed(2)} ${(cy + r * Math.sin(B)).toFixed(2)}Z" fill="${i % 2 ? c1 : c2}"/>`;
  }
  return s;
}
const FONT = `font-family="Futura, Century Gothic, Arial, sans-serif" font-weight="bold"`;

export default function build() {
  const b = createBuilder({ name: "golden_arrow_rig", paintSize: 2048 });

  // ---------------------------------------------------------------------------------------------- textures
  const EMBLEM = svg(
    `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="58" fill="${BLACK}"/><circle cx="60" cy="60" r="52" fill="${GOLD}"/>${rays(60, 60, 46, 16, CREAM, BLACK)}<circle cx="60" cy="60" r="21" fill="${BLACK}"/><circle cx="60" cy="60" r="16" fill="${GOLD}"/><path d="M60 46L64 56L74 56L66 63L69 73L60 67L51 73L54 63L46 56L56 56Z" fill="${BLACK}"/></svg>`,
    { size: 256 },
  );
  const HUB = svg(
    `<svg viewBox="0 0 100 100"><defs><radialGradient id="g" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#9aa6b8"/><stop offset="1" stop-color="#3d4658"/></radialGradient></defs><circle cx="50" cy="50" r="49" fill="url(#g)"/>${rays(50, 50, 40, 12, "#c9d2e0", GOLD)}<circle cx="50" cy="50" r="46" fill="none" stroke="${GOLD}" stroke-width="3"/><circle cx="50" cy="50" r="13" fill="${BLACK}"/><circle cx="50" cy="50" r="8" fill="${GOLD}"/></svg>`,
    { size: 192 },
  );
  const LENS = svg(
    `<svg viewBox="0 0 80 80"><defs><radialGradient id="g"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#fff0b0"/><stop offset="1" stop-color="#ffb22e"/></radialGradient></defs><circle cx="40" cy="40" r="39" fill="${GOLD}"/><circle cx="40" cy="40" r="34" fill="url(#g)"/>${rays(40, 40, 33, 20, "#ffe08a", "#fff8dc")}<circle cx="40" cy="40" r="9" fill="#ffffff"/><circle cx="40" cy="40" r="34" fill="none" stroke="${BLACK}" stroke-width="2.4"/></svg>`,
    { size: 192 },
  );
  const TAIL = svg(
    `<svg viewBox="0 0 40 100"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb22e"/><stop offset="0.3" stop-color="#ff5a3a"/><stop offset="1" stop-color="#b3141c"/></linearGradient></defs><path d="M0 8L8 0H32L40 8V92L32 100H8L0 92Z" fill="url(#g)"/><path d="M6 34H34M6 52H34M6 70H34" stroke="#6e0d14" stroke-width="3.4"/></svg>`,
    { size: 160 },
  );
  const PORTHOLE = svg(
    `<svg viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c2a36"/><stop offset="0.6" stop-color="#1f7f8c"/><stop offset="1" stop-color="#f2c26b"/></linearGradient></defs><circle cx="50" cy="50" r="49" fill="#cfd6e0"/><circle cx="50" cy="50" r="44" fill="${GOLD}"/><circle cx="50" cy="50" r="39" fill="url(#g)"/>${rays(50, 50, 38, 12, "#ffffff22", "#00000000")}<path d="M24 74L44 74L70 26L50 26Z" fill="#ffffff" opacity="0.22"/></svg>`,
    { size: 192 },
  );
  const WSHIELD = svg(
    `<svg viewBox="0 0 220 120"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c2a36"/><stop offset="0.6" stop-color="#1f7f8c"/><stop offset="1" stop-color="#f2c26b"/></linearGradient></defs><path d="M0 120V16H8V8H16V0H204V8H212V16H220V120Z" fill="url(#g)"/><path d="M30 120L66 120L120 0L84 0Z" fill="#ffffff" opacity="0.2"/><path d="M130 120L142 120L192 20L192 0L178 0Z" fill="#ffffff" opacity="0.14"/><path d="M110 120V0" stroke="${BLACK}" stroke-width="3"/><path d="M5 118V20H13V12H21V5H199V12H207V20H215V118Z" fill="none" stroke="${GOLD}" stroke-width="2.6"/></svg>`,
    { size: 512 },
  );
  const sideWin = (flip: boolean) =>
    svg(
      `<svg viewBox="0 0 120 90"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c2a36"/><stop offset="0.6" stop-color="#1f7f8c"/><stop offset="1" stop-color="#f2c26b"/></linearGradient></defs><g ${flip ? 'transform="translate(120 0) scale(-1 1)"' : ""}><path d="M0 90V30H8V22H16V14H24V6H32V0H120V90Z" fill="url(#g)"/><path d="M30 90L60 90L96 0L66 0Z" fill="#ffffff" opacity="0.2"/><path d="M78 90L88 90L120 14L120 0L112 0Z" fill="#ffffff" opacity="0.14"/><path d="M4 88V32H12V24H20V16H28V8H36V4H116V88Z" fill="none" stroke="${GOLD}" stroke-width="1.8"/></g></svg>`,
      { size: 288 },
    );
  const DOOR = svg(
    `<svg viewBox="0 0 100 100"><path d="M5 96V20L13 12H87L95 20V96Z" fill="none" stroke="${GOLD}" stroke-width="1.8"/><path d="M9 92V23L15 17H85L91 23V92Z" fill="none" stroke="${CREAM}" stroke-width="1"/><path d="M5 62H95" stroke="${GOLD}" stroke-width="1.8"/></svg>`,
    { size: 400 },
  );
  const speed = (flip: boolean) =>
    svg(
      `<svg viewBox="0 0 400 60"><g ${flip ? 'transform="translate(400 0) scale(-1 1)"' : ""}><path d="M0 8H330L398 12L330 16H0Z" fill="${GOLD}"/><path d="M40 24H300L360 28L300 32H40Z" fill="${CREAM}"/><path d="M90 40H250L296 44L250 48H90Z" fill="${GOLD}"/><path d="M150 54H220L240 56L220 58H150Z" fill="${CREAM}"/></g></svg>`,
      { size: 800 },
    );
  const LOGO = svg(
    `<svg viewBox="0 0 500 150">${rays(80, 128, 70, 14, GOLD, BLACK, 180, 360)}<rect x="6" y="128" width="148" height="8" fill="${BLACK}"/><path d="M168 114H470L494 122L470 130H168Z" fill="${GOLD}"/><path d="M200 136H440L454 140L440 144H200Z" fill="${BURG}"/><text x="174" y="84" ${FONT} font-size="42" textLength="322" lengthAdjust="spacingAndGlyphs" fill="${GOLD}">GOLDEN ARROW</text><text x="171" y="81" ${FONT} font-size="42" textLength="322" lengthAdjust="spacingAndGlyphs" fill="${BLACK}">GOLDEN ARROW</text><text x="172" y="106" ${FONT} font-size="15" textLength="310" lengthAdjust="spacingAndGlyphs" fill="${BURG}">LIQUID FREIGHT  *  COAST TO COAST</text></svg>`,
    { size: 1400 },
  );
  const FLAP = svg(
    `<svg viewBox="0 0 60 80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#8f98a6"/></linearGradient></defs><rect x="0" y="0" width="60" height="80" rx="4" fill="${BLACK}"/><rect x="3" y="3" width="54" height="74" rx="3" fill="none" stroke="${GOLD}" stroke-width="1.6"/><circle cx="30" cy="16" r="6" fill="url(#g)"/><path d="M26 13Q40 4 52 22Q42 14 34 20Z" fill="url(#g)"/><path d="M22 25Q30 21 38 25L34 36Q32 38 34 40Q42 46 40 52L36 72L31 72L30 56L29 56L28 72L23 72L20 52Q18 46 26 40Q28 38 26 36Z" fill="url(#g)"/></svg>`,
    { size: 256 },
  );
  const MIRR = svg(
    `<svg viewBox="0 0 40 80"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f4f8a"/><stop offset="0.5" stop-color="#6fd0c8"/><stop offset="0.62" stop-color="#ffe6a0"/><stop offset="1" stop-color="#3a2a4e"/></linearGradient></defs><rect width="40" height="80" fill="url(#g)"/><path d="M0 64L18 0L26 0L8 80L0 80Z" fill="#ffffff" opacity="0.25"/></svg>`,
    { size: 128 },
  );
  const PLATE = svg(
    `<svg viewBox="0 0 100 50"><rect width="100" height="50" rx="5" fill="${CREAM}"/><rect x="3" y="3" width="94" height="44" rx="3" fill="none" stroke="${BLACK}" stroke-width="2"/><text x="50" y="30" text-anchor="middle" ${FONT} font-size="20" fill="${BLACK}">GA-1938</text><text x="50" y="43" text-anchor="middle" ${FONT} font-size="8" fill="${BURG}">STREAMLINE</text></svg>`,
    { size: 200 },
  );

  // ---------------------------------------------------------------------------------------------- skeleton
  const chassis = b.joint("chassis", { at: [0, 1.0, 1.0] });
  const trailer = b.joint("trailer", { parent: chassis, at: [0, 1.0, -0.6] });

  const axles = [
    { id: "F", z: 5.6, bone: chassis, xc: 1.0, dual: false, w: 0.34 },
    { id: "D1", z: -0.1, bone: chassis, xc: 0.95, dual: true, w: 0.3 },
    { id: "D2", z: -1.4, bone: chassis, xc: 0.95, dual: true, w: 0.3 },
    { id: "T1", z: -11.2, bone: trailer, xc: 0.95, dual: true, w: 0.3 },
    { id: "T2", z: -12.5, bone: trailer, xc: 0.95, dual: true, w: 0.3 },
  ];
  const wj: Record<string, any> = {};
  for (const ax of axles)
    for (const s of [1, -1])
      wj[ax.id + s] = b.joint(`wheel${ax.id}${s > 0 ? "L" : "R"}`, {
        parent: ax.bone,
        at: [s * ax.xc, WY, ax.z],
        dir: [s, 0, 0],
      });

  // ---------------------------------------------------------------------------------------------- helpers
  const K = (geo: any, color: any, at: number[], o: any = {}) => b.part(geo, color, { bone: chassis, at, ...o });
  const T = (geo: any, color: any, at: number[], o: any = {}) => b.part(geo, color, { bone: trailer, at, ...o });
  const plate = (bone: any, tex: any, w: number, h: number, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), WHITE, { bone, at, dir, axis: "z", texture: tex, ...o });
  const disc = (bone: any, tex: any, r: number, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.CircleGeometry(r, 24), WHITE, { bone, at, dir, axis: "z", texture: tex, ...o });

  // ---------------------------------------------------------------------------------------------- wheels
  for (const ax of axles) {
    const offs = ax.dual ? [{ d: -0.17, outer: false }, { d: 0.17, outer: true }] : [{ d: 0, outer: true }];
    const h = ax.w / 2;
    for (const s of [1, -1]) {
      const bone = wj[ax.id + s];
      for (const o of offs) {
        const x = s * (ax.xc + o.d * 1);
        b.lathe(tireProfile(h), { at: [x, WY, ax.z], axis: [1, 0, 0], segments: 20, color: TREAD, bone, name: `tire${ax.id}` });
        if (o.outer) {
          const xo = x + s * (h + 0.003);
          b.part(new THREE.TorusGeometry(0.36, 0.008, 4, 28), GOLD, { bone, at: [xo, WY, ax.z], dir: [s, 0, 0], axis: "z" });
          b.part(new THREE.CylinderGeometry(0.31, 0.31, ax.w - 0.04, 14), CHROME, { bone, at: [x, WY, ax.z], dir: [1, 0, 0] });
          disc(bone, HUB, 0.29, [x + s * (h - 0.016), WY, ax.z], [s, 0, 0]);
          b.part(new THREE.ConeGeometry(0.07, 0.11, 8), GOLD, { bone, at: [x + s * (h + 0.03), WY, ax.z], dir: [s, 0, 0] });
        }
      }
    }
    // axle shaft, differential and leaf springs
    K(new THREE.CylinderGeometry(0.075, 0.075, 2 * ax.xc + 0.05, 10), DSTEEL, [0, WY, ax.z], { dir: [1, 0, 0], bone: ax.bone });
    if (ax.id !== "F" && ax.bone === chassis) K(new THREE.SphereGeometry(0.24, 10, 8), STEEL, [0, WY, ax.z], { bone: ax.bone });
    for (const s of [1, -1])
      b.part(new THREE.BoxGeometry(0.13, 0.08, 1.05), BLACK, { bone: ax.bone, at: [s * 0.55, WY + 0.17, ax.z] });
  }

  // ---------------------------------------------------------------------------------------------- tractor chassis
  for (const s of [1, -1]) K(new THREE.BoxGeometry(0.14, 0.26, 9.2), BLACK, [s * 0.45, 0.9, 2.5]);
  for (const z of [6.4, 4.6, 2.6, 1.0, -0.7, -1.9]) K(new THREE.BoxGeometry(0.9, 0.12, 0.14), BLACK, [0, 0.9, z]);
  K(new THREE.CylinderGeometry(0.05, 0.05, 3.2, 8), DSTEEL, [0, 0.72, 2.4], { dir: [0, 0, 1] });
  K(new THREE.CylinderGeometry(0.64, 0.64, 0.07, 24), DSTEEL, [0, 1.09, -0.6]);
  K(new THREE.BoxGeometry(0.16, 0.075, 0.7), BLACK, [0, 1.1, -0.95]);
  K(new THREE.TorusGeometry(0.64, 0.02, 4, 24), GOLD, [0, 1.12, -0.6], { dir: [0, 1, 0], axis: "z" });

  // ---------------------------------------------------------------------------------------------- cab & sleeper
  const cabOutline: [number, number][] = [[0, 1.3], [0, 2.3], [0.45, 3.45], [0.62, 3.55], [1.9, 3.55], [1.9, 1.3]];
  b.extrude(cabOutline, { at: [0, 0, 4.6], x: [0, 0, -1], thickness: 2.4, bevel: 0.025, color: CAB_PAINT, bone: chassis, name: "cab" });
  const sleeperOutline: [number, number][] = [[0, 1.3], [0, 3.55], [0.2, 3.72], [1.8, 3.72], [2.2, 3.3], [2.3, 2.9], [2.3, 1.3]];
  b.extrude(sleeperOutline, { at: [0, 0, 2.7], x: [0, 0, -1], thickness: 2.3, bevel: 0.025, color: CAB_PAINT, bone: chassis, name: "sleeper" });

  // ziggurat roof crown
  K(new THREE.BoxGeometry(1.9, 0.1, 1.5), GOLD_L, [0, 3.77, 1.7]);
  K(new THREE.BoxGeometry(1.45, 0.1, 1.1), BLACK_L, [0, 3.87, 1.7]);
  K(new THREE.BoxGeometry(1.0, 0.1, 0.7), GOLD_L, [0, 3.97, 1.7]);
  K(new THREE.BoxGeometry(0.5, 0.08, 0.4), JADE_L, [0, 4.05, 1.7]);
  // sun visor and roof marker lamps
  K(new THREE.BoxGeometry(2.3, 0.04, 0.4), JADE_L, [0, 3.58, 4.2]);
  K(new THREE.BoxGeometry(2.3, 0.02, 0.04), GOLD, [0, 3.585, 4.41]);
  for (let i = -2; i <= 2; i++) glow(K(new THREE.BoxGeometry(0.14, 0.07, 0.07), AMBER, [i * 0.42, 3.64, 4.32]), 1.3);
  // air horns
  const HORN: [number, number][] = [[0, 0], [0.025, 0], [0.03, 0.2], [0.06, 0.38], [0.13, 0.52], [0.14, 0.56], [0, 0.5]];
  for (const s of [1, -1]) {
    b.lathe(HORN, { at: [s * 0.45, 3.62, 3.35], axis: [0, 0.12, 1], segments: 10, color: CHROME, bone: chassis });
    K(new THREE.BoxGeometry(0.08, 0.06, 0.1), GOLD, [s * 0.45, 3.6, 3.3]);
  }

  // windshield (sloped), emblem under it
  const wn = new THREE.Vector3(0, 0.45, 1.2).normalize();
  plate(chassis, WSHIELD, 2.2, 1.1, [0.0 + wn.x * 0.012, 2.9 + wn.y * 0.012, 4.375 + wn.z * 0.012], [wn.x, wn.y, wn.z], { up: [0, 1.2, -0.45] });

  for (const s of [1, -1]) {
    const flip = s < 0;
    plate(chassis, DOOR, 1.3, 2.05, [s * 1.211, 2.42, 3.45], [s, 0, 0]);
    plate(chassis, sideWin(flip), 1.0, 0.85, [s * 1.222, 2.98, 3.45], [s, 0, 0]);
    disc(chassis, EMBLEM, 0.22, [s * 1.215, 1.85, 3.45], [s, 0, 0]);
    K(new THREE.BoxGeometry(0.035, 0.045, 0.18), CHROME, [s * 1.215, 2.3, 3.0]);
    // sleeper side: porthole + speed lines
    disc(chassis, PORTHOLE, 0.25, [s * 1.161, 2.95, 1.35], [s, 0, 0]);
    plate(chassis, speed(flip), 1.9, 0.29, [s * 1.162, 2.15, 1.6], [s, 0, 0]);
    disc(chassis, EMBLEM, 0.2, [s * 1.162, 1.7, 1.0], [s, 0, 0]);
    // running boards
    K(new THREE.BoxGeometry(0.3, 0.05, 1.7), JADE_L, [s * 1.27, 0.98, 3.55]);
    for (let i = 0; i < 6; i++) K(new THREE.BoxGeometry(0.28, 0.015, 0.04), GOLD, [s * 1.27, 1.01, 2.88 + i * 0.28]);
    for (const z of [2.9, 4.2]) K(new THREE.BoxGeometry(0.05, 0.3, 0.05), DSTEEL, [s * 1.2, 1.12, z]);
    // mirror
    b.rod([s * 1.15, 2.7, 4.05], [s * 1.5, 2.95, 4.12], 0.02, STEEL, { bone: chassis });
    K(new THREE.BoxGeometry(0.07, 0.55, 0.26), CHROME, [s * 1.52, 2.95, 4.1]);
    plate(chassis, MIRR, 0.22, 0.5, [s * 1.52, 2.95, 4.1 - 0.135], [0, 0, -1]);
    // stacks
    const STACK: [number, number][] = [[0, 0], [0.17, 0], [0.17, 0.95], [0.2, 1.0], [0.2, 1.06], [0.1, 1.11], [0.1, 2.5], [0.125, 2.55], [0.125, 2.62], [0.1, 2.67], [0.1, 2.78], [0.17, 2.95], [0.17, 3.0], [0, 3.0]];
    b.lathe(STACK, { at: [s * 1.3, 1.25, 2.55], segments: 10, color: CHROME, bone: chassis, name: "stack" });
    for (const y of [1.28, 2.0, 3.85]) K(new THREE.TorusGeometry(y === 1.28 ? 0.205 : y === 2.0 ? 0.205 : 0.125, 0.012, 4, 14), GOLD, [s * 1.3, y, 2.55], { dir: [0, 1, 0], axis: "z" });
    for (const y of [2.0, 3.2]) K(new THREE.BoxGeometry(0.22, 0.05, 0.05), DSTEEL, [s * 1.2, y, 2.55]);
    // fuel tank
    K(new THREE.CylinderGeometry(0.32, 0.32, 1.5, 12), CHROME, [s * 1.05, 0.78, 1.55], { dir: [0, 0, 1] });
    for (const z of [1.15, 1.95]) K(new THREE.TorusGeometry(0.328, 0.014, 4, 16), GOLD, [s * 1.05, 0.78, z]);
    K(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 8), GOLD, [s * 1.05, 1.12, 1.9]);
  }

  // ---------------------------------------------------------------------------------------------- hood, grille, ornament
  const hood = b.loft(
    [
      { at: [0, 1.85, 4.65], w: 1.3, h: 1.0 },
      { at: [0, 1.82, 5.8], w: 1.22, h: 0.96 },
      { at: [0, 1.76, 6.95], w: 1.02, h: 0.84 },
    ],
    { bone: chassis, color: HOOD_PAINT, name: "hood" },
  );
  const skin = b.surface(hood);
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      const hit = skin.ray([s * 3, 1.5 + 0.1 * i, 5.7], [-s, 0, 0]);
      if (hit) b.stick(new THREE.BoxGeometry(0.04, 0.035, 0.95 - 0.1 * i), GOLD, hit, { flow: [0, 0, 1] });
    }
  // grille: gold ziggurat crest, black backing, skyline of chrome slats, medallion
  b.extrude(zig(0.55, 1.35), { at: [0, 1.33, 7.0], x: [1, 0, 0], thickness: 0.06, bevel: 0.01, color: GOLD_L, bone: chassis });
  b.extrude(zig(0.47, 1.2), { at: [0, 1.4, 7.045], x: [1, 0, 0], thickness: 0.02, color: BLACK, bone: chassis });
  for (let i = -5; i <= 5; i++) {
    const x = i * 0.08;
    const hh = zigTop(x, 0.47, 1.2) * 0.72;
    K(new THREE.BoxGeometry(0.035, hh, 0.06), CHROME, [x, 1.4 + hh / 2, 7.09]);
  }
  disc(chassis, EMBLEM, 0.17, [0, 2.45, 7.062], [0, 0, 1]);
  // bumper
  K(new THREE.BoxGeometry(2.0, 0.28, 0.14), CHROME, [0, 0.95, 7.22]);
  K(new THREE.BoxGeometry(2.0, 0.03, 0.15), GOLD, [0, 0.95, 7.22]);
  for (const s of [1, -1]) {
    K(new THREE.BoxGeometry(0.55, 0.28, 0.14), CHROME, [s * 1.2, 0.95, 7.0], { rotation: [0, s * 35, 0] });
    K(new THREE.BoxGeometry(0.1, 0.35, 0.08), DSTEEL, [s * 0.4, 1.0, 7.0]);
  }
  plate(chassis, PLATE, 0.3, 0.15, [0, 1.15, 7.3], [0, 0, 1]);
  // hood ornament: streamlined flying arrow with swept wings
  const top = skin.ray([0, 5, 6.55], [0, -1, 0]);
  if (top) {
    const o = top.at;
    b.lathe([[0, 0], [0.1, 0], [0.07, 0.06], [0.04, 0.14], [0, 0.16]], { at: [o.x, o.y - 0.02, o.z], segments: 8, color: GOLD, bone: chassis });
    b.extrude([[-0.3, 0], [0.38, 0], [0.46, 0.05], [0.3, 0.1], [-0.05, 0.14], [-0.3, 0.3]], { at: [o.x, o.y + 0.14, o.z], x: [0, 0, 1], thickness: 0.035, color: CHROME, bone: chassis });
    for (const s of [1, -1])
      b.extrude([[0, 0.02], [0.46, 0.34], [0.46, 0.42], [0.2, 0.3], [0, 0.2]], { at: [o.x, o.y + 0.24, o.z + 0.12], x: [s, 0, 0], y: [0, 0, -1], thickness: 0.025, color: GOLD, bone: chassis });
  }

  // ---------------------------------------------------------------------------------------------- front fenders & lamps
  for (const s of [1, -1]) {
    b.extrude(arch(0.85, 0.68, 0.05), { at: [s * 1.0, 0.5, 5.6], x: [0, 0, 1], thickness: 0.56, color: FENDER_PAINT, bone: chassis, name: "fender" });
    b.extrude([[0, 0], [0.95, 0], [0.55, 0.14], [0.12, 0.22]], { at: [s * 1.0, 1.17, 5.95], x: [0, 0, -1], thickness: 0.035, color: CHROME, bone: chassis });
    b.rod([s * 0.9, 1.17, 6.2], [s * 0.93, 1.42, 6.4], 0.035, STEEL, { bone: chassis });
    const POD: [number, number][] = [[0, -0.25], [0.1, -0.22], [0.19, -0.1], [0.2, 0.05], [0.18, 0.17], [0.17, 0.2], [0, 0.2]];
    b.lathe(POD, { at: [s * 0.93, 1.58, 6.4], axis: [0, 0, 1], segments: 12, color: CHROME, bone: chassis, name: "lamp" });
    K(new THREE.TorusGeometry(0.17, 0.012, 4, 20), GOLD, [s * 0.93, 1.58, 6.6]);
    glow(disc(chassis, LENS, 0.15, [s * 0.93, 1.58, 6.605], [0, 0, 1]), 1.4);
  }

  // ---------------------------------------------------------------------------------------------- tandem fenders, flaps
  for (const s of [1, -1]) {
    b.extrude(arch(1.25, 0.7, 0.05), { at: [s * 0.95, 0.5, -0.75], x: [0, 0, 1], thickness: 0.72, color: FENDER_PAINT, bone: chassis, name: "driveFender" });
    K(new THREE.BoxGeometry(0.05, 0.05, 0.3), DSTEEL, [s * 0.6, 1.2, -0.75]);
    K(new THREE.BoxGeometry(0.55, 0.04, 0.04), STEEL, [s * 0.95, 1.0, -2.0]);
    plate(chassis, FLAP, 0.5, 0.62, [s * 0.95, 0.66, -2.0], [0, 0, -1]);
    // trailer side skirt etc. (tractor-side nothing else)
  }

  // ---------------------------------------------------------------------------------------------- air lines
  const helix = (x: number, color: string) => {
    const pts: number[][] = [];
    const N = 48;
    for (let i = 0; i <= N; i++) {
      const a = i * 0.85;
      pts.push([x + 0.05 * Math.cos(a), 2.5 + 0.05 * Math.sin(a), 0.4 + (-0.95 - 0.4) * (i / N)]);
    }
    b.sweep(catmull(pts), 0.011, { color, bone: chassis, sides: 4 });
  };
  helix(0.3, RED);
  helix(-0.3, YELLOW);
  K(new THREE.BoxGeometry(0.9, 0.3, 0.06), DSTEEL, [0, 2.5, 0.37]);

  // ---------------------------------------------------------------------------------------------- trailer frame
  for (const s of [1, -1]) T(new THREE.BoxGeometry(0.14, 0.2, 12.6), BLACK, [s * 0.55, 0.88, -7.1]);
  T(new THREE.BoxGeometry(1.8, 0.08, 1.3), DSTEEL, [0, 1.14, -1.4]);
  for (const z of [-2.0, -4.5, -7.0, -9.5, -11.8]) T(new THREE.BoxGeometry(1.3, 0.14, 0.22), BLACK, [0, 1.0, z]);
  for (const z of [-3.0, -8.0, -10.4]) T(new THREE.BoxGeometry(1.1, 0.1, 0.12), BLACK, [0, 0.8, z]);
  // landing gear (raised)
  for (const s of [1, -1]) {
    T(new THREE.BoxGeometry(0.1, 0.55, 0.1), STEEL, [s * 0.8, 0.62, -3.4]);
    T(new THREE.BoxGeometry(0.3, 0.04, 0.25), DSTEEL, [s * 0.8, 0.32, -3.4]);
  }
  T(new THREE.BoxGeometry(1.6, 0.06, 0.06), STEEL, [0, 0.55, -3.4]);

  // ---------------------------------------------------------------------------------------------- the chrome tank
  const PROFILE: [number, number][] = [
    [0, 0], [0.45, 0.04], [0.8, 0.14], [1.02, 0.33], [1.12, 0.6], [1.15, 0.9],
    [1.15, TANK_LEN - 0.9], [1.12, TANK_LEN - 0.6], [1.02, TANK_LEN - 0.33], [0.8, TANK_LEN - 0.14], [0.45, TANK_LEN - 0.04], [0, TANK_LEN],
  ];
  const tank = b.lathe(PROFILE, { at: [0, TANK_Y, TANK_Z0], axis: [0, 0, -1], segments: 24, color: CHROME, bone: trailer, name: "tank" });
  for (const z of [-2.0, -2.35, -10.8, -11.15]) {
    T(new THREE.TorusGeometry(1.175, 0.032, 5, 28), GOLD, [0, TANK_Y, z]);
  }
  for (const z of [-2.18, -10.98]) T(new THREE.TorusGeometry(1.18, 0.02, 4, 28), BURG, [0, TANK_Y, z]);
  // brand decals conform to the tank
  for (const s of [1, -1])
    b.decal(tank, LOGO, { at: [s * 1.15, TANK_Y, -6.6], dir: [s, 0, 0], size: [5.4, 1.55], segments: 26 });
  b.decal(tank, EMBLEM, { at: [0, TANK_Y, -13.3], dir: [0, 0, -1], size: [0.8, 0.8], segments: 8 });
  b.decal(tank, EMBLEM, { at: [0, TANK_Y + 0.3, -0.92], dir: [0, 0, 1], size: [0.7, 0.7], segments: 8 });

  // catwalk, rails, hatches
  T(new THREE.BoxGeometry(1.0, 0.05, 7.4), DSTEEL, [0, 3.37, -6.6]);
  for (const s of [1, -1]) {
    for (const z of [-3.2, -5.4, -7.6, -9.8]) T(new THREE.BoxGeometry(0.04, 0.55, 0.04), CHROME, [s * 0.5, 3.62, z]);
    b.rod([s * 0.5, 3.88, -3.0], [s * 0.5, 3.88, -10.2], 0.02, CHROME, { bone: trailer });
    b.rod([s * 0.5, 3.66, -3.0], [s * 0.5, 3.66, -10.2], 0.014, GOLD, { bone: trailer });
  }
  const DOME: [number, number][] = [[0, 0], [0.32, 0], [0.32, 0.05], [0.3, 0.1], [0.2, 0.18], [0, 0.2]];
  for (const z of [-3.6, -6.9, -10.0]) {
    b.lathe(DOME, { at: [0, 3.4, z], segments: 12, color: CHROME, bone: trailer, name: "hatch" });
    T(new THREE.TorusGeometry(0.33, 0.016, 4, 16), GOLD, [0, 3.44, z], { dir: [0, 1, 0], axis: "z" });
    T(new THREE.BoxGeometry(0.1, 0.1, 0.1), STEEL, [0, 3.62, z]);
  }
  // side skirts with speed lines and marker lamps
  for (const s of [1, -1]) {
    T(new THREE.BoxGeometry(0.04, 0.46, 7.4), BLACK_L, [s * 1.12, 0.9, -6.0]);
    plate(trailer, speed(s < 0), 7.0, 0.3, [s * 1.141, 0.9, -6.0], [s, 0, 0]);
    for (const z of [-2.9, -6.0, -9.1]) {
      T(new THREE.BoxGeometry(0.6, 0.05, 0.06), DSTEEL, [s * 0.83, 0.95, z]);
      glow(T(new THREE.BoxGeometry(0.04, 0.06, 0.12), AMBER, [s * 1.15, 1.1, z]), 1.3);
    }
    // trailer fenders, mud flaps
    b.extrude(arch(1.3, 0.68, 0.05), { at: [s * 0.95, 0.5, -11.85], x: [0, 0, 1], thickness: 0.72, color: CHROME, bone: trailer, name: "trailerFender" });
    T(new THREE.BoxGeometry(0.55, 0.04, 0.04), STEEL, [s * 0.95, 1.0, -13.15]);
    plate(trailer, FLAP, 0.5, 0.62, [s * 0.95, 0.66, -13.15], [0, 0, -1]);
    // tail lights on brackets
    T(new THREE.BoxGeometry(0.08, 0.9, 0.08), DSTEEL, [s * 1.0, 1.35, -13.0]);
    T(new THREE.BoxGeometry(0.22, 0.44, 0.14), CHROME, [s * 1.0, 1.75, -13.12]);
    T(new THREE.BoxGeometry(0.24, 0.02, 0.15), GOLD, [s * 1.0, 1.98, -13.12]);
    glow(plate(trailer, TAIL, 0.15, 0.36, [s * 1.0, 1.75, -13.197], [0, 0, -1]), 1.3);
  }
  // rear bumper (ICC bar)
  T(new THREE.BoxGeometry(2.3, 0.16, 0.1), CHROME, [0, 0.78, -13.4]);
  T(new THREE.BoxGeometry(2.3, 0.02, 0.11), GOLD, [0, 0.78, -13.4]);
  for (const s of [1, -1]) T(new THREE.BoxGeometry(0.08, 0.2, 0.3), DSTEEL, [s * 0.7, 0.8, -13.25]);
  plate(trailer, PLATE, 0.3, 0.15, [0, 1.15, -13.47], [0, 0, -1]);

  return b.root;
}
