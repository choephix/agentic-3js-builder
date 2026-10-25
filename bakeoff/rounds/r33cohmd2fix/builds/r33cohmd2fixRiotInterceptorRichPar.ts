import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, mix, noise, smoothstep, rng, catmull, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled, gaugeTexture, coil } from "../../../../kits/clockwork";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Arasaka-Style Riot Interceptor RC-9 'Pacifier'",
  "description": "A hulking cyberpunk corporate riot-control armored interceptor with a roof-mounted water cannon, neon light bars, riot shields and glowing corp emblems."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#2b303b",
  hullDark: "#14171d",
  hullLight: "#4a5262",
  trim: "#f2c200",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2bd6",
  neonRed: "#ff2a3a",
  glass: "#1a0b2e",
  tire: "#0d0d10",
  rim: "#7b8494",
  tank: "#3b5f78",
  white: "#e8ecf2",
  brass: "#b88a3c",
  rubber: "#1b1b1f",
};
const M = {
  chassisTop: [0, 1.55, 0] as [number, number, number],
  cabFloor: [0, 1.55, 0.3] as [number, number, number],
  turretRing: [0, 2.15, -1.3] as [number, number, number],
  tankDeck: [0, 1.55, -1.5] as [number, number, number],
  frontAxle: [0, 0.5, 2] as [number, number, number],
  midAxle: [0, 0.5, 0] as [number, number, number],
  rearAxle: [0, 0.5, -2] as [number, number, number],
  bumperFront: [0, 0.7, 3] as [number, number, number],
  roofBar: [0, 2.45, 0.6] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
type Ctx = { b: any; J: any; P: any; M: any };

function buildChassis({ b, J, P }: Ctx) {
  const bone = J.body;
  const HULL = panelled(
    paint((p, n) => {
      const base = mix(P.hull, P.hullLight, smoothstep(0.3, 1, n.y) * 0.6 + noise(p, 0.3, 4) * 0.15);
      const wheelD = Math.min(Math.abs(p.z - 2), Math.abs(p.z), Math.abs(p.z + 2));
      const grime = Math.max(smoothstep(0.9, 0.45, p.y), smoothstep(0.7, 0.0, wheelD) * smoothstep(1.2, 0.6, p.y) * 0.6);
      return mix(base, "#0c0d10", grime * (0.5 + noise(p, 0.12, 9) * 0.5));
    }),
    { size: 0.5, aspect: 0.6, rivets: 0.1 },
  );
  const HAZ = paint((p) => (Math.floor((p.x + p.y) / 0.12) % 2 ? P.trim : P.hullDark));
  const place = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { bone, at, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // main lofted hull
  b.loft(
    [
      { at: [0, 0.95, -2.9], w: 2.4, h: 1.0 },
      { at: [0, 1.0, -1.5], w: 2.55, h: 1.1 },
      { at: [0, 1.0, 0.5], w: 2.6, h: 1.1 },
      { at: [0, 0.98, 2.0], w: 2.5, h: 1.0 },
      { at: [0, 0.88, 2.85], w: 2.2, h: 0.7 },
    ],
    { bone, color: HULL, section: "box" },
  );
  // sloped nose wedge
  b.extrude(
    [[0, 0.55], [0.35, 0.55], [0.35, 1.3], [-0.05, 1.45], [-0.45, 1.5], [-0.45, 0.55]].map(([z, y]) => [z, y] as [number, number]),
    { at: [0, 0, 2.45], x: [0, 0, 1], thickness: 2.3, bone, color: HULL },
  ).mesh.position.x += 0;
  // underbody plate
  place(box(2.2, 0.08, 5.6), P.hullDark, [0, 0.43, 0]);
  // side skirts
  for (const s of [1, -1]) {
    place(box(0.12, 0.3, 5.4), P.hullDark, [s * 1.3, 0.62, 0]);
    place(box(0.04, 0.05, 5.2), P.trim, [s * 1.37, 0.78, 0]);
    // wheel arches
    for (const z of [2, 0, -2]) {
      place(new THREE.TorusGeometry(0.62, 0.07, 6, 14, Math.PI), P.hullDark, [s * 1.31, 0.5, z], { dir: [s, 0, 0], axis: "z", rotation: [0, 0, 0] });
      place(box(0.06, 0.55, 1.3), P.hullDark, [s * 1.31, 0.78, z]);
      place(box(0.07, 0.26, 1.3), "#0b0b0e", [s * 1.31, 1.0, z]);
    }
    // door seams
    for (const z of [1.1, -0.2]) place(box(0.03, 0.6, 0.03), P.hullDark, [s * 1.31, 1.1, z]);
    place(box(0.03, 0.03, 1.3), P.hullDark, [s * 1.31, 1.4, 0.45]);
    place(box(0.03, 0.03, 1.3), P.hullDark, [s * 1.31, 0.8, 0.45]);
    place(box(0.05, 0.05, 0.22), P.rim, [s * 1.32, 1.2, 0.9]);
    // emblem decals
    const logo = svg(
      `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#14171d" stroke="#ff2a3a" stroke-width="6"/><path d="M50 14 L82 80 L66 80 L50 44 L34 80 L18 80Z" fill="#ff2a3a"/><rect x="30" y="66" width="40" height="7" fill="#e8ecf2"/></svg>`,
      { size: 128 },
    );
    b.part(new THREE.PlaneGeometry(0.55, 0.55), "#ffffff", { bone, at: [s * 1.325, 1.1, -1.1], dir: [s, 0, 0], axis: "z", texture: logo });
    const txt = svg(
      `<svg viewBox="0 0 200 50"><rect width="200" height="50" rx="6" fill="#14171d"/><text x="100" y="35" text-anchor="middle" font-family="Arial Black,sans-serif" font-weight="bold" font-size="28" fill="#e8ecf2">CORP SEC</text><rect x="4" y="44" width="192" height="3" fill="#f2c200"/></svg>`,
      { size: 256 },
    );
    b.part(new THREE.PlaneGeometry(1.2, 0.3), "#ffffff", { bone, at: [s * 1.325, 1.1, 1.65], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: txt, mirror: s });
    // headlight clusters
    glow(place(box(0.45, 0.16, 0.08), P.white, [s * 0.85, 1.0, 2.99]), 1.6);
    place(box(0.52, 0.22, 0.05), P.hullDark, [s * 0.85, 1.0, 2.96]);
    glow(place(box(0.3, 0.05, 0.08), P.neonRed, [s * 0.85, 0.84, 3.0]), 1.4);
    // tow hooks
    place(new THREE.TorusGeometry(0.07, 0.02, 5, 8), P.brass, [s * 0.5, 0.5, 3.0]);
    // rear lights
    glow(place(box(0.5, 0.1, 0.06), P.neonRed, [s * 0.8, 1.2, -3.0]), 1.4);
  }
  // bull-bar ram plate
  place(box(2.3, 0.55, 0.18), HAZ, [0, 0.72, 3.0]);
  for (const x of [-0.9, -0.3, 0.3, 0.9]) place(box(0.12, 0.7, 0.14), P.hullDark, [x, 0.9, 3.05]);
  place(box(2.4, 0.08, 0.2), P.hullLight, [0, 1.05, 3.03]);
  // LED bumper strip & grille bar
  glow(place(box(2.0, 0.05, 0.05), P.neonRed, [0, 0.5, 3.1]), 1.5);
  glow(place(box(1.5, 0.07, 0.05), P.neonCyan, [0, 1.2, 2.93]), 1.8);
  place(box(1.6, 0.25, 0.04), "#0b0b0e", [0, 1.2, 2.9]);
  // top deck plate and rivet studs
  place(box(2.3, 0.06, 5.2), P.hullDark, [0, 1.54, 0]);
  const r = rng(5);
  for (let i = 0; i < 20; i++)
    place(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), P.rim, [(r() - 0.5) * 2.1, 1.58, -2.8 + r() * 5.6]);
  // rear plate
  place(box(2.3, 0.7, 0.1), P.hullDark, [0, 0.95, -3.0]);
  place(box(1.0, 0.1, 0.04), HAZ, [0, 0.7, -3.06]);
}
    return buildChassis;
  })(),
  // cab
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildCab({ b, J, P }: Ctx) {
  const body = J.body;
  const R = rng(11);

  // ---- textures ----
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="#ff2a3a" stroke-width="7"/>
    <path d="M50 14 L82 80 L66 80 L50 44 L34 80 L18 80Z" fill="#ff2a3a"/>
    <rect x="30" y="86" width="40" height="5" fill="#e8ecf2"/></svg>`,
    { size: 128 },
  );
  const CHEVRON = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#14171d"/>
    <path d="M0 14 L32 34 L64 14 L64 28 L32 48 L0 28Z M0 40 L32 60 L64 40 L64 54 L32 74 L0 54Z" fill="#f2c200"/></svg>`,
    { size: 128 },
  );
  const VISOR = svg(
    `<svg viewBox="0 0 128 24"><rect width="128" height="24" fill="#2a0b3e"/>
    <rect y="0" width="128" height="24" fill="#ff2bd6" opacity="0.55"/>
    <path d="M0 8 H128 M0 16 H128" stroke="#ffd0f4" stroke-width="1.2" opacity="0.5"/>
    <path d="M10 24 L40 0 H52 L22 24Z M70 24 L100 0 H112 L82 24Z" fill="#ffffff" opacity="0.25"/></svg>`,
    { size: 256 },
  );
  const SLIT = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#8a2be2"/><rect y="6" width="64" height="2" fill="#ffffff" opacity="0.4"/></svg>`, { size: 64 });

  const armor = panelled(
    paint((p, n) => mix(P.hull, P.hullLight, 0.5 * smoothstep(0.4, 0.9, noise(p, 0.15, 3)) + 0.3 * Math.max(0, n.y))),
    { size: 0.3, rivets: 0.05 },
  );
  const roofPaint = panelled(P.hullDark, { size: 0.24, rivets: 0.04 });

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, c: any, at: number[], opt: any = {}) =>
    b.part(g, c, { bone: body, at, ...opt });

  // ---- main cab body: a lofted wedge ----
  b.loft(
    [
      { at: [0, 2.0, -0.55], w: 2.35, h: 0.9 },
      { at: [0, 2.05, 0.6], w: 2.3, h: 0.95 },
      { at: [0, 1.98, 1.6], w: 2.1, h: 0.75 },
      { at: [0, 1.85, 1.95], w: 1.9, h: 0.5 },
    ],
    { bone: body, color: armor, section: "box" },
  );

  // sloped windshield-area hood slab (faceted)
  put(box(2.0, 0.08, 0.7), P.hullDark, [0, 2.25, 1.6], { rotation: [-24, 0, 0] });

  // visor slit windshield
  put(new THREE.PlaneGeometry(1.7, 0.26), "#ffffff", [0, 2.28, 1.93], {
    dir: [0, 0.35, 1], axis: "z", texture: VISOR,
  });
  glow(
    put(new THREE.PlaneGeometry(1.7, 0.26), "#ffffff", [0, 2.285, 1.935], { dir: [0, 0.35, 1], axis: "z", texture: VISOR }),
    0.9,
  );
  // visor frame
  for (const s of [1, -1]) put(box(0.07, 0.34, 0.07), P.hullDark, [s * 0.9, 2.28, 1.92], { rotation: [-20, 0, 0] });
  put(box(1.9, 0.06, 0.08), P.hullDark, [0, 2.44, 1.9], { rotation: [-20, 0, 0] });
  put(box(1.9, 0.06, 0.08), P.hullDark, [0, 2.12, 1.97], { rotation: [-20, 0, 0] });

  // roof armor plating
  put(box(2.1, 0.1, 1.9), roofPaint, [0, 2.5, 0.55]);
  put(box(1.8, 0.06, 1.5), P.hull, [0, 2.57, 0.5], { rotation: [0, 0, 0] });
  for (const s of [1, -1]) put(box(0.1, 0.12, 1.9), P.trim, [s * 1.0, 2.52, 0.55]);
  // roof edge chamfer slabs
  for (const s of [1, -1]) put(box(0.12, 0.1, 1.8), P.hullLight, [s * 1.12, 2.4, 0.55], { rotation: [0, 0, s * 35] });

  // emblem on hood
  put(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", [0, 2.42, 1.75], { dir: [0, 1, 0.42], axis: "z", texture: EMBLEM });
  // emblem on roof
  put(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", [0, 2.581, 0.55], { dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: EMBLEM });

  // ---- side riot shields ----
  for (const s of [1, -1]) {
    put(box(0.1, 0.8, 1.9), P.hullLight, [s * 1.2, 2.0, 0.6]);
    put(new THREE.PlaneGeometry(1.5, 0.45), "#ffffff", [s * 1.255, 1.8, 0.55], {
      dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: CHEVRON,
    });
    // side slit windows
    glow(
      put(new THREE.PlaneGeometry(0.9, 0.12), "#ffffff", [s * 1.255, 2.25, 0.9], { dir: [s, 0, 0], axis: "z", texture: SLIT }),
      0.8,
    );
    // shield bevel ribs
    for (const z of [-0.2, 0.55, 1.3]) put(box(0.05, 0.84, 0.06), P.hullDark, [s * 1.26, 2.0, z]);
    // door seam + handle
    put(box(0.03, 0.7, 0.03), P.hullDark, [s * 1.255, 2.0, 1.25]);
    put(box(0.06, 0.05, 0.2), P.rim, [s * 1.28, 1.95, 0.95]);
    // bolts
    for (const z of [-0.35, 0.1, 0.9, 1.5]) for (const y of [1.65, 2.35])
      put(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), P.brass, [s * 1.27, y, z], { dir: [s, 0, 0] });
    // mirror stalks
    put(box(0.3, 0.04, 0.04), P.hullDark, [s * 1.35, 2.15, 1.55]);
    put(box(0.05, 0.2, 0.14), P.hullDark, [s * 1.5, 2.15, 1.55]);
    glow(put(box(0.02, 0.18, 0.02), P.neonCyan, [s * 1.53, 2.15, 1.63]), 1.5);
    // camera pods
    put(new THREE.SphereGeometry(0.07, 8, 6), P.hullDark, [s * 1.05, 2.0, 1.97]);
    glow(put(new THREE.SphereGeometry(0.03, 6, 4), P.neonRed, [s * 1.05, 2.0, 2.03]), 2);
    // light bar housing glow
  }

  // ---- roof light bars alternating ----
  const bars = [P.neonCyan, P.neonMagenta];
  for (let i = 0; i < 2; i++) {
    const z = 0.9 - i * 0.7;
    put(box(1.8, 0.1, 0.16), P.hullDark, [0, 2.66, z]);
    for (let k = 0; k < 6; k++) {
      const c = bars[(k + i) % 2];
      glow(put(box(0.27, 0.07, 0.12), c, [-0.75 + k * 0.3, 2.7, z]), 2);
    }
    for (const s of [1, -1]) put(box(0.08, 0.14, 0.2), P.trim, [s * 0.93, 2.65, z]);
  }

  // sensor dome + antennas
  put(new THREE.CylinderGeometry(0.2, 0.25, 0.08, 10), P.hullDark, [0, 2.6, -0.3]);
  put(new THREE.SphereGeometry(0.17, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), P.hullLight, [0, 2.64, -0.3]);
  glow(put(new THREE.SphereGeometry(0.05, 6, 4), P.neonRed, [0, 2.75, -0.2]), 2);
  for (const s of [1, -1]) {
    b.rod([s * 0.95, 2.55, -0.4], [s * 0.95 + s * 0.05, 3.0, -0.45], 0.012, P.rim, { bone: body });
    glow(put(new THREE.SphereGeometry(0.025, 5, 4), s > 0 ? P.neonMagenta : P.neonCyan, [s * 1.0, 3.0, -0.45]), 2);
  }

  // rear wall armor meeting tank
  put(box(2.3, 0.9, 0.08), P.hullDark, [0, 2.0, -0.58]);
  for (let i = 0; i < 4; i++) put(box(2.2, 0.025, 0.04), P.trim, [0, 1.7 + i * 0.2, -0.63]);

  // nose lip / brow
  put(box(2.1, 0.1, 0.2), P.hullDark, [0, 2.5, 1.9]);
  glow(put(box(1.5, 0.025, 0.03), P.neonCyan, [0, 2.46, 2.0]), 1.8);
}
    return buildCab;
  })(),
  // tankDeck
  (() => {
function buildTankDeck({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const DECK_Y = 1.55;
  const part = (g: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(g, color, { bone, at, ...o });
  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    part(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cylX = (r: number, len: number, color: any, at: number[], seg = 12) =>
    part(new THREE.CylinderGeometry(r, r, len, seg), color, at, { dir: [1, 0, 0] });
  const cylZ = (r: number, len: number, color: any, at: number[], seg = 12) =>
    part(new THREE.CylinderGeometry(r, r, len, seg), color, at, { dir: [0, 0, 1] });

  const HULL = panelled(P.hull, { size: 0.3, rivets: 0.06 });
  const STEEL = metal("steel", { tarnish: 0.3 });
  const IRON = metal("iron");
  const BRASS = metal("brass", { tarnish: 0.3 });

  // ---- deck plate
  box(2.46, 0.08, 2.35, HULL, [0, DECK_Y + 0.04, -1.8]);
  // side rails
  for (const s of [1, -1]) {
    box(0.06, 0.1, 2.35, P.trim, [s * 1.2, DECK_Y + 0.12, -1.8]);
    for (let i = 0; i < 6; i++) box(0.05, 0.05, 0.12, P.hullDark, [s * 1.2, DECK_Y + 0.2, -0.85 - i * 0.4]);
  }

  // ---- tank (lathe along local Y, laid onto Z)
  const hazard = paint((p, n, s) => {
    const z = p.z;
    const band = Math.abs(((z + 3) / 0.5) % 1 - 0.5) < 0.0 ? 0 : 0;
    const stripe = (((p.x * 0.8 + z) / 0.14) % 2 + 2) % 2 < 1;
    const inBand = (z > -2.15 && z < -1.95) || (z > -1.35 && z < -1.15);
    const base = mix(P.tank, "#27414f", smoothstep(0.2, 1, -n.y) * 0.8);
    const grime = noise(p, 0.15, 3);
    const c = inBand ? (stripe ? P.trim : P.hullDark) : base;
    return mix(c, "#1c2630", grime > 0.62 ? 0.35 : 0);
  });
  const tankProfile: [number, number][] = [
    [0, -0.95], [0.3, -0.98], [0.48, -0.88], [0.5, -0.75], [0.5, 0.75], [0.48, 0.88], [0.3, 0.98], [0, 0.95],
  ];
  b.lathe(tankProfile, {
    at: [0, DECK_Y + 0.62, -1.7], axis: [0, 0, 1], segments: 14, color: hazard, bone, smoothing: 0,
  });
  // tank straps
  for (const z of [-2.3, -1.7, -1.1]) {
    b.lathe([[0.5, -0.03], [0.53, -0.03], [0.53, 0.03], [0.5, 0.03]], {
      at: [0, DECK_Y + 0.62, z], axis: [0, 0, 1], segments: 14, color: IRON, bone,
    });
  }
  // cradle blocks
  for (const z of [-2.3, -1.1]) box(1.0, 0.14, 0.14, P.hullDark, [0, DECK_Y + 0.14, z]);
  // gauge on tank rear cap
  const gauge = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#e8ecf2" stroke="#14171d" stroke-width="5"/>
    <path d="M18 68 A38 38 0 0 1 82 68" stroke="#14171d" stroke-width="4" fill="none"/>
    <path d="M66 30 A38 38 0 0 1 82 68" stroke="#ff2a3a" stroke-width="7" fill="none"/>
    <path d="M50 54 L34 36" stroke="#14171d" stroke-width="5" stroke-linecap="round"/>
    <circle cx="50" cy="54" r="5" fill="#14171d"/><text x="50" y="86" font-size="14" text-anchor="middle" fill="#14171d" font-family="monospace">H2O</text></svg>`,
    { size: 128 },
  );
  part(new THREE.CircleGeometry(0.15, 16), "#ffffff", [0, DECK_Y + 0.82, -2.675], { dir: [0, 0, -1], axis: "z", texture: gauge });
  cylZ(0.17, 0.05, P.brass, [0, DECK_Y + 0.82, -2.66], 12);
  // water level glow strip
  glow(box(0.06, 0.5, 0.02, P.neonCyan, [0.38, DECK_Y + 0.7, -0.74], { rotation: [0, 0, 0] }), 1.2);
  box(0.12, 0.56, 0.03, P.hullDark, [0.38, DECK_Y + 0.7, -0.76]);
  // fill hatch on top
  cylX(0.01, 0.01, P.hull, [0, 0, 0], 3);
  part(new THREE.CylinderGeometry(0.16, 0.18, 0.08, 8), STEEL, [0, DECK_Y + 1.14, -1.7]);
  part(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 6), P.trim, [0, DECK_Y + 1.2, -1.7]);

  // ---- turret ring base at turretRing (0, 2.15, -1.3) -> sits on tank top region; plate
  const tr = M.turretRing;
  part(new THREE.CylinderGeometry(0.46, 0.5, 0.07, 16), HULL, [tr[0], tr[1] - 0.06 + 0.0, tr[2]], { });
  part(new THREE.TorusGeometry(0.44, 0.03, 5, 20), P.trim, [tr[0], tr[1] - 0.015, tr[2]], { rotation: [90, 0, 0] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    part(new THREE.SphereGeometry(0.02, 5, 4), P.rim, [tr[0] + Math.cos(a) * 0.38, tr[1] - 0.01, tr[2] + Math.sin(a) * 0.38]);
  }
  for (const s of [1, -1])
    glow(part(new THREE.SphereGeometry(0.035, 6, 4), P.neonRed, [tr[0] + s * 0.47, tr[1] - 0.03, tr[2]]), 1.8);
  // saddle below ring
  box(0.9, 0.5, 0.9, P.hullDark, [0, tr[1] - 0.35, tr[2]]);

  // ---- pump housing + pipes (right side front of deck)
  box(0.55, 0.42, 0.45, HULL, [-0.85, DECK_Y + 0.29, -0.95]);
  box(0.57, 0.05, 0.47, P.trim, [-0.85, DECK_Y + 0.52, -0.95]);
  cylX(0.09, 0.3, BRASS, [-0.85, DECK_Y + 0.3, -0.7], 8);
  for (const y of [0.25, 0.4]) cylX(0.035, 0.7, IRON, [-0.55, DECK_Y + y + 0.05, -1.35], 6);
  b.sweep(catmull([[-0.85, DECK_Y + 0.5, -0.95], [-0.75, DECK_Y + 0.9, -1.1], [-0.4, DECK_Y + 1.05, -1.4]]), 0.035, {
    bone, color: BRASS, sides: 6,
  });
  // pump vents
  for (let i = 0; i < 4; i++) box(0.3, 0.015, 0.02, P.hullDark, [-0.85, DECK_Y + 0.2 + i * 0.07, -0.72]);
  glow(box(0.1, 0.03, 0.02, P.neonCyan, [-0.7, DECK_Y + 0.42, -0.72]), 1.2);

  // ---- hose reels both sides of tank rear
  for (const s of [1, -1]) {
    const x = s * 0.88;
    const z = -2.35;
    const y = DECK_Y + 0.5;
    cylX(0.3, 0.05, STEEL, [x - 0.14 * s, y, z], 12);
    cylX(0.3, 0.05, STEEL, [x + 0.14 * s, y, z], 12);
    cylX(0.24, 0.24, P.rubber, [x, y, z], 12);
    cylX(0.06, 0.34, P.trim, [x, y, z], 6);
    box(0.04, 0.5, 0.06, P.hullDark, [x + 0.19 * s, y - 0.12, z]);
    box(0.04, 0.5, 0.06, P.hullDark, [x - 0.19 * s, y - 0.12, z]);
    // hose coil lines
    for (let k = 0; k < 3; k++) b.sweep(catmull([[x - 0.1, y + 0.25, z], [x, y + 0.27, z + 0.02], [x + 0.1, y + 0.25, z]]), 0.01, { bone, color: P.neonRed, sides: 4 });
    // spring on reel handle
    b.sweep(coil([x, y - 0.3, z + 0.1], [x, y - 0.3, z + 0.3], 0.02, 5), 0.006, { bone, color: STEEL, sides: 4 });
    // nozzle stub
    cylZ(0.04, 0.2, BRASS, [x, y - 0.2, z + 0.2], 8);
  }

  // ---- cargo racks with riot shields (left & right sides of tank)
  const shieldTex = svg(
    `<svg viewBox="0 0 60 90"><path d="M5 5 H55 V60 Q30 90 5 60Z" fill="#cfd8e3" stroke="#14171d" stroke-width="4"/>
    <rect x="12" y="12" width="36" height="14" fill="#2ff3ff" opacity=".8"/>
    <path d="M12 38 L30 52 L48 38" stroke="#f2c200" stroke-width="6" fill="none"/>
    <text x="30" y="72" font-size="11" text-anchor="middle" fill="#14171d" font-family="monospace" font-weight="bold">CS</text></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    // rack frame
    for (const z of [-1.35, -2.15]) {
      box(0.05, 0.7, 0.05, IRON, [s * 1.2, DECK_Y + 0.55, z]);
      box(0.2, 0.04, 0.05, IRON, [s * 1.12, DECK_Y + 0.9, z]);
    }
    box(0.04, 0.04, 0.85, IRON, [s * 1.2, DECK_Y + 0.9, -1.75]);
    // shields: stack of 3 slightly offset curved plates
    for (let i = 0; i < 3; i++) {
      const sh = part(new THREE.PlaneGeometry(0.7, 0.55), "#ffffff", [s * (1.1 - i * 0.0), DECK_Y + 0.58, -1.75 + (i - 1) * 0.0], {
        dir: [s, 0, 0], axis: "z", texture: shieldTex, up: [0, 0, 1], roll: 90,
      });
      void sh;
      break;
    }
    box(0.04, 0.58, 0.72, P.hullLight, [s * 1.14, DECK_Y + 0.58, -1.75]);
    part(new THREE.PlaneGeometry(0.7, 0.56), "#ffffff", [s * 1.165, DECK_Y + 0.58, -1.75], {
      dir: [s, 0, 0], axis: "z", texture: shieldTex,
    });
    box(0.03, 0.5, 0.04, P.trim, [s * 1.17, DECK_Y + 0.58, -2.1]);
  }

  // ---- exhaust stacks
  for (const s of [1, -1]) {
    const x = s * 1.05;
    cylX(0.01, 0.01, P.hull, [0, 0, 0], 3);
    part(new THREE.CylinderGeometry(0.07, 0.08, 1.0, 8), IRON, [x, DECK_Y + 0.6, -0.72]);
    part(new THREE.CylinderGeometry(0.1, 0.08, 0.08, 8), STEEL, [x, DECK_Y + 1.12, -0.72]);
    part(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 8), "#000000", [x, DECK_Y + 1.16, -0.72]);
    for (const y of [0.3, 0.6, 0.9]) part(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 8), P.brass, [x, DECK_Y + y, -0.72]);
    box(0.06, 0.06, 0.08, IRON, [x, DECK_Y + 0.2, -0.65]);
  }

  // ---- rear ramp / step
  box(1.6, 0.05, 0.3, P.trim, [0, DECK_Y - 0.25, -3.1], { rotation: [15, 0, 0] });
  for (let i = 0; i < 6; i++) box(0.05, 0.055, 0.31, P.hullDark, [-0.65 + i * 0.26, DECK_Y - 0.25, -3.1], { rotation: [15, 0, 0] });
  box(2.4, 0.3, 0.1, HULL, [0, DECK_Y - 0.1, -2.98]);

  // ---- tail lights
  for (const s of [1, -1]) {
    box(0.45, 0.1, 0.07, P.hullDark, [s * 0.85, DECK_Y + 0.15, -2.99]);
    glow(box(0.4, 0.05, 0.03, P.neonRed, [s * 0.85, DECK_Y + 0.15, -3.03]), 2);
    glow(box(0.1, 0.1, 0.03, P.neonRed, [s * 0.5, DECK_Y - 0.02, -3.03]), 1.5);
  }
  // glowing tank-led brake bar
  glow(box(0.8, 0.04, 0.03, P.neonRed, [0, DECK_Y + 0.27, -3.02]), 1.5);

  // ---- spoiler wing on struts
  const wy = DECK_Y + 1.0;
  for (const s of [1, -1]) {
    box(0.07, 0.6, 0.12, P.hullDark, [s * 0.95, DECK_Y + 0.7, -2.85], { rotation: [-10, 0, 0] });
    box(0.1, 0.12, 0.14, STEEL, [s * 0.95, DECK_Y + 0.38, -2.85]);
  }
  const wing = b.extrude(
    [[-1.35, -0.18], [1.35, -0.18], [1.2, 0.18], [-1.2, 0.18]],
    { at: [0, wy + 0.05, -2.85], x: [1, 0, 0], y: [0, 0.3, 1], thickness: 0.07, bevel: 0.015, color: HULL, bone },
  );
  void wing;
  glow(box(2.5, 0.03, 0.03, P.neonMagenta, [0, wy + 0.08, -3.0]), 2);
  for (const s of [1, -1]) {
    box(0.05, 0.3, 0.5, P.hullLight, [s * 1.36, wy + 0.0, -2.85]);
    glow(box(0.02, 0.2, 0.3, P.neonMagenta, [s * 1.395, wy + 0.0, -2.88]), 1.5);
  }

  // ---- corp emblem on tank side
  const logo = svg(
    `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="36" fill="none" stroke="#ff2bd6" stroke-width="5"/>
    <path d="M40 12 L64 60 H16Z" fill="none" stroke="#e8ecf2" stroke-width="6"/><path d="M28 48 H52" stroke="#e8ecf2" stroke-width="6"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    glow(part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", [s * 0.512, DECK_Y + 0.62, -1.7], { dir: [s, 0, 0], axis: "z", texture: logo }), 0.8);

  // warning beacons on deck corners
  for (const s of [1, -1]) {
    part(new THREE.CylinderGeometry(0.05, 0.06, 0.05, 6), P.hullDark, [s * 1.15, DECK_Y + 0.13, -0.68]);
    glow(part(new THREE.SphereGeometry(0.055, 6, 4), P.neonRed, [s * 1.15, DECK_Y + 0.19, -0.68]), 2);
  }
}
    return buildTankDeck;
  })(),
  // waterCannon
  (() => {
type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

function buildWaterCannon({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const pitch = J.cannonPitch;
  const R = rng(91);
  const ring = M.turretRing;
  const cx = ring[0], cy = ring[1], cz = ring[2];

  const STEEL = panelled(metal("iron", { tarnish: 0.3, seed: 4 }), { size: 0.18, rivets: 0.05 });
  const SHIELD = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.2, 0.9, n.y) * 0.6 + noise(p, 0.15, 3) * 0.2);
    return base;
  });
  const BRASS = metal("brass", { tarnish: 0.4, seed: 8 });
  const HOSE = P.rubber;

  const cyl = (rt: number, rb: number, h: number, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);

  // ---- yaw base drum ----
  b.part(cyl(0.62, 0.68, 0.14, 16), STEEL, { bone: yaw, at: [cx, cy + 0.07, cz] });
  b.part(cyl(0.5, 0.58, 0.2, 16), STEEL, { bone: yaw, at: [cx, cy + 0.24, cz] });
  b.part(cyl(0.66, 0.66, 0.04, 16), P.trim, { bone: yaw, at: [cx, cy + 0.15, cz] });
  // rivet bolts around ring
  const bolts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    bolts.push(new THREE.SphereGeometry(0.018, 5, 4).translate(cx + Math.sin(a) * 0.6, cy + 0.15, cz + Math.cos(a) * 0.6));
  }
  const merged = mergeG(bolts);
  if (merged) b.part(merged, P.rim, { bone: yaw, at: [0, 0, 0] });

  // warning lights on drum
  for (const s of [1, -1]) {
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonRed, { bone: yaw, at: [cx + s * 0.45, cy + 0.2, cz - 0.3] }), 1.6);
  }

  // ---- gunner shield half-dome (lathe) with slit, in front of drum ----
  const shieldY = cy + 0.34;
  b.lathe(
    [
      [0, 0.0],
      [0.5, 0.0],
      [0.48, 0.05],
      [0.4, 0.22],
      [0.22, 0.34],
      [0, 0.38],
    ],
    { at: [cx, shieldY, cz - 0.1], bone: yaw, segments: 10, color: SHIELD },
  );
  // visor slit
  glow(
    b.part(new THREE.BoxGeometry(0.4, 0.035, 0.03), P.neonMagenta, { bone: yaw, at: [cx, shieldY + 0.2, cz + 0.37], dir: [0, 0.2, 1], axis: "z" }),
    1.3,
  );
  // shield side wings
  for (const s of [1, -1]) {
    b.extrude(
      [[0, 0], [0.35, 0], [0.3, 0.3], [0.05, 0.36, "sharp"]],
      { at: [cx + s * 0.5, shieldY, cz + 0.05], x: [0, 0, -1], thickness: 0.04, color: SHIELD, bone: yaw },
    );
    b.part(new THREE.BoxGeometry(0.045, 0.06, 0.3), P.trim, { bone: yaw, at: [cx + s * 0.5, shieldY + 0.28, cz - 0.1] });
  }

  // ---- trunnion yoke ----
  const py = 2.55, pz = cz;
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.34, 0.3), STEEL, { bone: yaw, at: [s * 0.3, py - 0.1, pz] });
    b.part(cyl(0.07, 0.07, 0.08, 8), BRASS, { bone: yaw, at: [s * 0.37, py, pz], dir: [1, 0, 0] });
  }

  // ---- cannon barrel on pitch ----
  const barrel = b.sweep([[0, py, pz - 0.35], [0, py, pz + 0.55]], 0.15, { bone: pitch, color: STEEL, sides: 12, caps: "flat" });
  b.part(cyl(0.2, 0.2, 0.34, 12), STEEL, { bone: pitch, at: [0, py, pz - 0.3], dir: [0, 0, 1] });
  // taper
  b.part(cyl(0.1, 0.15, 0.5, 12), STEEL, { bone: pitch, at: [0, py, pz + 0.8], dir: [0, 0, 1] });
  b.part(cyl(0.09, 0.1, 0.12, 12), STEEL, { bone: pitch, at: [0, py, pz + 1.12], dir: [0, 0, 1] });
  // bands
  [-0.1, 0.25, 0.55].forEach((dz, i) => {
    b.part(cyl(0.175, 0.175, 0.06, 12), i === 1 ? P.trim : BRASS, { bone: pitch, at: [0, py, pz + dz], dir: [0, 0, 1] });
  });
  b.part(cyl(0.19, 0.19, 0.05, 12), P.trim, { bone: pitch, at: [0, py, pz + 0.05], dir: [0, 0, 1] });
  b.part(cyl(0.135, 0.135, 0.05, 12), P.trim, { bone: pitch, at: [0, py, pz + 0.7], dir: [0, 0, 1] });
  // glowing nozzle ring
  const nz = pz + 1.2;
  glow(b.part(new THREE.TorusGeometry(0.105, 0.025, 6, 14), P.neonCyan, { bone: pitch, at: [0, py, nz] }), 1.8);
  glow(b.part(cyl(0.06, 0.06, 0.02, 10), P.neonCyan, { bone: pitch, at: [0, py, nz + 0.01], dir: [0, 0, 1] }), 1.6);

  // brass fittings: pipes along top
  b.rod([0.0, py + 0.2, pz - 0.2], [0.0, py + 0.2, pz + 0.5], 0.025, BRASS, { bone: pitch });
  b.part(new THREE.BoxGeometry(0.08, 0.05, 0.08), BRASS, { bone: pitch, at: [0, py + 0.2, pz - 0.2] });

  // pressure gauge on right side of barrel
  const gx = -0.22;
  b.part(cyl(0.085, 0.085, 0.04, 14), BRASS, { bone: pitch, at: [gx, py + 0.05, pz + 0.15], dir: [-1, 0, 0] });
  b.part(new THREE.CircleGeometry(0.07, 18), "#ffffff", {
    bone: pitch,
    at: [gx - 0.022, py + 0.05, pz + 0.15],
    dir: [-1, 0, 0],
    axis: "z",
    texture: gaugeTexture({ needle: 70, label: "BAR" }),
  });
  b.rod([-0.15, py + 0.0, pz + 0.15], [gx + 0.03, py + 0.05, pz + 0.15], 0.012, BRASS, { bone: pitch });

  // side sensor + LED strip (left side)
  b.part(new THREE.BoxGeometry(0.12, 0.1, 0.14), P.hullDark, { bone: pitch, at: [0.24, py + 0.02, pz + 0.1] });
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), P.neonCyan, { bone: pitch, at: [0.31, py + 0.02, pz + 0.17] }), 1.6);
  glow(b.part(new THREE.BoxGeometry(0.02, 0.02, 0.3), P.neonMagenta, { bone: pitch, at: [0.22, py - 0.1, pz + 0.2] }), 1.4);

  // targeting camera on top
  b.part(new THREE.BoxGeometry(0.14, 0.1, 0.18), P.hullDark, { bone: pitch, at: [0.0, py + 0.3, pz + 0.3] });
  b.part(cyl(0.04, 0.04, 0.06, 8), P.hullLight, { bone: pitch, at: [0, py + 0.3, pz + 0.43], dir: [0, 0, 1] });
  glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), P.neonRed, { bone: pitch, at: [0, py + 0.3, pz + 0.47] }), 2);
  b.rod([0, py + 0.2, pz + 0.3], [0, py + 0.26, pz + 0.3], 0.03, P.hullDark, { bone: pitch });

  // ---- feed hose: from barrel rear down to tank pump ----
  const hose = [
    [0.0, py - 0.05, pz - 0.5],
    [0.0, py - 0.15, pz - 0.75],
    [0.15, 2.15, pz - 0.95],
    [0.4, 2.0, pz - 1.3],
    [0.6, 1.85, pz - 1.7],
  ];
  b.sweep(hose, 0.055, { bone: pitch, color: HOSE, sides: 8, caps: "round" });
  b.part(cyl(0.075, 0.075, 0.08, 8), BRASS, { bone: pitch, at: [0, py - 0.05, pz - 0.48], dir: [0, 0, 1] });
  b.part(cyl(0.08, 0.08, 0.1, 8), BRASS, { bone: yaw, at: [0.6, 1.85, pz - 1.72] });
  for (let i = 1; i < 4; i++) {
    const t = i / 4;
    const x = 0.05 + t * 0.5, y = 2.3 - t * 0.42, z = pz - 0.9 - t * 0.75;
    b.part(cyl(0.07, 0.07, 0.03, 8), P.trim, { bone: pitch, at: [x, y, z], dir: [0.3, 0.3, -1] });
  }

  // hazard stripe decal on drum
  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#f2c200"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 + 1} 16Z" fill="#14171d"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  b.cards([frame([cx, cy + 0.34, cz + 0.52], [0, 0, 1])], HAZ, { size: [0.4, 0.1], lean: 0, flow: [0, 0, 1], cross: false });

  function mergeG(list: THREE.BufferGeometry[]) {
    let pos: number[] = [], idx: number[] = [], off = 0;
    for (const g of list) {
      const ng = g.index ? g : g;
      const p = ng.getAttribute("position");
      for (let i = 0; i < p.count; i++) pos.push(p.getX(i), p.getY(i), p.getZ(i));
      if (ng.index) for (let i = 0; i < ng.index.count; i++) idx.push(ng.index.getX(i) + off);
      off += p.count;
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    out.setIndex(idx);
    out.computeVertexNormals();
    return out;
  }
}
    return buildWaterCannon;
  })(),
  // wheels
  (() => {
function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.5; // wheel radius
  const TIRE_R = 0.47; // tire body radius; tread blocks add the rest
  const rand = rng(11);

  // ---- paints -------------------------------------------------------------------------------------------------
  const MUD = "#4a3a28";
  const tirePaint = paint((p, n) => {
    const low = smoothstep(0.42, 0.02, p.y);
    const blot = smoothstep(0.35, 0.7, noise(p, 0.12, 4));
    const base = mix(P.tire, P.rubber, noise(p, 0.05, 2));
    const dust = mix(base, MUD, Math.min(1, low * (0.45 + 0.8 * blot)));
    return mix(dust, "#6a5a45", 0.25 * low * smoothstep(0.6, 0.9, noise(p, 0.03, 8)) * (0.5 + 0.5 * n.y));
  });
  const flapPaint = paint((p) => mix(P.rubber, MUD, smoothstep(0.5, 0.15, p.y) * (0.6 + 0.6 * noise(p, 0.08, 6))));
  const steel = metal("steel", { tarnish: 0.35, size: 0.05 });
  const darkSteel = metal("iron", { tarnish: 0.3 });

  // ---- textures -----------------------------------------------------------------------------------------------
  const flapTex = svg(
    `<svg viewBox="0 0 40 42" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="40" height="42" rx="3" fill="#1b1b1f"/>
      <rect x="0" y="0" width="40" height="42" rx="3" fill="none" stroke="#f2c200" stroke-width="2"/>
      <path d="M3 8 L20 16 L37 8 M3 18 L20 26 L37 18" stroke="#f2c200" stroke-width="3" fill="none" stroke-linejoin="miter"/>
      <rect x="6" y="30" width="28" height="8" fill="#0d0d10" stroke="#2ff3ff" stroke-width="1"/>
      <text x="20" y="36.5" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="6" fill="#ff2bd6">CORP SEC</text>
    </svg>`,
    { size: 192 },
  );

  // ---- geometry helpers ---------------------------------------------------------------------------------------
  // Each helper returns model-space geometry for a wheel centred at (cx, R, cz) with outward sign s.
  const rotX = (g: THREE.BufferGeometry, a: number) => g.applyMatrix4(new THREE.Matrix4().makeRotationX(a));

  const treads = (cx: number, cz: number, s: number) => {
    const list: THREE.BufferGeometry[] = [];
    const N = 12;
    for (let row = 0; row < 2; row++) {
      const off = row === 0 ? -0.1 : 0.1;
      for (let i = 0; i < N; i++) {
        const a = ((i + (row ? 0.5 : 0)) * Math.PI * 2) / N;
        const g = new THREE.BoxGeometry(0.17, 0.07, 0.14);
        rotX(g, a);
        g.translate(cx + s * off, R + (TIRE_R) * Math.cos(a), cz + TIRE_R * Math.sin(a));
        list.push(g);
      }
    }
    return mergeGeometries(list)!;
  };

  const spokes = (cx: number, cz: number, s: number) => {
    const list: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5;
      const g = new THREE.BoxGeometry(0.035, 0.22, 0.07);
      rotX(g, a);
      g.translate(cx + s * 0.245, R + 0.2 * Math.cos(a), cz + 0.2 * Math.sin(a));
      list.push(g);
    }
    return mergeGeometries(list)!;
  };

  const bolts = (cx: number, cz: number, s: number) => {
    const list: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI * 2) / 6 + 0.26;
      const g = new THREE.CylinderGeometry(0.02, 0.02, 0.035, 5);
      g.rotateZ(-Math.PI / 2);
      g.translate(cx + s * 0.27, R + 0.335 * Math.cos(a), cz + 0.335 * Math.sin(a));
      list.push(g);
    }
    return mergeGeometries(list)!;
  };

  const tireProfile: [number, number][] = [
    [0, -0.2],
    [0.3, -0.2],
    [0.4, -0.225],
    [TIRE_R, -0.17],
    [TIRE_R, 0.17],
    [0.4, 0.225],
    [0.3, 0.2],
    [0, 0.2],
  ];

  // ---- one wheel ----------------------------------------------------------------------------------------------
  function wheel(joint: typeof J.body, s: number, cz: number, neon: string) {
    const cx = s * 1.15;
    const axis: [number, number, number] = [s, 0, 0];
    const centre = (off: number): [number, number, number] => [cx + s * off, R, cz];

    b.lathe(tireProfile, { at: centre(0), axis, segments: 20, color: tirePaint, bone: joint, name: "tire" });
    b.part(treads(cx, cz, s), tirePaint, { bone: joint, at: [0, 0, 0], flat: true, name: "tread" });

    // brake disc, behind the spokes
    b.lathe(
      [
        [0.11, 0],
        [0.27, 0],
        [0.27, 0.022],
        [0.11, 0.022],
      ],
      { at: centre(0.2), axis, segments: 16, color: darkSteel, bone: joint, name: "disc" },
    );

    // rim ring + spokes + hub cap
    b.lathe(
      [
        [0.28, 0.2],
        [0.385, 0.2],
        [0.385, 0.255],
        [0.345, 0.275],
        [0.28, 0.255],
      ],
      { at: [cx, R, cz], axis, segments: 16, color: steel, bone: joint, name: "rim" },
    );
    b.part(spokes(cx, cz, s), steel, { bone: joint, at: [0, 0, 0], flat: true, name: "spokes" });
    b.part(bolts(cx, cz, s), P.brass, { bone: joint, at: [0, 0, 0], flat: true, name: "bolts" });
    b.part(new THREE.CylinderGeometry(0.11, 0.13, 0.08, 8), darkSteel, {
      bone: joint,
      at: centre(0.245),
      dir: axis,
      flat: true,
      name: "hub",
    });
    // glowing neon hubcap ring + centre lamp
    glow(
      b.lathe(
        [
          [0.14, 0],
          [0.2, 0],
          [0.2, 0.03],
          [0.14, 0.03],
        ],
        { at: centre(0.27), axis, segments: 16, color: neon, bone: joint, name: "hubNeon" },
      ),
      1.6,
    );
    glow(
      b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 8), neon, {
        bone: joint,
        at: centre(0.3),
        dir: axis,
        name: "hubLamp",
      }),
      1.2,
    );
    // stub axle
    b.rod([cx - s * 0.6, R, cz], [cx, R, cz], 0.055, steel, { bone: joint, name: "axle" });
  }

  // ---- suspension + flaps (static on the body) ------------------------------------------------------------------
  function suspension(s: number, cz: number) {
    const cx = s * 1.15;
    // lower wishbone
    b.rod([s * 0.55, 0.4, cz - 0.28], [s * 0.88, 0.48, cz], 0.026, P.hullLight, { bone: J.body });
    b.rod([s * 0.55, 0.4, cz + 0.28], [s * 0.88, 0.48, cz], 0.026, P.hullLight, { bone: J.body });
    // upper arm
    b.rod([s * 0.6, 0.78, cz - 0.1], [s * 0.88, 0.62, cz], 0.022, P.hullLight, { bone: J.body });
    // knuckle
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 8), P.hullDark, {
      bone: J.body,
      at: [s * 0.88, R, cz],
      dir: [s, 0, 0],
      flat: true,
    });
    // brake caliper
    b.part(new THREE.BoxGeometry(0.05, 0.1, 0.1), P.trim, {
      bone: J.body,
      at: [s * 1.355, R + 0.24, cz - 0.02],
      flat: true,
      name: "caliper",
    });
    b.part(new THREE.BoxGeometry(0.05, 0.1, 0.1), P.trim, {
      bone: J.body,
      at: [cx + s * 0.205, R + 0.24, cz - 0.02],
      flat: true,
    });
    // shock absorber with coil spring
    const lo: [number, number, number] = [s * 0.86, 0.58, cz + 0.3];
    const mid: [number, number, number] = [s * 0.82, 0.8, cz + 0.32];
    const hi: [number, number, number] = [s * 0.78, 1.02, cz + 0.34];
    b.rod(lo, mid, 0.032, P.hullDark, { bone: J.body, sides: 6 });
    b.rod(mid, hi, 0.018, steel, { bone: J.body, sides: 5 });
    b.sweep(coil(lo, hi, 0.05, 3), 0.008, { bone: J.body, color: P.brass, sides: 3, detail: 0.5 });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), P.hullLight, { bone: J.body, at: hi, name: "shockTop" });
  }

  function flap(s: number, cz: number) {
    const cx = s * 1.15;
    const z = cz - 0.64;
    b.part(new THREE.BoxGeometry(0.42, 0.42, 0.035), flapPaint, { bone: J.body, at: [cx, 0.36, z], flat: true, name: "flap" });
    b.part(new THREE.BoxGeometry(0.46, 0.05, 0.2), P.hullDark, { bone: J.body, at: [cx, 0.59, z + 0.08], flat: true });
    b.part(new THREE.PlaneGeometry(0.34, 0.357), "#ffffff", {
      bone: J.body,
      at: [cx, 0.36, z - 0.02],
      dir: [0, 0, -1],
      axis: "z",
      texture: flapTex,
      name: "flapDecal",
    });
    // small trim bolts
    for (const dx of [-0.17, 0.17]) {
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 5), P.brass, {
        bone: J.body,
        at: [cx + dx, 0.55, z - 0.02],
        dir: [0, 0, -1],
      });
    }
  }

  // ---- cross axle housings between sides ------------------------------------------------------------------------
  for (const cz of [M.frontAxle[2], M.midAxle[2], M.rearAxle[2]]) {
    b.rod([-0.85, 0.5, cz], [0.85, 0.5, cz], 0.07, P.hullDark, { bone: J.body, sides: 8, name: "axleHousing" });
    b.part(new THREE.SphereGeometry(0.16, 8, 6), P.hullDark, { bone: J.body, at: [0, 0.5, cz], name: "diff" });
  }

  // ---- assemble ------------------------------------------------------------------------------------------------
  const specs: [typeof J.body, number, number, string][] = [
    [J.wheelFL, 1, M.frontAxle[2], P.neonCyan],
    [J.wheelFR, -1, M.frontAxle[2], P.neonCyan],
    [J.wheelML, 1, M.midAxle[2], P.neonMagenta],
    [J.wheelMR, -1, M.midAxle[2], P.neonMagenta],
    [J.wheelRL, 1, M.rearAxle[2], P.neonMagenta],
    [J.wheelRR, -1, M.rearAxle[2], P.neonMagenta],
  ];
  for (const [joint, s, cz, neon] of specs) {
    wheel(joint, s, cz, neon);
    suspension(s, cz);
    flap(s, cz);
  }
  void rand;
}
    return buildWheels;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "riotInterceptor" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,2.15,-1.3], dir: [0,1,0], role: "hinge", group: "turret" });
  J["cannonPitch"] = b.joint("cannonPitch", { parent: J["turretYaw"], at: [0,2.55,-1.3], dir: [0,0,1], role: "hinge", group: "turret" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.15,0.5,2], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.15,0.5,2], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.15,0.5,0], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.15,0.5,0], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.15,0.5,-2], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.15,0.5,-2], dir: [-1,0,0], role: "hinge", group: "wheels" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
