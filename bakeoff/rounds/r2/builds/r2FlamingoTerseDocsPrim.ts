import * as THREE from "three";
import { createBuilder, catmull, limb, rng, countershade, gradient } from "../../../../src/index";

export const meta = { name: "Flamingo", description: "Stylized pink flamingo standing on one leg with a curved neck, bent beak and folded wings." };

export default function build() {
  const b = createBuilder({ name: "flamingo" });
  const PINK = "#f28aa6", LIGHT = "#f9b4c4", DEEP = "#e0607f", LEG = "#e9718f", BLACK = "#22181c", BEAK = "#f4d9d0", EYE = "#f6d34a";
  const plumage = countershade(PINK, LIGHT, { level: -0.2, soft: 0.5 });

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.88, -0.02], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.88, -0.02], [0, 0.93, 0.12], [0, 1.0, 0.24]]), { parent: hips, role: "spine", count: 2 });
  const neckPts = [[0, 1.0, 0.24], [0, 1.2, 0.34], [0, 1.45, 0.3], [0, 1.6, 0.16], [0, 1.66, 0.2], [0, 1.58, 0.34]];
  const neck = b.chain("neck", catmull(neckPts), { parent: spine.joints[1], role: "neck", count: 5 });
  const headPos = neck.at(1).at;
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: headPos, dir: [0, -0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.02, down: 0.015 }), dir: [0, -0.1, 1], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.88, -0.02], [0, 0.86, -0.25], [0, 0.8, -0.42]]), { parent: hips, role: "tail", count: 2 });

  // body
  b.loft([
    { at: [0, 0.86, -0.38], w: 0.06, h: 0.05 },
    { at: [0, 0.88, -0.2], w: 0.2, h: 0.2 },
    { at: [0, 0.9, 0.0], w: 0.3, h: 0.3 },
    { at: [0, 0.96, 0.16], w: 0.24, h: 0.26 },
    { at: [0, 1.02, 0.26], w: 0.13, h: 0.14 },
  ], { bone: [tail, hips, spine], color: plumage, sides: 10 });

  // neck
  b.sweep(neck, [0.065, 0.04], { color: plumage, caps: "round" });

  // head
  b.part(new THREE.SphereGeometry(0.055, 8, 6), PINK, { bone: head, at: head.local({ forward: 0.02 }) });
  // beak: upper
  const beakBase = head.local({ forward: 0.05, down: 0.005 });
  const beakMid = head.local({ forward: 0.14, down: 0.0 });
  const beakTip = head.local({ forward: 0.2, down: 0.07 });
  b.sweep(catmull([beakBase, beakMid, beakTip]), [0.036, 0.008], { bone: head, color: BEAK, caps: "round", bands: [[0.55, BEAK], [1, BLACK]], section: { ngon: 6 } });
  // lower jaw
  b.sweep(catmull([head.local({ forward: 0.05, down: 0.03 }), head.local({ forward: 0.13, down: 0.03 }), head.local({ forward: 0.18, down: 0.06 })]), [0.026, 0.006], { bone: jaw, color: BLACK, caps: "round", section: { ngon: 6 } });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.015, 6, 4), EYE, { bone: head, at: head.local({ right: -s * 0.04, forward: 0.03, up: 0.02 }) });
    b.part(new THREE.SphereGeometry(0.007, 5, 4), BLACK, { bone: head, at: head.local({ right: -s * 0.05, forward: 0.035, up: 0.02 }) });
  }

  // wings
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const sh = b.joint(`wing${sd}`, { parent: spine.joints[0], at: [s * 0.14, 0.98, 0.05], dir: [s * 0.3, 0, -1], role: "wing" });
    const out = [s * 0.17, 0.96, -0.1];
    b.extrude([[0, 0.0], [0.2, 0.12], [0.45, 0.1], [0.62, -0.02, "sharp"], [0.4, -0.1], [0.1, -0.12]], {
      at: [s * 0.16, 0.95, 0.12], x: [0, 0.0, -1], y: [s * 0.6, 1, 0], thickness: 0.03, bevel: 0.008, smoothing: 1, color: gradient(DEEP, BLACK, [0, 0.9, -0.2], [0, 0.85, -0.5]), bone: sh,
    });
    b.part(new THREE.SphereGeometry(0.09, 8, 6), DEEP, { bone: sh, at: [s * 0.15, 0.97, 0.02], scale: [0.5, 0.9, 1.4] });
    void out;
  }

  // tail feathers
  b.part(new THREE.ConeGeometry(0.06, 0.25, 6), PINK, { bone: tail.joints[1], at: [0, 0.84, -0.45], dir: [0, -0.1, -1] });

  // legs: standing leg (L) and raised leg (R)
  const footR = 0.012;
  const legAt = (s: number) => [s * 0.07, 0.8, 0.0];
  // standing
  {
    const hip = legAt(1);
    const pts = limb(hip, [0.07, footR, 0.02], [0.38, 0.4], [[0, 0, 1]]);
    const leg = b.chain("legL", pts, { parent: hips, names: ["hipL", "kneeL", "ankleL"], role: "leg" });
    b.sweep(leg, 0.014, { color: LEG });
    b.part(new THREE.SphereGeometry(0.024, 6, 4), DEEP, { bone: leg.joints[1], at: pts[1] });
    for (const a of [-28, 0, 28]) {
      const r = (a * Math.PI) / 180;
      const tip = [0.07 + Math.sin(r) * 0.12, footR, 0.02 + Math.cos(r) * 0.12];
      b.rod([0.07, footR, 0.02], tip, 0.011, { bone: leg.tip ?? leg.joints[1], color: LEG });
    }
    b.part(new THREE.BoxGeometry(0.16, 0.006, 0.12), LEG, { bone: leg.tip ?? leg.joints[1], at: [0.07, 0.004, 0.08] });
  }
  // tucked leg
  {
    const hip = legAt(-1);
    const knee = [-0.07, 0.62, 0.12];
    const foot = [-0.07, 0.6, -0.12];
    const pts = [hip, knee, foot].map((p) => p);
    const leg = b.chain("legR", pts, { parent: hips, names: ["hipR", "kneeR", "ankleR"], role: "leg", contact: [-0.07, 0, 0] });
    b.sweep(leg, 0.014, { color: LEG });
    for (const a of [-20, 0, 20]) {
      const r = (a * Math.PI) / 180;
      b.rod(foot, [-0.07 + Math.sin(r) * 0.1, 0.58, -0.12 - Math.cos(r) * 0.1], 0.01, { bone: leg.tip ?? leg.joints[1], color: LEG });
    }
  }

  return b.root;
}
