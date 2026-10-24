import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  paint,
  noise,
  mix,
  smoothstep,
  resolve,
  svg,
  catmull,
  polyline,
  grain,
  scales,
  mottle,
  stripes,
} from "../../../../src/index";
import type { ColorInput } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Midnight Ramen Yatai",
  description:
    "A tiny wooden ramen cart at midnight: red katakana noren, steaming stockpot on a glowing stove, three stools, swaying paper lanterns, a ginger cat asleep on a cushion under the counter, and rain puddles holding the warm light.",
};

const D2R = Math.PI / 180;

// ---------------------------------------------------------------------------------------------------------------
// Night lighting baked into paints: cool ambient, warm pools around lanterns, bulb and the stove fire.

const AMB = [0.6, 0.66, 0.9];
const LIGHTS = [
  { x: 1.06, y: 1.7, z: 1.0, r: 2.7, k: 0.95, c: [1.0, 0.45, 0.2] },
  { x: -1.06, y: 1.7, z: 1.0, r: 2.7, k: 0.95, c: [1.0, 0.45, 0.2] },
  { x: 0.0, y: 1.82, z: -0.1, r: 2.2, k: 1.0, c: [1.0, 0.72, 0.35] },
  { x: 0.35, y: 1.08, z: 0.25, r: 1.0, k: 1.1, c: [1.0, 0.5, 0.15] },
  { x: 0.1, y: 0.35, z: 0.5, r: 0.8, k: 0.7, c: [1.0, 0.7, 0.4] },
];

function lit(base: ColorInput, gain = 1) {
  return paint((p, n) => {
    const c = resolve(base, p, n);
    const moon = Math.max(0, n.y) * 0.05;
    let r = c[0] * AMB[0] + moon * 0.5;
    let g = c[1] * AMB[1] + moon * 0.7;
    let bl = c[2] * AMB[2] + moon;
    for (const L of LIGHTS) {
      const dx = L.x - p.x;
      const dy = L.y - p.y;
      const dz = L.z - p.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
      const f = Math.max(0, 1 - d / L.r);
      if (f <= 0) continue;
      const face = 0.3 + 0.7 * Math.max(0, (n.x * dx + n.y * dy + n.z * dz) / d);
      const a = f * f * face * L.k * gain * 1.6;
      r += c[0] * L.c[0] * a;
      g += c[1] * L.c[1] * a;
      bl += c[2] * L.c[2] * a;
    }
    return [Math.min(1, r), Math.min(1, g), Math.min(1, bl)] as [number, number, number];
  });
}

type P = ReturnType<typeof paint>;
const litCache = new Map<string, P>();
const lc = (hex: string, gain = 1): P => {
  const k = `${hex}|${gain}`;
  let v = litCache.get(k);
  if (!v) litCache.set(k, (v = lit(hex, gain)));
  return v;
};
const wood = (a: string, b2: string, axis: "x" | "y" | "z" = "y", gain = 1): P => {
  const k = `w|${a}|${b2}|${axis}|${gain}`;
  let v = litCache.get(k);
  if (!v) litCache.set(k, (v = lit(grain(a, b2, { size: 0.03, axis }), gain)));
  return v;
};

const prof = (keys: [number, number][]) => (t: number) => {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, r0] = keys[i - 1];
      const [t1, r1] = keys[i];
      return r0 + ((r1 - r0) * (t - t0)) / Math.max(1e-6, t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
};

// ---------------------------------------------------------------------------------------------------------------
// Textures (SVG drawings)

const GLYPHS = [
  `<path d="M12 9 H28 M7 19 H33 Q33 32 10 37"/>`, // ra
  `<path d="M5 22 H35"/>`, // long vowel mark
  `<path d="M27 8 Q25 26 8 37 M8 16 L33 35"/>`, // me
  `<path d="M9 11 L14 15 M7 20 L12 24 M10 36 Q30 31 32 9"/>`, // n
];

const norenTex = (glyph: string) =>
  svg(
    `<svg viewBox="0 0 40 42" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="c" x1="0" x2="1"><stop offset="0" stop-color="#a21c25"/><stop offset=".5" stop-color="#c52f2e"/><stop offset="1" stop-color="#9b1a24"/></linearGradient></defs>
  <rect width="40" height="42" fill="url(#c)"/>
  <rect width="40" height="4" fill="#7a1119"/>
  <rect y="38.5" width="40" height="3.5" fill="#84131b"/>
  <path d="M1.6 4 V38 M38.4 4 V38" stroke="#f0907a" stroke-width=".5" stroke-dasharray="1.2 1.2" opacity=".55"/>
  <path d="M10 4 V38 M20 4 V38 M30 4 V38" stroke="#7a1119" stroke-width=".4" opacity=".25"/>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g stroke="#3b0a0e" stroke-width="5.6" opacity=".55" transform="translate(.5 .6)">${glyph}</g>
    <g stroke="#fff1d6" stroke-width="4">${glyph}</g>
  </g>
</svg>`,
    { size: 192 },
  );

const emblem = (cx: number, glyph: string) => `
  <circle cx="${cx}" cy="32" r="19" fill="#fff0d0"/>
  <circle cx="${cx}" cy="32" r="19" fill="none" stroke="#7a1218" stroke-width="1.2"/>
  <g transform="translate(${cx - 11.6} 19.8) scale(.58)" fill="none" stroke="#c52a22" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>`;

const LANTERN_TEX = svg(
  `<svg viewBox="0 0 192 64" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#6e1016"/><stop offset=".3" stop-color="#d1342a"/>
    <stop offset=".5" stop-color="#ff6d3a"/><stop offset=".7" stop-color="#d1342a"/><stop offset="1" stop-color="#6e1016"/>
  </linearGradient></defs>
  <rect width="192" height="64" fill="url(#g)"/>
  ${[...Array(9)].map((_, i) => `<path d="M0 ${5 + i * 6.8} H192" stroke="#4a0d12" stroke-width="1.1" opacity=".7"/>`).join("")}
  ${emblem(48, GLYPHS[0])}
  ${emblem(144, GLYPHS[2])}
</svg>`,
  { size: 384 },
);

