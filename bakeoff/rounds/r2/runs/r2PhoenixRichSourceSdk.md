```ts
import * as THREE from "three";
import { createBuilder, catmull, scales, rng } from "agentic-3js-builder";

export const meta = {
  name: "Rising Phoenix",
  description:
    "A phoenix rising with wings flung open: crimson-to-gold feathers, flame crest, ribbon tail feathers, amber eyes, golden hooked beak and drifting embers.",
};

const PAL = [
  "#7a0614", "#a8101a", "#d4261a", "#f0481a", "#ff7a1a",
  "#ff9f1c", "#ffbf26", "#ffd63a", "#ffe978", "#fff1a8",
];
const P = (x: number) => PAL[Math.max(0, Math.min(9, Math.round(x)))];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const rand = rng(11);

  // ---- skeleton: spine, neck, head, jaw
  b.joint("root", { at: [0, 1.4, -0.1], dir: [0, 0.2, 1] });
  const spine = b.chain("spine", catmull([[0, 1.3, -0.4], [0, 1.45, 0], [0, 1.62, 0.4]]), {
    parent: "root", role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 1.62, 0.4], [0, 1.9, 0.72], [0, 2.2, 0.92]]), {
    parent: "spine2", role: "neck", names: ["neck1", "neck2", "head"],
  });
  b.joint("jaw", { parent: "head", at: [0, 2.21, 1.04], dir: [0, 0, 1], role: "jaw" });

  // ---- body
  const bodyPaint = scales(["#8e0b18", "#a8101a", "#c01a1a"], "#5e0510", { size: 0.07, seed: 3 });
  b.sweep(spine, [0.09, 0.19, 0.2, 0.13], { color: bodyPaint, name: "body" });
  const neckPaint = scales(["#d8321a", "#e8501a", "#f26a1a"], "#9a1c10", { size: 0.05, seed: 5 });
  b.sweep(neck, [0.115, 0.085, 0.07], { color: neckPaint, name: "neck" });

  // ---- head
  const headPaint = scales(["#f26a1a", "#ff8a1c", "#ffa626"], "#c4380f", { size: 0.04, seed: 8 });
  b.part(new THREE.SphereGeometry(0.1, 10, 8), headPaint, {
    at: [0, 2.27, 0.99], scale: [0.9, 0.95, 1.25], bone: "head", name: "skull",
  });
  b.sweep(catmull([[0, 2.27, 1.07], [0, 2.275, 1.19], [0, 2.22, 1.27]]), {
    radius: [0.05, 0.035, 0.01], color: "#f2b330", bone: "head", caps: { start: "round", end: "point" },
    sides: 6, name: "beakUpper",
  });
  b.sweep([V(0, 2.21, 1.05), V(0, 2.2, 1.17)], {
    radius: [0.035, 0.012], color: "#d89a22", bone: "jaw", caps: { start: "round", end: "point" },
    sides: 6, name: "beakLower",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 8, 6), "#ffb400", { at: [s * 0.088, 2.3, 1.03], bone: "head", name: "eye" });
    b.part(new THREE.SphereGeometry(0.014, 6, 5), "#3a0a05", { at: [s * 0.108, 2.3, 1.045], bone: "head", name: "pupil" });
  }
  // flame crest
  for (let j = -2; j <= 2; j++) {
    const a = 2 - Math.abs(j);
    const pts = [
      V(0, 2.33, 0.99),
      V(j * 0.05, 2.5 + 0.05 * a, 0.88 - 0.04 * a),
      V(j * 0.1, 2.62 + 0.13 * a, 0.62 - 0.1 * a),
    ];
    b.sweep(catmull(pts), {
      radius: (t: number) => [0.04 * Math.max(Math.sin(Math.PI * Math.pow(t, 0.6)), 0.25 * (1 - t)), 0.008] as [number, number],
      bands: [[0.4, P(4)], [0.75, P(6)], [1, P(9)]],
      bone: "head", up: [1, 0, 0], caps: { start: "flat", end: "point" }, sides: 6, name: "crest",
    });
  }

  // ---- feathers
  const feather = (root: THREE.Vector3, dir: THREE.Vector3, L: number, w: number, k: number, bone: any, name: string) => {
    const d = dir.clone().normalize();
    const mid = root.clone().addScaledVector(d, L * 0.5).add(V(0, 0.02 * L, 0));
    const tip = root.clone().addScaledVector(d, L).add(V(0, 0.08 * L, 0));
    b.sweep(catmull([root, mid, tip]), {
      radius: (t: number) => [w * Math.max(Math.sin(Math.PI * Math.pow(t, 0.7)), 0.25 * (1 - t)), 0.007] as [number, number],
      bands: [[0.45, P(k)], [0.8, P(k + 2)], [1, P(k + 4)]],
      bone, up: [0, 1, 0], caps: { start: "flat", end: "point" }, sides: 6, name,
    });
  };

  // ---- wings and legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${S}`,
      catmull([[s * 0.18, 1.6, 0.25], [s * 0.85, 1.9, 0.15], [s * 1.6, 2.35, -0.05], [s * 2.3, 2.95, -0.25]]),
      { parent: "spine2", role: "wing", names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `wingTip${S}`] },
    );
    b.sweep(wing, [0.075, 0.055, 0.035, 0.02], { color: "#a8101a", name: `wingArm${S}` });

    const N = 14;
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      const t = 0.1 + 0.88 * u;
      const root = wing.at(t).at;
      const dir = V(s * (0.2 + 0.9 * u), 0.1 + 0.5 * u * u, -(1 - 0.5 * u));
      feather(root, dir, 0.5 + 0.7 * u, 0.05 + 0.02 * u, u * 5, wing.jointAt(t), `flight${S}`);
    }
    const M = 12;
    for (let i = 0; i < M; i++) {
      const u = i / (M - 1);
      const t = 0.08 + 0.77 * u;
      const root = wing.at(t).at.add(V(0, 0.016, 0.03));
      const dir = V(s * (0.15 + 0.7 * u), 0.0 + 0.3 * u * u, -(1 - 0.4 * u));
      feather(root, dir, 0.3 + 0.25 * u, 0.04 + 0.015 * u, u * 4 - 0.5, wing.jointAt(t), `covert${S}`);
    }

    const leg = b.chain(
      `leg${S}`,
      catmull([[s * 0.12, 1.3, 0.0], [s * 0.14, 1.12, 0.2], [s * 0.14, 0.95, -0.05], [s * 0.14, 0.88, 0.05]]),
      { parent: "root", role: "leg", names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`] },
    );
    b.sweep(leg, [0.055, 0.035, 0.026, 0.022], { color: "#d9962a", name: `leg${S}` });
    const fp = leg.at(1).at;
    const toes: Array<[number, number, number]> = [[s * 0.3, -0.35, 1], [0, -0.35, 1], [-s * 0.3, -0.35, 1], [0, -0.3, -1]];
    for (const d of toes) b.spike(fp, V(d[0], d[1], d[2]), 0.14, 0.014, { color: "#f2b330", bone: leg.tip!, name: `toe${S}` });
  }

  // ---- tail
  const tail = b.chain("tail", catmull([[0, 1.3, -0.4], [0, 1.2, -0.85], [0, 1.08, -1.25]]), {
    parent: "root", role: "tail", names: ["tail1", "tail2"],
  });
  b.sweep(tail, [0.1, 0.065, 0.03], { color: "#a8101a", name: "tailBase" });
  for (let j = -3; j <= 3; j++) {
    const aj = Math.abs(j);
    const ey = aj === 0 ? 0.06 : 0.22 + 0.14 * aj;
    const zEnd = -1.75 - (3 - aj) * 0.25;
    const sg = j === 0 ? 1 : Math.sign(j);
    const pts = [0, 0.3, 0.65, 1].map((f) =>
      V(
        j * (0.03 + 0.5 * f) * 0.7 + sg * Math.sin(f * Math.PI * 2) * 0.07,
        1.3 + (ey - 1.3) * f,
        -0.45 + (zEnd + 0.45) * f,
      ),
    );
    const w = 0.07 + 0.02 * (3 - aj);
    b.sweep(catmull(pts), {
      radius: (t: number) => [w * Math.max(Math.sin(Math.PI * Math.pow(t, 0.6)), 0.2 * (1 - t)), 0.007] as [number, number],
      bands: [[0.3, P(1)], [0.6, P(4)], [0.85, P(7)], [1, P(9)]],
      bone: "tail2", up: [0, 0, 1], caps: { start: "flat", end: "point" }, sides: 6, name: "tailRibbon",
    });
  }

  // ---- embers and sparks
  const emberColors = ["#ffd23a", "#ff9a1c", "#fff2a0", "#ff6a1a"];
  for (let i = 0; i < 60; i++) {
    const s = rand() < 0.5 ? 1 : -1;
    const x = s * (0.4 + rand() * 2.4);
    const y = 0.6 + rand() * 3.0;
    const z = -1.3 + rand() * 1.9;
    const r = 0.012 + rand() * 0.022;
    const g = rand() < 0.5 ? new THREE.OctahedronGeometry(r, 0) : new THREE.TetrahedronGeometry(r * 1.2, 0);
    b.part(g, emberColors[Math.floor(rand() * emberColors.length)], {
      at: [x, y, z], bone: "root", rotation: [rand() * 180, rand() * 180, 0], name: "ember", group: "embers",
    });
  }

  return b.root;
}
```