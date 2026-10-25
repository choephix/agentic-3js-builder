import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, noise, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "NovaCorp RSU-07 Riot Interceptor",
  description:
    "Cyberpunk corporate riot-control interceptor truck with a roof-mounted water cannon, tank livery, riot cage and neon light bars.",
};

// Palette
const DARK = "#161922";
const BLACK = "#0b0c10";
const GRAPH = "#262b3a";
const YELLOW = "#ffd400";
const CYAN = "#19f0ff";
const MAG = "#ff2fa0";
const RED = "#ff2b4a";
const WARM = "#fff1c0";
const TIRE = "#0e0f13";

const HULL = paint((p, n) => {
  const low = smoothstep(1.0, 0.9, p.y);
  const top = mix("#e8ebf2", "#9aa3b8", smoothstep(0.5, -0.9, n.y) * 0.6);
  let c = mix(top, "#1a1d28", low);
  if (Math.abs((((p.z / 0.85) % 1) + 1) % 1 - 0.5) > 0.486) c = mix(c, "#0a0b10", 0.7);
  c = mix(c, "#15171d", smoothstep(1.3, 0.5, p.y) * noise(p, 0.25, 4) * 0.7);
  return c;
});
const TANK = panelled(HULL, { size: 0.5, aspect: 0.6, rivets: 0.1 });
const STEEL = metal("steel", { tarnish: 0.4 });
const IRON = metal("iron");

