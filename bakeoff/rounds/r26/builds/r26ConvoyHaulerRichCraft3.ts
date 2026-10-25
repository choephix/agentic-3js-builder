import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured hauler tractor towing a sealed cargo pod, with neon trim.",
};

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const body = b.joint("body", { at: [0, 0.8, 0], role: "spine" });

  const HULL = panelled(metal("iron"), { size: 0.4, rivets: 0.08 });
  const HULL2 = panelled(metal("steel", { tarnish: 0.4 }), { size: 0.5, rivets: 0.1 });
  const DARK = "#14141c";
  const CYAN = "#22f0ff";
  const PINK = "#ff2d95";
  const AMBER = "#ffb02e";
  const TIRE = "#101014";

  const box = (w: number, h: number, d: number, c: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: body, at, ...opts });

  // chassis
  box(2.2, 0.35, 8.4, DARK, [0, 0.6, -0.4]);

  // cab (front is +Z)
  box(2.2, 1.1, 2.0, HULL, [0, 1.35, 2.6]);
  box(2.0, 0.7, 1.4, HULL2, [0, 2.2, 2.3]);
  // sloped hood
  b.frustumBox([0, 1.0, 3.2], [0, 1.0, 4.2], [2.1, 0.9], [1.7, 0.6], { bone: body, color: HULL2 });
  // windscreen
  glow(box(1.8, 0.4, 0.05, CYAN, [0, 2.25, 3.02]), 0.8);
  for (const s of [1, -1]) {
    box(0.05, 0.4, 1.0, CYAN, [s * 1.02, 2.25, 2.4]);
    // headlights
    glow(box(0.4, 0.18, 0.08, AMBER, [s * 0.7, 1.05, 4.26]), 1.6);
    // armour side skirts
    box(0.12, 0.5, 6.4, HULL2, [s * 1.15, 0.65, -0.8]);
    // neon strip
    glow(box(0.05, 0.08, 6.2, s > 0 ? PINK : CYAN, [s * 1.22, 0.9, -0.8]), 1.5);
    // exhaust stacks
    b.rod([s * 1.2, 1.0, 1.7], [s * 1.2, 3.1, 1.7], 0.09, { bone: body, color: metal("copper") });
    b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 8), DARK, { bone: body, at: [s * 1.2, 3.12, 1.7] });
  }
  // bull bar
  box(2.3, 0.3, 0.2, DARK, [0, 0.75, 4.35]);
  box(2.3, 0.1, 0.22, PINK, [0, 0.95, 4.37]);
  // roof light bar
  glow(box(1.6, 0.1, 0.2, PINK, [0, 2.62, 2.7]), 1.4);
  // grille drawing
  const grille = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0a0a10"/>${[4, 12, 20, 28]
      .map((y) => `<rect x="3" y="${y - 2}" width="58" height="3" fill="#22f0ff"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(1.5, 0.7), "#ffffff", { bone: body, at: [0, 1.0, 4.52], dir: [0, 0, 1], axis: "z", texture: grille });

  // fifth wheel + cargo pod
  box(1.8, 0.2, 1.6, metal("bronze"), [0, 0.85, -1.6]);
  const pod = b.lathe(
    [[0, -3.2], [1.0, -3.2], [1.25, -2.6], [1.3, 1.6], [1.0, 2.8], [0, 3]],
    { at: [0, 1.1, 0], axis: [0, 0, 1], bone: body, color: HULL, segments: 8 } as any,
  );
  void pod;
  // pod bands + lights
  const r = rng(3);
  for (let i = 0; i < 6; i++) {
    const z = -3.3 + i * 1.15;
    box(2.7, 2.7, 0.12, HULL2, [0, 2.45, z + 0.0], {});
    glow(box(0.9, 0.08, 0.14, i % 2 ? PINK : CYAN, [0, 3.85, z]), 1.5);
  }
  void r;
  // pod emblem
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#ff2d95" stroke-width="5"/><path d="M32 12 L50 44 H14Z" fill="none" stroke="#22f0ff" stroke-width="5"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    glow(
      b.part(new THREE.PlaneGeometry(1.5, 1.5), "#ffffff", {
        bone: body, at: [s * 1.33, 2.5, -0.6], dir: [s, 0, 0], axis: "z", texture: emblem,
      }),
      1,
    );
  // seal hatch
  box(1.2, 0.12, 1.2, DARK, [0, 3.8, -1.5]);
  glow(box(0.4, 0.14, 0.4, AMBER, [0, 3.84, -1.5]), 1.6);

  // wheels
  const axles = [3.2, 1.2, -2.2, -3.5, -4.8];
  for (const z of axles)
    for (const s of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.55, 10), TIRE, { bone: body, at: [s * 1.25, 0.62, z], dir: [1, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.58, 6), metal("steel"), { bone: body, at: [s * 1.25, 0.62, z], dir: [1, 0, 0] });
      glow(b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 6), CYAN, { bone: body, at: [s * 1.25, 0.62, z], dir: [1, 0, 0] }), 1.2);
    }
  // rear lights
  for (const s of [1, -1]) glow(box(0.4, 0.15, 0.08, "#ff2020", [s * 0.7, 1.0, -5.3]), 1.5);
  box(2.2, 0.4, 0.2, HULL2, [0, 0.9, -5.2]);

  // lift so wheels touch floor: wheel bottom at 0
  return b.root;
}
