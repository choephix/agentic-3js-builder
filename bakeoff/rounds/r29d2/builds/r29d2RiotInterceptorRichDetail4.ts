import * as THREE from "three";
import { createBuilder, svg, paint, noise, mix, smoothstep } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Arasaka-style Riot Interceptor",
  description: "Corporate riot-control armoured interceptor with a roof water cannon, tank and neon light bars, cyberpunk style.",
};

const NAVY = "#14182a", STEEL = "#2a2f42", DARK = "#0b0c14", PINK = "#ff2d95", CYAN = "#22f0ff",
  AMBER = "#ffb020", RED = "#e8213a", GLASS = "#0e2a3a", YEL = "#f2c200";

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 10) => new THREE.CylinderGeometry(r, r, h, s);

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });
  const hullPaint = panelled(
    paint((p, n) => {
      const c = mix(NAVY, "#262c48", smoothstep(0.3, 0.8, noise(p, 0.5, 3)));
      return mix(c, "#07080f", smoothstep(0.2, -0.8, n.y) * 0.6);
    }),
    { size: 0.5, aspect: 0.6, rivets: 0.1, seam: DARK },
  );
  const chassis = b.joint("chassis", { at: [0, 1, 0], role: "spine" });
  const P = (g: THREE.BufferGeometry, col: any, at: number[], o: any = {}) =>
    b.part(g, col, { bone: chassis, at: at as any, ...o });
  const rod = (a: number[], c: number[], r: number, col: any, bone: any = chassis) =>
    b.rod(a as any, c as any, r, col, { bone, sides: 6 });

  // ---- hull
  P(box(2.3, 0.9, 6), hullPaint, [0, 1.0, 0]);
  P(box(2.0, 0.25, 5.8), DARK, [0, 0.45, 0]); // belly
  P(box(2.2, 0.9, 2.5), hullPaint, [0, 1.9, 1.5]); // cab
  P(box(2.3, 0.08, 2.6), STEEL, [0, 2.38, 1.5]); // roof plate
  P(box(2.0, 0.9, 0.08), hullPaint, [0, 1.9, 0.25]);
  // raked windscreen slit with visor
  P(box(1.9, 0.38, 0.06), GLASS, [0, 2.0, 2.78], { rotation: [-20, 0, 0] });
  P(box(2.1, 0.12, 0.3), STEEL, [0, 2.3, 2.75], { rotation: [-20, 0, 0] });
  // front slope & ram bumper
  P(box(2.3, 0.7, 0.5), hullPaint, [0, 1.0, 3.1], { rotation: [-12, 0, 0] });
  P(box(2.5, 0.5, 0.45), STEEL, [0, 0.75, 3.3]);
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#f2c200"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 10 - 4} 16 l8 -16 l5 0 l-8 16z" fill="#111"/>`).join("")}</svg>`,
    { size: 256 },
  );
  P(new THREE.PlaneGeometry(2.4, 0.3), "#ffffff", [0, 0.72, 3.53], { dir: [0, 0, 1], axis: "z", texture: hazard });
  for (let i = -3; i <= 3; i++) P(cyl(0.05, 0.4, 6), DARK, [i * 0.3, 0.75, 3.6], { rotation: [90, 0, 0] });
  for (const s of [1, -1]) {
    rod([s * 0.8, 0.5, 3.4], [s * 0.8, 1.55, 3.55], 0.07, STEEL);
    rod([s * 0.8, 1.55, 3.55], [s * 0.2, 1.55, 3.55], 0.06, STEEL);
  }
  // neon strips front
  glow(P(box(1.8, 0.07, 0.05), CYAN, [0, 1.25, 3.38], { rotation: [-12, 0, 0] }), 2);
  for (const s of [1, -1]) {
    P(box(0.5, 0.18, 0.1), DARK, [s * 0.8, 1.05, 3.4], { rotation: [-12, 0, 0] });
    glow(P(box(0.42, 0.1, 0.04), "#ffffff", [s * 0.8, 1.05, 3.45], { rotation: [-12, 0, 0] }), 1.6);
  }

  // ---- logos & decals
  const logo = svg(
    `<svg viewBox="0 0 256 96"><rect width="256" height="96" fill="none"/>
    <path d="M20 80 L48 14 L76 80 M32 56 H64" stroke="#ff2d95" stroke-width="9" fill="none"/>
    <path d="M84 14 V80 M84 14 H118 Q130 14 130 30 Q130 46 118 46 H84 M110 46 L132 80" stroke="#22f0ff" stroke-width="9" fill="none"/>
    <text x="146" y="42" font-family="sans-serif" font-weight="bold" font-size="26" fill="#ffffff">RIOT</text>
    <text x="146" y="74" font-family="sans-serif" font-weight="bold" font-size="22" fill="#ff2d95">CONTROL</text></svg>`,
    { size: 512 },
  );
  const badge = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#0b0c14" stroke="#22f0ff" stroke-width="4"/><path d="M32 12 L50 44 H14Z" fill="none" stroke="#ff2d95" stroke-width="5"/><circle cx="32" cy="36" r="4" fill="#fff"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    P(new THREE.PlaneGeometry(1.8, 0.68), "#ffffff", [s * 1.16, 1.05, -0.4], { dir: [s, 0, 0], axis: "z", texture: logo });
    P(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", [s * 1.12, 1.9, 1.5], { dir: [s, 0, 0], axis: "z", texture: badge });
    // neon side strips
    glow(P(box(0.05, 0.07, 5.2), s > 0 ? PINK : CYAN, [s * 1.17, 1.4, -0.2]), 2.2);
    glow(P(box(0.05, 0.05, 5.0), s > 0 ? CYAN : PINK, [s * 1.17, 0.62, -0.2]), 2);
    // cage over cab side window
    P(box(0.05, 0.5, 1.6), GLASS, [s * 1.12, 1.95, 1.7]);
    for (let i = 0; i < 6; i++) rod([s * 1.16, 1.7, 0.95 + i * 0.3], [s * 1.16, 2.2, 0.95 + i * 0.3], 0.02, STEEL);
    rod([s * 1.16, 1.95, 0.9], [s * 1.16, 1.95, 2.5], 0.02, STEEL);
    // door seam & handle
    P(box(0.04, 0.8, 0.04), DARK, [s * 1.16, 1.0, 1.0]);
    P(box(0.06, 0.05, 0.3), STEEL, [s * 1.18, 1.25, 0.85]);
    // mirrors
    rod([s * 1.1, 2.0, 2.5], [s * 1.5, 2.1, 2.55], 0.03, STEEL);
    P(box(0.08, 0.3, 0.2), DARK, [s * 1.52, 2.1, 2.55]);
    glow(P(box(0.02, 0.06, 0.18), AMBER, [s * 1.57, 2.2, 2.55]), 1.5);
    // exhaust
    P(cyl(0.07, 1.2, 8), STEEL, [s * 0.6, 2.0, -0.18]);
    // fenders
    P(box(0.5, 0.08, 1.3), STEEL, [s * 1.2, 1.15, 2.1]);
    P(box(0.5, 0.08, 1.3), STEEL, [s * 1.2, 1.15, -1.9]);
    P(box(0.5, 0.08, 1.3), STEEL, [s * 1.2, 1.15, 0.1]);
  }
  // exhausts stacks behind cab
  for (const s of [1, -1]) {
    P(cyl(0.08, 0.9, 8), STEEL, [s * 0.95, 2.1, 0.1]);
    P(cyl(0.1, 0.05, 8), DARK, [s * 0.95, 2.58, 0.1]);
  }

  // ---- roof light bar (neon)
  P(box(2.0, 0.12, 0.3), DARK, [0, 2.5, 2.3]);
  const bars: [number, string][] = [[-0.8, RED], [-0.4, CYAN], [0, PINK], [0.4, CYAN], [0.8, RED]];
  for (const [x, c] of bars) glow(P(box(0.34, 0.1, 0.32), c, [x, 2.58, 2.3]), 2.5);
  for (const s of [1, -1]) glow(P(box(0.05, 0.12, 0.34), AMBER, [s * 1.02, 2.5, 2.3]), 1.8);
  // spot lamps
  for (const s of [1, -1]) {
    P(cyl(0.1, 0.15, 10), DARK, [s * 0.6, 2.5, 1.2], { rotation: [90, 0, 0] });
    glow(P(cyl(0.08, 0.03, 10), "#ffffff", [s * 0.6, 2.5, 1.3], { rotation: [90, 0, 0] }), 2);
  }
  // antennas
  rod([0.9, 2.4, 0.4], [0.9, 3.4, 0.4], 0.015, STEEL);
  P(new THREE.SphereGeometry(0.04, 6, 4), PINK, [0.9, 3.42, 0.4]);
  glow(P(new THREE.SphereGeometry(0.04, 6, 4), PINK, [0.9, 3.42, 0.4]), 3);
  rod([-0.9, 2.4, 0.4], [-0.9, 3.0, 0.4], 0.015, STEEL);

  // ---- water tank (rear deck)
  P(cyl(0.7, 2.4, 12), "#394463", [0, 2.15, -1.7], { rotation: [90, 0, 0], flat: true });
  for (const dz of [-0.8, 0, 0.8]) P(new THREE.TorusGeometry(0.71, 0.05, 5, 14), STEEL, [0, 2.15, -1.7 + dz]);
  for (const dz of [-0.8, 0.8]) P(box(1.6, 0.25, 0.14), DARK, [0, 1.55, -1.7 + dz]);
  P(cyl(0.2, 0.15, 8), STEEL, [0, 2.9, -1.4]);
  P(cyl(0.12, 0.1, 8), DARK, [0, 2.97, -1.4]);
  const lvl = svg(`<svg viewBox="0 0 16 64"><rect width="16" height="64" fill="#0b4a5a"/><rect y="20" width="16" height="44" fill="#22f0ff"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="10" y="${i * 13 + 2}" width="6" height="2" fill="#fff"/>`).join("")}</svg>`, { size: 128 });
  for (const s of [1, -1]) glow(P(new THREE.PlaneGeometry(0.2, 0.9), "#ffffff", [s * 0.72, 2.1, -2.2], { dir: [s, 0, 0], axis: "z", texture: lvl }), 1.5);
  P(box(2.2, 0.8, 0.12), hullPaint, [0, 1.6, -3.05]);
  for (const s of [1, -1]) {
    glow(P(box(0.35, 0.14, 0.05), RED, [s * 0.8, 1.3, -3.03]), 2.5);
    P(cyl(0.12, 0.3, 8), DARK, [s * 0.85, 0.75, -3.15], { rotation: [90, 0, 0] });
  }
  glow(P(box(1.2, 0.06, 0.04), PINK, [0, 1.75, -3.13]), 2.5);

  // ---- water cannon turret
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 2.45, 0.6], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.95, 0.6], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.55, 0.1, 14), STEEL, { bone: chassis, at: [0, 2.43, 0.6] });
  b.part(cyl(0.4, 0.3, 12), hullPaint, { bone: yaw, at: [0, 2.62, 0.6], flat: true });
  for (const s of [1, -1]) b.part(box(0.08, 0.55, 0.5), hullPaint, { bone: yaw, at: [s * 0.3, 2.9, 0.6] });
  b.part(box(0.4, 0.34, 0.8), STEEL, { bone: pitch, at: [0, 2.95, 0.75] });
  b.rod([0, 2.95, 1.1], [0, 2.95, 2.5], 0.12, STEEL, { bone: pitch, sides: 10 });
  b.part(cyl(0.18, 0.5, 10), DARK, { bone: pitch, at: [0, 2.95, 1.5], rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.1, 0.18, 0.35, 10), DARK, { bone: pitch, at: [0, 2.95, 2.62], rotation: [90, 0, 0] });
  glow(b.part(cyl(0.08, 0.04, 10), CYAN, { bone: pitch, at: [0, 2.95, 2.8], rotation: [90, 0, 0] }), 3);
  b.part(new THREE.TorusGeometry(0.16, 0.025, 5, 10), PINK, { bone: pitch, at: [0, 2.95, 1.9] });
  glow(b.part(new THREE.TorusGeometry(0.15, 0.02, 5, 10), PINK, { bone: pitch, at: [0, 2.95, 2.2] }), 2.5);
  b.rod([0.15, 2.8, 0.5], [0.5, 2.6, -0.8], 0.04, DARK, { bone: pitch, sides: 6 }); // hose
  for (const s of [1, -1]) b.part(box(0.1, 0.1, 0.6), STEEL, { bone: pitch, at: [s * 0.25, 2.8, 1.6] });
  b.part(box(0.3, 0.25, 0.3), DARK, { bone: pitch, at: [0.35, 3.15, 0.7] });
  glow(b.part(box(0.1, 0.1, 0.02), RED, { bone: pitch, at: [0.35, 3.17, 0.86] }), 2);

  // ---- wheels
  for (const z of [2.1, -0.1, -2.0])
    for (const s of [1, -1]) {
      const nm = `wheel${z > 1 ? "F" : z > -1 ? "M" : "R"}${s > 0 ? "L" : "R"}`;
      const hub = b.joint(nm, { parent: chassis, at: [s * 1.2, 0.5, z], dir: [s, 0, 0], role: "hinge" });
      const W = (g: THREE.BufferGeometry, col: any, o: any = {}) =>
        b.part(g, col, { bone: hub, at: [s * 1.2, 0.5, z], rotation: [0, 0, 90], ...o });
      W(cyl(0.5, 0.45, 14), "#101118", { flat: true });
      W(cyl(0.34, 0.47, 12), STEEL, { flat: true });
      W(cyl(0.2, 0.52, 8), DARK);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        b.part(cyl(0.025, 0.05, 6), "#9aa", { bone: hub, at: [s * 1.46, 0.5 + 0.12 * Math.cos(a), z + 0.12 * Math.sin(a)], rotation: [0, 0, 90] });
        b.part(box(0.46, 0.09, 0.14), "#0a0a10", { bone: hub, at: [s * 1.2, 0.5 + 0.5 * Math.cos(a), z + 0.5 * Math.sin(a)], rotation: [(a * 180) / Math.PI, 0, 0] });
      }
      glow(b.part(new THREE.TorusGeometry(0.3, 0.018, 4, 14), s > 0 ? PINK : CYAN, { bone: hub, at: [s * 1.44, 0.5, z], rotation: [0, 90, 0] }), 2.5);
    }
  P(cyl(0.12, 6, 8), DARK, [0, 0.55, 0], { rotation: [90, 0, 0] });

  return b.root;
}
