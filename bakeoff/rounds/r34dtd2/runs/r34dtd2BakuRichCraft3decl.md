```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, paint, noise, mix, smoothstep, countershade, svg, rng, offset } from "agentic-3js-builder";

export const meta = { name: "Baku", description: "Dream-eating tapir spirit in ukiyo-e woodblock style: indigo body, cream belly, wave-pattern and cloud motifs, red sun seal, swirling mane." };

const INDIGO = "#1f3a5f", DEEP = "#14243d", CREAM = "#efe3c4", VERM = "#c8402e", GOLD = "#d9a441", INK = "#16121a", PALE = "#8fb0c4";

export default function build() {
  const b = createBuilder({ name: "baku" });
  const R = rng(7);
  const body = paint((p, n) => {
    const grain = noise(p, 0.05, 3);
    const base = mix(INDIGO, DEEP, smoothstep(0.3, 0.8, grain) * 0.5);
    return mix(base, CREAM, smoothstep(0.1, -0.5, n.y));
  });
  const wave = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="none"/><g fill="none" stroke="#efe3c4" stroke-width="3"><path d="M4 40 a14 14 0 0 1 28 0"/><path d="M12 40 a6 6 0 0 1 12 0"/><path d="M32 40 a14 14 0 0 1 28 0"/><path d="M40 40 a6 6 0 0 1 12 0"/></g></svg>`, { size: 128 });
  const eyeTex = svg(`<svg viewBox="0 0 40 28"><ellipse cx="20" cy="14" rx="18" ry="10" fill="#efe3c4" stroke="#16121a" stroke-width="3"/><circle cx="22" cy="14" r="7" fill="#c8402e"/><circle cx="22" cy="14" r="3.5" fill="#16121a"/><circle cx="24" cy="12" r="1.5" fill="#fff"/></svg>`, { size: 128 });
  const sun = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#c8402e" stroke="#16121a" stroke-width="3"/><g stroke="#efe3c4" stroke-width="3" fill="none"><circle cx="32" cy="32" r="12"/><path d="M32 4v10M32 50v10M4 32h10M50 32h10"/></g></svg>`, { size: 128 });
  const flame = svg(`<svg viewBox="0 0 32 64"><path d="M16 62 C2 40 20 34 10 4 C28 20 30 44 16 62Z" fill="#c8402e" stroke="#16121a" stroke-width="2"/><path d="M16 56 C10 42 20 36 15 20 C24 34 24 46 16 56Z" fill="#d9a441"/></svg>`, { size: 128 });

  // skeleton
  const hips = b.joint("hips", { at: [0, 1.0, -0.5], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 1.0, -0.5], [0, 1.08, -0.1], [0, 1.15, 0.3], [0, 1.2, 0.6]]), { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3", "chest"] });
  const neck = b.chain("neck", catmull([[0, 1.2, 0.6], [0, 1.4, 0.85], [0, 1.45, 1.05]]), { parent: spine.joints[3], role: "neck", names: ["neck1", "neck2", "neckTip"] });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.45, 1.05], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.38, 1.2], dir: [0, -0.1, 1], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 1.0, -0.55], [0, 1.0, -0.85], [0, 1.1, -1.1]]), { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"] });

  // body loft
  b.loft([
    { at: [0, 1.0, -0.6], w: 0.5, h: 0.5 }, { at: [0, 1.05, -0.2], w: 0.62, h: 0.62 },
    { at: [0, 1.12, 0.3], w: 0.64, h: 0.66 }, { at: [0, 1.2, 0.62], w: 0.5, h: 0.5 }],
    { color: body, bone: [hips, spine.joints[0], spine.joints[1], spine.joints[2], spine.joints[3]], sides: 10 });
  b.sweep(neck, [0.2, 0.17], { color: body });
  b.sweep(tail, [0.08, 0.02], { color: DEEP, caps: "point" });

  // head: skull, trunk-like snout
  b.part(new THREE.SphereGeometry(0.2, 10, 8), body, { bone: head, at: [0, 1.47, 1.1], scale: [1, 0.95, 1.2] });
  const snout = b.sweep(catmull([[0, 1.45, 1.2], [0, 1.42, 1.42], [0, 1.3, 1.6]]), [0.13, 0.08], { color: body, bone: head, sides: 8 });
  b.part(new THREE.SphereGeometry(0.09, 8, 6), VERM, { bone: head, at: [0, 1.28, 1.62], scale: [1, 0.8, 1] });
  b.sweep(catmull([[0, 1.36, 1.2], [0, 1.28, 1.4], [0, 1.2, 1.55]]), [0.09, 0.05], { color: CREAM, bone: jaw, sides: 8 });
  // eyes
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.15, 0.1), "#ffffff", { bone: head, at: [s * 0.17, 1.55, 1.2], dir: [s * 0.6, 0.1, 1], axis: "z", texture: eyeTex });
    b.part(new THREE.SphereGeometry(0.08, 8, 6), CREAM, { bone: head, at: [s * 0.17, 1.68, 1.02], scale: [1, 1, 0.6] });
    b.part(new THREE.SphereGeometry(0.05, 6, 5), INK, { bone: head, at: [s * 0.17, 1.68, 1.04], scale: [1, 1, 0.6] });
    // tusks/ears
    b.spike([s * 0.08, 1.3, 1.45], [s * 0.1, 1.45, 1.5], null, 0.025, CREAM, { bone: head });
    // brow
    b.rod([s * 0.08, 1.6, 1.28], [s * 0.26, 1.62, 1.1], 0.02, INK, { bone: head });
  }
  // sun seal on forehead
  b.part(new THREE.CircleGeometry(0.07, 16), "#ffffff", { bone: head, at: [0, 1.62, 1.29], dir: [0, 0.3, 1], axis: "z", texture: sun });

  // mane of flame cards along neck and back
  const ridge = b.surface(b.root);
  const hits = [0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((t) => frameAt(b, neck, spine, t));
  b.cards(hits, flame, { size: [0.22, 0.4], lean: 20, flow: [0, 0, -1], bend: 25, vary: 0.2, rng: R, cross: true });

  // legs with cloven-ish hooves and wave-pattern sashes
  for (const s of [1, -1]) {
    for (const [z, nm, root] of [[0.45, "F", spine.joints[3]], [-0.55, "H", hips]] as const) {
      const hip = [s * 0.25, 0.85, z];
      const pts = limb(hip, [s * 0.25, 0.05, z + 0.02], [0.42, 0.4], [[0, 0, 1]]);
      const leg = b.chain(`leg${nm}${s > 0 ? "L" : "R"}`, pts, { parent: root, role: "leg", names: [`hip${nm}${s > 0 ? "L" : "R"}`, `knee${nm}${s > 0 ? "L" : "R"}`, `foot${nm}${s > 0 ? "L" : "R"}`] });
      b.sweep(leg, [0.12, 0.07], { color: body });
      b.part(new THREE.CylinderGeometry(0.085, 0.1, 0.07, 6), INK, { bone: leg.tip!, at: [s * 0.25, 0.035, z + 0.02] });
      b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { bone: leg.joints[0], at: [s * (0.25 + 0.14), 0.75, z], dir: [s, 0, 0], axis: "z", texture: wave });
    }
  }
  // wave pattern flanks
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.5, 0.4), "#ffffff", { bone: spine.joints[1], at: [s * 0.335, 1.15, 0], dir: [s, 0, 0], axis: "z", texture: wave });
  return b.root;
}

function frameAt(b: ReturnType<typeof createBuilder>, neck: any, spine: any, t: number) {
  const p = neck.at(t);
  return p;
}
```