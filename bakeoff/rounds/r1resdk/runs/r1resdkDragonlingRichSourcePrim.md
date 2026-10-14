```ts
import * as THREE from "three";
import { createBuilder, catmull, paint, resolve, mix, smoothstep, scales, spots } from "agentic-3js-builder";

export const meta = {
  name: "Baby Dragon with Egg",
  description:
    "A house-cat-sized teal baby dragon with a buttery belly, orange back spines, oversized amber-webbed wings and a spade-tipped tail, sitting proudly beside its broken speckled egg.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "baby-dragon", paintSize: 2048 });

  // ---------- paints ----------
  const scalePaint = scales(["#2aa198", "#30b3a7", "#25918a"], "#1c6e6a", { size: 0.016, width: 0.14, seed: 3 });
  const belly = paint((p) => mix("#f6dc94", "#eac26c", 0.5 + 0.5 * Math.sin(p.y / 0.009)));
  const torsoPaint = paint((p, n) => {
    const t = smoothstep(0.1, 0.5, n.z * 0.9 - n.y * 0.2);
    return mix(resolve(scalePaint, p, n), resolve(belly, p, n), t);
  });
  const limbPaint = paint((p, n) => {
    const t = smoothstep(-0.1, -0.5, n.y);
    return mix(resolve(scalePaint, p, n), resolve(belly, p, n), t);
  });
  const memPaint = paint((_p, _n, s) => mix("#ffd070", "#e8832a", Math.min(Math.max(s[1], 0), 1)));
  const eggPaint = spots("#f2e6c9", ["#8a5a3a", "#5b8f6a", "#c98b4a"], { size: 0.018, amount: 0.55, seed: 2 });

  const ORANGE = "#f59a3d";
  const CREAM = "#fff3d2";

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0, 0] });
  b.joint("hips", { parent: "root", at: [0, 0.09, -0.06], dir: [0, 1, 0] });

  const spine = b.chain("spine", catmull([[0, 0.09, -0.06], [0, 0.18, -0.04], [0, 0.26, 0]]), {
    parent: "hips",
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  b.sweep(spine, (t: number) => 0.088 - 0.02 * t + 0.01 * Math.sin(Math.PI * t), {
    color: torsoPaint,
    caps: "round",
    sides: 10,
  });

  const neck = b.chain("neck", [[0, 0.26, 0], [0, 0.335, 0.045]], {
    parent: "chest",
    names: ["neck", "head"],
    role: "neck",
  });
  b.sweep(neck, [0.05, 0.042], { color: torsoPaint, caps: "round", sides: 8 });

  b.joint("jaw", { parent: "head", at: [0, 0.345, 0.09], dir: [0, 0, 1], role: "jaw" });

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(0.072, 10, 8), scalePaint, { at: [0, 0.385, 0.07], scale: [1.05, 0.95, 1.0], bone: "head" });
  b.part(new THREE.SphereGeometry(1, 8, 6), scalePaint, { at: [0, 0.372, 0.13], scale: [0.042, 0.025, 0.058], bone: "head" });
  b.part(new THREE.SphereGeometry(1, 8, 6), "#f2d58a", { at: [0, 0.332, 0.125], scale: [0.036, 0.013, 0.052], bone: "jaw", name: "lowerJaw" });
  b.part(new THREE.BoxGeometry(0.05, 0.004, 0.07), "#7a2230", { at: [0, 0.346, 0.125], bone: "head", name: "mouthInside" });

  // teeth
  for (const x of [-0.02, 0.02])
    for (const z of [0.118, 0.145, 0.168]) {
      b.part(new THREE.ConeGeometry(0.0042, 0.011, 4), CREAM, { at: [x, 0.3475, z], rotation: [180, 0, 0], bone: "head" });
    }
  for (const x of [-0.011, 0.011])
    for (const z of [0.125, 0.15]) {
      b.part(new THREE.ConeGeometry(0.0038, 0.009, 4), CREAM, { at: [x * 1.9, 0.3505, z], bone: "jaw" });
    }

  // eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.027, 10, 8), "#ffb62e", { at: [0.05 * s, 0.405, 0.112], bone: "head", name: s > 0 ? "eyeL" : "eyeR" });
    b.part(new THREE.SphereGeometry(0.012, 8, 6), "#2a1408", { at: [0.054 * s, 0.405, 0.136], scale: [0.6, 1.35, 0.5], bone: "head" });
    b.part(new THREE.SphereGeometry(0.006, 6, 5), "#ffffff", { at: [0.057 * s, 0.414, 0.14], bone: "head" });
    // nostril
    b.part(new THREE.SphereGeometry(0.005, 6, 5), "#1f3b3a", { at: [0.014 * s, 0.382, 0.18], bone: "head" });
    // horn
    const d = new THREE.Vector3(0.3 * s, 0.7, -0.55).normalize();
    const base = new THREE.Vector3(0.035 * s, 0.438, 0.045);
    b.part(new THREE.ConeGeometry(0.017, 0.07, 6), CREAM, {
      at: base.clone().addScaledVector(d, 0.03),
      dir: d,
      bone: "head",
      name: s > 0 ? "hornL" : "hornR",
    });
    // brow
    b.part(new THREE.SphereGeometry(1, 6, 5), "#1f8077", { at: [0.05 * s, 0.428, 0.118], scale: [0.026, 0.008, 0.02], rotation: [0, 0, -15 * s], bone: "head" });
  }

  // smoke wisp from left nostril
  for (let i = 0; i < 7; i++) {
    const a = i * 0.95;
    b.part(new THREE.SphereGeometry(1, 6, 5), i % 2 ? "#e6eaec" : "#cfd5d8", {
      at: [0.016 + 0.022 * Math.sin(a) * (0.5 + i * 0.15), 0.395 + 0.028 * i, 0.188 + 0.01 * i + 0.012 * Math.cos(a)],
      scale: 0.006 + 0.0035 * i,
      bone: "head",
      name: "smoke",
    });
  }

  // ---------- limbs ----------
  const legFor = (s: number) => {
    const S = s > 0 ? "L" : "R";
    const p = (x: number, y: number, z: number) => [x * s, y, z];
    const leg = b.chain(`leg${S}`, catmull([p(0.08, 0.1, -0.04), p(0.1, 0.07, 0.05), p(0.085, 0.035, 0.0), p(0.085, 0.02, 0.05)]), {
      parent: "hips",
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
    });
    b.sweep(leg, [0.05, 0.04, 0.025, 0.02], { color: limbPaint, caps: "round", sides: 8 });
    b.part(new THREE.SphereGeometry(1, 8, 6), "#23867c", { at: [0.085 * s, 0.014, 0.05], scale: [0.03, 0.014, 0.04], bone: `foot${S}` });
    for (const dx of [-0.02, 0, 0.02]) {
      b.part(new THREE.SphereGeometry(0.011, 6, 5), "#23867c", { at: [(0.085 + dx) * s, 0.012, 0.084], bone: `foot${S}` });
      b.part(new THREE.ConeGeometry(0.0055, 0.018, 5), CREAM, { at: [(0.085 + dx) * s, 0.012, 0.102], dir: [0, 0, 1], bone: `foot${S}` });
    }
  };
  const armFor = (s: number) => {
    const S = s > 0 ? "L" : "R";
    const p = (x: number, y: number, z: number) => [x * s, y, z];
    const arm = b.chain(`arm${S}`, catmull([p(0.075, 0.235, 0.02), p(0.105, 0.17, 0.035), p(0.09, 0.095, 0.095), p(0.085, 0.035, 0.12)]), {
      parent: "chest",
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.032, 0.024, 0.02, 0.018], { color: limbPaint, caps: "round", sides: 8 });
    b.part(new THREE.SphereGeometry(0.022, 8, 6), "#23867c", { at: [0.085 * s, 0.03, 0.125], bone: `hand${S}` });
    for (const dx of [-0.016, 0, 0.016])
      b.part(new THREE.ConeGeometry(0.005, 0.02, 5), CREAM, { at: [(0.085 + dx) * s, 0.022, 0.15], dir: [0, -0.1, 1], bone: `hand${S}` });
  };
  legFor(1);
  legFor(-1);
  armFor(1);
  armFor(-1);

  // ---------- wings ----------
  const wingFor = (s: number) => {
    const S = s > 0 ? "L" : "R";
    const p = (x: number, y: number, z: number) => [x * s, y, z];
    const wrist = p(0.26, 0.42, -0.12);
    const arm = b.chain(`wingArm${S}`, catmull([p(0.05, 0.255, -0.05), p(0.15, 0.335, -0.1), wrist]), {
      parent: "chest",
      names: [`wingShoulder${S}`, `wingElbow${S}`, `wingWrist${S}`],
      role: "wing",
    });
    b.sweep(arm, [0.022, 0.015, 0.011], { color: scalePaint, caps: "round", sides: 6 });
    b.part(new THREE.ConeGeometry(0.008, 0.035, 5), CREAM, { at: [0.26 * s, 0.44, -0.1], dir: [0.2 * s, 1, 0.5], bone: `wingWrist${S}` });
    const tips = [p(0.43, 0.52, -0.17), p(0.46, 0.32, -0.18), p(0.34, 0.11, -0.14)];
    const fingers = tips.map((t, i) =>
      b.chain(`wingFinger${i + 1}${S}`, [wrist, t], {
        parent: `wingWrist${S}`,
        names: [`wingF${i + 1}${S}`],
        role: "digit",
      }),
    );
    fingers.forEach((f, i) => {
      b.sweep(f, [0.009, 0.0035], { color: "#2a9d92", caps: "round", sides: 5 });
      const t = tips[i];
      b.part(new THREE.ConeGeometry(0.005, 0.02, 5), CREAM, { at: [t[0] + 0.004 * s, t[1], t[2]], dir: [t[0] - wrist[0], t[1] - wrist[1], t[2] - wrist[2]], bone: `wingF${i + 1}${S}` });
    });
    const opt = { color: memPaint, thickness: 0.003, scallop: 0.1, rows: 3, cols: 6 };
    b.membrane(fingers[0], fingers[1], opt);
    b.membrane(fingers[1], fingers[2], opt);
    b.membrane(fingers[2], [wrist, p(0.07, 0.14, -0.09)], opt);
    b.membrane([wrist, p(0.06, 0.24, -0.06)], [wrist, p(0.07, 0.14, -0.09)], { ...opt, scallop: 0, bone: `wingElbow${S}` });
  };
  wingFor(1);
  wingFor(-1);

  // ---------- tail ----------
  const tail = b.chain("tail", catmull([[0, 0.07, -0.11], [0, 0.05, -0.2], [0.03, 0.035, -0.29], [0.09, 0.03, -0.35], [0.16, 0.028, -0.36]]), {
    parent: "hips",
    names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
    role: "tail",
  });
  b.sweep(tail, [0.055, 0.045, 0.032, 0.024, 0.018], { color: limbPaint, caps: "round", sides: 8 });
  b.extrude(
    [[0.008, 0], [0.036, 0.03], [0.03, 0.06], [0, 0.095], [-0.03, 0.06], [-0.036, 0.03], [-0.008, 0]],
    { color: ORANGE, at: [0.15, 0.024, -0.358], x: [0, 0, -1], y: [1, 0, -0.1], thickness: 0.014, bevel: 0.003, bone: "tail5", name: "spade" },
  );

  // ---------- back spines ----------
  const spines: Array<[number, number, number, number]> = [
    [0, 0.315, -0.022, 0.8],
    [0, 0.255, -0.068, 1.1],
    [0, 0.2, -0.108, 1.3],
    [0, 0.145, -0.13, 1.25],
    [0, 0.1, -0.15, 1.1],
    [0, 0.095, -0.19, 1.0],
    [0.0, 0.075, -0.265, 0.85],
    [0.045, 0.058, -0.325, 0.7],
  ];
  for (const [x, y, z, k] of spines) {
    const d = new THREE.Vector3(0, 0.85, -0.5).normalize();
    const base = new THREE.Vector3(x, y, z).addScaledVector(d, -0.006);
    b.part(new THREE.ConeGeometry(0.011 * k, 0.045 * k, 6), ORANGE, { at: base.addScaledVector(d, 0.0225 * k), dir: d, name: "spine" });
  }

  // ---------- egg ----------
  b.joint("eggRoot", { parent: "root", at: [-0.22, 0, 0.1] });
  b.lathe(
    [[0, 0], [0.04, 0.004], [0.066, 0.025], [0.075, 0.055], [0.07, 0.085], [0.056, 0.112, "sharp"], [0.047, 0.108], [0.058, 0.085], [0.063, 0.055], [0.055, 0.03], [0.034, 0.014], [0, 0.014]],
    { color: eggPaint, at: [-0.22, 0, 0.1], segments: 12, bone: "eggRoot", name: "eggShell" },
  );
  const r = (() => {
    let s = 7;
    return () => ((s = (s * 16807) % 2147483647) / 2147483647);
  })();
  const jag = 8;
  for (let i = 0; i < jag; i++) {
    const a = (i / jag) * Math.PI * 2;
    const h = 0.022 + 0.03 * r();
    b.part(new THREE.ConeGeometry(0.014, h, 3), eggPaint, {
      at: [-0.22 + 0.0525 * Math.sin(a), 0.105 + h / 2 - 0.004, 0.1 + 0.0525 * Math.cos(a)],
      scale: [1, 1, 0.22],
      rotation: [0, (a * 180) / Math.PI, 0],
      bone: "eggRoot",
      name: "shellTooth",
    });
  }
  b.part(new THREE.BoxGeometry(0.05, 0.006, 0.035), eggPaint, { at: [-0.3, 0.004, 0.2], rotation: [4, 30, 6], bone: "eggRoot", name: "shard" });
  b.part(new THREE.BoxGeometry(0.04, 0.006, 0.03), eggPaint, { at: [-0.12, 0.004, 0.2], rotation: [-3, -40, 5], bone: "eggRoot", name: "shard" });
  b.part(new THREE.BoxGeometry(0.07, 0.006, 0.05), eggPaint, { at: [-0.31, 0.04, 0.05], rotation: [0, 20, -55], bone: "eggRoot", name: "shard" });

  return b.root;
}
```