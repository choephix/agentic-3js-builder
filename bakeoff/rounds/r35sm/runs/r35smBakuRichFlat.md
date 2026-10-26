```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, spiral, limb, paint, stripes } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Baku",
  description:
    "Baku, the dream-eating tapir spirit, as an ukiyo-e woodblock print: indigo hide, a wave-patterned cream saddle, vermilion flame mane, ivory tusks and a gold cloud swirl.",
};

// Woodblock palette
const INDIGO = "#1f3a6e";
const PRUS = "#27487c";
const INK = "#16161f";
const VERM = "#d6402a";
const CREAM = "#f0e2bd";
const GOLD = "#dca83a";
const WAVE = "#8fb8c9";
const IVORY = "#f6efd8";
const LIP = "#8a3f36";

export default function build() {
  const b = createBuilder({ name: "baku" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.0, -0.6], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.0, -0.6],
      [0, 1.05, -0.2],
      [0, 1.1, 0.25],
      [0, 1.15, 0.6],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const spineEnd = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.15, 0.6],
      [0, 1.32, 0.82],
      [0, 1.4, 1.0],
    ]),
    { parent: spineEnd, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.4, 1.0], dir: [0, -0.2, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.28, 1.06],
    aim: [0, 1.22, 1.4],
    role: "jaw",
  });

  // ---------- body ----------
  const bodyPaint = paint((p) => {
    const e = 0.03 * Math.sin(p.y * 18);
    return p.z > -0.25 + e && p.z < 0.3 + e ? CREAM : PRUS;
  });
  const body = b.loft(
    [
      { at: [0, 1.0, -0.62], w: 0.5, h: 0.64 },
      { at: [0, 1.04, -0.3], w: 0.62, h: 0.7 },
      { at: [0, 1.09, 0.2], w: 0.62, h: 0.72 },
      { at: [0, 1.15, 0.6], w: 0.54, h: 0.66 },
    ],
    { bone: [hips, spine], color: bodyPaint },
  );
  const neckTube = b.sweep(neck, [0.27, 0.2, 0.17], { color: PRUS });

  // seigaiha wave discs on the saddle flanks
  const skin = b.surface(body);
  const discs: [number, number][] = [
    [1.0, -0.15],
    [1.0, 0.05],
    [1.0, 0.25],
    [1.2, -0.05],
    [1.2, 0.15],
  ];
  for (const s of [1, -1]) {
    for (const [y, z] of discs) {
      const hit = skin.ray([s * 1.5, y, z], [-s, 0, 0]);
      if (!hit) continue;
      const rings: [number, string][] = [
        [0.1, WAVE],
        [0.078, CREAM],
        [0.056, WAVE],
        [0.034, VERM],
      ];
      rings.forEach(([r, c], i) => {
        b.stick(new THREE.CylinderGeometry(r, r, 0.006 + i * 0.002, 14), c, hit, { embed: 0.2 });
      });
    }
    // gold cloud swirls on shoulder and haunch
    for (const z of [0.45, -0.5]) {
      const c: [number, number, number] = [s * 0.33, 1.22, z];
      const sp = spiral(c, [c[0], c[1] + 0.1, c[2]], [s, 0, 0], { turns: -s * 1.4, r1: 0.025 });
      b.sweep(sp, 0.012, { color: GOLD, bone: z > 0 ? spineEnd : hips });
    }
  }

  // ---------- legs ----------
  const legPaint = stripes(PRUS, INK, { size: 0.1, axis: "y" });
  const pawAt = (x: number, z: number, bone: any) => {
    b.part(new THREE.SphereGeometry(0.09, 8, 6), PRUS, {
      bone,
      at: [x, 0.055, z + 0.04],
      scale: [1, 0.62, 1.3],
    });
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.033, 6, 5), INDIGO, { bone, at: [x + k * 0.05, 0.036, z + 0.135] });
      b.part(new THREE.ConeGeometry(0.014, 0.06, 5), IVORY, {
        bone,
        at: [x + k * 0.05, 0.034, z + 0.19],
        dir: [0, -0.1, 1],
      });
    }
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front
    const fp = limb([s * 0.22, 0.9, 0.5], [s * 0.22, 0.08, 0.5], [0.45, 0.42], [[0, 0, -1]]);
    const fl = b.chain(`legF${side}`, fp, {
      parent: spineEnd,
      names: [`shoulder${side}`, `elbow${side}`, `pawF${side}`],
      role: "leg",
    });
    b.sweep(fl, [0.12, 0.085, 0.065], { color: legPaint });
    pawAt(s * 0.22, 0.5, fl.joints[fl.joints.length - 1]);
    // hind
    const hp = limb(
      [s * 0.2, 0.85, -0.55],
      [s * 0.22, 0.08, -0.5],
      [0.36, 0.34, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hl = b.chain(`legH${side}`, hp, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
      role: "leg",
    });
    b.sweep(hl, [0.15, 0.1, 0.07, 0.06], { color: legPaint });
    pawAt(s * 0.22, -0.5, hl.joints[hl.joints.length - 1]);
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.05, -0.7],
      [0, 0.95, -1.0],
      [0, 0.7, -1.12],
      [0, 0.5, -1.1],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, [0.07, 0.045, 0.035], { color: PRUS });
  b.ring(tail.at(1), { count: 7, radius: 0.025, tilt: 25 }, (it) =>
    b.spike(it, it, 0.2, 0.045, { color: VERM }),
  );
  b.ring(tail.at(1), { count: 5, radius: 0.012, tilt: 12 }, (it) =>
    b.spike(it, it, 0.26, 0.025, { color: GOLD }),
  );

  // ---------- head ----------
  const skull = b.loft(
    [
      { at: [0, 1.42, 0.96], w: 0.36, h: 0.38 },
      { at: [0, 1.38, 1.2], w: 0.3, h: 0.3 },
      { at: [0, 1.33, 1.38], w: 0.2, h: 0.2 },
    ],
    { bone: head, color: PRUS },
  );
  // lower jaw
  b.frustumBox([0, 1.2, 1.08], [0, 1.2, 1.36], [0.2, 0.06], [0.12, 0.05], { bone: jaw, color: LIP });
  b.part(new THREE.BoxGeometry(0.15, 0.015, 0.22), INK, { bone: jaw, at: [0, 1.235, 1.2] });
  for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(0.012, 0.04, 5), IVORY, { bone: jaw, at: [s * 0.05, 1.24, 1.3] });

  // trunk
  const nose = b.surface(skull).nearest([0, 1.33, 1.55]);
  const trunk = b.sprout(
    "trunk",
    nose,
    catmull([
      [0, 1.33, 1.42],
      [0, 1.28, 1.62],
      [0, 1.1, 1.74],
      [0, 0.98, 1.64],
    ]),
    [0.09, 0.045],
    { count: 3, role: "tentacle", color: legPaint },
  );
  b.part(new THREE.SphereGeometry(0.048, 7, 5), CREAM, {
    bone: trunk.chain ? trunk.chain.joints[trunk.chain.joints.length - 1] : head,
    at: [0, 0.98, 1.64],
  });
  for (const k of [0.3, 0.55, 0.8]) {
    const tp = trunk.sweep.at(k, 0);
    b.stick(new THREE.CylinderGeometry(0.075 - k * 0.04, 0.075 - k * 0.04, 0.012, 10), VERM, tp, { embed: 0.1 });
  }

  for (const s of [1, -1]) {
    // tusks
    b.sweep(
      bezier([s * 0.1, 1.27, 1.3], [s * 0.2, 1.15, 1.38], [s * 0.2, 1.12, 1.55], [s * 0.14, 1.28, 1.66]),
      [0.035, 0.004],
      { bone: head, color: IVORY, caps: { start: "flat", end: "point" } },
    );
    // eyes
    b.part(new THREE.SphereGeometry(0.048, 8, 6), CREAM, { bone: head, at: [s * 0.14, 1.47, 1.1] });
    glow(
      b.part(new THREE.SphereGeometry(0.032, 8, 6), GOLD, {
        bone: head,
        at: [s * 0.166, 1.47, 1.125],
      }),
      1,
    );
    b.part(new THREE.SphereGeometry(0.017, 6, 5), INK, { bone: head, at: [s * 0.188, 1.47, 1.14] });
    b.rod([s * 0.1, 1.535, 1.0], [s * 0.195, 1.5, 1.2], 0.012, VERM, { bone: head });
    // nostril slits on snout
    b.part(new THREE.SphereGeometry(0.014, 5, 4), INK, { bone: head, at: [s * 0.045, 1.37, 1.4] });
    // ears: cream rim, indigo disc
    const ed: [number, number, number] = [s, 0.5, -0.25];
    b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.025, 10), CREAM, { bone: head, at: [s * 0.15, 1.6, 0.93], dir: ed });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.035, 10), INDIGO, { bone: head, at: [s * 0.155, 1.605, 0.93], dir: ed });
    // whisker rods
    for (const k of [0, 1]) {
      b.rod([s * 0.1, 1.34 - k * 0.03, 1.28], [s * 0.3, 1.36 - k * 0.07, 1.4], 0.004, INK, { bone: head });
    }
  }

  // ---------- flame mane ----------
  const flame = (at: [number, number, number], size: number, color: string, thick: number, bone: any) => {
    const o: [number, number][] = [
      [0, 0],
      [0.07, 0.03],
      [0.1, 0.12],
      [0.06, 0.2],
      [0.12, 0.3],
      [0, 0.26],
      [-0.06, 0.16],
      [-0.05, 0.06],
    ].map(([x, y]) => [x * size, y * size] as [number, number]);
    return b.extrude(o, { at, x: [0, 0, -1], thickness: thick, smoothing: 1, color, bone });
  };
  for (let i = 0; i < 6; i++) {
    const cp = neck.at(0.04 + i * 0.18);
    const sz = 1.5 - i * 0.12;
    const base: [number, number, number] = [cp.at.x, cp.at.y + 0.17, cp.at.z];
    flame(base, sz, VERM, 0.04, cp.bone);
    flame([base[0], base[1] + 0.02 * sz, base[2]], sz * 0.65, CREAM, 0.05, cp.bone);
    flame([base[0], base[1] + 0.04 * sz, base[2]], sz * 0.3, GOLD, 0.06, cp.bone);
  }
  for (let i = 0; i < 4; i++) {
    const cp = spine.at(0.1 + i * 0.27);
    const base: [number, number, number] = [cp.at.x, cp.at.y + 0.32, cp.at.z];
    flame(base, 1.15, VERM, 0.04, cp.bone);
    flame([base[0], base[1] + 0.02, base[2]], 0.7, CREAM, 0.05, cp.bone);
  }
  flame([0, 1.6, 1.0], 0.9, VERM, 0.04, head);
  flame([0, 1.62, 1.0], 0.5, GOLD, 0.05, head);

  return b.root;
}
```