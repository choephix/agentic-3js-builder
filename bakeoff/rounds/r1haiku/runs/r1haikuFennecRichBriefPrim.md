```ts
import * as THREE from "three";
import { createBuilder, frame } from "agentic-3js-builder";

type V3 = [number, number, number];

// Bake scale and rotation into a plain primitive. Position comes from the stick frame.
function shape(g: THREE.BufferGeometry, scale: V3 = [1, 1, 1], rot: V3 = [0, 0, 0]): THREE.BufferGeometry {
  g.scale(scale[0], scale[1], scale[2]);
  g.rotateX(rot[0]);
  g.rotateY(rot[1]);
  g.rotateZ(rot[2]);
  return g;
}

const sphere = (r: number, scale: V3 = [1, 1, 1]) => shape(new THREE.SphereGeometry(r, 14, 10), scale);
const cylinder = (rTop: number, rBottom: number, h: number) =>
  new THREE.CylinderGeometry(rTop, rBottom, h, 8);

export const meta = {
  name: "fennec-kit",
  description: "A fennec fox kit on a sand dune at dusk: huge peach-lined ears, cream-to-gold fur, a fluffy tail, and a woven collar with a brass bell.",
};

export default function build() {
  const b = createBuilder({ name: "fennec-kit" });

  // Palette
  const cream = "#f2e4c9";
  const gold = "#d9a25a";
  const peach = "#f7cdb0";
  const earOuter = "#e0b071";
  const black = "#17110e";
  const brown = "#6b3f22";
  const strap = "#8a5530";
  const brass = "#d4a944";
  const paw = "#e2c79f";

  // Stuck part helper: geometry centred on p, seated along +Y.
  const put = (g: THREE.BufferGeometry, color: string, p: V3) =>
    b.stick(g, color, frame(p, [0, 1, 0]));

  // ---- Skeleton ----
  const hips = b.joint("hips", { at: [0, 0.22, 0] });
  const neck = b.joint("neck", { at: [0, 0.3, 0.12], parent: hips });
  const head = b.joint("head", { at: [0, 0.38, 0.2], parent: neck });
  const earL = b.joint("earL", { at: [0.05, 0.44, 0.17], parent: head });
  const earR = b.joint("earR", { at: [-0.05, 0.44, 0.17], parent: head });

  const shoulderL = b.joint("shoulderL", { at: [0.065, 0.22, 0.1], parent: hips });
  const wristL = b.joint("wristL", { at: [0.065, 0.1, 0.11], parent: shoulderL });
  const pawL = b.joint("pawL", { at: [0.065, 0.02, 0.13], parent: wristL });
  const shoulderR = b.joint("shoulderR", { at: [-0.065, 0.22, 0.1], parent: hips });
  const wristR = b.joint("wristR", { at: [-0.065, 0.1, 0.11], parent: shoulderR });
  const pawR = b.joint("pawR", { at: [-0.065, 0.02, 0.13], parent: wristR });

  const hipL = b.joint("hipL", { at: [0.07, 0.2, -0.1], parent: hips });
  const hockL = b.joint("hockL", { at: [0.07, 0.09, -0.07], parent: hipL });
  const ankleL = b.joint("ankleL", { at: [0.07, 0.02, -0.05], parent: hockL });
  const hipR = b.joint("hipR", { at: [-0.07, 0.2, -0.1], parent: hips });
  const hockR = b.joint("hockR", { at: [-0.07, 0.09, -0.07], parent: hipR });
  const ankleR = b.joint("ankleR", { at: [-0.07, 0.02, -0.05], parent: hockR });

  const tail1 = b.joint("tail1", { at: [0, 0.22, -0.15], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.2, -0.28], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.24, -0.4], parent: tail2 });
  const tail4 = b.joint("tail4", { at: [0, 0.33, -0.48], parent: tail3 });
  const tail5 = b.joint("tail5", { at: [0, 0.42, -0.5], parent: tail4 });

  // ---- Body: cream underneath, sandy gold over the back ----
  put(sphere(0.12, [0.85, 0.8, 1.05]), cream, [0, 0.25, -0.02]);
  put(sphere(0.118, [0.82, 0.5, 1.02]), gold, [0, 0.31, -0.02]);
  put(sphere(0.085), cream, [0, 0.3, 0.12]); // neck
  put(sphere(0.05), cream, [0.07, 0.25, 0.08]);
  put(sphere(0.05), cream, [-0.07, 0.25, 0.08]);
  put(sphere(0.068, [1, 1, 1.1]), gold, [0.08, 0.22, -0.08]);
  put(sphere(0.068, [1, 1, 1.1]), gold, [-0.08, 0.22, -0.08]);

  // ---- Head ----
  put(sphere(0.095, [1, 0.92, 1.08]), cream, [0, 0.38, 0.2]);
  put(sphere(0.07, [1, 0.5, 1]), gold, [0, 0.45, 0.19]); // forehead warmth
  put(sphere(0.04, [1, 0.9, 1.2]), cream, [0.072, 0.34, 0.2]);
  put(sphere(0.04, [1, 0.9, 1.2]), cream, [-0.072, 0.34, 0.2]);
  put(shape(new THREE.ConeGeometry(0.045, 0.14, 12), [1, 1, 1], [Math.PI / 2, 0, 0]), cream, [0, 0.345, 0.33]);
  put(sphere(0.02), black, [0, 0.347, 0.395]); // nose

  // Big dark eyes with a white sparkle
  for (const s of [1, -1]) {
    put(sphere(0.03, [1, 1, 0.6]), black, [0.042 * s, 0.385, 0.28]);
    put(sphere(0.007), "#ffffff", [0.042 * s + 0.008, 0.395, 0.302]);
  }

  // ---- Satin ears lined in peach ----
  for (const s of [1, -1]) {
    const tilt = -0.18 * s;
    put(shape(new THREE.ConeGeometry(0.068, 0.24, 12), [0.95, 1, 0.42], [0, 0, tilt]), earOuter, [0.05 * s, 0.56, 0.17]);
    put(shape(new THREE.ConeGeometry(0.046, 0.2, 12), [0.8, 1, 0.2], [0, 0, tilt]), peach, [0.05 * s, 0.56, 0.187]);
  }

  // ---- Legs with oversized paws ----
  for (const s of [1, -1]) {
    put(cylinder(0.024, 0.02, 0.2), cream, [0.065 * s, 0.12, 0.1]);
    put(sphere(0.05, [1.15, 0.55, 1.35]), paw, [0.065 * s, 0.025, 0.135]);
    put(cylinder(0.028, 0.02, 0.18), cream, [0.07 * s, 0.11, -0.08]);
    put(sphere(0.052, [1.15, 0.55, 1.35]), paw, [0.07 * s, 0.025, -0.05]);
  }

  // ---- Fluffy tail, black at the tip ----
  b.stick(sphere(0.055), cream, tail1);
  put(sphere(0.07), gold, [0, 0.21, -0.22]);
  b.stick(sphere(0.068), gold, tail2);
  put(sphere(0.07), cream, [0, 0.22, -0.34]);
  b.stick(sphere(0.078), gold, tail3);
  put(sphere(0.075), gold, [0, 0.29, -0.44]);
  b.stick(sphere(0.08), gold, tail4);
  b.stick(sphere(0.075), gold, tail5);
  put(sphere(0.072), black, [0, 0.43, -0.545]); // smudge at the tip

  // ---- Woven leather collar with a brass bell ----
  put(shape(new THREE.TorusGeometry(0.097, 0.011, 8, 28), [1, 1, 1], [Math.PI / 2, 0, 0]), brown, [0, 0.29, 0.12]);
  put(shape(new THREE.TorusGeometry(0.095, 0.011, 8, 28), [1, 1, 1], [Math.PI / 2, 0, 0]), strap, [0, 0.305, 0.12]);
  put(shape(new THREE.BoxGeometry(0.035, 0.045, 0.012)), strap, [0, 0.27, 0.22]);
  put(sphere(0.02, [1, 1.1, 1]), brass, [0, 0.238, 0.222]);

  // ---- Sand dune under the paws (scenery, root-level) ----
  const sandMat = (color: string) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.0 });

  const dune = new THREE.Mesh(new THREE.SphereGeometry(0.5, 28, 14), sandMat("#d8b07a"));
  dune.scale.set(1.5, 0.12, 1.0);
  dune.position.set(0, -0.06, 0.02);
  b.root.add(dune);

  const ridgeA = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 8), sandMat("#c99e66"));
  ridgeA.scale.set(1.6, 0.1, 0.6);
  ridgeA.position.set(0.28, -0.05, -0.18);
  b.root.add(ridgeA);

  const ridgeB = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 8), sandMat("#c99e66"));
  ridgeB.scale.set(1.4, 0.1, 0.5);
  ridgeB.position.set(-0.3, -0.05, 0.25);
  b.root.add(ridgeB);

  for (const [x, z, h] of [[0.42, 0.3, 0.07], [-0.4, -0.2, 0.05], [0.1, -0.42, 0.06]] as const) {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.02, h * 2, 6), sandMat("#8a7a4a"));
    tuft.position.set(x, h - 0.03, z);
    b.root.add(tuft);
  }

  return b.root;
}
```