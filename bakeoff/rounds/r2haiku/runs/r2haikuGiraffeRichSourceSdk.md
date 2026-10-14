```ts
import * as THREE from "three";
import { createBuilder, gradient, patches, rng } from "agentic-3js-builder";

export const meta = {
  name: "Young reticulated giraffe",
  description:
    "A young reticulated giraffe: chestnut patches outlined in cream, a stiff brown mane, fuzzy ossicones, big ears, long lashes and a dark tongue peeking out.",
};

const CREAM = "#f4e6c6";
const CHESTNUT = ["#8c4b24", "#7a3d1c", "#9a5a2e"];
const MANE = "#4a2a15";
const DARK = "#1d130c";
const HOOF = "#2b1e15";
const TONGUE = "#3b1a20";
const OSSICONE = "#a07a4c";
const EAR = "#b8844f";

export default function giraffe() {
  const b = createBuilder({ name: "giraffe", paintSize: 2048 });

  // Paints: chestnut patches with cream outlines, and legs that fade from cream below the knee.
  const body = patches(CREAM, CHESTNUT, { size: 0.3, gap: 0.1, seed: 4 });
  const legPaint = gradient(CREAM, body, [0, 0.9, 0], [0, 1.6, 0]);

  // Skeleton: pelvis (root), chest, neck chain, head, jaw.
  b.joint("pelvis", { at: [0, 2.2, -0.9], role: "spine" });
  b.joint("chest", { parent: "pelvis", at: [0, 2.36, 0.1], dir: [0, 0.25, 1], role: "spine" });
  const neck = b.chain(
    "neck",
    [
      [0, 2.45, 0.55],
      [0, 2.9, 0.85],
      [0, 3.3, 1.15],
    ],
    { parent: "chest", names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  b.joint("head", { parent: "neck3", at: [0, 3.3, 1.15], dir: [0, 0.3, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 3.26, 1.42], dir: [0, -0.15, 1], role: "jaw" });

  // Legs: slender, tapering, with a hoof joint at each foot.
  const leg = (side: "L" | "R", parent: "chest" | "pelvis", zTop: number, zFoot: number) => {
    const x = side === "L" ? 0.32 : -0.32;
    const base = (parent === "chest" ? "front" : "hind") + side;
    const limb = b.chain(
      base,
      [
        [x, 2.2, zTop],
        [x, 1.25, (zTop + zFoot) / 2 + 0.02],
        [x, 0.42, zFoot + 0.02],
        [x, 0.07, zFoot],
      ],
      { parent, names: [`${base}1`, `${base}2`, `${base}3`, `${base}Hoof`], role: "leg" },
    );
    b.sweep(limb, [0.13, 0.1, 0.075, 0.06], { color: legPaint, name: `${base}Leg` });
    b.part(new THREE.CylinderGeometry(0.075, 0.085, 0.1, b.segments(8)), HOOF, {
      at: [x, 0.05, zFoot],
      bone: `${base}Hoof`,
      name: `${base}Hoof`,
    });
  };
  leg("L", "chest", 0.45, 0.42);
  leg("R", "chest", 0.45, 0.42);
  leg("L", "pelvis", -0.85, -0.97);
  leg("R", "pelvis", -0.85, -0.97);

  // Body: a blocky barrel of stations, bending across the pelvis and chest joints.
  b.loft(
    [
      { at: [0, 2.3, -1.05], w: 0.6, h: 0.8 },
      { at: [0, 2.3, -0.6], w: 0.9, h: 0.98 },
      { at: [0, 2.36, -0.05], w: 0.98, h: 1.04 },
      { at: [0, 2.42, 0.45], w: 0.8, h: 0.95 },
      { at: [0, 2.5, 0.7], w: 0.6, h: 0.8 },
    ],
    { color: body, bone: ["pelvis", "chest"], sides: 10, name: "torso" },
  );

  // Neck: a thick tapering tube, with a stiff mane of spikes along its dorsal ridge.
  const neckBody = b.sweep(neck, [0.2, 0.13], { color: body, sides: 10, name: "neck" });
  for (let i = 0; i < 16; i++) {
    const t = 0.04 + (0.92 * i) / 15;
    const p = neckBody.at(t, 0, 0);
    const n = p.axis;
    b.spike(p, [n.x, n.y + 0.1, n.z - 0.7], 0.11, 0.013, { color: MANE, name: "mane" });
  }

  // Head: skull, cream muzzle, nose, and a separate jaw.
  b.capsule([0, 3.46, 1.17], [0, 3.42, 1.5], [0.13, 0.11], { color: body, bone: "head", name: "skull" });
  b.capsule([0, 3.36, 1.45], [0, 3.27, 1.84], [0.1, 0.085], { color: CREAM, bone: "head", name: "muzzle" });
  b.part(new THREE.SphereGeometry(0.055, b.segments(8), b.segments(6)), DARK, {
    at: [0, 3.27, 1.86],
    bone: "head",
    name: "nose",
  });
  b.capsule([0, 3.26, 1.42], [0, 3.2, 1.8], [0.07, 0.05], { color: CREAM, bone: "jaw", name: "jawLower" });
  b.sweep(
    [
      [0, 3.2, 1.5],
      [0, 3.17, 1.85],
      [0, 3.13, 2.12],
    ],
    [0.03, 0.012],
    { color: TONGUE, bone: "jaw", name: "tongue" },
  );

  const fuzz = rng(5);
  for (const sx of [1, -1]) {
    const x = 0.125 * sx;

    // Eyes with a highlight and long lashes.
    b.part(new THREE.SphereGeometry(0.045, b.segments(10), b.segments(8)), DARK, {
      at: [x, 3.5, 1.3],
      bone: "head",
      name: "eye",
    });
    b.part(new THREE.SphereGeometry(0.013, b.segments(6), b.segments(4)), "#fff7e6", {
      at: [x + 0.012 * sx, 3.52, 1.34],
      bone: "head",
      name: "eyeShine",
    });
    for (let k = -2; k <= 2; k++) {
      b.rod(
        [x + k * 0.016, 3.54, 1.33],
        [x + k * 0.035, 3.6, 1.42],
        [0.007, 0.002],
        { color: DARK, bone: "head", name: "lash" },
      );
    }

    // Ossicones: a stalk with a fuzzy black tuft of short spikes.
    b.rod([0.07 * sx, 3.55, 1.22], [0.09 * sx, 3.8, 1.14], [0.032, 0.022], {
      color: OSSICONE,
      bone: "head",
      name: "ossicone",
    });
    b.part(new THREE.SphereGeometry(0.05, b.segments(8), b.segments(6)), DARK, {
      at: [0.09 * sx, 3.84, 1.13],
      bone: "head",
      name: "ossiconeTuft",
    });
    for (let i = 0; i < 8; i++) {
      const dir = [(fuzz() - 0.5) * 1.2, 0.6 + fuzz() * 0.6, (fuzz() - 0.5) * 1.2];
      b.spike([0.09 * sx, 3.82, 1.13], dir, 0.05, 0.01, { color: DARK, bone: "head", name: "tuftHair" });
    }

    // Big leaf-shaped ear, flaring out and back.
    const earPoints = [
      [0.12, 3.47, 1.18],
      [0.38, 3.56, 1.08],
      [0.47, 3.47, 1.16],
      [0.41, 3.37, 1.28],
      [0.15, 3.38, 1.3],
    ].map(([px, py, pz]) => [px * sx, py, pz]);
    b.slab(earPoints, { color: EAR, thickness: 0.025, bone: "head", name: "ear" });
  }

  // Tail with a dark tuft.
  b.chain(
    "tail",
    [
      [0, 2.25, -1.0],
      [0, 2.05, -1.3],
      [0, 1.8, -1.45],
      [0, 1.55, -1.5],
    ],
    { parent: "pelvis", names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  const tail = b.chain(
    "tailChain",
    [
      [0, 2.25, -1.0],
      [0, 2.05, -1.3],
      [0, 1.8, -1.45],
      [0, 1.55, -1.5],
    ],
    { parent: "pelvis", names: ["tailA1", "tailA2", "tailA3"], role: "tail" },
  );
  b.sweep(tail, [0.035, 0.018], { color: body, name: "tail" });
  b.part(new THREE.SphereGeometry(0.06, b.segments(8), b.segments(6)), "#2a1a10", {
    at: [0, 1.5, -1.52],
    bone: "tailA3",
    name: "tailTuft",
  });

  return b.root;
}
```