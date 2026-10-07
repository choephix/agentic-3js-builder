```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, countershade, paint } from "agentic-3js-builder";

export const meta = {
  name: "fennec fox",
  description: "A stylized fennec fox: huge ears, sandy coat, cream underside, dark-tipped tail, rigged skeleton.",
};

const SAND = "#e3b47c";
const EARTAN = "#eec79a";
const CREAM = "#f7ecd6";
const DARK = "#2b211c";
const WHITE = "#ffffff";

export default function build() {
  const b = createBuilder({ name: "fennec" });
  const coat = countershade(SAND, CREAM, { level: -0.2 });

  // Skeleton: hips, spine to chest, neck, head with a separate lower jaw, tail.
  const hips = b.joint("hips", { at: [0, 0.31, -0.08], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.31, -0.08],
      [0, 0.33, 0.03],
      [0, 0.35, 0.11],
      [0, 0.36, 0.16],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.36, 0.16],
      [0, 0.4, 0.22],
      [0, 0.44, 0.26],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.44, 0.26],
    aim: [0, 0.47, 0.4],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.1, -0.03]),
    aim: head.local([0, 0.2, -0.05]),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.31, -0.1],
      [0, 0.34, -0.26],
      [0, 0.33, -0.42],
      [0, 0.27, -0.52],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // Body: a loft along the spine, skinned to the hips and spine bones.
  b.loft(
    [
      { at: [0, 0.3, -0.2], w: 0.12, h: 0.14 },
      { at: [0, 0.31, -0.08], w: 0.15, h: 0.16 },
      { at: [0, 0.33, 0.04], w: 0.15, h: 0.15 },
      { at: [0, 0.35, 0.13], w: 0.13, h: 0.13 },
      { at: [0, 0.36, 0.19], w: 0.1, h: 0.11 },
    ],
    { bone: [hips, spine], color: coat },
  );

  // Head: cranium tapering into a short muzzle, cream chin and cheeks.
  const skull = b.loft(
    [
      { at: [0, 0.44, 0.2], w: 0.11, h: 0.11 },
      { at: [0, 0.45, 0.27], w: 0.12, h: 0.12 },
      { at: [0, 0.44, 0.34], w: 0.08, h: 0.08 },
      { at: [0, 0.42, 0.41], w: 0.034, h: 0.036 },
    ],
    {
      bone: head,
      color: paint((p, n) => (n.y < -0.2 || p.z > 0.38 ? CREAM : SAND)),
    },
  );

  // Lower jaw, riding its own bone so the mouth can open.
  b.loft(
    [
      { at: [0, 0.405, 0.3], w: 0.07, h: 0.035 },
      { at: [0, 0.4, 0.37], w: 0.04, h: 0.025 },
    ],
    { bone: jaw, color: CREAM },
  );

  // Neck sleeve so the head joins the body without a gap.
  b.sweep(neck, [0.07, 0.06], { color: coat });

  // Tail: bushy, with a dark tip.
  b.sweep(tail, (t: number) => 0.03 + 0.045 * Math.sin(Math.PI * t), {
    color: SAND,
    bands: [
      [0.8, SAND],
      [1, DARK],
    ],
  });

  // Legs, mirrored. Front legs fold their elbow back, hind legs knee forward and hock back.
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";

    const shoulder = [s * 0.06, 0.33, 0.15];
    const frontFoot = [s * 0.06, 0.025, 0.17];
    const fore = limb(shoulder, frontFoot, [0.16, 0.15], [[0, 0, -1]]);
    const foreLeg = b.chain("foreleg" + sd, fore, {
      parent: chest,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "leg",
    });
    b.sweep(foreLeg, [0.026, 0.018], { color: paint((p) => (p.y < 0.13 ? DARK : coat)) });

    const hip = [s * 0.07, 0.3, -0.1];
    const hindFoot = [s * 0.07, 0.025, -0.11];
    const hind = limb(
      hip,
      hindFoot,
      [0.13, 0.13, 0.08],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hindLeg = b.chain("hindleg" + sd, hind, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `hock${sd}`, `foot${sd}`],
      role: "leg",
    });
    b.sweep(hindLeg, [0.034, 0.02], { color: paint((p) => (p.y < 0.13 ? DARK : coat)) });

    // Dark paws on the feet tips.
    const frontTip = foreLeg.joints[foreLeg.joints.length - 1];
    const hindTip = hindLeg.joints[hindLeg.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.032, 8, 6), DARK, {
      bone: frontTip,
      at: [s * 0.06, 0.022, 0.185],
      scale: [1, 0.6, 1.45],
    });
    b.part(new THREE.SphereGeometry(0.032, 8, 6), DARK, {
      bone: hindTip,
      at: [s * 0.07, 0.022, -0.095],
      scale: [1, 0.6, 1.45],
    });
  }

  // Ears: big tan leaves with dark tips, tilted slightly back.
  const earOutline: [number, number][] = [
    [-0.045, 0],
    [0.045, 0],
    [0.04, 0.09],
    [0.012, 0.16, "sharp"] as unknown as [number, number],
    [-0.03, 0.1],
  ];
  for (const s of [1, -1]) {
    b.extrude(earOutline as any, {
      at: head.local([s * 0.05, -0.03, 0.06]),
      x: [s, 0, 0],
      y: [0, 1, -0.25],
      thickness: 0.014,
      bevel: 0.004,
      smoothing: 1,
      color: paint((_p, _n, uv) => (uv[1] > 0.12 ? DARK : EARTAN)),
      bone: head,
    });
  }

  // Eyes, eye highlights and nose seated on the cranium surface.
  const sk = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = sk.nearest([s * 0.045, 0.47, 0.31]);
    b.stick(new THREE.SphereGeometry(0.024, 8, 6), DARK, eyeHit, { embed: 0.35 });
    b.stick(new THREE.SphereGeometry(0.007, 6, 4), WHITE, eyeHit.moved([s * 0.009, 0, 0.01]), {
      embed: 0.2,
    });
  }
  const noseHit = sk.nearest([0, 0.42, 0.41]);
  b.stick(new THREE.SphereGeometry(0.02, 8, 6), DARK, noseHit, { embed: 0.4 });

  return b.root;
}
```