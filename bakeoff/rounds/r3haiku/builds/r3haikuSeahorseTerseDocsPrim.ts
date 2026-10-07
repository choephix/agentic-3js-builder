import * as THREE from "three";
import { createBuilder, catmull, spots } from "../../../../src/index";

const BODY = "#e9a23b";
const SPOT = "#b35a1f";
const BELLY = "#f7d58a";
const FIN = "#fbe9b5";
const PLATE = "#c8781f";
const CROWN = "#d8482c";
const DARK = "#5a2d12";
const EYE = "#151515";
const WHITE = "#fff8e6";

export const meta = {
  name: "seahorse",
  description: "A golden seahorse with a curled prehensile tail, a red crown, side spines and pale fins.",
};

export default function build() {
  const b = createBuilder({ name: "seahorse" });
  const coat = spots(BODY, SPOT, { size: 0.035, amount: 0.3, seed: 4 });

  // Skeleton: hips, upright segmented trunk, head with a separate lower jaw, curled tail.
  const hips = b.joint("hips", { at: [0, 0.07, 0], role: "spine" });

  const torso = b.chain(
    "torso",
    catmull([
      [0, 0.07, 0],
      [0, 0.115, -0.003],
      [0, 0.158, 0],
      [0, 0.192, 0.02],
    ]),
    { parent: hips, names: ["torso1", "torso2", "torso3"], role: "spine" },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.07, -0.01],
      [0, 0.07, -0.05],
      [0, 0.04, -0.075],
      [0, 0.006, -0.06],
      [0, 0.03, -0.035],
      [0, 0.05, -0.03],
    ]),
    { parent: hips, role: "tail" },
  );

  const head = b.joint("head", {
    parent: torso.joints[2],
    at: [0, 0.195, 0.025],
    aim: [0, 0.19, 0.11],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.05, up: -0.012 }),
    aim: head.local({ forward: 0.13, up: -0.02 }),
    role: "jaw",
  });

  // Trunk: a blocky, boxy section that swells at the belly.
  const girth = (t: number) => Math.sin(Math.PI * t);
  const trunk = b.sweep(torso, (t) => [0.02 + 0.012 * girth(t), 0.017 + 0.008 * girth(t)], {
    section: "box",
    color: coat,
  });

  // Side spines along the trunk, seated on the surface.
  for (let i = 1; i <= 5; i++) {
    const t = i / 6;
    for (const deg of [90, -90]) {
      b.stick(new THREE.ConeGeometry(0.005, 0.02, 5), PLATE, trunk.at(t, deg));
    }
  }

  // Tail: a tapering curl with a pale tip.
  b.sweep(tail, (t) => 0.011 - 0.005 * t, {
    color: coat,
    bands: [
      [0.75, coat],
      [1, BELLY],
    ],
    caps: { end: "point" },
  });

  // Head: a rounded block, an upper snout and a separate lower jaw.
  b.capsule(head.local({ forward: -0.012 }), head.local({ forward: 0.02, up: 0.004 }), 0.026, {
    bone: head,
    color: coat,
  });

  b.sweep(
    [head.local({ forward: 0.0, up: -0.006 }), head.local({ forward: 0.13, up: -0.012 })],
    [0.012, 0.008],
    { bone: head, color: coat, caps: { end: "round" } },
  );

  b.sweep(
    [jaw.local({ forward: -0.02, up: 0.0 }), jaw.local({ forward: 0.075, up: -0.002 })],
    [0.006, 0.004],
    { bone: jaw, color: DARK },
  );

  // Eyes: white sphere with a dark pupil pushed forward.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.008, 8, 6), WHITE, {
      bone: head,
      at: head.local({ left: s * 0.02, up: 0.008, forward: 0.012 }),
    });
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), EYE, {
      bone: head,
      at: head.local({ left: s * 0.024, up: 0.008, forward: 0.018 }),
    });
  }

  // Coronet: a crown of three red spikes on top of the head.
  for (const y of [-0.012, 0.0, 0.012]) {
    const base = head.local([0, y, 0.02]);
    b.spike(base, head.dir([0, -0.5, 1]), 0.03, 0.007, { color: CROWN });
  }

  // Dorsal fin: a thin sail standing up from the back of the trunk.
  b.extrude(
    [
      [-0.01, 0],
      [0.02, 0.04],
      [0.03, 0.09, "sharp"],
      [-0.005, 0.035],
    ],
    {
      at: [0, 0.1, -0.02],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.004,
      bevel: 0.002,
      color: FIN,
      bone: torso.joints[1],
    },
  );

  // Pectoral fans on either side of the chest.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.012, 0],
        [0.012, 0.045, "sharp"],
        [0.024, 0],
        [0, -0.012],
      ],
      {
        at: [s * 0.015, 0.11, 0],
        x: [0, 0, 1],
        y: [s, 0, 0],
        thickness: 0.004,
        color: FIN,
        bone: torso.joints[1],
      },
    );
  }

  return b.root;
}
