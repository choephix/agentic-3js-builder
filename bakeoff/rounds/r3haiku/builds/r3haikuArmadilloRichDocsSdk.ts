import * as THREE from "three";
import {
  createBuilder,
  rng,
  limb,
  catmull,
  stripes,
  countershade,
} from "../../../../src/index";

export const meta = {
  name: "Nine-banded armadillo",
  description: "A trotting nine-banded armadillo with a banded shell, pointed snout, tall ears and a tapering armoured tail.",
};

const SHELL = "#c8a38f"; // dusty pinkish-tan
const BAND = "#9a7463"; // darker band
const BELLY = "#e6cfbd";
const HEAD = "#c49e8c";
const LEG = "#b58b78";
const EAR = "#a97a6b";
const EYE = "#1d1714";
const NOSE = "#5a4039";
const CLAW = "#3e302b";
const HAIR = "#f1e7d6";

export default function build() {
  const b = createBuilder({ name: "armadillo" });

  // Skeleton: hips root, spine forward, tail back, neck and head forward.
  const hips = b.joint("hips", { at: [0, 0.2, -0.12], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.2, -0.12],
      [0, 0.21, 0.07],
      [0, 0.22, 0.14],
    ]),
    { parent: hips, names: ["spineA", "spineB"], role: "spine" },
  );
  const spineEnd = spine.joints[spine.joints.length - 1];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.21, 0.13],
      [0, 0.235, 0.2],
      [0, 0.25, 0.25],
    ]),
    { parent: spineEnd, names: ["neck", "headBase", "head"], role: "neck" },
  );
  const head = neck.tip!;

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.2, -0.12],
      [0, 0.2, -0.24],
      [0, 0.19, -0.36],
      [0, 0.18, -0.46],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // Banded shell: stripes ring the body, countershaded toward the belly.
  const shellPaint = countershade(stripes(SHELL, BAND, { size: 0.04, width: 0.55 }), BELLY, { level: -0.25 });
  const body = b.loft(
    [
      { at: [0, 0.2, -0.12], w: 0.13, h: 0.13 },
      { at: [0, 0.2, -0.02], w: 0.2, h: 0.18 },
      { at: [0, 0.21, 0.07], w: 0.22, h: 0.19 },
      { at: [0, 0.22, 0.14], w: 0.18, h: 0.17 },
    ],
    { bone: spine, color: shellPaint },
  );

  // Neck and tapering head with a pointed snout.
  b.sweep(
    neck,
    [0.05, 0.048],
    { color: SHELL },
  );
  const headTube = b.sweep(
    catmull([
      [0, 0.25, 0.18],
      [0, 0.25, 0.25],
      [0, 0.235, 0.34],
    ]),
    [0.056, 0.012],
    { bone: head, color: HEAD, caps: { end: "point" } },
  );
  const headS = b.surface(headTube);

  // Tall leathery ears.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.022, 0],
        [0.022, 0],
        [0.03, 0.07],
        [0.018, 0.115],
        [0, 0.13, "sharp"],
        [-0.02, 0.09],
      ],
      {
        at: [s * 0.03, 0.29, 0.2],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.008,
        bevel: 0.002,
        smoothing: 1,
        color: EAR,
        bone: head,
      },
    );
  }

  // Small beady eyes seated on the head surface.
  for (const s of [1, -1]) {
    const hit = headS.nearest([s * 0.05, 0.265, 0.235]);
    b.stick(new THREE.SphereGeometry(0.013, 6, 4), EYE, hit, { embed: 0.3 });
  }

  // Pointed nose tip.
  b.part(new THREE.SphereGeometry(0.016, 6, 4), NOSE, {
    bone: head,
    at: head.local({ forward: 0.095, up: -0.01 }),
  });

  // Four legs in a trot: diagonal pairs move together.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Front leg: elbow points back.
    const frontZ = s > 0 ? 0.2 : 0.1;
    const frontPts = limb(
      [s * 0.07, 0.19, 0.12],
      [s * 0.08, 0.02, frontZ],
      [0.1, 0.1],
      [[0, 0, -1]],
    );
    const fl = b.chain(`arm${side}`, frontPts, {
      parent: spineEnd,
      names: [`shoulder${side}`, `elbow${side}`, `paw${side}`],
      role: "arm",
    });
    b.sweep(fl, [0.036, 0.024], { color: LEG });
    for (const dx of [-0.011, 0, 0.011]) {
      b.spike([s * 0.08 + dx, 0.012, frontZ + 0.03], [0, -0.35, 1], 0.022, 0.0055, { color: CLAW });
    }

    // Hind leg: stifle points forward.
    const hindZ = s > 0 ? -0.2 : -0.08;
    const hindPts = limb(
      [s * 0.07, 0.19, -0.12],
      [s * 0.08, 0.02, hindZ],
      [0.1, 0.1],
      [[0, 0, 1]],
    );
    const hl = b.chain(`leg${side}`, hindPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(hl, [0.038, 0.025], { color: LEG });
    for (const dx of [-0.01, 0, 0.01]) {
      b.spike([s * 0.08 + dx, 0.012, hindZ + 0.028], [0, -0.35, 1], 0.018, 0.0045, { color: CLAW });
    }
  }

  // Long armoured tail tapering to a point, banded like the shell.
  b.sweep(tail, [0.042, 0.007], {
    color: shellPaint,
    caps: { end: "point" },
  });

  // Coarse pale hairs poking out between the bands.
  const shellS = b.surface(body);
  const hairs = shellS.scatter(90, {
    rng: rng(11),
    minDist: 0.03,
    filter: (h) => h.n.y > -0.4,
  });
  for (const h of hairs) {
    b.spike(h, h, 0.024, 0.0028, { color: HAIR });
  }

  return b.root;
}
