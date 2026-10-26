```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, countershade, mottle, paint, svg, limb, offset } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Baku",
  description: "Dream-eating tapir spirit in ukiyo-e woodblock style: indigo body, cream belly, wave and cloud patterns, trunk-snout, tusks, curling mane and flame tail.",
};

const INDIGO = "#1f3a6b", INDIGO_D = "#162a50", CREAM = "#f1e4c3", RED = "#c8372d", GOLD = "#d9a441", INK = "#1a1a24", PALE = "#8fb3c9";

const WAVES = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#fff"/><g fill="none" stroke="#8aa" stroke-width="3">
<path d="M0 16 q8-12 16 0 t16 0 t16 0 t16 0"/><path d="M0 36 q8-12 16 0 t16 0 t16 0 t16 0"/><path d="M0 56 q8-12 16 0 t16 0 t16 0 t16 0"/></g></svg>`, { size: 128 });
const EYE = svg(`<svg viewBox="0 0 40 40"><ellipse cx="20" cy="20" rx="18" ry="12" fill="#f8f0d8" stroke="${INK}" stroke-width="3"/><circle cx="20" cy="20" r="8" fill="${RED}"/><circle cx="20" cy="20" r="4" fill="${INK}"/><circle cx="23" cy="17" r="2" fill="#fff"/></svg>`, { size: 96 });
const CLOUD = svg(`<svg viewBox="0 0 64 40"><path d="M6 34 q-6-12 8-14 q2-14 18-10 q14-8 20 6 q14 2 6 18z" fill="#f6ecd0" stroke="${INK}" stroke-width="2.5"/></svg>`, { size: 128 });
const FLAME = svg(`<svg viewBox="0 0 32 64"><path d="M16 62 q-14-16-6-32 q2 8 6 8 q-4-20 4-36 q2 16 10 30 q6 16-14 30z" fill="${RED}" stroke="${INK}" stroke-width="2"/><path d="M16 60 q-6-10 0-20 q8 8 0 20z" fill="${GOLD}"/></svg>`, { size: 128 });
const TUFT = svg(`<svg viewBox="0 0 24 48"><path d="M12 47 q-12-20-2-46 q14 20 2 46z" fill="#f4ead0" stroke="${INK}" stroke-width="2"/></svg>`, { size: 96 });

