```ts
import * as THREE from "three";
import { catmull, createBuilder, DEG, frame, grain, mix, mottle, noise, paint, rng, svg } from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Inazuma Roadside Shrine",
  description:
    "A cel-shaded roadside shrine in the style of Genshin Impact's Inazuma: a vermilion torii with shide rope and glowing paper lanterns, a hokora shrine with offerings, stone toro lanterns, kitsune guardians, an ema rack, a sakura tree and Electro crystals on a small mossy plot.",
};

type V = [number, number, number];
type Opt = { rot?: V; flat?: boolean; tex?: THREE.Texture; scale?: V };
type Outline = Array<[number, number] | [number, number, "sharp"]>;

const TAU = Math.PI * 2;
const sq = (x: number) => x * x;

const PURPLE = "#b57cff";
const PURPLE_L = "#d9bcff";
const AMBER = "#ffc55e";

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const lanternSvg = () => {
  let ribs = "";
  for (let y = 18; y < 114; y += 12) ribs += `<path d="M0 ${y}H128" stroke="#b92f1f" stroke-width="2.5"/>`;
  return svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" fill="#ff7a3f"/>
      <rect y="30" width="128" height="68" fill="#ffa35a" opacity="0.6"/>
      ${ribs}
      <rect width="128" height="12" fill="#2b1b22"/><rect y="116" width="128" height="12" fill="#2b1b22"/>
      <rect y="12" width="128" height="3" fill="#f0be4a"/><rect y="113" width="128" height="3" fill="#f0be4a"/>
      <circle cx="64" cy="64" r="27" fill="#fff1c9" stroke="#2b1b22" stroke-width="4"/>
      <path d="M71 40 L52 69 L63 69 L56 90 L79 59 L67 59 Z" fill="#7a3fd0" stroke="#3b1c7a" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,
    { size: 256 },
  );
};

const shideSvg = () =>
  svg(
    `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M27 100 L27 88 L37 76 L21 64 L37 52 L21 40 L37 28 L21 16 L27 2 L13 2 L7 16 L23 28 L7 40 L23 52 L7 64 L23 76 L13 88 L13 100 Z"
        fill="#fbfaf2" stroke="#c9c2e6" stroke-width="2" stroke-linejoin="round"/>
      <path d="M13 76 L27 64 M13 52 L27 40 M13 28 L27 16" stroke="#d8d2ee" stroke-width="1.5" fill="none"/>
    </svg>`,
    { size: 192 },
  );

const plaqueSvg = () =>
  svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="57" height="77" rx="3" fill="#1f2a55" stroke="#e8b84a" stroke-width="3"/>
      <rect x="6" y="6" width="48" height="68" fill="none" stroke="#e8b84a" stroke-width="1.4"/>
      <circle cx="30" cy="17" r="7.5" fill="none" stroke="#c79bff" stroke-width="2"/>
      <path d="M32 11 L26 18 L30 18 L28 24 L35 16 L31 16Z" fill="#c79bff"/>
      <g stroke="#f4d37a" stroke-width="3.4" stroke-linecap="round" fill="none">
        <path d="M16 34 H44 M30 30 V62 M18 46 H42 M20 60 Q30 68 42 58"/>
        <path d="M22 54 L16 66 M38 54 L44 66"/>
      </g>
    </svg>`,
    { size: 192 },
  );

const emaSvg = (inner: string) =>
  svg(
    `<svg viewBox="0 0 64 52" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="61" height="49" rx="5" fill="#e6b980" stroke="#6b4228" stroke-width="3"/>
      ${inner}
    </svg>`,
    { size: 128 },
  );

const foxEma = () =>
  emaSvg(`
    <path d="M12 8 L22 20 Q32 16 42 20 L52 8 L50 34 Q32 50 14 34 Z" fill="#fff4e6" stroke="#8a2a2a" stroke-width="2" stroke-linejoin="round"/>
    <path d="M14 12 L21 20 L15 24Z M50 12 L43 20 L49 24Z" fill="#d23d2f"/>
    <path d="M18 27 L26 30 M46 27 L38 30" stroke="#d23d2f" stroke-width="3" stroke-linecap="round"/>
    <path d="M25 32 L39 32 L32 40Z" fill="#2c2433"/>
    <path d="M22 26 L27 27 M42 26 L37 27" stroke="#2c2433" stroke-width="2" stroke-linecap="round"/>`);

const flowerEma = () => {
  let petals = "";
  for (let i = 0; i < 5; i++)
    petals += `<ellipse cx="32" cy="14" rx="8" ry="11" fill="#f9b3cd" stroke="#d96b98" stroke-width="1.5" transform="rotate(${i * 72} 32 26)"/>`;
  return emaSvg(`${petals}<circle cx="32" cy="26" r="5" fill="#ffd966" stroke="#c98b2a" stroke-width="1.5"/>`);
};

const boltEma = () =>
  emaSvg(`
    <circle cx="32" cy="26" r="19" fill="#3b2a78" stroke="#c79bff" stroke-width="3"/>
    <path d="M36 9 L22 29 L31 29 L26 44 L43 22 L34 22 Z" fill="#ffe27a" stroke="#c98b2a" stroke-width="1.5" stroke-linejoin="round"/>`);

const shojiSvg = () =>
  svg(
    `<svg viewBox="0 0 64 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="100" fill="#5b3a2c"/>
      <rect x="4" y="4" width="56" height="92" fill="#fff0cf"/>
      <g stroke="#5b3a2c" stroke-width="2.2">
        <path d="M18 4V96 M32 4V96 M46 4V96 M4 22H60 M4 40H60 M4 60H60 M4 78H60"/>
      </g>
      <path d="M32 38 L46 50 L32 62 L18 50Z" fill="#fff0cf" stroke="#c9372c" stroke-width="2.6"/>
      <circle cx="32" cy="50" r="3" fill="#c79bff"/>
    </svg>`,
    { size: 192 },
  );

