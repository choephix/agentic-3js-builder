```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, limb, paint, mix, noise, smoothstep, svg, frame } from "agentic-3js-builder";

export const meta = {
  name: "Capybara with Bird",
  description: "A whimsical, chunky capybara with a blunt muzzle, tiny ears, and a round little bird napping on its head.",
};

const FUR = "#a8703c", FUR_D = "#6e4223", FUR_L = "#d09a58", BELLY = "#d8b078";
const NOSE = "#3a2418", DARK = "#1c120c", CREAM = "#fff1d0";
const BIRD = "#4aa8d8", BIRD_L = "#bfe8f6", BEAK = "#ffb02e", PINK = "#d98a7a";

const coat = paint((p, n) => {
  let c = mix(FUR_D, FUR, smoothstep(-0.4, 0.5, n.y));
  c = mix(c, FUR_L, smoothstep(0.6, 0.95, n.y) * (0.3 + 0.5 * noise(p, 0.1, 3)));
  c = mix(c, BELLY, smoothstep(-0.5, -0.9, n.y) * 0.8);
  c = mix(c, FUR_D, smoothstep(0.6, 0.8, noise(p, 0.05, 7)) * 0.25);
  return mix(c, "#4a2c18", smoothstep(0.14, 0.02, p.y) * 0.8);
});

const TUFT = svg(`<svg viewBox="0 0 32 48"><polygon points="2,48 10,48 5,4" fill="#fff"/><polygon points="10,48 22,48 16,0" fill="#ddd"/><polygon points="22,48 30,48 27,8" fill="#fff"/></svg>`, { size: 96 });
const EYE = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#1c120c"/><circle cx="24" cy="23" r="10" fill="#fff"/><circle cx="41" cy="42" r="4.5" fill="#fff"/></svg>`, { size: 96 });
const BIRDEYE = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#111"/><circle cx="24" cy="23" r="9" fill="#fff"/></svg>`, { size: 64 });

