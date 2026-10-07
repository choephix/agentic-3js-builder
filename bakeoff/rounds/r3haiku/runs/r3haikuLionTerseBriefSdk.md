```ts
import * as THREE from "three";
import { createBuilder, catmull, rng } from "agentic-3js-builder";

export const meta = {
  name: "lion",
  description: "A maned male lion in a stylised primitive rest pose, about 1.2 m at the shoulder.",
};

const TAN = "#c58f4e";
const TAN_DARK = "#9c6434";
const BELLY = "#e6c48f";
const MANE = "#7a4a22";
const MANE_DARK = "#3e2212";
const MUZZLE = "#f3e3c2";
const NOSE = "#2b1b14";
const EYE = "#e8a526";
const PUPIL = "#141010";
const TOOTH = "#f7f1e1";
const TUFT = "#3a220f";

const norm = (v: number[]) => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};

export default function build() {
  const b = createBuilder({ name: "lion" });
  const rand = rng(11);

  // Skeleton: root hips, spine, neck, head, jaw, tail, four legs.
  const hips = b.joint("hips", { at: [0, 0.98, -0.55] });

  const spinePath = catmull([
    [0, 0.98, -0.55],
    [0, 1.02, -0.25],
    [0, 1.07, 0.05],
    [0, 1.12, 0.36],
  ]);
  const spine = b.chain("spine", spinePath, { parent: hips, role: "spine" });

  const neckPath = catmull([
    [0, 1.12, 0.36],
    [0, 1.2, 0.55],
    [0, 1.26, 0.7],
  ]);
  const neck = b.chain("neck", neckPath, { parent: hips, role: "neck" });
  const neckEnd = neck.joints.at(-1)!;

  const head = b.joint("head", { at: [0, 1.26, 0.8], parent: neckEnd });
  const jaw = b.joint("jaw", { at: [0, 1.12, 0.95], parent: head });

  const tailPath = catmull([
    [0, 0.98, -0.62],
    [0, 1.0, -0.95],
    [0, 0.75, -1.18],
    [0, 0.32, -1.22],
    [0, 0.1, -1.12],
  ]);
  b.chain("tail", tailPath, { parent: hips, role: "tail" });

  // Helper: a stylised ellipsoid built from a low-poly sphere.
  const blob = (
    r: number,
    at: number[],
    color: string,
    opts: { scale?: number[]; bone?: any } = {},
  ) =>
    b.part(new THREE.SphereGeometry(r, 12, 9), color, {
      at,
      scale: opts.scale ?? [1, 1, 1],
      ...(opts.bone ? { bone: opts.bone } : {}),
    } as any);

  // Torso: tube along the spine, plus chest, rump and belly masses.
  b.sweep(spinePath, 0.27, { color: TAN });
  blob(0.3, [0, 1.08, 0.18], TAN, { scale: [0.95, 1, 1.2] });
  blob(0.27, [0, 1.0, -0.4], TAN, { scale: [0.95, 1, 1.1] });
  blob(0.22, [0, 0.9, 0.02], BELLY, { scale: [1, 0.6, 1.6] });

  // Legs: two front, two hind, mirrored. +X is the lion's left.
  const sides = [1, -1];
  for (const s of sides) {
    const side = s > 0 ? "L" : "R";

    // Front leg.
    const frontPath = catmull([
      [s * 0.2, 1.0, 0.3],
      [s * 0.21, 0.55, 0.3],
      [s * 0.2, 0.2, 0.34],
      [s * 0.2, 0.07, 0.36],
    ]);
    b.chain(`legF${side}`, frontPath, { parent: hips, role: "leg" });
    b.sweep(frontPath, 0.07, { color: TAN });
    blob(0.13, [s * 0.2, 0.92, 0.28], TAN, { scale: [1, 1.1, 1] });
    blob(0.1, [s * 0.2, 0.07, 0.42], TAN_DARK, { scale: [1, 0.6, 1.3] });

    // Hind leg with a big haunch and a backward hock.
    const hindPath = catmull([
      [s * 0.24, 0.96, -0.5],
      [s * 0.22, 0.52, -0.42],
      [s * 0.2, 0.2, -0.6],
      [s * 0.2, 0.07, -0.5],
    ]);
    b.chain(`legB${side}`, hindPath, { parent: hips, role: "leg" });
    b.sweep(hindPath, 0.075, { color: TAN });
    blob(0.22, [s * 0.22, 0.86, -0.5], TAN, { scale: [0.85, 1.1, 1.05] });
    blob(0.1, [s * 0.2, 0.07, -0.42], TAN_DARK, { scale: [1, 0.6, 1.3] });

    // Claws on both paws.
    for (const pawZ of [0.5, -0.36]) {
      const isFront = pawZ > 0;
      const zTip = isFront ? 0.5 + 0.1 : -0.36 + 0.1;
      for (const dx of [-0.035, 0, 0.035]) {
        b.spike(
          [s * 0.2 + dx, 0.03, zTip],
          norm([0, -0.3, 1]),
          0.035,
          0.012,
        );
      }
    }
  }

  // Mane: a long dark outer ring and a shorter lighter inner ring around the head.
  const maneCentre = [0, 1.25, 0.72];
  for (let i = 0; i < 34; i++) {
    const a = (i / 34) * Math.PI * 2 + rand() * 0.1;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const base = [maneCentre[0] + ca * 0.17, maneCentre[1] + sa * 0.17, maneCentre[2]];
    b.spike(base, norm([ca, sa, -0.35]), 0.26 + rand() * 0.12, 0.06);
  }
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + rand() * 0.15;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const base = [maneCentre[0] + ca * 0.12, maneCentre[1] + sa * 0.12, maneCentre[2] + 0.02];
    b.spike(base, norm([ca, sa, -0.2]), 0.18 + rand() * 0.06, 0.05);
  }

  // Head: skull, muzzle, nose, eyes, ears, brows.
  blob(0.2, [0, 1.24, 0.82], TAN, { scale: [0.92, 0.9, 1.05], bone: head });
  blob(0.11, [0, 1.2, 0.98], MUZZLE, { scale: [1.05, 0.7, 1.5], bone: head });
  blob(0.045, [0, 1.23, 1.1], NOSE, { bone: head });

  for (const s of sides) {
    const x = s * 0.09;
    blob(0.07, [s * 0.14, 1.4, 0.78], TAN_DARK, { scale: [1, 1, 0.45], bone: head });
    blob(0.035, [x, 1.28, 1.0], EYE, { bone: head });
    blob(0.018, [x, 1.28, 1.03], PUPIL, { bone: head });
    b.part(new THREE.BoxGeometry(0.1, 0.025, 0.05), TAN_DARK, {
      at: [x, 1.32, 0.99],
      bone: head,
    } as any);
    // Upper canine.
    b.spike([s * 0.04, 1.14, 1.05], [0, -1, 0], 0.04, 0.012);
  }

  // Lower jaw: separate piece on its own joint so it can open.
  blob(0.09, [0, 1.1, 0.98], MUZZLE, { scale: [0.95, 0.5, 1.35], bone: jaw });
  for (const s of sides) {
    b.spike([s * 0.04, 1.14, 1.02], [0, 1, 0], 0.035, 0.011);
  }

  // Tail tuft.
  blob(0.07, [0, 0.1, -1.12], TUFT, { scale: [1, 1.3, 1] });

  return b.root;
}
```