const noboriSvg = () =>
  svg(
    `<svg viewBox="0 0 40 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="140" fill="#5a3f9c"/>
      <rect width="3" height="140" fill="#e8b84a"/><rect x="37" width="3" height="140" fill="#e8b84a"/>
      <rect width="40" height="5" fill="#e8b84a"/><rect y="135" width="40" height="5" fill="#e8b84a"/>
      <circle cx="20" cy="30" r="13" fill="#f6efe0"/>
      <path d="M23 19 L14 32 L20 32 L17 42 L27 28 L21 28 Z" fill="#5a3f9c"/>
      <g stroke="#f6efe0" stroke-width="4" stroke-linecap="round" fill="none">
        <path d="M11 62 V118 M20 66 V122 M29 62 V118"/><path d="M8 80 H32 M8 100 H32" stroke-width="2.5"/>
      </g>
    </svg>`,
    { size: 192 },
  );

const sigilSvg = () => {
  let ticks = "";
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU;
    const [c, s] = [Math.cos(a), Math.sin(a)];
    ticks += `<path d="M${100 + c * 86} ${100 + s * 86} L${100 + c * 95} ${100 + s * 95}" stroke="#c79bff" stroke-width="3"/>`;
  }
  return svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="97" fill="none" stroke="#c79bff" stroke-width="4"/>
      <circle cx="100" cy="100" r="84" fill="none" stroke="#a46bf0" stroke-width="3"/>
      ${ticks}
      <polygon points="100,22 168,140 32,140" fill="none" stroke="#c79bff" stroke-width="3.5" stroke-linejoin="round"/>
      <polygon points="100,178 32,60 168,60" fill="none" stroke="#c79bff" stroke-width="3.5" stroke-linejoin="round"/>
      <circle cx="100" cy="100" r="36" fill="none" stroke="#e6d0ff" stroke-width="3.5"/>
      <path d="M108 70 L86 104 L98 104 L92 132 L116 96 L103 96 Z" fill="#e6d0ff"/>
    </svg>`,
    { size: 512 },
  );
};

const blossomSvg = () => {
  let petals = "";
  for (let i = 0; i < 5; i++)
    petals += `<ellipse cx="24" cy="12" rx="8" ry="11" fill="#fbbcd4" stroke="#e585ab" stroke-width="1.2" transform="rotate(${i * 72} 24 24)"/>`;
  return svg(
    `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">${petals}<circle cx="24" cy="24" r="4.5" fill="#ffd966" stroke="#d99a2a" stroke-width="1"/></svg>`,
    { size: 96 },
  );
};

const petalSvg = () =>
  svg(
    `<svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 30 C2 22 2 8 8 2 L12 8 L16 2 C22 8 22 22 12 30Z" fill="#fbb6d0" stroke="#e585ab" stroke-width="1.5"/>
    </svg>`,
    { size: 64 },
  );

