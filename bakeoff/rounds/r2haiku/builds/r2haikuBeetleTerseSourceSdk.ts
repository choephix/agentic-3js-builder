import * as THREE from "three";
import { createBuilder, grain, mottle } from "../../../../src/index";

// A male stag beetle, about 7 cm long with its mandibles. +Z is forward, +X is the beetle's left.
// Stylised: glossy chitin shells, long jointed legs, and branched mandibles built as separate jaws.

export const meta = {
  name: "Stag beetle",
  description: "A male stag beetle with branched mandibles, glossy elytra, six jointed legs and clubbed antennae.",
};

type V = [number, number, number];

export default function stagBeetle() {
  const b = createBuilder({ name: "stag beetle", detail: 1, paintSize: 1024 });

  // Palette and paints.
  const CHITIN_DARK = "#17100a";
  const LEG = "#1f140b";
  const JAW = "#3d2a18";
  const ELYTRA = grain("#2c1a0e", "#6a4424", { size: 0.0035, axis: "z", seed: 3 });
  const HEAD = grain("#120c08", "#2c1f15", { size: 0.0025, axis: "x", seed: 7 });
  const SPECKLE = mottle("#2a1a0f", "#4d3220", { size: 0.004, seed: 11, contrast: 0.8 });

  const sphere = () => new THREE.SphereGeometry(1, b.segments(10), b.segments(7));
  // Mirror a point to the beetle's left (s = 1) or right (s = -1).
  const mirror = (p: V, s: number): V => [p[0] * s, p[1], p[2]];
  const sideName = (s: number) => (s > 0 ? "L" : "R");

  // Skeleton: root thorax, then head, abdomen.
  b.joint("thorax", { at: [0, 0.0125, 0] });
  b.joint("head", { parent: "thorax", at: [0, 0.016, 0.0265] });
  b.joint("abdomen", { parent: "thorax", at: [0, 0.0125, -0.0135] });

  // Thorax shield (pronotum) and head.
  b.part(sphere(), CHITIN_DARK, {
    at: [0, 0.0165, 0.011],
    scale: [0.0105, 0.0085, 0.0105],
    bone: "thorax",
    name: "pronotum",
  });
  b.part(sphere(), HEAD, {
    at: [0, 0.016, 0.0265],
    scale: [0.0075, 0.0068, 0.0082],
    bone: "head",
    name: "head",
  });

  // Compound eyes on the sides of the head.
  for (const s of [1, -1]) {
    b.part(sphere(), "#080503", {
      at: [s * 0.0062, 0.0172, 0.0295],
      scale: 0.0022,
      bone: "head",
      name: `eye${sideName(s)}`,
    });
  }

  // Elytra: two glossy wing cases over the abdomen, drawn with a grain paint.
  for (const s of [1, -1]) {
    b.part(sphere(), ELYTRA, {
      at: [s * 0.0062, 0.0175, -0.0075],
      scale: [0.0068, 0.0095, 0.0245],
      bone: "abdomen",
      name: `elytra${sideName(s)}`,
    });
  }
  // A few speckles on the shells for surface interest.
  for (const s of [1, -1]) {
    for (const [i, z] of [-0.0005, -0.0125, -0.0225].entries()) {
      b.part(sphere(), SPECKLE, {
        at: [s * (0.0062 + (i % 2 ? 0.0018 : -0.0014)), 0.0255 - i * 0.0004, z],
        scale: [0.0018, 0.0012, 0.0018],
        bone: "abdomen",
        name: `speck${sideName(s)}${i}`,
      });
    }
  }

  // Legs: three pairs, each a jointed chain (hip, knee, ankle, foot) swept into a tapering tube.
  const legs: Array<[V, V, V, V]> = [
    [
      [0.0105, 0.0102, 0.0105],
      [0.0205, 0.0085, 0.0165],
      [0.0265, 0.0035, 0.0185],
      [0.0295, 0.0008, 0.0195],
    ],
    [
      [0.011, 0.0102, 0.0],
      [0.0225, 0.0085, 0.0],
      [0.0285, 0.0035, 0.0],
      [0.0315, 0.0008, -0.001],
    ],
    [
      [0.0105, 0.0102, -0.0105],
      [0.0205, 0.0085, -0.0135],
      [0.0265, 0.0035, -0.0175],
      [0.0295, 0.0008, -0.0195],
    ],
  ];
  for (const s of [1, -1]) {
    const L = sideName(s);
    legs.forEach(([hip, knee, ankle, foot], k) => {
      const n = k + 1;
      const chain = b.chain(`leg${L}${n}`, [hip, knee, ankle, foot].map((p) => mirror(p, s)), {
        parent: "thorax",
        names: [`hip${L}${n}`, `knee${L}${n}`, `ankle${L}${n}`, `foot${L}${n}`],
        role: "leg",
      });
      b.sweep(chain, [0.0011, 0.0009, 0.0008, 0.0005], { color: LEG, name: `leg${L}${n}` });
    });
  }

  // Mandibles: branched jaws that sweep forward, rise and curl inward, each with an inner tooth.
  const jawPath: V[] = [
    [0.004, 0.0165, 0.03],
    [0.01, 0.0175, 0.04],
    [0.0135, 0.02, 0.05],
    [0.0105, 0.0205, 0.0605],
  ];
  for (const s of [1, -1]) {
    const L = sideName(s);
    const jaw = b.chain(`jaw${L}`, jawPath.map((p) => mirror(p, s)), {
      parent: "head",
      names: [`jaw${L}`, `jaw${L}2`, `jaw${L}3`, `jaw${L}tip`],
      role: "jaw",
    });
    b.sweep(jaw, [0.0028, 0.0024, 0.0016, 0.0007], { color: JAW, name: `jaw${L}` });
    // Inner teeth point toward the midline and up.
    b.spike(jaw.at(0.4), [s * -0.5, 0.7, 0.25], 0.006, 0.0009, { color: JAW, name: `tooth${L}1` });
    b.spike(jaw.at(0.75), [s * -0.4, 0.8, 0.1], 0.0045, 0.0007, { color: JAW, name: `tooth${L}2` });
  }

  // Antennae: elbowed chains with a clubbed tip.
  const antennaPath: V[] = [
    [0.0042, 0.0205, 0.0315],
    [0.0068, 0.0228, 0.0345],
    [0.0095, 0.0232, 0.0372],
    [0.0102, 0.0214, 0.0404],
  ];
  for (const s of [1, -1]) {
    const L = sideName(s);
    const pts = antennaPath.map((p) => mirror(p, s));
    const ant = b.chain(`antenna${L}`, pts, {
      parent: "head",
      names: [`ant${L}1`, `ant${L}2`, `ant${L}3`, `ant${L}tip`],
      role: "tentacle",
    });
    b.sweep(ant, [0.0006, 0.0005, 0.0004, 0.0004], { color: LEG, name: `antenna${L}` });
    b.part(sphere(), "#2a1a0e", {
      at: pts[3],
      scale: [0.0016, 0.0028, 0.0016],
      bone: `ant${L}tip`,
      name: `club${L}`,
    });
  }

  return b.root;
}
