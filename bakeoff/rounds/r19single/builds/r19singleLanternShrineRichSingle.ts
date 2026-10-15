// Roadside shrine: a vermilion torii with shide-paper rope and glowing paper lanterns, a small tiled hokora on a stone
// plinth with bell and offering box, stone lanterns, fox guardians, offerings, an ema rack, a sakura tree and an
// Electro rune circle: cel-shaded Genshin (Inazuma) look from the toon kit, glowing parts from the glow kit.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { grain, mottle, paint, scales } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull } from "../../../../src/path";
import type { SweepOptions } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Lantern Shrine",
  description:
    "A roadside Inazuma-style shrine: vermilion torii with shide rope and glowing paper lanterns, tiled hokora with bell and offering box, stone lanterns, fox guardians, offerings, ema rack, sakura tree and an Electro rune circle.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type V = [number, number, number];
type Col = string | Paint;

export default function build() {
  const b = createBuilder({ name: "lanternShrine", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });
  type Bone = typeof root;
  const rand = rng(7);
  const BASE = 0.1;
  const TZ = 1.3;

  // ------------------------------------------------------------------------------------------------ palette
  const VERM = cel("#e8472f", "#a82a45");
  const GOLD = cel("#ffd75e", "#d58a2a");
  const INDIGO = cel("#3d3b6b", "#25234a");
  const CREAMW = cel("#fff3d6", "#e6cdd0");
  const WOODV = cel(grain("#b87848", "#9d6038", { size: 0.04, axis: "y" }), "#6e3f45");
  const WOODH = cel(grain("#c48a56", "#a86c40", { size: 0.04, axis: "x" }), "#74424a");
  const DARKWOOD = cel(grain("#6a4538", "#563436", { size: 0.03, axis: "y" }), "#3a2540");
  const STONE = cel(mottle("#cfd0d6", "#b0b5c0", { size: 0.35, seed: 3 }), "#7e84a2");
  const STONE_M = cel(mottle("#b9bfc4", "#82b46c", { size: 0.22, seed: 5, contrast: 1.4 }), "#5c7592");
  const DARKSTONE = cel("#62657c", "#3d3f5e");
  const PAVER = cel(mottle("#d8d3c6", "#bfbbb2", { size: 0.25, seed: 7 }), "#8d8aa4");
  const GRASS = cel(mottle("#86dc6a", "#5fc268", { size: 0.4, seed: 2 }), "#3f9e75");
  const EARTH = cel("#9a7050", "#6b4a52");
  const GROUNDP = paint((_p, n) => (n.y > 0.5 ? GRASS : EARTH));
  const TILE = cel(scales(["#4e6aa8", "#5a75b4", "#46609c"], "#262e5e", { size: 0.075, width: 0.14 }));
  const GABLEFACE = cel("#f6e6c4", "#dcc3c6");
  const ROOFP = paint((_p, n) => (Math.abs(n.z) > 0.7 ? GABLEFACE : n.y < -0.6 ? DARKWOOD : TILE));
  const PINK = cel(mottle("#ffc4d9", "#ff9fc2", { size: 0.3, seed: 9, contrast: 1.2 }), "#e48fb8");
  const BARK = cel(grain("#6d4a45", "#583a3e", { size: 0.03, axis: "y" }), "#3d2a40");
  const STRAWP = cel(grain("#ebcf7c", "#cfae5a", { size: 0.02, axis: "y" }), "#a88458");
  const BARRELW = cel(grain("#c4864f", "#aa6b41", { size: 0.025, axis: "y" }), "#744448");
  const CERAMIC = cel("#f4f1ea", "#c9c5da");
  const BRONZE = cel("#9a7a46", "#5e4a58");
  const MOCHI = cel("#fffaf0", "#e3d6e6");
  const TWIST = paint((_p, _n, s) => (((s[0] * 70 + s[1] / 360) % 1) < 0.5 ? "#e8c46c" : "#bf9440"));
  const TWIST_BELL = paint((_p, _n, s) => {
    const k = (s[0] * 12 + s[1] / 360) % 1;
    return k < 0.33 ? "#e8472f" : k < 0.66 ? "#fff3d6" : "#ffd75e";
  });

  // ------------------------------------------------------------------------------------------------ textures
  const GRASS_T = svg(
    `<svg viewBox="0 0 40 48"><path d="M4 48 Q6 24 2 8 Q12 22 14 48Z" fill="#69c45a"/><path d="M12 48 Q16 20 14 2 Q26 18 24 48Z" fill="#8be06a"/><path d="M22 48 Q30 26 36 10 Q36 30 32 48Z" fill="#5fb85c"/><path d="M16 48 Q22 30 28 20 Q27 36 26 48Z" fill="#a4ee7c"/></svg>`,
    { size: 128 },
  );
  const BLOSSOM = svg(
    `<svg viewBox="0 0 48 48"><g transform="translate(24 24)">${[0, 72, 144, 216, 288]
      .map(
        (a) =>
          `<g transform="rotate(${a})"><ellipse cx="0" cy="-11" rx="8" ry="11.5" fill="#ffc7dc" stroke="#f08fb4" stroke-width="1.6"/><path d="M0 -22 L0 -14" stroke="#f08fb4" stroke-width="1.4"/></g>`,
      )
      .join("")}<circle r="4.2" fill="#ffe27a"/><circle r="1.6" fill="#e88a3a"/></g></svg>`,
    { size: 128 },
  );
  const FLOWER = svg(
    `<svg viewBox="0 0 24 40"><path d="M12 40 L12 16" stroke="#4fa85a" stroke-width="2.6" fill="none"/><path d="M12 32 Q4 28 3 22 Q10 24 12 30Z" fill="#69c45a"/><g transform="translate(12 10)">${[0, 60, 120, 180, 240, 300]
      .map((a) => `<ellipse cx="0" cy="-5" rx="2.8" ry="4.6" fill="#fffaf0" transform="rotate(${a})"/>`)
      .join("")}<circle r="3" fill="#ffc83a"/></g></svg>`,
    { size: 128 },
  );
  const SHIDE = svg(
    `<svg viewBox="0 0 24 64"><path d="M12 2 L20 12 L4 24 L20 36 L4 48 L16 62" stroke="#e3d4ef" stroke-width="9" stroke-linejoin="miter" fill="none"/><path d="M12 2 L20 12 L4 24 L20 36 L4 48 L16 62" stroke="#ffffff" stroke-width="6" stroke-linejoin="miter" fill="none"/></svg>`,
    { size: 128 },
  );
  const TASSEL = svg(
    `<svg viewBox="0 0 20 60"><circle cx="10" cy="5" r="4.4" fill="#ffd75e" stroke="#d58a2a" stroke-width="1"/><path d="M10 8 L10 22" stroke="#e8472f" stroke-width="3.2"/><rect x="6" y="20" width="8" height="5" fill="#ffd75e" stroke="#d58a2a" stroke-width="0.8"/>${[3, 6, 8.5, 10, 11.5, 14, 17]
      .map((x, i) => `<path d="M${x} 25 L${x + (i % 2 ? 0.5 : -0.5)} 58" stroke="${i % 2 ? "#e8472f" : "#ffd75e"}" stroke-width="2"/>`)
      .join("")}</svg>`,
    { size: 120 },
  );
  const LANT = (() => {
    const ribs = Array.from(
      { length: 11 },
      (_, i) =>
        `<line x1="0" y1="${8 + i * 6.4}" x2="256" y2="${8 + i * 6.4}" stroke="#d05a22" stroke-width="1.2" opacity="0.8"/>`,
    ).join("");
    const motifs = [0, 64, 128, 192, 256]
      .map(
        (x) =>
          `<g transform="translate(${x} 40)"><circle r="17" fill="#ffd98a" stroke="#8a2618" stroke-width="2.4"/><path d="M0 -11 C7 -4 8 3 0 10 C-8 3 -7 -4 0 -11Z" fill="#c8321e"/><path d="M0 -4 C3 0 3 3 0 6 C-3 3 -3 0 0 -4Z" fill="#ffb347"/></g>`,
      )
      .join("");
    return svg(
      `<svg viewBox="0 0 256 80"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a3a"/><stop offset="0.5" stop-color="#ffb347"/><stop offset="1" stop-color="#ff8a3a"/></linearGradient></defs><rect width="256" height="80" fill="url(#g)"/>${ribs}<rect y="0" width="256" height="5" fill="#8a2618"/><rect y="75" width="256" height="5" fill="#8a2618"/>${motifs}</svg>`,
      { size: 512 },
    );
  })();
  const DOOR = svg(
    `<svg viewBox="0 0 48 80"><rect width="48" height="80" fill="#a8402f"/>${Array.from({ length: 7 }, (_, i) => `<line x1="${4 + i * 6.7}" y1="4" x2="${4 + i * 6.7}" y2="76" stroke="#e8c27a" stroke-width="1.4"/>`).join("")}${Array.from({ length: 12 }, (_, i) => `<line x1="4" y1="${4 + i * 6.5}" x2="44" y2="${4 + i * 6.5}" stroke="#e8c27a" stroke-width="1.4"/>`).join("")}<rect x="1" y="1" width="46" height="78" fill="none" stroke="#5a2430" stroke-width="2.4"/><rect x="0" y="0" width="7" height="7" fill="#ffd75e"/><rect x="41" y="0" width="7" height="7" fill="#ffd75e"/><rect x="0" y="73" width="7" height="7" fill="#ffd75e"/><rect x="41" y="73" width="7" height="7" fill="#ffd75e"/></svg>`,
    { size: 192 },
  );
  const PLAQUE = svg(
    `<svg viewBox="0 0 40 48"><rect width="40" height="48" rx="2" fill="#25234a"/><rect x="2" y="2" width="36" height="44" fill="none" stroke="#ffd75e" stroke-width="1.4"/><rect x="4.5" y="4.5" width="31" height="39" fill="none" stroke="#d58a2a" stroke-width="0.8"/><circle cx="20" cy="22" r="9" fill="none" stroke="#ffd75e" stroke-width="1.6"/><path d="M20 12 C25 18 26 24 20 30 C14 24 15 18 20 12Z" fill="#e8472f" stroke="#ffd75e" stroke-width="0.8"/><path d="M8 38 Q14 34 20 38 T32 38" stroke="#ffd75e" stroke-width="1.4" fill="none"/><circle cx="8" cy="8" r="1.4" fill="#ffd75e"/><circle cx="32" cy="8" r="1.4" fill="#ffd75e"/></svg>`,
    { size: 256 },
  );
  const RANMA = svg(
    `<svg viewBox="0 0 80 14"><rect width="80" height="14" fill="#ffd98a"/>${Array.from({ length: 14 }, (_, i) => `<rect x="${3 + i * 5.8}" y="0" width="1.4" height="14" fill="#8a4a2a"/>`).join("")}<rect y="0" width="80" height="1.4" fill="#8a4a2a"/><rect y="12.6" width="80" height="1.4" fill="#8a4a2a"/></svg>`,
    { size: 320 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="none" stroke="#c8a6ff" stroke-width="2.6"/><circle cx="64" cy="64" r="53" fill="none" stroke="#8f6bff" stroke-width="2.2" stroke-dasharray="9 5"/><circle cx="64" cy="64" r="33" fill="none" stroke="#c8a6ff" stroke-width="2"/><path d="M64 22 L100 84 L28 84 Z" fill="none" stroke="#9b7bff" stroke-width="2.2"/><path d="M64 106 L28 44 L100 44 Z" fill="none" stroke="#9b7bff" stroke-width="2.2"/>${Array.from({ length: 12 }, (_, i) => `<line x1="64" y1="3" x2="64" y2="10" stroke="#ffffff" stroke-width="2.4" transform="rotate(${i * 30} 64 64)"/>`).join("")}${Array.from({ length: 6 }, (_, i) => `<circle cx="64" cy="14" r="3" fill="#ffffff" transform="rotate(${i * 60 + 30} 64 64)"/>`).join("")}<circle cx="64" cy="64" r="7" fill="#ffffff"/><circle cx="64" cy="64" r="12" fill="none" stroke="#d9c2ff" stroke-width="2"/></svg>`,
    { size: 512 },
  );
  const EMA = [
    `<g><path d="M14 40 L24 22 L34 40 L30 46 L18 46Z" fill="#ff9a3a" stroke="#7a3a1a" stroke-width="1.2"/><path d="M14 40 L18 30 L24 40Z M34 40 L30 30 L24 40Z" fill="#fff6e6"/><path d="M14 40 L12 26 L20 30Z M34 40 L36 26 L28 30Z" fill="#ff9a3a" stroke="#7a3a1a" stroke-width="1"/><circle cx="20" cy="38" r="1.2" fill="#22112f"/><circle cx="28" cy="38" r="1.2" fill="#22112f"/><circle cx="24" cy="43" r="1.3" fill="#22112f"/></g>`,
    `<g><circle cx="24" cy="34" r="12" fill="#2a2a60"/><path d="M28 26 A10 10 0 1 0 28 42 A7.5 7.5 0 1 1 28 26Z" fill="#ffe27a"/><circle cx="16" cy="26" r="1.4" fill="#ffe27a"/><circle cx="34" cy="40" r="1.2" fill="#ffe27a"/></g>`,
    `<g transform="translate(24 34)">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-6.5" rx="4.6" ry="6.4" fill="#ffc7dc" stroke="#e46a98" stroke-width="1" transform="rotate(${a})"/>`).join("")}<circle r="2.6" fill="#ffe27a"/></g>`,
  ].map((art) =>
    svg(
      `<svg viewBox="0 0 48 60"><path d="M24 2 L44 14 L44 58 L4 58 L4 14Z" fill="#e6b87a" stroke="#8a5a35" stroke-width="2.6" stroke-linejoin="round"/><path d="M24 7 L39 16 L39 53 L9 53 L9 16Z" fill="none" stroke="#c48a56" stroke-width="1.2"/><circle cx="24" cy="10" r="2" fill="#6a4538"/>${art}</svg>`,
      { size: 192 },
    ),
  );
  const LABEL = svg(
    `<svg viewBox="0 0 40 52"><rect width="40" height="52" fill="#fff8ea" stroke="#e8472f" stroke-width="3"/><circle cx="20" cy="18" r="9" fill="#e8472f"/><circle cx="20" cy="18" r="4" fill="#fff8ea"/><path d="M7 34 Q13 30 20 34 T33 34" stroke="#3d3b6b" stroke-width="2.2" fill="none"/><path d="M7 42 Q13 38 20 42 T33 42" stroke="#3d3b6b" stroke-width="2.2" fill="none"/></svg>`,
    { size: 160 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64"><g transform="translate(32 32)">${Array.from({ length: 8 }, (_, i) => `<ellipse cx="0" cy="-17" rx="6.5" ry="13" fill="#ffd75e" stroke="#d58a2a" stroke-width="1.6" transform="rotate(${i * 45})"/>`).join("")}<circle r="9" fill="#e8472f" stroke="#d58a2a" stroke-width="1.6"/><circle r="3.6" fill="#ffd75e"/></g></svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------------------------------------------ helpers
  type O = {
    bone?: Bone;
    rot?: V;
    flat?: boolean;
    scale?: number | V;
    dir?: V;
    axis?: "x" | "y" | "z";
    up?: V;
    texture?: THREE.Texture;
  };
  const put = (g: THREE.BufferGeometry, c: Col, x: number, y: number, z: number, o: O = {}) => {
    const opts: PartOptions = { at: [x, y, z], bone: o.bone ?? root };
    if (o.dir) {
      opts.dir = o.dir;
      opts.axis = o.axis ?? "y";
      if (o.up) opts.up = o.up;
    } else if (o.rot) opts.rotation = o.rot;
    if (o.scale !== undefined) opts.scale = o.scale;
    if (o.flat) opts.flat = true;
    if (o.texture) opts.texture = o.texture;
    return b.part(g, c, opts);
  };
  const box = (w: number, h: number, d: number, c: Col, x: number, y: number, z: number, o: O = {}) =>
    put(new THREE.BoxGeometry(w, h, d), c, x, y, z, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, c: Col, x: number, y: number, z: number, o: O = {}) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg), c, x, y, z, { flat: seg <= 10, ...o });
  const ball = (r: number, c: Col, x: number, y: number, z: number, o: O = {}) =>
    put(new THREE.SphereGeometry(r, 8, 6), c, x, y, z, { flat: true, ...o });
  const plane = (w: number, h: number, tex: THREE.Texture, x: number, y: number, z: number, dir: V, o: O = {}) =>
    put(new THREE.PlaneGeometry(w, h), "#ffffff", x, y, z, { texture: tex, dir, axis: "z", ...o });
  const rod = (a: V, c: V, r: number | [number, number], col: Col, o: SweepOptions = {}) =>
    b.rod(a, c, r, col, { bone: root, ...o });
  const tube = (pts: V[], r: number | number[], col: Col, o: SweepOptions = {}) =>
    b.sweep(catmull(pts), r, col, { bone: root, ...o });
  const lat = (pts: OutlinePoint[], c: Col, x: number, y: number, z: number, seg = 10, bone: Bone = root) =>
    b.lathe(pts, { at: [x, y, z], color: c, segments: seg, bone });
  const ringPts = (cx: number, cy: number, cz: number, r: number, n: number): V[] =>
    Array.from({ length: n }, (_, i): V => {
      const a = (i / n) * Math.PI * 2;
      return [cx + r * Math.cos(a), cy, cz + r * Math.sin(a)];
    });
  const loop = (pts: V[], r: number, col: Col) =>
    b.sweep(catmull(pts, { closed: true }), r, col, { bone: root, sides: 6 });
  const hang = (pts: V[], texture: THREE.Texture, size: [number, number], bone: Bone = root) =>
    b.cards(
      pts.map((p) => frame(p, [0, 1, 0])),
      texture,
      { size, lean: 180, flow: [0, 0, 1], bone, cross: true },
    );

  // ------------------------------------------------------------------------------------------------ ground
  put(new THREE.CylinderGeometry(2.25, 2.32, BASE, 18), GROUNDP, 0, BASE / 2, 0, { flat: true });
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + rand() * 0.1;
    const x = Math.sin(a) * 2.18;
    const z = Math.cos(a) * 2.18;
    if (z > 1.5 && Math.abs(x) < 0.55) continue;
    const r = 0.09 + rand() * 0.08;
    put(new THREE.IcosahedronGeometry(r, 0), STONE_M, x, BASE + r * 0.3, z, {
      flat: true,
      scale: [1, 0.7, 1],
      rot: [rand() * 40, rand() * 360, rand() * 40],
    });
  }
  // stepping-stone path from the torii to the offering box
  for (let i = 0; i < 8; i++) {
    for (const s of [-1, 1]) {
      const z = 2.0 - i * 0.18;
      box(0.34, 0.045, 0.28, PAVER, s * 0.2 + (rand() - 0.5) * 0.04, BASE + 0.02, z, {
        rot: [0, (rand() - 0.5) * 12, 0],
      });
    }
  }

  // ------------------------------------------------------------------------------------------------ torii
  const px = (y: number) => 1.0 - (0.06 * (y - 0.3)) / 2.26;
  for (const s of [1, -1]) {
    cyl(0.27, 0.31, 0.2, 8, DARKSTONE, s * 1.0, BASE + 0.1, TZ);
    rod([s * 1.0, BASE + 0.2, TZ], [s * 0.94, 2.56, TZ], [0.18, 0.145], VERM, { sides: 10 });
    for (const y of [0.4, 1.62]) cyl(0.2, 0.2, 0.06, 10, GOLD, s * px(y), y, TZ);
    box(0.07, 0.3, 0.1, INDIGO, s * 1.12, 1.8, TZ);
    box(0.04, 0.2, 0.18, GOLD, s * 1.24, 1.8, TZ);
    box(0.12, 0.2, 0.42, GOLD, s * 1.79, 2.74, TZ, { rot: [0, 0, s * 15] });
  }
  box(2.44, 0.15, 0.14, VERM, 0, 1.8, TZ);
  box(2.2, 0.12, 0.22, VERM, 0, 2.4, TZ);
  b.extrude(
    [
      [-1.75, 0.14, "sharp"],
      [-1.2, 0.0],
      [0, -0.04],
      [1.2, 0.0],
      [1.75, 0.14, "sharp"],
      [1.78, 0.34, "sharp"],
      [1.2, 0.2],
      [0, 0.17],
      [-1.2, 0.2],
      [-1.78, 0.34, "sharp"],
    ],
    { at: [0, 2.5, TZ], x: [1, 0, 0], thickness: 0.42, bevel: 0.02, color: INDIGO, bone: root },
  );
  // plaque
  box(0.4, 0.46, 0.1, GOLD, 0, 2.1, TZ);
  plane(0.34, 0.4, PLAQUE, 0, 2.1, TZ + 0.056, [0, 0, 1]);
  plane(0.34, 0.4, PLAQUE, 0, 2.1, TZ - 0.056, [0, 0, -1]);
  // shide rope
  const ropePts: V[] = [
    [-0.93, 2.31, TZ + 0.16],
    [-0.8, 2.26, TZ + 0.24],
    [-0.4, 2.19, TZ + 0.25],
    [0, 2.16, TZ + 0.25],
    [0.4, 2.19, TZ + 0.25],
    [0.8, 2.26, TZ + 0.24],
    [0.93, 2.31, TZ + 0.16],
  ];
  const ropePath = catmull(ropePts);
  b.sweep(ropePath, 0.045, TWIST, { bone: root, sides: 6 });
  for (const s of [1, -1]) {
    ball(0.06, GOLD, s * 0.93, 2.31, TZ + 0.16);
    hang([[s * 0.93, 2.29, TZ + 0.2]], TASSEL, [0.08, 0.24]);
  }
  hang(
    [0.14, 0.3, 0.5, 0.7, 0.86].map((t) => {
      const p = ropePath.at(t);
      return [p.x, p.y - 0.03, p.z] as V;
    }),
    SHIDE,
    [0.085, 0.24],
  );

  // paper lanterns (chochin) on hinge joints
  const chochin = (j: Bone, cx: number, top: number, cz: number, k: number) => {
    const capH = 0.04 * k;
    rod([cx, top + 0.1 * k, cz], [cx, top, cz], 0.007 * k, DARKWOOD, { bone: j, sides: 4 });
    cyl(0.075 * k, 0.1 * k, capH, 10, DARKWOOD, cx, top - capH / 2, cz, { bone: j });
    cyl(0.108 * k, 0.108 * k, 0.012 * k, 10, GOLD, cx, top - capH, cz, { bone: j });
    const bodyBottom = top - capH - 0.3 * k;
    const prof = (
      [
        [0.07, 0],
        [0.12, 0.012],
        [0.155, 0.05],
        [0.175, 0.11],
        [0.18, 0.15],
        [0.175, 0.19],
        [0.155, 0.25],
        [0.12, 0.288],
        [0.07, 0.3],
      ] as [number, number][]
    ).map(([r, y]) => new THREE.Vector2(r * k, y * k));
    glow(put(new THREE.LatheGeometry(prof, 12), "#ffffff", cx, bodyBottom, cz, { bone: j, texture: LANT }), 1.3);
    cyl(0.1 * k, 0.075 * k, capH, 10, DARKWOOD, cx, bodyBottom - capH / 2, cz, { bone: j });
    cyl(0.108 * k, 0.108 * k, 0.012 * k, 10, GOLD, cx, bodyBottom, cz, { bone: j });
    hang([[cx, bodyBottom - capH, cz]], TASSEL, [0.07 * k, 0.13 * k], j);
  };
  for (const s of [1, -1]) {
    const j = b.joint(`toriiLantern${s > 0 ? "L" : "R"}`, {
      parent: root,
      at: [s * 0.62, 2.44, TZ],
      dir: [0, -1, 0],
      role: "hinge",
    });
    chochin(j, s * 0.62, 2.34, TZ, 0.85);
  }

  // ------------------------------------------------------------------------------------------------ stone lanterns
  const toro = (x: number, z: number) => {
    box(0.5, 0.08, 0.5, DARKSTONE, x, 0.14, z);
    cyl(0.13, 0.2, 0.12, 6, STONE_M, x, 0.24, z);
    cyl(0.075, 0.09, 0.5, 6, STONE_M, x, 0.55, z);
    cyl(0.19, 0.14, 0.07, 6, STONE, x, 0.835, z);
    box(0.3, 0.3, 0.3, DARKSTONE, x, 1.02, z);
    glow(box(0.16, 0.18, 0.34, "#ffc766", x, 1.02, z), 1.4);
    glow(box(0.34, 0.18, 0.16, "#ffc766", x, 1.02, z), 1.4);
    lat(
      [
        [0, 0],
        [0.38, 0],
        [0.38, 0.02],
        [0.26, 0.07],
        [0.13, 0.14],
        [0.06, 0.21],
        [0, 0.26],
      ],
      STONE_M,
      x,
      1.17,
      z,
      4,
    );
    ball(0.055, GOLD, x, 1.46, z);
    cyl(0.02, 0.04, 0.05, 6, GOLD, x, 1.51, z);
  };
  toro(0.95, 0.6);
  toro(-0.95, 0.6);

  // ------------------------------------------------------------------------------------------------ the shrine
  box(1.62, 0.1, 1.22, DARKSTONE, 0, 0.15, -0.7);
  box(1.5, 0.22, 1.1, STONE, 0, 0.21, -0.7);
  box(0.9, 0.1, 0.28, STONE, 0, 0.15, 0.0);
  box(0.8, 0.16, 0.2, STONE, 0, 0.18, -0.06);
  box(1.34, 0.07, 1.0, WOODH, 0, 0.355, -0.7);
  // hall
  const zF = -0.57;
  box(0.84, 0.86, 0.62, CREAMW, 0, 0.82, -0.88);
  for (const sx of [1, -1])
    for (const z of [-0.57, -1.19]) box(0.07, 0.86, 0.07, VERM, sx * 0.415, 0.82, z);
  box(0.88, 0.06, 0.66, VERM, 0, 0.42, -0.88);
  box(0.9, 0.1, 0.68, VERM, 0, 1.2, -0.88);
  box(0.7, 0.62, 0.02, DARKWOOD, 0, 0.74, zF);
  for (const s of [1, -1]) {
    plane(0.3, 0.56, DOOR, s * 0.17, 0.74, zF + 0.012, [0, 0, 1]);
    put(new THREE.TorusGeometry(0.018, 0.005, 4, 10), GOLD, s * 0.04, 0.72, zF + 0.024);
  }
  glow(plane(0.68, 0.1, RANMA, 0, 1.085, zF + 0.012, [0, 0, 1]), 1.1);
  // porch pillars, front beam, brackets
  for (const s of [1, -1]) {
    cyl(0.045, 0.05, 0.74, 8, VERM, s * 0.56, 0.76, -0.3);
    box(0.2, 0.08, 0.12, GOLD, s * 0.56, 1.1, -0.3);
    cyl(0.07, 0.07, 0.03, 8, GOLD, s * 0.56, 0.405, -0.3);
  }
  box(1.3, 0.12, 0.12, VERM, 0, 1.19, -0.3);
  box(1.3, 0.04, 0.14, GOLD, 0, 1.115, -0.3);
  // roof
  const roofTop: [number, number][] = [
    [1.06, 0.08],
    [0.8, 0.1],
    [0.45, 0.24],
    [0.15, 0.42],
  ];
  const roofOutline: OutlinePoint[] = [
    [-0.95, 0, "sharp"],
    [0.95, 0, "sharp"],
    [1.06, 0.08, "sharp"],
    [0.8, 0.1],
    [0.45, 0.24],
    [0.15, 0.42],
    [0, 0.5, "sharp"],
    [-0.15, 0.42],
    [-0.45, 0.24],
    [-0.8, 0.1],
    [-1.06, 0.08, "sharp"],
  ];
  b.extrude(roofOutline, { at: [0, 1.25, -0.62], x: [1, 0, 0], thickness: 1.5, color: ROOFP, bone: root });
  rod([0, 1.77, -1.4], [0, 1.77, 0.16], 0.04, INDIGO, { sides: 6 });
  for (const zz of [-1, 1]) {
    const z0 = zz > 0 ? 0.16 : -1.4;
    ball(0.06, GOLD, 0, 1.77, z0);
    b.spike([0, 1.78, z0], [0, 0.6, zz], 0.16, 0.04, GOLD, { bone: root, sides: 5 });
  }
  const trimPts: V[] = [
    ...[...roofTop].reverse().map(([x, y]): V => [-x, 1.25 + y + 0.005, 0.14]),
    [0, 1.755, 0.14],
    ...roofTop.map(([x, y]): V => [x, 1.25 + y + 0.005, 0.14]).reverse().reverse(),
  ];
  b.sweep(catmull(trimPts), 0.016, GOLD, { bone: root, sides: 5 });
  plane(0.26, 0.26, EMBLEM, 0, 1.46, 0.134, [0, 0, 1]);
  for (const s of [1, -1]) {
    rod([s * 1.06, 1.33, 0.12], [s * 1.06, 1.27, 0.12], 0.008, GOLD, { sides: 4 });
    ball(0.028, GOLD, s * 1.06, 1.255, 0.12);
  }
  // shrine rope with shide across the porch beam
  const porchRope = catmull([
    [-0.6, 1.07, -0.2],
    [-0.3, 1.0, -0.2],
    [0, 0.97, -0.2],
    [0.3, 1.0, -0.2],
    [0.6, 1.07, -0.2],
  ]);
  b.sweep(porchRope, 0.032, TWIST, { bone: root, sides: 6 });
  hang(
    [0.15, 0.35, 0.5, 0.65, 0.85].map((t) => {
      const p = porchRope.at(t);
      return [p.x, p.y - 0.02, p.z] as V;
    }),
    SHIDE,
    [0.06, 0.17],
  );
  // bell
  const bellJ = b.joint("bell", { parent: root, at: [0, 1.1, -0.3], dir: [0, -1, 0], role: "hinge" });
  rod([0, 1.1, -0.3], [0, 1.0, -0.3], 0.01, DARKWOOD, { bone: bellJ, sides: 4 });
  ball(0.078, GOLD, 0, 0.93, -0.3, { bone: bellJ, scale: [1, 0.92, 1] });
  box(0.08, 0.012, 0.016, INK, 0, 0.915, -0.222, { bone: bellJ });
  cyl(0.03, 0.03, 0.02, 8, GOLD, 0, 1.005, -0.3, { bone: bellJ });
  b.sweep(
    catmull([
      [0, 0.86, -0.3],
      [0, 0.7, -0.285],
      [0, 0.5, -0.26],
    ]),
    0.026,
    TWIST_BELL,
    { bone: bellJ, sides: 6 },
  );
  hang([[0, 0.5, -0.26]], TASSEL, [0.07, 0.18], bellJ);
  // shrine lanterns under the eaves
  for (const s of [1, -1]) {
    const j = b.joint(`eaveLantern${s > 0 ? "L" : "R"}`, {
      parent: root,
      at: [s * 0.88, 1.35, 0.02],
      dir: [0, -1, 0],
      role: "hinge",
    });
    chochin(j, s * 0.88, 1.25, 0.02, 0.8);
  }

  // offering box
  const sx0 = 0;
  const sz0 = 0.4;
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.06, 0.3, 0.06, WOODV, sx0 + sx * 0.3, BASE + 0.15, sz0 + sz * 0.17);
  box(0.7, 0.22, 0.42, WOODV, sx0, BASE + 0.41, sz0);
  box(0.74, 0.035, 0.46, VERM, sx0, 0.6, sz0);
  box(0.64, 0.01, 0.36, DARKWOOD, sx0, 0.62, sz0);
  for (let i = 0; i < 7; i++) box(0.045, 0.03, 0.4, WOODH, sx0 - 0.3 + i * 0.1, 0.64, sz0, { rot: [8, 0, 0] });
  box(0.34, 0.1, 0.012, GOLD, sx0, 0.5, sz0 + 0.216);
  box(0.28, 0.06, 0.014, VERM, sx0, 0.5, sz0 + 0.222);
  for (let i = 0; i < 8; i++)
    put(
      new THREE.CylinderGeometry(0.02, 0.02, 0.004, 8),
      GOLD,
      sx0 + (rand() - 0.5) * 0.56,
      0.66,
      sz0 + 0.02 + rand() * 0.14,
      { rot: [rand() * 16, 0, rand() * 16], flat: true },
    );

  // ------------------------------------------------------------------------------------------------ fox guardians
  for (const s of [1, -1]) {
    const x = s * 0.68;
    const z = 0.2;
    const t = BASE + 0.31;
    box(0.34, 0.26, 0.34, STONE, x, BASE + 0.13, z);
    box(0.4, 0.05, 0.4, DARKSTONE, x, BASE + 0.285, z);
    put(new THREE.SphereGeometry(1, 8, 6), STONE_M, x, t + 0.13, z - 0.04, { scale: [0.13, 0.14, 0.16], flat: true });
    for (const q of [1, -1])
      put(new THREE.SphereGeometry(1, 8, 6), STONE_M, x + q * 0.09, t + 0.1, z - 0.04, {
        scale: [0.06, 0.1, 0.13],
        flat: true,
      });
    b.capsule([x, t + 0.2, z], [x, t + 0.4, z + 0.07], [0.1, 0.07], STONE_M, { bone: root, sides: 8 });
    for (const q of [1, -1]) {
      rod([x + q * 0.055, t + 0.38, z + 0.09], [x + q * 0.055, t + 0.03, z + 0.13], 0.032, STONE_M, { sides: 6 });
      box(0.07, 0.04, 0.1, STONE_M, x + q * 0.055, t + 0.02, z + 0.15);
      cyl(0.06, 0.05, 0.1, 4, STONE_M, x + q * 0.1, t + 0.4, z + 0.06, { rot: [0, 0, q * 25] });
    }
    put(new THREE.SphereGeometry(1, 8, 6), STONE, x, t + 0.5, z + 0.09, { scale: [0.095, 0.085, 0.09], flat: true });
    put(new THREE.ConeGeometry(0.05, 0.15, 6), STONE, x, t + 0.475, z + 0.2, { rot: [90, 0, 0], flat: true });
    ball(0.018, INK, x, t + 0.49, z + 0.272);
    for (const q of [1, -1]) {
      put(new THREE.ConeGeometry(0.04, 0.14, 4), STONE, x + q * 0.06, t + 0.62, z + 0.05, {
        rot: [-8, 0, -q * 12],
        flat: true,
      });
      put(new THREE.ConeGeometry(0.022, 0.1, 4), VERM, x + q * 0.058, t + 0.615, z + 0.062, {
        rot: [-8, 0, -q * 12],
        flat: true,
      });
      box(0.034, 0.009, 0.012, INK, x + q * 0.045, t + 0.52, z + 0.172, { rot: [0, 0, q * 22] });
      ball(0.012, STONE_M, x + q * 0.07, t + 0.46, z + 0.2);
    }
    loop(ringPts(x, t + 0.41, z + 0.045, 0.088, 8), 0.02, VERM);
    box(0.09, 0.1, 0.014, VERM, x, t + 0.33, z + 0.135, { rot: [-8, 0, 0] });
    ball(0.02, GOLD, x, t + 0.27, z + 0.145);
    tube(
      [
        [x, t + 0.04, z - 0.14],
        [x + s * 0.17, t + 0.06, z - 0.2],
        [x + s * 0.24, t + 0.2, z - 0.15],
        [x + s * 0.2, t + 0.34, z - 0.1],
      ],
      [0.03, 0.06, 0.065, 0.025],
      STONE_M,
      { sides: 7 },
    );
  }

  // ------------------------------------------------------------------------------------------------ offering table
  const tx = 1.4;
  const tz = -0.1;
  const TT = 0.65;
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.05, 0.5, 0.05, WOODV, tx + sx * 0.17, 0.35, tz + sz * 0.3);
  box(0.46, 0.05, 0.72, WOODH, tx, 0.625, tz);
  box(0.4, 0.03, 0.04, VERM, tx, 0.6, tz - 0.3);
  // kagami mochi
  cyl(0.14, 0.14, 0.008, 10, VERM, tx, TT + 0.004, tz - 0.23);
  cyl(0.1, 0.11, 0.05, 10, MOCHI, tx, TT + 0.033, tz - 0.23);
  cyl(0.07, 0.075, 0.04, 10, MOCHI, tx, TT + 0.078, tz - 0.23);
  ball(0.036, "#ff9a2e", tx, TT + 0.12, tz - 0.23);
  put(new THREE.ConeGeometry(0.02, 0.05, 4), "#6cc06a", tx + 0.02, TT + 0.155, tz - 0.23, { rot: [0, 0, -30], flat: true });
  // rice bowls
  for (const s of [1, -1]) {
    lat(
      [
        [0, 0],
        [0.03, 0],
        [0.06, 0.04],
        [0.065, 0.065],
        [0.058, 0.065],
        [0.05, 0.04],
        [0, 0.025],
      ],
      CERAMIC,
      tx + s * 0.13,
      TT,
      tz - 0.02,
      8,
    );
    put(new THREE.SphereGeometry(0.052, 8, 5), MOCHI, tx + s * 0.13, TT + 0.045, tz - 0.02, {
      scale: [1, 0.55, 1],
      flat: true,
    });
  }
  // orange tray
  cyl(0.1, 0.085, 0.025, 10, VERM, tx, TT + 0.0125, tz - 0.02);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    ball(0.036, "#ff9a2e", tx + Math.cos(a) * 0.04, TT + 0.05, tz - 0.02 + Math.sin(a) * 0.04);
  }
  ball(0.036, "#ff9a2e", tx, TT + 0.085, tz - 0.02);
  // sake bottle and cups
  lat(
    [
      [0, 0],
      [0.04, 0],
      [0.048, 0.02],
      [0.048, 0.1],
      [0.026, 0.15],
      [0.02, 0.2],
      [0.026, 0.21],
      [0, 0.21],
    ],
    CERAMIC,
    tx,
    TT,
    tz + 0.12,
    8,
  );
  box(0.052, 0.05, 0.004, INDIGO, tx, TT + 0.07, tz + 0.168);
  for (const s of [1, -1]) cyl(0.03, 0.02, 0.03, 8, CERAMIC, tx + s * 0.12, TT + 0.015, tz + 0.12);
  // candles
  for (const s of [1, -1]) {
    cyl(0.04, 0.05, 0.02, 8, GOLD, tx + s * 0.16, TT + 0.01, tz + 0.23);
    cyl(0.022, 0.022, 0.1, 8, CREAMW, tx + s * 0.16, TT + 0.07, tz + 0.23);
    glow(
      put(new THREE.SphereGeometry(0.016, 6, 4), "#ffcf66", tx + s * 0.16, TT + 0.14, tz + 0.23, {
        scale: [1, 1.6, 1],
      }),
      1.6,
    );
  }

  // sake barrels
  const barrel = (x: number, z: number, k: number) => {
    const prof = (
      [
        [0, 0],
        [0.2, 0],
        [0.22, 0.06],
        [0.235, 0.19],
        [0.22, 0.32],
        [0.2, 0.38],
        [0, 0.38],
      ] as [number, number][]
    ).map(([r, y]): [number, number] => [r * k, y * k]);
    lat(prof, paint((p) => (p.y < BASE + 0.2 * k ? STRAWP : BARRELW)), x, BASE, z, 10);
    for (const [yy, rr, col] of [
      [0.1, 0.23, STRAWP],
      [0.19, 0.238, STRAWP],
      [0.3, 0.226, DARKWOOD],
      [0.36, 0.212, DARKWOOD],
    ] as [number, number, Col][])
      put(new THREE.TorusGeometry(rr * k, 0.012 * k, 4, 10), col, x, BASE + yy * k, z, { rot: [90, 0, 0], flat: true });
    cyl(0.2 * k, 0.2 * k, 0.015 * k, 10, BARRELW, x, BASE + 0.385 * k, z);
    plane(0.13 * k, 0.17 * k, LABEL, x, BASE + 0.29 * k, z + 0.228 * k, [0, 0, 1]);
  };
  barrel(1.4, -0.85, 1);
  barrel(1.02, -1.02, 0.82);
  // rice bales
  const bale = (x: number, y: number, z: number) => {
    cyl(0.11, 0.11, 0.36, 8, STRAWP, x, y, z, { rot: [0, 0, 90] });
    for (const dx of [-0.1, 0.1])
      put(new THREE.TorusGeometry(0.114, 0.008, 4, 8), DARKWOOD, x + dx, y, z, { rot: [0, 90, 0], flat: true });
  };
  bale(1.35, BASE + 0.11, 0.34);
  bale(1.35, BASE + 0.11, 0.56);
  bale(1.35, BASE + 0.3, 0.45);

  // ------------------------------------------------------------------------------------------------ incense burner
  box(0.3, 0.14, 0.3, STONE, -0.62, BASE + 0.07, 0.9);
  lat(
    [
      [0, 0.04],
      [0.07, 0.04],
      [0.12, 0.1],
      [0.125, 0.15],
      [0.1, 0.155],
      [0.1, 0.14],
      [0, 0.12],
    ],
    BRONZE,
    -0.62,
    BASE + 0.14,
    0.9,
    9,
  );
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    ball(0.02, BRONZE, -0.62 + Math.cos(a) * 0.07, BASE + 0.15, 0.9 + Math.sin(a) * 0.07);
  }
  cyl(0.095, 0.095, 0.01, 9, "#d9d4cf", -0.62, BASE + 0.258, 0.9);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    const ix = -0.62 + Math.cos(a) * 0.04;
    const iz = 0.9 + Math.sin(a) * 0.04;
    rod([ix, BASE + 0.26, iz], [ix + Math.cos(a) * 0.012, BASE + 0.39, iz + Math.sin(a) * 0.012], 0.004, "#8a5a35", {
      sides: 4,
    });
    glow(ball(0.007, "#ff7a3a", ix + Math.cos(a) * 0.012, BASE + 0.395, iz + Math.sin(a) * 0.012), 1.6);
  }

  // ------------------------------------------------------------------------------------------------ ema rack
  const rx = -1.45;
  const rz = 0.12;
  for (const s of [1, -1]) {
    rod([rx + s * 0.5, BASE, rz], [rx + s * 0.5, 1.15, rz], 0.04, WOODV, { sides: 6 });
    ball(0.04, GOLD, rx + s * 0.5, 1.17, rz);
  }
  box(1.2, 0.07, 0.09, WOODH, rx, 1.12, rz);
  box(1.0, 0.04, 0.05, WOODH, rx, 0.79, rz);
  box(1.36, 0.03, 0.36, TILE, rx, 1.22, rz, { rot: [-12, 0, 0] });
  box(1.4, 0.04, 0.04, INDIGO, rx, 1.3, rz - 0.07, { rot: [-12, 0, 0] });
  const emaRows: Array<[number, number[], number]> = [
    [0.98, [-0.36, -0.12, 0.12, 0.36], 1.12],
    [0.62, [-0.24, 0, 0.24], 0.79],
  ];
  let ei = 0;
  for (const [y, xs, beamY] of emaRows)
    for (const dx of xs) {
      const tex = EMA[ei++ % EMA.length];
      plane(0.17, 0.21, tex, rx + dx, y, rz + 0.008, [0, 0, 1]);
      plane(0.17, 0.21, tex, rx + dx, y, rz - 0.008, [0, 0, -1]);
      rod([rx + dx, y + 0.1, rz], [rx + dx, beamY, rz], 0.006, "#8a5a35", { sides: 4 });
    }

  // ------------------------------------------------------------------------------------------------ lantern posts
  for (const s of [1, -1]) {
    const x = s * 1.7;
    const z = 0.9;
    const ax = x - s * 0.4;
    box(0.24, 0.18, 0.24, STONE, x, BASE + 0.09, z);
    rod([x, BASE + 0.18, z], [x, 1.75, z], [0.055, 0.045], WOODV, { sides: 8 });
    ball(0.055, GOLD, x, 1.8, z);
    cyl(0.07, 0.07, 0.03, 8, GOLD, x, 1.0, z);
    rod([x, 1.7, z], [ax, 1.7, z], 0.03, WOODH, { sides: 6 });
    rod([x, 1.35, z], [x - s * 0.3, 1.68, z], 0.02, WOODH, { sides: 6 });
    ball(0.03, GOLD, ax, 1.72, z);
    const j = b.joint(`postLantern${s > 0 ? "L" : "R"}`, { parent: root, at: [ax, 1.7, z], dir: [0, -1, 0], role: "hinge" });
    chochin(j, ax, 1.6, z, 1.0);
  }

  // ------------------------------------------------------------------------------------------------ sakura
  tube(
    [
      [-1.45, 0.08, -0.85],
      [-1.4, 0.6, -0.85],
      [-1.25, 1.2, -0.9],
      [-1.3, 1.75, -0.95],
    ],
    [0.19, 0.14, 0.1, 0.06],
    BARK,
    { sides: 7 },
  );
  tube(
    [
      [-1.36, 0.95, -0.87],
      [-1.0, 1.35, -0.82],
      [-0.7, 1.75, -0.78],
    ],
    [0.07, 0.025],
    BARK,
    { sides: 6 },
  );
  tube(
    [
      [-1.34, 1.15, -0.9],
      [-1.62, 1.45, -0.95],
      [-1.9, 1.75, -1.0],
    ],
    [0.06, 0.022],
    BARK,
    { sides: 6 },
  );
  tube(
    [
      [-1.3, 1.3, -0.9],
      [-1.25, 1.55, -0.62],
      [-1.2, 1.75, -0.45],
    ],
    [0.05, 0.02],
    BARK,
    { sides: 6 },
  );
  const blobs: ReturnType<typeof put>[] = [];
  for (const [x, y, z, r] of [
    [-1.3, 2.05, -0.95, 0.6],
    [-0.85, 1.95, -0.8, 0.45],
    [-1.8, 1.9, -1.0, 0.45],
    [-1.35, 2.5, -0.9, 0.45],
    [-1.0, 2.35, -1.1, 0.4],
    [-1.7, 2.4, -0.75, 0.38],
    [-1.2, 1.85, -0.5, 0.38],
    [-0.7, 1.6, -0.8, 0.3],
    [-1.55, 1.65, -0.55, 0.3],
  ])
    blobs.push(
      put(new THREE.IcosahedronGeometry(r, 1), PINK, x, y, z, { flat: true, rot: [rand() * 60, rand() * 60, 0] }),
    );
  const bloom = b.surface(blobs).scatter(170, { rng: rng(5), minDist: 0.1, filter: (h) => h.n.y > -0.25 });
  b.cards(bloom, BLOSSOM, {
    size: 0.13,
    lean: 55,
    flow: [0, -0.3, -1],
    vary: 0.3,
    spin: 180,
    rng: rng(6),
    bone: root,
    sink: 0.3,
  });
  hang(
    [
      [-0.95, 1.5, -0.8],
      [-1.55, 1.6, -0.95],
      [-1.75, 1.73, -1.0],
      [-1.22, 1.66, -0.5],
    ],
    SHIDE,
    [0.05, 0.14],
  );
  // petals on the ground and in the air
  const petalFrames = Array.from({ length: 26 }, (_, i) => {
    const a = rand() * Math.PI * 2;
    const r = 0.2 + rand() * 1.5;
    const air = i > 17;
    return frame([-1.2 + Math.cos(a) * r, air ? 0.5 + rand() * 1.4 : BASE + 0.006, -0.7 + Math.sin(a) * r * 0.9], [0, 1, 0]);
  });
  b.cards(petalFrames, BLOSSOM, {
    size: 0.07,
    lean: 90,
    mirror: true,
    flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
    bone: root,
  });

  // ------------------------------------------------------------------------------------------------ rune circle & wisps
  glow(plane(0.9, 0.9, RUNE, 0, 0.1425 + 0.0, 0.92, [0, 1, 0], { up: [0, 0, -1] }), 1.2);
  for (const [x, y, z, r, col] of [
    [0.55, 1.5, 0.9, 0.05, "#b58cff"],
    [-0.6, 2.05, 0.3, 0.045, "#7fe3ff"],
    [0.95, 1.05, -0.1, 0.04, "#b58cff"],
    [-0.35, 1.25, 0.95, 0.04, "#7fe3ff"],
    [0.05, 2.9, 1.0, 0.05, "#b58cff"],
  ] as [number, number, number, number, string][]) {
    glow(put(new THREE.IcosahedronGeometry(r, 0), col, x, y, z, { flat: true }), 1.7);
    glow(b.spike([x, y + r * 0.6, z], [0, 1, 0], r * 3.2, r * 0.7, col, { bone: root, sides: 5 }), 1.5);
  }

  // ------------------------------------------------------------------------------------------------ grass, flowers
  const spots: Array<[number, number, number]> = [
    [1.0, 1.3, 0.35],
    [-1.0, 1.3, 0.35],
    [0.95, 0.6, 0.35],
    [-0.95, 0.6, 0.35],
    [1.7, 0.9, 0.3],
    [-1.7, 0.9, 0.3],
    [1.4, -0.1, 0.55],
    [1.4, -0.85, 0.4],
    [1.02, -1.02, 0.3],
    [1.35, 0.45, 0.4],
    [-1.45, 0.12, 0.6],
    [-1.4, -0.85, 0.3],
    [-0.62, 0.9, 0.25],
  ];
  const free = (x: number, z: number) => {
    if (Math.hypot(x, z) > 2.12) return false;
    if (Math.abs(x) < 0.45 && z > 0.3) return false;
    if (Math.abs(x) < 0.95 && z < 0.5 && z > -1.45) return false;
    return !spots.some(([cx, cz, r]) => Math.hypot(x - cx, z - cz) < r);
  };
  const tufts: V[] = [];
  const flowers: V[] = [];
  for (let i = 0; i < 400 && (tufts.length < 48 || flowers.length < 16); i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * 2.15;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    if (!free(x, z)) continue;
    if (tufts.length < 48 && (flowers.length >= 16 || rand() < 0.75)) tufts.push([x, BASE - 0.004, z]);
    else if (flowers.length < 16) flowers.push([x, BASE - 0.004, z]);
  }
  b.cards(
    tufts.map((p) => frame(p, [0, 1, 0])),
    GRASS_T,
    { size: [0.2, 0.2], vary: 0.35, spin: 180, rng: rng(21), cross: true, bone: root },
  );
  b.cards(
    flowers.map((p) => frame(p, [0, 1, 0])),
    FLOWER,
    { size: [0.07, 0.16], vary: 0.25, spin: 180, rng: rng(22), cross: true, bone: root },
  );
  // a few stones at the foot of the torii and lanterns
  for (const [x, z, r] of [
    [1.25, 1.55, 0.12],
    [-1.28, 1.5, 0.1],
    [0.7, -1.55, 0.14],
    [-0.5, -1.65, 0.1],
    [1.85, 0.2, 0.11],
  ])
    put(new THREE.IcosahedronGeometry(r, 0), STONE_M, x, BASE + r * 0.35, z, {
      flat: true,
      scale: [1, 0.7, 1],
      rot: [rand() * 30, rand() * 360, rand() * 30],
    });

  return b.root;
}
