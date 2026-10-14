```ts
import * as THREE from "three";
import { createBuilder, paint, rng } from "agentic-3js-builder";
import { catmull, limb } from "agentic-3js-builder";

export const meta = {
  name: "Toucan",
  description:
    "A perched keel-billed toucan: rigged body, neck, head with separate upper and lower beak, folded wings, tail and zygodactyl feet.",
};

const BLACK = "#101116";
const BIB = "#fff1a8";
const RED = "#d92a1f";
const LEG = "#7aa0b8";
const WING = "#15161c";
const COVERT = "#252a3c";

export default function build() {
  const b = createBuilder({ name: "toucan" });
  void rng;

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.24, -0.03], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.24, -0.03],
      [0, 0.32, 0.04],
      [0, 0.4, 0.08],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.4, 0.08],
      [0, 0.45, 0.11],
      [0, 0.5, 0.14],
    ]),
    { parent: spine.joints[1], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.5, 0.14], dir: [0, 0.2, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.04, up: -0.02 }),
    aim: head.local({ forward: 0.2, up: -0.03 }),
    role: "jaw",
  });

  // ---------- body ----------
  b.sweep(spine, (t) => [0.07 + 0.018 * Math.sin(Math.PI * t), 0.08 + 0.018 * Math.sin(Math.PI * t)], {
    color: BLACK,
    extend: [0.05, 0],
    sectors: [[135, 225, BIB, 0.45, 1]],
    sides: 10,
  });
  b.sweep(neck, [0.058, 0.05], {
    color: BLACK,
    sectors: [[120, 240, BIB]],
    sides: 8,
  });

  // red undertail coverts and pale rump
  b.part(new THREE.SphereGeometry(0.05, 8, 6), RED, { bone: hips, at: [0, 0.185, -0.075], scale: [1, 0.9, 1.2] });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), BIB, { bone: hips, at: [0, 0.255, -0.11], scale: [1, 0.7, 1] });

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(0.06, 10, 8), BLACK, { bone: head, at: head.local({ forward: 0.02 }) });
  b.part(new THREE.SphereGeometry(0.05, 8, 6), BIB, {
    bone: head,
    at: head.local({ forward: 0.03, up: -0.028 }),
    scale: [0.95, 0.85, 1],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.021, 8, 6), "#2fb4e0", {
      bone: head,
      at: head.local({ left: s * 0.052, up: 0.016, forward: 0.03 }),
      scale: [0.6, 1, 1],
    });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), "#0a0a0c", {
      bone: head,
      at: head.local({ left: s * 0.058, up: 0.016, forward: 0.033 }),
    });
    b.part(new THREE.SphereGeometry(0.0035, 4, 3), "#ffffff", {
      bone: head,
      at: head.local({ left: s * 0.067, up: 0.02, forward: 0.036 }),
    });
  }

  // ---------- beak ----------
  const upperPaint = paint((p, n) => {
    if (p.z > 0.345) return "#a81a14";
    if (p.z > 0.31) return RED;
    if (n.y > 0.75 && p.z < 0.3) return "#ffe94a";
    if (p.z > 0.26) return "#ff8a1f";
    if (p.z > 0.21) return "#ffc21f";
    return "#7cc84a";
  });
  b.loft(
    [
      { at: head.local({ forward: 0.05, up: 0.005 }), w: 0.05, h: 0.058 },
      { at: head.local({ forward: 0.11, up: 0.0 }), w: 0.046, h: 0.054 },
      { at: head.local({ forward: 0.17, up: -0.012 }), w: 0.032, h: 0.042 },
      { at: head.local({ forward: 0.22, up: -0.035 }), w: 0.012, h: 0.016 },
    ],
    { bone: head, color: upperPaint, name: "beakUpper" },
  );
  const lowerPaint = paint((p, _n) => {
    if (p.z > 0.33) return "#a81a14";
    if (p.z > 0.28) return RED;
    if (p.z > 0.22) return "#ff8a1f";
    return "#7cc84a";
  });
  b.loft(
    [
      { at: head.local({ forward: 0.05, up: -0.03 }), w: 0.045, h: 0.035 },
      { at: head.local({ forward: 0.11, up: -0.032 }), w: 0.04, h: 0.033 },
      { at: head.local({ forward: 0.17, up: -0.04 }), w: 0.026, h: 0.026 },
      { at: head.local({ forward: 0.21, up: -0.055 }), w: 0.01, h: 0.012 },
    ],
    { bone: jaw, color: lowerPaint, name: "beakLower" },
  );

  // ---------- wings ----------
  const wingX: [number, number, number] = [0, -0.8, -0.6];
  const wingY: [number, number, number] = [0, 0.6, -0.8];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wj = b.joint(`wing${side}`, {
      parent: spine.joints[1],
      at: [s * 0.09, 0.39, 0.04],
      dir: wingX,
      role: "wing",
    });
    b.extrude(
      [
        [0, -0.035],
        [0.1, -0.055],
        [0.2, -0.05],
        [0.28, -0.02],
        [0.3, 0.0, "sharp"],
        [0.2, 0.045],
        [0.1, 0.07],
        [0, 0.06],
      ],
      { at: [s * 0.09, 0.39, 0.04], x: wingX, y: wingY, thickness: 0.02, bevel: 0.004, smoothing: 1, color: WING, bone: wj },
    );
    b.extrude(
      [
        [0.0, -0.03],
        [0.1, -0.045],
        [0.17, -0.03],
        [0.15, 0.02],
        [0.05, 0.045],
        [0, 0.04],
      ],
      { at: [s * 0.098, 0.385, 0.035], x: wingX, y: wingY, thickness: 0.012, smoothing: 1, color: COVERT, bone: wj },
    );
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.22, -0.07],
      [0, 0.15, -0.16],
      [0, 0.07, -0.25],
    ]),
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );
  b.sweep(tail, (t) => [0.035 + 0.02 * t, 0.012], { section: "box", caps: "flat", color: BLACK });

  // ---------- legs and feet ----------
  const toeDirs: [number, number][] = [
    [0.3, 1],
    [-0.3, 1],
    [0.25, -1],
    [-0.25, -1],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb(
      [s * 0.045, 0.19, 0.0],
      [s * 0.05, 0.011, 0.02],
      [0.1, 0.1],
      [[0, 0, 1]],
    );
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.017, 0.011], { color: LEG, sides: 6 });
    const foot = pts[pts.length - 1];
    toeDirs.forEach(([dx, dz], k) => {
      const d = new THREE.Vector3(dx, 0, dz).normalize();
      const len = dz > 0 ? 0.065 : 0.045;
      const tj = b.joint(`toe${k + 1}${side}`, {
        parent: leg.tip ?? leg.joints[leg.joints.length - 1],
        at: foot,
        dir: d,
        role: "digit",
      });
      const tip = foot.clone().addScaledVector(d, len);
      b.capsule(foot, tip, [0.011, 0.007], { bone: tj, color: LEG, sides: 6 });
    });
  }

  return b.root;
}
```