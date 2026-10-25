```ts
import * as THREE from "three";
import { createBuilder, rng, paint, noise, mix, smoothstep, catmull, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Wraith-7 Tactical Truck",
  description:
    "A 2077 militarised cyberpunk pickup: armoured wedge cab, roof remote weapon station, rear VLS missile bed, neon underglow, ERA hood, hazard ram bumper, armoured hex-tread wheels, rigged suspension, steering, doors, tailgate, radar.",
};

type V3 = [number, number, number];
type Opt = {
  rotation?: V3;
  flat?: boolean;
  dir?: V3;
  axis?: "x" | "y" | "z";
  up?: V3;
  texture?: THREE.Texture;
  scale?: V3;
};

const NEON_C = "#17f3ff";
const NEON_M = "#ff2bd6";
const AMBER = "#ff8a1c";
const RED = "#ff2a3c";
const YEL = "#ffd21a";
const DARK = "#14161c";
const GLASS = "#0a2430";
const TYRE = "#1a1b1f";
const RIM = "#2c3038";
const WHITE = "#ffffff";

const bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cy = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);
const lerp3 = (a: V3, c: V3, t: number): V3 => [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];

// ---------------------------------------------------------------- paints
const hullBase = paint((p, n) => {
  const top = smoothstep(0.2, 0.9, n.y);
  const dirt = smoothstep(1.2, 0.5, p.y) * (0.5 + 0.5 * noise(p, 0.25, 3));
  let c = mix("#2c323b", "#4b5565", top * 0.8 + 0.2 * noise(p, 0.4, 1));
  c = mix(c, "#1b1710", dirt * 0.6);
  return c;
});
const HULL = panelled(hullBase, { size: 0.42, aspect: 0.6, rivets: 0.07 });
const ACCENT = panelled(
  paint((p, n) => mix(mix("#27535b", "#1a3a43", noise(p, 0.3, 4)), "#0e1d22", smoothstep(0.4, -0.8, n.y) * 0.5)),
  { size: 0.35, rivets: 0.08 },
);
const IRON = metal("iron", { tarnish: 0.5 });
const STEELM = metal("steel", { polish: 0.2, tarnish: 0.3 });
const HAZARD_PAINT = paint((p) => (Math.floor((p.x + p.y) / 0.08) % 2 ? YEL : "#15151a"));

// ---------------------------------------------------------------- textures
const hazStripes = (() => {
  let s = "";
  for (let i = -2; i < 10; i++) s += `<path d="M${i * 16} 16 L${i * 16 + 8} 0 L${i * 16 + 16} 0 L${i * 16 + 8} 16Z" fill="#ffd21a"/>`;
  return svg(`<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#121216"/>${s}</svg>`, { size: 256 });
})();

