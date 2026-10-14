import * as THREE from "three";
import { createBuilder, limb, paint } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Red-eyed tree frog",
  description: "Lime-green tree frog with blue and cream flank stripes, orange sticky toe pads, and wide ruby eyes, clinging to a leaf.",
};

const LIME = "#8ee34a";
const BLUE = "#2b6fe6";
const CREAM = "#f7f2d2";
const ORANGE = "#ff8c1a";
const RUBY = "#d7143c";
const BLACK = "#14100e";
const LEAF = "#2c8f3c";
const VEIN = "#6ccf55";

export default function build() {
  const b = createBuilder({ name: "red-eyed-tree-frog" });

  // Leaf the frog clings to, lying flat at y = 0.
  const leafOutline: OutlinePoint[] = [
    [0, -0.12],
    [0.06, -0.05],
    [0.09, 0.05],
    [0.06, 0.14],
    [0, 0.2, "sharp"],
    [-0.06, 0.14],
    [-0.09, 0.05],
    [-0.06, -0.05],
  ];
  b.extrude(leafOutline, {
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.004,
    bevel: 0.001,
    smoothing: 1,
    color: LEAF,
  });
  b.sweep(
    [
      [0, 0.0035, -0.1],
      [0, 0.0035, 0.02],
      [0, 0.0035, 0.18],
    ],
    0.0022,
    { color: VEIN, caps: "round" },
  );

  // Skeleton: root hips, spine chain, head.
  const hips = b.joint("hips", { at: [0, 0.042, -0.04], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.042, -0.06],
      [0, 0.044, 0.0],
      [0, 0.044, 0.04],
      [0, 0.046, 0.07],
    ],
    { parent: hips, role: "spine" },
  );
  const head = b.joint("head", {
    parent: spine.joints[2],
    at: [0, 0.047, 0.075],
    aim: [0, 0.05, 0.12],
    role: "head",
  });

  // Skin: lime back, cream belly, blue and cream stripes along the flanks.
  const skin = paint((_p, _n, s) => {
    const a = ((s[1] % 360) + 360) % 360;
    if (a > 150 && a < 210) return CREAM;
    if ((a > 55 && a < 125) || (a > 235 && a < 305)) {
      return Math.floor(s[0] * 7) % 2 ? BLUE : CREAM;
    }
    return LIME;
  });

  // Body: one tube over the spine, flattened and widest mid-back.
  b.sweep(spine, (t) => [0.03 + 0.006 * Math.sin(Math.PI * t), 0.022 + 0.004 * Math.sin(Math.PI * t)], {
    color: skin,
    caps: "round",
  });

  // Head: a slightly flattened, rounded snout.
  const headGeo = new THREE.SphereGeometry(0.032, 14, 10);
  headGeo.scale(1, 0.8, 1.1);
  b.part(headGeo, LIME, { at: [0, 0.048, 0.085], bone: head });

  // Enormous ruby eyes with black vertical slit pupils and a small highlight.
  for (const s of [1, -1]) {
    const x = s * 0.026;
    b.part(new THREE.SphereGeometry(0.015, 12, 8), RUBY, { at: [x, 0.068, 0.086], bone: head });
    b.part(new THREE.BoxGeometry(0.0024, 0.0105, 0.002), BLACK, { at: [x, 0.068, 0.1012], bone: head });
    b.part(new THREE.SphereGeometry(0.0028, 6, 4), CREAM, { at: [x + s * 0.004, 0.0745, 0.0992], bone: head });
  }

  // Toes: capsule digits with round orange sticky pads.
  const toes = (tip: any, base: number[], s: number, angles: number[], len: number) => {
    for (const deg of angles) {
      const a = (s * deg * Math.PI) / 180;
      const d = [Math.sin(a), 0, Math.cos(a)];
      const A = [base[0], base[1], base[2]];
      const C = [base[0] + d[0] * len, 0.0045, base[2] + d[2] * len];
      b.capsule(A, C, 0.0028, { color: ORANGE, bone: tip });
      const pad = new THREE.SphereGeometry(0.0048, 8, 6);
      pad.scale(1, 0.6, 1);
      b.part(pad, ORANGE, { at: C, bone: tip });
    }
  };

  // Legs: folded hind legs with four toes, folded front arms with four fingers.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // Hind leg: knee up and out, foot flat on the leaf.
    const hipP = [s * 0.03, 0.044, -0.03];
    const hindFoot = [s * 0.056, 0.006, 0.0];
    const hindPts = limb(hipP, hindFoot, [0.04, 0.046, 0.036], [s * 0.3, 1, -0.8]);
    const hind = b.chain(`legHind${S}`, hindPts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
    });
    b.sweep(hind, (t) => 0.012 - 0.005 * t, { color: LIME, caps: "round" });
    toes(hind.tip!, hindFoot, s, [-45, -15, 15, 45], 0.014);

    // Front arm: tucked in, hand planted on the leaf in front of the body.
    const frontHip = [s * 0.03, 0.05, 0.05];
    const frontHand = [s * 0.05, 0.006, 0.085];
    const frontPts = limb(frontHip, frontHand, [0.03, 0.032, 0.026], [s * 0.2, 1, 0.4]);
    const front = b.chain(`armFront${S}`, frontPts, {
      parent: spine.joints[1],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`],
      role: "arm",
    });
    b.sweep(front, (t) => 0.008 - 0.003 * t, { color: LIME, caps: "round" });
    toes(front.tip!, frontHand, s, [-50, -17, 17, 50], 0.009);
  }

  return b.root;
}
