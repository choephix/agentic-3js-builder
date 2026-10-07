```ts
import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  gradient,
  mix,
  paint,
  polyline,
  rng,
  smoothstep,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Fennec fox",
  description: "A sand-coloured fennec fox with oversized ears, cream muzzle and white-tipped tail, in a rest pose.",
};

const SAND = "#d89a5c";
const CREAM = "#f6e7cc";
const DARK = "#17110d";

const coat = countershade(SAND, CREAM, { level: 0, soft: 0.4 });
const headPaint = paint((p, n) =>
  mix(coat.at(p, n), CREAM, smoothstep(0.292, 0.272, p.y) * smoothstep(0.2, 0.26, p.z)),
);
const tailPaint = paint((p, n) => mix(coat.at(p, n), CREAM, smoothstep(-0.34, -0.38, p.z)));
const earPaint = gradient(CREAM, SAND, [0, 0.34, 0.2], [0, 0.46, 0.2]);

const EAR = [
  [-0.035, 0],
  [0.035, 0],
  [0.028, 0.07],
  [0, 0.13, "sharp"],
  [-0.028, 0.07],
];

export default function fennecFox() {
  const b = createBuilder({ name: "fennec fox", detail: 1, paintSize: 1024 });

  // Skeleton: pelvis root, spine, neck, head, jaw, tail, four legs.
  b.joint("hips", { at: [0, 0.22, -0.16] });
  const spine = b.chain("spine", catmull([[0, 0.22, -0.16], [0, 0.23, -0.02], [0, 0.25, 0.12]]), {
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  b.chain("neck", catmull([[0, 0.25, 0.12], [0, 0.28, 0.18], [0, 0.3, 0.22]]), {
    names: ["neck1", "neck2"],
    role: "neck",
  });
  b.joint("head", { at: [0, 0.3, 0.25], parent: "neck2", role: "head" });
  b.joint("jaw", { at: [0, 0.262, 0.22], parent: "head", role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.22, -0.14], [0, 0.23, -0.26], [0, 0.23, -0.36], [0, 0.2, -0.42]]), {
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
  });

  // Body: a smooth loft bending along the spine joints.
  b.loft(
    [
      { at: [0, 0.22, -0.16], w: 0.1, h: 0.12 },
      { at: [0, 0.23, -0.02], w: 0.12, h: 0.13 },
      { at: [0, 0.25, 0.12], w: 0.1, h: 0.11 },
    ],
    { name: "body", color: coat, bone: spine, sides: 12 },
  );

  // Head: a loft with a long, narrow muzzle, rigid on the head joint.
  const head = b.loft(
    [
      { at: [0, 0.29, 0.33], w: 0.03, h: 0.035 },
      { at: [0, 0.285, 0.29], w: 0.065, h: 0.065 },
      { at: [0, 0.295, 0.25], w: 0.1, h: 0.1 },
      { at: [0, 0.31, 0.21], w: 0.11, h: 0.11 },
      { at: [0, 0.3, 0.17], w: 0.08, h: 0.09 },
    ],
    { name: "head", color: headPaint, bone: "head", sides: 12 },
  );

  // Lower jaw on its own hinge.
  b.loft(
    [
      { at: [0, 0.262, 0.2], w: 0.07, h: 0.05 },
      { at: [0, 0.258, 0.27], w: 0.06, h: 0.03 },
      { at: [0, 0.258, 0.31], w: 0.03, h: 0.02 },
    ],
    { name: "lowerJaw", color: CREAM, bone: "jaw", sides: 8 },
  );

  // Tail: bushy, tip cream.
  b.sweep(tail, [0.045, 0.052, 0.05, 0.022], { name: "tail", color: tailPaint, sides: 10 });

  // Legs: digitigrade hind legs, straight fore legs, cream paws.
  for (const [side, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const m = (p: number[]) => [p[0] * s, p[1], p[2]] as [number, number, number];

    const fore = b.chain(
      `foreleg${side}`,
      polyline([m([0.05, 0.22, 0.1]), m([0.052, 0.1, 0.11]), m([0.052, 0.03, 0.125]), m([0.052, 0.015, 0.155])]),
      { names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`], role: "leg" },
    );
    b.sweep(fore, [0.02, 0.016, 0.013, 0.013], { name: `foreleg${side}`, color: coat });

    const hind = b.chain(
      `hindleg${side}`,
      polyline([m([0.055, 0.21, -0.14]), m([0.058, 0.12, -0.1]), m([0.058, 0.045, -0.2]), m([0.058, 0.015, -0.16])]),
      { names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`], role: "leg" },
    );
    b.sweep(hind, [0.024, 0.017, 0.013, 0.013], { name: `hindleg${side}`, color: coat });

    b.part(new THREE.SphereGeometry(0.024, b.segments(10), b.segments(8)), CREAM, {
      name: `pawFront${side}`,
      bone: `paw${side}`,
      at: m([0.052, 0.012, 0.15]),
      scale: [1, 0.5, 1.5],
    });
    b.part(new THREE.SphereGeometry(0.024, b.segments(10), b.segments(8)), CREAM, {
      name: `pawHind${side}`,
      bone: `pawH${side}`,
      at: m([0.058, 0.012, -0.15]),
      scale: [1, 0.5, 1.5],
    });

    // Huge upright ears, one per side.
    b.extrude(EAR, {
      name: `ear${side}`,
      color: earPaint,
      at: [s * 0.03, 0.34, 0.2],
      bone: "head",
      thickness: 0.014,
      bevel: 0.004,
      smoothing: 1,
    });
  }

  // Eyes and nose, seated on the real head surface.
  const headSurface = b.surface(head);
  for (const [side, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const eyeGeo = new THREE.SphereGeometry(0.019, b.segments(10), b.segments(8));
    eyeGeo.scale(1.2, 0.6, 1);
    const hit = headSurface.nearest([s * 0.045, 0.3, 0.27]);
    b.stick(eyeGeo, DARK, hit, { name: `eye${side}`, embed: 0.3 });
  }
  const noseGeo = new THREE.SphereGeometry(0.022, b.segments(10), b.segments(8));
  noseGeo.scale(1.3, 0.7, 1);
  b.stick(noseGeo, DARK, headSurface.nearest([0, 0.29, 0.36]), { name: "nose", embed: 0.35 });

  // Fur tufts on the flanks, hanging down.
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 64"><path d="M20 0C27 22 38 38 34 64L20 52L6 64C2 38 13 22 20 0Z" fill="#ffffff"/></svg>`,
  );
  const flanks = b.surface(b.loft.length ? head : head).scatter(0);
  void flanks;

  return b.root;
}
```