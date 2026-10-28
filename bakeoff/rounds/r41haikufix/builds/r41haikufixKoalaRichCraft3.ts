import * as THREE from "three";
import { createBuilder, catmull, grain, limb, noise, rng } from "../../../../src/index";
import { cellPaint, pixelArt, pixelTexture, snapColor } from "../../../../kits/pixel";

export const meta = {
  name: "koala",
  description: "A pixel-art koala gripping a eucalyptus branch, built from blocky primitives with pixel textures.",
};

const TEXEL = 0.018;

// Palette: snapped to a small colour set so the whole model reads as pixel art.
const GREY = ["#4b5059", "#6a7079", "#878d95", "#a6abb1"].map((c) => snapColor(c, 64));
const CREAM = ["#c9c3b4", "#e6e0d2", "#f4efe3"].map((c) => snapColor(c, 64));
const BARK = ["#2a2119", "#3e3028", "#5a4836", "#7a6248"].map((c) => snapColor(c, 64));
const CLAW = "#2a2622";
const NOSE = "#241f1e";
const INNER_EAR = "#d6a79a";
const LEAF_RAMP = ["#2b4a34", "#3f6b48", "#6c9a66", "#9cc48a"];

// Fur: dithered grey coat, pale belly on the front of the body.
const FUR = cellPaint(
  TEXEL * 4,
  (c) => {
    const v = noise(c.at, 0.12, 4);
    if (c.n.z > 0.45 && c.at.y < 1.2) return c.pick(CREAM, 0.3 + 0.6 * v);
    return c.pick(GREY, 0.15 + 0.7 * c.n.y * 0.5 + 0.5 * v);
  },
  { dither: true },
);

// Eucalyptus branch and trunk: streaked grey-brown bark.
const BARK_PAINT = grain("#5a4836", "#2a2119", { size: 0.035, axis: "y", seed: 2 });

// Pixel drawings.
const EYE = pixelArt(
  [
    "..kkkk..",
    ".kkwwkk.",
    "kkkwwkkk",
    "kkkkkkkk",
    "kkkkkkkk",
    "kkkkkkkk",
    ".kkkkkk.",
    "..kkkk..",
  ],
  { k: "#14110f", w: "#ffffff" },
);

const EAR = pixelTexture(12, 12, (g) =>
  g.fill((x, y) => {
    const d = Math.hypot(x - 5.5, y - 5.5);
    if (d > 5.6) return "";
    if (d > 3.6) return d > 4.8 ? "#4b5059" : "#6a7079";
    return INNER_EAR;
  }),
);

const LEAF = pixelTexture(8, 16, (g) =>
  g.fill((x, y) => {
    const half = Math.sin((Math.PI * (y + 0.5)) / 16) * 3.6;
    const d = Math.abs(x + 0.5 - 4);
    if (d > half) return "";
    if (d < 0.6) return "#1d3324";
    return LEAF_RAMP[Math.min(3, Math.floor((half - d) * 1.2))];
  }),
);

