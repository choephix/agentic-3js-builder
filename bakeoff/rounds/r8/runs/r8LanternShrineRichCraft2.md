```ts
import * as THREE from "three";
import { createBuilder, frame, rng, paint, noise, mottle, grain, stripes, catmull, svg } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Roadside Electro Shrine",
  description:
    "A Genshin Impact (Inazuma) styled roadside shrine: vermilion torii with shimenawa and shide, stone toro lanterns, kitsune guardians, a small hokora with glowing Electro crystal, offerings, ema rack, sake barrels and a sacred sakura.",
};

type V = [number, number, number];
type O = [number, number] | [number, number, "sharp"];

const GY = 0.2; // top of the grass
const INKC = "#22112f";

// ---------------------------------------------------------------- paints (cel-shaded)
const STONE_BASE = mottle("#cbc7da", "#a9a5c0", { size: 0.22, seed: 3 });
const STONE = cel(
  paint((p, n) => {
    const m = noise(p, 0.15, 7);
    if (n.y > 0.3 && m > 0.6) return "#86b862";
    if (p.y < GY + 0.3 && m > 0.52) return "#8da973";
    return STONE_BASE;
  }),
);
const PAVE = cel(mottle("#e0dce8", "#c6c1d6", { size: 0.3, seed: 9 }));
const FOXW = cel(mottle("#f3f0f8", "#d9d4ea", { size: 0.16, seed: 4 }));
const BLKSTONE = cel(mottle("#47455a", "#35334a", { size: 0.2, seed: 5 }));
const VERM = cel(grain("#ee5a3f", "#d23a2e", { size: 0.03, axis: "y" }));
const LACQ = cel("#38294a", "#1b1426");
const GOLD = cel("#ffdc7a", "#d8962f");
const WOOD = cel(grain("#d2a46c", "#b0804f", { size: 0.025, axis: "x" }));
const DWOOD = cel(grain("#85533c", "#633a2b", { size: 0.03, axis: "x" }));
const PLASTER = cel("#f6ecda", "#dccdc3");
const PAPER = cel("#fbf5e8", "#d9cfe6");
const RED = cel("#d93a2e");
const ROOF = cel(
  paint((p) => {
    const f = p.x / 0.12 - Math.floor(p.x / 0.12);
    if (f < 0.1) return "#1f2248";
    return noise(p, 0.35, 2) > 0.55 ? "#505ca8" : "#3d4789";
  }),
);
const GRASS_TOP = mottle("#8bd271", "#62b45f", { size: 0.55, seed: 1 });
const GRASS = cel(paint((_p, n) => (n.y < 0.5 ? "#7a6152" : GRASS_TOP)));
const ROPE = cel(stripes("#f1e4b0", "#b89a54", { size: 0.06, axis: "x", width: 0.5, wobble: 0.1 }));
const STRAW = cel(stripes("#e0c070", "#b08f46", { size: 0.07, axis: "y", width: 0.4, wobble: 0.3 }));
const BARK = cel(grain("#7e5764", "#563946", { size: 0.05, axis: "y" }));
const CLOTH = cel("#6d52b0", "#4b3685");

// flat accents
const ELEC = "#b36bff";
const ELEC_L = "#e2bcff";
const PINKS = ["#ffc2d9", "#ffa6c9", "#f98fbb", "#ffd9e8"];
const ORANGE = "#ff9a2b";
const WATER = "#8fe3f0";
const COIN = "#ffd36b";

const beam = (w: number, top0: number, topE: number, bot0: number, botE: number, n = 8): O[] => {
  const up: O[] = [];
  const lo: O[] = [];
  for (let i = 0; i <= n; i++) {
    const x = -w + (2 * w * i) / n;
    const t = Math.pow(Math.abs(x / w), 2.2);
    up.push([x, top0 + (topE - top0) * t]);
    lo.push([x, bot0 + (botE - bot0) * t]);
  }
  return [...up, ...lo.reverse()];
};

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
const ball = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
const octa = () => new THREE.OctahedronGeometry(1, 0);

export default function build() {
  const b = createBuilder({ name: "roadside_shrine", paintSize: 2048 });
  b.joint("root", { at: [0, 0.1, 0] });
  const R = rng(11);
  const put = (geo: THREE.BufferGeometry, color: any, at: V, o: any = {}) => b.part(geo, color, { at, ...o });

  // ---------------------------------------------------------------- textures
  const lattice = (() => {
    let s = "";
    for (const x of [12, 20, 28]) s += `<path d="M${x} 4V86"/>`;
    for (let y = 18; y < 86; y += 14) s += `<path d="M4 ${y}H36"/>`;
    return s;
  })();
  const DOOR = svg(
    `<svg viewBox="0 0 40 90" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="90" fill="#c23a2c"/><rect x="4" y="4" width="32" height="82" fill="#f6ecd0"/><g stroke="#8a5a3a" stroke-width="1.4" fill="none">${lattice}</g><path d="M20 36l9 9-9 9-9-9z" fill="none" stroke="#d9a53a" stroke-width="1.8"/><circle cx="20" cy="45" r="2.6" fill="#b46bff"/></svg>`,
    { size: 256 },
  );
  const commas = (cx: number, cy: number, r: number, cr: number, col: string) =>
    [0, 120, 240]
      .map(
        (a) =>
          `<g transform="rotate(${a} ${cx} ${cy})"><circle cx="${cx}" cy="${cy - r}" r="${cr}" fill="${col}"/><path d="M${cx} ${cy - r - cr} Q${cx + cr * 2.2} ${cy - r - cr * 0.6} ${cx + cr * 1.2} ${cy - r + cr * 1.8} Q${cx + cr * 0.6} ${cy - r + cr * 0.6} ${cx} ${cy - r + cr}Z" fill="${col}"/></g>`,
      )
      .join("");
  const PLAQUE = svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="56" height="76" rx="4" fill="#2a1f38" stroke="#f4c75a" stroke-width="3"/><rect x="7" y="7" width="46" height="66" rx="2" fill="none" stroke="#8d62d8" stroke-width="1.4"/><circle cx="30" cy="40" r="19" fill="none" stroke="#c58bff" stroke-width="2"/>${commas(30, 40, 9, 5, "#e2bcff")}<circle cx="9" cy="9" r="2" fill="#f4c75a"/><circle cx="51" cy="9" r="2" fill="#f4c75a"/><circle cx="9" cy="71" r="2" fill="#f4c75a"/><circle cx="51" cy="71" r="2" fill="#f4c75a"/></svg>`,
    { size: 256 },
  );
  const SHIDE = svg(
    `<svg viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 64) scale(1 -1)"><path d="M4 0H20V14L10 24L20 34L10 44L20 54L12 64L4 54L14 44L4 34L14 24L4 14Z" fill="#fffaf0" stroke="#cdbfa3" stroke-width="1.2"/></g></svg>`,
    { size: 192 },
  );
  const ribs = (() => {
    let s = "";
    for (let x = 0; x <= 128; x += 8) s += `<path d="M${x} 0V64"/>`;
    return s;
  })();
  const CHO = svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="64" fill="#ff7a4a"/><g stroke="#e0552e" stroke-width="1.4">${ribs}</g><rect y="0" width="128" height="8" fill="#3a1f2e"/><rect y="56" width="128" height="8" fill="#3a1f2e"/><circle cx="64" cy="32" r="16" fill="#fff4dc" stroke="#3a1f2e" stroke-width="2"/>${commas(64, 32, 8, 4.2, "#8a4fe0")}</svg>`,
    { size: 256 },
  );
  const PETAL = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="p" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f77fb0"/><stop offset="1" stop-color="#ffd6e6"/></linearGradient></defs><path d="M16 30C4 22 2 10 10 2Q16 9 16 9Q16 9 22 2C30 10 28 22 16 30Z" fill="url(#p)"/></svg>`,
    { size: 64 },
  );
  const GRASSTEX = svg(
    `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg"><path d="M18 64Q12 36 2 14Q20 32 22 64Z" fill="#5ab957"/><path d="M20 64Q22 30 18 2Q32 28 26 64Z" fill="#8fe074"/><path d="M24 64Q32 40 38 16Q38 42 30 64Z" fill="#6fcf62"/></svg>`,
    { size: 128 },
  );
  const EMA = svg(
    `<svg viewBox="0 0 48 40" xmlns="http://www.w3.org/2000/svg"><path d="M6 40V14L24 2L42 14V40Z" fill="#dcaa6e" stroke="#8b5a2b" stroke-width="1.6"/><path d="M11 22L15 11L22 17H26L33 11L37 22Q24 38 11 22Z" fill="#fffaf2" stroke="#3a2a40" stroke-width="1.2"/><path d="M14 23Q18 21 21 25M34 23Q30 21 27 25" stroke="#8d4fe0" stroke-width="2" fill="none"/><path d="M24 28V32" stroke="#3a2a40" stroke-width="2"/><path d="M15 15L18 18M33 15L30 18" stroke="#d93a2e" stroke-width="2"/><circle cx="24" cy="7" r="1.4" fill="#8b5a2b"/></svg>`,
    { size: 192 },
  );
  const SIGIL = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#e2bcff" stroke-width="3"><circle cx="64" cy="64" r="60"/><circle cx="64" cy="64" r="50" stroke-width="2" stroke-dasharray="3 5"/><polygon points="64,18 104,86 24,86" stroke-width="2.2"/><polygon points="64,110 24,42 104,42" stroke-width="2.2"/><circle cx="64" cy="64" r="16"/>${commas(64, 64, 8, 4, "#e2bcff")}<g stroke-width="4"><path d="M64 2V10M64 118V126M2 64H10M118 64H126"/></g></svg>`,
    { size: 512 },
  );
  const LABEL = svg(
    `<svg viewBox="0 0 40 46" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="36" height="42" rx="4" fill="#f6f0e0" stroke="#2b3d86" stroke-width="3"/><circle cx="20" cy="23" r="11" fill="#2b3d86"/><path d="M13 23H27M20 14V32M15 17L25 29M25 17L15 29" stroke="#f6f0e0" stroke-width="2.4"/><path d="M8 8H32M8 38H32" stroke="#2b3d86" stroke-width="2.4"/></svg>`,
    { size: 192 },
  );

  // ---------------------------------------------------------------- ground
  b.lathe(
    [
      [0, 0],
      [3.3, 0],
      [3.3, 0.12],
      [3.2, GY],
      [0, GY],
    ],
    { at: [0, 0, 0], segments: 24, color: GRASS },
  );
  b.lathe(
    [
      [3.18, 0],
      [3.42, 0],
      [3.42, 0.28],
      [3.18, 0.28],
    ],
    { at: [0, 0, 0], segments: 24, color: STONE },
  );

  // paving
  for (const z of [1.72, 1.22, 0.72, 0.28])
    put(box(0.95, 0.05, 0.5), PAVE, [(R() - 0.5) * 0.06, GY + 0.025, z], { rotation: [0, (R() - 0.5) * 5, 0] });
  put(cyl(0.62, 0.62, 0.06, 16), PAVE, [0, GY + 0.03, 2.62]);
  put(cyl(0.66, 0.66, 0.03, 16), STONE, [0, GY + 0.015, 2.62]);
  glow(
    put(new THREE.PlaneGeometry(1.1, 1.1), "#ffffff", [0, GY + 0.066, 2.62], {
      dir: [0, 1, 0],
      axis: "z",
      texture: SIGIL,
    }),
    1.4,
  );

  // ---------------------------------------------------------------- torii
  const TZ = 1.0;
  for (const s of [1, -1]) {
    const x = s * 1.15;
    put(cyl(0.2, 0.25, 0.2, 10), BLKSTONE, [x, GY + 0.1, TZ]);
    put(cyl(0.125, 0.15, 2.9, 12), VERM, [x, GY + 0.18 + 1.45, TZ]);
    put(cyl(0.162, 0.17, 0.07, 12), GOLD, [x, GY + 0.36, TZ]);
    put(cyl(0.14, 0.14, 0.07, 12), GOLD, [x, GY + 2.72, TZ]);
    put(cyl(0.136, 0.136, 0.04, 12), GOLD, [x, GY + 2.62, TZ]);
    // end of nuki
    put(box(0.05, 0.2, 0.2), GOLD, [s * 1.51, GY + 2.4, TZ]);
    // kasagi end plates
    put(box(0.04, 0.2, 0.42), GOLD, [s * 2.07, GY + 3.26, TZ], { rotation: [0, 0, s * -22] });
  }
  put(box(3.0, 0.15, 0.15), VERM, [0, GY + 2.4, TZ]);
  put(box(0.14, 0.45, 0.14), VERM, [0, GY + 2.7, TZ]);
  b.extrude(beam(1.95, 0.02, 0.24, -0.14, 0.06), {
    at: [0, GY + 3.0, TZ],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.3,
    bevel: 0.01,
    color: VERM,
  });
  b.extrude(beam(2.05, 0.11, 0.34, 0.0, 0.22), {
    at: [0, GY + 3.0, TZ],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.38,
    bevel: 0.012,
    color: LACQ,
  });
  for (const z of [TZ + 0.09, TZ - 0.09])
    glow(put(box(0.34, 0.4, 0.04), "#ffffff", [0, GY + 2.7, z], { texture: PLAQUE }), 0.6);

  // shimenawa + shide
  const ropeP = catmull([
    [-1.03, GY + 2.22, TZ],
    [-0.55, GY + 2.04, TZ],
    [0, GY + 1.97, TZ],
    [0.55, GY + 2.04, TZ],
    [1.03, GY + 2.22, TZ],
  ]);
  b.sweep(ropeP, 0.05, { color: ROPE });
  for (const s of [1, -1]) {
    put(ball(0.075, 7, 5), ROPE, [s * 1.03, GY + 2.22, TZ], { flat: true });
    put(cyl(0.01, 0.05, 0.22, 7), ROPE, [s * 1.03, GY + 2.06, TZ + 0.05]);
  }
  b.cards(
    [0.12, 0.26, 0.4, 0.5, 0.6, 0.74, 0.88].map((t) => frame(ropeP.at(t), [0, 1, 0])),
    SHIDE,
    { size: [0.1, 0.3], lean: 180, flow: [0, 0, 1], sink: 0 },
  );

  // hanging chochin
  const chochin = (x: number, y: number, z: number, k: number, len: number) => {
    glow(
      put(ball(1, 12, 8), "#ffffff", [x, y, z], {
        scale: [0.17 * k, 0.22 * k, 0.17 * k],
        rotation: [0, -90, 0],
        texture: CHO,
      }),
      1.3,
    );
    put(cyl(0.085 * k, 0.07 * k, 0.04 * k, 10), LACQ, [x, y + 0.215 * k, z]);
    put(cyl(0.07 * k, 0.085 * k, 0.04 * k, 10), LACQ, [x, y - 0.215 * k, z]);
    put(cyl(0.004, 0.004, len, 4), INKC, [x, y + 0.235 * k + len / 2, z]);
    put(cyl(0.022 * k, 0.004, 0.1 * k, 6), RED, [x, y - 0.29 * k, z]);
  };
  for (const s of [1, -1]) chochin(s * 1.38, GY + 1.98, TZ, 1, 0.2);

  // ---------------------------------------------------------------- stone lanterns (toro)
  const toro = (x: number, z: number) => {
    const y = GY;
    put(cyl(0.3, 0.34, 0.14, 6), STONE, [x, y + 0.07, z]);
    put(cyl(0.1, 0.12, 0.62, 6), STONE, [x, y + 0.45, z]);
    put(cyl(0.3, 0.16, 0.14, 6), STONE, [x, y + 0.83, z]);
    put(box(0.46, 0.05, 0.46), STONE, [x, y + 0.925, z]);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) put(box(0.07, 0.32, 0.07), STONE, [x + sx * 0.17, y + 1.11, z + sz * 0.17]);
    glow(put(box(0.3, 0.26, 0.3), "#ffb347", [x, y + 1.1, z]), 1.6);
    put(box(0.46, 0.05, 0.46), STONE, [x, y + 1.295, z]);
    b.lathe(
      [
        [0, 0],
        [0.62, 0],
        [0.7, 0.07],
        [0.5, 0.1],
        [0.12, 0.3],
        [0, 0.33],
      ],
      { at: [x, y + 1.32, z], segments: 4, spin: 45, color: STONE },
    );
    b.lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.1, 0.05],
        [0.06, 0.1],
        [0.035, 0.14],
        [0, 0.2],
      ],
      { at: [x, y + 1.65, z], segments: 8, color: STONE },
    );
    put(ball(0.05, 6, 4), "#8cc468", [x + 0.2, y + 1.38, z + 0.18], { flat: true, scale: [1.4, 0.6, 1.2] });
  };
  toro(2.0, 1.5);
  toro(-2.0, 1.5);

  // ---------------------------------------------------------------- hokora (small shrine)
  const Z0 = -1.4;
  const PT = GY + 0.28;
  const y0 = PT + 0.08;
  const Zf = Z0 + 0.35;
  const Zb = Z0 - 0.55;
  const yE = y0 + 1.05;
  const zc = Z0 - 0.1;

  put(box(2.3, 0.22, 1.7), STONE, [0, GY + 0.11, Z0]);
  put(box(2.42, 0.06, 1.82), PAVE, [0, GY + 0.25, Z0]);
  put(box(1.1, 0.1, 0.3), STONE, [0, GY + 0.05, Z0 + 1.3]);
  put(box(1.0, 0.19, 0.3), STONE, [0, GY + 0.095, Z0 + 1.0]);
  put(box(1.9, 0.08, 1.45), DWOOD, [0, PT + 0.04, Z0 - 0.05]);

  for (const x of [-0.7, -0.36, 0.36, 0.7]) put(cyl(0.045, 0.05, 0.95, 8), VERM, [x, y0 + 0.475, Zf]);
  for (const x of [-0.7, 0.7]) put(cyl(0.045, 0.05, 0.95, 8), VERM, [x, y0 + 0.475, Zb]);
  put(box(1.4, 0.9, 0.04), PLASTER, [0, y0 + 0.45, Zb + 0.02]);
  for (const s of [1, -1]) {
    put(box(0.04, 0.9, 0.9), PLASTER, [s * 0.68, y0 + 0.45, zc]);
    put(box(0.3, 0.88, 0.04), "#ffffff", [s * 0.53, y0 + 0.46, Zf], { texture: DOOR });
    put(box(0.14, 0.1, 0.95), VERM, [s * 0.7, y0 + 1.0, zc]);
  }
  put(box(1.5, 0.1, 0.14), VERM, [0, y0 + 1.0, Zf]);
  put(box(1.5, 0.1, 0.14), VERM, [0, y0 + 1.0, Zb]);
  put(box(1.5, 0.07, 0.12), DWOOD, [0, y0 + 0.035, Zf]);

  // open doors
  const th = 75;
  for (const s of [1, -1]) {
    const w = 0.36;
    const hx = s * 0.36;
    const cx = hx + -s * Math.cos((th * Math.PI) / 180) * (w / 2);
    const cz = Zf + Math.sin((th * Math.PI) / 180) * (w / 2);
    put(box(w, 0.76, 0.03), "#ffffff", [cx, y0 + 0.46, cz], { rotation: [0, s * th, 0], texture: DOOR });
  }

  // interior glow
  glow(
    put(new THREE.PlaneGeometry(0.7, 0.8), "#9a5cf0", [0, y0 + 0.45, Zb + 0.05], { dir: [0, 0, 1], axis: "z" }),
    0.9,
  );
  put(box(0.36, 0.12, 0.26), WOOD, [0, y0 + 0.06, Z0 - 0.3]);
  glow(
    put(octa(), ELEC, [0, y0 + 0.34, Z0 - 0.3], { scale: [0.1, 0.2, 0.1], flat: true, rotation: [0, 20, 0] }),
    1.5,
  );
  glow(put(cyl(0.15, 0.15, 0.02, 16), "#ffe08a", [0, y0 + 0.62, Zb + 0.1], { dir: [0, 0, 1] }), 0.6);
  put(cyl(0.02, 0.02, 0.2, 6), GOLD, [0, y0 + 0.47, Zb + 0.09]);

  // roof
  const roofOutline: O[] = [
    [-1.0, 0.12, "sharp"],
    [-0.85, 0.02],
    [-0.45, 0.0],
    [0.45, 0.0],
    [0.85, 0.02],
    [1.0, 0.12, "sharp"],
    [1.0, 0.17, "sharp"],
    [0.75, 0.24],
    [0.4, 0.4],
    [0.12, 0.52],
    [-0.12, 0.52],
    [-0.4, 0.4],
    [-0.75, 0.24],
    [-1.0, 0.17, "sharp"],
  ];
  b.extrude(roofOutline, {
    at: [0, yE + 0.1, zc],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 2.3,
    color: ROOF,
  });
  const ridgeY = yE + 0.1 + 0.52;
  put(box(2.4, 0.08, 0.2), LACQ, [0, ridgeY + 0.04, zc]);
  for (const s of [1, -1])
    for (const a of [28, -28]) put(box(0.06, 0.6, 0.05), WOOD, [s * 1.15, ridgeY + 0.22, zc], { rotation: [a, 0, 0] });
  for (let i = -2; i <= 2; i++) put(cyl(0.035, 0.035, 0.34, 8), GOLD, [i * 0.3, ridgeY + 0.12, zc], { dir: [0, 0, 1] });
  for (let i = -5; i <= 5; i++)
    put(cyl(0.045, 0.045, 0.02, 8), GOLD, [i * 0.2, yE + 0.1 + 0.14, zc + 1.0], { dir: [0, 0, 1] });

  // porch details
  chochin(0.88, yE - 0.3, Z0 + 0.75, 0.9, 0.17);
  chochin(-0.88, yE - 0.3, Z0 + 0.75, 0.9, 0.17);
  const ropeS = catmull([
    [-0.72, y0 + 0.93, Zf + 0.1],
    [0, y0 + 0.86, Zf + 0.1],
    [0.72, y0 + 0.93, Zf + 0.1],
  ]);
  b.sweep(ropeS, 0.03, { color: ROPE });
  b.cards(
    [0.2, 0.5, 0.8].map((t) => frame(ropeS.at(t), [0, 1, 0])),
    SHIDE,
    { size: [0.06, 0.17], lean: 180, flow: [0, 0, 1], sink: 0 },
  );

  // saisen box
  put(box(0.5, 0.3, 0.36), DWOOD, [0, PT + 0.08 + 0.15, Z0 + 0.46]);
  put(box(0.46, 0.012, 0.32), INKC, [0, PT + 0.08 + 0.305, Z0 + 0.46]);
  for (let i = -2; i <= 2; i++) put(box(0.035, 0.02, 0.36), DWOOD, [i * 0.09, PT + 0.08 + 0.31, Z0 + 0.46]);
  put(cyl(0.025, 0.025, 0.006, 10), COIN, [0.08, PT + 0.08 + 0.325, Z0 + 0.46]);

  // ---------------------------------------------------------------- kitsune guardians
  const fox = (cx: number, cz: number, s: number) => {
    const L = (x: number, y: number, z: number): V => [cx + x, GY + 0.3 + y, cz + z];
    put(box(0.58, 0.12, 0.7), STONE, [cx, GY + 0.06, cz - 0.02]);
    put(box(0.48, 0.18, 0.6), STONE, [cx, GY + 0.21, cz - 0.02]);
    for (const t of [1, -1]) {
      put(ball(1, 8, 6), FOXW, L(t * 0.12, 0.17, -0.08), { scale: [0.1, 0.17, 0.19], flat: true });
      b.rod(L(t * 0.075, 0.38, 0.12), L(t * 0.075, 0.03, 0.17), [0.05, 0.042], { color: FOXW, sides: 6 });
      put(ball(1, 6, 4), FOXW, L(t * 0.075, 0.03, 0.2), { scale: [0.055, 0.035, 0.075], flat: true });
      put(box(0.05, 0.014, 0.012), INKC, L(t * 0.058, 0.625, 0.238), { rotation: [0, 0, t * 18] });
      b.extrude(
        [
          [-0.055, 0],
          [0.055, 0],
          [0, 0.17],
        ],
        { at: L(t * 0.07, 0.67, 0.12), x: [1, 0, 0], y: [0, 1, -0.3], thickness: 0.035, color: FOXW },
      );
      b.extrude(
        [
          [-0.03, 0.01],
          [0.03, 0.01],
          [0, 0.12],
        ],
        { at: L(t * 0.07, 0.67, 0.12), x: [1, 0, 0], y: [0, 1, -0.3], thickness: 0.04, color: RED },
      );
    }
    b.capsule(L(0, 0.2, -0.1), L(0, 0.45, 0.1), [0.14, 0.11], { color: FOXW, sides: 8 });
    put(ball(1, 10, 7), FOXW, L(0, 0.6, 0.15), { scale: [0.115, 0.1, 0.11], flat: true });
    put(cyl(0.02, 0.06, 0.17, 6), FOXW, L(0, 0.57, 0.27), { dir: [0, -0.12, 1] });
    put(ball(0.02, 6, 4), INKC, L(0, 0.56, 0.354));
    put(new THREE.TorusGeometry(0.115, 0.03, 6, 10), RED, L(0, 0.47, 0.1), { dir: [0, 0.35, 0.25], axis: "z" });
    b.extrude(
      [
        [-0.08, 0],
        [0.08, 0],
        [0, -0.16],
      ],
      { at: L(0, 0.46, 0.18), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, color: RED },
    );
    put(ball(0.025, 6, 4), GOLD, L(0, 0.32, 0.215));
    b.sweep(
      catmull([L(0, 0.1, -0.15), L(0, 0.12, -0.3), L(s * 0.1, 0.4, -0.34), L(s * 0.05, 0.62, -0.22)]),
      [0.05, 0.1, 0.12, 0.02],
      { color: FOXW, caps: { start: "round", end: "point" } },
    );
    if (s > 0) {
      put(cyl(0.04, 0.05, 0.03, 8), GOLD, L(0, 0.015, 0.3));
      glow(put(ball(0.055, 8, 6), ELEC, L(0, 0.08, 0.3)), 1.5);
    } else {
      put(cyl(0.025, 0.025, 0.2, 8), PAPER, L(0, 0.03, 0.3), { dir: [1, 0, 0] });
      for (const t of [1, -1]) put(cyl(0.03, 0.03, 0.02, 8), GOLD, L(t * 0.11, 0.03, 0.3), { dir: [1, 0, 0] });
    }
  };
  fox(1.0, -0.1, 1);
  fox(-1.0, -0.1, -1);

  // ---------------------------------------------------------------- offering table (right)
  const TX = 1.95;
  const TZ2 = -1.0;
  const TB = GY + 0.54;
  put(box(0.95, 0.06, 0.6), DWOOD, [TX, GY + 0.5, TZ2]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) put(box(0.07, 0.47, 0.07), DWOOD, [TX + sx * 0.4, GY + 0.235, TZ2 + sz * 0.24]);
  put(box(0.72, 0.012, 0.64), CLOTH, [TX, GY + 0.536, TZ2]);
  put(box(0.72, 0.014, 0.05), GOLD, [TX, GY + 0.54, TZ2 + 0.3]);
  // mikan tray
  put(cyl(0.05, 0.07, 0.06, 8), WOOD, [TX - 0.25, TB + 0.03, TZ2]);
  b.lathe(
    [
      [0, 0],
      [0.12, 0],
      [0.16, 0.07],
      [0.14, 0.07],
      [0.1, 0.03],
      [0, 0.03],
    ],
    { at: [TX - 0.25, TB + 0.06, TZ2], segments: 10, color: PAPER },
  );
  for (const [dx, dz] of [
    [0.05, 0],
    [-0.025, 0.043],
    [-0.025, -0.043],
  ])
    put(ball(0.045, 8, 6), ORANGE, [TX - 0.25 + dx, TB + 0.145, TZ2 + dz], { flat: true });
  put(ball(0.045, 8, 6), ORANGE, [TX - 0.25, TB + 0.2, TZ2], { flat: true });
  put(cyl(0.002, 0.02, 0.025, 4), "#4a9a3a", [TX - 0.25, TB + 0.25, TZ2]);
  // sake bottles
  const bottle = [
    [0, 0],
    [0.045, 0],
    [0.06, 0.06],
    [0.05, 0.13],
    [0.022, 0.16],
    [0.025, 0.2],
    [0.034, 0.21],
    [0, 0.21],
  ] as [number, number][];
  b.lathe(bottle, { at: [TX + 0.2, TB, TZ2 + 0.05], segments: 8, color: PAPER });
  b.lathe(bottle, { at: [TX + 0.31, TB, TZ2 - 0.1], segments: 8, color: PAPER });
  put(cyl(0.046, 0.058, 0.04, 8), "#2b3d86", [TX + 0.2, TB + 0.07, TZ2 + 0.05]);
  put(cyl(0.046, 0.058, 0.04, 8), "#2b3d86", [TX + 0.31, TB + 0.07, TZ2 - 0.1]);
  put(cyl(0.03, 0.02, 0.035, 8), "#2a3a78", [TX + 0.12, TB + 0.018, TZ2 + 0.17]);
  put(cyl(0.03, 0.02, 0.035, 8), "#2a3a78", [TX + 0.4, TB + 0.018, TZ2 + 0.12]);
  // dango
  put(cyl(0.1, 0.09, 0.015, 10), PAPER, [TX - 0.02, TB + 0.008, TZ2 + 0.17]);
  for (const dz of [-0.03, 0.03]) {
    b.rod([TX - 0.12, TB + 0.04, TZ2 + 0.17 + dz], [TX + 0.1, TB + 0.04, TZ2 + 0.17 + dz], 0.004, {
      color: WOOD,
      sides: 4,
    });
    ["#ffb3cf", "#fffaf0", "#a6e08a"].forEach((c, i) =>
      put(ball(0.03, 7, 5), c, [TX - 0.06 + i * 0.065, TB + 0.04, TZ2 + 0.17 + dz], { flat: true }),
    );
  }
  // mochi
  put(ball(0.08, 8, 6), "#ffffff", [TX - 0.02, TB + 0.03, TZ2 - 0.15], { scale: [1, 0.45, 1], flat: true });
  put(ball(0.065, 8, 6), "#ffffff", [TX - 0.02, TB + 0.075, TZ2 - 0.15], { scale: [1, 0.45, 1], flat: true });
  put(ball(0.03, 7, 5), ORANGE, [TX - 0.02, TB + 0.12, TZ2 - 0.15], { flat: true });
  // coins
  for (const [dx, dz, r] of [
    [-0.3, -0.2, 10],
    [-0.22, -0.24, -20],
    [0.0, 0.24, 30],
    [0.3, 0.22, 0],
  ])
    put(cyl(0.025, 0.025, 0.004, 10), COIN, [TX + dx, TB + 0.004, TZ2 + dz], { rotation: [0, r, 0] });

  // ---------------------------------------------------------------- sake barrels (right front)
  const barrel = (x: number, z: number, y: number, k: number) => {
    const body = b.lathe(
      [
        [0, 0],
        [0.27 * k, 0],
        [0.32 * k, 0.1 * k],
        [0.34 * k, 0.3 * k],
        [0.32 * k, 0.5 * k],
        [0.27 * k, 0.6 * k],
        [0, 0.6 * k],
      ],
      { at: [x, y, z], segments: 14, color: STRAW },
    );
    for (const h of [0.14, 0.46])
      put(new THREE.TorusGeometry(0.335 * k, 0.022, 5, 14), ROPE, [x, y + h * k, z], { dir: [0, 1, 0], axis: "z" });
    put(cyl(0.25 * k, 0.25 * k, 0.015, 14), LACQ, [x, y + 0.6 * k, z]);
    b.decal(body, LABEL, { at: [x, y + 0.3 * k, z + 0.36 * k], dir: [0, 0, 1], size: [0.24 * k, 0.28 * k] });
  };
  barrel(1.75, 0.2, GY, 1);
  barrel(2.45, 0.1, GY, 1);
  barrel(2.1, 0.12, GY + 0.6, 0.85);

  // ---------------------------------------------------------------- ema rack (left)
  const EX = -2.2;
  const EZ = -0.3;
  for (const s of [1, -1]) put(box(0.1, 1.5, 0.1), VERM, [EX + s * 0.5, GY + 0.75, EZ]);
  put(box(1.15, 0.07, 0.09), VERM, [EX, GY + 1.42, EZ]);
  put(box(1.15, 0.05, 0.07), DWOOD, [EX, GY + 0.95, EZ]);
  b.extrude(
    [
      [-0.24, 0],
      [0.24, 0],
      [0.0, 0.18],
    ],
    { at: [EX, GY + 1.5, EZ], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.25, color: ROOF },
  );
  const pent: O[] = [
    [-0.09, -0.0825],
    [0.09, -0.0825],
    [0.09, 0.03],
    [0, 0.0825],
    [-0.09, 0.03],
  ];
  for (let i = 0; i < 7; i++) {
    const x = EX - 0.43 + i * 0.143;
    const y = GY + 1.2 - (i % 2) * 0.12;
    const rot = (R() - 0.5) * 10;
    put(box(0.008, GY + 1.42 - y - 0.07, 0.008), ROPE, [x, (GY + 1.42 + y + 0.07) / 2 - 0.0, EZ + 0.01]);
    b.extrude(pent, { at: [x, y, EZ + 0.04], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: WOOD });
    put(new THREE.PlaneGeometry(0.24, 0.174), "#ffffff", [x, y, EZ + 0.0466], { texture: EMA, rotation: [0, 0, rot * 0] });
  }

  // ---------------------------------------------------------------- chozuya basin (front right)
  const BX = 1.6;
  const BZ = 2.15;
  put(cyl(0.2, 0.25, 0.5, 6), STONE, [BX, GY + 0.25, BZ]);
  b.lathe(
    [
      [0, 0],
      [0.14, 0],
      [0.34, 0.14],
      [0.34, 0.26],
      [0.28, 0.26],
      [0.28, 0.16],
      [0, 0.16],
    ],
    { at: [BX, GY + 0.5, BZ], segments: 8, color: STONE },
  );
  put(cyl(0.275, 0.275, 0.01, 10), WATER, [BX, GY + 0.5 + 0.235, BZ]);
  b.rod([BX - 0.3, GY + 0.77, BZ + 0.05], [BX + 0.2, GY + 0.77, BZ - 0.05], 0.012, { color: "#9ccf6a", sides: 6 });
  put(cyl(0.04, 0.04, 0.05, 8), "#8bbf5c", [BX - 0.33, GY + 0.77, BZ + 0.05], { dir: [1, 0, 0] });

  // ---------------------------------------------------------------- sacred sakura
  const trunk = catmull([
    [-2.1, 0.15, -1.8],
    [-2.14, 0.8, -1.8],
    [-1.95, 1.5, -1.76],
    [-2.0, 2.2, -1.8],
  ]);
  b.sweep(trunk, [0.36, 0.27, 0.19, 0.12], { color: BARK });
  for (let k = 0; k < 5; k++) {
    const a = (k * 72 + 20) * (Math.PI / 180);
    const c = Math.cos(a);
    const sn = Math.sin(a);
    b.sweep(
      catmull([
        [-2.1 + c * 0.2, GY + 0.3, -1.8 + sn * 0.2],
        [-2.1 + c * 0.42, GY + 0.1, -1.8 + sn * 0.42],
        [-2.1 + c * 0.7, GY + 0.0, -1.8 + sn * 0.7],
      ]),
      [0.12, 0.03],
      { color: BARK, sides: 6 },
    );
  }
  const branches: V[][] = [
    [
      [-1.95, 1.5, -1.76],
      [-1.6, 1.85, -1.7],
      [-1.2, 2.2, -1.6],
    ],
    [
      [-2.0, 1.9, -1.8],
      [-2.4, 2.1, -2.0],
      [-2.75, 2.4, -2.2],
    ],
    [
      [-2.0, 2.2, -1.8],
      [-2.05, 2.4, -1.5],
      [-2.1, 2.55, -1.15],
    ],
    [
      [-2.0, 2.1, -1.8],
      [-1.8, 2.45, -2.0],
      [-1.55, 2.75, -2.3],
    ],
  ];
  for (const br of branches) b.sweep(catmull(br), [0.1, 0.03], { color: BARK, sides: 6 });
  // rope around the trunk
  const ringPts: V[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ringPts.push([-2.1 + Math.cos(a) * 0.3, 1.2, -1.8 + Math.sin(a) * 0.3]);
  }
  const treeRope = catmull(ringPts, { closed: true });
  b.sweep(treeRope, 0.04, { color: ROPE });
  b.cards(
    [0.1, 0.35, 0.6, 0.85].map((t) => frame(treeRope.at(t), [0, 1, 0])),
    SHIDE,
    { size: [0.09, 0.26], lean: 180, flow: [0, 0, 1], sink: 0, cross: true },
  );
  const CLUMPS: number[][] = [
    [-1.95, 2.55, -1.8, 0.7],
    [-2.75, 2.35, -2.2, 0.55],
    [-1.2, 2.35, -1.6, 0.55],
    [-2.1, 2.4, -1.1, 0.5],
    [-1.55, 2.8, -2.3, 0.5],
    [-2.7, 2.55, -1.4, 0.5],
    [-1.9, 2.95, -1.4, 0.42],
    [-2.9, 1.95, -1.9, 0.35],
  ];
  const canopy = CLUMPS.map(([x, y, z, r], i) =>
    put(new THREE.IcosahedronGeometry(r, 1), PINKS[i % 4], [x, y, z], {
      flat: true,
      rotation: [R() * 60, R() * 60, 0],
      scale: [1, 0.82, 1],
    }),
  );
  const hits = b.surface(canopy).scatter(140, { rng: R, minDist: 0.1, filter: (h: any) => h.n.y > -0.4 });
  b.cards(hits, PETAL, { size: 0.13, lean: 40, vary: 0.3, spin: 180, rng: R });

  // falling petals
  const air: any[] = [];
  for (let i = 0; i < 34; i++) {
    const d: V = [R() - 0.5, R() - 0.5, R() - 0.5];
    air.push(frame([R() * 5.2 - 2.7, 0.5 + R() * 2.7, R() * 4.6 - 2.2], d));
  }
  b.cards(air, PETAL, { size: 0.09, lean: 80, vary: 0.3, spin: 180, rng: R });
  const ground: any[] = [];
  for (let i = 0; i < 30; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.4 + R() * 1.5;
    ground.push(frame([-1.6 + Math.cos(a) * r * 0.9, GY + 0.004, -0.8 + Math.sin(a) * r], [0, 1, 0]));
  }
  b.cards(ground, PETAL, {
    size: 0.08,
    lean: 90,
    flow: (_f: any, i: number) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
    mirror: true,
  });

  // ---------------------------------------------------------------- Electro crystals & motes
  const cluster = (x: number, z: number, k: number) => {
    const specs = [
      [0, 0, 0.55, 0, 0],
      [0.1, 0.06, 0.35, 12, -18],
      [-0.09, 0.05, 0.4, -14, 10],
      [0.02, -0.1, 0.3, 18, 6],
    ];
    for (const [dx, dz, h, rx, rz] of specs)
      glow(
        put(octa(), ELEC, [x + dx * k, GY + h * k * 0.42, z + dz * k], {
          scale: [0.09 * k, (h * k) / 2, 0.09 * k],
          rotation: [rx, 0, rz],
          flat: true,
        }),
        1.3,
      );
    put(ball(0.12 * k, 6, 4), STONE, [x, GY + 0.02, z], { flat: true, scale: [1.3, 0.5, 1.1] });
  };
  cluster(-2.55, 1.0, 1);
  cluster(2.6, 1.35, 1.1);
  for (let i = 0; i < 12; i++)
    glow(
      put(octa(), i % 2 ? ELEC_L : ELEC, [R() * 4.4 - 2.2, 0.7 + R() * 2.4, R() * 3.6 - 1.6], {
        scale: [0.03, 0.045, 0.03],
        rotation: [R() * 90, R() * 90, 0],
        flat: true,
      }),
      1.6,
    );

  // ---------------------------------------------------------------- grass tufts
  const zones: number[][] = [
    [2.0, 1.5, 0.6],
    [-2.0, 1.5, 0.6],
    [1.15, 1.0, 0.35],
    [-1.15, 1.0, 0.35],
    [1.0, -0.1, 0.45],
    [-1.0, -0.1, 0.45],
    [1.95, -1.0, 0.75],
    [2.1, 0.15, 0.8],
    [-2.2, -0.3, 0.7],
    [-2.1, -1.8, 0.85],
    [1.6, 2.15, 0.5],
    [0, 2.62, 0.75],
    [-2.55, 1.0, 0.3],
    [2.6, 1.35, 0.3],
  ];
  const tufts: any[] = [];
  for (let i = 0; i < 400 && tufts.length < 80; i++) {
    const a = R() * Math.PI * 2;
    const r = 1.5 + R() * 1.65;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (Math.abs(x) < 0.65 && z > -0.5) continue;
    if (Math.abs(x) < 1.4 && z < -0.4 && z > -2.5) continue;
    if (zones.some(([zx, zz, zr]) => Math.hypot(x - zx, z - zz) < zr)) continue;
    tufts.push(frame([x, GY - 0.01, z], [0, 1, 0]));
  }
  b.cards(tufts, GRASSTEX, { size: [0.16, 0.22], vary: 0.35, cross: true, rng: R, spin: 180 });

  return b.root;
}
```