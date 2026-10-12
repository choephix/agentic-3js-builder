```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  limb,
  paint,
  gradient,
  countershade,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "flamingo",
  description:
    "A greater flamingo standing tall in shallow water: candy-pink body, coral wings with black flight-feather tips, an S-curved neck, a two-tone bill with a black tip, pale yellow eyes, rose legs with knobbly knees and webbed feet.",
};

const CANDY = "#ff9cc0";
const BELLY = "#ffd3e2";
const CORAL = "#ff6f58";
const BLACK = "#17151b";
const BILL = "#ffc6d8";
const ROSE = "#e46a8c";
const EYE = "#f4f0a4";
const PUPIL = "#1d1a20";
const WATER = "#7ccbd3";
const RIPPLE = "#d9f4f2";
const LILY = "#63a86f";

// Outline of one primary feather: `len` long, `w` across, sharp tip.
const blade = (len: number, w: number): OutlinePoint[] => [
  [0, -w],
  [len * 0.55, -w * 0.8],
  [len, 0, "sharp"],
  [len * 0.55, w * 0.8],
  [0, w],
];

// Folded wing seen from the side: u runs forward (+Z), v up (+Y), origin at the wing's centre.
const wingOutline: OutlinePoint[] = [
  [0.24, 0.02],
  [0.24, 0.08],
  [0.18, 0.12],
  [0.02, 0.13],
  [-0.14, 0.11],
  [-0.3, 0.06],
  [-0.44, 0.0, "sharp"],
  [-0.3, -0.06],
  [-0.2, -0.1],
  [-0.04, -0.1],
  [0.1, -0.08],
  [0.2, -0.04],
];

export default function build() {
  const b = createBuilder({ name: "flamingo" });

  // ---- Body -----------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.84, 0], role: "spine" });

  b.loft(
    [
      { at: [0, 0.85, -0.38], w: 0.07, h: 0.08 },
      { at: [0, 0.86, -0.26], w: 0.2, h: 0.2 },
      { at: [0, 0.87, -0.1], w: 0.24, h: 0.25 },
      { at: [0, 0.88, 0.06], w: 0.24, h: 0.26 },
      { at: [0, 0.92, 0.2], w: 0.18, h: 0.22 },
    ],
    { bone: hips, color: countershade(CANDY, BELLY) },
  );

  // Short fluffy tail fan at the rump.
  const tail = b.joint("tail", { parent: hips, at: [0, 0.86, -0.3], aim: [0, 0.9, -0.52], role: "tail" });
  b.extrude(
    [
      [0, -0.05],
      [0.08, -0.03],
      [0.15, 0, "sharp"],
      [0.13, 0.07],
      [0.06, 0.09],
      [0, 0.04],
    ],
    {
      at: [0, 0.86, -0.34],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.06,
      bevel: 0.012,
      smoothing: 1,
      color: CORAL,
      bone: tail,
    },
  );

  // ---- S-curved neck and head ----------------------------------------------
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.96, 0.14],
      [0, 1.12, 0.3],
      [0, 1.28, 0.15],
      [0, 1.39, 0.25],
      [0, 1.45, 0.36],
    ]),
    { parent: hips, names: ["neck1", "neck2", "neck3", "neck4", "head"], role: "neck" },
  );
  const head = neck.tip!;
  b.sweep(neck, (t: number) => 0.062 - 0.026 * t, { color: CANDY });

  b.capsule([0, 1.44, 0.34], [0, 1.455, 0.43], 0.046, { bone: head, color: CANDY });

  // Upper mandible: pale pink, hooked down, black tip.
  b.sweep(
    bezier([0, 1.445, 0.44], [0, 1.44, 0.5], [0, 1.39, 0.53], [0, 1.345, 0.54]),
    (t: number): [number, number] => [0.024 - 0.012 * t, 0.03 - 0.02 * t],
    {
      bone: head,
      color: BILL,
      bands: [
        [0.7, BILL],
        [1, BLACK],
      ],
      caps: { end: "point" },
    },
  );

  // Lower mandible on its own jaw joint.
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.43, 0.44], aim: [0, 1.37, 0.53], role: "jaw" });
  b.sweep(
    bezier([0, 1.43, 0.44], [0, 1.418, 0.5], [0, 1.372, 0.525], [0, 1.33, 0.535]),
    (t: number): [number, number] => [0.02 - 0.01 * t, 0.018 - 0.01 * t],
    {
      bone: jaw,
      color: BILL,
      bands: [
        [0.6, BILL],
        [1, BLACK],
      ],
      caps: { end: "point" },
    },
  );

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.017, 8, 6), EYE, { bone: head, at: [s * 0.044, 1.455, 0.39] });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), PUPIL, { bone: head, at: [s * 0.059, 1.457, 0.39] });
  }

  // ---- Wings: coral coverts, black flight feathers at the tips ---------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wing = b.joint(`wing${side}`, {
      parent: hips,
      at: [s * 0.12, 0.93, 0.1],
      aim: [s * 0.12, 0.9, -0.3],
      role: "wing",
    });

    const coral = gradient(CANDY, CORAL, [s * 0.13, 0.95, 0.2], [s * 0.13, 0.92, -0.1]);
    const wingPaint = paint((_p, _n, u) => (u[0] + 0.03 * Math.sin(u[1] * 70) < -0.3 ? BLACK : coral));

    b.extrude(wingOutline, {
      at: [s * 0.122, 0.9, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.006,
      smoothing: 1,
      color: wingPaint,
      bone: wing,
    });

    // Five black primaries fanned off the wing tip: [base z, base y, length].
    const primaries: [number, number, number][] = [
      [-0.22, 0.86, 0.16],
      [-0.27, 0.85, 0.18],
      [-0.32, 0.84, 0.18],
      [-0.36, 0.83, 0.16],
      [-0.4, 0.82, 0.14],
    ];
    for (const [z, y, len] of primaries) {
      b.extrude(blade(len, 0.02), {
        at: [s * 0.14, y, z],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.008,
        color: BLACK,
        bone: wing,
      });
    }
  }

  // ---- Rose legs, knobbly joints, webbed feet --------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPt: number[] = [s * 0.09, 0.8, -0.02];
    const footPt: number[] = [s * 0.1, 0.02, 0];

    const pts = limb(hipPt, footPt, [0.22, 0.38, 0.22], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
    });
    const ankle = leg.tip!;
    const knee = leg.joints[1];
    const hock = leg.joints[2];

    b.sweep(leg, (t: number) => 0.03 - 0.018 * t, { color: ROSE });

    for (const j of [knee, hock]) {
      b.part(new THREE.IcosahedronGeometry(0.03, 0), ROSE, { bone: j, at: j.at, flat: true });
    }

    // Front toes, one hind toe, all on the foot joint.
    const tO: number[] = [s * 0.17, 0.008, 0.1];
    const tM: number[] = [s * 0.12, 0.008, 0.17];
    const tI: number[] = [s * 0.05, 0.008, 0.14];
    const tH: number[] = [s * 0.09, 0.008, -0.04];
    const digits: [string, number[]][] = [
      ["o", tO],
      ["m", tM],
      ["i", tI],
      ["h", tH],
    ];
    for (const [k, tip] of digits) {
      const toe = b.chain(`toe${side}${k}`, [footPt, tip], { parent: ankle, role: "digit" });
      b.sweep(toe, k === "h" ? [0.007, 0.004] : [0.009, 0.005], { color: ROSE });
    }

    // Scalloped webs between the front toes.
    b.membrane([footPt, tO], [footPt, tM], { thickness: 0.006, color: ROSE, bone: ankle, scallop: 0.25 });
    b.membrane([footPt, tM], [footPt, tI], { thickness: 0.006, color: ROSE, bone: ankle, scallop: 0.25 });

    // Ripple ring where the foot meets the water.
    b.part(new THREE.RingGeometry(0.08, 0.1, 24).rotateX(-Math.PI / 2), RIPPLE, {
      bone: hips,
      at: [s * 0.1, 0.006, 0],
    });
  }

  // ---- Shallow water and lily pads -------------------------------------------
  b.part(new THREE.CylinderGeometry(0.95, 0.95, 0.016, 36), WATER, { bone: hips, at: [0, -0.004, 0] });

  const pad = (r: number) => new THREE.CylinderGeometry(r, r, 0.008, 18, 1, false, 0.5, Math.PI * 2 - 0.5);
  b.part(pad(0.16), LILY, { bone: hips, at: [0.55, 0.002, 0.25], rotation: [0, 30, 0] });
  b.part(pad(0.12), LILY, { bone: hips, at: [-0.5, 0.002, -0.35], rotation: [0, -60, 0] });
  b.part(pad(0.1), LILY, { bone: hips, at: [0.25, 0.002, -0.62], rotation: [0, 110, 0] });

  return b.root;
}
```