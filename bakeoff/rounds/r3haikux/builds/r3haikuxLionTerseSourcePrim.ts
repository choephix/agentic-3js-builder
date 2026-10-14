import * as THREE from "three";
import { countershade, createBuilder, mottle, rng } from "../../../../src/index";
import type { Hit } from "../../../../src/index";

export const meta = {
  name: "Lion",
  description:
    "A male lion at rest: tawny coat, cream muzzle and chin, shaggy dark mane, amber eyes and a dark tail tuft.",
};

const TAWNY = "#c99650";
const TAWNY_DEEP = "#8c5c2a";
const BELLY = "#eedbab";
const CREAM = "#f3e4c0";
const MANE_DARK = "#3a2312";
const MANE_OCHRE = "#8f5d2a";
const NOSE = "#221610";
const AMBER = "#eaa42c";
const PUPIL = "#120a05";
const EAR = "#5b3a1f";
const TUFT = "#2a190c";

/** A radius that is linear between `stops`: [t, r] pairs with t ascending. */
function ramp(stops: ReadonlyArray<readonly [number, number]>) {
  return (t: number): number => {
    if (t <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++) {
      const [t1, r1] = stops[i];
      if (t <= t1) {
        const [t0, r0] = stops[i - 1];
        return r0 + ((r1 - r0) * (t - t0)) / (t1 - t0);
      }
    }
    return stops[stops.length - 1][1];
  };
}

