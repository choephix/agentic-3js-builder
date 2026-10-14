```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, mix, paint, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Fennec fox",
  description:
    "A fennec fox (Vulpes zerda) in a neutral rest pose: oversized ears, a pale sandy coat with a cream face and belly, black eyes and nose, and a bushy tail with a dark tip.",
};

type P = [number, number, number];

// Palette, sRGB.
const FUR = "#dcae7c";
const CREAM = "#f8eedb";
const DARK = "#1c130e";
const EYE = "#100a07";
const GLINT = "#fff9ee";
const WHISKER = "#3b2b1f";

// Skull: an ellipsoid (radii in metres) around the head joint.
const HEAD: P = [0, 0.275, 0.17];
const SKULL: P = [0.056, 0.053, 0.058];

/** A point on the skull in direction (dx, dy, dz) from its centre, with the outward normal there. */
function onSkull(dx: number, dy: number, dz: number) {
  const k = 1 / Math.hypot(dx / SKULL[0], dy / SKULL[1], dz / SKULL[2]);
  const p = new THREE.Vector3(HEAD[0] + dx * k, HEAD[1] + dy * k, HEAD[2] + dz * k);
  const n = new THREE.Vector3(dx / SKULL[0] ** 2, dy / SKULL[1] ** 2, dz / SKULL[2] ** 2).normalize();
  return { p, n };
}

// Ear plate, metres, origin at its base. Smoothed into a broad base with a rounded tip.
const EAR: Array<[number, number]> = [
  [-0.03, 0],
  [0.03, 0],
  [0.036, 0.055],
  [0.024, 0.11],
  [0, 0.128],
  [-0.024, 0.11],
  [-0.036, 0.055],
];

// Paints: colour as a function of where a point is and which way its surface faces.
const coat = countershade(FUR, CREAM, { level: -0.2, soft: 0.45 });
const face = paint((p, n) => mix(FUR, CREAM, smoothstep(-0.2, 0.3, -n.y) + 0.8 * smoothstep(0.19, 0.24, p.z)));
const leg = paint((p) => mix(FUR, CREAM, smoothstep(0.065, 0.03, p.y)));
const tailCoat = paint((_p, n, s) =>
  mix(mix(CREAM, FUR, smoothstep(-0.4, 0.2, n.y)), DARK, smoothstep(0.8, 0.86, s[0])),
);
const earPaint = (side: number) => paint((_p, n) => mix(CREAM, FUR, smoothstep(-0.25, 0.25, n.x * side)));

export default function fennecFox() {
  const b = createBuilder({ name: "fennec-fox", detail: 1, paintSize: 1024 });

  // ---- Spine and body -------------------------------------------------
  const root = b.joint("root", { at: [0, 0.2, -0.05] });

  const spinePts: P[] = [
    [0, 0.19, -0.12],
    [0, 0.195, -0.05],
    [0, 0.2, 0.02],
    [0, 0.2, 0.09],
    [0, 0.215, 0.12],
  ];
  const spine = b.chain("spine", catmull(spinePts), {
    parent: root,
    role: "spine",
    names: ["spine1", "spine2", "spine3", "spine4"],
  });

  // A slim body, skinned along the spine so it bends with it.
  b.loft(
    [
      { at: spinePts[0], w: 0.085, h: 0.1 },
      { at: spinePts[1], w: 0.11, h: 0.115 },
      { at: spinePts[2], w: 0.115, h: 0.12 },
      { at: spinePts[3], w: 0.105, h: 0.12 },
      { at: spinePts[4], w: 0.085, h: 0.095 },
    ],
    { name: "body", color: coat, bone: spine, sides: 12 },
  );

  // ---- Neck and head --------------------------------------------------
  const neck = b.chain("neck", catmull([spinePts[4], [0, 0.24, 0.15], [0, 0.265, 0.165]]), {
    parent: "spine4",
    role: "neck",
    names: ["neck1", "neck2"],
  });
  b.sweep(neck, (t): [number, number] => [0.038 - 0.008 * t, 0.036 - 0.008 * t], {
    name: "neck",
    color: coat,
    sides: 10,
  });

  const head = b.joint("head", { parent: "neck2", at: HEAD, dir: [0, -0.12, 1], role: "head" });

  // The skull, a pale face and a sandy crown.
  b.part(new THREE.SphereGeometry(1, 20, 14), face, {
    name: "skull",
    bone: head,
    at: HEAD,
    scale: SKULL,
  });

  // The upper jaw: a short tapering muzzle that rides on the head.
  b.sweep(
    [
      [0, 0.27, 0.19],
      [0, 0.262, 0.27],
    ],
    (t): [number, number] => [0.032 - 0.021 * t, 0.03 - 0.019 * t],
    { name: "muzzle", color: face, bone: head, sides: 10 },
  );
  b.part(new THREE.SphereGeometry(1, 12, 8), DARK, {
    name: "nose",
    bone: head,
    at: [0, 0.264, 0.272],
    scale: [0.0125, 0.0095, 0.0105],
  });

  // The lower jaw, hinged at the back of the mouth.
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.245, 0.19], dir: [0, 0.1, 1], role: "jaw" });
  b.sweep(
    [
      [0, 0.245, 0.19],
      [0, 0.25, 0.255],
    ],
    (t): [number, number] => [0.02 - 0.01 * t, 0.014 - 0.006 * t],
    { name: "lowerJaw", color: CREAM, bone: jaw, sides: 8 },
  );

  // Large dark eyes set on the front of the skull, each with a glint.
  for (const s of [1, -1]) {
    const { p, n } = onSkull(0.7 * s, 0.2, 0.66);
    const up = new THREE.Vector3(0, 1, 0).addScaledVector(n, -n.y).normalize();
    b.part(new THREE.SphereGeometry(1, 14, 10), EYE, {
      name: "eye",
      bone: head,
      at: p.clone().addScaledVector(n, 0.0015).toArray(),
      dir: n.toArray(),
      scale: [0.0145, 0.0062, 0.0145],
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), GLINT, {
      name: "eyeGlint",
      bone: head,
      at: p.clone().addScaledVector(n, 0.0055).addScaledVector(up, 0.0045).toArray(),
      scale: 0.0034,
    });
  }

  // Huge ears: thin broad plates on hinges at the top of the skull. Cream inside, sandy outside.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const { p, n } = onSkull(0.45 * s, 0.85, -0.25);
    const ear = b.joint(`ear${L}`, {
      parent: head,
      at: p.clone().addScaledVector(n, -0.004).toArray(),
      dir: [0.15 * s, 1, -0.12],
      role: "hinge",
    });
    b.extrude(EAR, {
      name: `ear${L}`,
      color: earPaint(s),
      at: ear,
      x: [0.45 * s, 0, 0.9],
      y: [0.15 * s, 1, -0.12],
      thickness: [0.012, 0.004],
      smoothing: 2,
    });
  }

  // Whiskers: fine dark rods from the muzzle.
  const whiskers: Array<[P, P]> = [
    [
      [0.016, 0.268, 0.25],
      [0.075, 0.28, 0.285],
    ],
    [
      [0.017, 0.262, 0.255],
      [0.08, 0.262, 0.272],
    ],
    [
      [0.016, 0.257, 0.25],
      [0.068, 0.248, 0.262],
    ],
  ];
  for (const s of [1, -1])
    for (const [from, to] of whiskers)
      b.rod([from[0] * s, from[1], from[2]], [to[0] * s, to[1], to[2]], 0.0009, {
        name: "whisker",
        color: WHISKER,
        bone: head,
        sides: 5,
      });

  // ---- Legs -----------------------------------------------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const x = 0.05 * s;

    // Front leg: shoulder, elbow, wrist, paw.
    const fore = b.chain(
      `foreLeg${L}`,
      catmull([
        [x, 0.195, 0.1],
        [1.04 * x, 0.105, 0.105],
        [x, 0.035, 0.1],
        [x, 0.018, 0.12],
      ]),
      {
        parent: "spine4",
        role: "leg",
        names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `paw${L}`],
      },
    );
    b.sweep(fore, (t): [number, number] => [0.028 - 0.012 * t, 0.026 - 0.011 * t], {
      name: `foreLeg${L}`,
      color: leg,
      sides: 10,
    });
    b.part(new THREE.SphereGeometry(1, 12, 8), CREAM, {
      name: `foreFoot${L}`,
      bone: `paw${L}`,
      at: [x, 0.011, 0.126],
      scale: [0.013, 0.011, 0.025],
    });
    b.part(new THREE.SphereGeometry(1, 14, 10), coat, {
      name: `chest${L}`,
      bone: `shoulder${L}`,
      at: [0.9 * x, 0.205, 0.095],
      scale: [0.04, 0.05, 0.05],
    });

    // Hind leg: hip, stifle (knee), hock, foot.
    const hind = b.chain(
      `hindLeg${L}`,
      catmull([
        [1.1 * x, 0.195, -0.1],
        [1.1 * x, 0.11, -0.075],
        [x, 0.06, -0.135],
        [x, 0.018, -0.115],
      ]),
      {
        parent: "root",
        role: "leg",
        names: [`hip${L}`, `knee${L}`, `hock${L}`, `foot${L}`],
      },
    );
    b.sweep(hind, (t): [number, number] => [0.032 - 0.018 * t, 0.028 - 0.014 * t], {
      name: `hindLeg${L}`,
      color: leg,
      sides: 10,
    });
    b.part(new THREE.SphereGeometry(1, 12, 8), CREAM, {
      name: `hindFoot${L}`,
      bone: `foot${L}`,
      at: [x, 0.011, -0.1],
      scale: [0.013, 0.011, 0.027],
    });
    b.part(new THREE.SphereGeometry(1, 14, 10), coat, {
      name: `thigh${L}`,
      bone: `hip${L}`,
      at: [1.05 * x, 0.205, -0.09],
      scale: [0.045, 0.05, 0.058],
    });
  }

  // ---- Tail -----------------------------------------------------------
  // Bushy, widest about 40% of the way along, tapering to a dark tip.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.195, -0.115],
      [0, 0.19, -0.19],
      [0, 0.19, -0.27],
      [0, 0.205, -0.33],
      [0, 0.235, -0.37],
    ]),
    {
      parent: "spine1",
      role: "tail",
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    },
  );
  b.sweep(
    tail,
    (t): [number, number] => {
      const r = t < 0.4 ? 0.02 + 0.022 * (t / 0.4) : 0.042 - 0.03 * ((t - 0.4) / 0.6);
      return [r, 0.9 * r];
    },
    { name: "tail", color: tailCoat, sides: 12, caps: { end: "point" } },
  );

  return b.root;
}
```