```ts
import * as THREE from "three";
import { bezier, catmull, countershade, createBuilder, gradient, scales } from "agentic-3js-builder";

export const meta = {
  name: "flamingo",
  description:
    "A standing flamingo: pink coat, rose wing coverts with black flight tips, S-curved neck, two-part bent bill, long legs with backward-bending hocks and webbed feet.",
};

type V3 = [number, number, number];

const BODY = "#f58aa0";
const BELLY = "#ffd6df";
const BLUSH = "#ffc4d0";
const WING = "#ea5a7b";
const WING_EDGE = "#b43a61";
const FLIGHT = "#1d1a23";
const LEG = "#f0607f";
const BILL = "#ffbfcb";
const INK = "#17141b";
const EYE = "#fff3ad";

export default function build() {
  const b = createBuilder({ name: "flamingo" });

  // ---- Spine: hips are the root. The tail trails back, the front runs up to the breast.
  const H0: V3 = [0, 0.93, -0.06];
  const T1: V3 = [0, 0.99, -0.26];
  const T2: V3 = [0, 1.05, -0.42];
  const C1: V3 = [0, 0.95, 0.12];
  const C2: V3 = [0, 1.0, 0.24];

  const hips = b.joint("hips", { at: H0, role: "spine" });
  const tail = b.chain("tail", [H0, T1, T2], {
    parent: hips,
    names: ["tailBase", "tailMid", "tailTip"],
    role: "tail",
  });
  const front = b.chain("front", catmull([H0, C1, C2]), {
    parent: hips,
    names: ["belly", "chest", "breast"],
    role: "spine",
  });
  const chest = front.joints[1]!;
  const tailTip = tail.tip!;

  // Body: one smooth loft over tail, hips and breast.
  b.loft(
    [
      { at: T2, w: 0.05, h: 0.06 },
      { at: T1, w: 0.13, h: 0.14 },
      { at: H0, w: 0.22, h: 0.24 },
      { at: C1, w: 0.22, h: 0.24 },
      { at: C2, w: 0.16, h: 0.18 },
    ],
    { bone: [tail, hips, front], color: countershade(BODY, BELLY, { level: 0.1 }) },
  );

  // ---- Neck: a tall S, thick at the base, slim toward the head.
  const N1: V3 = [0, 1.17, 0.43];
  const N2: V3 = [0, 1.31, 0.28];
  const N3: V3 = [0, 1.43, 0.4];
  const neck = b.chain("neck", catmull([C2, N1, N2, N3]), {
    parent: front,
    names: ["neck1", "neck2", "neck3", "neckTop"],
    role: "neck",
  });
  b.sweep(neck, (t) => 0.034 + 0.03 * (1 - t) ** 1.5, {
    color: gradient(BODY, BLUSH, [0, 1.02, 0.24], [0, 1.4, 0.42]),
  });

  // ---- Head, with a separate upper bill (head) and lower bill (jaw).
  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.44, 0.47],
    aim: [0, 1.36, 0.72],
    role: "head",
  });
  b.capsule(head.local({ back: 0.03 }), head.local({ forward: 0.03 }), 0.062, {
    bone: head,
    color: BLUSH,
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.02, up: -0.035 }),
    aim: head.local({ forward: 0.15, up: -0.04 }),
    role: "jaw",
  });

  // Upper bill: arcs forward, then hooks down to a black tip.
  b.sweep(
    bezier(
      head.local({ forward: 0.05, up: 0.012 }),
      head.local({ forward: 0.12, up: 0.012 }),
      head.local({ forward: 0.19, up: -0.02 }),
      head.local({ forward: 0.16, up: -0.11 }),
    ),
    [0.026, 0.009],
    { bone: head, color: BILL, bands: [[0.6, BILL], [1, INK]] },
  );

  // Lower bill: shorter, closes under the upper one, hinged at the jaw.
  b.sweep(
    bezier(
      head.local({ forward: 0.02, up: -0.035 }),
      head.local({ forward: 0.1, up: -0.035 }),
      head.local({ forward: 0.15, up: -0.045 }),
      head.local({ forward: 0.12, up: -0.09 }),
    ),
    [0.02, 0.008],
    { bone: jaw, color: BILL, bands: [[0.6, BILL], [1, INK]] },
  );

  // Eyes with dark pupils stuck on their faces.
  for (const s of [1, -1]) {
    const eye = b.part(new THREE.SphereGeometry(0.017, 8, 6), EYE, {
      bone: head,
      at: head.local({ left: s * 0.05, forward: 0.035, up: 0.02 }),
      flat: true,
    });
    const pupil = b.surface(eye).around(eye.at).at(s * 45, 0);
    if (pupil) b.stick(new THREE.SphereGeometry(0.008, 6, 4), INK, pupil, { embed: 0.35 });
  }

  // ---- Legs, wings and feet, mirrored.
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";

    // Thigh and feathered shin in body colour, bare coral metatarsus below the backward hock.
    const leg = b.chain(
      `leg${k}`,
      [
        [s * 0.08, 0.86, -0.04],
        [s * 0.095, 0.6, 0.03],
        [s * 0.085, 0.36, -0.07],
        [s * 0.09, 0.012, 0.05],
      ],
      { parent: hips, names: [`hip${k}`, `knee${k}`, `hock${k}`, `foot${k}`], role: "leg" },
    );
    const foot = leg.tip!;
    b.sweep(leg, [0.04, 0.014], {
      color: LEG,
      bands: [[0.59, BODY], [1, LEG]],
      smooth: false,
    });

    // Digits as short chains off the foot, so they can be rigged.
    const F: V3 = [s * 0.09, 0.012, 0.05];
    const digit = (id: string, end: V3, r0: number, r1: number) => {
      const c = b.chain(`${id}${k}`, [F, end], {
        parent: foot,
        names: [`${id}${k}`, `${id}${k}Tip`],
        role: "digit",
      });
      b.sweep(c, [r0, r1], { color: LEG });
    };
    digit("toeOut", [s * 0.14, 0.008, 0.135], 0.009, 0.007);
    digit("toeMid", [s * 0.09, 0.008, 0.15], 0.009, 0.007);
    digit("toeIn", [s * 0.05, 0.008, 0.135], 0.009, 0.007);
    digit("toeBack", [s * 0.1, 0.008, 0.0], 0.006, 0.005);

    // Webbing: a flat scalloped sheet between the toes.
    b.extrude(
      [
        [0, 0],
        [0.045, 0.078],
        [0.02, 0.072],
        [0, 0.095],
        [-0.02, 0.072],
        [-0.04, 0.078],
      ],
      { at: [s * 0.09, 0.008, 0.05], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.005, color: LEG, bone: foot },
    );

    // Folded wing: a joint on the chest, with a scaled covert slab and a black primary tip.
    const wing = b.joint(`wing${k}`, {
      parent: chest,
      at: [s * 0.1, 1.0, 0.1],
      aim: [s * 0.1, 0.94, -0.3],
      role: "wing",
    });
    b.extrude(
      [
        [0.2, 1.03],
        [0.02, 1.05],
        [-0.12, 1.02],
        [-0.25, 0.97],
        [-0.33, 0.9],
        [-0.3, 0.84],
        [-0.18, 0.8],
        [-0.02, 0.79],
        [0.12, 0.84],
        [0.21, 0.94],
      ],
      {
        at: [s * 0.09, 0, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.02,
        bevel: 0.006,
        smoothing: 1,
        color: scales(WING, WING_EDGE, { size: 0.05 }),
        bone: wing,
      },
    );
    b.extrude(
      [
        [-0.14, 1.0],
        [-0.28, 0.96],
        [-0.4, 0.9],
        [-0.42, 0.85],
        [-0.32, 0.82],
        [-0.16, 0.83],
      ],
      {
        at: [s * 0.1, 0, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.014,
        bevel: 0.004,
        smoothing: 1,
        color: FLIGHT,
        bone: wing,
      },
    );
  }

  // Tail fan, rising up and back from the tail tip.
  b.extrude(
    [
      [-0.28, 0.98],
      [-0.46, 1.0],
      [-0.52, 1.14, "sharp"],
      [-0.3, 1.06],
    ],
    {
      at: [0, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.02,
      bevel: 0.005,
      color: WING,
      bone: tailTip,
    },
  );

  return b.root;
}
```