const grassSvg = () =>
  svg(
    `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 64 Q8 30 4 8 Q16 30 18 64Z" fill="#5fae48"/>
      <path d="M16 64 Q20 24 22 2 Q30 28 30 64Z" fill="#79c85a"/>
      <path d="M28 64 Q36 34 44 12 Q42 40 38 64Z" fill="#5fae48"/>
      <path d="M22 64 Q24 40 34 24 Q32 46 32 64Z" fill="#8ed666"/>
    </svg>`,
    { size: 96 },
  );

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "inazuma_roadside_shrine", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);

  const T = {
    lantern: lanternSvg(),
    shide: shideSvg(),
    plaque: plaqueSvg(),
    emaFox: foxEma(),
    emaFlower: flowerEma(),
    emaBolt: boltEma(),
    shoji: shojiSvg(),
    nobori: noboriSvg(),
    sigil: sigilSvg(),
    blossom: blossomSvg(),
    petal: petalSvg(),
    grass: grassSvg(),
  };

  const G = 0.22; // top of the ground plot

  // --- Paints --------------------------------------------------------------------------------------------------
  const MOSS_C = "#7cb050";
  const stonePaint = (c1: string, c2: string, seed: number) =>
    cel(
      paint((p, n) => {
        const moss = noise(p, 0.16, seed + 4);
        if ((n.y > 0.5 && moss > 0.57) || (p.y < G + 0.12 && moss > 0.64)) return MOSS_C;
        return mix(c1, c2, noise(p, 0.28, seed));
      }),
    );
  const STONE = stonePaint("#a9aebf", "#8f95aa", 1);
  const STONE_L = stonePaint("#c4c8d6", "#a9afc0", 2);
  const STONE_D = stonePaint("#7d8398", "#666c82", 3);

  const GRASS_C = cel(mottle("#88c75c", "#69b04b", { size: 0.35, seed: 4 }));
  const EARTH_C = cel(mottle("#8d6746", "#6f4d38", { size: 0.2, seed: 3 }));
  const GROUND = paint((_p, n) => (n.y > 0.6 ? GRASS_C : EARTH_C));

  const RED = cel(grain("#d23d2f", "#bd3126", { size: 0.05, axis: "y" }));
  const BLACK = cel("#2c2433");
  const GOLD = cel("#f3c552", "#b5782c");
  const WOOD = cel(grain("#c8925c", "#ad774a", { size: 0.06, axis: "z" }));
  const WOOD_D = cel(grain("#6a4640", "#53362f", { size: 0.05, axis: "y" }));
  const CREAM = cel("#f5ecd6", "#cfbf9f");
  const STRAW = cel(grain("#e8cd78", "#c8a553", { size: 0.025, axis: "y" }));
  const LEAF = cel("#6fb04a");
  const BAMBOO = cel("#8fbf5a");
  const ORANGE = cel("#ff9a2e");
  const APPLE = cel("#d6403b");
  const BARK = cel(grain("#6b4a3f", "#4f352f", { size: 0.03, axis: "y" }));
  const PINK_A = cel(mottle("#fbb8d0", "#f59bbf", { size: 0.3, seed: 6 }));
  const PINK_B = cel(mottle("#f8a4c4", "#f08bb4", { size: 0.25, seed: 7 }));
  const PINK_C = cel(mottle("#ffc9dc", "#fbb0cb", { size: 0.35, seed: 8 }));
  const ROOF = cel(
    paint((p, n) => {
      if (Math.abs(n.z) > 0.8) return "#eadfc2";
      const k = (((p.x * 11) % 1) + 1) % 1;
      return k < 0.14 ? "#2a3552" : mix("#4d6190", "#3d4e7a", noise(p, 0.5, 8));
    }),
  );
  const ropePaint = (k: number) =>
    cel(paint((_p, _n, s) => (Math.sin(s[0] * TAU * k + s[1] * DEG) > 0 ? "#ebd180" : "#bd9a4a")));
  const ROPE = ropePaint(34);
  const BELL_ROPE = cel(paint((_p, _n, s) => (Math.floor(s[0] * 10) % 2 === 0 ? "#d23d2f" : "#f6f0e2")));

  // --- Helpers -------------------------------------------------------------------------------------------------
  const put = (geo: THREE.BufferGeometry, color: ColorInput, at: V, o: Opt = {}) =>
    b.part(geo, color, {
      at,
      flat: o.flat ?? true,
      ...(o.rot ? { rotation: o.rot } : {}),
      ...(o.tex ? { texture: o.tex } : {}),
      ...(o.scale ? { scale: o.scale } : {}),
    });
  const box = (w: number, h: number, d: number, c: ColorInput, at: V, o?: Opt) =>
    put(new THREE.BoxGeometry(w, h, d), c, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, c: ColorInput, at: V, o?: Opt) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg), c, at, o);
  const ball = (r: number, c: ColorInput, at: V, o?: Opt) => put(new THREE.SphereGeometry(r, 8, 6), c, at, o);
  const cone = (r: number, h: number, seg: number, c: ColorInput, at: V, o?: Opt) =>
    put(new THREE.ConeGeometry(r, h, seg), c, at, o);
  const ico = (r: number, d: number, c: ColorInput, at: V, o?: Opt) =>
    put(new THREE.IcosahedronGeometry(r, d), c, at, o);
  const decal = (w: number, h: number, tex: THREE.Texture, at: V, o: Opt = {}) =>
    put(new THREE.PlaneGeometry(w, h), "#ffffff", at, { ...o, tex, flat: false });
  const lathe = (outline: Array<[number, number]>, c: ColorInput, at: V, segments = 8) =>
    b.lathe(outline, { at, segments, color: c });

  const bottle = (x: number, y: number, z: number, c: ColorInput) =>
    lathe(
      [[0, 0], [0.05, 0], [0.06, 0.05], [0.05, 0.12], [0.022, 0.17], [0.022, 0.22], [0.03, 0.225], [0, 0.225]],
      c,
      [x, y, z],
    );

  // --- Ground plot ---------------------------------------------------------------------------------------------
  const plot: Outline = [];
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * TAU;
    const k = 1 + (R() - 0.5) * 0.08;
    plot.push([Math.cos(a) * 2.55 * k, -0.2 + Math.sin(a) * 2.6 * k]);
  }
  b.extrude(plot, { at: [0, G / 2, 0], x: [1, 0, 0], y: [0, 0, -1], thickness: G, bevel: 0.06, color: GROUND });

  // stepping stones leading to the torii
  for (const [z, x, w, rz] of [
    [2.55, 0.05, 0.85, 3],
    [2.05, -0.07, 0.8, -4],
  ] as const)
    box(w, 0.07, 0.5, STONE_L, [x, G + 0.02, z], { rot: [0, rz, 0] });

  // sigil disc between torii and shrine
  const SZ = 0.75;
  cyl(0.78, 0.82, 0.04, 16, STONE_D, [0, G + 0.02, SZ], { flat: false });
  cyl(0.7, 0.72, 0.05, 16, STONE_L, [0, G + 0.065, SZ], { flat: false });
  glow(decal(1.36, 1.36, T.sigil, [0, G + 0.094, SZ], { rot: [-90, 0, 0] }), 1.25);

  // --- Torii ---------------------------------------------------------------------------------------------------
  const TZ = 1.65;
  for (const s of [1, -1]) {
    cyl(0.3, 0.34, 0.14, 8, STONE_D, [s * 1.25, G + 0.07, TZ]);
    cyl(0.19, 0.21, 0.5, 10, BLACK, [s * 1.25, G + 0.39, TZ]);
    cyl(0.135, 0.165, 2.1, 12, RED, [s * 1.22, 1.91, TZ], { rot: [0, 0, s * 1.3], flat: false });
    cyl(0.15, 0.15, 0.12, 12, BLACK, [s * 1.2, 2.93, TZ], { flat: false });
    box(0.1, 0.22, 0.2, BLACK, [s * 1.62, 2.3, TZ]);
    // gold fittings
    cyl(0.17, 0.17, 0.04, 12, GOLD, [s * 1.215, 2.12, TZ], { flat: false });
    cyl(0.17, 0.17, 0.04, 12, GOLD, [s * 1.215, 2.48, TZ], { flat: false });
  }
  box(3.2, 0.2, 0.18, RED, [0, 2.3, TZ]);
  box(3.5, 0.14, 0.3, BLACK, [0, 2.93, TZ]);

  // curved kasagi
  const kasagiY = (x: number) => 3.1 + 0.2 * sq(x / 2.15);
  const SEG = 10;
  for (let i = 0; i < SEG; i++) {
    const x0 = -2.15 + (4.3 * i) / SEG;
    const x1 = -2.15 + (4.3 * (i + 1)) / SEG;
    const y0 = kasagiY(x0);
    const y1 = kasagiY(x1);
    const len = Math.hypot(x1 - x0, y1 - y0);
    box(len * 1.05, 0.2, 0.44, BLACK, [(x0 + x1) / 2, (y0 + y1) / 2, TZ], {
      rot: [0, 0, Math.atan2(y1 - y0, x1 - x0) / DEG],
    });
    box(len * 1.05, 0.025, 0.46, cel("#3b3150"), [(x0 + x1) / 2, (y0 + y1) / 2 + 0.105, TZ], {
      rot: [0, 0, Math.atan2(y1 - y0, x1 - x0) / DEG],
    });
  }
  for (const s of [1, -1]) box(0.06, 0.26, 0.46, GOLD, [s * 2.17, kasagiY(2.17), TZ], { rot: [0, 0, s * 10.5] });

  // name plaque (both faces)
  box(0.46, 0.5, 0.07, GOLD, [0, 2.62, TZ]);
  decal(0.38, 0.46, T.plaque, [0, 2.62, TZ + 0.037]);
  decal(0.38, 0.46, T.plaque, [0, 2.62, TZ - 0.037], { rot: [0, 180, 0] });

  // shimenawa + shide
  const ropeY = (x: number) => 2.22 + 0.13 * sq(x / 1.25);
  const RZ = TZ + 0.16;
  const ropePts: V[] = [];
  for (let i = 0; i <= 8; i++) {
    const x = -1.25 + i * 0.3125;
    ropePts.push([x, ropeY(x), RZ]);
  }
  b.sweep(catmull(ropePts), [0.05, 0.07, 0.075, 0.07, 0.05], { color: ROPE });
  for (const s of [1, -1]) {
    ball(0.07, STRAW, [s * 1.27, ropeY(1.27), RZ]);
    cone(0.05, 0.16, 6, STRAW, [s * 1.27, ropeY(1.27) - 0.12, RZ], { rot: [180, 0, 0] });
  }
  b.cards(
    [0, 0.3, -0.3, 1.0, -1.0].map((x) => frame([x, ropeY(x) - 0.03, RZ], [0, 1, 0])),
    T.shide,
    { size: [0.16, 0.36], lean: 180, flow: [0, 0, 1] },
  );

  // hanging paper lanterns
  const chochin = (rad: number, h: number) =>
    new THREE.LatheGeometry(
      (
        [
          [0.001, 0],
          [0.5, 0],
          [0.82, 0.14],
          [1, 0.5],
          [0.82, 0.86],
          [0.5, 1],
          [0.001, 1],
        ] as Array<[number, number]>
      ).map(([r, y]) => new THREE.Vector2(r * rad, y * h)),
      12,
    );
  const hangLantern = (x: number, topY: number, z: number, rad: number, h: number) => {
    b.rod([x, topY + 0.2, z], [x, topY, z], 0.012, BLACK);
    cyl(rad * 0.55, rad * 0.55, 0.05, 10, BLACK, [x, topY - 0.015, z]);
    glow(put(chochin(rad, h), "#ffffff", [x, topY - h - 0.01, z], { rot: [0, 180, 0], tex: T.lantern, flat: false }), 1.15);
    cyl(rad * 0.55, rad * 0.55, 0.05, 10, BLACK, [x, topY - h - 0.025, z]);
    cone(0.03, 0.14, 6, RED, [x, topY - h - 0.1, z], { rot: [180, 0, 0] });
  };
  for (const s of [1, -1]) hangLantern(s * 0.72, 1.98, TZ, 0.2, 0.46);

  // --- Stone lanterns ------------------------------------------------------------------------------------------
  const toro = (x: number, z: number) => {
    const hex = (rt: number, rb: number, h: number, y: number, c: ColorInput = STONE) =>
      cyl(rt, rb, h, 6, c, [x, G + y + h / 2, z]);
    hex(0.34, 0.38, 0.1, 0, STONE_D);
    hex(0.26, 0.3, 0.1, 0.1);
    hex(0.13, 0.15, 0.5, 0.2);
    hex(0.19, 0.19, 0.06, 0.4, STONE_L);
    hex(0.3, 0.2, 0.1, 0.7);
    box(0.44, 0.05, 0.44, STONE, [x, G + 0.8, z]);
    glow(box(0.26, 0.26, 0.26, AMBER, [x, G + 0.94, z]), 1.35);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) box(0.06, 0.28, 0.06, STONE, [x + sx * 0.18, G + 0.94, z + sz * 0.18]);
    box(0.46, 0.05, 0.46, STONE, [x, G + 1.09, z]);
    lathe([[0, -0.03], [0.4, -0.03], [0.43, 0.01], [0.26, 0.08], [0.12, 0.17], [0, 0.24]], STONE, [x, G + 1.11, z], 6);
    cyl(0.04, 0.06, 0.06, 6, STONE_D, [x, G + 1.38, z]);
    ball(0.065, STONE_L, [x, G + 1.45, z]);
    cone(0.03, 0.08, 6, STONE_L, [x, G + 1.54, z]);
  };
  toro(1.3, SZ);
  toro(-1.3, SZ);

  // --- Hokora shrine -------------------------------------------------------------------------------------------
  const F = G + 0.18;
  const D = F + 0.1;
  box(2.4, 0.05, 1.3, STONE_D, [0, G + 0.025, -1.55]);
  box(2.3, 0.18, 1.2, STONE_L, [0, G + 0.09, -1.55]);
  box(1.0, 0.12, 0.3, STONE_L, [0, G + 0.06, -0.8]);
  box(0.9, 0.06, 0.3, STONE_L, [0, G + 0.03, -0.5]);
  box(1.5, 0.1, 1.3, WOOD, [0, F + 0.05, -1.45]);

  // walls, posts, doors
  box(1.2, 1.1, 0.06, WOOD_D, [0, D + 0.55, -2.03]);
  for (const s of [1, -1]) {
    box(0.06, 1.1, 0.75, WOOD_D, [s * 0.6, D + 0.55, -1.67]);
    for (const z of [-2.03, -1.3]) box(0.1, 1.14, 0.1, RED, [s * 0.6, D + 0.57, z]);
    // door panels
    glow(box(0.54, 0.9, 0.03, "#ffffff", [s * 0.285, D + 0.51, -1.3], { tex: T.shoji, flat: false }), 0.55);
    ball(0.02, GOLD, [s * 0.07, D + 0.5, -1.27]);
  }
  box(0.04, 0.95, 0.06, RED, [0, D + 0.51, -1.3]);
  box(1.3, 0.14, 0.12, RED, [0, D + 1.0, -1.3]);
  box(1.2, 0.14, 0.08, WOOD_D, [0, D + 1.07, -1.3]);
  box(1.2, 0.06, 0.12, RED, [0, D + 0.03, -1.3]);

  // tail rafters
  for (let i = 0; i < 9; i++) box(0.05, 0.06, 0.65, WOOD_D, [-0.88 + i * 0.22, 1.585, -1.0]);

  // roof
  const roofOutline = (w: number, h: number): Outline => [
    [-1.0 * w, 0, "sharp"],
    [1.0 * w, 0, "sharp"],
    [1.05 * w, 0.16 * h, "sharp"],
    [0.75 * w, 0.2 * h],
    [0.35 * w, 0.4 * h],
    [0, 0.62 * h, "sharp"],
    [-0.35 * w, 0.4 * h],
    [-0.75 * w, 0.2 * h],
    [-1.05 * w, 0.16 * h, "sharp"],
  ];
  b.extrude(roofOutline(0.95, 1.1), {
    at: [0, 1.62, -1.45],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 1.6,
    bevel: 0.02,
    smoothing: 1,
    color: ROOF,
  });
  const ridge = 1.62 + 0.62 * 1.1;
  for (const z of [-1.95, -1.45, -0.95]) cyl(0.045, 0.045, 0.3, 8, WOOD, [0, ridge + 0.07, z], { rot: [90, 0, 0] });
  for (const z of [-0.7, -2.2])
    for (const s of [1, -1]) box(0.07, 0.7, 0.05, GOLD, [0, ridge + 0.2, z], { rot: [s * 35, 0, 0] });
  cyl(0.1, 0.1, 0.03, 12, GOLD, [0, 1.92, -0.645], { rot: [90, 0, 0], flat: false });
  glow(ball(0.045, PURPLE, [0, 1.92, -0.625]), 1.3);

  // railing
  for (const x of [-0.74, -0.3, 0.3, 0.74]) {
    box(0.07, 0.38, 0.07, RED, [x, D + 0.19, -0.82]);
    ball(0.05, GOLD, [x, D + 0.43, -0.82]);
  }
  for (const s of [1, -1]) {
    box(0.44, 0.05, 0.05, RED, [s * 0.52, D + 0.33, -0.82]);
    box(0.44, 0.04, 0.04, RED, [s * 0.52, D + 0.17, -0.82]);
    box(0.05, 0.05, 0.46, RED, [s * 0.74, D + 0.33, -1.05]);
    box(0.04, 0.04, 0.46, RED, [s * 0.74, D + 0.17, -1.05]);
    box(0.07, 0.38, 0.07, RED, [s * 0.74, D + 0.19, -1.28]);
    ball(0.05, GOLD, [s * 0.74, D + 0.43, -1.28]);
  }

  // bell and rope
  box(0.1, 0.1, 0.55, WOOD_D, [0, D + 0.95, -1.07]);
  b.rod([0, D + 0.9, -0.85], [0, D + 0.85, -0.85], 0.012, BLACK);
  ball(0.1, GOLD, [0, D + 0.76, -0.85]);
  box(0.13, 0.014, 0.03, BLACK, [0, D + 0.73, -0.76]);
  b.sweep([[0, D + 0.66, -0.85], [0, 0.78, -0.85]], 0.022, { color: BELL_ROPE, caps: "flat" });
  cone(0.05, 0.14, 6, RED, [0, 0.74, -0.85], { rot: [180, 0, 0] });

  // sanbo offerings on the porch
  const sanbo = (x: number) => {
    box(0.14, 0.1, 0.14, WOOD, [x, D + 0.05, -1.05]);
    box(0.24, 0.025, 0.24, WOOD, [x, D + 0.112, -1.05]);
  };
  sanbo(-0.45);
  cone(0.075, 0.12, 8, CREAM, [-0.45, D + 0.185, -1.05]);
  cone(0.025, 0.1, 5, LEAF, [-0.5, D + 0.18, -1.12], { rot: [0, 0, 25] });
  cone(0.025, 0.1, 5, LEAF, [-0.4, D + 0.18, -1.12], { rot: [0, 0, -25] });
  sanbo(0.45);
  ball(0.05, APPLE, [0.42, D + 0.15, -1.05]);
  ball(0.05, ORANGE, [0.5, D + 0.15, -1.0]);
  ball(0.045, APPLE, [0.46, D + 0.2, -1.09]);

  // --- Saisen box ----------------------------------------------------------------------------------------------
  box(0.9, 0.34, 0.4, WOOD_D, [0, G + 0.17, -0.15]);
  for (let i = 0; i < 7; i++) box(0.1, 0.03, 0.42, WOOD, [-0.36 + i * 0.12, G + 0.355, -0.15]);
  box(0.5, 0.18, 0.02, RED, [0, G + 0.17, 0.06]);
  cyl(0.06, 0.06, 0.015, 12, GOLD, [0, G + 0.17, 0.075], { rot: [90, 0, 0], flat: false });
  glow(ball(0.025, PURPLE, [0, G + 0.17, 0.085]), 1.2);
  for (const s of [1, -1]) box(0.04, 0.36, 0.04, BLACK, [s * 0.43, G + 0.18, 0.04]);
  for (const [x, z] of [[-0.2, -0.2], [0.05, -0.1], [0.25, -0.18], [-0.05, -0.25], [0.3, -0.08]] as const)
    cyl(0.03, 0.03, 0.008, 10, GOLD, [x, G + 0.375, z]);

  // --- Kitsune guardians ---------------------------------------------------------------------------------------
  const fox = (fx: number, fz: number, s: number) => {
    const y0 = G + 0.42;
    box(0.52, 0.35, 0.52, STONE_D, [fx, G + 0.175, fz]);
    box(0.6, 0.07, 0.6, STONE, [fx, G + 0.385, fz]);
    const sph = new THREE.SphereGeometry(1, 8, 6);
    put(sph, STONE, [fx, y0 + 0.17, fz - 0.1], { scale: [0.17, 0.19, 0.2] });
    put(sph, STONE, [fx, y0 + 0.32, fz - 0.02], { scale: [0.14, 0.26, 0.14], rot: [15, 0, 0] });
    put(sph, STONE, [fx, y0 + 0.28, fz + 0.08], { scale: [0.13, 0.15, 0.1] });
    for (const sx of [1, -1]) {
      cyl(0.045, 0.05, 0.34, 6, STONE, [fx + sx * 0.07, y0 + 0.17, fz + 0.12]);
      box(0.1, 0.04, 0.14, STONE_L, [fx + sx * 0.07, y0 + 0.02, fz + 0.17]);
      // ears
      cone(0.055, 0.22, 4, STONE, [fx + sx * 0.08, y0 + 0.77, fz - 0.01], { rot: [-8, 0, -sx * 14] });
      cone(0.032, 0.15, 4, RED, [fx + sx * 0.08, y0 + 0.75, fz + 0.015], { rot: [-8, 0, -sx * 14] });
      // glowing slit eyes
      glow(box(0.04, 0.012, 0.01, PURPLE, [fx + sx * 0.055, y0 + 0.64, fz + 0.165], { rot: [0, 0, -sx * 22] }), 1.3);
    }
    put(sph, STONE, [fx, y0 + 0.6, fz + 0.06], { scale: [0.13, 0.115, 0.13] });
    cyl(0.025, 0.07, 0.17, 5, STONE, [fx, y0 + 0.58, fz + 0.2], { rot: [90, 0, 0] });
    ball(0.024, BLACK, [fx, y0 + 0.585, fz + 0.29]);
    // tail
    b.sweep(
      catmull([
        [fx, y0 + 0.08, fz - 0.28],
        [fx + s * 0.22, y0 + 0.05, fz - 0.42],
        [fx + s * 0.4, y0 + 0.2, fz - 0.3],
        [fx + s * 0.38, y0 + 0.5, fz - 0.14],
      ]),
      [0.05, 0.11, 0.08, 0.015],
      { color: STONE },
    );
    // red bib, bell
    put(new THREE.TorusGeometry(0.115, 0.03, 5, 10), RED, [fx, y0 + 0.46, fz + 0.04], { rot: [80, 0, 0] });
    box(0.17, 0.17, 0.03, RED, [fx, y0 + 0.33, fz + 0.15], { rot: [-10, 0, 45] });
    ball(0.035, GOLD, [fx, y0 + 0.43, fz + 0.15]);
  };
  fox(1.15, -0.55, -1);
  fox(-1.15, -0.55, 1);

  // --- Offering table (left) -----------------------------------------------------------------------------------
  const TY = G + 0.4;
  box(0.7, 0.05, 0.46, WOOD, [-1.6, TY - 0.025, -1.2]);
  box(0.5, 0.01, 0.48, CREAM, [-1.6, TY + 0.003, -1.2]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.05, 0.37, 0.05, WOOD_D, [-1.6 + sx * 0.3, G + 0.185, -1.2 + sz * 0.19]);
  // sunsettia pile
  for (const [dx, dy, dz] of [[-0.06, 0, 0], [0.06, 0, 0.02], [0, 0, -0.07], [0, 0.085, -0.02]] as const)
    ball(0.058, ORANGE, [-1.82 + dx, TY + 0.06 + dy, -1.22 + dz]);
  cone(0.03, 0.04, 5, LEAF, [-1.82, TY + 0.2, -1.24], { rot: [180, 0, 0] });
  // dango plate
  cyl(0.1, 0.09, 0.02, 12, CREAM, [-1.5, TY + 0.015, -1.15]);
  for (const dz of [-0.035, 0.035]) {
    b.rod([-1.58, TY + 0.04, -1.15 + dz], [-1.42, TY + 0.04, -1.15 + dz], 0.004, BAMBOO);
    [cel("#f7a8c4"), CREAM, cel("#8fd07a")].forEach((c, i) => ball(0.022, c, [-1.53 + i * 0.045, TY + 0.05, -1.15 + dz]));
  }
  // sake
  bottle(-1.62, TY, -1.3, CREAM);
  cyl(0.026, 0.02, 0.035, 8, cel("#e8e0f0"), [-1.5, TY + 0.018, -1.32]);
  cyl(0.026, 0.02, 0.035, 8, cel("#e8e0f0"), [-1.44, TY + 0.018, -1.28]);
  // rice bowl
  lathe([[0, 0], [0.035, 0], [0.07, 0.05], [0.075, 0.065], [0.066, 0.066], [0, 0.03]], RED, [-1.78, TY, -1.05], 10);
  put(new THREE.SphereGeometry(0.062, 8, 5), CREAM, [-1.78, TY + 0.045, -1.05], { scale: [1, 0.55, 1] });

  // --- Sake barrels (right) ------------------------------------------------------------------------------------
  const barrelGeo = new THREE.LatheGeometry(
    (
      [
        [0.001, 0],
        [0.19, 0],
        [0.22, 0.19],
        [0.19, 0.38],
        [0.001, 0.38],
      ] as Array<[number, number]>
    ).map(([r, y]) => new THREE.Vector2(r, y)),
    10,
  );
  const barrel = (x: number, y: number, z: number) => {
    put(barrelGeo, STRAW, [x, y, z]);
    cyl(0.205, 0.205, 0.03, 10, RED, [x, y + 0.07, z]);
    cyl(0.205, 0.205, 0.03, 10, RED, [x, y + 0.31, z]);
    cyl(0.226, 0.226, 0.03, 10, BLACK, [x, y + 0.19, z]);
    box(0.17, 0.2, 0.012, CREAM, [x, y + 0.19, z + 0.226]);
    box(0.07, 0.11, 0.014, RED, [x, y + 0.19, z + 0.228]);
    cyl(0.17, 0.17, 0.02, 10, WOOD, [x, y + 0.385, z]);
  };
  barrel(1.55, G, -1.0);
  barrel(1.55, G, -1.46);
  barrel(1.55, G + 0.38, -1.23);

  // --- Ema rack ------------------------------------------------------------------------------------------------
  const RK = { x: 1.9, z: -0.2 };
  for (const x of [1.5, 2.3]) box(0.08, 1.5, 0.08, WOOD_D, [x, G + 0.75, RK.z]);
  box(0.95, 0.05, 0.06, WOOD_D, [RK.x, G + 1.22, RK.z]);
  box(0.95, 0.05, 0.06, WOOD_D, [RK.x, G + 0.84, RK.z]);
  b.extrude(
    [[-0.58, 0], [0.58, 0], [0, 0.22]],
    { at: [RK.x, G + 1.5, RK.z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.5, color: ROOF },
  );
  const emaTex = [T.emaFox, T.emaFlower, T.emaBolt];
  let ei = 0;
  for (const by of [G + 1.22, G + 0.84])
    for (const x of [1.65, 1.9, 2.15]) {
      const py = by - 0.15;
      b.rod([x, by, RK.z + 0.03], [x, py + 0.09, RK.z + 0.03], 0.006, BLACK);
      box(0.2, 0.17, 0.025, WOOD, [x, py, RK.z + 0.05]);
      b.extrude([[-0.12, 0], [0.12, 0], [0, 0.06]], {
        at: [x, py + 0.085, RK.z + 0.05],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.03,
        color: WOOD_D,
      });
      decal(0.17, 0.14, emaTex[ei++ % 3], [x, py, RK.z + 0.0635]);
    }

  // --- Nobori banners ------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const x = s * 2.0;
    const z = 1.1;
    box(0.18, 0.1, 0.18, STONE, [x, G + 0.05, z]);
    cyl(0.028, 0.032, 2.1, 8, WOOD_D, [x, G + 1.1, z]);
    box(0.5, 0.04, 0.04, WOOD_D, [x - s * 0.25, G + 2.08, z]);
    ball(0.045, GOLD, [x, G + 2.18, z]);
    put(new THREE.BoxGeometry(0.4, 1.4, 0.012), "#ffffff", [x - s * 0.22, G + 1.38, z + 0.03], {
      tex: T.nobori,
      flat: false,
    });
  }

  // --- Temizuya basin & jizo -----------------------------------------------------------------------------------
  const BX = 1.1;
  const BZ = 2.2;
  box(0.6, 0.36, 0.46, STONE, [BX, G + 0.18, BZ]);
  box(0.66, 0.05, 0.5, STONE_L, [BX, G + 0.385, BZ]);
  glow(box(0.46, 0.02, 0.32, "#7fd6ea", [BX, G + 0.415, BZ]), 0.7);
  b.rod([BX - 0.1, G + 0.72, BZ - 0.08], [BX - 0.1, G + 0.5, BZ + 0.06], 0.028, BAMBOO);
  b.rod([BX - 0.1, G + 0.5, BZ + 0.06], [BX - 0.1, G + 0.42, BZ + 0.06], 0.008, "#9be3f2");
  b.rod([BX - 0.1, G + 0.72, BZ - 0.08], [BX - 0.1, G + 0.9, BZ - 0.2], 0.03, WOOD_D);
  cyl(0.012, 0.012, 0.3, 6, BAMBOO, [BX + 0.12, G + 0.42, BZ + 0.05], { rot: [0, 0, 90] });
  cyl(0.05, 0.04, 0.05, 8, BAMBOO, [BX + 0.28, G + 0.44, BZ + 0.05]);

  const jizo = (x: number, z: number, k: number) => {
    box(0.28 * k, 0.12 * k, 0.28 * k, STONE_D, [x, G + 0.06 * k, z]);
    cyl(0.1 * k, 0.15 * k, 0.34 * k, 8, STONE, [x, G + 0.12 * k + 0.17 * k, z]);
    ball(0.11 * k, STONE, [x, G + 0.12 * k + 0.34 * k + 0.09 * k, z]);
    put(new THREE.TorusGeometry(0.1 * k, 0.025 * k, 5, 10), RED, [x, G + 0.12 * k + 0.34 * k, z], { rot: [90, 0, 0] });
    box(0.16 * k, 0.15 * k, 0.03 * k, RED, [x, G + 0.12 * k + 0.25 * k, z + 0.11 * k], { rot: [-10, 0, 0] });
    cone(0.13 * k, 0.1 * k, 8, RED, [x, G + 0.12 * k + 0.34 * k + 0.22 * k, z]);
    for (const sx of [1, -1]) box(0.035 * k, 0.01 * k, 0.01 * k, BLACK, [x + sx * 0.04 * k, G + 0.12 * k + 0.45 * k, z + 0.105 * k]);
    for (const [dx, dz] of [[-0.08, 0.2], [0.02, 0.24], [0.1, 0.18]] as const)
      ball(0.025 * k, STONE_L, [x + dx * k, G + 0.02, z + dz * k]);
  };
  jizo(-1.15, 2.2, 1);
  jizo(-0.82, 2.38, 0.75);

  // --- Rocks ---------------------------------------------------------------------------------------------------
  for (const [x, z, r] of [[1.95, 2.0, 0.3], [-2.0, 1.7, 0.26], [-0.9, -2.0, 0.28], [0.25, -2.15, 0.2], [2.1, 0.5, 0.2], [-2.1, 0.35, 0.22]] as const)
    ico(r, 0, STONE, [x, G + r * 0.35, z], { scale: [1.1, 0.7, 0.95], rot: [0, R() * 90, 0] });

  // --- Electro crystals ----------------------------------------------------------------------------------------
  const CX = -1.95;
  const CZ = -0.15;
  ico(0.3, 0, STONE_D, [CX, G + 0.08, CZ], { scale: [1.1, 0.5, 1] });
  const crystalCols = [PURPLE, "#9a63f0", PURPLE_L];
  (
    [
      [0, 0, 0.7, 0.08, 0, 0],
      [0.15, 0.08, 0.45, 0.06, 0.25, 0.2],
      [-0.14, 0.06, 0.5, 0.06, -0.25, 0.15],
      [0.05, -0.15, 0.38, 0.05, 0.1, -0.3],
      [-0.08, -0.1, 0.32, 0.045, -0.3, -0.25],
      [0.2, -0.1, 0.28, 0.04, 0.35, -0.1],
    ] as const
  ).forEach(([dx, dz, h, r, tx, tz], i) => {
    glow(
      b.lathe([[0, 0], [r * 0.8, 0], [r, h * 0.15], [r, h * 0.7], [0, h]], {
        at: [CX + dx, G + 0.12, CZ + dz],
        axis: [tx, 1, tz],
        segments: 6,
        color: crystalCols[i % 3],
      }),
      1.25,
    );
  });
  for (let i = 0; i < 8; i++) {
    const a = R() * TAU;
    const rr = 0.2 + R() * 0.3;
    glow(ico(0.018 + R() * 0.012, 0, PURPLE_L, [CX + Math.cos(a) * rr, G + 0.5 + R() * 0.9, CZ + Math.sin(a) * rr]), 1.4);
  }

  // --- Sakura tree ---------------------------------------------------------------------------------------------
  b.sweep(
    catmull([[1.75, G - 0.05, -1.95], [1.7, 0.9, -1.98], [1.5, 1.8, -1.95], [1.25, 2.6, -1.85], [1.0, 3.3, -1.8]]),
    [0.27, 0.2, 0.15, 0.1, 0.07],
    { color: BARK, sides: 8 } as never,
  );
  b.sweep(catmull([[1.55, 1.95, -1.95], [1.9, 2.5, -1.9], [2.35, 3.0, -1.8]]), [0.1, 0.06, 0.03], { color: BARK });
  b.sweep(catmull([[1.2, 2.5, -1.85], [0.6, 2.9, -1.95], [0.0, 3.3, -2.05]]), [0.09, 0.055, 0.025], { color: BARK });
  b.sweep(catmull([[1.1, 3.0, -1.8], [1.35, 3.7, -1.8]]), [0.07, 0.03], { color: BARK });
  for (const [dx, dz] of [[0.2, 0.1], [-0.15, 0.2], [0.05, -0.25]] as const)
    b.sweep(catmull([[1.75 + dx * 0.4, G + 0.25, -1.95 + dz * 0.4], [1.75 + dx * 1.3, G + 0.02, -1.95 + dz * 1.3]]), [0.09, 0.03], { color: BARK });

  // sacred rope round the trunk
  const tc: V = [1.62, 1.3, -1.97];
  const ringPts: V[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    ringPts.push([tc[0] + Math.cos(a) * 0.23, tc[1], tc[2] + Math.sin(a) * 0.23]);
  }
  b.sweep(catmull(ringPts, { closed: true }), 0.035, { color: ropePaint(18) });
  b.cards(
    [0, 2, 4, 6].map((i) => frame([ringPts[i][0], tc[1] - 0.03, ringPts[i][2]], [0, 1, 0])),
    T.shide,
    { size: [0.1, 0.26], lean: 180, flow: [0, 0, 1] },
  );

  const blobs: Array<[number, number, number, number, ColorInput]> = [
    [1.0, 3.6, -1.85, 0.85, PINK_A],
    [1.9, 3.5, -1.8, 0.8, PINK_B],
    [2.4, 3.15, -1.8, 0.6, PINK_C],
    [0.2, 3.5, -2.0, 0.7, PINK_C],
    [1.5, 4.15, -1.85, 0.7, PINK_C],
    [0.7, 4.1, -1.9, 0.6, PINK_A],
    [1.2, 3.1, -1.5, 0.5, PINK_B],
  ];
  const blossomFrames: ReturnType<typeof frame>[] = [];
  for (const [x, y, z, r, c] of blobs) {
    ico(r, 1, c, [x, y, z], { scale: [1, 0.82, 1] });
    for (let i = 0; i < 12; i++) {
      const a = R() * TAU;
      const e = (R() - 0.25) * 1.3;
      const d = new THREE.Vector3(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)).normalize();
      blossomFrames.push(frame([x + d.x * r * 0.96, y + d.y * r * 0.8, z + d.z * r * 0.96], [d.x, d.y, d.z]));
    }
  }
  b.cards(blossomFrames, T.blossom, { size: 0.2, lean: 20, vary: 0.3, spin: 180, rng: R });

  // falling and fallen petals
  const air: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 28; i++) air.push(frame([-1.8 + R() * 4, 0.7 + R() * 2.7, -2 + R() * 3.8], [0, 1, 0]));
  b.cards(air, T.petal, {
    size: 0.08,
    lean: 90,
    vary: 0.4,
    flow: (_f: unknown, i: number): V => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
    mirror: true,
  });

  // --- Scatter: grass, flowers, fallen petals ------------------------------------------------------------------
  const BLOCK: Array<[number, number, number]> = [
    [1.3, SZ, 0.5], [-1.3, SZ, 0.5], [1.15, -0.55, 0.4], [-1.15, -0.55, 0.4], [-1.6, -1.2, 0.55], [1.55, -1.25, 0.5],
    [1.9, -0.2, 0.6], [-1.95, -0.15, 0.4], [2.0, 1.1, 0.25], [-2.0, 1.1, 0.25], [1.1, 2.2, 0.45], [-1.0, 2.25, 0.45],
    [1.7, -2.0, 0.4], [1.25, 1.65, 0.4], [-1.25, 1.65, 0.4],
  ];
  const free = (x: number, z: number, pad = 0.1) => {
    if (sq(x / 2.3) + sq((z - 0.2) / 2.35) > 1) return false;
    if (Math.abs(x) < 0.7 + pad && z > -0.45) return false;
    if (Math.abs(x) < 1.35 + pad && z < -0.5 && z > -2.4) return false;
    for (const [cx, cz, r] of BLOCK) if (Math.hypot(x - cx, z - cz) < r + pad) return false;
    return true;
  };

  const tufts: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 700 && tufts.length < 80; i++) {
    const x = (R() - 0.5) * 5;
    const z = -2.3 + R() * 5;
    if (free(x, z, 0.05)) tufts.push(frame([x, G, z], [0, 1, 0]));
  }
  b.cards(tufts, T.grass, { size: [0.18, 0.24], vary: 0.35, cross: true, spin: 180, rng: R });

  const flowerCols = [cel("#fff2f6"), cel("#c9a5ff"), cel("#ffd6e6"), cel("#fff0a8")];
  let placed = 0;
  for (let i = 0; i < 400 && placed < 14; i++) {
    const x = (R() - 0.5) * 4.6;
    const z = -2.1 + R() * 4.6;
    if (!free(x, z, 0.2)) continue;
    cyl(0.006, 0.008, 0.14, 4, LEAF, [x, G + 0.07, z]);
    put(new THREE.SphereGeometry(0.04, 6, 4), flowerCols[placed % 4], [x, G + 0.15, z], { scale: [1, 0.6, 1] });
    ball(0.016, GOLD, [x, G + 0.168, z]);
    placed++;
  }

  const ground: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 600 && ground.length < 45; i++) {
    const x = (R() - 0.5) * 4.8;
    const z = -2.2 + R() * 4.8;
    if (sq(x / 2.3) + sq((z - 0.2) / 2.35) < 1 && !(Math.abs(x) < 1.2 && z < -0.6 && z > -2.3))
      ground.push(frame([x, G + (Math.abs(x) < 0.7 && z > -0.1 && z < 1.4 ? 0.09 : 0.008), z], [0, 1, 0]));
  }
  b.cards(ground, T.petal, {
    size: 0.07,
    lean: 90,
    vary: 0.4,
    flow: (_f: unknown, i: number): V => [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)],
    mirror: true,
  });

  return b.root;
}
```