const LOGO = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="46" fill="#0d1117" stroke="#17f3ff" stroke-width="5"/>
  <path d="M50 12 L84 31 L84 69 L50 88 L16 69 L16 31Z" fill="none" stroke="#ff2bd6" stroke-width="4"/>
  <path d="M36 28 L36 72 M38 52 L64 28 M46 46 L66 72" stroke="#ffd21a" stroke-width="8" stroke-linecap="square" fill="none"/>
  <circle cx="72" cy="50" r="4" fill="#17f3ff"/></svg>`,
  { size: 256 },
);

const UNIT = svg(
  `<svg viewBox="0 0 128 48" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="124" height="44" rx="6" fill="#0b0e13" stroke="#17f3ff" stroke-width="3"/>
  <text x="64" y="33" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="28" fill="#ffd21a">MIL-77</text>
  <rect x="10" y="6" width="30" height="3" fill="#ff2bd6"/><rect x="88" y="39" width="30" height="3" fill="#ff2bd6"/></svg>`,
  { size: 256 },
);

const HUD = svg(
  `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a3a48"/><stop offset="1" stop-color="#05161c"/></linearGradient></defs>
  <rect width="128" height="64" fill="url(#g)"/>
  <path d="M0 64 L40 0 L58 0 L18 64Z" fill="#ffffff" fill-opacity="0.08"/>
  <path d="M70 64 L110 0 L118 0 L78 64Z" fill="#ffffff" fill-opacity="0.06"/>
  <circle cx="64" cy="34" r="12" fill="none" stroke="#17f3ff" stroke-opacity="0.7" stroke-width="1.5"/>
  <path d="M64 18 V26 M64 42 V50 M48 34 H56 M72 34 H80" stroke="#17f3ff" stroke-opacity="0.7" stroke-width="1.5"/>
  <text x="6" y="10" font-family="monospace" font-size="6" fill="#17f3ff" fill-opacity="0.8">SPD 088  HDG 274</text>
  <text x="84" y="60" font-family="monospace" font-size="6" fill="#ff2bd6" fill-opacity="0.9">THREAT: LOW</text></svg>`,
  { size: 512 },
);

const CIRC = svg(
  `<svg viewBox="0 0 128 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="32" fill="#04070b"/>
  <path d="M4 16 H30 L38 8 H70 L78 24 H100 L108 16 H124" stroke="#17f3ff" stroke-width="3" fill="none"/>
  <path d="M4 26 H22 L28 20 H56 M64 6 H90 L96 12 H124" stroke="#ff2bd6" stroke-width="2.5" fill="none"/>
  <circle cx="38" cy="8" r="3" fill="#ffd21a"/><circle cx="78" cy="24" r="3" fill="#ffd21a"/><circle cx="108" cy="16" r="3" fill="#17f3ff"/></svg>`,
  { size: 256 },
);

const TAILD = svg(
  `<svg viewBox="0 0 96 24" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="24" fill="#12040a"/>
  <text x="48" y="19" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="18" fill="#ff2a3c">2077</text>
  <rect x="2" y="2" width="20" height="3" fill="#ff2a3c"/><rect x="74" y="2" width="20" height="3" fill="#ff2a3c"/></svg>`,
  { size: 256 },
);

const PLATE = svg(
  `<svg viewBox="0 0 96 32" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="94" height="30" rx="4" fill="#ffd21a" stroke="#111" stroke-width="2"/>
  <text x="48" y="23" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#111">KR-2077-X</text>
  <circle cx="7" cy="6" r="2" fill="#333"/><circle cx="89" cy="6" r="2" fill="#333"/><circle cx="7" cy="26" r="2" fill="#333"/><circle cx="89" cy="26" r="2" fill="#333"/></svg>`,
  { size: 256 },
);

const WARN = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 4 L60 56 H4Z" fill="#ffd21a" stroke="#111" stroke-width="4" stroke-linejoin="round"/>
  <path d="M32 22 V40" stroke="#111" stroke-width="6" stroke-linecap="round"/><circle cx="32" cy="48" r="3.5" fill="#111"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "wraith7" });
  const R = rng(2077);

  // ------------------------------------------------------------ skeleton
  const chassis = b.joint("chassis", { at: [0, 0.6, 0], role: "spine" });
  const P = (geo: THREE.BufferGeometry, color: Parameters<typeof b.part>[1], at: V3, bone = chassis, o: Opt = {}) =>
    b.part(geo, color, { bone, at, ...o });
  const G = <T extends Parameters<typeof glow>[0]>(t: T, s = 1.4) => glow(t, s);
  const both = (fn: (s: 1 | -1) => void) => {
    fn(1);
    fn(-1);
  };

  // ------------------------------------------------------------ frame and underbody
  both((s) => {
    P(bx(0.14, 0.22, 5.1), IRON, [s * 0.45, 0.62, -0.1]);
    P(bx(0.5, 0.26, 1.9), DARK, [s * 0.62, 0.64, 0.1]); // battery module
    G(P(bx(0.02, 0.05, 1.7), NEON_C, [s * 0.88, 0.66, 0.1]), 1.5);
  });
  for (const z of [-2.5, -1.2, 0.3, 1.2, 2.3]) P(bx(1.0, 0.1, 0.1), IRON, [0, 0.58, z]);
  P(bx(1.3, 0.06, 3.8), DARK, [0, 0.52, 0.2]); // belly plate
  b.rod([0, 0.55, 1.4], [0, 0.55, -1.8], 0.04, { color: STEELM, bone: chassis, sides: 8 });
  P(cy(0.14, 0.5, 8), STEELM, [0, 0.55, 1.4], chassis, { rotation: [0, 0, 90] }); // front diff
  P(cy(0.14, 0.5, 8), STEELM, [0, 0.55, -1.8], chassis, { rotation: [0, 0, 90] });

  // ------------------------------------------------------------ hull (cab + hood)
  const prof: [number, number][] = [
    [-0.85, 0.78], [2.5, 0.78], [2.62, 1.0], [2.55, 1.22], [1.15, 1.48], [0.62, 2.02], [-0.1, 2.12], [-0.85, 2.08],
  ];
  b.extrude(prof, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.7, bevel: 0.03, color: HULL, bone: chassis });

  // windscreen with HUD glass
  const wsN: V3 = [0, 0.7, 0.71];
  const wsC: V3 = [0, 1.75, 0.885];
  P(new THREE.PlaneGeometry(1.46, 0.76), WHITE, [wsC[0], wsC[1] + 0.015, wsC[2] + 0.015], chassis, { dir: wsN, axis: "z", texture: HUD });
  for (const t of [-0.5, 0.5]) {
    const a = lerp3([0, 2.02, 0.62], [0, 1.48, 1.15], 0.5 + t * 0.9);
    void a;
  }
  both((s) => {
    b.rod([s * 0.75, 2.04, 0.62], [s * 0.75, 1.5, 1.15], 0.035, { color: ACCENT, bone: chassis, section: "box" }); // A pillars
    // side windows
    b.extrude([[-0.5, 1.65], [0.82, 1.65], [0.58, 1.95], [-0.5, 1.97]], {
      at: [s * 0.86, 0, 0], x: [0, 0, 1], thickness: 0.03, color: GLASS, bone: chassis,
    });
    // vision cameras on pillar
    P(bx(0.1, 0.1, 0.14), DARK, [s * 0.88, 1.98, 0.7]);
    G(P(cy(0.025, 0.02, 8), NEON_C, [s * 0.88, 1.98, 0.78], chassis, { rotation: [90, 0, 0] }), 2);
    // rear quarter louvres
    for (let i = 0; i < 5; i++) P(bx(0.03, 0.025, 0.3), DARK, [s * 0.87, 1.2 + i * 0.07, -0.65], chassis, { rotation: [s * 25, 0, 0] });
    // mirrors
    b.rod([s * 0.88, 1.72, 0.45], [s * 1.15, 1.8, 0.58], 0.015, { color: STEELM, bone: chassis, sides: 5 });
    P(bx(0.07, 0.26, 0.18), DARK, [s * 1.18, 1.8, 0.58]);
    G(P(cy(0.03, 0.02, 8), NEON_M, [s * 1.18, 1.8, 0.67], chassis, { rotation: [90, 0, 0] }), 2);
    // smoke dischargers
    for (let i = 0; i < 4; i++) {
      const z = 0.05 + i * 0.1;
      b.rod([s * 0.65, 2.14, z], [s * 0.82, 2.34, z], 0.03, { color: IRON, bone: chassis, sides: 6 });
      P(cy(0.035, 0.03, 6), DARK, [s * 0.83, 2.35, z], chassis, { rotation: [0, 0, s * -33] });
    }
    // fenders and flares
    for (const z of [1.6, -1.6]) {
      P(bx(0.38, 0.12, 1.15), ACCENT, [s * 0.98, 0.96, z]);
      P(bx(0.06, 0.2, 1.1), ACCENT, [s * 1.15, 0.86, z]);
      P(bx(0.3, 0.38, 0.03), DARK, [s * 0.98, 0.55, z - 0.5]); // mud flap
    }
    // skirts, circuit glow, underglow
    for (let i = 0; i < 4; i++) {
      const z = -0.82 + i * 0.55;
      P(bx(0.06, 0.4, 0.5), HULL, [s * 0.93, 0.62, z]);
      G(P(new THREE.PlaneGeometry(0.46, 0.115), WHITE, [s * 0.965, 0.66, z], chassis, { dir: [s, 0, 0], axis: "z", texture: CIRC }), 1.3);
    }
    P(bx(0.07, 0.05, 2.2), IRON, [s * 0.93, 0.83, 0]);
    G(P(bx(0.04, 0.03, 2.2), s > 0 ? NEON_C : NEON_M, [s * 0.95, 0.43, 0]), 1.8);
    // ammo boxes outside bed
    P(bx(0.14, 0.3, 0.5), IRON, [s * 1.04, 1.1, -1.2]);
    P(bx(0.15, 0.05, 0.5), YEL, [s * 1.04, 1.28, -1.2]);
    // exhaust stacks
    P(cy(0.065, 1.7, 8), STEELM, [s * 0.78, 1.7, -1.0]);
    P(cy(0.1, 0.7, 8), DARK, [s * 0.78, 1.25, -1.0]);
    G(P(cy(0.045, 0.03, 8), AMBER, [s * 0.78, 2.56, -1.0]), 2);
    // headlights
    G(P(bx(0.5, 0.09, 0.04), NEON_C, [s * 0.55, 1.1, 2.62]), 2);
    P(bx(0.56, 0.03, 0.1), DARK, [s * 0.55, 1.19, 2.6]);
    G(P(bx(0.18, 0.05, 0.03), AMBER, [s * 0.8, 0.95, 2.6]), 1.8);
    // tail lamps
    G(P(bx(0.09, 0.32, 0.04), RED, [s * 0.92, 1.25, -2.8]), 2);
    // tow hooks
    P(new THREE.TorusGeometry(0.06, 0.02, 5, 8, Math.PI), STEELM, [s * 0.6, 0.55, 3.0], chassis, { rotation: [90, 0, 0] });
    // cab hinge bolts + rear fenders brace
    P(cy(0.025, 0.07, 6), STEELM, [s * 0.88, 1.5, 0.55], chassis, { rotation: [0, 0, 90] });
  });

  // roof
  P(bx(1.5, 0.07, 1.0), HULL, [0, 2.15, -0.1]);
  both((s) => b.rod([s * 0.72, 2.2, -0.55], [s * 0.72, 2.2, 0.35], 0.02, { color: STEELM, bone: chassis, sides: 6 }));
  for (let i = 0; i < 9; i++) {
    const x = (R() - 0.5) * 1.2;
    const z = -0.5 + R() * 0.35;
    P(bx(0.08 + R() * 0.1, 0.04 + R() * 0.04, 0.08 + R() * 0.08), i % 2 ? DARK : IRON, [x, 2.22, z]);
  }
  // light bar
  P(bx(1.3, 0.08, 0.1), DARK, [0, 2.23, 0.42]);
  for (let i = 0; i < 6; i++) G(P(bx(0.19, 0.05, 0.02), i % 2 ? NEON_M : NEON_C, [-0.52 + i * 0.208, 2.24, 0.475]), 2.2);
  // whip antennas
  both((s) => {
    b.spike([s * 0.7, 2.18, -0.72], [s * 0.1, 1, -0.1], 1.4, 0.014, { color: STEELM, bone: chassis, sides: 5 });
    P(new THREE.SphereGeometry(0.03, 6, 4), AMBER, [s * 0.7 + s * 0.13, 3.55, -0.72 - 0.13], chassis, { flat: true });
  });

  // hood: ERA, vents, number
  const hoodY = (z: number) => 1.48 - 0.1238 * (z - 1.15);
  for (const x of [-0.62, -0.3, 0.3, 0.62])
    for (const z of [1.5, 1.82, 2.1]) {
      P(bx(0.27, 0.07, 0.25), (x + z) % 0.2 > 0.1 ? ACCENT : IRON, [x, hoodY(z) + 0.03, z], chassis, { rotation: [7, 0, 0] });
      P(cy(0.025, 0.02, 6), STEELM, [x, hoodY(z) + 0.075, z], chassis);
    }
  G(P(bx(0.04, 0.01, 0.9), AMBER, [0, hoodY(1.8) + 0.01, 1.8], chassis, { rotation: [7, 0, 0] }), 1.6);
  P(new THREE.PlaneGeometry(0.4, 0.15), WHITE, [0, hoodY(1.45) + 0.012, 1.35], chassis, { dir: [0, 1, 0.12], axis: "z", up: [0, 0, 1], texture: UNIT });

  // grille and nose
  P(bx(1.3, 0.3, 0.05), DARK, [0, 0.9, 2.6]);
  for (let i = 0; i < 5; i++) G(P(bx(1.1, 0.025, 0.03), i % 2 ? NEON_M : NEON_C, [0, 0.8 + i * 0.055, 2.635]), 1.2);
  // bumper ram
  b.frustumBox([0, 0.68, 2.62], [0, 0.68, 3.0], [2.1, 0.46], [1.7, 0.34], { color: ACCENT, bone: chassis });
  P(new THREE.PlaneGeometry(1.5, 0.28), WHITE, [0, 0.68, 3.005], chassis, { dir: [0, 0, 1], axis: "z", texture: hazStripes });
  for (let i = 0; i < 6; i++) b.spike([-0.75 + i * 0.3, 0.52, 3.0], [0, -0.2, 1], 0.2, 0.04, { color: STEELM, bone: chassis, sides: 5 });
  G(P(bx(1.6, 0.03, 0.03), NEON_M, [0, 0.43, 2.9]), 1.8);
  // winch
  P(cy(0.06, 0.4, 8), IRON, [0, 0.9, 2.55], chassis, { rotation: [0, 0, 90] });

  // ------------------------------------------------------------ doors
  both((s) => {
    const door = b.joint(s > 0 ? "doorL" : "doorR", { parent: chassis, at: [s * 0.87, 1.28, 0.5], dir: [0, 1, 0], role: "hinge" });
    P(bx(0.045, 0.66, 1.2), HULL, [s * 0.875, 1.28, -0.1], door);
    P(bx(0.05, 0.03, 0.2), STEELM, [s * 0.9, 1.4, -0.55], door);
    P(bx(0.02, 0.62, 0.03), DARK, [s * 0.9, 1.28, 0.48], door);
    P(bx(0.02, 0.03, 1.15), DARK, [s * 0.9, 1.0, -0.1], door);
    G(P(new THREE.PlaneGeometry(0.42, 0.42), WHITE, [s * 0.9, 1.3, -0.1], door, { dir: [s, 0, 0], axis: "z", texture: LOGO }), 1.0);
    P(new THREE.PlaneGeometry(0.3, 0.1), WHITE, [s * 0.9, 1.0 + 0.0, -0.55], door, { dir: [s, 0, 0], axis: "z", texture: PLATE });
  });

  // ------------------------------------------------------------ bed
  P(bx(1.9, 0.07, 1.95), IRON, [0, 0.88, -1.8]);
  both((s) => {
    b.extrude([[-0.9, 0.9], [-2.75, 0.9], [-2.75, 1.35], [-1.9, 1.5], [-0.9, 1.7]], {
      at: [s * 0.93, 0, 0], x: [0, 0, 1], thickness: 0.08, bevel: 0.015, color: HULL, bone: chassis,
    });
    P(bx(0.1, 0.05, 1.9), ACCENT, [s * 0.93, 1.5, -1.8], chassis, { rotation: [-s * 0, 0, 0] });
    G(P(new THREE.PlaneGeometry(0.3, 0.12), WHITE, [s * 0.98, 1.2, -2.3], chassis, { dir: [s, 0, 0], axis: "z", texture: PLATE }), 0.2);
    P(new THREE.PlaneGeometry(0.2, 0.2), WHITE, [s * 0.98, 1.35, -1.3], chassis, { dir: [s, 0, 0], axis: "z", texture: WARN });
    for (let i = 0; i < 3; i++) P(new THREE.TorusGeometry(0.04, 0.012, 5, 8), STEELM, [s * 0.98, 1.0, -1.4 - i * 0.55], chassis, { rotation: [0, 90, 0] });
  });
  P(bx(1.7, 0.9, 0.1), HULL, [0, 1.35, -0.92]); // headboard

  // tailgate
  const gate = b.joint("tailgate", { parent: chassis, at: [0, 0.93, -2.78], dir: [1, 0, 0], role: "hinge" });
  P(bx(1.8, 0.5, 0.06), HULL, [0, 1.17, -2.78], gate);
  G(P(new THREE.PlaneGeometry(0.9, 0.22), WHITE, [0, 1.22, -2.815], gate, { dir: [0, 0, -1], axis: "z", texture: TAILD }), 1.5);
  P(new THREE.PlaneGeometry(1.6, 0.14), WHITE, [0, 1.0, -2.812], gate, { dir: [0, 0, -1], axis: "z", texture: hazStripes });
  P(bx(0.3, 0.04, 0.04), STEELM, [0, 1.38, -2.82], gate);
  // rear bumper
  P(bx(2.0, 0.2, 0.2), ACCENT, [0, 0.66, -2.82]);
  G(P(bx(1.7, 0.03, 0.03), RED, [0, 0.6, -2.94]), 1.8);

  // VLS launcher
  P(bx(1.6, 0.35, 1.45), IRON, [0, 1.2, -1.7]);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 3; j++) {
      const x = -0.57 + i * 0.38;
      const z = -1.28 - j * 0.45;
      P(cy(0.16, 0.04, 6), DARK, [x, 1.4, z], chassis, { flat: true });
      G(P(cy(0.11, 0.045, 6), (i + j) % 3 === 0 ? NEON_M : "#1c0a18", [x, 1.405, z], chassis, { flat: true }), 1.5);
      if ((i + j) % 4 === 1) b.spike([x, 1.42, z], [0, 1, 0], 0.22, 0.08, { color: STEELM, bone: chassis, sides: 6 });
    }
  const lid = b.joint("vlsLid", { parent: chassis, at: [0, 1.4, -2.48], dir: [1, 0, 0], role: "hinge" });
  P(bx(1.5, 0.03, 0.28), ACCENT, [0, 1.41, -2.62], lid);
  P(bx(0.2, 0.04, 0.05), STEELM, [0, 1.44, -2.7], lid);
  P(new THREE.PlaneGeometry(0.22, 0.22), WHITE, [0.0, 1.425, -2.62], lid, { dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: WARN });
  // cable harness
  for (const [dx, col] of [[-0.12, NEON_M], [0, DARK], [0.12, NEON_C]] as [number, string][]) {
    const path = catmull([[dx + 0.5, 1.4, -1.0], [dx + 0.75, 1.62, -0.95], [dx + 0.8, 1.9, -0.9]]);
    const sw = b.sweep(path, 0.014, { color: col, bone: chassis, sides: 5 });
    if (col !== DARK) G(sw, 1.4);
  }

  // ------------------------------------------------------------ roof remote weapon station
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 2.2, -0.3], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.5, -0.3], dir: [0, 0, 1], role: "hinge" });
  P(new THREE.TorusGeometry(0.3, 0.03, 6, 14), STEELM, [0, 2.2, -0.3], chassis, { rotation: [90, 0, 0] });
  P(cy(0.26, 0.2, 10), HULL, [0, 2.32, -0.3], yaw, { flat: true });
  P(bx(0.5, 0.24, 0.46), ACCENT, [0, 2.5, -0.35], yaw);
  both((s) => {
    P(bx(0.05, 0.3, 0.4), IRON, [s * 0.25, 2.55, -0.3], yaw);
    P(bx(0.16, 0.2, 0.3), YEL, [s * 0.4, 2.45, -0.4], yaw);
    P(bx(0.17, 0.03, 0.31), DARK, [s * 0.4, 2.56, -0.4], yaw);
    P(bx(0.16, 0.16, 0.2), DARK, [s * 0.3, 2.68, -0.3], pitch);
    b.rod([s * 0.1, 2.5, -0.35], [s * 0.1, 2.5, 0.95], 0.035, { color: STEELM, bone: pitch, sides: 8 });
    P(cy(0.065, 0.55, 8), IRON, [s * 0.1, 2.5, 0.2], pitch, { rotation: [90, 0, 0] });
    P(bx(0.1, 0.1, 0.12), DARK, [s * 0.1, 2.5, 0.95], pitch);
  });
  P(bx(0.34, 0.22, 0.5), IRON, [0, 2.5, -0.1], pitch);
  P(new THREE.SphereGeometry(0.09, 8, 6), DARK, [-0.0, 2.7, -0.15], pitch, { flat: true });
  G(P(cy(0.045, 0.02, 8), NEON_C, [0, 2.7, -0.07], pitch, { rotation: [90, 0, 0] }), 2.5);

  // radar
  P(cy(0.03, 0.3, 6), STEELM, [0.62, 2.3, 0.12]);
  const radar = b.joint("radar", { parent: chassis, at: [0.62, 2.45, 0.12], dir: [0, 1, 0], role: "hinge" });
  P(cy(0.05, 0.06, 8), DARK, [0.62, 2.47, 0.12], radar);
  P(bx(0.6, 0.1, 0.03), ACCENT, [0.62, 2.55, 0.12], radar);
  G(P(bx(0.5, 0.02, 0.01), NEON_C, [0.62, 2.55, 0.14], radar), 1.6);

  // ------------------------------------------------------------ wheels and suspension
  const coil = (bone: Parameters<typeof P>[3], from: V3, to: V3, r: number, n: number) => {
    for (let i = 0; i < n; i++)
      b.part(new THREE.TorusGeometry(r, r * 0.22, 4, 8), STEELM, {
        bone, at: lerp3(from, to, (i + 0.5) / n), dir: [to[0] - from[0], to[1] - from[1], to[2] - from[2]], axis: "z",
      });
  };
  for (const [k, s, z] of [["FL", 1, 1.6], ["FR", -1, 1.6], ["RL", 1, -1.6], ["RR", -1, -1.6]] as [string, 1 | -1, number][]) {
    const front = z > 0;
    const hub: V3 = [s * 0.98, 0.42, z];
    const susp = b.joint(`susp${k}`, { parent: chassis, at: [s * 0.5, 0.6, z], dir: [0, 1, 0], role: "hinge" });
    const steer = front ? b.joint(`steer${k}`, { parent: susp, at: hub, dir: [0, 1, 0], role: "hinge" }) : susp;
    const W = b.joint(`wheel${k}`, { parent: steer, at: hub, dir: [1, 0, 0], role: "hinge" });
    // suspension
    b.rod([s * 0.5, 0.52, z - 0.25], [s * 0.8, 0.45, z], 0.025, { color: STEELM, bone: susp, sides: 6 });
    b.rod([s * 0.5, 0.52, z + 0.25], [s * 0.8, 0.45, z], 0.025, { color: STEELM, bone: susp, sides: 6 });
    b.rod([s * 0.5, 0.75, z], [s * 0.82, 0.62, z], 0.025, { color: STEELM, bone: susp, sides: 6 });
    coil(susp, [s * 0.64, 0.5, z + 0.18], [s * 0.58, 0.82, z + 0.18], 0.06, 5);
    b.rod([s * 0.66, 0.5, z - 0.18], [s * 0.6, 0.84, z - 0.18], 0.03, { color: AMBER, bone: susp, sides: 6 });
    P(bx(0.12, 0.3, 0.14), DARK, [s * 0.8, 0.5, z], steer);
    // wheel
    P(cy(0.4, 0.34, 12), TYRE, hub, W, { rotation: [0, 0, 90], flat: true });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      P(bx(i % 2 ? 0.16 : 0.2, 0.1, 0.14), TYRE, [hub[0] + (i % 2 ? 0.07 : -0.07), 0.42 + 0.38 * Math.cos(a), z + 0.38 * Math.sin(a)], W, {
        rotation: [(a * 180) / Math.PI, 0, 0], flat: true,
      });
    }
    P(cy(0.27, 0.36, 8), RIM, hub, W, { rotation: [0, 0, 90], flat: true });
    P(cy(0.3, 0.04, 10), ACCENT, [hub[0] + s * 0.18, 0.42, z], W, { rotation: [0, 0, 90], flat: true });
    G(P(new THREE.TorusGeometry(0.2, 0.014, 4, 14), s > 0 ? NEON_C : NEON_M, [hub[0] + s * 0.205, 0.42, z], W, { rotation: [0, 90, 0] }), 2);
    P(cy(0.07, 0.06, 8), STEELM, [hub[0] + s * 0.21, 0.42, z], W, { rotation: [0, 0, 90] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      P(cy(0.015, 0.03, 6), STEELM, [hub[0] + s * 0.205, 0.42 + 0.13 * Math.cos(a), z + 0.13 * Math.sin(a)], W, { rotation: [0, 0, 90] });
    }
  }

  return b.root;
}
```