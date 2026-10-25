```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control interceptor with roof water cannon and neon light bars, cyberpunk style.",
};

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

const NAVY = "#1d2a44";
const WHITE = "#e8edf2";
const DARK = "#0f1116";
const TYRE = "#17191c";
const CYAN = "#2bf0ff";
const MAG = "#ff2bd6";
const AMBER = "#ffb000";
const GLASS = "#5fb8d8";

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });
  const r = rng(5);
  const BODY = panelled(NAVY, { size: 0.5, rivets: 0 });
  const STEEL = metal("steel", { tarnish: 0.1 });
  const chassis = b.joint("chassis", { at: [0, 0.6, 0], role: "spine" });
  const C = chassis;

  // lower hull and frame
  b.part(box(2.0, 0.5, 5.4), BODY, { bone: C, at: [0, 0.85, 0] });
  b.part(box(1.9, 0.12, 5.2), DARK, { bone: C, at: [0, 0.52, 0] });
  // sloped hood
  b.frustumBox([0, 1.1, 1.0], [0, 1.0, 2.7], [1.9, 0.25], [1.8, 0.3], { bone: C, color: BODY });
  // cab
  b.part(box(1.9, 0.7, 2.0), BODY, { bone: C, at: [0, 1.45, 0.2] });
  b.part(box(1.7, 0.1, 1.9), WHITE, { bone: C, at: [0, 1.85, 0.2] });
  b.part(box(1.75, 0.45, 0.05), GLASS, { bone: C, at: [0, 1.5, 1.2], rotation: [-25, 0, 0] });
  b.part(box(1.75, 0.4, 0.05), GLASS, { bone: C, at: [0, 1.5, -0.8] });
  for (const s of [1, -1]) {
    b.part(box(0.04, 0.38, 1.7), GLASS, { bone: C, at: [s * 0.96, 1.5, 0.2] });
    b.part(box(0.06, 0.5, 0.1), DARK, { bone: C, at: [s * 0.96, 1.5, 0.2] });
    // mesh grille over windows
    for (let i = 0; i < 6; i++) b.part(box(0.02, 0.4, 0.02), DARK, { bone: C, at: [s * 0.99, 1.5, -0.5 + i * 0.28] });
    // white side stripe
    b.part(box(0.04, 0.12, 4.8), WHITE, { bone: C, at: [s * 1.01, 0.95, 0] });
    b.part(box(0.04, 0.05, 4.8), CYAN, { bone: C, at: [s * 1.02, 0.82, 0] });
    glow(b.part(box(0.03, 0.04, 4.6), CYAN, { bone: C, at: [s * 1.03, 0.82, 0] }), 1.6);
    // armoured fender
    b.part(box(0.25, 0.1, 1.1), DARK, { bone: C, at: [s * 0.97, 1.28, 1.55] });
    b.part(box(0.1, 0.25, 0.3), STEEL, { bone: C, at: [s * 1.0, 1.1, -2.0] });
  }
  // rear box
  b.part(box(2.0, 0.6, 2.4), BODY, { bone: C, at: [0, 1.45, -1.9] });
  b.part(box(1.9, 0.08, 2.3), WHITE, { bone: C, at: [0, 1.78, -1.9] });
  for (let i = 0; i < 4; i++) b.part(box(2.02, 0.06, 0.1), DARK, { bone: C, at: [0, 1.45, -1.2 - i * 0.5] });

  // front ram bumper
  b.part(box(2.1, 0.4, 0.3), DARK, { bone: C, at: [0, 0.7, 2.75] });
  for (let i = 0; i < 6; i++) b.part(box(0.05, 0.5, 0.06), STEEL, { bone: C, at: [-0.75 + i * 0.3, 0.9, 2.95] });
  b.part(box(1.6, 0.06, 0.1), STEEL, { bone: C, at: [0, 1.15, 2.95] });
  b.part(box(0.9, 0.3, 0.05), DARK, { bone: C, at: [0, 0.98, 2.74] });
  // headlights
  for (const s of [1, -1]) {
    b.part(box(0.45, 0.12, 0.1), DARK, { bone: C, at: [s * 0.65, 1.12, 2.72] });
    glow(b.part(box(0.4, 0.05, 0.03), CYAN, { bone: C, at: [s * 0.65, 1.12, 2.78] }), 1.5);
  }
  // rear lights
  glow(b.part(box(1.8, 0.06, 0.04), MAG, { bone: C, at: [0, 1.5, -3.12] }), 1.5);
  b.part(box(1.9, 0.5, 0.06), DARK, { bone: C, at: [0, 0.9, -2.72] });

  // light bar on roof (front)
  b.part(box(1.5, 0.1, 0.22), DARK, { bone: C, at: [0, 1.96, 0.85] });
  glow(b.part(box(0.7, 0.07, 0.24), MAG, { bone: C, at: [-0.38, 1.97, 0.85] }), 1.8);
  glow(b.part(box(0.7, 0.07, 0.24), CYAN, { bone: C, at: [0.38, 1.97, 0.85] }), 1.8);
  // neon underglow
  for (const s of [1, -1]) glow(b.rod([s * 0.9, 0.5, -2.4], [s * 0.9, 0.5, 2.4], 0.02, MAG, { bone: C, sides: 6 }), 1.6);
  // roof neon outline on rear box
  for (const s of [1, -1]) glow(b.rod([s * 0.97, 1.8, -3.0], [s * 0.97, 1.8, -0.9], 0.015, AMBER, { bone: C, sides: 6 }), 1.5);

  // water cannon turret on rear roof
  const yaw = b.joint("yaw", { parent: C, at: [0, 1.84, -1.9], dir: [0, 1, 0], up: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.5, 0.1, 12), STEEL, { bone: C, at: [0, 1.86, -1.9] });
  b.part(cyl(0.38, 0.3, 10), WHITE, { bone: yaw, at: [0, 2.05, -1.9], });
  b.part(box(0.7, 0.35, 0.7), NAVY, { bone: yaw, at: [0, 2.35, -1.9] });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.4, -1.9], dir: [0, 0, 1], role: "hinge" });
  b.rod([0, 2.4, -1.85], [0, 2.45, -0.5], 0.13, STEEL, { bone: pitch, sides: 10 });
  b.rod([0, 2.45, -0.5], [0, 2.46, 0.1], 0.09, DARK, { bone: pitch, sides: 10 });
  b.part(cyl(0.12, 0.08, 10), WHITE, { bone: pitch, at: [0, 2.46, 0.12], rotation: [90, 0, 0] });
  glow(b.part(cyl(0.06, 0.02, 10), CYAN, { bone: pitch, at: [0, 2.46, 0.17], rotation: [90, 0, 0] }), 1.4);
  for (const dz of [-1.2, -0.8, -0.4]) b.part(new THREE.TorusGeometry(0.14, 0.025, 5, 10), STEEL, { bone: pitch, at: [0, 2.43, dz] });
  // hose to tank
  b.rod([0.25, 2.2, -2.1], [0.6, 1.85, -2.6], 0.04, TYRE, { bone: yaw, sides: 6 });
  // tank hatches on rear roof
  for (const dx of [-0.6, 0.6]) b.part(cyl(0.18, 0.08, 10), STEEL, { bone: C, at: [dx, 1.85, -2.7] });

  // roof antenna & camera
  b.spike([0.8, 1.9, 0.0], [0, 1, 0], 1.0, 0.015, STEEL, { bone: C, sides: 5 });
  b.part(new THREE.SphereGeometry(0.12, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, { bone: C, at: [-0.7, 1.9, 0.3] });

  // corporate emblem decals
  const logo = svg(
    `<svg viewBox="0 0 100 100"><polygon points="50,5 92,28 92,72 50,95 8,72 8,28" fill="#0f1116" stroke="#2bf0ff" stroke-width="5"/><path d="M28 62 L50 32 L72 62" fill="none" stroke="#ff2bd6" stroke-width="9"/><path d="M36 76 L50 58 L64 76" fill="none" stroke="#e8edf2" stroke-width="6"/></svg>`,
    { size: 256 },
  );
  const text = svg(
    `<svg viewBox="0 0 200 60"><text x="100" y="44" font-family="Arial Black, Arial" font-weight="900" font-size="44" fill="#e8edf2" text-anchor="middle">RIOT-CTRL</text></svg>`,
    { size: 512 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.55, 0.55), "#ffffff", {
      bone: C, at: [s * 1.025, 1.45, -1.9], dir: [s, 0, 0], axis: "z", texture: logo,
    });
    b.part(new THREE.PlaneGeometry(1.4, 0.42), "#ffffff", {
      bone: C, at: [s * 1.026, 1.2, 0.0], dir: [s, 0, 0], axis: "z", texture: text,
    });
  }
  b.part(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", {
    bone: C, at: [0, 1.45, -3.13], dir: [0, 0, -1], axis: "z", texture: logo,
  });

  // wheels
  for (const [k, s, z] of [["FL", 1, 1.65], ["FR", -1, 1.65], ["RL", 1, -1.65], ["RR", -1, -1.65]] as const) {
    const front = z > 0;
    const steer = front ? b.joint(`steer${k}`, { parent: C, at: [s * 0.9, 0.45, z], dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" }) : C;
    const spin = b.joint(`wheel${k}`, { parent: steer, at: [s * 0.9, 0.45, z], dir: [0, 1, 0], role: "hinge" });
    const x = s * 0.9;
    b.part(cyl(0.45, 0.34, 14), TYRE, { bone: spin, at: [x, 0.45, z], rotation: [0, 0, 90], flat: true });
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      b.part(box(0.36, 0.1, 0.12), TYRE, { bone: spin, at: [x, 0.45 + 0.46 * Math.cos(a), z + 0.46 * Math.sin(a)], rotation: [(a * 180) / Math.PI, 0, 0] });
    }
    b.part(cyl(0.28, 0.36, 10), STEEL, { bone: spin, at: [x, 0.45, z], rotation: [0, 0, 90], flat: true });
    b.part(cyl(0.1, 0.4, 8), DARK, { bone: spin, at: [x, 0.45, z], rotation: [0, 0, 90] });
    glow(b.part(new THREE.TorusGeometry(0.3, 0.015, 5, 16), MAG, { bone: spin, at: [x + s * 0.19, 0.45, z], rotation: [0, 90, 0] }), 1.6);
    // fender arch
    b.part(box(0.4, 0.06, 1.0), DARK, { bone: C, at: [s * 0.92, 0.95, z] });
  }

  // side armour studs & vents
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) b.part(box(0.04, 0.12, 0.3), DARK, { bone: C, at: [s * 1.02, 1.1, -2.4 + i * 0.4 + r() * 0.02] });

  return b.root;
}
```