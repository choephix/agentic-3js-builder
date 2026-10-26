```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, offset, paint, mix, noise, smoothstep, svg, countershade } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = { name: "Baku", description: "Dream-eating tapir spirit in ukiyo-e woodblock style" };

const INDIGO = "#1f3a5f", PAPER = "#f1e4c3", RED = "#c8382c", GOLD = "#d9a441", INK = "#14161f", TEAL = "#3f7f86";

export default function build() {
  const b = createBuilder({ name: "baku" });
  const R = rng(5);

  const wave = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#1f3a5f"/>
    ${[0, 1, 2, 3].map(r => [0, 1, 2, 3].map(c => `<circle cx="${c * 16 + (r % 2) * 8}" cy="${r * 16 + 8}" r="7" fill="none" stroke="#e8dcc0" stroke-width="2"/><circle cx="${c * 16 + (r % 2) * 8}" cy="${r * 16 + 8}" r="3.5" fill="none" stroke="#e8dcc0" stroke-width="2"/>`).join("")).join("")}</svg>`, { size: 128 });
  const eyeTex = svg(`<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#f1e4c3" stroke="#14161f" stroke-width="3"/><circle cx="20" cy="20" r="9" fill="#c8382c"/><circle cx="20" cy="20" r="4" fill="#14161f"/><circle cx="16" cy="16" r="2.5" fill="#fff"/></svg>`, { size: 96 });
  const swirl = svg(`<svg viewBox="0 0 64 64"><path d="M32 32 m0 0 a4 4 0 1 1 8 0 a8 8 0 1 1 -16 0 a12 12 0 1 1 24 0 a16 16 0 1 1 -32 0" fill="none" stroke="#c8382c" stroke-width="3" stroke-linecap="round"/></svg>`, { size: 128 });
  const cloud = svg(`<svg viewBox="0 0 64 32"><path d="M4 28 Q2 16 14 16 Q16 4 30 8 Q42 0 48 14 Q62 14 60 28 Z" fill="#f1e4c3" stroke="#1f3a5f" stroke-width="2"/></svg>`, { size: 128 });

  const skin = countershade(
    paint((p, n) => mix(mix(INDIGO, "#2b4f7a", noise(p, 0.12, 2)), INK, smoothstep(0.35, 0.9, noise(p, 0.05, 4)) * 0.25)),
    PAPER, { level: -0.45, soft: 0.2 });

  const hips = b.joint("hips", { at: [0, 0.75, -0.3], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.8, -0.45], [0, 0.88, 0], [0, 0.95, 0.35]]), { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" });
  const neck = b.chain("neck", catmull([[0, 0.95, 0.35], [0, 1.1, 0.55], [0, 1.15, 0.72]]), { parent: spine.joints[2], names: ["neck1", "neck2", "head"], role: "neck" });
  const head = neck.tip ?? neck.joints[2];
  const tail = b.chain("tail", catmull([[0, 0.8, -0.5], [0, 0.78, -0.75], [0, 0.85, -0.95]]), { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });

  b.sweep(catmull([[0, 0.8, -0.5], [0, 0.85, 0], [0, 0.98, 0.4]]), [0.3, 0.26, 0.24], { bone: [tail, hips, spine], color: skin, shift: [0, 0] });
  b.sweep(neck, [0.2, 0.16], { color: skin });
  b.sweep(tail, [0.07, 0.02], { color: skin, caps: { end: "point" } });
  b.part(new THREE.SphereGeometry(0.1, 6, 5), RED, { bone: tail.joints[2], at: [0, 0.87, -0.98] });

  // Head and trunk
  b.part(new THREE.SphereGeometry(0.2, 8, 6), skin, { bone: head, at: [0, 1.15, 0.8], scale: [0.9, 0.95, 1.2] });
  const trunk = b.chain("trunk", catmull([[0, 1.12, 0.95], [0, 1.02, 1.15], [0, 0.82, 1.28], [0, 0.72, 1.2]]), { parent: head, names: ["trunk1", "trunk2", "trunk3", "trunkTip"], role: "tentacle" });
  b.sweep(trunk, [0.12, 0.05], { color: skin });
  b.part(new THREE.SphereGeometry(0.055, 6, 4), PAPER, { bone: trunk.joints[3], at: [0, 0.72, 1.2] });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.05, 0.9], aim: [0, 1.0, 1.1], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.13, 0.04, 0.2), PAPER, { bone: jaw, at: [0, 1.0, 1.0] });

  for (const s of [1, -1]) {
    // eyes
    b.part(new THREE.CircleGeometry(0.06, 12), "#ffffff", { bone: head, at: [s * 0.15, 1.22, 0.9], dir: [s * 0.4, 0, 1], axis: "z", texture: eyeTex });
    // ears with cream rim
    b.part(new THREE.SphereGeometry(0.07, 6, 4), PAPER, { bone: head, at: [s * 0.17, 1.38, 0.74], scale: [0.6, 1, 0.5] });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { bone: head, at: [s * 0.17, 1.37, 0.77], scale: [0.5, 0.8, 0.4] });
    // brows
    b.rod([s * 0.1, 1.31, 0.9], [s * 0.2, 1.28, 0.84], 0.015, INK, { bone: head });
    // curved horns / tusks
    b.sprout(`tusk${s > 0 ? "L" : "R"}`, [s * 0.07, 1.0, 1.05], catmull([[s * 0.07, 1.0, 1.05], [s * 0.13, 0.95, 1.12], [s * 0.15, 1.08, 1.2]]), [0.025, 0.003], { count: 0, color: PAPER, bone: head });
    // flame-like mane tufts
    for (let i = 0; i < 4; i++) {
      b.spike([s * 0.18, 1.2 - i * 0.05, 0.62 - i * 0.07], [s * 0.7, -0.4, -0.5], 0.2, 0.04, { color: i % 2 ? GOLD : RED, bone: head });
    }

    // legs
    for (const z of [0.4, -0.5]) {
      const side = s > 0 ? "L" : "R", f = z > 0 ? "F" : "H";
      const leg = b.chain(`leg${f}${side}`, [[s * 0.2, 0.7, z], [s * 0.2, 0.4, z + 0.02], [s * 0.2, 0.08, z]], { parent: z > 0 ? spine.joints[2] : hips, names: [`hip${f}${side}`, `knee${f}${side}`, `ankle${f}${side}`], role: "leg" });
      b.sweep(leg, [0.1, 0.06], { color: skin });
      b.part(new THREE.CylinderGeometry(0.075, 0.085, 0.07, 6), INK, { bone: leg.tip ?? leg.joints[2], at: [s * 0.2, 0.035, z + 0.02] });
      b.part(new THREE.TorusGeometry(0.085, 0.012, 4, 8), GOLD, { bone: leg.joints[1], at: [s * 0.2, 0.42, z], rotation: [90, 0, 0] });
    }
  }

  // Ornamental saddle cloth with wave pattern
  b.part(new THREE.BoxGeometry(0.64, 0.05, 0.5), "#ffffff", { bone: spine.joints[1], at: [0, 1.13, 0.0], texture: wave });
  b.part(new THREE.BoxGeometry(0.66, 0.02, 0.06), GOLD, { bone: spine.joints[1], at: [0, 1.15, 0.26] });
  b.part(new THREE.BoxGeometry(0.66, 0.02, 0.06), GOLD, { bone: spine.joints[1], at: [0, 1.15, -0.26] });
  // red swirl emblems on flanks
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", { bone: spine.joints[1], at: [s * 0.32, 0.88, 0.05], dir: [s, 0, 0], axis: "z", texture: swirl });

  // dream cloud floating above, glowing dream orb
  b.part(new THREE.PlaneGeometry(0.4, 0.2), "#ffffff", { bone: head, at: [0, 1.62, 0.85], dir: [0, 0, 1], axis: "z", texture: cloud });
  glow(b.part(new THREE.IcosahedronGeometry(0.07, 0), GOLD, { bone: head, at: [0, 1.62, 0.86] }), 1.5);
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { bone: trunk.joints[3], at: [0, 0.76, 1.22] }), 1.2);

  // rope with tassels
  b.sweep(catmull([[0.0, 1.03, 0.55], [0.17, 1.07, 0.62], [0, 1.1, 0.7], [-0.17, 1.07, 0.62]], { closed: true }), 0.018, { color: RED, bone: neck.joints[0] });
  for (let i = 0; i < 3; i++) b.spike([(i - 1) * 0.08, 1.04, 0.74], [0, -1, 0], 0.12, 0.025, { color: GOLD, bone: neck.joints[1] });

  void R; void offset;
  return b.root;
}
```