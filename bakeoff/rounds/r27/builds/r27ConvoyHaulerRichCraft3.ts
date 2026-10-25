import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Armoured Convoy Hauler",
  description: "Low-poly cyberpunk armoured hauler towing a sealed glowing cargo pod.",
};

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const body = b.joint("body", { at: [0, 0.6, 0] });

  const HULL = panelled(metal("iron"), { size: 0.4 });
  const PLATE = panelled(metal("steel", { tarnish: 0.4 }), { size: 0.3 });
  const DARK = "#14141c";
  const NEON = "#19f0ff";
  const PINK = "#ff2d95";
  const AMBER = "#ffb020";

  const box = (w: number, h: number, d: number, c: any, at: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: body, at, ...opt });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: any, at: number[], opt: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: body, at, ...opt });

  // chassis
  box(2.0, 0.3, 7.2, DARK, [0, 0.5, 0]);
  // cab
  box(1.9, 0.9, 1.7, HULL, [0, 1.15, 2.4]);
  box(1.8, 0.7, 1.2, PLATE, [0, 1.85, 2.2]);
  b.part(new THREE.BoxGeometry(1.5, 0.12, 1.0), PLATE, { bone: body, at: [0, 2.26, 2.2], rotation: [0, 0, 0] });
  // angled prow
  b.part(new THREE.BoxGeometry(1.9, 0.6, 0.9), PLATE, { bone: body, at: [0, 0.95, 3.45], rotation: [-25, 0, 0] });
  box(2.1, 0.22, 0.4, DARK, [0, 0.45, 3.85]);
  // visor windscreen glow
  glow(box(1.5, 0.3, 0.05, NEON, [0, 1.95, 2.83]), 1.4);
  // headlights
  for (const s of [1, -1]) {
    glow(box(0.3, 0.12, 0.06, AMBER, [s * 0.7, 0.95, 3.92]), 1.6);
    glow(box(0.06, 0.05, 1.2, PINK, [s * 1.03, 0.55, 0.8]), 1.3);
    // side armour skirts
    box(0.12, 0.55, 3.2, PLATE, [s * 1.0, 0.85, -0.6]);
    // exhaust stacks
    cyl(0.08, 0.1, 1.5, 6, metal("copper"), [s * 0.95, 2.0, 1.5]);
    cyl(0.11, 0.09, 0.1, 6, DARK, [s * 0.95, 2.78, 1.5]);
    // turret-ish guns on cab sides
    box(0.14, 0.14, 0.9, DARK, [s * 0.5, 2.45, 2.7]);
  }
  // roof turret
  cyl(0.4, 0.5, 0.25, 8, HULL, [0, 2.45, 1.8]);
  box(0.2, 0.2, 1.1, DARK, [0, 2.65, 2.3]);
  glow(box(0.1, 0.1, 0.08, PINK, [0, 2.65, 2.88]), 1.6);

  // light bar
  glow(box(1.2, 0.06, 0.1, PINK, [0, 2.3, 2.9]), 1.5);

  // wheels
  const rubber = "#0c0c10";
  const rr = rng(3);
  for (const s of [1, -1])
    for (const z of [-2.6, -1.4, 1.4, 2.5]) {
      const w = cyl(0.55, 0.55, 0.5, 8, rubber, [s * 1.1, 0.0, z], { rotation: [0, 0, 90] });
      cyl(0.3, 0.3, 0.52, 6, metal("steel"), [s * 1.12, 0.0, z], { rotation: [0, 0, 90] });
      glow(cyl(0.12, 0.12, 0.54, 6, NEON, [s * 1.13, 0.0, z], { rotation: [0, 0, 90] }), 1.2);
      void w;
      void rr;
    }

  // hitch and cargo pod
  box(0.3, 0.2, 1.0, DARK, [0, 0.55, -3.6]);
  const podColor = panelled(metal("blued"), { size: 0.5 });
  box(2.2, 1.8, 4.2, podColor, [0, 1.5, -5.6]);
  // pod chamfered roof
  b.part(new THREE.BoxGeometry(2.0, 0.4, 4.0), PLATE, { bone: body, at: [0, 2.6, -5.6] });
  // pod bands
  for (const z of [-4.2, -5.6, -7.0]) {
    box(2.3, 1.9, 0.14, DARK, [0, 1.5, z]);
    glow(box(2.32, 0.08, 0.16, NEON, [0, 2.3, z]), 1.3);
  }
  // sealed hazard door at rear
  const hazard = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#1a1a22"/><g stroke="#ffb020" stroke-width="8">
<path d="M-10 20 L20 -10 M-10 44 L44 -10 M-10 68 L68 -10 M20 74 L74 20 M44 74 L74 44"/></g>
<rect x="6" y="6" width="52" height="52" fill="none" stroke="#19f0ff" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(1.8, 1.5), "#ffffff", {
    bone: body, at: [0, 1.5, -7.72], dir: [0, 0, -1], axis: "z", texture: hazard,
  });
  // pod wheels
  for (const s of [1, -1])
    for (const z of [-6.4, -5.2]) {
      cyl(0.5, 0.5, 0.45, 8, rubber, [s * 1.1, 0.0, z], { rotation: [0, 0, 90] });
      cyl(0.25, 0.25, 0.47, 6, metal("steel"), [s * 1.12, 0.0, z], { rotation: [0, 0, 90] });
    }
  // antenna
  cyl(0.03, 0.03, 1.6, 5, DARK, [0.7, 3.2, 0.2]);
  glow(b.part(new THREE.SphereGeometry(0.08, 6, 4), PINK, { bone: body, at: [0.7, 4.0, 0.2] }), 2);

  return b.root;
}
