```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Red panda",
  description:
    "A stylised red panda in a rest pose: rust coat, cream face, dark belly and legs, and a ringed bushy tail.",
};

// Palette: six flat colours.
const RUST = "#b5501e";
const RUST_DEEP = "#7a3216";
const DARK = "#2a1911";
const RING = "#4a2a1b";
const CREAM = "#f2e3c6";
const BLACK = "#120c0a";

/** An ellipsoid: a sphere of radius r stretched by (sx, sy, sz). */
function blob(r: number, sx: number, sy: number, sz: number, seg = 14) {
  const g = new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7));
  g.scale(sx, sy, sz);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "red panda" });

  // Skeleton in rest pose: +Y up, faces +Z, +X is the animal's left.
  const hips = b.joint("hips", { at: [0, 0.28, -0.2] });
  const chest = b.joint("chest", { at: [0, 0.3, 0.1], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.37, 0.2], parent: chest });
  const head = b.joint("head", { at: [0, 0.43, 0.3], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.35, 0.3], parent: head });

  // Tail: a chain running back from the rump, lifting slightly at the tip.
  const tail = b.chain(
    "tail",
    [
      [0, 0.3, -0.2],
      [0, 0.3, -0.34],
      [0, 0.31, -0.48],
      [0, 0.33, -0.6],
      [0, 0.37, -0.7],
    ],
    { role: "tail" },
  );

  // Mirrored pairs: legs and ears. s = +1 is the left side (+X).
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = 0.09 * s;

    const shoulder = b.joint(`shoulder${S}`, { at: [x, 0.26, 0.1], parent: chest });
    const elbow = b.joint(`elbow${S}`, { at: [x, 0.14, 0.1], parent: shoulder });
    const wrist = b.joint(`wrist${S}`, { at: [x, 0.05, 0.11], parent: elbow });
    const hip = b.joint(`hip${S}`, { at: [x, 0.26, -0.12], parent: hips });
    const knee = b.joint(`knee${S}`, { at: [x, 0.14, -0.11], parent: hip });
    const ankle = b.joint(`ankle${S}`, { at: [x, 0.05, -0.1], parent: knee });
    const earJ = b.joint(`ear${S}`, { at: [0.085 * s, 0.5, 0.27], parent: head });

    // Legs: thick upper segments, slimmer lower ones, dark coat.
    b.part(new THREE.CapsuleGeometry(0.045, 0.03, 3, 8), DARK, { at: [x, 0.2, 0.1], bone: shoulder });
    b.part(new THREE.CapsuleGeometry(0.034, 0.022, 3, 8), DARK, { at: [x, 0.095, 0.105], bone: elbow });
    b.part(new THREE.CapsuleGeometry(0.045, 0.03, 3, 8), DARK, { at: [x, 0.2, -0.115], bone: hip });
    b.part(new THREE.CapsuleGeometry(0.034, 0.022, 3, 8), DARK, { at: [x, 0.095, -0.105], bone: knee });

    // Paws, flattened and pointing forward.
    b.part(blob(0.05, 1.0, 0.55, 1.35, 12), DARK, { at: [x, 0.028, 0.13], bone: wrist });
    b.part(blob(0.05, 1.0, 0.55, 1.35, 12), DARK, { at: [x, 0.028, -0.09], bone: ankle });

    // Ears: rust cones tilted out and back, with a cream inner face showing at the front.
    const ear = new THREE.ConeGeometry(0.055, 0.13, 6);
    ear.rotateZ(-0.25 * s);
    ear.rotateX(-0.2);
    b.part(ear, RUST, { at: [0.085 * s, 0.555, 0.27], bone: earJ });

    const inner = new THREE.ConeGeometry(0.03, 0.085, 6);
    inner.rotateZ(-0.25 * s);
    inner.rotateX(-0.2);
    b.part(inner, CREAM, { at: [0.085 * s, 0.55, 0.3], bone: earJ });
  }

  // Body: rust barrel, deeper dorsal saddle, dark underside, neck.
  b.part(blob(0.15, 0.92, 0.88, 1.3), RUST, { at: [0, 0.285, -0.01], bone: chest });
  b.part(blob(0.1, 0.5, 0.6, 1.2), RUST_DEEP, { at: [0, 0.4, -0.02], bone: chest });
  b.part(blob(0.14, 0.8, 0.5, 1.2), DARK, { at: [0, 0.2, 0], bone: chest });
  b.part(blob(0.1, 0.95, 1.0, 1.0), RUST, { at: [0, 0.36, 0.2], bone: neck });

  // Head: rust skull, cream muzzle, separate lower jaw.
  const headMesh = b.part(blob(0.12, 1.1, 0.95, 1.0, 16), RUST, { at: [0, 0.43, 0.3], bone: head });
  const muzzle = b.part(blob(0.07, 1.05, 0.8, 1.0), CREAM, { at: [0, 0.395, 0.39], bone: head });
  b.part(blob(0.055, 0.9, 0.5, 1.1), CREAM, { at: [0, 0.35, 0.39], bone: jaw });

  // Face details seated on the curved surfaces.
  const skull = b.surface(headMesh);
  const snout = b.surface(muzzle);

  b.stick(new THREE.SphereGeometry(0.022, 10, 8), BLACK, snout.nearest([0, 0.41, 0.52]));
  for (const s of [1, -1]) {
    b.stick(new THREE.SphereGeometry(0.042, 12, 9), CREAM, skull.nearest([0.12 * s, 0.39, 0.37]));
    b.stick(new THREE.SphereGeometry(0.024, 10, 8), BLACK, skull.nearest([0.06 * s, 0.46, 0.46]));
  }

  // Tail: a rust core with bushy, alternating rust and dark rings along its length.
  b.sweep(tail, 0.05, { color: RUST });
  const N = 8;
  let k = 0;
  b.along(tail, N, (at) => {
    const t = (k + 0.5) / N;
    const r = 0.046 + 0.03 * Math.sin(Math.PI * t);
    b.part(new THREE.SphereGeometry(r, 12, 9), k % 2 === 0 ? RUST : RING, { at });
    k += 1;
  });

  return b.root;
}
```