import * as THREE from "three";
import { createBuilder, catmull, bezier, rng, mottle, countershade, svg } from "../../../../src/index";

export const meta = {
  name: "Forest Spirit",
  description: "A stag-headed woodland spirit with a mossy robe, antlers, glowing eyes and a leaf mantle.",
};

export default function build() {
  const b = createBuilder({ name: "forestSpirit" });
  const BARK = "#5b4030", BARK2 = "#3f2b20", MOSS = "#5f8f3a", MOSSD = "#3c6a2c";
  const BONE = "#e9e0c8", GLOW = "#9dffb0", DARK = "#1b1a16", LEAF = "#8fc24a", PINK = "#e58aa0";
  const robe = mottle(MOSSD, MOSS, { size: 0.18, seed: 3 });
  const R = rng(5);

  const hips = b.joint("hips", { at: [0, 0.75, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.75, 0], [0, 1.0, 0.02], [0, 1.28, 0.04]]), {
    parent: hips, names: ["spine1", "spine2", "chest"], role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 1.28, 0.04], [0, 1.45, 0.1], [0, 1.58, 0.16]]), {
    parent: spine.joints[spine.joints.length - 1], names: ["neck1", "neck2", "neckTip"], role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: [0, 1.58, 0.16], dir: [0, 0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: -0.02, down: 0.05 }), aim: head.local({ forward: 0.2, down: 0.07 }), role: "jaw" });

  // robe: cone-like loft
  b.loft([
    { at: [0, 0.02, 0], w: 0.9, h: 0.8 },
    { at: [0, 0.4, 0], w: 0.7, h: 0.6 },
    { at: [0, 0.85, 0], w: 0.45, h: 0.32 },
    { at: [0, 1.2, 0.03], w: 0.5, h: 0.3 },
  ], { bone: [hips, ...spine.joints], color: robe });
  b.sweep(catmull([[0, 1.28, 0.04], [0, 1.45, 0.1], [0, 1.58, 0.16]]), [0.08, 0.06], { bone: neck, color: BARK });

  // belt of vine
  b.sweep(b.surface(b.root).loop(spine.joints[0], { lift: 0.02 }), 0.025, { color: BARK2 });

  // head
  b.part(new THREE.BoxGeometry(0.2, 0.2, 0.22), BARK, { bone: head, at: head.local({ forward: 0.04, up: 0.03 }), flat: true });
  b.frustumBox(head.local({ forward: 0.12 }), head.local({ forward: 0.3, down: 0.03 }), [0.15, 0.14], [0.09, 0.08], { bone: head, color: BARK });
  b.part(new THREE.BoxGeometry(0.05, 0.04, 0.03), DARK, { bone: head, at: head.local({ forward: 0.31, down: 0.02 }) });
  b.frustumBox(jaw.local({ forward: 0 }), jaw.local({ forward: 0.2 }), [0.1, 0.035], [0.07, 0.025], { bone: jaw, color: BARK2 });

  for (const s of [1, -1]) {
    // eyes
    b.part(new THREE.SphereGeometry(0.03, 6, 4), GLOW, { bone: head, at: head.local({ left: s * 0.085, up: 0.06, forward: 0.12 }) });
    b.part(new THREE.SphereGeometry(0.012, 5, 4), DARK, { bone: head, at: head.local({ left: s * 0.088, up: 0.06, forward: 0.145 }) });
    // ears
    b.extrude([[0, 0], [0.12, 0.05], [0.2, 0.0], [0.12, -0.05]], {
      at: head.local({ left: s * 0.1, up: 0.1, back: 0.02 }), x: [s, 0.3, 0], y: [0, 1, 0], thickness: 0.015, color: BARK, bone: head, smoothing: 1,
    });
    // antlers
    const base = head.local({ left: s * 0.07, up: 0.12, back: 0.0 });
    const main = catmull([base, [s * 0.14, 1.9, 0.1], [s * 0.2, 2.1, 0.08], [s * 0.3, 2.3, 0.14]]);
    b.sweep(main, [0.03, 0.01], { bone: head, color: BONE, caps: { end: "point" } });
    for (const t of [0.35, 0.6, 0.85]) {
      const p = main.at(t);
      b.spike(p, [s * 0.7, 0.7, R() * 0.4 + 0.2], 0.17, 0.015, { bone: head, color: BONE });
    }
    // arms
    const shoulder: [number, number, number] = [s * 0.22, 1.2, 0.04];
    const arm = b.chain(`arm${s > 0 ? "L" : "R"}`, catmull([shoulder, [s * 0.34, 0.98, 0.1], [s * 0.38, 0.8, 0.28], [s * 0.4, 0.74, 0.4]]), {
      parent: spine.joints[spine.joints.length - 1], names: [`shoulder${s > 0 ? "L" : "R"}`, `elbow${s > 0 ? "L" : "R"}`, `wrist${s > 0 ? "L" : "R"}`, `hand${s > 0 ? "L" : "R"}`], role: "arm",
    });
    b.sweep(arm, [0.06, 0.04], { color: MOSSD });
    const hand = arm.joints[arm.joints.length - 1];
    b.part(new THREE.BoxGeometry(0.08, 0.05, 0.1), BARK, { bone: hand, at: hand.local({ up: 0 }), flat: true });
    for (let i = -1; i <= 1; i++) {
      b.spike(hand.local([i * 0.03 * -1, 0.02, 0]), [i * 0.2, -0.2, 1], 0.1, 0.012, { bone: hand, color: BARK2 });
    }
    // feet peeking
    b.part(new THREE.BoxGeometry(0.14, 0.06, 0.26), BARK2, { bone: hips, at: [s * 0.16, 0.03, 0.4], flat: true });
  }

  // leaf mantle
  const leaf = svg(`<svg viewBox="0 0 32 64"><path d="M16 62 C2 40 4 16 16 2 C28 16 30 40 16 62Z" fill="#fff"/><path d="M16 60 L16 8" stroke="#555" stroke-width="2"/></svg>`, { size: 128 });
  const skin = b.surface(spine.joints[2]);
  const hits = skin.scatter(70, { rng: rng(9), minDist: 0.05, filter: (h) => h.n.y > 0.1 });
  b.cards(hits, leaf, { size: [0.08, 0.16], lean: 60, bend: 20, vary: 0.3, rng: rng(4), color: LEAF });

  // flowers on robe and a tail of vines
  const rh = b.surface(b.root).scatter(14, { rng: rng(11), minDist: 0.15, filter: (h) => h.at.y < 0.9 && h.n.y > -0.2 });
  for (const h of rh) {
    b.stick(new THREE.SphereGeometry(0.03, 6, 4), PINK, h);
    b.stick(new THREE.SphereGeometry(0.014, 5, 4), "#ffe066", h, { embed: -0.5 });
  }
  const tail = b.chain("tail", catmull([[0, 0.7, -0.2], [0, 0.55, -0.5], [0, 0.4, -0.8], [0, 0.3, -1.05]]), {
    parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail",
  });
  b.sweep(tail, [0.07, 0.015], { color: MOSS });

  // glowing spirit orbs
  for (const p of [[0.5, 1.0, 0.3], [-0.45, 1.4, 0.25], [0.3, 1.8, -0.1]] as [number, number, number][])
    b.part(new THREE.IcosahedronGeometry(0.035, 0), GLOW, { bone: spine.joints[2], at: p, flat: true });

  return b.root;
}
