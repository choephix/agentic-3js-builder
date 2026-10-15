import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  paint,
  mottle,
  stripes,
  grain,
  spots,
  noise,
  svg,
  catmull,
} from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Inazuma Roadside Shrine",
  description:
    "A stylized roadside shrine: vermilion torii with black kasagi and plaque, a pair of glowing stone lanterns, a small hokora with shimenawa and shide, an offering table, an ema rack, an Electro crystal and a sakura tree, on a stone platform.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const G = 0.21; // ground level of the gravel court
const INKP = "#2b2030";
const GOLD = "#e8b84a";
const GOLD_D = "#b98a2e";
const CREAM = "#efe2c0";
const WOOD_L = "#c79a64";
const WOOD_D = "#6a4430";
const SLATE = "#4c4f86";
const AMBER = "#ffc24a";
const ELEC = "#b46bff";
const RED = "#c7372b";
const WHITE = "#f8f4ec";

// ---------------------------------------------------------------------------------------------------------------
// Textures
const flower = (cx: number, cy: number, r: number) =>
  Array.from(
    { length: 5 },
    (_, i) =>
      `<ellipse cx="${cx}" cy="${cy - r * 0.55}" rx="${r * 0.42}" ry="${r * 0.6}" transform="rotate(${i * 72} ${cx} ${cy})" fill="#ffc6d8" stroke="#ec7fa6" stroke-width="1.6"/>`,
  ).join("") + `<circle cx="${cx}" cy="${cy}" r="${r * 0.2}" fill="#ffe27a"/>`;

const BOLT = "M56 14 L30 54 H46 L40 88 L72 44 H54 Z";

