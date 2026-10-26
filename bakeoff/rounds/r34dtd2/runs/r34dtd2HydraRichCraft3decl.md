```ts
import * as THREE from "three";
import { createBuilder, catmull, rng, countershade, scales, mottle, svg, aim, offset } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Five-headed hydra",
  description: "Scarred, armoured God of War style hydra with five snake necks, glowing eyes and a thick tail.",
};

const SCALE_D = "#2a3a2c";
const SCALE_L = "#5d7a4a";
const BELLY = "#c9b27a";
const BONE = "#d8cfae";
const IRON = "#3a3a42";
const RED = "#c8321a";
const EYE = "#ffb02a";
const INK = "#150f0c";

export default function build() {
  const b = createBuilder({ name: "hydra" });
  const R = rng(11);
  const hide = countershade(scales(["#2f4a34", "#3a5a3c", "#26402e"], "#121c14", { size: 0.16, seed: 2 }), BELLY, { level: -0.35 });
  const neckHide = countershade(scales([SCALE_D, SCALE_L], "#121c14", { size: 0.1, seed: 4 }), BELLY, { level: -0.5 });
  const rock = mottle("#4a4640", "#6a645a", { size: 0.5, seed: 3 });

  // skeleton
  const hips = b.joint("hips", { at: [0, 1.2, -0.9], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 1.4, 0.2], aim: [0, 1.5, 0.9], role: "spine" });

  // body
  const bodyChain = b.chain("spine", catmull([[0, 1.2, -1.0], [0, 1.35, 0], [0, 1.5, 0.8]]), { parent: hips, role: "spine", names: ["spine1", "spine2"] });
  b.sweep(bodyChain, (t) => [0.8 - 0.1 * t, 0.7], { color: hide, shift: [0, 0.05] });

  // tail
  const tail = b.chain("tail", catmull([[0, 1.2, -1.2], [0, 1.0, -2.2], [0.3, 0.6, -3.2], [-0.2, 0.35, -4.1]]), { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"] });
  b.sweep(tail, (t) => 0.55 * (1 - t) + 0.05, { color: hide, caps: "point" });
  b.along(tail, 6, (at) => b.spike(at, at, 0.2, 0.06, { color: BONE }));

  // legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(`leg${side}`, catmull([[s * 0.6, 1.1, -0.9], [s * 0.85, 0.6, -0.8], [s * 0.85, 0.18, -0.6]]), { parent: hips, role: "leg", names: [`hip${side}`, `knee${side}`, `ankle${side}`] });
    b.sweep(leg, [0.3, 0.14], { color: neckHide });
    b.part(new THREE.BoxGeometry(0.4, 0.12, 0.6), IRON, { at: [s * 0.85, 0.06, -0.5], bone: leg.tip! });
    for (let i = -1; i <= 1; i++)
      b.spike([s * 0.85 + i * 0.12, 0.08, -0.15], [0, 0, 1], 0.18, 0.04, { color: BONE, bone: leg.tip! });
    const arm = b.chain(`arm${side}`, catmull([[s * 0.7, 1.4, 0.7], [s * 1.0, 0.8, 0.8], [s * 0.95, 0.15, 0.9]]), { parent: chest, role: "arm", names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`] });
    b.sweep(arm, [0.28, 0.13], { color: neckHide });
    b.part(new THREE.BoxGeometry(0.4, 0.12, 0.5), IRON, { at: [s * 0.95, 0.06, 1.0], bone: arm.tip! });
    // shoulder armour
    b.part(new THREE.SphereGeometry(0.4, 7, 5, 0, Math.PI * 2, 0, Math.PI / 2), IRON, { at: [s * 0.75, 1.55, 0.6], bone: chest });
    b.spike([s * 0.8, 1.9, 0.6], [s * 0.4, 1, 0], 0.4, 0.07, { color: BONE, bone: chest });
  }

  // back plates + scars
  b.along(bodyChain, 7, (at) => {
    b.stick(new THREE.ConeGeometry(0.1, 0.35, 5), BONE, at.moved([0, 0, 0]), { embed: 0.2 });
  }, { from: 0.05, to: 0.95 });
  b.part(new THREE.BoxGeometry(1.5, 0.12, 0.3), IRON, { at: [0, 1.0, 0.3], bone: chest });
  for (const z of [-0.4, 0.3, 0.9])
    b.part(new THREE.TorusGeometry(0.78, 0.04, 5, 10), IRON, { at: [0, 1.4, z], dir: [0, 0, 1], axis: "z", bone: z > 0 ? chest : hips });

  // necks & heads
  const eyeTex = svg(`<svg viewBox="0 0 40 24"><path d="M2 12 Q20 -2 38 12 Q20 22 2 12Z" fill="#ffb02a" stroke="#150f0c" stroke-width="3"/><rect x="18" y="3" width="5" height="18" rx="2" fill="#150f0c"/></svg>`, { size: 128 });
  const N = 5;
  for (let i = 0; i < N; i++) {
    const a = (i - 2) / 2; // -1..1
    const x0 = a * 0.55;
    const reach = 1.2 + (i % 2 === 0 ? 0.5 : 0) + (i === 2 ? 0.4 : 0);
    const pts = [
      [x0, 1.8, 0.7],
      [x0 * 1.3, 2.4 + 0.2 * i % 3, 1.0],
      [x0 * 2.2, 3.0 + reach * 0.3, 1.3 + (i % 2) * 0.3],
      [x0 * 2.8, 3.3 + reach * 0.35, 2.0 + reach * 0.5],
    ];
    const nk = b.chain(`neck${i}`, catmull(pts), { parent: chest, role: "neck", names: [`neck${i}a`, `neck${i}b`, `neck${i}c`] });
    b.sweep(nk, (t) => 0.3 - 0.12 * t, { color: neckHide, sectors: [[125, 235, BELLY]] });
    b.along(nk, 3, (at) => b.spike(at, at, 0.12, 0.04, { color: BONE }));
    const e = nk.at(1);
    const dir = e.tangent.clone().setY(e.tangent.y * 0.2 - 0.25).normalize();
    const head = b.joint(`head${i}`, { parent: nk.tip ?? nk.joints[2], at: e.at, dir, role: "head" });
    const jaw = b.joint(`jaw${i}`, { parent: head, at: head.local([0, 0.05, -0.05]), dir: head.dir([0, 1, -0.1]), role: "jaw" });
    b.part(new THREE.BoxGeometry(0.36, 0.22, 0.2), SCALE_D, { bone: head, at: head.local([0, 0.0, 0.0]), aim: undefined as any });
    b.frustumBox(head.local([0, 0.05, 0.02]), head.local([0, 0.5, 0.0]), [0.34, 0.2], [0.2, 0.12], { bone: head, color: neckHide });
    b.frustumBox(jaw.local([0, 0.05, -0.06]), jaw.local([0, 0.48, -0.06]), [0.3, 0.07], [0.16, 0.05], { bone: jaw, color: BELLY });
    b.pose(jaw, { axis: [1, 0, 0], deg: 18 });
    for (const s of [1, -1]) {
      // eyes
      b.part(new THREE.PlaneGeometry(0.16, 0.1), "#ffffff", { bone: head, at: head.local([s * 0.18, 0.12, 0.1]), dir: head.dir([s, 0.1, 0.9]), axis: "z", texture: eyeTex, flat: false });
      glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), EYE, { bone: head, at: head.local([s * 0.2, 0.12, 0.1]) }), 1.5);
      // horns
      b.spike(head.local([s * 0.16, -0.05, 0.1]), head.dir([s * 0.5, -0.8, 0.5]), 0.4, 0.05, { color: BONE, bone: head });
      // fangs
      b.spike(head.local([s * 0.08, 0.45, -0.03]), head.dir([0, 0.1, -1]), 0.14, 0.02, { color: BONE, bone: head });
      b.spike(jaw.local([s * 0.07, 0.4, -0.04]), jaw.dir([0, 0.1, 1]), 0.1, 0.02, { color: BONE, bone: jaw });
    }
    // crest
    b.spike(head.local([0, 0.0, 0.1]), head.dir([0, -1, 0.1]), 0.3, 0.06, { color: RED, bone: head });
    // scar band
    b.part(new THREE.BoxGeometry(0.38, 0.03, 0.03), RED, { bone: head, at: head.local([0, 0.2, 0.08]) });
  }

  // red war paint rune on chest
  const rune = svg(`<svg viewBox="0 0 40 40"><path d="M20 3 L34 35 M20 3 L6 35 M10 24 H30 M20 3 V37" stroke="#c8321a" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`, { size: 128 });
  glow(b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone: chest, at: [0, 1.4, 1.1], dir: [0, 0, 1], axis: "z", texture: rune }), 0.6);

  // broken weapons stuck in hide
  for (const [x, y, z, r] of [[0.5, 1.9, 0.2, 20], [-0.4, 1.95, -0.5, -25]] as number[][]) {
    b.part(new THREE.BoxGeometry(0.08, 0.9, 0.03), "#9aa0aa", { bone: chest, at: [x, y, z], rotation: [0, 0, r] });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6), "#5a3a1e", { bone: chest, at: [x - Math.sin(r * Math.PI / 180) * 0.5, y - 0.5, z], rotation: [0, 0, r] });
  }
  void R; void rock; void aim; void offset;
  return b.root;
}
```