import * as THREE from "three";
import { createBuilder, rng, countershade, paint, svg, noise, smoothstep, mix } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control armored interceptor with roof water cannon and neon light bars, cyberpunk style.",
};

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const R = rng(5);
  const body = b.joint("body", { at: [0, 0.6, 0] });
  const turret = b.joint("turret", { parent: body, at: [0, 1.75, -0.2], dir: [0, 0, 1], role: "hinge" });
  const barrel = b.joint("barrel", { parent: turret, at: [0, 1.85, 0.1], dir: [0, 0, 1], role: "hinge" });

  const NEON = "#19f0ff", PINK = "#ff2d95", YEL = "#ffe600", DARK = "#15161d", RUBBER = "#0b0b0f";
  const HULL = panelled(countershade(metal("iron", { tarnish: 0.2 }), "#1d2030", { level: -0.2 }), { size: 0.4, rivets: 0.06 });
  const WHITE = panelled(mix("#d8dce8", "#aeb4c8", 0.3), { size: 0.45, rivets: 0.08 });
  const hazard = paint((p) => (Math.floor((p.x + p.z) / 0.12) % 2 ? YEL : DARK));
  const dirt = paint((p, n) => mix("#2a2d3c", "#0e0f14", smoothstep(0.3, 0.8, noise(p, 0.3, 2)) * (1 - n.y * 0.5)));

  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: body, at, ...o });

  // chassis
  b.loft(
    [
      { at: [0, 0.75, -2.5], w: 1.9, h: 0.5 },
      { at: [0, 0.95, -1.2], w: 2.2, h: 0.9 },
      { at: [0, 1.0, 1.0], w: 2.2, h: 0.85 },
      { at: [0, 0.82, 2.4], w: 1.9, h: 0.55 },
    ],
    { bone: body, color: HULL },
  );
  // cabin
  box(1.9, 0.7, 2.2, WHITE, [0, 1.65, -0.4]);
  box(1.7, 0.45, 1.0, DARK, [0, 1.55, 1.1], { rotation: [-18, 0, 0] });
  // windshield glow
  glow(b.part(new THREE.PlaneGeometry(1.5, 0.4), "#0a2a3a", { bone: body, at: [0, 1.75, 0.72], dir: [0, 0.2, 1], axis: "z" }), 0.8);
  // front bumper & ram plate
  box(2.3, 0.4, 0.35, DARK, [0, 0.55, 2.55]);
  box(2.0, 0.28, 0.1, hazard, [0, 0.55, 2.74]);
  for (const s of [1, -1]) {
    // headlights
    glow(box(0.5, 0.1, 0.06, "#ffffff", [s * 0.75, 0.95, 2.62]), 2);
    // side armor + neon strips
    box(0.1, 0.5, 4.2, WHITE, [s * 1.14, 1.0, -0.2]);
    glow(box(0.04, 0.06, 4.0, NEON, [s * 1.2, 0.8, -0.2]), 2);
    glow(box(0.04, 0.06, 2.8, PINK, [s * 1.2, 1.25, -0.2]), 2);
    // fenders
    box(0.3, 0.12, 1.2, DARK, [s * 1.05, 1.45, 1.2]);
    // wheels
    for (const z of [1.5, -1.6]) {
      const w = b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.45, 14), RUBBER, {
        bone: body, at: [s * 1.1, 0.55, z], dir: [1, 0, 0],
      });
      b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.47, 8), dirt, { bone: body, at: [s * 1.1, 0.55, z], dir: [1, 0, 0] });
      glow(b.part(new THREE.TorusGeometry(0.33, 0.025, 6, 16), NEON, { bone: body, at: [s * (1.1 + 0.24), 0.55, z], dir: [1, 0, 0], axis: "z" }), 2);
      void w;
    }
    // mirrors
    box(0.12, 0.25, 0.1, DARK, [s * 1.1, 1.8, 0.8]);
  }
  // roof light bar
  box(1.8, 0.12, 0.3, DARK, [0, 2.07, 0.3]);
  glow(box(0.8, 0.1, 0.32, "#ff1a3a", [0.45, 2.1, 0.3]), 3);
  glow(box(0.8, 0.1, 0.32, "#1a4bff", [-0.45, 2.1, 0.3]), 3);
  // rear light bar and tail
  glow(box(2.0, 0.08, 0.06, "#ff1030", [0, 1.0, -2.52]), 2);
  box(2.0, 0.5, 0.2, hazard, [0, 0.6, -2.55]);
  // water tank on rear roof
  b.part(new THREE.CylinderGeometry(0.6, 0.6, 1.6, 12), WHITE, { bone: body, at: [0, 2.2, -1.3], dir: [0, 0, 1] });
  glow(b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.08, 12), NEON, { bone: body, at: [0, 2.2, -1.0], dir: [0, 0, 1] }), 2);
  // decal emblem
  const logo = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#111" stroke="${PINK}" stroke-width="4"/><path d="M32 12 L50 44 H14Z" fill="none" stroke="${NEON}" stroke-width="4"/><circle cx="32" cy="36" r="4" fill="${YEL}"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    glow(b.part(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", { bone: body, at: [s * 1.2, 1.5, -0.2], dir: [s, 0, 0], axis: "z", texture: logo }), 1);

  // turret
  b.part(new THREE.CylinderGeometry(0.4, 0.5, 0.25, 10), DARK, { bone: turret, at: [0, 2.05, -0.2] });
  b.part(new THREE.BoxGeometry(0.6, 0.4, 0.8), WHITE, { bone: turret, at: [0, 2.3, -0.2] });
  // cannon
  b.part(new THREE.CylinderGeometry(0.12, 0.15, 1.4, 10), HULL, { bone: barrel, at: [0, 2.4, 0.7], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.2, 10), YEL, { bone: barrel, at: [0, 2.4, 1.35], dir: [0, 0, 1] });
  glow(b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 10), NEON, { bone: barrel, at: [0, 2.4, 1.47], dir: [0, 0, 1] }), 3);
  b.rod([0, 2.1, -0.9], [0, 2.3, -0.3], 0.05, DARK, { bone: turret });
  // antennae
  for (const s of [1, -1]) {
    b.rod([s * 0.8, 2.05, -1.9], [s * 0.85, 2.9, -2.0], 0.015, DARK, { bone: body });
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), PINK, { bone: body, at: [s * 0.85, 2.92, -2.0] }), 3);
  }
  // floor neon underglow
  glow(box(1.8, 0.04, 3.8, NEON, [0, 0.22, 0]), 2);
  void R;
  return b.root;
}