// Textures
const LOGO = svg(
  `<svg viewBox="0 0 180 80"><rect x="1" y="1" width="178" height="78" rx="4" fill="#0d1020" stroke="#ffd400" stroke-width="2"/>
  <polygon points="68,40 54,64 26,64 12,40 26,16 54,16" fill="#0a0d18" stroke="#19f0ff" stroke-width="3"/>
  <path d="M28 52 V28 L52 52 V28" stroke="#ff2fa0" stroke-width="6" fill="none" stroke-linejoin="round"/>
  <text x="76" y="38" font-family="sans-serif" font-weight="bold" font-size="22" fill="#ffffff">NOVACORP</text>
  <text x="77" y="53" font-family="sans-serif" font-weight="bold" font-size="9" fill="#19f0ff">RIOT SUPPRESSION UNIT</text>
  <rect x="8" y="66" width="164" height="7" fill="#ffd400"/>
  <path d="M14 66 l8 7 M34 66 l8 7 M54 66 l8 7 M74 66 l8 7 M94 66 l8 7 M114 66 l8 7 M134 66 l8 7 M154 66 l8 7" stroke="#0b0c10" stroke-width="3"/></svg>`,
  { size: 512 },
);
const HAZARD = svg(
  `<svg viewBox="0 0 64 12"><rect width="64" height="12" fill="#ffd400"/>
  <path d="M-4 12 L8 0 M8 12 L20 0 M20 12 L32 0 M32 12 L44 0 M44 12 L56 0 M56 12 L68 0" stroke="#0b0c10" stroke-width="6"/></svg>`,
  { size: 256 },
);
const GLASS = svg(
  `<svg viewBox="0 0 100 50"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e3a52"/><stop offset="1" stop-color="#05080f"/></linearGradient></defs>
  <rect width="100" height="50" fill="url(#g)"/>
  <path d="M10 50 L40 0 L52 0 L22 50Z M60 50 L84 0 L90 0 L66 50Z" fill="#ffffff" opacity="0.14"/>
  <path d="M6 44 H30 M6 40 H20" stroke="#19f0ff" stroke-width="1.2"/><circle cx="88" cy="42" r="3" fill="none" stroke="#ff2fa0" stroke-width="1"/></svg>`,
  { size: 256 },
);
const DOOR = svg(
  `<svg viewBox="0 0 100 50"><rect width="100" height="50" fill="#0f1119" stroke="#2c3245" stroke-width="2"/>
  <path d="M6 44 l12 -38 M20 44 l12 -38 M34 44 l12 -38" stroke="#ffd400" stroke-width="5"/>
  <text x="56" y="30" font-family="monospace" font-weight="bold" font-size="17" fill="#19f0ff">RSU-07</text>
  <rect x="56" y="36" width="38" height="3" fill="#ff2fa0"/></svg>`,
  { size: 256 },
);
const WARN = svg(
  `<svg viewBox="0 0 80 40"><rect width="80" height="40" fill="#0d1020" stroke="#ffd400" stroke-width="2"/>
  <polygon points="40,6 54,32 26,32" fill="#ffd400"/><rect x="38" y="14" width="4" height="10" fill="#0b0c10"/><rect x="38" y="26" width="4" height="3" fill="#0b0c10"/>
  <text x="40" y="39" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="5" fill="#19f0ff">HIGH PRESSURE</text></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "riot-interceptor" });

  const bx = (w: number, h: number, d: number, c: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], ...o });
  const neon = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, s = 1.8) =>
    glow(bx(w, h, d, c, x, y, z), s);
  const cyl = (r0: number, r1: number, len: number, seg: number, c: any, at: number[], rotation: number[]) =>
    b.part(new THREE.CylinderGeometry(r0, r1, len, seg), c, { at, rotation });
  const decal = (w: number, h: number, tex: any, at: number[], dir: number[], color = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), color, { at, dir, axis: "z", texture: tex });

  // ---------- chassis & hull ----------
  bx(2.2, 0.7, 5.2, HULL, 0, 0.85, 0);
  b.frustumBox([0, 0.85, 2.6], [0, 0.85, 2.9], [2.2, 0.7], [2.0, 0.55], { color: HULL });
  bx(1.9, 0.12, 4.8, BLACK, 0, 0.5, 0); // undertray
  // hood vents & neon
  for (const s of [1, -1]) {
    neon(0.05, 0.015, 1.0, MAG, s * 0.55, 1.215, 2.05, 1.6);
    for (let i = 0; i < 4; i++) bx(0.3, 0.02, 0.05, BLACK, s * 0.25, 1.21, 1.8 + i * 0.12);
  }
  // cab
  b.extrude(
    [[-1.0, 0], [1.0, 0], [0.6, 0.75], [-1.0, 0.75]],
    { at: [0, 1.2, 0.5], x: [0, 0, 1], thickness: 2.0, bevel: 0.03, color: HULL },
  );
  decal(1.9, 0.85, GLASS, [0, 1.585, 1.318], [0, 0.4, 0.75]);
  for (const s of [1, -1]) {
    decal(1.2, 0.42, GLASS, [s * 1.012, 1.58, 0.3], [s, 0, 0]);
    decal(1.0, 0.5, DOOR, [s * 1.106, 0.95, 1.2], [s, 0, 0]);
    // seams and handles
    bx(0.03, 0.03, 0.22, STEEL, s * 1.1, 1.1, 0.7);
    // mirrors
    b.rod([s * 1.0, 1.5, 1.2], [s * 1.28, 1.55, 1.3], 0.02, { color: GRAPH });
    bx(0.06, 0.3, 0.2, DARK, s * 1.3, 1.52, 1.3);
    neon(0.01, 0.2, 0.12, CYAN, s * 1.335, 1.52, 1.3, 1.4);
    // cab roof speakers
    b.part(new THREE.ConeGeometry(0.12, 0.28, 8, 1, true), GRAPH, { at: [s * 0.9, 2.1, 1.0], rotation: [90, 0, 0] });
    // skirts with neon
    bx(0.1, 0.26, 1.9, DARK, s * 1.15, 0.66, 0);
    neon(0.02, 0.04, 1.9, MAG, s * 1.205, 0.66, 0, 2);
    neon(0.02, 0.04, 4.7, CYAN, s * 1.103, 1.12, 0, 1.8);
    // fender flares
    for (const z of [1.6, -1.6]) {
      bx(0.5, 0.1, 1.3, GRAPH, s * 1.25, 1.06, z);
      bx(0.5, 0.2, 0.08, GRAPH, s * 1.25, 0.95, z + 0.65);
      bx(0.5, 0.2, 0.08, GRAPH, s * 1.25, 0.95, z - 0.65);
    }
  }
  // roof plate and cage over windshield
  bx(1.9, 0.05, 1.3, TANK, 0, 1.97, 0.0);
  for (let i = -3; i <= 3; i++)
    b.rod([i * 0.28, 1.22, 1.55], [i * 0.28, 2.0, 1.12], 0.018, { color: BLACK });
  b.rod([-1.0, 1.55, 1.38], [1.0, 1.55, 1.38], 0.02, { color: BLACK });
  b.rod([-0.95, 1.85, 1.2], [0.95, 1.85, 1.2], 0.02, { color: BLACK });

  // roof light bar
  bx(1.8, 0.08, 0.32, BLACK, 0, 2.04, 0.45);
  for (let i = 0; i < 6; i++) neon(0.28, 0.1, 0.28, i % 2 ? MAG : CYAN, -0.7 + i * 0.28, 2.1, 0.45, 2.4);
  bx(0.1, 0.14, 0.34, BLACK, 0.92, 2.08, 0.45);
  bx(0.1, 0.14, 0.34, BLACK, -0.92, 2.08, 0.45);
  // sensor dome
  b.lathe([[0, 0], [0.18, 0], [0.18, 0.05], [0.12, 0.14], [0, 0.18]], { at: [0, 2.0, -0.2], color: DARK });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { at: [0, 2.1, -0.06] }), 2.2);
  // antennas
  for (const s of [1, -1]) {
    b.rod([s * 0.8, 2.0, -0.35], [s * 0.8, 2.85, -0.35], 0.012, { color: BLACK });
    glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), s > 0 ? MAG : CYAN, { at: [s * 0.8, 2.87, -0.35] }), 2.5);
  }

  // ---------- water tank ----------
  bx(1.7, 1.0, 2.0, TANK, 0, 1.7, -1.5);
  bx(1.78, 0.08, 2.08, GRAPH, 0, 1.2, -1.5);
  bx(1.78, 0.08, 2.08, GRAPH, 0, 2.2, -1.5);
  for (let i = 0; i < 3; i++) bx(1.74, 0.05, 0.1, GRAPH, 0, 2.25, -2.2 + i * 0.7);
  for (const s of [1, -1]) {
    decal(1.8, 0.8, LOGO, [s * 0.852, 1.7, -1.5], [s, 0, 0]);
    neon(0.02, 0.03, 2.0, CYAN, s * 0.86, 2.08, -1.5, 1.8);
    neon(0.02, 0.03, 2.0, MAG, s * 0.86, 1.32, -1.5, 1.8);
    cyl(0.07, 0.07, 0.3, 8, STEEL, [s * 0.9, 1.5, -2.35], [0, 0, 90]); // intake couplings
  }
  decal(1.4, 0.7, WARN, [0, 1.7, -2.505], [0, 0, -1]);
  b.lathe([[0, 0], [0.2, 0], [0.2, 0.06], [0.14, 0.1], [0, 0.1]], { at: [0, 2.29, -2.1], color: STEEL });
  // gauges
  for (const s of [1, -1]) {
    cyl(0.1, 0.1, 0.05, 10, STEEL, [s * 0.88, 1.9, -0.7], [0, 0, 90]);
    glow(b.part(new THREE.CircleGeometry(0.075, 12), CYAN, { at: [s * 0.91, 1.9, -0.7], dir: [s, 0, 0], axis: "z" }), 1.4);
  }

  // ---------- water cannon ----------
  b.lathe(
    [[0, 0], [0.4, 0], [0.4, 0.12], [0.28, 0.3], [0.28, 0.4], [0, 0.4]],
    { at: [0, 2.29, -1.1], color: GRAPH, segments: 10 },
  );
  bx(0.55, 0.42, 0.8, HULL, 0, 2.8, -1.1);
  bx(0.6, 0.08, 0.5, YELLOW, 0, 3.03, -1.0);
  for (const s of [1, -1]) {
    bx(0.08, 0.5, 0.6, DARK, s * 0.32, 2.75, -1.1);
    neon(0.02, 0.04, 0.4, CYAN, s * 0.37, 2.75, -1.1, 2);
  }
  b.rod([0, 2.82, -0.7], [0, 2.82, 1.25], 0.11, { color: IRON, sides: 8 });
  for (const z of [-0.4, 0.2, 0.8]) {
    b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8), YELLOW, { at: [0, 2.82, z], rotation: [90, 0, 0] });
  }
  cyl(0.19, 0.11, 0.32, 8, STEEL, [0, 2.82, 1.4], [90, 0, 0]);
  glow(b.part(new THREE.TorusGeometry(0.17, 0.02, 4, 10), CYAN, { at: [0, 2.82, 1.57] }), 2.4);
  // feed hose
  b.sweep(
    b.surface ? ([[0.5, 2.28, -2.0], [0.9, 2.5, -1.7], [0.4, 2.75, -1.4], [0.2, 2.85, -1.2]] as number[][]) : [],
    0.045,
    { color: BLACK, sides: 6 },
  );
  // targeting camera
  bx(0.14, 0.14, 0.2, DARK, 0.2, 3.0, -0.6);
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { at: [0.2, 3.0, -0.5] }), 2.2);

  // ---------- front end ----------
  bx(2.4, 0.42, 0.22, DARK, 0, 0.72, 3.0);
  decal(2.2, 0.2, HAZARD, [0, 0.72, 3.112], [0, 0, 1]);
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 0.5, 2.95], [s * 0.9, 1.3, 2.75], 0.04, { color: BLACK });
    neon(0.5, 0.12, 0.05, WARM, s * 0.75, 1.0, 2.91, 2.2);
    neon(0.12, 0.12, 0.05, MAG, s * 1.05, 1.0, 2.9, 2.2);
  }
  neon(0.8, 0.05, 0.05, CYAN, 0, 1.0, 2.91, 2.4);
  for (let i = -4; i <= 4; i++) bx(0.04, 0.2, 0.04, BLACK, i * 0.09, 0.82, 2.93);
  // push plow wedge
  b.extrude([[-1.2, 0], [1.2, 0], [1.0, 0.35], [-1.0, 0.35]], { at: [0, 0.52, 3.12], x: [1, 0, 0], y: [0, 0, 0.0001 + 0.0], thickness: 0.05, color: GRAPH });

  // ---------- rear ----------
  bx(2.3, 0.3, 0.2, DARK, 0, 0.72, -2.7);
  neon(0.4, 0.15, 0.04, RED, 0.9, 1.0, -2.61, 2);
  neon(0.4, 0.15, 0.04, RED, -0.9, 1.0, -2.61, 2);
  neon(1.1, 0.04, 0.04, RED, 0, 1.0, -2.61, 2);
  for (const s of [1, -1]) cyl(0.07, 0.07, 0.4, 8, IRON, [s * 0.6, 0.62, -2.82], [90, 0, 0]);
  // underglow
  neon(1.9, 0.03, 4.4, MAG, 0, 0.44, 0, 1.6);

  // ---------- wheels ----------
  for (const s of [1, -1])
    for (const z of [1.6, -1.6]) {
      const x = s * 1.25;
      cyl(0.5, 0.5, 0.42, 14, TIRE, [x, 0.5, z], [0, 0, 90]);
      cyl(0.3, 0.3, 0.46, 10, STEEL, [x, 0.5, z], [0, 0, 90]);
      cyl(0.12, 0.12, 0.5, 8, GRAPH, [x, 0.5, z], [0, 0, 90]);
      glow(b.part(new THREE.TorusGeometry(0.34, 0.02, 4, 12), CYAN, { at: [x + s * 0.215, 0.5, z], rotation: [0, 90, 0] }), 2.2);
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        bx(0.04, 0.05, 0.05, BLACK, x + s * 0.24, 0.5 + Math.sin(a) * 0.2, z + Math.cos(a) * 0.2);
      }
    }

  return b.root;
}
