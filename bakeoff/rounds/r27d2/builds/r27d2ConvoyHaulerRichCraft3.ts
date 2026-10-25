import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured hauler tractor guarding a sealed cargo pod, with neon trim and six big wheels.",
};

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const hull = b.joint("hull", { at: [0, 0.9, 0] });
  const cab = b.joint("cab", { parent: hull, at: [0, 1.2, 1.6], dir: [0, 0, 1] });
  const pod = b.joint("pod", { parent: hull, at: [0, 1.6, -1.6], dir: [0, 0, -1] });

  const ARMOR = panelled(metal("iron"), { size: 0.35, rivets: 0.08 });
  const DARK = "#14141c";
  const PLATE = panelled(metal("blued", { tarnish: 0.4 }), { size: 0.4 });
  const NEON = "#19f0ff";
  const PINK = "#ff2d95";
  const AMBER = "#ffb020";

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, c: any, at: number[], bone: any, opt: any = {}) =>
    b.part(g, c, { bone, at, ...opt });

  // chassis
  put(box(2.2, 0.35, 6.4), DARK, [0, 0.75, 0], hull);
  put(box(2.5, 0.25, 6.0), ARMOR, [0, 0.98, 0], hull);
  // skirts
  for (const s of [1, -1]) {
    put(box(0.12, 0.45, 5.6), PLATE, [s * 1.3, 0.85, 0], hull);
    put(box(0.04, 0.05, 5.4), NEON, [s * 1.37, 0.72, 0], hull);
    glow(b.part(box(0.04, 0.05, 5.4), NEON, { bone: hull, at: [s * 1.37, 0.72, 0] }), 1.6);
  }

  // wheels: 3 axles
  const tyre = new THREE.CylinderGeometry(0.62, 0.62, 0.55, 10);
  const hub = new THREE.CylinderGeometry(0.3, 0.3, 0.58, 6);
  for (const z of [2.1, -0.4, -2.4]) {
    for (const s of [1, -1]) {
      put(tyre, DARK, [s * 1.4, 0.62, z], hull, { dir: [1, 0, 0] });
      put(hub, metal("steel"), [s * 1.42, 0.62, z], hull, { dir: [1, 0, 0] });
      glow(b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 6), PINK, { bone: hull, at: [s * 1.43, 0.62, z], dir: [1, 0, 0] }), 1.4);
    }
    put(new THREE.CylinderGeometry(0.1, 0.1, 2.8, 6), "#444455", [0, 0.62, z], hull, { dir: [1, 0, 0] });
  }

  // cab
  put(box(2.3, 1.1, 1.9), ARMOR, [0, 1.65, 2.0], cab);
  put(box(2.0, 0.7, 1.3), PLATE, [0, 2.45, 1.7], cab);
  // sloped hood/nose
  put(new THREE.CylinderGeometry(0.6, 1.2, 1.3, 4, 1).rotateY(Math.PI / 4), PLATE, [0, 1.55, 3.2], cab, { rotation: [90, 0, 0] });
  // windshield
  const wind = svg(
    `<svg viewBox="0 0 100 40"><rect width="100" height="40" fill="#0b2a3a"/><path d="M0 40 L30 0 L45 0 L15 40Z M55 40 L85 0 L95 0 L65 40Z" fill="#19f0ff" opacity="0.35"/><rect y="34" width="100" height="6" fill="#ff2d95"/></svg>`,
  );
  b.part(new THREE.PlaneGeometry(1.8, 0.62), "#ffffff", { bone: cab, at: [0, 2.5, 2.37], dir: [0, 0.3, 1], axis: "z", texture: wind });
  // headlights
  for (const s of [1, -1]) {
    glow(b.part(box(0.45, 0.14, 0.1), "#fffbd0", { bone: cab, at: [s * 0.75, 1.55, 3.6] }), 2);
    // armoured bull bar
    put(box(0.12, 0.7, 0.2), DARK, [s * 0.9, 1.1, 3.75], cab);
    // exhaust stacks
    put(new THREE.CylinderGeometry(0.1, 0.12, 1.6, 6), metal("copper"), [s * 1.2, 2.5, 1.0], cab);
    put(new THREE.CylinderGeometry(0.13, 0.1, 0.12, 6), DARK, [s * 1.2, 3.35, 1.0], cab);
    // mirrors
    put(box(0.1, 0.35, 0.2), DARK, [s * 1.3, 2.3, 2.7], cab);
  }
  put(box(2.0, 0.25, 0.3), DARK, [0, 0.95, 3.85], cab);
  // light bar
  glow(b.part(box(1.4, 0.1, 0.12), AMBER, { bone: cab, at: [0, 3.0, 2.0] }), 1.5);
  // roof turret
  put(new THREE.CylinderGeometry(0.4, 0.5, 0.25, 8), PLATE, [0, 3.0, 1.2], cab);
  put(box(0.3, 0.25, 0.6), ARMOR, [0, 3.2, 1.3], cab);
  b.rod([0.1, 3.2, 1.6], [0.1, 3.2, 2.4], 0.05, DARK, { bone: cab });
  b.rod([-0.1, 3.2, 1.6], [-0.1, 3.2, 2.4], 0.05, DARK, { bone: cab });

  // cargo pod
  put(box(2.4, 1.9, 3.8), PLATE, [0, 2.1, -1.6], pod);
  put(box(2.6, 0.2, 4.0), ARMOR, [0, 3.1, -1.6], pod);
  put(box(2.6, 0.2, 4.0), ARMOR, [0, 1.2, -1.6], pod);
  const seal = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#ff2d95" stroke-width="5"/><path d="M32 12 L50 44 L14 44Z" fill="none" stroke="#19f0ff" stroke-width="4"/><circle cx="32" cy="36" r="4" fill="#ffb020"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    glow(b.part(new THREE.PlaneGeometry(1.5, 1.5), "#ffffff", { bone: pod, at: [s * 1.22, 2.1, -1.6], dir: [s, 0, 0], axis: "z", texture: seal }), 1.3);
    for (const z of [-0.3, -1.6, -2.9]) {
      glow(b.part(box(0.06, 1.7, 0.08), NEON, { bone: pod, at: [s * 1.22, 2.1, z - 0.6] }), 1.2);
    }
  }
  // rear door
  put(box(2.0, 1.5, 0.15), DARK, [0, 2.1, -3.55], pod);
  glow(b.part(box(1.6, 0.08, 0.1), PINK, { bone: pod, at: [0, 2.1, -3.65] }), 1.6);
  // lock bolts
  const bolts = [];
  for (let i = 0; i < 6; i++)
    bolts.push(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 6).rotateZ(Math.PI / 2).translate(1.27, 3.1, -0.2 - i * 0.6));
  b.part(mergeGeometries(bolts)!, metal("brass"), { bone: pod, at: [0, 0, 0] });
  // antenna
  const r = rng(3);
  for (let i = 0; i < 3; i++) {
    const x = (r() - 0.5) * 1.6;
    b.rod([x, 3.2, -2.5], [x, 3.9 + r() * 0.6, -2.5], 0.03, "#999999", { bone: pod });
    glow(b.part(new THREE.SphereGeometry(0.07, 5, 4), PINK, { bone: pod, at: [x, 4.0 + i * 0.2, -2.5] }), 2);
  }

  // coupling
  put(box(0.6, 0.3, 1.0), DARK, [0, 1.15, -0.1], hull);
  // rear tail lights
  for (const s of [1, -1]) glow(b.part(box(0.4, 0.15, 0.1), "#ff1a1a", { bone: hull, at: [s * 0.9, 0.9, -3.25] }), 1.8);

  return b.root;
}
