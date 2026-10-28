import * as THREE from "three";
import { createBuilder, catmull, rng, limb } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Baku",
  description: "Dream-eating tapir spirit in ukiyo-e woodblock style: indigo body, cream belly, vermilion mane, wave patterns, glowing dream orb.",
};

const INDIGO = "#1f3a5f", INDIGO_D = "#14263f", CREAM = "#efe3c2", VERM = "#d2402a", GOLD = "#d9a441";
const INK = "#16121a", WAVE = "#3f6f9a", TUSK = "#f5efdc", PINK = "#e58a7b", DREAM = "#ffd98a";

export default function build() {
  const b = createBuilder({ name: "baku" });
  const r = rng(5);

  const hips = b.joint("hips", { at: [0, 0.8, -0.35], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.85, -0.3], [0, 0.9, 0.1], [0, 0.95, 0.5]]), { parent: hips, role: "spine", names: ["spine1", "spine2"] });
  const neck = b.chain("neck", catmull([[0, 0.95, 0.5], [0, 1.1, 0.7], [0, 1.2, 0.85]]), { parent: spine.joints[1], role: "neck", names: ["neck1", "neck2"] });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.2, 0.85], dir: [0, -0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.15, 0.95], dir: [0, -0.05, 1], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.85, -0.7], [0, 0.85, -0.95], [0, 0.95, -1.15]]), { parent: hips, role: "tail", names: ["tail1", "tail2"] });

  // body
  b.loft(
    [
      { at: [0, 0.82, -0.75], w: 0.4, h: 0.42 },
      { at: [0, 0.85, -0.35], w: 0.55, h: 0.55 },
      { at: [0, 0.9, 0.1], w: 0.58, h: 0.58 },
      { at: [0, 0.98, 0.5], w: 0.5, h: 0.52 },
    ],
    { bone: [hips, spine.joints[0], spine.joints[1]], color: INDIGO },
  );
  b.loft(
    [
      { at: [0, 0.6, -0.4], w: 0.4, h: 0.1 },
      { at: [0, 0.62, 0.1], w: 0.42, h: 0.1 },
    ],
    { bone: hips, color: CREAM },
  );
  b.sweep(neck, [0.2, 0.16], { color: INDIGO });
  // mane
  for (let i = 0; i < 9; i++) {
    const z = 0.55 - i * 0.12, y = 1.0 + (i < 3 ? 0.18 + i * 0.03 : 0.3 - i * 0.015);
    b.part(new THREE.ConeGeometry(0.09, 0.28, 5), i % 2 ? VERM : GOLD, { bone: i < 3 ? neck.joints[0] : spine.joints[i % 2], at: [0, y + 0.1, z], dir: [0, 1, -0.5] });
  }
  // wave pattern on flanks
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++)
      b.part(new THREE.TorusGeometry(0.1 + i * 0.06, 0.012, 5, 14, Math.PI), WAVE, { bone: spine.joints[0], at: [s * 0.29, 0.9, -0.1], dir: [s, 0, 0], axis: "z" });

  // head & trunk
  b.part(new THREE.BoxGeometry(0.34, 0.34, 0.4), INDIGO, { bone: head, at: [0, 1.22, 0.95] });
  b.part(new THREE.BoxGeometry(0.34, 0.14, 0.3), INDIGO_D, { bone: jaw, at: [0, 1.06, 1.0] });
  const trunk = b.chain("trunk", catmull([[0, 1.2, 1.15], [0, 1.1, 1.38], [0, 0.95, 1.5]]), { parent: head, role: "tentacle", names: ["trunk1", "trunk2"] });
  b.sweep(trunk, [0.1, 0.05], { color: INDIGO });
  b.part(new THREE.SphereGeometry(0.06, 6, 4), PINK, { bone: trunk.joints[1], at: [0, 0.93, 1.52] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.045, 6, 4), INK, { bone: head, at: [s * 0.15, 1.3, 1.12] });
    b.part(new THREE.SphereGeometry(0.015, 5, 4), "#ffffff", { bone: head, at: [s * 0.15, 1.33, 1.155] });
    b.part(new THREE.ConeGeometry(0.03, 0.14, 5), TUSK, { bone: jaw, at: [s * 0.12, 1.1, 1.17], dir: [0, 0.3, 1] });
    b.part(new THREE.SphereGeometry(0.1, 6, 4), CREAM, { bone: head, at: [s * 0.16, 1.45, 0.88], scale: [0.5, 1, 0.5] });
    b.part(new THREE.SphereGeometry(0.06, 6, 4), VERM, { bone: head, at: [s * 0.17, 1.45, 0.9], scale: [0.4, 0.8, 0.4] });
    b.part(new THREE.BoxGeometry(0.1, 0.02, 0.03), INK, { bone: head, at: [s * 0.15, 1.38, 1.13], rotation: [0, 0, s * 15] });
    // horn-like brow flame
    b.part(new THREE.ConeGeometry(0.04, 0.22, 5), GOLD, { bone: head, at: [s * 0.1, 1.5, 1.0], dir: [s * 0.4, 1, -0.2] });
  }
  b.part(new THREE.ConeGeometry(0.05, 0.28, 5), VERM, { bone: head, at: [0, 1.52, 1.0], dir: [0, 1, -0.3] });

  // tail
  b.sweep(tail, [0.1, 0.03], { color: INDIGO });
  b.part(new THREE.SphereGeometry(0.1, 6, 5), VERM, { bone: tail.joints[1], at: [0, 0.97, -1.2], scale: [0.7, 1, 1.4] });

  // legs
  for (const s of [1, -1])
    for (const f of [0, 1]) {
      const z = f ? 0.35 : -0.6;
      const pts = limb([s * 0.2, 0.75, z], [s * 0.2, 0.07, z + (f ? 0.02 : 0.04)], [0.4, 0.38], [[0, 0, f ? 1 : -1]]);
      const n = `leg${f ? "F" : "H"}${s > 0 ? "L" : "R"}`;
      const leg = b.chain(n, pts, { parent: f ? spine.joints[1] : hips, role: "leg", names: [n + "1", n + "2", n + "3"] });
      b.sweep(leg, [0.1, 0.06], { color: INDIGO });
      b.part(new THREE.BoxGeometry(0.16, 0.14, 0.22), CREAM, { bone: leg.tip ?? leg.joints[1], at: [s * 0.2, 0.07, z + 0.05] });
      b.part(new THREE.BoxGeometry(0.17, 0.03, 0.04), INK, { bone: leg.tip ?? leg.joints[1], at: [s * 0.2, 0.06, z + 0.17] });
      b.part(new THREE.SphereGeometry(0.1, 6, 5), VERM, { bone: leg.joints[0], at: [s * 0.2, 0.72, z], scale: [0.9, 1.2, 1] });
    }

  // dream orb with swirl
  glow(b.part(new THREE.IcosahedronGeometry(0.12, 1), DREAM, { bone: head, at: [0.45, 1.7, 1.0] }), 1.6);
  glow(b.part(new THREE.TorusGeometry(0.17, 0.012, 4, 14), GOLD, { bone: head, at: [0.45, 1.7, 1.0], rotation: [70, 0, 20] }), 1.2);
  for (let i = 0; i < 5; i++)
    glow(b.part(new THREE.SphereGeometry(0.02 + r() * 0.015, 5, 4), "#fff0c0", { bone: head, at: [0.3 + r() * 0.3, 1.5 + r() * 0.4, 0.9 + r() * 0.3] }), 1.4);

  return b.root;
}