export default function lion() {
  const b = createBuilder({ name: "lion", paintSize: 1024 });
  const seg = (n: number) => b.segments(n);
  const random = rng(7);

  // Paints: a mottled tawny coat that darkens along the back and goes cream underneath; a dark mottled mane.
  const fur = mottle(TAWNY, TAWNY_DEEP, { size: 0.22, seed: 4, contrast: 0.8 });
  const coat = countershade(fur, BELLY, { level: -0.35, soft: 0.3 });
  const mane = mottle(MANE_DARK, MANE_OCHRE, { size: 0.08, seed: 9, contrast: 0.9 });

  // Skeleton in rest pose: pelvis root, spine, neck to the head, jaw, tail and four legs.
  b.joint("pelvis", { at: [0, 0.99, -0.36] });
  const spine = b.chain(
    "spine",
    [
      [0, 1.0, -0.24],
      [0, 1.01, 0.06],
      [0, 1.02, 0.36],
    ],
    { parent: "pelvis", names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 1.02, 0.36],
      [0, 1.1, 0.6],
      [0, 1.2, 0.84],
    ],
    { parent: "spine2", names: ["neck1", "neck2", "head"], role: "neck" },
  );
  b.joint("jaw", { parent: "head", at: [0, 1.1, 0.98], role: "jaw" });
  const tail = b.chain(
    "tail",
    [
      [0, 0.99, -0.6],
      [0, 0.96, -0.84],
      [0, 0.9, -1.06],
      [0, 0.8, -1.24],
      [0, 0.66, -1.36],
    ],
    { parent: "pelvis", names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );

  // Torso: one tube along the spine, a little longer at the rump and the chest.
  const bodyRx = ramp([
    [0, 0.18],
    [0.5, 0.17],
    [1, 0.2],
  ]);
  const bodyRy = ramp([
    [0, 0.2],
    [0.5, 0.18],
    [1, 0.2],
  ]);
  b.sweep(spine, {
    radius: (t: number): [number, number] => [bodyRx(t), bodyRy(t)],
    color: coat,
    sides: 10,
    extend: [0.2, 0.08],
    name: "torso",
  });

  // Neck: a thick tube under the mane.
  b.sweep(neck, { radius: ramp([[0, 0.15], [1, 0.13]]), color: coat, sides: 8, name: "neck" });

  // Tail: tawny, with a dark tuft at the tip.
  b.sweep(tail, {
    radius: ramp([
      [0, 0.06],
      [0.5, 0.042],
      [0.86, 0.03],
      [1, 0.028],
    ]),
    color: coat,
    bands: [
      [0.86, coat],
      [1, TUFT],
    ],
    sides: 8,
    name: "tail",
  });
  b.part(new THREE.SphereGeometry(0.05, seg(8), seg(6)), TUFT, {
    at: [0, 0.66, -1.36],
    bone: "tail5",
    scale: [1, 1.25, 1],
    name: "tailTuft",
  });
  for (const [dx, dy] of [
    [0.5, -0.2],
    [-0.5, -0.25],
    [0.1, -0.5],
  ]) {
    b.spike([0, 0.66, -1.36], [dx, dy, -1], 0.11, 0.018, { color: TUFT, sides: 5, bone: "tail5" });
  }

  // Legs, haunches and shoulders, with a paw at each tip.
  for (const side of [1, -1]) {
    const S = side > 0 ? "L" : "R";
    const x = (v: number) => side * v;
    const fore = b.chain(
      `fore${S}`,
      [
        [x(0.2), 1.0, 0.34],
        [x(0.21), 0.52, 0.38],
        [x(0.2), 0.16, 0.44],
        [x(0.2), 0.05, 0.5],
      ],
      { parent: "spine2", names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `forePaw${S}`], role: "leg" },
    );
    const hind = b.chain(
      `hind${S}`,
      [
        [x(0.2), 0.99, -0.42],
        [x(0.22), 0.56, -0.34],
        [x(0.19), 0.2, -0.6],
        [x(0.2), 0.05, -0.52],
      ],
      { parent: "pelvis", names: [`hip${S}`, `knee${S}`, `hock${S}`, `hindPaw${S}`], role: "leg" },
    );
    b.sweep(fore, {
      radius: ramp([
        [0, 0.115],
        [0.46, 0.075],
        [0.83, 0.058],
        [1, 0.05],
      ]),
      color: coat,
      sides: 8,
      name: `foreLeg${S}`,
    });
    b.sweep(hind, {
      radius: ramp([
        [0, 0.13],
        [0.42, 0.08],
        [0.84, 0.058],
        [1, 0.05],
      ]),
      color: coat,
      sides: 8,
      name: `hindLeg${S}`,
    });

    b.part(new THREE.SphereGeometry(0.07, seg(10), seg(7)), coat, {
      at: [x(0.2), 0.03, 0.52],
      bone: `forePaw${S}`,
      scale: [1, 0.55, 1.35],
      name: `forePaw${S}`,
    });
    b.part(new THREE.SphereGeometry(0.07, seg(10), seg(7)), coat, {
      at: [x(0.2), 0.03, -0.5],
      bone: `hindPaw${S}`,
      scale: [1, 0.55, 1.35],
      name: `hindPaw${S}`,
    });
    b.part(new THREE.SphereGeometry(0.17, seg(12), seg(9)), coat, {
      at: [x(0.17), 0.98, -0.4],
      bone: `hip${S}`,
      scale: [0.85, 1.05, 1],
      name: "haunch",
    });
    b.part(new THREE.SphereGeometry(0.15, seg(10), seg(8)), coat, {
      at: [x(0.17), 1.0, 0.3],
      bone: `shoulder${S}`,
      scale: [0.9, 1.05, 1],
      name: "shoulder",
    });
  }

  // Head (bone: head): skull, cream muzzle, nose, eyes and ears.
  b.part(new THREE.SphereGeometry(0.14, seg(14), seg(10)), coat, {
    at: [0, 1.22, 0.95],
    bone: "head",
    scale: [0.96, 0.93, 1.04],
    name: "skull",
  });
  b.part(new THREE.SphereGeometry(0.1, seg(12), seg(9)), CREAM, {
    at: [0, 1.15, 1.09],
    bone: "head",
    scale: [1.05, 0.75, 0.95],
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(0.04, seg(8), seg(6)), NOSE, {
    at: [0, 1.19, 1.178],
    bone: "head",
    scale: [1.35, 0.72, 0.62],
    name: "nose",
  });
  const muzzleFront = (x: number, y: number) =>
    1.09 + 0.095 * Math.sqrt(Math.max(0, 1 - (x / 0.105) ** 2 - ((y - 1.15) / 0.075) ** 2));
  for (const side of [1, -1]) {
    const x = side * 0.068;
    b.part(new THREE.SphereGeometry(0.032, seg(8), seg(6)), AMBER, { at: [x, 1.25, 1.035], bone: "head", name: "eye" });
    b.part(new THREE.SphereGeometry(0.015, seg(6), seg(4)), PUPIL, { at: [x, 1.25, 1.06], bone: "head", name: "pupil" });
    b.part(new THREE.SphereGeometry(0.042, seg(8), seg(6)), EAR, {
      at: [side * 0.088, 1.345, 0.99],
      bone: "head",
      scale: [1, 0.9, 0.5],
      name: "ear",
    });
    for (const [dx, y] of [
      [0.032, 1.166],
      [0.064, 1.158],
    ]) {
      b.part(new THREE.SphereGeometry(0.009, seg(6), seg(4)), NOSE, {
        at: [side * dx, y, muzzleFront(dx, y) - 0.002],
        bone: "head",
        name: "whiskerDot",
      });
    }
  }

  // Lower jaw (bone: jaw): a rounded chin that can hinge open.
  b.part(new THREE.CapsuleGeometry(0.036, 0.12, seg(3), seg(8)), CREAM, {
    at: [0, 1.085, 1.085],
    bone: "jaw",
    rotation: [90, 0, 0],
    name: "jaw",
  });

  // Mane: a dark mottled shell on the head and the neck, bristling with tapered tufts.
  const maneBack = b.part(new THREE.SphereGeometry(0.19, seg(12), seg(8)), mane, {
    at: [0, 1.19, 0.79],
    bone: "head",
    scale: [1.05, 0.98, 0.92],
    name: "mane",
  });
  const maneNeck = b.part(new THREE.SphereGeometry(0.16, seg(12), seg(8)), mane, {
    at: [0, 1.1, 0.5],
    bone: "neck1",
    scale: [1.1, 0.92, 0.9],
    name: "maneCollar",
  });

  const flow = new THREE.Vector3(0, 0.35, -1).normalize();
  const tufts = (hits: readonly Hit[], base: number, span: number, radius: number) => {
    for (const hit of hits) {
      const dir = hit.n.clone().addScaledVector(flow, 0.6).normalize();
      const root = hit.at.clone().addScaledVector(hit.n, -0.012);
      b.spike(root, dir, base + span * random(), radius * (0.75 + 0.5 * random()), {
        color: random() < 0.6 ? MANE_DARK : MANE_OCHRE,
        sides: 5,
        bone: hit.bone ?? "head",
      });
    }
  };

  const upper = b.surface(maneBack).scatter(110, {
    rng: random,
    minDist: 0.034,
    filter: (h) => h.n.z < 0.3 && !(h.at.z > 0.82 && h.n.y > 0.3),
  });
  const lower = b.surface(maneNeck).scatter(45, {
    rng: random,
    minDist: 0.034,
    filter: (h) => h.n.z < 0.2 && h.at.y < 1.2,
  });
  tufts(upper, 0.1, 0.09, 0.03);
  tufts(lower, 0.08, 0.07, 0.027);

  return b.root;
}
