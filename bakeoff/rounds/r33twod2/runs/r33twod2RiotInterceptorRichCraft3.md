```ts
import * as THREE from "three";
import { createBuilder, rng, countershade, paint, noise, smoothstep, mix, svg } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control interceptor with roof water cannon and neon light bars, cyberpunk style.",
};

const HULL = "#1b1e2b";
const DARK = "#0b0c12";
const PINK = "#ff2d8a";
const CYAN = "#19e6ff";
const YEL = "#ffe600";
const RED = "#ff2244";

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const r = rng(5);
  const body = b.joint("body", { at: [0, 0.6, 0] });
  const turret = b.joint("turret", { parent: body, at: [0, 1.55, -0.2], dir: [0, 1, 0] });
  const barrel = b.joint("barrel", { parent: turret, at: [0, 0.25, 0.2], dir: [0, 0.15, 1] });

  const plate = panelled(
    countershade(metal("iron", { tarnish: 0.3 }), "#0a0b10", { level: -0.3 }),
    { size: 0.35, rivets: 0.06 },
  );
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone: o.bone ?? body, at, ...o });

  // main hull: lower tub + tapered cabin
  b.loft(
    [
      { at: [0, 0.6, -2.3], w: 1.9, h: 0.7 },
      { at: [0, 0.65, -0.8], w: 2.1, h: 0.85 },
      { at: [0, 0.65, 0.8], w: 2.1, h: 0.85 },
      { at: [0, 0.58, 2.3], w: 1.7, h: 0.55 },
    ],
    { bone: body, color: plate },
  );
  // cabin
  b.frustumBox([0, 1.05, -1.5], [0, 1.05, 0.5], [1.7, 0.1], [1.5, 0.1], { bone: body, color: plate });
  P(box(1.6, 0.6, 2.0), plate, [0, 1.3, -0.5]);
  // sloped windshield
  const glass = P(box(1.5, 0.5, 0.08), "#0a2b3a", [0, 1.35, 0.55], { rotation: [-30, 0, 0] });
  glow(glass, 0.5);
  // visor slit with text-like emblem
  const emblem = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#111"/><path d="M6 16 L32 4 L58 16 L32 28Z" fill="none" stroke="#ff2d8a" stroke-width="4"/><circle cx="32" cy="16" r="5" fill="#19e6ff"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.7, 0.35), "#ffffff", {
      bone: body, at: [s * 1.071, 0.85, -0.2], dir: [s, 0, 0], axis: "z", texture: emblem,
    });
  }
  // hood armor wedge
  P(box(1.7, 0.2, 1.1), plate, [0, 0.98, 1.6], { rotation: [12, 0, 0] });
  // bull bar
  P(box(1.9, 0.14, 0.18), metal("steel"), [0, 0.5, 2.45]);
  for (const s of [-0.8, -0.4, 0, 0.4, 0.8]) P(box(0.08, 0.4, 0.1), metal("steel"), [s, 0.65, 2.42]);
  // headlights
  for (const s of [1, -1]) {
    glow(P(box(0.4, 0.1, 0.06), "#e8fbff", [s * 0.6, 0.78, 2.3]), 1.5);
  }
  // neon light bars: roof (red/blue strobe) and body strips
  P(box(1.6, 0.14, 0.3), DARK, [0, 1.66, 0.3]);
  glow(P(box(0.75, 0.1, 0.26), RED, [0.4, 1.68, 0.3]), 2);
  glow(P(box(0.75, 0.1, 0.26), CYAN, [-0.4, 1.68, 0.3]), 2);
  for (const s of [1, -1]) {
    glow(P(box(0.05, 0.06, 3.6), PINK, [s * 1.07, 0.5, 0]), 2);
    glow(P(box(0.05, 0.05, 2.2), CYAN, [s * 1.07, 0.95, -0.4]), 1.8);
  }
  glow(P(box(1.7, 0.08, 0.05), RED, [0, 0.9, -2.31]), 2);
  glow(P(box(1.2, 0.05, 0.05), PINK, [0, 0.25, 2.1]), 2);
  // hazard stripes on bumper
  const haz = paint((p) => (Math.floor((p.x + p.y) / 0.12) % 2 ? YEL : "#111"));
  P(box(1.9, 0.12, 0.1), haz, [0, 0.36, 2.35]);
  P(box(1.9, 0.12, 0.1), haz, [0, 0.38, -2.35]);
  // wheels
  const tire = paint((p) => mix("#111", "#222", noise(p, 0.05)));
  for (const s of [1, -1])
    for (const z of [-1.4, 1.3]) {
      P(new THREE.CylinderGeometry(0.5, 0.5, 0.45, 14), tire, [s * 1.1, 0.5 - 0.6 + 0.6 - 0.0, z], { rotation: [0, 0, 90] });
      P(new THREE.CylinderGeometry(0.28, 0.28, 0.48, 10), metal("steel"), [s * 1.12, 0.5, z], { rotation: [0, 0, 90] });
      glow(P(new THREE.TorusGeometry(0.3, 0.025, 6, 16), CYAN, [s * 1.36, 0.5, z], { rotation: [0, 90, 0] }), 2);
      P(box(0.5, 0.12, 1.0), DARK, [s * 0.95, 0.95, z]); // fender
    }
  // side armor skirts + rivet studs
  for (const s of [1, -1]) {
    P(box(0.12, 0.45, 1.3), plate, [s * 1.08, 0.75, -0.05]);
    for (let i = 0; i < 5; i++) P(new THREE.SphereGeometry(0.03, 6, 4), metal("brass"), [s * 1.15, 0.9, -0.6 + i * 0.3]);
  }
  // roof turret: base ring, tank, cannon
  P(new THREE.CylinderGeometry(0.55, 0.65, 0.18, 12), metal("iron"), [0, 1.8, -0.4]);
  P(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 12), plate, [0, 0, 0], { bone: turret });
  P(box(0.7, 0.35, 0.9), plate, [0, 0.35, 0], { bone: turret });
  for (const s of [1, -1]) P(box(0.1, 0.4, 0.5), metal("steel"), [s * 0.4, 0.35, 0.05], { bone: turret });
  glow(P(box(0.5, 0.06, 0.06), CYAN, [0, 0.55, 0.45], { bone: turret }), 2);
  // water tank on rear with level gauge
  P(new THREE.CylinderGeometry(0.4, 0.4, 1.0, 12), metal("blued"), [0, 1.3, -1.9], { rotation: [0, 0, 90] });
  glow(P(box(0.05, 0.5, 0.05), CYAN, [0.0, 1.3, -2.32]), 2);
  for (const x of [-0.3, 0.3]) P(new THREE.TorusGeometry(0.4, 0.03, 6, 14), metal("steel"), [x, 1.3, -1.9], { rotation: [0, 90, 0] });
  // barrel
  b.rod([0, 0, 0], [0, 0, 1.2], 0.1, { bone: barrel, color: metal("steel") });
  b.rod([0, 0, 1.2], [0, 0, 1.6], [0.13, 0.13], { bone: barrel, color: DARK });
  glow(P(new THREE.TorusGeometry(0.12, 0.025, 6, 12), PINK, [0, 0, 1.62], { bone: barrel }), 2.5);
  P(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), metal("iron"), [0, -0.18, 0.5], { bone: barrel, rotation: [90, 0, 0] });
  // antennas
  for (const s of [1, -1]) {
    b.rod([s * 0.7, 1.6, -1.2], [s * 0.7, 2.3, -1.3], 0.012, { color: DARK, bone: body });
    glow(P(new THREE.SphereGeometry(0.04, 6, 4), RED, [s * 0.7, 2.3, -1.3]), 2);
  }
  // front corp logo decal on hood
  b.part(new THREE.PlaneGeometry(0.8, 0.4), "#ffffff", {
    bone: body, at: [0, 1.1, 2.0], dir: [0, 0.9, 0.3], axis: "z", texture: emblem,
  });
  void r; void smoothstep;
  return b.root;
}
```