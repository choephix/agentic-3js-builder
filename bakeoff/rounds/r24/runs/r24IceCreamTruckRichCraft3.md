```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mix, smoothstep, cells, polyline, arc, bezier, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Ice Cream Truck",
  description:
    "A chubby pastel ice cream van in a cosy Animal Crossing style: scalloped pink and mint body with cream polka dots, a smiling grille and round pink-rimmed headlights, a striped awning over a serving window with a cat vendor inside, flower hubcaps, string bulbs, and a giant waffle-cone sign with sprinkled scoops on the roof.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const PINK = "#ff9bb7";
const PINK_D = "#e8739b";
const MINT = "#8fe3c6";
const MINT_D = "#5cbba4";
const SKY = "#8fd2f2";
const SKY_D = "#5ea6d8";
const CREAM = "#fff4da";
const CREAM_D = "#ecd5a8";
const BUTTER = "#ffd96b";
const WAFFLE = "#e8aa5c";
const WAFFLE_L = "#f3c27a";
const WAFFLE_D = "#b4733a";
const CHERRY = "#ea4560";
const INK = "#5a4036";
const DARK = "#4a4150";
const ARCH = "#3f3a48";
const TIRE = "#4a4454";
const CHROME = "#dfe8ee";
const MUD = "#8a6a4a";
const LILAC = "#c9a6f0";
const LEAF = "#6b9a3c";

const RAD = Math.PI / 180;

function arcPts(cx: number, cy: number, r: number, a0: number, a1: number, n: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const a = (a0 + ((a1 - a0) * i) / n) * RAD;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// Paints: warm light on top, cool shade below, grime near the ground

const soft = (light: string, dark: string, mud = false) =>
  paint((p, n) => {
    const c = mix(dark, light, smoothstep(-0.7, 0.8, n.y));
    return mud ? mix(c, MUD, 0.32 * smoothstep(0.9, 0.55, p.y)) : c;
  });

const PINK_P = soft(PINK, PINK_D, true);
const MINT_P = soft(MINT, MINT_D, true);
const SKY_P = soft(SKY, SKY_D, true);
const CREAM_P = soft(CREAM, CREAM_D, true);
const PINK_S = soft("#ffb3c8", PINK_D);
const MINT_S = soft("#a8f0d6", MINT_D);
const CREAM_S = soft(CREAM, CREAM_D);
const TIRE_P = soft("#5a5466", "#2f2b36");
const ARCH_P = soft("#4f4959", "#2c2833");

const scallop = (along: number) => 1.04 - 0.075 * Math.abs(Math.sin(along * 8.5));

const BOX_PAINT = paint((p, n) => {
  if (n.y > 0.72 && p.y > 2.3) return CREAM_P;
  const along = Math.abs(n.z) > 0.6 ? p.x : p.z;
  const edge = scallop(along);
  if (Math.abs(p.y - edge) < 0.02) return CREAM_P;
  if (p.y < edge) return MINT_P;
  if (n.y < 0.6) {
    const c = cells(p, 0.34, 3);
    if (c.d1 < 0.15) return CREAM_P;
  }
  return PINK_P;
});

const CAB_PAINT = paint((p, n) => {
  if (n.y > 0.6 && p.y > 1.95) return CREAM_P;
  const along = Math.abs(n.z) > 0.6 ? p.x : p.z;
  const edge = scallop(along);
  if (Math.abs(p.y - edge) < 0.02) return CREAM_P;
  if (p.y < edge) return MINT_P;
  return SKY_P;
});

const GLASS = paint((p, _n) => {
  const c = mix("#9fd9f4", "#e4f7ff", smoothstep(1.3, 2.0, p.y));
  const q = (((p.y * 0.9 + p.z * 0.8 + p.x * 0.6) % 0.8) + 0.8) % 0.8;
  return q < 0.07 || (q > 0.16 && q < 0.2) ? mix(c, "#ffffff", 0.8) : c;
});

const AWNING_PAINT = paint((p, _n) => {
  const k = Math.floor((p.z + 1.8) / 0.2);
  return ((k % 2) + 2) % 2 === 0 ? PINK_S : CREAM_S;
});

const SIGN_CX = 0;
const SIGN_CZ = -0.85;
const WAFFLE_PAINT = paint((p, n) => {
  const a = Math.atan2(p.x - SIGN_CX, p.z - SIGN_CZ) / (Math.PI / 5);
  const h = p.y / 0.1;
  const near = (x: number) => Math.abs(x - Math.round(x));
  if (near(a + h) < 0.08 || near(a - h) < 0.08) return WAFFLE_D;
  return mix("#cf8f48", WAFFLE_L, smoothstep(-0.5, 0.8, n.y));
});

// ---------------------------------------------------------------------------------------------------------------
// Textures

const WINDOW_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 72">
  <defs><pattern id="st" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="10" height="20" fill="#ffd9e2"/></pattern></defs>
  <rect width="150" height="72" fill="#ffe7c4"/>
  <rect width="150" height="72" fill="url(#st)"/>
  <rect x="0" y="0" width="150" height="6" fill="#ffffff" opacity="1"/>
  <path d="M0 6 Q10 14 20 6 Q30 14 40 6 Q50 14 60 6 Q70 14 80 6 Q90 14 100 6 Q110 14 120 6 Q130 14 140 6 L150 6 L150 0 L0 0Z" fill="#e8739b"/>
  <rect x="5" y="30" width="36" height="3.5" rx="1.5" fill="#b4733a" stroke="#5a4036" stroke-width="1.2"/>
  <rect x="9" y="19" width="9" height="11" rx="2.5" fill="#8fe3c6" stroke="#5a4036" stroke-width="1.2"/>
  <rect x="21" y="21" width="8" height="9" rx="2.5" fill="#ffd96b" stroke="#5a4036" stroke-width="1.2"/>
  <rect x="31" y="18" width="8" height="12" rx="2.5" fill="#ff9bb7" stroke="#5a4036" stroke-width="1.2"/>
  <rect x="109" y="30" width="36" height="3.5" rx="1.5" fill="#b4733a" stroke="#5a4036" stroke-width="1.2"/>
  <path d="M114 20 L119 30 L124 20Z" fill="#e8aa5c" stroke="#5a4036" stroke-width="1.2" stroke-linejoin="round"/>
  <circle cx="119" cy="16" r="5.5" fill="#ff9bb7" stroke="#5a4036" stroke-width="1.2"/>
  <path d="M128 20 L133 30 L138 20Z" fill="#e8aa5c" stroke="#5a4036" stroke-width="1.2" stroke-linejoin="round"/>
  <circle cx="133" cy="16" r="5.5" fill="#8fe3c6" stroke="#5a4036" stroke-width="1.2"/>
  <path d="M50 72 Q52 52 75 50 Q98 52 100 72Z" fill="#fff4da" stroke="#5a4036" stroke-width="2"/>
  <path d="M62 72 L65 56 Q75 61 85 56 L88 72Z" fill="#ff9bb7" stroke="#5a4036" stroke-width="1.5"/>
  <path d="M58 33 L55 13 L71 24Z" fill="#f4b36a" stroke="#5a4036" stroke-width="2" stroke-linejoin="round"/>
  <path d="M92 33 L95 13 L79 24Z" fill="#f4b36a" stroke="#5a4036" stroke-width="2" stroke-linejoin="round"/>
  <path d="M59 28 L58 18 L66 24Z" fill="#ff9bb7"/>
  <path d="M91 28 L92 18 L84 24Z" fill="#ff9bb7"/>
  <ellipse cx="75" cy="37" rx="21" ry="17" fill="#f4b36a" stroke="#5a4036" stroke-width="2"/>
  <path d="M60 26 Q75 6 90 26 Q75 21 60 26Z" fill="#ffffff" stroke="#5a4036" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M60.5 26 Q75 21 89.5 26 L89 29 Q75 24 61 29Z" fill="#e8739b"/>
  <ellipse cx="67.5" cy="37" rx="2.8" ry="3.6" fill="#5a4036"/>
  <ellipse cx="82.5" cy="37" rx="2.8" ry="3.6" fill="#5a4036"/>
  <circle cx="68.4" cy="35.6" r="1.1" fill="#ffffff"/>
  <circle cx="83.4" cy="35.6" r="1.1" fill="#ffffff"/>
  <ellipse cx="61" cy="43" rx="4.2" ry="2.6" fill="#ff9bb7"/>
  <ellipse cx="89" cy="43" rx="4.2" ry="2.6" fill="#ff9bb7"/>
  <ellipse cx="75" cy="41.5" rx="2.5" ry="1.8" fill="#e8739b"/>
  <path d="M69.5 45 Q72.5 49.5 75 45 Q77.5 49.5 80.5 45" stroke="#5a4036" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M52 40 L61 41 M52 45 L61 44 M98 40 L89 41 M98 45 L89 44" stroke="#5a4036" stroke-width="1.1" stroke-linecap="round"/>
  <path d="M70 52 L75 57 L80 52 L80 55 L75 60 L70 55Z" fill="#8fd2f2" stroke="#5a4036" stroke-width="1.2" stroke-linejoin="round"/>
  <rect x="0" y="62" width="150" height="10" fill="#fff4da"/>
  <rect x="0" y="62" width="150" height="2.6" fill="#e8739b"/>
</svg>`,
  { size: 768 },
);

