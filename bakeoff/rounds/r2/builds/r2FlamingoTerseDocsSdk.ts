import * as THREE from "three";
import { createBuilder, limb, catmull, polyline, bezier, mottle } from "../../../../src/index";

export const meta = {
  name: "Flamingo",
  description: "Stylized greater flamingo: S-curved neck, bent bill with a black tip, long pink legs with webbed feet, folded wings with black flight feathers. Rigged with a spine, neck, jaw, wings, tail and legs.",
};

const PINK = "#f08a88";
const PINK_L = "#f7a8a2";
const PINK_D = "#e0706f";
const CORAL = "#ee5f5a";
const LEG = "#e8797a";
const BILL = "#f4d3c2";
const BLACK = "#1b1517";
const YELLOW = "#f2d34a";

export default function build() {
  const b = createBuilder({ name: "flamingo" });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.88, -0.22], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.88, -0.22], [0, 0.9, 0.0], [0, 0.97, 0.2]]), {
    parent: hips, names: ["spine1", "spine2"], role: "spine",
  });
  const neck = b.chain("neck", catmull([
    [0, 0.97, 0.22], [0, 1.1, 0.36], [0, 1.25, 0.34], [0, 1.38, 0.28], [0, 1.5, 0.3], [0, 1.58, 0.36],
  ]), { parent: spine.joints[1], role: "neck" });
  const H = neck.at(1).at.clone();
  const P = (x: number, y: number, z: number): [number, number, number] => [H.x + x, H.y + y, H.z + z];
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: H, dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: P(0, -0.012, 0.02), aim: P(0, -0.03, 0.15), role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.9, -0.25], [0, 0.88, -0.4], [0, 0.85, -0.56]]), {
    parent: hips, names: ["tail1", "tail2"], role: "tail",
  });

  // Body
  const bodyPaint = mottle(PINK, PINK_L, { size: 0.09, contrast: 0.6, seed: 3 });
  b.sweep(spine, (t) => {
    const e = Math.sin(Math.PI * (0.12 + 0.76 * t));
    return [0.05 + 0.09 * e, 0.06 + 0.1 * e];
  }, { color: bodyPaint, sides: 10, caps: "round" });
  b.sweep(tail, (t) => [0.06 - 0.03 * t, 0.025 - 0.01 * t], { color: PINK_D, sides: 6, caps: "round" });
  b.sweep(neck, [0.06, 0.022], { color: bodyPaint, sides: 8, caps: "round" });
  b.sweep(neck, (t) => 0.06 - 0.038 * Math.min(1, t * 1.5), { color: bodyPaint, sides: 8, caps: "round" });

  // Head
  b.part(new THREE.SphereGeometry(0.042, 8, 6), PINK, { bone: head, at: P(0, 0.008, 0.012) });
  const upper = bezier(P(0, -0.004, 0.03), P(0, -0.008, 0.11), P(0, -0.05, 0.17), P(0, -0.105, 0.19));
  b.sweep(upper, (t) => [0.03 - 0.018 * t, 0.02 - 0.01 * t], {
    bone: head, sides: 8, caps: "round", color: (t: number) => (t < 0.5 ? BILL : BLACK),
  });
  const lower = bezier(P(0, -0.028, 0.03), P(0, -0.035, 0.1), P(0, -0.068, 0.16), P(0, -0.1, 0.185));
  b.sweep(lower, (t) => [0.021 - 0.011 * t, 0.012 - 0.005 * t], {
    bone: jaw, sides: 8, caps: "round", color: (t: number) => (t < 0.55 ? BILL : BLACK),
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.012, 6, 4), YELLOW, { bone: head, at: P(s * 0.036, 0.016, 0.022) });
    b.part(new THREE.SphereGeometry(0.0065, 5, 4), BLACK, { bone: head, at: P(s * 0.046, 0.016, 0.025) });
  }

  // Wings
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wing = b.chain(`wing${side}`, polyline([[s * 0.13, 0.96, 0.12], [s * 0.14, 0.93, -0.1], [s * 0.14, 0.9, -0.35]]), {
      parent: spine.joints[1], names: [`shoulder${side}`, `elbow${side}`], role: "wing",
    });
    const base = wing.joints[0];
    b.extrude(
      [[-0.1, 0.03], [-0.3, 0.05], [-0.44, 0.0], [-0.32, -0.07], [-0.1, -0.08]],
      { at: [s * 0.122, 0.915, 0.0], thickness: 0.05, bevel: 0.008, smoothing: 1, color: BLACK, bone: base },
    );
    b.extrude(
      [[0.2, 0.05], [0.1, 0.12], [-0.1, 0.1], [-0.3, 0.0], [-0.27, -0.05], [-0.05, -0.13], [0.15, -0.09]],
      { at: [s * 0.138, 0.93, 0.0], thickness: 0.03, bevel: 0.008, smoothing: 1, color: mottle(CORAL, PINK, { size: 0.07, seed: 9 }), bone: base },
    );
  }

  // Legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const F: [number, number, number] = [s * 0.07, 0.012, 0.02];
    const pts = limb([s * 0.07, 0.84, -0.05], F, [0.26, 0.4, 0.36], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`], role: "leg",
    });
    b.sweep(leg, [0.024, 0.012], { color: LEG, sides: 6, caps: "round" });
    b.part(new THREE.SphereGeometry(0.024, 6, 5), PINK_D, { at: pts[2], bone: leg.joints[1] });
    const foot = leg.tip!;
    const tips: THREE.Vector3[] = [];
    [-35, 0, 35].forEach((deg, i) => {
      const a = (deg * Math.PI) / 180;
      const tip = new THREE.Vector3(F[0] + Math.sin(a) * 0.15, F[1], F[2] + Math.cos(a) * 0.15);
      tips.push(tip);
      const toe = b.chain(`toe${i + 1}${side}`, polyline([F, tip]), { parent: foot, names: [`toe${i + 1}${side}`], role: "digit" });
      b.sweep(toe, [0.012, 0.007], { color: LEG, sides: 6, caps: "round" });
    });
    const hind = b.chain(`toe4${side}`, polyline([F, [F[0], F[1], F[2] - 0.05]]), { parent: foot, names: [`toe4${side}`], role: "digit" });
    b.sweep(hind, [0.011, 0.007], { color: LEG, sides: 6, caps: "round" });
    for (let i = 0; i < 2; i++) {
      b.slab([[F[0], 0.007, F[2]], [tips[i].x, 0.007, tips[i].z], [tips[i + 1].x, 0.007, tips[i + 1].z]], {
        color: PINK_D, thickness: 0.004, bone: foot,
      });
    }
  }

  return b.root;
}
