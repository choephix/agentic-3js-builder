```ts
import * as THREE from "three";
import {
  createBuilder,
  bezier,
  catmull,
  grain,
  limb,
  mottle,
  paint,
  rng,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

// Palette
const CREAM = "#efe4c4";
const NOSE = "#151314";
const CLAW = "#2b2a2d";
const EYE = "#4a2a16";
const PAW = "#6f7176";
const STEM = "#8c9d86";
const LEAF_A = "#6f9f8f";
const LEAF_B = "#4f8476";
const LEAF_C = "#9cc3b1";

const FUR = mottle("#8b8d91", "#a9aaad", { size: 0.07, contrast: 0.5, seed: 4 });
// Cream chest on the front of the torso, ash-grey fur everywhere else.
const BODY = paint((p) => (p.z > 0.1 && p.y > 0.34 && p.y < 0.6 ? CREAM : FUR));
const BARK = grain("#5e4330", "#86624a", { size: 0.02, axis: "y", seed: 2 });

// Eucalyptus leaf: a pointed lance drawn in its own plane (+y is the leaf's length).
const LEAF: OutlinePoint[] = [
  [0, 0],
  [0.016, 0.03],
  [0.012, 0.06],
  [0, 0.085, "sharp"],
  [-0.012, 0.06],
  [-0.016, 0.03],
];

export const meta = {
  name: "koala",
  description: "A sleepy ash-grey koala hugging a eucalyptus branch, munching a blue-green leaf sprig.",
};

export default function build() {
  const b = createBuilder({ name: "koala" });

  // Helper: one leaf, its length running along dir, its width across the leaf plane.
  const leafAt = (p: THREE.Vector3, dir: THREE.Vector3, color: string) => {
    const y = dir.clone().normalize();
    const x = new THREE.Vector3().crossVectors(y, new THREE.Vector3(0, 0, 1));
    if (x.lengthSq() < 1e-4) x.set(1, 0, 0);
    x.normalize();
    b.extrude(LEAF, { at: p, x, y, thickness: 0.004, smoothing: 2, color });
  };

  // ---- Skeleton ----
  const hips = b.joint("hips", { at: [0, 0.1, 0] });
  const spine = b.chain("spine", catmull([[0, 0.1, 0], [0, 0.3, 0.03], [0, 0.5, 0.05], [0, 0.64, 0.05]]), {
    parent: hips,
    count: 3,
    role: "spine",
  });
  const head = b.joint("head", { parent: spine.joints[2], at: [0, 0.74, 0.1], role: "head" });

  // ---- Body: a round, sitting torso skinned over the spine ----
  b.loft(
    [
      { at: [0, 0.01, 0], w: 0.26, h: 0.22 },
      { at: [0, 0.2, 0.02], w: 0.34, h: 0.32 },
      { at: [0, 0.36, 0.04], w: 0.38, h: 0.38 },
      { at: [0, 0.5, 0.05], w: 0.34, h: 0.36 },
      { at: [0, 0.6, 0.05], w: 0.28, h: 0.28 },
    ],
    { bone: spine, color: BODY },
  );

  // ---- Head: round and fluffy, with a drowsy face ----
  b.part(new THREE.SphereGeometry(0.13, 16, 12).scale(1.05, 0.95, 0.95), FUR, {
    bone: head,
    at: [0, 0.74, 0.1],
  });

  for (const s of [1, -1]) {
    // Big fluffy ears with a cream lining on the front.
    b.part(new THREE.SphereGeometry(0.06, 12, 8).scale(0.9, 1.1, 0.35), FUR, {
      bone: head,
      at: [s * 0.1, 0.85, 0.07],
    });
    b.part(new THREE.SphereGeometry(0.042, 10, 6).scale(0.8, 1, 0.3), CREAM, {
      bone: head,
      at: [s * 0.1, 0.85, 0.085],
    });

    // Half-closed drowsy eye: dark brown ball under a fur lid covering its upper half.
    b.part(new THREE.SphereGeometry(0.024, 10, 8), EYE, {
      bone: head,
      at: [s * 0.065, 0.765, 0.205],
    });
    b.part(new THREE.SphereGeometry(0.03, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), FUR, {
      bone: head,
      at: [s * 0.065, 0.772, 0.205],
    });
  }

  // Big black leathery nose.
  b.part(new THREE.SphereGeometry(0.05, 12, 8).scale(1.25, 0.8, 0.8), NOSE, {
    bone: head,
    at: [0, 0.725, 0.215],
  });

  // ---- Hind legs: sitting, feet forward with dark claws ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const foot: [number, number, number] = [s * 0.14, 0.04, 0.25];
    const pts = limb([s * 0.12, 0.12, 0], foot, [0.2, 0.16], [[0, 0.2, 1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    const ankle = leg.tip!;
    b.part(new THREE.SphereGeometry(0.05, 10, 8).scale(1.1, 0.6, 1.3), PAW, {
      bone: ankle,
      at: foot,
    });
    for (const dx of [-0.02, 0, 0.02]) {
      b.spike([s * 0.14 + dx, 0.035, 0.305], [0, -0.2, 1], 0.03, 0.005, { color: CLAW });
    }
  }

  // ---- Arms ----
  // Right arm (-X) wraps round the branch.
  const armR = limb([-0.14, 0.6, 0.04], [-0.27, 0.5, 0.03], [0.17, 0.15], [[-1, -0.5, 0]]);
  const armRc = b.chain("armR", armR, {
    parent: spine.joints[2],
    names: ["shoulderR", "elbowR", "wristR"],
    role: "arm",
  });
  b.part(new THREE.SphereGeometry(0.05, 10, 8).scale(1, 0.9, 0.9), PAW, {
    bone: armRc.tip!,
    at: [-0.27, 0.5, 0.03],
  });
  for (const dx of [-0.02, 0, 0.02]) {
    b.spike([-0.27 + dx, 0.475, 0.06], [0, -0.3, -1], 0.025, 0.005, { color: CLAW });
  }

  // Left arm (+X) holds the sprig up near the mouth.
  const armL = limb([0.14, 0.6, 0.04], [0.1, 0.67, 0.21], [0.17, 0.15], [[1, -0.5, 0]]);
  const armLc = b.chain("armL", armL, {
    parent: spine.joints[2],
    names: ["shoulderL", "elbowL", "wristL"],
    role: "arm",
  });
  b.part(new THREE.SphereGeometry(0.05, 10, 8).scale(1, 0.9, 0.9), PAW, {
    bone: armLc.tip!,
    at: [0.1, 0.67, 0.21],
  });

  // ---- Eucalyptus branch: a leaning stem rising from the ground past the koala's right side ----
  const branch = catmull([
    [-0.4, 0.04, -0.12],
    [-0.32, 0.35, -0.04],
    [-0.24, 0.68, 0.0],
    [-0.2, 0.94, 0.02],
  ]);
  b.sweep(branch, [0.042, 0.026], { color: BARK, caps: { start: "flat", end: "round" } });

  // Leaves hanging off the branch on its outer (-X) side.
  const rand = rng(7);
  const branchLeaf = [LEAF_A, LEAF_B, LEAF_C];
  [0.22, 0.42, 0.6, 0.78, 0.92].forEach((t, i) => {
    const p = branch.at(t);
    const dir = new THREE.Vector3(-0.8, 0.35 + rand() * 0.3, (rand() - 0.5) * 0.6);
    leafAt(p, dir, branchLeaf[i % 3]);
  });

  // ---- Leaf sprig held in the left hand ----
  const sprig = bezier([0.1, 0.67, 0.22], [0.15, 0.8, 0.3], [0.21, 0.92, 0.33]);
  b.sweep(sprig, [0.008, 0.004], { color: STEM });
  for (let i = 0; i < 5; i++) {
    const t = 0.2 + i * 0.17;
    const sg = i % 2 === 0 ? 1 : -1;
    const tan = sprig.tangentAt(t);
    const dir = tan
      .clone()
      .multiplyScalar(0.5)
      .add(new THREE.Vector3(sg * 0.8, 0.3, 0.1 * sg))
      .normalize();
    leafAt(sprig.at(t), dir, [LEAF_A, LEAF_B, LEAF_C][i % 3]);
  }
  // Terminal leaf at the tip of the sprig.
  leafAt(sprig.at(1), sprig.tangentAt(1).clone().normalize(), LEAF_B);

  return b.root;
}
```