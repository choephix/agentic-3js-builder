import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Young reticulated giraffe",
  description:
    "A young reticulated giraffe with chestnut patches outlined in cream, a stiff brown mane, fuzzy ossicones with black tufts, big ears, long lashes, a dark tongue and cream-fading legs.",
};

// Ellipsoid helper: a unit sphere stretched to the given radii.
function ell(rx: number, ry: number, rz: number, w = 14, h = 10) {
  const g = new THREE.SphereGeometry(1, w, h);
  g.scale(rx, ry, rz);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "reticulated-giraffe" });
  const R = rng(20240611);

  const C = {
    fawn: "#d9a85c",
    patch: "#8a4a23",
    cream: "#f6ebcf",
    blend: "#e2c890",
    mane: "#4a2d17",
    horn: "#6e4b2c",
    tuft: "#1c1411",
    hoof: "#2b1f17",
    tongue: "#3b1a24",
    eye: "#120d0b",
    ear: "#c99a68",
  };

  // ---- Skeleton ----
  const body = b.joint("body", { at: [0, 2.2, 0] });
  const neckBase = b.joint("neckBase", { at: [0, 2.55, 0.5], parent: body });
  const neckTop = b.joint("neckTop", { at: [0, 3.2, 0.95], parent: neckBase });
  const head = b.joint("head", { at: [0, 3.5, 1.2], parent: neckTop });

  // ---- Torso ----
  const torso = b.sweep(
    [
      [0, 2.2, -0.85],
      [0, 2.25, 0],
      [0, 2.3, 0.55],
    ],
    0.5,
    { color: C.fawn }
  );
  b.part(ell(0.5, 0.5, 0.52), C.fawn, { at: [0, 2.2, -0.85], bone: body });
  b.part(ell(0.48, 0.48, 0.5), C.fawn, { at: [0, 2.3, 0.55], bone: body });

  // ---- Neck ----
  const neckPts = [
    [0, 2.55, 0.5],
    [0, 2.95, 0.75],
    [0, 3.25, 0.98],
    [0, 3.45, 1.12],
  ];
  const neckTube = b.sweep(neckPts, 0.22, { color: C.fawn });
  const neckSkin = b.surface(neckTube);
  const nc = (t: number): [number, number, number] => [
    0,
    2.55 + 0.9 * t,
    0.5 + 0.62 * t,
  ];

  // ---- Head ----
  b.part(ell(0.2, 0.19, 0.3), C.fawn, { at: [0, 3.5, 1.25], bone: head });
  b.part(new THREE.BoxGeometry(0.2, 0.15, 0.22), C.cream, {
    at: [0, 3.42, 1.5],
    bone: head,
  });
  for (const s of [1, -1]) {
    // Eyes
    b.part(ell(0.045, 0.045, 0.045, 10, 8), C.eye, {
      at: [s * 0.2, 3.57, 1.27],
      bone: head,
    });
    // Lashes fanning above each eye
    for (let k = 0; k < 4; k++) {
      b.part(new THREE.BoxGeometry(0.012, 0.055, 0.01), C.eye, {
        at: [s * 0.2, 3.6, 1.24 + k * 0.035],
        dir: [s * 0.4, 1, -0.05],
        bone: head,
      });
    }
    // Big ears, swept back and out
    const ear = ell(0.17, 0.045, 0.08, 10, 8);
    ear.rotateY(s * 0.35);
    b.part(ear, C.fawn, { at: [s * 0.24, 3.6, 1.12], bone: head });
    const inner = ell(0.13, 0.03, 0.06, 8, 6);
    inner.rotateY(s * 0.35);
    b.part(inner, C.ear, { at: [s * 0.26, 3.6, 1.11], bone: head });
    // Fuzzy ossicones with black tufts
    b.sweep(
      [
        [s * 0.085, 3.62, 1.2],
        [s * 0.1, 3.82, 1.19],
      ],
      0.034,
      { color: C.horn }
    );
    b.part(ell(0.05, 0.05, 0.05, 10, 8), C.tuft, {
      at: [s * 0.1, 3.86, 1.19],
      bone: head,
    });
  }
  // Long dark tongue peeking out
  b.sweep(
    [
      [0, 3.36, 1.58],
      [0, 3.31, 1.72],
      [0, 3.27, 1.87],
    ],
    0.026,
    { color: C.tongue }
  );

  // ---- Legs: tan above, blending to cream above the hooves ----
  for (const s of [1, -1]) {
    for (const z of [0.45, -0.5]) {
      const x = s * 0.27;
      b.sweep(
        [
          [x, 2.0, z],
          [x, 1.2, z],
        ],
        0.09,
        { color: C.fawn }
      );
      b.sweep(
        [
          [x, 1.2, z],
          [x, 0.9, z],
        ],
        0.08,
        { color: C.blend }
      );
      b.sweep(
        [
          [x, 0.9, z],
          [x, 0.25, z],
        ],
        0.065,
        { color: C.cream }
      );
      b.part(new THREE.CylinderGeometry(0.075, 0.09, 0.14, 8), C.hoof, {
        at: [x, 0.07, z],
      });
    }
  }

  // ---- Chestnut patches with cream outlines ----
  const spot = (skin: ReturnType<typeof b.surface>, p: [number, number, number]) => {
    const hit = skin.nearest(p);
    const s = 0.8 + R() * 0.5;
    const outline = new THREE.SphereGeometry(0.21 * s, 10, 6);
    outline.scale(1, 0.13, 1);
    const patch = new THREE.SphereGeometry(0.16 * s, 10, 6);
    patch.scale(1, 0.22, 1);
    b.stick(outline, C.cream, hit);
    b.stick(patch, C.patch, hit);
  };

  const torsoSkin = b.surface(torso);
  for (const z of [-0.75, -0.45, -0.15, 0.15, 0.42]) {
    for (const deg of [25, 65, 105, 145, 185, 325]) {
      if (R() < 0.2) continue;
      const a = (deg * Math.PI) / 180;
      spot(torsoSkin, [0.5 * Math.cos(a), 2.2 + 0.5 * Math.sin(a), z]);
    }
  }

  for (const t of [0.2, 0.4, 0.6, 0.8]) {
    const c = nc(t);
    for (const s of [1, -1]) {
      if (R() < 0.15) continue;
      spot(neckSkin, [c[0] + s * 0.22, c[1], c[2]]);
    }
  }

  // ---- Stiff brown mane down the crest of the neck ----
  for (let i = 0; i < 12; i++) {
    const t = 0.08 + i * 0.075;
    const c = nc(t);
    const hit = neckSkin.nearest([c[0], c[1] + 0.2, c[2] - 0.02]);
    const hair = new THREE.ConeGeometry(0.022, 0.13, 5);
    hair.translate(0, 0.065, 0);
    b.stick(hair, C.mane, hit);
  }

  return b.root;
}
