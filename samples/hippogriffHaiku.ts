import * as THREE from "three";
import { createBuilder, type Builder } from "../src/builder";
import type { PointInput } from "../src/math";
import type { OutlineInput } from "../src/outline";
import { catmull, polyline } from "../src/path";
import type { Chain, Joint } from "../src/skeleton";

export const meta = {
  name: "Hippogriff",
  description:
    "A hippogriff in low-poly: an eagle's head, golden forequarters with feathered thighs and black talons, spread blue-and-teal wings, joined to a chestnut horse's barrel, hindquarters and hooves, with a plum mane and tail, a gold-studded leather harness and gold anklets.",
  style: "low-poly",
  commit: "b816db2",
};

// Flat palette: one colour per string, no paints.
const COAT = "#8f4b2d"; // chestnut horse coat
const COAT_LIGHT = "#b9794a"; // belly countershade
const COAT_DARK = "#4a2719"; // stockings
const HOOF = "#2a1f1a";
const GOLD = "#e3a63b"; // eagle forequarters, golden plumage
const GOLD_DEEP = "#b8781f"; // shadowed feathers, wing arm
const TAWNY = "#c98434"; // eagle head
const BROW = "#3b2416";
const BELLY = "#f2dca0"; // warm pale belly
const CREAM = "#f4e7c6"; // crown, fetlocks, coverts, bib
const SCALE = "#f0cc5a"; // eagle legs and toes
const TALON = "#232124";
const BLUE = "#23587a"; // primaries
const TEAL = "#3f8482"; // secondaries
const NAVY = "#14263d"; // flight-feather tips
const BEAK = "#3a3a4e";
const CERE = "#f2b632";
const EYE = "#ffb21e";
const PUPIL = "#16120f";
const MANE = "#2e2036"; // plum-black mane and tail
const MANE_HI = "#5f3f78"; // violet highlight locks
const LEATHER = "#5a3a22";
const STUD = "#ffd65a"; // gold trim

/** A flat feather: root at x = 0, tip at x = len, width along y, drawn with a sharp point. */
function feather(len: number, w: number): OutlineInput {
  return [
    [0, -w * 0.3],
    [len * 0.4, -w * 0.5],
    [len * 0.9, -w * 0.22],
    [len, 0, "sharp"],
    [len * 0.9, w * 0.22],
    [len * 0.4, w * 0.5],
    [0, w * 0.3],
  ];
}

/**
 * One feather or blade. `dir` runs root to tip, `nrm` is the thickness direction (the plume lies flat against it);
 * the width runs across both.
 */
function plume(
  b: Builder,
  at: PointInput,
  dir: THREE.Vector3,
  nrm: THREE.Vector3,
  len: number,
  w: number,
  th: number,
  color: string,
  bone?: Joint,
) {
  const x = dir.clone().normalize();
  const n = nrm.clone().addScaledVector(x, -nrm.dot(x)).normalize();
  const y = n.clone().cross(x).normalize();
  b.extrude(feather(len, w), {
    at,
    x: [x.x, x.y, x.z],
    y: [y.x, y.y, y.z],
    thickness: th,
    smoothing: 0,
    color,
    ...(bone ? { bone } : {}),
  });
}

