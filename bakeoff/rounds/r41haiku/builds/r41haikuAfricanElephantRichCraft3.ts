import * as THREE from "three";
import { bezier, catmull, countershade, createBuilder, grain, limb, mottle } from "../../../../src/index";

export const meta = {
  name: "African bush elephant",
  description: "Stylised low-poly adult African bush elephant standing in a rest pose, about 3 m at the shoulder.",
};

// Palette. Paints continue one pattern wherever they are shared.
const HIDE = countershade(mottle("#6e6661", "#8a817a", { size: 0.35, seed: 3 }), "#a39a92", { level: -0.15 });
const LEG = countershade(grain("#5c5550", "#776d66", { size: 0.05, axis: "y", seed: 5 }), "#8c827a", { level: -0.1 });
const EAR = "#9a867c";
const FOOT = "#3d3733";
const DARK_HIDE = "#4f4843";
const IVORY = "#efe4c6";
const INK = "#1d1815";
const WHITE = "#f5f2ea";

export default function build() {
  const b = createBuilder({ name: "african-bush-elephant" });

  // Skeleton: pelvis at the rump, a three-joint spine, neck, head, trunk and tail.
  const pelvis = b.joint("pelvis", { at: [0, 2.25, -1.3], aim: [0, 2.3, -0.6], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.25, -1.3],
      [0, 2.3, -0.6],
      [0, 2.32, 0.1],
      [0, 2.3, 0.8],
    ]),
    { parent: pelvis, count: 3, names: ["back1", "back2", "back3"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.35, 0.6],
      [0, 2.55, 0.9],
      [0, 2.72, 1.12],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 2.78, 1.2],
    aim: [0, 2.82, 1.7],
    role: "head",
  });

  const trunk = b.chain(
    "trunk",
    catmull([
      head.local({ down: 0.25, forward: 0.2 }),
      [0, 2.2, 1.7],
      [0, 1.6, 1.98],
      [0, 1.1, 2.08],
      [0.06, 0.62, 2.12],
      [0.12, 0.3, 2.0],
      [0.1, 0.42, 1.84],
    ]),
    { parent: head, count: 6, role: "tail" },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.2, -1.35],
      [0, 1.9, -1.62],
      [0, 1.35, -1.75],
      [0, 0.85, -1.78],
    ]),
    { parent: pelvis, count: 3, role: "tail" },
  );

  // Body: one barrel-shaped tube over the spine, wider over the belly.
  b.sweep(spine, (t) => [0.6 + 0.14 * Math.sin(Math.PI * t), 0.66 + 0.08 * Math.sin(Math.PI * t)], {
    color: HIDE,
  });

  b.sweep(neck, (t) => 0.36 - 0.04 * t, { color: HIDE });

  // Head: a big skull, a forehead dome and small, bright-eyed features.
  b.part(new THREE.SphereGeometry(1, 14, 10), HIDE, { bone: head, at: head.at, scale: [0.42, 0.44, 0.5] });
  b.part(new THREE.SphereGeometry(1, 10, 8), HIDE, {
    bone: head,
    at: head.local({ up: 0.18, forward: 0.1 }),
    scale: [0.36, 0.3, 0.36],
  });

  const earOutline: [number, number][] = [
    [-0.3, 0.36],
    [0.12, 0.44],
    [0.34, 0.22],
    [0.38, -0.08],
    [0.22, -0.4],
    [-0.08, -0.46],
    [-0.32, -0.3],
    [-0.4, 0.02],
  ];

  for (const s of [1, -1]) {
    // Ears: broad fans that hang flat against the head.
    b.extrude(earOutline, {
      at: head.local({ left: s * 0.4, up: 0.05, forward: -0.1 }),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.03,
      smoothing: 2,
      color: EAR,
      bone: head,
    });

    // Eyes: dark with a small white glint.
    b.part(new THREE.SphereGeometry(0.05, 7, 5), INK, {
      bone: head,
      at: head.local({ left: s * 0.37, up: 0.08, forward: 0.24 }),
    });
    b.part(new THREE.SphereGeometry(0.018, 5, 4), WHITE, {
      bone: head,
      at: head.local({ left: s * 0.4, up: 0.12, forward: 0.28 }),
    });

    // Tusks: long ivory curves sweeping forward and up.
    const tusk = bezier(
      head.local({ left: s * 0.2, down: 0.2, forward: 0.3 }),
      head.local({ left: s * 0.28, down: 0.3, forward: 0.75 }),
      head.local({ left: s * 0.36, down: 0.1, forward: 0.95 }),
      head.local({ left: s * 0.3, up: 0.15, forward: 1.0 }),
    );
    b.sweep(tusk, [0.05, 0.012], { color: IVORY, caps: { start: "flat", end: "point" } });

    // Front leg: shoulder, elbow, wrist and a round foot with toenails.
    const side = s > 0 ? "L" : "R";
    const fore = b.chain(
      `fore${side}`,
      limb([0.5 * s, 2.1, 0.45], [0.5 * s, 0.15, 0.55], [1.05, 0.95], [[0, 0, 1]]),
      { parent: spine.joints[2], names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`] },
    );
    b.sweep(fore, (t) => 0.34 - 0.14 * t, { color: LEG });
    const foreFoot = fore.joints[fore.joints.length - 1];
    b.part(new THREE.CylinderGeometry(0.2, 0.25, 0.26, 10), FOOT, {
      bone: foreFoot,
      at: [0.5 * s, 0.13, 0.55],
    });
    for (const dx of [-0.12, -0.04, 0.04, 0.12])
      b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.03, 6), IVORY, {
        bone: foreFoot,
        at: [0.5 * s + dx, 0.02, 0.55 + 0.22],
      });

    // Hind leg: hip, knee, ankle and a round foot.
    const hind = b.chain(
      `hind${side}`,
      limb([0.5 * s, 2.0, -0.95], [0.5 * s, 0.15, -0.95], [1.0, 0.9], [[0, 0, -1]]),
      { parent: pelvis, names: [`hip${side}`, `knee${side}`, `ankle${side}`] },
    );
    b.sweep(hind, (t) => 0.4 - 0.16 * t, { color: LEG });
    const hindFoot = hind.joints[hind.joints.length - 1];
    b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.26, 10), FOOT, {
      bone: hindFoot,
      at: [0.5 * s, 0.13, -0.95],
    });
    for (const dx of [-0.08, 0, 0.08])
      b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.03, 6), IVORY, {
        bone: hindFoot,
        at: [0.5 * s + dx, 0.02, -0.95 + 0.2],
      });
  }

  // Trunk: a long tube that tapers toward a curled tip.
  b.sweep(trunk, (t) => 0.2 - 0.1 * t, {
    color: HIDE,
    caps: { start: "round", end: "round" },
  });

  // Tail: a thin whip with a dark tuft.
  b.sweep(tail, (t) => 0.09 - 0.05 * t, { color: HIDE });
  b.part(new THREE.SphereGeometry(0.075, 6, 5), DARK_HIDE, {
    bone: tail.joints[tail.joints.length - 1],
    at: [0, 0.85, -1.78],
  });

  return b.root;
}