export default function build() {
  const b = createBuilder({ name: "capybara" });
  const rand = rng(5);

  const hips = b.joint("hips", { at: [0, 0.4, -0.3], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.4, -0.3], [0, 0.42, 0.1], [0, 0.45, 0.4]]), { parent: hips, names: ["spine1", "chest"], role: "spine" });
  const chest = spine.joints[1];
  const head = b.joint("head", { parent: chest, at: [0, 0.5, 0.5], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.34, 0.6], aim: [0, 0.32, 0.8], role: "jaw" });

  const body = b.loft([
    { at: [0, 0.38, -0.55], w: 0.4, h: 0.4 },
    { at: [0, 0.4, -0.3], w: 0.52, h: 0.5 },
    { at: [0, 0.42, 0.1], w: 0.5, h: 0.5 },
    { at: [0, 0.46, 0.4], w: 0.4, h: 0.44 },
  ], { bone: [hips, spine], color: coat, sides: 10 });

  // head
  const skull = b.loft([
    { at: [0, 0.52, 0.42], w: 0.34, h: 0.34 },
    { at: [0, 0.5, 0.6], w: 0.32, h: 0.33 },
    { at: [0, 0.46, 0.76], w: 0.3, h: 0.3 },
  ], { bone: head, color: coat, sides: 10 });
  b.part(new THREE.BoxGeometry(0.28, 0.24, 0.12), coat, { bone: head, at: [0, 0.42, 0.82] });
  b.part(new THREE.BoxGeometry(0.2, 0.06, 0.1), NOSE, { bone: head, at: [0, 0.47, 0.88] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.018, 5, 4), DARK, { bone: head, at: [s * 0.05, 0.5, 0.94], scale: [1, 0.6, 0.6] });
    b.part(new THREE.SphereGeometry(0.045, 8, 6), coat, { bone: head, at: [s * 0.1, 0.6, 0.5] });
    b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", { bone: head, at: [s * 0.158, 0.55, 0.64], dir: [s * 0.9, 0, 0.45], axis: "z", texture: EYE });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), PINK, { bone: head, at: [s * 0.1, 0.6, 0.52], scale: [1, 1, 0.5] });
    b.part(new THREE.SphereGeometry(0.035, 6, 4), FUR_D, { bone: head, at: [s * 0.16, 0.57, 0.7], scale: [0.5, 0.5, 1.3] });
  }
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.14), FUR_L, { bone: jaw, at: [0, 0.34, 0.76] });
  b.part(new THREE.BoxGeometry(0.03, 0.02, 0.01), CREAM, { bone: head, at: [0, 0.37, 0.88] });

  // legs
  for (const s of [1, -1]) {
    for (const front of [true, false]) {
      const z = front ? 0.28 : -0.5;
      const pts = limb([s * 0.2, 0.32, z], [s * 0.2, 0.05, z + 0.02], [0.15, 0.14], [[0, 0, front ? -1 : 1]]);
      const nm = front ? ["shoulder", "elbow", "hand"] : ["hip", "knee", "foot"];
      const leg = b.chain(`leg${front ? "F" : "H"}${s > 0 ? "L" : "R"}`, pts, {
        parent: front ? chest : hips, names: nm.map((n) => n + (s > 0 ? "L" : "R")), role: "leg", contact: [s * 0.2, 0, z],
      });
      b.sweep(leg, [0.1, 0.07, 0.06], { color: coat, sides: 8 });
      b.part(new THREE.BoxGeometry(0.13, 0.05, 0.17), FUR_D, { bone: leg.tip!, at: [s * 0.2, 0.025, z + 0.05] });
      for (const k of [-1, 0, 1]) b.part(new THREE.SphereGeometry(0.02, 5, 4), DARK, { bone: leg.tip!, at: [s * 0.2 + k * 0.04, 0.025, z + 0.14] });
    }
  }

  // tail nub
  b.part(new THREE.SphereGeometry(0.05, 6, 4), FUR_D, { bone: hips, at: [0, 0.42, -0.74] });

  // fur tufts
  const skin = b.surface(body);
  b.cards(skin.scatter(90, { rng: rand, minDist: 0.08, filter: (h) => h.n.y > -0.2 }), TUFT, { size: [0.04, 0.07], lean: 70, vary: 0.3, rng: rand, color: FUR_L });

  // bird on head
  const bb = b.joint("bird", { parent: head, at: [0, 0.69, 0.52], dir: [0, 1, 0], role: "hinge" });
  b.part(new THREE.SphereGeometry(0.085, 10, 8), BIRD, { bone: bb, at: [0, 0.77, 0.52], scale: [1, 0.95, 1.1] });
  b.part(new THREE.SphereGeometry(0.06, 8, 6), BIRD_L, { bone: bb, at: [0, 0.74, 0.57], scale: [1, 0.8, 0.8] });
  b.part(new THREE.ConeGeometry(0.02, 0.05, 5), BEAK, { bone: bb, at: [0, 0.78, 0.62], dir: [0, 0, 1] });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.03, 0.03), "#ffffff", { bone: bb, at: [s * 0.045, 0.8, 0.585], dir: [s * 0.5, 0, 1], axis: "z", texture: BIRDEYE });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), BIRD, { bone: bb, at: [s * 0.08, 0.76, 0.5], scale: [0.4, 0.8, 1.2] });
  }
  b.part(new THREE.ConeGeometry(0.03, 0.09, 4), BIRD, { bone: bb, at: [0, 0.76, 0.43], dir: [0, 0.3, -1] });
  for (const k of [0, 1, 2]) b.cards([frame([(k - 1) * 0.015, 0.84, 0.5], [0, 1, 0])], TUFT, { size: [0.025, 0.05], lean: 20 + k * 5, color: "#ff6a8a" });

  b.pose(jaw, { axis: [1, 0, 0], deg: 4 });
  return b.root;
}
```