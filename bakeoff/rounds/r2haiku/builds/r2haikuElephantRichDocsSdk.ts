import * as THREE from "three";
import { createBuilder, catmull, limb, mottle, paint, scales } from "../../../../src/index";

export const meta = {
  name: "elephant-calf",
  description: "A gentle African elephant calf: dusty slate-grey wrinkled skin, fan ears with pink insides, a curling trunk, stubby tusks, long lashes and round padded feet.",
};

const SLATE = "#6e7077";
const DUST = "#8e6b5c";
const CREASE = "#4a4b52";
const PINK = "#e9a2a0";
const IVORY = "#efe5cc";
const BROWN = "#3a2417";
const WHITE = "#f6f3ec";
const LASH = "#2b2220";
const NAIL = "#e8dcc6";
const TUFT = "#4a3328";

const SKIN = scales(mottle(SLATE, DUST, { size: 0.25 }), CREASE, { size: 0.08, width: 0.1 });

export default function build() {
  const b = createBuilder({ name: "elephant-calf" });

  // Skeleton: hips, spine, neck and head, then the tail and trunk.
  const hips = b.joint("hips", { at: [0, 0.95, -0.1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.95, -0.1],
      [0, 1.0, 0.15],
      [0, 1.12, 0.4],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.12, 0.4],
      [0, 1.24, 0.55],
      [0, 1.32, 0.7],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.34, 0.74], dir: [0, 0.3, 1], role: "head" });

  // Body: a stout barrel over the spine.
  b.loft(
    [
      { at: [0, 0.95, -0.25], w: 0.5, h: 0.6 },
      { at: [0, 0.98, 0], w: 0.62, h: 0.78 },
      { at: [0, 1.0, 0.25], w: 0.6, h: 0.8 },
      { at: [0, 1.08, 0.45], w: 0.46, h: 0.6 },
    ],
    { bone: [spine, hips], color: SKIN },
  );

  // Neck, pillar legs and round padded feet.
  b.sweep(neck, [0.15, 0.13], { color: SKIN });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.2;

    const fore = limb([x, 0.82, 0.28], [x, 0.07, 0.3], [0.4, 0.38], [[0, 0, 1]]);
    const legF = b.chain(`legF${S}`, fore, {
      parent: spine,
      names: [`shoulder${S}`, `elbow${S}`, `foot${S}`],
      role: "leg",
    });
    b.sweep(legF, [0.11, 0.075], { color: SKIN });
    const footF = legF.tip!;

    const hind = limb([x, 0.8, -0.2], [x, 0.07, -0.16], [0.4, 0.38], [[0, 0, -1]]);
    const legH = b.chain(`legH${S}`, hind, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`],
      role: "leg",
    });
    b.sweep(legH, [0.11, 0.075], { color: SKIN });
    const footH = legH.tip!;

    // Padded feet with pale toenails on the front edge.
    b.part(new THREE.CylinderGeometry(0.1, 0.115, 0.14, 10), SKIN, { bone: footF, at: [x, 0.07, 0.3] });
    b.part(new THREE.CylinderGeometry(0.1, 0.115, 0.14, 10), SKIN, { bone: footH, at: [x, 0.07, -0.18] });
    for (const dx of [-0.05, -0.017, 0.017, 0.05]) {
      b.part(new THREE.CylinderGeometry(0.028, 0.03, 0.012, 7), NAIL, {
        bone: footF,
        at: [x + dx, 0.04, 0.4],
        rotation: [90, 0, 0],
      });
    }
  }

  // Head: a slightly squashed round skull.
  b.part(new THREE.SphereGeometry(0.2, 14, 10), SKIN, {
    bone: head,
    at: [0, 1.34, 0.74],
    scale: [1, 0.95, 1.08],
  });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // Kind brown eye with a small catchlight and a fringe of lashes.
    const eye = b.part(new THREE.SphereGeometry(0.036, 8, 6), BROWN, {
      bone: head,
      at: head.local({ left: s * 0.1, up: 0.04, forward: 0.16 }),
      dir: head.dir([s * 0.5, 0.3, 0.8]),
    });
    b.part(new THREE.SphereGeometry(0.01, 6, 4), WHITE, {
      bone: head,
      at: eye.local([0.012, 0.03, 0.012]),
    });
    b.ring(eye, { count: 7, radius: 0.03, fromDeg: -75, toDeg: 75, tilt: 35 }, (lash) =>
      b.spike(lash, lash, 0.045, 0.006, { color: LASH }),
    );

    // Large fan ear, pink on the inside.
    b.extrude(
      [
        [-0.02, -0.02],
        [0.0, 0.1],
        [0.08, 0.2],
        [0.2, 0.22],
        [0.27, 0.1],
        [0.24, -0.08],
        [0.14, -0.2],
        [0.04, -0.14],
      ],
      {
        at: head.local({ left: s * 0.14, up: 0.06, forward: 0.02 }),
        x: [0, 0, -s],
        y: [0, 1, 0],
        thickness: [0.014, 0.005],
        bevel: 0.004,
        smoothing: 1,
        color: paint((_p, n) => (n.x * s < -0.5 ? PINK : SKIN)),
      },
    );

    // Stubby ivory tusk, sprouting from the upper lip.
    const hit = b.surface(head).nearest(head.local({ forward: 0.19, down: 0.1, left: s * 0.07 }));
    b.sprout(
      `tusk${S}`,
      hit,
      head.local({ forward: 0.34, down: 0.16, left: s * 0.09 }),
      [0.022, 0.005],
      { count: 0, color: IVORY },
    );
  }

  // Curious trunk, curling forward and up at the tip.
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 1.24, 0.84],
      [0, 1.08, 0.99],
      [0, 0.9, 1.06],
      [0, 0.78, 1.03],
      [0.03, 0.72, 0.96],
      [0.05, 0.78, 0.9],
    ]),
    { parent: head, count: 5, role: "tentacle" },
  );
  b.sweep(trunk, [0.075, 0.03], { color: SKIN });

  // Little tufted tail with a brush of dark hairs.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.0, -0.2],
      [0, 0.92, -0.36],
      [0, 0.78, -0.44],
      [0, 0.66, -0.42],
    ]),
    { parent: hips, role: "tail" },
  );
  b.sweep(tail, [0.05, 0.016], { color: SKIN });
  b.ring(tail.at(1), { count: 9, radius: 0.022 }, (t) => b.spike(t, t, 0.07, 0.007, { color: TUFT }));

  return b.root;
}
