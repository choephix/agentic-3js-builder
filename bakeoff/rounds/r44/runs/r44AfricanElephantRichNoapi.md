```ts
import * as THREE from "three";
import { createBuilder, rng, limb, catmull, bezier, mix, noise, paint, smoothstep } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "African Bush Elephant",
  description:
    "Low-poly adult bull African bush elephant with a wrinkled trunk, big fan ears, curved ivory tusks, pillar legs with toenails and a tufted tail.",
};

const SKIN = "#8b857c";
const SKIN_D = "#5f5a54";
const MUD = "#9a7a58";
const IVORY = "#efe4c4";
const NAIL = "#d9ccb0";
const EAR_IN = "#b18f86";
const EYE = "#1a120e";

const skinPaint = paint((p, n) => {
  let c = mix(SKIN_D, SKIN, 0.5 + 0.5 * smoothstep(-0.8, 0.6, n.y));
  c = mix(c, "#a8a299", smoothstep(0.55, 0.8, noise(p, 0.3, 3)) * 0.4);
  c = mix(c, SKIN_D, smoothstep(0.55, 0.8, noise(p, 0.06, 8)) * 0.35);
  c = mix(c, MUD, smoothstep(0.9, 0.2, p.y) * (0.4 + 0.5 * noise(p, 0.15, 5)));
  return c;
});
const trunkPaint = paint((p, n) => {
  const ring = Math.sin(p.y * 38 + p.z * 10);
  let c = mix(SKIN_D, SKIN, 0.5 + 0.5 * smoothstep(-0.8, 0.6, n.y));
  c = mix(c, SKIN_D, smoothstep(0.5, 1, ring) * 0.55);
  return mix(c, MUD, smoothstep(0.6, 0.1, p.y) * 0.5);
});
const earPaint = paint((p, n) => {
  if (Math.abs(n.z) > 0.5 || Math.abs(n.x) > 0.5) {
    const v = Math.sin(p.y * 22 + p.z * 5) * 0.5 + 0.5;
    return mix(mix(SKIN, EAR_IN, 0.5), SKIN_D, v * 0.3 + 0.2 * noise(p, 0.12, 2));
  }
  return SKIN_D;
});

export default function build() {
  const b = createBuilder({ name: "elephant", paintSize: 1024 });
  const r = rng(5);

  // skeleton
  const hips = b.joint("hips", { at: [0, 2.1, -1.0], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 2.1, -1.0], [0, 2.2, 0.0], [0, 2.2, 1.0]]), {
    parent: hips, role: "spine", names: ["spine1", "chest"],
  });
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 2.3, 1.4], dir: [0, 0, 1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.4, 1.6], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.85, 2.0], aim: [0, 1.8, 2.5], role: "jaw" });
  const trunk = b.chain("trunk", catmull([[0, 2.3, 2.35], [0, 1.65, 2.8], [0, 0.85, 3.05], [0, 0.3, 3.15]]), {
    parent: head, role: "tentacle", names: ["trunk1", "trunk2", "trunk3"],
  });
  const tail = b.chain("tail", catmull([[0, 2.55, -1.75], [0, 2.1, -1.95], [0, 1.5, -1.95]]), {
    parent: hips, role: "tail", names: ["tail1", "tail2"],
  });

  // body
  b.loft(
    [
      { at: [0, 2.2, -1.85], w: 1.0, h: 1.3 },
      { at: [0, 2.15, -1.2], w: 1.6, h: 1.8 },
      { at: [0, 2.1, -0.2], w: 1.7, h: 1.95 },
      { at: [0, 2.15, 0.8], w: 1.7, h: 2.0 },
      { at: [0, 2.2, 1.4], w: 1.4, h: 1.8 },
    ],
    { bone: hips, color: skinPaint, sides: 10, caps: { start: "round", end: "flat" }, name: "body" },
  );
  // back hump and belly ridge
  b.part(new THREE.IcosahedronGeometry(0.6, 0), skinPaint, { bone: chest, at: [0, 3.05, 0.9], scale: [1.1, 0.5, 1.3], flat: true, name: "shoulderHump" });

  // head
  b.loft(
    [
      { at: [0, 2.45, 1.3], w: 1.3, h: 1.6 },
      { at: [0, 2.5, 1.7], w: 1.25, h: 1.6 },
      { at: [0, 2.35, 2.1], w: 0.8, h: 1.2 },
      { at: [0, 2.2, 2.4], w: 0.5, h: 0.8 },
    ],
    { bone: head, color: skinPaint, sides: 10, caps: { start: "round", end: "flat" }, name: "skull" },
  );
  b.part(new THREE.IcosahedronGeometry(0.45, 0), skinPaint, { bone: head, at: [0, 3.15, 1.65], scale: [1.1, 0.8, 0.9], flat: true, name: "forehead" });
  b.loft(
    [
      { at: [0, 1.85, 1.8], w: 0.5, h: 0.3 },
      { at: [0, 1.8, 2.15], w: 0.4, h: 0.25 },
      { at: [0, 1.8, 2.45], w: 0.28, h: 0.2 },
    ],
    { bone: jaw, color: SKIN_D, sides: 6, name: "lowerJaw" },
  );

  // trunk
  b.sweep(trunk, [0.3, 0.26, 0.2, 0.15, 0.12], { color: trunkPaint, sides: 8, caps: "round", name: "trunk" });
  const tipP = trunk.at(1).at;
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.035, 5, 4), EYE, { bone: trunk.joints[2], at: [s * 0.05, 0.3, 3.2], flat: true, name: "nostril" });
  b.part(new THREE.SphereGeometry(0.1, 6, 4), SKIN_D, { bone: trunk.joints[2], at: [tipP.x, tipP.y + 0.06, tipP.z + 0.04], scale: [0.8, 0.6, 1.2], flat: true, name: "trunkFinger" });

  // eyes, tusks
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.06, 6, 5), EYE, { bone: head, at: [s * 0.6, 2.5, 1.95], flat: true, name: "eye" });
    b.part(new THREE.SphereGeometry(0.014, 4, 3), "#ffffff", { bone: head, at: [s * 0.63, 2.53, 2.0], flat: true, name: "eyeGlint" });
    b.capsule([s * 0.52, 2.62, 1.88], [s * 0.7, 2.6, 2.0], 0.04, { bone: head, color: SKIN_D, sides: 5, name: "brow" });
    b.part(new THREE.IcosahedronGeometry(0.2, 0), SKIN_D, { bone: head, at: [s * 0.55, 2.0, 2.0], scale: [0.8, 0.9, 1], flat: true, name: "tuskBase" });
    b.sweep(
      bezier([s * 0.45, 1.95, 2.05], [s * 0.7, 1.3, 2.5], [s * 0.75, 0.95, 3.2], [s * 0.6, 1.25, 3.9]),
      [0.11, 0.02],
      { bone: head, color: IVORY, sides: 6, caps: { start: "flat", end: "point" }, name: "tusk" },
    );
    // ears
    const ear = b.joint(s > 0 ? "earL" : "earR", { parent: head, at: [s * 0.6, 2.95, 1.45], dir: [s, 0, 0], role: "hinge" });
    const outline: OutlinePoint[] = [
      [0, 0.5], [0.35, 0.75], [0.85, 0.55], [1.05, 0], [0.9, -0.6], [0.55, -1.0], [0.2, -0.75], [0, -0.3],
    ];
    b.extrude(outline, { at: [s * 0.6, 2.95, 1.45], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.06, bevel: 0.015, color: earPaint, bone: ear, name: "ear" });
  }

  // legs
  const legR = [0.34, 0.3, 0.26, 0.27];
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const z = front ? 0.95 : -1.2;
      const pts = limb([s * 0.55, 1.7, z], [s * 0.55, 0.0, z + 0.05], [0.9, 0.9], [[0, 0, front ? -1 : 1]]);
      const names = front ? [`shoulder${k}`, `elbow${k}`, `foot${k}`] : [`hip${k}`, `knee${k}`, `footH${k}`];
      const leg = b.chain(`leg${front ? "F" : "H"}${k}`, pts, {
        parent: front ? chest : hips, role: "leg", names, contact: [s * 0.55, 0, z + 0.05],
      });
      b.sweep(leg, legR, { color: skinPaint, sides: 8, name: `leg${front ? "F" : "H"}${k}` });
      const foot = leg.tip ?? leg.joints[leg.joints.length - 1];
      b.part(new THREE.CylinderGeometry(0.29, 0.33, 0.22, 8), SKIN_D, { bone: foot, at: [s * 0.55, 0.11, z + 0.05], name: "foot" });
      for (let i = -1; i <= 1; i++)
        b.part(new THREE.SphereGeometry(0.07, 5, 4), NAIL, {
          bone: foot, at: [s * 0.55 + i * 0.14, 0.09, z + 0.05 + 0.3 - Math.abs(i) * 0.04], scale: [1, 0.8, 0.7], flat: true, name: "toenail",
        });
    }
  }

  // tail
  b.sweep(tail, [0.09, 0.05, 0.03], { color: skinPaint, sides: 6, name: "tail" });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.spike([Math.cos(a) * 0.02, 1.55, -1.95 + Math.sin(a) * 0.02], [Math.cos(a) * 0.5, -1, Math.sin(a) * 0.5 - 0.1], 0.3 + 0.1 * r(), 0.025, {
      bone: tail.joints[1], color: "#2a2420", sides: 4, name: "tailHair",
    });
  }

  return b.root;
}
```