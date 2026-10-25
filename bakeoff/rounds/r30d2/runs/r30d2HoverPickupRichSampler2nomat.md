```ts
import * as THREE from "three";
import { createBuilder, frame, rng, mix, noise, paint, smoothstep, svg, catmull } from "agentic-3js-builder";
import type { Fill } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Hover Raider 07",
  description:
    "A militarized pickup converted to hover: four ducted-fan lift pods on outrigger arms, an armoured camo cab, a bed-mounted railgun turret with power cells, hood missile pods, neon underglow and corp-security decals. Low-poly cyberpunk, resting on its landing pads.",
};

type V3 = [number, number, number];
type Opts = Record<string, any>;
const DEG = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "hover_raider", paintSize: 2048 });
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });

  // ------------------------------------------------------------------ palette
  const CYAN = "#27f0ff";
  const MAG = "#ff2fa6";
  const AMBER = "#ffb020";
  const HAZ = "#f2c200";
  const RED = "#ff3347";
  const WHITE = "#e9f6f8";
  const DARK = "#1c1e22";
  const GUN = "#2f343a";
  const STEEL = "#7b858f";
  const GLASS = "#0f2b38";
  const OLIVE = "#4a5443";
  const ORANGE = "#ff6a1f";
  const DOME = "#1d6f86";

  // ------------------------------------------------------------------ geometry helpers
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);
  const bx = (w: number, h: number, d: number, color: Fill, at: V3, o: Opts = {}) =>
    b.part(box(w, h, d), color, { bone: chassis, at, ...o });
  const cy = (r: number, h: number, color: Fill, at: V3, o: Opts = {}, sides = 8) =>
    b.part(cyl(r, h, sides), color, { bone: chassis, at, ...o });
  const rd = (a: V3, c: V3, r: number, color: Fill, o: Opts = {}) =>
    b.rod(a, c, r, color, { bone: chassis, sides: 6, ...o });
  const torus = (R: number, t: number, color: Fill, at: V3, o: Opts = {}, seg = 12) =>
    b.part(new THREE.TorusGeometry(R, t, 4, seg), color, { bone: chassis, at, ...o });
  const decal = (tex: THREE.Texture, w: number, h: number, at: V3, dir: V3, up: V3, o: Opts = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: chassis, at, dir, up, axis: "z", texture: tex, ...o });

  // ------------------------------------------------------------------ paints
  const hullBase = paint((p, n) => {
    const patch = noise(p, 0.7, 11);
    let c = mix("#3d453a", "#59634f", smoothstep(0.35, 0.65, patch));
    c = mix(c, "#25282c", smoothstep(0.62, 0.75, noise(p, 0.45, 23)) * 0.85);
    c = mix(c, "#7b8470", smoothstep(0.55, 1, n.y) * 0.35);
    c = mix(c, "#16171a", (1 - smoothstep(0.75, 1.15, p.y)) * (0.35 + 0.5 * noise(p, 0.18, 5)));
    if (Math.abs(n.x) > 0.7 && Math.abs(p.y - 1.02) < 0.012) c = mix(c, "#ff2fa6", 1);
    return c;
  });
  const HULL = panelled(hullBase, { size: 0.62, aspect: 0.6, rivets: 0.12 });
  const IRON = metal("iron", { tarnish: 0.5, seed: 3 });
  const BLUED = metal("blued", { seed: 9 });

  // ------------------------------------------------------------------ textures
  const rr = rng(21);
  let city = "";
  for (let i = 0; i < 24; i++) {
    const h = 10 + rr() * 24;
    const x = i * 7.2;
    city += `<rect x="${x.toFixed(1)}" y="${(60 - h).toFixed(1)}" width="6.4" height="${h.toFixed(1)}" fill="#1a1033"/>`;
    for (let k = 0; k < 3; k++)
      if (rr() > 0.45)
        city += `<rect x="${(x + 1.2).toFixed(1)}" y="${(60 - h + 3 + k * 7).toFixed(1)}" width="1.8" height="2.2" fill="${rr() > 0.5 ? MAG : CYAN}"/>`;
  }
  const TEX_WIND = svg(
    `<svg viewBox="0 0 170 60" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07202c"/><stop offset=".55" stop-color="#17445a"/><stop offset="1" stop-color="#3a1b52"/></linearGradient></defs><rect width="170" height="60" fill="url(#g)"/>${city}<polygon points="22,0 48,0 26,60 0,60" fill="#ffffff" opacity=".13"/><polygon points="62,0 74,0 52,60 40,60" fill="#ffffff" opacity=".09"/><path d="M6 8 h26 M6 13 h16" stroke="${CYAN}" stroke-width="1.2" opacity=".8"/><rect x="1.5" y="1.5" width="167" height="57" fill="none" stroke="#07090c" stroke-width="3"/></svg>`,
    { size: 512 },
  );

  const TEX_EMBLEM = svg(
    `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg"><polygon points="26,4 74,4 96,30 74,56 26,56 4,30" fill="#101215" stroke="${CYAN}" stroke-width="3"/><polygon points="30,10 70,10 88,30 70,50 30,50 12,30" fill="none" stroke="${MAG}" stroke-width="1.5"/><text x="50" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#f4fbff" letter-spacing="2">NOMAD</text><text x="50" y="42" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="7" fill="${CYAN}" letter-spacing="1.5">SEC // HOVER</text><path d="M34 16 h32" stroke="${HAZ}" stroke-width="2.4"/><path d="M36 48 h28" stroke="${HAZ}" stroke-width="1.6"/></svg>`,
    { size: 256 },
  );

  let stripes = "";
  for (let i = -2; i < 9; i++)
    stripes += `<polygon points="${i * 10},16 ${i * 10 + 5},16 ${i * 10 + 13},0 ${i * 10 + 8},0" fill="#111214"/>`;
  const TEX_HAZARD = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="${HAZ}"/>${stripes}</svg>`,
    { size: 256 },
  );

  const TEX_HOOD = svg(
    `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg"><path d="M60 8 L92 22 L100 52 L84 62 L82 82 L68 90 L60 84 L52 90 L38 82 L36 62 L20 52 L28 22Z" fill="#14161a" stroke="${MAG}" stroke-width="4" stroke-linejoin="round"/><path d="M33 44 L55 53 L52 63 L36 58Z" fill="${CYAN}"/><path d="M87 44 L65 53 L68 63 L84 58Z" fill="${CYAN}"/><path d="M60 66 L54 78 L66 78Z" fill="${MAG}"/><path d="M46 84 v-9 M53 88 v-9 M60 90 v-9 M67 88 v-9 M74 84 v-9" stroke="#e9f6f8" stroke-width="3"/><path d="M4 6 l10 8 l-10 8 M14 6 l10 8 l-10 8" stroke="${HAZ}" stroke-width="3" fill="none"/><path d="M116 6 l-10 8 l10 8 M106 6 l-10 8 l10 8" stroke="${HAZ}" stroke-width="3" fill="none"/><path d="M26 28 L48 20 M94 28 L72 20" stroke="${CYAN}" stroke-width="2"/></svg>`,
    { size: 384 },
  );

  const TEX_PLATE = svg(
    `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="60" rx="6" fill="#0d0e10"/><rect x="3" y="3" width="114" height="54" rx="4" fill="none" stroke="${HAZ}" stroke-width="2.5"/><text x="60" y="36" text-anchor="middle" font-family="Courier New, monospace" font-weight="bold" font-size="25" fill="#f4fbff" letter-spacing="1">HVR-2077</text><text x="60" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" fill="${CYAN}" letter-spacing="2">NO WHEELS NEEDED</text><rect x="8" y="8" width="104" height="5" fill="${MAG}"/></svg>`,
    { size: 256 },
  );

  const TEX_SCREEN = svg(
    `<svg viewBox="0 0 160 50" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="50" fill="#04090c"/><text x="10" y="26" font-family="Courier New, monospace" font-weight="bold" font-size="20" fill="${CYAN}">SEC//OPS 07</text><rect x="10" y="33" width="96" height="5" fill="${MAG}"/><rect x="110" y="33" width="20" height="5" fill="${AMBER}"/><path d="M10 44 h140" stroke="${CYAN}" stroke-width="1" opacity=".6"/><path d="M0 6 h160 M0 12 h160" stroke="#000" stroke-width=".6" opacity=".5"/><rect x="2" y="2" width="156" height="46" fill="none" stroke="${CYAN}" stroke-width="1.5"/></svg>`,
    { size: 512 },
  );

  let leds = "";
  for (let i = 0; i < 20; i++) {
    const h = 6 + ((i * 7) % 11);
    leds += `<rect x="${3 + i * 3.8}" y="${(22 - h) / 2}" width="2.2" height="${h}" fill="${i % 5 === 2 ? CYAN : MAG}"/>`;
  }
  const TEX_GRILLE = svg(
    `<svg viewBox="0 0 80 22" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="22" fill="#08090b"/>${leds}<rect x="1" y="1" width="78" height="20" fill="none" stroke="#3a3f46" stroke-width="2"/></svg>`,
    { size: 256 },
  );

  const TEX_ROOF = svg(
    `<svg viewBox="0 0 90 56" xmlns="http://www.w3.org/2000/svg"><text x="45" y="46" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-weight="bold" font-size="56" fill="#e9f6f8" stroke="#0a0a0c" stroke-width="3" paint-order="stroke">07</text><path d="M2 14 l8 14 l-8 14 M12 14 l8 14 l-8 14" stroke="${HAZ}" stroke-width="3.5" fill="none"/><path d="M88 14 l-8 14 l8 14 M78 14 l-8 14 l8 14" stroke="${HAZ}" stroke-width="3.5" fill="none"/></svg>`,
    { size: 256 },
  );

  const TEX_AMMO = svg(
    `<svg viewBox="0 0 60 24" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="24" fill="#04090c"/><text x="4" y="9" font-family="Courier New, monospace" font-weight="bold" font-size="8" fill="${CYAN}">RAIL-Mk4</text><text x="4" y="21" font-family="Courier New, monospace" font-weight="bold" font-size="12" fill="${AMBER}">128</text><rect x="30" y="14" width="26" height="5" fill="none" stroke="${CYAN}" stroke-width="1"/><rect x="31" y="15" width="17" height="3" fill="${MAG}"/></svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------------ hull
  const hullProfile: [number, number][] = [
    [-2.6, 0.7],
    [2.55, 0.7],
    [2.75, 0.9],
    [2.75, 1.2],
    [1.1, 1.38],
    [-2.6, 1.38],
  ];
  b.extrude(hullProfile, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.9, bevel: 0.04, bone: chassis, color: HULL });

  // belly, reactor spine and underglow
  bx(1.7, 0.1, 4.9, GUN, [0, 0.66, -0.1]);
  cy(0.2, 2.8, GUN, [0, 0.5, 0], { rotation: [90, 0, 0] }, 10);
  for (let i = -2; i <= 2; i++) glow(torus(0.215, 0.022, CYAN, [0, 0.5, i * 0.55], {}, 10));
  for (const s of [1, -1]) {
    glow(bx(0.05, 0.05, 4.3, MAG, [s * 0.97, 0.73, -0.1]), 1.2);
    bx(0.07, 0.12, 4.4, DARK, [s * 0.95, 0.78, -0.1]);
    bx(0.04, 0.2, 1.4, STEEL, [s * 0.5, 0.55, 0.0]); // belly fins
  }
  glow(bx(0.9, 0.03, 2.6, CYAN, [0, 0.59, 0]), 0.9);

  // ------------------------------------------------------------------ cab
  const cabProfile: [number, number][] = [
    [-0.95, 1.38],
    [1.0, 1.38],
    [0.55, 2.0],
    [-0.7, 2.0],
    [-0.95, 1.85],
  ];
  b.extrude(cabProfile, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.85, bevel: 0.035, bone: chassis, color: HULL });
  bx(1.7, 0.05, 1.25, GUN, [0, 2.03, -0.1]);
  bx(1.8, 0.05, 0.3, GUN, [0, 2.03, 0.62], { rotation: [-8, 0, 0] }); // brow visor
  // windscreen
  decal(TEX_WIND, 1.68, 0.58, [0, 1.702, 0.781], [0, 0.587, 0.809], [0, 1, 0]);
  bx(1.84, 0.07, 0.1, DARK, [0, 1.96, 0.585]);
  bx(1.84, 0.07, 0.1, DARK, [0, 1.43, 0.97]);
  for (const s of [1, -1]) {
    rd([s * 0.88, 1.4, 0.99], [s * 0.88, 1.98, 0.575], 0.045, DARK, { section: "box" });
    // side window + shutter bars
    b.extrude(
      [
        [-0.7, 1.52],
        [0.86, 1.52],
        [0.66, 1.88],
        [-0.7, 1.9],
      ],
      { at: [s * 0.925, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.035, bone: chassis, color: GLASS },
    );
    for (const z of [-0.3, 0.15, 0.55]) rd([s * 0.945, 1.52, z], [s * 0.945, 1.87, z], 0.012, STEEL, { sides: 4 });
    rd([s * 0.945, 1.7, -0.7], [s * 0.945, 1.7, 0.78], 0.012, STEEL, { sides: 4 });
    // door seams, handle
    bx(0.02, 0.6, 0.02, DARK, [s * 0.93, 1.68, -0.62]);
    bx(0.02, 0.6, 0.02, DARK, [s * 0.93, 1.68, 0.9 - 0.2]);
    bx(0.03, 0.045, 0.17, STEEL, [s * 0.94, 1.46, -0.42]);
    // wing cams on stalks
    rd([s * 0.93, 1.78, 0.82], [s * 1.12, 1.84, 0.88], 0.018, STEEL);
    bx(0.13, 0.1, 0.1, GUN, [s * 1.15, 1.84, 0.9]);
    glow(cy(0.028, 0.03, CYAN, [s * 1.15, 1.84, 0.96], { rotation: [90, 0, 0] }, 8));
    // emblem + side armour plates on flank
    decal(TEX_EMBLEM, 0.78, 0.47, [s * 0.956, 1.0, 0.3], [s, 0, 0], [0, 1, 0]);
    bx(0.05, 0.4, 0.62, "#3a4047", [s * 0.975, 1.02, -0.55]);
    bx(0.05, 0.4, 0.5, "#3a4047", [s * 0.975, 1.02, 1.25]);
    for (const [zz, dz] of [[-0.55, 0.22], [-0.55, -0.22], [1.25, 0.17], [1.25, -0.17]] as const)
      for (const dy of [0.14, -0.14]) cy(0.018, 0.03, STEEL, [s * 1.005, 1.02 + dy, zz + dz], { rotation: [0, 0, 90] }, 6);
  }
  // rear window
  bx(1.3, 0.3, 0.04, GLASS, [0, 1.62, -0.955]);
  for (const x of [-0.3, 0.3]) rd([x, 1.47, -0.97], [x, 1.77, -0.97], 0.012, STEEL, { sides: 4 });

  // roof kit
  decal(TEX_ROOF, 0.9, 0.56, [0, 2.062, -0.1], [0, 1, 0], [0, 0, -1]);
  bx(1.5, 0.08, 0.12, DARK, [0, 2.1, 0.5]);
  glow(bx(1.38, 0.035, 0.02, WHITE, [0, 2.1, 0.565]), 1.2);
  for (const s of [1, -1]) glow(bx(0.1, 0.06, 0.1, AMBER, [s * 0.8, 2.1, 0.5]));
  for (const s of [1, -1]) {
    // sensor dome (+x) and radar dish (-x)
    const dx = s * 0.68;
    if (s > 0) {
      cy(0.2, 0.06, GUN, [dx, 2.08, -0.55], {}, 10);
      b.part(new THREE.SphereGeometry(0.17, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), DOME, { bone: chassis, at: [dx, 2.1, -0.55], flat: true });
      glow(b.part(new THREE.OctahedronGeometry(0.06), CYAN, { bone: chassis, at: [dx, 2.17, -0.55], flat: true }));
    } else {
      cy(0.05, 0.14, STEEL, [dx, 2.12, -0.55]);
      b.lathe(
        [
          [0, 0],
          [0.22, 0.1],
          [0.22, 0.125],
          [0, 0.035],
        ],
        { at: [dx, 2.18, -0.55], axis: [0, 0.8, 0.6], segments: 10, bone: chassis, color: STEEL },
      );
      rd([dx, 2.24, -0.55], [dx, 2.36, -0.4], 0.01, STEEL, { sides: 4 });
      glow(b.part(new THREE.SphereGeometry(0.025, 5, 4), RED, { bone: chassis, at: [dx, 2.37, -0.39], flat: true }));
    }
  }
  b.spike([-0.84, 2.05, -0.82], [0, 1, 0], 1.0, 0.016, STEEL, { bone: chassis, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), RED, { bone: chassis, at: [-0.84, 3.06, -0.82], flat: true }), 1.5);
  b.spike([0.84, 2.05, -0.82], [0, 1, 0], 0.6, 0.014, STEEL, { bone: chassis, sides: 5 });

  // ------------------------------------------------------------------ hood and nose
  decal(TEX_HOOD, 0.9, 0.75, [0, 1.288, 2.05], [0, 0.994, 0.105], [0, 0, -1]);
  b.frustumBox([0, 1.4, 1.12], [0, 1.37, 1.5], [0.5, 0.14], [0.4, 0.07], { bone: chassis, color: GUN });
  glow(bx(0.34, 0.02, 0.04, MAG, [0, 1.44, 1.52]));
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) glow(bx(0.22, 0.014, 0.045, MAG, [s * 0.62, 1.372 - i * 0.012, 1.2 + i * 0.12]), 0.9);
  // headlights, grille, brow
  decal(TEX_GRILLE, 0.74, 0.2, [0, 1.05, 2.756], [0, 0, 1], [0, 1, 0]);
  bx(0.8, 0.03, 0.04, DARK, [0, 1.17, 2.76]);
  bx(0.8, 0.03, 0.04, DARK, [0, 0.93, 2.76]);
  glow(bx(1.6, 0.025, 0.03, MAG, [0, 0.9, 2.77]), 1.1);
  for (const s of [1, -1]) {
    glow(bx(0.4, 0.06, 0.03, WHITE, [s * 0.68, 1.06, 2.76], { rotation: [0, 0, s * 12] }), 1.4);
    bx(0.48, 0.04, 0.09, GUN, [s * 0.68, 1.13, 2.77], { rotation: [0, 0, s * 12] });
    bx(0.12, 0.12, 0.03, DARK, [s * 0.95, 1.08, 2.74]);
  }
  // front ram bumper
  b.extrude(
    [
      [-1.0, 0],
      [1.0, 0],
      [1.12, 0.18],
      [1.0, 0.34],
      [-1.0, 0.34],
      [-1.12, 0.18],
    ],
    { at: [0, 0.6, 2.88], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.26, bevel: 0.03, bone: chassis, color: GUN },
  );
  decal(TEX_HAZARD, 1.9, 0.14, [0, 0.8, 3.015], [0, 0, 1], [0, 1, 0]);
  for (let i = 0; i < 7; i++) b.spike([-0.9 + i * 0.3, 0.62, 3.0], [0, -0.35, 1], 0.2, 0.04, STEEL, { bone: chassis, sides: 5 });
  torus(0.08, 0.018, STEEL, [0.7, 0.7, 3.02], {}, 8);
  torus(0.08, 0.018, STEEL, [-0.7, 0.7, 3.02], {}, 8);

  // hood missile pods
  for (const s of [1, -1]) {
    const f = frame([s * 0.74, 1.5, 1.85], [0, 0.22, 1], [0, 1, 0]);
    b.part(box(0.36, 0.62, 0.36), GUN, { bone: chassis, frame: f.moved([0, 0.31, 0]) });
    b.part(box(0.4, 0.1, 0.4), DARK, { bone: chassis, frame: f.moved([0, 0.08, 0]) });
    b.part(box(0.1, 0.1, 0.5), STEEL, { bone: chassis, frame: f.moved([0, 0.0, 0]) });
    for (const u of [-0.075, 0.075])
      for (const w of [-0.075, 0.075]) {
        b.part(cyl(0.068, 0.03, 8), DARK, { bone: chassis, frame: f.moved([u, 0.62, w]) });
        b.spike(f.local([u, 0.6, w]), f.dir([0, 1, 0]), 0.14, 0.05, RED, { bone: chassis, sides: 6 });
      }
    glow(b.part(box(0.2, 0.02, 0.02), AMBER, { bone: chassis, frame: f.moved([0, 0.4, 0.185]) }));
  }

  // ------------------------------------------------------------------ bed
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-2.6, 0],
        [-0.95, 0],
        [-0.95, 0.5],
        [-1.3, 0.55],
        [-2.6, 0.42],
      ],
      { at: [s * 0.9, 1.38, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.1, bevel: 0.02, bone: chassis, color: HULL },
    );
    for (const z of [-1.2, -1.75, -2.35]) bx(0.12, 0.44, 0.06, DARK, [s * 0.9, 1.62, z]);
    glow(decal(TEX_SCREEN, 0.9, 0.28, [s * 0.956, 1.66, -1.78], [s, 0, 0], [0, 1, 0]), 0.9);
    // exhaust stacks
    rd([s * 1.0, 1.4, -1.05], [s * 1.0, 2.25, -1.05], 0.055, STEEL, { sides: 8 });
    cy(0.075, 0.45, GUN, [s * 1.0, 1.75, -1.05], {}, 8);
    for (const y of [1.5, 2.0]) bx(0.14, 0.04, 0.14, DARK, [s * 0.98, y, -1.05]);
    glow(cy(0.05, 0.03, ORANGE, [s * 1.0, 2.27, -1.05], {}, 6), 1.3);
    // jerry cans and crates
    bx(0.3, 0.26, 0.3, OLIVE, [s * 0.7, 1.51, -1.22]);
    bx(0.31, 0.03, 0.31, HAZ, [s * 0.7, 1.51, -1.22]);
    bx(0.2, 0.3, 0.1, s > 0 ? ORANGE : "#6f7d3a", [s * 0.7, 1.53, -1.75]);
    rd([s * 0.7 - 0.06, 1.69, -1.75], [s * 0.7 + 0.06, 1.69, -1.75], 0.012, DARK, { sides: 4 });
  }
  bx(1.7, 0.03, 1.62, DARK, [0, 1.395, -1.78]); // grated floor
  for (let i = 0; i < 7; i++) bx(0.03, 0.02, 1.6, STEEL, [-0.72 + i * 0.24, 1.41, -1.78]);

  // headboard rack
  for (const s of [1, -1]) rd([s * 0.88, 1.38, -1.03], [s * 0.88, 2.08, -1.03], 0.03, STEEL);
  bx(1.8, 0.05, 0.05, STEEL, [0, 2.08, -1.03]);
  bx(1.8, 0.04, 0.05, STEEL, [0, 1.75, -1.03]);
  for (let i = -3; i <= 3; i++) rd([i * 0.25, 1.75, -1.03], [i * 0.25, 2.08, -1.03], 0.01, STEEL, { sides: 4 });
  for (const s of [1, -1]) {
    bx(0.16, 0.1, 0.1, DARK, [s * 0.6, 2.14, -1.03]);
    glow(bx(0.12, 0.06, 0.02, AMBER, [s * 0.6, 2.14, -0.97]), 1.2);
  }

  // tailgate (hinged)
  const gate = b.joint("tailgate", { parent: chassis, at: [0, 1.42, -2.56], dir: [0, 1, 0], role: "hinge" });
  bx(1.7, 0.46, 0.08, HULL, [0, 1.62, -2.56], { bone: gate });
  bx(1.72, 0.05, 0.1, DARK, [0, 1.86, -2.56], { bone: gate });
  decal(TEX_PLATE, 0.5, 0.25, [0, 1.6, -2.603], [0, 0, -1], [0, 1, 0], { bone: gate });
  glow(bx(1.5, 0.04, 0.03, RED, [0, 1.8, -2.605], { bone: gate }), 1.3);
  decal(TEX_HAZARD, 1.6, 0.1, [0, 1.46, -2.603], [0, 0, -1], [0, 1, 0], { bone: gate });
  for (const s of [1, -1]) {
    bx(0.08, 0.12, 0.05, STEEL, [s * 0.84, 1.45, -2.6], { bone: gate });
    glow(bx(0.1, 0.1, 0.03, RED, [s * 0.9, 1.0, -2.61]));
  }

  // rear thrusters
  for (const s of [1, -1]) {
    b.lathe(
      [
        [0, 0],
        [0.26, 0],
        [0.2, 0.1],
        [0.34, 0.38],
        [0.3, 0.38],
        [0.16, 0.12],
        [0, 0.14],
      ],
      { at: [s * 0.55, 1.02, -2.6], axis: [0, 0, -1], segments: 10, bone: chassis, color: STEEL },
    );
    glow(b.part(cyl(0.13, 0.03, 10), CYAN, { bone: chassis, at: [s * 0.55, 1.02, -2.72], dir: [0, 0, -1], flat: true }), 1.4);
    torus(0.25, 0.02, DARK, [s * 0.55, 1.02, -2.82], {}, 10);
    torus(0.32, 0.02, MAG, [s * 0.55, 1.02, -2.96], {}, 10);
    glow(torus(0.32, 0.02, MAG, [s * 0.55, 1.02, -2.96], {}, 10));
    for (const a of [90, 210, 330])
      rd(
        [s * 0.55 + 0.17 * Math.cos(a * DEG), 1.02 + 0.17 * Math.sin(a * DEG), -2.62],
        [s * 0.55 + 0.31 * Math.cos(a * DEG), 1.02 + 0.31 * Math.sin(a * DEG), -2.94],
        0.012,
        DARK,
        { sides: 4 },
      );
  }

  // power cells
  bx(1.5, 0.05, 0.28, GUN, [0, 1.41, -2.28]);
  bx(1.5, 0.04, 0.28, GUN, [0, 2.03, -2.28]);
  for (let i = -1; i <= 1; i++) {
    glow(cy(0.115, 0.58, i === 0 ? MAG : CYAN, [i * 0.5, 1.72, -2.28], {}, 8), 1.2);
    cy(0.14, 0.04, DARK, [i * 0.5, 1.45, -2.28], {}, 8);
    cy(0.14, 0.04, DARK, [i * 0.5, 2.0, -2.28], {}, 8);
  }
  for (const s of [1, -1]) rd([s * 0.75, 1.42, -2.28], [s * 0.75, 2.03, -2.28], 0.025, STEEL);
  b.sweep(
    catmull([
      [0.2, 2.0, -1.8],
      [0.45, 1.62, -2.0],
      [0.5, 1.85, -2.2],
      [0.5, 2.03, -2.28],
    ]),
    0.022,
    "#10161a",
    { bone: chassis, sides: 5 },
  );
  b.sweep(
    catmull([
      [-0.2, 2.0, -1.8],
      [-0.45, 1.62, -2.0],
      [-0.5, 1.85, -2.2],
      [-0.5, 2.03, -2.28],
    ]),
    0.022,
    MAG,
    { bone: chassis, sides: 5 },
  );

  // ------------------------------------------------------------------ railgun turret
  const TZ = -1.55;
  torus(0.44, 0.04, STEEL, [0, 1.42, TZ], { rotation: [90, 0, 0] }, 14);
  cy(0.22, 0.6, GUN, [0, 1.68, TZ]);
  for (const a of [0, 120, 240])
    rd(
      [0.42 * Math.cos(a * DEG), 1.42, TZ + 0.42 * Math.sin(a * DEG)],
      [0.18 * Math.cos(a * DEG), 1.85, TZ + 0.18 * Math.sin(a * DEG)],
      0.03,
      STEEL,
    );
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 1.95, TZ], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 2.3, TZ], dir: [0, 0, 1], role: "hinge" });
  cy(0.36, 0.12, GUN, [0, 2.02, TZ], { bone: yaw }, 12);
  for (const s of [1, -1]) {
    bx(0.07, 0.46, 0.5, GUN, [s * 0.27, 2.25, TZ + 0.05], { bone: yaw });
    b.extrude(
      [
        [0.2, -0.3],
        [0.62, -0.3],
        [0.78, 0.0],
        [0.62, 0.28],
        [0.2, 0.28],
      ],
      { at: [0, 2.3, TZ + 0.4], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.06, bevel: 0.015, bone: yaw, color: HULL },
    );
    glow(bx(0.2, 0.03, 0.02, MAG, [s * 0.45, 2.2, TZ + 0.44], { bone: yaw }));
  }
  rd([-0.3, 2.3, TZ], [0.3, 2.3, TZ], 0.05, STEEL, { bone: pitch, sides: 8 });
  bx(0.42, 0.36, 0.7, GUN, [0, 2.3, TZ + 0.05], { bone: pitch });
  bx(0.3, 0.1, 0.5, DARK, [0, 2.52, TZ + 0.05], { bone: pitch });
  bx(0.34, 0.2, 0.12, STEEL, [0, 2.3, TZ - 0.33], { bone: pitch });
  for (const s of [1, -1]) {
    bx(0.07, 0.12, 1.7, STEEL, [s * 0.13, 2.3, TZ + 1.2], { bone: pitch });
    cy(0.1, 0.7, BLUED, [s * 0.34, 2.25, TZ + 0.1], { bone: pitch, rotation: [90, 0, 0] }, 8);
    for (const dz of [-0.2, 0.1, 0.4]) glow(torus(0.105, 0.015, CYAN, [s * 0.34, 2.25, TZ + dz], { bone: pitch }, 8));
    decal(TEX_AMMO, 0.3, 0.12, [s * 0.216, 2.33, TZ + 0.05], [s, 0, 0], [0, 1, 0], { bone: pitch });
  }
  glow(decal(TEX_AMMO, 0.3, 0.12, [0.217, 2.33, TZ + 0.05], [1, 0, 0], [0, 1, 0], { bone: pitch }));
  glow(bx(0.12, 0.03, 1.6, CYAN, [0, 2.3, TZ + 1.2], { bone: pitch }), 1.6);
  for (const dz of [0.6, 1.0, 1.4, 1.8]) {
    torus(0.19, 0.028, DARK, [0, 2.3, TZ + dz], { bone: pitch }, 8);
    glow(torus(0.19, 0.012, MAG, [0, 2.3, TZ + dz + 0.03], { bone: pitch }, 8));
  }
  bx(0.5, 0.22, 0.16, GUN, [0, 2.3, TZ + 2.08], { bone: pitch });
  glow(bx(0.14, 0.05, 0.02, CYAN, [0, 2.3, TZ + 2.17], { bone: pitch }), 1.8);
  b.frustumBox([0, 2.3, TZ + 0.35], [0, 2.3, TZ + 0.55], [0.34, 0.2], [0.3, 0.16], { bone: pitch, color: DARK });
  for (const s of [1, -1]) rd([s * 0.24, 2.4, TZ + 0.5], [s * 0.2, 2.4, TZ + 1.2], 0.014, STEEL, { bone: pitch, sides: 5 });

  // ------------------------------------------------------------------ hover pods
  const SHROUD: [number, number][] = [
    [0.34, 0],
    [0.44, 0],
    [0.47, 0.1],
    [0.46, 0.42],
    [0.4, 0.5],
    [0.34, 0.5],
    [0.36, 0.25],
  ];
  const pods = [
    ["FL", 1, 1.7],
    ["FR", -1, 1.7],
    ["RL", 1, -1.55],
    ["RR", -1, -1.55],
  ] as const;
  for (const [k, s, pz] of pods) {
    const px = s * 1.44;
    const py = 0.62;
    const pod = b.joint(`pod${k}`, { parent: chassis, at: [s * 1.0, 0.85, pz], dir: [0, 1, 0], role: "hinge" });
    const fan = b.joint(`fan${k}`, { parent: pod, at: [px, py, pz], dir: [0, 1, 0], role: "hinge" });
    for (const dz of [-0.26, 0.26]) {
      bx(0.3, 0.1, 0.12, GUN, [s * 1.1, 0.84, pz + dz], { bone: pod });
      rd([s * 0.93, 1.0, pz + dz], [s * 1.2, 0.84, pz + dz], 0.03, STEEL, { bone: pod });
    }
    b.lathe(SHROUD, { at: [px, py - 0.25, pz], axis: [0, 1, 0], segments: 12, bone: pod, color: IRON });
    glow(torus(0.468, 0.018, MAG, [px, py - 0.19, pz], { bone: pod, rotation: [90, 0, 0] }, 12), 1.2);
    glow(cy(0.33, 0.025, CYAN, [px, py - 0.2, pz], { bone: pod, flat: true }, 12), 1.4);
    torus(0.4, 0.012, STEEL, [px, py + 0.24, pz], { bone: pod, rotation: [90, 0, 0] }, 12);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      rd(
        [px + Math.cos(a) * 0.38, py + 0.24, pz + Math.sin(a) * 0.38],
        [px, py + 0.31, pz],
        0.012,
        STEEL,
        { bone: pod, sides: 4 },
      );
    }
    glow(b.part(new THREE.ConeGeometry(0.06, 0.1, 6), CYAN, { bone: pod, at: [px, py + 0.35, pz], flat: true }), 1.3);
    cy(0.08, 0.14, STEEL, [px, py, pz], { bone: fan }, 8);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(box(0.27, 0.012, 0.1), i % 2 ? STEEL : "#9aa4ae", {
        bone: fan,
        at: [px + Math.cos(a) * 0.2, py, pz + Math.sin(a) * 0.2],
        quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.35, -a, 0, "YXZ")),
      });
    }
    // landing legs
    for (const dz of [-0.3, 0.3]) {
      const lx = px + s * 0.5;
      rd([px + s * 0.45, 0.46, pz + dz], [lx, 0.04, pz + dz], 0.035, GUN, { bone: pod });
      bx(0.22, 0.04, 0.26, DARK, [lx, 0.02, pz + dz], { bone: pod });
      bx(0.06, 0.05, 0.1, HAZ, [lx, 0.2, pz + dz], { bone: pod });
    }
  }

  return b.root;
}
```