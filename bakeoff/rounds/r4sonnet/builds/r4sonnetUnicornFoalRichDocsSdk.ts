import * as THREE from "three";
import type { OutlinePoint } from "../../../../src/index";
import {
  bezier,
  catmull,
  countershade,
  createBuilder,
  frame,
  gradient,
  mottle,
  polyline,
  spots,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Unicorn Foal",
  description:
    "A newborn unicorn foal on wobbly long legs: pearly lilac-shimmer coat, pastel pink/mint/lavender fluffy mane and tail, small golden spiral horn, big dark lashed eyes, silver hooves and a daisy chain around its neck.",
};

// ---------------------------------------------------------------- palette
const PINK = "#ffb7d5";
const PINK_D = "#f98fba";
const MINT = "#aaf0d4";
const MINT_D = "#7fdcb8";
const LAV = "#cdb8fa";
const LAV_D = "#a78ceb";

const GOLD_L = "#fff0a8";
const GOLD_D = "#e3a52a";
const GOLD_M = "#ffd35c";

const HOOF = "#d2d9ea";
const FLUFF = "#f3ebff";
const SOCK = "#ddcff7";

const EYE = "#1b1328";
const IRIS = "#46306b";
const PUPIL = "#09060e";
const WHITE = "#ffffff";
const LASH = "#241632";

const EAR_IN = "#ffc4da";
const BLUSH = "#ffb0cf";
const NOSE = "#cf7a9c";
const MUZZLE = "#ffc9de";

const YELLOW = "#ffd84a";
const ORANGE = "#ffb62e";
const PETAL2 = "#fff4fb";
const STEM = "#6cc07c";

// ---------------------------------------------------------------- helpers
const O = new THREE.Vector3(0, 1.2, 0.5); // poll (head joint)
const HEAD_F = new THREE.Vector3(0, -0.55, 0.83).normalize(); // along the face
const HEAD_U = new THREE.Vector3(0, 0.83, 0.55).normalize(); // up from the face

/** point in the head's frame: x sideways (left +), up off the face axis, along the face */
const H = (x: number, up: number, along: number): THREE.Vector3 =>
  new THREE.Vector3(x, 0, 0).addScaledVector(HEAD_F, along).addScaledVector(HEAD_U, up).add(O);

const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 31.7) * 43758.5453;
  return x - Math.floor(x);
};

const mixN = (a: number, b: number, t: number): number => a + (b - a) * t;

/** radius profile along a polyline limb; keys are [pointIndex + fraction, radius] */
function legProfile(pts: number[][], keys: [number, number][]): (t: number) => number {
  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(
      cum[i - 1] +
        Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]),
    );
  }
  const total = cum[cum.length - 1];
  const keyAt = (t: number): number => {
    const d = Math.min(Math.max(t, 0), 1) * total;
    for (let i = 1; i < cum.length; i++) {
      if (d <= cum[i] || i === cum.length - 1) return i - 1 + (d - cum[i - 1]) / (cum[i] - cum[i - 1]);
    }
    return 0;
  };
  return (t: number): number => {
    const k = keyAt(t);
    for (let i = 1; i < keys.length; i++) {
      if (k <= keys[i][0]) {
        const [k0, r0] = keys[i - 1];
        const [k1, r1] = keys[i];
        const u = (k - k0) / (k1 - k0);
        return r0 + (r1 - r0) * u;
      }
    }
    return keys[keys.length - 1][1];
  };
}

const EAR: OutlinePoint[] = [
  [-0.034, 0],
  [0.034, 0],
  [0.036, 0.045],
  [0.018, 0.1],
  [0, 0.13, "sharp"],
  [-0.018, 0.1],
  [-0.036, 0.045],
];
const EAR_INNER: OutlinePoint[] = [
  [-0.02, 0.01],
  [0.02, 0.01],
  [0.022, 0.045],
  [0.01, 0.09],
  [0, 0.108, "sharp"],
  [-0.01, 0.09],
  [-0.022, 0.045],
];
const HOOF_PROFILE: OutlinePoint[] = [
  [0, 0],
  [0.04, 0],
  [0.044, 0.014],
  [0.036, 0.068],
  [0, 0.075],
];

