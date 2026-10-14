import * as THREE from "three";
import { catmull, countershade, createBuilder, limb, mottle, paint } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

// Rust coat, cream face and ear lining, chocolate belly, dark legs and nose.
const FUR = "#c9612c";
const FUR_DEEP = "#86371a";
const CREAM = "#f4e7cf";
const BROWN = "#3d271c";
const DARK = "#22160f";
const NOSE = "#0d0806";
const WHITE = "#fff8ea";
const CLAW = "#e9dcc3";

const fur = mottle(FUR, FUR_DEEP, { size: 0.06, contrast: 0.5, seed: 7 });
const coat = countershade(fur, BROWN, { level: 0.1 });

// Rounded upright ear, drawn in its own plane (x sideways, y up and leaning back).
const EAR: OutlinePoint[] = [
  [-0.036, -0.012],
  [0.036, -0.012],
  [0.03, 0.045],
  [0, 0.088],
  [-0.03, 0.045],
];

// Cream lining on the forward-facing side of each ear, rust elsewhere.
const earCoat = paint((_p, n, s) => {
  const lining = Math.hypot(s[0] / 0.024, (s[1] - 0.034) / 0.04) < 1;
  return n.z > 0.3 && lining ? CREAM : fur;
});

// Tail: alternating rust and chocolate rings, dark tip.
const tailCoat = paint((_p, _n, s) => {
  if (s[0] > 0.93) return DARK;
  return Math.floor(s[0] * 7) % 2 === 0 ? fur : BROWN;
});

// Head: rust crown, cream muzzle and cheeks, dark eye rings, tear lines, nose and throat.
const headCoat = paint((p) => {
  const q = new THREE.Vector3(Math.abs(p.x), p.y, p.z);
  if (q.z > 0.47 && q.y > 0.3) return NOSE;
  if (q.distanceTo(new THREE.Vector3(0.058, 0.365, 0.39)) < 0.034) return BROWN;
  if (distToSeg(q, [0.058, 0.35, 0.4], [0.04, 0.305, 0.45]) < 0.011) return BROWN;
  if (q.z > 0.37 && q.y < 0.385) return CREAM;
  if (q.y < 0.3) return BROWN;
  return fur;
});

function distToSeg(p: THREE.Vector3, a: number[], c: number[]): number {
  const dx = c[0] - a[0];
  const dy = c[1] - a[1];
  const dz = c[2] - a[2];
  const t = Math.max(
    0,
    Math.min(1, ((p.x - a[0]) * dx + (p.y - a[1]) * dy + (p.z - a[2]) * dz) / (dx * dx + dy * dy + dz * dz)),
  );
  return Math.hypot(p.x - a[0] - dx * t, p.y - a[1] - dy * t, p.z - a[2] - dz * t);
}

function must<T>(hit: T | null, what: string): T {
  if (!hit) throw new Error(`no surface under the ${what}`);
  return hit;
}

export const meta = {
  name: "Red panda",
  description: "A red panda on all fours: rust coat, cream face, dark legs and a ringed tail.",
};

