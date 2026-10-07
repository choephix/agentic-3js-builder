import * as THREE from "three";
import { createBuilder, catmull, polyline, countershade, mottle, paint, stripes, rng } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Fennec kit",
  description: "A fennec fox kit standing alert on a sand dune at dusk, with satin peach-lined ears, a sandy-gold back, a fluffy tail and a woven leather collar with a brass bell.",
};

const CREAM = "#f4e4c8";
const GOLD = "#d69a55";
const PEACH = "#f6bca2";
const DARK = "#241a16";
const EYE = "#17100c";
const WHITE = "#fffaf0";
const BRASS = "#c9a23e";
const LEATHER_A = "#8a5330";
const LEATHER_B = "#5e3620";
const SAND_A = "#e9c88f";
const SAND_B = "#d3a562";

const FUR = countershade(GOLD, CREAM, { level: 0.1 });
const WEAVE = stripes(LEATHER_A, LEATHER_B, { size: 0.02 });
const DUNE = mottle(SAND_A, SAND_B, { size: 0.25, seed: 4 });

const EAR: OutlinePoint[] = [
  [-0.07, 0],
  [0.07, 0],
  [0.06, 0.13],
  [0.025, 0.23],
  [-0.005, 0.26, "sharp"],
  [-0.05, 0.16],
  [-0.07, 0.05],
];

export default function build() {
  const b = createBuilder({ name: "fennec-kit" });

  // ---- Skeleton: body, neck, head ----
  const hips = b.joint("hips", { at: [0, 0.5, -0.12] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.5, -0.12],
      [0, 0.53, 0.05],
      [0, 0.56, 0.2],
      [0, 0.6, 0.32],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const body = b.sweep(spine, [0.08, 0.1, 0.1, 0.085], { color: FUR });

  const neck = b.chain("neck", polyline([[0, 0.6, 0.32], [0, 0.68, 0.39], [0, 0.76, 0.44]]), {
    parent: spine.joints[2],
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });
  const neckTube = b.sweep(neck, [0.06, 0.05, 0.05], { color: FUR });
  const neckSurf = b.surface(neckTube);

  const neckTip = neck.joints[neck.joints.length - 1];
  const head = b.joint("head", {
    parent: neckTip,
    at: [0, 0.78, 0.46],
    aim: [0, 0.86, 0.58],
    role: "head",
  });

  // ---- Head ----
  b.part(new THREE.SphereGeometry(0.088, 14, 10), FUR, {
    bone: head,
    at: head.local({ up: 0.01 }),
    scale: [1, 0.95, 1.1],
  });
  b.spike(head.local({ forward: 0.03, up: -0.02 }), head.local({ forward: 0.2, up: -0.05 }), null, 0.045, {
    color: CREAM,
  });
  b.part(new THREE.SphereGeometry(0.014, 8, 6), DARK, {
    bone: head,
    at: head.local({ forward: 0.2, up: -0.03 }),
  });

  for (const s of [1, -1]) {
    // cream cheek under each eye
    b.part(new THREE.SphereGeometry(0.04, 10, 8), CREAM, {
      bone: head,
      at: head.local({ left: s * 0.04, up: -0.035, forward: 0.05 }),
    });
    // big dark eye with a tiny white sparkle
    b.part(new THREE.SphereGeometry(0.032, 12, 9), EYE, {
      bone: head,
      at: head.local({ left: s * 0.05, up: 0.02, forward: 0.075 }),
    });
    b.part(new THREE.SphereGeometry(0.009, 6, 4), WHITE, {
      bone: head,
      at: head.local({ left: s * 0.058, up: 0.035, forward: 0.105 }),
    });

    // enormous satin ears, peach on the inner face
    b.extrude(EAR, {
      at: head.local({ left: s * 0.05, up: 0.06, back: 0.01 }),
      x: [0.6 * s, 0, 1],
      y: [0.3 * s, 1, 0],
      thickness: [0.014, 0.005],
      bevel: 0.004,
      smoothing: 1,
      color: paint((_p, n) => (n.x * s < -0.3 ? PEACH : FUR)),
    });
  }

  // ---- Legs: oversized cream paws on thin fur legs ----
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // front leg
    const arm = b.chain(
      `arm${L}`,
      polyline([
        [s * 0.075, 0.5, 0.2],
        [s * 0.08, 0.36, 0.21],
        [s * 0.075, 0.2, 0.23],
      ]),
      { parent: spine.joints[1], names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "leg" },
    );
    b.sweep(arm, [0.035, 0.03, 0.025], { color: FUR });
    const wrist = arm.tip ?? arm.joints[arm.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.06, 10, 8), CREAM, {
      bone: wrist,
      at: [s * 0.075, 0.168, 0.255],
      scale: [1, 0.6, 1.25],
    });

    // hind leg
    const hind = b.chain(
      `hind${L}`,
      polyline([
        [s * 0.08, 0.48, -0.1],
        [s * 0.085, 0.3, -0.05],
        [s * 0.075, 0.19, -0.12],
      ]),
      { parent: hips, names: [`hip${L}`, `knee${L}`, `hock${L}`], role: "leg" },
    );
    b.sweep(hind, [0.05, 0.04, 0.03], { color: FUR });
    const hock = hind.tip ?? hind.joints[hind.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.05, 10, 8), CREAM, {
      bone: hock,
      at: [s * 0.075, 0.165, -0.05],
      scale: [1, 0.6, 1.5],
    });
  }

  // ---- Fluffy tail with a black tip ----
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.5, -0.12],
      [0, 0.5, -0.3],
      [0, 0.47, -0.45],
      [0, 0.4, -0.56],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  const tailTube = b.sweep(tail, [0.045, 0.085, 0.09, 0.075], {
    color: FUR,
    bands: [
      [0.82, FUR],
      [1, DARK],
    ],
  });
  // soft tufts of fur over the tail
  const tailSurf = b.surface(tailTube);
  for (const hit of tailSurf.scatter(22, { rng: rng(7), minDist: 0.05 })) {
    b.stick(new THREE.SphereGeometry(0.03, 6, 4), FUR, hit, { embed: 0.5 });
  }

  // ---- Woven leather collar with a brass bell ----
  const collar = neckSurf.loop([0, 0.7, 0.41], { dir: [0, 1, 0], lift: 0.012 });
  b.sweep(collar, 0.011, { color: WEAVE });

  const bellHit = neckSurf.around([0, 0.7, 0.41]).at(0, -35);
  if (bellHit) {
    b.stick(new THREE.SphereGeometry(0.02, 10, 8), BRASS, bellHit, { embed: 0.3 });
  }

  // ---- Sand dune the kit stands on (base on y = 0) ----
  b.lathe(
    [
      [0, 0],
      [0.75, 0],
      [0.65, 0.04],
      [0.42, 0.12],
      [0.2, 0.18],
      [0, 0.19],
    ],
    { at: [0, 0, 0], smoothing: 2, segments: 18, color: DUNE },
  );

  return b.root;
}