export default function build() {
  const b = createBuilder({ name: "hippogriff" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const UP = V(0, 1, 0);
  const X = V(1, 0, 0);
  const tipOf = (c: Chain): Joint => c.tip ?? c.joints[c.joints.length - 1];

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.36, -0.5], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 1.36, -0.42], [0, 1.36, -0.05], [0, 1.4, 0.28], [0, 1.5, 0.6]]), {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 1.52, 0.6], [0, 1.76, 0.8], [0, 1.96, 0.95], [0, 2.1, 1.08]]), {
    parent: spine.joints[2],
    names: ["neck1", "neck2", "neck3", "head"],
    role: "neck",
  });
  const head = tipOf(neck);
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.15, up: -0.02 }),
    aim: head.local({ forward: 0.32, up: -0.1 }),
    role: "jaw",
  });

  // ---------------------------------------------------------------- body
  // Chestnut hindquarters, golden forequarters: the colour changes at the girth, with a pale belly on each half.
  const body = b.loft(
    [
      { at: [0, 1.36, -0.98], w: 0.36, h: 0.5 },
      { at: [0, 1.36, -0.7], w: 0.56, h: 0.62 },
      { at: [0, 1.34, -0.25], w: 0.6, h: 0.72 },
      { at: [0, 1.3, 0.2], w: 0.56, h: 0.74 },
      { at: [0, 1.34, 0.5], w: 0.46, h: 0.66 },
      { at: [0, 1.46, 0.7], w: 0.36, h: 0.44 },
    ],
    {
      bone: spine,
      sides: 8,
      smooth: false,
      bands: [
        [0.5, COAT],
        [1, GOLD],
      ],
      sectors: [
        [120, 240, COAT_LIGHT, 0, 0.5],
        [120, 240, BELLY, 0.5, 1],
      ],
    },
  );

  const neckTube = b.sweep(neck, [0.16, 0.12, 0.095, 0.085], {
    color: GOLD,
    sides: 7,
    smooth: false,
    sectors: [[120, 240, BELLY]],
  });

  // Eagle head: a faceted skull, amber eyes with dark pupils, brows, a crest and a two-part beak.
  b.loft(
    [
      { at: head.local({ forward: -0.13, up: 0.02 }), w: 0.18, h: 0.2 },
      { at: head.local({ forward: 0.03, up: 0.03 }), w: 0.25, h: 0.27 },
      { at: head.local({ forward: 0.16, up: 0.0 }), w: 0.19, h: 0.19 },
      { at: head.local({ forward: 0.24, up: -0.03 }), w: 0.13, h: 0.13 },
    ],
    { bone: head, sides: 7, smooth: false, color: TAWNY },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.042, 6, 4), EYE, {
      bone: head,
      at: head.local({ forward: 0.04, up: 0.04, left: s * 0.11 }),
    });
    b.part(new THREE.SphereGeometry(0.022, 5, 4), PUPIL, {
      bone: head,
      at: head.local({ forward: 0.06, up: 0.04, left: s * 0.14 }),
    });
    plume(b, head.local({ forward: -0.01, up: 0.09, left: s * 0.09 }), V(0, 0, 1), X, 0.14, 0.055, 0.035, BROW, head);
    // Cheek plume sweeping back from below the eye.
    plume(b, head.local({ forward: -0.04, up: -0.02, left: s * 0.11 }), V(0, -0.3, -1), X, 0.16, 0.08, 0.018, CREAM, head);
  }
  for (const [k, lat] of [
    [0, -0.04],
    [1, 0],
    [2, 0.04],
  ] as const) {
    plume(
      b,
      head.local({ forward: -0.08 + k * 0.04, up: 0.12, left: lat }),
      V(0, 0.55, -0.85),
      X,
      0.2,
      0.06,
      0.014,
      k === 1 ? GOLD : CREAM,
      head,
    );
  }
  b.sweep(
    catmull([
      head.local({ forward: 0.15, up: 0.05 }),
      head.local({ forward: 0.24, up: 0.04 }),
      head.local({ forward: 0.33, up: 0.0 }),
      head.local({ forward: 0.36, up: -0.09 }),
    ]),
    [0.065, 0.015],
    { bone: head, sides: 6, smooth: false, bands: [[0.25, CERE], [1, BEAK]], caps: { end: "point" } },
  );
  b.sweep(
    catmull([
      head.local({ forward: 0.15, up: -0.05 }),
      head.local({ forward: 0.24, up: -0.08 }),
      head.local({ forward: 0.3, up: -0.1 }),
    ]),
    [0.045, 0.012],
    { bone: jaw, sides: 6, smooth: false, color: BEAK, caps: { end: "point" } },
  );

  // Ruff: a row of cream feathers laid down the chest, under the neck.
  for (let k = 0; k < 7; k++) {
    const row = k % 2;
    const x = (k - 3) * 0.075;
    plume(
      b,
      V(x, 1.42 - row * 0.12, 0.66 + row * 0.02),
      V(0, -1, 0.1),
      V(0, 0, 1),
      0.24 - row * 0.04,
      0.1,
      0.014,
      row ? GOLD : CREAM,
      spine.joints[2],
    );
  }

  // Mane along the crest of the neck: two layers of flowing locks, gold beads between them.
  const crest = neckTube.line(0);
  b.along(crest, 18, (at) => plume(b, at, V(0, 0.4, -0.9), X, 0.3, 0.12, 0.02, MANE));
  b.along(crest, 12, (at) => plume(b, at, V(0, 0.45, -0.9), X, 0.24, 0.08, 0.022, MANE_HI));
  b.along(crest, 7, (at) => b.part(new THREE.SphereGeometry(0.022, 5, 4), STUD, { at }));

  // Leather harness: a girth on the barrel and a breast strap, both gold-studded.
  const bodySurf = b.surface(body);
  const girth = bodySurf.loop(spine.joints[1], { lift: 0.02 });
  b.sweep(girth, 0.017, { sides: 6, smooth: false, color: LEATHER });
  b.along(girth, 10, (at) => b.part(new THREE.SphereGeometry(0.022, 5, 4), STUD, { at }));
  // A fringe of short feathers hangs from the girth, standing out from the barrel.
  b.along(girth, 16, (at) => {
    const p = at.at;
    plume(b, p, V(0, -1, 0), V(p.x, 0, p.z + 0.05), 0.14, 0.08, 0.014, CREAM);
  });
  const breast = bodySurf.loop(spine.joints[2], { lift: 0.02 });
  b.sweep(breast, 0.016, { sides: 6, smooth: false, color: LEATHER });
  b.along(breast, 8, (at) => b.part(new THREE.SphereGeometry(0.02, 5, 4), STUD, { at }));

  // ---------------------------------------------------------------- tail
  const tail = b.chain("tail", catmull([[0, 1.5, -0.98], [0, 1.36, -1.2], [0, 1.02, -1.3], [0, 0.62, -1.32]]), {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail",
  });
  b.sweep(tail, [0.07, 0.05, 0.035, 0.015], { sides: 5, smooth: false, color: MANE });
  b.part(new THREE.TorusGeometry(0.075, 0.016, 4, 8), STUD, {
    bone: tail.joints[0],
    at: [0, 1.5, -0.98],
    dir: [0, -0.3, -1],
    axis: "z",
  });
  for (let i = 0; i < 10; i++) {
    const p = tail.at(0.04 + i * 0.1);
    for (const lat of [-0.09, -0.03, 0.03, 0.09]) {
      plume(
        b,
        p.at.clone().add(V(lat, 0, 0)),
        p.tangent.clone().add(V(0, 0, -0.15)),
        X,
        0.36,
        0.12,
        0.014,
        i % 3 === 1 ? MANE_HI : MANE,
        p.bone,
      );
    }
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Horse hindleg: haunch, stifle, hock, hoof.
    const hind = b.chain(
      `hind${L}`,
      catmull([[s * 0.24, 1.22, -0.55], [s * 0.22, 0.84, -0.42], [s * 0.19, 0.44, -0.8], [s * 0.19, 0.11, -0.78]]),
      { parent: hips, names: [`hip${L}`, `stifle${L}`, `hock${L}`, `hoof${L}`], role: "leg" },
    );
    const hoof = tipOf(hind);
    b.sweep(hind, [0.2, 0.12, 0.06, 0.04], {
      sides: 6,
      smooth: false,
      bands: [
        [0.8, COAT],
        [1, COAT_DARK],
      ],
    });
    b.part(new THREE.CylinderGeometry(0.068, 0.082, 0.1, 6), HOOF, { bone: hoof, at: [s * 0.19, 0.05, -0.78] });
    for (const dx of [-0.05, 0.05]) {
      plume(b, V(s * 0.19 + dx, 0.12, -0.8), V(0, -1, -0.12), X, 0.11, 0.09, 0.014, CREAM, hoof);
    }

    // Eagle foreleg: feathered thigh, scaled tarsus, three forward toes and a hallux, black talons.
    const fore = b.chain(
      `fore${L}`,
      catmull([[s * 0.2, 1.36, 0.55], [s * 0.22, 0.8, 0.78], [s * 0.2, 0.3, 0.7], [s * 0.2, 0.06, 0.8]]),
      { parent: spine.joints[2], names: [`shoulder${L}`, `knee${L}`, `ankle${L}`, `foot${L}`], role: "arm" },
    );
    const foot = tipOf(fore);
    b.sweep(fore, [0.13, 0.09, 0.05, 0.04], {
      sides: 6,
      smooth: false,
      bands: [
        [0.36, GOLD],
        [1, SCALE],
      ],
    });
    // Feathered trousers hang down the outside of the thigh.
    for (let i = 0; i < 5; i++) {
      const p = fore.at(0.04 + i * 0.075);
      plume(
        b,
        p.at.clone().add(V(s * 0.09, 0, 0)),
        V(0, -1, 0.3),
        X,
        0.26 - i * 0.02,
        0.1,
        0.016,
        i % 2 ? CREAM : GOLD_DEEP,
        p.bone,
      );
    }
    // Gold anklet at the ankle.
    b.part(new THREE.TorusGeometry(0.065, 0.014, 4, 8), STUD, {
      bone: fore.joints[2],
      at: [s * 0.2, 0.3, 0.7],
      dir: [0, 1, 0],
      axis: "z",
    });
    for (const [k, dx] of [
      ["a", -0.035],
      ["b", 0],
      ["c", 0.035],
    ] as const) {
      const x = s * 0.2 + dx;
      const toe = b.chain(
        `toe${L}${k}`,
        polyline([
          [x, 0.06, 0.8],
          [x, 0.03, 0.9],
          [x, 0.02, 0.97],
        ]),
        { parent: foot, names: [`toe${L}${k}1`, `toe${L}${k}2`], role: "digit" },
      );
      b.sweep(toe, [0.024, 0.011], { sides: 5, smooth: false, color: SCALE });
      b.spike(V(x, 0.02, 0.97), [0, -0.5, 1], 0.06, 0.013, { color: TALON, sides: 5, bone: toe });
    }
    const hx = s * 0.2;
    const hallux = b.chain(
      `hallux${L}`,
      polyline([
        [hx, 0.05, 0.78],
        [hx, 0.03, 0.72],
        [hx, 0.02, 0.67],
      ]),
      { parent: foot, names: [`hallux${L}1`, `hallux${L}2`], role: "digit" },
    );
    b.sweep(hallux, [0.02, 0.01], { sides: 5, smooth: false, color: SCALE });
    b.spike(V(hx, 0.02, 0.67), [0, -0.4, -1], 0.05, 0.012, { color: TALON, sides: 5, bone: hallux });
  }

  // ---------------------------------------------------------------- wings
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const W0 = V(s * 0.2, 1.56, 0.42);
    const W1 = V(s * 0.74, 1.68, 0.28);
    const W2 = V(s * 1.32, 1.76, 0.0);
    const W3 = V(s * 2.1, 1.6, -0.52);
    const wing = b.chain(
      `wing${L}`,
      catmull([
        [W0.x, W0.y, W0.z],
        [W1.x, W1.y, W1.z],
        [W2.x, W2.y, W2.z],
        [W3.x, W3.y, W3.z],
      ]),
      {
        parent: spine.joints[2],
        names: [`wingShoulder${L}`, `wingElbow${L}`, `wingWrist${L}`, `wingTip${L}`],
        role: "wing",
      },
    );
    b.sweep(wing, [0.07, 0.055, 0.04, 0.025], { sides: 6, smooth: false, color: GOLD_DEEP });
    b.part(new THREE.TorusGeometry(0.085, 0.016, 4, 8), STUD, {
      bone: wing.joints[1],
      at: W1,
      dir: W2.clone().sub(W1),
      axis: "z",
    });
    b.part(new THREE.TorusGeometry(0.075, 0.016, 4, 8), STUD, {
      bone: wing.joints[2],
      at: W2,
      dir: W3.clone().sub(W2),
      axis: "z",
    });

    // Primaries fan off the hand, each with a navy tip laid over it.
    for (let i = 0; i < 9; i++) {
      const root = W2.clone().lerp(W3, 0.05 + i * 0.1);
      const dir = V(s * 0.7, 0.05, -(0.5 + 0.035 * i));
      const len = 0.52 + 0.02 * i;
      const bone = wing.nearestJoint(root);
      plume(b, root, dir, UP, len, 0.15, 0.022, BLUE, bone);
      const tipRoot = root.clone().addScaledVector(dir.clone().normalize(), len - 0.2).add(V(0, 0.012, 0));
      plume(b, tipRoot, dir, UP, 0.2, 0.15, 0.022, NAVY, bone);
    }
    // Secondaries hang behind the forearm, alternating teal and blue, and fill out toward the body.
    for (let i = 0; i < 9; i++) {
      const root = W1.clone().lerp(W2, 0.08 + i * 0.105).add(V(0, -0.06, 0));
      plume(b, root, V(s * 0.2, -0.1, -1), UP, 0.52, 0.18, 0.02, i % 2 ? TEAL : BLUE, wing.nearestJoint(root));
    }
    // Tertials cover the inner arm, back toward the body.
    for (let i = 0; i < 6; i++) {
      const root = W0.clone().lerp(W1, 0.15 + i * 0.14).add(V(0, -0.06, 0));
      plume(b, root, V(s * 0.1, -0.1, -1), UP, 0.42, 0.2, 0.02, i % 2 ? GOLD_DEEP : TEAL, wing.nearestJoint(root));
    }
    // Coverts lie over the arm in three rows, cream and gold.
    for (let i = 0; i < 9; i++) {
      const root = W0.clone().lerp(W1, (i + 0.5) / 9).add(V(0, 0.03, 0));
      plume(b, root, V(s * 0.9, 0.1, -0.35), UP, 0.28, 0.16, 0.014, i % 2 ? CREAM : GOLD, wing.nearestJoint(root));
    }
    for (let i = 0; i < 7; i++) {
      const root = W1.clone().lerp(W2, (i + 0.5) / 7).add(V(0, 0.03, 0));
      plume(b, root, V(s * 0.9, 0.1, -0.4), UP, 0.26, 0.16, 0.014, i % 2 ? GOLD : CREAM, wing.nearestJoint(root));
    }
    for (let i = 0; i < 6; i++) {
      const root = W2.clone().lerp(W3, (i + 0.5) / 6).add(V(0, 0.03, 0));
      plume(b, root, V(s * 0.9, 0.05, -0.4), UP, 0.22, 0.13, 0.014, CREAM, wing.nearestJoint(root));
    }
  }

  return b.root;
}
