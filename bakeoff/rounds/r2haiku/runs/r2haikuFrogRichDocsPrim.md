```ts
import * as THREE from "three";
import { createBuilder, countershade, limb, paint } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Red-eyed tree frog",
  description:
    "Vivid lime tree frog clinging to a leaf, with blue and cream flank stripes, orange sticky toe pads, a cream belly and ruby eyes with black slit pupils.",
};

const LIME = "#8fdc1e";
const BLUE = "#2b6fd6";
const CREAM = "#f5efd2";
const RUBY = "#b3122b";
const ORANGE = "#f08a24";
const BLACK = "#0d0d0d";
const WHITE = "#ffffff";
const LEAF = "#2f7d32";
const VEIN = "#7fbf4d";

const ellip = (rx: number, ry: number, rz: number) => new THREE.SphereGeometry(1, 12, 8).scale(rx, ry, rz);

export default function build() {
  const b = createBuilder({ name: "red-eyed-tree-frog" });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.032, -0.02], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.036, 0.01], role: "spine" });
  const head = b.joint("head", { parent: chest, at: [0, 0.04, 0.034], dir: [0, 0.25, 1], role: "head" });

  // Leaf the frog clings to, lying flat on y = 0
  const leafOutline: OutlinePoint[] = [
    [0, -0.07, "sharp"],
    [0.03, -0.01],
    [0.036, 0.04],
    [0, 0.09, "sharp"],
    [-0.036, 0.04],
    [-0.03, -0.01],
  ];
  const leafPaint = paint((_p, _n, s) => (Math.abs(s[0]) < 0.0025 ? VEIN : LEAF));
  b.extrude(leafOutline, {
    at: [0, 0.003, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.004,
    bevel: 0.0012,
    smoothing: 2,
    color: leafPaint,
    name: "leaf",
  });

  // Skin: lime back, blue and cream flank stripes, cream belly
  const flank = paint((p) => {
    const side = Math.abs(p.x) > 0.016;
    if (side && p.y > 0.028 && p.y < 0.033) return BLUE;
    if (side && p.y > 0.024 && p.y <= 0.028) return CREAM;
    return LIME;
  });
  const coat = countershade(flank, CREAM, { level: -0.2 });

  // Body
  b.part(ellip(0.026, 0.021, 0.03), coat, { bone: hips, at: [0, 0.032, -0.012] });
  b.part(ellip(0.03, 0.024, 0.028), coat, { bone: chest, at: [0, 0.036, 0.01] });
  b.part(ellip(0.029, 0.021, 0.024), coat, { bone: head, at: [0, 0.041, 0.045] });

  // Wide surprised mouth line
  b.sweep(
    [
      [-0.018, 0.04, 0.062],
      [0, 0.038, 0.067],
      [0.018, 0.04, 0.062],
    ],
    0.0012,
    { bone: head, color: BLACK },
  );

  // Toe pads: a capsule per digit with a round sticky pad at its tip
  const digits = (bone: ReturnType<typeof b.joint>, ax: number, az: number, fan: number[][]) => {
    for (const [dx, dz] of fan) {
      const end: [number, number, number] = [ax + dx * 0.011, 0.0088, az + dz * 0.011];
      b.capsule([ax, 0.0088, az], end, 0.0026, { bone, color: ORANGE });
      b.part(new THREE.SphereGeometry(0.0042, 8, 6), ORANGE, { bone, at: end });
    }
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Eyes: big ruby spheres with black vertical slit pupils and a glint
    const ex = s * 0.024;
    b.part(new THREE.SphereGeometry(0.014, 12, 8), RUBY, { bone: head, at: [ex, 0.056, 0.05] });
    b.part(ellip(0.0035, 0.0105, 0.0018), BLACK, { bone: head, at: [ex, 0.056, 0.0655] });
    b.part(new THREE.SphereGeometry(0.003, 6, 4), WHITE, { bone: head, at: [s * 0.033, 0.064, 0.058] });

    // Hind leg: hip, knee, ankle, with the foot planted on the leaf
    const hindPts = limb(
      [s * 0.02, 0.032, -0.02],
      [s * 0.045, 0.0085, -0.03],
      [0.03, 0.03],
      [[s * 0.4, 1, 0.6]],
    );
    const hind = b.chain(`leg${side}`, hindPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(hind, [0.013, 0.007], { color: coat });
    const hindFoot = hind.tip ?? hind.joints[hind.joints.length - 1];
    const hindAnkle = hindPts[hindPts.length - 1];
    digits(hindFoot, hindAnkle.x, hindAnkle.z, [
      [-0.7, -0.6],
      [-0.25, -0.95],
      [0.25, -0.95],
      [0.7, -0.6],
    ]);

    // Front leg: shoulder, elbow, wrist, with the hand planted on the leaf
    const frontPts = limb(
      [s * 0.02, 0.036, 0.018],
      [s * 0.03, 0.0085, 0.05],
      [0.024, 0.024],
      [[s * 0.5, 1, -0.4]],
    );
    const front = b.chain(`arm${side}`, frontPts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(front, [0.008, 0.0055], { color: coat });
    const frontHand = front.tip ?? front.joints[front.joints.length - 1];
    const frontWrist = frontPts[frontPts.length - 1];
    digits(frontHand, frontWrist.x, frontWrist.z, [
      [-0.6, 0.8],
      [-0.2, 1],
      [0.2, 1],
      [0.6, 0.8],
    ]);
  }

  return b.root;
}
```