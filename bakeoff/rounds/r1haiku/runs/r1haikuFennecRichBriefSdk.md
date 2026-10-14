```ts
import * as THREE from "three";
import { createBuilder, frame, rng } from "agentic-3js-builder";

export const meta = {
  name: "fennec fox kit",
  description: "A young fennec fox kit on a sand dune at dusk, alert, with oversized satin ears, a fluffy tail and a woven collar with a brass bell.",
};

const CREAM = "#f1dcb4";
const GOLD = "#d99a55";
const SAND = "#d9ad72";
const PEACH = "#f4c7a6";
const EAR = "#c98c4e";
const INK = "#1d1512";
const TIP = "#2a1e17";
const LEATHER = "#6e3f24";
const BRASS = "#e0ad45";
const WHITE = "#ffffff";

export default function build() {
  const b = createBuilder({ name: "fennec-kit" });
  const random = rng(7);

  // Skeleton: root at the hips, spine forward to the chest.
  b.joint("hips", { at: [0, 0.37, -0.12] });
  b.chain("spine", [[0, 0.37, -0.12], [0, 0.41, 0.04], [0, 0.45, 0.17]], { role: "spine" });
  b.chain("neck", [[0, 0.45, 0.17], [0, 0.5, 0.26]], { role: "neck" });
  b.joint("head", { at: [0, 0.56, 0.3], parent: "neck" });
  b.chain("tail", [[0, 0.37, -0.14], [0, 0.34, -0.34], [0, 0.4, -0.58], [0, 0.5, -0.72]], { role: "tail" });

  // Body: a gold back over a cream belly, built as lofts along the spine.
  const bodyPts = [[0, 0.4, -0.18], [0, 0.42, 0], [0, 0.44, 0.15]];
  b.loft(
    bodyPts.map((p, i) => ({ at: [p[0], p[1] + 0.03, p[2]], radius: [0.11, 0.14, 0.13][i] })),
    { color: GOLD, name: "back" },
  );
  b.loft(
    bodyPts.map((p, i) => ({ at: [p[0], p[1] - 0.02, p[2]], radius: [0.1, 0.13, 0.12][i] })),
    { color: CREAM, name: "belly" },
  );

  // Legs: slim, with oversized paws it hasn't grown into.
  const legs: [string, number, number, number][] = [
    ["foreL", 0.08, 0.14, 0.16],
    ["foreR", -0.08, 0.14, 0.16],
    ["hindL", 0.09, -0.14, 0.16],
    ["hindR", -0.09, -0.14, 0.16],
  ];
  for (const [name, x, z, zFoot] of legs) {
    const top = 0.42;
    const pts = [[x, top, z], [x, 0.26, z + (zFoot - z) * 0.3], [x, 0.12, zFoot]];
    b.chain(name, pts, { role: "leg" });
    b.loft(pts.map((p, i) => ({ at: p, radius: [0.04, 0.032, 0.028][i] })), { color: CREAM, name });
    const paw = new THREE.SphereGeometry(0.06, 10, 7);
    paw.scale(1.15, 0.55, 1.5);
    b.stick(paw, INK, frame([x, 0.1, zFoot + 0.02], [0, 1, 0]));
  }

  // Tail: fluffy, tapering to a smudge of black.
  const tailPts: number[][] = [[0, 0.37, -0.14], [0, 0.34, -0.34], [0, 0.4, -0.58], [0, 0.5, -0.72]];
  b.loft(
    tailPts.map((p, i) => ({ at: p, radius: [0.06, 0.1, 0.11, 0.07][i] })),
    { color: GOLD, name: "tail" },
  );
  const tailTip = new THREE.SphereGeometry(0.07, 10, 8);
  tailTip.scale(1, 1, 1.2);
  b.stick(tailTip, TIP, frame([0, 0.5, -0.8], [0, 0.2, -1]));

  // Head: a broad cream skull with a gold crown and a pointed muzzle.
  const skull = new THREE.SphereGeometry(0.11, 14, 10);
  skull.scale(1.05, 0.95, 1.0);
  b.stick(skull, CREAM, frame([0, 0.56, 0.3], [0, 0, 1]));
  const crown = new THREE.SphereGeometry(0.095, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  b.stick(crown, GOLD, frame([0, 0.6, 0.29], [0, 1, 0]));
  const muzzle = new THREE.ConeGeometry(0.055, 0.17, 10);
  b.stick(muzzle, CREAM, frame([0, 0.55, 0.4], [0, -0.1, 1]));
  const nose = new THREE.SphereGeometry(0.02, 8, 6);
  b.stick(nose, INK, frame([0, 0.56, 0.5], [0, 0, 1]));

  // Enormous satin ears: a dark-gold shell with a peach lining in front.
  for (const s of [1, -1]) {
    const ear = new THREE.ConeGeometry(0.1, 0.3, 4);
    ear.scale(1, 1, 0.35);
    b.stick(ear, EAR, frame([0.07 * s, 0.66, 0.26], [0.22 * s, 1, -0.22]));
    const lining = new THREE.ConeGeometry(0.068, 0.24, 4);
    lining.scale(1, 1, 0.3);
    b.stick(lining, PEACH, frame([0.07 * s, 0.66, 0.28], [0.22 * s, 1, -0.2]));
  }

  // Big dark eyes with a tiny white sparkle.
  for (const s of [1, -1]) {
    const eye = new THREE.SphereGeometry(0.036, 10, 8);
    eye.scale(1, 1.15, 0.6);
    b.stick(eye, INK, frame([0.058 * s, 0.6, 0.39], [0.4 * s, 0.2, 0.9]));
    const spark = new THREE.SphereGeometry(0.008, 6, 4);
    b.stick(spark, WHITE, frame([0.07 * s, 0.612, 0.418], [0.4 * s, 0.2, 0.9]));
  }

  // Woven leather collar with a small brass bell.
  const collar = new THREE.TorusGeometry(0.095, 0.018, 8, 22);
  b.stick(collar, LEATHER, frame([0, 0.47, 0.2], [0, 0.45, 0.9]));
  const bell = new THREE.SphereGeometry(0.024, 10, 8);
  b.stick(bell, BRASS, frame([0, 0.42, 0.29], [0, -0.2, 1]));

  // The dune: a flattened mound on the floor, plain scenery.
  const duneMat = new THREE.MeshStandardMaterial({ color: SAND, roughness: 0.95, metalness: 0 });
  const dune = new THREE.Mesh(
    new THREE.SphereGeometry(0.75, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    duneMat,
  );
  dune.scale.set(1, 0.14, 0.8);
  dune.position.set(0, 0, 0);
  b.root.add(dune);

  // A few grains of sand scattered on the dune top.
  const grainMat = new THREE.MeshStandardMaterial({ color: "#c4975c", roughness: 1, metalness: 0 });
  for (let i = 0; i < 18; i++) {
    const g = new THREE.Mesh(new THREE.SphereGeometry(0.012, 4, 3), grainMat);
    const a = random() * Math.PI * 2;
    const r = 0.1 + random() * 0.5;
    g.position.set(Math.cos(a) * r, 0.02 + random() * 0.06 * (1 - r), Math.sin(a) * r * 0.8);
    b.root.add(g);
  }

  return b.root;
}
```