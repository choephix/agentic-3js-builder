import * as THREE from "three";
import { createBuilder, limb, catmull, mottle, paint, rng } from "../../../../src/index";
import { animeEye, cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Red Panda on Mossy Stone",
  description:
    "A cel-shaded red panda with a ringed tail, white cheek ruffs and anime eyes, standing on a moss-covered boulder in a Genshin-like style.",
};

export default function build() {
  const b = createBuilder({ name: "redPanda" });

  const RUST = cel("#d4561f");
  const DARKB = cel("#3b1d1a");
  const CREAM = cel("#fff1d6", "#f0cfa0");
  const RING = cel("#8e3414");
  const STONE = cel(mottle("#8f93a2", "#6f7488", { size: 0.12, seed: 3 }));
  const MOSS = cel(mottle("#6fa83a", "#a8d24c", { size: 0.06, seed: 5 }), "#3f7a3a");

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.5, -0.2], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.5, -0.25], [0, 0.5, -0.02], [0, 0.51, 0.2]]), {
    parent: hips, names: ["spine1", "chest"], role: "spine",
  });
  const chest = spine.joints[1];
  const neck = b.chain("neck", catmull([[0, 0.52, 0.18], [0, 0.56, 0.25], [0, 0.58, 0.31]]), {
    parent: chest, names: ["neck1", "neck2"], role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.58, 0.31], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.54, 0.36], aim: [0, 0.535, 0.44], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([[0, 0.5, -0.3], [0, 0.52, -0.45], [0, 0.6, -0.6], [0, 0.76, -0.66], [0, 0.9, -0.58]]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // stone
  const stone = b.lathe(
    [[0, 0], [0.4, 0], [0.45, 0.1], [0.39, 0.22], [0.3, 0.3], [0, 0.3]],
    { at: [0, 0, 0], segments: 9, bone: hips, color: paint((p, n, s) => (n.y > 0.45 || (p.y > 0.2 && n.y > 0.1 && s[0] > 0.2) ? MOSS : STONE)), name: "stone" },
  );
  const rr = rng(2);
  const moss = new THREE.SphereGeometry(0.05, 6, 4);
  for (let i = 0; i < 8; i++) {
    const a = rr() * 6.28;
    const d = 0.35 + rr() * 0.07;
    b.part(moss, MOSS, { bone: hips, at: [Math.cos(a) * d, 0.12 + rr() * 0.12, Math.sin(a) * d], scale: [1, 0.6, 1], flat: true, name: "mossClump" });
  }
  void stone;

  // body
  b.loft(
    [
      { at: [0, 0.5, -0.28], w: 0.13, h: 0.13 },
      { at: [0, 0.5, -0.1], w: 0.2, h: 0.18 },
      { at: [0, 0.5, 0.1], w: 0.2, h: 0.18 },
      { at: [0, 0.51, 0.22], w: 0.16, h: 0.15 },
    ],
    { bone: [hips, spine], color: paint((p, n) => (n.y < -0.3 ? DARKB : RUST)), sides: 10, name: "body" },
  );
  b.sweep(neck, 0.065, { color: RUST, sides: 8, name: "neck" });

  // tail with rings
  b.sweep(tail, [0.055, 0.04], {
    color: paint((_p, _n, s) => (Math.floor(s[0] * 9) % 2 ? RING : RUST)),
    sides: 8,
    caps: "round",
    name: "tail",
  });

  // legs
  const feetFront = 0.15;
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const defs: [string, number[], number[], number[], any, number[][]][] = [
      ["F", [s * 0.07, 0.48, 0.12], [s * 0.075, 0.31, feetFront], [0.11, 0.11], chest, [[0, 0, -1]]],
      ["H", [s * 0.07, 0.48, -0.2], [s * 0.075, 0.31, -0.22], [0.11, 0.11], hips, [[0, 0, 1]]],
    ];
    for (const [t, root, foot, len, parent, bend] of defs) {
      const pts = limb(root as any, foot as any, len, bend as any);
      const leg = b.chain(`leg${t}${k}`, pts, {
        parent, names: [`hip${t}${k}`, `knee${t}${k}`, `foot${t}${k}`], role: "leg", contact: [foot[0], 0.3, foot[2]],
      });
      b.sweep(leg, [0.05, 0.034], { color: DARKB, sides: 8, name: `leg${t}${k}` });
      b.part(new THREE.SphereGeometry(0.036, 6, 4), DARKB, {
        bone: leg.tip!, at: [foot[0], 0.325, foot[2] + 0.015], scale: [1, 0.6, 1.4], flat: true, name: "paw",
      });
    }
  }

  // head
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), paint((p, n) => (n.y < -0.4 && p.z > 0.3 ? CREAM : RUST)), {
    bone: head, at: [0, 0.58, 0.36], scale: [0.1, 0.078, 0.085], name: "skull",
  });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), CREAM, { bone: head, at: [0, 0.55, 0.43], scale: [1, 0.75, 1], name: "muzzle" });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), INK, { bone: head, at: [0, 0.563, 0.468], scale: [1.2, 0.8, 0.9], name: "nose" });
  b.part(new THREE.SphereGeometry(0.034, 8, 6), CREAM, { bone: jaw, at: [0, 0.535, 0.41], scale: [0.9, 0.5, 1.2], name: "jawBody" });

  // eyes
  const EYE = animeEye({ iris: "#e8892a", blush: false });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around([0, 0.58, 0.36]).at(s * 36, 6);
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.04, 0.055], mirror: s > 0, segments: 8 });
    // ears
    b.part(new THREE.SphereGeometry(1, 8, 6), RUST, { bone: head, at: [s * 0.065, 0.645, 0.33], scale: [0.04, 0.045, 0.016], rotation: [0, 0, -s * 20], name: "ear" });
    b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { bone: head, at: [s * 0.065, 0.645, 0.343], scale: [0.03, 0.036, 0.01], rotation: [0, 0, -s * 20], name: "earInner" });
    // cheek ruffs
    for (const [y, len] of [[0.57, 0.055], [0.545, 0.06], [0.52, 0.045]] as const)
      b.spike([s * 0.085, y, 0.37], [s, -0.25, 0.1], len, 0.026, { bone: head, color: CREAM, sides: 5, name: "ruff" });
    // brow patch
    b.part(new THREE.SphereGeometry(0.014, 6, 4), CREAM, { bone: head, at: [s * 0.04, 0.63, 0.42], scale: [1, 0.8, 1], name: "brow" });
  }

  return b.root;
}
