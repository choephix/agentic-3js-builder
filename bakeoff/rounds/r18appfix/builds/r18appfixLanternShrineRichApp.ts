// Roadside shrine: a vermilion torii, stone lanterns, fox guardians, a small hokora with offerings, a sakura tree.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { grain, mottle, noise, paint, spots, stripes } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Lantern Shrine",
  description:
    "A roadside shrine in cel-shaded anime style: vermilion torii with a straw rope, stone lanterns and fox guardians, a small hokora with a glowing orb, offerings, ema plaques, a water basin, bamboo and a lantern-hung sakura.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type ColorInput = string | Paint;
type Pt = [number, number, number];
type Pr = [number, number][];

const svgStrokes = (n: number, f: (i: number) => string) => Array.from({ length: n }, (_, i) => f(i)).join("");

export default function build() {
  const b = createBuilder({ name: "lanternShrine", paintSize: 2048 });
  const R = rng(1303);
  const rr = (lo: number, hi: number) => lo + (hi - lo) * R();
  const root = b.joint("root", { at: [0, 0, 0] });

  // ---------------------------------------------------------------- levels
  const G = 0.14; // grass top
  const GY = G + 0.04; // gravel top
  const FY = G + 0.4; // shrine deck top
  const TZ = 1.9; // torii z

  // ---------------------------------------------------------------- palette (every colour a two-tone cel)
  const RED = cel(grain("#e2523f", "#d4453d", { size: 0.025 }), "#a42c4c");
  const RED_F = cel("#de4a3c", "#a42c4c");
  const LACQ = cel("#4a3658", "#2c2040");
  const GOLD = cel("#ffd466", "#d58f30");
  const CREAM = cel("#fbf0d8", "#dcc6c2");
  const WOOD = cel(grain("#cd8f5e", "#bb7b52", { size: 0.04 }), "#8f5a52");
  const WOOD_D = cel(grain("#8c5c44", "#7b4d3b", { size: 0.04 }), "#5a3a50");
  const INDIGO = cel("#3a3c80", "#27285a");
  const STONE = cel("#dcdee9", "#a9aacb");
  const STONE_B = cel("#c9cde1", "#9fa1c6");
  const MOSS = cel("#92d06c", "#5f9f7c");
  const PINK = cel("#ffb9d2", "#e486b6");
  const PINK_B = cel("#ff9fc4", "#df72ac");
  const PINK_C = cel("#ffd3e2", "#f0a0c4");
  const BARK = cel(grain("#7c5b50", "#68483f", { size: 0.05 }), "#4a3550");
  const TILE_A = cel("#5f6bbb", "#3d4893");
  const TILE_B = cel("#505cab", "#353f84");
  const TILE_L = cel("#2c3374", "#222858");
  const SOFFIT = cel("#c78a62", "#8d5a58");
  const STRAW = cel("#f2de94", "#d5b872");
  const STRAW_D = cel("#cfae62", "#a98450");
  const GRASS = cel(mottle("#95da6c", "#7bc860", { size: 0.55, seed: 3 }), "#4fa070");
  const DIRT = cel(spots("#dfbd8c", "#c9a273", { size: 0.18, amount: 0.6, seed: 4 }), "#a07860");
  const RUT = cel("#bd9467", "#8f6a58");
  const EARTH = cel(mottle("#a97551", "#8d6049", { size: 0.2, seed: 5 }), "#6a4650");
  const GRAVEL = cel(stripes("#f4edda", "#ddd3ba", { size: 0.1, axis: "x", width: 0.32, wobble: 0.12, seed: 2 }), "#b9b0c8");
  const WATER = cel("#86dcf0", "#5aa8d8");
  const BAMBOO = cel("#85d25c", "#4f9f6c");
  const BAMBOO_N = cel("#4f9c48", "#36785c");
  const CERAMIC = cel("#f6f4ff", "#c7c0e6");
  const ORANGE = cel("#ffa33a", "#e0603c");
  const APPLE = cel("#ec4a45", "#a82c58");
  const BRONZE = cel("#c9964f", "#8f5a48");
  const PURPLE_G = "#b985ff";
  const TEAL_G = "#6fe8e0";

  const stoneP = (seed: number, mossy = 0.6) =>
    paint((p, n) => {
      if ((n.y > 0.25 && noise(p, 0.22, seed) > mossy) || (p.y < 0.4 && noise(p, 0.16, seed + 9) > 0.5)) return MOSS;
      return noise(p, 0.5, seed + 4) > 0.55 ? STONE_B : STONE;
    });
  const STONE_P = stoneP(11);

  // ---------------------------------------------------------------- textures
  const shideTex = svg(
    `<svg viewBox="0 0 32 80"><g fill="#ffffff" stroke="#c4bcd8" stroke-width="1.2" stroke-linejoin="round">${svgStrokes(4, (i) => {
      const a = i % 2 === 0 ? 4 : 12;
      const c = i % 2 === 0 ? 12 : 4;
      return `<polygon points="${a},${i * 20} ${a + 16},${i * 20} ${c + 16},${i * 20 + 20} ${c},${i * 20 + 20}"/>`;
    })}</g></svg>`,
    { size: 160 },
  );
  const tasselTex = svg(
    `<svg viewBox="0 0 24 72"><rect x="11" y="0" width="2" height="6" fill="#ffd466"/><circle cx="12" cy="10" r="6" fill="#ffd466" stroke="#c98a2e" stroke-width="1"/><rect x="8" y="16" width="8" height="6" fill="#e2523f"/>${svgStrokes(
      7,
      (i) => `<path d="M${12 + (i - 3) * 0.8} 22 L${4 + i * 2.7} 70" stroke="${i % 2 ? "#e2523f" : "#ffd466"}" stroke-width="2.4" fill="none"/>`,
    )}</svg>`,
    { size: 192 },
  );
  const petalTex = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 31 C3 24 2 9 10 3 L16 9 L22 3 C30 9 29 24 16 31Z" fill="#ffc3d8" stroke="#f092b6" stroke-width="1.4"/><path d="M16 29 L16 13" stroke="#f9a3c3" stroke-width="1.6"/></svg>`,
    { size: 64 },
  );
  const petalTex2 = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 31 C3 24 2 9 10 3 L16 9 L22 3 C30 9 29 24 16 31Z" fill="#ffe0eb" stroke="#f6a8c6" stroke-width="1.4"/><path d="M16 29 L16 13" stroke="#fbb9d0" stroke-width="1.6"/></svg>`,
    { size: 64 },
  );
  const grassTex = svg(
    `<svg viewBox="0 0 40 40"><path d="M6 40 Q8 20 2 6 Q14 18 15 40Z" fill="#5fb850"/><path d="M14 40 Q16 14 14 0 Q24 16 23 40Z" fill="#86d35f"/><path d="M22 40 Q26 22 36 10 Q32 28 30 40Z" fill="#6cc455"/><path d="M28 40 Q34 28 40 22 Q38 34 36 40Z" fill="#9be06f"/></svg>`,
    { size: 128 },
  );
  const flower = (petal: string, heart: string) =>
    svg(
      `<svg viewBox="0 0 32 44"><path d="M16 44 L16 20" stroke="#5fb850" stroke-width="3" fill="none"/><path d="M16 36 Q24 32 26 26 Q18 28 16 36Z" fill="#6cc455"/>${svgStrokes(
        5,
        (i) => `<ellipse cx="16" cy="9" rx="4.6" ry="7" fill="${petal}" transform="rotate(${i * 72} 16 15)"/>`,
      )}<circle cx="16" cy="15" r="3.6" fill="${heart}"/></svg>`,
      { size: 128 },
    );
  const flowerW = flower("#ffffff", "#ffd24a");
  const flowerV = flower("#c9a6ff", "#fff0a0");
  const lilyTex = svg(
    `<svg viewBox="0 0 48 52"><path d="M24 52 L24 30" stroke="#8bf0e8" stroke-width="3" fill="none"/>${svgStrokes(
      6,
      (i) => `<path d="M24 28 C14 20 16 6 24 0 C32 6 34 20 24 28Z" fill="${i % 2 ? "#7ff0ff" : "#a9f7ff"}" stroke="#e8ffff" stroke-width="1" transform="rotate(${-75 + i * 30} 24 28)"/>`,
    )}<circle cx="24" cy="26" r="4" fill="#ffffff"/></svg>`,
    { size: 160 },
  );
  const leafTex = svg(
    `<svg viewBox="0 0 12 40"><path d="M6 0 Q13 18 6 40 Q-1 18 6 0Z" fill="#74d062"/><path d="M6 4 L6 38" stroke="#4aa84a" stroke-width="1.2"/></svg>`,
    { size: 96 },
  );
  const sigilTex = svg(
    `<svg viewBox="0 0 64 64" fill="none" stroke="#d8baff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><circle cx="32" cy="32" r="27"/><circle cx="32" cy="32" r="21" stroke-width="1.6"/><polygon points="35,10 21,35 31,35 27,54 44,26 33,26" fill="#c79bff" stroke="#f1e4ff" stroke-width="1.6"/><path d="M6 32 H12 M52 32 H58 M32 6 V12 M32 52 V58"/></svg>`,
    { size: 192 },
  );
  const gegyoTex = svg(
    `<svg viewBox="0 0 64 64" stroke="#b97a22" stroke-width="1.6" stroke-linejoin="round">${svgStrokes(
      5,
      (i) => `<path d="M32 40 C22 30 22 14 32 4 C42 14 42 30 32 40Z" fill="#ffd466" transform="rotate(${(i - 2) * 38} 32 44)"/>`,
    )}<path d="M10 52 Q32 36 54 52 Q32 60 10 52Z" fill="#ffd466"/><circle cx="32" cy="46" r="4" fill="#ff8a4a"/></svg>`,
    { size: 192 },
  );
  const doorTex = svg(
    `<svg viewBox="0 0 40 100"><rect width="40" height="100" fill="#d9483b"/><rect x="4" y="4" width="32" height="92" fill="#fbf0d8"/><g stroke="#e0a53c" stroke-width="1.5" fill="none">${svgStrokes(
      9,
      (i) => `<path d="M4 ${4 + i * 11} L36 ${15 + i * 11 - 11 * 2 + 22}"/><path d="M36 ${4 + i * 11} L4 ${15 + i * 11 - 22 + 22}"/>`,
    )}</g><rect x="4" y="4" width="32" height="92" fill="none" stroke="#e0a53c" stroke-width="2"/><circle cx="20" cy="50" r="5" fill="#ffd466" stroke="#b97a22" stroke-width="1.2"/><circle cx="20" cy="50" r="2" fill="#c8334a"/></svg>`,
    { size: 256 },
  );
  const windowTex = svg(
    `<svg viewBox="0 0 24 60"><rect width="24" height="60" fill="#d9483b"/><rect x="3" y="3" width="18" height="54" fill="#2e3270"/><g stroke="#e0a53c" stroke-width="1.4">${svgStrokes(
      6,
      (i) => `<path d="M${6 + i * 3} 3 V57"/>`,
    )}${svgStrokes(8, (i) => `<path d="M3 ${9 + i * 6} H21"/>`)}</g></svg>`,
    { size: 192 },
  );
  const runnerTex = svg(
    `<svg viewBox="0 0 120 40"><rect width="120" height="40" fill="#c8334a"/><rect x="0" y="3" width="120" height="2" fill="#ffd466"/><rect x="0" y="35" width="120" height="2" fill="#ffd466"/>${svgStrokes(
      8,
      (i) =>
        `<g fill="none" stroke="#ffd466" stroke-width="1.4"><circle cx="${8 + i * 15.5}" cy="20" r="8"/><circle cx="${8 + i * 15.5}" cy="20" r="5"/><circle cx="${8 + i * 15.5}" cy="20" r="2" fill="#ffd466"/></g>`,
    )}</svg>`,
    { size: 384 },
  );
  const labelTex = svg(
    `<svg viewBox="0 0 40 60"><rect width="40" height="60" fill="#fbf0d8" stroke="#c8334a" stroke-width="3"/><circle cx="20" cy="18" r="9" fill="#c8334a"/><path d="M8 36 H32 M20 32 V54 M10 46 Q20 52 30 46" stroke="#2c2040" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
    { size: 160 },
  );
  const steleTex = svg(
    `<svg viewBox="0 0 40 100" stroke="#4a4a70" stroke-width="2.6" stroke-linecap="round" fill="none">${svgStrokes(
      2,
      (c) =>
        svgStrokes(
          5,
          (i) =>
            `<g transform="translate(${c * 20 + 8},${8 + i * 18})"><path d="M0 4 H10 M5 0 V12 M1 10 Q5 6 9 10 M2 14 L8 14"/></g>`,
        ),
    )}</svg>`,
    { size: 256 },
  );
  const lanternTex = svg(
    `<svg viewBox="0 0 128 128"><rect width="128" height="128" fill="#ffa24a"/>${svgStrokes(
      13,
      (i) => `<rect x="0" y="${14 + i * 8}" width="128" height="2.4" fill="#e8692c"/>`,
    )}<rect width="128" height="10" fill="#4a2d4f"/><rect y="118" width="128" height="10" fill="#4a2d4f"/>${svgStrokes(
      4,
      (i) =>
        `<g transform="translate(${16 + i * 32},64)"><circle r="17" fill="#fff3d6"/><circle r="17" fill="none" stroke="#d6453b" stroke-width="2.6"/><path d="M2 -12 L-7 2 H-1 L-4 13 L8 -3 H2 Z" fill="#8b55e0"/></g>`,
    )}</svg>`,
    { size: 256 },
  );
  const noboriA = svg(
    `<svg viewBox="0 0 48 200"><polygon points="0,0 48,0 48,200 24,180 0,200" fill="#d9483b"/><polygon points="3,3 45,3 45,190 24,172 3,190" fill="none" stroke="#fbf0d8" stroke-width="2"/><circle cx="24" cy="44" r="14" fill="#ffd466" stroke="#fff2c2" stroke-width="2"/><polygon points="26,32 18,46 24,46 21,58 31,42 25,42" fill="#7b4bd8"/><g stroke="#fbf0d8" stroke-width="4.5" stroke-linecap="round" fill="none"><path d="M12 82 h24 M24 82 v36 M14 100 h20 M16 124 q8 12 16 0"/><path d="M12 140 h24 M24 140 v18 M14 150 q10 -8 20 0 M16 162 l16 0"/></g></svg>`,
    { size: 256 },
  );
  const noboriB = svg(
    `<svg viewBox="0 0 48 200"><polygon points="0,0 48,0 48,200 24,180 0,200" fill="#323d8f"/><polygon points="3,3 45,3 45,190 24,172 3,190" fill="none" stroke="#ffd466" stroke-width="2"/><polygon points="8,26 22,46 8,58" fill="#ffd466"/><polygon points="40,26 26,46 40,58" fill="#ffd466"/><circle cx="24" cy="56" r="11" fill="#fbf0d8"/><circle cx="20" cy="54" r="1.8" fill="#2c2040"/><circle cx="28" cy="54" r="1.8" fill="#2c2040"/><g stroke="#ffd466" stroke-width="4.5" stroke-linecap="round" fill="none"><path d="M12 86 h24 M24 86 v34 M14 106 q10 -8 20 0 M16 126 l16 0"/><path d="M14 142 h20 M24 142 v22 M14 154 q10 8 20 0"/></g></svg>`,
    { size: 256 },
  );
  const ema = (inner: string) =>
    svg(`<svg viewBox="0 0 64 56" stroke-linejoin="round" stroke-linecap="round">${inner}</svg>`, { size: 128 });
  const emaTex = [
    ema(
      `<polygon points="8,2 26,16 10,28" fill="#ff9a3c"/><polygon points="56,2 38,16 54,28" fill="#ff9a3c"/><polygon points="12,14 32,22 52,14 56,36 32,52 8,36" fill="#fff"/><ellipse cx="22" cy="32" rx="2.6" ry="3.6" fill="#2c2040"/><ellipse cx="42" cy="32" rx="2.6" ry="3.6" fill="#2c2040"/><ellipse cx="32" cy="42" rx="3.4" ry="2.4" fill="#2c2040"/><circle cx="16" cy="40" r="4" fill="#ff9aaa"/><circle cx="48" cy="40" r="4" fill="#ff9aaa"/>`,
    ),
    ema(
      svgStrokes(5, (i) => `<ellipse cx="32" cy="14" rx="9" ry="13" fill="#ffc3d8" stroke="#f092b6" stroke-width="2" transform="rotate(${i * 72} 32 28)"/>`) +
        `<circle cx="32" cy="28" r="5" fill="#ffd24a"/>`,
    ),
    ema(`<polygon points="38,2 18,30 30,30 24,54 46,22 33,22" fill="#b985ff" stroke="#7b4bd8" stroke-width="3"/>`),
    ema(
      `<circle cx="32" cy="28" r="13" fill="#ffd466" stroke="#e0a53c" stroke-width="3"/>` +
        svgStrokes(12, (i) => `<path d="M32 8 V2" stroke="#e0a53c" stroke-width="4" transform="rotate(${i * 30} 32 28)"/>`),
    ),
    ema(
      `<path d="M4 30 Q16 14 28 30 T52 30" stroke="#4f9ae0" stroke-width="5" fill="none"/><path d="M8 44 Q20 28 32 44 T56 44" stroke="#7ec4f5" stroke-width="5" fill="none"/>`,
    ),
    ema(`<path d="M42 6 A24 24 0 1 0 54 40 A19 19 0 1 1 42 6Z" fill="#ffe68a" stroke="#e0a53c" stroke-width="2.4"/><circle cx="50" cy="14" r="3.4" fill="#fff"/>`),
  ];

  // ---------------------------------------------------------------- helpers
  const P = (geo: THREE.BufferGeometry, color: ColorInput, at: Pt, o: object = {}) => b.part(geo, color, { bone: root, at, ...o });
  const box = (w: number, h: number, d: number, color: ColorInput, at: Pt, o: object = {}) => P(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: ColorInput, at: Pt, o: object = {}) =>
    P(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, o);
  const ball = (r: number, color: ColorInput, at: Pt, o: object = {}, ws = 8, hs = 6) => P(new THREE.SphereGeometry(r, ws, hs), color, at, o);
  const lathe = (pts: Pr, at: Pt, color: ColorInput, seg = 12, o: object = {}) => b.lathe(pts, { at, segments: seg, color, bone: root, ...o });
  const extr = (pts: Pr, at: Pt, x: Pt, y: Pt, thickness: number | [number, number], color: ColorInput, o: object = {}) =>
    b.extrude(pts, { at, x, y, thickness, color, bone: root, ...o });
  const swp = (path: Pt[] | ReturnType<typeof catmull>, radius: Parameters<typeof b.sweep>[1], color: ColorInput, o: object = {}) =>
    b.sweep(path, radius, { color, bone: root, ...o });
  const rod = (a: Pt, c: Pt, r: number | [number, number], color: ColorInput, o: object = {}) => b.rod(a, c, r, { color, bone: root, ...o });
  const xf = (g: THREE.BufferGeometry, p: Pt, rot: Pt = [0, 0, 0], s: Pt = [1, 1, 1]) =>
    g.clone().applyMatrix4(
      new THREE.Matrix4().compose(
        new THREE.Vector3(...p),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])),
        new THREE.Vector3(...s),
      ),
    );
  const mergeTo = (geos: THREE.BufferGeometry[], color: ColorInput, o: object = {}) =>
    b.part(mergeGeometries(geos, false)!, color, { bone: root, at: [0, 0, 0], ...o });
  const roundRect = (w: number, h: number, r: number, seg = 3): Pr => {
    const out: Pr = [];
    const corners: [number, number, number][] = [
      [w / 2 - r, h / 2 - r, 0],
      [-w / 2 + r, h / 2 - r, 90],
      [-w / 2 + r, -h / 2 + r, 180],
      [w / 2 - r, -h / 2 + r, 270],
    ];
    for (const [cx, cy, a0] of corners)
      for (let i = 0; i <= seg; i++) {
        const a = ((a0 + (90 * i) / seg) * Math.PI) / 180;
        out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
    return out;
  };
  const blob = (rx: number, ry: number, n: number, jit: number): Pr =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const k = 1 + rr(-jit, jit);
      return [Math.cos(a) * rx * k, Math.sin(a) * ry * k] as [number, number];
    });
  const ringPts = (cx: number, cy: number, cz: number, rx: number, rz: number, n = 8): Pt[] =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return [cx + Math.cos(a) * rx, cy, cz + Math.sin(a) * rz] as Pt;
    });
  const hang = (pts: Pt[], tex: THREE.Texture, size: [number, number], bone: unknown = root, o: object = {}) =>
    b.cards(
      pts.map((p) => frame(p, [0, 1, 0])),
      tex,
      { size, lean: 180, flow: [0, 0, 1], bone, ...o } as Parameters<typeof b.cards>[2],
    );
  const bar2 = (a: [number, number], c: [number, number], w: number): Pr => {
    const dx = c[0] - a[0];
    const dy = c[1] - a[1];
    const l = Math.hypot(dx, dy);
    const nx = (-dy / l) * (w / 2);
    const ny = (dx / l) * (w / 2);
    return [
      [a[0] + nx, a[1] + ny],
      [c[0] + nx, c[1] + ny],
      [c[0] - nx, c[1] - ny],
      [a[0] - nx, a[1] - ny],
    ];
  };

  // ================================================================ GROUND
  const outline: Pr = [];
  const NB = 48;
  for (let i = 0; i < NB; i++) {
    const a = (i / NB) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const k = 1 + 0.022 * Math.sin(a * 5 + 1) + 0.018 * Math.sin(a * 9);
    outline.push([3.1 * Math.sign(c) * Math.abs(c) ** 0.45 * k, 3.15 * Math.sign(s) * Math.abs(s) ** 0.45 * k]);
  }
  const groundP = paint((p, n) => {
    if (n.y < 0.5) return EARTH;
    const edge = 2.42 + 0.06 * Math.sin(p.x * 2.7) + 0.04 * Math.sin(p.x * 6.1);
    if (p.z > edge) {
      const rut = Math.abs(((p.z - 2.8) % 0.34) + (p.z < 2.8 ? 0.34 : 0)) ;
      return rut > 0.2 && rut < 0.29 && p.z > edge + 0.18 && p.z < 3.25 ? RUT : DIRT;
    }
    return GRASS;
  });
  const base = extr(outline, [0, 0.07, 0.2], [1, 0, 0], [0, 0, -1], 0.14, groundP, { bevel: 0.03 });

  // raked gravel court with stone curb and flagstones
  extr(roundRect(3.3, 3.15, 0.3), [0, G + 0.02, 0.72], [1, 0, 0], [0, 0, -1], 0.04, GRAVEL, { bevel: 0.01 });
  const curb: THREE.BufferGeometry[][] = [[], [], []];
  const curbAt = (x: number, z: number, along: "x" | "z", i: number) =>
    curb[i % 3].push(
      xf(new THREE.BoxGeometry(along === "x" ? 0.3 : 0.14, 0.1, along === "x" ? 0.14 : 0.3), [x, G + 0.05, z], [rr(-0.05, 0.05), rr(-0.08, 0.08), rr(-0.05, 0.05)]),
    );
  for (let z = -0.7, i = 0; z <= 2.2; z += 0.33, i++) {
    curbAt(-1.68, z, "z", i);
    curbAt(1.68, z, "z", i + 1);
  }
  for (let x = -1.5, i = 0; x <= 1.5; x += 0.32, i++) if (Math.abs(x) > 0.62) curbAt(x, 2.28, "x", i);
  curb.forEach((g, i) => mergeTo(g, [STONE_P, stoneP(12), STONE_B][i], { flat: true }));
  const slabs: [number, number, number][] = [
    [0.0, 2.62, 0.5],
    [0.03, 2.08, 0.5],
    [-0.04, 1.58, 0.5],
    [0.04, 1.08, 0.5],
    [-0.03, 0.58, 0.5],
    [0.03, 0.08, 0.5],
    [-0.02, -0.42, 0.4],
  ];
  slabs.forEach(([x, z, d], i) => {
    const o = blob(0.4, d / 2 - 0.03, 7, 0.1);
    extr(o, [x, G + 0.035, z], [1, 0, 0], [0, 0, -1], 0.05, stoneP(20 + i, 0.55), { bevel: 0.012, smoothing: 1 });
  });

  // ================================================================ TORII
  for (const s of [1, -1]) {
    const x = s * 1.05;
    lathe([[0, 0], [0.3, 0], [0.3, 0.05], [0.26, 0.12], [0.26, 0.15], [0, 0.15]], [x, GY, TZ], STONE_P, 8);
    const PY = GY + 0.15;
    const pillarP = paint((p) => (p.y < PY + 0.42 ? LACQ : RED));
    lathe([[0, 0], [0.205, 0], [0.19, 0.4], [0.175, 2.7], [0, 2.7]], [x, PY, TZ], pillarP, 10);
    for (const ry of [0.42, 2.05, 2.3]) lathe([[0, 0], [0.215, 0], [0.215, 0.045], [0, 0.045]], [x, PY + ry, TZ], GOLD, 10);
    box(0.1, 0.24, 0.12, LACQ, [s * 1.29, PY + 2.0, TZ]);
    box(0.1, 0.24, 0.12, LACQ, [s * 1.37, PY + 2.0, TZ], { rotation: [0, 0, s * 8] });
  }
  const NY = GY + 0.15 + 2.0 + 0.05;
  box(3.1, 0.15, 0.17, RED, [0, NY, TZ]);
  box(3.46, 0.14, 0.27, RED, [0, GY + 0.15 + 2.7 + 0.1 - 0.07, TZ]);
  // kasagi: red lower beam and dark roof cap, ends swept up
  const KY = GY + 0.15 + 2.7 + 0.02;
  const kCurve = (x: number) => 0.2 * (Math.abs(x) / 2.05) ** 4;
  const kXs = Array.from({ length: 21 }, (_, i) => -2.05 + i * 0.205);
  const kasa = (lo: number, hi: number): Pr => [...kXs.map((x) => [x, kCurve(x) + lo] as [number, number]), ...kXs.slice().reverse().map((x) => [x, kCurve(x) + hi] as [number, number])];
  extr(kasa(0, 0.12), [0, KY, TZ], [1, 0, 0], [0, 1, 0], 0.34, RED, { bevel: 0.01 });
  extr(kasa(0.12, 0.22), [0, KY, TZ], [1, 0, 0], [0, 1, 0], 0.44, LACQ, { bevel: 0.015 });
  for (const s of [1, -1]) {
    box(0.04, 0.3, 0.36, GOLD, [s * 2.04, KY + 0.28, TZ], { rotation: [0, 0, s * -10] });
    for (let i = 0; i < 4; i++) box(0.07, 0.04, 0.2, GOLD, [s * (1.2 + i * 0.22), KY - 0.12 + kCurve(1.2 + i * 0.22) * 0 - 0.01, TZ]);
  }
  // gakuzuka plaque
  for (const f of [1, -1]) {
    box(0.42, 0.44, 0.07, GOLD, [0, NY + 0.37, TZ + f * 0.01]);
  }
  box(0.36, 0.38, 0.12, INDIGO, [0, NY + 0.37, TZ]);
  for (const f of [1, -1])
    glow(
      b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone: root, at: [0, NY + 0.37, TZ + f * 0.062], dir: [0, 0, f], axis: "z", texture: sigilTex }),
      1.2,
    );
  // shimenawa rope and shide
  const rope = catmull([[-0.85, NY - 0.09, TZ], [-0.45, NY - 0.2, TZ], [0, NY - 0.25, TZ], [0.45, NY - 0.2, TZ], [0.85, NY - 0.09, TZ]]);
  const ropeP = paint((_p, _n, s) => ((((s[1] - 360 * s[0] * 7) % 120) + 120) % 120 < 52 ? STRAW_D : STRAW));
  swp(rope, [0.045, 0.06, 0.08, 0.06, 0.045], ropeP, { sides: 8 });
  for (const s of [1, -1]) b.spike([s * 0.88, NY - 0.09, TZ], [s * 1, -0.2, 0], 0.16, 0.05, { color: STRAW, bone: root });
  b.cards(
    [0.12, 0.28, 0.44, 0.56, 0.72, 0.88].map((t) => frame(rope.at(t), [0, 1, 0])),
    shideTex,
    { size: [0.1, 0.27], lean: 180, flow: [0, 0, 1], bone: root, vary: 0.1 },
  );
  hang([[0, NY - 0.3, TZ + 0.02]], tasselTex, [0.07, 0.24]);

  // ================================================================ STONE LANTERNS
  const stoneLantern = (cx: number, cz: number, k: number, seed: number) => {
    const sp = stoneP(seed);
    const L = (pts: Pr, seg: number, color: ColorInput = sp, o: object = {}) =>
      lathe(pts.map(([r, y]) => [r * k, y * k] as [number, number]), [cx, GY, cz], color, seg, o);
    L([[0, 0], [0.34, 0], [0.34, 0.06], [0.3, 0.09], [0.3, 0.12], [0, 0.12]], 6);
    L([[0, 0.12], [0.12, 0.12], [0.1, 0.2], [0.1, 0.3], [0.155, 0.33], [0.155, 0.39], [0.1, 0.42], [0.1, 0.66], [0, 0.66]], 8);
    L([[0, 0.66], [0.1, 0.66], [0.2, 0.7], [0.34, 0.74], [0.36, 0.78], [0.34, 0.82], [0.3, 0.84], [0, 0.84]], 6);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      cyl(0.026 * k, 0.026 * k, 0.34 * k, 6, sp, [cx + Math.cos(a) * 0.21 * k, GY + 1.0 * k, cz + Math.sin(a) * 0.21 * k]);
    }
    glow(cyl(0.17 * k, 0.17 * k, 0.32 * k, 6, "#ffd36e", [cx, GY + 1.0 * k, cz]), 1.6);
    L([[0, 1.15], [0.27, 1.15], [0.27, 1.2], [0, 1.2]], 6);
    L([[0, 1.2], [0.44, 1.2], [0.5, 1.22], [0.58, 1.28], [0.52, 1.31], [0.4, 1.35], [0.28, 1.43], [0.14, 1.5], [0.1, 1.52], [0, 1.52]], 6);
    L([[0, 1.52], [0.06, 1.52], [0.07, 1.55], [0.1, 1.6], [0.07, 1.67], [0.03, 1.72], [0, 1.76]], 8, GOLD);
    swp(ringPts(cx, GY + 0.5 * k, cz, 0.115 * k, 0.115 * k, 8), 0.016 * k, STRAW, { closed: true } as object);
    hang([[cx + 0.09 * k, GY + 0.5 * k, cz + 0.08 * k]], tasselTex, [0.05 * k, 0.14 * k]);
    hang([[cx - 0.06 * k, GY + 0.5 * k, cz + 0.1 * k]], shideTex, [0.06 * k, 0.15 * k]);
  };
  stoneLantern(1.22, 0.88, 1.12, 31);
  stoneLantern(-1.22, 0.88, 1.12, 32);

  // ================================================================ FOX GUARDIANS
  const fox = (fx: number, fz: number, s: number, seed: number) => {
    const sp = stoneP(seed, 0.64);
    const Y0 = GY + 0.44;
    box(0.58, 0.1, 0.54, sp, [fx, GY + 0.05, fz]);
    box(0.46, 0.28, 0.42, STONE_B, [fx, GY + 0.24, fz]);
    box(0.54, 0.06, 0.5, sp, [fx, GY + 0.41, fz]);
    lathe([[0, 0], [0.085, 0], [0.085, 0.012], [0, 0.012]], [fx, Y0, fz], GOLD, 6);
    const at = (u: number, y: number, v: number): Pt => [fx + u, Y0 + y, fz + v];
    for (const h of [1, -1]) ball(0.17, sp, at(h * 0.14, 0.15, -0.1), { scale: [0.9, 1, 1.05], flat: true }, 8, 6);
    b.capsule(at(0, 0.15, -0.1), at(0, 0.5, 0.05), [0.19, 0.14], { color: sp, bone: root, sides: 8 });
    ball(0.15, sp, at(0, 0.4, 0.1), { flat: true });
    for (const h of [1, -1]) {
      b.capsule(at(h * 0.085, 0.45, 0.12), at(h * 0.085, 0.03, 0.17), 0.05, { color: sp, bone: root, sides: 6 });
      box(0.09, 0.05, 0.12, sp, at(h * 0.085, 0.025, 0.2));
      for (let t = -1; t <= 1; t++) box(0.012, 0.03, 0.03, STONE_B, at(h * 0.085 + t * 0.026, 0.03, 0.262));
    }
    b.capsule(at(0, 0.5, 0.06), at(0, 0.62, 0.1), 0.11, { color: sp, bone: root, sides: 8 });
    ball(1, sp, at(0, 0.68, 0.14), { scale: [0.14, 0.12, 0.14], flat: true }, 10, 7);
    b.capsule(at(0, 0.65, 0.2), at(0, 0.63, 0.36), [0.07, 0.035], { color: sp, bone: root, sides: 7 });
    ball(0.03, INK, at(0, 0.635, 0.385), { flat: true });
    for (const h of [1, -1]) {
      ball(1, INK, at(h * 0.075, 0.7, 0.25), { scale: [0.016, 0.024, 0.012], flat: true }, 6, 4);
      rod(at(h * 0.105, 0.737, 0.22), at(h * 0.05, 0.748, 0.256), 0.007, INK);
      const ex = h;
      extr([[-0.06, 0], [0.06, 0], [0, 0.22]], at(h * 0.085, 0.76, 0.09), [1, 0, 0], [ex * 0.18, 1, -0.2], 0.04, sp, { smoothing: 1 });
      extr([[-0.035, 0.0], [0.035, 0.0], [0, 0.14]], at(h * 0.085, 0.775, 0.1 + 0.022), [1, 0, 0], [ex * 0.18, 1, -0.2], 0.012, cel("#f2a2bc", "#c9709e"), { smoothing: 1 });
      for (let t = 0; t < 3; t++) b.spike(at(h * 0.12, 0.66 - t * 0.03, 0.15 + t * 0.012), [h, -0.35 - t * 0.2, 0.15], 0.1 - t * 0.012, 0.028, { color: sp, bone: root });
    }
    swp(catmull(ringPts(fx, Y0 + 0.57, fz + 0.08, 0.13, 0.125, 8), { closed: true }), 0.027, RED_F);
    extr([[-0.12, 0], [0.12, 0], [0, -0.19]], at(0, 0.56, 0.2), [1, 0, 0], [0, 1, -0.55], 0.014, GOLD);
    extr([[-0.1, -0.01], [0.1, -0.01], [0, -0.16]], at(0, 0.56, 0.205), [1, 0, 0], [0, 1, -0.55], 0.014, RED_F);
    ball(0.03, GOLD, at(0, 0.53, 0.235));
    b.spike(at(0, 0.5, 0.245), [0, -1, 0.2], 0.07, 0.018, { color: GOLD, bone: root });
    const tail = catmull([at(0, 0.12, -0.22), at(0, 0.05, -0.42), at(s * 0.14, 0.2, -0.5), at(s * 0.18, 0.5, -0.44), at(s * 0.1, 0.8, -0.32)]);
    swp(tail, [0.06, 0.09, 0.12, 0.09, 0.03], sp, { caps: { start: "round", end: "point" }, sides: 7 });
    for (let t = 0; t < 4; t++) b.spike(tail.at(0.62 + t * 0.09), [s * 0.8, 0.3, -0.5], 0.09, 0.03, { color: STONE_B, bone: root });
    // fox fire floating above
    const fl = s > 0 ? PURPLE_G : TEAL_G;
    const fireOut: Pr = [[0, 0], [0.05, 0.02], [0.062, 0.07], [0.036, 0.14], [0.012, 0.2], [0, 0.24]];
    glow(lathe(fireOut, at(0, 1.12, 0.14), fl, 8), 1.4);
    glow(lathe(fireOut.map(([r, y]) => [r * 0.5, y * 0.6 + 0.01] as [number, number]), at(0, 1.12, 0.14), "#f6ecff", 6), 1.6);
    if (s > 0) {
      ball(0.05, PURPLE_G, at(0, 0.075, 0.23), {}, 8, 6);
      glow(ball(0.05, PURPLE_G, at(0, 0.075, 0.23), {}, 8, 6), 1.3);
    } else {
      cyl(0.03, 0.03, 0.18, 8, CREAM, at(0, 0.05, 0.23), { rotation: [0, 0, 90] });
      for (const h of [1, -1]) cyl(0.034, 0.034, 0.03, 8, RED_F, at(h * 0.095, 0.05, 0.23), { rotation: [0, 0, 90] });
    }
  };
  fox(1.0, -0.15, 1, 41);
  fox(-1.0, -0.15, -1, 42);

  // ================================================================ SHRINE (hokora)
  const masonry = paint((p, n) => {
    const useZ = Math.abs(n.x) > 0.5;
    const row = Math.floor((p.y - G) / 0.11);
    const u = (useZ ? p.z : p.x) / 0.34 + (row % 2) * 0.5;
    if ((p.y - G) / 0.11 - row < 0.07 || u - Math.floor(u) < 0.045) return STONE_B;
    return (row * 5 + Math.floor(u)) % 3 === 0 ? STONE_B : STONE;
  });
  const shrineZ = -1.65;
  box(2.6, 0.32, 1.7, masonry, [0, G + 0.16, shrineZ]);
  box(2.72, 0.05, 1.84, STONE, [0, G + 0.345, shrineZ]);
  box(2.5, 0.03, 1.66, cel(grain("#c68858", "#b3764e", { size: 0.05, axis: "z" }), "#8d5a52"), [0, FY - 0.015, shrineZ]);
  box(1.0, G + 0.13, 0.34, masonry, [0, (G + 0.13) / 2, -0.57]);
  box(1.0, G + 0.26, 0.18, masonry, [0, (G + 0.26) / 2, -0.65]);
  for (const [y, z] of [[G + 0.13, -0.4], [G + 0.26, -0.57]] as [number, number][]) box(1.04, 0.025, 0.02, STONE, [0, y + 0.0125, z]);

  // body: back + side walls (indigo inside, plaster outside), floor, ceiling, front panels
  const BT = FY + 1.3;
  box(1.44, 1.3, 0.1, paint((_p, n) => (n.z > 0.5 ? INDIGO : CREAM)), [0, FY + 0.65, -2.3]);
  for (const s of [1, -1])
    box(0.08, 1.3, 1.1, paint((p, n) => (Math.sign(p.x) * n.x < -0.5 ? INDIGO : CREAM)), [s * 0.72, FY + 0.65, -1.85]);
  box(1.4, 0.06, 0.98, WOOD_D, [0, BT - 0.03, -1.85]);
  box(1.4, 0.03, 0.98, WOOD, [0, FY + 0.015, -1.85]);
  for (const s of [1, -1]) {
    box(0.32, 1.12, 0.07, CREAM, [s * 0.56, FY + 0.56, -1.38]);
    b.part(new THREE.PlaneGeometry(0.17, 0.42), "#ffffff", { bone: root, at: [s * 0.565, FY + 0.65, -1.341], dir: [0, 0, 1], axis: "z", texture: windowTex });
    box(0.3, 0.025, 0.09, WOOD_D, [s * 0.56, FY + 0.012, -1.37]);
  }
  box(0.82, 0.14, 0.07, CREAM, [0, FY + 1.1, -1.38]);
  box(0.84, 0.09, 0.1, RED, [0, FY + 1.0, -1.38]);
  for (const s of [1, -1]) {
    box(0.07, 1.0, 0.1, RED, [s * 0.4, FY + 0.5, -1.38]);
    box(0.13, 1.3, 0.13, RED, [s * 0.72, FY + 0.65, -1.35]);
    box(0.13, 1.3, 0.13, RED, [s * 0.72, FY + 0.65, -2.35]);
    box(0.17, 0.04, 0.17, STONE, [s * 0.72, FY + 0.02, -1.35]);
    box(0.17, 0.04, 0.17, STONE, [s * 0.72, FY + 0.02, -2.35]);
    // nageshi along the sides + bracket stacks
    box(0.1, 0.1, 1.2, RED, [s * 0.72, FY + 1.22, -1.85]);
    for (const z of [-1.35, -2.35]) {
      box(0.2, 0.05, 0.2, GOLD, [s * 0.72, BT + 0.025, z]);
      box(0.3, 0.05, 0.3, WOOD_D, [s * 0.72, BT + 0.075, z]);
      box(0.4, 0.04, 0.4, GOLD, [s * 0.72, BT + 0.12, z]);
    }
  }
  box(1.6, 0.1, 0.1, RED, [0, FY + 1.22, -1.35]);
  box(1.6, 0.1, 0.1, RED, [0, FY + 1.22, -2.35]);
  // roof (hip-less gable, curved eaves)
  const y0 = FY + 1.34;
  const rTop = (x: number) => 0.1 + 0.52 * Math.max(0, 1 - Math.abs(x) / 1.4) ** 1.6 + 0.1 * (Math.abs(x) / 1.4) ** 5;
  const rTh = (x: number) => 0.14 - 0.07 * (Math.abs(x) / 1.4);
  const rBot = (x: number) => rTop(x) - rTh(x);
  const rXs = Array.from({ length: 29 }, (_, i) => -1.4 + i * 0.1);
  const roofOutline: Pr = [...rXs.map((x) => [x, rTop(x)] as [number, number]), ...rXs.slice().reverse().map((x) => [x, rBot(x)] as [number, number])];
  const roofP = paint((p, n, s) => {
    if (n.y < -0.4) return SOFFIT;
    if (Math.abs(n.z) > 0.7) return TILE_L;
    if ((Math.abs(s[0]) * 9.5) % 1 < 0.1) return TILE_L;
    return Math.abs((p.z / 0.12) % 1) < 0.5 ? TILE_A : TILE_B;
  });
  extr(roofOutline, [0, y0, -1.6], [1, 0, 0], [0, 1, 0], 2.0, roofP, { bevel: 0.012 });
  // gable plaster triangles (under the roof) with the golden ornament
  const gTri: Pr = [[-0.72, 0], [0.72, 0], ...[0.72, 0.36, 0, -0.36, -0.72].map((x) => [x, rBot(x) + 0.04 + (y0 - BT)] as [number, number])];
  extr(gTri, [0, BT, -1.4], [1, 0, 0], [0, 1, 0], 0.06, CREAM);
  extr(gTri, [0, BT, -2.34], [1, 0, 0], [0, 1, 0], 0.06, CREAM);
  b.part(new THREE.PlaneGeometry(0.46, 0.46), "#ffffff", { bone: root, at: [0, BT + 0.3, -1.366], dir: [0, 0, 1], axis: "z", texture: gegyoTex });
  // roof ornaments: rim lines, antefix discs, ridge, katsuogi, chigi
  for (const zf of [-0.6, -2.6]) {
    const sg = zf > -1 ? 1 : -1;
    swp(polyline(rXs.map((x) => [x, y0 + rTop(x) + 0.008, zf + sg * 0.004] as Pt)), 0.017, GOLD, { sides: 6 });
    swp(polyline(rXs.map((x) => [x, y0 + rBot(x) - 0.004, zf + sg * 0.004] as Pt)), 0.013, GOLD, { sides: 6 });
  }
  const ante: THREE.BufferGeometry[] = [];
  for (let x = -1.3; x <= 1.31; x += 0.2) {
    const y = y0 + (rTop(x) + rBot(x)) / 2;
    ante.push(xf(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), [x, y, -0.6], [Math.PI / 2, 0, 0]));
    ante.push(xf(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), [x, y, -2.6], [Math.PI / 2, 0, 0]));
  }
  mergeTo(ante, GOLD);
  swp(polyline([[0, y0 + 0.66, -2.6], [0, y0 + 0.66, -0.6]]), 0.05, TILE_L, { sides: 6, caps: "flat" });
  for (const z of [-1.0, -1.6, -2.2]) {
    cyl(0.05, 0.05, 0.6, 8, CREAM, [0, y0 + 0.74, z], { rotation: [0, 0, 90] });
    for (const s of [1, -1]) cyl(0.055, 0.055, 0.03, 8, GOLD, [s * 0.3, y0 + 0.74, z], { rotation: [0, 0, 90] });
  }
  for (const [zc, sg] of [[-0.6, 1], [-2.6, -1]] as [number, number][]) {
    const ya = y0 + 0.62;
    for (const s of [1, -1]) {
      extr(bar2([-s * 0.22, ya - 0.14], [s * 0.3, ya + 0.6], 0.075), [0, 0, zc + sg * (s > 0 ? 0.03 : -0.03)], [1, 0, 0], [0, 1, 0], 0.05, WOOD);
      ball(0.04, GOLD, [s * 0.3, ya + 0.6, zc + sg * (s > 0 ? 0.03 : -0.03)]);
    }
  }
  // porch posts, beams, rails
  for (const s of [1, -1])
    for (const z of [-0.95, -2.4]) {
      cyl(0.13, 0.13, 0.05, 8, STONE, [s * 1.12, FY + 0.025, z]);
      lathe([[0, 0], [0.075, 0], [0.065, 1.35], [0, 1.35]], [s * 1.12, FY + 0.05, z], RED, 8);
      lathe([[0, 0], [0.085, 0], [0.085, 0.04], [0, 0.04]], [s * 1.12, FY + 0.9, z], GOLD, 8);
      box(0.28, 0.05, 0.28, GOLD, [s * 1.12, y0 - 0.04, z]);
    }
  box(2.3, 0.12, 0.14, RED, [0, FY + 1.27, -0.95]);
  box(2.3, 0.1, 0.1, RED, [0, FY + 1.2, -2.4]);
  for (const s of [1, -1]) {
    box(0.12, 0.12, 1.5, RED, [s * 1.12, FY + 1.27, -1.67]);
    for (const y of [0.3, 0.55]) {
      box(0.05, 0.05, 1.45, RED, [s * 1.12, FY + y, -1.67]);
      box(0.6, 0.05, 0.05, RED, [s * 0.82, FY + y, -0.95]);
    }
    box(0.07, 0.62, 0.07, RED, [s * 0.5, FY + 0.31, -0.95]);
    ball(0.05, GOLD, [s * 0.5, FY + 0.66, -0.95]);
    cyl(0.02, 0.02, 0.08, 6, GOLD, [s * 0.5, FY + 0.6, -0.95]);
  }
  for (const y of [0.3, 0.55]) box(2.24, 0.05, 0.05, RED, [0, FY + y, -2.4]);
  // saisen offering box
  box(0.8, 0.26, 0.32, WOOD_D, [0, FY + 0.13, -1.1]);
  for (let i = 0; i < 7; i++) box(0.09, 0.03, 0.34, WOOD, [-0.34 + i * 0.113, FY + 0.275, -1.1]);
  for (const s of [1, -1]) {
    box(0.05, 0.3, 0.34, GOLD, [s * 0.4, FY + 0.15, -1.1]);
    box(0.05, 0.3, 0.34, GOLD, [s * 0.18, FY + 0.15, -1.1]);
  }
  b.part(new THREE.PlaneGeometry(0.26, 0.2), "#ffffff", { bone: root, at: [0, FY + 0.13, -0.938], dir: [0, 0, 1], axis: "z", texture: gegyoTex });
  const coins: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 12; i++) coins.push(xf(new THREE.CylinderGeometry(0.028, 0.028, 0.008, 8), [rr(-0.3, 0.3), FY + 0.296 + (i % 3) * 0.008, -1.1 + rr(-0.1, 0.1)], [rr(-0.1, 0.1), 0, rr(-0.1, 0.1)]));
  mergeTo(coins, GOLD);
  // interior: mirror, altar stand, glowing orb, sakaki vases
  lathe([[0, 0], [0.2, 0], [0.22, 0.015], [0.2, 0.03], [0, 0.03]], [0, FY + 0.85, -2.24], GOLD, 12, { axis: [0, 0, 1] });
  lathe([[0, 0], [0.16, 0], [0, 0.012]], [0, FY + 0.85, -2.206], cel("#fff0b8", "#e8c070"), 12, { axis: [0, 0, 1] });
  box(0.05, 0.4, 0.04, WOOD_D, [0, FY + 0.5, -2.26]);
  lathe([[0, 0], [0.12, 0], [0.1, 0.04], [0.06, 0.1], [0.14, 0.14], [0.16, 0.18], [0.04, 0.2], [0, 0.2]], [0, FY + 0.03, -2.0], GOLD, 10);
  glow(ball(0.11, PURPLE_G, [0, FY + 0.34, -2.0], {}, 10, 8), 1.5);
  glow(ball(0.06, "#efe0ff", [0, FY + 0.34, -2.0], {}, 8, 6), 1.5);
  for (const s of [1, -1]) {
    lathe([[0, 0], [0.04, 0], [0.04, 0.2], [0.025, 0.22], [0, 0.22]], [s * 0.5, FY + 0.03, -2.15], cel("#f6f4ff", "#c7c0e6"), 8);
    for (let k = 0; k < 4; k++) b.spike([s * 0.5, FY + 0.24, -2.15], [s * (k - 1.5) * 0.35, 1, (k % 2) * 0.3 - 0.1], 0.28, 0.03, { color: cel("#4c9c58", "#2e7860"), bone: root });
  }
  // door frames
  box(0.84, 0.04, 0.12, WOOD_D, [0, FY + 0.02, -1.38]);

  // ================================================================ OFFERING TABLE
  const FL = 0.2;
  const TT = FL + 0.44;
  const TZ0 = 0.15;
  box(1.04, 0.04, 0.54, WOOD, [0, TT - 0.02, TZ0]);
  for (const s of [1, -1]) {
    for (const z of [-0.22, 0.22]) {
      box(0.05, 0.4, 0.05, WOOD_D, [s * 0.46, FL + 0.2, TZ0 + z]);
      box(0.06, 0.02, 0.06, GOLD, [s * 0.46, FL + 0.01, TZ0 + z]);
      box(0.07, 0.07, 0.07, GOLD, [s * 0.5, TT - 0.04, TZ0 + z * 1.2], { scale: [0.6, 0.5, 0.6] });
    }
    box(0.03, 0.07, 0.44, WOOD_D, [s * 0.46, TT - 0.075, TZ0]);
    box(0.03, 0.03, 0.44, WOOD_D, [s * 0.46, FL + 0.14, TZ0]);
  }
  for (const z of [-0.22, 0.22]) {
    box(0.92, 0.07, 0.03, WOOD_D, [0, TT - 0.075, TZ0 + z]);
    box(0.5, 0.012, 0.012, GOLD, [0, TT - 0.075, TZ0 + z + Math.sign(z) * 0.018]);
  }
  box(1.0, 0.014, 0.4, RED_F, [0, TT + 0.007, TZ0]);
  b.part(new THREE.PlaneGeometry(0.98, 0.33), "#ffffff", { bone: root, at: [0, TT + 0.0145, TZ0], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: runnerTex });
  const TI = TT + 0.014;
  for (const s of [1, -1]) {
    // candlesticks
    const cx = s * 0.43;
    lathe([[0, 0], [0.04, 0], [0.04, 0.012], [0.016, 0.04], [0.016, 0.15], [0.04, 0.17], [0.04, 0.19], [0, 0.19]], [cx, TI, TZ0 - 0.1], BRONZE, 8);
    cyl(0.019, 0.019, 0.13, 8, CREAM, [cx, TI + 0.255, TZ0 - 0.1]);
    glow(lathe([[0, 0], [0.018, 0.012], [0.017, 0.035], [0.006, 0.058], [0, 0.066]], [cx, TI + 0.32, TZ0 - 0.1], "#ffb347", 6), 1.6);
    // tokkuri sake bottles
    const bx = s * 0.1 - 0.12 + (s > 0 ? 0.08 : 0);
    lathe([[0, 0], [0.045, 0], [0.05, 0.03], [0.05, 0.12], [0.03, 0.16], [0.02, 0.2], [0.026, 0.225], [0, 0.225]], [bx, TI, TZ0 - 0.1], cel(stripes("#f6f4ff", "#7fa8e8", { size: 0.05, axis: "y", width: 0.22, wobble: 0.05 }), "#c7c0e6"), 8);
    swp(ringPts(bx, TI + 0.17, TZ0 - 0.1, 0.027, 0.027, 6), 0.007, GOLD, { closed: true } as object);
    box(0.05, 0.06, 0.003, RED_F, [bx, TI + 0.075, TZ0 - 0.05]);
  }
  // kagami mochi stand
  box(0.2, 0.03, 0.2, WOOD_D, [-0.22, TI + 0.015, TZ0 + 0.0]);
  box(0.16, 0.05, 0.16, GOLD, [-0.22, TI + 0.055, TZ0]);
  lathe([[0, 0], [0.09, 0], [0.105, 0.025], [0.09, 0.055], [0, 0.06]], [-0.22, TI + 0.08, TZ0], cel("#fffdf6", "#d6d0ee"), 10);
  lathe([[0, 0], [0.065, 0], [0.078, 0.02], [0.065, 0.045], [0, 0.05]], [-0.22, TI + 0.14, TZ0], cel("#fffdf6", "#d6d0ee"), 10);
  ball(0.04, ORANGE, [-0.22, TI + 0.215, TZ0], {}, 8, 6);
  for (const s of [1, -1]) b.part(new THREE.ConeGeometry(0.025, 0.06, 4), cel("#5fb858", "#2e7860"), { bone: root, at: [-0.22 + s * 0.03, TI + 0.255, TZ0], rotation: [0, 0, -s * 50] });
  // apple bowl
  lathe([[0, 0], [0.06, 0], [0.12, 0.05], [0.13, 0.075], [0.115, 0.075], [0.05, 0.02], [0, 0.02]], [-0.28, TI, TZ0 + 0.14], cel("#4d6fd0", "#35449e"), 10);
  const apples: Pt[] = [[-0.04, 0.085, 0], [0.04, 0.085, 0.01], [0, 0.085, 0.05], [0, 0.085, -0.05], [0.005, 0.15, 0.0]];
  apples.forEach((a, i) => {
    ball(0.047, i % 3 === 2 ? ORANGE : APPLE, [-0.28 + a[0], TI + a[1], TZ0 + 0.14 + a[2]], { flat: true }, 7, 5);
    cyl(0.005, 0.005, 0.03, 4, BARK, [-0.28 + a[0], TI + a[1] + 0.05, TZ0 + 0.14 + a[2]]);
  });
  // dango plate
  lathe([[0, 0], [0.09, 0], [0.145, 0.025], [0.145, 0.032], [0.09, 0.012], [0, 0.012]], [0.26, TI, TZ0 + 0.12], cel("#fffaf0", "#cfc6e8"), 10);
  const dcols = [cel("#ff9fc0", "#e0709c"), cel("#fffaf0", "#d2cae8"), cel("#9be07a", "#5fa876")];
  [-0.07, 0, 0.07].forEach((dx, si) => {
    const dir = new THREE.Vector3(dx * 1.6, 0.34, -0.9).normalize();
    const b0 = new THREE.Vector3(0.26 + dx, TI + 0.025, TZ0 + 0.2);
    const e = b0.clone().addScaledVector(dir, 0.3);
    rod([b0.x, b0.y, b0.z], [e.x, e.y, e.z], 0.004, WOOD);
    for (let j = 0; j < 3; j++) {
      const q = b0.clone().addScaledVector(dir, 0.14 + j * 0.055);
      ball(0.026, dcols[(j + si) % 3], [q.x, q.y, q.z], {}, 7, 5);
    }
  });
  // incense burner and smoke
  lathe([[0, 0], [0.04, 0], [0.065, 0.04], [0.075, 0.075], [0.06, 0.095], [0.04, 0.105], [0, 0.105]], [0.02, TI, TZ0 + 0.1], BRONZE, 8);
  cyl(0.055, 0.055, 0.008, 8, cel("#bcb8cc", "#8a86a8"), [0.02, TI + 0.108, TZ0 + 0.1]);
  for (const s of [1, -1]) b.part(new THREE.TorusGeometry(0.025, 0.007, 4, 8, Math.PI), BRONZE, { bone: root, at: [0.02 + s * 0.073, TI + 0.075, TZ0 + 0.1], rotation: [0, 90, s * 90 - 90] });
  [[-0.02, 0.15], [0.02, -0.12], [0.06, 0.05]].forEach(([dx, tilt], i) => {
    const bx = 0.02 + dx;
    rod([bx, TI + 0.112, TZ0 + 0.1], [bx + tilt * 0.35, TI + 0.25, TZ0 + 0.1 - 0.02 * i], 0.0035, "#7a5a44");
    glow(ball(0.007, "#ff7a3a", [bx + tilt * 0.35, TI + 0.25, TZ0 + 0.1 - 0.02 * i], {}, 5, 4), 1.5);
  });
  const smokePts = (x0: number, sgn: number): Pt[] => Array.from({ length: 9 }, (_, i) => [x0 + sgn * Math.sin(i * 0.9) * (0.02 + i * 0.004), TI + 0.26 + i * 0.065, TZ0 + 0.08 + Math.cos(i * 0.9) * 0.015]);
  swp(catmull(smokePts(0.04, 1)), [0.008, 0.002], "#dcd2f6", { sides: 4 });
  swp(catmull(smokePts(0.0, -1)), [0.007, 0.002], "#e6def8", { sides: 4 });

  // ================================================================ TREE: sakura
  const tx = -2.15;
  const tz = -1.8;
  swp(catmull([[tx, G - 0.05, tz], [tx - 0.05, 0.9, tz + 0.05], [tx + 0.1, 1.7, tz], [tx + 0.4, 2.4, tz - 0.1]]), [0.3, 0.22, 0.16, 0.11], BARK, { sides: 9 });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4;
    b.spike([tx + Math.cos(a) * 0.2, G + 0.12, tz + Math.sin(a) * 0.2], [Math.cos(a), -0.35, Math.sin(a)], 0.55, 0.12, { color: BARK, bone: root });
  }
  swp(catmull([[tx + 0.05, 1.55, tz], [tx + 0.8, 2.1, tz + 0.15], [tx + 1.2, 2.55, tz + 0.2]]), [0.1, 0.05, 0.03], BARK, { sides: 6 });
  swp(catmull([[tx - 0.05, 1.3, tz - 0.05], [tx - 0.75, 1.9, tz - 0.1], [tx - 1.05, 2.5, tz - 0.2]]), [0.09, 0.05, 0.025], BARK, { sides: 6 });
  swp(catmull([[tx + 0.3, 2.2, tz - 0.1], [tx + 0.35, 3.0, tz + 0.1], [tx + 0.2, 3.6, tz - 0.1]]), [0.1, 0.06, 0.03], BARK, { sides: 6 });
  const clusters: [number, number, number, number][] = [
    [0.4, 3.1, 0.0, 0.85], [-0.45, 3.2, 0.2, 0.7], [1.15, 2.75, 0.3, 0.6], [-1.0, 2.7, -0.1, 0.6], [0.15, 3.75, -0.1, 0.65],
    [1.3, 3.2, -0.2, 0.5], [-1.0, 3.35, -0.2, 0.5], [0.3, 2.6, -0.5, 0.55], [-0.2, 2.7, 0.6, 0.45],
  ];
  const cA: THREE.BufferGeometry[] = [];
  const cB: THREE.BufferGeometry[] = [];
  const cC: THREE.BufferGeometry[] = [];
  clusters.forEach(([dx, y, dz, r], i) => {
    cA.push(xf(new THREE.IcosahedronGeometry(r, 1), [tx + dx, y, tz + dz], [rr(0, 3), rr(0, 3), 0], [1, 0.82, 1]));
    cB.push(xf(new THREE.IcosahedronGeometry(r * 0.55, 1), [tx + dx + r * 0.45 * (i % 2 ? 1 : -1), y + r * 0.5, tz + dz + r * 0.35], [rr(0, 3), rr(0, 3), 0]));
    cC.push(xf(new THREE.IcosahedronGeometry(r * 0.32, 0), [tx + dx - r * 0.3, y + r * 0.78, tz + dz + r * 0.5], [rr(0, 3), 0, 0]));
  });
  const canopy = mergeTo(cA, cel(mottle("#ffb2cc", "#ff9cc2", { size: 0.5, seed: 8 }), "#e07ab4"), { flat: true });
  mergeTo(cB, PINK_B, { flat: true });
  mergeTo(cC, PINK_C, { flat: true });
  const petalHits = b.surface(canopy).scatter(150, { rng: R, minDist: 0.22 });
  b.cards(petalHits, [petalTex, petalTex2], { size: [0.12, 0.12], lean: 50, vary: 0.4, spin: 180, rng: R, bone: root });
  b.cards(
    Array.from({ length: 16 }, () => frame([tx + rr(-2.4, 1.6), rr(0.5, 2.6), tz + rr(-1.2, 2.4)], [0, 1, 0])),
    [petalTex, petalTex2],
    { size: 0.09, lean: 80, flow: (_f: unknown, i: number) => [Math.cos(i * 2.1), 0, Math.sin(i * 2.1)], spin: 90, rng: R, bone: root } as Parameters<typeof b.cards>[2],
  );
  // shimenawa on the trunk
  swp(catmull(ringPts(tx, 1.15, tz + 0.0, 0.255, 0.255, 10), { closed: true }), 0.035, ropeP);
  hang(Array.from({ length: 5 }, (_, i) => [tx + Math.cos(i * 1.26 + 0.6) * 0.27, 1.12, tz + Math.sin(i * 1.26 + 0.6) * 0.27] as Pt), shideTex, [0.09, 0.24]);

  // ================================================================ BAMBOO
  const stalks: [number, number, number, number, number][] = [
    [2.35, -2.2, 3.5, 0.15, 0.05], [2.6, -1.95, 3.1, 0.3, 0.1], [2.15, -1.85, 3.9, -0.1, 0.15], [2.5, -2.45, 3.3, 0.2, -0.2], [1.95, -2.25, 2.7, -0.25, 0.1], [2.78, -2.2, 2.6, 0.35, 0.0],
  ];
  const leafFrames: ReturnType<ReturnType<typeof swp>["at"]>[] = [];
  stalks.forEach(([x, z, h, lx, lz], i) => {
    const bp = paint((p, n) => ((((p.y - i * 0.13) % 0.44) + 0.44) % 0.44 < 0.05 ? BAMBOO_N : n.y > 100 ? BAMBOO : BAMBOO));
    const sw = swp(catmull([[x, G - 0.02, z], [x + lx * 0.4, G + h * 0.5, z + lz * 0.4], [x + lx, G + h, z + lz]]), [0.05, 0.03], bp, { sides: 6 });
    for (const t of [0.7, 0.78, 0.86, 0.93]) for (const a of [0, 120, 240]) leafFrames.push(sw.at(t, a + t * 200));
  });
  b.cards(leafFrames, leafTex, { size: [0.12, 0.42], lean: 62, bend: 25, vary: 0.25, spin: 25, rng: R, bone: root, flow: [0.3, -0.5, 1] });

  // ================================================================ FENCE
  const fPost: THREE.BufferGeometry[] = [];
  const fCap: THREE.BufferGeometry[] = [];
  const fenceAt = (x: number, z: number) => {
    fPost.push(xf(new THREE.CylinderGeometry(0.045, 0.055, 0.86, 6), [x, G + 0.43, z]));
    fCap.push(xf(new THREE.SphereGeometry(0.052, 6, 4), [x, G + 0.9, z], [0, 0, 0], [1, 0.9, 1]));
  };
  for (let x = -2.85; x <= 2.86; x += 0.57) if (x < -1.45 || x > 1.45) fenceAt(x, -2.78);
  for (let z = -2.78; z <= -0.55; z += 0.56) {
    fenceAt(-2.88, z);
    fenceAt(2.88, z);
  }
  mergeTo(fPost, RED_F);
  mergeTo(fCap, GOLD);
  const rails: THREE.BufferGeometry[] = [];
  for (const y of [0.4, 0.7]) {
    rails.push(xf(new THREE.BoxGeometry(1.45, 0.04, 0.04), [-2.12, G + y, -2.78]));
    rails.push(xf(new THREE.BoxGeometry(1.45, 0.04, 0.04), [2.12, G + y, -2.78]));
    rails.push(xf(new THREE.BoxGeometry(0.04, 0.04, 2.32), [-2.88, G + y, -1.66]));
    rails.push(xf(new THREE.BoxGeometry(0.04, 0.04, 2.32), [2.88, G + y, -1.66]));
  }
  mergeTo(rails, RED_F);

  // ================================================================ EMA RACK (right)
  const ex = 2.28;
  const ez = 0.9;
  for (const s of [1, -1]) {
    box(0.09, 1.75, 0.09, WOOD_D, [ex + s * 0.5, G + 0.875, ez]);
    box(0.14, 0.04, 0.14, GOLD, [ex + s * 0.5, G + 1.77, ez]);
  }
  box(1.12, 0.07, 0.1, WOOD_D, [ex, G + 1.62, ez]);
  box(1.12, 0.06, 0.08, WOOD_D, [ex, G + 1.08, ez]);
  const eRoof: Pr = [[-0.66, 0.08], [0, 0.34], [0.66, 0.08], [0.66, 0.02], [0, 0.26], [-0.66, 0.02]];
  extr(eRoof, [ex, G + 1.7, ez], [1, 0, 0], [0, 1, 0], 0.34, cel("#586ac0", "#3a4796"), { bevel: 0.008 });
  const emaOutline: Pr = [[-0.1, -0.08], [0.1, -0.08], [0.1, 0.05], [0, 0.1], [-0.1, 0.05]];
  for (let row = 0; row < 2; row++)
    for (let i = 0; i < 5; i++) {
      const x = ex - 0.4 + i * 0.2 + (row ? 0.0 : 0.0);
      const top = row ? G + 1.06 : G + 1.6;
      const yc = top - 0.2;
      const tilt = Math.sin(i * 2.3 + row) * 0.03;
      const lean = tilt * 0.8;
      rod([x - 0.05, top, ez], [x - 0.03, yc + 0.07, ez + 0.012], 0.003, "#d8c9a0");
      rod([x + 0.05, top, ez], [x + 0.03, yc + 0.07, ez + 0.012], 0.003, "#d8c9a0");
      extr(emaOutline, [x, yc, ez + 0.02], [1, 0, 0], [lean, 1, 0], 0.014, cel("#d9a46a", "#a8705a"), { bevel: 0.003 });
      b.part(new THREE.PlaneGeometry(0.17, 0.15), "#ffffff", { bone: root, at: [x, yc - 0.005, ez + 0.0285], dir: [0, 0, 1], axis: "z", texture: emaTex[(i + row * 2) % 6] });
      ball(0.012, RED_F, [x, yc + 0.075, ez + 0.012]);
    }
  hang([[ex - 0.2, G + 1.57, ez + 0.07], [ex + 0.2, G + 1.57, ez + 0.07]], tasselTex, [0.045, 0.16]);

  // ================================================================ WATER BASIN (left)
  const bx = -2.2;
  const bz = 0.45;
  extr(roundRect(0.72, 0.58, 0.07), [bx, G + 0.2, bz], [1, 0, 0], [0, 0, -1], 0.4, stoneP(51), { bevel: 0.03 });
  extr(roundRect(0.56, 0.42, 0.06), [bx, G + 0.403, bz], [1, 0, 0], [0, 0, -1], 0.012, cel("#8c8eb8", "#62648f"));
  extr(roundRect(0.5, 0.36, 0.05), [bx, G + 0.41, bz], [1, 0, 0], [0, 0, -1], 0.012, WATER);
  swp(catmull(ringPts(bx, G + 0.418, bz + 0.0, 0.09, 0.07, 8), { closed: true }), 0.004, "#e6fbff", { sides: 4 });
  swp(catmull([[bx, G - 0.02, bz - 0.5], [bx, G + 0.6, bz - 0.5], [bx, G + 0.98, bz - 0.5]]), 0.034, BAMBOO, { sides: 6 });
  swp(catmull([[bx, G + 0.96, bz - 0.5], [bx, G + 1.0, bz - 0.22], [bx, G + 0.8, bz - 0.05]]), 0.028, BAMBOO, { sides: 6, caps: "flat" });
  rod([bx, G + 0.77, bz - 0.04], [bx, G + 0.42, bz - 0.04], 0.011, "#aeeaff", { sides: 5 });
  for (let k = 0; k < 3; k++) cyl(0.036, 0.036, 0.012, 6, BAMBOO_N, [bx, G + 0.15 + k * 0.3, bz - 0.5]);
  rod([bx - 0.28, G + 0.47, bz + 0.28], [bx - 0.02, G + 0.47, bz + 0.2], 0.012, BAMBOO);
  lathe([[0, 0], [0.04, 0.0], [0.045, 0.05], [0.036, 0.05], [0.03, 0.01], [0, 0.01]], [bx - 0.3, G + 0.42, bz + 0.29], BAMBOO, 8);
  // little lantern next to it
  stoneLantern(-1.95, 1.4, 0.62, 61);

  // ================================================================ STELE, JIZO-STYLE GUARDIAN, PINWHEEL
  const sx = -2.35;
  const sz = 1.75;
  box(0.6, 0.12, 0.34, STONE_P, [sx, G + 0.06, sz], { rotation: [0, -14, 0] });
  const steleOut: Pr = [[-0.22, 0], [0.22, 0], [0.22, 0.9], [0.15, 1.02], [0, 1.08], [-0.15, 1.02], [-0.22, 0.9]];
  extr(steleOut, [sx, G + 0.12, sz], [0.97, 0, -0.25], [0, 1, 0], 0.14, stoneP(71), { bevel: 0.02 });
  b.part(new THREE.PlaneGeometry(0.36, 0.78), "#ffffff", { bone: root, at: [sx + 0.0175, G + 0.62, sz + 0.0703], dir: [0.25, 0, 0.97], axis: "z", texture: steleTex });
  cyl(0.05, 0.05, 0.04, 8, ORANGE, [sx + 0.18, G + 0.14, sz + 0.2], {});
  ball(0.04, ORANGE, [sx + 0.2, G + 0.17, sz + 0.24]);
  const jx = -2.4;
  const jz = -0.55;
  box(0.3, 0.1, 0.3, STONE_P, [jx, G + 0.05, jz]);
  lathe([[0, 0], [0.15, 0], [0.135, 0.1], [0.105, 0.26], [0.085, 0.34], [0, 0.34]], [jx, G + 0.1, jz], stoneP(81, 0.7), 10);
  ball(0.09, stoneP(82, 0.8), [jx, G + 0.52, jz], {}, 10, 8);
  lathe([[0, 0], [0.105, 0], [0.095, 0.05], [0.05, 0.1], [0.012, 0.14], [0, 0.14]], [jx, G + 0.55, jz], RED_F, 8);
  swp(catmull(ringPts(jx, G + 0.42, jz, 0.088, 0.088, 8), { closed: true }), 0.018, RED_F);
  extr([[-0.07, 0], [0.07, 0], [0, -0.12]], [jx, G + 0.42, jz + 0.075], [1, 0, 0], [0, 1, -0.3], 0.012, RED_F);
  for (const h of [1, -1]) {
    ball(0.012, INK, [jx + h * 0.035, G + 0.51, jz + 0.082], {}, 5, 4);
    ball(0.02, cel("#ffb0c0", "#e07a9e"), [jx + h * 0.055, G + 0.49, jz + 0.075], { scale: [1, 0.6, 0.4] }, 5, 4);
  }
  for (let i = 0; i < 3; i++) ball(0.04, i === 1 ? APPLE : ORANGE, [jx + 0.22 + i * 0.08, G + 0.04, jz + 0.12 + (i % 2) * 0.06], { flat: true }, 7, 5);

  // ================================================================ BARRELS AND SACKS (right)
  const strawP = (seed: number) =>
    paint((p, _n, s) => {
      const bandH = [0.1, 0.4].some((h) => Math.abs(s[0] - h) < 0.025);
      const lash = ((s[1] % 45) + 45) % 45 < 4;
      if (bandH || lash) return STRAW_D;
      return noise(p, 0.05, seed) > 0.55 ? STRAW_D : STRAW;
    });
  const barrel = (x: number, y: number, z: number, seed: number) => {
    lathe([[0, 0], [0.2, 0], [0.245, 0.06], [0.265, 0.25], [0.245, 0.44], [0.2, 0.5], [0, 0.5]], [x, y, z], strawP(seed), 10);
    cyl(0.205, 0.205, 0.02, 10, WOOD, [x, y + 0.505, z]);
    swp(catmull(ringPts(x, y + 0.5, z, 0.14, 0.14, 8), { closed: true }), 0.012, STRAW_D);
    b.part(new THREE.PlaneGeometry(0.18, 0.27), "#ffffff", { bone: root, at: [x, y + 0.26, z + 0.272], dir: [0, 0, 1], axis: "z", texture: labelTex });
  };
  barrel(2.0, G, -0.55, 91);
  barrel(2.52, G, -0.5, 92);
  barrel(2.26, G + 0.5, -0.52, 93);
  const sackP = paint((p, _n, s) => (((s[0] % 0.09) + 0.09) % 0.09 < 0.012 || noise(p, 0.04, 5) > 0.62 ? STRAW_D : STRAW));
  for (const [x, z, r] of [[1.9, 0.1, 0], [2.0, 0.42, 20]] as [number, number, number][]) {
    lathe([[0, -0.2], [0.13, -0.2], [0.16, -0.12], [0.17, 0], [0.16, 0.12], [0.13, 0.2], [0, 0.2]], [x, G + 0.17, z], sackP, 9, { axis: [Math.cos((r * Math.PI) / 180), 0, Math.sin((r * Math.PI) / 180)] });
    swp(catmull([[x - 0.1, G + 0.01, z], [x - 0.1, G + 0.17, z + 0.17]]), 0.01, STRAW_D);
  }
  // crate of sunsettia
  const cx = 1.95;
  const cz = 0.65;
  box(0.5, 0.04, 0.4, WOOD_D, [cx, G + 0.02, cz]);
  for (const s of [1, -1]) {
    box(0.04, 0.22, 0.4, WOOD, [cx + s * 0.23, G + 0.13, cz]);
    box(0.5, 0.22, 0.04, WOOD, [cx, G + 0.13, cz + s * 0.18]);
  }
  for (let i = 0; i < 6; i++) ball(0.055, ORANGE, [cx - 0.14 + (i % 3) * 0.14, G + 0.2 + (i > 2 ? 0.03 : 0), cz - 0.08 + Math.floor(i / 3) * 0.16], { flat: true }, 7, 5);

  // ================================================================ NOBORI FLAGS
  for (const s of [1, -1]) {
    const px = s * 2.5;
    swp(catmull([[px, G - 0.02, 2.05], [px, G + 1.7, 2.05], [px, G + 3.15, 2.05]]), [0.04, 0.025], BAMBOO, { sides: 6 });
    rod([px - 0.28, G + 3.0, 2.05], [px + 0.28, G + 3.0, 2.05], 0.02, BAMBOO_N);
    ball(0.03, GOLD, [px, G + 3.2, 2.05]);
    b.cards([frame([px, G + 2.98, 2.05], [0, 1, 0])], s > 0 ? noboriB : noboriA, { size: [0.46, 1.95], lean: 180, flow: [0, 0, 1], bone: root, sink: 0 });
    for (let k = 0; k < 3; k++) cyl(0.045, 0.045, 0.012, 6, BAMBOO_N, [px, G + 0.4 + k * 0.9, 2.05]);
  }

  // ================================================================ CRYSTALS (electro)
  const cry: [number, number, number, number, number][] = [
    [0, 0, 0.6, 0.0, 0.0], [0.2, 0.08, 0.42, 0.25, 0.15], [-0.18, 0.1, 0.38, -0.3, 0.2], [0.05, -0.22, 0.34, 0.15, -0.4], [-0.1, 0.25, 0.3, -0.1, 0.45],
  ];
  const cx0 = 1.75;
  const cz0 = -1.35;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ball(0.1 + 0.03 * (i % 2), stoneP(100 + i, 0.5), [cx0 + Math.cos(a) * 0.32, G + 0.03, cz0 + Math.sin(a) * 0.3], { flat: true, scale: [1.1, 0.7, 1] }, 6, 4);
  }
  cry.forEach(([dx, dz, h, rx, rz], i) => {
    const g = new THREE.Group();
    void g;
    const body = new THREE.CylinderGeometry(0.06, 0.07, h * 0.7, 6);
    const tip = new THREE.ConeGeometry(0.06, h * 0.3, 6);
    const tipM = xf(tip, [0, h * 0.5, 0]);
    const geo = mergeGeometries([xf(body, [0, h * 0.35, 0]), tipM], false)!;
    glow(P(geo, i % 2 ? PURPLE_G : "#a468ff", [cx0 + dx, G, cz0 + dz], { rotation: [rz * 57, 0, -rx * 57] }), 1.4);
  });

  // ================================================================ GROUND DRESSING
  const inCourt = (x: number, z: number) => Math.abs(x) < 1.85 && z > -1.0 && z < 2.45;
  const keep = (h: { at: THREE.Vector3; n: THREE.Vector3 }) =>
    h.n.y > 0.9 && !inCourt(h.at.x, h.at.z) && h.at.z < 2.4 && !(Math.abs(h.at.x) < 1.5 && h.at.z < -0.6) && Math.hypot(h.at.x - bx, h.at.z - bz) > 0.5;
  const baseSkin = b.surface(base);
  b.cards(baseSkin.scatter(300, { rng: R, minDist: 0.17, filter: keep }), grassTex, { size: [0.2, 0.22], lean: 10, cross: true, vary: 0.35, spin: 180, rng: R, bone: root });
  b.cards(baseSkin.scatter(36, { rng: R, minDist: 0.4, filter: keep }), flowerW, { size: [0.1, 0.15], cross: true, vary: 0.3, rng: R, bone: root });
  b.cards(baseSkin.scatter(30, { rng: R, minDist: 0.4, filter: keep }), flowerV, { size: [0.1, 0.15], cross: true, vary: 0.3, rng: R, bone: root });
  glow(
    b.cards(
      [[-1.85, 0.2], [-2.55, 0.9], [-1.9, 0.65], [-2.6, 0.2], [1.8, -2.0], [2.2, -1.1], [-1.9, -0.9], [2.55, 0.3]].map(([x, z]) => frame([x, G, z], [0, 1, 0])),
      lilyTex,
      { size: [0.2, 0.23], cross: true, vary: 0.25, rng: R, bone: root },
    ),
    1.3,
  );
  const fall = Array.from({ length: 120 }, () => {
    const a = rr(0, Math.PI * 2);
    const rad = Math.sqrt(R()) * 2.6;
    const x = tx + 0.8 + Math.cos(a) * rad;
    const z = tz + 1.2 + Math.sin(a) * rad;
    return frame([x, (inCourt(x, z) ? GY : G) + 0.012, z], [0, 1, 0]);
  });
  b.cards(fall, [petalTex, petalTex2], { size: 0.085, lean: 90, mirror: true, flow: (_f: unknown, i: number) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)], rng: R, bone: root } as Parameters<typeof b.cards>[2]);
  // spirit lights
  const spirit: [number, number, number, string][] = [[-0.5, 1.8, 0.4, TEAL_G], [0.6, 2.1, 1.0, PURPLE_G], [-1.6, 1.2, -0.3, PURPLE_G], [1.6, 1.5, -0.4, TEAL_G], [-2.7, 1.6, 0.9, TEAL_G], [0.2, 1.3, -0.1, PURPLE_G]];
  for (const [x, y, z, c] of spirit) glow(ball(0.028, c, [x, y, z], {}, 6, 4), 1.4);

  // ================================================================ HINGED PARTS (built last so they take their own bones)
  const bellJ = b.joint("bell", { parent: root, at: [0, FY + 1.18, -0.95], role: "hinge" });
  const bellR = new THREE.SphereGeometry(0.12, 12, 9);
  P(bellR, GOLD, [0, FY + 0.95, -0.95], { bone: bellJ });
  P(new THREE.TorusGeometry(0.122, 0.012, 4, 12), GOLD, [0, FY + 0.95, -0.95], { bone: bellJ, rotation: [90, 0, 0] });
  box(0.12, 0.012, 0.012, "#3a2a40", [0, FY + 0.9, -0.835], { bone: bellJ });
  ball(0.018, "#3a2a40", [0, FY + 0.88, -0.95], { bone: bellJ }, 5, 4);
  rod([0, FY + 1.18, -0.95], [0, FY + 1.06, -0.95], 0.012, GOLD, { bone: bellJ });
  const bellRope = paint((_p, _n, s) => {
    const k = ((((s[1] - 360 * s[0] * 5) % 120) + 120) % 120);
    return k < 40 ? RED_F : k < 80 ? CREAM : cel("#8b55e0", "#5a38a8");
  });
  swp(catmull([[0, FY + 0.83, -0.86], [0.01, FY + 0.65, -0.85], [0, FY + 0.5, -0.86]]), 0.018, bellRope, { bone: bellJ, sides: 6 });
  hang([[0, FY + 0.5, -0.86]], tasselTex, [0.06, 0.2], bellJ);

  const chochin = (name: string, top: Pt, k: number, ang: number) => {
    const j = b.joint(name, { parent: root, at: top, role: "hinge" });
    const [x, y, z] = top;
    const body: THREE.Vector2[] = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      body.push(new THREE.Vector2((0.065 + 0.105 * Math.sin(Math.PI * t)) * k, (-0.17 + 0.34 * t) * k));
    }
    const cy = y - 0.05 * k - 0.02 * k - 0.17 * k - 0.06 * k;
    glow(b.part(new THREE.LatheGeometry(body, 12), "#ffffff", { bone: j, at: [x, cy, z], texture: lanternTex, rotation: [0, ang, 0] }), 1.3);
    for (const dy of [0.185, -0.185]) {
      lathe([[0, 0], [0.075 * k, 0], [0.085 * k, 0.015 * k], [0.07 * k, 0.03 * k], [0, 0.03 * k]], [x, cy + dy * k - (dy > 0 ? 0.0 : 0.03 * k), z], LACQ, 10, { bone: j });
    }
    rod([x, y, z], [x, cy + 0.215 * k, z], 0.007 * k, GOLD, { bone: j });
    ball(0.016 * k, GOLD, [x, y, z], { bone: j }, 6, 4);
    hang([[x, cy - 0.215 * k, z]], tasselTex, [0.05 * k, 0.17 * k], j);
    return j;
  };
  chochin("lanternL", [0.72, FY + 1.18, -0.95], 1, 20);
  chochin("lanternR", [-0.72, FY + 1.18, -0.95], 1, -20);
  chochin("lanternTreeA", [tx + 0.8, 2.07, tz + 0.15], 0.8, 40);
  chochin("lanternTreeB", [tx - 0.75, 1.88, tz - 0.1], 0.8, 100);

  // shrine doors
  for (const s of [1, -1]) {
    const dj = b.joint(s > 0 ? "doorL" : "doorR", { parent: root, at: [s * 0.4, FY, -1.4], role: "hinge" });
    const dx = s * 0.2;
    box(0.4, 1.0, 0.05, RED_F, [dx, FY + 0.5, -1.4], { bone: dj });
    for (const f of [1, -1])
      b.part(new THREE.PlaneGeometry(0.34, 0.9), "#ffffff", { bone: dj, at: [dx, FY + 0.5, -1.4 + f * 0.0255], dir: [0, 0, f], axis: "z", texture: doorTex });
    ball(0.02, GOLD, [dx - s * 0.17, FY + 0.5, -1.4 + 0.03], { bone: dj }, 6, 4);
    b.pose(dj, { axis: [0, 1, 0], deg: s * 72 });
  }

  // pinwheel
  const pwx = -2.05;
  const pwz = -0.3;
  rod([pwx, G, pwz], [pwx, G + 0.55, pwz], 0.008, BAMBOO);
  const pw = b.joint("pinwheel", { parent: root, at: [pwx, G + 0.56, pwz + 0.02], dir: [0, 0, 1], role: "hinge" });
  const pwc = [cel("#ff5a6a", "#c93a6a"), cel("#ffd24a", "#e0983a"), cel("#4fd0e0", "#3a8ac0"), cel("#b985ff", "#7a58d0")];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    extr([[0, 0], [0.11, 0.0], [0.11, 0.11]], [pwx, G + 0.56, pwz + 0.03], [Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], 0.004, pwc[i], { bone: pw });
  }
  ball(0.016, GOLD, [pwx, G + 0.56, pwz + 0.03], { bone: pw }, 6, 4);

  return b.root;
}
