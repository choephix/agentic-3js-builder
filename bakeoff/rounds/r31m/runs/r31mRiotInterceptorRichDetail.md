```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, paint, mix, noise, smoothstep, svg, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled, gaugeTexture } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Orbix CDU-07 Riot Interceptor",
  description:
    "Corporate crowd-dispersal interceptor: armoured cab, roof water cannon with twin tanks, neon light bars, push bar, hazard livery. Cyberpunk 2077 style.",
};

type V = [number, number, number];
const PI = Math.PI;

export default function build() {
  const b = createBuilder({ name: "riot_interceptor", paintSize: 2048 });
  const sides = [1, -1];

  // ------------------------------------------------------------------ palette
  const BLACK = "#0b0c12";
  const GUN = "#1c1f2b";
  const GUN2 = "#2c3042";
  const GLASS_DK = "#06141b";
  const RUBBER = "#14151b";
  const RUBBER2 = "#272a36";
  const MAG = "#ff2bd6";
  const CYAN = "#19e6ff";
  const AMBER = "#ffb020";
  const RED = "#ff2040";
  const WHITE = "#eef1f8";
  const YEL = "#ffcf1a";
  const TANKW = "#dfe6f2";
  const TANKB = "#2b6fe0";
  const HOSE = "#101117";
  const GOLD = "#d4a53a";
  const LAMP = "#bff6ff";
  const STEELP = metal("steel", { tarnish: 0.3 });
  const IRONP = metal("iron");

  const HULL = panelled(
    paint((p, n) => {
      const nz = noise(p, 0.5, 3);
      let c = mix("#2a2f46", "#3f476a", n.y > 0.5 ? 0.6 : nz * 0.5);
      c = mix(c, "#14151d", smoothstep(0.95, 0.6, p.y) * 0.8);
      c = mix(c, "#5a5047", smoothstep(0.85, 0.45, p.y) * noise(p, 0.15, 8) * 0.55);
      c = mix(c, "#1a1c28", smoothstep(0.55, 0.8, noise(p, 0.9, 5)) * 0.25);
      return c;
    }),
    { size: 0.5, aspect: 0.55, rivets: 0.12 },
  );

  // ------------------------------------------------------------------ textures
  const HAZARD = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#14141c"/>${Array.from(
      { length: 9 },
      (_, i) => `<polygon points="${i * 8 - 8},16 ${i * 8},0 ${i * 8 + 4},0 ${i * 8 - 4},16" fill="#ffcf1a"/>`,
    ).join("")}</svg>`,
    { size: 256 },
  );

  const LIVERY = svg(
    `<svg viewBox="0 0 480 180" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 14 H470 V166 H10 Z" fill="#eef1f8" stroke="#0b0c14" stroke-width="7" stroke-linejoin="round"/>
    <path d="M10 14 H120 L70 166 H10 Z" fill="#0b0c14"/>
    <path d="M120 14 H150 L100 166 H70 Z" fill="#ff2bd6"/>
    <path d="M150 14 H166 L116 166 H100 Z" fill="#19e6ff"/>
    <polygon points="30,50 52,38 74,50 74,80 52,92 30,80" fill="#0b0c14" stroke="#ffffff" stroke-width="5"/>
    <circle cx="52" cy="65" r="11" fill="none" stroke="#ff2bd6" stroke-width="5"/>
    <path d="M44 65 H60" stroke="#19e6ff" stroke-width="4"/>
    <text x="196" y="100" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-style="italic" font-size="76" fill="#0b0c14">ORBIX</text>
    <text x="200" y="130" font-family="Arial, sans-serif" font-weight="bold" font-size="19" letter-spacing="3" fill="#d4149f">CIVIL ORDER DIVISION</text>
    <rect x="200" y="140" width="190" height="14" fill="#0b0c14"/>
    ${Array.from({ length: 16 }, (_, i) => `<rect x="${204 + i * 11.5}" y="142" width="${i % 3 ? 4 : 7}" height="10" fill="#eef1f8"/>`).join("")}
    <text x="400" y="153" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="#0b0c14">CDU-07</text>
    <path d="M430 40 l22 -16 l22 16 M430 66 l22 -16 l22 16" stroke="#0b0c14" stroke-width="7" fill="none"/>
    </svg>`,
    { size: 1024 },
  );

  const BADGE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,4 90,27 90,73 50,96 10,73 10,27" fill="#0b0c14" stroke="#eef1f8" stroke-width="6"/>
    <circle cx="50" cy="50" r="22" fill="none" stroke="#ff2bd6" stroke-width="9"/>
    <path d="M28 50 H72" stroke="#19e6ff" stroke-width="7"/>
    <path d="M36 22 L50 14 L64 22" stroke="#eef1f8" stroke-width="5" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const GRILLE = svg(
    `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="50" rx="4" fill="#0b0c12"/>
    ${Array.from({ length: 8 }, (_, i) => `<rect x="6" y="${4 + i * 5.6}" width="88" height="3" fill="#232638"/>`).join("")}
    <path d="M6 25 H94" stroke="#19e6ff" stroke-width="1.6"/>
    <rect x="42" y="3" width="16" height="44" rx="2" fill="#0b0c12" stroke="#ff2bd6" stroke-width="1.6"/>
    <polygon points="50,12 56,17 56,28 50,33 44,28 44,17" fill="none" stroke="#eef1f8" stroke-width="1.6"/>
    </svg>`,
    { size: 512 },
  );

  const REAR = svg(
    `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="194" height="114" rx="8" fill="#0b0c12" stroke="#ffcf1a" stroke-width="5"/>
    <rect x="10" y="10" width="180" height="20" fill="#ffcf1a"/>
    ${Array.from({ length: 12 }, (_, i) => `<polygon points="${10 + i * 16},30 ${18 + i * 16},10 ${26 + i * 16},10 ${18 + i * 16},30" fill="#0b0c12"/>`).join("")}
    <polygon points="100,38 128,84 72,84" fill="#ffcf1a" stroke="#0b0c12" stroke-width="3"/>
    <rect x="97" y="52" width="6" height="18" fill="#0b0c12"/><circle cx="100" cy="77" r="3.5" fill="#0b0c12"/>
    <text x="100" y="104" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="17" fill="#eef1f8">STAND BACK 20M</text>
    <text x="100" y="114" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" fill="#19e6ff">ORBIX // DISPERSAL ACTIVE</text>
    </svg>`,
    { size: 512 },
  );

  const PLATE = svg(
    `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="116" height="56" rx="6" fill="#eef1f8" stroke="#0b0c12" stroke-width="3"/>
    <rect x="2" y="2" width="116" height="14" rx="6" fill="#d4149f"/>
    <text x="60" y="13" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="#fff">NIGHT CITY</text>
    <text x="60" y="48" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="26" fill="#0b0c12">CDU 4417</text>
    </svg>`,
    { size: 256 },
  );

  const GLASS = svg(
    `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d3a4a"/><stop offset="1" stop-color="#050f16"/></linearGradient></defs>
    <rect width="100" height="60" fill="url(#g)"/>
    <polygon points="10,60 24,0 34,0 20,60" fill="#1d5568"/><polygon points="40,60 54,0 58,0 44,60" fill="#16465a"/>
    <path d="M4 54 H96" stroke="#19e6ff" stroke-width="1.2"/><path d="M4 8 H30" stroke="#ff2bd6" stroke-width="1.2"/>
    </svg>`,
    { size: 256 },
  );

  const ROOFMARK = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <text x="50" y="68" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="64" fill="#eef1f8" stroke="#0b0c12" stroke-width="3">07</text>
    <path d="M30 22 L50 6 L70 22" stroke="#ff2bd6" stroke-width="6" fill="none"/>
    <rect x="10" y="84" width="80" height="8" fill="#ffcf1a"/>
    </svg>`,
    { size: 256 },
  );

  const SCREEN = svg(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="40" fill="#03161c"/><rect x="1" y="1" width="78" height="38" fill="none" stroke="#19e6ff" stroke-width="1.5"/>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="${6 + i * 7}" y="${28 - i * 2.4}" width="4" height="${6 + i * 2.4}" fill="${i > 6 ? "#ff2bd6" : "#19e6ff"}"/>`).join("")}
    <text x="6" y="10" font-family="monospace" font-size="7" fill="#19e6ff">PSI 8.5BAR</text>
    </svg>`,
    { size: 256 },
  );

  const TANKLABEL = svg(
    `<svg viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="50" fill="#0b0c12"/><rect x="0" y="0" width="200" height="6" fill="#ffcf1a"/><rect x="0" y="44" width="200" height="6" fill="#ffcf1a"/>
    <path d="M10 28 q8 -10 16 0 t16 0 t16 0" stroke="#19e6ff" stroke-width="4" fill="none"/>
    <text x="72" y="33" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="22" fill="#eef1f8">H2O  4800L</text>
    <text x="150" y="42" font-family="Arial, sans-serif" font-size="7" fill="#ff2bd6">ORBIX</text>
    </svg>`,
    { size: 512 },
  );

  const GAUGE = gaugeTexture({ label: "BAR", needle: 40 });

  // ------------------------------------------------------------------ helpers
  const box = (w: number, h: number, d: number, color: any, at: V, o: Record<string, any> = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const lit = (w: number, h: number, d: number, color: string, at: V, k = 1, o: Record<string, any> = {}) =>
    glow(box(w, h, d, color, at, o), k);
  const cyl = (rt: number, rb: number, len: number, color: any, at: V, dir?: V, seg = 12, o: Record<string, any> = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, len, seg), color, { at, ...(dir ? { dir } : {}), ...o });
  const plane = (w: number, h: number, tex: THREE.Texture, at: V, dir: V, up?: V) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...(up ? { up } : {}) });
  const radial = (n: number, f: (a: number) => THREE.BufferGeometry) =>
    mergeGeometries(Array.from({ length: n }, (_, i) => f((i / n) * PI * 2)))!;
  const bolts = (pts: V[], r: number, axis: "x" | "y" | "z", color: any) => {
    const gs = pts.map((p) => {
      const g = new THREE.CylinderGeometry(r, r, r * 1.0, 6);
      if (axis === "x") g.rotateZ(PI / 2);
      else if (axis === "z") g.rotateX(PI / 2);
      g.translate(p[0], p[1], p[2]);
      return g;
    });
    return b.part(mergeGeometries(gs)!, color, { at: [0, 0, 0] });
  };

  // ------------------------------------------------------------------ main shell
  const PROFILE: [number, number][] = [
    [-2.7, 0.5],
    [2.4, 0.5],
    [2.78, 0.62],
    [2.8, 1.1],
    [2.45, 1.3],
    [1.35, 1.42],
    [0.75, 2.05],
    [-2.6, 2.1],
    [-2.72, 1.95],
  ];
  const shell = b.extrude(PROFILE, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.05, color: HULL });

  box(1.7, 0.14, 5.0, GUN, [0, 0.52, 0]);
  // underglow
  for (const s of sides) lit(0.05, 0.04, 4.4, MAG, [s * 0.82, 0.44, 0], 1.1);
  lit(0.5, 0.03, 4.0, CYAN, [0, 0.43, 0], 0.9);

  // roof plate + rails
  box(1.7, 0.06, 2.95, HULL, [0, 2.13, -0.95]);
  const TOP = 2.16;
  for (const s of sides) {
    b.rod([s * 0.9, 2.24, 0.35], [s * 0.9, 2.24, -2.35], 0.02, STEELP);
    for (const z of [0.35, -0.5, -1.4, -2.35]) box(0.04, 0.08, 0.04, GUN2, [s * 0.9, 2.2, z]);
  }
  plane(1.0, 1.0, ROOFMARK, [0, TOP + 0.003, -1.0], [0, 1, 0], [0, 0, 1]);

  // ------------------------------------------------------------------ windshield & windows
  const slope = 46.4;
  box(1.7, 0.025, 0.9, GUN, [0, 1.743, 1.059], { rotation: [slope, 0, 0] });
  box(1.55, 0.03, 0.83, "#ffffff", [0, 1.749, 1.064], { rotation: [slope, 0, 0], texture: GLASS });
  for (const s of sides) {
    b.rod([s * 0.55, 1.5, 1.343], [s * 0.1, 1.658, 1.193], 0.008, BLACK);
    b.rod([s * 0.55, 1.5, 1.343], [s * 0.55, 1.5, 1.343], 0.02, GUN2);
  }
  box(1.9, 0.08, 0.4, HULL, [0, 2.1, 0.88]);
  lit(1.6, 0.02, 0.02, AMBER, [0, 2.055, 1.07], 1.1);

  const FRAME: [number, number][] = [
    [1.18, 1.52],
    [-0.41, 1.52],
    [-0.41, 2.0],
    [0.82, 2.0],
  ];
  const WIN: [number, number][] = [
    [1.12, 1.58],
    [-0.35, 1.58],
    [-0.35, 1.95],
    [0.8, 1.95],
  ];
  for (const s of sides) {
    b.extrude(FRAME, { at: [s * 0.95, 0, 0], x: [0, 0, 1], thickness: 0.05, color: GUN });
    b.extrude(WIN, { at: [s * 0.975, 0, 0], x: [0, 0, 1], thickness: 0.03, color: GLASS_DK });
    for (const z of [0.6, 0.1]) box(0.012, 0.37, 0.012, GUN, [s * 0.995, 1.765, z]);
    lit(0.012, 0.012, 1.4, CYAN, [s * 0.995, 1.6, 0.38], 1.0);
  }

  // ------------------------------------------------------------------ doors & flank details
  for (const s of sides) {
    box(0.012, 0.94, 0.015, BLACK, [s * 0.953, 1.13, 1.15]);
    box(0.012, 1.34, 0.015, BLACK, [s * 0.953, 1.33, -0.42]);
    box(0.012, 1.3, 0.015, BLACK, [s * 0.953, 1.3, -2.35]);
    box(0.012, 0.015, 0.7, BLACK, [s * 0.953, 0.66, 0.4]);
    // handle in recess
    box(0.012, 0.09, 0.3, BLACK, [s * 0.954, 1.28, -0.12]);
    box(0.03, 0.05, 0.22, GUN2, [s * 0.968, 1.28, -0.12]);
    box(0.01, 0.014, 0.06, CYAN, [s * 0.986, 1.28, -0.12]);
    // hinges
    for (const y of [0.85, 1.4]) cyl(0.02, 0.02, 0.06, IRONP, [s * 0.96, y, 1.15], [s, 0, 0], 8);
    // livery & badge
    plane(1.9, 0.7, LIVERY, [s * 0.9645, 1.62, -1.4], [s, 0, 0]);
    plane(0.3, 0.3, BADGE, [s * 0.9645, 1.12, 0.55], [s, 0, 0]);
    lit(0.02, 0.025, 1.7, MAG, [s * 0.96, 1.02, 0.05], 1.1);
    lit(0.02, 0.02, 1.2, CYAN, [s * 0.96, 0.98, 0.05], 1.0);
    // skirts
    box(0.25, 0.45, 1.85, HULL, [s * 1.075, 0.675, 0.025]);
    box(0.4, 0.05, 1.2, IRONP, [s * 1.15, 0.93, 0.3]);
    for (let i = 0; i < 6; i++) box(0.4, 0.012, 0.04, BLACK, [s * 1.15, 0.957, -0.2 + i * 0.2]);
    lit(0.03, 0.03, 1.6, MAG, [s * 1.2, 0.5, 0.025], 1.0);
    // side amber
    lit(0.03, 0.08, 0.25, AMBER, [s * 0.96, 1.0, 2.6], 1.0);
    // mirror
    box(0.3, 0.04, 0.04, GUN2, [s * 1.1, 1.55, 1.12]);
    box(0.12, 0.3, 0.16, GUN, [s * 1.28, 1.58, 1.1]);
    b.part(new THREE.PlaneGeometry(0.1, 0.26), "#6fd8e8", { at: [s * 1.28, 1.58, 1.1 - 0.082], dir: [0, 0, -1], axis: "z" });
    lit(0.02, 0.03, 0.05, AMBER, [s * 1.345, 1.66, 1.1], 1.0);
    // rear slit windows
    box(0.02, 0.1, 0.4, BLACK, [s * 0.955, 1.28, -2.55]);
  }
  bolts(
    sides.flatMap((s) => [-0.8, -0.4, 0, 0.4, 0.8].map((z) => [s * 1.2, 0.85, z] as V)),
    0.015,
    "x",
    GOLD,
  );

  // ------------------------------------------------------------------ hood
  plane(0.8, 0.8, BADGE, [0, 1.366, 1.9], [0, 1, 0.109], [0, 0, 1]);
  for (const s of sides)
    for (let i = 0; i < 6; i++) box(0.4, 0.02, 0.05, BLACK, [s * 0.68, 1.395 - 0.0, 1.55 + i * 0.1], { rotation: [6.3, 0, 0] });
  box(1.8, 0.012, 0.015, BLACK, [0, 1.41, 1.45], { rotation: [6.3, 0, 0] });
  for (const s of sides) lit(0.05, 0.015, 0.4, CYAN, [s * 0.9, 1.34, 2.15], 1.0, { rotation: [6.3, 0, 0] });

  // ------------------------------------------------------------------ front end
  plane(0.85, 0.42, GRILLE, [0, 0.86, 2.806], [0, 0, 1]);
  for (const s of sides) {
    box(0.6, 0.3, 0.1, GUN, [s * 0.75, 0.92, 2.82]);
    lit(0.5, 0.07, 0.04, LAMP, [s * 0.75, 0.99, 2.875], 1.5);
    lit(0.5, 0.022, 0.04, MAG, [s * 0.75, 0.85, 2.875], 1.1);
    for (const dx of [-0.1, 0.1]) glow(cyl(0.05, 0.05, 0.04, LAMP, [s * 0.75 + dx, 0.92, 2.88], [0, 0, 1], 8), 1.3);
  }
  // push bar
  for (const x of [-1.0, -0.5, 0.5, 1.0]) {
    box(0.12, 0.5, 0.14, IRONP, [x, 0.85, 2.99]);
    for (const y of [1.0, 0.68]) box(0.1, 0.1, 0.16, GUN2, [x, y, 2.88]);
  }
  box(2.2, 0.16, 0.18, "#ffffff", [0, 1.03, 2.99], { texture: HAZARD });
  box(2.2, 0.14, 0.18, "#ffffff", [0, 0.64, 2.99], { texture: HAZARD });
  lit(2.0, 0.025, 0.03, CYAN, [0, 1.122, 3.0], 1.4);
  bolts(
    [-1.0, -0.75, -0.5, 0.5, 0.75, 1.0].flatMap((x) => [[x, 1.03, 3.085] as V, [x, 0.64, 3.085] as V]),
    0.018,
    "z",
    GOLD,
  );
  for (const s of sides) {
    cyl(0.025, 0.025, 0.12, RED, [s * 0.3, 0.52, 2.95], [0, 0, 1], 8);
    cyl(0.05, 0.05, 0.02, RED, [s * 0.3, 0.52, 3.02], [0, 0, 1], 8);
  }

  // ------------------------------------------------------------------ rear end
  plane(1.2, 0.72, REAR, [0, 1.52, -2.72], [0, 0, -1]);
  plane(0.5, 0.25, PLATE, [0, 0.93, -2.71], [0, 0, -1]);
  lit(0.24, 0.02, 0.03, WHITE, [0, 1.08, -2.725], 1.2);
  box(0.015, 1.35, 0.02, BLACK, [0, 1.22, -2.727]);
  for (const s of sides) {
    lit(0.14, 0.8, 0.03, RED, [s * 0.8, 1.45, -2.727], 1.3);
    box(0.2, 0.9, 0.02, GUN, [s * 0.8, 1.45, -2.717]);
    cyl(0.025, 0.025, 0.06, IRONP, [s * 0.4, 1.0, -2.73], [0, 0, -1], 8);
    cyl(0.03, 0.03, 0.06, IRONP, [s * 0.4, 1.7, -2.73], [0, 0, -1], 8);
    box(0.012, 0.18, 0.02, GUN2, [s * 0.1, 1.2, -2.735]);
  }
  lit(1.5, 0.05, 0.04, RED, [0, 1.98, -2.725], 1.2);
  box(2.3, 0.3, 0.28, "#ffffff", [0, 0.68, -2.84], { texture: HAZARD });
  box(0.3, 0.1, 0.25, GUN2, [0, 0.55, -3.0]);
  cyl(0.05, 0.05, 0.09, STEELP, [0, 0.56, -3.1], [0, 0, 1], 10);
  bolts(
    [-1, -0.7, -0.35, 0.35, 0.7, 1].map((x) => [x, 0.68, -2.985] as V),
    0.02,
    "z",
    GOLD,
  );

  // ------------------------------------------------------------------ wheels
  const treads = () =>
    radial(20, (a) => {
      const gs = [-0.1, 0.1].map((y) => {
        const g = new THREE.BoxGeometry(0.1, 0.17, 0.06);
        g.translate(0, y, 0.553);
        return g;
      });
      const g = mergeGeometries(gs)!;
      g.rotateY(a);
      return g;
    });
  const spokes = () =>
    radial(5, (a) => {
      const g = new THREE.BoxGeometry(0.08, 0.035, 0.2);
      g.translate(0, 0.205, 0.24);
      g.rotateY(a);
      return g;
    });
  const lugs = () =>
    radial(5, (a) => {
      const g = new THREE.CylinderGeometry(0.026, 0.026, 0.04, 6);
      g.translate(0, 0.225, 0.15);
      g.rotateY(a + PI / 5);
      return g;
    });
  const faceRing = (inner: number, outer: number, y: number) =>
    new THREE.RingGeometry(inner, outer, 24).rotateX(-PI / 2).translate(0, y, 0);

  const wheel = (x: number, z: number, s: number, neon: string) => {
    const o = () => ({ at: [x, 0.56, z] as V, dir: [s, 0, 0] as V });
    b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 20), RUBBER, o());
    b.part(treads(), RUBBER2, o());
    b.part(faceRing(0.34, 0.5, 0.2015), RUBBER2, o());
    b.part(faceRing(0.43, 0.445, 0.203), "#cfd3dd", o());
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.42, 20), STEELP, o());
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 20).translate(0, 0.19, 0), GUN, o());
    b.part(spokes(), STEELP, o());
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.025, 14).translate(0, 0.21, 0), IRONP, o());
    b.part(lugs(), GOLD, o());
    glow(b.part(new THREE.TorusGeometry(0.37, 0.012, 4, 28).rotateX(PI / 2).translate(0, 0.206, 0), neon, o()), 1.3);
    glow(b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 10).translate(0, 0.222, 0), MAG, o()), 0.9);
    // brake behind the spokes
    b.part(new THREE.CylinderGeometry(0.27, 0.27, 0.02, 18).translate(0, 0.12, 0), "#7d8296", o());
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.14).translate(0, 0.12, 0.24), "#c4202c", o());
    // fender arch + neon flare
    const arch = new THREE.CylinderGeometry(0.68, 0.68, 0.5, 18, 1, true, PI, PI).rotateZ(-PI / 2);
    b.part(arch, HULL, { at: [s * 1.15, 0.56, z] });
    b.part(new THREE.RingGeometry(0.66, 0.7, 20, 1, 0, PI).rotateY((s * PI) / 2), neon, { at: [s * 1.405, 0.56, z] });
    glow(b.parts ? (undefined as never) : (undefined as never), 1);
  };
  void wheel;

  return b.root;
}
```

