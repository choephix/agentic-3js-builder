import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, limb, mottle, spots, svg, gradient } from "../../../../src/index";

export const meta = {
  name: "Forest Spirit",
  description:
    "A hooded moss-robed wood sprite with a pale mask face, glowing eyes, branching antlers, leaf cape, mushrooms and root feet.",
};

const BARK = "#5a3d28";
const BARK_D = "#3b281a";
const MOSS = "#5a8a3e";
const MOSS_D = "#34542a";
const PALE = "#ece6d0";
const GLOW = "#ffd45a";
const DARK = "#17120e";
const RED = "#c8432f";
const CREAM = "#e9dcb8";

export default function build() {
  const b = createBuilder({ name: "forestSpirit" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.6, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.6, 0],
      [0, 0.85, 0],
      [0, 1.1, 0.0],
      [0, 1.3, 0.03],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.3, 0.03],
      [0, 1.42, 0.06],
      [0, 1.5, 0.1],
    ]),
    { parent: spine, role: "neck", names: ["neck1", "neck2"] },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.5, 0.1], dir: [0, 0.3, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.56, 0.17], aim: [0, 1.5, 0.27], role: "jaw" });

  // ---------- body ----------
  const bodyPaint = gradient(mottle(MOSS_D, MOSS, { size: 0.12, seed: 2 }), BARK, [0, 0.6, 0], [0, 0.45, 0]);
  const body = b.sweep(spine, (t) => [0.24 - 0.07 * t, 0.2 - 0.05 * t], { color: bodyPaint });
  b.sweep(neck, 0.06, { color: MOSS_D });

  const skirt = b.lathe(
    [
      [0, 0.12],
      [0.4, 0.12],
      [0.36, 0.3],
      [0.28, 0.55],
      [0.22, 0.72],
      [0, 0.72],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], bone: hips, segments: 10, color: mottle(MOSS_D, MOSS, { size: 0.15, seed: 5 }) },
  );
  // root fringe around the hem
  b.ring(
    { at: [0, 0.14, 0], axis: [0, 1, 0] } as any,
    { count: 14, radius: 0.38, tilt: -70 },
    (item) => b.spike(item, item, 0.12, 0.022, { color: BARK, bone: hips }),
  );

  // belt vine
  const bodySurf = b.surface(body);
  b.sweep(bodySurf.loop(spine.joints[1], { lift: 0.012 }), 0.016, { color: BARK_D });

  // leaf cape
  const leaf = svg(
    `<svg viewBox="0 0 32 48"><path d="M16 46 C2 30 4 10 16 2 C28 10 30 30 16 46Z" fill="#6aa84a" stroke="#2f5a2a" stroke-width="2"/><path d="M16 44 L16 8" stroke="#2f5a2a" stroke-width="2"/></svg>`,
    { size: 96 },
  );
  const bodyHits = bodySurf.scatter(70, { rng: rng(3), minDist: 0.07, filter: (h) => h.n.y > -0.2 });
  b.cards(bodyHits, leaf, { size: [0.09, 0.11], lean: 70, bend: 20, vary: 0.3, rng: rng(4) });
  const skirtHits = b
    .surface(skirt)
    .scatter(90, { rng: rng(8), minDist: 0.08, filter: (h) => h.at.y > 0.25 && h.n.y > -0.2 });
  b.cards(skirtHits, leaf, { size: [0.09, 0.12], lean: 75, bend: 15, vary: 0.3, rng: rng(9) });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb(
      [s * 0.12, 0.6, 0],
      [s * 0.14, 0.05, 0.08],
      [0.3, 0.3],
      [[0, 0, 1]],
    );
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      role: "leg",
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
    });
    b.sweep(leg, [0.065, 0.05], { color: BARK });
    const ankle = leg.tip!;
    b.part(new THREE.BoxGeometry(0.11, 0.05, 0.14), BARK_D, { at: [s * 0.14, 0.026, 0.11], bone: ankle });
    for (const dx of [-0.035, 0, 0.035]) {
      b.spike([s * 0.14 + dx, 0.03, 0.17], [dx * 1.5, -0.1, 1], 0.09, 0.02, { color: BARK, bone: ankle });
    }
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb(
      [s * 0.19, 1.2, 0],
      [s * 0.38, 0.85, 0.14],
      [0.22, 0.22],
      [[0, 0, -1]],
    );
    const arm = b.chain(`arm${side}`, pts, {
      parent: spine.joints[2],
      role: "arm",
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
    });
    b.sweep(arm, [0.055, 0.035], { color: MOSS_D });
    const wrist = arm.tip!;
    b.part(new THREE.SphereGeometry(0.04, 6, 4), PALE, { at: wrist.at, bone: wrist });
    b.ring(wrist, { count: 3, radius: 0.015, fromDeg: -70, toDeg: 70, tilt: 55 }, (f) =>
      b.spike(f, f, 0.1, 0.012, { color: BARK }),
    );
    // shoulder pad of leaves
    b.part(new THREE.SphereGeometry(0.08, 7, 5), MOSS, {
      at: [s * 0.2, 1.27, 0],
      bone: spine.joints[2],
      scale: [1.2, 0.7, 1],
    });
  }

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(0.21, 9, 7), MOSS_D, { at: [0, 1.67, 0.0], bone: head, scale: [1, 1, 1] });
  b.part(new THREE.SphereGeometry(0.17, 10, 8), PALE, { at: [0, 1.64, 0.1], bone: head, scale: [1, 1.05, 0.95] });
  // cheeks
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 6, 4), "#e7a58a", {
      at: [s * 0.1, 1.6, 0.215],
      bone: head,
      scale: [1, 0.6, 0.4],
    });
    // eye: dark socket then glow
    b.part(new THREE.SphereGeometry(0.04, 7, 5), DARK, {
      at: [s * 0.065, 1.67, 0.238],
      bone: head,
      scale: [1, 1.3, 0.5],
    });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), GLOW, {
      at: [s * 0.065, 1.67, 0.256],
      bone: head,
      scale: [1, 1.3, 0.6],
    });
  }
  // little nose and mouth
  b.part(new THREE.ConeGeometry(0.012, 0.03, 5), "#c9bfa0", { at: [0, 1.62, 0.262], bone: head, dir: [0, 0, 1] });
  b.part(new THREE.BoxGeometry(0.07, 0.008, 0.01), DARK, { at: [0, 1.575, 0.245], bone: head });
  b.part(new THREE.SphereGeometry(0.06, 7, 5), PALE, {
    at: [0, 1.545, 0.195],
    bone: jaw,
    scale: [1, 0.55, 0.9],
  });

  // antlers
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const path = bezier([s * 0.07, 1.8, 0.04], [s * 0.18, 1.95, 0.0], [s * 0.2, 2.1, -0.03], [s * 0.3, 2.28, -0.02]);
    b.sweep(path, [0.03, 0.008], { bone: head, color: BARK, caps: { start: "flat", end: "point" }, sides: 6, name: `antler${side}` });
    for (const t of [0.35, 0.6, 0.8]) {
      const p = path.at(t);
      b.spike(p, [s * 0.9, 0.8, 0.25], 0.14 - 0.03 * t, 0.014, { color: BARK, bone: head });
    }
    const tip = path.at(1);
    for (const [dx, dy, dz] of [
      [s * 0.04, 0.02, 0.0],
      [-s * 0.03, 0.0, 0.02],
    ]) {
      b.extrude(
        [
          [0, 0],
          [0.035, 0.03],
          [0.09, 0, "sharp"],
          [0.035, -0.03],
        ],
        { at: [tip.x + dx, tip.y + dy, tip.z + dz], x: [s * 0.6, 0.8, 0], y: [0, 0, 1], thickness: 0.006, color: MOSS, bone: head },
      );
    }
  }

  // ---------- mushrooms ----------
  const cap = spots(RED, "#ffffff", { size: 0.03, amount: 0.4, seed: 4 });
  const mushroom = (x: number, y: number, z: number, k: number, bone: any) => {
    b.part(new THREE.CylinderGeometry(0.012 * k, 0.017 * k, 0.05 * k, 6), CREAM, { at: [x, y + 0.02 * k, z], bone });
    b.lathe(
      [
        [0, 0.045 * k],
        [0.035 * k, 0.04 * k],
        [0.065 * k, 0.015 * k],
        [0.07 * k, 0],
        [0, 0],
      ],
      { at: [x, y + 0.04 * k, z], bone, segments: 8, color: cap },
    );
  };
  const sp = spine.joints[2];
  mushroom(0.15, 1.33, -0.07, 1.3, sp);
  mushroom(-0.12, 1.3, -0.1, 1.0, sp);
  mushroom(0.06, 1.2, -0.17, 0.8, sp);
  mushroom(-0.32, 0.45, 0.1, 0.9, hips);
  mushroom(0.3, 0.5, -0.12, 1.1, hips);

  return b.root;
}