const BANNER_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 56">
  <rect x="3" y="3" width="334" height="50" rx="25" fill="#fff6e0" stroke="#e8739b" stroke-width="5"/>
  <path d="M30 14 L40 40 L50 14Z" fill="#e8aa5c" stroke="#5a4036" stroke-width="2.4" stroke-linejoin="round"/>
  <circle cx="40" cy="12" r="9" fill="#ff9bb7" stroke="#5a4036" stroke-width="2.4"/>
  <path d="M290 14 L300 40 L310 14Z" fill="#e8aa5c" stroke="#5a4036" stroke-width="2.4" stroke-linejoin="round"/>
  <circle cx="300" cy="12" r="9" fill="#8fe3c6" stroke="#5a4036" stroke-width="2.4"/>
  <text x="170" y="39" text-anchor="middle" font-family="Arial Rounded MT Bold, Verdana, sans-serif" font-weight="bold" font-size="34" letter-spacing="2" fill="#e5557a" stroke="#ffffff" stroke-width="1">ICE CREAM</text>
</svg>`,
  { size: 1024 },
);

const MENU_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80">
  <rect x="2" y="2" width="96" height="76" rx="9" fill="#b4733a" stroke="#5a4036" stroke-width="3"/>
  <rect x="8" y="8" width="84" height="64" rx="6" fill="#35504a" stroke="#5a4036" stroke-width="1.5"/>
  <text x="50" y="23" text-anchor="middle" font-family="Verdana, sans-serif" font-weight="bold" font-size="13" fill="#ffd96b">MENU</text>
  <path d="M20 27 H80" stroke="#fff4da" stroke-width="1" stroke-dasharray="3 2"/>
  <text x="16" y="38" font-family="Verdana, sans-serif" font-size="8.5" fill="#fff4da">Cone</text>
  <text x="84" y="38" text-anchor="end" font-family="Verdana, sans-serif" font-size="8.5" fill="#fff4da">120</text>
  <text x="16" y="50" font-family="Verdana, sans-serif" font-size="8.5" fill="#fff4da">Pop</text>
  <text x="84" y="50" text-anchor="end" font-family="Verdana, sans-serif" font-size="8.5" fill="#fff4da">80</text>
  <text x="16" y="62" font-family="Verdana, sans-serif" font-size="8.5" fill="#fff4da">Sundae</text>
  <text x="84" y="62" text-anchor="end" font-family="Verdana, sans-serif" font-size="8.5" fill="#fff4da">200</text>
  <path d="M50 66 q-4 -4 -4 -6 a2.2 2.2 0 0 1 4 -1 a2.2 2.2 0 0 1 4 1 q0 2 -4 6Z" fill="#ff9bb7"/>
</svg>`,
  { size: 512 },
);