const PUDDLE_BLOB = "M64 8 C92 6 118 28 120 58 C122 88 98 118 66 120 C34 122 8 98 8 66 C6 34 34 10 64 8 Z";
const PUDDLE_TEX = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="w" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#2d3556"/><stop offset="1" stop-color="#141a30"/></radialGradient>
    <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc36a"/><stop offset=".6" stop-color="#ff6a2a"/><stop offset="1" stop-color="#ff5a2a" stop-opacity="0"/></linearGradient>
    <clipPath id="cp"><path d="${PUDDLE_BLOB}"/></clipPath>
  </defs>
  <path d="${PUDDLE_BLOB}" fill="url(#w)"/>
  <g clip-path="url(#cp)">
    <ellipse cx="38" cy="62" rx="10" ry="52" fill="url(#s)" opacity=".85"/>
    <ellipse cx="92" cy="66" rx="8" ry="46" fill="url(#s)" opacity=".7"/>
    <ellipse cx="64" cy="70" rx="5" ry="30" fill="#ffe3a8" opacity=".55"/>
    <path d="M18 32 Q64 16 110 34" stroke="#6f86c8" stroke-width="3" fill="none" opacity=".5"/>
    <ellipse cx="82" cy="78" rx="16" ry="6" fill="none" stroke="#ffd9a0" stroke-width="1.6" opacity=".75"/>
    <ellipse cx="82" cy="78" rx="8" ry="3" fill="none" stroke="#ffd9a0" stroke-width="1.4" opacity=".8"/>
    <ellipse cx="44" cy="46" rx="11" ry="4" fill="none" stroke="#ffd9a0" stroke-width="1.3" opacity=".6"/>
  </g>
  <path d="${PUDDLE_BLOB}" fill="none" stroke="#0d1122" stroke-width="2.4"/>
</svg>`,
  { size: 256 },
);

const MENU_TEX = (() => {
  const prices = ["700", "850", "950"];
  const marks = [
    "M3 14 H11 M4 20 Q7 23 10 20 M7 25 V36 M3 40 L11 44",
    "M4 13 L10 13 M3 19 H11 M7 19 V32 M3 37 Q7 41 11 37",
    "M3 15 Q7 11 11 15 M7 19 V30 M4 35 H10 M4 42 L10 42",
  ];
  const strips = [0, 1, 2]
    .map(
      (i) => `<g transform="translate(${6 + i * 17} 8)">
    <rect width="14" height="60" fill="#f1e2bd"/><rect width="14" height="3" fill="#d9c493"/>
    <circle cx="7" cy="6" r="2.2" fill="#c8302f"/>
    <path d="${marks[i]}" stroke="#2c1a10" stroke-width="1.8" stroke-linecap="round" fill="none" transform="translate(0 4)"/>
    <text x="7" y="56" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="7" fill="#3a1d12">${prices[i]}</text>
  </g>`,
    )
    .join("");
  return svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="80" fill="#3b2817"/>
    <rect x="2" y="2" width="56" height="76" fill="none" stroke="#6b4a2a" stroke-width="2"/>
    ${strips}
  </svg>`,
    { size: 256 },
  );
})();

const STEAM = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 62 C4 48 28 40 16 28 C8 18 22 12 16 2" fill="none" stroke="#e6e6e6" stroke-width="9" stroke-linecap="round"/>
  <path d="M16 62 C4 48 28 40 16 28 C8 18 22 12 16 2" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);

const EYE_TEX = svg(
  `<svg viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 5 Q20 21 35 5" fill="none" stroke="#3a1c0f" stroke-width="3.6" stroke-linecap="round"/>
  <path d="M8 11 L4 15 M20 16 V20 M32 11 L36 15" stroke="#3a1c0f" stroke-width="2" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);

const FLAME_TEX = svg(
  `<svg viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="f" cx=".5" cy="1" r="1"><stop offset="0" stop-color="#ffe9a0"/><stop offset=".5" stop-color="#ff9a2a"/><stop offset="1" stop-color="#7a1c08"/></radialGradient></defs>
  <rect width="40" height="28" fill="url(#f)"/>
  <path d="M4 28 C2 18 9 16 7 6 C14 11 15 20 13 28Z" fill="#ff7a1c"/>
  <path d="M14 28 C12 14 20 12 19 2 C27 9 28 20 25 28Z" fill="#ffb53a"/>
  <path d="M26 28 C25 18 31 16 30 8 C36 13 36 21 34 28Z" fill="#ff6a1c"/>
  <path d="M17 28 C16 20 20 18 20 12 C24 17 24 23 23 28Z" fill="#fff0b0"/>
</svg>`,
  { size: 128 },
);

const ZZZ_TEX = svg(
  `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
  <g font-family="serif" font-weight="bold" font-style="italic" fill="#fff6e0" stroke="#5a6aa5" stroke-width="1.6" paint-order="stroke">
    <text x="4" y="74" font-size="22">z</text>
    <text x="20" y="48" font-size="28">z</text>
    <text x="34" y="26" font-size="34">Z</text>
  </g>
</svg>`,
  { size: 192 },
);

const NOODLE_TEX = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" fill="#f0d27a"/>
  ${[0, 1, 2, 3, 4, 5, 6]
    .map(
      (i) =>
        `<path d="M0 ${6 + i * 9} Q16 ${i % 2 ? 14 : -2 + i * 9} 32 ${6 + i * 9} T64 ${6 + i * 9}" stroke="${i % 2 ? "#cda146" : "#fff0b0"}" stroke-width="2.2" fill="none"/>`,
    )
    .join("")}
</svg>`,
  { size: 128 },
);

const NARUTO_TEX = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="15" fill="#fbf3f0"/>
  <path d="M16 5 A11 11 0 1 1 5 16" stroke="#ee6d85" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M16 11 A5.5 5.5 0 1 1 10.5 16.5" stroke="#ee6d85" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 64 },
);

const LEAF_TEX = svg(
  `<svg viewBox="0 0 24 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 38 C0 26 2 8 12 2 C22 8 24 26 12 38Z" fill="#4f9a47" stroke="#2c5d31" stroke-width="1.2"/>
  <path d="M12 2 C22 8 24 26 12 38Z" fill="#6bb85a"/>
  <path d="M12 36 V6" stroke="#2f6b34" stroke-width="1.4"/>
