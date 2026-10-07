```ts
import * as THREE from "three";
import { createBuilder, catmull, paint, mix, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Toco Toucan",
  description:
    "A perched toco toucan with an oversized two-part orange bill, blue eye patch, cream bib, white rump, red undertail, folded wings, fanned tail and zygodactyl feet, rigged in a rest pose.",
};

const BLACK = "#14141a";
const CREAM = "#f4efdc";
const RED = "#d8262b";
const WHITE = "#f7f5ee";

export default function build() {
  const b = createBuilder({ name: "toucan" });
  const sphere = (seg = 10) => new THREE.SphereGeometry(1, b.segments(seg), b.segments(Math.round(seg * 0.75)));

  // ---- skeleton ----
  b.joint("root", { at: [0, 0.19, -0.03] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.19, -0.03],
      [0, 0.25, 0.02],
      [0, 0.31, 0.05],
      [0, 0.37, 0.08],
    ]),
    { names: ["spine1", "spine2", "neck", "head"], role: "spine" },
  );
  b.joint("jaw", { parent: "head", at: [0, 0.34, 0.09], dir: [0, 0, 1], role: "jaw" });

  // ---- body ----
  const bodyPaint = paint((p, n) => {
    const front = smoothstep(-0.1, 0.25, n.z);
    let c = mix(BLACK, CREAM, smoothstep(0.275, 0.3, p.y) * front);
    const band = front * (1 - smoothstep(0, 0.012, Math.abs(p.y - 0.262) - 0.01));
    c = mix(c, RED, band);
    const rump = smoothstep(-0.3, -0.6, n.z) * smoothstep(0.14, 0.17, p.y) * smoothstep(0.26, 0.23, p.y);
    c = mix(c, WHITE, rump);
    const under = smoothstep(0.19, 0.15, p.y) * smoothstep(-0.03, -0.07, p.z);
    return mix(c, RED, under);
  });
  b.sweep(spine, (t) => 0.05 + 0.04 * Math.sin(Math.PI * Math.min(t * 1.1 + 0.1, 1)), {
    color: bodyPaint,
    caps: "round",
    name: "body",
  });
  // red undertail coverts
  b.part(sphere(), RED, { at: [0, 0.155, -0.085], bone: "root", scale: [0.05, 0.04, 0.055], name: "undertail" });

  // ---- head ----
  const headPaint = paint((p, n) => mix(BLACK, CREAM, smoothstep(0.375, 0.352, p.y) * smoothstep(-0.1, 0.3, n.z)));
  b.part(sphere(12), headPaint, { at: [0, 0.385, 0.085], bone: "head", scale: [0.052, 0.05, 0.058], name: "head" });

  const billPaint = paint((p, n) => {
    let c = mix("#f08a1a", "#f7c52b", smoothstep(0.5, 0.9, n.y) * 0.9);
    c = mix(c, BLACK, smoothstep(0.245, 0.255, p.z));
    return mix(c, BLACK, smoothstep(0.14, 0.125, p.z));
  });
  b.sweep(
    catmull([
      [0, 0.392, 0.1],
      [0, 0.39, 0.2],
      [0, 0.365, 0.275],
    ]),
    (t) => [0.034 * (1 - 0.8 * t * t) + 0.003, 0.048 * (1 - 0.85 * Math.pow(t, 1.6)) + 0.004],
    { color: billPaint, bone: "head", caps: "round", name: "upperBill" },
  );
  b.sweep(
    catmull([
      [0, 0.335, 0.1],
      [0, 0.337, 0.19],
      [0, 0.352, 0.255],
    ]),
    (t) => [0.026 * (1 - 0.75 * t) + 0.004, 0.022 * (1 - 0.7 * t) + 0.004],
    { color: billPaint, bone: "jaw", caps: "round", name: "lowerBill" },
  );

  // ---- per-side parts ----
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // nostril, eye patch, eye
    b.part(sphere(6), BLACK, { at: [s * 0.031, 0.402, 0.15], bone: "head", scale: [0.004, 0.007, 0.01] });
    b.part(sphere(8), "#2e86d6", { at: [s * 0.046, 0.395, 0.105], bone: "head", scale: [0.012, 0.027, 0.027], name: "eyePatch" + L });
    b.part(sphere(8), "#3a2412", { at: [s * 0.053, 0.397, 0.105], bone: "head", scale: 0.011, name: "eye" + L });
    b.part(sphere(6), BLACK, { at: [s * 0.061, 0.397, 0.107], bone: "head", scale: 0.0055 });
    b.part(sphere(5), "#ffffff", { at: [s * 0.062, 0.402, 0.112], bone: "head", scale: 0.0028 });

    // wing
    const wing = b.chain(
      "wing" + L,
      catmull([
        [s * 0.098, 0.315, 0.03],
        [s * 0.108, 0.23, -0.06],
        [s * 0.11, 0.14, -0.16],
      ]),
      { names: ["shoulder" + L, "wrist" + L, "wingTip" + L], role: "wing", parent: "spine2" },
    );
    const pts = (a: number[][]) => a.map(([u, v]) => [s * u, v] as [number, number]);
    const xdir = [0, 0, -s];
    b.extrude(
      pts([
        [0, 0],
        [0.06, 0.01],
        [0.12, -0.03],
        [0.18, -0.12],
        [0.25, -0.2],
        [0.22, -0.22],
        [0.14, -0.18],
        [0.05, -0.14],
        [0, -0.06],
      ]),
      { color: "#101014", at: [s * 0.102, 0.32, 0.035], x: xdir, y: [0, 1, 0], thickness: 0.014, bevel: 0.004, smoothing: 1, bone: "shoulder" + L, name: "wing" + L },
    );
    b.extrude(
      pts([
        [0.0, -0.01],
        [0.05, -0.0],
        [0.1, -0.04],
        [0.13, -0.09],
        [0.07, -0.1],
        [0.02, -0.07],
      ]),
      { color: "#26304a", at: [s * 0.108, 0.32, 0.035], x: xdir, y: [0, 1, 0], thickness: 0.012, bevel: 0.003, smoothing: 1, bone: "shoulder" + L, name: "coverts" + L },
    );
    void wing;

    // leg
    const foot: [number, number, number] = [s * 0.05, 0.009, 0.02];
    const leg = b.chain(
      "leg" + L,
      [
        [s * 0.05, 0.14, 0.0],
        [s * 0.052, 0.075, 0.012],
        foot,
      ],
      { names: ["hip" + L, "ankle" + L, "foot" + L], role: "leg", parent: "root" },
    );
    b.sweep(leg, [0.017, 0.012], { color: "#6f8fa8", caps: "round", name: "leg" + L });
    const toes = [
      [0.3, 1, 0.055],
      [-0.3, 1, 0.055],
      [0.35, -1, 0.045],
      [-0.35, -1, 0.045],
    ];
    toes.forEach(([dx, dz, len], k) => {
      const d = new THREE.Vector3(dx * s, 0, dz).normalize().multiplyScalar(len);
      const end: [number, number, number] = [foot[0] + d.x, foot[1], foot[2] + d.z];
      const toe = b.chain(`toe${L}${k + 1}`, [foot, end], { names: [`toe${L}${k + 1}`], role: "digit", parent: leg.tip! });
      b.sweep(toe, [0.009, 0.0065], { color: "#6f8fa8", caps: "round", name: `toe${L}${k + 1}` });
    });
  }

  // ---- tail ----
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.17, -0.06],
      [0, 0.12, -0.14],
      [0, 0.07, -0.22],
      [0, 0.04, -0.29],
    ]),
    { names: ["tail1", "tail2", "tail3", "tail4"], role: "tail", parent: "root" },
  );
  b.sweep(tail, (t) => [0.035 + 0.012 * t, 0.007], {
    section: "box",
    color: BLACK,
    bands: [
      [0.9, "#15151c"],
      [1, "#3a3f55"],
    ],
    caps: "round",
    name: "tail",
  });

  return b.root;
}
```