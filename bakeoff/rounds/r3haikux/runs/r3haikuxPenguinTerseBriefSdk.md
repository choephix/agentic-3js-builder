```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Penguin",
  description:
    "A stylised penguin with a black back and head, white bib, golden ear patches, orange beak and webbed feet, built from lathes, cones and flat extrusions.",
};

// Flat palette: one material per colour.
const C = {
  back: "#1b1f29",
  flipper: "#262b36",
  leg: "#2a2e37",
  white: "#f6f4ec",
  gold: "#f2b233",
  beakTop: "#f7a51d",
  beakLow: "#e5821a",
  foot: "#ef8a1d",
  eye: "#0d0e12",
};

// Torso outline as (radius, height) pairs, bottom to top, relative to the torso centre.
const TORSO: [number, number][] = [
  [0.01, -0.28], [0.09, -0.275], [0.15, -0.235], [0.182, -0.15],
  [0.195, -0.04], [0.192, 0.07], [0.172, 0.17], [0.13, 0.25], [0.07, 0.29], [0.01, 0.31],
];

// White bib: the same outline a few percent proud, cut off under the chin.
const BIB: [number, number][] = [
  [0.095, -0.272], [0.155, -0.23], [0.19, -0.14], [0.202, -0.04],
  [0.2, 0.07], [0.18, 0.17], [0.13, 0.23], [0.05, 0.25],
];

const profile = (p: [number, number][]) =>
  p.map(([r, y]) => new THREE.Vector2(r, y));

// Flat flipper: a leaf outline extruded thin, hanging from the shoulder and splayed outward.
// `side` is +1 for the left (+X) flipper and -1 for the right.
function flipperGeometry(side: number) {
  const s = new THREE.Shape();
  s.moveTo(-0.045, 0.02);
  s.lineTo(0.042, 0.02);
  s.lineTo(0.052, -0.07);
  s.lineTo(0.046, -0.16);
  s.lineTo(0.028, -0.235);
  s.lineTo(0.004, -0.275);
  s.lineTo(-0.022, -0.24);
  s.lineTo(-0.042, -0.16);
  s.lineTo(-0.05, -0.07);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.022, bevelEnabled: false });
  g.rotateY(Math.PI / 2); // extrusion becomes world X: the leaf lies in the YZ plane
  g.translate(-0.011, 0, 0); // centre the thickness on the shoulder
  g.rotateZ(side * 0.26); // splay the tip outward
  return g;
}

// Webbed foot lying on the floor: three toes fanned forward, webs scalloped between them.
function footGeometry() {
  const s = new THREE.Shape();
  // Shape y is -Z, so negative y becomes forward (+Z) after the turn below.
  s.moveTo(-0.034, 0.02);
  s.lineTo(0.034, 0.02);
  s.lineTo(0.058, -0.04);
  s.lineTo(0.05, -0.12);
  s.lineTo(0.02, -0.075);
  s.lineTo(0.0, -0.13);
  s.lineTo(-0.02, -0.075);
  s.lineTo(-0.05, -0.12);
  s.lineTo(-0.058, -0.04);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.014, bevelEnabled: false });
  g.rotateX(-Math.PI / 2); // lie flat: thickness becomes +Y (0 to 0.014)
  return g;
}

// A cone rotated by theta about X (apex along +Y before the turn). `base` is the
// centre of its base; the returned `at` is the centre of the cone, where it is placed.
function cone(
  r: number,
  h: number,
  theta: number,
  base: [number, number, number],
) {
  const geo = new THREE.ConeGeometry(r, h, 6);
  geo.rotateX(theta);
  const at: [number, number, number] = [
    base[0],
    base[1] + Math.cos(theta) * (h / 2),
    base[2] + Math.sin(theta) * (h / 2),
  ];
  return { geo, at };
}

export default function build() {
  const b = createBuilder({ name: "penguin" });

  // Skeleton: spine from hips to head, a two-part beak that opens, a tail,
  // two short legs and two flippers hanging from the chest.
  const hips = b.joint("hips", { at: [0, 0.2, 0] });
  const chest = b.joint("chest", { at: [0, 0.36, 0], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.56, 0.01], parent: chest });
  const head = b.joint("head", { at: [0, 0.65, 0.02], parent: neck });
  const upperJaw = b.joint("upperJaw", { at: [0, 0.655, 0.13], parent: head });
  const jaw = b.joint("jaw", { at: [0, 0.624, 0.12], parent: head });
  const tail = b.joint("tail", { at: [0, 0.14, -0.17], parent: hips });
  const hipL = b.joint("hipL", { at: [0.08, 0.15, 0], parent: hips });
  const ankleL = b.joint("ankleL", { at: [0.08, 0.02, 0], parent: hipL });
  const hipR = b.joint("hipR", { at: [-0.08, 0.15, 0], parent: hips });
  const ankleR = b.joint("ankleR", { at: [-0.08, 0.02, 0], parent: hipR });
  const wingL = b.joint("wingL", { at: [0.18, 0.5, 0], parent: chest });
  const wingR = b.joint("wingR", { at: [-0.18, 0.5, 0], parent: chest });

  // Body: a black back from a lathe, and a white bib as a partial lathe
  // hugging the front, a few percent proud of the back so the edges read.
  const bodyScale: [number, number, number] = [1, 1, 0.9];
  b.part(new THREE.LatheGeometry(profile(TORSO), 16), C.back, {
    at: [0, 0.34, 0],
    bone: chest,
    scale: bodyScale,
  });
  b.part(new THREE.LatheGeometry(profile(BIB), 10, -0.85, 1.7), C.white, {
    at: [0, 0.34, 0],
    bone: chest,
    scale: bodyScale,
  });

  // Head: a chunky black sphere, slightly flattened on top.
  b.part(new THREE.SphereGeometry(0.125, 14, 10), C.back, {
    at: [0, 0.65, 0.02],
    bone: head,
    scale: [1, 0.96, 1],
  });

  // Face: golden ear patches, big white eyes with a pupil and a glint.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), C.gold, {
      at: [s * 0.116, 0.66, 0],
      bone: head,
      scale: [0.03, 0.05, 0.055],
    });
    b.part(new THREE.SphereGeometry(0.03, 10, 8), C.white, {
      at: [s * 0.056, 0.675, 0.14],
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.016, 8, 6), C.eye, {
      at: [s * 0.064, 0.679, 0.164],
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.005, 6, 4), C.white, {
      at: [s * 0.07, 0.687, 0.177],
      bone: head,
    });
  }

  // Beak: two flattened cones, one per mandible, so the mouth can open.
  const up = cone(0.036, 0.095, Math.PI / 2 + 0.12, [0, 0.655, 0.13]);
  b.part(up.geo, C.beakTop, {
    at: up.at,
    bone: upperJaw,
    scale: [1, 0.75, 1],
  });
  const low = cone(0.028, 0.08, Math.PI / 2 + 0.04, [0, 0.624, 0.12]);
  b.part(low.geo, C.beakLow, {
    at: low.at,
    bone: jaw,
    scale: [1, 0.6, 1],
  });

  // Tail: a small black wedge tucked under the back, pointing back and down.
  const tailWedge = cone(0.04, 0.09, -Math.PI / 2 - 0.4, [0, 0.158, -0.13]);
  b.part(tailWedge.geo, C.back, { at: tailWedge.at, bone: tail });

  // Legs and webbed feet.
  for (const s of [1, -1]) {
    const hip = s > 0 ? hipL : hipR;
    const ankle = s > 0 ? ankleL : ankleR;
    b.part(new THREE.CylinderGeometry(0.018, 0.02, 0.134, 6), C.leg, {
      at: [s * 0.08, 0.082, 0],
      bone: hip,
    });
    b.part(footGeometry(), C.foot, {
      at: [s * 0.08, 0, 0],
      bone: ankle,
    });
  }

  // Flippers: flat leaves hanging along the sides, splayed a little outward.
  for (const s of [1, -1]) {
    b.part(flipperGeometry(s), C.flipper, {
      at: [s * 0.18, 0.5, 0],
      bone: s > 0 ? wingL : wingR,
    });
  }

  return b.root;
}
```