export default function build() {
  const b = createBuilder({ name: "red-panda" });

  // Skeleton: hips at the root, spine and neck forward, head with jaw and ears,
  // four legs, and a ringed tail trailing behind.
  const hips = b.joint("hips", { at: [0, 0.225, -0.12], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.225, -0.12],
      [0, 0.235, 0],
      [0, 0.25, 0.11],
      [0, 0.265, 0.17],
    ]),
    { parent: hips, names: ["spineA", "spineB", "spineC"], role: "spine" },
  );
  const shoulderTop = spine.joints[2]!;

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.265, 0.17],
      [0, 0.3, 0.235],
      [0, 0.335, 0.285],
    ]),
    { parent: shoulderTop, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[1]!,
    at: [0, 0.335, 0.285],
    dir: [0, 0.2, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.318, 0.33], dir: [0, 0, 1], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.225, -0.12],
      [0, 0.25, -0.25],
      [0, 0.262, -0.37],
      [0, 0.25, -0.46],
      [0, 0.215, -0.52],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // Torso and neck: one lofted body skinned over the spine and neck.
  b.loft(
    [
      { at: [0, 0.225, -0.12], w: 0.15, h: 0.15 },
      { at: [0, 0.235, 0], w: 0.17, h: 0.17 },
      { at: [0, 0.25, 0.11], w: 0.18, h: 0.18 },
      { at: [0, 0.265, 0.17], w: 0.16, h: 0.16 },
      { at: [0, 0.3, 0.235], w: 0.12, h: 0.12 },
    ],
    { bone: [spine, neck], color: coat, detail: 1.25 },
  );

  // Head: a tapered loft, short muzzle, broad cheeks.
  const skull = b.loft(
    [
      { at: [0, 0.345, 0.25], w: 0.13, h: 0.13 },
      { at: [0, 0.36, 0.31], w: 0.145, h: 0.135 },
      { at: [0, 0.35, 0.36], w: 0.16, h: 0.14 },
      { at: [0, 0.335, 0.415], w: 0.11, h: 0.085 },
      { at: [0, 0.325, 0.455], w: 0.05, h: 0.05 },
    ],
    { bone: head, color: headCoat, detail: 1.5 },
  );
  const headSurf = b.surface(skull);

  // Lower jaw: cream chin on its own joint so the mouth can open.
  b.loft(
    [
      { at: [0, 0.315, 0.35], w: 0.09, h: 0.05 },
      { at: [0, 0.308, 0.4], w: 0.075, h: 0.045 },
      { at: [0, 0.3, 0.44], w: 0.045, h: 0.03 },
    ],
    { bone: jaw, color: CREAM, detail: 1.25 },
  );

  // Ears: upright rounded flaps, each on its own hinge joint.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const earBase = [s * 0.042, 0.405, 0.32];
    const ear = b.joint(`ear${side}`, { parent: head, at: earBase, role: "hinge" });
    b.extrude(EAR, {
      at: earBase,
      x: [s, 0, 0],
      y: [0, 0.966, -0.259],
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 2,
      color: earCoat,
      bone: ear,
    });
  }

  // Eyes, with a small glint, seated on the cheek surface.
  for (const s of [1, -1]) {
    const eye = must(headSurf.ray([s * 0.058, 0.365, 0.7], [0, 0, -1]), "eye");
    b.part(new THREE.SphereGeometry(0.025, 10, 7), NOSE, {
      at: eye.moved([0, 0.006, 0]).at,
      bone: head,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.0075, 6, 4), WHITE, {
      at: eye.moved([0, 0.02, 0.012]).at,
      bone: head,
    });
  }

  // Nose pad on the muzzle tip.
  const nose = must(headSurf.ray([0, 0.33, 0.7], [0, 0, -1]), "nose");
  b.part(new THREE.SphereGeometry(1, 10, 7).scale(0.03, 0.022, 0.026), NOSE, {
    at: nose.moved([0, -0.002, 0]).at,
    bone: head,
    flat: true,
  });

  // Whiskers: three fine rods a side from the muzzle.
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const y = 0.332 - k * 0.011;
      b.rod(
        [s * 0.03, y, 0.43],
        [s * (0.11 + k * 0.008), y - 0.012 - k * 0.004, 0.515],
        0.0016,
        { color: WHITE, bone: head },
      );
    }
  }

  // Bushy ringed tail.
  b.sweep(tail, (t: number) => 0.036 + 0.03 * Math.sin(Math.PI * Math.pow(t, 0.7)), {
    color: tailCoat,
    detail: 1.25,
  });

  // Legs: each is a solved limb ending on a foot on the floor, with a paw and three claws.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.07;

    const fore = limb([x, 0.215, 0.17], [x, 0.02, 0.195], [0.085, 0.075, 0.045], [
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const foreLeg = b.chain(`foreLeg${S}`, fore, {
      parent: shoulderTop,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `paw${S}`],
      role: "leg",
    });
    b.sweep(foreLeg, [0.034, 0.02], { color: DARK });
    const forePaw = foreLeg.tip!;
    b.part(new THREE.SphereGeometry(1, 10, 7).scale(0.03, 0.02, 0.042), DARK, {
      at: [x, 0.02, 0.195],
      bone: forePaw,
      flat: true,
    });
    for (const dx of [-0.011, 0, 0.011]) {
      b.spike([x + dx, 0.024, 0.232], [0, -0.35, 1], 0.02, 0.0045, { color: CLAW, bone: forePaw });
    }

    const hind = limb([x, 0.21, -0.12], [x, 0.02, -0.1], [0.085, 0.075, 0.045], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hindLeg = b.chain(`hindLeg${S}`, hind, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`],
      role: "leg",
    });
    b.sweep(hindLeg, [0.034, 0.02], { color: DARK });
    const hindPaw = hindLeg.tip!;
    b.part(new THREE.SphereGeometry(1, 10, 7).scale(0.03, 0.02, 0.042), DARK, {
      at: [x, 0.02, -0.1],
      bone: hindPaw,
      flat: true,
    });
    for (const dx of [-0.011, 0, 0.011]) {
      b.spike([x + dx, 0.024, -0.064], [0, -0.35, 1], 0.02, 0.0045, { color: CLAW, bone: hindPaw });
    }
  }

  return b.root;
}
