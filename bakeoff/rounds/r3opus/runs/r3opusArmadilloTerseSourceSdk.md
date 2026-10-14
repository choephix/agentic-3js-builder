```ts
import * as THREE from "three";
import {
  createBuilder,
  paint,
  scales,
  mottle,
  mix,
  rgb,
  smoothstep,
  catmull,
  polyline,
  rng,
} from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";

export const meta = {
  name: "Nine-banded Armadillo",
  description:
    "A stylized nine-banded armadillo: domed shell with pelvic and scapular shields and nine scute bands, plated head shield, tall pink ears, ringed armoured tail and digging claws. Rigged with spine, neck, head, jaw, tail and four leg chains.",
};

export default function build() {
  const b = createBuilder({ name: "armadillo", paintSize: 2048 });

  // ---------------- Palette & paints ----------------
  const EDGE = rgb("#5a4029");
  const TONES = ["#cfa970", "#c39b62", "#d8b680"];
  const shieldScales = scales(TONES, "#5a4029", { size: 0.016, width: 0.16, seed: 3 });
  const headShield = scales(TONES, "#5a4029", { size: 0.008, width: 0.18, seed: 5 });
  const skin = mottle("#dcaa98", "#c99282", { size: 0.02, seed: 2 });
  const legPaint = scales(["#b9957c", "#a9866e", "#c09c82"], "#6b4c3c", { size: 0.007, seed: 4 });

  const B0 = 0.34;
  const B1 = 0.64;
  const shell = paint((p, n, s) => {
    const t = s[0];
    const deg = s[1] > 180 ? s[1] - 360 : s[1];
    let c: Rgb;
    if (t < B0 || t > B1) c = shieldScales.at(p, n);
    else {
      const u = ((t - B0) / (B1 - B0)) * 9;
      const bi = Math.min(Math.floor(u), 8);
      const f = u - bi;
      const col = (deg + 180) / 7 + (bi % 2) * 0.5;
      const ci = Math.floor(col);
      const g = col - ci;
      if (f < 0.12 || g < 0.1 || g > 0.92) c = EDGE;
      else {
        const tone = TONES[Math.abs(ci * 7 + bi * 5) % 3];
        c = mix(tone, "#f2dcae", 0.35 * (1 - (f - 0.12) / 0.88));
      }
    }
    return mix(c, "#5e4530", 0.5 * smoothstep(78, 104, Math.abs(deg)));
  });

  const tailPaint = paint((p, n, s) => {
    const u = s[0] * 13;
    const k = Math.floor(u);
    const f = u - k;
    const col = (s[1] / 360) * 12 + (k % 2) * 0.5;
    const g = col - Math.floor(col);
    if (f < 0.16 || g < 0.08) return EDGE;
    return mix(k % 2 ? "#cba672" : "#bf975f", "#ecd3a0", (1 - f) * 0.3);
  });

  // ---------------- Skeleton ----------------
  const hips = b.joint("hips", { at: [0, 0.15, -0.14], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.15, -0.14],
      [0, 0.162, -0.02],
      [0, 0.155, 0.09],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    polyline([
      [0, 0.155, 0.09],
      [0, 0.148, 0.165],
    ]),
    { parent: "chest", names: ["neck", "head"], role: "neck" },
  );
  const head = neck.joints[1];
  b.joint("jaw", { parent: head, at: [0, 0.12, 0.18], aim: [0, 0.095, 0.28], role: "jaw" });

  const tailChain = b.chain(
    "tail",
    catmull([
      [0, 0.13, -0.19],
      [0, 0.115, -0.29],
      [0, 0.088, -0.39],
      [0, 0.055, -0.49],
    ]),
    { parent: hips, count: 4, role: "tail" },
  );

  // ---------------- Body / shell ----------------
  const bodyPath = catmull([
    [0, 0.125, -0.2],
    [0, 0.15, -0.12],
    [0, 0.162, -0.01],
    [0, 0.155, 0.08],
    [0, 0.138, 0.14],
  ]);
  const rFn = (t: number): [number, number] => {
    const k = Math.sqrt(Math.max(Math.sin(Math.PI * (0.08 + 0.84 * t)), 0));
    return [0.108 * k, 0.094 * k];
  };
  const body = b.sweep(bodyPath, rFn, {
    color: skin,
    sectors: [[-105, 105, shell]],
    bone: spine,
    sides: 24,
    name: "body",
  });

  // Shell rims
  for (const a of [-105, 105])
    b.sweep(body.line(a, 0.002), 0.006, { color: "#6e5236", bone: spine, sides: 6 });

  // Band ridges
  for (let k = 0; k <= 9; k++) {
    const t = B0 + (k * (B1 - B0)) / 9;
    const pts: THREE.Vector3[] = [];
    for (let d = -102; d <= 102; d += 12) pts.push(body.at(t, d, 0.0015).at);
    b.sweep(catmull(pts), 0.0042, { color: k === 0 || k === 9 ? "#6e5236" : "#7d5d3d", bone: spine, sides: 6 });
  }

  // Sparse belly hairs
  const r = rng(11);
  for (let i = 0; i < 22; i++) {
    const t = 0.15 + 0.7 * r();
    const d = 180 + (r() - 0.5) * 110;
    const pt = body.at(t, d);
    b.spike(pt, pt, 0.016 + 0.01 * r(), 0.0012, { color: "#ead6c4", sides: 3 });
  }

  // ---------------- Tail ----------------
  b.sweep(tailChain, (t: number) => 0.03 * (1 - t) + 0.006, { color: tailPaint, sides: 10 });

  // ---------------- Legs ----------------
  const leg = (x: number, front: boolean) => {
    const s = x > 0 ? "L" : "R";
    const pts = front
      ? [
          [0.058 * x, 0.12, 0.09],
          [0.085 * x, 0.068, 0.08],
          [0.09 * x, 0.018, 0.1],
          [0.092 * x, 0.012, 0.135],
        ]
      : [
          [0.06 * x, 0.115, -0.12],
          [0.085 * x, 0.07, -0.085],
          [0.09 * x, 0.018, -0.13],
          [0.092 * x, 0.013, -0.075],
        ];
    const names = (front ? ["shoulder", "elbow", "wrist", "hand"] : ["hip", "knee", "ankle", "foot"]).map(
      (n) => n + s,
    );
    const c = b.chain(front ? "arm" + s : "leg" + s, polyline(pts), {
      parent: front ? "chest" : hips,
      names,
      role: "leg",
    });
    b.sweep(c, front ? [0.03, 0.02, 0.016, 0.012] : [0.036, 0.025, 0.017, 0.013], {
      color: legPaint,
      sides: 10,
    });
    const tip = c.joints[3];
    const toe = pts[3];
    const offs = front ? [-0.012, -0.004, 0.004, 0.012] : [-0.014, -0.007, 0, 0.007, 0.014];
    const lens = front ? [0.013, 0.023, 0.025, 0.015] : [0.01, 0.015, 0.017, 0.015, 0.011];
    offs.forEach((o, i) => {
      b.spike([toe[0] + o, toe[1] - 0.002, toe[2] + 0.004], [o * 3, -0.35, 1], lens[i], front ? 0.0038 : 0.003, {
        color: "#2e231c",
        bone: tip,
        sides: 5,
      });
    });
  };
  leg(1, true);
  leg(-1, true);
  leg(1, false);
  leg(-1, false);

  // ---------------- Head ----------------
  const headSweep = b.loft(
    [
      { at: [0, 0.148, 0.15], w: 0.07, h: 0.065 },
      { at: [0, 0.15, 0.185], w: 0.068, h: 0.06 },
      { at: [0, 0.135, 0.225], w: 0.042, h: 0.036 },
      { at: [0, 0.118, 0.265], w: 0.027, h: 0.024 },
      { at: [0, 0.106, 0.298], w: 0.018, h: 0.017 },
    ],
    { color: skin, sectors: [[-78, 78, headShield, 0, 0.7]], bone: "head", sides: 14, name: "head" },
  );
  b.loft(
    [
      { at: [0, 0.124, 0.175], w: 0.045, h: 0.024 },
      { at: [0, 0.112, 0.225], w: 0.03, h: 0.018 },
      { at: [0, 0.101, 0.268], w: 0.018, h: 0.012 },
      { at: [0, 0.097, 0.285], w: 0.012, h: 0.009 },
    ],
    { color: "#d3a090", bone: "jaw", sides: 10, name: "lowerJaw" },
  );

  // Nose
  b.part(new THREE.SphereGeometry(0.0105, 10, 8), "#6e3f3b", {
    at: [0, 0.106, 0.307],
    scale: [1, 0.85, 0.6],
    bone: "head",
  });
  for (const x of [0.004, -0.004])
    b.part(new THREE.SphereGeometry(0.0025, 6, 5), "#2a1714", { at: [x, 0.107, 0.3125], bone: "head" });

  // Eyes
  for (const side of [1, -1]) {
    const e = headSweep.at(0.42, side > 0 ? -70 : 70);
    b.stick(new THREE.SphereGeometry(0.0075, 10, 8), "#1b1310", e, { embed: 0.45, bone: "head" });
    b.part(new THREE.SphereGeometry(0.0022, 6, 5), "#ffffff", {
      at: e.at.clone().addScaledVector(e.n, 0.0075).add(new THREE.Vector3(0, 0.0025, 0.0015)),
      bone: "head",
    });
  }

  // Ears
  const earOutline: [number, number][] = [
    [0, 0],
    [0.014, 0.008],
    [0.018, 0.028],
    [0.01, 0.046],
    [0, 0.052],
    [-0.01, 0.046],
    [-0.018, 0.028],
    [-0.014, 0.008],
  ];
  const innerOutline = earOutline.map(([x, y]) => [x * 0.62, y * 0.65 + 0.008] as [number, number]);
  for (const side of [1, -1]) {
    const pt = headSweep.at(0.14, side > 0 ? -42 : 42);
    const n = new THREE.Vector3(0.5 * side, 0, 0.85).normalize();
    const y = new THREE.Vector3(0.35 * side, 0.94, 0).normalize();
    const x = new THREE.Vector3().crossVectors(y, n).normalize();
    const base = pt.at.clone().addScaledVector(pt.n, -0.004);
    b.extrude(earOutline, {
      color: "#d29b8b",
      at: base,
      x,
      y,
      thickness: 0.004,
      smoothing: 1,
      bevel: 0.001,
      bone: "head",
    });
    b.extrude(innerOutline, {
      color: "#a8615a",
      at: base.clone().addScaledVector(n, 0.0025),
      x,
      y,
      thickness: 0.002,
      smoothing: 1,
      bone: "head",
    });
  }

  return b.root;
}
```