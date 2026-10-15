import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain, mottle, noise, paint, stripes } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import type { SweepOptions } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Roadside Lantern Shrine",
  description:
    "A roadside shrine in cel-shaded Genshin style: red torii with shimenawa and shide, glowing stone lanterns, fox guardians, a small lacquered hall with bell and offering box, sake barrels, an offering table, an ema rack, a blossom tree and bamboo.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type Fill = string | Paint;
type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "lanternShrine", paintSize: 2048 });
  const root = b.joint("shrine", { at: [0, 0, 0] });
  const bell = b.joint("bell", { parent: root, at: [0, 1.2, -0.55], dir: [0, -1, 0], role: "hinge" });
  const doorL = b.joint("doorL", { parent: root, at: [0.55, 0.84, -0.97], dir: [0, 1, 0], role: "hinge" });
  const doorR = b.joint("doorR", { parent: root, at: [-0.55, 0.84, -0.97], dir: [0, 1, 0], role: "hinge" });

  const rand = rng(11);
  const G = 0.12;
  const zS = -1.4;

  // ---------------------------------------------------------------- helpers
  const O = (pts: Array<[number, number]>, k = 1): OutlinePoint[] =>
    pts.map(([x, y]): OutlinePoint => [x * k, y * k]);
  const box = (w: number, h: number, d: number, color: Fill, at: V, o: PartOptions = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, bone: root, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: Fill, at: V, o: PartOptions = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, bone: root, flat: seg < 12, ...o });
  const sph = (r: number, color: Fill, at: V, o: PartOptions = {}) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at, bone: root, ...o });
  const tor = (R: number, r: number, color: Fill, at: V, o: PartOptions = {}) =>
    b.part(new THREE.TorusGeometry(R, r, 4, 10), color, { at, bone: root, rotation: [90, 0, 0], ...o });
  const lat = (
    pts: Array<[number, number]>,
    k: number,
    at: V,
    color: Fill,
    seg: number,
    o: { spin?: number; bone?: typeof root } = {},
  ) => b.lathe(O(pts, k), { at, segments: seg, color, bone: root, ...o });
  const rd = (a: V, c: V, r: number | [number, number], color: Fill, o: SweepOptions = {}) =>
    b.rod(a, c, r, color, { bone: root, ...o });
  const plane = (w: number, h: number, tex: THREE.Texture, at: V, dir: V, o: PartOptions = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, bone: root, ...o });

  // ---------------------------------------------------------------- palette
  const LACQ = cel("#e0394a", "#9b2a5e");
  const LACQ2 = cel("#c42f44", "#7d2457");
  const GOLD = cel("#ffd96a", "#e29a38");
  const BLACK = cel("#2c2335", "#1a1426");
  const DARK = cel("#4a3552", "#2b2038");
  const PAPER = cel("#fff8e8", "#e3d9ff");
  const PLASTER = cel("#f7ead0", "#d9c4d8");
  const CELADON = cel("#e6f4ee", "#bcd6e2");
  const stone = (seed: number) =>
    cel(
      paint((p, n) =>
        n.y > 0.6 && noise(p, 0.14, seed) > 0.56 ? "#7fc36b" : noise(p, 0.2, seed + 1) > 0.5 ? "#d3cec1" : "#bfbbb0",
      ),
    );
  const STONE = stone(1);
  const MOSSROCK = cel(
    paint((p, n) => (n.y > 0.4 && noise(p, 0.2, 7) > 0.45 ? "#76bb66" : noise(p, 0.15, 8) > 0.5 ? "#a3a89d" : "#8d9490")),
  );
  const WOOD = cel(grain("#9a6240", "#7a4a35", { size: 0.025, axis: "y" }));
  const WOODH = cel(grain("#9a6240", "#7a4a35", { size: 0.025, axis: "x" }));
  const BARK = cel(grain("#7a5a4a", "#5f4540", { size: 0.03, axis: "y" }));
  const STRAW = cel(stripes("#e8c872", "#c89a48", { size: 0.05, axis: "y", width: 0.4 }));
  const ROPE = cel(
    paint((_p, _n, s) => (((((s[1] - 1800 * s[0]) % 90) + 90) % 90 < 40 ? "#f3e3b0" : "#c9a560") as string)),
  );
  const GROUND = cel(
    paint((p, n) => (n.y > 0.5 ? (noise(p, 0.5, 5) > 0.5 ? "#86d572" : "#6cc46a") : "#8a6a52")),
  );
  const GRAVEL = cel(mottle("#efe6cc", "#d9cfb2", { size: 0.12, contrast: 2 }));
  const BLOSSOM = cel(mottle("#ffb9d0", "#ff9fc0", { size: 0.3 }), "#d27aac");
  const BAMBOO = cel(
    paint((p) => (((p.y - G) / 0.38) % 1 < 0.08 ? "#2f7a3a" : "#5fb85a")),
    "#3e9a64",
  );
  const roofPaint = paint((_p, _n, s) => {
    const a = ((s[1] % 15) + 15) % 15;
    return a < 1.6 ? "#3d2f78" : a > 13.4 ? "#8a6fd0" : "#6a4fb4";
  });
  const ROOF = cel(roofPaint);
  const AMBER = "#ffc65a";
  const VIOLET = "#c08bff";
  const ORANGE = "#ff9a3c";
  const APPLE = "#e8443c";

  // ---------------------------------------------------------------- textures
  const diamonds = (w: number, h: number, step: number, color: string, sw: number) => {
    let d = "";
    for (let i = -h; i <= w + h; i += step) d += `M${i} 0L${i + h} ${h}M${i} 0L${i - h} ${h}`;
    return `<path d="${d}" stroke="${color}" stroke-width="${sw}" fill="none"/>`;
  };
  const DOOR_T = svg(
    `<svg viewBox="0 0 60 80"><defs><clipPath id="c"><rect x="4" y="4" width="52" height="72"/></clipPath></defs>
    <rect width="60" height="80" fill="#7a1e3a"/>
    <g clip-path="url(#c)">${diamonds(60, 80, 10, "#f0b94d", 1.1)}</g>
    <rect x="2" y="2" width="56" height="76" fill="none" stroke="#ffd96a" stroke-width="2.2"/>
    <circle cx="30" cy="40" r="10" fill="#4b1740" stroke="#ffd96a" stroke-width="2"/>
    <circle cx="30" cy="40" r="4.5" fill="#c08bff"/>
    <path d="M30 27 L33 33 M30 53 L27 47 M17 40 L23 37 M43 40 L37 43" stroke="#ffd96a" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const WINDOW_T = svg(
    `<svg viewBox="0 0 50 40"><defs><clipPath id="w"><rect x="3" y="3" width="44" height="34"/></clipPath></defs>
    <rect width="50" height="40" fill="#ffd68a"/>
    <g clip-path="url(#w)">${diamonds(50, 40, 8, "#7a3a2a", 1.4)}</g>
    <rect x="1.5" y="1.5" width="47" height="37" fill="none" stroke="#c4333f" stroke-width="3"/></svg>`,
    { size: 192 },
  );
  const GAKU_T = svg(
    `<svg viewBox="0 0 36 50"><rect width="36" height="50" fill="#2a1f3a"/>
    <rect x="1.5" y="1.5" width="33" height="47" fill="none" stroke="#ffd96a" stroke-width="2"/>
    <circle cx="18" cy="25" r="13" fill="none" stroke="#c08bff" stroke-width="1.8"/>
    <path d="M20 9 L11 28 H18 L14 42 L27 22 H20 L25 9Z" fill="#ffd96a"/></svg>`,
    { size: 192 },
  );
  const SIGIL_T = svg(
    `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="none" stroke="#ffd96a" stroke-width="2.2"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="#c08bff" stroke-width="1.8"/>
    <circle cx="50" cy="50" r="22" fill="none" stroke="#ffd96a" stroke-width="2"/>
    <path d="M50 8 L56 36 L84 30 L62 50 L84 70 L56 64 L50 92 L44 64 L16 70 L38 50 L16 30 L44 36Z" fill="none" stroke="#c08bff" stroke-width="2"/>
    <circle cx="50" cy="50" r="7" fill="#ffd96a"/>
    <circle cx="50" cy="12" r="3" fill="#ffd96a"/><circle cx="50" cy="88" r="3" fill="#ffd96a"/>
    <circle cx="12" cy="50" r="3" fill="#ffd96a"/><circle cx="88" cy="50" r="3" fill="#ffd96a"/>
    </svg>`,
    { size: 384 },
  );
  const BAND_T = (() => {
    let s = "";
    for (let i = 0; i < 12; i++) {
      const x = 10 + i * 20;
      s += `<circle cx="${x}" cy="8" r="4" fill="none" stroke="#ffd96a" stroke-width="1.6"/>`;
      s += `<path d="M${x + 6} 8 L${x + 10} 3 L${x + 14} 8 L${x + 10} 13Z" fill="#ffd96a"/>`;
      s += `<path d="M${x - 4} 8 Q${x - 7} 2 ${x - 10} 8" fill="none" stroke="#ffd96a" stroke-width="1.4"/>`;
    }
    return svg(`<svg viewBox="0 0 240 16">${s}</svg>`, { size: 1024 });
  })();
  const LABEL_T = svg(
    `<svg viewBox="0 0 30 40"><rect width="30" height="40" fill="#fff6e2"/>
    <rect x="1.5" y="1.5" width="27" height="37" fill="none" stroke="#c4333f" stroke-width="2"/>
    <circle cx="15" cy="15" r="7" fill="#c4333f"/><path d="M9 28H21M9 33H21" stroke="#2a1f3a" stroke-width="2.4"/></svg>`,
    { size: 128 },
  );
  const BOTTLE_T = svg(
    `<svg viewBox="0 0 20 30"><rect width="20" height="30" fill="#f4f1e6"/>
    <rect x="2" y="2" width="16" height="26" fill="#4a6fc8"/><circle cx="10" cy="11" r="4" fill="#fff6e2"/></svg>`,
    { size: 96 },
  );
  const emaSvg = (inner: string) =>
    svg(
      `<svg viewBox="0 0 16 13"><path d="M0 13H16V5L8 0L0 5Z" fill="#e9c99a"/>
      <path d="M0.5 12.5H15.5V5.2L8 0.6L0.5 5.2Z" fill="none" stroke="#b5483a" stroke-width="0.6"/>${inner}</svg>`,
      { size: 160 },
    );
  const EMAS = [
    emaSvg(
      `<path d="M4 10.5 L4 6 L6 7.5 H10 L12 6 V10.5 L8 12Z" fill="#f08a3c"/><path d="M6 9.5 L8 11.2 L10 9.5 L8 8.5Z" fill="#fff"/><circle cx="6.4" cy="8.6" r="0.55" fill="#2a1830"/><circle cx="9.6" cy="8.6" r="0.55" fill="#2a1830"/>`,
    ),
    emaSvg(
      `<circle cx="8" cy="8" r="3.6" fill="#ffe27a"/><circle cx="9.4" cy="7.2" r="3.2" fill="#e9c99a"/><path d="M12 10.4 l0.5 -1.4 l0.5 1.4 l1.4 0.5 l-1.4 0.5 l-0.5 1.4 l-0.5 -1.4 l-1.4 -0.5Z" fill="#7a56c8"/>`,
    ),
    emaSvg(
      `<g fill="#ff9fc0"><circle cx="8" cy="6" r="2"/><circle cx="10.4" cy="8" r="2"/><circle cx="9.4" cy="10.4" r="2"/><circle cx="6.6" cy="10.4" r="2"/><circle cx="5.6" cy="8" r="2"/></g><circle cx="8" cy="8.6" r="1.1" fill="#ffd96a"/>`,
    ),
    emaSvg(
      `<path d="M9.5 3.5 L5 8.8 H8 L6.5 12 L11.5 6.6 H8.6 L10 3.5Z" fill="#9a6af0" stroke="#4b2a90" stroke-width="0.4"/>`,
    ),
  ];
  const GRASS_T = svg(
    `<svg viewBox="0 0 32 64"><path d="M6 64 Q8 30 2 6 Q14 28 14 64Z" fill="#58b85f"/>
    <path d="M12 64 Q14 26 16 0 Q22 30 21 64Z" fill="#7bd46a"/><path d="M19 64 Q22 34 30 12 Q28 40 27 64Z" fill="#4aa857"/>
    <path d="M12 64 Q14 26 16 0 Q15.5 36 14 64Z" fill="#a6e88a"/></svg>`,
    { size: 128 },
  );
  const FLOWER_T = svg(
    `<svg viewBox="0 0 24 40"><rect x="11" y="14" width="2.4" height="26" fill="#4aa857"/>
    <g fill="#fff5fa"><circle cx="12" cy="5" r="4"/><circle cx="16.5" cy="8.5" r="4"/><circle cx="14.8" cy="13.5" r="4"/><circle cx="9.2" cy="13.5" r="4"/><circle cx="7.5" cy="8.5" r="4"/></g>
    <circle cx="12" cy="10" r="3" fill="#ffcf4a"/></svg>`,
    { size: 96 },
  );
  const PETAL_T = svg(
    `<svg viewBox="0 0 16 16"><path d="M8 15 Q0 8 3 1 Q8 3 8 6 Q8 3 13 1 Q16 8 8 15Z" fill="#ffc2d6"/>
    <path d="M8 15 Q6 9 8 6 Q10 9 8 15Z" fill="#ff8fb4"/></svg>`,
    { size: 64 },
  );
  const LEAF_T = svg(
    `<svg viewBox="0 0 16 64"><path d="M8 64 Q0 32 8 0 Q16 32 8 64Z" fill="#69c46a"/>
    <path d="M8 64 L8 6" stroke="#a9e58a" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  const SHIDE_T = svg(
    `<svg viewBox="0 0 24 64"><path d="M2 0 H22 L14 16 L22 32 L14 48 L22 64 H2 L10 48 L2 32 L10 16Z" fill="#fffaf0" stroke="#cdbbee" stroke-width="1.2"/>
    <path d="M12 2 L12 62" stroke="#e3d8f5" stroke-width="1"/></svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------- small assemblies
  const tassel = (p: V, len = 0.14) => {
    sph(0.022, GOLD, p);
    b.spike([p[0], p[1] - 0.01, p[2]], [0, -1, 0], len, 0.024, LACQ, { bone: root, sides: 6 });
    tor(0.02, 0.006, GOLD, [p[0], p[1] - 0.03, p[2]]);
  };
  const shideRow = (path: { at: (t: number) => THREE.Vector3 }, ts: number[], size: [number, number] = [0.11, 0.3]) => {
    b.cards(
      ts.map((t) => frame(path.at(t), [0, 1, 0])),
      SHIDE_T,
      { size, lean: 180, flow: [0, 0, 1], bone: root },
    );
  };

  // ---------------------------------------------------------------- ground
  cyl(3.05, 3.15, G, 14, GROUND, [0, G / 2, 0]);
  box(1.3, 0.02, 3.3, GRAVEL, [0, G + 0.01 - 0.0, 1.35]);
  for (let i = 0; i < 14; i++) {
    const a = ((i + rand() * 0.4) / 14) * Math.PI * 2;
    const x = Math.sin(a) * 3.0;
    const z = Math.cos(a) * 3.0;
    if (z > 2.2 && Math.abs(x) < 1.0) continue;
    const r = 0.14 + rand() * 0.14;
    b.part(new THREE.IcosahedronGeometry(r, 0), MOSSROCK, {
      at: [x, G + r * 0.35, z],
      bone: root,
      scale: [1, 0.7, 1.1],
      rotation: [rand() * 90, rand() * 360, 0],
      flat: true,
    });
  }
  for (const z of [1.15, 1.47, 1.79, 2.11, 2.43, 2.75]) {
    box(0.62, 0.05, 0.3, STONE, [(rand() - 0.5) * 0.06, 0.15, z], { rotation: [0, (rand() - 0.5) * 6, 0] });
  }
  b.part(new THREE.PlaneGeometry(1, 1), "#ffffff", {
    at: [0, 0.134, 0.6],
    dir: [0, 1, 0],
    axis: "z",
    texture: SIGIL_T,
    bone: root,
    scale: [1.0, 1.0, 1],
  });
  const sigil = b.part(new THREE.PlaneGeometry(1.0, 1.0), "#ffffff", {
    at: [0, 0.137, 0.6],
    dir: [0, 1, 0],
    axis: "z",
    texture: SIGIL_T,
    bone: root,
  });
  glow(sigil, 1.2);

  // ---------------------------------------------------------------- platform and steps
  box(2.4, 0.06, 2.0, STONE, [0, G + 0.03, zS]);
  box(2.3, 0.25, 1.9, STONE, [0, G + 0.125, zS]);
  box(2.34, 0.04, 1.94, PAPER, [0, G + 0.27, zS]);
  box(1.4, 0.17, 0.26, STONE, [0, G + 0.085, -0.31]);
  box(1.3, 0.08, 0.24, STONE, [0, G + 0.04, -0.07]);
  box(1.42, 0.02, 0.28, PAPER, [0, G + 0.178, -0.31]);

  // ---------------------------------------------------------------- shrine hall
  const PT = 0.37; // platform top
  box(1.3, 0.08, 1.1, STONE, [0, PT + 0.04, zS]);
  box(1.1, 0.85, 0.85, PLASTER, [0, 0.875, zS]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      cyl(0.05, 0.05, 0.86, 8, LACQ, [sx * 0.57, 0.88, zS + sz * 0.45]);
      box(0.08, 0.05, 0.08, GOLD, [sx * 0.57, 1.32, zS + sz * 0.45]);
      box(0.1, 0.03, 0.1, GOLD, [sx * 0.57, PT + 0.095, zS + sz * 0.45]);
    }
  box(1.5, 0.06, 1.3, DARK, [0, 1.31, zS]);
  box(1.1, 0.07, 0.04, LACQ2, [0, 1.255, -0.97]);
  for (let i = -4; i <= 4; i++) sph(0.014, GOLD, [i * 0.12, 1.255, -0.945]);
  for (const s of [1, -1]) {
    const j = s > 0 ? doorL : doorR;
    box(0.54, 0.78, 0.04, LACQ2, [s * 0.28, 0.84, -0.97], { bone: j });
    plane(0.5, 0.67, DOOR_T, [s * 0.28, 0.84, -0.948], [0, 0, 1], { bone: j });
    box(0.03, 0.14, 0.02, GOLD, [s * 0.06, 0.84, -0.93], { bone: j });
    box(0.54, 0.02, 0.045, GOLD, [s * 0.28, 0.465, -0.97], { bone: j });
    box(0.54, 0.02, 0.045, GOLD, [s * 0.28, 1.215, -0.97], { bone: j });
    const win = plane(0.5, 0.4, WINDOW_T, [s * 0.556, 0.95, zS], [s, 0, 0]);
    glow(win, 0.8);
  }
  box(1.1, 0.05, 0.06, DARK, [0, 0.47, -0.97]);
  const back = plane(0.44, 0.44, SIGIL_T, [0, 0.95, -1.83], [0, 0, -1]);
  glow(back, 1);
  // gem above doors
  glow(b.part(new THREE.OctahedronGeometry(0.05, 0), VIOLET, { at: [0, 1.255, -0.935], bone: root, scale: [0.8, 1.2, 0.5] }), 1.5);

  // roof
  const roofProfile: Array<[number, number]> = [
    [0, 0],
    [1.34, 0],
    [1.45, 0.08],
    [1.0, 0.16],
    [0.6, 0.3],
    [0.3, 0.5],
    [0, 0.68],
  ];
  lat(roofProfile, 1, [0, 1.34, zS], ROOF, 4, { spin: 45 });
  const ridgeProfile: Array<[number, number]> = [
    [1.45, 0.08],
    [1.0, 0.16],
    [0.6, 0.3],
    [0.3, 0.5],
    [0.02, 0.68],
  ];
  const q = Math.SQRT1_2;
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.sweep(
        catmull(ridgeProfile.map(([r, h]) => [sx * r * q, 1.34 + h + 0.016, zS + sz * r * q])),
        [0.03, 0.02],
        { color: GOLD, bone: root, sides: 6 },
      );
      sph(0.035, GOLD, [sx * 1.025, 1.43, zS + sz * 1.025]);
      rd([sx * 0.6, 1.3, zS + sz * 0.52], [sx * 0.98, 1.36, zS + sz * 0.98], 0.022, DARK, { sides: 6 });
      rd([sx * 1.025, 1.4, zS + sz * 1.025], [sx * 1.025, 1.3, zS + sz * 1.025], 0.004, INK, { sides: 4 });
      sph(0.026, GOLD, [sx * 1.025, 1.27, zS + sz * 1.025]);
      b.spike([sx * 1.025, 1.25, zS + sz * 1.025], [0, -1, 0], 0.1, 0.014, PAPER, { bone: root, sides: 4 });
    }
  lat(
    [
      [0, 0],
      [0.07, 0],
      [0.09, 0.06],
      [0.05, 0.14],
      [0.03, 0.2],
      [0, 0.28],
    ],
    1,
    [0, 2.0, zS],
    GOLD,
    8,
  );
  tor(0.075, 0.012, GOLD, [0, 2.01, zS]);

  // porch with bell
  for (const s of [1, -1]) {
    cyl(0.05, 0.055, 0.97, 8, LACQ, [s * 0.55, 0.855, -0.55]);
    box(0.12, 0.04, 0.12, GOLD, [s * 0.55, PT + 0.02, -0.55]);
    tor(0.06, 0.012, GOLD, [s * 0.55, 1.3, -0.55]);
  }
  box(1.3, 0.08, 0.08, LACQ, [0, 1.26, -0.55]);
  plane(1.2, 0.08, BAND_T, [0, 1.26, -0.508], [0, 0, 1]);
  rd([0, 1.26, -0.55], [0, 1.2, -0.55], 0.012, GOLD, { sides: 6, bone: bell });
  tor(0.03, 0.01, GOLD, [0, 1.19, -0.55], { bone: bell, rotation: [0, 0, 0] });
  b.part(new THREE.SphereGeometry(0.085, 10, 7), GOLD, { at: [0, 1.07, -0.55], bone: bell });
  box(0.13, 0.012, 0.02, INK, [0, 1.055, -0.468], { bone: bell });
  box(0.02, 0.03, 0.02, GOLD, [0, 0.985, -0.55], { bone: bell });
  b.sweep(
    [
      [0, 1.0, -0.52],
      [0, 0.8, -0.5],
      [0, 0.6, -0.45],
    ],
    0.028,
    { color: ROPE, bone: bell, sides: 7 },
  );
  b.spike([0, 0.62, -0.45], [0, -1, 0], 0.1, 0.03, LACQ, { bone: bell, sides: 6 });
  sph(0.025, GOLD, [0, 0.64, -0.45], { bone: bell });

  // railing
  for (const sx of [1, -1]) {
    for (const z of [-0.55, -2.2]) {
      cyl(0.035, 0.035, 0.45, 6, LACQ, [sx * 1.05, PT + 0.225, z]);
      sph(0.05, GOLD, [sx * 1.05, PT + 0.48, z]);
    }
    rd([sx * 1.05, PT + 0.38, -0.55], [sx * 1.05, PT + 0.38, -2.2], 0.025, LACQ, { sides: 6 });
    rd([sx * 1.05, PT + 0.2, -0.55], [sx * 1.05, PT + 0.2, -2.2], 0.02, LACQ, { sides: 6 });
    rd([sx * 1.05, PT + 0.38, -0.55], [sx * 0.8, PT + 0.38, -0.55], 0.025, LACQ, { sides: 6 });
  }
  rd([1.05, PT + 0.38, -2.2], [-1.05, PT + 0.38, -2.2], 0.025, LACQ, { sides: 6 });

  // offering box
  box(0.9, 0.2, 0.3, WOOD, [0, PT + 0.1, -0.79]);
  box(0.94, 0.025, 0.34, GOLD, [0, PT + 0.205, -0.79]);
  for (let i = -5; i <= 5; i++) rd([i * 0.075, PT + 0.22, -0.93], [i * 0.075, PT + 0.22, -0.65], 0.008, DARK, { sides: 4 });
  box(0.9, 0.02, 0.02, GOLD, [0, PT + 0.1, -0.635]);
  for (const x of [-0.3, -0.1, 0.12, 0.28]) cyl(0.022, 0.022, 0.006, 8, GOLD, [x, PT + 0.222, -0.7 + (x % 0.2)]);
  for (const x of [-0.39, 0.39]) {
    box(0.04, 0.2, 0.04, DARK, [x, PT + 0.1, -0.64]);
  }

  // sake barrels
  const k = 0.85;
  for (const s of [1, -1]) {
    const bx = s * 0.82;
    const bz = -0.78;
    lat(
      [
        [0, 0],
        [0.17, 0],
        [0.2, 0.1],
        [0.21, 0.2],
        [0.2, 0.3],
        [0.17, 0.4],
        [0, 0.4],
      ],
      k,
      [bx, PT, bz],
      STRAW,
      10,
    );
    tor(0.2 * k + 0.008, 0.012, LACQ, [bx, PT + 0.1 * k, bz]);
    tor(0.2 * k + 0.008, 0.012, LACQ, [bx, PT + 0.3 * k, bz]);
    cyl(0.16 * k, 0.16 * k, 0.02, 10, WOOD, [bx, PT + 0.4 * k + 0.005, bz]);
    plane(0.13, 0.17, LABEL_T, [bx, PT + 0.2 * k, bz + 0.21 * k + 0.012], [0, 0, 1]);
  }

  // ---------------------------------------------------------------- torii
  const TZ = 1.9;
  const TX = 1.15;
  for (const s of [1, -1]) {
    lat(
      [
        [0, 0],
        [0.19, 0],
        [0.19, 0.25],
        [0.15, 0.34],
        [0, 0.34],
      ],
      1,
      [s * TX, G, TZ],
      BLACK,
      8,
    );
    rd([s * TX, G + 0.3, TZ], [s * TX, 2.62, TZ], [0.125, 0.105], LACQ, { sides: 10 });
    tor(0.135, 0.014, GOLD, [s * TX, G + 0.4, TZ]);
    tor(0.115, 0.014, GOLD, [s * TX, 2.5, TZ]);
    tor(0.12, 0.014, GOLD, [s * TX, 2.2, TZ]);
    box(0.06, 0.2, 0.24, GOLD, [s * 1.3, 2.28, TZ]);
    // paper lantern hung from the kasagi
    const lx = s * 1.5;
    rd([lx, 2.8, TZ], [lx, 2.65, TZ], 0.008, INK, { sides: 4 });
    cyl(0.055, 0.055, 0.03, 8, BLACK, [lx, 2.635, TZ]);
    const chochin = lat(
      [
        [0, 0],
        [0.06, 0],
        [0.12, 0.08],
        [0.13, 0.15],
        [0.12, 0.22],
        [0.06, 0.3],
        [0, 0.3],
      ],
      1,
      [lx, 2.35, TZ],
      "#ff7a4a",
      10,
    );
    glow(chochin, 1.3);
    for (const [h, r] of [
      [0.08, 0.12],
      [0.15, 0.13],
      [0.22, 0.12],
    ])
      tor(r + 0.004, 0.007, "#8e1f3a", [lx, 2.35 + h, TZ]);
    cyl(0.055, 0.055, 0.03, 8, BLACK, [lx, 2.335, TZ]);
    tassel([lx, 2.32, TZ], 0.16);
  }
  rd([-1.3, 2.28, TZ], [1.3, 2.28, TZ], 0.07, LACQ, { section: "box", caps: "flat", up: [0, 1, 0] });
  b.sweep(
    catmull([
      [-1.85, 2.93, TZ],
      [-1.15, 2.78, TZ],
      [0, 2.74, TZ],
      [1.15, 2.78, TZ],
      [1.85, 2.93, TZ],
    ]),
    () => [0.12, 0.06],
    { color: LACQ, bone: root, section: "box", caps: "flat" },
  );
  b.sweep(
    catmull([
      [-1.9, 3.01, TZ],
      [-1.15, 2.865, TZ],
      [0, 2.825, TZ],
      [1.15, 2.865, TZ],
      [1.9, 3.01, TZ],
    ]),
    () => [0.135, 0.035],
    { color: BLACK, bone: root, section: "box", caps: "flat" },
  );
  for (const s of [1, -1]) box(0.05, 0.14, 0.26, GOLD, [s * 1.84, 2.95, TZ], { rotation: [0, 0, s * 18] });
  box(0.12, 0.34, 0.1, LACQ, [0, 2.5, TZ]);
  box(0.32, 0.44, 0.07, DARK, [0, 2.52, TZ]);
  plane(0.3, 0.42, GAKU_T, [0, 2.52, TZ + 0.037], [0, 0, 1]);
  plane(0.3, 0.42, GAKU_T, [0, 2.52, TZ - 0.037], [0, 0, -1]);
  plane(2.3, 0.1, BAND_T, [0, 2.28, TZ + 0.072], [0, 0, 1]);
  plane(2.3, 0.1, BAND_T, [0, 2.28, TZ - 0.072], [0, 0, -1]);
  const toriiRope = catmull([
    [-1.03, 2.18, TZ],
    [-0.5, 2.06, TZ],
    [0, 2.02, TZ],
    [0.5, 2.06, TZ],
    [1.03, 2.18, TZ],
  ]);
  b.sweep(toriiRope, 0.04, { color: ROPE, bone: root, sides: 7 });
  shideRow(toriiRope, [0.12, 0.27, 0.42, 0.58, 0.73, 0.88]);
  tassel([-1.03, 2.16, TZ + 0.02]);
  tassel([1.03, 2.16, TZ + 0.02]);

  // ---------------------------------------------------------------- stone lanterns
  const lantern = (x: number, z: number) => {
    const y0 = G;
    lat(
      [
        [0, 0],
        [0.3, 0],
        [0.3, 0.06],
        [0.24, 0.1],
        [0.2, 0.12],
        [0, 0.12],
      ],
      1,
      [x, y0, z],
      STONE,
      6,
    );
    lat(
      [
        [0, 0],
        [0.1, 0],
        [0.095, 0.06],
        [0.115, 0.2],
        [0.1, 0.32],
        [0.1, 0.4],
        [0, 0.4],
      ],
      1,
      [x, y0 + 0.12, z],
      STONE,
      6,
    );
    tor(0.13, 0.014, GOLD, [x, y0 + 0.32, z]);
    lat(
      [
        [0, 0],
        [0.17, 0],
        [0.27, 0.03],
        [0.27, 0.07],
        [0.2, 0.1],
        [0, 0.1],
      ],
      1,
      [x, y0 + 0.52, z],
      STONE,
      6,
    );
    box(0.34, 0.03, 0.34, STONE, [x, y0 + 0.635, z]);
    box(0.36, 0.04, 0.36, STONE, [x, y0 + 0.88, z]);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) box(0.04, 0.2, 0.04, STONE, [x + sx * 0.13, y0 + 0.75, z + sz * 0.13]);
    glow(box(0.2, 0.2, 0.2, AMBER, [x, y0 + 0.75, z]), 1.6);
    for (const s of [1, -1]) {
      box(0.014, 0.2, 0.01, DARK, [x, y0 + 0.75, z + s * 0.102]);
      box(0.01, 0.2, 0.014, DARK, [x + s * 0.102, y0 + 0.75, z]);
    }
    lat(
      [
        [0, 0],
        [0.38, 0],
        [0.5, 0.08],
        [0.3, 0.12],
        [0.16, 0.2],
        [0.08, 0.3],
        [0, 0.32],
      ],
      1,
      [x, y0 + 0.9, z],
      STONE,
      6,
    );
    tor(0.4, 0.01, GOLD, [x, y0 + 0.91, z]);
    lat(
      [
        [0, 0],
        [0.05, 0],
        [0.065, 0.04],
        [0.035, 0.09],
        [0, 0.14],
      ],
      1,
      [x, y0 + 1.2, z],
      GOLD,
      8,
    );
    b.part(new THREE.OctahedronGeometry(0.035, 0), VIOLET, { at: [x, y0 + 1.4, z], bone: root, scale: [0.7, 1.3, 0.7] }).mesh;
  };
  lantern(1.05, 0.75);
  lantern(-1.05, 0.75);
  for (const s of [1, -1]) glow(sph(0.032, VIOLET, [s * 1.05, G + 1.4, 0.75], { scale: [0.7, 1.3, 0.7] }), 1.6);

  // ---------------------------------------------------------------- fox guardians
  const fox = (x: number, z: number) => {
    box(0.42, 0.3, 0.42, STONE, [x, G + 0.15, z]);
    box(0.46, 0.04, 0.46, PAPER, [x, G + 0.32, z]);
    const T = G + 0.34;
    sph(0.11, STONE, [x, T + 0.12, z - 0.1], { scale: [1, 1.1, 1.25] });
    b.capsule([x, T + 0.14, z - 0.06], [x, T + 0.36, z + 0.05], [0.1, 0.08], STONE, { bone: root, sides: 8 });
    sph(0.085, STONE, [x, T + 0.46, z + 0.07], { scale: [1, 0.95, 1.05] });
    b.spike([x, T + 0.44, z + 0.13], [0, -0.1, 1], 0.12, 0.045, STONE, { bone: root, sides: 6 });
    sph(0.016, INK, [x, T + 0.43, z + 0.25]);
    for (const sx of [1, -1]) {
      b.spike([x + sx * 0.05, T + 0.52, z + 0.05], [sx * 0.25, 1, -0.35], 0.15, 0.04, STONE, { bone: root, sides: 6 });
      b.spike([x + sx * 0.05, T + 0.525, z + 0.062], [sx * 0.25, 1, -0.35], 0.1, 0.022, "#e9a2b4", { bone: root, sides: 5 });
      box(0.045, 0.01, 0.01, INK, [x + sx * 0.042, T + 0.485, z + 0.145], { rotation: [0, 0, -sx * 15] });
      b.spike([x + sx * 0.075, T + 0.44, z + 0.07], [sx, -0.2, 0.1], 0.07, 0.03, STONE, { bone: root, sides: 5 });
      rd([x + sx * 0.05, T + 0.3, z + 0.06], [x + sx * 0.05, T + 0.02, z + 0.12], 0.028, STONE, { sides: 6 });
      box(0.06, 0.035, 0.09, STONE, [x + sx * 0.05, T + 0.018, z + 0.14]);
      sph(0.06, STONE, [x + sx * 0.1, T + 0.07, z - 0.08]);
      box(0.07, 0.03, 0.12, STONE, [x + sx * 0.1, T + 0.015, z - 0.03]);
    }
    b.sweep(
      catmull([
        [x, T + 0.08, z - 0.2],
        [x, T + 0.03, z - 0.36],
        [x, T + 0.15, z - 0.48],
        [x, T + 0.38, z - 0.46],
      ]),
      [0.04, 0.075, 0.07, 0.015],
      { color: PAPER, bands: [[0.8, STONE]], bone: root, sides: 7 },
    );
    tor(0.085, 0.02, LACQ, [x, T + 0.38, z + 0.03], { rotation: [80, 0, 0] });
    sph(0.022, GOLD, [x, T + 0.33, z + 0.115]);
    b.extrude(
      [
        [-0.05, 0],
        [0.05, 0],
        [0, -0.09],
      ],
      { at: [x, T + 0.38, z + 0.118], x: [1, 0, 0], thickness: 0.012, color: LACQ, bone: root },
    );
  };
  fox(0.95, 0.0);
  fox(-0.95, 0.0);

  // ---------------------------------------------------------------- offering table
  const tx = -1.65;
  const tz = 0.25;
  const TY = G + 0.36;
  box(0.8, 0.04, 0.5, WOODH, [tx, G + 0.34, tz]);
  box(0.78, 0.03, 0.06, GOLD, [tx, G + 0.3, tz + 0.2]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.05, 0.32, 0.05, WOOD, [tx + sx * 0.35, G + 0.16, tz + sz * 0.2]);
  box(0.66, 0.006, 0.4, PAPER, [tx, TY + 0.003, tz]);
  box(0.66, 0.008, 0.02, LACQ, [tx, TY + 0.004, tz + 0.19]);
  // kagami mochi
  box(0.2, 0.04, 0.2, WOOD, [tx - 0.22, TY + 0.026, tz]);
  cyl(0.085, 0.095, 0.045, 10, PAPER, [tx - 0.22, TY + 0.068, tz]);
  cyl(0.06, 0.07, 0.04, 10, PAPER, [tx - 0.22, TY + 0.11, tz]);
  sph(0.035, ORANGE, [tx - 0.22, TY + 0.15, tz]);
  b.spike([tx - 0.22, TY + 0.175, tz], [0.3, 1, 0], 0.04, 0.012, "#4f9a4a", { bone: root, sides: 4 });
  // bottles and cups
  for (const [dx, dz] of [
    [0.0, -0.1],
    [0.1, -0.12],
  ]) {
    lat(
      [
        [0, 0],
        [0.045, 0],
        [0.05, 0.04],
        [0.045, 0.1],
        [0.02, 0.14],
        [0.02, 0.18],
        [0.028, 0.2],
        [0, 0.2],
      ],
      1,
      [tx + dx, TY, tz + dz],
      CELADON,
      8,
    );
    plane(0.05, 0.075, BOTTLE_T, [tx + dx, TY + 0.065, tz + dz + 0.052], [0, 0, 1]);
  }
  for (const dx of [-0.04, 0.0]) {
    lat(
      [
        [0, 0],
        [0.025, 0],
        [0.045, 0.035],
        [0, 0.025],
      ],
      1,
      [tx + dx + 0.05, TY, tz + 0.08],
      LACQ,
      8,
    );
  }
  // apples in a bowl
  lat(
    [
      [0, 0],
      [0.07, 0],
      [0.13, 0.06],
      [0.125, 0.065],
      [0.065, 0.02],
      [0, 0.02],
    ],
    1,
    [tx + 0.2, TY, tz + 0.08],
    WOOD,
    10,
  );
  for (const [dx, dz, dy] of [
    [-0.04, -0.02, 0.07],
    [0.04, -0.01, 0.07],
    [0.0, 0.04, 0.07],
    [0.0, 0.0, 0.11],
  ]) {
    sph(0.045, APPLE, [tx + 0.2 + dx, TY + dy, tz + 0.08 + dz]);
    rd([tx + 0.2 + dx, TY + dy + 0.04, tz + 0.08 + dz], [tx + 0.2 + dx, TY + dy + 0.065, tz + 0.08 + dz], 0.004, "#5b3a2a", { sides: 4 });
  }
  // dango skewer
  rd([tx + 0.26, TY + 0.02, tz - 0.12], [tx + 0.29, TY + 0.28, tz - 0.12], 0.005, WOOD, { sides: 4 });
  cyl(0.035, 0.03, 0.04, 8, DARK, [tx + 0.26, TY + 0.02, tz - 0.12]);
  [
    ["#f4a4c0", 0.11],
    ["#fff6e8", 0.17],
    ["#9bd47a", 0.23],
  ].forEach(([c, h]) => sph(0.03, c as string, [tx + 0.26 + ((h as number) - 0.02) * 0.12, TY + (h as number), tz - 0.12]));
  // onigiri
  for (const dx of [-0.08, 0.0]) {
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 3), PAPER, {
      at: [tx + dx, TY + 0.025, tz + 0.15],
      bone: root,
      rotation: [0, 30 + dx * 100, 0],
      flat: true,
    });
    box(0.05, 0.02, 0.012, INK, [tx + dx, TY + 0.012, tz + 0.18]);
  }
  // candle
  cyl(0.015, 0.015, 0.09, 8, PAPER, [tx - 0.3, TY + 0.045, tz + 0.12]);
  glow(sph(0.014, AMBER, [tx - 0.3, TY + 0.1, tz + 0.12], { scale: [1, 1.5, 1] }), 2);

  // ---------------------------------------------------------------- ema rack
  const rx = 1.8;
  const rz = 0.35;
  const rTop = 1.5;
  for (const s of [1, -1]) {
    cyl(0.045, 0.05, rTop - G, 8, WOOD, [rx + s * 0.5, (G + rTop) / 2, rz]);
    box(0.1, 0.04, 0.1, GOLD, [rx + s * 0.5, rTop + 0.02, rz]);
  }
  box(1.1, 0.06, 0.07, WOODH, [rx, 1.36, rz]);
  box(1.1, 0.06, 0.07, WOODH, [rx, 1.0, rz]);
  lat(
    [
      [0, 0],
      [0.85, 0],
      [0.92, 0.05],
      [0.4, 0.14],
      [0, 0.24],
    ],
    1,
    [rx, rTop + 0.04, rz],
    ROOF,
    4,
    { spin: 45 },
  );
  sph(0.04, GOLD, [rx, rTop + 0.3, rz]);
  [1.36, 1.0].forEach((bar, row) => {
    for (let i = 0; i < 4; i++) {
      const px = rx - 0.39 + i * 0.26;
      const py = bar - 0.12;
      b.extrude(
        [
          [-0.08, -0.065],
          [0.08, -0.065],
          [0.08, 0.03],
          [0, 0.065],
          [-0.08, 0.03],
        ],
        { at: [px, py, rz + 0.04], x: [1, 0, 0], thickness: 0.012, color: WOOD, bone: root },
      );
      plane(0.16, 0.13, EMAS[(i + row * 2) % 4], [px, py, rz + 0.0475], [0, 0, 1]);
      for (const sx of [1, -1]) rd([px + sx * 0.05, bar - 0.03, rz + 0.04], [px + sx * 0.05, py + 0.045, rz + 0.04], 0.004, LACQ, { sides: 4 });
      sph(0.012, GOLD, [px, py - 0.075, rz + 0.045]);
    }
  });

  // ---------------------------------------------------------------- blossom tree
  const tcx = -2.0;
  const tcz = -1.7;
  const trunk = b.sweep(
    catmull([
      [tcx, G - 0.05, tcz],
      [tcx - 0.04, 0.7, tcz],
      [tcx + 0.12, 1.5, tcz - 0.06],
      [tcx + 0.04, 2.1, tcz - 0.1],
    ]),
    [0.2, 0.16, 0.11, 0.07],
    { color: BARK, bone: root, sides: 7 },
  );
  for (let i = 0; i < 4; i++) {
    const a = i * 1.6 + 0.4;
    rd(
      [tcx + Math.cos(a) * 0.1, G + 0.2, tcz + Math.sin(a) * 0.1],
      [tcx + Math.cos(a) * 0.42, G, tcz + Math.sin(a) * 0.42],
      [0.07, 0.025],
      BARK,
      { sides: 6 },
    );
  }
  rd([tcx + 0.1, 1.6, tcz - 0.06], [tcx + 0.7, 2.2, tcz - 0.05], [0.06, 0.03], BARK, { sides: 6 });
  rd([tcx + 0.05, 1.9, tcz - 0.1], [tcx - 0.6, 2.4, tcz - 0.2], [0.06, 0.03], BARK, { sides: 6 });
  rd([tcx + 0.04, 2.0, tcz - 0.1], [tcx + 0.1, 2.6, tcz + 0.3], [0.05, 0.025], BARK, { sides: 6 });
  const blobs = (
    [
      [tcx + 0.05, 2.4, tcz - 0.1, 0.7],
      [tcx + 0.7, 2.25, tcz, 0.5],
      [tcx - 0.6, 2.3, tcz - 0.2, 0.5],
      [tcx + 0.1, 2.55, tcz + 0.3, 0.42],
      [tcx - 0.2, 2.2, tcz + 0.35, 0.38],
    ] as Array<[number, number, number, number]>
  ).map(([x, y, z, r]) =>
    b.part(new THREE.IcosahedronGeometry(r, 1), BLOSSOM, {
      at: [x, y, z],
      bone: root,
      flat: true,
      rotation: [rand() * 60, rand() * 360, 0],
    }),
  );
  const blossomHits = b.surface(blobs).scatter(90, { rng: rng(5), minDist: 0.1, filter: (h) => h.n.y > -0.2 });
  b.cards(blossomHits, PETAL_T, { size: 0.17, lean: 50, bend: 20, vary: 0.3, rng: rng(6), bone: root });
  const trunkLoop = b.surface(trunk).loop([tcx - 0.02, 1.0, tcz], { lift: 0.025 });
  b.sweep(trunkLoop, 0.035, { color: ROPE, bone: root, sides: 6 });
  shideRow(trunkLoop, [0.05, 0.22, 0.4, 0.58, 0.76, 0.92], [0.09, 0.26]);

  // ---------------------------------------------------------------- bamboo
  const stalks: Array<[number, number, number, number, number]> = [
    [2.2, -1.5, 2.9, 0.1, 0.05],
    [2.4, -1.75, 2.6, -0.08, 0.1],
    [2.05, -1.9, 2.3, 0.12, -0.05],
    [2.55, -1.4, 2.4, 0.05, 0.1],
    [2.3, -2.05, 2.7, -0.06, -0.1],
    [2.7, -1.75, 2.1, -0.1, 0.0],
  ];
  stalks.forEach(([x, z, h, lx, lz], si) => {
    b.rod([x, G - 0.02, z], [x + lx, h, z + lz], [0.04, 0.028], BAMBOO, { sides: 6, bone: root, caps: "round" });
    const leafFrames = [];
    for (let k = 0; k < 6; k++) {
      const y = h - 0.5 + k * 0.12;
      const t = (y - G) / (h - G);
      leafFrames.push(frame([x + lx * t, y, z + lz * t], [0, 1, 0]));
    }
    b.cards(leafFrames, LEAF_T, {
      size: [0.1, 0.42],
      lean: 70,
      bend: 20,
      flow: (_f, i) => [Math.cos(i * 2.4 + si), -0.3, Math.sin(i * 2.4 + si)],
      vary: 0.2,
      rng: rng(30 + si),
      bone: root,
    });
  });
  b.part(new THREE.IcosahedronGeometry(0.25, 0), MOSSROCK, {
    at: [2.0, G + 0.08, -1.1],
    bone: root,
    scale: [1, 0.6, 1.2],
    flat: true,
    rotation: [10, 40, 0],
  });
  b.part(new THREE.IcosahedronGeometry(0.18, 0), MOSSROCK, {
    at: [-1.5, G + 0.06, -0.8],
    bone: root,
    scale: [1.2, 0.6, 1],
    flat: true,
    rotation: [0, 70, 10],
  });

  // ---------------------------------------------------------------- ground cover
  const blocked = (x: number, z: number) =>
    (Math.abs(x) < 0.8 && z > -0.45) ||
    (Math.abs(x) < 1.35 && z < -0.3 && z > -2.5) ||
    Math.hypot(x - tcx, z - tcz) < 0.35 ||
    (Math.abs(x - tx) < 0.5 && Math.abs(z - tz) < 0.4) ||
    (Math.abs(x - rx) < 0.65 && Math.abs(z - rz) < 0.3) ||
    (Math.abs(Math.abs(x) - 1.05) < 0.4 && Math.abs(z - 0.75) < 0.4) ||
    (Math.abs(Math.abs(x) - 0.95) < 0.3 && Math.abs(z) < 0.3) ||
    (Math.abs(Math.abs(x) - TX) < 0.25 && Math.abs(z - TZ) < 0.25);
  const spots: Array<[number, number]> = [];
  let guard = 0;
  while (spots.length < 150 && guard++ < 4000) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * 2.9;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (!blocked(x, z)) spots.push([x, z]);
  }
  b.cards(
    spots.slice(0, 110).map(([x, z]) => frame([x, G, z], [0, 1, 0])),
    GRASS_T,
    { size: [0.11, 0.2], cross: true, vary: 0.4, spin: 180, rng: rng(21), bone: root },
  );
  b.cards(
    spots.slice(110).map(([x, z]) => frame([x, G, z], [0, 1, 0])),
    FLOWER_T,
    { size: [0.07, 0.12], cross: true, vary: 0.3, spin: 180, rng: rng(22), bone: root },
  );
  const petalSpots: Array<[number, number, number]> = [];
  for (let i = 0; i < 24; i++) petalSpots.push([(rand() - 0.5) * 1.1, 0.136, 0.05 + rand() * 0.95]);
  for (let i = 0; i < 24; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.3 + rand() * 1.0;
    const x = tcx + Math.cos(a) * r;
    const z = tcz + Math.sin(a) * r;
    if (!blocked(x, z) || Math.hypot(x - tcx, z - tcz) > 0.4) if (Math.abs(x) > 1.3 || z > -0.3) petalSpots.push([x, 0.126, z]);
  }
  for (const z of [1.15, 1.47, 1.79]) petalSpots.push([(rand() - 0.5) * 0.4, 0.178, z]);
  b.cards(
    petalSpots.map(([x, y, z]) => frame([x, y, z], [0, 1, 0])),
    PETAL_T,
    {
      size: 0.07,
      lean: 90,
      mirror: true,
      flow: (_f, i) => [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)],
      rng: rng(40),
      sink: 0,
      bone: root,
    },
  );

  // ---------------------------------------------------------------- floating electro motes
  const motes: Array<[number, number, number, number]> = [
    [-0.55, 1.95, -0.1, 0.04],
    [0.6, 2.1, 0.2, 0.03],
    [-0.2, 1.55, 0.45, 0.035],
    [0.35, 1.7, -0.3, 0.045],
    [1.5, 1.8, 0.9, 0.03],
    [-1.5, 1.7, 1.1, 0.035],
  ];
  for (const [x, y, z, r] of motes) glow(sph(r, VIOLET, [x, y, z]), 1.6);
  for (const [x, y, z] of [
    [-0.4, 1.8, 0.1],
    [0.45, 1.9, -0.05],
    [0.0, 2.2, 0.35],
    [-1.4, 1.5, 0.4],
  ])
    glow(b.part(new THREE.OctahedronGeometry(0.04, 0), "#ffd96a", { at: [x, y, z], bone: root, scale: [0.6, 1, 0.6] }), 1.4);

  return b.root;
}
