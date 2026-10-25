import * as THREE from "three";
import { createBuilder, countershade, mottle, stripes, svg, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  name: "NovaSec Riot Interceptor",
  description: "Corporate riot-control interceptor with a roof water cannon, ram bumper and neon light bars, Cyberpunk 2077 style.",
};

const NAVY = "#1b2033", ARMOR = "#262d44", DARK = "#0d0f16", STEEL = "#6d7488", TYRE = "#15161b";
const GLASS = "#0b2f40", YEL = "#f5d300", PINK = "#ff2a9d", CYAN = "#19e6ff", RED = "#ff2438";

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

const LOGO = svg(
  `<svg viewBox="0 0 256 128"><rect width="256" height="128" fill="none"/>
  <path d="M20 14 H92 V70 Q92 104 56 116 Q20 104 20 70Z" fill="#0d0f16" stroke="#19e6ff" stroke-width="5"/>
  <path d="M56 28 L76 62 H36Z" fill="#ff2a9d"/><rect x="50" y="64" width="12" height="30" fill="#19e6ff"/>
  <text x="104" y="58" font-family="monospace" font-weight="bold" font-size="40" fill="#f5d300">NOVASEC</text>
  <text x="106" y="96" font-family="monospace" font-weight="bold" font-size="24" fill="#19e6ff">RIOT CONTROL</text>
  <rect x="104" y="104" width="140" height="5" fill="#ff2a9d"/></svg>`,
  { size: 512 },
);
const PLATE = svg(
  `<svg viewBox="0 0 128 40"><rect width="128" height="40" rx="4" fill="#0d0f16" stroke="#f5d300" stroke-width="3"/>
  <text x="64" y="29" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="24" fill="#ff2a9d">NS-0451</text></svg>`,
  { size: 256 },
);
const MESH = svg(
  `<svg viewBox="0 0 32 32"><path d="M0 0L32 32M32 0L0 32M16 0V32M0 16H32" stroke="#6d7488" stroke-width="3" fill="none"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });
  const ch = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });
  const HULL = countershade(mottle(NAVY, "#141828", { size: 0.5 }), "#0b0d14", { level: -0.2 });
  const HAZ = stripes(YEL, "#111111", { size: 0.14, axis: "x", width: 0.5, wobble: 0 });
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { bone: ch, at: at as any, ...o });
  const G = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}, k = 1.4) => glow(P(g, c, at, o), k);

  // ---- frame, hull
  for (const s of [1, -1]) b.part(box(0.2, 0.25, 5.4), DARK, { bone: ch, at: [s * 0.7, 0.75, 0] });
  P(box(2.4, 0.9, 5.6), HULL, [0, 1.35, 0]);
  P(box(2.5, 0.12, 5.7), ARMOR, [0, 0.9, 0]); // skid plate
  b.frustumBox([0, 1.5, 2.8], [0, 1.4, 3.35], [2.4, 0.8], [2.2, 0.5], { bone: ch, color: ARMOR });
  P(box(2.2, 0.06, 0.9), STEEL, [0, 1.95, 2.35], { rotation: [-8, 0, 0] }); // hood plate
  for (let i = 0; i < 5; i++) P(box(0.6, 0.03, 0.05), DARK, [-0.9 + i * 0.45, 1.99, 2.4]); // hood vents
  // cab
  P(box(2.3, 0.85, 2.0), HULL, [0, 2.2, 0.35]);
  P(box(2.35, 0.1, 2.1), ARMOR, [0, 2.68, 0.35]);
  P(box(2.1, 0.62, 0.06), GLASS, [0, 2.3, 1.42], { rotation: [-22, 0, 0] });
  P(box(2.1, 0.5, 0.05), GLASS, [0, 2.3, -0.68]);
  for (const s of [1, -1]) {
    P(box(0.05, 0.4, 1.5), GLASS, [s * 1.16, 2.35, 0.5]);
    for (let i = 0; i < 6; i++) P(box(0.07, 0.4, 0.04), STEEL, [s * 1.17, 2.35, -0.1 + i * 0.28]); // cage bars
    P(box(0.08, 0.7, 0.06), ARMOR, [s * 1.14, 2.25, 1.28], { rotation: [0, 0, 0] });
  }
  // side doors w/ hinge
  for (const s of [1, -1]) {
    const door = b.joint(`door${s > 0 ? "L" : "R"}`, { parent: ch, at: [s * 1.17, 2.0, 1.2], dir: [0, 1, 0], role: "hinge" });
    b.part(box(0.05, 0.8, 0.14), STEEL, { bone: door, at: [s * 1.19, 1.85, 0.95] }); // handle plate
    b.part(box(0.06, 0.05, 0.3), DARK, { bone: door, at: [s * 1.22, 1.85, 0.95] });
    b.part(box(0.04, 0.03, 1.3), YEL, { bone: door, at: [s * 1.2, 1.5, 0.6] });
  }
  // logos
  for (const s of [1, -1]) {
    glow(b.part(new THREE.PlaneGeometry(2.2, 1.1), "#ffffff", { bone: ch, at: [s * 1.215, 1.35, -1.3], dir: [s, 0, 0], axis: "z", texture: LOGO }), 1.0);
    b.part(box(0.04, 0.2, 5.2), HAZ, { bone: ch, at: [s * 1.22, 0.98, 0] });
    for (let i = 0; i < 6; i++) b.part(cyl(0.025, 0.03, 6), STEEL, { bone: ch, at: [s * 1.22, 1.78, -2.3 + i * 0.9], dir: [s, 0, 0] });
    G(box(0.05, 0.07, 2.3), s > 0 ? PINK : CYAN, [s * 1.26, 0.82, 0]); // rocker neon
    G(box(0.05, 0.05, 1.8), s > 0 ? CYAN : PINK, [s * 1.23, 1.68, -1.2]);
    // shield rack
    b.part(box(0.08, 0.7, 0.5), "#10131c", { bone: ch, at: [s * 1.27, 1.35, 0.1] });
    b.part(new THREE.PlaneGeometry(0.5, 0.7), "#ffffff", { bone: ch, at: [s * 1.32, 1.35, 0.1], dir: [s, 0, 0], axis: "z", texture: MESH });
    // mirrors
    b.rod([s * 1.15, 2.4, 1.3], [s * 1.5, 2.45, 1.45], 0.02, STEEL, { bone: ch, sides: 6 });
    P(box(0.06, 0.3, 0.2), DARK, [s * 1.52, 2.45, 1.45]);
    G(box(0.02, 0.22, 0.14), CYAN, [s * 1.555, 2.45, 1.45], {}, 0.6);
  }
  // roof: light bars
  P(box(2.1, 0.12, 0.25), DARK, [0, 2.8, 1.05]);
  G(box(2.0, 0.08, 0.04), PINK, [0, 2.82, 1.19], {}, 2);
  G(box(0.95, 0.08, 0.04), CYAN, [-0.5, 2.82, 1.19], {}, 2);
  for (const s of [1, -1]) G(box(0.04, 0.08, 0.18), s > 0 ? PINK : CYAN, [s * 1.06, 2.82, 1.05], {}, 2);
  P(box(2.2, 0.06, 0.12), DARK, [0, 2.73, -0.55]);
  for (let i = 0; i < 6; i++) G(box(0.3, 0.05, 0.03), i % 2 ? RED : CYAN, [-0.9 + i * 0.36, 2.76, -0.62], {}, 2);
  // spotlights
  for (const s of [1, -1]) {
    P(cyl(0.12, 0.2, 10), DARK, [s * 0.7, 2.82, 0.3], { rotation: [90, 0, 0] });
    G(cyl(0.09, 0.03, 10), "#e8fbff", [s * 0.7, 2.82, 0.42], { rotation: [90, 0, 0] }, 2);
  }
  // antenna
  b.spike([-1.0, 2.73, -0.3], [0, 1, 0], 1.1, 0.02, STEEL, { bone: ch, sides: 5 });
  G(new THREE.SphereGeometry(0.04, 6, 4), RED, [-1.0, 3.85, -0.3]);
  // ---- front: grille, headlamps, ram bumper
  P(box(1.6, 0.6, 0.12), DARK, [0, 1.35, 3.3]);
  for (let i = 0; i < 7; i++) P(box(1.5, 0.03, 0.05), STEEL, [0, 1.12 + i * 0.08, 3.37]);
  for (const s of [1, -1]) {
    P(box(0.55, 0.16, 0.14), DARK, [s * 0.98, 1.55, 3.18]);
    G(box(0.5, 0.06, 0.04), "#d9f6ff", [s * 0.98, 1.55, 3.26], {}, 2.5);
    G(box(0.06, 0.3, 0.04), PINK, [s * 1.15, 1.3, 3.2], {}, 1.6);
  }
  P(box(2.6, 0.45, 0.35), ARMOR, [0, 0.95, 3.4]);
  P(box(2.6, 0.12, 0.38), HAZ, [0, 0.8, 3.4]);
  for (const s of [1, -1]) P(box(1.3, 0.4, 0.1), ARMOR, [s * 0.9, 1.0, 3.62], { rotation: [0, -s * 22, 0] });
  for (let i = 0; i < 5; i++) b.spike([-0.8 + i * 0.4, 0.78, 3.6], [0, 0, 1], 0.2, 0.05, STEEL, { bone: ch, sides: 5 });
  G(box(1.6, 0.04, 0.03), CYAN, [0, 1.13, 3.66], {}, 2);
  b.part(new THREE.PlaneGeometry(0.5, 0.16), "#ffffff", { bone: ch, at: [0, 0.98, 3.585], dir: [0, 0, 1], axis: "z", texture: PLATE });
  for (const s of [1, -1]) {
    b.rod([s * 0.5, 1.2, 3.35], [s * 0.5, 1.7, 3.0], 0.03, STEEL, { bone: ch, sides: 6 });
    P(box(0.2, 0.14, 0.12), DARK, [s * 0.35, 0.65, 3.55]);
  }
  // underglow
  G(box(1.8, 0.05, 4.8), PINK, [0, 0.66, 0], {}, 1.2);
  // ---- rear: water tank, hose, taillights, exhaust
  const tank = P(cyl(0.72, 2.6, 12), "#2c3550", [0, 2.35, -1.55], { rotation: [90, 0, 0], flat: true });
  void tank;
  for (const z of [-2.6, -0.5]) P(cyl(0.64, 0.06, 12), DARK, [0, 2.35, z], { rotation: [90, 0, 0] });
  for (const z of [-2.2, -1.55, -0.9]) P(new THREE.TorusGeometry(0.73, 0.04, 5, 14), STEEL, [0, 2.35, z]);
  P(cyl(0.2, 0.2, 8), STEEL, [0, 3.08, -1.5]);
  P(cyl(0.05, 0.3, 6), DARK, [0.3, 3.1, -2.1]);
  G(box(1.3, 0.12, 0.03), CYAN, [0, 2.2, -2.88], {}, 1.4); // level gauge strip
  P(box(0.12, 0.8, 0.12), DARK, [0, 1.9, -2.5]);
  b.sweep(
    [[0.3, 3.1, -2.1], [0.9, 2.6, -2.7], [1.0, 1.9, -2.75], [0.5, 1.6, -2.6]],
    0.05,
    { bone: ch, color: DARK, sides: 6 },
  );
  for (const s of [1, -1]) {
    G(box(0.5, 0.2, 0.04), RED, [s * 0.85, 1.55, -2.82], {}, 1.8);
    P(cyl(0.1, 0.5, 8), STEEL, [s * 0.7, 0.85, -2.8], { rotation: [90, 0, 0] });
    P(cyl(0.12, 0.05, 8), DARK, [s * 0.7, 0.85, -3.07], { rotation: [90, 0, 0] });
  }
  P(box(2.6, 0.3, 0.2), HAZ, [0, 1.0, -2.88]);
  // ---- water cannon turret
  const yaw = b.joint("turretYaw", { parent: ch, at: [0, 2.74, 0.3], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("cannonPitch", { parent: yaw, at: [0, 3.15, 0.3], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.45, 0.1, 12), STEEL, { bone: ch, at: [0, 2.78, 0.3] });
  b.part(cyl(0.34, 0.3, 10), ARMOR, { bone: yaw, at: [0, 2.95, 0.3], flat: true });
  for (const s of [1, -1]) b.part(box(0.08, 0.4, 0.4), ARMOR, { bone: yaw, at: [s * 0.28, 3.15, 0.3] });
  b.part(box(0.4, 0.32, 0.7), NAVY, { bone: pitch, at: [0, 3.15, 0.1] });
  b.rod([0, 3.15, 0.4], [0, 3.15, 2.3], 0.12, STEEL, { bone: pitch, sides: 10 });
  b.part(cyl(0.18, 0.5, 10), ARMOR, { bone: pitch, at: [0, 3.15, 0.9], rotation: [90, 0, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.1, 0.17, 0.4, 10), DARK, { bone: pitch, at: [0, 3.15, 2.45], rotation: [90, 0, 0], flat: true });
  glow(b.part(cyl(0.08, 0.03, 10), CYAN, { bone: pitch, at: [0, 3.15, 2.66], rotation: [90, 0, 0] }), 2.5);
  for (const z of [1.3, 1.8]) glow(b.part(new THREE.TorusGeometry(0.14, 0.02, 5, 10), PINK, { bone: pitch, at: [0, 3.15, z] }), 2);
  b.part(box(0.25, 0.2, 0.3), "#10131c", { bone: pitch, at: [0.32, 3.2, 0.5] }); // sensor
  glow(b.part(box(0.1, 0.08, 0.02), RED, { bone: pitch, at: [0.32, 3.2, 0.66] }), 2);
  // ---- wheels
  const r = rng(5);
  for (const [k, s, z] of [["FL", 1, 1.85], ["FR", -1, 1.85], ["RL", 1, -1.85], ["RR", -1, -1.85]] as const) {
    const hub: [number, number, number] = [s * 1.2, 0.55, z];
    const parent = z > 0 ? b.joint(`steer${k}`, { parent: ch, at: hub, dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" }) : ch;
    const spin = b.joint(`wheel${k}`, { parent, at: hub, dir: [0, 1, 0], role: "hinge" });
    const parts: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const g = box(0.34, 0.1, 0.16);
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(0, 0.52 * Math.cos(a), 0.52 * Math.sin(a)),
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), a),
        new THREE.Vector3(1, 1, 1),
      );
      parts.push(g.applyMatrix4(m));
    }
    b.part(mergeGeometries(parts)!, TYRE, { bone: spin, at: hub });
    b.part(cyl(0.5, 0.36, 12), TYRE, { bone: spin, at: hub, rotation: [0, 0, 90], flat: true });
    b.part(cyl(0.32, 0.4, 10), STEEL, { bone: spin, at: hub, rotation: [0, 0, 90], flat: true });
    b.part(cyl(0.22, 0.44, 10), DARK, { bone: spin, at: [hub[0] + s * 0.01, hub[1], hub[2]], rotation: [0, 0, 90] });
    glow(b.part(new THREE.TorusGeometry(0.3, 0.025, 5, 16), r() > 2 ? CYAN : s > 0 ? PINK : CYAN, { bone: spin, at: [hub[0] + s * 0.2, hub[1], hub[2]], rotation: [0, 90, 0] }), 2);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(cyl(0.025, 0.05, 6), STEEL, { bone: spin, at: [hub[0] + s * 0.22, hub[1] + 0.13 * Math.cos(a), hub[2] + 0.13 * Math.sin(a)], rotation: [0, 0, 90] });
    }
    // fender arch
    b.part(box(0.45, 0.1, 1.3), ARMOR, { bone: ch, at: [s * 1.2, 1.15, z] });
    b.part(box(0.1, 0.35, 1.3), ARMOR, { bone: ch, at: [s * 1.42, 1.0, z] });
    // axle
    b.rod([s * 0.2, 0.55, z], [s * 1.0, 0.55, z], 0.07, DARK, { bone: ch, sides: 8 });
  }
  return b.root;
}