const PLATE_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50">
  <rect x="2" y="2" width="96" height="46" rx="10" fill="#fff4da" stroke="#e8739b" stroke-width="4"/>
  <text x="50" y="34" text-anchor="middle" font-family="Verdana, sans-serif" font-weight="bold" font-size="22" fill="#5a4036">YUM 42</text>
</svg>`,
  { size: 256 },
);

const GRILLE_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 52">
  <rect x="3" y="3" width="114" height="46" rx="20" fill="#fff4da" stroke="#5a4036" stroke-width="4"/>
  <path d="M26 17 Q60 62 94 17Z" fill="#c24a68" stroke="#5a4036" stroke-width="4" stroke-linejoin="round"/>
  <path d="M34 19 H86 L82 25 H38Z" fill="#ffffff"/>
  <path d="M46 40 Q60 30 74 40 Q60 47 46 40Z" fill="#ff9bb7"/>
</svg>`,
  { size: 384 },
);

const BLUSH_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20">
  <ellipse cx="20" cy="10" rx="18" ry="8.5" fill="#ff8fb0"/>
  <path d="M10 14 l3 -8 M18 15 l3 -9 M26 14 l3 -8" stroke="#e8739b" stroke-width="2" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);

const HUB_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="31" fill="#fff4da" stroke="#5a4036" stroke-width="2.6"/>
  <g transform="translate(32 32)" fill="#ff9bb7" stroke="#5a4036" stroke-width="1.6">
    <ellipse cx="0" cy="-16" rx="7.5" ry="10.5"/>
    <ellipse cx="0" cy="-16" rx="7.5" ry="10.5" transform="rotate(72)"/>
    <ellipse cx="0" cy="-16" rx="7.5" ry="10.5" transform="rotate(144)"/>
    <ellipse cx="0" cy="-16" rx="7.5" ry="10.5" transform="rotate(216)"/>
    <ellipse cx="0" cy="-16" rx="7.5" ry="10.5" transform="rotate(288)"/>
  </g>
  <circle cx="32" cy="32" r="8" fill="#ffd96b" stroke="#5a4036" stroke-width="2"/>
