```ts
import * as THREE from "three";
import { createBuilder, svg, paint, rng, noise, mix } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "NCO-9 Riot Interceptor",
  description:
    "Corporate riot-control interceptor: armored six-wheel truck with a roof-mounted water cannon turret, neon light bars, ram bumper and corporate livery in a cyberpunk style.",
};

const YEL = "#fcee0a";
const CYAN = "#02d7f2";
const MAG = "#ff2a6d";
const RED = "#ff2030";
const BLUE = "#2a5cff";
const DARK = "#0d0f16";
const GLASS = "#071522";

// ---------- textures ----------
const LOGO = svg(
  `<svg viewBox="0 0 256 96">
  <rect x="2" y="2" width="252" height="92" rx="8" fill="#0a0c12" fill-opacity="0.85" stroke="#02d7f2" stroke-width="3"/>
  <path d="M20 74 L44 22 L68 74 L56 74 L44 46 L32 74Z" fill="#fcee0a"/>
  <path d="M50 74 L74 22 L98 74 L86 74 L74 46 L62 74Z" fill="#ff2a6d" fill-opacity="0.9"/>
  <text x="112" y="46" font-family="sans-serif" font-weight="bold" font-size="26" fill="#ffffff">NEXUS CIVIL</text>
  <text x="112" y="76" font-family="sans-serif" font-weight="bold" font-size="22" fill="#02d7f2">ORDER DIV.</text>
  <path d="M112 54 H240" stroke="#fcee0a" stroke-width="3"/>
  </svg>`,
  { size: 512 },
);
const HAZARD = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#fcee0a"/>
  <path d="M-16 64 L16 0 L32 0 L0 64Z M16 64 L48 0 L64 0 L32 64Z M48 64 L80 0 L96 0 L64 64Z" fill="#14151b"/></svg>`,
  { size: 128 },
);
const WARN = svg(
  `<svg viewBox="0 0 200 64"><rect width="200" height="64" fill="#0a0c12"/>
  <text x="100" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#ff2030">DISPERSE NOW</text>
  <text x="100" y="52" text-anchor="middle" font-family="monospace" font-size="16" fill="#fcee0a">// 解散せよ //</text>
  <rect x="2" y="2" width="196" height="60" fill="none" stroke="#ff2030" stroke-width="2"/></svg>`,
  { size: 400 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 128 48"><rect width="128" height="48" fill="#06070b"/>
  ${Array.from({ length: 12 }, (_, i) => `<rect x="${6 + i * 10}" y="5" width="5" height="38" fill="#2c3342"/>`).join("")}
  <rect x="0" y="22" width="128" height="4" fill="#02d7f2"/></svg>`,
  { size: 256 },
);
const HUD = svg(
  `<svg viewBox="0 0 160 40"><rect width="160" height="40" fill="#001a22"/>
  <path d="M6 30 L30 12 L50 24 L80 8 L110 22 L154 10" stroke="#02d7f2" stroke-width="2" fill="none"/>
  <circle cx="140" cy="28" r="6" fill="none" stroke="#ff2a6d" stroke-width="2"/>
  <rect x="6" y="34" width="60" height="3" fill="#fcee0a"/></svg>`,
  { size: 320 },
);
const TANKMARK = svg(
  `<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#e8f4ff" fill-opacity="0"/>
  <path d="M64 6 C40 30 34 40 64 58 C94 40 88 30 64 6Z" fill="#02d7f2" stroke="#0a0c12" stroke-width="3"/>
  <path d="M10 32 H34 M94 32 H118" stroke="#fcee0a" stroke-width="5"/></svg>`,
  { size: 256 },
);

// ---------- paints ----------
const HULL = paint((p, n) => {
  const base = mix("#2b3345", "#151922", n.y < -0.3 ? 1 : 0);
  const top = mix(base, "#4a5570", Math.max(0, n.y) * 0.6);
  const mud = Math.max(0, 0.9 - p.y) * noise(p, 0.25, 4) * 1.4;
  return mix(top, "#2a2218", Math.min(mud, 0.8));
});
const PLATE = panelled(HULL, { size: 0.55, aspect: 0.6, rivets: 0.09 });
const WHITE = paint((p, n) => mix("#d9e0ea", "#8f9bb0", Math.min(1, (n.y < 0 ? 0.6 : 0) + noise(p, 0.3, 2) * 0.4)));
const STEEL = metal("steel", { tarnish: 0.4 });
const IRON = metal("iron");

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });
  const R = rng(11);
  const chassis = b.joint("chassis", { at: [0, 1, 0] });
  const turret = b.joint("turret", { parent: chassis, at: [0, 2.55, -1.0], dir: [0, 1, 0] });
  const cannon = b.joint("cannon", { parent: turret, at: [0, 0.5, 0.05], dir: [0, 0.05, 1] });

  const P = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(geo, color, { bone: chassis, at, ...o });
  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], o: any = {}) =>
    P(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, o);
  const neon = (w: number, h: number, d: number, color: string, at: number[], s = 1.6, o: any = {}) =>
    glow(box(w, h, d, color, at, o), s);

  // ---------- hull ----------
  box(2.0, 0.9, 5.8, PLATE, [0, 1.05, 0]);
  box(2.0, 0.35, 1.5, PLATE, [0, 1.68, 2.15]); // hood
  box(2.0, 0.85, 1.7, PLATE, [0, 1.93, 0.7]); // cab
  box(2.0, 1.0, 2.75, PLATE, [0, 2.0, -1.525]); // rear body
  box(1.95, 0.08, 1.65, WHITE, [0, 2.4, 0.7]); // cab roof
  box(2.02, 0.12, 2.8, WHITE, [0, 2.52, -1.525]);
  box(2.1, 0.22, 5.9, IRON, [0, 0.62, 0]); // skirt
  // armoured shoulder wedges
  for (const s of [1, -1]) {
    box(0.08, 0.5, 1.6, STEEL, [s * 1.03, 1.2, 1.9]);
    box(0.1, 0.12, 4.9, WHITE, [s * 1.03, 1.55, -0.1]);
    box(0.06, 0.55, 0.9, IRON, [s * 1.03, 2.0, 0.7]); // door
    box(0.07, 0.07, 0.3, STEEL, [s * 1.08, 1.95, 0.35]); // handle
  }
  // windshield + side windows
  box(1.8, 0.75, 0.06, GLASS, [0, 2.05, 1.6], { rotation: [-22, 0, 0] });
  glow(P(new THREE.PlaneGeometry(1.1, 0.28), "#ffffff", [0, 2.12, 1.64], { dir: [0, 0.35, 1], axis: "z", texture: HUD }), 1.2);
  for (const s of [1, -1]) {
    box(0.04, 0.4, 0.9, GLASS, [s * 1.02, 2.1, 0.8]);
    for (let i = 0; i < 3; i++) box(0.05, 0.42, 0.04, IRON, [s * 1.04, 2.1, 0.45 + i * 0.35]); // cage bars
  }
  for (let i = 0; i < 5; i++) box(0.04, 0.8, 0.05, IRON, [-0.7 + i * 0.35, 2.06, 1.72], { rotation: [-22, 0, 0] });

  // livery decals
  for (const s of [1, -1]) {
    P(new THREE.PlaneGeometry(1.9, 0.72), "#ffffff", [s * 1.012, 1.1, -1.3], { dir: [s, 0, 0], axis: "z", texture: LOGO });
    P(new THREE.PlaneGeometry(1.2, 0.38), "#ffffff", [s * 1.012, 1.0, 1.9], { dir: [s, 0, 0], axis: "z", texture: WARN });
    glow(P(new THREE.PlaneGeometry(0.9, 0.45), "#ffffff", [s * 1.012, 1.9, -1.6], { dir: [s, 0, 0], axis: "z", texture: TANKMARK }), 1.0);
    neon(0.04, 0.05, 4.7, s > 0 ? CYAN : MAG, [s * 1.05, 0.62, 0], 1.8); // underglow
    neon(0.05, 0.04, 1.4, YEL, [s * 1.04, 1.45, 1.9], 1.4);
  }

  // ---------- front end ----------
  // ram bumper with hazard
  box(2.4, 0.5, 0.45, IRON, [0, 0.85, 2.95]);
  P(new THREE.BoxGeometry(2.3, 0.3, 0.1), "#ffffff", [0, 0.85, 3.2], { texture: HAZARD });
  box(2.5, 0.12, 0.5, STEEL, [0, 1.15, 2.95]);
  for (const s of [1, -1]) {
    box(0.18, 0.8, 0.3, IRON, [s * 1.2, 1.0, 2.9]);
    // headlights: angry slits
    neon(0.55, 0.1, 0.06, "#fff6c0", [s * 0.62, 1.82, 2.93], 2.2, { rotation: [0, 0, s * -14] });
    neon(0.3, 0.06, 0.06, MAG, [s * 0.62, 1.7, 2.93], 1.8, { rotation: [0, 0, s * -14] });
    // fog lamps
    cyl(0.1, 0.1, 0.08, 8, "#fff", [s * 0.85, 1.2, 3.0], { dir: [0, 0, 1] });
    cyl(0.07, 0.07, 0.09, 8, YEL, [s * 0.85, 1.2, 3.02], { dir: [0, 0, 1] });
  }
  glow(P(new THREE.PlaneGeometry(1.2, 0.45), "#ffffff", [0, 1.35, 2.93], { dir: [0, 0, 1], axis: "z", texture: GRILLE }), 0.8);
  box(1.3, 0.05, 0.08, STEEL, [0, 1.6, 2.92]);

  // roof light bar
  box(1.9, 0.12, 0.35, DARK, [0, 2.52, 1.1]);
  for (let i = 0; i < 8; i++) {
    const c = i % 2 ? BLUE : RED;
    neon(0.2, 0.14, 0.3, c, [-0.8 + i * 0.228, 2.62, 1.1], 2.2);
  }
  neon(1.9, 0.04, 0.04, CYAN, [0, 2.7, 1.1], 2);
  // wing mirrors
  for (const s of [1, -1]) {
    box(0.06, 0.06, 0.4, IRON, [s * 1.2, 2.1, 1.4], { rotation: [0, s * 25, 0] });
    box(0.08, 0.3, 0.2, DARK, [s * 1.3, 2.1, 1.5]);
    neon(0.02, 0.22, 0.14, CYAN, [s * 1.34, 2.1, 1.5], 1.3);
  }

  // ---------- rear ----------
  box(2.0, 0.3, 0.2, IRON, [0, 0.95, -2.95]);
  for (const s of [1, -1]) {
    neon(0.3, 0.5, 0.06, RED, [s * 0.7, 1.75, -2.92], 2);
    neon(0.3, 0.06, 0.06, YEL, [s * 0.7, 1.4, -2.92], 1.5);
    cyl(0.07, 0.07, 1.0, 8, IRON, [s * 1.08, 2.7, -2.3]); // exhaust-stack
    cyl(0.09, 0.07, 0.1, 8, STEEL, [s * 1.08, 3.2, -2.3]);
  }
  P(new THREE.PlaneGeometry(1.2, 0.4), "#ffffff", [0, 2.25, -2.91], { dir: [0, 0, -1], axis: "z", texture: WARN });
  box(1.4, 0.8, 0.05, IRON, [0, 1.8, -2.92]);
  // water tank on the roof
  cyl(0.38, 0.38, 1.3, 10, WHITE, [0, 2.95, -2.1], { dir: [0, 0, 1] });
  for (const z of [-1.6, -2.1, -2.6]) cyl(0.4, 0.4, 0.07, 10, IRON, [0, 2.95, z], { dir: [0, 0, 1] });
  P(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", [0.385, 2.95, -2.1], { dir: [1, 0, 0], axis: "z", texture: TANKMARK });
  P(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", [-0.385, 2.95, -2.1], { dir: [-1, 0, 0], axis: "z", texture: TANKMARK });
  box(0.8, 0.1, 0.1, STEEL, [0, 2.65, -2.1]);
  // antennas
  for (const [x, z, h] of [[0.8, 0.2, 1.4], [-0.8, -0.3, 1.0], [0.6, -2.7, 0.9]]) {
    cyl(0.012, 0.02, h, 5, IRON, [x, 2.6 + h / 2, z]);
    glow(P(new THREE.SphereGeometry(0.035, 6, 4), MAG, [x, 2.6 + h, z]), 2.5);
  }
  // camera dome
  P(new THREE.SphereGeometry(0.16, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), "#202733", [0, 2.46, 0.2]);
  glow(P(new THREE.SphereGeometry(0.04, 6, 4), RED, [0, 2.5, 0.34]), 2.5);

  // side gas launchers and riot shields
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      cyl(0.07, 0.07, 0.6, 8, IRON, [s * 1.12, 1.95 + i * 0.01, -0.5 - i * 0.35 + 0.2], { dir: [s, 0.3, 0.2] });
      glow(cyl(0.05, 0.05, 0.04, 6, YEL, [s * 1.38, 2.02, -0.3 - i * 0.35], { dir: [s, 0.3, 0.2] }), 1.4);
    }
    box(0.08, 0.7, 0.7, GLASS, [s * 1.07, 1.1, -2.1]);
    box(0.1, 0.05, 0.75, YEL, [s * 1.08, 1.47, -2.1]);
    box(0.1, 0.05, 0.75, YEL, [s * 1.08, 0.75, -2.1]);
  }

  // ---------- wheels ----------
  const zs = [1.9, -0.7, -2.0];
  for (const s of [1, -1]) {
    zs.forEach((z, i) => {
      const name = `wheel${s > 0 ? "L" : "R"}${i + 1}`;
      const j = b.joint(name, { parent: chassis, at: [s * 1.12, 0.55, z], dir: [s, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.42, 14), "#14151a", { bone: j, at: j.at, dir: [s, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.44, 10), STEEL, { bone: j, at: j.at, dir: [s, 0, 0] });
      b.part(new THREE.TorusGeometry(0.38, 0.03, 4, 14), s > 0 ? CYAN : MAG, {
        bone: j,
        at: [s * 1.34, 0.55, z],
        dir: [s, 0, 0],
        axis: "z",
      });
      glow(b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.46, 6), YEL, { bone: j, at: j.at, dir: [s, 0, 0] }), 1.3);
      // arch
      b.part(new THREE.BoxGeometry(0.5, 0.15, 1.3), IRON, { bone: chassis, at: [s * 1.08, 1.12, z] });
    });
  }

  // ---------- turret & water cannon ----------
  const T = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) => b.part(geo, color, { bone: turret, at, ...o });
  T(new THREE.CylinderGeometry(0.62, 0.7, 0.2, 12), IRON, [0, 2.65, -1.0]);
  T(new THREE.CylinderGeometry(0.45, 0.5, 0.35, 8), PLATE, [0, 2.85, -1.0]);
  for (const s of [1, -1]) {
    T(new THREE.BoxGeometry(0.2, 0.55, 0.7), PLATE, [s * 0.42, 3.15, -1.0]);
    glow(T(new THREE.BoxGeometry(0.03, 0.3, 0.4), s > 0 ? CYAN : MAG, [s * 0.53, 3.15, -1.0]), 1.8);
    T(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 8), STEEL, [s * 0.5, 3.2, -0.85], { dir: [1, 0, 0] });
  }
  T(new THREE.BoxGeometry(0.64, 0.3, 0.5), IRON, [0, 3.0, -1.35]); // pump housing
  T(new THREE.BoxGeometry(0.3, 0.25, 0.3), GLASS, [0, 3.0, -1.05]);
  const C = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) => b.part(geo, color, { bone: cannon, at, ...o });
  const cy = 3.15, cz = -0.9;
  C(new THREE.SphereGeometry(0.3, 8, 6), PLATE, [0, cy, cz]);
  b.rod([0, cy, cz], [0, cy + 0.08, cz + 1.7], [0.2, 0.17], WHITE, { bone: cannon, sides: 10 });
  b.rod([0, cy + 0.08, cz + 1.7], [0, cy + 0.09, cz + 2.1], [0.17, 0.13], IRON, { bone: cannon, sides: 10 });
  for (const f of [0.4, 0.9, 1.4]) {
    C(new THREE.CylinderGeometry(0.22, 0.22, 0.07, 10), YEL, [0, cy + 0.04 + f * 0.047, cz + f], { dir: [0, 0.05, 1] });
  }
  C(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 10), STEEL, [0, cy + 0.1, cz + 2.12], { dir: [0, 0.05, 1] });
  glow(C(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 8), CYAN, [0, cy + 0.1, cz + 2.16], { dir: [0, 0.05, 1] }), 2.5);
  neon(0.04, 0.04, 1.4, CYAN, [0, cy + 0.2, cz + 0.9], 1.8, { bone: cannon });
  C(new THREE.BoxGeometry(0.1, 0.12, 0.3), DARK, [0.2, cy + 0.22, cz + 0.4]);
  glow(C(new THREE.SphereGeometry(0.04, 6, 4), RED, [0.2, cy + 0.22, cz + 0.58]), 2.5);
  // hoses from housing
  b.sweep(
    [[0.15, 3.0, -1.4], [0.35, 3.35, -1.2], [0.2, 3.3, -0.95], [0.05, cy, cz]],
    0.035,
    { color: "#1b1e27", bone: cannon, sides: 6 },
  );

  // ---------- chassis small details: scattered rivets/bolts, stickers ----------
  const skin = b.surface(chassis);
  const hits = skin.scatter(30, { rng: R, minDist: 0.35, filter: (h: any) => Math.abs(h.n.x) > 0.8 && h.at.y > 0.9 });
  for (const h of hits) b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6), STEEL, h, { embed: 0.3 });

  return b.root;
}
```