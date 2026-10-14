import * as THREE from "three";
import { createBuilder, limb, countershade, spots } from "../../../../src/index";

export const meta = {
  name: "frog",
  description: "A stylised green frog crouched on a lily pad, with big gold eyes and a cream belly.",
};

const GREEN = "#3f8f36";
const LIME = "#86c94a";
const DARK = "#1f4d1d";
const BELLY = "#ece6a6";
const EYE = "#f4c21b";
const BLACK = "#121212";
const PAD = "#2f7d3a";

export default function build() {
  const b = createBuilder({ name: "frog" });

  // Skeleton: hips at the rump, a three-joint spine up to the head.
  const hips = b.joint("hips", { at: [0, 0.055, -0.06], role: "spine" });
  const spineCurve = catmullPoints([
    [0, 0.055, -0.06],
    [0, 0.066, -0.01],
    [0, 0.066, 0.04],
    [0, 0.06, 0.08],
  ]);
  const spine = b.chain("spine", spineCurve, {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });

  const head = b.joint("head", {
    parent: spine.joints[2],
    at: [0, 0.064, 0.1],
    aim: [0, 0.064, 0.15],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.056, 0.1],
    aim: [0, 0.054, 0.15],
    role: "jaw",
  });

  // Paint: lime back with dark spots, cream belly.
  const skin = countershade(spots(LIME, DARK, { size: 0.035, amount: 0.35, seed: 3 }), BELLY, { level: -0.2 });

  // Body: a flattened tube along the spine.
  b.sweep(spine, (t: number) => {
    const k = Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
    return [0.044 + 0.01 * k, 0.036 + 0.008 * k];
  }, { color: skin });

  // Head: a wide, flat loft that merges into the body.
  b.loft(
    [
      { at: [0, 0.062, 0.07], w: 0.09, h: 0.06 },
      { at: [0, 0.064, 0.1], w: 0.1, h: 0.06 },
      { at: [0, 0.06, 0.125], w: 0.08, h: 0.05 },
      { at: [0, 0.056, 0.14], w: 0.05, h: 0.035 },
    ],
    { bone: [spine, head], color: skin },
  );

  // Lower jaw: a pale slab on its own joint so the mouth can open.
  b.part(new THREE.BoxGeometry(0.06, 0.012, 0.045), BELLY, {
    bone: jaw,
    at: [0, 0.054, 0.125],
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Eyes with pupils, on the top of the head.
    b.part(new THREE.SphereGeometry(0.021, 8, 6), EYE, {
      bone: head,
      at: [s * 0.034, 0.098, 0.1],
    });
    b.part(new THREE.SphereGeometry(0.009, 6, 4), BLACK, {
      bone: head,
      at: [s * 0.036, 0.104, 0.118],
    });

    // Nostrils.
    b.part(new THREE.SphereGeometry(0.004, 5, 4), DARK, {
      bone: head,
      at: [s * 0.014, 0.068, 0.14],
    });

    // Hind leg: folded thigh, shin and foot planted on the pad.
    const hip = [s * 0.04, 0.045, -0.04];
    const hindFoot = [s * 0.075, 0.006, 0.02];
    const hindPts = limb(hip, hindFoot, [0.055, 0.05, 0.04], [
      [s, 0.5, 0.3],
      [s, 0.2, -0.3],
    ]);
    const leg = b.chain(`leg${side}`, hindPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(leg, (t: number) => 0.02 - 0.008 * t, { color: GREEN });

    const footTip = leg.tip;
    if (footTip) {
      for (const i of [-1.5, -0.5, 0.5, 1.5]) {
        b.capsule(footTip, footTip.local({ forward: 0.03, left: i * 0.011 }), 0.005, { color: GREEN });
      }
    }

    // Front arm: shoulder, elbow and a small hand.
    const shoulder = [s * 0.04, 0.06, 0.05];
    const wrist = [s * 0.065, 0.008, 0.1];
    const armPts = limb(shoulder, wrist, [0.045, 0.04], [[s, 0, -0.5]]);
    const arm = b.chain(`arm${side}`, armPts, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, (t: number) => 0.016 - 0.005 * t, { color: GREEN });

    const hand = arm.tip;
    if (hand) {
      for (const i of [-1, 0, 1]) {
        b.capsule(hand, hand.local({ forward: 0.02, left: i * 0.01 }), 0.0045, { color: GREEN });
      }
    }
  }

  // Lily pad under the frog: a plain object on the hips bone, top at y = 0.006.
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.006, 16), PAD, {
    bone: hips,
    at: [0, 0.003, 0.02],
  });

  return b.root;
}

// Plain point-array helper so the spine path can be built from literal points.
function catmullPoints(points: number[][]) {
  return points;
}