</svg>`,
  { size: 192 },
);

const POP_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80">
  <rect x="16.5" y="54" width="7" height="22" rx="3.5" fill="#e8c08a" stroke="#5a4036" stroke-width="2.4"/>
  <path d="M7 52 V19 Q7 4 20 4 Q33 4 33 19 V52Z" fill="#ff9bb7"/>
  <path d="M7 34 H33 V52 H7Z" fill="#8fe3c6"/>
  <path d="M7 52 V19 Q7 4 20 4 Q33 4 33 19 V52Z" fill="none" stroke="#5a4036" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M7 34 H33" stroke="#5a4036" stroke-width="2"/>
  <path d="M13 13 Q13 10 16 9 M13 18 V26" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>`,
  { size: 256 },
);

const CONE_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 60">
  <path d="M6 26 L18 58 L30 26Z" fill="#e8aa5c" stroke="#5a4036" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M10 34 L26 34 M13 42 L23 42 M12 28 L22 52 M24 28 L14 52" stroke="#b4733a" stroke-width="1.4"/>
  <circle cx="18" cy="20" r="13" fill="#8fe3c6" stroke="#5a4036" stroke-width="2.4"/>
  <path d="M8 26 Q8 33 11 33 Q14 33 14 28" fill="#8fe3c6" stroke="#5a4036" stroke-width="2.2"/>
  <circle cx="18" cy="6" r="4" fill="#ea4560" stroke="#5a4036" stroke-width="2"/>
  <path d="M12 15 Q13 11 17 10" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" fill="none"/>
</svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "ice_cream_truck", paintSize: 2048 });
  const R = rng(21);

  const chassis = b.joint("chassis", { at: [0, 0.6, 0], dir: [0, 0, 1] });
  // Place any geometry on the chassis.
  const P = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(geo, color, { bone: chassis, at, ...o });

  // ------------------------------------------------------------------ body shells
  const BOX = { z0: -2.2, z1: 0.5, y0: 0.55, y1: 2.6 };
  const boxOutline = [
    ...arcPts(BOX.z1 - 0.12, BOX.y0 + 0.12, 0.12, -90, 0, 2),
    ...arcPts(BOX.z1 - 0.4, BOX.y1 - 0.4, 0.4, 0, 90, 4),
    ...arcPts(BOX.z0 + 0.4, BOX.y1 - 0.4, 0.4, 90, 180, 4),
    ...arcPts(BOX.z0 + 0.12, BOX.y0 + 0.12, 0.12, 180, 270, 2),
  ];
  const box = b.extrude(boxOutline, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 2.0,
    bevel: 0.1,
    color: BOX_PAINT,
    bone: chassis,
    name: "serviceBox",
  });

  const cabOutline: [number, number][] = [
    [0.4, 0.55],
    [2.3, 0.55],
    [2.42, 0.68],
    [2.42, 1.05],
    [2.3, 1.25],
    [1.75, 1.35],
    [1.3, 2.0],
    [1.16, 2.1],
    [0.4, 2.1],
  ];
  const cab = b.extrude(cabOutline, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 1.84,
    bevel: 0.08,
    color: CAB_PAINT,
    bone: chassis,
    name: "cab",
  });

  // chassis, axles, exhaust
  P(new THREE.BoxGeometry(1.7, 0.24, 4.5), DARK, [0, 0.4, 0.05]);
  for (const z of [1.5, -1.45]) P(new THREE.CylinderGeometry(0.06, 0.06, 2.0, 8), "#2f2b36", [0, 0.44, z], { dir: [1, 0, 0] });
  P(new THREE.CylinderGeometry(0.055, 0.055, 0.34, 8), CHROME, [0.62, 0.36, -2.3], { dir: [0, 0, -1] });
  P(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 8), "#9aa6b0", [0.62, 0.36, -2.46], { dir: [0, 0, -1] });

  // ------------------------------------------------------------------ wheels
  const R_W = 0.44;
  const tireProfile: [number, number][] = [
    [0.22, -0.16],
    [0.38, -0.16],
    [0.45, -0.1],
    [0.45, 0.1],
    [0.38, 0.16],
    [0.22, 0.16],
  ];
  const archPts = arcPts(0, 0, 0.56, 0, 180, 8);
  for (const [fz, half, tag] of [
    [1.5, 0.92, "F"],
    [-1.45, 1.0, "R"],
  ] as const) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const c = [s * 0.98, R_W, fz];
      const j = b.joint(`wheel${tag}${side}`, { parent: chassis, at: c, dir: [s, 0, 0] });
      b.lathe(tireProfile, { at: c, axis: [1, 0, 0], segments: 14, color: TIRE_P, bone: j });
      b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.3, 10), CREAM, { bone: j, at: c, dir: [s, 0, 0] });
      b.part(new THREE.CircleGeometry(0.25, 16), "#ffffff", {
        bone: j,
        at: [s * 1.147, R_W, fz],
        dir: [s, 0, 0],
        axis: "z",
        texture: HUB_TEX,
      });
      // fender arch + lip
      b.extrude(archPts, {
        at: [s * (half + 0.025), R_W, fz],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.06,
        color: ARCH_P,
        bone: chassis,
      });
      const lc = [s * (half + 0.05), R_W, fz];
      b.sweep(arc(lc, [lc[0], lc[1], lc[2] - 0.58], [1, 0, 0], 180), 0.035, {
        color: CREAM_P,
        bone: chassis,
        sides: 6,
      });
    }
  }

  // ------------------------------------------------------------------ front face: eyes, smile, bumper
  for (const s of [1, -1]) {
    glow(
      P(new THREE.SphereGeometry(1, 10, 8), BUTTER, [s * 0.62, 0.93, 2.4], { scale: [0.17, 0.17, 0.1], flat: true }),
      1.2,
    );
    P(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 12), PINK, [s * 0.62, 0.93, 2.41], { dir: [0, 0, 1] });
    P(new THREE.SphereGeometry(0.035, 6, 4), "#ffffff", [s * 0.67, 0.99, 2.49]);
    b.decal(cab, BLUSH_TEX, { at: [s * 0.72, 0.72, 2.42], dir: [0, 0, 1], size: [0.2, 0.1], bone: chassis });
  }
  b.decal(cab, GRILLE_TEX, { at: [0, 0.88, 2.42], dir: [0, 0, 1], size: [0.6, 0.26], bone: chassis });
  b.capsule([-0.78, 0.6, 2.44], [0.78, 0.6, 2.44], 0.1, { color: CREAM_P, bone: chassis });
  b.capsule([-0.78, 0.62, -2.25], [0.78, 0.62, -2.25], 0.1, { color: CREAM_P, bone: chassis });

  // hood ornament: a tiny cone with a scoop
  P(new THREE.ConeGeometry(0.05, 0.14, 7), WAFFLE, [0, 1.38, 2.05], { rotation: [180, 0, 0], flat: true });
  P(new THREE.SphereGeometry(0.058, 8, 6), PINK, [0, 1.48, 2.05], { flat: true });

  // ------------------------------------------------------------------ cab glass, door, mirrors
  const wp = (x: number, z: number, y: number) => [x, y + 0.007, z + 0.01];
  b.slab([wp(0.72, 1.66, 1.48), wp(-0.72, 1.66, 1.48), wp(-0.62, 1.38, 1.89), wp(0.62, 1.38, 1.89)], {
    color: GLASS,
    thickness: 0.03,
    bone: chassis,
  });
  b.sweep(
    polyline(
      [wp(0.79, 1.68, 1.45), wp(-0.79, 1.68, 1.45), wp(-0.68, 1.36, 1.92), wp(0.68, 1.36, 1.92)],
      { closed: true },
    ),
    0.024,
    { color: CREAM_P, bone: chassis, sides: 6 },
  );
  for (const s of [1, -1]) {
    // wipers
    b.rod(wp(s * 0.1, 1.64, 1.5), wp(s * 0.5, 1.5, 1.7), 0.011, { color: INK, bone: chassis });
    // side window
    b.extrude(
      [
        [0.62, 1.42],
        [1.62, 1.42],
        [1.33, 1.84],
        [0.62, 1.84],
      ],
      {
        at: [s * 0.935, 0, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.03,
        smoothing: 1,
        color: GLASS,
        bone: chassis,
      },
    );
    b.sweep(
      polyline(
        [
          [s * 0.945, 1.4, 0.6],
          [s * 0.945, 1.4, 1.66],
          [s * 0.945, 1.86, 1.33],
          [s * 0.945, 1.86, 0.6],
        ],
        { closed: true },
      ),
      0.02,
      { color: CREAM_P, bone: chassis, sides: 6 },
    );
    // door seam and handle
    b.sweep(
      polyline([
        [s * 0.925, 1.4, 0.55],
        [s * 0.925, 1.06, 0.55],
        [s * 0.925, 1.06, 1.6],
        [s * 0.925, 1.4, 1.6],
      ]),
      0.007,
      { color: INK, bone: chassis, sides: 5 },
    );
    b.capsule([s * 0.95, 1.2, 0.72], [s * 0.95, 1.2, 0.94], 0.025, { color: PINK, bone: chassis });
    // mirror
    b.rod([s * 0.93, 1.72, 1.5], [s * 1.12, 1.8, 1.56], 0.02, { color: CHROME, bone: chassis });
    P(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 10), PINK, [s * 1.16, 1.8, 1.58], { dir: [s * 0.25, 0, 1] });
    P(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 10), "#d6f1fb", [s * 1.162, 1.8, 1.6], { dir: [s * 0.25, 0, 1] });
    // small side marker
    glow(P(new THREE.SphereGeometry(0.04, 6, 4), BUTTER, [s * 0.94, 0.7, 2.3], { flat: true }), 1);
  }

  // ------------------------------------------------------------------ rear
  for (const s of [1, -1]) {
    glow(P(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 10), CHERRY, [s * 0.8, 1.0, -2.21], { dir: [0, 0, -1] }), 1.2);
    P(new THREE.CylinderGeometry(0.135, 0.135, 0.04, 10), PINK, [s * 0.8, 1.0, -2.2], { dir: [0, 0, -1] });
    glow(P(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 8), BUTTER, [s * 0.8, 1.22, -2.21], { dir: [0, 0, -1] }), 1);
  }
  b.decal(box, MENU_TEX, { at: [0, 1.7, -2.2], dir: [0, 0, -1], size: [1.1, 0.88], bone: chassis });
  b.decal(box, PLATE_TEX, { at: [0, 0.9, -2.2], dir: [0, 0, -1], size: [0.4, 0.2], bone: chassis });

  // ------------------------------------------------------------------ serving windows (both sides)
  const WZ = -0.8;
  const WY = 1.46;
  const TRIM = [PINK, MINT, BUTTER, SKY];
  for (const s of [1, -1]) {
    b.decal(box, WINDOW_TEX, { at: [s * 1.0, WY, WZ], dir: [s, 0, 0], size: [1.5, 0.72], bone: chassis });
    b.sweep(
      polyline(
        [
          [s * 1.02, WY - 0.38, WZ - 0.77],
          [s * 1.02, WY - 0.38, WZ + 0.77],
          [s * 1.02, WY + 0.38, WZ + 0.77],
          [s * 1.02, WY + 0.38, WZ - 0.77],
        ],
        { closed: true },
      ),
      0.045,
      { color: CREAM_P, bone: chassis, sides: 6 },
    );
    // counter shelf
    P(new THREE.BoxGeometry(0.36, 0.07, 1.8), CREAM_P, [s * 1.16, 1.1, WZ]);
    P(new THREE.BoxGeometry(0.03, 0.1, 1.8), PINK, [s * 1.34, 1.1, WZ]);
    for (const z of [-1.6, 0.0]) P(new THREE.BoxGeometry(0.2, 0.1, 0.05), CREAM_P, [s * 1.1, 1.02, z]);

    // tip jar with coins and a lid
    P(new THREE.CylinderGeometry(0.07, 0.07, 0.15, 10), "#c4e9f7", [s * 1.2, 1.21, -1.4]);
    P(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 10), PINK, [s * 1.2, 1.3, -1.4]);
    P(new THREE.CylinderGeometry(0.045, 0.045, 0.015, 8), BUTTER, [s * 1.2, 1.16, -1.4]);
    // bell
    b.lathe(
      [
        [0, 0],
        [0.06, 0],
        [0.05, 0.03],
        [0.035, 0.07],
        [0, 0.085],
      ],
      { at: [s * 1.2, 1.135, -1.2], color: BUTTER, bone: chassis, segments: 8 },
    );
    P(new THREE.SphereGeometry(0.018, 6, 4), CHERRY, [s * 1.2, 1.145, -1.2]);
    // cone rack with three scoops
    P(new THREE.BoxGeometry(0.14, 0.08, 0.5), WAFFLE_D, [s * 1.2, 1.175, -0.34]);
    const scoopC = [PINK, MINT, LILAC];
    for (let i = 0; i < 3; i++) {
      const z = -0.5 + i * 0.16;
      P(new THREE.ConeGeometry(0.045, 0.13, 7), WAFFLE, [s * 1.2, 1.29, z], { rotation: [180, 0, 0], flat: true });
      P(new THREE.SphereGeometry(0.055, 8, 6), scoopC[i], [s * 1.2, 1.38, z], { flat: true });
    }

    // awning wedge
    b.extrude(
      [
        [-0.04, 0.05],
        [0.64, -0.17],
        [0.64, -0.25],
        [-0.04, -0.03],
      ],
      {
        at: [s * 1.0, 2.12, WZ],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 2.0,
        bevel: 0.01,
        color: AWNING_PAINT,
        bone: chassis,
      },
    );
    const scal = arcPts(0, 0, 0.1, 180, 360, 6);
    for (let k = 0; k < 10; k++) {
      b.extrude(scal, {
        at: [s * 1.615, 1.94, -1.8 + 0.1 + 0.2 * k],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.05,
        bevel: 0.008,
        color: k % 2 === 0 ? PINK_S : CREAM_S,
        bone: chassis,
      });
    }
    for (const z of [-1.7, 0.1]) b.rod([s * 1.0, 1.7, z], [s * 1.56, 1.87, z], 0.02, { color: CHROME, bone: chassis });

    // banner and stickers
    b.decal(box, BANNER_TEX, { at: [s * 1.0, 2.34, WZ], dir: [s, 0, 0], size: [1.7, 0.28], bone: chassis });
    b.decal(box, POP_TEX, { at: [s * 1.0, 1.5, -1.9], dir: [s, 0, 0], size: [0.3, 0.6], bone: chassis });
    b.decal(box, CONE_TEX, { at: [s * 1.0, 1.5, 0.22], dir: [s, 0, 0], size: [0.24, 0.4], bone: chassis });
  }

  // ------------------------------------------------------------------ roof: string bulbs, speakers, beacon
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      const z = -1.7 + i * 0.32;
      glow(P(new THREE.SphereGeometry(0.055, 6, 4), TRIM[(i + (s > 0 ? 0 : 2)) % 4], [s * 0.86, 2.64, z], { flat: true }), 1.2);
    }
    b.rod([s * 0.86, 2.62, -1.75], [s * 0.86, 2.62, -0.05], 0.01, { color: INK, bone: chassis });
    // roof speaker horns
    P(new THREE.BoxGeometry(0.2, 0.1, 0.2), CHROME, [s * 0.55, 2.65, -0.05]);
    P(new THREE.CylinderGeometry(0.15, 0.06, 0.26, 10), PINK, [s * 0.55, 2.78, 0.04], { dir: [0, 0.25, 1] });
    P(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 10), CREAM, [s * 0.55, 2.8, 0.17], { dir: [0, 0.25, 1] });
  }
  P(new THREE.CylinderGeometry(0.14, 0.16, 0.08, 10), CHROME, [0, 2.64, -1.85]);
  glow(
    P(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), SKY, [0, 2.68, -1.85], { scale: [0.13, 0.13, 0.13], flat: true }),
    1.3,
  );

  // ------------------------------------------------------------------ the giant cone sign
  const CONE_BASE = 2.72;
  P(new THREE.CylinderGeometry(0.36, 0.42, 0.14, 10), CREAM_P, [SIGN_CX, 2.65, SIGN_CZ]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    glow(
      P(new THREE.SphereGeometry(0.04, 6, 4), TRIM[i % 4], [SIGN_CX + Math.cos(a) * 0.4, 2.7, SIGN_CZ + Math.sin(a) * 0.4], { flat: true }),
      1.3,
    );
  }
  P(new THREE.CylinderGeometry(0.42, 0.04, 0.72, 8), WAFFLE_PAINT, [SIGN_CX, CONE_BASE + 0.34, SIGN_CZ], { flat: true });
  P(new THREE.CylinderGeometry(0.46, 0.44, 0.09, 8), WAFFLE_L, [SIGN_CX, CONE_BASE + 0.72, SIGN_CZ], { flat: true });
  const scoop1 = P(new THREE.SphereGeometry(1, 12, 8), PINK_S, [SIGN_CX, 3.64, SIGN_CZ], { scale: [0.47, 0.44, 0.47], flat: true });
  const scoop2 = P(new THREE.SphereGeometry(1, 12, 8), MINT_S, [SIGN_CX, 4.0, SIGN_CZ], { scale: [0.34, 0.33, 0.34], flat: true });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    const len = 0.1 + R() * 0.16;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    b.capsule(
      [c * 0.455, 3.58, SIGN_CZ + sn * 0.455],
      [c * 0.472, 3.58 - len, SIGN_CZ + sn * 0.472],
      0.045,
      { color: PINK_S, bone: chassis, sides: 6 },
    );
  }
  const SPR = [BUTTER, "#ffffff", SKY, LILAC, CHERRY];
  for (const [sc, count] of [
    [scoop1, 22],
    [scoop2, 12],
  ] as const) {
    const hits = b.surface(sc).scatter(count, { rng: rng(count + 5), minDist: 0.1, filter: (h) => h.n.y > 0.05 });
    for (const h of hits) {
      b.stick(new THREE.BoxGeometry(0.02, 0.07, 0.02), SPR[Math.floor(R() * SPR.length)], h, {
        spin: R() * 360,
        embed: 0.3,
        bone: chassis,
      });
    }
  }
  P(new THREE.BoxGeometry(0.07, 0.4, 0.02), WAFFLE, [SIGN_CX + 0.2, 4.28, SIGN_CZ + 0.05], { rotation: [0, 0, -22], flat: true });
  P(new THREE.SphereGeometry(0.085, 8, 6), CHERRY, [SIGN_CX, 4.38, SIGN_CZ], { flat: true });
  P(new THREE.SphereGeometry(0.025, 5, 4), "#ffffff", [SIGN_CX + 0.035, 4.42, SIGN_CZ + 0.05]);
  b.sweep(
    bezier([SIGN_CX, 4.44, SIGN_CZ], [SIGN_CX + 0.02, 4.56, SIGN_CZ], [SIGN_CX + 0.1, 4.58, SIGN_CZ]),
    0.012,
    { color: LEAF, bone: chassis, sides: 5 },
  );

  return b.root;
}
```