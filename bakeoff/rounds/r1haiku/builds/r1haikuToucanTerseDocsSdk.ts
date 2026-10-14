import * as THREE from "three";
import { createBuilder, vec, limb, catmull, bezier } from "../../../../src/index";

export const meta = {
  name: "toucan",
  description: "A stylised keel-billed toucan: black body, cream bib, oversized banded bill, blue eye rings, zygodactyl feet.",
};

export default function build() {
  const b = createBuilder({ name: "toucan" });

  const BLACK = "#1d1d22";
  const CREAM = "#f3eee0";
  const ORANGE = "#f29a1f";
  const YELLOW = "#f8d12f";
  const RED = "#e2432b";
  const BLUE = "#2c7fe0";
  const EYE = "#eef2f7";
  const FOOT = "#4b4a48";

  // Skeleton: body spine from the hips forward to the chest.
  const hips = b.joint("hips", { at: [0, 0.2, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.2, 0],
      [0, 0.22, 0.03],
      [0, 0.24, 0.08],
      [0, 0.25, 0.13],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );

  // Tail hangs back from the rump.
  b.chain(
    "tail",
    catmull([
      [0, 0.2, -0.01],
      [0, 0.19, -0.1],
      [0, 0.16, -0.18],
      [0, 0.14, -0.23],
    ]),
    { parent: spine.joints[0], names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // Neck rises from the chest to the head.
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.25, 0.13],
      [0, 0.29, 0.17],
      [0, 0.32, 0.2],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.33, 0.21],
    aim: [0, 0.36, 0.28],
    role: "head",
  });

  // The lower mandible hinges from the head so the bill can open.
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.01, up: -0.02 }),
    aim: head.local({ forward: 0.2, up: -0.03 }),
    role: "jaw",
  });

  // Body: black with a cream belly, one tube bending along the spine.
  b.sweep(spine, [0.04, 0.058, 0.058, 0.045], {
    color: BLACK,
    sectors: [[115, 245, CREAM]],
  });

  // Tail with a red under-tail patch.
  b.sweep(
    b.chain(
      "tailSkin",
      catmull([
        [0, 0.2, -0.01],
        [0, 0.19, -0.1],
        [0, 0.16, -0.18],
        [0, 0.14, -0.23],
      ]),
      { parent: spine.joints[0], count: 2 },
    ),
    (t) => 0.028 * (1 - t) + 0.012,
    { color: BLACK, sectors: [[120, 240, RED]] },
  );

  // Neck with a cream throat.
  b.sweep(neck, [0.035, 0.03], { color: BLACK, sectors: [[100, 260, CREAM]] });

  // Head: a faceted black ball.
  b.part(new THREE.SphereGeometry(0.042, 8, 6), BLACK, {
    bone: head,
    at: head.local({ up: 0 }),
    flat: true,
  });

  // The big bill: upper mandible banded yellow, orange, black.
  b.sweep(
    bezier(
      head.local({ forward: 0.02, up: 0.01 }),
      head.local({ forward: 0.07, up: 0.025 }),
      head.local({ forward: 0.13, up: 0.02 }),
      head.local({ forward: 0.19, up: -0.005 }),
    ),
    (t) => [0.02 * (1 - t) + 0.008, 0.032 * (1 - 0.6 * t) + 0.006],
    {
      bone: head,
      bands: [
        [0.55, YELLOW],
        [0.8, ORANGE],
        [1, BLACK],
      ],
    },
  );

  // Lower mandible.
  b.sweep(
    bezier(
      jaw.local({ forward: 0.0, up: 0.0 }),
      jaw.local({ forward: 0.07, up: -0.004 }),
      jaw.local({ forward: 0.13, up: -0.004 }),
      jaw.local({ forward: 0.18, up: 0.0 }),
    ),
    (t) => [0.012 * (1 - t) + 0.006, 0.018 * (1 - 0.5 * t) + 0.005],
    {
      bone: jaw,
      bands: [
        [0.6, YELLOW],
        [1, BLACK],
      ],
    },
  );

  // Eyes: blue skin rings with dark pupils.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), BLUE, {
      bone: head,
      at: head.local({ left: s * 0.032, up: 0.012, forward: 0.022 }),
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.006, 6, 4), BLACK, {
      bone: head,
      at: head.local({ left: s * 0.04, up: 0.013, forward: 0.03 }),
    });
  }

  // Folded wings, flat slabs lying along each flank.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0.065, 0.01],
        [0.01, 0.06],
        [-0.09, 0.07],
        [-0.17, 0.01, "sharp"],
        [-0.05, -0.03],
      ],
      {
        at: [s * 0.06, 0.22, 0.05],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.003,
        color: BLACK,
        bone: spine.joints[1],
      },
    );
  }

  // Legs: knee bends back, foot sole lies flat on the floor.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb(
      [s * 0.03, 0.19, 0],
      [s * 0.03, 0.008, 0.05],
      [0.1, 0.09, 0.035],
      [[0, 0, -1]],
      { sole: [0, 0, 1] },
    );
    const leg = b.chain("leg" + side, pts, {
      parent: hips,
      names: ["hip" + side, "knee" + side, "ankle" + side, "toe" + side],
      role: "leg",
    });
    b.sweep(leg, [0.02, 0.012, 0.009, 0.009], { color: FOOT });

    // Zygodactyl toes: two forward, two back.
    const foot = vec(pts[pts.length - 1]);
    for (const [dx, dz] of [
      [0.0, 0.03],
      [0.012, 0.025],
      [-0.012, -0.02],
      [0.0, -0.025],
    ]) {
      b.rod(foot, [foot.x + dx * s, foot.y, foot.z + dz], 0.006, {
        bone: leg.tip ?? undefined,
        color: FOOT,
      });
    }
  }

  return b.root;
}