export default function build() {
  const b = createBuilder({ name: "unicornFoal" });

  // ================================================================ skeleton
  const hips = b.joint("hips", { at: [0, 0.8, -0.3], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.8, -0.3],
      [0, 0.82, -0.08],
      [0, 0.84, 0.14],
      [0, 0.86, 0.34],
    ]),
    { parent: hips, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.9, 0.26],
      [0, 1.0, 0.35],
      [0, 1.1, 0.43],
      [O.x, O.y, O.z],
    ]),
    { parent: spine.joints[2], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: O,
    dir: HEAD_F,
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: H(0, -0.05, 0.05),
    aim: H(0, -0.09, 0.33),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.84, -0.38],
      [0, 0.85, -0.5],
      [0, 0.79, -0.6],
      [0, 0.66, -0.65],
    ]),
    { parent: hips, role: "tail" },
  );

  // ================================================================ coat paints
  const shimmer = mottle("#fffafd", "#e6dafb", { size: 0.2, contrast: 0.6, seed: 4 });
  const fleck = spots(shimmer, ["#ffe3f2", "#dcf7ec", "#e3dbff"], { size: 0.045, amount: 0.12, seed: 11 });
  const coat = countershade(fleck, "#e4d8f7", { level: -0.4 });
  const legCoat = gradient(coat, SOCK, [0, 0.42, 0], [0, 0.12, 0]);
  const faceCoat = gradient(coat, MUZZLE, H(0, -0.03, 0.2), H(0, -0.03, 0.34));
  const chinCoat = gradient(coat, "#ffc2da", H(0, -0.09, 0.22), H(0, -0.09, 0.34));

  // ================================================================ body, neck, tail dock
  const body = b.loft(
    [
      { at: [0, 0.82, -0.43], w: 0.19, h: 0.25 },
      { at: [0, 0.83, -0.34], w: 0.28, h: 0.36 },
      { at: [0, 0.8, -0.14], w: 0.3, h: 0.4 },
      { at: [0, 0.79, 0.08], w: 0.31, h: 0.42 },
      { at: [0, 0.8, 0.26], w: 0.3, h: 0.42 },
      { at: [0, 0.83, 0.38], w: 0.22, h: 0.34 },
    ],
    { color: coat, bone: [hips, spine], sides: 10 },
  );

  const neckTube = b.sweep(
    neck,
    (t: number): [number, number] => [mixN(0.105, 0.064, t), mixN(0.12, 0.072, t)],
    { color: coat, sides: 8 },
  );

  b.sweep(tail, [0.045, 0.03], { color: coat, sides: 7 });

  // ================================================================ legs
  const frontKeys: [number, number][] = [
    [0, 0.062],
    [1, 0.05],
    [1.55, 0.037],
    [1.85, 0.033],
    [2, 0.043],
    [2.2, 0.031],
    [2.75, 0.025],
    [3, 0.032],
    [3.4, 0.027],
    [4, 0.027],
  ];
  const hindKeys: [number, number][] = [
    [0, 0.088],
    [0.7, 0.078],
    [1, 0.062],
    [1.55, 0.046],
    [1.85, 0.036],
    [2, 0.042],
    [2.2, 0.03],
    [2.75, 0.025],
    [3, 0.032],
    [3.4, 0.027],
    [4, 0.027],
  ];

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.1;

    const legs = [
      {
        name: `legF${S}`,
        parent: spine.joints[2],
        pts: [
          [x, 0.7, 0.19],
          [x * 1.05, 0.58, 0.16],
          [x * 1.1, 0.335, 0.21],
          [x * 1.1, 0.135, 0.21],
          [x * 1.1, 0.075, 0.236],
        ],
        names: [`shoulder${S}`, `elbow${S}`, `knee${S}`, `fetlockF${S}`, `hoofF${S}`],
        keys: frontKeys,
      },
      {
        name: `legH${S}`,
        parent: hips,
        pts: [
          [x, 0.78, -0.3],
          [x * 1.1, 0.58, -0.2],
          [x * 1.1, 0.355, -0.355],
          [x * 1.1, 0.135, -0.31],
          [x * 1.1, 0.075, -0.285],
        ],
        names: [`hip${S}`, `stifle${S}`, `hock${S}`, `fetlockH${S}`, `hoofH${S}`],
        keys: hindKeys,
      },
    ];

    for (const L of legs) {
      const end = L.pts[L.pts.length - 1];
      const leg = b.chain(L.name, L.pts, {
        parent: L.parent,
        names: L.names,
        role: "leg",
        contact: [end[0], 0, end[2]],
      });
      b.sweep(leg, legProfile(L.pts, L.keys), { color: legCoat, sides: 7 });

      const tip = leg.joints[leg.joints.length - 1];
      // silver hoof
      b.lathe(HOOF_PROFILE, {
        at: [end[0], -0.001, end[2]],
        segments: 8,
        color: HOOF,
        bone: tip,
      });
      // soft lilac feathering over the coronet
      b.ring(tip, { count: 8, radius: 0.03, tilt: 45 }, (item) => {
        b.spike(item, item, 0.04, 0.011, { color: FLUFF });
      });
    }
  }

  // ================================================================ head
  const skull = b.loft(
    [
      { at: H(0, 0.0, -0.02), w: 0.15, h: 0.17 },
      { at: H(0, -0.005, 0.07), w: 0.165, h: 0.185 },
      { at: H(0, -0.02, 0.18), w: 0.12, h: 0.13 },
      { at: H(0, -0.035, 0.27), w: 0.095, h: 0.1 },
      { at: H(0, -0.04, 0.32), w: 0.09, h: 0.092 },
    ],
    { color: faceCoat, bone: head, sides: 8 },
  );

  b.loft(
    [
      { at: H(0, -0.075, 0.05), w: 0.12, h: 0.085 },
      { at: H(0, -0.09, 0.16), w: 0.1, h: 0.07 },
      { at: H(0, -0.095, 0.27), w: 0.08, h: 0.06 },
      { at: H(0, -0.09, 0.325), w: 0.074, h: 0.055 },
    ],
    { color: chinCoat, bone: jaw, sides: 8 },
  );

  const skullSurf = b.surface(skull);

  // ---- ears
  const AX = new THREE.Vector3(1, 0, 0);
  const AZ = new THREE.Vector3(0, 0, 1);
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const earBase = H(s * 0.052, 0.058, 0.015);
    const ex = new THREE.Vector3(1, 0, 0).applyAxisAngle(AZ, -s * 0.35).applyAxisAngle(AX, -0.3);
    const ey = new THREE.Vector3(0, 1, 0).applyAxisAngle(AZ, -s * 0.35).applyAxisAngle(AX, -0.3);
    const thick = new THREE.Vector3().crossVectors(ex, ey).normalize();

    const ear = b.joint(`ear${S}`, { parent: head, at: earBase, dir: ey, role: "hinge" });
    b.extrude(EAR, {
      at: earBase,
      x: ex,
      y: ey,
      thickness: [0.018, 0.007],
      bevel: 0.004,
      smoothing: 1,
      color: coat,
      bone: ear,
    });
    b.extrude(EAR_INNER, {
      at: earBase.clone().addScaledVector(thick, 0.006),
      x: ex,
      y: ey,
      thickness: [0.01, 0.004],
      bevel: 0.002,
      smoothing: 1,
      color: EAR_IN,
      bone: ear,
    });
  }

  // ---- eyes with lashes
  for (const s of [1, -1]) {
    const gaze = new THREE.Vector3(s * 0.88, 0.12, 0.42).normalize();
    const C = H(s * 0.063, 0.014, 0.105);

    const eye = b.part(new THREE.SphereGeometry(0.042, 10, 8), EYE, { at: C, dir: gaze, bone: head });
    const irisC = C.clone().addScaledVector(gaze, 0.006);
    b.part(new THREE.SphereGeometry(0.038, 9, 7), IRIS, { at: irisC, dir: gaze, bone: head });
    b.part(new THREE.SphereGeometry(0.026, 8, 6), PUPIL, {
      at: C.clone().addScaledVector(gaze, 0.021),
      dir: gaze,
      bone: head,
    });

    const upV = new THREE.Vector3(0, 1, 0).addScaledVector(gaze, -gaze.y).normalize();
    const fwdV = HEAD_F.clone().addScaledVector(gaze, -HEAD_F.dot(gaze)).normalize();
    const h1 = gaze
      .clone()
      .multiplyScalar(0.78)
      .addScaledVector(upV, 0.5)
      .addScaledVector(fwdV, 0.37)
      .normalize();
    const h2 = gaze
      .clone()
      .multiplyScalar(0.75)
      .addScaledVector(upV, -0.45)
      .addScaledVector(fwdV, -0.4)
      .normalize();
    b.part(new THREE.SphereGeometry(0.0085, 6, 4), WHITE, {
      at: irisC.clone().addScaledVector(h1, 0.038),
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.0048, 5, 4), WHITE, {
      at: irisC.clone().addScaledVector(h2, 0.037),
      bone: head,
    });

    // long curling lashes over the upper lid
    b.ring(
      eye.moved([0, 0.026, 0]),
      { count: 7, radius: 0.031, fromDeg: -80, toDeg: 80, tilt: 30 },
      (lash) => {
        b.sweep(
          bezier(lash, lash.local([0, 0.028, 0.002]), lash.local([0, 0.056, 0.024])),
          [0.006, 0.001],
          { color: LASH, sides: 5, caps: { end: "point" } },
        );
      },
    );

    // rosy cheek
    const cheek = skullSurf.nearest(H(s * 0.075, -0.045, 0.13));
    b.stick(new THREE.CylinderGeometry(0.021, 0.021, 0.006, 8), BLUSH, cheek, { embed: 0.4, flat: true });

    // nostril
    const nostril = skullSurf.nearest(H(s * 0.026, -0.038, 0.36));
    b.stick(new THREE.SphereGeometry(0.011, 6, 4).scale(1, 0.5, 1.5), NOSE, nostril, { embed: 0.4 });
  }

  // ================================================================ golden spiral horn
  const hornDir = new THREE.Vector3(0, 0.92, 0.38).normalize();
  const hornBase = H(0, 0.07, 0.13);
  const hornTip = hornBase.clone().addScaledVector(hornDir, 0.21);
  const hornPaint = gradient(GOLD_D, GOLD_L, hornBase, hornTip);
  b.sweep(polyline([hornBase.clone().addScaledVector(hornDir, -0.02), hornTip]), [0.032, 0], {
    section: { ngon: 4 },
    twist: 600,
    caps: { start: "flat", end: "point" },
    color: hornPaint,
    bone: head,
  });
  b.part(new THREE.CylinderGeometry(0.037, 0.043, 0.022, 8), GOLD_M, {
    at: hornBase.clone().addScaledVector(hornDir, 0.002),
    dir: hornDir,
    bone: head,
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.03, 0.037, 0.012, 8), GOLD_D, {
    at: hornBase.clone().addScaledVector(hornDir, 0.02),
    dir: hornDir,
    bone: head,
    flat: true,
  });

  // little magic sparkles around the horn tip
  const spark = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 2 L38 26 L62 32 L38 38 L32 62 L26 38 L2 32 L26 26 Z" fill="#ffd45e"/><path d="M32 18 L35 29 L46 32 L35 35 L32 46 L29 35 L18 32 L29 29 Z" fill="#fff6c9"/></svg>`,
    { size: 96 },
  );
  const sparkAt = (dx: number, dy: number, dz: number) =>
    frame(hornTip.clone().add(new THREE.Vector3(dx, dy, dz)), [0, 1, 0]);
  b.cards([sparkAt(0.09, -0.05, 0.03), sparkAt(-0.08, -0.08, 0.05), sparkAt(0.0, 0.03, 0.07)], spark, {
    size: 0.06,
    cross: true,
    flow: [0, 0, 1],
    bone: head,
  });
  b.cards([sparkAt(-0.05, 0.02, -0.03), sparkAt(0.06, -0.13, 0.06)], spark, {
    size: 0.04,
    cross: true,
    flow: [0, 0, 1],
    bone: head,
  });

  // ================================================================ mane
  const MANE = [PINK, MINT, LAV];
  const MANE_D = [PINK_D, MINT_D, LAV_D];
  let mi = 0;
  b.along(neckTube, 11, (at) => {
    const i = mi++;
    const r = 0.034 + 0.014 * hash(i + 1);
    b.stick(new THREE.IcosahedronGeometry(r, 1), MANE[i % 3], at, { embed: 0.3, flat: true });
    const sgn = i % 2 === 0 ? 1 : -1;
    b.sweep(
      bezier(
        at,
        at.local({ up: 0.05, left: sgn * 0.025, back: 0.01 }),
        at.local({ up: 0.07, left: sgn * 0.075, back: 0.04 }),
      ),
      [0.022, 0.003],
      { color: MANE_D[(i + 1) % 3], sides: 5, caps: { end: "point" } },
    );
  });

  // forelock: puffs between the ears and a swept fringe either side of the horn
  const fore = [
    { x: 0, u: 0.09, f: 0.03, c: PINK },
    { x: 0.035, u: 0.088, f: 0.05, c: MINT },
    { x: -0.035, u: 0.088, f: 0.05, c: LAV },
  ];
  for (const p of fore) {
    b.part(new THREE.IcosahedronGeometry(0.03, 1), p.c, { at: H(p.x, p.u, p.f), bone: head, flat: true });
  }
  for (const s of [1, -1]) {
    b.sweep(
      bezier(H(s * 0.04, 0.085, 0.04), H(s * 0.06, 0.125, 0.1), H(s * 0.075, 0.09, 0.165)),
      [0.02, 0.003],
      { color: s > 0 ? MINT_D : PINK_D, sides: 5, caps: { end: "point" }, bone: head },
    );
  }

  // ================================================================ tail fluff
  const TAIL_COLS = [PINK, MINT, LAV, PINK_D, MINT_D, LAV_D];
  [0.05, 0.3, 0.55, 0.8, 1.0].forEach((t, i) => {
    b.part(new THREE.IcosahedronGeometry(0.05 - 0.004 * i, 1), TAIL_COLS[i % 3], {
      at: tail.at(t),
      flat: true,
    });
  });
  for (let k = 0; k < 10; k++) {
    const start = tail.at(0.1 + 0.09 * k);
    const dx = ((k % 5) - 2) * 0.022;
    const len = 0.27 + 0.1 * hash(k + 20);
    b.sweep(
      bezier(
        start,
        start.local({ back: 0.05, down: 0.04, left: dx * 0.5 }),
        start.local({ back: 0.085, down: len * 0.65, left: dx }),
        start.local({ back: 0.06, down: len, left: dx * 1.4 }),
      ),
      [0.03, 0.003],
      { color: TAIL_COLS[k % 6], sides: 5, caps: { start: "flat", end: "point" } },
    );
  }

  // ================================================================ daisy chain
  const neckSurf = b.surface(neckTube);
  const garland = neckSurf.loop(neck.at(0.3), { lift: 0.01 });
  b.sweep(garland, 0.007, { color: STEM, sides: 5 });

  const petalGeo = (len: number) =>
    new THREE.SphereGeometry(0.009, 6, 4).scale(0.55, len / 0.009 / 2, 0.3).translate(0, len / 2, 0);
  const petalBig = petalGeo(0.036);
  const petalSmall = petalGeo(0.03);
  const centerBig = new THREE.SphereGeometry(0.013, 6, 4).scale(1, 0.6, 1);
  const centerSmall = new THREE.SphereGeometry(0.011, 6, 4).scale(1, 0.6, 1);

  const DAISY_N = 9;
  for (let i = 0; i < DAISY_N; i++) {
    const t = 0.08 + 0.84 * (i / (DAISY_N - 1));
    const hit = neckSurf.nearest(garland.at(t));
    const big = i % 2 === 0;
    const d = hit.moved([0, big ? 0.017 : 0.022, 0]);
    b.stick(big ? centerBig : centerSmall, i % 3 === 1 ? ORANGE : YELLOW, d, { embed: 0.1, flat: true });
    b.ring(d, { count: 8, radius: 0.006, tilt: 8 }, (pt) => {
      b.part(big ? petalBig : petalSmall, big ? WHITE : PETAL2, { at: pt, dir: pt, up: d, flat: true });
    });
  }

  // ================================================================ cutie mark on both flanks
  const star = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 2 L39 25 L62 32 L39 39 L32 62 L25 39 L2 32 L25 25 Z" fill="#a98bea"/><path d="M32 16 L35 29 L48 32 L35 35 L32 48 L29 35 L16 32 L29 29 Z" fill="#f2e9ff"/><circle cx="51" cy="13" r="4" fill="#ffb3d1"/><circle cx="13" cy="51" r="3.5" fill="#a8ecd0"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    b.decal(body, star, {
      at: [s * 0.15, 0.74, -0.06],
      dir: [s, 0, 0],
      size: [0.12, 0.12],
    });
  }

  return b.root;
}
