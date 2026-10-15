import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { mottle, noise, paint, patches, spots } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded red panda standing on a moss-covered boulder, wearing a teal bandana with gold trim and a little bell, ringed bushy tail, big anime eyes and drifting dendro motes.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const RUST_A = "#dc561d";
const RUST_B = "#bf3c16";
const DARK = "#3a1c17";
const CREAM = "#fff1d9";
const TAN = "#ecb77f";
const GOLD = "#eebb45";
const TEAL = "#2fc4b8";
const CLAW = "#f6e6c6";

const MOSS_TUFT = svg(
  `<svg viewBox="0 0 40 32">
  <path d="M20 32 C15 22 9 14 4 3 C13 10 19 18 22 32Z" fill="#5f9f27"/>
  <path d="M22 32 C22 20 26 12 32 2 C31 14 29 22 26 32Z" fill="#7cbc2f"/>
  <path d="M18 32 C17 22 17 14 19 2 C23 14 23 22 24 32Z" fill="#94d03a"/>
  <path d="M26 32 C28 24 33 18 39 12 C35 22 32 28 30 32Z" fill="#4f8c20"/>
  <path d="M14 32 C10 26 6 22 0 20 C7 24 11 28 18 32Z" fill="#6aaa2a"/>
  </svg>`,
  { size: 96 },
);

const FUR_TUFT = svg(
  `<svg viewBox="0 0 16 32">
  <path d="M8 0 C13 10 15 24 8 32 C1 24 3 10 8 0Z" fill="#ffffff"/>
  <path d="M8 6 C9 14 9 22 8 29" stroke="#d6d6d6" stroke-width="1.6" fill="none"/>
  </svg>`,
  { size: 64 },
);

// Half width of the bandana flap at drawing height y (0 at the hem line, down to the point at -0.07).
const flapHalf = (y: number) => (y > -0.02 ? 0.045 + (y / -0.02) * -0.015 : 0.03 * (1 - (-y - 0.02) / 0.05));