export default function build() {
  const b = createBuilder({ name: "baku" });
  const R = rng(5);

  const coat = countershade(mottle(INDIGO, INDIGO_D, { size: 0.12, seed: 2 }), CREAM, { level: -0.45, soft: 0.2 });
  const wavy = paint((p, n) => (n.y > -0.2 && Math.sin(p.z * 18 + Math.sin(p.x * 14) * 1.5) > 0.82 ? PALE : coat.at(p, n)));

  // skeleton
  const hips = b.joint("hips", { at: [0, 1.0, -0.45], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 1.0, -0.45], [0, 1.05, 0], [0, 1.1, 0.4]]), { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" });
  const neck = b.chain("neck", catmull([[0, 1.1, 0.4], [0, 1.2, 0.65], [0, 1.25, 0.85]]), { parent: spine.joints[2], names: ["neck1", "neck2", "neckTip"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 1.25, 0.85], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local([0, 0.05, 0.02]), aim: head.local([0, 0.35, -0.05]), role: "jaw" });

  // body
  b.loft([
    { at: [0, 1.0, -0.7], w: 0.5, h: 0.55 },
    { at: [0, 1.02, -0.3], w: 0.75, h: 0.8 },
    { at: [0, 1.08, 0.2], w: 0.78, h: 0.85 },
    { at: [0, 1.15, 0.55], w: 0.6, h: 0.7 },
  ], { bone: [hips, ...spine.joints], color: wavy });
  b.sweep(neck, [0.24, 0.2], { color: coat });

  // head: skull + trunk snout + lower jaw
  b.part(new THREE.SphereGeometry(0.22, 8, 6), coat, { bone: head, at: head.local([0, 0.0, 0.0]), scale: [1, 1, 1.15] });
  const snout = b.sweep(catmull([head.local({ forward: 0.1, up: 0.03 }), head.local({ forward: 0.35, up: 0.0 }), head.local({ forward: 0.55, up: -0.12 })]), [0.15, 0.08], { bone: head, color: coat });
  b.part(new THREE.SphereGeometry(0.085, 6, 5), CREAM, { bone: head, at: head.local({ forward: 0.58, up: -0.14 }) });
  b.part(new THREE.BoxGeometry(0.12, 0.05, 0.3), CREAM, { bone: jaw, at: head.local({ forward: 0.3, up: -0.11 }) });
  for (const s of [1, -1]) {
    b.spike(head.local({ forward: 0.38, up: -0.1, left: s * 0.08 }), [s * 0.1, -0.3, 0.9], 0.2, 0.025, { color: "#fff8e0", bone: head });
    // eyes
    b.decal(b.surface(head.object.children.length ? b.root : b.root), EYE, { at: head.local({ forward: 0.2, up: 0.1, left: s * 0.19 }), dir: [s, 0.1, 0.4], size: [0.11, 0.11], mirror: s > 0, bone: head });
    // ears
    b.extrude([[0, 0], [0.06, 0.02], [0.1, 0.1], [0.04, 0.16], [-0.04, 0.08]], { at: head.local({ up: 0.18, left: s * 0.12, forward: -0.08 }), x: [s, 0, 0], thickness: 0.03, color: INDIGO_D, bone: head });
    b.part(new THREE.SphereGeometry(0.04, 5, 4), CREAM, { bone: head, at: head.local({ up: 0.23, left: s * 0.16, forward: -0.06 }) });
    // horns/brow flames
    b.sweep(catmull([head.local({ up: 0.2, left: s * 0.1, forward: 0.0 }), head.local({ up: 0.4, left: s * 0.15, forward: -0.1 }), head.local({ up: 0.5, left: s * 0.1, forward: -0.3 })]), [0.035, 0.0], { bone: head, color: GOLD, caps: "point" });
  }

  // mane tufts along neck
  const neckTube = b.sweep(catmull([[0, 1.15, 0.35], [0, 1.28, 0.65], [0, 1.4, 0.82]]), 0.12, { bone: neck.joints[1], color: RED });
  const hits = b.surface(neckTube).scatter(30, { rng: R, minDist: 0.05, filter: (h) => h.n.y > 0.1 });
  b.cards(hits, TUFT, { size: [0.08, 0.2], lean: 45, bend: 20, vary: 0.3, rng: R, bone: neck.joints[1] });

  // legs
  const legs: [string, number, number][] = [["FL", 1, 0.45], ["FR", -1, 0.45], ["HL", 1, -0.7], ["HR", -1, -0.7]];
  for (const [n, s, z] of legs) {
    const hipP: [number, number, number] = [s * 0.28, 0.85, z];
    const pts = limb(hipP, [s * 0.28, 0.07, z + 0.03], [0.4, 0.4], [[0, 0, 1]]);
    const parent = z > 0 ? spine.joints[2] : hips;
    const leg = b.chain("leg" + n, pts, { parent, names: ["hip" + n, "knee" + n, "ankle" + n], role: "leg" });
    b.sweep(leg, [0.12, 0.07], { color: coat });
    b.part(new THREE.CylinderGeometry(0.1, 0.11, 0.1, 6), INK, { bone: leg.tip ?? leg.joints[1], at: [s * 0.28, 0.05, z + 0.03] });
    b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.04, 8), GOLD, { bone: leg.joints[1], at: [s * 0.28, 0.2, z + 0.03] });
  }

  // flame tail
  const tail = b.chain("tail", catmull([[0, 1.05, -0.9], [0, 1.15, -1.15], [0, 1.4, -1.3]]), { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });
  b.sweep(tail, [0.08, 0.03], { color: INDIGO });
  b.cards([tail.at(1)], FLAME, { size: [0.35, 0.6], lean: 0, cross: true, bone: tail.joints[2] });

  // dream clouds floating beside, glowing
  for (const s of [1, -1]) {
    const c = b.part(new THREE.PlaneGeometry(0.3, 0.19), "#ffffff", { bone: spine.joints[1], at: [s * 0.4, 1.28, 0.1], dir: [s, 0, 0], axis: "z", texture: CLOUD });
    glow(c, 0.4);
    b.part(new THREE.PlaneGeometry(0.25, 0.25), "#ffffff", { bone: spine.joints[1], at: [s * 0.395, 1.0, -0.15], dir: [s, 0, 0], axis: "z", texture: WAVES });
  }
  // gold collar
  b.sweep(b.surface(neck.joints[0]).loop(neck.joints[0], { lift: 0.02 }), 0.025, { color: GOLD });

  return b.root;
}
```