const tex = {
  plaque: () =>
    svg(
      `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="80" fill="#241a2e"/>
        <rect x="3" y="3" width="54" height="74" fill="none" stroke="#e8b84a" stroke-width="3"/>
        <path d="M13 15 H47" stroke="#e8b84a" stroke-width="4" stroke-linecap="round"/>
        <circle cx="30" cy="42" r="16" fill="none" stroke="#e8b84a" stroke-width="3"/>
        <g transform="translate(-10 -4) scale(0.66)"><path d="${BOLT}" fill="#e8b84a" stroke="#fff0b0" stroke-width="2" stroke-linejoin="round"/></g>
        <path d="M13 69 H47" stroke="#e8b84a" stroke-width="3" stroke-linecap="round"/>
        <circle cx="12" cy="12" r="1.8" fill="#e8b84a"/><circle cx="48" cy="12" r="1.8" fill="#e8b84a"/>
      </svg>`,
      { size: 192 },
    ),
  window: () =>
    svg(
      `<svg viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="w" cx="0.5" cy="0.62" r="0.7"><stop offset="0" stop-color="#fff3b0"/><stop offset="0.55" stop-color="#ffc24a"/><stop offset="1" stop-color="#ff8a2a"/></radialGradient></defs>
        <path d="M4 46 L4 18 Q4 4 20 3 Q36 4 36 18 L36 46 Z" fill="url(#w)" stroke="#4a2a1a" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M20 3 V46 M4 26 H36" stroke="#6a3a1c" stroke-width="2.2"/>
        <path d="M20 39 Q11 31 16 22 Q18 27 21 25 Q22 18 26 14 Q31 24 28 31 Q27 38 20 39Z" fill="#fff8d0"/>
      </svg>`,
      { size: 192 },
    ),
  sigil: () =>
    svg(
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="47" fill="#2a1450" stroke="#d9b8ff" stroke-width="4"/>
        <circle cx="50" cy="50" r="37" fill="none" stroke="#b46bff" stroke-width="3"/>
        ${Array.from({ length: 12 }, (_, i) => `<path d="M50 5 V13" stroke="#d9b8ff" stroke-width="3.5" transform="rotate(${i * 30} 50 50)"/>`).join("")}
        <path d="${BOLT}" fill="#e6d0ff" stroke="#7c3cff" stroke-width="3" stroke-linejoin="round"/>
      </svg>`,
      { size: 192 },
    ),
  shide: () =>
    svg(
      `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 98 L26 98 L30 80 L34 60 L28 45 L36 32 L26 20 L33 6 L20 1 L7 6 L14 20 L4 32 L12 45 L6 60 L10 80 Z" fill="#fdfdfb" stroke="#b9bfd2" stroke-width="2" stroke-linejoin="round"/>
        <path d="M20 96 V6 M13 58 L27 58 M11 36 L29 36" stroke="#c9cfe0" stroke-width="1.6" fill="none"/>
        <rect x="13" y="90" width="14" height="9" rx="2" fill="#c7372b"/>
      </svg>`,
      { size: 160 },
    ),
  blossom: () =>
    svg(`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${flower(20, 22, 14)}${flower(44, 26, 13)}${flower(30, 46, 15)}</svg>`, {
      size: 160,
    }),
  petal: () =>
    svg(
      `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 2 Q30 10 26 22 Q20 30 16 30 Q12 30 6 22 Q2 10 16 2Z" fill="#ffc2d6" stroke="#f08cb0" stroke-width="1.5"/><path d="M16 2 L16 10" stroke="#f08cb0" stroke-width="1.5"/></svg>`,
      { size: 64 },
    ),
  lattice: () => {
    let s = "";
    for (let i = 1; i < 5; i++) s += `<path d="M${i * 12} 4 V76" stroke="#7a4a2c" stroke-width="2.2"/>`;
    for (let i = 1; i < 5; i++) s += `<path d="M4 ${i * 16} H56" stroke="#7a4a2c" stroke-width="2.2"/>`;
    return svg(
      `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="1.5" width="57" height="77" rx="3" fill="#f3e6c4" stroke="#6b3b24" stroke-width="3"/>${s}<circle cx="49" cy="40" r="2.6" fill="#e8b84a"/></svg>`,
      { size: 160 },
    );
  },
  sake: () =>
    svg(
      `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="44" height="60" rx="3" fill="#f6efdc" stroke="#7a2a2a" stroke-width="3"/><circle cx="24" cy="24" r="11" fill="#c7372b"/><path d="M12 45 H36 M12 53 H36" stroke="#2b2030" stroke-width="3" stroke-linecap="round"/></svg>`,
      { size: 128 },
    ),
  crest: () =>
    svg(
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="44" fill="#2b2030" stroke="#e8b84a" stroke-width="7"/><path d="${BOLT}" fill="#e8b84a" stroke="#fff0b0" stroke-width="3" stroke-linejoin="round"/></svg>`,
      { size: 128 },
    ),
  slab: () =>
    svg(
      `<svg viewBox="0 0 90 50" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="1.5" width="87" height="47" rx="6" fill="#a6a79b" stroke="#6f7569" stroke-width="2.5"/><path d="M18 4 L24 18 L20 30 L30 46 M60 46 L56 34 L66 26" stroke="#6f7569" stroke-width="2" fill="none"/><ellipse cx="68" cy="13" rx="14" ry="7" fill="#7aa65a" opacity="0.85"/><ellipse cx="15" cy="40" rx="9" ry="5" fill="#6e9a4c" opacity="0.9"/></svg>`,
      { size: 192 },
    ),
  fox: () =>
    svg(
      `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 8 L20 20 Q30 16 40 20 L54 8 L52 34 Q48 54 30 56 Q12 54 8 34 Z" fill="#f2a04a" stroke="#3a2030" stroke-width="3" stroke-linejoin="round"/>
        <path d="M12 36 Q30 62 48 36 Q40 48 30 48 Q20 48 12 36Z" fill="#ffffff"/>
        <path d="M15 31 Q20 26 25 31 M35 31 Q40 26 45 31" stroke="#3a2030" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M20 22 L24 26 M40 22 L36 26" stroke="#d6402a" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="30" cy="44" r="3" fill="#3a2030"/>
      </svg>`,
      { size: 128 },
    ),
};

// ---------------------------------------------------------------------------------------------------------------
// Paints
const MOSS = mottle("#82b455", "#5f9444", { size: 0.09, seed: 3 });
const stone = (seed: number) => {
  const base = mottle("#aeb0a3", "#8c9793", { size: 0.22, seed });
  return cel(
    paint((p, n) => {
      if (n.y > 0.55 && noise(p, 0.16, seed + 5) > 0.56) return MOSS;
      if (p.y < G + 0.1 && noise(p, 0.11, seed + 9) > 0.48) return "#718259";
      return base;
    }),
  );
};
const VERM_V = cel(grain("#d23c28", "#e8573a", { size: 0.07, axis: "y", seed: 2 }));
const VERM_H = cel(grain("#d23c28", "#e8573a", { size: 0.07, axis: "x", seed: 2 }));
const KASAGI = cel(grain("#34283f", "#241a2e", { size: 0.06, axis: "x", seed: 5 }));
const WOOD = cel(grain("#9a6a40", "#7c5230", { size: 0.05, axis: "x", seed: 6 }));
const WOOD_V = cel(grain("#9a6a40", "#7c5230", { size: 0.05, axis: "y", seed: 7 }));
const PLASTER = cel(mottle("#f0e4c4", "#e3d3a8", { size: 0.2, seed: 11 }));
const ROOF = cel(stripes("#4c4f86", "#363a6a", { size: 0.075, axis: "x", width: 0.25, wobble: 0.05, seed: 3 }));
const GRAVEL = spots(mottle("#d8cfb8", "#bdb297", { size: 0.1, seed: 4 }), "#a09580", { size: 0.05, amount: 0.45, seed: 2 });
const PINK = cel(mottle("#ffb6cc", "#ff94b6", { size: 0.3, seed: 8 }));
const BARK = cel(grain("#5b4046", "#493238", { size: 0.05, axis: "y", seed: 9 }));
const CLOTH = stripes("#8e2a3a", GOLD, { size: 0.05, axis: "x", width: 0.12, wobble: 0, seed: 1 });
const BELLROPE = stripes(RED, WHITE, { size: 0.045, axis: "y", width: 0.5, wobble: 0, seed: 1 });
const RICEROPE = paint((_p, _n, s) => ((((s[1] - 4000 * s[0]) % 90) + 90) % 90 < 45 ? "#e6cf8e" : "#b89a50"));

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "roadside_shrine" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const rnd = rng(7);

  // ---- helpers -----------------------------------------------------------------------------------------------
  const P = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(geo, color, { bone: root, at, ...o });
  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), c, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, c: any, at: number[], o: any = {}) =>
    P(new THREE.CylinderGeometry(rt, rb, h, seg), c, at, { flat: true, ...o });
  const ball = (r: number, c: any, at: number[], o: any = {}) =>
    P(new THREE.SphereGeometry(r, 8, 6), c, at, { flat: true, ...o });
  const rod = (a: number[], c: number[], r: any, color: any, o: any = {}) =>
    b.rod(a, c, r, { color, bone: root, ...o });
  const lathe = (outline: any, at: number[], color: any, o: any = {}) =>
    b.lathe(outline, { at, color, bone: root, ...o });
  const tile = (t: any, w: number, h: number, at: number[], dir: number[], o: any = {}) =>
    P(new THREE.PlaneGeometry(w, h), "#ffffff", at, { texture: t, dir, axis: "z", ...o });
  const ring = (r: number, tube: number, c: any, at: number[], o: any = {}) =>
    P(new THREE.TorusGeometry(r, tube, 5, 12), c, at, { rotation: [90, 0, 0], ...o });

  const T = {
    plaque: tex.plaque(),
    window: tex.window(),
    sigil: tex.sigil(),
    shide: tex.shide(),
    blossom: tex.blossom(),
    petal: tex.petal(),
    lattice: tex.lattice(),
    sake: tex.sake(),
    crest: tex.crest(),
    slab: tex.slab(),
    fox: tex.fox(),
  };

  // ---- base platform ------------------------------------------------------------------------------------------
  const BASE = stone(1);
  const BORD = stone(21);
  box(5.4, 0.16, 4.6, BASE, [0, 0.08, 0]);
  for (const z of [2.19, -2.19]) box(5.4, 0.06, 0.22, BORD, [0, 0.19, z]);
  for (const x of [2.59, -2.59]) box(0.22, 0.06, 4.16, BORD, [x, 0.19, 0]);
  box(4.96, 0.05, 4.16, GRAVEL, [0, 0.185, 0]);
  // corner bollards with pyramid caps
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(0.26, 0.34, 0.26, BORD, [sx * 2.59, 0.33, sz * 2.19]);
      P(new THREE.ConeGeometry(0.19, 0.14, 4), BORD, [sx * 2.59, 0.57, sz * 2.19], { rotation: [0, 45, 0], flat: true });
    }
  // front steps
  box(1.6, 0.13, 0.2, BASE, [0, 0.065, 2.4]);
  box(1.8, 0.07, 0.3, BASE, [0, 0.035, 2.65]);
  // stepping slabs
  [2.05, 1.55, 1.05, 0.6].forEach((z, i) => {
    const x = (rnd() - 0.5) * 0.06;
    box(0.95, 0.04, 0.5, stone(30 + i), [x, G + 0.02, z]);
    tile(T.slab, 0.9, 0.48, [x, G + 0.0415, z], [0, 1, 0], { up: [0, 0, i % 2 ? 1 : -1] });
  });

  // ---- torii --------------------------------------------------------------------------------------------------
  const TZ = 1.3;
  const PX = 1.45;
  for (const s of [1, -1]) {
    const x = s * PX;
    cyl(0.28, 0.31, 0.2, 8, stone(40 + s), [x, G + 0.1, TZ]); // footing
    rod([x, G + 0.18, TZ], [x, G + 3.0, TZ], [0.17, 0.14], VERM_V, { sides: 10 });
    cyl(0.188, 0.19, 0.5, 10, INKP, [x, G + 0.45, TZ]); // black kamebara
    cyl(0.195, 0.195, 0.035, 10, GOLD, [x, G + 0.72, TZ]);
    cyl(0.16, 0.16, 0.05, 10, GOLD, [x, G + 2.8, TZ]);
    // wedges under the nuki
    for (const d of [0.2, -0.2]) box(0.1, 0.2, 0.24, INKP, [x + d, G + 2.06, TZ]);
    // kasagi tip fittings
    box(0.05, 0.38, 0.42, GOLD, [s * 2.2, G + 3.1 + 0.28, TZ], { rotation: [0, 0, -s * 40] });
    ball(0.045, GOLD_D, [s * 2.29, G + 3.1 + 0.4, TZ + 0.2]);
    ball(0.045, GOLD_D, [s * 2.29, G + 3.1 + 0.4, TZ - 0.2]);
  }
  box(3.5, 0.16, 0.2, VERM_H, [0, G + 2.2, TZ]); // nuki
  box(4.0, 0.16, 0.3, VERM_H, [0, G + 2.9, TZ]); // shimaki
  const kasagi: any = [
    [-2.3, 0.4, "sharp"], [-1.7, 0.2], [-0.8, 0.13], [0, 0.12], [0.8, 0.13], [1.7, 0.2], [2.3, 0.4, "sharp"],
    [2.1, 0.16, "sharp"], [1.6, 0.02], [0.8, -0.08], [0, -0.1], [-0.8, -0.08], [-1.6, 0.02], [-2.1, 0.16, "sharp"],
  ];
  b.extrude(kasagi, { at: [0, G + 3.1, TZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.38, bevel: 0.03, color: KASAGI, bone: root });
  // plaque (gakuzuka)
  box(0.48, 0.6, 0.08, GOLD, [0, G + 2.55, TZ]);
  box(0.42, 0.54, 0.12, INKP, [0, G + 2.55, TZ]);
  tile(T.plaque, 0.38, 0.5, [0, G + 2.55, TZ + 0.063], [0, 0, 1]);
  tile(T.plaque, 0.38, 0.5, [0, G + 2.55, TZ - 0.063], [0, 0, -1]);
  // hanging paper lanterns
  const chochin = (x: number, y: number, z: number) => {
    rod([x, G + 2.12, z], [x, y + 0.33, z], 0.01, INKP);
    cyl(0.07, 0.07, 0.03, 8, GOLD_D, [x, y + 0.335, z]);
    cyl(0.07, 0.07, 0.03, 8, GOLD_D, [x, y - 0.005, z]);
    const body = lathe(
      [[0, 0], [0.06, 0], [0.1, 0.03], [0.15, 0.1], [0.16, 0.16], [0.15, 0.22], [0.1, 0.29], [0.06, 0.32], [0, 0.32]],
      [x, y, z],
      "#e8553a",
      { segments: 10 },
    );
    glow(body, 0.6);
    for (const yy of [0.08, 0.16, 0.24]) ring(0.16 - Math.abs(yy - 0.16) * 0.5, 0.008, INKP, [x, y + yy, z]);
    for (const d of [1, -1]) b.decal(body, T.crest, { at: [x, y + 0.16, z + d * 0.17], dir: [0, 0, d], size: [0.15, 0.15] });
    // tassel
    rod([x, y - 0.02, z], [x, y - 0.12, z], [0.012, 0.004], GOLD);
  };
  chochin(0.78, G + 1.7, TZ);
  chochin(-0.78, G + 1.7, TZ);

  // ---- stone lanterns ----------------------------------------------------------------------------------------
  const lantern = (x: number, z: number, seed: number) => {
    const S = stone(seed);
    let y = G;
    cyl(0.3, 0.34, 0.1, 6, S, [x, y + 0.05, z]);
    y += 0.1;
    cyl(0.15, 0.22, 0.12, 6, S, [x, y + 0.06, z]);
    y += 0.12;
    cyl(0.09, 0.1, 0.44, 8, S, [x, y + 0.22, z]);
    cyl(0.135, 0.135, 0.05, 8, S, [x, y + 0.22, z]);
    y += 0.44;
    lathe([[0, 0], [0.14, 0], [0.29, 0.04], [0.32, 0.09], [0.1, 0.09], [0, 0.09]], [x, y, z], S, { segments: 8 });
    y += 0.09;
    box(0.3, 0.3, 0.3, S, [x, y + 0.15, z]);
    const dirs = [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0]];
    for (const d of dirs) {
      const w = tile(T.window, 0.19, 0.22, [x + d[0] * 0.154, y + 0.15, z + d[2] * 0.154], d);
      glow(w, 1.3);
    }
    y += 0.3;
    box(0.4, 0.05, 0.4, S, [x, y + 0.025, z]);
    y += 0.05;
    lathe([[0, 0], [0.48, 0], [0.48, 0.03], [0.32, 0.07], [0.13, 0.24], [0, 0.27]], [x, y, z], S, { segments: 4, spin: 45 });
    for (const sx of [1, -1])
      for (const sz of [1, -1])
        b.spike([x + sx * 0.33, y + 0.03, z + sz * 0.33], [sx * 0.5, 1, sz * 0.5], 0.1, 0.035, { color: S, bone: root });
    y += 0.27;
    lathe([[0, 0], [0.08, 0], [0.1, 0.05], [0.06, 0.12], [0, 0.14]], [x, y, z], S, { segments: 8 });
    glow(ball(0.055, "#ffd05a", [x, y + 0.17, z]), 1.6);
  };
  lantern(1.0, 0.25, 50);
  lantern(-1.0, 0.25, 53);

  // ---- hokora (small shrine) ---------------------------------------------------------------------------------
  const z0 = -1.35;
  const Yb = G + 0.36;
  const Yt = Yb + 0.8;
  const PLAT = stone(60);
  box(1.5, 0.32, 1.1, PLAT, [0, G + 0.16, z0]);
  box(1.4, 0.04, 1.0, WOOD, [0, G + 0.34, z0]);
  box(0.9, 0.22, 0.2, PLAT, [0, G + 0.11, -0.7]);
  box(0.9, 0.14, 0.16, PLAT, [0, G + 0.07, -0.52]);
  box(0.9, 0.07, 0.12, PLAT, [0, G + 0.035, -0.38]);
  // body
  box(0.9, 0.8, 0.74, PLASTER, [0, Yb + 0.4, z0]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.08, 0.8, 0.08, VERM_V, [sx * 0.47, Yb + 0.4, z0 + sz * 0.39]);
  box(1.0, 0.08, 0.84, VERM_H, [0, Yt - 0.04, z0]);
  box(1.0, 0.06, 0.84, VERM_H, [0, Yb + 0.03, z0]);
  box(0.84, 0.6, 0.02, INKP, [0, Yb + 0.38, z0 + 0.375]);
  // doors on hinges
  for (const s of [1, -1]) {
    const hinge = b.joint(s > 0 ? "doorL" : "doorR", {
      parent: root,
      at: [s * 0.42, Yb + 0.38, z0 + 0.385],
      role: "hinge",
    });
    box(0.4, 0.56, 0.03, CREAM, [s * 0.21, Yb + 0.38, z0 + 0.385], { bone: hinge });
    tile(T.lattice, 0.37, 0.52, [s * 0.21, Yb + 0.38, z0 + 0.403], [0, 0, 1], { bone: hinge });
    ball(0.016, GOLD, [s * 0.05, Yb + 0.38, z0 + 0.41], { bone: hinge });
    // side window
    tile(T.lattice, 0.4, 0.36, [s * 0.452, Yb + 0.42, z0], [s, 0, 0]);
  }
  // roof
  const roofOutline: any = [
    [-0.75, 0.03, "sharp"], [-0.45, 0.12], [-0.2, 0.32], [0, 0.46, "sharp"], [0.2, 0.32], [0.45, 0.12],
    [0.75, 0.03, "sharp"], [0.7, -0.02, "sharp"], [-0.7, -0.02, "sharp"],
  ];
  b.extrude(roofOutline, { at: [0, Yt, z0], x: [1, 0, 0], y: [0, 1, 0], thickness: 1.24, bevel: 0.015, color: ROOF, bone: root });
  rod([0, Yt + 0.47, z0 - 0.64], [0, Yt + 0.47, z0 + 0.64], 0.045, INKP, { sides: 6 });
  const gable: any = [[-0.55, 0.06], [-0.38, 0.14], [-0.18, 0.3], [0, 0.4], [0.18, 0.3], [0.38, 0.14], [0.55, 0.06]];
  for (const s of [1, -1]) {
    const zf = z0 + s * 0.62;
    b.extrude(gable, { at: [0, Yt, zf + s * 0.011], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.022, color: CREAM, bone: root });
    tile(T.crest, 0.2, 0.2, [0, Yt + 0.2, zf + s * 0.024], [0, 0, s]);
    for (const sx of [1, -1]) {
      b.spike([sx * 0.03, Yt + 0.45, zf], [sx * 0.5, 1, s * 0.15], 0.3, 0.03, { color: GOLD, bone: root });
      ball(0.04, GOLD, [sx * 0.74, Yt + 0.04, zf]);
    }
  }
  // shimenawa with shide
  const zr = z0 + 0.45;
  const ropeP = catmull([
    [-0.56, Yt - 0.09, zr], [-0.3, Yt - 0.17, zr], [0, Yt - 0.2, zr], [0.3, Yt - 0.17, zr], [0.56, Yt - 0.09, zr],
  ]);
  b.sweep(ropeP, 0.03, { color: RICEROPE, bone: root, sides: 6 });
  for (const s of [1, -1]) {
    ball(0.04, WOOD_D, [s * 0.57, Yt - 0.09, zr]);
    rod([s * 0.57, Yt - 0.09, zr], [s * 0.57, Yt - 0.09, zr - 0.06], 0.012, WOOD_D);
  }
  const shideFrames = [0.12, 0.3, 0.5, 0.7, 0.88].map((t) => {
    const p = ropeP.at(t);
    return frame([p.x, p.y - 0.02, p.z + 0.03], [0, 1, 0]);
  });
  b.cards(shideFrames, T.shide, { size: [0.09, 0.2], lean: 180, flow: [0, 0, 1], bone: root });
  // bell and bell rope
  const bell = b.joint("bell", { parent: root, at: [0.6, 1.35, z0 + 0.55], role: "hinge" });
  b.rod([0.6, 1.35, z0 + 0.55], [0.6, 1.08, z0 + 0.55], 0.018, { color: BELLROPE, bone: bell, sides: 6 });
  ball(0.075, GOLD, [0.6, 1.0, z0 + 0.55], { bone: bell });
  box(0.09, 0.012, 0.02, INKP, [0.6, 0.98, z0 + 0.625], { bone: bell });
  ring(0.03, 0.008, GOLD_D, [0.6, 1.08, z0 + 0.55], { bone: bell });
  ball(0.02, GOLD_D, [0.6, 0.93, z0 + 0.55], { bone: bell });

  // ---- offering table ----------------------------------------------------------------------------------------
  const tz = 0.15;
  const yt = G + 0.47;
  box(0.9, 0.05, 0.46, WOOD, [0, G + 0.445, tz]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.05, 0.42, 0.05, WOOD_V, [sx * 0.4, G + 0.21, tz + sz * 0.19]);
  box(0.82, 0.03, 0.05, WOOD, [0, G + 0.14, tz + 0.19]);
  box(0.82, 0.03, 0.05, WOOD, [0, G + 0.14, tz - 0.19]);
  box(0.6, 0.012, 0.44, CLOTH, [0, yt + 0.006, tz]);
  // sigil plate (glow)
  box(0.12, 0.03, 0.08, WOOD_D, [0, yt + 0.027, tz - 0.12]);
  cyl(0.14, 0.14, 0.025, 14, INKP, [0, yt + 0.17, tz - 0.12], { rotation: [90, 0, 0] });
  glow(tile(T.sigil, 0.25, 0.25, [0, yt + 0.17, tz - 0.12 + 0.015], [0, 0, 1]), 1.2);
  // fruit stand
  const fx = -0.3;
  box(0.2, 0.06, 0.2, WOOD_D, [fx, yt + 0.03 + 0.012, tz + 0.02]);
  box(0.3, 0.025, 0.3, WOOD_L, [fx, yt + 0.0725 + 0.012, tz + 0.02]);
  const fy = yt + 0.085 + 0.012 + 0.055;
  [[1, 1, RED], [-1, 1, "#ff9a2e"], [1, -1, "#ff9a2e"], [-1, -1, RED]].forEach(([sx, sz, c]) => {
    ball(0.058, c as string, [fx + (sx as number) * 0.065, fy, tz + 0.02 + (sz as number) * 0.065]);
  });
  ball(0.058, RED, [fx, fy + 0.085, tz + 0.02]);
  b.spike([fx, fy + 0.135, tz + 0.02], [0.3, 1, 0], 0.05, 0.012, { color: "#4f8a3c", bone: root });
  // sake cask
  const cx = 0.3;
  const cask = lathe(
    [[0, 0], [0.15, 0], [0.18, 0.05], [0.2, 0.2], [0.18, 0.35], [0.15, 0.4], [0, 0.4]],
    [cx, yt + 0.012, tz],
    WOOD_V,
    { segments: 12 },
  );
  for (const yy of [0.07, 0.33]) ring(0.19, 0.012, GOLD_D, [cx, yt + 0.012 + yy, tz]);
  b.decal(cask, T.sake, { at: [cx, yt + 0.21, tz + 0.23], dir: [0, 0, 1], size: [0.15, 0.2] });
  // kagami mochi
  cyl(0.12, 0.12, 0.02, 10, "#d7e4ee", [0.0, yt + 0.022, tz + 0.15]);
  P(new THREE.SphereGeometry(0.075, 8, 6), WHITE, [0, yt + 0.065, tz + 0.15], { scale: [1, 0.55, 1], flat: true });
  P(new THREE.SphereGeometry(0.052, 8, 6), WHITE, [0, yt + 0.115, tz + 0.15], { scale: [1, 0.55, 1], flat: true });
  ball(0.03, "#ff9a2e", [0, yt + 0.15, tz + 0.15]);
  b.spike([0, yt + 0.175, tz + 0.15], [0.5, 1, 0], 0.04, 0.01, { color: "#4f8a3c", bone: root });
  // dango
  cyl(0.05, 0.04, 0.08, 8, "#b5865a", [0.13, yt + 0.052, tz + 0.15]);
  const skewer = (d: THREE.Vector3) => {
    d.normalize();
    const bx = 0.13;
    const by = yt + 0.06;
    const bz = tz + 0.15;
    rod([bx, by, bz], [bx + d.x * 0.3, by + d.y * 0.3, bz + d.z * 0.3], 0.006, "#d9c08a", { sides: 4 });
    ["#f4a0b8", WHITE, "#9fcf7a"].forEach((c, k) => {
      const t = 0.12 + 0.075 * k;
      ball(0.034, c, [bx + d.x * t, by + d.y * t, bz + d.z * t]);
    });
  };
  skewer(new THREE.Vector3(0.3, 1, 0));
  skewer(new THREE.Vector3(-0.3, 1, 0.12));

  // ---- Electro crystal ---------------------------------------------------------------------------------------
  const cj = b.joint("crystal", { parent: root, at: [1.55, G + 1.05, 0.3] });
  glow(
    P(new THREE.OctahedronGeometry(0.14, 0), ELEC, [1.55, G + 1.05, 0.3], { scale: [0.7, 1.35, 0.7], flat: true, bone: cj }),
    1.6,
  );
  [0, 1, 2].forEach((i) => {
    const a = i * 2.1 + 0.4;
    glow(
      P(new THREE.OctahedronGeometry(0.045, 0), "#d9b8ff", [1.55 + Math.cos(a) * 0.26, G + 1.0 + i * 0.08, 0.3 + Math.sin(a) * 0.26], {
        scale: [0.7, 1.3, 0.7],
        flat: true,
        bone: cj,
      }),
      1.4,
    );
  });
  cyl(0.1, 0.13, 0.04, 8, stone(70), [1.55, G + 0.02 + 0.0, 0.3]);

  // ---- ema rack ----------------------------------------------------------------------------------------------
  const ez = -0.3;
  for (const x of [1.55, 2.45]) rod([x, G, ez], [x, G + 1.05, ez], 0.045, WOOD_V, { sides: 6 });
  box(0.98, 0.05, 0.05, WOOD, [2.0, G + 0.95, ez]);
  const rr: any = [[-0.62, 0], [0, 0.2], [0.62, 0]];
  b.extrude(rr, { at: [2.0, G + 1.04, ez], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.34, color: ROOF, bone: root });
  [1.7, 2.0, 2.3].forEach((x, i) => {
    const y = G + 0.58 - (i === 1 ? 0.03 : 0);
    rod([x - 0.05, G + 0.93, ez + 0.01], [x - 0.04, y + 0.2, ez + 0.01], 0.006, INKP, { sides: 4 });
    rod([x + 0.05, G + 0.93, ez + 0.01], [x + 0.04, y + 0.2, ez + 0.01], 0.006, INKP, { sides: 4 });
    const ema: any = [[-0.1, 0], [0.1, 0], [0.1, 0.15], [0, 0.23], [-0.1, 0.15]];
    b.extrude(ema, { at: [x, y, ez], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.016, bevel: 0.003, color: WOOD_L, bone: root });
    tile(T.fox, 0.17, 0.17, [x, y + 0.1, ez + 0.0095], [0, 0, 1]);
  });

  // ---- sakura ------------------------------------------------------------------------------------------------
  const tx = -2.05;
  const tzz = -1.75;
  b.sweep(
    catmull([
      [tx, G - 0.02, tzz], [tx + 0.04, G + 0.55, tzz + 0.02], [tx - 0.08, G + 1.1, tzz], [tx + 0.02, G + 1.65, tzz - 0.03],
    ]),
    [0.2, 0.09],
    { color: BARK, bone: root, sides: 8 },
  );
  const branches = [
    [[tx - 0.05, G + 1.0, tzz], [tx - 0.4, G + 1.35, tzz + 0.1], [tx - 0.7, G + 1.7, tzz + 0.12]],
    [[tx, G + 1.2, tzz], [tx + 0.35, G + 1.6, tzz + 0.1], [tx + 0.65, G + 1.95, tzz + 0.16]],
    [[tx, G + 1.3, tzz], [tx + 0.1, G + 1.75, tzz - 0.35], [tx + 0.1, G + 2.05, tzz - 0.6]],
    [[tx, G + 1.3, tzz], [tx + 0.05, G + 1.7, tzz + 0.4], [tx + 0.15, G + 2.0, tzz + 0.55]],
  ];
  for (const br of branches) b.sweep(catmull(br), [0.06, 0.02], { color: BARK, bone: root, sides: 6 });
  const blobsDef = [
    [-0.64, 1.8, 0.1, 0.55], [0.64, 2.0, 0.2, 0.55], [0.08, 2.35, 0.0, 0.65], [-0.16, 1.95, -0.56, 0.5],
    [0.16, 1.85, 0.5, 0.5], [-0.4, 2.2, 0.3, 0.45], [0.44, 2.35, -0.3, 0.45],
  ];
  const blobs = blobsDef.map(([dx, dy, dz, r]) =>
    P(new THREE.IcosahedronGeometry(r, 1), PINK, [tx + dx, G + dy, tzz + dz], { flat: true }),
  );
  const hits = b.surface(blobs).scatter(110, { rng: rnd, minDist: 0.13, filter: (h: any) => h.n.y > -0.3 });
  b.cards(hits, T.blossom, { size: [0.22, 0.22], lean: 70, vary: 0.3, rng: rnd, bone: root });
  // fallen petals
  const fallen = Array.from({ length: 36 }, () =>
    frame([-2.4 + rnd() * 4.2, G + 0.003, -2.0 + rnd() * 3.6], [0, 1, 0]),
  );
  b.cards(fallen, T.petal, {
    size: 0.07,
    lean: 90,
    flow: (_f: any, i: number) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
    bone: root,
    mirror: true,
  });

  return b.root;
}