export default function build() {
  const b = createBuilder({ name: "redPanda" });

  // ---------------------------------------------------------------- palette / paints
  const furRust = mottle(RUST_A, RUST_B, { size: 0.07, seed: 1 });
  const furDark = mottle("#3d1f19", "#52291f", { size: 0.05, seed: 3 });
  const COAT = cel(furEdge(furRust, furDark, { level: -0.15, teeth: 0.3, period: 0.03 }));
  const NECKP = cel(furEdge(furRust, CREAM, { level: -0.2, teeth: 0.35, period: 0.025 }));
  const LEGP = cel(furDark);

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.385, -0.17] });
  const spinePts = [
    [0, 0.385, -0.17],
    [0, 0.395, -0.06],
    [0, 0.4, 0.06],
    [0, 0.395, 0.16],
    [0, 0.385, 0.22],
  ];
  const spine = b.chain("spine", catmull(spinePts), {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spine4"],
    role: "spine",
  });
  const neckPts = [
    [0, 0.385, 0.22],
    [0, 0.43, 0.27],
    [0, 0.465, 0.31],
  ];
  const neck = b.chain("neck", catmull(neckPts), {
    parent: spine.joints[3],
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: neckPts[2], dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.045, down: 0.03 }),
    aim: head.local({ forward: 0.1, down: 0.035 }),
    role: "jaw",
  });

  const tailPts = [
    [0, 0.37, -0.16],
    [0, 0.4, -0.3],
    [0, 0.46, -0.44],
    [0, 0.54, -0.54],
    [0, 0.64, -0.58],
  ];
  const tail = b.chain("tail", catmull(tailPts), { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" });

  // ---------------------------------------------------------------- stone
  const ROCK = patches("#5d6169", ["#8c9096", "#7d8189", "#999da2"], { size: 0.08, gap: 0.06, seed: 4 });
  const MOSS = mottle("#5f9a1f", "#9bc93a", { size: 0.04, seed: 2 });
  const STONEP = cel(
    paint((p, n) => {
      const m = n.y * 0.8 + (noise(p, 0.07, 3) - 0.5) * 1.1;
      return m > 0.35 ? MOSS : ROCK;
    }),
  );
  const ico = () => new THREE.IcosahedronGeometry(1, 1);
  const lumps: Array<[number[], number[], number]> = [
    [[0, 0.095, 0], [0.37, 0.095, 0.34], 12],
    [[0, 0.125, 0], [0.31, 0.085, 0.29], -20],
    [[-0.26, 0.08, 0.1], [0.12, 0.08, 0.1], 30],
    [[0.25, 0.075, -0.1], [0.12, 0.075, 0.11], 50],
    [[0.05, 0.07, 0.3], [0.13, 0.07, 0.1], 10],
    [[-0.1, 0.07, -0.3], [0.14, 0.07, 0.1], 70],
    [[0.28, 0.06, 0.15], [0.09, 0.06, 0.09], 20],
    [[-0.22, 0.06, -0.2], [0.1, 0.06, 0.09], 40],
  ];
  const stoneParts = lumps.map(([at, scale, rot]) =>
    b.part(ico(), STONEP, { bone: hips, at, scale, rotation: [0, rot, 0], flat: true, name: "stone" }),
  );
  const stoneSurf = b.surface(stoneParts);
  const mossHits = stoneSurf.scatter(110, {
    rng: rng(11),
    minDist: 0.03,
    filter: (h) => h.n.y > 0.45 && h.at.y > 0.12,
  });
  b.cards(mossHits, MOSS_TUFT, {
    size: [0.05, 0.04],
    lean: 15,
    cross: true,
    vary: 0.4,
    spin: 180,
    rng: rng(12),
    bone: hips,
    name: "moss",
  });

  // mushrooms
  const capP = cel(spots("#ef7a5a", "#fff3dc", { size: 0.012, amount: 0.55, seed: 2 }));
  for (const [x, z] of [
    [-0.2, 0.1],
    [-0.235, 0.15],
    [0.24, -0.12],
  ]) {
    const hit = stoneSurf.ray([x, 0.6, z], [0, -1, 0]);
    if (!hit) continue;
    const base = hit.at.clone();
    const top = base.clone().add(new THREE.Vector3(0, 0.026, 0));
    b.rod(base.clone().add(new THREE.Vector3(0, -0.004, 0)), top, 0.007, "#f3e3c4", { bone: hips });
    b.lathe(
      [
        [0, -0.004],
        [0.026, -0.002],
        [0.03, 0.006],
        [0.02, 0.017],
        [0, 0.022],
      ],
      { at: top, bone: hips, color: capP, smoothing: 1, segments: 8 },
    );
  }

  // ---------------------------------------------------------------- body
  const W = [0.15, 0.19, 0.2, 0.19, 0.15];
  const H = [0.15, 0.17, 0.18, 0.18, 0.15];
  const body = b.loft(
    spinePts.map((p, i) => ({ at: p, w: W[i], h: H[i] })),
    { bone: spine, color: COAT, sides: 10, name: "body" },
  );
  const neckTube = b.sweep(neck, [0.085, 0.078, 0.07], { color: NECKP, sides: 10, name: "neck" });
  const tailTube = b.sweep(tail, [0.045, 0.062, 0.072, 0.066, 0.04], {
    color: cel(
      paint((_p, _n, s) => {
        const t = s[0];
        if (t > 0.92) return "#35170f";
        if (t < 0.1) return RUST_A;
        return Math.floor(t * 9.5) % 2 === 0 ? RUST_B : TAN;
      }),
    ),
    sides: 10,
    name: "tail",
  });
  const tailPaint = cel(
    paint((p) => {
      const t = tail.path.closestT(p);
      if (t > 0.92) return "#35170f";
      if (t < 0.1) return RUST_A;
      return Math.floor(t * 9.5) % 2 === 0 ? RUST_B : TAN;
    }),
  );
  b.cards(
    b.surface(tailTube).scatter(150, { rng: rng(21), minDist: 0.024 }),
    FUR_TUFT,
    { size: [0.035, 0.06], lean: 70, bend: 20, vary: 0.3, spin: 25, rng: rng(22), color: tailPaint, name: "tailFur" },
  );
  b.cards(
    b.surface(body).scatter(220, { rng: rng(5), minDist: 0.025, filter: (h) => h.n.y > 0.1 }),
    FUR_TUFT,
    { size: [0.03, 0.055], lean: 60, bend: 30, flow: [0, -0.2, -1], vary: 0.3, spin: 20, rng: rng(6), color: COAT, name: "bodyFur" },
  );

  // ---------------------------------------------------------------- head
  const HC = head.local({ forward: 0.035 });
  const HEADP = cel(
    paint((p) => {
      const dx = Math.abs(p.x - HC.x);
      const dy = p.y - HC.y;
      const dz = p.z - HC.z;
      if (dz > 0.02 && dx > 0.024 && dx < 0.042 && dy < 0.03 && dy > -0.04) return "#8a2a14";
      if (dx > 0.042 && dz > -0.015 && dy < 0.015) return CREAM;
      if (dz > 0.035 && dy < -0.005 && dx < 0.05) return CREAM;
      if (dy > 0.018 && dy < 0.034 && dx > 0.02 && dx < 0.05 && dz > 0.03) return CREAM;
      if (dy < -0.04) return CREAM;
      return furRust;
    }),
  );
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEADP, {
    bone: head,
    at: HC,
    scale: [0.072, 0.062, 0.068],
    name: "skull",
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, {
    bone: head,
    at: head.local({ forward: 0.075, down: 0.012 }),
    scale: [0.03, 0.024, 0.034],
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), "#2a1620", {
    bone: head,
    at: head.local({ forward: 0.103, up: 0.002 }),
    scale: [0.013, 0.009, 0.01],
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), "#6a2430", {
    bone: head,
    at: head.local({ forward: 0.07, down: 0.03 }),
    scale: [0.022, 0.008, 0.03],
    name: "mouthInside",
  });
  b.part(new THREE.SphereGeometry(1, 10, 6), CREAM, {
    bone: jaw,
    at: head.local({ forward: 0.075, down: 0.04 }),
    scale: [0.026, 0.013, 0.036],
    name: "lowerJaw",
  });
  b.rod(head.local({ forward: 0.098, down: 0.005 }), head.local({ forward: 0.094, down: 0.021 }), 0.0018, INK, {
    bone: head,
  });
  for (const s of [1, -1]) {
    b.rod(
      head.local({ forward: 0.094, down: 0.021 }),
      head.local({ forward: 0.085, left: s * 0.02, down: 0.027 }),
      0.0016,
      INK,
      { bone: head },
    );
  }

  const EYE = animeEye({ iris: "#d98a1c", blush: false, brow: false });
  const skullSurf = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurf.around(HC).at(s * 34, 4);
    if (hit) b.decal(skullSurf, EYE, { at: hit, size: [0.034, 0.046], mirror: s > 0, name: "eye" });
  }

  // cheek ruff
  b.cards(
    skullSurf.scatter(40, {
      rng: rng(31),
      minDist: 0.022,
      filter: (h) => Math.abs(h.at.x) > 0.045 && h.at.z < HC.z + 0.03 && h.at.y < HC.y + 0.02,
    }),
    FUR_TUFT,
    { size: [0.025, 0.04], lean: 70, flow: [0, -0.3, -1], vary: 0.25, rng: rng(32), color: "#fff4de", name: "cheekFur" },
  );

  // ears
  const EARP = cel(
    paint((_p, n, s) => {
      if (n.z > 0.35) return s[1] < 0.035 ? "#3a1a14" : CREAM;
      return s[1] < 0.02 ? RUST_B : DARK;
    }),
  );
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const base = head.local({ up: 0.05, left: s * 0.05, back: 0.005 });
    const earJ = b.joint("ear" + side, { parent: head, at: base, dir: [s * 0.3, 1, 0.1], role: "hinge" });
    b.extrude(
      [
        [-0.04, -0.012],
        [0.04, -0.012],
        [0.062, 0.03],
        [0.045, 0.08],
        [0, 0.1],
        [-0.03, 0.06],
      ],
      {
        at: base,
        x: [s, -0.3, 0],
        y: [s * 0.3, 1, 0.15],
        thickness: 0.014,
        bevel: 0.004,
        smoothing: 1,
        color: EARP,
        bone: earJ,
        name: "ear" + side,
      },
    );
  }

  // whiskers
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++)
      b.spike(
        head.local({ forward: 0.088, left: s * 0.03, up: -0.004 * i }),
        head.local({ forward: 0.1 - i * 0.005, left: s * (0.11 + i * 0.01), up: (i - 1) * 0.022 }),
        null,
        0.0014,
        "#fff6e0",
        { bone: head, name: "whisker" },
      );

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fx = s * 0.075;

    // front
    const fpts = limb([fx, 0.36, 0.14], [fx, 0.205, 0.17], [0.085, 0.085], [[0, 0, -1]]);
    const arm = b.chain("arm" + side, fpts, {
      parent: spine.joints[3],
      names: ["shoulder" + side, "elbow" + side, "hand" + side],
      role: "arm",
    });
    b.sweep(arm, [0.052, 0.042, 0.036], { color: LEGP, sides: 8, name: "foreleg" });
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      bone: arm.joints[0],
      at: [fx, 0.37, 0.14],
      scale: [0.055, 0.07, 0.07],
      name: "shoulder",
    });
    const hand = arm.tip!;
    b.part(new THREE.SphereGeometry(1, 10, 8), LEGP, {
      bone: hand,
      at: [fx, 0.21, 0.19],
      scale: [0.034, 0.022, 0.045],
      name: "paw",
    });
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(1, 6, 5), LEGP, {
        bone: hand,
        at: [fx + k * 0.014, 0.208, 0.226],
        scale: 0.012,
        name: "toe",
      });
      b.spike([fx + k * 0.014, 0.207, 0.234], [k * 0.15, -0.1, 1], 0.017, 0.004, CLAW, { bone: hand, name: "claw" });
    }

    // hind
    const hpts = limb(
      [fx, 0.35, -0.14],
      [fx, 0.205, -0.115],
      [0.075, 0.075, 0.05],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const leg = b.chain("leg" + side, hpts, {
      parent: spine.joints[0],
      names: ["hip" + side, "knee" + side, "hock" + side, "foot" + side],
      role: "leg",
    });
    b.sweep(leg, [0.06, 0.046, 0.038, 0.034], { color: LEGP, sides: 8, name: "hindleg" });
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      bone: leg.joints[0],
      at: [fx * 1.05, 0.38, -0.15],
      scale: [0.06, 0.08, 0.09],
      name: "thigh",
    });
    const foot = leg.tip!;
    b.part(new THREE.SphereGeometry(1, 10, 8), LEGP, {
      bone: foot,
      at: [fx, 0.21, -0.09],
      scale: [0.036, 0.022, 0.06],
      name: "hindPaw",
    });
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(1, 6, 5), LEGP, {
        bone: foot,
        at: [fx + k * 0.014, 0.208, -0.036],
        scale: 0.012,
        name: "toe",
      });
      b.spike([fx + k * 0.014, 0.207, -0.028], [k * 0.15, -0.1, 1], 0.017, 0.004, CLAW, { bone: foot, name: "claw" });
    }
  }

  // ---------------------------------------------------------------- bandana, bell, gold ring
  const neckSurf = b.surface(neckTube);
  const collar = neckSurf.loop(neck.at(0.45), { lift: 0.008 });
  b.sweep(collar, 0.012, { color: TEAL, name: "collar" });
  b.sweep(neckSurf.loop(neck.at(0.3), { lift: 0.012 }), 0.004, { color: GOLD, name: "collarTrimA" });
  b.sweep(neckSurf.loop(neck.at(0.6), { lift: 0.012 }), 0.004, { color: GOLD, name: "collarTrimB" });
  const P = collar.at(0.5);
  const FLAP = cel(
    paint((_p, _n, s) => {
      const y = s[1];
      if (y > -0.01) return GOLD;
      if (Math.abs(s[0]) > flapHalf(y) - 0.007) return GOLD;
      if (Math.abs(s[0]) < 0.004 && y < -0.025 && y > -0.045) return GOLD;
      return TEAL;
    }),
  );
  b.extrude(
    [
      [-0.045, 0],
      [0.045, 0],
      [0.03, -0.02],
      [0, -0.07, "sharp"],
      [-0.03, -0.02],
    ],
    {
      at: P.clone().add(new THREE.Vector3(0, 0.004, 0.012)),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.002,
      color: FLAP,
      bone: neck.joints[0],
      name: "bandana",
    },
  );
  b.part(new THREE.SphereGeometry(0.013, 8, 6), GOLD, {
    at: P.clone().add(new THREE.Vector3(0, -0.014, 0.014)),
    bone: neck.joints[0],
    name: "bell",
  });
  b.rod(
    P.clone().add(new THREE.Vector3(0, -0.02, 0.026)),
    P.clone().add(new THREE.Vector3(0, -0.02, 0.0265)),
    0.003,
    "#5a3a10",
    { bone: neck.joints[0], name: "bellSlit" },
  );
  b.sweep(b.surface(tailTube).loop(tail.at(0.3), { lift: 0.012 }), 0.006, { color: GOLD, name: "tailRing" });

  // ---------------------------------------------------------------- dendro motes
  for (const [x, y, z, r] of [
    [-0.3, 0.45, 0.2, 0.009],
    [0.32, 0.55, 0.1, 0.012],
    [0.22, 0.3, 0.3, 0.008],
    [-0.28, 0.62, -0.1, 0.01],
    [0.12, 0.7, 0.2, 0.008],
    [-0.12, 0.33, 0.34, 0.007],
  ])
    glow(b.part(new THREE.SphereGeometry(r, 6, 4), "#b8ff5c", { bone: hips, at: [x, y, z], name: "mote" }), 1.4);

  return b.root;
}
