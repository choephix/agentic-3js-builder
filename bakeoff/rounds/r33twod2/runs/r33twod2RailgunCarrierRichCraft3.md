```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "railgun-carrier",
  description: "Six-wheeled railgun carrier braced on four stabiliser legs, low-poly sci-fi military.",
};

const OLIVE = "#4f5a3c";
const DARK = "#23271f";
const TAN = "#8a8a62";
const STEEL = "#6d7580";
const BLACK = "#16181a";
const CYAN = "#5ff2ff";
const WARN = "#e8b020";

export default function build() {
  const b = createBuilder({ name: "railgun-carrier" });
  const R = rng(5);

  const hullPaint = panelled(OLIVE, { size: 0.5, rivets: 0.12 });
  const gunPaint = panelled(metal("iron"), { size: 0.4, rivets: 0 });

  const hullTex = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#e8b020"/><path d="M0 10L10 0H24L0 34ZM0 44L44 0H58L0 64ZM24 64L64 24V38L38 64ZM50 64L64 50V64Z" fill="#16181a"/></svg>`,
    { size: 64 },
  );
  const star = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#d8d8c8"/><path d="M32 10L38 28H56L42 38L47 54L32 44L17 54L22 38L8 28H26Z" fill="#4f5a3c"/></svg>`,
    { size: 128 },
  );

  const root = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });
  const turret = b.joint("turret", { parent: root, at: [0, 1.5, -0.4], dir: [0, 1, 0] });
  const gun = b.joint("gunPitch", { parent: turret, at: [0, 0.55, 0.6], dir: [0, 0, 1], role: "hinge" });

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: any, at: number[], bone: any, extra: any = {}) =>
    b.part(g, c, { bone, at, ...extra });

  // Chassis
  b.frustumBox([0, 1.0, -3.6], [0, 1.0, 3.6], [2.3, 0.8], [2.3, 0.8], { bone: root, color: hullPaint });
  P(box(2.5, 0.25, 6.4), DARK, [0, 0.62, 0], root);
  // front glacis wedge
  b.extrude([[0, 0], [1.1, 0], [0.3, 0.7], [0, 0.7]], { at: [0, 0.85, 3.6], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, color: hullPaint, bone: root });
  // cab
  P(box(2.1, 0.9, 1.5), hullPaint, [0, 1.85, 2.5], root);
  P(box(1.8, 0.4, 0.06), "#203038", [0, 2.0, 3.27], root, { });
  glow(P(box(1.7, 0.3, 0.05), "#79c8e0", [0, 2.02, 3.28], root), 0.6);
  // hazard stripes on cab front and rear
  P(new THREE.PlaneGeometry(2.0, 0.3), "#ffffff", [0, 1.55, 3.26], root, { dir: [0, 0, 1], axis: "z", texture: hullTex });
  P(new THREE.PlaneGeometry(2.3, 0.3), "#ffffff", [0, 0.85, -3.62], root, { dir: [0, 0, -1], axis: "z", texture: hullTex });
  // star emblems on flanks
  for (const s of [1, -1])
    P(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", [s * 1.16, 1.2, 0.5], root, { dir: [s, 0, 0], axis: "z", texture: star });
  // headlights
  for (const s of [1, -1]) glow(P(box(0.3, 0.14, 0.08), "#fff2b0", [s * 0.8, 1.15, 3.95], root), 1.5);
  // side skirts and tool boxes
  for (const s of [1, -1]) {
    P(box(0.12, 0.5, 4.6), TAN, [s * 1.28, 0.95, -0.6], root);
    P(box(0.3, 0.3, 0.8), DARK, [s * 1.3, 1.55, -2.6], root);
    P(box(0.06, 0.5, 0.06), BLACK, [s * 0.7, 2.5, 2.2], root);
  }
  // antenna
  b.rod([0.7, 2.3, 2.0], [0.7, 3.4, 1.9], 0.025, BLACK, { bone: root });
  glow(P(new THREE.SphereGeometry(0.05, 6, 4), "#ff3030", [0.7, 3.42, 1.9], root), 2);
  // engine vents
  for (let i = 0; i < 5; i++) P(box(1.4, 0.04, 0.12), BLACK, [0, 1.42, -2.6 + i * 0.25], root);

  // Wheels: 3 axles x 2
  const axleZ = [2.4, 0, -2.4];
  axleZ.forEach((z, i) => {
    for (const s of [1, -1]) {
      const n = `wheel${i + 1}${s > 0 ? "L" : "R"}`;
      const j = b.joint(n, { parent: root, at: [s * 1.45, 0.55, z], dir: [s, 0, 0], role: "leg" });
      P(box(0.35, 0.18, 0.9), DARK, [s * 1.3, 0.75, z], root);
      b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.5, 12), BLACK, { bone: j, at: [s * 1.5, 0.55, z], dir: [s, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.54, 8), TAN, { bone: j, at: [s * 1.5, 0.55, z], dir: [s, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 6), STEEL, { bone: j, at: [s * 1.5, 0.55, z], dir: [s, 0, 0] });
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        b.part(box(0.52, 0.12, 0.2), "#0c0d0e", { bone: j, at: [s * 1.5, 0.55 + Math.sin(a) * 0.52, z + Math.cos(a) * 0.52], rotation: [(-a * 180) / Math.PI, 0, 0] });
      }
    }
  });
  // mudguards
  for (const s of [1, -1]) for (const z of axleZ) P(box(0.7, 0.1, 1.3), OLIVE, [s * 1.5, 1.2, z], root);

  // Stabiliser legs: 4 deployed outward
  const legPos: [number, number][] = [[1, 1.6], [-1, 1.6], [1, -1.6], [-1, -1.6]];
  legPos.forEach(([s, z], i) => {
    const n = `stab${i + 1}`;
    const hip = b.joint(`${n}Hip`, { parent: root, at: [s * 1.3, 0.95, z], dir: [s, -0.4, 0], role: "leg" });
    const foot = b.joint(`${n}Foot`, { parent: hip, at: [s * 2.1, 0.2, z], dir: [0, -1, 0] });
    b.rod([s * 1.3, 0.95, z], [s * 2.1, 0.45, z], 0.11, STEEL, { bone: hip });
    P(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8), DARK, [s * 1.3, 0.95, z], hip, { dir: [0, 0, 1] });
    b.rod([s * 2.1, 0.5, z], [s * 2.1, 0.12, z], 0.075, metal("steel"), { bone: foot });
    P(new THREE.CylinderGeometry(0.32, 0.4, 0.14, 8), WARN, [s * 2.1, 0.07, z], foot);
    P(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 8), DARK, [s * 2.1, 0.14, z], foot);
  });

  // Turret
  P(new THREE.CylinderGeometry(1.3, 1.45, 0.25, 12), DARK, [0, 1.5, -0.4], turret);
  b.extrude([[-1.0, 0], [1.0, 0], [0.8, 0.8], [-0.8, 0.8]], { at: [0, 1.62, -0.4], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.1, color: hullPaint, bone: turret });
  P(box(2.0, 0.8, 2.2), hullPaint, [0, 2.0, -0.6], turret);
  b.extrude([[-1, 0], [1, 0], [0.7, 0.4], [-0.7, 0.4]], { at: [0, 2.4, -0.6], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.08, color: TAN, bone: turret });
  // capacitor banks on turret rear
  for (const s of [1, -1]) {
    P(new THREE.CylinderGeometry(0.28, 0.28, 1.5, 8), STEEL, [s * 0.65, 2.1, -1.9], turret, { dir: [0, 0, 1] });
    for (let k = 0; k < 4; k++) glow(P(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 8), CYAN, [s * 0.65, 2.1, -1.5 - k * 0.35], turret, { dir: [0, 0, 1] }), 1.4);
  }
  // sensor dome
  P(new THREE.SphereGeometry(0.22, 8, 6), BLACK, [-0.7, 2.5, -0.1], turret);
  glow(P(new THREE.SphereGeometry(0.1, 6, 4), CYAN, [-0.7, 2.58, 0.05], turret), 1.5);
  // cradle
  for (const s of [1, -1]) P(box(0.3, 0.9, 0.6), DARK, [s * 0.75, 2.1, 0.7], turret);

  // Railgun: twin rails
  P(box(0.8, 0.7, 1.4), gunPaint, [0, 0, -0.2], gun);
  for (const s of [1, -1]) {
    b.rod([s * 0.22, 0, 0.4], [s * 0.2, 0, 5.6], 0.16, gunPaint, { bone: gun, sides: 4 } as any);
    b.rod([s * 0.22, 0, 5.5], [s * 0.2, 0, 6.0], 0.12, STEEL, { bone: gun });
  }
  for (const s of [1, -1]) {
    b.rod([s * 0.22, 0.0, 0.4], [s * 0.22, 0.0, 5.6], 0.2, "#00000000" as any, { bone: gun, sides: 4 } as any).mesh.visible = false;
  }
  for (let k = 0; k < 7; k++) {
    const z = 1.0 + k * 0.7;
    P(box(0.8, 0.5, 0.14), k % 2 ? DARK : TAN, [0, 0, z], gun);
    glow(P(box(0.3, 0.06, 0.16), CYAN, [0, 0.0, z], gun), 1.6);
  }
  P(box(0.3, 0.12, 5.2), BLACK, [0, 0.0, 3.0], gun);
  glow(P(box(0.14, 0.14, 0.05), CYAN, [0, 0, 6.05], gun), 2);
  // muzzle brake
  for (const s of [1, -1]) P(box(0.1, 0.5, 0.35), DARK, [s * 0.3, 0, 5.8], gun);

  // Tow hooks
  for (const s of [1, -1]) P(new THREE.TorusGeometry(0.1, 0.03, 4, 8), STEEL, [s * 0.8, 0.7, -3.7], root);
  // Rubble-free ground contact guarantee via chassis; return
  void R;
  return b.root;
}
```