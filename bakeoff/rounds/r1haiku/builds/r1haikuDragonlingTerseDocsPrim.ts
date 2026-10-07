import * as THREE from "three";
import { createBuilder, catmull, countershade, limb, spots } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Baby dragon",
  description:
    "A green-scaled baby dragon with a cream belly, coral folded wings, curved horns, a sharp-toothed jaw and a long tail, in a neutral rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "baby-dragon" });

  // Palette
  const GREEN = "#4f9d5b";
  const DEEP = "#2e6e43";
  const CREAM = "#eedfb0";
  const WING = "#e2673f";
  const BONE = "#f4ead0";
  const GOLD = "#ffc53d";
  const DARK = "#16120e";

  const coat = countershade(spots(GREEN, DEEP, { size: 0.09, amount: 0.35 }), CREAM, { level: -0.25 });

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.46, -0.2], role: "spine" });

  const spine = b.chain("spine", catmull([[0, 0.46, -0.2], [0, 0.5, 0], [0, 0.53, 0.16]]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const chest = spine.joints[2];

  const neck = b.chain("neck", catmull([[0, 0.53, 0.16], [0, 0.68, 0.27], [0, 0.81, 0.38]]), {
    parent: chest,
    names: ["neck1", "neck2", "neckTop"],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 0.84, 0.42],
    aim: [0, 0.9, 0.66],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ up: -0.02, forward: -0.02 }),
    aim: head.local({ up: -0.1, forward: 0.25 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.44, -0.22],
      [0, 0.38, -0.5],
      [0, 0.28, -0.76],
      [0, 0.2, -0.94],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );

  // ---- Body, neck and tail -------------------------------------------------
  const bodyR = (t: number): [number, number] => [
    0.14 + 0.03 * Math.sin(Math.PI * t),
    0.12 + 0.04 * Math.sin(Math.PI * t),
  ];
  const body = b.sweep(spine, bodyR, { color: coat });

  // Dorsal spikes along the back
  b.along(body, 6, (at) => b.spike(at, at, 0.07, 0.022, { color: BONE }), { from: 0.12, to: 0.9 });

  b.sweep(neck, (t) => 0.085 - 0.015 * t, { color: coat });

  b.sweep(tail, (t) => 0.075 * (1 - t) + 0.02, { color: coat });
  const tailTip = tail.at(1);
  b.spike(tailTip, tailTip, 0.14, 0.03, { color: BONE });

  // ---- Head -----------------------------------------------------------------
  b.part(new THREE.SphereGeometry(0.1, 12, 9), coat, {
    bone: head,
    at: head.local({ up: 0.03, forward: -0.02 }),
    scale: [0.95, 0.9, 1.15],
    flat: true,
  });

  // Snout
  b.frustumBox(head.local({ up: 0.02, forward: 0.04 }), head.local({ up: 0, forward: 0.2 }), [0.12, 0.1], [0.09, 0.075], {
    bone: head,
    color: coat,
  });

  // Lower jaw (hinged)
  b.frustumBox(jaw.local({ up: 0, forward: 0.02 }), jaw.local({ up: -0.03, forward: 0.2 }), [0.08, 0.06], [0.06, 0.035], {
    bone: jaw,
    color: coat,
  });

  for (const s of [1, -1]) {
    // Swept-back horns
    b.spike(head.local({ left: s * 0.055, up: 0.09, forward: -0.03 }), [s * 0.22, 1, -0.5], 0.13, 0.03, {
      bone: head,
      color: BONE,
    });

    // Eyes: gold ball with a slit pupil
    b.part(new THREE.SphereGeometry(0.03, 10, 8), GOLD, {
      bone: head,
      at: head.local({ left: s * 0.08, up: 0.045, forward: 0.06 }),
    });
    b.part(new THREE.SphereGeometry(0.02, 8, 6), DARK, {
      bone: head,
      at: head.local({ left: s * 0.112, up: 0.045, forward: 0.06 }),
      scale: [0.45, 1.1, 0.9],
    });

    // Nostrils
    b.part(new THREE.SphereGeometry(0.012, 6, 4), DARK, {
      bone: head,
      at: head.local({ left: s * 0.03, up: 0.045, forward: 0.2 }),
    });

    // Lower-jaw teeth
    b.spike(jaw.local({ left: s * 0.03, up: 0, forward: 0.1 }), [0, 1, 0], 0.03, 0.007, {
      bone: jaw,
      color: BONE,
    });
  }

  // ---- Legs -----------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // Front leg: elbow points back
    const fPts = limb([s * 0.13, 0.44, 0.12], [s * 0.14, 0.04, 0.16], [0.22, 0.22], [[0, 0, -1]]);
    const fore = b.chain(`foreLeg${S}`, fPts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "leg",
    });
    b.sweep(fore, (t) => 0.06 - 0.02 * t, { color: coat });

    // Hind leg: knee points forward, thicker thigh
    const hPts = limb([s * 0.14, 0.46, -0.2], [s * 0.15, 0.04, -0.14], [0.25, 0.24], [[0, 0, 1]]);
    const hind = b.chain(`hindLeg${S}`, hPts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    b.sweep(hind, (t) => 0.085 - 0.035 * t, { color: coat });

    // Paws, claws
    for (const leg of [fore, hind]) {
      const tip = leg.tip!;
      const p = tip.at;
      b.part(new THREE.SphereGeometry(0.05, 10, 8), coat, {
        bone: tip,
        at: [p.x, 0.035, p.z + 0.02],
        scale: [1.1, 0.5, 1.5],
        flat: true,
      });
      for (const k of [-1, 0, 1]) {
        b.spike([p.x + k * 0.022, 0.03, p.z + 0.08], [k * 0.2, -0.35, 1], 0.035, 0.008, {
          bone: tip,
          color: BONE,
        });
      }
    }
  }

  // ---- Folded wings -----------------------------------------------------------
  const wingOutline: OutlinePoint[] = [
    [0.18, 0.12],
    [0.05, 0.27],
    [-0.06, 0.17],
    [-0.16, 0.22],
    [-0.26, 0.12],
    [-0.34, 0.03, "sharp"],
    [-0.2, -0.06],
    [-0.06, -0.02],
    [0.1, -0.1],
  ];

  for (const s of [1, -1]) {
    b.extrude(wingOutline, {
      at: [s * 0.165, 0.44, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.015,
      bevel: 0.004,
      color: WING,
    });

    // Wing fingers lying in the membrane
    const wp = (u: number, v: number): [number, number, number] => [s * 0.165, 0.44 + v, u];
    b.rod(wp(0.16, 0.14), wp(0.05, 0.27), 0.008, { color: BONE });
    b.rod(wp(0.16, 0.14), wp(-0.26, 0.12), 0.008, { color: BONE });
    b.rod(wp(0.16, 0.14), wp(-0.34, 0.03), 0.008, { color: BONE });
  }

  return b.root;
}
