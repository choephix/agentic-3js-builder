import * as THREE from "three";
import { catmull, countershade, createBuilder, gradient } from "../../../../src/index";

export const meta = {
  name: "Flamingo",
  description:
    "A standing flamingo about 1.5 m tall: S-curved neck, bill bent down with a black tip, pink body and wing coverts fading to black flight feathers, jointed legs bent backward at the ankle, and webbed three-toed feet.",
};

export default function flamingo() {
  const b = createBuilder({ name: "flamingo" });

  // Palette
  const body = countershade("#f58fb0", "#fdd6e3", { level: 0.1, soft: 0.5 });
  const legColor = "#e8779a";
  const toeColor = "#b5506f";
  const billPink = "#f7a6c0";
  const black = "#151515";

  // Skeleton: hips at the body's centre, neck and legs hang from it.
  b.joint("hips", { at: [0, 0.85, 0.02], role: "spine" });

  // Body: a tapered teardrop, tail low and back, chest raised.
  b.loft(
    [
      { at: [0, 0.88, -0.3], w: 0.1, h: 0.09 },
      { at: [0, 0.86, -0.14], w: 0.22, h: 0.2 },
      { at: [0, 0.85, 0.02], w: 0.26, h: 0.26 },
      { at: [0, 0.93, 0.2], w: 0.2, h: 0.2 },
    ],
    { color: body, bone: "hips", name: "body" },
  );

  // Neck: a long S, thick at the chest, thinning toward the head.
  const neck = b.chain(
    "neck",
    [
      [0, 0.95, 0.17],
      [0, 1.12, 0.3],
      [0, 1.29, 0.17],
      [0, 1.45, 0.25],
    ],
    { parent: "hips", names: ["neck1", "neck2", "neck3", "head"], role: "neck" },
  );
  b.sweep(neck, (t) => 0.046 - 0.02 * t, { color: body, name: "neck" });

  // Head: a round skull on the neck's tip joint.
  const head = neck.joints[3];
  b.part(new THREE.SphereGeometry(0.06, b.segments(14), b.segments(10)), body, {
    bone: head,
    at: [0, 1.45, 0.25],
    name: "head",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.011, b.segments(8), b.segments(6)), black, {
      bone: head,
      at: [s * 0.045, 1.466, 0.297],
      name: s > 0 ? "eyeL" : "eyeR",
    });
  }

  // Bill: a hinged upper bill from the head, pink at the base, black at the hooked tip.
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.44, 0.29], dir: [0, 0.2, 1], role: "jaw" });
  b.sweep(
    catmull([
      [0, 1.46, 0.27],
      [0, 1.445, 0.37],
      [0, 1.385, 0.44],
      [0, 1.325, 0.425],
    ]),
    (t): [number, number] => [0.017 - 0.006 * t, 0.03 - 0.02 * t],
    {
      bands: [
        [0.62, billPink],
        [1, black],
      ],
      bone: jaw,
      name: "bill",
    },
  );

  // Legs, wings and feet, mirrored left (+X) and right (-X).
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // Thigh, knee (forward), backward-bent ankle, then the foot on the ground.
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.09, 0.82, 0],
        [s * 0.1, 0.6, 0.08],
        [s * 0.1, 0.42, -0.04],
        [s * 0.1, 0.02, 0.07],
      ],
      {
        parent: "hips",
        names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
        role: "leg",
      },
    );
    b.sweep(leg, (t) => 0.03 - 0.012 * t, { color: legColor, name: `leg${side}` });

    // Webbed three-toed foot: a thin flat web with three toes running out on the ground.
    const foot = leg.joints[3];
    b.slab(
      [
        [s * 0.1, 0.008, 0.075],
        [s * 0.15, 0.008, 0.14],
        [s * 0.1, 0.008, 0.2],
        [s * 0.05, 0.008, 0.13],
      ],
      { color: toeColor, thickness: 0.004, bone: foot, name: `web${side}` },
    );
    for (const [i, toe] of (
      [
        [s * 0.1, 0.012, 0.2],
        [s * 0.15, 0.012, 0.14],
        [s * 0.05, 0.012, 0.13],
      ] as const
    ).entries()) {
      b.capsule(foot, toe, 0.011, { color: toeColor, name: `toe${side}${i + 1}` });
    }

    // Wing folded along the body: a flat extruded wing whose trailing tip fades to black flight feathers.
    const shoulder: [number, number, number] = [s * 0.12, 0.93, 0.05];
    const wing = b.joint(`wing${side}`, { parent: "hips", at: shoulder, role: "wing" });
    const wingPaint = gradient("#e6557e", "#171717", [s * 0.12, 0.93, -0.12], [s * 0.12, 0.93, -0.42]);
    // Outline in (z, y) around the shoulder: front edge toward the head, tip swept back.
    const outline = [
      [0.16, 0.02],
      [0.04, 0.1],
      [-0.12, 0.12],
      [-0.28, 0.1],
      [-0.42, 0.03],
      [-0.36, -0.03],
      [-0.22, -0.06],
      [-0.08, -0.09],
      [0.06, -0.1],
      [0.14, -0.06],
    ];
    b.extrude(outline, {
      color: wingPaint,
      at: shoulder,
      thickness: 0.03,
      bevel: 0.008,
      smoothing: 1,
      bone: wing,
      name: `wing${side}`,
    });
  }

  return b.root;
}