</svg>`,
  { size: 96 },
);

// ---------------------------------------------------------------------------------------------------------------

type Opt = {
  rot?: number[];
  dir?: number[];
  axis?: "x" | "y" | "z";
  up?: number[];
  scale?: number[];
  texture?: THREE.Texture;
  smooth?: boolean;
  quat?: THREE.Quaternion;
  name?: string;
};

export default function build() {
  const b = createBuilder({ name: "ramen-yatai", paintSize: 2048 });
  const rand = rng(21);

  const put = (g: THREE.BufferGeometry, color: ColorInput, at: number[], o: Opt = {}) => {
    const opt: Record<string, unknown> = { at, flat: !o.smooth };
    if (o.quat) opt.quat = o.quat;
    if (o.rot) opt.rotation = o.rot;
    if (o.dir) opt.dir = o.dir;
    if (o.axis) opt.axis = o.axis;
    if (o.up) opt.up = o.up;
    if (o.scale) opt.scale = o.scale;
    if (o.texture) opt.texture = o.texture;
    if (o.name) opt.name = o.name;
    return b.part(g, color, opt as never);
  };
  const box = (w: number, h: number, d: number, color: ColorInput, at: number[], o: Opt = {}) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (r: number, h: number, seg: number, color: ColorInput, at: number[], o: Opt = {}) =>
    put(new THREE.CylinderGeometry(r, r, h, seg), color, at, o);
  const cone = (r: number, h: number, seg: number, color: ColorInput, at: number[], o: Opt = {}) =>
    put(new THREE.ConeGeometry(r, h, seg), color, at, o);
  const ball = (r: number, color: ColorInput, at: number[], o: Opt & { seg?: number } = {}) => {
    const seg = o.seg ?? 8;
    return put(new THREE.SphereGeometry(r, seg, Math.max(3, Math.round(seg * 0.7))), color, at, o);
  };
  const ring = (r: number, tube: number, color: ColorInput, at: number[], dir: number[], seg = 12) =>
    put(new THREE.TorusGeometry(r, tube, 5, seg), color, at, { dir, axis: "z" });
  const rod = (a: number[], c: number[], r: number, color: ColorInput, sides = 6) =>
    b.rod(a, c, r, color as never, { sides });
  const sway = (ax: number, az: number, yaw = 0) =>
    new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(ax * D2R, 0, az * D2R))
      .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw * D2R, 0)));

  // --- palette (lit paints) ------------------------------------------------------------------------------------
  const WOOD = wood("#8a5a32", "#6a4224", "y");
  const WOOD_X = wood("#8a5a32", "#6a4224", "x");
  const WOOD_DK = wood("#5e3a21", "#442914", "y");
  const WOOD_LT = wood("#b07c4a", "#8f6236", "y");
  const IRON = lc("#2a2c36");
  const IRON_LT = lc("#4a4e5c");
  const STEEL = lit(mottle("#aab0bd", "#7a8190", { size: 0.12, seed: 3 }));
  const COPPER = lit(mottle("#c4733a", "#8f4a24", { size: 0.08, seed: 5 }));
  const PORC = "#f3ead6";
  const INDIGO = "#2c3f7a";

  // --- wet ground with puddles ------------------------------------------------------------------------------------
  const gOutline: [number, number][] = [];
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const rx = 2.4 + 0.22 * Math.sin(3 * a + 1) + 0.1 * Math.sin(7 * a);
    const rz = 2.05 + 0.18 * Math.sin(2 * a + 0.5) + 0.08 * Math.sin(5 * a);
    gOutline.push([rx * Math.cos(a), rz * Math.sin(a)]);
  }
  b.extrude(gOutline, {
    at: [0, -0.015, 0.2],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.03,
    smoothing: 1,
    color: lit(scales(["#394058", "#323850", "#41485f"], "#161a28", { size: 0.3, width: 0.14 }), 2.4),
  });

  const puddles: [number, number, number, number, number][] = [
    [-0.1, 1.8, 0.5, 0.3, 10],
    [1.4, 1.25, 0.3, 0.2, -25],
    [-1.4, 1.3, 0.32, 0.22, 30],
    [1.0, 2.0, 0.26, 0.17, 5],
  ];
  for (const [x, z, rx, rz, ry] of puddles) {
    glow(
      put(new THREE.CircleGeometry(1, 18), "#ffffff", [x, 0.005, z], {
        dir: [0, 1, 0],
        axis: "z",
        up: [Math.sin(ry * D2R), 0, Math.cos(ry * D2R)],
        scale: [rx, rz, 1],
        texture: PUDDLE_TEX,
      }),
      0.7,
    );
  }

  // --- wheels ----------------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const cx = s * 1.12;
    const cy = 0.385;
    const cz = 0.0;
    cyl(0.065, 0.14, 8, WOOD_DK, [cx, cy, cz], { dir: [1, 0, 0] });
    cyl(0.03, 0.26, 6, IRON, [s * 1.0, cy, cz], { dir: [1, 0, 0] });
    put(new THREE.TorusGeometry(0.335, 0.04, 5, 18), WOOD, [cx, cy, cz], { dir: [1, 0, 0], axis: "z" });
    put(new THREE.TorusGeometry(0.375, 0.011, 4, 20), IRON, [cx, cy, cz], { dir: [1, 0, 0], axis: "z" });
    for (let i = 0; i < 10; i++) {
      const a = i * 36 * D2R;
      rod(
        [cx, cy + Math.sin(a) * 0.05, cz + Math.cos(a) * 0.05],
        [cx, cy + Math.sin(a) * 0.33, cz + Math.cos(a) * 0.33],
        0.016,
        WOOD,
        5,
      );
    }
    ball(0.025, IRON_LT, [s * 1.2, cy, cz], { seg: 6 });
  }

  // --- cabinets, counter, alcove ------------------------------------------------------------------------------------
  const cabWood = wood("#7b4c2a", "#5a3720", "y");
  for (const s of [1, -1]) {
    box(0.55, 0.76, 1.05, cabWood, [s * 0.725, 0.52, 0.025]);
    // feet
    for (const fz of [0.5, -0.45]) box(0.08, 0.14, 0.08, WOOD_DK, [s * 0.9, 0.07, fz]);
    // corner iron brackets
    box(0.03, 0.74, 0.03, IRON, [s * 0.99, 0.52, 0.53]);
    box(0.03, 0.74, 0.03, IRON, [s * 0.46, 0.52, 0.53]);
  }
  // right cabinet (model -x): sliding door with brace
  box(0.44, 0.62, 0.016, WOOD_LT, [-0.725, 0.52, 0.558]);
  rod([-0.94, 0.25, 0.568], [-0.51, 0.79, 0.568], 0.012, WOOD_DK, 4);
  rod([-0.94, 0.79, 0.568], [-0.51, 0.25, 0.568], 0.012, WOOD_DK, 4);
  cyl(0.014, 0.02, 6, IRON, [-0.56, 0.52, 0.575], { dir: [0, 0, 1] });
  // left cabinet (model +x): two drawers
  for (const dy of [0.32, 0.7]) {
    box(0.44, 0.3, 0.016, WOOD_LT, [0.725, dy, 0.558]);
    box(0.12, 0.018, 0.02, IRON, [0.725, dy + 0.03, 0.575]);
  }
  // alcove back wall
  box(0.9, 0.76, 0.03, wood("#5e3a21", "#3f2610", "y"), [0, 0.52, -0.44]);
  box(0.9, 0.04, 0.5, WOOD_DK, [0, 0.14, -0.2]); // low sill plank at the back of the alcove

  // counter top
  box(2.24, 0.06, 1.2, wood("#92623a", "#6e4527", "x", 1.15), [0, 0.93, 0.2]);
  box(2.24, 0.022, 0.03, WOOD_DK, [0, 0.971, 0.775]);
  box(2.24, 0.07, 0.04, WOOD_DK, [0, 0.875, 0.79]);

  // posts, headers and braces
  for (const sx of [1, -1])
    for (const pz of [0.6, -0.45]) cyl(0.04, 1.19, 6, WOOD, [sx * 1.03, 1.555, pz]);
  for (const sx of [1, -1]) rod([sx * 1.03, 2.08, 0.6], [sx * 1.03, 2.08, -0.45], 0.03, WOOD_DK, 5);
  rod([-1.03, 2.08, 0.6], [1.03, 2.08, 0.6], 0.03, WOOD_DK, 5);
  rod([-1.03, 2.08, -0.45], [1.03, 2.08, -0.45], 0.03, WOOD_DK, 5);

  // back wall
  box(2.0, 1.14, 0.04, wood("#6b4426", "#4a2c18", "y"), [0, 1.53, -0.46]);

  // --- roof -------------------------------------------------------------------------------------------------------------------
  const ROOF = lit(
    paint((p) => {
      const w = 0.5 + 0.5 * Math.sin(p.x * 36);
      const base = mix("#262e42", "#3b4864", w);
      const wet = smoothstep(0.55, 0.8, noise(p, 0.3, 4));
      return mix(base, "#56688a", wet * 0.35);
    }),
  );
  box(2.7, 0.05, 0.975, ROOF, [0, 2.21, 0.475], { rot: [13, 0, 0] });
  box(2.7, 0.05, 0.975, ROOF, [0, 2.21, -0.475], { rot: [-13, 0, 0] });
  box(2.76, 0.05, 0.14, lc("#1d2230"), [0, 2.335, 0]);
  box(2.7, 0.12, 0.03, wood("#4a2c18", "#2f1a0e", "x"), [0, 2.07, 0.965]);
  box(2.7, 0.12, 0.03, wood("#4a2c18", "#2f1a0e", "x"), [0, 2.07, -0.965]);
  // roundel trim on the front fascia
  for (let i = 0; i < 9; i++)
    cyl(0.02, 0.012, 8, lc("#e9c46a"), [-1.2 + i * 0.3, 2.07, 0.985], { dir: [0, 0, 1] });
  // rafters and ridge beam
  rod([-1.3, 2.245, 0], [1.3, 2.245, 0], 0.03, WOOD_DK, 5);
  for (let i = 0; i < 7; i++) {
    const x = -1.2 + i * 0.4;
    for (const sg of [1, -1]) {
      const y0 = 2.32 - 0.2309 * 0.02 - 0.075;
      const y1 = 2.32 - 0.2309 * 0.92 - 0.075;
      rod([x, y0, sg * 0.02], [x, y1, sg * 0.92], 0.02, WOOD_DK, 4);
    }
  }
  // chimney
  rod([0.35, 1.1, -0.21], [0.35, 1.1, -0.25], 0.04, IRON, 8);
  rod([0.35, 1.1, -0.25], [0.35, 2.5, -0.25], 0.04, IRON, 8);
  cone(0.09, 0.06, 8, IRON_LT, [0.35, 2.55, -0.25]);
  cyl(0.052, 0.04, 8, IRON_LT, [0.35, 1.6, -0.25]);

  // --- noren curtain --------------------------------------------------------------------------------------------------------
  rod([-0.95, 1.995, 0.66], [0.95, 1.995, 0.66], 0.014, lc("#b98a52"), 6);
  for (const hx of [-0.93, 0, 0.93]) rod([hx, 2.08, 0.62], [hx, 1.995, 0.66], 0.008, IRON, 4);
  const NX = [-0.675, -0.225, 0.225, 0.675];
  const SW: [number, number][] = [
    [7, 2],
    [-4, -1.5],
    [5, 1],
    [-8, 2.5],
  ];
  NX.forEach((x, i) => {
    const q = sway(SW[i][0], SW[i][1]);
    const off = new THREE.Vector3(0, -0.21, 0).applyQuaternion(q);
    put(new THREE.BoxGeometry(0.4, 0.42, 0.012), "#ffffff", [x + off.x, 1.98 + off.y, 0.67 + off.z], {
      quat: q,
      texture: norenTex(GLYPHS[i]),
    });
  });

  // --- paper lanterns --------------------------------------------------------------------------------------------------------
  const lanternGeo = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.085, -0.2),
      new THREE.Vector2(0.12, -0.16),
      new THREE.Vector2(0.16, -0.09),
      new THREE.Vector2(0.185, 0),
      new THREE.Vector2(0.16, 0.09),
      new THREE.Vector2(0.12, 0.16),
      new THREE.Vector2(0.085, 0.2),
    ],
    10,
  );
  const lantern = (top: THREE.Vector3, ax: number, az: number) => {
    const Sq = sway(ax, az);
    const Bq = sway(ax, az, -90);
    const W = (x: number, y: number, z: number) => top.clone().add(new THREE.Vector3(x, y, z).applyQuaternion(Sq)).toArray();
    ball(0.016, IRON, W(0, 0.0, 0), { seg: 5 });
    rod(W(0, 0, 0), W(0, -0.1, 0), 0.006, lc("#3a2418"), 4);
    cyl(0.095, 0.03, 8, lc("#1b1315"), W(0, -0.115, 0), { quat: Sq });
    glow(put(lanternGeo, "#ffffff", W(0, -0.33, 0), { quat: Bq, texture: LANTERN_TEX }), 1.1);
    cyl(0.095, 0.03, 8, lc("#1b1315"), W(0, -0.545, 0), { quat: Sq });
    ball(0.02, glow2(), W(0, -0.585, 0), { seg: 6 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      rod(W(0, -0.59, 0), W(Math.sin(a) * 0.025, -0.72, Math.cos(a) * 0.025), 0.004, lc("#c92f2a"), 3);
    }
  };
  function glow2() {
    return lc("#c92f2a");
  }
  lantern(new THREE.Vector3(1.06, 2.01, 0.99), 6, 3);
  lantern(new THREE.Vector3(-1.06, 2.01, 0.99), -5, -2);

  // interior hanging bulb
  rod([0, 2.24, -0.1], [0, 1.93, -0.1], 0.004, IRON, 3);
  cyl(0.018, 0.04, 6, IRON, [0, 1.92, -0.1]);
  glow(ball(0.065, "#ffcf80", [0, 1.85, -0.1], { seg: 8 }), 1.3);

  // drips off the front eave
  for (const [dx, dy] of [
    [-0.85, 1.9],
    [-0.55, 1.75],
    [-0.2, 1.93],
    [0.15, 1.8],
    [0.5, 1.95],
    [0.8, 1.7],
    [-0.35, 1.6],
    [0.3, 1.62],
  ]) {
    ball(0.008, "#cfe4ff", [dx, dy, 1.0], { seg: 5, scale: [1, 2.2, 1] });
    rod([dx, dy + 0.1, 1.0], [dx, dy + 0.025, 1.0], 0.0025, "#cfe4ff", 3);
  }

  // --- stove and pots --------------------------------------------------------------------------------------------------------
  const stoveP = lit(mottle("#34363f", "#1f2027", { size: 0.1, seed: 8 }));
  box(0.5, 0.2, 0.44, stoveP, [0.35, 1.06, 0.0]);
  box(0.52, 0.02, 0.46, IRON_LT, [0.35, 1.17, 0.0]);
  box(0.23, 0.15, 0.012, IRON, [0.35, 1.05, 0.223]);
  glow(
    put(new THREE.PlaneGeometry(0.18, 0.11), "#ffffff", [0.35, 1.05, 0.231], { dir: [0, 0, 1], axis: "z", texture: FLAME_TEX }),
    1.4,
  );
  for (const sx of [-1, 1]) ball(0.02, IRON_LT, [0.35 + sx * 0.2, 0.975, 0.18], { seg: 5 });

  // stockpot
  const potO: [number, number][] = [
    [0, 0],
    [0.17, 0],
    [0.19, 0.02],
    [0.192, 0.31],
    [0.205, 0.335],
    [0.196, 0.34],
    [0.18, 0.325],
    [0.178, 0.04],
    [0, 0.04],
  ];
  b.lathe(potO, { at: [0.35, 1.18, 0.0], segments: 14, color: STEEL });
  cyl(0.18, 0.006, 14, "#d89a4a", [0.35, 1.18 + 0.285, 0.0]);
  for (const sx of [1, -1]) ring(0.035, 0.009, IRON_LT, [0.35 + sx * 0.215, 1.18 + 0.27, 0], [0, 0, 1], 8);
  // ladle resting in the pot
  rod([0.43, 1.2 + 0.28, 0.0], [0.6, 1.2 + 0.55, 0.12], 0.007, lc("#caa66a"), 5);
  ball(0.032, STEEL, [0.43, 1.2 + 0.275, 0.0], { seg: 6, scale: [1, 0.55, 1] });
  // pot lid beside
  cyl(0.15, 0.012, 12, STEEL, [0.05, 0.976, 0.2]);
  ball(0.018, IRON, [0.05, 0.995, 0.2], { seg: 5 });

  // second burner + copper kettle
  box(0.4, 0.2, 0.4, stoveP, [-0.4, 1.06, 0.0]);
  box(0.42, 0.02, 0.42, IRON_LT, [-0.4, 1.17, 0.0]);
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.115, 0.04],
      [0.105, 0.1],
      [0.07, 0.135],
      [0.03, 0.15],
      [0, 0.15],
    ],
    { at: [-0.4, 1.18, 0.0], segments: 10, color: COPPER },
  );
  ball(0.02, IRON, [-0.4, 1.34, 0.0], { seg: 5 });
  b.sweep(catmull([[-0.31, 1.24, 0.0], [-0.25, 1.28, 0.0], [-0.2, 1.34, 0.0]]), [0.024, 0.012], { color: COPPER, sides: 6 });
  put(new THREE.TorusGeometry(0.09, 0.008, 4, 10, Math.PI), IRON, [-0.4, 1.3, 0.0], { rot: [0, 90, 0] });

  // cutting board, knife and scallions
  box(0.26, 0.02, 0.2, WOOD_LT, [-0.05, 0.97, 0.12], { rot: [0, 8, 0] });
  box(0.12, 0.008, 0.022, STEEL, [-0.1, 0.988, 0.13], { rot: [0, 8, 0] });
  box(0.07, 0.016, 0.02, lc("#6a4526"), [-0.0, 0.988, 0.135], { rot: [0, 8, 0] });
  for (let i = 0; i < 6; i++)
    ball(0.009, lc("#78b84a"), [-0.07 + i * 0.022, 0.99, 0.06 + (i % 2) * 0.02], { seg: 5, scale: [1, 0.6, 1] });

  // --- ramen bowls -------------------------------------------------------------------------------------------------------------
  const BOWL_O: [number, number][] = [
    [0, 0],
    [0.045, 0],
    [0.05, 0.014],
    [0.088, 0.045],
    [0.118, 0.088],
    [0.128, 0.118],
    [0.118, 0.118],
    [0.106, 0.09],
    [0.075, 0.052],
    [0, 0.038],
  ];
  const bowlP = lit(
    paint((_p, n, s) => {
      const h = s[0];
      const ang = (((s[1] % 360) + 360) % 360);
      if (h > 0.108 || (h > 0.058 && h < 0.07)) return INDIGO;
      if (n.y > 0.5) return "#e8dcc2";
      if (ang % 40 < 14 && h > 0.078 && h < 0.1) return "#c0392b";
      return PORC;
    }),
  );
  const steam = (pts: number[][], size: [number, number], seed: number, strength = 0.5) =>
    glow(
      b.cards(
        pts.map((p) => frame(p, [0, 1, 0])),
        STEAM,
        { size, lean: 8, bend: 28, flow: [0.25, 0, 0.75], vary: 0.3, spin: 25, rng: rng(seed), cross: true, color: "#fff0dd" },
      ),
      strength,
    );
  const bowl = (x: number, z: number, full: boolean) => {
    const y0 = 0.96;
    b.lathe(BOWL_O, { at: [x, y0, z], segments: 12, color: bowlP });
    const top = y0 + (full ? 0.092 : 0.07);
    cyl(0.104, 0.006, 12, full ? lc("#c98a3c") : lc("#a9712f"), [x, top - 0.004, z]);
    put(new THREE.SphereGeometry(0.075, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#ffffff", [x, top - 0.002, z], {
      texture: NOODLE_TEX,
      scale: [1, full ? 0.55 : 0.4, 1],
    });
    if (full) {
      for (const [dx, dz, rx] of [
        [0.045, -0.05, -35],
        [0.065, -0.015, -50],
      ])
        cyl(0.042, 0.007, 9, lc("#b97a5b"), [x + dx, top + 0.026, z + dz], { rot: [rx, 0, 10] });
      ball(0.028, lc("#fbf5ea"), [x - 0.04, top + 0.022, z + 0.05], { seg: 7, scale: [1, 0.8, 1.15] });
      ball(0.014, lc("#f5a623"), [x - 0.04, top + 0.034, z + 0.05], { seg: 6 });
      const tq = new THREE.Quaternion().setFromEuler(new THREE.Euler(-15 * D2R, 0, 0));
      cyl(0.03, 0.008, 9, lc("#fbf3f0"), [x - 0.05, top + 0.022, z - 0.05], { quat: tq });
      put(new THREE.CircleGeometry(0.026, 10), "#ffffff", [x - 0.05, top + 0.0275, z - 0.0495], {
        quat: tq.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-90 * D2R, 0, 0))),
        texture: NARUTO_TEX,
      });
      box(0.05, 0.065, 0.003, lc("#1f3a2a"), [x + 0.075, top + 0.04, z + 0.02], { rot: [0, 20, 15] });
      for (let i = 0; i < 6; i++) {
        const a = i * 1.1;
        ball(0.008, lc("#78b84a"), [x + Math.cos(a) * 0.03, top + 0.038, z + Math.sin(a) * 0.03 + 0.01], {
          seg: 5,
          scale: [1, 0.5, 1],
        });
      }
      for (let i = 0; i < 3; i++) box(0.02, 0.006, 0.008, lc("#c2955a"), [x + 0.01 + i * 0.012, top + 0.04, z - 0.02 + i * 0.01], { rot: [0, i * 40, 0] });
    }
  };
  bowl(0.66, 0.6, true);
  bowl(-0.62, 0.6, false);
  // chopsticks
  for (const k of [0, 1]) {
    rod([0.54, 1.085, 0.66 + k * 0.014], [0.8, 1.1, 0.56 + k * 0.014], 0.0045, lc("#d9b27a"), 5);
  }
  rod([-0.78, 1.0, 0.7], [-0.52, 1.1, 0.5], 0.0045, lc("#d9b27a"), 5);
  rod([-0.77, 1.0, 0.715], [-0.51, 1.1, 0.515], 0.0045, lc("#d9b27a"), 5);
  steam([[0.66, 1.1, 0.6], [0.7, 1.1, 0.58]], [0.1, 0.22], 31, 0.45);
  steam([[-0.62, 1.04, 0.6]], [0.08, 0.14], 32, 0.35);

  // stack of empty bowls
  for (let i = 0; i < 3; i++) b.lathe(BOWL_O, { at: [-0.82 + i * 0.004, 0.96 + i * 0.042, 0.02], segments: 12, color: bowlP });

  // condiments row
  b.lathe(
    [
      [0, 0],
      [0.026, 0],
      [0.03, 0.05],
      [0.014, 0.11],
      [0.016, 0.135],
      [0, 0.135],
    ],
    { at: [-0.2, 0.96, 0.64], segments: 8, color: lc("#2c1b10") },
  );
  cyl(0.018, 0.02, 8, lc("#c0392b"), [-0.2, 1.105, 0.64]);
  box(0.04, 0.05, 0.002, lc("#f1e2bd"), [-0.2, 1.0, 0.668]);
  cyl(0.03, 0.07, 8, lc("#d8d4c8"), [-0.1, 0.995, 0.66]);
  cyl(0.032, 0.014, 8, lc("#9b2d22"), [-0.1, 1.037, 0.66]);
  cyl(0.045, 0.1, 8, lc("#c7b99a"), [0.1, 1.01, 0.64]);
  for (let i = 0; i < 6; i++) {
    const a = i * 1.05;
    rod(
      [0.1 + Math.cos(a) * 0.02, 1.04, 0.64 + Math.sin(a) * 0.02],
      [0.1 + Math.cos(a) * 0.035, 1.17 + (i % 3) * 0.015, 0.64 + Math.sin(a) * 0.035],
      0.004,
      lc("#d9b27a"),
      4,
    );
  }
  box(0.08, 0.08, 0.05, lc("#8b6b4a"), [0.28, 1.0, 0.7], { rot: [0, -10, 0] });
  box(0.07, 0.005, 0.045, lc("#f1e2bd"), [0.28, 1.042, 0.7], { rot: [0, -10, 0] });

  // lucky cat
  {
    const mx = -0.95;
    const mz = 0.6;
    const my = 0.96;
    ball(0.05, lc("#f6f0e2"), [mx, my + 0.055, mz], { scale: [1, 1.15, 0.9] });
    ball(0.046, lc("#f6f0e2"), [mx, my + 0.13, mz], { scale: [1.15, 0.95, 0.95] });
    for (const sx of [1, -1]) {
      cone(0.016, 0.028, 4, lc("#f6f0e2"), [mx + sx * 0.034, my + 0.17, mz]);
      ball(0.006, lc("#2a1a14"), [mx + sx * 0.02, my + 0.135, mz + 0.043], { seg: 5 });
    }
    ball(0.006, lc("#e48a96"), [mx, my + 0.122, mz + 0.047], { seg: 5 });
    ring(0.04, 0.007, lc("#c0392b"), [mx, my + 0.095, mz], [0, 1, 0], 8);
    ball(0.01, lc("#e9bf4a"), [mx, my + 0.085, mz + 0.042], { seg: 6 });
    cyl(0.022, 0.006, 8, lc("#e9bf4a"), [mx, my + 0.045, mz + 0.043], { dir: [0, 0, 1] });
    rod([mx + 0.04, my + 0.06, mz + 0.02], [mx + 0.07, my + 0.14, mz + 0.03], 0.013, lc("#f6f0e2"), 5);
    ball(0.016, lc("#f6f0e2"), [mx + 0.07, my + 0.15, mz + 0.03], { seg: 6 });
    ball(0.015, lc("#f6f0e2"), [mx - 0.035, my + 0.03, mz + 0.035], { seg: 6 });
    box(0.1, 0.02, 0.08, lc("#c0392b"), [mx, my + 0.01, mz]);
  }

  // --- back wall: menu, towel, hooks, shelves ----------------------------------------------------------------------------------
  put(new THREE.BoxGeometry(0.5, 0.66, 0.03), "#ffffff", [-0.55, 1.55, -0.425], { texture: MENU_TEX });
  rod([-0.8, 1.9, -0.435], [-0.3, 1.9, -0.435], 0.008, IRON, 4);
  // tenugui towel
  box(0.16, 0.28, 0.008, lit(stripes("#2c4a86", "#e9e2cf", { size: 0.035, axis: "y", width: 0.45 })), [-0.86, 1.28, -0.425]);
  rod([-0.94, 1.43, -0.43], [-0.78, 1.43, -0.43], 0.007, lc("#b98a52"), 4);
  // hooks with ladle and strainer
  for (const hx of [0.78, 0.9]) ball(0.012, IRON_LT, [hx, 1.62, -0.43], { seg: 5 });
  rod([0.78, 1.6, -0.425], [0.78, 1.18, -0.425], 0.007, lc("#caa66a"), 5);
  ball(0.035, STEEL, [0.78, 1.16, -0.425], { seg: 6, scale: [1, 0.6, 0.6] });
  ring(0.04, 0.005, STEEL, [0.9, 1.5, -0.425], [0, 0, 1], 10);
  rod([0.9, 1.54, -0.425], [0.9, 1.62, -0.425], 0.006, STEEL, 4);

  for (const sy of [1.36, 1.68]) {
    box(1.1, 0.03, 0.14, WOOD_X, [0.4, sy, -0.37]);
    for (const bx of [-0.1, 0.9]) rod([bx, sy - 0.02, -0.4], [bx, sy - 0.12, -0.43], 0.012, WOOD_DK, 4);
  }
  // shelf 1: sake bottles, jars, radio
  const bottleO: [number, number][] = [
    [0, 0],
    [0.032, 0],
    [0.036, 0.1],
    [0.022, 0.15],
    [0.014, 0.2],
    [0.016, 0.22],
    [0, 0.22],
  ];
  [0.08, 0.17].forEach((bx, i) => {
    b.lathe(bottleO, { at: [bx, 1.375, -0.37], segments: 8, color: lc(i ? "#4a2f1a" : "#2d5a3a") });
    cyl(0.037, 0.06, 8, lc("#f1e2bd"), [bx, 1.43, -0.37 + 0.003]);
    cyl(0.017, 0.016, 8, lc("#c0392b"), [bx, 1.6, -0.37]);
  });
  [
    [0.5, "#7a3a2a"],
    [0.62, "#a8924a"],
    [0.74, "#5a7a3a"],
  ].forEach(([jx, col]) => {
    cyl(0.045, 0.1, 8, lc(col as string), [jx as number, 1.43, -0.37]);
    cyl(0.047, 0.02, 8, lc("#e9dcc0"), [jx as number, 1.49, -0.37]);
  });
  box(0.17, 0.11, 0.07, lc("#6a3a20"), [0.9, 1.43, -0.37]);
  glow(box(0.08, 0.02, 0.005, "#ffb04a", [0.9, 1.45, -0.333]), 1.2);
  for (let i = 0; i < 3; i++) ball(0.008, IRON_LT, [0.86 + i * 0.015, 1.41, -0.33], { seg: 5 });
  rod([0.95, 1.485, -0.37], [1.0, 1.62, -0.36], 0.003, IRON_LT, 3);
  // shelf 2: plant, bowls, cups
  cyl(0.05, 0.065, 8, lc("#b3592f"), [0.1, 1.725, -0.37]);
  cyl(0.047, 0.008, 8, lc("#3a2a1a"), [0.1, 1.755, -0.37]);
  b.cards(
    [...Array(9)].map((_, i) =>
      frame([0.1 + Math.cos(i * 2.4) * 0.025, 1.755, -0.37 + Math.sin(i * 2.4) * 0.025], [0, 1, 0]),
    ),
    LEAF_TEX,
    {
      size: [0.06, 0.12],
      lean: 28,
      flow: (_f: unknown, i: number) => [Math.cos(i * 2.4), 0.2, Math.sin(i * 2.4)],
      vary: 0.3,
      rng: rng(5),
      cross: true,
    } as never,
  );
  for (let i = 0; i < 3; i++) b.lathe(BOWL_O, { at: [0.5, 1.695 + i * 0.035, -0.37], segments: 10, color: bowlP });
  for (let i = 0; i < 3; i++) {
    cyl(0.026, 0.05, 8, lc("#e8dcc2"), [0.72 + i * 0.07, 1.72, -0.37]);
    cyl(0.027, 0.01, 8, lc(INDIGO), [0.72 + i * 0.07, 1.74, -0.37]);
  }

  // --- stools ---------------------------------------------------------------------------------------------------------------------
  const stool = (x: number, z: number, yaw: number, cushion?: string) => {
    cyl(0.19, 0.05, 10, WOOD, [x, 0.475, z]);
    if (cushion) cyl(0.17, 0.04, 10, lc(cushion), [x, 0.52, z]);
    for (let i = 0; i < 3; i++) {
      const a = (yaw + i * 120) * D2R;
      rod([x + Math.sin(a) * 0.12, 0.46, z + Math.cos(a) * 0.12], [x + Math.sin(a) * 0.21, 0.0, z + Math.cos(a) * 0.21], 0.022, WOOD_DK, 5);
    }
    ring(0.165, 0.012, WOOD_DK, [x, 0.2, z], [0, 1, 0], 10);
  };
  stool(-0.62, 1.12, 10, "#b83a32");
  stool(0.02, 1.02, 50);
  stool(0.66, 1.15, 25, "#3d5a92");

  // --- cart shafts ---------------------------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    rod([s * 0.7, 0.55, -0.5], [s * 0.7, 0.45, -1.45], 0.035, WOOD, 6);
    rod([s * 0.7, 0.46, -1.35], [s * 0.7, 0.0, -1.35], 0.025, WOOD_DK, 5);
  }
  rod([-0.7, 0.45, -1.45], [0.7, 0.45, -1.45], 0.03, WOOD, 6);

  // --- umbrella, bucket, crate ------------------------------------------------------------------------------------------------
  b.sweep(
    polyline([
      [1.28, 0.0, 0.95],
      [1.08, 1.08, 0.62],
    ]),
    prof([
      [0, 0.007],
      [0.3, 0.01],
      [0.42, 0.03],
      [0.6, 0.047],
      [0.82, 0.03],
      [0.92, 0.012],
      [1, 0.014],
    ]),
    {
      sides: 8,
      color: lc("#7a5230"),
      bands: [
        [0.34, lc("#7a5230")],
        [0.9, lit(stripes("#d9a441", "#8a2d1e", { size: 0.04, axis: "y", width: 0.3 }))],
        [1, lc("#7a5230")],
      ],
    } as never,
  );
  // bucket
  b.lathe(
    [
      [0, 0],
      [0.13, 0],
      [0.16, 0.27],
      [0.145, 0.27],
      [0.12, 0.03],
      [0, 0.03],
    ],
    { at: [-1.6, 0, 0.55], segments: 10, color: WOOD },
  );
  cyl(0.146, 0.005, 10, lc("#2c3c58"), [-1.6, 0.2, 0.55]);
  for (const hy of [0.07, 0.2]) ring(0.14 + hy * 0.1, 0.008, IRON, [-1.6, hy, 0.55], [0, 1, 0], 10);
  put(new THREE.TorusGeometry(0.15, 0.006, 4, 10, Math.PI), IRON, [-1.6, 0.27, 0.55]);
  rod([-1.6, 0.31, 0.55], [-1.5, 0.12, 0.62], 0.007, lc("#caa66a"), 5);
  ball(0.03, lc("#caa66a"), [-1.5, 0.11, 0.62], { seg: 6, scale: [1, 0.6, 1] });
  // vegetable crate
  const crateP = wood("#9a6a3a", "#7a5028", "x");
  box(0.5, 0.26, 0.36, crateP, [1.58, 0.13, -0.3], { rot: [0, 12, 0] });
  box(0.52, 0.03, 0.38, WOOD_DK, [1.58, 0.255, -0.3], { rot: [0, 12, 0] });
  for (let i = 0; i < 4; i++)
    rod([1.45 + i * 0.07, 0.25, -0.3 + i * 0.012], [1.45 + i * 0.07 + 0.02, 0.5 + (i % 2) * 0.06, -0.3 + i * 0.012], 0.014, lc("#e9efe0"), 5);
  for (let i = 0; i < 4; i++) {
    const bx = 1.45 + i * 0.07;
    rod([bx + 0.02, 0.5 + (i % 2) * 0.06, -0.28], [bx + 0.04, 0.62 + (i % 2) * 0.06, -0.26], 0.014, lc("#5aa244"), 5);
  }
  for (let i = 0; i < 3; i++) {
    cone(0.04, 0.24, 6, lc("#f3f0e4"), [1.5 + i * 0.09, 0.4, -0.18], { rot: [180, 0, 8 - i * 8] });
    cone(0.03, 0.1, 5, lc("#4f9a47"), [1.5 + i * 0.09, 0.57, -0.18]);
  }

  // --- the cat, asleep under the counter -----------------------------------------------------------------------------------------------
  const O = { x: 0.0, z: 0.14 };
  const cp = (deg: number, R: number, y: number) => [O.x + R * Math.sin(deg * D2R), y, O.z + R * Math.cos(deg * D2R)];
  const ORG = "#e8913a";
  const DKO = "#c0601e";
  const CRM = "#f6ead2";
  // cushion
  box(0.52, 0.06, 0.52, lit(mottle("#a8322d", "#8a2420", { size: 0.1, seed: 9 })), [0, 0.03, 0.14], { rot: [0, 18, 0] });
  for (const [cx2, cz2] of [
    [0.26, 0.26],
    [-0.26, 0.26],
    [0.26, -0.26],
    [-0.26, -0.26],
  ]) {
    const a = 18 * D2R;
    ball(0.02, lc("#e9bf4a"), [Math.cos(a) * cx2 + Math.sin(a) * cz2, 0.04, 0.14 - Math.sin(a) * cx2 + Math.cos(a) * cz2], { seg: 5 });
  }
  const coat = lit(
    paint((_p, _n, s) => {
      const up = Math.cos(s[1] * D2R);
      if (up < -0.55) return CRM;
      return Math.sin(s[0] * 34) > 0.45 && up > -0.2 ? DKO : ORG;
    }),
    1.15,
  );
  b.sweep(
    catmull([cp(100, 0.13, 0.165), cp(140, 0.14, 0.17), cp(185, 0.145, 0.172), cp(230, 0.145, 0.168), cp(270, 0.135, 0.155), cp(292, 0.12, 0.14)]),
    [0.072, 0.095, 0.108, 0.108, 0.095, 0.075],
    { color: coat, sides: 8 },
  );
  const tailP = lit(
    paint((_p, _n, s) => (s[0] > 0.86 ? CRM : Math.sin(s[0] * 30) > 0.5 ? DKO : ORG)),
    1.15,
  );
  b.sweep(
    catmull([cp(292, 0.12, 0.12), cp(310, 0.17, 0.09), cp(335, 0.22, 0.078), cp(360, 0.235, 0.072), cp(385, 0.21, 0.07)]),
    [0.045, 0.038, 0.032, 0.028, 0.022],
    { color: tailP, sides: 6 },
  );
  ball(0.075, lit(ORG, 1.15), cp(262, 0.145, 0.125), { seg: 8, scale: [1, 0.95, 1.1] });
  ball(0.03, lc(CRM, 1.15), cp(286, 0.19, 0.075), { seg: 6, scale: [1, 0.8, 1.3] });

  const FWD = new THREE.Vector3(-0.26, 0, 0.97).normalize();
  const UPV = new THREE.Vector3(0, 1, 0);
  const SIDE = new THREE.Vector3(FWD.z, 0, -FWD.x);
  const H = new THREE.Vector3(...(cp(65, 0.16, 0.125) as [number, number, number]));
  const hp = (f: number, u: number, s: number) =>
    H.clone().addScaledVector(FWD, f).addScaledVector(UPV, u).addScaledVector(SIDE, s).toArray();
  const headPaint = lit(
    paint((p, _n) => {
      const d = p.clone().sub(H);
      const f = d.dot(FWD);
      const sd = d.dot(SIDE);
      const u = d.y;
      if (f > 0.05 && u < 0.02 && Math.abs(sd) < 0.055) return CRM;
      if (f > -0.01 && u < -0.025) return CRM;
      if (u > 0.04 && f > -0.03 && Math.abs(sd) < 0.05 && Math.sin(sd * 110) > 0.6) return DKO;
      return ORG;
    }),
    1.2,
  );
  const head = put(new THREE.SphereGeometry(0.085, 10, 7), headPaint, H.toArray(), {
    dir: FWD.toArray(),
    axis: "z",
    scale: [1.08, 0.9, 1],
    smooth: true,
  });
  for (const s of [1, -1]) {
    const base = new THREE.Vector3(...(hp(-0.005, 0.062, s * 0.055) as [number, number, number]));
    const dir = UPV.clone().addScaledVector(SIDE, s * 0.35).addScaledVector(FWD, -0.1).normalize();
    cone(0.038, 0.07, 4, lc(ORG, 1.2), base.clone().addScaledVector(dir, 0.02).toArray(), { dir: dir.toArray() });
    cone(0.022, 0.05, 4, lc("#e89aa0", 1.2), base.clone().addScaledVector(dir, 0.018).addScaledVector(FWD, 0.012).toArray(), {
      dir: dir.toArray(),
    });
    // front paws
    ball(0.03, lc(CRM, 1.2), hp(0.095, -0.075, s * 0.05), { seg: 6, scale: [1, 0.8, 1.3] });
    // whiskers
    for (let k = 0; k < 3; k++)
      rod(hp(0.075, -0.018 + k * 0.012, s * 0.035), hp(0.07, -0.03 + k * 0.022, s * 0.15), 0.0016, "#f3e9d8", 3);
  }
  ball(0.03, lc(CRM, 1.2), hp(0.072, -0.02, 0), { seg: 6 });
  ball(0.011, lc("#e48a96", 1.2), hp(0.1, -0.006, 0), { seg: 5 });
  const eyeSurf = b.surface(head);
  const az = Math.atan2(FWD.x, FWD.z) / D2R;
  for (const s of [1, -1]) {
    const hit = eyeSurf.around(H.toArray()).at(az + s * 34, 6);
    if (hit) b.decal(head, EYE_TEX, { at: hit, size: [0.042, 0.022], mirror: s > 0, up: [0, 1, 0] } as never);
  }
  glow(
    b.cards([frame([0.2, 0.3, 0.36], [0, 1, 0])], ZZZ_TEX, { size: [0.16, 0.22], flow: [0, 0, 1], lean: 0 }),
    0.6,
  );

  // --- steam from the pot, kettle and chimney ---------------------------------------------------------------------------------------------
  steam(
    [
      [0.3, 1.52, -0.02],
      [0.4, 1.53, 0.04],
      [0.35, 1.52, 0.08],
      [0.28, 1.53, 0.04],
      [0.42, 1.52, -0.04],
    ],
    [0.16, 0.42],
    41,
    0.5,
  );
  steam([[-0.2, 1.36, 0.0]], [0.08, 0.2], 42, 0.4);
  steam([[0.35, 2.58, -0.25]], [0.12, 0.3], 43, 0.3);

  return b.root;
}
