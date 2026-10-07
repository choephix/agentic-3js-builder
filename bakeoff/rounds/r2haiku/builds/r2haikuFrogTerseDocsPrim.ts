import * as THREE from "three";
import { createBuilder, countershade, spots, limb, catmull } from "../../../../src/index";

const GREEN = "#4f9d3a";
const DARK = "#1f4a22";
const BELLY = "#e9e4a6";
const SAC = "#b8df6a";
const GOLD = "#e0ac2a";
const INK = "#111111";
const PALE = "#f1ead0";

export const meta = {
  name: "frog",
  description: "A stylised green tree frog: wide head, gold eyes, throat sac and splayed legs, resting in a crouch.",
};

export default function build() {
  const b = createBuilder({ name: "frog" });

  // Mottled green back, pale belly.
  const coat = countershade(spots(GREEN, DARK, { size: 0.02, amount: 0.35, seed: 3 }), BELLY, { level: -0.25 });

  // Skeleton: hips (body) with a head joint, four splayed legs.
  const hips = b.joint("hips", { at: [0, 0.04, -0.02], aim: [0, 0.04, 0.03], role: "spine" });
  const head = b.joint("head", { parent: hips, at: [0, 0.05, 0.05], aim: [0, 0.055, 0.12], role: "head" });

  // Body and head: simple squashed spheres, faceted.
  b.part(new THREE.SphereGeometry(0.05, 12, 8), coat, {
    bone: hips,
    at: [0, 0.04, -0.02],
    scale: [1.15, 0.8, 1.3],
    flat: true,
    name: "body",
  });
  b.part(new THREE.SphereGeometry(0.045, 12, 8), coat, {
    bone: head,
    at: [0, 0.05, 0.05],
    scale: [1.25, 0.7, 0.95],
    flat: true,
    name: "head",
  });

  // Throat vocal sac, puffed under the chin.
  b.part(new THREE.SphereGeometry(0.02, 10, 6), SAC, {
    bone: head,
    at: [0, 0.03, 0.086],
    scale: [1.1, 0.8, 0.7],
    flat: true,
    name: "throatSac",
  });

  // Wide mouth line on the front of the head.
  b.sweep(
    catmull([
      [-0.03, 0.05, 0.084],
      [0, 0.043, 0.093],
      [0.03, 0.05, 0.084],
    ]),
    0.0035,
    { bone: head, color: INK },
  );

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Bulging gold eyes with dark pupils on top of the head.
    b.part(new THREE.SphereGeometry(0.015, 8, 6), GOLD, {
      bone: head,
      at: [s * 0.03, 0.084, 0.058],
      flat: true,
      name: `eye${side}`,
    });
    b.part(new THREE.SphereGeometry(0.0065, 6, 4), INK, {
      bone: head,
      at: [s * 0.03, 0.09, 0.0715],
      name: `pupil${side}`,
    });

    // Nostril.
    b.part(new THREE.SphereGeometry(0.003, 5, 4), INK, {
      bone: head,
      at: [s * 0.014, 0.063, 0.09],
      name: `nostril${side}`,
    });

    // Hind leg: thick thigh, folded knee and ankle, toes splayed at the foot.
    const hindPts = limb(
      [s * 0.045, 0.032, -0.035],
      [s * 0.08, 0.007, -0.005],
      [0.045, 0.04, 0.035],
      [
        [s * 0.8, 0.6, 0],
        [0, 0.2, 1],
      ],
    );
    const hind = b.chain(`leg${side}H`, hindPts, {
      parent: hips,
      names: [`hip${side}H`, `knee${side}H`, `ankle${side}H`, `foot${side}H`],
      role: "leg",
    });
    b.sweep(hind, [0.016, 0.01, 0.007], { color: coat });
    const footJ = hind.joints[hind.joints.length - 1];
    b.ring(footJ, { count: 4, radius: 0.006 }, (pad) =>
      b.part(new THREE.SphereGeometry(0.0042, 6, 4), PALE, { at: pad, bone: footJ }),
    );

    // Front arm: slim, planted forward, with small finger pads.
    const armPts = limb(
      [s * 0.045, 0.05, 0.035],
      [s * 0.07, 0.008, 0.08],
      [0.032, 0.03, 0.022],
      [
        [s * 0.5, 0, -0.6],
        [0, 0.3, 1],
      ],
    );
    const arm = b.chain(`arm${side}`, armPts, {
      parent: hips,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.008, 0.0065, 0.0055], { color: coat });
    const handJ = arm.joints[arm.joints.length - 1];
    b.ring(handJ, { count: 4, radius: 0.0045 }, (pad) =>
      b.part(new THREE.SphereGeometry(0.0032, 5, 4), PALE, { at: pad, bone: handJ }),
    );
  }

  return b.root;
}
