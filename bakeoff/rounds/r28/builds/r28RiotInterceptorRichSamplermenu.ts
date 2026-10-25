import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control interceptor truck with a roof water cannon and neon light bars, cyberpunk style.",
};

const BODY = "#e8eaf0", TRIM = "#15171f", DARK = "#0b0c11", STEEL = "#6b7280", NEON = "#19e6ff", MAG = "#ff2a9a", AMB = "#ffb020", GLASS = "#1b3a55";

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const chassis = b.joint("chassis", { at: [0, 0.6, 0] });
  const R = rng(5);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 10) => new THREE.CylinderGeometry(r, r, h, s);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) => b.part(g, c, { bone: chassis, at, ...o });

  // decals
  const logo = svg(`<svg viewBox="0 0 100 60"><rect width="100" height="60" fill="#e8eaf0"/><rect y="22" width="100" height="14" fill="#ff2a9a"/><text x="50" y="15" font-size="14" font-weight="bold" text-anchor="middle" fill="#15171f">POLICE</text><text x="50" y="54" font-size="13" font-weight="bold" text-anchor="middle" fill="#15171f">RIOT UNIT</text></svg>`, { size: 256 });
  const chev = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#15171f"/><path d="M0 32 L16 0 L32 0 L16 32Z M32 32 L48 0 L64 0 L48 32Z" fill="#ffb020"/></svg>`, { size: 128 });
  const visor = svg(`<svg viewBox="0 0 100 20"><rect width="100" height="20" fill="#14304a"/><path d="M0 14 L100 4" stroke="#6fd8ff" stroke-width="2"/></svg>`, { size: 128 });

  // frame and body
  put(box(1.7, 0.25, 5.2), TRIM, [0, -0.15, 0]);
  put(box(2.1, 0.7, 5.3), BODY, [0, 0.35, 0]);
  put(box(2.1, 0.15, 5.3), STEEL, [0, 0.02, 0]);
  put(box(1.9, 0.9, 2.0), BODY, [0, 1.1, -0.2]); // cab
  put(box(1.92, 0.5, 1.4), GLASS, [0, 1.25, 0.25]);
  put(box(1.92, 0.5, 0.9), GLASS, [0, 1.25, -0.8]);
  put(box(1.7, 0.4, 1.6), BODY, [0, 0.8, 1.7], { rotation: [0, 0, 0] });
  const ws = put(new THREE.PlaneGeometry(1.7, 0.6), "#ffffff", [0, 1.2, 0.82], { dir: [0, 0.45, 1], axis: "z", texture: visor });
  void ws;
  put(box(1.95, 0.08, 2.1), TRIM, [0, 1.58, -0.2]); // roof
  // hood
  put(box(2.0, 0.3, 1.7), BODY, [0, 0.95, 1.9]);
  put(box(1.9, 0.12, 0.5), TRIM, [0, 1.12, 1.6]);
  // flank decals
  for (const s of [1, -1]) {
    put(new THREE.PlaneGeometry(1.4, 0.45), "#ffffff", [s * 1.06, 0.75, -0.9], { dir: [s, 0, 0], axis: "z", texture: logo });
    put(new THREE.PlaneGeometry(1.2, 0.25), "#ffffff", [s * 1.06, 0.4, 1.4], { dir: [s, 0, 0], axis: "z", texture: chev });
  }
  // front bumper and plough
  put(box(2.3, 0.5, 0.35), TRIM, [0, 0.45, 2.85]);
  put(box(2.0, 0.45, 0.1), STEEL, [0, 0.45, 3.05], { rotation: [15, 0, 0] });
  glow(put(box(1.2, 0.06, 0.04), MAG, [0, 0.55, 3.07]), 1.6);
  for (const s of [1, -1]) {
    glow(put(box(0.4, 0.14, 0.06), NEON, [s * 0.7, 1.0, 2.76]), 2);
    put(box(0.5, 0.2, 0.08), DARK, [s * 0.7, 1.0, 2.73]);
    put(box(0.12, 0.4, 0.7), TRIM, [s * 0.55, 0.55, 3.0], { rotation: [0, s * 25, 0] });
  }
  // grille
  put(box(1.0, 0.35, 0.05), DARK, [0, 0.85, 2.77]);
  for (let i = 0; i < 4; i++) put(box(1.0, 0.03, 0.06), STEEL, [0, 0.75 + i * 0.09, 2.79]);
  // rear
  put(box(2.2, 0.35, 0.3), TRIM, [0, 0.4, -2.75]);
  for (const s of [1, -1]) glow(put(box(0.5, 0.12, 0.05), "#ff2030", [s * 0.7, 0.9, -2.67]), 1.5);
  // wheels
  for (const sx of [1, -1]) for (const z of [1.6, -1.55]) {
    const wp = put(cyl(0.45, 0.38, 14), DARK, [sx * 0.98, -0.18, z], { rotation: [0, 0, 90] });
    void wp;
    put(cyl(0.26, 0.4, 8), STEEL, [sx * 1.0, -0.18, z], { rotation: [0, 0, 90] });
    put(cyl(0.08, 0.44, 6), AMB, [sx * 1.0, -0.18, z], { rotation: [0, 0, 90] });
    put(box(0.12, 0.55, 1.1), BODY, [sx * 1.08, 0.35, z]); // fender flare
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      put(box(0.4, 0.06, 0.06), "#2a2d38", [sx * 1.0, -0.18 + Math.sin(a) * 0.3, z + Math.cos(a) * 0.3]);
    }
  }
  // side skirts + neon
  for (const s of [1, -1]) {
    put(box(0.1, 0.25, 2.2), TRIM, [s * 1.08, 0.15, 0]);
    glow(put(box(0.04, 0.05, 4.6), NEON, [s * 1.12, 0.52, 0]), 2);
    glow(put(box(0.04, 0.04, 2.0), MAG, [s * 0.99, 1.52, -0.2]), 2);
    put(box(0.08, 0.12, 0.3), STEEL, [s * 1.05, 1.15, 0.95]); // mirror
    put(box(0.3, 0.2, 0.05), STEEL, [s * 1.2, 1.3, 1.0]);
  }
  // roof light bar
  put(box(1.7, 0.12, 0.3), TRIM, [0, 1.68, 0.6]);
  for (let i = 0; i < 6; i++) glow(put(box(0.24, 0.1, 0.32), i % 2 ? MAG : NEON, [-0.7 + i * 0.28, 1.74, 0.6]), 2.2);
  // bed / tank
  put(box(1.9, 0.12, 2.3), TRIM, [0, 0.74, -1.7]);
  const tank = put(cyl(0.7, 1.9, 14), BODY, [0, 1.5, -1.7], { rotation: [90, 0, 0] });
  void tank;
  put(cyl(0.72, 0.12, 14), STEEL, [0, 1.5, -0.8], { rotation: [90, 0, 0] });
  put(cyl(0.72, 0.12, 14), STEEL, [0, 1.5, -2.6], { rotation: [90, 0, 0] });
  glow(put(box(0.06, 0.3, 1.5), NEON, [0.73, 1.5, -1.7]), 2);
  glow(put(box(0.06, 0.3, 1.5), NEON, [-0.73, 1.5, -1.7]), 2);
  put(cyl(0.2, 0.25, 8), STEEL, [0, 2.25, -1.7]);
  // water cannon turret
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 2.45, -1.2], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.65, -1.2], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.3, 0.2, 10), STEEL, { bone: yaw, at: [0, 2.4, -1.2] });
  b.part(cyl(0.22, 0.3, 10), TRIM, { bone: yaw, at: [0, 2.6, -1.2] });
  b.part(box(0.5, 0.35, 0.5), BODY, { bone: pitch, at: [0, 2.8, -1.25] });
  b.part(cyl(0.1, 1.5, 10), STEEL, { bone: pitch, at: [0, 2.85, -0.4], rotation: [90, 0, 0] });
  b.part(cyl(0.15, 0.3, 10), TRIM, { bone: pitch, at: [0, 2.85, 0.4], rotation: [90, 0, 0] });
  glow(b.part(cyl(0.09, 0.05, 10), NEON, { bone: pitch, at: [0, 2.85, 0.56], rotation: [90, 0, 0] }), 2.5);
  for (const s of [1, -1]) b.part(box(0.06, 0.25, 0.4), STEEL, { bone: pitch, at: [s * 0.2, 2.7, -1.0] });
  b.part(cyl(0.05, 0.9, 6), STEEL, { bone: pitch, at: [0.25, 2.5, -0.9], rotation: [60, 0, 0] });
  // hose
  b.sweep([[0.2, 2.8, -1.4], [0.5, 2.3, -1.9], [0.7, 1.8, -2.0]] as any, 0.04, { bone: chassis, color: DARK });
  // antenna and sensor
  put(cyl(0.015, 1.0, 5), STEEL, [-0.8, 2.15, 0.1]);
  glow(put(new THREE.SphereGeometry(0.05, 6, 4), MAG, [-0.8, 2.66, 0.1]), 2);
  void R;
  // lowest point: tires sit at y=0 roughly
  return b.root;
}
