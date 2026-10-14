import * as THREE from "three";
import { catmull, countershade, createBuilder, limb, spots } from "../../../../src/index";

export const meta = {
  name: "Baby dragon",
  description: "A small green dragon with coral wing membranes, amber eyes, horn stubs and a spade tail.",
};

const GREEN = "#3f9e5a";
const TEAL = "#1f6f6b";
const CREAM = "#f1e3b5";
const HORN = "#f4ecd2";
const CORAL = "#e0655f";
const DARK = "#1d211d";
const AMBER = "#f2b233";

export default function build() {
  const b = createBuilder({ name: "baby-dragon" });

  // Green back with teal spots, cream belly.
  const coat = countershade(spots(GREEN, TEAL, { size: 0.08, amount: 0.35, seed: 4 }), CREAM, { level: -0.25 });

  // Skeleton: hips are the root, spine runs forward to the neck.
  const hips = b.joint("hips", { at: [0, 0.27, -0.1], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.27, -0.1],
      [0, 0.28, 0.02],
      [0, 0.29, 0.14],
      [0, 0.3, 0.24],
    ],
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );

  // Body: a chunky barrel that bulges at the chest.
  const body = b.sweep(spine, (t) => [0.07 + 0.03 * Math.sin(Math.PI * t), 0.08 + 0.02 * Math.sin(Math.PI * t)], {
    color: coat,
  });

  // Neck.
  const neck = b.chain(
    "neck",
    [
      [0, 0.3, 0.24],
      [0, 0.34, 0.3],
      [0, 0.4, 0.35],
      [0, 0.45, 0.4],
    ],
    { parent: spine.joints[2], names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  b.sweep(neck, (t) => 0.055 - 0.015 * t, { color: coat });

  // Big-headed skull, a tapered tube with its own bone.
  const head = b.joint("head", {
    parent: neck.joints[2],
    at: [0, 0.46, 0.42],
    aim: [0, 0.5, 0.62],
    role: "head",
  });
  const skull = b.sweep(
    [
      [0, 0.46, 0.42],
      [0, 0.5, 0.5],
      [0, 0.52, 0.6],
      [0, 0.5, 0.67],
    ],
    (t) => [0.085 - 0.035 * t, 0.08 - 0.03 * t],
    { bone: head, color: coat },
  );

  // Lower jaw as its own bone, so the mouth can open.
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.45, 0.48], aim: [0, 0.43, 0.66], role: "jaw" });
  b.sweep(
    [
      [0, 0.45, 0.48],
      [0, 0.44, 0.58],
      [0, 0.43, 0.66],
    ],
    (t) => [0.05 - 0.015 * t, 0.022],
    { bone: jaw, color: CREAM },
  );

  // Tail: tapered, banded, ending in a coral spade.
  const tail = b.chain(
    "tail",
    [
      [0, 0.27, -0.1],
      [0, 0.26, -0.25],
      [0, 0.23, -0.36],
      [0, 0.21, -0.44],
    ],
    { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );
  const tailBody = b.sweep(tail, (t) => 0.05 * (1 - t) + 0.014, {
    color: coat,
    bands: [
      [0.8, coat],
      [1, CORAL],
    ],
  });
  b.extrude(
    [
      [0, 0.02],
      [0.06, 0.07],
      [0.15, 0, "sharp"],
      [0.06, -0.07],
      [0, -0.02],
    ],
    { at: [0, 0.21, -0.44], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.02, color: CORAL, bone: tail.tip },
  );
  b.along(tailBody, 4, (at) => b.spike(at, at, 0.03, 0.008, { color: HORN }), { from: 0.1, to: 0.7 });

  // Dorsal spikes along the back.
  b.along(body, 7, (at) => b.spike(at, at, 0.045, 0.013, { color: HORN }), { from: 0.12, to: 0.82 });

  // Eyes, nostrils and horn stubs, all stuck to the skull surface.
  const surf = b.surface(skull);
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    const eye = surf.nearest([s * 0.075, 0.55, 0.52]);
    b.stick(new THREE.SphereGeometry(0.03, 8, 6), AMBER, eye, { embed: 0.25, name: `eye${S}` });
    b.stick(new THREE.SphereGeometry(0.013, 6, 4), DARK, eye.moved([0, 0.022, 0.01]), {
      embed: 0.2,
      name: `pupil${S}`,
    });

    const nostril = surf.nearest([s * 0.022, 0.5, 0.7]);
    b.stick(new THREE.SphereGeometry(0.008, 5, 4), DARK, nostril, { embed: 0.4, name: `nostril${S}` });

    const hornBase = surf.nearest([s * 0.035, 0.6, 0.44]);
    b.sprout(`horn${S}`, hornBase, [s * 0.07, 0.72, 0.3], [0.024, 0.004], {
      count: 0,
      color: HORN,
      caps: { end: "point" },
    });
  }

  // Legs: front bends backward at the elbow, hind bends forward at the knee.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // Front leg.
    const fFoot = [s * 0.1, 0.025, 0.13];
    const fPts = limb([s * 0.08, 0.27, 0.12], fFoot, [0.13, 0.13], [[0, 0, -1]]);
    const fl = b.chain(`legF${S}`, fPts, {
      parent: spine.joints[2],
      names: [`shoulderF${S}`, `elbowF${S}`, `pawF${S}`],
      role: "leg",
    });
    b.sweep(fl, (t) => 0.034 - 0.012 * t, { color: coat });
    for (const dx of [-0.03, 0, 0.03]) {
      b.capsule([fFoot[0] + dx, 0.018, fFoot[2] - 0.01], [fFoot[0] + dx, 0.018, fFoot[2] + 0.05], 0.018, {
        bone: fl.tip,
        color: CREAM,
      });
    }

    // Hind leg.
    const hFoot = [s * 0.1, 0.025, -0.08];
    const hPts = limb([s * 0.08, 0.27, -0.1], hFoot, [0.13, 0.13], [[0, 0, 1]]);
    const hl = b.chain(`legH${S}`, hPts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankleH${S}`],
      role: "leg",
    });
    b.sweep(hl, (t) => 0.05 - 0.02 * t, { color: coat });
    for (const dx of [-0.035, 0, 0.035]) {
      b.capsule([hFoot[0] + dx, 0.018, hFoot[2] - 0.01], [hFoot[0] + dx, 0.018, hFoot[2] + 0.05], 0.018, {
        bone: hl.tip,
        color: CREAM,
      });
    }

    // Wing: arm bones, finger bones and a coral membrane.
    const arm = b.chain(
      `wing${S}`,
      [
        [s * 0.07, 0.3, 0.1],
        [s * 0.22, 0.4, 0.08],
        [s * 0.4, 0.42, 0.0],
      ],
      { parent: spine.joints[2], names: [`wingUp${S}`, `wingLow${S}`, `wingHand${S}`], role: "wing" },
    );
    b.sweep(arm, (t) => 0.022 - 0.008 * t, { color: coat });

    const W = [s * 0.4, 0.42, 0.0];
    const f1 = catmull([W, [s * 0.52, 0.46, 0.05], [s * 0.66, 0.5, 0.06]]);
    const f2 = catmull([W, [s * 0.5, 0.4, -0.1], [s * 0.6, 0.36, -0.16]]);
    const f3 = catmull([W, [s * 0.36, 0.32, -0.16], [s * 0.12, 0.25, -0.17]]);
    for (const f of [f1, f2, f3]) {
      b.sweep(f, (t) => 0.014 - 0.006 * t, { bone: arm.tip, color: HORN });
    }

    const wingSkin = { color: CORAL, thickness: 0.012, bone: arm.tip };
    b.membrane(f1, f2, wingSkin);
    b.membrane(f2, f3, wingSkin);
    b.membrane(
      f3,
      [
        [s * 0.07, 0.3, 0.1],
        [s * 0.1, 0.29, -0.03],
        [s * 0.12, 0.25, -0.17],
      ],
      wingSkin,
    );
  }

  return b.root;
}
