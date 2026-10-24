import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  mix,
  noise,
  resolve,
  smoothstep,
  svg,
  catmull,
  stripes,
  grain,
  lerp,
} from "../../../../src/index";
import type { ColorInput } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled, gaugeTexture } from "../../../../kits/clockwork";

export const meta = {
  name: "Desert Hoverbike",
  description:
    "A weathered Tatooine-style speeder bike: needle nose, twin rear thrust engines with fans and glowing nozzles, canted stabilizer fins with a tattered pennant, console with radar screen and gauges, bedroll and landing skids.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const CREAM = "#dccfae";
const SANDY = "#b9a57c";
const ORANGE = "#c95a1e";
const RUST = "#7d3514";
const GUNMETAL = "#3a3d44";
const DARK = "#1e2025";
const RUBBER = "#222024";
const DUST = "#c9ab78";
const TEAL_GLASS = "#5cb8c6";
const CYAN = "#8fe1ff";
const BRASSY = "#c79a45";
const CLOTH_RED = "#a8341f";
const CLOTH_TAN = "#d8c392";

type V = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Paints
const dusty = (base: ColorInput, amount = 1, seed = 3) =>
  paint((p, n) => {
    const c = resolve(base, p, n);
    const low = smoothstep(0.55, 0.1, p.y);
    const top = smoothstep(0.2, 0.9, n.y) * smoothstep(0.35, 0.7, noise(p, 0.12, seed));
    const k = Math.min(1, (low * 0.55 + top * 0.45) * amount);
    return mix(c, DUST, k);
  });

const hullBase = paint((p, n) => {
  const ax = Math.abs(p.x);
  if (n.y < -0.35) return GUNMETAL;
  if (ax < 0.04 && n.y > 0.25) return ORANGE;
  if (ax > 0.055 && ax < 0.07 && n.y > 0.25) return RUST;
  if (Math.abs(p.y - 0.55) < 0.022 && ax > 0.08 && n.y < 0.5 && p.z > -0.9) return ORANGE;
  const wear = noise(p, 0.05, 11);
  return mix(CREAM, SANDY, smoothstep(0.55, 0.8, wear) * 0.75);
});
const HULL = panelled(dusty(hullBase, 0.9), { size: 0.24, aspect: 0.8, rivets: 0.045 });
const ENGINE = panelled(dusty(metal("steel", { tarnish: 0.6, size: 0.1 }), 1, 5), { size: 0.2, rivets: 0.05 });
const DARKMETAL = dusty(metal("iron", { polish: 0.45 }), 0.7, 9);
const COPPER = metal("copper", { verdigris: 0.45, tarnish: 0.5 });
const BRASS = metal("brass", { tarnish: 0.5 });
const STEEL = metal("steel", { polish: 0.6 });
const LEATHER = grain("#6b4326", "#3d2414", { size: 0.02, axis: "z" });
const CLOTHP = stripes(CLOTH_RED, CLOTH_TAN, { size: 0.09, axis: "z", width: 0.22, wobble: 0.6, seed: 4 });
const BEDROLL = stripes(CLOTH_TAN, "#7a5a32", { size: 0.07, axis: "x", width: 0.3, wobble: 0.3, seed: 2 });
const CONSOLE = panelled(dusty(metal("iron", { polish: 0.35 }), 0.5), { size: 0.1, rivets: 0.03 });
const FINPAINT = paint((_p, _n, s) => (s[1] > 0.36 - 0.28 * s[0] ? ORANGE : HULL));

// ---------------------------------------------------------------------------------------------------------------
// Textures
const R = rng(7);
function glyphStrip() {
  let g = "";
  for (let i = 0; i < 9; i++) {
    const x = 10 + i * 21;
    const k = Math.floor(R() * 4);
    const w = 3.2;
    if (k === 0) g += `<path d="M${x} 6 V34 M${x - 7} 6 H${x + 7}" />`;
    else if (k === 1) g += `<circle cx="${x}" cy="20" r="8" /><circle cx="${x}" cy="20" r="1.6" fill="#7a3512"/>`;
    else if (k === 2) g += `<path d="M${x - 8} 6 L${x} 34 L${x + 8} 6 M${x} 14 V34" />`;
    else g += `<path d="M${x - 8} 30 Q${x} 2 ${x + 8} 30 M${x} 16 V36" />`;
    void w;
  }
  return svg(
    `<svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#7a3512" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${g}</g>
      <path d="M2 2 H198 M2 38 H198" stroke="#7a3512" stroke-width="1.6"/>
    </svg>`,
    { size: 512 },
  );
}
const GLYPHS = glyphStrip();

const SCREEN = svg(
  `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="60" fill="#06161a"/>
    <circle cx="32" cy="30" r="25" fill="#0a2a2c" stroke="#3cf0b0" stroke-width="1.6"/>
    <circle cx="32" cy="30" r="15" fill="none" stroke="#2bb585" stroke-width="1"/>
    <path d="M32 5 V55 M7 30 H57" stroke="#2bb585" stroke-width="0.8"/>
    <path d="M32 30 L50 14" stroke="#7dffd0" stroke-width="2"/>
    <circle cx="44" cy="40" r="2.6" fill="#ffd25a"/><circle cx="22" cy="20" r="2" fill="#ff6a4a"/>
    <rect x="68" y="12" width="9" height="36" fill="#ffb02e"/><rect x="80" y="24" width="9" height="24" fill="#ffb02e"/>
    <rect x="92" y="18" width="9" height="30" fill="#ffb02e"/><rect x="104" y="32" width="9" height="16" fill="#ff6a3a"/>
    <text x="68" y="8" font-family="monospace" font-size="7" fill="#7defff">VEL 142</text>
    <path d="M66 52 H116" stroke="#7defff" stroke-width="1"/>
  </svg>`,
  { size: 384 },
);

function fanSvg() {
  let blades = "";
  for (let i = 0; i < 9; i++)
    blades += `<g transform="rotate(${i * 40} 50 50)"><path d="M50 50 L44 12 Q54 6 60 14 Z" fill="#8c929e" stroke="#2a2d34" stroke-width="1.4"/></g>`;
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="#14161b"/>${blades}
      <circle cx="50" cy="50" r="49" fill="none" stroke="#5d626e" stroke-width="3"/>
      <circle cx="50" cy="50" r="9" fill="#c79a45" stroke="#2a2d34" stroke-width="2"/>
    </svg>`,
    { size: 192 },
  );
}
const FAN = fanSvg();

const PLATE = svg(
  `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="96" height="46" rx="6" fill="#e6d9b8" stroke="#2a1d10" stroke-width="3"/>
    <path d="M6 44 L16 44 L26 34 L16 34 Z M26 44 L36 44 L46 34 L36 34 Z" fill="#c95a1e"/>
    <text x="52" y="36" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="26" fill="#2a1d10">T-47</text>
    <rect x="8" y="8" width="84" height="5" fill="#2a1d10"/>
  </svg>`,
  { size: 256 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="46" fill="#e8d8b0" stroke="#2a1d10" stroke-width="5"/>
    <circle cx="50" cy="50" r="38" fill="none" stroke="#c95a1e" stroke-width="3"/>
    <path d="M18 62 A32 32 0 0 1 82 62 Z" fill="#c95a1e" stroke="#2a1d10" stroke-width="3"/>
    <g stroke="#2a1d10" stroke-width="4" stroke-linecap="round">
      <path d="M50 20 V10 M30 28 L24 20 M70 28 L76 20 M16 44 L8 40 M84 44 L92 40"/>
    </g>
    <path d="M14 70 H86 M24 78 H76 M36 86 H64" stroke="#2a1d10" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "desert_hoverbike" });
  const S = [1, -1];

  // Placement helpers ------------------------------------------------------------------------------------------
  const cyl = (r: number, h: number, color: ColorInput, at: V, dir: V = [0, 0, 1], seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir, flat: true });
  const box = (w: number, h: number, d: number, color: ColorInput, at: V, rotation?: V) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, rotation });
  const ball = (r: number, color: ColorInput, at: V) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at, flat: true });
  const unit = (x: number, y: number, z: number): V => new THREE.Vector3(x, y, z).normalize().toArray() as V;
  const band = (r: number, tube: number, color: ColorInput, at: V, dir: V = [0, 0, 1]) =>
    b.part(new THREE.TorusGeometry(r, tube, 5, 14), color, { at, dir, axis: "z", flat: true });

  // Fuselage ----------------------------------------------------------------------------------------------------
  const hull = b.loft(
    [
      { at: [0, 0.52, -1.05], w: 0.34, h: 0.3 },
      { at: [0, 0.56, -0.5], w: 0.46, h: 0.38 },
      { at: [0, 0.58, 0.1], w: 0.44, h: 0.34 },
      { at: [0, 0.55, 0.7], w: 0.3, h: 0.24 },
      { at: [0, 0.52, 1.2], w: 0.16, h: 0.14 },
      { at: [0, 0.5, 1.5], w: 0.07, h: 0.07 },
    ],
    { color: HULL, name: "hull" },
  );
  // Nose spike and lamp
  b.spike([0, 0.5, 1.48], [0, 0, 1], 0.28, 0.035, { color: STEEL });
  band(0.04, 0.008, BRASS, [0, 0.5, 1.5]);
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.082, 0.03],
      [0.065, 0.11],
      [0, 0.11],
    ],
    { at: [0, 0.62, 1.08], axis: [0, 0, 1], color: DARKMETAL, segments: 10, name: "lampHousing" },
  );
  glow(cyl(0.055, 0.014, "#fff2b8", [0, 0.62, 1.08 + 0.114]), 1.8);
  box(0.16, 0.012, 0.1, DARKMETAL, [0, 0.705, 1.15]); // lamp visor
  // dorsal ridge and grille slats
  b.frustumBox([0, 0.76, -0.95], [0, 0.72, -0.55], [0.12, 0.05], [0.2, 0.04], { color: ENGINE });
  for (let i = 0; i < 5; i++) box(0.12, 0.01, 0.02, DARK, [0, 0.72, 0.52 + i * 0.05], [-10, 0, 0]);
  // belly plate
  b.frustumBox([0, 0.37, -0.85], [0, 0.4, 0.55], [0.26, 0.04], [0.14, 0.04], { color: GUNMETAL });

  // Hull decals
  for (const s of S) {
    b.decal(hull, GLYPHS, { at: [s * 0.22, 0.6, -0.12], dir: [s, 0, 0], size: [0.5, 0.1] });
  }

  // Seat --------------------------------------------------------------------------------------------------------
  b.frustumBox([0, 0.8, -0.6], [0, 0.8, -0.1], [0.26, 0.1], [0.31, 0.1], { color: LEATHER });
  b.frustumBox([0, 0.88, -0.67], [0, 0.88, -0.62], [0.3, 0.24], [0.3, 0.24], { color: LEATHER });
  for (const s of S) box(0.014, 0.012, 0.5, "#e2cfa0", [s * 0.14, 0.853, -0.35]); // stitching rails
  box(0.1, 0.03, 0.012, "#ff3a2a", [0, 0.93, -0.676]);
  glow(box(0.1, 0.03, 0.012, "#ff3a2a", [0, 0.93, -0.678]), 2);

  // Bedroll + canteen on rear deck
  const roll = cyl(0.09, 0.5, BEDROLL, [0, 0.82, -0.86], [1, 0, 0], 10);
  void roll;
  for (const x of [-0.17, 0.17]) cyl(0.097, 0.035, RUBBER, [x, 0.82, -0.86], [1, 0, 0], 10);
  cyl(0.06, 0.07, "#5f6b4e", [0.0, 0.96, -0.86], [1, 0, 0], 10);
  ball(0.014, BRASS, [0.04, 0.96, -0.86]);
  band(0.062, 0.006, LEATHER, [0.0, 0.96, -0.86], [1, 0, 0]);

  // Console, screen, gauges ------------------------------------------------------------------------------------
  box(0.3, 0.08, 0.2, CONSOLE, [0, 0.8, 0.36], [-20, 0, 0]);
  const nrm = unit(0, 0.94, -0.34);
  glow(
    b.part(new THREE.PlaneGeometry(0.16, 0.08), "#ffffff", {
      at: [0, 0.848, 0.355],
      dir: nrm,
      axis: "z",
      texture: SCREEN,
    }),
    1.2,
  );
  for (const s of S) {
    cyl(0.04, 0.012, BRASS, [s * 0.115, 0.855, 0.405], nrm, 10);
    b.part(new THREE.CircleGeometry(0.034, 14), "#ffffff", {
      at: [s * 0.115, 0.866, 0.403],
      dir: nrm,
      axis: "z",
      texture: gaugeTexture({ needle: s > 0 ? 50 : -40, label: s > 0 ? "HEAT" : "PWR" }),
    });
    glow(ball(0.012, s > 0 ? "#ff4a3a" : "#4aff7a", [s * 0.14, 0.86, 0.3]), 2);
  }
  // Windscreen
  b.extrude(
    [
      [-0.17, 0],
      [0.17, 0],
      [0.14, 0.17],
      [0.06, 0.23],
      [-0.06, 0.23],
      [-0.14, 0.17],
    ],
    { at: [0, 0.72, 0.52], x: [1, 0, 0], y: unit(0, 0.86, -0.51), thickness: 0.012, bevel: 0.003, color: TEAL_GLASS },
  );
  for (const s of S) b.rod([s * 0.15, 0.7, 0.5], [s * 0.15, 0.76, 0.5], 0.014, { color: STEEL });
  box(0.4, 0.03, 0.04, DARKMETAL, [0, 0.715, 0.52]);

  // Handlebars -----------------------------------------------------------------------------------------------
  b.rod([0, 0.76, 0.36], [0, 1.02, 0.43], 0.028, { color: STEEL });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 8), DARKMETAL, { at: [0, 0.77, 0.36], flat: true });
  const bar = catmull([
    [-0.4, 0.985, 0.25],
    [-0.3, 1.01, 0.35],
    [-0.12, 1.03, 0.42],
    [0, 1.03, 0.43],
    [0.12, 1.03, 0.42],
    [0.3, 1.01, 0.35],
    [0.4, 0.985, 0.25],
  ]);
  b.sweep(bar, 0.016, { color: STEEL, sides: 8 });
  for (const s of S) {
    b.rod([s * 0.4, 0.985, 0.25], [s * 0.45, 0.97, 0.11], 0.024, { color: RUBBER });
    ball(0.026, BRASS, [s * 0.455, 0.968, 0.1]);
    b.rod([s * 0.41, 0.975, 0.23], [s * 0.37, 0.92, 0.3], 0.006, { color: STEEL });
    band(0.027, 0.006, BRASS, [s * 0.42, 0.98, 0.215], unit(s * 0.05, -0.015, -0.14));
  }
  // goggles hanging on the left bar
  band(0.03, 0.008, RUBBER, [0.28, 0.93, 0.36], [0, 0, 1]);
  band(0.03, 0.008, RUBBER, [0.34, 0.93, 0.34], [0, 0, 1]);
  b.part(new THREE.CircleGeometry(0.026, 10), "#e8a43a", { at: [0.28, 0.93, 0.362], dir: [0, 0, 1], axis: "z" });
  b.part(new THREE.CircleGeometry(0.026, 10), "#e8a43a", { at: [0.34, 0.93, 0.342], dir: [0, 0, 1], axis: "z" });
  b.rod([0.31, 0.95, 0.35], [0.3, 1.0, 0.36], 0.01, { color: RUBBER });

  // Footrests ----------------------------------------------------------------------------------------------
  for (const s of S) {
    box(0.2, 0.025, 0.3, DARKMETAL, [s * 0.27, 0.4, 0.28]);
    for (let i = 0; i < 4; i++) box(0.2, 0.01, 0.014, RUBBER, [s * 0.27, 0.418, 0.18 + i * 0.07]);
    b.rod([s * 0.19, 0.5, 0.28], [s * 0.3, 0.405, 0.28], 0.016, { color: STEEL });
  }

  // Engines ------------------------------------------------------------------------------------------------------
  for (const s of S) {
    const ex = s * 0.4;
    const ey = 0.5;
    const eng = b.rod([ex, ey, -1.4], [ex, ey, -0.2], 0.13, { color: ENGINE, name: "engine" });
    for (const z of [-1.15, -0.8, -0.45]) band(0.138, 0.012, DARKMETAL, [ex, ey, z]);
    // pylons
    for (const z of [-0.95, -0.45]) {
      b.rod([s * 0.18, 0.52, z], [ex - s * 0.03, ey, z], 0.035, { color: DARKMETAL });
      box(0.05, 0.12, 0.1, ENGINE, [s * 0.285, 0.52, z]);
    }
    // vents on top
    for (let i = 0; i < 6; i++) box(0.1, 0.012, 0.03, DARK, [ex, ey + 0.126, -1.25 + i * 0.08]);
    // copper pipework
    b.rod([s * 0.5, 0.58, -1.25], [s * 0.5, 0.58, -0.4], 0.018, { color: COPPER });
    for (const z of [-1.2, -0.8, -0.45]) b.rod([s * 0.5, 0.58, z], [s * 0.45, 0.6, z], 0.008, { color: STEEL });
    b.sweep(
      catmull([
        [s * 0.47, 0.58, -0.4],
        [s * 0.4, 0.66, -0.34],
        [s * 0.3, 0.7, -0.3],
        [s * 0.2, 0.68, -0.25],
      ]),
      0.016,
      { color: COPPER, sides: 6 },
    );
    // intake lip, fan and spinner
    b.lathe(
      [
        [0.13, 0],
        [0.165, 0.06],
        [0.165, 0.2],
        [0.15, 0.2],
        [0.15, 0.07],
        [0.115, 0],
      ],
      { at: [ex, ey, -0.2], axis: [0, 0, 1], color: DARKMETAL, segments: 10, name: "intake" },
    );
    b.part(new THREE.CircleGeometry(0.128, 18), "#ffffff", {
      at: [ex, ey, -0.165],
      dir: [0, 0, 1],
      axis: "z",
      texture: FAN,
    });
    b.part(new THREE.ConeGeometry(0.035, 0.1, 8), BRASS, { at: [ex, ey, -0.13], dir: [0, 0, 1], flat: true });
    // nozzle
    b.lathe(
      [
        [0.11, 0],
        [0.135, 0],
        [0.185, 0.15],
        [0.17, 0.15],
        [0.115, 0.04],
      ],
      { at: [ex, ey, -1.4], axis: [0, 0, -1], color: DARKMETAL, segments: 10, name: "nozzle" },
    );
    glow(cyl(0.108, 0.012, CYAN, [ex, ey, -1.41]), 2.4);
    glow(b.part(new THREE.ConeGeometry(0.085, 0.28, 8), "#d9f6ff", { at: [ex, ey, -1.56], dir: [0, 0, -1], flat: true }), 2.8);
    // number plate
    b.decal(eng, PLATE, { at: [s * 0.53, ey, -0.8], dir: [s, 0, 0], size: [0.24, 0.12] });

    // Stabilizer fin
    const lean = unit(s * 0.4, 1, 0);
    const fin = b.extrude(
      [
        [0, 0],
        [1.0, 0],
        [1.0, 0.05],
        [0.25, 0.5],
        [0.05, 0.62],
        [0, 0.5],
      ],
      { at: [s * 0.49, 0.55, -1.4], x: [0, 0, 1], y: lean, thickness: 0.03, bevel: 0.006, color: FINPAINT, name: "fin" },
    );
    const out = fin.axis.dot(new THREE.Vector3(s, 0, 0)) > 0 ? 1 : -1;
    const fdir = fin.axis.clone().multiplyScalar(out).toArray() as V;
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
      at: fin.local([0.52, 0.14, out * 0.0175]),
      dir: fdir,
      axis: "z",
      texture: EMBLEM,
    });
    // fin trim tube & nav light
    b.rod(fin.local([0.02, 0.5, 0]), fin.local([0.06, 0.62, 0]), 0.012, { color: STEEL });
    glow(ball(0.016, s > 0 ? "#ff3a3a" : "#3aff6a", fin.local([0.04, 0.63, 0])), 2.2);
    if (s > 0) {
      // tattered pennant
      b.extrude(
        [
          [0, 0],
          [0.35, -0.04],
          [0.7, -0.02],
          [0.58, 0.04],
          [0.72, 0.11],
          [0.35, 0.1],
          [0, 0.08],
        ],
        { at: fin.local([0.03, 0.6, 0]), x: [0, 0, -1], y: [0, 1, 0], thickness: 0.004, color: CLOTHP },
      );
    }
    // fin root brace
    b.rod([s * 0.42, 0.6, -1.3], [s * 0.5, 0.56, -1.3], 0.02, { color: STEEL });
  }

  // Canards ----------------------------------------------------------------------------------------------------
  for (const s of S) {
    b.extrude(
      [
        [0, 0],
        [0.4, -0.28],
        [0.4, -0.14],
        [0.06, 0.16],
      ],
      { at: [s * 0.08, 0.48, 0.9], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.022, bevel: 0.004, color: FINPAINT },
    );
    glow(ball(0.013, "#ffb02e", [s * 0.46, 0.48, 0.64]), 2);
  }

  // Hover pads + skids ---------------------------------------------------------------------------------------
  const pad = (x: number, z: number) => {
    b.rod([x, 0.38, z], [x, 0.3, z], 0.032, { color: STEEL });
    b.lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.125, 0.03],
        [0.09, 0.07],
        [0, 0.07],
      ],
      { at: [x, 0.24, z], color: DARKMETAL, segments: 10, name: "hoverpad" },
    );
    glow(cyl(0.085, 0.01, CYAN, [x, 0.238, z], [0, 1, 0], 10), 2.2);
    band(0.12, 0.008, BRASS, [x, 0.255, z], [0, 1, 0]);
  };
  for (const s of S) {
    pad(s * 0.12, -0.8);
    pad(s * 0.1, 0.62);
    const skid = catmull([
      [s * 0.27, 0.028, -1.0],
      [s * 0.27, 0.028, 0.55],
      [s * 0.27, 0.07, 0.85],
      [s * 0.25, 0.2, 1.0],
    ]);
    b.sweep(skid, 0.028, { color: dusty(DARKMETAL, 1.2, 8), sides: 6 });
    for (const z of [-0.7, 0.5]) {
      b.rod([s * 0.2, 0.42, z], [s * 0.27, 0.035, z], 0.022, { color: STEEL });
      cyl(0.04, 0.05, RUBBER, [s * 0.27, 0.07, z], [1, 0, 0], 8);
    }
    b.rod([s * 0.27, 0.03, -1.0], [s * 0.27, 0.03, -0.98], 0.03, { color: RUBBER });
  }

  // Antenna ---------------------------------------------------------------------------------------------------
  b.sweep(
    catmull([
      [-0.2, 0.74, -0.72],
      [-0.22, 1.0, -0.78],
      [-0.28, 1.34, -0.9],
    ]),
    [0.01, 0.003],
    { color: STEEL, sides: 5 },
  );
  glow(ball(0.014, "#ff4a3a", [-0.28, 1.35, -0.9]), 2);
  cyl(0.025, 0.04, DARKMETAL, [-0.2, 0.75, -0.72], [0, 1, 0], 8);

  // Tow hook at rear and tool tags ----------------------------------------------------------------------------
  b.sweep(
    catmull([
      [0, 0.55, -1.1],
      [0, 0.5, -1.2],
      [0, 0.45, -1.24],
      [0, 0.42, -1.18],
    ]),
    0.012,
    { color: STEEL, sides: 5 },
  );

  return b.root;
}
