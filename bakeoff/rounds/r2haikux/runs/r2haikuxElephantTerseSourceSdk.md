```ts
import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  gradient,
  interpolate,
  mottle,
  paint,
  stripes,
} from "agentic-3js-builder";

export const meta = {
  name: "Elephant",
  description:
    "An African bush elephant at rest, about 3.2 m at the shoulder: column legs, a long curled trunk, ivory tusks, big fan ears and a tufted tail.",
};

const EYE = "#1b1613";
const GLINT = "#f8f3e9";
const NAIL = "#e9e2cf";
const TUFT = "#4a3c32";
const EAR_INNER = "#c08f8c";
const TRUNK_LINE = "#615a64";
const IVORY_ROOT = "#f3ebd6";
const IVORY_TIP = "#c9b68c";

/** Body radii (half width, half height) along the spine by source t: chest, barrel, rump. */
const BODY_T = [0, 0.25, 0.55, 0.8, 1];
const BODY_RX = [0.58, 0.7, 0.72, 0.62, 0.48];
const BODY_RY = [0.6, 0.7, 0.7, 0.62, 0.55];

export default function elephant() {
  const b = createBuilder({ name: "elephant", paintSize: 1024 });

  // Paints: a grey hide with cloudy variation, paler underneath, darker feet, ivory tusks, pink ear insides.
  const hide = mottle("#716b72", "#9a9298", { size: 0.55, seed: 11, contrast: 0.9 });
  const skin = countershade(hide, "#c2b9b4", { level: -0.2, soft: 0.5 });
  const legSkin = gradient("#4b454d", hide, [0, 0.12, 0], [0, 1.3, 0]);
  const trunkSkin = stripes(skin, TRUNK_LINE, { size: 0.2, axis: "y", width: 0.3, wobble: 0.5, seed: 4 });
  const ivory = gradient(IVORY_ROOT, IVORY_TIP, [0, 2.2, 2.85], [0, 2.2, 3.55]);
  const earSkin = (side: number) => paint((_p, n) => (n.x * side < -0.25 ? EAR_INNER : skin));

  // Skeleton: root at the body centre, spine forward to the chest and back to the rump.
  b.joint("root", { at: [0, 2.45, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.5, 1.3],
      [0, 2.5, 0.2],
      [0, 2.42, -0.8],
      [0, 2.4, -1.5],
      [0, 2.45, -2.0],
    ]),
    { parent: "root", names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const neck = b.chain("neck", catmull([[0, 2.5, 1.2], [0, 2.85, 1.7], [0, 2.95, 2.1]]), {
    parent: "spine1",
    names: ["neck1", "neck2"],
    role: "neck",
  });
  b.joint("head", { parent: "neck2", at: [0, 2.85, 2.1], aim: [0, 2.55, 3.0], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 2.2, 2.45], dir: [0, 0, 1], role: "jaw" });
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 2.35, 3.0],
      [0, 2.1, 3.3],
      [0, 1.65, 3.45],
      [0, 1.2, 3.35],
      [0, 0.8, 3.0],
      [0, 0.55, 2.7],
      [0, 0.6, 2.45],
    ]),
    {
      parent: "head",
      names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunk5", "trunk6", "trunkTip"],
      role: "tentacle",
    },
  );
  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.4, -1.95],
      [0, 2.15, -2.3],
      [0, 1.8, -2.55],
      [0, 1.35, -2.7],
      [0, 0.95, -2.7],
    ]),
    { parent: "spine4", names: ["tail1", "tail2", "tail3", "tail4", "tailTip"], role: "tail" },
  );

  // Body, neck and head: smooth tubes that bend with their bones.
  b.sweep(spine, (t) => [interpolate(BODY_T, BODY_RX, t), interpolate(BODY_T, BODY_RY, t)], {
    color: skin,
    sides: 12,
  });
  b.sweep(neck, (t) => 0.56 - 0.07 * t, { color: skin, sides: 10 });
  const head = b.loft(
    [
      { at: [0, 2.75, 1.65], w: 1.15, h: 1.25 },
      { at: [0, 2.88, 2.15], w: 1.42, h: 1.3 },
      { at: [0, 2.6, 2.7], w: 1.15, h: 1.1 },
      { at: [0, 2.5, 3.05], w: 0.75, h: 0.85 },
    ],
    { color: skin, bone: "head", sides: 12 },
  );

  // Lower jaw, hinged on its own bone.
  b.loft(
    [
      { at: [0, 2.22, 2.4], w: 0.8, h: 0.3 },
      { at: [0, 2.14, 2.95], w: 0.5, h: 0.26 },
    ],
    { color: skin, bone: "jaw", sides: 8 },
  );

  // Tusks: curved ivory tubes rooted in the upper jaw, one per side.
  const tusk = (s: number) =>
    b.sweep(
      catmull(
        [
          [0.36, 2.25, 2.85],
          [0.44, 2.13, 3.13],
          [0.54, 2.05, 3.4],
          [0.68, 2.2, 3.55],
        ].map(([x, y, z]) => [s * x, y, z]),
      ),
      [0.09, 0.014],
      { color: ivory, bone: "head", sides: 8 },
    );
  tusk(1);
  tusk(-1);

  // Trunk: a long tapering tube that hangs and curls at the tip, wrinkled by stripes.
  b.sweep(trunk, (t) => 0.3 - 0.17 * t, { color: trunkSkin, sides: 10 });

  // Tail with a dark tuft at the tip.
  b.sweep(tail, (t) => 0.13 - 0.08 * t, { color: skin, sides: 8 });
  for (const d of [
    [0, -1, 0],
    [0.5, -0.8, 0.1],
    [-0.5, -0.8, 0.1],
    [0, -0.8, -0.6],
    [0.3, -0.9, -0.3],
  ]) {
    b.spike([0, 0.95, -2.7], d, 0.2, 0.035, { color: TUFT, bone: "tailTip" });
  }

  // Columnar legs with round toes and toenails.
  const leg = (side: "L" | "R", front: boolean) => {
    const s = side === "L" ? 1 : -1;
    const x = 0.44 * s;
    const names = front
      ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `forefoot${side}`]
      : [`hip${side}`, `knee${side}`, `hock${side}`, `hindfoot${side}`];
    const points = front
      ? [
          [x, 2.5, 1.25],
          [x, 1.4, 1.22],
          [x, 0.5, 1.24],
          [x, 0.1, 1.26],
        ]
      : [
          [x, 2.45, -1.15],
          [x, 1.4, -1.05],
          [x, 0.5, -1.2],
          [x, 0.1, -1.2],
        ];
    const column = b.chain(front ? `foreLeg${side}` : `hindLeg${side}`, catmull(points), {
      parent: front ? "spine1" : "root",
      names,
      role: "leg",
    });
    b.sweep(column, (t) => 0.28 - 0.08 * t, { color: legSkin, sides: 10, caps: { end: "flat" } });

    const footZ = points[3][2];
    b.part(new THREE.CylinderGeometry(0.3, 0.32, 0.22, 14), legSkin, {
      at: [x, 0.11, footZ],
      bone: names[3],
    });
    const toes = front ? [-0.16, -0.055, 0.055, 0.16] : [-0.11, 0, 0.11];
    for (const dx of toes) {
      const z = footZ + Math.sqrt(0.31 ** 2 - dx * dx) + 0.01;
      b.part(new THREE.CylinderGeometry(0.05, 0.056, 0.035, 10), NAIL, {
        at: [x + dx, 0.1, z],
        dir: [0, 0, 1],
        bone: names[3],
      });
    }
  };
  leg("L", true);
  leg("R", true);
  leg("L", false);
  leg("R", false);

  // Eyes: small dark domes seated on the head's real surface, each with a glint.
  const headSurface = b.surface(head);
  const eye = (side: number) => {
    const hit = headSurface.nearest([side * 0.8, 2.85, 2.45]);
    b.stick(new THREE.SphereGeometry(0.045, 12, 8), EYE, hit, { embed: 0.35 });
    const facing = hit.n.add(new THREE.Vector3(0, 0.5, 0.4)).normalize();
    const centre = hit.at.addScaledVector(hit.n, 0.0135).addScaledVector(facing, 0.036);
    b.part(new THREE.SphereGeometry(0.013, 8, 6), GLINT, { at: centre, bone: "head" });
  };
  eye(1);
  eye(-1);

  // Big fan ears hanging from the sides of the head, pink on the inside, spread a little outward.
  const ear = (side: "L" | "R") => {
    const s = side === "L" ? 1 : -1;
    const joint = b.joint(`ear${side}`, { parent: "head", at: [0.62 * s, 2.95, 1.92], role: "hinge" });
    const flap = Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return [-0.1 + 0.44 * Math.cos(a), -0.52 + 0.52 * Math.sin(a)];
    });
    b.extrude(flap, { color: earSkin(s), at: joint, thickness: 0.06, bevel: 0.015, smoothing: 1 });
    b.pose(joint, { axis: [0, 0, 1], deg: 14 * s });
  };
  ear("L");
  ear("R");

  return b.root;
}
```