export default function build() {
  const b = createBuilder({ name: "koala" });

  // Skeleton: root hips sit on the branch, spine rises to the head.
  const hips = b.joint("hips", { at: [0, 1.07, 0] });
  const spinePath = catmull([
    [0, 1.07, 0],
    [0, 1.22, 0.02],
    [0, 1.38, 0.03],
  ]);
  const spine = b.chain("spine", spinePath, { parent: hips, names: ["spine1", "spine2"], role: "spine" });
  const head = b.joint("head", {
    parent: spine.joints[1],
    at: [0, 1.47, 0.03],
    aim: [0, 1.7, 0.05],
    role: "head",
  });

  // Trunk and branch the koala grips.
  b.sweep(
    catmull([
      [-0.3, 0, 0],
      [-0.29, 0.45, 0],
      [-0.3, 0.88, 0],
    ]),
    (t: number) => 0.09 - 0.02 * t,
    { color: BARK_PAINT },
  );
  const branchPath = catmull([
    [-0.3, 0.85, 0],
    [-0.1, 0.97, 0.01],
    [0.2, 0.99, 0.0],
    [0.5, 1.04, -0.02],
  ]);
  b.sweep(branchPath, (t: number) => 0.035 - 0.012 * t, { color: BARK_PAINT });

  // Knots on the branch for a bit of character.
  for (const [at, r] of [
    [[-0.12, 0.99, 0.02], 0.012],
    [[0.32, 1.0, -0.01], 0.01],
  ] as const) {
    b.part(new THREE.SphereGeometry(r, 6, 4), BARK[1], { at: [...at] });
  }

  // Body: a rounded sweep up the spine, heavier at the chest.
  b.sweep(spinePath, (t: number) => [0.12 + 0.04 * Math.sin(Math.PI * t), 0.15 - 0.03 * t], {
    bone: spine,
    color: FUR,
  });

  // Head: fluffy ball with a pale muzzle and big round ears.
  const headPart = b.part(new THREE.SphereGeometry(0.13, 12, 9), FUR, {
    bone: head,
    at: [0, 1.56, 0.04],
    scale: [1, 0.92, 0.95],
  });
  b.part(new THREE.SphereGeometry(0.07, 10, 7), CREAM[1], {
    bone: head,
    at: [0, 1.5, 0.13],
    scale: [1.1, 0.8, 0.8],
  });
  b.part(new THREE.SphereGeometry(0.035, 8, 6), NOSE, { bone: head, at: [0, 1.535, 0.19] });

  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.058, 10), "#ffffff", {
      bone: head,
      at: [s * 0.1, 1.67, 0.03],
      dir: [s * 0.25, 0.2, 1],
      axis: "z",
      texture: EAR,
    });
    // Big dark eyes as decals on the round head.
    b.decal(headPart, EYE, {
      at: [s * 0.055, 1.6, 0.13],
      dir: [0, 0, 1],
      size: [0.04, 0.046],
      mirror: s < 0,
    });
  }

  // Arms wrap the branch from the front; legs hook over it.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder: [number, number, number] = [s * 0.13, 1.3, 0.03];
    const hand: [number, number, number] = [s * 0.07, 1.0, 0.09];
    const armPts = limb(shoulder, hand, [0.2, 0.17], [[0, 0, 1]]);
    const arm = b.chain(`arm${side}`, armPts, {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "arm",
    });
    b.sweep(armPts, [0.045, 0.035], { bone: arm, color: FUR });
    b.part(new THREE.SphereGeometry(0.05, 8, 6), FUR, { bone: arm.tip ?? arm.joints[arm.joints.length - 1], at: hand });
    if (arm.tip) {
      for (let k = 0; k < 3; k++) {
        b.spike(arm.tip, [s * (0.3 * (k - 1)), -1, 0.5], 0.025, 0.005, { color: CLAW });
      }
    }

    const hip: [number, number, number] = [s * 0.12, 1.08, 0.03];
    const foot: [number, number, number] = [s * 0.08, 0.985, 0.1];
    const legPts = limb(hip, foot, [0.2, 0.17], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, legPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(legPts, [0.05, 0.04], { bone: leg, color: FUR });
    if (leg.tip) {
      for (let k = 0; k < 3; k++) {
        b.spike(leg.tip, [s * (0.25 * (k - 1)), -0.3, 1], 0.02, 0.004, { color: CLAW });
      }
    }
  }

  // Eucalyptus leaves hanging along the branch.
  const leafFrames = b.along(branchPath, 16, () => {});
  b.cards(leafFrames, LEAF, {
    size: [0.05, 0.11],
    lean: 45,
    flow: [0, 0.4, 1],
    vary: 0.3,
    spin: 40,
    rng: rng(5),
  });

  return b.root;
}