Wait — that last block contains a bad placeholder line. Here is the complete, corrected module:

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, paint, mix, noise, smoothstep, svg, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled, gaugeTexture } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Orbix CDU-07 Riot Interceptor",
  description:
    "Corporate crowd-dispersal interceptor: armoured cab, roof water cannon with twin tanks, neon light bars, push bar, hazard livery. Cyberpunk 2077 style.",
};

type V = [number, number, number];
const PI = Math.PI;

export default function build() {
  const b = createBuilder({ name: "riot_interceptor", paintSize: 2048 });
  const sides = [1, -1];

  // ------------------------------------------------------------------ palette
  const BLACK = "#0b0c12";
  const GUN = "#1c1f2b";
  const GUN2 = "#2c3042";
  const GLASS_DK = "#06141b";
  const RUBBER = "#14151b";
  const RUBBER2 = "#272a36";
  const MAG = "#ff2bd6";
  const CYAN = "#19e6ff";
  const AMBER = "#ffb020";
  const RED = "#ff2040";
  const WHITE = "#eef1f8";
  const TANKW = "#dfe6f2";
  const TANKB = "#2b6fe0";
  const HOSE = "#101117";
  const GOLD = "#d4a53a";
  const LAMP = "#bff6ff";
  const STEELP = metal("steel", { tarnish: 0.3 });
  const IRONP = metal("iron");

  const HULL = panelled(
    paint((p, n) => {
      const nz = noise(p, 0.5, 3);
      let c = mix("#2a2f46", "#3f476a", n.y > 0.5 ? 0.6 : nz * 0.5);
      c = mix(c, "#14151d", smoothstep(0.95, 0.6, p.y) * 0.8);
      c = mix(c, "#5a5047", smoothstep(0.85, 0.45, p.y) * noise(p, 0.15, 8) * 0.55);
      c = mix(c, "#1a1c28", smoothstep(0.55, 0.8, noise(p, 0.9, 5)) * 0.25);
      return c;
    }),
    { size: 0.5, aspect: 0.55, rivets: 0.12 },
  );

  // ------------------------------------------------------------------ textures
  const HAZARD = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#14141c"/>${Array.from(
      { length: 9 },
      (_, i) => `<polygon points="${i * 8 - 8},16 ${i * 8},0 ${i * 8 + 4},0 ${i * 8 - 4},16" fill="#ffcf1a"/>`,
    ).join("")}</svg>`,
    { size: 256 },
  );

  const LIVERY = svg(
    `<svg viewBox="0 0 480 180" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 14 H470 V166 H10 Z" fill="#eef1f8" stroke="#0b0c14" stroke-width="7" stroke-linejoin="round"/>
    <path d="M10 14 H120 L70 166 H10 Z" fill="#0b0c14"/>
    <path d="M120 14 H150 L100 166 H70 Z" fill="#ff2bd6"/>
    <path d="M150 14 H166 L116 166 H100 Z" fill="#19e6ff"/>
    <polygon points="30,50 52,38 74,50 74,80 52,92 30,80" fill="#0b0c14" stroke="#ffffff" stroke-width="5"/>
    <circle cx="52" cy="65" r="11" fill="none" stroke="#ff2bd6" stroke-width="5"/>
    <path d="M44 65 H60" stroke="#19e6ff" stroke-width="4"/>
    <text x="196" y="100" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-style="italic" font-size="76" fill="#0b0c14">ORBIX</text>
    <text x="200" y="130" font-family="Arial, sans-serif" font-weight="bold" font-size="19" letter-spacing="3" fill="#d4149f">CIVIL ORDER DIVISION</text>
    <rect x="200" y="140" width="190" height="14" fill="#0b0c14"/>
    ${Array.from({ length: 16 }, (_, i) => `<rect x="${204 + i * 11.5}" y="142" width="${i % 3 ? 4 : 7}" height="10" fill="#eef1f8"/>`).join("")}
    <text x="400" y="153" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="#0b0c14">CDU-07</text>
    <path d="M430 40 l22 -16 l22 16 M430 66 l22 -16 l22 16" stroke="#0b0c14" stroke-width="7" fill="none"/>
    </svg>`,
    { size: 1024 },
  );

  const BADGE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,4 90,27 90,73 50,96 10,73 10,27" fill="#0b0c14" stroke="#eef1f8" stroke-width="6"/>
    <circle cx="50" cy="50" r="22" fill="none" stroke="#ff2bd6" stroke-width="9"/>
    <path d="M28 50 H72" stroke="#19e6ff" stroke-width="7"/>
    <path d="M36 22 L50 14 L64 22" stroke="#eef1f8" stroke-width="5" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const GRILLE = svg(
    `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="50" rx="4" fill="#0b0c12"/>
    ${Array.from({ length: 8 }, (_, i) => `<rect x="6" y="${4 + i * 5.6}" width="88" height="3" fill="#232638"/>`).join("")}
    <path d="M6 25 H94" stroke="#19e6ff" stroke-width="1.6"/>
    <rect x="42" y="3" width="16" height="44" rx="2" fill="#0b0c12" stroke="#ff2bd6" stroke-width="1.6"/>
    <polygon points="50,12 56,17 56,28 50,33 44,28 44,17" fill="none" stroke="#eef1f8" stroke-width="1.6"/>
    </svg>`,
    { size: 512 },
  );

  const REAR = svg(
    `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="194" height="114" rx="8" fill="#0b0c12" stroke="#ffcf1a" stroke-width="5"/>
    <rect x="10" y="10" width="180" height="20" fill="#ffcf1a"/>
    ${Array.from({ length: 11 }, (_, i) => `<polygon points="${10 + i * 16},30 ${18 + i * 16},10 ${26 + i * 16},10 ${18 + i * 16},30" fill="#0b0c12"/>`).join("")}
    <polygon points="100,38 128,84 72,84" fill="#ffcf1a" stroke="#0b0c12" stroke-width="3"/>
    <rect x="97" y="52" width="6" height="18" fill="#0b0c12"/><circle cx="100" cy="77" r="3.5" fill="#0b0c12"/>
    <text x="100" y="104" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="17" fill="#eef1f8">STAND BACK 20M</text>
    <text x="100" y="114" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" fill="#19e6ff">ORBIX // DISPERSAL ACTIVE</text>
    </svg>`,
    { size: 512 },
  );

  const PLATE = svg(
    `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="116" height="56" rx="6" fill="#eef1f8" stroke="#0b0c12" stroke-width="3"/>
    <rect x="2" y="2" width="116" height="14" rx="6" fill="#d4149f"/>
    <text x="60" y="13" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="#ffffff">NIGHT CITY</text>
    <text x="60" y="48" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="26" fill="#0b0c12">CDU 4417</text>
    </svg>`,
    { size: 256 },
  );

  const GLASS = svg(
    `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d3a4a"/><stop offset="1" stop-color="#050f16"/></linearGradient></defs>
    <rect width="100" height="60" fill="url(#g)"/>
    <polygon points="10,60 24,0 34,0 20,60" fill="#1d5568"/><polygon points="40,60 54,0 58,0 44,60" fill="#16465a"/>
    <path d="M4 54 H96" stroke="#19e6ff" stroke-width="1.2"/><path d="M4 8 H30" stroke="#ff2bd6" stroke-width="1.2"/>
    </svg>`,
    { size: 256 },
  );

  const ROOFMARK = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <text x="50" y="68" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="64" fill="#eef1f8" stroke="#0b0c12" stroke-width="3">07</text>
    <path d="M30 22 L50 6 L70 22" stroke="#ff2bd6" stroke-width="6" fill="none"/>
    <rect x="10" y="84" width="80" height="8" fill="#ffcf1a"/>
    </svg>`,
    { size: 256 },
  );

  const SCREEN = svg(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="40" fill="#03161c"/><rect x="1" y="1" width="78" height="38" fill="none" stroke="#19e6ff" stroke-width="1.5"/>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="${6 + i * 7}" y="${28 - i * 2.4}" width="4" height="${6 + i * 2.4}" fill="${i > 6 ? "#ff2bd6" : "#19e6ff"}"/>`).join("")}
    <text x="6" y="10" font-family="monospace" font-size="7" fill="#19e6ff">PSI 8.5BAR</text>
    </svg>`,
    { size: 256 },
  );

  const TANKLABEL = svg(
    `<svg viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="50" fill="#0b0c12"/><rect x="0" y="0" width="200" height="6" fill="#ffcf1a"/><rect x="0" y="44" width="200" height="6" fill="#ffcf1a"/>
    <path d="M10 28 q8 -10 16 0 t16 0 t16 0" stroke="#19e6ff" stroke-width="4" fill="none"/>
    <text x="72" y="33" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="22" fill="#eef1f8">H2O  4800L</text>
    <text x="150" y="42" font-family="Arial, sans-serif" font-size="7" fill="#ff2bd6">ORBIX</text>
    </svg>`,
    { size: 512 },
  );

  const GAUGE = gaugeTexture({ label: "BAR", needle: 40 });

  // ------------------------------------------------------------------ helpers
  const box = (w: number, h: number, d: number, color: any, at: V, o: Record<string, any> = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const lit = (w: number, h: number, d: number, color: string, at: V, k = 1, o: Record<string, any> = {}) =>
    glow(box(w, h, d, color, at, o), k);
  const cyl = (rt: number, rb: number, len: number, color: any, at: V, dir?: V, seg = 12, o: Record<string, any> = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, len, seg), color, { at, ...(dir ? { dir } : {}), ...o });
  const plane = (w: number, h: number, tex: THREE.Texture, at: V, dir: V, up?: V) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...(up ? { up } : {}) });
  const radial = (n: number, f: (a: number) => THREE.BufferGeometry) =>
    mergeGeometries(Array.from({ length: n }, (_, i) => f((i / n) * PI * 2)))!;
  const bolts = (pts: V[], r: number, axis: "x" | "y" | "z", color: any) => {
    const gs = pts.map((p) => {
      const g = new THREE.CylinderGeometry(r, r, r, 6);
      if (axis === "x") g.rotateZ(PI / 2);
      else if (axis === "z") g.rotateX(PI / 2);
      g.translate(p[0], p[1], p[2]);
      return g;
    });
    return b.part(mergeGeometries(gs)!, color, { at: [0, 0, 0] });
  };

  // ------------------------------------------------------------------ main shell
  const PROFILE: [number, number][] = [
    [-2.7, 0.5],
    [2.4, 0.5],
    [2.78, 0.62],
    [2.8, 1.1],
    [2.45, 1.3],
    [1.35, 1.42],
    [0.75, 2.05],
    [-2.6, 2.1],
    [-2.72, 1.95],
  ];
  const shell = b.extrude(PROFILE, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.05, color: HULL });

  box(1.7, 0.14, 5.0, GUN, [0, 0.52, 0]);
  for (const s of sides) lit(0.05, 0.04, 4.4, MAG, [s * 0.82, 0.44, 0], 1.1);
  lit(0.5, 0.03, 4.0, CYAN, [0, 0.43, 0], 0.9);

  // roof plate + rails
  box(1.7, 0.06, 2.95, HULL, [0, 2.13, -0.95]);
  const TOP = 2.16;
  for (const s of sides) {
    b.rod([s * 0.9, 2.24, 0.35], [s * 0.9, 2.24, -2.35], 0.02, STEELP);
    for (const z of [0.35, -0.5, -1.4, -2.35]) box(0.04, 0.08, 0.04, GUN2, [s * 0.9, 2.2, z]);
  }
  plane(1.0, 1.0, ROOFMARK, [0, TOP + 0.003, -1.0], [0, 1, 0], [0, 0, 1]);

  // ------------------------------------------------------------------ windshield & windows
  const slope = 46.4;
  box(1.7, 0.025, 0.9, GUN, [0, 1.743, 1.059], { rotation: [slope, 0, 0] });
  box(1.55, 0.03, 0.83, "#ffffff", [0, 1.749, 1.064], { rotation: [slope, 0, 0], texture: GLASS });
  for (const s of sides) {
    b.rod([s * 0.55, 1.5, 1.343], [s * 0.1, 1.658, 1.193], 0.008, BLACK);
    cyl(0.02, 0.02, 0.03, GUN2, [s * 0.55, 1.5, 1.343], undefined, 8);
  }
  box(1.9, 0.08, 0.4, HULL, [0, 2.1, 0.88]);
  lit(1.6, 0.02, 0.02, AMBER, [0, 2.055, 1.07], 1.1);

  const FRAME: [number, number][] = [
    [1.18, 1.52],
    [-0.41, 1.52],
    [-0.41, 2.0],
    [0.82, 2.0],
  ];
  const WIN: [number, number][] = [
    [1.12, 1.58],
    [-0.35, 1.58],
    [-0.35, 1.95],
    [0.8, 1.95],
  ];
  for (const s of sides) {
    b.extrude(FRAME, { at: [s * 0.95, 0, 0], x: [0, 0, 1], thickness: 0.05, color: GUN });
    b.extrude(WIN, { at: [s * 0.975, 0, 0], x: [0, 0, 1], thickness: 0.03, color: GLASS_DK });
    for (const z of [0.6, 0.1]) box(0.012, 0.37, 0.012, GUN, [s * 0.995, 1.765, z]);
    lit(0.012, 0.012, 1.4, CYAN, [s * 0.995, 1.6, 0.38], 1.0);
  }

  // ------------------------------------------------------------------ doors & flank details
  for (const s of sides) {
    box(0.012, 0.94, 0.015, BLACK, [s * 0.953, 1.13, 1.15]);
    box(0.012, 1.34, 0.015, BLACK, [s * 0.953, 1.33, -0.42]);
    box(0.012, 1.3, 0.015, BLACK, [s * 0.953, 1.3, -2.35]);
    box(0.012, 0.015, 0.7, BLACK, [s * 0.953, 0.66, 0.4]);
    box(0.012, 0.09, 0.3, BLACK, [s * 0.954, 1.28, -0.12]);
    box(0.03, 0.05, 0.22, GUN2, [s * 0.968, 1.28, -0.12]);
    box(0.01, 0.014, 0.06, CYAN, [s * 0.986, 1.28, -0.12]);
    for (const y of [0.85, 1.4]) cyl(0.02, 0.02, 0.06, IRONP, [s * 0.96, y, 1.15], [s, 0, 0], 8);
    plane(1.9, 0.7, LIVERY, [s * 0.9645, 1.62, -1.4], [s, 0, 0]);
    plane(0.3, 0.3, BADGE, [s * 0.9645, 1.12, 0.55], [s, 0, 0]);
    lit(0.02, 0.025, 1.7, MAG, [s * 0.96, 1.02, 0.05], 1.1);
    lit(0.02, 0.02, 1.2, CYAN, [s * 0.96, 0.98, 0.05], 1.0);
    box(0.25, 0.45, 1.85, HULL, [s * 1.075, 0.675, 0.025]);
    box(0.4, 0.05, 1.2, IRONP, [s * 1.15, 0.93, 0.3]);
    for (let i = 0; i < 6; i++) box(0.4, 0.012, 0.04, BLACK, [s * 1.15, 0.957, -0.2 + i * 0.2]);
    lit(0.03, 0.03, 1.6, MAG, [s * 1.2, 0.5, 0.025], 1.0);
    lit(0.03, 0.08, 0.25, AMBER, [s * 0.96, 1.0, 2.6], 1.0);
    // mirror
    box(0.3, 0.04, 0.04, GUN2, [s * 1.1, 1.55, 1.12]);
    box(0.12, 0.3, 0.16, GUN, [s * 1.28, 1.58, 1.1]);
    b.part(new THREE.PlaneGeometry(0.1, 0.26), "#6fd8e8", { at: [s * 1.28, 1.58, 1.1 - 0.082], dir: [0, 0, -1], axis: "z" });
    lit(0.02, 0.03, 0.05, AMBER, [s * 1.345, 1.66, 1.1], 1.0);
    box(0.02, 0.1, 0.4, BLACK, [s * 0.955, 0.85, -2.55]);
  }
  bolts(
    sides.flatMap((s) => [-0.8, -0.4, 0, 0.4, 0.8].map((z) => [s * 1.2, 0.85, z] as V)),
    0.015,
    "x",
    GOLD,
  );

  // ------------------------------------------------------------------ hood
  plane(0.8, 0.8, BADGE, [0, 1.366, 1.9], [0, 1, 0.109], [0, 0, 1]);
  for (const s of sides) {
    for (let i = 0; i < 6; i++) box(0.4, 0.02, 0.05, BLACK, [s * 0.68, 1.395, 1.55 + i * 0.1], { rotation: [6.3, 0, 0] });
    lit(0.05, 0.015, 0.4, CYAN, [s * 0.9, 1.34, 2.15], 1.0, { rotation: [6.3, 0, 0] });
  }
  box(1.8, 0.012, 0.015, BLACK, [0, 1.41, 1.45], { rotation: [6.3, 0, 0] });

  // ------------------------------------------------------------------ front end
  plane(0.85, 0.42, GRILLE, [0, 0.86, 2.806], [0, 0, 1]);
  for (const s of sides) {
    box(0.6, 0.3, 0.1, GUN, [s * 0.75, 0.92, 2.82]);
    lit(0.5, 0.07, 0.04, LAMP, [s * 0.75, 0.99, 2.875], 1.5);
    lit(0.5, 0.022, 0.04, MAG, [s * 0.75, 0.85, 2.875], 1.1);
    for (const dx of [-0.1, 0.1]) glow(cyl(0.05, 0.05, 0.04, LAMP, [s * 0.75 + dx, 0.92, 2.88], [0, 0, 1], 8), 1.3);
  }
  for (const x of [-1.0, -0.5, 0.5, 1.0]) {
    box(0.12, 0.5, 0.14, IRONP, [x, 0.85, 2.99]);
    for (const y of [1.0, 0.68]) box(0.1, 0.1, 0.16, GUN2, [x, y, 2.88]);
  }
  box(2.2, 0.16, 0.18, "#ffffff", [0, 1.03, 2.99], { texture: HAZARD });
  box(2.2, 0.14, 0.18, "#ffffff", [0, 0.64, 2.99], { texture: HAZARD });
  lit(2.0, 0.025, 0.03, CYAN, [0, 1.122, 3.0], 1.4);
  bolts(
    [-1.0, -0.75, -0.5, 0.5, 0.75, 1.0].flatMap((x) => [[x, 1.03, 3.085] as V, [x, 0.64, 3.085] as V]),
    0.018,
    "z",
    GOLD,
  );
  for (const s of sides) {
    cyl(0.025, 0.025, 0.12, RED, [s * 0.3, 0.52, 2.95], [0, 0, 1], 8);
    cyl(0.05, 0.05, 0.02, RED, [s * 0.3, 0.52, 3.02], [0, 0, 1], 8);
  }

  // ------------------------------------------------------------------ rear end
  plane(1.2, 0.72, REAR, [0, 1.52, -2.72], [0, 0, -1]);
  plane(0.5, 0.25, PLATE, [0, 0.93, -2.71], [0, 0, -1]);
  lit(0.24, 0.02, 0.03, WHITE, [0, 1.08, -2.725], 1.2);
  box(0.015, 1.35, 0.02, BLACK, [0, 1.22, -2.727]);
  for (const s of sides) {
    box(0.2, 0.9, 0.02, GUN, [s * 0.8, 1.45, -2.717]);
    lit(0.14, 0.8, 0.03, RED, [s * 0.8, 1.45, -2.73], 1.3);
    cyl(0.025, 0.025, 0.06, IRONP, [s * 0.4, 1.0, -2.73], [0, 0, -1], 8);
    cyl(0.03, 0.03, 0.06, IRONP, [s * 0.4, 1.7, -2.73], [0, 0, -1], 8);
  }
  lit(1.5, 0.05, 0.04, RED, [0, 1.98, -2.725], 1.2);
  box(2.3, 0.3, 0.28, "#ffffff", [0, 0.68, -2.84], { texture: HAZARD });
  box(0.3, 0.1, 0.25, GUN2, [0, 0.55, -3.0]);
  cyl(0.05, 0.05, 0.09, STEELP, [0, 0.56, -3.1], [0, 0, 1], 10);
  bolts(
    [-1, -0.7, -0.35, 0.35, 0.7, 1].map((x) => [x, 0.68, -2.985] as V),
    0.02,
    "z",
    GOLD,
  );

  // ------------------------------------------------------------------ wheels
  const treads = () =>
    radial(20, (a) => {
      const gs = [-0.1, 0.1].map((y) => {
        const g = new THREE.BoxGeometry(0.1, 0.17, 0.06);
        g.translate(0, y, 0.553);
        return g;
      });
      const g = mergeGeometries(gs)!;
      g.rotateY(a);
      return g;
    });
  const spokes = () =>
    radial(5, (a) => {
      const g = new THREE.BoxGeometry(0.08, 0.035, 0.2);
      g.translate(0, 0.205, 0.24);
      g.rotateY(a);
      return g;
    });
  const lugs = () =>
    radial(5, (a) => {
      const g = new THREE.CylinderGeometry(0.026, 0.026, 0.04, 6);
      g.translate(0, 0.225, 0.15);
      g.rotateY(a + PI / 5);
      return g;
    });
  const faceRing = (inner: number, outer: number, y: number) =>
    new THREE.RingGeometry(inner, outer, 24).rotateX(-PI / 2).translate(0, y, 0);

  const wheel = (x: number, z: number, s: number, neon: string) => {
    const o = () => ({ at: [x, 0.56, z] as V, dir: [s, 0, 0] as V });
    b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 20), RUBBER, o());
    b.part(treads(), RUBBER2, o());
    b.part(faceRing(0.34, 0.5, 0.2015), RUBBER2, o());
    b.part(faceRing(0.43, 0.445, 0.203), "#cfd3dd", o());
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.42, 20), STEELP, o());
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 20).translate(0, 0.19, 0), GUN, o());
    b.part(spokes(), STEELP, o());
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.025, 14).translate(0, 0.21, 0), IRONP, o());
    b.part(lugs(), GOLD, o());
    glow(b.part(new THREE.TorusGeometry(0.37, 0.012, 4, 28).rotateX(PI / 2).translate(0, 0.206, 0), neon, o()), 1.3);
    glow(b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 10).translate(0, 0.222, 0), MAG, o()), 0.9);
    b.part(new THREE.CylinderGeometry(0.27, 0.27, 0.02, 18).translate(0, 0.12, 0), "#7d8296", o());
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.14).translate(0, 0.12, 0.24), "#c4202c", o());
    const arch = new THREE.CylinderGeometry(0.68, 0.68, 0.5, 18, 1, true, PI, PI).rotateZ(-PI / 2);
    b.part(arch, HULL, { at: [s * 1.15, 0.56, z] });
    b.part(new THREE.RingGeometry(0.66, 0.7, 20, 1, 0, PI).rotateY((s * PI) / 2), neon, { at: [s * 1.405, 0.56, z] });
  };
  for (const s of sides) {
    wheel(s * 1.15, 1.6, s, CYAN);
    wheel(s * 1.15, -1.5, s, MAG);
    box(0.4, 0.4, 0.03, RUBBER2, [s * 1.15, 0.38, -2.15]);
    plane(0.2, 0.2, BADGE, [s * 1.15, 0.4, -2.168], [0, 0, -1]);
    box(0.4, 0.25, 0.03, RUBBER2, [s * 1.15, 0.42, 2.2]);
  }

  // ------------------------------------------------------------------ roof gear: light bar
  const LB_Z = 0.38;
  box(1.7, 0.1, 0.2, GUN, [0, 2.21, LB_Z]);
  box(1.74, 0.025, 0.24, GUN2, [0, 2.275, LB_Z]);
  for (let i = 0; i < 12; i++) {
    const x = -0.77 + i * 0.14;
    const c = i % 2 ? CYAN : MAG;
    lit(0.12, 0.075, 0.05, c, [x, 2.215, LB_Z + 0.1], 1.4);
    lit(0.12, 0.075, 0.05, i % 2 ? RED : "#3a6bff", [x, 2.215, LB_Z - 0.1], 1.3);
  }
  for (const s of sides) {
    box(0.06, 0.12, 0.24, GUN2, [s * 0.88, 2.22, LB_Z]);
    for (const dz of [-0.06, 0.06]) box(0.05, 0.05, 0.05, IRONP, [s * 0.7, 2.185, LB_Z + dz]);
  }

  // speakers
  for (const s of sides) {
    cyl(0.16, 0.06, 0.3, GUN2, [s * 0.7, 2.36, 0.15], [0, 0, 1], 12);
    cyl(0.08, 0.08, 0.2, GUN, [s * 0.7, 2.36, -0.05], [0, 0, 1], 10);
    cyl(0.13, 0.13, 0.012, BLACK, [s * 0.7, 2.36, 0.3], [0, 0, 1], 12);
    box(0.06, 0.2, 0.1, IRONP, [s * 0.7, 2.25, 0.05]);
    glow(cyl(0.025, 0.025, 0.014, CYAN, [s * 0.7, 2.36, 0.307], [0, 0, 1], 8), 1.2);
  }

  // lidar dome + antennas
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.2, 0.07],
      [0.13, 0.2],
      [0, 0.24],
    ],
    { at: [0, TOP, -1.85], color: GUN2 },
  );
  glow(cyl(0.205, 0.205, 0.02, MAG, [0, TOP + 0.09, -1.85], undefined, 12), 1.2);
  for (const s of sides) {
    b.rod([s * 0.88, TOP, -2.4], [s * 0.88, TOP + 1.0, -2.4], 0.012, BLACK);
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { at: [s * 0.88, TOP + 1.02, -2.4] }), 1.6);
    cyl(0.03, 0.03, 0.05, GUN2, [s * 0.88, TOP + 0.03, -2.4]);
  }
  box(0.04, 0.12, 0.3, GUN2, [0, TOP + 0.08, -2.4], { rotation: [-15, 0, 0] });

  // ------------------------------------------------------------------ water tanks
  const TY = TOP + 0.33;
  for (const s of sides) {
    const tx = s * 0.55;
    cyl(0.3, 0.3, 1.2, TANKW, [tx, TY, -1.85], [0, 0, 1], 16);
    cyl(0.305, 0.305, 0.22, TANKB, [tx, TY, -1.85], [0, 0, 1], 16);
    for (const z of [-1.4, -2.3]) cyl(0.312, 0.312, 0.06, GUN, [tx, TY, z], [0, 0, 1], 16);
    for (const z of [-1.25, -2.45]) cyl(0.32, 0.32, 0.05, IRONP, [tx, TY, z + (z > -2 ? -0.02 : 0.02)], [0, 0, 1], 16);
    box(0.5, 0.1, 1.1, GUN, [tx, TOP + 0.04, -1.85]);
    cyl(0.08, 0.09, 0.08, STEELP, [tx, TY + 0.31, -1.6], undefined, 8);
    glow(cyl(0.035, 0.035, 0.01, CYAN, [tx, TY + 0.355, -1.6], undefined, 8), 1.0);
    plane(0.36, 0.36, GAUGE, [tx, TY, -2.462], [0, 0, -1]);
    box(0.012, 0.15, 0.6, "#ffffff", [s * (0.55 + 0.305), TY - 0.02, -1.85], { texture: TANKLABEL });
    cyl(0.07, 0.07, 0.12, GOLD, [tx, TY, -1.2], [0, 0, 1], 8);
    // hose
    const pts: V[] = [
      [tx, TY, -1.2],
      [s * 0.5, TOP + 0.15, -0.95],
      [s * 0.32, TOP + 0.12, -0.6],
      [s * 0.2, TOP + 0.22, -0.3],
    ];
    b.sweep(catmull(pts), 0.04, { color: HOSE, sides: 8 });
    for (const i of [1, 2]) cyl(0.055, 0.055, 0.05, STEELP, pts[i], undefined, 8);
    bolts([[tx, TY + 0.12, -1.19]], 0.018, "z", GOLD);
  }

  // ------------------------------------------------------------------ water cannon
  const CZ = -0.3;
  const BY = 2.66;
  cyl(0.42, 0.42, 0.1, GUN2, [0, TOP + 0.05, CZ], undefined, 16);
  cyl(0.36, 0.36, 0.03, STEELP, [0, TOP + 0.115, CZ], undefined, 16);
  bolts(
    Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * PI * 2;
      return [Math.sin(a) * 0.39, TOP + 0.11, CZ + Math.cos(a) * 0.39] as V;
    }),
    0.018,
    "y",
    GOLD,
  );
  cyl(0.3, 0.3, 0.16, GUN, [0, TOP + 0.2, CZ], undefined, 14);
  glow(b.part(new THREE.TorusGeometry(0.31, 0.015, 4, 24).rotateX(PI / 2), CYAN, { at: [0, TOP + 0.2, CZ] }), 1.3);
  cyl(0.2, 0.22, 0.2, STEELP, [0, TOP + 0.36, CZ], undefined, 12);
  for (const s of sides) {
    box(0.07, 0.4, 0.5, GUN2, [s * 0.24, BY, CZ]);
    cyl(0.1, 0.1, 0.05, STEELP, [s * 0.29, BY, CZ], [s, 0, 0], 12);
    glow(plane(0.3, 0.16, SCREEN, [s * 0.279, BY - 0.1, CZ - 0.05], [s, 0, 0]), 1.0);
    bolts([[s * 0.32, BY, CZ]], 0.02, "x", GOLD);
    const p0: V = [s * 0.3, TOP + 0.12, -0.75];
    const p1: V = [s * 0.12, 2.56, -0.5];
    b.rod(p0, [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2], 0.045, GUN);
    b.rod(p0, p1, 0.028, STEELP);
  }
  box(0.4, 0.3, 0.55, GUN, [0, BY, CZ]);
  b.part(new THREE.SphereGeometry(0.19, 10, 8), GUN2, { at: [0, BY, -0.62], scale: [1, 1, 1.3] });
  cyl(0.105, 0.135, 1.1, STEELP, [0, BY, 0.45], [0, 0, 1], 14);
  cyl(0.17, 0.17, 0.12, GUN2, [0, BY, -0.02], [0, 0, 1], 14);
  for (const z of [0.25, 0.75]) cyl(0.15, 0.15, 0.05, GUN2, [0, BY, z], [0, 0, 1], 14);
  glow(cyl(0.142, 0.142, 0.025, MAG, [0, BY, 0.5], [0, 0, 1], 14), 1.3);
  cyl(0.06, 0.11, 0.35, GUN2, [0, BY, 1.175], [0, 0, 1], 12);
  cyl(0.09, 0.09, 0.04, GOLD, [0, BY, 1.33], [0, 0, 1], 12);
  glow(cyl(0.058, 0.058, 0.02, CYAN, [0, BY, 1.355], [0, 0, 1], 12), 2);
  box(0.05, 0.05, 0.9, GUN, [0, BY + 0.16, 0.4]);
  box(0.1, 0.1, 0.14, GUN2, [0, BY + 0.22, 0.0]);
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { at: [0, BY + 0.22, 0.08] }), 1.6);

  // ------------------------------------------------------------------ scuffs & stickers on the flanks
  const R = rng(11);
  const hits = b.surface(shell).scatter(34, {
    rng: rng(3),
    minDist: 0.35,
    filter: (h) => Math.abs(h.n.x) > 0.8 && h.at.y > 0.75 && h.at.y < 1.5,
  });
  const tags = [MAG, CYAN, AMBER, BLACK, WHITE];
  hits.forEach((h, i) => {
    b.stick(new THREE.BoxGeometry(0.05 + R() * 0.08, 0.008, 0.03 + R() * 0.05), tags[i % tags.length], h, {
      embed: 0.5,
      spin: R() * 360,
    });
  });

  return b.root;
}
```