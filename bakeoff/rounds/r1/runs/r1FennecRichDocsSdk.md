```ts
import * as THREE from "three";
import type { OutlinePoint } from "agentic-3js-builder";
import {
  createBuilder,
  catmull,
  limb,
  paint,
  countershade,
  gradient,
  stripes,
  mottle,
  rng,
} from "agentic-3js-builder";

export const meta = {
  name: "Fennec Fox Kit on a Dune",
  description:
    "Alert fennec kit with huge peach-lined ears, gold-to-cream coat, black-tipped fluffy tail, oversized paws, woven leather collar with a brass bell, standing on a dusk sand dune.",
};

const F = 0.1; // dune top height
const GOLD = "#d9a05b";
const CREAM = "#f3e3c3";
const PEACH = "#f4bfa3";
const EAR = "#e3ad6e";
const BLACK = "#1d1512";
const BRASS = "#d4a62a";
const LEG = "#e8c78f";

export default function build() {
  const b = createBuilder({ name: "fennecKit" });
  const hips = b.joint("hips", { at: [0, 0.2, -0.12], role: "spine" });

  // ---------- dune ----------
  const sand = stripes(
    mottle("#d79a62", "#e3b07a", { size: 0.14, seed: 3 }),
    "#c88a55",
    { size: 0.08, axis: [1, 0, 0.5], width: 0.25, wobble: 0.6, seed: 2 },
  );
  const dune = b.lathe(
    [
      [0, 0],
      [0.62, 0, "sharp"],
      [0.6, 0.012],
      [0.45, 0.05],
      [0.32, 0.085],
      [0.2, 0.1],
      [0, 0.105, "sharp"],
    ],
    { at: [0, 0, 0], bone: hips, segments: 20, smoothing: 1, color: sand, name: "dune" },
  );
  const duneSurf = b.surface(dune);
  for (const h of duneSurf.scatter(7, {
    rng: rng(5),
    minDist: 0.12,
    filter: (h) => Math.hypot(h.at.x, h.at.z) > 0.24 && h.n.y > 0.7,
  })) {
    b.stick(new THREE.SphereGeometry(0.014, 5, 4), "#a77b55", h, { embed: 0.5, bone: hips, flat: true });
  }

  // ---------- spine / body ----------
  const spinePath = catmull([
    [0, 0.2, -0.12],
    [0, 0.205, -0.03],
    [0, 0.22, 0.06],
    [0, 0.26, 0.13],
    [0, 0.3, 0.17],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "chest", "neck"],
    role: "spine",
  });
  const coat = countershade(gradient("#efd9b0", GOLD, [0, 0, 0.2], [0, 0, -0.12]), CREAM, { level: -0.2 });
  const body = b.sweep(spine, [0.046, 0.06, 0.063, 0.052, 0.04], { color: coat, name: "body" });

  // chest fluff
  const bodySurf = b.surface(body);
  for (const h of bodySurf.scatter(34, {
    rng: rng(11),
    minDist: 0.025,
    filter: (h) => h.at.z > 0.06 && h.at.y < 0.27 && h.n.y < 0.5,
  })) {
    b.stick(new THREE.ConeGeometry(0.012, 0.04, 5), CREAM, h, { embed: 0.3, flat: true });
  }

  // ---------- head ----------
  const head = b.joint("head", {
    parent: spine.joints[3],
    at: [0, 0.3, 0.17],
    dir: [0, 0.08, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.02, down: 0.022 }),
    aim: head.local({ forward: 0.1, down: 0.024 }),
    role: "jaw",
  });
  b.part(new THREE.SphereGeometry(0.055, 10, 8), coat, {
    bone: head,
    at: head.local({ forward: 0.015 }),
    scale: [1, 0.88, 1],
    flat: true,
    name: "skull",
  });
  b.frustumBox(
    head.local({ forward: 0.035, down: 0.004 }),
    head.local({ forward: 0.1, down: 0.012 }),
    [0.055, 0.042],
    [0.022, 0.02],
    { bone: head, color: CREAM, name: "snoutUpper" },
  );
  b.frustumBox(
    head.local({ forward: 0.03, down: 0.03 }),
    head.local({ forward: 0.095, down: 0.028 }),
    [0.04, 0.014],
    [0.018, 0.012],
    { bone: jaw, color: CREAM, name: "snoutLower" },
  );
  b.part(new THREE.SphereGeometry(0.0095, 6, 5), BLACK, {
    bone: head,
    at: head.local({ forward: 0.105, down: 0.012 }),
    scale: [1.2, 0.9, 1],
    name: "nose",
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // eyes
    const eyeAt = head.local({ left: s * 0.034, up: 0.014, forward: 0.05 });
    b.part(new THREE.SphereGeometry(0.018, 8, 6), BLACK, {
      bone: head,
      at: eyeAt,
      scale: [0.9, 1.1, 0.9],
      name: `eye${side}`,
    });
    b.part(new THREE.SphereGeometry(0.0045, 5, 4), "#ffffff", {
      bone: head,
      at: head.local({ left: s * 0.03, up: 0.022, forward: 0.065 }),
      name: `sparkle${side}`,
    });
    // tear line
    b.rod(
      head.local({ left: s * 0.03, up: 0.002, forward: 0.065 }),
      head.local({ left: s * 0.015, up: -0.004, forward: 0.1 }),
      0.003,
      { bone: head, color: "#4a3426", sides: 4 },
    );
    // whiskers
    for (let k = 0; k < 3; k++) {
      b.rod(
        head.local({ left: s * 0.018, down: 0.003, forward: 0.085 }),
        head.local({ left: s * 0.085, up: -0.01 + (k - 1) * 0.014, forward: 0.07 }),
        0.0012,
        { bone: head, color: CREAM, sides: 4 },
      );
    }
    // cheek fluff
    for (let k = 0; k < 3; k++) {
      b.spike(
        head.local({ left: s * 0.045, forward: 0.03 + k * 0.006, down: 0.004 - k * 0.012 }),
        [s * 0.5, -0.15 - k * 0.1, -0.8],
        0.045,
        0.012,
        { bone: head, color: CREAM },
      );
    }
    // ears
    const earJ = b.joint(`ear${side}`, {
      parent: head,
      at: head.local({ left: s * 0.032, up: 0.04, forward: -0.005 }),
      dir: [s * 0.3, 1, -0.1],
      role: "hinge",
    });
    const outer: OutlinePoint[] = [
      [-0.03, 0],
      [0, -0.012],
      [0.03, 0],
      [0.04, 0.05],
      [0.024, 0.11],
      [0, 0.155, "sharp"],
      [-0.024, 0.11],
      [-0.04, 0.05],
    ];
    const inner: OutlinePoint[] = outer.map((p) =>
      p.length === 3
        ? ([p[0] * 0.62, p[1] * 0.8 + 0.012, "sharp"] as OutlinePoint)
        : ([p[0] * 0.62, p[1] * 0.8 + 0.012] as OutlinePoint),
    );
    b.extrude(outer, {
      at: earJ.at,
      x: [1, 0, 0],
      y: [s * 0.3, 1, -0.1],
      thickness: 0.008,
      bevel: 0.002,
      smoothing: 1,
      color: EAR,
      bone: earJ,
      name: `earOuter${side}`,
    });
    b.extrude(inner, {
      at: earJ.local({ forward: 0.0045 }),
      x: [1, 0, 0],
      y: [s * 0.3, 1, -0.1],
      thickness: 0.008,
      smoothing: 1,
      color: PEACH,
      bone: earJ,
      name: `earInner${side}`,
    });
    for (let k = -1; k <= 1; k++) {
      b.spike(
        earJ.local({ left: s * 0.0 + k * 0.012, up: 0.012, forward: 0.008 }),
        [s * 0.15, 1, 0.3],
        0.04,
        0.007,
        { bone: earJ, color: CREAM },
      );
    }
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const py = F + 0.017;
    // front
    const fp = limb([s * 0.045, 0.205, 0.075], [s * 0.045, py, 0.09], [0.055, 0.05], [0, 0, -1]);
    const fl = b.chain(`legF${side}`, fp, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
      contact: [s * 0.045, F, 0.1],
    });
    b.sweep(fl, [0.021, 0.012], { color: LEG, name: `legF${side}` });
    paw(fl.tip ?? fl.joints[fl.joints.length - 1], s * 0.045, py, 0.09, side + "F", 1);
    // hind
    const hp = limb(
      [s * 0.05, 0.2, -0.11],
      [s * 0.05, py, -0.12],
      [0.06, 0.055, 0.04],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hl = b.chain(`legH${side}`, hp, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.05, F, -0.115],
    });
    b.sweep(hl, [0.032, 0.02, 0.012], { color: LEG, name: `legH${side}` });
    paw(hl.tip ?? hl.joints[hl.joints.length - 1], s * 0.05, py, -0.12, side + "H", 1.1);
  }

  function paw(bone: any, x: number, y: number, z: number, tag: string, k: number) {
    b.part(new THREE.SphereGeometry(0.026 * k, 8, 6), "#f2e0c0", {
      bone,
      at: [x, y, z + 0.014],
      scale: [1, 0.65, 1.35],
      flat: true,
      name: `paw${tag}`,
    });
    for (let i = -1; i <= 1; i++) {
      b.part(new THREE.SphereGeometry(0.01 * k, 5, 4), "#f2e0c0", {
        bone,
        at: [x + i * 0.015 * k, y - 0.004, z + 0.043 * k],
        flat: true,
        name: `toe${tag}${i + 1}`,
      });
      b.part(new THREE.ConeGeometry(0.003, 0.01, 4), "#5a4030", {
        bone,
        at: [x + i * 0.015 * k, y - 0.006, z + 0.056 * k],
        dir: [0, -0.3, 1],
        name: `claw${tag}${i + 1}`,
      });
    }
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.2, -0.12],
      [0, 0.17, -0.22],
      [0, 0.14, -0.31],
      [0, 0.15, -0.39],
    ]),
    { parent: hips, count: 4, role: "tail" },
  );
  const tailPaint = paint((p, n) => (p.z < -0.335 ? BLACK : n.y < -0.3 ? CREAM : GOLD));
  const tailTube = b.sweep(tail, [0.03, 0.046, 0.05, 0.04, 0.022], { color: tailPaint, name: "tailTube" });
  for (const h of b.surface(tailTube).scatter(34, { rng: rng(21), minDist: 0.03 })) {
    b.stick(new THREE.ConeGeometry(0.014, 0.05, 5), tailPaint, h, { embed: 0.3, flat: true });
  }

  // ---------- collar & bell ----------
  const loopPath = bodySurf.loop(spine.at(0.78), { lift: 0.004 });
  const weave = paint((_p, _n, s) => ((Math.floor(s[0] * 36) + Math.floor(s[1] / 30)) % 2 ? "#7a4a2a" : "#b07a4a"));
  const collar = b.sweep(loopPath, () => [0.011, 0.005], { section: "box", color: weave, name: "collar" });
  const bp = spine.at(0.78).at.clone().add(new THREE.Vector3(0, -0.05, 0.04));
  const hit = b.surface(collar).nearest(bp);
  const c = hit.moved([0, 0.016, 0]);
  b.part(new THREE.SphereGeometry(0.016, 8, 6), BRASS, { frame: c, name: "bell" });
  b.part(new THREE.TorusGeometry(0.0155, 0.0025, 4, 10), "#a87f1c", { frame: c, dir: hit.n, axis: "z", name: "bellSeam" });
  b.part(new THREE.SphereGeometry(0.004, 5, 4), BLACK, { frame: hit.moved([0, 0.031, 0]), name: "bellMouth" });

  return b.root;
}
```